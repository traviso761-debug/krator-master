// ================================================================= THE FOREST-STEPPE ROW'S FLORA: the build (Y6)
// After the nwouterwall kit's fragments (the 93b-bio- band): its layout on this sheet's fields (93b-bio-45-yt-init.js), its trees and
// its floor in the row's box, one bake into the scene, its LOD ticked each frame. Once, at load: the flora is not rebuilt with the buildings. ?flora=0 skips it.
// window._flora: what was placed (the probe and verify.py's flora-row check).
window._flora=null;
if(YT_FLORA&&new URLSearchParams(location.search).get('flora')!=='0'){const t0=performance.now();
 try{NWOW.lay({fields:ytFloraFields,R:YT_FLORA.R,seed:4700});NWOW.larchK=1.6;NWOW.IMPOSTORS=false;
  const out=NWOW.build({R:YT_FLORA.R,quality:1});const b=BIO.bake();
  FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();BIO.lodTick(camera);});   /* the kit's LOD: each chunk shown by its distance from the eye */
  window._flora={kit:'nwouterwall',season:NWOW.season,trees:out.trees,bySpecies:out.bySpecies,plants:out.floor?out.floor.plants:0,
   byKind:out.floor?out.floor.byKind:{},instances:b?b.inst:0,records:YT_FLORA.tags?YT_FLORA.tags.records.length:0,ms:Math.round(performance.now()-t0)};}
 catch(e){reportErr('flora: '+(e.stack||e));}}
