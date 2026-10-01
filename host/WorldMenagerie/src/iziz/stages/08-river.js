// ---------- the river: comes in from the jungle to the north-east and cascades down the chasm wall into the moat ----------
const RIVER={t0:35*Math.PI/180};
RIVER.lat=r=>20*Math.sin(r/41+1)+8*Math.sin(r/19+2);                     // sideways meander, world units
RIVER.dlat=r=>20/41*Math.cos(r/41+1)+8/19*Math.cos(r/19+2);
RIVER.bend=r=>smooth(420,620,r)*(10*Math.PI/180);                          // the upper course swings toward the lake in the corner
RIVER.tc=r=>RIVER.t0+RIVER.lat(r)/r+RIVER.bend(r);                         // centreline angle at radius r
RIVER.hw=ro=>11-3*smooth(80,420,ro);                                       // half-width: wider as it nears the city
RIVER.S=ro=>ro>=46?-1.2+0.002*(ro-46):-9.5+8.3*smooth(39,45,ro);           // water surface: a gentle run, then the falls
