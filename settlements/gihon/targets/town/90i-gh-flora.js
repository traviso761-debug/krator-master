// ================================================================= GIHON — the Rift floor's flora: the climate as the Rift kit's fields
// Kirstabal's 90m, adapted (the owner, 2026-11-16, for the Lower Lake: "implement rift climate"). Gihon's shore apron is the Rift
// floor (scale model 5.1: Af, 30-31 C mean, 1,020-1,100 mm; about 1.98 atm): the Rift's own flora (biomes/rift, sealed with
// today's core/biome in gen/69g2-gh-flora-bundle.js: GH_FLORA), not the Vale's. Its five fields here:
//   wet     the apron's middling rain (.38) made wetter by the lake's shore (to +.32 within 700 m) and by the Opal River's banks (to
//           +.38 within 420 m): jungle along the water, savannah inland (89zg's ghWet)
//   salt    none: the Lower Xanadu Lake is fresh
//   upland  the ground's height over the lake, 0 on the apron to 1 at 950 m up the Rift's inner wall
//   flow    the Opal River's banks (1 at the water, nothing past 260 m)
//   mist    none on the floor
// over 89zg's mask (no tree on the water, the ways, the buildings and their clearings, the beach and the quays, the forbidden
// city's terrace, the tilled and standing fields; the odd tree in the town). Baked on its own BIO, its impostors baked, its LOD
// on the frame hooks. [web]: three.js (the grow and the bake are the kit's).
const GH_FL={ok:false,ms:0};
(function ghRiftFlora(){if(typeof GH_FLORA==='undefined')return;const F=GH_FLORA,B=F.BIO,G=GH_GROUND,t0=performance.now();
 const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);},cl=t=>Math.max(0,Math.min(1,t));
 const rv=(x,z)=>G.riverAt(x,z)[0];
 const fields={
  wet:ghWet,   /* 89zg */
  salt:()=>0,
  upland:(x,z)=>cl((terrainH(x,z)-50)/900),
  flow:(x,z)=>sm(260,70,rv(x,z)),
  mist:()=>0};
 /* the host's scene is the page's: the impostors light themselves from its lights (core/biome 34 readLights); a group of its own
    has none, and the far trees came out black */
 try{B.init({THREE,scene,terrainH:(x,z)=>terrainH(x,z),mask:ghBioMask,obstacles:[],
   ticks:fn=>{let last=null;FRAME_HOOKS.push(now=>{const t=(now==null?performance.now():now)/1000,dt=last==null?.016:Math.min(.1,t-last);last=t;fn(dt,t);});},
   seed:41930,origin:[[0,0],[-1600,1800],[2400,2600]],center:[0,700],fields,
   eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:m=>console.warn('gihon flora: '+m)});
  if(B.setSun)B.setSun([-.5,.76,.52]);
  /* the Rift page's far-band diet (biomes/rift/src/88-host-build.js): heroes to 800 m, impostors beyond, the far floor to 1.6 km */
  if(F.RIFT.LOD){F.RIFT.LOD.tree=800;F.RIFT.LOD.farFloor=1600;}
  GH_FL.build=F.RIFT.build({R:4200,quality:.75});
  GH_FL.bake=B.bake();if(B.lodTick)FRAME_HOOKS.push(()=>B.lodTick(camera));
  /* the impostors' light matched to the near crowns, as the Rift's page does (its RIFT_IMPGAIN 3.6, wrap 1): the bake renders
     under a flat ambient and comes out darker than the drawn crowns */
  if(B.impostorLook)B.impostorLook({gain:3.6,wrap:1});
  if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('gihon flora impostors: '+(e&&e.message||e));}}
  /* the impostors' light, read from the scene every frame: read once at the bake, before the first frame, the sun and its target
     both stood at the origin and the far trees had no sun (they drew black) */
  if(B.IMP&&B.IMP.readLights)FRAME_HOOKS.push(()=>B.IMP.readLights());
  GH_FL.ok=true;}
 catch(e){reportErr('gihon flora: '+(e&&e.stack||e));}
 GH_FL.ms=Math.round(performance.now()-t0);})();
window._riftFlora=GH_FL;
