// ================================================================= OPAL VALLEY — the five stations' sites, the opal strata, the diggings (PLAN.md sections 1.0, 4.3, 6)  [G data]
// Scale model 5.1, checked 2026-11-11 (tools/scale-model/model/data through smodel/page.py; PLAN.md section 1.0 has every number and what it corrected).
// Each page is a 5.2 km ideal type (R 2600 m) of its zone: it takes the model's numbers (heights, climates, lake levels), not its pixels. Page metres:
// x east, z south, origin the page's centre. The valley runs down to the WEST on every page (the model's WNW, turned onto x). Pressure is
// 1.6 atm x e^(-h/8 km). Plain data and pure functions: no THREE, no DOM, no Math.random; the draws are KRAND.hash of (station, kind, index).
//
//   OPAL_SITES[key]   a station's record. Its land is a CHAIN down the axis (east to west), each link a tread: a 'stream' (a narrow channel on a
//                     bench) or a 'lake' (a lens hw m wide at its middle, depth m deep), at level y, from x0 down to x1; between two links a RISER
//                     (the ground steps from one level to the next: a sinter dam, a moraine bar, a tuff sill) with a fall on it. axis: the axis's
//                     z at x = 0 and its wander; walls: the valley's walls north and south (m above the floor and where they start); west: the
//                     drop past the last link (the next riser, off the page). The glacier station is on KGLACIER instead (its `glacier`).
//   OPAL_STRATA       the risers' and walls' bedded rock, as KSTRATA recipes (handed to KSTRATA.add by the ground, 84): rhyolitic ignimbrite and
//                     tuff with perlite, dark titanium-basalt sills, ironstone partings, pale potch seams and the thin precious-opal seams; the lower
//                     bed's fire-opal tuffs (cherry-orange)
//   OPAL_DIGGINGS(S)  a station's diggings as records (PLAN.md section 4.3): placer pits on the gravel bars, riffle sluices on the falls, adits on
//                     the walls' basalt contact, the divers' landings; each with its spoil fan and a grade in kits/resources' shape ({kind:'opal',
//                     grade:'low'|'medium'|'high'}). Positions only: the host puts them on its ground and keeps them off the water
var OPAL_SITES={
 // STATION 1 (px 1124,1676; old 852,1346): the Prism Glacier's snout at 4,150 m, ET (EF from ~4,760 m on the cirque), -2 degC (+6/-10), 565 mm, 0.95 atm.
 // The tongue comes down from the east (up = +x) and ends on the page in its snout, ice caves at the portal, a terminal moraine and its pool; the outwash
 // runs west over a rock bar (the first milky cascade); the walls are banded rhyolite with the cirque's ice on their tops
 glacier:{key:'glacier',name:'The Prism Glacier',zone:1,px:[1124,1676],sky:{px:852,py:1346},base:4150,atm:.95,koppen:'ET',rain:565,
  temp:{mean:-2,warm:6,cold:-10},soil:-2,snow:[4100,4600],ice:4760,
  glacier:{up:[1,0],snout:-260,prof:{at:0,h:4150,grads:[[-2900,.034],[-300,.05],[200,.09],[1300,.22],[1800,.1]]},
   W:[320,560],T:[40,120],caves:[{u:-200,aw:.9,R:13},{u:-150,aw:-.85,R:10}],crevasses:[[300,1250],[1850,2700]],icefall:[1300,1800]},
  outwash:{bar:-1700,drop:22,w:9},
  walls:{N:2100,n0:950,n1:4200,S:2600,s0:900,s1:4400},
  hazards:[{kind:'cold',why:'katabatic gusts and whiteout off the glacier (PLAN.md section 5, item 3)'},{kind:'drown',why:'subglacial outburst surges down the outwash'}],
  dig:{bars:[[-1200,40,120],[-2100,-20,110]],placer:6,sluice:[],adit:[],dive:[]}},
 // STATION 2 (px 1082,1672; old 810,1342): Terrace I, the milk-opal tarns at 2,620 / 2,540 / 2,470 m (the model's one lake: 2,525 m), Dfc, +8 degC
 // (+15/0), 800 mm, 1.16 atm. Moraine bars between the tarns; the upper riser's meltwater falls into the first from the east
 upperbed:{key:'upperbed',name:'Terrace Bed I: the Milk-Opal Tarns',zone:2,px:[1082,1672],sky:{px:810,py:1342},base:2540,atm:1.16,koppen:'Dfc',rain:800,
  temp:{mean:8,warm:15,cold:0},soil:8,snow:[3300,3800],
  axis:{z0:430,amp:[70,25],f:[.0011,.0037],ph:[.6,1.9]},
  chain:[{kind:'stream',x0:2900,x1:2380,y:2700,w:14},{kind:'lake',x0:2050,x1:950,y:2620,hw:250,depth:16,name:'The upper tarn (2,620 m)'},
   {kind:'lake',x0:520,x1:-800,y:2540,hw:380,depth:24,name:'The middle tarn (2,540 m)'},{kind:'lake',x0:-1200,x1:-2250,y:2470,hw:280,depth:18,name:'The lower tarn (2,470 m)'},
   {kind:'stream',x0:-2330,x1:-2600,y:2468,w:12}],
  dam:'moraine',west:{drop:170},walls:{N:2400,n0:1100,n1:5200,S:1500,s0:1000,s1:4600},water:{shallow:0xb8e2dc,deep:0x3a9ab0,milk:.85},
  hazards:[{kind:'cold',why:'katabatic nights off the eastern ice'},{kind:'fall',why:'the moraine bars\' fronts and the falls between the tarns'}],
  dig:{bars:[[1700,200,140],[-200,-60,160],[-1000,240,120],[-2400,300,110]],placer:16,sluice:[{at:'riser',i:0},{at:'riser',i:1}],adit:[],dive:[]}},
 // STATION 3, THE DEFAULT PAGE (px 1038,1662; old 766,1332): Terrace II, the harlequin sinter lakes at 1,390 / 1,340 / 1,290 / 1,245 m (the model's
 // one lake: 1,315 m), Cfb, +14 degC (+21/+7), 940 mm, 1.35 atm. Opaline sinter dams between the lakes, the warm silica seeps under their thin crust
 // on the north shore, the adits on the north wall's basalt contact (Rift Black Opal), the Sultanate's assay pavilion on the south shore
 middlebed:{key:'middlebed',name:'Terrace Bed II: Harlequin Sinter and the Opal Mines',zone:3,px:[1038,1662],sky:{px:766,py:1332},base:1340,atm:1.35,koppen:'Cfb',rain:940,
  temp:{mean:14,warm:21,cold:7},soil:14,snow:[3600,4200],
  axis:{z0:420,amp:[60,22],f:[.0012,.0041],ph:[.3,2.4]},
  chain:[{kind:'stream',x0:2900,x1:2420,y:1478,w:16},{kind:'lake',x0:2120,x1:1180,y:1390,hw:230,depth:12,name:'The first sinter lake (1,390 m)'},
   {kind:'lake',x0:820,x1:-420,y:1340,hw:380,depth:18,name:'The second sinter lake (1,340 m)'},{kind:'lake',x0:-760,x1:-1560,y:1290,hw:270,depth:12,name:'The third sinter lake (1,290 m)'},
   {kind:'lake',x0:-1860,x1:-2480,y:1245,hw:210,depth:10,name:'The fourth sinter lake (1,245 m)'},{kind:'stream',x0:-2530,x1:-2640,y:1243.5,w:14}],
  dam:'sinter',west:{drop:160},walls:{N:2600,n0:1000,n1:5400,S:1900,s0:1050,s1:5000},water:{shallow:0x9ae0d4,deep:0x1a7a96,milk:.45},
  vents:[{x:180,z:-360,T:82,reach:110},{x:-330,z:-300,T:74,reach:85},{x:760,z:-160,T:68,reach:70},{x:-1100,z:120,T:65,reach:60}],
  sites:[{id:'assay',name:'The Sultanate\'s assay pavilion (Strongbow\'s factors: the Sultan\'s Fifth)',x:-80,z:930,r:34,kind:'civic',culture:'xanadu'}],
  hazards:[{kind:'heat',why:'thin opaline sinter over scalding (65-82 degC) alkaline mud: the vents\' crust'},{kind:'sink',why:'the crust breaks'},
   {kind:'gas',why:'silica dust ("prism-lung") in the dry adits: core/hazard has no dust kind; gas is the airborne one'},{kind:'fall',why:'the sinter dams\' fronts'}],
  dig:{bars:[[1500,150,120],[300,-30,140],[-1100,260,110],[-2150,230,90]],placer:12,sluice:[{at:'riser',i:0},{at:'riser',i:2}],
   adit:[{x:950,z:-1180},{x:300,z:-1240},{x:-520,z:-1210},{x:-1300,z:-1150}],dive:[{lake:1,side:1,t:.35},{lake:2,side:1,t:.5}]}},
 // STATION 4 (px 998,1646; old 726,1316): Terrace III, the fire-opal canyon pools at 340 / 275 / 210 m (the model's one lake: 255 m), Cfa, +21 degC
 // (+27/+14), 1,080 mm, 1.55 atm. A canyon bench: the walls close in, warm and misty, cut in cherry-orange fire-opal tuff; cliffside galleries
 lowerbed:{key:'lowerbed',name:'Terrace Bed III: the Fire-Opal Canyon Pools',zone:4,px:[998,1646],sky:{px:726,py:1316},base:275,atm:1.55,koppen:'Cfa',rain:1080,
  temp:{mean:21,warm:27,cold:14},soil:21,snow:[9000,9500],
  axis:{z0:380,amp:[50,18],f:[.0013,.0045],ph:[1.1,.4]},
  chain:[{kind:'stream',x0:2900,x1:2440,y:420,w:14},{kind:'lake',x0:2120,x1:1050,y:340,hw:210,depth:14,name:'The upper canyon pool (340 m)'},
   {kind:'lake',x0:650,x1:-650,y:275,hw:330,depth:20,name:'The middle canyon pool (275 m)'},{kind:'lake',x0:-1050,x1:-2250,y:210,hw:240,depth:16,name:'The lower canyon pool (210 m)'},
   {kind:'stream',x0:-2300,x1:-2600,y:208.5,w:14}],
  dam:'tuff',canyon:true,west:{drop:130},walls:{N:1800,n0:720,n1:2400,S:2400,s0:760,s1:3000},water:{shallow:0x8ad0b8,deep:0x1e6e7a,milk:.3},
  hazards:[{kind:'fall',why:'the canyon\'s galleries and the tuff sills\' fronts'},{kind:'gas',why:'silica dust in the dry galleries'}],
  dig:{bars:[[1400,130,90],[-850,240,80]],placer:6,sluice:[{at:'riser',i:1}],adit:[{x:1500,z:-560},{x:600,z:-620},{x:-200,z:-640},{x:-1400,z:-600},{x:-500,z:1060}],
   dive:[{lake:1,side:-1,t:.55},{lake:2,side:1,t:.4}]}},
 // STATION 5 (px 972,1636; old 700,1306): the Opal Cataract and the Xanadu threshold. Terrace III's tread (265 m) ends in the Rift's eastern scarp: the
 // Opal River (r682, 91 m3/s) falls ~115 m to a ledge pool and ~105 m into the plunge pool (45 m), then runs west through the gorge it has cut back into
 // the old fan (the station's bench, 60 m) toward the Rift floor (-14 m at px 969,1634; the Rift lake at -1,685 m, 70 km north-west: far field). Af/Cfa,
 // +22 degC (+29/+15), 1,110 mm, 1.59 atm. The Sultanate's toll-house and caravan landing on the bench (sites)
 riftmouth:{key:'riftmouth',name:'The Opal Cataract and the Xanadu Threshold',zone:5,px:[972,1636],sky:{px:700,py:1306},base:60,atm:1.59,koppen:'Af',rain:1110,
  temp:{mean:22,warm:29,cold:15},soil:22,snow:[9000,9500],
  axis:{z0:330,amp:[40,15],f:[.0015,.005],ph:[.2,1.3],bend:.24},
  chain:[{kind:'stream',x0:2900,x1:1700,y:265,w:34},{kind:'lake',x0:1672,x1:1400,y:150,hw:62,depth:5,name:'The ledge pool (150 m)'},
   {kind:'lake',x0:1372,x1:820,y:45,hw:175,depth:16,name:'The plunge pool (45 m)'}],   /* the gaps (28 m) are the falls' faces: a curtain, not a chute */
  river:{y0:43,y1:-112,w:34},fan:{at:60,slope:.045},gorge:[[820,175],[0,110],[-2860,80]],
  dam:'cataract',walls:{N:300,n0:2600,n1:9000,S:9000,s0:1600,s1:6000},water:{shallow:0x9adcc8,deep:0x206e80,milk:.25},
  sites:[{id:'tollhouse',name:'The Sultanate\'s toll-house (the Opal River\'s landing; caravans for Strongbow and the north)',x:-260,z:-260,r:40,kind:'civic',culture:'xanadu'},
   {id:'landing',name:'The caravan landing (the ford above the gorge\'s mouth)',x:-1700,z:-480,r:60,kind:'infrastructure',culture:'xanadu'}],
  hazards:[{kind:'fall',why:'the cataract\'s lip and the gorge\'s rim'},{kind:'drown',why:'the plunge pool and the gorge\'s rapids'}],
  dig:{bars:[[-900,140,70],[-2000,-120,80]],placer:5,sluice:[],adit:[{x:1650,z:-900}],dive:[]}}};
// THE STRATA (PLAN.md section 2): rhyolitic ignimbrite and its ash, perlitic glass, the Twins' dark titanium basalt sills, ironstone, the pale potch
// lines and the thin seams of precious opal (the play-of-colour is the ground's sheen, 84; the seam's colour here is its body colour). Plain data.
var OPAL_STRATA={
 'opal-rhyolite':{main:'ignimbrite',kinds:{
  ignimbrite:{p:.36,th:[4,18],col:[0xb6a490,0xc2b19c,0xa8977f,0xbcae9c],hard:.7,xbed:.15,varnish:.35},
  tuff:{p:.2,th:[1,6],col:[0xd6cbb6,0xe0d6c0,0xcbbfa6],hard:.35,xbed:.3,varnish:.2},
  perlite:{p:.08,th:[.5,3],col:[0x8c8e94,0x9a9da4,0x7e8088],hard:.6,xbed:0,varnish:.4},
  basalt:{p:.14,th:[2,10],col:[0x3a3a42,0x30303a,0x46464e],hard:.92,xbed:0,varnish:.6},
  ironstone:{p:.07,th:[.3,1.5],col:[0x7a4a2a,0x8a5634,0x6a3e22],hard:.85,xbed:0,varnish:.5,between:true},
  potch:{p:.1,th:[.15,.8],col:[0xc6cdd4,0xb6c2cc,0xd0d6de],hard:.6,xbed:0,varnish:.1,between:true},
  opal:{p:.05,th:[.08,.35],col:[0x58b8c4,0x7a68c8,0xc8784a,0x6ac888],hard:.7,xbed:0,varnish:0,between:true}},
  fx:{xbed:.2,varnish:.3}},
 'opal-firetuff':{main:'firetuff',kinds:{
  firetuff:{p:.4,th:[3,14],col:[0xc0683a,0xcc7444,0xb45c34,0xd8884e],hard:.55,xbed:.25,varnish:.25},
  ash:{p:.18,th:[1,5],col:[0xe0c49a,0xd8b88c,0xe8cfa8],hard:.3,xbed:.3,varnish:.15},
  ignimbrite:{p:.16,th:[3,12],col:[0xb08a6e,0xa07c62,0xbc967a],hard:.72,xbed:.15,varnish:.35},
  basalt:{p:.08,th:[2,8],col:[0x3c3638,0x34303a],hard:.92,xbed:0,varnish:.6},
  potch:{p:.1,th:[.15,.8],col:[0xe8d8c8,0xf0dcc0],hard:.6,xbed:0,varnish:.1,between:true},
  fireopal:{p:.08,th:[.08,.4],col:[0xe8602a,0xf0882a,0xd8402a,0xf4a83a],hard:.7,xbed:0,varnish:0,between:true}},
  fx:{xbed:.25,varnish:.25}}};
// THE DIGGINGS (PLAN.md section 4.3): records, a pure function of the site. Each draw is KRAND.hash of (the station's seed, the kind, the index, a salt),
// so a digging is the same whatever else changes. The host puts them on the ground (y), keeps a placer pit off the water and an adit on the wall.
var OPAL_GRADES=['low','medium','high'];
function OPAL_DIGGINGS(S){if(typeof KRAND==='undefined')throw new Error('OPAL_DIGGINGS needs core/rand (KRAND)');
 const D=S.dig||{},out=[],seed=KRAND.child(70411,'opalvalley/digs/'+S.key),U=(k,i,s)=>KRAND.unit(KRAND.hash(seed,k,i,s));
 const gemOf={glacier:'crystal',upperbed:'milk',middlebed:'harlequin',lowerbed:'fire',riftmouth:'fire'}[S.key]||'common';
 const grade=(k,i,w)=>{const u=U(k,i,9),wt=w||[.6,.3,.1];return u<wt[0]?'low':u<wt[0]+wt[1]?'medium':'high';};
 const KI={placer:1,sluice:2,adit:3,dive:4},rec=(kind,i,x,z,o)=>{const g=o.grade||grade(KI[kind],i,o.w);const r=Object.assign({id:'opal-'+S.key+'-'+kind+'-'+i,kind,x,z,grade:g,gem:o.gem||gemOf,
  resource:{kind:'opal',grade:g},tags:{class:'site',kind:'digging',mining:'opal',culture:'generic',harvest:{item:'rough_opal',efficiency:{low:.5,medium:1,high:2}[g],works:'mine'}}},o);
  delete r.w;return r;};   /* o.w: the grade's weights, not a field of the record */
 // PLACER PITS on the gravel bars: a pit 2.5-5 m across and a heap of washed gravel beside it, downhill of the pit (the host turns it off the water)
 const bars=D.bars||[];for(let i=0;i<(D.placer||0)&&bars.length;i++){const b=bars[Math.floor(U(1,i,1)*bars.length)%bars.length],a=U(1,i,2)*6.2831853,d=Math.sqrt(U(1,i,3))*b[2];
  out.push(rec('placer',i,b[0]+Math.cos(a)*d,b[1]+Math.sin(a)*d,{r:2.5+2.5*U(1,i,4),depth:.8+.8*U(1,i,5),spoil:{len:6+8*U(1,i,6),w:4+3*U(1,i,7),h:.9+.9*U(1,i,8),az:U(1,i,10)*6.2831853}}));}
 // RIFFLE SLUICES: a timber box on trestles beside a riser's fall, fed from above it, its tailings fanned below (the host finds the riser)
 (D.sluice||[]).forEach((s,i)=>out.push(rec('sluice',i,0,0,{at:s.at,riser:s.i,side:U(2,i,1)<.5?-1:1,len:10+8*U(2,i,2),spoil:{len:14+10*U(2,i,3),w:6+4*U(2,i,4),h:.8+.6*U(2,i,5),az:Math.PI}})));
 // ADITS on the wall's basalt contact: a timbered mouth 2-3 m, the spoil tipped down the slope from it (black opal on the middle bed: the higher grades)
 (D.adit||[]).forEach((a,i)=>out.push(rec('adit',i,a.x,a.z,{mw:2+.9*U(3,i,1),h:2.2+.6*U(3,i,2),len:40+60*U(3,i,3),gem:S.key==='middlebed'?'black':gemOf,
  spoil:{len:24+26*U(3,i,4),w:10+8*U(3,i,5),h:2+2*U(3,i,6),az:null},
  w:[.3,.45,.25]})));
 // THE DIVERS' LANDINGS: a plank stage on a lake's shore (lake: its index among the chain's lakes, side +1 south / -1 north, t along it)
 (D.dive||[]).forEach((d,i)=>out.push(rec('dive',i,0,0,{lake:d.lake,side:d.side,t:d.t,gem:'wood',spoil:null})));
 return out;}
// THE SOUND (for core/audio, which does not exist yet: data only, exported with the page; High Rift's records are the model)
var OPAL_SOUND={
 glacier:[{id:'icefall',kind:'creak',along:'icefall',band:[40,400],bursts:[20,120]},{id:'outwash',kind:'stream',along:'outwash',band:[300,3000]},{id:'katabatic',kind:'wind',band:[60,2000],gust:true}],
 upperbed:[{id:'falls',kind:'roar',along:'risers',band:[200,4000]},{id:'lap',kind:'lap',along:'shores',band:[300,1500]}],
 middlebed:[{id:'falls',kind:'roar',along:'risers',band:[200,4000]},{id:'seeps',kind:'simmer',along:'vents',band:[80,600],bursts:[4,20]},{id:'picks',kind:'work',along:'adits',band:[800,5000],when:'day'}],
 lowerbed:[{id:'falls',kind:'roar',along:'risers',band:[200,4000]},{id:'canyon',kind:'echo',band:[100,2000]}],
 riftmouth:[{id:'cataract',kind:'roar',along:'cataract',band:[60,4000],tremor:[10,18]},{id:'gorge',kind:'stream',along:'river',band:[200,3000]}]};
