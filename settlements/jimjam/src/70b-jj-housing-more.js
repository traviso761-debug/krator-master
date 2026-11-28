// Jimjam housing expansion (70b): nine additional houses (three poor, three middle, three rich)
// doubling the city's residential span to 18 distinct silhouettes, rooflines and floor plans for
// the 50,000-person Voth-scale metropolis. Uses the instanced jjHouse* helpers of 70-jj-housing.js.
// Seeds 9150-9199. Prefix: buildJjHouse... / jjHouseMore...

/* ==== POOR D: stepped cistern-court duplex ==== */
// Ochre-and-brick two-family courtyard pair sharing a sunken front rainwater kulam trough and timber shade pergola.
function buildJjHousePoorD(jjG,jjO){reseed(9150+(jjO.v|0));
  jjHouseBlock(-4.4,-.2,-4.0,1.2,0,5.8,'ochre',{base:.55,baseMat:'brickDeep',bands:[3.0],bandMat:'brick',cap:'brick'});
  jjHouseBlock(-.2,4.4,-4.0,.4,0,3.6,'brick',{base:.55,baseMat:'brickDeep',cap:'marble'});
  jjHouseParapet(-4.4,-.2,-4.0,1.2,5.96,{h:.75,mat:'brick',cope:'brickYellow'});
  jjHouseParapet(-.2,4.4,-4.0,.4,3.76,{h:.7,mat:'ochre',cope:'brick',gap:{side:'f',a:.4,b:1.6}});
  // low front yard wall + sunken rainwater cistern trough
  jjHouseWallRun(-4.4,1.2,-4.4,4.0,2.1,{mat:'ochre',cap:'brick',base:.4});
  jjHouseWallRun(4.4,.4,4.4,4.0,2.1,{mat:'brick',cap:'brickYellow',base:.4});
  jjHouseWallRun(-4.4,4.0,-1.1,4.0,2.1,{mat:'ochre',cap:'brick',base:.4});
  jjHouseWallRun(1.1,4.0,4.4,4.0,2.1,{mat:'brick',cap:'brickYellow',base:.4});
  jjBox(-2.2,.35,2.6,2.8,.7,1.8,'brickDeep');jjBox(-2.2,.72,2.6,3.0,.1,2.0,'marble');jjBox(-2.2,.66,2.6,2.3,.08,1.3,'water');
  // timber shade pergola over right yard + stair to lower roof
  for(const x of [.6,3.6])for(const z of [.9,3.4])jjBeam([x,0,z],[x,2.55,z],.08,'wood');
  for(let z=1.0;z<=3.4;z+=.6)jjBeam([.4,2.6,z],[3.8,2.6,z],.05,'wood');
  jjBox(2.1,2.68,2.15,3.2,.06,2.3,'canvas');
  jjHouseStair(1.0,0,1.6,1.0,2.2,3.76,12,0,{mat:'brick',tread:'brickYellow'});
  jjHouseDoor(-2.3,.55,1.2,1.05,2.1,0,{frame:'brickYellow'});
  jjHouseDoor(2.1,.55,.4,1.0,2.05,0,{frame:'marble'});
  jjHouseWin(-2.3,3.55,1.2,1.0,1.35,0,{frame:'brick',shutter:'terracotta'});
  jjHouseWin(-2.3,3.55,-4.0,.95,1.25,Math.PI,{frame:'brick'});
  jjHouseWin(2.1,1.3,-4.0,.95,1.2,Math.PI,{frame:'brickYellow'});
  jjChimneyStack(-3.4,5.96,-2.8,{n:1,h:1.8,r:.26,seed:2});}

/* ==== POOR E: three-storey alley tenement (chawl) ==== */
// Narrow 3-storey worker tenement for dense Day/Giant alleys: cantilevered timber galleries on two upper floors.
function buildJjHousePoorE(jjG,jjO){reseed(9155+(jjO.v|0));
  const H1=3.3,H2=6.5,H3=9.6;
  jjHouseBlock(-3.5,3.5,-5.1,3.7,0,H1,'brickDeep',{cap:'brickYellow'});
  jjHouseBlock(-3.5,3.5,-5.1,3.7,H1,H2,'ochre',{bands:[H2-.15],bandMat:'brick'});
  jjHouseBlock(-3.5,3.5,-5.1,3.7,H2,H3,'brick',{cap:'marble'});
  jjHouseParapet(-3.5,3.5,-5.1,3.7,H3+.16,{h:.85,mat:'ochre',cope:'brick',merlon:1.2,merlonMat:'brickYellow'});
  // two cantilevered timber-and-tile access galleries across +z front
  for(const y of [H1,H2]){
    jjBox(0,y+.08,4.35,6.8,.16,1.3,'wood');
    for(let x=-2.8;x<=2.9;x+=1.4)jjBeam([x,y-.65,3.7],[x,y,4.85],.07,'wood');
    for(const x of [-3.2,0,3.2])jjBeam([x,y+.16,4.92],[x,y+1.0,4.92],.06,'wood');
    jjBox(0,y+.98,4.92,6.6,.08,.1,'wood');jjBox(0,y+.52,4.92,6.5,.45,.05,'terracotta');
    for(const x of [-1.8,1.8])jjHouseDoor(x,y+.16,3.7,.95,2.05,0,{frame:'brickYellow'});}
  jjHouseBoxQ(0,H3+.35,4.45,7.1,.1,1.65,'tile',qEuler(.28,0,0));
  jjHouseDoor(-1.8,0,3.7,1.1,2.2,0,{frame:'marble'});
  jjHouseWin(1.6,1.0,3.7,1.2,1.3,0,{frame:'brickYellow',bars:true});
  for(const s of [-1,1])for(const y of [1.1,H1+.95,H2+.95])jjHouseWin(s*3.5,y,-.7,1.0,1.3,s*Math.PI/2,{frame:'brickYellow'});
  for(const x of [-1.8,1.8])for(const y of [H1+.95,H2+.95])jjHouseWin(x,y,-5.1,.95,1.25,Math.PI,{frame:'brickYellow'});
  jjChimneyStack(2.4,H3+.16,-3.8,{n:2,h:2.1,r:.28,seed:4});}

/* ==== POOR F: twin-vault potter's yard house ==== */
// Two lime/terracotta barrel vaults side by side behind a low brick work-yard with stacked jars and an outside stair.
function buildJjHousePoorF(jjG,jjO){reseed(9160+(jjO.v|0));
  jjHouseBlock(-4.6,0,-4.4,1.0,0,3.4,'brick',{base:.5,baseMat:'brickDeep',cap:'brickYellow'});
  jjHouseBlock(0,4.6,-4.4,.4,0,3.9,'ochre',{base:.5,baseMat:'brickDeep',cap:'marble'});
  jjHouseBarrel(-2.3,3.56,-1.7,4.5,5.3,1.25,0,'terracotta');
  jjHouseBarrel(2.3,4.06,-2.0,4.5,4.7,1.3,0,'cream');
  // front craft yard
  jjHouseWallRun(-4.6,1.0,-4.6,4.4,1.8,{mat:'brick',cap:'marble'});
  jjHouseWallRun(4.6,.4,4.6,4.4,1.8,{mat:'brick',cap:'marble'});
  jjHouseWallRun(-4.6,4.4,-1.0,4.4,1.8,{mat:'brick',cap:'marble',merlon:1.1,merlonMat:'brickYellow'});
  jjHouseWallRun(1.0,4.4,4.6,4.4,1.8,{mat:'brick',cap:'marble',merlon:1.1,merlonMat:'brickYellow'});
  jjHouseDoor(-2.3,.5,1.0,1.05,2.1,0,{frame:'marble'});
  jjHouseDoor(2.3,.5,.4,1.05,2.1,0,{frame:'brickYellow'});
  jjHouseWin(-2.3,1.2,-4.4,1.0,1.2,Math.PI,{frame:'marble'});
  jjHouseWin(2.3,1.3,-4.4,1.0,1.3,Math.PI,{frame:'brick'});
  // potter's jar stack & brick drying bench in yard
  jjBox(-3.2,.35,2.8,1.8,.7,1.0,'brickDeep');
  for(const [x,z,c] of [[-3.5,2.8,0xb85338],[-2.9,2.8,0xd4a856],[3.3,2.5,0xb85338],[3.8,3.1,0x378d94]]){
    jjCylinder(x,.38,z,.28,.65,'terracotta',jjColor(c),16);}
  jjChimneyStack(3.4,4.0,-3.5,{n:1,h:2.0,r:.28,seed:1});}

/* ==== MID D: four-family gallery haveli-chawl ==== */
// U-shaped 3-storey multi-family court house with patterned-column loggia, twin jharokhas and slate corner domelets.
function buildJjHouseMidD(jjG,jjO){reseed(9165+(jjO.v|0));
  const P=.6,Y1=P+3.8,Y2=Y1+3.6,Y3=Y2+3.4;
  jjHouseBlock(-6.6,6.6,-6.2,6.2,0,P,'brickDeep',{cap:'marble'});
  jjHouseBlock(-6.5,6.5,-6.1,-.5,P,Y3,'brick',{bands:[Y1,Y2],bandMat:'brickYellow'});
  for(const s of [-1,1])jjHouseBlock(s*4.35,s*6.5,-.5,5.9,P,Y2,'brickYellow',{bands:[Y1],bandMat:'marble'});
  // central forecourt arcade & upper gallery
  jjHouseColonnade(0,P,-.5,3,2.7,2.55,1.25,0,{r:.24,patterns:['diamond','spiral','chevron'],mat:'brick',trimMat:'marble'});
  jjHouseColonnade(0,Y1,-.5,3,2.7,2.35,1.25,0,{r:.22,patterns:['fleur','diamond'],mat:'brickYellow',trimMat:'marble',rail:'marble'});
  jjHouseCornice(-6.5,6.5,-6.1,-.5,Y3,{});
  jjHouseParapet(-6.5,6.5,-6.1,-.5,Y3+.62,{h:.95,mat:'brick',cope:'marble',merlon:1.1,merlonMat:'brickYellow'});
  for(const s of [-1,1]){
    const x0=s<0?-6.5:4.35,x1=s<0?-4.35:6.5;
    jjHouseCornice(x0,x1,-.5,5.9,Y2,{});
    jjHouseParapet(x0,x1,-.5,5.9,Y2+.62,{h:.8,mat:'brick',cope:'marble'});
    jjHouseJharokha(s*5.42,Y1+.2,5.9,2.1,2.5,.95,0,{mat:'brickYellow',trim:'marble',roof:'dome',kind:'slate',glass:'glass'});
    jjHouseChhatri(s*5.2,Y3+.62,-3.4,2.1,{dome:'slate',h:2.1});
    jjHouseDoor(s*5.42,P,5.9,1.05,2.2,0,{arch:true,lamps:true});}
  jjHouseStair(0,0,6.2,3.4,1.2,P,4,0,{mat:'marble'});
  for(const x of [-4.6,-1.6,1.6,4.6]){
    jjHouseWin(x,Y2+.8,-.5,1.1,1.7,0,{arch:true,lit:true});
    for(const y of [P+1.0,Y1+.8,Y2+.8])jjHouseWin(x,y,-6.1,1.1,1.6,Math.PI,{lit:true});}
  for(const s of [-1,1])for(const z of [-3.6,1.8])for(const y of [P+1.0,Y1+.8])jjHouseWin(s*6.5,y,z,1.05,1.55,s*Math.PI/2,{lit:true});
  jjChimneyStack(-4.8,Y3+.62,-4.6,{n:3,h:2.8,r:.3,seed:2});
  jjChimneyStack(4.8,Y3+.62,-4.6,{n:2,h:2.5,r:.3,seed:5});}

/* ==== MID E: alabaster-jali breezeway townhouse ==== */
// Tailored for Two-Day & Four-Day wards: central vaulted dogtrot wind-passage, wide marble/alabaster jali screen, malqaf chhatri.
function buildJjHouseMidE(jjG,jjO){reseed(9170+(jjO.v|0));
  const P=.55,Y1=P+4.0,Y2=Y1+4.0,Y3=Y2+3.6;
  jjHouseBlock(-5.7,5.7,-5.5,5.5,0,P,'brickDeep',{cap:'marble'});
  for(const s of [-1,1])jjHouseBlock(s*1.9,s*5.6,-5.4,5.4,P,Y1,'brick',{bands:[P+2.1],bandMat:'brickYellow'});
  // vaulted dogtrot wind-passage through x in [-1.9, 1.9]
  jjHouseArchWall(0,P,5.15,3.8,4.0,[0],2.6,2.1,0,{d:.5,mat:'brickYellow',trimMat:'marble'});
  jjHouseArchWall(0,P,-5.15,3.8,4.0,[0],2.6,2.1,Math.PI,{d:.5,mat:'brickYellow',trimMat:'marble'});
  jjHouseBlock(-5.6,5.6,-5.4,5.4,Y1,Y3,'brickYellow',{bands:[Y2],bandMat:'marble'});
  const top=jjHouseCornice(-5.6,5.6,-5.4,5.4,Y3,{m1:'brick',m2:'marble',m3:'marble'});
  jjHouseParapet(-5.6,5.6,-5.4,5.4,top,{h:.9,mat:'brick',cope:'marble',merlon:1.15,merlonMat:'brickYellow'});
  // wide translucent alabaster/marble diamond jali screen across the piano nobile front
  jjPalJali(0,Y1+2.0,5.46,5.4,2.5,.34);
  for(const s of [-1,1]){
    jjHouseDoor(s*3.75,P,5.4,1.1,2.25,0,{arch:true,lamps:true});
    jjHouseWin(s*4.1,Y1+.95,5.4,1.15,1.8,0,{arch:true,lit:true,hood:'marble'});
    jjHousePorthole(s*3.6,Y2+1.8,5.42,0,.68,'marble');
    for(const z of [-3.0,3.0])for(const y of [P+1.0,Y1+.95,Y2+.9])jjHouseWin(s*5.6,y,z,1.1,1.6,s*Math.PI/2,{lit:true});}
  jjHouseWin(0,Y2+.95,5.4,1.4,1.8,0,{arch:true,lit:true});
  for(const x of [-3.6,0,3.6])for(const y of [Y1+.95,Y2+.9])jjHouseWin(x,y,-5.4,1.15,1.6,Math.PI,{lit:true});
  // rooftop malqaf wind-catcher pavilion + chimney
  jjHouseChhatri(0,top,0,3.0,{n:8,dome:'terracotta',shape:'onion',h:2.5});
  jjChimneyStack(-4.2,top,-3.8,{n:3,h:2.6,r:.28,seed:3});
  jjHouseStair(0,0,5.5,3.2,1.1,P,4,0,{mat:'marble'});}

/* ==== MID F: corner arcade & sundial notary house ==== */
// Wrap-around ground arcade (+z and +x), brass sundial medallion, octagonal corner bartizan & 4-flue Tudor chimney.
function buildJjHouseMidF(jjG,jjO){reseed(9175+(jjO.v|0));
  const P=.5,Y1=P+3.9,Y2=Y1+3.8,Y3=Y2+3.6;
  jjHouseBlock(-6.0,6.0,-4.9,4.9,0,P,'brickDeep',{cap:'marble'});
  jjHouseBlock(-5.9,3.5,-4.8,2.4,P,Y1,'brick',{});
  jjHouseColonnade(-.8,P,4.55,3,2.8,2.6,1.3,0,{r:.25,patterns:['spiral','diamond'],mat:'brick',trimMat:'marble'});
  jjHouseColonnade(5.55,P,-.4,2,2.8,2.6,1.3,Math.PI/2,{r:.25,patterns:['chevron','diamond'],mat:'brick',trimMat:'marble'});
  jjHouseBlock(-5.9,5.9,-4.8,4.8,Y1,Y3,'brick',{bands:[Y1+.12,Y2],bandMat:'brickYellow'});
  const top=jjHouseCornice(-5.9,5.9,-4.8,4.8,Y3,{});
  jjHouseParapet(-5.9,5.9,-4.8,4.8,top,{h:.9,mat:'brick',cope:'marble',merlon:1.1,merlonMat:'brickYellow'});
  // SE corner bartizan turret (+x, +z) with onion dome
  jjCylinder(5.75,Y1+(Y3-Y1)/2+1.0,4.65,1.35,Y3-Y1+2.2,'brickYellow',undefined,16);
  jjCylinder(5.75,top+1.35,4.65,1.5,.24,'marble',undefined,16);
  jjHouseOnion(5.75,top+1.48,4.65,1.32,2.7,'terracotta','gold');
  // brass wall-sundial medallion on upper front facade
  jjCylinder(-2.6,Y2+1.85,4.88,.85,.12,'marble',undefined,24);
  jjPut('jj_cyl_gold_32',JJGEO.cyl32,JMAT.gold,-2.6,Y2+1.85,4.95,.68,.08,.68,undefined,qEuler(Math.PI/2,0,0));
  jjBeam([-2.6,Y2+1.85,4.96],[-2.6,Y2+1.35,5.42],.04,'gold');
  jjHouseJharokha(1.4,Y1+.2,4.8,2.2,2.55,1.0,0,{mat:'brickYellow',trim:'marble',roof:'bangla',kind:'gold',glass:'glass'});
  for(const x of [-4.2,-1.4,2.8])jjHouseWin(x,Y2+.85,4.8,1.15,1.65,0,{arch:true,lit:true});
  jjHouseWin(-4.2,Y1+.85,4.8,1.15,1.65,0,{arch:true,lit:true});
  for(const z of [-2.6,1.6])for(const y of [Y1+.85,Y2+.85]){jjHouseWin(5.9,y,z,1.1,1.6,Math.PI/2,{lit:true});jjHouseWin(-5.9,y,z,1.1,1.6,-Math.PI/2,{lit:true});}
  jjHouseDoor(-.8,P,2.4,1.2,2.3,0,{arch:true,lamps:true});
  jjAwning(-.8,P+3.2,4.95,0,{w:4.2,d:1.3,drop:.45,h:2.3});
  jjChimneyStack(-3.8,top,-3.2,{n:4,h:3.1,r:.32,seed:1,relief:true});}

/* ==== RICH D: stepped lotus-tank villa (Kulam-Manai) ==== */
// Three-wing aristocratic compound embracing a genuine stepped marble-and-brick lotus water basin on +z.
function buildJjHouseRichD(jjG,jjO){reseed(9180+(jjO.v|0));
  const P=1.1,Y1=P+4.4,Y2=Y1+4.2;
  jjHouseBlock(-12.6,12.6,-10.6,10.6,0,P,'brickDeep',{bands:[P*.5],bandMat:'brickYellow',cap:'marble'});
  // sunken stepped lotus pool in front court (x in -5.2..5.2, z in 1.2..8.8)
  jjBox(0,P+.22,5.0,10.8,.44,8.0,'marble');jjBox(0,P+.26,5.0,9.6,.36,6.8,'brickYellow');jjBox(0,P+.34,5.0,8.6,.12,5.8,'water');
  for(const sx of [-1,1])for(const sz of [1.4,8.6]){jjBrickShaft(sx*5.0,P,sz,.32,3.4,{pattern:'spiral',cap:'star'});}
  // rear main range + two flanking pavilion wings
  jjHouseBlock(-12.2,12.2,-10.2,-.6,P,Y2,'brick',{bands:[Y1],bandMat:'marble'});
  for(const s of [-1,1])jjHouseBlock(s*6.8,s*12.2,-.6,9.2,P,Y2,'brickYellow',{bands:[Y1],bandMat:'marble'});
  jjHouseColonnade(0,P,-.5,4,2.8,2.9,1.4,0,{r:.28,patterns:['diamond','spiral','fleur','chevron'],mat:'brick',trimMat:'marble'});
  jjHouseColonnade(0,Y1,-.5,4,2.8,2.7,1.4,0,{r:.25,patterns:['ogee','diamond'],mat:'brickYellow',trimMat:'marble',rail:'marble'});
  const topM=jjHouseCornice(-12.2,12.2,-10.2,-.6,Y2,{});
  jjHouseParapet(-12.2,12.2,-10.2,-.6,topM,{h:1.0,mat:'brick',cope:'marble',merlon:1.2,merlonMat:'brickYellow'});
  for(const s of [-1,1]){
    const x0=s<0?-12.2:6.8,x1=s<0?-6.8:12.2,topW=jjHouseCornice(x0,x1,-.6,9.2,Y2,{});
    jjHouseParapet(x0,x1,-.6,9.2,topW,{h:.95,mat:'brick',cope:'marble'});
    jjHouseJharokha(s*9.5,Y1+.25,9.2,2.6,2.8,1.1,0,{mat:'marble',trim:'marble',roof:'onion',kind:'gold',glass:'glass'});
    jjHouseChhatri(s*9.5,topW,4.2,2.8,{n:6,dome:'slate',h:2.6});
    for(const z of [2.2,6.2])jjHouseWin(s*6.8,P+1.1,z,1.2,2.0,-s*Math.PI/2,{arch:true,lit:true});}
  // central slate-and-gold ribbed drum dome over main salon
  jjCylinder(0,topM+1.2,-5.4,4.2,2.4,'brickYellow',undefined,32);jjCylinder(0,topM+2.5,-5.4,4.45,.26,'marble',undefined,32);
  jjDome(0,topM+2.62,-5.4,4.2,{kind:'slate',shape:'ribbed'});
  jjHouseDoor(0,P,-.6,1.8,3.1,0,{arch:true,lamps:true,studs:true});
  for(const x of [-9.5,-4.5,4.5,9.5])for(const y of [P+1.1,Y1+.95])jjHouseWin(x,y,-10.2,1.3,2.0,Math.PI,{arch:true,lit:true});
  jjHouseStair(0,0,10.6,5.2,2.0,P,6,0,{mat:'marble',cheek:[-1,1],cheekMat:'brick'});
  jjChimneyStack(-9.5,topM,-7.8,{n:4,h:3.2,r:.32,seed:2,relief:true});}

/* ==== RICH E: Kauntavan master-astronomer's mansion ==== */
// Scholarly noble haveli with gold-rimmed porthole clerestory and rooftop octagonal meridian gnomon dome.
function buildJjHouseRichE(jjG,jjO){reseed(9185+(jjO.v|0));
  const P=1.2,Y1=P+4.5,Y2=Y1+4.4,Y3=Y2+4.0;
  jjHouseBlock(-10.6,10.6,-11.6,11.6,0,P,'brickDeep',{bands:[P*.55],bandMat:'marble',cap:'marble'});
  jjHouseBlock(-10.2,10.2,-11.2,8.4,P,Y2,'brick',{bands:[Y1],bandMat:'marble'});
  jjHouseBlock(-7.6,7.6,-9.4,5.6,Y2,Y3,'brickYellow',{cap:'marble'});
  jjHouseColonnade(0,P,8.45,5,3.2,3.0,1.45,0,{r:.3,patterns:['spiral','diamond','chevron','fleur'],mat:'brickYellow',trimMat:'marble'});
  const top2=jjHouseCornice(-10.2,10.2,-11.2,8.4,Y2,{}),top3=jjHouseCornice(-7.6,7.6,-9.4,5.6,Y3,{});
  jjHouseParapet(-10.2,10.2,-11.2,8.4,top2,{h:.95,mat:'brick',cope:'marble',merlon:1.2,merlonMat:'brickYellow'});
  jjHouseParapet(-7.6,7.6,-9.4,5.6,top3,{h:.9,mat:'brickYellow',cope:'marble'});
  // gold-rimmed porthole clerestory on storey 3 + twin jharokhas on storey 2
  for(const x of [-4.8,-1.6,1.6,4.8])jjHousePorthole(x,Y2+2.1,5.65,0,.78,'gold');
  for(const s of [-1,1]){
    jjHouseJharokha(s*6.4,Y1+.25,8.4,2.7,2.9,1.15,0,{mat:'brickYellow',trim:'marble',roof:'bangla',kind:'gold',glass:'glass'});
    jjHouseChhatri(s*8.6,top2,6.4,2.4,{dome:'gold',shape:'onion',h:2.3});}
  jjHouseWin(0,Y1+.95,8.4,1.8,2.4,0,{arch:true,lit:true,hood:'marble'});
  // rooftop octagonal meridian observatory dome + brass armillary ring
  jjCylinder(0,top3+1.4,-1.8,3.6,2.8,'brick',undefined,8);jjCylinder(0,top3+2.9,-1.8,3.85,.28,'marble',undefined,8);
  jjDome(0,top3+3.05,-1.8,3.5,{kind:'gold',shape:'hemi',ribs:true});
  jjCylinder(0,top3+.6,-7.2,1.1,1.2,'marble',undefined,16);
  jjPut('jj_cyl_gold_32',JJGEO.cyl32,JMAT.gold,0,top3+1.9,-7.2,1.1,.1,1.1,undefined,qEuler(.58,0,0));
  jjBeam([0,top3+1.2,-7.2],[0,top3+2.9,-6.4],.06,'gold');
  jjHouseDoor(0,P,8.4,1.9,3.2,0,{arch:true,lamps:true,studs:true});
  for(const s of [-1,1])for(const z of [-7.5,-1.5,4.2])for(const y of [P+1.1,Y1+1.0])jjHouseWin(s*10.2,y,z,1.3,2.0,s*Math.PI/2,{arch:true,lit:true});
  for(const x of [-6.4,0,6.4])for(const y of [P+1.1,Y1+1.0])jjHouseWin(x,y,-11.2,1.3,2.0,Math.PI,{arch:true,lit:true});
  jjHouseStair(0,0,11.6,5.6,2.2,P,6,0,{mat:'marble',cheek:[-1,1]});
  jjBanner(-9.2,Y2-.6,8.52,0,{w:1.2,h:3.8});jjBanner(9.2,Y2-.6,8.52,0,{w:1.2,h:3.8});
  jjChimneyStack(-8.6,top2,-8.8,{n:4,h:3.1,r:.32,seed:4,relief:true});}

/* ==== RICH F: twin-dome silk & caravan factor's haveli ==== */
// Monumental yellow-brick pishtaq carriage gate, symmetrical twin gold-ribbed domes, 5-flue chimney stack.
function buildJjHouseRichF(jjG,jjO){reseed(9190+(jjO.v|0));
  const P=1.0,Y1=P+4.4,Y2=Y1+4.3;
  jjHouseBlock(-11.6,11.6,-9.6,9.6,0,P,'brickDeep',{bands:[P*.5],bandMat:'brickYellow',cap:'marble'});
  jjHouseBlock(-11.2,11.2,-9.2,7.8,P,Y2,'brick',{bands:[Y1],bandMat:'brickYellow'});
  const top=jjHouseCornice(-11.2,11.2,-9.2,7.8,Y2,{});
  jjHouseParapet(-11.2,11.2,-9.2,7.8,top,{h:1.0,mat:'brick',cope:'marble',merlon:1.2,merlonMat:'brickYellow'});
  // central yellow-brick pishtaq portal
  jjHospBay(0,P,8.7,7.6,10.2,3.6,3.2,0,{depth:1.8,mat:'brickYellow'});
  jjBox(0,P+10.35,8.7,8.0,.3,2.2,'marble');jjCrenel(0,P+10.5,8.7,7.8,2.0,1.0,{});
  jjHouseDoor(0,P,7.8,2.2,3.4,0,{arch:true,lamps:true,studs:true});
  jjHousePorthole(0,P+7.8,9.62,0,.85,'gold');
  // symmetrical twin gold ribbed domes over dual reception salons + flanking jharokhas
  for(const s of [-1,1]){
    jjCylinder(s*6.2,top+1.1,-1.0,3.5,2.2,'brickYellow',undefined,32);
    jjCylinder(s*6.2,top+2.3,-1.0,3.7,.24,'marble',undefined,32);
    jjDome(s*6.2,top+2.42,-1.0,3.5,{kind:'gold',shape:'hemi',ribs:true});
    jjHouseJharokha(s*7.4,Y1+.25,7.8,2.8,2.85,1.1,0,{mat:'marble',trim:'marble',roof:'dome',kind:'gold',glass:'glass'});
    jjHouseWin(s*7.4,P+1.1,7.8,1.4,2.1,0,{arch:true,lit:true});
    for(const z of [-5.8,-.4,4.6])for(const y of [P+1.1,Y1+1.0])jjHouseWin(s*11.2,y,z,1.3,2.0,s*Math.PI/2,{arch:true,lit:true});}
  for(const x of [-7.4,-2.5,2.5,7.4])for(const y of [P+1.1,Y1+1.0])jjHouseWin(x,y,-9.2,1.3,2.0,Math.PI,{arch:true,lit:true});
  jjHouseStair(0,0,9.6,5.4,1.8,P,5,0,{mat:'marble',cheek:[-1,1],cheekMat:'brickYellow'});
  jjChimneyStack(0,top,-7.2,{n:5,h:3.4,r:.32,seed:3,relief:true});}

/* ==== register the nine additional housing varieties ==== */
JJ.def({key:'jj_house_poor_d',name:'Poor house D — cistern-court pair',family:'housing',row:'Housing — poor',w:9.2,d:8.6,h:9.6,r:6.2,
  tags:{type:['multi-family dwelling'],wealth:'poor',lit:false},build:buildJjHousePoorD});
JJ.def({key:'jj_house_poor_e',name:'Poor house E — three-storey alley chawl',family:'housing',row:'Housing — poor',w:7.4,d:10.8,h:11.4,r:6.4,
  tags:{type:['multi-family dwelling'],wealth:'poor',lit:false},build:buildJjHousePoorE});
JJ.def({key:'jj_house_poor_f',name:'Poor house F — twin-vault potter yard',family:'housing',row:'Housing — poor',w:9.6,d:9.2,h:7.6,r:6.5,
  tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:buildJjHousePoorF});

JJ.def({key:'jj_house_mid_d',name:'Middle house D — gallery haveli-chawl',family:'housing',row:'Housing — middle',w:13.6,d:12.8,h:16.4,r:9.2,
  tags:{type:['multi-family dwelling'],wealth:'middle',lit:true},build:buildJjHouseMidD});
JJ.def({key:'jj_house_mid_e',name:'Middle house E — alabaster-jali breezeway',family:'housing',row:'Housing — middle',w:11.8,d:11.4,h:17.8,r:8.2,
  tags:{type:['single-family dwelling'],wealth:'middle',lit:true},build:buildJjHouseMidE});
JJ.def({key:'jj_house_mid_f',name:'Middle house F — corner arcade & sundial',family:'housing',row:'Housing — middle',w:12.4,d:10.2,h:18.2,r:8.0,
  tags:{type:['single-family dwelling','market/shop'],wealth:'middle',lit:true},build:buildJjHouseMidF});

JJ.def({key:'jj_house_rich_d',name:'Rich house D — lotus-tank villa',family:'housing',row:'Housing — rich',w:26.0,d:22.0,h:20.5,r:16.8,
  tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:buildJjHouseRichD});
JJ.def({key:'jj_house_rich_e',name:'Rich house E — master-astronomer mansion',family:'housing',row:'Housing — rich',w:22.0,d:24.0,h:24.2,r:16.2,
  tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:buildJjHouseRichE});
JJ.def({key:'jj_house_rich_f',name:'Rich house F — twin-dome factor haveli',family:'housing',row:'Housing — rich',w:24.0,d:20.0,h:22.6,r:15.6,
  tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:buildJjHouseRichF});
