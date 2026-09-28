// ================================================================= XANADU — the Sultan's arms (package X-G)
// Dressed stone, battered, with pointed merlons and tiled bulbs on the towers: a length of city wall, the gate
// between two towers with a gilt pavilion over the iwan, the fortress on its rock (a dzong: white keep, red top,
// gold roof, the central tower), the barracks with its colonnade and drill yard, the city watch house and its
// lantern tower, and the mustering ground with the reviewing stand. Civic (lit) except the wall. Seeds 31400–31599.

// a rack of spears leaning in a timber stand; a round soldiers' tent
function xnXGSpears(x,z,ry,n){const aged=xC(xPick(XPAL.aged)),iron=xC(0x2e2a26);const P=(u,v)=>loc(x,z,u,v,ry);vB('vWood',x,0,z,n*.4+.4,.3,.6,ry,aged);const t=P(0,0);vB('vWood',t[0],1.1,t[1],n*.4+.4,.1,.1,ry,aged);
 for(let k=0;k<n;k++){const p=P(-n*.2+k*.4+.2,0);kput('vWood',[p[0],1.4,p[1]],qEuler(rr(-.06,.06),0,rr(-.05,.05)),[.04,2.8,.04],aged);kput('vConeI',[p[0],2.8,p[1]],null,[.05,.36,.05],iron);}}
function xnXGTent(x,z,r,c){kput('xConeP',[x,0,z],null,[r,r*1.3,r],c||xC(xPick([0xe8e0cc,0xd8d0b8,XPAL.red])));vPst('vPost',x,r*1.3,z,.04,.4,xC(0x5a4632));vB('vDarkB',x,0,z+r*.7,.6,1.1,.3,0);}

// ---------------------------------------------------------------- the barracks
function buildXaBarracks(G,o){reseed(31401+(o.v|0));const V=xV(o),W=28,D=10,lit=xLit()?'lit':'glass';
 const wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone)),trim=xC(XPAL.red),tim=xC(xPick(XPAL.dark));
 vnReg('Barracks',0,0,15,10);vnReg('Barracks — drill yard',0,10,10,3);
 xnWall(0,0,0,W+.6,.7,D+.6,0,stone,'dressed');const S=xnStack(0,.7,0,W,D,0,V===1?[3.4,3.2,3.0]:[3.4,3.2],wash,'wash');
 // the colonnade along the front at ground: painted columns, corbel eave, a walkway; the doors of the messes behind it
 for(let i=0;i<=10;i++)xnCol(-W/2+.6+ (W-1.2)*i/10,.7,D/2+2.6,3.1,.17,0,trim);
 vB('vWood',0,3.6,D/2+1.4,W+.4,.2,3,0,tim);xnCorbels(0,3.8,D/2+2.9,0,W-1,20,tim,.6);vB('xWashB',0,3.8,D/2+1.4,W+.6,.4,3.2,0,wash);vB('xTilesB',0,4.2,D/2+1.4,W+.8,.16,3.4,0,xC(xPick(XPAL.tile)));
 for(const u of[-10.5,-3.5,3.5,10.5])vnDoor(u,.7,D/2,0,1.2,2.2,'vWood',tim,tim,false);
 for(const u of[-7,0,7])vnWin(u,1.6,D/2,0,1.0,1.1,'shut','xPaint',trim);
 for(let i=0;i<9;i++)xnTibWin(-W/2*.96+W*.96*(i+.5)/9,4.1+1.0,D/2*.96-.06,0,.8,1.1,lit,trim,{noVal:true});
 for(let i=0;i<9;i++)xnTibWin(-W/2*.96+W*.96*(i+.5)/9,4.1+1.0,-D/2*.96+.06,Math.PI,.8,1.1,lit,trim,{noVal:true});
 for(const s of[-1,1])for(const z of[-2.5,2.5])xnTibWin(s*(W/2*.96-.06),4.1+1.0,z,s*Math.PI/2,.8,1.1,lit,trim,{noVal:true});
 if(V===1)for(let i=0;i<9;i++)xnTibWin(-W/2*.92+W*.92*(i+.5)/9,7.3+1.0,D/2*.92-.06,0,.8,1.1,lit,trim,{noVal:true});
 const top=xnFlatRoof(0,S.y,0,S.w,S.d,0,wash,{parapet:.7,corner:'flag'});
 if(V===2){const WX=W/2-4,WZ=-D/2-8;const S2=xnStack(WX,.7,WZ,8,16,0,[3.4,3.2],wash,'wash');xnWall(WX,0,WZ,8.6,.7,16.6,0,stone,'dressed');for(const z of[-6,-3,0,3,6]){xnTibWin(WX-4*.98+.06,1.7,WZ+z,-Math.PI/2,.8,1.1,lit,trim,{noVal:true});xnTibWin(WX-4*.96+.06,4.9,WZ+z,-Math.PI/2,.8,1.1,lit,trim,{noVal:true});}xnFlatRoof(WX,S2.y,WZ,S2.w,S2.d,0,wash,{parapet:.7,corner:'flag'});}   // v2: a second wing behind
 // the drill yard: paving, spear racks, a well, tents, the Sultan's banner, straw dummies
 xnPave(0,11,W-4,10,0,stone,2.4);for(const s of[-1,1])xnXGSpears(s*9,D/2+3.5,0,8);
 xnFlagpole(0,0,15.5,7,xC(XPAL.saffron));for(const s of[-1,1])xnXGTent(s*11.5,14,2.2);
 for(let k=0;k<4;k++){const x=-4.5+k*3;vPst('vPost',x,0,15.5,.1,1.9,xC(xPick(XPAL.aged)));kput('vThatchB',[x,1.2,15.5],null,[.5,.9,.4],xC(xPick(VPAL.thatch)));}
 if(xLit())for(const s of[-1,1])vnLampPost(s*6,0,D/2+4,3.4);
 vnFolk(-6,10,4,1.5);vnFolk(6,10,4,1.5);}
// ---------------------------------------------------------------- a length of the city wall
function buildXaWall(G,o){reseed(31411+(o.v|0));const V=xV(o),L=24,H=V===2?5.5:8;
 const stone=xC(xPick(XPAL.stone)),aged=xC(xPick(XPAL.aged));
 vnReg('City wall',0,0,13,H+2,{part:'wall'});
 if(V===2){kput('xWallE',[0,0,0],null,[L,H,3.2],xC(xPick(XPAL.earth)));vB('xRubB',0,0,0,L,.6,3.4,0,xC(xPick(XPAL.rubble)));xnCrenel(0,H,0,L,2.6,0,1.1,xC(xPick(XPAL.earth)),{item:'xEarthB'});}   // v2: the earth wall of a lesser town
 else xnXECurtain([-L/2,0],[L/2,0],H,stone,1);if(V===1)xnXETower(-L/2+1,0,0,3.2,H+2,stone,xC(xPick(XPAL.tile)));
 // the walk behind the merlons: a stair up from the inside, a guard's hut on the walk, a torch bracket
 xnFlight(8,0,-2.3,Math.PI/2,1.4,H-.1,'vStone',stone);
 vB('xWashB',6,H,-.6,3,2.4,2,0,xC(xPick(XPAL.wash)));xnFlatRoof(6,H+2.4,-.6,3,2,0,xC(xPick(XPAL.wash)),{parapet:.3});vnDoor(6,H,.4,0,.8,1.8,'vWood',aged,aged,false);
 xnFlagpole(-6,H+.2,-.6,3.2,xC(XPAL.red));vnFolk(0,-4,2,2);}
// ---------------------------------------------------------------- the gate
function buildXaGate(G,o){reseed(31421+(o.v|0));const V=xV(o),TH=V===2?17:13,GW=11,GH=10,GD=7;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),tile=xC(xPick(XPAL.tile)),tim=xC(xPick(XPAL.dark)),gold=xC(xPick(XPAL.gold));
 vnReg('City gate',0,0,12,TH+6);
 for(const s of[-1,1]){if(V===1){xnWall(s*(GW/2+3.6),0,0,7,TH,7,0,stone,'dressed');xnCrenel(s*(GW/2+3.6),TH,0,6.2,6.2,0,1.2,stone,{item:'vStone',pointed:true});xnGiltRoof(s*(GW/2+3.6),TH+.5,0,3.6,3.6,0,{frame:1.2,over:.7});}   // v1: square towers with gilt roofs
  else xnXETower(s*(GW/2+3.4),0,0,3.8,TH,stone,tile);}
 xnWall(0,0,0,GW,GH,GD,0,wash,'wash');xnIwan(0,0,GD/2,0,8.4,GH-.6,1.5,wash,{guldasta:true});
 vB('vDarkB',0,0,-GD/2-.02,5.4,7,.06,0);kput('xArchS',[0,0,-GD/2-.2],qEuler(0,Math.PI,0),[7.4,8.4,.4],stone);
 for(const s of[-1,1])kput('vWood',[s*1.5,0+3.2,GD/2+1.0],qEuler(0,s*.5,0),[2.6,6.2,.14],tim);for(let k=0;k<4;k++)vB('vIron',0,1+k*1.6,GD/2+1.1,5.2,.08,.04,0,xC(0x2e2a26));
 xnFlatRoof(0,GH,0,GW,GD,0,wash,{band:true,gold:true,parapet:false});xnCrenel(0,GH+.3,0,GW+.2,GD+.2,0,1.2,wash,{pointed:true});
 if(V===2)xnDome(0,GH+.5,0,2.8,'T',{drum:1.6,c:tile,fin:1.4});else xnGiltRoof(0,GH+.5,0,5.6,3.6,0,{frame:1.8,over:.9});xnRoundel(0,GH-1.0,GD/2+1.52,0,1.4);
 for(const s of[-1,1])xnFlagpole(s*4.6,GH+.4,-1.6,4,xC(XPAL.saffron));
 xnPennants([-(GW/2+3.4),TH+3.6,0],[GW/2+3.4,TH+3.6,0],10);
 // a stub of wall each side, the road through, lamps on the towers
 for(const s of[-1,1])xnXECurtain(s>0?[GW/2+6.8,0]:[-GW/2-11.8,0],s>0?[GW/2+11.8,0]:[-GW/2-6.8,0],8,stone,1);
 xnPave(0,GD/2+6,9,10,0,stone,2.6);if(xLit())for(const s of[-1,1])vnLamp(s*(GW/2+3.4),4.6,3.8,0);
 vnFolk(0,GD/2+7,4,2.5);}
// ---------------------------------------------------------------- the fortress (dzong)
function buildXaFortress(G,o){reseed(31431+(o.v|0));const V=xV(o),RH=4,CW=42,CD=34,CH=6.5,lit=xLit()?'lit':'glass',UT=V===2?26:20;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),red=xC(xPick(XPAL.redwall)),tile=xC(xPick(XPAL.tile)),rock=xC(0xa89880),tim=xC(xPick(XPAL.dark)),gold=xC(xPick(XPAL.gold));
 vnReg('Fortress — keep',0,-4,15,RH+30);vnReg('Fortress — curtain wall',0,CD/2,10,RH+CH+3,{part:'wall'});vnReg('Fortress — tower',0,-12,5,RH+36);
 // the rock: a battered rubble mass with boulders round its foot; the ramp up its front
 kput('xBatS80',[0,0,0],null,[CW+8,RH,CD+8],rock);for(let k=0;k<14;k++){const a=k/14*TAU;kput('xBoulder',[Math.sin(a)*(CW/2+5)*rr(.9,1.05),rr(.2,1.4),Math.cos(a)*(CD/2+5)*rr(.9,1.05)],qEuler(rng(),rng(),rng()),[rr(2.4,4),rr(1.6,2.8),rr(2.4,3.6)],rock.clone().multiplyScalar(rr(.9,1.06)));}
 {const run=Math.max(2,Math.round(RH/.17))*.34;xnFlight(0,0,CD/2+4+run,0,6,RH,'vStone',stone);for(const s of[-1,1])vB('vStone',s*3.4,0,CD/2+4+run/2,.7,RH*.5+.6,run,0,stone);}
 // the curtain on the rock, its corner towers, the gate iwan
 const cx=CW/2-3,cz=CD/2-3;for(const S of[[[-cx+3,cz],[-5,cz]],[[5,cz],[cx-3,cz]],[[cx-3,-cz],[-cx+3,-cz]],[[-cx,-cz+3],[-cx,cz-3]],[[cx,cz-3],[cx,-cz+3]]]){
  const a=[S[0][0],S[0][1]],b=[S[1][0],S[1][1]];const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz)-Math.PI/2,m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  kput('xWallD',[m[0],RH,m[1]],qEuler(0,ry,0),[L,CH,3.2],stone);vB('vStone',m[0],RH+CH-.1,m[1],L*.98,.12,3,ry,stone.clone().multiplyScalar(1.06));
  const n=Math.max(1,Math.round(L/1.4));for(let i=0;i<=n;i++){const p=loc(m[0],m[1],-L*.98/2+L*.98*i/n,1.35,ry);vB('vStone',p[0],RH+CH,p[1],.6,1.3,.5,ry,stone);kput('xArcS',[p[0],RH+CH+1.3,p[1]],qEuler(0,ry,0),[.6,.4,.5],stone);}
  const q=loc(m[0],m[1],0,1.35,ry);vB('vStone',q[0],RH+CH,q[1],L*.98,.5,.5,ry,stone);}
 for(const sx of[-1,1])for(const sz of[-1,1]){if(V===2){xnWall(sx*cx,RH,sz*cz,6.4,CH+2.5,6.4,0,stone,'dressed');xnCrenel(sx*cx,RH+CH+2.5,sz*cz,5.8,5.8,0,1.2,stone,{item:'vStone',pointed:true});}else xnXETower(sx*cx,RH,sz*cz,3.2,CH+2,stone,tile);}
 xnWall(0,RH,cz,11,CH+3,6,0,wash,'wash');xnIwan(0,RH,cz+3,0,7.6,CH+1.8,1.3,wash,{guldasta:true});xnFlatRoof(0,RH+CH+3,cz,10.4,5.7,0,wash,{band:true,parapet:.5,corner:'gold'});
 // the keep: a white battered mass of two storeys, the red sanctum on it with a gilt roof (as the temples), the tower
 const K=xnXDSanctum(0,-4,24,17,[5.6,5.0],13,9,4.4,{y:RH,wash,red,doorGap:3.4,gw:7,gd:5.5,frame:1.6,crown:V===1?'dome':null});
 xnPortico(0,RH,-4+17/2*.995,0,7,2.8,4,wash,{band:true,valC:xC(XPAL.red)});vnDoor(0,RH,-4+17/2*.995+.02,0,2,2.8,'xPaint',xC(XPAL.red),tim,false);
 xnWall(0,RH,-12.5,8,UT,8,0,stone,'dressed');for(let k=0;k<UT/4.2-.5;k++)for(const a of[0,Math.PI/2,Math.PI,-Math.PI/2]){const yr=3+k*4.2,hw=4-.8*yr/UT;const p=loc(0,-12.5,0,hw-.05,a);xnTibWin(p[0],RH+yr,p[1],a,.7,1.2,lit,xC(XPAL.red),{noVal:true});}
 xnCrenel(0,RH+UT,-12.5,7.2,7.2,0,1.3,stone,{item:'vStone',pointed:true});xnGiltRoof(0,RH+UT+.4,-12.5,4.4,4.4,0,{frame:1.4,over:.8});
 // the bailey: a well, stables against the wall, spear racks, pennants from the tower
 xnPave(0,RH,8,20,10,0,stone,2.4);vPst('vPostS',-8,RH,6,.8,.8,stone);vB('vDarkB',-8,RH+.8,6,1,.03,1,0);
 vB('xWashB',-14,RH,-4,6,3.2,14,0,wash);vnShedRoof(-14,RH+3.2,-4,6.4,14.4,1,-Math.PI/2,'xTilesB',tile,.4);for(const z of[-8,-4,0])vnDoor(-11,RH,-4+z,Math.PI/2,1.4,2.2,'vWood',tim,tim,false);
 for(const s of[-1,1])xnXGSpears(s*5,RH,10,0,7);for(const s of[-1,1]){xnPennants([0,RH+UT+2,-12.5],[s*(cx-1),RH+CH+2.6,cz-1.6],14);}
 if(xLit()){for(const s of[-1,1])vnLampPost(s*4,RH,cz-4,3.4);}xnFolk(0,RH,8,4,3);vnFolk(0,CD/2+6,3,2);}
// ---------------------------------------------------------------- the city watch
function buildXaWatch(G,o){reseed(31441+(o.v|0));const V=xV(o),W=10,D=10,lit=xLit()?'lit':'glass';
 const wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone)),trim=xC(XPAL.red),tim=xC(xPick(XPAL.dark)),tile=xC(xPick(XPAL.tile)),iron=xC(0x2e2a26);
 vnReg('City watch',0,0,7.5,10);vnReg('City watch — tower',W/2+1.5,-D/2+1.5,3,22);
 xnWall(0,0,0,W+.6,.9,D+.6,0,stone,'dressed');const S=xnStack(0,.9,0,W,D,0,[3.4,3.2],wash,'wash');
 vnDoor(-1.5,.9,D/2,0,1.4,2.4,'vStone',stone,tim,false);xnFlight(-1.5,0,D/2+1.3,0,2.4,.9,'vStone',stone);vB('vWood',-1.5,.9+2.6,D/2+.12,2.4,.18,.3,0,tim);xnCorbels(-1.5,.9+2.6,D/2,0,2,4,tim,.6);
 xnRoundel(-1.5,.9+3.4,D/2+.02,0,.8);xnTibWin(2.6,1.9,D/2-.05,0,.8,1.1,lit,trim,{noVal:true});
 for(const u of[-3,0,3])xnTibWin(u,4.3+1.0,D/2*.96-.05,0,.8,1.1,lit,trim);for(const s of[-1,1])for(const z of[-2.5,2.5])xnTibWin(s*(W/2*.96-.06),4.3+1.0,z,s*Math.PI/2,.8,1.1,lit,trim,{noVal:true});
 const top=xnFlatRoof(0,.9+6.6,0,S.w,S.d,0,wash,{eave:true,eaveC:tim,parapet:.6,corner:'flag'});
 // the lantern tower: dressed stone shaft, an open lantern on columns under a tiled roof, the alarm bell, a lamp
 const tx=V===1?-(W/2+1.5):W/2+1.5,tz=-D/2+1.5,TT=V===1?20:15;
 if(V===2){for(const s of[-1,1])vPst('vPostS',s*.9,top,-2,.18,2.6,stone);vB('vStone',0,top+2.6,-2,2.4,.3,.5,0,stone);kput('xBulbG',[0,top+1.4,-2],null,[.5,.7,.5],xC(xPick(XPAL.gold)));vnGableRoof(0,top+2.9,-2,2.6,1.2,.6,0,'xTilesB',tile,.2);}   // v2: a bell cote on the roof instead of a tower
 else{xnWall(tx,0,tz,4.6,TT,4.6,0,stone,'dressed');for(let k=0;k<TT/4-1;k++)vB('vDarkB',tx,3+k*4,tz+2.3*.94,.4,1.1,.1,0);
 xnPavilion(tx,TT,tz,3.4,3.4,3.2,0,{c:trim,tileC:tile,over:.7});kput('xBulbG',[tx,TT+1.4,tz],null,[.5,.7,.5],xC(xPick(XPAL.gold)));vBeam([tx,TT+2.9,tz],[tx,TT+2.1,tz],.03,iron,'vRope');}
 // the cells: a low barred block at the side; stocks in front; the watch's banner
 vB('xWashB',-W/2-3.2,0,-1,5.4,2.8,7,0,wash);xnFlatRoof(-W/2-3.2,2.8,-1,5.4,7,0,wash,{parapet:.4});for(const z of[-3,-1,1])for(let k=0;k<3;k++)vB('vIron',-W/2-5.92,1.4,z-.25+k*.25,.04,.9,.03,0,iron);
 for(const z of[-3,-1,1])vB('vDarkB',-W/2-5.9,1.4,z,.06,.9,.7,0);vnDoor(-W/2-3.2,0,2.5,0,1,2,'vIron',iron,iron,true);
 vB('vWood',3.5,.9,D/2+3,1.8,.24,.3,0,tim);for(const s of[-1,1])vPst('vPost',3.5+s*.7,0,D/2+3,.08,.9,tim);vnFolk(3.5,D/2+3.4,1,.2);
 xnFlagpole(-2,top-.6,-2,3.6,xC(XPAL.red));if(xLit()){vnLampPost(3,0,D/2+2,3.4);}vnFolk(-1,D/2+4,2,1.5);}
// ---------------------------------------------------------------- the mustering ground
function buildXaMuster(G,o){reseed(31451+(o.v|0));const V=xV(o),W=40,D=30;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),gold=xC(xPick(XPAL.gold));
 vnReg('Mustering ground',0,0,21,8);vnReg('Mustering ground — reviewing stand',0,-D/2+3,7,8);
 xnPave(0,0,W,D,0,stone,3);vB('vStone',0,0,0,W+1,.2,D+1,0,stone.clone().multiplyScalar(.8));
 // the reviewing stand: a stone platform with a gilt pavilion, the Sultan's roundel, banners
 {const z=-D/2+3;vB('vStone',0,.2,z,V===2?22:14,1.6,6,0,stone);xnFlight(0,.2,z+3+2.7,0,6,1.6,'vStone',stone);
  if(V===1)xnPavilion(0,1.8,z,9,4,4,0,{c:xC(XPAL.red),tileC:xC(xPick(XPAL.tile)),over:1.0});else if(V===2){xnPortico(0,1.8,z-2,0,18,4,4.6,wash,{band:true,valC:xC(XPAL.saffron)});}else xnPavilion(0,1.8,z,9,4,4,0,{gilt:true,rise:1.6,over:1.0});
  xnRoundel(0,1.2,z+3.02,0,1.2);for(const s of[-1,1]){xnFlagpole(s*(V===2?10.4:6.4),1.8,z-1.8,5,xC(XPAL.saffron));xnFolk(s*2.5,1.8,z,2,1.2);}}
 // the ring of flag poles, the drill posts, spear racks, tents and the troops in their ranks
 for(let k=0;k<10;k++){const t=k/10;xnFlagpole(-W/2+1+ (W-2)*t,0,D/2-1,5.5+rng(),xC(xPick([XPAL.red,XPAL.saffron,XPAL.lapis])));}
 for(let k=0;k<5;k++){const x=-12+k*6;vPst('vPost',x,0,-6,.12,2.2,xC(xPick(XPAL.aged)));kput('vThatchB',[x,1.3,-6],null,[.55,1.0,.45],xC(xPick(VPAL.thatch)));kput('xPaintBall',[x,2.15,-6],null,[.2,.22,.2],xC(0xd8c8a0));}
 for(const s of[-1,1])xnXGSpears(s*(W/2-2),0,0,Math.PI/2,10);if(V!==2)for(const s of[-1,1])for(const z of[4,9])xnXGTent(s*(W/2-3.5),z,2.4);
 if(V===2)for(const s of[-1,1]){vB('xWashB',s*(W/2-4),0,8,6,3,9,0,wash);xnFlatRoof(s*(W/2-4),3,8,6,9,0,wash,{parapet:.4});}   // v2: stone barrack sheds instead of tents
 for(let r=0;r<3;r++)for(let c=0;c<8;c++){const x=-8+c*2.2,z=4+r*2.4;kput('figB',[x,0,z],qEuler(0,Math.PI,0),1,xC(xPick([0xa8382a,0xa8382a,0x1e3f8a])));kput('figH',[x,0,z],null,1,xC(0xc9a17e));}
 vPst('vPostS',-W/2+4,0,-10,.8,.8,stone);vB('vDarkB',-W/2+4,.8,-10,1,.03,1,0);
 if(xLit())for(const s of[-1,1]){vnLampPost(s*(W/2-1),0,-D/2+1,4);vnLampPost(s*(W/2-1),0,D/2-1,4);}vnFolk(4,12,3,2);}

const XTAG_MIL=(more,lit)=>({type:['military'].concat(more||[]),wealth:'civic',lit:lit!==false});
XA.def({key:'xa_barracks',name:'Barracks',family:'Military',tags:XTAG_MIL(['multi-family dwelling']),w:36,d:34,h:11,fw:29,fd:11,build:buildXaBarracks});
XA.def({key:'xa_wall',name:'City wall',family:'Military',tags:XTAG_MIL(['infrastructure'],false),w:28,d:14,h:11,fw:24,fd:4,build:buildXaWall});
XA.def({key:'xa_gate',name:'City gate',family:'Military',tags:XTAG_MIL(['infrastructure']),w:38,d:26,h:20,fw:30,fd:8,build:buildXaGate});
XA.def({key:'xa_fortress',name:'Fortress',family:'Military',tags:XTAG_MIL(['civic'])
 ,w:62,d:64,h:42,fw:50,fd:42,build:buildXaFortress});
XA.def({key:'xa_watch',name:'City watch',family:'Military',tags:XTAG_MIL(['civic']),w:26,d:20,h:20,fw:11,fd:11,build:buildXaWatch});
XA.def({key:'xa_muster',name:'Mustering ground',family:'Military',tags:XTAG_MIL(['civic']),w:46,d:38,h:9,fw:41,fd:31,build:buildXaMuster});
