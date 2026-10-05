// ================================================================= SPIKE EXPORT — a region of a page's scene as glTF
// Injected into a built page by godot/tools/export_spike.py, after three.js's own GLTFExporter (r128, vendored in
// godot/tools/vendor/). Not part of any build: it is the "cheapest mesh path" GODOT-PLAN.md Phase 7 asks the spike to
// try beside the JSON exporters, run on pages that have no exporter of their own (Girder, Iziz's city).
//
//   KSPIKE.count(box)                 -> {meshes, instanced, instances, triangles} the region would hold
//   KSPIKE.gltf(box, opt) (async)     -> {b64, bytes, stats, dropped}: a .glb of the region, base64
//
// box = [x0, z0, x1, z1] in world metres. A plain mesh keeps the triangles whose world centroid lies in the box.
// glTF r128 has no instancing (EXT_mesh_gpu_instancing came later), so an InstancedMesh becomes ONE merged mesh of
// its instances whose origin lies in the box, the instance colour baked into vertex colours. What that loses
// (per-instance attributes such as a foliage normal, shader hooks, ShaderMaterials) is counted in `dropped`, which
// the spike's gap list reads. Nothing here changes the page's scene.
(function(){
'use strict';
const T=THREE;
const inBox=(b,x,z)=>x>=b[0]&&z>=b[1]&&x<b[2]&&z<b[3];
const isDrawn=o=>o.visible!==false&&(o.isMesh)&&!o.isSkinnedMesh&&o.geometry&&o.geometry.attributes.position;
// every ancestor visible, so a hidden LOD level or a hidden interior is not exported
const shown=o=>{for(let p=o;p;p=p.parent)if(p.visible===false)return false;return true;};
function triCount(g){return (g.index?g.index.count:g.attributes.position.count)/3;}

const KSPIKE={};
KSPIKE.count=function(box){const s={meshes:0,instanced:0,instances:0,triangles:0},v=new T.Vector3(),M=new T.Matrix4();
 scene.updateMatrixWorld(true);
 scene.traverse(o=>{if(!isDrawn(o)||!shown(o))return;const g=o.geometry,tri=triCount(g);
  if(o.isInstancedMesh){let k=0;for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);v.setFromMatrixPosition(M).applyMatrix4(o.matrixWorld);if(inBox(box,v.x,v.z))k++;}
   if(k){s.instanced++;s.instances+=k;s.triangles+=k*tri;}return;}
  if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox.clone().applyMatrix4(o.matrixWorld);
  if(bb.max.x<box[0]||bb.min.x>=box[2]||bb.max.z<box[1]||bb.min.z>=box[3])return;
  const P=g.attributes.position,I=g.index,W=o.matrixWorld,a=new T.Vector3();let k=0;
  for(let t=0;t<tri;t++){let x=0,z=0;for(let j=0;j<3;j++){a.fromBufferAttribute(P,I?I.getX(t*3+j):t*3+j).applyMatrix4(W);x+=a.x;z+=a.z;}if(inBox(box,x/3,z/3))k++;}
  if(k){s.meshes++;s.triangles+=k;}});
 return s;};

// a non-indexed, world-space copy of geometry g under matrix W, keeping triangles whose centroid lies in the box
// (keep(tri) decides; null keeps all). Attributes kept: position, normal, uv, color (rgb). col multiplies colour.
function bake(g,W,keep,col,out){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,C=g.attributes.color,I=g.index;
 const nm=new T.Matrix3().getNormalMatrix(W),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),n=new T.Vector3();
 const tris=I?I.count/3:P.count/3,vi=t=>I?I.getX(t):t;
 for(let t=0;t<tris;t++){const i0=vi(t*3),i1=vi(t*3+1),i2=vi(t*3+2);
  a.fromBufferAttribute(P,i0).applyMatrix4(W);b.fromBufferAttribute(P,i1).applyMatrix4(W);c.fromBufferAttribute(P,i2).applyMatrix4(W);
  if(keep&&!keep((a.x+b.x+c.x)/3,(a.z+b.z+c.z)/3))continue;
  for(const [i,p] of [[i0,a],[i1,b],[i2,c]]){out.pos.push(p.x,p.y,p.z);
   if(N){n.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();out.nor.push(n.x,n.y,n.z);}
   if(U)out.uv.push(U.getX(i),U.getY(i));
   const r=C?C.getX(i):1,gg=C?C.getY(i):1,bb=C?C.getZ(i):1;out.col.push(r*col[0],gg*col[1],bb*col[2]);}}}
// one indexed geometry, each distinct vertex once (quantised: 0.1 mm, normals and colours to 1/1000, uvs to 1/10000)
function toGeo(o,hasN,hasU){const nV=o.pos.length/3,map=new Map(),P=[],N=[],U=[],C=[],I=new Uint32Array(nV);hasN=hasN&&o.nor.length;hasU=hasU&&o.uv.length;
 const q=(x,s)=>Math.round(x*s);
 for(let i=0;i<nV;i++){const k=q(o.pos[i*3],1e4)+','+q(o.pos[i*3+1],1e4)+','+q(o.pos[i*3+2],1e4)+
   (hasN?','+q(o.nor[i*3],1e3)+','+q(o.nor[i*3+1],1e3)+','+q(o.nor[i*3+2],1e3):'')+(hasU?','+q(o.uv[i*2],1e4)+','+q(o.uv[i*2+1],1e4):'')+
   ','+q(o.col[i*3],1e3)+','+q(o.col[i*3+1],1e3)+','+q(o.col[i*3+2],1e3);
  let j=map.get(k);if(j===undefined){j=P.length/3;map.set(k,j);P.push(o.pos[i*3],o.pos[i*3+1],o.pos[i*3+2]);
   if(hasN)N.push(o.nor[i*3],o.nor[i*3+1],o.nor[i*3+2]);if(hasU)U.push(o.uv[i*2],o.uv[i*2+1]);C.push(o.col[i*3],o.col[i*3+1],o.col[i*3+2]);}
  I[i]=j;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));
 if(hasU)g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setAttribute('color',new T.Float32BufferAttribute(C,3));
 g.setIndex(new T.BufferAttribute(P.length/3<65536?Uint16Array.from(I):I,1));
 if(hasN)g.setAttribute('normal',new T.Float32BufferAttribute(N,3));else g.computeVertexNormals();return g;}

// glTF r128 writes images through a 2D canvas: a DataTexture (no drawable image) would throw, so it becomes a canvas
// when it is 8-bit RGBA, and is dropped otherwise (counted)
function exportableMap(t,dropped){if(!t||!t.image)return null;const im=t.image;
 if(im instanceof HTMLImageElement||im instanceof HTMLCanvasElement||(typeof ImageBitmap!=='undefined'&&im instanceof ImageBitmap))return t;
 if(im.data&&im.width&&im.height&&im.data instanceof Uint8Array&&im.data.length===im.width*im.height*4){
  const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(im.data),im.width,im.height),0,0);
  const c=t.clone();c.image=cv;c.needsUpdate=true;return c;}
 dropped.dataTextures=(dropped.dataTextures||0)+1;return null;}
const MAPS=['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap','alphaMap'];
function exportMat(m,vertexColours,dropped,cache){const key=m.uuid+'|'+vertexColours;if(cache.has(key))return cache.get(key);let r;
 if(m.isShaderMaterial||m.isRawShaderMaterial){dropped.shaderMaterials=(dropped.shaderMaterials||0)+1;
  r=new T.MeshStandardMaterial({color:(m.uniforms&&m.uniforms.color&&m.uniforms.color.value&&m.uniforms.color.value.isColor)?m.uniforms.color.value:0xff00ff,vertexColors:vertexColours});
  r.name=(m.name||m.type)+' (ShaderMaterial stand-in)';}
 else{r=m.clone();r.vertexColors=vertexColours||m.vertexColors;
  for(const k of MAPS)if(r[k])r[k]=exportableMap(r[k],dropped);
  if(m.onBeforeCompile&&m.onBeforeCompile!==T.Material.prototype.onBeforeCompile){dropped.hookedMaterials=(dropped.hookedMaterials||0)+1;
   r.userData=Object.assign({},m.userData,{krator_hooked:true});}}
 if(!r.name)r.name=m.name||m.type;cache.set(key,r);return r;}

KSPIKE.gltf=function(box,opt){opt=opt||{};const dropped={},mats=new Map(),root=new T.Group(),M=new T.Matrix4(),W=new T.Matrix4(),v=new T.Vector3(),ic=new T.Color();
 root.name=opt.name||'region';root.userData={krator_spike:{box,page:location.pathname,convention:'metres, +Y up, x east, z south (glTF)'}};
 scene.updateMatrixWorld(true);let n=0,tris=0;
 scene.traverse(o=>{if(!isDrawn(o)||!shown(o))return;if(Array.isArray(o.material)){dropped.multiMaterial=(dropped.multiMaterial||0)+1;return;}
  const g=o.geometry,hasN=!!g.attributes.normal,hasU=!!g.attributes.uv,extra=Object.keys(g.attributes).filter(k=>!['position','normal','uv','color','uv2'].includes(k));
  if(extra.length){dropped.attributes=dropped.attributes||{};for(const k of extra)dropped.attributes[k]=(dropped.attributes[k]||0)+1;}
  const out={pos:[],nor:[],uv:[],col:[]};
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);W.multiplyMatrices(o.matrixWorld,M);v.setFromMatrixPosition(W);if(!inBox(box,v.x,v.z))continue;
    let col=[1,1,1];if(o.instanceColor){ic.fromArray(o.instanceColor.array,i*3);col=[ic.r,ic.g,ic.b];}bake(g,W,null,col,out);}}
  else{if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox.clone().applyMatrix4(o.matrixWorld);
   if(bb.max.x<box[0]||bb.min.x>=box[2]||bb.max.z<box[1]||bb.min.z>=box[3])return;
   bake(g,o.matrixWorld,(x,z)=>inBox(box,x,z),[1,1,1],out);}
  if(!out.pos.length)return;
  const vc=!!(o.isInstancedMesh&&o.instanceColor)||!!g.attributes.color;
  const mesh=new T.Mesh(toGeo(out,hasN,hasU),exportMat(o.material,vc,dropped,mats));
  mesh.name=(o.name||o.parent&&o.parent.name||o.material.name||'mesh').replace(/[^\w.:-]/g,'_')+'_'+(n++);
  const ud={};for(const k in o.userData){const x=o.userData[k];if(x==null||typeof x!=='object'||Array.isArray(x)||Object.getPrototypeOf(x)===Object.prototype)ud[k]=x;}
  if(o.isInstancedMesh)ud.krator_instanced=true;mesh.userData=ud;
  tris+=out.pos.length/9;root.add(mesh);});
 const stats={meshes:n,triangles:tris,materials:mats.size};
 return new Promise((res,rej)=>{try{new T.GLTFExporter().parse(root,ab=>{const u=new Uint8Array(ab);let s='';const K=0x8000;
   for(let i=0;i<u.length;i+=K)s+=String.fromCharCode.apply(null,u.subarray(i,i+K));res({b64:btoa(s),bytes:u.length,stats,dropped});},
   {binary:true,onlyVisible:true,maxTextureSize:opt.maxTextureSize||1024});}catch(e){rej(e);}});};
window.KSPIKE=KSPIKE;
})();
