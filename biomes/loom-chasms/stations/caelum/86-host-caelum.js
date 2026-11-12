// ================================================================= HOST — STATION 4: THE PARENT COLONY AND THE FUMAROLES (PLAN.md section 4, "The parent colony")
// THE PARENT COLONY: the oldest cable spinners, across the shield's two rift fissures where the vents' heat and steam rise (proposed in the plan:
// the bladders' gas is made by partners that need the vents' warmth, so the colony is where the pioneer shoots are bred). The canopy is
// src/85-host-canopy.js's (slotCanopy), given each rift: the grown cables in three tiers 20-50 m over a floor 70 m down, at the top of the
// spinner's radius (the oldest: 15-20 cm), and nearly half the stations pioneer shoots, rising on the warm air. No cable-stryder at 4,400 m.
// THE FUMAROLES (44w: STATION.VENTS): each a core/tags record, its steam (ATMOS.smoke, the `steam` kind) and its hazards: the gas over it
// (KHAZ.GROUND.gasVent: fumes always, puffs on a cycle) and its hot ground (hotGround); the sulphur crust round it is the ground's geo field.
// The summit's own dangers are the air: 0.92 atm and a coldest month of -15 degC (88: KHAZ.provide).
const CAELUM=(function(){const S=STATION;
 const COMMON={tiers:3,low:[5,62],minDepth:48,shootShare:.45,stryders:0,grownR:[.15,.2],expose:false,
  lipName:'A rift\'s lip (a fall of 70 m)',lipSign:'the plateau ends at a stepped edge, the colony\'s tubers on it'};
 const NE=slotCanopy(Object.assign({slot:S.RIFT_NE,cut:S.RC.ne,W:99421,prefix:'colony-ne',band:[20,50],label:'the parent colony (north-east rift)'},COMMON));
 const SW=slotCanopy(Object.assign({slot:S.RIFT_SW,cut:S.RC.sw,W:99422,prefix:'colony-sw',band:[20,48],label:'the parent colony (south-west rift)'},COMMON));
 const out={vents:0,steam:0};
 function build(){
  for(const v of S.VENTS){v.y=drawnH(v.x,v.z);
   REGISTER({name:'A fumarole (the Caelum fumaroles: steam and sulphur)',key:v.id,x:v.x,z:v.z,y:v.y-2,r:v.r,h:8,tags:{vent:true,pit:v.pit,kit:'loom-chasms'}});out.vents++;}
  const a=NE.build(),b=SW.build();
  /* the steam: a few emitters over each vent, its strength the vent's */
  if(typeof ATMOS!=='undefined'&&ATMOS.smoke){const E=[];for(const v of S.VENTS){const n=1+Math.round(v.k*3);
   for(let i=0;i<n;i++){const a2=i/n*Math.PI*2,r=v.r*.35*(i?1:0);E.push([v.x+Math.cos(a2)*r,v.y+.3,v.z+Math.sin(a2)*r,'steam']);}}
   try{ATMOS.smoke(E);out.steam=E.length;}catch(e){reportErr('steam: '+e.message);}}
  out.colony={ne:a,sw:b};window._caelum=out;return out;}
 function hazards(){const H=NE.hazards().concat(SW.hazards());
  for(const v of S.VENTS){const y=drawnH(v.x,v.z);
   H.push(Object.assign(KHAZ.GROUND.gasVent(v.r*1.6,{}),{name:'A fumarole\'s gas (sulphur dioxide and steam)',x:v.x,z:v.z,y:y-1,r:v.r*1.6,h:v.r*1.6,tell:{fx:'steam',sound:'hiss',sign:'the yellow crust and the smell'}}));
   const ring=[];for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ring.push([v.x+Math.cos(a)*v.r,v.z+Math.sin(a)*v.r]);}
   H.push(Object.assign(KHAZ.GROUND.hotGround(ring,v.r*.4,{}),{name:'A fumarole\'s hot ground (a crust over steam)',x:v.x,z:v.z,y:y-1,r:v.r*1.4,h:3}));}
  const C=S.CAL;for(let i=0;i<8;i++){const a=i/8*Math.PI*2,e=1.06,x=C.c[0]+Math.cos(a)*C.rx*e*Math.cos(C.ry)-Math.sin(a)*C.rz*e*Math.sin(C.ry),z=C.c[1]+Math.cos(a)*C.rx*e*Math.sin(C.ry)+Math.sin(a)*C.rz*e*Math.cos(C.ry);
   H.push({name:'The caldera\'s rim (a fall of 110 m)',kind:'fall',x,z,r:90,h:25,danger:.95,tell:{sign:'the summit ends at the pit\'s stepped wall'}});}
  return H;}
 // ---------------------------------------------------------------- the checks (the colony's are slotCanopy's, one set a rift), each with a negative
 const CK={
  /* each vent on its pit's floor (the cut's floor part, on the drawn ground), its crust round it (the geo field), its gas a hazard over it */
  vents(V,Hz){const bad=V.filter(v=>{const p=v.pit==='caldera'?KRELIEF.at(S.CUT,v.x,v.z,S.g0(v.x,v.z)):KRELIEF.at(S.RC[v.pit],v.x,v.z,S.g0(v.x,v.z));return !p||p.part!=='floor';}),
    bare=V.filter(v=>S.geo(v.x,v.z)<.5),nogas=V.filter(v=>!Hz.some(h=>h.kind==='gas'&&Math.hypot(h.x-v.x,h.z-v.z)<2));
   return{ok:V.length>=6&&!bad.length&&!bare.length&&!nogas.length,detail:bad.length?bad.length+' vents off their pit\'s floor (first '+bad[0].id+')':bare.length?bare.length+' vents with no crust round them':nogas.length?nogas.length+' vents with no gas hazard':
    V.length+' fumaroles ('+V.filter(v=>v.pit==='caldera').length+' on the caldera\'s floor, '+V.filter(v=>v.pit!=='caldera').length+' in the rifts\' throats), each on its floor, crusted, its gas a hazard'};},
  colony(A,B){const g=A.CABLES.concat(B.CABLES).filter(c=>c.stage==='grown'),s=A.CABLES.concat(B.CABLES).length-g.length,thin=g.filter(c=>c.r<.15-1e-9);
   return{ok:g.length>=10&&s>=6&&!thin.length,detail:thin.length?thin.length+' grown cables under 15 cm (the colony\'s are the oldest)':g.length+' grown cables (15-20 cm: the oldest) and '+s+' pioneer shoots across the two rifts'};}};
 function checks(add){add('the fumaroles stand on the pits\' floors, crusted, their gas registered',CK.vents(S.VENTS,hazards()));add('the parent colony: the oldest cables and the shoots bred there',CK.colony(NE,SW));
  NE.checks(add);SW.checks(add);}
 function negatives(add){const v=S.VENTS[0];if(v){add('a vent out on the plateau',CK.vents([Object.assign({},v,{x:v.x+2000})],hazards()));add('a vent with no gas hazard',CK.vents([v],[]));}
  add('a colony of young cables',CK.colony({CABLES:NE.CABLES.map(c=>Object.assign({},c,{r:.08}))},{CABLES:SW.CABLES}));
  NE.negatives(add);}
 // ---------------------------------------------------------------- the views (each camera over the drawn ground: 99's check)
 function views(H){const {look}=H,C=S.CAL,V={},v0=S.VENTS[0],m=NE.at(NE.L*.45),g=NE.CABLES.filter(c=>c.stage==='grown'),sh=NE.CABLES.find(c=>c.stage==='shoot');
  {const a=Math.PI*1.15,x=C.c[0]+Math.cos(a)*C.rx*1.12,z=C.c[1]+Math.sin(a)*C.rz*1.12;V['The caldera from its rim']=look(x,z,1.8,C.c[0],C.c[1],-60);}
  if(v0)V['A fumarole']=look(v0.x+v0.r*3.2,v0.z+v0.r*1.5,1.7,v0.x,v0.z,3);
  V['The parent colony across the north-east rift']=[m.x+m.nx*(NE.lipOff+10),solidH(m.x+m.nx*(NE.lipOff+10),m.z+m.nz*(NE.lipOff+10))+1.7,m.z+m.nz*(NE.lipOff+10),m.x-m.nx*(NE.lipOff)+m.ux*90,NE.rimY(m)-25,m.z-m.nz*(NE.lipOff)+m.uz*90];
  if(sh&&sh.S){const top=KSPAN.low(sh.S).p,c=NE.at(sh.s);V['Pioneer shoots over the rift']=look(c.x+c.nx*(NE.lipOff+40)-c.ux*80,c.z+c.nz*(NE.lipOff+40)-c.uz*80,2,top[0],top[2],top[1]-solidH(top[0],top[2]));}
  V['The chasm net below (east)']=look(2200,-300,2.5,60000,-4000,-2400);
  V['The Cradle\'s fans (west)']=look(-2200,200,2.5,-60000,-26000,-2000);
  V['From afar']=look(2600,2600,500,0,0,-40);
  return V;}
 return{build,hazards,checks,negatives,views,NE,SW};})();
