// ================================================================= HOST — the underground camera on the hold (a demo station)
// core/host's opt-in underground pieces (core/host/UNDERGROUND.md) on the hold's active storey: this station is the hold (its base) plus
// this one fragment, and build.py adds the files (station.json "underground"). It sorts before 99-host-take.js and adds to what the take
// is handed, so the hold's own take is unchanged:
//   V   the follow camera on the cave's own distance field (CAVE.C.sdf; the crystals are not in it: they never shorten the arm, they fade)
//   U   the band cut over the eye (a natural cave has no decks), its last metre dithered on the rock
//   C   the section facing the camera; Shift+C a slab; the cut rock capped (the rock's meshes carry userData.rock)
// The fade (KFADE) on the crystals: a blade or a beam between the camera and the walker dithers out.
(function(){
 const take=KHOST.take;
 KFADE.add(MAT_ROCK,{occluder:false});
 const fadeCrystals=()=>{let n=0;scene.traverse(q=>{if(q.userData&&q.userData.crystal&&q.material){const ms=Array.isArray(q.material)?q.material:[q.material];ms.forEach(m=>{if(!m.isShaderMaterial){KFADE.add(m);n++;}});}});return n;};
 KHOST.take=function(o){
  fadeCrystals();
  return take(Object.assign(o,{solid:KHOST.solidFrom({cavern:CAVE.C}),follow:{dist:4},
   cutaway:Object.assign({},o.cutaway||{},{caps:{color:'#3b302a'},band:{above:2.2,soft:1},section:{slab:8}})}));};
})();
