// ================================================================= CORE — macrotidal submergence, drawdown & reversing races  [G data]
// Macrotidal estuaries, pontoon harbours, careening ghats and Ghost-Tsunami coasts (settlements/floating-city, Suudme-Kuluuna,
// Crookshore, Double Delta, Arch) need two water behaviours neither 21-core-hazard-flow.js (fixed-point pull) nor
// 22-core-hazard-env.js (1D gorge flood pulse) expresses:
//   1. 2D basin-wide tidal submergence & pre-bore Ghost-Tsunami drawdown (`stateFn: 'KHAZ.tide'`): low-tide ghats and slipways
//      are dry and walkable at ebb (`k = 0`), give an early warning (`state: 'drawdown' | 'incoming', warn: true`) before water
//      overtops them or when an orphan tsunami draws the sea down, and scale `drown` smoothly by live water depth over the feet;
//   2. Reversing tidal races & sector-lock sluices (`stateFn: 'KHAZ.race'`): channel rips that pull along `+axis` on flood,
//      drop to safe `state: 'slack'` (`k = 0`) at tide turn so vessels and divers pass, and reverse to `-axis` on ebb.
// Opt-in: needs 20-core-hazard.js (KHAZ) loaded first; composes with 21-core-hazard-flow.js (`moveAt` / `drift` directional
// flood/ebb vector) and 22-core-hazard-env.js. Uses existing VOCAB.hazardKinds (`drown`, `grab`, `slip`), touching zero shared
// files. Pure [G data]: no THREE, no DOM. Axes: y up, metres, x east, z south; t in seconds.
(function(root){
  'use strict';
  var H=root.KHAZ;
  if(!H)throw new Error('core/hazard 23-core-hazard-tide.js: load 20-core-hazard.js first (KHAZ)');
  if(H.TIDE)return;

  var TIDES={},CUR_Y=null;
  var TIDE_KEYS=['basin','full','warnRate','warnLead','drawdownY'];
  var RACE_KEYS=['basin','axis','vMax','slackV','vyScale'];

  function d(v,x){return v==null?x:v;}
  function copy(o){if(o==null||typeof o!=='object')return o;if(Array.isArray(o))return o.map(copy);var c={};for(var k in o)c[k]=copy(o[k]);return c;}
  function sm(a,b,x){if(!(b>a))return x<a?0:1;var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  function fall(kind,f){if(kind==='none')return 1;if(kind==='linear')return 1-f;var k=Math.max(0,Math.min(1,f));return 1-k*k*(3-2*k);}
  function bad(id,m){throw new Error('KHAZ: '+id+': '+m);}
  function fin(v,w,id){if(typeof v!=='number'||!isFinite(v))bad(id,w+' must be a finite number');return v;}
  function only(o,keys,what,id){if(!o||typeof o!=='object'||Array.isArray(o))bad(id,what+' is an object');
    for(var k in o)if(keys.indexOf(k)<0)bad(id,'unknown field '+what+'.'+k+' (one of '+keys.join(', ')+')');}
  function rawOf(rec){var t=rec&&rec.tags;return t&&t.hazard||null;}
  function hasTide(h){return !!(h&&typeof h==='object'&&(h.tide!=null||h.race!=null||h.stateFn==='KHAZ.tide'||h.stateFn==='KHAZ.race'));}

  function bindTide(basin,fn){
    if(typeof basin!=='string'||!basin)throw new Error('KHAZ.bindTide: basin must be a non-empty string');
    if(fn==null){delete TIDES[basin];return null;}
    if(typeof fn!=='function')throw new Error('KHAZ.bindTide: fn(t) must be a function');
    TIDES[basin]=fn;return fn;}

  function tideSample(basin,t){
    var fn=TIDES[basin];
    if(!fn)throw new Error('KHAZ: tidal basin "'+basin+'" is not bound (call KHAZ.bindTide("'+basin+'", fn))');
    var s=fn(t);
    if(typeof s==='number'){
      if(!isFinite(s))throw new Error('KHAZ.tideSample: non-finite level for basin "'+basin+'"');
      var y1=fn(t+1),y0=fn(t-1),vy=(typeof y1==='number'&&typeof y0==='number')?(y1-y0)/2:0;
      return {y:s,vy:vy,vRace:null,drawdown:false};}
    if(!s||typeof s!=='object'||typeof s.y!=='number'||!isFinite(s.y))
      throw new Error('KHAZ.tideSample: fn(t) for "'+basin+'" must return a finite y or {y, vy?, vRace?, drawdown?}');
    var vy2=s.vy;
    if(vy2==null){var a=fn(t+1),b=fn(t-1);vy2=(a&&b&&typeof a.y==='number'&&typeof b.y==='number')?(a.y-b.y)/2:0;}
    return {y:s.y,vy:fin(vy2,'vy',basin),vRace:s.vRace==null?null:fin(s.vRace,'vRace',basin),drawdown:!!s.drawdown};}

  function tideV(td,id){
    only(td,TIDE_KEYS,'tide',id);
    if(typeof td.basin!=='string'||!td.basin)bad(id,'tide.basin must be a non-empty string');
    var full=fin(d(td.full,1.4),'tide.full',id),wr=fin(d(td.warnRate,0.0002),'tide.warnRate',id),wl=fin(d(td.warnLead,600),'tide.warnLead',id);
    if(!(full>0))bad(id,'tide.full must be above 0 (m)');
    if(wr<0||wl<0)bad(id,'tide.warnRate and tide.warnLead must be 0 or more');
    var dy=td.drawdownY==null?null:fin(td.drawdownY,'tide.drawdownY',id);
    return {basin:td.basin,full:full,warnRate:wr,warnLead:wl,drawdownY:dy};}

  function raceV(rc,id){
    only(rc,RACE_KEYS,'race',id);
    if(typeof rc.basin!=='string'||!rc.basin)bad(id,'race.basin must be a non-empty string');
    var ax=rc.axis;
    if(!Array.isArray(ax)||ax.length!==2||typeof ax[0]!=='number'||typeof ax[1]!=='number'||!isFinite(ax[0])||!isFinite(ax[1]))
      bad(id,'race.axis must be [ux, uz]');
    var L=Math.hypot(ax[0],ax[1]);if(!(L>1e-9))bad(id,'race.axis cannot be zero');
    var vm=fin(d(rc.vMax,4.5),'race.vMax',id),sv=fin(d(rc.slackV,0.35),'race.slackV',id),vs=fin(d(rc.vyScale,1500),'race.vyScale',id);
    if(!(sv>=0&&vm>sv))bad(id,'race.vMax must exceed race.slackV >= 0 (m/s)');
    if(!(vs>0))bad(id,'race.vyScale must be above 0');
    return {basin:rc.basin,axis:[ax[0]/L,ax[1]/L],vMax:vm,slackV:sv,vyScale:vs};}

  function validate(h,id){
    var o={};
    if(h.stateFn==='KHAZ.tide'&&h.tide==null)bad(id,'stateFn KHAZ.tide needs tags.hazard.tide');
    if(h.stateFn==='KHAZ.race'&&h.race==null)bad(id,'stateFn KHAZ.race needs tags.hazard.race');
    if(h.tide!=null)o.tide=tideV(h.tide,id);
    if(h.race!=null)o.race=raceV(h.race,id);
    return o;}

  var of0=H.of,make0=H.make,exp0=H.export,state0=H.state;
  var at0=H.at,dose0=H.dose,doses0=H.doses,here0=H.here,exposure0=H.exposure,time0=H.time,timeScale0=H.timeScale,moveAt0=H.moveAt,drift0=H.drift;

  function fieldsOf(rec){var raw=rawOf(rec);return validate(raw,rec&&rec.id!=null?rec.id:'record');}
  function attach(h,f){var c=copy(h);for(var k in f)c[k]=copy(f[k]);return c;}

  H.STATES['KHAZ.tide']=function(rec,h,t){
    var td=fieldsOf(rec).tide,S=tideSample(td.basin,t);
    var isDraw=S.drawdown||(td.drawdownY!=null&&S.y<=td.drawdownY);
    var refY=CUR_Y==null?rec.at[1]:CUR_Y,sub=S.y-refY;
    if(sub>0){
      var k=sm(0,td.full,sub);
      var st=S.vy>td.warnRate?'flooding':S.vy<-td.warnRate?'ebbing':'submerged';
      return {state:st,k:k,on:k>0,level:S.y,depth:sub,vy:S.vy};}
    if(isDraw)return {state:'drawdown',k:0,on:false,warn:true,above:CUR_Y!=null,level:S.y,vy:S.vy};
    if(S.vy>td.warnRate&&S.y+S.vy*td.warnLead>refY)
      return {state:'incoming',k:0,on:false,warn:true,above:CUR_Y!=null,level:S.y,vy:S.vy};
    return {state:'dry',k:0,on:false,above:CUR_Y!=null,level:S.y,vy:S.vy};};

  function raceCalc(rec,t,y){
    var rc=fieldsOf(rec).race,S=tideSample(rc.basin,t);
    var v=S.vRace!=null?S.vRace:S.vy*rc.vyScale,vm=Math.abs(v);
    if(y!=null&&y>S.y)return {rc:rc,S:S,v:v,k:0,above:true,state:'above'};
    if(vm<=rc.slackV)return {rc:rc,S:S,v:v,k:0,above:false,state:'slack'};
    var k=sm(rc.slackV,rc.vMax,vm);
    return {rc:rc,S:S,v:v,k:k,above:false,state:v>0?'flood-race':'ebb-race'};}

  H.STATES['KHAZ.race']=function(rec,h,t){
    var R=raceCalc(rec,t,CUR_Y);
    var o={state:R.state,k:R.k,on:R.k>0,level:R.S.y,v:R.v};
    if(R.above)o.above=true;
    return o;};

  function wy(y,f,a){var o=CUR_Y;CUR_Y=y==null?null:y;try{return f.apply(null,a);}finally{CUR_Y=o;}}
  H.at=function(x,z,t,y){return wy(y,at0,arguments);};
  H.dose=function(rec,x,z,t,y){return wy(y,dose0,arguments);};
  H.doses=function(rec,x,z,t,y){return wy(y,doses0,arguments);};
  H.here=function(x,y){return wy(y,here0,arguments);};
  if(time0)H.time=function(rec,x,z,t,y){return wy(y,time0,arguments);};
  if(timeScale0)H.timeScale=function(x,z,t,y){return wy(y,timeScale0,arguments);};
  H.exposure=function(T){var E=exposure0(T),st=E.step;E.step=function(x,z,t,dt,y){return wy(y,st,arguments);};return E;};
  H.state=function(rec,t,speed,x,z,y){if(y==null)return state0(rec,t,speed,x,z);return wy(y,state0,[rec,t,speed,x,z]);};

  function raceMoveAt(rec,x,z,t,y){
    var raw=rawOf(rec);
    if(!raw||raw.race==null)return moveAt0?wy(y,moveAt0,arguments):null;
    var h=of0(rec),f=H.inside(rec,x,z,y);if(f<0)return null;
    var R=raceCalc(rec,t,y);if(!(R.k>0))return {speed:1,sink:0,slip:0,pull:[0,0,0],k:0};
    var w=fall(h.falloff,f),ke=w*R.k,sp0=h.move&&h.move.speed!=null?h.move.speed:0.45;
    var vx=R.rc.axis[0]*R.v*w,vz=R.rc.axis[1]*R.v*w;
    return {speed:1-(1-sp0)*ke,sink:0,slip:0,pull:[vx,0,vz],k:ke};}

  if(moveAt0){
    H.moveAt=raceMoveAt;
    H.drift=function(x,z,t,y,T){
      var L=H.list(T),o={speed:1,sink:0,slip:0,pull:[0,0,0],by:[]};
      for(var i=0;i<L.length;i++){
        var r=L[i],raw=rawOf(r),h=of0(r);
        if(!h.move&&!(raw&&raw.race!=null))continue;
        var m=raceMoveAt(r,x,z,t,y);if(!m||!(m.k>0))continue;
        o.speed*=m.speed;o.sink+=m.sink;o.slip=Math.max(o.slip,m.slip);
        o.pull[0]+=m.pull[0];o.pull[1]+=m.pull[1];o.pull[2]+=m.pull[2];o.by.push(r.id);}
      return o;};}
  else{
    H.raceMoveAt=raceMoveAt;}

  H.of=function(rec){var h=of0(rec);if(!h||!hasTide(rawOf(rec)))return h;return attach(h,fieldsOf(rec));};
  H.make=function(h){var out=make0(h);if(hasTide(h))return attach(out,validate(h,'KHAZ.make'));return out;};
  H.export=function(T,inBox){var X=exp0(T,inBox),by={},any=false;
    H.list(T).forEach(function(r){if(hasTide(rawOf(r))){by[r.id]=r;any=true;}});
    if(any)X.records.forEach(function(o){var r=by[o.id];if(r)o.hazard=attach(o.hazard,fieldsOf(r));});return X;};

  function area(p,h){
    if(Array.isArray(p)){if(p.length<3)throw new Error('KHAZ.TIDE: a polygon needs 3 or more [dx, dz]');return {type:'poly',pts:p,h:h,edge:2};}
    if(p&&typeof p==='object'&&p.w!=null&&p.d!=null)return {type:'box',w:p.w,d:p.d,h:d(p.h,h)};
    if(!(typeof p==='number'&&p>0))throw new Error('KHAZ.TIDE: pass pts [[dx, dz]...], {w, d}, or radius > 0');
    return {type:'cyl',r:p,h:h};}
  function over(h,o,skip){if(o)for(var k in o)if(skip.indexOf(k)<0)h[k]=o[k];return h;}

  var TIDE={
    bench:function(p,o){
      o=o||{};var sh=area(p,d(o.h,16));sh.y0=d(o.y0,-4);sh.y1=d(o.y1,d(o.h,16));
      var td={basin:d(o.basin,'sound'),full:d(o.full,1.4),warnRate:d(o.warnRate,0.0002),warnLead:d(o.warnLead,600)};
      if(o.drawdownY!=null)td.drawdownY=o.drawdownY;
      return over({kind:'drown',danger:0.85,dose:0.6,falloff:'none',stateFn:'KHAZ.tide',tide:td,shape:sh,
        move:{speed:0.55,slip:0.35},nav:{travel:2,enter:4,avoid:false},
        tell:{colour:'#2a84b8',fx:'foam',sound:'chime',sign:'tide-washed stone encrusted with oysters and tide-marks'}},
        o,['basin','full','warnRate','warnLead','drawdownY','h','y0','y1']);},
    race:function(p,o){
      o=o||{};var sh=area(p,d(o.h,24));sh.y0=d(o.y0,-18);sh.y1=d(o.y1,d(o.h,12));
      var rc={basin:d(o.basin,'sound'),axis:o.axis||[1,0],vMax:d(o.vMax,4.8),slackV:d(o.slackV,0.35),vyScale:d(o.vyScale,1500)};
      return over({kind:d(o.kind,'grab'),effect:'drown',danger:0.9,dose:0.75,falloff:d(o.falloff,'smooth'),
        stateFn:'KHAZ.race',race:rc,shape:sh,move:{speed:0.4},nav:{travel:4,enter:12,avoid:false},
        tell:{colour:'#1d9ec4',fx:'eddy',sound:'roar',sign:'standing boils and reversing tidal eddies through the narrows'}},
        o,['basin','axis','vMax','slackV','vyScale','h','y0','y1']);}
  };

  H.bindTide=bindTide;H.tideSample=tideSample;H.TIDE=TIDE;
})(typeof window!=='undefined'?window:globalThis);
