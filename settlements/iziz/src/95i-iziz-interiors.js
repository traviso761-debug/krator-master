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
// ?interiors=0 leaves the walls solid (89z-rows.js reads it) and furnishes nothing.
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
 iziz_common_art:{panel:true,variant:1,y:.45,z:-.152,w:.86,h:.86,tex:['courtMosaic']}};
const COURT_TRI={courtMarquetry:{tile:.6},courtBrocade:{tile:.5},courtOpus:{tile:.5},courtGilt:{tile:.4,detail:true},courtVelvet:{tile:.3,detail:true}};
function courtHash(p){return Math.abs(Math.round(p.x*7.3)*31+Math.round(p.z*5.1)*17+Math.round((p.y||0)*3.1)*7);}
function courtDecals(S){if(!S.decals||!S.decals.length||typeof KMAT==='undefined'||!KMAT.bindMat)return;
 const keys=['courtBooksA','courtBooksB','courtFrame','courtVaseA','courtVaseB','courtCarpetA','courtCarpetB','courtMosaic'],M={};
 for(let k=1;k<=24;k++)keys.push('courtPaint'+k);
 for(const k of keys)M[k]=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8,metalness:0});
 const bound=KMAT.bindMat('iziz',M,{})||{};if(!Object.keys(bound).length)return;
 const paints=keys.filter(k=>/^courtPaint/.test(k)&&bound[k]);
 // a geometry per shape, its UVs its own: 'plane' (a unit quad facing +z), 'strip:<len>' (a frame bar, the moulding
 // repeated along it), 'floor' (a unit quad facing up), 'lathe:<key>' (a jar's glaze band, once round, base to lip)
 const GEO={},geo=(id,mk)=>GEO[id]||(GEO[id]=mk());
 const strip=(len,w)=>{const g=new THREE.PlaneGeometry(len,w),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*len/(2*w));return g;};
 const lathe=D=>{const P=D.lathe,pts=[];for(let a=0;a<2;a++)for(let i=a?1:0;i<=4;i++){const t=i/4;
   pts.push(new THREE.Vector2((P[a][0]+(P[a+1][0]-P[a][0])*t)*D.out,P[a][1]+(P[a+1][1]-P[a][1])*t));}
  const g=new THREE.LatheGeometry(pts,D.seg),ps=g.attributes.position,uv=g.attributes.uv,y0=P[0][1],y2=P[2][1];
  for(let i=0;i<uv.count;i++)uv.setY(i,(ps.getY(i)-y0)/(y2-y0));return g;};   /* the profile's knots kept, v by height */
 const lists={},put=(k,g,x,y,z,ry,sx,sy,rz,rx)=>{if(!bound[k])return;const id=k+'|'+g;(lists[id]=lists[id]||{k,g,L:[]}).L.push([x,y,z,ry,sx,sy,rz||0,rx||0]);};
 for(const p of S.decals){const D=COURT_DECALS[p.key],ry=p.ry||0,c=Math.cos(ry),s=Math.sin(ry),y=p.y||0,h=courtHash(p);
  if(D.variant!=null&&(p.variant||0)!==D.variant)continue;
  const at=(lx,lz)=>[p.x+lx*c+lz*s,p.z-lx*s+lz*c];
  if(D.canvas){const q=at(0,D.z);if(paints.length)put(paints[h%paints.length],'plane',q[0],y+D.y,q[1],ry,D.w,D.h);
   for(const f of D.frame){const r=at(f[0],f[2]);geo('strip:'+f[3],()=>strip(f[3],f[4]));put('courtFrame','strip:'+f[3],r[0],y+f[1],r[1],ry,1,1,f[5]);}}
  else if(D.rows)for(let k=0;k<D.rows;k++){const q=at(0,D.z);put(k%2?'courtBooksB':'courtBooksA','plane',q[0],y+D.y0+k*D.dy+D.h/2,q[1],ry,D.w,D.h);}
  else if(D.jars){const id='lathe:'+p.key;geo(id,()=>lathe(D));D.jars.forEach(J=>{const q=at(J[0],J[1]);put(J[2],id,q[0],y,q[1],ry,1,1);});}
  else if(D.floor){const q=at(0,0);put(D.tex[h%D.tex.length],'floor',q[0],y+D.y,q[1],ry,D.w,D.h,0,-Math.PI/2);}
  else if(D.panel){const q=at(0,D.z);put(D.tex[(p.variant||0)%D.tex.length],'plane',q[0],y+D.y,q[1],ry,D.w,D.h);}}
 geo('plane',()=>new THREE.PlaneGeometry(1,1));geo('floor',()=>new THREE.PlaneGeometry(1,1));
 if(M.courtFrame)M.courtFrame.metalness=.3;   /* the gilt reads as gold without an environment map */
 const m4=new THREE.Matrix4(),qq=new THREE.Quaternion(),eu=new THREE.Euler(),pos=new THREE.Vector3(),sc=new THREE.Vector3();
 let n=0;for(const id in lists){const E=lists[id],im=new THREE.InstancedMesh(GEO[E.g],M[E.k],E.L.length);
  E.L.forEach((r,i)=>{pos.set(r[0],r[1],r[2]);eu.set(r[7],r[3],r[6],'YXZ');qq.setFromEuler(eu);sc.set(r[4],r[5],1);if(E.g==='floor')sc.set(r[4],r[5],1);
   m4.compose(pos,qq,sc);im.setMatrixAt(i,m4);});
  im.instanceMatrix.needsUpdate=true;im.userData.inspectLabel='court pictures';im.userData.interiors=true;S.group.add(im);n+=E.L.length;}
 S.courtDecals=n;}
// the finishes: the batch meshes whose texture family COURT_TRI names take the set, triplanar in world space
function courtFinish(g){if(typeof KMAT==='undefined'||!KMAT.packed||KMAT.mode!=='lib')return 0;let n=0;
 g.traverse(m=>{if(!m.isMesh||!m.material||m.material.isMeshBasicMaterial)return;const tf=m.material.userData.texFamily,C=tf&&COURT_TRI[tf];if(!C)return;
  const L=KMAT.packed('iziz',tf);if(!L)return;const T=KMAT.textures(L,{aniso:8});if(!T||!T.map)return;
  const t=T.map;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1);
  const mt=m.material,mean=L.tint&&L.tint.mean!=null?L.tint.mean:.5,gain=C.detail?1/Math.max(.05,Math.pow(mean,2.2)):1;
  mt.map=t;if(L.metal!=null&&C.detail)mt.metalness=Math.max(mt.metalness,L.metal*.8);
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
 const S={on:false,total:0,done:0,rooms:0,pieces:0,retries:0,residenceFails:[],dropped:[],units:[],ms:0,group:null,byKey:{},missing:{}};
 const report=()=>{window._interiors={on:S.on,total:S.total,done:S.done,rooms:S.rooms,pieces:S.pieces,retries:S.retries,
  residenceFails:S.residenceFails.length,residenceFailList:S.residenceFails.slice(0,20),dropped:S.dropped.length,droppedList:S.dropped.slice(0,20),
  units:S.units.length,ms:Math.round(S.ms),walls:VHOLLOW.walls,bodies:VHOLLOW.bodies,structure:VHOLLOW.structure,
  meshes:S.group?S.group.children.length:0,keys:Object.keys(S.byKey).length};};
 if(!VERN.interiors||typeof KratorFurniture==='undefined'||typeof KratorInteriors==='undefined'||!VHOLLOW.jobs.length){report();return S;}
 S.on=true;S.decals=[];const IX=KratorInteriors,t0=performance.now();
 const batch=KratorFurniture.batch({indexed:true}),adapter=IX.runtimeAdapter(KratorFurniture,batch);
 const build0=adapter.build;let curParent=null;
 adapter.build=function(p,room){const E=KratorFurniture.FURN_BY_KEY[p.key]||{},t={setting:'room'};
  if(E.culture)t.culture=E.culture;if(E.tier)t.tier=E.tier;if(room&&room.id!=null)t.room=String(room.id);
  KTAGS.page.add({prefix:'ixf','class':'furniture',kind:E.type||null,key:p.key,name:E.name||null,parent:curParent,
   at:[p.x,p.y||0,p.z],ry:p.ry||0,size:E.w?[E.w,E.d,E.h]:undefined,tags:t,frag:'95i-iziz-interiors.js'});
  return build0.call(this,p,room);};
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
  let inst;try{inst=IX.sets.instantiate(J.item,J.x,J.z,J.ry,{baseY:J.y,register:false,seed:0,prefix:id+'.'});}
  catch(e){reportErr('interior '+J.key+': '+(e&&e.message||e));return;}
  inst.buildings.forEach(B=>(B.report.dropped||[]).forEach(d=>S.dropped.push(id+': '+d.kinds.join('+')+' ('+d.why+')')));
  inst.rooms=inst.rooms.map(R=>{try{return patch(R,J);}catch(e){return R;}});
  S.total++;S.rooms+=inst.rooms.length;curParent=parent;
  // plan, check the residence rule, retry with another seed; then build the plan that passed (or the last)
  let plans,res,seed=0;
  for(let att=0;att<3;att++){plans={};inst.rooms.forEach(R=>{plans[R.id]=IX.furnishRoom(R,adapter,{seed});});
   res=IX.sets.auditResidence(inst,plans);if(!res.fails.length)break;seed+=101;S.retries++;}
  let n=0;inst.rooms.forEach(R=>{const P=plans[R.id];IX.buildRoom(P,adapter,R);n+=P.placements.length;P.placements.forEach(p=>{if(COURT_DECALS[p.key])S.decals.push(p);});
   P.placements.forEach(p=>{const k=p.key;S.byKey[k]=(S.byKey[k]||0)+1;});
   (P.missing||[]).forEach(m=>{S.missing[m.need||m]=(S.missing[m.need||m]||0)+1;});});
  if(res.fails.length)S.residenceFails=S.residenceFails.concat(res.fails);
  S.pieces+=n;S.done++;
  // the cutaway unit: the plot's box, its storeys from the plan (one per distinct floor height)
  const lv=[];J.levels.slice().sort((a,b)=>a.y-b.y).forEach(L=>{const y=J.y+L.y;if(!lv.length||Math.abs(lv[lv.length-1].y-y)>.5)lv.push({y,h:L.h,name:lv.length?'storey '+(lv.length+1):'ground'});});
  S.units.push({id,name:J.name+(J.v?' (v'+(J.v+1)+')':''),x:J.x,z:J.z,ry:J.ry,w:J.w,d:J.d,levels:lv,parent,rooms:inst.rooms.length,pieces:n,residence:res.residence?{beds:res.beds,food:res.food,items:res.items,fails:res.fails.length}:null});});
 curParent=null;
 S.group=new THREE.Group();S.group.name='interiors-furniture';S.group.userData.inspectLabel='Furniture (interiors)';scene.add(S.group);
 const g=batch.flush(S.group);g.traverse(m=>{if(!m.isMesh)return;KFURN.linearColours(m.geometry);m.userData.inspectLabel='furniture (catalog)';m.userData.interiors=true;});
 S.courtFinishes=courtFinish(g);courtDecals(S);
 S.ms=performance.now()-t0;report();return S;})();
