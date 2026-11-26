// ================================================================= HOST — views, reagent controls, inspector, and probe checks (PLAN.md sections 4, 6.3a, 7)
// Note on VIEW-NAME (item 30): zero apostrophes and zero colons in any preset view name.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS={
 'Graben overlook':look(-96,-112,28,4,4,-2),
 'Into the breached throat':look(-21,-17,5.2,0,0,-10.5),
 'Honeycomb collar and skins':look(-34,-59,3.2,-34,-48,0.4),
 'Split star-egg apron':look(48,38,2.6,64,48,0.2),
 'White-rime rotting vent':look(-72,18,3.4,-58,26,0.5),
 'Bismuth seam pocket':look(8,74,3.0,18,62,0.5),
 'Ringing lava blisters':look(52,-44,4.2,76,-22,0.6),
 'Wild Ranj on the warm halo':look(34,-34,5.5,48,-14,2.0),
 'From afar':look(-460,-480,145,20,10,0)
};

function throatSummary(){
 const st=THROAT.state;
 return 'Throat ['+st.state+'] ap '+(st.aperture*100|0)+'% · P '+(st.pressure*100|0)+'% · jet '+st.heightScale.toFixed(2)+'x — '+st.tell;
}

const CONTROLS=[
 {
  button:'Gag throat',id:'btn-gag',
  title:'Feed Brimstone-Iron Cake (sulphur + iron filings): fuels Choke-Coral accretion, throttling the vent silent while pressure builds',
  on(){THROAT.gag();KHOST.inspector('Dosed Brimstone-Iron Cake -> '+throatSummary());}
 },
 {
  button:'Salt seam',id:'btn-salt',
  title:'Cast Alkali-Fluorite Salt: triggers Flux-Creeper grazing frenzy, dissolving the silicate plug into white SiF4 frost and an acid-steam surge',
  on(){THROAT.salt();KHOST.inspector('Dosed Alkali-Fluorite Salt -> '+throatSummary());}
 },
 {
  button:'Heavy dross',id:'btn-dross',
  title:'Dump Galena/Barite Heavy Dross: locks zeolite pores with Pb2+/Ba2+, killing bore-healing and turning collars brittle',
  on(){THROAT.dross();KHOST.inspector('Dosed Heavy Dross -> '+throatSummary());}
 },
 {
  button:'Reset vent',id:'btn-reset',
  title:'Restore natural steady-state conduit throttle',
  on(){THROAT.reset();KHOST.inspector('Restored natural equilibrium -> '+throatSummary());}
 }
];

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){if(r.r>400)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const instLbl=(o.isInstancedMesh&&typeof BIO.instLabel==='function')?BIO.instLabel(o,hit.instanceId):null;
 const lab=instLbl||o.userData.inspectLabel||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const rawItem=isItem?(o.name||'').replace(/^biome:(?:[a-z0-9_-]+\|)?/,''):null;
 const SP=rawItem?RHEO.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const tC=TEMP3_AT(p.x,p.y,p.z),aw=AW_AT(p.x,p.y,p.z),ph=PH_AT(p.x,p.z);
 const win=RHEO_PHYS.windowAt({tempC:tC,waterActivity:aw,acidPh:ph});
 const nv=NEAREST_VENT(p.x,p.z);
 const rv=RHEO_PHYS.ranjViability({throatTempC:nv.vent.T,throatDistM:nv.d,zeoliteMulch:.18,rainMm:SITE.rain});
 const onBench=Math.hypot((p.x-BENCH.x)/BENCH.rx,(p.z-BENCH.z)/BENCH.rz)<1.15;
 const buoy=onBench?RHEO_PHYS.buoyancy(BENCH.ageDays,BENCH.reefCover,{fluxSalt:THROAT.doses.fluxSalt,heavyDross:THROAT.doses.heavyDross,hours:6}):null;

 const lines=[head];
 if(SP&&SP.vernacular){
  const v=SP.vernacular;
  lines.push('Geomancers: '+v.geomancer+' · Zeijani: '+v.zeijani+' · Andaru: '+v.andaru);
  lines.push(SP.how);
 }
 lines.push('Rock/gas '+tC.toFixed(0)+' degC · aw '+aw.toFixed(2)+' · pH '+ph.toFixed(1)+' -> rheolith window: '+win.state+(win.viable?' (k='+win.k.toFixed(2)+')':''));
 if(buoy){
  lines.push('Lava sill roof: '+buoy.state+' · load '+buoy.loadKg+' kg · shod-staff pitch '+buoy.ringPitchHz+' Hz (Foam-Reef cover '+(buoy.effCover*100|0)+'%)');
 }
 lines.push('Ranj halo ('+nv.d.toFixed(0)+' m from '+nv.vent.name+'): '+(rv.fruiting?'FRUITING':'STERILE')+' (vapour '+(rv.vapour01*100|0)+'% — '+rv.why+')');
 lines.push(throatSummary());
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:6500000,calls:120},
 cls:{life:2500000,kin:2500000,host:2000000},
 type:{'biome':'life','rheolith/throat':'life','rheolith/kin':'kin','host':'host'}
};

const rheoMats=()=>{
 const out=[],seen=new Set();
 const pushM=m=>{
  if(!m)return;
  (Array.isArray(m)?m:[m]).forEach(x=>{
   if(x&&!seen.has(x)&&(x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial)){
    seen.add(x);out.push(x);
   }
  });
 };
 Object.keys(RHEO.M).forEach(k=>pushM(RHEO.M[k]));
 pushM(MAT_GROUND);
 scene.traverse(o=>{
  if(!o.isMesh||o.userData.farField||o.userData.sky)return;
  const ud=o.userData||{};
  if(ud.kit==='rheolith'||/^biome:rh_/.test(o.name||'')||ud.host)pushM(o.material);
 });
 return out;
};

const HCHK={
 placed(st){
  const need=['chokecoral','wirevein','foamreef','fluxcreeper','staregg','throatcollar','bismuthnest','scarplug','bellblister','combplate','throatskin','etchhalo'];
  const zero=need.filter(k=>!(st&&st[k]>0));
  return{ok:!zero.length,detail:zero.length?'missing: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')};
 },
 liveWindow(P){
  const live=P.filter(r=>r[4]===1);
  const bad=live.filter(r=>!RHEO_PHYS.windowAt({tempC:r[5],waterActivity:r[6],acidPh:r[7]}).viable);
  return{
   ok:live.length>=20&&!bad.length,
   detail:bad.length?bad.length+' of '+live.length+' live guilds outside 180-550 degC dry-acid window (first '+bad[0][0]+' at '+bad[0][5]+' degC, aw='+bad[0][6]+')':live.length+' live guild colonies, every one inside 180-550 degC & aw < 0.15'
  };
 },
 grounded(P,jaws){
  const bad=[];
  const chk=(tag,x,y,z)=>{
   const gy=DRAWN_H(x,z),n=DRAWN_N(x,z,.45),dPerp=(y-gy)*n[1];
   if(dPerp>.04||dPerp<-.55)bad.push(tag+' dPerp='+dPerp.toFixed(2)+'m at ('+x.toFixed(1)+','+z.toFixed(1)+')');
  };
  (P||[]).forEach(r=>chk(r[0],r[1],r[2],r[3]));
  (jaws||[]).forEach((J,i)=>{chk('jaw#'+i,J.jx,J.jy,J.jz);chk('creep#'+i,J.cx,J.cy,J.cz);chk('frost#'+i,J.rx,J.ry,J.rz);});
  const tot=(P?P.length:0)+(jaws?jaws.length*3:0);
  return{ok:tot>0&&!bad.length,detail:bad.length?bad.length+' floating/buried ('+bad.slice(0,3).join('; ')+')':tot+' placed & throat-valve anchors flush with drawn mesh'};
 },
 ranjHalo(K){
  const list=K||[];
  const wild=list.filter(t=>t.key==='ranj-wild'),ster=list.filter(t=>t.key==='ranj-sterile');
  const badW=wild.filter(t=>!RHEO_PHYS.ranjViability({throatTempC:t.throatT,throatDistM:t.distM,zeoliteMulch:.18,rainMm:SITE.rain}).fruiting);
  const badS=ster.filter(t=>RHEO_PHYS.ranjViability({throatTempC:t.throatT,throatDistM:t.distM,zeoliteMulch:0,rainMm:SITE.rain}).fruiting);
  return{
   ok:wild.length>0&&ster.length>0&&!badW.length&&!badS.length,
   detail:badW.length||badS.length?'Ranj halo mismatch (badWild='+badW.length+', badSterile='+badS.length+')':wild.length+' fruiting Ranj in vapour halo, '+ster.length+' sterile Ranj on cold rim'
  };
 },
 bismuthPockets(B){
  const pk=(B&&B.pockets)||[];
  const drowned=pk.filter(p=>waterH(p.x,p.z)>p.y-.05);
  return{ok:pk.length>=8&&!drowned.length,detail:drowned.length?drowned.length+' pockets underwater':pk.length+' KGEODE bismuth hopper pockets round fumaroles'};
 },
 throatValve(rec){
  const g=RHEO_PHYS.choke(rec,9,{gagCake:1.35});
  const s=RHEO_PHYS.choke(rec,0.22,{gagCake:0.5,fluxSalt:0.92});
  const d=RHEO_PHYS.choke(rec,2.5,{heavyDross:1.2});
  const ok=(g.state==='gagged'||g.state==='throttled')&&g.aperture<rec.aperture&&s.blast&&s.state==='salted-surge'&&d.state==='poisoned';
  return{ok,detail:'gag->'+g.state+' (ap '+g.aperture+'), salt->'+s.state+' (jet '+s.heightScale+'x), dross->'+d.state};
 },
 noGlow(list){
  const bad=[];
  list.forEach(m=>{if(m&&m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b>.003||m.emissiveMap))bad.push(m.name||m.type);});
  return{ok:list.length>0&&!bad.length,detail:bad.length?'glowing: '+bad.slice(0,4).join(', '):list.length+' rheolith/host lit materials, zero emissive'};
 },
 samplersBudget(u){
  const n=u&&u.final!=null?u.final:99;
  return{ok:n<=14,detail:'MAT_GROUND uses '+n+' of '+(u?u.max:16)+' texture units (cap 14)'};
 },
 camerasOut(C){
  const bad=C.filter(c=>c.y<DRAWN_H(c.x,c.z)+1.2);
  return{ok:C.length>0&&!bad.length,detail:bad.length?'under ground: '+bad.map(c=>c.view).join(', '):C.length+' preset cameras clear of ground'};
 },
 skyLit(info){
  const ok=!!info&&isFinite(info.exp)&&info.exp>0&&isFinite(info.sunAlt)&&isFinite(info.sunI);
  return{ok,detail:ok?'exposure '+info.exp.toFixed(3)+', sunAlt '+info.sunAlt.toFixed(1)+' deg, sunI '+info.sunI.toFixed(2):'non-finite sky/exposure: '+JSON.stringify(info)};
 }
};

function hostChecks(){
 const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('four guilds and eight byproducts placed',HCHK.placed(window._station));
 add('live guilds strictly inside 180-550 degC dry-acid window',HCHK.liveWindow(RHEO.PLACED));
 add('all placed rheoliths and throat anchors seated on drawn ground',HCHK.grounded(RHEO.PLACED,THROAT.jaws));
 add('wild Ranj fruits in rheolith vapour halo and fails on cold rim',HCHK.ranjHalo(window._kinTrees));
 add('abiotic bismuth hopper pockets round fumaroles',HCHK.bismuthPockets(BISMUTH));
 add('throat reagent valve transitions (gag, salt, dross)',HCHK.throatValve(THROAT.baseRec));
 add('nothing in rheolith or host rock bioluminesces',HCHK.noGlow(rheoMats()));
 add('ground shader stays within WebGL sampler budget',HCHK.samplersBudget(window._units));
 add('preset cameras clear of ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('sky model and exposure finite and lit',HCHK.skyLit({exp:renderer.toneMappingExposure,sunAlt:SKY.state&&SKY.state.sunAlt,sunI:sun.intensity}));
 return R;
}

function hostNegatives(){
 const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('missing staregg byproduct',HCHK.placed(Object.assign({},window._station,{staregg:0})));
 add('live chokecoral placed on +26 degC wet surface',HCHK.liveWindow([['chokecoral',40,1,40,1,26,0.65,5.4]]));
 add('floating collar 1.2 m above drawn ground',HCHK.grounded([['throatcollar',25,DRAWN_H(25,0)+1.2,0,0,120,0.2,3.5]],[]));
 add('fruiting Ranj placed 300 m from any active throat',HCHK.ranjHalo([{key:'ranj-wild',throatT:340,distM:300}]));
 add('too few bismuth pockets',HCHK.bismuthPockets({pockets:[]}));
 add('cold dead vent cannot gag or surge',HCHK.throatValve({aperture:0.5,pressure:0.1,heatMW:0,tempC:40}));
 add('an emissive glowing material',HCHK.noGlow([new THREE.MeshStandardMaterial({emissive:0x335522})]));
 add('ground over the 16-sampler limit',HCHK.samplersBudget({final:17,max:16}));
 add('preset camera buried underground',HCHK.camerasOut([{view:'buried',x:0,y:DRAWN_H(0,0)-4,z:0}]));
 add('NaN sky site / exposure',HCHK.skyLit({exp:NaN,sunAlt:NaN,sunI:0}));
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

const HINT='Station 1 of the Rheoliths (SE Rift Graben of the Throne, +1,380 m, 1.18 atm, +26 degC): a collapsed skylight '+
 'exposing a 365-545 degC dry-acid volcanic conduit inhabited by Four-Day panspermia mineral-siloxane guilds (Choke-Coral, '+
 'Wire-Vein, Foam-Reef, Flux-Creeper), surrounded by their eight dead or dormant surface byproducts and wild fruiting Ranj in '+
 'the warm siloxane-vapour halo. Use [Gag throat], [Salt seam], [Heavy dross], and [Reset vent] to manipulate the live conduit; '+
 'click any formation to inspect its chemistry and Geomancer / Zeijani / Andaru names.';

KHOST.take({
 build:'rheolith'+(SKEY==='throat'?'':'-'+SKEY),
 title:'Krator biome — the Rheoliths: '+SITE.name,
 hint:HINT,
 scene,camera,renderer,ground:DRAWN_H,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 controls:CONTROLS,
 clock:{hour:ATMOS.SKY.viewHour},
 draw:SKY.draw,
 inspect:describe,
 stats:()=>'inst '+window._instances+'\n'+throatSummary(),
 layers:{
  'rheoliths & kin':{match:o=>!!(o.userData&&o.userData.biome)},
  'throat & bismuth':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-rheolith',version:1,site:SITE,throat:THROAT.state,placed:RHEO.PLACED.length})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,
 types:()=>BIO.stats,
 api:{
  hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  placed:()=>RHEO.PLACED,
  throat:()=>THROAT.state,
  exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
  exportBox:[-140,-140,140,140],
  at:(x,z)=>{
   const y=DRAWN_H(x,z),o={h:y,water:waterH(x,z),heat:HEAT_AT(x,z),temp3:TEMP3_AT(x,y,z),aw:AW_AT(x,y,z),pH:PH_AT(x,z)};
   FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));
   return o;
  }
 }
});
