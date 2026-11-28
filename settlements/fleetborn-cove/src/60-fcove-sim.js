// ================================================================= FLEETBORN COVE — Shore-kin villages, nomad fleets & coupled SIM economy (FCOVE_SIM)  [G data]
// Pure [G data] simulation layer coupling core/simulation (SIM), FCOVE_TIDE, core/hamlet (KHAMLET.shorekinRow + KHAMLET.village),
// kits/shore-kin (SKK dims/bills), and core/camp (KCAMP.fleetWorld, Deep-Ward px [148, 492] <-> Arcoforte px [236, 242]) over a
// 92-day macrotidal lunar cycle.
// Zero THREE, zero DOM, zero Math.random, zero numeric || defaults: runs identically in Node (tests/test-fcove-sim.js), browser HUD, and Godot.
(function(root){
'use strict';
if(root.FCOVE_SIM)return;

const GOODS=Object.freeze({
 nickel_ash:Object.freeze({unit:'bale',cat:'good',name:'Pycnandra & Verdigris Nickel Bio-Ash'}),
 copper_zinc:Object.freeze({unit:'charge',cat:'good',name:'Roasted Copper-Zinc Smelt Charge'}),
 paktong:Object.freeze({unit:'ingot',cat:'good',name:'White Paktong Ingots & Sheathing'}),
 spars:Object.freeze({unit:'spar',cat:'good',name:'Araucaria & Agathis Masts and Spars'}),
 pitch_cordage:Object.freeze({unit:'coil',cat:'good',name:'Bitumen-Tarred Coir & Sea-Byssus Cordage'}),
 shell_lime:Object.freeze({unit:'sack',cat:'good',name:'Burnt Oyster-Shell & Limeshelf Flux'}),
 salt_fish:Object.freeze({unit:'barrel',cat:'food',name:'Cured Fish & Solar-Pan Sea Salt'}),
 salvage:Object.freeze({unit:'lot',cat:'good',name:'Abyssal Vent Sulfur & Ancient Salvage'}),
 whale_oil:Object.freeze({unit:'cask',cat:'good',name:'Pelagic Whale Oil & Oiled Sharkhide'})
});

const GOOD_KEYS=Object.freeze(Object.keys(GOODS));

const OPENING_STOCKS=Object.freeze({
 nickel_ash:48,
 copper_zinc:46,
 paktong:36,
 spars:42,
 pitch_cordage:48,
 shell_lime:34,
 salt_fish:120,
 salvage:18,
 whale_oil:20
});

const FLEET_INTERVALS=Object.freeze({
 ward_ring:16,
 smelt_fleet:19,
 trench_fleet:21,
 outer_whalers:29,
 island_traders:34
});

/* Map SKK def keys to canonical KTAGS building types */
const SK_TYPES=Object.freeze({
 sk_stilt_cot:Object.freeze(['dwelling-single']),
 sk_boardwalk_shack:Object.freeze(['dwelling-single']),
 sk_crib_rowhouse:Object.freeze(['dwelling-multi']),
 sk_hex_lime_house:Object.freeze(['dwelling-single']),
 sk_serpentine_lodge:Object.freeze(['dwelling-multi']),
 sk_compound_house:Object.freeze(['dwelling-single','shop']),
 sk_byssus_court:Object.freeze(['dwelling-multi','shop']),
 sk_client_hall:Object.freeze(['civic','market']),
 sk_ash_kelp_kiln:Object.freeze(['industry']),
 sk_spar_sawpit:Object.freeze(['industry']),
 sk_ropewalk_pitch:Object.freeze(['industry']),
 sk_paktong_foundry:Object.freeze(['industry']),
 sk_fish_saltery:Object.freeze(['industry','farm']),
 sk_lime_kiln:Object.freeze(['industry']),
 sk_boat_grid_shed:Object.freeze(['industry','infrastructure']),
 sk_tide_shrine:Object.freeze(['religious','civic'])
});

/* Caretaker House permanent sanctuary guard-hulls (4 hulls always moored at Arcoforte for the 420 resident caretakers) */
const CARETAKER_HULLS=Object.freeze([
 Object.freeze({id:'fcove.caretaker.ward',rsKey:'arkChainedWard',ruleKey:'ark_ward',name:'Caretaker House Sanctuary Ark-Ward',culture:'cflit-qbon',s:92,da:-36,r:27,bowS:-1}),
 Object.freeze({id:'fcove.caretaker.cat',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Caretaker Bell-Diving Ark-Catamaran',culture:'cflit-qbon',s:-78,da:-64,r:21,bowS:-1}),
 Object.freeze({id:'fcove.caretaker.tender',rsKey:'arkDiveTender',ruleKey:'dive_tender',name:'Cradle-Gate Sounding Tender',culture:'cflit-qbon',s:18,da:18,r:15,bowS:-1}),
 Object.freeze({id:'fcove.caretaker.pilot',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Sill-Race Pilot Trimaran',culture:'cflit-qbon',s:-635,da:14,r:13,bowS:-1})
]);

function defaultTerrainFn(LY){
 return function fallbackGround(x,z){
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

function defaultWaterFn(LY,terrainH){
 return function fallbackWater(x,z){
  const s=LY.S_OF(x,z),h=terrainH(x,z);
  if(s<1090&&h<7.2)return 7.2;
  if(s>=1015&&s<=1880&&Math.abs(LY.A_OF(x,z)-LY.centerA(s))<6&&h<24)return h+0.3;
  return -1e9;
 };
}

function buildVillages(opts){
 const o=opts||{};
 const LY=o.layout||(typeof root.FCOVE_LAYOUT!=='undefined'?root.FCOVE_LAYOUT:null);
 const KH=o.khamlet||(typeof root.KHAMLET!=='undefined'?root.KHAMLET:null);
 if(!LY)throw new Error('FCOVE_SIM.buildVillages: missing FCOVE_LAYOUT');
 if(!KH||typeof KH.shorekinRow!=='function'||typeof KH.village!=='function'){
  throw new Error('FCOVE_SIM.buildVillages: missing KHAMLET.shorekinRow / KHAMLET.village');
 }
 const terrainH=o.terrainH||defaultTerrainFn(LY);
 const waterH=o.waterH||defaultWaterFn(LY,terrainH);
 const skDims=o.skDims||(typeof root.SKK!=='undefined'&&root.SKK&&root.SKK.dims?root.SKK.dims():null);
 const dimsFn=skDims?function(k){const d=skDims[k];return d?{w:d.w,d:d.d,h:d.h}:null;}:null;

 const villages=[];
 const errors=[];
 let hamletPop=0,buildingCount=0;

 for(let i=0;i<LY.villages.length;i++){
  const vs=LY.villages[i];
  const row=KH.shorekinRow({shrine:true,clientHall:false});
  const okFn=function(x,z){
   if(Math.hypot(x-vs.x,z-vs.z)>vs.rFlat+16)return false;
   for(let j=0;j<villages.length;j++){
    const prev=villages[j].village;
    for(let r=0;r<prev.records.length;r++){
     const pr=prev.records[r];
     if(Math.abs(pr.x-x)<pr.w*0.5+14&&Math.abs(pr.z-z)<pr.d*0.5+14)return false;
    }
   }
   const y=terrainH(x,z);
   if(y<8.5)return false;
   if(y-waterH(x,z)<1.2)return false;
   const sx=Math.abs(terrainH(x+3,z)-terrainH(x-3,z))/6;
   const sz=Math.abs(terrainH(x,z+3)-terrainH(x,z-3))/6;
   return Math.max(sx,sz)<=row.slopeMax;
  };
  const vRes=KH.village({
   id:vs.id,
   world:LY.seed,
   culture:row,
   focus:vs.focus,
   site:{x:vs.x,z:vs.z},
   link:vs.link,
   resource:vs.resource,
   popMax:vs.popMax,
   dims:dimsFn,
   landing:vs.landing?{x:vs.landing.x,z:vs.landing.z,ux:vs.landing.ux,uz:vs.landing.uz}:undefined,
   ground:{ok:okFn},
   siteReach:140
  });
  if(vRes.error){
   errors.push(vs.id+': '+vRes.error);
  }
  const fInfo=KH.SHOREKIN_FOCUS_INFO&&KH.SHOREKIN_FOCUS_INFO[vs.focus]?KH.SHOREKIN_FOCUS_INFO[vs.focus]:null;
  let minY=1e9,maxY=-1e9;
  const recs=vRes.records||[];
  for(let r=0;r<recs.length;r++){
   const ry=terrainH(recs[r].x,recs[r].z);
   if(ry<minY)minY=ry;
   if(ry>maxY)maxY=ry;
  }
  hamletPop+=vRes.census?vRes.census.pop:0;
  buildingCount+=recs.length;
  villages.push(Object.freeze({
   spec:vs,
   row:row,
   village:vRes,
   pop:vRes.census?vRes.census.pop:0,
   households:vRes.census?vRes.census.households:0,
   focusJobs:vRes.census?vRes.census.focusJobs:0,
   minY:recs.length?+minY.toFixed(2):vs.benchY,
   maxY:recs.length?+maxY.toFixed(2):vs.benchY,
   focusInfo:fInfo,
   clientContract:Object.freeze({
    status:'client',
    patron:'arcoforte_caretaker_house',
    titheShare:0.62,
    owes:fInfo&&fInfo.clientTithe?Object.freeze(fInfo.clientTithe.owes.slice()):Object.freeze(['spring_yard_labour']),
    receives:Object.freeze(['paktong','cradle_shallow_berths'])
   })
  }));
 }

 const harbourCrewPop=180;
 const harbourBuildings=LY.harbourWorks.map(hw=>Object.freeze(Object.assign({},hw,{
  y:+Math.max(LY.harbourBenchY,terrainH(hw.x,hw.z)).toFixed(2)
 })));

 return Object.freeze({
  villages:Object.freeze(villages),
  harbourBuildings:Object.freeze(harbourBuildings),
  harbourCrewPop:harbourCrewPop,
  hamletPop:hamletPop,
  totalShorekinPop:hamletPop+harbourCrewPop,
  buildingCount:buildingCount+harbourBuildings.length,
  errors:Object.freeze(errors)
 });
}

function registerTags(tags,vData,opts){
 if(!tags||typeof tags.add!=='function')return[];
 const o=opts||{};
 const LY=o.layout||(typeof root.FCOVE_LAYOUT!=='undefined'?root.FCOVE_LAYOUT:null);
 const terrainH=o.terrainH||(LY?defaultTerrainFn(LY):(()=>12));
 if(typeof root.KTAGS!=='undefined'&&root.KTAGS&&root.KTAGS.VOCAB&&root.KTAGS.VOCAB.cultureAlias){
  const V=root.KTAGS.VOCAB;
  if(!V.cultureAlias.fleetborn)V.cultureAlias.fleetborn={culture:'islander',style:'fleetborn'};
  if(!V.cultureAlias['cflit-qbon'])V.cultureAlias['cflit-qbon']={culture:'islander',style:'fleetborn'};
  if(!V.cultureAlias.shorekin)V.cultureAlias.shorekin={culture:'islander',style:'shorekin'};
  if(!V.cultureAlias['shore-kin'])V.cultureAlias['shore-kin']={culture:'islander',style:'shorekin'};
 }
 const ids=[];
 const addIfNew=function(rec){
  if(tags.get&&tags.get(rec.id))return tags.get(rec.id);
  const added=tags.add(rec);
  ids.push(added.id);
  return added;
 };

 /* 1. Harbour Shore-kin client hall, foundry & boat-grid shed */
 for(let i=0;i<vData.harbourBuildings.length;i++){
  const hb=vData.harbourBuildings[i];
  addIfNew({
   id:hb.id,
   'class':'building',
   kind:hb.key,
   key:'shore-kin:'+hb.key,
   name:hb.name,
   at:[hb.x,hb.y,hb.z],
   size:[hb.w,hb.d,hb.h],
   tags:{culture:'shore-kin',types:(SK_TYPES[hb.key]||['industry']).slice(),state:'intact'}
  });
 }

 /* 2. 3D Timber Spar Log-Chute */
 if(LY&&LY.sparChute){
  const sc=LY.sparChute;
  addIfNew({
   id:sc.id,
   'class':'building',
   kind:'log_chute',
   key:'fcove:spar_log_chute',
   name:sc.name,
   at:[sc.x,+((sc.headY+sc.footY)*0.5).toFixed(2),sc.z],
   size:[sc.widthM+4,sc.lengthM,sc.headY-sc.footY],
   tags:{culture:'shore-kin',types:['infrastructure','industry'],state:'intact',landmark:true}
  });
 }

 /* 3. All 5 Shore-kin client hinterland villages & their SKK buildings */
 for(let i=0;i<vData.villages.length;i++){
  const vd=vData.villages[i],vs=vd.spec,vl=vd.village;
  const sy=terrainH(vl.site.x,vl.site.z);
  addIfNew({
   id:'fcove.settlement.'+vs.id,
   'class':'landmark',
   kind:'village',
   key:'hamlet:'+vs.id,
   name:vs.name,
   at:[+vl.site.x.toFixed(2),+sy.toFixed(2),+vl.site.z.toFixed(2)],
   r:vs.rFlat,
   tags:{culture:'shore-kin',types:['civic','dwelling-multi'],landmark:true}
  });
  const recs=vl.records||[];
  for(let r=0;r<recs.length;r++){
   const b=recs[r];
   if(!b)continue;
   const by=terrainH(b.x,b.z);
   const tps=SK_TYPES[b.key]?SK_TYPES[b.key].slice():['dwelling-single'];
   addIfNew({
    id:'fcove.'+b.id,
    'class':'building',
    kind:b.key,
    key:'shore-kin:'+b.key,
    name:vs.epithet+' — '+b.key.replace(/^sk_/,'').replace(/_/g,' '),
    at:[+b.x.toFixed(2),+by.toFixed(2),+b.z.toFixed(2)],
    size:[b.w,b.d,b.h],
    tags:{culture:'shore-kin',types:tps,state:'intact'}
   });
  }
 }
 return ids;
}

function makeStaggeredFleets(KC){
 const defs=KC.DEFAULT_FLEETS;
 const out=[];
 for(let i=0;i<defs.length;i++){
  const f=defs[i];
  const iv=FLEET_INTERVALS[f.id]==null?28:FLEET_INTERVALS[f.id];
  const hulls=f.hulls.map(h=>Object.assign({},h,{
   careenInterval_d:h.deepCareen?iv:Math.max(14,iv-4)
  }));
  out.push(Object.assign({},f,{hulls:hulls}));
 }
 return out;
}

function create(opts){
 const o=opts||{};
 const faults=Object.assign({
  disableSpringRotors:false,
  cutAshSupply:false,
  cutCopperZinc:false,
  neapDeepCareenFault:false
 },o.faults||{});

 const LY=o.layout||(typeof root.FCOVE_LAYOUT!=='undefined'?root.FCOVE_LAYOUT:null);
 const KH=o.khamlet||(typeof root.KHAMLET!=='undefined'?root.KHAMLET:null);
 const KC=o.kcamp||(typeof root.KCAMP!=='undefined'?root.KCAMP:null);
 const S=o.sim||(typeof root.SIM!=='undefined'?root.SIM:null);
 const R=o.tideRules||null;
 if(!LY)throw new Error('FCOVE_SIM.create: missing FCOVE_LAYOUT');
 if(!KH)throw new Error('FCOVE_SIM.create: missing KHAMLET');
 if(!KC||typeof KC.fleetWorld!=='function')throw new Error('FCOVE_SIM.create: missing KCAMP.fleetWorld');
 if(!S||typeof S.economy!=='function')throw new Error('FCOVE_SIM.create: missing SIM');
 if(!R||typeof R.daySummary!=='function')throw new Error('FCOVE_SIM.create: missing FCOVE_TIDE rules instance');

 const terrainH=o.terrainH||defaultTerrainFn(LY);
 const waterH=o.waterH||defaultWaterFn(LY,terrainH);
 const vData=o.villagesData||buildVillages({layout:LY,khamlet:KH,terrainH:terrainH,waterH:waterH,skDims:o.skDims});
 const tagIds=o.tags?registerTags(o.tags,vData,{layout:LY,terrainH:terrainH}):[];

 /* 1. Initialize SIM clock, factions, orgs, client-patron relations, places, and economy */
 const simClock={day:0,hour:8,t:0};
 const hostClock=o.clock||null;
 S.init({
  seed:LY.seed,
  day:()=>hostClock?hostClock.day:simClock.day,
  hour:()=>hostClock?hostClock.hour:simClock.hour,
  t:()=>hostClock?(hostClock.day*86400+hostClock.hour*3600):simClock.t,
  err:o.err||function(){}
 });
 /* Reset registries cleanly when re-initialized in multi-run Node tests */
 Object.keys(S.R).forEach(k=>{S.R[k]={};S.order[k]=[];});
 S.problems.length=0;
 S.LOG.length=0;
 S.ECONS=null;
 S.ECON_ORDER=[];
 S.STOCKS=null;

 ['SLEEP','WORK','EAT','WORSHIP','TRADE','MOOT','CAREEN'].forEach(a=>{
  S.activity({id:a,indoor:a==='SLEEP'});
 });

 S.faction({id:'cflit-qbon',name:'Fleet-born (cFlīt-qBōn)',culture:'cflit-qbon'});
 S.faction({id:'shore-kin',name:'Shore-kin of the Arch',culture:'shore-kin'});
 S.faction({id:'hueru-kuran',name:'Hueru-Kuran Whalers',culture:'hueru-kuran'});

 S.org({id:'arcoforte_caretakers',name:'Caretaker House of Arcoforte',faction:'cflit-qbon',kind:'house',resident:true});
 S.org({id:'shorekin_clients',name:'Shore-kin Client Villages & Harbour Crew',faction:'shore-kin',kind:'clientele',resident:true});
 S.org({id:'fleet_orgs',name:'Visiting Sea-Nomad Moot Fleets',faction:'cflit-qbon',kind:'fleet',resident:false});

 S.relation({a:'arcoforte_caretakers',b:'shorekin_clients',stance:'friendly',trade:true});
 S.relation({a:'shorekin_clients',b:'arcoforte_caretakers',stance:'friendly',trade:true});
 S.relation({a:'arcoforte_caretakers',b:'fleet_orgs',stance:'allied',trade:true});
 S.relation({a:'cflit-qbon',b:'hueru-kuran',stance:'friendly',trade:true});

 /* Harbour & village places in SIM */
 const ch=vData.harbourBuildings[0];
 const pf=vData.harbourBuildings[1];
 const bg=vData.harbourBuildings[2];
 const afP=LY.arcoforte;

 const navNodes=[
  {id:'n_client_hall',x:ch.x,y:ch.y,z:ch.z},
  {id:'n_foundry',x:pf.x,y:pf.y,z:pf.z},
  {id:'n_boat_grid',x:bg.x,y:bg.y,z:bg.z},
  {id:'n_hearth',x:LY.smeltHearth.x,y:LY.smeltHearth.y,z:LY.smeltHearth.z},
  {id:'n_arcoforte',x:afP.x,y:78,z:afP.z}
 ];
 const navEdges=[];
 for(let i=0;i<navNodes.length-1;i++){
  const A=navNodes[i],B=navNodes[i+1];
  navEdges.push({id:'e_h_'+i,a:A.id,b:B.id,kind:'road',len:Math.hypot(B.x-A.x,B.z-A.z),w:6});
 }
 vData.villages.forEach((vd,vi)=>{
  const nid='n_'+vd.spec.id;
  navNodes.push({id:nid,x:vd.village.site.x,y:vd.minY,z:vd.village.site.z});
  navEdges.push({id:'e_v_'+vi,a:nid,b:'n_client_hall',kind:'trail',len:Math.hypot(vd.village.site.x-ch.x,vd.village.site.z-ch.z),w:4});
 });
 S.nav.layer('pedestrian',{nodes:navNodes,edges:navEdges});

 S.place({
  id:ch.id,
  name:ch.name,
  kind:'client_hall',
  x:ch.x,y:ch.y,z:ch.z,
  org:'arcoforte_caretakers',
  activities:{TRADE:40,MOOT:120,WORK:16,EAT:40}
 });
 S.place({
  id:'fcove.arcoforte.bastion_store',
  name:'Arcoforte Lower Bastion Caretaker Store & Halls',
  kind:'bastion_store',
  x:afP.x,y:78,z:afP.z,
  org:'arcoforte_caretakers',
  activities:{SLEEP:420,MOOT:260,EAT:180,WORK:30}
 });
 S.place({
  id:LY.smeltHearth.id,
  name:LY.smeltHearth.name,
  kind:'foundry',
  x:LY.smeltHearth.x,y:LY.smeltHearth.y,z:LY.smeltHearth.z,
  org:'arcoforte_caretakers',
  activities:{WORK:36}
 });
 S.place({
  id:pf.id,
  name:pf.name,
  kind:'paktong_foundry',
  x:pf.x,y:pf.y,z:pf.z,
  org:'shorekin_clients',
  activities:{WORK:24}
 });
 S.place({
  id:bg.id,
  name:bg.name,
  kind:'boat_grid_shed',
  x:bg.x,y:bg.y,z:bg.z,
  org:'shorekin_clients',
  activities:{WORK:18,CAREEN:8}
 });

 vData.villages.forEach(vd=>{
  const vs=vd.spec,vl=vd.village;
  S.place({
   id:vs.id,
   name:vs.name,
   kind:'village_'+vs.focus,
   x:vl.site.x,y:vd.minY,z:vl.site.z,
   org:'shorekin_clients',
   activities:{SLEEP:vd.pop,WORK:vd.focusJobs,EAT:vd.pop,WORSHIP:24}
  });
 });

 S.role({
  id:'caretaker_warden',
  name:'Fleet-born Drydock Caretaker',
  org:'arcoforte_caretakers',
  sched:[[0,'SLEEP'],[6,'EAT'],[7,'WORK'],[13,'EAT'],[14,'WORK'],[19,'MOOT'],[22,'SLEEP']]
 });
 S.role({
  id:'shorekin_artisan',
  name:'Shore-kin Client Artisan',
  org:'shorekin_clients',
  sched:[[0,'SLEEP'],[6,'EAT'],[7,'WORK'],[12,'EAT'],[13,'WORK'],[18,'WORSHIP'],[20,'EAT'],[21,'SLEEP']]
 });

 S.actor({id:'actor.caretaker_master',role:'caretaker_warden',home:'fcove.arcoforte.bastion_store',work:LY.smeltHearth.id});
 vData.villages.forEach(vd=>{
  S.actor({id:'actor.head.'+vd.spec.id,role:'shorekin_artisan',home:vd.spec.id,work:vd.spec.id});
 });

 const goodsCfg={};
 GOOD_KEYS.forEach(k=>{goodsCfg[k]={unit:GOODS[k].unit};});
 S.economy({
  goods:goodsCfg,
  inputs:{paktong:{nickel_ash:2,copper_zinc:2,shell_lime:1}},
  every:60,
  imports:{days:3,scan:1440},
  exports:{minDays:4,made:false}
 });

 /* Warehouses & Producer Stores */
 const storeHall=S.store(ch.id,{kind:'warehouse',cap:8000});
 const storeBastion=S.store('fcove.arcoforte.bastion_store',{kind:'warehouse',cap:8000});
 S.store(LY.smeltHearth.id,{kind:'site',cap:1200});
 S.recipe(LY.smeltHearth.id,{out:['paktong'],rate:0.5,cap:1200});

 const villageProduces={
  village_ash:['nickel_ash','shell_lime'],
  village_spars:['spars'],
  village_cordage:['pitch_cordage'],
  village_ore:['copper_zinc'],
  village_saltery:['salt_fish']
 };
 vData.villages.forEach(vd=>{
  const outs=villageProduces[vd.spec.id]||['salt_fish'];
  S.store(vd.spec.id,{kind:'site',cap:1500});
  S.recipe(vd.spec.id,{out:outs,rate:0.4,cap:1500});
 });

 /* Seed opening stocks across Caretaker warehouses (respecting supply-cut fault injections!) */
 GOOD_KEYS.forEach(g=>{
  let qty=OPENING_STOCKS[g];
  if(g==='nickel_ash'&&faults.cutAshSupply)qty=0;
  if(g==='copper_zinc'&&faults.cutCopperZinc)qty=0;
  if(g==='paktong'&&(faults.disableSpringRotors||faults.cutAshSupply||faults.cutCopperZinc))qty=8;
  const toBastion=(g==='paktong'||g==='salvage'||g==='whale_oil')?Math.floor(qty*0.5):0;
  const toHall=qty-toBastion;
  if(toHall>0)storeHall.stock[g]=(storeHall.stock[g]||0)+toHall;
  if(toBastion>0)storeBastion.stock[g]=(storeBastion.stock[g]||0)+toBastion;
 });
 S.stocksStep(0);
 const ledgerStart=S.ledgerSnap();

 /* 2. Initialize KCAMP.fleetWorld with Deep-Ward (px [148, 492], 530 km SSW, 1.9 m diurnal) & 5 visiting fleets */
 const fleetDefs=makeStaggeredFleets(KC);
 const gateFn=function(day){
  const di=Math.floor(day),ds=R.daySummary(di);
  const mod=((di%91)+91)%91;
  const isMoot=(mod>=0&&mod<=2)||(mod>=43&&mod<=46)||(mod>=89&&mod<=90);
  return{
   day:di,
   dayRange:ds.range,
   dayHighest:ds.highest,
   deepCradleOpen:faults.neapDeepCareenFault?true:ds.cradles.cradle_deep.open,
   greatCradleOpen:ds.cradles.cradle_great.open,
   isMoot:isMoot
  };
 };

 const fleetWorld=KC.fleetWorld({
  world:LY.seed,
  caretakerPop:420,
  fleets:fleetDefs,
  tideGate:gateFn
 });

 const dailyLog=[];
 const villageTotals={};
 vData.villages.forEach(vd=>{
  villageTotals[vd.spec.id]={produced:{},tithed:{},paktongReceived:0,shallowBerthsUsed:0};
 });

 const metrics={
  daysSimulated:0,
  springCampaignDays:0,
  neapBankedDays:0,
  paktongSmeltedSpring:0,
  paktongSmeltedBanked:0,
  paktongSmeltedTotal:0,
  byssusSpringBonus:0,
  clientTitheUnits:0,
  clientPaktongIssued:0,
  clientShallowBerths:0,
  fleetImports:{},
  fleetExports:{},
  minStockSeen:{},
  maxMootPop:0,
  maxMootFleets:0
 };
 GOOD_KEYS.forEach(g=>{metrics.minStockSeen[g]=S.stockOf(g);});

 function haulSiteToHall(siteId,good,qty){
  const P=S.R.place[siteId];
  if(!P||!P.stock)return 0;
  const mv=Math.min(qty,P.stock[good]==null?0:P.stock[good]);
  if(mv>0){
   P.stock[good]-=mv;
   storeHall.stock[good]=(storeHall.stock[good]||0)+mv;
  }
  return mv;
 }

 function stepDay(d){
  const di=Math.floor(d);
  simClock.day=di;
  simClock.hour=12;
  simClock.t=di*86400+43200;

  /* A. Advance pelagic nomad fleets one day under macrotidal careening & moot convergence laws */
  const fHist=KC.fleetTick(fleetWorld,di);
  const ds=R.daySummary(di);
  const rotorMWh=faults.disableSpringRotors?0:ds.rotors.mwh;
  const smeltActive=(!faults.disableSpringRotors)&&rotorMWh>=R.rotors.campaignMinMWh;
  const millDuty=ds.mill.duty;
  const causewayOpen=ds.causeway.byssusGatherable;

  if(smeltActive)metrics.springCampaignDays++;
  else metrics.neapBankedDays++;

  /* B. Shore-kin client village daily production & patron tithe delivery to Caretaker House */
  vData.villages.forEach(vd=>{
   const id=vd.spec.id,vt=villageTotals[id];
   const titheShare=vd.clientContract.titheShare;
   const emit=function(good,n){
    if(!(n>0))return;
    const made=S.produce(id,good,n);
    vt.produced[good]=(vt.produced[good]||0)+made;
    const tithe=Math.max(1,Math.round(made*titheShare));
    const moved=haulSiteToHall(id,good,made);
    vt.tithed[good]=(vt.tithed[good]||0)+Math.min(moved,tithe);
    metrics.clientTitheUnits+=Math.min(moved,tithe);
   };
   if(id==='village_ash'){
    if(!faults.cutAshSupply)emit('nickel_ash',5+(ds.mill.heavyStampsActive?2:0));
    emit('shell_lime',3);
   }else if(id==='village_spars'){
    emit('spars',3+(ds.isSpringDockDay?1:0));
   }else if(id==='village_cordage'){
    const byssus=causewayOpen?2:0;
    if(byssus>0)metrics.byssusSpringBonus+=byssus;
    emit('pitch_cordage',3+(millDuty>=0.45?1:0)+byssus);
   }else if(id==='village_ore'){
    if(!faults.cutCopperZinc)emit('copper_zinc',4+(ds.mill.heavyStampsActive?2:0));
   }else if(id==='village_saltery'){
    emit('salt_fish',7+(ds.phase==='spring'?1:0));
   }
   /* Daily cradle_shallow boat-repair berth entitlement for client skiffs */
   if(ds.cradles.cradle_shallow.open){
    vt.shallowBerthsUsed++;
    metrics.clientShallowBerths++;
   }
  });

  /* C. Visiting Nomad Fleet arrivals, Copper Tarn / Trench / Whaler imports & exports */
  const mooredToday=fHist.byPort.arcoforte||[];
  if(mooredToday.length>metrics.maxMootFleets)metrics.maxMootFleets=mooredToday.length;
  if(fHist.arcoforteTotalPop>metrics.maxMootPop)metrics.maxMootPop=fHist.arcoforteTotalPop;

  for(let i=0;i<fleetWorld.ops.length;i++){
   const op=fleetWorld.ops[i];
   if(op.day!==di)continue;
   if(op.what==='arrive'&&op.port==='arcoforte'){
    const landGood=function(g,n){
     if(!(n>0))return;
     S.economyLand(g,n,ch.id);
     S.economyBook('imported',g,n);
     metrics.fleetImports[g]=(metrics.fleetImports[g]||0)+n;
    };
    if(op.fleetId==='smelt_fleet'){
     if(!faults.cutCopperZinc)landGood('copper_zinc',26);
     landGood('salvage',6);
    }else if(op.fleetId==='trench_fleet'){
     landGood('salvage',16);
     landGood('shell_lime',6);
    }else if(op.fleetId==='outer_whalers'){
     landGood('whale_oil',18);
     landGood('salt_fish',16);
    }else if(op.fleetId==='ward_ring'){
     landGood('salvage',10);
     landGood('salt_fish',10);
    }else if(op.fleetId==='island_traders'){
     if(!faults.cutCopperZinc)landGood('copper_zinc',12);
     landGood('salvage',8);
    }
   }else if(op.what==='sail'&&op.from==='arcoforte'){
    const shipOut=function(g,want,floorKeep){
     const avail=Math.max(0,S.stockOf(g)-floorKeep);
     const n=Math.min(want,avail);
     if(n>0){
      const got=S.economyTake(g,n);
      if(got>0){
       S.economyBook('exported',g,got);
       metrics.fleetExports[g]=(metrics.fleetExports[g]||0)+got;
      }
     }
    };
    shipOut('paktong',6,14);
    shipOut('spars',5,16);
    shipOut('pitch_cordage',6,18);
    shipOut('salt_fish',8,36);
   }
  }

  /* D. TIDE-GATED PAKTONG REVERBERATORY SMELT CAMPAIGN (strictly 0 on neap/banked days!) */
  let smeltedToday=0;
  if(smeltActive){
   /* Number of cupola heats scales with sill-race |v|^3 rotor MWh (2..4 heats on spring days, 2 paktong per heat) */
   const maxHeats=Math.min(5,Math.max(2,Math.floor(rotorMWh/4.2)));
   for(let h=0;h<maxHeats;h++){
    if(S.stockOf('nickel_ash')>=2&&S.stockOf('copper_zinc')>=2&&S.stockOf('shell_lime')>=1){
     S.supply('nickel_ash',2,true);
     S.supply('copper_zinc',2,true);
     S.supply('shell_lime',1,true);
     const madeP=S.produce(LY.smeltHearth.id,'paktong',2);
     const P=S.R.place[LY.smeltHearth.id];
     if(P&&P.stock&&P.stock.paktong>0){
      const mv=P.stock.paktong;
      P.stock.paktong=0;
      storeBastion.stock.paktong=(storeBastion.stock.paktong||0)+mv;
     }
     smeltedToday+=madeP;
    }
   }
   metrics.paktongSmeltedSpring+=smeltedToday;
  }else{
   /* Hearth is banked on neap/low-rotor days: strictly 0 paktong smelted */
   metrics.paktongSmeltedBanked+=0;
  }
  metrics.paktongSmeltedTotal+=smeltedToday;

  /* E. Client-Patron Counter-Grant (Caretaker House issues paktong tools/fittings to the 5 Shore-kin client villages) */
  if(di%5===2&&S.stockOf('paktong')>=18){
   for(let vi=0;vi<vData.villages.length;vi++){
    if(S.stockOf('paktong')<=12)break;
    const got=S.supply('paktong',1,true);
    if(got>0){
     villageTotals[vData.villages[vi].spec.id].paktongReceived+=got;
     metrics.clientPaktongIssued+=got;
    }
   }
  }

  /* F. Graving Cradle Careening Draws (deep hulls consume paktong sheathing, spars & pitch_cordage on spring careening days) */
  let careenedDeepToday=0,careenedShallowToday=0;
  for(let ci=fleetWorld.careenLog.length-1;ci>=0;ci--){
   const ce=fleetWorld.careenLog[ci];
   if(ce.day<di)break;
   if(ce.day!==di)continue;
   if(ce.deepCareen){
    careenedDeepToday++;
    if(S.stockOf('paktong')>=8)S.supply('paktong',1,true);
    if(S.stockOf('spars')>=8)S.supply('spars',1,true);
    if(S.stockOf('pitch_cordage')>=8)S.supply('pitch_cordage',1,true);
   }else{
    careenedShallowToday++;
    if(S.stockOf('pitch_cordage')>=8)S.supply('pitch_cordage',1,true);
   }
  }

  /* G. Daily Provisioning (caretakers, harbour Shore-kin crew & moored fleet moot gatherings) */
  const popHere=fHist.arcoforteTotalPop+vData.harbourCrewPop;
  const fishNeed=Math.max(2,Math.min(9,Math.round(popHere/340)));
  if(S.stockOf('salt_fish')>=fishNeed)S.supply('salt_fish',fishNeed,true);
  if(ds.isGreatCareening&&S.stockOf('whale_oil')>=4)S.supply('whale_oil',2,true);
  if(ds.isGreatCareening&&S.stockOf('salvage')>=4)S.supply('salvage',2,true);

  /* Snapshot daily SIM stocks at end of day */
  S.stocksStep((di+1)*1440);

  const curStocks={};
  GOOD_KEYS.forEach(g=>{
   const st=(S.R.place[ch.id].stock[g]||0)+(S.R.place['fcove.arcoforte.bastion_store'].stock[g]||0);
   curStocks[g]=st;
   if(st<metrics.minStockSeen[g])metrics.minStockSeen[g]=st;
  });

  const rec=Object.freeze({
   day:di,
   phase:ds.phase,
   range:ds.range,
   highest:ds.highest,
   rotorMWh:+rotorMWh.toFixed(2),
   smeltActive:smeltActive,
   hearthState:smeltActive?'campaign':'banked',
   paktongSmelted:smeltedToday,
   causewayOpen:causewayOpen,
   deepCradleOpen:ds.cradles.cradle_deep.open,
   greatCradleOpen:ds.cradles.cradle_great.open,
   careenedDeep:careenedDeepToday,
   careenedShallow:careenedShallowToday,
   fleetsInCove:mooredToday.length,
   fleetIds:Object.freeze(mooredToday.map(f=>f.id)),
   mootPop:fHist.arcoforteTotalPop,
   stocks:Object.freeze(curStocks)
  });
  dailyLog.push(rec);
  metrics.daysSimulated++;
  return rec;
 }

 function runDays(d0,d1){
  const start=Math.floor(d0),end=Math.floor(d1);
  if(!(end>=start))throw new Error('FCOVE_SIM.runDays: requires d1 >= d0');
  for(let d=start;d<end;d++)stepDay(d);
  return dailyLog;
 }

 function normalizeDay(day){
  const di=Math.floor(day==null?0:day);
  if(fleetWorld.history[di])return di;
  const n=metrics.daysSimulated>0?metrics.daysSimulated:91;
  const wrapped=((di%91)+91)%91;
  return wrapped<n?wrapped:0;
 }

 function dayState(day){
  const di=normalizeDay(day);
  const fl=KC.fleetsAt(fleetWorld,'arcoforte',di);
  const fIds=fl.map(f=>f.id);
  let visHulls=0;
  for(let i=0;i<LY.fleetSlots.length;i++){
   if(fIds.indexOf(LY.fleetSlots[i].fleetId)>=0)visHulls++;
  }
  const logEntry=dailyLog[di]||dailyLog[dailyLog.length-1]||null;
  const hist=fleetWorld.history[di]||null;
  return{
   day:di,
   rawDay:day==null?0:Math.floor(day),
   fleets:fl,
   fleetIds:fIds,
   fleetCount:fl.length,
   visitingHulls:visHulls,
   caretakerHulls:CARETAKER_HULLS.length,
   careenedHulls:2,
   totalHullsInCove:visHulls+CARETAKER_HULLS.length+2,
   mootPop:hist?hist.arcoforteTotalPop:420,
   shorekinPop:vData.totalShorekinPop,
   shorekinVillages:vData.villages.length,
   stocks:logEntry?logEntry.stocks:Object.assign({},OPENING_STOCKS),
   paktongSmeltedCum:metrics.paktongSmeltedTotal
  };
 }

 function audit(){
  const ledgerEnd=S.ledgerSnap();
  const statement=S.ledger(ledgerStart,ledgerEnd,{tol:0.01});
  const simProblems=S.check();
  let neapDeepCareens=0;
  for(let i=0;i<fleetWorld.careenLog.length;i++){
   const c=fleetWorld.careenLog[i];
   if(c.deepCareen&&!R.cradleDay('cradle_deep',c.day).open)neapDeepCareens++;
  }
  const deepWardCareens=fleetWorld.careenLog.filter(c=>c.port&&c.port!=='arcoforte').length;
  let negativeStock=false;
  GOOD_KEYS.forEach(g=>{if(metrics.minStockSeen[g]<0)negativeStock=true;});
  const villagesOk=vData.errors.length===0&&vData.villages.length===5&&vData.villages.every(vd=>{
   const vt=villageTotals[vd.spec.id];
   const prodSum=Object.keys(vt.produced).reduce((a,k)=>a+vt.produced[k],0);
   return prodSum>0&&vd.minY>=8.5&&vd.clientContract.status==='client';
  });
  const ok=statement.ok&&simProblems.length===0&&neapDeepCareens===0&&deepWardCareens===0&&!negativeStock&&
   metrics.paktongSmeltedBanked===0&&villagesOk;
  return{
   ok:ok,
   ledgerOk:statement.ok,
   ledgerProblems:statement.problems,
   simProblems:simProblems,
   neapDeepCareens:neapDeepCareens,
   deepWardCareens:deepWardCareens,
   negativeStock:negativeStock,
   villagesOk:villagesOk,
   paktongSmeltedSpring:metrics.paktongSmeltedSpring,
   paktongSmeltedBanked:metrics.paktongSmeltedBanked,
   maxMootFleets:metrics.maxMootFleets,
   maxMootPop:metrics.maxMootPop,
   statement:statement
  };
 }

 return Object.freeze({
  goods:GOODS,
  goodKeys:GOOD_KEYS,
  caretakerHulls:CARETAKER_HULLS,
  villagesData:vData,
  villageTotals:villageTotals,
  tagIds:Object.freeze(tagIds),
  fleetWorld:fleetWorld,
  dailyLog:dailyLog,
  metrics:metrics,
  ledgerStart:ledgerStart,
  stepDay:stepDay,
  runDays:runDays,
  dayState:dayState,
  fleetsAtDay:d=>KC.fleetsAt(fleetWorld,'arcoforte',normalizeDay(d)),
  audit:audit
 });
}

root.FCOVE_SIM=Object.freeze({
 GOODS:GOODS,
 GOOD_KEYS:GOOD_KEYS,
 OPENING_STOCKS:OPENING_STOCKS,
 CARETAKER_HULLS:CARETAKER_HULLS,
 SK_TYPES:SK_TYPES,
 buildVillages:buildVillages,
 registerTags:registerTags,
 create:create
});
if(typeof module!=='undefined'&&module.exports)module.exports=root.FCOVE_SIM;
})(typeof window!=='undefined'?window:globalThis);
