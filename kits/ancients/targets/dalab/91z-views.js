// TARGET: dalab — view presets. First entry is the opening shot.
//
// Every one of these was written for the 110 x 95 m compound and is multiplied
// through by the same K=4.105 the builder uses, because the complex was scaled
// rather than redesigned: the great dome is now 452 x 390 (half the Forest
// Ring's 780 m lantern), the satellites 99..189 in radius, the compound wall at
// ~1200 and the apron out to 1445.
//
// What did NOT scale is the storey height, so the section behind the breach is
// 72 floors at a real 4.6 m pitch where it used to be 17. The close shots are
// therefore pulled in LESS than K: at 4.105 they framed the same fraction of a
// building that now has four times as many floors in it, and the whole point of
// the enlargement is that those floors are countable.
const DK=4.105;
const S=(a)=>[a[0]*DK,a[1]*DK,a[2]*DK,a[3]*DK,a[4]*DK,a[5]*DK];
// pull a close shot in toward its target by f, keeping the aim point
const T=(a,f)=>{const p=S(a);
 return[p[3]+(p[0]-p[3])*f,p[4]+(p[1]-p[4])*f,p[5]+(p[2]-p[5])*f,p[3],p[4],p[5]];};
const VIEWS={
 'The compound':      S([0,300,760,0,60,0]),
 'Great dome':        S([0,120,330,0,70,0]),
 // the breach and the section are the reason the dome was enlarged — 72 storeys
 // of cut-away interior instead of 17 — so these come in to 0.55 of the scaled
 // stand-off rather than sitting back at it
 'The breach':        T([210,90,150,40,55,10],.55),
 'Section':           T([150,70,95,20,45,5],.5),
 // INSIDE, OVER THE STACK. The old stand-in (0.45 of the scaled stand-off) put
 // the camera between two floor plates 4.6 m apart: a slit of floor and soffit.
 // The one open volume inside the dome is above the floor stack (it stops at
 // 0.86 H) and under the crown, so the camera stands there on the break's
 // bearing (1.005 rad) and looks out and down the stepped plate edges.
 'Inside the breach': [120*.536,372,120*.844, 330*.536,200,330*.844],
 // straight up the cut face: 330 m of floor plates stacked in one frame, which
 // is the shot the rescale exists for and did not exist at the old size
 // Explicit metres in the NEW scale, not scaled-up old ones — the first
 // version multiplied coordinates that were already in the new scale and put
 // the aim point at y=944, half a kilometre above a 390 m dome, looking at
 // empty sky. On the break's own bearing (u=.16 -> 1.005 rad), standing off
 // 640 m at mid-height so the whole cut face stacks up in one frame.
 // and aimed HIGH. The bite widens with height — its half-width is
 // w*(.35+.65v), so 14 degrees at the springing and 41 at the crown, and it
 // does not start at all below v=0.10. Aimed at mid-height the inner skin is
 // still nearly closed and fills the frame; the floors only show where the
 // opening is actually wide.
 'The storeys':       [472,340,743, 38,275,59],
 // IN the chamber hall. The scaled-up preset stood outside the dome looking
 // through its opaque shell; the chamber had a floor plate through it and no
 // way in for a camera. It now has a three-storey hall (see sectionInterior's
 // hallR), and the camera stands in it.
 'The chamber':       [40,13,122, 0,4,0],   // off the axis of the radial pipe at k=4
 'Satellite domes':   S([230,80,190,120,30,60]),
 // Beside the passage to dome 2, not inside it: the scaled preset put the
 // camera in the tube. 130 m off its midpoint, square on.
 'A passageway':      [515,40,-15, 479,22,-140],
 'The wall':          S([330,22,190,180,16,80]),
 'From the plain':    S([0,110,900,0,70,0]),
};
