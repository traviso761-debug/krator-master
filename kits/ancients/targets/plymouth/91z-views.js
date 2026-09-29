// Presets. Nothing here is a measured guess: `PLYM` is filled in by
// src/88-plymouth.js as it places things — the level table, the street, the
// plaza, the assembly hall, the two promenades, the crown and the mast — so
// every camera below is written in the building's own terms ("stand on the deck
// at level 5, two metres inside the parapet, and look along the riser") and
// follows the geometry if a constant in the builder changes.
//
// The half-extents are per LEVEL and per SIDE (xp/xn/zp/zn), because the four
// faces set back at four different rates: a camera placed at a single nominal
// radius would be 60 m inside the building on one face and 60 m off it on
// another. PE() is the one accessor that gets this right.
//
// This fragment loads AFTER 90-scene.js, which is what makes the derivation
// possible at all; the fallback below only matters if the builder threw, in
// which case the error panel is the thing to read, not the screenshots.
const PLVD={lev:[{xp:360,xn:372,zp:260,zn:264},{xp:346,xn:354,zp:250,zn:254}],
 Y:[8,26.5,45,63.5,82,100.5,119,137.5,156,174.5,193,211.5,230,248.5,267],
 street:{y:45,top:137.5,x0:-337,x1:335,roofX1:242},plaza:{x:-267,w:184,x1:-200},
 court:{x0:146,x1:248,z:52,x:197,y:45,top:267},
 cam:{court:[161,38],plaza:[-212,84],street:[120,4],vault:[-16,14],prom:[124,124]},
 civic:{x:-268,r:36,y:45,h:64},crown:{y:267,x:0,z:0,xp:99,zp:51,mast:355,mx:-15,mz:-3},
 prom:[{k:4,y:82},{k:10,y:193}],gone:{a:2.35}};
const PLV=(typeof PLYM!=='undefined'&&PLYM.lev)?PLYM:PLVD;
const PLVX=-ROWS.plymouth.s, PLVR=ROWS.plymouth.s;
// half-extent of level k on a named side, with a fallback for the stub table
const PE=(k,s)=>{const L=PLV.lev[Math.min(k,PLV.lev.length-1)];return L[s];};
const PY=k=>PLV.Y[Math.min(k,PLV.Y.length-1)];
const PC=PLV.crown, PS=PLV.street, PP=PLV.plaza, PH=PLV.civic, PQ=PLV.court||PLVD.court;
// The builder keeps these four spots clear of planting. A camera put anywhere
// else inside the street, the court or the plaza has a good chance of standing
// inside a tree, which no counter reports and only the PNG shows.
const PM=PLV.cam||PLVD.cam;
const PGA=PLV.gone.a, PGC=Math.cos(PGA), PGS=Math.sin(PGA);
// one site-relative preset: camera and target, both written in builder
// coordinates, with only x carrying the site offset (the sites sit along x)
const PV=(bx,c,t)=>[bx+c[0],c[1],c[2],bx+t[0],t[1],t[2]];

const VIEWS={
 // the whole hill from the south-east: 732 m of building, 267 m tall
 'Plymouth':            PV(PLVX,[ 660,360, 760],[ -20,115,   0]),
 // the chamfered north-east corner, low and far, so the fourteen setbacks
 // silhouette against the sky on two faces at once
 'The setback profile': PV(PLVX,[ 520, 78,-470],[ -60,145,  40]),
 // The plan is the argument: a chamfered rectangle, not a disc and not a hexagon.
 // Tilted 17 degrees off vertical rather than straight down, because without
 // shadows a 185 m court reads from directly overhead as a light patch, and this
 // is just enough obliquity to see down into it and into the plaza notch.
 'Plan':                PV(PLVX,[ 300,1150, 150],[   0,110,   0]),
 // looking east into the plaza notch bitten out of the west end
 'The west mouth':      PV(PLVX,[-PE(0,'xn')-450,150, 95],[ PP.x+30, 95, 0]),
 // From over the level-0 terrace at the west lip, 157 m off the hall: the plaza
 // is only 134 x 184 m and the hall is 78 m across, so any camera INSIDE the
 // plaza gives a portrait of the hall and no plaza at all.
 'The great plaza':     PV(PLVX,[-PE(0,'xn')+2, PS.y+47, 96],[ PH.x+4, PS.y+11, -14]),
 // street level, looking west down 670 m of covered street to the lit plaza
 'The Long Deck':       PV(PLVX,[ PM.street[0], PS.y+11, PM.street[1]],[ PP.x-40, PS.y+26, 0]),
 // and east, out from under the barrel vault into the light court
 'Under the vault':     PV(PLVX,[ PM.vault[0], PS.y+9, PM.vault[1]],[ PQ.x, PS.y+58, -4]),
 // on the court floor, 185 m down a shaft of open sky, looking up the east wall
 'The light court':     PV(PLVX,[ PM.court[0], PS.y+8, PM.court[1]],
                              [ PQ.x1-6, PS.y+62, -PQ.z+16]),
 // 120 m off the +z face at level 5, looking along one terrace: the riser, the
 // maisonettes standing on the deck in front of it, and the two terraces below
 'One terrace':         PV(PLVX,[  70, PY(5)+27, PE(4,'zp')+70],
                              [ -60, PY(5)+ 5, PE(4,'zp')- 8]),
 // 40 m off the level-7 face — two storeys and six bays fill the frame
 'A balcony':           PV(PLVX,[  40, PY(7)+11, PE(7,'zp')+34],
                              [  16, PY(7)+ 9, PE(7,'zp')]),
 // the upper promenade: the 34 m terrace at level 10, colonnade and gardens
 'The high promenade':  PV(PLVX,[ PM.prom[0], PY(10)+8, PM.prom[1]],
                              [-160, PY(10)+15, PE(10,'zp')+9]),
 // the working top: plant halls, the tank farm, roof gardens and the mast
 'The crown':           PV(PLVX,[ PC.x+250, PC.y+120, PC.z+230],[ PC.x, PC.y+34, PC.z]),
 // the north elevation flat on: two kilometres of dwelling cells in one frame
 'The north elevation': PV(PLVX,[  30,160,-PE(0,'zn')-520],[ 0,130, 0]),
 'Plymouth ruined':     PV(PLVR,[ 660,360, 760],[ -20,115,   0]),
 // square on the bearing the upper mass slid off
 'The collapsed flank': PV(PLVR,[30+PGC*860,420,PGS*860],[30+PGC*150,190,PGS*150]),
 'The ruined street':   PV(PLVR,[ PM.street[0], PS.y+11, PM.street[1]],[ PP.x-40, PS.y+26, 0]),
};
