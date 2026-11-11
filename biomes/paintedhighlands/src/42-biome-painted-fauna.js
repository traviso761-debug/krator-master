// ================================================================= PAINTED HIGHLANDS — the fauna, by name (PLAN.md section 4, "Fauna")  [G data]
// The fauna kit (kits/fauna, KratorFauna) owns every animal; this kit only names where each lives on the plateau and in what numbers, so a world (the
// open world's streaming, a settlement plan's herds) can place them from the fauna kit's own builders. `animal` is a kits/fauna key; `owed` marks an
// animal the plan wants that the fauna kit does not have yet (kits/fauna/BIOME-FAUNA-PLAN.md, the painted highlands row). Plain data.
//   zone      the kit's zones (bare, bloom, steppe, rim, ecotone) or a landform (scarp, playa, canyon, hills)
//   group     [lo, hi] animals in a band; season: when they are there (the bloom's calendar stages, 41)
var PAINTED_FAUNA=[
 {animal:'swift-pronghorn',name:'Swift pronghorn',role:'grazer',zone:['steppe','bloom','playa'],group:[8,40],season:['melt','bloom','seed','straw'],
  note:'the plan\'s steppe herd: on the dip slopes and the playas through the green, down to the lower plateau in winter. Shared with the north-west lowlands; a plateau grazer of its own is owed'},
 {animal:'badland-bighorn',name:'Badland bighorn',role:'grazer',zone:['scarp','canyon','rim'],group:[3,12],season:['snow','melt','bloom','seed','straw'],
  note:'on the danxia scarps and the canyon\'s ledges; shared with the eastern badlands'},
 {animal:'carrion-condor',name:'Carrion condor',role:'flyer',zone:['scarp','canyon'],group:[1,4],season:['melt','bloom','seed','straw'],
  note:'the raptors on the scarps\' updraughts; shared with the eastern badlands'},
 {animal:'badland-cougar',name:'Badland cougar',role:'predator',zone:['canyon','rim','scarp'],group:[1,1],season:['snow','melt','bloom','seed','straw'],
  note:'follows the bighorn; shared with the eastern badlands'},
 {animal:'giant-honeybee',name:'Giant honeybee',role:'pollinator',zone:['bloom'],group:[20,200],season:['bloom'],wild:true,
  note:'the bloom\'s pollinators as swarms over the drifts (the kit\'s domestic bee, gone wild); a native bee is owed'},
 {animal:null,owed:'plateau-marmot',name:'Plateau marmot (owed)',role:'grazer',zone:['hills','steppe'],group:[4,15],season:['melt','bloom','seed'],
  note:'ground squirrels and marmots in the clay hills, burrowed into the soft beds: owed to kits/fauna (BIOME-FAUNA-PLAN.md)'},
 {animal:null,owed:'painted-lady',name:'Painted lady (owed)',role:'pollinator',zone:['bloom'],group:[50,2000],season:['bloom'],
  note:'a painted-lady-like butterfly migrating through the bloom in clouds: owed to kits/fauna (its jungle butterfly\'s builder, recoloured)'},
 {animal:null,owed:'korona-strays',name:'Strays from Korona\'s ring (owed)',role:'mixed',zone:['ecotone'],group:[1,3],season:['melt','bloom','seed','straw'],
  note:'a few of Korona\'s animals up the cliff town\'s wall: Korona has no fauna row yet (BIOME-FAUNA-PLAN.md, "Not planned yet")'}];
