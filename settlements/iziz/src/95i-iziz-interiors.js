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
const IZIX=(function(){
 const S={on:false,total:0,done:0,rooms:0,pieces:0,retries:0,residenceFails:[],dropped:[],units:[],ms:0,group:null,byKey:{},missing:{},jobs:[],placed:[]};
 const report=()=>{window._interiors={on:S.on,total:S.total,done:S.done,rooms:S.rooms,pieces:S.pieces,retries:S.retries,
  residenceFails:S.residenceFails.length,residenceFailList:S.residenceFails.slice(0,20),dropped:S.dropped.length,droppedList:S.dropped.slice(0,20),
  units:S.units.length,ms:Math.round(S.ms),walls:VHOLLOW.walls,bodies:VHOLLOW.bodies,structure:VHOLLOW.structure,
  meshes:S.group?S.group.children.length:0,keys:Object.keys(S.byKey).length};};
 if(!VERN.interiors||typeof KratorFurniture==='undefined'||typeof KratorInteriors==='undefined'||!VHOLLOW.jobs.length){report();return S;}
 S.on=true;const IX=KratorInteriors,t0=performance.now();
 const batch=KratorFurniture.batch({indexed:true}),adapter=IX.runtimeAdapter(KratorFurniture,batch);
 const build0=adapter.build;let curParent=null;
 adapter.build=function(p,room){const E=KratorFurniture.FURN_BY_KEY[p.key]||{},t={setting:'room'};
  if(E.culture)t.culture=E.culture;if(E.tier)t.tier=E.tier;if(room&&room.id!=null)t.room=String(room.id);
  const rec=KTAGS.page.add({prefix:'ixf','class':'furniture',kind:E.type||null,key:p.key,name:E.name||null,parent:curParent,
   at:[p.x,p.y||0,p.z],ry:p.ry||0,size:E.w?[E.w,E.d,E.h]:undefined,tags:t,frag:'95i-iziz-interiors.js'});
  S.placed.push({id:rec.id,key:p.key,variant:p.variant|0,seed:p.seed,wealth:room?room.wealth:.5,span:p.span||0,x:p.x,y:p.y||0,z:p.z,ry:p.ry||0,
   room:t.room||null,building:curParent});
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
  let inst;try{inst=IX.sets.instantiate(J.item,J.x,J.z,J.ry,{baseY:J.y,register:false,seed:0,prefix:id+'.',walk:KWALK,walkTag:'interior:'+id});}
  catch(e){reportErr('interior '+J.key+': '+(e&&e.message||e));return;}
  inst.buildings.forEach(B=>(B.report.dropped||[]).forEach(d=>S.dropped.push(id+': '+d.kinds.join('+')+' ('+d.why+')')));
  inst.rooms=inst.rooms.map(R=>{try{return patch(R,J);}catch(e){return R;}});
  S.total++;S.rooms+=inst.rooms.length;curParent=parent;
  // plan, check the residence rule, retry with another seed; then build the plan that passed (or the last)
  let plans,res,seed=0;
  for(let att=0;att<3;att++){plans={};inst.rooms.forEach(R=>{plans[R.id]=IX.furnishRoom(R,adapter,{seed});});
   res=IX.sets.auditResidence(inst,plans);if(!res.fails.length)break;seed+=101;S.retries++;}
  let n=0;inst.rooms.forEach(R=>{const P=plans[R.id];IX.buildRoom(P,adapter,R);n+=P.placements.length;
   P.placements.forEach(p=>{const k=p.key;S.byKey[k]=(S.byKey[k]||0)+1;});
   (P.missing||[]).forEach(m=>{S.missing[m.need||m]=(S.missing[m.need||m]||0)+1;});});
  if(res.fails.length)S.residenceFails=S.residenceFails.concat(res.fails);
  S.pieces+=n;S.done++;S.jobs.push({id,parent,inst,J});
  // the cutaway unit: the plot's box, its storeys from the plan (one per distinct floor height)
  const lv=[];J.levels.slice().sort((a,b)=>a.y-b.y).forEach(L=>{const y=J.y+L.y;if(!lv.length||Math.abs(lv[lv.length-1].y-y)>.5)lv.push({y,h:L.h,name:lv.length?'storey '+(lv.length+1):'ground'});});
  S.units.push({id,name:J.name+(J.v?' (v'+(J.v+1)+')':''),x:J.x,z:J.z,ry:J.ry,w:J.w,d:J.d,levels:lv,parent,rooms:inst.rooms.length,pieces:n,residence:res.residence?{beds:res.beds,food:res.food,items:res.items,fails:res.fails.length}:null});});
 curParent=null;
 S.group=new THREE.Group();S.group.name='interiors-furniture';S.group.userData.inspectLabel='Furniture (interiors)';scene.add(S.group);
 const g=batch.flush(S.group);g.traverse(m=>{if(!m.isMesh)return;KFURN.linearColours(m.geometry);m.userData.inspectLabel='furniture (catalog)';m.userData.interiors=true;});
 S.ms=performance.now()-t0;report();return S;})();
