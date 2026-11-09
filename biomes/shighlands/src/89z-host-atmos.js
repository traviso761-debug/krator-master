// ================================================================= HOST — the atmosphere: the cloud sea
// core/atmos bound for this stage (its core, presets, export and the cloud deck, listed in build.py's CORE_ATMOS). The
// cloud sea is ATMOS.cloudDeck: a field of heaped, drifting billows written from PRESETS.clouddeck, so a game engine
// draws the same cloud from the same numbers (core/atmos/GODOT.md, "The cloud deck"). It follows the camera and thins
// where the ground rises through it; the ground it reads is the stage's cached height (FC), not the full terrain call.
// The mist sprites along its edge and up the ravines stay this host's own (84-host-ground.js).
ATMOS.init({THREE,scene,camera,hour:()=>11,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>FC.at(FC.a.h,x,z),seed:47,err:reportErr});
const DECK=ATMOS.cloudDeck({y:CLOUD_Y,sun:[-1000,900,-700],bounds:[-13000,-12600,13000,DECK_Z+500],name:'The cloud sea'});
REGISTER({name:'The cloud sea (the hyperjungle\'s air, pooled below the Wall)',x:0,z:-2600,y:CLOUD_Y-60,r:1400,h:110});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26; here, after ATMOS.init): wet: the southern highlands over the hyperjungle's
// cloud sea, rain and the cloud's fog. // It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// ================================================================= the final rebuild's air (BACKPORT.md section 1 and the southern highlands' row; korona's lines; pair 12)
// Each look change has its switch (KNOWN_ISSUES.md, "The final rebuild (pair 12)"):
//   R8          the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind); cut-outs by alpha-to-coverage after the bake (89zx)
//   R1 ?hfog=0  height fog: the air thick over the low ground (the scarp under the rim, the ravines, the bog hollows), thinning up to the tors
//   ?belt=0     THE FOG BELT ON THE FACE (BACKPORT.md's row: "fog belt ... on the windward face"): the hyperjungle's wet air forced up the Inner
//               Wall's face from the north condenses as a broken belt from the deck's top to ~1.3 km above it, the cloud the cloud forest stands
//               in (the `fog` field's band, 45-host-stage.js: FOG_BAND); the deck stays core/atmos's cloud below it
//   R10         the rain occlusion map: no rain under a crown (lightning rides with the weather's storm: fx/89-atmos-fx-lightning.js)
//   R9          wet ground and puddles: NOT taken (oidong's and korona's finding: WATER.wetGround over a KGROUND floor drew the ground black in
//               clear weather, not traced); the weather's own wetting (bindWeather's grounds) stays
//   The rain wall (fx/89-atmos-fx-rainwall.js, the row's other ask) is not taken: no page takes it yet and its shader is WebGL2-only; an
//   opt-in for the owner's look pass (KNOWN_ISSUES.md)
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,belt:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:1/600,sun:.3,sky:.35});
  if(Q.get('belt')!=='0'&&ATMOS.fogBelt){window._belt=ATMOS.fogBelt({y0:CLOUD_Y-20,y1:CLOUD_Y+1300,windward:[0,-1],density:.0008,depth:50,lee:.25,rise:.5,
   extent:[-TERR.R*1.6,-TERR.R*2.4,TERR.R*1.6,TERR.R*.9],res:128,steps:8});out.belt=true;}
  ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
