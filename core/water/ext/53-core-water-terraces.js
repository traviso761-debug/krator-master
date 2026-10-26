// ================================================================= WATER - ext: a stepped river (terraces) and the data of merged falls
// [G data]: no THREE, no DOM. Adds to WATER (20-core-water.js, 22-core-water-flow.js; load after them). Optional, and in the SUBFOLDER
// core/water/ext/ on purpose: many builds pool the top-level fragments of core/water, so a new top-level fragment would leak into all of
// them; a build opts in by path (CORE_WATER_EXT in its build.py). 53b-core-water-terraces-draw.js draws what this makes.
//
//   WATER.terraces({name, line, treads | levels, width, riser, speed, spread, treadSpeed, step})  a STEPPED RIVER: a chain of still pools, each at its
//        tread's level, joined by a fall down each riser; the nwbay river, the Ys rimstone terraces, a rice-terrace stream.
//        line      [[x, z], ...]: the river's course (its y is ignored: the levels say it)
//        treads    [{s0, s1, y, w?}, ...] explicit: the tread i is the part of the line from s0 to s1 metres along it, at height y, w m wide
//        levels    or [y0, y1, ...] (descending): equal treads, `riser` m (1.5) of line between each pair (`weights` [..] sets the treads' shares)
//        width     m (6), a number per tread, or a function (s) => m; speed, spread: the falls' (W.fall: speed fitted to land on the foot)
//        -> T = {kind: 'terraces', name, pools [still surfaces], falls [fall surfaces], treads, risers, line, length}; every pool is a
//        WATER.still polygon (the line's ribbon over its tread: it follows the bends) and every fall a WATER.fall whose lip is across the
//        line at the top of the riser and whose foot [x, z, y] is where the next tread begins at ITS level (fit: the curtain lands there).
//        The pools and falls are ordinary surfaces (WATER.at, WATER.surfaces, the export); the group adds what no one of them has:
//   T.heightAt(x, z)  the water's height over the line: the tread's level, linear down a riser's face, null off the water; WATER.heightAt
//        and WATER.flowAt ask the groups when no surface holds the point (a riser's face belongs to no pool)
//   T.contains(x, z), T.at(x, z) -> {kind: 'tread' | 'riser', index, level, surface} or null; T.flowAt(x, z) -> [vx, vz, speed, slope] (treadSpeed
//        m/s down the tread, the fall's speed on a riser); T.export() -> plain data (the pools' and falls' surface ids, the treads, the line)
//   WATER.mergedFalls(list, o)  the curtains and plunge discs of many falls as ONE set of arrays (positions, normals, (u, f), and per vertex the
//        streak's lip scale and fall time, the plunge's centre and radius), so a page draws a staircase of 37 steps in two calls
//        (WATER.drawFalls in 53b); the arrays are the per-fall W.curtain's, concatenated
(function(){const W=WATER,G=9.81,cl=(x,a,b)=>x<a?a:x>b?b:x;
 // ---- the line: cumulative arc length, the point and frame at s, the projection of a point
 const lineOf=P=>{const n=P.length,a=[0];for(let i=1;i<n;i++)a.push(a[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return{P,a,n,length:a[n-1]};};
 const frameAt=(L,s)=>{const P=L.P,a=L.a,n=L.n;s=cl(s,0,L.length);let i=0;while(i+2<n&&a[i+1]<s)i++;
  const seg=k=>{const dx=P[k+1][0]-P[k][0],dz=P[k+1][1]-P[k][1],l=Math.hypot(dx,dz)||1e-9;return[dx/l,dz/l];};
  const u=(s-a[i])/Math.max(1e-9,a[i+1]-a[i]),x=P[i][0]+(P[i+1][0]-P[i][0])*u,z=P[i][1]+(P[i+1][1]-P[i][1])*u;let d=seg(i),st=1;
  // at a vertex the bisector of the two segments, the cross-section stretched to keep its width round the bend
  const at0=Math.abs(s-a[i])<1e-9&&i>0,at1=Math.abs(s-a[i+1])<1e-9&&i+2<n;
  if(at0||at1){const e=at0?seg(i-1):seg(i+1),bx=d[0]+e[0],bz=d[1]+e[1],bl=Math.hypot(bx,bz);if(bl>1e-6){const b=[bx/bl,bz/bl];st=1/Math.max(.35,b[0]*d[0]+b[1]*d[1]);d=b;}}
  return{x,z,dx:d[0],dz:d[1],st};};
 const project=(L,x,z)=>{let best=null;for(let i=0;i+1<L.n;i++){const ax=L.P[i][0],az=L.P[i][1],ex=L.P[i+1][0]-ax,ez=L.P[i+1][1]-az,l2=Math.max(ex*ex+ez*ez,1e-9),u=cl(((x-ax)*ex+(z-az)*ez)/l2,0,1),
    px=ax+ex*u,pz=az+ez*u,d=Math.hypot(x-px,z-pz);if(!best||d<best.d)best={d,s:L.a[i]+u*Math.sqrt(l2),i};}return best;};
 W.terraces=o=>{const L=lineOf(o.line),name=o.name||'terraces',G0=o.step==null?6:o.step;
  const wOf=(t,i,s)=>t.w!=null?t.w:typeof o.width==='function'?o.width(s):Array.isArray(o.width)?o.width[Math.min(i,o.width.length-1)]:o.width==null?6:o.width;
  let treads;
  if(o.treads)treads=o.treads.map(t=>({s0:t.s0,s1:t.s1,y:t.y,w:t.w}));
  else{const Y=o.levels,n=Y.length,rs=o.riser==null?1.5:o.riser,wt=o.weights||Y.map(()=>1),sum=wt.reduce((a,b)=>a+b,0),room=L.length-(n-1)*rs;
   if(!(room>0))throw new Error('WATER.terraces: the line is shorter than its risers');treads=[];let s=0;
   for(let i=0;i<n;i++){const len=room*wt[i]/sum;treads.push({s0:s,s1:s+len,y:Y[i]});s+=len+rs;}}
  if(treads.length<1)throw new Error('WATER.terraces: no treads');
  for(let i=0;i<treads.length;i++){const t=treads[i];if(!(t.s1>t.s0))throw new Error('WATER.terraces: tread '+i+' has no length');
   if(i>0){if(!(t.y<treads[i-1].y))throw new Error('WATER.terraces: levels must descend down the line (tread '+i+')');if(t.s0<treads[i-1].s1-1e-9)throw new Error('WATER.terraces: treads overlap at '+i);}}
  const hw=(t,i,s)=>wOf(t,i,s)/2,off=(s,h)=>{const f=frameAt(L,s);return[f.x+f.dz*h*f.st,f.z-f.dx*h*f.st];};
  const T={kind:'terraces',name,pools:[],falls:[],treads:treads.map((t,i)=>({s0:t.s0,s1:t.s1,y:t.y,w:wOf(t,i,(t.s0+t.s1)/2)})),risers:[],line:o.line.map(p=>[p[0],p[1]]),length:L.length};
  // the pools: the ribbon of the line over each tread (every polyline vertex inside it, and a row at least every `step` m)
  treads.forEach((t,i)=>{const ss=[t.s0];for(let k=1;k+1<L.n;k++)if(L.a[k]>t.s0+1e-9&&L.a[k]<t.s1-1e-9)ss.push(L.a[k]);ss.push(t.s1);
   const rows=[ss[0]];for(let k=1;k<ss.length;k++){const m=Math.max(1,Math.ceil((ss[k]-ss[k-1])/G0));for(let q=1;q<=m;q++)rows.push(ss[k-1]+(ss[k]-ss[k-1])*q/m);}
   const left=rows.map(s=>off(s,hw(t,i,s))),right=rows.map(s=>off(s,-hw(t,i,s))).reverse();
   T.pools.push(W.still({name:name+' pool '+i,level:t.y,poly:left.concat(right)}));});
  // the risers: a fall from the top of one tread to the foot of the next, its lip across the line
  for(let i=0;i+1<treads.length;i++){const a=treads[i],b=treads[i+1],fa=frameAt(L,a.s1),fb=frameAt(L,b.s0),h=hw(a,i,a.s1),drop=a.y-b.y,run=b.s0-a.s1;
   const lip=[[fa.x+fa.dz*h*fa.st,fa.z-fa.dx*h*fa.st,a.y],[fa.x-fa.dz*h*fa.st,fa.z+fa.dx*h*fa.st,a.y]];
   const F=W.fall(Object.assign({name:name+' riser '+i,lip,dir:[fa.dx,fa.dz],speed:o.speed==null?.6:o.speed,drop,foot:[fb.x,fb.z,b.y],fit:run>1e-6},o.spread==null?{}:{spread:o.spread}));
   T.falls.push(F);T.risers.push({s0:a.s1,s1:b.s0,y0:a.y,y1:b.y,drop,run});}
  const tspd=o.treadSpeed==null?.3:o.treadSpeed;
  // where the water over (x, z) stands: a tread (its level), a riser (the face: linear), or none
  const locate=(x,z)=>{const q=project(L,x,z);if(!q)return null;const f=frameAt(L,q.s);
   for(let i=0;i<treads.length;i++){const t=treads[i];if(q.s>=t.s0-1e-9&&q.s<=t.s1+1e-9){if(q.d<=hw(t,i,q.s)*f.st+1e-9)return{kind:'tread',index:i,level:t.y,s:q.s,f};return null;}
    if(i+1<treads.length&&q.s>t.s1&&q.s<treads[i+1].s0){const n=treads[i+1],u=(q.s-t.s1)/(n.s0-t.s1);if(q.d<=hw(t,i,t.s1)+1e-9)return{kind:'riser',index:i,level:t.y+(n.y-t.y)*u,s:q.s,f};return null;}}
   return null;};
  T.at=(x,z)=>{const r=locate(x,z);return r?{kind:r.kind,index:r.index,level:r.level,surface:r.kind==='tread'?T.pools[r.index]:T.falls[r.index]}:null;};
  T.contains=(x,z)=>!!locate(x,z);
  T.heightAt=(x,z)=>{const r=locate(x,z);return r?r.level:null;};
  T.flowAt=(x,z)=>{const r=locate(x,z);if(!r)return[0,0,0,0];
   if(r.kind==='tread')return[r.f.dx*tspd,r.f.dz*tspd,tspd,0];const R=T.risers[r.index],F=T.falls[r.index],v=Math.max(F.speed,R.run>0?R.run/F.tFall:F.speed);return[r.f.dx*v,r.f.dz*v,v,R.run>0?R.drop/R.run:1e3];};
  T.export=()=>({kind:'terraces',name,pools:T.pools.map(p=>p.id),falls:T.falls.map(f=>f.id),treads:T.treads,risers:T.risers,line:T.line,length:T.length,treadSpeed:tspd});
  W.groups.push(T);return T;};

 // ---- the data of merged falls: the per-fall meshes concatenated. Per curtain vertex: position, normal, (u, f), and (the streak's lip scale lipW *
 // streak.across, its fall time tFall); per plunge-disc vertex: position and (the disc's centre x, z, the churn's radius). Indices run on from each
 // fall's own (a vertex offset); `segs` is the disc's rim (48, as drawFall's CircleGeometry).
 W.mergedFalls=(list,o)=>{o=o||{};const Q=W.PRESETS.fall,cp={pos:[],nrm:[],uv:[],fp:[],idx:[],count:0,falls:list.length},pl={pos:[],pc:[],idx:[],count:0,r:[]},segs=o.segs==null?48:o.segs;
  for(const S of list){const M=W.curtain(S,{rows:W.curtainRows(S,o),cols:o.cols==null?Q.cols:o.cols}),base=cp.count,lw=S.lipW*Q.streak.across;
   for(let i=0;i<M.pos.length;i++){cp.pos.push(M.pos[i]);cp.nrm.push(M.nrm[i]);}for(let i=0;i<M.uv.length;i++)cp.uv.push(M.uv[i]);
   for(let i=0;i<M.count;i++)cp.fp.push(lw,S.tFall);for(const k of M.idx)cp.idx.push(base+k);cp.count+=M.count;
   if(o.plunge!==false){const P=W.plunge(S),r=P.r*2.4,y=o.plungeY==null?P.y+.06:o.plungeY,b0=pl.count;
    pl.pos.push(P.x,y,P.z);pl.pc.push(P.x,P.z,P.r);for(let k=0;k<segs;k++){const a=k/segs*Math.PI*2;pl.pos.push(P.x+Math.cos(a)*r,y,P.z+Math.sin(a)*r);pl.pc.push(P.x,P.z,P.r);}
    for(let k=0;k<segs;k++)pl.idx.push(b0,b0+1+(k+1)%segs,b0+1+k);pl.count+=segs+1;pl.r.push(r);}}
  return{curtain:cp,plunge:pl};};
})();
