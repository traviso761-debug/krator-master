# outlands: the plan (draft, 2026-10-26)

The **Outlands**: the enclosed, dry basin east of the main crater, reached only through the corner of Korona. The most
isolated ground on Krator, and its **Socotra**: a flora cut off for millions of years, so most of what stands there
grows nowhere else. Home of the **Coyote Men**: stone- and bronze-age tribes in the basin, and the Kingdom of the Tiers
(the Coyote Kingdom) on its threshold. Its exports are **emeralds, turquoise and ostrich feathers**.

Owner's brief (2026-10-26): N and S Outlands, "maybe a few substations"; a **Tiers** biome (first a new Korona substation; **its own biome `tiers`**, 2026-10-26: see section 7)
that takes in the new Outlands species and the diffusion of `sedesert` and `ebadlands` species.

**Status: plan, awaiting the owner.** Nothing built, no polygon drawn, nothing surveyed (section 1). Everything marked
*proposed* is this draft's and waits on the owner.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/outlands/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations, as Korona's and the Throne's: `dist/outlands.html` (station 1) and `-<name>` per section 6 |
| The Tiers | **its own biome, `biomes/tiers/`** (the owner, 2026-10-26: "a biome that's just 'tiers'"; section 7), reading this kit's species and `sedesert`'s and `ebadlands`' in place; Korona keeps its six stations |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain`, `core/water`, `core/atmos`, the shared sky |
| Read in place | `sedesert` (scrub, thorn, dune and wadi species, the coyote walkers) and `ebadlands` (banded mounds, pinyon and chaparral edge, alien-flora sheet) at the margins; nothing copied |
| Its own flora | section 3: the endemic flora, the large part of the kit |
| Object | `OUTL` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`), on the `BIOME-API.md` contract |
| Crops | an `outlands` biome entry in `kits/crops` and a few endemic crops (section 4) |
| Out of scope | the Coyote Men's buildings, dress and the Kingdom's towns (a **Coyote culture kit**, section 8); the animals' models (`kits/fauna`, section 5); the gem mines (`kits/resources`, section 5) |

It is a new biome, so it goes in the gallery when it first reaches `main` (`CLAUDE.md`, "Publishing").

## 1. The ground (to survey)

**Not yet surveyed.** The scale model's rasters live inside the artifact page, not in the repo, so this draft has
**no polygon and no numbers**. The existing polygons that bear on it (`openworld/*/source/regions.json`, px): Korona / NE
biome (595-1071 by 9-352), The Tiers (875-1009 by 118-287, wholly inside Korona), e badlands (874-1129 by 180-863),
east rim (985-1085 by 290-583). The map reaches at least px 1164. The Outlands must lie beyond those, east of the crater.

**On the scale model (the owner, 2026-10-26): `Outlands N` and `Outlands S` are two `biome` regions, and so is `The Tiers`.**
The Tiers exists only as a *geographic* polygon today (px 875-1009 by 118-287, inside Korona's); it gets a **biome**
region of its own, named `tiers` (section 7), overlapping Korona's polygon on the same ground (the way `necanyons` overlies the hyperjungle's). Step P0 (section 9) is a survey with
`tools/scale-model` once the owner has drawn `Outlands N` and `Outlands S` and the Tiers' biome region. The three must
not leave a gap or overlap Korona's, `e badlands`' or each other's beyond the deliberate ecotone strip; the survey reports
each overlap, as `korona/NOTES.md` does. It should settle:

- **Settled (the owner, 2026-10-26): the basin lies outside the Outer Wall, low, in dense air** (working figure 1.2-1.6
  atm, from Farside's side; the survey gives the real one), walled in by the Outer Wall and reached only over a pass in
  Korona's corner. The thin air above the wall is the **barrier**: a pressure-adapted lowland life cannot cross it, which
  is why the flora has been alone for millions of years. The survey **checks** it: the floor should sit below about
  2.5 km, with the rim and the pass above. If the floor is instead near the Tiers' 4 km, tell the owner before going on.
  `CROPS.ATM` and the fauna sizes follow: dense air allows bigger animals than the Tiers' Earth-sized ones.
- **The pass.** The "corner of Korona": where it is, its height, its width, whether it holds a river, and whether it is
  one gate or a long defile. It is the only road in; it is also the Coyote Kingdom's reason to exist (a toll gate).
- **The basin's own rain.** A closed basin behind a wall is in the rain shadow, hence dry: the survey reads rain, Köppen
  class and the floor height, whether a salt lake or pan sits at the lowest point, and the rivers (`DATA.basins`: where
  the Tiers stream and any others end).
- **The N/S split**: where the owner draws it, and whether it is a ridge, a river or the two climates (the survey should
  propose the line from the relief and rain, as `korona/NOTES.md` did for its bands).

- **The arcology (the owner, 2026-10-26): one, Arcoindian II, ruined, built into a cliffside.** `kits/ancients/targets/arcoindian2`
  (`89c-arcoindian2.js` and its lens and stalk fragments; gallery "Arcoindian II": "the half-cave: a city in a deep shelf on a
  canyon wall"; `LORE.md` §3 lists "the cliff Arcoindians"). Its **position is still to be decided**; the survey (P0)
  offers candidate **cliffs or canyon walls** (the type needs a tall, steep, deep-cut wall: a gem-range canyon or the
  basin's edge under the wall, at least as tall as the building, and near the god's road if one reaches it), the owner
  picks, and it goes in `settlements.json` like every other arcology. It is a node in the Ancient road draft
  (`tools/scale-model/ancient_roads.py`), so it may be what puts the god's road in the basin. The building is the Ancients'
  kit's; this kit gives it a site, a cliff-and-ground mask (`core/terrain` carve for the shelf) and its surroundings.
  - **Ruined.** The ruin is not the kit's clean ruin by default: the Outlands' native flora grows over it (rock-eater
    lace and green fans on the stone, pleat columns and fog-combers on the terraces, glow bells in the dark of the
    shelf, brood pads where the hexapods nest in the rooms).
  - **Shunned (the owner).** The Coyote Men **avoid it completely and consider it cursed**: no road, camp, herd, hunting
    or tapping within sight of it; nothing of theirs on it (no cairns, no offerings: *proposed*: they *do* leave a
    ring of turned-away stones at the edge of its range, a boundary and not a shrine). The ostriches are not driven there.
    So it is the one place in the basin **without a human trace**, which the survey and the placement honour as a
    **keep-out zone** registered in `core/tags` (a `taboo` area; no tribe's records draw inside it). The native
    hexapods and the flora have it to themselves; it is where the biome's most untouched wildlife is (*proposed*).
    **Why cursed (the owner, 2026-10-26): the Coyote Men believe the trickster lives there**, and that "very unfortunate
    things" befall anyone who wanders there too long. It is **fear of a prankster's house, not worship**: the god's
    road **ends at the cliff** (settled, 2026-10-26), so the Gate's shrine road and the
    cursed city are the two ends of one line, and a god of cunning and bargains does not lose its tricks when it is home.
    The misfortunes are told as **pranks gone wrong**: lost paths, doubled tracks, stones that move, herds that scatter,
    voices from the shelf, a stolen boot, a fever. (*Proposed*: the real causes may be as the owner likes: the ruin's
    own dangers, the native hexapods, the fog; the Coyote Men simply credit the god.)
  - **The manhood rite touches it** (settled, 2026-10-26): runner birds are drawn to the road's end, so the surest place to find
    one is the one place no sane Coyote goes. A boy who catches one there is the stuff of legend (or a cautionary tale).
  - **Gameplay and tooling hook (settled, 2026-10-26: a real hazard).** The one place a stranger can walk into without a Coyote's leave. The
    trickster's "misfortune" can be a real system (a luck or prank hazard that grows with time spent within the keep-out
    ring: wrong turns, scattered gear, a lost item), which suits the god; `core/tags`' hazard key (proposed in
    `core/tags/PROPOSAL.md`) is where it would live. Whatever is inside is the owner's.

Expected bands, to be replaced by the survey (*proposed*): a **fog/montane rim** on the windward wall (the Socotra
plateau: mist-fed endemic woodland), **dry plains** (ostrich country), **foothill gem ranges** (emerald, turquoise), a
**wadi-and-spring farmland** (the sedentary tribe) and a **salt/gravel floor**.

## 2. Air, scale and the island rule

- **The mix (the owner, 2026-10-26).** Flora **90% native**, and not closely resembling any Earth plant. Fauna **about 66%
  native, 33% Earth-like**; the native animals are mostly **hexapods**, and **ostriches roam the region**. Isolation is
  the premise: the pressure barrier kept Earth's lineages out, so the 10% of the flora and the third of the fauna that
  look like Earth's are the exceptions section 3 and 5 name, and nothing else is.
- **Socotra is the model for the biogeography, not for the look.** The island rule holds (endemism, odd body plans,
  water stored in the plant, forms that comb fog, few big grazers so little armour), but no plant copies Socotra's
  (no umbrella crowns on a dragon's-blood model, no bottle-and-cucumber trunks, no Welwitschia). The look is the
  **native fungoid lineage** of `biomes/swhighlands/PLAN.md` section 3 and `biomes/swbay` (cap-trees, bracket trees,
  coral and tube forms): the big forms carry a **photosynthetic partner** in caps, pads and fringes, as a lichen does, so
  they are green, teal, violet and rust on top and fleshy underneath; true decomposers keep to dead wood, scars and
  carrion. Native life here owes nothing to Earth's plants.
- **Colour carries it**, and the hills supply some: copper in the gem ranges stains the rock-eating forms blue-green and
  turquoise; the fog rim runs violet and teal; the floor is rust, pale and salt-white. Brighter than `sedesert`'s red-and-tan.
- **Hexapods and plants evolved together.** The dominant hexapods graze, tend, nest in and pollinate the native flora
  (section 3's nursery plants); the Earth-like animals (ostriches, a few others) are late and eat what the hexapods leave.
- Scale rule: dense air allows size, but **no giants**: the tall fog-combers reach 10-16 m, the tribal farms and the
  Kingdom's terraces set the human scale.

## 3. The flora: 90% native, fungoid, not Earth's (names are placeholders)

About **30 species: 27 native and 3 Earth-like**. Every native form is a **fungoid holobiont** in the manner of
`biomes/swhighlands` (a fleshy body with a photosynthetic partner in its caps, fringes and pads), shaped by two
pressures: **fog and dryness** (combs, bladders, sealed pleats, drip channels into root basins) and **hexapods** (nursery
pods, galls, bait). None copies a plant of Earth; where a silhouette comes near one (a column, a rosette), the
construction is different (no leaves, no flowers, spores and pods). Each is a record in the `SPECIES` shape of
`sedesert`/`ebadlands` (`BIOME-API.md`) with `harvest`, `gather` and `tags`. Reference plates: the owner's, to be added
as `refs/NN`, the swhighlands fungoid sheet being the first (`biomes/swhighlands/refs`).

| Form | Native species (placeholder) | What it is | Zone |
|---|---|---|---|
| **Fog-combers** (tall, 10-16 m) | **veil cap**; **comb mast**; **lantern stalk** | a pillar under a flat green disc hung with a fringe of threads that catches fog and drips to a root basin; an unbranched mast with paired ladder combs; a pale stalk topped by a glowing pod cluster at night | fog rim, upper wadis |
| **Bladder forms** (water stores) | **pleat column**; **drum cluster**; **sac brush** | a ribbed sealed column that swells after fog and shrinks in drought; fat drums budding off a root mat; a low bristle of sealed sacs | cliffs, gem ranges, plains edge |
| **Nursery plants** (the hexapods' crops) | **pod tower**; **brood pad**; **gall stack** | a spongy tower with egg-chambers the hexapods tend; a flat orange pad where a hexapod lays and the young feed; stacked galls grown over a buried nest | S Outlands' dry plateau, plains |
| **Rock-eaters** (copper-stained) | **lace crust**; **turquoise shelf**; **green fan** | sheets of root-lace that feed on weathered copper rock and come out blue-green, bracket-like shelves and fans, first onto new rock; the gem ranges' signature | gem hills, mine tailings |
| **Gravel and salt** | **pebble mat**; **crust rosette**; **salt fan**; **needle fur** | living-pebble lichen plates; a flat spiral crust that opens in fog; a pale fan standing in the brine's edge; a fine grey fur of tubes on the pan | plains, pan, S plateau |
| **Spring and wadi** | **ribbon mat**; **bell pool**; **curtain weed**; **glow bell** | green ribbons in the spring runoff; a hanging bell-shaped bladder on the pool's edge; a trailing veil over wet rock; a night-lit bell of tubes | springs, farmland, wadis |
| **Cushion and scrub** | **grey cushion**; **ember scrub**; **cap-shrub**; **stilt mound** | a dense grey dome of fused stems; a red-brown shrub that lights in the heat; a small cap on a stalk; a mound on rock-grip stilts | everywhere dry |
| **The decay layer** | **log crust**; **bone bloom**; **glow tubes** | the swhighlands pattern again for dead wood, carrion and nests | scars, kills, nests |
| *Earth-like (3)* | **the sedentary tribe's field weeds**, **a spring palm**, **a withy willow** | what came with the Coyote Men and their crops, and is now in the farmland and the Kingdom's gardens only | the farmland, the Gate |

- **Where they stand** follows fog, not rain: the **windward wall catches the fog**, so the fog rim holds the tall
  fog-combers; the floor is gravel and salt with the crusts and mats; the farmland is wadi green with the Earth-like three.
- The **Tiers strip** (section 7) is where the Outlands flora meets Earth-like `sedesert` and `ebadlands` scrub; the
  basin proper keeps the 90/10 split. Any Earth-like plant added in the basin is an exception the owner approves.
- Every plant is registered in `core/tags` before it is drawn; placement draws from `core/rand` (cell-hash seeded) and
  reads `core/mask`, never canvas pixels (`CLAUDE.md`, "Write code that is the same on every machine").
- **Harvests** (for `core/hamlet` and the Coyote kit): **fibre** (fog-comber threads, rope-like), **resin and gum** (the
  Izani traders' want: a fog-comber's drip gum, pod-tower wax), **dyes** (the rock-eaters' blue-greens and the ember scrub's
  red: *proposed*), **water** (a pleat column tapped; the tribes' wells), **fodder** (cushions, pads), **food** (a tapped
  nursery pod's grub-bread, a roasted drum: *proposed*). Tapping a plant is how the tribes live where no spring runs.
- The soft, unarmoured look is gone with the Earth thorn: the signature is **colour and construction**, not a lack of
  thorns.

## 4. Crops

An `outlands` entry in `kits/crops` (`CROPS.forBiome('outlands')`): the sedentary tribe's **bronze-age package** and the
Kingdom's. Stay with the existing 118 crops where they fit (the Kingdom: **millet, sorghum, barley, chickpea, lentil,
date, fig, pomegranate, olive, cotton, flax** on terraces), and add a few **native** ones as new records, for the tribes
that tap and gather rather than sow: a **drum cluster** (a roasted water-store), a **pod tower** grub-bread, a
**fog-comber gum** (incense, valued by caravans) and a **grey cushion** fodder. Irrigation rule: a field takes water from a wadi, a
spring or a fog harvest; the Tiers' fields are channel-fed terraces, a Qanat-and-terrace system (Yemen, Ifugao).

## 5. Fauna, peoples and resources

- **Fauna: about 66% native, 33% Earth-like** (the owner, 2026-10-26). **Native hexapods dominate**, built on the
  kit's `faWdHex` frame (`kits/fauna/BIOME-FAUNA-PLAN.md`, the "ambiguous anatomy" rule: hide, scale and coat, vertebrate
  eyes, padded feet, **not insects**; the existing dune runner, plains hopper, badland digger, scytheback and clubback are
  the nearest kin). A draft of ~12 species: **native (8)**: a plains **grazing hexapod** in herds, a **nursery-tender**
  (the pod towers' keeper), a **fog-drinker** at the combs, a **rock-grazer** on the gem hills, a **pan-digger**, a small
  **burrowing hexapod**, a hunter (**stalker**) and a **carrion hexapod**; plus fog-moths and glow-flies (a native insect
  layer is fine). **Earth-like (5)**: the **ostrich**, the **runner bird** (below), the goat (all three brought by the Coyote Men's ancestors), a gazelle-like grazer and the vulture.
  Tune the figures when the species list is final.
- **Ostriches roam the region** (the owner): **farm animals**, kept in flocks by the tribes for meat, eggs, hide and
  feathers, **ridden** by scouts (the Coyote Men have no horse), and treated with a certain respect: **every part is
  used** (meat, eggs and shell as vessels, sinew, hide, bone tools, fat, the plain feathers as fans, fletching and trade
  goods). `kits/fauna` has **no ostrich yet** (the marsh emu in `krator-fauna-abyss.js` is the nearest model): add one
  with the livestock traits (`eggs`, `feathers`, `rideable`, `hide`) and the kit's biped gaits.
- **The runner bird** (the owner, 2026-10-26): a **faster, brightly coloured bird** the ancestors brought with the goats
  and the ostriches, **the trickster's living form**. A small, long-necked, long-legged, long-tailed sprinter, blue and
  violet with a tall head plume and a fan of wing feathers, quicker than any other animal on the plains. A new species
  in `kits/fauna` (a biped on the fast `runner` gait: the sprint is its signature, and its wing-fan opens as it turns).
  **To be a man, a Coyote must catch one successfully** (a coming-of-age rite; see below). Its feathers are **the sacred
  and most highly prized ones**, worth more than any ostrich plume. It is wild and wary, **not farmed** (nobody has kept
  one), and it keeps to the roads.
- **How they came (the owner, 2026-10-26): the Coyote Men's ancestors brought the goats, the ostriches and the runner
  bird** over the pass. Each is as old as the people and *only* as old as the people: the barrier stopped Earth's
  animals and plants, but not what was carried. That is why the Earth-like third of the fauna is small and camp-following,
  and why the wild gazelle and vulture are the exceptions to explain in P1.
- **The trickster (the owner, 2026-10-26).** The Coyote Men's trickster deity takes the form of **the runner bird, a god
  who runs the ancient roads**: cunning, errands, borders and bargains. Consequences for the kits:
  - **Easter egg (the owner).** The god's look is a nod to the Road Runner of the old cartoons: a tall, lean, blue
    bird with a swept head plume, a long neck, a fan of wing feathers and a knowing grin, forever out of the coyote's
    reach. Draw it as the Outlands' own bird that *reads* as that (blue and violet, plume and wing-fan, the sprint pose),
    not as a copy of the character: no cartoon outline, colours or face. The joke is the Coyote Men chasing it for ever,
    which the manhood rite makes literal. The sedesert's "Wile E. Coyote" mesas (`biomes/sedesert/NOTES.md`) are the
    same joke on the other side of the crater.
  - The **ancient roads** are the Ancients' highway network (`tools/scale-model/ancient_roads.py`, `openworld/ANCIENT-ROADS.md`,
    a draft). The god's roads are those; the survey (P0) should show whether any Ancient road runs through Korona's
    corner and the pass, and if it does, **the pass is the god's road** and the Gate (station 6) is built on it. If no road
    reaches the pass, that is a lore question for the owner, not a gap to fill silently.
  - **Manhood.** A man is one who has caught a runner bird. Boys train as sprinters and trappers; the Kingdom has a
    ritual race on the old road; the tribes' rite is a hunt. A man without one is a boy at any age (*proposed*: a
    drab runner-bird feather in the hair of a man who has caught one; a failed man wears none).
  - **Feathers.** Runner-bird feathers are **sacred**, worn by priests, kings and the caught-it men, gifted at shrines,
    and the dearest trade good (*proposed*: the Kingdom licenses and counts them). Ostrich plumes are the common export;
    runner-bird feathers rarely leave the Outlands, and when they do the Izani pay for them in gold.
  - Art and architecture (for the Coyote kit): the god's running track as a motif, wayside shrines and milestone stones
    along the road, a long-necked, grinning, plumed figure on gates and boundary stones.
  - It ties the trade to the faith: caravans are under the trickster's protection, and the toll gate is a shrine as well
    as a fort (*proposed*).
- **The Coyote Men** are **therians** (the owner, 2026-10-26), as Korona's peoples are *human and therian* (`LORE.md`
  6.18): coyote-headed, digitigrade, upright. Stone and bronze age in the basin; the **Kingdom of the Tiers** (the
  Coyote Kingdom) on the threshold, more advanced and the gatekeeper. They traded with Izani caravans but were never
  Izani subjects (their remoteness). They are not in `LORE.md` yet (the only "Tiers" there is the Eternal State's court
  and houses): the next free section of §6 holds them (section 9, step P1).
  - **Speech: they bark a dialect of the Hum.** Their throats and lips cannot shape ordinary human speech, which is the
    problem the Hum was made for (`LORE.md` 6.18: meaning rides on pitch, six tones, ten consonants). The Coyote Men's
    home speech is **barked, yipped and howled Hum**: the tones as pitch contours of a bark (high, low, rising, falling
    yips), the consonants reduced to the few their muzzles make (*proposed*: *h, k, w, y, m, n*, with *p t s l* as
    clipped snaps), the sentence end a howl. Any Hum speaker can follow it slowly; they speak it fast. Its writing is
    **contour carvings** like Korona's (groove per syllable, above or below the guide line), which suits the milestones
    and boundary stones along the god's road. Names are barks: a name is a short contour and a meaning.
  - **The Tierhounds (the owner, 2026-10-26)** are the Kingdom of the Tiers' own people, distinct from the four tribes
    and from the Coyote Men proper; *proposed*: hound-headed therians, kin to the Coyote Men and long their neighbours,
    settled, with the Kingdom's towns, terraces and the toll gate. The Kingdom is called the Coyote Kingdom by outsiders
    (the owner's alias), so the Tierhounds rule the country the Izani call the Coyote Kingdom: how that name stuck is a P1 line.
  - **The four tribes (the owner, 2026-10-26): Sunset, Sunrise, Valley and Peak.** Where each lives is *proposed* until the
    survey: the **Valley tribe**, the sedentary bronze-age farmers on the best land (the Farmland, station 2); the **Peak
    tribe**, high on the fog rim and the ranges (the Fog Rim and the Gem Hills: miners and tappers); the **Sunrise** and
    **Sunset** tribes, nomadic goat-and-ostrich herders on the plains (the Plains of Runners), their names the east and
    west sides of the basin, or the dawn and dusk grazing circuits. *Open*: who is the Kingdom's ruling people.
  - The tribes' arts, dress and settlements are the Coyote kit's (section 8).
- **Resources.** `kits/resources` has iron, copper, gold, tin, silver, rare earth, coal, sulfur, saltpeter and oil: **no
  gemstones**. Add **emerald** and **turquoise** nodes (three grades each; the gem ranges mine them: Muzo-style open-cast
  emerald and Persian-style turquoise workings in weathered copper-bearing rock), and note **ostrich feathers** as a
  `HARVEST` of the farmed sand runner, not a node.
- **The trade.** Izani caravans through the Korona corner; the Tiers kingdom takes a toll; emeralds, turquoise and
  feathers out; grain, metal tools and cloth in. Section 7's gate fixes the road in the world.

## 6. Stations (N and S Outlands, and a few substations)

Built as Korona's and the Throne's stations are: a station is a small bounded page of one place (`station.json` names the
kits it reads and the packs it adds), and a station may run past 20 MB only if the build tool allows it (`CLAUDE.md`, the
Throne's station 1 at its ceiling is the warning).

| # | Station | Place | What it shows |
|---|---|---|---|
| 1 | **The Fog Rim** (N Outlands) | the windward wall's montane woodland | the fog-combers (veil cap, comb mast) in mist; the biome's showcase and the first built; `dist/outlands.html` |
| 2 | **The Farmland** (N Outlands) | the sedentary tribe's wadi valley | irrigated fields of the bronze-age package, spring palms, rope-sedge channels; the Coyote culture kit's first stage |
| 3 | **The Gem Hills** (N/S line) | the emerald and turquoise ranges | weathered copper-green and white rock, rock-eater lace and pleat columns on the cliffs, open-cast workings (a `kits/resources` node set) |
| 4 | **The Plains of Runners** (S Outlands) | the dry plain, herds and a salt pan | ostrich flocks, cushion mats, fog beetles, vultures; the nomads' camps |
| 5 | **The Nursery Plateau** (S Outlands) | the driest ground | pod towers, brood pads and gall stacks tended by hexapods over pebble mats and crust rosettes; the strangest page |
| 6 | **The Gate** (the pass) | the corner of Korona | the narrow gap, the toll fort, the road; shared with Korona's station 7 (section 7) |
| 7 | **The Cursed City** (Arcoindian II; site tbd) | a cliffside the survey proposes | the ruined cliff arcology with the native flora over it and the Coyote Men's keep-out ring round it; the building is `kits/ancients` Arcoindian II |

N Outlands is wetter and settled (stations 1, 2, 3); S Outlands is drier, emptier and wilder (4, 5). The split follows the
survey (section 1). If the survey gives fewer distinct climates, merge 3 into 2 and 5 into 4.

## 7. The Tiers: its own biome, `tiers`

**Decision (the owner, 2026-10-26): `tiers` is a biome of its own**, `biomes/tiers/`, not a station of Korona's. It is on the
ground Korona's polygon holds, so the two overlap (Korona's six stations stay as built; its basin station is the Tiers'
wet lake shore and is read as that). The **Kingdom of the Tiers has its own people, the Tierhounds**: the Coyote Men's
neighbours and the Kingdom's rulers, not one of the four tribes (section 5). Where this section says "station 7" or
"Korona's station", read: a station of the `tiers` biome.

The owner's **geographic polygon The Tiers** (px 875-1009 by 118-287, 55,300 km², wholly inside Korona) is the eastern
sector of the rings, "stepping from the trench at -1,039 m to the plateau at 4,089 m", classes Cfa 17%, BSh 16%, water
12%, BWk 11%, BWh 11%, Aw 9% (`korona/NOTES.md`, "Borders"). It is the country of the **Kingdom of the Tiers**: terraces
on the ring's steps, the Tiers' lake at its foot (station 3 of Korona already shows that lake's fertile shore: the **Af**
side), and at its east end the gate into the Outlands.

- **What it is.** The *dry* half of the Tiers: BSh/BWk/BWh, terraced fields and towns on stepped rings, the toll gate. It
  complements the existing basin station (the lake, wet).
- **Diffusion.** The kit's brief: it mixes **Outlands species** (leaked out through the gate: pleat columns and
  cap-shrubs in the Kingdom's gardens and as a few wild stragglers on the east ring, tapped for water and gum), **sedesert**
  scrub and thorn (read in place from the south-east border), and **ebadlands** species (the pinyon and chaparral edge,
  banded mounds, the e badlands' share of the boundary is 5.9%, "one plateau, gradual"). Korona's gorge station
  (station 5) already reads `sedesert` in place; this station adds `ebadlands` and `outlands` the same way.
- **Zone rule.** Distance from the gate and from the ring's step set the mix (*proposed*: within a few km of the gate it
  is Outlands-heavy and sparse; mid-tier it is sedesert/ebadlands scrub with terraced crops; the lake's edge hands over to
  the basin station's Af flora). Writes as `core/tags`-registered zones, not an ad hoc blend.
- **The Kingdom's buildings** wait on the Coyote culture kit (section 8). The page has terraces, walls, a toll fort and
  a few huts as plain records until then.
- Build: `biomes/tiers/` with its own `build.py`, `PLAN.md` and stations, as Korona's and the Throne's are. Its
  `station.json` names the kits it reads (the `outlands` species fragments, `ebadlands`' and `sedesert`'s) and its packs.
  Station 1: the terraces and the Gate. Note the new biome in Korona's `NOTES.md`, "Borders".

## 8. A Coyote culture kit (next, not this plan's)

`kits/coyote/` (catalog culture `coyote`): the Kingdom of the Tiers' stepped mud-brick and stone towns, the toll fort, the
terrace farms, and the tribes' camps and the bronze-age sedentary tribe's villages; the Coyote Men's dress and body (a
people for `core/charactermodels/data/peoples.json`, with Korona's therian pieces: `character-modeling` skill). It takes
this kit's materials, its harvests and the terrace rule; it is its own plan (`kits/coyote/PLAN.md`) after the lore is in.

## 9. Phases

| Phase | What | Done when |
|---|---|---|
| **P0** | Survey: the owner draws `Outlands N`, `Outlands S`; `tools/scale-model` reads height, air, rain, Köppen, rivers, the pass; section 1 filled with numbers | section 1 has a table and the pass's coordinates |
| **P1** | Lore: `LORE.md` next §6 entry (the Coyote Men, their Hum dialect, the four tribes, the Kingdom of the Tiers, the pass, the trade); `biomes/README.md` and `WORLD.md` rows for `outlands` (N and S) and the Tiers; `INDEX.md` | the owner has approved the names and the geography |
| **P2** | Plant sheet: ~30 species drawn and checked, the shapes and the palette; textures list in `PROMPTS-NEEDED.md` | a species sheet with the owner's yes |
| **P3** | Station 1 (the Fog Rim) built on the shared core, `Core adoption` written and `tools/check_core_use.py` passing | `dist/outlands.html` verified |
| **P4** | Stations 2-5, one at a time; the `kits/crops` entry; the sand runner and the gem nodes in their kits | each station verified |
| **P5** | The `tiers` biome (`biomes/tiers/`) and the Gate (station 6) | `dist/tiers.html` verified |
| **P6** | Gallery, Godot export check, then the Coyote culture kit's plan | published (the owner allows once) |

## 10. Core adoption (to be written first, per the working rules)

Start the build from the nearest finished sibling, **`biomes/ebadlands`** (its species and station pattern) with
`biomes/korona` for the multi-station build. Take: the biome core (`CORE_BIOME`) for species, instancing and `BIO.bake()`;
`core/host` for the shell; `core/rand` (`KRAND`) for every draw; `core/mask` (`KMASK.canvas`) for any painted mask;
`core/tags` for everything placed; `core/terrain` for relief and carve (the gate, the gem workings); `core/water` for the
springs and the pan; `core/atmos` for the air and fog (the fog belt is the feature of this biome: use its shared fog,
do not write a new one); `core/space` (`KSPACE`) for any spatial query. Write no PRNG, noise, `getImageData`, water
shader or sky dome. Run `python3 tools/check_core_use.py` before calling it done. `BIOME-API.md` follows `sedesert`'s.

## 11. Open questions for the owner

1. ~~Inside or outside the Outer Wall?~~ Settled: outside, low, dense air (section 1); the survey checks the floor height.
2. **The pass**: a single gate in Korona's corner, or a long defile? Where on the Tiers' east edge?
3. ~~Therians or humans~~ Settled: therians, barking a dialect of the Hum (section 5).
4. **Names**: tribes settled (Sunset, Sunrise, Valley, Peak); the pass, the Coyote Kingdom's capital and the Kingdom's rulers still open, and the tribes' places.
5. **N vs S**: wetter-and-settled / drier-and-wild, or a different split?
6. ~~Armour~~ Dropped: the flora is 90% native and fungoid (section 3); the signature is colour and construction.
7. **Station count**: the six above, fewer for a first pass, or more?
8. **Gem ranges**: emerald and turquoise in one place, or emerald in the N and turquoise in the S?
9. **The arcology** (Arcoindian II, ruined, shunned; the trickster is believed to live there): which cliff? The road ends there and the misfortune is a real luck hazard (both settled).
