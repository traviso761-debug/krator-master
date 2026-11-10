// ================================================================= CORE — audio cues: what the game asks for by name
// A cue is a named sound ('sfx.combat.hit.metal') with several variants and how to vary them each time it plays
// (core/audio/PLAN.md section 4.1, step A3). Plain records and pure functions: no Web Audio, no DOM. Every random draw
// comes from KRAND.hash(seed, cue, play number, salt), so a seed replays the same picks in the lab and in Godot.
// Needs core/rand (KRAND). One shared object, KCUE.
//
//   KCUE.clean(rec)                 a cue with every field present and in range (records from a db are untrusted)
//   KCUE.validate(cue, clips)       problems, [] when the cue is usable (clips: catalogue records by id)
//   KCUE.state()                    a fresh play state: {n, recent, last, voices}
//   KCUE.fire(cue, st, t, seed)     one play at time t (seconds), or null while cooling down or at the voice cap.
//                                   -> {variant, clip, start, end, fx, pitch (semitones), gain (linear)}; updates st
//   KCUE.done(st)                   a voice ended (the host calls it), freeing a slot for maxVoices
//   KCUE.falloff(cue, dist)         gain for a listener dist metres away: 1 inside min, 0 beyond max
//
// A cue never plays the same variant as any of its last `noRepeat` plays (capped at variants - 1), so with two or more
// variants it never repeats back to back.
(function(root){
  var R=root.KRAND;
  var ID=/^[a-z0-9]+(\.[a-z0-9-]+)+$/;
  var BUSES=['sfx','ui','amb','voice','music'];
  var FX={vol:[0,1.5],pan:[-1,1],speed:[0.25,2],pitch:[-24,24],lowcut:[20,5000],highcut:[200,20000],q:[0,20],grit:[0,1],verb:[0,1],fadeIn:[0,30],fadeOut:[0,30]};
  function num(v,lo,hi,d){v=+v;return isFinite(v)?Math.min(hi,Math.max(lo,v)):d;}
  function pair(a,lo,hi,d){a=Array.isArray(a)?a:d;var x=num(a[0],lo,hi,d[0]),y=num(a[1],lo,hi,d[1]);return x<=y?[x,y]:[y,x];}
  function cleanFx(f){var o={};f=f||{};for(var k in FX)if(f[k]!=null&&isFinite(+f[k]))o[k]=num(f[k],FX[k][0],FX[k][1],0);if(f.reverse)o.reverse=true;return o;}
  function clean(r){
    r=r||{};
    var c={id:String(r.id||'').toLowerCase().slice(0,80),name:String(r.name||'').slice(0,80),category:String(r.category||'sfx.combat').slice(0,40),
      bus:BUSES.indexOf(r.bus)>=0?r.bus:'sfx',variants:[],pitch:pair(r.pitch,-12,12,[-1,1]),gainDb:pair(r.gainDb,-24,6,[-2,0]),
      noRepeat:Math.round(num(r.noRepeat,0,8,1)),cooldown:num(r.cooldown,0,10,0),maxVoices:Math.round(num(r.maxVoices,1,32,4)),
      priority:Math.round(num(r.priority,0,10,5)),distance:{min:num((r.distance||{}).min,0.1,100,2),max:num((r.distance||{}).max,1,500,40)},
      notes:String(r.notes||'').slice(0,1000)};
    if(c.distance.max<=c.distance.min)c.distance.max=c.distance.min+1;
    (Array.isArray(r.variants)?r.variants:[]).slice(0,32).forEach(function(v){
      v=v||{};var s=num(v.start,0,7200,0),e=num(v.end,0,7200,0);
      c.variants.push({clip:String(v.clip||'').slice(0,80),start:s,end:e>s?e:0,weight:num(v.weight,0.1,10,1),fx:cleanFx(v.fx),name:String(v.name||'').slice(0,80)});
    });
    return c;
  }
  function validate(c,clips){
    var p=[];clips=clips||{};
    if(!ID.test(c.id))p.push('id: dotted lower-case words, like sfx.combat.hit.metal');
    if(!c.variants.length)p.push('variants: a cue needs at least one');
    c.variants.forEach(function(v,i){
      var k=clips[v.clip];
      if(!k)p.push('variant '+(i+1)+': clip '+v.clip+' is not in the catalogue');
      else if(v.end&&k.duration&&v.start>=k.duration)p.push('variant '+(i+1)+': starts after the clip ends');
    });
    return p;
  }
  function idHash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h|0;}
  function state(){return{n:0,recent:[],last:-1e9,voices:0};}
  function fire(c,st,t,seed){
    var V=c.variants,len=V.length;
    if(!len)return null;
    if(t-st.last<c.cooldown)return null;
    if(st.voices>=c.maxVoices)return null;
    var h=idHash(c.id),u=function(salt){return R.unit(R.hash(seed>>>0,h,st.n,salt));};
    var avoid=Math.min(c.noRepeat,len-1),blocked=st.recent.slice(-avoid||len);
    if(!avoid)blocked=[];
    var total=0,i;
    for(i=0;i<len;i++)if(blocked.indexOf(i)<0)total+=V[i].weight;
    var r=u(1)*total,pick=-1;
    for(i=0;i<len;i++){if(blocked.indexOf(i)>=0)continue;r-=V[i].weight;if(r<0){pick=i;break;}}
    if(pick<0)for(i=len-1;i>=0;i--)if(blocked.indexOf(i)<0){pick=i;break;}
    var v=V[pick],pitch=c.pitch[0]+u(2)*(c.pitch[1]-c.pitch[0]),db=c.gainDb[0]+u(3)*(c.gainDb[1]-c.gainDb[0]);
    st.n++;st.last=t;st.voices++;st.recent.push(pick);if(st.recent.length>8)st.recent.shift();
    return{variant:pick,clip:v.clip,start:v.start,end:v.end,fx:v.fx,pitch:pitch+(v.fx.pitch||0),gain:Math.pow(10,db/20)*(v.fx.vol!=null?v.fx.vol:1)};
  }
  function done(st){if(st.voices>0)st.voices--;}
  function falloff(c,d){
    var a=c.distance.min,b=c.distance.max;
    if(!(d>a))return 1;if(d>=b)return 0;
    var inv=a/d,edge=(b-d)/(b-a);
    return inv*Math.min(1,edge*4);
  }
  root.KCUE={clean:clean,validate:validate,state:state,fire:fire,done:done,falloff:falloff,BUSES:BUSES,FX:FX};
})(typeof window!=='undefined'?window:globalThis);
