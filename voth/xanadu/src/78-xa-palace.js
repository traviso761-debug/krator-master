// ================================================================= XANADU — the Sultan (package X-E)
// The Sultan's Palace: a fortress-palace — a battered dressed-stone curtain with pointed merlons and corner
// towers, an iwan gate, and inside it the palace proper: a white base, an ochre upper block under the maroon
// band, jharokhas and gilt roofs round a turquoise dome. The Pleasure Dome: the great turquoise-and-gold dome on
// an arcaded pavilion at the heart of a chahar bagh — rills, a long pool, fountains, cypress walks, the domed
// baths and garden kiosks, all inside a low garden wall. Both electric. Seeds 31000–31199.

// a round corner tower on a curtain wall: battered stone drum, a crenellated top, a tiled bulb on a drum
function xnXETower(x,y,z,r,h,c,tile){kput('xDrumS',[x,y,z],null,[r,h,r],c);kput('xDrumS',[x,y+h,z],null,[r*1.12,1.0,r*1.12],c);
 for(let k=0;k<12;k++){const a=k/12*TAU;vB('vStone',x+Math.sin(a)*r*1.02,y+h+1,z+Math.cos(a)*r*1.02,.6,1.1,.5,a,c);}
 kput('xDrumW',[x,y+h+1,z],null,[r*.62,1.6,r*.62],xC(xPick(XPAL.wash)));kput('xBulbT',[x,y+h+2.6,z],null,[r*.72,r*.9,r*.72],tile);vBall('xGold',x,y+h+2.6+r*.9+.1,z,.14,xC(XPAL.gold[0]));}
// a length of battered curtain wall from a to b (local [x,z]) with a walkway and pointed merlons on the outer edge
function xnXECurtain(a,b,h,c,side){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz)-Math.PI/2,m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 kput('xWallD',[m[0],0,m[1]],qEuler(0,ry,0),[L,h,3.2],c);vB('vStone',m[0],h-.1,m[1],L*.98,.12,3.0,ry,c.clone().multiplyScalar(1.06));
 const n=Math.max(1,Math.round(L/1.4));for(let i=0;i<=n;i++){const p=loc(m[0],m[1],-L*.98/2+L*.98*i/n,side*1.35,ry);vB('vStone',p[0],h,p[1],.6,1.3,.5,ry,c);kput('xArcS',[p[0],h+1.3,p[1]],qEuler(0,ry,0),[.6,.4,.5],c);}
 const q=loc(m[0],m[1],0,side*1.35,ry);vB('vStone',q[0],h,q[1],L*.98,.5,.5,ry,c);}

// ---------------------------------------------------------------- the Sultan's Palace
function buildXaPalace(G,o){reseed(31001+(o.v|0));const CW=52,CD=42,CH=7,lit=xLit()?'lit':'glass';
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),ochre=xC(xPick(XPAL.ochre)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.dark)),gold=xC(xPick(XPAL.gold)),tile=xC(xPick(XPAL.tile));
 vnReg("Sultan's Palace",0,-4,17,36);vnReg("Sultan's Palace — curtain wall",0,CD/2,8,10,{part:'wall'});vnReg("Sultan's Palace — court",0,10,9,3);
 // the curtain: four walls, four corner towers, the gate iwan in the front wall
 const cx=CW/2-3,cz=CD/2-3;
 xnXECurtain([-cx+3,cz],[-6,cz],CH,stone,1);xnXECurtain([6,cz],[cx-3,cz],CH,stone,1);xnXECurtain([cx-3,-cz],[-cx+3,-cz],CH,stone,1);
 xnXECurtain([-cx,-cz+3],[-cx,cz-3],CH,stone,1);xnXECurtain([cx,cz-3],[cx,-cz+3],CH,stone,1);
 for(const sx of[-1,1])for(const sz of[-1,1])xnXETower(sx*cx,0,sz*cz,3.4,CH+2,stone,tile);
 // the gate: a tall iwan block through the front wall, guldasta turrets, a gilt pavilion on top, the Sultan's roundel
 xnWall(0,0,cz,13,CH+4,6,0,wash,'wash');xnIwan(0,0,cz+3,0,9,CH+2.5,1.4,wash,{guldasta:true});xnFlatRoof(0,CH+4,cz,12.4,5.7,0,wash,{band:true,gold:true,parapet:.6});
 xnGiltRoof(0,CH+4.9,cz,6,3.6,0,{frame:1.6,over:.9});xnRoundel(0,CH+2.2,cz+4.42,0,1.6);
 for(const s of[-1,1])xnFlagpole(s*4.8,CH+4.9,cz+1.6,4.5,xC(XPAL.saffron));
 // the palace inside: the white base of two storeys, the ochre upper block set back, the band and eave, jharokhas
 const PZ=-6,W=32,D=20;xnWall(0,0,PZ,W+1.6,1.4,D+1.6,0,stone,'dressed');
 const S=xnStack(0,1.4,PZ,W,D,0,[4.6,4.2],wash,'wash');
 xnIwan(0,1.4,PZ+D/2*.995,0,7,7.6,1.3,wash,{guldasta:false});xnFlight(0,0,PZ+D/2+1.3+2.4,0,9,1.4,'vStone',stone);
 for(const s of[-1,1])for(const u of[6.5,10,13.5])xnTibWin(s*u,1.4+1.4,PZ+D/2*.995-.06,0,.9,1.6,lit,trim,{shutters:true});
 for(const s of[-1,1])for(const u of[5.5,12.5])xnJharokha(s*u,1.4+4.6+.5,PZ+D/2*.96,0,2.8,2.4,stone,{dome:'G',jaliC:xC(XPAL.white)});
 for(const s of[-1,1])for(const u of[9])xnTibWin(s*u,1.4+4.6+1.3,PZ+D/2*.96-.06,0,.9,1.6,lit,trim);
 for(const s of[-1,1])for(const z of[-6,-2,2,6]){xnTibWin(s*(W/2-.06),1.4+1.4,PZ+z,s*Math.PI/2,.9,1.6,lit,trim,{shutters:true});xnTibWin(s*(W/2*.96-.06),1.4+4.6+1.3,PZ+z,s*Math.PI/2,.9,1.5,lit,trim);}
 const t1=xnFlatRoof(0,1.4+8.8,PZ,S.w,S.d,0,wash,{eave:true,eaveC:tim,parapet:.6,corner:'gold'});
 // the upper block: ochre, the band with gold roundels, an arcaded loggia along its front, two gilt roofs and the dome
 const UW=20,UD=13,UY=t1-.6+.3;const U=xnStack(0,UY,PZ-1,UW,UD,0,[4.2,3.8],ochre,'wash');
 xnArcade(0,UY,PZ-1+UD/2*.995,0,UW-2,3.4,5,'xArchM',null,.7,{open:false});
 for(const u of[-7,-3.5,0,3.5,7])xnTibWin(u,UY+4.2+1.1,PZ-1+UD/2*.96-.06,0,.9,1.5,lit,xC(XPAL.saffron));
 for(const s of[-1,1])for(const z of[-3.5,0,3.5]){xnTibWin(s*(UW/2-.06),UY+1.2,PZ-1+z,s*Math.PI/2,.9,1.6,lit,trim);xnTibWin(s*(UW/2*.96-.06),UY+4.2+1.1,PZ-1+z,s*Math.PI/2,.9,1.5,lit,trim);}
 const t2=xnFlatRoof(0,UY+8,PZ-1,U.w,U.d,0,ochre,{band:true,gold:true,eave:true,eaveC:tim,parapet:.6,corner:'gold'});
 xnDome(0,t2-.6,PZ-1,4.2,'T',{drum:2.6,drumItem:'xDrumM',drumC:null,c:tile,fin:2.2});
 for(const s of[-1,1])xnGiltRoof(s*7,t2-.6,PZ-1,4.4,3.6,0,{frame:1.5,over:.9});
 // the court between the gate and the palace: paving, a long pool, cypresses, lamps; guard huts inside the gate
 xnPave(0,10,CW-10,14,0,stone,2.4);xnPool(0,.02,10,14,3.2,0,stone);for(const s of[-1,1]){xnCypress(s*10,6,7);xnCypress(s*10,14,7);xnCypress(s*17,10,6);}
 for(const s of[-1,1]){vB('xWashB',s*10,0,cz-5,5,3.2,4,0,wash);xnFlatRoof(s*10,3.2,cz-5,5,4,0,wash,{parapet:.4});vnDoor(s*10,0,cz-3,0,1,2,'vWood',tim,tim,true);}
 if(xLit()){for(const s of[-1,1]){vnLampPost(s*4,0,PZ+D/2+5,3.6);vnLampPost(s*6,0,cz-7,3.6);vnLampPost(s*4,0,cz+5,3.8);}}
 vnFolk(0,10,4,5);vnFolk(0,cz+6,4,3);}
// ---------------------------------------------------------------- the Pleasure Dome and its grounds
function buildXaPleasureDome(G,o){reseed(31011+(o.v|0));const GW=88,GD=88,lit=xLit()?'lit':'glass';
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),tim=xC(xPick(XPAL.dark)),gold=xC(xPick(XPAL.gold)),tile=xC(XPAL.turquoise),trim=xC(xPick(XPAL.trim));
 vnReg('Pleasure Dome',0,-12,15,30);vnReg('Pleasure Dome — gardens',0,20,20,3);vnReg('Pleasure Dome — baths',-30,-24,9,9);vnReg('Pleasure Dome — gate',0,GD/2-2,4,6);
 // the garden wall: whitewash with a tiled coping, an arched gate in the front, kiosks at the corners
 for(const s of[-1,1]){vB('xWashB',s*(GW/2-.3),0,0,.6,2.6,GD,0,wash);vB('xTilesB',s*(GW/2-.3),2.6,0,.9,.22,GD+.3,0,tile);vB('xWashB',0,0,s*(GD/2-.3),GW,2.6,.6,0,wash);vB('xTilesB',0,2.6,s*(GD/2-.3),GW+.3,.22,.9,0,tile);}
 vB('vDarkB',0,0,GD/2-.3,4.4,2.6,.8,0);xnArch('xArchS',0,0,GD/2+.1,0,6.2,3.4,.8,stone,{open:true});for(const s of[-1,1])vPst('xColS',s*3.4,0,GD/2-.3,.35,3.8,stone);
 for(const sx of[-1,1])for(const sz of[-1,1])xnChhatri(sx*(GW/2-4),0,sz*(GD/2-4),1.6,3.6,stone,tile,6);
 // the dome pavilion: a square hall with pointed arcades on all four faces, a mosaic drum and the great dome, four turrets
 const HZ=-12,HW=22;xnWall(0,0,HZ,HW+3,1.2,HW+3,0,stone,'dressed');vB('vStone',0,1.06,HZ,HW+3.3,.14,HW+3.3,0,stone.clone().multiplyScalar(1.08));
 vB('xWashB',0,1.2,HZ,HW,9,HW,0,wash);
 for(let k=0;k<4;k++){const a=k*Math.PI/2;const p=loc(0,HZ,0,HW/2,a);xnArcade(p[0],1.2,p[1],a,HW-2,7.4,5,'xArchM',null,.8,{open:false});
  const f=loc(0,HZ,0,HW/2+.9,a);vB('xFriezeB',f[0],1.2+7.6,f[1],HW-1.6,.8,.14,a);}
 xnFlight(0,0,HZ+HW/2+1.5+1.4,0,10,1.2,'vStone',stone);
 xnFlatRoof(0,10.2,HZ,HW,HW,0,wash,{band:true,gold:true,eave:true,eaveC:tim,parapet:.6,corner:'gold'});
 const top=xnDome(0,10.5,HZ,9.2,'T',{drum:4.2,drumItem:'xDrumM',drumC:null,c:tile,fin:3.2});
 vB('xGoldB',0,10.5+4.2-.3,HZ,17.6,.3,17.6,0,gold);
 for(const sx of[-1,1])for(const sz of[-1,1]){const tx=sx*(HW/2-1.6),tz=HZ+sz*(HW/2-1.6);vPst('xColS',tx,10.2,tz,1.1,5,stone);kput('xDrumW',[tx,15.2,tz],null,[1.3,1.2,1.3],wash);kput('xBulbT',[tx,16.4,tz],null,[1.5,1.8,1.5],tile);vBall('xGold',tx,18.3,tz,.16,gold);}
 // the chahar bagh in front: a long reflecting pool on the axis between two parterre gardens, fountains at the ends
 xnPool(0,.02,17,7,22,0,stone);xnFountain(0,0,32,2.8,stone);xnChannel([0,2.1],[0,5.7],1.1,stone);
 for(const s of[-1,1])xnCharBagh(s*24,0,14,32,30,0,{channel:1.1,r:2.0});
 for(const s of[-1,1])for(let k=0;k<7;k++)xnCypress(s*5.2,2+k*4.2,rr(6,8));
 xnPave(0,37,18,8,0,stone,2.2);
 // the baths at the back-left: a hall under one large and four small domes with oculus bosses, a boiler house
 {const BX=-30,BZ=-24,BW=16,BD=13;vB('xWashB',BX,0,BZ,BW,5.2,BD,0,wash);vB('vStone',BX,0,BZ,BW+.4,.5,BD+.4,0,stone);
  xnIwan(BX,0,BZ+BD/2,0,5,5,1,wash,{});for(const u of[-5.5,5.5])xnJharokha(BX+u,2.4,BZ+BD/2,0,2,1.8,stone,{dome:'T',jaliC:xC(XPAL.white)});
  xnFlatRoof(BX,5.2,BZ,BW,BD,0,wash,{parapet:.5});xnDome(BX,5.5,BZ,3.6,'M',{drum:1.4,fin:1.2});
  for(const sx of[-1,1])for(const sz of[-1,1]){const dx=BX+sx*5.2,dz=BZ+sz*3.8;kput('xDomeW',[dx,5.5,dz],null,[2.0,2.2,2.0],wash);for(let k=0;k<5;k++){const a=k/5*TAU;vBall('xGold',dx+Math.sin(a)*1.1,5.5+1.5,dz+Math.cos(a)*1.1,.14,gold);}}
  vB('xRubB',BX-BW/2-2.6,0,BZ-3,4,3.2,5,0,xC(xPick(XPAL.rubble)));vnChimney(BX-BW/2-2.6,3.2,BZ-4,4.5,.3,true);vB('xWaterB',BX,.1,BZ+BD/2+5,6,.15,3,0,xC(XPAL.water));vB('vStone',BX,0,BZ+BD/2+5,6.6,.35,3.6,0,stone);}
 // the eastern grove: a kiosk on a knoll, fruit trees, a rill from the pavilion to the pool
 {const KX=30,KZ=-24;xnTerrace(KX,0,KZ,14,14,0,1.4,xC(xPick(XPAL.rubble)));xnPavilion(KX,1.4,KZ,5,5,3.2,0,{c:xC(XPAL.red),tileC:tile});
  for(let k=0;k<8;k++)xnTree(KX+rr(-6,6),KZ+rr(-6,6),rr(3.5,5),null,1.4);for(let k=0;k<6;k++)xnTree(KX+rr(-13,13),KZ+rr(-13,-8)+(k%2?21:0),rr(3.5,5));}
 if(xLit()){for(const s of[-1,1]){vnLampPost(s*4.5,0,HZ+HW/2+4.5,3.6);vnLampPost(s*4.5,0,34,3.6);vnLampPost(s*3.6,0,GD/2-4,3.6);}}
 vnFolk(0,38,5,4);vnFolk(0,HZ+HW/2+5,3,2);}

XA.def({key:'xa_palace',name:"Sultan's Palace",family:'The Sultan',tags:{type:['civic','military','single-family dwelling'],wealth:'civic',lit:true,landmark:true},w:60,d:56,h:40,fw:52,fd:42,build:buildXaPalace});
XA.def({key:'xa_pleasure_dome',name:'Pleasure Dome',family:'The Sultan',tags:{type:['civic'],wealth:'civic',lit:true,landmark:true},w:94,d:94,h:32,fw:88,fd:88,build:buildXaPleasureDome});
