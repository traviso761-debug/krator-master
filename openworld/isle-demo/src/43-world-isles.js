// ================================================================= ISLE DEMO — the isles' fields: the climate classes as weights, the coast
// [G data] The fields the Ring Sea isles kit reads (biomes/ringisles/BIOME-API.md, "The fields a host binds") that the
// open world (openworld/little-demo/src/41-world-fields.js) does not make. Added to WORLD.FIELDS before the host binds
// the biome core (45-world-host.js builds its field functions from that list), and filled in by wrapping WORLD.at and
// WORLD.fieldsFrom, so every sample (a full one, a terrain chunk's) carries them. Plain maths of (x, z) and the rasters.
//   koppen:<class>  the scale model's climate class at the point as soft weights over the seven isle classes (XA, Af, Am,
//                   Aw, XV, BSh, XS): the map pixels round a warped point, so a class boundary blends over ~2 km rather
//                   than in squares; they sum to 1 on land, 0 under water
//   beach           sand just above the water line on gentle ground (0..3.5 m over the water, slope under .3)
//   dune            the dry lee's sand behind it (3..12 m over the water) where the rain is under ~1,500 mm
//   mangal          the wet classes' sheltered shore, mud in and out of the water (-1.2..1.5 m), in patches
//   lagoon          shallow water 0.4..3.5 m deep
//   reef            the shallowest water off the shore (0..0.7 m deep), in patches (the reef crest)
//   bench           rock awash at the shore on steep ground (-0.4..0.6 m, slope over .3)
//   pan             a salt pan's crust: the world's own salt field
//   garden          a town's fields: 0 until the towns are laid out (P5)
//   floor           the geyser kit's thermal ground: within ~1.5 km of one of the scale model's vents (region.json vents)
// The scale model's heights are a 4 km grid, so these coast bands are as wide as its shore's slope makes them; a reef
// ring, a lagoon and a mangrove bay drawn as terrain are the flora step's (PLAN.md, P3b).
(function(){
const W=WORLD,M=WORLD_DATA.meta;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const KN=KRELIEF.noise,NA=KN(4401),NB=KN(4402),NC=KN(4403);
const CLASSES=['XA','Af','Am','Aw','XV','BSh','XS'];
const KF=CLASSES.map(c=>'koppen:'+c);
const COAST=['beach','dune','mangal','lagoon','reef','bench','pan','garden','floor'];
W.FIELDS.push(...KF,...COAST);
W.ISLE_FIELDS=KF.concat(COAST);
// the vents in world metres, for the thermal ground
const o=M.frame.origin_px,VENTS=(M.vents||[]).map(v=>[(v.px[0]-o[0])*2000,(v.px[1]-o[1])*2000]);
// the class weights: the climate code at five warped points round (x, z), counted
const IDX={};CLASSES.forEach((c,i)=>IDX[c]=i);
const OFF=[[0,0],[700,0],[-700,0],[0,700],[0,-700]],CW=new Float32Array(CLASSES.length);
function classWeights(x,z){CW.fill(0);let n=0;
 for(const [ox,oz] of OFF){const wx=x+ox+(NA.fbm(x/5000,z/5000,2)-.5)*1600,wz=z+oz+(NB.fbm(x/5000+31,z/5000-7,2)-.5)*1600;
  const c=W.climate(wx,wz);if(!c)continue;const k=IDX[c.code];if(k!=null){CW[k]++;n++;}}
 if(n)for(let k=0;k<CW.length;k++)CW[k]/=n;return CW;}
function add(A){const x=A.x,z=A.z,d=A.depth,above=-d,slope=A.slope,land=d<0?1:0;
 const C=classWeights(x,z);for(let k=0;k<KF.length;k++)A[KF[k]]=land?C[k]:0;
 const wetCl=C[IDX.XA]+C[IDX.Af]+C[IDX.Am],dry=C[IDX.BSh]+C[IDX.XS]+C[IDX.XV]*.5;
 const hasW=A.water>-1e8;
 A.beach=hasW?smooth(-.2,.3,above)*(1-smooth(2.5,3.5,above))*(1-smooth(.22,.32,slope)):0;
 A.dune=hasW?smooth(3,4.5,above)*(1-smooth(9,12,above))*smooth(1600,1100,A.rain)*(1-smooth(.15,.25,slope)):0;
 A.mangal=hasW?smooth(-1.4,-1.0,above)*(1-smooth(1.2,1.6,above))*(1-smooth(.12,.2,slope))*smooth(.3,.6,wetCl+C[IDX.Aw]*.4)*smooth(.45,.6,NC.fbm(x/3000,z/3000,3)):0;
 A.lagoon=hasW?smooth(.3,.5,d)*(1-smooth(3,3.8,d)):0;
 A.reef=hasW?smooth(-.05,.05,d)*(1-smooth(.5,.8,d))*smooth(.5,.62,NC.fbm(x/900+50,z/900-20,3)):0;
 A.bench=hasW?(1-smooth(.4,.7,Math.abs(d)))*smooth(.28,.38,slope):0;
 A.pan=A.salt||0;
 A.garden=0;
 let fl=0;for(const [vx,vz] of VENTS){const r=Math.hypot(x-vx,z-vz);if(r<2000)fl=Math.max(fl,1-smooth(900,1600,r));}A.floor=fl;
 A.dry=dry;
 return A;}
const at0=W.at,from0=W.fieldsFrom;
W.at=(x,z)=>add(at0(x,z));
W.fieldsFrom=(x,z,h,tanS,P,out)=>add(from0(x,z,h,tanS,P,out));
W.classWeights=(x,z)=>{const C=classWeights(x,z),o={};CLASSES.forEach((c,i)=>o[c]=C[i]);return o;};
W.VENTS=VENTS;
})();
