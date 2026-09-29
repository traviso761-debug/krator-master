// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so both builders have run and left their dimensions in MN_SITE. MNDEF is the
// fallback only if a builder threw.
//
// The camera is 50 degrees vertical, so a frame is 0.933 x the sight line tall.
// The slab is 1 100 m: a whole-height shot stands 1 450-1 500 m off.
const MNDEF={x:0,z:0,d:0,H:1100,AX:-40,AW:88,AS:200,AT:288,YC:1070,EBY:735,PLY:140,DZ0:74,HW0:190,
 OC:[{x:-5,y:905,r:84},{x:72,y:640,r:46},{x:-88,y:470,r:30}]};
const MNA=Object.assign({},MNDEF,{x:-2400},MN_SITE[0]||{});
const MNB=Object.assign({},MNDEF,{x:2400},MN_SITE[1]||{});
const MNW=(S,x,y,z)=>[S.x+x,y,S.z+z];
// THE HERO: three-quarter from the south-west, where the sun is. Both drawings
// at once — the broad south face with its arch and three oculi, and the carved
// west end, edge-on enough to show the slab is a slab.
const MNHERO=S=>MNW(S,-820,430,1260).concat(MNW(S,-10,540,0));
const VIEWS={
 'Monolith':               MNHERO(MNA),
 // THE BROAD FACE square on from the south, 1 450 m off.
 'The broad face':         MNW(MNA,-20,560,1450).concat(MNW(MNA,-20,560,0)),
 // EDGE-ON from the east (the other site is behind the camera): 1 100 m tall
 // and 148 m thick.
 'Edge-on':                MNW(MNA,1450,520,230).concat(MNW(MNA,0,540,0)),
 // THROUGH THE ARCH at eye height, on the road, 420 m out from the face.
 'Through the arch':       MNW(MNA,MNA.AX+6,1.8,MNA.DZ0+490).concat(MNW(MNA,MNA.AX,112,-300)),
 // UNDER THE VAULT, looking up: the coffers, the galleries on both jambs.
 'The arch soffit':        MNW(MNA,MNA.AX+22,6,44).concat(MNW(MNA,MNA.AX-6,MNA.AT,-34)),
 // THE GREAT OCULUS, oblique from the south-east so the bore and rosette show.
 'The great oculus':       (function(S){const o=S.OC[0];return MNW(S,o.x+240,o.y+60,420).concat(MNW(S,o.x,o.y,0));})(MNA),
 // ...and THROUGH it, on its axis: the rim, the bore, the bridge, the sky.
 'Through the oculus':     (function(S){const o=S.OC[0];return MNW(S,o.x+22,o.y+12,300).concat(MNW(S,o.x,o.y-4,-600));})(MNA),
 // THE LOWER OCULI together, the middle one to the east and the low one west.
 'The lower oculi':        (function(S){const a=S.OC[1],b=S.OC[2];const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
                             return MNW(S,cx+120,cy+10,430).concat(MNW(S,cx,cy,0));})(MNA),
 // THE CARVED FLANK: the unclad west end, raking up it from the south-west.
 'The carved flank':       MNW(MNA,-560,170,330).concat(MNW(MNA,-195,420,0)),
 // THE TOP EDGE: the stepped crown, from above and to the south-west.
 'The top edge':           MNW(MNA,-300,1260,420).concat(MNW(MNA,0,1080,0)),
 // NIGHT: the windows of 1 100 m of city.
 'Night':                  MNW(MNA,-660,340,1000).concat(MNW(MNA,-20,500,0)).concat([1]),
 'Ruined':                 MNHERO(MNB),
 // THE BROKEN CROWN: the east quarter gone, the great ring open to the sky.
 'The broken crown':       MNW(MNB,420,1010,760).concat(MNW(MNB,30,880,0)),
 // THE STRIPPED FACE: the orange skin peeled off the south face, the carved
 // white city under it.
 'The stripped face':      MNW(MNB,-330,480,760).concat(MNW(MNB,-60,470,0)),
 // THE FALLEN CORNER lying on the plain to the east, the stump behind it.
 'The fallen corner':      MNW(MNB,800,190,720).concat(MNW(MNB,420,40,40)),
 // THE SPALLED ARCH at eye height: rubble in the passage, coffers down.
 'The spalled arch':       MNW(MNB,MNB.AX+14,5,MNB.DZ0+110).concat(MNW(MNB,MNB.AX,95,-200)),
};
