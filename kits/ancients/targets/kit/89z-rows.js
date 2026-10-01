// TARGET: kit — the 32-type showcase. One row per type, intact west / ruined east.
//
// Theodiga (the dam arcology) is deliberately NOT here. It is the single
// heaviest structure in the kit and is being taken up as its own piece of work,
// so it has its own target: targets/theodiga/. buildDam still ships in this
// file's <script> — only the site is gone — so the two targets cannot drift.
// THE REHABILITATED VARIANTS (decay 3) ARE FOLDED IN. Every row now carries
// intact (x=-s), ruined (x=+s), toppled (x=t, towers only) AND rehabilitated at
// x=0, the empty middle of every row view, which is why the row presets needed
// no change. This used to be its own target (`repaired`); it was kept apart only
// because it did not fit the 6 000 000 ceiling: measured at 7 212 766 with the
// fold. The user chose to take the fold and accept the overage (the ceiling is a
// target, not a gate), so --assert will report the showcase as OVER.
const TITLE='Krator Ancients kit';
const DECAYS=[0,1,2,3];
// GROUND_C (z centre of the ground plane and its paint) and GROUND_S (its side)
// are set after ROWS, below: the alternates rows run the kit far north.
// skyA, skyD and skyH carry a fourth variant the other types do not: `ds`
// overrides the target's DECAYS for that row alone and `j` is its x, the way
// `t` is the toppled x. Decay 4 is THE PROJECTS — Skyscraper A, the Monolith
// and the Warden rehabilitated and STILL STANDING, the buildings a later people
// reoccupied whole rather than camped in the stump of. Each stands west of its
// own intact tower, so every existing three-variant row shot is unchanged.
// The z (and the smallest s) written here are the 2026-09-29 values and only fix
// the ORDER of the rows: ROW SPACING below lays every row out again.
const ROWS={skyA:{z:0,s:300,r:280,t:1200,j:-1150,ds:[0,1,2,3,4]},skyB:{z:800,s:300,r:260,t:1200},skyC:{z:1600,s:300,r:280,t:1200},mega:{z:2900,s:700,r:520},fac:{z:4000,s:330,r:330},port:{z:5400,s:540,r:420},
 gov:{z:6500,s:270,r:190},lib:{z:7100,s:220,r:130},bunk:{z:7600,s:220,r:130},off:{z:8100,s:265,r:260},apt:{z:8600,s:520,r:300},amph:{z:9200,s:220,r:130},
 fuel:{z:9600,s:150,r:80},radar:{z:9900,s:150,r:70},dish:{z:10200,s:150,r:80},house:{z:10500,s:120,r:120},lab:{z:10900,s:420,r:200},house2:{z:11400,s:120,r:120},skyD:{z:12100,s:300,r:280,t:1200,j:-1150,ds:[0,1,2,3,4]},skyE:{z:12900,s:300,r:280,t:1200},skyF:{z:13700,s:300,r:280,t:1200},arc:{z:14900,s:800,r:520},robo:{z:15900,s:330,r:280},campus:{z:17100,s:600,r:420},skyG:{z:18100,s:320,r:300,t:1300},skyH:{z:18900,s:300,r:280,t:1200,j:-1150,ds:[0,1,2,3,4]},dc:{z:19700,s:400,r:330},police:{z:20300,s:180,r:110},hosp:{z:20800,s:260,r:170},hotel:{z:21400,s:300,r:170},cult:{z:22500,s:640,r:330},
 perch:{z:24200,s:520,r:330},
 flat:{z:25400,s:380,r:200,t:1200},   // t: the Flatiron topples too (2026-09-29)
 // Skyscrapers I, J and K (added 2026-09-29): each built in its own dev target
 // (skyi/skyj/skyk) first, then given a row here like A-H.
 skyI:{z:26400,s:300,r:280,t:1200},skyJ:{z:27200,s:300,r:280,t:1200},skyK:{z:28000,s:300,r:280,t:1200},
 // The Lighthouse island (a modified Skyscraper J, 2026-09-29): its own sea,
 // shared by the three sites at -320/0/+320; built in targets/lighthouse first.
 lighthouse:{z:28800,s:320,r:300,t:1250},
 // The Iziz spaceport (src/8ao-iz-spaceport.js, built in targets/spaceport), all six
 // states along x: worn w, intact -s, rehabilitated 0, ruined +s, toppled t, reclaimed j
 // (decay 4). Its spacing was validated in its own target, so the re-spacing below skips it.
 izPort:{z:29600,s:340,r:150,t:680,j:1020,w:-680,ds:[5,0,3,1,2,4]}};
// THE ALTERNATES (queue item 3, 2026-10-01): 29 from-scratch builders after the
// arco1/arco2 references, built in their own dev targets (alt-towers,
// alt-domestic, alt-civic) and given rows here north of the Lighthouse. Their
// decay 2 is RECLAIMED (the ruin lived in), not toppled, and stands at t=2s,
// the site SITEX gives decay 2. Spacing: each row clears the last by both
// radii plus 300 m. A row is listed only when its builder exists.
const KIT_ALTS=[
 // key       builder                  s    r   name
 ['altBole', 'buildAltBole',         380, 180,'The Bole'],
 ['altStack','buildAltStack',        300, 150,'The Pierced Stack'],
 ['altHotel','buildAltHotel',        300, 150,'The Attraction'],
 ['altFlat', 'buildAltFlat',         260, 130,'The Undulant'],
 ['altPerch','buildAltPerch',        420, 210,'The Rig (perch)'],
 ['altCult', 'buildAltCult',         300, 170,'The Bloom'],
 ['adWave',  'buildAltWaveHouse',     80,  40,'Undulant house'],
 ['adBridge','buildAltBridgeHouse',   80,  40,'Bridge house'],
 ['adFins',  'buildAltFinApartments',190, 110,'Fin apartments'],
 ['adAmph',  'buildAltAmphitheater', 170,  95,'Garden amphitheater'],
 ['adFuel',  'buildAltFuelStation',  110,  55,'Trestle fuel station'],
 ['adRadar', 'buildAltRadar',         90,  45,'Rotor radar'],
 ['adDish',  'buildAltDish',         120,  60,'Flower dish'],
 ['adFac',   'buildAltFactory',      380, 200,'Pilotis works'],
 ['adLab',   'buildAltLab',          230, 120,'Star laboratory'],
 ['adMega',  'buildAltMega',         900, 420,'The Rampart'],
 ['altOffT', 'buildAltOfficeTerrace',170, 110,'Terrace Wedge office'],
 ['altOffS', 'buildAltOfficeStack',  150, 100,'Stacked Piers office'],
 ['altOffF', 'buildAltOfficeFins',   190, 120,'Sail Fins office'],
 ['altPort', 'buildAltStarport',     330, 260,'Saucer Deck starport'],
 ['altBunk', 'buildAltBunker',       170, 110,'Bastion Drum bunker'],
 ['altLib',  'buildAltLibrary',      170, 110,'Reading Star library'],
 ['altGate', 'buildAltGate',         380, 220,'The Horns gate'],
 ['altRobo', 'buildAltRobotics',     230, 160,'Robotics rig'],
 ['altDc',   'buildAltDataCenter',   200, 140,'Perforated Stacks data center'],
 ['altPolice','buildAltPolice',      130,  80,'Watch Cup police'],
 ['altHosp', 'buildAltHospital',     200, 140,'Linked Blocks hospital'],
 ['altCampus','buildAltCampus',      300, 220,'Garden Bowl campus'],
 ['altGov',  'buildAltGovernment',   220, 150,'The Citadel'],
 // The Yuni fork's variants (src/8am-yv-*, built in targets/yuni-variants):
 // decays 0, 1 and 3 only (their decay 2 is not defined), so no `t` site.
 ['yvQuad',  'buildYvQuad',          150,  75,'Quadrangle (the Cloisters)',[0,1,3]],
 ['yvComb',  'buildYvCombShort',     100,  50,'Honeycomb short block',[0,1,3]],
 ['yvTerr',  'buildYvTerrace',       100,  50,'Terrace stack roofed',[0,1,3]],
 ['yvDish',  'buildYvDish',          140,  70,'Dish intact (the Ear)',[0,1,3]],
 ['yvHosp',  'buildYvHospital4',     280, 140,'Hospital four towers',[0,1,3]],
];
const KIT_ALT_NAME={},KIT_ALT_BUILDERS={};
{let z=ROWS.lighthouse.z,rp=ROWS.lighthouse.r;
 for(const[k,fn,s,r,name,ds]of KIT_ALTS){if(typeof self[fn]!=='function')continue;
  z+=rp+r+300;rp=r;ROWS[k]=ds?{z,s,r,ds}:{z,s,r,t:2*s};KIT_ALT_BUILDERS[k]=self[fn];KIT_ALT_NAME[k]=name;}}
// TOWER STUMPS (src/8an-iz-stumps.js, built in targets/iziz-variants): the snapped
// lower storeys of a sibling tower, one per skyscraper family, standing in its
// tower's row 650 m beyond the toppled site (decay 1 only, at x=+s).
const KIT_STUMPS={};
for(const f of'ABCDEFGHIJK'){const T=ROWS['sky'+f],fn=self['buildStump'+f];if(!T||typeof fn!=='function')continue;
 ROWS['stump'+f]={z:T.z,s:(T.t||1200)+650,r:T.r*.8,ds:[1]};KIT_STUMPS['stump'+f]=fn;}
// ROW SPACING (shared-code round, 2026-10-01). With the rehabilitated variant at
// x=0 every row holds three sites (four with a toppled one), and the old `s`
// and `z` had been sized for two: the rehabilitated Gate stood ~80 m off the
// intact Gate's foot, and nine row shots had been pulled in to stop short of
// the next row. The spacing is now DERIVED from each row's measured footprint
// and from how far back its own presets stand, so nothing has to be pulled in:
//  * ROW_FP[k] = [x0,x1,z0,z1]: the extent of a site's registered volumes about
//    its own centre (the max over its sites; measured off the built kit with
//    the registry, 2026-10-01; the houses and the apartments by hand, since
//    their sites are rows of buildings the nearest-site test splits). Re-measure
//    when a type grows: a row without an entry falls back to its radius r.
//  * x: three sites in a row need s >= x1 - x0 + a clear gap (120 m, 60 m for a
//    small type); a row without a rehabilitated site needs half that. A toppled
//    site keeps the same gap beyond the ruin, the Projects (j) beyond the
//    intact, and an alternate's reclaimed site stays at 2s. `s` never shrinks.
//    The Lighthouse keeps its own: its three sites share one island.
//  * z: the gap to the next row clears both footprints by 150 m, the deepest of
//    this row's front presets by 60 m beyond the next row's near edge, and the
//    next row's back presets (the Amphitheater and the Hotel court look north)
//    likewise. ROW_V is that preset depth; ROWV() in 91z-views scales its
//    distance by s/s0 so a widened row is framed as before, and ROW_V follows.
const ROW_FP={skyA:[-110,110,-110,110], skyB:[-100,100,-100,100], skyC:[-130,130,-130,130], mega:[-320,320,-320,320], fac:[-260,260,-260,260], port:[-360,360,-360,360],
 gov:[-150,150,-150,150], lib:[-60,96,-60,60], bunk:[-90,90,-90,90], off:[-55,145,-125,55], apt:[-60,240,-70,70], amph:[-110,110,-110,110],
 fuel:[-60,60,-60,60], radar:[-40,40,-40,40], dish:[-70,70,-70,70], house:[-5,145,-20,20], lab:[-40,116,-40,40], house2:[5,125,-20,20],
 skyD:[-120,120,-120,120], skyE:[-120,120,-120,120], skyF:[-56,56,-56,56], arc:[-400,400,-400,400], robo:[-230,230,-230,230], campus:[-370,290,-270,390],
 skyG:[-150,150,-150,150], skyH:[-120,120,-120,120], dc:[-220,220,-220,220], police:[-90,90,-90,90], hosp:[-120,120,-120,120], hotel:[-110,110,-110,110],
 cult:[-250,250,-250,250], perch:[-180,180,-180,180], flat:[-121,121,-121,242], skyI:[-130,184,-193,198], skyJ:[-122,122,-141,122], skyK:[-145,140,-148,152],
 lighthouse:[-270,270,-270,270], izPort:[-160,160,-160,160], altBole:[-108,100,-100,169], altStack:[-48,48,-48,48], altHotel:[-82,82,-82,82], altFlat:[-88,68,-78,78], altPerch:[-108,232,-108,108],
 altCult:[-112,112,-112,112], adWave:[-22,22,-22,22], adBridge:[-20,20,-24,16], adFins:[-66,66,-70,62], adAmph:[-100,100,-120,80], adFuel:[-40,40,-40,40],
 adRadar:[-36,36,-36,36], adDish:[-44,44,-44,44], adFac:[-170,170,-160,180], adLab:[-64,64,-54,74], adMega:[-400,400,-400,400], altOffT:[-70,70,-70,70],
 altOffS:[-56,56,-56,56], altOffF:[-68,68,-62,74], altPort:[-150,150,-325,120], altBunk:[-62,62,-62,62], altLib:[-50,50,-50,50], altGate:[-140,140,-140,140],
 altRobo:[-110,146,-110,110], altDc:[-90,90,-90,90], altPolice:[-48,48,-48,48], altHosp:[-84,84,-84,84], altCampus:[-130,130,-138,130], altGov:[-90,90,-90,90],
 yvQuad:[-66,66,-66,66], yvComb:[-34,34,-34,34], yvTerr:[-40,40,-40,40], yvDish:[-70,70,-70,70], yvHosp:[-100,100,-100,100], stumpA:[-129,129,-129,129],
 stumpB:[-117,117,-117,117], stumpC:[-152,152,-152,152], stumpD:[-140,140,-140,140], stumpE:[-140,140,-140,140], stumpF:[-66,66,-66,66], stumpG:[-175,176,-175,176],
 stumpH:[-140,140,-140,140], stumpI:[-115,162,-123,125], stumpJ:[-143,143,-143,143], stumpK:[-164,164,-164,164]};
const ROW_V={skyA:900,skyB:800,skyC:900,mega:1300,fac:760,port:1250,gov:480,lib:330,bunk:330,off:430,apt:480,
 fuel:110,radar:150,dish:150,house:120,lab:820,house2:120,skyD:900,skyE:900,skyF:900,arc:1000,robo:600,campus:900,
 skyG:800,skyH:900,dc:420,police:170,hosp:260,hotel:260,cult:620,perch:900,flat:620,skyI:900,skyJ:900,skyK:900,lighthouse:1000,izPort:900};
const ROW_B={amph:330,hotel:190,off:80};
// the ROWV rows: their preset distance scales with the row's new half-width
// over its old one (the outer sites' far edges, s + the site's half-width), so
// a widened row is framed as it was (see 91z-views)
function rowFrame(k){const R=ROWS[k];if(R.s0==null)return 1;const F=ROW_FP[k]||[-R.r,R.r],hw=Math.max(-F[0],F[1]);
 return Math.max(1,(R.s+hw)/(R.s0+hw));}
const ROWV_KEYS=new Set(['skyA','skyB','skyC','mega','fac','port','gov','lib','bunk','off','lab','skyD','skyE','skyF','robo','skyG','skyH','skyI','skyJ','skyK','lighthouse']);
{const c10=v=>Math.ceil(v/10)*10;
 for(const k in ROWS){const R=ROWS[k];R.s0=R.s;if(/^stump/.test(k)||k==='lighthouse'||k==='izPort')continue;
  const F=ROW_FP[k]||[-R.r,R.r,-R.r,R.r],w=F[1]-F[0],gap=w<200?60:120;
  const has3=(R.ds||DECAYS).indexOf(3)>=0;
  R.s=Math.max(R.s,c10(has3?w+gap:(w+gap)/2));
  if(R.t){R.t=KIT_ALT_NAME[k]?2*R.s:Math.max(R.t,c10(R.s+w+gap));}
  if(R.j!=null)R.j=Math.min(R.j,-c10(R.s+w+gap));}
 for(const k in KIT_STUMPS){const T=ROWS['sky'+k.slice(5)];ROWS[k].s=(T.t||1200)+650;}
 // a tower's z footprint includes its stump's
 const FZ=k=>{const R=ROWS[k],F=ROW_FP[k]||[-R.r,R.r,-R.r,R.r],S=ROWS['stump'+k.slice(3)];let z0=F[2],z1=F[3];
  if(/^sky/.test(k)&&S){const G=ROW_FP['stump'+k.slice(3)]||[0,0,-S.r,S.r];z0=Math.min(z0,G[2]);z1=Math.max(z1,G[3]);}return[z0,z1];};
 const V=k=>{const R=ROWS[k];if(KIT_ALT_NAME[k])return Math.max(420,R.r*3.4,R.t?Math.max(260,R.r*2.2):0);
  return (ROW_V[k]||R.r*2)*(ROWV_KEYS.has(k)?rowFrame(k):1);};
 const order=Object.keys(ROWS).filter(k=>!/^stump/.test(k));let z=0;
 for(let i=0;i<order.length;i++){const k=order[i];
  if(i){const p=order[i-1],P=FZ(p),N=FZ(k);
   z+=c10(Math.max(P[1]-N[0]+150,V(p)-N[0]+60,(ROW_B[k]||0)+P[1]+60));}
  ROWS[k].z=z;}
 for(const k in KIT_STUMPS)ROWS[k].z=ROWS['sky'+k.slice(5)].z;}
const KIT_Z1=Math.max(...Object.values(ROWS).map(r=>r.z))+1500;
const GROUND_C=(KIT_Z1-9000)/2, GROUND_S=Math.max(40000,KIT_Z1+9000+4000);
const RUINS=Object.values(ROWS).flatMap(r=>(r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]])
 .concat((r.ds||DECAYS).indexOf(3)<0?[]:[[0,r.z,r.r]])
 .concat(r.j==null?[]:[[r.j,r.z,r.r]]));
// SPACING (2026-09-29). With the rehabilitated variant at x=0, a row whose `s`
// was sized for two sites put three structures in it: the Cultural centre's
// 250 m platform and 310 m apron at s=400 laid the rehabilitated Wheel over a
// third of the intact one. cult 400->640, perch 430->520, flat 300->380 and
// hotel 260->300 each give the three sites their own ground; the presets of
// those rows are written off ROWS.<k>.s, so they follow.
const EXTRA_BUILDERS={cult:buildCultural,perch:buildPerch,flat:buildFlatiron,skyI:buildSkyI,skyJ:buildSkyJ,skyK:buildSkyK,lighthouse:buildLighthouse,izPort:buildIzSpaceport,...KIT_ALT_BUILDERS,...KIT_STUMPS};
