// ---------------------------------------------------------------- probe (window._api)
// Everything verify.py --assert measures from inside the page. Adapted from
// voth/ancients/src/91-probe.js: the six ancients invariants unchanged, the
// budget classes read from each registration's `cls`, and two port checks
// exposed through _api.extra() (verify.py appends them).
//
// Budgets (scene content: every triangle a builder emitted, instances
// expanded). A showcase over its ceiling reports OVER without failing unless
// --strict-budget. 'env' is the terrain and the sea.
const BUDGET={
 showcase:{tris:9000000,calls:900},
 cls:Object.assign({env:2500000},PORT_CLS),
};
function portClsOf(statKey){const base=statKey.split('/')[0];if(base==='env')return 'env';
 const R=portRegOf(base);return R?R.cls:'seg';}

// --- sample points, one pass over the scene ---------------------------------
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 const bb=new THREE.Box3();
 scene.traverse(o=>{
  if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;
  bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);
  for(const x of [bb.min.x,bb.max.x])for(const y of [bb.min.y,bb.max.y])for(const z of [bb.min.z,bb.max.z])pts.push([x,y,z]);
  // PORT: pbFlush merges a whole segment's walls and slabs into one mesh per
  // material, whose box spans the segment - so its corners say nothing about
  // a hulk or a basin wall inside it. Sample up to 3000 of its vertices too.
  const pa=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;
  if(pa&&pa.count>8){o.updateMatrixWorld();const st=Math.max(1,Math.floor(pa.count/3000)),v=new THREE.Vector3();
   for(let i=0;i<pa.count;i+=st){v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);pts.push([v.x,v.y,v.z]);}}
 });
 return pts;}

// --- invariant 1: every REGISTER volume actually contains something ---------
function regOccupancy(){
 const BK=250,by={};
 REG.forEach((r,i)=>{const z0=Math.floor((r.z-r.r)/BK),z1=Math.floor((r.z+r.r)/BK);
  for(let b=z0;b<=z1;b++)(by[b]||(by[b]=[])).push(i);});
 const n=new Array(REG.length).fill(0);
 for(const p of _probePoints()){const cand=by[Math.floor(p[2]/BK)];if(!cand)continue;
  for(const i of cand){const r=REG[i];const dx=p[0]-r.x,dz=p[2]-r.z;
   if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;}}
 return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}

// --- invariant 2: nothing sitting at NaN ------------------------------------
function nanSweep(){
 const bad=[];
 scene.traverse(o=>{
  if(!o.isMesh||(o.userData&&o.userData.probeSkip&&o.name!=='terrain'))return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;
  const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.geometry.type,name:o.name,at:i,n:a.length});break;}
 });
 return {meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}

// --- per-type totals ---------------------------------------------------------
function typeStats(){
 const out={};
 for(const k in TSTAT.by){const t=TSTAT.by[k];const cls=portClsOf(k);const lim=BUDGET.cls[cls];
  out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:lim,over:t.tris>lim};}
 return out;}

// --- port checks -------------------------------------------------------------
// port-stamps-inside-footprint: a stamp's HARD shape must lie inside its own
// segment's footprint [-W/2,W/2] x [-LAND,SEA] (soft rings may spill; that is
// what they are for). The one exception is portEdgeStamps' strip outside a
// side whose neighbour is open sea, which carries `outside:true`.
// port-clearance (soft, reported like a budget): registered volumes should
// stand CLEAR (8 m) inside the footprint's x edges and z extremes.
function portChecks(){const R=[],bad=[],near=[];
 const byOwner={};PORT_LAYOUT.items.forEach((it,i)=>{byOwner[it.key+'/'+it.d+'@'+i]=it;});
 for(const s of PORT_ST.list){if(s.owner==='layout'||s.outside)continue;const it=byOwner[s.owner];if(!it)continue;
  const G=portRegOf(it.key);const e=.02;
  if(s.x0<it.gx-G.W/2-e||s.x1>it.gx+G.W/2+e||s.z0<it.gz-G.LAND-e||s.z1>it.gz+G.SEA+e)
   bad.push(s.owner+' '+s.kind+' ['+(s.x0-it.gx).toFixed(1)+','+(s.z0-it.gz).toFixed(1)+' .. '+(s.x1-it.gx).toFixed(1)+','+(s.z1-it.gz).toFixed(1)+']');}
 R.push({name:'port-stamps-inside-footprint',ok:!bad.length,detail:bad.length?bad.length+' stamps: '+bad.slice(0,4).join(' | '):PORT_ST.list.length+' stamps, all inside their footprints'});
 for(const it of PORT_LAYOUT.items){if(it.vessel===true)continue;const G=portRegOf(it.key);if(!G)continue;const C=PORT.CLEAR-.5;
  for(const r of REG){if(r.type!==it.key)continue;if(Math.abs(r.x-it.gx)>G.W/2+1||r.z<it.gz-G.LAND-1||r.z>it.gz+G.SEA+1)continue;
   if(r.x-r.r<it.gx-G.W/2+C||r.x+r.r>it.gx+G.W/2-C||r.z-r.r<it.gz-G.LAND+C||r.z+r.r>it.gz+G.SEA-C)near.push(it.key+'/'+it.d+' '+r.name);}}
 R.push({name:'port-clearance',ok:!near.length,budget:true,detail:near.length?near.length+' volumes inside the 8 m clearance: '+[...new Set(near)].slice(0,5).join(' | '):'all registered volumes clear of the footprint edges'});
 return R;}

window._api={
 BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}
  return {tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,extra:portChecks,
 layout:()=>PORT_LAYOUT.items.map(it=>({key:it.key,d:it.d,gx:it.gx,gz:it.gz,nb:it.nb,stat:it.stat,vessel:it.vessel===true})),
 terrainH:(x,z)=>terrainH(x,z),
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),
 views:()=>Object.keys(VIEWS),
};
