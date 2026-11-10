// ================================================================= CORE — water: a gorge flood whose water rises (WATER.flood)  [G data]
// core/water/README.md, "A gorge flood" (2026-11-09). Firebliss, midbasin, outlandgate, paintedhighlands and wouterwall want a flood that runs
// a gorge on a cycle: a front comes down the channel, the water rises behind it, holds, and falls away. The water (this file, 62b draws it) and
// the hazard (core/hazard/22-core-hazard-env.js, stateFn 'KHAZ.front') read ONE record and ONE law, written out here and there:
//
//   front: {path: [[x, y, z], ...] (the channel floor; y the bed), w (m: half-width), speed (m/s),
//           start (s, 0), period (s; null = once), rise, hold, fall (s), depth (m: the flood's peak rise), base (m: standing depth, 0)}
//   s  = arc length along path of the point's nearest point on the path (segments projected; clamped to [0, L]); q = the lateral distance
//   u  = period != null ? ((t - start) mod period, into [0, period)) : t - start
//   sm(a, b, x) = smoothstep (t = clamp((x - a) / (b - a), 0, 1), t*t*(3 - 2t)); when b <= a it is x < a ? 0 : 1
//   v  = u - s / speed;  fk = v < 0 ? 0 : v < rise ? sm(0, rise, v) : v < rise + hold ? 1 : v < rise + hold + fall ? 1 - sm(rise + hold, rise + hold + fall, v) : 0
//   level(s, t) = bed(s) + base + depth * fk, bed(s) the path's y interpolated linearly by arc length
//
// Read here as: the projection and the arc length are in PLAN (x, z), as WATER.flow's line (the point asked is (x, z)); the nearest segment
// is the first of the closest (strict <); a point past an end projects onto it (q is then the distance to the end: a round cap). The front's
// path is in world coordinates. A point is in the channel when q <= w; the water stands there while base + depth * fk > 0.
// [G data]: no THREE, no DOM, no randomness. Needs 20-core-water.js (WATER). Optional, in the SUBFOLDER core/water/ext/ (builds pool the top
// level of core/water by globbing): a build opts in by path. Nothing runs at load time but the opt-in wraps of WATER.at, heightAt and export.
//
//   WATER.flood({key, name, path, w, speed, start, period, rise, hold, fall, depth, base, world}) -> S, a surface of kind 'flood':
//     S.front           the law's record above (the path copied as [[x, y, z], ...]; start 0, base 0, period null when omitted)
//     S.project(x, z)   {s, q, i (segment), u} the point's place on the channel;  S.bedAt(s) the bed's height
//     S.levelAt(s, t)   bed(s) + base + depth * fk;  S.kAt(s, t) fk;  S.vAt(s, t) v (s since the front passed s: < 0 not yet)
//     S.level(x, z, t)  the level there, null off the channel (q > w);  S.depthAt(x, z, t) the water over the bed (null off it)
//     S.wet(x, z, t)    the channel holds water there now;  S.contains(x, z) in the channel at all (q <= w)
//     S.heightAt(x, z, t)  the level while wet, else null;  S.flowAt(x, z, t) [vx, vz, speed, slope] down the path while wet, else zeros
//     S.frontAt(t)      {u, head (m: where the front is now: u speed, clamped), crest [s, s] (where it stands full), tail (where it has gone)}
//     S.outline()       the channel's outline [[x, z], ...] (each side at w, each end capped w beyond it): the hazard's polygon
//     S.hazard(o)       the hazard body for core/hazard: {kind 'drown', effect 'drown', danger (.9), stateFn 'KHAZ.front', front (the same
//                       record), shape {type 'poly', pts (from S.hazardAt), y0, y1}, falloff 'none', seed (key)}
//     S.hazardAt        [x, y, z] the record's anchor: the path's first point;  S.hazardRecord(o) {id ('flood:' + key), at, ry 0, tags {hazard}}
//   WATER.frontK(front, s, t), WATER.frontLevel(front, s, t), WATER.frontProject(front, x, z)   the law on a bare front record (the twin a
//     port and core/hazard are held to), and WATER.floodGLSL(S): the same law as GLSL (wfK, wfV, wfLevel(s, bed, t)), checked as text.
//   WATER.at(x, z, t) answers a flood where it holds water at t and stands at or above what else is there (without t, as before);
//   WATER.heightAt(x, z, t) is the higher of the two; WATER.export() lists it with its whole record (kind 'flood').
(function(){
 if(typeof WATER==='undefined'||!WATER.surfaces)throw new Error('62-core-water-flood: load core/water/20-core-water.js first');
 const W=WATER;if(W.flood)return;   /* loaded twice: a no-op */
 const cl=(x,a,b)=>x<a?a:x>b?b:x,num=(v,d)=>v==null?d:v;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},gf=v=>v<0?'('+glf(v)+')':glf(v);
 const sm=(a,b,x)=>{if(b<=a)return x<a?0:1;const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const fmod=(x,p)=>{let u=x-p*Math.floor(x/p);if(u>=p)u-=p;return u;};
 // the path's plan arc length (cached on a hidden property of the front record)
 const geo=F=>{if(F.__geo)return F.__geo;const P=F.path,arc=[0];for(let i=1;i<P.length;i++)arc.push(arc[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][2]-P[i-1][2]));
  const G={arc,L:arc[arc.length-1]};Object.defineProperty(F,'__geo',{value:G,enumerable:false});return G;};
 W.frontProject=(F,x,z)=>{const P=F.path,A=geo(F).arc;let best=null;
  for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],ex=b[0]-a[0],ez=b[2]-a[2],L2=ex*ex+ez*ez,u=L2>0?cl(((x-a[0])*ex+(z-a[2])*ez)/L2,0,1):0,
    q=Math.hypot(x-(a[0]+ex*u),z-(a[2]+ez*u));if(!best||q<best.q)best={q,s:A[i]+u*(A[i+1]-A[i]),i,u};}
  return best;};
 W.frontBed=(F,s)=>{const P=F.path,A=geo(F).arc,L=A[A.length-1];s=cl(s,0,L);
  for(let i=0;i+1<P.length;i++){const d=A[i+1]-A[i];if(s<=A[i+1]||i+2===P.length){const u=d>0?cl((s-A[i])/d,0,1):0;return P[i][1]+(P[i+1][1]-P[i][1])*u;}}
  return P[P.length-1][1];};
 W.frontU=(F,t)=>F.period!=null?fmod(t-F.start,F.period):t-F.start;
 W.frontV=(F,s,t)=>W.frontU(F,t)-s/F.speed;
 W.frontK=(F,s,t)=>{const v=W.frontV(F,s,t),r=F.rise,h=F.hold,f=F.fall;return v<0?0:v<r?sm(0,r,v):v<r+h?1:v<r+h+f?1-sm(r+h,r+h+f,v):0;};
 W.frontLevel=(F,s,t)=>W.frontBed(F,s)+F.base+F.depth*W.frontK(F,s,t);
 const frontOf=o=>{const path=o.path;if(!Array.isArray(path)||path.length<2)throw new Error('WATER.flood: path [[x, y, z], ...] (two points or more)');
  const P=path.map(p=>{if(!p||p.length<3||!p.every(isFinite))throw new Error('WATER.flood: each path point is [x, y, z]');return[+p[0],+p[1],+p[2]];});
  const F={path:P,w:+o.w,speed:+o.speed,start:num(o.start,0),period:o.period==null?null:+o.period,rise:num(o.rise,0),hold:num(o.hold,0),fall:num(o.fall,0),depth:num(o.depth,0),base:num(o.base,0)};
  if(!(F.w>0))throw new Error('WATER.flood: w > 0 (the channel\'s half-width, m)');if(!(F.speed>0))throw new Error('WATER.flood: speed > 0 (m/s)');
  if(F.period!=null&&!(F.period>0))throw new Error('WATER.flood: period > 0, or null (once)');
  for(const k of['rise','hold','fall','depth','base'])if(!(F[k]>=0))throw new Error('WATER.flood: '+k+' >= 0');
  if(!(geo(F).L>0))throw new Error('WATER.flood: the path has no length in plan');return F;};
 W.flood=o=>{o=o||{};const F=frontOf(o),G=geo(F),key=o.key!=null?o.key:o.name!=null?o.name:'flood '+W.surfaces.length;
  const S={kind:'flood',name:o.name,key,world:num(o.world,0)>>>0,front:F,length:G.L};
  S.project=(x,z)=>W.frontProject(F,x,z);S.bedAt=s=>W.frontBed(F,s);
  S.kAt=(s,t)=>W.frontK(F,s,t);S.vAt=(s,t)=>W.frontV(F,s,t);S.levelAt=(s,t)=>W.frontLevel(F,s,t);
  S.contains=(x,z)=>S.project(x,z).q<=F.w;
  S.level=(x,z,t)=>{const p=S.project(x,z);return p.q>F.w?null:S.levelAt(p.s,t);};
  S.depthAt=(x,z,t)=>{const p=S.project(x,z);return p.q>F.w?null:F.base+F.depth*S.kAt(p.s,t);};
  S.wet=(x,z,t)=>{const d=S.depthAt(x,z,t);return d!=null&&d>0;};
  S.heightAt=(x,z,t)=>{const p=S.project(x,z);if(p.q>F.w)return null;const d=F.base+F.depth*S.kAt(p.s,t==null?0:t);return d>0?S.bedAt(p.s)+d:null;};
  S.flowAt=(x,z,t)=>{const p=S.project(x,z);if(p.q>F.w||!(F.base+F.depth*S.kAt(p.s,t==null?0:t)>0))return[0,0,0,0];
   const a=F.path[p.i],b=F.path[p.i+1],l=Math.hypot(b[0]-a[0],b[2]-a[2])||1;return[(b[0]-a[0])/l*F.speed,(b[2]-a[2])/l*F.speed,F.speed,(a[1]-b[1])/l];};
  S.frontAt=t=>{const u=W.frontU(F,t),c=v=>cl(v*F.speed,0,G.L);return{u,head:c(u),crest:[c(u-F.rise-F.hold),c(u-F.rise)],tail:c(u-F.rise-F.hold-F.fall)};};
  // the outline: each side at w (a vertex's offset along its bisector, stretched to keep the width round a bend), each end capped w beyond it
  S.outline=()=>{const P=F.path,n=P.length,dir=i=>{const a=P[i],b=P[i+1],l=Math.hypot(b[0]-a[0],b[2]-a[2])||1;return[(b[0]-a[0])/l,(b[2]-a[2])/l];},L=[],R=[];
   for(let i=0;i<n;i++){const d0=dir(Math.max(0,i-1)),d1=dir(Math.min(n-2,i));let tx=d0[0]+d1[0],tz=d0[1]+d1[1];const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
    const k=F.w/Math.max(.25,tx*d1[0]+tz*d1[1]),cap=i===0?-F.w:i===n-1?F.w:0,x=P[i][0]+tx*cap,z=P[i][2]+tz*cap;L.push([x-tz*k,z+tx*k]);R.push([x+tz*k,z-tx*k]);}
   return L.concat(R.reverse());};
  S.hazardAt=[F.path[0][0],F.path[0][1],F.path[0][2]];
  S.hazard=h=>{h=h||{};const at=S.hazardAt,ys=F.path.map(p=>p[1]);
   return{kind:'drown',effect:'drown',danger:num(h.danger,.9),stateFn:'KHAZ.front',front:frontRecord(F),
    shape:{type:'poly',pts:S.outline().map(p=>[p[0]-at[0],p[1]-at[2]]),y0:Math.min(...ys)-at[1]-.5,y1:Math.max(...ys)+F.base+F.depth-at[1]+.5},falloff:'none',seed:String(key)};};
  S.hazardRecord=h=>({id:h&&h.id!=null?h.id:'flood:'+key,at:S.hazardAt.slice(),ry:0,tags:{hazard:S.hazard(h)}});
  S.id=W.surfaces.length;S.name=S.name||'flood '+S.id;W.surfaces.push(S);return S;};
 const frontRecord=F=>({path:F.path.map(p=>p.slice()),w:F.w,speed:F.speed,start:F.start,period:F.period,rise:F.rise,hold:F.hold,fall:F.fall,depth:F.depth,base:F.base});

 // ---- the law as GLSL (62b's vertex shader; the test runs this text against S.levelAt): wfU(t), wfV(s, t), wfK(s, t), wfLevel(s, bed, t)
 W.floodGLSL=S=>{const F=S.front||S,f=glf,R=F.rise,H=R+F.hold,E=H+F.fall;
  return['float wfSm(float a,float b,float x){if(b<=a)return x<a?0.0:1.0;float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',
   'float wfU(float t){float u=t-'+gf(F.start)+';'+(F.period!=null?'u=u-'+f(F.period)+'*floor(u/'+f(F.period)+');if(u>='+f(F.period)+')u-='+f(F.period)+';':'')+'return u;}',
   'float wfV(float s,float t){return wfU(t)-s/'+f(F.speed)+';}',
   'float wfK(float s,float t){float v=wfV(s,t);if(v<0.0)return 0.0;if(v<'+f(R)+')return wfSm(0.0,'+f(R)+',v);if(v<'+f(H)+')return 1.0;if(v<'+f(E)+')return 1.0-wfSm('+f(H)+','+f(E)+',v);return 0.0;}',
   'float wfLevel(float s,float bed,float t){return bed+'+f(F.base)+'+'+f(F.depth)+'*wfK(s,t);}'].join('\n');};

 // ---- the queries and the export: opt-in wraps (nothing changes without a flood)
 const floods=()=>W.surfaces.filter(S=>S.kind==='flood');
 const at0=W.at;
 W.at=(x,z,t)=>{const b=at0(x,z,t);if(t==null)return b;let best=b,hb=b?b.heightAt(x,z,t):null;
  for(const S of floods()){const h=S.heightAt(x,z,t);if(h!=null&&(hb==null||h>=hb)){best=S;hb=h;}}return best;};
 const h0=W.heightAt;
 W.heightAt=(x,z,t)=>{let h=h0(x,z,t);for(const S of floods()){const v=S.heightAt(x,z,t);if(v!=null&&(h==null||v>h))h=v;}return h;};
 const ex0=W.export;
 W.export=()=>{const X=ex0();X.surfaces.forEach((o,i)=>{const S=W.surfaces[i];if(S.kind==='flood')Object.assign(o,{key:S.key,world:S.world,length:S.length},frontRecord(S.front),
   {law:'KHAZ.front: level(s, t) = bed(s) + base + depth * fk (core/water/ext/62-core-water-flood.js; twin S.levelAt)'});});return X;};
})();
