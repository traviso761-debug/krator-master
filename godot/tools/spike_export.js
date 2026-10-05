// ================================================================= SPIKE EXPORT — a region of a page's scene as glTF
// Injected into a built page by godot/tools/export_spike.py, after three.js's own GLTFExporter (r128, vendored in
// godot/tools/vendor/). Not part of any build: it is the "cheapest mesh path" GODOT-PLAN.md Phase 7 asks the spike to
// try beside the JSON exporters, run on pages that have no exporter of their own (Girder, Iziz's city).
//
//   KSPIKE.count(box)                 -> {meshes, instanced, instances, triangles} the region would hold
//   KSPIKE.gltf(box, opt) (async)     -> {b64, bytes, stats, dropped}: a .glb of the region, base64
//
// box = [x0, z0, x1, z1] in world metres. A plain mesh keeps the triangles whose world centroid lies in the box.
// An InstancedMesh becomes its base geometry once plus EXT_mesh_gpu_instancing (the instances whose origin lies in the
// box: TRS and colour), added after three r128's exporter, which has no instancing; opt.instancing:false merges them
// into one mesh instead, the instance colour baked into vertex colours. What that loses
// (per-instance attributes such as a foliage normal, shader hooks, ShaderMaterials) is counted in `dropped`, which
// the spike's gap list reads. Nothing here changes the page's scene.
(function(){
'use strict';
const T=THREE;
const inBox=(b,x,z)=>x>=b[0]&&z>=b[1]&&x<b[2]&&z<b[3];
const isDrawn=o=>o.visible!==false&&(o.isMesh)&&!o.isSkinnedMesh&&o.geometry&&o.geometry.attributes.position;
// every ancestor visible, so a hidden LOD level or a hidden interior is not exported
const shown=o=>{for(let p=o;p;p=p.parent)if(p.visible===false)return false;return true;};
// core/lod's render copies (userData.lodCopy, on the copy or on the LOD root above it): the page draws them in place of
// the originals it keeps with full detail and every tag, so only the originals are exported (Godot's own LOD does the rest)
const lodCopy=o=>{for(let p=o;p;p=p.parent)if(p.userData&&p.userData.lodCopy)return true;return false;};
function triCount(g){return (g.index?g.index.count:g.attributes.position.count)/3;}

const KSPIKE={};
KSPIKE.count=function(box){const s={meshes:0,instanced:0,instances:0,triangles:0},v=new T.Vector3(),M=new T.Matrix4();
 scene.updateMatrixWorld(true);
 scene.traverse(o=>{if(!isDrawn(o)||!shown(o)||lodCopy(o))return;const g=o.geometry,tri=triCount(g);
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
   const cc=colAt(C,i);out.col.push(cc[0]*col[0],cc[1]*col[1],cc[2]*col[2]);}}}
// a vertex colour as linear floats. three r128's getX() does not scale a normalized attribute, so an 8-bit colour
// (the catalog furniture batch's) came out as 0..255 and clipped to white. 8-bit colours are the catalog's sRGB bytes
// (the builds linearise them in a shader hook: KFURN.srgbHook): scaled and linearised here. Floats are linear already.
const SRGB8=(function(){const t=new Float32Array(256);for(let i=0;i<256;i++){const v=i/255;t[i]=v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);}return t;})();
function colAt(C,i){if(!C)return[1,1,1];const a=C.array,k=C.itemSize,o=i*k;
 if(a instanceof Uint8Array||a instanceof Uint8ClampedArray)return[SRGB8[a[o]],SRGB8[a[o+1]],SRGB8[a[o+2]]];
 if(a instanceof Uint16Array)return[a[o]/65535,a[o+1]/65535,a[o+2]/65535];
 return[a[o],a[o+1],a[o+2]];}
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

// EXT_mesh_gpu_instancing, added to the .glb after three's exporter (r128 does not write it): per instance TRANSLATION,
// ROTATION, SCALE and a custom _COLOR (linear rgb), on the node that holds the instanced mesh's base geometry.
// Godot 4.5 does not import the extension itself; godot/krator/gltf_instancing.gd (a GLTFDocumentExtension) does.
function addInstancing(ab,table){
 const dv=new DataView(ab),jl=dv.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,20,jl)));
 const bo=20+jl,bl=dv.getUint32(bo,true),bin=new Uint8Array(ab,bo+8,bl),extra=[];let off=bl;
 const add=(f32,type)=>{while(off%4)off++;const view={buffer:0,byteOffset:off,byteLength:f32.byteLength};json.bufferViews.push(view);
  extra.push([off,f32]);off+=f32.byteLength;json.accessors.push({bufferView:json.bufferViews.length-1,componentType:5126,count:f32.length/(type==='VEC4'?4:3),type});
  return json.accessors.length-1;};
 let n=0;(json.nodes||[]).forEach(nd=>{const t=table[nd.name];if(!t)return;
  const attrs={TRANSLATION:add(t.t,'VEC3'),ROTATION:add(t.r,'VEC4'),SCALE:add(t.s,'VEC3')};if(t.c)attrs._COLOR=add(t.c,'VEC3');
  nd.extensions=Object.assign(nd.extensions||{},{EXT_mesh_gpu_instancing:{attributes:attrs}});n++;});
 if(!n)return ab;
 json.extensionsUsed=Array.from(new Set((json.extensionsUsed||[]).concat(['EXT_mesh_gpu_instancing'])));
 while(off%4)off++;json.buffers[0].byteLength=off;
 const nb=new Uint8Array(off);nb.set(bin);for(const [o,f] of extra)nb.set(new Uint8Array(f.buffer,f.byteOffset,f.byteLength),o);
 let js=new TextEncoder().encode(JSON.stringify(json));const jp=(4-js.length%4)%4;if(jp){const t=new Uint8Array(js.length+jp);t.set(js);t.fill(32,js.length);js=t;}
 const total=12+8+js.length+8+nb.length,out=new Uint8Array(total),o=new DataView(out.buffer);
 o.setUint32(0,0x46546C67,true);o.setUint32(4,2,true);o.setUint32(8,total,true);o.setUint32(12,js.length,true);o.setUint32(16,0x4E4F534A,true);out.set(js,20);
 o.setUint32(20+js.length,nb.length,true);o.setUint32(24+js.length,0x004E4942,true);out.set(nb,28+js.length);return out.buffer;}

KSPIKE.gltf=function(box,opt){opt=opt||{};const dropped={},mats=new Map(),root=new T.Group(),M=new T.Matrix4(),W=new T.Matrix4(),v=new T.Vector3(),ic=new T.Color();
 const instancing=opt.instancing!==false,itable={},q=new T.Quaternion(),sc=new T.Vector3(),I4=new T.Matrix4();let ninst=0,nimesh=0;
 root.name=opt.name||'region';root.userData={krator_spike:{box,page:location.pathname,convention:'metres, +Y up, x east, z south (glTF)'}};
 scene.updateMatrixWorld(true);let n=0,tris=0;
 scene.traverse(o=>{if(!isDrawn(o)||!shown(o))return;if(lodCopy(o)){dropped.lodCopies=(dropped.lodCopies||0)+1;return;}if(Array.isArray(o.material)){dropped.multiMaterial=(dropped.multiMaterial||0)+1;return;}
  const g=o.geometry,hasN=!!g.attributes.normal,hasU=!!g.attributes.uv,extra=Object.keys(g.attributes).filter(k=>!['position','normal','uv','color','uv2'].includes(k));
  if(extra.length){dropped.attributes=dropped.attributes||{};for(const k of extra)dropped.attributes[k]=(dropped.attributes[k]||0)+1;}
  const out={pos:[],nor:[],uv:[],col:[]};
  let inst=null;
  if(o.isInstancedMesh&&instancing){const T3=[],R4=[],S3=[],C3=[];   // the base geometry once; the instances as TRS
   for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);W.multiplyMatrices(o.matrixWorld,M);v.setFromMatrixPosition(W);if(!inBox(box,v.x,v.z))continue;
    W.decompose(v,q,sc);T3.push(v.x,v.y,v.z);R4.push(q.x,q.y,q.z,q.w);S3.push(sc.x,sc.y,sc.z);
    if(o.instanceColor){ic.fromArray(o.instanceColor.array,i*3);C3.push(ic.r,ic.g,ic.b);}}
   if(!T3.length)return;bake(g,I4,null,[1,1,1],out);
   inst={t:new Float32Array(T3),r:new Float32Array(R4),s:new Float32Array(S3),c:C3.length?new Float32Array(C3):null};}
  else if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);W.multiplyMatrices(o.matrixWorld,M);v.setFromMatrixPosition(W);if(!inBox(box,v.x,v.z))continue;
    let col=[1,1,1];if(o.instanceColor){ic.fromArray(o.instanceColor.array,i*3);col=[ic.r,ic.g,ic.b];}bake(g,W,null,col,out);}}
  else{if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox.clone().applyMatrix4(o.matrixWorld);
   if(bb.max.x<box[0]||bb.min.x>=box[2]||bb.max.z<box[1]||bb.min.z>=box[3])return;
   bake(g,o.matrixWorld,(x,z)=>inBox(box,x,z),[1,1,1],out);}
  if(!out.pos.length)return;
  const vc=!!(o.isInstancedMesh&&o.instanceColor&&!inst)||!!g.attributes.color;
  const mesh=new T.Mesh(toGeo(out,hasN,hasU),exportMat(o.material,vc,dropped,mats));
  mesh.name=(o.name||o.parent&&o.parent.name||o.material.name||'mesh').replace(/[^\w.:-]/g,'_')+'_'+(n++);
  const ud={};for(const k in o.userData){const x=o.userData[k];if(x==null||typeof x!=='object'||Array.isArray(x)||Object.getPrototypeOf(x)===Object.prototype)ud[k]=x;}
  if(o.isInstancedMesh)ud.krator_instanced=inst?'EXT_mesh_gpu_instancing':'merged';mesh.userData=ud;
  if(inst){itable[mesh.name]=inst;ninst+=inst.t.length/3;nimesh++;tris+=out.pos.length/9*inst.t.length/3;}else tris+=out.pos.length/9;
  root.add(mesh);});
 const stats={meshes:n,triangles:tris,materials:mats.size,instancedMeshes:nimesh,instances:ninst};
 return new Promise((res,rej)=>{try{new T.GLTFExporter().parse(root,ab0=>{const ab=instancing?addInstancing(ab0,itable):ab0,u=new Uint8Array(ab);let s='';const K=0x8000;
   for(let i=0;i<u.length;i+=K)s+=String.fromCharCode.apply(null,u.subarray(i,i+K));res({b64:btoa(s),bytes:u.length,stats,dropped});},
   {binary:true,onlyVisible:true,maxTextureSize:opt.maxTextureSize||1024});}catch(e){rej(e);}});};
window.KSPIKE=KSPIKE;
})();
