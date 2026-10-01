// ---------------------------------------------------------------- probe (window._api)
// Everything verify.py --assert measures from inside the page. Nothing here
// runs at load time except building the index: the expensive sweeps are
// functions, called only when the harness asks for them, so a normal page load
// pays nothing for them.
//
// Add an invariant here every time a bug costs more than one round to find.

// Per-type triangle budgets, from the brief. The number counted is scene
// content (every triangle a builder put in the world, instances expanded), NOT
// renderer.info.render.triangles, which depends on where the camera happens to
// be pointing. The two answer different questions; --assert checks both.
const BUDGET={
 showcase:{tris:6000000,calls:900},
 cls:{small:60000,medium:250000,sky:400000,mega:700000},
 type:{house:'small',house2:'small',fuel:'small',radar:'small',dish:'small',police:'small',
       skyA:'sky',skyB:'sky',skyC:'sky',skyD:'sky',skyE:'sky',skyF:'sky',skyG:'sky',skyH:'sky',skyI:'sky',skyJ:'sky',skyK:'sky',lighthouse:'sky',
       mega:'mega',arc:'mega',dam:'mega',campus:'mega',spire:'mega',dalab:'mega',canyon:'mega',veladiga:'mega',hex:'mega',hexlush:'mega',biome:'mega',forest:'mega',darco:'mega',ring:'mega',launch:'mega',launchpad:'mega',plymouth:'mega',arcbeam:'mega',arcoindian:'mega',arcoindian2:'mega',hill:'mega',arcube:'mega',wing:'mega',drum:'mega',blades:'mega',trigon:'mega',monolith:'mega',crescent:'mega',ledge:'mega',wheel:'mega',
       fac:'medium',port:'medium',gov:'medium',lib:'medium',bunk:'medium',off:'medium',
       apt:'medium',amph:'medium',lab:'medium',robo:'medium',dc:'medium',hosp:'medium',hotel:'medium',
       altBole:'sky',altStack:'sky',altFlat:'sky',altHotel:'medium',altCult:'medium',altPerch:'mega',
       altGate:'mega',altCampus:'mega',altPolice:'small'},
};
// alternate domestic types (src/8ak-alt-*, target alt-domestic)
Object.assign(BUDGET.type,{adWave:'small',adBridge:'small',adFuel:'small',adRadar:'small',adDish:'small',adFins:'medium',adAmph:'medium',adFac:'medium',adLab:'medium',adMega:'mega'});
// the Yuni fork's variants (src/8am-yv-*, target yuni-variants)
Object.assign(BUDGET.type,{yvQuad:'medium',yvComb:'medium',yvTerr:'medium',yvDish:'small',yvHosp:'medium'});
// tower stumps (src/8an-iz-stumps.js, target iziz-variants)
Object.assign(BUDGET.type,{stumpA:'sky',stumpB:'sky',stumpC:'sky',stumpD:'sky',stumpE:'sky',stumpF:'sky',stumpG:'sky',stumpH:'sky',stumpI:'sky',stumpJ:'sky',stumpK:'sky'});

// --- sample points, one pass over the scene ---------------------------------
// An instanced item contributes its translation; a mesh contributes its world
// bounding-box centre and corners. Enough to answer "is there anything at all
// inside this registered volume", which is the question that catches a builder
// that registered a cylinder it never filled.
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
 });
 return pts;}

// --- invariant 1: every REGISTER volume actually contains something ---------
function regOccupancy(){
 const BK=250,by={};                                  // z-buckets, so this is not 80 x 200k
 REG.forEach((r,i)=>{const z0=Math.floor((r.z-r.r)/BK),z1=Math.floor((r.z+r.r)/BK);
  for(let b=z0;b<=z1;b++)(by[b]||(by[b]=[])).push(i);});
 const n=new Array(REG.length).fill(0);
 for(const p of _probePoints()){const cand=by[Math.floor(p[2]/BK)];if(!cand)continue;
  for(const i of cand){const r=REG[i];const dx=p[0]-r.x,dz=p[2]-r.z;
   if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;}}
 return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}

// --- invariant 2: nothing sitting at NaN ------------------------------------
// TSTAT.bad catches instanced items at the moment they are placed. This catches
// the other half: a surface whose fn() returned NaN for some (u,v), which shows
// up as a hole on a real GPU and as nothing at all under SwiftShader.
function nanSweep(){
 const bad=[];
 scene.traverse(o=>{
  if(!o.isMesh||(o.userData&&o.userData.probeSkip))return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;
  const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.geometry.type,at:i,n:a.length});break;}
 });
 return {meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}

// --- per-type totals ---------------------------------------------------------
function typeStats(){
 const out={};
 for(const k in TSTAT.by){const t=TSTAT.by[k],base=k.split('/')[0];
  const cls=BUDGET.type[base]||'medium';
  out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}
 return out;}

window._api={
 BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}
  return {tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),
 views:()=>Object.keys(VIEWS),
};
