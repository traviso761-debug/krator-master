// Jimjam multi-stage simulation economy & hamlet works (73c): 10 trade, craft, financial,
// extractive and haulage buildings covering SIM.economy / SIM.items / SIM.money / 77-sim-6-build.js /
// KHAMLET.FOCI / TRADE-SCOPE.md (gypsum #1 natural export, whorl-olive lamp oil, fine ceramics,
// brass/iron tools, tailored garments/footwear, timber/cartwright, money-changers, clay pits,
// carter corrals, and saltpeter leaching).
// Seeds 9800-9849. Prefix: buildJjEcon... / jjEcon...

/* 1. IRON & BRASS HEARTH-FORGE (jj_smithy_brass, 16.4 x 14.2 m) */
// Forges farm/mason/shipwright tools, nails, brass lamps, astrolabes and dome finials from Cempu-malai copper & Ardent bronze/iron.
function buildJjEconSmithyBrass(jjG,jjO){reseed(9800+(jjO.v|0));
  jjBox(0,.22,0,16.0,.44,13.8,'brickDark');
  // enclosed brass-instrument & tool room on -x, open-arched anvil & twin-hearth smithy on +x
  jjHouseBlock(-7.6,.6,-6.5,5.2,.44,6.8,'brick',{bands:[3.8],bandMat:'brickYellow',cap:'marble'});
  jjHouseParapet(-7.6,.6,-6.5,5.2,6.96,{h:.8,mat:'brick',cope:'marble'});
  // open vaulted forge loggia on +x
  jjHouseBlock(.6,7.6,-6.5,-1.6,.44,5.6,'brickDeep',{cap:'marble'});
  jjHouseColonnade(4.1,.44,4.8,2,3.2,2.8,1.2,0,{r:.26,patterns:['chevron','diamond'],mat:'brickDeep',trimMat:'marble'});
  jjBox(4.1,4.6,1.6,7.2,.26,6.8,'brick');jjHouseBarrel(4.1,4.86,1.6,6.8,6.6,1.45,0,'tile');
  // glowing twin iron/brass hearths, anvil blocks, water quench trough & copper/bronze ingot stack
  for(const x of [2.4,5.8]){
    jjHospBay(x,.44,-1.45,2.4,2.2,1.2,1.0,0,{depth:.65,mat:'brickDark',back:'glow'});}
  jjBox(3.2,.85,1.8,.95,.8,.55,'iron');jjCylinder(5.2,.82,2.2,.42,.76,'wood',undefined,16);jjBox(5.2,1.28,2.2,.65,.18,.38,'iron');
  jjWorkVat(1.8,.44,4.0,2.1,1.0,0x2a5c6b);
  for(const z of [3.2,4.1])jjPut('jj_box_gold',JJGEO.box,JMAT.gold,6.4,.62,z,.95,.32,.48);
  jjChimneyStack(4.1,5.6,-4.2,{n:4,h:3.8,r:.34,seed:2,relief:true});
  jjHouseDoor(-3.5,.44,5.2,1.3,2.35,0,{arch:true});
  for(const x of [-5.8,-1.4])jjHouseWin(x,4.3,5.2,1.15,1.55,0,{arch:true,lit:true});}

/* 2. POTTER'S WHEEL & FINE-CERAMICS MUFFLE KILN (jj_pottery, 16.0 x 14.0 m) */
// Throws household cookpots, terracotta whorl-olive lamps and turquoise/ochre glazed export ceramics.
function buildJjEconPottery(jjG,jjO){reseed(9805+(jjO.v|0));
  jjCivPlinth(0,0,0,15.6,.4,13.6);
  // throwing & glazing gallery on -z + domed muffle kiln on +x/+z + shaded greenware drying racks on -x/+z
  jjHouseBlock(-7.4,7.4,-6.4,-.2,.4,6.4,'brickYellow',{bands:[3.6],bandMat:'brick',cap:'marble'});
  jjHouseColonnade(-2.2,.4,-.15,3,3.1,2.5,1.1,0,{r:.24,patterns:['spiral','ogee'],mat:'brick',trimMat:'marble'});
  jjHouseParapet(-7.4,7.4,-6.4,-.2,6.56,{h:.8,mat:'brickYellow',cope:'marble'});
  // fine-ceramics glazed muffle kiln on +x front
  jjCylinder(4.4,1.9,3.4,2.5,2.8,'brick',undefined,24);
  jjCylinder(4.4,2.2,3.4,2.58,.16,'turquoise',undefined,24);
  jjDome(4.4,3.3,3.4,2.45,{kind:'terracotta',shape:'onion'});
  jjHospBay(4.4,.4,5.7,1.9,1.8,.95,.85,0,{depth:.5,mat:'brickDark',back:'glow'});
  // potter's wheels, slip basin & turquoise/terracotta/ochre glazed vessels on drying tables
  for(const x of [-5.2,-2.2]){jjCylinder(x,.68,1.8,.55,.52,'marble',undefined,20);jjCylinder(x,.98,1.8,.42,.08,'wood',undefined,20);}
  jjBox(-3.6,.78,4.6,5.8,.75,1.3,'wood');
  for(const [x,c] of [[-5.6,0x3aa6a0],[-4.3,0xc4602f],[-3.0,0xe4b54a],[-1.7,0x3aa6a0]]){
    jjShopJar(x,.8,4.6,.92,c);}
  for(const x of [-4.8,0,4.8])jjHouseWin(x,4.2,-.2,1.1,1.5,0,{arch:true,lit:true});}

/* 3. WHORL-OLIVE & OILSEED LAMP-OIL MILL (jj_oil_press, 16.8 x 14.8 m) */
// Rotary stone edge-runner mill, heavy timber screw-beam press & amphora cellar supplying Jimjam's traditional lamp oil.
function buildJjEconOilPress(jjG,jjO){reseed(9810+(jjO.v|0));
  jjCivPlinth(0,0,0,16.4,.45,14.4);
  // cool thick-walled amphora oil-cellar on -z + open rotary-mill pavilion on +z
  jjHouseBlock(-7.8,7.8,-6.8,-.6,.45,6.6,'ochre',{base:.65,baseMat:'brickDeep',bands:[3.7],bandMat:'brick',cap:'marble'});
  jjHouseBarrel(0,6.76,-3.7,15.2,6.0,1.7,Math.PI/2,'terracotta');
  // shaded brick-pier press court on +z
  for(const sx of [-6.8,0,6.8])for(const z of [.8,6.0])jjBrickShaft(sx,.45,z,.28,3.6,{pattern:'diamond',cap:'corbel'});
  jjBox(0,4.2,3.4,14.8,.24,6.0,'wood');jjBox(0,4.42,3.4,15.2,.16,6.4,'tile');
  // rotary stone edge-runner crushing basin (-x) + heavy timber lever-and-screw press (+x)
  jjCylinder(-3.6,.95,3.4,1.95,.95,'marble',undefined,24);
  jjPut('jj_cyl_millstone',JJGEO.cyl32,JMAT.marble,-3.6,1.85,3.0,.95,.42,.95,undefined,qEuler(0,0,Math.PI/2));
  jjBeam([-3.6,1.1,3.4],[-3.6,3.9,3.4],.12,'wood');jjBeam([-3.6,1.85,2.2],[-3.6,1.85,4.8],.1,'wood');
  // screw-beam press on +x
  for(const dx of [1.8,5.6])jjBeam([dx,.45,3.4],[dx,3.6,3.4],.16,'wood');
  jjBeam([1.5,2.8,3.4],[6.0,2.5,3.4],.18,'wood');jjCylinder(3.7,1.3,3.4,.85,.85,'brickDeep',undefined,20);
  // golden oil settling vat & sealed terracotta oil amphorae
  jjWorkVat(0,.45,5.4,2.2,1.5,0xd49b28);
  for(const x of [-6.4,-5.2,5.2,6.4])jjShopJar(x,.45,5.6,1.1,0xc4602f);
  jjHouseDoor(0,.45,-.6,1.5,2.5,0,{arch:true,lamps:true});}

/* 4. MONSOON-TIMBER SAWPIT, CARTWRIGHT & CHARCOAL YARD (jj_timber_yard, 22.0 x 16.0 m) */
// Saws dense-air monsoon logs into planks, builds/repairs SIM.cart wagons & fires clean wood-charcoal for brass/glass furnaces.
function buildJjEconTimberYard(jjG,jjO){reseed(9815+(jjO.v|0));
  jjBox(0,.18,0,21.6,.36,15.6,'brickDeep');
  // carpenter & cartwright shed on -z/-x
  jjHouseBlock(-10.2,1.4,-7.2,-1.2,.36,5.8,'brick',{bands:[3.2],bandMat:'brickYellow',cap:'marble'});
  jjHouseBarrel(-4.4,5.96,-4.2,11.4,5.8,1.55,Math.PI/2,'tile');
  // elevated timber sawpit trestle & log carriage in front-left (+z/-x)
  jjBox(-4.8,.75,3.6,7.6,.75,2.2,'brickDeep');
  for(const x of [-7.6,-2.0])for(const z of [2.7,4.5])jjBeam([x,.36,z],[x,2.65,z],.12,'wood');
  jjBeam([-8.0,2.65,2.7],[-1.6,2.65,2.7],.12,'wood');jjBeam([-8.0,2.65,4.5],[-1.6,2.65,4.5],.12,'wood');
  jjBeam([-8.2,3.05,3.6],[-1.4,3.05,3.6],.44,'wood',undefined,16); // monsoon trunk on sawpit
  // stacked seasoned plank racks + wagon wheels + beehive brick charcoal clamp (+x)
  for(const y of [.75,1.35,1.95])jjBox(4.2,y,-4.4,5.6,.22,2.4,'wood');
  for(const z of [-1.2,.4])jjPut('jj_cyl_wheel',JJGEO.cyl32,JMAT.wood,.8,1.05,z,.68,.12,.68,undefined,qEuler(0,0,Math.PI/2));
  jjCylinder(6.8,1.65,3.2,2.6,2.4,'brickDark',undefined,24);jjDome(6.8,2.85,3.2,2.55,{kind:'slate',shape:'hemi'});
  jjChimneyStack(6.8,5.2,3.2,{n:1,h:1.6,r:.32,seed:1});}

/* 5. GYPSUM CALCINING KILN & ALABASTER PLASTER MILL (jj_gypsum_works, 20.0 x 16.0 m) */
// TRADE-SCOPE.md s.2.6: gypsum (plaster, gesso & alabaster) is Jimjam's #1 natural long-range export!
function buildJjEconGypsumWorks(jjG,jjO){reseed(9820+(jjO.v|0));
  jjBox(0,.22,0,19.6,.44,15.6,'brickDeep');jjBox(0,.46,0,19.8,.08,15.8,'marble');
  // twin whitewashed gypsum calcining shaft-kilns on -z/-x
  for(const x of [-6.4,-1.8]){
    jjCylinder(x,2.9,-3.8,2.05,4.8,'cream',undefined,24);
    for(const y of [1.6,3.4,4.9])jjCylinder(x,y,-3.8,2.14,.14,'brick',undefined,24);
    jjMilFrustum(x,5.3,-3.8,2.0,2.4,.48,'brickYellow');
    jjHospBay(x,.48,-1.7,1.8,1.75,.9,.8,0,{depth:.45,mat:'brickDark',back:'glow'});}
  // vaulted white-plaster sifting & bagging shed on +x
  jjHouseBlock(1.4,9.2,-6.8,1.8,.48,5.8,'cream',{base:.7,baseMat:'brick',bands:[3.4],bandMat:'brickYellow',cap:'marble'});
  jjHouseBarrel(5.3,6.06,-2.5,7.6,8.4,1.65,0,'terracotta');
  // rotary gypsum crushing pan & snow-white bagged plaster pallets on +z apron
  jjCylinder(-4.2,.92,3.8,2.1,.85,'marble',undefined,24);
  jjPut('jj_cyl_gypstone',JJGEO.cyl32,JMAT.marble,-4.2,1.75,3.4,.88,.38,.88,undefined,qEuler(0,0,Math.PI/2));
  for(const [x,z] of [[2.6,4.2],[4.4,4.2],[6.2,4.2],[3.5,5.6],[5.3,5.6]]){
    jjShopSack(x,.48,z,.54,0xf5f2ea);jjShopSack(x,.98,z,.5,0xf5f2ea);}
  jjBox(-8.0,1.05,4.2,2.2,1.15,1.8,'marble');}

/* 6. GARMENT TAILOR, SASH-EMBROIDERER & COBBLER (jj_tailor_cobbler, 12.4 x 10.6 m) */
// Second-stage SIM.items workshop: turns woven cotton cloth & tanned leather into shirts, robes, pilgrim sashes, shoes & waterskins.
function buildJjEconTailorCobbler(jjG,jjO){reseed(9825+(jjO.v|0));
  const S=jjShopShell({w:11.8,d:10.0,h1:3.8,h2:3.6,sd:3.4,m1:'brickYellow',m2:'brick'});
  jjShopArcade(0,S.y1,S.fz,3,3.5,2.45,S.y2,{pattern:'fleur',mat:'brickYellow'});
  jjShopParapet(S,.85,'brick',{crenel:'marble'});
  // tailor's cutting counter (-x) with draped saffron/indigo/crimson sashes + cobbler's leather & sandal bench (+x)
  jjShopCounter(-2.4,S.y1,S.fz-1.35,3.8,.92,1.0,'marble');
  for(const [x,c] of [[-3.6,0xe29b24],[-2.4,0x1f3f7a],[-1.2,0xa8322a]])jjShopBlock(x,S.y1+1.12,S.fz-1.35,.85,.18,.82,c);
  jjShopCounter(2.5,S.y1,S.fz-1.35,3.4,.88,.95,'wood');
  for(const x of [1.4,2.5,3.6])jjShopBlock(x,S.y1+1.02,S.fz-1.35,.52,.22,.42,0x7a4b2a);
  // upper workroom jharokha & hung finished robes
  jjHouseJharokha(0,S.y2+.2,S.fz,2.3,2.55,.95,0,{mat:'marble',trim:'marble',roof:'bangla',kind:'gold',glass:'glass'});
  for(const s of [-1,1])jjShopWin(s*3.6,S.y2+1.7,S.fz,1.15,1.6,{lit:true});
  jjAwning(0,S.y1+3.15,S.fz+.28,0,{w:8.8,d:1.45,drop:.48,h:2.3});}

/* 7. SARRAF MONEY-CHANGER & KAUNTU-BILL EXCHANGE (jj_money_changer, 14.8 x 12.6 m) */
// SIM.money (77-sim-6-money.js `changers`): exchanges royal coin, Izani Talents, Eternian silver, Hykkousoi drachmae & Yeti gold.
function buildJjEconMoneyChanger(jjG,jjO){reseed(9830+(jjO.v|0));
  const P=.85,Y1=P+4.1,Y2=Y1+3.7;
  jjCivPlinth(0,0,0,14.2,P,12.0);jjCivStairs(0,0,6.6,5.2,1.6,P,5,0);
  jjHouseBlock(-6.6,6.6,-5.6,3.2,P,Y2,'marble',{bands:[Y1],bandMat:'brickYellow',cap:'marble'});
  // fortified 3-bay marble-and-brass teller arcade on +z
  jjHouseColonnade(0,P,5.2,3,3.8,2.8,1.3,0,{r:.28,patterns:['spiral','diamond'],mat:'brickYellow',trimMat:'marble'});
  jjBox(0,Y1+.08,4.2,12.8,.24,2.2,'marble');
  const top=jjHouseCornice(-6.6,6.6,-5.6,5.3,Y2,{m1:'brickYellow',m2:'marble',m3:'marble'});
  jjHouseParapet(-6.6,6.6,-5.6,5.3,top,{h:.9,mat:'brick',cope:'marble',merlon:1.1,merlonMat:'brickYellow'});
  // gold-domed strongroom lantern + iron-bound strongboxes & bullion assay scales in teller loggia
  jjCylinder(0,top+.95,-1.2,2.8,1.8,'brickYellow',undefined,24);
  jjDome(0,top+1.9,-1.2,2.75,{kind:'gold',shape:'onion'});
  jjShopCounter(0,P,3.8,7.6,1.02,.95,'marble');
  for(const x of [-2.4,2.4]){
    jjBox(x,P+1.25,2.3,1.25,.85,.85,'iron');
    jjBeam([x,P+2.4,3.8],[x,P+1.45,3.8],.035,'gold');jjBeam([x-.45,P+1.55,3.8],[x+.45,P+1.55,3.8],.04,'gold');}
  for(const s of [-1,1])jjHouseWin(s*3.8,Y1+.9,3.2,1.2,1.75,0,{arch:true,lit:true,bars:true});
  jjHouseDoor(0,P,3.2,1.7,2.8,0,{arch:true,lamps:true,studs:true});}

/* 8. SLACKWATER RHYTHMITE CLAY & YELLOW-MARL PIT (jj_clay_pit, 24.0 x 20.0 m) */
// KHAMLET.FOCI `clay`: stepped red-silt and yellow-marl floodzone diggings + levigation settling tank feeding brick & pottery kilns.
function buildJjEconClayPit(jjG,jjO){reseed(9835+(jjO.v|0));
  jjBox(0,.12,0,23.6,.24,19.6,'ochre');
  // stepped terracotta-red and buff-yellow rhythmite benches around sunken extraction pit (-x)
  jjBox(-4.2,.55,-.8,13.6,.85,14.4,'brick');
  jjBox(-4.2,.95,-.8,10.6,.65,11.4,'brickYellow');
  jjBox(-4.2,.38,-.8,7.4,.35,8.2,'brickDeep');
  jjBox(-4.2,.52,-.8,5.2,.08,5.8,'water');
  // clay levigation washing basins & shaded pugger's shed on +x
  jjWorkVat(6.4,.24,-4.2,4.4,3.6,0xb85338);
  jjWorkVat(6.4,.24,.4,4.4,3.6,0xd8a447);
  for(const dx of [4.0,9.2])for(const z of [3.4,7.8])jjBeam([dx,.24,z],[dx,3.1,z],.1,'wood');
  jjBox(6.6,3.2,5.6,5.8,.18,5.0,'tile');
  for(const z of [4.6,6.6])jjBox(6.6,.78,z,4.2,.95,1.1,z<5.5?'brick':'brickYellow');}

/* 9. DRAUGHT-BUFFALO, MULE & SIM.CART HAULAGE DEPOT (jj_carter_corral, 24.0 x 18.0 m) */
// Houses the city's SIM.cart freight wagons, carters, fodder lofts and overland pack-mules.
function buildJjEconCarterCorral(jjG,jjO){reseed(9840+(jjO.v|0));
  jjBox(0,.16,0,23.6,.32,17.6,'brickDeep');
  // open 4-bay brick-arched cart shed along -z + fodder loft above
  jjHouseBlock(-11.2,4.8,-8.2,-1.8,.32,6.4,'brick',{bands:[3.5],bandMat:'brickYellow',cap:'marble'});
  jjHospRow(-3.2,.32,-1.65,15.2,4,3.3,3.2,2.5,0,{depth:.55,mat:'brickYellow'});
  jjHouseParapet(-11.2,4.8,-8.2,-1.8,6.56,{h:.75,mat:'brick',cope:'brickYellow'});
  // tack & carter's office on +x/-z
  jjHouseBlock(4.8,11.2,-8.2,-.6,.32,4.8,'ochre',{cap:'marble'});
  jjHouseChhatri(8.0,4.96,-4.4,2.4,{dome:'terracotta',h:2.1});
  // walled mule/buffalo corral on +z with two parked two-wheel freight carts & water trough
  jjHouseWallRun(-11.2,-1.8,-11.2,8.2,1.65,{mat:'brick',cap:'marble'});
  jjHouseWallRun(11.2,-.6,11.2,8.2,1.65,{mat:'brick',cap:'marble'});
  jjHouseWallRun(-11.2,8.2,-3.2,8.2,1.65,{mat:'brick',cap:'marble'});
  jjHouseWallRun(3.2,8.2,11.2,8.2,1.65,{mat:'brick',cap:'marble'});
  for(const cx of [-6.2,.4]){
    jjBox(cx,.95,3.2,1.8,.35,2.8,'wood');
    for(const s of [-1,1])jjPut('jj_cyl_wheel',JJGEO.cyl32,JMAT.wood,cx+s*1.02,.78,3.2,.62,.1,.62,undefined,qEuler(0,0,Math.PI/2));
    jjBeam([cx,.9,4.6],[cx,.55,6.4],.07,'wood');}
  jjBox(7.2,.62,5.8,4.8,.62,1.0,'brickDeep');jjBox(7.2,.95,5.8,4.4,.08,.7,'water');}

/* 10. SALTPETER LEACHING BEDS & CRYSTALLIZING BOILER (jj_saltpeter_ery, 20.0 x 15.0 m) */
// Leaches JJ1-JJ3 nitre earths (saltpeter GoodY = 479.5) and boils white potassium-nitrate crystals for export & glass/assay flux.
function buildJjEconSaltpeterEry(jjG,jjO){reseed(9845+(jjO.v|0));
  jjBox(0,.18,0,19.6,.36,14.6,'brickDark');
  // four stepped brick nitre-earth leaching beds on -x
  for(const x of [-6.8,-2.4])for(const z of [-3.6,2.6]){
    jjWorkVat(x,.36,z,3.6,4.2,z<0?0x8a765c:0xdce4e6);}
  // boiling & crystallizing shed on +x with twin copper cauldrons & chimney
  jjHouseBlock(1.2,9.2,-6.6,5.8,.36,5.6,'brick',{bands:[3.2],bandMat:'brickYellow',cap:'marble'});
  jjHouseBarrel(5.2,5.76,-.4,7.8,12.2,1.6,0,'tile');
  jjChimneyStack(7.2,5.6,-4.4,{n:3,h:3.4,r:.32,seed:3,relief:true});
  for(const z of [2.8,4.4])jjShopOpenSack(.2,.36,z,.48,.92,0xf6f6f2);
  jjHouseDoor(1.2,.36,1.6,1.3,2.3,-Math.PI/2,{arch:true});}

/* ==== register all 10 SIM.economy & hamlet works buildings ==== */
JJ.def({key:'jj_smithy_brass',name:'Iron & brass hearth-forge',family:'industry',row:'Trades and industry',w:16.4,d:14.2,h:11.6,r:10.6,
  tags:{type:['industry','market/shop'],wealth:'middle',job:'smithing',lit:true},build:buildJjEconSmithyBrass});
JJ.def({key:'jj_pottery',name:"Potter's wheel & glaze muffle-kiln",family:'industry',row:'Trades and industry',w:16.0,d:14.0,h:9.8,r:10.2,
  tags:{type:['industry','market/shop'],wealth:'middle',job:'pottery',lit:true},build:buildJjEconPottery});
JJ.def({key:'jj_oil_press',name:'Whorl-olive & seed lamp-oil mill',family:'industry',row:'Trades and industry',w:16.8,d:14.8,h:9.6,r:10.8,
  tags:{type:['industry'],wealth:'middle',job:'oil',lit:false},build:buildJjEconOilPress});
JJ.def({key:'jj_timber_yard',name:'Monsoon-timber sawpit & cartwright yard',family:'industry',row:'Trades and industry',w:22.0,d:16.0,h:9.2,r:13.2,
  tags:{type:['industry'],wealth:'middle',job:'carpentry',lit:false},build:buildJjEconTimberYard});
JJ.def({key:'jj_gypsum_works',name:'Gypsum calcining kiln & plaster mill',family:'industry',row:'Trades and industry',w:20.0,d:16.0,h:9.8,r:12.4,
  tags:{type:['industry'],wealth:'middle',job:'quarrying',lit:true},build:buildJjEconGypsumWorks});
JJ.def({key:'jj_tailor_cobbler',name:'Garment tailor, sash & cobbler shop',family:'shops',row:'Shops',w:12.4,d:10.6,h:11.2,r:7.8,
  tags:{type:['market/shop','industry'],wealth:'middle',job:'weaving',lit:true},build:buildJjEconTailorCobbler});
JJ.def({key:'jj_money_changer',name:'Sarraf money-changer & Kauntu exchange',family:'civic',row:'Shops',w:14.8,d:12.6,h:14.8,r:9.4,
  tags:{type:['market/shop','civic'],wealth:'rich',job:'trading',lit:true},build:buildJjEconMoneyChanger});
JJ.def({key:'jj_clay_pit',name:'Slackwater rhythmite clay & marl pit',family:'agri',row:'Agriculture and storage',w:24.0,d:20.0,h:5.4,r:15.2,
  tags:{type:['industry'],wealth:'poor',job:'pottery',lit:false},build:buildJjEconClayPit});
JJ.def({key:'jj_carter_corral',name:'Draught-buffalo, mule & cart depot',family:'agri',row:'Agriculture and storage',w:24.0,d:18.0,h:8.8,r:14.6,
  tags:{type:['infrastructure','farm'],wealth:'middle',job:'herding',lit:false},build:buildJjEconCarterCorral});
JJ.def({key:'jj_saltpeter_ery',name:'Saltpeter leaching beds & boiler',family:'industry',row:'Trades and industry',w:20.0,d:15.0,h:10.4,r:12.2,
  tags:{type:['industry'],wealth:'poor',job:'alchemy',lit:false},build:buildJjEconSaltpeterEry});
