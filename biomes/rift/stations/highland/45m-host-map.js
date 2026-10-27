// ================================================================= HOST — the map: STATION 3, THE CLOUD FOREST (PLAN-STATIONS.md section 4)
// The central island ("the cloud island") on the scale model (4.23), px 356,1164: the summit at 2,057 m, its crest running north-south,
// the wet north-west face (Cfb, ~1,800 mm and the cloud) falling to the jungle, the dry south-east lee (Csa, 471 mm). y = 0 is 1,000 m
// on the model, so the page's heights read the bands of section 4 directly:
//   band A  the cloud foot  1.0-1.5 km  y 0-500     1.37 atm  +16 C
//   band B  the cloud core  1.5-1.9 km  y 500-900   1.29 atm  +13 C  (the cloud sits here most days: the fog band, 89a)
//   band C  the crest       1.9-2.06 km y 900-1060  1.21 atm  +12 C, frost on clear nights
//   the lee                 east of the crest, 1.3-1.9 km, dry
// The face: from the crest (x ~1100, wandering) down west, benched in three treads (the old ridge's sinusoid stair) and cut by
// ravines running west; the lee drops more gently east. Noise from core/rand. Provides what the shared host reads: TERR, terrainH,
// slopeAt, lakeIn, streamD, southK, FIELD_RAW, MAP_ORIGIN; and ABS (a page height to the model's) and BAND (a height's band).
const TERR={R:3200};
const SITE={px:356,py:1164,y0:1000,atm:1.24};
const KF=(x,z,o,s)=>KRAND.fbm(x,0,z,o,s);
const ABS=y=>y+SITE.y0,ATM=y=>1.6*Math.exp(-ABS(y)/8000);
const BAND=y=>{const a=ABS(y);return a<1500?'A':a<1900?'B':'C';};
// the crest line (x of the crest at z) and its height along it: the summit near z = 0, falling north and south
const crestX=z=>1100+160*Math.sin(z*.0007+.4)+70*(KF(z*.0013,1.7,2,301)-.5);
const crestH=z=>1057-230*Math.pow(Math.min(1,Math.abs(z)/3400),1.6)+40*(KF(z*.002,3.3,2,303)-.5);
// the ravines down the west face: z of each at x (they wander), its depth growing down the face
const RAVINES=[[-2100,.0011,1.2,70],[-650,.0013,3.9,95],[700,.0010,2.1,80],[2000,.0012,5.2,60]];
function ravineZ(k,x){const g=RAVINES[k];return g[0]+g[3]*2*Math.sin(x*g[1]+g[2])+60*(KF(x*.002,k*7.3,2,305)-.5);}
function ravineD(x,z){let d=1e9;for(let k=0;k<RAVINES.length;k++)d=Math.min(d,Math.abs(z-ravineZ(k,x)));return d;}
function streamD(x,z){return x<crestX(z)-150?ravineD(x,z):1e9;}   // the ravines carry the face's streams
function lakeIn(x,z){return 1e4;}                                    // no lake on the island
function baseH(x,z){const cx=crestX(z),s=x-cx,top=crestH(z);
 if(s<0){let f=1-Math.exp(s/1900);                                      // the west face: 0 at the crest, toward 1 down the face
  f=f-.045*Math.sin(f*Math.PI*2*3);                                      // three treads: the benches of the cloud forest
  return top-960*f;}
 return top-520*Math.pow(smooth(0,2600,s),.9);}                        // the lee
function terrainH(x,z){
 let h=baseH(x,z)+14*(KF(x*.0035,z*.0035,3,307)-.5)+4*(KF(x*.018,z*.018,2,309)-.5);
 const face=smooth(-120,-600,x-crestX(z));                             // ravines only on the face
 for(let k=0;k<RAVINES.length;k++){const d=Math.abs(z-ravineZ(k,x)),dep=(10+50*face*smooth(100,2200,crestX(z)-x));h-=dep*smooth(40+30*face,3,d);}
 return h;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
function southK(x,z){return .6*smooth(400,-200,x-crestX(z));}           // the face's litter (the jungle palette, greener), the lee's dry ground
// the cloud: thickest in band B on the face, thinner in band A, none on the crest above it on clear days or in the lee
function cloudK(x,z){const y=terrainH(x,z),a=ABS(y),west=smooth(300,-400,x-crestX(z));
 return clamp(west*(.45*smooth(1050,1350,a)+.5*smooth(1450,1600,a))*smooth(1980,1880,a),0,1);}
const FIELD_RAW={
 wet:(x,z)=>{const w=smooth(500,-500,x-crestX(z));return clamp(.28+.6*w+.1*(KF(x*.0012,z*.0012,2,311)-.5)+.12*smooth(60,8,streamD(x,z)),0,1);},
 salt:(x,z)=>0,
 // upland: .3 at 1 km (the cloud zone on), rising to ~.85 at the crest (the peak zone where the cloud is thin); the cliffs of the ravines rock
 upland:(x,z)=>clamp(.3+.55*smooth(1000,2060,ABS(baseH(x,z)))+.15*smooth(.7,1.2,slopeAt(x,z)),0,1),
 flow:(x,z)=>clamp(smooth(30,6,streamD(x,z)),0,1),
 mist:(x,z)=>cloudK(x,z)};
// the LOD origins: five, as station 2 (the held budget): the face's middle, the summit, the lee, and north and south down the face
const MAP_ORIGIN=[[-700,0],[900,0],[2300,0],[-1400,-2000],[-1400,2000]];
