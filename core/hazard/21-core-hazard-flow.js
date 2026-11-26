// ================================================================= CORE — hazards that move a walker, and gas that pools  [G data]
// The Gills' section 9 and 14 item 5 (2026-11-03): the in-breath at a throat is a `grab` whose `move` pulls a walker toward the
// throat; the out-breath's gas settles in the sumps, deadly on the floor and harmless two metres up (the Hearths' fissure
// lows the same). 20-core-hazard.js carried `move {speed, sink, slip}` on the record and nothing read it; a band's dose was
// the same from its floor to its top. This fragment reads both. Opt-in: a page that does not list it is unchanged, and on a
// page that does, a record without `move.pull` or `shape.pool` answers exactly as before.
// Needs 20-core-hazard.js (KHAZ) loaded first. No THREE, no DOM. Axes: y up, metres, x east, z south.
//
// The record (tags.hazard), two fields more:
//   move   {speed 0..1 (a walker's pace at the core: .4 is hard going), sink m/s, slip 0..1, pull m/s (toward `to`), to [dx, dy, dz]
//          (from the record's at; default [0, shape.y0, 0]: the core at the band's floor), still (.5 m: the pull eases out inside it)}
//          each scaled by the falloff at the point and the state's k now (an in-breath that is off pulls nothing)
//   shape.pool  m: the band's dose and danger fall from its floor (at y + shape.y0) to nothing `pool` m up, smoothly (a sump's CO2)
//
//   KHAZ.moveAt(rec, x, z, t, y)  null outside, or with no move; else {speed, sink, slip, pull: [vx, vy, vz] m/s, k (falloff x state)}
//   KHAZ.drift(x, z, t, y, T)     every move at a point summed: {speed (the product), sink (sum), slip (max), pull (sum), by: [ids]}
//   KHAZ.poolK(rec, y)            the pooled share at height y (1 for a record without shape.pool, or when y is not given)
//   KHAZ.at, dose, doses, here and exposure().step take the pooled share once this file is loaded (KHAZ.FLOW is true)
// Godot (core/hazard/GODOT.md, "Moving and pooling"): the walker's HazardStatus adds KHazard.drift's pull to its velocity and
// scales its pace; loose rigid bodies take the Area3D's gravity point; the pooled share is a vertical ramp in KHazard.dose.
(function(root){
  'use strict';
  var H=root.KHAZ;
  if(!H)throw new Error('core/hazard 21-core-hazard-flow.js: load 20-core-hazard.js first (KHAZ)');
  if(H.FLOW)return;
  function d(v,x){return v==null?x:v;}
  function fall(kind,f){if(kind==='none')return 1;if(kind==='linear')return 1-f;var k=Math.max(0,Math.min(1,f));return 1-k*k*(3-2*k);}
  function ss(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  function fin(v,w){if(typeof v!=='number'||!isFinite(v))throw new Error('KHAZ: '+w+' must be a finite number');return v;}
  /* the checks make() does not do for these fields: a bad value throws at first read, naming the record */
  function moveOf(rec,h){var m=h.move;if(!m)return null;
    var sp=fin(d(m.speed,1),'move.speed'),sk=fin(d(m.sink,0),'move.sink'),sl=fin(d(m.slip,0),'move.slip'),pl=fin(d(m.pull,0),'move.pull'),st=fin(d(m.still,.5),'move.still');
    if(sp<0||sp>1||sl<0||sl>1)throw new Error('KHAZ: '+rec.id+': move.speed and move.slip are 0..1');if(pl<0||st<0)throw new Error('KHAZ: '+rec.id+': move.pull and move.still are 0 or more');
    if(m.to!=null&&!(Array.isArray(m.to)&&m.to.length===3&&m.to.every(function(v){return typeof v==='number'&&isFinite(v);})))throw new Error('KHAZ: '+rec.id+': move.to is [dx, dy, dz]');
    return {speed:sp,sink:sk,slip:sl,pull:pl,still:st,to:m.to};}
  function poolK(rec,y){var h=H.of(rec);if(!h||!h.shape||h.shape.pool==null||y==null)return 1;var p=fin(h.shape.pool,'shape.pool');if(!(p>0))throw new Error('KHAZ: '+rec.id+': shape.pool must be above 0');
    var floor=rec.at[1]+d(h.shape.y0,0);return 1-ss(0,p,y-floor);}
  function moveAt(rec,x,z,t,y){var h=H.of(rec);if(!h)return null;var M=moveOf(rec,h);if(!M)return null;var f=H.inside(rec,x,z,y);if(f<0)return null;
    var k=fall(h.falloff,f)*H.state(rec,t,null,x,z).k*poolK(rec,y),out={speed:1-(1-M.speed)*k,sink:M.sink*k,slip:M.slip*k,pull:[0,0,0],k:k};
    if(M.pull>0&&k>0){var to=M.to||[0,d(h.shape&&h.shape.y0,0),0],tx=rec.at[0]+to[0]-x,ty=y==null?0:rec.at[1]+to[1]-y,tz=rec.at[2]+to[2]-z,L=Math.sqrt(tx*tx+ty*ty+tz*tz);
      if(L>1e-9){var v=M.pull*k*(M.still>0?ss(0,M.still,L):1)/L;out.pull=[tx*v,ty*v,tz*v];}}
    return out;}
  function drift(x,z,t,y,T){var L=H.list(T),o={speed:1,sink:0,slip:0,pull:[0,0,0],by:[]};
    for(var i=0;i<L.length;i++){var r=L[i],h=H.of(r);if(!h.move)continue;var m=moveAt(r,x,z,t,y);if(!m||!(m.k>0))continue;
      o.speed*=m.speed;o.sink+=m.sink;o.slip=Math.max(o.slip,m.slip);o.pull[0]+=m.pull[0];o.pull[1]+=m.pull[1];o.pull[2]+=m.pull[2];o.by.push(r.id);}
    return o;}
  /* the pooled share on the queries: only a hit whose record has shape.pool moves; its danger x k order is kept by dose */
  var at0=H.at,dose0=H.dose,doses0=H.doses,here0=H.here,exposure0=H.exposure;
  function poolHits(R,y){if(y==null)return R;var out=[];
    R.forEach(function(e){var p=poolK(e.rec,y);if(p>=1){out.push(e);return;}if(!(p>0))return;var c={};for(var k in e)c[k]=e[k];c.dose=e.dose*p;c.pool=p;out.push(c);});
    out.sort(function(a,b){var pa=a.pool==null?1:a.pool,pb=b.pool==null?1:b.pool;return b.danger*b.state.k*pb-a.danger*a.state.k*pa||(a.id<b.id?-1:a.id>b.id?1:0);});return out;}
  H.at=function(x,z,t,y,T,tIns){return poolHits(at0(x,z,t,y,T,tIns),y);};
  H.dose=function(rec,x,z,t,y,tIn){return dose0(rec,x,z,t,y,tIn)*poolK(rec,y);};
  H.doses=function(rec,x,z,t,y,tIn){var o=doses0(rec,x,z,t,y,tIn),p=poolK(rec,y);if(p<1)for(var k in o)o[k]*=p;return o;};
  H.here=function(x,y,z,t,T,o){var r=here0(x,y,z,t,T,o),R=poolHits(r.records,y);if(R===r.records)return r;var D={};
    R.forEach(function(e){var ds=e.radiant?{burn:e.dose}:H.doses(e.rec,x,z,t,y,o&&o.tIns&&o.tIns[e.id]);for(var k in ds)D[k]=(D[k]||0)+ds[k];});
    r.ambient.forEach(function(a){D[a.effect]=(D[a.effect]||0)+a.dose;});r.records=R;r.doses=D;return r;};
  H.exposure=function(T){var E=exposure0(T),step=E.step;E.step=function(x,z,t,dt,y){return poolHits(step(x,z,t,dt,y),y);};return E;};
  H.moveAt=moveAt;H.drift=drift;H.poolK=poolK;H.FLOW=true;
})(typeof window!=='undefined'?window:globalThis);
