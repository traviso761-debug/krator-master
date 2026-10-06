// ================================================================= OPEN WORLD — towns: the settlements' baked tiles, loaded when near
// [web] A built settlement stands in the world as a tile baked from its own build's page (bake.py towns: its exteriors
// and streets, no flora, life or interiors): dist/towns/<name>.ktile, fetched when the camera comes within NEAR of the
// town and freed beyond FAR. WORLD (41-world-fields.js) already shapes the land to the town's ground (WORLD_DATA.towns):
// this fragment draws the tile on it, turned and lifted as the record says (world = Ry(rot)(local) + (x, y0, z)).
//
// A tile (gzip): 'KTWN', version, header length, the header (JSON: meshes, materials, textures, the ground), then the
// arrays. Positions are Int16 over each geometry's box, uvs Int16 over their range, colours Uint8; the normals are made
// here. An instanced mesh carries its instances' matrices (3x4 floats); the ground is a height grid (Int16 cm) with the
// build's painted ground canvas over it, cut to the footprint's circle (or the build's own ground mesh, as drawn).
var TOWNS_DRAW;LATE.push(()=>{TOWNS_DRAW=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera;
const RECS=(WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[];
const NEAR=30000,FAR=38000;
const S={towns:RECS.length,loaded:0,loading:0,meshes:0,tris:0,instances:0,failed:[],ms:0};
const live=new Map();   // name -> {group|null, promise}
const TA={Int16Array,Int8Array,Uint8Array,Uint16Array,Uint32Array,Float32Array};

// the tile as one gzip file (served locally), or, where a host serves no binary type (the Artifact service), as base64
// text in parts of under 16 MB: <tile>.0.txt, <tile>.1.txt ... (publish.py writes them), joined here
async function fetchTile(url){if(typeof DecompressionStream==='undefined')throw new Error('no DecompressionStream in this browser');
 let body;const r=await fetch(url).catch(()=>null);
 if(r&&r.ok&&!/text\/html/.test(r.headers.get('content-type')||''))body=r.body;
 else{const parts=[];for(let i=0;;i++){const p=await fetch(url+'.'+i+'.txt').catch(()=>null);if(!p||!p.ok)break;parts.push(await p.text());}
  if(!parts.length)throw new Error(url+': not found');
  const b=atob(parts.join('').replace(/\s+/g,'')),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  body=new Blob([u]).stream();}
 return await new Response(body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}
function parse(buf){const dv=new DataView(buf),magic=String.fromCharCode(dv.getUint8(0),dv.getUint8(1),dv.getUint8(2),dv.getUint8(3));
 if(magic!=='KTWN')throw new Error('not a town tile');const jl=dv.getUint32(8,true);
 return {head:JSON.parse(new TextDecoder().decode(new Uint8Array(buf,12,jl))),buf,base:12+jl};}
const view=(T,ref)=>new TA[ref.t](T.buf,T.base+ref.off,ref.n);

function geometry(T,g){const n=g.n,qp=view(T,g.pos),pos=new Float32Array(n*3);
 for(let i=0;i<n*3;i++){const q=i%3;pos[i]=g.lo[q]+(qp[i]+32767)/65534*g.sz[q];}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));
 if(g.uv){const qu=view(T,g.uv),uv=new Float32Array(n*2);for(let i=0;i<n*2;i++){const q=i%2;uv[i]=g.ulo[q]+(qu[i]+32767)/65534*g.usz[q];}G.setAttribute('uv',new THREE.BufferAttribute(uv,2));}
 if(g.col)G.setAttribute('color',new THREE.BufferAttribute(view(T,g.col),3,true));
 if(g.idx)G.setIndex(new THREE.BufferAttribute(view(T,g.idx),1));
 G.computeVertexNormals();G.computeBoundingSphere();return G;}

function textures(head){return head.textures.map(t=>{const img=new Image(),tx=new THREE.Texture(img);
 img.onload=()=>{tx.needsUpdate=true;};img.src=t.url;tx.wrapS=t.wrapS;tx.wrapT=t.wrapT;tx.repeat.set(t.repeat[0],t.repeat[1]);
 tx.offset.set(t.offset[0],t.offset[1]);tx.flipY=t.flipY;if(t.enc)tx.encoding=t.enc;tx.anisotropy=4;return tx;});}
function materials(head,tex){return head.materials.map(m=>{
 const o={color:m.color,vertexColors:m.vc,side:m.side,transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest,depthWrite:m.depthWrite};
 if(m.map>=0)o.map=tex[m.map];
 let M;
 if(m.type==='MeshBasicMaterial')M=new THREE.MeshBasicMaterial(o);
 else if(m.type==='MeshStandardMaterial'||m.type==='MeshPhysicalMaterial')M=new THREE.MeshStandardMaterial(Object.assign(o,{roughness:m.rough,metalness:m.metal,emissive:m.emissive,emissiveIntensity:m.ei,flatShading:m.flat}));
 else if(m.type==='MeshPhongMaterial')M=new THREE.MeshPhongMaterial(Object.assign(o,{emissive:m.emissive,flatShading:m.flat}));
 else M=new THREE.MeshLambertMaterial(Object.assign(o,{emissive:m.emissive}));
 return M;});}
const WATER_M=new Map();
function waterMat(c){if(!WATER_M.has(c))WATER_M.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.12,metalness:.15,transparent:true,opacity:.82,depthWrite:false}));return WATER_M.get(c);}

// the ground: the build's terrainH on a grid, its painted canvas over it, only the cells inside the footprint
function ground(T,g,R){const n=g.n,h=view(T,g.h),N=n*n,pos=new Float32Array(N*3),uv=new Float32Array(N*2);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*n+i;pos[k*3]=g.x0+i*g.step;pos[k*3+1]=g.h0+h[k]*(g.s||.01);pos[k*3+2]=g.z0+j*g.step;uv[k*2]=i/(n-1);uv[k*2+1]=1-j/(n-1);}
 const idx=[];for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){const cx=g.x0+(i+.5)*g.step,cz=g.z0+(j+.5)*g.step;if(cx*cx+cz*cz>R*R)continue;
  const a=j*n+i,b=a+n;idx.push(a,b,a+1,b,b+1,a+1);}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 G.setIndex(N>65535?new THREE.Uint32BufferAttribute(idx,1):new THREE.Uint16BufferAttribute(idx,1));G.computeVertexNormals();G.computeBoundingSphere();
 const M=new THREE.MeshLambertMaterial({color:0xffffff});
 if(g.tex){const img=new Image(),tx=new THREE.Texture(img);img.onload=()=>{tx.needsUpdate=true;};img.src=g.tex;tx.encoding=THREE.sRGBEncoding;tx.anisotropy=8;tx.flipY=true;M.map=tx;}
 const m=new THREE.Mesh(G,M);m.userData.inspectLabel='the town\'s ground (its build\'s, streets painted in)';m.userData.tris=idx.length/3;S.tris+=m.userData.tris;S.meshes++;return m;}

function build(rec,town,T){const t0=performance.now(),head=T.head,tex=textures(head),mats=materials(head,tex),grp=new THREE.Group();
 grp.position.set(rec.x,town.y0,rec.z);grp.rotation.y=rec.rot||0;grp.name='town:'+rec.name;
 const label=rec.name+' (baked from '+rec.build+')';
 if(head.ground)grp.add(ground(T,head.ground,rec.R));
 const m4=new THREE.Matrix4();
 // three.js r128 leaves per-instance colour out of its program cache key: an instanced mesh without colours can be
 // handed a program built for one with them, read a null instanceColor and throw every frame (Mungo's reed-kit items).
 // So every instanced mesh of a tile carries colours: white (no change) where the bake has none
 for(const r of head.meshes){const G=geometry(T,r.g),M=r.water?waterMat(r.wcol||0x3a6a7a):mats[r.mat];let o;
  if(r.inst){const e=view(T,r.inst);o=new THREE.InstancedMesh(G,M,r.count);
   for(let i=0;i<r.count;i++){const b=i*12;m4.set(e[b],e[b+3],e[b+6],e[b+9],e[b+1],e[b+4],e[b+7],e[b+10],e[b+2],e[b+5],e[b+8],e[b+11],0,0,0,1);o.setMatrixAt(i,m4);}
   {const f=new Float32Array(r.count*3);if(r.icol){const c=view(T,r.icol);for(let i=0;i<f.length;i++)f[i]=c[i]/255;}else f.fill(1);o.instanceColor=new THREE.InstancedBufferAttribute(f,3);}
   o.frustumCulled=false;S.instances+=r.count;}
  else o=new THREE.Mesh(G,M);
  o.renderOrder=r.water?1:(r.ro||0);o.userData.inspectLabel=label+' · '+r.name;o.userData.town=rec.name;o.matrixAutoUpdate=true;
  o.userData.tris=(r.g.idx?r.g.idx.n/3:r.g.tri||0)*(r.count||1);grp.add(o);S.meshes++;S.tris+=o.userData.tris;}
 scene.add(grp);S.ms+=performance.now()-t0;return grp;}

function load(rec){const town=WORLD.towns.find(t=>t.name===rec.name);if(!town)return Promise.resolve(null);
 const L={group:null,promise:null};live.set(rec.name,L);S.loading++;
 L.promise=fetchTile(rec.tile).then(buf=>{S.loading--;if(live.get(rec.name)!==L)return null;L.group=build(rec,town,parse(buf));S.loaded++;return L.group;})
  .catch(e=>{S.loading--;S.failed.push(rec.name+': '+e.message);console.warn('town tile',rec.name,e);return null;});
 return L.promise;}
function free(name){const L=live.get(name);live.delete(name);if(!L||!L.group)return;scene.remove(L.group);
 const mats=new Set();
 L.group.traverse(o=>{if(!o.isMesh)return;o.geometry.dispose();S.meshes--;S.tris-=o.userData.tris||0;if(o.isInstancedMesh)S.instances-=o.count;
  (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!WATER_SET.has(m))mats.add(m);});});
 for(const m of mats){if(m.map)m.map.dispose();m.dispose();}
 S.loaded--;}
const WATER_SET={has:m=>[...WATER_M.values()].includes(m)};
// every frame: load what came near, free what went far
function update(){const P=camera.position;
 for(const rec of RECS){const d=Math.hypot(P.x-rec.x,P.z-rec.z);
  if(d<NEAR&&!live.has(rec.name))load(rec);else if(d>FAR&&live.has(rec.name))free(rec.name);}}
// for the probe and headless screenshots: load what is near now and wait for it
function ready(){update();return Promise.all([...live.values()].map(L=>L.promise));}
return{update,ready,stats:S,live};})();});
