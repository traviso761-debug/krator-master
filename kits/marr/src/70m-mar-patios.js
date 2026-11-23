// ================================================================= 70m. MARR: standalone inhabited courtyards (PLAN.md section 4.2)
// Seeds 9801-9819. These three courtyard modules (Korta de Plejar, Korta de Gardon, Yarda de Guorka) stand on the kit sheet
// to showcase Marr's inhabited courtyard typology, and are also placed inside subdivided cuadra lots in the city.

// ---------------------------------------------------------------- 1. PLEASURE & FOUNTAIN COURTYARD (rich, lit): Korta de Plejar
function buildMarPatioPleasure(G,o){reseed(9801+(o.v|0));
 const wash=MA_OCHRE(),st=MA_CANT(),or=MA_OR(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Pleasure and fountain courtyard — Korta de Plejar (rich)',0,0,8.5,4.5,{type:['residence','courtyard'],wealth:'rich'});
 const W=15.2,D=15.2,Y0=.18;
 vB('maCantera',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 // populate the interior with the pleasure court generator (azulejo fountain, 4 palm/citrus beds, benches, lamps)
 maPatioPleasure(0,Y0,0,W-2.4,D-2.4,0,{lamps:true});
 // low perimeter cloister wall (h = 3.2 m) with arched openings, terracotta tile coping, and front wrought-iron gate
 for(const s of[-1,1]){
  vB('vPlaster',s*(W/2-.18),Y0,0,.36,3.1,D,0,wash);
  vBq('maTileB',s*(W/2-.18),Y0+3.22,0,.62,.14,D+.2,vQ(0,0,s*.15),tile);
  for(const z of[-4.2,0,4.2])maArch(s*(W/2-.18),Y0+.65,z,s*Math.PI/2,1.6,1.85,{fill:'O',band:st,reja:iron,bw:.12});}
 // rear wall (-z) with pierced arched garden window & corner ceramic urns
 for(const s of[-1,1])vB('vPlaster',s*4.15,Y0,-D/2+.18,6.9,3.4,.36,0,wash);
 vB('vPlaster',0,Y0,-D/2+.18,1.8,.8,.36,0,wash);vB('vPlaster',0,Y0+2.9,-D/2+.18,1.8,.5,.36,0,wash);
 vBq('maTileB',0,Y0+3.52,-D/2+.18,W+.2,.14,.62,vQ(-.15,0,0),tile);
 maArch(0,Y0+.8,-D/2+.18,0,1.8,2.1,{fill:'L',band:or,key:st,bw:.14,card:false});
 // front wall (+z) with stone gate piers and ornate wrought-iron courtyard gate
 for(const s of[-1,1]){
  vB('vPlaster',s*(W/2-2.6),Y0,D/2-.18,4.8,3.1,.36,0,wash);
  vBq('maTileB',s*(W/2-2.6),Y0+3.22,D/2-.18,5.0,.14,.62,vQ(.15,0,0),tile);
  const px=s*2.6;vB('maCantera',px,Y0,D/2-.18,.68,3.5,.68,0,st);
  kput('maUrn',[px,Y0+3.5,D/2-.18],null,[.36,.58,.36],or);}
 maArch(0,Y0,D/2-.18,0,4.5,3.2,{fill:'O',band:st,reja:iron,bw:.16});
 vnFolk(-1.8,1.4,1,1.2);}

// ---------------------------------------------------------------- 2. KITCHEN & VEGETABLE COURTYARD (middle): Korta de Gardon
function buildMarPatioVegetable(G,o){reseed(9806+(o.v|0));
 const wash=MA_LIME(),st=MA_CANT(),or=MA_OR(),wood=MA_WOOD(),tile=MA_TILE();
 vnReg('Kitchen and vegetable courtyard — Korta de Gardon (middle)',0,0,8.5,4.2,{type:['residence','courtyard'],wealth:'middle'});
 const W=15.0,D=13.4,Y0=.15;
 vB('maCantera',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 maPatioVegetable(0,Y0,0,W-1.6,D-1.6,0,{shed:true});
 // whitewashed tapia boundary walls (h = 2.6 m) with mission tile coping & front timber gate arch
 for(const s of[-1,1]){
  vB('vPlaster',s*(W/2-.16),Y0,0,.32,2.5,D,0,wash);
  vB('vPlaster',s*(W/2-.16),Y0+2.1,0,.36,.16,D,0,or);
  vBq('maTileB',s*(W/2-.16),Y0+2.6,0,.56,.12,D+.2,vQ(0,0,s*.15),tile);}
 vB('vPlaster',0,Y0,-D/2+.16,W,2.7,.32,0,wash);
 vBq('maTileB',0,Y0+2.8,-D/2+.16,W+.2,.12,.56,vQ(-.15,0,0),tile);
 for(const s of[-1,1]){
  vB('vPlaster',s*(W/2-2.7),Y0,D/2-.16,5.0,2.5,.32,0,wash);
  vBq('maTileB',s*(W/2-2.7),Y0+2.6,D/2-.16,5.2,.12,.56,vQ(.15,0,0),tile);
  vB('maCantera',s*2.1,Y0,D/2-.16,.55,2.9,.55,0,st);}
 maArch(0,Y0,D/2-.16,0,3.6,2.7,{fill:'DOOR',band:or,leafC:wood,bw:.14,gate:true});
 vnFolk(1.6,1.2,1,1.1);}

// ---------------------------------------------------------------- 3. WORKING & TENEMENT YARD (poor): Yarda de Guorka
function buildMarPatioWorking(G,o){reseed(9811+(o.v|0));
 const wash=MA_CORAL(),st=MA_CANTD(),or=MA_OR(),wood=MA_DRIFT(),tile=MA_TILE();
 vnReg('Working and tenement yard — Yarda de Guorka (poor)',0,0,7.5,4.5,{type:['residence','courtyard'],wealth:'poor'});
 const W=13.6,D=13.6,Y0=.14;
 vB('maCantera',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 maPatioWorking(0,Y0,0,W-1.4,D-1.4,0,{});
 // weathered coral-plaster & stone boundary walls with timber stair gallery on +x wall
 for(const s of[-1,1]){
  vB('vPlaster',s*(W/2-.16),Y0,0,.32,2.8,D,0,wash);
  vB('maCantera',s*(W/2-.16),Y0+2.8,0,.42,.12,D+.1,0,st);}
 vB('vPlaster',0,Y0,-D/2+.16,W,3.0,.32,0,wash);
 vB('maCantera',0,Y0+3.0,-D/2+.16,W+.1,.12,.42,0,st);
 // exterior timber catwalk & stair along the +x yard wall
 vB('vWood',W/2-1.0,Y0+2.1,0,1.3,.12,D-2.4,0,wood);
 for(const z of[-4.2,0,4.2])vPst('vPost',W/2-1.55,Y0,z,.1,2.95,wood);
 vldRails([W/2-1.55,-D/2+1.2],[W/2-1.55,D/2-1.2],Y0+2.15,.85,wood,2);
 // front wall (+z) with wide cart archway
 for(const s of[-1,1])vB('vPlaster',s*(W/2-2.3),Y0,D/2-.16,4.2,2.8,.32,0,wash);
 maArch(0,Y0,D/2-.16,0,3.8,2.6,{fill:'O',band:or,bw:.14});
 vnFolk(-.8,1.5,2,1.2);}

// ---------------------------------------------------------------- 4. GRID-BREAK TURNED LOTS (middle, <=50% wedge): centered courtyards + grown built wings across street
function buildMarGridBreakLots(G,o){reseed(9814+(o.v|0));
 const washN=MA_OCHRE(),washS=MA_CORAL(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Grid-break turned courtyard lots (middle)',0,0,12.5,9.6,{type:['residence','trade'],wealth:'middle',role:'trader'});
 const Y0=.25,H1=3.5,H2=3.2,HT=H1+H2,CW=17.6;
 // Base cobblestone street & lot plinth (21.6 x 27.6 m)
 vB('maCantera',0,-.1,0,21.6,Y0+.1,27.6,0,st);
 vnPaving(0,Y0+.02,0,20.8,4.4,0,vC(0x8e8272),28);
 // Midline street curbstones & iron lamp posts running between the North lot and South lot (z = -1.6..+1.6)
 for(const s of[-1,1]){
  vB('maCantera',0,Y0+.08,s*1.55,21.2,.16,.32,0,st);
  vnLampPost(s*8.2,Y0,s*1.35,3.3);}
 // NORTH LOT (core centered at z = -8.6, turned at ryN = -0.10 rad) + grown southern hollow built wing covering the <=50% wedge down to z = -1.7!
 {const ryN=-.10,zc=-8.6;
  for(const [du,dv,lw,ld] of[[0,-3.4,CW,2.8],[-7.0,0,3.6,4.2],[7.0,0,3.6,4.2]]){
   const p=loc(0,zc,du,dv,ryN);
   vnBody('vPlaster',p[0],Y0,p[1],lw,HT,ld,ryN,washN,{t:.24});
   maBand(p[0],Y0+H1,p[1],lw,ld,ryN,or,.12,.18);
   vnHipRoof('maHipTile',p[0],Y0+HT,p[1],lw,ld,1.55,ryN,tile,.28);}
  maPatioVegetable(0,Y0,zc,8.8,4.8,ryN,{shed:true});
  // Grown hollow built portion on the south side of the North lot facing the midline street (z = -3.8, w = 17.6, d = 4.2)
  vnBody('vPlaster',0,Y0,-3.8,CW,HT,4.2,0,washN,{t:.26});
  maBand(0,Y0+H1,-3.8,CW,4.2,0,st,.14,.2,'maCantera');
  vnHipRoof('maHipTile',0,Y0+HT,-3.8,CW,4.2,1.55,0,tile,.28);
  maCanteraPortal(0,Y0,-1.7,0,2.1,2.95,st,or,wood,{pediment:false});
  for(const dx of[-5.2,-2.6,2.6,5.2]){
   maShutterWin(dx,Y0+.8,-1.7,0,1.2,1.6,false,st,wood,iron);
   maBalcony(dx,Y0+H1+.12,-1.7,0,2.3,.75,st,iron);
   maArch(dx,Y0+H1+.2,-1.7,0,1.3,2.35,{fill:'G',band:st,shutters:wood,bw:.12});}}
 // SOUTH LOT (core centered at z = +8.2, turned at ryS = +0.10 rad) + grown northern wing + hollow front range at z = +11.4!
 {const ryS=.10,zc=8.2;
  for(const [du,dv,lw,ld] of[[0,-3.4,CW,2.8],[-7.0,0,3.6,4.2],[7.0,0,3.6,4.2]]){
   const p=loc(0,zc,du,dv,ryS);
   vnBody('vPlaster',p[0],Y0,p[1],lw,HT,ld,ryS,washS,{t:.24});
   maBand(p[0],Y0+H1,p[1],lw,ld,ryS,or,.12,.18);
   vnHipRoof('maHipTile',p[0],Y0+HT,p[1],lw,ld,1.55,ryS,tile,.28);}
  maPatioPleasure(0,Y0,zc,8.8,4.8,ryS,{lamps:true});
  // Grown built portion on the north side of the South lot filling the wedge up to the midline street (z = +3.55)
  vnBody('vPlaster',-.6,Y0,3.55,CW,HT,3.1,.04,washS,{t:.24});
  maBand(-.6,Y0+H1,3.55,CW,3.1,.04,st,.14,.2,'maCantera');
  vnHipRoof('maHipTile',-.6,Y0+HT,3.55,CW,3.1,1.45,.04,tile,.28);
  maCanteraPortal(-.6,Y0,2.0,Math.PI+.04,2.1,2.95,st,or,wood,{pediment:false});
  // Main South hollow street block (+z = 11.4, w = 17.6, d = 4.2, front face at z = 13.5) with NOLA iron gallery & Baroque portal
  vnBody('vPlaster',0,Y0,11.4,CW,HT,4.2,0,washS,{t:.26});
  maBand(0,Y0+H1,11.4,CW,4.2,0,or,.12,.18);
  vnHipRoof('maHipTile',0,Y0+HT,11.4,CW,4.2,1.55,0,tile,.28);
  maCanteraPortal(0,Y0,13.5,0,2.2,3.05,st,or,wood,{pediment:true,front:true});
  for(const dx of[-5.2,-2.6,2.6,5.2]){
   maShutterWin(dx,Y0+.8,13.5,0,1.25,1.65,false,st,wood,iron);
   maArch(dx,Y0+H1+.2,13.5,0,1.35,2.35,{fill:'G',band:st,shutters:wood,bw:.12});}
  maIronGallery(0,Y0+H1,13.5,0,CW-.4,1.65,H2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true});}
 vnFolk(-2.2,0,2,1.2);}

// ---------------------------------------------------------------- 5. GARDON DE PILOTAZ / GUESTA (civic/rich, >50% wedge): grid-break public garden park
function buildMarGardonPark(G,o){reseed(9816+(o.v|0));
 const wash=MA_LIME(),or=MA_OR(),st=MA_CANT(),iron=MA_IRON(),az=MA_AZ();
 vnReg('Gardon de Pilotaz grid-break park (civic)',0,0,12.5,5.8,{type:['civic','courtyard'],wealth:'rich'});
 const W=22.4,D=16.4,Y0=.2;
 vB('maCantera',0,-.1,0,W+.6,Y0+.1,D+.6,0,st);
 vnPaving(0,Y0+.02,0,W-.8,D-.8,0,vC(0xa89c88),32);
 // Central octagonal scalloped azulejo fountain pool & water column + 4 surrounding palm/citrus lawn quadrants
 maPatioPleasure(0,Y0,0,W-2.8,D-2.8,0,{lamps:true});
 // Ornamental stone-and-iron park balustrade around the perimeter with corner urn piers & 4 open park gates
 for(const s of[-1,1]){
  for(const dx of[-7.2,7.2]){
   vB('vPlaster',dx,Y0,s*(D/2-.2),5.8,.95,.36,0,wash);
   vB('maCantera',dx,Y0+.95,s*(D/2-.2),6.0,.14,.46,0,st);
   for(let x=dx-2.6;x<=dx+2.6;x+=.4)vB('vIron',x,Y0+1.09,s*(D/2-.2),.03,1.1,.03,0,iron);
   vB('vIron',dx,Y0+2.15,s*(D/2-.2),5.8,.05,.05,0,iron);}
  for(const px of[-10.8,-4.1,4.1,10.8]){
   vB('maCantera',px,Y0,s*(D/2-.2),.68,2.6,.68,0,st);
   kput('maUrnAz',[px,Y0+2.6,s*(D/2-.2)],null,[.34,.55,.34],px%2===0?az:or);}}
 vnFolk(-3.4,1.2,2,1.2);vnFolk(3.6,-1.4,1,1.1);}

// ---------------------------------------------------------------- 6. MARKITA DE XEDAZ / PORTA (trade/civic, >50% wedge): grid-break open-air market plaza
function buildMarMarkitaPlaza(G,o){reseed(9818+(o.v|0));
 const or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),az=MA_AZ(),tile=MA_TILE();
 vnReg('Markita de Xedaz grid-break market plaza (trade)',0,0,12.5,5.5,{type:['trade','market'],wealth:'middle',role:'vendor'});
 const W=22.4,D=16.4,Y0=.2;
 vB('maCantera',0,-.1,0,W+.6,Y0+.1,D+.6,0,st);
 vnPaving(0,Y0+.02,0,W-.8,D-.8,0,vC(0x968876),36);
 // Central octagonal stone market cross, weigh-pillar & drinking fountain at (0, 0)
 vPst('maDrumC',0,Y0,0,1.45,.85,st);
 kput('maRing',[0,Y0+.85,0],null,[1.55,1.55,1.4],or);
 vPst('maDrumC',0,Y0+.9,0,.55,2.8,st);
 kput('maDomeAz',[0,Y0+3.7,0],null,[.85,.75,.85],az);
 vBall('vBulb',0,Y0+4.55,0,.22);
 // 6 polychrome canvas-awning merchant stalls (2 rows of 3 stalls) with produce, fish crates, rum casks & cloth bolts
 const awningCols=[or,az,MA_OCHRE(),tile,MA_CORAL(),MA_LIME()];
 let ci=0;
 for(const sx of[-6.8,0,6.8])for(const sz of[-4.6,4.6]){
  if(sx===0&&sz>0)continue; // leave central front entry clear
  const ac=awningCols[ci++%awningCols.length];
  // 4 timber posts + pitched canvas awning + merchant counter table + crates & barrels
  for(const dx of[-1.8,1.8])for(const dz of[-1.1,1.1])vPst('vPost',sx+dx,Y0,sz+dz,.08,2.55,wood);
  vBq('vPlaster',sx,Y0+2.65,sz,4.1,.12,2.7,vQ(sz>0?.16:-.16,0,0),ac);
  vB('vWood',sx,Y0+.45,sz,3.4,.85,1.1,0,wood);
  vnCrate(sx-1.1,Y0+.9,sz,.55,.1,or);
  vnBarrel(sx+1.2,Y0+.9,sz,.28,.65,wood);}
 // Corner stone bollards & iron market lanterns
 for(const sx of[-10.2,10.2])for(const sz of[-7.2,7.2])vnLampPost(sx,Y0,sz,3.4);
 vnFolk(-3.5,1.6,2,1.2);vnFolk(4.2,1.8,2,1.2);}

VERN.def({key:'mar_patio_pleasure',name:'Pleasure courtyard (Korta de Plejar)',family:'dwellings',tags:{type:['residence','courtyard'],wealth:'rich',lit:true},w:16,d:16,h:4.5,build:buildMarPatioPleasure});
VERN.def({key:'mar_patio_vegetable',name:'Kitchen garden court (Korta de Gardon)',family:'dwellings',tags:{type:['residence','courtyard'],wealth:'middle',lit:false},w:16,d:14,h:4.2,build:buildMarPatioVegetable});
VERN.def({key:'mar_patio_working',name:'Working tenement yard (Yarda de Guorka)',family:'dwellings',tags:{type:['residence','courtyard'],wealth:'poor',lit:false},w:14,d:14,h:4.5,build:buildMarPatioWorking});
VERN.def({key:'mar_grid_break_lots',name:'Grid-break turned courtyard lots (<=50% wedge growth)',family:'dwellings',tags:{type:['residence','trade'],wealth:'middle',lit:false,role:'trader',job:'trade'},w:22,d:28,h:9.6,build:buildMarGridBreakLots});
VERN.def({key:'mar_gardon_park',name:'Grid-break wedge park (Gardon de Pilotaz, >50% wedge)',family:'civic',tags:{type:['civic','courtyard'],wealth:'rich',lit:true},w:24,d:18,h:5.8,build:buildMarGardonPark});
VERN.def({key:'mar_markita_plaza',name:'Grid-break wedge market (Markita de Xedaz, >50% wedge)',family:'trade',tags:{type:['trade','market'],wealth:'middle',lit:true,role:'vendor',job:'trade'},w:24,d:18,h:5.5,build:buildMarMarkitaPlaza});

