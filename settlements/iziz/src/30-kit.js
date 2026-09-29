// ---------------------------------------------------------------- instancing kit
const KIT={defs:{},items:{},order:[]};
function kdef(name,geo,mat){KIT.defs[name]={geo,mat};KIT.items[name]=[];KIT.order.push(name);}
let KOFF=[0,0,0],KXF=null; // builder offset; optional {m,q} transform (leaning spire)
function kput(name,p,q,s,c){let P=p,Q=q;if(KXF){const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(KXF.m);P=[v.x,v.y,v.z];Q=(q?q.clone():new THREE.Quaternion()).premultiply(KXF.q);}
 const w=[P[0]+KOFF[0],P[1]+KOFF[1],P[2]+KOFF[2]];
 const t=tcur();if(t){t.inst++;t.tris+=ktri(name);}
 // A NaN here is invisible: the instance renders nowhere and takes the whole
 // InstancedMesh's bounding sphere with it. Catch it at the source, where we
 // still know which type and which kit item produced it.
 if(!finite3(w)||!(typeof s==='number'?isFinite(s):finite3(s)))TSTAT.bad.push({type:TSTAT.cur,item:name,p:w,s:s});
 KIT.items[name].push({p:w,q:Q,s,c});}
let KIT_BAKED=false;
function kbake(parent){KIT_BAKED=true;const m=new THREE.Matrix4(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),q0=new THREE.Quaternion();let tot=0;
 for(const name of KIT.order){const it=KIT.items[name];if(!it.length)continue;const def=KIT.defs[name];
  // one material clone per InstancedMesh (r128 needs it for instanceColor), but
  // Material.copy() does NOT carry onBeforeCompile, so the glass fresnel has to
  // be re-attached by hand or every instanced pane and finial loses it.
  const _m=def.mat.clone();if(def.mat.onBeforeCompile)_m.onBeforeCompile=def.mat.onBeforeCompile;
  const im=new THREE.InstancedMesh(def.geo,_m,it.length);
  it.forEach((o,i)=>{pos.set(o.p[0],o.p[1],o.p[2]);const s=typeof o.s==='number'?sc.set(o.s,o.s,o.s):sc.set(o.s[0],o.s[1],o.s[2]);
   m.compose(pos,o.q||q0,s);im.setMatrixAt(i,m);if(o.c)im.setColorAt(i,o.c);});
  if(im.instanceColor){const W=new THREE.Color(0xffffff);it.forEach((o,i)=>{if(!o.c)im.setColorAt(i,W);});}
  if(im.instanceColor)im.instanceColor.needsUpdate=true;im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;parent.add(im);tot+=it.length;}
 window._instances=tot;}
// orientation helpers
const _M=new THREE.Matrix4(),_V0=new THREE.Vector3(),_UP=new THREE.Vector3(0,1,0),_X=new THREE.Vector3(1,0,0);
function qFacing(dir){ // quaternion whose local +z points along dir (dir horizontal-ish)
 const d=new THREE.Vector3(dir[0],dir[1],dir[2]).normalize();const up=Math.abs(d.y)>.95?_X:_UP;
 _M.lookAt(d,_V0,up);return new THREE.Quaternion().setFromRotationMatrix(_M);}
function qEuler(x,y,z){return new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));}
function qAxis(ax,ay,az,a){return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(ax,ay,az).normalize(),a);}

