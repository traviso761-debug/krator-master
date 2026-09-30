// ---------------------------------------------------------------- probe (window._api): the Ancients-kit contract, for vessels
const BUDGET={showcase:{tris:2600000,calls:260},cls:{small:60000,medium:160000,large:280000},type:{}};
function rsTypeCls(k){const D=RS.defs[k];return BUDGET.type[k]||(D.L<16?'small':D.L<34?'medium':'large');}
function _probePoints(){const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){o.updateMatrixWorld();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.premultiply(o.matrixWorld);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  const pa=o.geometry.attributes.position;const step=Math.max(1,Math.floor(pa.count/400));const v=new THREE.Vector3();
  for(let i=0;i<pa.count;i+=step){v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);pts.push([v.x,v.y,v.z]);}});
 return pts;}
function regOccupancy(){const n=new Array(REG.length).fill(0);for(const p of _probePoints())REG.forEach((r,i)=>{const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;});
 return REG.map((r,i)=>({name:r.name,type:r.key,n:n[i]}));}
function nanSweep(){const bad=[];scene.traverse(o=>{if(!o.isMesh||(o.userData&&o.userData.probeSkip))return;const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({mesh:o.name,at:i,n:a.length});break;}});
 return{meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}
function typeStats(){const out={};for(const k in TSTAT.by){const t=TSTAT.by[k],cls=rsTypeCls(k);out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
function tagAudit(){const bad=REG.filter(r=>!r.cls||!r.tags||!r.tags.culture||!r.tags.type||!r.tags.wealth||!r.tags.propulsion||!r.tags.hull);return{bad:bad.length,first:bad.slice(0,6).map(r=>r.name)};}
// vessel invariants (verify.py --assert runs these through _api.extra())
function rsExtra(){const R=[];const P=RS_PLACED;
 // 1. every vessel floats: its lowest point is under the sea and its sheer is above it
 {const bad=P.filter(p=>!(p.bb.min.y<-.1&&p.bb.max.y>1));R.push({name:'vessels-float',ok:!bad.length,detail:bad.length?bad.map(p=>p.D.name+' y '+p.bb.min.y.toFixed(2)+'..'+p.bb.max.y.toFixed(2)).join(' | '):P.length+' vessels straddle the waterline'});}
 // 2. no two vessels' boxes overlap (sails and oars included)
 {const hits=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i].bb.clone().expandByScalar(1),b=P[j].bb;if(a.intersectsBox(b))hits.push(P[i].D.name+' x '+P[j].D.name);}
  R.push({name:'no-vessel-overlap',ok:!hits.length,detail:hits.length?hits.join(' | '):'clean'});}
 // 3. declared L/B/H agree with the built box (the layout and the camera presets trust them)
 {const bad=[];for(const p of P){const s=p.bb.getSize(new THREE.Vector3());const L=s.x,H=p.bb.max.y;if(L>p.D.L*1.45||L<p.D.L*.75||H>p.D.H*1.3||H<p.D.H*.6)bad.push(p.D.name+' built '+L.toFixed(1)+'x'+H.toFixed(1)+' vs declared L'+p.D.L+' H'+p.D.H);}
  R.push({name:'declared-size-matches',ok:!bad.length,detail:bad.length?bad.join(' | '):'L and H within tolerance for all'});}
 // 4. oar blades reach the water at the catch: each bank is posed at its catch and its lowest blade tip must be under y=0.2
 {const bad=[];const m=new THREE.Matrix4(),v=new THREE.Vector3();for(const p of P)p.G.children.filter(o=>o.isInstancedMesh).forEach(im=>{let lo=1e9;const g=im.geometry;g.computeBoundingBox();if(im.userData.pose)im.userData.pose(im.userData.tCatch);
   for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);v.set(0,0,g.boundingBox.max.z).applyMatrix4(m);lo=Math.min(lo,v.y);}if(lo>.2)bad.push(p.D.name+' '+im.name+' tip '+lo.toFixed(2));});
  R.push({name:'oars-reach-water',ok:!bad.length,detail:bad.length?bad.join(' | '):'every bank dips'});}
 // 5. sails clear the cabins: no sail vertex inside a registered solid (castles, deckhouses)
 {const bad=[];for(const p of P){const S=p.G.userData.solids||[],Q=p.G.userData.sail||[];let n=0;for(const q of Q)for(const b of S){if(q[0]>b.min[0]+.05&&q[0]<b.max[0]-.05&&q[1]>b.min[1]+.05&&q[1]<b.max[1]-.05&&q[2]>b.min[2]+.05&&q[2]<b.max[2]-.05){n++;break;}}if(n)bad.push(p.D.name+' '+n+' sail pts');}
  R.push({name:'sails-clear-cabins',ok:!bad.length,detail:bad.length?bad.join(' | '):'no sail passes through a cabin'});}
 // 6. project tags
 {const t=tagAudit();R.push({name:'tags-complete',ok:!t.bad,detail:t.bad?t.first.join(' | '):REG.length+' vessels tagged culture/type/wealth/propulsion/hull'});}
 return R;}
window._api={BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}return{tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,tagAudit,extra:rsExtra,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 pause:(t)=>{window._rsPause=t==null?0:t;},
 defs:()=>RS.order.map(k=>{const D=RS.defs[k];return{key:k,name:D.name,culture:D.culture,tags:D.tags,L:D.L,B:D.B,H:D.H};})};
