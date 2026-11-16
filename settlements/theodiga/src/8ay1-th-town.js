// ================================================================= THEODIGA TODAY — the town on the east rim, drawn from its records
// thTownDraw(gx, gz) draws the town (src/40-th-town.js, laid out by core/city inside THCITY, kits/ancients/build.py th_city)
// beside the ruined dam: the scrap Xanadu set's buildings and the Qiblai kit's (kits/xanadu and kits/qiblai, sealed as XAK by
// kits/xanadu/kit_bundle.py with scrap=True, qiblai=True), Gate Square's paving and the Warden's House. Called by buildDam
// (targets/theodiga/77-dam.js) for the ruin only, with KOFF at the dam; without THCITY or XAK on the page it draws nothing.
// THE METHOD is Strongbow's town's (settlements/strongbow/src/8ax1-sb-town.js, branch claude/keen-swanson-68a311): each def is
// built once per variant and footing depth at the origin (XAK.proto), flattened to one geometry per material (isleFlatten,
// settlements/isle-demo/src/58-isle-protos.js, read in place) in two layers (Strongbow's has three; below), each merged by
// material over the whole town: its big pieces and plain boxes at every distance (core/lod simplifies them far off) and the
// rest of its detail within 300 m, by 120 m cells. Both towns should draw through one core/city host module (KNOWN_ISSUES.md).
// A building stands on the highest ground under its footprint (the town's ground, THCITY.town.ground, which the plateau is
// drawn on) over a footing as deep as the ground falls. The streets are packed earth on the ground, the kora's flagstone a
// paler shade, the fields strips in their crop's colour. Everything is registered in core/tags first.
function thTownKit(){return typeof XAK!=='undefined'&&typeof THCITY!=='undefined'&&typeof isleFlatten!=='undefined';}
function thTownDraw(gx,gz,ctx){const O={buildings:0,people:0,protos:0,meshes:0,tris:0,errors:[],census:null};
 if(!thTownKit()){window._thTown=O;return O;}
 const KD=XAK.dims(),dims=(k,v)=>KD[k]?{key:k,v:v|0,w:KD[k].w,d:KD[k].d,h:KD[k].h}:null,TT=THCITY.town,GR=TT.ground;
 /* the kits' library maps from the packs the page carries (kits/ancients/build.py TH_XPACK, TH_QPACK) */
 try{const b=XAK.bind(typeof KMAT!=='undefined'?KMAT:null);O.bound=b?Object.keys(b).filter(k=>b[k]).length:0;}catch(e){O.errors.push('the kit library maps: '+e.message);}
 KOFF=[gx,0,gz];
 let T;try{T=TT.make({dims});}catch(e){O.errors.push('the town plan: '+(e&&e.stack||e));window._thTown=O;return O;}
 O.census=T.census;
 /* the Warden's House (the Sultanate's warden, who keeps the Stair of Descent): a scrap court in its landmark's box, its front
    on Gate Square (north, -z) */
 const WB=T.landmarks.find(m=>m.id==='th.town.warden'),warden=WB?[{id:WB.id,key:'xa_scrap_court',v:2,x:(WB.x0+WB.x1)/2,z:(WB.z0+WB.z1)/2,ry:Math.PI,
  name:'the Warden\'s House',civic:true,quarter:'square',people:14,landmark:true}]:[];
 for(const r of warden)Object.assign(r,{w:KD[r.key].w,d:KD[r.key].d,h:KD[r.key].h});
 const all=warden.concat(T.lots);
 const cultureOf=k=>/^qb_/.test(k)?'qiblai':'xanadu-scrap';
 // ---- core/tags: the town and every building in it, before anything is drawn ----------------------------------------------------
 {const TG=KTAGS.theodiga||(KTAGS.theodiga=KTAGS.create({build:'ancients-theodiga'})),B='town/theodiga',C=T.centre;
  TG.add({id:B,'class':'landmark',kind:'town',key:'theodiga:town',name:'Theodiga, the town on the east rim',at:[C[0]+gx,GR(C[0],C[1]),C[1]+gz],r:460,h:30,
   tags:{culture:'xanadu-scrap',types:['dwelling-multi','market','inn','farm','religious']},note:'core/city: '+T.census.buildings+' buildings, '+T.census.people+' people'});
  for(const m of T.landmarks){const x=m.r?m.x:(m.x0+m.x1)/2,z=m.r?m.z:(m.z0+m.z1)/2;
   TG.child(B,{'class':'feature',kind:m.r?'road-head':'plaza',key:m.id,name:m.name,at:[x+gx,m.y,z+gz],tags:{culture:'xanadu-scrap'}});}
  for(const r of all){const K=KD[r.key];TG.child(B,{'class':r.civic?'landmark':'building',kind:r.key.replace(/^xa_scrap_|^qb_/,''),key:r.id,name:r.name||K.name,at:[r.x+gx,GR(r.x,r.z),r.z+gz],ry:r.ry,size:[r.w,r.d,r.h],
   tags:{culture:cultureOf(r.key),kit:/^qb_/.test(r.key)?'qiblai':'xanadu',types:K.types,quarter:TT.QUARTER_NAME[r.quarter]||r.quarter}});}
  for(const f of T.fields)TG.child(B,{'class':'feature',kind:'field',key:f.id,at:[(f.corners[0][0]+f.corners[2][0])/2+gx,440,(f.corners[0][1]+f.corners[2][1])/2+gz],tags:{culture:'xanadu-scrap',crop:f.crop}});}
 // ---- the kits' buildings: protos, flattened once each, in two layers -------------------------------------------------------------
 /* TWO LAYERS (2026-11-16; Strongbow's three put the plain boxes, a scrap house's wall panels and a Qiblai house's window
    surrounds, in a layer of their own within 300 m and the rest within 200 m, so between them a scrap wall showed its dark
    body and a Qiblai house black holes, the owner's "lot of black/missing textures"): BIG is every piece of 1.5 m radius
    and every plain box (12 triangles) of 0.7 m or more, at every distance; NEAR the rest (glazing bars, lamps, finials,
    small boxes), within 300 m */
 const PROTOS={},FOOT=0x8f8676,BIG_R=1.5,BOX_R=.7;
 const LAYERS=[{id:'big',near:Infinity},{id:'detail',near:300}];
 const layerOf=(r,tris)=>r>=BIG_R||(tris<=12&&r>=BOX_R)?'big':'detail';
 const split=(G,id)=>{const H=new THREE.Group(),m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),c=new THREE.Color();G.updateMatrixWorld(true);
  G.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();
   const r0=g.boundingSphere.radius,tris=(g.index?g.index.count:g.attributes.position.count)/3;
   if(o.isInstancedMesh){const keep=[];for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(p,q,s);if(layerOf(r0*Math.max(s.x,s.y,s.z),tris)===id)keep.push(i);}
    if(!keep.length)return;const im=new THREE.InstancedMesh(g,o.material,keep.length);
    keep.forEach((i,j)=>{o.getMatrixAt(i,m);im.setMatrixAt(j,m);if(o.instanceColor){o.getColorAt(i,c);im.setColorAt(j,c);}});
    im.matrix.copy(o.matrixWorld);im.matrixAutoUpdate=false;H.add(im);}
   else if(layerOf(r0*o.matrixWorld.getMaxScaleOnAxis(),tris)===id){const mm=new THREE.Mesh(g,o.material);mm.matrix.copy(o.matrixWorld);mm.matrixAutoUpdate=false;H.add(mm);}});
  return H;};
 const proto=(key,v,drop)=>{const id=key+'#'+v+'@'+drop;if(id in PROTOS)return PROTOS[id];let L=null;
  try{const G=XAK.proto(key,v,{drop,footC:FOOT});
   if(G){L={};for(const Y of LAYERS)L[Y.id]=isleFlatten(split(G,Y.id));O.protos++;}else O.errors.push('the kit could not build '+key+' #'+v);}
  catch(e){O.errors.push(key+': '+e.message);}
  return (PROTOS[id]=L);};
 const corners=(r,w,d)=>{const c=Math.cos(r.ry),s=Math.sin(r.ry);return [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]].map(([u,v])=>[r.x+u*w/2*c+v*d/2*s,r.z-u*w/2*s+v*d/2*c]);};
 const CELL=120,HYST=25,cells=new Map(),cellOf=(x,z)=>{const k=Math.floor(x/CELL)+','+Math.floor(z/CELL);
  let C=cells.get(k);if(!C){C={i:cells.size,k,x:(Math.floor(x/CELL)+.5)*CELL+gx,z:(Math.floor(z/CELL)+.5)*CELL+gz,y:440,items:[],on:{}};cells.set(k,C);}return C;};
 const Y=new THREE.Vector3(0,1,0),steps=[];
 for(const r of all){const K=KD[r.key],hs=corners(r,K.fw,K.fd).map(([x,z])=>GR(x,z)),top=Math.max.apply(null,hs),low=Math.min.apply(null,hs);
  const drop=Math.min(6,Math.ceil(top-low+.4)),v=Math.max(0,Math.min((K.variants|0)-1,r.v|0)),L=proto(r.key,v,drop);
  REGISTER({name:'Theodiga — '+(r.name||K.name)+' ('+(TT.QUARTER_NAME[r.quarter]||'the town')+')',x:r.x,z:r.z,y:low-.5,r:Math.max(r.w,r.d)/2+.8,h:r.h+(top-low)+1});
  O.buildings++;O.people+=r.people|0;
  if(!L)continue;
  const m=new THREE.Matrix4().compose(new THREE.Vector3(r.x+gx,top,r.z+gz),new THREE.Quaternion().setFromAxisAngle(Y,r.ry),new THREE.Vector3(1,1,1));
  cellOf(r.x,r.z).items.push({L,m});
  const c=Math.cos(r.ry),s=Math.sin(r.ry);steps.push([r.x+gx+s*(K.fd/2+.35),top-.16,r.z+gz+c*(K.fd/2+.35),r.ry]);}
 const CL=[...cells.values()];
 // ---- each layer merged by material over the whole town. The big layer is a plain static mesh (core/lod takes it over); the
 // detail's index holds only the cells in reach, rewritten as a cell comes into reach or leaves it (lodSkip)
 const v3=new THREE.Vector3(),n3=new THREE.Matrix3(),MESHES={};
 const merge=lv=>{const by=new Map(),out=MESHES[lv]=[];
  for(const C of CL)for(const {L,m} of C.items)for(const p of L[lv]){const names=Object.keys(p.geo.attributes).sort(),k=p.mat.uuid+'|'+names.join(',');
   (by.get(k)||by.set(k,{mat:p.mat,names,items:[]}).get(k)).items.push({g:p.geo,m,cell:C.i});}
  for(const Q of by.values()){let nv=0,ni=0;for(const it of Q.items){nv+=it.g.attributes.position.count;ni+=it.g.index.count;}
   const A={};for(const nm of Q.names)A[nm]=new Float32Array(nv*Q.items[0].g.attributes[nm].itemSize);
   const I=new Uint32Array(ni),ranges=new Array(CL.length).fill(null);let vo=0,io=0;
   for(const it of Q.items){const g=it.g,cnt=g.attributes.position.count;n3.getNormalMatrix(it.m);
    for(const nm of Q.names){const src=g.attributes[nm],sz=src.itemSize,dst=A[nm],a=src.array;
     if(nm==='position')for(let i=0;i<cnt;i++){v3.set(a[i*3],a[i*3+1],a[i*3+2]).applyMatrix4(it.m);dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
     else if(nm==='normal')for(let i=0;i<cnt;i++){v3.set(a[i*3],a[i*3+1],a[i*3+2]).applyMatrix3(n3).normalize();dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
     else dst.set(a.subarray(0,cnt*sz),vo*sz);}
    const ia=g.index.array,R=ranges[it.cell]||(ranges[it.cell]=[io,0]);for(let k=0;k<ia.length;k++)I[io+k]=ia[k]+vo;R[1]+=ia.length;io+=ia.length;vo+=cnt;}
   const geo=new THREE.BufferGeometry();for(const nm of Q.names)geo.setAttribute(nm,new THREE.BufferAttribute(A[nm],Q.items[0].g.attributes[nm].itemSize));
   const dyn=lv!=='big',idx=new THREE.BufferAttribute(dyn?new Uint32Array(ni):I,1);if(dyn)idx.setUsage(THREE.DynamicDrawUsage);geo.setIndex(idx);geo.computeBoundingSphere();if(dyn)geo.setDrawRange(0,0);
   const mesh=new THREE.Mesh(geo,Q.mat);mesh.name='theodiga:town '+lv+' '+(Q.mat.userData.kdef||'piece');mesh.matrixAutoUpdate=false;mesh.castShadow=mesh.receiveShadow=true;
   if(dyn)mesh.userData.lodSkip=true;scene.add(mesh);O.meshes++;O.tris+=ni/3;O[lv+'Tris']=(O[lv+'Tris']||0)+ni/3;
   out.push({mesh,I,ranges});}};
 for(const L of LAYERS)merge(L.id);
 const relevel=lv=>{for(const M of MESHES[lv]){const dst=M.mesh.geometry.index;let n=0;
   for(const C of CL){if(!C.on[lv])continue;const R=M.ranges[C.i];if(!R)continue;dst.array.set(M.I.subarray(R[0],R[0]+R[1]),n);n+=R[1];}
   dst.updateRange.offset=0;dst.updateRange.count=n;dst.needsUpdate=true;M.mesh.geometry.setDrawRange(0,n);M.mesh.visible=n>0;}};
 const eye=new THREE.Vector3();let lastT=0;
 const level=force=>{const t=performance.now();if(!force&&t-lastT<150)return;lastT=t;camera.getWorldPosition(eye);
  for(const L of LAYERS){if(L.near===Infinity)continue;let ch=false;
   for(const C of CL){const d=Math.hypot(eye.x-C.x,(eye.y-C.y)*.6,eye.z-C.z),was=!!C.on[L.id],nn=was?d<L.near+HYST:d<L.near-HYST;if(nn!==was){C.on[L.id]=nn;ch=true;}}
   if(ch||force)relevel(L.id);}};
 level(true);TICKS.push(()=>level(false));
 O.level=level;O.cells=CL.length;
 // ---- the doorsteps, one instanced set: a building's step before its front door is what the probe and the inspector find it by
 // (the merged layers are one mesh for the whole town) -----------------------------------------------------------------------
 if(steps.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,.32,.8),new THREE.MeshStandardMaterial({color:new THREE.Color(0xb8b0a0).convertSRGBToLinear(),roughness:.9}),steps.length),
   M=new THREE.Matrix4(),Q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1);
  steps.forEach((t,j)=>{M.compose(new THREE.Vector3(t[0],t[1],t[2]),Q.setFromAxisAngle(Y,t[3]),one);im.setMatrixAt(j,M);});
  im.name='theodiga:town doorsteps';scene.add(im);}
 // ---- the ground's dress: the streets (packed earth, the avenues a shade paler, the kora flagstone), Gate Square's paving and
 // the fields, laid on the town's ground ----------------------------------------------------------------------------------------
 {const pos=[],col=[],C3=new THREE.Color(),quad=(a,b,c,d,hex,lift)=>{C3.setHex(hex).convertSRGBToLinear();
   for(const p of [a,b,c,a,c,d]){pos.push(p[0]+gx,GR(p[0],p[1])+(lift||.07),p[1]+gz);col.push(C3.r,C3.g,C3.b);}};
  for(const w of T.ways){const hw=w.w/2,hex=w.tag==='the outer kora'?0xb4aa96:w.cls==='avenue'?0x9c8c6e:w.cls==='main'?0x928366:0x887a60;
   for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw,ex=dx/l*.6,ez=dz/l*.6;
    quad([a[0]+nx-ex,a[1]+nz-ez],[b[0]+nx+ex,b[1]+nz+ez],[b[0]-nx+ex,b[1]-nz+ez],[a[0]-nx-ex,a[1]-nz-ez],hex);}}
  /* Gate Square: flagstone in 5 m squares, alternate shades, the head of the Stair of Descent at its west edge */
  const SQ=T.landmarks.find(m=>m.id==='th.town.square');
  if(SQ)for(let x=SQ.x0;x<SQ.x1-.01;x+=5)for(let z=SQ.z0;z<SQ.z1-.01;z+=5){const x1=Math.min(SQ.x1,x+5),z1=Math.min(SQ.z1,z+5),k=((x-SQ.x0)/5+(z-SQ.z0)/5)&1;
   quad([x,z],[x1,z],[x1,z1],[x,z1],k?0xc2b8a2:0xb6ac96,.09);}
  const CROP={grain:0xc8b46a,pulse:0x7f9a4c,tuber:0x5f7a3c,fodder:0x8a9a52,fallow:0x8a7454};
  for(const f of T.fields){const K=f.corners,n=6;
   for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,l=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
    quad(l(K[0],K[1],t0),l(K[0],K[1],t1),l(K[3],K[2],t1),l(K[3],K[2],t0),k%2?CROP[f.bucket||f.crop]:(CROP[f.bucket||f.crop]&0xf0f0f0)-0x101008);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  m.name='theodiga:town streets, square and fields';m.receiveShadow=true;m.userData.probeSkip=true;m.userData.lodSkip=true;scene.add(m);}
 /* the ways down from the rim (T-town-3: src/8ay2-th-descent.js), on the wall buildDam hands over */
 let DS=null;if(typeof thDescentDraw==='function'){try{DS=thDescentDraw(gx,gz,ctx,{ground:GR,heads:TT.HEADS});}catch(e){O.errors.push('the ways: '+(e&&e.stack||e));}}
 if(DS)O.errors.push(...DS.errors);
 O.kitErrors=XAK.errors.slice(0,8);
 window._thTown={descent:DS?{ways:DS.ways,boxes:DS.boxes,tris:Math.round(DS.tris),stair:DS.stair,salvage:DS.salvage,silt:DS.silt}:null,bound:O.bound||0,buildings:O.buildings,people:O.people,protos:O.protos,meshes:O.meshes,tris:Math.round(O.tris),bigTris:Math.round(O.bigTris||0),
  detailTris:Math.round(O.detailTris||0),cells:O.cells,census:O.census,errors:O.errors.concat(XAK.errors).slice(0,12),
  fields:T.fields.length,ways:T.ways.length,qiblai:all.filter(r=>/^qb_/.test(r.key)).length,level:f=>O.level&&O.level(f)};
 return O;}
