// ================================================================= KIRSTABAL — the Rift floor's flora: the climate as the Rift kit's fields
// The owner, 2026-11-16: "implement rift climate". The apron at the head of the Lower Xanadu Lake is the Rift floor (scale model
// 5.1: Af, 31-33 C mean, 800-1,250 mm on the apron, wetter up the scarp's foot; about 1.98 atm): the Rift's own flora
// (biomes/rift, sealed with today's core/biome in gen/69k2-ks-flora-bundle.js: KS_FLORA), not the Vale's. The Rift kit zones
// itself from five fields (biomes/rift/BIOME-API.md: its jungle where wet > .45, its savannah below .5, its shore on salt,
// its slopes and peaks on upland, its cloud forest on mist); here
//   wet     the apron's middling rain (.36) made wetter by the lake's shore (to +.32 within 700 m), by Keb Riwa's banks (to +.38
//           within 420 m) and toward the scarp's foot (to +.2 east of 2.2 km): jungle along the water, savannah inland
//   salt    none: the Lower Xanadu Lake is fresh (it drains by Nahr ash-Shalalat)
//   upland  the ground's height over the lake, 0 on the apron to 1 at 950 m up the scarp
//   flow    Keb Riwa's banks (1 at the water, nothing past 260 m)
//   mist    none on the floor
// over 89zk's mask (no tree on the water, the ways, the buildings and their clearings, the beach and the quays, the tilled and
// standing fields; the odd tree in the town). Then baked on its own BIO, its impostors baked, its LOD on the frame hooks.
// [web]: three.js (the grow and the bake are the kit's).
const KS_FL={ok:false,ms:0};
(function ksRiftFlora(){if(typeof KS_FLORA==='undefined')return;const F=KS_FLORA,B=F.BIO,G=KS_GROUND,t0=performance.now();
 const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);},cl=t=>Math.max(0,Math.min(1,t));
 const rv=(x,z)=>G.riverAt(x,z)[0];
 const fields={
  wet:ksWet,   /* 89zk */
  salt:()=>0,
  upland:(x,z)=>cl((terrainH(x,z)-50)/900),
  flow:(x,z)=>sm(260,70,rv(x,z)),
  mist:()=>0};
 /* the host's scene is the page's: the impostors light themselves from its lights (core/biome 34 readLights); a group of its own
    has none, and the far trees came out black */
 try{B.init({THREE,scene,terrainH:(x,z)=>terrainH(x,z),mask:ksBioMask,obstacles:[],
   ticks:fn=>{let last=null;FRAME_HOOKS.push(now=>{const t=(now==null?performance.now():now)/1000,dt=last==null?.016:Math.min(.1,t-last);last=t;fn(dt,t);});},
   seed:41630,origin:[[0,0],[-1600,1800],[2600,-3500]],center:[200,900],fields,
   eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:m=>console.warn('kirstabal flora: '+m)});
  if(B.setSun)B.setSun([-.5,.76,.52]);
  /* the Rift page's far-band diet (biomes/rift/src/88-host-build.js): heroes to 800 m, impostors beyond, the far floor to 1.6 km */
  if(F.RIFT.LOD){F.RIFT.LOD.tree=800;F.RIFT.LOD.farFloor=1600;}
  KS_FL.build=F.RIFT.build({R:4200,quality:.75});
  KS_FL.bake=B.bake();if(B.lodTick)FRAME_HOOKS.push(()=>B.lodTick(camera));
  /* the impostors' light matched to the near crowns, as the Rift's page does (its RIFT_IMPGAIN 3.6, wrap 1): the bake renders
     under a flat ambient and comes out darker than the drawn crowns */
  if(B.impostorLook)B.impostorLook({gain:3.6,wrap:1});
  if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('kirstabal flora impostors: '+(e&&e.message||e));}}
  /* the impostors' light, read from the scene every frame: read once at the bake, before the first frame, the sun and its target
     both stood at the origin and the far trees had no sun (they drew black) */
  if(B.IMP&&B.IMP.readLights)FRAME_HOOKS.push(()=>B.IMP.readLights());
  KS_FL.ok=true;}
 catch(e){reportErr('kirstabal flora: '+(e&&e.stack||e));}
 KS_FL.ms=Math.round(performance.now()-t0);})();
window._riftFlora=KS_FL;
