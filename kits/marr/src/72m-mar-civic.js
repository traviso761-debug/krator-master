// ================================================================= 72m. MARR: civic & harbour landmarks (PLAN.md section 4.7, section 6)
// Seeds 10031-10059. Marr's great civic and maritime monuments:
// 1. Gilda de Navigarz (Navigators' Guild Headquarters, 54 x 44 x 24 m) — laid out on kits/marr/blueprint/navigators_G.png
// 2. Templa de Mar (Baroque Sea-Temple / Cathedral, 44 x 28 x 25 m)
// 3. Aduana Maritima (Grand Harbour Customs Palace, 36 x 24 x 15 m)

// ---------------------------------------------------------------- 1. NAVIGATORS' GUILD HEADQUARTERS (civic, lit): Gilda de Navigarz
function buildMarNavigatorsGuild(G,o){reseed(10031+(o.v|0));
 const wash=MA_OCHRE(),washL=MA_LIME(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),wood=MA_WOOD(),iron=MA_IRON(),az=MA_AZ(),tile=MA_TILE();
 // register the blueprint's functional domains (PLAN.md section 6)
 vnReg('Navigators\' Guild — Korta de Kompas (Compass Courtyard)',0,0,12,12,{type:['civic','guild'],role:'guild_officer'});
 vnReg('Navigators\' Guild — Ol de Selarz (Mariners\' Exchange Lonja)',-16,0,10,14,{type:['civic','guild'],role:'guild_officer'});
 vnReg('Navigators\' Guild — Ol de Chartaz (Hydrographic Chart Hall)',0,-12,14,15,{type:['civic','guild'],role:'scribe'});
 vnReg('Navigators\' Guild — Astrolabe Observatory Dome',-16,-12,7,22.5,{type:['civic','guild'],role:'scholar'});
 vnReg('Navigators\' Guild — Tauar de Laita (Harbour Signal Tower)',17,11,6,24.2,{type:['civic','infrastructure'],role:'lighthouse_keeper'});

 const W=46.0,D=36.0,Y0=.65,H1=5.2,H2=4.6,HT=H1+H2,ZF=D/2;
 // stepped volcanic cantera stone podium (y = 0..0.65) + broad harbour entrance stairs on +z
 vB('maCantera',0,-.2,0,W+1.6,Y0+.2,D+1.6,0,stD);
 vB('maCantera',0,Y0-.18,0,W+.8,.2,D+.8,0,st);
 maWalkFloor(0,Y0,0,W+1.6,D+1.6,0,'Gilda de Navigarz podium');
 vnStairs(0,0,ZF+1.6,0,9.6,Y0,5,'maCantera',st);

 // North & South hollow courtyard wings (46 x 11 m) + West & East side wings (11 x 14 m, abutting at z = ±7.0)
 for(const [lx,lz,lw,ld,hol] of[[0,-12.5,W,11.0,true],[0,12.5,W,11.0,true],[-17.5,0,11.0,14.0,true],[17.5,0,11.0,14.0,true]]){
  if(hol)vnBody('vPlaster',lx,Y0,lz,lw,HT,ld,0,wash,{t:.36});
  else vB('vPlaster',lx,Y0,lz,lw,HT,ld,0,wash);
  maBand(lx,Y0+H1,lz,lw,ld,0,st,.18,.26,'maCantera');
  maParapet(lx,Y0+HT,lz,lw,ld,0,wash,st,.9,false);
  vnHipRoof('maHipTile',lx,Y0+HT+.15,lz,lw-.8,ld-.8,2.2,0,tile,.15);}
 maQuoins(0,Y0,0,W,HT,D,0,st,.58);

 // ---- KORTA DE KOMPAS (Central Compass Courtyard, 24 x 14 m at x = 0, z = 0)
 vnPaving(0,Y0+.02,0,23.2,13.2,0,vC(0x9a8e7c),36);
 // Giant inlaid 16-point stone-and-azulejo Compass Rose medallion (radius 5.2 m) + bronze Armillary Sphere at (0, 0)!
 kput('maDiscAz',[0,Y0+.03,0],qEuler(Math.PI/2,0,0),[5.2,5.2,.04],az);
 kput('maRing',[0,Y0+.05,0],null,[5.25,5.25,1.6],st);
 kput('maDisc',[0,Y0+.05,0],qEuler(Math.PI/2,0,0),[3.6,3.6,.04],washL);
 kput('maDisc',[0,Y0+.07,0],qEuler(Math.PI/2,0,0),[1.8,1.8,.04],or);
 for(let k=0;k<8;k++){const a=k*Math.PI/4;
  vBq('maCantera',Math.sin(a)*2.6,Y0+.06,Math.cos(a)*2.6,.28,.04,4.8,vQ(a,0,0),k%2===0?or:st);}
 // Central bronze Armillary Sphere monument on a stepped octagonal cantera pedestal
 vPst('maDrumC',0,Y0,0,1.15,1.25,st);
 kput('maRing',[0,Y0+2.15,0],qEuler(.35,.2,0),[1.05,1.05,1.4],or);
 kput('maRing',[0,Y0+2.15,0],qEuler(-.4,1.1,0),[1.0,1.0,1.4],or);
 kput('maRing',[0,Y0+2.15,0],qEuler(Math.PI/2,0,0),[1.1,1.1,1.5],iron);
 vBall('vBallW',0,Y0+2.15,0,.28,az);
 // 4 corner courtyard planter beds with date palms & stone benches + inner courtyard doors & galleries
 for(const sx of[-1,1])for(const sz of[-1,1]){
  const px=sx*8.2,pz=sz*4.2;
  vnPlanter(px,Y0,pz,2.6,2.2,0,st);vnTree(px,Y0+.35,pz,3.8);
  vnLampPost(sx*5.2,Y0,sz*4.2,3.4);}
 for(const s of[-1,1]){const ry=s>0?Math.PI:0;
  maArch(0,Y0,s*7.0,ry,2.6,4.2,{fill:'DOOR',band:or,key:st,leafC:wood,bw:.16,open:true,sill:false});
  for(const dx of[-6.4,-3.2,3.2,6.4])maArch(dx,Y0+.8,s*7.0,ry,1.8,3.2,{fill:'L',band:st,bw:.14});
  maIronGallery(0,Y0+H1,s*7.0,ry,21.0,1.6,H2,iron,wood,{storeys:1,roof:false,pots:true});}

 // ---- ASTROLABE OBSERVATORY DOME (North-West Corner, x = -17.5, z = -12.5, rising to 22.5 m)
 {const ox=-17.5,oz=-12.5,oy=Y0+HT;
  vB('maCantera',ox,oy,oz,9.2,1.6,9.2,0,st);
  maHollowDrum(ox,oy+1.6,oz,4.2,4.2,'vPlaster',washL,[0,1,2,3,4,5,6,7].map(k=>({a:k*TAU/8,y0:.6,w:1.25,h:2.6,lit:true,bw:.14})),{band:st,wood});
  kput('maRing',[ox,oy+5.8,oz],null,[4.35,4.35,1.6],or);
  // Verdigris copper hemisphere observatory dome with brass observation slit & projecting telescope tube!
  kput('maDomeCu',[ox,oy+5.85,oz],null,[4.25,4.1,4.25],null);
  for(let k=0;k<8;k++)kput('maRib',[ox,oy+5.85,oz],vQ(k*TAU/8,0,0),[4.3,4.15,4.3],or);
  vBeam([ox,oy+7.8,oz],[ox+3.2,oy+10.2,oz+3.2],.26,or);
  kput('maRing',[ox,oy+10.5,oz],qEuler(.4,0,.4),[1.1,1.1,1.4],or);}

 // ---- TAUAR DE LAITA — HARBOUR SIGNAL & SEMAPHORE TOWER (South-East Corner, x = +17.5, z = +12.5, rising to 24.2 m)
 {const tx=17.5,tz=12.5,ty=Y0+HT;
  vnBody('vPlaster',tx,ty,tz,7.6,5.2,7.6,0,wash,{t:.32});
  maQuoins(tx,ty,tz,7.6,5.2,7.6,0,st,.48);
  maParapet(tx,ty+5.2,tz,7.6,7.6,0,wash,st,.7,true);
  for(const a of[0,Math.PI/2,Math.PI,-Math.PI/2])maArch(tx+Math.sin(a)*3.8,ty+.8,tz+Math.cos(a)*3.8,a,1.5,3.2,{fill:'L',band:st,bw:.15});
  // Octagonal azulejo-and-stone beacon lantern drum + semaphore yardarm mast
  maHollowDrum(tx,ty+5.2,tz,2.8,3.8,'maCantera',st,[0,1,2,3,4,5,6,7].map(k=>({a:(k+.5)*TAU/8,y0:.8,w:1.0,h:2.1,lit:true})),{band:or,wood});
  vBall('vBulb',tx,ty+7.2,tz,.72);
  kput('maDomeAz',[tx,ty+9.0,tz],null,[2.9,2.2,2.9],az);
  vPst('vIron',tx,ty+11.1,tz,.08,3.2,iron);
  vB('vIron',tx,ty+13.4,tz,3.8,.08,.08,0,iron);}

 // ---- HARBOUR FRONT FACADE (+z = +18.0) & WEST LONJA FACADE (-x = -23.0)
 // Central Antiguan Baroque Triple-Arch Portal + flanking 3-bay Tuscan stone arcades + upper NOLA wrought-iron gallery & Barcelona miradors!
 maCanteraPortal(0,Y0,ZF,0,3.4,4.5,st,or,wood,{pediment:true,front:true,sill:false});
 for(const s of[-1,1]){const cx=s*11.5;
  maArcade(cx,Y0,ZF,0,3,2.8,4.0,.62,st,or,{col:true,fill:'L'});
  maIronGallery(cx,Y0+H1,ZF,0,11.6,1.95,H2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true});
  for(const dx of[-3.6,0,3.6])maArch(cx+dx,Y0+H1+.2,ZF,0,1.55,2.9,{fill:'L',band:st,shutters:wood,bw:.14});}
 // Projecting Barcelona glazed Mirador over the main portal at (0, Y0+H1, ZF) + rooftop Baroque clock/compass crest
 maMirador(0,Y0+H1+.3,ZF,0,4.6,3.2,1.1,wood,st,tile,true);
 maEspadana(0,Y0+HT+.8,ZF-.2,0,6.4,3.8,wash,st,2);
 // West & East flank facades with tall Gothic-Colonial arched Lonja windows and projecting Chart Room miradors
 for(const s of[-1,1])for(let k=-2;k<=2;k++){const z=k*5.6;
  maArch(s*W/2,Y0+.8,z,s*Math.PI/2,1.8,3.6,{fill:'L',band:st,bw:.16});
  if(Math.abs(k)===1)maMirador(s*W/2,Y0+H1+.3,z,s*Math.PI/2,3.2,2.8,.9,wood,st,tile,true);
  else{maBalcony(s*W/2,Y0+H1+.15,z,s*Math.PI/2,2.8,.8,st,iron);
   maArch(s*W/2,Y0+H1+.25,z,s*Math.PI/2,1.5,2.7,{fill:'L',band:st,shutters:wood,bw:.14});}}
 vnFolk(-6.2,ZF+1.2,2,1.4);vnFolk(6.2,ZF+1.2,2,1.4);}

// ---------------------------------------------------------------- 2. BAROQUE SEA-TEMPLE / CATHEDRAL (civic, lit): Templa de Mar
function buildMarSeaTemple(G,o){reseed(10041+(o.v|0));
 const wash=MA_OCHRE(),washL=MA_LIME(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),wood=MA_WOOD(),az=MA_AZ(),tile=MA_TILE();
 vnReg('Templa de Mar Baroque sea-cathedral (civic)',0,0,22.0,25.5,{type:['civic','temple'],wealth:'civic',role:'priest'});
 const W=24.0,D=38.0,Y0=.75,HN=10.8,HT=14.8,ZF=D/2;
 vB('maCantera',0,-.2,0,W+3.2,Y0+.2,D+3.2,0,stD);
 maWalkFloor(0,Y0,0,W+3.2,D+3.2,0,'Templa de Mar podium');
 vnStairs(0,0,ZF+2.1,0,12.0,Y0,6,'maCantera',st);
 // Three-aisled basilica nave (w = 22.0, d = 34.0, h = 10.8, z = -1.0 -> front face at z = +16.0) + clerestory
 vnBody('vPlaster',0,Y0,-1.0,22.0,HN,34.0,0,wash,{t:.4});
 maQuoins(0,Y0,-1.0,22.0,HN,34.0,0,st,.58);
 maBand(0,Y0+5.4,-1.0,22.0,34.0,0,st,.18,.28,'maCantera');
 maParapet(0,Y0+HN,-1.0,22.0,34.0,0,wash,st,.85,true);
 vnBody('vPlaster',0,Y0+HN,-1.0,11.6,3.0,32.0,0,washL,{t:.32});
 vnGableRoof(0,Y0+HN+3.0,-1.0,11.6,32.0,2.4,0,'maGableTile',tile,.35,'vGablePl',washL,.2);
 // Great Octagonal Crossing Drum & Ribbed Cobalt Azulejo Dome (z = -7.5, rising to 25.0 m)!
 maBaroqueDome(0,Y0+HN+2.6,-7.5,5.2,4.2,washL,'maDomeAz',az,st,true);
 // Twin Antiguan/Havana Baroque Front Bell Towers at x = ±8.2, z = +13.2 (w = 6.4, d = 6.4, rising to 22.5 m)
 for(const s of[-1,1]){const tx=s*8.2,tz=13.2;
  vB('maCantera',tx,Y0,tz,6.6,5.6,6.6,0,st);
  vB('vPlaster',tx,Y0+5.6,tz,6.2,5.2,6.2,0,wash);
  maQuoins(tx,Y0+5.6,tz,6.2,5.2,6.2,0,st,.48);
  // Belfry stage (y = Y0+10.8..Y0+15.2) with arched bell openings & corner urns + octagonal azulejo cupola
  vB('vPlaster',tx,Y0+10.8,tz,5.6,4.4,5.6,0,washL);
  maQuoins(tx,Y0+10.8,tz,5.6,4.4,5.6,0,st,.42);
  maParapet(tx,Y0+15.2,tz,5.6,5.6,0,washL,st,.7,true);
  for(const a of[0,Math.PI/2,Math.PI,-Math.PI/2]){
   maArch(tx+Math.sin(a)*2.8,Y0+11.2,tz+Math.cos(a)*2.8,a,1.6,3.1,{fill:'O',band:st,bw:.16});}
  kput('vDomeC',[tx,Y0+13.2,tz],null,[.65,.75,.65],vC(0x7a6236));
  maBaroqueDome(tx,Y0+15.2,tz,2.2,2.2,washL,'maDomeAz',az,st,true);}
 // Monumental Churrigueresque / Antiguan Baroque Frontispiece between the towers (x = 0, z = +16.0)
 for(const s of[-1,1])vB('maCantera',s*3.6,Y0,16.1,3.0,13.8,.55,0,st);
 vB('maCantera',0,Y0+5.6,16.1,4.2,8.2,.55,0,st);
 maCanteraPortal(0,Y0,16.0,0,3.6,5.2,st,or,wood,{pediment:true,front:true,sill:false});
 // Upper niche & glowing stained-glass Rose Oculus + scrolled Baroque gable crown
 maOculus(0,Y0+8.8,16.0,0,1.65,true,or,wood);
 maEspadana(0,Y0+13.8,15.8,0,7.8,4.2,wash,st,1);
 // Side nave buttresses & lit arched windows
 for(const s of[-1,1])for(let z=-14;z<=6;z+=5.0){
  vB('maCantera',s*11.2,Y0,z,.65,HN-.4,.95,0,st);
  maArch(s*11.0,Y0+1.8,z,s*Math.PI/2,1.6,4.2,{fill:'L',band:st,bw:.16});
  maOculus(s*5.8,Y0+HN+1.5,z,s*Math.PI/2,.75,true,st,wood);}}

// ---------------------------------------------------------------- 3. GRAND MARITIME CUSTOMS HOUSE (civic, lit): Aduana Marítima
function buildMarAduana(G,o){reseed(10051+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),wood=MA_WOOD(),iron=MA_IRON(),az=MA_AZ(),tile=MA_TILE();
 vnReg('Aduana Marítima grand customs house (civic)',0,0,18.0,15.2,{type:['civic','trade'],wealth:'civic',role:'customs'});
 const W=34.0,D=22.0,Y0=.5,H1=4.4,H2=4.0,HT=H1+H2,ZF=D/2;
 vB('maCantera',0,-.15,0,W+1.2,Y0+.15,D+2.8,0,stD);
 maWalkFloor(0,Y0,0,W+1.2,D+2.8,0,'Aduana podium');
 vnStairs(0,0,ZF+1.8,0,8.4,Y0,4,'maCantera',st);
 // Front & Back hollow customs wings (34 x 6.4 m at z = ±7.8) + West & East side wings (6.4 x 9.2 m at x = ±13.8)
 for(const [lx,lz,lw,ld,hol] of[[0,7.8,W,6.4,true],[0,-7.8,W,6.4,true],[-13.8,0,6.4,9.2,true],[13.8,0,6.4,9.2,true]]){
  if(hol)vnBody('vPlaster',lx,Y0,lz,lw,HT,ld,0,wash,{t:.34});
  else vB('vPlaster',lx,Y0,lz,lw,HT,ld,0,wash);
  maBand(lx,Y0+H1,lz,lw,ld,0,st,.16,.24,'maCantera');
  maParapet(lx,Y0+HT,lz,lw,ld,0,wash,st,.85,true);
  vnHipRoof('maHipTile',lx,Y0+HT+.15,lz,lw-.6,ld-.6,2.0,0,tile,.15);}
 maQuoins(0,Y0,0,W,HT,D,0,st,.52);
 maPatioPleasure(0,Y0,0,15.2,8.8,0,{lamps:true});
 // Courtyard doors connecting the front and back wings to the central court
 maArch(0,Y0,4.6,Math.PI,2.4,3.8,{fill:'DOOR',band:or,key:st,leafC:wood,bw:.16,open:true,sill:false});
 maArch(0,Y0,-4.6,0,2.4,3.8,{fill:'DOOR',band:or,key:st,leafC:wood,bw:.16,open:true,sill:false});
 // Harbour Front (+z = +11.0): Central Baroque Portal + flanking 3-bay stone customs loggias + full-width NOLA iron gallery!
 maCanteraPortal(0,Y0,ZF,0,3.2,4.2,st,or,wood,{pediment:true,front:true,sill:false});
 for(const s of[-1,1]){const cx=s*9.8;
  maArcade(cx,Y0,ZF,0,3,2.6,3.8,.58,st,or,{col:true,fill:'L'});
  maIronGallery(cx,Y0+H1,ZF,0,10.8,1.9,H2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true});
  for(const dx of[-3.2,0,3.2])maArch(cx+dx,Y0+H1+.2,ZF,0,1.5,2.75,{fill:'L',band:st,shutters:wood,bw:.14});}
 // Central rooftop Baroque clock-gable & octagonal azulejo cupola with imperial banner
 maBaroqueDome(0,Y0+HT+1.0,7.8,2.8,2.4,MA_LIME(),'maDomeAz',az,st,true);
 vnBannerPole(0,Y0+HT+1.0,10.8,0,4.8,or);
 // Bonded cargo chests, brass weigh-beams & crates at the front loggia
 vnCrate(-6.5,Y0,ZF+.9,.85,.1,wood);vnBarrel(6.5,Y0,ZF+.9,.38,.9,wood);vnFolk(-4.8,ZF+1.2,2,1.4);}

VERN.def({key:'mar_navigators_guild',name:'Navigators\' Guild headquarters (Gilda de Navigarz)',family:'civic',tags:{type:['civic','guild'],wealth:'civic',lit:true,role:'guild_officer',job:'administration'},w:50,d:40,h:24.2,build:buildMarNavigatorsGuild});
VERN.def({key:'mar_sea_temple',name:'Templa de Mar Baroque sea-cathedral',family:'civic',tags:{type:['civic','temple'],wealth:'civic',lit:true,role:'priest',job:'clergy'},w:30,d:44,h:25.5,build:buildMarSeaTemple});
VERN.def({key:'mar_aduana',name:'Aduana Marítima customs house',family:'civic',tags:{type:['civic','trade'],wealth:'civic',lit:true,role:'customs',job:'administration'},w:36,d:26,h:15.2,build:buildMarAduana});
