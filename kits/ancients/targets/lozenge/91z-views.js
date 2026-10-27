// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so by the time this runs both builders have been and gone and each has left its
// dimensions — and its own diamond function — in LOZ_SITE. Nothing below is a
// coordinate read off a render.
//
//   ACW(S,x,y,z)   a world point in builder coordinates on site S
//   S.ZY(q,t)      [z,y] ON THE DIAMOND of L1 radius q at profile parameter t
//                  (0 ridge, .5 equator, 1 keel) — the builder's own function,
//                  so a camera aimed at a face follows the face if the cube is
//                  ever resized instead of going stale.
//   S.TWR          the heliport tower: x, z, half-sections hx/hz, top, deck
//   S.PIER         the thirteen piers: x, z, hx, hz, c (keel row), top
//   S.BITE, S.FALL the ruin's broken corner and the pier that failed
//
// THE ONE PIECE OF ARITHMETIC BEHIND HALF OF THESE SHOTS. The camera is 50
// degrees vertical, so a frame is 0.933 x the sight line tall and 1.49 x wide.
// At the owner's quarter height (2026-10-27) the composition is 375 m tall and
// 1 414 m across its diamond: WIDTH sets the stand-off now, 1 000 m for an
// elevation, and FogExp2 at 0.00022 leaves 0.80 of the contrast there.
BUDGET.type.lozenge='mega';
const ACDEF={x:0,z:0,d:0,dd:0,SIDE:1000,RD:707.1067811865476,RH:176.7766952966369,VS:.25,HT:375,
 KY:21.446609406726252,CY:198.22330470336312,HX:500,BR:[707.1,560,430,300,152],
 DPX:[0,24,52,86],APY:373.3,KEY:23.0,VX:414,NWL:7,WWX:40,WDEP:60,WQ:467.1,
 WT0:.036,WT1:.964,TA:.00424,TK:.99576,LEGY:116.4,area:1414000,FTA:.036,FTE:.465,FTD:.56,
 WX:k=>-420+k*140,
 ZY:(q,t)=>[q*(1-Math.abs(2*t-1)),198.22330470336312+.25*q*(1-2*t)],
 TOFY:y=>(1-(y-198.22330470336312)/176.7766952966369)*.5,
 SP:{x:175,w:135,t:.225,th:.12,y0:253,y1:338},
 TWR:{x:-420,z:-380,hx:52,hz:90,top:338,deck:371},
 BITE:{x0:-520,r:400},FALL:{x:420,z:380,h:40},SAG:0,
 PIER:[{x:0,z:380,hx:52,hz:90,c:0,top:116}],
 LEG:[{x:0,z:380,w:52,c:0,top:116}]};
const ACA=Object.assign({},ACDEF,{x:-2600},LOZ_SITE[0]||{});
const ACB=Object.assign({},ACDEF,{x:2600},LOZ_SITE[1]||{});
const ACW=(S,x,y,z)=>[S.x+x,y,S.z+z];
// THE HERO: three-quarter from the south-east, above the ridge, so the farmed
// upper faces read as terraces and both drawings are in it at once — the
// flattened DIAMOND on the east end face and the RECTANGLE of the south flank
// over the five piers.
const ACHERO=S=>ACW(S,1150,520,1500).concat(ACW(S,-60,150,0));
// The two elevations stand off far enough to hold the 1 414 m diamond.
const ACELEV=S=>ACW(S,-1520,S.CY,0).concat(ACW(S,-450,S.CY,0));
const VIEWS={
 'The Lozenge':                ACHERO(ACA),
 // THE FRONT ELEVATION, square on to the west end: the white outer frame, the
 // lattice band, the second frame, the darkening bands and their rings of light
 // round the ribbed bore, the piers underneath, and the heliport tower beside the
 // upper LEFT face, which is where both of Soleri's front elevations put it.
 'The diamond elevation': ACELEV(ACA),
 // THE SIDE ELEVATION, square on from the south: a RECTANGLE 1 000 x 375 — the
 // ridge frieze, the terraces, the equator frieze, living-working in slot bays,
 // the central spine top to bottom and five piers standing on arched feet.
 'The side elevation':    ACW(ACA,0,ACA.CY,ACA.RD+1150)
                           .concat(ACW(ACA,0,ACA.CY,0)),
 // THE PLAN, from high over the south flank: the terraced fields, the wells
 // notching both long sides, the courts at the two civic ends, the spine.
 'The midlevel plan':     ACW(ACA,0,1650,420)
                           .concat(ACW(ACA,0,200,0)),
 // THE TERRACES, close: standing on a tread on the south face, looking along the
 // flight with the risers of homes stepping down to the equator frieze.
 'The terraces':          (function(S){const p=S.ZY(S.RD,.28),q=S.ZY(S.RD,.42);
                            return[S.x-430,p[1]+14,S.z+p[0]+30,
                                   S.x-130,q[1],S.z+q[0]];})(ACA),
 // THE FRIEZES. Raking along the south flank from its west end: the equator
 // frieze's downward triangles in the foreground, the terraces above it.
 'The friezes':           (function(S){const e=S.ZY(S.RD,.5),r=S.ZY(S.RD,.2);
                            return[S.x-760,e[1]+60,S.z+e[0]+320,
                                   S.x+60,(e[1]+r[1])*.5,S.z+(e[0]+r[0])*.5];})(ACA),
 // A LIGHT WELL, looked DOWN the slot from just under the ridge.
 'A light well':          (function(S){const p=S.ZY(S.WQ+30,.13),f=S.ZY(S.WQ,.45);
                            return[S.x+S.WX(2),p[1]+20,S.z+p[0],
                                   S.x+S.WX(2),f[1],S.z+f[0]];})(ACA),
 // THE PIERS, FROM BELOW. Standing in the court between the south row and the
 // keel piers, looking up past the pier heads mitred into the lower faces.
 'The piers from below':  ACW(ACA,300,12,190)
                           .concat(ACW(ACA,-260,90,-60)),
 // A PIER, at a person's height: the arched portal at its foot, people going
 // in, and its slotted wall going up into the underside of the cube.
 'A pier':                (function(S){const L=S.PIER.find(p=>p.x===0&&p.z>0)||S.PIER[0];
                            return[S.x+L.x+150,3,S.z+L.z+L.hz+230,
                                   S.x+L.x,60,S.z+L.z+L.hz];})(ACA),
 // INSIDE THE VOID: on the axis of the bore, looking the length of it, the
 // ribs receding, the terraces in the floor, the bridges across, daylight at
 // the far end 830 m away.
 'The void':              ACW(ACA,330,ACA.CY+4,0)
                           .concat(ACW(ACA,-380,ACA.CY-4,0)),
 // THE CITY CENTRE, the west crater, oblique so the frames, the four steps of
 // the crater, the colonnade and the ring of halls read.
 'The city centre':       ACW(ACA,-900,ACA.CY+120,380)
                           .concat(ACW(ACA,-470,ACA.CY,60)),
 // THE HELIPORT on the top vertex, looked ALONG from 40 m over one end.
 'The heliport':          ACW(ACA,560,ACA.APY+46,10)
                           .concat(ACW(ACA,-340,ACA.APY-1,0)),
 // THE HELIPORT TOWER, from the north-west and above the crown.
 'The heliport tower':    (function(S){const T=S.TWR;
                            return[S.x+T.x-420,T.deck+110,S.z+T.z-360,
                                   S.x+T.x+60,T.top-20,S.z+T.z+40];})(ACA),
 // THE RINGS AT NIGHT: the front elevation after dark.
 'The rings at night':    ACELEV(ACA).concat([1]),
 'Ruined':                ACHERO(ACB),
 // THE BROKEN CORNER: the south vertex of the east end sheared away, the floors
 // sticking out of the fracture, the blocks it came down as.
 'The broken corner':     (function(S){const r=S.BITE.r;
                            return[S.x+1100,S.CY+120,S.z+S.RD+800,
                                   S.x+300,S.CY-30,S.z+S.RD-r*.3];})(ACB),
 // THE SPALL, the cutaway in the south terraces, looked down into.
 'The spall':             (function(S){const P=S.SP,c=S.ZY(S.RD,P.t);
                            return[S.x+P.x+420,c[1]+220,S.z+c[0]+460,
                                   S.x+P.x,c[1]-10,S.z+c[0]-40];})(ACB),
 // THE FALLEN PIER, looked ACROSS: the pieces of a 104 x 180 m pier lying on
 // the plain south-east of its stump.
 'The fallen pier':       ACW(ACB,1300,200,400)
                           .concat(ACW(ACB,560,30,800)),
 // THE FALLEN TOWER: the heliport tower in pieces off the north eave, its crown
 // upside down at the far end, and the stump on the face above.
 'The fallen tower':      (function(S){const T=S.TWR;
                            return[S.x+T.x-600,110,S.z-1250,
                                   S.x+T.x-200,20,S.z-800];})(ACB),
 // THE RUINED ELEVATION, the diamond elevation's own camera on the ruin.
 'The ruined elevation':  ACELEV(ACB),
};
