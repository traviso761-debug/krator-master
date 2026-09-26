// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after
// it, so by the time this runs both builders have been and gone and each has
// left its key dimensions — and its own rB()/BWP()/rS() closures — in LXSITE.
// Nothing below is a hand-picked coordinate read off a render:
//
//   LXP(S,r,th,y)         a world point at polar (r, th) on site S
//   LXAX(S,y)             the body's AXIS at height y — leaned, if S is the ruin
//   LXB(S,th,y,off,dy)    the body's SKIN at bearing th and height y, pushed
//                         `off` metres further out and `dy` up — leaned too
//   LXO(p,th,r,dy)        step r metres on bearing th from a point already got
//
// That matters more here than in most targets because the ruin is TILTED. The
// shroud tip stands 62 m off the axis and every terrace, door and umbilical
// plug moves with it; a preset written against the intact coordinates would
// aim at empty sky on the ruined site. BWP() is the builder's own lean
// transform, so "stand on terrace 1 at bearing 0.2 rad" lands on the deck in
// both variants without either number being written twice.
//
// ON-DECK PRESETS HAVE A GEOMETRY PROBLEM WORTH STATING. Standing at radius R
// on a round building and looking at another point at radius R on bearing
// delta away, the sight line's closest approach to the axis is R*cos(delta/2).
// The first cut stood 7 m off a 92 m body and looked 0.96 rad round: closest
// approach 88.7 m, i.e. THROUGH the wall, and the shot came back as a picture
// of a doorway 2 m from the lens. Every on-deck preset below keeps
// R*cos(delta/2) outside rB(), which is why the deltas are small.
//
// The plan for reading the numbers against: berm 430..566 falling 30..0, apron
// at y=30 out to 430, flame pit floor at y=4 inside r=240, six trenches on
// bearings 0/60/.../300 ending in scoops that crest at y=62 and fall away down
// the berm, twelve hold-downs at r=256, the skirt rim at r=242 floating at
// y=44, seven bells under a thrust plug at y=94, the body 88..600 tapering
// 116.8 -> 58 with terraces at 152/228/304/380/456/532, the gantry collar
// r 268..330 with decks at 316/350/384 on six masts at r=364, six service
// towers at r=450 and three propellant tanks at r=404, and the shroud
// 600..800 (barrel to 660, then ogive) under a pilot mast to 838.
//
// THE RING'S CLEAR OPENING is set by the SKIRT, not the body. Measured off the
// builder's own functions: body max 123.5 including stringers, widest terrace
// 137.6, blast skirt rim 242. At the original CRI=144 the vehicle could not
// have passed its own gantry. CRI=268 clears the skirt by 26 m.
//
// LXSITE is keyed 0/1 for the arcology and 'p0'/'p1' for the empty pads on the
// far row, which are the same ground works from the same seed with no vehicle.
const LXI=LXSITE[0], LXRU=LXSITE[1];
const LXPD=LXSITE.p0, LXPDR=LXSITE.p1;
const LXP=(S,r,th,y)=>[S.x+Math.cos(th)*r,y,S.z+Math.sin(th)*r];
const LXAX=(S,y)=>{const p=S.BWP(0,y,1e-4);return[S.x+p[0],p[1],S.z+p[2]];};
const LXB=(S,th,y,off,dy)=>{const p=S.BWP(th/TAU,y,1);
 const r=Math.hypot(p[0],p[2])+(off||0),a=Math.atan2(p[2],p[0]);
 return[S.x+Math.cos(a)*r,p[1]+(dy||0),S.z+Math.sin(a)*r];};
const LXO=(p,th,r,dy)=>[p[0]+Math.cos(th)*r,p[1]+(dy||0),p[2]+Math.sin(th)*r];
// The hero framing, shared by both variants so the two can be compared, and
// scaled off the structure's own height rather than a chosen distance. Stood
// off perpendicular to the lean bearing: the one line of sight the tilt reads
// along, and the one that puts a mast at each edge of the frame.
const LXHERO=S=>LXP(S,S.STIP*1.60,S.LA+Math.PI/2,S.STIP*.62).concat([S.x,S.STIP*.40,S.z]);
// Standing on a terrace deck, looking along it. Two things are derived rather
// than chosen. The offset is a FRACTION of the deck's own projection (terrace 4
// projects only 8 m, so a flat 10 m put the camera outside its parapet, in
// mid-air), and the fraction is 0.49 — the middle of the 7.5 m walking lane
// the builder leaves between the kiosks at 0.14 of the projection and the kerb
// trough at 0.78. At 0.55 the camera stood inside a planter and the shot came
// back as a green wall; at 0.46, with a narrower lane, it stood in a kiosk.
const LXDECK=(S,ti,th,dth)=>{const Y=S.TERR[ti],o=S.TPR[ti]*.49;
 return LXB(S,th,Y,o,3.4).concat(LXB(S,th+dth,Y,o*1.14,2.8));};
const LXFALL=LXRU.FALLEN?[LXRU.x+LXRU.FALLEN[0],LXRU.FALLEN[1],LXRU.z+LXRU.FALLEN[2]]:[LXRU.x,0,LXRU.z];
const VIEWS={
 // ---- the empty pads on the far row ----------------------------------------
 // The whole site with nothing standing on it: blast table, six trenches and
 // their scoops, the deflector, twelve hold-downs, the masts and the ring.
 'The empty pad':   [LXPD.x-980,470,LXPD.z+1180, LXPD.x,210,LXPD.z],
 // Up through the ring's clear opening, standing INSIDE it where the vehicle
 // would be. Not from the pit floor — the first try put the camera at y=20 on
 // the axis, which is underneath the deflector cone (apex y=50), so it looked
 // up into the deflector's own soffit and saw trench walls. This one stands at
 // r=194, inside the 268 opening and above the deflector, and looks up across
 // to the far side of the ring so the daylight round it reads.
 'Through the ring':[LXPD.x+190,96,LXPD.z+40, LXPD.x-130,430,LXPD.z-24],
 // the pad the vehicle came back down onto, with nothing left on it
 'The derelict pad':[LXPDR.x-980,470,LXPDR.z+1180, LXPDR.x,210,LXPDR.z],
 'Launch Arcology':     LXHERO(LXI),
 // Near-vertical rather than dead vertical: camera.lookAt() with the view
 // direction parallel to world up is a degenerate basis, and the frame rolls.
 'Plan':                [LXI.x+110,1900,LXI.z+110, LXI.x,LXI.APY,LXI.z],
 // Low on the berm at the foot of the table, looking up the whole 838 m. Stood
 // at 330 on the apron — the first try — the gantry ring filled the frame and
 // almost no body was in shot; from 490 the masts foreshorten into the
 // foreground and the vehicle reads from the skirt to the pilot mast. The
 // bearing is 0.22 rad off the spine, because on the spine itself the service
 // tower at r=372 sits 100 m in front of the lens, and at 0.40 the camera is
 // inside the next trench's deflector scoop, which crests 50 m over its head.
 'Up the body':         LXP(LXI,490,LXI.SBEAR(1)+.22,20)
                         .concat(LXAX(LXI,LXI.SY0-60)),
 // the collar, its three decks and one umbilical arm reaching in to the body
 'The gantry ring':     LXP(LXI,430,LXI.SBEAR(2)+.44,LXI.CY0+104)
                         .concat(LXP(LXI,(LXI.CRI+LXI.rB(LXI.CY0+44))/2,LXI.SBEAR(2),LXI.CY0+44)),
 // IN the flame pit, on its floor, looking in at the deflector and up at the
 // seven bells hanging off the thrust plug
 'Inside the base':     LXP(LXI,218,LXI.SBEAR(3),LXI.PITY+26)
                         .concat([LXI.x,74,LXI.z]),
 // down a trench, back toward the throat: the deflector's face is aimed here
 'The flame trench':    LXP(LXI,330,LXI.TBEAR(0),LXI.PITY+11)
                         .concat(LXP(LXI,46,LXI.TBEAR(0),30)),
 'The blast table':     LXP(LXI,1020,LXI.TBEAR(1)+.30,600)
                         .concat([LXI.x,LXI.APY,LXI.z]),
 // The skirt rim floating 14 m clear of its own pad, on twelve clamps. A clamp
 // is 25 m against a 484 m skirt, so a close shot of one is a picture of a box:
 // what is worth seeing is the RELATIONSHIP, half the ring of clamps at once
 // with the dark 14 m slot of daylight running under the rim above them. The
 // camera sits on a 15-degree bearing, midway between a trench (every 60 deg)
 // and a gantry mast (every 60 deg, offset 30) — the only lanes on the apron
 // clear of both. Inside the mast lattice at r=290 is a picture of four posts.
 // The apron is crowded: trenches on every 60 deg, and masts, service towers
 // and propellant spheres all on the 30-deg spines between them. From 420 m out
 // every line of sight to the clamp ring passes through one of them — the shot
 // came back as a picture of a fuel tank. This stands INSIDE the mast ring, in
 // the 6 m lane between the clamp pylons (r 244..268) and the mast feet at 275,
 // and looks 0.62 rad along the ring so three clamps recede under the rim.
 'The hold-downs':      LXP(LXI,270,LXI.TBEAR(1)+.40,52)
                         .concat(LXP(LXI,254,LXI.TBEAR(1)-.22,44)),
 // The main promenade: terrace 1, the widest deck on the body. Bearing 0.35
 // rad, not 0.24: the kiosks stand on (j+0.62)/20 of a turn and 0.24 landed
 // four metres from one of them.
 'The promenade':       LXDECK(LXI,1,.35,.42),
 // Not another on-deck shot: terrace 5 projects 8 m, which is less than a
 // kiosk is deep, so there is no lane to stand in. This one stands AT the
 // parapet 532 m up and looks out and down over the gantry to the pad — the
 // view the city has of the thing it is bolted to.
 // ON AN ACCESS BRIDGE, at the mast end, looking 160 m in to the body. This
 // replaces four failed attempts at "look down off a terrace at the pad": from
 // eight metres above a twenty-metre deck the DECK fills the downward view
 // before the parapet even gets a chance to, and raising the camera far enough
 // to clear both stops it being a view from the terrace at all. The bridge has
 // the thing that a deck does not — open air under it — so the same idea (the
 // city looking at the machine it is bolted to) actually reads here.
 'The access bridge':   LXP(LXI,272,LXI.SBEAR(2),LXI.TERR[0]+3.2)
                         .concat(LXB(LXI,LXI.SBEAR(2),LXI.TERR[0],6,2.0)),
 'The shroud':          LXO(LXAX(LXI,LXI.SY0+95),LXI.LA+2.3,360,44)
                         .concat(LXAX(LXI,LXI.SY0+78)),
 // The spine at 270 deg carries a propellant sphere at r=334 and a service
 // tower at r=372 on the same bearing, with a trunk main running in from them
 // to the pit wall: the one line of sight on which the table reads as plant
 // rather than as paving.
 'Tanks and towers':    LXP(LXI,560,LXI.SBEAR(4)+.46,104)
                         .concat(LXP(LXI,334,LXI.SBEAR(4)+.08,88)),
 'Ruined':              LXHERO(LXRU),
 // along the lean bearing: the sheared clamps, the cratered apron and the
 // buckled mast are all on this side
 'The crushed side':    LXP(LXRU,600,LXRU.LA,170)
                         .concat(LXP(LXRU,236,LXRU.LA,64)),
 // the gash the collar cut into the body as it came down
 'The broken collar':   LXP(LXRU,450,LXRU.LA+.30,LXRU.CY0+66)
                         .concat(LXAX(LXRU,LXRU.CY0+44)),
 // the two lost panels are the 180 deg sector centred on 45 deg, so this looks
 // straight into the payload frame
 'The broken shroud':   LXO(LXAX(LXRU,LXRU.SY0+90),Math.PI/4,360,40)
                         .concat(LXAX(LXRU,LXRU.SY0+72)),
 'The fallen panel':    LXO(LXFALL,LXRU.LA+2.5,230,96).concat(LXFALL),
 // At 4500 the exponential fog (.00022) eats 62% of the contrast and both
 // sites read as ghosts; 3300 still fits the 4.3 km pair across the frame.
 'Both':                [0,1150,3300, 0,300,0],
};
