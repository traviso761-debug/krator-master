// ================================================================= DALAB — civic: the guard's barracks, the three embassies, the Halls of Reformation
// Civic buildings are the priests' and carry The God's light. Each embassy is a Dalab-built rammed-earth compound
// (relief gate, drum buttresses) round a hall in the visitor's own idiom: Iziz (sand plaster, orange awnings, deco
// strips, copper pyramid), Voth (grey ashlar, pantile, gilt dome, dark-red banners), the Order of Historians
// (laterite drum, tile cone and lantern, blue-and-white mosaic band, toron pegs, blue banners).

// barracks: a palisaded yard; a long rammed-earth hall with a giant-height door; a giant pair at the gate; racks
function buildDalabBarracks(G,o){reseed(8501+(o.v|0));const CW=30,CD=24;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle),st=dCol(DPAL.stone);
 vnReg("Guard's barracks",0,0,19,10);vnReg('Barracks palisade',0,0,19.5,3.4,{part:'wall',type:['military']});
 vnPalisade(0,0,0,CW,CD,0,3.2,4.4);vB('dEarth',0,-.1,0,CW+1,.4,CD+1,0,dCol(DPAL.earthDark));
 // the hall, back of the yard: earth walls, a shingle gable, a door tall enough for a giant, God-lit
 {const W=18,D=8,H=4.8,hz=-CD/2+D/2+1.6;vB('vStone',0,0,hz,W+.6,.5,D+.6,0,vC(0x9a8a78));kput('dEarthBat',[0,.4,hz],null,[W,H,D],earth);
  for(let k=-2;k<=2;k++)dnDrum('dEarthDrumB',k*(W/5),.4,hz-D/2*.93,.8,H+.3,earth);
  vnGableRoof(0,.4+H,hz,W*.92,D*.92,3.2,0,'vGableS',sh,1.1,'vGableW',wood,.3);
  vnDoor(0,.4,hz+D/2*.94,0,2.2,4.0,'vWood',wood,vC(0x5a4632));for(const x of[-6,-3.5,3.5,6])dnGodWin(x,.4+2.4,hz+D/2*.94,0,1.0,1.0,'vWood',wood);
  dnMuralBand(0,.4+H-.9,hz+D/2*.94,0,W-3,.7);for(const x of[-2.2,2.2])dnGodLamp(x,.4+4.4,hz+D/2*.94,0);}
 // the giants' quarters: a round earth hut of giant scale, +x
 dnRoundHouse(CW/2-6,0,3,4.2,4.0,{roof:'thatch',rise:4.4,door:-Math.PI/2,doorW:1.6,doorH:3.4,win:[Math.PI*.8],band:'paint',wood});
 // drill posts, weapon racks, a fire, benches
 for(let k=0;k<4;k++)vPst('vPostB',-10+k*2.6,0,4.5,.22,2.4,wood);
 vB('vWood',-5,0,-1,3,1.4,.3,0,wood);for(let k=0;k<6;k++)vPst('vPost',-6.2+k*.5,.2,-1,.04,3.2,vC(0x4a3a2a));
 dnFirePit(2,0,2,.8);for(let k=0;k<2;k++)vB('vWood',-1.5+k*7,.35,-3,2.4,.1,.4,0,wood);
 // giants at the gate (city watch: two arms), a few soldiers
 dnGiant(-3.2,0,CD/2+1.2,.3,2,{shield:true});dnGiant(3.2,0,CD/2+1.2,-.3,2,{shield:true});
 dnFolk(-6,0,3,2);dnFolk(6,-5,2,1.5);dnGodPost(-4.6,0,CD/2-1.4,4);dnGodPost(4.6,0,CD/2-1.4,4);}

// the Dalab-built compound every embassy stands in: rammed-earth wall, relief, stone gate pylons, God-lit gate
function dnEmbassyCompound(CW,CD,name){vnReg(name+' compound wall',0,0,Math.hypot(CW,CD)/2+.5,3.4,{part:'wall'});
 dnEarthWall(0,0,0,CW,CD,0,3.2,3.6,{relief:true,stoneGate:true});vnPaving(0,.02,CD/2-4,3.6,7,0,dCol(DPAL.stoneWarm),9);
 dnGodPost(-3.2,0,CD/2+1.4,3.6);dnGodPost(3.2,0,CD/2+1.4,3.6);dnFolk(0,CD/2+4,3,1.8);}
// Izizian embassy: a plaster hall with exposed hardwood posts, wooden stepped cornice, deco strips, a copper pyramid
function buildDalabEmbassyIziz(G,o){reseed(8511+(o.v|0));const CW=30,CD=26;const wood=vC(vPick(VPAL.woodRich)),pl=vC(vPick(VPAL.sand)),st=vC(vPick(VPAL.stone)),cu=vC(0xffffff);
 vnReg('Izizian embassy',0,0,12,15);dnEmbassyCompound(CW,CD,'Izizian embassy');
 const W=14,D=11,H1=3.6,H2=3.2,Y0=.5,hz=-2;
 vB('vStone',0,-.05,hz,W+.6,Y0+.05,D+.6,0,vC(vPick(VPAL.stoneDark)));
 vB('vPlaster',0,Y0,hz,W,H1,D,0,pl);vB('vWood',0,Y0+H1,hz,W+.34,.3,D+.34,0,wood);vB('vPlaster',0,Y0+H1+.3,hz,W-1.6,H2,D-1.6,0,pl.clone().multiplyScalar(1.04));
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,hz+sz*(D/2-.02),.18,H1+.32,wood);
 const top=vnCornice('vWood',0,Y0+H1+.3+H2,hz,W-1.6,D-1.6,0,wood,2);kput('vPyrCu',[0,top+.3,hz],null,[W-.4,3.2,D-.4],cu);vBall('vFinial',0,top+3.6,hz,.3);
 vnDoor(0,Y0,hz+D/2,0,1.5,2.5,'vWood',wood,vC(0x6a4a30));vnStairs(0,0,hz+D/2+1.1,0,3,Y0,3,'vStone',st);
 for(const x of[-4.4,-2.4,2.4,4.4])vnWin(x,Y0+1.2,hz+D/2,0,1.2,1.4,'lit','vWood',wood);for(const s of[-1,1])for(const z of[-3,0,3])vnWin(s*W/2,Y0+1.2,hz+z,s*Math.PI/2,1.1,1.3,'lit','vWood',wood);
 for(const x of[-4,-1.4,1.4,4])vnStrip(x,Y0+H1+.9,hz+(D-1.6)/2,0,.75,2.0,'vWood',wood);
 vnAwning(-3.4,Y0+2.7,hz+D/2,0,2.2,1.3,vC(vPick(VPAL.awning)));vnAwning(3.4,Y0+2.7,hz+D/2,0,2.2,1.3,vC(vPick(VPAL.awning)));
 vnBannerPole(-W/2-1.6,0,hz+D/2+2,0,6,vC(0xe07a2a));vnBannerPole(W/2+1.6,0,hz+D/2+2,0,6,vC(0xe07a2a));
 vnPlanter(-5,0,hz+D/2+3.2,2.4,.9,0,wood);vnPlanter(5,0,hz+D/2+3.2,2.4,.9,0,wood);vnLampPost(-2.6,0,hz+D/2+4.6,3.2);vnLampPost(2.6,0,hz+D/2+4.6,3.2);
 vnFolk(0,hz+D/2+6,2,1.2);}
// Vothic embassy: grey-brown ashlar, a domed hall with a gilt dome and finial, pantile roofs, a tapered corner
// tower, dark-red banners — a clan compound's manners inside a Dalab wall
function buildDalabEmbassyVoth(G,o){reseed(8521+(o.v|0));const CW=30,CD=26;const st=dCol(DPAL.vothStone),stL=st.clone().multiplyScalar(1.15),wood=vC(0x4a3a2a),gilt=vC(0xffffff);
 vnReg('Vothic embassy',0,0,12,17);dnEmbassyCompound(CW,CD,'Vothic embassy');
 const W=13,D=11,H1=4.0,H2=3.2,Y0=.6,hz=-2;
 vB('vStone',0,-.05,hz,W+1.2,Y0+.05,D+1.2,0,st.clone().multiplyScalar(.8));
 vB('vStone',0,Y0,hz,W,H1,D,0,st);for(const s of[-1,1])for(const x of[-W/2+1.5,0,W/2-1.5])vB('vStone',x,Y0,hz+s*(D/2+.15),.9,H1+.6,.35,0,stL);   // pilaster buttresses
 vB('vStone',0,Y0+H1,hz,W+.5,.35,D+.5,0,stL);vB('vPlaster',0,Y0+H1+.35,hz,W-1.6,H2,D-1.6,0,vC(0xd8d0c0));vB('vStone',0,Y0+H1+.35+H2,hz,W-1.2,.35,D-1.2,0,stL);
 vnHipRoof('dHipTile',0,Y0+H1+.7+H2,hz,W-1.6,D-1.6,1.4,0,vC(0x6a4a3a),.9);
 // the drum and gilt dome
 dnDrum('dStoneDrum',0,Y0+H1+.7+H2+.9,hz,3.6,1.8,st);for(let k=0;k<10;k++){const a=k/10*TAU;const p=dnOnRing(0,hz,3.6,a);vB('vDarkB',p[0],Y0+H1+.7+H2+1.3,p[1],.5,.9,.2,a);}
 kput('dGiltDome',[0,Y0+H1+.7+H2+2.7,hz],null,[3.9,3.4,3.9],gilt);vBall('dGiltBall',0,Y0+H1+.7+H2+6.2,hz,.3);
 // the corner tower: tapering octagonal drums, banded, domed
 {const tx=W/2+2.4,tz=hz-D/2+2.2;let yy=0;for(let k=0;k<3;k++){const r=2.2-k*.35,h=3.6-k*.4;dnDrum('dStoneDrumB',tx,yy,tz,r,h,st);yy+=h;vB('vStone',tx,yy,tz,r*2+.4,.3,r*2+.4,0,stL);yy+=.3;}
  kput('dGiltDome',[tx,yy,tz],null,[1.7,1.5,1.7],gilt);for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;const p=dnOnRing(tx,tz,1.5,a);dnGodWin(p[0],yy-2.6,p[1],a,.6,1.0,'vStone',st);}}
 dnGate(0,Y0,hz+D/2+.1,0,1.8,2.9,st);vnDoor(0,Y0,hz+D/2,0,1.6,2.8,'vStone',st,vC(0x3a2a1c),false);vnStairs(0,0,hz+D/2+1.3,0,3.2,Y0,3,'vStone',st);
 for(const x of[-4.4,-2.4,2.4,4.4])dnGodWin(x,Y0+1.4,hz+D/2,0,1.0,1.6,'vStone',st);for(const s of[-1,1])for(const z of[-3,0,3])dnGodWin(s*W/2,Y0+1.4,hz+z,s*Math.PI/2,1.0,1.5,'vStone',st);
 for(const x of[-3.6,0,3.6])dnGodWin(x,Y0+H1+1.2,hz+(D-1.6)/2,0,1.0,1.3,'vStone',st);
 for(const x of[-W/2-1.4,W/2+1.4])dnBanner(x,Y0+H1+.5,hz+D/2+.6,0,.9,3.0,vC(0x7a1e22));
 vB('vStone',-5.5,0,hz+D/2+4.5,1.0,3.2,1.0,0,st);kput('dStonePyr',[-5.5,3.2,hz+D/2+4.5],null,[1.2,.9,1.2],stL);   // shrine obelisk
 dnDrum('dStoneDrum',5.2,0,hz+D/2+4.2,1.2,.9,st);dnDrum('vDarkB',5.2,.9,hz+D/2+4.2,.9,.1,null);                      // well
 vnFolk(0,hz+D/2+6.5,2,1.2);}
// Historians' embassy: the Order's Djenne manners — a battered laterite hall with pilaster buttresses and pinnacles,
// toron rows, a mosaic string course, a great drum under a tile cone with a lantern; blue banners
function buildDalabEmbassyHist(G,o){reseed(8531+(o.v|0));const CW=30,CD=26;const lat=dCol(DPAL.laterite),latD=lat.clone().multiplyScalar(.8),wood=vC(0x4a3626);
 vnReg("Historians' embassy",0,0,12,18);dnEmbassyCompound(CW,CD,"Historians' embassy");
 const W=13,D=10,H=4.6,Y0=.5,hz=-2;
 vB('vStone',0,-.05,hz,W+1,Y0+.05,D+1,0,latD);
 kput('dEarthBat',[0,Y0,hz],null,[W,H,D],lat);
 for(const s of[-1,1])for(const x of[-W/2+.8,-W/6,W/6,W/2-.8]){vB('dEarth',x,Y0,hz+s*(D/2*.93),.8,H+.9,.5,0,lat);kput('dStonePyr',[x,Y0+H+.9,hz+s*(D/2*.93)],null,[1.0,.8,1.0],latD);}   // pilasters + pinnacles
 for(const s of[-1,1])for(let k=0;k<8;k++)kput('vPost',[-W/2+1.2+k*(W-2.4)/7,Y0+2.6,hz+s*(D/2*.93+.3)],qEuler(Math.PI/2,0,0),[.08,.9,.08],wood);   // toron
 vB('dMosaic',0,Y0+H-.9,hz,W*.87+.2,.6,D*.87+.2,0,null);vB('dEarth',0,Y0+H,hz,W*.87+.4,.4,D*.87+.4,0,latD);
 // the drum, tile cone and lantern
 dnDrum('dEarthDrum',0,Y0+H+.4,hz,4.6,3.2,lat);vB('dMosaic',0,Y0+H+3.3,hz,9.6,.4,9.6,0,null);for(let k=0;k<8;k++){const a=k/8*TAU;const p=dnOnRing(0,hz,4.6,a);dnDrum('dRelief',p[0],Y0+H+1.4,p[1],.9,.9,latD);const q=dnOnRing(0,hz,4.66,a);vB('vDarkB',q[0],Y0+H+1.55,q[1],.5,.6,.1,a);}
 kput('dConeTile',[0,Y0+H+3.5,hz],null,[5.6,4.4,5.6],vC(0x8a5a3a));dnDrum('dEarthDrum',0,Y0+H+7.4,hz,1.2,1.6,lat);for(let k=0;k<6;k++){const a=k/6*TAU;const p=dnOnRing(0,hz,1.2,a);dnGodWin(p[0],Y0+H+7.7,p[1],a,.5,.9,'vWood',wood);}
 kput('dConeTile',[0,Y0+H+9.0,hz],null,[1.7,1.4,1.7],vC(0x8a5a3a));
 // the porch: nested archivolts of earth, a God-lit door
 vB('dEarth',0,Y0,hz+D/2*.93+.6,4.4,H-.6,1.2,0,lat);vB('dEarth',0,Y0,hz+D/2*.93+1.0,3.2,H-1.4,1.0,0,latD);
 vnDoor(0,Y0,hz+D/2*.93+1.5,0,1.5,2.6,'vWood',wood,vC(0x3a2a1c));vnStairs(0,0,hz+D/2*.93+2.4,0,3,Y0,3,'vStone',latD);
 for(const x of[-4.2,4.2])dnGodWin(x,Y0+1.6,hz+D/2*.93,0,1.0,1.4,'vWood',wood);for(const s of[-1,1])for(const z of[-2.6,2.6])dnGodWin(s*W/2*.93,Y0+1.6,hz+z,s*Math.PI/2,1.0,1.3,'vWood',wood);
 for(const s of[-1,1])dnBannerPole(s*(W/2+2),0,hz+D/2+2,0,6,vC(0x2a5aa8));
 vB('dEarth',5.5,0,hz+D/2+5,2.4,1.0,2.4,0,lat);vB('dMosaic',5.5,1.0,hz+D/2+5,2.6,.3,2.6,0,null);   // a mosaic dais
 vnFolk(0,hz+D/2+7,2,1.2);}

// the Halls of Reformation: a circular stone wall; inside, the genepriests' halls — stone drums under Ancient panel
// domes, a cable pylon, tanks and pipe, God's-light strips, a giant guard pair at the gate. Half the Voth Monastery.
function buildDalabHalls(G,o){reseed(8541+(o.v|0));const R=34;const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.85),iron=vC(0x2e2a26);
 vnReg('Halls of Reformation',0,0,R+2,22,{landmark:true});vnReg('Halls wall',0,0,R+1,5,{part:'wall'});
 dnRingWall(0,0,0,R,4.4,0,6,'vStone',st,1.2);dnGate(0,0,R+.4,0,5,5.2,st);
 vnPaving(0,.02,0,R*1.6,R*1.6,0,st.clone().multiplyScalar(.92),90);
 // the central hall: a great stone drum, relief and mural bands, a panel dome with a rust seam, a light ring
 {const HR=10,HH=7;dnDrum('dStoneDrumB',0,0,0,HR,HH,st);dnDrum('dReliefDrum',0,.5,0,HR+.05,1.2,st);dnMuralRing(0,HH-2.4,0,HR-.25,1.6);
  vB('vStone',0,HH,0,HR*2+1,.6,HR*2+1,0,stD);dnDrum('dStoneDrum',0,HH+.6,0,HR-.4,.6,st);
  kput('dPanelDome',[0,HH+1.2,0],null,[HR-.6,HR*.7,HR-.6],null);
  for(let k=0;k<12;k++){const a=k/12*TAU;const p=dnOnRing(0,0,HR-.9,a);kput('vIron',[p[0],HH+1.2+HR*.35,p[1]],vQ(a,0,0),[.3,HR*.7,.3],iron);}   // ribs
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU;const p=dnOnRing(0,0,HR,a);dnGodStrip(p[0],HH-.5,p[1],a,TAU*HR/16-.6);}
  dnDrum('dRustDrum',0,HH+1.2+HR*.7-.4,0,1.4,2.2,null);vBall('dGodBall',0,HH+1.2+HR*.7+2.0,0,.5);vBall('dGlassBall',0,HH+1.2+HR*.7+2.0,0,.5);   // the lantern
  dnGate(0,0,HR+.2,0,2.4,3.8,st);vnDoor(0,0,HR,0,2.2,3.6,'vStone',st,vC(0x2a2a30),false);
  for(let k=0;k<8;k++){const a=(k+.5)/8*TAU;if(k===3||k===4)continue;const p=dnOnRing(0,0,HR,a);dnGodWin(p[0],3.2,p[1],a,1.0,1.6,'vStone',st);}
  dnGiant(-3.2,0,HR+3.5,.25,4,{spear:true});dnGiant(3.2,0,HR+3.5,-.25,4,{spear:true});vnStairs(0,0,HR+2,0,4,0,1,'vStone',st);}
 // the wing halls: two stone drums with rust domes, pipe to the centre, tanks
 for(const s of[-1,1]){const wx=s*20,wz=-6,WR=6,WH=5;dnDrum('dStoneDrumB',wx,0,wz,WR,WH,st);dnDrum('dReliefDrum',wx,.4,wz,WR+.05,.9,st);vB('vStone',wx,WH,wz,WR*2+.8,.5,WR*2+.8,0,stD);
  kput(s<0?'dRustDome':'dPanelDome',[wx,WH+.5,wz],null,[WR-.3,WR*.6,WR-.3],null);for(let k=0;k<6;k++){const a=k/6*TAU+.2;const p=dnOnRing(wx,wz,WR,a);if(k===1)continue;dnGodWin(p[0],2.2,p[1],a,.9,1.3,'vStone',st);}
  const dp=dnOnRing(wx,wz,WR,-s*Math.PI/2);vnDoor(dp[0],0,dp[1],-s*Math.PI/2,1.4,2.6,'vStone',st,vC(0x2a2a30),false);
  vBeam([wx-s*WR,WH-.5,wz],[s*10*.98,6,-1],.35,null,'vPipeR');vBeam([wx-s*WR,WH-1.5,wz+1],[s*10*.98,4.5,0],.25,null,'vPipe');
  vPst('vTankW',wx+s*3,0,wz+9,2.0,4.5,null);vPst('vTankR',wx-s*2,0,wz+9.5,1.5,3.2,null);vB('vIron',wx+s*3,4.5,wz+9,4.4,.1,4.4,0,iron);
  for(let k=0;k<3;k++)kput('vPipe',[wx+s*(1.5-k*.6),0,wz+9+k*.7],null,[.12,rr(2,4),.12],iron);}
 // the pylon: a latticed iron mast with cables to the centre dome and the wall — the priests' antenna to The God
 {const px=0,pz=-24;for(const sx of[-1,1])for(const sz of[-1,1])vBeam([px+sx*1.6,0,pz+sz*1.6],[px+sx*.3,26,pz+sz*.3],.18,iron,'vIron');
  for(let y=3;y<26;y+=3.5){const w=1.6-(1.3*y/26);vB('vIron',px,y,pz,w*2+.3,.12,.12,0,iron);vB('vIron',px,y,pz,.12,.12,w*2+.3,0,iron);}
  vB('vIron',px,26,pz,2.4,.2,2.4,0,iron);vBall('dGodBall',px,27,pz,.4);vBall('dGlassBall',px,27,pz,.4);kput('dGodHalo',[px,27,pz],vQ(0,0,0),[3,3,1],null);
  vBeam([px,25.5,pz],[0,7+1.2+10*.7+2.4,0],.05,vC(0x3a3a3a),'vRope');vBeam([px,25.5,pz],[-20,5.5,-6],.05,vC(0x3a3a3a),'vRope');vBeam([px,25.5,pz],[20,5.5,-6],.05,vC(0x3a3a3a),'vRope');
  vB('vStone',px,0,pz,4.4,1.2,4.4,0,stD);}
 // steles round the court, God-posts, priests, supplicants
 for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;const p=dnOnRing(0,0,R-4,a);dnStele(p[0],0,p[1],a+Math.PI,3.4,st);}
 for(const a of[.45,-.45,Math.PI*.5,-Math.PI*.5])dnGodPostAt(0,0,R-8,a,4.4);
 dnPriest(-4,0,14,.4);dnPriest(4,0,14,-.4);dnFolk(0,20,5,4);dnFolk(0,R+5,4,2.5);}
function dnGodPostAt(x,z,r,a,h){const p=dnOnRing(x,z,r,a);dnGodPost(p[0],0,p[1],h);}

dDef({key:'dalab_barracks',name:"Guard's barracks",family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true},w:36,d:30,h:12,build:buildDalabBarracks});
dDef({key:'dalab_embassy_iziz',name:'Izizian embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'iziz'},w:34,d:32,h:15,build:buildDalabEmbassyIziz});
dDef({key:'dalab_embassy_voth',name:'Vothic embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'voth'},w:34,d:32,h:17,build:buildDalabEmbassyVoth});
dDef({key:'dalab_embassy_hist',name:"Historians' embassy",family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'yuni-order'},w:34,d:32,h:18,build:buildDalabEmbassyHist});
dDef({key:'dalab_halls',name:'Halls of Reformation',family:'civic',tags:{type:['civic','religious','industry'],wealth:'civic',lit:true,role:'halls',landmark:true},w:76,d:76,h:28,build:buildDalabHalls});
