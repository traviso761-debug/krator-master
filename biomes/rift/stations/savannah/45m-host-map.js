// ================================================================= HOST — the map: STATION 1, THE RIFT SAVANNAH (PLAN-STATIONS.md)
// The scale model (4.23) at px 369,1166, 2 km east of the surveyed site 368,1166: the abyssal savannah (XV) on the long apron
// below the central island's dry south-east back. Heights are the page's, y = 0 at the model's -1,523 m (1.94 atm, +28 C,
// 784 mm). The model's cells (4 km) give the shape: the apron rising ~500 m to the west across the page toward the island's
// lee slope (Aw), the plain flattening east (XV), the terminal sea 6-8 km off to the north-east (beyond the page).
// What the page adds: gullies down the apron that open into shallow washes on the plain and gather to one wash running
// north-east toward the sea; granite tors (kopjes) on the plain; a dry salt pan in the north-east corner, a playa that
// holds rain-season puddles. Noise from core/rand (KRAND.fbm), tors placed by KRAND.hash: nothing depends on draw order.
// Provides what the shared host reads (45s, 88, 89a): TERR, terrainH, slopeAt, lakeIn, streamD, southK, FIELD_RAW, MAP_ORIGIN.
const TERR={R:3200};
const SITE={px:369,py:1166,y0:-1523,atm:1.94};
const KF=(x,z,o,s)=>KRAND.fbm(x,0,z,o,s);
// the gullies: x runs west -> east (downslope); each gully's z at x, wandering; they gather onto the main wash past x~800
const GULLIES=[[-1900,.0011,1.3,240],[-700,.0013,4.1,210],[600,.0009,2.2,260],[1700,.0012,5.0,200]];
function gullyZ(k,x){const g=GULLIES[k],w=g[0]+g[3]*Math.sin(x*g[1]+g[2])+90*(KF(x*.002,k*7.3,2,41)-.5);
 const join=smooth(400,2200,x);return mix(w,washZ(x),join*(k===1||k===2?.85:.55));}
// the main wash: from the apron's foot north-east across the plain toward the pan and the sea
function washZ(x){return 300-.42*(x+3200)*smooth(-1000,3200,x)+160*Math.sin(x*.0014+.7)+70*(KF(x*.003,3.1,2,43)-.5);}
function streamD(x,z){let d=Math.abs(z-washZ(x))*(x<-600?4:1);for(let k=0;k<GULLIES.length;k++)d=Math.min(d,Math.abs(z-gullyZ(k,x)));return d;}
// the pan: a dry salt playa in the north-east corner (the sea's old floor, under the plain's level)
const PAN={x:2350,z:-2250,r:620};
function panR(x,z){const a=Math.atan2(z-PAN.z,x-PAN.x);return PAN.r*(1+.18*Math.sin(3*a+1)+.10*Math.sin(5*a-2)+.15*(KF(Math.cos(a)*2,Math.sin(a)*2,2,47)-.5));}
function lakeIn(x,z){return Math.hypot(x-PAN.x,z-PAN.z)-panR(x,z);}
// the tors (kopjes): granite domes and boulder piles on the plain, by hash of their slot (a jittered 700 m lattice, ~1 in 3 kept)
const TORS=(function(){const T=[];for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){const h=KRAND.hash(9172,i,j);if(KRAND.unit(h)>.36)continue;
  const x=i*700+(KRAND.unit(KRAND.hash(9173,i,j))-.5)*500,z=j*700+(KRAND.unit(KRAND.hash(9174,i,j))-.5)*500;
  if(x<-1500||Math.abs(x)>3000||Math.abs(z)>3000)continue;
  T.push({x,z,r:40+60*KRAND.unit(KRAND.hash(9175,i,j)),h:10+22*KRAND.unit(KRAND.hash(9176,i,j)),s:KRAND.hash(9177,i,j)});}return T;})();
function torH(x,z){let h=0;for(const t of TORS){const d=Math.hypot(x-t.x,z-t.z)/t.r;if(d>1.6)continue;
  const n=KF(x*.03,z*.03,2,t.s%997);h=Math.max(h,t.h*Math.pow(Math.max(0,1-d*d*.55),1.6)*(.75+.5*n));}return h;}
// the apron: rising to the west toward the island; the plain dipping a little east; a low rise in the south-east (the model's -1,462 m cell)
function baseH(x,z){return 560*Math.pow(smooth(-150,-3700,x),1.35)-110*smooth(-200,3400,x)+70*smooth(1200,3600,z)*smooth(0,3000,x)
 +30*(KF(x*.0007,z*.0007,3,49)-.5);}
function terrainH(x,z){
 let h=baseH(x,z)+7*(KF(x*.004,z*.004,3,51)-.5)+2*(KF(x*.02,z*.02,2,53)-.5);
 const ap=smooth(-300,-2200,x);   // the apron's share: the gullies cut deeper there
 for(let k=0;k<GULLIES.length;k++){const d=Math.abs(z-gullyZ(k,x));h-=(4+16*ap)*smooth(30+40*ap,4,d);}
 h-=2.2*smooth(45,8,Math.abs(z-washZ(x)))*(1-ap);
 h+=torH(x,z);
 const lk=lakeIn(x,z);h=mix(h,Math.min(h,-128+.6*(KF(x*.01,z*.01,2,55)-.5)),smooth(60,-30,lk));   // the pan's flat floor
 return h;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
function southK(x,z){return 0;}   // all of it on the savannah side: the ground painter's dry palette
function torK(x,z){let k=0;for(const t of TORS){const d=Math.hypot(x-t.x,z-t.z)/t.r;if(d<1.4)k=Math.max(k,smooth(1.4,.6,d));}return k;}
const FIELD_RAW={
 // dry: .26 on the plain, a little less on the apron's lee; the gullies and the wash wetter (the riparian strips: acacias, crotons)
 wet:(x,z)=>clamp(.27-.05*smooth(-600,-2600,x)+.06*(KF(x*.0012,z*.0012,2,61)-.5)+.15*smooth(70,10,streamD(x,z))+.12*smooth(120,0,lakeIn(x,z))*smooth(-60,40,lakeIn(x,z)),0,1),
 salt:(x,z)=>{const lk=lakeIn(x,z);return clamp(.9*smooth(80,0,lk)+.35*smooth(260,60,lk),0,1);},
 // upland: the apron climbs into the island's lee (Aw, the dry slope's species); the tors read as rock outcrops
 upland:(x,z)=>clamp(Math.max(terrainH(x,z)/1800,.34*torK(x,z)),0,1),   /* /1800: the apron stays savannah, the dry slope species only at its top */
 flow:(x,z)=>clamp(Math.max(smooth(60,10,streamD(x,z))*.8,smooth(90,20,Math.abs(z-washZ(x)))*(1-smooth(-300,-2200,x))),0,1),
 mist:(x,z)=>0};
// the LOD origins: a 3 x 3 lattice over the page (no spine here: the station is one place)
const MAP_ORIGIN=[];for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)MAP_ORIGIN.push([i*1800,j*1800]);
