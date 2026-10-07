// prefix: nr
// ================================================================= THE FURNISHING PASS: every room of the arcology and its deck buildings
// Runs once per world build, after the geometry (91f-furnish.js calls nrInteriors()). No life layer: furniture only.
//
// ROOMS ARE DATA FIRST (README.md, "Furniture that is not always drawn is data first"):
//   CABINS (D3, D4: 600-odd). Each inhabited cabin is a room (IX.normRoom: its trapezoid between the frames, its corridor
//     door, its glass wall) in NR.cabins. Cabins of one CLASS (template width), door side, kind and deck are furnished
//     ONCE by the interiors kit's placer (furnishRoom, the master catalog through IX.runtimeAdapter) on a template room
//     (the class width x the cabin depth, the door where the real door is: nrCabinDoor uses the same offset); the
//     template's placements become a core/furnish RECORD in every cabin of that template, in the hull frame.
//   DECK BUILDINGS. Each building's rooms are its interior set item's (kits/interiors/sets/noahs-regret.js), planned at
//     the origin (nrPlanOf) and furnished once per item; every building of the item gets the records, moved to its lot.
//   SHIP'S ROOMS (NR.ROOMS: the galleys, the wardroom, the chart room, the sick bays, the armoury, the brig, the carpenter's
//     and cooper's shops, the sail loft, the bosun's store, the laundry, the strongroom, the chapel). Each is furnished once
//     by the placer on its own template room, with the ship's room kinds added to the kit's programmes below.
//   PUBLIC ROOMS (the bridge, the grand dining room, the crew messes, the greenhouse, the engine rooms, the atrium, the
//     corridors, the holds, the quay, the top deck): placed piece by piece below (FURNISH_H), drawn with the rest of the
//     world's furniture.
// DRAWING: a template's pieces are built once into a batch in the template's frame and drawn as InstancedMeshes, one
//   instance per room that uses it; only the rooms near the camera (and on the cut deck) are written into the instance
//   buffers (nrStreamTick, every 0.4 s). Every record exists whatever is drawn (SVF.placed, core/tags).
const NR_TPL={};             // template key -> {plan, room, n, draw:{meshes}, inst:[{m: Matrix4 (hull), p: [x,y,z] hull, deck}]}
const NR_INST=[];            // the drawn templates (their InstancedMeshes), for the stream tick
let NR_FURNG=null;           // the group (carrying NR_HULL) the instanced furniture hangs in
function nrCatalog(){if(!nrCatalog.c)nrCatalog.c=KratorInteriors.runtimeAdapter(KratorFurniture,KratorFurniture.batch());return nrCatalog.c;}
/* a non-negative remainder (a variant index from a signed t) */
function nrMod(a,n){return ((a%n)+n)%n;}
function nrHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
/* furnish a template room once: {room, plan, audit} (the plan's placements are in the template's frame) */
function nrTemplate(key,def){if(NR_TPL[key])return NR_TPL[key];const IX=KratorInteriors,cat=nrCatalog();
 const R=IX.normRoom(Object.assign({id:'tpl.'+key,building:'tpl',seed:nrHash(key)%100000},def));
 const plan=furnishRoom(R,cat,{seed:0});let audit=null;try{audit=IX.audit(R,plan,cat);}catch(e){audit={ok:false,fails:['audit threw: '+e.message]};}
 return NR_TPL[key]={key,room:R,plan,audit,inst:[],kind:def.kind,wealth:def.wealth};}
/* a hull-frame transform for a template instance: origin (x, y, z), heading ry (the template's +z turned to (sin ry, cos ry)) */
function nrInstMatrix(x,y,z,ry){return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),ry),new THREE.Vector3(1,1,1));}
/* write a template's placements as records at one instance: (ox, oy, oz, ory) in the hull frame */
function nrInstRecords(T,ox,oy,oz,ory,ctx,roomId){const c=Math.cos(ory),s=Math.sin(ory);let n=0;
 for(const p of T.plan.placements){const hx=ox+p.x*c+p.z*s,hz=oz-p.x*s+p.z*c,hy=oy+p.y;
  const rec=FURNISH_H(p.key,hx,hy,hz,p.ry+ory,{v:p.variant,seed:p.seed,setting:'indoor',room:roomId},Object.assign({},ctx,{room:roomId,instanced:true}));
  if(rec)n++;
  for(const L of (p.lights||[])){const lx=L.x,lz=L.z;nrHalo(nrH2W(ox+lx*c+lz*s,oy+L.y,oz-lx*s+lz*c),/fire|brazier|stove|forge|hearth/.test(p.key));}}
 return n;}
/* build a template's pieces once and make its InstancedMeshes (capacity = its instance count) */
function nrTemplateDraw(T){if(!T.inst.length||!T.plan.placements.length)return;const B=KratorFurniture.batch();KratorFurniture.setDetail(.5);
 for(const p of T.plan.placements)B.place(p.key,p.x,p.y,p.z,p.ry,{variant:p.variant,seed:p.seed,wealth:T.wealth,setting:'indoor'});
 const g=B.flush(null);const meshes=[];
 g.traverse(m=>{if(!m.isMesh)return;KFURN.linearColours(m.geometry);const mt=m.material;if(!mt.map)svfDetail(mt);if(!mt.userData.nrCut){mt.userData.nrCut=1;nrCutHook(mt,mt.userData.family!=='glass'&&mt.userData.family!=='glow');}
  const im=new THREE.InstancedMesh(m.geometry,mt,T.inst.length);im.count=0;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=true;
  im.userData.furniture=true;im.userData.template=T.key;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);NR_FURNG.add(im);meshes.push(im);});
 T.meshes=meshes;NR_INST.push(T);}
/* the instanced templates near the camera (hull frame), only the cut deck's while the decks are cut */
const NR_STREAM={R:110,last:-1e9,drawn:0};
function nrStreamTick(force){const now=performance.now();if(!force&&now-NR_STREAM.last<400)return;NR_STREAM.last=now;
 const c=camera.position,h=nrW2H(c.x,c.y,c.z),R2=NR_STREAM.R*NR_STREAM.R;let drawn=0;
 const cut=ANIMU.uCutOn.value?ANIMU.uCutY.value:null,deckOk=I=>cut==null||I.deck==null||(I.floor<=cut&&cut<I.floor+NR.L.DH*1.05);
 for(const T of NR_INST){let n=0;for(const I of T.inst){const dx=I.p[0]-h[0],dz=I.p[2]-h[2],dy=I.p[1]-h[1];if(dx*dx+dz*dz+dy*dy*.25>R2||!deckOk(I))continue;
   for(const m of T.meshes)m.setMatrixAt(n,I.m);n++;}
  for(const m of T.meshes){m.count=n;m.instanceMatrix.needsUpdate=true;}drawn+=n;}
 NR_STREAM.drawn=drawn;}
FRAME_HOOKS.push(()=>{if(NR_INST.length)nrStreamTick(false);});
/* a cabin's template width: the widest class that fits its narrow end */
function nrCabinW(C){return C.cls>=0?NR.CABIN_CLASSES[C.cls]:Math.max(2.4,C.wMin-.1);}
// ---------------------------------------------------------------- the CABINS
const NR_CABIN_CULTURE={bedroom:'ancients-salvage',bunkroom:'scrap',store:'post-apoc'};
function nrFurnishCabins(arc){const L=NR.L,out={furnished:0,bare:0,empty:0,rooms:[]};
 for(const C of NR.cabins){if(!C.inhabited){out.empty++;
   /* the stripped cabins of D1 and D2: rooms in the data (empty, no door leaf), for the life layer to come */
   const pc=[NR.at(C.t0,C.sIn),NR.at(C.t1,C.sIn),NR.at(C.t1,C.sOut),NR.at(C.t0,C.sOut)],D=nrCabinDoor(C),dp=NR.at(D.tc,C.sIn);
   out.rooms.push({id:C.id,kind:'stripped',deck:'D'+(C.deck+1),poly:pc.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),y:L.D[C.deck],h:L.CLEAR,
    door:{at:[+dp[0].toFixed(3),+dp[1].toFixed(3)],w:.9,to:'corridor'},pieces:0});continue;}
  const wT=nrCabinW(C),d=C.depth-.1,kind=C.kind==='crew'?'bunkroom':C.kind,dxs=(C.doorEnd===0?-1:1)*(C.side>0?1:-1);
  /* two furnishings of each template, by the cabin's hash, so neighbours differ */
  const key='cabin|'+kind+'|'+wT.toFixed(1)+'|'+dxs+'|D'+(C.deck+1)+'|v'+(nrHash(C.id)%2);
  const T=nrTemplate(key,{kind,culture:NR_CABIN_CULTURE[kind],wealth:C.wealth,y:0,h:L.CLEAR-.04,
   poly:[[-wT/2,-d/2],[wT/2,-d/2],[wT/2,d/2],[-wT/2,d/2]],
   doors:[{at:[dxs*(wT/2-.75),d/2],w:.9,swing:'in',hinge:dxs<0?'left':'right'}],
   windows:[{at:[0,-d/2],w:Math.max(.8,wT-.8),sill:.55,h:2.3}]});
  /* the instance: the cabin's middle, its +z toward the corridor */
  const sm=(C.sIn+C.sOut)/2,o=NR.at(C.tm,sm),n=NR.nrm(C.tm),zx=-C.side*n[0],zz=-C.side*n[1],ry=Math.atan2(zx,zz),y=L.D[C.deck]+.02;
  const pieces=nrInstRecords(T,o[0],y,o[1],ry,{building:arc.tid,wealth:C.wealth,seed:nrHash(C.id)},C.id);
  T.inst.push({m:nrInstMatrix(o[0],y,o[1],ry),p:[o[0],y,o[1]],deck:C.deck,floor:L.D[C.deck],id:C.id});
  if(pieces>0)out.furnished++;else out.bare++;
  /* the cabin itself as a room (data: its real trapezoid in the hull frame) */
  const pc=[NR.at(C.t0,C.sIn),NR.at(C.t1,C.sIn),NR.at(C.t1,C.sOut),NR.at(C.t0,C.sOut)],D=nrCabinDoor(C),dp=NR.at(D.tc,C.sIn);
  out.rooms.push({id:C.id,kind,deck:'D'+(C.deck+1),culture:NR_CABIN_CULTURE[kind],wealth:C.wealth,template:key,poly:pc.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),y:L.D[C.deck],h:L.CLEAR,
   door:{at:[+dp[0].toFixed(3),+dp[1].toFixed(3)],w:.9,to:'corridor'},pieces});}
 return out;}
// ---------------------------------------------------------------- the SHIP'S ROOMS
/* the ship's room kinds, as programmes of the interiors kit (data: what each needs; KIND_ALIAS lets catalog pieces that
   list a kindred room qualify). Added once, before the first furnishing. */
function nrShipKinds(){const IX=KratorInteriors;if(IX.PROGRAMS.sickbay)return;const SURF=IX.SURFACE_GROUP,ITEM=IX.ITEM_ROLES;
 IX.PROGRAMS.sickbay={require:[{need:'cots',types:['bed'],n:3},{need:'medicine chest',types:['storage','shelf'],n:1}],
  optional:[{types:['bed'],max:2},{types:['desk','table'],max:1},{types:['chair','bench'],max:1},{types:['shelf','storage'],max:2},{types:['lamp'],max:1},SURF],extra:4};
 IX.KIND_ALIAS.sickbay=['bedroom','barracks','study','store'];
 IX.PROGRAMS.chartroom={require:[{need:'chart table',types:['table','desk'],n:1},{need:'chart shelves',types:['shelf'],n:1}],
  optional:[{types:['chair'],max:2},{types:['shelf','storage'],max:2},{types:['board'],max:1},{types:['lamp'],max:1},SURF],extra:5};
 IX.KIND_ALIAS.chartroom=['study','library'];
 IX.PROGRAMS.strongroom={require:[{need:'strongboxes',types:['storage'],roles:ITEM,n:3}],
  optional:[{types:['storage','shelf','stack'],max:4},{types:['desk'],max:1},{types:['chair'],max:1},SURF],extra:3};
 IX.KIND_ALIAS.strongroom=['store','study','court'];
 IX.PROGRAMS.armoury={require:[{need:'racks',types:['weapon','rack'],n:3}],
  optional:[{types:['weapon','rack'],max:3},{types:['storage','stack'],max:2},{types:['workstation'],max:1},SURF],extra:4};
 IX.KIND_ALIAS.armoury=['barracks','smithy','shop'];
 /* the brig's cells are the pirates' cages, placed by hand (nrFurnishPublic): the placer gives it the guard's bench and lamp */
 IX.PROGRAMS.brig={require:[{need:'guard bench',types:['bench','chair'],n:1}],optional:[{types:['lamp'],max:1},{types:['rack','weapon'],max:1}],extra:8};
 IX.KIND_ALIAS.brig=['barracks','yard','plaza'];
 IX.PROGRAMS.sailloft={require:[{need:'cutting tables',types:['table','loom'],n:2}],
  optional:[{types:['stack','storage'],max:3},{types:['rack','shelf'],max:2},{types:['bench','chair'],max:2},SURF],extra:5};
 IX.KIND_ALIAS.sailloft=['workshop','store','market','dock'];
 IX.PROGRAMS.laundry={require:[{need:'tubs',types:['vessel'],n:2},{need:'drying racks',types:['rack'],n:1}],
  optional:[{types:['stove'],max:1},{types:['storage','stack'],max:2},{types:['bench','table'],max:1},SURF],extra:4};
 IX.KIND_ALIAS.laundry=['workshop','kitchen','store','yard','stable'];
 for(const k of ['sickbay','chartroom','strongroom','armoury','brig','sailloft','laundry'])IX.KIND_WEIGHT[k]=1.2;}
function nrFurnishShipRooms(arc){nrShipKinds();const L=NR.L,out={rooms:[]};
 for(const R of NR.ROOMS){const y=L.D[R.deck]+.02,sm=(R.s0+R.s1)/2,sC=R.side>0?R.s0:R.s1,sG=R.side>0?R.s1:R.s0;
  /* the template room: as wide as the room's narrow end (the frames are radial), as deep as the band; +z to the corridor */
  /* the template room is the room's own trapezoid (its frames are radial), in the instance's frame: origin at its middle,
     +z toward the corridor */
  const o=NR.at(R.tc,sm),n=NR.nrm(R.tc),ry=Math.atan2(-R.side*n[0],-R.side*n[1]),c=Math.cos(ry),sn=Math.sin(ry);
  const loc=p=>{const dx=p[0]-o[0],dz=p[1]-o[1];return [dx*c-dz*sn,dx*sn+dz*c];};
  const ti=t=>.09/nrK(t,sm),corners=[[R.t0+ti(R.t0),R.s0],[R.t1-ti(R.t1),R.s0],[R.t1-ti(R.t1),R.s1],[R.t0+ti(R.t0),R.s1]].map(([t,s])=>loc(NR.at(t,s)));
  const poly=corners.sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));
  const dl=loc(NR.at(R.door,sC)),gl=loc(NR.at(R.tc,sG)),gw=(R.t1-R.t0)*nrK(R.tc,sG);
  const T=nrTemplate('room|'+R.id,{kind:R.kind,culture:R.culture,wealth:R.wealth,y:0,h:L.CLEAR-.04,poly,
   doors:[{at:[dl[0],dl[1]],w:1.1,swing:'in',hinge:'left'}],
   windows:[{at:[gl[0],gl[1]],w:Math.max(.8,gw-1.4),sill:.55,h:2.3}]});
  const pieces=nrInstRecords(T,o[0],y,o[1],ry,{building:arc.tid,wealth:R.wealth,seed:nrHash(R.id)},R.id);
  T.inst.push({m:nrInstMatrix(o[0],y,o[1],ry),p:[o[0],y,o[1]],deck:R.deck,floor:L.D[R.deck],id:R.id});
  const pc=[NR.at(R.t0,R.s0),NR.at(R.t1,R.s0),NR.at(R.t1,R.s1),NR.at(R.t0,R.s1)],dp=NR.at(R.door,sC);
  out.rooms.push({id:R.id,name:R.name,kind:R.kind,deck:'D'+(R.deck+1),culture:R.culture,wealth:R.wealth,template:T.key,poly:pc.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),y:L.D[R.deck],h:L.CLEAR,
   door:{at:[+dp[0].toFixed(3),+dp[1].toFixed(3)],w:1.1,to:'corridor'},pieces});}
 return out;}
/* the officers' berths in the bridge house (N.BRIDGEHOUSE.berths): each cabin furnished by the placer on its own outline */
function nrFurnishBerths(arc){const L=NR.L,B=NR.BRIDGEHOUSE,S=B.storeys[2],out={rooms:[]};
 for(const C of B.berths.cabins){const o=C.mid,dx=S.xc-o[0],dz=-o[1],ry=Math.atan2(dx,dz),c=Math.cos(ry),sn=Math.sin(ry);
  const loc=p=>{const ex=p[0]-o[0],ez=p[1]-o[1];return [ex*c-ez*sn,ex*sn+ez*c];};
  const poly=C.poly.map(loc).sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));
  /* the door at the middle of the corridor edge (the two corners nearest the corridor, +z), the window at the glass edge's */
  const byZ=poly.slice().sort((a,b)=>b[1]-a[1]),mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],d=mid(byZ[0],byZ[1]),w=mid(byZ[2],byZ[3]),y=C.y+.02;
  const ow=Math.hypot(byZ[2][0]-byZ[3][0],byZ[2][1]-byZ[3][1]);
  const T=nrTemplate('berth|'+C.id,{kind:'bedroom',culture:'post-apoc',wealth:.6,y:0,h:L.DH-L.SLAB-.04,poly,
   doors:[{at:d,w:1.0,swing:'in',hinge:'left'}],windows:[{at:w,w:Math.max(.8,Math.min(2.4,ow-1.2)),sill:.55,h:2.3}]});
  const pieces=nrInstRecords(T,o[0],y,o[1],ry,{building:arc.tid,wealth:.6,seed:nrHash(C.id)},C.id);
  T.inst.push({m:nrInstMatrix(o[0],y,o[1],ry),p:[o[0],y,o[1]],deck:null,id:C.id});
  out.rooms.push({id:C.id,name:"an officer's berth",kind:'bedroom',deck:'bridge house 3',poly:C.poly.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),y:C.y,h:L.DH-L.SLAB,
   door:{at:[+C.door[0].toFixed(3),+C.door[1].toFixed(3)],w:1.0,to:'corridor'},pieces});}
 return out;}
// ---------------------------------------------------------------- the DECK BUILDINGS
function nrFurnishBuildings(){const out={rooms:[],residences:0,residenceFails:[],items:{}};const IX=KratorInteriors,cat=nrCatalog();
 /* each building is furnished on its own (its own seed), so two buildings of one type differ */
 for(const Bt of NR_BUILT){const inst=nrPlanOf(Bt.item);if(!inst)continue;
  let IT=out.items[Bt.lot];
  if(!IT){IT=out.items[Bt.lot]={item:Bt.item,tpls:[],plans:{}};
   for(const R of inst.rooms){const key='bld|'+Bt.lot+'|'+R.id;const plan=furnishRoom(R,cat,{seed:nrHash(Bt.lot)%997});let audit=null;try{audit=IX.audit(R,plan,cat);}catch(e){audit={ok:false,fails:['audit threw: '+e.message]};}
    const T=NR_TPL[key]={key,room:R,plan,audit,inst:[],kind:R.kind,wealth:R.wealth};IT.tpls.push(T);IT.plans[R.id]=plan;}
   const ra=IX.sets.auditResidence(inst,IT.plans);IT.residence=ra;
   if(ra.residence){if(ra.fails.length)out.residenceFails.push(Bt.lot+' ('+Bt.item+'): '+ra.fails.join('; '));else out.residences++;}}
  const tid=Bt.rec&&Bt.rec.tid;
  for(const T of IT.tpls){const roomId=Bt.lot+'.'+T.room.id.replace(/^tpl\./,'');
   const pieces=nrInstRecords(T,Bt.x,Bt.y,Bt.z,Bt.ry,{building:tid,wealth:T.wealth,seed:nrHash(roomId)},roomId);
   T.inst.push({m:nrInstMatrix(Bt.x,Bt.y,Bt.z,Bt.ry),p:[Bt.x,Bt.y+T.room.y,Bt.z],deck:null,id:roomId});
   out.rooms.push({id:roomId,building:Bt.lot,use:Bt.use,item:Bt.item,kind:T.room.kind,level:T.room.level,pieces});}}
 return out;}
// ---------------------------------------------------------------- the PUBLIC ROOMS: placed piece by piece, in the ring's frame
/* a piece at ring position (t, s), height y, facing f: 'out' (+s), 'in' (-s), 'fwd' (+t), 'aft' (-t) or a number (radians
   from 'out'); wall pieces pass back = the s or t of the wall they stand against (their back flush to it) */
function nrPut(key,t,s,y,f,o,ctx){const N=NR.nrm(t),T=NR.tan(t);let fx,fz;
 if(f==='out'){fx=N[0];fz=N[1];}else if(f==='in'){fx=-N[0];fz=-N[1];}else if(f==='fwd'){fx=T[0];fz=T[1];}else if(f==='aft'){fx=-T[0];fz=-T[1];}
 else{const a=f||0;fx=N[0]*Math.cos(a)+T[0]*Math.sin(a);fz=N[1]*Math.cos(a)+T[1]*Math.sin(a);}
 const p=NR.at(t,s);return FURNISH_H(key,p[0],y,p[1],Math.atan2(fx,fz),o||{},ctx||{});}
/* a ceiling piece hung so its top is at y */
function nrHang(key,t,s,y,f,o,ctx){const A=KratorFurniture.FURN_BY_KEY[key];const h=A?KratorFurniture.entryDims(A,(o&&o.v)|0).h:1;return nrPut(key,t,s,y-h,f,o,ctx);}
function nrFurnishPublic(arc){const L=NR.L,W=NR.W,count={};const base={building:arc.tid,wealth:.5,seed:7};
 const put=(room,key,t,s,y,f,o)=>{const r=nrPut(key,t,s,y,f,Object.assign({room},o||{}),Object.assign({},base,{room,seed:nrHash(room+key+t.toFixed(1)+s.toFixed(1))}));if(r)count[room]=(count[room]||0)+1;return r;};
 const hang=(room,key,t,s,y,f,o)=>{const r=nrHang(key,t,s,y,f,Object.assign({room},o||{}),Object.assign({},base,{room,seed:nrHash(room+key+t.toFixed(1)+s.toFixed(1))}));if(r)count[room]=(count[room]||0)+1;return r;};
 // --- the BRIDGE (atop the bridge house, 43-nr-fore.js): the Ancients' consoles in an arc along the forward glass, the
 //     pirates' helm seat on a carpet in the middle, the chart table behind it, the crews' hangings, loot in the corners
 {const br=NR.BRIDGEHOUSE.bridge,y=br.y0+.06,top=br.y0+3.85,room='bridge';
  const putH=(key,x,yy,z,ry,o)=>{const r=FURNISH_H(key,x,yy,z,ry,Object.assign({room},o||{}),Object.assign({},base,{room,seed:nrHash(room+key+x.toFixed(1)+z.toFixed(1))}));if(r)count[room]=(count[room]||0)+1;return r;};
  /* +x forward: a piece facing forward has ry = PI/2 (its +z turned to +x) */
  const fwd=PI/2;
  for(let i=0;i<7;i++){const a=(i-3)*.32,x=br.xc+(br.a-2.4)*Math.cos(a),z=(br.b-3.2)*Math.sin(a);putH(i%2?'ancients_workstation':'yuni_ancient_glass_console',x,y,z,fwd-a*.9);}
  for(let i=0;i<5;i++){const a=(i-2)*.32,x=br.xc+(br.a-4.6)*Math.cos(a),z=(br.b-6.5)*Math.sin(a);putH('post-apoc_common_chair',x,y,z,fwd-a*.9);}
  putH('post-apoc_court_carpet',br.xc+1,y,0,fwd);putH('post-apoc_court_throne',br.xc+1,y,0,fwd,{v:0});
  /* the chart table abaft the helm, clear of the stair's well (N.BRIDGEHOUSE.stair) */
  putH('post-apoc_court_table',br.xc-12,y,8,fwd,{v:1});putH('post-apoc_common_books',br.xc-12.3,y+.8,8,fwd);
  for(const z of [-1,1])putH('post-apoc_common_chair',br.xc-12,y,8+z*1.2,z>0?PI:0);
  for(const z of [-8,0,8]){const A=KratorFurniture.FURN_BY_KEY['post-apoc_court_hanging'],h=A?KratorFurniture.entryDims(A,0).h:1;putH('post-apoc_court_hanging',br.xc-br.a+2.4,top-h,z,fwd);}
  putH('pa_drum',br.xc-br.a+3.2,y,-10,fwd);putH('pa_crate',br.xc-br.a+3.4,y,10,fwd);putH('scrap_trade_barrel',br.xc-br.a+4.4,y,-12,fwd);}
 // --- the GRAND DINING ROOM (D3-D4, the port hull): refectory runs and benches, the captain's table on the dais, the
 //     servery, chandeliers from the coffers, the crews' banners on the end walls
 {const Z=NR.zone('dining'),y=L.D[2]+.02,top=L.D[3]+L.CLEAR,PH=Z.tc;
  for(const s of [-15.5,-11,-3,3])for(let t=Z.t0+4.5;t<Z.t1-3;t+=4.6){if(s>9&&Math.abs(t-PH)<12)continue;
   put('dining','yuni_ancient_refectory_run',t,s,y,'out',{v:0});
   put('dining','yuni_ancient_moulded_bench',t,s-1.45,y,'out',{v:0});put('dining','yuni_ancient_moulded_bench',t,s+1.45,y,'in',{v:0});}
  for(const t of [PH-4.5,PH-1.5,PH+1.5,PH+4.5]){put('dining','post-apoc_court_table',t,14.5,y+.45,'out',{v:1});put('dining','post-apoc_common_chair',t,13.6,y+.45,'out');put('dining','post-apoc_common_chair',t,15.4,y+.45,'in');}
  put('dining','post-apoc_court_carpet',PH,14.5,y+.45,'out');put('dining','post-apoc_court_throne',PH-7.5,14.5,y+.45,'fwd');
  for(const t of [PH-9,PH+9])put('dining','post-apoc_court_statue',t,18,y+.45,'in');
  for(let t=Z.t0+6;t<Z.t1-5;t+=7.5)put('dining','pa_servery',t,-W.MAIN+.2+.38,y,'out');
  for(const t of [Z.t0+2.2,Z.t1-2.2])put('dining','scrap_trade_barrel',t,-W.MAIN+.2+.35,y,'out');
  for(const s of [-11,0,11])for(let t=Z.t0+8.6;t<Z.t1-4;t+=8.4)hang('dining','ancients_light_strip_ring',t,s,top-.6,'out');
  for(const [t,f] of [[Z.t0+.3+.06,'fwd'],[Z.t1-.3-.06,'aft']])for(const s of [-15,-9,9,15])put('dining','post-apoc_court_banner',t,s,y+2.6,f);}
 // --- the ENGINE ROOMS (D1-D2, the stern of each hull): what the pirates use them for (a workshop in one corner, a dump
 //     in another)
 for(const Z of NR.ZONES.filter(z=>z.kind==='engine')){const y=L.D[0]+.03;
  put('engine','pa_vice_bench',Z.t0+4,-W.MAIN+1.2,y,'out');put('engine','pa_vice_bench',Z.t0+8,-W.MAIN+1.2,y,'out');
  put('engine','pa_tool_rack',Z.t0+.3+.18+.1,-14,y,'fwd');put('engine','pa_tool_rack',Z.t0+.3+.18+.1,14,y,'fwd');
  for(let i=0;i<4;i++)put('engine','scrap_trade_locker',Z.t0+.6+.25,-5+i*1,y,'fwd');
  for(let i=0;i<7;i++){const t=Z.t1-3-(i%3)*1.4,s=8+Math.floor(i/3)*1.4;put('engine',i%2?'pa_drum':'pa_crate',t,s,y,'aft',{v:i%2});}
  put('engine','pa_drum_store',Z.t1-6,-16,y,'aft');put('engine','pa_hanging_lamp',Z.t0+6,-17,y,'out');}
 // --- the CREW MESSES (D3): long tables and benches in rows across the hall, the servery along the galley's end, barrels,
 //     lanterns, the crews' banners
 for(const Z of NR.ZONES.filter(z=>z.kind==='mess')){const y=L.D[2]+.02,top=y+L.CLEAR,room=Z.id,gal=NR.ROOMS.find(r=>r.kind==='kitchen'&&r.deck===2&&(Math.abs(r.t0-Z.t1)<.5||Math.abs(r.t1-Z.t0)<.5));
  const gEnd=gal?(Math.abs(gal.t0-Z.t1)<.5?Z.t1:Z.t0):Z.t1,gDir=gEnd===Z.t1?'aft':'fwd',farEnd=gEnd===Z.t1?Z.t0:Z.t1,fd=farEnd===Z.t0?1:-1;
  /* the long tables run along the hull (3 m), a bench either side */
  for(let t=Z.t0+4;t<Z.t1-5;t+=4.2)for(const s of [-15.5,-4.5,4.5,15.5]){put(room,'pa_long_table',t,s,y,'out');put(room,'pa_bench',t,s-.7,y,'out',{v:0});put(room,'pa_bench',t,s+.7,y,'in',{v:0});}
  for(const s of [-14,-9.75,9.75,14])put(room,'pa_servery',gEnd-(gDir==='aft'?1:-1)*.7,s,y,gDir==='aft'?'aft':'fwd');
  for(const s of [-17,17])for(let j=0;j<3;j++)put(room,j%2?'generic_keg':'generic_barrel',farEnd+fd*(.8+j*.9),s,y,fd>0?'fwd':'aft');
  for(let t=Z.t0+6;t<Z.t1-2;t+=8)for(const s of [-10,10])hang(room,'pa_hanging_lamp',t,s,top,'fwd',{v:nrMod(t|0,3)});
  for(const s of [-15,-5,5,15])put(room,'post-apoc_common_banner',farEnd+fd*.36,s,y+2.2,fd>0?'fwd':'aft');}
 // --- the GREENHOUSE (D4, under its glass vault): planters on the beds, cold frames down the walk, water butts, potting
 //     benches and seed sacks at the ends, the harvest in baskets, a scarecrow for the gulls
 {const Z=NR.zone('greenhouse'),y=L.D[3]+.02,room='greenhouse';
  for(let t=Z.t0+4;t<Z.t1-4;t+=6.8)put(room,'pa_cold_frame',t,0,y,'out');
  for(const s of [-17.2,17.2]){put(room,'pa_water_butt',Z.t0+1,s,y,'fwd');put(room,'pa_water_butt',Z.t1-1,s,y,'aft');}
  for(const s of [-12,12]){put(room,'generic_poor_workbench',Z.t0+.75,s,y,'fwd');put(room,'generic_sack',Z.t0+.6,s+(s>0?-2.2:2.2),y,'fwd');put(room,'generic_poor_workbench',Z.t1-.75,s,y,'aft');}
  for(const s of [-6,6]){put(room,'generic_veg_basket',Z.t1-1,s,y,'aft');put(room,'generic_produce',Z.t0+1,s,y,'fwd');}
  put(room,'pa_scarecrow',(Z.t0+Z.t1)/2,1.2,y,'out');}
 // --- the BRIG (D3): the pirates' cages along its outboard wall, the stocks by the door
 {const R=NR.room('brig'),y=L.D[R.deck]+.02,sG=R.side>0?R.s1-1.2:R.s0+1.2;
  for(let t=R.t0+2;t<R.t1-1.5;t+=3.2)put('brig',nrMod(t|0,2)?'pa_drum_cage':'pa_prisoner_cage',t,sG,y,R.side>0?'in':'out',{v:1});}
 // --- the BRIDGE HOUSE's decks (43-nr-fore.js), each round its spiral stair: the officers' hall (divans, low tables, rugs,
 //     a bar), the chart and signal deck (the Ancients' workstations along the glass, desks and shelves within), the
 //     officers' berths (beds round the glass, chests, screens), the lookout lounge (chairs turned to the glass)
 {const B=NR.BRIDGEHOUSE;
  const putH=(room,key,x,yy,z,ry,o)=>{const r=FURNISH_H(key,x,yy,z,ry,Object.assign({room},o||{}),Object.assign({},base,{room,seed:nrHash(room+key+x.toFixed(1)+z.toFixed(1))}));if(r)count[room]=(count[room]||0)+1;return r;};
  for(const S of B.storeys){const room='bridgehouse-'+S.k,y=S.y0+.02,n=S.poly.length;
   /* a point a fraction f of the way from the storey's middle to its glass, at the outline's i/N; facing in or out */
   const pt=(u,f)=>{const p=S.poly[Math.round(u*n)%n];return [S.xc+(p[0]-S.xc)*f,p[1]*f];};
   const face=(q,out)=>{const dx=(out?1:-1)*(q[0]-S.xc),dz=(out?1:-1)*q[1];return Math.atan2(dx,dz);};
   const SP=NR.FORE_SPIRAL,clear=q=>Math.hypot(q[0]-SP.x,q[1]-SP.z)>SP.hole+1.6&&Math.hypot(q[0]-B.stair.x,q[1]-B.stair.z)>B.stair.hole+1.2;
   const ring=(N,f,key,out,o,skip)=>{for(let i=0;i<N;i++){if(skip&&skip(i))continue;const q=pt((i+.5)/N,f);if(clear(q))putH(room,key,q[0],y,q[1],face(q,out),o);}};
   if(S.k===0){ring(16,.82,'post-apoc_court_divan',false);ring(16,.66,'post-apoc_court_low_table',false,{v:0});ring(8,.66,'post-apoc_court_carpet',false);
    ring(8,.74,'post-apoc_court_lamp',false,null,i=>i%2===1);const q=pt(.5,.5);putH(room,'post-apoc_common_counter',q[0],y,q[1],face(q,false));
    for(const dz of [-3,3])putH(room,'generic_keg',q[0]-1.2,y,q[1]+dz,face(q,false));
    /* the long tables of the officers' hall within the ring of divans, benches either side */
    ring(10,.46,'pa_long_table',false);ring(10,.38,'pa_bench',false,{v:0});ring(10,.54,'pa_bench',true,{v:0});ring(5,.3,'post-apoc_common_banner',false);}
   else if(S.k===1){ring(14,.86,'ancients_workstation',true);ring(14,.77,'post-apoc_common_chair',true);ring(7,.58,'post-apoc_common_desk',false);
    ring(7,.58,'post-apoc_common_bookcase',true,null,i=>i%2===0);ring(8,.42,'post-apoc_court_table',false,{v:1});ring(8,.34,'post-apoc_common_chair',true);ring(7,.5,'pa_radio_sets',false,null,i=>i%2===1);}
   else if(S.k===2){ring(10,.5,'post-apoc_common_lamp',false);ring(6,.4,'post-apoc_court_carpet',false);}   /* the berths themselves: nrFurnishBerths */
   else{ring(18,.86,'post-apoc_common_chair',true);ring(9,.74,'post-apoc_court_low_table',true,{v:0});ring(6,.58,'post-apoc_court_divan',true);}}}
 // --- the FORWARD HALLS behind the terraces (43-nr-fore.js): the pirates' market and grog hall on the plaza's level, the
 //     store above it, the drill hall, the forward gallery; pieces on a grid clear of the faces, the walls and the stair
 {const SP=NR.FORE_SPIRAL,FIT={'fwd-hall':[7,['pa_market_table','pa_tyre_table','pa_long_table','pa_brick_grill','pa_tyre_table','generic_keg']],
   'fwd-store':[5,['pa_pallet_load','generic_crate','pa_drum_store','pa_sacks','generic_barrel','pa_tyre_stack']],
   'fwd-drill':[7,['pa_archery_target','pa_weapon_rack','pa_armour_mannequin','pa_bench','pa_spear_drum']],
   'fwd-gallery':[6,['post-apoc_court_divan','post-apoc_court_low_table','post-apoc_common_chair','post-apoc_court_carpet','post-apoc_court_lamp']]};
  for(const H of NR.FORE_HALLS){const T=NR.TIERS[H.tier],[g,keys]=FIT[H.id],room=H.id,y=H.y0+.02;let k=0;
   const xs=T.poly.map(p=>p[0]),zs=T.poly.map(p=>p[1]);
   for(let x=Math.min(...xs)+g/2;x<Math.max(...xs);x+=g)for(let z=Math.min(...zs)+g/2;z<Math.max(...zs);z+=g){
    if(!NR.inPoly(T.poly,x,z)||[[2.6,0],[-2.6,0],[0,2.6],[0,-2.6]].some(([a,b])=>!NR.inPoly(T.poly,x+a,z+b)))continue;
    if(Math.hypot(x-SP.x,z-SP.z)<SP.hole+2.2)continue;
    const key=keys[k++%keys.length],r=FURNISH_H(key,x,y,z,-PI/2,{room},Object.assign({},base,{room,seed:nrHash(room+key+x.toFixed(1)+z.toFixed(1))}));if(r)count[room]=(count[room]||0)+1;
    if(key==='pa_long_table')for(const dz of [-.7,.7]){const r2=FURNISH_H('pa_bench',x,y,z+dz,dz>0?PI:0,{room,v:0},Object.assign({},base,{room,seed:nrHash(room+'b'+x+z+dz)}));if(r2)count[room]++;}}}}
 // --- the CHAIN LOCKER under the forecastle (40-nr-hull.js): nets, crates, drums and sacks where there is headroom
 for(const t of [-28,-22,-8,-4,4,8,22,28])for(const [s,key] of [[W.MAIN+2.4,nrMod(t|0,2)?'pa_net_pile':'generic_crate'],[W.MAIN+4.8,nrMod(t|0,3)?'pa_drum':'pa_sacks']])
  put('chainlocker',key,t,s,L.D[0]+.02,'in',{v:nrMod(t|0,2)});
 // --- the STERN LOUNGES (40-nr-hull.js nrStern): behind the doors at each hull's end, the D3 and D4 galleries under their
 //     glass and the terraces outside: divans and low tables turned aft, benches along the rails, lamps
 for(const [t,dir] of [[NR.T1,1],[NR.T0,-1]]){const c=NR.at(t,0),T=NR.tan(t),N=NR.nrm(t),A=[T[0]*dir,T[1]*dir],room='stern';
  const at=(r,ph)=>[c[0]+r*(Math.cos(ph)*A[0]+Math.sin(ph)*N[0]),c[1]+r*(Math.cos(ph)*A[1]+Math.sin(ph)*N[1])];
  const out=ph=>Math.atan2(Math.cos(ph)*A[0]+Math.sin(ph)*N[0],Math.cos(ph)*A[1]+Math.sin(ph)*N[1]);
  const putP=(key,r,ph,yy,f,o)=>{const q=at(r,ph),ry=f==='out'?out(ph):out(ph)+PI;const k=FURNISH_H(key,q[0],yy,q[1],ry,Object.assign({room},o||{}),Object.assign({},base,{room,seed:nrHash(room+key+q[0].toFixed(1)+q[1].toFixed(1))}));if(k)count[room]=(count[room]||0)+1;};
  for(const ph of [-1.1,-.55,0,.55,1.1]){putP('post-apoc_court_divan',13.5,ph,L.D[2]+.02,'out');putP('post-apoc_court_low_table',11.3,ph,L.D[2]+.02,'out',{v:0});
   putP('post-apoc_common_chair',11.8,ph,L.D[3]+.02,'out');putP('pa_bench',18.8,ph,L.D[2]+.02,'out',{v:0});putP('pa_bench',16.3,ph,L.D[3]+.02,'out',{v:0});}
  for(const ph of [-.8,0,.8])putP('post-apoc_court_lamp',8,ph,L.D[2]+.02,'out');
  /* the D1 and D2 galleries behind the stripped decks: the pirates' boat stores */
  for(const [d,keys] of [[0,['pa_net_pile','generic_crate','pa_drum','pa_hand_cart','pa_tyre_stack']],[1,['pa_sacks','generic_barrel','pa_pallet_load','generic_crate','pa_net_pile']]])
   keys.forEach((key,i)=>putP(key,13,-1.1+i*.55,L.D[d]+.02,'out',{v:i%2}));}
 // --- the FORECOURT PLAZA (quay level, 43-nr-fore.js): benches along the walks, lamp posts, the pirates' stalls and grog
 //     tables by the quay, and Ruephus's justice before his door (a gibbet, stocks, a cage)
 {const room='plaza',y=L.D[0]+.02,Pz=NR.PLAZA,hq=NR.LOTS.find(l=>l.use==='hq');
  const putH=(key,x,yy,z,ry,o)=>{const r=FURNISH_H(key,x,yy,z,ry,Object.assign({room},o||{}),Object.assign({},base,{room,seed:nrHash(room+key+x.toFixed(1)+z.toFixed(1))}));if(r)count[room]=(count[room]||0)+1;return r;};
  for(const sg of [1,-1]){
   for(let x=Pz.XP+8;x<NR.FORE_STAIR.x0-4;x+=12)putH('pa_lamp_post',x,y,sg*6,0,{v:nrMod(x|0,2)});
   for(const [x,z] of [[96,24],[126,24],[146,48],[166,22]])putH('pa_bench',x,y,sg*z,sg>0?PI:0,{v:0});
   /* the stalls and grog tables by the quay */
   for(let k=0;k<3;k++){const z=sg*(22+k*14);putH('pa_lean_to_stall',Pz.XP+5,y,z,-PI/2,{v:k%2});putH('pa_tyre_table',Pz.XP+10,y,z+sg*3,0);
    putH('pa_tyre_stool',Pz.XP+10,y,z+sg*1.8,0);putH('generic_keg',Pz.XP+3.5,y,z-sg*4,0);}
   /* justice before the headquarters' door (it faces aft, -x) */
   putH('pa_stocks',hq.x-20,y,sg*9,-PI/2);putH(sg>0?'pa_gibbet':'pa_prisoner_cage',hq.x-23,y,sg*15,-PI/2,{v:1});putH('pa_spear_drum',hq.x-17,y,sg*5.5,-PI/2);}}
 // --- the GRAND ATRIUM: lamp standards round the stair's foot, benches along the galleries, planters, statues at the doors,
 //     lanterns under the bridges
 {const A=NR.ATRIUM,tau=t=>A.tc+t,y1=L.D[0]+.02;
  for(const [t,s] of [[-9,-6],[-9,6],[8,-6],[8,6]])put('atrium','yuni_ancient_light_stem',tau(t),s,y1,'out');
  for(const s of [-16,16])for(const t of [-14,-6,6,14])put('atrium','pa_planter',tau(t),s,y1,'out');
  for(const s of [-17.6,17.6])for(const t of [-5.5,5.5])put('atrium','post-apoc_court_statue',tau(t),s,y1,s>0?'in':'out');
  for(let d=1;d<4;d++){const y=L.D[d]+.02;for(const s of [-18.6,18.6])for(const t of [-12,0,12])put('atrium','yuni_ancient_moulded_bench',tau(t),s,y,s>0?'in':'out');}
  for(let d=0;d<4;d++){const top=(d<3?L.D[d+1]:L.TOP)-L.SLAB;for(const s of [-17,17])for(const t of [-16,-4,8])hang('atrium','post-apoc_court_hanging',tau(t),s,top,'out');}}
 // --- the CORRIDORS on the inhabited decks: lanterns the pirates hung, every 18 m
 for(let d=2;d<4;d++){const top=L.D[d]+L.CLEAR;for(const s of [-9.75,9.75])for(let t=NR.T0+10;t<NR.T1-6;t+=18){if(NR.blocked(d,t-1,t+1,Math.min(s,s*1.01),Math.max(s,s*1.01)))continue;hang('corridors','pa_hanging_lamp',t,s,top,'fwd',{v:nrMod(t|0,3)});}}
 // --- the HOLDS: what is left of the cargo on the mezzanines
 for(let i=0;i<26;i++){const t=NR.T0+20+i*39.7,sg=i%2?1:-1,s=sg*(W.MEZZ+2.6);if(NR_BULKHEADS.some(b=>Math.abs(b.t-t)<4))continue;
  const y=L.MEZZ+.01,k=i%4;
  if(k===0)put('holds','pa_drum_store',t,s,y,'fwd');else if(k===1){for(let j=0;j<4;j++)put('holds','pa_crate',t+j*.7,s+(j%2)*.65,y,'fwd',{v:j%3});}
  else if(k===2)put('holds','pa_sacks',t,s,y,'fwd',{v:1});else put('holds','pa_net_pile',t,s,y,'fwd');}
 // --- the INNER QUAY and its floats: the port's cargo, nets and fish racks
 for(const F of NR.FLOATS){const y=L.D[0]+.01,s=-(W.MAIN+2.2);
  put('quay','pa_fish_rack',F.t-6,s,y,'in');put('quay','pa_net_pile',F.t+5,s-.6,y,'in');put('quay','pa_pallet_load',F.t+1,s+.2,y,'in',{v:1});
  for(let j=0;j<5;j++)put('quay',j%2?'pa_drum':'pa_crate',F.t+9+(j%3)*.75,s+Math.floor(j/3)*.75,y,'in',{v:j%2});
  put('quay','pa_lamp_post',F.t-1,-(W.PONT-1.2),y,'in');}
 // --- the TOP DECK: the pirates' lamp posts along the promenades, benches by the beds, fires, the AA batteries Ruephus
 //     turned on the sea, his justice by his door (stocks, cages, a gibbet), the mess hall's tables in front of it
 {const y=L.TOP+.01;const free=t=>!NR.LOTS.some(l=>Math.abs(l.t-t)<(l.key==='nr-anc-reliquary'?24:l.key==='nr-anc-apt-ribbon'?21:l.key==='nr-anc-apt-drum'?13:18))&&!NR.CORES.some(c=>Math.abs(c.t-t)<6)&&Math.abs(t-NR.ATRIUM.tc)>24&&!NR.FUNNELS.some(f=>Math.abs(t-f)<7)&&!NR.ZONES.some(z=>z.roof==='glass'&&t>z.t0-2&&t<z.t1+2);
  for(let t=NR.T0+14;t<NR.T1-8;t+=24)for(const s of [-15.2,15.2])if(free(t)&&!nrUnderFore(t,s))put('top','pa_lamp_post',t,s,y,s>0?'in':'out',{v:nrMod(t|0,2)});
  for(const K of NR.PARKS){if(K.garden)continue;const m=(K.t0+K.t1)/2;for(const s of [-13.6,13.6])put('top','pa_bench',m,s,y,s>0?'in':'out',{v:0});}
  {const K=NR.PARKS.find(k=>k.garden),m=(K.t0+K.t1)/2;for(const t of [m-12,m+12])for(const s of [-14.2,14.2])put('top','pa_bench',t,s,y,s>0?'in':'out',{v:1});}
  for(const Lt of NR.LOTS){if(Lt.use!=='barracks')continue;const sg=Lt.face==='in'?-1:1;put('top','pa_camp_fire',Lt.t+(Lt.key==='nr-anc-apt-drum'?13:18),sg*8,y,'out',{v:nrMod(Lt.t|0,3)});}
  for(const [t,s] of [[NR.T0+9,-14],[NR.T0+9,14],[NR.T1-9,-14],[NR.T1-9,14],[-104,15],[104,15]])if(!nrUnderFore(t,s))put('top','ancients_aa_battery',t,s,y,s>0?'out':'in',{v:0});
  {const mh=NR.LOTS.find(l=>l.use==='mess');const sg=mh.face==='in'?-1:1;
   for(const dt of [-6,-2,2,6]){put('top','pa_long_table',mh.t+dt,sg*13.2,y,'fwd');put('top','pa_bench',mh.t+dt-.95,sg*13.2,y,'fwd');put('top','pa_bench',mh.t+dt+.95,sg*13.2,y,'aft');}
   put('top','pa_water_butt',mh.t+12,sg*12,y,'in');put('top','pa_brick_grill',mh.t-12,sg*12.5,y,'in');}}
 return count;}
// ---------------------------------------------------------------- the pass
function nrInteriors(){const t0=performance.now(),arc=REG.find(r=>r.key==='nr-arcology');if(!arc){reportErr('interiors: no arcology record');return;}
 for(const k in NR_TPL)delete NR_TPL[k];NR_INST.length=0;
 if(NR_FURNG){NR_FURNG.parent&&NR_FURNG.parent.remove(NR_FURNG);}
 NR_FURNG=new THREE.Group();NR_FURNG.name='furniture:instanced';NR_FURNG.matrixAutoUpdate=false;NR_FURNG.matrix.fromArray(NR_HULL.m16);NR_FURNG.userData.furniture=true;HULLG.add(NR_FURNG);
 /* each part on its own: one that throws is reported (the error panel) and the rest still furnish */
 const part=(nm,fn,empty)=>{try{return fn();}catch(e){reportErr('interiors '+nm+': '+(e.stack||e));return empty;}};
 const cab=part('cabins',()=>nrFurnishCabins(arc),{furnished:0,bare:0,empty:0,rooms:[]}),shp=part("ship's rooms",()=>nrFurnishShipRooms(arc),{rooms:[]}),
  brt=part('berths',()=>nrFurnishBerths(arc),{rooms:[]}),bld=part('buildings',()=>nrFurnishBuildings(),{rooms:[],residences:0,residenceFails:[],items:{}}),pub=part('halls',()=>nrFurnishPublic(arc),{});
 for(const k in NR_TPL)nrTemplateDraw(NR_TPL[k]);
 /* the report the verifier reads */
 const missingRequired=[],auditFails=[],byKind={};let audited=0;
 for(const k in NR_TPL){const T=NR_TPL[k];if(!T.inst.length)continue;audited++;byKind[T.kind]=(byKind[T.kind]||0)+T.inst.length;
  for(const m of (T.plan.report.missing||[]))missingRequired.push(k+': '+m.need+' ('+m.reason+')');
  if(T.audit&&!T.audit.ok)for(const f of T.audit.fails.slice(0,3))auditFails.push(k+': '+(typeof f==='string'?f:(f.check||'')+' '+(f.detail||f.msg||JSON.stringify(f)).slice(0,120)));}
 /* the halls furnished piece by piece, as rooms in the data (outline, deck height) for the life layer */
 const band=(t0,t1,s0,s1)=>{const P=[];for(let t=t0;t<=t1+1e-6;t+=Math.max(1,(t1-t0)/24))P.push(NR.at(Math.min(t,t1),s0));for(let t=t1;t>=t0-1e-6;t-=Math.max(1,(t1-t0)/24))P.push(NR.at(Math.max(t,t0),s1));return P.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2)]);};
 const halls=NR.ZONES.map(Z=>({id:Z.id,kind:Z.kind,name:Z.name,y:Z.decks.map(d=>L.D[d]),poly:band(Z.t0,Z.t1,Z.s0,Z.s1),pieces:pub[Z.id]||pub[Z.kind]||0}))
  .concat(NR.FORE_HALLS.map(H=>({id:H.id,kind:'hall',name:H.name,y:[H.y0],poly:NR.TIERS[H.tier].poly.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2)]),pieces:pub[H.id]||0})))
  .concat(NR.BRIDGEHOUSE.storeys.filter(S=>S.k!==2).map(S=>({id:'bridgehouse-'+S.k,kind:'hall',name:['the officers\' hall','the chart and signal deck','','the lookout lounge'][S.k],y:[S.y0],poly:S.poly.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2)]),pieces:pub['bridgehouse-'+S.k]||0})))
  .concat([{id:'bridge',kind:'bridge',name:'the bridge',y:[NR.BRIDGEHOUSE.bridge.y0],poly:NR.BRIDGEHOUSE.bridge.poly.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2)]),pieces:pub.bridge||0},
   {id:'plaza',kind:'plaza',name:NR.PLAZA.name,y:[L.D[0]],poly:NR.PLAZA.poly.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2)]),pieces:pub.plaza||0},
   {id:'chainlocker',kind:'store',name:'the chain locker',y:[L.D[0]],poly:band(-39,39,W.MAIN,W.PONT),pieces:pub.chainlocker||0}]);
 window._interiors={rooms:cab.rooms.filter(r=>r.kind!=='stripped').length+shp.rooms.length+brt.rooms.length+bld.rooms.length,halls,berths:brt.rooms,byKind,missingRequired,auditFails,audited,templates:Object.keys(NR_TPL).length,
  strippedRooms:cab.rooms.filter(r=>r.kind==='stripped').length,cabinsFurnished:cab.furnished,cabinsBare:cab.bare,cabinsEmpty:cab.empty,residences:bld.residences,residenceFails:bld.residenceFails,
  publicRooms:[['bridge',14],['dining',60],['engine',24],['mess-s',80],['mess-p',80],['greenhouse',12],['plaza',30],['bridgehouse-0',30],['bridgehouse-1',30],['bridgehouse-3',24],['stern',40],['fwd-hall',30],['fwd-store',30],['fwd-drill',20],['fwd-gallery',30],['chainlocker',12],['atrium',30],['corridors',40],['holds',15],['quay',30],['top',60]].map(([id,min])=>({id,pieces:pub[id]||0,min})),
  shipRooms:shp.rooms.map(r=>({id:r.id,name:r.name,kind:r.kind,deck:r.deck,pieces:r.pieces})),
  cabins:cab.rooms,buildingRooms:bld.rooms,items:Object.keys(bld.items).map(k=>({lot:k,item:bld.items[k].item,rooms:bld.items[k].tpls.length,residence:bld.items[k].residence})),
  ms:Math.round(performance.now()-t0)};
 nrStreamTick(true);}
