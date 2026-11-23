// ================================================================= 70n. MARR: poor dwellings — De Xedaz & Qartar Lo (PLAN.md section 4.3)
// Seeds 9821-9859. The low-lying dockside slums of The Shades (De Xedaz) and the working-class lanes of the Lower Quarter
// (Qartar Lo): stilted canal shanties, 3-storey U-plan corrala tenements around working laundry/bread-oven yards, Bruges
// stepped canal lofts, smuggler water-gate cellars, and New Orleans Creole cottages & shotgun houses.

// ---------------------------------------------------------------- 1. SHADES CANAL SHANTY (poor): stilted over canal water, skiff dock, nets
function buildMarShadesShanty(G,o){reseed(9821+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),wood=MA_DRIFT(),woodD=MA_WOOD(),st=MA_CANTD(),tile=MA_TILE();
 vnReg('Shades canal shanty (poor)',0,0,5.5,6.8,{type:['residence'],wealth:'poor',role:'fisher'});
 // canal water strip in front (+z = 1.8..5.0) + stone bank wall at z = 1.6
 if(typeof window==='undefined'||!window.CITY)vB('maWater',0,-.42,3.4,8.6,.18,3.2,0,vC(0x225462));
 vB('maCantera',0,-.4,-1.2,8.4,1.1,5.6,0,st);
 // timber piles standing in the canal supporting the overhanging porch & upper lean-to
 const X0=-.4,Z0=-1.2,W=6.8,D=5.2,Y0=.7,H1=2.8,H2=2.3;
 for(const x of[-3.2,0,3.2])for(const z of[2.0,3.8])vPst('vPostB',x,-.5,z,.14,Y0+.36,woodD);
 vB('vWood',0,Y0-.14,2.8,7.2,.14,2.4,0,wood);
 maWalkFloor(0,Y0,2.8,7.2,2.6,0,'shanty porch');
 vnStairs(X0-.8,0,4.4,0,1.4,Y0,4,'vWood',woodD);
 // ground plastered cabin (x = -.4, z = -1.2, w = 6.8, d = 5.2, h = 2.8) + overhanging timber upper attic
 vnBody('vPlaster',X0,Y0,Z0,W,H1,D,0,wash,{t:.22});
 vB('vWood',X0,Y0+H1,Z0+.4,W+.6,.22,D+1.2,0,woodD);
 vnBody('vWood',X0,Y0+H1+.22,Z0+.4,W+.4,H2,D+.8,0,wood,{t:.18});
 vnGableRoof(X0,Y0+H1+.22+H2,Z0+.4,W+.8,D+1.2,1.6,0,'maGableTile',tile,.85,'vGableW',woodD,.22);
 // exterior wooden stair on +x climbing to the upper gallery + drying fish net & moored skiff
 vnStairs(3.3,Y0,.8,0,.95,H1+.22,9,'vWood',woodD);
 vnDoor(X0-.8,Y0,Z0+D/2,0,1.0,2.0,'vWood',or,woodD,false);
 maShutterWin(X0+1.4,Y0+.9,Z0+D/2,0,1.0,1.0,false,or,woodD,null);
 maShutterWin(X0,Y0+H1+.8,Z0+.4+(D+.8)/2,0,1.1,1.1,false,or,woodD,null);
 kput('vCloth',[-1.8,1.8,3.85],vQ(0,.08,0),[2.2,1.2,1],vC(0xc8bca0));
 if(typeof window==='undefined'||!window.CITY)vB('vWood',2.2,-.3,4.2,1.2,.35,3.2,.2,woodD);}

// ---------------------------------------------------------------- 2. SHADES TENEMENT / CORRALA (poor): 3-storey U-plan around a working yard
function buildMarShadesTenement(G,o){reseed(9826+(o.v|0));
 const wash=MA_OCHRE(),wash2=MA_CORAL(),or=MA_OR(),st=MA_CANTD(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Shades corrala tenement (poor)',0,0,9.5,11.5,{type:['residence'],wealth:'poor'});
 const W=17.4,D=13.6,Y0=.25,H1=3.2,H2=3.0,H3=2.8,HT=H1+H2+H3;
 vB('maCantera',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 // U-shaped 3-storey tenement wings wrapping a central working courtyard (x = -4.2..+4.2, z = -1.2..+6.5)
 // Rear main block (z = -3.9, width 17.4, depth 5.4 -> z = -6.6..-1.2) + two side wings (width 4.4, depth 7.7 -> z = -1.2..+6.5)
 vnBody('vPlaster',0,Y0,-3.9,W,HT,5.4,0,wash,{t:.26});
 maBand(0,Y0+H1,-3.9,W,5.4,0,or,.12,.18);maBand(0,Y0+H1+H2,-3.9,W,5.4,0,or,.12,.18);
 vnHipRoof('maHipTile',0,Y0+HT,-3.9,W,5.4,1.8,0,tile,.3);
 vnDoor(0,Y0,-1.2,0,1.15,2.2,'maCantera',st,wood,false);
 for(const s of[-1,1]){const wx=s*(W/2-2.2),wz=2.65;
  vnBody('vPlaster',wx,Y0,wz,4.4,HT,7.7,0,wash2,{t:.24});
  maBand(wx,Y0+H1,wz,4.4,7.7,0,or,.1,.16);maBand(wx,Y0+H1+H2,wz,4.4,7.7,0,or,.1,.16);
  vnHipRoof('maHipTile',wx,Y0+HT,wz,4.4,7.7,1.5,0,tile,.28);
  // street-facing iron balconies & shuttered windows on the twin side wings (+z = 6.5)
  vnDoor(wx,Y0,6.5,0,1.1,2.2,'maCantera',st,wood);
  for(const yy of[Y0+H1,Y0+H1+H2]){
   maBalcony(wx,yy+.08,6.5,0,2.2,.72,st,iron);
   maShutterWin(wx,yy+.55,6.5,0,1.2,1.65,false,st,wood,null);}}
 // timber & iron access galleries lining the inner U-courtyard on floors 2 & 3
 for(const yy of[Y0+H1,Y0+H1+H2]){
  vB('vWood',0,yy,-.65,8.6,.14,1.1,0,wood);
  vB('vIron',0,yy+.85,-.15,8.6,.04,.04,0,iron);
  for(const x of[-3.2,0,3.2]){vPst('vPost',x,Y0,-.15,.1,HT,wood);
   maShutterWin(x,yy+.55,-1.2,0,1.0,1.45,false,or,wood,null);}}
 // front screen wall closing the courtyard to the street with a wide arched zaguán gate
 vB('vPlaster',0,Y0,6.35,8.6,3.2,.36,0,wash);
 vBq('maTileB',0,Y0+3.32,6.35,8.8,.14,.62,vQ(.15,0,0),tile);
 maArch(0,Y0,6.35,0,3.2,2.7,{fill:'O',band:st,bw:.16});
 // populate the inner 8.4 x 7.2 m courtyard with the working tenement yard (summer kitchen, beehive bread oven, laundry lines!)
 maPatioWorking(0,Y0,2.5,8.2,7.0,0,{});
 vnChimney(-6.2,Y0+HT+.6,-4.2,2.2,.22,true);vnFolk(0,5.8,2,1.2);}

// ---------------------------------------------------------------- 3. CANAL LOFT (poor): Bruges stepped gable, boat arch, net racks
function buildMarCanalLoft(G,o){reseed(9831+(o.v|0));
 const wash=MA_SAFFRON?MA_OCHRE():MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Canal net-mender\'s loft (poor)',0,0,6.5,9.8,{type:['residence','trade'],wealth:'poor',role:'fisher'});
 const W=8.8,D=11.8,Y0=.25,H1=3.2,H2=3.0,ZF=D/2;
 vB('maCantera',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 vnBody('vPlaster',0,Y0,0,W,H1+H2,D,0,wash,{t:.26});
 maQuoins(0,Y0,0,W,H1+H2,D,0,st,.42);
 maBand(0,Y0+H1,0,W,D,0,or,.12,.18);
 // pitched tile roof + Bruges stepped canal gable on the front (+z) with cargo hoist beam
 vnGableRoof(0,Y0+H1+H2,0,W,D,2.4,0,'maGableTile',tile,.35,'vGablePl',wash,.15);
 maBrugesGable(0,Y0+H1+H2,ZF,0,W,2.6,5,wash,st,true);
 // ground-floor arched boat/net-store entrance + side house door + upper iron balcony
 maArch(-1.6,Y0,ZF,0,2.6,2.65,{fill:'DOOR',band:st,leafC:wood,bw:.16});
 vnDoor(2.4,Y0,ZF,0,1.05,2.15,'maCantera',or,wood);
 maBalcony(0,Y0+H1+.1,ZF,0,4.6,.75,st,iron);
 for(const x of[-1.6,1.6])maShutterWin(x,Y0+H1+.6,ZF,0,1.2,1.75,false,st,wood,null);
 vnBarrel(-3.2,0,ZF+.8,.35,.85,wood);}

// ---------------------------------------------------------------- 4. SMUGGLER'S WATER-GATE CELLAR (poor): canal arch & covert hoist
function buildMarSmugglerCellar(G,o){reseed(9836+(o.v|0));
 const wash=MA_CORAL(),st=MA_CANTD(),stL=MA_CANT(),or=MA_OR(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Smuggler\'s water-gate house (poor)',0,0,7.0,8.2,{type:['residence','trade'],wealth:'poor',role:'warehouseman'});
 const W=11.2,D=11.6,B1=2.4,H1=3.2,ZF=D/2;
 // heavy rusticated volcanic-stone canal basement (y = 0..2.6) with barred water-gate arch & side stone steps
 vB('maCantera',0,-.2,0,W+.3,B1+.4,D+.3,0,st);
 maBand(0,B1,0,W+.3,D+.3,0,stL,.14,.2,'maCantera');
 maArch(-1.4,0,ZF,0,3.4,2.15,{fill:'O',band:stL,reja:iron,bw:.18});
 if(typeof window==='undefined'||!window.CITY)vB('maWater',-1.4,-.15,ZF-.6,3.0,.18,1.8,0,vC(0x1e4c58));
 // stone side stair climbing from street level up to the raised dwelling floor at y = B1+.2 = 2.6
 vnStairs(3.2,0,ZF+2.0,0,1.8,B1+.2,10,'maCantera',stL);
 // upper plastered dwelling (y = 2.6..5.8) with NOLA iron gallery over the water-gate
 vnBody('vPlaster',0,B1+.2,0,W,H1,D,0,wash,{t:.26});
 vnHipRoof('maHipTile',0,B1+.2+H1,0,W,D,1.8,0,tile,.32);
 maIronGallery(-1.2,B1+.2,ZF,0,6.4,1.25,H1-.1,iron,wood,{storeys:1,roof:true,tileC:tile});
 vnDoor(3.2,B1+.2,ZF,0,1.15,2.2,'maCantera',or,wood,false);
 for(const x of[-2.8,.4])maShutterWin(x,B1+.75,ZF,0,1.15,1.65,false,stL,wood,null);
 vnCrate(2.8,0,ZF+1.2,.75,.15,wood);}

// ---------------------------------------------------------------- 5. CREOLE COTTAGE (poor): NOLA 4-bay front, abat-vent overhang, twin dormers
function buildMarCreoleCottage(G,o){reseed(9841+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Creole cottage (poor)',0,0,6.5,6.6,{type:['residence'],wealth:'poor'});
 const W=10.6,D=10.2,Z0=-.6,Y0=.35,H1=3.3,ZF=Z0+D/2;
 vB('maCantera',0,-.1,Z0,W+.4,Y0+.1,D+1.8,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,wash,{t:.25});
 maQuoins(0,Y0,Z0,W,H1,D,0,st,.38);
 // deep NOLA abat-vent roof overhang (+1.4 m over the front banquette) supported on slender iron posts
 for(let k=0;k<6;k++){const x=-W/2+.4+k*(W-.8)/5;
  vPst('vIron',x,Y0,ZF+1.3,.05,H1,iron);}
 vB('vIron',0,Y0+H1-.2,ZF+1.3,W-.4,.18,.035,0,iron);
 vnGableRoof(0,Y0+H1,Z0+.65,D+1.5,W,2.3,Math.PI/2,'maGableTile',tile,.35,'vGablePl',wash,.2);
 // 4 symmetrical front bays: two tall shuttered French doors in the middle, shuttered windows with iron rejas outside
 for(const x of[-1.95,1.95])vnDoor(x,Y0,ZF,0,1.1,2.35,'vWood',or,wood);
 for(const x of[-3.85,3.85])maShutterWin(x,Y0+.75,ZF,0,1.0,1.5,false,st,wood,iron);
 // twin gabled roof dormers on the front slope
 for(const x of[-2.4,2.4]){
  vnBody('vPlaster',x,Y0+H1+.4,ZF-.9,1.5,1.25,1.4,0,wash,{t:.16});
  vnGableRoof(x,Y0+H1+1.65,ZF-.9,1.6,1.5,.55,0,'maGableTile',tile,.15,'vGablePl',wash,.1);
  maShutterWin(x,Y0+H1+.55,ZF-.2,0,.75,.85,false,st,wood,null);}
 vnChimney(0,Y0+H1+1.8,Z0,1.8,.2,false);}

// ---------------------------------------------------------------- 6. SINGLE SHOTGUN HOUSE (poor): narrow NOLA gable front, iron porch
function buildMarShotgunSingle(G,o){reseed(9846+(o.v|0));
 const wash=MA_LIME(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Single shotgun house (poor)',0,0,6.0,6.0,{type:['residence'],wealth:'poor'});
 const W=5.2,D=14.4,Z0=-.6,Y0=.4,H1=3.3,ZF=Z0+D/2;
 vB('maCantera',0,-.1,Z0,W+.3,Y0+.1,D+2.0,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,wash,{t:.24});
 maBand(0,Y0+H1-.18,Z0,W,D,0,or,.08,.18);
 // front porch gallery (depth 1.75 m) with wrought-iron columns, lacework brackets & tiled porch roof
 maIronGallery(0,Y0,ZF,0,W,1.75,H1,iron,wood,{storeys:1,roof:true,tileC:tile});
 vnGableRoof(0,Y0+H1,Z0,D,W,1.65,Math.PI/2,'maGableTile',tile,.3,'vGablePl',wash,.18);
 vnStairs(-1.1,0,ZF+2.15,0,1.5,Y0,3,'maCantera',st);
 vnDoor(-1.1,Y0,ZF,0,1.05,2.3,'vWood',or,wood,false);
 maShutterWin(1.1,Y0+.65,ZF,0,1.1,1.55,false,or,wood,iron);
 for(const z of[-4.2,0,4.2])for(const s of[-1,1])maShutterWin(s*W/2,Y0+.8,z,s*Math.PI/2,1.0,1.3,false,or,wood,null);}

// ---------------------------------------------------------------- 7. DOUBLE-BARREL SHOTGUN HOUSE (poor): twin-bay NOLA cottage + rear yard
function buildMarShotgunDouble(G,o){reseed(9851+(o.v|0));
 const wash=MA_CORAL(),or=MA_OR(),st=MA_CANT(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Double shotgun house (poor)',0,0,8.5,6.5,{type:['residence'],wealth:'poor'});
 const W=9.8,D=13.6,Z0=-.8,Y0=.4,H1=3.4,ZF=Z0+D/2;
 vB('maCantera',0,-.1,Z0,W+.4,Y0+.1,D+2.0,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,wash,{t:.25});
 maQuoins(0,Y0,Z0,W,H1,D,0,st,.36);
 maIronGallery(0,Y0,ZF,0,W,1.8,H1,iron,wood,{storeys:1,roof:true,tileC:tile});
 vnHipRoof('maHipTile',0,Y0+H1,Z0,W,D,2.1,0,tile,.35);
 for(const s of[-1,1]){
  vnStairs(s*1.3,0,ZF+2.2,0,1.4,Y0,3,'maCantera',st);
  vnDoor(s*1.3,Y0,ZF,0,1.05,2.3,'vWood',or,wood,false);
  maShutterWin(s*3.3,Y0+.65,ZF,0,1.1,1.55,false,st,wood,iron);}
 vnChimney(0,Y0+H1+1.5,Z0-1.5,1.8,.22,true);}

// ---------------------------------------------------------------- 8. FISHERS' ROW (poor): 3-unit colourful harbour row with net racks
function buildMarFishersRow(G,o){reseed(9856+(o.v|0));
 const cols=[MA_OCHRE(),MA_CORAL(),MA_LIME()],or=MA_OR(),st=MA_CANTD(),wood=MA_WOOD(),iron=MA_IRON(),tile=MA_TILE();
 vnReg('Fishers\' row (poor)',0,0,9.5,7.2,{type:['residence'],wealth:'poor',role:'fisher'});
 const UW=5.6,D=9.4,Y0=.3,H1=3.0,H2=2.6,ZF=D/2;
 vB('maCantera',0,-.1,0,UW*3+.4,Y0+.1,D+.4,0,st);
 for(let i=0;i<3;i++){const x=(i-1)*UW,c=cols[i];
  vnBody('vPlaster',x,Y0,0,UW,H1+H2,D,0,c,{t:.24});
  maBand(x,Y0+H1,0,UW,D,0,or,.08,.16);
  vnGableRoof(x,Y0+H1+H2,0,D,UW,1.5,Math.PI/2,'maGableTile',tile,.25,'vGablePl',c,.12);
  vnDoor(x-1.1,Y0,ZF,0,1.0,2.1,'maCantera',st,wood);
  maShutterWin(x+1.1,Y0+.75,ZF,0,1.05,1.3,false,st,wood,iron);
  maBalcony(x,Y0+H1+.08,ZF,0,3.2,.68,st,iron);
  maShutterWin(x,Y0+H1+.5,ZF,0,1.15,1.55,false,st,wood,null);}
 // front net-drying rack & crab pots
 for(const s of[-1,1])vPst('vPost',-5.6+s*1.4,0,ZF+1.4,.07,2.2,wood);
 vBeam([-7.0,2.1,ZF+1.4],[-4.2,2.1,ZF+1.4],.06,wood);
 kput('vCloth',[-5.6,1.35,ZF+1.45],null,[2.5,1.3,1],vC(0xc8bca0));
 vnCrate(5.4,0,ZF+1.1,.68,.15,wood);}

VERN.def({key:'mar_shades_shanty',name:'Shades canal shanty',family:'dwellings',tags:{type:['residence'],wealth:'poor',lit:false,role:'fisher',job:'fishing'},w:9,d:11,h:6.8,build:buildMarShadesShanty});
VERN.def({key:'mar_shades_tenement',name:'Shades corrala tenement',family:'dwellings',tags:{type:['residence'],wealth:'poor',lit:false},w:18,d:14,h:11.5,build:buildMarShadesTenement});
VERN.def({key:'mar_canal_loft',name:'Canal net-mender\'s loft',family:'dwellings',tags:{type:['residence','trade'],wealth:'poor',lit:false,role:'fisher',job:'fishing'},w:10,d:13,h:9.8,build:buildMarCanalLoft});
VERN.def({key:'mar_smuggler_cellar',name:'Smuggler\'s water-gate house',family:'dwellings',tags:{type:['residence','trade'],wealth:'poor',lit:false,role:'warehouseman',job:'hauling'},w:12,d:13,h:8.2,build:buildMarSmugglerCellar});
VERN.def({key:'mar_creole_cottage',name:'Creole cottage',family:'dwellings',tags:{type:['residence'],wealth:'poor',lit:false},w:11,d:12,h:6.6,build:buildMarCreoleCottage});
VERN.def({key:'mar_shotgun_single',name:'Single shotgun house',family:'dwellings',tags:{type:['residence'],wealth:'poor',lit:false},w:6,d:16,h:6.0,build:buildMarShotgunSingle});
VERN.def({key:'mar_shotgun_double',name:'Double shotgun house',family:'dwellings',tags:{type:['residence'],wealth:'poor',lit:false},w:11,d:16,h:6.5,build:buildMarShotgunDouble});
VERN.def({key:'mar_fishers_row',name:'Fishers\' row',family:'dwellings',tags:{type:['residence'],wealth:'poor',lit:false,role:'fisher',job:'fishing'},w:18,d:11,h:7.2,build:buildMarFishersRow});
