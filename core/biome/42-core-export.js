// ================================================================= BIOME CORE — export (Godot scaffolding)
// What a page placed, as DATA a game engine can load (biomes/GODOT.md is the contract;
// the conventions are settlements/yuni/GAME_EXPORT.md's and core/atmos/GODOT.md's:
// metres, +Y up, x east, z south, right-handed, the same as glTF and Godot).
//
//   BIO.export({box:[x0,z0,x1,z1], kit:'rift', textures:true, ground:2}) -> one JSON-able object (ground: a tile's
//                                                                         heights and water on a 2 m grid, and the
//                                                                         host's baked field as ground.field if it has one)
//   BIO.download(name, opt)                                     -> in 43-core-export-host.js ([web]): saves it as <name>.biome.json
//
// It reads the BAKED meshes (BIO.baked), so it runs any time after BIO.bake(). Nothing
// here is called by a build: a page with it loaded draws exactly what it drew without it.
//  - items:     one record per InstancedMesh: the unit geometry once, then per instance
//               the 4x4 matrix (column-major, three's and glTF's order), the colour (linear),
//               and the foliage extras (aN normal, aC2 second colour) and any other per-
//               instance vec4 (aP0, aP1: fauna paths). GODOT.md says how they pack into a
//               MultiMesh's COLOR and INSTANCE_CUSTOM.
//  - buckets:   one record per merged Mesh: indexed positions, normals, uvs, vertex colours.
//  - materials: one record per material: its kind (leaf, bark, anim, or plain), colour,
//               alpha test, side, the hook's options, and its texture by id.
//  - textures:  every map as a PNG data URL (canvases and DataTextures alike) with its flipY; opt.textures:false
//               leaves the images out.
//  - lod:       a chunked mesh's chunk and the camera range it is drawn in (runtime LOD),
//               which a Godot importer turns into visibility_range_begin / _end.
//  - ids:       on a page with core/tags (BIO.init({tags}), 2026-10-12): an item names its item set (record, recordClass,
//               recordKey) and carries a side table aligned with its matrices: records (each instance's uid, 8 hex
//               digits) and recordIndex (its index in the set: its id is '<record>#<index>'); a bucket lists the
//               records whose pieces it merges (records, recordIds; pieces {n, unowned}). opt.records:false leaves them out.
// opt.box keeps only instances whose origin lies in the box (a tile), and whole bucket pieces whose foot does
// (opt.cut:'triangle': triangles by centroid, the rule before 2026-10-05); opt.kit keeps one kit's meshes. Typed arrays come out as base64 of their bytes
// ({b64, type, n}) so a whole build is not a list of numbers in text.
(function(){
const B64=(arr)=>{const u=new Uint8Array(arr.buffer,arr.byteOffset,arr.byteLength);let s='';const K=0x8000;
 for(let i=0;i<u.length;i+=K)s+=String.fromCharCode.apply(null,u.subarray(i,i+K));return btoa(s);};
const pack=(arr)=>({type:arr.constructor.name,n:arr.length,b64:B64(arr)});
// plain data only: numbers, strings, booleans, arrays and objects of them (a hook's functions
// and three objects are dropped; a texture becomes its id)
// a foliage hook's sway weight is GLSL text (30-core-foliage.js: '1.0', '(-position.y)', '(position.x)'...); the export
// adds it as data, weight = c + dot(w, position), so an importer need not read GLSL. Text it does not know stays text.
const SWAY={'1.0':[1,[0,0,0]],'1':[1,[0,0,0]],'0.0':[0,[0,0,0]],'0':[0,[0,0,0]],'(-position.y)':[0,[0,-1,0]],'(position.y)':[0,[0,1,0]],
 '(position.x)':[0,[1,0,0]],'(-position.x)':[0,[-1,0,0]],'(position.z)':[0,[0,0,1]],'(-position.z)':[0,[0,0,-1]]};
function swayOf(o){if(!o||!('swayW' in o||'swayA' in o))return null;const e=String(o.swayW==null?'1.0':o.swayW).replace(/\s/g,''),k=SWAY[e];
 return k?{c:k[0],w:k[1],a:o.swayA==null?.06:o.swayA,axis:o.axis|0}:{text:e,a:o.swayA==null?.06:o.swayA,axis:o.axis|0};}
// a bucket's PIECES: the connected runs of triangles (a trunk, a limb, a log), each with its foot, the xz of its lowest
// vertex. A tile keeps a piece whole when its foot lies in the box (opt.cut 'piece', the default), so a hero tree on
// a tile edge is never sliced, and every piece still lands in exactly one tile. opt.cut 'triangle' is the old rule
// (each triangle by its centroid).
function pieceOwner(P,I){const nv=P.length/3,par=new Int32Array(nv);for(let i=0;i<nv;i++)par[i]=i;
 const find=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i];}return i;};
 for(let t=0;t<I.length;t+=3){const a=find(I[t]),b=find(I[t+1]),c=find(I[t+2]);if(a!==b)par[b]=a;const a2=find(a);if(a2!==c)par[c]=a2;}
 const root=new Int32Array(nv),lowY=new Float32Array(nv).fill(Infinity),x=new Float32Array(nv),z=new Float32Array(nv);
 for(let i=0;i<nv;i++){const r=find(i);root[i]=r;if(P[i*3+1]<lowY[r]){lowY[r]=P[i*3+1];x[r]=P[i*3];z[r]=P[i*3+2];}}
 return {root,x,z,lowY};}
// the registered volumes of the page's core/tags registry (records with a radius: BIO.record's trees, logs, herds) on a
// 64 m grid, for the buckets' pieces: at(x, y, z) -> the smallest whose disc holds (x, z) and whose height span holds y
// (3 m under its base to 5 m over its top, the inspector's slack), or null
function volumeIndex(T){const C=64,G=new Map();let n=0;
 for(const r of T.query({})){if(r.r==null||T.isSet(r)||(r['class']!=='flora'&&r['class']!=='life'))continue;n++;
  const x0=Math.floor((r.at[0]-r.r)/C),x1=Math.floor((r.at[0]+r.r)/C),z0=Math.floor((r.at[2]-r.r)/C),z1=Math.floor((r.at[2]+r.r)/C);
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){const k=i+','+j;let L=G.get(k);if(!L)G.set(k,L=[]);L.push(r);}}
 if(!n)return null;
 return {n,at(x,y,z){const L=G.get(Math.floor(x/C)+','+Math.floor(z/C));if(!L)return null;let best=null;
  for(const r of L){const dx=x-r.at[0],dz=z-r.at[2];if(dx*dx+dz*dz>r.r*r.r)continue;
   if(r.h!=null&&(y<r.at[1]-3||y>r.at[1]+r.h+5))continue;if(!best||r.r<best.r)best=r;}
  return best;}};}
function plain(v,texId,depth){depth=depth||0;if(v==null||depth>4)return null;const t=typeof v;
 if(t==='number'||t==='string'||t==='boolean')return v;if(t==='function')return undefined;
 if(v.isTexture)return texId(v);if(v.isColor)return '#'+v.getHexString();
 if(Array.isArray(v))return v.map(x=>plain(x,texId,depth+1));
 if(t==='object'&&Object.getPrototypeOf(v)===Object.prototype){const o={};for(const k in v){const x=plain(v[k],texId,depth+1);if(x!==undefined)o[k]=x;}return o;}
 return undefined;}
BIO.export=function(opt){opt=opt||{};const box=opt.box||null,inBox=(x,z)=>!box||(x>=box[0]&&z>=box[1]&&x<box[2]&&z<box[3]);
 const out={format:'krator-biome',version:1,
  convention:{units:'m',up:'+Y',x:'east',z:'south',handed:'right',matrix:'column-major 4x4',colour:'linear',
   colours:{instances:'linear',vertices:'linear',materials:'linear (three\'s working values, written as hex: do not convert)',
    textures:'sRGB images'},ground:'heights in metres on a grid: row j is z0 + j*step, column i x0 + i*step'},
  core:BIO.version,kits:Object.keys(BIO.kits).filter(k=>k),box,items:[],buckets:[],materials:[],textures:[]};
 const mats=new Map(),texs=new Map();
 // core/tags (BIO.init({tags})): ids on what the export carries (biomes/GODOT.md, "Records")
 const TR=BIO.tagReg?BIO.tagReg():null,vols=TR&&opt.records!==false?volumeIndex(TR):null,recs={items:0,instances:0,buckets:0,bucketRecords:0};
 // flipY: true (a canvas) puts the image's top row at v=1; false (a DataTexture: the leaf atlases) puts row 0 at v=0.
 // The PNG is the image as stored, so an importer flips v only where flipY is true. Encoding a PNG is the host's
 // job (BIO.texPNG, 43-core-export-host.js); without one a record says why it has no image.
 const texId=t=>{if(!t)return null;if(texs.has(t))return texs.get(t).id;const id='tex'+texs.size,r={id,name:t.name||'',wrap:[t.wrapS,t.wrapT],repeat:[t.repeat.x,t.repeat.y],flipY:!!t.flipY};
  if(opt.textures!==false&&t.image){if(!BIO.texPNG)r.error='no PNG encoder (load 43-core-export-host.js)';
   else{try{const p=BIO.texPNG(t);if(p){r.png=p.png;r.size=p.size;}else r.error='image kind not encodable';}catch(e){r.error=String(e.message||e);}}}
  texs.set(t,r);return id;};
 const matId=m=>{if(mats.has(m))return mats.get(m).id;const id='mat'+mats.size,b=m.userData&&m.userData.bio;
  const r={id,kind:b?b.kind:'plain',key:b&&b.key||null,type:m.type,colour:m.color?'#'+m.color.getHexString():null,
   emissive:m.emissive&&(m.emissive.r||m.emissive.g||m.emissive.b)?'#'+m.emissive.getHexString():null,emissiveIntensity:m.emissiveIntensity==null?null:m.emissiveIntensity,
   map:texId(m.map),alphaTest:m.alphaTest||0,doubleSided:m.side===2,vertexColours:!!m.vertexColors,transparent:!!m.transparent,
   options:b&&b.opts?plain(b.opts,texId):null,sway:b?swayOf(b.opts):null,
   hooked:m.onBeforeCompile!==BIO.host.THREE.Material.prototype.onBeforeCompile};   // a shader hook a port must rewrite
  mats.set(m,r);return id;};
 const geoRec=g=>{const r={};for(const k of ['position','normal','uv','color']){const a=g.attributes[k];if(a&&!a.isInstancedBufferAttribute)r[k]=pack(a.array);}
  if(g.index)r.index=pack(g.index.array);return r;};
 for(const m of BIO.baked){const kit=m.userData.kit||'';if(opt.kit!=null&&kit!==opt.kit)continue;
  const base={name:m.name.replace(/^biome:/,''),kit,label:m.userData.inspectLabel||'',material:matId(m.material),lod:m.userData.lod||null};
  if(m.isInstancedMesh){const n=m.count,M=m.instanceMatrix.array,C=m.instanceColor?m.instanceColor.array:null,g=m.geometry;
   const extra={};for(const k in g.attributes){const a=g.attributes[k];if(a.isInstancedBufferAttribute)extra[k]={size:a.itemSize,a:a.array};}
   const keep=[];for(let i=0;i<n;i++)if(inBox(M[i*16+12],M[i*16+14]))keep.push(i);if(!keep.length)continue;
   const mA=new Float32Array(keep.length*16),cA=C?new Float32Array(keep.length*3):null,xA={};
   for(const k in extra)xA[k]=new Float32Array(keep.length*extra[k].size);
   keep.forEach((i,j)=>{for(let q=0;q<16;q++)mA[j*16+q]=M[i*16+q];if(cA)for(let q=0;q<3;q++)cA[j*3+q]=C[i*3+q];
    for(const k in extra){const s=extra[k].size;for(let q=0;q<s;q++)xA[k][j*s+q]=extra[k].a[i*s+q];}});
   const rec=Object.assign(base,{count:keep.length,dynamic:m.instanceMatrix.usage===BIO.host.THREE.DynamicDrawUsage,
    geometry:geoRec(g),matrices:pack(mA),colours:cA?pack(cA):null,extras:{}});
   for(const k in xA)rec.extras[k]={size:extra[k].size,data:pack(xA[k])};
   // core/tags (a page with BIO.init({tags})): the item set this mesh draws, and per instance, aligned with the
   // matrices, its uid (KTAGS.uid of its class, key and matrix position) and its index in the set ('<record>#<index>')
   const RS=TR&&opt.records!==false?BIO.recordsOf(m):null;
   if(RS){const ix=new Uint32Array(keep.length),u=new Array(keep.length);
    keep.forEach((i,j)=>{ix[j]=RS.index(i);u[j]=KTAGS.hex(RS.uid32(i));});
    rec.record=RS.set;rec.recordClass=RS.record['class'];rec.recordKey=RS.record.key;   // a uid recomputes from these two and the matrix
    rec.records=u;rec.recordIndex=pack(ix);recs.instances+=keep.length;recs.items++;}
   out.items.push(rec);}
  else if(m.isMesh&&m.geometry.index){const g=m.geometry,P=g.attributes.position.array,I=g.index.array;let idx=I;
   const own=(box&&opt.cut!=='triangle')||vols?pieceOwner(P,I):null;
   if(box){const k=[];   // a whole piece goes to the tile holding its foot
    for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;
     const keep=opt.cut!=='triangle'?inBox(own.x[own.root[I[t]]],own.z[own.root[I[t]]]):inBox((P[a]+P[b]+P[c])/3,(P[a+2]+P[b+2]+P[c+2])/3);
     if(keep)k.push(I[t],I[t+1],I[t+2]);}
    if(!k.length)continue;idx=I.BYTES_PER_ELEMENT===2?Uint16Array.from(k):Uint32Array.from(k);}
   const geo=geoRec(g);geo.index=pack(idx);   // a tile keeps the whole vertex list: an importer drops the unused ones
   const brec=Object.assign(base,{triangles:idx.length/3,geometry:geo});
   // core/tags: the records this bucket merges. Each piece (a bole, a limb, a log) belongs to the smallest registered
   // volume (a tree, a log, a herd: BIO.record) that holds its foot; records lists their uids once each, recordIds their
   // ids, pieces how many pieces the bucket holds and how many of them lie in no volume (boulders, ground cover)
   if(vols){const seen=new Map();let np=0,none=0;const done=new Uint8Array(P.length/3);
    for(let t=0;t<idx.length;t+=3){const r=own.root[idx[t]];if(done[r])continue;done[r]=1;np++;
     const v=vols.at(own.x[r],own.lowY[r],own.z[r]);if(!v){none++;continue;}if(!seen.has(v.uid+' '+v.id))seen.set(v.uid+' '+v.id,v);}
    const L=[...seen.values()];brec.records=L.map(v=>v.uid);brec.recordIds=L.map(v=>v.id);brec.pieces={n:np,unowned:none};
    recs.buckets++;recs.bucketRecords+=L.length;}
   out.buckets.push(brec);}}
 // the ground under a tile (opt.ground: the grid step in metres, 2 by default; opt.ground:false leaves it out): the
 // host's terrainH and waterH sampled on a grid over the box. A stand-in for core/terrain's bake (GODOT-PLAN.md Phase 2)
 if(box&&opt.ground!==false){const st=+opt.ground>0?+opt.ground:2,nx=Math.floor((box[2]-box[0])/st)+1,nz=Math.floor((box[3]-box[1])/st)+1,
   H=new Float32Array(nx*nz),W=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=box[0]+i*st,z=box[1]+j*st;H[j*nx+i]=BIO.terrainH(x,z);W[j*nx+i]=BIO.waterH(x,z);}
  out.ground={x0:box[0],z0:box[1],step:st,nx,nz,heights:pack(H),water:pack(W)};
  // the host's baked field (core/terrain/30-core-field.js) when it has one: the real heightmap, cropped to the box on
  // its own lattice (krator-field; godot/krator/field_import.gd). opt.field:false leaves it out
  const F=BIO.host&&BIO.host.field;if(F&&typeof F.export==='function'&&opt.field!==false)out.ground.field=F.export({box});}
 out.materials=[...mats.values()];out.textures=[...texs.values()];
 out.stats={items:out.items.length,instances:out.items.reduce((s,r)=>s+r.count,0),buckets:out.buckets.length,triangles:out.buckets.reduce((s,r)=>s+r.triangles,0)};
 if(TR){out.tags={build:TR.build,format:'krator-tags'};out.stats.records=recs;}
 return out;};
})();
