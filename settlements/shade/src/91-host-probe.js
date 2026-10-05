// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Every Shade check reads the built world
// (the ground's height function, the water meshes' own vertices, the biome's
// instance matrices, the walkable grid), never the constants that built it.
// Each check is a function of its inputs, and NEGATIVES feeds each one a
// deliberately broken input: a check that passes its negative cannot fail,
// and verify.py fails the run for it.
const BUDGET={
 showcase:{tris:6000000,calls:120},
 cls:{pass:3500000,host:900000},
 type:{'desert/trees':'pass','desert/floor':'pass','desert/fauna':'pass','desert/dress':'pass','host':'host','buildings':'host'},
};
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);});
 return pts;}
function regOccupancy(){const n=new Array(REG.length).fill(0);const P=_probePoints();
 // the water volumes are drawn by probeSkip meshes: count their own vertices
 const W=[];for(const k in WATER){const a=WATER[k].geometry.attributes.position;for(let i=0;i<a.count;i+=3)W.push([a.getX(i),a.getY(i),a.getZ(i)]);}
 // the buildings are merged into one mesh per material: count their own vertices too
 const Bv=[];for(const m of (BUILDINGS.meshes||[])){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i+=9)Bv.push([a.getX(i),a.getY(i),a.getZ(i)]);}
 const Cv=[];for(const m of (typeof CARVE_MESHES!=='undefined'?CARVE_MESHES:[])){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i+=7)Cv.push([a.getX(i),a.getY(i),a.getZ(i)]);}
 REG.forEach((r,i)=>{for(const p of (r.cls==='water'?W:r.cls==='building'?Bv:r.cls==='carve'?Cv:P))if(regHas(r,p[0],p[1],p[2]))n[i]++;});
 return REG.map((r,i)=>({name:r.name,n:n[i]}));}
function nanSweep(){const bad=[];let badInst=0;
 scene.traverse(o=>{if(!o.isMesh&&!o.isInstancedMesh)return;if(o.userData&&o.userData.probeSkip)return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(p){const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.name||o.geometry.type,at:i});break;}}
  if(o.isInstancedMesh){const a=o.instanceMatrix.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){badInst++;break;}}});
 return {meshes:bad.length,first:bad.slice(0,8),instances:badInst,firstInstances:[]};}
function typeStats(){const out={};for(const k in BIO.stats){const t=BIO.stats[k],cls=BUDGET.type[k]||'pass';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}

// ---------------------------------------------------------------- the Shade checks
const worldVerts=m=>{m.updateMatrixWorld(true);const a=m.geometry.attributes.position,v=new THREE.Vector3(),out=[];for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);out.push([v.x,v.y,v.z]);}return out;};
// the rock's top at (x,z): over a carve patch, the patch's top; elsewhere the ground
const rockTop=(x,z)=>{const t=BIO.carve.topAt(x,z);return t===null?terrainH(x,z):t;};
// a point buried in rock (a carve patch's or the ground's) by more than `e` up and out
const buried=(x,y,z,e)=>terrainH(x,z)>y+e||(BIO.carve.rockAt(x,y,z)&&BIO.carve.rockAt(x,y+e,z)&&BIO.carve.rockAt(x+e,y,z)&&BIO.carve.rockAt(x-e,y,z)&&BIO.carve.rockAt(x,y,z+e)&&BIO.carve.rockAt(x,y,z-e));
// a facade's sample points [x,z,fx,fz]: a straight line {a,b,face} or a traced foot {pts}
const facadePts=(F,n)=>F.pts?F.pts:Array.from({length:n+1},(_,i)=>[mix(F.a[0],F.b[0],i/n),mix(F.a[1],F.b[1],i/n),F.face[0],F.face[1]]);
const CHK={
 // the falls: every vertex of the curtain in front of the rock, the lowest ones inside the pool at its surface
 falls(V){const minY=Math.min(...V.map(v=>v[1]));const low=V.filter(v=>v[1]<minY+.01);
  const inRock=V.filter(v=>buried(v[0],v[1],v[2],.15)).length,out=low.filter(v=>Math.hypot(v[0]-POOL.x,v[2]-POOL.z)>POOL.r-1||waterH(v[0],v[2])<v[1]-.05).length;
  return{ok:inRock===0&&out===0,detail:V.length+' curtain vertices; '+inRock+' inside the rock; '+out+'/'+low.length+' of the lowest outside the pool'};},
 // a stream ribbon: its centre above the bed everywhere, its edges hidden under the banks (a stream on a dyke shows its edges)
 ribbon(V,NW,name){let bed=0,edge=0,rows=0,worst=9;for(let r=0;r*(NW+1)<V.length;r++){const row=V.slice(r*(NW+1),(r+1)*(NW+1));if(row.length<NW+1)break;rows++;
  const c=row[NW>>1],dh=c[1]-terrainH(c[0],c[2]);worst=Math.min(worst,dh);if(dh<.3)bed++;for(const e of [row[0],row[NW]])if(rockTop(e[0],e[2])<e[1]-.05)edge++;}
  return{ok:bed===0&&edge<=rows*.02,detail:name+': '+rows+' rows; centre within .3 m of the bed '+bed+' (least depth '+worst.toFixed(2)+' m); edges showing '+edge};},
 // a trail: the steepest grade of the GROUND along its centreline, every half metre
 grade(P,lim){let mg=0,at=null;for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(l/.5));let px=a[0],pz=a[1],py=terrainH(px,pz);
  for(let i=1;i<=n;i++){const x=mix(a[0],b[0],i/n),z=mix(a[1],b[1],i/n),y=terrainH(x,z),g=Math.abs(y-py)/Math.hypot(x-px,z-pz);if(g>mg){mg=g;at=[x|0,z|0];}px=x;pz=z;py=y;}}
  return{ok:mg<=lim,detail:'steepest '+mg.toFixed(3)+' (limit '+lim+') at '+JSON.stringify(at)};},
 // a facade line lies on a sheer face: 1 m out on the floor, 3 m in at the top, at least 30 m apart (84 degrees)
 // a wall place: 3 m into the rock the rock's top stands 30 m over the floor 1 m out (over a carve patch, the patch's top)
 sheer(F,name){let worst=1e9,at=null;for(const [x,z,fx,fz] of facadePts(F,12)){
  const rise=rockTop(x-fx*3,z-fz*3)-terrainH(x+fx*1,z+fz*1);if(rise<worst){worst=rise;at=[x|0,z|0];}}
  return{ok:worst>=30,detail:name+': least rise over 4 m '+worst.toFixed(1)+' m at '+JSON.stringify(at)};},
 // a place on open ground: flat (grade <= .2 over 1 m) and dry, sampled on a 2 m grid inside it
 flat(poly,name){let n=0,steep=0,wet=0,worst=0;const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]);
  for(let x=Math.min(...xs)+1;x<Math.max(...xs);x+=2)for(let z=Math.min(...zs)+1;z<Math.max(...zs);z+=2){if(!polyHas(poly,x,z))continue;n++;const y=terrainH(x,z),g=Math.max(Math.abs(terrainH(x+1,z)-y),Math.abs(terrainH(x,z+1)-y));
   worst=Math.max(worst,g);if(g>.2)steep++;if(waterH(x,z)>y)wet++;}
  return{ok:n>0&&steep===0&&wet===0,detail:name+': '+n+' samples, '+steep+' steep (worst '+worst.toFixed(2)+'), '+wet+' under water'};},
 // a shore place: some of it wet, most of it dry
 shore(poly,name){let n=0,wet=0;const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]);
  for(let x=Math.min(...xs)+1;x<Math.max(...xs);x+=2)for(let z=Math.min(...zs)+1;z<Math.max(...zs);z+=2){if(!polyHas(poly,x,z))continue;n++;if(waterH(x,z)>terrainH(x,z))wet++;}
  return{ok:wet>0&&wet<n*.6,detail:name+': '+wet+'/'+n+' samples under water'};},
 // no flora rooted inside a reserved place: the biome's registered trees and every instance near the ground
 noFlora(polys){let trees=0,items=0;const inAny=(x,z)=>polys.some(p=>polyHas(p,x,z));
  for(const r of REG)if(r.cls==='flora'&&r.r<60&&inAny(r.x,r.z))trees++;
  const m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
  scene.traverse(o=>{if(!o.isInstancedMesh||!o.userData.biome||o.count>2e6||o.instanceMatrix.usage===THREE.DynamicDrawUsage)return;   // fauna move: a strider crossing a place is not rooted in it
 for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(p,q,s);if(p.y-terrainH(p.x,p.z)<1.2&&inAny(p.x,p.z))items++;}});
  return{ok:trees===0&&items===0,detail:trees+' registered trees and '+items+' ground-level instances inside '+polys.length+' reserved polygons'};},
 // no two places overlap (a vertex of one inside the other, or crossing edges)
 overlap(list){const bad=[];const X=(a,b,c,d)=>{const o=(p,q,r)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]));return o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0;};
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const A=list[i].poly,B=list[j].poly;let hit=A.some(p=>polyHas(B,p[0],p[1]))||B.some(p=>polyHas(A,p[0],p[1]));
   for(let a=0;a<A.length&&!hit;a++)for(let b=0;b<B.length&&!hit;b++)if(X(A[a],A[(a+1)%A.length],B[b],B[(b+1)%B.length]))hit=true;if(hit)bad.push(list[i].id+'/'+list[j].id);}
  return{ok:!bad.length,detail:bad.length?bad.join(', '):list.length+' places, none overlapping'};},
 // each placed building is measured against its reserved place, including edge midpoints
 buildingInside(list){const bad=[],inside=(P,p)=>{if(polyHas(P,p[0],p[1]))return true;
   for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz;
    const t=l2?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l2)):0;
    if(Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t)<=.02)return true;}return false;};
  for(const B of list){const P=B.placePoly,F=B.footprint,samples=[];
   for(let i=0;i<F.length;i++){const a=F[i],b=F[(i+1)%F.length];samples.push(a,[(a[0]+b[0])*.5,(a[1]+b[1])*.5]);}
   samples.push(polyCentre(F));if(samples.some(p=>!inside(P,p)))bad.push(B.id+' outside '+B.placeId);}
  return{ok:!bad.length,detail:bad.length?bad.join(', '):list.length+' building footprints lie inside their places'};},
 // simple polygon intersection; touching edges are permitted, interior overlap is not
 buildingOverlap(list){const bad=[],cross=(a,b,c,d)=>{const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
   return o(a,b,c)*o(a,b,d)<-1e-8&&o(c,d,a)*o(c,d,b)<-1e-8;};
  // plan overlap AND height overlap; the parts of one assembly (group: a stair, its gallery, the houses on it) are designed to meet
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const P=list[i],Q=list[j];if(P.group&&P.group===Q.group)continue;
   if(Math.min(P.y1,Q.y1)-Math.max(P.y0,Q.y0)<=.05)continue;
   const A=P.footprint,B=Q.footprint;let hit=A.some(p=>polyHas(B,p[0],p[1]))||B.some(p=>polyHas(A,p[0],p[1]));
   for(let a=0;a<A.length&&!hit;a++)for(let b=0;b<B.length&&!hit;b++)if(cross(A[a],A[(a+1)%A.length],B[b],B[(b+1)%B.length]))hit=true;
   if(hit)bad.push(P.id+'/'+Q.id);}
  return{ok:!bad.length,detail:bad.length?bad.slice(0,8).join(', '):list.length+' footprints, none overlapping in plan and height'};},
 // the back edge of every carved facade touches the wall line at its terrain height
 wallContact(list){const walls=list.filter(B=>B.backLine&&!B.inAlcove);let worst=1e9,at=null;
  for(const B of walls){const a=B.backLine[0],b=B.backLine[1],ex=b[0]-a[0],ez=b[1]-a[1],l=Math.hypot(ex,ez),nx=-ez/l,nz=ex/l;
   // the outward normal is the side the building's centre is on; the rock is on the other side
   const sgn=((B.center[0]-a[0])*nx+(B.center[1]-a[1])*nz)>0?-1:1;
   for(let i=0;i<=8;i++){const t=i/8,x=mix(a[0],b[0],t)+nx*sgn*.6,z=mix(a[1],b[1],t)+nz*sgn*.6,y=B.baseY+B.lift+B.height*.9,margin=BIO.carve.rockAt(x,y,z)?0:terrainH(x,z)-y;if(margin<worst){worst=margin;at=B.id;}}}
  return{ok:walls.length>0&&worst>=0,detail:walls.length+' carved fronts; least rock above 90% of a front\'s height, 0.6 m behind it: '+worst.toFixed(1)+' m ('+at+')'};},
 // the alcove dwellings stand under their hoods: every footprint point under the void's
 // ceiling with half a metre of head room over the building's top, and the back line covered
 underHood(list){const A=list.filter(B=>B.inAlcove);let worst=1e9,at=null,open=0;
  for(const B of A){const pts=B.footprint.concat(B.backLine.map(p=>p));const top=B.y1;
   for(const p of pts){const c=BIO.carve.covered(p[0],p[1]);if(c===null){if(B.backLine.includes(p))open++;continue;}if(c-top<worst){worst=c-top;at=B.id;}}}
  return{ok:A.length>0&&!open&&worst>=.5,detail:A.length+' alcove dwellings; back corners in the open '+open+'; least head room '+worst.toFixed(1)+' m ('+at+')'};},
 // each carve patch: the void open at mid height half way in, rock 2 m over its ceiling, nothing rooted under its hood
 carveOpen(Q){const q=Q.depth*.45,x=Q.c[0]-Q.n[0]*q,z=Q.c[1]-Q.n[1]*q,ym=Q.floorY+Q.h*.45,c=BIO.carve.covered(x,z);
  const voidOpen=!BIO.carve.rockAt(x,ym,z)&&terrainH(x,z)<ym,hood=c!==null&&BIO.carve.rockAt(x,c+2,z);
  return{ok:voidOpen&&hood,detail:Q.id+': void at '+ym.toFixed(1)+' m '+(voidOpen?'open':'IN ROCK')+'; 2 m over the ceiling '+(c===null?'no ceiling':hood?'rock':'AIR')};},
 noHoodFlora(trees){const bad=trees.filter(r=>BIO.carve.covered(r.x,r.z)!==null);
  return{ok:!bad.length,detail:bad.length?bad.length+' under a hood (first '+bad[0].name+' at '+[bad[0].x|0,bad[0].z|0]+')':trees.length+' plants, none under a hood'};},
 camerasOutOfRock(cams){const bad=cams.filter(c=>buried(c.x,c.y,c.z,.3));return{ok:!bad.length,detail:bad.length?'in the rock: '+bad.map(c=>c.view).join(', '):cams.length+' cameras in the open'};},
 buildingFamilies(B){const need=['treasury','tomb','stair','ledge','pueblo','cliffpueblo','khan','tent','stall','tower'],missing=need.filter(k=>!B.byFamily||!B.byFamily[k]);
  return{ok:!!B.count&&!missing.length,detail:missing.length?'missing family: '+missing.join(', '):need.map(k=>k+' '+B.byFamily[k]).join(', ')};},
 buildingDoorsReachable(list){const N=LIFE.NAV,start=polyCentre(PLACES.find(p=>p.id==='khan').poly),seen=LIFE.reach(start[0],start[1]),bad=[];
  for(const B of list.filter(b=>b.family!=='ledge')){const d=B.door||[NaN,NaN],i=Math.round((d[0]-N.x0)/N.c),j=Math.round((d[1]-N.z0)/N.c),k=j*N.nx+i;
   if(i<0||j<0||i>=N.nx||j>=N.nz||N.blocked[k]||!seen[k])bad.push(B.id);}
  return{ok:!bad.length,detail:bad.length?bad.join(', ')+' have blocked or unreachable entrances':list.length+' entrances clear and reachable from the Khan'};},
 // a water surface faces UP: every triangle's normal has y > 0 (a ribbon wound the other way is culled from above)
 facesUp(meshes){const bad=[];for(const m of meshes){const g=m.geometry,P=g.attributes.position,I=g.index?g.index.array:null,n=I?I.length:P.count;let down=0,tot=0;
  const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
  for(let i=0;i<n;i+=3){const ia=I?I[i]:i,ib=I?I[i+1]:i+1,ic=I?I[i+2]:i+2;A.fromBufferAttribute(P,ia);B.fromBufferAttribute(P,ib);C.fromBufferAttribute(P,ic);
   B.sub(A);C.sub(A);const y=B.z*C.x-B.x*C.z;tot++;if(y<=0)down++;}
  if(down)bad.push((m.userData.inspectLabel||m.name)+' '+down+'/'+tot);}
  return{ok:!bad.length,detail:bad.length?'facing down: '+bad.join(', '):meshes.length+' water surfaces face up'};},
 // nothing rooted on a cliff: a ground-level instance where the ground's grade, centred on it over 1 m,
 // exceeds 1.3 (centred: a stone on the rim's top at the lip is not on the face)
 noCliffFlora(P,trees){const G=new Map(),C=20,key=(x,z)=>Math.floor(x/C)*4096+Math.floor(z/C);
  const grade=(x,z)=>Math.max(Math.abs(terrainH(x+.5,z)-terrainH(x-.5,z)),Math.abs(terrainH(x,z+.5)-terrainH(x,z-.5)));
  let bad=0,at=null,inTree=0;const T=trees||[];
  for(const r of T){if(grade(r.x,r.z)>1.3){bad++;if(!at)at=['tree '+r.name,r.x|0,r.z|0];}
   for(let i=Math.floor((r.x-r.r)/C);i<=Math.floor((r.x+r.r)/C);i++)for(let j=Math.floor((r.z-r.r)/C);j<=Math.floor((r.z+r.r)/C);j++){const k=i*4096+j;if(!G.has(k))G.set(k,[]);G.get(k).push(r);}}
  for(const p of P){const h=terrainH(p[0],p[2]);if(p[1]-h>1.2)continue;
   const L=G.get(key(p[0],p[2]));if(L&&L.some(r=>Math.hypot(p[0]-r.x,p[2]-r.z)<r.r)){inTree++;continue;}   // a tree's part: the tree is tested at its root
   if(grade(p[0],p[2])>1.3){bad++;if(!at)at=[p[0]|0,p[2]|0];}}
  return{ok:bad===0,detail:bad+' rooted on a cliff, of '+T.length+' trees (at their roots) and '+(P.length-inTree)+' ground-level items outside them'+(at?' (first '+JSON.stringify(at)+')':'')};},
 // the preset cameras stand clear of the trees (no registered tree within its crown's radius + 3 m)
 camerasClear(cams){const bad=[];for(const c of cams){for(const r of REG){if(r.cls!=='flora'||r.r>60)continue;if(Math.hypot(c.x-r.x,c.z-r.z)<r.r+3&&c.y<(r.y||0)+r.h+2){bad.push(c.view+' in '+r.name);break;}}}
  return{ok:!bad.length,detail:bad.length?bad.slice(0,5).join('; '):cams.length+' cameras clear'};},
 // the canyon is open: its east port reachable from the Khan over the ground (optionally with cells blocked)
 canyonOpen(block){const K=polyCentre(PLACES.find(p=>p.id==='khan').poly),S=LIFE.reach(K[0],K[1],block),P=PORTS.canyon_east;
  const k=Math.round((P.x-LIFE.NAV.x0)/LIFE.NAV.c)+Math.round((P.z-LIFE.NAV.z0)/LIFE.NAV.c)*LIFE.NAV.nx;return{ok:!!S[k],detail:'the canyon\'s east port '+(S[k]?'reachable':'UNREACHABLE')+' from the Khan'};},
 // SIM steps: at each hour every resident, starting from home, decides (SIM.jump) and finds its way; none stuck, no
 // route failed. Leaves them where the last hour put them (nothing draws them yet) and the clock at its hour.
 lifeSteps(hours){const C=LIFE.CLOCK,h0=C.hour,res=SIM.all('actor').filter(a=>a.present&&!a.transient),out=[];let bad=false;
  for(const h of hours){res.forEach(a=>{SIM.release(a);a.task=null;a.pos=null;a.place=null;a.wanted=null;});const f0=SIM.routeFail.length;C.hour=h+.5/60;SIM.jump();
   const stuck=res.filter(a=>!a.task),fell=res.filter(a=>a.activity!==a.wanted).length,rf=SIM.routeFail.length-f0;if(stuck.length||rf)bad=true;
   out.push(h+'h '+(res.length-stuck.length)+' placed'+(fell?' ('+fell+' fell back)':'')+(stuck.length?', '+stuck.length+' STUCK (first '+stuck[0].id+' wanting '+stuck[0].wanted+')':'')+(rf?', '+rf+' ROUTES FAILED':''));}
  C.hour=h0;return{ok:!bad,detail:out.join('; ')+' ('+LIFE.ROUTE_CACHE.size+' routes kept)'};},
 // an event fired at 6:00 and stepped minute by minute: its stops in the order the audit routed them (want), then out
 // by its port, every leg found on the ground
 convoyRuns(E,want){const C=LIFE.CLOCK,f0=SIM.routeFail.length;C.hour=6+.5/60;const G=SIM.fire(E,SIM.minute(),C.t);if(!G)return{ok:false,detail:E.id+' did not fire'};
  const stops=[];let ph=G.phase,m=0;for(;m<24*60&&SIM.get('group',G.id);m++){LIFE.run(1);
   if(G.phase!==ph){ph=G.phase;if(ph==='dwell'){const A=SIM.get('actor',G.leader),L=A.plan[A.planI];stops.push(L.activity+' at '+L.place);}}}
  const left=!SIM.get('group',G.id),rf=SIM.routeFail.length-f0,same=stops.join()===want.join();C.hour=12;
  return{ok:left&&!rf&&same,detail:G.members.length+' riders: '+stops.join(' -> ')+(left?'; out by '+G.to+' after '+m+' min':'; STILL IN after '+m+' min')+(rf?'; '+rf+' ROUTES FAILED':'')+(same?'':'; WANTED '+want.join(' -> '))};},
};
function shadeChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('falls-land-in-the-pool',CHK.falls(worldVerts(WATER.falls)));
 add('water-faces-up',CHK.facesUp([WATER.upper,WATER.lower,WATER.pool]));
 add('upper-stream-in-its-channel',CHK.ribbon(worldVerts(WATER.upper),WATER.upper.userData.NW,'upper'));
 add('lower-stream-in-its-channel',CHK.ribbon(worldVerts(WATER.lower),WATER.lower.userData.NW,'lower'));
 add('switchback-grade',CHK.grade(SWB.pts,.15));
 {const s=SWB.spacing,mn=Math.min(...s);add('switchback-legs-apart',{ok:mn>=SWB.bank*2,detail:'leg spacing '+s.join(', ')+' m (needs '+(SWB.bank*2)+')'});}
 const u=LIFE.OUT.onlyWayUp;add('switchback-is-the-only-way-up',{ok:u.withSwitchback&&!u.withoutSwitchback,detail:'gatehouse reachable with the switchback: '+u.withSwitchback+'; with it blocked ('+u.blockedCells+' cells): '+u.withoutSwitchback});
 for(const p of PLACES){if(p.kind==='wall')add('sheer-face: '+p.id,CHK.sheer(p.facade,p.id));
  else if(p.kind==='ground'||p.kind==='plateau')add('flat-and-dry: '+p.id,CHK.flat(p.poly,p.id));else if(p.kind==='shore')add('on-the-shore: '+p.id,CHK.shore(p.poly,p.id));}
 add('places-do-not-overlap',CHK.overlap(PLACES));
 const B=window._buildings;
 add('buildings: footprints inside places',CHK.buildingInside(B.records));
 add('buildings: footprints do not overlap',CHK.buildingOverlap(B.records));
 add('buildings: wall backs meet the cliff',CHK.wallContact(B.records));
 add('buildings: alcove dwellings under their hoods',CHK.underHood(B.records));
 add('buildings: every family represented',CHK.buildingFamilies(B));
 add('buildings: entrances remain reachable',CHK.buildingDoorsReachable(B.records));
 {const sh=Object.keys(B.rejected||{}).filter(k=>/_short$/.test(k));add('buildings: every plan placed in full',{ok:!sh.length,detail:sh.length?sh.map(k=>k+' '+B.rejected[k]).join(', '):B.count+' buildings ('+Object.keys(B.byFamily).map(k=>k+' '+B.byFamily[k]).join(', ')+'), '+B.drawCalls+' draw calls'});}
 add('no-flora-in-reserved-places',CHK.noFlora(RESERVED.filter(p=>p.kind!=='shore').map(p=>p.poly)));
 add('canyon-mouth-open',CHK.canyonOpen());
 {const P=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();scene.traverse(o=>{if(!o.isInstancedMesh||!o.userData.biome||o.instanceMatrix.usage===THREE.DynamicDrawUsage)return;for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(p,q,sc);if(Math.abs(p.x)<700&&Math.abs(p.z)<700)P.push([p.x,p.y,p.z]);}});
  add('no-flora-on-cliffs',CHK.noCliffFlora(P,REG.filter(r=>r.cls==='flora'&&r.r<60&&Math.abs(r.x)<700&&Math.abs(r.z)<700)));}
 for(const Q of BIO.carve.patches)add('carve: '+Q.id+' open under rock',CHK.carveOpen(Q));
 add('carve: nothing grows under a hood',CHK.noHoodFlora(REG.filter(r=>r.cls==='flora'&&r.r<60)));
 add('preset-cameras-out-of-the-rock',CHK.camerasOutOfRock(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('preset-cameras-clear-of-trees',CHK.camerasClear(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 const L=LIFE.OUT;
 add('life: every place reachable',{ok:!L.unreachable.length,detail:L.unreachable.length?'unreachable: '+L.unreachable.join(', '):L.places+' places and '+Object.keys(PORTS).length+' ports reachable from the Khan'});
 add('life: capacity every hour',{ok:!L.capacity.length,detail:L.capacity.length?L.capacity.slice(0,6).map(c=>c.hour+'h '+c.activity+' short '+c.short).join('; '):L.people+' people, '+L.jobs+' jobs, 24 hours, no shortfall'});
 add('life: activities known and offered',{ok:!L.unknownActivities.length,detail:L.unknownActivities.join(', ')||'all '+L.activities});
 const ev=L.events.raider_convoy;add('life: raider convoy routed',{ok:!ev.missing.length&&ev.exitOnSwitchback_m>=200,detail:ev.legs.map(l=>l.to+' '+l.len+' m').join(' -> ')+'; exit on the switchback '+ev.exitOnSwitchback_m+' m'+(ev.missing.length?'; MISSING '+ev.missing.join(', '):'')});
 const unr=Object.keys(L.routes).filter(j=>L.routes[j].unrouted);add('life: every job\'s commute routed',{ok:!unr.length,detail:unr.length?unr.join(', '):Object.keys(L.routes).length+' jobs'});
 add('life: SIM steps everyone (2h, 8h, 13h, 20h)',CHK.lifeSteps([2,8,13,20]));
 add('life: the raider convoy steps through its legs',CHK.convoyRuns(SIM.get('event','raider_convoy'),ev.legs.filter(l=>!/^exit /.test(l.to)).map(l=>l.to)));
 return R;}
// each check fed a broken input; every one of these must FAIL
function shadeNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('falls pushed 3 m into the rock',CHK.falls(worldVerts(WATER.falls).map(v=>[v[0]-3,v[1],v[2]])));
 {const g=WATER.pool.geometry.clone(),I=g.index.array;for(let i=0;i<I.length;i+=3){const t=I[i+1];I[i+1]=I[i+2];I[i+2]=t;}add('the pool wound the wrong way',CHK.facesUp([new THREE.Mesh(g)]));}
 add('upper stream lifted 1.2 m (a dyke)',CHK.ribbon(worldVerts(WATER.upper).map(v=>[v[0],v[1]+1.2,v[2]]),WATER.upper.userData.NW,'upper+1.2'));
 add('lower stream sunk 1 m',CHK.ribbon(worldVerts(WATER.lower).map(v=>[v[0],v[1]-1,v[2]]),WATER.lower.userData.NW,'lower-1'));
 add('a trail straight up the north slope',CHK.grade([[60,SWB.zEdge+2],[60,SWB.zEdge-SWB.W-4]],.15));
 const pe=PLACES.find(p=>p.id==='petra').facade;add('the carved face moved 20 m onto the floor',CHK.sheer({a:[pe.a[0],pe.a[1]-20],b:[pe.b[0],pe.b[1]-20],face:pe.face},'petra-20'));
 {const F=PLACES.find(p=>p.id==='cliff-nw').facade;add('a cliff run traced 15 m onto the floor',CHK.sheer({pts:F.pts.map(q=>[q[0]+q[2]*15,q[1]+q[3]*15,q[2],q[3]])},'cliff-nw+15'));}
 {const A=window._buildings.records.find(b=>b.inAlcove);add('an alcove dwelling lifted 12 m into the hood',CHK.underHood([Object.assign({},A,{y1:A.y1+12})]));
  add('an alcove dwelling pushed out of its alcove',CHK.underHood([Object.assign({},A,{footprint:A.footprint.map(p=>[p[0]+A.face[0]*14,p[1]+A.face[1]*14]),backLine:A.backLine.map(p=>[p[0]+A.face[0]*14,p[1]+A.face[1]*14])})]));}
 {const Q=BIO.carve.patches[0];add('a carve patch probed 25 m above its floor',CHK.carveOpen(Object.assign({},Q,{floorY:Q.floorY+25})));
  const x=Q.c[0]-Q.n[0]*Q.depth*.5,z=Q.c[1]-Q.n[1]*Q.depth*.5;add('a tree under an alcove\'s hood',CHK.noHoodFlora([{name:'test tree',x,z,r:3}]));
  const c=BIO.carve.covered(x,z);add('a camera inside a hood',CHK.camerasOutOfRock([{view:'in-hood',x,y:c+3,z}]));}
 {const F=PLACES.find(p=>p.id==='petra').facade,P=[];for(let i=0;i<=10;i++){const x=mix(F.a[0],F.b[0],i/10),z=F.a[1]+1;P.push([x,terrainH(x,z),z]);}add('plants on the carved face',CHK.noCliffFlora(P));}
 add('a place across the north wall',CHK.flat([[-72,-90],[-60,-90],[-60,-70],[-72,-70]],'across the wall'));
 add('a place across the lower stream',CHK.flat([[-10,-8],[10,-8],[10,8],[-10,8]],'across the stream'));
 add('a shore place with no water',CHK.shore([[-35,-46],[5,-46],[5,-14],[-35,-14]],'the market as a shore'));
 add('a reserved box over planted plateau',CHK.noFlora([[[-600,-150],[-300,-150],[-300,150],[-600,150]]]));
 const m=PLACES.find(p=>p.id==='market');add('two places overlapping',CHK.overlap([m,{id:'market+5',poly:m.poly.map(p=>[p[0]+5,p[1]+5])}]));
 {const T=REG.find(r=>r.cls==='flora'&&r.r<60);if(T)add('a camera inside a tree',CHK.camerasClear([{view:'in-tree',x:T.x,y:(T.y||0)+2,z:T.z}]));}
 {const N=LIFE.NAV,b=new Uint8Array(N.nx*N.nz);for(let j=0;j<N.nz;j++)for(let i=0;i<N.nx;i++){const x=N.x0+i*N.c;if(x>=150&&x<=153)b[j*N.nx+i]=1;}add('a wall across the canyon',CHK.canyonOpen(b));}
 {const B=window._buildings.records[0],moved=Object.assign({},B,{footprint:B.footprint.map(p=>[p[0]+1000,p[1]+1000])});
  add('a building outside its reserved place',CHK.buildingInside([moved]));}
 {const A=window._buildings.records[0],B=window._buildings.records[1];add('two buildings on the same footprint',CHK.buildingOverlap([A,Object.assign({},B,{footprint:A.footprint})]));}
 {const B=window._buildings.records.find(b=>b.backLine&&b.family==='treasury'),c=B.center,m=(p)=>[p[0]+(c[0]-B.backLine[0][0])*.0+(B.face?B.face[0]:0)*4,p[1]+(B.face?B.face[1]:0)*4];
  add('a carved front standing 4 m out from the cliff',CHK.wallContact([Object.assign({},B,{backLine:B.backLine.map(m),center:[c[0]+(B.face?B.face[0]:0)*4,c[1]+(B.face?B.face[1]:0)*4]})]));}
 {const B=Object.assign({},window._buildings,{byFamily:Object.assign({},window._buildings.byFamily,{tower:0})});add('a building family omitted',CHK.buildingFamilies(B));}
 {const P=SIM.nav.layers.pedestrian;SIM.nav.layer('pedestrian',{route:()=>null});const r=CHK.lifeSteps([8]);SIM.nav.layers.pedestrian=P;
  SIM.all('actor').forEach(a=>{a.bad={};a.mem={};});add('no way on the ground for anyone',r);}
 {const E=SIM.get('event','raider_convoy'),X=Object.assign({},E,{id:'convoy_lost',to:['nowhere']});SIM.port({id:'nowhere',x:2000,z:2000});SIM.event(X);
  add('a convoy whose exit port is off the map',CHK.convoyRuns(X,LIFE.OUT.events.raider_convoy.legs.filter(l=>!/^exit /.test(l.to)).map(l=>l.to)));
  SIM.remove('event',X.id);SIM.remove('port','nowhere');SIM.routeFail.length=0;}
 {const B=window._buildings.records[0];add('a doorway beyond the walkable map',CHK.buildingDoorsReachable([Object.assign({},B,{door:[1000,1000]})]));}
 return R;}
window._api={BUDGET,REG,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,shadeChecks,shadeNegatives,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome,life:()=>LIFE.OUT};
window._registered=REG.length;
window._shade={places:PLACES.length,switchback:{len:Math.round(SWB.len),grade:+SWB.grade.toFixed(3),legs:SWB.legs},pool:POOL,people:LIFE.OUT.people};
