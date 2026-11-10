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
function buildXaPalace(G,o){reseed(31001+(o.v|0));const V=xV(o),CW=52,CD=42,CH=7,lit=xLit()?'lit':'glass';
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),ochre=xC(xPick(XPAL.ochre)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.dark)),gold=xC(xPick(XPAL.gold)),tile=xC(xPick(XPAL.tile));
 vnReg("Sultan's Palace",0,-4,17,36);vnReg("Sultan's Palace — curtain wall",0,CD/2,8,10,{part:'wall'});vnReg("Sultan's Palace — court",0,10,9,3);
 // the curtain: four walls, four corner towers, the gate iwan in the front wall
 const cx=CW/2-3,cz=CD/2-3;
 xnXECurtain([-cx+3,cz],[-6,cz],CH,stone,1);xnXECurtain([6,cz],[cx-3,cz],CH,stone,1);xnXECurtain([cx-3,-cz],[-cx+3,-cz],CH,stone,1);
 xnXECurtain([-cx,-cz+3],[-cx,cz-3],CH,stone,1);xnXECurtain([cx,cz-3],[cx,-cz+3],CH,stone,1);
 for(const sx of[-1,1])for(const sz of[-1,1]){if(V===2){xnWall(sx*cx,0,sz*cz,6.8,CH+2,6.8,0,stone,'dressed');xnCrenel(sx*cx,CH+2,sz*cz,6.2,6.2,0,1.2,stone,{item:'vStone',pointed:true});xnGiltRoof(sx*cx,CH+2.6,sz*cz,3.4,3.4,0,{frame:1.2,over:.7});}   // v2: square towers under gilt roofs
  else xnXETower(sx*cx,0,sz*cz,3.4,CH+2,stone,tile);}
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
 const UW=20,UD=13,UY=t1-.6+.3;const U=xnStack(0,UY,PZ-1,UW,UD,0,[4.2,3.8],V===1?wash:ochre,'wash');
 xnArcade(0,UY,PZ-1+UD/2*.995,0,UW-2,3.4,5,'xArchM',null,.7,{open:false});
 for(const u of[-7,-3.5,0,3.5,7])xnTibWin(u,UY+4.2+1.1,PZ-1+UD/2*.96-.06,0,.9,1.5,lit,xC(XPAL.saffron));
 for(const s of[-1,1])for(const z of[-3.5,0,3.5]){xnTibWin(s*(UW/2-.06),UY+1.2,PZ-1+z,s*Math.PI/2,.9,1.6,lit,trim);xnTibWin(s*(UW/2*.96-.06),UY+4.2+1.1,PZ-1+z,s*Math.PI/2,.9,1.5,lit,trim);}
 const t2=xnFlatRoof(0,UY+8,PZ-1,U.w,U.d,0,V===1?wash:ochre,{band:true,gold:true,eave:true,eaveC:tim,parapet:.6,corner:'gold'});
 if(V===1){for(const s of[-1,1])xnDome(s*6,t2-.6,PZ-1,3.4,'T',{drum:2.2,drumItem:'xDrumM',drumC:null,c:tile,fin:1.8});xnGiltRoof(0,t2-.6,PZ-1,5,4,0,{frame:1.6,over:.9});}   // v1: a white palace under twin turquoise domes
 else if(V===2){for(const x of[-7,0,7])xnGiltRoof(x,t2-.6,PZ-1,4.8,3.8,0,{frame:1.6,over:.9});}                                                                // v2: three gilt roofs, no dome
 else{xnDome(0,t2-.6,PZ-1,4.2,'T',{drum:2.6,drumItem:'xDrumM',drumC:null,c:tile,fin:2.2});for(const s of[-1,1])xnGiltRoof(s*7,t2-.6,PZ-1,4.4,3.6,0,{frame:1.5,over:.9});}
 // the court between the gate and the palace: paving, a long pool, cypresses, lamps; guard huts inside the gate
 xnPave(0,10,CW-10,14,0,stone,2.4);xnPool(0,.02,10,14,3.2,0,stone);for(const s of[-1,1]){xnCypress(s*10,6,7);xnCypress(s*10,14,7);xnCypress(s*17,10,6);}
 for(const s of[-1,1]){vB('xWashB',s*10,0,cz-5,5,3.2,4,0,wash);xnFlatRoof(s*10,3.2,cz-5,5,4,0,wash,{parapet:.4});vnDoor(s*10,0,cz-3,0,1,2,'vWood',tim,tim,true);}
 if(xLit()){for(const s of[-1,1]){vnLampPost(s*4,0,PZ+D/2+5,3.6);vnLampPost(s*6,0,cz-7,3.6);vnLampPost(s*4,0,cz+5,3.8);}}
 vnFolk(0,10,4,5);vnFolk(0,cz+6,4,3);}
// ---------------------------------------------------------------- the Pleasure Dome and its grounds
// The harem palace of the citadel (settlements/xanadu/citadel/BLUEPRINT.md, E3 and E4), enlarged to the blueprint's 105 x 110 m
// precinct (the owner, 2026-11-09): the Hall of Feasts under the great dome at the head of the chahar bagh, the wings down
// both sides of the garden (the Valide's court, the consorts and the hospital west; the eunuchs, the school, the concubines
// and the baths east), the north range with the Golden Way's door. Outside it keeps the kit's look: whitewash under a gold
// frieze, the mosaic drum, the great dome and its four turrets, the baths' domes with gold oculus bosses, the tiled garden
// wall, its gate and kiosks. Inside it is hollow and walkable, in the black-and-white pattern system (78a-78d: xdomeBuild).
function buildXaPleasureDome(G,o){reseed(31011+(o.v|0));const V=xV(o),GW=XPDOME.GW,GD=XPDOME.GD;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),tim=xC(xPick(XPAL.dark)),gold=xC(xPick(XPAL.gold)),tile=xC(XPAL.turquoise);
 vnReg('Pleasure Dome',0,-20,22,44);vnReg('Pleasure Dome — gardens',0,26,20,3);vnReg('Pleasure Dome — baths',35,32,16,20);vnReg('Pleasure Dome — gate',0,GD/2-2,4,6);
 // the garden wall: whitewash with a tiled coping, an arched gate in the front, kiosks at the front corners
 // (the north range and the Golden Way's door stand through the north wall: it stops either side of them)
 for(const s of[-1,1]){vB('xWashB',s*(GW/2-.3),0,0,.6,2.6,GD,0,wash);vB('xTilesB',s*(GW/2-.3),2.6,0,.9,.22,GD+.3,0,tile);}
 vB('xWashB',0,0,GD/2-.3,GW,2.6,.6,0,wash);vB('xTilesB',0,2.6,GD/2-.3,GW+.3,.22,.9,0,tile);
 for(const q of[[-GW/2,-20.3],[7.3,GW/2]]){vB('xWashB',(q[0]+q[1])/2,0,-GD/2+.3,q[1]-q[0],2.6,.6,0,wash);vB('xTilesB',(q[0]+q[1])/2,2.6,-GD/2+.3,q[1]-q[0]+.3,.22,.9,0,tile);}
 xnDoorway(0,0,GD/2,0,4.4,2.6);xnArch('xArchS',0,0,GD/2+.1,0,6.2,3.4,.8,stone,{open:true});for(const s of[-1,1])vPst('xColS',s*3.4,0,GD/2-.3,.35,3.8,stone);
 for(const sx of[-1,1])xnChhatri(sx*(GW/2-3.2),0,GD/2-3,1.5,3.6,stone,tile,6);
 // the palace: its rooms, walls, stairs and domes
 xdomeBuild(o,{stone,wash,tim,gold,tile});
 // kiosks on the wings' roofs (the roof terraces, E4.15)
 for(const p of[[-44,-45],[-44,43],[44,-45],[44,-2]])xnChhatri(p[0],XPDOME.Y2+.5,p[1],1.5,3.4,stone,tile,6);
 // the chahar bagh between the wings: the long reflecting pool on the axis, parterres and cypress walks either side
 if(V===2){xnPool(0,.02,27,22,36,0,stone);for(const s of[-1,1])for(let k=0;k<8;k++)xnCypress(s*14.5,8+k*5.2,rr(6,8));}   // v2: one great reflecting pool
 else{xnPool(0,.02,28,8,36,0,stone);
  for(const s of[-1,1])xnCharBagh(s*12.6,0,28,12.4,36,0,{channel:1,r:1.5});
  for(const s of[-1,1])for(let k=0;k<8;k++)xnCypress(s*5.4,11+k*4.8,rr(6,8));}
 xnFountain(0,0,50.5,2.2,stone);xnPave(0,5,9,6,0,stone,2.2);
 if(xLit()){for(const s of[-1,1]){vnLampPost(s*4.5,0,4.5,3.6);vnLampPost(s*4.5,0,47,3.6);vnLampPost(s*3.6,0,GD/2-4,3.6);}}
 vnFolk(0,49,5,4);vnFolk(0,5,3,2);}

XA.def({key:'xa_palace',name:"Sultan's Palace",family:'The Sultan',tags:{type:['civic','military','single-family dwelling'],wealth:'civic',lit:true,landmark:true},w:60,d:56,h:40,fw:52,fd:42,build:buildXaPalace});
XA.def({key:'xa_pleasure_dome',name:'Garden Pleasure Dome',family:'The Sultan',tags:{type:['civic'],wealth:'civic',lit:true,landmark:true},w:106,d:112,h:50,fw:105,fd:110,build:buildXaPleasureDome});
