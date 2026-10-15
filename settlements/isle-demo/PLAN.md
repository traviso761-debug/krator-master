# Isle demo: the plan (draft, 2026-10-14)

The tiny example for the roadmap's last step (ROADMAP stage 6, GODOT-PLAN M7: "two kits and one settlement streaming
together in Godot from the scale model's terrain"): a Ring Sea island region with two Islander settlements, built
out on the world map from the start, and the first map where two settlements keep their own stocks and citizens and
trade with each other.

Branch `claude/isle-demo`, worktree `../krator-isle`, cut from `origin/main` 69fda11f. The local `main` checkout is
497 commits behind and holds another session's uncommitted Xanadu work, so nothing here touches it.

Owner's brief: assay the region; plan the biome, above all the savanna and hot steppe; give the Kautoa set some hipped
roofs and the West set a few more pointed peaks; give both sets a building for every trade the Voth city carries;
then open the region in the site planner and lay out the two settlements. Respect the roadmap's ongoing work, and take
the latest Voth viewer as the base.

## Owner's answers (2026-10-14)

- **Sites.** Kautoa and Walapo stay where the model has them, 122 km apart on two islands. They trade by sea.
- **Style.** Both towns are East (Kautoa). Walapo is a Kautoan village. The West set still gets the trade buildings
  and the roof overlap, since it is a kit for other worlds.
- **Roofs.**
  - The East stays tall and pointy, and the West stays the lower, broad-roofed set. The two sets overlap more.
  - The East gets some broad roofs **like its village hall** (`ie-hall`: crossing horned saddles of golden thatch,
    the spire rising where they meet).
  - The West gets a few pointed peaks.
- **The partition is done on this branch.** The owner authorizes edits to `core/simulation` here. Every change
  defaults to one settlement, so Voth, Mungo, Shade, Dhelv and Verge stay byte-identical in behaviour: their verify,
  stocks proofs and baseline must not move.

## Status (2026-10-15)

- **P1 done** (`kits/islanders`):
  - Kautoa's hall-roofed long house, cross-roofed house and chief's house; the West's peaked rumah.
  - 34 trade buildings, so both sets carry every Voth census trade (`IS_TRADES`; verify `voth-trades`: 40 of 44, the
    other 4 are not on the isles).
  - Mines in both sets; `isDims()` for core/city.
- **New kit `kits/resources`** (owner: the nodes are not the Islanders'):
  - 30 placeable nodes: iron, copper, gold, tin, silver, rare earth, coal, sulfur, saltpeter and oil, in three grades each.
  - A mine works the nearest node it can within 400 m; oil takes a derrick (Locus's `ind_pumpjack`).
  - The grade sets the yield, x0.5, x1 or x2. Nodes never run out.
- **P2 done** (`biomes/ringisles`):
  - Zones by climate class, the strand, the mangal, the reef, tide pools, the geyser field, and the owner's crops as
    `crop-*` stands.
  - verify: 17 checks and 11 negative controls pass.
- **Textures:** 18 prompts in `core/materials/PROMPTS-NEEDED.md` (5 resources, 10 isles, 3 to check).
- **P3a done** (`openworld/isle-demo`, 2026-10-15). The region at 1:1 on little-demo's world, read in place
  (little-demo's region settings moved into its own `46-world-config.js`, behaviour unchanged).
  - The isle fields: the climate classes as weights, and the coast.
  - The two towns marked, and a view at each of the twelve geyser vents.
  - Checks: the isle's three, each with its negative, run in the browser pane. Headless SwiftShader cannot load these
    pages on this machine (little-demo's too).
- **The demo area grew** (owner, 2026-10-15): two polygons drawn in the world, the west isles and the north-east isles,
  are part of it (`openworld/isle-demo/source/added-areas.json`, cut as a union by the extractor's `--add`). It is now about
  31,800 km2, 11,800 km2 of land, with 16 geyser vents. The assay in section 1 is the original polygon's.
- **P3b is done** (2026-10-15):
  - the isles' flora in the world (`RINGISLES.world()`), with the kits' texture packs;
  - the sea readable at every height (the owner);
  - the ground coloured by climate class;
  - the coast as terrain (lagoon, reef crest, mangrove flats);
  - seagrass and corals in the water;
  - the geyser fields at the 14 geyser vents;
  - a quality pass on the scrub thorn (the owner): splayed stems forking level under a flat, layered umbrella, with
    some dry browning.
  - Its checks pass in the browser pane (`openworld/isle-demo/README.md`).
  - Open: a sparse floor, slow coastal tiles (`openworld/isle-demo/KNOWN_ISSUES.md`).
- **Next: P4,** the site planner for the two towns.

## 1. The assay (scale model 4.21, read 2026-10-14)

The owner's polygon **"isle demo"** (political layer) covers map px 643-707 x 362-487: **about 128 x 250 km, 26,450 km2,
of which about 9,800 km2 is land.** Cut with `tools/scale-model/extract_region.py` into scratch (nothing written to the
model). Map: `assay-4.21.png` (climate class colours, 250 m contours, numbered land bodies).

**It is an archipelago, not one island.** On the 4 km height grid:

| Body | Land | Size | Top over the sea | Climate |
|---|---|---|---|---|
| North (Kautoa's) | 4,100 km2 in the polygon | joined by a neck to the land north of the polygon (10,840 km2 in all) | +1,118 m | XA 32%, XV 21%, Aw 21%, Af 11%, BSh 6% |
| South cluster (Walapo's) | 4,496 km2 | 92 x 120 km, four isles joined on the 4 km grid by shallows | +1,268 m | XA 29%, Af 22%, XV 12%, BSh 9%, Am 9%, Aw 9% |
| West isle | 1,200 km2 | 44 x 40 km | +1,191 m | Af 53%, XA 25%, Am 11%, Aw 7% |

- **Height.** The Ring Sea stands at -1,500 m (about 1.9 atm), so the islands are low and very hot: annual means
  27-39 C, rain 550-4,000 mm. No ground over +1,300 m above the sea.
- **Climate by area (land in the polygon):** hypertropic jungle XA 2,588 km2; rainforest Af 2,012; tropical savanna
  Aw 1,780; abyssal savanna XV 1,564; hot steppe BSh 784; abyssal salt steppe XS 648; monsoon Am 588.
  **The savanna and steppe classes (Aw, XV, BSh, XS) are 4,776 km2: about half the land.** The owner's instinct is
  right: most of what the kits lack is here.
- **Geysers:** twelve vents (`DATA.vents`, kind geyser) on these isles. **Kautoa sits on one** (px 689,395), and three
  more are within about 30 km of it. The geyser kit (`GEYSER.cluster`) can place a thermal field from a model point.
- **Settlements already on the map:** **Kautoa** (city, px 692,395: Af, +380 m over the sea, 2,745 mm, 31 C) on the
  north body; **Walapo** (village, px 670,452: XA, +126 m, 1,380 mm, 32 C) on the south cluster. **They are 122 km
  apart, on different islands**, so trade between them goes by sea.
- **The biome overlays do not cover the land.** The isles lie under the 'Ring Sea' overlay (a water overlay with no
  kit), with fringes of 'Hyperjungle' and 'Throne/Volcano'. Little-demo picks a kit by overlay, so here the kit must
  pick its zones by climate class instead (section 2).
- **Grid caveat:** the land and water mask is 4 km a cell. Coastlines, the neck and the shallows between the south
  isles are the open world's to draw (shore detail from the heights, as little-demo does).

## 2. The biome: `biomes/ringisles` (one kit, zones by climate class)

**What exists** (survey 2026-10-14):
- the Throne's **isle station** (coconut, palm frill, hyper-mangrove, lehua, tree fern, arch palm; kelp, wrack,
  seaweed; a beach zone and a warm lagoon);
- the Throne's **savanna station** (Aw/BSh: tall-grass tussocks from the library, star aloe, frill tree, trumpet,
  gill parasol, stilt parasols, burns, fire flowers, kopjes, dongas);
- **geyser** (sinter, terraces, black-sand beach, warm creek; pandan, kanuka, glasscane);
- the **hyperjungle's** understorey palm, screwpine and tree fern. Its 150-300 m giants are too big for islands.
- **swbay**: umbrella thorn, baobab, savanna grass and termite mounds.
- **rift**: acacia, baobab, aloe tree and termite spires.
- **eastabyss**: fan palm and an umbrella tree, abyssal savanna grass.
- **sedesert**: spinifex, salt bush.
- **nwlowlands**: she-oak, a casuarina form.

**The kit:** a new kit on the shared biome core. It reads the scale model's climate class and draws one zone per class
band. It lifts species from the kits above in place (by path, as little-demo reads its kits), and adds new species only
where nothing fits. Every species carries Köppen tags, so this is the first kit to place by `koppen:<class>` (WORLD.md
section on climate, planned but not built).

| Zone | Classes | From existing kits | New |
|---|---|---|---|
| **Island rainforest** (10-35 m canopy, island scale) | Af, Am, XA | Throne isle lehua over tree fern, palm frill, arch palm; hyperjungle palm and screwpine; geyser pandan | an abyssal "hyper" variant for XA: the same species taller and denser, with lianas and epiphytes from the hyperjungle's dressing |
| **Tall-grass savanna** | Aw, XV | Throne tall grass, star aloe, frill tree; swbay umbrella thorn as the island acacia; rift or swbay baobab (the 40-70 m size); eastabyss fan palm as a borassus-type savanna palm; swbay and rift termite mounds (ported as one floor function) | **thorn scrub** (a low acacia and commiphora layer: nothing like it exists); **burn mosaic** grass states (green, cured gold, black) as floor variants; XV's abyssal grass, head-high, and its bigger mounds |
| **Hot steppe** | BSh | crater-drylands grass; sedesert spinifex; crater tree aloe; Throne kopjes | **short steppe bunchgrass** (warm-tagged: ebadlands' and ehighlands' are cold); **bottle-tree scrub** from sedesert's bottle tree, re-tagged |
| **Salt steppe and pans** | XS | sedesert salt bush | **salt pans with halophytes** (glasswort and samphire mats, salt crust, a tamarisk-like shrub): new. They are also the islanders' **salt works** (section 3) |
| **Strand and beach** | the shore band of every zone | Throne coconut (lift its `isle:true` gate); nwlowlands she-oak; geyser's black sand | **beach creepers** (beach morning glory), **naupaka and sea grape** shrubs, **strand pandanus** at the high-tide line, beach grass on the dunes, drift and wrack lines |
| **Mangrove and lagoon** | sheltered shores, river mouths | Throne hyper-mangrove; eastabyss stilt wood and knee tree as back-mangrove | **reef and lagoon floor**: coral heads (from rift's brain-coral geometry), a sand and seagrass lagoon floor, reef flat, tide pools. The fauna kit's turtle, octopus and reef fish want it |
| **Thermal ground** | round the twelve vents | `GEYSER.cluster` and the geyser kit's zones in place | none |
| **Gardens** (near towns) | where the town says | islanders' placeholder coconut, banana, taro, breadfruit and paddy | the owner's crops (2026-10-15), each a keyed stand. Tree crops: coconut, mango, banana, coffee, cloves, breadfruit. Ground crops: rice, taro, sweet potato, medicinal herbs, greens, sugar cane, kava. Coffee and cloves grow on the wetter upper slopes |

**Fauna** (kits/fauna, presets as they are): the Ring Sea set (isle tortoise, shore iguana, tide fox, ring shark,
ring whale, sea turtle, reef octopus, cormorant, sea lion, gull); swbay's savanna grazers (dune hartebeest, plains
grazer, savanna stalker) for Aw/XV; pigs, hens, ducks and buffalo from the islanders' herd.

**Textures** (owner to find or generate; prompts written per `core/materials/PLAN.md` once the list is agreed):
- coral and reef rock;
- lagoon sand with seagrass;
- salt crust;
- cured savanna grass card (the Throne's dry grass may do);
- thorn-scrub foliage card;
- beach creeper card;
- naupaka and sea grape leaf cards.

**Into the world:**
- `openworld/isle-demo` is cut from the model, on little-demo's machinery. Its data comes from `extract_region.py`
  "isle demo", with the source collections saved in `source/` as little-demo does.
- The extractor gets the kit through `KITS`, keyed on the region rather than on an overlay. The world's
  `WORLD_KITS` entry is given the climate classes, not an overlay name.
- At 128 x 250 km it streams, as little-demo does. The towns are baked tiles from section 4's page.

## 3. The Islanders kit

### 3a. Roof overlap

The East (Kautoa, after Sumba) has tall skirt-and-tower roofs. The West (rumah) has horned saddles. The tools already
exist:
- `isHip`, a plain hip, in `41-is-roof.js`;
- `ieHouse` with `towerH:0`, "a plain hip";
- `ieRoofE`, the Kautoa skirt and tower;
- `iwSpikes`.

So the tweak is new defs and parameter sets, not new roof code.

- **Kautoa gets broad roofs like its village hall** (owner): crossed horned saddles of thatch, a spire where they
  meet, the East still the taller and pointier set. Planned additions:
  - a long house under one broad saddle with a short spire;
  - a twin house under crossed saddles;
  - a chief's house (East): the village hall's roof at house scale, on carved pillars;
  - broad-roofed variants of the trader, the weaver and the kava house.

  Kautoa has no chief's house today, only the noble compound and the palace.
- **The West gets a few pointed peaks.** Planned additions:
  - a rumah with a Kautoa-style tower rising from the saddle's middle;
  - a tall peaked shrine or spirit house;
  - a peaked granary;
  - a peaked watchtower roof.

  All of them come from `ieRoofE`/`isSpire` called from the West's builders, painted with the West's gable sheets.

### 3b. A building for every Voth trade, in both sets

The kit already covers these, in both sets:
- smiths, potters, weavers;
- brewers and the tavern (the kava houses);
- shopkeepers (shophouse and trader, chandler);
- the market, warehouses, granaries and mills;
- farms, fishing docks, dockyards;
- barracks, watchtowers, schools;
- halls and the palace household.

Barracks, watchtowers and schools need `job` tags.

**Missing, to add to both sets** (each a `defBuilding` with `job`, workforce in `life`, furnished from the catalog):

| Voth trade | Islander building |
|---|---|
| bakers | oven house: earth ovens (umu), sago and breadfruit bakery |
| butchers | butcher's and smokehouse: pig, fish and turtle, smoking racks |
| tanners | tannery and tapa house: hides and shark skin; bark-cloth beating |
| healers | healer's house: herb drying, a sick-house on piles |
| temple priests, undertakers | temple: the West's spirit house and marae, the East's ancestor temple with stone tombs (Sumba megaliths) |
| customs | harbourmaster's house at the quay |
| dockers, stevedores | the quay and pier with a cargo shed (both towns need one for the trade route) |
| coast guard | war-canoe shed: kora-kora (West), drua (East) |
| innkeepers and grooms (caravanserai) | guest longhouse for traders and crews |
| lighthouse keepers | beacon tower: a fire on a peaked tower |
| ferrymen | canoe landing and ferry shed |
| miners, quarrymen | coral and stone quarry; salt works on the XS pans |
| dairymen, swineherds, duck keepers | pig sty, hen house, duck pond and pen, buffalo byre |
| orchards, gardens | taro terraces, paddies and groves (flora, section 2) |
| shopkeepers (alchemist, clothier, scribe) | medicine and dye seller, cloth seller, carver's shop: variants of the trader |
| guild officers | the halls carry it (tagged) |
| envoys and embassy staff | a guest compound for foreign envoys (Kautoa only) |
| power house, elephant bug station | none: Voth-specific (no electricity, no elephant bugs on the isles) |

**Bundle:**
- The kit gains `bundle()` (as `KratorVehicles`), so a settlement page can draw islander buildings.
- It also gains a `kit.dims` adapter (footprints from `w`/`d`/`h`), because `core/city`'s building drawer takes only
  catalog ASSETs.

## 4. The settlement page: `settlements/isle-demo`

At settlement scale, as the survey recommends: the scale model gives the outline and climate, the page gives the
towns. It is baked into the open world as town tiles later, as Mungo was.

**The Voth viewer and site planner as the base, without editing Voth's files.** `settlements/voth`, `core/city` and
`core/simulation` belong to the Voth economy and city-layout sessions (CLAUDE.md "who works where", ROADMAP section 9).
So:

- **Site planner:**
  - `build.py` reads Voth's general site fragments **in place, by path**:
    - `targets/voth-site/10-site-model.js` (districts, markers, avenues, terrain);
    - `55-site-tools.js` (the tools, brushes, undo and save).
  - It gives them a small `VOTH` shim (`terrainH`, `landDist`, `SEA`, `groundTone`, no Voth districts) from the isle's
    own ground.
  - It has its own scene (`50-isle-scene.js`: island ground from the extracted heights at 1:1, sea on core/water,
    beaches, the vents) and its own start.
  - Its own `serve.py` saves to `site/isle-site.json` on its own port. The save route and the draft key are
    hard-coded to Voth's; the shim maps them.
  - The hashes of the files read are recorded, as `core/host/voth-sources.json` does. If Voth changes them in a way
    that breaks the shim, we vendor a copy and track drift.
- **City plan:**
  - Two `KCITY.create` instances, one per town, each with its own site section, `TUNE`, `rand:'krand'` and
    `index:{order:'insertion'}`. Two cities on one page is already proven in `core/city/test-city.js`.
  - The isle's own steps 0-5 fragment (role table, marker letters), modelled on Voth's `30-vc-site.js`.
- **Viewer:**
  - `core/host` for camera, clock, panel and probe.
  - The inspector, contents and stocks are written as isle-local host fragments against ROADMAP section 10's
    `contents?`/`stocks?` contract. They read only `SIM.contents`, `SIM.stocks` and `SIM.holders`, so they move into
    `core/host` later.
  - Voth's `VC`-bound viewer files (`55`-`59`) are not copied.

**Page extent** (owner: keep both, trade by sea): **one page, two town windows.** One `SIM` holds both towns, so
trade is a real carrier between them, not an off-screen site. Each town's site is detailed at 1:1. The 122 km of sea
and coast between them is drawn at open-world detail. The canoe line runs the whole way: abstract when far from the
camera (ROADMAP stage 5's record and abstract levels), presented near it. The site planner opens on either town.

## 5. Two settlements on one map: the partition and trade

**Today:**
- `core/simulation` has one `SIM` per page, one `ECON` (one warehouse list, one cart pool), one stocks tally and one
  population deal.
- Factions, orgs and relations exist, and `presence` has a `settlement` field.
- Nothing groups stores, citizens, carts or stocks by settlement.
- Imports and exports happen only at map-edge ports.

**What is needed** (all in `core/simulation`, which the Voth economy session owns):
1. A **settlement key** on places, actors, roles, orgs and groups (`SIM.settlement({id, faction})` as a kind; an actor
   takes its home's).
2. **The economy partitioned by key.** Each settlement gets its own warehouses, sites, carts, in-flight loads and
   day's books. `stockOf`, `supply`, `economyMeal`, `useRate`, `daysOf`, `scanImports` and the cart step take the
   key, and a cart works only its own town.
3. **Population per settlement:** homes and jobs dealt within the town.
4. **Trade between settlements:**
   - A carrier route whose stops are places in another settlement, not map-edge ports.
   - Departure buys from the origin's warehouses, and arrival lands into the destination's.
   - The books count each load as exported by one town, imported by the other, and in transit on the carrier.
   - It is gated by the factions' `trade` relation.
   - Here the carrier is a sailing canoe on a sea line (kits/ringsea's drua or oruwa), on the `transport` records
     Voth's ferries use.
5. **Stocks, contents and holders by settlement** (`SIM.stocks(s)`), so the stocks panel shows each town and the
   trade between them.
6. **Place search scoped:** a citizen looks for work, food and shops in their own town first.

**How** (owner: here):
- Built on this branch, in `core/simulation`. It follows that folder's own PLAN.md: "stockpiles per settlement",
  `SIM.settlement()`, Phase G's caravans.
- **An unkeyed page is one implicit settlement.** Every existing taker keeps its results: Voth's stocks proof, the
  baseline and `node` tests must be unchanged.
- A note goes into `settlements/voth/HANDOFF-REFACTOR.md`'s area as a message for the Voth economy session (not an
  edit of its files), so its fork merges knowing the change.
- Phase P7 starts with a fresh merge of `origin/main`, because that session keeps changing `core/simulation`.

## 6. Order of work

| Phase | What | Proof |
|---|---|---|
| P0 | This assay and plan; the owner's answers | — |
| P1 | Islanders: roof overlap and the trade buildings (3a, 3b); `bundle()` and `kit.dims` | islanders `verify.py --assert` (footprints, budgets, furnished, typed, `job` coverage of the Voth list); one sheet shot per row |
| P2 | `biomes/ringisles`: zones by class, lifted species, the new ones (2) | kit `verify.py --assert`, a shot per zone; texture prompts to the owner |
| P3 | `openworld/isle-demo`: the region at 1:1, streamed, with the kit and the geyser fields | world `verify.py --assert`, the probe on rivers and shores |
| P4 | `settlements/isle-demo` site planner on the extracted ground, both towns | the planner loads clean, saves `site/isle-site.json` |
| P5 | **The owner lays out the two settlements in the site planner** | the owner's site file |
| P6 | City plan: two `KCITY` instances on the Islanders kit | verify, exact footprint overlap, census |
| P7 | Simulation: two towns, the partition (with the sim session), the canoe trade route, stocks per town | stocks balance per town; a load traced from one town's warehouse to the other's |
| P8 | Bake the towns into the open world; Godot stage 6 streams the region with its two towns | the export round trip; Godot's tests |

P1 and P2 can run in parallel (different folders). P3 waits for P2's kit. P4 waits for P3's ground (or the extract
alone).
