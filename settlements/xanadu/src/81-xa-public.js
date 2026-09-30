// ================================================================= XANADU — the public city (package X-H)
// The arena — an octagon of battered stone with two tiers of pointed arcades, masts and awnings over the seats;
// the amphitheatre — a half-bowl of stone tiers cut into a hillside before a columned stage front; the public
// baths — a hall under one mosaic dome and four lesser ones with gold oculus bosses; the public garden — a chahar
// bagh behind a low wall with a tea pavilion and cypress walks. All civic, lit. Seeds 31600–31799.

// an octagon of wall segments: fn(cx,cz,a,L) is called per side with the side's centre, outward bearing and length;
// apothem r; only sides in `sides` (indices 0..7, 0 = the +z side)
function xnXHOct(r,sides,fn){const L=2*r*Math.tan(Math.PI/8);for(let k=0;k<8;k++){if(sides&&!sides.includes(k))continue;const a=k*Math.PI/4;fn(r*Math.sin(a),r*Math.cos(a),a,L,k);}}

// ---------------------------------------------------------------- the arena
function buildXaArena(G,o){reseed(31601+(o.v|0));const V=xV(o),R=V===1?18:22,H=V===1?6.8:9.5,T=3.6;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),sand=xC(0xd8c090),tim=xC(xPick(XPAL.dark)),gold=xC(xPick(XPAL.gold));
 vnReg('Arena',0,0,25,H+5);
 // the outer wall: eight battered segments, two tiers of arcades on the outside, merlons on top; the gate on side 0
 xnXHOct(R,null,(cx,cz,a,L,k)=>{kput('xWallD',[cx,0,cz],qEuler(0,a,0),[L+.2,H,T],stone);if(k===0)return;
  const f=loc(cx,cz,0,T/2*.99,a);xnArcade(f[0],.7,f[1],a,L-2,3.4,4,'xArchS',stone,.5,{open:false});if(H>8)xnArcade(f[0],5.0,f[1],a,L*.9-2,3.0,4,'xArchS',stone,.5,{open:false});
  const n=Math.round(L/1.4);for(let i=0;i<=n;i++){const p=loc(cx,cz,-L*.9/2+L*.9*i/n,T*.8/2-.3,a);vB('vStone',p[0],H,p[1],.6,1.2,.5,a,stone);kput('xArcS',[p[0],H+1.2,p[1]],qEuler(0,a,0),[.6,.4,.5],stone);}
  const q=loc(cx,cz,0,T*.8/2-.3,a);vB('vStone',q[0],H,q[1],L*.9,.5,.5,a,stone);});
 // the gate: an iwan block in the front side, a gilt pavilion over it, the Sultan's roundel
 if(V===2){xnXHOct(R,[0,2,4,6],(cx,cz,a,L)=>{const f=loc(cx,cz,0,T/2,a);xnArch('xArchM',f[0],0,f[1],a,6,7.4,.6,null,{});});}   // v2: four mosaic gates round the ring, no gate block
 else{xnWall(0,0,R,12,H+2.5,T+2,0,wash,'wash');xnIwan(0,0,R+T/2+1,0,9,H+.5,1.4,wash,{guldasta:true});xnFlatRoof(0,H+2.5,R,11.4,T+1.7,0,wash,{band:true,gold:true,parapet:.5});
 xnGiltRoof(0,H+3.0,R,5.4,3.4,0,{frame:1.6,over:.9});xnRoundel(0,H+1.0,R+T/2+1+1.42,0,1.4);}
 vB('vDarkB',0,0,R-2.85,5,6.5,.1,0);kput('xArchS',[0,0,R-3.1],qEuler(0,Math.PI,0),[7,8,.5],stone);
 // the seating: four rings of solid tiers stepping down to the sand; entrances through the lower tier
 for(let t=0;t<(V===1?3:4);t++){const r=R-T/2-1.1-t*2.2,h=(V===1?4.5:6.2)-t*1.55;xnXHOct(r,null,(cx,cz,a,L,k)=>{vB('vStone',cx,0,cz,L-.1,h,2.2,a,stone.clone().multiplyScalar(t%2?1:.94));
  if(t===0&&(k===2||k===4||k===6)){const p=loc(cx,cz,0,-1.1,a);vB('vDarkB',p[0],0,p[1],2.4,2.6,.1,a);}});}
 kput('xDisc',[0,0,0],null,[R-T/2-9.9,.16,R-T/2-9.9],sand);
 // the masts and the awnings: a mast on the wall at each corner and mid-side, cloth strips over the upper seats
 xnXHOct(R,null,(cx,cz,a,L)=>{for(const u of[-L*.4,0,L*.4]){const p=loc(cx,cz,u,-T*.8/2+.5,a);vPst('vPost',p[0],H,p[1],.1,5,tim);vBall('xGold',p[0],H+5.1,p[1],.12,gold);}
  const c=loc(cx,cz,0,-T/2-2.6,a);kput('vClothB',[c[0],H+3.6,c[1]],qEuler(0,a,0).multiply(qEuler(-.3,0,0)),[L*.8,.06,4.6],xC(xPick(XPAL.cloth)));});
 xnXHOct(R,null,(cx,cz,a,L)=>{const p=loc(cx,cz,-L*.4,-T*.8/2+.5,a),q=loc(cx,cz,L*.4,-T*.8/2+.5,a);xnPennants([p[0],H+4.8,p[1]],[q[0],H+4.8,q[1]],9);});
 // outside: paving before the gate, stalls, lamps, the crowd
 xnPave(0,R+T/2+7,16,8,0,stone,2.4);for(const s of[-1,1]){vB('vWood',s*7,0,R+T/2+5,2.4,.9,1,0,tim);vnAwning(s*7,2.6,R+T/2+4.5,0,2.8,1.4,xC(xPick(XPAL.cloth)));for(const u of[-1,1])vPst('vPost',s*7+u*1.3,0,R+T/2+5.9,.06,2.6,tim);}
 if(xLit())for(const s of[-1,1])vnLampPost(s*4.5,0,R+T/2+7,3.6);vnFolk(0,R+T/2+8,6,4);}
// ---------------------------------------------------------------- the amphitheatre
function buildXaAmphitheatre(G,o){reseed(31611+(o.v|0));const V=xV(o),N=V===1?5:V===2?9:7;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),rub=xC(xPick(XPAL.rubble)),trim=xC(XPAL.red),tim=xC(xPick(XPAL.dark)),lit=xLit()?'lit':'glass';
 vnReg('Amphitheatre — tiers',0,-8,20,7);vnReg('Amphitheatre — stage',0,6,10,10);
 // the tiers: seven rings of three octagon sides (bearings 135°–225°) rising toward the back (-z); a hillside
 // terrace closes them behind
 for(let t=0;t<N;t++){const r=7+t*2.3,h=.9+t*.9;xnXHOct(r,[3,4,5],(cx,cz,a,L)=>{vB('vStone',cx,0,cz,L-.05,h,2.3,a,stone.clone().multiplyScalar(t%2?1:.94));});}
 xnTerrace(0,0,-24.5,52,9,0,N*.9+.4,rub);for(const x of[-20,-10,0,10,20])xnCypress(x,-26,rr(5,7),N*.9+.4);
 // the radial stairs through the tiers
 for(const a of[Math.PI*.78,Math.PI,Math.PI*1.22]){for(let t=0;t<N;t++){const r=7+t*2.3;const p=[Math.sin(a)*(r-1.15),Math.cos(a)*(r-1.15)];const h0=t?.9+(t-1)*.9:0;
  for(let k=0;k<5;k++){const rr2=r-1.15+(k-2)*.4;vB('vStone',Math.sin(a)*rr2,h0+.18*k,Math.cos(a)*rr2,1.4,.18,.4,a,stone.clone().multiplyScalar(1.08));}}}
 // the orchestra floor and the stage: a raised platform, the columned stage front with three arches, its flat roof
 kput('xDisc',[0,0,0],null,[6.8,.12,6.8],xC(0xc8b088));vB('vStone',0,0,4.5,20,1.2,5,0,stone);xnFlight(-6,0,1.9,0,2,1.2,'vStone',stone);xnFlight(6,0,1.9,0,2,1.2,'vStone',stone);
 {const z=9.5,W=20,H=7.5;xnWall(0,1.2,z,W,H,3.2,0,wash,'wash');xnArcade(0,1.2,z-1.6,Math.PI,W-4,4.6,3,'xArchM',null,.6,{open:false});
  for(let i=0;i<=6;i++)xnCol(-W/2+1.2+(W-2.4)*i/6,1.2,z-2.6,H-1.4,.2,Math.PI,trim);vB('vWood',0,1.2+H-1.4,z-2.4,W-1.2,.24,3.2,0,tim);xnCorbels(0,1.2+H-1.2,z-3.9,Math.PI,W-2,14,tim,.7);
  for(const u of[-7,7])xnTibWin(u,1.2+5.4,z-1.6,Math.PI,.9,1.3,lit,trim,{noVal:true});
  xnFlatRoof(0,1.2+H,z,W,3.2,0,wash,{band:true,gold:true,parapet:.5,corner:'gold'});if(V===2)xnGiltRoof(0,1.2+H+.3,z,8,2.6,0,{frame:1.4,over:.8});for(const s of[-1,1])xnFlagpole(s*(W/2-1),1.2+H+.5,z,4,xC(XPAL.saffron));
  for(const s of[-1,1]){vB('xWashB',s*(W/2+2.5),0,z-1,5,4.5,7,0,wash);xnFlatRoof(s*(W/2+2.5),4.5,z-1,5,7,0,wash,{parapet:.4});vnDoor(s*(W/2+2.5),0,z-4.5,Math.PI,1.2,2.2,'vWood',tim,tim,false);}}
 if(xLit())for(const s of[-1,1])vnLampPost(s*9,0,-2,3.4);vnFolk(0,0,4,2.5);xnFolk(0,1.2,5,2,2);}
// ---------------------------------------------------------------- the public baths
function buildXaBath(G,o){reseed(31621+(o.v|0));const V=xV(o),W=24,D=16,H=5.6;
 const wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone)),tile=xC(xPick(XPAL.tile)),gold=xC(xPick(XPAL.gold)),tim=xC(xPick(XPAL.dark)),rub=xC(xPick(XPAL.rubble));
 vnReg('Public baths',0,0,14,H+9);vnReg('Public baths — court',0,D/2+6,8,3);
 xnWall(0,0,0,W+.6,.8,D+.6,0,stone,'dressed');vB('xWashB',0,.8,0,W,H,D,0,wash);
 xnIwan(0,.8,D/2,0,6.4,H+1.4,1.2,wash,{guldasta:true});xnFlight(0,0,D/2+1.2+1.6,0,5,.8,'vStone',stone);
 for(const s of[-1,1])for(const u of[5,9]){kput('xJali',[s*u,.8+3.2,D/2+.06],null,[2.2,1.6,1],xC(XPAL.white));vB('vStone',s*u,.8+2.3,D/2+.08,2.5,.14,.16,0,stone);vB('vStone',s*u,.8+4.0,D/2+.08,2.5,.14,.16,0,stone);}
 for(const s of[-1,1])for(const z of[-4,0,4]){kput('xJali',[s*(W/2+.06),.8+3.2,z],qEuler(0,s*Math.PI/2,0),[2,1.6,1],xC(XPAL.white));}
 vB('xFriezeB',0,.8+H-.7,0,W+.2,.7,D+.2,0);
 const top=xnFlatRoof(0,.8+H,0,W,D,0,wash,{parapet:.5,corner:'gold'});
 // the domes: the great mosaic dome over the hot room on its lit drum, four lesser white domes with gold oculus bosses
 if(V===2){for(const x of[-7.5,0,7.5])xnDome(x,top-.5+.3,-1,3.6,'T',{drum:1.4,fin:1.2});}   // v2: three tiled domes in a row
 else{xnDome(0,top-.5+.3,-1,5.4,V===1?'T':'M',{drum:1.8,drumItem:'xDrumM',fin:1.6});
 for(const sx of[-1,1])for(const sz of[-1,1]){const dx=sx*7.6,dz=-1+sz*4.4;kput('xDrumW',[dx,top-.5+.3,dz],null,[2.5,.6,2.5],wash);kput(V===1?'xDomeG':'xDomeW',[dx,top-.5+.9,dz],null,[2.6,2.8,2.6],V===1?gold:wash);
  for(let k=0;k<6;k++){const a=k/6*TAU;vBall('xGold',dx+Math.sin(a)*1.4,top+.4+2.0,dz+Math.cos(a)*1.4,.14,gold);}vBall('xGold',dx,top+.4+2.9,dz,.2,gold);}}
 // the boiler house and cistern behind, the woodpile; the fountain court in front
 vB('xRubB',-6,0,-D/2-3,7,3.4,5,0,rub);vnShedRoof(-6,3.4,-D/2-3,7.4,5.4,.7,Math.PI,'vCorr',null,.3,.1);vnChimney(-6,4.1,-D/2-4,4.5,.28,true);vB('vDarkB',-6,0,-D/2-.5,1.4,1.6,.06,0);
 kput('xDrumS',[6,0,-D/2-3.2],null,[2.6,4.6,2.6],stone);vB('xWaterB',6,4.4,-D/2-3.2,3.6,.1,3.6,0,xC(XPAL.water));beam('vPipe',[6,3.8,-D/2-3.2],[3,3.8,-D/2],.12,.12,xC(0x2e2a26));
 for(let k=0;k<12;k++)vB('vWood',-11.5,.1+Math.floor(k/4)*.3,-D/2-2+ (k%4)*.6,2.4,.28,.28,0,xC(xPick(XPAL.timber)));
 xnPave(0,D/2+6,W-4,8,0,stone,2.4);xnFountain(0,0,D/2+6,2.4,stone);for(const s of[-1,1]){xnCypress(s*8,D/2+3.5,6);xnTree(s*8,D/2+8.5,4);vB('vStone',s*4.5,0,D/2+9,2.4,.5,.6,0,stone);}
 if(xLit())for(const s of[-1,1])vnLampPost(s*3.6,0,D/2+3.2,3.4);vnFolk(0,D/2+7,4,3);}
// ---------------------------------------------------------------- the public garden
function buildXaGarden(G,o){reseed(31631+(o.v|0));const V=xV(o),W=38,D=30;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),tile=xC(xPick(XPAL.tile)),tim=xC(xPick(XPAL.dark));
 vnReg('Public garden',0,0,20,6);vnReg('Public garden — tea pavilion',0,-D/2+4,4,6);
 // the low wall with its tiled coping, arched openings on the front, corner posts with gold balls
 for(const s of[-1,1]){vB('vStone',s*(W/2-.25),0,0,.5,1.3,D,0,stone);vB('xTilesB',s*(W/2-.25),1.3,0,.8,.16,D+.3,0,tile);vB('vStone',0,0,s*(D/2-.25),W,1.3,.5,0,stone);vB('xTilesB',0,1.3,s*(D/2-.25),W+.3,.16,.8,0,tile);}
 for(const s of[-1,1]){vB('vDarkB',s*6,0,D/2-.25,3.2,1.3,.6,0);xnArch('xArchS',s*6,0,D/2+.05,0,4.4,3.0,.6,stone,{open:true});}vB('vDarkB',0,0,D/2-.25,3.6,1.3,.6,0);xnArch('xArchS',0,0,D/2+.05,0,5,3.4,.6,stone,{open:true});
 for(const sx of[-1,1])for(const sz of[-1,1]){vB('vStone',sx*(W/2-.4),0,sz*(D/2-.4),.9,2,.9,0,stone);vBall('xGold',sx*(W/2-.4),2.3,sz*(D/2-.4),.24,xC(xPick(XPAL.gold)));}
 // the chahar bagh, a cypress walk down the axis, the tea pavilion at the back, benches, a shrine
 if(V===1){xnPool(0,.02,2,6,D-12,0,stone);for(const s of[-1,1])for(let k=0;k<6;k++){xnCypress(s*5,D/2-4-k*3.6,rr(5,7));xnTree(s*11,D/2-5-k*3.6,rr(3.5,4.5));}}   // v1: a long pool between cypress walks
 else{xnCharBagh(0,0,2,W-6,D-10,0,{channel:1.2,r:2.4,fountain:V!==2});if(V===2)xnChhatri(0,0,2,2.2,4.2,stone,tile,8);
 for(const s of[-1,1])for(let k=0;k<4;k++)xnCypress(s*3.2,D/2-3-k*3.4,rr(5,7));}
 xnPavilion(0,0,-D/2+4,6,4.4,3.4,0,{c:xC(XPAL.red),tileC:tile,over:1.0});vB('vStone',0,.3,-D/2+4,5,.4,3.4,0,stone);
 for(const s of[-1,1]){vB('vStone',s*10,0,-D/2+4,2.6,.5,.7,0,stone);vB('vStone',s*10,.5,-D/2+3.75,2.6,.4,.15,0,stone);}
 xnShrine(-W/2+4,0,-D/2+4,.9);xnPool(W/2-5,.02,-D/2+5,4,3,0,stone);
 if(xLit())for(const s of[-1,1]){vnLampPost(s*8,0,D/2-2,3.4);vnLampPost(s*8,0,-D/2+8,3.4);}vnFolk(0,D/2+2.5,4,3);vnFolk(0,4,3,4);}

const XTAG_PUB=(more)=>({type:['civic'].concat(more||[]),wealth:'civic',lit:true});
XA.def({key:'xa_arena',name:'Arena',family:'Public',tags:XTAG_PUB(),w:58,d:64,h:19,fw:50,fd:50,build:buildXaArena});
XA.def({key:'xa_amphitheatre',name:'Amphitheatre',family:'Public',tags:XTAG_PUB(),w:58,d:46,h:15,fw:50,fd:40,build:buildXaAmphitheatre});
XA.def({key:'xa_bath',name:'Public baths',family:'Public',tags:XTAG_PUB(['infrastructure']),w:34,d:38,h:17,fw:25,fd:17,build:buildXaBath});
XA.def({key:'xa_garden',name:'Public garden',family:'Public',tags:XTAG_PUB(),w:42,d:36,h:9,fw:38,fd:30,build:buildXaGarden});
