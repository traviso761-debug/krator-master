// ================================================================= XANADU — dwellings (package X-A)
// Three tiers of the Sultanate's houses. Poor: rammed earth and raw timber — the Tibetan farmhouse block with the
// animals below and the family above, the hill tenement row, the timber shack. Middle: whitewashed battered houses
// with painted trapezoid windows, a Turkish cumba over the street, a courtyard house with an Indian jharokha, the
// four-storey tenement. Rich: the manor with its gilded roof pavilion and mosaic iwan, the stepped hillside manor
// with a Persian dome, the merchant's konak wrapped in a timber cumba. Electric light on the rich only.
// Seeds 30100–30399.

// ---------------------------------------------------------------- POOR
// A — the earth farmhouse block: stable below, living floor above reached by an outside stair; fodder on the parapet
function buildXaPoorA(G,o){reseed(30101+(o.v|0));const W=8.4,D=7.2,H1=2.7,H2=2.6;
 const earth=xC(xPick(XPAL.earth)).multiplyScalar(rr(.9,1.05)),trim=xC(xPick([XPAL.blue,XPAL.red,XPAL.white])),aged=xC(xPick(XPAL.aged));
 vnReg('Earth farmhouse (poor)',0,0,6.5,H1+H2+2.4);
 vB('xRubB',0,0,0,W+.4,.5,D+.4,0,xC(xPick(XPAL.rubble)));
 const S=xnStack(0,.5,0,W,D,0,[H1,H2],earth,'earth',xC(0x5a4a3a));
 // stable door and a slit window below; the family's windows above, small and black-framed
 vnDoor(-1.6,.5,D/2,0,1.6,1.9,'vWood',aged,aged,true);vnWin(2.4,1.5,D/2,0,.5,.5,'open','xPaint',trim);
 for(const u of[-2.2,2.2])xnTibWin(u,.5+H1+.9,D/2-.2,0,.8,.9,'shut',trim,{valC:xC(XPAL.white)});
 xnTibWin(W/2-.25,.5+H1+.9,-1,Math.PI/2,.7,.8,'open',trim,{noVal:true});
 // the outside stair to the upper door on the +x side, a small landing on posts
 vB('vWood',W/2+.9,.5+H1-.2,2.2,1.8,.2,2.2,0,aged);for(const z of[1.2,3.2])vPst('vPost',W/2+1.7,.5,z,.1,H1-.2,aged);
 xnFlight(W/2+.9,.5,3.3+5.1,0,1.2,H1-.2,'vStone',xC(xPick(XPAL.rubble)));vnDoor(W/2-.2,.5+H1,2.2,Math.PI/2,.9,1.8,'vWood',aged,aged,false);
 const top=xnFlatRoof(0,.5+H1+H2,0,S.w,S.d,0,earth,{parapet:.7,corner:'flag'});
 xnFodder(0,top-.7+.05,S.d/2-.3,S.w-1.2,0);xnFodder(-S.w/2+.3,top-.7+.05,0,.6,0);
 xnPennants([S.w/2-.2,top+2.6,S.d/2-.2],[S.w/2+4,2.8,S.d/2+3.5],9);vPst('vPost',S.w/2+4,0,S.d/2+3.5,.06,2.8,aged);
 xnYak(-3.5,D/2+2.6,.6);vnSacks(2.6,0,D/2+1.4,3);vnFolk(0,D/2+3.4,2,1.5);}
// B — the hill tenement: three narrow earth units of different heights, raw-timber cumbas over the lane, one stair
function buildXaPoorB(G,o){reseed(30111+(o.v|0));const U=[[-5,5,6.2,2],[0,5,6.6,3],[5.2,5.4,6.4,2]];   // [x, w, d, storeys]
 const aged=xC(xPick(XPAL.aged)),trim=xC(xPick([XPAL.red,XPAL.blue,XPAL.turquoise]));
 vnReg('Hill tenement row (poor)',0,0,8.6,10);
 vB('xRubB',0,0,0,16.4,.4,7.2,0,xC(xPick(XPAL.rubble)));
 U.forEach((u,i)=>{const [x,w,d,n]=u;const earth=xC(xPick(XPAL.earth)).multiplyScalar(rr(.88,1.06));const hs=[];for(let k=0;k<n;k++)hs.push(2.5);
  const S=xnStack(x,.4,0,w,d,0,hs,earth,'earth',xC(0x5a4a3a));
  vnDoor(x-w/2+1.1,.4,d/2,0,.9,1.8,'vWood',aged,aged,true);
  xnTibWin(x+w/2-1.3,1.5,d/2,0,.6,.7,'shut',trim,{noVal:true});
  // the cumba on the top storey, boards and raw struts
  const cy=.4+2.5*(n-1);xnCumba(x,cy+.2,d/2*.96,0,w-1.2,2.2,1.1,{item:'vWood',c:aged.clone().multiplyScalar(rr(.9,1.1)),beamC:aged,winC:trim,kind:i===1?'glass':'shut',valC:i===1?null:false});
  const top=xnFlatRoof(x,.4+2.5*n,0,S.w,S.d,0,earth,{parapet:.55,corner:i===1?'flag':null});
  if(i!==1)xnFodder(x,top-.5,-S.d/2+.3,S.w-1,0);});
 // a shared stair up the side of the tallest unit to its roof, sheets and a stovepipe
 xnFlight(8.4,0,3.2,Math.PI/2,1.0,2.9,'vStone',xC(xPick(XPAL.rubble)));vnLadder(8.4,2.9,-1,Math.PI/2,4.2,aged);
 vnChimney(1.2,7.9,-1.5,1.6,.12,true);vnPatch(0,.4,3.4,0,4.4,4.5,2);
 xnPennants([-2.5,7.9,3.2],[2.5,10.2,3.3],8);vnDryingRack(-6,0,5.6,0,3.6);vnWaterButt(3.4,0,4.6,.4,.9);vnFolk(0,5.8,3,2);}
// C — the timber shack on a stone footing: board walls in a pole frame, a lean-to, a cloth awning, a rooftop shelter
function buildXaPoorC(G,o){reseed(30121+(o.v|0));const W=6.4,D=5.2,F=.6,H=2.5;
 const aged=xC(xPick(XPAL.aged)).multiplyScalar(rr(.9,1.1)),cloth=xC(xPick(XPAL.cloth)),rub=xC(xPick(XPAL.rubble));
 vnReg('Timber shack (poor)',0,0,5.2,F+H+3.2);
 vB('xRubB',0,0,0,W+.4,F,D+.4,0,rub);vB('vWood',0,F,0,W,H,D,0,aged);vnFrame(0,F,0,W,H,D,0,aged.clone().multiplyScalar(.85),.1);
 vnDoor(-1.3,F,D/2,0,.9,1.8,'vWood',aged,aged,false);vB('vWood',-1.3,0,D/2+.5,1.4,F,.8,0,aged);
 vnWin(1.6,F+1,D/2,0,.7,.7,'open','vWood',aged,true);vnWin(-W/2,F+1,-1,-Math.PI/2,.6,.6,'shut','vWood',aged);
 vnAwning(1.6,F+1.95,D/2,0,3,1.4,cloth);
 // a flat plank roof held by stones, a low board parapet, a pole-and-cloth shelter on it
 vB('vWood',0,F+H,0,W+.5,.16,D+.5,0,aged);for(let k=0;k<7;k++)kput('vRock',[rr(-W/2+.4,W/2-.4),F+H+.22,rr(-D/2+.4,D/2-.4)],qEuler(rng(),rng(),0),[.3,.2,.28],rub);
 for(const s of[-1,1]){vB('vWood',0,F+H,s*(D/2+.15),W+.5,.4,.08,0,aged);vB('vWood',s*(W/2+.2),F+H,0,.08,.4,D+.5,0,aged);}
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*1.6,F+H+.16,sz*1.4+(-.4),.05,1.9+sz*.2,aged);
 kput('vClothB',[0,F+H+2.0,-.4],qEuler(.1,0,0),[3.8,.05,3.4],cloth.clone().multiplyScalar(.9));
 // lean-to store on the +x side under a salvage sheet, the poorest note
 vnFrame(W/2+1.1,0,-.4,2,2.1,D-1,0,aged,.08);vB('vWood',W/2+2.1,0,-.4,.06,2.0,D-1.2,0,aged);vnShedRoof(W/2+1.1,2.1,-.4,2.2,D-.6,.5,Math.PI/2,'vCorr',null,.25,.08);
 vnWaterButt(-W/2-.6,0,D/2-.6,.36,.9);vnCrate(2.6,0,D/2+1.3,.8,.3);vnDryingRack(-2,0,D/2+2.6,0,3.2);vnFolk(1,D/2+3,2,1.2);}

// ---------------------------------------------------------------- MIDDLE
// A — the whitewashed town house: three battered storeys, painted trapezoid windows, a cumba over the street,
// a corbelled eave, a small tiled pavilion on the roof
function buildXaMidA(G,o){reseed(30201+(o.v|0));const W=9.4,D=8.8,P=.6;
 const wash=xC(xPick(XPAL.wash)),trim=xC(xPick(XPAL.trim)),trim2=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.timber)),stone=xC(xPick(XPAL.stone));
 vnReg('Town house (middle)',0,0,7,P+9.4+3.6);
 xnWall(0,0,0,W+.4,P,D+.4,0,stone,'dressed');
 const S=xnStack(0,P,0,W,D,0,[3.2,3.0,2.9],wash,'wash');
 // door up a short flight, its lintel on corbels and a valance; windows in rows, the ground row barred (shut)
 vnDoor(-1.4,P,D/2,0,1.2,2.2,'vWood',tim,xC(xPick(XPAL.dark)),false);xnFlight(-1.4,0,D/2+1.0,0,1.8,P,'vStone',stone);
 vB('vWood',-1.4,P+2.4,D/2+.12,2.0,.18,.3,0,tim);xnCorbels(-1.4,P+2.4,D/2,0,1.6,4,tim,.6);kput('xValance',[-1.4,P+2.15,D/2+.3],null,[1.9,.5,1],xC(xPick(XPAL.cloth)));
 xnTibWin(2.3,P+1.1,D/2-.06,0,.8,1.1,'shut',trim,{shutters:true});
 for(const u of[-2.6,0,2.6])xnTibWin(u,P+3.2+1.0,D/2-.28,0,.85,1.15,'glass',trim2);
 for(const z of[-2.4,1.2])for(const s of[-1,1])xnTibWin(s*(W/2-.14),P+3.2+1.0,z,s*Math.PI/2,.8,1.1,'glass',trim);
 // the cumba on the top storey, over the street
 xnCumba(0,P+6.2+.15,S.d/2*1.03,0,W-2.2,2.6,1.3,{c:wash,beamC:tim,winC:trim2,valC:xC(xPick(XPAL.cloth))});
 for(const s of[-1,1])xnTibWin(s*(S.w/2-.08),P+6.2+1.0,-1.5,s*Math.PI/2,.8,1.1,'glass',trim);
 const top=xnFlatRoof(0,P+9.1,0,S.w,S.d,0,wash,{eave:true,eaveC:tim,parapet:.6,corner:'pinnacle'});
 xnPavilion(-S.w/2+2.4,top-.6,-S.d/2+2.2,3,2.6,2.4,0,{c:xC(XPAL.red)});
 xnPennants([S.w/2-.3,top+.2,S.d/2-.3],[-S.w/2+.3,top+1.6,S.d/2-.3],10);
 vnPlanter(W/2+1,0,D/2-1.2,1.6,.6,0,tim);vnBarrel(-W/2-.7,0,D/2-1,.35,.9,tim);vnFolk(1.5,D/2+3,2,1.6);}
// B — the courtyard house: an ochre-washed house at the back of a walled court, a jharokha over the court, a gate
// under a little tiled roof, a pool and a fruit tree inside
function buildXaMidB(G,o){reseed(30211+(o.v|0));const CW=17,CD=15,HW=11,HD=7,HZ=-CD/2+HD/2+.6,WH=2.7;
 const ochre=xC(xPick(XPAL.ochre)),wash=xC(xPick(XPAL.wash)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.timber)),stone=xC(xPick(XPAL.stone)),tile=xC(xPick(XPAL.tile));
 vnReg('Courtyard house (middle)',0,HZ,7.5,8.2);vnReg('Courtyard house — court',0,3,7,3.2);
 // the court wall with its tile coping and the gate
 for(const s of[-1,1]){vB('xEarthB',s*(CW/2-.3),0,0,.6,WH,CD,0,ochre.clone().multiplyScalar(.95));vB('xTilesB',s*(CW/2-.3),WH,0,.9,.22,CD+.3,0,tile);}
 for(const s of[-1,1]){const gw=CW/2-2.2;vB('xEarthB',s*(2.2+gw/2),0,CD/2-.3,gw,WH,.6,0,ochre.clone().multiplyScalar(.95));vB('xTilesB',s*(2.2+gw/2),WH,CD/2-.3,gw+.3,.22,.9,0,tile);}
 for(const s of[-1,1])vB('vStone',s*2.2,0,CD/2-.3,.7,WH+.9,.9,0,stone);
 xnArch('xArchS',0,0,CD/2,0,4.4,WH+.6,.7,stone,{open:true});kput('vWood',[-.2,1.4,CD/2-.1],qEuler(0,.3,0),[1.6,2.7,.08],xC(xPick(XPAL.dark)));kput('vWood',[1.1,1.4,CD/2-.15],null,[1.5,2.7,.08],xC(xPick(XPAL.dark)));
 vnGableRoof(0,WH+.9,CD/2-.3,5.8,1.8,.7,0,'xTilesB',tile,.4,'vGableSt',stone);
 // the house: two battered storeys, jharokha over the court, painted windows, a corbel eave
 const S=xnStack(0,0,HZ,HW,HD,0,[3.1,3.0],ochre,'wash');
 vnDoor(0,0,HZ+HD/2,0,1.3,2.3,'vWood',tim,xC(xPick(XPAL.dark)),true);kput('xValance',[0,2.35,HZ+HD/2+.28],null,[2.2,.5,1],xC(xPick(XPAL.cloth)));
 for(const u of[-3.6,3.6])xnTibWin(u,1.0,HZ+HD/2-.05,0,.9,1.2,'glass',trim);
 xnJharokha(0,3.4,HZ+HD/2*.94,0,3.0,2.4,stone,{dome:'T',jaliC:wash});
 for(const u of[-3.8,3.8])xnTibWin(u,4.1,HZ+HD/2-.28,0,.85,1.15,'glass',trim);
 for(const s of[-1,1])xnTibWin(s*(HW/2-.15),4.1,HZ,s*Math.PI/2,.8,1.1,'glass',trim);
 xnFlatRoof(0,6.1,HZ,S.w,S.d,0,ochre,{eave:true,eaveC:tim,parapet:.6,corner:'pinnacle'});
 // the court: paving, a pool, a fruit tree, a bench, pots
 xnPave(0,2,CW-2,CD-HD-2.4,0,stone,2);xnPool(3.5,.02,3,2.4,2.4,0,stone);xnTree(-4,2.5,4.5);
 vB('vWood',-4.5,.4,5.5,2.2,.1,.5,0,tim);for(let k=0;k<4;k++)vPst('vClayPot',-6.2+k*.9,0,-1.5,.28,.5,xC(0x9a5a38));
 xnPennants([-CW/2+.6,WH+.4,-2],[CW/2-.6,WH+.4,-2],12);vnFolk(0,CD/2+2.4,2,1.5);vnFolk(0,3,2,2);}
// C — the tenement: four battered storeys over an arcade of shops, cumbas out over two streets, a stair turret
// with a tiled bulb, washing on the roof
function buildXaMidC(G,o){reseed(30221+(o.v|0));const W=13,D=10,H1=3.6;
 const wash=xC(xPick(XPAL.wash)),trim=xC(xPick(XPAL.trim)),trim2=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.timber)),stone=xC(xPick(XPAL.stone)),tile=xC(xPick(XPAL.tile));
 vnReg('Tenement (middle)',0,0,9,H1+9+4);
 // ground: dressed stone with three shop arches, awnings and goods
 xnWall(0,0,0,W,H1,D,0,stone,'dressed');xnArcade(0,0,D/2*.98,0,W-1.6,H1-.5,3,'xArchS',stone,.6);
 for(let i=0;i<3;i++){const x=-(W-1.6)/2+(W-1.6)*(i+.5)/3;vnAwning(x,H1-.7,D/2+.3,0,3,1.6,xC(xPick(XPAL.cloth)));if(i!==1)vnSacks(x,0,D/2+1,3);else vnCrate(x,0,D/2+1,.8,.2);}
 vnDoor(-W/2,0,-2,-Math.PI/2,1.1,2.2,'vStone',stone,xC(xPick(XPAL.dark)),true);
 // three storeys above, the batter carried through, rows of trapezoid windows
 const S=xnStack(0,H1,0,W,D,0,[3,3,3],wash,'wash');
 for(let k=0;k<3;k++){const y=H1+3*k+1.0,f=S.w/2-.1;for(const u of[-4.2,-1.4,1.4,4.2])if(k!==1||Math.abs(u)>3)xnTibWin(u,y,D/2*.97-.12*k,0,.8,1.1,'glass',k%2?trim:trim2);
  for(const z of[-3,0,3])xnTibWin(W/2*.97-.13*k,y,z,Math.PI/2,.8,1.1,'glass',trim);}
 xnCumba(0,H1+3.15,D/2*.96,0,5.6,2.7,1.3,{c:wash,beamC:tim,winC:trim2,valC:xC(xPick(XPAL.cloth))});
 xnCumba(-W/2*.965,H1+6.15,-1.5,-Math.PI/2,5,2.7,1.2,{c:wash,beamC:tim,winC:trim});
 const top=xnFlatRoof(0,H1+9,0,S.w,S.d,0,wash,{eave:true,eaveC:tim,parapet:.7});
 // stair turret at the back corner, a tiled bulb on it; washing lines; pennants
 const tx=S.w/2-1.6,tz=-S.d/2+1.6;xnWall(tx,H1+9,tz,2.8,3.2,2.8,0,wash,'wash');vnDoor(tx,H1+9.3,tz+1.4,0,.8,1.8,'vWood',tim,tim,false);
 kput('xBulbT',[tx,H1+12.2,tz],null,[1.7,1.9,1.7],tile);vBall('xGold',tx,H1+14.2,tz,.14,xC(XPAL.gold[0]));
 vnDryingRack(-2,top-.7,-1,0,5);vnDryingRack(1,top-.7,2,Math.PI/2,4);
 xnPennants([S.w/2-.4,top+.1,S.d/2-.4],[-S.w/2+.4,top+1.8,S.d/2-.4],12);vnFolk(0,D/2+3.4,4,3);}

// ---------------------------------------------------------------- RICH
// A — the manor: a dressed plinth, three storeys of whitewash, the maroon band with gold roundels, a corbel eave,
// twin jharokhas with gold caps, a mosaic iwan for a door, a gilded roof pavilion; a fountain court in front. Electric.
function buildXaRichA(G,o){reseed(30301+(o.v|0));const W=18,D=13,P=1.3,lit=xLit()?'lit':'glass';
 const wash=xC(xPick(XPAL.wash)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.dark)),stone=xC(xPick(XPAL.stone)),gold=xC(xPick(XPAL.gold));
 vnReg('Manor (rich)',0,0,12,P+11.2+6);vnReg('Manor — fountain court',0,D/2+6.5,7,3);
 xnWall(0,0,0,W+.6,P,D+.6,0,stone,'dressed');vB('vStone',0,P-.14,0,W+.9,.14,D+.9,0,stone.clone().multiplyScalar(1.08));
 const S=xnStack(0,P,0,W,D,0,[3.8,3.6,3.4],wash,'wash');
 // the iwan door, a flight to it
 xnIwan(0,P,D/2*.99,0,5.2,6.2,1.1,wash,{guldasta:true});xnFlight(0,0,D/2+2.2,0,3.2,P,'vStone',stone);
 // windows: tall on the piano nobile, the top row small; jharokhas either side of the iwan on the first floor
 for(const u of[-6.6,-4.2,4.2,6.6])xnTibWin(u,P+1.3,D/2-.06,0,.9,1.6,lit,trim,{shutters:true});
 for(const u of[-6.4,6.4])xnJharokha(u,P+3.8+.4,D/2*.955,0,2.6,2.3,stone,{dome:'G',jaliC:xC(XPAL.white)});
 for(const u of[-2.4,2.4])xnTibWin(u,P+3.8+1.2,D/2*.96-.06,0,.9,1.5,lit,trim);
 for(const u of[-6,-3,0,3,6])xnTibWin(u,P+7.4+.9,D/2*.92-.06,0,.8,1.1,lit,trim);
 for(const z of[-4,-1,2,5])for(const s of[-1,1]){xnTibWin(s*(W/2-.14),P+1.3,z,s*Math.PI/2,.9,1.5,lit,trim,{shutters:true});xnTibWin(s*(W/2*.96-.14),P+3.8+1.2,z,s*Math.PI/2,.85,1.4,lit,trim);}
 const top=xnFlatRoof(0,P+10.8,0,S.w,S.d,0,wash,{band:true,gold:true,eave:true,eaveC:tim,parapet:.7,corner:'gold'});
 xnGiltRoof(0,top-.7,-1,8,5.6,0,{frame:2.2,over:1.1});
 for(const s of[-1,1])xnFlagpole(s*(S.w/2-1.2),top-.6,S.d/2-1.2,4,xC(XPAL.saffron));
 // the fountain court: a low wall with gate piers, paving, a fountain, cypresses, lamps
 const CZ=D/2+6.5;xnPave(0,CZ,22,9,0,stone,2.2);xnFountain(0,0,CZ,2.4,stone);
 for(const s of[-1,1]){vB('vStone',s*11,0,CZ,.5,1.1,9,0,stone);vB('vStone',s*6.3,0,CZ+4.5,9,1.1,.5,0,stone);vB('vStone',s*1.6,0,CZ+4.5,.8,1.9,.8,0,stone);vBall('xGold',s*1.6,2.15,CZ+4.5,.28,gold);
  xnCypress(s*8.6,CZ-3,6.5);xnCypress(s*8.6,CZ+3,6);xnTree(s*4.5,CZ-2.6,4);}
 if(xLit())for(const s of[-1,1])vnLampPost(s*3.6,0,D/2+2.6,3.4);
 vnFolk(0,CZ+1.5,3,2.5);}
// B — the hillside manor: a lower front hall and a taller block behind it raised on a terrace, a loggia of pointed
// arches, a corner tower under a tiled Persian dome, a terraced garden and the stair between the levels. Electric.
function buildXaRichB(G,o){reseed(30311+(o.v|0));const T=3.2,lit=xLit()?'lit':'glass';
 const wash=xC(xPick(XPAL.wash)),ochre=xC(xPick(XPAL.ochre)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.dark)),stone=xC(xPick(XPAL.stone)),rub=xC(xPick(XPAL.rubble)),tile=xC(xPick(XPAL.tile));
 vnReg('Hillside manor (rich)',0,-3,13,T+11+6);vnReg('Hillside manor — garden',-7,6,6,3);
 // the terrace the upper block stands on (in a settlement the hill itself does this), its retaining wall and stair
 xnTerrace(0,0,-5.5,28,15,0,T,rub);xnFlight(4,0,2.3,0,3,T,'vStone',stone);
 // the lower hall in front, on the ground: ochre, two storeys, a mosaic over its door
 {const X=5.5,Z=4.5,W=11,D=7;const S=xnStack(X,0,Z,W,D,0,[3.4,3],ochre,'wash');vnDoor(X-2,0,Z+D/2,0,1.4,2.4,'vWood',tim,tim,true);xnMural('xMosB',X-2,2.55,Z+D/2,0,2.4,1.1);
  for(const u of[1.6,3.8])xnTibWin(X+u,1.2,Z+D/2-.05,0,.9,1.4,lit,trim,{shutters:true});for(const u of[-3.5,-1,1.5,4])xnTibWin(X+u,4.4,Z+D/2-.25,0,.85,1.3,lit,trim);
  xnFlatRoof(X,6.4,Z,S.w,S.d,0,ochre,{eave:true,eaveC:tim,parapet:.6,corner:'gold'});xnPavilion(X+2,6.4+.6-.3,Z-.5,3.2,2.8,2.5,0,{gilt:true,rise:1.2,over:.9});}
 // the upper block on the terrace: three storeys, a loggia of pointed arches along its front, the dome tower
 {const X=-2,Z=-6,W=16,D=10;const S=xnStack(X,T,Z,W,D,0,[3.6,3.4,3.2],wash,'wash');
  xnArcade(X,T,Z+D/2*.99,0,W-2,3.2,5,'xArchS',stone,.7,{open:false});
  for(const u of[-5.6,-2.8,0,2.8,5.6])xnTibWin(X+u,T+3.6+1.1,Z+D/2*.96-.05,0,.9,1.5,lit,trim);
  for(const u of[-6,-3,0,3,6])xnTibWin(X+u,T+7+.9,Z+D/2*.92-.05,0,.8,1.1,lit,trim);
  for(const z of[-3,0,3])xnTibWin(X-W/2*.96+.14,T+3.6+1.1,Z+z,-Math.PI/2,.85,1.4,lit,trim);
  const top=xnFlatRoof(X,T+10.2,Z,S.w,S.d,0,wash,{band:true,gold:true,eave:true,eaveC:tim,parapet:.7,corner:'gold'});
  const tx=X+W/2*.93-2.4,tz=Z-D/2*.93+2.4;xnWall(tx,T+10.2,tz,4.6,3.4,4.6,0,wash,'wash');vB('xFriezeB',tx,T+13.2,tz,4.9,.55,4.9,0);
  xnDome(tx,T+13.8,tz,2.6,'T',{drum:1.8,c:tile,fin:1.6});
  for(const u of[-4,0])xnFlagpole(X+u,top-.6,Z+S.d/2-1.1,3.6,xC(XPAL.red));}
 // the terraced garden west of the hall: cypresses along the terrace edge, a pool, a chhatri on the terrace corner
 xnPave(-7,6,10,8,0,stone,2);xnPool(-7,.02,6,4,3,0,stone);for(const x of[-12.5,-9,-5.5,-2])xnCypress(x,2.2,rr(5,7));
 xnChhatri(-11,T,-1.5,1.4,3.2,stone,tile,6);for(const x of[-13,-8])xnTree(x,-12,4,null,T);
 if(xLit()){vnLampPost(1.5,0,7.5,3.2);vnLampPost(-1,T,2.2,3.2);}vnFolk(0,9.5,3,2.5);}
// C — the merchant's konak: a stone ground storey with a carriage arch, whitewash above, the top storey wrapped in a
// dark timber cumba on two sides under a wide-eaved turquoise-tiled hip roof; a jharokha on the third side, a
// walled garden with a pool. Electric.
function buildXaRichC(G,o){reseed(30321+(o.v|0));const W=15,D=11,H1=3.6,H2=3.4,H3=3.2,lit=xLit()?'lit':'glass';
 const wash=xC(xPick(XPAL.wash)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.dark)),stone=xC(xPick(XPAL.stone)),tile=xC(xPick(XPAL.tile)),gold=xC(xPick(XPAL.gold));
 vnReg("Merchant's konak (rich)",0,0,10,H1+H2+H3+5);vnReg("Merchant's konak — garden",W/2+6,0,5.5,3);
 xnWall(0,0,0,W,H1,D,0,stone,'dressed');xnArch('xArchS',3.2,0,D/2,0,3.8,H1-.2,.5,stone.clone().multiplyScalar(.95),{});
 kput('vWood',[2.6,1.5,D/2+.16],qEuler(0,.25,0),[1.5,2.9,.08],tim);kput('vWood',[3.9,1.5,D/2+.12],null,[1.4,2.9,.08],tim);
 for(const u of[-5.4,-3,-.6])xnTibWin(u,1.2,D/2,0,.9,1.4,lit,trim,{shutters:true,noVal:true});
 const S=xnStack(0,H1,0,W,D,0,[H2,H3],wash,'wash');
 for(const u of[-5.4,-2.7,0,2.7,5.4])xnTibWin(u,H1+1.1,D/2*.98-.05,0,.9,1.5,lit,trim);
 for(const z of[-3.5,-.5,2.5])for(const s of[-1,1])xnTibWin(s*(W/2*.98-.14),H1+1.1,z,s*Math.PI/2,.85,1.4,lit,trim);
 // the cumba wraps the front and the +x side of the top storey
 xnCumba(0,H1+H2+.15,S.d/2*1.02,0,W-1.6,H3-.3,1.4,{c:wash,beamC:tim,winC:trim,valC:xC(xPick(XPAL.cloth)),kind:lit});
 xnCumba(S.w/2*1.02,H1+H2+.15,-.5,Math.PI/2,D-3,H3-.3,1.3,{c:wash,beamC:tim,winC:trim,valC:xC(xPick(XPAL.cloth)),kind:lit});
 xnJharokha(-S.w/2*.98,H1+H2+.6,-1,-Math.PI/2,2.6,2.2,stone,{dome:'G',jaliC:xC(XPAL.white)});
 // the roof: corbel eave, a wide tiled hip with gilt horns, a gold finial
 const y3=H1+H2+H3;xnEave(0,y3-.65,0,S.w,S.d,0,tim,.9);vnHipRoof('xHipT',0,y3+.4,0,S.w,S.d,3.4,0,tile,1.5);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(0,0,sx*(S.w/2+1.1),sz*(S.d/2+1.1),0);kput('xArmG',[p[0],y3+.25,p[1]],qEuler(0,xnCornerYaw(0,sx,sz),0),[1.2,.8,.34],gold);}
 vB('xGoldB',0,y3+3.7,0,S.w-S.d+1,.24,.4,0,gold);for(const x of[-2,0,2])kput('xBulbG',[x,y3+3.9,0],null,[.32,.5,.32],gold);
 // the walled garden on the +x side
 const GX=W/2+6;for(const s of[-1,1]){vB('xWashB',GX,0,s*6,10.5,2.2,.5,0,wash);vB('xTilesB',GX,2.2,s*6,10.8,.2,.8,0,tile);}
 vB('xWashB',GX+5.2,0,0,.5,2.2,12,0,wash);vB('xTilesB',GX+5.2,2.2,0,.8,.2,12.3,0,tile);
 xnPave(GX,0,9,10,0,stone,2);xnPool(GX,.02,0,3.6,5,0,stone);for(const z of[-4,4])xnTree(GX+3,z,4);xnCypress(GX-3,-4,6);xnCypress(GX-3,4,6);
 if(xLit()){vnLampPost(-3,0,D/2+2,3.2);vnLampPost(GX,0,6.8,3.2);}vnFolk(0,D/2+3,3,2.5);}

const XTAG_DW=(wealth,multi)=>({type:[multi?'multi-family dwelling':'single-family dwelling'],wealth,lit:wealth==='rich'});
// fw/fd: the footprint of the house itself (the footing when sited on a slope); w/d include the yard
XA.def({key:'xa_poor_a',name:'Earth farmhouse block',family:'Housing — poor',tags:XTAG_DW('poor'),w:18,d:16,h:8,fw:9.4,fd:8,build:buildXaPoorA});
XA.def({key:'xa_poor_b',name:'Hill tenement row',family:'Housing — poor',tags:XTAG_DW('poor',true),w:20,d:14,h:10.5,fw:17,fd:7.6,build:buildXaPoorB});
XA.def({key:'xa_poor_c',name:'Timber shack',family:'Housing — poor',tags:XTAG_DW('poor'),w:14,d:13,h:6.5,fw:7,fd:5.8,build:buildXaPoorC});
XA.def({key:'xa_mid_a',name:'Town house',family:'Housing — middle',tags:XTAG_DW('middle'),w:14,d:14,h:14,fw:10,fd:9.4,build:buildXaMidA});
XA.def({key:'xa_mid_b',name:'Courtyard house',family:'Housing — middle',tags:XTAG_DW('middle'),w:19,d:19,h:8,fw:17.4,fd:15.4,build:buildXaMidB});
XA.def({key:'xa_mid_c',name:'Tenement',family:'Housing — middle',tags:XTAG_DW('middle',true),w:19,d:16,h:17,fw:13.4,fd:10.4,build:buildXaMidC});
XA.def({key:'xa_rich_a',name:'Manor',family:'Housing — rich',tags:XTAG_DW('rich'),w:26,d:30,h:19,fw:19,fd:14,build:buildXaRichA});
XA.def({key:'xa_rich_b',name:'Hillside manor',family:'Housing — rich',tags:XTAG_DW('rich'),w:32,d:26,h:21,fw:30,fd:24,build:buildXaRichB});
XA.def({key:'xa_rich_c',name:"Merchant's konak",family:'Housing — rich',tags:XTAG_DW('rich'),w:32,d:18,h:15,fw:16,fd:12,build:buildXaRichC});
