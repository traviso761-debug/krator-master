// ================================================================= DALAB — trade and industry
// The tavern (a great round hall), the market (a ring of stalls round a stele — small for an outlying settlement,
// the large one three times the size for the main settlement's plaza), granaries, the warehouse, the scrap smithy
// and a workshop. All peasant/middle work: wood, earth, scrap, thatch; no God's light.

// tavern: a wide timber-stave drum on a rammed-earth foot under a great thatch cone with a smoke cap; a ring porch
function buildDalabTavern(G,o){reseed(8401+(o.v|0));const R=7.2,H=3.6;const wood=dCol(DPAL.wood),th=dCol(DPAL.thatch);
 vnReg('Tavern',0,0,11,H+R*1.05+2);
 dnDrum('dEarthDrum',0,-.05,0,R+.3,1.1,dCol(DPAL.earth));
 dnRoundHouse(0,1.0,0,R,H-1.0,{wall:'dStaveDrum',wallC:wood,roof:'thatch',rise:R*1.05,roofC:th,door:0,doorW:1.7,doorH:2.3,win:[.8,-.8,Math.PI*.55,-Math.PI*.55,Math.PI],hearth:true,band:'mural',wood,foot:false,finial:false});
 // smoke cap: a small second cone on posts over a vent
 vPst('vPost',0,H+R*1.05-1.4,0,.12,2.2,wood);kput('dConeT',[0,H+R*1.05+.3,0],null,[1.8,1.4,1.8],th);
 // porch ring: posts and a thatch skirt on the front half
 {const n=9;for(let k=0;k<n;k++){const a=-Math.PI*.55+k/(n-1)*Math.PI*1.1;const p=dnOnRing(0,0,R+2.4,a);vPst('vPostB',p[0],0,p[1],.16,2.7,wood);}
  kput('vConeT',[0,2.65,0],null,[R+3.2,3.0,R+3.2],th.clone().multiplyScalar(.92));dnDrum('vWood',0,2.5,0,R+2.6,.2,wood);}
 // benches, tables, barrels, a hitching rail, a banner
 for(const a of[.35,-.35,.85,-.85]){const p=dnOnRing(0,0,R+1.4,a);vB('vWood',p[0],.45,p[1],1.8,.1,.4,a,wood);for(const s of[-1,1]){const q=loc(p[0],p[1],s*.7,0,a);vB('vWood',q[0],0,q[1],.15,.45,.35,a,wood);}}
 vnBarrel(-R-.4,0,-3.2,.45,1.0,wood);vnBarrel(-R-1.3,0,-2.6,.42,.95,wood);vnBarrel(R+.6,0,-2.8,.45,1.0,wood);
 dnBannerPole(R+3.2,0,3.0,0,6,dCol(DPAL.gold));vB('vWood',-R-2.2,0,2.6,.12,1.1,.12,0,wood);vB('vWood',-R-2.2,1.0,4.4,.1,.1,3.8,0,wood);vB('vWood',-R-2.2,0,6.2,.12,1.1,.12,0,wood);
 vnPaving(0,.02,R+5,6,3,0,dCol(DPAL.earthDark),8);dnFolk(0,R+4.2,4,2.2);dnFolk(-3,R+1,2,1);}
// small market: a ring of eight stalls round a stele and a banner pole, a paved circle
function buildDalabMarketSmall(G,o){reseed(8411+(o.v|0));const R=9;const st=dCol(DPAL.stoneWarm);
 vnReg('Market (small)',0,0,R+4,6);
 vnPaving(0,.02,0,R*2+4,R*2+4,0,st.clone().multiplyScalar(.9),40);
 dnStele(0,0,0,0,3.4,st);for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const p=dnOnRing(0,0,1.6,a);dnBannerPole(p[0],0,p[1],a,5.5,dCol([DPAL.red,DPAL.turq,DPAL.gold,DPAL.red][k]));}
 for(let k=0;k<8;k++){const a=k/8*TAU+.2;if(Math.abs(a-TAU)<.3||a<.35)continue;const p=dnOnRing(0,0,R,a);dnStall(p[0],p[1],a+Math.PI,{cloth:k%3===0,kind:k%4});}
 dnFolk(0,4,5,3.5);dnFolk(0,R+5,3,2);}
// large market: three rings of stalls round a raised stone platform with four banners and the market stele; 3x
function buildDalabMarketLarge(G,o){reseed(8421+(o.v|0));const st=dCol(DPAL.stoneWarm);
 vnReg('Market (large)',0,0,31,7);
 vnPaving(0,.02,0,60,60,0,st.clone().multiplyScalar(.9),120);
 vB('vStone',0,0,0,8,1.0,8,0,st);dnReliefBand(0,.15,4,0,7,.7,st);vnStairs(0,0,4.9,0,3,1.0,3,'vStone',st);
 dnStele(0,1.0,0,0,4.2,st);for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const p=dnOnRing(0,0,3.2,a);dnBannerPole(p[0],1.0,p[1],a,7,dCol([DPAL.red,DPAL.turq,DPAL.gold,DPAL.red][k]));}
 const RINGS=[[9,8],[16,14],[23,20]];
 RINGS.forEach((rg,i)=>{const [R,n]=rg;for(let k=0;k<n;k++){const a=k/n*TAU+i*.17;let d=Math.abs(a%TAU);if(d>Math.PI)d=TAU-d;if(d<.22*(3-i)/2+.12)continue;   // an aisle to the front
  if(i>0&&rng()<.18)continue;const p=dnOnRing(0,0,R,a);dnStall(p[0],p[1],a+Math.PI+(i===2?Math.PI:0),{cloth:rng()<.4,kind:dRi(0,3)});}});
 dnGate(0,0,27.5,0,4,4.2,st);dnFolk(0,10,8,6);dnFolk(0,20,6,5);dnFolk(-12,-8,4,4);dnFolk(12,8,4,4);}
// granaries: three raised baskets of different sizes on a beaten-earth pad, a threshing floor
function buildDalabGranaries(G,o){reseed(8431+(o.v|0));
 vnReg('Granaries',0,0,7.5,7.5);
 vB('dEarth',0,-.05,0,15,.25,12,0,dCol(DPAL.earthDark));
 dnGranary(-4.2,.2,-1.5,1.6,2.2,{door:.4});dnGranary(1.2,.2,-2.6,1.3,1.9,{door:-.3});dnGranary(4.6,.2,1.6,1.5,2.0,{door:.9});
 dnDrum('vStone',-2.2,.2,3.2,2.6,.2,dCol(DPAL.stoneWarm));vnSacks(-2.0,.4,3.2,5);   // threshing floor
 vnDryingRack(4.0,.2,4.6,0,3.0);dnFolk(-1,6,2,1.2);}
// warehouse: a long rammed-earth hall under a shingle gable, scrap-plate double doors, a loading platform, crates
function buildDalabWarehouse(G,o){reseed(8441+(o.v|0));const W=22,D=10,H=4.4;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle);
 vnReg('Warehouse',0,0,14,H+4.5);
 vB('vStone',0,-.05,0,W+.6,.5,D+.6,0,vC(0x9a8a78));
 kput('dEarthBat',[0,.4,0],null,[W,H,D],earth);
 for(let k=-2;k<=2;k++)dnDrum('dEarthDrumB',k*(W/5),.4,-D/2*.93,.8,H+.3,earth);        // buttress drums along the back
 vnGableRoof(0,.4+H,0,W*.9,D*.9,3.0,0,'vGableS',sh,1.2,'vGableW',wood,.3);
 // double doors of Ancient plate on the front, a loading platform, a hoist
 {const dz=D/2*.94;vB('vDarkB',0,.4,dz,3.6,3.4,.12,0);for(const s of[-1,1])kput(s<0?'vPlateW':'vPlate',[s*.95,.4+1.7,dz+.12],vQ(0,0,0),[1.8,3.3,1],null);
  vB('vWood',0,.4+3.4,dz+.1,4.4,.3,.5,0,wood);vB('vWood',0,-.05,dz+1.9,7,.95,3.4,0,wood);vnStairs(-4.4,0,dz+1.9,Math.PI/2,1.2,.9,3,'vWood',wood);
  vPst('vPost',3.2,.4+H-1,dz+1.2,.1,3.4,wood);vB('vWood',3.2,.4+H+2.2,dz+1.9,.14,.14,2.6,0,wood);kput('vRope',[3.2,.4+H+.6,dz+2.8],null,[.03,1.6,.03],vC(0xb8a888));vnCrate(3.2,.4+H-.2,dz+2.8,.8,0,wood);}
 for(const x of[-7,7])vnWin(x,.4+2.6,D/2*.95,0,1.2,.8,'shut','vWood',wood);
 vnDoor(-W/2*.93,.4,0,-Math.PI/2,1.0,2.0,'vWood',wood,vC(0x6a5a48));
 vnCrate(-8,.95,D/2+2.2,.9,.2,wood);vnCrate(-6.8,.95,D/2+2.6,.8,.5,wood);vnSacks(-5,.95,D/2+2.2,4);vnBarrel(6.5,0,D/2+4.6,.45,1.0,wood);vnBarrel(7.4,0,D/2+4.0,.42,.95,wood);
 dnFolk(0,D/2+6,3,1.6);}
// scrap smithy: an open-sided shed of timber posts under a corrugate roof against a rammed-earth back wall;
// a kiln drum with a fire, an anvil block, a scrap heap, a chimney — fire is allowed anywhere
function buildDalabSmithy(G,o){reseed(8451+(o.v|0));const W=12,D=8,H=3.4;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg('Scrap smithy',0,0,9,H+3);
 vnPaving(0,.02,0,W+4,D+4,0,vC(0x8a7a6a),16);
 vB('dEarth',0,0,-D/2+.5,W,H,1.0,0,earth);for(const s of[-1,1])vB('dEarth',s*(W/2-.5),0,-1.0,1.0,H-.4,D-3,0,earth);
 for(let i=0;i<=4;i++){vPst('vPostB',-W/2+W*i/4,0,D/2-.2,.16,H+.6,wood);}
 vnShedRoof(0,H+.2,-.4,W+.6,D+.6,1.4,0,'vCorr',null,.9,.14);
 for(let k=0;k<6;k++){const zz=rr(-D/2+1,D/2-1);kput('vRock',[rr(-W/2,W/2),H+.2+1.4*(1-(zz+D/2)/D)+.16,zz],qEuler(rng(),rng(),0),[.32,.24,.3],vC(0x6a625a));}
 // kiln: a rammed-earth drum with a fire mouth, chimney
 dnDrum('dEarthDrumB',-3.4,0,-1.6,1.5,2.4,dCol(DPAL.earthDark));vB('vDarkB',-3.4,.3,-.2,.8,.7,.2,0);dnHearth(-3.4,.3,-.15,0,.8,.7);vnChimney(-3.4,2.4,-1.6,3.2,.22,true);
 vB('vStone',1.0,0,-.6,1.0,.8,.7,0,vC(0x6a625a));vB('vIron',1.0,.8,-.6,1.1,.25,.4,0,vC(0x2e2a26));   // anvil
 vnWaterButt(3.6,0,-1.8,.45,.9);vB('vWood',3.6,0,1.4,2.4,.9,.9,0,wood);for(let k=0;k<5;k++)kput('vPipeR',[3.0+k*.3,.9,1.4],qEuler(0,0,Math.PI/2),[.04,2.0,.04],null);
 // scrap heap outside: plates, pipe, rust
 for(let k=0;k<14;k++)kput(dPick(['vPlate','vPlateW','vRustB','vPipeR']),[W/2+2.2+rr(-1.2,1.2),rr(.05,.5),rr(-2.2,2.2)],qEuler(rng()*.6,rng()*TAU,rng()*.4),[rr(.4,1.0),rr(.3,.8),rr(.04,.14)],null);
 dnBanner(-W/2+1.2,H+.4,D/2+.3,0,.9,2.0,dCol(DPAL.red));dnFolk(0,D/2+3,2,1.2);dnFolk(-1,1,1,.6);}
// workshop: rammed-earth block with a salvage lean-to, shingle roof, racks, a banner — potters and weavers
function buildDalabWorkshop(G,o){reseed(8461+(o.v|0));const W=9,D=7,H=3.0;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle);
 vnReg('Workshop',0,0,8,H+3.5);
 vB('vStone',0,-.05,0,W+.5,.35,D+.5,0,vC(0x9a8a78));kput('dEarthBat',[0,.3,0],null,[W,H,D],earth);
 dnDrum('dEarthDrumB',-W/2*.95,.3,-D/2*.95,.8,H+.3,earth);dnDrum('dEarthDrumB',W/2*.95,.3,-D/2*.95,.8,H+.3,earth);
 vnHipRoof('vHipS',0,.3+H,0,W*.9,D*.9,2.2,0,sh,1.0);
 vnDoor(-1.2,.3,D/2*.94,0,1.1,2.0,'vWood',wood,vC(0x6a5a48));vnWin(2.0,.3+1.2,D/2*.94,0,1.2,.8,'open','vWood',wood,true);dnHearth(2.0,.3+1.2,D/2*.94,0,1.2,.8);
 dnMuralBand(0,.3+H-.7,D/2*.94,0,W-2,.55);
 // salvage lean-to on the +x side: corrugate on poles, the drying racks under it
 for(const z of[-D/2+.4,D/2-.4])vPst('vPost',W/2+3.0,0,z,.08,2.4,wood);vnShedRoof(W/2+1.5,H-.2,0,3.4,D-.6,.9,Math.PI/2,'vCorr',null,.5,.12);
 vnDryingRack(W/2+1.8,0,-1.2,Math.PI/2,3.0);for(let k=0;k<5;k++)vPst('vClayPot',W/2+.9+k*.5,0,D/2-.9,.18,.4,dCol([0x9a5a38,0xa86a44]));
 vnPlanter(-W/2-1.0,0,D/2-1,.7,2.4,0,wood);dnBanner(W/2-1.0,.3+H+.4,D/2*.94+.2,0,.8,1.8,dCol(DPAL.turq));
 dnFolk(0,D/2+3,2,1.2);}

// shop row: three shops in one rammed-earth block with round ends, each with a counter window, an awning and a sign;
// the middle one two storeys, a mural over the counters
function buildDalabShops(G,o){reseed(8471+(o.v|0));const W=16,D=7,H=3.2;const wood=dCol(DPAL.wood),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle);
 vnReg('Shop row',0,0,11,H+5);
 vB('vStone',0,-.05,0,W+.6,.4,D+.6,0,vC(0x9a8a78));
 kput('dEarthBat',[0,.3,0],null,[W-3,H,D],earth);dnDrum('dEarthDrumB',-W/2+1.6,.3,0,D/2,H,earth);dnDrum('dEarthDrumB',W/2-1.6,.3,0,D/2,H,earth);
 vnHipRoof('vHipS',0,.3+H,0,W-4,D*.9,2.0,0,sh,1.0);kput('dConeSh',[-W/2+1.6,.3+H-.3,0],null,[D/2*1.2,2.4,D/2*1.2],sh);kput('dConeSh',[W/2-1.6,.3+H-.3,0],null,[D/2*1.2,2.4,D/2*1.2],sh);
 // the tall middle shop
 vB('dEarth',0,.3+H,0,5,2.6,D-1.2,0,earth.clone().multiplyScalar(1.05));vnHipRoof('vHipS',0,.3+H+2.6,0,5,D-1.2,1.6,0,sh,.8);dnMuralBand(0,.3+H+.5,D/2-.6,0,4.2,1.6);
 // three counters with awnings, signs, goods
 [-5,0,5].forEach((x,i)=>{const dz=D/2*(i===1?.94:.9)+(i===1?0:.02);vnWin(x,.3+1.0,dz,0,2.0,1.1,'open','vWood',wood);vB('vWood',x,.3+.9,dz+.3,2.3,.1,.7,0,wood);
  vnAwning(x,.3+2.5,dz,0,2.6,1.4,dCol([0xa8382a,0x2f9a8a,0xd8a838]));vnDoor(x+1.9,.3,dz,0,.9,1.9,'vWood',wood,vC(0x6a5a48));
  for(let k=0;k<4;k++)vBall('vGourd',x-.8+k*.5,.3+1.1,dz+.3,.14,dCol([0xb08a4a,0x8a9a3a,0xc09a5a,0x9a5a38]),.18);
  dnBanner(x-1.5,.3+H-.1,dz+.35,0,.5,1.2,dCol([DPAL.red,DPAL.turq,DPAL.gold][i]));});
 vnPaving(0,.02,D/2+2,W,2.5,0,dCol(DPAL.earthDark),12);dnFolk(0,D/2+3.5,4,3);}
// potter's workshop: a round earth workshop with a big beehive kiln, drying racks of pots, a clay pit
function buildDalabPotter(G,o){reseed(8476+(o.v|0));const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg("Potter's workshop",0,0,9,7);
 dnRoundHouse(-2.5,0,-1,3.6,2.8,{roof:'thatch',rise:3.4,door:.6,win:[Math.PI*.6,-Math.PI*.6],band:'paint',wood});
 // the kiln: a rammed-earth beehive with a fire mouth, a stone flue
 kput('dEarthDome',[4.5,0,-2.5],null,[2.4,2.6,2.4],dCol(DPAL.earthDark));vB('vDarkB',4.5,.2,-.2,.9,.8,.2,0);dnHearth(4.5,.2,-.15,0,.9,.8);vPst('vPostS',4.5,2.3,-2.5,.3,1.4,dCol(DPAL.stone));
 // pot racks under a thatch lean-to
 for(const z of[1.5,4.5])vPst('vPost',3.8,0,z,.08,2.4,wood);for(const z of[1.5,4.5])vPst('vPost',7.2,0,z,.08,2.0,wood);vnShedRoof(5.5,2.2,3,3.6,3.2,.4,Math.PI/2,'vThatchB',dCol(DPAL.thatch),.4,.26);
 for(let sh=0;sh<2;sh++){vB('vWood',5.5,.6+sh*.7,3,3.2,.06,2.8,0,wood);for(let k=0;k<12;k++)vPst('vClayPot',4.2+(k%6)*.55,.66+sh*.7,2.0+Math.floor(k/6)*1.6,rr(.14,.22),rr(.3,.55),dCol([0x9a5a38,0xa86a44,0x7a4a2a,0xb87a54]));}
 dnDrum('dEarthDrum',-5,-.3,4.5,1.6,.35,dCol(DPAL.earthDark));dnDrum('vDarkB',-5,.05,4.5,1.3,.05,null);   // clay pit
 vB('vWood',0,0,4.2,1.2,.7,1.2,0,wood);vPst('vClayPot',0,.7,4.2,.2,.4,dCol([0x9a5a38]));   // the wheel
 dnFolk(1,7,2,1.2);}
// weaver's workshop: a post hall open on one side, looms under it, dyed cloth drying on long lines
function buildDalabWeaver(G,o){reseed(8481+(o.v|0));const W=10,D=7,H=3.0;const wood=dCol(DPAL.wood),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle);
 vnReg("Weaver's workshop",0,0,10,H+4);
 vB('vStone',0,-.05,0,W+.6,.35,D+.6,0,vC(0x9a8a78));vB('dEarth',0,.3,-D/2+.5,W,H,1.0,0,earth);vB('dEarth',-W/2+.5,.3,0,1.0,H,D,0,earth);
 for(let i=0;i<=3;i++)vPst('vPostB',-W/2+W*i/3,0,D/2-.2,.15,H+.5,wood);for(let i=1;i<3;i++)vPst('vPostB',W/2-.2,0,-D/2+D*i/3,.15,H+.5,wood);
 vnHipRoof('vHipS',0,.3+H,0,W,D,2.4,0,sh,1.1);dnMuralBand(0,.3+H-.9,-D/2+1.0,0,W-2,.7);
 // looms: frames with warp threads
 for(const x of[-2.8,0.6]){vB('vWood',x,.3,-1,2.2,.15,.9,0,wood);for(const s of[-1,1])vPst('vPost',x+s*1.0,.3,-1,.06,2.2,wood);vB('vWood',x,2.3,-1,2.2,.1,.1,0,wood);
  for(let k=0;k<12;k++)kput('vRope',[x-.9+k*.16,.5,-1],null,[.012,1.8,.012],vC(0xd8c8a8));kput('vClothB',[x,1.0,-1],null,[2.0,.9,.05],dCol([0xa8382a,0x2f9a8a,0xd8a838]));}
 // drying lines out front
 for(const z of[D/2+2.5,D/2+4.5]){for(const x of[-5,5])vPst('vPost',x,0,z,.07,2.4,wood);vBeam([-5,2.3,z],[5,2.3,z],.03,vC(0xb8a888),'vRope');
  for(let k=0;k<7;k++)kput('vCloth',[-4.2+k*1.4,1.7,z],vQ(0,0,0),[1.1,1.2,1],dCol([0xa8382a,0x2f9a8a,0xd8a838,0xe8dcc0,0x3b3b4a]));}
 vnBarrel(W/2+1,0,-1,.42,.9,wood);vnSacks(W/2+1.2,0,1.2,3);dnFolk(0,D/2+7,2,1.5);}
// dyer's yard: vats of colour under a corrugate shed, a rammed-earth store, stained ground, cloth on frames
function buildDalabDyer(G,o){reseed(8486+(o.v|0));const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg("Dyer's yard",0,0,9,6);
 kput('dEarthBat',[-4,0,-2],null,[6,3.0,5],earth);vnHipRoof('vHipT',-4,3.0,-2,6,5,1.6,0,dCol(DPAL.thatch),.9);vnDoor(-4,0,.35,0,1.0,1.9,'vWood',wood,vC(0x6a5a48));
 for(const p of[[1,-4],[7,-4],[1,2],[7,2]])vPst('vPost',p[0],0,p[1],.09,2.6,wood);vnShedRoof(4,2.4,-1,6.6,6.6,.8,0,'vCorr',null,.6,.12);
 const DYES=[0xa8382a,0x2f9a8a,0xd8a838,0x3b3b4a,0x7a3d8a,0x2a5aa8];
 for(let k=0;k<6;k++){const x=1.6+(k%3)*2.2,z=-3+Math.floor(k/3)*3;vPst('vClayPot',x,0,z,.7,.9,dCol([0x9a5a38,0x7a4a2a]));dnDrum('vDarkB',x,.88,z,.6,.05,vC(DYES[k]));
  vB('vFlag',x,.01,z+1.0,1.6,.03,1.2,0,vC(DYES[k],.5));}   // the stain round each vat
 for(let k=0;k<4;k++){const x=-6.5+k*.01,z=2.5+k*1.2;vB('vWood',-6,0,z,.08,2.0,.08,0,wood);}vB('vWood',-6,2.0,4.3,.08,.08,3.8,0,wood);
 for(let k=0;k<3;k++)kput('vCloth',[-6,1.3,2.8+k*1.2],vQ(Math.PI/2,0,0),[1.0,1.3,1],vC(DYES[k+1]));
 vnWaterButt(8.6,0,-1,.5,1.0);dnFolk(3,5,2,1.4);}
// windmill: a tapered rammed-earth tower on a stone foot, a thatch cap with a tail pole, four sails of timber and cloth
// on an axle out of the cap; a millstone shed and sacks beside
function buildDalabWindmill(G,o){reseed(8491+(o.v|0));const R=3.0,H=9;const wood=dCol(DPAL.wood),earth=dCol(DPAL.earth),th=dCol(DPAL.thatch);
 vnReg('Windmill',0,0,8,H+8);
 dnDrum('vStone',0,-.05,0,R+.5,1.0,vC(0x9a8a78));kput('dEarthDrumB',[0,.9,0],null,[R,H,R],earth);dnDrum('dEarthDrum',0,.9+H-.6,0,R*.93+.06,.22,dCol(DPAL.turq));
 vnDoor(0,.9,R,0,1.0,2.0,'vWood',wood,vC(0x6a5a48));vnWin(0,.9+4,R*.96,0,.8,.8,'shut','vWood',wood);vnWin(0,.9+6.8,R*.94,0,.7,.7,'open','vWood',wood);
 // the cap: a thatch cone with a tail pole down the back
 kput('dConeT',[0,.9+H-.4,0],null,[R*.93*1.25,3.4,R*.93*1.25],th);kput('vRock',[0,.9+H+2.6,0],null,[.5,.5,.5],wood);
 vBeam([0,.9+H+.4,-R*.6],[0,1.2,-R-5],.14,wood);vPst('vPostB',0,0,-R-5,.12,1.4,wood);
 // axle, hub and four sails, tilted back 12 degrees. The sails are two merged meshes in their own group (DWIND) so the
 // frame loop can turn them: two draw calls per windmill, the price of a moving part in an instanced kit.
 {const hy=.9+H+.5,tilt=-.2;const q=vQ(0,tilt,0);const ax=new THREE.Vector3(0,0,1).applyQuaternion(q);
  const hub=[ax.x*(R+.8),hy+ax.y*(R+.8),ax.z*(R+.8)];kput('vPost',[0,hy,0],vQ(0,tilt+Math.PI/2,0),[.16,R+1.6,.16],wood);vBall('vBall',hub[0],hub[1],hub[2],.32,vC(0x2e2a26));
  const SG=new THREE.Group();SG.position.set(hub[0],hub[1],hub[2]);SG.quaternion.copy(q);G.add(SG);
  const stocks=[],cloths=[];const L=7.5;
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;stocks.push(new THREE.BoxGeometry(.16,L,.16).translate(0,L/2,0).rotateZ(a));stocks.push(new THREE.BoxGeometry(1.5,5.2,.06).translate(.7,4.6,0).rotateZ(a));
   cloths.push(new THREE.BoxGeometry(1.3,4.8,.03).translate(.7,4.6,.05).rotateZ(a));}
  meshMerged(stocks,new THREE.MeshStandardMaterial({map:TEX.wood,color:wood,roughness:.92,side:DS}),SG,0,0,0);
  meshMerged(cloths,new THREE.MeshStandardMaterial({map:TEX.stripes,color:dCol([0xe8dcc0,0xd8a838,0xa8382a]),roughness:.9,side:DS}),SG,0,0,0);
  DWIND.push({grp:SG,rate:.45+rng()*.3});}
 // millstone shed, sacks, a cart of grain
 vB('vStone',R+3.5,-.05,1.5,5,.35,4,0,vC(0x9a8a78));for(const p of[[R+1.5,-.2],[R+5.5,-.2],[R+1.5,3.2],[R+5.5,3.2]])vPst('vPost',p[0],0,p[1],.09,2.6,wood);vnShedRoof(R+3.5,2.4,1.5,5.2,4.2,.7,0,'vThatchB',th,.5,.26);
 dnDrum('vStone',R+3.5,.3,1.5,1.0,.35,dCol(DPAL.stone));dnDrum('vStone',R+3.5,.65,1.5,1.0,.3,dCol(DPAL.stone));vnSacks(R+4.8,.3,.4,5);vnSacks(R+2.2,.3,2.6,3);
 dnFolk(2,R+4,2,1.2);}

dDef({key:'dalab_tavern',name:'Tavern',family:'trade',tags:{type:['tavern/inn'],wealth:'middle',lit:false},w:26,d:26,h:14,build:buildDalabTavern});
dDef({key:'dalab_market_small',name:'Market (small)',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:28,d:28,h:6,build:buildDalabMarketSmall});
dDef({key:'dalab_market_large',name:'Market (large)',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:64,d:64,h:8,build:buildDalabMarketLarge});
dDef({key:'dalab_granaries',name:'Granaries',family:'infrastructure',tags:{type:['farm','infrastructure'],wealth:'peasant',lit:false},w:17,d:14,h:8,build:buildDalabGranaries});
dDef({key:'dalab_warehouse',name:'Warehouse',family:'industry',tags:{type:['industry'],wealth:'middle',lit:false},w:28,d:20,h:9,build:buildDalabWarehouse});
dDef({key:'dalab_smithy',name:'Scrap smithy',family:'industry',tags:{type:['industry'],wealth:'peasant',lit:false},w:20,d:14,h:7,build:buildDalabSmithy});
dDef({key:'dalab_workshop',name:'Workshop',family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:17,d:12,h:7,build:buildDalabWorkshop});
dDef({key:'dalab_shops',name:'Shop row',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:20,d:14,h:10,build:buildDalabShops});
dDef({key:'dalab_potter',name:"Potter's workshop",family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:18,d:14,h:7,build:buildDalabPotter});
dDef({key:'dalab_weaver',name:"Weaver's workshop",family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:16,d:18,h:7,build:buildDalabWeaver});
dDef({key:'dalab_dyer',name:"Dyer's yard",family:'industry',tags:{type:['industry'],wealth:'peasant',lit:false},w:18,d:12,h:6,build:buildDalabDyer});
dDef({key:'dalab_windmill',name:'Windmill',family:'infrastructure',tags:{type:['farm','infrastructure','industry'],wealth:'middle',lit:false},w:18,d:18,h:18,build:buildDalabWindmill});
