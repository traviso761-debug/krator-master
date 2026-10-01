// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so by the time this runs both builders have been and gone and each has left its
// dimensions — and its own diamond function — in ARC_SITE. Nothing below is a
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
// This composition is 1 500 m tall: nothing that has to contain the whole of it
// can stand closer than 1 610 m, and FogExp2 at 0.00022 leaves 0.70 of the
// contrast at 1 600. Every full-height view here is therefore hazy by design and
// there is no camera position that is not — the alternative is to crop the cube,
// which for an APOLLONIAN type whose whole subject is its outline would be worse.
const ACDEF={x:0,z:0,d:0,dd:0,SIDE:1000,RD:707.1067811865476,HT:1500,
 KY:85.78643762690485,CY:792.8932188134525,HX:500,BR:[707.1,560,430,300,152],
 DPX:[0,24,52,86],APY:1494,KEY:91.79,VX:414,NWL:7,WWX:40,WDEP:55,WQ:629.3,
 WT0:.036,WT1:.964,TA:.00424,TK:.99576,LEGY:500,area:1414000,FTA:.036,FTE:.465,FTD:.56,
 WX:k=>-420+k*140,
 ZY:(q,t)=>[q*(1-Math.abs(2*t-1)),792.8932188134525+q*(1-2*t)],
 TOFY:y=>(1-(y-792.8932188134525)/707.1067811865476)*.5,
 SP:{x:175,w:135,t:.225,th:.12,y0:1012,y1:1351},
 TWR:{x:-420,z:-380,hx:52,hz:90,top:1262,deck:1293},
 BITE:{x0:-150,r:365},FALL:{x:420,z:380,h:150},SAG:0,
 PIER:[{x:0,z:380,hx:52,hz:90,c:0,top:466}],
 LEG:[{x:0,z:380,w:52,c:0,top:466}]};
const ACA=Object.assign({},ACDEF,{x:-2600},ARC_SITE[0]||{});
const ACB=Object.assign({},ACDEF,{x:2600},ARC_SITE[1]||{});
const ACW=(S,x,y,z)=>[S.x+x,y,S.z+z];
// THE HERO: three-quarter from the south-east at equator height, standing off
// 1 950 m, which frames 1 819 x 2 906 against a composition 1 500 tall and
// 2 414 across its plan diagonal. Both drawings are in it at once — the DIAMOND
// on the east end face and the RECTANGLE of the south flank with its friezes,
// ovals and slots over the five piers — which is the only shot that says what
// this form is.
const ACHERO=S=>ACW(S,1240,830,1500).concat(ACW(S,-30,700,0));
const VIEWS={
 'Arcube':                ACHERO(ACA),
 // THE FRONT ELEVATION, square on to the west end from 1 850 m, which frames the
 // whole 1 500 m: the white outer frame, the lattice band, the second frame, the
 // darkening bands and their rings of light round the ribbed bore, the three
 // broad piers underneath, and the heliport tower beside the upper LEFT face,
 // which is where both of Soleri's front elevations put it.
 'The diamond elevation': ACW(ACA,-2350,760,0)
                           .concat(ACW(ACA,-450,760,0)),
 // THE SIDE ELEVATION, square on from the south. The same cube, and it is a
 // RECTANGLE 1 000 x 1 414 — the triangle frieze under the ridge, residential
 // with its rows of ovals, the equator frieze, living-working in slot bays, the
 // central spine top to bottom and five piers standing on arched feet. The two
 // elevations disagreeing is the whole form.
 'The side elevation':    ACW(ACA,0,ACA.CY-30,ACA.RD+1760)
                           .concat(ACW(ACA,0,ACA.CY-30,0)),
 // THE MIDLEVEL PLAN: 72 degrees of depression, as near a plan as a 50 degree
 // lens can stand off a 1 500 m object. City centre at the west end and cultural
 // centre at the east (the two craters), residential and public between them,
 // light wells notching both long sides, the spine down the middle.
 'The midlevel plan':     ACW(ACA,0,2560,150)
                           .concat(ACW(ACA,0,820,0)),
 // THE FRIEZES. Raking along the south flank from its west end, 450 m off the
 // face: the equator frieze's downward triangles in the foreground, the rows of
 // oval light wells in their dark panels climbing away to the frieze under the
 // ridge, and the spine crossing all of it.
 'The friezes':           (function(S){const e=S.ZY(S.RD,.5),r=S.ZY(S.RD,.2);
                            return[S.x-760,e[1]+120,S.z+e[0]+420,
                                   S.x+60,(e[1]+r[1])*.5,S.z+(e[0]+r[0])*.5];})(ACA),
 // A LIGHT WELL IN SECTION, looked DOWN the slot from just under the ridge.
 'A light well':          (function(S){const p=S.ZY(S.WQ+9,.13),f=S.ZY(S.WQ,.45);
                            return[S.x+S.WX(2),p[1],S.z+p[0],
                                   S.x+S.WX(2),f[1],S.z+f[0]];})(ACA),
 // THE PIERS, FROM BELOW. Standing in the court between the south row and the
 // keel piers, looking up past the pier heads mitred into the lower faces, with
 // the keel spine and the daylight under it running away west.
 'The piers from below':  ACW(ACA,300,26,190)
                           .concat(ACW(ACA,-260,360,-60)),
 // A PIER, at a person's height: the arched portal at its foot, people going
 // in, and 460 m of slotted wall going up into the underside of the cube.
 'A pier':                (function(S){const L=S.PIER.find(p=>p.x===0&&p.z>0)||S.PIER[0];
                            return[S.x+L.x+150,3,S.z+L.z+L.hz+230,
                                   S.x+L.x,150,S.z+L.z+L.hz];})(ACA),
 // INSIDE THE VOID: on the axis of the bore, looking the length of it. 304 m of
 // diamond section, the ribs receding, eight terraces in the floor, five bridges
 // across, and daylight at the far end 830 m away.
 'The void':              ACW(ACA,330,900,0)
                           .concat(ACW(ACA,-380,700,0)),
 // THE CITY CENTRE, the west crater, oblique so the frames, the four steps of
 // the crater, the colonnade and the ring of halls on the innermost boundary all
 // read, with the stepped mouth of the bore.
 'The city centre':       ACW(ACA,-980,1000,420)
                           .concat(ACW(ACA,-470,800,60)),
 // THE HELIPORT on the top vertex, looked ALONG from 40 m over one end.
 'The heliport':          ACW(ACA,560,1546,10)
                           .concat(ACW(ACA,-340,1499,0)),
 // THE HELIPORT TOWER, from the north-west and above the crown: the tower
 // coming up out of the upper north face, the three corbel steps, the deck and
 // its pads, and the ridge deck beyond.
 'The heliport tower':    (function(S){const T=S.TWR;
                            return[S.x+T.x-640,T.deck+170,S.z+T.z-520,
                                   S.x+T.x+60,T.top-70,S.z+T.z+40];})(ACA),
 // THE RINGS AT NIGHT: the front elevation after dark, four diamonds of light
 // round the ribbed bore, the lit piers and the tower's crown.
 'The rings at night':    ACW(ACA,-2350,760,0)
                           .concat(ACW(ACA,-450,760,0),[1]),
 'Ruined':                ACHERO(ACB),
 // THE BROKEN CORNER. The failure that changes the outline: the south vertex of
 // the east end sheared away 365 m deep, the floors of the city sticking out of
 // the fracture, the stacked-floor blocks it came down as, and the whole mass
 // settled three degrees toward the pier that went.
 'The broken corner':     (function(S){const r=S.BITE.r;
                            return[S.x+1250,S.CY+80,S.z+S.RD+980,
                                   S.x+300,S.CY-90,S.z+S.RD-r*.3];})(ACB),
 // THE SPALL, the cutaway high on the south face.
 'The spall':             (function(S){const P=S.SP;
                            return[S.x+P.x+520,P.y1+60,S.z+S.RD-((P.y0+P.y1)*.5-S.CY)+660,
                                   S.x+P.x,(P.y0+P.y1)*.5,S.z+S.RD-((P.y0+P.y1)*.5-S.CY)-40];})(ACB),
 // THE FALLEN PIER, looked ACROSS: four pieces of a 104 x 180 m pier lying on
 // the plain south-east of its stump.
 'The fallen pier':       ACW(ACB,1500,430,250)
                           .concat(ACW(ACB,620,150,880)),
 // THE FALLEN TOWER: the heliport tower on its side 700 m out on the north-west
 // plain, its crown upside down at the far end, and the stump on the face above.
 // QA (arcC): it stood 2 km off and the tower was a sliver in the haze; from
 // 700 m it fills the frame, torn ends and all.
 'The fallen tower':      (function(S){const T=S.TWR;
                            return[S.x+T.x-730,150,S.z-1350,
                                   S.x+T.x-220,40,S.z-850];})(ACB),
 // QA (arcC): THE RUINED ELEVATION, the diamond elevation's own camera on the
 // ruin: the south corner is gone the whole length now, so the diamond has lost
 // a corner, the mass has settled toward the pier that went, and the tower is gone.
 'The ruined elevation':  ACW(ACB,-2350,760,0)
                           .concat(ACW(ACB,-450,760,0)),
};
