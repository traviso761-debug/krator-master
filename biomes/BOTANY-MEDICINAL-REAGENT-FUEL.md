# Krator Comprehensive Biome Survey: Medicinal, Reagent & Fuel Plants

> [!NOTE]
> This survey covers all procedural biomes in Krator, scanning tree species (`SPECIES`), floor flora (`PLANTS`), and station overlays. Across 50 biomes with plant systems, **46 biomes** yield **374 distinct species** qualifying as **Medicinal (283)**, **Reagent (30)**, or **Fuel (156)**.

## Executive Survey & Architecture

### 1. Tag Architecture
In Krator's biome core (`core/biome/`), plant harvests and ecological traits are declared through the `HV(...)` helper, typically shaped as:
```javascript
HV(wood, edible, medicinal, notes, fruit)
```
- **`wood`**: Defines structural yield (`'timber'`, `'fibre'`, `'none'`) or combustion properties (`'fuel'`, `'fuel (charcoal)'`, `'firewood'`, `'tinder'`, `'torch resin'`).
- **`edible`**: Array of edible parts (`['fruit']`, `['roasted seed']`, `['sap']`, `[]`).
- **`medicinal`**: Boolean flag (`true` / `false`). When `true`, the plant carries proven medicinal, pharmacological, or wound-dressing value.
- **`notes`**: Contextual lore detailing preparation methods (salves, decoctions, poultices, fever teas, tonics, arrow poisons, drying techniques).
- **`reagent` / `gather` / `fruit`**: Fifth parameter or property indicating alchemical reagents (`'reagent'`), monastic ritual items, or specific harvestables.
- **Crops Kit Integration (`kits/crops/`)**: Utility crops (`reagent`, `fuel`, `medicine`, `dye`) are plain records (`[G data]`) mapped to their native home biomes (`home`, `src`).

### 2. Biome Summary Statistics

| Biome | Total Catalogued | Medicinal | Reagent | Fuel | Notable Species & Uses |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`abyssal-savannah`** | **7** | 7 | 1 | 2 | Shelf umbrella-tree (F/M), Red oat grass (M), Umbrella thorn (F/M), +4 more |
| **`arch`** | **8** | 3 | 2 | 3 | Verdigris cap (R), Seep comb (M), Maquis she-oak (Gymnostoma deplancheanum) (F), +5 more |
| **`catch`** | **6** | 3 | 0 | 5 | Euphrates poplar (F/M), Salt cedar (F/M), Dune shrub (sand juzgun) (F), +3 more |
| **`clivobredos`** | **2** | 1 | 0 | 1 | Throat comb (combos) (M), Husk (huscos) (F) |
| **`copperglacier`** | **1** | 0 | 0 | 1 | Verdigris cushion (F) |
| **`crater-drylands`** | **9** | 7 | 0 | 4 | Prism mallee (F/M), Frill-tree (F), Ghost gum (M), +6 more |
| **`cut`** | **1** | 1 | 0 | 0 | Circle lichen (M) |
| **`eastabyss`** | **4** | 3 | 0 | 3 | Bell-bark (M), Shelf umbrella-tree (F/M), Sanfordacaulis (F), +1 more |
| **`ebadlands`** | **15** | 15 | 0 | 5 | Pinyon pine (F/M), Utah juniper (F/M), Engelmann spruce (M), +12 more |
| **`ehighlands`** | **15** | 13 | 0 | 8 | Poured cushion (F/M), Thorn cushion (M), Vigil spike (F/M), +12 more |
| **`farside`** | **2** | 0 | 2 | 0 | Land kelp (R), Oarweed (R) |
| **`firebliss`** | **2** | 1 | 0 | 1 | Fireweed (M), Ash tussock (F) |
| **`galvanic`** | **1** | 1 | 0 | 0 | Sulfur runner (M) |
| **`geyser`** | **4** | 2 | 0 | 3 | Thermal kanuka (F/M), Nodding clubmoss (M), Warm reed (F), +1 more |
| **`gills`** | **2** | 1 | 0 | 1 | Lime collar (M), Limewood (F) |
| **`greenstep`** | **2** | 1 | 0 | 1 | Hanging moss (F), Escargot begonia (M) |
| **`guilin`** | **5** | 3 | 0 | 2 | Camphor (M), Sweet osmanthus (M), Ring-cupped oak (F), +2 more |
| **`highrift`** | **2** | 1 | 1 | 1 | Verdigris wort (M/R), Steam heath (F) |
| **`hyperjungle`** | **12** | 10 | 0 | 5 | Ghostwood (M), Prism gum (F/M), Gate baobab (M), +9 more |
| **`k-guilin`** | **5** | 3 | 0 | 2 | Camphor (M), Sweet osmanthus (M), Ring-cupped oak (F), +2 more |
| **`korona`** | **7** | 6 | 2 | 1 | Coin tree (F), Lace fan tree (M/R), Rainbow fan (M/R), +4 more |
| **`necanyons`** | **5** | 2 | 0 | 3 | Flametip (F), Ember plum (M), Stilt lily (F), +2 more |
| **`neouterwall`** | **1** | 0 | 0 | 1 | Steam tree fern (F) |
| **`nhighlands`** | **34** | 27 | 0 | 17 | Great spruce (M), Cathedral cedar (M), Shadow hemlock (M), +31 more |
| **`nsemiarid`** | **17** | 15 | 0 | 10 | Wild pistachio (F/M), Crescent saxaul (F/M), Spring plane (M), +14 more |
| **`nwbay`** | **11** | 11 | 0 | 2 | Prism gum (M), Gate baobab (M), Ironbark (M), +8 more |
| **`nwlowlands`** | **8** | 7 | 0 | 4 | Ghost gum (F/M), Ribbon blue gum (F/M), Glow-willow (M), +5 more |
| **`nwouterwall`** | **5** | 4 | 0 | 2 | Creeping stone pine (F), Silverthorn (F/M), Ivan-chai (M), +2 more |
| **`oidong`** | **25** | 24 | 6 | 4 | Giant lotus (M), Sacred fig (M), Cherry blossom (M), +22 more |
| **`opalvalley`** | **1** | 1 | 0 | 0 | Prism fern (M) |
| **`paintedhighlands`** | **1** | 1 | 0 | 1 | Plateau sage (F/M) |
| **`rheolith`** | **9** | 0 | 9 | 0 | Choke-Coral (R), Wire-Vein (R), Foam-Reef (R), +6 more |
| **`rift`** | **14** | 9 | 0 | 9 | Lobe tree (F), Curl succulent (M), Candle stalk (F), +11 more |
| **`riftrim`** | **5** | 2 | 0 | 3 | Frost frill (F), Rimroot (M), Veil thread (F), +2 more |
| **`ringisles`** | **13** | 10 | 0 | 5 | Scrub thorn (a low flat-topped acacia) (F), Corkwood (a commiphora) (M), Salt cedar (a tamarisk) (F/M), +10 more |
| **`scablands`** | **1** | 1 | 0 | 0 | Spray fern (M) |
| **`sedesert`** | **21** | 15 | 2 | 12 | Dragon tree (M), Giant candelabra (R), Mesquite (F/M), +18 more |
| **`shighlands`** | **12** | 9 | 0 | 4 | Coilbark (F), Crozier tree fern (M), Ruffle-crown (F), +9 more |
| **`siphon-pits`** | **2** | 2 | 0 | 0 | Orange rock lichen (M), Dwarf blue willow (M) |
| **`slabfields`** | **1** | 1 | 0 | 0 | Block lichen (M) |
| **`swbay`** | **7** | 7 | 0 | 3 | Prism gum (F/M), Gate baobab (M), Dragon tree (M), +4 more |
| **`swhighlands`** | **2** | 1 | 0 | 1 | Bottle brush (F), Bulb heath (M) |
| **`swlowlands`** | **20** | 16 | 0 | 12 | Lantern mangrove (F/M), Ribbon gum (M), Sprawl oak (F/M), +17 more |
| **`throne`** | **24** | 18 | 4 | 6 | Ranj tree (M), Trumpet tree (F), Ruff tree (F), +21 more |
| **`tiers`** | **5** | 2 | 1 | 2 | Shelf oak (F), Step moss (R), Ledge heath (M), +2 more |
| **`xanadu`** | **18** | 16 | 0 | 6 | Ginkgo (M), Cloud pine (F/M), Whorl olive (M), +15 more |

---

## Specialized Registries

### Alchemical & Reagent Plants
Reagents comprise chemical precipitants, arrow & fish poisons, psychic and dream draughts, flux-reactive siloxanes, and industrial kiln ashes:

| Biome | Species | Key | Reagent Role & Ecological Context |
| :--- | :--- | :--- | :--- |
| **`abyssal-savannah`** | **Rain rose** | `rainrose` | Pink in flower at the end of the dry season. The sap is an arrow poison (a reagent). |
| **`arch`** | **Sève bleue (Pycnandra acuminata)** | `pycnandra` | Its latex is a quarter nickel: tapped and burnt, the richest nickel ore there is (agromining). |
| **`arch`** | **Verdigris cap** | `verdigris` | Poisonous: its crust is nickel. Burnt, its ash is nickel ore (bio-ore, 10-20% Ni). |
| **`farside`** | **Land kelp** | `landkelp` | the blades dried as kombu; the stipes burned for ash |
| **`farside`** | **Oarweed** | `oarweed` | cut with the land kelp, dried the same |
| **`highrift`** | **Verdigris wort** | `verdwort` | Poisonous; burnt, its ash is a copper green pigment. |
| **`korona`** | **Lace fan tree** | `lacefan` | A fungus-tree of the dim wet gorge: a twisted dark bole and tiers of translucent peach lace fans that glow at dusk. The dried fan is a reagent (a stimulant; a tonic in small doses). |
| **`korona`** | **Rainbow fan** | `rainbowfan` | THE REAGENT: a pleated fan rosette in the pavement's soil pockets, each plant one colour family (crimson, lime, teal, blue, gold, mint, cream, navy, black-red) and no two alike. The dried blades are the apothecaries' dyes and reagents; a crimson one is worth a season's climb. Grows only where the summit holds a little silt, never on the bare rock. |
| **`oidong`** | **Bell-pod willow** | `bellpod` | The beads are eaten fresh or dried like raisins; the coral bells, dried, are the monks' sleeping draught and a reagent of their stillness rites: never more than one. |
| **`oidong`** | **Camphor laurel** | `camphor` | Camphor: the wood is steamed for its crystals, the monks' liniment and a reagent that clears the head. |
| **`oidong`** | **Iridescent water lily** | `lily` | A lily of no fixed colour: violet, blue, rose and gold shift across it as the eye moves. Its root is a dream reagent, steeped. |
| **`oidong`** | **Peyote buttons** | `peyote` | Pale blue-green buttons flush with the gravel, a pink flower in the crown of each; dried, the monks' seeing reagent, taken on the flats at dawn. |
| **`oidong`** | **Sky poppy** | `poppy` | A powder-blue poppy on the slopes; its seed is a sleeping draught and a reagent of the stillness rites, and its leaves are the vat the Order's blue is dyed in. |
| **`oidong`** | **Valley ginseng** | `ginseng` | A whorl of five leaflets and a cluster of coral berries over a man-shaped root: the monks' tonic and reagent, dug after seven years. |
| **`rheolith`** | **Choke-Coral** | `chokecoral` | Crushed sinter holds fugitive throat vapours in Ranj mulch; responds to Brimstone-Iron Cake. |
| **`rheolith`** | **Etch-Halo & Selenium Rime** | `etchhalo` | Diagnostic surface tell of subsurface Flux-Creeper grazing and imminent blowout. |
| **`rheolith`** | **Flux-Creeper** | `fluxcreeper` | Frenzy-grazes silicate plugs when fed Alkali-Fluorite Salt. |
| **`rheolith`** | **Foam-Reef** | `foamreef` | Dead rafts shed onto lava benches as lightweight porous Comb-Plates. |
| **`rheolith`** | **Glassy Scar-Plug** | `scarplug` | Seals borehole casings while hot; turns brittle when poisoned with Heavy Dross. |
| **`rheolith`** | **Ringing Lava Blister** | `bellblister` | A high bell-ring (~160 Hz) marks safe load-bearing crust; a dull thud (~65 Hz) warns of foundering. |
| **`rheolith`** | **Star-Egg** | `staregg` | Dormant propagule; wakes only in a 260 degC Hot Vitriol Bath. |
| **`rheolith`** | **Throat-Collar** | `throatcollar` | Microporous zeolite sinter prized as Ranj vapour-retaining mulch. |
| **`rheolith`** | **Wire-Vein** | `wirevein` | Cold surface needles snap brittle; conducts Seebeck current across fracture walls. |
| **`sedesert`** | **Desert rose** | `rose` | The sap is an arrow poison; a little of it a heart medicine. |
| **`sedesert`** | **Giant candelabra** | `candelabra` | The milky latex blinds and blisters: a fish poison, never food. |
| **`throne`** | **Snare flowers** | `snare` | Carnivorous: they close on the insects the plume drives down. Their sap is part of the arrow poison (NOTES.md). |
| **`throne`** | **Snare plants** | `snareplant` | Pitchers, sticky discs and toothed traps: the plume drives the insects down to them. Part of the arrow poison (NOTES.md). |
| **`throne`** | **Snare raft** | `snareraft` | Carnivorous: the runners' discs hold what lands on the water. Part of the arrow poison (NOTES.md). |
| **`throne`** | **Sulphur rosette** | `sulphurrosette` | Grows in acid water. A source of the arrow poison (NOTES.md). |
| **`tiers`** | **Step moss** | `stepmoss` | Lays down lime as it grows, building rimstone dams and little pools down every wet line: the Tiers in miniature. Lime (a reagent, proposed). |

### Multi-Role Keystone Plants
Species simultaneously providing multiple survival utilities (Medicinal, Fuel, and/or Reagent):

| Biome | Species | Key | Roles | Yield & Application Profile |
| :--- | :--- | :--- | :--- | :--- |
| **`xanadu`** | **Silver scrub** | `silverscrub` | **Fuel, Medicinal** | Wood: `fuel`. A bitter wormwood tea. |
| **`xanadu`** | **Maquis (lavender, broom, cistus, rosemary, thyme)** | `maquis` | **Fuel, Medicinal** | Wood: `fuel`. Pot herbs, and cistus resin for incense. |
| **`xanadu`** | **Flame cypress** | `flamecypress` | **Fuel, Medicinal** | Wood: `timber, incense`. The wood is burned as incense. |
| **`xanadu`** | **Cloud pine** | `cloudpine` | **Fuel, Medicinal** | Wood: `carving, fuel`. The resin is a salve. |
| **`throne`** | **Sulphur rosette** | `sulphurrosette` | **Medicinal, Reagent** | Wood: `none`. Grows in acid water. A source of the arrow poison (NOTES.md). |
| **`throne`** | **Snare raft** | `snareraft` | **Medicinal, Reagent** | Wood: `none`. Carnivorous: the runners' discs hold what lands on the water. Part of the arrow poison (NOTES.md). |
| **`throne`** | **Snare plants** | `snareplant` | **Medicinal, Reagent** | Wood: `none`. Pitchers, sticky discs and toothed traps: the plume drives the insects down to them. Part of the arrow poison (NOTES.md). |
| **`throne`** | **Snare flowers** | `snare` | **Medicinal, Reagent** | Wood: `none`. Carnivorous: they close on the insects the plume drives down. Their sap is part of the arrow poison (NOTES.md). |
| **`swlowlands`** | **Sunburn tree** | `sunburn` | **Fuel, Medicinal** | Wood: `fuel`. The resin dresses sunburn, hence the name. |
| **`swlowlands`** | **Sprawl oak** | `sprawloak` | **Fuel, Medicinal** | Wood: `ship knees, fuel`. Acorns leached and ground (a catalog piece, not drawn on the stage); the bark tans leather. |
| **`swlowlands`** | **Lantern mangrove** | `mangrove` | **Fuel, Medicinal** | Wood: `poles, fuel`. The lacquered red bark tans hides and dyes nets. |
| **`swlowlands`** | **Flayed madrone** | `madrone` | **Fuel, Medicinal** | Wood: `fuel, turnery`. Bumpy red berries, mealy and sweet; the bark a tea for sore throats. |
| **`swlowlands`** | **Flame parasol** | `flame` | **Fuel, Medicinal** | Wood: `fuel`. Dark pods round sour-sweet pulp, pressed into cakes. |
| **`swlowlands`** | **Ember manzanita** | `manzanita` | **Fuel, Medicinal** | Wood: `carving, fuel`. Red berries pressed into a cider; the leaves a tea. |
| **`swlowlands`** | **Coast oak** | `coastoak` | **Fuel, Medicinal** | Wood: `fuel, tool handles`. Acorns leached and ground (a catalog piece, not drawn on the stage). |
| **`swlowlands`** | **Bay laurel** | `baylaurel` | **Fuel, Medicinal** | Wood: `turnery, fuel`. The leaves season stew; the oily berries (a catalog piece, not drawn on the stage) are roasted. |
| **`swbay`** | **Umbrella thorn** | `thorn` | **Fuel, Medicinal** | Wood: `fuel, fencing (the thorny boughs)`. The pods feed the herds; the gum is a sweet (the pods are a catalog piece, not drawn on the stage). |
| **`swbay`** | **Prism gum** | `prismgum` | **Fuel, Medicinal** | Wood: `timber (the shed strips for kindling)`. The leaf oil is a chest rub. |
| **`swbay`** | **Bracket tree** | `brackettree` | **Fuel, Medicinal** | Wood: `fuel`. The dried brackets are tinder and a styptic. |
| **`shighlands`** | **Coil juniper** | `coiljuniper` | **Fuel, Medicinal** | Wood: `fuel (dense, slow)`. The berries are steeped as a bitter; the wood is the herders' fire. |
| **`sedesert`** | **Umbrella thorn** | `thorn` | **Fuel, Medicinal** | Wood: `fuel, posts, fencing (the thorns)`. Vachellia tortilis: the browse of the steppe; the gum a sweet and a glue; the bark a tan. |
| **`sedesert`** | **Socotran pomegranate** | `pom` | **Fuel, Medicinal** | Wood: `fuel`. Punica protopunica: the sour fruit and the rind, a dye and a medicine for the gut. |
| **`sedesert`** | **Socotran frankincense** | `incense` | **Fuel, Medicinal** | Wood: `none`. Boswellia: the resin tapped from the papery bark is the incense the Izani merchant houses came for; a medicine for the lungs. |
| **`sedesert`** | **Saxaul** | `saxaul` | **Fuel, Medicinal** | Wood: `the densest firewood there is; charcoal`. Haloxylon of the salt deserts: a fire of it burns all night. |
| **`sedesert`** | **Myrrh** | `myrrh` | **Fuel, Medicinal** | Wood: `none (thorny)`. Commiphora: the resin bled from the peeling bark is myrrh, the merchant houses' second trade; a wound wash and an incense. |
| **`sedesert`** | **Mesquite** | `mesquite` | **Fuel, Medicinal** | Wood: `fuel, posts, charcoal`. Sweet pods dried and ground for mesquite cakes; the gum is a salve. |
| **`sedesert`** | **Desert rose** | `rose` | **Medicinal, Reagent** | Wood: `none`. The sap is an arrow poison; a little of it a heart medicine. |
| **`sedesert`** | **Creosote bush** | `creosote` | **Fuel, Medicinal** | Wood: `fuel`. A bitter tea for colds; it smells of rain. |
| **`ringisles`** | **Sea grape** | `seagrape` | **Fuel, Medicinal** | Wood: `fuel`. The purple grapes ripen in bunches through the dry season; the big leaves wrap food in the earth oven. |
| **`ringisles`** | **Salt cedar (a tamarisk)** | `tamarisk` | **Fuel, Medicinal** | Wood: `fuel, posts`. Grows where nothing else will on the salt; the salt workers burn it under the boiling pans. |
| **`rift`** | **Silver scrub** | `silverscrub` | **Fuel, Medicinal** | Wood: `fuel`. A bitter aromatic tea. |
| **`rift`** | **Rift acacia** | `acacia` | **Fuel, Medicinal** | Wood: `fuel, thorn fences`. The pods and the gum (the pods are a catalog piece, not drawn on the stage). |
| **`rift`** | **Peak pine** | `pine` | **Fuel, Medicinal** | Wood: `timber, fuel`. The pitch seals pots and dresses cuts. |
| **`rift`** | **Beard tree** | `beardtree` | **Fuel, Medicinal** | Wood: `fuel`. The beard moss is bedding, tinder and a wound pad. |
| **`paintedhighlands`** | **Plateau sage** | `sage` | **Fuel, Medicinal** | Wood: `fuel (kindling); incense (a smudge)`. Burnt as a smudge in the shamans' stone circles. |
| **`oidong`** | **Valley ginseng** | `ginseng` | **Medicinal, Reagent** | Wood: `none`. A whorl of five leaflets and a cluster of coral berries over a man-shaped root: the monks' tonic and reagent, dug after seven years. |
| **`oidong`** | **Temple cedar** | `cedar` | **Fuel, Medicinal** | Wood: `timber (the temple beams), incense`. The heartwood is Longsong's timber; the shavings are burned as incense and the resin seals wounds. |
| **`oidong`** | **Sky poppy** | `poppy` | **Medicinal, Reagent** | Wood: `dye (the leaves: the Order's blue)`. A powder-blue poppy on the slopes; its seed is a sleeping draught and a reagent of the stillness rites, and its leaves are the vat the Order's blue is dyed in. |
| **`oidong`** | **Peyote buttons** | `peyote` | **Medicinal, Reagent** | Wood: `none`. Pale blue-green buttons flush with the gravel, a pink flower in the crown of each; dried, the monks' seeing reagent, taken on the flats at dawn. |
| **`oidong`** | **Monk's sage** | `sage` | **Fuel, Medicinal** | Wood: `incense`. A silver wormwood on the flats, burned for incense and brewed bitter for the stomach. |
| **`oidong`** | **Iridescent water lily** | `lily` | **Medicinal, Reagent** | Wood: `none`. A lily of no fixed colour: violet, blue, rose and gold shift across it as the eye moves. Its root is a dream reagent, steeped. |
| **`oidong`** | **Cloud pine** | `cloudpine` | **Fuel, Medicinal** | Wood: `carving, fuel`. The resin is a salve (biomes/xanadu). |
| **`oidong`** | **Camphor laurel** | `camphor` | **Medicinal, Reagent** | Wood: `chests and boxes (the wood keeps the moth out)`. Camphor: the wood is steamed for its crystals, the monks' liniment and a reagent that clears the head. |
| **`oidong`** | **Bell-pod willow** | `bellpod` | **Medicinal, Reagent** | Wood: `withies`. The beads are eaten fresh or dried like raisins; the coral bells, dried, are the monks' sleeping draught and a reagent of their stillness rites: never more than one. |
| **`nwouterwall`** | **Silverthorn** | `silverthorn` | **Fuel, Medicinal** | Wood: `thorny firewood`. Sea buckthorn of the forest-steppe's gullies: silver-scaled willowy leaves, orange berries packed on the stems through the winter. A yellow dye. |
| **`nwlowlands`** | **Tall wattle** | `wattle` | **Fuel, Medicinal** | Wood: `fuel, posts`. The pod seed is roasted and ground to flour; the gum is a sweet (a catalog piece, not drawn on the stage). |
| **`nwlowlands`** | **Ribbon blue gum** | `bluegum` | **Fuel, Medicinal** | Wood: `timber`. The leaf oil is a chest rub; the shed ribbons are tinder. |
| **`nwlowlands`** | **Ghost gum** | `ghostgum` | **Fuel, Medicinal** | Wood: `fuel, posts`. The leaf oil is a chest rub. |
| **`nwbay`** | **Umbrella thorn** | `thorn` | **Fuel, Medicinal** | Wood: `fuel`. The gum is chewed; the pods are fodder. |
| **`nwbay`** | **Lantern mangrove** | `mangrove` | **Fuel, Medicinal** | Wood: `poles, charcoal`. The bark tans the nets. |
| **`nsemiarid`** | **Wild pistachio** | `pistachio` | **Fuel, Medicinal** | Wood: `fuel, carving`. The nuts split when they ripen; the resin is a chewing gum and a varnish. |
| **`nsemiarid`** | **Wild apricot** | `apricot` | **Fuel, Medicinal** | Wood: `fuel`. Dried on the roofs in late summer. |
| **`nsemiarid`** | **Wild apple** | `apple` | **Fuel, Medicinal** | Wood: `fuel, tool handles`. The Ancients' lakeside orchards gone wild: every tree a different apple. |
| **`nsemiarid`** | **Wild almond** | `almond` | **Fuel, Medicinal** | Wood: `fuel`. Most wild trees are bitter: the sweet strains are marked and guarded. |
| **`nsemiarid`** | **Steppe wormwood** | `wormwood` | **Fuel, Medicinal** | Wood: `fuel`. Bitter: a tea against worms and fevers. |
| **`nsemiarid`** | **Sea buckthorn** | `buckthorn` | **Fuel, Medicinal** | Wood: `fuel, hedging`. Thorny thickets on the margins, orange with berries in autumn; the oil heals burns. The catalog owes the berry (KNOWN_ISSUES.md). |
| **`nsemiarid`** | **Golden poplar** | `poplar` | **Fuel, Medicinal** | Wood: `timber, fuel`. Gold in its season; it sheds cotton in drifts like snow. |
| **`nsemiarid`** | **Crescent saxaul** | `saxaul` | **Fuel, Medicinal** | Wood: `fuel (the hardest in the steppe), charcoal`. Burns like coal; the caravans carry it. |
| **`nhighlands`** | **Table cedar** | `tablecedar` | **Fuel, Medicinal** | Wood: `timber`. Fragrant rot-proof timber for halls; the resin burnt as incense. |
| **`nhighlands`** | **Serpentwood** | `serpentwood` | **Fuel, Medicinal** | Wood: `fuel`. The twisted wood is prized for bows and handles. |
| **`nhighlands`** | **Rowan** | `rowan` | **Fuel, Medicinal** | Wood: `fuel`. Bitter raw; after a frost, cooked to an orange-red jelly, or wine. |
| **`nhighlands`** | **Grey alder** | `greyalder` | **Fuel, Medicinal** | Wood: `fuel`. Smoking wood; the bark dyes red and black. |
| **`nhighlands`** | **Gnarled oak** | `gnarloak` | **Fuel, Medicinal** | Wood: `fuel`. Acorns leached and ground into meal; galls for ink; the bark for tanning. |
| **`nhighlands`** | **Ghost alder** | `ghostalder` | **Fuel, Medicinal** | Wood: `fuel`. Grows where nothing else will stand the wet; the lichen on it is a wound dressing. |
| **`nhighlands`** | **Frost fir** | `frostfir` | **Fuel, Medicinal** | Wood: `fuel`. Balsam from the bark blisters. |
| **`nhighlands`** | **Fog laurel** | `foglaurel` | **Fuel, Medicinal** | Wood: `fuel`. Leaves for seasoning and for a steam against colds. |
| **`nhighlands`** | **Brook willow** | `brookwillow` | **Fuel, Medicinal** | Wood: `fuel`. Withies for baskets; the bark chewed for pain. |
| **`nhighlands`** | **Birch** | `birch` | **Fuel, Medicinal** | Wood: `fuel`. Sap in spring; the bark for boxes, canoes and tinder; chaga on the old trunks. |
| **`korona`** | **Rainbow fan** | `rainbowfan` | **Medicinal, Reagent** | Wood: `none`. THE REAGENT: a pleated fan rosette in the pavement's soil pockets, each plant one colour family (crimson, lime, teal, blue, gold, mint, cream, navy, black-red) and no two alike. The dried blades are the apothecaries' dyes and reagents; a crimson one is worth a season's climb. Grows only where the summit holds a little silt, never on the bare rock. |
| **`korona`** | **Lace fan tree** | `lacefan` | **Medicinal, Reagent** | Wood: `none (a fungus)`. A fungus-tree of the dim wet gorge: a twisted dark bole and tiers of translucent peach lace fans that glow at dusk. The dried fan is a reagent (a stimulant; a tonic in small doses). |
| **`hyperjungle`** | **Prism gum** | `prismgum` | **Fuel, Medicinal** | Wood: `timber, torch resin`. The iridescent gum seals hulls and dresses cuts; boiled down and cooled it is a torch resin that burns bright and smoky. |
| **`hyperjungle`** | **Pitch vine** | `pitchvine` | **Fuel, Medicinal** | Wood: `fuel (the resin-soaked vine, dried)`. A woody liana that hangs from the hero boles and bleeds a sticky resin from its cut stems. Dried on a rack, the vine burns hot and smoky even in the wet, so it is the jungle's torch and kindling; the resin dresses cuts and stings. |
| **`hyperjungle`** | **Krator mahogany** | `mahogany` | **Fuel, Medicinal** | Wood: `timber (the finest red wood), fuel (the spent capsules)`. The woody capsules split for winged seeds, roasted and eaten wing and all; the bark is a fever tea. The spent capsules are hard, dry and burn long: the jungle's charcoal. |
| **`highrift`** | **Verdigris wort** | `verdwort` | **Medicinal, Reagent** | Wood: `none`. Poisonous; burnt, its ash is a copper green pigment. |
| **`geyser`** | **Thermal kanuka** | `kanuka` | **Fuel, Medicinal** | Wood: `firewood, tool handles`. A tea of the leaves for fevers; the wood burns hot and clean. |
| **`ehighlands`** | **Vigil spike** | `vigil` | **Fuel, Medicinal** | Wood: `none`. Flowers once, after decades, all together across a plain; then stands as a dead torch for years. The dry spike burns like a beacon and is lit for festivals. |
| **`ehighlands`** | **Tola** | `tola` | **Fuel, Medicinal** | Wood: `fuel`. Resinous scrub; it smells of tar in the sun. |
| **`ehighlands`** | **Ragbark** | `ragbark` | **Fuel, Medicinal** | Wood: `fuel, carving`. The bark peels in a hundred papery layers: a winter coat for the tree, kindling and writing paper for people. |
| **`ehighlands`** | **Poured cushion** | `cushion` | **Fuel, Medicinal** | Wood: `fuel (resin)`. Cut and dried it burns hot with a resin smoke; a cushion takes a lifetime to grow a hand's depth, so the clans that cut them are cursed by the ones that do not. The resin is a salve for frostbite. |
| **`ehighlands`** | **Combed laurel** | `laurel` | **Fuel, Medicinal** | Wood: `timber, fuel`. The wet face's canopy tree: a laurel heavy with moss, its crown combed toward the giant and its epiphyte gardens thickest on that side. The leaves are a fever tea; the wood, hard and dark, goes down to Iziz. |
| **`ehighlands`** | **Combed fir** | `fir` | **Fuel, Medicinal** | Wood: `timber, fuel, pitch`. The treeline's tree: straight in the forest under the crest, flagged higher up with its branches only on the giant side, and at the top a mat a hand high stretched toward the giant. Its pitch seals the herders' boats on the tarns. |
| **`ebadlands`** | **Utah juniper** | `juniper` | **Fuel, Medicinal** | Wood: `fence posts, fuel`. The dusty blue berries season meat and brew; the shredded bark is tinder and cradle-board padding. |
| **`ebadlands`** | **Pinyon pine** | `pinyon` | **Fuel, Medicinal** | Wood: `fuel, posts`. The cones are roasted open for their nuts; the pitch seals baskets and dresses wounds. |
| **`ebadlands`** | **Gambel oak** | `oak` | **Fuel, Medicinal** | Wood: `fuel, tool handles`. Acorns leached of their tannin and ground for meal. |
| **`ebadlands`** | **Fremont cottonwood** | `cottonwood` | **Fuel, Medicinal** | Wood: `carving, fuel`. The roots are carved into dolls; canyon grape climbs its limbs. |
| **`ebadlands`** | **Big sagebrush** | `sage` | **Fuel, Medicinal** | Wood: `fuel`. Burned to smudge; a bitter tea for colds. |
| **`eastabyss`** | **Shelf umbrella-tree** | `umbrella` | **Fuel, Medicinal** | Wood: `light timber, fuel`. A bark tea for the gut. |
| **`eastabyss`** | **Beard oak** | `beardoak` | **Fuel, Medicinal** | Wood: `fuel, boat ribs`. The beard moss stuffs mattresses and dresses wounds. |
| **`crater-drylands`** | **Prism mallee** | `prismmallee` | **Fuel, Medicinal** | Wood: `fuel, tool handles`. The lignotuber burns slow and hot: the Scyvoi dig dead ones for charcoal. The leaf oil is a salve. |
| **`crater-drylands`** | **Ash broom** | `broom` | **Fuel, Medicinal** | Wood: `fuel`. Yellow in the regrowth; burns like paper. |
| **`catch`** | **Salt cedar** | `tamarisk` | **Fuel, Medicinal** | Wood: `fuel, poles`. Builds its own hill: the sand it traps piles into a cone under it (a nebkha), metres high. Salt crystals glitter on its twigs. |
| **`catch`** | **Euphrates poplar** | `poplar` | **Fuel, Medicinal** | Wood: `timber (twisted), fuel`. The tugai tree: it lives on groundwater ten metres down and dies standing when the water falls. Its dead stand a century. The resin (poplar "tears") is a salve. |
| **`abyssal-savannah`** | **Umbrella thorn** | `thorn` | **Fuel, Medicinal** | Wood: `fuel, fencing (the thorny boughs)`. The flat-topped thorn of the open savannah, at the dense air's size. The pods feed the herds; the gum is a sweet. |
| **`abyssal-savannah`** | **Shelf umbrella-tree** | `umbrella` | **Fuel, Medicinal** | Wood: `light timber, fuel, thorn fencing`. A bark tea for the gut (as in the eastern abyss); the gum that weeps from the bark is a glue and a paint binder (kits/crops umbrella-gum). |
| **`abyssal-savannah`** | **Rain rose** | `rainrose` | **Medicinal, Reagent** | Wood: `none`. Pink in flower at the end of the dry season. The sap is an arrow poison (a reagent). |

---

## Comprehensive Master Catalog by Biome

### Biome: `abyssal-savannah`
*Total qualifying species: **7** (Medicinal: 7, Reagent: 1, Fuel: 2)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Glass wand** | `glasswand` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['wormwick (proposed: the pallidine tonic of the moth larvae at its roots)'] | A small translucent-stemmed cousin of the glass tower on the pavements, carrying the same moth and the same pallidine: the source of Fridon's wormwick trade (proposed). |
| **Incense tree** | `incense` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['frankincense (a resin; burnt)'] | Crooked, its papery bark peeling, on the dry rocky slopes. Frankincense: Talia's caravan trade (proposed). |
| **Rain dragon** | `raindragon` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['none'] | Dragon's blood: a red resin, dye and varnish (proposed: Talia's trade). |
| **Rain rose** | `rainrose` | `Medicinal` `Reagent` | **Wood/Yield:** none | Pink in flower at the end of the dry season. The sap is an arrow poison (a reagent). |
| **Red oat grass** | `redoat` | `Medicinal` | **Wood/Yield:** none | Grazing and thatch. Green in the rains, then red-bronze, then straw; it burns every two to four years. |
| **Shelf umbrella-tree** | `umbrella` | `Fuel` `Medicinal` | **Wood/Yield:** light timber, fuel, thorn fencing<br>**Edible:** ['gum'] | A bark tea for the gut (as in the eastern abyss); the gum that weeps from the bark is a glue and a paint binder (kits/crops umbrella-gum). |
| **Umbrella thorn** | `thorn` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, fencing (the thorny boughs)<br>**Edible:** ['pods (fodder, famine)'] | The flat-topped thorn of the open savannah, at the dense air's size. The pods feed the herds; the gum is a sweet. |

### Biome: `arch`
*Total qualifying species: **8** (Medicinal: 3, Reagent: 2, Fuel: 3)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Beach morning glory (Ipomoea pes-caprae)** | `ipomoea` | `Medicinal` | **Wood/Yield:** none |  |
| **Beach naupaka (Scaevola taccada)** | `naupaka` | `Medicinal` | **Wood/Yield:** none | Its leaves are a poultice. |
| **Beach she-oak (Casuarina equisetifolia)** | `casuarina` | `Fuel` | **Wood/Yield:** fuel (the best: hot and slow) |  |
| **Maquis she-oak (Gymnostoma deplancheanum)** | `gymnostoma` | `Fuel` | **Wood/Yield:** fuel (hard, hot) | It feeds the ground: the maquis is thicker round it. |
| **Ohia lehua (Metrosideros polymorpha)** | `ohia` | `Fuel` | **Wood/Yield:** fuel, carving | Its red flowers are the first colour on a new flow. |
| **Seep comb** | `seepcomb` | `Medicinal` | **Wood/Yield:** none | Where the combs stand, the gas burns. |
| **Sève bleue (Pycnandra acuminata)** | `pycnandra` | `Reagent` | **Wood/Yield:** none | Its latex is a quarter nickel: tapped and burnt, the richest nickel ore there is (agromining). |
| **Verdigris cap** | `verdigris` | `Reagent` | **Wood/Yield:** none | Poisonous: its crust is nickel. Burnt, its ash is nickel ore (bio-ore, 10-20% Ni). |

### Biome: `catch`
*Total qualifying species: **6** (Medicinal: 3, Reagent: 0, Fuel: 5)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Brine lamp** | `brinelamp` | `Medicinal` | **Wood/Yield:** none | Krator's: a succulent whose salt glands crust its leaves in crystal, so a stand glitters at low sun. THE MEDICINE: the crusted leaf, steeped, is a salt-and-bitters remedy for heat sickness. |
| **Dune shrub (sand juzgun)** | `broom` | `Fuel` | **Wood/Yield:** fuel (the best on the sand)<br>**Edible:** ['young shoots (fodder)'] | A leafless broom of green jointed twigs; its fruit are bristly red balls the wind rolls over the sand. |
| **Euphrates poplar** | `poplar` | `Fuel` `Medicinal` | **Wood/Yield:** timber (twisted), fuel | The tugai tree: it lives on groundwater ten metres down and dies standing when the water falls. Its dead stand a century. The resin (poplar "tears") is a salve. |
| **Fallen poplar wood** | `deadwood` | `Fuel` | **Wood/Yield:** fuel | Bleached, iron-hard: the caravans burn it at the oases. |
| **Salt cedar** | `tamarisk` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, poles<br>**Edible:** ['manna (the sweet crust its scale insects leave on the twigs)'] | Builds its own hill: the sand it traps piles into a cone under it (a nebkha), metres high. Salt crystals glitter on its twigs. |
| **Saltbush** | `saltbush` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['leaves (salty greens)'] | Silver-grey mounds on the salt's edge; the caravans' beasts browse it. |

### Biome: `clivobredos`
*Total qualifying species: **2** (Medicinal: 1, Reagent: 0, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Husk (huscos)** | `husk` | `Fuel` | **Wood/Yield:** none | A dry road and a shelter; its papery skin is tinder. |
| **Throat comb (combos)** | `comb` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['comb cake (Combocacos): the catch pressed; a different poison each month'] | Every poison the jungle's spores carry: a Talovolci knows which month's cake is safe. |

### Biome: `copperglacier`
*Total qualifying species: **1** (Medicinal: 0, Reagent: 0, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Verdigris cushion** | `cushion` | `Fuel` | **Wood/Yield:** fuel (dried) | A hard dome of tiny leaves packed against the wind. It takes up copper: on the copper ground it is verdigris, elsewhere sage. |

### Biome: `crater-drylands`
*Total qualifying species: **9** (Medicinal: 7, Reagent: 0, Fuel: 4)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Ash broom** | `broom` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Yellow in the regrowth; burns like paper. |
| **Chaparral** | `chaparral` | `Fuel` | **Wood/Yield:** fuel | The fuel of the next fire. |
| **Fire lily** | `firelily` | `Medicinal` | **Wood/Yield:** none | Flowers in the char within weeks of a fire, before anything is green. |
| **Frill-tree** | `frill` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['roasted seed'] | The seed is gathered from the ash after a fire, roasted and ground: the first harvest of a burn. |
| **Ghost gum** | `ghostgum` | `Medicinal` | **Wood/Yield:** timber, poles | The white powder on the bark is a sunscreen; a gum crack yields a red resin for wounds. |
| **Prism mallee** | `prismmallee` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, tool handles<br>**Edible:** ['nectar'] | The lignotuber burns slow and hot: the Scyvoi dig dead ones for charcoal. The leaf oil is a salve. |
| **Propeller crassula** | `crassula` | `Medicinal` | **Wood/Yield:** none |  |
| **Red buckwheat** | `buckwheat` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['seed'] |  |
| **Tree aloe** | `treealoe` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['nectar'] | The leaf gel dresses burns; riders carry a cut leaf for their mounts' scorched feet. |

### Biome: `cut`
*Total qualifying species: **1** (Medicinal: 1, Reagent: 0, Fuel: 0)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Circle lichen** | `circlelichen` | `Medicinal` | **Wood/Yield:** none | Scraped and steeped as an antiseptic wash (as Usnea). |

### Biome: `eastabyss`
*Total qualifying species: **4** (Medicinal: 3, Reagent: 0, Fuel: 3)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Beard oak** | `beardoak` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, boat ribs | The beard moss stuffs mattresses and dresses wounds. |
| **Bell-bark** | `bellbark` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['scalefruit'] | Pods on the trunk and the boughs; the pale bark is a fever tea. |
| **Sanfordacaulis** | `sanfordacaulis` | `Fuel` | **Wood/Yield:** none | The fine twigs are tinder. |
| **Shelf umbrella-tree** | `umbrella` | `Fuel` `Medicinal` | **Wood/Yield:** light timber, fuel | A bark tea for the gut. |

### Biome: `ebadlands`
*Total qualifying species: **15** (Medicinal: 15, Reagent: 0, Fuel: 5)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Big sagebrush** | `sage` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Burned to smudge; a bitter tea for colds. |
| **Ember crown** | `embercrown` | `Medicinal` | **Wood/Yield:** none | The pods hold a burning sap: a blistering plaster, never food. |
| **Engelmann spruce** | `spruce` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['young tips'] | Tips steeped against scurvy; resonant wood for instruments. |
| **Fremont cottonwood** | `cottonwood` | `Fuel` `Medicinal` | **Wood/Yield:** carving, fuel<br>**Edible:** ['catkins'] | The roots are carved into dolls; canyon grape climbs its limbs. |
| **Gambel oak** | `oak` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, tool handles<br>**Edible:** ['acorns (leached)'] | Acorns leached of their tannin and ground for meal. |
| **Giant umbel** | `umbel` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['seed (as a spice)'] | The dried seed is a sharp, caraway-like spice; the sap burns skin in the sun. |
| **Maidenhair fern** | `fern` | `Medicinal` | **Wood/Yield:** none | The hanging gardens of the canyon seeps. |
| **Moss and lichen** | `moss` | `Medicinal` | **Wood/Yield:** none |  |
| **Pinyon pine** | `pinyon` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, posts<br>**Edible:** ['pine nuts'] | The cones are roasted open for their nuts; the pitch seals baskets and dresses wounds. |
| **Prickly pear** | `pear` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['tunas','young pads'] | Red tunas, peeled; young pads fried. |
| **Quaking aspen** | `aspen` | `Medicinal` | **Wood/Yield:** poles, light timber<br>**Edible:** ['inner bark (famine)'] | The powdery bloom on the bark is a sunscreen; the bark a fever tea. |
| **Red buckwheat** | `buckwheat` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['seed'] |  |
| **Rubber rabbitbrush** | `rabbitbrush` | `Medicinal` | **Wood/Yield:** none | A yellow dye from the flowers. |
| **Subalpine fir** | `fir` | `Medicinal` | **Wood/Yield:** timber, poles<br>**Edible:** ['young tips'] | The resin blisters on the bark are a salve. |
| **Utah juniper** | `juniper` | `Fuel` `Medicinal` | **Wood/Yield:** fence posts, fuel<br>**Edible:** ['berries (as a spice)'] | The dusty blue berries season meat and brew; the shredded bark is tinder and cradle-board padding. |

### Biome: `ehighlands`
*Total qualifying species: **15** (Medicinal: 13, Reagent: 0, Fuel: 8)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Combed beech** | `beech` | `Fuel` | **Wood/Yield:** timber (the best on the wall: ships' knees, the monks' book boards), fuel<br>**Edible:** ['beechmast (roasted)'] | The cool rainforest's tree on the wet face between the cloud and the firs: its tiers of small leaves thrown out toward the giant, its grey bark blotched with lichen. |
| **Combed fir** | `fir` | `Fuel` `Medicinal` | **Wood/Yield:** timber, fuel, pitch | The treeline's tree: straight in the forest under the crest, flagged higher up with its branches only on the giant side, and at the top a mat a hand high stretched toward the giant. Its pitch seals the herders' boats on the tarns. |
| **Combed laurel** | `laurel` | `Fuel` `Medicinal` | **Wood/Yield:** timber, fuel | The wet face's canopy tree: a laurel heavy with moss, its crown combed toward the giant and its epiphyte gardens thickest on that side. The leaves are a fever tea; the wood, hard and dark, goes down to Iziz. |
| **Epiphyte gardens** | `epi` | `Medicinal` | **Wood/Yield:** none | Orchids, ferns and mosses on every limb, thickest on the side that faces the giant. |
| **Gentian** | `gentian` | `Medicinal` | **Wood/Yield:** none |  |
| **Giant** | `treefern` | `Fuel` | **Wood/Yield:** fibre (the trunk's root mantle: planters, walls, kindling)<br>**Edible:** ['young croziers (cooked)'] | Its fronds fan toward the giant, longest on that side, so a slope of them looks combed. The croziers are eaten in spring, boiled twice. |
| **Glass tower** | `glasstower` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['young stalk (peeled, bitter)'] | Makes pallidine in its bracts and roots. Moth larvae that feed on the roots store it; a fungus that infects them works most of it into a milder tonic (wormwick). The wild bees that work its hidden flowers carry it into their honey whole: tower honey, the dangerous version. |
| **Old man's beard** | `beard` | `Medicinal` | **Wood/Yield:** none | Hangs from every limb in the cloud: an antiseptic dressing. |
| **Poured cushion** | `cushion` | `Fuel` `Medicinal` | **Wood/Yield:** fuel (resin) | Cut and dried it burns hot with a resin smoke; a cushion takes a lifetime to grow a hand's depth, so the clans that cut them are cursed by the ones that do not. The resin is a salve for frostbite. |
| **Ragbark** | `ragbark` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, carving | The bark peels in a hundred papery layers: a winter coat for the tree, kindling and writing paper for people. |
| **Snow wool** | `snowwool` | `Medicinal` | **Wood/Yield:** none | Fist-sized cones of white wool, the last plant below the snow. Moths sleep in the wool at night. |
| **Thorn cushion** | `thorn` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['flowers (in tea)'] | Tapped for its gum: a cut at the root crown weeps a white resin that sets hard. Traded down to the lowlands as a binder for paint and medicine. |
| **Tola** | `tola` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Resinous scrub; it smells of tar in the sun. |
| **Vigil spike** | `vigil` | `Fuel` `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['heart (famine)','nectar'] | Flowers once, after decades, all together across a plain; then stands as a dead torch for years. The dry spike burns like a beacon and is lit for festivals. |
| **Wormwick** | `wormwick` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['the stalk and the larva (dried)'] | A fungus's stalk out of a moth larva's head, in the turf near the glass towers. The fungus has worked the towers' pallidine into a mild tonic: worth its weight in silver in the lowland cities. Clans fight over the slopes in the spring. |

### Biome: `farside`
*Total qualifying species: **2** (Medicinal: 0, Reagent: 2, Fuel: 0)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Land kelp** | `landkelp` | `Reagent` | **Wood/Yield:** ['kelp ash: potash and soda','iodine']<br>**Edible:** ['blade'] | the blades dried as kombu; the stipes burned for ash |
| **Oarweed** | `oarweed` | `Reagent` | **Wood/Yield:** ['kelp ash']<br>**Edible:** ['blade'] | cut with the land kelp, dried the same |

### Biome: `firebliss`
*Total qualifying species: **2** (Medicinal: 1, Reagent: 0, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Ash tussock** | `ashgrass` | `Fuel` | **Wood/Yield:** fuel (dried) | Hard tussocks that hold the ash slopes. |
| **Fireweed** | `fireweed` | `Medicinal` | **Wood/Yield:** food<br>**Edible:** ['shoots'] | Magenta spikes on new ash and burnt ground: the first plant back after a fall of ash. |

### Biome: `galvanic`
*Total qualifying species: **1** (Medicinal: 1, Reagent: 0, Fuel: 0)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Sulfur runner** | `runner` | `Medicinal` | **Wood/Yield:** none (mineral: the dead cords are sulfur, a small, clean source) | Burns blue, choking. |

### Biome: `geyser`
*Total qualifying species: **4** (Medicinal: 2, Reagent: 0, Fuel: 3)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Lodgepole pine** | `lodgepole` | `Fuel` | **Wood/Yield:** lumber, poles, fuel | The poles of a lodge. |
| **Nodding clubmoss** | `clubmoss` | `Medicinal` | **Wood/Yield:** none | Little upright trees of a clubmoss on the warm crust; the spores are a powder for burns. |
| **Thermal kanuka** | `kanuka` | `Fuel` `Medicinal` | **Wood/Yield:** firewood, tool handles<br>**Edible:** ['leaf tea'] | A tea of the leaves for fevers; the wood burns hot and clean. |
| **Warm reed** | `reed` | `Fuel` | **Wood/Yield:** thatch, fuel (dried) | Along the warm creek; cut and dried in the steam it is a quick, hot fuel. |

### Biome: `gills`
*Total qualifying species: **2** (Medicinal: 1, Reagent: 0, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Lime collar** | `collar` | `Medicinal` | **Wood/Yield:** none | Lung salt (Lãg Solṭ), scraped from a charged collar at the end of the in-breath; cut at the out-breath it is the sulphide, Bhlo-Solṭ. |
| **Limewood** | `whitewood` | `Fuel` | **Wood/Yield:** fuel (poor) | Caps crusted with the mist's minerals. |

### Biome: `greenstep`
*Total qualifying species: **2** (Medicinal: 1, Reagent: 0, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Escargot begonia** | `begonia` | `Medicinal` | **Wood/Yield:** none | Spiral-leaved begonias in the wet shade (the S highlands' habit, PLAN.md section 3); a poultice for burns. |
| **Hanging moss** | `hangMoss` | `Fuel` | **Wood/Yield:** stuffing; fuel (tinder) | Long green-gold tresses off the boulders and fallen columns in the wet. |

### Biome: `guilin`
*Total qualifying species: **5** (Medicinal: 3, Reagent: 0, Fuel: 2)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Camphor** | `camphor` | `Medicinal` | **Wood/Yield:** camphorwood (chests, carving: moths will not touch it) | The plain's great tree, its spring flush pale green to bronze. Camphor is distilled from the chipped wood: rubbed on for aches and itch, burnt against insects. |
| **Cliff scrub** | `scrub` | `Fuel` | **Wood/Yield:** firewood | The evergreen shrubs that clothe a tower's faces wherever a crack holds soil: loropetalum, sageretia, box-leaved holly. They are why the towers are green to their feet. |
| **Ring-cupped oak** | `cliffoak` | `Fuel` | **Wood/Yield:** firewood, charcoal<br>**Edible:** ['acorns (leached, ground: acorn jelly)'] | The towers' scrub forest: small, dense, evergreen, gripping the soil pockets of every ledge and the dome. The acorns sit in cups ringed like a whorl; leached of their tannin they are ground into a jelly. |
| **Stone orchid** | `orchid` | `Medicinal` | **Wood/Yield:** none | Dendrobium on the bare rock: jointed yellow-green canes and sprays of white and pink flowers. The canes, dried and twisted into coils, are a tonic for the stomach and the throat; gatherers climb the towers on ropes for it. |
| **Sweet osmanthus** | `osmanthus` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['osmanthus flowers (tea, wine, syrup, cakes)'] | A dense dark evergreen whose tiny golden flowers in autumn scent a whole valley: Guilin is named for its forests. The flowers are dried for tea, steeped in wine and boiled into syrup for cakes. |

### Biome: `highrift`
*Total qualifying species: **2** (Medicinal: 1, Reagent: 1, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Steam heath** | `steamheath` | `Fuel` | **Wood/Yield:** fuel (kindling) |  |
| **Verdigris wort** | `verdwort` | `Medicinal` `Reagent` | **Wood/Yield:** none | Poisonous; burnt, its ash is a copper green pigment. |

### Biome: `hyperjungle`
*Total qualifying species: **12** (Medicinal: 10, Reagent: 0, Fuel: 5)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Bloodwood** | `bloodwood` | `Medicinal` | **Wood/Yield:** timber | Bleeds thick red sap wherever it is cut or browsed: red dye and body paint, the Screamers' painted dots. |
| **Comb tree** | `combtree` | `Medicinal` | **Wood/Yield:** timber (pale, rarely felled)<br>**Edible:** ['giant-bee honey','wax'] | The giant bees hang combs 3-6 m long under its limbs: a flyer's job, and a dangerous one. The wax seals and lights. |
| **Crimson kapok** | `kapok` | `Fuel` | **Wood/Yield:** light timber, dugouts, fuel (the floss: tinder and wicks)<br>**Edible:** ['young pods (cooked)','seed oil'] | Ripe pods burst into cream floss for stuffing, and the dry floss is the jungle's tinder and lamp wick; the black seeds are pressed for oil. |
| **Elephant ear** | `elephantear` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['taro corm (a staple; mildly toxic until cooked)'] | Leaves 6-12 m on stalks taller than a rider; the broken, browsed clumps line the beasts' trails. |
| **Gate baobab** | `baobab` | `Medicinal` | **Wood/Yield:** none (the hollow boles are lived in)<br>**Edible:** ['gatepod pulp','seeds (roasted)','leaves (cooked)'] | The orange velvet pods are sawn into rounds; the chalky pulp dries into gatepod chalk that keeps a year. |
| **Ghost pipe** | `ghostpipe` | `Medicinal` | **Wood/Yield:** none | Waxy white, no chlorophyll; it turns black when touched. A sedative (proposed medicine). |
| **Ghostwood** | `ghostwood` | `Medicinal` | **Wood/Yield:** light timber, carving | The pale bark is scraped for a fever tea; the violet racemes feed the sky rays. |
| **Heliconia and ginger** | `ginger` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['ginger rhizome'] | The rhizome spices food and settles the stomach; the bracts hold rain water. |
| **Krator mahogany** | `mahogany` | `Fuel` `Medicinal` | **Wood/Yield:** timber (the finest red wood), fuel (the spent capsules)<br>**Edible:** ['seeds (roasted)'] | The woody capsules split for winged seeds, roasted and eaten wing and all; the bark is a fever tea. The spent capsules are hard, dry and burn long: the jungle's charcoal. |
| **Pitch vine** | `pitchvine` | `Fuel` `Medicinal` | **Wood/Yield:** fuel (the resin-soaked vine, dried) | A woody liana that hangs from the hero boles and bleeds a sticky resin from its cut stems. Dried on a rack, the vine burns hot and smoky even in the wet, so it is the jungle's torch and kindling; the resin dresses cuts and stings. |
| **Prism gum** | `prismgum` | `Fuel` `Medicinal` | **Wood/Yield:** timber, torch resin | The iridescent gum seals hulls and dresses cuts; boiled down and cooled it is a torch resin that burns bright and smoky. |
| **Widow\** | `widowhair` | `Fuel` | **Wood/Yield:** stuffing; fuel (tinder) | Grey hanging curtains on the bone giants and the dead limbs. |

### Biome: `k-guilin`
*Total qualifying species: **5** (Medicinal: 3, Reagent: 0, Fuel: 2)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Camphor** | `camphor` | `Medicinal` | **Wood/Yield:** camphorwood (chests, carving: moths will not touch it) | The plain's great tree, its spring flush pale green to bronze. Camphor is distilled from the chipped wood: rubbed on for aches and itch, burnt against insects. |
| **Cliff scrub** | `scrub` | `Fuel` | **Wood/Yield:** firewood | The evergreen shrubs that clothe a tower's faces wherever a crack holds soil: loropetalum, sageretia, box-leaved holly. They are why the towers are green to their feet. |
| **Ring-cupped oak** | `cliffoak` | `Fuel` | **Wood/Yield:** firewood, charcoal<br>**Edible:** ['acorns (leached, ground: acorn jelly)'] | The towers' scrub forest: small, dense, evergreen, gripping the soil pockets of every ledge and the dome. The acorns sit in cups ringed like a whorl; leached of their tannin they are ground into a jelly. |
| **Stone orchid** | `orchid` | `Medicinal` | **Wood/Yield:** none | Dendrobium on the bare rock: jointed yellow-green canes and sprays of white and pink flowers. The canes, dried and twisted into coils, are a tonic for the stomach and the throat; gatherers climb the towers on ropes for it. |
| **Sweet osmanthus** | `osmanthus` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['osmanthus flowers (tea, wine, syrup, cakes)'] | A dense dark evergreen whose tiny golden flowers in autumn scent a whole valley: Guilin is named for its forests. The flowers are dried for tea, steeped in wine and boiled into syrup for cakes. |

### Biome: `korona`
*Total qualifying species: **7** (Medicinal: 6, Reagent: 2, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Blood bulbs** | `bloodbulb` | `Medicinal` | **Wood/Yield:** none | Fist-sized sticky red heads on thin dark stalks standing in thousands across the open flats of a hollow: the moor. Each holds what brushes it; a person walks through and comes out bleeding and sticky. The heads are a styptic. |
| **Butterworts** | `butterwort` | `Medicinal` | **Wood/Yield:** none | Sticky pale rosettes flat on the melt pools' margins, the ice tables' flypaper for the summer's flies. Their leaves curdle milk and heal a cut. |
| **Coin tree** | `cointree` | `Fuel` | **Wood/Yield:** firewood (gnarled, slow) | A dwarf tree wind-pruned to a bonsai in the pavement's cracks: round coin leaves frosted silver-blue, a coral or amber flush at the edge. The summit's one tree. |
| **Great sundew** | `greatsundew` | `Medicinal` | **Wood/Yield:** none | A sundew the size of a tree fern: a fountain of arching fronds beaded with dew that holds a frog, a bird, a child's arm, and curls over it in an hour. The first trap in Korona that holds more than an insect; its dew is the rimdew's syrup, stronger. |
| **Lace fan tree** | `lacefan` | `Medicinal` `Reagent` | **Wood/Yield:** none (a fungus)<br>**Edible:** ['lace fan flesh (dried; bitter, a reagent)'] | A fungus-tree of the dim wet gorge: a twisted dark bole and tiers of translucent peach lace fans that glow at dusk. The dried fan is a reagent (a stimulant; a tonic in small doses). |
| **Lash flower (the numb thorn)** | `numbthorn` | `Medicinal` | **Wood/Yield:** none | A thick segmented stalk out of a rosette of leaves, and on it a flower of four big pleated orange petals round a hot-pink throat, a long tongue hanging from it. The tongue lashes at what comes near and its touch numbs a limb in a minute, the whole body in ten; the petals fold over the throat on what it holds, and the floor's other traps finish the rest. The tribes milk the tongue for a hunting poison and a surgeon's numbing. Danger 0.7. |
| **Rainbow fan** | `rainbowfan` | `Medicinal` `Reagent` | **Wood/Yield:** none | THE REAGENT: a pleated fan rosette in the pavement's soil pockets, each plant one colour family (crimson, lime, teal, blue, gold, mint, cream, navy, black-red) and no two alike. The dried blades are the apothecaries' dyes and reagents; a crimson one is worth a season's climb. Grows only where the summit holds a little silt, never on the bare rock. |

### Biome: `necanyons`
*Total qualifying species: **5** (Medicinal: 2, Reagent: 0, Fuel: 3)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Ember plum** | `emberplum` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['ember plums (fresh, dried and pounded)'] | Small, green-gold and very sour, with more vitamin C than any other fruit: dried and pounded to a powder the Wings carry against scurvy. |
| **Flametip** | `flametip` | `Fuel` | **Wood/Yield:** firewood (dense, burns long), tanbark | Every new flush scarlet, so a bench in leaf looks lit; the bark tans hides. |
| **Rimdew** | `rimdew` | `Medicinal` | **Wood/Yield:** none | The sundews: red rosettes and forked strap-leaved plants beaded with sticky dew. Steeped in honey or spirit the leaves make a cough and chest syrup that eases cramps; the fresh dew is dabbed on warts. |
| **Ringgrass** | `ringgrass` | `Fuel` | **Wood/Yield:** fuel (dry hummocks) | Spinifex: blue-grey spiky hummocks that die out in the middle and grow outward as rings. The resin, melted from threshed leaves, is a glue: hafting points, sealing. |
| **Stilt lily** | `treelily` | `Fuel` | **Wood/Yield:** fuel (the resinous trunk fibre: torches that burn wet) | Forked black trunks shaggy with old leaf bases, a fountain of grey-green leaves at each tip, lilac flowers after rain. |

### Biome: `neouterwall`
*Total qualifying species: **1** (Medicinal: 0, Reagent: 0, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Steam tree fern** | `treefern` | `Fuel` | **Wood/Yield:** fibre (the trunk's root mantle: planters, walls, kindling)<br>**Edible:** ['young croziers (boiled twice)','the pith (starch, a famine food)'] | A soft tree fern of the warm cauldrons: a trunk of matted roots a man's height or three under a crown of arching fronds, on the springs' warm, wet apron where the snow does not lie. Dicksonia antarctica of Tasmania takes frost to -10 °C; here the ground's heat keeps its roots from freezing. |

### Biome: `nhighlands`
*Total qualifying species: **34** (Medicinal: 27, Reagent: 0, Fuel: 17)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Beard lichen** | `beard_lichen` | `Medicinal` | **Wood/Yield:** none | An old wound dressing. |
| **Birch** | `birch` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['sap'] | Sap in spring; the bark for boxes, canoes and tinder; chaga on the old trunks. |
| **Black oak** | `blackoak` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['acorns'] | Acorns leached and ground into meal: the staple of the dry side's people. |
| **Brook willow** | `brookwillow` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Withies for baskets; the bark chewed for pain. |
| **Burn snag** | `burnsnag` | `Fuel` | **Wood/Yield:** fuel | Standing dead wood: the best firewood on the mountain. |
| **Cathedral cedar** | `cathedralcedar` | `Medicinal` | **Wood/Yield:** timber | Rot-proof wood for canoes, roofs and poles; the inner bark makes cord and cloth. |
| **Copper pine** | `copperpine` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['seeds (in good years)'] | The bark plates smell of vanilla in the sun; pitch for torches and boats; the big timber of the dry side. |
| **Crag pine** | `cragpine` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['inner bark'] | Pitch from the stumps; pine-bark bread in hard winters. |
| **Elder yew** | `elderyew` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['arils (not the seed)'] | Every part poisonous but the red aril: eat the cup, spit the stone. Bows from the heartwood. |
| **Ember giant** | `embergiant` | `Medicinal` | **Wood/Yield:** timber | The red giants of the moist draws: a fire scars them and they grow on. The bark is a hand thick and does not burn; the felled wood shatters. |
| **Fan-leaf** | `fanleaf` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['nuts (roasted)'] | The fruit stinks; the roasted nut inside is eaten in small numbers. The leaves for the memory. |
| **Fog laurel** | `foglaurel` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Leaves for seasoning and for a steam against colds. |
| **Forest lime** | `forestlime` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['young leaves','flowers (tea)'] | Lime-blossom tea for fevers; bast for rope and shoes; soft wood for carving; the bees' best tree. |
| **Frost fir** | `frostfir` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Balsam from the bark blisters. |
| **Ghost alder** | `ghostalder` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Grows where nothing else will stand the wet; the lichen on it is a wound dressing. |
| **Gnarled oak** | `gnarloak` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['acorns'] | Acorns leached and ground into meal; galls for ink; the bark for tanning. |
| **Great spruce** | `greatspruce` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['young tips'] | The tips make a tea against scurvy; the resin a salve. |
| **Grey alder** | `greyalder` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Smoking wood; the bark dyes red and black. |
| **Hanging moss** | `hanging_moss` | `Fuel` | **Wood/Yield:** none | Bedding, tinder, padding. |
| **Heath and bilberry** | `heath_and_bilberry` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['bilberries'] | Blue berries in late summer, gathered in birch-bark punnets. |
| **Lace fern** | `lace_fern` | `Medicinal` | **Wood/Yield:** none | Alien: a recursive frond, brighter than any terrestrial green. |
| **Moss** | `moss` | `Medicinal` | **Wood/Yield:** none | Wound dressing, bedding, caulking. |
| **Moss maple** | `mossmaple` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['sap'] | Sap boiled to syrup; the moss it carries is gathered for bedding. |
| **Mountain cane** | `mountain_cane` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['shoots'] | Canes for arrows and frames. |
| **Norway spruce** | `normanspruce` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['young tips'] | Tonewood; the tips for syrup. |
| **Rowan** | `rowan` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['berries (cooked)'] | Bitter raw; after a frost, cooked to an orange-red jelly, or wine. |
| **Serpentwood** | `serpentwood` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | The twisted wood is prized for bows and handles. |
| **Shadow hemlock** | `shadowhemlock` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['inner bark'] | Inner bark eaten in famine; tannin for hides. |
| **Shag maple** | `shagmaple` | `Fuel` | **Wood/Yield:** fuel | The moss is gathered for bedding and caulking; it grows back in a season. |
| **Silver fir** | `silverfir` | `Medicinal` | **Wood/Yield:** timber | Resin from the bark blisters, for wounds. |
| **Table cedar** | `tablecedar` | `Fuel` `Medicinal` | **Wood/Yield:** timber | Fragrant rot-proof timber for halls; the resin burnt as incense. |
| **White fir** | `whitefir` | `Medicinal` | **Wood/Yield:** timber | Balsam from the blisters for cuts; soft white boards. |
| **Whitebark pine** | `whitebark` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['pine nuts'] | The nuts are cached by the nutcrackers and dug up by bears and people alike. |
| **Wind spruce** | `windspruce` | `Fuel` | **Wood/Yield:** fuel | Krummholz: centuries old at knee height. |

### Biome: `nsemiarid`
*Total qualifying species: **17** (Medicinal: 15, Reagent: 0, Fuel: 10)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Balloon pod** | `balloon` | `Medicinal` | **Wood/Yield:** none | The pods inflate and burst into silk; the silk stuffs pillows. The sap is poison. |
| **Crescent saxaul** | `saxaul` | `Fuel` `Medicinal` | **Wood/Yield:** fuel (the hardest in the steppe), charcoal | Burns like coal; the caravans carry it. |
| **Drift lantern** | `lantern` | `Medicinal` | **Wood/Yield:** none | The bulbs lift away at dusk; a crushed bulb is a cooling salve. |
| **Giant dandelion** | `dandelion` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['leaves','root (roasted)'] | The clock sheds its seeds downwind first. |
| **Golden poplar** | `poplar` | `Fuel` `Medicinal` | **Wood/Yield:** timber, fuel<br>**Edible:** ['catkins'] | Gold in its season; it sheds cotton in drifts like snow. |
| **Resurrection ball** | `resurrect` | `Medicinal` | **Wood/Yield:** none | Curled brown and blowing about; it unfurls green after rain. |
| **Saltbush** | `saltbush` | `Fuel` | **Wood/Yield:** fuel, fodder<br>**Edible:** ['leaves (salty, cooked)'] | Silver-grey with the salt it sweats out of its leaves; it rings the pans where nothing else will grow. |
| **Sea buckthorn** | `buckthorn` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, hedging<br>**Edible:** ['berries (sour)'] | Thorny thickets on the margins, orange with berries in autumn; the oil heals burns. The catalog owes the berry (KNOWN_ISSUES.md). |
| **Spring plane** | `plane` | `Medicinal` | **Wood/Yield:** timber, carving | The great tree of the springs: a village gathers under it. |
| **Steppe wormwood** | `wormwood` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | Bitter: a tea against worms and fevers. |
| **Tumbler** | `tumbler` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['young shoots'] | A ripe plant breaks at the root and rolls, seeding as it goes; drifts pile on the windward side of anything standing. |
| **Wild almond** | `almond` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['kernels (sweet strains)'] | Most wild trees are bitter: the sweet strains are marked and guarded. |
| **Wild apple** | `apple` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, tool handles<br>**Edible:** ['apples'] | The Ancients' lakeside orchards gone wild: every tree a different apple. |
| **Wild apricot** | `apricot` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['apricots','kernels'] | Dried on the roofs in late summer. |
| **Wild pistachio** | `pistachio` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, carving<br>**Edible:** ['nuts'] | The nuts split when they ripen; the resin is a chewing gum and a varnish. |
| **Wild pomegranate** | `pomegranate` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['pomegranates'] | Sour wild fruit; the rind tans leather and dyes it yellow. |
| **Wild walnut** | `walnut` | `Medicinal` | **Wood/Yield:** timber (fine)<br>**Edible:** ['walnuts'] | The husk dyes brown; the wood is the cabinetmaker's. |

### Biome: `nwbay`
*Total qualifying species: **11** (Medicinal: 11, Reagent: 0, Fuel: 2)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Avenue baobab** | `avenuebaobab` | `Medicinal` | **Wood/Yield:** fibre (the inner bark)<br>**Edible:** ['fruit pulp','seed oil'] | The velvet fruit is cracked for its dry cream pulp; the seeds are pressed for oil. |
| **Cinder pine** | `cinderpine` | `Medicinal` | **Wood/Yield:** timber, pitch | The pitch caulks the boats; the smoke of the needles keeps flies off. |
| **Cliff fig** | `clifffig` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['figs'] | Small figs in the leaf axils the year round, orange-red going purple; the latex is a glue. |
| **Dragon tree** | `dragon` | `Medicinal` | **Wood/Yield:** none | The red resin (dragon's blood) is a dye, a varnish and a wound balm. |
| **Gate baobab** | `baobab` | `Medicinal` | **Wood/Yield:** fibre (the inner bark)<br>**Edible:** ['pod pulp','seeds','young leaves'] | The hanging pods are sawn into rounds; the dry pulp is a sour chalk. |
| **Ironbark** | `ironbark` | `Medicinal` | **Wood/Yield:** timber | The hardest wood of the bay: the jetties stand on it; the bark is a tannin dye. |
| **Lantern mangrove** | `mangrove` | `Fuel` `Medicinal` | **Wood/Yield:** poles, charcoal<br>**Edible:** ['propagules (leached, famine)'] | The bark tans the nets. |
| **Pipe reed** | `pipereed` | `Medicinal` | **Wood/Yield:** none | The silica-rough stems scour pots. |
| **Prism gum** | `prismgum` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['nectar'] | The bark sheds in rainbow strips; a red gum from its cracks dresses wounds. |
| **Rock bottle** | `rockbottle` | `Medicinal` | **Wood/Yield:** none | The sap poisons fish and arrows: never eaten. |
| **Umbrella thorn** | `thorn` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['gum'] | The gum is chewed; the pods are fodder. |

### Biome: `nwlowlands`
*Total qualifying species: **8** (Medicinal: 7, Reagent: 0, Fuel: 4)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Column ginkgo** | `ginkgo` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['seeds (roasted)'] | The seeds are roasted and shelled; the flesh round them stinks (a catalog piece, not drawn on the stage). |
| **Crag pine** | `cragpine` | `Medicinal` | **Wood/Yield:** timber, pitch | The pitch is a salve. |
| **Drape she-oak** | `sheoak` | `Fuel` | **Wood/Yield:** fuel | The hardest burning wood in the hills. |
| **Ghost gum** | `ghostgum` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, posts | The leaf oil is a chest rub. |
| **Glow-willow** | `glowwillow` | `Medicinal` | **Wood/Yield:** basketry | A bark tea for pain. |
| **Pale paperbark** | `paperbark` | `Medicinal` | **Wood/Yield:** bark sheets (roofs, wrapping) | The bark wraps food for the earth oven; the leaf oil is an antiseptic. |
| **Ribbon blue gum** | `bluegum` | `Fuel` `Medicinal` | **Wood/Yield:** timber | The leaf oil is a chest rub; the shed ribbons are tinder. |
| **Tall wattle** | `wattle` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, posts<br>**Edible:** ['seed (ground)'] | The pod seed is roasted and ground to flour; the gum is a sweet (a catalog piece, not drawn on the stage). |

### Biome: `nwouterwall`
*Total qualifying species: **5** (Medicinal: 4, Reagent: 0, Fuel: 2)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Creeping stone pine** | `pinemat` | `Fuel` | **Wood/Yield:** firewood<br>**Edible:** ['pine nuts'] | The stone pine's mountain form (Pinus pumila): a mat a man's height, its branches lying on the slope under the snow all winter. |
| **Goldroot (gooldruut)** | `goldroot` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['the root (dried: smells of roses)'] | Roseroot (Rhodiola rosea) in the cracks of the tors and the cliffs: the remedy for fatigue and thin air, 4-5 years to harvest; the Yeti's trade good. |
| **Ivan-chai** | `ivanchai` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['the tea (fermented leaves)','young shoots (greens)'] | Fireweed (Chamerion angustifolium) on the burns and the larch's edges: tall magenta spikes, then white seed fluff. Its fermented leaves are the Yeti's tea. |
| **Larch beard** | `beardlichen` | `Medicinal` | **Wood/Yield:** winter fodder | Beard lichens (Bryoria, Usnea) hanging in grey-green and black hanks from the shaded larches' branches: winter fodder and a wound dressing. |
| **Silverthorn** | `silverthorn` | `Fuel` `Medicinal` | **Wood/Yield:** thorny firewood<br>**Edible:** ['silverthorn berries (vitamin C against the winter: dried, frozen or kept in fat)'] | Sea buckthorn of the forest-steppe's gullies: silver-scaled willowy leaves, orange berries packed on the stems through the winter. A yellow dye. |

### Biome: `oidong`
*Total qualifying species: **25** (Medicinal: 24, Reagent: 6, Fuel: 4)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Bell-pod willow** | `bellpod` | `Medicinal` `Reagent` | **Wood/Yield:** withies<br>**Edible:** ['beads (sweet, fresh)'] | The beads are eaten fresh or dried like raisins; the coral bells, dried, are the monks' sleeping draught and a reagent of their stillness rites: never more than one. |
| **Camphor laurel** | `camphor` | `Medicinal` `Reagent` | **Wood/Yield:** chests and boxes (the wood keeps the moth out) | Camphor: the wood is steamed for its crystals, the monks' liniment and a reagent that clears the head. |
| **Chalice tree** | `chalice` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['cap water (sweet)'] | The water a cap holds is sweet and faintly bitter; a cup of it settles the stomach and the mind. The rim grass is cut for the finest paper. |
| **Cherry blossom** | `cherry` | `Medicinal` | **Wood/Yield:** turnery, carving<br>**Edible:** ['cherries'] | Cherries in early summer; the bark is a cough tea. The petals are gathered for the spring cakes. |
| **Cloud pine** | `cloudpine` | `Fuel` `Medicinal` | **Wood/Yield:** carving, fuel | The resin is a salve (biomes/xanadu). |
| **Cloud-pad tree** | `cloudpad` | `Medicinal` | **Wood/Yield:** carving (the patterned bark is kept on: boxes, bowls) | The burls are turned into bowls with the rings and diamonds left on; a tea of the pads is a bitter for the stomach. |
| **Cushion plants** | `cushionplant` | `Fuel` | **Wood/Yield:** fuel (dried) | Domes of tiny leaves packed hard against the wind on the gravel of the passes, silver-green, a century old at a metre across; the pilgrims burn the dead ones. |
| **Giant lotus** | `giantlotus` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['seeds (fresh, dried)','root (a staple starch)','lotus silk (the stem fibre, spun)'] | The seed heads are the size of a basin; the roots are dug from the mud in autumn and the stem fibre is drawn out and spun into the monks' lotus silk. The seed heart is a sedative tea. |
| **Iridescent water lily** | `lily` | `Medicinal` `Reagent` | **Wood/Yield:** none | A lily of no fixed colour: violet, blue, rose and gold shift across it as the eye moves. Its root is a dream reagent, steeped. |
| **Lattice tree** | `lattice` | `Medicinal` | **Wood/Yield:** none (never cut)<br>**Edible:** ['saucer water (sweet)'] | Each tree has a name and a keeper; the rain its saucers hold is drunk at the end of a fast, and the violet flowers are a calming tea. |
| **Lotus** | `lotus` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['seeds (fresh)','root'] | The ordinary lotus among the giants: pads and flowers on the pools, green seed heads after the flowers. |
| **Marble birch** | `marblebirch` | `Medicinal` | **Wood/Yield:** none (it will not take an edge) | The bark peels in painted sheets the monks use for the covers of books; the sap, tapped in spring, is a tonic. |
| **Mist tea** | `tea` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['leaves (dried, steeped)'] | Xanadu's mist tea, wild on the terraces; the valley's drink. |
| **Monk's sage** | `sage` | `Fuel` `Medicinal` | **Wood/Yield:** incense | A silver wormwood on the flats, burned for incense and brewed bitter for the stomach. |
| **Moon caps** | `mooncap` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['caps (cooked)'] | Pink pleated parasols on dark stems, in rings under the cherries; a mild dream mushroom, eaten dried in the winter rites. |
| **Moss** | `moss` | `Medicinal` | **Wood/Yield:** none | The moss garden: over the floor, the stones, the fallen wood and the roots, bright in the shade. |
| **Moss-ball tree** | `mossball` | `Medicinal` | **Wood/Yield:** none | The moss of the balls dresses wounds; the dead balls stuff cushions. |
| **Paper maple** | `maple` | `Medicinal` | **Wood/Yield:** carving<br>**Edible:** ['sap (boiled to syrup)'] | Tapped in late winter; the syrup is the valley's sweetener. |
| **Peyote buttons** | `peyote` | `Medicinal` `Reagent` | **Wood/Yield:** none | Pale blue-green buttons flush with the gravel, a pink flower in the crown of each; dried, the monks' seeing reagent, taken on the flats at dawn. |
| **Rainbow brackets** | `bracket` | `Medicinal` | **Wood/Yield:** none | Shelf fungi banded in rings of teal, gold and blue on the old trunks; a tea of them is the monks' long-life tonic. |
| **Sacred fig** | `bodhi` | `Medicinal` | **Wood/Yield:** none (never cut)<br>**Edible:** ['figs (small, purple)'] | The latex closes wounds; the bark is a fever tea. The tree is never felled: a bodhi's shade is a place to sit. |
| **Sky poppy** | `poppy` | `Medicinal` `Reagent` | **Wood/Yield:** dye (the leaves: the Order's blue) | A powder-blue poppy on the slopes; its seed is a sleeping draught and a reagent of the stillness rites, and its leaves are the vat the Order's blue is dyed in. |
| **Snow lotus** | `snowlotus` | `Medicinal` | **Wood/Yield:** none | A pale woolly rosette high on the cold slopes; the whole plant, dried, is the valley's strongest medicine, for the heart and the breath. |
| **Temple cedar** | `cedar` | `Fuel` `Medicinal` | **Wood/Yield:** timber (the temple beams), incense | The heartwood is Longsong's timber; the shavings are burned as incense and the resin seals wounds. |
| **Valley ginseng** | `ginseng` | `Medicinal` `Reagent` | **Wood/Yield:** none<br>**Edible:** ['root'] | A whorl of five leaflets and a cluster of coral berries over a man-shaped root: the monks' tonic and reagent, dug after seven years. |

### Biome: `opalvalley`
*Total qualifying species: **1** (Medicinal: 1, Reagent: 0, Fuel: 0)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Prism fern** | `prismfern` | `Medicinal` | **Wood/Yield:** none | The fronds keep their colour pressed: dried, a dye mordant. |

### Biome: `paintedhighlands`
*Total qualifying species: **1** (Medicinal: 1, Reagent: 0, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Plateau sage** | `sage` | `Fuel` `Medicinal` | **Wood/Yield:** fuel (kindling); incense (a smudge) | Burnt as a smudge in the shamans' stone circles. |

### Biome: `rheolith`
*Total qualifying species: **9** (Medicinal: 0, Reagent: 9, Fuel: 0)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Choke-Coral** | `chokecoral` | `Reagent` | **Wood/Yield:** none | Crushed sinter holds fugitive throat vapours in Ranj mulch; responds to Brimstone-Iron Cake. |
| **Etch-Halo & Selenium Rime** | `etchhalo` | `Reagent` | **Wood/Yield:** none | Diagnostic surface tell of subsurface Flux-Creeper grazing and imminent blowout. |
| **Flux-Creeper** | `fluxcreeper` | `Reagent` | **Wood/Yield:** none | Frenzy-grazes silicate plugs when fed Alkali-Fluorite Salt. |
| **Foam-Reef** | `foamreef` | `Reagent` | **Wood/Yield:** none | Dead rafts shed onto lava benches as lightweight porous Comb-Plates. |
| **Glassy Scar-Plug** | `scarplug` | `Reagent` | **Wood/Yield:** none | Seals borehole casings while hot; turns brittle when poisoned with Heavy Dross. |
| **Ringing Lava Blister** | `bellblister` | `Reagent` | **Wood/Yield:** none | A high bell-ring (~160 Hz) marks safe load-bearing crust; a dull thud (~65 Hz) warns of foundering. |
| **Star-Egg** | `staregg` | `Reagent` | **Wood/Yield:** none | Dormant propagule; wakes only in a 260 degC Hot Vitriol Bath. |
| **Throat-Collar** | `throatcollar` | `Reagent` | **Wood/Yield:** none | Microporous zeolite sinter prized as Ranj vapour-retaining mulch. |
| **Wire-Vein** | `wirevein` | `Reagent` | **Wood/Yield:** none | Cold surface needles snap brittle; conducts Seebeck current across fracture walls. |

### Biome: `rift`
*Total qualifying species: **14** (Medicinal: 9, Reagent: 0, Fuel: 9)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Baobab** | `baobab` | `Medicinal` | **Wood/Yield:** cord (the bark)<br>**Edible:** ['fruit pulp','leaves'] | The pale pods hold a dry, tart pulp (a catalog piece, not drawn on the stage); the bark is stripped for cord without killing the tree. |
| **Beard tree** | `beardtree` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | The beard moss is bedding, tinder and a wound pad. |
| **Candle stalk** | `candle` | `Fuel` | **Wood/Yield:** none | The lavender brushes are dried for tinder. |
| **Cloud lobe tree** | `cloudlobe` | `Fuel` | **Wood/Yield:** fuel |  |
| **Curl succulent** | `curly` | `Medicinal` | **Wood/Yield:** none | The sap soothes burns. |
| **Dragon tree** | `dragon` | `Medicinal` | **Wood/Yield:** none | The red resin is a dye, a varnish and a wound dressing. |
| **Giant groundsel** | `groundsel` | `Fuel` | **Wood/Yield:** fuel (the dead leaves) | The dead leaves cloak the stem and burn hot. |
| **Lobe tree** | `lobetree` | `Fuel` | **Wood/Yield:** fuel | The hanging pods are bitter: left to the bats. |
| **Peak pine** | `pine` | `Fuel` `Medicinal` | **Wood/Yield:** timber, fuel | The pitch seals pots and dresses cuts. |
| **Rift acacia** | `acacia` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, thorn fences<br>**Edible:** ['pods (famine)','gum'] | The pods and the gum (the pods are a catalog piece, not drawn on the stage). |
| **Rift stone pine** | `stonepine` | `Fuel` | **Wood/Yield:** timber, fuel<br>**Edible:** ['pine nuts'] | Nuts from the cones (a catalog piece, not drawn on the stage). |
| **Silver scrub** | `silverscrub` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | A bitter aromatic tea. |
| **Thornwhip** | `thornwhip` | `Medicinal` | **Wood/Yield:** none | The thorns numb where they sting; healers milk the red heads for a salve, gloved. |
| **Tree aloe** | `aloetree` | `Medicinal` | **Wood/Yield:** none | The gel dresses burns. |

### Biome: `riftrim`
*Total qualifying species: **5** (Medicinal: 2, Reagent: 0, Fuel: 3)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Frost frill** | `frostfrill` | `Fuel` | **Wood/Yield:** none (the column is hollow and wet) | The resin is a varnish; the dry fins are tinder. |
| **Moor sponge** | `moorsponge` | `Fuel` | **Wood/Yield:** fuel (peat) | A copper-green moss bog that holds the fog's water. |
| **Reindeer lichen** | `cladonia` | `Medicinal` | **Wood/Yield:** none |  |
| **Rimroot** | `rimroot` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['root (dried, as medicine)'] | The medicine: the dried root is a purgative and a fever remedy. |
| **Veil thread** | `veilthread` | `Fuel` | **Wood/Yield:** fuel (tinder), stuffing | Copper-gold filaments metres long, combing the fog for water. |

### Biome: `ringisles`
*Total qualifying species: **13** (Medicinal: 10, Reagent: 0, Fuel: 5)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Beach morning glory (a creeper)** | `creeper` | `Medicinal` | **Wood/Yield:** none | Its runners bind the sand; a leaf poultice for stings. |
| **Breadfruit** | `breadfruit` | `Medicinal` | **Wood/Yield:** timber, canoes<br>**Edible:** ['fruit (roasted, baked, fermented)'] | The staple of the windward villages: roasted whole in the fire or pit-fermented for the lean months; the latex caulks canoes. |
| **Clove** | `clove` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['flower buds (dried: cloves)'] | The buds are picked pink before they open and dried in the sun: the dearest trade crop of the isles. |
| **Corkwood (a commiphora)** | `corkwood` | `Medicinal` | **Wood/Yield:** carving (light)<br>**Edible:** ['young leaves','resin'] | The bark peels in paper; the resin is the islanders' myrrh, burnt at the ancestor stones. |
| **Mango** | `mango` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['fruit'] | Eaten green with salt and ripe from the tree; the bark is a remedy for the flux. |
| **Naupaka (beach shrub)** | `naupaka` | `Medicinal` | **Wood/Yield:** none |  |
| **Rainforest ferns** | `fern` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['fiddleheads'] |  |
| **Red ginger** | `ginger` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['rhizome'] |  |
| **Salt cedar (a tamarisk)** | `tamarisk` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, posts<br>**Edible:** ['manna (sweet exudate)'] | Grows where nothing else will on the salt; the salt workers burn it under the boiling pans. |
| **Scrub thorn (a low flat-topped acacia)** | `scrubthorn` | `Fuel` | **Wood/Yield:** fuel, fence thorn<br>**Edible:** ['gum','pods (fodder)'] | Cut and laid in rings for the pens: the goats' and the pigs' thorn fences. |
| **Sea grape** | `seagrape` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['grapes'] | The purple grapes ripen in bunches through the dry season; the big leaves wrap food in the earth oven. |
| **Thorn scrub (low acacia and commiphora)** | `thornbush` | `Fuel` | **Wood/Yield:** fuel | The scrub layer the browsers keep low. |
| **Wrack and drift** | `wrack` | `Fuel` | **Wood/Yield:** fuel | Dried wrack mulches the taro; driftwood for the fires. |

### Biome: `scablands`
*Total qualifying species: **1** (Medicinal: 1, Reagent: 0, Fuel: 0)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Spray fern** | `sprayfern` | `Medicinal` | **Wood/Yield:** none | In the seeps at the foot of the dry falls, where its spray once fell: the only fern for a hundred kilometres. |

### Biome: `sedesert`
*Total qualifying species: **21** (Medicinal: 15, Reagent: 2, Fuel: 12)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Creosote bush** | `creosote` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | A bitter tea for colds; it smells of rain. |
| **Desert rose** | `rose` | `Medicinal` `Reagent` | **Wood/Yield:** none | The sap is an arrow poison; a little of it a heart medicine. |
| **Dragon tree** | `dragon` | `Medicinal` | **Wood/Yield:** none | The red resin (dragon's blood) is a dye, a varnish and a wound powder. |
| **Giant candelabra** | `candelabra` | `Reagent` | **Wood/Yield:** none | The milky latex blinds and blisters: a fish poison, never food. |
| **Giant puya** | `puya` | `Fuel` | **Wood/Yield:** none | The dry spike is kindling. |
| **Hoodia** | `hoodia` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['stems'] | Chewed against hunger and thirst on a long walk. |
| **Joshua tree** | `yucca` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['flower buds (roasted)','seeds'] | The buds are roasted in spring; the leaf fibre makes sandals. |
| **Lichen** | `lichen` | `Medicinal` | **Wood/Yield:** none | A dye. |
| **Mantis fig** | `figv` | `Medicinal` | **Wood/Yield:** none (one tree is a grove)<br>**Edible:** ['figs'] | Ficus vasta of Socotra's wadis: a fig tree is the village's shade and meeting place; the figs eaten fresh and dried, the latex a wart salve. |
| **Mesquite** | `mesquite` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, posts, charcoal<br>**Edible:** ['pods (ground into flour)'] | Sweet pods dried and ground for mesquite cakes; the gum is a salve. |
| **Mountain agave** | `agave` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['heart (pit-roasted)','flower stalk'] | The heart is pit-roasted sweet; the leaves give fibre (not in the catalog yet). |
| **Myrrh** | `myrrh` | `Fuel` `Medicinal` | **Wood/Yield:** none (thorny) | Commiphora: the resin bled from the peeling bark is myrrh, the merchant houses' second trade; a wound wash and an incense. |
| **Prickly pear** | `pear` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['tunas','young pads'] | Orange-red tunas along the pad rims, peeled; young pads fried. |
| **Saltbush** | `saltbush` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['leaves (salty greens)'] |  |
| **Saltbush** | `bowlsaltbush` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['leaves (salty greens)'] | Grazing; the leaves eaten as salty greens. |
| **Saxaul** | `saxaul` | `Fuel` `Medicinal` | **Wood/Yield:** the densest firewood there is; charcoal | Haloxylon of the salt deserts: a fire of it burns all night. |
| **Socotran frankincense** | `incense` | `Fuel` `Medicinal` | **Wood/Yield:** none | Boswellia: the resin tapped from the papery bark is the incense the Izani merchant houses came for; a medicine for the lungs. |
| **Socotran pomegranate** | `pom` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['fruit (sour)'] | Punica protopunica: the sour fruit and the rind, a dye and a medicine for the gut. |
| **Spinifex** | `spinifex` | `Medicinal` | **Wood/Yield:** thatch | The resin is a glue for spear heads. |
| **Tamarisk** | `tamarisk` | `Fuel` | **Wood/Yield:** timber, fuel<br>**Edible:** ['manna (the scale insects\' sweet secretion on the twigs)'] | Salt crystals on the leaves; the manna is a sweetener. |
| **Umbrella thorn** | `thorn` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, posts, fencing (the thorns)<br>**Edible:** ['pods (fodder)'] | Vachellia tortilis: the browse of the steppe; the gum a sweet and a glue; the bark a tan. |

### Biome: `shighlands`
*Total qualifying species: **12** (Medicinal: 9, Reagent: 0, Fuel: 4)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Coil juniper** | `coiljuniper` | `Fuel` `Medicinal` | **Wood/Yield:** fuel (dense, slow)<br>**Edible:** ['berries (flavouring)'] | The berries are steeped as a bitter; the wood is the herders' fire. |
| **Coilbark** | `coilbark` | `Fuel` | **Wood/Yield:** timber (it splits along its twist: turned work only), fuel (the split offcuts) | Bowls and spindles are turned from it so the grain's spiral runs round them; the splits and offcuts are the winter firewood. |
| **Crozier tree fern** | `crozier` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['croziers (boiled)','trunk starch (famine)'] | The croziers are the season's first green food; the hairs are a wound packing. |
| **Fallen spiral cones** | `cone` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['seeds'] | Gathered for their nuts, then burned: they flare in a spiral. |
| **Giant groundsel** | `groundsel` | `Medicinal` | **Wood/Yield:** none | The dead-leaf skirts stuff bedding; the pith is a fever bitter. |
| **Rope pine** | `ropepine` | `Medicinal` | **Wood/Yield:** timber (it splits along its twist: turned and coopered work), resin<br>**Edible:** ['seeds (the cones\' pine nuts)'] | The cones take three years on the tree; their nuts are the station's winter food. The resin is a wound pitch. |
| **Ruffle-crown** | `ruffle` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['leaf hearts'] | The ruffled leaves hold water like a sponge. |
| **Spiral aloe** | `aloe` | `Medicinal` | **Wood/Yield:** none | The gel dresses burns and cracked hands; it is never cut against its spiral. |
| **Spiral frill tree** | `frill` | `Medicinal` | **Wood/Yield:** poles<br>**Edible:** ['bud (boiled)'] | Kin to the Rift's frill tree. The fins are cut for their sap, a bitter tonic; the pale bud is eaten. |
| **Spiral ginger** | `ginger` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['rhizome'] | Its leaves climb the stem in one spiral, like a stair (Costus, refs/01). |
| **Spiral lobelia** | `lobelia` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['nectar'] | The column stands for years before it flowers once and dies. |
| **Spiral-eye daisies** | `daisy` | `Medicinal` | **Wood/Yield:** none | The florets of each eye are packed in crossing spirals, as a sunflower's are. |

### Biome: `siphon-pits`
*Total qualifying species: **2** (Medicinal: 2, Reagent: 0, Fuel: 0)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Dwarf blue willow** | `bluewillow` | `Medicinal` | **Wood/Yield:** withies (baskets) | Willow bark: a fever tea. |
| **Orange rock lichen** | `rocklichen` | `Medicinal` | **Wood/Yield:** none | An orange dye. |

### Biome: `slabfields`
*Total qualifying species: **1** (Medicinal: 1, Reagent: 0, Fuel: 0)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Block lichen** | `blocklichen` | `Medicinal` | **Wood/Yield:** none | Boiled, an orange dye; its rings tell how long a block has lain. |

### Biome: `swbay`
*Total qualifying species: **7** (Medicinal: 7, Reagent: 0, Fuel: 3)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Ash cherry** | `cherry` | `Medicinal` | **Wood/Yield:** fine timber (small)<br>**Edible:** ['cherries'] | Planted for its blossom by the bay's tombs and gardens; the sour fruit is dried, the bark steeped for coughs (the fruit is a catalog piece, not drawn on the stage). |
| **Bracket tree** | `brackettree` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | The dried brackets are tinder and a styptic. |
| **Dragon tree** | `dragon` | `Medicinal` | **Wood/Yield:** none | The red resin is a dye and a wound dressing. |
| **Gate baobab** | `baobab` | `Medicinal` | **Wood/Yield:** none (bark fibre for rope)<br>**Edible:** ['gatepod pulp','seeds'] | The orange pods hang metres long and are sawn into rounds; the pulp dries into gatepod chalk. |
| **Ironbark** | `ironbark` | `Medicinal` | **Wood/Yield:** timber (the hardest) | The bark is a tanning dye. |
| **Prism gum** | `prismgum` | `Fuel` `Medicinal` | **Wood/Yield:** timber (the shed strips for kindling) | The leaf oil is a chest rub. |
| **Umbrella thorn** | `thorn` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, fencing (the thorny boughs)<br>**Edible:** ['pods (fodder, famine)'] | The pods feed the herds; the gum is a sweet (the pods are a catalog piece, not drawn on the stage). |

### Biome: `swhighlands`
*Total qualifying species: **2** (Medicinal: 1, Reagent: 0, Fuel: 1)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Bottle brush** | `bottlebrush` | `Fuel` | **Wood/Yield:** fuel | a swollen water-storing trunk under a blue-green bristle crown, on the dry-summer sunny spurs |
| **Bulb heath** | `bulb_heath` | `Medicinal` | **Wood/Yield:** none | the bulbs store water; their eyespot pores read the light |

### Biome: `swlowlands`
*Total qualifying species: **20** (Medicinal: 16, Reagent: 0, Fuel: 12)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Bay laurel** | `baylaurel` | `Fuel` `Medicinal` | **Wood/Yield:** turnery, fuel<br>**Edible:** ['leaves (as a spice)','berries'] | The leaves season stew; the oily berries (a catalog piece, not drawn on the stage) are roasted. |
| **Coast oak** | `coastoak` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, tool handles<br>**Edible:** ['acorns (leached)'] | Acorns leached and ground (a catalog piece, not drawn on the stage). |
| **Copper ringbark** | `ringbark` | `Fuel` | **Wood/Yield:** tool handles | The copper bark peels in rings for tinder. |
| **Cork oak** | `corkoak` | `Fuel` | **Wood/Yield:** cork, fuel<br>**Edible:** ['acorns (leached)'] | Stripped for cork every ninth year; the acorns are a catalog piece, not drawn on the stage. |
| **Ember manzanita** | `manzanita` | `Fuel` `Medicinal` | **Wood/Yield:** carving, fuel<br>**Edible:** ['berries','cider'] | Red berries pressed into a cider; the leaves a tea. |
| **Flame parasol** | `flame` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['pod pulp'] | Dark pods round sour-sweet pulp, pressed into cakes. |
| **Flatwood pine** | `pine` | `Medicinal` | **Wood/Yield:** timber, pitch<br>**Edible:** ['pine nuts (small)'] | The pitch is tapped for tar and salve. |
| **Flayed madrone** | `madrone` | `Fuel` `Medicinal` | **Wood/Yield:** fuel, turnery<br>**Edible:** ['berries'] | Bumpy red berries, mealy and sweet; the bark a tea for sore throats. |
| **Ghost sycamore** | `sycamore` | `Fuel` | **Wood/Yield:** furniture, fuel | The pale mottled timber turns well. |
| **Lantern magnolia** | `magnolia` | `Medicinal` | **Wood/Yield:** light timber | The bark is a bitter tonic. |
| **Lantern mangrove** | `mangrove` | `Fuel` `Medicinal` | **Wood/Yield:** poles, fuel | The lacquered red bark tans hides and dyes nets. |
| **Pillar fig** | `pillarfig` | `Medicinal` | **Wood/Yield:** none (one tree is a grove)<br>**Edible:** ['figs'] | Purple figs on the limbs and the fused bole, pink inside; the latex is a wart salve. |
| **Rattle-pod** | `rattlepod` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['seeds (roasted)'] | The pods rattle when ripe; the seeds are roasted dark for "rattle coffee". |
| **Ribbon gum** | `gum` | `Medicinal` | **Wood/Yield:** timber | The leaves are steamed against chest colds. |
| **Ribbon-root tree** | `ribbonroot` | `Medicinal` | **Wood/Yield:** timber | The plank roots are cut for canoe boards; the red sap stanches wounds. |
| **Sprawl oak** | `sprawloak` | `Fuel` `Medicinal` | **Wood/Yield:** ship knees, fuel<br>**Edible:** ['acorns (leached)'] | Acorns leached and ground (a catalog piece, not drawn on the stage); the bark tans leather. |
| **Star gum** | `stargum` | `Medicinal` | **Wood/Yield:** timber | The resin is a cough syrup. |
| **Sunburn tree** | `sunburn` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | The resin dresses sunburn, hence the name. |
| **Tier cedar** | `cedar` | `Medicinal` | **Wood/Yield:** timber, chests | The scented wood keeps moths from cloth. |
| **Veil willow** | `willow` | `Medicinal` | **Wood/Yield:** basketry, withies | The bark is a fever and pain tea. |

### Biome: `throne`
*Total qualifying species: **24** (Medicinal: 18, Reagent: 4, Fuel: 6)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Angel trumpet** | `angeltrumpet` | `Medicinal` | **Wood/Yield:** none | Earth's brugmansia gone feral at the forest's edge, tended there by the natives: the leaves and the hanging trumpets are a poison. One of the arrow poisons (NOTES.md). |
| **Ash broom** | `broom` | `Fuel` | **Wood/Yield:** fuel |  |
| **Bone bell** | `bonebell` | `Medicinal` | **Wood/Yield:** none | Grows only in vent steam. The natives cut its flesh for poultices; colonists call it poisonous. |
| **Brimstone candelabra** | `brimstone` | `Medicinal` | **Wood/Yield:** none | Krator's own sulphur life, of the vents' acid marshes: it lives on the vents' gas, oxidising it to the sulphur that crusts it in yellow bands. It stands on stilt roots in the acid shallows and on the sulphur ground, its arms curving up like a candelabrum to fluted orange cups that breathe a little of the gas back out (and glow faintly at night). The natives scrape the crust as a salve for skin rot. |
| **Burnt scrub** | `charscrub` | `Fuel` | **Wood/Yield:** fuel | The understorey the blast's heat killed where it did not flatten it: black forking skeletons with an ash coat, a few scorched leaves still hanging. |
| **Coconut palm** | `coconut` | `Medicinal` | **Wood/Yield:** poles, thatch, coir (the husk's fibre)<br>**Edible:** ['coconut (water and meat)','palm heart'] | Earth's coconut, on every shore of the Ring Sea. The nuts float: the isle's palms came on the current. |
| **Elfin tree** | `elfin` | `Fuel` | **Wood/Yield:** fuel (wet: it smokes)<br>**Edible:** ['bilberries in its moss'] | The cloud belt's gnarled dwarf: crooked stems a man's height or two, every limb cushioned in moss and hung with moss curtains, bromeliads in its forks, a flat crown shorn by the wind. |
| **Fire flowers** | `fireflowers` | `Medicinal` | **Wood/Yield:** none | Spikes of pale flowers that come up through the ash a fortnight after a fire. |
| **Gas bladders** | `gasbladder` | `Medicinal` | **Wood/Yield:** none | Krator's own: clusters of translucent yellow bladders on short stalks round the vents, swollen with the gas they live on; they glow faintly at night. Burst one and the stink of rotten eggs carries a hundred metres. The natives use the gas to drive vermin from their stores. |
| **Hyper-mangrove** | `mangrove` | `Medicinal` | **Wood/Yield:** timber (dense, rot-proof: piles and hulls)<br>**Edible:** ['propagules (boiled)'] | A hypertree's mangrove: stands in the warm lagoon on arching prop roots taller than a man, drops roots from its limbs, a broad flat crown of glossy leaves. The bark tans hides and stops bleeding. |
| **Lehua** | `lehua` | `Medicinal` | **Wood/Yield:** timber (hard)<br>**Edible:** ['nectar'] | Earth's pioneer of new lava (the ohia lehua's descendant): the first tree on a young flow, red with pompom flowers. |
| **Medusa cap** | `medusa` | `Medicinal` | **Wood/Yield:** none | The tendrils sting like nettles; the natives dry them for a fever remedy. |
| **Pyre thistle** | `pyre` | `Medicinal` | **Wood/Yield:** none | The lure's sap is an anaesthetic the ash nomads trade; too much stops the heart. |
| **Ranj tree** | `spice` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['bark (chewed: a stimulant)'] | RANJ, THE SPICE (NOTES.md): symbiotic with a fungus that thrives only in limited and enigmatic conditions; where the fungus has got into a wound the tree bleeds a red resin that seals and regrows it. In people it closes wounds and knits bone in days; too much and the body heals too much. The Throne's vent country is its surest ground; the Spice Coast farther away is another. |
| **Ruff tree** | `ruff` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['roasted seed'] | Its collars of spiked fronds burst in the heat of a flow and throw their seed over the fresh lava. |
| **Snare flowers** | `snare` | `Medicinal` `Reagent` | **Wood/Yield:** none | Carnivorous: they close on the insects the plume drives down. Their sap is part of the arrow poison (NOTES.md). |
| **Snare plants** | `snareplant` | `Medicinal` `Reagent` | **Wood/Yield:** none | Pitchers, sticky discs and toothed traps: the plume drives the insects down to them. Part of the arrow poison (NOTES.md). |
| **Snare raft** | `snareraft` | `Medicinal` `Reagent` | **Wood/Yield:** none | Carnivorous: the runners' discs hold what lands on the water. Part of the arrow poison (NOTES.md). |
| **Spider lily** | `spiderlily` | `Medicinal` | **Wood/Yield:** none | Red lilies along the trails and round the stumps of the cleared forest. The bulb is poison. |
| **Star aloe** | `staraloe` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['nectar'] | The leaf gel dresses burns. |
| **Sulphur rosette** | `sulphurrosette` | `Medicinal` `Reagent` | **Wood/Yield:** none | Grows in acid water. A source of the arrow poison (NOTES.md). |
| **Trumpet tree** | `trumpet` | `Fuel` | **Wood/Yield:** fuel<br>**Edible:** ['funnel water'] | The funnels hold rain; the plume's drizzle makes it sour. |
| **Veil tree** | `veil` | `Medicinal` | **Wood/Yield:** none | Krator's own, in the cloud: a pale slender tree whose arching limbs hang veils of fine pink filaments that comb the water out of the passing cloud and drip it to its roots. The veils glow faintly at night. Its sap stops nosebleeds (the natives say). |
| **Withered ash shrub** | `ashshrub` | `Fuel` | **Wood/Yield:** fuel | Earth's shrubs where the plume's acid reaches: alive, but barely. |

### Biome: `tiers`
*Total qualifying species: **5** (Medicinal: 2, Reagent: 1, Fuel: 2)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Ledge heath** | `ledgeheath` | `Medicinal` | **Wood/Yield:** none | A low shrub that grows only along the risers' ledges, so each riser is striped with level lines of green. A yellow dye (proposed). 0.5-1.5 m. |
| **Shelf oak** | `shelfoak` | `Fuel` | **Wood/Yield:** timber (straight grey boles); fuel<br>**Edible:** ['nut (an acorn-like mast, leached and ground)'] | The lake tread's woodland tree: a straight grey bole with four to seven flat tiers of branches, each a level plate of small leathery leaves, sky between them. 12-20 m. |
| **Stack cushion** | `stackcushion` | `Fuel` | **Wood/Yield:** fuel (dried) | A cushion that grows in terraced mounds, a step a decade. Winter fodder. 0.2-1 m (station 4). |
| **Step moss** | `stepmoss` | `Reagent` | **Wood/Yield:** none | Lays down lime as it grows, building rimstone dams and little pools down every wet line: the Tiers in miniature. Lime (a reagent, proposed). |
| **Tier sage** | `tiersage` | `Medicinal` | **Wood/Yield:** none | A felted grey sage whose flowers ring the stem in whorls, one above another, five or six to a stem: the dry slopes' summer yellow, a lilac on the canyon's benches. Medicinal (a tea); bees. 0.4-1 m. |

### Biome: `xanadu`
*Total qualifying species: **18** (Medicinal: 16, Reagent: 0, Fuel: 6)*

| Common Name | Key | Utility Roles | Harvest Details | Notes & Applications |
| :--- | :--- | :--- | :--- | :--- |
| **Agate pine** | `agatepine` | `Medicinal` | **Wood/Yield:** timber, resin<br>**Edible:** ['pine nuts'] | The banded heartwood is the Vale's finest carving wood; the resin is a salve. |
| **Beard tree** | `beardtree` | `Medicinal` | **Wood/Yield:** none | The beard moss dresses wounds. |
| **Cacao** | `cacao` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['pulp','beans (a dark drink)'] | Pods straight off the trunk; the white pulp is eaten fresh and the beans brewed dark. |
| **Chestnut-leaved oak** | `hyrcanoak` | `Medicinal` | **Wood/Yield:** timber<br>**Edible:** ['acorns (leached)'] | Acorns leached and ground for meal; the bark tans hides. |
| **Cloud pine** | `cloudpine` | `Fuel` `Medicinal` | **Wood/Yield:** carving, fuel | The resin is a salve. |
| **Desert rose** | `adenium` | `Medicinal` | **Wood/Yield:** none | The sap is a poison: arrow tips, never food. |
| **Dwarf frost willow** | `dwarfwillow` | `Medicinal` | **Wood/Yield:** none | The bark is chewed for pain, as the frost willow's. |
| **Flame cypress** | `flamecypress` | `Fuel` `Medicinal` | **Wood/Yield:** timber, incense | The wood is burned as incense. |
| **Frost willow** | `frostwillow` | `Medicinal` | **Wood/Yield:** basketry, withies | The bark is a pain tea. |
| **Ginkgo** | `ginkgo` | `Medicinal` | **Wood/Yield:** carving boards<br>**Edible:** ['seed kernels (roasted, a few)'] | The fleshy seed coats stink; the kernels are roasted a handful at a time. The leaves make a memory tea. |
| **Hive lily** | `hivelily` | `Medicinal` | **Wood/Yield:** none | The ribbed orange buds are dried and burned against midges. |
| **Maquis (lavender, broom, cistus, rosemary, thyme)** | `maquis` | `Fuel` `Medicinal` | **Wood/Yield:** fuel<br>**Edible:** ['herbs (lavender, thyme, rosemary)'] | Pot herbs, and cistus resin for incense. |
| **Moss** | `moss` | `Medicinal` | **Wood/Yield:** none |  |
| **Prickly pear** | `opuntia` | `Medicinal` | **Wood/Yield:** none<br>**Edible:** ['tunas','young pads'] | Orange-red tunas along the pad edges, peeled; young pads fried. |
| **Ring beech** | `ringbeech` | `Fuel` | **Wood/Yield:** timber, fuel<br>**Edible:** ['beechnuts'] | The nuts are roasted; they fall inside the rings. |
| **Silver scrub** | `silverscrub` | `Fuel` `Medicinal` | **Wood/Yield:** fuel | A bitter wormwood tea. |
| **Strawberry tree** | `arbutus` | `Fuel` | **Wood/Yield:** fuel, turnery<br>**Edible:** ['berries (jam)'] | Bumpy berries ripening red through orange; cooked into jam, heady when overripe. |
| **Whorl olive** | `whorlolive` | `Medicinal` | **Wood/Yield:** carving (the striped wood)<br>**Edible:** ['olives (cured)','oil'] | Olives banded like the bole, cured in brine or pressed for oil; the leaf tea lowers a fever. |
