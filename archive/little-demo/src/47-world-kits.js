// ================================================================= OPEN WORLD — the kits: which biome kits grow here, and how each slots in
// [G data] One entry per biome kit. A NEW KIT JOINS THE WORLD HERE, and with its fragments as one block in build.py's
// KITS (README.md, "Adding a kit"). Everything else (the fields, the nursery, the flora's placement and drawing, the
// floor) reads this table; nothing names a kit anywhere else.
//   name      the kit's registry name (its first fragment calls BIO.kit(name))
//   global    the global its fragments export (SEDESERT): read when the world first grows something, not at load
//   overlay   the scale model's biome overlay it grows on (lower case, as region.json's biomes[].name)
//   lod       how far each level reaches, each [metres per metre of the tree's height, at least, at most]: hero, mid,
//             far (only species with an impostor); sapling for a kit with immature trees
//   fields    (optional) a field the kit reads its own way: {upland:'abyssUp'} hands it WORLD.at's abyssUp as 'upland'
//   passes    (optional) its pass table when the kit has none as data; otherwise KIT.PASSES is read. A pass may carry
//             pick(x,z,h) -> species (the hash h for an off-pattern draw); {stand:true, sp:[a,b]} picks by the kit's stands
//   floor     profiles: the fields that make the kit's zones() give each zone (its buildFloor mixes plants by zone);
//             pick(x,z) -> {profile: weight} from its zones at a point (the world reads BIO.field through the host)
var WORLD_KITS=(function(){
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const H=(...a)=>KRAND.hash(...a),U=u=>KRAND.unit(u);
// the hyperjungle's species come in stands: its shares (55-biome-hyperjungle-trees.js SHARE) over BIO.standAt, a quarter off-pattern
const HJ_SHARE=[.22,.17,.22,.11,.17,.11];
const hjSpecies=(x,z,h)=>{if(U(H(h,91))<.26)return Math.floor(U(H(h,92))*6);const u=BIO.standAt(x,z,4000)/4000;let a=0;for(let k=0;k<6;k++){a+=HJ_SHARE[k];if(u<a)return k;}return 5;};
return[
 {name:'sedesert',global:'SEDESERT',overlay:'sedesert',
  lod:{hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]},
  floor:{profiles:{scrub:{wet:.12},scrubwet:{wet:.45},bad:{rock:.85,slope:.2},mtn:{upland:.5,rock:.3,slope:.35},
    rip:{canyon:1,wet:.85,flow:.4,slope:.05},rim:{rim:1,rock:.3},dune:{dune:1,wet:.05}},
   pick:(x,z)=>{const Z=SEDESERT.zones(x,z),dry=Z.wet<.3;
    return{scrub:dry?Z.scrub*.95:0,scrubwet:dry?0:Z.scrub*.95,bad:Z.bad*.5,rip:Z.rip*1.3+Z.bank*1.2,mtn:Z.mtn*.6,rim:Z.rim*.7+Z.bench*.5,dune:Z.desert*.35};}}},
 {name:'eastabyss',global:'EASTABYSS',overlay:'e abysss',
  lod:{hero:[14,90,240],mid:[50,320,1000],far:[200,900,3000]},
  fields:{upland:'abyssUp'},
  floor:{profiles:{jung:{abyssUp:.45,wet:.75},sav:{abyssUp:.9,wet:.4},marsh:{abyssUp:.05,wet:.85,salt:.1},flat:{abyssUp:.02,wet:.1,salt:.8}},
   pick:(x,z)=>{const Z=EASTABYSS.zones(x,z);return{jung:Z.jung,sav:Z.sav,marsh:Z.marsh+Z.shore*.5,flat:Z.flat};}}},
 {name:'hyperjungle',global:'HYPERJUNGLE',overlay:'hyperjungle',
  lod:{hero:[2,300,420],mid:[7,900,1500],far:[40,5000,7000],sapling:[0,800,800]},
  // the kit scatters its heroes by count round a showcase and has no pass table: its numbers, as data (KNOWN_ISSUES.md)
  passes:[{cell:165,accept:()=>.9,opt:{patch:0,pad:20},far:true,pick:hjSpecies},
          {cell:74,accept:()=>.55,opt:{patch:.5,pad:6},far:false,sapling:true,pick:hjSpecies}],
  floor:{profiles:{floor:{}},pick:()=>({floor:1})}},
 // the eastern badlands: zoned by cold and wet first (BSh to EF); its 'geo' (sulphur vents) and 'barren' (ice cap, airless
 // rim) read 0 until the world binds them (biomes/ebadlands/KNOWN_ISSUES.md), so it has no vent profile yet
 {name:'ebadlands',global:'EBADLANDS',overlay:'e badlands',
  lod:{hero:[14,90,260],mid:[50,320,1000],far:[200,900,3000]},
  floor:{profiles:{waste:{wet:.08},steppe:{wet:.3,cold:.35},bad:{rock:.85,slope:.3,wet:.15,cold:.15},vale:{wet:.62,cold:.12},
    pine:{wet:.38,cold:.45},boreal:{wet:.42,cold:.75},tundra:{wet:.3,cold:.93},rip:{canyon:1,wet:.85,flow:.45,slope:.05,cold:.2},rim:{rim:1,rock:.3,wet:.25,cold:.3}},
   pick:(x,z)=>{const Z=EBADLANDS.zones(x,z);
    return{waste:Z.waste*.7,steppe:Z.steppe,bad:Z.bad*.45,vale:Z.vale*1.3,pine:Z.pine*.9,boreal:Z.boreal*.9,tundra:Z.tundra*.75,rip:Z.rip*1.3,rim:(Z.rimZ+Z.bench)*.6};}}}];})();
// a kit's export object by its global's name (a top-level const is not on window: an indirect eval reaches it)
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
