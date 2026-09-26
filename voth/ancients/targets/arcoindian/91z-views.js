// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after
// it, so by the time this runs both builders have been and gone and each has
// left its dimensions — and its own face, roof, plinth and terrace functions —
// in AI_SITE. Nothing below is a coordinate read off a render:
//
//   AW(S,x,y,z)      a world point in builder coordinates on site S
//   AP(S,th,r,y)     a world point on the city's own polar plan, so "just
//                    outside terrace 4 at bearing 1.05 rad" lands in the same
//                    place in both variants without the number being written
//                    twice, and follows the lobing when the lobing changes.
//
// The plan to read the numbers against: plain y=0, cliff foot z~-111, rock
// shelf y=226 with its edge near z=-60, plinth deck y=332, tower tops 450/436/
// 424, brow lip y~475 at z~+95, cavern crown y=526, back wall z=-370, plateau
// y=620. The city's centre in plan is (-130,-270); the massif is cut at x=150.
//
// AIDEF is the fallback shape, not a second source of truth: if a builder
// threw, 90-scene.js has already reported it and the presets must still load so
// the error panel can be read instead of a blank page.
const AIDEF={x:0,z:0,d:0,dd:0,XW:-1560,XS:150,CT0:620,SHELF:226,XA:-560,
 PCX:-130,PCZ:-270,PY:332,TY0:230,NT:9,RPL:100,RTE:200,RPLZ:26,RPRM:42,
 crown:526,lip0:475,zb0:-370,area:0,
 TW:[{x:-78,z:-233,r:26,h:118,n:'City centre'},
     {x:-189,z:-246,r:23,h:104,n:'Cultural centre'},
     {x:-134,z:-334,r:20,h:92,n:'Residential'}],
 POD:[{x:-368,z:46,ty:252,pr:32,nm:'Research pod I'},
      {x:-146,z:120,ty:238,pr:29,nm:'Research pod II'},
      {x:74,z:34,ty:258,pr:26,nm:'Research pod III'}],
 HALL:{x0:-46,x1:150,y0:302,y1:452,z0:-700,z1:-460},
 WELL:[{x:64,z:-560,r:12,y0:450,y1:622,cav:false,half:false},
       {x:-120,z:-250,r:14,y0:470,y1:622,cav:true,half:false}],
 ROOMS:[],IMP:{x:-90,z:-220,r:84},
 faceZ:(x,y)=>-120+232*Math.pow(clamp(y/470,0,1),1.35)-34,
 shelfE:x=>-58,roofY:(x,z)=>508,lipY:x=>475,ZB:x=>-370,
 TY:k=>332-k*(102/9),RT:(k,th)=>100+k*(100/9),Rplinth:th=>100};
const AII=Object.assign({},AIDEF,{x:-1650},AI_SITE[0]||{});
const AIR=Object.assign({},AIDEF,{x:1650},AI_SITE[1]||{});
const AW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const AP=(S,th,r,y)=>[S.x+S.PCX+Math.cos(th)*r,y,S.z+S.PCZ+Math.sin(th)*r];
// The first cavern well and the first deep one, by name rather than by index,
// so a change to how many wells there are does not silently re-aim two presets.
const AICW=S=>S.WELL.filter(w=>w.cav).sort((a,b)=>b.z-a.z)[0]||AIDEF.WELL[1];
const AIDW=S=>S.WELL.filter(w=>!w.cav&&!w.half&&w.y0>380)[0]||AIDEF.WELL[0];
// THE HERO: three-quarter from the plain to the south-east, far enough out that
// the cavern, the city in it and all three satellite stacks are in one frame,
// and close enough that the escarpment runs off both edges rather than sitting
// in the middle of the picture as a slab. At 50 deg vertical and 1.6 aspect a
// 985 m sight line frames 919 x 1 468 m.
const AIHERO=S=>AW(S,430,326,600).concat(AW(S,S.PCX-40,292,-210));
const VIEWS={
 'Arcoindian I':        AIHERO(AII),
 // THE SHEET'S ELEVATION: square on to the cavern mouth from the plain, at a
 // height chosen so the sight line to the tower tops passes UNDER the brow. The
 // lip sits at y~475 and the towers at 450 some 220 m behind it, so a camera at
 // 260 crosses the face plane at ~408 and the towers clear it; at 420 they do
 // not, and the first cut came back as a picture of a cliff.
 'The cavern mouth':    AW(AII,AII.PCX,260,520)
                         .concat(AW(AII,AII.PCX,352,-250)),
 // THE SAGITTAL SECTION. The massif ends at x=150 on a master joint, and the
 // cavern, the buried city-centre hall, the chamber levels, a passage and two
 // light wells are all cut by that plane. 640 m off frames 597 m vertically
 // against a 620 m face, and 950 m in z, which reaches from the cliff line back
 // past the hall at z=-700.
 'The section':         AW(AII,AII.XS+700,344,-300)
                         .concat(AW(AII,AII.XS-80,322,-300)),
 // TOP-DOWN FROM INSIDE THE OVERHANG. 512 m is 14 m under the vault crown and
 // above all three towers, so this is genuinely taken from inside the rock
 // roof; 53 degrees of depression, not 90, because lookAt() with the view
 // direction parallel to world up is a degenerate basis and the frame rolls.
 'From under the roof': AW(AII,AII.PCX+10,512,AII.PCZ+120)
                         .concat(AW(AII,AII.PCX-10,300,AII.PCZ-40)),
 // The plinth and the three towers, from the front quarter. 430 m of sight line
 // frames 401 x 641, against a plinth 236 m across and towers topping at 450.
 'The plinth':          AW(AII,AII.PCX+250,404,AII.PCZ+330)
                         .concat(AW(AII,AII.PCX-20,388,AII.PCZ-10)),
 // IN the plaza at deck level, standing in the GAP between two towers: bearing
 // 1.68 rad is the midpoint of the widest of the three, 62 m clear of the
 // nearest tower wall. The first cut stood at 0.30 rad and put the camera 20 m
 // inside the city-centre tower.
 'The promenade':       AP(AII,1.68,62,AII.PY+9)
                         .concat(AP(AII,1.68+Math.PI,40,AII.PY+18)),
 // A TERRACE RISER square on, from 155 m out in the air beyond the stack: the
 // dwellings, their doors, windows, balconies and the stair runs, at a scale
 // where they can be counted. Standing ON the terrace and looking ALONG it does
 // not work — the first cut did, and a chord across a 250 degree polar plan
 // runs straight through three terraces of solid fabric.
 'A terrace':           AP(AII,1.20,AII.RTE+110,AII.TY(4)+10)
                         .concat(AP(AII,1.20,AII.RT(3,1.20)+2,AII.TY(4)+4)),
 // THE STACK from below and outside: nine risers, the shelf buttress under
 // them, and the rock brow over the top of the lot.
 'The terraces':        AW(AII,AII.PCX+70,132,330)
                         .concat(AW(AII,AII.PCX-30,300,-130)),
 // INSIDE the excavated city centre, standing IN its light court and looking
 // DOWN it. The hall's floor plates keep a fixed 17% slot down the middle at
 // every level, so this is the one place in a 150 m stack of storeys a camera
 // can stand. Looking down matters as much as standing in the right place: the
 // plates are pale on top and dark underneath by design, so a camera near the
 // floor looking up sees nine soffits and comes back black, which is what the
 // first cut did.
 'The city centre hall':(function(H){const mz=(H.z0+H.z1)*.5;
   return[AII.x+H.x1-22,H.y0+104,AII.z+mz+6,
          AII.x+H.x0+46,H.y0+40,AII.z+mz-6];})(AII.HALL),
 // A LIGHT WELL over the plinth: the FRONTMOST of the four, stood off 190 m
 // toward the mouth and 56 m up. 199 m of sight line frames 186 m vertically,
 // which is what it takes to get the shaft mouth at ~470 and the pool it lays
 // on the deck at 332 into one picture — from the plaza itself it is 70 m and
 // only one of the two fits. Standing on the OPPOSITE bearing does not work
 // either: behind the plinth there are no terraces, and the first cut of that
 // put the camera 46 m inside the cavern's back wall. The pool is the point —
 // nothing in this kit casts a shadow, so daylight has to be modelled as the
 // light it leaves on the floor.
 'A light well':        (function(W){return[AII.x+W.x+24,AII.PY+62,AII.z+W.z+232,
                                            AII.x+W.x,422,AII.z+W.z];})(AICW(AII)),
 // A SATELLITE POD on its stack, with its causeway running back to the terraces.
 'A satellite pod':     (function(P){return[AII.x+P.x+130,P.ty+86,AII.z+P.z+168,
                                            AII.x+P.x-10,P.ty+18,AII.z+P.z];})(AII.POD[1]),
 // THE CLIFF FOOT: the viaduct along the toe, the station, the inter-city line
 // coming in off the plain, and the three lift towers climbing the 226 m of
 // undercut cliff to the lowest terrace.
 'The cliff foot':      AW(AII,AII.PCX+330,96,330)
                         .concat(AW(AII,AII.PCX-70,104,-64)),
 // From the plateau, over a well collar, looking along the cliff top. The
 // collars are the thing to judge here: a shadowless engine turns any deep void
 // into a bright patch, and these have to read as black holes in stonework.
 'The plateau':         (function(W){return[AII.x+W.x+120,W.y1+92,AII.z+W.z+230,
                                            AII.x+W.x-40,W.y1-30,AII.z+W.z-60];})(AIDW(AII)),
 'Ruined':              AIHERO(AIR),
 // What killed it: a slab off the vault, the bite still in the roof above and
 // the block field lying across the terraces it went through.
 'The roof fall':       (function(I){return[AIR.x+I.x+210,418,AIR.z+I.z+300,
                                            AIR.x+I.x,334,AIR.z+I.z];})(AIR.IMP||AIDEF.IMP),
 // The same section on the ruin, so the two cuts can be compared: the chambers
 // survive almost untouched while everything built in the open has not.
 'The section, ruined': AW(AIR,AIR.XS+700,344,-300)
                         .concat(AW(AIR,AIR.XS-80,322,-300)),
};
