// ================================================================= 70o. MARR: middle dwellings — Sidi Olda (PLAN.md section 4.4)
// Seeds 9866-9909. The dense mercantile and artisan core of the Old Quarter (Sidi Olda): 2- to 3-storey Spanish Colonial
// patio houses with inhabited kitchen/fountain courtyards, New Orleans double-level wrought-iron lacework gallery houses,
// Barcelona chamfered corner buildings with projecting glazed mirador bay windows, and Bruges stepped canal houses.

// ---------------------------------------------------------------- 1. CASA DE PATIO (middle): 2-storey Spanish patio house with inhabited vegetable/well court
function buildMarCasaPatio(G,o){reseed(9866+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Casa de patio (middle)',0,0,10.0,9.2,{type:['residence'],wealth:'middle'});
 const W=17.6,D=15.6,Y0=.28,H1=3.5,H2=3.3,HT=H1+H2,ZF=D/2;
 vB('maCantera',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 // U-plan 2-storey house wrapping an inhabited Korta de Gardon (vegetable & well courtyard) at the rear/centre
 // Front main range (+z = 4.6, w = 17.6, d = 6.2) + two side wings along -z (w = 4.2, d = 9.4)
 vnBody('vPlaster',0,Y0,4.6,W,HT,6.2,0,wash,{t:.28});
 maQuoins(0,Y0,4.6,W,HT,6.2,0,st,.46);
 maBand(0,Y0+H1,4.6,W,6.2,0,or,.14,.2);
 vnHipRoof('maHipTile',0,Y0+HT,4.6,W,6.2,1.85,0,tile,.35);
 for(const s of[-1,1]){const wx=s*(W/2-2.1),wz=-3.1;
  vnBody('vPlaster',wx,Y0,wz,4.2,HT,9.2,0,wash,{t:.26});
  maBand(wx,Y0+H1,wz,4.2,9.2,0,or,.1,.18);
  vnHipRoof('maHipTile',wx,Y0+HT,wz,4.2,9.2,1.5,0,tile,.3);}
 // rear garden wall (-z = -7.6) with arched gate + populate inner 9.0 x 8.8 m courtyard with maPatioVegetable!
 vB('vPlaster',0,Y0,-7.55,9.2,2.8,.36,0,wash);
 vBq('maTileB',0,Y0+2.9,-7.55,9.4,.14,.6,vQ(-.15,0,0),tile);
 maPatioVegetable(0,Y0,-2.8,8.8,8.4,0,{shed:true});
 // street facade (+z = 7.7): carved cantera portal zaguán + barred reja windows below + 3 wrought-iron balconies above
 maCanteraPortal(0,Y0,ZF,0,2.2,3.1,st,or,wood,{pediment:false,front:true});
 for(const x of[-5.4,-2.8,2.8,5.4])maShutterWin(x,Y0+.8,ZF,0,1.25,1.65,false,st,wood,iron);
 for(const x of[-5.2,0,5.2]){
  maBalcony(x,Y0+H1+.12,ZF,0,2.8,.8,st,iron);
  maArch(x,Y0+H1+.2,ZF,0,1.45,2.45,{fill:'G',band:st,shutters:wood,bw:.14});}
 vnChimney(-6.4,Y0+HT+.5,4.2,2.0,.22,false);}

// ---------------------------------------------------------------- 2. IRON-GALLERY TOWNHOUSE (middle): 3-storey NOLA double gallery + shopfront
function buildMarTownhouseIron(G,o){reseed(9871+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Iron-gallery townhouse (middle)',0,0,7.5,12.5,{type:['residence','trade'],wealth:'middle',role:'trader'});
 const W=11.6,D=12.4,Z0=-.8,Y0=.3,H1=3.7,H2=3.4,H3=3.2,HT=H1+H2+H3,ZF=Z0+D/2;
 vB('maCantera',0,-.1,Z0,W+.4,Y0+.1,D+2.4,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,HT,D,0,wash,{t:.28});
 maQuoins(0,Y0,Z0,W,HT,D,0,st,.45);
 maBand(0,Y0+H1,Z0,W,D,0,st,.14,.2,'maCantera');
 maBand(0,Y0+H1+H2,Z0,W,D,0,or,.12,.18);
 maParapet(0,Y0+HT,Z0,W,D,0,wash,st,.75,true);
 vnHipRoof('maHipTile',0,Y0+HT+.2,Z0,W-.6,D-.6,1.6,0,tile,.1);
 // full-width 2-storey New Orleans wrought-iron lacework gallery projecting 1.9 m over the street banquette!
 maIronGallery(0,Y0+H1,ZF,0,W-.2,1.9,H2,iron,wood,{storeys:2,h2:H3,roof:true,tileC:tile,pots:true,y0:Y0});
 // ground-floor arched carriage/shop bays
 maArch(-3.4,Y0,ZF,0,2.2,3.0,{fill:'DOOR',band:st,leafC:wood,bw:.16,front:true});
 for(const x of[.2,3.4])maArch(x,Y0,ZF,0,2.4,2.95,{fill:'G',band:or,key:st,leafC:wood,bw:.15});
 // tall French doors opening onto both upper iron galleries
 for(const yy of[Y0+H1+.1,Y0+H1+H2+.1])for(const x of[-3.6,0,3.6]){
  maArch(x,yy,ZF,0,1.45,2.55,{fill:'G',band:st,shutters:wood,bw:.12});}
 vnFolk(1.4,ZF+1.2,1,1.1);}

// ---------------------------------------------------------------- 3. FRENCH QUARTER CORNER BUILDING (middle): wrap-around NOLA iron gallery
function buildMarCornerFrench(G,o){reseed(9876+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('French Quarter corner house (middle)',0,0,9.5,12.2,{type:['residence','trade'],wealth:'middle',role:'trader'});
 const W=13.6,D=13.6,X0=-.8,Z0=-.8,Y0=.3,H1=3.7,H2=3.4,H3=3.2,HT=H1+H2+H3,ZF=Z0+D/2,XF=X0+W/2;
 vB('maCantera',X0,-.1,Z0,W+2.4,Y0+.1,D+2.4,0,st);
 vnBody('vPlaster',X0,Y0,Z0,W,HT,D,0,wash,{t:.28});
 maQuoins(X0,Y0,Z0,W,HT,D,0,st,.46);
 maBand(X0,Y0+H1,Z0,W,D,0,st,.14,.2,'maCantera');
 maParapet(X0,Y0+HT,Z0,W,D,0,wash,st,.75,true);
 vnHipRoof('maHipTile',X0,Y0+HT+.2,Z0,W-.6,D-.6,1.8,0,tile,.1);
 // wrap-around 2-storey wrought-iron gallery on BOTH the +z street front AND the +x cross-street flank!
 maIronGallery(X0,Y0+H1,ZF,0,W-.2,1.85,H2,iron,wood,{storeys:2,h2:H3,roof:true,tileC:tile,pots:true,y0:Y0});
 maIronGallery(XF,Y0+H1,Z0,Math.PI/2,D-.2,1.85,H2,iron,wood,{storeys:2,h2:H3,roof:true,tileC:tile,pots:true,y0:Y0});
 // ground-floor arched café / merchant doors on both street fronts
 for(const u of[-3.8,0,3.8]){
  maArch(X0+u,Y0,ZF,0,2.2,2.95,{fill:u===0?'DOOR':'G',band:or,key:st,leafC:wood,bw:.15,front:u===0});
  maArch(XF,Y0,Z0+u,Math.PI/2,2.2,2.95,{fill:u===0?'DOOR':'G',band:or,key:st,leafC:wood,bw:.15});
  for(const yy of[Y0+H1+.1,Y0+H1+H2+.1]){
   maArch(X0+u,yy,ZF,0,1.4,2.5,{fill:'G',band:st,shutters:wood,bw:.12});
   maArch(XF,yy,Z0+u,Math.PI/2,1.4,2.5,{fill:'G',band:st,shutters:wood,bw:.12});}}
 vnSign(XF+1.8,Y0+2.9,ZF+1.8,Math.PI/4,or);}

// ---------------------------------------------------------------- 4. BARCELONA CORNER MIRADOR HOUSE (middle): chamfered xamfrà + glazed bay windows
function buildMarCornerMirador(G,o){reseed(9881+(o.v|0));
 const wash=MA_LIME(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Barcelona mirador corner house (middle)',0,0,9.5,12.8,{type:['residence','trade'],wealth:'middle'});
 const W=14.4,D=14.4,Y0=.32,H1=3.8,H2=3.5,H3=3.3,HT=H1+H2+H3,ZF=D/2,XF=W/2;
 vB('maCantera',0,-.1,0,W+.5,Y0+.1,D+.5,0,st);
 // full 3-storey hollow body with ground floor rusticated in volcanic cantera stone and upper 2 storeys in cream lime wash
 vnBody('vPlaster',0,Y0,0,W,HT+.24,D,0,wash,{t:.28});
 vnBand('maCantera',0,Y0,0,W+.06,H1,D+.06,0,st,.32);
 maBand(0,Y0+H1,0,W,D,0,or,.16,.24);
 maQuoins(0,Y0+H1+.24,0,W,H2+H3,D,0,st,.48);
 maParapet(0,Y0+HT+.24,0,W,D,0,wash,st,.85,true);
 // Barcelona corner octagonal turret / mirador tribuna rising at the (+x, +z) street corner!
 {const cx=XF-.4,cz=ZF-.4,cy=Y0+H1+.24;
  vPst('maDrumC',cx,Y0,cz,2.1,H1+.24,st);
  maHollowDrum(cx,cy,cz,2.05,H2+H3+1.4,'vPlaster',wash,[0,Math.PI/4,Math.PI/2].flatMap(a=>[{a,y0:.5,w:1.05,h:2.1,lit:false},{a,y0:H2+.5,w:1.05,h:2.1,lit:false}]),{band:st,wood,floors:[H2]});
  kput('maDomeAz',[cx,cy+H2+H3+1.4,cz],null,[2.15,1.85,2.15],MA_AZ());
  vPst('vIron',cx,cy+H2+H3+3.2,cz,.05,.9,iron);}
 // projecting Barcelona glazed timber-and-stone mirador bay windows on the +z and +x facades!
 maMirador(-2.2,Y0+H1+.4,ZF,0,3.4,H2-.3,.95,wood,st,tile,false);
 maMirador(XF,Y0+H1+.4,-2.2,Math.PI/2,3.4,H2-.3,.95,wood,st,tile,false);
 // wrought-iron balconies on the remaining upper bays
 maBalcony(-2.2,Y0+H1+H2+.35,ZF,0,3.6,.8,st,iron);
 maArch(-2.2,Y0+H1+H2+.42,ZF,0,1.6,2.45,{fill:'G',band:st,shutters:wood,bw:.14});
 maBalcony(2.4,Y0+H1+.4,ZF,0,2.4,.75,st,iron);
 maArch(2.4,Y0+H1+.48,ZF,0,1.35,2.4,{fill:'G',band:st,shutters:wood,bw:.14});
 // ground-floor carved portal & arched shop windows
 maCanteraPortal(-2.2,Y0,ZF,0,2.1,3.1,st,or,wood,{pediment:false,front:true});
 maArch(2.4,Y0,ZF,0,2.2,2.9,{fill:'G',band:or,bw:.16});
 maArch(XF,Y0,-2.2,Math.PI/2,2.2,2.9,{fill:'G',band:or,bw:.16});}

// ---------------------------------------------------------------- 5. BRUGES CANAL HOUSE (middle): twin stepped gables, canal quay, bay window
function buildMarBrugesCanalHouse(G,o){reseed(9886+(o.v|0));
 const wash1=MA_CORAL(),wash2=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Bruges stepped canal house (middle)',0,0,8.5,12.5,{type:['residence','trade'],wealth:'middle'});
 const W1=7.2,W2=6.4,D=12.4,Y0=.35,H1=3.5,H2=3.3,HT=H1+H2,ZF=D/2;
 vB('maCantera',0,-.1,0,W1+W2+.5,Y0+.1,D+.5,0,st);
 // Left wing (x = -3.2, w = 7.2): 2 storeys + tall 6-step Bruges gable & projecting mirador bay window over the canal
 {const x=-3.2;
  vnBody('vPlaster',x,Y0,0,W1,HT,D,0,wash1,{t:.26});
  maQuoins(x,Y0,0,W1,HT,D,0,st,.42);maBand(x,Y0+H1,0,W1,D,0,st,.12,.18,'maCantera');
  vnGableRoof(x,Y0+HT,0,W1,D,3.2,0,'maGableTile',tile,.35,'vGablePl',wash1,.15);
  maBrugesGable(x,Y0+HT,ZF,0,W1,3.4,6,wash1,st,true);
  maCanteraPortal(x-1.2,Y0,ZF,0,1.8,2.85,st,or,wood,{pediment:false,front:true});
  maShutterWin(x+1.8,Y0+.8,ZF,0,1.2,1.65,false,st,wood,iron);
  maMirador(x,Y0+H1+.25,ZF,0,3.2,2.6,.9,wood,st,tile,false);}
 // Right wing (x = 3.6, w = 6.4): 2 storeys + 5-step Bruges gable & wrought-iron balcony
 {const x=3.6;
  vnBody('vPlaster',x,Y0,0,W2,HT-.4,D,0,wash2,{t:.26});
  maQuoins(x,Y0,0,W2,HT-.4,D,0,st,.4);maBand(x,Y0+H1-.2,0,W2,D,0,or,.12,.18);
  vnGableRoof(x,Y0+HT-.4,0,W2,D,2.8,0,'maGableTile',tile,.35,'vGablePl',wash2,.15);
  maBrugesGable(x,Y0+HT-.4,ZF,0,W2,3.0,5,wash2,st,true);
  maArch(x,Y0,ZF,0,2.2,2.8,{fill:'DOOR',band:st,leafC:wood,bw:.16});
  maBalcony(x,Y0+H1-.1,ZF,0,4.2,.78,st,iron);
  for(const dx of[-1.2,1.2])maArch(x+dx,Y0+H1,ZF,0,1.25,2.25,{fill:'G',band:st,shutters:wood,bw:.12});}
 vnChimney(-.2,Y0+HT+2.2,-2.4,2.2,.22,false);}

// ---------------------------------------------------------------- 6. ARTISAN COURT (middle): ironworker / cabinetmaker compound + working court
function buildMarArtisanCourt(G,o){reseed(9891+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Artisan courtyard workshop (middle)',0,0,9.5,9.0,{type:['residence','industry'],wealth:'middle',role:'craftsman'});
 const W=16.8,D=14.8,Y0=.25,H1=3.5,H2=3.1,HT=H1+H2;
 vB('maCantera',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 // L-plan 2-storey live-work house on -x and -z wrapping an inhabited front-right artisan & kitchen courtyard!
 // Rear wing (z = -4.2, w = 16.8, d = 6.0 -> z = -7.2..-1.2) + Left wing (x = -5.6, z = 3.0, w = 5.4, d = 8.4 -> z = -1.2..+7.2)
 vnBody('vPlaster',0,Y0,-4.2,W,HT,6.0,0,wash,{t:.26});
 maBand(0,Y0+H1,-4.2,W,6.0,0,or,.12,.18);
 vnHipRoof('maHipTile',0,Y0+HT,-4.2,W,6.0,1.8,0,tile,.32);
 vnBody('vPlaster',-5.6,Y0,3.0,5.4,HT,8.4,0,wash,{t:.26});
 maBand(-5.6,Y0+H1,3.0,5.4,8.4,0,or,.12,.18);
 vnHipRoof('maHipTile',-5.6,Y0+HT,3.0,5.4,8.4,1.6,0,tile,.3);
 // open-arched ground workshop loggia along the rear wing facing the courtyard + courtyard door at (2.6, Y0, -1.2)
 maArch(2.6,Y0,-1.2,0,2.2,2.9,{fill:'DOOR',band:st,leafC:wood,bw:.16});
 for(const dx of[-3.0,3.0])maArch(2.6+dx,Y0,-1.2,0,2.2,2.9,{fill:'G',band:or,leafC:wood,bw:.15});
 maIronGallery(2.6,Y0+H1,-1.2,0,9.6,1.4,H2,iron,wood,{storeys:1,roof:false,y0:Y0});
 // street wall closing the +x,+z courtyard with a wide stone cart portal + inhabited working & vegetable court inside
 for(const s of[-1,1])vB('vPlaster',2.8+s*3.45,Y0,7.0,4.3,2.9,.36,0,wash);
 vBq('maTileB',2.8,Y0+3.02,7.0,11.4,.14,.6,vQ(.15,0,0),tile);
 vB('vPlaster',8.2,Y0,2.1,.36,2.9,9.8,0,wash);
 maCanteraPortal(2.8,Y0,7.0,0,2.6,2.9,st,or,wood,{pediment:false,gate:true});
 maPatioWorking(2.8,Y0,2.8,9.8,7.4,0,{});
 // street facade of the -x wing (+z = 7.2)
 maArch(-5.6,Y0,7.2,0,2.2,2.85,{fill:'DOOR',band:st,leafC:wood,bw:.16,front:true});
 maBalcony(-5.6,Y0+H1+.1,7.2,0,3.8,.78,st,iron);
 maArch(-5.6,Y0+H1+.2,7.2,0,1.5,2.35,{fill:'G',band:st,shutters:wood,bw:.14});
 vnSign(-3.0,Y0+2.9,7.3,0,or);}

// ---------------------------------------------------------------- 7. SAILORS' BOARDING HOUSE (middle): Casa de Huéspedes with double gallery
function buildMarBoardingHouse(G,o){reseed(9896+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Sailors\' boarding house (middle)',0,0,9.5,11.8,{type:['residence','tavern/inn'],wealth:'middle',role:'innkeeper'});
 const W=15.6,D=11.6,Z0=-.8,Y0=.3,H1=3.5,H2=3.3,H3=3.0,HT=H1+H2+H3,ZF=Z0+D/2;
 vB('maCantera',0,-.1,Z0,W+.4,Y0+.1,D+2.4,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,HT,D,0,wash,{t:.28});
 maQuoins(0,Y0,Z0,W,HT,D,0,st,.44);
 maBand(0,Y0+H1,Z0,W,D,0,or,.14,.2);maBand(0,Y0+H1+H2,Z0,W,D,0,or,.12,.18);
 vnHipRoof('maHipTile',0,Y0+HT,Z0,W,D,2.1,0,tile,.35);
 // 2-storey full-width New Orleans wrought-iron gallery across all 5 front bays
 maIronGallery(0,Y0+H1,ZF,0,W-.4,1.85,H2,iron,wood,{storeys:2,h2:H3,roof:true,tileC:tile,pots:true,y0:Y0});
 maCanteraPortal(0,Y0,ZF,0,2.0,2.95,st,or,wood,{pediment:false,front:true});
 for(const x of[-5.2,-2.6,2.6,5.2]){
  maShutterWin(x,Y0+.8,ZF,0,1.25,1.65,false,st,wood,iron);
  for(const yy of[Y0+H1+.1,Y0+H1+H2+.1])maArch(x,yy,ZF,0,1.3,2.35,{fill:'G',band:st,shutters:wood,bw:.12});}
 vnSign(2.2,Y0+2.9,ZF+1.85,0,or);vnFolk(-1.6,ZF+1.2,2,1.2);}

// ---------------------------------------------------------------- 8. BARRIO CHAPEL & SHRINE (civic/middle, lit): espadaña bell-gable & azulejo dome
function buildMarChapelBarrio(G,o){reseed(9901+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),az=MA_AZ(),tile=MA_TILE();
 vnReg('Barrio chapel and shrine (middle)',0,0,8.5,14.5,{type:['civic','temple'],wealth:'middle',role:'priest'});
 const W=11.2,D=15.6,Y0=.45,H=6.6,ZF=D/2;
 vB('maCantera',0,-.1,0,W+1.2,Y0+.1,D+1.6,0,st);
 vnStairs(0,0,ZF+1.4,0,4.8,Y0,4,'maCantera',st);
 vnBody('vPlaster',0,Y0,0,W,H,D,0,wash,{t:.32});
 maQuoins(0,Y0,0,W,H,D,0,st,.52);
 maBand(0,Y0+H-.3,0,W,D,0,st,.18,.3,'maCantera');
 vnGableRoof(0,Y0+H,0,W,D,2.4,0,'maGableTile',tile,.35,'vGablePl',wash,.2);
 // Baroque front facade (+z): carved cantera portal, circular stained/lit rose oculus, and 3-bell espadaña bell-gable!
 maCanteraPortal(0,Y0,ZF,0,2.4,3.6,st,or,wood,{pediment:true,front:true});
 maOculus(0,Y0+5.3,ZF,0,1.05,true,st,wood);
 maEspadana(0,Y0+H+1.2,ZF-.3,0,5.8,4.6,wash,st,2);
 // rear sanctuary dome in cobalt azulejo tile over the altar (-z = -4.2)
 maBaroqueDome(0,Y0+H+1.0,-4.2,2.6,2.2,wash,'maDomeAz',az,st,true);
 // side buttresses & lit arched nave windows
 for(const s of[-1,1])for(const z of[-4.5,0,4.5]){
  vB('maCantera',s*(W/2+.22),Y0,z,.45,H-.4,.65,0,st);
  if(z!==4.5)maArch(s*W/2,Y0+1.6,z,s*Math.PI/2,1.35,3.2,{fill:'L',band:st,bw:.14});}
 vnLampPost(-3.2,0,ZF+1.4,3.4);vnLampPost(3.2,0,ZF+1.4,3.4);}

// ---------------------------------------------------------------- 9. POSADA COURTYARD INN (middle): 2-storey arcaded courtyard inn with fountain & stables
function buildMarPosada(G,o){reseed(9906+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Posada courtyard inn (middle)',0,0,11.5,10.2,{type:['tavern/inn','trade'],wealth:'middle',role:'innkeeper'});
 const W=21.2,D=17.6,Y0=.28,H1=3.6,H2=3.4,HT=H1+H2,ZF=D/2;
 vB('maCantera',0,-.1,0,W+.5,Y0+.1,D+.5,0,st);
 // 4-wing courtyard inn wrapping a central 10.4 x 7.2 m pleasure & carriage patio (all 4 wings hollow)
 for(const [lx,lz,lw,ld,hol] of[[0,6.2,W,5.2,true],[0,-6.2,W,5.2,true],[-8.0,0,5.2,7.2,true],[8.0,0,5.2,7.2,true]]){
  if(hol)vnBody('vPlaster',lx,Y0,lz,lw,HT,ld,0,wash,{t:.28});
  else vB('vPlaster',lx,Y0,lz,lw,HT,ld,0,wash);
  maBand(lx,Y0+H1,lz,lw,ld,0,or,.12,.2);
  vnHipRoof('maHipTile',lx,Y0+HT,lz,lw,ld,1.75,0,tile,.32);}
 maQuoins(0,Y0,0,W,HT,D,0,st,.48);
 // populate the central 10.4 x 7.2 m courtyard with a fountain, palm planters, and lantern posts + rear wing door!
 maPatioPleasure(0,Y0,0,10.0,6.8,0,{lamps:true});
 maArch(0,Y0,-3.6,0,2.2,2.95,{fill:'DOOR',band:st,leafC:wood,bw:.16});
 // inner courtyard wooden & wrought-iron gallery at y = Y0 + H1
 for(const s of[-1,1]){
  vB('vWood',0,Y0+H1,s*3.0,10.8,.14,1.2,0,wood);
  vB('vIron',0,Y0+H1+.85,s*2.45,10.8,.04,.04,0,iron);}
 // front facade (+z = 8.8): central arched carriage zaguán portal + ground tavern arcade + upper iron gallery
 maCanteraPortal(0,Y0,ZF,0,2.8,3.3,st,or,wood,{pediment:true,front:true});
 for(const s of[-1,1]){
  maArcade(s*6.2,Y0,ZF,0,2,2.3,2.95,.55,st,or,{fill:'G',leafC:wood});
  maIronGallery(s*6.2,Y0+H1,ZF,0,6.4,1.45,H2,iron,wood,{storeys:1,roof:true,tileC:tile});
  for(const dx of[-1.6,1.6])maArch(s*6.2+dx,Y0+H1+.15,ZF,0,1.35,2.45,{fill:'G',band:st,shutters:wood,bw:.12});}
 vnSign(2.6,Y0+3.1,ZF+.4,0,or);vnFolk(0,ZF+1.5,2,1.2);}

VERN.def({key:'mar_casa_patio',name:'Casa de patio',family:'dwellings',tags:{type:['residence'],wealth:'middle',lit:false},w:18,d:16,h:9.2,build:buildMarCasaPatio});
VERN.def({key:'mar_townhouse_iron',name:'Iron-gallery townhouse',family:'dwellings',tags:{type:['residence','trade'],wealth:'middle',lit:false,role:'trader',job:'trade'},w:13,d:15,h:12.5,build:buildMarTownhouseIron});
VERN.def({key:'mar_corner_french',name:'French Quarter corner house',family:'dwellings',tags:{type:['residence','trade'],wealth:'middle',lit:false,role:'trader',job:'trade'},w:16,d:16,h:12.2,build:buildMarCornerFrench});
VERN.def({key:'mar_corner_mirador',name:'Barcelona mirador corner house',family:'dwellings',tags:{type:['residence','trade'],wealth:'middle',lit:false},w:16,d:16,h:13.5,build:buildMarCornerMirador});
VERN.def({key:'mar_bruges_canal_house',name:'Bruges stepped canal house',family:'dwellings',tags:{type:['residence','trade'],wealth:'middle',lit:false},w:15,d:14,h:12.5,build:buildMarBrugesCanalHouse});
VERN.def({key:'mar_artisan_court',name:'Artisan courtyard workshop',family:'dwellings',tags:{type:['residence','industry'],wealth:'middle',lit:false,role:'craftsman',job:'crafting'},w:18,d:16,h:9.0,build:buildMarArtisanCourt});
VERN.def({key:'mar_boarding_house',name:'Sailors\' boarding house',family:'dwellings',tags:{type:['residence','tavern/inn'],wealth:'middle',lit:false,role:'innkeeper',job:'hospitality'},w:17,d:14,h:11.8,build:buildMarBoardingHouse});
VERN.def({key:'mar_chapel_barrio',name:'Barrio chapel and shrine',family:'civic',tags:{type:['civic','temple'],wealth:'middle',lit:true,role:'priest',job:'clergy'},w:13,d:18,h:14.5,build:buildMarChapelBarrio});
VERN.def({key:'mar_posada',name:'Posada courtyard inn',family:'trade',tags:{type:['tavern/inn','trade'],wealth:'middle',lit:false,role:'innkeeper',job:'hospitality'},w:22,d:19,h:10.2,build:buildMarPosada});
