// ================================================================= HOST — the map: STATION 4, CUBE'S PLATEAU (PLAN-STATIONS.md sections 2-4)
// The scale model (4.23) at px 448,1237: Cube, the ruined arcology, on the middle of the east island (the plateau, 3,600-5,000 km²
// standing 1.2-2.3 km over the jungle floor round it). y = 0 is the model's -507 m, 300 m under the ruin's plinth (the shared host's
// planting mask takes ground under y 0 for the sea: PLINTH.y lifts the table clear of it). Cube's ground is -207 m (1.64 atm, +22 °C, Cfa ~1,400 mm). The
// model's 4 km cells round the site: a broad ridge running north-west to south-east through Cube, falling ~40 m a km north-east
// (to -600/-750 m 8-12 km off) and ~30 m a km south-west; the plateau's scarp and the hot floor below it are 12-25 km away, so
// they are the far field's (44f), not the page's. What the page makes of it:
//   the RUIN     Cube, the Pile, on its plinth at the origin: the ground under its old plaza (1.4 km square) levelled to PLINTH.y, and
//                the baked ruin standing on it (85-host-tower.js, 44c's RUIN_MASS)
//   the RIDGE    rolling warm-temperate forest, the ridge's crest through the ruin north-west to south-east
//   the STREAMS  two, each rising a kilometre off the ridge and running down its flank in a shallow valley: one north-east, one
//                south-west (89w)
// Noise from core/rand. Provides what the shared host reads: TERR, terrainH, slopeAt, lakeIn, streamD, southK, FIELD_RAW,
// MAP_ORIGIN; MAP_DRY and MAP_PAINT; and STREAMS_LINE (the streams' centrelines) and PLINTH for 85 and 89w.
const TERR={R:3200};
const SITE={px:448,py:1237,y0:-507,atm:1.64};
const KF=(x,z,o,s)=>KRAND.fbm(x,0,z,o,s);
const S2=Math.SQRT1_2;
const acrossR=(x,z)=>(x-z)*S2;   // across the ridge: + north-east (x east, z south), - south-west
// the ruin's plinth: the old plaza's box (the bake's ground works, 44c) and how far its edge blends into the ground round it
const PLINTH={x0:-680,x1:700,z0:-690,z1:690,blend:260,y:300};   /* the Pile's ground works (44c: the mass spans -602..617 x -614..611) */
function plinthK(x,z){const dx=Math.max(PLINTH.x0-x,0,x-PLINTH.x1),dz=Math.max(PLINTH.z0-z,0,z-PLINTH.z1);return smooth(PLINTH.blend,0,Math.hypot(dx,dz));}
// the ridge: level along its crest, falling 40 m a km north-east and 30 m a km south-west, the falls easing in over the first km
function baseH(x,z){const a=acrossR(x,z),fall=a>0?.040:.030,d=Math.abs(a);
 return PLINTH.y-fall*(d-500*(1-Math.exp(-d/500)))+22*(KF(x*.0011+3,z*.0011-1,3,401)-.5);}
// the two streams: each a centreline from its head toward the page's edge, as points (x, z) every 20 m, wandering
const STREAMS_LINE=[[[560,-260],1],[[-520,760],-1]].map(([h,s])=>{const P=[];let x=h[0],z=h[1];const dx=s*S2,dz=-s*S2;
 for(let i=0;i<260;i++){const t=i*20,w=60*Math.sin(t*.0024+s)+30*(KF(t*.004,s*3.1,2,403)-.5);P.push([x+dx*t+dz*w*-1,z+dz*t+dx*w]);}return P;})
 .map(P=>P.filter(p=>Math.abs(p[0])<TERR.R*1.12&&Math.abs(p[1])<TERR.R*1.12));
// the distance to a stream's centreline (on a 40 m spatial bucket of its points), and how far down it the nearest point is
const SB=(function(){const B={};STREAMS_LINE.forEach((P,k)=>P.forEach((p,i)=>{const key=Math.floor(p[0]/40)+','+Math.floor(p[1]/40);(B[key]||(B[key]=[])).push([p[0],p[1],k,i]);}));return B;})();
function streamNear(x,z){let best=[1e9,-1,0];const cx=Math.floor(x/40),cz=Math.floor(z/40);
 for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const L=SB[(cx+i)+','+(cz+j)];if(!L)continue;for(const p of L){const d=Math.hypot(x-p[0],z-p[1]);if(d<best[0])best=[d,p[2],p[3]];}}return best;}
function streamD(x,z){return streamNear(x,z)[0];}
function lakeIn(x,z){return 1e4;}                                            // no lake on the plateau
// the streams' beds: tabled along each line, never rising downstream (the ridge's rolls would pond them), each valley cut into the
// ground round it, deepening down the stream (6 m at the head to 24 m a kilometre and more down), a channel .7 m deep in its floor
const SBED=STREAMS_LINE.map(P=>{const v=new Float32Array(P.length);for(let i=0;i<P.length;i++){const h=mix(baseH(P[i][0],P[i][1]),PLINTH.y,plinthK(P[i][0],P[i][1]))-Math.min(24,6+i*.09);v[i]=i?Math.min(h,v[i-1]):h;}return v;});
function terrainH(x,z){
 let h=baseH(x,z)+3*(KF(x*.006,z*.006,3,405)-.5)+1*(KF(x*.03,z*.03,2,407)-.5);
 h=mix(h,PLINTH.y,plinthK(x,z));                                             // the ruin's plinth
 const s=streamNear(x,z);
 if(s[1]>=0&&s[0]<160){const bed=SBED[s[1]][s[2]],wv=60+.08*s[2];h=mix(h,Math.min(h,bed),smooth(wv,6,s[0]))-.7*smooth(3,0,s[0]);}
 return h;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
function southK(x,z){return 1;}                                             // the litter palette everywhere (a humid forest's floor)
const FIELD_RAW={
 // wet: Cfa, humid; wetter in the valleys
 wet:(x,z)=>clamp(.66+.1*(KF(x*.0012,z*.0012,2,409)-.5)+.2*smooth(120,15,streamD(x,z)),0,1),
 salt:(x,z)=>0,
 // upland .2: under the floor's .26 (the jungle's floor zone, thinned) and over the cloud zone's foot (the mist below): a mix of the
 // jungle's understorey and the cloud forest's ferns and moss, a warm temperate floor; the ruin's plinth rock where it is steep
 upland:(x,z)=>clamp(.2+.2*smooth(.7,1.2,slopeAt(x,z)),0,1),
 flow:(x,z)=>clamp(smooth(26,5,streamD(x,z)),0,1),
 mist:(x,z)=>clamp(.42+.12*(KF(x*.0014,z*.0014,2,411)-.5)+.12*smooth(140,20,streamD(x,z)),0,1)};
// the LOD origins: five, each a little ahead of a view's camera (44s): the ruin's west foot, under its keel, the north-east valley,
// the south-west valley, the ridge east of it
const MAP_ORIGIN=[[-1500,300],[0,0],[1400,-1300],[-1500,1700],[1900,700]];
// nothing roots in a stream
function MAP_DRY(x,z){return smooth(3,7,streamD(x,z));}
// the plinth's ground: the old plaza under five thousand years of litter, its paving's grey showing through in patches; the
// streams' floors dark wet stone and moss
const PLINTH_C=new THREE.Color(0x6a6858),BED_C=[new THREE.Color(0x3e4436),new THREE.Color(0x4c5a3a)];
function MAP_PAINT(c,x,z,rockK){const p=plinthK(x,z);
 if(p>0){const n=KF(x*.02,z*.02,2,413);c.lerp(PLINTH_C,p*.55*smooth(.5,.75,n));}
 const bed=smooth(22,4,streamD(x,z));if(bed>0)c.lerp(BED_C[0].clone().lerp(BED_C[1],KF(x*.05,z*.05,2,415)),bed*.8);}
