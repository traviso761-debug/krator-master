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

- **Sites.** Kautoa and Valapo stay where the model has them, 122 km apart on two islands. They trade by sea.
- **Style.** Both towns are East (Kautoa). Valapo is a Kautoan village. The West set still gets the trade buildings
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
- **P4 is done** (2026-10-15): the site planner, `dist/isle-site.html` (this folder's `README.md`).
  - It is Voth's site editor read in place, on the open world's ground (the world's height fragments, to the cm).
  - Each town is planned in its own frame and saved to `site/isle-site.json` through `serve.py`. The file holds both
    towns' frames, with nothing drawn yet.
  - `verify.py --assert` passes for both towns.
  - The open world's climate classes now blend between pixel centres with meandering edges, not 2 km steps; its
    checks pass again.
  - Valapo's frame moved toward its coast (the owner): its settlement point is 5.2 km inland, so the origin sits 3.7 km
    north-north-west of it, 1.6 km from a bay; the point stays inside the square.
- **P5 is done** (2026-10-18): the owner's two site files are in `site/isle-site.json` (Kautoa: 13 districts,
  11 markers, 13 avenues; Valapo: 5 districts, 2 markers, 3 avenues), with the brief for each town. Section 8 is the
  programme P6 builds from.
- **The village is Valapo, not Walapo** (owner, 2026-10-18: the language has no W sound). Renamed everywhere outside
  the scale model; the scale model's own settlement record still reads Walapo until the owner renames it there, so a
  re-extract must keep the new name (`openworld/isle-demo/source/settlements.json`).
- **P6 is done** (2026-10-18): `dist/isle-city.html`, both towns on core/city from section 8 (this folder's `README.md`,
  "The city page").
  - **The owner redrew both towns at their size** (the first drawing's ceremonial park was eight times the palace;
    the full-size drawing is kept as `site/isle-site.full.json`). Kautoa about 6,000 people with at least two thirds of
    its build area built (houses in walled compounds); Valapo about a third of it, grown from the village hall along the
    shore and the avenues, its parks white sand beaches, the owner's ground edits replayed.
  - `verify.py dist/isle-city.html --assert` and `node tests/test-isle-city.js`: every check of section 8 per town, with
    negatives. Stand-ins and gaps: `KNOWN_ISSUES.md`.
  - Ridertown's buildings go in a new set, **kits/beast-riders** (owner): the catalog's Girder and Mav's Refuge buildings
    plus stables and a rookery tower, built once its three textures are delivered (`core/materials/PROMPTS-NEEDED.md`
    section 6).
- **Next: P6b,** the export profile (section 7); kits/beast-riders when its textures arrive.

## 1. The assay (scale model 4.21, read 2026-10-14)

The owner's polygon **"isle demo"** (political layer) covers map px 643-707 x 362-487: **about 128 x 250 km, 26,450 km2,
of which about 9,800 km2 is land.** Cut with `tools/scale-model/extract_region.py` into scratch (nothing written to the
model). Map: `assay-4.21.png` (climate class colours, 250 m contours, numbered land bodies).

**It is an archipelago, not one island.** On the 4 km height grid:

| Body | Land | Size | Top over the sea | Climate |
|---|---|---|---|---|
| North (Kautoa's) | 4,100 km2 in the polygon | joined by a neck to the land north of the polygon (10,840 km2 in all) | +1,118 m | XA 32%, XV 21%, Aw 21%, Af 11%, BSh 6% |
| South cluster (Valapo's) | 4,496 km2 | 92 x 120 km, four isles joined on the 4 km grid by shallows | +1,268 m | XA 29%, Af 22%, XV 12%, BSh 9%, Am 9%, Aw 9% |
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
  north body; **Valapo** (village, px 670,452: XA, +126 m, 1,380 mm, 32 C) on the south cluster. **They are 122 km
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

**The Voth viewer and site planner as the base, without editing Voth's files.** `settlements/voth` and `core/city`
belong to the city-layout work (CLAUDE.md "who works where", ROADMAP section 9); `core/simulation` is edited here (no
economy session runs any more, owner 2026-10-18: this build is the economy's test case). So:

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

**What is needed** (all in `core/simulation`):
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
- **The isle demo is where the economy is tuned from now on** (owner, 2026-10-18; no economy session runs). A tuning
  change made here is a `core/simulation` change: it is tested on this page's two towns first, then Voth's page is
  rebuilt and its stocks proof read before the change is committed. Voth's open sim defects (ROADMAP stage 5) are
  worked here when the isle demo reaches the same feature, not on a Voth branch.

## 7. The Godot milestone (M6) and the export profile

The refactor audit of 2026-10-18 (ROADMAP section 11) makes this build **M6, the first lived-in settlement through the
canonical export**, in place of a Voth district: it is smaller, it stands on the scale model's own ground from the
start, and two towns 122 km apart force the two things Voth cannot test, a settlement nobody is watching and trade
between settlements.

**Where the export case lives (owner, 2026-10-19): the region's open world, not a page per city.**
- **A city is data:** its site file and its programme, laid out by `core/city`. It needs no page of its own; the city page
  (`dist/isle-city.html`) stays a working view while a town is laid out.
- **A region is one page:** its open world (`openworld/isle-demo`) runs every city and hamlet in it on the scale model's
  own ground, one clock, one registry. That page is the M6 export case: it is the only one with `terrain=field` to hand
  (the extracted heights), the hamlets and their resources, and both towns together. The next city costs a site file and
  a programme; the next region costs one open-world page.
- **The order:** the city page's profile check (section 10, item 1) is the stepping stone. When Kautoa and Valapo run in
  the open world (their `KCITY` plans live, as the hamlets are, rather than baked tiles), the profile moves to
  `openworld/isle-demo/verify.py` and grows there.
- **The `city` section is `core/city`'s** (2026-10-19, owner's approval): `40-city-kcity.js` registers it for every
  `KCITY` instance on a page that has run (`KCITY.registerExport`), so any page on `core/city` exports its plans with no
  per-city code.

**The export profile.** `EXPORT.check(world, {profile})` (ROADMAP section 11, item 1) names the sections this page
must fill; a required section that reads `stub`, `none` or `error` fails `verify.py --assert` and the nightly. Isle
demo's profile: `terrain` as a `krator-field` from the extracted heights (not `EXPORT.ground`'s samples), `city` (two
`KCITY` plans, registered by `core/city`), `records` with the Islanders' buildings, `fixtures` (doors, windows, lamps
under their buildings), `interiors` (the kit's rooms), `furniture` (the catalog placements, by look), `sim` (places,
actors, stocks per settlement, the canoe route and its books), `materials`, `textures`, `atmos`, `stage`. The profile
check lands **before P7**, so the sim's export is written to it rather than fitted afterwards.

**The abstract-level test.** With the player's window at Kautoa, Valapo runs at the abstract level (`core/simulation/
SCHEMA.md`, "The three levels", written for this build): its places produce and consume by the hour, its books and the
trade route tick, nobody is posed and nothing is drawn. The canoe in transit is a record only. The test fast-forwards a
week with one window loaded, then the other, and checks: both towns' stocks balance (made + imported - exported -
consumed = change); every load left one warehouse and landed in the other or is in transit; the arrival after days away
reconciles against what the destination consumed meanwhile (the wake and the lag). Godot replays the same baked tasks
and reads the same books.

**Citizens.** A few hundred to a few thousand per town, well under Voth's 53k: a count a Godot replay, and later a
GDScript twin of the sim, can be checked against by hand. Voth stays the scale test after M6.

## 6. Order of work

| Phase | What | Proof |
|---|---|---|
| P0 | This assay and plan; the owner's answers | — |
| P1 | Islanders: roof overlap and the trade buildings (3a, 3b); `bundle()` and `kit.dims` | islanders `verify.py --assert` (footprints, budgets, furnished, typed, `job` coverage of the Voth list); one sheet shot per row |
| P2 | `biomes/ringisles`: zones by class, lifted species, the new ones (2) | kit `verify.py --assert`, a shot per zone; texture prompts to the owner |
| P3 | `openworld/isle-demo`: the region at 1:1, streamed, with the kit and the geyser fields | world `verify.py --assert`, the probe on rivers and shores |
| P4 | `settlements/isle-demo` site planner on the extracted ground, both towns | the planner loads clean, saves `site/isle-site.json` |
| P5 | **The owner lays out the two settlements in the site planner** (done 2026-10-18; section 8) | the owner's site file |
| P6 | City plan: two `KCITY` instances on the Islanders kit | verify, exact footprint overlap, census |
| P6b | The export profile (section 7): `EXPORT.check(world, {profile})`, this page's required sections, in `verify.py --assert` and the nightly | the check fails on a stubbed required section and passes once each is filled |
| P7 | Simulation (section 9, P7a-P7e): two towns, the partition, the canoe trade route, stocks per town; the economy tuned here from now on; the three levels in `SCHEMA.md` | stocks balance per town; a load traced from one town's warehouse to the other's; the abstract-level week test (section 7) |
| P8 | **M6:** both towns open in Godot from the canonical export with citizens and trade running; then bake the towns into the open world and stream the region (M7) | the export round trip under the profile; Godot's tests: uids, records, the books after a replayed week |

P1 and P2 can run in parallel (different folders). P3 waits for P2's kit. P4 waits for P3's ground (or the extract
alone).

## 8. The towns' programmes (P5: the owner's site files and brief, 2026-10-18)

The drawings are in `site/isle-site.json`. Coordinates are each town's frame (metres, x east, z south, so north is
-z). **The coordinates below are the owner's full-size drawing** (`site/isle-site.full.json`); since P6 the site file
holds the owner's redrawings at the towns' size (the status above): the districts and markers named here are the
first drawing's, and some are gone from the redrawing (Warrior's Square, Market 3, Park 2's loop). Every drawn avenue is 12 m wide. What the owner asked for that is not drawn yet is marked **to draw**: P6 adds it
as records, or the owner draws it in the planner.

### 8a. Kautoa, the walled city

**The wall and the build region.** `build region` (d5, about 7.9 x 6.1 km, x -3,630..4,290, z -2,210..3,840) is the
dense city, inside a wall. Outside it are farms and orchards (8c), and small farming villages round the peninsula if
that ring is not enough. The ring and the villages lie past the planner's 7.8 km square, so P6 places them as world
records on the frame, or the square grows.

**The ceremonial centre.** The `ceremonial park` (d1) is a quadrilateral about 900 x 750 m, centred near (0, 130).
- **An avenue rings the park (to draw).** The palace, the ceremonial square, the five envoy houses and the Iziz
  Governor's House all **align to that ring**: each faces the park, its front parallel to the nearest side of the ring.
- **PALACE** (-201, -182) stands 94 m outside the park's north-west side. That side runs from (-513, 128) to
  (251, -357), bearing 32 deg north of east. The palace faces south-east into the park. It is Kautoa's palace
  (`kits/islanders`, the East set).
- **SQUARE** (175, 435), the ceremonial square, is 75 m outside the park's south-east side. **An avenue rings it (to
  draw)**, and the square's buildings may lie over that avenue where it meets Avenue 1.
- **Avenue 1** runs from just south-east of the palace (-152, -94) across the park to the square (137, 362). It is
  the processional way. Avenue 3 carries on from the square (257, 560) to the harbour road (690, 1245).
- **Envoy houses A to E** stand round the park, each aligned to the ring:
  - A (404, -352) off the north-east corner;
  - C (582, -115) off the east corner;
  - D (-616, 240) off the west corner;
  - E (-452, 564) and B (-126, 618) along the south-west side.

  Each is the Islanders' guest compound for foreign envoys (section 3b).
- **IZIZ GOVERNOR'S HOUSE** (561, 200) stands 100 m south of the park's east corner, aligned to the ring. It is
  `vern_governor_palace` from the Iziz Vernacular kit, renamed in the kit to **Governor's House** on 2026-10-18. The
  key stays the same, so Verge and the interiors sets are unchanged. The owner calls it the *old* governor's house:
  Izanitown grew up round it.

**Markets, parks and the cross-town avenues.**
- **Market 1** (d3) is the harbour market, a long strip along Avenue 2 from (-350, 1771) to (1721, 840).
- **Market 2** (d11, about 900 x 350 m, centred near (710, -1225)) is the north market by Ridertown.
- **Market 3** (d12, a small 200 m square at (-2830, 2510)) is at the south-west end of Avenue 6.
- **Park 2** is taken to be the park drawn as `Park 3` (d10, centred near (-2190, 140), on the west side). It lies
  between the two markets it is to join; the white sand beach is the other park. The owner to confirm.
- **To draw:**
  - an avenue round Market 2, one round Market 3 and one round Park 2;
  - an avenue from Market 3 to Park 2 (about 2.4 km north);
  - an avenue from Park 2 to Market 2 (about 3.3 km east-north-east).

  Avenue 6 already joins Market 3 to the ceremonial park and runs east to (3197, -474). The new pair makes the
  western loop that Avenue 6 does not.
- **The white sand beach** (d6, x 2594..4028, z 689..1110) lies east of the harbour. It is a park on white sand, with
  the sandy coastline **widened** there. That is a terrain edit in P6, with the strand kit's sand recoloured white; if
  the library's sand will not take the tint, ask the owner for a texture.

**The harbour has two halves.**
- **The military harbour** (d7, the strip from (-487, 2442) to (-1029, 3781), with Avenue 13 down it) holds Islander
  warships, in their war-canoe sheds (section 3b) and afloat. They are `kits/ringsea`'s Islander craft: the drua, the
  kora-kora, the karakoa and the lanong.
- **The civilian harbour** (d2, along Avenue 2 from (-475, 2422) to (2574, 674)) has fishing docks with oruwa and
  lakatoi, and trading vessels of six origins, all from `kits/ringsea`:
  - Vothic: the dhow, junk, hulk and barge;
  - Hykkousoi: the corbita, galley and pearl;
  - Izani (Iziz Vernacular): the dhoni, lighter and turtle;
  - beast rider: the waa and the rookery ship;
  - salvage (Ancients salvage): the salvage tug;
  - Islander extraction: read here as the Islanders' own bulk carriers bringing ore, salt and stone (lakatoi). The
    owner to confirm.
- **The quay, the harbourmaster's house and the cargo sheds** go here, with the trade route's landing (section 5).

**Industry: extensive, by the harbour (to draw).** Kautoa works metal it does not mine. Its main source is **Valapo's
iron, landed as ingots**. The proposed works quarter lies between Avenues 2 and 5, east of Izanitown (x 1,750..2,600,
z 200..680):
- it is where the ingots land;
- it is beside the **CARAVANSERAI** (1788, 509);
- it is on the way to the **QUARRIES** (4068, 698) at the east end of the beach.

It holds forges, smithies, a tool and weapon works, cooperage and rope walks for the harbour, and kilns. The **SALT
WORKS** (-1265, 3930) lie south of the military harbour, on the pans.

**Two minority districts.**
- **Izanitown** (d9, x 674..1669, z 96..761) surrounds the old Governor's House. It is mostly **Iziz Vernacular**
  houses, shops, wealthy houses and military buildings (barracks). The page takes the Vernacular as a bundle, as it
  takes the Islanders; P6 checks that one exists, or writes it.
- **The native military** stands just north of Izanitown at **Warrior's Square** (d13, about 380 x 370 m, centred
  near (954, -377)): Islander barracks, the war-canoe captains' halls and the watchtowers.
- **Ridertown** (d8, the north edge of the city, x -912..1508, z -2217..-1221) is built in Islander architecture,
  with many nature shrines and some stables and rookeries for the riders' mounts. Avenue 7 ends at its north edge
  (226, -2200): the north gate.

**The highways (to draw, beyond the wall).**
- **West along the coast** from Avenue 8's end (-3492, 1206), and **east along the coast** from Avenue 10's end
  (4113, -390). Both lead to small fishing villages, placed in a later step.
- **North** from Avenue 7's north gate (226, -2200), past Ridertown, to beast rider territory.

**Funerary 1** (d4, x 2287..3392, z -1724..-1052) holds the ancestor temple's stone tombs (Sumba megaliths).

### 8b. Valapo, the open village

Valapo is smaller, with no wall. `build area` (d5, x -2733..2057, z -4218..-53) is the densest part. It fades out to
suburbs, then farms.
- **The harbour** (d1) is the long strip along the north shore. **Avenue 1** is the coast road, from the white sand
  beach (-2601, -1112) east and north to (1092, -3635).
- **The white sand beach** (d2, x -2674..-871, z -1394..-1103) lies west of the harbour. As at Kautoa, the coast is
  widened in white sand.
- **Market 1** (d3, centred near (420, -1580)) is by the harbour on Avenue 1.
  - **VILLAGE HALL** (88, -1398) stands at its west end: the East set's village hall.
  - **MILITARY** (631, -1479) is a small garrison and war-canoe shed by the market.
- **Funerary 1** (d4, centred near (740, -540)) is inland.
- **Avenues 2 and 3** run inland from the harbour and cross near (300, -1000).
- **The iron chain.** Valapo's mountains lie **south-west of the town, 12 to 18 km off**. In the scale model the
  ground there is 700 to 1,130 m over the sea, from about (-5000, 9000) to (-13000, 17000) in the frame.
  1. **An iron mining settlement** stands in the mountains, on an iron node of `kits/resources`. Its grade is the
     owner's call (x1 is the default). It is outside the planner's square, so it is placed on the frame as a world
     record.
  2. **A cart road** runs down to Valapo, about 15 to 20 km.
  3. **A smelter** at Valapo's harbour makes **ingots**, in bloomeries fired with charcoal from the upland forest.
  4. The ingots are **shipped to Kautoa** on the trade route (section 5) and worked there (8a, industry).

### 8c. What each grows, and what they trade

Read from the scale model round each town (the open world's climate, rain and height rasters, land only), then asked
of `kits/crops` (`CROPS.at`, dense air, 1.9 atm):

| | Kautoa's peninsula (24 km round) | Valapo's island |
|---|---|---|
| Climate classes | Af 28%, Aw 39%, XA 26%, BSh 6% | XA 35%, XV 29%, Aw 15%, Am 7%, Af 6% (12 km round) |
| Rain | mean about 2,640 mm (860-3,940) | mean about 1,390 mm near the town (930-2,000) |
| Height over the sea | a plateau of 400-800 m, no higher than about 810 m | lowland by the town; mountains to 1,240 m, a quarter of the land over 700 m |

So Kautoa is the wet one, and Valapo the drier one with real uplands. In `CROPS.at`:
- the wet tropics (Kautoa's Af) grow rice in paddies, and cloves and cacao rain-fed. They do not take sweet potato,
  sugar cane or cotton.
- the subhumid to semiarid tropics (Valapo's lowland) take sugar cane, cotton, sweet potato, sisal and tepary bean
  rain-fed. They grow rice, cacao and cloves only with irrigation.
- coffee's band reaches down to subtropic, and only Valapo's uplands are that cool.

**The comparative advantage (proposed, three crops each):**
- **Kautoa exports cloves, rice and cacao.**
  - Cloves want rain all year (1,500 mm and up, no long dry season): Kautoa's Af.
  - Rice paddies on the wet lowland need no irrigation works there.
  - Cacao is an Af crop.
- **Valapo exports coffee, sugar and iron ingots.** (Salt and soda ash went to Kautoa: the owner chose the north-west
  pan, 2026-10-18.)
  - Upland coffee grows on the mountain slopes, the only cool ground either town has.
  - Sugar cane wants about 1,300 mm or more and a dry season to ripen in: Valapo's XV savanna by the town gets about
    1,340 mm; Kautoa's dry belt only about 900.
  - **Cotton is not an advantage** (corrected 2026-10-18): Kautoa has dry savanna of its own (below), where cotton
    does well on 900 mm. Cotton is grown in both, or becomes the north-west savanna's crop for Kautoa.
- **Both grow** coconut, banana, breadfruit, taro, kava, greens and herbs for themselves (the owner's crop list).
- **What goes back:**
  - Kautoa sends tools and worked iron, cloth dyed with its indigo, sulfur, salt, soda ash or glass, and the goods the
    foreign ships bring;
  - Valapo sends ingots, coffee, sugar and salt fish.

**The rest of the region (a survey of every climate patch and vent, 2026-10-18).** The climate grid is 2 km a cell, so
sizes and centres are rough. Distances are from the town's settlement point.

| Area | Where | What it could give |
|---|---|---|
| Kautoa's dry belt: savanna Aw 784 km2 (~900 mm), abyssal savanna XV 604 km2, hot steppe BSh 212 km2 (~640 mm) | 22, 49 and 81 km north-west of Kautoa | cotton, grazing and buffalo; the reason cotton is not Valapo's |
| Salt pans (XS) | 268 km2 about 71 km north-west of Kautoa (~700 mm); 136 and 64 km2 at 44-50 km south of Valapo | salt in bulk; glasswort and samphire burnt to **soda ash** for **glass and soap**, which neither town makes yet. Valapo's pans are the closer ones to a town |
| Hot steppe in Valapo's mountains (BSh) | 272 km2 about 27 km south-west of Valapo, ~980 mm, 27 C mean (the coolest patch in the region) | the dry side of the mountains by the iron mine: goats, sisal rope, tepary beans |
| Geyser fields | one 6 km west of Kautoa, three more within 35-70 km; Valapo's nearest 27-40 km south and north-west | **sulfur** (a `kits/resources` node) for Kautoa's works, hot baths, heated beds (`CROPS` `heated`) |
| The wettest jungle (XA) | 596 km2 about 41 km east of Kautoa at ~2,750 mm; 716 km2 about 50 km north-east of Valapo at ~2,280 mm | hardwood for Kautoa's shipyards; charcoal for Valapo's smelter |
| The west isle (Af) | 632 km2 about 43 km north-west of Valapo, ~2,100 mm | a third wet producer (spice, cacao, timber): a place for a third settlement |
| North of Kautoa (Aw) | 428 km2 about 61 km north, joined by the neck to beast rider country | grazing, and the riders' mounts and hides along the north highway |

**The salt village is on the big north-west pan, under Kautoa** (owner, 2026-10-18; `core/hamlet/PLAN.md` section 4):
its salt and soda ash make glass and soap Kautoa's trades. The north grazing land suits a ranching village on the
north highway. None of these has a resource placed yet: sulfur at the geyser fields and the pans' `gather.salt` tag
come first (`core/hamlet` H1), before P7 can count them.

P7 (the simulation) puts these crops on the two towns' farms and the trade route, so that the books show each town
short of what the other makes.

## 9. P7: porting Voth's sim layer (plan, 2026-10-18)

**What exists.**
- `core/simulation` (14 fragments, about 160 KB) is the engine: places, actors and the resolver, nav, motion,
  transport routes, the economy (stores, recipes, carts, carriers, imports), items and shops, needs, population,
  stocks, export. It is built through its Phase 5. **Not built yet:** `SIM.settlement()`, stockpiles per settlement,
  the level-of-detail tiers (`77-sim-7-lod.js`), and the three levels in `SCHEMA.md`.
- **Voth's sim layer is a host on that engine**, in `settlements/voth/targets/voth-city/`: `34` transit (and the
  `SIM.init` binding), `42` places, `43` nav, `44` people, `45` items, `46` economy, `47` animals, `56c` the run loop and
  the citizens near the camera, `56d` the inspector, `56e` the stocks id map, and `TUNE.sim` in `15-vc-tune.js`. Every
  one reads Voth's globals (`VC`, `TUNE`, `PLAN`, `SL`); `42` hangs on Voth's interiors (`VC.IX`).
- **The template is Dhelv**, not Voth: `settlements/dhelv/src/74-dhelv-sim.js` (23 KB) declares a whole town on the core
  in one fragment, in the order `SIM.init`, nav layers, places from built kit defs (a key to `[kind, {activity: slots}]`
  table), `SIM.load`, `SIM.populate`, `SIM.check`. Verge's sim (`74-verge-sim.js`) is its own engine and will retire, but
  its way of reading places off core/city records (types and key, capacity from footprint) is the one to copy.
- **The bridge to Voth's keys is `kits/islanders/src/68-is-trades.js` (`IS_TRADES`):** a row per Voth census trade with
  its Voth building key and the Islander West and East keys. `isDims()` gives each def's `types`, `role` and `job`.
- **The city page** (P6, `dist/isle-city.html`, on branch `claude/great-turing-3e145c`, not on main yet): `ISLE.city
  (town)` gives lots with key, kit, class, district and role, the wall, vessels and a trade landing per town;
  `34-isle-census.js` counts residents and jobs. Nothing registers with `SIM` yet. **P7 starts once P6 is on main.**

**The rule for the port: lift the pattern, not the file.** No Voth fragment is copied (they belong to the city-layout
work and are Voth-bound). What is lifted is re-keyed and written as isle fragments; anything general goes into
`core/simulation` or `core/host`, so the next settlement takes it from there.

| From Voth | To the isle demo |
|---|---|
| `34` the `SIM.init` binding, `SIM.transport` shape | `40-isle-sim.js`: the binding; the canoe line in P7c |
| `42` `reg()`: a job's posts become WORK slots | `40-isle-sim.js`: places from `ISLE.city` lots by `ISLE_DIMS` types and job (Dhelv's table shape); no interiors yet, so slots come from the lot's footprint, as Verge does |
| `43` the street half of the pedestrian nav | `41-isle-nav.js`: the nav from core/city's plan ways. If it is generic to any core/city plan, it goes to `core/simulation` (or `core/city`'s drawing side, asked of the city-layout work) instead |
| `44` dealing homes and jobs, rotas, `SIM.needs` | `42-isle-people.js`, trimmed (no slaves, no cantons), dealt per town |
| `45` shops and households | `43-isle-items.js`, the shop map from Islander keys |
| `46` producers, warehouses, carts, carriers | `44-isle-economy.js`, re-keyed through `IS_TRADES`; the isles' crops (8c) as recipes |
| `56c` the run loop (step, catch-up, `SIM.jump`) | to `core/host` as a generic sim clock if it lifts clean, else `57-isle-run.js` |
| `56e` the stocks id map | `58-isle-stocks.js`: lot to place ids; the panel is core/host's `93-host-stocks.js` |
| `TUNE.sim` (hours, needs, items, goods, producers) | `15-isle-tune.js`, re-keyed, the economy tuned here from now on |
| `36` census, `35` steps, `47` animals and the arena, `56d` inspector | **left:** the isle demo has its own census; animals come later; the inspector is core/host's |

**What `core/simulation` needs (P7a, before any town is declared).** Each is opt-in: an unkeyed page is one implicit
settlement, so Voth's stocks proof, `test-sim.js` and the baseline do not move.
1. **A settlement kind:** `SIM.settlement({id, faction})`; a place takes a `settlement`, an actor its home's.
2. **The economy keyed:** `SIM.ECON` holds books, warehouses and carts per settlement; `stockOf`, `emptiest`, `supply`,
   `economyMeal`, `useRate`, `daysOf`, `scanImports` and the cart step take the key. A cart works only its own town.
3. **Population per settlement:** `SIM.populate` and the dealing helpers deal homes and jobs within a town.
4. **Search scoped:** the resolver's nearest-place search looks in the actor's own town first.
5. **Stocks keyed:** `SIM.stocks(s)`, `contents` and `holders` per settlement.
6. **Trade between settlements:** a carrier whose stops are places in two settlements (not map-edge ports; today
   `carry()` needs a port in `from`). Departure buys from the origin's warehouses, arrival lands in the destination's,
   and the books gain **in transit** beside imported and exported. Gated by the factions' `trade` relation.
7. **The three levels in `SCHEMA.md`** (ROADMAP stage 5 asks for these first): record, abstract (places produce and
   consume by the hour, books and routes tick, nobody is posed), presented (near the camera). Then the abstract level
   in code: a town nobody watches steps its books only (`77-sim-7-lod.js`, the planned tiers).
8. **Tests in `test-sim.js`**, each with a negative: two settlements keep separate books; a cart never crosses towns;
   a load leaves one warehouse and lands in the other or is in transit; an unkeyed toy world gives the same results as
   before.

**P7a progress (2026-10-19).** Done in `core/simulation`, opt-in: items 1 (the settlement record and key), 2 (an economy
per settlement: warehouses, sites, recipes, carts, books; the purchases and meals routed by place), 5 (the stocks per
settlement, `SIM.stocks(s)`, `SIM.stocksBy()`), 7 (the three levels written into `SCHEMA.md`) and 8 (seven
two-settlement checks in `test-sim.js`, each with a negative; every older check unchanged).

**P7a done (2026-10-19, second pass).** Items 3, 4 and 6 and the items' holdings, opt-in like the rest:
- 3: a role's `settlement` keeps its actors in that town's homes; work is dealt in the home's town;
  `SIM.populate({settlement})` deals one town at a time.
- 4: the resolver and an errand's seller look in the actor's own town first, then anywhere.
- 6: `core/simulation/77-sim-6-trade.js`, `SIM.trade`: carriers on a timer or as a `SIM.transport` line's vehicles
  (P7c's canoe line plugs in as `line`). Leaving, a load of what the next town wants (its use plus its unmet draws)
  and this one can spare, booked exported; at sea in neither town's stock, shown as `outbound` / `inbound` in the
  stocks rows, and counted against an import; landing in the other's landing, booked imported. Gated by the factions'
  relation (`SIM.trades`). A timer carrier keeps its timetable through a jump (the abstract level, P7d, runs on it).
- The items' holdings: each town's stocks count its own households and people; the item flows come from the items
  module's books by town.
- 23 new checks in `test-sim.js` (211 in all), each with a negative, among them the books balancing in both towns
  with a load at sea, every load shipped = landed + at sea, and rice conserved minute by minute on a line.

**Order of work.**

| Step | What | Proof |
|---|---|---|
| P7a | `core/simulation`: items 1-6 and 8 above; `SCHEMA.md` levels (7, the text) | `node core/simulation/test-sim.js` with the new cases; Voth rebuilt, its stocks proof and baseline row unchanged; Dhelv and Mungo verify unchanged |
| P7b | The isle host, one town at a time (Valapo first, it is smaller): `40`-`44`, `15-isle-tune.js`, the run loop, the stocks map, a few citizens drawn near the camera | `verify.py --assert`: every lot of a census trade is a place, every resident has a home and every worker a job in their own town; the food made, hauled and eaten in each town, with nothing short for a sim day (the Voth `econ_bad` checks, per town) |
| P7c | The canoe line: a drua or oruwa on `SIM.transport` between the two trade landings (`ISLE.city` records them), the trade carrier riding it, the 8c goods in each direction | a load traced from Valapo's warehouse to Kautoa's (and back); each town's books show the other's goods imported; in transit counted while at sea |
| P7d | The abstract level (`77-sim-7-lod.js`, item 7): the town away from the camera ticks books only; the week test (section 7) | a week fast-forwarded with one town watched, then the other: made + imported - exported - consumed = change in each town; every load accounted for; the arrival reconciles |
| P7e | The `sim` export section (section 7's profile): places, actors, stocks per settlement, the route and its books | `EXPORT.check` under the isle profile fails on a stubbed `sim` and passes filled; Godot reads the books after a replayed week (P8) |

**Things the owner decides before P7b:**
- ~~the population to aim for in each town~~ **settled (owner, 2026-10-18): Kautoa about 6,300, Valapo about 2,150.**
  P6's census (4,900 and 1,540) is re-tuned to these. The hinterland villages come on top, at most 500 each
  (`core/hamlet/PLAN.md`);
- whether Valapo's iron mine, the resource nodes (sulfur, salt) and the farm ring outside the planner square are sim
  places in P7 (the economy needs them to make ore, sulfur and salt) or wait for P8's world records. **Proposed
  answer:** they are the hinterland villages of `core/hamlet/PLAN.md` (salt, mine, lumber, ranch; then fishing and
  farming), each a settlement with its town as parent, placed with their resources;
- the canoe line's timetable: how many canoes, and how often (122 km by sea, about a day each way under sail).

**Risk.** The economy keyed by settlement touches every function Voth's economy runs through. P7a must land as its
own commit with Voth's proof re-read, so a regression is caught before any isle code depends on it.

## 10. Core-module compliance (audit, 2026-10-19)

The three pages (`dist/isle-site.html`, `dist/isle-city.html`, `openworld/isle-demo/dist/isle-demo.html`) checked against
every module under `core/` and CLAUDE.md's rules.

**Fixed on 2026-10-19:**
- the open world's page and artifact are written with `newline='\n'` (a Windows build hashed apart from a Linux one);
- `x || d` defaults: `core/hamlet/30` (a box's height), `32-isle-city.js` (a way's width), `88h` (a stand's radius);
- the site shim's seed 0 is no longer turned into 1;
- the city page's orchard trees are records made in the plan (`32-isle-city.js`, from their field's grid cell) and
  registered in `core/tags` under their field; `60-isle-draw.js` only draws them;
- the open world loads `core/atmos/89-atmos-8-export.js` (the export's atmos section can fill);
- both open worlds run on `core/clock` (H4).

**Still open, in order:**
1. **P6b, the export profile: in place (2026-10-19).** The city page embeds `core/export` (07, 09); `KTAGS.page` is the drawn
   town's registry and its ground is bound with `EXPORT.ground`. `verify.py --assert` checks `EXPORT_PROFILE` (`registry,
   materials, terrain`) over `EXPORT_BOX` (Kautoa's ceremonial centre) and reports `EXPORT_TARGET`, section 7's whole
   list (2 of 13 met: `terrain=field` is sampled; `items`, `buckets`, `textures`, `stage` read none; `atmos` empty;
   `city`, `fixtures`, `interiors`, `furniture`, `sim` are stubs). `--profile target` fails on all of them, and
   `--profile registry,materials,terrain,sim` fails on the stub. Each section joins `EXPORT_PROFILE` as it lands.
   **The `city` section** is registered by `core/city` itself since 2026-10-19 (the owner approved the change to the
   city-layout work's file): see section 7, "Where the export case lives".
2. **The city page onto `core/host`** (camera, loop, `KCLOCK`, panel, probe, minimap) instead of its own `CAM`, loop and
   `window._city`: P7's simulation needs the clock.
3. **The city page's sky and sea:** the standard sky and `core/atmos`, the sea on `core/water` (it is a flat colour and a
   plane today).
4. **`terrain = field`:** a `KFIELD` from the extracted heights, which the profile asks for.
5. **Little-demo's shared fragments** (both worlds' hashes move): the sun and atmosphere driven by `HOST.clock.hour`,
   `tags:` passed to `BIO.init` (the flora in `core/tags`), `window.renderer` for the edit queue, the flora's buckets onto
   `core/space`, and the whole engine onto `core/host`.
6. **The site planner** runs on Voth's editor engine read in place (its LCG shim, Voth's textures): ROADMAP section 10.
