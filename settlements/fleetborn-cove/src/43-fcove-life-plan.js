// ================================================================= FLEETBORN COVE — tide- & moot-driven citizen schedules (FCOVE_LIFE_PLAN)  [G data]
// Pure [G data] life-layer planner built on core/sched (KSCHED), core/rand (KRAND), FCOVE_NAMES, FCOVE_LAYOUT, and FCOVE_TIDE:
//   1. Great Careening Cradle Shipwrights & Scrapers (43..56 crew): descend onto the exposed -3.0 m floor of cradle_deep (around
//      the careened 89c Ark-Catamaran) and -1.0 m cradle_shallow when seaLevel <= +0.8 m (stepping onto dry cradle altars if the
//      lower pit floor is awash between -3.15 m and +0.8 m), and relocate automatically to the +9.2 m coping quays, sk_client_hall,
//      and foundry when seaLevel > +0.8 m.
//   2. cFlit-qBon Free-Divers & Sill Rotor Tenders (34..40 full_diver_25m100m): plunge & swim around 89e vent tenders, Ark
//      moon-pools, and alkaline seeps; tend the 4 NNW sill-race paktong rotors in the water during slack (|v| <= 0.65 m/s) and
//      from the +8.6 m pier tops during strong flood/ebb races.
//   3. Spring-Low White Stacks & Sea-Byssus Gatherers (22..28 gatherers): walk onto the -6.0 m stone causeway & golden sea-byssus
//      beds ONLY when seaLevel <= -6.0 m (Great Ebb); work the +10..+16.4 m shore drying-racks & rope-walk when submerged.
//   4. 5 Shore-Kin Hinterland Villages + 529 m Log-Chute + +9.2 m Harbour Bench (184..232 shore_kin): ash-burners, spar-sawyers &
//      chute-tenders, rope-walkers, ore-roasters, salters, sk_client_hall factors, and spring-campaign cupola smelters.
//   5. Arcoforte Caretakers & Dynamic Great Careening Moot Swell: synced live to KCAMP.fleetsAt(W, 'arcoforte', day), swelling
//      total active citizens from ~327 on Neap Day 67 (1/5 fleets) to ~788 at Double Dark Moot (5/5 fleets, > 2.4x swell).
// HARD INVARIANT: 0 non-diving citizens below seaLevel at ANY tide in [-7.27 m, +7.11 m].
// Zero THREE, zero DOM, zero Math.random, zero numeric || defaults.
(function(root){
'use strict';
if(root.FCOVE_LIFE_PLAN)return;

const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

const DECK_HEIGHTS=Object.freeze({
 arkChainedWard:3.6,
 arkCatamaran:3.2,
 arkSmelter:2.8,
 arkDiveTender:2.1,
 arkScoutTri:1.9,
 hkWhaleCat:1.8
});

const FLEET_LABELS=Object.freeze({
 caretaker_house:'Caretaker House Sanctuary Guard',
 ward_ring:'Ward-Ring Home Clans',
 smelt_fleet:'Copper-Tarn Smelt Fleet',
 trench_fleet:'Abyssal Trench-Diver Fleet',
 outer_whalers:'Outer Whalers & Hueru-Kuran',
 island_traders:'Ria-Sound & Arch Island Traders'
});

function hashU32(seed,a,b,c){
 const sd=seed==null?0x4A2C06:seed;
 if(root.KRAND&&typeof root.KRAND.hash==='function'){
  return root.KRAND.hash(sd>>>0,a==null?0:a>>>0,b==null?0:b>>>0,c==null?0:c>>>0)>>>0;
 }
 let x=(sd^Math.imul((a==null?0:a)+1,0x9e3779b1)^Math.imul((b==null?0:b)+7,0x85ebca6b)^Math.imul((c==null?0:c)+13,0xc2b2ae35))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d)>>>0;x^=x>>>15;
 return x>>>0;
}

function unitRand(seed,a,b,c){
 return(hashU32(seed,a,b,c)>>>8)/16777216;
}

function defaultGround(LY){
 return function fallbackGnd(x,z){
  const s=LY.S_OF(x,z),a=LY.A_OF(x,z),ca=LY.centerA(s),da=a-ca;
  const we=LY.hwE(s),ww=LY.hwW(s);
  let raw=18;
  if(da>=0&&da<we)raw=-38;
  else if(da<0&&-da<ww)raw=-38;
  else if(da>=we)raw=24+Math.min(145,(da-we)*0.22);
  else raw=18+Math.min(95,(-da-ww)*0.18);
  return LY.groundAt(x,z,raw,null);
 };
}

function makePaceTimeline(KS,ax,az,bx,bz,period,phase,workDur){
 const walkDur=Math.max(2,(period-2*workDur)*0.5);
 return KS.timeline({
  period:period,
  phase:phase,
  segments:[
   {dur:walkDur,from:[ax,az],to:[bx,bz],ease:'inOut',name:'walk_out'},
   {dur:workDur,from:[bx,bz],to:[bx,bz],ease:'linear',name:'work_far'},
   {dur:walkDur,from:[bx,bz],to:[ax,az],ease:'inOut',name:'walk_back'},
   {dur:workDur,from:[ax,az],to:[ax,az],ease:'linear',name:'work_near'}
  ]
 });
}

function makeDiveTimeline(KS,period,phase,maxDepth){
 return KS.timeline({
  period:period,
  phase:phase,
  segments:[
   {dur:period*0.24,from:0.20,to:0.32,ease:'smooth',name:'surface_bob'},
   {dur:period*0.22,from:0.32,to:maxDepth,ease:'inOut',name:'plunge'},
   {dur:period*0.32,from:maxDepth,to:maxDepth*0.86,ease:'smooth',name:'bottom_tend'},
   {dur:period*0.22,from:maxDepth*0.86,to:0.20,ease:'inOut',name:'ascent'}
  ]
 });
}

function create(opts){
 const o=opts||{};
 const LY=o.layout||(typeof root.FCOVE_LAYOUT!=='undefined'?root.FCOVE_LAYOUT:null);
 const NM=o.names||(typeof root.FCOVE_NAMES!=='undefined'?root.FCOVE_NAMES:null);
 const KS=o.ksched||(typeof root.KSCHED!=='undefined'?root.KSCHED:null);
 if(!LY)throw new Error('FCOVE_LIFE_PLAN.create: missing FCOVE_LAYOUT');
 if(!NM)throw new Error('FCOVE_LIFE_PLAN.create: missing FCOVE_NAMES');
 if(!KS||typeof KS.timeline!=='function'||typeof KS.slots!=='function'){
  throw new Error('FCOVE_LIFE_PLAN.create: missing KSCHED (core/sched/20-core-sched.js)');
 }

 const seed=(o.seed==null?LY.seed:o.seed)>>>0;
 const terrainH=o.terrainH||defaultGround(LY);
 const peoples=NM.resolvePeoples(o.peoples);
 const roster=[];
 const entries=[];
 const byId=new Map();

 function addEntry(citSpec,beh){
  const cit=NM.citizen(Object.assign({seed:seed,peoples:peoples,index:roster.length},citSpec));
  const rec=Object.freeze(Object.assign({citizen:cit},beh));
  roster.push(cit);
  entries.push(rec);
  byId.set(cit.id,rec);
  return rec;
 }

 const cDeep=LY.cradles[0];
 const cShal=LY.cradles[2];
 const chHall=LY.harbourWorks[0];
 const pfHall=LY.harbourWorks[1];
 const bgHall=LY.harbourWorks[2];
 const AF=LY.arcoforte;

 const bldBoxes=[];
 for(let i=0;i<LY.harbourWorks.length;i++){
  const hb=LY.harbourWorks[i];
  bldBoxes.push({x:hb.x,z:hb.z,r:Math.hypot(hb.w,hb.d)*0.5+1.4});
 }
 if(o.villagesData&&o.villagesData.villages){
  for(let vi=0;vi<o.villagesData.villages.length;vi++){
   const recs=o.villagesData.villages[vi].village.records||[];
   for(let ri=0;ri<recs.length;ri++){
    const b=recs[ri];
    if(b)bldBoxes.push({x:b.x,z:b.z,r:Math.hypot(b.w,b.d)*0.5+1.1});
   }
  }
 }
 function clearXZ(x,z){
  let px=x,pz=z;
  for(let it=0;it<2;it++){
   for(let i=0;i<bldBoxes.length;i++){
    const b=bldBoxes[i],dx=px-b.x,dz=pz-b.z,d=Math.hypot(dx,dz);
    if(d<b.r){
     const ux=d>1e-3?dx/d:1,uz=d>1e-3?dz/d:0;
     px=b.x+ux*(b.r+0.6);
     pz=b.z+uz*(b.r+0.6);
    }
   }
  }
  return[px,pz];
 }
 function makeClearPace(ax,az,bx,bz,period,phase,workDur){
  const a=clearXZ(ax,az),b=clearXZ(bx,bz);
  return makePaceTimeline(KS,a[0],a[1],b[0],b[1],period,phase,workDur);
 }

 /* Precompute Caretaker permanent hull positions matching 86-fcove-works-and-fleet.js */
 const caretakerHullDefs=[
  {id:'fcove.caretaker.ward',rsKey:'arkChainedWard',s:92,da:-36,bowS:-1,r:27},
  {id:'fcove.caretaker.cat',rsKey:'arkCatamaran',s:-78,da:-64,bowS:-1,r:21},
  {id:'fcove.caretaker.tender',rsKey:'arkDiveTender',s:18,da:18,bowS:-1,r:15},
  {id:'fcove.caretaker.pilot',rsKey:'arkScoutTri',s:-635,da:14,bowS:-1,r:13}
 ].map((ch,ci)=>{
  const p=LY.XZ(ch.s,LY.centerA(ch.s)+ch.da);
  const yaw=Math.atan2(-LY.axis[1]*ch.bowS,LY.axis[0]*ch.bowS)+(ci-1.5)*0.04;
  return Object.freeze({id:ch.id,rsKey:ch.rsKey,x:p[0],z:p[1],yaw:yaw,r:ch.r,deckY:DECK_HEIGHTS[ch.rsKey]});
 });

 const fleetHullsByFleet={};
 for(let i=0;i<LY.fleetSlots.length;i++){
  const fs=LY.fleetSlots[i];
  if(!fleetHullsByFleet[fs.fleetId])fleetHullsByFleet[fs.fleetId]=[];
  fleetHullsByFleet[fs.fleetId].push(fs);
 }

 /* =========================================================================
    1. GREAT CAREENING CRADLE SHIPWRIGHTS & SCRAPERS (40 resident + 16 fleet = 56)
    ========================================================================= */
 const careenFleetAdd=[
  ['trench_fleet',3],['ward_ring',4],['smelt_fleet',3],['outer_whalers',3],['island_traders',3]
 ];
 const careenSpecs=[];
 for(let i=0;i<40;i++)careenSpecs.push({fleetId:null,people:i<22?'cflit_qbon':'shore_kin'});
 for(let fi=0;fi<careenFleetAdd.length;fi++){
  const fid=careenFleetAdd[fi][0],cnt=careenFleetAdd[fi][1];
  for(let k=0;k<cnt;k++)careenSpecs.push({fleetId:fid,people:'cflit_qbon'});
 }
 const careenPhases=KS.slots(careenSpecs.length,28,0.3);
 for(let i=0;i<careenSpecs.length;i++){
  const sp=careenSpecs[i];
  const inShallow=(i%5===4);
  const cr=inShallow?cShal:cDeep;
  const side=(i%2===0)?-1:1;
  const hullOff=inShallow?(side*2.3):(side*(i%4<2?3.2:6.1));
  const uA=0.16+0.68*((Math.floor(i/2)%11)/10);
  const dA0=cr.a0+cr.len*uA;
  const pA=LY.XZ(cr.s+hullOff,dA0-2.1);
  const pB=LY.XZ(cr.s+hullOff,dA0+2.1);
  const pAltar=LY.XZ(cr.s+side*(cr.w*0.5-1.25),dA0);
  /* High-water (+9.2 m) fallback station around sk_client_hall, sk_paktong_foundry & sk_boat_grid_shed */
  const hwTarget=i%3===0?pfHall:(i%3===1?bgHall:chHall);
  const angH=(i/careenSpecs.length)*TAU+0.4;
  const radH=8.5+4.5*unitRand(seed,1100+i,1);
  const hx0=hwTarget.x+Math.cos(angH)*radH,hz0=hwTarget.z+Math.sin(angH)*radH;
  const hx1=hx0+Math.cos(angH+1.2)*3.4,hz1=hz0+Math.sin(angH+1.2)*3.4;
  const tlPit=makePaceTimeline(KS,pA[0],pA[1],pB[0],pB[1],28,careenPhases[i],5.5);
  const tlBench=makeClearPace(hx0,hz0,hx1,hz1,26,careenPhases[i]*0.8,5.0);
  const jobKind=i%3===0?'scraper':(i%3===1?'caulker':'riveter');
  addEntry({
   id:'cit.careen.'+i,
   people:sp.people,
   diveClass:sp.people==='cflit_qbon'?'full_diver_25m100m':'half_diver_3m25m',
   affiliation:sp.fleetId||'arcoforte_caretakers',
   affiliationLabel:sp.fleetId?FLEET_LABELS[sp.fleetId]:'Arcoforte Drydock Guild',
   role:'careen_'+jobKind,
   roleLabel:jobKind==='scraper'?'Hull Barnacle Scraper':jobKind==='caulker'?'Kauri-Gum & Bitumen Caulker':'Paktong Stem-Plate Shipwright',
   homeId:sp.fleetId?('fleet:'+sp.fleetId):(sp.people==='shore_kin'?bgHall.id:'fcove.arcoforte.bastion_store'),
   fleetId:sp.fleetId,
   cohort:'careening',
   paletteKey:sp.people==='cflit_qbon'?'cflit_wright':'shore_harbour',
   preferredByname:jobKind==='caulker'?'Pitch-Boiler':'Careen-Grid',
   hatKind:sp.people==='shore_kin'?'sun_hat':'hair_bun',
   tool:jobKind==='caulker'?'mallet':'scraper'
  },{
   kind:'careening',
   cradleId:cr.id,
   blocksY:cr.blocks,
   side:side,
   jobKind:jobKind,
   altarXZ:pAltar,
   tlPit:tlPit,
   tlBench:tlBench,
   benchHome:hwTarget.name,
   yawInward:Math.atan2(-LY.across[0]*side,-LY.across[1]*side)
  });
 }

 /* =========================================================================
    2. cFLIT-qBON FREE-DIVERS & SILL ROTOR TENDERS (26 resident + 14 fleet = 40)
    ========================================================================= */
 /* 2A. 12 Sill-Race Rotor Tenders (3 per rotor unit 0..3) */
 const rotorPhases=KS.slots(12,30,1.5);
 for(let i=0;i<12;i++){
  const u=LY.sillRotors.units[i%4];
  const k=Math.floor(i/4);
  const ang=k*(TAU/3)+0.35*(i%4);
  const swimX0=u.x+Math.cos(ang)*4.6,swimZ0=u.z+Math.sin(ang)*4.6;
  const swimX1=u.x+Math.cos(ang+1.05)*5.2,swimZ1=u.z+Math.sin(ang+1.05)*5.2;
  const pierX=u.x+(k-1)*1.45*LY.across[0],pierZ=u.z+(k-1)*1.45*LY.across[1];
  addEntry({
   id:'cit.rotor_diver.'+i,
   people:'cflit_qbon',
   diveClass:'full_diver_25m100m',
   affiliation:'arcoforte_caretakers',
   affiliationLabel:'Sill-Throat Rotor Watch (Caretaker House)',
   role:'rotor_diver',
   roleLabel:'Paktong Sill-Rotor Free-Diver & Bearing Tender',
   homeId:'fcove.sill_rotors',
   fleetId:null,
   cohort:'divers',
   paletteKey:'cflit_diver',
   hatKind:'dive_hood',
   tool:'spear'
  },{
   kind:'rotor_diver',
   rotorIndex:u.index,
   pierXZ:[pierX,pierZ],
   pierTopY:u.pierTopY,
   tlSwim:makePaceTimeline(KS,swimX0,swimZ0,swimX1,swimZ1,30,rotorPhases[i],4.0),
   tlDive:makeDiveTimeline(KS,24,rotorPhases[i],1.55)
  });
 }

 /* 2B. 28 Sanctuary Vent-Tender, Ark Moon-Pool & Seep Free-Divers (14 resident + 14 visiting) */
 const diverFleetAdd=[
  ['trench_fleet',8],['ward_ring',2],['smelt_fleet',2],['outer_whalers',2]
 ];
 const diverSpecs=[];
 for(let i=0;i<14;i++)diverSpecs.push({fleetId:null});
 for(let fi=0;fi<diverFleetAdd.length;fi++){
  const fid=diverFleetAdd[fi][0],cnt=diverFleetAdd[fi][1];
  for(let k=0;k<cnt;k++)diverSpecs.push({fleetId:fid});
 }
 const diverPhases=KS.slots(diverSpecs.length,34,0.8);
 for(let i=0;i<diverSpecs.length;i++){
  const sp=diverSpecs[i];
  let cx,cz,stationLabel;
  if(!sp.fleetId){
   if(i<6){
    /* Around Caretaker 89e Dive Tender */
    cx=caretakerHullDefs[2].x;cz=caretakerHullDefs[2].z;
    stationLabel='Cradle-Gate Sounding Tender (89e)';
   }else if(i<11){
    /* Around Caretaker 89c Moon-Pool Ark-Catamaran */
    cx=caretakerHullDefs[1].x;cz=caretakerHullDefs[1].z;
    stationLabel='Caretaker Moon-Pool Ark-Catamaran (89c)';
   }else{
    /* Submerged alkaline Lost-City seep vents near western stacks */
    const ps=LY.XZ(-585+(i-11)*48,LY.centerA(-585)-64);
    cx=ps[0];cz=ps[1];
    stationLabel='Submerged Lost-City Alkaline Seep Vent';
   }
  }else{
   const fh=fleetHullsByFleet[sp.fleetId]||[];
   const tender=fh.filter(h=>h.rsKey==='arkDiveTender'||h.rsKey==='arkCatamaran');
   const pick=(tender.length?tender:fh)[i%Math.max(1,(tender.length?tender:fh).length)];
   cx=pick?pick.x:0;cz=pick?pick.z:0;
   stationLabel=pick?pick.name:'Sanctuary Dive Ground';
  }
  const a0=(i/diverSpecs.length)*TAU+0.7,r0=8.5+6.5*unitRand(seed,2200+i,1);
  const x0=cx+Math.cos(a0)*r0,z0=cz+Math.sin(a0)*r0;
  const x1=cx+Math.cos(a0+1.15)*(r0+3.5),z1=cz+Math.sin(a0+1.15)*(r0+3.5);
  addEntry({
   id:'cit.free_diver.'+i,
   people:'cflit_qbon',
   diveClass:'full_diver_25m100m',
   affiliation:sp.fleetId||'arcoforte_caretakers',
   affiliationLabel:sp.fleetId?FLEET_LABELS[sp.fleetId]:'Caretaker House Bell & Seep Divers',
   role:'free_diver',
   roleLabel:'cFl\u012bt-qB\u014dn Abyssal & Seep Free-Diver',
   homeId:sp.fleetId?('fleet:'+sp.fleetId):'fcove.caretaker.cat',
   fleetId:sp.fleetId,
   cohort:'divers',
   paletteKey:'cflit_diver',
   hatKind:'dive_hood',
   tool:'spear'
  },{
   kind:'free_diver',
   stationLabel:stationLabel,
   tlSwim:makePaceTimeline(KS,x0,z0,x1,z1,34,diverPhases[i],5.0),
   tlDive:makeDiveTimeline(KS,22,diverPhases[i],2.15)
  });
 }

 /* =========================================================================
    3. WHITE STACKS & SEA-BYSSUS GATHERERS (22 resident + 6 fleet = 28)
    ========================================================================= */
 const byssusSpecs=[];
 for(let i=0;i<22;i++)byssusSpecs.push({fleetId:null,people:i<16?'shore_kin':'cflit_qbon'});
 for(let i=0;i<4;i++)byssusSpecs.push({fleetId:'island_traders',people:'cflit_qbon'});
 for(let i=0;i<2;i++)byssusSpecs.push({fleetId:'ward_ring',people:'cflit_qbon'});
 const byssusPhases=KS.slots(byssusSpecs.length,32,0.8);
 const cw=LY.causeway;
 const vCord=LY.villages[2];
 for(let i=0;i<byssusSpecs.length;i++){
  const sp=byssusSpecs[i];
  const u0=0.24+0.68*((i%14)/13);
  const u1=clamp(u0+(i%2===0?0.12:-0.12),0.22,0.95);
  const sOff=((i%3)-1)*2.15;
  const cA0=cw.aStart+(cw.aEnd-cw.aStart)*u0;
  const cA1=cw.aStart+(cw.aEnd-cw.aStart)*u1;
  const pC0=LY.XZ(cw.s+sOff,cA0),pC1=LY.XZ(cw.s+sOff,cA1);
  /* High-water fallback (> -6.0 m): half on +11..+15 m dry western causeway head racks, half at Seep-Walk ropewalk */
  let pHi0,pHi1,hiPlace;
  if(i%2===0){
   const aDry=cw.aStart-22-(i%4)*4.5;
   const sDry=cw.s-12+(i%5)*6.0;
   pHi0=LY.XZ(sDry,aDry);
   pHi1=LY.XZ(sDry+4.2,aDry-2.5);
   hiPlace='Western Headland Sea-Byssus Drying Racks (+12 m)';
  }else{
   const ang=(i/byssusSpecs.length)*TAU;
   pHi0=[vCord.x+Math.cos(ang)*16,vCord.z+Math.sin(ang)*16];
   pHi1=[vCord.x+Math.cos(ang+0.7)*18,vCord.z+Math.sin(ang+0.7)*18];
   hiPlace='Seep-Walk Sea-Silk Combing Shed (+16.4 m)';
  }
  addEntry({
   id:'cit.byssus.'+i,
   people:sp.people,
   diveClass:sp.people==='cflit_qbon'?'full_diver_25m100m':'half_diver_3m25m',
   affiliation:sp.fleetId||'village_cordage',
   affiliationLabel:sp.fleetId?FLEET_LABELS[sp.fleetId]:'Seep-Walk & White-Stacks Byssus Guild',
   role:'byssus_gatherer',
   roleLabel:'Golden Sea-Byssus & Pinna Gatherer',
   homeId:sp.fleetId?('fleet:'+sp.fleetId):'village_cordage',
   fleetId:sp.fleetId,
   cohort:'byssus',
   paletteKey:sp.people==='shore_kin'?'shore_cordage':'cflit_moot',
   preferredByname:i%2===0?'Byssus-Hand':'Skein-Dyer',
   hatKind:sp.people==='shore_kin'?'sun_hat':'hair_bun',
   tool:'basket'
  },{
   kind:'byssus',
   tlCauseway:makePaceTimeline(KS,pC0[0],pC0[1],pC1[0],pC1[1],32,byssusPhases[i],6.0),
   tlHighShore:makeClearPace(pHi0[0],pHi0[1],pHi1[0],pHi1[1],30,byssusPhases[i],5.5),
   hiPlace:hiPlace
  });
 }

 /* =========================================================================
    4. 5 SHORE-KIN HINTERLAND VILLAGES + LOG-CHUTE + HARBOUR BENCH (184..232)
    ========================================================================= */
 const vilConfigs=[
  {idx:0,count:28,mootExtra:10,pal:'shore_ash',role:'ash_burner',roleLabel:'Pycnandra Nickel-Ash & Kelp-Kiln Burner',by:'Verdigris-Ash',tool:'rake',taskText:'Raking Pycnandra nickel bio-ash clamps & shell-lime kiln'},
  {idx:1,count:20,mootExtra:10,pal:'shore_spars',role:'spar_sawyer',roleLabel:'Agathis & Araucaria Spar Sawyer',by:'Kauri-Saw',tool:'mallet',taskText:'Sawing Agathis masts & steaming mangrove boat-knees'},
  {idx:2,count:28,mootExtra:9,pal:'shore_cordage',role:'rope_walker',roleLabel:'Bitumen & Sea-Byssus Rope-Walker',by:'Coir-Walk',tool:'basket',taskText:'Pacing the rope-walk twisting bitumen-tarred coir & sea-byssus'},
  {idx:3,count:30,mootExtra:10,pal:'shore_ore',role:'ore_roaster',roleLabel:'Sheeted-Dyke Copper-Zinc Ore Roaster',by:'Cupola-Bellows',tool:'rake',taskText:'Roasting crushed copper-zinc charge in Casuarina-bedded heaps'},
  {idx:4,count:28,mootExtra:9,pal:'shore_saltery',role:'salt_panner',roleLabel:'Outer-Sill Solar Salter & Fish-Curer',by:'Sill-Salt',tool:'rake',taskText:'Raking brucite solar salt-pans & smoking pelagic fish'}
 ];
 for(let vc=0;vc<vilConfigs.length;vc++){
  const cfg=vilConfigs[vc],vs=LY.villages[cfg.idx];
  const totV=cfg.count+cfg.mootExtra;
  const vPhases=KS.slots(totV,36,0.6);
  for(let k=0;k<totV;k++){
   const mootOnly=k>=cfg.count;
   const diveCls=(cfg.idx===4||cfg.idx===2||(k%4!==0))?'half_diver_3m25m':'land_bound';
   let ax,az,bx,bz,placeNote;
   if(mootOnly){
    /* Moot tithe-porters: gather on the +9.2 m Harbour Client Moot Plaza outside sk_client_hall */
    const ang=(vc*10+k)*0.52;
    const rad=11.0+7.5*unitRand(seed,4100+vc*40+k,1);
    ax=chHall.x+Math.cos(ang)*rad;az=chHall.z+Math.sin(ang)*rad;
    bx=chHall.x+Math.cos(ang+0.8)*(rad+3.2);bz=chHall.z+Math.sin(ang+0.8)*(rad+3.2);
    placeNote='Delivering '+vs.epithet+' client tithe bales at Harbour Client Hall (+9.2 m)';
   }else if(cfg.idx===2&&k<16){
    /* Linear rope-walk pacers at Seep-Walk (kept strictly west of gjar channel: da < -48 m) */
    const laneIdx=k%4;
    const sWalk=vs.s-18+laneIdx*9.5;
    const aWalk=vs.a-18-(k>>2)*6.5;
    const p0=LY.XZ(sWalk-11,aWalk),p1=LY.XZ(sWalk+11,aWalk);
    ax=p0[0];az=p0[1];bx=p1[0];bz=p1[1];
    placeNote=cfg.taskText+' at '+vs.epithet;
   }else{
    const ang=(k/cfg.count)*TAU+vc*0.7;
    const rad=12.0+26.0*unitRand(seed,4200+vc*50+k,2);
    /* Keep Seep-Walk villagers strictly west of gjar stream */
    const sOff=Math.cos(ang)*rad,aOff=vs.gjarWest?-Math.abs(Math.sin(ang)*rad):Math.sin(ang)*rad;
    const p0=LY.XZ(vs.s+sOff,vs.a+aOff);
    const p1=LY.XZ(vs.s+sOff+5.2*Math.cos(ang+1.3),vs.a+aOff+(vs.gjarWest?-3.5:3.5));
    ax=p0[0];az=p0[1];bx=p1[0];bz=p1[1];
    placeNote=cfg.taskText+' at '+vs.epithet;
   }
   addEntry({
    id:'cit.'+vs.id+'.'+k,
    people:'shore_kin',
    diveClass:diveCls,
    affiliation:vs.id,
    affiliationLabel:vs.name,
    role:mootOnly?'tithe_porter':cfg.role,
    roleLabel:mootOnly?(vs.epithet+' Client Tithe-Bearer'):cfg.roleLabel,
    homeId:vs.id,
    fleetId:null,
    cohort:'villages',
    paletteKey:cfg.pal,
    preferredByname:cfg.by,
    hatKind:'sun_hat',
    tool:mootOnly?'basket':cfg.tool
   },{
    kind:'village_worker',
    villageId:vs.id,
    mootOnly:mootOnly,
    minSafeY:9.0,
    tlWork:makeClearPace(ax,az,bx,bz,36,vPhases[k],6.5),
    taskText:placeNote
   });
  }
 }

 /* 4B. 10 Timber Spar Log-Chute Tenders along the 529 m chute catwalk & boatyard catch-crib */
 {
  const sc=LY.sparChute;
  const hx=sc.headXZ[0],hz=sc.headXZ[1],fx=sc.footXZ[0],fz=sc.footXZ[1];
  const dx=fx-hx,dz=fz-hz,L=Math.hypot(dx,dz);
  const nx=-dz/L,nz=dx/L;
  const chutePhases=KS.slots(10,30,1.8);
  for(let i=0;i<10;i++){
   const uA=0.06+0.86*(i/9);
   const uB=clamp(uA+(i%2===0?0.05:-0.05),0.04,0.94);
   const xA=hx+dx*uA+nx*3.4,zA=hz+dz*uA+nz*3.4;
   const xB=hx+dx*uB+nx*3.4,zB=hz+dz*uB+nz*3.4;
   addEntry({
    id:'cit.spar_chute.'+i,
    people:'shore_kin',
    diveClass:'half_diver_3m25m',
    affiliation:'village_spars',
    affiliationLabel:'Kauri-Chute Flume & Catch-Crib Crew',
    role:'chute_tender',
    roleLabel:'Timber Spar Log-Chute Flume Tender',
    homeId:'village_spars',
    fleetId:null,
    cohort:'villages',
    paletteKey:'shore_spars',
    preferredByname:'Kauri-Saw',
    hatKind:'sun_hat',
    tool:'mallet'
   },{
    kind:'village_worker',
    villageId:'village_spars',
    mootOnly:false,
    minSafeY:9.0,
    tlWork:makePaceTimeline(KS,xA,zA,xB,zB,30,chutePhases[i],4.5),
    taskText:'Guiding peeled Araucaria mast-logs down the 529 m timber spar chute'
   });
  }
 }

 /* 4C. 40 Permanent Harbour Client Work-Bench Crew (+9.2 m sk_client_hall, sk_paktong_foundry, sk_boat_grid_shed & Smelt-Hearth) */
 {
  const hbPhases=KS.slots(40,28,0.5);
  const sh=LY.smeltHearth;
  for(let i=0;i<40;i++){
   const isSmelter=i<16;
   const isFactor=i>=16&&i<30;
   const bld=isSmelter?pfHall:(isFactor?chHall:bgHall);
   const ang=(i/40)*TAU+0.25;
   const rad=8.0+6.0*unitRand(seed,4800+i,1);
   const bx0=bld.x+Math.cos(ang)*rad,bz0=bld.z+Math.sin(ang)*rad;
   const bx1=bx0+Math.cos(ang+1.1)*4.2,bz1=bz0+Math.sin(ang+1.1)*4.2;
   const hAng=(i/16)*Math.PI-Math.PI*0.5;
   const pH0=LY.XZ(sh.s+Math.sin(hAng)*8.5,sh.a-11.5-Math.cos(hAng)*3.0);
   const pH1=LY.XZ(sh.s+Math.sin(hAng+0.35)*9.2,sh.a-13.0);
   addEntry({
    id:'cit.harbour_crew.'+i,
    people:'shore_kin',
    diveClass:'half_diver_3m25m',
    affiliation:'shorekin_clients',
    affiliationLabel:'Harbour Shore-Kin Client Work-Bench',
    role:isSmelter?'paktong_smelter':(isFactor?'client_factor':'yard_rigger'),
    roleLabel:isSmelter?'Paktong Reverberatory Cupola Foundryman':(isFactor?'Shore-Kin Client Hall Tally Factor':'Harbour Skiff & Cordage Rigger'),
    homeId:bld.id,
    fleetId:null,
    cohort:'villages',
    paletteKey:'shore_harbour',
    preferredByname:isSmelter?'Cupola-Bellows':(isFactor?'Paktong-Tally':'Crib-Wright'),
    hatKind:'sun_hat',
    tool:isSmelter?'rake':(isFactor?'basket':'mallet')
   },{
    kind:'harbour_bench',
    isSmelter:isSmelter,
    tlBench:makeClearPace(bx0,bz0,bx1,bz1,28,hbPhases[i],5.0),
    tlHearth:makePaceTimeline(KS,pH0[0],pH0[1],pH1[0],pH1[1],22,hbPhases[i]*0.75,4.5),
    benchBuilding:bld.name
   });
  }
 }

 /* =========================================================================
    5. ARCOFORTE CARETAKERS (24 permanent) + DYNAMIC VISITING MOOT FLEETS (408)
    ========================================================================= */
 /* 5A. 24 Permanent cFlit-qBon Caretakers (8 on guard-hulls, 8 in Rotunda, 8 on Bastions/Park) */
 {
  const ctPhases=KS.slots(24,32,0.9);
  for(let i=0;i<24;i++){
   if(i<8){
    const vh=caretakerHullDefs[i%caretakerHullDefs.length];
    const side=(i%2===0)?-1:1;
    const c=Math.cos(vh.yaw),s=Math.sin(vh.yaw);
    const x0=vh.x+c*(-3.5)+s*(side*1.8),z0=vh.z-s*(-3.5)+c*(side*1.8);
    const x1=vh.x+c*(3.5)+s*(side*1.8),z1=vh.z-s*(3.5)+c*(side*1.8);
    addEntry({
     id:'cit.caretaker.'+i,
     people:'cflit_qbon',
     diveClass:'full_diver_25m100m',
     affiliation:'arcoforte_caretakers',
     affiliationLabel:'Caretaker House of Arcoforte',
     role:'guard_hull_watch',
     roleLabel:'Caretaker Sanctuary Ark Deck-Watch',
     homeId:vh.id,
     fleetId:null,
     cohort:'caretakers',
     paletteKey:'cflit_moot',
     hatKind:'hair_bun',
     tool:'spear'
    },{
     kind:'vessel_deck',
     deckY:vh.deckY,
     vesselName:vh.id,
     tlDeck:makePaceTimeline(KS,x0,z0,x1,z1,32,ctPhases[i],6.0),
     taskText:'Keeping anchor watch aboard '+vh.id
    });
   }else{
    const inRotunda=i<16;
    let p0,p1,elevY,spotLabel;
    if(inRotunda){
     const ang=((i-8)/8)*TAU;
     p0=AF.toWorld(-18+Math.cos(ang)*22,70.2,-108+Math.sin(ang)*22);
     p1=AF.toWorld(-18+Math.cos(ang+0.6)*24,70.2,-108+Math.sin(ang+0.6)*24);
     elevY=70.2;
     spotLabel='Arcoforte Domed Rotunda Concourse (+70 m)';
    }else{
     const west=(i%2===0);
     const lx=west?-205:205,lz=95+((i-16)*11);
     p0=AF.toWorld(lx,84.2,lz);
     p1=AF.toWorld(lx+(west?8:-8),84.2,lz+6);
     elevY=84.2;
     spotLabel='Arcoforte Refurbished '+(west?'West':'East')+' Dwelling Bastion (+84 m)';
    }
    addEntry({
     id:'cit.caretaker.'+i,
     people:'cflit_qbon',
     diveClass:'full_diver_25m100m',
     affiliation:'arcoforte_caretakers',
     affiliationLabel:'Caretaker House of Arcoforte',
     role:'caretaker_warden',
     roleLabel:'Caretaker House Sanctuary Warden',
     homeId:'fcove.arcoforte.bastion_store',
     fleetId:null,
     cohort:'caretakers',
     paletteKey:'cflit_moot',
     hatKind:'hair_bun',
     tool:i%3===0?'spear':'none'
    },{
     kind:'arcology_deck',
     deckY:elevY,
     tlWalk:makePaceTimeline(KS,p0[0],p0[2],p1[0],p1[2],32,ctPhases[i],6.0),
     taskText:'Tending '+spotLabel
    });
   }
  }
 }

 /* 5B. 408 Visiting Nomad Fleet Deck Crews & Great Careening Moot Delegates (gated per fleet!) */
 const fleetQuotas=[
  {fleetId:'ward_ring',deck:36,harbour:38,rotunda:28},
  {fleetId:'smelt_fleet',deck:36,harbour:36,rotunda:20},
  {fleetId:'trench_fleet',deck:12,harbour:8,rotunda:0},
  {fleetId:'outer_whalers',deck:36,harbour:38,rotunda:24},
  {fleetId:'island_traders',deck:36,harbour:36,rotunda:24}
 ];
 for(let fq=0;fq<fleetQuotas.length;fq++){
  const q=fleetQuotas[fq],fid=q.fleetId;
  const hulls=fleetHullsByFleet[fid]||[];
  const totalF=q.deck+q.harbour+q.rotunda;
  const fPhases=KS.slots(totalF,34,0.25);
  let idxF=0;

  /* Deck crews aboard moored fleet vessels (y = seaLevel + deckY, always > seaLevel!) */
  for(let d=0;d<q.deck;d++,idxF++){
   const vh=hulls[d%hulls.length];
   const isHk=vh.culture==='hueru-kuran';
   const people=isHk?'hueru_kuran':'cflit_qbon';
   const dkY=DECK_HEIGHTS[vh.rsKey]==null?2.4:DECK_HEIGHTS[vh.rsKey];
   const side=(d%2===0)?-1:1;
   const along=((Math.floor(d/2)%3)-1)*3.2;
   const c=Math.cos(vh.yaw),s=Math.sin(vh.yaw);
   const x0=vh.x+c*(along-2.2)+s*(side*1.7),z0=vh.z-s*(along-2.2)+c*(side*1.7);
   const x1=vh.x+c*(along+2.2)+s*(side*1.7),z1=vh.z-s*(along+2.2)+c*(side*1.7);
   addEntry({
    id:'cit.'+fid+'.deck.'+d,
    people:people,
    diveClass:people==='cflit_qbon'?'full_diver_25m100m':'land_bound',
    affiliation:fid,
    affiliationLabel:FLEET_LABELS[fid],
    role:isHk?'hk_whaler_crew':'ark_deck_crew',
    roleLabel:isHk?'Hueru-Kuran Whalebone Baidarka Harpooner':'Pelagic Ark-Fleet Mariner',
    homeId:vh.id,
    fleetId:fid,
    cohort:'moot_fleets',
    paletteKey:isHk?'hueru_whaler':'cflit_moot',
    hatKind:'hair_bun',
    tool:d%3===0?'spear':'none'
   },{
    kind:'vessel_deck',
    deckY:dkY,
    vesselName:vh.name,
    tlDeck:makePaceTimeline(KS,x0,z0,x1,z1,34,fPhases[idxF],5.5),
    taskText:'Aboard moored '+vh.name+' ('+FLEET_LABELS[fid]+')'
   });
  }

  /* Harbour Client Moot Concourse & Quay Promenade (+9.2 m terrace around sk_client_hall, foundry & boat-grid shed) */
  for(let h=0;h<q.harbour;h++,idxF++){
   const isHk=(fid==='outer_whalers'&&h%2===0)||(fid==='island_traders'&&h%6===0);
   const people=isHk?'hueru_kuran':'cflit_qbon';
   const sMoot=34+((fq*19+h*11)%116);
   const aMoot=LY.quayA(sMoot)+92+((h*7)%44);
   const p0=LY.XZ(sMoot,aMoot);
   const p1=LY.XZ(sMoot+(h%2===0?5.5:-5.5),aMoot+3.2);
   addEntry({
    id:'cit.'+fid+'.harbour.'+h,
    people:people,
    diveClass:people==='cflit_qbon'?'full_diver_25m100m':'land_bound',
    affiliation:fid,
    affiliationLabel:FLEET_LABELS[fid],
    role:isHk?'whale_oil_factor':'moot_envoy',
    roleLabel:isHk?'Hueru-Kuran Whale-Oil & Ambergris Factor':'Great Careening Moot Clan Envoy',
    homeId:chHall.id,
    fleetId:fid,
    cohort:'moot_fleets',
    paletteKey:isHk?'hueru_whaler':'cflit_moot',
    hatKind:'hair_bun',
    tool:h%4===0?'basket':'none'
   },{
    kind:'moot_terrace',
    minSafeY:9.2,
    tlWalk:makeClearPace(p0[0],p0[1],p1[0],p1[1],34,fPhases[idxF],6.5),
    taskText:'Bartering paktong, Copper-Tarn ore & whale oil at the Great Careening Moot (+9.2 m)'
   });
  }

  /* Arcoforte Domed Rotunda Concourse (+70 m) & Central Park / Bastions (+76..+84 m) */
  for(let r=0;r<q.rotunda;r++,idxF++){
   const isHk=(fid==='outer_whalers'&&r%3===0);
   const people=isHk?'hueru_kuran':'cflit_qbon';
   let p0,p1,dkY,locTxt;
   if(r%2===0){
    const ang=((fq*13+r)/24)*TAU;
    const rad=16+(r%4)*4.8;
    p0=AF.toWorld(-18+Math.cos(ang)*rad,70.2,-108+Math.sin(ang)*rad);
    p1=AF.toWorld(-18+Math.cos(ang+0.45)*rad,70.2,-108+Math.sin(ang+0.45)*rad);
    dkY=70.2;
    locTxt='Convening in Arcoforte Domed Rotunda Moot Concourse (+70 m)';
   }else{
    const ang=((fq*9+r)/24)*Math.PI-Math.PI*0.5;
    const lx=Math.sin(ang)*82,lz=-10+Math.cos(ang)*58;
    p0=AF.toWorld(lx,0,lz);
    p1=AF.toWorld(lx+5,0,lz+4);
    dkY=Math.max(72.0,terrainH(p0[0],p0[2]));
    locTxt='Gathering on Arcoforte Sheltered Central Park Terraces';
   }
   addEntry({
    id:'cit.'+fid+'.rotunda.'+r,
    people:people,
    diveClass:people==='cflit_qbon'?'full_diver_25m100m':'land_bound',
    affiliation:fid,
    affiliationLabel:FLEET_LABELS[fid],
    role:'moot_speaker',
    roleLabel:'Ark-Clan Moot Speaker & Lithophone Keeper',
    homeId:'fcove.arcoforte.bastion_store',
    fleetId:fid,
    cohort:'moot_fleets',
    paletteKey:isHk?'hueru_whaler':'cflit_moot',
    hatKind:'hair_bun',
    tool:'none'
   },{
    kind:'arcology_deck',
    deckY:dkY,
    tlWalk:makePaceTimeline(KS,p0[0],p0[2],p1[0],p1[2],34,fPhases[idxF],7.0),
    taskText:locTxt
   });
  }
 }

 function resolveLiveState(st){
  const s=st||{};
  const faults=s.faults||{};
  const seaLevel=s.seaLevel==null?0:s.seaLevel;
  const sillVelocity=s.sillVelocity==null?0:s.sillVelocity;
  const smeltActive=!!s.smeltActive;
  const day=s.day==null?44:Math.floor(s.day);
  const motionSec=s.motionSec==null?0:s.motionSec;
  let activeFleets=s.activeFleetIds;
  if(!Array.isArray(activeFleets)){
   if(s.fcoveWorld&&typeof s.fcoveWorld.dayState==='function'){
    activeFleets=s.fcoveWorld.dayState(day).fleetIds;
   }else{
    activeFleets=['ward_ring','smelt_fleet','trench_fleet','outer_whalers','island_traders'];
   }
  }
  if(faults.ignoreMootFleetsFault)activeFleets=[];
  return{
   seaLevel:seaLevel,
   sillVelocity:sillVelocity,
   smeltActive:smeltActive,
   day:day,
   motionSec:motionSec,
   activeFleetIds:activeFleets,
   isMoot:activeFleets.length>=4,
   faults:faults
  };
 }

 function headingFromStep(tl,t,x,z){
  const pNext=tl.at(t+0.35).value;
  const dx=pNext[0]-x,dz=pNext[1]-z;
  if(dx*dx+dz*dz>1e-5)return Math.atan2(dx,dz);
  const pPrev=tl.at(Math.max(0,t-0.35)).value;
  const bx=x-pPrev[0],bz=z-pPrev[1];
  return(bx*bx+bz*bz>1e-5)?Math.atan2(bx,bz):0;
 }

 function poseAll(state){
  const S=resolveLiveState(state);
  const lv=S.seaLevel,t=S.motionSec,faults=S.faults;
  const fleetSet=new Set(S.activeFleetIds);
  const poses=[];

  for(let i=0;i<entries.length;i++){
   const E=entries[i],C=E.citizen;
   if(C.fleetId&&!fleetSet.has(C.fleetId))continue;
   if(E.mootOnly&&!S.isMoot)continue;

   let x=0,y=0,z=0,yaw=0,mode='working',action='work',tool=C.defaultTool,task='',inCradlePit=false,onCauseway=false;

   if(E.kind==='careening'){
    const usePit=(lv<=0.8)||!!faults.floodedCradleCrewFault;
    if(usePit){
     inCradlePit=true;
     if(faults.floodedCradleCrewFault||lv<=E.blocksY-0.15){
      /* Exposed keel-block floor (-3.0 m in cradle_deep, -1.0 m in cradle_shallow) */
      const st=E.tlPit.at(t);
      x=st.value[0];z=st.value[1];
      y=E.blocksY;
      yaw=(st.name==='work_far'||st.name==='work_near')?E.yawInward:headingFromStep(E.tlPit,t,x,z);
      mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'working';
      action=E.jobKind==='caulker'?'careen_caulk':'careen_scrape';
      task=(E.jobKind==='caulker'?'Caulking seams with kauri-gum & bitumen':'Scraping barnacles & riveting paktong plates')+' on '+E.blocksY.toFixed(1)+' m floor ('+E.cradleId+')';
     }else{
      /* Mid-ebb (-3.15 m < seaLevel <= +0.8 m): work upper hull strakes from dry stepped cradle altar strictly above seaLevel */
      x=E.altarXZ[0];z=E.altarXZ[1];
      y=Math.max(1.25,lv+0.45);
      yaw=E.yawInward;
      mode='working';
      action='careen_scrape';
      task='Dressing topside strakes from dry stepped altar ('+E.cradleId+', y +'+y.toFixed(1)+' m)';
     }
    }else{
     /* Flooding cradle (seaLevel > +0.8 m): relocated onto +9.2 m Harbour Client Bench */
     const st=E.tlBench.at(t);
     x=st.value[0];z=st.value[1];
     y=Math.max(9.2,terrainH(x,z));
     yaw=headingFromStep(E.tlBench,t,x,z);
     mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'working';
     action='bench_prep';
     task='High-tide relocation: preparing oakum & paktong plates at '+E.benchHome+' (+9.2 m)';
    }
   }else if(E.kind==='rotor_diver'){
    const slack=Math.abs(S.sillVelocity)<=0.65;
    if(slack){
     const st=E.tlSwim.at(t),dv=E.tlDive.at(t);
     x=st.value[0];z=st.value[1];
     const depth=dv.value;
     y=Math.max(terrainH(x,z)+0.9,lv-depth);
     yaw=headingFromStep(E.tlSwim,t,x,z);
     mode=depth>0.65?'diving':'swimming';
     action='rotor_dive';
     task='Slack-water dive (|v| <= 0.65 m/s): inspecting paktong rotor #'+(E.rotorIndex+1)+' blades';
    }else{
     x=E.pierXZ[0];z=E.pierXZ[1];
     y=Math.max(E.pierTopY+0.05,lv+1.2);
     yaw=Math.atan2(LY.axis[0],LY.axis[1]);
     mode='working';
     action='pier_watch';
     task='Tending rotor #'+(E.rotorIndex+1)+' shaft bearings on +8.6 m pier top (race '+S.sillVelocity.toFixed(1)+' m/s)';
    }
   }else if(E.kind==='free_diver'){
    const st=E.tlSwim.at(t),dv=E.tlDive.at(t);
    x=st.value[0];z=st.value[1];
    const depth=dv.value;
    y=Math.max(terrainH(x,z)+0.9,lv-depth);
    yaw=headingFromStep(E.tlSwim,t,x,z);
    mode=depth>0.75?'diving':'swimming';
    action=mode==='diving'?'deep_dive':'surface_swim';
    task=(mode==='diving'?'Free-diving ('+depth.toFixed(1)+' m below surface)':'Surface breathing & tending lines')+' at '+E.stationLabel;
   }else if(E.kind==='byssus'){
    const exposed=(lv<=-6.0)||!!faults.submergedCausewayFault;
    if(exposed){
     onCauseway=true;
     const st=E.tlCauseway.at(t);
     x=st.value[0];z=st.value[1];
     y=faults.submergedCausewayFault?-6.0:Math.max(-5.95,lv+0.08);
     yaw=headingFromStep(E.tlCauseway,t,x,z);
     mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'working';
     action='byssus_gather';
     task='Great Ebb (<= -6.0 m): harvesting golden Pinna sea-byssus on White Stacks Causeway';
    }else{
     const st=E.tlHighShore.at(t);
     x=st.value[0];z=st.value[1];
     y=Math.max(9.6,terrainH(x,z),lv+1.5);
     yaw=headingFromStep(E.tlHighShore,t,x,z);
     mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'working';
     action='byssus_spin';
     task='Causeway submerged: combing & spinning golden sea-byssus at '+E.hiPlace;
    }
   }else if(E.kind==='village_worker'){
    const st=E.tlWork.at(t);
    x=st.value[0];z=st.value[1];
    y=Math.max(E.minSafeY,terrainH(x,z),lv+1.2);
    yaw=headingFromStep(E.tlWork,t,x,z);
    mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'working';
    action=C.role==='rope_walker'?'ropewalk':'village_craft';
    task=E.taskText;
   }else if(E.kind==='harbour_bench'){
    if(E.isSmelter&&S.smeltActive&&lv<=5.2){
     const st=E.tlHearth.at(t);
     x=st.value[0];z=st.value[1];
     y=Math.max(6.0,terrainH(x,z),lv+0.6);
     yaw=headingFromStep(E.tlHearth,t,x,z);
     mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'working';
     action='smelt_campaign';
     task='Spring Rotor Campaign: charging nickel bio-ash & copper-zinc at Paktong Smelt-Hearth (+6.0 m)';
    }else{
     const st=E.tlBench.at(t);
     x=st.value[0];z=st.value[1];
     y=Math.max(9.2,terrainH(x,z),lv+1.5);
     yaw=headingFromStep(E.tlBench,t,x,z);
     mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'working';
     action=E.isSmelter?'foundry_prep':'tally_work';
     task=E.isSmelter
      ?(S.smeltActive?'Staging roasted smelt charges on +9.2 m Foundry Bench':'Neap banked hearth: sorting paktong ingots & moulds at Harbour Foundry (+9.2 m)')
      :('Client contract tally & rigging work at '+E.benchBuilding+' (+9.2 m)');
    }
   }else if(E.kind==='vessel_deck'){
    const st=E.tlDeck.at(t);
    x=st.value[0];z=st.value[1];
    y=lv+E.deckY;
    yaw=headingFromStep(E.tlDeck,t,x,z);
    mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'moot';
    action='deck_watch';
    task=E.taskText+' (riding tide at '+(lv>=0?'+':'')+lv.toFixed(1)+' m)';
   }else if(E.kind==='moot_terrace'){
    const st=E.tlWalk.at(t);
    x=st.value[0];z=st.value[1];
    y=Math.max(E.minSafeY,terrainH(x,z),lv+1.5);
    yaw=headingFromStep(E.tlWalk,t,x,z);
    mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'moot';
    action='moot_converse';
    task=E.taskText;
   }else{
    /* arcology_deck (+70..+84 m Rotunda, Bastions & Central Park) */
    const st=E.tlWalk.at(t);
    x=st.value[0];z=st.value[1];
    y=Math.max(E.deckY,lv+10);
    yaw=headingFromStep(E.tlWalk,t,x,z);
    mode=(st.name==='walk_out'||st.name==='walk_back')?'walking':'moot';
    action='moot_converse';
    task=E.taskText;
   }

   poses.push({
    citizen:C,
    x:+x.toFixed(2),
    y:+y.toFixed(2),
    z:+z.toFixed(2),
    yaw:+yaw.toFixed(4),
    mode:mode,
    action:action,
    tool:tool,
    isDiving:mode==='swimming'||mode==='diving',
    inCradlePit:inCradlePit,
    cradleId:inCradlePit?E.cradleId:null,
    onCauseway:onCauseway,
    task:task
   });
  }
  return poses;
 }

 function summary(state){
  const S=resolveLiveState(state);
  const poses=poseAll(S);
  let careeningInPit=0,careeningDeepPit=0,careeningBench=0,diversInWater=0,diversOnPier=0,byssusOnCauseway=0,byssusOnShore=0;
  let villageWorkers=0,mootAndCaretakers=0,submergedNonDivers=0,landBoundInWater=0;
  const byPeople={cflit_qbon:0,shore_kin:0,hueru_kuran:0};

  for(let i=0;i<poses.length;i++){
   const p=poses[i],c=p.citizen;
   byPeople[c.people]=(byPeople[c.people]||0)+1;
   if(p.isDiving){
    diversInWater++;
    if(c.diveClass==='land_bound')landBoundInWater++;
   }else{
    if(p.y<S.seaLevel-0.01)submergedNonDivers++;
    if(c.cohort==='divers')diversOnPier++;
   }
   if(c.cohort==='careening'){
    if(p.inCradlePit){
     careeningInPit++;
     if(p.cradleId==='cradle_deep')careeningDeepPit++;
    }else{
     careeningBench++;
    }
   }else if(c.cohort==='byssus'){
    if(p.onCauseway)byssusOnCauseway++;
    else byssusOnShore++;
   }else if(c.cohort==='villages'){
    villageWorkers++;
   }else if(c.cohort==='caretakers'||c.cohort==='moot_fleets'){
    mootAndCaretakers++;
   }
  }

  return{
   seaLevel:S.seaLevel,
   day:S.day,
   activeFleets:S.activeFleetIds.length,
   totalActive:poses.length,
   byPeople:byPeople,
   careeningTotal:careeningInPit+careeningBench,
   careeningInPit:careeningInPit,
   careeningDeepPit:careeningDeepPit,
   careeningBench:careeningBench,
   diversInWater:diversInWater,
   diversOnPier:diversOnPier,
   byssusOnCauseway:byssusOnCauseway,
   byssusOnShore:byssusOnShore,
   villageWorkers:villageWorkers,
   mootAndCaretakers:mootAndCaretakers,
   submergedNonDivers:submergedNonDivers,
   landBoundInWater:landBoundInWater
  };
 }

 function auditState(state){
  const sum=summary(state);
  const problems=[];
  if(sum.submergedNonDivers>0)problems.push(sum.submergedNonDivers+' non-diving citizens below seaLevel '+sum.seaLevel.toFixed(2)+' m');
  if(sum.landBoundInWater>0)problems.push(sum.landBoundInWater+' land_bound citizens in water');
  if(sum.seaLevel>0.8&&sum.careeningInPit>0)problems.push(sum.careeningInPit+' careening crew still in flooding cradle at +'+sum.seaLevel.toFixed(2)+' m');
  if(sum.seaLevel>-6.0&&sum.byssusOnCauseway>0)problems.push(sum.byssusOnCauseway+' gatherers on submerged causeway at '+sum.seaLevel.toFixed(2)+' m');
  return{ok:problems.length===0,problems:problems,summary:sum};
 }

 function registerSimActors(S){
  if(!S||typeof S.role!=='function'||typeof S.actor!=='function')return 0;
  if(!S.R.role.fcove_diver){
   S.role({id:'fcove_diver',name:'Fleet-born Free-Diver & Rotor Tender',org:'arcoforte_caretakers',sched:[[0,'SLEEP'],[6,'EAT'],[7,'WORK'],[13,'EAT'],[14,'WORK'],[20,'MOOT'],[22,'SLEEP']]});
  }
  if(!S.R.role.fcove_shipwright){
   S.role({id:'fcove_shipwright',name:'Graving Cradle Shipwright & Caulker',org:'arcoforte_caretakers',sched:[[0,'SLEEP'],[6,'EAT'],[7,'CAREEN'],[13,'EAT'],[14,'CAREEN'],[19,'MOOT'],[22,'SLEEP']]});
  }
  if(!S.R.role.fcove_moot_delegate){
   S.role({id:'fcove_moot_delegate',name:'Visiting Nomad Fleet Moot Delegate',org:'fleet_orgs',sched:[[0,'SLEEP'],[7,'EAT'],[8,'TRADE'],[12,'MOOT'],[18,'EAT'],[19,'MOOT'],[23,'SLEEP']]});
  }
  let added=0;
  /* Register representative named citizens across all cohorts in SIM.R.actor so SIM.export() carries named people */
  for(let i=0;i<roster.length;i++){
   const c=roster[i];
   if(S.R.actor[c.id])continue;
   const simRole=c.cohort==='divers'?'fcove_diver':c.cohort==='careening'?'fcove_shipwright':c.cohort==='villages'?'shorekin_artisan':c.fleetId?'fcove_moot_delegate':'caretaker_warden';
   const homePlace=(S.R.place&&S.R.place[c.homeId])?c.homeId:(c.people==='shore_kin'?chHall.id:'fcove.arcoforte.bastion_store');
   S.actor({
    id:c.id,
    name:c.name,
    role:simRole,
    home:homePlace,
    work:homePlace
   });
   added++;
  }
  return added;
 }

 function registerTags(tags,state){
  if(!tags||typeof tags.add!=='function')return[];
  const poses=poseAll(state||{seaLevel:0,day:90,activeFleetIds:['ward_ring','smelt_fleet','trench_fleet','outer_whalers','island_traders']});
  const ids=[];
  for(let i=0;i<poses.length;i++){
   const p=poses[i],c=p.citizen;
   const tid='life.'+c.id;
   if(tags.get&&tags.get(tid))continue;
   const cul=c.people==='hueru_kuran'?'hueru-kuran':(c.people==='shore_kin'?'shore-kin':'cflit-qbon');
   const rec=tags.add({
    id:tid,
    'class':'life',
    kind:'citizen',
    key:'people:'+c.people,
    name:c.name+' ('+c.roleLabel+')',
    at:[p.x,p.y,p.z],
    r:0.65,
    h:1.78,
    tags:{culture:cul,role:c.role},
    note:c.peopleLabel+' · '+c.diveLabel+' · '+c.affiliationLabel
   });
   ids.push(rec.id);
  }
  return ids;
 }

 return Object.freeze({
  roster:Object.freeze(roster),
  byId:byId,
  poseAll:poseAll,
  summary:summary,
  auditState:auditState,
  registerSimActors:registerSimActors,
  registerTags:registerTags
 });
}

root.FCOVE_LIFE_PLAN=Object.freeze({
 DECK_HEIGHTS:DECK_HEIGHTS,
 FLEET_LABELS:FLEET_LABELS,
 create:create
});
if(typeof module!=='undefined'&&module.exports)module.exports=root.FCOVE_LIFE_PLAN;
})(typeof window!=='undefined'?window:globalThis);
