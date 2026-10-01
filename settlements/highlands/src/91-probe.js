// ---------------------------------------------------------------- probe (window._api) — same contract as the Ancients kit's, so verify.py runs unchanged
const BUDGET={
 showcase:{tris:4500000,calls:450},   // round 7c: the kit showcase grew (the frame, four salvage buildings)
 cls:{small:60000,medium:250000,sky:400000,mega:700000},
 type:{},   // every vernacular key defaults to 'medium'
};
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();const bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);
  for(const x of[bb.min.x,bb.max.x])for(const y of[bb.min.y,bb.max.y])for(const z of[bb.min.z,bb.max.z])pts.push([x,y,z]);});
 // the catalog furniture is merged page-wide (89y), so its meshes' boxes say nothing: each placed piece is a sample
 if(typeof HLF!=='undefined'&&HLF.on)for(const r of HLF.placed)pts.push([r.x,r.y+.5,r.z]);
 return pts;}
function regOccupancy(){const BK=100,by={};REG.forEach((r,i)=>{const z0=Math.floor((r.z-r.r)/BK),z1=Math.floor((r.z+r.r)/BK);for(let b=z0;b<=z1;b++)(by[b]||(by[b]=[])).push(i);});
 const n=new Array(REG.length).fill(0);for(const p of _probePoints()){const cand=by[Math.floor(p[2]/BK)];if(!cand)continue;for(const i of cand){const r=REG[i];const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;}}
 return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}
function nanSweep(){const bad=[];scene.traverse(o=>{if(!o.isMesh||(o.userData&&o.userData.probeSkip))return;const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.geometry.type,at:i,n:a.length});break;}});
 return{meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}
function typeStats(){const out={};for(const k in TSTAT.by){const t=TSTAT.by[k],base=k.split('/')[0];const cls=BUDGET.type[base]||'medium';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
// tag audit: every registered volume must carry a classification and the project tags
function tagAudit(){const bad=REG.filter(r=>!r.cls||!r.tags||!r.tags.culture||!r.tags.type||!r.tags.wealth);return{bad:bad.length,first:bad.slice(0,6).map(r=>r.name)};}
window._api={BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}return{tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,tagAudit,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 defs:()=>VERN.order.map(k=>{const D=VERN.defs[k];return{key:k,name:D.name,family:D.family,tags:D.tags,w:D.w,d:D.d,h:D.h};})};
