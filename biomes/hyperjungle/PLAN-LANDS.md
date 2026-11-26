# The hyperjungle's lands and the savannah rims (plan, 2026-10-26)

The owner (2026-10-26): the old `hyperjungle` polygon is gone. The kit as built, in its pure form, is now **`hyperjungle
S`**. North of it is the **savage hyperjungle**, the Beast Riders' home; **`hyperjungle N`** is Screamer country, with a
long stretch of savannah. The **savannah rims** each call back to the big biomes in their own direction, and the
**southern crater-drylands patch** trades species with Godstep and the south-east rim.

This plan replaces stations 2 and 3 of `PLAN-STATIONS.md`, which was written for the old polygons.

**Status (2026-11-08): J0 and J1 done (with the core gaps H1-H8, H10); J2-J6 built in a cloud session on CPU checks only; J7-J9 not started**
(builds, the lints and a SwiftShader load of each page with its own checks; the GPU verify is the coordinator's, owed). Wherever this
file says *proposed*, the owner has not decided; where a step took a proposal so it could be built, section 14 marks it **taken as
proposed, owner to confirm**.

| Step | Built | Page |
|---|---|---|
| J2 | the savage land: the old-growth habit (50, 55: `HYPERJUNGLE_LOOK.habit`), H6 (the impostors' reach and cell), the 8 species (`src/54`, `src/56`), bais, trails, wallows and licks, the Riders' beasts by land (H8) | `dist/hyperjungle-savage.html` (`--station savage`) |
| J3 | Screamer wood: H5 (the howl bamboo on `BIO.bamboo`, the Cut's reach on H1), the bone giants, the 7 others (`src/57`), the habit thinned (ironbark and ghostwood leading), the groves' howl (H9 sound records), the fauna hunted thin (H8) | `dist/hyperjungle-north.html` (`--station north`) |
| J4 | the savannah rims, built as `biomes/savannarim` and folded into `biomes/abyssal-savannah` as its stations (its `PLAN.md` section 14 holds the core adoption; section 14 answer 1 below): H3 (KFIRE), H10 (KSTACKS.mounds), H7 (the seasons), the savannah's base (red oat grass, blind grass, fan palm, umbrella thorn; the gallery forest and the outliers read in place) and the north savannah (the bone giants and bloodwood read in place); the hyperjungle's station `north` reads its blind grass | `biomes/abyssal-savannah/dist/abyssal-savannah-north.html` (`--station north`) |
| J5 | the e rim: seven cousins by BIO.kin of eastabyss's and the e highlands' builders read in place, H4 (`BIO.setGiant`, the pull fading west), the savage land's comb tree and elephant ear by reach (H1) | `biomes/abyssal-savannah/dist/abyssal-savannah-erim.html` (`--station erim`) |
| J6 | the se rim, the incense country: its zones, the Bowl's cousins (rain dragon, rain rose, rain bottle), incense, cloud avocado, leaning tree fern (H4), the rust miombo defined here with its copper flush (H7; read by Godstep's redlands), the red guyed stalk left to Godstep (not built there yet), the Bowl's and the drylands' species by reach | `biomes/abyssal-savannah/dist/abyssal-savannah-serim.html` (`--station serim`) |

## 0. The ground (scale model 4.23, surveyed 2026-10-26)

Each polygon is counted here without the smaller polygons inside it, since the smaller polygon wins an overlap, as in
`extract_region.py`. Air pressure is worked out from height, using the same rule as the earlier surveys.

| Polygon | Own km² | Height (median, 5-95%) | Air | Rain (median, 10-90%) | Mean | Climate | Settlements in it |
|---|---|---|---|---|---|---|---|
| `hyperjungle S` | 45.2k (32% water) | -1,380 (-1,497 .. -847) | ~1.90 atm | 2,055 (1,569 .. 3,090) | +31 | XA 79%, Af 12% | Iziz, Port Tobin, Fort Vaklu, Stump |
| `savage hyperjungle` | 28.2k (27% water) | -1,376 (-1,485 .. -1,149) | ~1.90 | 1,898 (1,380 .. 2,431) | +32 | XA 90%, Af 4% | Mav's Refuge, Girder, Crescent, Flooded Tower |
| `hyperjungle N` | 27.9k (8% water) | -1,269 (-1,600 .. -677) | ~1.88 | **1,035** (769 .. 1,631) | +32 | XA 31%, **XV 29%, Aw 24%, BSh 7%** | the Hexahedron, Shell, Port Goto, Fort Kalor |
| `e savannah rim` | 24.2k | -799 (-1,165 .. -245) | ~1.77 | 1,490 (1,145 .. 2,118) | +29 | Am 53%, Aw 32% | Fridon, Fort Ordo |
| `se savannah rim` | 33.3k | -407 (-1,046 .. +779) | ~1.68 | 1,286 (831 .. 2,149) | +26 | Aw 30%, Am 29%, **Cfa 25%** | Talia, Pylon |
| `crater drylands` (the southern patch) | 8.4k (11% water) | +121 (-690 .. +1,441) | ~1.5 | 471 (345 .. 816) | +22 | BSh 68%, Aw 15% | none |
| *for reference:* `godstep valley` | 36.5k | +3,225 | ~1.0 | 173 | +7 | Dsc, Dsb, BSk | |

What the numbers say:
- **S and savage have the same climate.** What sets the savage hyperjungle apart has to come from its soil, its history
  and its animals, not its weather (section 2, "Why it is savage").
- **N is half as wet as the other two.** Only a third of it is closed jungle (XA). The rest is abyssal savannah (XV) and
  Aw. The jungle part and the savannah part are one land, drawn by two kits (section 1).
- **The rims are the only places at the right height for savannah.** They are 0.6 to 1 km above the jungle floor, under
  much the same rain. The south-east rim climbs into Cfa where it meets the e highlands' wet face. That face's wettest
  ground, about px 789,614, is next to Talia (801,609).
- **The drylands patch** is a semi-arid saddle between the Throne's drylands, Godstep's low end and Pylon (597,672).

## 1. How it is cut up (proposed)

| Land | Kit | Why |
|---|---|---|
| `hyperjungle S` | `biomes/hyperjungle`, land `pure` (the page as built) | the kit as it stands, plus the lake station (section 6) |
| `savage hyperjungle` | `biomes/hyperjungle`, land `savage` | the same forest as S, but larger, with new species and the beasts |
| `hyperjungle N`, its XA part | `biomes/hyperjungle`, land `north` | Screamer wood |
| `hyperjungle N`, its XV/Aw/BSh part | **`biomes/abyssal-savannah`**, station and land `north` | the blind grass. The savannah's base comes from the savannah kit |
| `e savannah rim` | `biomes/abyssal-savannah`, station `erim`, land `east` | "the old lines": the abyss's and the highlands' cousins |
| `se savannah rim` | `biomes/abyssal-savannah`, station `serim`, land `southeast` | "the incense country": the Bowl's, the wet face's and Godstep's cousins |
| `crater drylands` (south) | `biomes/crater-drylands`, station `south` | the three-way species swap |

- **One kit holds the savannah's base** (`biomes/abyssal-savannah`'s rim stations, section 14 answer 1; first built as a new kit, `biomes/savannarim`, and folded in),  for all three savannahs: tall grass, the fire mosaic,
  termite cathedrals, gallery forest, and the shared base species (section 4). Each land sets its own palette on top of
  that. Pylon and Talia already read this ground (`settlements/iziz/VASSAL-KITS.md`). The alternative is to keep the
  savannah as stations of the hyperjungle kit, which is what `PLAN-STATIONS.md` proposed. That would cram four very
  different palettes into one 160 KB kit.
- **A land is a weight, not a hard line.** `HYPERJUNGLE.land(x, z)` and `SAVRIM.land(x, z)` return `{pure, savage,
  north}` or `{north, east, southeast}`, read from the polygons' region raster and blurred. Inside a kit, two lands meet
  across a band about 5 km wide. Two kits meet with the usual ecotone (`biomes/WORLD.md`, "Two kinds of border").
- **Species cross borders much further than an ecotone does** (core gap H1). Each borrowed species carries a `reach`: how
  many km it travels from its home polygon, and how quickly its density falls off. That is the "diffusion" the owner
  asked for. The usual ecotone is a few hundred metres. A reach is tens of km.
- **A borrowed species is a cousin, not a copy** (core gap H2). A `kin` record names the parent (`eastabyss.sigillaria`)
  and changes its habit, size, colours and phenology. It reuses the parent's builder, read in place. Nothing is copied
  between kits.

## 2. The savage hyperjungle (land `savage`)

**The brief:** the trees grow even taller, the beasts are larger, and carnivorous plants turn up now and then (far fewer,
and far less deadly, than in Korona). All the Riders' beasts are native here.

### Why it is savage (proposed)
The great volcano sits upwind, to the west, and the NW wind carries its ash over this forest. The lore already says its
ash "makes it fertile". Here the ash falls on soil the beasts dung heavily, and the result is the richest ground in the
crater. That accounts for both the size and the herds. It does **not** account for carnivory, which in Korona follows
poor soil. So the carnivores here live **where the giants starve everything else**: up in the epiphyte gardens, which
only get what falls from above, and on the dark floor under 480 m crowns. They are a canopy-and-shade guild. They are not
Korona's open bog.

### The kit's six at savage scale
The **old-growth habit** (`savage:true`): every hypertree's height goes up by 1.4 to 1.6 times, so the canopy is 300 to
480 m, the height Mav's Refuge already stands in (`LORE.md` §6.6). The buttresses get deeper, the boles are hung with
more epiphytes, and the crowns break into several layered tiers. The gate baobab becomes the 150 to 200 m giant that Mav's
Refuge's gateway trees were carved from. The species' shares change: ghostwood and prism gum lead, as in the Refuge's
holds, and the mahogany is rarer. The far ring needs impostors for 480 m crowns (core gap H6).

### New species (8)

| Key | Name | Earth model | What it is | Where | Harvest |
|---|---|---|---|---|---|
| `cathedralfig` | **Cathedral fig** | strangler figs (*Ficus*) that outlive their host | a strangler that grew round a dead hypertree. The host has rotted out, leaving a hollow lattice tube of roots 250 to 350 m tall that you can climb inside. Spider-rider silk is strung through it | 1 per ~2 km², always on an old host's footprint | figs (fruit, the canopy's food); the lattice used as a roost and a ladder |
| `combtree` | **Comb tree** | tualang (*Koompassia excelsa*), the bees' tree | a smooth, pale, pinkish emergent with a narrow crown that pushes up through the canopy to 480 m. Giant bees hang combs 3 to 6 m long under its limbs | the canopy's highest points | **giant-bee honey** and wax. Getting it is dangerous: a job for flyers |
| `armourpalm` | **Armour palm** | spiny palms (*Bactris*, *Aiphanes*) | an understorey palm 20 to 40 m tall. Its trunk is ringed with black spines 30 cm long, which keep the browsers off. Trampled stands show where the herds have been | the floor, near the bais | palm heart (a vegetable); oily fruit |
| `elephantear` | **Elephant ear** | giant taro (*Alocasia*, *Colocasia*) | leaves 6 to 12 m long, on stalks taller than a rider. Broken, browsed clumps line the beasts' trails | along the trails and the stream banks | **the taro corm**: a staple, mildly toxic until cooked |
| `bailawn` | **Bai sedge** | the grazing lawns that elephants keep in Congo's bais | a short, dense sedge-and-grass lawn that grows only where herds graze it down. The bais are clearings of 200 m to 2 km, with wallows and salt licks | the bais (section 2, "Landforms") | grazing land: where the Riders' ranches began |
| `skypitcher` | **Sky pitcher** | *Nepenthes rajah* and *N. lowii*, pitchers that tree shrews and rats use as toilets and feed with their dung | an epiphytic pitcher 1 to 3 m tall, hanging in the boughs' epiphyte gardens. It catches the canopy darts and feeds on the droppings at the Nightwing roosts. Not dangerous to people | the bough perches the tree pass exports | none. The Nightwing tribe keeps them near the roosts |
| `carrionarum` | **Carrion arum** | titan arum (*Amorphophallus titanum*) and the trap flowers of *Arum* | a corpse flower 6 to 10 m tall, a maroon spathe round a pale spire, that stinks of rot. Its chamber is a pitfall that traps animals the size of a dog for a night, as *Arum* traps flies. **The one thing in the savage jungle that can kill a child** | the darkest floor; rare (1 per ~5 km²), flowering at dusk | the corm, eaten in a famine |
| `snareliana` | **Snare liana** | *Triphyophyllum peltatum*, a West African liana that is carnivorous only while young | while young it creeps over the floor with glandular sticky leaves and catches insects. Once grown it is an ordinary canopy liana | under the lianas, near their roots | rope fibre (from the grown vine) |

Carnivory stays occasional. All three trap species together are well under 1% of the plants placed. They run on the
existing trap module (`core/biome/37-core-traps.js`, `KTRAPS`). The look is borrowed from Korona's pitchers
(`organic.pitcher.giant`, `card.carnivore.monkeycup`), but the colours are the savage jungle's own: wine and moss green,
not Korona's mottled cream.

### Landforms
- **Bais**: clearings the herds keep open. Wallows (mud pans that dry out to cracked mud), salt licks (bare banks of red
  clay, chewed into), trails that converge on the clearing, and broken and trampled understorey round the edge.
- **Beast trails**: tunnels 4 to 8 m wide through the understorey, running straight between bais and water. Elephant ear
  and armour palm lie broken along them.
- **The ash**: a darker, richer soil tint than S's. Old ash beds show in the stream cuts.

### Fauna (`kits/fauna`; the beasts are already there)
The Riders' beasts, wild, at **savage size** (1.2 to 1.4 times their ridden size): threehorn and hardshell herds in the
bais, mammoths on the trails, raptor packs, staghorn beetles and longcrawlers on the floor, giant spiders in the cathedral
figs, quetzalcoatlus, wingclaws and nightwings over the canopy, and giant dragonflies over the streams. The kit's own
striders, sky rays and sloths stay, but are rarer. The herds now have something to run from, which the kit's `NOTES.md`
wanted ("the herds have nothing to run from").

## 3. Hyperjungle N, the jungle (land `north`): Screamer wood

**The brief:** a jungle with no clear identity yet, a stretch of savannah, the Cut's hyperbamboo perhaps, and the
Screamers' stomping grounds. It should feel unsettling.

### The idea (proposed): a forest that looks and sounds like people
Everything unsettling here is a real plant habit, used in a frightening way:
- **It screams.** Boring beetles bore holes through the hyperbamboo's culms, and the dusk wind blows through the groves
  and makes them howl. *Proposed* (as rumour): the Screamers' speech began as an answer to the groves.
- **It watches.** Pale bark covered in dark, eye-shaped branch scars, as on aspens.
- **It reaches.** Flowers like red clawed hands.
- **It wears skulls.** The Screamers' sign is the skull, and their skull-pods grow here.
- **It is dying.** The north is drying out. White standing-dead hypertrees, the bone giants, rise out of the savannah and
  the thinning forest, hung with grey hair.
- **It is quiet.** Fewer birds and darts than in S, and the fauna has been hunted thin. The only loud thing is the
  bamboo.

### Species (9 new, 1 state)

| Key | Name | Earth model | What it is | Where | Harvest |
|---|---|---|---|---|---|
| `howlbamboo` | **Howl bamboo** | *kin* of the Cut's `hyperbamboo` (from nwlowlands' sky bamboo, after *Dendrocalamus giganteus*) and the "singing bamboo" that wind sounds through borer holes | culms 50 to 70 m tall. Outside the Cut's warp, so their internodes vary in length. Every old culm is bored through with fist-sized holes in rows, and pale stains run down from the holes. Groves of 50 to 300 | spread out of the Cut's south-east mouth and down the valleys (reach ~150 km from `the cut`) | shoots; culms (the Hexahedron's ladders and lashings); the holed culms are prized as horns |
| `bonegiant` | **Bone giant** (a *state*, not a species) | the dead standing kauri and redwood snags of a drying forest | the kit's hypertrees killed standing: white, barkless, the crown reduced to a few limbs, 150 to 300 m tall | across the savannah and the thinning forest edge (more where rain is under 1,100 mm) | timber for whoever can fell it |
| `watcher` | **Watcher** | aspen (*Populus tremuloides*), whose dropped branches leave eye-shaped scars | a 60 to 90 m pale-barked tree covered in dark almond-shaped scars, "eyes", thickest at a person's head height | the forest edge, in pale stands | soft white timber; the Screamers carve the eyes into masks |
| `handflower` | **Hand-flower tree** | devil's hand tree (*Chiranthodendron pentadactylon*) | a 30 to 50 m tree whose red flowers open as five-clawed hands, held palm up, under felted leaves | understorey gaps | none. The Screamers call the hands "the elders" (proposed) |
| `bloodwood` | **Bloodwood** | kiaat (*Pterocarpus angolensis*), whose sap runs blood-red | a 30 to 45 m savannah-edge tree that bleeds thick red sap wherever it is cut or browsed, so its bark is streaked dark red | the forest and savannah edge (the savannah kit reads it in place) | **red dye and body paint**: the Screamers' painted dots (`LORE.md` §6.7) |
| `skullpod` | **Skull-pod** | snapdragon (*Antirrhinum*), whose dry seed pods look like small skulls | a 2 to 4 m shrub. Its seed pods dry into fist-sized skulls that rattle in the wind | the floor, and the cleared ground round the Screamers' villages | the Screamers string them on skull poles |
| `widowhair` | **Widow's hair** | Spanish moss (*Tillandsia usneoides*) and old man's beard | grey hanging curtains 10 to 40 m long on the bone giants and dead limbs | wherever there are bone giants | stuffing; tinder |
| `ghostpipe` | **Ghost pipe** | ghost pipe (*Monotropa uniflora*), a white plant with no chlorophyll | waxy white stems 1 to 2 m tall, bent over at the head, in clumps on the dark floor. They turn black when touched | the darkest floor, under the bamboo | a sedative (proposed medicine) |
| `devilsfingers` | **Devil's fingers** | octopus stinkhorn (*Clathrus archeri*) | red fungal "fingers" 1 to 2 m long that hatch out of a pale egg and curl back. They stink | the litter after rain | none |
| `blindgrass` | **Blind grass** | elephant grass (*Pennisetum purpureum*) in the dense air | cane-grass 5 to 8 m tall, too dense to see through: the raiders' grass. Defined in the savannah rims' kit (`biomes/abyssal-savannah` `src/rim/`, section 4), and it grows into the forest gaps here | the savannah, and gaps in the jungle | fodder, thatch, screening walls |

The kit's six hypertrees grow here at the *pure* scale but thinner, and they turn into bone giants as rain falls. Ironbark
and ghostwood lead, because they stand drought best. Prism gum is rare.

### Fauna
The Screamers' **millipede ranches** (the economy, `LORE.md` §6.7) and orchards. Wild longcrawlers. Few flyers. The vine
boa and lattice mantis from `kits/fauna`'s hyperjungle set. Punji pits and net traps are the Screamers' own records (the
settlement's job, `settlements/screamers`), but the kit leaves clear lanes in the blind grass for them.

## 4. The savannah base (`biomes/abyssal-savannah`'s rim stations, `src/rim/`, every land)

Shared by the north savannah and both rims. Each land re-tints and re-weights it.

| Key | Name | Earth model | What it is | Harvest |
|---|---|---|---|---|
| `redoat` | **Red oat grass** | *Themeda triandra* | a tussock grass 2 to 3 m tall in the dense air. Green in the rains, then red-bronze, then straw. Burns every two to four years | grazing, thatch |
| `blindgrass` | **Blind grass** | *Pennisetum purpureum* | section 3. Mostly in the north, and in the rims' wet hollows | fodder, thatch |
| `borassus` | **Fan palm** | *Borassus aethiopum* | a 30 to 40 m palm whose trunk swells halfway up, under a crown of stiff fans. In scattered stands | palm wine, fruit |
| *read in place* | **Umbrella thorn** | swbay's `thorn` | the flat-topped thorn tree on the open savannah | |
| *read in place* | **Gallery forest** | the hyperjungle's six at 0.3 to 0.5 times their size, with screwpines and gingers | lines the rivers and fills the hollows. Its weight comes from the rivers' drainage and the wetness field | |
| *read in place* | **Monsoon crimson kapok** | the kit's `kapok`, deciduous | stands bare in the dry season, scarlet flowers on bare wood: the monsoon forest's sign | |
| *read in place* | **Gate baobab outliers** | the kit's `baobab`, savannah habit | lone giants on the savannah | gatepod |

**Landforms**: termite cathedrals (fluted red clay towers 5 to 15 m tall, in the dense air: core gap H10), laterite
pavements and breakaways, dambos (seasonal grassy wetlands along the valley heads), the burn mosaic (core gap H3), and
fire-scarred bark on everything.

## 5. The rims

### 5.1 The east rim (land `east`): the old lines
East of it are the e highlands (the cushion plateau, where everything grows **toward the giant**), and beyond them the
eastern abyss (the Carboniferous coal-swamp jungle: scale-trees, seal-trees, horsetails, cycads). *Proposed:* the abyss's
Palaeozoic lineages have come down to the monsoon savannah as **fire-hardened relics**, as cycads and grass-trees hold
Australia's fire savannahs. The highlands' **pull toward the giant** shows in the rim's own species, and fades out from
east to west.

| Key | Name | Kin of | Earth model | What it is | Harvest |
|---|---|---|---|---|---|
| `firescale` | **Fire scale-tree** | `eastabyss.sigillaria` (the seal-tree) | *Sigillaria*; the corky bark of fire-savannah trees | an unbranched pole 25 to 45 m tall, under a single tuft of grass-like leaves. The leaf-cushion bark is thick, corky and charred black on the side the fires come from | cork |
| `monsooncycad` | **Monsoon cycad** | `eastabyss.cycad` (salt cycad) | *Cycas armstrongii* in Kakadu, which flushes new fronds all at once after a burn | a 5 to 10 m cycad. After every fire the stands flush bright green out of the char together | **sago**: toxic until it is leached for a week, like the abyss's salt-cone kernels (`LORE.md` §8) |
| `dambotail` | **Dambo horsetail** | `eastabyss.horsetail` (pipe reed) | *Calamites*; scouring rush | a horsetail 8 to 15 m tall in the dambos, jointed, in whorls | scouring rush (an abrasive) |
| `emberspike` | **Ember spike** | `ehighlands.vigil` (vigil spike) | grass-trees (*Xanthorrhoea*), which flower after fire | a woody-stemmed spike 6 to 12 m tall. Whole stands flower together after the dry-season burn, **leaning toward the giant** | nectar (drunk from the spike) |
| `monsoonrag` | **Monsoon ragbark** | `ehighlands.ragbark` | miombo-woodland trees that drop their leaves in the dry season | a 30 to 50 m deciduous tree with ragged peeling bark. Its crown fans out toward the giant, so a stand reads as combed toward the NE | timber, bark cloth |
| `bolster` | **Bolster** | `ehighlands.cushion` (poured cushion) | *Borya*, the resurrection plant on Australian granite, green when wet and orange when dry | a low cushion on ironstone and rock pavements: emerald in the rains, fire-orange and dry in the dry season | none |
| *optional* `glasswand` | **Glass wand** | `ehighlands.glasstower` | | a small translucent-stemmed cousin of the glass tower on the pavements, carrying the same moth and the same **pallidine**: the source of **Fridon's** wormwick trade (proposed) | wormwick |

West of the rim's midline, the savage jungle's species come in by reach: the comb tree on the gallery forest's edges, and
elephant ear in the gullies. The eastern abyss's horsetails and cycads get thicker toward the east.

### 5.2 The south-east rim (land `southeast`): the incense country
Its neighbours: the Bowl to the south-east (the sedesert's Socotran flora in its dense-air forms, and Mantis's pocket of
monsoon forest), the e highlands' **wet face** to the east (cloud forest at its foot, where everything grows toward the
giant), Godstep to the south (titanium basalt, red laterite, the red guyed stalk), and hyperjungle S to the north.
*Proposed:* this is where the Socotran lineage meets the rains. The Bowl's dwarfs grow into trees here, and Talia gets
rich on their resins.

| Key | Name | Kin of / shared with | Earth model | What it is | Harvest |
|---|---|---|---|---|---|
| `raindragon` | **Rain dragon** | `sedesert.dragon` | the wet-country *Dracaena* (*D. steudneri*; *D. draco* in moist sites) | a 25 to 40 m dragon tree branched many times into a candelabra of tufted crowns. Taller and greener than the Bowl's, and its crown is not a single umbrella | **dragon's blood** (a resin: red dye and varnish) |
| `rainrose` | **Rain rose** | `sedesert.rose` | *Adenium obesum*, which grows tall in wetter East Africa | a swollen-trunked tree 8 to 15 m tall on the kopjes, pink in flower at the end of the dry season | **arrow poison** (the sap: a reagent) |
| `rainbottle` | **Rain bottle** | `sedesert.bottle` × `hyperjungle.baobab` | baobabs (*Adansonia*) between the Socotran cucumber tree and the gate baobab | a 30 to 60 m bottle tree: the gate baobab's bulk, with the Bowl's bottle-tree bark and flowers. The rim's middle lineage | fruit pulp; bark fibre |
| `incense` | **Incense tree** | Socotran (Socotra's own *Boswellia*), not in the Bowl's kit | frankincense (*Boswellia*) | a crooked 6 to 15 m tree with papery, peeling bark, on the dry rocky slopes | **frankincense**: Talia's caravan trade |
| `cloudavocado` | **Cloud avocado** | the e highlands' wet face (station 2's broadleaves, not built yet) | the laurel forest (*Ocotea*, *Persea*) | a 40 to 60 m evergreen laurel heavy with moss. Its epiphytes grow thickest **on the side facing the giant** (the e highlands' rule) | **the fruit** (an avocado); a bay-like spice leaf |
| `leanfern` | **Leaning tree fern** | `hyperjungle.treefern` × the wet face's tree ferns | *Cyathea* | a 10 to 20 m tree fern in the Cfa ravines, its crown tipped toward the giant | the fibrous trunk (orchid posts, filters) |
| `guyedstalk` | **Red guyed stalk** | **shared with Godstep** (defined once, in Godstep: `biomes/godstep/PLAN.md` section 3) | the painting (`refs/01`) | tall thin stems held up by guy-roots, under red cup-crowns, on the wet floors of the laterite gullies | red fibre |
| `rustmiombo` | **Rust miombo** | **shared with Godstep** (defined here; Godstep's redlands station reads it) | *Brachystegia spiciformis*, whose new leaves flush red and copper | a 20 to 30 m woodland tree on laterite. At the start of the rains the whole woodland flushes copper-red for a few weeks, then turns green | timber, honey, edible caterpillars (the mopane-worm kind, proposed) |

**How the zones run from the Bowl's side to the wet face:**
1. Dry rocky slopes near the Bowl: incense, the rain rose on the kopjes, the Bowl's cardon and candelabra (by reach).
2. The savannah: red oat grass, rain bottles, rain dragons, umbrella thorn.
3. The laterite country: rust miombo and its breakaways, the red guyed stalk in the gullies. Godstep's black sand reaches
   in at the southern edge.
4. The Cfa foot of the wet face: cloud avocado, leaning tree ferns, and the hyperjungle's gallery forest in the valleys.

Near Pylon at the western end, the drylands' frill-tree and prism mallee come in by reach (section 5.3).

### 5.3 The southern crater-drylands patch (`crater-drylands` station `south`): the swap
A three-way exchange of species. This is mostly done with the reach mechanism, plus one hybrid.

| Comes in | From | Where in the patch |
|---|---|---|
| prism mallee, frill-tree, sword spire, pyre pillar, ghost gum | the patch's own kit (crater drylands) | everywhere; the base |
| rust miombo, rain rose, incense | the se rim (reach ~60 km) | the wetter northern and eastern edges; the rose on the kopjes |
| red guyed stalk; the lava pioneers; titanium-basalt ground and black sand | Godstep (reach ~40 km) | the southern edge's gullies and old flows |

| Going out | To | |
|---|---|---|
| prism mallee, frill-tree | the se rim's western end (Pylon) | reach ~50 km |
| sword spire | Godstep's redlands station | reach ~30 km |

**One hybrid**, *proposed*: **Black mallee** (`blackmallee`), the prism mallee grown on titanium basalt. Its iridescence
runs violet-black to bronze instead of green to orange-red, and it resprouts out of black cinder. It is found only on the
patch's old flows. The fire mosaic of the crater-drylands kit runs over the whole patch.

## 6. The lake, in hyperjungle S (the old station 3, kept)

Várzea and igapó forest, standing in water for half the year, as `PLAN-STATIONS.md` planned. Its new species:

| Key | Name | Earth model | What it is | Harvest |
|---|---|---|---|---|
| `stiltkapok` | **Stilt kapok** (a habit of the kit's `kapok`) | várzea trees on stilt roots | the crimson kapok raised on stilt roots, with a high-water line on the bole | |
| `swamppalm` | **Moriche palm** | *Mauritia flexuosa* (the aguajal palm swamp) | a 35 to 50 m palm with a costapalmate crown, in pure stands | the fruit (scaly, oily: a staple of the lake people) |
| `skylily` | **Sky lily** | *Victoria amazonica* | rimmed pads 6 to 9 m across, red underneath, with white flowers that turn pink | the seeds (a grain) |
| `floatgrass` | **Floating meadow** | *Paspalum* and *Echinochloa* rafts | grass mats that drift on the open water and lodge against the forest | fodder |

High water and low water follow the world clock (core gap H7).

## 7. Counts

| Land | New species | Kin or shared | Read in place |
|---|---|---|---|
| savage | 8 | 6 at savage scale | the kit's understorey |
| north (jungle) | 8 + 1 state | 1 (`howlbamboo`) | the kit's six, thinned |
| savannah base | 2 (+ blind grass) | | 4 (umbrella thorn, gallery forest, kapok, baobab) |
| east rim | 0 | 6 (+1 optional) | the abyss's horsetails and cycads, the savage species at the west edge |
| south-east rim | 2 (incense, rust miombo) | 6 | the Bowl's cardon and candelabra, the drylands' frill and mallee |
| drylands south | 1 hybrid | | 9 by reach |
| the lake | 3 | 1 habit | |

**28 new species, 13 cousins or shared species, and the rest read in place.**

## 8. Crops (`kits/crops`)

- `hyperjungle` gains zones `savage` (wet) and `north` (warmth 5, arid 2). New records: elephant-ear taro (staple), armour
  palm heart, comb-tree honey (sweetener), cathedral figs (fruit), howl-bamboo shoots, bloodwood (dye and reagent), ghost
  pipe (medicine), moriche fruit, sky-lily seed (grain).
- the savannah rims (`biomes/abyssal-savannah`'s stations; first built as `savannarim`) are new, with zones `north`, `east` and `southeast`. Records: monsoon-cycad sago (staple, leached),
  frankincense (resin), dragon's blood (dye), rain-rose sap (reagent), cloud avocado (fruit), rust-miombo honey and
  caterpillars, red-stalk fibre (Godstep's), scouring rush.
- `kits/resources`: none new.

## 9. Stations

| # | Kit | Page | Site (found at J0) | What it shows |
|---|---|---|---|---|
| 1 | hyperjungle | `dist/hyperjungle.html` (as built) | hyperjungle S | unchanged |
| 2 | hyperjungle | `-savage` | near Mav's Refuge (752,477) | the 480 m forest, a bai with a herd, a cathedral fig, sky pitchers in the boughs |
| 3 | hyperjungle | `-north` | near the Hexahedron (555,338), on the howl bamboo's way out of the Cut | howl-bamboo groves, watchers, bone giants at the edge |
| 4 | hyperjungle | `-lake` | the lake's shore | várzea, moriche, sky lilies |
| 1 | abyssal-savannah | `-serim` | se rim, between Talia and the laterite | the incense country and the copper flush |
| 2 | abyssal-savannah | `-erim` | e rim near Fridon (755,601) | fire scale-trees, the post-burn cycad flush, ember spikes |
| 3 | abyssal-savannah | `-north` | N's XV savannah | the blind grass under bone giants, bloodwood |
| + | crater-drylands | `-south` | the patch | black mallee on the old flows; the three-way mix |

## 10. Textures

**Already in the library, to try first** (judge each one in the demo kit before wiring it): `bark.strangler` (cathedral
fig), `bark.lepido` and `bark.cork` (fire scale-tree), `bark.dragon` (rain dragon), `bark.baobab` (rain bottle),
`bark.paperbark` (incense), `card.carnivore.monkeycup` and `organic.pitcher.giant` (sky pitcher), `card.heartleaf`
(elephant ear?), `card.beard` and `card.moss.hanging` (widow's hair), `card.acacia`, `card.grass.dry`,
`card.grass.panic`, `card.palm`, `card.treefern`, `card.clubmoss`, `card.charred`, `ground.burn`, `ground.grass.ember`,
`ground.redsoil`, `ground.sand.black`, `ground.brown_mud_02` (wallows), `ground.lilypond`, `organic.flesh.cells` (devil's
fingers). The eastabyss, ehighlands and sedesert `tex/` packs are reused through each cousin's parent material.

**To generate** (paste-ready prompts go into `core/materials/PROMPTS-NEEDED.md` once the owner approves the species):

| Set | For | Brief |
|---|---|---|
| `card.grass.elephant` | blind grass | tall cane-grass culms with flat leaves and buff plumes, alpha cut-out |
| `card.grass.themeda` | red oat grass | tussock with drooping red-bronze awned spikelets, in green and red variants |
| `card.bamboo.leaf` | howl bamboo (and the Cut's hyperbamboo, which needs it too) | sprays of lanceolate bamboo leaves on fine twigs |
| `bark.bamboo.bored` | howl bamboo | an olive-grey culm with rows of fist-sized borer holes and pale streaks running down |
| `bark.watcher` | watcher | pale grey-white bark with black almond-shaped branch scars |
| `card.flower.hand` | hand-flower tree | red five-clawed hand flowers under felted leaves (cut out on magenta) |
| `card.pod.skull` | skull-pod | dry snapdragon seed pods that look like little skulls |
| `bark.bloodwood` | bloodwood | dark bark with blood-red sap runs, wet and glossy |
| `card.ghostpipe` | ghost pipe | waxy white bent stems with nodding heads, on black |
| `bark.tualang` + `organic.comb.bee` | comb tree | smooth pale pink-grey bark; a hanging wild honeycomb surface |
| `bark.palm.spined` | armour palm | a ringed palm trunk bristling with black spines |
| `card.arum.carrion` | carrion arum | a maroon frilled spathe round a pale spadix |
| `card.lily.victoria` | sky lily | a rimmed giant pad, top and red-ribbed underside |
| `card.leaf.miombo` | rust miombo | pinnate leaf sprays in copper-red flush, plus a green variant |
| `ground.ironstone` | laterite pavements | pisolitic ironstone gravel on red crust (top-down tile) |
| `earth.termite` | termite cathedrals | fluted red-ochre mound clay with tunnels |
| `rock.laterite` | breakaways | **already owed by Godstep** (`PROMPTS-NEEDED.md` sections 15 and 18) |
| `card.flower.rainrose` | rain rose | pink *Adenium* flowers, only if the sedesert's rose card reads too small |

That is 17 new sets, and one shared with Godstep. Per the material-library rule, the owner sources or generates each one.
Nothing is papered over with a procedural stand-in without saying so.

## 11. Core modules and amendments needed

| # | What | Where | Why | Notes |
|---|---|---|---|---|
| **H1** | **Reach (long diffusion)**: a species' `reach: {from, km, falloff}` turned into a weight from the distance to its home polygon. `KMASK.distance(mask)` (a distance transform on the region raster: plain arithmetic, the same in a node test and in Godot), and `extract_region.py` writes each biome's distance field (`dist.png`) so the open world gets the same answer | `core/mask` + `core/biome/40-core-place.js` | every rim, the drylands swap, howl bamboo out of the Cut | today the only border is the few-hundred-metre ecotone |
| **H2** | **Kin species**: `BIO.kin('eastabyss.sigillaria', delta)` builds a species from another kit's record and builder, with changes to habit, size, colour and phenology, and the tag `kin`. The source kits must expose each builder by key without building the whole kit | `core/biome/32-core-variants.js`, `20-core-kit.js` | 13 cousins | the source kits' pages must not change: the step only adds a lookup |
| **H3** | **Fire into core**: lift `CRATERDRY.FIRE` (the spread model, `ageAt`, `frontAt`) into `core/biome/38-core-fire.js` (`KFIRE`) | `core/biome` | every savannah's burn mosaic; the cycad flush and ember spikes key on burn age | crater-drylands moves onto it in the final biome rebuild, as C2 does (its page would change) |
| **H4** | **Lean toward the giant in core**: `BIO.GIANT` (azimuth 66°, now `EHIGH.GIANT`) and `BIO.leanTo(dir, k)` applied at placement | `core/biome` | the e rim's and se rim's cousins, the leaning ferns, the cloud avocado's one-sided epiphytes | e highlands moves onto it in the final rebuild |
| **H5** | **Bamboo parts in core**: culm (nodes, sheaths, holes as a parameter), branch fans, groves with gregarious flowering | `core/biome/34-core-bamboo.js` (`BIO.bamboo`) | howl bamboo, the Cut's hyperbamboo, nwlowlands' sky bamboo (later) | the Cut is not built yet: write the parts once, before either kit needs them |
| **H6** | **480 m trees**: the far impostors, the LOD radii, the shadow camera's reach, and the probe budget for a crown 480 m high | kit and `core/lod` (check first) | the savage land | the kit's ring was sized for 305 m |
| **H7** | **Seasons on the world clock**: a `season` value from `core/clock`, used for dry-season leaf drop and grass colour (an instance-colour blend in the foliage shader beside the wind uniforms), the copper flush, the bolster's colour, and the lake's water level (`core/water`: a level from the clock) | `core/clock`, `core/biome/30-core-foliage.js`, `core/water` | monsoon savannah, rust miombo, várzea | core written 2026-10-26 (branch `claude/core-seasons-b0917b`: `KCLOCK.season` + `kseason.gd`, leafMat `season`, a still's `seasonal`; the copper flush and the Godot leaf twin open); no kit has seasons yet |
| **H8** | **Fauna by land, with a size scale**: a biome kit places `kits/fauna` creatures from the biome tags (`BIOME-FAUNA-PLAN.md`), with a `scale` per land (savage 1.2 to 1.4) | `kits/fauna` runtime | the Riders' wild beasts | check what the open world already does first |
| **H9** | *Later*: **a sound record** (`core/tags` kind `sound`: an aeolian emitter with a wind threshold) for Godot's audio | `core/tags` | howl bamboo | no audio in core today; the page can do without it |
| **H10** | **Termite cathedrals**: a `KSTACKS` kind `mound` (fluted clay spires on a skirt) | `core/terrain` | every savannah | sits beside the outlands' C4 kinds |

**Already in core, to be reused:** `KTRAPS` (sky pitcher, carrion arum, snare liana), `BIO.fung` (the outlands' C2:
devil's fingers, ghost pipe, brackets), `KFIELD` cover classes and the outlands' C4 `pavement` (ironstone),
`core/terrain` strata (`tibasalt` at the drylands' southern edge, from Godthrone), `core/water` (rivers, dambos,
the lake), `core/atmos` (`cloudDeck` at the wet face's foot), `core/rand`, `core/mask`, `core/tags`, `core/space`.

## 12. Core adoption (written first, as the working rules ask)

The savannah rims (built as `biomes/savannarim`, now `biomes/abyssal-savannah`'s stations) start from the nearest finished kit, crater-drylands: the fire, the open ground, the sky. It takes
the biome core (`CORE_BIOME`, with H1-H5, H7 and H10 when they land), `core/host`, `core/rand` (every placement seeded by
hash of world, cell, index and salt), `core/mask` (no `getImageData`), `core/tags` (registered before drawn),
`core/space`, `core/terrain`, `core/water`, `core/atmos`, and the shared sky. Before it is called done:
`tools/check_core_use.py` passes. The hyperjungle kit's new lands are added on the same modules.

## 13. Order of work

| Step | What | Done when |
|---|---|---|
| **J0** | The owner approves this plan (the open questions below). In `extract_region.py` `KITS`, map `hyperjungle S` / `savage hyperjungle` / `hyperjungle N` to `hyperjungle` (with a land), and the rims to `savannarim` (answer 1 below: to `abyssal-savannah`, as `extract_region.py` already has them); drop the old `hyperjungle` key. Choose the station sites. Write the texture prompts | approved; prompts listed |
| **J1** | Core: H1 (reach) and H2 (kin), each with a node test. `port_baseline.py` reads `same` for every build that did not ask to change | tests pass |
| **J2** | The savage land: the scale habit, H6, the 8 species, bais and trails, H8 for the herds. Station 2 | `verify.py --assert` |
| **J3** | H5 (bamboo). The north land's jungle: howl bamboo, bone giants, the 7 others. Station 3 | verified |
| **J4** | the savannah rims (`biomes/abyssal-savannah` stations): H3 (fire), H10 (mounds), H7 (seasons), the base, and the north savannah. Station 3 of the rims, `north` | verified, `check_core_use.py` |
| **J5** | The east rim (H4 lands here). Station 2, `erim` | verified |
| **J6** | The south-east rim, with the rust miombo and red stalk shared with Godstep (in step with Godstep's D3). Station 1, `serim` | verified |
| **J7** | The drylands' `south` station: the reaches and the black mallee | verified; the drylands' station 1 unchanged |
| **J8** | The lake station (H7's water level) | verified |
| **J9** | `PORT.md`, the index tools, `biomes/WORLD.md` rows, `LORE.md` §8, the gallery (the rims are new stations of abyssal-savannah), and the little demo's refresh where it covers these polygons | baseline rewritten on purpose |

## 14. Open questions for the owner

**The owner's answers (2026-11-08):**
1. **No new kit: the rims go to the existing `biomes/abyssal-savannah`** (as `extract_region.py` already maps `e savannah rim`
   and `se savannah rim`). Wherever this plan says `savannarim`, read abyssal-savannah: the savannah base, the north savannah,
   the east rim and the south-east rim become its stations.
2. **Yes**: volcanic ash on beast-dunged soil is reason enough ("rule of cool, mostly").
3. **Yes, as a rumour that is a complete red herring**: the Screamers' speech did not begin with the groves.
4. **Yes**: the glass wand and Fridon's wormwick trade go in.
5. **Talia is in the east rim's climate** (east-abyss flora): the owner will redraw `e savannah rim` on the map so it runs a
   bit further south, taking Talia (px 801,609; inside `se savannah rim` on map 5.1). Incense and dragon's blood stay the
   **SE** rim's (the Bowl's lineage), and Talia's trade is not in them: no incense or dragon's-blood trade for Talia in LORE.
   The east rim's station sites and Talia's ground (Pylon and Talia read this ground) follow the redrawn polygon.
6. **Yes**: the rust miombo is defined here, Godstep's redlands reads it; the red guyed stalk stays Godstep's.
7. **Yes**: the black mallee is the drylands patch's one hybrid.

1. **One new savannah kit (`savannarim`)**, or the savannahs kept as stations of the hyperjungle kit?
   *Answered:* the owner queued "the e savannah rim (`biomes/savannarim`, a new kit on the savannah base of section 4)"
   (HANDOFF-REBUILD.md, 2026-10-27), and the core sessions built its gaps for it: one kit. **Superseded by the owner's answer 1 above** (2026-11-08): no new kit; built as `savannarim`, then folded into `biomes/abyssal-savannah` as its stations `serim`, `erim` and `north`.
2. **Why the savage jungle is savage**: is volcanic ash on beast-dunged soil acceptable as the reason, with its
   carnivores a guild of canopy and shade, not Korona's poor-soil bog?
   **Taken as proposed, owner to confirm** (J2, 2026-11-08): the ash-dark floor, the herds' bais, the three traps under 1% of the
   plants and in the shade and the boughs (`stations/savage`); LORE.md section 8 carries it as a proposal.
3. **Screamer wood**: the theme of a forest that looks and sounds like people (howling bamboo, watchers, hand flowers,
   skull-pods, bone giants). And may the Screamers' speech be rumoured to have begun with the groves?
   **Taken as proposed, owner to confirm** (J3, 2026-11-08): built as station `north`; the rumour is in LORE.md section 6.7 as a
   proposal, and the hand-flowers' name "the elders" in the species' harvest note.
4. **The east rim's story**: the abyss's lineages as fire-hardened relics, and the highlands' pull toward the giant fading
   westward. Should the glass wand and Fridon's wormwick trade go in?
   **Taken as proposed, owner to confirm** (J5, 2026-11-08): built as savannarim's station `east` (now abyssal-savannah's `erim`), the glass wand in (on the
   ironstone pavements); Fridon's wormwick trade is in LORE.md section 8 as a proposal.
5. **The south-east rim's story**: is Talia's trade in incense and dragon's blood acceptable (an addition to `LORE.md`
   §6.2)?
   **Taken as proposed, owner to confirm** (J6, 2026-11-08): built as savannarim's station 1 (now abyssal-savannah's `serim`); LORE.md section 6.2 carries the trade as a
   proposal.
6. **Godstep's shared species**: the rust miombo to be defined here and read by Godstep's redlands station; the red guyed
   stalk to stay Godstep's.
   **Taken as proposed, owner to confirm** (J6, 2026-11-08): `SAVRIM.builders.rustmiombo` (`BIO.kitBuilder('savannarim', 'rustmiombo')`);
   the red guyed stalk is a reference row only until Godstep's kit builds it.
7. **The black mallee** as the drylands patch's one hybrid.
