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
// ---------------------------------------------------------------- the ground's colour (WORLD.ground, wrapped)
// The world colours the ground from the scale model's biome overlays; here the isles all lie under the Ring Sea's water
// overlay, whose land palette is pale sand. So the isles' ground follows the climate classes instead: dark loam and
// litter under the forest (XA, Af, Am), tawny grass ground on the savanna (Aw, XV), pale on the steppe (BSh), salt-grey
// on the salt steppe (XS), sand on the beach and the dunes, mud in the mangal. UNDER THE SEA the ground is the sea's
// colour by its depth (shallow turquoise to deep blue), so the sea reads as sea from any height: the water surface is
// drawn on a window round the camera (little-demo's 83w-world-seas.js) and beyond it the eye sees this ground (the owner,
// 2026-10-15: the sea distinguishable at all heights). Within the window the water is drawn over it.
const lin=h=>{const f=c=>{c/=255;return c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);};return[f(h>>16&255),f(h>>8&255),f(h&255)];};
const GCL={forest:lin(0x4a3e2a),forestB:lin(0x3a3424),sav:lin(0xa88c58),step:lin(0xbca276),salt:lin(0xcdc2a6),sand:lin(0xd8c8a0),mud:lin(0x4e4434),
 shallow:lin(0x66bfb8),mid:lin(0x4a9cba),deep:lin(0x3a7fa8)};   /* near the water window's own tone, so its edge does not show from high up */
const mixc=(o,c,t)=>{o[0]+=(c[0]-o[0])*t;o[1]+=(c[1]-o[1])*t;o[2]+=(c[2]-o[2])*t;};
const ground0=W.ground,TC=[0,0,0];
W.ground=function(x,z,S,out){ground0(x,z,S,out);const d=S.depth;
 if(d>0){const c=d<6?GCL.shallow:GCL.mid;TC[0]=c[0];TC[1]=c[1];TC[2]=c[2];mixc(TC,GCL.mid,smooth(2,8,d));mixc(TC,GCL.deep,smooth(15,80,d));
  mixc(out,TC,smooth(0,.6,d));out[3]*=1-smooth(0,.6,d);return out;}
 const C=classWeights(x,z),forest=C[IDX.XA]+C[IDX.Af]+C[IDX.Am],sav=C[IDX.Aw]+C[IDX.XV],step=C[IDX.BSh],salt=C[IDX.XS],tot=forest+sav+step+salt;
 if(tot>0){TC[0]=TC[1]=TC[2]=0;const add=(c,w)=>{TC[0]+=c[0]*w;TC[1]+=c[1]*w;TC[2]+=c[2]*w;};
  const fn=NA.fbm(x/600,z/600,2);add(fn>.5?GCL.forestB:GCL.forest,forest/tot);add(GCL.sav,sav/tot);add(GCL.step,step/tot);add(GCL.salt,salt/tot);
  mixc(out,TC,.72*(1-S.rock*.6));}
 if(S.beach)mixc(out,GCL.sand,S.beach*.85);if(S.dune)mixc(out,GCL.sand,S.dune*.6);if(S.mangal)mixc(out,GCL.mud,S.mangal*.8);
 return out;};
// ---------------------------------------------------------------- the coast as terrain (WORLD.landHook)
// The scale model's shore is a 4 km grid's slope. Here the shallow shelf is reshaped by its depth into the tropical coast
// the isles kit grows on: a LAGOON floor near the shore (0.5 to 2.8 m of water), a REEF CREST a few hundred metres out
// (about 0.35 m: the sea's shoaling breaks on it), the FORE REEF dropping back to the model's slope by 70 m; noise breaks
// the reef with passes. On land, in the wet classes and in patches, the shore's lowest ground (within 4 m of the water)
// is flattened into MANGROVE FLATS: tidal mud just round the water line. Applied to every height the world samples (the
// terrain, the fields, the seas' beds), so the water, the shore's surf and the kit's zones all see the same coast.
const NR=KN(4404);
/* the sea's and the lakes' level only (WORLD.lakeWater reads the raster): WORLD.water's river part samples the height, which calls this */
W.landHook=(x,z,h)=>{const wl=W.lakeWater(x,z);if(wl<-1e8)return h;const d=wl-h;
 if(d>0){if(d>=70)return h;
  const on=smooth(.36,.48,NR.fbm(x/2600+3,z/2600-9,3));if(on<=0)return h;
  let g;if(d<12)g=.5+2.3*smooth(0,12,d);else if(d<22)g=2.8-2.45*smooth(12,19,d);else if(d<30)g=.35+.15*NR.vn(x/120,z/120);else g=lerp(.5,d,smooth(30,70,d));
  return wl-lerp(d,g,on);}
 const above=-d;if(above>4)return h;
 const C=classWeights(x,z),wetCl=C[IDX.XA]+C[IDX.Af]+C[IDX.Am]+C[IDX.Aw]*.4;if(wetCl<.3)return h;
 const m=smooth(.45,.6,NC.fbm(x/3000,z/3000,3))*smooth(.3,.6,wetCl)*(1-smooth(2.5,4,above));if(m<=0)return h;
 return wl+lerp(above,-.4+above*.3,m);};
const lerp=(a,b,t)=>a+(b-a)*t;
// the kits' weights: the Ring Sea isles kit (and the lenders it grows trees from, 47-world-kits.js) covers the whole demo
// area; its zones, read on the fields above, decide what grows where. (The world's own weights follow the scale model's
// biome overlays, which here are the Ring Sea's water overlay over the isles.)
W.kitW=(k,x,z)=>1;
W.classWeights=(x,z)=>{const C=classWeights(x,z),o={};CLASSES.forEach((c,i)=>o[c]=C[i]);return o;};
W.VENTS=VENTS;
})();
