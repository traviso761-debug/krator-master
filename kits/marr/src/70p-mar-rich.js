// ================================================================= 70p. MARR: rich dwellings — Qartar de Gardonz & fincas (PLAN.md section 4.5)
// Seeds 9916-9949. The aristocratic walled villas and merchant palaces of the Garden Quarter (Qartar de Gardonz) and the
// surrounding plantation fincas: every mansion integrates a lush inhabited Korta de Plejar (azulejo fountain pool, citrus
// & palm planters, cloister arcades), New Orleans double wrought-iron lacework galleries, Baroque stone portals, and
// corner belvedere towers (miradores). All rich dwellings are lit (lit: true).

// ---------------------------------------------------------------- 1. GARDEN QUARTER MANSION (rich, lit): double NOLA iron galleries + walled fountain court
function buildMarGardenMansion(G,o){reseed(9916+(o.v|0));
 const wash=MA_LIME(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Garden Quarter mansion (rich)',0,0,14.5,13.5,{type:['residence'],wealth:'rich',role:'noble'});
 const W=25.6,D=22.4,Y0=.45,H1=4.2,H2=3.9,HT=H1+H2;
 vB('maCantera',0,-.1,0,W+.6,Y0+.1,D+.6,0,st);
 // L-plan 2-storey mansion (main house on -x/rear, side salon wing on -x/front) embracing a walled pleasure garden on +x!
 // Main block (x = -3.8, z = -4.6, w = 17.6, d = 11.6)
 const MX=-3.8,MZ=-4.6,MW=17.6,MD=11.6;
 vnBody('vPlaster',MX,Y0,MZ,MW,HT,MD,0,wash,{t:.32});
 maQuoins(MX,Y0,MZ,MW,HT,MD,0,st,.52);
 maBand(MX,Y0+H1,MZ,MW,MD,0,st,.16,.24,'maCantera');
 maParapet(MX,Y0+HT,MZ,MW,MD,0,wash,st,.85,true);
 vnHipRoof('maHipTile',MX,Y0+HT+.2,MZ,MW-.6,MD-.6,2.2,0,tile,.15);
 // Full-width 2-storey New Orleans wrought-iron lacework gallery along the main front (+z = MZ + MD/2 = 1.2)
 maIronGallery(MX,Y0+H1,1.2,0,MW-.4,2.2,H2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true,y0:Y0});
 maCanteraPortal(1.6,Y0,1.2,0,2.4,3.5,st,or,wood,{pediment:true});
 for(const dx of[-6.2,-3.2,0,6.2]){
  maArch(MX+dx,Y0+.2,1.2,0,1.5,2.9,{fill:'L',band:st,shutters:wood,bw:.15});
  maArch(MX+dx,Y0+H1+.2,1.2,0,1.5,2.8,{fill:'L',band:st,shutters:wood,bw:.14});}
 // West street pavilion wing (x = -8.6, z = 5.8, w = 8.0, d = 9.2)
 vnBody('vPlaster',-8.6,Y0,5.8,8.0,HT,9.2,0,wash,{t:.3});
 maQuoins(-8.6,Y0,5.8,8.0,HT,9.2,0,st,.48);
 maBand(-8.6,Y0+H1,5.8,8.0,9.2,0,or,.14,.22);
 vnHipRoof('maHipTile',-8.6,Y0+HT,5.8,8.0,9.2,1.9,0,tile,.32);
 maMirador(-8.6,Y0+H1+.3,10.4,0,3.6,2.8,.95,wood,st,tile,true);
 maCanteraPortal(-8.6,Y0,10.4,0,2.2,3.2,st,or,wood,{pediment:false,front:true});
 vnStairs(-8.6,0,11.4,0,3.6,Y0,3,'maCantera',st);
 // Inhabited Walled Pleasure Garden (Korta de Plejar) occupying the +x,+z quadrant (x = 4.2, z = 4.2, w = 15.6, d = 13.2)!
 maPatioPleasure(4.2,Y0,4.2,14.8,12.4,0,{lamps:true});
 // Low ornamental stone-and-iron garden wall enclosing the +x and +z garden edges with a Baroque carriage gate
 vB('vPlaster',12.4,Y0,0,.4,2.8,D-.4,0,wash);
 vBq('maTileB',12.4,Y0+2.92,0,.65,.14,D,vQ(0,0,.15),tile);
 for(const s of[-1,1]){
  vB('vPlaster',4.2+s*5.2,Y0,10.8,6.0,1.2,.4,0,wash);
  vB('maCantera',4.2+s*5.2,Y0+1.2,10.8,6.2,.14,.5,0,st);
  vB('vIron',4.2+s*5.2,Y0+2.6,10.8,6.0,.05,.05,0,iron);}
 // wrought-iron spear fence along the top of the front garden wall so the fountain & palms are visible from the street!
 for(let x=-3.2;x<=11.6;x+=.35){if(Math.abs(x-4.2)<2.2)continue;
  vB('vIron',x,Y0+1.34,10.8,.03,1.35,.03,0,iron);}
 maCanteraPortal(4.2,Y0,10.8,0,3.2,3.4,st,or,wood,{pediment:true,gate:true});
 vnStairs(4.2,0,11.6,0,4.2,Y0,3,'maCantera',st);}

// ---------------------------------------------------------------- 2. PALACIO BARROCO (rich, lit): Antiguan merchant palace + twin mirador towers + central fountain cloister
function buildMarPalacioBaroque(G,o){reseed(9921+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE(),az=MA_AZ();
 vnReg('Palacio barroco (rich)',0,0,15.5,15.8,{type:['residence'],wealth:'rich',role:'noble'});
 const W=27.2,D=23.6,Y0=.48,H1=4.2,H2=3.9,HT=H1+H2,ZF=D/2;
 vB('maCantera',0,-.1,0,W+.6,Y0+.1,D+.6,0,st);
 vnStairs(0,0,ZF+1.2,0,5.6,Y0,4,'maCantera',st);
 // 4-wing courtyard palace wrapping a 13.6 x 10.4 m arcaded central Korta de Plejar (all 4 wings hollow)
 for(const [lx,lz,lw,ld,hol] of[[0,8.6,W,6.4,true],[0,-8.6,W,6.4,true],[-10.4,0,6.4,7.2,true],[10.4,0,6.4,7.2,true]]){
  if(hol)vnBody('vPlaster',lx,Y0,lz,lw,HT,ld,0,wash,{t:.32});
  else vB('vPlaster',lx,Y0,lz,lw,HT,ld,0,wash);
  maBand(lx,Y0+H1,lz,lw,ld,0,st,.16,.24,'maCantera');
  maParapet(lx,Y0+HT,lz,lw,ld,0,wash,st,.85,false);
  vnHipRoof('maHipTile',lx,Y0+HT+.15,lz,lw-.5,ld-.5,1.8,0,tile,.1);}
 maQuoins(0,Y0,0,W,HT,D,0,st,.55);
 // Twin 3-storey corner belvedere towers (torres-mirador) at (-W/2+3.2, ZF-3.2) and (+W/2-3.2, ZF-3.2)
 for(const s of[-1,1]){const tx=s*(W/2-3.2),tz=ZF-3.2,TH=3.6;
  vnBody('vPlaster',tx,Y0+HT,tz,6.4,TH,6.4,0,wash,{t:.28});
  maQuoins(tx,Y0+HT,tz,6.4,TH,6.4,0,st,.46);
  maParapet(tx,Y0+HT+TH,tz,6.4,6.4,0,wash,st,.7,true);
  vnHipRoof('maHipTile',tx,Y0+HT+TH+.15,tz,6.0,6.0,1.9,0,tile,.25);
  for(const a of[0,s*Math.PI/2,Math.PI])for(const d of[-1.3,1.3]){
   const p=loc(tx,tz,d,3.2,a);maArch(p[0],Y0+HT+.45,p[1],a,1.35,2.45,{fill:'L',band:st,bw:.14});}}
 // Populate the central 13.6 x 10.4 m courtyard with the Pleasure & Fountain Court + stone cloister arcades & rear door
 maPatioPleasure(0,Y0,0,13.2,10.0,0,{lamps:true});
 maArcade(0,Y0,5.3,Math.PI,4,2.4,3.3,.55,st,or,{col:true,fill:'L'});
 maArch(0,Y0,-5.4,0,2.2,3.2,{fill:'DOOR',band:st,leafC:wood,bw:.16});
 for(const s of[-1,1])maArch(s*4.2,Y0,-5.4,0,2.2,3.2,{fill:'L',band:or,bw:.15});
 // Grand Antiguan Baroque front facade (+z = 11.8): monumental carved cantera portal + 6 wrought-iron balconies + rejas
 maCanteraPortal(0,Y0,ZF,0,2.8,3.9,st,or,wood,{pediment:true,front:true});
 for(const x of[-10.4,-6.8,-3.6,3.6,6.8,10.4]){
  maShutterWin(x,Y0+.85,ZF,0,1.35,1.85,true,st,wood,iron);
  maBalcony(x,Y0+H1+.15,ZF,0,2.6,.85,st,iron);
  maArch(x,Y0+H1+.25,ZF,0,1.5,2.75,{fill:'L',band:st,shutters:wood,bw:.15});}
 // small azulejo cupola over the rear chapel bay
 maBaroqueDome(0,Y0+HT+.6,-8.6,2.2,1.6,wash,'maDomeAz',az,st,false);}

// ---------------------------------------------------------------- 3. AZULEJO FOUNTAIN VILLA (rich, lit): open arcaded front court + azulejo dome
function buildMarAzulejoVilla(G,o){reseed(9926+(o.v|0));
 const wash=MA_LIME(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),az=MA_AZ(),tile=MA_TILE();
 vnReg('Azulejo fountain villa (rich)',0,0,12.5,13.8,{type:['residence'],wealth:'rich',role:'noble'});
 const W=21.6,D=19.6,Y0=.4,H1=4.0,H2=3.7,HT=H1+H2;
 vB('maCantera',0,-.1,0,W+.6,Y0+.1,D+.6,0,st);
 // U-plan villa opening forward (+z) so its lush azulejo fountain court is framed by two projecting side wings!
 vnBody('vPlaster',0,Y0,-5.4,W,HT,8.4,0,wash,{t:.3});
 maQuoins(0,Y0,-5.4,W,HT,8.4,0,st,.48);
 maBand(0,Y0+H1,-5.4,W,8.4,0,az,.14,.24,'maAzulejo');
 vnHipRoof('maHipTile',0,Y0+HT,-5.4,W,8.4,2.1,0,tile,.32);
 // central octagonal drum & cobalt azulejo dome crowning the main salon!
 maBaroqueDome(0,Y0+HT+1.2,-5.4,3.1,2.2,wash,'maDomeAz',az,st,true);
 // Twin projecting side wings (x = ±8.2, z = 4.2, w = 5.2, d = 10.8) with Barcelona miradors & street portals on +z = 9.6
 for(const s of[-1,1]){const wx=s*8.2,wz=4.2;
  vnBody('vPlaster',wx,Y0,wz,5.2,HT,10.8,0,wash,{t:.28});
  maQuoins(wx,Y0,wz,5.2,HT,10.8,0,st,.45);
  maBand(wx,Y0+H1,wz,5.2,10.8,0,az,.12,.22,'maAzulejo');
  vnHipRoof('maHipTile',wx,Y0+HT,wz,5.2,10.8,1.65,0,tile,.3);
  maMirador(wx,Y0+H1+.3,9.6,0,3.2,2.7,.9,wood,st,tile,true);
  maCanteraPortal(wx,Y0,9.6,0,2.0,3.0,st,az,wood,{pediment:false,front:s<0});
  vnStairs(wx,0,10.5,0,3.2,Y0,3,'maCantera',st);}
 // Ground portal & upper iron gallery across the recessed rear main block (z = -1.2)
 maCanteraPortal(0,Y0,-1.2,0,2.2,3.2,st,az,wood,{pediment:false});
 for(const s of[-1,1])maArch(s*3.6,Y0,-1.2,0,2.2,3.1,{fill:'L',band:az,bw:.15});
 maIronGallery(0,Y0+H1,-1.2,0,10.6,1.65,H2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true});
 // Populate the 10.8 x 10.4 m front courtyard with the Pleasure & Fountain Court + front wrought-iron screen gate
 maPatioPleasure(0,Y0,4.2,10.4,9.8,0,{lamps:true});
 for(let x=-5.2;x<=5.2;x+=.35){if(Math.abs(x)<1.8)continue;vB('vIron',x,Y0,9.5,.03,2.2,.03,0,iron);}
 vB('vIron',0,Y0+2.15,9.5,11.0,.05,.05,0,iron);
 for(const s of[-1,1]){vB('maCantera',s*1.9,Y0,9.5,.65,3.1,.65,0,st);kput('maUrnAz',[s*1.9,Y0+3.1,9.5],null,[.34,.56,.34],az);}}

// ---------------------------------------------------------------- 4. SEA-CAPTAIN'S HOUSE (rich, lit): rooftop widow's walk & brass telescope cupola
function buildMarCaptainsHouse(G,o){reseed(9931+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Sea-captain\'s belvedere house (rich)',0,0,10.5,14.8,{type:['residence'],wealth:'rich',role:'noble'});
 const W=16.8,D=15.6,Y0=.42,H1=3.9,H2=3.6,H3=3.3,HT=H1+H2+H3,ZF=D/2;
 vB('maCantera',0,-.1,0,W+.5,Y0+.1,D+2.4,0,st);
 vnBody('vPlaster',0,Y0,0,W,HT,D,0,wash,{t:.3});
 maQuoins(0,Y0,0,W,HT,D,0,st,.48);
 maBand(0,Y0+H1,0,W,D,0,st,.14,.22,'maCantera');
 maBand(0,Y0+H1+H2,0,W,D,0,or,.14,.2);
 maParapet(0,Y0+HT,0,W,D,0,wash,st,.8,true);
 vnHipRoof('maHipTile',0,Y0+HT+.15,0,W-.6,D-.6,2.1,0,tile,.15);
 // Rooftop octagonal Captain's Belvedere Cupola & Widow's Walk iron gallery looking out to the Ring Sea!
 {const ry=Y0+HT+1.9;
  vB('vWood',0,ry,0,6.4,.22,6.4,0,wood);
  for(const s of[-1,1]){
   vB('vIron',0,ry+.9,s*3.1,6.4,.04,.04,0,iron);
   vB('vIron',s*3.1,ry+.9,0,.04,.04,6.4,0,iron);}
  maHollowDrum(0,ry+.22,0,2.1,2.6,'vPlaster',MA_LIME(),[0,1,2,3,4,5,6,7].map(k=>({a:k*TAU/8,y0:.45,w:.85,h:1.55,lit:true})),{band:st,wood});
  kput('maDomeCu',[0,ry+2.82,0],null,[2.2,1.55,2.2],null);
  vPst('vIron',0,ry+4.3,0,.05,1.4,iron);}
 // 2-storey NOLA wrought-iron gallery on the street facade (+z) + carved stone portal
 maIronGallery(0,Y0+H1,ZF,0,W-.4,2.0,H2,iron,wood,{storeys:2,h2:H3,roof:true,tileC:tile,pots:true});
 for(let k=0;k<6;k++)vPst('vIron',-W/2+.6+k*(W-1.2)/5,Y0,ZF+1.92,.06,H1,iron);
 maCanteraPortal(0,Y0,ZF,0,2.3,3.3,st,or,wood,{pediment:true,front:true});
 for(const x of[-5.4,-2.7,2.7,5.4]){
  maShutterWin(x,Y0+.8,ZF,0,1.3,1.75,true,st,wood,iron);
  for(const yy of[Y0+H1+.15,Y0+H1+H2+.15])maArch(x,yy,ZF,0,1.4,2.55,{fill:'L',band:st,shutters:wood,bw:.14});}}

// ---------------------------------------------------------------- 5. CONSULADO FACTOR'S HOUSE (rich, lit): Bruges gable + Baroque courtyard house
function buildMarConsuladoHouse(G,o){reseed(9936+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Consulado factor\'s house (rich)',0,0,11.5,13.5,{type:['residence','trade'],wealth:'rich',role:'trader'});
 const W=18.8,D=17.6,Y0=.4,H1=4.0,H2=3.7,HT=H1+H2,ZF=D/2;
 vB('maCantera',0,-.1,0,W+.5,Y0+.1,D+.5,0,st);
 // U-plan merchant house with twin Bruges stepped gables flanking a central Baroque portal, and a rear fountain court
 vnBody('vPlaster',0,Y0,3.8,W,HT,9.6,0,wash,{t:.3});
 maQuoins(0,Y0,3.8,W,HT,9.6,0,st,.48);
 maBand(0,Y0+H1,3.8,W,9.6,0,st,.15,.22,'maCantera');
 vnHipRoof('maHipTile',0,Y0+HT,3.8,W,9.6,2.1,0,tile,.3);
 // Twin Bruges stepped gables at x = -5.6 and x = +5.6 on the front (+z = 8.6)
 for(const s of[-1,1]){
  maBrugesGable(s*5.6,Y0+HT,ZF-.2,0,6.4,3.4,6,wash,st,true);
  maMirador(s*5.6,Y0+H1+.25,ZF-.2,0,3.2,2.7,.9,wood,st,tile,true);
  maArch(s*5.6,Y0,ZF-.2,0,2.5,3.0,{fill:'L',band:st,leafC:wood,bw:.16});}
 maCanteraPortal(0,Y0,ZF-.2,0,2.5,3.5,st,or,wood,{pediment:true,front:true});
 maBalcony(0,Y0+H1+.15,ZF-.2,0,3.8,.85,st,iron);
 maArch(0,Y0+H1+.25,ZF-.2,0,1.65,2.65,{fill:'L',band:st,shutters:wood,bw:.15});
 // Rear walled Pleasure & Fountain Courtyard (-z = -4.6)
 vB('vPlaster',0,Y0,-8.5,W,2.9,.38,0,wash);
 for(const s of[-1,1])vB('vPlaster',s*(W/2-.2),Y0,-4.6,.38,2.9,8.0,0,wash);
 maPatioPleasure(0,Y0,-4.6,W-1.6,7.4,0,{lamps:true});}

// ---------------------------------------------------------------- 6. PERIPHERAL HACIENDA / FINCA (rich, lit): sprawling arcaded villa + bell wall + vegetable & pleasure courts
function buildMarHacienda(G,o){reseed(9941+(o.v|0));
 const wash=MA_SAFFRON?MA_OCHRE():MA_OCHRE(),wash2=MA_LIME(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Suburban hacienda finca (rich)',0,0,16.5,11.5,{type:['residence','farm'],wealth:'rich',role:'farmer'});
 const W=29.6,D=23.6,Y0=.35,H1=3.8,H2=3.4;
 vB('maCantera',0,-.1,0,W+.6,Y0+.1,D+.6,0,st);
 // Main 2-storey manor house along the rear (-z = -6.8, w = 29.6, d = 8.4 -> z = -11.0..-2.6)
 vnBody('vPlaster',0,Y0,-6.8,W,H1+H2,8.4,0,wash,{t:.3});
 maQuoins(0,Y0,-6.8,W,H1+H2,8.4,0,st,.48);
 maBand(0,Y0+H1,-6.8,W,8.4,0,or,.14,.22);
 vnHipRoof('maHipTile',0,Y0+H1+H2,-6.8,W,8.4,2.2,0,tile,.38);
 // Chapel wing on +x (x = 11.4, z = 2.9, w = 6.4, d = 11.0 -> z = -2.6..+8.4) crowned by a 2-bell espadaña bell-gable!
 vnBody('vPlaster',11.4,Y0,2.9,6.4,H1+1.8,11.0,0,wash2,{t:.28});
 vnGableRoof(11.4,Y0+H1+1.8,2.9,6.4,11.0,1.9,0,'maGableTile',tile,.32,'vGablePl',wash2,.18);
 maEspadana(11.4,Y0+H1+3.2,8.4,0,4.8,3.6,wash2,st,2);
 maCanteraPortal(11.4,Y0,8.4,0,2.0,3.0,st,or,wood,{pediment:false,front:true});
 // Stable & olive/citrus press wing on -x (x = -11.6, z = 2.9, w = 6.0, d = 11.0 -> z = -2.6..+8.4)
 vnBody('vPlaster',-11.6,Y0,2.9,6.0,H1,11.0,0,wash,{t:.26});
 vnHipRoof('maHipTile',-11.6,Y0+H1,2.9,6.0,11.0,1.6,0,tile,.3);
 maArch(-11.6,Y0,8.4,0,2.2,2.8,{fill:'DOOR',band:st,leafC:wood,bw:.16});
 // Ground portal, flank arches & upper iron gallery along the main manor facing the central court (z = -2.6)
 maCanteraPortal(0,Y0,-2.6,0,2.2,3.1,st,or,wood,{pediment:false});
 for(const dx of[-6.4,-3.4,3.4,6.4])maArch(dx,Y0,-2.6,0,2.2,3.0,{fill:'L',band:or,bw:.15});
 maIronGallery(0,Y0+H1,-2.6,0,16.8,1.6,H2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true});
 for(let k=-2;k<=2;k++)maArch(k*3.2,Y0+H1+.15,-2.6,0,1.4,2.45,{fill:'L',band:st,shutters:wood,bw:.12});
 // Divided grand courtyard: west half is a Kitchen/Orchard Garden (maPatioVegetable), east half is a Fountain Court (maPatioPleasure)!
 maPatioVegetable(-4.2,Y0,3.2,7.6,9.6,0,{shed:false});
 maPatioPleasure(4.0,Y0,3.2,7.6,9.6,0,{lamps:true});
 // Front tapia wall (+z = 11.2) with arched hacienda gatehouse portal
 for(const s of[-1,1]){vB('vPlaster',s*8.2,Y0,11.2,11.2,2.8,.38,0,wash);
  vBq('maTileB',s*8.2,Y0+2.92,11.2,11.4,.14,.62,vQ(.15,0,0),tile);}
 maCanteraPortal(0,Y0,11.2,0,3.4,3.5,st,or,wood,{pediment:true,gate:true});}

VERN.def({key:'mar_garden_mansion',name:'Garden Quarter mansion',family:'dwellings',tags:{type:['residence'],wealth:'rich',lit:true,role:'noble',job:'household'},w:27,d:24,h:13.5,build:buildMarGardenMansion});
VERN.def({key:'mar_palacio_baroque',name:'Palacio barroco',family:'dwellings',tags:{type:['residence'],wealth:'rich',lit:true,role:'noble',job:'household'},w:29,d:26,h:15.8,build:buildMarPalacioBaroque});
VERN.def({key:'mar_azulejo_villa',name:'Azulejo fountain villa',family:'dwellings',tags:{type:['residence'],wealth:'rich',lit:true,role:'noble',job:'household'},w:23,d:21,h:14.2,build:buildMarAzulejoVilla});
VERN.def({key:'mar_captains_house',name:'Sea-captain\'s belvedere house',family:'dwellings',tags:{type:['residence'],wealth:'rich',lit:true,role:'noble',job:'household'},w:18,d:19,h:15.2,build:buildMarCaptainsHouse});
VERN.def({key:'mar_consulado_house',name:'Consulado factor\'s house',family:'dwellings',tags:{type:['residence','trade'],wealth:'rich',lit:true,role:'trader',job:'trade'},w:20,d:19,h:13.5,build:buildMarConsuladoHouse});
VERN.def({key:'mar_hacienda',name:'Suburban hacienda finca',family:'dwellings',tags:{type:['residence','farm'],wealth:'rich',lit:true,role:'farmer',job:'farming'},w:31,d:25,h:11.5,build:buildMarHacienda});
