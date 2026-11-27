// ================================================================= 71m. MARR: trade, smuggling, vice & maritime industry (PLAN.md section 4.6)
// Seeds 9951-9989. The working heart of Iziz's foremost Ring Sea port and its seedy underbelly: Bruges-gabled smuggler
// canal warehouses with water-gates, NOLA iron-gallery cantinas and red-lantern gambling halls, ship chandleries, rum
// distilleries, a Barcelona-inspired iron-and-brick Mercado Hall, an Antiguan stone Portal Arcade, and a caravel boatyard.

// ---------------------------------------------------------------- 1. SMUGGLER'S CANAL WAREHOUSE (poor/trade): twin Bruges gables & water-gate
function buildMarSmugglerWarehouse(G,o){reseed(9951+(o.v|0));
 const wash1=MA_OCHRE(),wash2=MA_CORAL(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Smuggler\'s canal warehouse (trade)',0,0,10.5,12.0,{type:['trade','warehouse'],wealth:'poor',role:'warehouseman'});
 const W=18.4,D=13.2,B1=2.2,H1=3.4,H2=3.0,HT=H1+H2,ZF=D/2;
 // canal water strip in front (+z = 5.4..7.8) + rusticated stone water-level basement with twin barred boat arches
 if(typeof window==='undefined'||!window.CITY)vB('maWater',0,-.4,ZF+.9,W+1.0,.18,2.4,0,vC(0x1e4e5c));
 vB('maCantera',0,-.2,0,W+.4,B1+.2,D+.4,0,stD);
 maBand(0,B1,0,W+.4,D+.4,0,st,.14,.2,'maCantera');
 // narrow stone quay ledge along +z (z = ZF+.4) with bollards & cargo crates
 vB('maCantera',0,0,ZF+.45,W+.4,B1*.55,1.1,0,st);
 for(const s of[-1,1]){const x=s*4.6;
  maArch(x,0,ZF,0,3.6,B1-.15,{fill:'O',band:st,reja:iron,bw:.18});
  // upper 2-storey warehouse wing with 6-step Bruges canal gable & hoist crane
  vnBody('vPlaster',x,B1+.2,0,W/2,HT,D,0,s<0?wash1:wash2,{t:.28});
  maQuoins(x,B1+.2,0,W/2,HT,D,0,st,.44);
  maBand(x,B1+.2+H1,0,W/2,D,0,or,.12,.18);
  vnGableRoof(x,B1+.2+HT,0,W/2,D,3.1,0,'maGableTile',tile,.35,'vGablePl',s<0?wash1:wash2,.15);
  maBrugesGable(x,B1+.2+HT,ZF,0,W/2,3.3,6,s<0?wash1:wash2,st,true);
  // vertical tier of cargo loading doors on each storey with iron hoist pulley + quay loading stair
  vnStairs(x,0,ZF+1.8,0,2.4,B1+.2,8,'maCantera',st);
  maArch(x,B1+.2,ZF,0,2.2,2.8,{fill:'DOOR',band:st,leafC:wood,bw:.16,front:s<0});
  maArch(x,B1+.2+H1+.15,ZF,0,1.8,2.4,{fill:'G',band:st,shutters:wood,bw:.14});
  for(const dx of[-2.8,2.8])maShutterWin(x+dx,B1+.2+H1+.7,ZF,0,1.05,1.45,false,st,wood,null);}
 vnCrate(-6.2,B1*.55,ZF+.45,.8,.15,wood);vnBarrel(6.2,B1*.55,ZF+.45,.36,.88,wood);}

// ---------------------------------------------------------------- 2. SMUGGLER'S CANTINA & RUM HOUSE (poor/trade): wrap-around NOLA iron gallery
function buildMarCantina(G,o){reseed(9956+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Smuggler\'s cantina (trade)',0,0,8.5,10.5,{type:['tavern/inn','trade'],wealth:'poor',role:'innkeeper'});
 const W=13.2,D=11.6,X0=-.8,Z0=-.8,Y0=.3,H1=3.5,H2=3.2,HT=H1+H2,ZF=Z0+D/2,XF=X0+W/2;
 vB('maCantera',X0,-.1,Z0,W+2.4,Y0+.1,D+2.4,0,st);
 vnBody('vPlaster',X0,Y0,Z0,W,HT,D,0,wash,{t:.26});
 maQuoins(X0,Y0,Z0,W,HT,D,0,st,.44);
 maBand(X0,Y0+H1,Z0,W,D,0,or,.14,.2);
 vnHipRoof('maHipTile',X0,Y0+HT,Z0,W,D,2.1,0,tile,.35);
 // wrap-around New Orleans wrought-iron drinking gallery on +z and +x!
 maIronGallery(X0,Y0+H1,ZF,0,W-.2,1.85,H2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true,y0:Y0});
 maIronGallery(XF,Y0+H1,Z0,Math.PI/2,D-.2,1.85,H2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true,y0:Y0});
 // ground arched cantina doors, rum barrel racks, and outdoor tables under the gallery
 maArch(X0,Y0,ZF,0,2.2,2.9,{fill:'DOOR',band:st,leafC:wood,bw:.16,front:true});
 for(const dx of[-3.8,3.8]){
  maArch(X0+dx,Y0,ZF,0,2.1,2.8,{fill:'G',band:or,shutters:wood,bw:.14});
  maArch(X0+dx,Y0+H1+.15,ZF,0,1.45,2.45,{fill:'G',band:st,shutters:wood,bw:.12});}
 maArch(X0,Y0+H1+.15,ZF,0,1.5,2.45,{fill:'L',band:or,shutters:wood,bw:.14});
 for(let k=0;k<4;k++)vnBarrel(XF+.9,Y0,Z0-3.2+k*1.1,.36,.88,wood);
 vnSign(XF+1.8,Y0+2.9,ZF+1.8,Math.PI/4,or);vnFolk(X0-2.2,ZF+1.1,2,1.2);}

// ---------------------------------------------------------------- 3. LANTERN HOUSE & GAMBLING DEN (middle/trade, lit): Casa de los Faroles
function buildMarLanternHouse(G,o){reseed(9961+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE(),az=MA_AZ();
 vnReg('Lantern house and gambling den (trade)',0,0,9.5,12.8,{type:['tavern/inn','trade'],wealth:'middle',role:'innkeeper'});
 const W=15.6,D=13.2,Z0=-.8,Y0=.35,H1=3.8,H2=3.5,H3=3.3,HT=H1+H2+H3,ZF=Z0+D/2;
 vB('maCantera',0,-.1,Z0,W+.5,Y0+.1,D+2.6,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,HT,D,0,wash,{t:.28});
 maQuoins(0,Y0,Z0,W,HT,D,0,st,.46);
 maBand(0,Y0+H1,Z0,W,D,0,az,.14,.22,'maAzulejo');
 maBand(0,Y0+H1+H2,Z0,W,D,0,or,.14,.2);
 maParapet(0,Y0+HT,Z0,W,D,0,wash,st,.8,true);
 vnHipRoof('maHipTile',0,Y0+HT+.15,Z0,W-.6,D-.6,1.9,0,tile,.12);
 // 2-storey ornate NOLA wrought-iron lacework gallery hung with glowing warm lanterns!
 maIronGallery(0,Y0+H1,ZF,0,W-.3,2.0,H2,iron,wood,{storeys:2,h2:H3,roof:true,tileC:tile,pots:true,y0:Y0});
 for(let k=0;k<6;k++){const x=-W/2+.6+k*(W-1.2)/5;
  vBall('vBulb',x,Y0+H1-.45,ZF+1.92,.18);
  vBall('vBulb',x,Y0+H1+H2-.45,ZF+1.92,.18);}
 maCanteraPortal(0,Y0,ZF,0,2.4,3.3,st,or,wood,{pediment:true,front:true});
 for(const x of[-5.2,-2.6,2.6,5.2]){
  maArch(x,Y0+.2,ZF,0,1.5,2.75,{fill:'L',band:or,shutters:wood,bw:.15});
  for(const yy of[Y0+H1+.15,Y0+H1+H2+.15])maArch(x,yy,ZF,0,1.45,2.55,{fill:'L',band:st,shutters:wood,bw:.12});}
 vnFolk(0,ZF+1.4,2,1.2);}

// ---------------------------------------------------------------- 4. SHIP'S CHANDLERY & COMPASS SHOP (middle/trade): mirador display windows
function buildMarChandlery(G,o){reseed(9966+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Ship\'s chandlery and chart shop (trade)',0,0,8.5,10.2,{type:['trade','workshop'],wealth:'middle',role:'trader'});
 const W=14.8,D=11.8,Y0=.3,H1=3.6,H2=3.3,HT=H1+H2,ZF=D/2;
 vB('maCantera',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 vnBody('vPlaster',0,Y0,0,W,HT,D,0,wash,{t:.28});
 maQuoins(0,Y0,0,W,HT,D,0,st,.45);
 maBand(0,Y0+H1,0,W,D,0,st,.14,.2,'maCantera');
 vnHipRoof('maHipTile',0,Y0+HT,0,W,D,2.0,0,tile,.35);
 // ground-floor arched shopfronts with coiled cordage, anchors, and brass instruments + upper Barcelona mirador bays
 maArch(0,Y0,ZF,0,2.1,2.95,{fill:'DOOR',band:st,leafC:wood,bw:.16,front:true});
 for(const s of[-1,1]){
  maArch(s*4.2,Y0,ZF,0,2.8,2.95,{fill:'G',band:or,key:st,bw:.16});
  vnAwning(s*4.2,Y0+2.9,ZF,0,3.2,1.4,or);
  maMirador(s*4.2,Y0+H1+.25,ZF,0,3.2,2.6,.9,wood,st,tile,false);}
 maBalcony(0,Y0+H1+.15,ZF,0,2.8,.8,st,iron);
 maArch(0,Y0+H1+.25,ZF,0,1.45,2.4,{fill:'G',band:st,shutters:wood,bw:.14});
 // brass astrolabe ring sign hanging over the central door + coiled rope barrels out front
 kput('maRing',[0,Y0+3.45,ZF+.55],null,[.42,.42,1.5],or);
 vnBarrel(-6.0,0,ZF+.85,.35,.85,wood);vnCrate(6.0,0,ZF+.85,.72,.15,wood);}

// ---------------------------------------------------------------- 5. RUM DISTILLERY & BODEGA (middle/industry): copper still chimney, aging cellars, working court
function buildMarRumBodega(G,o){reseed(9971+(o.v|0));
 const wash=MA_LIME(),wash2=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE(),cu=vC(0xb86838);
 vnReg('Rum distillery and aging bodega (trade)',0,0,11.5,11.2,{type:['industry','trade'],wealth:'middle',role:'brewer'});
 const W=21.2,D=15.2,Y0=.28,H1=4.2,H2=3.2;
 vB('maCantera',0,-.1,0,W+.5,Y0+.1,D+.5,0,st);
 // Long vaulted barrel-aging bodega hall on -x (x = -3.8, z = -1.2, w = 12.8, d = 12.2) with Bruges stepped gable
 vnBody('vPlaster',-3.8,Y0,-1.2,12.8,H1+1.6,12.2,0,wash,{t:.3});
 maQuoins(-3.8,Y0,-1.2,12.8,H1+1.6,12.2,0,st,.48);
 vnGableRoof(-3.8,Y0+H1+1.6,-1.2,12.8,12.2,2.8,0,'maGableTile',tile,.35,'vGablePl',wash,.18);
 maBrugesGable(-3.8,Y0+H1+1.6,4.9,0,12.8,3.0,6,wash,st,true);
 // 3 arched bodega cellar doors + circular oculi on the front (+z = 4.9)
 for(const dx of[-3.8,0,3.8]){
  maArch(-3.8+dx,Y0,4.9,0,2.5,3.2,{fill:dx===0?'DOOR':'G',band:st,key:or,leafC:wood,bw:.16,front:dx===0});
  maOculus(-3.8+dx,Y0+4.5,4.9,0,.62,false,st,wood);}
 // 2-storey copper-still house on +x (x = 6.4, z = -3.2, w = 7.6, d = 8.2) + tall brick distillery chimney & copper tanks
 vnBody('vPlaster',6.4,Y0,-3.2,7.6,H1+H2,8.2,0,wash2,{t:.28});
 maBand(6.4,Y0+H1,-3.2,7.6,8.2,0,or,.12,.18);
 vnHipRoof('maHipTile',6.4,Y0+H1+H2,-3.2,7.6,8.2,1.9,0,tile,.32);
 vnChimney(8.6,Y0+H1+H2+.6,-5.4,4.2,.28,true);
 maArch(6.4,Y0,.9,0,2.0,2.8,{fill:'DOOR',band:st,leafC:wood,bw:.15});
 for(const dx of[-1.8,1.8])maShutterWin(6.4+dx,Y0+H1+.65,.9,0,1.05,1.45,false,st,wood,null);
 // Visible copper alembic still drums & molasses vats in the front-right working yard (x = 6.4, z = 4.2)!
 vPst('vTankR',4.4,Y0,3.2,1.1,2.8,cu);kput('vDomeC',[4.4,Y0+2.8,3.2],null,[1.12,.85,1.12],cu);
 vBeam([4.4,Y0+3.5,3.2],[6.4,Y0+3.1,.8],.09,cu,'vCopperB');
 for(let k=0;k<5;k++)vnBarrel(6.8+((k&1)*.9),Y0,2.2+k*.95,.42,.95,wood);
 vB('vPlaster',6.4,Y0,7.2,7.6,2.6,.34,0,wash2);
 maArch(6.4,Y0,7.2,0,3.4,2.5,{fill:'O',band:st,bw:.15});}

// ---------------------------------------------------------------- 6. MERCADO DE HIERRO (middle/trade): Barcelona-style iron & brick market hall
function buildMarMercadoHall(G,o){reseed(9976+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Mercado de Hierro market hall (trade)',0,0,13.5,11.8,{type:['market','trade'],wealth:'middle',role:'trader'});
 const W=24.8,D=16.8,Y0=.35,H1=5.4,HC=2.2,ZF=D/2;
 vB('maCantera',0,-.1,0,W+.8,Y0+.1,D+.8,0,st);
 vnStairs(0,0,ZF+.9,0,6.4,Y0,3,'maCantera',st);
 vnBody('vPlaster',0,Y0,0,W-.8,H1,D-.8,0,wash,{t:.32});
 // Brick/coral-plaster corner pavilions & cast-iron arched structural bays (inspired by Barcelona's Born / Sant Antoni markets)
 for(const sx of[-1,1])for(const sz of[-1,1]){
  const px=sx*(W/2-2.2),pz=sz*(D/2-2.2);
  vnBody('vPlaster',px,Y0,pz,4.4,H1+.4,4.4,0,wash,{t:.28});
  maQuoins(px,Y0,pz,4.4,H1+.4,4.4,0,st,.45);
  vnHipRoof('maHipTile',px,Y0+H1+.4,pz,4.6,4.6,1.6,0,tile,.25);}
 // 5-bay cast-iron & glazed market arcade along +z and -z, with open-air market stalls visible inside
 for(const s of[-1,1]){const z=s*(ZF-.25),ry=s>0?0:Math.PI;
  vB('vIron',0,Y0+H1-.35,z,W-8.4,.4,0.35,0,iron);
  for(let k=-2;k<=2;k++){const x=k*3.2;
   vPst('vIron',x-1.6,Y0,z,.12,H1,iron);vPst('vIron',x+1.6,Y0,z,.12,H1,iron);
   if(k===0)maArch(x,Y0,z,ry,2.8,3.6,{fill:'DOOR',band:iron,bandItem:'vIron',leafC:wood,bw:.14,front:s>0});
   else maArch(x,Y0,z,ry,2.9,H1-.4,{fill:'G',band:iron,bandItem:'vIron',bw:.14});}}
 // Main hipped roof + raised iron-and-glass clerestory monitor lantern along the ridge
 vnHipRoof('maHipTile',0,Y0+H1,0,W-1.2,D-1.2,2.2,0,tile,.35);
 vnBody('vIron',0,Y0+H1+1.8,0,W-8.0,HC,6.4,0,iron,{t:.22});
 for(const s of[-1,1])for(let k=-3;k<=3;k++)maShutterWin(k*2.2,Y0+H1+2.1,s*3.2,s>0?0:Math.PI,1.8,1.4,false,iron,iron,null);
 vnGableRoof(0,Y0+H1+1.8+HC,0,W-7.6,6.8,1.5,0,'maGableTile',tile,.3,'vGableW',iron,.15);
 // Central pediments over the +z and -z market entrances + colorful market stalls & crates inside and outside
 for(const s of[-1,1]){
  vB('vPlaster',0,Y0+H1,s*(ZF-.25),6.4,1.6,.45,0,wash);
  maBand(0,Y0+H1+1.6,s*(ZF-.25),6.6,.55,0,st,.1,.18,'maCantera');}
 for(const x of[-6.4,-3.2,3.2,6.4])vnAwning(x,Y0+2.8,ZF+.2,0,2.8,1.5,x<0?or:vC(0x2c6e8a));
 vnCrate(-4.2,Y0,ZF+.8,.75,.1,wood);vnSacks(4.2,Y0,ZF+.8,5);vnFolk(0,ZF+1.2,3,1.5);}

// ---------------------------------------------------------------- 7. PORTAL DE LOS MERCADERES (middle/trade): Antiguan 2-storey stone arcade & shops
function buildMarPortalArcade(G,o){reseed(9981+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Portal de los Mercaderes arcade (trade)',0,0,12.5,11.2,{type:['trade','shops'],wealth:'middle',role:'trader'});
 const W=23.2,D=12.8,Z0=-1.1,Y0=.35,H1=4.0,H2=3.6,HT=H1+H2,ZF=Z0+D/2;
 vB('maCantera',0,-.1,0,W+.6,Y0+.1,D+2.8,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,HT,D,0,wash,{t:.3});
 maQuoins(0,Y0,Z0,W,HT,D,0,st,.48);
 // Deep vaulted ground-floor stone portal colonnade (depth 2.4 m in front of ZF) with 6 Tuscan stone arches!
 const AZ=ZF+2.2,span=3.1,pier=.62,LA=6*span+7*pier;
 vB('maCantera',0,Y0+H1-.25,ZF+1.1,W+.2,.35,2.4,0,st);
 maArcade(0,Y0,AZ,0,6,span,H1-.25,pier,st,or,{col:true,fill:'O'});
 for(const s of[-1,1])maArch(s*(W/2-.15),Y0,ZF+1.1,s*Math.PI/2,1.9,H1-.35,{fill:'O',band:st,bw:.16});
 // Upper storey: full-width wrought-iron balustrade along the top of the stone arcade + 6 arched windows with shutters
 maBalcony(0,Y0+H1+.15,AZ-.35,0,W-.4,.7,st,iron);
 for(let k=0;k<6;k++){const x=-LA/2+pier+span/2+k*(span+pier);
  // ground shopfront aligned behind each open stone arcade bay + upper French door opening onto the terrace
  maArch(x,Y0,ZF,0,2.2,3.0,{fill:k%2===0?'DOOR':'G',band:or,leafC:wood,bw:.14,front:k===2});
  maArch(x,Y0+H1+.2,ZF,0,1.5,2.65,{fill:'G',band:st,shutters:wood,bw:.14});}
 maParapet(0,Y0+HT,Z0,W,D,0,wash,st,.8,true);
 vnHipRoof('maHipTile',0,Y0+HT+.15,Z0,W-.6,D-.6,2.1,0,tile,.15);
 vnFolk(-3.5,AZ-.8,2,1.4);vnFolk(3.5,AZ-.8,2,1.4);}

// ---------------------------------------------------------------- 8. RING SEA BOATYARD & CARAVEL SLIP (middle/industry): vaulted brick atarazana & hull in frame
function buildMarBoatyardSlip(G,o){reseed(9986+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Atarazana boatyard and caravel slip (industry)',0,0,11.5,10.5,{type:['industry'],wealth:'middle',role:'shipwright'});
 // water basin along +z (z = 3.5..8.5)
 if(typeof window==='undefined'||!window.CITY)vB('maWater',0,-.45,6.0,21.4,.18,5.2,0,vC(0x1e5262));
 vB('maCantera',0,-.3,-2.2,21.2,1.3,11.4,0,stD);
 // Twin vaulted medieval/colonial brick-and-stone shipyard sheds (Atarazanas) on -x (x = -4.6, z = -2.6, w = 11.2, d = 10.2)
 vnBody('vPlaster',-4.6,1.0,-2.6,11.2,5.2,10.2,0,wash,{t:.28});
 maQuoins(-4.6,1.0,-2.6,11.2,5.2,10.2,0,st,.46);
 for(const s of[-1,1]){const sx=-4.6+s*2.8;
  vnGableRoof(sx,6.2,-2.6,5.6,10.2,1.9,0,'maGableTile',tile,.3,'vGablePl',wash,.18);
  maArch(sx,1.0,2.5,0,3.2,4.2,{fill:'O',cut:true,band:st,key:or,bw:.18});}
 maArch(-9.1,1.0,2.5,0,1.4,2.4,{fill:'DOOR',band:st,leafC:wood,bw:.14,front:true});
 vnStairs(-9.1,0,3.8,0,2.0,1.0,5,'maCantera',st);
 // Sloping timber launch slipway on +x (x = 5.4, z = -1.5..+6.5) with a Ring Sea caravel hull in ribs & keel!
 vBq('vWood',5.4,.35,2.4,4.6,.18,9.2,qEuler(.14,0,0),wood);
 // Caravel keel, stem/sternposts, and 7 curved timber frame ribs on the stocks
 vBq('vWood',5.4,1.1,1.6,.35,.45,7.8,qEuler(.14,0,0),wood);
 for(let k=-3;k<=3;k++){const rz=1.6+k*1.05,ry=1.25-k*.14,rw=2.4-Math.abs(k)*.24;
  vB('vWood',5.4,ry,rz,rw,.22,.2,0,wood);
  for(const s of[-1,1])vBq('vWood',5.4+s*(rw/2-.1),ry+.85,rz,.18,1.5,.2,qEuler(0,0,-s*.22),wood);}
 // Timber A-frame shearlegs crane beside the slipway (x = 1.6, z = 2.8) + stacked ship timber & pitch cauldron
 vBeam([.8,1.0,2.2],[2.2,6.4,3.4],.16,wood);vBeam([2.4,1.0,2.2],[2.2,6.4,3.4],.16,wood);
 vBeam([1.6,1.0,1.0],[2.2,6.4,3.4],.14,wood);vPst('vIron',2.2,3.4,3.4,.03,3.0,iron);
 for(let k=0;k<4;k++)vB('vWood',8.8,1.0+.22*k,-2.4,1.2,.2,4.6,0,wood);
 vnBarrel(1.4,1.0,-1.2,.36,.88,wood);vnFolk(3.2,1.8,2,1.2);}

VERN.def({key:'mar_smuggler_warehouse',name:'Smuggler\'s canal warehouse',family:'trade',tags:{type:['trade','warehouse'],wealth:'poor',lit:false,role:'warehouseman',job:'hauling'},w:20,d:15,h:12.0,build:buildMarSmugglerWarehouse});
VERN.def({key:'mar_cantina',name:'Smuggler\'s cantina',family:'trade',tags:{type:['tavern/inn','trade'],wealth:'poor',lit:false,role:'innkeeper',job:'hospitality'},w:16,d:14,h:10.5,build:buildMarCantina});
VERN.def({key:'mar_lantern_house',name:'Lantern house and gambling den',family:'trade',tags:{type:['tavern/inn','trade'],wealth:'middle',lit:true,role:'innkeeper',job:'hospitality'},w:17,d:15,h:12.8,build:buildMarLanternHouse});
VERN.def({key:'mar_chandlery',name:'Ship\'s chandlery and chart shop',family:'trade',tags:{type:['trade','workshop'],wealth:'middle',lit:false,role:'trader',job:'trade'},w:16,d:13,h:10.2,build:buildMarChandlery});
VERN.def({key:'mar_rum_bodega',name:'Rum distillery and aging bodega',family:'industry',tags:{type:['industry','trade'],wealth:'middle',lit:false,role:'brewer',job:'brewing'},w:22,d:16,h:11.2,build:buildMarRumBodega});
VERN.def({key:'mar_mercado_hall',name:'Mercado de Hierro market hall',family:'trade',tags:{type:['market','trade'],wealth:'middle',lit:false,role:'trader',job:'trade'},w:26,d:18,h:11.8,build:buildMarMercadoHall});
VERN.def({key:'mar_portal_arcade',name:'Portal de los Mercaderes arcade',family:'trade',tags:{type:['trade','shops'],wealth:'middle',lit:false,role:'trader',job:'trade'},w:24,d:15,h:11.2,build:buildMarPortalArcade});
VERN.def({key:'mar_boatyard_slip',name:'Atarazana boatyard and caravel slip',family:'industry',tags:{type:['industry'],wealth:'middle',lit:false,role:'shipwright',job:'carpentry'},w:22,d:18,h:10.5,build:buildMarBoatyardSlip});
