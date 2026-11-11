// ================================================================= THE IZIZ CLUSTER: the kits, which biome kits grow here
// [G data] The open world's kit registry (core/world/41-world-fields.js reads it at init: each entry's overlay is the
// biome region, or here the list of them (the shim below), it grows on, matched by name). The cut is the savage hyperjungle's round Girder and
// Mav's Refuge (and a corner of hyperjungle S), and the savannah rims' round Talia (the SE rim's, the E rim's, a pixel of
// the NE rim's):
//   hyperjungle        on the savage hyperjungle and hyperjungle S: the kit has no pass table as data, so its numbers
//                      are Pinnacle's (openworld/pinnacle/src/47-world-kits.js, from the retired little demo)
//   abyssal-savannah   on the savannah rims: its own trees (ABSAV_WORLD, 49-world-absav.js), reading 'upland' as the
//                      height above the abyss floor (fields)
//   eastabyss          the eastern abyss's species the savannah borrows (their own registry; the savannah's weight)
// The savannah's eastabyss entry must stay second (49-world-absav.js maps its weight from index 1 to 0).
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
const H=(...a)=>KRAND.hash(...a),U=u=>KRAND.unit(u);
const HJ_SHARE=[.22,.17,.22,.11,.17,.11];
/* the savannah reads 'upland' as the height above the abyss floor (WORLD.abyssUp: 0 the lake shore .. 1 the rim's top), as
   the retired little demo gave the abyss kits: the world's own upland is the plateau's mountains, 0 on Talia's low rim,
   where the kit's parkland, steppe and foot zones would all be 0 and nothing would grow */
const UP={upland:'abyssUp'};
const hjSpecies=(x,z,h)=>{if(U(H(h,91))<.26)return Math.floor(U(H(h,92))*6);const u=BIO.standAt(x,z,4000)/4000;let a=0;for(let k=0;k<6;k++){a+=HJ_SHARE[k];if(u<a)return k;}return 5;};
return[{name:'abyssal-savannah',global:'ABSAV_WORLD.absav',overlay:['se savannah rim','e savannah rim','ne rim'],lod:LOD,floor:null,fields:UP},
 {name:'eastabyss',global:'ABSAV_WORLD.eastabyss',overlay:null,lod:LOD,floor:null,fields:UP},
 {name:'hyperjungle',global:'HYPERJUNGLE',overlay:['savage hyperjungle','hyperjungle s'],
  lod:{hero:[2,300,420],mid:[7,900,1500],far:[40,5000,7000],sapling:[0,800,800]},
  passes:[{cell:165,accept:()=>.9,opt:{patch:0,pad:20},far:true,pick:hjSpecies},
          {cell:74,accept:()=>.55,opt:{patch:.5,pad:6},far:false,sapling:true,pick:hjSpecies}],
  floor:{profiles:{floor:{}},pick:()=>({floor:1})}}];})();
// a kit's export object by its expression (a top-level const is not on window: an indirect eval reaches it)
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
/* a kit on several overlays: core/world/41-world-fields.js finds a biome's kit with WORLD_KITS.findIndex(k=>k.overlay===name);
   this tries the entry as it is, then once a name of its list. A shim until 41 takes a list itself (TODO.md, "Ride along
   with the next all-builds rebuild": the change moves every page that reads core/world) */
WORLD_KITS.findIndex=function(f){for(let i=0;i<this.length;i++){const k=this[i];if(f(k,i,this))return i;
 if(Array.isArray(k.overlay)&&k.overlay.some(n=>f(Object.assign({},k,{overlay:n}),i,this)))return i;}return -1;};
