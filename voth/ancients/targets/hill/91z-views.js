// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so by the time this runs both builders have been and gone and each has left
// its dimensions in HILL_SITE — including the things that are not constants:
// which levels the route reverses at, where the deepest overhang in the city
// landed, where the landslip took hold, and where the camera stations that were
// kept clear of planting are. Nothing below is a coordinate read off a render.
//
//   HPOL(S,r,th,y)      a world point in polar coordinates about the hill's axis
//   hillPt(S,l,s,dr,dy) a point on level l, s metres along it, dr out from the
//                       back of the plate, dy over the deck level
//   hillOpenP(S,l,s,t,dy) a point in the OPEN part of a terrace — t runs from
//                       the dwelling front (0) to the lip (1) and the height is
//                       the awning's own, droop included. Every terrace preset
//                       uses it: a fraction of the plate's DEPTH is measured
//                       from the back of the plate, which is up to 90 m inside
//                       the building, and that is where the first cut of these
//                       shots put the camera
//
// THE PLAN TO READ THESE AGAINST. The hill's axis is the site origin. Its toe is
// at r=1880 and the plateau rim at r=660, 560 m up. The terrace line is
// y = 885 - 0.5r: level 0's deck is at (r 1650, y 60) and level 110's at
// (r 660, y 555). The ribbon is 280 m wide and its centre wanders 1 100 m along
// the contour while it climbs, sweeping 79 degrees of the hill — which is more
// than can be seen from any one station, so the hero stands off the MIDDLE of
// that sweep and the two ends go oblique.
//
// ONE FACT SETS THE LONG SHOTS. FogExp2 is 0.00022, so transmittance is 0.64 at
// 2 000 m and 0.51 at 3 000. A city 2 km long and 560 m tall cannot be framed at
// 50 degrees from closer than about 2 000 m, so the wide views are hazy by
// construction, not by mistake, and every close view is deliberately under
// 400 m. The same trade is logged against Arcbeam.
//
// HILLDEF is the fallback shape, not a second source of truth: if the builder
// threw, 90-scene.js has already reported it and the presets must still load so
// the error panel can be read instead of a blank page.
const HILLDEF={x:0,z:0,d:0,NL:111,H:560,TW:280,dep:[10,100],vary:[0,0],open:[0,0],
 deckArea:0,plants:0,th0:2.30,thTop:3.43,thHall:2.30,toe:1880,
 hall:{r0:1520,r1:1650,y:60,top:94,th:2.30,w:170,court:1745},
 core:[{x:-700,z:1390,y0:132,y1:184,l:16,s:-92,rad:13}],
 sta:[{l:14,s:-34,open:20,lip:1500,dep:50,face:1480},{l:46,s:96,open:20,lip:1210,dep:50,face:1190},
      {l:73,s:18,open:20,lip:990,dep:50,face:970},{l:99,s:0,open:20,lip:760,dep:50,face:740}],
 awn:{l:52,s:0,over:40},hair:[30,60,80],
 slip:{l0:62,l1:76,th:2.50,r0:966,r1:1092,y0:339,y1:402},
 sum:{y:560,r:660,twr:320,slim:.62,tw:[[0,320],[-277,-160],[277,-160]]}};
const HA=Object.assign({},HILLDEF,{x:-2600},HILL_SITE[0]||{});
const HB=Object.assign({},HILLDEF,{x:2600},HILL_SITE[1]||{});
const HPOL=(S,r,th,y)=>[S.x+r*Math.cos(th),y,S.z+r*Math.sin(th)];
const HMID=S=>(S.th0+S.thTop)*.5;
// A core, seen from `dist` metres further out along its own bearing.
const HCORE=(S,i,dist,dy)=>{const K=S.core[Math.min(i,S.core.length-1)];
 const m=Math.hypot(K.x,K.z)||1;
 return[S.x+K.x*(1+dist/m),K.y0+dy,S.z+K.z*(1+dist/m)];};
const HCOREAT=(S,i,dy)=>{const K=S.core[Math.min(i,S.core.length-1)];
 return[S.x+K.x,K.y0+dy,S.z+K.z];};
// THE HERO: three-quarter from the plain, standing off the middle of the
// ribbon's angular sweep and low enough to look UP the slope. 1 500 m of sight
// line frames 1 400 x 2 240 m at 50 deg and 1.6 aspect, against a hill 3 760 m
// across and 560 tall carrying towers to 870 — so the hill overflows the frame
// sideways and the city fills the middle of it. The first cut stood at 3 150
// and came back as a bald dune with a white thread on it: the terrace band is
// 280 m wide against a hill 3.8 km across, and there is no distance at which
// both read.
const HHERO=S=>HPOL(S,2550,HMID(S)-.35,130).concat(HPOL(S,1250,HMID(S)+.05,330));
// The landslip, from out over the plain at the scar's own bearing.
const HSLIP=S=>HPOL(S,S.slip.r1+820,S.slip.th-.13,S.slip.y1+150)
 .concat(HPOL(S,(S.slip.r0+S.slip.r1)*.5,S.slip.th,(S.slip.y0+S.slip.y1)*.5));
// The summit, from a low oblique over the gap in the tower triangle at 270 deg,
// so all three towers stand clear of the Wheel against the sky.
const HSUM=S=>HPOL(S,1500,Math.PI*1.5,S.sum.y+520).concat([S.x,S.sum.y+80,S.z]);
const VIEWS={
 'The Hill Arcology':    HHERO(HA),
 // THE APPROACH, square on to it: the 655 m ramp off the plain, the forecourt cut
 // into the foot of the city at the head of it, and 500 m of terraces above that.
 // 1 750 m of sight line frames 1 630 m vertically against a composition 560 tall.
 'From the plain':       HPOL(HA,3450,HA.thHall,120)
                          .concat(HPOL(HA,1700,HA.thHall,130)),
 // THE SINUOUS CLIMB, seen side-on: across the ribbon rather than up it, from a
 // radian off the middle of the sweep and at half the city's height, which is
 // the one station where several legs of the snake are in the same frame and the
 // setback between them reads. 2 010 m of sight line; transmittance 0.64.
 'The sinuous climb':    HPOL(HA,2200,HMID(HA)-1.05,420)
                          .concat(HPOL(HA,1050,HMID(HA)+.10,330)),
 // PLAN, at 84 degrees of depression rather than 90. A true zenith view of an
 // unshadowed model is flat — the Plymouth entry in KNOWN_ISSUES logs the same
 // dodge — and 6 degrees is enough to put the stack of lips into relief while
 // still reading as a plan of the meander. 2 810 m of sight line frames 2 620 m
 // against a ribbon about 2 000 m across in plan.
 'Plan':                 HPOL(HA,980,HMID(HA)-.28,3420)
                          .concat(HPOL(HA,1180,HMID(HA)-.16,250)),
 // STANDING ON A TERRACE, at one of the four stations the builder kept clear of
 // planting, looking 130 m along the band: the trough at the lip, the planting
 // spilling over it, the dwelling fronts on the right and the awning of the
 // level above closing the top of the frame.
 'A garden terrace':     hillOpenP(HA,HA.sta[1].l,HA.sta[1].s,.62,1.75)
                          .concat(hillOpenP(HA,HA.sta[1].l,HA.sta[1].s+135,.86,1.2)),
 // AN AWNING FROM BENEATH. Aimed at the deepest overhang the depth field
 // actually produced (HILL_SITE.awn, measured over all 111 terraces x 25
 // stations): where the plate above reaches further out than this one does, the
 // terrace is a slot entirely under it. Anywhere else the facade line follows
 // the edge of the awning above and there IS no underside to stand beneath —
 // which is why this preset asks the builder instead of picking a level.
 'Under the awning':     hillOpenP(HA,HA.awn.l,HA.awn.s,.45,1.7)
                          .concat(hillOpenP(HA,HA.awn.l,HA.awn.s+52,1.0,7.5)),
 // THE CUT. Every terrace ends by butting into the rock wall of the excavation,
 // and this is the shot that says the city is IN the hill and not on it: along a
 // terrace toward its end, with the wall rising out of it.
 'The cut wall':         hillOpenP(HA,HA.sta[2].l,HA.sta[2].s,.50,2.2)
                          .concat(hillOpenP(HA,HA.sta[2].l,HA.sta[2].s>0?134:-134,.4,10)),
 // A HAIRPIN, from the first place the route reverses. Where dS/dl passes
 // through zero the band stops walking sideways, so twenty levels stack over the
 // same ground instead of five and the city is briefly a cliff. 940 m of sight
 // line frames 880 m against a stack about 200 m tall.
 'A hairpin':            (function(S){const l=S.hair[0]||30;
                           return HPOL(S,hillRad(l)+860,hillAng(l)-.30,hillDeckY(l)+150)
                            .concat(hillPt(S,l,0,60,-20));})(HA),
 // A CIRCULATION CORE: five of them rise 52 m through the awnings, which is the
 // only vertical thing in 111 courses of horizontal shell.
 'A circulation core':   HCORE(HA,2,210,42).concat(HCOREAT(HA,2,26)),
 // THE FORECOURT: levels 0-8 cut away over a 170 m window, the five-arch portal
 // at its head, and the city standing on top of the lot. 375 m of sight line
 // frames 350 m against a portal 32 m tall, so the terraces above it fill the
 // upper half of the frame, which is the point of the shot.
 'The forecourt':        HPOL(HA,1980,HA.thHall-.02,110)
                          .concat(HPOL(HA,1620,HA.thHall,210)),
 // INSIDE THE ANTECHAMBER: 130 m deep, 170 wide, a barrel vault to 94, twelve
 // monumental columns and the grand stair up into the city at the back. Taken
 // from just inside the portal at 94 m, which frames 88 x 141 m against a hall
 // 34 m tall.
 'The antechamber':      HPOL(HA,1618,HA.thHall+.012,70)
                          .concat(HPOL(HA,1524,HA.thHall,74)),
 'The summit':           HSUM(HA),
 // ON THE SUMMIT DECK, from the rim at the 30-degree gap: the Wheel on the axis
 // with two of the three towers either side of it and the office row in the near
 // field. 600 m of sight line frames 560 m against a cultural centre 96 m tall.
 'The summit plaza':     HPOL(HA,600,Math.PI/6,HA.sum.y+6)
                          .concat([HA.x,HA.sum.y+70,HA.z]),
 // THE BELVEDERE at the head of the ribbon, looking back down the whole city.
 // 1 020 m of sight line down a 140 m drop — a shallow raking view along the
 // terraces rather than across them.
 'The belvedere':        HPOL(HA,HA.sum.r+46,HA.thTop,HA.sum.y+3)
                          .concat(hillOpenP(HA,104,-70,.6,-4)),
 'Ruined':               HHERO(HB),
 // WHAT KILLED IT: fifteen levels gone in one slip, the scar behind them, and
 // the spoil on whichever terraces happened to lie under it.
 'The landslip':         HSLIP(HB),
 // The same terrace station as 'A garden terrace', on the ruin, so the two can
 // be compared directly.
 'The ruined terraces':  hillOpenP(HB,HB.sta[1].l,HB.sta[1].s,.50,1.75)
                          .concat(hillOpenP(HB,HB.sta[1].l,HB.sta[1].s+120,.42,2.2)),
};
