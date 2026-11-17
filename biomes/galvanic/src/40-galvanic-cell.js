// ================================================================= GALVANIC — the cell's physics and the station's site (PLAN.md sections 3 and 5)  [G data]
// Plain data and pure functions: no THREE, no DOM, no random draw. The page (45-host-stage.js), the placement (60) and tests/test-galvanic.js read the
// same numbers, so the drawing cannot disagree with the physics. Units: volts, mA/m2, mW/m2, degC, atm (partial pressure of O2), days of a 365-day year.
//   GALV_PHYS.rest(mineral, pH, o2)          a sulfide's rest potential (V against the standard hydrogen electrode)
//   GALV_PHYS.cell({cathode, anode, pH, o2, T, wet, insul})   the couple: open circuit, the line's voltage, current, power to the life, power lost
//   GALV_PHYS.yield(i, p)                    what a year of that current grows and eats (biomass, cathodic crust, sphalerite and zinc)
//   GALV_PHYS.acid({ore, flow, o2, T})       pyrite's acid: the run-off's pH from the exposed ore (m2) and the water through it (L/s)
//   GALV_PHYS.stream({pH0, Q0, q, s})        down a stream: the pH by dilution, where the ochre drops (the terraces) and the water's colour
//   GALV_PHYS.season(day, o)                 the terminal sea's level against its mean (the falling shoreline) and the cathode's oxygen at a height
//   GALV_PHYS.floodDays(y, o), GALV_PHYS.store(y, o)   how long a height lies under the sea each year, and whether a store jar there lives through it
//   GALV_PHYS.tide(t)                        the daily tidal pump, 0..1 (the owner, 2026-11-12): t a clock in days or ATMOS.libration(t)'s record;
//                                            GALV_PHYS.cell({pump}) swells the current with it; GALV_PHYS.pumpHour(day) the hour of its peak
var GALV_PHYS=(function(){
 const F=96485,YEAR=365*86400,R=8.314;
 const clamp=(v,a,b)=>v<a?a:v>b?b:v,dflt=(v,d)=>v==null?d:v;
 // the rest potentials in acid at pH 2, 0.21 atm O2, 25 degC (PLAN.md section 1); `cath` marks the ones that carry oxygen's reduction on their surface
 const MIN={pyrite:{E:.63,metal:'iron',cath:true},chalcopyrite:{E:.52,metal:'copper',cath:true},galena:{E:.30,metal:'lead',cath:false},sphalerite:{E:-.24,metal:'zinc',cath:false}};
 // the strand's reference conditions (the strand at 5.1 px 780,1576: 2.21 atm, so 0.46 atm of O2; +36 degC)
 const REF={o2:.46,T:36,pH:2,iMax:100,ocvMax:.87};
 const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const arr=(T,Ea)=>Math.exp((Ea==null?40000:Ea)/R*(1/(273.15+REF.T)-1/(273.15+T)));   /* Arrhenius against the strand's +36 degC */
 // a mineral's rest potential: a cathodic mineral falls ~59 mV a pH unit and rises with oxygen (O2 + 4H+ + 4e-); the anode drifts ~20 mV a pH unit
 function rest(m,pH,o2){const M=MIN[m];if(!M)throw new Error('GALV: no mineral '+m);pH=dflt(pH,2);o2=dflt(o2,.21);
  return M.E-(M.cath?.059:.02)*(pH-2)+(M.cath?.0148*Math.log10(Math.max(1e-6,o2)/.21):0);}
 // THE COUPLE. The open circuit is the gap; the life runs the line at half of it (the most power a cell with ohmic losses gives); the current scales with
 // the gap, the oxygen's supply to the cathode (saturating: o2 / (o2 + 0.1 atm)), the temperature and how wet the contact is: 100 mA/m2 at the strand's
 // best, ~10 at its poorest living. Above pH ~4 the minerals passivate (iron and zinc hydroxides coat them), so near-neutral water carries almost no
 // current whatever the gap. `insul` is the share of the contact the organism has sheathed: the rest is the rock's own short circuit, lost as heat.
 function cell(o){const c=dflt(o.cathode,'pyrite'),a=dflt(o.anode,'sphalerite'),pH=dflt(o.pH,REF.pH),o2=dflt(o.o2,REF.o2),T=dflt(o.T,REF.T),wet=clamp(dflt(o.wet,1),0,1),ins=clamp(dflt(o.insul,1),0,1);
  const ocv=Math.max(0,rest(c,pH,o2)-rest(a,pH,o2)),v=ocv/2;
  const ox=o=>Math.max(0,o)/(Math.max(0,o)+.1),pass=1-sm(3.5,5.5,pH);
  const i=REF.iMax*(ocv/REF.ocvMax)*(ox(o2)/ox(REF.o2))*arr(T)*wet*pass;
  const pump=1+.6*clamp(dflt(o.pump,0),0,1);   /* the tidal pump (GALV_PHYS.tide): fresh oxygen and acid in, the products out */
  const iP=i*pump,p=v*iP*ins,lost=v*iP*(1-ins);
  return{ocv,v,i:iP,p,lost,alive:p>=2};}   /* under 2 mW/m2 the upkeep is not met (PLAN.md section 3: the cell is not worth living on) */
 // A YEAR OF CURRENT: energy, living matter (a tenth of it, 20 kJ/g), the cathodic crust (each electron spends an H+; FeOOH drops, 3 electrons a
 // mole; porous at half its 4 g/cm3), the sphalerite eaten (2 electrons a mole) and the zinc sent to the water
 function yieldOf(i,p,o){o=o||{};const eff=dflt(o.eff,.1),kJg=dflt(o.kJg,20),phi=dflt(o.solid,.5);
  const kJ=p*1e-3*YEAR/1e3,eMol=i*1e-3*YEAR/F,feooh=eMol/3*88.85,zns=eMol/2*97.47,zinc=eMol/2*65.38;
  const crustMm=feooh/(4.0e6*phi)*1e3;
  return{kJ,biomass:kJ*eff/kJg,eMol,feooh,crustMm,metreYears:crustMm>0?1000/crustMm:Infinity,zns,zinc,anodeMm:zns/4.1e6*1e3};}
 // PYRITE'S ACID: up to 4 H+ a mole of FeS2 (2 as it oxidises, 2 as its iron settles); the rate 3e-9 mol/m2/s in air at 25 degC (the order of the
 // abiotic and microbial rates), with the oxygen's square root and the temperature; the pH floored at 1.6, where sulfate (HSO4-) buffers it
 function acid(o){const ore=dflt(o.ore,1e5),flow=Math.max(1e-6,dflt(o.flow,1)),o2=dflt(o.o2,REF.o2),T=dflt(o.T,REF.T);
  const rate=3e-9*Math.sqrt(o2/.21)*arr(T)/arr(25),H=4*rate*ore/flow+1e-7;
  return{rate,H,pH:Math.max(1.6,-Math.log10(H)),vsRioTinto:Math.sqrt(o2/.21)*arr(T)/arr(25)};}
 // DOWN A STREAM: the acid diluted by inflow (q L/s per metre added to Q0 L/s at the spring); the ochre drops between pH 2.8 and 4 (dissolved ferric
 // iron cannot stay up above ~3), so the terraces lie in one band; the colour: wine-red to orange over the terraces to a dull brown-green below
 const ramp=[[1.6,0x6a1418],[2.4,0x7e2018],[2.9,0xa63c1a],[3.4,0xc0601e],[4.2,0x9a6a32],[5.5,0x6e6a4a]];
 const mixHex=(a,b,t)=>{const ch=(c,s)=>(c>>s)&255,m=s=>Math.round(ch(a,s)+(ch(b,s)-ch(a,s))*t);return(m(16)<<16)|(m(8)<<8)|m(0);};
 function colourAt(pH){if(pH<=ramp[0][0])return ramp[0][1];for(let k=0;k+1<ramp.length;k++)if(pH<=ramp[k+1][0])return mixHex(ramp[k][1],ramp[k+1][1],(pH-ramp[k][0])/(ramp[k+1][0]-ramp[k][0]));return ramp[ramp.length-1][1];}
 function stream(o){const H0=Math.pow(10,-dflt(o.pH0,2)),Q0=dflt(o.Q0,1),q=dflt(o.q,.005),s=Math.max(0,dflt(o.s,0));
  const Q=Q0+q*s,H=H0*Q0/Q+Math.pow(10,-6.5),pH=-Math.log10(H);
  const terrace=sm(2.7,2.9,pH)*sm(4.1,3.9,pH);
  return{pH,Q,terrace,colour:colourAt(pH),acid:pH<4};}
 // where along a stream the pH crosses a value (the terraces' band starts at 2.8 and ends at 4): s = Q0 (H0 / H - 1) / q
 function streamAtPH(o,pH){const H0=Math.pow(10,-dflt(o.pH0,2)),Q0=dflt(o.Q0,1),q=dflt(o.q,.005),H=Math.pow(10,-pH)-Math.pow(10,-6.5);return H>=H0?0:Q0*(H0/H-1)/q;}
 // THE SEASON: the terminal sea fed by the Rift's rivers, emptied by evaporation; lowest about day 70, highest about day 252 (default taken: a
 // 1.2 m swing, PLAN.md section 3). o2At(y, day): the cathode's oxygen at height y (m against the sea's mean): flooded ground is anoxic brine
 const SEA={amp:.6,low:70};
 function level(day,o){o=o||{};const amp=dflt(o.amp,SEA.amp),low=dflt(o.low,SEA.low);return -amp*Math.cos(2*Math.PI*(day-low)/365);}
 function season(day,o){const lv=level(day,o);return{level:lv,wet:lv>0,o2At:y=>y>lv+.05?REF.o2:y>lv?REF.o2*.2:.002};}
 function floodDays(y,o){let n=0;for(let d=0;d<365;d++)if(level(d+.5,o)>y)n++;return n;}
 // THE STORE JAR: it charges on the dry days' surplus (full in ~30 days) and spends a day's upkeep each flooded day; it holds 60 days (the plan's
 // number, not a measurement). Run two years from full at height y: alive if it never empties. charge is its state on `day` of the second year
 function store(y,o){o=o||{};const cap=dflt(o.cap,60),fill=dflt(o.fill,2);let c=cap,min=cap,at=null;const day=dflt(o.day,70);
  for(let d=0;d<730;d++){const flooded=level(d+.5,o)>y;c=flooded?c-1:Math.min(cap,c+fill);if(c<min)min=c;if(d===365+Math.floor(day))at=c;}
  return{alive:min>0,charge:clamp((at==null?c:at)/cap,0,1),floodDays:floodDays(y,o),min};}
 // THE TIDAL PUMP (the owner, 2026-11-12; PLAN.md section 3): once a sidereal day Krator's shell flexes with its slightly eccentric orbit, the
 // strand's cracked ore gapes at the top of the giant's nod, fresh oxygen and acid are drawn into it and the zinc sulfate flushed out. The phase is
 // the sky model's libration (core/atmos/sky/89-atmos-e-skymodel.js: SID, the nod's phase NOD), the same the Gills' breath reads, so the pump and the
 // giant's nod are one motion (tests/test-galvanic.js holds the constants against ATMOS). The pulse: (0.5 + 0.5 cos)^2 of the phase from the top of
 // the nod: 1 at the top, 0 half a day later, a mean of 3/8. The current swells by GAIN x pump: 1.6x at the top, 1.225x over the day
 const TAU=Math.PI*2,SID=1.0027379,NOD=4.04,GAIN=.6,fr=x=>x-Math.floor(x);
 const tidePhase=t=>fr(t*SID+(NOD-Math.PI/2)/TAU);
 const pumpAt=u=>{const c=.5+.5*Math.cos(TAU*u);return c*c;};
 const tide=t=>pumpAt(t!=null&&typeof t==='object'?fr(t.phase+(NOD-Math.PI/2)/TAU):tidePhase(t));
 const pumpHour=day=>{const k=Math.ceil(day*SID+(NOD-Math.PI/2)/TAU),t=(k-(NOD-Math.PI/2)/TAU)/SID;return (t-day)*24;};
 const TIDE={SID,NOD,GAIN,mean:3/8};
 // THE GEOBATTERY (station 3, the gossan hills; Sato and Mooney 1960, quoted as the model, PLAN.md section 1): an ore body crossing the water table is
 // a cell whose top, in oxygenated ground, is the cathode and whose depth, in reducing ground, is the anode; the ore is the wire. emf(o): the gap between
 // the top's Eh (pyrite at the gossan's pH and the air's oxygen) and the depth's (o.ehDeep, default -0.1 V: reducing groundwater). sp(d, o): the
 // self-potential a prospector reads on the surface at d metres from the ore's crest, a pole at the cathode's depth (o.depth, default 30 m) carrying
 // half the gap (the rest is spent in the ore and the ground): negative over the top, falling off as depth / sqrt(depth^2 + d^2)
 function emf(o){o=o||{};return Math.max(0,rest('pyrite',dflt(o.pH,3),dflt(o.o2,REF.o2))-dflt(o.ehDeep,-.1));}
 function sp(d,o){o=o||{};const h=Math.max(1,dflt(o.depth,30));return -.5*emf(o)*h/Math.hypot(h,Math.max(0,d));}
 return{MIN,REF,SEA,TIDE,rest,cell,yield:yieldOf,acid,stream,streamAtPH,colourAt,season,level,floodDays,store,tide,tidePhase,pumpAt,pumpHour,emf,sp};})();

// THE STATION'S SITE (PLAN.md section 5; scale model 5.1, surveyed 2026-11-11 by tools/survey.py; MOVED 2026-11-17, the owner: nearer Sauropolis, to the
// north strand at px 780,1576, 50 km from the city, where the strand runs 18 km from the XV hills' foot to the sea: 1,537 mm, +36 degC, 2.21 atm). An ideal type of 5.2 km (R 2600 m), page metres:
// x east, z south, origin the page's centre. The page compresses the model's 16 km of strand to ~3 km; the heights are the model's (-2,600 m is the
// sea's mean). sky: the old-canvas px ATMOS.skyBiome is placed by (5.1 px minus 272, 330).
var GALV_SITES={
 strand:{key:'strand',name:'The Gossan Strand',px:[780.2,1576.4],world:[1560400,3152800],sky:{px:508.2,py:1246.4},
  sea:-2600,atm:2.21,koppen:'XA',rain:1537,temp:{mean:36,warm:40,cold:32},soil:36,day:70,
  // the strand's fall: from the hills' foot (z -1350) at -2,597.2 (the model's strand top, -2,597 m) to the sea floor; the hills rise north of it
  strand:{z0:-1350,y0:-2597.2,z1:2600,y1:-2601.4},hills:{z0:-1350,h:150},
  // the vent's crater: its floor 100 m under the sea (the model's vent record), hot brine to the sea's level, a rim of mounds
  deep:{x:1500,z:1050,r:560,floor:-2700,rim:3.5,T:62},
  // the relict sulfide mounds (x, z, r, h): gossan caps, acid springs at their feet; the last three ring the Deep
  mounds:[[-1550,-760,75,14],[-760,-380,50,10],[180,-980,85,17],[-1150,420,40,7],[820,120,48,10],[1080,520,60,12],[2050,700,52,11],[1500,330,40,8]],
  // the acid streams: polylines from a spring at a mound's foot to the sea (pH0 at the spring, Q0 L/s, q L/s gained per metre)
  streams:[{name:'The west stream',pts:[[-1500,-690],[-1640,-200],[-1480,400],[-1600,1100],[-1500,1900],[-1560,2600]],pH0:1.9,Q0:4,q:.03},
   {name:'The middle stream',pts:[[150,-900],[0,-420],[-260,100],[-180,700],[-320,1400],[-260,2600]],pH0:2.0,Q0:6,q:.04},
   {name:'The mound brook',pts:[[800,180],[700,500],[820,900],[640,1500],[700,2600]],pH0:2.2,Q0:2,q:.02}],
  vents:[{x:1500,z:1050,T:62,reach:700,decay:2.6}]},
 // STATION 2, THE DEEP (PLAN.md section 12; built 2026-11-17): the Deep's vent (5.1 px 781,1577: the model has no vent record there yet, KNOWN_ISSUES.md), a page of 3.4 km on the crater. The crater larger on the
 // page than on station 1's (r 820 m against 560: the model's vent is one record, its pit drawn as an ideal type), its floor 100 m under the sea, the hot
 // brine to the sea's level; a SHELF of the brine's own muds round its edge (the sea's mean -1.4 m to +1.0 m over 115 m), which the season's 1.2 m bares
 // and drowns (the bathtub ring); the galvanic chimneys (the owner's name, 2026-11-17: relict black smokers, PLAN.md section 4, item 1: the chimneys that stood when the vent was under the sea),
 // [x, z, height, radius at the foot], on the rim and in the shallows; the rim's mounds; a stream off the hills falling into the Deep; the sea past the
 // south rim; the hills' foot along the north edge, the Rift's trees on it. The steam: a faint haze over the brine (~60 degC water in +36 degC air), thicker over the vent.
 deep:{key:'deep',name:'The Deep',station:2,px:[781,1577],world:[1562000,3154000],sky:{px:509,py:1247},R:1700,
  sea:-2600,atm:2.21,koppen:'XA',rain:1569,temp:{mean:36,warm:40,cold:32},soil:36,day:70,
  strand:{z0:-1150,y0:-2598.0,z1:1700,y1:-2600.9},hills:{z0:-1150,h:90},exportBox:[-420,-1180,-20,-880],
  deep:{x:0,z:-150,r:820,floor:-2700,rim:4.5,T:62,shelf:[-1.4,1.0]},
  mounds:[[700,-700,55,11],[960,-260,70,14],[880,380,45,9],[-420,-1060,50,10],[-980,-560,40,8],[-150,-1120,60,12]],
  smokers:[[-848,-459,9,1.6],[-699,-639,6,1.1],[-586,-900,12,2.0],[-313,-925,5,.9],[-108,-921,4,.8],[62,-1033,10,1.7],[271,-1096,7,1.2],[397,-896,8,1.4],
   [506,-753,3.5,.7],[661,-788,11,1.9],[746,-580,6,1],[951,-459,9,1.5],[832,-237,5,.9],[893,-24,7,1.2],[737,148,3,.6],[721,336,6,1]],
  streams:[{name:'The north stream',pts:[[-300,-1690],[-260,-1400],[-330,-1200],[-210,-1030],[-150,-972]],pH0:2.0,Q0:3,q:.03},
   {name:'The rim brook',pts:[[1010,-300],[930,-330],[860,-300],[800,-280]],pH0:2.1,Q0:1,q:.01}],
  vents:[{x:0,z:-150,T:62,reach:1100,decay:2.6}],steam:{cell:70,hot:44}},
 // STATION 3, THE GOSSAN HILLS (PLAN.md section 12; built 2026-11-17): the hills' slope 14 km north of the strand (5.1 px 780,1569: -2,173 m, 2.10 atm,
 // 1,051 mm, mean +33 degC, warmest +38, coldest +29, XV), a page of 3.6 km. Sato and Mooney's battery at a hill's scale: a massive sulfide lens striking
 // down the hill (`ore`: its outcrop, its width, the gossan rib's height) crosses the water table at the slope's foot (`table`): above it the ore is
 // oxidised to the iron hat, a rust-red rib standing proud of the slope; below it the ore lies in reducing water under the footslope; where it crosses,
 // the seeps, and the acid streams run from them down the ore's trough. The water table (`table`): its mean lies `d0` m under the slope's foot
 // (the line: 0.55 m, so the footslope lies flooded ~47 days a year, inside what a store jar bridges), deepening up the hill, and swings +-`swing` m
 // with the season (default taken, owner to confirm: 1.2 m a year, the sea's own), so the seeps' wet band moves with the year as the strand's shore does.
 // No sea on the page: the flood is the table's.
 gossan:{key:'gossan',name:'The Gossan Hills',station:3,px:[780,1569],world:[1560000,3138000],sky:{px:508,py:1239},R:1800,base:'hill',
  sea:-2600,atm:2.10,koppen:'XV',rain:1051,temp:{mean:33,warm:38,cold:29},soil:33,day:70,swing:.6,
  hill:{y0:-2200,zl:300,g1:.09,g2:.012,bend:160},strand:null,hills:null,deep:null,shore:false,exportBox:[-160,260,160,620],
  table:{d0:.55,rise:.01,steep:.25,knee:6},
  ore:{pts:[[220,-1700],[150,-800],[60,0],[0,300],[-60,800],[-140,1700]],w:30,rib:8,depth:30,pH:3},
  mounds:[],
  seeps:[[-8,318,4],[22,314,3],[-30,311,2.5]],
  streams:[{name:'The seep stream',pts:[[-6,330],[-30,560],[-60,800],[-96,1200],[-140,1700]],pH0:2.0,Q0:1.5,q:.015},
   {name:'The footwall seep',pts:[[26,318],[150,520],[260,800],[380,1200],[470,1700]],pH0:2.3,Q0:.8,q:.01}],
  vents:[]}};
