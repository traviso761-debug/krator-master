// Presets, DERIVED rather than typed. 89z-rows.js loads before 90-scene.js and
// this file after it, so by the time these run buildForestRing has published
// its plan in RINGPLAN: the torus radii and deck heights, the band feet, heads
// and arcade radii, the hoop levels and the bearing of the ruin's collapsed
// sector. Every camera below is therefore written as "stand on torus 0 at
// bearing 0.12, six metres over the soil" and lands there even when the plan
// moves — which it did once already, when the crown was re-cut to put forest
// at the rim, and not one of these needed re-aiming by hand.
//
// TWO THINGS LEARNED FROM THE FIRST SET OF SHOTS, both of which are geometry
// facts rather than taste:
//   * A STEPPED CROWN CANNOT BE SEEN INTO FROM THE SIDE. Band 0 climbs 32 m
//     over 44 m of radius, so the sight line into torus 1 is blocked below
//     36 degrees of depression. Anything meant to show more than the outermost
//     ring has to be at least that far above it: 'The crown' is, 'Forest Ring'
//     deliberately is not.
//   * A CAMERA AT A FEATURE'S OWN RADIUS IS INSIDE THE FEATURE. The first
//     'The arcade' stood at exactly the pier radius and came back as a wall of
//     one colour. On-deck presets are offset off the thing they look at.
//
// The fallback literal is the plan as built on the day; it exists so that if
// the builder throws, the error panel shows the builder's stack rather than a
// cascade of "RINGPLAN is null" from the camera fragment.
const RP=(typeof RINGPLAN!=='undefined'&&RINGPLAN)||{
 RFOOT:292,RW:404,RSH:336,HB:600,YW:240,RPL:520,PLY:18,RAT:34,FRA:2.30,CY0:600,NTER:2,
 LANY:696,LANR:72,LDR:48,LANTOP:780,HOOPY:[111,240,347,459,538],RHEAD:[240,152,56],
 WY:300,WR0:560,WR1:720,WDK:80,BRO:Math.PI/24,NBRG:4,BRW:17,WB0:568,WB1:636,WF0:644,WF1:714,WST:602,WA:1.00,
 RING:[{r0:292,r1:336,y:600},{r0:204,r1:248,y:632},{r0:116,r1:160,y:664}],
 BAND:[{rf:292,rh:248,y0:600,y1:632},{rf:204,rh:160,y0:632,y1:664},
       {rf:116,rh:72,y0:664,y1:696}]};
const RGX=-ROWS.ring.s, RGR=ROWS.ring.s;              // intact site, ruined site
const RG0=RP.RING[0], RG1=RP.RING[1], RG2=RP.RING[2];
const RB0=RP.BAND[0], RB1=RP.BAND[1], RB2=RP.BAND[2];
// a point at radius rn on bearing th, y metres up, on the site whose centre is bx
const RPT=(bx,rn,th,y)=>[bx+Math.cos(th)*rn,y,Math.sin(th)*rn];
const RAIM=(bx,r1,t1,y1,r2,t2,y2)=>RPT(bx,r1,t1,y1).concat(RPT(bx,r2,t2,y2));
const RMID=R=>(R.r0+R.r1)*.5;
// band b's terrace k: the radius of the walkway in front of the dwellings —
// the blocks are 9-13 m deep off the back of the 22 m tread and their balcony
// rails reach 17.6 m, so 19 m out from the back of the tread is the only place
// on it a camera can stand without being inside something.
const RTER=(B,k)=>({r:lerp(B.rf,B.rh,(k+1)/RP.NTER)+19,
                    y:B.y0+(B.y1-B.y0)*(k+1)/RP.NTER});
const RT1=RTER(RB1,0);
const VIEWS={
 // the whole barrel, three quarters on. Low enough that the mass reads and the
 // outer torus breaks the skyline; the crown's inner rings are not visible from
 // here and are not meant to be.
 // pulled back from 1356 m to fit the wheel: it is 1440 m across, and at 50 deg
 // of vertical FOV on a 1.6 aspect the half-width is 0.746 of the distance
 'Forest Ring':        [RGX-720,RP.HB,1300, RGX,330,0],
 // straight down: three circles of canopy, three bands of terrace between them,
 // and the eight radial stairs cutting all three bands on the same bearings
 // raised from CY0+1360 once the wheel went in: at that height the 1440 m rim
 // filled 93% of the vertical frame and clipped top and bottom
 'Plan from overhead': [RGX+2,RP.CY0+1800,2, RGX,RP.CY0,0],
 // low and far, so the waist reads against the sky: r 292 at the foot, 404 at
 // the waist (y=214), 336 at the shoulder (y=520)
 // The wheel sits at the barrel's own mid-height and is wider than it, so from
 // ANY camera below y=300 its near rim crosses the belly and there is no low
 // angle left that shows the whole profile. Solving for the sight line that
 // clears the outer rim: with the eye at 350 the ray to the waist crosses the
 // wheel's plane at r=865 and the ray to the foot at r=1105, both outside 720,
 // so the entire silhouette is clear from just above the deck.
 'The barrel':         [RGX+1100,RP.WY+50,595, RGX,RP.YW+150,0],
 // looking ALONG torus 0 from just over its canopy. At eye level on the deck
 // the camera stands inside a 21 m tree; 26 m up it looks down the band.
 'The outer forest':   RAIM(RGX,RMID(RG0)+3,.12,RG0.y+26, RMID(RG0)-4,1.30,RG0.y+7),
 // the living band between torus 0 and torus 1: three terraces of dwellings
 // climbing 32 m out of the trees to the arcade at its head
 'A living band':      RAIM(RGX,RG0.r0+34,1.55,RG0.y+36, (RB0.rf+RB0.rh)*.5,2.22,RB0.y0+17),
 // standing ON a band, on the walkway of the middle terrace, looking along the
 // row past the balconies
 'The terraces':       RAIM(RGX,RT1.r,1.92,RT1.y+4, RT1.r-2,2.74,RT1.y+3),
 // along band 0's head colonnade, standing on the promenade the planting is
 // held back from. Eye level: the piers are 12 m and the point is to walk it.
 // RHEAD+5 is the clear strip of promenade in FRONT of the piers: the arcade
 // is 4.3 m deep and 2 m in from the planting edge, so this is the one radius
 // on the walk that is neither soil nor stone.
 'The arcade':         RAIM(RGX,RP.RHEAD[0]+5,.60,RG1.y+5, RP.RHEAD[0]+4,1.44,RG1.y+6),
 // torus 1, torus 2, band 2 and the lantern, from high enough to see over the
 // 36-degree terrace banks
 'The inner rings':    [RGX+430,RP.LANY+430,430, RGX,RP.LANY-24,0],
 // the projecting gallery at the barrel's widest point
 'The waist gallery':  RAIM(RGX,RP.RW+74,.28,RP.YW+34, RP.RW+14,1.12,RP.YW+2),
 // in under the belly: the overhang is 112 m, so the whole arcaded foot stands
 // in its own shade
 'The arcaded foot':   RAIM(RGX,RP.RPL-42,2.55,30, RP.RFOOT+8,3.15,RP.PLY+24),
 // 48 degrees of depression, which is what it takes to see all three toruses
 'The crown':          [RGX+560,RP.CY0+900,560, RGX,RG1.y,0],
 'The lantern':        RPT(RGX,210,1.95,RP.LANTOP+40).concat([RGX,RP.LANY+34,0]),
 // up the 598 m shaft from the plaza on the plinth
 'The atrium':         [RGX+22,RP.PLY+22,13, RGX,RP.LANY-46,0],
 'The ruin':           [RGR-720,RP.HB,1300, RGR,330,0],
 // the wheel from above and outside, so the spokes and the two rims read
 'The wheel':          [RGX+1180,RP.WY+760,1180, RGX,RP.WY+30,0],
 // standing in the street of the town on the inner rim, 300 m up
 'The wheel town':     RAIM(RGX,RP.WST,1.20,RP.WY+5, RP.WST-2,2.02,RP.WY+6),
 // From outside the rim, looking up at 34 degrees: the half-torus curving
 // overhead, the spokes behind it, the barrel above. Aimed from the plinth at
 // the hub instead, the tube was entirely behind the camera.
 'Under the wheel':    RAIM(RGX,880,.50,20, 540,.50,RP.WY-40),
 // the collapsed sector, seen down its own bearing
 'The breach':         RAIM(RGR,1150,RP.FRA,780, 140,RP.FRA,RG1.y-18),
 // close in on the tear, where the crown's twelve cutaway floors and the
 // partitions between them are showing
 // 38 degrees of depression, not 7: horizontal floor plates seen edge-on are
 // twelve lines, and seen from above they are twelve floors
 // Looking ALONG the wedge, nearly level with the middle of the floor stack —
 // not down into it. The previous preset sat at CY0+280 and dropped 38 degrees
 // to its target, which shows the floor of the slot and its rubble; the twelve
 // plates are in the slot's SIDE faces, and from above you see none of them.
 // The eye at CY0+58 is mid-stack (the plates run CY0..CY0+96 at 8 m centres)
 // and clears the crown rim at r=354/y=CY0 on the way in.
 'The section':        RAIM(RGR,540,RP.FRA,RP.CY0+58, 90,RP.FRA,RP.CY0+46),
 // On the deck of one, at eye level, looking out at the town on the rim. The
 // span runs r 396..567; the barrel's 48 stave ribs stand proud to r*1.030,
 // which at this height is 414, so 432 is the first radius clear of them.
 'A bridge':           RAIM(RGX,432,RP.BRO,RP.WY+3.5, 556,RP.BRO,RP.WY+5),
 // over torus 0 where the forest has taken it, on the edge of the breach. Well
 // clear of the canopy: the first one stood inside a 28 m crown.
 'Ruined forest':      RAIM(RGR,RG0.r1+22,RP.FRA-.70,RG0.y+40, RMID(RG1),RP.FRA-.10,RG1.y+10),
 // 3000 m of site separation plus 1440 of structure is a 4440 m span; at
 // 0.746 of the distance per half-width that wants about 3000 m of camera,
 // not the 5200 the first pass used, which left both barrels as thumbnails.
 'Both':               [0,1150,3500, 0,330,0],
};
