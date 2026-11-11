// ================================================================= HOST — the views: the Cave of Crystals (station 1)
// From the hold's door into the great chamber, among the beams by the feeder well, down the well, up a vent, the bladed floor, the west crystal
// chamber, the hold's hall, and the massing from above. stations/hold replaces this file.
const VIEWS=(function(){const V={},HC=SITE.hold.storeys[1].chambers,north=CAVE.chambers.find(c=>c.id===Object.keys(HC)[0]);
 const toN=unit([FX,FZ],[north.c[0],north.c[2]]),R=F0.rx;
 {const e=eyeAt(FX+toN[0]*R*.78,FY+2.2,FZ+toN[1]*R*.78);V['The Cave of Crystals']=[e[0],e[1],e[2],FX-toN[0]*R*.3,FY+7,FZ-toN[1]*R*.3];}
 {const W=CAVE.wells.find(w=>Math.hypot(w.c[0]-FX,w.c[1]-FZ)<20)||CAVE.wells[0],e=eyeAt(W.c[0]+toN[1]*14,FY+1.7,W.c[1]-toN[0]*14);
  V['Among the beams']=[e[0],e[1],e[2],W.c[0]-toN[1]*10,FY+9,W.c[1]+toN[0]*10];
  const e2=eyeAt(W.c[0]+W.r+2.2,W.mouth+2.4,W.c[1]+.5);V['The feeder well (55 degC water below)']=[e2[0],e2[1],e2[2],W.c[0],W.level,W.c[1]];}
 if(CAVE.throats.length){const T=CAVE.throats[0],e=eyeAt(T.c[0]+9,FY+1.8,T.c[1]+7);V['Daylight down the vent']=[e[0],e[1],e[2],T.c[0],T.ground,T.c[1]];}
 {const e=eyeAt(FX-toN[0]*R*.45+3,FY+1.5,FZ-toN[1]*R*.45);V['The bladed floor']=[e[0],e[1],e[2],e[0]+toN[0]*7,FY+.2,e[2]+toN[1]*7];}
 {const W2=CAVE.hot.find(c=>c.id!==F0.id);if(W2){const u=unit([W2.c[0],W2.c[2]],[FX,FZ]),e=eyeAt(W2.c[0]+u[0]*W2.rx*.75,W2.c[1]+2,W2.c[2]+u[1]*W2.rz*.75);
  V['The west crystal chamber']=[e[0],e[1],e[2],W2.c[0],W2.c[1]+5,W2.c[2]];}}
 {const u=unit([north.c[0],north.c[2]],[FX,FZ]),e=eyeAt(north.c[0]+u[0]*north.rx*.6,north.c[1]+1.7,north.c[2]+u[1]*north.rz*.6);
  V['The hold\'s hall (reserved, empty)']=[e[0],e[1],e[2],north.c[0]-u[0]*north.rx,north.c[1]+4,north.c[2]-u[1]*north.rz];}
 V['The hold\'s massing (from above)']=[FX+40,SITE.ground(FX,FZ)+150,FZ+170,FX-40,FY,FZ-30];
 return V;})();
