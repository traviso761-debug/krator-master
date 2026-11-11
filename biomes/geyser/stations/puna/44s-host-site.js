// ================================================================= HOST — STATION 2, THE HIGH DESERT FIELD (`--station puna`; PLAN-STATIONS.md, station 2)
// Earth basis: El Tatio (4.3 km, the Atacama's altiplano). THE SITE ON SCALE MODEL 5.1 (surveyed 2026-11-09): the geyser vent at px 1574,1642
// (old canvas 1302,1312): 3,896 m, 0.98 atm, 220 mm a year, mean 0 degC (warmest month +13, coldest -13), class ET, the ground round it rolling
// 3.6-4.0 km for 20 km (Dsb a few hundred metres down). The plan's sites moved on the owner's word (2026-11-02: the Oidong rim's and Godstep's vents are
// the Hearths' hosts') and on map 5.1 (its east vent, px 1622,1166, is now the Loom-Chasm kit's Mount Caelum): this is the high desert vent left.
// Water boils at about 99 degC here (the kit's heat scale runs to 100 from the air's mean, so its boiling springs are just at the boil).
// THE PAGE: a shallow basin on the altiplano (the field on its floor, 1% to the south), gravel fans from the rims, the rims 150-400 m up within 3 km,
// a stratovolcano 9 km north-east (the far field: Puna country, 5.6 km); small geysers whose columns are brief and low (2-9 m) and steam far more than
// they spout in the frozen air; springs with orange and black crusts in their warm run-off and none of the Steampits' greens; a borate and salt crust
// on the flats; the ash-grey gravel bare but for ichu tussocks and yareta cushions where the run-off warms it.
const STATION_SITE={region:'The high desert geyser field (station 2, ideal type)',fieldName:'The high desert field',px:[1574,1642],
 sky:{px:1302,py:1312,pressure:.98,humidity:.22,clouds:.12},amb:0,seed:72,wind:[.85,.3],haze:0xc8d2e0,fog:.00009,cold:.5,wet:.12,
 climate:{cold:true,dry:true},skyGround:0x5a5650,
 field:{x:0,z:0,r:520,e:.72},
 land:(x,z)=>{const r=Math.hypot(x/1.1,z),rim=smooth(700,2600,r),n=fbm(x*.0012+4,z*.0012-2,7201,3)-.5,fan=4*(fbm(x*.006,z*.006,7202,2)-.5);
  const cone=1800*Math.exp(-Math.pow(Math.hypot(x-5200,z+7300)/2600,1.6));   /* the stratovolcano to the north-east */
  return -.012*z+fan*(1-rim)+rim*(260+220*n)+90*n+cone;},
 far:{label:'The altiplano past the map (Puna country; the stratovolcano north-east)',haze:[176,184,198],
  color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),m=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),n=clamp(fbm(x*.004,z*.004,7203,2),0,1);
   let c=m(L([132,120,104]),L([150,138,118]),n);c=m(c,L([108,92,82]),smooth(600,1300,y));return m(c,L([236,238,242]),smooth(1500,1750,y));}},
 thermal:()=>FIELD_SPEC({seed:72,r:470,e:.72,amb:0,
  geysers:{n:7,H:[2,9],period:[180,1500],dur:[15,90],kinds:['fountain','cone','fountain','cone'],names:['The Kettle of Dawn (a fountain geyser)']},spouters:5,
  springs:{n:16,r:[1.4,5.5],temp:[.55,.97],minerals:['sinter','sulfur','sinter','iron']},acid:{n:1,r:75,mud:4,fumaroles:12},fumaroles:{n:5},dead:null,runLen:420}),
 passes:[],floor:false,
 flora:{ichu:{cell:2.6,R:950,accept:(x,z)=>{const g=GEYSER.at(x,z);if(g.film>.3||g.sinter>.6||g.acid>.3||g.spring>0)return 0;return .7*smooth(5,10,g.T)*smooth(32,22,g.T);}},
  yareta:{cell:3.4,R:800,accept:(x,z)=>{const g=GEYSER.at(x,z);if(g.film>.2||g.sinter>.5||g.acid>.2||g.spring>0)return 0;return .6*smooth(3,6,g.T)*smooth(24,14,g.T);}}},
 take:{build:'geyser-puna',hour:13,   /* 11:00, the owner's view hour, is in the giant's eclipse here (09:30-11:30) */
 title:'Krator biome — the high desert geyser field (station 2)',
  hint:"Station 2, the high desert field: a geyser field on the altiplano at 3,900 m (0.98 atm, 220 mm, a mean of 0 °C; water boils at ~99 °C). Small geysers whose columns are brief and low and steam far more in the frozen air, springs with orange and black crusts in their warm run-off (too cold and dry for the Steampits' greens), borate and salt crusts on the flats, the grey gravel bare but for ichu tussocks and yareta cushions where the run-off warms it. Try #hour=6 for the dawn steam (ideal type)",
  views:()=>{const g=biggest(LAYOUT.geysers.filter(q=>q.kind!=='spouter'),'H'),s=biggest(LAYOUT.springs,'r');
   return{'The high desert field':fieldView(0,0,2.2,760,90,0),'The Kettle of Dawn':fieldView(g.x,g.z,.6,g.H*3+40,4,g.H*.5),'A spring\'s crusts':fieldView(s.x,s.z,-.8,s.r*3+14,3,0),
    'Ichu on the warm margin':fieldView(s.x,s.z,2.6,s.r*3+40,1.7,.3),'The volcano over the field':fieldView(0,0,2.4,420,12,240),'From above':[-900,1100,1300,0,0,-80]};},
  erupt:{'The Kettle of Dawn':'g0'},
  checks:(add,P)=>{const F=window._flora||{ichu:0,yareta:0},cold=P.filter(p=>p[4]==='geyserfield'&&GEYSER.at(p[0],p[2]).T<THERMAL.amb+3);
   add('the high desert\'s plants on the warm ground only (ichu, yareta)',{ok:F.ichu>200&&F.yareta>30&&!cold.length,detail:'ichu '+F.ichu+', yareta '+F.yareta+(cold.length?', '+cold.length+' on cold ground':', none on cold ground')});
   add('no tree on the altiplano',{ok:!(GEYSER.TREES||[]).length,detail:(GEYSER.TREES||[]).length+' trees'});},
  negatives:(add,P)=>{add('a tussock on the cold gravel',{ok:!P.concat([[900,0,900,'biome:fichu','geyserfield']]).some(p=>p[4]==='geyserfield'&&GEYSER.at(p[0],p[2]).T<THERMAL.amb+3),detail:'a tussock at 900, 900'});}}};
// THE GROUND (84: STATION_GROUND): ash-grey gravel, the flats' borate and salt crust (the `sand` channel), the rock, the sinter, the acid clay, the mud; the
// run-off's crusts orange where warm, black where cooler, clear where hot (no greens: too cold and dry)
const STATION_GROUND={
 paint:(x,z,y,g,c,GA,slope)=>{const n=fbm(x*.03,z*.03,7210,2),n2=fbm(x*.005,z*.005,7211,2);c.setRGB(.42+.06*n,.39+.05*n,.35+.04*n);
  GA.r=c.r;GA.g=c.g;GA.b=c.b;GA.grass=0;GA.sand=clamp(smooth(.55,.7,n2)*(1-smooth(.1,.3,slope))*(1-g.sinter)*(1-g.acid)*(1-smooth(3,8,g.T-THERMAL.amb)),0,1);},
 layers:[['st.ash','0.7','vec3(1.0)','gravel'],['rock','rock'],['st.salt','sand','vec3(1.0)','borate and salt crust'],
  ['sinter','sin_','mix(vec3(0.74,0.72,0.68),vec3(1.0,0.98,0.94),_sk)'],['clay','acid*0.9','mix(vec3(1.0),base*1.4,0.6)'],['mud','mud*0.95']],
 mats:'vec3 c=vec3(0.07,0.06,0.05);c=mix(c,vec3(0.36,0.13,0.05),smoothstep(0.1,0.24,h));c=mix(c,vec3(0.8,0.42,0.1),smoothstep(0.3,0.46,h));return pow(c,vec3(2.2));'};
