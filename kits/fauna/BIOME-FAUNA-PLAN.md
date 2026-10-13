# Biome fauna plan (proposal, 2026-10-12)

The brief: every biome gets at least **two unique grazers, one predator, one unique flyer and one water creature**; the Throne's
sub-biomes consolidate and share. `✓` = already in the kit (kept, counted as that biome's); **bold** = new, procedural in the kit's
style (a Meshy pass can replace any of them later). "Shares" = drawn once, tagged for several biomes.

| Biome | Grazers (2) | Predator | Flyer | Water creature |
|---|---|---|---|---|
| **hyperjungle** | hyperjungle strider ✓, forest tapir ✓ | giant spider ✓ / lattice mantis ✓ / vine boa ✓ | giant dragonfly ✓, atlas moth ✓, jewel macaw ✓ (+ more) | **armoured river caiman** |
| **northern highlands** | **ridge ibex**, **upland elk** | **grey highland wolf** | **crag eagle** | **giant river otter** |
| **northwestern lowlands** | **lowland aurochs**, **swift pronghorn** | **red dire-fox** | **marsh harrier** | **giant beaver** (builds dams) |
| **southwestern lowlands (Dalab)** | dalab lizard ✓, **duckbill browser** | **ridge raptor** | **sail-wing pterosaur** | **long-snout gharial** |
| **southwest bay** | plains grazer ✓, **dune hartebeest** | savannah stalker ✓ | savannah glider ✓ | bay swimmer ✓ |
| **northwest bay** | **cliff sheep**, **marsh deer** | **shore bear** (fishing bear) | bay soarer ✓ | bay swimmer ✓ (shared) |
| **eastern high desert** | mule deer ✓, **desert oryx** | coyote ✓ | desert kite ✓ | **giant oasis terrapin** |
| **eastern abyss** | **abyssal saiga**, **brine-flat onager** | **abyss hyena** | flamingo ✓ | **giant brine crab** |
| **eastern badlands** | **badland bighorn**, goat ✓ | **badland cougar** | **carrion condor** | **giant spadefoot toad** (ephemeral pools) |
| **crater drylands** | bison ✓, ash runner ✓ | salamander ✓ | **burn-hawk** | **hot-spring axolotl** |
| **East Rift Highlands (Xanadu)** | yak ✓, **plateau kiang** | **cloud leopard** | **bone-eater** (lammergeier) | **ice-lake char** |
| **southern highlands** | **argali**, **chamois** | **mountain lion** | **mountain condor** | **giant hellbender** |
| **eastern highlands (cushion plateau, 0.6 atm)** | **cushion llama**, **viscacha** | **thin-air puma** | **thin-air kite** | **altiplano lake frog** |
| **the Rift (alien)** | **lichen-cropper**, **slime-grazer** | **rift stalker** | **glow-wing** | **acid-pool eel** |
| **Ring Sea (coast and isles)** | **isle tortoise**, **shore iguana** | **tide fox**; **ring shark** at sea | ring flyer ✓ (flyers) | **giant sea lion** (built) + **ring whale** |
| **Steampits / geyser fields** (shared with the Throne's vents) | shares: kipuka tortoise-grazer, ash goat | shares: vent hunter | **steam kite** | **steam newt** (boiling pools) |
| **The Throne** (all sub-biomes) | **kipuka tortoise-grazer**, **ash goat**; windward cloudforest shares the hyperjungle's tapir and strider; savanna shares swbay's plains grazer; ashdesert shares crater drylands' bison | **vent hunter** (lee side); shares salamander, savannah stalker | **pumice petrel**; shares steam kite, burn-hawk | shares steam newt (vents), giant sea lion and ring whale (coast) |

**Throne consolidation.** Its ten sub-biomes (cloudforest, savanna, ashdesert, kipuka, caldera, vents, tube, glacier, isle, frontier) map
onto kits that already have creatures: the windward jungle uses the hyperjungle's, the savanna the swbay savanna's, ashdesert and kipuka the
crater drylands', the glacier Xanadu's yak and cloud leopard, the isle and coast the Ring Sea's. Only five creatures are the Throne's own
(kipuka tortoise-grazer, ash goat, vent hunter, pumice petrel, steam newt/kite shared with the geyser fields).

**Not planned yet:** Korona, the scablands and tuff country (the biomes are not placed on the map).

**Count.** About 55 new animals across 17 biome rows (3 to 6 variants each). Land animals need a shared procedural quadruped builder
(a body, neck and head, four jointed legs, a tail, coat or scale bands, horns and antlers as options) so they are variants of a few
bodies, not 40 bespoke builds; birds and flyers reuse `faHiBird`; water animals need a swimmer builder (fish, ray, newt, crab).

## Progress

- **Wave 1 (2026-10-13), built:** north-west lowlands, south-west lowlands (Dalab), Xanadu, the Rift, eastern badlands, the Throne and the
  geyser fields (29 animals in `krator-fauna-wild.js`, tagged by their biomes; the pumice petrel also `ringsea`). The Ring Sea has its sea lion
  (`krator-fauna-ringsea.js`). Hyperjungle already had its set.
- **Wave 2 (2026-10-13), built:** the northern, southern and eastern highlands, 15 animals in `krator-fauna-wild.js` (ridge ibex, upland elk, grey highland wolf, crag eagle, giant river otter; argali, chamois, mountain lion, mountain condor, giant hellbender; cushion llama, plateau viscacha, thin-air puma, thin-air kite, altiplano lake frog).
- **Wave 3 (2026-10-13), built:** the north-west bay (cliff sheep, marsh deer, shore bear), the south-west bay's second grazer (dune hartebeest), the eastern abyss (abyssal saiga, brine-flat onager, abyss hyena, giant brine crab), the eastern high desert (desert oryx, giant oasis terrapin), the crater drylands (burn-hawk, hot-spring axolotl) and the Ring Sea (isle tortoise, shore iguana, tide fox, ring shark, ring whale): 19 animals. Every biome in the table now has its two grazers, a predator, a flyer and a water creature.
- **Left:** Korona, the scablands and tuff country (biomes not placed yet); a Meshy pass on any of these (credits).

- **Domestic stock (2026-10-13):** donkey, mule, goose, turkey, rabbit, alpaca, reindeer, bactrian camel, homing pigeon, giant honeybee (tagged `domestic`, with traits for riding, draught and milk), rounding out the farm group's cattle, horse, sheep, pig, hen, goat, duck, dog, cat, yak, water buffalo and the lizard-world stock.
- **Sea and lake fauna (2026-10-13):** ring dolphin, giant sea turtle, manta ray, giant ring squid, glass jellyfish, reef octopus, ring marlin, banner reef fish, ring cormorant (Ring Sea and the bays); giant pike, lake sturgeon, giant catfish, lake plesiosaur, lake diver (lakes and rivers).
- **Meshy pass (pending credits):** the weakest procedural animals, to replace with baked models: goose, turkey, camel, and the biped/ small-bird builds; the account is at 6 credits (a preview is 20, a refine 10).
