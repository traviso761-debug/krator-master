// ================================================================= HOST — STATION 4, THE CORONA FIELD (`--station corona`; PLAN-STATIONS.md, station 4)
// Korona is a corona (a mantle plume's dome, its ring fractures and trenches) and the plume is still active (the owner, 2026-10-26: "better watch your
// step in Korona"). Earth basis: Yellowstone's ring-fault basins over its hotspot, Iceland's Haukadalur. THE SITE ON SCALE MODEL 5.1 (surveyed 2026-11-09;
// the model puts no vent here, so the field is placed from Korona's own data, as the plan says): a trench floor of the ring country at px 1123,517 (old
// canvas 851,187: biomes/korona/NOTES.md's trench lake at -1,890 m, px 846,187), -1,892 m, 2.03 atm, mean +36 degC (warmest month +41, coldest +32),
// 2,500-3,400 mm, the trench's salt lake 10 km west at -2,377 m (2.15 atm); the ring walls 20-40 km off, out of the page. Water boils at ~121 degC here.
// THE PAGE: the trench floor in hypertropic jungle (XA: the hyperjungle, read in place as on the showcase), a field strung along a ring fault (a low
// scarp, the inner side up): geysers, hot springs and fumaroles in the dense, wet, hot air, superheated and violent; each spring's chemistry its own
// (sulphur, iron, copper, silica: the run-off's mats change pool to pool, Korona's quilt in the water); the hazard is the point: thin crusts over
// boiling water as taboo ground, gas in the acid hollows, the geysers' spray.
const RING=[[-760,-300],[-420,-150],[-80,-90],[260,-120],[600,-240],[860,-420]];   /* the ring fault across the page, the dome's centre to the north */
const ringD=(x,z)=>{let d=1e9,side=1;for(let i=0;i<RING.length-1;i++){const a=RING[i],b=RING[i+1],vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=clamp(t,0,1);
  const px=a[0]+vx*t,pz=a[1]+vz*t,q=Math.hypot(x-px,z-pz);if(q<d){d=q;side=((x-a[0])*vz-(z-a[1])*vx)<0?1:-1;}}return{d,side};};   /* side 1: the inner side (north) */
const STATION_SITE={region:'The corona field in a Korona trench (station 4, ideal type)',fieldName:'The ring-fault field',px:[1123,517],
 sky:{px:851,py:187,pressure:2.03,humidity:.92,clouds:.55},amb:36,seed:74,wind:[.5,.6],haze:0xb8c4b8,fog:.00042,cold:0,wet:.85,
 climate:{wet:true},skyGround:0x22301e,jungle:true,
 field:{x:0,z:-180,r:820,e:.4},
 floorK:(x,z)=>smooth(330,170,ringD(x,z).d),
 land:(x,z)=>{const q=ringD(x,z),step=24*smooth(-30,60,q.d*q.side),n=fbm(x*.0015+5,z*.0015-3,7401,3)-.5,n2=fbm(x*.007,z*.007,7402,2)-.5;
  return step+18*n*smooth(250,700,q.d)+2.5*n2-0.0015*x;},
 far:{label:'The trench floor (hypertropic jungle) toward the ring walls',haze:[150,166,156],
  color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),m=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),n=clamp(fbm(x*.003,z*.003,7403,2),0,1);return m(L([30,52,30]),L([46,70,38]),n);}},
 thermal:()=>FIELD_SPEC({seed:74,r:260,line:RING,amb:36,
  geysers:{n:8,H:[25,75],period:[1800,14400],dur:[120,900],kinds:['cone','fountain','cone','cone'],names:['The Plume\'s Throat (a cone geyser)','The Trench Fountain']},spouters:4,
  springs:{n:18,r:[2,9],temp:[.5,1],big:24,minerals:['sulfur','iron','copper','sinter','iron','sulfur'],tints:[[1,1,1],[1.08,.95,.85],[.9,1.05,1],[1,1,.9]]},
  acid:{n:2,r:85,mud:7,fumaroles:14},fumaroles:{n:8},dead:{r:130,n:2,f:1.05,name:'Drowned jungle on the fault (silica)'},runLen:600}),
 take:{build:'geyser-corona',title:'Krator biome — the corona field in a Korona trench (station 4)',
  types:{'field/flora':'pass','geyser/trees':'pass','geyser/floor':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/fauna':'pass'},
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  hint:"Station 4, the corona field: a geyser field strung along a ring fault on a Korona trench floor (-1,890 m, 2.03 atm, +36 °C, 2,500-3,400 mm; water boils at ~121 °C), in the hypertropic jungle. Superheated, violent geysers, hot springs each of its own chemistry (sulphur, iron, copper, silica: the run-off's mats change pool to pool), fumaroles and mud pots, the fault's low scarp. The hazard is the point: the thin crusts over boiling water are taboo ground, gas lies in the acid hollows (the hazards layer shows them). Watch your step (ideal type)",
  views:()=>{const g=biggest(LAYOUT.geysers.filter(q=>q.kind!=='spouter'),'H'),s=biggest(LAYOUT.springs,'r');
   return{'The field along the fault':fieldView(-80,-90,1.75,560,170,0),'The Plume\'s Throat':fieldView(g.x,g.z,1.2,g.H*2.6+60,6,g.H*.5),'The quilt from above':[s.x+120,s.level+140,s.z+160,s.x,s.level,s.z],
    'The fault scarp':fieldView(260,-120,.4,160,3,4),'The jungle edge':fieldView(0,-180,-1.2,520,8,10),'From above':[-900,1100,1300,0,0,-160]};},
  erupt:{'The Plume\'s Throat':'g0'},
  checks:(add,P)=>{const far=LAYOUT.geysers.concat(LAYOUT.springs).filter(o=>ringD(o.x,o.z).d>300),M=new Set(LAYOUT.springs.map(s=>s.mineral||'sinter')),Tb=window._corona||{taboo:0,gas:0};
   add('the field follows the ring fault (every geyser and spring within 300 m of it)',{ok:!far.length,detail:far.length?far.length+' off the fault':LAYOUT.geysers.length+' geysers and '+LAYOUT.springs.length+' springs on it'});
   add('a quilt of chemistries (each spring its own: three minerals or more)',{ok:M.size>=3,detail:[...M].join(', ')});
   add('taboo ground over the thin crusts, gas in the hollows (KHAZ)',{ok:Tb.taboo>=4&&Tb.gas>=2,detail:'taboo '+Tb.taboo+', gas '+Tb.gas});},
  negatives:(add,P)=>{add('a spring far off the fault',{ok:ringD(0,900).d<=300,detail:'a spring at 0, 900'});add('one chemistry for every spring',{ok:new Set(['sinter']).size>=3,detail:'sinter only'});}}};
// THE GROUND (84): the showcase's ten layers (the jungle's litter, the meadow, the sinter...); the run-off's mats by the chemistry would be per pool:
// the springs' own discs carry it (their mineral ramps), the run-off keeps the kit's ramp
const STATION_GROUND={};
// THE HAZARDS (KHAZ): the four hottest springs' crusts and each geyser's mound as taboo ground (a keep-out area: tags.taboo with a hot-ground hazard),
// the acid fields' hollows holding gas (a gas hazard in a dome). Records only, registered before the bake
function STATION_BUILD(){const out={taboo:0,gas:0},G=typeof KHAZ!=='undefined'&&KHAZ.GROUND;
 LAYOUT.springs.slice().sort((a,b)=>b.temp-a.temp).slice(0,4).concat(LAYOUT.geysers.filter(g=>g.kind!=='spouter').map(g=>({x:g.x,z:g.z,r:g.mound.r*.8,level:terrainH(g.x,g.z),name:g.name}))).forEach(s=>{
  const r=s.r*1.6+6;REGISTER({name:'Taboo ground: the thin crust round '+s.name,x:s.x,z:s.z,y:s.level-2,r,h:5,tags:{taboo:{of:null,why:'a thin crust over boiling water'},hazard:G?G.hotGround(null,r,{danger:.6}):{kind:'heat',danger:.6}}});out.taboo++;});
 LAYOUT.acid.forEach(a=>{const y=terrainH(a.x,a.z);REGISTER({name:'Gas in the hollow (the acid field)',x:a.x,z:a.z,y:y-2,r:a.r*.6,h:8,tags:{hazard:G?G.gasVent(a.r*.6,{danger:.8}):{kind:'gas',danger:.8}}});out.gas++;});
 window._corona=out;return out;}
