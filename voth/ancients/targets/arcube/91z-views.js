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
 WT0:.036,WT1:.964,TA:.00424,TK:.99576,LEGY:500,area:1414000,
 WX:k=>-420+k*140,
 ZY:(q,t)=>[q*(1-Math.abs(2*t-1)),792.8932188134525+q*(1-2*t)],
 TOFY:y=>(1-(y-792.8932188134525)/707.1067811865476)*.5,
 SP:{x:175,w:135,t:.225,th:.12,y0:1012,y1:1351},
 LEG:[{x:-460,z:-672,w:34,c:1,top:757.8},{x:460,z:672,w:34,c:1,top:757.8}]};
const ACA=Object.assign({},ACDEF,{x:-2600},ARC_SITE[0]||{});
const ACB=Object.assign({},ACDEF,{x:2600},ARC_SITE[1]||{});
const ACW=(S,x,y,z)=>[S.x+x,y,S.z+z];
// THE HERO: three-quarter from the south-east at equator height, standing off
// 1 950 m, which frames 1 819 x 2 906 against a composition 1 500 tall and
// 2 414 across its plan diagonal. Both drawings are in it at once — the DIAMOND
// on the west end face and the RECTANGLE of the south flank with its seven slots
// — which is the only shot that says what this form is.
const ACHERO=S=>ACW(S,1240,830,1500).concat(ACW(S,-30,700,0));
const VIEWS={
 'Arcube':                ACHERO(ACA),
 // THE FRONT ELEVATION, square on to the west end from 1 650 m, which frames
 // 1 539 m against a diamond 1 414 tall. Four concentric rings of light round a
 // black bore: the sheet's own elevation drawing, built rather than implied.
 'The diamond elevation': ACW(ACA,-2110,ACA.CY,0)
                           .concat(ACW(ACA,-450,ACA.CY,0)),
 // THE SIDE ELEVATION, square on from the south. The same cube, and it is a
 // RECTANGLE 1 000 x 1 414 — residential above the equator cornice, living-
 // working below it, cut top to bottom by the seven light wells. The two
 // elevations disagreeing is the whole form.
 'The side elevation':    ACW(ACA,0,ACA.CY-30,ACA.RD+1760)
                           .concat(ACW(ACA,0,ACA.CY-30,0)),
 // THE MIDLEVEL PLAN: 72 degrees of depression, as near a plan as a 50 degree
 // lens can stand off a 1 500 m object. City centre at the west end and cultural
 // centre at the east (the two craters), residential and public between them,
 // light wells notching both long sides, vertical structure at the corners.
 'The midlevel plan':     ACW(ACA,0,2560,150)
                           .concat(ACW(ACA,0,820,0)),
 // A LIGHT WELL IN SECTION. The first cut of this shot stood square to the face
 // 425 m off, which is the right way to photograph a wall and the wrong way to
 // photograph a slot: 40 m of well in a 634 m frame came back as a dark stripe
 // among six others. This one hangs 60 m off the face just under the ridge and
 // looks DOWN the slot to the equator, so the mouth is 55 m away and fills half
 // the frame, and the two side walls, their galleries and the floor 55 m in all
 // run away from the camera. A slot photographed along its own length is the only
 // way its section reads.
 'A light well':          (function(S){const p=S.ZY(S.WQ+9,.13),f=S.ZY(S.WQ,.45);
                            return[S.x+S.WX(2),p[1],S.z+p[0],
                                   S.x+S.WX(2),f[1],S.z+f[0]];})(ACA),
 // THE LEGS, FROM BELOW. Standing under the belly looking up the line of the
 // keel: 86 m of daylight over your head, the keel spine running away, the
 // raking struts and the six belly legs, and the west corner leg going up past
 // all of it to the equator vertex 758 m up.
 'The legs from below':   ACW(ACA,240,26,540)
                           .concat(ACW(ACA,-260,420,-60)),
 // THE KEEL, looked along from under the west end.
 'The keel':              ACW(ACA,-760,116,150)
                           .concat(ACW(ACA,240,92,0)),
 // INSIDE THE VOID: on the axis of the bore, looking the length of it. 304 m of
 // diamond section, eight terraces in the floor, five bridges across, and
 // daylight at the far end 830 m away.
 'The void':              ACW(ACA,330,900,0)
                           .concat(ACW(ACA,-380,700,0)),
 // THE CITY CENTRE, the west crater, oblique so the four steps of the crater and
 // the ring of halls on the innermost boundary all read.
 'The city centre':       ACW(ACA,-980,1000,420)
                           .concat(ACW(ACA,-470,800,60)),
 // THE CULTURAL CENTRE: the colonnade. A ring of deep arches all the way round
 // the diamond at q = 430, which is the one feature of the front elevation that
 // needs no shadow to read, because it is a ring of black holes.
 'The cultural centre':   ACW(ACA,760,930,340)
                           .concat(ACW(ACA,430,820,110)),
 // THE LONG FLANK, raking: the equator cornice running 1 000 m away from the
 // camera with the loggia lines above and below it and the slots cutting across.
 'The long flank':        ACW(ACA,-620,880,1020)
                           .concat(ACW(ACA,300,780,300)),
 // THE HELIPORT on the top vertex, 1 500 m up.
 // THE HELIPORT, looked ALONG. Standing off to the side and above it puts a
 // 920 x 52 m deck edge-on in the middle of an empty sky; from 40 m over the deck
 // at one end the pads, the hangars, the control block and the mast run away down
 // the ridge with both upper faces falling off either side, 1 500 m up.
 'The heliport':          ACW(ACA,560,1546,10)
                           .concat(ACW(ACA,-340,1499,0)),
 // THE ARRIVAL PLAZA at the west end, which is the only place in the composition
 // where a person-sized thing stands next to the whole 1 500 m of it.
 'The plaza':             ACW(ACA,-1330,150,430)
                           .concat(ACW(ACA,-700,120,0)),
 'Ruined':                ACHERO(ACB),
 // THE SPALL. The one cutaway in this type, and the reason it can work where
 // four others in this kit could not: there is a kilometre of solid city behind
 // the face, and fifteen floor plates, their soffits, the partition fins and a
 // liner 120 m back have been modelled into it.
 'The spall':             (function(S){const P=S.SP;
                            return[S.x+P.x+520,P.y1+60,S.z+S.RD-((P.y0+P.y1)*.5-S.CY)+660,
                                   S.x+P.x,(P.y0+P.y1)*.5,S.z+S.RD-((P.y0+P.y1)*.5-S.CY)-40];})(ACB),
 // and the leg that failed, with 430 m of vertical structure lying across the
 // plain where it fell.
 // ACROSS the fallen shaft, not along it: it came down on a south-east bearing
 // and the first two cuts of this shot stood on that same bearing, so 459 m of
 // vertical structure came back as one block pointing at the lens.
 'The fallen leg':        ACW(ACB,1500,430,250)
                           .concat(ACW(ACB,620,150,880)),
};
