// Jimjam celestial temples, planetary shrines & historical/trans-rim landmarks (74b):
//   - The Raja's Eye Observatory Pavilion (jj_rajas_eye)
//   - All Six Astrologically Aligned Moon Temples: Week, Thirteen, Companion, Day, Two-Day, Four-Day
//   - All Five (+1) Planetary Shrines: Veil, Crown, Rust & Cinder, Ash, Frost, Uncounted Wanderer
//   - Order of Historians Small Chapterhouse (jj_order_chapterhouse)
//   - Decayed Izani Governor's House — Sid'kin-Palu (jj_izani_gov_ruin, VASSAL-KITS s.3 in disrepair)
//   - White-Pass Trans-Rim Factor Compound — Vellai-Vasal Kottam (jj_whitepass_compound)
// Seeds 9700-9799. Prefix: buildJjCel... / jjCel...

JMAT.jjOrderBlue=new THREE.MeshStandardMaterial({color:jjColor(0x1b4f9c),roughness:.42,metalness:.08});
JMAT.jjIzizOrange=new THREE.MeshStandardMaterial({color:jjColor(0xe07a2a),roughness:.82,metalness:.02});
JMAT.jjElectricGlow=new THREE.MeshStandardMaterial({color:jjColor(0xd8f0ff),emissive:jjColor(0x88ccff),emissiveIntensity:1.7,roughness:.25});
JMAT.verdigris=JMAT.verdigris||MAT.verdigris||JMAT.turquoise;
JMAT.jjMilRock=JMAT.jjMilRock||new THREE.MeshStandardMaterial({color:jjColor(0x8c7a68),roughness:1,flatShading:true});
JMAT.jjMilSand=JMAT.jjMilSand||new THREE.MeshStandardMaterial({color:jjColor(0xc8aa80),roughness:1});

/* 1. THE RAJA'S EYE OBSERVATORY PAVILION (jj_rajas_eye, 28 x 28 x 26 m) */
function buildJjCelRajasEye(jjG,jjO){reseed(9700+(jjO.v|0));
  const P=3.6;
  jjTemplePodium(0,0,0,26.4,26.4,P,4.4);
  jjTempleFlight(0,0,13.2,6.4,5.4,P,14);
  jjTempleBalustrade(-12.8,-12.8,12.8,-12.8,P);jjTempleBalustrade(-12.8,-12.8,-12.8,12.8,P);jjTempleBalustrade(12.8,-12.8,12.8,12.8,P);
  jjTempleBalustrade(-12.8,12.8,-4.2,12.8,P);jjTempleBalustrade(4.2,12.8,12.8,12.8,P);
  // octagonal observatory drum + shielded electric chronograph annex on -z
  jjCylinder(0,P+4.2,1.2,7.8,8.4,'brick',undefined,8);
  jjCylinder(0,P+4.2,1.2,7.92,.36,'brickYellow',undefined,8);
  jjCylinder(0,P+8.55,1.2,8.2,.36,'marble',undefined,8);
  jjHouseBlock(-7.6,7.6,-11.6,-5.8,P,P+5.2,'brickYellow',{cap:'marble'});
  for(const x of [-4.2,0,4.2])jjPut('jj_box_jjElectricGlow',JJGEO.box,JMAT.jjElectricGlow,x,P+2.8,-11.65,1.1,1.6,.12);
  // cast Ardent-bronze azimuth ring + rotating verdigris/slate dome + protruding brass-and-emerald refractor tube!
  const dy=P+8.8;
  jjCylinder(0,dy+.35,1.2,7.4,.7,'verdigris',undefined,32);
  jjCylinder(0,dy+.75,1.2,7.55,.18,'gold',undefined,32);
  jjDome(0,dy+.85,1.2,7.2,{kind:'slate',shape:'hemi',ribs:true});
  jjBox(0,dy+4.2,5.2,1.9,4.8,5.6,'dark');
  jjBeam([0,dy+2.4,1.2],[0,dy+6.8,9.4],.52,'gold',undefined,32);
  jjBeam([0,dy+6.8,9.4],[0,dy+7.05,9.85],.58,'verdigris',undefined,32);
  for(const sx of [-1,1])jjCivChhatri(sx*9.8,P,9.4,1.35);
  jjHouseDoor(0,P,8.9,2.2,3.6,0,{arch:true,lamps:true});}

/* 2. TWO-FACED TEMPLE OF THE WEEK (jj_temple_week, 56 x 44 x 32 m) */
// West half (-x): blinding white Cut-marble & alabaster; East half (+x): vitrified near-black clinker brickDark!
function buildJjCelTempleWeek(jjG,jjO){reseed(9705+(jjO.v|0));
  const P=2.8,H=9.6;
  // split podium & split sanctuary block along x = 0!
  jjHouseBlock(-26.8,0,-20.8,20.8,0,P,'marble',{bands:[P*.5],bandMat:'brickYellow',cap:'marble'});
  jjHouseBlock(0,26.8,-20.8,20.8,0,P,'brickDark',{bands:[P*.5],bandMat:'brick',cap:'marble'});
  jjCivStairs(-28.0,0,0,8.0,2.4,P,8,-Math.PI/2);
  jjCivStairs(28.0,0,0,8.0,2.4,P,8,Math.PI/2);
  jjHouseBlock(-21.0,0,-14.0,14.0,P,P+H,'marble',{bands:[P+4.8],bandMat:'brickYellow',cap:'marble'});
  jjHouseBlock(0,21.0,-14.0,14.0,P,P+H,'brickDark',{bands:[P+4.8],bandMat:'brickDeep',cap:'marble'});
  // West Bright-Half Marble Portal (-x) vs East Dark-Half Clinker Portal (+x)
  jjHospBay(-22.2,P,0,10.6,H+3.4,4.8,4.2,-Math.PI/2,{depth:2.4,mat:'marble',trim:'brickYellow'});
  jjHospBay(22.2,P,0,10.6,H+3.4,4.8,4.2,Math.PI/2,{depth:2.4,mat:'brickDark',trim:'marble'});
  // Seven Weekday Law-Chambers projecting along north & south flanks
  for(let i=0;i<4;i++){
    const cx=-15.0+i*10.0,m=cx<0?'marble':'brickDark';
    jjHouseBlock(cx-3.8,cx+3.8,14.0,18.4,P,P+5.6,m,{cap:'marble'});
    jjCylinder(cx,P+6.1,16.2,2.0,.8,m,undefined,20);jjDome(cx,P+6.5,16.2,1.95,{kind:cx<0?'gold':'slate',shape:'hemi'});}
  for(let i=0;i<3;i++){
    const cx=-12.0+i*12.0,m=cx<0?'marble':'brickDark';
    jjHouseBlock(cx-4.0,cx+4.0,-18.4,-14.0,P,P+5.6,m,{cap:'marble'});
    jjCylinder(cx,P+6.1,-16.2,2.0,.8,m,undefined,20);jjDome(cx,P+6.5,-16.2,1.95,{kind:cx<0?'gold':'slate',shape:'hemi'});}
  // central Albedo-Split Rotunda Drum & Twin-Toned Dome Crown
  const top=P+H+.2;
  jjCylinder(-1.6,top+2.0,0,5.2,4.0,'marble',undefined,32);
  jjCylinder(1.6,top+2.0,0,5.2,4.0,'brickDark',undefined,32);
  jjDome(-1.4,top+4.1,0,5.2,{kind:'gold',shape:'onion'});
  jjDome(1.4,top+4.1,0,5.15,{kind:'slate',shape:'onion'});
  for(const sx of [-1,1])for(const sz of [-1,1])jjSpire(sx*19.2,top,sz*12.2,1.9,3,{stageH:3.6,kind:sx<0?'gold':'slate',pattern:sx<0?'diamond':'chevron'});}

/* 3. 13-TIER TEMPLE OF THE THIRTEEN & TAR-SEA MIRROR POOL (jj_temple_thirteen, 64 x 84 x 42 m) */
function buildJjCelTempleThirteen(jjG,jjO){reseed(9710+(jjO.v|0));
  const P=2.6;
  jjTemplePodium(0,0,0,60.0,80.0,P,8.4);
  jjTempleFlight(0,0,40.0,12.0,6.0,P,14);
  // East/Front (+z): elongated 34 x 14 m Black-Clinker "Tar Sea" Mirror Pool + 13 Day-Station Niches!
  jjBox(0,P+.32,16.0,15.6,.64,34.0,'brickDark');jjBox(0,P+.66,16.0,16.2,.12,34.6,'marble');
  jjBox(0,P+.58,16.0,14.0,.1,32.4,'water');
  jjHospRow(-22.0,P,14.0,35.0,7,4.8,2.8,2.2,Math.PI/2,{depth:1.6,mat:'brick',back:'dark'});
  jjHospRow(22.0,P,14.0,30.0,6,4.8,2.8,2.2,-Math.PI/2,{depth:1.6,mat:'brickYellow',back:'dark'});
  jjBox(-22.8,P+4.95,14.0,2.2,.3,35.4,'marble');jjBox(22.8,P+4.95,14.0,2.2,.3,30.4,'marble');
  // Almanac Blessing Mandapa + 13-Tier Stepped Brick Ziggurat Pyramid (-z)!
  jjHouseBlock(-13.0,13.0,-10.0,0.0,P,P+8.2,'brickYellow',{bands:[P+4.2],bandMat:'marble',cap:'marble'});
  jjDome(0,P+8.4,-5.0,5.2,{kind:'gold',shape:'hemi',ribs:true});
  let yy=P;
  for(let t=0;t<13;t++){
    const f=1-t/15.2,tw=30.0*f,td=28.0*f,th=2.55-t*.06,m=t%2?'brickYellow':'brick';
    jjBox(0,yy+th/2,-21.0,tw,th,td,m);
    jjBox(0,yy+th-.1, -21.0,tw+.45,.2,td+.45,'marble');
    yy+=th;}
  jjDome(0,yy+.2,-21.0,2.8,{kind:'gold',shape:'onion'});
  jjHospBay(0,P,38.4,12.0,12.5,5.2,4.4,0,{depth:2.4,mat:'brickYellow'});}

/* 4. OCTAGONAL DIAL-TEMPLE OF COMPANION & 13-HOUR BELL TOWER (jj_temple_companion, 42 x 48 x 36 m) */
function buildJjCelTempleCompanion(jjG,jjO){reseed(9715+(jjO.v|0));
  const P=2.2,H=10.4;
  jjCivPlinth(0,0,0,40.0,P,45.6);jjCivStairs(0,0,23.8,9.6,2.8,P,8,0);
  // octagonal rotunda centred at (x = -3, z = 0)
  jjCylinder(-3.0,P+H/2,0,12.8,H,'brick',undefined,8);
  for(const y of [P+1.0,P+5.4,P+H-.2])jjCylinder(-3.0,y,0,13.1,.32,y>P+9?'marble':'brickYellow',undefined,8);
  jjCylinder(-3.0,P+H+1.8,0,9.4,3.4,'brickYellow',undefined,16);
  jjDome(-3.0,P+H+3.6,0,9.2,{kind:'gold',shape:'hemi',ribs:true});
  // Fixed Alt +56.1 deg North Oculus Sighting Tube piercing the dome!
  const altR=56.1*Math.PI/180;
  jjBeam([-3.0,P+H+6.2,-2.2],[-3.0,P+H+6.2+Math.sin(altR)*7.5,-2.2-Math.cos(altR)*7.5],1.05,'marble',undefined,24);
  jjBeam([-3.0,P+H+6.2,-2.2],[-3.0,P+H+6.2+Math.sin(altR)*7.8,-2.2-Math.cos(altR)*7.8],.82,'gold',undefined,24);
  // 13-Hour Water-Escapement Bell Tower on +x flank (36 m high!)
  const bx=13.6,bz=-6.0;
  jjMilTower(bx,P,bz,3.8,{stages:[12.0,9.0,6.5],taper:.88,mat:'brick',cap:'gold',shape:'onion',crenel:true});
  jjPut('jjciv_bell',new THREE.CylinderGeometry(.35,.78,1.2,16),JMAT.gold,bx,P+25.2,bz,1,1,1);
  // South entrance porch
  jjHouseColonnade(-3.0,P,14.8,3,3.6,3.4,1.6,0,{r:.3,patterns:['spiral','diamond'],mat:'brickYellow',trimMat:'marble'});}

/* 5. PENDULUM FAN-TEMPLE OF DAY (jj_temple_day, 58 x 52 x 29 m) */
function buildJjCelTempleDay(jjG,jjO){reseed(9720+(jjO.v|0));
  const P=1.8;
  jjCivPlinth(0,0,0,55.6,P,49.6,{mat:'brickDark'});jjCivStairs(0,0,-25.6,9.2,2.4,P,7,Math.PI);
  // Sanctuary of the Sacred Kiln-Hearth on -z + 61.3-degree Radial Fan Court opening toward +z!
  jjHouseBlock(-11.0,11.0,-22.0,-8.0,P,P+8.6,'brickDeep',{bands:[P+4.4],bandMat:'brickYellow',cap:'marble'});
  jjDome(0,P+8.8,-15.0,4.8,{kind:'terracotta',shape:'ribbed'});
  jjChimneyStack(0,P+8.8,-20.2,{n:6,h:4.2,r:.36,seed:2,relief:true});
  // radial inlaid brick pendulum arcs in the court
  for(const r of [9.0,16.0,23.0])jjCylinder(0,P+.08,-6.0,r,.12,r===16?'brickYellow':'marble',undefined,32);
  // Twin Turnaround Brazier Pylons (29 m) at +-30.6 deg + Central Giant-Transit Sighting Arch on +z!
  for(const s of [-1,1]){
    const px=s*19.5,pz=16.5;
    jjMilTower(px,P,pz,3.6,{stages:[11.5,8.0],taper:.86,mat:'brickDeep',cap:'none',crenel:true});
    jjCylinder(px,P+20.6,pz,1.8,1.2,'gold',undefined,20);
    jjPut('jj_cel_brazier_glow',JJGEO.sphere,JMAT.glow,px,P+22.0,pz,1.45,1.45,1.45);}
  jjHospBay(0,P,21.5,11.6,13.6,5.2,4.4,0,{depth:2.2,mat:'brickYellow'});
  jjDome(0,P+14.0,21.5,2.2,{kind:'gold',shape:'onion'});}

/* 6. ALABASTER OCCULTATION-TEMPLE OF TWO-DAY (jj_temple_twoday, 48 x 54 x 24 m) */
function buildJjCelTempleTwoDay(jjG,jjO){reseed(9725+(jjO.v|0));
  const P=1.2,H=5.8;
  jjCivPlinth(0,0,0,46.0,P,52.0);
  // Sunken Occultation Pool in centre + Dual-Path Alabaster-Jali Whispering Galleries left & right!
  jjBox(0,P+.2,0,12.0,.4,22.0,'marble');jjBox(0,P+.32,0,10.4,.12,20.4,'water');
  for(const s of [-1,1]){
    jjHouseBlock(s*8.0,s*21.5,-22.0,18.0,P,P+H,'ochre',{bands:[P+3.0],bandMat:'marble',cap:'marble'});
    for(const z of [-15.0,-5.0,5.0,13.0]){
      jjPalJali(s*7.92,P+2.6,z,4.2,3.2,.32);
      jjCylinder(s*14.6,P+H+.6,z,2.1,1.0,'marble',undefined,20);
      jjDome(s*14.6,P+H+1.1,z,2.05,{kind:'slate',shape:'ribbed'});}}
  // Front (+z): Twin Razor-Edged White-Marble Giant-Limb Occultation Slit Wall!
  jjHouseBlock(-21.5,21.5,18.0,23.5,P,P+10.5,'marble',{bands:[P+5.2],bandMat:'brickDark',cap:'marble'});
  for(const s of [-1,1])jjBox(s*6.2,P+5.4,20.75,.55,8.4,5.8,'dark');
  jjDome(0,P+10.8,20.75,4.2,{kind:'slate',shape:'onion'});
  // Rear (-z): Public Whispering Gate
  jjHospBay(0,P,-23.5,9.6,8.8,3.8,3.2,Math.PI,{depth:1.8,mat:'brickYellow'});}

/* 7. FOUR-BASIN LOTUS-TANK TEMPLE OF FOUR-DAY (jj_temple_fourday, 68 x 68 x 28 m) */
function buildJjCelTempleFourDay(jjG,jjO){reseed(9730+(jjO.v|0));
  // Outer stepped red-brick kulam rim + full water sheet + 4 cardinal causeways to Cruciform Island Sanctuary!
  jjBox(0,.5,0,66.0,1.0,66.0,'brickDeep');jjBox(0,1.06,0,66.4,.14,66.4,'marble');
  jjBox(0,.78,0,58.0,.14,58.0,'water');
  for(let k=1;k<=3;k++){const w=58.0+k*2.2;jjHospRing4(0,0,w,w,.25*k,.28,.55,k===2?'brickYellow':'brick');}
  // 4 cardinal causeways
  jjBox(0,1.15,0,6.4,.5,64.0,'marble');jjBox(0,1.15,0,64.0,.5,6.4,'marble');
  // Central 20 x 20 m Cruciform Island Sanctuary
  jjHouseBlock(-9.6,9.6,-9.6,9.6,1.2,10.2,'brick',{bands:[5.6],bandMat:'marble',cap:'marble'});
  for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2])jjHospBay(Math.sin(a)*10.2,1.2,Math.cos(a)*10.2,7.6,9.4,3.4,2.8,a,{depth:1.4,mat:'brickYellow'});
  jjCylinder(0,12.0,0,5.2,3.2,'brickYellow',undefined,32);jjDome(0,13.6,0,5.2,{kind:'gold',shape:'onion'});
  // 4 Corner Humoral Bath Pavilions on the rim (slate, terracotta, gold, verdigris)
  const kinds=['slate','terracotta','gold','slate'];
  let idx=0;
  for(const sx of [-1,1])for(const sz of [-1,1]){
    const px=sx*26.5,pz=sz*26.5;
    jjHouseBlock(px-4.8,px+4.8,pz-4.8,pz+4.8,1.1,6.2,'brickYellow',{cap:'marble'});
    jjDome(px,6.4,pz,3.2,{kind:kinds[idx++],shape:'hemi'});}}

/* 8-13. THE FIVE PLANETARY SHRINES + UNCOUNTED WANDERER CIRCLE (row 'Shrines') */
function buildJjCelShrineVeil(jjG,jjO){reseed(9735+(jjO.v|0));
  jjCivPlinth(0,0,0,23.2,1.2,19.2);jjCivStairs(0,0,10.2,5.6,1.8,1.2,5,0);
  jjHouseBlock(-6.8,6.8,-7.2,6.4,1.2,9.2,'marble',{bands:[5.2],bandMat:'brickYellow',cap:'marble'});
  for(const s of [-1,1])jjWithYaw(s*7.8,1.2,2.4,s*0.87,()=>{jjHouseColonnade(s*7.8,1.2,2.4,2,2.8,3.2,1.4,0,{r:.24,patterns:['diamond'],mat:'brickYellow',trimMat:'marble'});});
  jjDome(0,9.5,-.4,4.4,{kind:'gold',shape:'onion'});}

function buildJjCelShrineCrown(jjG,jjO){reseed(9740+(jjO.v|0));
  jjCivPlinth(0,0,0,21.2,1.5,21.2);jjCivStairs(0,0,11.2,5.8,2.0,1.5,6,0);
  jjCylinder(0,1.5+4.6,0,7.6,9.2,'brickYellow',undefined,8);
  jjCylinder(0,1.5+9.4,0,7.9,.32,'marble',undefined,8);
  jjDome(0,11.1,0,6.2,{kind:'gold',shape:'onion'});
  jjHospBay(0,1.5,8.0,6.4,8.2,2.8,2.4,0,{depth:1.2,mat:'brick'});}

function buildJjCelShrineRustCinder(jjG,jjO){reseed(9745+(jjO.v|0));
  jjCivPlinth(0,0,0,25.2,1.1,17.2,{mat:'brickDark'});jjCivStairs(0,0,9.2,6.0,1.8,1.1,5,0);
  // Larger red Rust sanctuary (-x) + smaller dark-clinker Cinder sanctuary (+x) separated by eyesight-trial slit!
  jjHouseBlock(-11.2,-0.6,-6.8,6.8,1.1,8.8,'brick',{cap:'marble'});
  jjDome(-5.9,9.0,0,4.4,{kind:'terracotta',shape:'ribbed'});
  jjHouseBlock(0.6,9.8,-5.4,5.4,1.1,7.2,'brickDark',{cap:'marble'});
  jjDome(5.2,7.4,0,2.8,{kind:'slate',shape:'hemi'});}

function buildJjCelShrineAsh(jjG,jjO){reseed(9750+(jjO.v|0));
  jjCivPlinth(0,0,0,15.4,1.0,15.4,{mat:'brickDark'});
  jjHouseBlock(-6.6,6.6,-6.6,6.6,1.0,9.6,'brickDark',{bands:[5.2],bandMat:'brickDeep',cap:'marble'});
  jjBox(0,5.8,6.62,.38,5.6,.2,'glow'); // single razor twilight slit
  jjDome(0,9.8,0,3.8,{kind:'slate',shape:'hemi'});}

function buildJjCelShrineFrost(jjG,jjO){reseed(9755+(jjO.v|0));
  jjCivPlinth(0,0,0,19.4,1.2,19.4);jjCivStairs(0,0,10.2,5.2,1.8,1.2,5,0);
  jjHouseColonnade(0,1.2,6.8,3,4.2,3.6,1.6,0,{r:.28,patterns:['spiral','ogee'],mat:'verdigris',trimMat:'marble'});
  jjHouseBlock(-7.2,7.2,-7.2,6.6,1.2,8.4,'cream',{bands:[4.8],bandMat:'verdigris',cap:'marble'});
  jjCylinder(0,9.4,0,4.6,1.8,'verdigris',undefined,24);jjDome(0,10.4,0,4.5,{kind:'slate',shape:'onion'});}

function buildJjCelShrineWanderer(jjG,jjO){reseed(9760+(jjO.v|0));
  // Intentionally UNROOFED ring of 13 rough unmortared standing stones around an uncarved flagstone
  jjCylinder(0,.18,0,11.2,.36,'jjMilSand',undefined,32);
  jjCylinder(0,.42,0,2.6,.18,'jjMilRock',undefined,16);
  for(let i=0;i<13;i++){
    const a=i*TAU/13,r=9.2,h=2.4+(i%3)*.55;
    jjBox(Math.cos(a)*r,h/2+.2,Math.sin(a)*r,1.15,h,.75,'jjMilRock',undefined,-a);}}

/* 14. ORDER OF HISTORIANS SMALL CHAPTERHOUSE (jj_order_chapterhouse, 48 x 42 x 22 m) */
function buildJjCelOrderChapterhouse(jjG,jjO){reseed(9765+(jjO.v|0));
  const P=.8;
  jjCivPlinth(0,0,0,46.8,P,40.8);jjCivStairs(0,0,21.2,7.2,1.8,P,5,0);
  // Walled compound with saturated Cobalt-Blue Order mosaic string course!
  for(const s of [-1,1]){
    jjHouseBlock(s*15.5,s*22.6,-19.6,19.6,P,P+6.8,'brick',{cap:'marble'});
    jjPut('jj_box_jjOrderBlue',JJGEO.box,JMAT.jjOrderBlue,s*19.05,P+5.4,0,7.25,.34,39.3);}
  jjHouseBlock(-15.5,15.5,-19.6,-12.8,P,P+7.4,'brick',{cap:'marble'});
  jjPut('jj_box_jjOrderBlue',JJGEO.box,JMAT.jjOrderBlue,0,P+5.8,-16.2,31.2,.34,6.9);
  // Parabolic Pylon Gate on +z front
  for(const s of [-1,1]){
    jjMilFrustum(s*5.2,P,18.2,2.6,10.8,.82,'brickYellow');
    jjPut('jj_box_jjOrderBlue',JJGEO.box,JMAT.jjOrderBlue,s*5.2,P+8.6,18.2,4.8,.36,4.8);}
  jjArch(0,P,18.2,6.2,8.4,0,{depth:2.6});
  // Central 19 m Round Drum Reading Hall under Conical Tile Roof & Electric Reading Oculus!
  jjCylinder(0,P+5.2,-2.2,9.2,10.4,'brick',undefined,32);
  jjPut('jj_cyl_blue',JJGEO.cyl32,JMAT.jjOrderBlue,0,P+9.2,-2.2,9.32,.38,9.32);
  jjMilFrustum(0,P+10.4,-2.2,9.6,5.2,.18,'tile');
  jjCylinder(0,P+16.2,-2.2,1.8,1.5,'jjElectricGlow',undefined,20);
  jjMilFrustum(0,P+17.0,-2.2,2.1,1.6,0,'tile');}

/* 15. DECAYED IZANI GOVERNOR'S HOUSE — SID'KIN-PALU (jj_izani_gov_ruin, 70 x 56 x 24 m) */
// Canonical VASSAL-KITS s.3 7-pavilion praetorium in Iziz-orange stucco disrepair & adaptive reuse!
function buildJjCelIzaniGovRuin(jjG,jjO){reseed(9770+(jjO.v|0));
  const T=1.2;
  // Cracked 1.2 m podium + walled forecourt (+z = front, -z = rear)
  jjBox(0,T/2,-4.0,54.0,T,46.0,'brickDeep');jjBox(0,T-.08,-4.0,54.4,.16,46.4,'marble');
  // Defaced Izani Sun Gate at +z = 26.5 (Iziz orange portal over-painted with Three Wheels)
  jjPut('jj_box_jjIzizOrange',JJGEO.box,JMAT.jjIzizOrange,0,3.2,26.2,10.4,6.4,2.8);
  jjBox(0,1.9,26.2,3.6,3.8,3.0,'dark');
  for(const s of [-1.2,0,1.2])jjCylinder(s,5.1,27.65,.55,.12,'brick',undefined,16);
  // Forecourt rag-paper pulp vats & drying racks (z = 12..23)
  jjWorkVat(-11.0,.1,17.5,4.2,2.8,0xe8e2d2);jjWorkVat(-5.5,.1,17.5,4.2,2.8,0xe8e2d2);
  for(const x of [6.0,11.5])for(const z of [15.5,20.5]){
    jjBeam([x-1.8,0,z],[x-1.8,2.4,z],.08,'wood');jjBeam([x+1.8,0,z],[x+1.8,2.4,z],.08,'wood');
    jjShopBlock(x,1.3,z,3.4,1.6,.06,0xf4eedc);}
  // Main Hall Block (x = -18..18, z = -20..8): weathered brick & peeling Iziz-orange patches
  jjHouseBlock(-18.0,18.0,-20.0,8.0,T,T+5.5,'brick',{cap:'marble'});
  jjPut('jj_box_jjIzizOrange',JJGEO.box,JMAT.jjIzizOrange,-9.0,T+3.2,8.08,14.0,3.8,.12);
  jjPut('jj_box_jjIzizOrange',JJGEO.box,JMAT.jjIzizOrange,10.0,T+2.6,8.08,11.0,2.8,.12);
  // FALLEN CENTRAL AUDIENCE DOME (z = -6): jagged broken drum ring OPEN TO THE SKY!
  for(let i=0;i<16;i++){
    const a=i*TAU/16,r=6.8,bh=2.2+(i*7%5)*.65;
    jjBox(Math.cos(a)*r,T+5.5+bh/2,-6.0+Math.sin(a)*r,2.5,bh,.75,i%3===0?'brickDeep':'ochre',undefined,-a);}
  // INTACT NW PAVILION (x = -18, z = 8): Dilihan Factors below + Electric-Lit Iron Republic Minder above!
  jjCylinder(-18.0,T+5.0,8.0,6.6,10.0,'cream',undefined,24);
  jjPut('jj_cyl_orange',JJGEO.cyl32,JMAT.jjIzizOrange,-18.0,T+5.2,8.0,6.72,.35,6.72);
  jjDome(-18.0,T+10.1,8.0,6.4,{kind:'slate',shape:'ribbed'});
  for(const a of [0,1.1,-1.1])jjPut('jj_box_jjElectricGlow',JJGEO.box,JMAT.jjElectricGlow,-18.0+Math.sin(a)*6.65,T+7.6,8.0+Math.cos(a)*6.65,.95,1.5,.15);
  // Half-ruined / roofless SW, flank & rear pavilions + soot-blackened round Ink-Kitchen (-z = -24)
  jjCylinder(18.0,T+3.2,8.0,6.6,6.4,'ochre',undefined,24); // roofless SW council drum
  jjCylinder(-21.5,T+2.8,-6.0,3.5,5.6,'brick',undefined,20);jjDome(-21.5,T+5.7,-6.0,3.3,{kind:'terracotta',shape:'hemi'});
  jjCylinder(21.5,T+1.9,-6.0,3.5,3.8,'brickDeep',undefined,20); // collapsed shrine stump
  jjCylinder(-18.0,T+2.4,-20.0,4.8,4.8,'brickDeep',undefined,20);
  jjCylinder(18.0,T+2.1,-20.0,4.8,4.2,'ochre',undefined,20);
  jjCylinder(6.0,T+2.8,-24.5,3.5,5.6,'brickDark',undefined,20);jjDome(6.0,T+5.7,-24.5,3.4,{kind:'terracotta',shape:'hemi'});
  jjChimneyStack(6.0,T+5.7,-26.5,{n:2,h:2.8,r:.32,seed:3});}

/* 16. WHITE-PASS TRANS-RIM FACTOR COMPOUND (jj_whitepass_compound, 52 x 46 x 19 m) */
// Dedicated walled khan inside White-Pass North Gate for Khaayken Yeti caravans & Yonni/Rian scholars!
function buildJjCelWhitePassCompound(jjG,jjO){reseed(9775+(jjO.v|0));
  const P=.65,H=7.8;
  jjCivPlinth(0,0,0,50.8,P,44.8);
  // four-sided fortified brick-and-marble compound round pack-beast & assay court
  for(const s of [-1,1]){
    jjHouseBlock(s*18.8,s*24.8,-21.8,21.8,P,P+H,'brick',{bands:[P+4.0],bandMat:'brickYellow',cap:'marble'});
    jjHospRow(s*18.6,P,0,30.0,7,4.0,2.8,2.2,-s*Math.PI/2,{depth:.6,mat:'brickYellow'});}
  jjHouseBlock(-18.8,18.8,-21.8,-15.2,P,P+H+1.6,'brick',{bands:[P+4.2],bandMat:'marble',cap:'marble'});
  jjHouseBlock(-24.8,-6.0,16.4,21.8,P,P+H,'brickYellow',{cap:'marble'});
  jjHouseBlock(6.0,24.8,16.4,21.8,P,P+H,'brickYellow',{cap:'marble'});
  // North/Front White-Pass Pishtaq Gate (+z) + Rear Envoy & Scholar Reception Dome (-z)
  jjHospBay(0,P,19.4,12.0,12.8,5.2,4.2,0,{depth:3.2,mat:'marble',trim:'brickYellow'});
  jjDome(0,P+13.1,19.4,3.2,{kind:'slate',shape:'onion'});
  jjCylinder(0,P+H+2.6,-18.5,4.8,2.0,'brickYellow',undefined,24);
  jjDome(0,P+H+3.7,-18.5,4.7,{kind:'gold',shape:'hemi',ribs:true});
  // Central Khaayken qiviut/salt assay kiosk & water troughs
  jjHouseChhatri(0,P,0,4.2,{n:8,dome:'slate',h:3.0});
  for(const s of [-1,1]){
    jjBox(s*11.0,P+.45,6.5,5.2,.8,1.0,'brickDeep');jjBox(s*11.0,P+.82,6.5,4.8,.08,.7,'water');
    jjShopSack(s*9.5,P,-7.5,.55,0xf0ece2);jjShopCrate(s*11.5,P,-7.5,1.15,.2);}}

/* ==== register all 16 celestial, shrine & landmark defs ==== */
JJ.def({key:'jj_rajas_eye',name:"The Raja's Eye observatory",family:'civic',row:'Civic',w:28.0,d:28.0,h:26.0,r:19.0,
  tags:{type:['civic','religious'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelRajasEye});
JJ.def({key:'jj_order_chapterhouse',name:'Order of Historians chapterhouse',family:'civic',row:'Civic',w:48.0,d:42.0,h:22.0,r:28.0,
  tags:{type:['civic','religious'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelOrderChapterhouse});
JJ.def({key:'jj_izani_gov_ruin',name:"Decayed Izani Governor's House",family:'civic',row:'Civic',w:70.0,d:56.0,h:24.0,r:39.0,
  tags:{type:['civic','multi-family dwelling'],wealth:'middle',state:'reclaimed',lit:true,role:'landmark'},build:buildJjCelIzaniGovRuin});
JJ.def({key:'jj_whitepass_compound',name:'White-Pass trans-rim factor compound',family:'hospitality',row:'Hospitality',w:52.0,d:46.0,h:19.0,r:31.0,
  tags:{type:['tavern/inn','market/shop','civic'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelWhitePassCompound});

JJ.def({key:'jj_shrine_veil',name:'Chapel of Veil (+-50 deg porches)',family:'sacred',row:'Shrines',w:24.0,d:20.0,h:18.0,r:15.0,
  tags:{type:['religious'],wealth:'civic',lit:true},build:buildJjCelShrineVeil});
JJ.def({key:'jj_shrine_crown',name:'Royal Shrine of Crown',family:'sacred',row:'Shrines',w:22.0,d:22.0,h:21.0,r:14.8,
  tags:{type:['religious'],wealth:'civic',lit:true},build:buildJjCelShrineCrown});
JJ.def({key:'jj_shrine_rust_cinder',name:'Twin Shrine of Rust & Cinder',family:'sacred',row:'Shrines',w:26.0,d:18.0,h:19.0,r:15.4,
  tags:{type:['religious'],wealth:'civic',lit:true},build:buildJjCelShrineRustCinder});
JJ.def({key:'jj_shrine_ash',name:'Twilight Cell of Ash',family:'sacred',row:'Shrines',w:16.0,d:16.0,h:14.0,r:11.0,
  tags:{type:['religious'],wealth:'civic',lit:true},build:buildJjCelShrineAsh});
JJ.def({key:'jj_shrine_frost',name:'Long-Reckoner Pavilion of Frost',family:'sacred',row:'Shrines',w:20.0,d:20.0,h:17.0,r:13.8,
  tags:{type:['religious'],wealth:'civic',lit:true},build:buildJjCelShrineFrost});
JJ.def({key:'jj_shrine_wanderer',name:'Uncounted Circle of the Wanderer',family:'sacred',row:'Shrines',w:24.0,d:24.0,h:4.5,r:13.5,
  tags:{type:['religious'],wealth:'poor',lit:false},build:buildJjCelShrineWanderer});

JJ.def({key:'jj_temple_week',name:'Two-Faced Temple of the Week',family:'sacred',row:'Temple',w:56.0,d:44.0,h:32.0,r:32.0,
  tags:{type:['religious','civic'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelTempleWeek});
JJ.def({key:'jj_temple_thirteen',name:'13-Tier Temple of the Thirteen',family:'sacred',row:'Temple',w:64.0,d:84.0,h:42.0,r:46.0,
  tags:{type:['religious'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelTempleThirteen});
JJ.def({key:'jj_temple_companion',name:'Octagonal Dial-Temple of Companion',family:'sacred',row:'Temple',w:42.0,d:48.0,h:36.0,r:28.0,
  tags:{type:['religious','civic'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelTempleCompanion});
JJ.def({key:'jj_temple_day',name:'Pendulum Fan-Temple of Day',family:'sacred',row:'Temple',w:58.0,d:52.0,h:29.0,r:34.0,
  tags:{type:['religious'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelTempleDay});
JJ.def({key:'jj_temple_twoday',name:'Alabaster Occultation-Temple of Two-Day',family:'sacred',row:'Temple',w:48.0,d:54.0,h:24.0,r:32.0,
  tags:{type:['religious'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelTempleTwoDay});
JJ.def({key:'jj_temple_fourday',name:'Four-Basin Lotus-Tank Temple of Four-Day',family:'sacred',row:'Temple',w:68.0,d:68.0,h:28.0,r:42.0,
  tags:{type:['religious','civic'],wealth:'civic',lit:true,role:'landmark'},build:buildJjCelTempleFourDay});
