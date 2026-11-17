// ================================================================= NULAB — the veiled rim's flora: the basin's climate as the rim kit's fields
// The great lake's basin is the rift rim's warmest ground (biomes/riftrim PLAN.md 4.22: Csa, 15-18 C, about 1,100 mm), the veiled
// rim's shore zone (RRIM.biome('w')): its own trees (the mist frill, the lobe larch) and floor (mist cup, moor sponge, veil
// thread, the gold-magenta prism heath, Dalab's fields), sealed with today's core/biome in gen/69n2-nl-flora-bundle.js (NL_FLORA).
// The kit's borrowed species (the SW lowlands' cork oak, tier cedar, bay laurel, veil willow) come by its kin rows, which this
// page does not take yet (KNOWN_ISSUES.md). The fields (biomes/riftrim/BIOME-API.md):
//   cold    0: the basin's 16-18 C mean is the axis's warm end (0 at +16 C)
//   wet     89zn's nlWet: the Csa basin's .42, wetter by the lake's shore and the river's banks
//   rock, slope   the ground's gradient (nothing roots on a steep bank)
//   flow    the water's shore (the bay, the lake, the Chimes Riba)
//   fog     the veils the rim lives in, thin on the basin floor (.25), thicker toward the water
//   farm    Dalab's fields (the ring's parcels in crop and resting)
// over 89zn's mask (no tree on the water, the ways, the buildings and their clearings, the fields in crop; the odd tree in the
// town). Then baked on its own BIO, its impostors baked, its LOD on the frame hooks. [web]: three.js (the grow and the bake are
// the kit's).
const NL_FL={ok:false,ms:0};
(function nlRimFlora(){if(typeof NL_FLORA==='undefined')return;const F=NL_FLORA,B=F.BIO,G=NL_GROUND,t0=performance.now();
 const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);},cl=t=>Math.max(0,Math.min(1,t));
 const slope=(x,z)=>{const e=4,gx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),gz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e);return Math.hypot(gx,gz);};
 const shore=(x,z)=>Math.max(sm(10,0,terrainH(x,z)-G.LAKE),sm(260,70,G.riverAt(x,z)[0]));
 const fields={cold:()=>0,wet:nlWet,rock:(x,z)=>sm(.45,.9,slope(x,z)),slope:(x,z)=>cl(slope(x,z)),flow:shore,barren:()=>0,snow:()=>0,
  fog:(x,z)=>.25+.35*shore(x,z),farm:(x,z)=>{const f=nlFieldAt(x,z);return f&&f.kind!=='yard'?1:0;}};
 try{B.init({THREE,scene,terrainH:(x,z)=>terrainH(x,z),mask:nlBioMask,obstacles:[],
   ticks:fn=>{let last=null;FRAME_HOOKS.push(now=>{const t=(now==null?performance.now():now)/1000,dt=last==null?.016:Math.min(.1,t-last);last=t;fn(dt,t);});},
   seed:44310,origin:[[0,0],[-900,1100],[900,-1300],[2600,2700]],center:[0,0],fields,
   eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:m=>console.warn('nulab flora: '+m)});
  if(B.setSun)B.setSun([-.5,.76,.52]);
  if(F.RRIM.LOD){F.RRIM.LOD.tree=800;F.RRIM.LOD.farFloor=1600;}
  NL_FL.build=F.RRIM.build({R:4200,quality:.75,rim:'w'});
  NL_FL.bake=B.bake();if(B.lodTick)FRAME_HOOKS.push(()=>B.lodTick(camera));
  if(B.impostorLook)B.impostorLook({gain:3.6,wrap:1});
  if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('nulab flora impostors: '+(e&&e.message||e));}}
  if(B.IMP&&B.IMP.readLights)FRAME_HOOKS.push(()=>B.IMP.readLights());
  NL_FL.ok=true;}
 catch(e){reportErr('nulab flora: '+(e&&e.stack||e));}
 NL_FL.ms=Math.round(performance.now()-t0);})();
window._rimFlora=NL_FL;
