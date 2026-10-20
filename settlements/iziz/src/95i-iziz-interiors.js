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
const IZIX=(function(){
 const S={on:false,total:0,done:0,rooms:0,pieces:0,retries:0,residenceFails:[],dropped:[],units:[],ms:0,group:null,byKey:{},missing:{},jobs:[],placed:[]};
 const report=()=>{window._interiors={on:S.on,total:S.total,done:S.done,bare:S.bare||0,rooms:S.rooms,pieces:S.pieces,retries:S.retries,
  residenceFails:S.residenceFails.length,residenceFailList:S.residenceFails.slice(0,20),dropped:S.dropped.length,droppedList:S.dropped.slice(0,20),
  units:S.units.length,ms:Math.round(S.ms),near:{cells:S.nearCells||0,buildings:S.nearDone||0,towerStoreys:S.towerStoreys||0},walls:VHOLLOW.walls,bodies:VHOLLOW.bodies,structure:VHOLLOW.structure,
  meshes:S.group?S.group.children.length:0,keys:Object.keys(S.byKey).length};};
 if(!VERN.interiors||typeof KratorFurniture==='undefined'||typeof KratorInteriors==='undefined'||!VHOLLOW.jobs.length){report();return S;}
 S.on=true;const IX=KratorInteriors,t0=performance.now();
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
  let n=0;inst.rooms.forEach(R=>{const P=plans[R.id];IX.buildRoom(P,adapter,R);n+=P.placements.length;
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
 const flush=(b,rusty)=>{const g=b.flush(S.group),list=[];g.traverse(m=>{if(!m.isMesh)return;if(rusty)rust(m);KFURN.linearColours(m.geometry);m.userData.inspectLabel='furniture (catalog)';m.userData.interiors=true;m.userData.lodSkip=true;list.push(m);});
  for(const m of list){const k=famKey(m),F=k&&fam.get(k);if(!k||!F){if(k)fam.set(k,m);continue;}
   if(!!F.geometry.index!==!!m.geometry.index){continue;}const old=F.geometry;F.geometry=join(old,m.geometry);old.dispose();m.geometry.dispose();m.parent.remove(m);}
  return g;};
 flush(batch);
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
