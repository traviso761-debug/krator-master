// Jimjam trades, industry, civic-work, harbour & orchard span (73b): 19 buildings closing every
// gap in the Voth 46-trade census and giving the 50,000-person lakeside metropolis its full craft,
// kiln, glass, almanac, humoral-healing, funerary and Great Trough Lake barge economy.
// Uses helpers from 61-jj-helpers.js, 70-jj-housing.js, 71-jj-shops.js, 72-jj-hospitality.js, 73-jj-civic.js.
// Seeds 9600-9699. Prefix: buildJjWork... / jjWork...

function jjWorkVat(jjX,jjY,jjZ,jjW,jjD,jjHex){
  jjBox(jjX,jjY+.38,jjZ,jjW,0.76,jjD,'brickDeep');jjBox(jjX,jjY+.8,jjZ,jjW+.16,.08,jjD+.16,'marble');
  jjShopBlock(jjX,jjY+.64,jjZ,jjW-.36,.12,jjD-.36,jjHex);}

/* 1. BUTCHER & EVAPORATIVE COOLHOUSE (jj_butcher, 10.4 x 9.6 m) */
function buildJjWorkButcher(jjG,jjO){reseed(9600+(jjO.v|0));
  const S=jjShopShell({w:9.8,d:9.0,h1:3.7,h2:3.4,sd:3.2,m1:'brick',m2:'brickYellow'});
  jjShopArcade(0,S.y1,S.fz,2,4.1,2.35,S.y2,{pattern:'chevron',mat:'brick'});
  jjShopParapet(S,.8,'brick',{crenel:'brickYellow'});
  jjShopCounter(-1.5,S.y1,S.fz-1.3,3.2,.95,.95,'brickDeep');
  jjShopCounter(2.2,S.y1,S.fz-1.5,2.0,.9,.95,'marble');
  for(const x of [-2.4,-1.4,-.4])jjShopCylC(x,S.y1+2.25,S.fz-1.4,.22,.85,0xa23b32);
  jjShopBarrel(3.3,S.y1,S.fz-.9,.36,.85);
  for(const x of [-2.4,2.4])jjShopWin(x,S.y2+1.65,S.fz,1.15,1.55,{shutter:true,lit:false});
  // side porous-clay cold dome + smokehouse chimney
  jjCylinder(-3.1,S.y3+.35,-1.8,1.55,.7,'brickDeep',undefined,24);jjDome(-3.1,S.y3+.72,-1.8,1.5,{kind:'terracotta',shape:'hemi'});
  jjChimneyStack(3.4,S.y3,-2.4,{n:2,h:2.4,r:.28,seed:2});
  jjAwning(0,S.y1+3.1,S.fz+.25,0,{w:7.2,d:1.35,drop:.45,h:2.2});}

/* 2. INDIGO, SAFFRON & WINEWEED WEAVER-DYEWORKS (jj_weaver_dyer, 18.4 x 16.6 m) */
function buildJjWorkWeaverDyer(jjG,jjO){reseed(9605+(jjO.v|0));
  jjCivPlinth(0,0,0,18.0,0.45,16.2);
  // L-shaped loom hall + boiling hearth wing
  jjHouseBlock(-8.6,8.6,-7.8,-1.8,.45,7.8,'brick',{bands:[4.2],bandMat:'brickYellow',cap:'marble'});
  jjHouseBlock(-8.6,-3.2,-1.8,7.4,.45,4.4,'brickYellow',{cap:'marble'});
  jjHouseColonnade(2.6,.45,-1.75,3,3.4,2.6,1.15,0,{r:.24,patterns:['diamond','spiral'],mat:'brick',trimMat:'marble'});
  jjHouseParapet(-8.6,8.6,-7.8,-1.8,7.96,{h:.85,mat:'brick',cope:'marble'});
  // four humoral dye vats in the open sunny court (indigo, saffron, wineweed, ochre)
  jjWorkVat(0.2,.45,2.2,2.8,2.2,0x1f3f7a);jjWorkVat(3.8,.45,2.2,2.8,2.2,0xe29b24);
  jjWorkVat(0.2,.45,5.2,2.8,2.2,0x9a2432);jjWorkVat(3.8,.45,5.2,2.8,2.2,0xc88a3c);
  // roof drying pergola hung with dyed cotton sashes
  for(const x of [-6.5,-2.2,2.2,6.5])for(const z of [-6.8,-2.8])jjBeam([x,7.96,z],[x,10.3,z],.09,'wood');
  for(const z of [-6.8,-2.8])jjBeam([-6.7,10.3,z],[6.7,10.3,z],.08,'wood');
  for(const [x,c] of [[-4.8,0x1f3f7a],[-1.6,0xe29b24],[1.6,0x9a2432],[4.8,0x2f8a78]]){
    jjShopBlock(x,8.6,-4.8,.08,1.65,3.4,c);}
  for(const x of [-6.0,-2.0,2.0,6.0])jjHouseWin(x,5.1,-1.8,1.15,1.6,0,{arch:true,lit:true});
  jjHouseDoor(-5.9,.45,7.4,1.2,2.25,0,{arch:true});
  jjChimneyStack(-6.2,4.56,4.8,{n:2,h:2.6,r:.3,seed:1});}

/* 3. GRAIN-ARRACK & WHISKEY BREWHOUSE (jj_brewhouse, 16.8 x 14.4 m) */
function buildJjWorkBrewhouse(jjG,jjO){reseed(9610+(jjO.v|0));
  jjCivPlinth(0,0,0,16.4,.5,14.0);
  jjHouseBlock(-7.8,2.2,-6.6,5.8,.5,6.6,'brick',{bands:[3.6],bandMat:'brickYellow',cap:'marble'});
  jjHouseBarrel(-2.8,6.76,-.4,9.8,12.2,2.3,0,'tile');
  // copper alembic still-tower on +x side
  jjHouseBlock(2.2,7.8,-6.6,3.2,.5,5.4,'brickDeep',{cap:'marble'});
  jjCylinder(5.0,6.3,-1.7,2.3,1.6,'brickYellow',undefined,24);
  jjDome(5.0,7.1,-1.7,2.2,{kind:'gold',shape:'onion'});
  // open barrel yard in front-right
  for(const [x,z] of [[3.6,4.6],[5.2,4.6],[6.8,4.6],[4.4,5.8],[6.2,5.8]])jjShopBarrel(x,.5,z,.45,1.05);
  jjHouseColonnade(-2.8,.5,5.85,3,3.0,2.5,1.2,0,{r:.25,patterns:['chevron','spiral'],mat:'brick',trimMat:'marble'});
  for(const x of [-5.6,-2.8,0])jjHousePorthole(x,4.9,5.85,0,.62,'marble');
  jjChimneyStack(5.4,5.56,-4.8,{n:4,h:3.6,r:.34,seed:3,relief:true});}

/* 4. LEEWARD LIME & BARK TANNERY (jj_tannery, 17.6 x 15.6 m) */
function buildJjWorkTannery(jjG,jjO){reseed(9615+(jjO.v|0));
  jjCivPlinth(0,0,0,17.2,.4,15.2);
  jjHouseBlock(-8.2,8.2,-7.2,-1.6,.4,6.8,'ochre',{base:.6,baseMat:'brickDeep',bands:[3.8],bandMat:'brick',cap:'brick'});
  jjHouseParapet(-8.2,8.2,-7.2,-1.6,6.96,{h:.75,mat:'brick',cope:'brickYellow'});
  jjHouseWallRun(-8.2,-1.6,-8.2,7.2,2.2,{mat:'ochre',cap:'brick'});
  jjHouseWallRun(8.2,-1.6,8.2,7.2,2.2,{mat:'ochre',cap:'brick'});
  jjHouseWallRun(-8.2,7.2,-2.2,7.2,2.2,{mat:'ochre',cap:'brick'});
  jjHouseWallRun(2.2,7.2,8.2,7.2,2.2,{mat:'ochre',cap:'brick'});
  // six lime & bark soaking pits + stretched hide frames
  for(const x of [-5.2,0,5.2])for(const z of [1.2,4.4])jjWorkVat(x,.4,z,3.4,2.1,z<3?0xd8d2c4:0x6e472b);
  for(const x of [-5.2,0,5.2]){
    jjBeam([x-1.2,6.96,-4.4],[x-1.2,9.2,-4.4],.08,'wood');jjBeam([x+1.2,6.96,-4.4],[x+1.2,9.2,-4.4],.08,'wood');
    jjBeam([x-1.3,9.2,-4.4],[x+1.3,9.2,-4.4],.07,'wood');jjShopBlock(x,7.3,-4.4,2.1,1.7,.06,0xa87948);}
  jjHouseDoor(0,.4,-1.6,1.3,2.3,0,{frame:'brick'});
  for(const x of [-5.5,-2.0,2.0,5.5])jjHouseWin(x,4.4,-1.6,1.05,1.35,0,{shutter:'terracotta'});}

/* 5. 1.51-ATM BEEHIVE CLINKER BRICK & TILE KILN (jj_brick_kiln, 22.0 x 18.0 m) */
function buildJjWorkBrickKiln(jjG,jjO){reseed(9620+(jjO.v|0));
  jjBox(0,.2,0,21.6,.4,17.6,'brickDark');
  // twin beehive updraft kiln domes bound in iron straps + glowing stoke arches
  for(const s of [-1,1]){
    const kx=s*5.2,kz=-2.2;
    jjCylinder(kx,1.9,kz,4.2,3.0,'brickDeep',undefined,32);
    for(const y of [1.2,2.6,3.3])jjCylinder(kx,y,kz,4.3,.14,'iron',undefined,32);
    jjDome(kx,3.4,kz,4.1,{kind:'terracotta',shape:'hemi'});
    jjCylinder(kx,7.7,kz,.95,1.4,'brickDark',undefined,16);
    jjHospBay(kx,.4,kz+4.05,2.8,2.5,1.5,1.2,0,{depth:.7,mat:'brickDark',back:'glow'});}
  // central tall tapering draft chimney stack between the kilns
  jjMilTower(0,.4,-6.2,2.1,{stages:[9.5,5.5],taper:.84,mat:'brickDeep',cap:'none',crenel:true});
  // front drying brick-hack sheds & clay pug trough
  for(const s of [-1,1]){
    const hx=s*6.4;
    for(const dx of [-2.6,2.6])for(const z of [4.2,7.6])jjBeam([hx+dx,.4,z],[hx+dx,3.1,z],.1,'wood');
    jjBox(hx,3.2,5.9,5.8,.16,4.0,'tile');
    for(const z of [5.0,6.8])jjBox(hx,.95,z,4.6,1.1,.9,s<0?'brick':'brickYellow');}
  jjWorkVat(0,.4,5.8,3.4,2.8,0x9e583c);}

/* 6. BARADA-QUAY OPTICAL & STAINED-GLASS FURNACE (jj_glassworks, 18.0 x 15.0 m) */
function buildJjWorkGlassworks(jjG,jjO){reseed(9625+(jjO.v|0));
  jjCivPlinth(0,0,0,17.6,.55,14.6,{mat:'brickDark'});
  jjHouseBlock(-8.4,8.4,-6.9,4.2,.55,7.8,'brickDeep',{bands:[4.2],bandMat:'brickYellow',cap:'marble'});
  jjHouseParapet(-8.4,8.4,-6.9,4.2,7.96,{h:.85,mat:'brickDark',cope:'marble'});
  // north-light lens-grinding arcade across +z front + rose-glass lunette
  jjHouseColonnade(0,.55,6.6,4,3.6,2.8,1.25,0,{r:.26,patterns:['spiral','ogee'],mat:'brickYellow',trimMat:'marble'});
  jjBox(0,4.7,5.4,15.0,.24,2.6,'marble');
  for(const x of [-4.8,0,4.8])jjPorthole(x,5.95,4.24,0,.95);
  // central annealing dome + massive 6-flue furnace chimney stack
  jjCylinder(-2.6,8.7,-1.5,3.2,1.5,'brickDark',undefined,24);jjDome(-2.6,9.5,-1.5,3.1,{kind:'slate',shape:'ribbed'});
  jjChimneyStack(4.2,7.96,-2.2,{n:6,h:4.4,r:.36,seed:4,relief:true});
  // Barada-Quay white silica & Serai soda-ash bins on apron
  jjShopOpenSack(-5.6,.55,5.4,.48,.95,0xf2efe6);jjShopOpenSack(-4.4,.55,5.4,.48,.95,0xdce6e8);
  jjHouseDoor(0,.55,4.2,1.6,2.6,0,{arch:true,lamps:true});}

/* 7. ROYAL ALMANAC BLOCK-PRINT & BRASS-DIAL MANUFACTORY (jj_almanac_press, 20.0 x 16.0 m) */
function buildJjWorkAlmanacPress(jjG,jjO){reseed(9630+(jjO.v|0));
  const P=.65,Y1=P+4.2,Y2=Y1+4.0;
  jjCivPlinth(0,0,0,19.6,P,15.6);
  jjHouseBlock(-9.4,9.4,-7.4,5.4,P,Y2,'brickYellow',{bands:[Y1],bandMat:'marble'});
  const top=jjHouseCornice(-9.4,9.4,-7.4,5.4,Y2,{m1:'brick',m2:'brickYellow',m3:'marble'});
  jjHouseParapet(-9.4,9.4,-7.4,5.4,top,{h:.9,mat:'brick',cope:'marble',merlon:1.15,merlonMat:'brickYellow'});
  jjHouseColonnade(0,P,7.2,5,3.4,2.8,1.4,0,{r:.26,patterns:['diamond','fleur','spiral'],mat:'brick',trimMat:'marble'});
  jjBox(0,Y1+.1,6.3,17.6,.22,2.0,'marble');
  // brass Three-Wheels sign & rooftop paper-drying pergolas + dial chhatri
  for(const s of [-1,0,1])jjPut('jj_cyl_gold_32',JJGEO.cyl32,JMAT.gold,s*1.35,Y1+2.2,5.48,.72,.1,.72,undefined,qEuler(Math.PI/2,0,0));
  jjHouseChhatri(0,top,-1.0,3.2,{n:6,dome:'gold',shape:'onion',h:2.5});
  for(const s of [-1,1]){
    for(const x of [s*4.2,s*7.8])for(const z of [-5.4,2.2])jjBeam([x,top,z],[x,top+2.2,z],.08,'wood');
    jjBeam([s*4.2,top+2.2,-5.4],[s*7.8,top+2.2,-5.4],.07,'wood');jjBeam([s*4.2,top+2.2,2.2],[s*7.8,top+2.2,2.2],.07,'wood');
    jjShopBlock(s*6.0,top+.7,-1.6,.06,1.35,5.6,0xf3ecd8);
    jjHouseWin(s*6.2,Y1+.95,5.4,1.3,1.9,0,{arch:true,lit:true});}
  jjHouseDoor(0,P,5.4,1.8,2.9,0,{arch:true,lamps:true});
  jjHouseStair(0,0,7.6,4.8,1.4,P,4,0,{mat:'marble'});}

/* 8. IMPORTED CUT-MARBLE & VELLAI-KAL ALABASTER YARD (jj_masons_yard, 18.0 x 14.6 m) */
function buildJjWorkMasonsYard(jjG,jjO){reseed(9635+(jjO.v|0));
  jjBox(0,.2,0,17.6,.4,14.2,'brickDeep');jjBox(0,.42,0,17.8,.08,14.4,'marble');
  // vaulted carvers' loggia across rear
  jjHouseBlock(-8.4,8.4,-6.8,-1.6,.45,4.8,'brick',{cap:'marble'});
  jjHouseColonnade(0,.45,-1.55,4,3.8,2.8,1.3,0,{r:.26,patterns:['tracery','diamond'],mat:'brickYellow',trimMat:'marble'});
  jjHouseParapet(-8.4,8.4,-6.8,-1.6,4.96,{h:.75,mat:'brick',cope:'marble'});
  // timber A-frame stone-hoist gantry + dressed white Cut-marble & alabaster blocks
  for(const s of [-1,1]){jjBeam([-3.5+s*1.8,.45,1.2],[-3.5,5.6,2.8],.13,'wood');jjBeam([-3.5+s*1.8,.45,4.4],[-3.5,5.6,2.8],.13,'wood');}
  jjBeam([-5.8,5.6,2.8],[-1.2,5.6,2.8],.14,'wood');jjBeam([-3.5,5.5,2.8],[-3.5,2.6,2.8],.04,'iron');
  jjBox(-3.5,1.25,2.8,2.2,1.6,1.4,'marble');
  for(const [x,z,w,h,d] of [[2.6,1.8,2.4,1.1,1.4],[5.6,1.8,1.8,1.5,1.2],[3.8,4.6,2.8,.8,1.6],[-6.6,4.6,1.6,1.2,1.2]]){
    jjBox(x,.45+h/2,z,w,h,d,'marble');}
  jjPalJali(6.2,1.7,4.8,2.2,2.2,.32);}

/* 9. DOMED BAZAAR CHOWK (jj_market_hall, 28.0 x 20.0 m) */
function buildJjWorkMarketHall(jjG,jjO){reseed(9640+(jjO.v|0));
  const P=.75,H=5.8;
  jjCivPlinth(0,0,0,27.2,P,19.2);
  for(const sx of [-1,1]){jjStairs(0,0,sx*10.2,6.4,1.4,P,4,sx>0?0:Math.PI,{mat:'marble'});jjStairs(sx*14.2,0,0,5.2,1.4,P,4,sx>0?Math.PI/2:-Math.PI/2,{mat:'marble'});}
  // open vaulted four-sided arcade hall
  jjHospRow(0,P,8.8,24.8,6,H,3.1,2.5,0,{depth:.7,mat:'brick'});
  jjHospRow(0,P,-8.8,24.8,6,H,3.1,2.5,Math.PI,{depth:.7,mat:'brick'});
  jjHospRow(12.4,P,0,16.8,4,H,3.1,2.5,Math.PI/2,{depth:.7,mat:'brick'});
  jjHospRow(-12.4,P,0,16.8,4,H,3.1,2.5,-Math.PI/2,{depth:.7,mat:'brick'});
  jjBox(0,P+H+.2,0,25.6,.4,17.6,'brickDeep');jjHospRing4(0,0,25.6,17.6,P+H+.2,.4,.36,'marble');
  jjHospParapet(0,P+H+.4,0,25.8,17.8,.42,1.05);
  // central ribbed terracotta dome on octagonal drum + 4 corner chhatris
  const top=P+H+.4;
  jjCylinder(0,top+1.3,0,5.2,2.6,'brickYellow',undefined,16);jjCylinder(0,top+2.7,0,5.45,.26,'marble',undefined,16);
  jjDome(0,top+2.85,0,5.2,{kind:'terracotta',shape:'ribbed'});
  for(const sx of [-1,1])for(const sz of [-1,1])jjCivChhatri(sx*10.4,top,sz*6.8,1.25);
  // interior counters, spice cones & carpets
  for(const sx of [-1,1])for(const sz of [-1,1]){
    jjShopCounter(sx*6.2,P,sz*4.2,3.8,1.1,.95,'brickDeep');
    jjShopCone(sx*5.4,P+.95,sz*4.2,.32,.48,sx>0?0xe29b24:0xb83228);
    jjShopCone(sx*7.0,P+.95,sz*4.2,.32,.48,sz>0?0x224a88:0x3a8a58);}
  jjAwning(0,P+4.2,9.25,0,{w:8.4,d:1.6,drop:.5,h:2.4});}

/* 10. HALL OF THE THREE WHEELS & MERCHANT GUILDS (jj_guild_hall, 26.0 x 22.0 m) */
function buildJjWorkGuildHall(jjG,jjO){reseed(9645+(jjO.v|0));
  const P=1.1,Y1=P+4.6,Y2=Y1+4.4;
  jjCivPlinth(0,0,0,25.2,P,21.2);jjCivStairs(0,0,11.6,7.6,2.2,P,6,0);
  jjHouseBlock(-12.0,12.0,-9.8,7.2,P,Y2,'brick',{bands:[Y1],bandMat:'marble'});
  jjHouseColonnade(0,P,9.2,5,4.2,3.1,1.5,0,{r:.3,patterns:['spiral','diamond','fleur'],mat:'brickYellow',trimMat:'marble'});
  jjHouseColonnade(0,Y1,9.2,5,4.2,2.9,1.5,0,{r:.26,patterns:['diamond','chevron'],mat:'brick',trimMat:'marble',rail:'marble'});
  jjBox(0,Y1+.08,8.2,22.4,.24,2.2,'marble');jjBox(0,Y2+.08,8.2,22.4,.24,2.2,'marble');
  const top=jjHouseCornice(-12.0,12.0,-9.8,9.4,Y2,{});
  jjHouseParapet(-12.0,12.0,-9.8,9.4,top,{h:1.0,mat:'brick',cope:'marble',merlon:1.2,merlonMat:'brickYellow'});
  jjCylinder(0,top+1.6,-1.2,4.6,3.2,'brick',undefined,32);jjCylinder(0,top+3.3,-1.2,4.85,.28,'marble',undefined,32);
  jjDome(0,top+3.45,-1.2,4.6,{kind:'gold',shape:'hemi',ribs:true});
  for(const s of [-1,1]){
    jjHouseJharokha(s*12.0,Y1+.3,-1.2,2.8,2.9,1.1,s*Math.PI/2,{mat:'brickYellow',trim:'marble',roof:'dome',kind:'gold',glass:'glass'});
    jjBanner(s*9.8,Y2-.6,9.5,0,{w:1.3,h:4.2});}
  jjHouseDoor(0,P,7.2,2.2,3.4,0,{arch:true,lamps:true,studs:true});}

/* 11. HARBOUR & CARAVAN ASSAY CUSTOMS HOUSE (jj_customs_house, 24.0 x 18.0 m) */
function buildJjWorkCustomsHouse(jjG,jjO){reseed(9650+(jjO.v|0));
  const P=.9,Y1=P+4.4,Y2=Y1+3.8;
  jjCivPlinth(0,0,0,23.2,P,17.2);jjCivStairs(0,0,9.4,8.4,1.8,P,5,0);
  jjHouseBlock(-11.0,11.0,-8.0,3.6,P,Y2,'brick',{bands:[Y1],bandMat:'brickYellow'});
  // wide 5-bay weighing loggia across +z front
  jjHouseColonnade(0,P,7.6,5,4.0,3.0,1.4,0,{r:.3,patterns:['chevron','spiral'],mat:'brickYellow',trimMat:'marble'});
  jjBox(0,Y1+.1,5.6,21.2,.26,4.2,'marble');jjHouseParapet(-10.6,10.6,3.6,7.7,Y1+.22,{h:.85,mat:'marble'});
  const top=jjHouseCornice(-11.0,11.0,-8.0,3.6,Y2,{});
  jjHouseParapet(-11.0,11.0,-8.0,3.6,top,{h:.9,mat:'brick',cope:'marble'});
  jjCylinder(0,top+1.2,-2.2,3.8,2.4,'brickYellow',undefined,24);jjDome(0,top+2.4,-2.2,3.8,{kind:'slate',shape:'ribbed'});
  // suspended bronze assay beam-scale + crates in the weighing loggia
  jjBeam([-4.0,Y1-.2,5.8],[-4.0,P+2.4,5.8],.04,'gold');jjBeam([-5.1,P+2.4,5.8],[-2.9,P+2.4,5.8],.05,'gold');
  jjShopCrate(4.2,P,5.6,1.1,.2);jjShopCrate(5.6,P,5.8,.95,-.3);
  for(const x of [-7.2,-2.4,2.4,7.2])jjHouseWin(x,Y1+.9,3.6,1.25,1.8,0,{arch:true,lit:true});
  jjHouseDoor(0,P,3.6,2.0,3.1,0,{arch:true,lamps:true});}

/* 12. FOUR-TEMPER HUMORAL INFIRMARY (jj_healing_house, 24.0 x 22.0 m) */
function buildJjWorkHealingHouse(jjG,jjO){reseed(9655+(jjO.v|0));
  const P=.65,H=4.8;
  jjCivPlinth(0,0,0,23.4,P,21.4);jjCivStairs(0,0,11.4,5.6,1.5,P,4,0);
  // serene four-wing yellow-brick cloister round a medicinal pool & herb court
  for(const s of [-1,1]){
    jjHouseBlock(s*7.6,s*11.3,-10.3,10.3,P,P+H,'brickYellow',{cap:'marble'});
    jjHouseBlock(-7.6,7.6,s*6.8,s*10.3,P,P+H,'brickYellow',{cap:'marble'});}
  jjBox(0,P+.2,0,5.6,.4,5.6,'marble');jjBox(0,P+.32,0,4.6,.12,4.6,'water');
  jjHospRow(0,P,6.6,14.8,4,H,2.6,2.2,Math.PI,{depth:.45,mat:'brick'});
  jjHospRow(0,P,-6.6,14.8,4,H,2.6,2.2,0,{depth:.45,mat:'brick'});
  jjHospParapet(0,P+H+.16,0,22.8,20.8,.38,.95);
  // four corner humoral ward domes (terracotta & slate) + entrance bay
  for(const sx of [-1,1])for(const sz of [-1,1]){
    jjCylinder(sx*9.4,P+H+.65,sz*8.5,2.2,1.0,'brickYellow',undefined,24);
    jjDome(sx*9.4,P+H+1.15,sz*8.5,2.15,{kind:(sx*sz>0)?'slate':'terracotta',shape:'hemi'});}
  jjHospBay(0,P,10.6,5.8,H+1.8,2.6,2.2,0,{depth:.8,mat:'brick'});
  for(const x of [-8.8,-5.2,5.2,8.8])jjHouseWin(x,P+1.1,10.3,1.2,1.8,0,{arch:true,lit:true});}

/* 13. STEPPED BRICK LOTUS HAMMAM (jj_bathhouse, 22.0 x 20.0 m) */
function buildJjWorkBathhouse(jjG,jjO){reseed(9660+(jjO.v|0));
  const P=.7,H=5.4;
  jjCivPlinth(0,0,0,21.4,P,19.4);jjCivStairs(0,0,10.4,6.0,1.5,P,4,0);
  jjHouseBlock(-10.2,10.2,-9.2,8.2,P,P+H,'brick',{bands:[P+2.8],bandMat:'brickYellow',cap:'marble'});
  jjHospParapet(0,P+H+.16,-.5,20.6,17.6,.4,1.0);
  // marble-trimmed pishtaq + clustered caldarium/tepidarium domes with glass starlight oculi
  jjHospBay(0,P,8.7,6.8,H+2.0,3.0,2.5,0,{depth:1.1,mat:'brickYellow'});
  jjHouseDoor(0,P,8.2,1.9,2.9,0,{arch:true,lamps:true});
  const top=P+H+.16;
  jjCylinder(0,top+1.1,-1.5,4.4,2.2,'brickYellow',undefined,32);jjDome(0,top+2.2,-1.5,4.3,{kind:'slate',shape:'ribbed'});
  jjCylinder(0,top+6.6,-1.5,.95,.4,'glow',undefined,16);
  for(const sx of [-1,1])for(const sz of [-5.2,3.4]){
    jjCylinder(sx*6.2,top+.7,sz,2.3,1.4,'brick',undefined,24);
    jjDome(sx*6.2,top+1.4,sz,2.25,{kind:'terracotta',shape:'hemi'});}
  jjChimneyStack(-7.8,top,-7.2,{n:4,h:3.5,r:.32,seed:5,relief:true});}

/* 14. FUNERARY GHAT & CHHATRI COURT OF THE COMPLETED COUNT (jj_funerary_ghat, 24.0 x 20.0 m) */
function buildJjWorkFuneraryGhat(jjG,jjO){reseed(9665+(jjO.v|0));
  const P=1.2;
  jjCivPlinth(0,0,0,23.2,P,19.2,{mat:'brickDark'});
  jjTempleFlight(0,0,9.6,7.2,2.4,P,8);
  // low white-marble & dark-clinker enclosure wall + central lustral reflection pool
  jjHouseWallRun(-11.0,-9.0,11.0,-9.0,3.2,{mat:'brickDark',cap:'marble',merlon:1.3,merlonMat:'marble'});
  jjHouseWallRun(-11.0,-9.0,-11.0,9.0,3.2,{mat:'brickDark',cap:'marble'});
  jjHouseWallRun(11.0,-9.0,11.0,9.0,3.2,{mat:'brickDark',cap:'marble'});
  jjBox(0,P+.22,.8,8.4,.44,6.4,'marble');jjBox(0,P+.32,.8,7.2,.12,5.2,'water');
  // four corner marble memorial chhatris + rear sanctum of the Completed Count
  for(const sx of [-1,1])for(const sz of [-5.6,5.8])jjHouseChhatri(sx*7.8,P,sz,3.0,{n:8,dome:'slate',shape:'onion',h:2.8});
  jjHouseBlock(-4.8,4.8,-8.8,-3.6,P,P+6.2,'marble',{bands:[P+3.2],bandMat:'brickDark',cap:'marble'});
  jjCylinder(0,P+7.2,-6.2,2.6,1.8,'brickDark',undefined,24);jjDome(0,P+8.1,-6.2,2.6,{kind:'gold',shape:'onion'});
  jjBrickShaft(0,P,5.6,.42,4.8,{pattern:'spiral',cap:'star'});}

/* 15. MONSOON-TIMBER LAKE-BARGE SLIPWAY (jj_boatyard, 26.0 x 18.0 m) */
function buildJjWorkBoatyard(jjG,jjO){reseed(9670+(jjO.v|0));
  jjBox(0,.25,0,25.6,.5,17.6,'brickDeep');
  // vaulted sail-and-joinery loft on -z + sloping timber slipway with 25 t carvel barge hull in frame on +z
  jjHouseBlock(-12.2,2.0,-8.4,-2.0,.5,6.2,'brick',{cap:'marble'});
  jjHouseBarrel(-5.1,6.36,-5.2,14.0,6.2,2.0,Math.PI/2,'tile');
  // sloping timber keel blocks & ribs of a 25 t Great Trough Lake barge
  for(let z=-.4;z<=7.2;z+=1.25){
    const w=3.6*(1-Math.pow((z-3.4)/4.8,2)*.55);
    jjBox(4.8,.75,z,w+.8,.45,.32,'wood');
    for(const s of [-1,1])jjBeam([4.8+s*w*.45,.9,z],[4.8+s*w*.62,2.85,z],.09,'wood');}
  jjBox(4.8,1.25,3.4,.35,.7,9.2,'wood'); // keel
  jjBeam([4.8,1.4,2.8],[4.8,8.6,2.8],.14,'wood'); // mast stepped for trial
  // timber sheer-legs & rope rack on -x
  jjBeam([-9.5,.5,1.5],[-7.5,6.4,3.5],.13,'wood');jjBeam([-5.5,.5,1.5],[-7.5,6.4,3.5],.13,'wood');
  jjShopBarrel(-10.2,.5,5.6,.42,.95);jjShopBarrel(-8.9,.5,5.8,.42,.95);}

/* 16. LAKE FISH-LANDING, NET-RACKS & SERAI-SALT CURING SHED (jj_fish_quay, 22.0 x 14.0 m) */
function buildJjWorkFishQuay(jjG,jjO){reseed(9675+(jjO.v|0));
  jjBox(0,.45,0,21.6,.9,13.6,'brickDeep');jjBox(0,.93,0,21.8,.08,13.8,'marble');
  // stepped red-brick ghat landing on +z front
  jjStairs(0,0,6.8,9.6,2.2,.95,5,0,{mat:'brick'});
  // curing & smoking shed on -x, timber net-drying frames on +x
  jjHouseBlock(-10.2,-1.6,-6.2,1.2,.95,5.4,'brick',{bands:[3.2],bandMat:'brickYellow',cap:'marble'});
  jjHouseBarrel(-5.9,5.56,-2.5,8.4,7.2,1.6,0,'terracotta');
  jjChimneyStack(-8.2,5.4,-4.6,{n:2,h:2.8,r:.32,seed:1});
  for(const x of [1.8,5.6,9.4]){
    jjBeam([x,.95,-4.6],[x,4.2,-4.6],.09,'wood');jjBeam([x,.95,2.4],[x,4.2,2.4],.09,'wood');
    jjBeam([x,4.1,-4.6],[x,4.1,2.4],.07,'wood');}
  for(const x of [3.7,7.5]){jjBeam([x-1.8,4.1,-1.1],[x+1.8,4.1,-1.1],.07,'wood');jjShopBlock(x,2.4,-1.1,3.3,2.8,.05,0x8c7b62);}
  for(const x of [-4.2,-2.8,-1.4])jjShopBarrel(x,.95,3.2,.38,.9);}

/* 17. 25-TON LAKE-BARGE WHARF & ELECTRIC LEADING-BEACON (jj_barge_quay, 32.0 x 16.0 m) */
function buildJjWorkBargeQuay(jjG,jjO){reseed(9680+(jjO.v|0));
  jjBox(0,.6,-1.6,31.6,1.2,12.4,'brickDeep');jjBox(0,1.24,-1.6,31.8,.12,12.6,'marble');
  // moored 25 t shallow-draft lateen lake barge along +z quay face!
  jjBox(-3.5,.55,5.8,14.6,1.3,3.8,'wood');jjBox(-3.5,1.28,5.8,15.2,.18,4.0,'brickYellow');
  jjBeam([-4.5,1.35,5.8],[-4.5,10.2,5.8],.15,'wood');jjBeam([-9.8,5.2,5.8],[1.6,8.8,5.8],.1,'wood');
  jjShopCrate(-6.2,1.38,5.8,1.1,0);jjShopCrate(-1.4,1.38,5.8,1.0,.15);
  // vaulted transit shed + sheer-legs crane + staged Electric Harbour Leading-Beacon (+x)
  jjHouseBlock(-14.8,2.4,-7.2,-1.2,1.3,6.4,'brick',{bands:[3.9],bandMat:'brickYellow',cap:'marble'});
  jjHouseBarrel(-6.2,6.56,-4.2,17.0,5.8,1.8,Math.PI/2,'tile');
  jjBeam([4.2,1.3,1.2],[6.2,7.6,4.6],.14,'wood');jjBeam([8.2,1.3,1.2],[6.2,7.6,4.6],.14,'wood');
  // staged brick electric harbour beacon (canonical electric exception!)
  jjMilTower(11.8,1.3,-3.2,2.4,{stages:[6.8,4.2],taper:.86,mat:'brick',cap:'none',crenel:true});
  jjCylinder(11.8,13.6,-3.2,1.25,1.8,'glow',undefined,20);
  jjDome(11.8,14.6,-3.2,1.4,{kind:'gold',shape:'onion'});
  jjReg('Moored 25t lake barge',-3.5,5.8,7.6,10.5,{cls:'vessel',type:['cargo','barge'],propulsion:'sail',hull:'monohull',wealth:'middle',lit:false});}

/* 18. WALLED CITRON, IRONPLUM & WHORL-OLIVE ORCHARD (jj_orchard, 28.0 x 24.0 m) */
function buildJjWorkOrchard(jjG,jjO){reseed(9685+(jjO.v|0));
  jjBox(0,.08,0,27.4,.16,23.4,'ochre');
  jjHouseWallRun(-13.6,-11.6,13.6,-11.6,1.5,{mat:'brick',cap:'marble'});
  jjHouseWallRun(-13.6,-11.6,-13.6,11.6,1.5,{mat:'brick',cap:'marble'});
  jjHouseWallRun(13.6,-11.6,13.6,11.6,1.5,{mat:'brick',cap:'marble'});
  jjHouseWallRun(-13.6,11.6,-2.4,11.6,1.5,{mat:'brick',cap:'marble'});
  jjHouseWallRun(2.4,11.6,13.6,11.6,1.5,{mat:'brick',cap:'marble'});
  // brick irrigation rills + raised tree basins (trees themselves placed on plantSpots, plus low whorl-olive press kiosk)
  jjBox(0,.18,0,24.0,.14,.7,'water');jjBox(0,.18,0,.7,.14,20.0,'water');
  const spots=[];
  for(const x of [-8.8,-3.6,3.6,8.8])for(const z of [-7.2,0,7.2]){
    if(x>6&&z<-5)continue;
    jjBox(x,.28,z,2.4,.36,2.4,'brickYellow');jjBox(x,.48,z,2.0,.08,2.0,'ochre');
    spots.push([x,z]);}
  // corner whorl-olive press chhatri
  jjHouseChhatri(8.8,.16,-7.2,3.2,{dome:'terracotta',h:2.6});
  jjCylinder(8.8,.65,-7.2,.95,.7,'marble',undefined,20);}

/* 19. WATER-BUFFALO BYRE & GHEE/CURD DAIRY (jj_dairy, 20.0 x 16.0 m) */
function buildJjWorkDairy(jjG,jjO){reseed(9690+(jjO.v|0));
  jjBox(0,.15,0,19.6,.3,15.6,'brickDeep');
  // ventilated jali-brick buffalo byre on -z + cool whitewashed dome curd-cellar on +x
  jjHouseBlock(-9.4,3.2,-7.4,-.6,.3,4.8,'brick',{bands:[2.8],bandMat:'brickYellow',cap:'marble'});
  jjHouseBarrel(-3.1,4.96,-4.0,12.4,6.6,1.5,Math.PI/2,'tile');
  jjHouseBlock(3.2,9.4,-7.4,1.8,.3,4.6,'cream',{base:.6,baseMat:'brick',cap:'marble'});
  jjCylinder(6.3,5.2,-2.8,2.5,.9,'cream',undefined,24);jjDome(6.3,5.7,-2.8,2.45,{kind:'terracotta',shape:'hemi'});
  // corral wall, shade veranda & water trough
  jjHouseWallRun(-9.4,-.6,-9.4,7.4,1.6,{mat:'brick',cap:'brickYellow'});
  jjHouseWallRun(-9.4,7.4,-2.0,7.4,1.6,{mat:'brick',cap:'brickYellow'});
  jjHouseWallRun(2.0,7.4,9.4,7.4,1.6,{mat:'brick',cap:'brickYellow'});
  jjHouseWallRun(9.4,1.8,9.4,7.4,1.6,{mat:'brick',cap:'brickYellow'});
  jjBox(-4.2,.6,5.4,4.4,.6,.95,'brickDeep');jjBox(-4.2,.92,5.4,4.0,.08,.65,'water');
  for(const x of [4.6,6.2,7.8])jjShopJar(x,.3,4.2,1.15,0xf2ead8);}

/* 20. STANDALONE 25-TON GREAT TROUGH LAKE LATEEN BARGE (jj_lake_barge, 16.4 x 4.6 m, cls: 'vessel') */
function buildJjWorkLakeBarge(jjG,jjO){reseed(9695+(jjO.v|0));
  // flat-bottomed shallow-draft monsoon-timber hull + yellow-brick/ochre coaming, cargo crates & saffron lateen rig
  jjBox(0,.45,0,4.0,.9,13.6,'wood');
  for(const s of [-1,1])jjBeam([0,.45,s*6.8],[0,1.35,s*8.1],.38,'wood');
  jjBox(0,.98,0,4.25,.18,14.2,'brickYellow');
  jjBox(0,1.45,-4.4,3.2,.9,3.2,'wood');jjBox(0,1.95,-4.4,3.4,.12,3.4,'canvas');
  jjBeam([0,.9,1.2],[0,10.2,1.2],.15,'wood');
  jjBeam([0,5.2,-4.6],[0,9.4,6.4],.1,'wood');
  jjShopBlock(0,6.4,.9,.08,2.4,8.6,(jjO.v%2===1)?0x2b5f8c:0xe29b24);
  jjShopCrate(-.8,1.08,2.8,1.05,0);jjShopCrate(.8,1.08,2.6,.95,.2);jjShopBarrel(-.7,1.08,-.6,.38,.88);}

/* 21. LOTUS-COVE FISHING & FERRY SKIFF (jj_harbour_skiff, 2.8 x 8.6 m, cls: 'vessel') */
function buildJjWorkHarbourSkiff(jjG,jjO){reseed(9696+(jjO.v|0));
  jjBox(0,.28,0,2.1,.52,6.4,'wood');
  for(const s of [-1,1])jjBeam([0,.3,s*3.1],[0,.95,s*4.1],.22,'wood');
  jjBox(0,.58,0,2.28,.1,6.6,'brickYellow');
  // Bamboo sun-awning frame + saffron/teal canopy + paired oars & fish baskets
  for(const sx of [-.85,.85])for(const sz of [-1.6,1.2])jjBeam([sx,.58,sz],[sx,2.15,sz],.045,'wood');
  jjBox(0,2.22,-.2,2.05,.12,3.2,'canvas');
  jjShopBlock(0,2.30,-.2,1.95,.08,3.05,(jjO.v%2===0)?0xc94a2c:0x2b7a78);
  for(const s of [-1,1])jjBeam([s*1.05,.62,.4],[s*2.35,.22,1.8],.04,'wood');
  jjShopBarrel(-.45,.62,2.1,.28,.55);jjShopCrate(.42,.62,-2.1,.65,.1);}

/* 22. 25-TON QUAY SLEWING CRANE & ALABASTER CARGO STAGE (jj_dock_crane, 11.6 x 10.4 m) */
function buildJjWorkDockCrane(jjG,jjO){reseed(9697+(jjO.v|0));
  jjBox(0,.35,0,10.8,.7,9.6,'brickDeep');jjBox(0,.74,0,11.0,.1,9.8,'marble');
  // Octagonal masonry capstan drum + rotating timber king-post, counter-weighted tail & twin slewing jib
  jjCylinder(-1.6,1.55,-1.2,2.1,1.5,'brick',undefined,8);jjCylinder(-1.6,2.38,-1.2,2.25,.16,'marble',undefined,8);
  jjBeam([-1.6,2.4,-1.2],[-1.6,9.4,-1.2],.26,'wood');
  jjBeam([-1.6,3.8,-1.2],[2.8,11.8,3.4],.18,'wood');
  jjBeam([-1.6,8.8,-1.2],[2.8,11.8,3.4],.11,'iron');
  jjBeam([-1.6,6.2,-1.2],[-4.2,4.8,-3.4],.16,'wood');
  jjBox(-4.0,4.2,-3.2,1.5,1.2,1.5,'brickDeep'); // counterweight box
  // Iron hoist cable & slung Vellai-kal white alabaster ashlar block + quay cargo stacks
  jjBeam([2.8,11.7,3.4],[2.8,4.2,3.4],.045,'iron');
  jjBox(2.8,3.4,3.4,1.65,1.15,1.25,'marble');
  jjShopCrate(-3.4,.8,2.6,1.15,.1);jjShopCrate(-2.0,.8,2.8,1.0,-.15);jjShopCrate(-2.7,1.85,2.7,.95,.05);
  jjShopBarrel(3.2,.8,-2.2,.42,.95);jjShopBarrel(4.1,.8,-1.9,.42,.95);}

/* 23. STRIPED COTTON MAIDAN PILGRIM PAVILION (jj_pilgrim_tent, 9.2 x 7.8 m) */
function buildJjWorkPilgrimTent(jjG,jjO){reseed(9698+(jjO.v|0));
  const v=(jjO.v|0)%3;
  const stripeHex=v===0?0xc83e2b:(v===1?0x26548c:0xd4962a);
  // Woven reed groundcloth + low brick-kerbed drainage apron
  jjBox(0,.08,0,8.6,.16,7.2,'brickYellow');jjBox(0,.18,0,7.6,.06,6.2,'ochre');
  // Central brass-finial timber ridge poles & corner eaves posts
  for(const sz of [-2.2,2.2]){
    jjBeam([0,.18,sz],[0,4.85,sz],.11,'wood');
    jjCylinder(0,5.05,sz,.14,.38,'gold',undefined,12);}
  jjBeam([0,4.78,-2.4],[0,4.78,2.4],.09,'wood');
  for(const sx of [-3.4,3.4])for(const sz of [-2.6,2.6]){
    jjBeam([sx,.18,sz],[sx,2.25,sz],.07,'wood');
    jjBeam([sx,2.2,sz],[sx*1.22,.16,sz*1.18],.025,'wood');}
  // Pitched cream canvas roof + bold coloured stream-stripe valances & side walls
  for(const sx of [-1,1]){
    jjBeam([0,4.75,-2.3],[sx*3.45,2.22,-2.3],.08,'wood');
    jjBeam([0,4.75,2.3],[sx*3.45,2.22,2.3],.08,'wood');}
  jjBox(0,3.45,0,4.8,1.5,5.2,'canvas');
  jjShopBlock(0,4.28,0,3.2,.42,5.35,stripeHex);
  jjBox(0,1.45,0,6.7,1.9,5.1,'canvas');
  for(const sx of [-3.38,3.38])jjShopBlock(sx,2.15,0,.12,.38,5.18,stripeHex);
  // Open front entry canopy (+z), bedrolls, water jar & warm oil brazier
  jjBeam([-1.4,2.25,2.55],[-1.6,.18,3.55],.06,'wood');jjBeam([1.4,2.25,2.55],[1.6,.18,3.55],.06,'wood');
  jjShopBlock(0,2.28,3.05,3.1,.12,1.15,stripeHex);
  jjShopBarrel(-2.1,.2,2.9,.32,.72);jjShopCrate(2.1,.2,2.8,.78,.15);
  jjCylinder(0,.38,3.45,.28,.36,'gold',undefined,12);jjPut('jj_tent_glow',JJGEO.sphere,JMAT.glow,0,.64,3.45,.14,.14,.14);}

/* ==== register all 20 trade, industrial, civic-work, harbour, vessel & agricultural defs ==== */
JJ.def({key:'jj_butcher',name:'Butcher & coolhouse',family:'shops',row:'Shops',w:10.4,d:9.6,h:10.2,r:6.8,
  tags:{type:['market/shop'],wealth:'middle',lit:false},build:buildJjWorkButcher});
JJ.def({key:'jj_market_hall',name:'Domed bazaar chowk',family:'shops',row:'Shops',w:28.0,d:20.0,h:15.8,r:16.8,
  tags:{type:['market/shop'],wealth:'civic',lit:true},build:buildJjWorkMarketHall});

JJ.def({key:'jj_weaver_dyer',name:'Indigo & saffron weaver-dyeworks',family:'industry',row:'Trades and industry',w:18.4,d:16.6,h:12.4,r:12.0,
  tags:{type:['industry'],wealth:'middle',lit:false},build:buildJjWorkWeaverDyer});
JJ.def({key:'jj_brewhouse',name:'Grain-arrack brewhouse',family:'industry',row:'Trades and industry',w:16.8,d:14.4,h:15.6,r:10.8,
  tags:{type:['industry'],wealth:'middle',lit:false},build:buildJjWorkBrewhouse});
JJ.def({key:'jj_tannery',name:'Leeward lime & bark tannery',family:'industry',row:'Trades and industry',w:17.6,d:15.6,h:10.8,r:11.4,
  tags:{type:['industry'],wealth:'poor',lit:false},build:buildJjWorkTannery});
JJ.def({key:'jj_brick_kiln',name:'1.51-atm beehive clinker brick kiln',family:'industry',row:'Trades and industry',w:22.0,d:18.0,h:17.5,r:13.8,
  tags:{type:['industry'],wealth:'poor',lit:true},build:buildJjWorkBrickKiln});
JJ.def({key:'jj_glassworks',name:'Barada-Quay optical glass furnace',family:'industry',row:'Trades and industry',w:18.0,d:15.0,h:16.8,r:11.5,
  tags:{type:['industry'],wealth:'middle',lit:true},build:buildJjWorkGlassworks});
JJ.def({key:'jj_almanac_press',name:'Royal Almanac block-press & dial works',family:'industry',row:'Trades and industry',w:20.0,d:16.0,h:15.4,r:12.5,
  tags:{type:['industry','civic'],wealth:'middle',lit:true},build:buildJjWorkAlmanacPress});
JJ.def({key:'jj_masons_yard',name:'Cut-marble & alabaster masons yard',family:'industry',row:'Trades and industry',w:18.0,d:14.6,h:10.6,r:11.2,
  tags:{type:['industry'],wealth:'middle',lit:false},build:buildJjWorkMasonsYard});

JJ.def({key:'jj_guild_hall',name:'Hall of the Three Wheels & Guilds',family:'civic',row:'Civic',w:26.0,d:22.0,h:21.0,r:16.5,
  tags:{type:['civic'],wealth:'civic',lit:true},build:buildJjWorkGuildHall});
JJ.def({key:'jj_customs_house',name:'Harbour & caravan assay customs house',family:'civic',row:'Civic',w:24.0,d:18.0,h:17.6,r:14.8,
  tags:{type:['civic','market/shop'],wealth:'civic',lit:true},build:buildJjWorkCustomsHouse});
JJ.def({key:'jj_healing_house',name:'Four-Temper humoral infirmary',family:'civic',row:'Civic',w:24.0,d:22.0,h:16.4,r:16.0,
  tags:{type:['civic'],wealth:'civic',lit:true},build:buildJjWorkHealingHouse});
JJ.def({key:'jj_bathhouse',name:'Stepped brick lotus hammam',family:'civic',row:'Civic',w:22.0,d:20.0,h:15.6,r:14.6,
  tags:{type:['civic'],wealth:'civic',lit:true},build:buildJjWorkBathhouse});

JJ.def({key:'jj_funerary_ghat',name:'Memorial chhatri court of the Completed Count',family:'sacred',row:'Shrines',w:24.0,d:20.0,h:18.2,r:15.2,
  tags:{type:['funerary','religious'],wealth:'civic',lit:true},build:buildJjWorkFuneraryGhat});

JJ.def({key:'jj_boatyard',name:'Monsoon-timber lake-barge slipway',family:'harbour',row:'Harbour and lake',w:26.0,d:18.0,h:11.8,r:15.4,
  tags:{type:['industry','infrastructure'],wealth:'middle',lit:false},build:buildJjWorkBoatyard});
JJ.def({key:'jj_fish_quay',name:'Lake fish-landing & Serai-salt curing shed',family:'harbour',row:'Harbour and lake',w:22.0,d:14.0,h:9.8,r:12.8,
  tags:{type:['industry','infrastructure'],wealth:'poor',lit:false},build:buildJjWorkFishQuay});
JJ.def({key:'jj_barge_quay',name:'25t lake-barge wharf & electric beacon',family:'harbour',row:'Harbour and lake',w:32.0,d:16.0,h:16.5,r:17.5,
  tags:{type:['infrastructure','market/shop'],wealth:'civic',lit:true},build:buildJjWorkBargeQuay});

JJ.def({key:'jj_orchard',name:'Walled citron & whorl-olive orchard',family:'agri',row:'Agriculture and storage',w:28.0,d:24.0,h:7.5,r:18.0,
  plantSpots:[[-8.8,-7.2],[-3.6,-7.2],[3.6,-7.2],[-8.8,0],[-3.6,0],[3.6,0],[8.8,0],[-8.8,7.2],[-3.6,7.2],[3.6,7.2],[8.8,7.2]],
  tags:{type:['farm'],wealth:'middle',lit:false},build:buildJjWorkOrchard});
JJ.def({key:'jj_dairy',name:'Water-buffalo byre & ghee dairy',family:'agri',row:'Agriculture and storage',w:20.0,d:16.0,h:9.6,r:12.6,
  tags:{type:['farm'],wealth:'poor',lit:false},build:buildJjWorkDairy});
JJ.def({key:'jj_lake_barge',name:'25t Great Trough Lake lateen barge',family:'harbour',row:'Harbour and lake',w:4.8,d:16.6,h:10.6,r:8.6,cls:'vessel',
  tags:{type:['cargo','barge'],propulsion:'sail',hull:'monohull',wealth:'middle',lit:false},build:buildJjWorkLakeBarge});
JJ.def({key:'jj_harbour_skiff',name:'Lotus-Cove fishing & ferry skiff',family:'harbour',row:'Harbour and lake',w:2.8,d:8.6,h:3.6,r:4.5,cls:'vessel',
  tags:{type:['fishing','ferry'],propulsion:'oar',hull:'monohull',wealth:'poor',lit:false},build:buildJjWorkHarbourSkiff});
JJ.def({key:'jj_dock_crane',name:'25t quay slewing crane & cargo stage',family:'harbour',row:'Harbour and lake',w:11.6,d:10.4,h:12.6,r:7.2,
  tags:{type:['infrastructure','market/shop'],wealth:'civic',lit:false},build:buildJjWorkDockCrane});
JJ.def({key:'jj_pilgrim_tent',name:'Striped cotton Maidan pilgrim pavilion',family:'hospitality',row:'Hospitality',w:9.2,d:7.8,h:5.6,r:5.6,
  tags:{type:['lodging'],wealth:'poor',lit:true},build:buildJjWorkPilgrimTent});
