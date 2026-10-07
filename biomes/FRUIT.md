# Biome fruit

One edible fruit, nut, seed, pod or fungus for each fruiting plant the biome kits draw. Each is a
catalog piece in `kits/catalog/krator-master-furniture-generic-fruit.js` (culture `generic`, type `food`, anchor
`surface`). It has two variants, as picked and as served, sized for a shelf board or a table top.
Each entry carries `biome` and `source`, which link back to the species here.

The biome geometry is unchanged: the colours come from the part each kit already draws (the pod, the
berry, the fruit head). Where a pod hangs metres long on a hypertree, the piece is what someone carries
home: a sawn round, a handful of seeds, a jar.

Where a species has no fruit drawn yet, this note says so ("not drawn").

## To do: put the fruit in the biomes

Done 2026-10-06 for all twelve biome kits: every species carries a harvest tag naming its catalog fruit (`<KIT>.HARVEST`, ebadlands'
`HV()` shape), the missing fruit is drawn (figs, whorl olives and lotus seed heads, tunas, beechmast and acorns, the screwpine's
pandan keys, split ballmelons, crater drylands' fireseed and parasol cones, nwbay's cliff figs), and each kit's probe runs
"fruit tagged, catalogued and drawn" with its negatives; every kit verifies. The catalog's fruit parts carry a texture family
(fruitSkin, fruitHusk, fruitShell, fruitScale, fruitFlesh, fruitJelly, fruitSeed, fungus: FAMILY_SPLITS in
kits/catalog/krator-furniture-core.js) that a host maps to the library's fruit sets (`f_fruitSkin` and so on; Girder, Scyvoi).

- [ ] **Vendored copies:** `settlements/dalab` (swlowlands), `settlements/xanadu` (xanadu) and `settlements/ys` (nwbay) keep
      their own copies of the biome fragments, which had drifted from the kits before this pass; they do not have the fruit yet.
      Re-vendor them deliberately (`build.py --vendor-check`), keeping each copy's recorded drift.
- [ ] **Not catalogued:** edible parts the kits name in their tags but the catalog has no piece for (each section lists them).

## Crater Drylands

**Drawn in the kit (2026-10-06).** Every species and small plant carries a harvest tag (`CRATERDRY.HARVEST`,
`CRATERDRY.PLANTS`; the inspector shows it, the probe checks it). Fruit is placed by a hash of the tree, so drawing it
moved nothing else. Edible parts with no catalog piece are named in the tags: prism-mallee, tree-aloe and pincushion
nectar, the pyre pillar's pith, the ember jade's sour leaves.

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Frill-tree fireseed | `frill` (dark seed in the living pods; spilled on the ash round a snag burst in the last year) | Fireproof seed thrown by the burst pod, gathered from the ash, roasted and ground: the first harvest of a burn. | `generic_fruit_fireseed` |
| Parasol pine nuts | `parasolpine` (brown cones under the branch-tip tufts, and fallen under the crown) | Big rounded cones opened by fire for their hard-shelled nuts; the ivory kernels eaten shelled. | `generic_fruit_parasol_pine` |
| Roasted yucca stalk | `yucca` (the cream flower spike), `joshua` (cream flower clusters at the arm tips) | Shared with ebadlands: the stalk and buds pit-roasted, the blossoms eaten in baskets. | `generic_fruit_yucca` |

## Eastern Abyss

**Drawn in the kit (2026-10-06).** Every fruit below was already drawn on its plant (the scalefruit pods on the boles, the
fern-eggs under the fronds, the waterpalm's fruit head, the cycad's cone); now every species carries a harvest tag naming its
catalog key (`EASTABYSS.HARVEST`; the inspector shows it, the probe checks it). Edible parts with no catalog piece are named
in the tags: tree-fern pith, palmetto heart, pickled jade leaves, araucaria cone seeds, mat-reed shoots.

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Scalefruit | `skyscale`, `forktree`, `bellbark` (cauliflory pods on the bole) | A red pod of overlapping scales that grows straight off the trunk. The flesh is pale pink, firm and salty-sweet, and is eaten in wedges. | `generic_fruit_scalefruit` |
| Fern-egg | `seedfern` (the "seeds big as eggs" under the fronds) | The Medullosa's seed, olive-brown in a husk cup. Bitter raw. Roasted in the coals and split, it is mealy like chestnut. One is a meal. | `generic_fruit_fern_egg` |
| Tideheart | `waterpalm` (the fruit head at the water line) | A round head of woody, dark-red carpels, each holding a plug of translucent jelly. The jelly is cut out and set in cubes. | `generic_fruit_tideheart` |
| Salt-cone kernels | `cycad` (the cone in the crown) | Red kernels from the cycad cone. Poisonous raw: they are steeped a week in the salt lake, then baked. They taste of salt and nut. | `generic_fruit_salt_cone` |

## Eastern Badlands

**Drawn in the kit (2026-10-06).** Every fruit below is drawn on its plant, and every species and small plant carries a
harvest tag naming its catalog key (`EBADLANDS.HARVEST`, `EBADLANDS.PLANTS`; the inspector shows it, the probe checks
it). Edible parts with no catalog piece are named in the tags: spruce and fir tips, maple sap, aspen and ponderosa inner
bark, cottonwood catkins, needle-bloom nectar, sunspire seeds (not catalogued yet).

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Pinyon nuts | `pinyon` (the brown cones at the branch tips) | Cones roasted open on the fire; the small oily nuts are cracked and eaten roasted. | `generic_fruit_pinyon` |
| Juniper berries | `juniper` (the dusty blue berries in the sprays) | A resinous spice for meat and brew, dried in a jar. | `generic_fruit_juniper` |
| Roasted yucca stalk | `yucca` (the flower spike; past flowering, green seed pods up the stalk) | The young stalk pit-roasted like a sweet squash and cut into rounds; the blossoms eaten in baskets. | `generic_fruit_yucca` |
| Canyon grapes | canyon grape (vines hanging off cottonwood and maple limbs, grape tangles on the canyon floor, the arcade's hanging gardens) | Small dark grapes in clusters among the leaves; dried as raisins. | `generic_fruit_canyon_grape` |
| Stilt pod | `stiltpod` (the scaled pod head on its stilt roots) | Ripens custard-soft: halved, cream flesh with dark seeds, spooned out. | `generic_fruit_stiltpod` |
| Umbel seed | `umbel` (a third of the heads gone to tan seed) | A sharp caraway-like spice; the sap burns skin in the sun. | `generic_fruit_umbel_seed` |
| Acorns | `oak` (gambel oak: acorns at the twig tips) | Shared with nhighlands: leached and ground for meal. | `generic_fruit_mast` |
| Desert tunas | prickly pear (red tunas along the pads) | Shared with sedesert. | `generic_fruit_tuna` |
| Moonfruit | moonflower cactus (magenta fruit on the column tops) | Shared with xanadu's pitaya: white flesh, black seeds. | `generic_fruit_pitaya` |

## Hyperjungle

**Drawn in the kit (2026-10-06).** Every fruit below is drawn on its plant (the gatepods, the mahogany capsules, the kapok's
burst silk pods), and the screwpine's hanging head is now drawn as pandan keys (orange wedge keys, green tips, the catalog
palette). Every species and the belt's own understorey plants carry a harvest tag naming the catalog key
(`HYPERJUNGLE.HARVEST`, `HYPERJUNGLE.PLANTS`; the inspector shows it, the probe checks it). Edible parts with no catalog
piece are named in the tags: tree-fern croziers, ginger rhizome, bromeliad tank water.

**In a world: Girder (2026-10-03).** Its Gate baobabs' hanging pods are the gatepods (`SPECIES[3].harvest` in
`settlements/girder/src/30-layout.js`, named by the inspector), and its fruit-seller stalls sell gatepod rounds and
chalk, mahogany nuts, silkpods and pandan keys from the catalog (`STALL_FRUIT`, `55-arch.js`). A build that bundles
`generic-fruit` must bundle `generic-goods` too: the fruit's colours live there (`kits/catalog/KNOWN_ISSUES.md`).

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Gatepod | `baobab` (orange velvet pods, also in `swbay`) | The pods hang 4 to 14 m and are sawn into rounds. The chalky cream pulp around the seeds dries into sweet-sour "gatepod chalk" blocks that keep for a year. | `generic_fruit_gatepod` |
| Mahogany nut | `mahogany` (woody capsules in twos and threes) | A five-valved capsule that splits to release winged seeds. The seeds are oily and roasted, and eaten wing and all. | `generic_fruit_mahogany_nut` |
| Silkpod | `kapok` (the burst silk pods) | Young green pods are cooked like beans. A ripe pod bursts into cream floss with black seeds, and the seeds are pressed for oil. | `generic_fruit_silkpod` |

## North-west Bay

**Drawn in the kit (2026-10-06).** Every species carries a harvest tag (`NWBAY.HARVEST`; the inspector shows it under a
tree, the probe checks it). The figs are new and placed by a hash of the tree; the pods, pandan heads and arils were
drawn before. Named in the tags, not catalogued: prism-gum nectar, crown-fern fiddleheads, umbrella-thorn gum, mangrove
propagules, lotus-trumpet petals, mat-reed shoots. The sea-grape on the shore is not tagged yet.

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Cliff figs | `clifffig` (clusters of small figs under the crown, orange-red and ripe purple) | Small strangler figs the year round; eaten fresh or halved. | `generic_fruit_cliff_fig` |
| Avenue baobab fruit | `avenuebaobab` (the odd ochre pod hanging from the flat crown) | A velvety egg cracked for its dry cream pulp; the dark seeds pressed for oil. | `generic_fruit_avenue_baobab` |
| Traveller's fan arils | `travellerfan` (blue arils at the fan's foot) | A woody capsule split in three, the seeds wrapped in oily electric-blue arils. | `generic_fruit_traveller_aril` |
| Gatepod | `baobab` (the gate baobab's hanging pods) | Shared with hyperjungle: rounds sawn off the pod, the sour chalk pulp. | `generic_fruit_gatepod` |
| Pandan keys | `pandan` (the odd orange fruit head under a strap rosette) | Shared with nwlowlands: keys chewed or cooked to a paste. | `generic_fruit_pandan_keys` |

## North-western Lowlands

**Drawn in the kit (2026-10-06).** Pandan keys and banksia candles are drawn and tagged with their catalog keys
(`NWLOW.HARVEST`; the inspector shows it, the probe checks it). Hearts, shoots, fiddleheads, birch sap and grass-tree nectar
are named in the tags.

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Pandan keys | `pandan` (the orange pompom under the leaf tufts; also the hyperjungle screwpine's fruit head) | A head of orange wedge "keys" with green tips. The sweet fibrous base of each key is chewed, or the keys are boiled down to an orange paste. | `generic_fruit_pandan_keys` |
| Candle nectar | `banksia` (the upright flower candles) | A drink, not a fruit: the candles are steeped in water until it turns sweet and gold. | `generic_fruit_candle_nectar` |

The wattle pods, ginkgo seeds and kauri cones are not drawn and have no catalog piece: tagged edible with `fruit: null`.

## Northern Highlands

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Yew-lantern arils | `elderyew` (red arils, HV "arils (not the seed)") | Red cups around a dark seed. "Eat the cup, spit the stone": the seed is poison. | `generic_fruit_yew_lantern` |
| Frost rowan | `rowan` (red berry clusters, HV "berries (cooked)") | Bitter raw. After a frost and cooking, it makes an orange-red jelly. | `generic_fruit_rowan` |
| Wall bilberries | heath and bilberry floor (HV "bilberries") | Late-summer blue berries, gathered into birch-bark punnets and eaten with cream. | `generic_fruit_bilberry` |
| Lantern pods | the lantern-pod epiphyte (violet pods under boughs) | Violet pods that keep glowing under the skin for a day after picking. They taste of anise and pepper, and are sliced thin. | `generic_fruit_lantern_pod` |
| Beechmast and acorns | `bluebeech` (HV "nuts"), `gnarloak` (HV "acorns"): three-nut clusters under the hero crowns | Three-sided beechmast nuts in their husks, roasted. Acorns are leached and ground into meal. | `generic_fruit_mast` |

**Drawn in the kit (2026-10-06).** Every species and plant carries a harvest tag. The fruiting ones name their catalog key (`HV(...,fruit)`, `NHL.FRUIT_KEYS`). Beechmast and acorns are now drawn as the `mast` item (a 4-triangle tetrahedron, three-nut clusters at hero level, about 17k instances). The host probe's "fruit tagged, catalogued and drawn" check, with two negatives, guards it.

## Rift

**Drawn in the kit (2026-10-06).** Every fruit below is drawn on its plant, and every species and the ball vine carry a
harvest tag naming its catalog key (`RIFT.HARVEST`, `RIFT.PLANTS`; the inspector shows it, the probe checks it). A few
near ball vines end in a ballmelon split in two, its yellow flesh up (`fruitBallmelonFlesh`). Edible parts with no
catalog piece are named in the tags: the stone pine's nuts, the monkey-puzzle's seeds, the acacia's pods and gum, the
cycad's leached starch, the tree-fern's fiddleheads, and the baobab's fruit pulp (its pale pods are drawn, not catalogued yet).

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Ballmelon | ball vine floor (green spheres over the rocks) | A ribbed green melon with yellow flesh, the colour of the algal lake. Small ones come indoors whole, big ones in slices. | `generic_fruit_ballmelon` |
| Frillpods | `carrotfrill` (hot pink pods under the flower head) | Hot-pink pods, eaten raw. They fizz on the tongue. Cut into coins they show a white core. | `generic_fruit_frillpod` |
| Lantern fruit | `lanterntree` (also `xanadu:lanterntree`) | A papery husk lantern around one berry. The husk is pink, gold, orange, blue, violet or teal, as on the tree. | `generic_fruit_lantern_fruit` |
| Bell dates | `bellpalm`, `cloudbell` (pods under the fan bells) | Sticky olive-gold dates that hang in strands inside each bell. | `generic_fruit_bell_date` |


## South-eastern Desert

**Drawn in the kit (2026-10-06).** All three fruits are drawn and tagged: mesquite pods (`pods`), wadi dates (`dates`, the bunch under the palm crown) and desert tunas (`fruit`, orange-red on the prickly pear pads' upper rims, coloured from `fruitTuna`). `SEDESERT.HARVEST` tags the 13 species and `SEDESERT.PLANTS` the 11 floor plants. The probe check is 'fruit tagged, catalogued and drawn'. Edible, not in the catalog yet: the cardon's fruit, the agave heart, the Joshua-tree buds.

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Mesquite pods | `mesquite` (yellow pods at the crown, riverside tree form) | Sweet pods, bundled and dried, then ground into flour for flat mesquite cakes. | `generic_fruit_mesquite` |
| Wadi dates | `palm` (the bunch of dates under the crown) | A bunch of dates still on its strands, or loose in a basket. | `generic_fruit_wadi_date` |
| Desert tunas | prickly pear scrub (`SEDESERT.PLANTS.pear`; also `xanadu:opuntia`) | Orange-red fruit along the pad edges, with spines. Peeled, the flesh is deep red. | `generic_fruit_tuna` |

## South-west Bay

**Drawn in the kit (2026-10-06).** The gatepods on the savannah baobabs (catalog key `generic_fruit_gatepod`, the
hyperjungle's piece), the coral fungus and the parasol caps are drawn and tagged (`SWBAY.HARVEST`; the inspector shows it,
the probe checks it). The umbrella thorn's pods and the monkey-puzzle cones are tagged edible with `fruit: null`.

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Bay fungi | `coral` (the coral fungus shrub), `parasol` (parasol mushroom) | Fruiting bodies rather than fruit. The orange, pink and violet coral is picked as a clump. Parasol caps are grilled whole in a pan. | `generic_fruit_bay_fungi` |

The gatepod (above) also grows here, on the savannah baobabs. The umbrella thorn's pods and the monkey-puzzle cones are not drawn.

## South-western Lowlands

**Drawn in the kit (2026-10-06).** Every fruit below is drawn on its plant, and every species and the toyon carry a
harvest tag naming its catalog key (`SWLOW.HARVEST`, `SWLOW.PLANTS`; the inspector shows it, the probe checks it). The
pillar figs hang in clusters under the limbs and on the fused bole. Edible parts with no drawn catalog fruit are named in
the tags: acorns (sprawl, coast and cork oak), bay laurel berries and leaves, skirt-palm fruit, kapok seed, cane-palm
heart, pine nuts.

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Madrone berries | `madrone`, `manzanita`, toyon shrub (red berries at the tips) | Bumpy red berries, mealy and sweet. Manzanita berries are pressed into a cider. | `generic_fruit_madrone` |
| Rattlepods | `rattlepod` (clusters of red-brown pods under the flat top) | Flat pods whose seeds rattle when ripe. The seeds are roasted dark and brewed as "rattle coffee". | `generic_fruit_rattlepod` |
| Ember tamarind | `flame` (dark pods in the leaf crown) | A brittle dark shell around sour-sweet brown pulp, which is pressed into cakes. | `generic_fruit_ember_tamarind` |
| Pillar figs | `pillarfig` (purple clusters on the limbs and the fused bole) | Purple figs, pink inside. | `generic_fruit_pillar_fig` |

The bay laurel's berries, the skirt palm's fruit and the oaks' acorns are not drawn.

## Xanadu

**Drawn in the kit (2026-10-06).** Every species and floor plant carries a harvest tag (`XANADU.HARVEST`, `XANADU.PLANTS`
in `biomes/xanadu/src/50-biome-xanadu-species.js`), and the inspector shows it. The striped olives hang under the whorl
olives' leaves (item `whorlolive`), and green seed heads stand on the lotus pads (item `lotuspod`). The probe's "fruit
tagged, catalogued and drawn" check finds every fruit below on the stage. `settlements/xanadu` vendors this kit.

| Fruit | Borne by | What it is | Catalog key |
|---|---|---|---|
| Cacao | `cacao` (pods straight off the trunk) | Ridged pods in red, gold or orange. The white pulp is eaten fresh, and the beans are made into a dark drink. | `generic_fruit_cacao` |
| Pitaya | `pitaya` (magenta fruit with green flames) | Magenta skin with green-tipped scales. Halved, the flesh is white with black seeds. | `generic_fruit_pitaya` |
| Violet plantains | `violetplantain` (hands of yellow fruit under a purple bract) | A hand of yellow plantains with its bract, or fried in slices. | `generic_fruit_plantain` |
| Wingnut chains | `wingnut` (green catkins of winged nuts) | Long chains of green winged nuts. The nuts are shelled and roasted. | `generic_fruit_wingnut` |
| Strawberry-tree berries | `arbutus` (red and orange berries) | Bumpy berries that ripen red through orange. They are cooked into jam, and are a little heady when overripe. | `generic_fruit_arbutus` |
| Whorl olives | `whorlolive` (banded olives under the silver leaves) | Olives with a pale band twisted round each, like the tree's striped bole. Served in a dish or pressed for oil. | `generic_fruit_whorl_olive` |
| Lotus seeds | the lotus floor plant (green seed heads on the pads after the flowers) | A green seed head with its seeds set in the face. The fresh seeds are sweet. | `generic_fruit_lotus_seed` |

The prickly pear's tunas and the lantern tree's fruit are listed above. The baneberry is poisonous
and has no entry, and the Wollemi pine's cones are not food.
