// ================================================================= DALAB (opt-in) — the lake, harbour, copper works, gene-houses and tithe barn
// Step N4 of settlements/nulab/PLAN.md (sections 3.2 and 7): the sixteen Dalab pieces for a lake port, its fishing hamlets, its
// copper-and-bronze works, its rim gene-breeding station, a daughter house of the Halls of Reformation, and its tithe barn.
// Built in the Dalab set's local frame (+z the front, y = 0 the stance, footings carried down by o.drop so shore and water
// structures never float), using Dalab's materials (69d) and helpers (69e). Seeds 44501..44651.
const nlOptDrop=o=>(o&&o.drop!=null)?Math.max(.35,o.drop):.5;

// ---------------------------------------------------------------- 1. BOAT SHED: timber-and-earth shore shed, launch skids, skiff on trestles
function buildNlBoatshed(G,o){reseed(44501+(o.v|0));const V=(o&&o.v)|0,W=14.4,D=8.2,H=3.2,dr=nlOptDrop(o);
 const wood=dCol(DPAL.woodGrey),oak=dCol(DPAL.wood),earth=dCol(DPAL.earth),th=dCol(DPAL.thatch),st=vC(0x8a8274);
 vnReg('Boat shed',0,0,9,H+2.8,{type:['industry','infrastructure']});
 vB('vStone',0,-dr,0,W+.6,dr+.15,D+.6,0,st);
 /* side walls of battered rammed earth with Dalab red foot and turquoise stripe; back closed, front (+z) wide open to the water */
 for(const s of[-1,1]){vB('dEarthE',s*(W/2-.45),0,0,.9,H,D,0,earth);vB('dEarth',s*(W/2-.42),.1,0,.96,.42,D+.04,0,dCol(DPAL.red));
  vB('dEarth',s*(W/2-.42),H-.42,0,.96,.18,D+.04,0,dCol(DPAL.turq));}
 vB('dEarthE',0,0,-D/2+.45,W-.9,H,.9,0,earth);
 for(const x of[-W/2+.45,-W/6,W/6,W/2-.45])vPst('vPostB',x,0,D/2-.2,.16,H+.2,wood);
 vB('vWood',0,H,D/2-.2,W+.4,.22,.28,0,wood);
 vnGableRoof(0,H,0,W+.6,D+.8,2.3,0,'vGableT',th,1.1,'vGableW',wood,.35);
 /* twin launch skids and wooden rollers running out the open front (+z) toward the shore */
 for(const bx of[-3.6,3.6]){for(const s of[-1.1,1.1])vB('vWood',bx+s,-dr*.35,.9,.2,dr*.35+.22,D+2.8,0,oak);
  for(let r=0;r<6;r++)kput('vPost',[bx,.22,-D/2+1.6+r*1.7],qEuler(0,0,Math.PI/2),[.09,2.5,.09],wood);}
 /* one upturned skiff hull on trestles in the west bay, a framed hull or stacked oars and nets in the east bay */
 {const hx=-3.6;for(const z of[-2.1,1.7])vB('vWood',hx,0,z,2.1,.85,.22,0,wood);
  vB('vWood',hx,.88,-.2,2.2,.65,5.8,0,oak);vB('vWood',hx,1.52,-.2,.22,.24,6.2,0,dCol(DPAL.red));
  for(const s of[-1,1])vB('vWood',hx+s*1.12,1.08,-.2,.08,.16,5.7,0,dCol(DPAL.turq));}
 {const ex=3.6;if(V===1){vB('vWood',ex,.35,-.3,.22,.32,5.6,0,oak);for(let k=0;k<6;k++){const z=-2.4+k*.95;vB('vWood',ex,.55,z,2.0,.12,.12,0,oak);
    for(const s of[-1,1])vB('vWood',ex+s*.95,.95,z,.12,.85,.12,0,oak);}}
  else{vnBarrel(ex-1.2,0,-2.2,.42,.95,oak);vnCrate(ex+1.1,0,-1.8,.85,.2,wood);
   for(let k=0;k<5;k++)kput('vPost',[ex-.8+k*.42,.16,.8],qEuler(Math.PI/2,0,.08),[.045,4.2,.045],oak);}}
 for(let k=0;k<4;k++)vBall('vGourd',W/2-1.4,.22,1.2+k*.55,.16,vC(0xc49452),.18);
 vPst('vClayPot',-W/2+1.3,0,D/2-1.1,.28,.55,vC(0x2a2420));   /* pitch pot */
 dnFolk(0,D/2+1.8,2,1.5);}
dDef({key:'nl_boatshed',name:'Boat shed',family:'harbour',tags:{type:['industry'],wealth:'peasant',lit:false},w:16,d:9,h:5.5,fw:15,fd:8.6,nv:3,build:buildNlBoatshed});

// ---------------------------------------------------------------- 2. FISH RACKS: split-fish A-frame racks, salt casks, gutting shade & small smoker
function buildNlFishracks(G,o){reseed(44511+(o.v|0));const V=(o&&o.v)|0,W=15,D=9.2,dr=nlOptDrop(o);
 const wood=dCol(DPAL.woodGrey),dark=vC(0x4a3a2a),earth=dCol(DPAL.earth),fishA=vC(0xb6ada0),fishB=vC(0x8e7252),saltC=vC(0xe6e0d2);
 vnReg('Fish racks and curing hearth',0,0,8.5,3.8,{type:['industry']});
 vB('dEarth',0,-dr,0,W,dr+.1,D,0,dCol(DPAL.earthDark));
 /* two long A-frame drying racks hung with split lake fish */
 for(let r=0;r<2;r++){const z=-2.4+r*3.4,rx=-1.6;
  for(let k=0;k<4;k++){const x=rx-4.5+k*3;vBeam([x,0,z-.85],[x,2.35,z],.06,wood,'vPost');vBeam([x,0,z+.85],[x,2.35,z],.06,wood,'vPost');}
  vBeam([rx-4.7,2.35,z],[rx+4.7,2.35,z],.055,dark,'vPost');
  for(const dz of[-.45,.45]){vBeam([rx-4.6,1.62,z+dz],[rx+4.6,1.62,z+dz],.04,dark,'vPost');
   for(let c=0;c<15;c++)vB('vWood',rx-4.2+c*.6,1.02,z+dz,.17,.58,.045,0,(c+r)%3?fishA:fishB);}}
 /* beehive smoking dome on +x, glowing fire mouth, salt barrels and reed-shaded gutting bench */
 {const sx=V===1?-5.4:5.2,sz=-1.8;kput('dEarthDome',[sx,0,sz],null,[2.1,2.3,2.1],dCol(DPAL.earthDark));
  vB('vDarkB',sx,.18,sz+1.95,.75,.68,.18,0);dnHearth(sx,.18,sz+2.0,0,.75,.68);vnChimney(sx,2.1,sz,1.1,.16,true);
  const bx=V===1?4.6:-5.2,bz=2.6;for(const dx of[-1.6,1.6])for(const dz of[-.9,.9])vPst('vPost',bx+dx,0,bz+dz,.07,2.2,wood);
  vnShedRoof(bx,2.1,bz,3.6,2.2,.35,0,'vThatchB',dCol(DPAL.thatch),.3,.2);
  vB('vWood',bx,.82,bz,2.8,.1,1.1,0,wood);for(const dx of[-1.1,1.1])vB('vWood',bx+dx,0,bz,.16,.82,.9,0,wood);
  vnBarrel(sx-1.4,0,2.2,.42,.92,wood);vB('vStone',sx-1.4,.93,2.2,.68,.08,.68,0,saltC);vnBarrel(sx-.4,0,2.6,.4,.88,wood);}
 dnFolk(0,3.2,3,2.2);}
dDef({key:'nl_fishracks',name:'Fish racks',family:'harbour',tags:{type:['industry'],wealth:'peasant',lit:false},w:16,d:10,h:4.2,fw:15,fd:9.2,nv:3,build:buildNlFishracks});

// ---------------------------------------------------------------- 3. SMOKEHOUSE: battered earth curing hall, turf/thatch roof, three smoke louvres
function buildNlSmokehouse(G,o){reseed(44521+(o.v|0));const W=12.6,D=8.4,H=3.8,dr=nlOptDrop(o);
 const earth=dCol(DPAL.earth),earthD=dCol(DPAL.earthDark),wood=dCol(DPAL.woodGrey),th=dCol(DPAL.thatch),st=vC(0x8a8274);
 vnReg('Smokehouse',0,0,8.2,H+3.6,{type:['industry']});
 vB('vStone',0,-dr,0,W+.8,dr+.35,D+.8,0,st);
 kput('dEarthBat',[0,.3,0],null,[W,H,D],earth);
 for(const sx of[-1,1])for(const sz of[-1,1])dnDrum('dEarthDrumB',sx*(W/2*.94),.3,sz*(D/2*.92),.75,H+.25,earth);
 vB('dEarth',0,.45,D/2*.95,W-1.8,.38,.14,0,dCol(DPAL.red));
 vnGableRoof(0,.3+H,0,W*.94,D*.94,2.6,0,'vGableT',th,1.15,'vGableW',wood,.35);
 /* three hooded smoke vents along the ridge, and low stoking hearths along the plinth */
 for(const x of[-3.6,0,3.6]){vB('vWood',x,.3+H+2.1,0,1.3,.85,1.3,0,wood);kput('dConeT',[x,.3+H+2.85,0],null,[1.05,.9,1.05],th);
  vnChimney(x,.3+H+2.6,0,1.1,.15,true);}
 vnDoor(0,.3,D/2*.94,0,1.3,2.1,'vWood',wood,vC(0x4a3828),false);
 for(const x of[-3.8,3.8]){vB('vDarkB',x,.45,D/2*.95,.85,.65,.18,0);dnHearth(x,.45,D/2*.96,0,.85,.65);}
 /* outside cooling rack under a side eave, salt barrels, cordwood stack */
 for(const z of[-2.2,2.2])vPst('vPost',W/2+2.2,0,z,.09,2.5,wood);
 vnShedRoof(W/2+1.2,2.4,0,2.6,5.4,.5,Math.PI/2,'vThatchB',th,.35,.2);
 for(let k=0;k<8;k++)vB('vWood',W/2+1.2,1.45,-2.0+k*.56,.18,.6,.05,Math.PI/2,vC(0x9e6c3c));
 dnWoodpile(-W/2-1.2,0,-.8,Math.PI/2,2.4);vnBarrel(-W/2-1.1,0,2.4,.44,.96,wood);vnBarrel(3.2,0,D/2+1.6,.42,.92,wood);
 dnFolk(0,D/2+2.4,2,1.6);}
dDef({key:'nl_smokehouse',name:'Smokehouse',family:'harbour',tags:{type:['industry'],wealth:'peasant',lit:false},w:14,d:10,h:6.5,fw:13.4,fd:9.2,build:buildNlSmokehouse});

// ---------------------------------------------------------------- 4. SHIPWRIGHT'S SLIP: inclined slipway ways into the water, boatyard hall & hull in ribs
function buildNlSlip(G,o){reseed(44531+(o.v|0));const W=14.6,D=38,H=5.0,dr=nlOptDrop(o);
 const wood=dCol(DPAL.woodGrey),oak=dCol(DPAL.wood),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle),st=vC(0x888072);
 vnReg("Shipwright's slip",0,0,20,H+3.6,{type:['industry']});
 /* upper stone-and-earth yard pad (-z half); inclined stone-and-pile slipway ramp sloping into the bay (+z half) */
 vB('vStone',0,-dr,-8,W+.6,dr+.3,21,0,st);
 const tilt=.11;
 for(let k=0;k<12;k++){const t=k/11,z=-1+t*19.5,y=.2-t*2.15;
  for(const s of[-1,1])vPst('vPostB',s*3.2,y-dr-1.6,z,.18,dr+1.7,wood);
  vB('vWood',0,y,z,7.2,.22,.36,0,wood);}
 for(const s of[-2.2,2.2])kput('vWood',[s,-.85,8.8],vQ(0,tilt,0),[.32,.28,20.5],oak);
 /* tall open-sided boatyard roof over the building berth (-z) */
 for(let i=0;i<=5;i++)for(const s of[-1,1])vPst('vPostB',s*(W/2-.5),.25,-17.5+i*3.8,.2,H,wood);
 vB('dEarth',0,.25,-18,W-.8,2.4,.9,0,earth);
 vnGableRoof(0,.25+H,-8,W+.8,20.6,2.8,0,'vGableS',sh,1.2,'vGableW',wood,.4);
 /* a 15 m lake vessel on keel blocks inside the shed: keel spine, 11 curved frame ribs, lower strakes, stem scroll */
 {const kz=-8,ky=.85;for(let k=0;k<6;k++)vB('vWood',0,.25,-14.5+k*2.6,.7,.6,.45,0,wood);
  vB('vWood',0,ky,kz,.28,.36,15.4,0,oak);
  for(let r=0;r<11;r++){const u=r/10,z=kz-6.8+u*13.6,bm=2.3*Math.sin(Math.PI*(.12+.76*u)),rh=1.65+.35*Math.abs(u-.5);
   vB('vWood',0,ky+.2,z,bm*1.5,.16,.16,0,oak);
   for(const s of[-1,1])kput('vWood',[s*bm*.92,ky+.88,z],qEuler(0,0,-s*.36),[.14,rh,.16],oak);}
  for(const s of[-1,1])for(let st2=0;st2<3;st2++)vB('vWood',s*(1.45+st2*.22),ky+.42+st2*.34,kz,.09,.3,13.2,0,st2===0?dCol(DPAL.red):oak);
  vPst('vPostB',0,ky,-8+7.8,.16,2.3,dCol(DPAL.red));}
 /* steam-bending box & hearth, stacked cedar planks, shear-legs tackle at the slip mouth */
 vB('dEarth',-W/2+1.8,.25,3.8,1.6,.9,1.4,0,earth);dnHearth(-W/2+1.8,.35,4.55,0,.6,.5);vnChimney(-W/2+1.8,1.15,3.8,1.5,.14,true);
 vB('vWood',-W/2+1.8,1.2,5.6,.55,.45,4.8,0,oak);
 for(let k=0;k<4;k++)vB('vWood',W/2-2.0,.3+k*.22,3.5,1.4,.16,5.2,0,oak);
 vBeam([-2.8,.25,2.4],[0,5.2,3.8],.14,wood,'vPost');vBeam([2.8,.25,2.4],[0,5.2,3.8],.14,wood,'vPost');
 kput('vRope',[0,3.2,3.8],null,[.035,3.8,.035],vC(0xb8a888));
 dnBannerPole(W/2-.8,.25,2.2,0,6,dCol(DPAL.turq));dnFolk(0,2.8,3,2.4);}
dDef({key:'nl_slip',name:"Shipwright's slip",family:'harbour',tags:{type:['industry'],wealth:'middle',lit:false},w:16,d:40,h:7.5,fw:15,fd:38,build:buildNlSlip});

// ---------------------------------------------------------------- 5. FERRY STAGE: piled pier (+z) + stone-and-timber civic waiting pavilion (-z)
function buildNlFerry(G,o){reseed(44541+(o.v|0));const W=12,D=25,dr=nlOptDrop(o);
 const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),grey=dCol(DPAL.woodGrey),sh=dCol(DPAL.shingle),tr=dCol(DPAL.trim);
 vnReg('Ferry stage',0,0,13.5,6.2,{type:['civic','infrastructure']});
 /* shore head (-z): stone platform with relief band, open colonnaded ticket/waiting pavilion, God-lamps */
 vB('dBlockB',0,-dr,-7.2,W,.4+dr,9.6,0,st);dnReliefBand(0,-.25,-2.4,0,W-1.6,.55,st);
 for(const sx of[-1,1])for(const sz of[-1,0,1])vPst('vPostS',sx*(W/2-1.1),.4,-7.2+sz*3.4,.24,3.2,st);
 vB('vWood',0,3.6,-7.2,W-.8,.28,8.6,0,wood);
 vnHipRoof('vHipS',0,3.88,-7.2,W-.4,8.8,2.1,0,sh,1.0);
 dnMuralBand(0,3.0,-11.2,0,W-3.2,.7,1);vB('vStone',0,.4,-11.3,W-2.4,2.8,.5,0,st);
 for(const s of[-1,1]){vB('vWood',s*3.4,.4,-7.2,1.1,.45,5.2,0,wood);dnGodLamp(s*4.2,3.2,-2.9,0);}
 /* timber pile-stage projecting +z over the water, mooring bollards, gangway brow, cargo & passengers */
 const PL=14.6,pz=4.9;
 for(let k=0;k<6;k++){const z=-2.0+k*2.9;for(const x of[-4.2,-1.4,1.4,4.2])vPst('vPostB',x,-dr-2.8,z,.2,dr+3.05,grey);
  vB('vWood',0,.05,z,9.2,.24,.28,0,grey);}
 vB('vWood',0,.28,pz,9.0,.2,PL,0,wood);
 for(const s of[-1,1]){vB('vWood',s*4.35,.48,pz,.24,.22,PL,0,grey);
  for(const z of[2.5,8.2,11.6]){vPst('vPostB',s*4.1,.48,z,.22,.85,wood);kput('dRopeRing',[s*4.1,.85,z],qEuler(Math.PI/2,0,0),[.32,.32,1],vC(0xb8a888));}}
 /* stepped landing brow at the outer end (+z) */
 vnStairs(0,-.35,12.8,0,3.6,.82,4,'vWood',wood);
 for(const s of[-1,1])dnBannerPole(s*4.2,.48,11.4,0,5.8,dCol(s<0?DPAL.red:DPAL.turq));
 dnGodPost(-4.6,.4,-2.4,3.8);vnSacks(-2.6,.48,2.2,5);vnCrate(2.8,.48,3.0,.9,.2,wood);vnBarrel(3.0,.48,4.4,.42,.95,wood);
 dnFolk(0,4.5,5,2.8,.48);}
dDef({key:'nl_ferry',name:'Ferry stage',family:'harbour',tags:{type:['civic'],wealth:'civic',lit:true},w:14,d:26,h:5.8,fw:12.6,fd:25,build:buildNlFerry});

// ---------------------------------------------------------------- 6. TIMBER JETTY: driven piles, cross-braced bents, plank walk, bollards & creels
function buildNlJetty(G,o){reseed(44551+(o.v|0));const W=5.6,D=29,dr=nlOptDrop(o);
 const wood=dCol(DPAL.wood),grey=dCol(DPAL.woodGrey),rope=vC(0xb8a888);
 vnReg('Timber jetty',0,0,15,3.4,{type:['infrastructure']});
 vB('vStone',0,-dr,-D/2+1.8,W+1.2,dr+.25,3.6,0,vC(0x888074));
 for(let k=0;k<9;k++){const z=-D/2+2.4+k*3.2;
  for(const s of[-1,1])vPst('vPostB',s*(W/2-.35),-dr-2.6,z,.18,dr+2.82,grey);
  vB('vWood',0,.04,z,W+.3,.2,.24,0,grey);
  if(k%2===0)vBeam([-W/2+.35,-dr*.6,z],[W/2-.35,0,z],.08,grey,'vPost');}
 vB('vWood',0,.24,1.2,W,.18,D-2.4,0,wood);
 for(const s of[-1,1]){vB('vWood',s*(W/2-.18),.42,1.2,.2,.16,D-2.4,0,grey);
  for(const z of[-4,3.5,10.5,D/2-1.4]){vPst('vPostB',s*(W/2-.42),.42,z,.18,.78,wood);kput('dRopeRing',[s*(W/2-.42),.76,z],qEuler(Math.PI/2,0,0),[.28,.28,1],rope);}}
 dnBannerPole(W/2-.5,.42,D/2-1.6,0,4.8,dCol(DPAL.turq));
 vnBarrel(-1.4,.42,8.2,.4,.9,wood);vnCrate(1.3,.42,6.4,.8,.25,grey);vnSacks(-1.2,.42,-2.5,3);
 dnFolk(0,5.5,2,2.2,.42);}
dDef({key:'nl_jetty',name:'Timber jetty',family:'harbour',tags:{type:['industry'],wealth:'peasant',lit:false},w:8,d:30,h:3.5,fw:6.6,fd:29,nv:2,build:buildNlJetty});

// ---------------------------------------------------------------- 7. ORE YARD: stone-and-earth walled sorting floor, four green-ore bins, cobbing shed
function buildNlOreyard(G,o){reseed(44561+(o.v|0));const W=28,D=28,dr=nlOptDrop(o);
 const earth=dCol(DPAL.earth),st=vC(0x827c72),wood=dCol(DPAL.woodGrey),oreG=vC(0x3c7a64),oreD=vC(0x4e483c),oreB=vC(0x7a5c38);
 vnReg('Copper ore yard',0,0,15.5,4.8,{type:['industry']});
 vB('dEarth',0,-dr,0,W+.8,dr+.18,D+.8,0,dCol(DPAL.earthDark));
 vnPaving(0,.2,0,W-3,D-3,0,st,48);
 dnEarthWall(0,.15,0,W,D,0,1.7,5.4,{c:earth,t:.95});
 /* four heavy stone-and-plank ore bins along the back (-z), heaped with malachite/bornite and dark chalcopyrite skarn */
 for(let b=0;b<4;b++){const bx=-9.6+b*6.4,bz=-8.6;
  for(const s of[-1,1])vB('vStone',bx+s*2.6,.18,bz,.45,1.6,5.2,0,st);
  vB('vStone',bx,.18,bz-2.4,5.6,1.8,.45,0,st);
  const hc=b%2===0?oreG:b===1?oreD:oreB;
  kput('dEarthDome',[bx,.18,bz-.2],null,[2.2,1.55+rr(-.15,.2),2.1],hc);
  for(let r=0;r<7;r++)kput('vRock',[bx+rr(-1.6,1.6),.4+rr(0,.9),bz+rr(-1.4,1.6)],qEuler(rng(),rng(),0),[.42,.3,.38],r%2?oreG:oreD);}
 /* open cobbing and sorting shed in the middle: stone breaking blocks, weighing beam, ore barrows */
 {const sx=-5.2,sz=3.2;for(const dx of[-5,0,5])for(const dz of[-3,3])vPst('vPostB',sx+dx,.18,sz+dz,.15,3.2,wood);
  vnShedRoof(sx,3.25,sz,11,7,.7,0,'vCorr',null,.8,.14);
  for(let k=0;k<4;k++){vB('vStone',sx-3.6+k*2.4,.18,sz,.9,.65,.9,0,st);kput('vRock',[sx-3.6+k*2.4,.9,sz],null,[.28,.2,.26],oreG);}}
 /* tally beam scale and stacked ore sacks on +x */
 vPst('vPostB',7.5,.18,3.5,.16,3.1,wood);vB('vWood',7.5,2.95,3.5,3.2,.12,.12,.2,wood);
 for(const s of[-1.4,1.4])kput('vRope',[7.5+s,2.1,3.5],null,[.025,1.6,.025],vC(0xb8a888));
 vnSacks(7.2,.18,-1.2,7);vnSacks(9.4,.18,1.0,5);vnCrate(9.2,.18,5.2,1.0,.3,wood);
 dnBannerPole(W/2-1.8,.18,D/2-1.8,0,5.6,dCol(DPAL.turq));dnFolk(0,4.5,5,4.5,.2);}
dDef({key:'nl_oreyard',name:'Copper ore yard',family:'works',tags:{type:['industry'],wealth:'peasant',lit:false},w:30,d:30,h:4.8,fw:28.5,fd:28.5,build:buildNlOreyard});

// ---------------------------------------------------------------- 8. ORE ROASTING BED: three stone-walled roasting stalls, cordwood & glowing heaps
function buildNlRoastbed(G,o){reseed(44571+(o.v|0));const W=22,D=14,dr=nlOptDrop(o);
 const st=vC(0x7c7468),earth=dCol(DPAL.earthDark),wood=dCol(DPAL.wood),ash=vC(0x3e3a36),oreR=vC(0x6e4430),oreG=vC(0x3e745e);
 vnReg('Ore roasting bed',0,0,12,3.8,{type:['industry']});
 vB('dEarth',0,-dr,0,W+1,dr+.2,D+1,0,earth);
 /* back wall and four dividing stone piers forming three open-fronted roasting stalls */
 vB('vStone',0,.18,-2.2-2.8,W,.2+2.1,.7,0,st);
 for(let p=0;p<4;p++){const px=-W/2+.4+p*(W-.8)/3;vB('vStone',px,.18,-2.2,.7,1.9,5.6,0,st);}
 for(let b=0;b<3;b++){const bx=-W/2+(b+.5)*W/3,bz=-2.2;
  /* cordwood bed under roasted red-brown / malachite ore heap, glowing hearth and smoke plume */
  for(let k=0;k<6;k++)kput('vPost',[bx-2.0+k*.8,.34,bz+1.6],qEuler(Math.PI/2,0,0),[.12,4.4,.12],wood);
  kput('dEarthDome',[bx,.38,bz-.1],null,[2.5,1.25,2.2],b===1?ash:oreR);
  for(let r=0;r<5;r++)kput('vRock',[bx+rr(-1.5,1.5),.6+rr(0,.6),bz+rr(-1.2,1.2)],qEuler(rng(),rng(),0),[.34,.24,.3],r%2?oreR:oreG);
  dnHearth(bx,.32,bz+2.1,0,1.4,.55);vnChimney(bx,1.55,bz-.4,1.2,.2,true);}
 /* quench trough and cordwood ricks out front (+z) */
 vB('vStone',-6.5,.18,4.4,3.4,.65,1.2,0,st);vB('vDarkB',-6.5,.76,4.4,3.0,.1,.85,0,vC(0x2d504e));
 dnWoodpile(5.8,.18,4.2,0,3.4);dnWoodpile(9.2,.18,4.2,0,2.8);
 dnFolk(-1,4.6,3,3.2,.2);}
dDef({key:'nl_roastbed',name:'Ore roasting bed',family:'works',tags:{type:['industry'],wealth:'peasant',lit:false},w:24,d:16,h:3.8,fw:22.5,fd:14.5,nv:2,build:buildNlRoastbed});

// ---------------------------------------------------------------- 9. COPPER SMELTER: twin iron-strapped shaft furnaces, bellows lean-to, slag & matte
function buildNlSmelter(G,o){reseed(44581+(o.v|0));const W=16,D=12,H=4.4,dr=nlOptDrop(o);
 const earth=dCol(DPAL.earth),earthD=dCol(DPAL.earthDark),st=vC(0x7e786e),wood=dCol(DPAL.woodGrey),iron=vC(0x2e2a26),cop=vC(0xb86838);
 vnReg('Copper smelter',0,0,10,9.5,{type:['industry']});
 vB('vStone',0,-dr,0,W+.8,dr+.35,D+.8,0,st);
 /* open-fronted smelter house (-x..+x), battered back and side walls, shingle/salvage roof */
 vB('dEarthE',0,.3,-D/2+.55,W-3.4,H,1.1,0,earth);
 vB('dEarthE',-W/2+1.7+.5,.3,-.8,1.0,H-.4,D-2.2,0,earth);
 for(const x of[-5.8,-1.8,2.2,5.8])vPst('vPostB',x,.3,D/2-1.4,.18,H+.2,wood);
 vnGableRoof(-.8,.3+H,-.6,W-2.4,D-1.2,2.4,0,'vGableS',dCol(DPAL.shingle),1.1,'vGableW',wood,.35);
 /* twin tall tapered shaft furnaces rising through the roof, iron straps, glowing tap mouths & slag pots */
 for(const fx of[-3.0,1.4]){dnDrum('dStoneDrumB',fx,.3,-1.2,1.65,3.2,st);dnDrum('dEarthDrumB',fx,3.4,-1.2,1.28,3.6,earthD);
  for(const yy of[1.2,2.6,4.4,6.0])kput('dRing',[fx,yy,-1.2],qEuler(Math.PI/2,0,0),[yy>3.2?1.32:1.7,yy>3.2?1.32:1.7,1],iron);
  vnChimney(fx,6.9,-1.2,2.2,.28,true);
  vB('vDarkB',fx,.45,.42,.85,.8,.22,0);dnHearth(fx,.45,.5,0,.85,.8);
  vB('vStone',fx,.3,1.5,1.1,.28,1.8,0,iron);vPst('vClayPot',fx,.3,2.7,.38,.55,iron);}
 /* bellows lean-to on +x: twin timber-and-hide box bellows feeding tuyere pipes into the shafts */
 {const bx=W/2-1.6;for(const z of[-3.6,2.2])vPst('vPostB',bx+1.2,.3,z,.14,2.8,wood);
  vnShedRoof(bx,3.1,-.7,3.2,6.8,.6,Math.PI/2,'vCorr',null,.6,.14);
  for(const z of[-2.2,.2]){vB('vWood',bx,.6,z,1.8,.9,1.3,0,wood);kput('vTarpB',[bx,1.1,z],null,[1.6,.5,1.1],vC(0x6e563c));
   vBeam([bx-.8,.85,z],[1.4,.95,-1.2],.09,iron,'vPipe');}}
 /* stacked copper matte cakes & charcoal sacks out front */
 for(let k=0;k<6;k++)vB('vIron',-5.2+(k%3)*.75,.34+Math.floor(k/3)*.18,3.6,.62,.16,.42,0,cop);
 vnSacks(4.4,.3,3.6,6);dnBanner(-5.8,.3+H+.2,D/2-1.2,0,.85,2.0,dCol(DPAL.red));
 dnFolk(-.5,4.2,3,2.2,.3);}
dDef({key:'nl_smelter',name:'Copper smelter',family:'works',tags:{type:['industry'],wealth:'peasant',lit:false},w:18,d:14,h:9.5,fw:17,fd:13,nv:2,build:buildNlSmelter});

// ---------------------------------------------------------------- 10. BRONZE FOUNDRY: long clerestory hall, three crucible furnaces, casting pit & ingots
function buildNlFoundry(G,o){reseed(44591+(o.v|0));const W=28,D=20,H=4.8,dr=nlOptDrop(o);
 const earth=dCol(DPAL.earth),st=dCol(DPAL.stone),wood=dCol(DPAL.wood),grey=dCol(DPAL.woodGrey),sh=dCol(DPAL.shingle),iron=vC(0x2e2a26);
 const bronze=vC(0xc88438),tin=vC(0xbac2c6);
 vnReg('Bronze foundry',0,0,16,10.8,{type:['industry']});
 vB('vStone',0,-dr,0,W+.8,dr+.4,D+.8,0,st);
 /* battered earth side/back walls, wide three-bay open front (+z), raised clerestory vent monitor on the ridge */
 kput('dEarthBat',[0,.35,-1.2],null,[W,H,D-2.6],earth);
 for(let k=-3;k<=3;k++)dnDrum('dEarthDrumB',k*3.8,.35,-1.2-(D-2.6)/2*.94,.8,H+.3,earth);
 vnGableRoof(0,.35+H,-1.2,W*.95,(D-2.6)*.95,2.8,0,'vGableS',sh,1.2,'vGableW',wood,.4);
 vB('vWood',0,.35+H+2.0,-1.2,W*.58,1.3,4.2,0,grey);vnGableRoof(0,.35+H+3.3,-1.2,W*.62,4.8,1.1,0,'vGableS',sh,.8,'vGableW',wood,.25);
 /* three wide arched/framed casting doors on +z, three tall brick/stone crucible chimneys piercing the back roof */
 for(const x of[-7.5,0,7.5]){const dz=-1.2+(D-2.6)/2*.95;vB('vDarkB',x,.35,dz,3.6,3.4,.2,0);
  vB('vWood',x,.35+3.4,dz+.08,4.2,.32,.4,0,wood);dnHearth(x,.45,dz+.05,0,2.2,1.6);
  dnDrum('dStoneDrumB',x,.35+H,-4.2,1.05,3.8,st);vnChimney(x,.35+H+3.8,-4.2,2.4,.26,true);}
 dnMuralBand(0,.35+H-.9,-1.2+(D-2.6)/2*.96,0,W-6,.75,1);
 /* forecourt casting & cooling apron (+z): sunken mould bed with glowing molten bronze bars, gantry beam, stacked bronze & tin */
 vB('vStone',0,.36,8.2,9.4,.28,2.6,0,iron);
 for(let m=0;m<6;m++)vB('dGlow',-3.5+m*1.4,.66,8.2,.9,.08,1.6,0);
 for(const s of[-5.2,5.2])vPst('vPostB',s,.35,8.2,.2,3.8,wood);
 vB('vWood',0,4.0,8.2,11.0,.24,.24,0,wood);kput('vRope',[0,2.5,8.2],null,[.035,2.8,.035],iron);vPst('vClayPot',0,1.0,8.2,.38,.65,iron);
 /* bronze ingot pallets (-x) and tin pigs from the Line (+x) */
 vB('vWood',-9.8,.35,8.0,2.8,.18,2.0,0,grey);
 for(let r=0;r<3;r++)for(let c=0;c<4;c++)vB('vIron',-10.7+c*.6,.55+r*.18,7.5+(r%2)*.35,.48,.16,.9,0,bronze);
 vB('vWood',9.8,.35,8.0,2.4,.18,1.8,0,grey);
 for(let r=0;r<2;r++)for(let c=0;c<3;c++)vB('vIron',9.1+c*.65,.55+r*.18,8.0,.52,.16,.8,0,tin);
 for(const s of[-1,1])dnBannerPole(s*(W/2-1.2),.35,8.8,0,6.5,dCol(s<0?DPAL.gold:DPAL.turq));
 dnFolk(0,6.4,5,4.2,.36);}
dDef({key:'nl_foundry',name:'Bronze foundry',family:'works',tags:{type:['industry'],wealth:'middle',lit:false},w:30,d:22,h:10.8,fw:28.5,fd:20.5,build:buildNlFoundry});

// ---------------------------------------------------------------- 11. CHARCOAL & PEAT YARD: smoking earth clamps, cordwood ricks, peat & sack shed
function buildNlCharcoal(G,o){reseed(44601+(o.v|0));const V=(o&&o.v)|0,W=18.5,D=14.5,dr=nlOptDrop(o);
 const wood=dCol(DPAL.woodGrey),oak=dCol(DPAL.wood),earthD=dCol(DPAL.earthDark),charC=vC(0x262220),peatC=vC(0x4a3828),th=dCol(DPAL.thatch);
 vnReg('Charcoal and peat yard',0,0,11,4.8,{type:['industry']});
 vB('dEarth',0,-dr,0,W+.6,dr+.12,D+.6,0,earthD);
 vnFence(0,.1,0,W,D,0,wood,4.2,1.15);
 /* two turf-covered smoking earth clamps (charcoal mounds) */
 for(const [cx,cz,r] of[[-4.2,-2.2,3.1],[2.8,-3.0,2.5]]){
  dnDrum('dEarthDrum',cx,.1,cz,r+.2,.35,charC);kput('dEarthDome',[cx,.25,cz],null,[r,r*.82,r],earthD);
  vnChimney(cx,.25+r*.78,cz,1.1,.18,true);dnHearth(cx,.2,cz+r-.1,0,.45,.32);}
 /* open thatch sack-shed on +x, cordwood ricks and cut peat stacks */
 {const sx=5.6,sz=2.8;for(const dx of[-2.2,2.2])for(const dz of[-1.8,1.8])vPst('vPostB',sx+dx,.1,sz+dz,.13,2.6,wood);
  vnHipRoof('vHipT',sx,2.7,sz,4.8,4.0,1.5,0,th,.9);vnSacks(sx-.6,.12,sz,6);
  for(let k=0;k<4;k++)vB('vDarkB',sx+1.1,.2+k*.24,sz-.4,1.1,.22,.9,0,charC);}
 dnWoodpile(-5.2,.1,3.8,0,3.6);dnWoodpile(-5.2,.1,5.3,0,3.2);
 if(V===0)for(let r=0;r<3;r++)vB('dEarth',.2,.2+r*.32,4.4,2.8-r*.3,.3,1.4,0,peatC);
 dnFolk(-.8,2.5,3,2.4,.12);}
dDef({key:'nl_charcoal',name:'Charcoal yard',family:'works',tags:{type:['industry'],wealth:'peasant',lit:false},w:20,d:16,h:4.8,fw:19,fd:15,nv:2,build:buildNlCharcoal});

// ---------------------------------------------------------------- 12. MINE ADIT: stone-and-earth cut bank, heavy timber portal sets, cart rails & spoil
function buildNlAdit(G,o){reseed(44611+(o.v|0));const W=9,D=7.4,dr=nlOptDrop(o);
 const earth=dCol(DPAL.earth),st=vC(0x7c766c),wood=dCol(DPAL.wood),grey=dCol(DPAL.woodGrey),iron=vC(0x36322e),oreG=vC(0x3e7862);
 vnReg('Mine adit',0,0,6,4.8,{type:['industry']});
 vB('dEarth',0,-dr,0,W,dr+.15,D,0,dCol(DPAL.earthDark));
 /* battered stone-and-turf portal mound at the back (-z), dark drift mouth framed by squared timber cap-and-leg sets */
 kput('dEarthBat',[0,.12,-1.6],null,[7.4,3.6,3.8],earth);kput('dEarthDome',[0,2.8,-1.8],null,[3.8,1.5,2.2],dCol(DPAL.turf));
 vB('vStone',0,.12,.25,4.6,3.1,.7,0,st);vB('vDarkB',0,.12,.38,2.2,2.4,.4,0);
 for(const z of[.45,1.15]){for(const s of[-1.18,1.18])kput('vPostB',[s,.12,z],qEuler(0,0,-Math.sign(s)*.07),[.18,2.55,.18],wood);
  vB('vWood',0,2.58,z,2.8,.24,.24,0,wood);}
 /* cart rails out onto the spoil fan (+z) and a loaded wooden ore tub */
 for(const s of[-.42,.42])vB('vIron',s,.16,1.9,.07,.08,3.6,0,iron);
 for(let k=0;k<6;k++)vB('vWood',0,.13,.5+k*.62,1.2,.06,.14,0,grey);
 vB('vWood',0,.52,2.3,.95,.62,1.35,0,wood);kput('dEarthDome',[0,.82,2.3],null,[.45,.32,.6],oreG);
 for(let r=0;r<8;r++)kput('vRock',[2.4+rr(-1.1,1.1),.22+rr(0,.45),1.8+rr(-1.1,1.1)],qEuler(rng(),rng(),0),[.38,.26,.34],r%2?oreG:st);
 dnFolk(-1.8,2.2,2,1.0,.15);}
dDef({key:'nl_adit',name:'Mine adit',family:'works',tags:{type:['industry'],wealth:'peasant',lit:false},w:10,d:8,h:4.8,fw:9,fd:7.4,build:buildNlAdit});

// ---------------------------------------------------------------- 13. DAUGHTER HALLS OF REFORMATION: r=21 stone ring, panel-domed drum, wing vats & Giants
function buildNlHalls(G,o){reseed(44621+(o.v|0));const R=21,dr=nlOptDrop(o);
 const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.86),tr=dCol(DPAL.trim),sh=dCol(DPAL.shingle),iron=vC(0x2e2a26);
 vnReg('Daughter House of the Halls of Reformation',0,0,R+2,21,{landmark:true,type:['civic','religious']});
 vnReg('Daughter Halls wall',0,0,R+1,4.2,{part:'wall',type:['civic']});
 dnDrum('dStoneDrum',0,-dr,0,R+.8,dr+.15,stD);
 vnPaving(0,.16,0,R*1.65,R*1.65,0,st.clone().multiplyScalar(.92),64);
 dnRingWall(0,.15,0,R,3.6,0,5.6,'vStone',st,1.0);
 /* twin-drum stone gatehouse at +z with carved relief lintel and four-armed Giant guards */
 for(const s of[-1,1]){dnDrum('dStoneDrumB',s*3.6,.15,R,1.8,5.8,st);dnDrum('dReliefDrum',s*3.6,4.6,R,1.84,.75,st);
  kput('dConeSh',[s*3.6,5.65,R],null,[2.2,1.9,2.2],sh);dnGiant(s*2.4,.16,R+2.2,s*.2,4,{spear:true});}
 vB('vStone',0,4.2,R,6.2,1.05,1.8,0,st);dnReliefBand(0,4.35,R+.92,0,5.2,.75,st);
 /* central Reformation drum (r 7.8) on stepped plinth, God windows & teal light ring, Ancient panel dome on iron ribs */
 {const HR=7.8,HH=5.8,CR=5.6,CH=2.4,Y0=.95;
  dnDrum('dStoneDrum',0,.15,0,HR+2.2,.42,stD);dnDrum('dStoneDrum',0,.55,0,HR+1.1,.42,stD);
  vnStairs(0,.15,HR+2.5,0,3.8,.82,3,'vStone',st);
  dnDrum('dStoneDrumB',0,Y0,0,HR,HH,st);dnDrum('dReliefDrum',0,Y0+.35,0,HR+.05,.9,st);dnMuralRing(0,Y0+HH-1.9,0,HR-.1,1.25);
  for(let k=0;k<8;k++){const a=(k+.5)/8*TAU;const p=dnOnRing(0,0,HR-.2,a);kput('dEarthBat',[p[0],Y0,p[1]],qEuler(0,-a,0),[1.0,HH+.8,1.4],st);
   if(k!==1&&k!==2){const b=k/8*TAU,w=dnOnRing(0,0,HR,b);if(Math.abs(w[0])>2.2||w[1]<0)dnGodWin(w[0],Y0+1.8,w[1],b,.85,1.5,'vStone',st);}}
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU,p=dnOnRing(0,0,HR,a);dnGodStrip(p[0],Y0+HH-.4,p[1],a,TAU*HR/16-.35);}
  dnGate(0,Y0,HR+.3,0,2.2,3.4,st,tr);vnDoor(0,Y0,HR,0,2.0,3.2,'vStone',st,vC(0x2a2a30),false);
  vB('vStone',0,Y0+HH,0,HR*2+.8,.55,HR*2+.8,0,stD);dnDrum('dStoneDrum',0,Y0+HH+.55,0,CR,CH,st);
  for(let k=0;k<8;k++){const a=(k+.5)/8*TAU,p=dnOnRing(0,0,CR,a);dnGodWin(p[0],Y0+HH+1.1,p[1],a,.75,1.1,'vStone',st);}
  const DY=Y0+HH+.55+CH;kput('dPanelDome',[0,DY,0],null,[CR-.2,CR*.7,CR-.2],null);
  for(let k=0;k<8;k++){const a=k/8*TAU,p=dnOnRing(0,0,CR-.8,a);kput('vIron',[p[0],DY+1.4,p[1]],vQ(a,-.5,0),[.22,CR*.58,.22],iron);}
  vBall('dGodBall',0,DY+CR*.7+.5,0,.52);vBall('dGlassBall',0,DY+CR*.7+.5,0,.52);}
 /* two flanking rust-domed wing drums linked by overhead Ancient pipes, plus glowing culture vats */
 for(const s of[-1,1]){const wx=s*12.4,wz=-4.5,WR=3.8,WH=3.8;
  dnDrum('dStoneDrumB',wx,.15,wz,WR,WH,st);kput(s<0?'dRustDome':'dPanelDome',[wx,.15+WH,wz],null,[WR-.15,WR*.62,WR-.15],null);
  const toC=Math.atan2(-wx,-wz),dp=dnOnRing(wx,wz,WR,toC);vnDoor(dp[0],.15,dp[1],toC,1.1,2.2,'vStone',st,vC(0x2a2a30),false);
  vBeam([wx-s*WR*.8,3.4,wz],[s*7.2,4.8,-2.2],.24,null,'vPipeR');vBeam([wx-s*WR*.8,2.6,wz],[s*7.2,3.8,-2.2],.15,null,'vPipe');
  for(let t=0;t<2;t++){const tx=s*(10.5+t*3.2),tz=6.8;vPst('vTankW',tx,.15,tz,1.05,2.2,null);vBall('dGodBall',tx,2.55,tz,.18);vBall('dGlassBall',tx,2.55,tz,.18);}}
 for(const s of[-1,1]){dnGodPost(s*3.8,.16,12.5,3.8);dnStele(s*8.5,.16,10.5,Math.PI,2.8,st);}
 dnPriest(-2.2,.16,11.5,.3);dnPriest(2.4,.16,10.2,-.4);dnFolk(0,14,3,2.4,.16);}
dDef({key:'nl_halls',name:'Daughter House of the Halls of Reformation',family:'civic',tags:{type:['civic','religious'],wealth:'priest',lit:true},w:48,d:48,h:21,fw:45,fd:45,build:buildNlHalls});

// ---------------------------------------------------------------- 14. GENE-HOUSES' VATS: grey-stone civic hall over six glowing breeding vats
function buildNlVats(G,o){reseed(44631+(o.v|0));const W=22,D=16,H=4.4,dr=nlOptDrop(o);
 const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.88),tr=dCol(DPAL.trim),sh=dCol(DPAL.shingle),iron=vC(0x2e2a26);
 vnReg("Gene-houses' vats",0,0,13.5,8.2,{type:['civic','industry']});
 vB('dBlockB',0,-dr,0,W+1.2,dr+.55,D+1.2,0,stD);
 dnReliefBand(0,-.05,D/2+.62,0,W-2,.55,st);vnStairs(0,0,D/2+1.25,0,3.6,.58,3,'vStone',st);
 /* main stone breeding hall (-z half) with Tiwanaku cornice, God windows, Ancient panel roof monitor */
 const hz=-2.4,HD=9.2;
 vB('vStone',0,.55,hz,W-2,H,HD,0,st);dnMuralBand(0,.55+H-1.35,hz+HD/2+.02,0,W-5,1.05,2);
 const c1=dnCornice(0,.55+H,hz,W-2,HD,0,st,2,tr);
 vnHipRoof('vHipS',0,c1,hz,W-2.4,HD-.4,2.2,0,sh,1.0);
 vnDoor(0,.55,hz+HD/2,0,1.6,2.7,'vStone',tr,vC(0x2a2a30),false);
 for(const x of[-6.8,-3.8,3.8,6.8])dnGodWin(x,.55+1.4,hz+HD/2,0,.95,1.35,'vStone',tr);
 for(const s of[-1,1])dnGodLamp(s*2.4,.55+3.4,hz+HD/2,0);
 /* front Ancient-panel vat gallery (+z half): six culture vats under panel canopy with overhead pipe manifold & teal glow */
 {const vz=4.6;for(const x of[-8.5,-3,3,8.5])vPst('vPipe',x,.55,vz+2.2,.14,3.6,iron);
  vnShedRoof(0,4.0,vz,18.4,5.2,.6,0,'vPanelB',null,.5,.14);
  vBeam([-8.2,3.2,vz],[8.2,3.2,vz],.18,null,'vPipeR');
  for(let k=0;k<6;k++){const vx=-7.5+k*3.0;if(Math.abs(vx)<1.2)continue;
   vPst('vTankW',vx,.55,vz,1.05,2.3,null);vBeam([vx,2.85,vz],[vx,3.2,vz],.1,iron,'vPipe');
   vBall('dGodBall',vx,2.95,vz,.2);vBall('dGlassBall',vx,2.95,vz,.2);}}
 for(const s of[-1,1])dnGodPost(s*(W/2-.6),.55,D/2-.4,3.6);
 dnPriest(-2.2,.55,5.8,0);dnPriest(2.6,.55,5.4,Math.PI);dnFolk(0,D/2+2.2,2,1.6);}
dDef({key:'nl_vats',name:"Gene-houses' vats",family:'civic',tags:{type:['civic'],wealth:'priest',lit:true},w:24,d:18,h:8.2,fw:22.8,fd:16.8,build:buildNlVats});

// ---------------------------------------------------------------- 15. GENE BEDS: stone-walled trial beds under shade cloth, cistern & genepriest
function buildNlGenebeds(G,o){reseed(44641+(o.v|0));const V=(o&&o.v)|0,W=28,D=20,dr=nlOptDrop(o);
 const st=dCol(DPAL.stone),wood=dCol(DPAL.woodGrey),soil=vC(0x544432),clothA=vC(0xdcd2ba),clothB=vC(0x3a8e82);
 vnReg('Gene beds (breeding station)',0,0,15,4.2,{type:['farm','civic']});
 vB('dEarth',0,-dr,0,W+.8,dr+.14,D+.8,0,dCol(DPAL.earthDark));
 dnEarthWall(0,.12,0,W,D,0,1.9,4.2,{item:'vStone',capItem:'vStone',c:st,capC:st.clone().multiplyScalar(.88),stoneGate:true,relief:true,t:.85});
 /* six stone-kerbed experimental cultivar beds in two ranks, timber arbours with stretched shade cloth overhead */
 const crops=[0x4c8438,0x3c7e68,0x6e8c3a,0x588e48,0x7a6892,0x48824c];
 for(let r=0;r<2;r++)for(let c=0;c<3;c++){const bx=-8.4+c*8.4,bz=-4.6+r*8.2,bw=6.6,bd=5.2;
  vB('vStone',bx,.12,bz,bw,.42,bd,0,st);vB('dEarth',bx,.2,bz,bw-.45,.38,bd-.45,0,soil);
  for(let row=0;row<3;row++)vB('dTurf',bx,.56,bz-1.5+row*1.5,bw-.8,.38,.72,0,vC(crops[(r*3+c+V)%crops.length]));
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',bx+sx*(bw/2-.2),.5,bz+sz*(bd/2-.2),.07,2.15,wood);
  vB('vWood',bx,2.6,bz,bw,.08,.08,0,wood);
  kput('vClothB',[bx,2.66,bz],vQ(0,.05,0),[bw+.2,.05,bd+.2],(r+c+V)%3===0?clothB:clothA);}
 /* stone irrigation tank and seed-jar bench at the back, God-posts flanking the gate */
 vPst('vTankW',0,.12,-D/2+2.2,1.15,2.2,null);vBeam([-8.4,.55,-D/2+2.2],[8.4,.55,-D/2+2.2],.09,vC(0x2e2a26),'vPipe');
 for(const s of[-1,1]){dnGodPost(s*3.0,.12,D/2+.9,3.4);dnJar(s*11.5,.12,D/2-2.2,.28);}
 dnPriest(-1.5,.14,.2,.4);dnFolk(3.5,1.2,3,4.5,.14);}
dDef({key:'nl_genebeds',name:'Gene beds',family:'farm',tags:{type:['farm','civic'],wealth:'priest',lit:true},w:30,d:22,h:4.2,fw:28.5,fd:20.5,nv:2,build:buildNlGenebeds});

// ---------------------------------------------------------------- 16. TITHE BARN & COUNTING HOUSE: 36m aisled earth-and-stone barn + 2-storey counting hall
function buildNlTithebarn(G,o){reseed(44651+(o.v|0));const W=42,D=22,dr=nlOptDrop(o);
 const earth=dCol(DPAL.earth),st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.88),tr=dCol(DPAL.trim),wood=dCol(DPAL.wood),grey=dCol(DPAL.woodGrey),sh=dCol(DPAL.shingle);
 vnReg('The tithe barn and counting house',0,0,23,11.8,{landmark:true,type:['civic','industry']});
 vB('dBlockB',0,-dr,0,W+1.2,dr+.65,D+1.2,0,stD);
 /* 1. the great aisled tithe barn (-x..+6, 30 m long): battered earth walls, stone buttress piers, lofty shingle gable */
 {const bx=-5.2,BW=29.5,BD=14.6,BH=5.6;
  kput('dEarthBat',[bx,.6,-1.0],null,[BW,BH,BD],earth);
  for(let k=-3;k<=3;k++){vB('vStone',bx+k*4.4,.6,-1.0-BD/2*.95,.95,BH+.4,1.1,0,st);
   if(Math.abs(k)%2===1)vB('vStone',bx+k*4.4,.6,-1.0+BD/2*.95,.95,BH+.2,.9,0,st);}
  vnGableRoof(bx,.6+BH,-1.0,BW*.96,BD*.96,4.2,0,'vGableS',sh,1.3,'vGableW',wood,.45);
  dnMuralBand(bx,.6+BH-.95,-1.0+BD/2*.96,0,BW-5,.8,3);
  /* raised stone loading quay along +z, three Ancient-plate double tally doors with hoist beams */
  const qz=-1.0+BD/2+2.1;vB('vStone',bx,0,qz,BW-1,.62,3.8,0,st);vnStairs(bx-BW/2+2.2,0,qz+2.4,0,3.2,.62,3,'vStone',st);
  for(const dx of[-8.8,0,8.8]){const x=bx+dx,dz=-1.0+BD/2*.94;
   vB('vDarkB',x,.62,dz,3.4,3.5,.14,0);for(const s of[-1,1])kput(s<0?'vPlateW':'vPlate',[x+s*.88,.62+1.75,dz+.12],vQ(0,0,0),[1.7,3.4,1],null);
   vB('vWood',x,.62+3.55,dz+.12,4.2,.32,.5,0,wood);vB('vWood',x,.6+BH+1.4,dz+1.1,.18,.18,2.6,0,wood);
   kput('vRope',[x,.6+BH-.1,dz+2.1],null,[.035,2.8,.035],vC(0xb8a888));}
  vnSacks(bx-5.2,.65,qz+.4,8);vnSacks(bx+4.4,.65,qz+.3,7);vnBarrel(bx-11.2,.65,qz+.2,.46,1.05,wood);vnCrate(bx+11.0,.65,qz+.4,1.0,.2,grey);}
 /* 2. the two-storey grey-stone Counting House (+x end): Tiwanaku cornice, God windows, mural frieze, tally porch */
 {const cx=14.2,CW=11.4,CD=15.6,H1=4.0,H2=3.4;
  vB('vStone',cx,.6,-.5,CW,H1,CD,0,st);dnReliefBand(cx,.85,-.5+CD/2+.05,0,CW-1.4,.75,st);
  vB('vStone',cx,.6+H1,-.5,CW+.5,.36,CD+.5,0,tr);
  vB('vStone',cx,.6+H1+.36,-.5,CW-.8,H2,CD-.8,0,st);dnMuralBand(cx,.6+H1+H2-1.2,-.5+CD/2-.38,0,CW-2.4,1.05,0);
  const top=dnCornice(cx,.6+H1+.36+H2,-.5,CW-.8,CD-.8,0,st,2,tr);
  vnHipRoof('vHipS',cx,top,-.5,CW-1.0,CD-1.0,2.2,0,sh,1.0);
  dnGate(cx,.6,-.5+CD/2+.25,0,2.0,3.1,st,tr);vnDoor(cx,.6,-.5+CD/2,0,1.8,2.9,'vStone',tr,vC(0x2a2a30),false);
  vnStairs(cx,0,-.5+CD/2+1.6,0,3.8,.62,3,'vStone',st);
  for(const dx of[-3.4,3.4]){dnGodWin(cx+dx,.6+1.4,-.5+CD/2,0,.95,1.3,'vStone',tr);dnGodWin(cx+dx,.6+H1+1.1,-.5+(CD-.8)/2,0,.9,1.2,'vStone',tr);}
  dnGodWin(cx,.6+H1+1.1,-.5+(CD-.8)/2,0,1.1,1.3,'vStone',tr);
  for(const s of[-1,1])dnGodLamp(cx+s*2.4,.6+3.3,-.5+CD/2,0);
  dnGiant(cx-3.2,.02,CD/2+2.0,.2,2,{shield:true});dnGiant(cx+3.2,.02,CD/2+2.0,-.2,2,{shield:true});
  dnPriest(cx,.62,CD/2-.8,0);}
 for(const s of[-1,1])dnBannerPole(s*18.5,.02,D/2-.4,0,7.0,dCol(s<0?DPAL.red:DPAL.gold));
 dnFolk(-4,D/2+.8,6,5.5,.02);}
dDef({key:'nl_tithebarn',name:'Tithe barn and counting house',family:'civic',tags:{type:['civic','industry'],wealth:'civic',lit:true},w:44,d:24,h:11.8,fw:42.5,fd:22.5,build:buildNlTithebarn});
