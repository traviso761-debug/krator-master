// ================================================================= CORE — tsunami inundation, bore impact, backwash & refuge  [G data]
// Coastal settlements exposed to seamount-collapse or Ghost-Tsunami wave-trains (Arch coves, Crookshore, Double Delta,
// Ring Sea harbours) need height- and momentum-flux-aware tsunami states that compose cleanly with 20-core-hazard.js,
// 21-core-hazard-flow.js (moveAt / drift directional surge & backwash pull), and 23-core-hazard-tide.js (CUR_Y height):
//   - 'calm': resting sea, k = 0, on = false;
//   - 'safe_refuge': walker or ground at/above trimlineM, k = 0, on = false, above = true;
//   - 'tremor_warn' / 'drawdown_warn': pre-inundation warning (warn = true, k = 0) during seismic lead, ocean withdrawal,
//     or ahead of the advancing bore front (s > boreS);
//   - 'bore_impact': steep breaking bore wall (boreFront > 0.25), k boosted by momentumFlux / fluxLethal;
//   - 'inundated': overland run-up submergence scaled by smoothstep(0.1, fullDepth, subDepth);
//   - 'backwash_scour': seaward scouring sheet flow boosted by momentumFlux / fluxLethal, reversing drift pull seaward.
// Uses existing VOCAB.hazardKinds ('drown', 'crush', 'grab'), touching zero shared files. Pure [G data]: no THREE, no DOM.
(function(root){
  'use strict';
  var H=root.KHAZ;
  if(!H)throw new Error('core/hazard 24-core-hazard-tsunami.js: load 20-core-hazard.js first (KHAZ)');
  if(H.TSUNAMI)return;

  var TSUNAMIS={},CUR_Y=null;
  var TS_KEYS=['key','trimlineM','fullDepth','fluxLethal'];

  function d(v,x){return v==null?x:v;}
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function copy(o){if(o==null||typeof o!=='object')return o;if(Array.isArray(o))return o.map(copy);var c={};for(var k in o)c[k]=copy(o[k]);return c;}
  function sm(a,b,x){if(!(b>a))return x<a?0:1;var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
  function fall(kind,f){if(kind==='none')return 1;if(kind==='linear')return 1-f;var k=clamp(f,0,1);return 1-k*k*(3-2*k);}
  function bad(id,m){throw new Error('KHAZ: '+id+': '+m);}
  function fin(v,w,id){if(typeof v!=='number'||!isFinite(v))bad(id,w+' must be a finite number');return v;}
  function only(o,keys,what,id){
    if(!o||typeof o!=='object'||Array.isArray(o))bad(id,what+' is an object');
    for(var k in o)if(keys.indexOf(k)<0)bad(id,'unknown field '+what+'.'+k+' (one of '+keys.join(', ')+')');
  }
  function rawOf(rec){var t=rec&&rec.tags;return t&&t.hazard||null;}
  function hasTsunami(h){return !!(h&&typeof h==='object'&&(h.tsunami!=null||h.stateFn==='KHAZ.tsunami'));}

  function bindTsunami(key,tsOrFn){
    if(typeof key!=='string'||!key)throw new Error('KHAZ.bindTsunami: key must be a non-empty string');
    if(tsOrFn==null){delete TSUNAMIS[key];return null;}
    var isObj=typeof tsOrFn==='object'&&typeof tsOrFn.sample==='function'&&typeof tsOrFn.stateAt==='function';
    if(!isObj&&typeof tsOrFn!=='function'){
      throw new Error('KHAZ.bindTsunami: pass a WATER.tsunami instance or fn(x, z, t)');
    }
    TSUNAMIS[key]=tsOrFn;
    return tsOrFn;
  }

  function tsunamiSample(key,x,z,t){
    var src=TSUNAMIS[key];
    if(!src)throw new Error('KHAZ: tsunami "'+key+'" is not bound (call KHAZ.bindTsunami("'+key+'", tsOrFn))');
    var tVal=d(t,0),qx=d(x,0),qz=d(z,0);
    if(typeof src==='object'&&typeof src.sample==='function'&&typeof src.stateAt==='function'){
      var st=src.stateAt(tVal);
      var sp=src.sample(qx,qz,tVal);
      return {
        phase:sp.phase,
        s:sp.s,
        q:sp.q,
        groundY:sp.groundY,
        level:sp.level,
        depth:sp.depth,
        wet:!!sp.wet,
        vx:d(sp.vx,0),
        vz:d(sp.vz,0),
        speed:d(sp.speed,0),
        momentumFlux:d(sp.momentumFlux,0),
        boreFront:d(sp.boreFront,0),
        foam:d(sp.foam,0),
        exposedShelf:!!sp.exposedShelf,
        safeRefuge:!!sp.safeRefuge,
        seaBaseY:d(st.seaBaseY,0),
        seaY:d(st.seaY,sp.level),
        boreS:d(st.boreS,0),
        trimlineM:src.trimlineM
      };
    }
    var r=src(qx,qz,tVal);
    if(!r||typeof r!=='object'||typeof r.phase!=='string'){
      throw new Error('KHAZ.tsunamiSample: fn(x, z, t) for "'+key+'" must return a sample object with phase');
    }
    var lvl=fin(d(r.level,d(r.seaY,0)),'level',key);
    var vx=fin(d(r.vx,0),'vx',key),vz=fin(d(r.vz,0),'vz',key);
    var spd=r.speed==null?Math.hypot(vx,vz):fin(r.speed,'speed',key);
    var dep=fin(d(r.depth,0),'depth',key);
    var flux=r.momentumFlux==null?(r.wet?dep*spd*spd:0):fin(r.momentumFlux,'momentumFlux',key);
    return {
      phase:r.phase,
      s:fin(d(r.s,0),'s',key),
      q:fin(d(r.q,0),'q',key),
      groundY:r.groundY==null?null:fin(r.groundY,'groundY',key),
      level:lvl,
      depth:dep,
      wet:!!r.wet,
      vx:vx,
      vz:vz,
      speed:spd,
      momentumFlux:flux,
      boreFront:fin(d(r.boreFront,0),'boreFront',key),
      foam:fin(d(r.foam,0),'foam',key),
      exposedShelf:!!r.exposedShelf,
      safeRefuge:!!r.safeRefuge,
      seaBaseY:fin(d(r.seaBaseY,0),'seaBaseY',key),
      seaY:fin(d(r.seaY,lvl),'seaY',key),
      boreS:fin(d(r.boreS,0),'boreS',key),
      trimlineM:r.trimlineM==null?null:fin(r.trimlineM,'trimlineM',key)
    };
  }

  function tsunamiV(ts,id){
    only(ts,TS_KEYS,'tsunami',id);
    var key=d(ts.key,'tsunami');
    if(typeof key!=='string'||!key)bad(id,'tsunami.key must be a non-empty string');
    var trim=ts.trimlineM==null?null:fin(ts.trimlineM,'tsunami.trimlineM',id);
    if(trim!=null&&!(trim>0))bad(id,'tsunami.trimlineM must be above 0 (m)');
    var full=fin(d(ts.fullDepth,1.4),'tsunami.fullDepth',id);
    if(!(full>0))bad(id,'tsunami.fullDepth must be above 0 (m)');
    var flux=fin(d(ts.fluxLethal,18.0),'tsunami.fluxLethal',id);
    if(!(flux>0))bad(id,'tsunami.fluxLethal must be above 0 (m^3/s^2)');
    return {key:key,trimlineM:trim,fullDepth:full,fluxLethal:flux};
  }

  function validate(h,id){
    var o={};
    if(h.stateFn==='KHAZ.tsunami'&&h.tsunami==null)bad(id,'stateFn KHAZ.tsunami needs tags.hazard.tsunami');
    if(h.tsunami!=null)o.tsunami=tsunamiV(h.tsunami,id);
    return o;
  }

  var of0=H.of,make0=H.make,exp0=H.export,state0=H.state;
  var at0=H.at,dose0=H.dose,doses0=H.doses,here0=H.here,exposure0=H.exposure,time0=H.time,timeScale0=H.timeScale,moveAt0=H.moveAt;

  function fieldsOf(rec){var raw=rawOf(rec);return validate(raw,rec&&rec.id!=null?rec.id:'record');}
  function attach(h,f){var c=copy(h);for(var k in f)c[k]=copy(f[k]);return c;}

  function evalAt(rec,t,x,z,yOverride){
    var ts=fieldsOf(rec).tsunami;
    var qx=x==null?rec.at[0]:x,qz=z==null?rec.at[2]:z;
    var yArg=yOverride===undefined?CUR_Y:yOverride;
    var S=tsunamiSample(ts.key,qx,qz,t);
    var trimM=ts.trimlineM!=null?ts.trimlineM:(S.trimlineM!=null?S.trimlineM:28.0);
    var trimElev=S.seaBaseY+trimM;
    var refY=yArg!=null?yArg:(S.groundY!=null?Math.max(rec.at[1],S.groundY):rec.at[1]);

    if(S.phase==='calm'){
      return {st:{state:'calm',k:0,on:false,level:S.seaY},S:S,wetHere:false};
    }
    if(refY>=trimElev||(yArg==null&&S.safeRefuge&&rec.at[1]>=(S.groundY==null?0:S.groundY))){
      return {st:{state:'safe_refuge',k:0,on:false,above:true,trimlineM:trimM,level:S.seaY},S:S,wetHere:false};
    }

    var subDepth=0,wetHere=false;
    if(yArg!=null){
      subDepth=S.wet?(S.level-yArg):0;
      wetHere=S.wet&&subDepth>0;
    }else{
      var baseY=S.groundY!=null?Math.max(rec.at[1],S.groundY):rec.at[1];
      subDepth=S.wet?Math.max(0,S.level-baseY):0;
      wetHere=S.wet&&subDepth>0;
    }

    if(!wetHere&&(S.phase==='tremor'||S.phase==='drawdown'||(S.phase==='bore'&&S.s>S.boreS))){
      var wName=S.phase==='tremor'?'tremor_warn':'drawdown_warn';
      return {st:{state:wName,k:0,on:false,warn:true,level:S.seaY,boreS:S.boreS},S:S,wetHere:false};
    }
    if(!wetHere){
      var isAbove=yArg!=null&&S.wet&&yArg>=S.level;
      return {st:{state:isAbove?'above':'dry',k:0,on:false,above:isAbove,level:S.seaY},S:S,wetHere:false};
    }

    var fluxRatio=clamp(S.momentumFlux/ts.fluxLethal,0,1);
    if(S.phase==='backwash'){
      var kSub=sm(0.08,ts.fullDepth,subDepth);
      var kBack=clamp(kSub+(1-kSub)*fluxRatio,0,1);
      return {
        st:{state:'backwash_scour',k:kBack,on:kBack>0,level:S.level,depth:subDepth,speed:S.speed,momentumFlux:S.momentumFlux},
        S:S,
        wetHere:true
      };
    }
    if(S.boreFront>0.25){
      var kBore=clamp(Math.max(sm(0.1,ts.fullDepth,subDepth),fluxRatio),0,1);
      return {
        st:{state:'bore_impact',k:kBore,on:kBore>0,level:S.level,depth:subDepth,boreFront:S.boreFront,speed:S.speed,momentumFlux:S.momentumFlux},
        S:S,
        wetHere:true
      };
    }
    var kInun=sm(0.1,ts.fullDepth,subDepth);
    return {
      st:{state:'inundated',k:kInun,on:kInun>0,level:S.level,depth:subDepth,speed:S.speed,momentumFlux:S.momentumFlux},
      S:S,
      wetHere:true
    };
  }

  H.STATES['KHAZ.tsunami']=function(rec,h,t,speed,x,z){
    return evalAt(rec,t,x,z,CUR_Y).st;
  };

  function wy(y,f,a){var o=CUR_Y;CUR_Y=y==null?null:y;try{return f.apply(null,a);}finally{CUR_Y=o;}}
  H.at=function(x,z,t,y){return wy(y,at0,arguments);};
  H.dose=function(rec,x,z,t,y){return wy(y,dose0,arguments);};
  H.doses=function(rec,x,z,t,y){return wy(y,doses0,arguments);};
  H.here=function(x,y){return wy(y,here0,arguments);};
  if(time0)H.time=function(rec,x,z,t,y){return wy(y,time0,arguments);};
  if(timeScale0)H.timeScale=function(x,z,t,y){return wy(y,timeScale0,arguments);};
  H.exposure=function(T){var E=exposure0(T),st=E.step;E.step=function(x,z,t,dt,y){return wy(y,st,arguments);};return E;};
  H.state=function(rec,t,speed,x,z,y){
    if(y==null)return state0(rec,t,speed,x,z,y);
    return wy(y,state0,[rec,t,speed,x,z,y]);
  };

  function tsunamiMoveAt(rec,x,z,t,y){
    var raw=rawOf(rec);
    if(!raw||raw.tsunami==null)return moveAt0?wy(y,moveAt0,arguments):null;
    var h=of0(rec),f=H.inside(rec,x,z,y);
    if(f<0)return null;
    var E=evalAt(rec,t,x,z,y==null?null:y);
    if(!E.wetHere||!(E.st.k>0))return {speed:1,sink:0,slip:0,pull:[0,0,0],k:0};
    var w=fall(h.falloff,f),ke=w*E.st.k;
    var sp0=h.move&&h.move.speed!=null?h.move.speed:0.35;
    var sk0=h.move&&h.move.sink!=null?h.move.sink:0;
    var sl0=h.move&&h.move.slip!=null?h.move.slip:0.45;
    var vx=E.S.vx*w,vz=E.S.vz*w;
    return {speed:1-(1-sp0)*ke,sink:sk0*ke,slip:sl0*ke,pull:[vx,0,vz],k:ke};
  }

  H.moveAt=tsunamiMoveAt;
  H.drift=function(x,z,t,y,T){
    var L=H.list(T),o={speed:1,sink:0,slip:0,pull:[0,0,0],by:[]};
    for(var i=0;i<L.length;i++){
      var r=L[i],raw=rawOf(r),h=of0(r);
      var hasMove=!!(h&&h.move)||(raw&&(raw.race!=null||raw.tsunami!=null));
      if(!hasMove)continue;
      var m=tsunamiMoveAt(r,x,z,t,y);
      if(!m||!(m.k>0))continue;
      o.speed*=m.speed;
      o.sink+=m.sink;
      o.slip=Math.max(o.slip,m.slip);
      o.pull[0]+=m.pull[0];
      o.pull[1]+=m.pull[1];
      o.pull[2]+=m.pull[2];
      o.by.push(r.id);
    }
    return o;
  };

  H.of=function(rec){var h=of0(rec);if(!h||!hasTsunami(rawOf(rec)))return h;return attach(h,fieldsOf(rec));};
  H.make=function(h){var out=make0(h);if(hasTsunami(h))return attach(out,validate(h,'KHAZ.make'));return out;};
  H.export=function(T,inBox){
    var X=exp0(T,inBox),by={},any=false;
    H.list(T).forEach(function(r){if(hasTsunami(rawOf(r))){by[r.id]=r;any=true;}});
    if(any)X.records.forEach(function(o){var r=by[o.id];if(r)o.hazard=attach(o.hazard,fieldsOf(r));});
    return X;
  };

  function area(p,h){
    if(Array.isArray(p)){
      if(p.length<3)throw new Error('KHAZ.TSUNAMI: a polygon needs 3 or more [dx, dz]');
      return {type:'poly',pts:p,h:h,edge:2};
    }
    if(p&&typeof p==='object'&&p.w!=null&&p.d!=null)return {type:'box',w:p.w,d:p.d,h:d(p.h,h)};
    if(!(typeof p==='number'&&p>0))throw new Error('KHAZ.TSUNAMI: pass pts [[dx, dz]...], {w, d}, or radius > 0');
    return {type:'cyl',r:p,h:h};
  }
  function over(h,o,skip){if(o)for(var k in o)if(skip.indexOf(k)<0)h[k]=o[k];return h;}

  var TSUNAMI={
    zone:function(ptsOrBoxOrR,o){
      o=o||{};
      var hSpan=d(o.h,48);
      var sh=area(ptsOrBoxOrR,hSpan);
      sh.y0=d(o.y0,-16);
      sh.y1=d(o.y1,hSpan);
      var kName=d(o.key,'tsunami');
      var bound=typeof kName==='string'?TSUNAMIS[kName]:null;
      var defTrim=(bound&&typeof bound==='object'&&bound.trimlineM!=null)?bound.trimlineM:28.0;
      var ts={
        key:kName,
        trimlineM:d(o.trimlineM,defTrim),
        fullDepth:d(o.fullDepth,1.4),
        fluxLethal:d(o.fluxLethal,18.0)
      };
      var raw=over({
        kind:d(o.kind,'drown'),
        effect:o.effect===undefined?'drown':o.effect,
        danger:0.95,
        dose:0.85,
        falloff:d(o.falloff,'none'),
        stateFn:'KHAZ.tsunami',
        tsunami:ts,
        shape:sh,
        move:{speed:0.35,slip:0.45},
        nav:{travel:3,enter:8,avoid:false},
        tell:{colour:'#1b7ea8',fx:'foam',sound:'roar',sign:'tsunami run-up trimline, salt-bleached wrack and refuge stairs'}
      },o,['key','trimlineM','fullDepth','fluxLethal','h','y0','y1']);
      return H.make(raw);
    }
  };

  H.bindTsunami=bindTsunami;
  H.tsunamiSample=tsunamiSample;
  H.TSUNAMI=TSUNAMI;
})(typeof globalThis!=='undefined'?globalThis:this);
