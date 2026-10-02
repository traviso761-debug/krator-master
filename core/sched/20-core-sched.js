// ================================================================= CORE — schedules: motion and events as functions of time
// Everything here is a pure function of a clock t (seconds) and plain-data parameters, so a life layer or an
// effect driven by it plays back identically wherever it is evaluated: the three.js page, a test, or the Godot
// port (port the few lines, or export the records and evaluate them there). The patterns (timetabled lifters,
// formations in the leader's frame, a queued approach, geyser eruptions) are listed in TODO.md.
// No THREE, no DOM, no Math.random. One shared object, KSCHED.
//
//   KSCHED.ease.{linear, smooth, inOut, out, in}   (u in 0..1) -> 0..1
//   KSCHED.timeline({period, phase:0, segments:[{dur, from, to, ease:'smooth'|fn, name}, ...]})
//        a repeating timetable. Segments run back to back; a segment without `to` holds `from` (a stop).
//        Values may be numbers or arrays of numbers (positions), lerped per element. If the segments are
//        shorter than the period the last value holds for the rest of it.
//        T.at(t) -> {value, seg (index), name, u (0..1 through the segment), cycle}
//        T.export() -> the record as plain data
//   KSCHED.slots(n, period, minGap) -> n phases spread over the period, each at least minGap from the next:
//        conflicts resolved offline, so nothing has to avoid anything at run time. Throws if they cannot fit.
//   KSCHED.eruption({interval, duration, phase:0, rise:3, fade:6, tail:.15, pre:50, preAmp:.2, after:40})
//        a geyser's (or any periodic event's) strength: up over `rise` s, held, dying over the last `fade` s to
//        `tail`; splashing for `pre` s before it; a cloud that lingers `after` s.
//        E.at(t) -> {amp (0..1), cloud (0..1), on (bool), next (s until the next start)}
//   KSCHED.formation(leader:[x,y,z], heading (radians from +x toward +z), offsets:[[side, back, up], ...])
//        -> world positions: side is to the leader's right, back is behind it
//   KSCHED.approach({from, power:1.6, lateral:[x,y], align:.1}) -> A.at(u) for u 0..1 through the approach:
//        {dist (closing as from*(1-u)^power, so it slows as it arrives), lateral ([x,y] merging into the lane),
//        align (0..1: turning to match the berth, in the last `align` of the approach)}
(function(root){
  'use strict';
  var ease={
    linear:function(u){return u;},
    smooth:function(u){return u*u*(3-2*u);},
    inOut:function(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;},
    out:function(u){return 1-(1-u)*(1-u);},
    'in':function(u){return u*u;}
  };
  function clamp01(u){return u<0?0:u>1?1:u;}
  function lerp(a,b,u){
    if(typeof a==='number')return a+(b-a)*u;
    var o=new Array(a.length);for(var i=0;i<a.length;i++)o[i]=a[i]+(b[i]-a[i])*u;return o;
  }
  function easeOf(e){if(typeof e==='function')return e;var f=ease[e||'smooth'];if(!f)throw new Error('KSCHED: unknown ease '+e);return f;}
  function mod(t,p){return ((t%p)+p)%p;}

  function timeline(o){
    var segs=o.segments||[],period=o.period,phase=o.phase||0,starts=[],sum=0;
    if(!segs.length)throw new Error('KSCHED.timeline: no segments');
    segs.forEach(function(s){if(!(s.dur>0))throw new Error('KSCHED.timeline: every segment needs dur > 0');starts.push(sum);sum+=s.dur;});
    if(period===undefined)period=sum;
    if(sum>period+1e-9)throw new Error('KSCHED.timeline: segments ('+sum+' s) are longer than the period ('+period+' s)');
    function at(t){
      var tt=t+phase,c=Math.floor(tt/period),l=mod(tt,period);
      for(var i=segs.length-1;i>=0;i--)if(l>=starts[i])break;
      var s=segs[i],u=clamp01((l-starts[i])/s.dur),to=s.to===undefined?s.from:s.to;
      if(l>=sum){u=1;}                                                // past the last segment: hold its end
      return {value:lerp(s.from,to,easeOf(s.ease)(u)),seg:i,name:s.name||'',u:u,cycle:c};
    }
    function exp(){return {period:period,phase:phase,segments:segs.map(function(s){
      return {dur:s.dur,from:s.from,to:s.to===undefined?s.from:s.to,ease:typeof s.ease==='function'?'custom':(s.ease||'smooth'),name:s.name||''};})};}
    return {at:at,export:exp,period:period};
  }

  function slots(n,period,minGap){
    if(n*minGap>period+1e-9)throw new Error('KSCHED.slots: '+n+' slots of '+minGap+' s do not fit in '+period+' s');
    var out=[];for(var i=0;i<n;i++)out.push(i*period/n);return out;
  }

  function eruption(o){
    var I=o.interval,D=o.duration,PH=o.phase||0,rise=o.rise===undefined?3:o.rise,fade=o.fade===undefined?6:o.fade;
    var tail=o.tail===undefined?.15:o.tail,pre=o.pre===undefined?50:o.pre,preAmp=o.preAmp===undefined?.2:o.preAmp,after=o.after===undefined?40:o.after;
    if(!(I>0)||!(D>0)||D>I)throw new Error('KSCHED.eruption: need 0 < duration <= interval');
    function at(t){
      var tt=mod(t+PH,I),amp=0,cloud=0,on=tt<D;
      if(on){amp=Math.min(1,tt/rise)*(1-Math.max(0,(tt-(D-fade))/fade)*(1-tail));cloud=Math.min(1,tt/(rise+1));}
      else{cloud=Math.max(0,1-(tt-D)/after);var before=I-tt;
        if(before<pre)amp=preAmp*(1-before/pre)*(.5+.5*Math.sin(t*2.3));}       // splashing before it goes
      return {amp:amp,cloud:cloud,on:on,next:I-tt};
    }
    return {at:at,export:function(){return {interval:I,duration:D,phase:PH,rise:rise,fade:fade,tail:tail,pre:pre,preAmp:preAmp,after:after};}};
  }

  function formation(leader,heading,offsets){
    var fx=Math.cos(heading),fz=Math.sin(heading),rx=-fz,rz=fx;        // forward, and right (y up, z south)
    return offsets.map(function(o){var s=o[0],b=o[1],u=o[2]||0;
      return [leader[0]+rx*s-fx*b,leader[1]+u,leader[2]+rz*s-fz*b];});
  }

  function approach(o){
    var from=o.from,pw=o.power===undefined?1.6:o.power,lat=o.lateral||[0,0],al=o.align===undefined?.1:o.align;
    return {at:function(u){u=clamp01(u);var k=Math.pow(1-u,pw),m=1-ease.smooth(clamp01(u/(1-al)));
      return {dist:from*k,lateral:[lat[0]*m,lat[1]*m],align:al>0?ease.smooth(clamp01((u-(1-al))/al)):1};}};
  }

  root.KSCHED={ease:ease,timeline:timeline,slots:slots,eruption:eruption,formation:formation,approach:approach};
})(typeof window!=='undefined'?window:globalThis);
