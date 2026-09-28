// ================================================================= DALAB — dwellings
// Peasants build ROUND: a rammed-earth or scrap drum under a thatch cone, a painted band, one door, a hearth
// window that glows at night. Nobles (the priest-caste's kin) build in grey megalithic stone with relief bands,
// Tiwanaku cornices, murals and banners, on rammed-earth platforms or inside earth-walled compounds, and they
// have The God's light. Front is +z.
const DTAG_SF={type:['single-family dwelling']},DTAG_MF={type:['multi-family dwelling']};

// ---------------------------------------------------------------- PEASANT
// A — round earth hut: rammed-earth drum, red foot and turquoise line, steep thatch cone, hearth window
function buildDalabHutA(G,o){reseed(8101+(o.v|0));const R=3.2,H=2.5;const wood=dCol(DPAL.woodGrey);
 vnReg('Round earth hut (peasant)',0,0,4.8,H+R*1.1+1.4);
 dnRoundHouse(0,0,0,R,H,{roof:'thatch',rise:R*1.15,door:0,win:[.95,-Math.PI*.75],band:'paint',hearth:true,wood});
 vnPaving(0,.02,R+1.6,3,2.4,0,dCol(DPAL.earthDark),4);
 dnJar(R+.9,0,1.2,.32);dnJar(R+1.5,0,.6,.26);dnWoodpile(-R-1.0,0,-.4,Math.PI/2,1.4);vnDryingRack(-1.2,0,R+2.6,0,3.0);
 for(let k=0;k<3;k++)vBall('vGourd',-R*.5+k*.9,H-.35,R+.55,.16,dCol([0xb08a4a,0x8a9a3a,0xc09a5a]),.22);
 dnFolk(2.2,R+3.2,2,1.0);}
// B — scrap hut: a corrugate drum patched with Ancient plate, a corrugate cone weighted with stones, tarp lean-to
function buildDalabHutB(G,o){reseed(8111+(o.v|0));const R=3.0,H=2.4;const wood=dCol(DPAL.woodGrey);
 vnReg('Scrap hut (peasant)',0,0,5.2,H+R*.9+1);
 vB('vStone',0,-.05,0,R*2.4,.3,R*2.4,0,vC(0x9a8a78));
 dnRoundHouse(0,.25,0,R,H,{wall:'vTank',wallC:null,roof:'scrap',rise:R*.85,door:0,win:[Math.PI*.6],winKind:'shut',hearth:true,wood,foot:false,finial:false});
 // patches of plate over the corrugate, proud and a few degrees off
 for(let k=0;k<7;k++){const a=rr(.5,TAU-.5);const p=dnOnRing(0,0,R+.06+k*.01,a);kput(dPick(['vPlate','vPlateW','vPlate','vBoard']),[p[0],.25+rr(.6,H-.5),p[1]],vQ(a,0,rr(-.1,.1)),[rr(1.0,1.8),rr(.8,1.4),1],null);}
 // timber hoops holding the sheet
 for(const yy of[.7,H-.4])kput('dRopeRing',[0,.25+yy,0],qEuler(Math.PI/2,0,0),[R+.08,R+.08,1],vC(0x6a5a48));
 vnChimney(-R*.5,.25+H+R*.5,-R*.3,1.4,.12,true);
 // lean-to on the +x side
 for(const z of[-1.6,1.6])vPst('vPost',R+2.4,0,z,.07,2.0,wood);kput('vTarpB',[R+1.2,.25+H-.3,0],vQ(0,0,.3),[2.6,.05,3.6],vC(0xb0a080));
 vnBarrel(R+1.6,0,-1.0,.4,.95,wood);vnCrate(R+1.9,0,.7,.8,.2,wood);vnSacks(R+1.0,0,1.5,3);
 dnFolk(-2.6,R+3,2,1.0);}
// C — post house: an oval-ish timber post hall, board walls, shingle hip roof, veranda, a painted gable banner
function buildDalabHutC(G,o){reseed(8121+(o.v|0));const W=7.2,D=5.6,H=2.6,FL=.35;const wood=dCol(DPAL.woodGrey),sh=dCol(DPAL.shingle);
 vnReg('Post house (peasant)',0,0,6.2,FL+H+3.4);
 vB('dEarth',0,-.05,0,W+.8,FL+.05,D+.8,0,dCol(DPAL.earthDark));
 vnFrame(0,FL,0,W,H,D,0,wood,.14);vB('vWood',0,FL,0,W-.1,H,D-.1,0,wood.clone().multiplyScalar(.92));
 dnDrum('dEarthDrum',-W/2,FL,-D/2,1.0,H,dCol(DPAL.earth));dnDrum('dEarthDrum',W/2,FL,-D/2,1.0,H,dCol(DPAL.earth));   // round earth corners at the back
 vnHipRoof('vHipS',0,FL+H,0,W,D,2.6,0,sh,1.1);
 vnVeranda(0,0,D/2+1.0,W-1.2,2.0,0,FL,2.4,wood);vnShedRoof(0,FL+2.4,D/2+1.0,W-1.2,2.0,.5,0,'vShingleB',sh,.4,.24);
 vnDoor(-.8,FL,D/2-.05,0,.95,1.9,'vWood',wood,vC(0x6a5a48),false);
 vnWin(2.0,FL+1.2,D/2-.05,0,.9,.7,'open','vWood',wood,true);dnHearth(2.0,FL+1.2,D/2-.05,0,.9,.7);
 vnWin(-W/2+.05,FL+1.2,.2,-Math.PI/2,.8,.7,'shut','vWood',wood);
 dnMuralBand(0,FL+H-.45,-D/2+.05,Math.PI,W-1.6,.4);dnBanner(-W/2-.9,FL+H+.6,D/2-.6,Math.PI/2,.8,2.2,dCol(DPAL.turq));
 dnJar(W/2+1.0,0,.8,.3);dnWoodpile(W/2+1.1,0,-1.4,0,1.2);vnPlanter(-W/2+1.4,0,D/2+2.6,1.6,.7,0,wood);
 dnFolk(1.5,D/2+4,2,1.2);}
// D — family compound: a low earth wall round two huts and a granary, a shared hearth in the yard
function buildDalabCompound(G,o){reseed(8131+(o.v|0));const CW=17,CD=15;const wood=dCol(DPAL.woodGrey);
 vnReg('Family compound (peasant)',0,0,11.5,7);vnReg('Compound wall',0,0,11.8,1.8,Object.assign({part:'wall'},DTAG_MF));
 dnEarthWall(0,0,0,CW,CD,0,1.5,2.4,{t:.7,lintel:false});
 dnRoundHouse(-4.2,0,-2.6,2.8,2.3,{roof:'thatch',rise:3.0,door:.5,win:[1.5],band:'paint',hearth:true,wood});
 dnRoundHouse(4.0,0,-3.2,2.4,2.2,{roof:'thatch',rise:2.6,door:-.6,win:[Math.PI*1.3],band:'paint',wood});
 dnGranary(3.8,0,3.6,1.3,1.8,{door:Math.PI*.9});
 dnFirePit(-1.6,0,3.0,.7);for(let k=0;k<3;k++)vB('vWood',-3.4+k*1.6,.35,4.8,1.3,.1,.35,0,wood);   // benches
 dnJar(-6.2,0,3.8,.3);dnJar(-5.6,0,4.6,.26);dnWoodpile(6.6,0,-.5,Math.PI/2,1.3);vnDryingRack(-5.0,0,6.0,0,2.6);
 vnPaving(0,.02,CD/2+1.8,3.2,3,0,dCol(DPAL.earthDark),5);dnFolk(0,1.2,3,1.6);dnFolk(1.5,CD/2+3.4,2,1.2);}

// ---------------------------------------------------------------- NOBLE
// A — stone hall: two storeys of grey ashlar on a rammed-earth platform; relief plinth band, Tiwanaku cornices,
//     a trilithon door, a mural frieze, a round shingle-coned tower at one corner, banners; The God's light
function buildDalabNobleA(G,o){reseed(8201+(o.v|0));const W=14,D=11,H1=4.2,H2=3.4,Y0=1.0;const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.85),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle);
 vnReg('Stone hall (noble)',0,0,12.5,Y0+H1+H2+5);
 dnPlatform(0,0,0,W+8,D+7,Y0,0);vnStairs(0,0,D/2+3.5+1.0,0,4.0,Y0,4,'vStone',st);
 vB('vStone',0,Y0,0,W,H1,D,0,st);dnReliefBand(0,Y0+.3,D/2,0,W-1.0,1.1,st);for(const s of[-1,1])dnReliefBand(s*W/2,Y0+.3,0,s*Math.PI/2,D-1,1.1,st);
 const c1=dnCornice(0,Y0+H1,0,W,D,0,st,2);
 vB('vStone',0,c1,0,W-1.2,H2,D-1.2,0,st.clone().multiplyScalar(1.04));dnMuralBand(0,c1+.9,D/2-.6,0,W-3.2,2.0);
 const c2=dnCornice(0,c1+H2,0,W-1.2,D-1.2,0,st,3);vB('vStone',0,c2,0,W-1.0,.5,D-1.0,0,stD);   // parapet
 vnPyrRoof('vPyrSh',0,c2+.5,0,W-2.4,D-2.4,2.2,0,sh,.2);
 dnGate(0,Y0,D/2+.1,0,1.9,3.0,st);vnDoor(0,Y0,D/2,0,1.7,2.9,'vStone',st,vC(0x4a2e1c),false);
 for(const x of[-4.6,-2.8,2.8,4.6])dnGodWin(x,Y0+1.8,D/2,0,1.0,1.4,'vStone',st);for(const s of[-1,1])for(const z of[-3,0,3])dnGodWin(s*W/2,Y0+1.8,z,s*Math.PI/2,1.0,1.4,'vStone',st);
 for(const x of[-4,0,4])dnGodWin(x,c1+.9,-(D-1.2)/2,Math.PI,1.0,1.2,'vStone',st);for(const s of[-1,1])for(const z of[-2.4,2.4])dnGodWin(s*(W-1.2)/2,c1+.9,z,s*Math.PI/2,.9,1.2,'vStone',st);
 for(const x of[-2.2,2.2])dnGodLamp(x,Y0+3.5,D/2,0);
 // the tower
 {const tx=-W/2+1.6,tz=-D/2+1.6,TH=Y0+H1+H2+2.2;dnDrum('dStoneDrum',tx,Y0,tz,2.6,TH-Y0,st);dnDrum('dReliefDrum',tx,TH-2.2,tz,2.66,.9,st);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;const p=dnOnRing(tx,tz,2.6,a);dnGodWin(p[0],TH-4.4,p[1],a,.7,1.2,'vStone',st);}
  kput('dConeSh',[tx,TH-.3,tz],null,[3.3,3.6,3.3],sh);vBall('dGiltBall',tx,TH+3.4,tz,.25);}
 for(const s of[-1,1])dnBannerPole(s*(W/2+2.2),Y0,D/2+2.6,0,7,dCol(s<0?DPAL.red:DPAL.turq));
 dnStele(-5.5,Y0,D/2+5.0,0,2.8,st);dnStele(5.5,Y0,D/2+5.0,0,2.8,st);
 vnPlanter(-3.2,Y0,D/2+4.2,2.2,.8,0,wood);vnPlanter(3.2,Y0,D/2+4.2,2.2,.8,0,wood);
 dnFolk(0,D/2+9,3,1.6);}
// B — great roundhouse: a stone drum on a turfed earth platform, ring veranda, shingle cone with a gilt finial,
//     mural frieze, The God's light at the door and in the windows; a round kitchen hut beside it
function buildDalabNobleB(G,o){reseed(8211+(o.v|0));const R=8,H=5,Y0=.9;const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle);
 vnReg('Great roundhouse (noble)',0,0,14,Y0+H+9);
 kput('dTurfDrum',[0,-.05,0],null,[R+7,Y0,R+7],dCol(DPAL.turf));dnDrum('dEarthDrum',0,Y0-.35,0,R+3.2,.35,dCol(DPAL.earthDark));
 vnStairs(0,0,R+7+.9,0,3.6,Y0,4,'vStone',st);
 dnRoundHouse(0,Y0,0,R,H,{wall:'dStoneDrum',wallC:st,roof:'shingle',rise:7,roofC:sh,door:0,doorW:1.6,doorH:2.7,frame:'vStone',win:[.7,-.7,Math.PI/2,-Math.PI/2,Math.PI*.75,-Math.PI*.75],lit:true,band:'mural',wood,leafC:vC(0x4a2e1c)});
 dnDrum('dReliefDrum',0,Y0+.3,0,R+.08,1.0,st);
 // ring veranda: stone posts carrying a shingle skirt
 {const n=18;for(let k=0;k<n;k++){const a=k/n*TAU;const p=dnOnRing(0,0,R+2.2,a);vPst('vPostS',p[0],Y0,p[1],.22,3.0,st);}
  kput('dConeSh',[0,Y0+3.0-2.0,0],null,[R+2.9,4.5,R+2.9],sh.clone().multiplyScalar(.9));dnDrum('dStoneDrum',0,Y0+2.9,0,R+2.4,.25,st);}
 for(const a of[.35,-.35]){const p=dnOnRing(0,0,R,a);dnGodLamp(p[0],Y0+3.4,p[1],a);}
 for(const a of[Math.PI*.5,-Math.PI*.5]){const p=dnOnRing(0,0,R+4.4,a);dnBannerPole(p[0],Y0,p[1],a,6.5,dCol(a>0?DPAL.gold:DPAL.red));}
 dnRoundHouse(R+5.6,0,-3.5,2.4,2.3,{roof:'thatch',rise:2.6,door:-.9,band:'paint',wood:dCol(DPAL.woodGrey)});   // the kitchen
 dnFirePit(R+5.2,0,1.8,.6);dnJar(R+3.2,0,3.2,.3);
 dnStele(-2.8,0,R+9.5,0,3.0,st);dnStele(2.8,0,R+9.5,0,3.0,st);vnPaving(0,.02,R+9.4,3,3.6,0,st,6);
 dnFolk(0,R+12,3,1.6);}
// C — earth-walled manor: a rammed-earth compound with a relief gate; inside, a timber hall on a stone plinth
//     under a shingle gable, a stone drum tower, a shrine stele and a garden; The God's light on the hall
function buildDalabNobleC(G,o){reseed(8221+(o.v|0));const CW=26,CD=22;const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle),earth=dCol(DPAL.earth);
 vnReg('Earth-walled manor (noble)',0,0,17,12);vnReg('Manor wall',0,0,17.5,3.2,Object.assign({part:'wall'},DTAG_SF));
 dnEarthWall(0,0,0,CW,CD,0,3.0,3.2,{c:earth,relief:true,stoneGate:true});
 // the hall, back of the court
 {const W=13,D=8,H=3.8,Y0=.7,hz=-CD/2+D/2+2.2;vB('vStone',0,0,hz,W+1.2,Y0,D+1.2,0,st);dnReliefBand(0,.1,hz+D/2+.6,0,W-1,.5,st);
  vnFrame(0,Y0,hz,W,H,D,0,wood,.18);vB('vWood',0,Y0,hz,W-.12,H,D-.12,0,wood.clone().multiplyScalar(.9));
  dnMuralBand(0,Y0+H-1.5,hz+D/2-.02,0,W-2,1.3);
  vnGableRoof(0,Y0+H,hz,W,D,3.0,0,'vGableS',sh,1.1,'vGableW',wood,.3);
  vnDoor(0,Y0,hz+D/2,0,1.4,2.4,'vWood',wood,vC(0x4a2e1c));vnStairs(0,0,hz+D/2+1.2,0,2.6,Y0,3,'vStone',st);
  for(const x of[-4.2,-2.2,2.2,4.2])dnGodWin(x,Y0+1.3,hz+D/2,0,1.0,1.2,'vWood',wood);for(const s of[-1,1])dnGodWin(s*W/2,Y0+1.3,hz,s*Math.PI/2,1.0,1.2,'vWood',wood);
  for(const x of[-3.4,3.4])dnGodLamp(x,Y0+3.0,hz+D/2,0);}
 // the tower, +x side
 {const tx=CW/2-4.2,tz=1.5,TH=9;dnDrum('dStoneDrumB',tx,0,tz,2.8,TH,st);dnDrum('dReliefDrum',tx,TH-1.4,tz,2.7,.9,st);
  for(let k=0;k<3;k++){const a=k*TAU/3+.5;const p=dnOnRing(tx,tz,2.65,a);dnGodWin(p[0],TH-3.6,p[1],a,.7,1.1,'vStone',st);}
  kput('dConeSh',[tx,TH-.3,tz],null,[3.4,3.4,3.4],sh);vBall('dGiltBall',tx,TH+3.2,tz,.22);
  const dp=dnOnRing(tx,tz,2.8,Math.PI*.5+.9);vnDoor(dp[0],0,dp[1],Math.PI*.5+.9,1.0,2.0,'vStone',st,vC(0x4a2e1c),false);}
 // garden: planters, a shrine stele, a round well
 vnPlanter(-CW/2+3.5,0,2,4,1.2,0,wood);vnPlanter(-CW/2+3.5,0,5.5,4,1.2,0,wood);vnPlanter(-CW/2+3.5,0,-2,4,1.2,0,wood);
 dnStele(-4.5,0,CD/2-3,0,2.6,st);dnDrum('dStoneDrum',3.5,0,CD/2-4,1.1,.9,st);dnDrum('vDarkB',3.5,.9,CD/2-4,.85,.1,null);
 vnPaving(0,.02,CD/2-6,3,8,0,st,10);vnPaving(0,.02,CD/2+2,3.4,3,0,st,5);
 dnGodPost(-2.8,0,CD/2+1.2,3.4);dnGodPost(2.8,0,CD/2+1.2,3.4);
 dnFolk(0,CD/2+4.5,3,1.6);dnFolk(0,-2,2,2);}

dDef({key:'dalab_hut_a',name:'Round earth hut',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_SF),w:10,d:10,h:8,build:buildDalabHutA});
dDef({key:'dalab_hut_b',name:'Scrap hut',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_SF),w:12,d:10,h:6,build:buildDalabHutB});
dDef({key:'dalab_hut_c',name:'Post house',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_SF),w:12,d:12,h:7,build:buildDalabHutC});
dDef({key:'dalab_compound',name:'Family compound',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_MF),w:20,d:20,h:7,build:buildDalabCompound});
dDef({key:'dalab_noble_a',name:'Stone hall',family:'dwelling',tags:Object.assign({wealth:'noble',lit:true},DTAG_SF),w:28,d:26,h:17,build:buildDalabNobleA});
dDef({key:'dalab_noble_b',name:'Great roundhouse',family:'dwelling',tags:Object.assign({wealth:'noble',lit:true},DTAG_SF),w:34,d:34,h:15,build:buildDalabNobleB});
dDef({key:'dalab_noble_c',name:'Earth-walled manor',family:'dwelling',tags:Object.assign({wealth:'noble',lit:true},DTAG_SF),w:30,d:28,h:13,build:buildDalabNobleC});
