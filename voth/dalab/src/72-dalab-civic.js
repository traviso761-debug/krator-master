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
// Yuni embassy: the Yuni set's manners as the Iziz chapterhouse port describes them — laterite drum halls under tile
// cones with lanterns, round relief-ringed windows, a curved arcaded gallery wing, a carved forecourt wall with a
// parabolic gate; deep-red banners. Built from the vp* kit (75/76), inside a Dalab compound.
function buildDalabEmbassyYuni(G,o){reseed(8531+(o.v|0));const CW=30,CD=26;const lat=vC(0x9a5a34),dk=vC(0x5a3620),tile=vC(0x8a5a3a),wood=vC(0x4a3626);
 vnReg('Yuni embassy',0,0,12,18);dnEmbassyCompound(CW,CD,'Yuni embassy');
 const hz=-3;
 // the great drum hall at the back, two lesser drums at the front corners of the court, a curved arcade between
 vpDrumHall(0,0,hz-2,6.2,7,lat,dk,tile);for(let k=0;k<6;k++){const a=k/6*TAU+.5;if(k===1)continue;const p=dnOnRing(0,hz-2,6.2,a);vpRoundWin(p[0],3.6,p[1],a,.8,dk,vLit());}
 const dp=dnOnRing(0,hz-2,6.2,0);vnDoor(dp[0],0,dp[1],0,1.5,2.7,'vStone',dk,vC(0x3a2a1c),false);dnGodLamp(dp[0],3.3,dp[1],0);
 for(const sd of[-1,1]){const px=sd*9.5,pz=hz+6;vpDrumHall(px,0,pz,3.2,4.6,lat,dk,tile);const w=dnOnRing(px,pz,3.2,sd*Math.PI/2+.4);vpRoundWin(w[0],2.4,w[1],sd*Math.PI/2+.4,.6,dk,vLit());
  const d=dnOnRing(px,pz,3.2,Math.PI);vnDoor(d[0],0,d[1],Math.PI,1.1,2.1,'vStone',dk,vC(0x3a2a1c),false);}
 // the arcade: a curved gallery of banco arches on a plinth, from drum to drum behind the court
 {const n=7;for(let k=0;k<=n;k++){const t=k/n;const x=-9.5+19*t,z=hz+6-Math.sin(t*Math.PI)*2.6;vPst('vpBancoPost',x,0,z,.32,3.2,lat);if(k<n){const x2=-9.5+19*(t+1/n),z2=hz+6-Math.sin((t+1/n)*Math.PI)*2.6;
   const mx=(x+x2)/2,mz=(z+z2)/2,ry=Math.atan2(x2-x,z2-z)+Math.PI/2;kput('vpBayArchB',[mx,0,mz],qEuler(0,ry,0),[1,1,1],lat);vB('vpTileB',mx,3.4,mz,Math.hypot(x2-x,z2-z)+.3,.3,1.6,ry,tile);}}
  vpTorons(-8,hz+6.3,8,hz+6.3,2.9,9,0,1,.8);}
 // relief-ringed forecourt: a mosaic dais, gilt finials on the wall corners, banners
 vB('dEarth',0,0,CD/2-5,3.4,.9,3.4,0,lat);vB('dMosaic',0,.9,CD/2-5,3.6,.3,3.6,0,null);
 for(const sd of[-1,1])vpBannerPole(sd*(CW/2-3),0,CD/2-3,0,6.5,vC(0x7a1e22));
 vnFolk(0,CD/2+6.5,2,1.2);}
// Republican embassy — PLACEHOLDER. The Republic's highlands style is being built in another session and is not in
// this repo yet; this stands in with a plain highland reading (dry-stone walls, slate-dark shingle, a jettied timber
// gallery, a square watch tower, a flag) and is tagged placeholder:true so the layout can swap it when the real set
// lands. Same footprint and compound as the other embassies.
function buildDalabEmbassyRepublic(G,o){reseed(8536+(o.v|0));const CW=30,CD=26;const st=vC(0x8a8478),stD=vC(0x6e6a62),wood=vC(0x5a4632),sl=vC(0x4a4e56);
 vnReg('Republican embassy (placeholder)',0,0,12,18,{placeholder:true});dnEmbassyCompound(CW,CD,'Republican embassy');
 const W=13,D=10,H1=3.8,Y0=.5,hz=-2;
 vB('vStone',0,-.05,hz,W+1,Y0+.05,D+1,0,stD);vB('vStone',0,Y0,hz,W,H1,D,0,st);
 // the jettied timber upper storey on brackets, shingle gable
 vB('vWood',0,Y0+H1,hz,W+1.4,.3,D+1.4,0,wood);for(let k=-3;k<=3;k++)for(const sd of[-1,1])vBeam([k*1.8,Y0+H1-.6,hz+sd*D/2],[k*1.8,Y0+H1,hz+sd*(D/2+.7)],.18,wood);
 vnFrame(0,Y0+H1+.3,hz,W+1.2,3.0,D+1.2,0,wood,.16);vB('vPlaster',0,Y0+H1+.3,hz,W+1.0,3.0,D+1.0,0,vC(0xd8d0c0));
 vnGableRoof(0,Y0+H1+3.3,hz,W+1.2,D+1.2,3.0,0,'vGableS',sl,1.0,'vGableW',wood,.3);
 for(const x of[-4.5,-1.5,1.5,4.5])vnWin(x,Y0+H1+1.2,hz+D/2+.6,0,1.0,1.2,'lit','vWood',wood);
 for(const x of[-4,4])vnWin(x,Y0+1.4,hz+D/2,0,.6,1.4,'glass','vStone',st);for(const s of[-1,1])for(const z of[-2.5,2.5])vnWin(s*W/2,Y0+1.4,hz+z,s*Math.PI/2,.6,1.4,'glass','vStone',st);
 vnDoor(0,Y0,hz+D/2,0,1.5,2.5,'vStone',st,vC(0x3a2a1c));vnStairs(0,0,hz+D/2+1.1,0,3,Y0,3,'vStone',st);
 // the watch tower
 {const tx=W/2+2.2,tz=hz-D/2+2.0,TH=11;vB('vStone',tx,0,tz,3.6,TH,3.6,0,st);vB('vStone',tx,TH,tz,4.2,.4,4.2,0,stD);for(let k=0;k<8;k++){const a=k/8*TAU;const p=loc(tx,tz,Math.cos(a)*1.9,Math.sin(a)*1.9,0);vB('vStone',p[0],TH+.4,p[1],.5,.8,.5,0,st);}
  kput('vPyrSh',[tx,TH+.4,tz],null,[3.0,2.2,3.0],sl);for(let k=0;k<4;k++){const a=k*Math.PI/2;const p=loc(tx,tz,0,1.8,a);vnWin(p[0],TH-3,p[1],a,.4,1.2,'lit','vStone',st);}
  vnBannerPole(tx,TH+.4,tz+1.4,0,4,vC(0x2a4a8a));}
 vnLampPost(-3,0,hz+D/2+4.6,3.2);vnLampPost(3,0,hz+D/2+4.6,3.2);vnFolk(0,hz+D/2+6.5,2,1.2);}
// the Order of Historians' chapterhouse, ported from the Yuni set through Iziz (76-port-chapterhouse.js, vendored)
function buildDalabChapterhouse(G,o){reseed(8538+(o.v|0));buildVpChapterhouse(G,o);}

// the Halls of Reformation: a circular stone wall (r 68, the Voth Monastery's half); inside, the genepriests' halls —
// the great drum under an Ancient panel dome at the centre, four wing halls with rust and panel domes, the cell
// blocks where the reformed convalesce, the archive drum, the vats under their sheds, tanks and pipe, two cable
// pylons, a gatehouse with a giant guard pair, steles, God's-light strips and posts.
function buildDalabHalls(G,o){reseed(8541+(o.v|0));const R=68;const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.85),iron=vC(0x2e2a26),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle);
 vnReg('Halls of Reformation',0,0,R+2,44,{landmark:true});vnReg('Halls wall',0,0,R+1,5,{part:'wall'});
 dnRingWall(0,0,0,R,4.8,0,8,'vStone',st,1.3);
 // gatehouse: two stone drums flanking the gate, a lintel bridge with a relief, giants
 for(const s of[-1,1]){dnDrum('dStoneDrumB',s*5.6,0,R,2.6,8,st);dnDrum('dReliefDrum',s*5.6,6.4,R,2.62,1.0,st);kput('dConeSh',[s*5.6,7.8,R],null,[3.2,2.6,3.2],sh);}
 vB('vStone',0,5.6,R,9,1.4,2.4,0,st);dnReliefBand(0,5.8,R+1.2,0,7.5,1.0,st);vB('vStone',0,7.0,R,9.4,.3,2.8,0,stD);
 dnGiant(-3.4,0,R+3.2,.25,4,{spear:true});dnGiant(3.4,0,R+3.2,-.25,4,{spear:true});
 vnPaving(0,.02,0,R*1.7,R*1.7,0,st.clone().multiplyScalar(.92),260);
 // THE GREAT HALL OF REFORMATION: a two-course stepped base with a stair; the lower drum (r 18) ringed by sixteen
 // buttress piers with pyramid pinnacles, God windows between them, a fret plinth, a mural frieze and a light ring
 // under its cornice; a clerestory drum above with sixteen God windows; the Ancient panel dome on iron ribs with a
 // rust lantern and a mast; a colonnaded portico on the front axis with a trilithon door, and an apse on each of
 // the other three axes. Grey stone: the Halls are civic, not sacred — the priests work here, they do not pray.
 {const HR=18,HH=9.5,CR=HR-4.2,CH=4.2;const DY=HH+.9+CH+.9;   // DY: the dome springs here
  const tq=dCol(DPAL.sacred);
  dnDrum('dStoneDrum',0,-.05,0,HR+5,.7,stD);dnDrum('dStoneDrum',0,.65,0,HR+3,.7,stD);const Y0=1.35;
  vnStairs(0,0,HR+5+1.0,0,6,Y0,3,'vStone',st);
  dnDrum('dStoneDrumB',0,Y0,0,HR,HH,st);dnDrum('dReliefDrum',0,Y0+.5,0,HR+.05,1.3,st);dnMuralRing(0,Y0+HH-3.0,0,HR-.28,1.8);
  // the sixteen piers, each a battered stone block with a relief front and a pyramid pinnacle; God windows between
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU;const p=dnOnRing(0,0,HR-.3,a);kput('dEarthBat',[p[0],Y0,p[1]],qEuler(0,-a,0),[1.6,HH+1.4,2.2],st);
   vB('vStone',p[0],Y0+HH+1.4,p[1],1.9,.3,2.5,-a,stD);kput('dStonePyr',[p[0],Y0+HH+1.7,p[1]],qEuler(0,-a,0),[1.7,1.3,1.7],st);
   const q=dnOnRing(0,0,HR-.3+1.15,a);dnReliefBand(q[0],Y0+1.9,q[1],a,1.1,HH-2.4,st);
   const b=(k+1)/16*TAU;if(k%4===3)continue;/* the door and the three apses */const w=dnOnRing(0,0,HR,b);dnGodWin(w[0],Y0+3.0,w[1],b,1.1,2.2,'vStone',st);}
  for(let k=0;k<32;k++){const a=(k+.5)/32*TAU;const p=dnOnRing(0,0,HR,a);dnGodStrip(p[0],Y0+HH-.6,p[1],a,TAU*HR/32-.5);}
  // cornice, the clerestory drum, its cornice
  vB('vStone',0,Y0+HH,0,HR*2+1.2,.9,HR*2+1.2,0,stD);dnDrum('dStoneDrum',0,Y0+HH+.9,0,CR,CH,st);dnDrum('dReliefDrum',0,Y0+HH+1.1,0,CR+.05,.9,st);
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU;const p=dnOnRing(0,0,CR,a);dnGodWin(p[0],Y0+HH+2.3,p[1],a,.9,1.5,'vStone',st);}
  vB('vStone',0,Y0+HH+.9+CH,0,CR*2+1.0,.9,CR*2+1.0,0,stD);
  // the dome: Ancient panel over iron ribs, a rust seam, the lantern and the mast
  kput('dPanelDome',[0,Y0+DY,0],null,[CR-.3,CR*.72,CR-.3],null);
  {const t=.5,L=CR*.6;for(let k=0;k<16;k++){const a=k/16*TAU;const p=dnOnRing(0,0,CR-.9-L/2*Math.sin(t),a);kput('vIron',[p[0],Y0+DY+L/2*Math.cos(t),p[1]],vQ(a,-t,0),[.32,L,.32],iron);}}   // ribs lean in and lie on the dome
  kput('dRing',[0,Y0+DY+CR*.5,0],qEuler(Math.PI/2,0,0),[CR*.72,CR*.72,1],iron);
  const AP=Y0+DY+CR*.72;dnDrum('dRustDrum',0,AP-.5,0,2.2,3.2,null);for(let k=0;k<6;k++){const a=k/6*TAU;const p=dnOnRing(0,0,2.2,a);vB('vDarkB',p[0],AP+.4,p[1],.7,1.4,.1,a);}
  vBall('dGodBall',0,AP+3.6,0,.8);vBall('dGlassBall',0,AP+3.6,0,.8);vPst('vPipe',0,AP+2.7,0,.12,7,iron);vBall('dGodBall',0,AP+9.8,0,.35);vBall('dGlassBall',0,AP+9.8,0,.35);
  window._hallsApex=AP+3.6;
  // the portico: eight stone columns carrying a relief-fronted entablature and a stepped crest, over a checker floor
  {const PZ=HR+3.6,PW=17;vB('vStone',0,Y0-.4,PZ,PW+2,.48,7,0,stD);dnChecker(0,Y0+.10,PZ,PW,6,0);
   for(let i=0;i<3;i++)for(const sd of[-1,1]){const x=sd*(2.3+i*3.2);vPst('vPostS',x,Y0,PZ+2.6,.36,HH-1.4,st);vB('vStone',x,Y0+HH-1.4,PZ+2.6,1.0,.3,1.0,0,stD);}
   vB('vStone',0,Y0+HH-1.1,PZ,PW+2,1.4,7,0,st);dnReliefBand(0,Y0+HH-.9,PZ+3.5,0,PW,1.0,st);vB('vStone',0,Y0+HH+.3,PZ,PW+2.4,.4,7.4,0,stD);
   const tr=dCol(DPAL.trim);let yy=Y0+HH+.7;for(const w of[PW*.7,PW*.42,PW*.2]){vB('vStone',0,yy,PZ+2.2,w,.8,1.6,0,st);vB('vStone',0,yy+.66,PZ+2.2,w+.2,.14,1.8,0,tr);yy+=.8;}vBall('dGiltBall',0,yy+.2,PZ+2.2,.25);}
  dnGate(0,Y0,HR+.4,0,3.2,4.8,st);vnDoor(0,Y0,HR,0,3.0,4.6,'vStone',st,vC(0x2a2a30),false);for(const x of[-2.6,2.6])dnGodLamp(x,Y0+5.4,HR,0);
  // the three apses
  for(const a of[Math.PI/2,-Math.PI/2,Math.PI]){const p=dnOnRing(0,0,HR-1.5,a);dnDrum('dStoneDrumB',p[0],Y0,p[1],4.2,6.4,st);dnDrum('dReliefDrum',p[0],Y0+.4,p[1],4.24,.9,st);
   kput('dStoneDome',[p[0],Y0+6.4,p[1]],null,[4.0,2.4,4.0],stD);vBall('dGiltBall',p[0],Y0+8.9,p[1],.3);for(const d of[-.5,.5]){const w=dnOnRing(p[0],p[1],4.2,a+d);dnGodWin(w[0],Y0+2.6,w[1],a+d,.8,1.4,'vStone',st);}}
  dnGiant(-4.2,Y0+.08,HR+7.5,.25,4,{spear:true});dnGiant(4.2,Y0+.08,HR+7.5,-.25,4,{spear:true});dnPriest(-1.6,Y0+.08,HR+5,Math.PI);}
 // four wing halls on the diagonals, pipe to the centre
 [[1,1,'dRustDome'],[-1,1,'dPanelDome'],[1,-1,'dPanelDome'],[-1,-1,'dRustDome']].forEach((w,i)=>{const wx=w[0]*30,wz=w[1]*26,WR=7,WH=5.5;
  dnDrum('dStoneDrumB',wx,0,wz,WR,WH,st);dnDrum('dReliefDrum',wx,.4,wz,WR+.05,1.0,st);vB('vStone',wx,WH,wz,WR*2+.8,.5,WR*2+.8,0,stD);
  kput(w[2],[wx,WH+.5,wz],null,[WR-.3,WR*.6,WR-.3],null);const toC=Math.atan2(-wx,-wz);
  for(let k=0;k<7;k++){const a=k/7*TAU+.2;const p=dnOnRing(wx,wz,WR,a);let d=Math.abs(((a-toC)%TAU+TAU)%TAU);if(d>Math.PI)d=TAU-d;if(d<.5)continue;dnGodWin(p[0],2.4,p[1],a,.9,1.4,'vStone',st);}
  const dp=dnOnRing(wx,wz,WR,toC);vnDoor(dp[0],0,dp[1],toC,1.5,2.8,'vStone',st,vC(0x2a2a30),false);const lp=dnOnRing(wx,wz,WR,toC);dnGodLamp(lp[0],3.4,lp[1],toC);
  const ep=dnOnRing(wx,wz,WR-.2,toC);const cp=dnOnRing(0,0,17.6,Math.atan2(wx,wz));vBeam([ep[0],WH-.5,ep[1]],[cp[0],7.5,cp[1]],.35,null,'vPipeR');vBeam([ep[0],WH-1.6,ep[1]],[cp[0],5.8,cp[1]],.22,null,'vPipe');
  for(const t of[.3,.62]){const px=ep[0]+(cp[0]-ep[0])*t,pz=ep[1]+(cp[1]-ep[1])*t,py=(WH-.5)+(7.5-(WH-.5))*t;vPst('vPipe',px,0,pz,.12,py-.1,iron);vB('vIron',px,py-.35,pz,.7,.12,.7,0,iron);}   // pipe trestles
  vPst(i%2?'vTankW':'vTankR',wx+w[0]*4,0,wz+w[1]*10,2.0,4.6,null);vB('vIron',wx+w[0]*4,4.6,wz+w[1]*10,4.4,.1,4.4,0,iron);vPst('vTankR',wx+w[0]*9,0,wz+w[1]*8,1.4,3.2,null);
  for(let k=0;k<3;k++)kput('vPipe',[wx+w[0]*(6-k*.7),0,wz+w[1]*(9+k*.5)],null,[.12,rr(2,4),.12],iron);});
 // the cell blocks: two long stone ranges of small cells on the east and west, God-lit doors along a colonnade
 for(const s of[-1,1]){const bx=s*50,W=8,D=36,H=3.6;vB('vStone',bx,0,0,W,H,D,0,st);dnReliefBand(bx-s*W/2,.3,0,-s*Math.PI/2,D-1.5,.8,st);
  vnHipRoof('vHipS',bx,H,0,W,D,2.2,0,sh,.9);
  for(let k=0;k<7;k++){const z=-D/2+3+k*5;const f=bx-s*W/2;vnDoor(f,0,z,-s*Math.PI/2,.9,2.0,'vStone',st,vC(0x2a2a30),false);dnGodWin(f,1.3,z+2.2,-s*Math.PI/2,.7,.9,'vStone',st);
   vPst('vPostS',f-s*2.6,0,z,.22,3.0,st);}
  vB('vStone',bx-s*(W/2+1.5),3.0,0,3.4,.3,D+.4,0,stD);for(const z of[-D/2,D/2])dnDrum('dStoneDrumB',bx,0,z,1.6,H+.8,st);}
 // the archive drum (records of every lineage The God has touched), back of the court
 {const ax=0,az=-46,AR=7,AH=6;dnDrum('dStoneDrumB',ax,0,az,AR,AH,st);dnDrum('dReliefDrum',ax,AH-1.6,az,AR+.05,1.1,st);dnMuralRing(ax,1.2,az,AR,1.5);
  kput('dConeSh',[ax,AH-.3,az],null,[AR*1.2,5.5,AR*1.2],sh);vBall('dGiltBall',ax,AH+5.4,az,.35);vnDoor(ax,0,az+AR,0,1.4,2.6,'vStone',st,vC(0x2a2a30),false);dnGodLamp(ax,3.2,az+AR,0);
  for(let k=1;k<6;k++){const a=k/6*TAU;const p=dnOnRing(ax,az,AR,a);dnGodWin(p[0],2.6,p[1],a,.8,1.3,'vStone',st);}}
 // the vats: culture tanks under panel sheds either side of the archive
 for(const s of[-1,1]){const vx=s*22,vz=-48;for(const p of[[-5,-4],[5,-4],[-5,4],[5,4]])vPst('vPipe',vx+p[0],0,vz+p[1],.14,4.2,iron);vnShedRoof(vx,3.9,vz,11,9,.8,0,'vPanelB',null,.6,.14);
  for(let k=0;k<6;k++)vPst('vTankW',vx-4+(k%3)*4,0,vz-2+Math.floor(k/3)*4,1.3,2.6,null);for(let k=0;k<6;k++)vBall('dGodBall',vx-4+(k%3)*4,2.9,vz-2+Math.floor(k/3)*4,.22);for(let k=0;k<6;k++)vBall('dGlassBall',vx-4+(k%3)*4,2.9,vz-2+Math.floor(k/3)*4,.22);}
 // two pylons with cables to the centre dome, the wings and the wall
 for(const s of[-1,1]){const px=s*40,pz=40;for(const sx of[-1,1])for(const sz of[-1,1])vBeam([px+sx*1.6,0,pz+sz*1.6],[px+sx*.3,26,pz+sz*.3],.18,iron,'vIron');
  for(let y=3;y<26;y+=3.5){const w=1.6-(1.3*y/26);vB('vIron',px,y,pz,w*2+.3,.12,.12,0,iron);vB('vIron',px,y,pz,.12,.12,w*2+.3,0,iron);}
  vB('vIron',px,26,pz,2.4,.2,2.4,0,iron);vBall('dGodBall',px,27,pz,.4);vBall('dGlassBall',px,27,pz,.4);kput('dGodHalo',[px,27,pz],vQ(0,0,0),[3,3,1],null);
  dnCable([px,25.5,pz],[0,window._hallsApex||30,0],2.6);dnCable([px,25.5,pz],[s*30,6,26],3.2);dnCable([px,25.5,pz],[s*30,6,-26],4.5);
  vB('vStone',px,0,pz,4.4,1.2,4.4,0,stD);}
 // steles round the court, God-posts along the axis, priests, supplicants
 for(let k=0;k<12;k++){const a=k/12*TAU+Math.PI/12;const p=dnOnRing(0,0,R-5,a);dnStele(p[0],0,p[1],a+Math.PI,3.6,st);}
 for(const z of[32,40,48,56])for(const s of[-1,1])dnGodPost(s*5.5,0,z,4.4);
 for(const a of[Math.PI*.5,-Math.PI*.5,Math.PI])dnGodPostAt(0,0,R-10,a,4.4);
 dnPriest(-7,0,30,.4);dnPriest(7,0,30,-.4);dnPriest(-26,0,-2,1.2);dnFolk(0,30,6,5);dnFolk(0,R+6,4,3);dnFolk(-50,0,3,2);dnFolk(50,0,3,2);}
function dnGodPostAt(x,z,r,a,h){const p=dnOnRing(x,z,r,a);dnGodPost(p[0],0,p[1],h);}

dDef({key:'dalab_barracks',name:"Guard's barracks",family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true},w:36,d:30,h:12,build:buildDalabBarracks});
dDef({key:'dalab_embassy_iziz',name:'Izizian embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'iziz'},w:34,d:32,h:15,build:buildDalabEmbassyIziz});
dDef({key:'dalab_embassy_voth',name:'Vothic embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'voth'},w:34,d:32,h:17,build:buildDalabEmbassyVoth});
dDef({key:'dalab_embassy_yuni',name:'Yuni embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'yuni'},w:34,d:32,h:18,build:buildDalabEmbassyYuni});
dDef({key:'dalab_embassy_republic',name:'Republican embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'republic',placeholder:true},w:34,d:32,h:19,build:buildDalabEmbassyRepublic});
dDef({key:'dalab_chapterhouse',name:"Historians' chapterhouse",family:'civic',tags:{culture:'yuni-order',type:['civic','religious'],wealth:'civic',lit:true,role:'chapterhouse'},w:40,d:38,h:22,build:buildDalabChapterhouse});
dDef({key:'dalab_halls',name:'Halls of Reformation',family:'civic',tags:{type:['civic','religious','industry'],wealth:'civic',lit:true,role:'halls',landmark:true},w:146,d:146,h:32,build:buildDalabHalls});
