// ================================================================= PINNACLE — the kits: which biome kits grow here
// [G data] The open world's kit registry (core/world/41-world-fields.js reads it at init: each entry's overlay is the biome
// region it grows on, matched by name). Since 2026-11-10 the rock stands on the savage hyperjungle's north-east edge (the
// owner: "a bit more forest"), so the cut is half the savage hyperjungle's (490 px) and half the NE rim's (471 px):
//   hyperjungle        on the savage hyperjungle: the kit has no pass table as data, so its numbers are given here as the
//                      retired little-demo gave them (archive/little-demo/src/47-world-kits.js): heroes in its stands
//                      (its shares over BIO.standAt, a quarter off-pattern), saplings under them, its floor
//   abyssal-savannah   on the NE rim: its own trees (ABSAV_WORLD, 49-world-absav.js)
//   eastabyss          the eastern abyss's species the savannah borrows (their own registry; the savannah's weight)
// The savannah's eastabyss entry must stay second (49-world-absav.js maps its weight from index 1 to 0).
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
const H=(...a)=>KRAND.hash(...a),U=u=>KRAND.unit(u);
const HJ_SHARE=[.22,.17,.22,.11,.17,.11];
const hjSpecies=(x,z,h)=>{if(U(H(h,91))<.26)return Math.floor(U(H(h,92))*6);const u=BIO.standAt(x,z,4000)/4000;let a=0;for(let k=0;k<6;k++){a+=HJ_SHARE[k];if(u<a)return k;}return 5;};
return[{name:'abyssal-savannah',global:'ABSAV_WORLD.absav',overlay:'ne rim',lod:LOD,floor:null},
 {name:'eastabyss',global:'ABSAV_WORLD.eastabyss',overlay:null,lod:LOD,floor:null},
 {name:'hyperjungle',global:'HYPERJUNGLE',overlay:'savage hyperjungle',
  lod:{hero:[2,300,420],mid:[7,900,1500],far:[40,5000,7000],sapling:[0,800,800]},
  passes:[{cell:165,accept:()=>.9,opt:{patch:0,pad:20},far:true,pick:hjSpecies},
          {cell:74,accept:()=>.55,opt:{patch:.5,pad:6},far:false,sapling:true,pick:hjSpecies}],
  floor:{profiles:{floor:{}},pick:()=>({floor:1})}}];})();
// a kit's export object by its expression (a top-level const is not on window: an indirect eval reaches it)
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
