// ================================================================= 73m. MARR: canals, bridges, tapia walls & sea-forts (PLAN.md section 4.8)
// Seeds 9996-10019. Marr's canal embankments, Bruges/Antiguan arched stone canal bridges, colonial tapia curtain walls,
// and Old San Juan / Havana-inspired sea-fortress bastions (Kastil de Mar) with cantilevered stone sentry garitas.

// ---------------------------------------------------------------- 1. CANAL QUAY WALL (infrastructure): stone embankment, water stairs, iron rail
function buildMarCanalQuay(G,o){reseed(9996+(o.v|0));
 const st=MA_CANT(),stD=MA_CANTD(),or=MA_OR(),iron=MA_IRON(),inCity=typeof window!=='undefined'&&!!window.CITY;
 vnReg('Canal stone quay wall (infrastructure)',0,0,12.0,3.8,{type:['infrastructure'],wealth:'middle',role:'bargeman'});
 const W=23.6,D=4.8;
 // canal water strip along +z (z = 1.6..4.2) on showcase sheet + dark volcanic ashlar quay wall (z = -2.4..+1.6)
 if(!inCity)vB('maWater',0,-.45,2.9,W,.18,2.6,0,vC(0x205462));
 vB('maCantera',0,inCity?-2.2:-.4,-.4,W,inCity?3.5:1.7,4.0,0,stD);
 vB('maCantera',0,1.25,-.4,W+.2,.22,4.2,0,st);
 vnPaving(0,1.48,-.5,W-.6,3.4,0,vC(0x948878),24);
 // recessed stone boat-landing stairs in the middle (x = -2.2..+2.2) descending to the water
 vB('maCantera',0,0,1.35,4.6,1.15,1.2,0,st);
 vnStairs(0,.15,1.35,0,3.6,1.3,7,'maCantera',st);
 // wrought-iron canal balustrade left and right of the landing stair + 2 ornate iron lamp posts + mooring rings
 for(const s of[-1,1]){const rx=s*7.0,rw=8.8;
  vB('vIron',rx,2.35,1.45,rw,.045,.045,0,iron);
  for(let k=0;k<=16;k++)vB('vIron',rx-rw/2+k*rw/16,1.45,1.45,.025,.9,.025,0,iron);
  vB('maCantera',s*2.5,1.45,1.45,.48,1.1,.48,0,st);
  kput('maUrn',[s*2.5,2.55,1.45],null,[.28,.45,.28],or);
  vnLampPost(s*8.5,1.45,.8,3.4);
  kput('maRing',[s*5.5,.65,1.68],null,[.24,.24,1.2],iron);}}

// ---------------------------------------------------------------- 2. ARCHED CANAL BRIDGE (infrastructure): Ponte de Sidi
function buildMarCanalBridge(G,o){reseed(10001+(o.v|0));
 const st=MA_CANT(),stD=MA_CANTD(),or=MA_OR(),az=MA_AZ(),inCity=typeof window!=='undefined'&&!!window.CITY;
 const W=(o&&o.span!=null)?o.span:17.6,D=6.8,k=W/17.6;
 vnReg('Arched stone canal bridge (infrastructure)',0,0,W*.54,6.2,{type:['infrastructure'],wealth:'middle'});
 // canal water beneath the bridge on kit sheet + stone cutwater piers & bank abutments extending down to canal bed in city
 if(!inCity)vB('maWater',0,-.45,0,W,.18,D+3.2,0,vC(0x205462));
 const nArch=W>=32?3:2,pierY=inCity?-3.4:-.4,pierH=inCity?5.8:2.8;
 for(let i=0;i<=nArch;i++){
  const px=-W*.43+i*(W*.86/nArch),isEnd=i===0||i===nArch,pw=isEnd?Math.max(2.8,3.2*k*.75):2.5;
  vB('maCantera',px,pierY,0,pw,pierH,D+.6,0,stD);
  if(!isEnd){for(const s of[-1,1])vBq('maCantera',px,pierY+.05,s*(D/2+.35),1.55,pierH-.5,1.55,qEuler(0,Math.PI/4,0),stD);}
  else{
   // solid stone bank abutment wings anchoring the bridge ends into both canal embankments
   const s=i===0?-1:1;
   vB('maCantera',px+s*(pw*.5+.9),inCity?-1.8:-.4,0,2.4,inCity?3.2:1.8,D+1.8,0,stD);
   vB('maCantera',px+s*(pw*.5+.9),1.35,0,2.6,.24,D+2.0,0,st);
  }
 }
 // semicircular stone arch rings & solid spandrel masonry vault between the arches
 const spanStep=W*.86/nArch,archR=Math.min(4.2,spanStep*.44);
 for(let i=0;i<nArch;i++){
  const ax=-W*.43+(i+.5)*spanStep;
  for(const sz of[-1,1]){
   maArcBand(ax,.45,sz*(D/2-.18),sz>0?0:Math.PI,archR,.42,.48,.08,st,0,Math.PI,14,'maCantera');}
  vB('maCantera',ax,1.95,0,spanStep-.6,.65,D-.12,0,stD);
 }
 // ramped stone roadway slabs, approach steps, stone parapets & central bridge shrine niche with azulejo cap
 const crownW=W*.42,rampW=W*.25,rampX=(crownW+rampW)*.5-.2;
 vB('maCantera',0,2.5,0,crownW,.55,D,0,st);
 for(const s of[-1,1]){
  vBq('maCantera',s*rampX,1.75,0,rampW+.6,.5,D,qEuler(0,0,-s*Math.atan2(1.4,rampW)),st);
  vnStairs(s*(W*.44),.35,0,s*Math.PI/2,D-.8,1.15,6,'maCantera',st);}
 for(const sz of[-1,1]){const z=sz*(D/2-.22);
  vB('maCantera',0,3.05,z,crownW+.2,.85,.38,0,st);
  vB('vPlaster',0,3.65,z,crownW+.3,.16,.44,0,or);
  for(const sx of[-1,1])vBq('maCantera',sx*rampX,2.35,z,rampW+.6,.85,.38,qEuler(0,0,-sx*Math.atan2(1.4,rampW)),st);
  // central bridge wayside shrine / lantern pillar at x = 0
  vB('maCantera',0,3.05,z*1.08,1.1,2.1,.75,0,st);
  kput('maDomeAz',[0,5.15,z*1.08],null,[.52,.55,.52],az);
  vBall('vBulb',0,4.35,z*1.08,.18);}}

// ---------------------------------------------------------------- 3. MURAYA DE MARR CURTAIN WALL & GARITA (infrastructure): battered stone, tapia & cantilevered Garita de Guach
function buildMarTapiaWall(G,o){reseed(10006+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),tile=MA_TILE();
 vnReg('Muraya de Marr curtain wall and garita (infrastructure)',0,0,9.5,9.8,{type:['infrastructure','military'],wealth:'civic',role:'guard'});
 const W=(o&&o.len!=null)?o.len:18.0,H=6.8;
 // battered volcanic-stone plinth (y = 0..2.2) + thick ochre rammed-earth (tapia) wall (y = 2.2..6.8)
 vB('maCantera',0,-.2,0,W,2.4,4.2,0,stD);
 maBand(0,2.2,0,W,4.2,0,st,.14,.24,'maCantera');
 vB('vPlaster',0,2.44,0,W,H-2.44,3.6,0,wash);
 maBand(0,H-.35,0,W,3.6,0,or,.12,.22);
 // front crenellated parapet (+z = 1.45) with splayed musket/cannon embrasures + rear sentry walk & stair
 for(let x=-W/2+1.5;x<=W/2-1.5;x+=3.0){
  if(Math.abs(x)<1.8)continue;
  vB('maCantera',x,H,1.42,2.1,1.35,.75,0,st);
  vBq('maTileB',x,H+1.4,1.42,2.25,.14,.9,vQ(.15,0,0),tile);}
 vB('vPlaster',0,H,-1.55,W,.95,.4,0,wash);
 vnStairs(0,0,-2.6,Math.PI,2.2,H,18,'maCantera',stD);
 // Cantilevered circular sentry box (Garita de Guach) projecting from the outer face at (x = 0, z = +2.15)
 const gz=2.15;
 vPst('maDrumC',0,H-2.3,gz,1.08,2.3,stD);
 kput('maRing',[0,H,gz],null,[1.38,1.38,1.5],or);
 maHollowDrum(0,H+.05,gz,1.28,2.45,'vPlaster',wash,[-Math.PI/3,0,Math.PI/3].map(a=>({a,y0:.75,w:.46,h:1.1,lit:true})),{band:st,wood:st});
 kput('maDomeTile',[0,H+2.5,gz],null,[1.35,1.1,1.35],or);
 vBall('vBallW',0,H+3.65,gz,.16,st);}

// ---------------------------------------------------------------- 4. FORTA DE POINDA SEA-FORT BASTION (civic/military, lit): Kastil de Mar
function buildMarCastilloBastion(G,o){reseed(10011+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),iron=MA_IRON(),wood=MA_WOOD();
 vnReg('Forta de Poinda sea-fortress bastion (civic)',0,0,12.5,13.5,{type:['civic','military'],wealth:'civic',role:'soldier'});
 const W=21.6,D=19.6,Y0=.3,H1=7.2;
 // massive battered dark volcanic-stone bastion base with heavy cordón torus moulding at y = 6.8
 vB('maCantera',0,-.4,0,W+.8,Y0+.4,D+.8,0,stD);
 maBand(0,Y0,0,W+.8,D+.8,0,stD,2.9,.65,'maCantera');
 vnBody('maCantera',0,Y0,0,W,H1-Y0,D,0,st,{t:.42});
 maBand(0,H1-.35,0,W,D,0,or,.22,.35);
 // thick gun-platform parapet around the top deck (y = 7.2..8.8) with 3 coastal bronze cannon embrasures on +z
 for(const s of[-1,1])vB('maCantera',s*(W/2-.7),H1,0,1.4,1.5,D,0,st);
 vB('maCantera',0,H1,-D/2+.7,W,1.5,1.4,0,st);
 for(const x of[-6.8,-2.2,2.2,6.8])vB('maCantera',x,H1,D/2-.7,3.2,1.5,1.4,0,st);
 // 3 naval bronze cannon barrels on wooden garrison carriages pointing out to sea (+z)
 for(const x of[-4.5,0,4.5]){
  vB('vWood',x,H1,D/2-2.1,1.1,.65,1.8,0,wood);
  vBeam([x,H1+.75,D/2-2.4],[x,H1+.82,D/2-.1],.22,vC(0x6e5a32));
  for(const s of[-1,1])vB('vIron',x+s*.55,H1+.35,D/2-1.4,.12,.45,.45,0,iron);}
 // Twin cantilevered Old San Juan corner sentry garitas at (-W/2, +D/2) and (+W/2, +D/2)!
 for(const s of[-1,1]){const gx=s*(W/2+.35),gz=D/2+.35;
  vPst('maDrumC',gx,H1-2.2,gz,1.1,2.2,stD);
  maHollowDrum(gx,H1,gz,1.35,2.6,'vPlaster',wash,[0,s*Math.PI/4,s*Math.PI/2].map(a=>({a,y0:.8,w:.48,h:1.15,lit:true})),{band:st,wood});
  kput('maDomeTile',[gx,H1+2.6,gz],null,[1.42,1.15,1.42],or);
  vBall('vBallW',gx,H1+3.8,gz,.18,st);}
 // Rear vaulted casemate command pavilion & harbour signal beacon tower (z = -3.8, y = H1..H1+4.8)
 vnBody('vPlaster',0,H1,-3.8,11.6,3.8,6.4,0,wash,{t:.32});
 maQuoins(0,H1,-3.8,11.6,3.8,6.4,0,st,.45);
 maParapet(0,H1+3.8,-3.8,11.6,6.4,0,wash,st,.65,true);
 maCanteraPortal(0,H1,-.6,0,2.0,2.9,st,or,wood,{pediment:false});
 // Iron signal brazier & imperial banner mast on the command roof
 vPst('maDrumC',-3.6,H1+3.8,-3.8,.85,1.6,stD);vBall('vBulb',-3.6,H1+5.6,-3.8,.45);
 vnBannerPole(3.6,H1+3.8,-3.8,0,5.2,or);
 // Arched sally-port gate at ground level on +z face + casemate embrasure windows
 maCanteraPortal(0,Y0,D/2,0,2.6,3.6,stD,or,wood,{pediment:false,front:true});
 for(const s of[-1,1])maArch(s*5.8,Y0+3.8,D/2,0,1.2,1.8,{fill:'L',band:stD,bw:.16});}

// ---------------------------------------------------------------- 5. TAUAR DE GARITA BASTION WATCHTOWER (civic/military, lit): octagonal garita-like tower
function buildMarGaritaWatch(G,o){reseed(10016+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),wood=MA_WOOD();
 vnReg('Tauar de Garita bastion watchtower (civic)',0,0,6.2,12.8,{type:['civic','military'],wealth:'civic',role:'guard'});
 // battered octagonal stone bastion drum (y = 0..5.6) + corbelled upper circular garita watch-drum & ribbed cupola
 vPst('maDrumC',0,-.3,0,4.2,3.1,stD);
 vPst('maDrumC',0,2.8,0,3.8,2.8,st);
 kput('maRing',[0,5.6,0],null,[4.05,4.05,1.8],or);
 maHollowDrum(0,5.75,0,3.3,3.8,'vPlaster',wash,[0,1,2,3,4,5,6,7].map(k=>({a:k*TAU/8,y0:1.1,w:.72,h:1.55,lit:true})),{band:st,wood});
 kput('maRing',[0,9.55,0],null,[3.48,3.48,1.6],st);
 kput('maDomeTile',[0,9.6,0],null,[3.35,2.45,3.35],or);
 vPst('maDrumC',0,11.95,0,.62,.65,st);
 vBall('vBulb',0,12.75,0,.32);
 maCanteraPortal(0,0,3.85,0,1.65,2.65,st,or,wood,{pediment:false,gate:true});}

// ---------------------------------------------------------------- 6. PORTA DE MARR FORTIFIED CITY & CANAL GATE (civic/military, lit): twin garita towers + Baroque arch
function buildMarCityGate(G,o){reseed(10018+(o.v|0));
 const wash=MA_OCHRE(),or=MA_OR(),st=MA_CANT(),stD=MA_CANTD(),iron=MA_IRON(),wood=MA_WOOD(),tile=MA_TILE();
 vnReg('Porta de Marr fortified city gate (civic)',0,0,11.5,12.6,{type:['civic','military','infrastructure'],wealth:'civic',role:'guard'});
 const W=20.8,D=8.4,H=7.4;
 // Central rusticated ashlar & tapia gatehouse block (w = 12.4, d = 7.6, h = 7.4) with open 4.2 x 4.8 m vaulted passage
 vB('maCantera',0,-.2,0,12.8,.22,7.8,0,stD);
 for(const s of[-1,1]){
  vB('maCantera',s*4.25,0,0,4.3,2.8,7.8,0,stD);
  vB('vPlaster',s*4.15,2.8,0,4.1,2.0,7.4,0,wash);}
 vB('vPlaster',0,4.8,0,12.4,H-4.8,7.4,0,wash);
 maQuoins(0,0,0,12.4,H,7.4,0,st,.52);
 maBand(0,H-.35,0,12.6,7.6,0,or,.16,.26);
 // Central vaulted passageway (w = 4.6, h = 4.8) with Baroque stone portals on +z and -z + wrought-iron portcullis grille
 for(const s of[-1,1]){
  maCanteraPortal(0,0,s*3.75,s>0?0:Math.PI,4.2,4.8,st,or,wood,{pediment:true,gate:true});}
 for(let x=-1.6;x<=1.6;x+=.4)vB('vIron',x,2.6,0,.04,2.2,.04,0,iron);
 // Scrolled Baroque crest (espadana) & imperial banner above the central gatehouse
 maEspadana(0,H+.2,3.4,0,6.2,3.6,wash,st,1);
 vnBannerPole(0,H,0,0,4.8,or);
 // Twin projecting circular/octagonal Garita Bastion Towers at x = -7.4 and x = +7.4!
 for(const s of[-1,1]){const tx=s*7.4,tz=.6;
  vPst('maDrumC',tx,-.2,tz,3.1,3.2,stD);
  vPst('maDrumC',tx,3.0,tz,2.85,3.2,st);
  kput('maRing',[tx,6.2,tz],null,[3.05,3.05,1.6],or);
  maHollowDrum(tx,6.3,tz,2.65,3.1,'vPlaster',wash,[0,1,2,3,4,5].map(k=>({a:k*TAU/6,y0:.85,w:.62,h:1.35,lit:true})),{band:st,wood});
  kput('maRing',[tx,9.4,tz],null,[2.8,2.8,1.4],st);
  kput('maDomeTile',[tx,9.45,tz],null,[2.72,1.95,2.72],or);
  vBall('vBulb',tx,11.5,tz,.24);
  // Crenellated merlons linking the gatehouse to the twin garita towers
  vB('maCantera',s*3.8,H,3.3,2.2,1.2,.65,0,st);
  vBq('maTileB',s*3.8,H+1.25,3.3,2.35,.14,.8,vQ(.15,0,0),tile);}}

VERN.def({key:'mar_canal_quay',name:'Canal stone quay wall (Knal de Marr)',family:'infrastructure',tags:{type:['infrastructure'],wealth:'middle',lit:false,role:'bargeman',job:'hauling'},w:24,d:8,h:3.8,build:buildMarCanalQuay});
VERN.def({key:'mar_canal_bridge',name:'Arched stone canal bridge (Brij de Sidi)',family:'infrastructure',tags:{type:['infrastructure'],wealth:'middle',lit:false},w:18,d:10,h:6.2,build:buildMarCanalBridge});
VERN.def({key:'mar_tapia_wall',name:'Muraya de Marr curtain wall & Garita de Guach',family:'infrastructure',tags:{type:['infrastructure','military'],wealth:'civic',lit:true,role:'guard',job:'guard'},w:18,d:7,h:9.8,build:buildMarTapiaWall});
VERN.def({key:'mar_castillo_bastion',name:'Forta de Poinda sea-fortress bastion',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true,role:'soldier',job:'guard'},w:24,d:22,h:13.5,build:buildMarCastilloBastion});
VERN.def({key:'mar_garita_watch',name:'Tauar de Garita bastion watchtower',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true,role:'guard',job:'guard'},w:10,d:10,h:12.8,build:buildMarGaritaWatch});
VERN.def({key:'mar_city_gate',name:'Porta de Marr fortified city & canal gate',family:'civic',tags:{type:['civic','military','infrastructure'],wealth:'civic',lit:true,role:'guard',job:'guard'},w:22,d:10,h:12.6,build:buildMarCityGate});

