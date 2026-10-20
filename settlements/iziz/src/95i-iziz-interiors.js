// ================================================================= 95i. THE INTERIORS: rooms furnished behind the hollow walls
// Every placement 69e-vern-hollow.js drew hollow (VHOLLOW.jobs: the def's item in the interiors kit's Iziz set,
// kits/interiors/sets/iziz.js) is planned again in the world frame and furnished from the master catalog
// (KratorFurniture: the furniture bundle build.py writes for the target; the poor tier through the generic and scrap
// chain), once the world is built and before the first frame. The planner's windows are replaced on every room by the
// windows the builder really drew on that room's walls (the job's ops), so furniture keeps clear of them. A residence
// that fails the set's rule (a bed, a food and an item container per unit) is furnished again with another seed, twice
// at most; what still fails is listed in _interiors.residenceFails. Every piece is a core/tags record (prefix ixf, class
// furniture, its building as parent), so the inspector names it. Each building is a cutaway unit (X; ] [ the storeys).
// The furniture is drawn by the catalog's batch into one mesh per render family (a constant handful of draw calls).
// IZIX.jobs (per job its building record, the instantiated buildings and rooms) and IZIX.placed (per piece its record
// id and the batch's arguments) are what core/export's interiors and furniture sections read (94-city-export.js).
// ?interiors=0 leaves the walls solid (89z-rows.js reads it) and furnishes nothing.
// In the city (2026-10-19) every hollow building is planned (its rooms, its walk records, its cutaway unit), but only the
// civic and Ancient ones are furnished at load (izixFurnish: thousands of houses would cost tens of seconds and some 60 000
// pieces). The rest are furnished NEAR THE CAMERA (IZIX.near, on the frame hook): every bare building within NEAR_R of the
// eye is queued by its NEAR_CELL-metre cell, a couple are planned a frame, and a cell's furniture is flushed as one batch
// (one mesh per cell) when its last building is done. Once furnished a building stays furnished.
function izixFurnish(J){if(!window.CITY)return true;const T=J.item.types||[];return !!J.item.ancient||T.some(t=>t==='civic'||t==='military'||t==='religious');}
// ---------------------------------------------------------------- the court's pictures and finishes (the owner, 2026-10-19)
// The court sets of Iziz's pack (core/materials/patterns/court; settlements/iziz/materials.json) on the placed catalog pieces,
// in two ways. OVERLAYS (COURT_DECALS): UV'd meshes laid on a piece where the picture must sit exactly: book spines on the
// shelves, a canvas and the carved gilt moulding on every painting frame, the glaze band round each jar and ewer, a sun
// carpet on the court carpet, the common rug and the wall rugs, the mosaic on the mosaic panels. A piece's frame is the
// catalog's: +z its front, y up from its foot. A painting, and a carpet or glaze where a piece offers two, is picked by the
// piece's position. FINISHES (COURT_TRI): the court palette keys (kits/catalog/krator-master-furniture-iziz.js) split
// into texture families; their merged batch meshes take the set by triplanar projection of the world position (the batch
// has no UVs): marquetry, brocade and the opus-sectile hearth in full colour; gold leaf and velvet as detail maps
// multiplied into the piece's own colour. Nothing is drawn or bound for a set the page's pack lacks.
const COURT_V=(r0,r1,r2,y0,y1,y2,o)=>({lathe:[[r0,y0],[r1,y1],[r2,y2]],out:o==null?1.02:o});
const COURT_DECALS={
 iziz_court_library_shelves:{rows:4,y0:.14,dy:.52,w:1.46,h:.4,z:.135},
 talia_common_bookcase:{rows:4,y0:.12,dy:.5,w:1.28,h:.4,z:.155},
 iziz_court_painting:{canvas:true,y:1.8,w:1.14,h:.88,z:0,
  frame:[[0,2.28,.012,1.3,.08,0],[0,1.32,.012,1.3,.08,Math.PI],[-.61,1.8,.013,.88,.08,Math.PI/2],[.61,1.8,.013,.88,.08,-Math.PI/2]]},
 talia_common_jar_stand:{jars:[[-.34,0,'courtVaseA'],[0,0,'courtVaseB'],[.34,0,'courtVaseA']],seg:10,...COURT_V(.12,.17,.07,.36,.76,.92)},
 iziz_court_jug:{jars:[[-.1,0,'courtVaseA']],seg:12,...COURT_V(.055,.09,.045,.012,.1104,.2088,1.04)},
 iziz_court_carpet:{floor:true,y:.032,w:3,h:2.1,tex:['courtCarpetA']},
 iziz_common_rug:{floor:true,y:.032,w:2.2,h:1.5,tex:['courtCarpetB']},
 iziz_court_wall_rug:{panel:true,y:.83,z:-.02,w:1.96,h:1.46,tex:['courtCarpetA','courtCarpetB']},
 iziz_court_art:{panel:true,variant:0,y:.45,z:-.152,w:.86,h:.86,tex:['courtMosaic']},
 iziz_common_art:{panel:true,variant:1,y:.45,z:-.152,w:.86,h:.86,tex:['courtMosaicB']}};
const COURT_TRI={courtMarquetry:{tile:.6},courtBrocade:{tile:.5},courtOpus:{tile:.5},courtGilt:{tile:.4,detail:true},courtVelvet:{tile:.3,detail:true}};
function courtHash(p){return Math.abs(Math.round(p.x*7.3)*31+Math.round(p.z*5.1)*17+Math.round((p.y||0)*3.1)*7);}
// a geometry per shape, its UVs its own: 'plane' (a unit quad facing +z), 'strip:<len>' (a frame bar, the moulding
// repeated along it), 'floor' (a unit quad, turned to face up by its placement), 'lathe:<key>' (a jar's glaze band, once
// round, base to lip: the profile's knots kept, v by height)
const COURT_GEO={};
function courtGeo(id,mk){return COURT_GEO[id]||(COURT_GEO[id]=mk());}
function courtStrip(len,w){const g=new THREE.PlaneGeometry(len,w),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*len/(2*w));return g;}
function courtLathe(D){const P=D.lathe,pts=[];for(let a=0;a<2;a++)for(let i=a?1:0;i<=4;i++){const t=i/4;
  pts.push(new THREE.Vector2((P[a][0]+(P[a+1][0]-P[a][0])*t)*D.out,P[a][1]+(P[a+1][1]-P[a][1])*t));}
 const g=new THREE.LatheGeometry(pts,D.seg),ps=g.attributes.position,uv=g.attributes.uv,y0=P[0][1],y2=P[2][1];
 for(let i=0;i<uv.count;i++)uv.setY(i,(ps.getY(i)-y0)/(y2-y0));return g;}
// one placement's overlays in its piece's frame (+z front, y up from its foot): [{k: the court set, g: the shape, at, sx,
// sy, rz, rx}]. The page draws them turned by the placement (courtDecals); the export hands them to the piece (courtParts)
function courtLocal(p,paints){const D=COURT_DECALS[p.key],out=[];if(!D||(D.variant!=null&&(p.variant||0)!==D.variant))return out;
 const h=courtHash(p),put=(k,g,x,y,z,sx,sy,rz,rx)=>out.push({k,g,at:[x,y,z],sx,sy,rz:rz||0,rx:rx||0});
 courtGeo('plane',()=>new THREE.PlaneGeometry(1,1));courtGeo('floor',()=>new THREE.PlaneGeometry(1,1));
 if(D.canvas){if(paints.length)put(paints[h%paints.length],'plane',0,D.y,D.z,D.w,D.h);
  for(const f of D.frame){courtGeo('strip:'+f[3],()=>courtStrip(f[3],f[4]));put('courtFrame','strip:'+f[3],f[0],f[1],f[2],1,1,f[5]);}}
 else if(D.rows)for(let k=0;k<D.rows;k++)put(k%2?'courtBooksB':'courtBooksA','plane',0,D.y0+k*D.dy+D.h/2,D.z,D.w,D.h);
 else if(D.jars){const id='lathe:'+p.key;courtGeo(id,()=>courtLathe(D));D.jars.forEach(J=>put(J[2],id,J[0],0,J[1],1,1));}
 else if(D.floor)put(D.tex[h%D.tex.length],'floor',0,D.y,0,D.w,D.h,0,-Math.PI/2);
 else if(D.panel)put(D.tex[(p.variant||0)%D.tex.length],'plane',0,D.y,D.z,D.w,D.h);
 return out;}
const _cq=new THREE.Quaternion(),_ce=new THREE.Euler(),_cp=new THREE.Vector3(),_cs=new THREE.Vector3();
function courtMatrix(o,m4){_cp.set(o.at[0],o.at[1],o.at[2]);_ce.set(o.rx,0,o.rz,'YXZ');_cq.setFromEuler(_ce);_cs.set(o.sx,o.sy,1);return m4.compose(_cp,_cq,_cs);}
function courtDecals(S){if(!S.decals||!S.decals.length||typeof KMAT==='undefined'||!KMAT.bindMat)return;
 const keys=['courtBooksA','courtBooksB','courtFrame','courtVaseA','courtVaseB','courtCarpetA','courtCarpetB','courtMosaic','courtMosaicB'],M={};
 for(let k=1;k<=24;k++)keys.push('courtPaint'+k);
 for(const k of keys)M[k]=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8,metalness:0});
 const bound=KMAT.bindMat('iziz',M,{})||{};if(!Object.keys(bound).length)return;
 if(M.courtFrame)M.courtFrame.metalness=.3;   /* the gilt reads as gold without an environment map */
 const paints=keys.filter(k=>/^courtPaint/.test(k)&&bound[k]);
 S.courtM={};for(const k in bound)S.courtM[k]=M[k];S.courtPaints=paints;
 const lists={},L=new THREE.Matrix4(),W=new THREE.Matrix4(),R=new THREE.Matrix4();
 for(const p of S.decals){R.makeRotationY(p.ry||0).setPosition(p.x,p.y||0,p.z);
  for(const o of courtLocal(p,paints)){if(!bound[o.k])continue;const id=o.k+'|'+o.g;
   (lists[id]=lists[id]||{k:o.k,g:o.g,L:[]}).L.push(W.multiplyMatrices(R,courtMatrix(o,L)).clone());}}
 let n=0;for(const id in lists){const E=lists[id],im=new THREE.InstancedMesh(COURT_GEO[E.g],M[E.k],E.L.length);
  E.L.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;
  im.userData.inspectLabel='court pictures';im.userData.interiors=true;im.userData.courtOverlay=true;S.group.add(im);n+=E.L.length;}
 S.courtDecals=n;}
// the export's view of one placement's overlays (settlements/iziz/targets/city/94-city-export.js ixFurniture): parts in the
// piece's frame, named as the batch names its meshes, each its own geometry and the court set's bound material, so a
// piece carries its painting, frame, glaze or carpet into the furniture section with it
function courtParts(p){const S=typeof IZIX!=='undefined'?IZIX:null;if(!S||!S.courtM)return [];const L=new THREE.Matrix4();
 return courtLocal(p,S.courtPaints||[]).filter(o=>S.courtM[o.k]).map(o=>({name:'furniture:court/'+o.k,g:COURT_GEO[o.g].clone().applyMatrix4(courtMatrix(o,L)),mat:S.courtM[o.k]}));}
// the finishes: the batch meshes whose texture family COURT_TRI names take the set, triplanar in world space
function courtFinish(g){if(typeof KMAT==='undefined'||!KMAT.packed||KMAT.mode!=='lib')return 0;let n=0;
 g.traverse(m=>{if(!m.isMesh||!m.material||m.material.isMeshBasicMaterial)return;const tf=m.material.userData.texFamily,C=tf&&COURT_TRI[tf];if(!C)return;
  const L=KMAT.packed('iziz',tf);if(!L)return;const T=KMAT.textures(L,{aniso:8});if(!T||!T.map)return;
  const t=T.map;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1);
  const mt=m.material,mean=L.tint&&L.tint.mean!=null?L.tint.mean:.5,gain=C.detail?1/Math.max(.05,Math.pow(mean,2.2)):1;
  mt.map=t;if(L.metal!=null&&C.detail)mt.metalness=Math.max(mt.metalness,L.metal*.8);
  mt.userData.lib=L.lib;mt.userData.courtTri={tile:C.tile,detail:!!C.detail,gain:+gain.toFixed(4),fam:tf};
  mt.onBeforeCompile=function(sh){sh.uniforms.uCtTile={value:1/C.tile};sh.uniforms.uCtGain={value:gain};
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCtP;varying vec3 vCtN;')
    .replace('#include <uv_vertex>','#include <uv_vertex>\nvCtP=position;vCtN=normal;');
   let f=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCtP;varying vec3 vCtN;uniform float uCtTile;uniform float uCtGain;')
    .replace('#include <map_fragment>',['#ifdef USE_MAP','vec3 cW=pow(abs(normalize(vCtN))+1e-4,vec3(4.0));cW/=(cW.x+cW.y+cW.z);vec3 cP=vCtP*uCtTile;',
     'vec4 texelColor=texture2D(map,cP.zy)*cW.x+texture2D(map,cP.xz)*cW.y+texture2D(map,cP.xy)*cW.z;texelColor=mapTexelToLinear(texelColor);',
     C.detail?'diffuseColor.rgb*=texelColor.rgb*uCtGain;':'diffuseColor.rgb=texelColor.rgb;','#endif'].join('\n'));
   if(!C.detail)f=f.replace('#include <color_fragment>','');
   sh.fragmentShader=f;};
  mt.customProgramCacheKey=function(){return 'court-tri|'+tf;};mt.needsUpdate=true;n++;});
 return n;}
const IZIX=(function(){
 const S={on:false,total:0,done:0,rooms:0,pieces:0,retries:0,residenceFails:[],dropped:[],units:[],ms:0,group:null,byKey:{},missing:{},jobs:[],placed:[]};
 const report=()=>{window._interiors={on:S.on,total:S.total,done:S.done,bare:S.bare||0,rooms:S.rooms,pieces:S.pieces,retries:S.retries,
  residenceFails:S.residenceFails.length,residenceFailList:S.residenceFails.slice(0,20),dropped:S.dropped.length,droppedList:S.dropped.slice(0,20),
  units:S.units.length,ms:Math.round(S.ms),near:{cells:S.nearCells||0,buildings:S.nearDone||0,towerStoreys:S.towerStoreys||0},walls:VHOLLOW.walls,bodies:VHOLLOW.bodies,structure:VHOLLOW.structure,
  meshes:S.group?S.group.children.length:0,keys:Object.keys(S.byKey).length};};
 if(!VERN.interiors||typeof KratorFurniture==='undefined'||typeof KratorInteriors==='undefined'||!VHOLLOW.jobs.length){report();return S;}
 S.on=true;S.decals=[];const IX=KratorInteriors,t0=performance.now();
 let curParent=null;
 // an adapter on its own batch, every piece it builds registered in core/tags and IZIX.placed
 const makeAdapter=batch=>{const adapter=IX.runtimeAdapter(KratorFurniture,batch),build0=adapter.build;
 adapter.build=function(p,room){const E=KratorFurniture.FURN_BY_KEY[p.key]||{},t={setting:'room'};
  if(E.culture)t.culture=E.culture;if(E.tier)t.tier=E.tier;if(room&&room.id!=null)t.room=String(room.id);
  const rec=KTAGS.page.add({prefix:'ixf','class':'furniture',kind:E.type||null,key:p.key,name:E.name||null,parent:curParent,
   at:[p.x,p.y||0,p.z],ry:p.ry||0,size:E.w?[E.w,E.d,E.h]:undefined,tags:t,frag:'95i-iziz-interiors.js'});
  S.placed.push({id:rec.id,key:p.key,variant:p.variant|0,seed:p.seed,wealth:room?room.wealth:.5,span:p.span||0,x:p.x,y:p.y||0,z:p.z,ry:p.ry||0,
   room:t.room||null,building:curParent});
  return build0.call(this,p,room);};return adapter;};
 const batch=KratorFurniture.batch({indexed:true}),adapter=makeAdapter(batch);
 // a drawn window belongs to a room when it stands on one of the room's walls (within 0.45 m) and inside its storey
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2)):0;return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);};
 const patch=(R,J)=>{const P=R.poly,win=[];
  for(const o of J.ops){const y0=J.y+o.y0,y1=J.y+o.y1;if(y1<=R.y+.2||y0>=R.y+R.h-.2)continue;
   let best=1e9,bi=-1;for(let i=0;i<P.length;i++){const d=segD(o.at,P[i],P[(i+1)%P.length]);if(d<best){best=d;bi=i;}}
   if(best>.45)continue;const a=P[bi],b=P[(bi+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),t=((o.at[0]-a[0])*(b[0]-a[0])+(o.at[1]-a[1])*(b[1]-a[1]))/(L*L);
   const tt=Math.max(0,Math.min(1,t));win.push({at:[a[0]+(b[0]-a[0])*tt,a[1]+(b[1]-a[1])*tt],w:o.w,sill:Math.max(0,y0-R.y),h:Math.min(y1,R.y+R.h)-Math.max(y0,R.y)});}
  const R2=IX.normRoom(Object.assign({},R.src,{windows:win}));
  ['setItem','setBody','explicit','level'].forEach(k=>{if(R[k]!==undefined)R2[k]=R[k];});return R2;};
 VHOLLOW.jobs.forEach((J,i)=>{
  const id='iziz.'+J.key+'.'+i,reg=REG[J.r0],parent=reg&&typeof REG_ID!=='undefined'?REG_ID.get(reg)||null:null;
  let inst;try{inst=IX.sets.instantiate(J.item,J.x,J.z,J.ry,{baseY:J.y,register:false,seed:0,prefix:id+'.',walk:KWALK,walkTag:'interior:'+id});}
  catch(e){reportErr('interior '+J.key+': '+(e&&e.message||e));return;}
  inst.buildings.forEach(B=>(B.report.dropped||[]).forEach(d=>S.dropped.push(id+': '+d.kinds.join('+')+' ('+d.why+')')));
  inst.rooms=inst.rooms.map(R=>{try{return patch(R,J);}catch(e){return R;}});
  S.total++;S.rooms+=inst.rooms.length;curParent=parent;
  const E={id,parent,inst,J};S.jobs.push(E);S.done++;
  if(!izixFurnish(J)){E.bare=true;S.bare=(S.bare||0)+1;return;}
  furnish(E,adapter);});
 // plan, check the residence rule, retry with another seed; then build the plan that passed (or the last), into adapter's batch
 function furnish(E,adapter){if(!E.inst&&E.make)E.inst=E.make(IX);   // a tower's storey (78v) is planned only when it is furnished
  const {id,parent,inst,J}=E;curParent=parent;
  let plans,res,seed=0;
  for(let att=0;att<3;att++){plans={};inst.rooms.forEach(R=>{plans[R.id]=IX.furnishRoom(R,adapter,{seed});});
   res=IX.sets.auditResidence(inst,plans);if(!res.fails.length)break;seed+=101;S.retries++;}
  // a ruin (a ruined or toppled tower's storeys, a reclaimed tower's junk above the slum; the owner, 2026-10-19: "ruined bldgs
  // should have much less furniture and anything they have should be in a ruined, rusty state"): a fifth of the plan stays,
  // chosen by a hash of where it stands; its batch is rusted when flushed (flush below)
  if(J.ruin)inst.rooms.forEach(R=>{const P=plans[R.id],keep=new Set();   /* a piece on another goes with its host; no lamps lit */
   P.placements=P.placements.filter(p=>{const h=Math.abs(Math.sin(p.x*12.9898+(p.y||0)*4.1+p.z*78.233))*43758.5453,ok=h-Math.floor(h)<.2&&(!p.host||keep.has(p.host));if(ok)keep.add(p.id);return ok;});
   P.placements.forEach(p=>{delete p.lights;});P.lights=[];});
  let n=0;inst.rooms.forEach(R=>{const P=plans[R.id];IX.buildRoom(P,adapter,R);n+=P.placements.length;P.placements.forEach(p=>{if(COURT_DECALS[p.key])S.decals.push(p);});
   P.placements.forEach(p=>{const k=p.key;S.byKey[k]=(S.byKey[k]||0)+1;});
   (P.missing||[]).forEach(m=>{S.missing[m.need||m]=(S.missing[m.need||m]||0)+1;});});
  if(res.fails.length)S.residenceFails=S.residenceFails.concat(res.fails);
  S.pieces+=n;E.bare=false;
  // the cutaway unit: the plot's box, its storeys from the plan (one per distinct floor height)
  const lv=[];J.levels.slice().sort((a,b)=>a.y-b.y).forEach(L=>{const y=J.y+L.y;if(!lv.length||Math.abs(lv[lv.length-1].y-y)>.5)lv.push({y,h:L.h,name:lv.length?'storey '+(lv.length+1):'ground'});});
  if(!J.tower)S.units.push({id,name:J.name+(J.v?' (v'+(J.v+1)+')':''),x:J.x,z:J.z,ry:J.ry,w:J.w,d:J.d,levels:lv,parent,rooms:inst.rooms.length,pieces:n,residence:res.residence?{beds:res.beds,food:res.food,items:res.items,fails:res.fails.length}:null});curParent=null;}
 if(window.IZTOWER_UNITS)S.units.push(...window.IZTOWER_UNITS);   // the towers' units, every storey (78v)
 S.group=new THREE.Group();S.group.name='interiors-furniture';S.group.userData.inspectLabel='Furniture (interiors)';scene.add(S.group);
 // every flush's meshes fold into one standing mesh per material (the near pass flushes a batch per cell: left apart, the
 // furniture was 51 draw calls at the city's opening view). Geometries join attribute by attribute when they carry the
 // same ones; anything else stays its own mesh.
 const fam=new Map(),famKey=m=>{const M=m.material;if(Array.isArray(M)||m.geometry.groups.length)return null;
  return[M.type,M.map?M.map.uuid:'',M.normalMap?M.normalMap.uuid:'',M.color?M.color.getHex():'',M.vertexColors,M.transparent,M.side,M.name,Object.keys(m.geometry.attributes).sort().join(',')].join('|');};
 const join=(A,B)=>{const g=new THREE.BufferGeometry(),na=A.attributes.position.count;
  for(const k in A.attributes){const a=A.attributes[k],b=B.attributes[k],arr=new a.array.constructor(a.array.length+b.array.length);arr.set(a.array,0);arr.set(b.array,a.array.length);
   g.setAttribute(k,new THREE.BufferAttribute(arr,a.itemSize,a.normalized));}
  if(A.index&&B.index){const n=A.index.count+B.index.count,I=na+B.attributes.position.count>65535?new Uint32Array(n):new Uint16Array(n);I.set(A.index.array,0);
   for(let i=0;i<B.index.count;i++)I[A.index.count+i]=B.index.array[i]+na;g.setIndex(new THREE.BufferAttribute(I,1));}
  g.computeBoundingSphere();g.computeBoundingBox();return g;};
 // rust: vertex colours darkened and pulled to iron-oxide browns, mottled by position; a mesh without vertex colours gets a
 // rust-tinted copy of its material
 const RUST=[0x6e4128,0x5a3424,0x84532f,0x4a3d33].map(h=>new THREE.Color(h)),rustMat=new Map();
 const rust=m=>{const g=m.geometry,C=g.attributes.color,Pp=g.attributes.position;
  if(C&&m.material.vertexColors){for(let i=0;i<C.count;i++){const x=Pp.getX(i),y=Pp.getY(i),z=Pp.getZ(i),h=Math.abs(Math.sin(x*3.1+y*7.7+z*5.3)*9631.7)%1,R=RUST[Math.floor(h*4)],k=.5+.35*h;
    C.setXYZ(i,C.getX(i)*.5*(1-k)+R.r*k,C.getY(i)*.5*(1-k)+R.g*k,C.getZ(i)*.5*(1-k)+R.b*k);}C.needsUpdate=true;return;}
  const M=m.material;if(Array.isArray(M))return;let N=rustMat.get(M);if(!N){N=M.clone();if(N.color)N.color.multiply(new THREE.Color(0x9a6a4a));N.name=(M.name||'')+' rust';rustMat.set(M,N);}m.material=N;};
 const flush=(b,rusty)=>{const g=b.flush(S.group),list=[];S.courtFinishes=(S.courtFinishes||0)+(courtFinish(g)||0);   /* the court's finishes before the families fold (their materials keep them apart) */
 g.traverse(m=>{if(!m.isMesh)return;if(rusty)rust(m);KFURN.linearColours(m.geometry);m.userData.inspectLabel='furniture (catalog)';m.userData.interiors=true;m.userData.lodSkip=true;list.push(m);});
  for(const m of list){const k=famKey(m),F=k&&fam.get(k);if(!k||!F){if(k)fam.set(k,m);continue;}
   if(!!F.geometry.index!==!!m.geometry.index){continue;}const old=F.geometry;F.geometry=join(old,m.geometry);old.dispose();m.geometry.dispose();m.parent.remove(m);}
  return g;};
 flush(batch);courtDecals(S);
 S.ms=performance.now()-t0;
 // ---- near the camera: the bare buildings, furnished as the eye comes within NEAR_R, a cell's batch flushed when it is done
 const NEAR_R=85,NEAR_CELL=100,PER_FRAME=2,cells=new Map();let tick=0;S.nearCells=0;S.nearDone=0;
 const add=(E,k)=>{let c=cells.get(k);if(!c){c={jobs:[],queued:false,i:0,batch:null,adapter:null};cells.set(k,c);}c.jobs.push(E);};
 for(const E of S.jobs)if(E.bare)add(E,Math.floor(E.J.x/NEAR_CELL)+','+Math.floor(E.J.z/NEAR_CELL));
 // the skyscrapers' storeys (78v, IZTOWER_JOBS): a cell per tower and 24 m of height, furnished when the eye is within
 // NEAR_R across and 30 m up or down
 for(const E of(window.IZTOWER_JOBS||[]))add(E,'t'+Math.floor(E.J.x/NEAR_CELL)+','+Math.floor(E.J.z/NEAR_CELL)+','+Math.floor(E.J.yc/24));
 S.towerStoreys=(window.IZTOWER_JOBS||[]).length;
 const queue=[];
 S.near=function(dt,pos){if(!cells.size)return;
  if((tick++%15)===0){for(const c of cells.values()){if(c.queued)continue;
    if(c.jobs.some(E=>Math.hypot(E.J.x-pos.x,E.J.z-pos.z)<NEAR_R&&(E.J.yc==null||Math.abs(E.J.yc-pos.y)<30))){c.queued=true;c.batch=KratorFurniture.batch({indexed:true});c.adapter=makeAdapter(c.batch);c.rbatch=KratorFurniture.batch({indexed:true});c.radapter=makeAdapter(c.rbatch);queue.push(c);}}}
  const c=queue[0];if(!c)return;
  for(let n=0;n<PER_FRAME&&c.i<c.jobs.length;n++){const E=c.jobs[c.i++];try{furnish(E,E.J.ruin?c.radapter:c.adapter);S.nearDone++;}catch(e){reportErr('interior '+E.J.key+': '+(e&&e.message||e));}}
  if(c.i>=c.jobs.length){flush(c.batch);flush(c.rbatch,true);c.batch=c.adapter=c.rbatch=c.radapter=null;queue.shift();S.nearCells++;report();}};
 report();return S;})();
if((window.CITY||window.IXTEST)&&IZIX.near)FRAME_HOOKS.push(dt=>IZIX.near(dt,camera.position));   // IXTEST: the interiors test sheet
// the furniture is drawn only where it can be seen: from within 60 m of the ground, or from a floor (a tower's storey):
// from the city's overviews nothing inside a building shows, and the catalog's families are some 30 draw calls
if(window.CITY&&IZIX.group){let n=0;FRAME_HOOKS.push(()=>{if(n++%10)return;const p=camera.position,low=p.y-terrainH(p.x,p.z)<60;
 let on=low;if(!on&&typeof KWALK!=='undefined'){const f=KWALK.floorBelow(p.x,p.z,p.y,0);on=!!f&&p.y-f[0]<6;}IZIX.group.visible=on;});}
