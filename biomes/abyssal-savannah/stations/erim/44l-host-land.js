// ================================================================= HOST — THE LAND (station 2: the e savannah rim near Fridon, the old lines)
// biomes/hyperjungle/PLAN-LANDS.md sections 5.1 and 9 (J5, 2026-11-08): near Fridon (px 755,601), ~1,490 mm, Am 53% and Aw 32%, 1.77 atm,
// ~800 m below the plateau's rim. East of it the e highlands (the cushion plateau, where everything grows toward the giant) and beyond
// them the eastern abyss (the coal-swamp jungle). *Proposed* (taken as proposed here, the owner to confirm): the abyss's Palaeozoic
// lineages have come down to the monsoon savannah as fire-hardened relics, as cycads and grass-trees hold Australia's fire savannahs, and
// the highlands' pull toward the giant shows in the rim's own species, fading from east to west. Its cousins (BIO.kin: core/biome 32, the
// source kits read in place, build.py NEIGH): the fire scale-tree (eastabyss.sigillaria), the monsoon cycad (eastabyss.cycad: the
// post-burn flush), the dambo horsetail (eastabyss.horsetail), the ember spike (ehighlands.vigil: whole stands flowering after the burn,
// leaning toward the giant), the monsoon ragbark (ehighlands.ragbark: deciduous, its crown combed toward the giant), the bolster
// (ehighlands.cushion: emerald in the rains, fire-orange in the dry), the glass wand (ehighlands.glasstower, small: Fridon's wormwick,
// proposed). From the west by reach (H1) the savage jungle's comb tree on the gallery's edges and elephant ear in the gullies.
// H4 (core/biome 39): BIO.setGiant at the canon 66 degrees and the e highlands' builders bound to it (EHIGH.setGiant(BIO.GIANT_AZ)); the
// pull a weight of the bearing toward the giant, fading west.
const LAND={key:'east',name:'The e savannah rim (ideal type)',sky:{px:755,py:601,label:'the e savannah rim near Fridon'},
 title:'Krator biome — the savannah rims: the old lines',hint:'Station 2: the e rim near Fridon: fire scale-trees, the post-burn cycad flush, ember spikes leaning to the giant',
 air:{pressure:1.77,humidity:.65},R:3000,
 rise:{dir:[1,-.15],m:120},
 river:{pts:[[3300,-300],[2400,-700],[1500,-300],[600,300],[-400,100],[-1400,500],[-3300,200]],w:28,depth:2.4},
 edge:{dir:[-1,0],at:2300,w:800,kind:'jungle'},
 kopjes:[[2200,1600,80,22],[1600,2300,55,15]],laterite:.4,dambos:[[2500,-1600,260],[-300,-1900,220],[1100,1700,200]],
 grass:{redoat:1,blind:.05},palette:{straw:[154,120,72],soil:[132,72,44],green:[84,104,48]},
 trees:{thorn:.35,borassus:.35,gallery:1,kapok:.25,baobab:.2,bone:0,blood:0},
 fires:[{ago:.02,x:2600,z:-2300,frac:.05,veer:.15},{ago:1.1,x:-1800,z:1600,frac:.08,veer:.2},{ago:2.3,x:900,z:-1500,frac:.08,veer:.3},{ago:3.8,x:2300,z:900,frac:.1,veer:.2}],
 wind:[-1,.2],kinMin:6,
 need:{firescale:20,monsooncycad:30,dambotail:20,emberspike:40,monsoonrag:20,bolster:40,glasswand:10,combtree:2,elephantear:20},
 views:{'The old lines':[-400,30,-800,900,20,0],'Toward the giant':[-1600,24,1200,1400,60,-1600]},
 // the reach's homes (H1): the savage hyperjungle ~9 km west of the map's centre, the eastern abyss ~14 km east (past the highlands)
 home:{savage:x=>Math.max(0,x+9000),eastabyss:x=>Math.max(0,14000-x)}};
var HYPERJUNGLE_LOOK={deciduous:[3,5]};
