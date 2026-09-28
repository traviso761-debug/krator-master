// Presets, DERIVED from WG_SITE, which buildWing fills before this runs: the
// site origin and the slab numbers are the builder's own, so a camera aimed at a
// gap follows the gap if the wing is ever re-proportioned.
//
// The camera is 50 degrees vertical and the frame 1.49 x the sight line wide:
// 1 400 m of span wants ~1 300 m of stand-off to sit comfortably in frame.
const WGDEF={x:0,z:0,R:142,YC:242,PY:100,PL:32.4,Y0:252,SP:46.8,TS:28.8,GP:18,K:5,YTOP:468,
 XR:[300,355,410,465,520],XT:[470,525,580,635,690],XG:[280,335,390,445,500],
 W:x=>{const a=Math.abs(x);return a<=160?50:50-16*Math.min(1,(a-160)/540);},FALLEN:[{x:700,z:60},{x:960,z:-230},{x:1150,z:40}]};
const WGA=Object.assign({},WGDEF,{x:-2600},WG_SITE[0]||{});
const WGB=Object.assign({},WGDEF,{x:2600},WG_SITE[1]||{});
// camera and target in site coordinates, optional night flag
const WGV=(S,c,t,n)=>[S.x+c[0],c[1],S.z+c[2],S.x+t[0],t[1],S.z+t[2]].concat(n?[1]:[]);
// THE HERO: south-south-east, a little above the drum, so the lit coffered face,
// both wings and the lean of their slab ends are all in one frame.
const WGHERO=(S,n)=>WGV(S,[560,330,1250],[0,262,0],n);
const WGFRONT=S=>WGV(S,[0,250,1380],[0,258,0]);
const WGSPIRAL=S=>WGV(S,[70,250,430],[0,242,60]);
const VIEWS={
 'The Wing':               WGHERO(WGA),
 // THE WHOLE GESTURE, square on from the south: pedestal, drum, yoke, and the
 // two stepped wings as one silhouette.
 'The whole gesture':      WGFRONT(WGA),
 // THE SPIRAL: the south lens, 1 296 coffers on two families of spirals
 // closing on the oculus.
 'The spiral':             WGSPIRAL(WGA),
 // ALONG THE SLAB GAPS: from beyond the east tips, looking back along the
 // stack — seven slabs, six dark gaps, each slab 40 m longer than the last.
 'Along the slab gaps':    WGV(WGA,[WGA.XT[4]+150,390,WGA.W(700)+120],[WGA.XG[3]-40,WGA.Y0+3*WGA.SP+WGA.TS,0]),
 // UNDER THE CANTILEVER: standing on the plain under the east wing, looking up
 // the tapering soffits to the tips 470 m up.
 'Under the cantilever':   WGV(WGA,[390,3,262],[500,290,-10]),
 // THE HAUNCH: from the lowest tier, the concave spring of the lever off the
 // pedestal's capital.
 'The haunch':             WGV(WGA,[340,14,190],[170,170,0]),
 // THE PLINTH, at a person's height: people on the top tier, the portal of the
 // pedestal, and the drum over it.
 'The plinth':             WGV(WGA,[96,34.1,172],[0,64,20]),
 // INSIDE A GAP: on the deck of slab 3 under slab 4, looking back toward the
 // gap's root wall between the houses and trees.
 'Inside a gap':           (function(S){const y=S.Y0+3*S.SP+S.TS;return WGV(S,[S.XT[3]-6,y+4,-28],[S.XG[3]+10,y+5,-18]);})(WGA),
 // FROM ABOVE: the plan, to check every lid is on.
 'From above':             WGV(WGA,[380,1500,760],[0,240,0]),
 'The Wing at night':      WGHERO(WGA,1),
 'Ruined':                 WGHERO(WGB),
 // THE RUIN SQUARE ON: the symmetry broken — one wing gone at the root, the
 // other sagging.
 'The broken gesture':     WGFRONT(WGB),
 // THE STUMP: the break beside the drum, floors hanging out of it.
 'The stump':              WGV(WGB,[460,300,360],[170,270,0]),
 // THE FALLEN WING: three pieces of the east wing across the plain.
 'The fallen wing':        (function(S){const F=S.FALLEN;const cx=(F[0].x+F[1].x+F[2].x)/3,cz=(F[0].z+F[1].z+F[2].z)/3;
                             return WGV(S,[cx+420,300,cz+760],[cx-40,40,cz]);})(WGB),
 // THE SAGGING WING: the west slabs pancaked onto one another at their tips.
 'The sagging wing':       WGV(WGB,[-900,330,760],[-560,300,0]),
 // THE BROKEN SPIRAL: coffers fallen out in clusters, the gutted drum behind.
 'The broken spiral':      WGSPIRAL(WGB),
};
