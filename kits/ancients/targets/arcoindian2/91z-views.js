// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after
// it, so by the time this runs both builders have been and gone and each has
// left its dimensions — and its own face, roof, lens and plateau functions — in
// A2_SITE. Nothing below is a coordinate read off a render.
//
//   A2W(S,x,y,z)     a world point in builder coordinates on site S
//   A2FW(S)          the first FULL light well (never one of the half ones on
//                    the joint plane), so a change to how many wells there are
//                    cannot silently re-aim the plateau shot
//
// The plan to read the numbers against: water at y = 6 on the floor of the
// gorge, the cliff toe near z = -240, the cave sill y = 340 with its edge near
// z = -130, the lens 403-507 spanning z = -300 to -70, the ceiling crown 620,
// the brow lip y = 564 at z = +64, the rim plateau 690, the far wall of the
// canyon standing at z = +730 at lens height. The cave's axis is x = 10; the
// massif is cut at x = 150.
//
// ONE GEOMETRIC FACT SETS FOUR OF THESE SHOTS. The cliff overhangs: the lip
// stands at (y 564, z +64) and the middle of the lens at (y 480, z -200), so
// the steepest line of sight that clears the brow from OUTSIDE is
// atan(84/264) = 17.6 degrees of depression, and from INSIDE the hollow the
// ceiling is only ~113 m over the deck, which caps it near 25. There is no
// camera position anywhere that looks down on this city at more than about 25
// degrees. That is the type, not a defect — a half cave has a roof — but it is
// why 'From under the roof' is a low oblique rather than a plan.
//
// A2DEF is the fallback shape, not a second source of truth: if the builder
// threw, 90-scene.js has already reported it and the presets must still load so
// the error panel can be read instead of a blank page.
const A2DEF={x:0,z:0,d:0,dd:0,XW:-1500,XS:150,XA:-560,CT0:690,SILL:340,CROWN:620,
 WSY:6,GFZ:760,LCX:10,LWX:250,DZ:230,LTH:52,LYC:455,DECK:507,NBD:5,
 NX0:-72,NX1:92,NY:445,STX:-14,STZ:-86,STR:27,STY0:176,STY1:431,
 ST:{x:150,z:-214,w:21,y0:342,y1:680},MB:96,MQY:11.5,PLY:27,
 area:0,aLens:0,aGard:0,aQuay:0,lip0:564,zb0:-270,
 WELL:[{x:-100,z:-180,r:14,y0:600,y1:690,half:false,gal:false}],
 GAL:[{y0:352,y1:406,z0:-566,z1:-292,n:'Industries'}],
 IMP:{x:-10,z:-200,r:78},
 faceZ:(x,y)=>-262+400*Math.pow(clamp(y/620,0,1),1.55)-26,
 shelfE:x=>-130,roofY:(x,z)=>600,lipY:x=>564,ZB:x=>-270,
 lz0:x=>-300,lz1:x=>-70,lth:(x,z)=>40,bandY:k=>403+20.8*k,nzB:x=>-188,
 platY:(x,z)=>690};
const AA=Object.assign({},A2DEF,{x:-1800},A2_SITE[0]||{});
const AB=Object.assign({},A2DEF,{x:1800},A2_SITE[1]||{});
const A2W=(S,x,y,z)=>[S.x+x,y,S.z+z];
const A2FW=S=>S.WELL.filter(w=>!w.half)[0]||A2DEF.WELL[0];
// THE HERO: three-quarter from the gorge to the south-east, standing off the
// END of the massif so the master joint reads as a cut face on the right, the
// hollow opens away to the left with the lens hung in it, and the stalk and its
// water shafts run all the way down to the marina in the bottom of the frame.
// 1 017 m of sight line frames 949 x 1 518 m at 50 deg and 1.6 aspect, against
// a composition 690 m tall and about 1 400 m of it worth looking at; the camera
// stays at z = 520 because the far wall of the canyon overhangs to z = 725 at
// this height and anything further out is inside it.
const A2HERO=S=>A2W(S,630,500,520).concat(A2W(S,S.LCX-120,380,-170));
const A2SECT=S=>A2W(S,S.XS+700,470,-262).concat(A2W(S,S.XS-40,452,-272));
const VIEWS={
 'Arcoindian II':       A2HERO(AA),
 // HEAD-ON, as the sheet draws the elevation: square on to the mouth from the
 // middle of the gorge, at the lens's own height so the sight line runs level
 // into the hollow instead of into the brow. 740 m off frames 690 m vertically
 // against a 280 m hollow and 1 104 horizontally against a 710 m one.
 'Head-on':             A2W(AA,AA.LCX,470,560)
                         .concat(A2W(AA,AA.LCX,452,-190)),
 // THE SAGITTAL SECTION. The massif ends at x = 150 on a master joint, and the
 // three excavated galleries, a passage, a light well, the access shaft and the
 // LENS ITSELF are all cut by that plane. The lens is lenticular in (z,y), so
 // its cut face is lens-shaped with the five bands stacked inside it: that is
 // the sheet's own section drawing, built rather than implied. 740 m off frames
 // 690 x 1 104, which reaches from the mouth lip back past the galleries.
 'Sagittal section':    A2SECT(AA),
 // THE CORONAL SECTION. The hollow IS the cut — every cubic metre of rock in
 // front of the back wall over 710 m of cliff has been taken away — so this is
 // taken square on from the gorge, close enough that the rock above and below
 // fills the frame edges and the hollow reads as a slot in a cliff. What makes
 // the BUILDING half of it read as a section rather than an elevation is the
 // sun court: 62 m cut down into the lens's top, its back wall punched band by
 // band with reveals, facing due south at the camera.
 'Coronal section':     A2W(AA,AA.LCX,462,255)
                         .concat(A2W(AA,AA.LCX,452,-215)),
 // THE BIRD'S EYE FROM INSIDE THE OVERHANG. Taken from just under the vault at
 // the eastern end, looking west and down the length of the lens, which is the
 // steepest and widest this composition allows: see the note at the head of this
 // file. 24.7 degrees of depression, 304 m of sight line, framing 283 x 453 m
 // over a lens 490 x 230. The rosettes, the amphitheatre and the court are all
 // in it; a true plan of them is geometrically unavailable.
 'From under the roof': A2W(AA,AA.XS-10,578,-50)
                         .concat(A2W(AA,AA.LCX-185,452,-252)),
 // The lens hung in the hollow, three-quarter from the gorge: the one shot that
 // shows it is SLUNG — daylight under the belly, the stalk going down out of it,
 // rock over the top of the lot.
 'The lens':            A2W(AA,AA.LCX+420,500,330)
                         .concat(A2W(AA,AA.LCX-60,460,-180)),
 // IN the sun court, from over its southern lip. The court is the winter sun
 // trap at building scale and the only place on the deck a camera can stand and
 // see three bands of the lens laid open at once.
 'The sun court':       A2W(AA,AA.LCX+30,540,20)
                         .concat(A2W(AA,AA.LCX,448,-182)),
 // The city-centre amphitheatre against the back wall, with the residential and
 // living rosettes either side of it. 281 m of sight line frames 262 m against a
 // bowl 236 m across; the camera sits 22 m under the vault, which is as high as
 // the ceiling allows.
 'The city centre':     A2W(AA,AA.LCX-34,548,10)
                         .concat(A2W(AA,AA.LCX-34,490,-262)),
 // THE STALK, from out in the gorge and level with the middle of it: LEARNING
 // hanging off the lens's belly, the three water shafts carrying on below it,
 // and 430 m of nothing behind the lot.
 'The learning shaft':  A2W(AA,AA.STX+300,280,430)
                         .concat(A2W(AA,AA.STX-10,250,-90)),
 // The marina on the north bank of the channel, aimed off the CHANNEL rather
 // than off a written z: rivC() wanders +/-96 m, so a camera at a fixed offset
 // is looking at a field half the time. This is the shot that gives the drop its
 // scale — the hulls are 17 m long and the cliff behind them is 690.
 'The marina':          A2W(AA,AA.STX+250,120,AA.MB+300)
                         .concat(A2W(AA,AA.STX-20,26,AA.MB-20)),
 // Looking UP from the water at the overhang, the underside of the lens and the
 // shafts coming down through it. Nothing in this kit casts a shadow, so the
 // soffit is painted dark rather than lit dark, and this is the view that says
 // whether that worked.
 'The gorge floor':     A2W(AA,AA.LCX+60,40,380)
                         .concat(A2W(AA,AA.LCX-20,430,-120)),
 // GARDENS in a fan to one side: the west end of the shelf, where the lens has
 // pinched out and the hollow runs on for another 300 m. The deepest shade in
 // the model.
 'The gardens':         A2W(AA,-320,420,90)
                         .concat(A2W(AA,-390,352,-190)),
 // The rim plateau: the cliff edge, the light-well collars and their spoil, and
 // the water reservoir behind them, aimed off the first full well rather than
 // off a written coordinate. The first cut of this shot looked 520 m PAST the
 // collars into empty tabletop and came back as a picture of a beach; it is now
 // stood off to the west so the collars are in the near field, the reservoir in
 // the far, and the cliff edge across the top of the frame.
 'The rim plateau':     (function(W){return[AA.x+W.x+300,W.y1+180,AA.z+W.z+300,
                                            AA.x+W.x-300,W.y1-30,AA.z+W.z-330];})(A2FW(AA)),
 // TRANSPORTATION: the bridge leaving the cave mouth, from the side, mid-gorge.
 // 633 m of sight line frames 946 m against a 924 m span on three piers.
 'The bridge':          A2W(AA,AA.LCX+390,430,250)
                         .concat(A2W(AA,AA.LCX-230,300,250)),
 'Ruined':              A2HERO(AB),
 // What killed it: a slab off the vault, the bite still in the ceiling above and
 // the block field lying on the deck of the lens it went through.
 'The roof fall':       (function(I){return[AB.x+I.x+230,AB.LYC+150,AB.z+I.z+330,
                                            AB.x+I.x,AB.DECK-10,AB.z+I.z];})(AB.IMP||A2DEF.IMP),
 // The same section on the ruin, so the two cuts can be compared: the galleries
 // in the rock survive almost untouched while the lens hung in the open has not.
 'Sagittal section, ruined': A2SECT(AB),
};
