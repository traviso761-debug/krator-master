// ================================================================= BIOME BINDING (host side)
// The Ancients kit's contract with the Krator biome kits (biomes/<name>/,
// BIOME-API.md). This is the ONLY world-specific file in the port: the cores
// (75-biome-10..40) and both biomes (76-5x..7x, hyperjungle and eastabyss) came
// across from biomes/ unchanged, which is the claim the contract makes and the
// thing this port tests.
//
// FRAGMENT NUMBER IS LOAD-BEARING. The API requires BIO.init to run after the
// host's terrain exists and BEFORE fragment 50 — the species fragments read the
// host through BIO at load. This was first written as 76-75-biome-bind.js,
// which sorts AFTER 76-50, and the ordering rule is the whole reason this kit
// concatenates by filename. 45 puts it between the core and the species.
//
// THE CORE IS THE EASTABYSS ONE, which is the hyperjungle core plus three
// additive things (origin lists, climate fields, BIO.grid box/noMask). The
// eastabyss API states a hyperjungle fragment runs unchanged on it, and the two
// kits' 20-core-kit.js and 30-core-foliage.js are byte-identical, so taking the
// superset is what makes BOTH biomes available rather than whichever was copied
// last.
const BIOMASK=[];
function biomeClear(x,z,r,soft){BIOMASK.push({x:x,z:z,r:r,soft:soft==null?140:soft});}
// The host cuts the clearings; the biome never knows why. A type that pushes
// nothing gets grown straight through — correct for a ruin, a bug for an
// intact one, and telling those apart is what the biome pass is for.
BIO.init({THREE:THREE,terrainH:terrainH,
 mask:(x,z)=>{let m=1;
  for(let i=0;i<BIOMASK.length;i++){const c=BIOMASK[i];
   const dd=Math.hypot(x-c.x,z-c.z);
   if(dd<c.r)return 0;
   if(dd<c.r+c.soft)m=Math.min(m,(dd-c.r)/c.soft);}
  return m;},
 obstacles:[],
 // no tick registry in this kit — see KNOWN_ISSUES. Without it nothing sways.
 ticks:(typeof tick==='function')?tick:(fn=>{}),
 seed:9480,origin:[0,0],
 // THE CLIMATE. eastabyss zones itself entirely from these four, and
 // BIO.fieldDefault only covers wet/salt/upland — ask it for `flow` without
 // supplying one and BIO.field throws. All four are given explicitly.
 // These are placeholders: flat, dry, unzoned. A target that wants eastabyss to
 // read as a basin has to hand in real fields, and that is per-target work.
 fields:{wet:(x,z)=>terrainH(x,z)<2?.85:.5,
         salt:(x,z)=>0,
         upland:(x,z)=>0,
         flow:(x,z)=>0},
 err:(typeof reportErr==='function')?reportErr:(m=>console.error(m)),
 // charge biome geometry to its own key so --assert budgets it separately
 // instead of silently inflating whatever type it grows around
 stat:(k,tris,inst)=>{const t=TSTAT.by['biome/0']||(TSTAT.by['biome/0']={tris:0,inst:0,meshes:0});
  t.tris+=tris;t.inst+=inst;}});
