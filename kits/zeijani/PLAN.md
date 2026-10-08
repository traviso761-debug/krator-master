# The Zeijani kit and Dhelv: the build plan

*2026-10-07. Written for a new session from the owner's brief (Appendix A, verbatim), the Throne's notes and a survey of
the repo. The culture was first called the Cthonians; the owner renamed it **Zeijani** the same day. Keep this file
current: tick the phases in the progress log at the end.*

## 0. The hand-off prompt

Paste this into the new session:

```
Build the Zeijani kit and their capital, Dhelv, in the Krator repo. The plan is kits/zeijani/PLAN.md: read it whole
first, then what its section 2 lists. Work in a new worktree (section 14, P0). Ask the owner the open questions in
section 11 at the start, and go on with the stated defaults where they don't answer. The texture prompts are in
core/materials/PROMPTS-ready.md ("The Zeijani"): remind the owner of them at the start, so the images arrive while you
build. Commit at the end of every phase, staging only your own files; push to main only when the owner says. Keep the
progress log at the end of the plan current.
```

## 1. What is being built

1. **`kits/zeijani`**, the Zeijani building kit: every building in the owner's manifest (section 6), carved,
   constructed and wooden, with its interiors planned and furnished, on a kit sheet like Scyvoi's. Bundled for worlds as
   `KratorZeijani`.
2. **`core/terrain/39-core-cavern.js`**, a shared underground: voids as signed-distance primitives (tubes, halls,
   galleries, rooms, shafts, trenches), meshed in chunks, writing floors and blockers into `core/walk` as it carves.
   The kit sheet is its first consumer, Dhelv the second.
3. **`settlements/dhelv`**, the capital (a little smaller than Yuni): an outpost in **the kipuka's old-growth forest**,
   a 2 km tube, a braided climbing network, the great hall under its light well, three satellite light wells, the
   cistern hall and the catacombs. Its **rambling pedestrian life layer has one real job: testing the walk map** in
   this underground (section 8).

Later, not here (the kit must already support them): the three cave and tuff villages, the surface hamlets, a Throne
station for Dhelv's country.

Two requirements run through everything (the owner): **`core/furnish`, `core/tags`, `core/materials` and
`kits/interiors` fully integrated** (section 5), and **everything Godot-conscious** (section 9).

## 2. Read first

1. `CLAUDE.md`, `README.md` (the design rules), `INDEX.md`, `VISUAL-BAR.md`; the skill (`painting-to-3d-world.skill`
   is a zip: read `painting-to-3d-world/SKILL.md` inside it).
2. `GODOT-PLAN.md`: section 2 (the four tags), Phase 4 (one exporter), sections 5, 6 (rules for new work) and 7;
   `godot/README.md`.
3. The people: `biomes/throne/NOTES.md`, "Peoples of the island" (their rock, arts, fears, large spaces, vibe, what to
   plumb). The board: `kits/zeijani/refs/` (Appendix B maps it to the manifest).
4. The templates:
   - **Dhelv follows `settlements/verge`** (README, DESIGN, API; `src/71-verge-furnish.js`, `72-verge-buildings.js`,
     `74-verge-sim.js`, `91-verge-probe.js`). It is the newest settlement: it reads every core module, kit and biome
     from home, registers walk floors and blocks as it places, rambles its citizens over a nav graph, and exports
     terrain, place, tags, walk, sim and a golden trace for its Godot twin (`godot/krator/verge_sim.gd`).
   - **The kit follows `kits/scyvoi`** (README "Design rules", API): structure vs furniture, tags and library
     materials from the start, life records.
   - `settlements/shade`: rock-cut halls, a Petra face, cliff dwellings, a caravanserai; the carve patches
     (`core/terrain/36-core-carve.js`) and the bedded strata shader.
   - The Throne's tube station (`biomes/throne/stations/tube/` 45, 47, 84, 86, 90, 91; `src/83-host-heat.js`; its
     entries in `biomes/throne/KNOWN_ISSUES.md`): a lava tube as a swept arch with ledges, per-vertex material weights
     over triplanar library materials, skylight shafts and motes, the lamp that follows the camera, the cave/open fog
     switch, the heat shimmer.
   - The kipuka station (`biomes/throne/stations/kipuka/`, its `station.json`): the old growth is the hyperjungle kit
     read in place; the young lava and its pioneers are the Throne kit's (`src/46-biome-throne-flows.js` lays the flows).
   - Moria in the World Menagerie (`host/WorldMenagerie/src/moria/`: plan, carve, halls, city, deep, walk;
     `tools/make-moria.py`): the plan as data, the carver recording floors and blocks as it carves, the underground drawn
     only when the camera needs it, the map coloured by level, x-ray, hall lights that follow you. **Ideas only:** core
     never references the Menagerie (`tools/check_insulation.py`), and `.ignore` hides it from searches, so name the path.
5. The modules: `core/walk`, `core/simulation` (`SCHEMA.md`, `77-sim-4-nav.js`), `core/sched`, `core/clock`,
   `core/minimap`, `core/rand`, `core/terrain`, `core/tags` (README, `52-core-tags-vocab.js`), `core/furnish` (README),
   `core/sockets` (README, `80-cultures.js`, `38-symbols.js`), `core/materials/record`, `core/materials/PLAN.md` (the
   wiring audit, the prompt template), `kits/interiors/API.md` (all of it), `kits/catalog/README.md`,
   `kits/furniture/SPEC.md`, `kits/fauna/README.md`.

## 3. Rules that bind this build

- Edit only `src/`; pages are rebuilt. Never open `dist/` or the other generated files `CLAUDE.md` lists.
- Deterministic: every draw from `core/rand` (`KRAND` streams, integer hashes; no `Math.random`, no `sin` hashes on the
  CPU), ground height from `core/terrain`, one clock (`core/clock`).
- Placement writes records and drawing reads them. Every placed thing is a `core/tags` record before it is drawn.
- Every probe check has a negative control: a broken input that it must fail.
- A new `core/` module ships with a node test and its first consumer in the same session, plus a GDScript twin when
  Godot must run the same algorithm.
- There is no Node on this machine: node tests run through `tools/node_in_chromium.py`, pages through `verify.py`
  (headless; slow while the GPU is shared).
- Commit from your worktree, staging only your own files (other sessions work in the main checkout). Push to main only
  when the owner says.
- A surface with no good texture: ask the owner (section 10). Never use a silent procedural stand-in.
- Pitfalls met on the Throne:
  - A shader compile error is silent: the mesh just vanishes, so read the console.
  - A `//` comment in a one-line fragment swallows the code after it.
  - Every opening in the rock must be closed by geometry and checked from above. The tube's shafts once showed the void.
  - No trees on cliff faces or through buildings: reserve the flora mask before planting (Verge's 45).
  - The Throne kit's new passes go at the **end** of `THRONE.PASSES`, to keep its PRNG streams.
  - A hidden browser pane stalls the page: take headless shots instead.
  - Big pushes need `http.postBuffer` raised.

## 4. Where things go

| Path | What |
|---|---|
| `kits/zeijani/` | the kit: `src/` (defs and void plans [G data], builders [draw], the sheet host [web]), `build.py`, `verify.py`, `kit_bundle.py` (`KratorZeijani`), `materials.json`, `tex/`, the docs, `PORT.md`. The README, the refs and this plan exist |
| `kits/catalog/krator-master-furniture-zeijani.js` | the Zeijani culture file: their loose pieces |
| `kits/interiors/sets/zeijani.js` | an interior item per kit key; the new room kinds go in `IX.PROGRAMS` |
| `core/tags/52-core-tags-vocab.js` | `'zeijani': 'Zeijani'` in `CULTURE_NAMES`; new jobs in `CATALOG_JOBS` and the catalog's `FURN_JOBS`, together (they mirror each other) |
| `core/sockets/` | `mkCulture({key:'zeijani', ...})` (80), the emblem (38), sign trades for the new shops |
| `core/terrain/39-core-cavern.js`, `test-cavern.js` | the cavern module (section 7) |
| `core/walk/` | a `poly` floor, only if section 8.1 needs it |
| `biomes/throne/src/` | the alecap (wild and cultivated) and the cave crops as species; their passes at the end of `THRONE.PASSES` |
| `settlements/dhelv/` | the capital: its host only; everything else read from home |
| `godot/` | the `dhelv` case, its nav test, the golden replay |

## 5. Integration: the contract

| System | What the kit and Dhelv must do | Checked by |
|---|---|---|
| `core/tags` | Register every def, part, fixture, room, piece of furniture, plant, person and landmark in `KTAGS.page` before drawing it. Each record has a class and kind; culture `zeijani`; `types` from civic, market, shop, tavern, inn, industry, farm, dwelling-single, dwelling-multi, infrastructure, religious, funerary; wealth; `style` (`carved`, `constructed`, `wooden`); `rock` (`tuff`, `basalt`); and `parent` when nested (room, building, district) | `_api.tags().audit` reads zero unknowns (verify asserts it); negative: a bogus culture fails; `core/tags/test-tags.js` after the vocabulary change |
| `core/furnish` | One `KFURN.create` per page, as Verge's 71 (`catalog: KFURN.catalogOf(KratorFurniture)`, `interiors: KratorInteriors`, `tags: KTAGS.page`), drawn by the catalog's batch (`KFURN.useBatch`). The deep interiors are data first: records plus a camera-independent baked index (Mav's Refuge's `bake_interiors.py`), drawn near the camera only (Verge's `?furnishR`). Carved-in-place benches, beds, shelves and niches are structure (fixtures), never furniture | `core/furnish/test-furnish.js`; a furniture budget (`{drawCalls, triangles}`, as Girder's palette); `core/furnish/fingerprint.py` once Dhelv joins the furnished builds |
| `kits/catalog` | The culture file in the SPEC shape (6.6), reusing the generic files. Each piece carries `job`, `role`, its tags, and its lights as data | `kits/catalog/build.py`, `verify.py --assert`, `tools/textures/audit_catalog.js` |
| `kits/interiors` | An item per kit key in `sets/zeijani.js`. Carved rooms are `ROOM()` polygons (rounded: `IX.sets.shape` circle or ell) whose walls are rock; constructed ones are `IX.planBuilding` plans. Carved furniture and stairs go in as `fixtures`. Movement inside is `IX.life` | `IX.sets.auditResidence` (every dwelling unit has beds, food and items); `IX.life.audit` returns [] for every building; the plans export through `IX.exportBuilding` and `IX.exportPlan` |
| `core/materials` | A `materials.json` for the kit and one for Dhelv, packed by `tools/textures/pack.py <build>` into `tex/` (committed), read through `KMAT` and `TEX` (`window._materials`). Catalog furniture takes library detail maps (`furniture_bundle.bundle(..., tex=True)`) with Zeijani `f_<family>` rows. The interiors kit has no adapter of its own, so the room shells take the kit's families | `python3 tools/textures/audit_wiring.py` lists both builds as wired, with every family resolving to a delivered set |
| `core/walk` | Every floor, stair, ramp, bridge and blocker registered as it is carved or placed | section 8 |
| `core/sockets` | Signs, banners, awnings and emblems as sockets: one sign per shop type, the same on its carved and its constructed front | the sockets per def; every trade resolves |
| `core/simulation`, `core/sched`, `core/clock` | Factions, roles, places, schedules and routes as data | section 8 |
| `core/atmos` | Dhelv's sky and weather (the Throne's), so they port to the Atmos autoload | the atmosphere export |
| `core/minimap` | The walk map, by level | section 8 |
| `kits/fauna` | The herders' cattle at the outpost; bats in the old tubes | each with a life record |

## 6. The kit

### 6.1 Rock, finish and colour

- **Tuff, not tufa (to confirm).** The owner wrote "tufa"; the notes make the Throne's ash flows **tuff** (welded
  ignimbrite), Cappadocia's rock. Tufa is a spring limestone (`stone.travertine.tufa` exists). The default is tuff.
- **Two host rocks.** Tuff (cream to rose; soft: the spires and the galleries) and basalt (the tubes).
- **A carved surface takes its host rock's colour, with a finish by wealth:** hewn (rows of pick marks: poor),
  plastered and painted (middle), polished (wealthy and civic: the colour deepens, with a satin sheen). The finish is a
  material over the rock's colour, not a new colour.
- **The tubes' colour comes from Raufarhólshellir** (the owner's references, 2026-10-07).
  - Walls below the flow ledges keep the glazed **lining**: dense blue-grey basalt in thin horizontal flow bands with
    silvery lips.
  - Where the lining has spalled (the ceilings, the upper walls, the fallen blocks), the **breakdown** is angular,
    jointed and oxidised:
    - mostly deep red, rose pink, rust and mauve;
    - patches of magenta-purple, blue-violet and teal;
    - specks of sulphur yellow, and white mineral crusts in the cracks.
  - The cavern module writes these as per-vertex material weights (section 7):
    - lining, by height below the upper ledge;
    - breakdown, on down-facing and upper surfaces;
    - the rare colours, from a seeded low-frequency field;
    - white crusts, along the drip lines; yellow, near heat.
  - The textures carry the small detail (`rock.basalt.flowbanded`, `rock.basalt.oxidised`, section 10); the weights
    carry the large patches.
- **Polished oxide is prized.** Where the Zeijani polish oxidised basalt it shows deep red and purple: the wealthy have
  "red rooms", while the poor galleries in tuff are cream. Their mural pigments are the cave's oxides and the alecap's
  purple.
- **Light that shows it.** The photographs are lit white at raking angles, so keep the key light near white: daylight
  from the wells, warm-white oil lamps. Glow fungus is an accent; as the main light its teal would turn the reds to mud.

### 6.2 Form and ornament

- Dwellings are rounded: domes, corbelled vaults, round rooms and doorways.
- Civic buildings are larger and blockier.
- Wealthy and civic surfaces are ornate: relief, labyrinth carving, pierced lattice.
- Constructed buildings are tuff ashlar or basalt block.
- Wooden ones use the kipuka's timber (log, plank, thatch), with raised floors in the wet.
- The sources (the owner's):

  | Source | What to take |
  |---|---|
  | fantasy dwarves | mass, deep lintels, banded geometry |
  | the Pueblo and the kiva | stepped terraces, ladders, roof hatches, masked spirit figures |
  | the Ashlanders | shell domes, bone, chitin |
  | Cappadocia | rock-cut rooms, dovecote fronts, painted vaults |
  | Petra | columned fronts |
  | Ethiopia | monoliths, trench churches, Aksum's stepped stelae |
  | Varanasi | ghats, lanes, shrines everywhere |
  | Babylon | glazed relief brick, ziggurat massing, hanging gardens |

- **Katsina (kachina) figures are sacred to the Hopi and other Pueblo peoples.** Use the style (tablita headdresses,
  cloud terraces, rain lines, ruffs, masks) and invent the Zeijani's own spirits; never copy real katsinam. A proposal:
  the Hidden Ones (ancestors in the deep), the Lamp Mother (glow fungus) and the Serpent (the lava).

### 6.3 How a carved building works

A carved def has two parts, both in the building's own frame:

- **The front:** geometry on the rock face (relief, portal, steps, sockets).
- **The void plan:**
  - rooms as `ROOM()`-shaped records: polygon, floor y, clear height, a ceiling profile (flat, vault or dome) and doors;
  - corridors and stairs as strips;
  - the carved fixtures.

**The void plan is the one source.** The cavern module carves it; `core/walk` takes its floors and blocks;
`kits/interiors` furnishes its rooms; `core/tags` records it. So rock, floors, furniture and tags cannot disagree.

The plan goes into the hill behind the front. It must keep a minimum thickness of rock to the outside and to every
other building's voids (section 7's check).

On the kit sheet, a carved def stands in a block of its host rock, front forward. The cut-away (C) opens the rock to
show the plan. Constructed and wooden defs are ordinary builders with `IX.planBuilding` interiors.

### 6.4 The manifest as defs

Keys take the prefix `zj_`. The "Where" column: **H** hub, **S** satellite, **O** outpost, **V** village, **h** hamlet.

**Dwellings**

| Key | What | Style | Interior | Where |
|---|---|---|---|---|
| `zj_hut_a`, `_b`, `_c` | three poor huts: a round wattle hut on low stilts with a conical thatch (69fa…, 6944…); an oval plank hut with a steep thatch and a porch; a lean-to against a rock face with a carved back room | wooden | `cottage` | O, h, V |
| `zj_house_wood` | middle class: round, two rooms and a loft, a ribbed round door (fef0…) | wooden | `living`, `bedroom` | O, h, V |
| `zj_gallery_a`, `_b` | poor galleries (Cappadocian apartments going deep). A front with steps and a lamp niche opens on one of two plans: (a) a spine, a descending corridor with cells either side over 2 to 4 levels; (b) a well, a round shaft with a spiral stair and rings of cells on 3 to 5 levels. Cells have 1 or 2 rooms (bed niche, hearth, water jar). Shared rooms: a hearth hall, a cistern, a kiva. Air and light shafts; 12 to 40 units each (2da8…, b719…, 75f7…) | carved | `cell` and shared rooms | O (2), S, H's edges, V |
| `zj_estate_a`, `_b` | wealthy carved estates. An ornate relief front (columns, a stepped lintel, a frieze) opens on a pillared reception hall. Behind it: a court under its own light shaft, family rooms, a kitchen, stores, a household shrine, servants' cells and a cistern; 8 to 20 rooms (6159…, d117…, cliff.jpg) | carved, polished | many | H's walls |
| `zj_house_built_poor`, `_mid`, `_rich` | constructed: a one-room dome of tuff blocks with a smoke hole; two or three domes round a small yard; a two-storey domed house with relief and a roof terrace (6472…, d35e…, 8261…) | constructed | `cottage`; `living` and `bedroom`; `planBuilding` | V, S |

**Shops**

Each type has one interior and one sign, shared by its two fronts (`zj_shop_<type>_carved` and `_built`):

- the carved front: a shopfront cut in a wall, with a counter sill, shutters and a sign niche;
- the constructed front: a small dome or flat-roofed block with an awning.

The types:

- **The owner's five:** weapons, armour, general, food, alchemist.
- **Five more (a proposal):**
  - **lampwright:** glow-fungus and oil lamps, the city's light;
  - **stonecutter:** the mason's yard, the trade that made the city;
  - **dyer:** alecap-purple yarn and cloth, looms;
  - **potter:** water jars, the brewery's crocks;
  - **leatherworker:** the herders' hides made into armour, packs and boots.
- **Alternatives:** an obsidian knapper and mirror-maker; a rope and caving outfitter for the scouts.

The alchemist's shop sells. The fungal alchemist (below) grows and distils.

**Civic, sacred and works**

| Key | What | Where |
|---|---|---|
| `zj_townhall` | built into a rock spire (a fairy chimney), Cappadocian, ornately carved and blocky: a council room, the records, a lookout at the top (1224e…, b82b…, 6cf9…, 1990…) | V |
| `zj_warehouse`, `zj_granary` | constructed; the granary conical, like the Dogon's and the board's 77c8… towers | V, h |
| `zj_store_tunnel` | the capital's stores: a side tunnel walled off. The wall and door are the building; the stores are the rooms behind | H, S |
| `zj_farm_yam`, `zj_farm_veg` | surface plots: terraces on the light wells' floors; clearings at the outpost and the hamlets | S, O, h |
| `zj_farm_alecap` | underground beds in dark tunnels: compost and dung beds in low stone kerbs, spawn racks, water channels, still damp air | S, H |
| `zj_farmhouse_wood`, `_carved` | farmhouses | h, V, S |
| `zj_brewery` | carved: mash vats, fermenting crocks in a cool cellar, a cooperage, a taproom front | H, V |
| `zj_guardpost` | the village guard post | V |
| `zj_barracks_carved` | the capital's barracks, carved, its entrance in the hall wall | H |
| `zj_guard_hq` | the guard headquarters on the square: constructed, blocky | H |
| `zj_barracks_outpost` | the outpost's barracks, timber and stone | O |
| `zj_watchtower` | watchtowers | O, V |
| `zj_scout_hq` | the scouts' headquarters, like the board's *temple tower* (a glowing pierced tower): maps, rope, the secret ways | H or O |
| `zj_lab` | the fungal alchemist, carved: dark spawn rooms, drying racks, stills and retorts, a glow-culture room, sealed jars | H, S |
| `zj_smithy` | a forge, anvil, bellows and quench trough, with a smoke shaft to the surface | S, V |
| `zj_kiva` | the shrine: a sunken round room with a bench ring, a roof hatch and ladder, a hearth and deflector, a ventilator, the sipapu (a small hole in the floor: the way to the deeper world), and murals. **A large incense burner built into it** (the owner, 2026-10-07): in certain ceremonies **Ranj**, the spice (its red resin, `biomes/throne/NOTES.md`, "The spice: Ranj"), is burned as incense and its smoke breathed in. Carved structure, not furniture: a raised stone burner beside the hearth and deflector, its smoke hood and flue joined to the ventilator; its glow and smoke are light and effect records. Several per district | everywhere |
| `zj_temple` | the main temple. The massing of *temple_massing* (a great dome over smaller domes) and the ornament of *temple-body* (a pierced lattice dome on an ornate base), cut from one rock like Ellora's **Kailasa**: a monolith left standing in a pit cut round it, the pit's walls cut into cloisters. Lit inside, so the lattice glows (*temple tower*) | H |
| `zj_council` | the council chamber, an Ethiopian rock church (**Lalibela**: a monolith in a trench, reached by a stair or tunnel), carved all over like 066f9f… (labyrinth relief, stairs, stone lanterns) | H |
| `zj_cistern` | the cistern hall: pillars over still water, flights of steps down like a stepwell (Chand Baori; Varanasi's ghats underground), drip channels feeding it, a causeway | H |
| `zj_portal` | the capital's entrance, like 065e907… (a giant arched portal in a cliff with terraced dwellings beside it) but with a more ornate rim; a rolling stone door inside | O |
| `zj_caravanserai` | like 12235061… (a tall tower over a colonnaded half-round court with pools and a waterfall): rooms, a stable yard and stores, on the kipuka's stream | O |
| `zj_tavern`, `zj_inn` | each in a carved and a constructed variant | H, S, O, V |
| `zj_muster` | the mustering ground: a levelled floor, a dais, weapon racks, a standard | H |
| `zj_stall_a`, `_b` | market stalls: (a) a niche cut in a wall, with a counter, shutter and lamp; (b) a free-standing frame with a felt or hide awning, or a fungus-cap canopy | H, S, O |
| `zj_catacomb` | the funeral catacombs: corridors of loculi in tiers, ossuary chambers, mummy shelves (the Guanches laid their dead in lava-tube caves), lamp niches, a mortuary chapel, the Keepers' rooms | deep |
| `zj_palisade`, `zj_gate` | the outpost's palisade and gate, in kipuka timber | O |
| additions (section 13) | `zj_vent` (an air-shaft head), `zj_stonedoor` (a rolling stone door), `zj_roost` (a bat roost, for guano), `zj_dovecote`, `zj_bath` (a hot-spring bath), `zj_mirror` (a light-well reflector), `zj_niche` (an ancestor niche), `zj_signal` (a horn and lamp station) | |

### 6.5 The kit sheet

As Scyvoi's, with the standard sky and rows by family:

- dwellings; galleries and estates;
- shops, in carved and built pairs;
- civic; sacred;
- works and farms;
- the guard and the outpost; the stalls; the additions.

Tools: Inspector (T), Cut-away (C), Night (N), Polygon (P), and Walk (F), which walks the `core/walk` floors into the
carved interiors. URL options: `?only=`, `?t=`, `?mat=proc`, `?furniture=0`.

The sheet exports its defs, tags, void plans, interiors, furniture and walk floors. (GODOT-PLAN rule 10: a build
without an export is not finished.)

### 6.6 The catalog culture file

Loose pieces only, in the SPEC shape: about 60 to 90, reusing the generic containers, food, drink and supplies.

| Group | Pieces |
|---|---|
| home | stools and benches (wood, stone); sleeping fleeces and mats for the carved bed shelves; chests; water jars (olla) |
| brewing and fungi | fermenting crocks and mash tuns; ladles and strainers; alecap spawn racks and drying trays |
| the alchemist | stills, retorts, mortars, specimen jars, glow-culture vessels |
| light | lamps, glow-fungus and oil, with their lights as data |
| crafts | mealing bins with grinding stones; an upright loom; dye vats; a potter's wheel; the smith's set |
| arms | weapon and armour racks |
| the sacred | ancestor figurines and spirit masks, prayer sticks, the kiva ladder, drums, staffs |
| the dead | ossuary boxes and mummy bundles, funerary lamps |
| the scouts | maps and rope |

## 7. The cavern module (`core/terrain/39-core-cavern.js`)

[G data]: no THREE, no DOM; node-tested; chunked.

- **Primitives (records):**

  | Primitive | Shape |
  |---|---|
  | `tube` | a centreline with an arched section and ledges, as the tube station's `makeTube` and `TUBEX` |
  | `hall` | a bottle or ellipsoid with a throat |
  | `room` | an extruded polygon with a ceiling profile and a corner radius |
  | `shaft` | a cylinder, or a light well's flared throat |
  | `stair` | a swept box between two points |
  | `trench` | a pit cut down from a floor (Kailasa, Lalibela) |
  | `monolith` | rock kept standing inside a void |

- **The field:** rock is below the terrain surface and outside every void. Tubes and halls join by a smooth minimum at
  braided junctions (a radius per junction); rooms join hard.
- **Meshing:**
  - Surface nets per chunk: lift and generalise the carve module's (`36-core-carve.js`).
  - Only in the band near the voids, with finer cells near rooms (0.5 m) than in tubes (1 m).
  - Vertices carry the material weights (6.1) and an occlusion term.
  - Where a void breaks the surface (the light wells, the portal), the terrain mesh gets a real hole and a rim: geometry,
    not a shader discard.
- **Floors come from the plan, not from the mesh:**
  - halls and rooms are level floors;
  - tubes, ramps and stairs are strips (the 0.6 m step rule);
  - carved fixtures are blocks.
  - All of them are written to `core/walk` as the plan is carved.
- **Queries:** `sdf(x,y,z)`, `inRock`, `ceilingAt(x,z,y)` (headroom), the thickness between two voids.
- **Export:** the plan as `krator-cavern` JSON; the chunk meshes through the build's exporter.
- **Tests (`test-cavern.js`), each with a negative control:**
  - determinism (a hash of the meshes);
  - watertight chunks with matching seams;
  - the walk floors within 0.15 m of the meshed floor;
  - rock at least 0.8 m thick (tunable) between different buildings' voids, and to the outside;
  - no void open to the sky except at a declared opening.
- **GDScript twin:** not needed to draw, since the meshes export. Write `cavern.gd` (the `sdf` query) only if Godot
  needs digging or exact collision; otherwise collision is a trimesh of the meshes plus `walk.json`'s blocks.

## 8. The walk map and the ramblers

The owner: "build rambling pedestrian life layer, but mostly to test the walk map in this complex underground space".
The checks are the point; the people make the walk map visible.

### 8.1 The walk map

- **One source.** `core/walk` and the nav graph are both written from the plan the cavern module carves, as it carves
  (Moria's pattern; Verge does the same for its streets). Nothing reads the mesh to guess the floor.
- **Floor shapes.** `core/walk` has level rects and straight strips. If the rounded carved floors need too many rects,
  add a **`poly` floor** to `core/walk` (a convex polygon with a height per vertex) with its node test. Godot's
  `NavigationMesh` takes exactly that (vertices and polygons), so `walk.json` maps one to one.
- **No floor within a step is rock, never a fall.** The walker (F) and every check treat it as blocked. Every change
  of level is a strip: a stair, a ramp or a ladder.
- **Levels.** The hub's second level stands over the square, tunnels cross over tunnels in the braid, and cells stack
  over cells. `SIM.nav.nearest` (core/simulation) and Verge's `nearestSeg` search x and z only, so in Dhelv a point can
  find a passage on the wrong level. Every lookup takes y (find the floor with `KWALK.floorBelow`, then the node on that
  floor's passage), or passes the node itself.
- **Layers.** `pedestrian` (the public ways) and `interior` (`IX.life`, in each building), joined at street doors (one
  node on both). Edges carry:
  - a zone (`outer`: where foreigners may go);
  - a width (for a porter or a herd);
  - doors that close (the rolling stone doors, on a schedule from `core/sched`).
- **The map.** `core/minimap` draws the walk map: `KMAP.fromWalk(W, colourOf(y))` draws every floor of a `KWALK`
  registry, coloured by its height, as Moria's map is coloured by level. Add, in the host, a level picker and the
  walkers as dots.

### 8.2 The ramblers

- **As Verge's citizens** (`74-verge-sim.js`, "the citizens (rambling pedestrians)"):
  - each has a home and a role with a 24-hour schedule (`core/sched`);
  - each chooses its next walk when the last one ends, from its own `KRAND` stream, and the choice is logged;
  - a walk is a path walked as a function of time, so the page and Godot compute the same poses (Verge's `memberPose`;
    `godot/krator/verge_sim.gd`).
- **Roles (a proposal):** brewer, alecap farmer, yam farmer, forager, herder (the outpost), stonecutter, smith,
  alchemist, lampwright, shopkeeper, guard, scout, Keeper of the Dead, priest, child, elder, labourer; and foreign
  traders (ash nomads: outer zone only).
- **Factions:** the Zeijani, with guilds and clans as sub-factions (the Scouts, the Brewers, the Alchemists, the
  Stonecutters, the Keepers, the outpost's foragers and herders); and the foreigners.
- **Groups that try the hard routes:**
  - a scout patrol from the scout headquarters through the braid to a secret exit and back;
  - a funeral procession from a satellite down to the catacombs;
  - porters between the store tunnels and the satellites' farms;
  - the guard changing at the stone door;
  - children who wander anywhere they can reach.
- **Numbers (to confirm):** about 5,000 people, with 600 to 900 out at any hour: enough to cover every district.
- **Bodies are simple:** an instanced pool like Verge's `77-verge-rigs.js`. The look can wait.

### 8.3 The checks, each with its negative control

| # | Check | Negative control |
|---|---|---|
| 1 | Every nav node stands on a walk floor (within 0.1 m) | a node moved 2 m into the rock |
| 2 | Every nav edge is walkable, sampled every 0.5 m: a floor within a step of the line, no block within the walker's radius, and at least 2.0 m of headroom (`ceilingAt`) | an edge through a pillar; an edge under a low lintel |
| 3 | Every place (doors, stalls, rooms with beds, farm plots, the catacombs' chapel) is reachable from the outpost gate, under the rules | one tunnel cut: the places past it must show unreachable |
| 4 | Stacked lookups: a point between two stacked passages finds the right one at each y | the y swapped |
| 5 | A day's run at fixed steps. Every sampled pose stands on a floor (`floorBelow` within 0.6 m), outside every block (`blocked` is null) and out of the rock (`sdf` more than the walker's radius). No `routeFail`; no walker stuck; stairs and ramps used; every district visited | a walker planted off the floor; one planted inside a pillar |
| 6 | Rules: no foreigner leaves the `outer` zone; no route crosses a closed door | a foreign route planted through the gate |
| 7 | Door transit into carved apartments goes through `IX.life` (`IX.life.audit` returns []) | |
| 8 | The golden trace (poses at fixed times) replays in Godot (`godot/tests/dhelv/`, as Verge's) | |

The page shows the failures:

- failing edges drawn red;
- a walker's path on click, and follow a walker;
- URL options `?walkers=N`, `?hour=`, `?time=run`, `?level=`.

## 9. Godot-conscious, concretely

- **Tags.** Every fragment, and every top-level function in a big one, gets one of [G data], [G shader], [G native] or
  [web], and [draw] for builders. Keep a `PORT.md` per build through `tools/audit_port.py`. `build.py` runs
  `tools/check_port.py` first: [G data] must not touch the browser.
- **[G data]:** defs and void plans, the cavern plan and field, the layout, placements, tags, the walk registry, the nav
  graph, schedules, roles and factions, furniture records, interior plans, light records and material records. All pure,
  node-tested and exported.
- **[draw]:** builders draw records and decide nothing. Where a thing goes, and what it is, belong to a placement pass.
- **[G shader]:** each named in `PORT.md` with its twin:
  - the cavern's material blend: per-vertex weights with triplanar sampling, one shared `.gdshader` (the tube
    station's), or StandardMaterial3D's `uv1_triplanar` where a single material will do;
  - the heat shimmer (`83-host-heat.js`: `hint_screen_texture`, `hint_depth_texture`).
- **[G native]:** light shafts (volumetric fog and a FogVolume), occlusion (the rock as occluders), LOD, lights fading
  with distance, collision from meshes, walk mode.
- **[web]:** the sheet, the camera, the inspector, the probe, the minimap panel and the debug views.
- **Exports** (`verify.py --export ../../godot/data/<build>`: Verge's list, plus the underground):
  - `terrain.json` (the surface heightfield);
  - `cavern.json` and the chunk meshes;
  - `place.json`, `tags.json`, `walk.json`, `sim.json`, `golden.json`;
  - the furniture (pieces by look, and placements);
  - the interiors (`IX.exportBuilding`, `IX.exportPlan`);
  - the lights;
  - the material table (`tex/pack.json` and `materials.json`, read by `godot/krator/kmat.gd`);
  - the atmosphere.
- **A `dhelv` case** in `godot/spike.gd` builds stand-ins from these, with a `NavigationAgent3D` walking from the gate
  to the temple through the braid (the walk export is the navmesh source).
- **Lights are records** (position, colour, range, flicker, owner).
  - The preview moves a fixed pool of point lights to the nearest records (the interiors demo; the tube station's camera
    lamp).
  - Godot makes an OmniLight3D per record with distance fade, and VoxelGI or SDFGI underground (say so in `PORT.md`).
- **Textures** are library sets. No canvas painters; if one is unavoidable, bake it to PNG.
- **Determinism across engines:** integer hashes from `core/rand`; nothing on the CPU from `Math.sin` hashes.
- **Draw only what the camera can see.** Underground, hide the surface's flora except near the wells and the portal; on
  the surface, hide the underground except near its openings (Moria's rule; the tube station's fog switch). In Godot
  this is occlusion culling and visibility ranges, so the switch is [web].

## 10. Textures

**Where the prompts are.** The paste-ready prompts are in **`core/materials/PROMPTS-ready.md`, "Open prompts", "The
Zeijani"**. The owner pastes them; the images come back as WebP or PNG (in Downloads, or pasted).

**Processing a delivery:**

1. `tools/textures/process.py --batch` (seamless) and `tools/textures/cards.py --batch` (key #ff00ff), into
   `core/materials/library/<id>` and `core/materials/patterns/zeijani/`.
2. A batch file in `tools/textures/batches/`.
3. The rows in `core/materials/PLAN.md` ("Prompts for generated sources": a Zeijani section).
4. `materials.json`, then `pack.py`.
5. Prune each prompt as it arrives, and list it under "Delivered".

**The palette (a proposal; the owner to confirm):**

| Group | Colours |
|---|---|
| tuff | #d9c8a6; rose #c9a28c |
| basalt | blue-grey #5c6672; dark #2b2e34; lining silver #aab4c0 |
| the oxides | red #9a3a3c, rose #c06a74, rust #b4602e, mauve #9a6a86, magenta-purple #74406e, blue-violet #4a4e8a, teal #4a9490, sulphur #d6c25a, mineral white #dcd8d0 |
| the alecap | purple #5e3470; lilac #9a78ac |
| pigments and metal | cinnabar #a23a2a, ochre #c49a4a, turquoise #3f8f88, soot #221e1c, bone #e8e0cc, copper #a8683a |
| glow (emissive only) | #8fe8c8 |

| New id | For | Tile | Why no existing set |
|---|---|---|---|
| `rock.tuff` | raw tuff: the spires, the cliffs, the galleries' fronts | 3 m | none (`stone.pumice` is pumice; `stone.travertine.tufa` is limestone) |
| `stone.tuff.hewn` | the poor carved rooms and passages | 1.5 m | none |
| `stone.tuff.polished` | wealthy and civic tuff | 2 m | none |
| `stone.basalt.polished` | polished basalt in the tubes and the hub | 1.5 m | none (`rock.basalt.vesicular` is raw) |
| `rock.basalt.flowbanded` | the tubes' linings (Raufarhólshellir) | 2 m | none |
| `rock.basalt.oxidised` | the breakdown ceilings and blocks (Raufarhólshellir) | 3 m | none |
| `bone.ossuary` | the catacombs' ossuary walls | 1.5 m | `bone.skull` is one skull's surface |
| `patterns/zeijani/labyrinth-relief` | the council chamber and civic fronts (066f9f…) | 1.2 m | |
| `patterns/zeijani/frieze-spirits` | wealthy fronts, the temple's base | a 0.6 m band | |
| `patterns/zeijani/kiva-mural` | kiva and shrine walls | a 1.5 m band | |
| `patterns/zeijani/textile` | blankets, awnings, banners, cushions | 1 m | |
| `patterns/zeijani/glazed-frieze` | the portal's rim, the temple's way (Babylon) | a 1.2 m band | |
| `patterns/zeijani/jali` | the temple's pierced dome and screens (a cut-out) | 1 m | |
| `card.mushroom.alecap` | the alecap, in beds and wild | a card | `card.mushroom.alien` and `.glow` are other fungi |
| `card.crop.yam` | yam vines on stakes (optional: try `card.vine` and `card.crop` first) | a card | |

**Reused, so no prompt:**

| For | Existing sets |
|---|---|
| the alecap's cap surface | `organic.fungus.cap` tinted #5e3470 (a new set only if it does not read) |
| glow fungus | `card.mushroom.glow`, `ground.mushroom.glow`, `card.shelf.glow` |
| wild cave fungi | `organic.fungus.*`, `card.fungus.*` |
| plaster | `plaster`, `plaster.white_stucco_02`, `plaster.ochre` |
| earth floors | `earth.floor.packed`, `earth.rammed`, `earth.adobe` |
| timber and thatch | `wood.log.carved`, `wood.timber`, `wood.carved`, `wood.weathered_brown_planks`, `roof.thatch` |
| raw basalt | `rock.basalt.vesicular`, `rock.columnar`, the tube station's sets |
| paving | `paving.flagstone`, `stone.cut` |
| bone and horn | `bone.*`, `organic.bone` |
| ceramics | `ceramic.terracotta`, `ceramic.glaze` |
| cloth and hide | `cloth.felt`, `hide.leather*` |
| the kipuka | the hyperjungle's and the Throne's packs |

If the owner means tufa, skip the three tuff prompts and use `stone.travertine.tufa`.

## 11. Open questions for the owner

Ask them at the start; the default is in brackets. AskUserQuestion takes four at a time, so ask 1 to 4 first.

1. **Tuff or tufa?** [tuff]
2. **The great hall's size.** Þríhnúkagígur's floor is about 50 × 70 m, and the square's list needs about four times
   that. [a bottle about 200 × 140 m at the floor, 60 to 70 m up to a throat 25 to 35 m across, the second level about
   18 m up]
3. **What lies over the city?** [the young lava that made the kipuka: the wells open as collapse pits in a bare flow,
   hidden in plain sight; only the outpost is in the old growth]
4. **Population and walkers.** [about 5,000; 600 to 900 out at any hour]
5. The palette (section 10). [as proposed]
6. The emblem. [a spiral sinking into a stepped arch: the way in]
7. The spirits. [invented, katsina-style, no real katsinam: the Hidden Ones, the Lamp Mother, the Serpent]
8. The alecap as a Throne kit species, wild in caves and cultivated in beds, placed by the kit's passes in Dhelv's farm
   plots, so it ports like any flora. [yes]
9. The cattle from `kits/fauna`, with a breed added there if none fits. [yes]
10. The five extra shops (6.4) and the additions (section 13). [as proposed]

**The owner's answers (2026-10-07, at P0).** 1 tuff. 2 the 200 × 140 m bottle as proposed. 3 young lava over the city.
4 about 5,000, with 600 to 900 out. 5 the palette as proposed. 6 the spiral into a stepped arch. 7 the Hidden Ones, the
Lamp Mother, the Serpent. 8 the alecap a Throne species. 9 **regular cattle from `kits/fauna`, and also an invented
rideable staghorn beetle** (derived from the fauna kit's giant beetle), ridden by the herders and scouts. 10 the five
extra shops, the additions, **and both alternatives** (the obsidian knapper and mirror-maker; the rope and caving
outfitter): twelve shop types in all.

**The texture delivery (2026-10-07, `Downloads/zeijani.zip`, 22 images).** Everything in section 10 arrived except
`stone.tuff.hewn` (its prompt stays open). Extras: two more spirit friezes and a skeleton frieze (the catacombs), two
more kiva murals, a second textile, and two more glazed friezes (a dragonfly and a stag beetle).

## 12. Dhelv: the layout

A proposal; tune the numbers. x east, z south, y up, metres; the flank rises east, toward the summit. The layout is
data (`41-dhelv-layout.js`, [G data]) with a node test (`tests/test-layout.js`).

- **The outpost, in the kipuka:**
  - the old growth (the hyperjungle, Girder-tall) round a clearing on one of the kipuka's streams;
  - **the portal**, in the cliff of an old cone (a kipuka core that the young flows went round), with terraced dwellings
    beside it (065e…);
  - **the caravanserai** on the stream, which feeds its pools and waterfall (1223…);
  - the palisade and gate;
  - two to four **watchtowers**, on the cliff's shoulders and at the forest's edge facing the lava (the way in);
  - the outer barracks;
  - a handful of wooden and carved dwellings for the foragers, farmers and herders;
  - **two gallery entrances** (poor apartments);
  - the herders' pasture at the kipuka's edge.

  Foreigners go no further.
- **The outer tube:**
  - runs 2 km east, climbing 1 to 3%, 8 to 12 m wide;
  - side caves near the outpost serve as stores and stables;
  - **the rolling stone door** at its inner end marks the end of the outer zone.
- **The braid:** tubes 4 to 10 m wide that branch and rejoin (lava tubes braid on gentle slopes). It climbs 30 to 40 m
  over about 500 m by ramps and stairs, with two or three levels where tubes cross.
- **The hub:** the great hall, a bottle whose throat is the light well.
  - On the square: the council chamber in its trench; the main temple in its pit; constructed shops; the guard
    headquarters; the mustering ground; market stalls in the pool of daylight.
  - In the walls: the brewery and the fungal alchemist (carved, with their fronts on the square); the carved barracks'
    entrance; the wealthy estates' entrances.
  - The second level, a ledge round much of the hall, leads to more tunnels.
  - **Wealth falls with the distance from the square** along the graph (a rule in data).
- **The satellites (three):** smaller wells 250 to 450 m from the hub along the braid.
  - Open pits 60 to 90 m across and 25 to 40 m deep.
  - Their floors terraced for yams and vegetables (Moray's rings; Babylon's hanging gardens down the walls), watered
    from the cisterns.
  - In their walls: galleries of poor apartments, middle-class homes, the store tunnels and the granary, shops, a tavern
    and a small smithy.
  - In the tunnels round them: fungus harvesting and the alecap farms.
- **The cistern hall,** near the hub: fed by drip channels, with stepwell flights down to the water.
- **The catacombs:**
  - two to three times the satellites' distance from the hub (600 to 1,200 m), and deeper (40 to 80 m below the square);
  - reached down a processional stair;
  - the Keepers' rooms at their head.
- **Secret ways:** scout exits to the surface (in the lava field, in the forest), on the scouts' routes only (data).
- **The checks** (`test-layout.js`, then the probe):
  - the graph is connected;
  - the square holds its list with room to walk;
  - wealth falls monotonically by district;
  - the catacombs keep their distance and depth;
  - each satellite has its list, and the outpost has its list;
  - the foreigners' zone ends at the stone door.

## 13. What I would add

Proposals; the owner picks.

1. **Air.** Ventilation shafts as at Derinkuyu, their heads hidden in the forest and the lava field. The deep levels'
   air is kept moving, with a sentinel that sickens before a person does (a caged animal, or a flame kept at knee
   height).
2. **Rolling stone doors** (Derinkuyu's millstones) at the end of the outer zone and between districts, closed on a
   schedule.
3. **Hidden doors and secret exits** for the scouts, and a decoy entrance.
4. **Guano.** Bat roosts in the old tubes, and dovecotes at the hamlets (Cappadocia's pigeon houses), feed the farms.
5. **Light.** Polished bronze or obsidian mirrors at the wells throw daylight down the tunnels by the hour (a reflector
   record that drives a spot light). Glow fungus lines the lanes as street lighting.
6. **Water.** Drip lines to cisterns; stepwells; raised sills and flood gates (a tube is a drain).
7. **Geothermal baths** in the capital, from the Throne's heat.
8. **The economy.**
   - The herders' dung feeds the alecap beds.
   - The beer goes out to the caravanserai and the ash nomads (cousins).
   - The fungus medicines are the city's real wealth.
9. **Signals:** horns and lamp signals down the braid; speaking tubes in the estates.
10. **Night eyes.** The Chichani's night vision is an old family trait (NOTES.md): Zeijani streets are dimmer than a
    human city's, and they like it so.
11. **A buried light well:** a skylight plugged by a young flow, their fear made visible; a landmark at a dead end.

## 14. Phases and acceptance

Commit at the end of each phase, and update the progress log below.

- **P0 Setup.**
  - A worktree: `git worktree add ../krator-zeijani -b claude/zeijani origin/main`. If the Throne branch is not merged
    yet, branch from `claude/throne` instead: it carries the refs and the notes.
  - A static-server entry in `.claude/launch.json` (the next free port).
  - Read section 2. Ask section 11's questions. Remind the owner of the texture prompts.
- **P1 Vocabulary.**
  - `core/tags`: the culture and the jobs (`test-tags.js`).
  - `core/sockets`: the culture, the emblem, the trades.
  - The catalog culture file's skeleton.
  - `sets/zeijani.js`, and the new room kinds with their required pieces and aliases: `kiva`, `brewery`, `lab`, `cell`,
    `ossuary`, `cistern`, `guardroom`.
  - Accept: the node tests pass; the catalog and interiors builds pass.
- **P2 The cavern module** and its test. Its first consumer is a test block on the kit sheet.
  - Accept: `test-cavern.js` passes with every negative control; the block's floors are walkable in F.
- **P3 The kit,** in three commits:
  - (a) dwellings, galleries, estates, shops;
  - (b) civic and sacred: the temple, council, cistern, portal, caravanserai, catacombs, kiva, town hall;
  - (c) works, farms, the guard, the outpost, stalls, the additions.
  - Accept: `verify.py --assert` with the error panel empty, every def built, the tags audit at zero unknowns,
    `auditResidence` and `IX.life.audit` clean, the furniture budget met, rock thickness, the sockets, and
    `audit_wiring.py` reporting wired. Plus the export, and one screenshot per family.
- **P4 Dhelv's layout** as data, with `tests/test-layout.js` (section 12's checks).
- **P5 Dhelv's page:**
  - the kipuka surface, with the hyperjungle and the Throne kit read in place, each contiguous (as Verge reads its
    biomes);
  - the young lava over the city, and the wells' pits;
  - the underground, meshed;
  - the wells lit by the hour (spot, shafts, motes); the lamps' pool;
  - the switch that draws only what is seen;
  - the minimap by level; walk mode; the views.
  - Accept: verify's checks and their negatives: the void never visible from outside, the well floors lit at noon, no
    trees on cliffs or in buildings, the budgets.
- **P6 The ramblers** and the walk-map checks (section 8.3).
- **P7 Godot:** the exports, the spike case, the nav test, the golden replay.
- **P8 Docs and wrap-up:**
  - README, API, DESIGN, KNOWN_ISSUES; `PORT.md` (`tools/audit_port.py`); INDEX (`tools/make_index.py`);
  - the pages added to `tools/port_baseline.py`;
  - the gallery: main's `gallery/build_gallery.py` lists a new build by itself, so check that its entry reads well.
    The published gallery is one artifact, and an artifact version holds at most 256 MB, with each file under 16 MB.
    The gallery was about 230 MB on 2026-10-07. If Dhelv's pages are big, give them their own artifact, linked from the
    gallery's index (as the scale model and the open world's towns are), and keep each page under 16 MB;
  - the lessons, into the skill.
  - The owner decides the push.

### Progress log

| Date | Phase | State |
|---|---|---|
| 2026-10-07 | plan | written (this file) |
| 2026-10-07 | P0 | worktree `../krator-zeijani` on `claude/zeijani` (from `claude/throne`, not yet on main); `krator-zeijani-worktree` on port 8809 in the main checkout's `.claude/launch.json` (serves the worktree root); section 11 answered; 22 textures delivered, `stone.tuff.hewn` still owed |
| 2026-10-07 | lore | the owner named the spice **Ranj** (the Ranj tree; the species key stays `spice`, the place names Spice isle and the Spice Coast stay): `biomes/throne` NOTES, BIOME-API, species, trees, the stations' views and probes; the kiva gets a great built-in incense burner where Ranj is burned (6.4). The Throne pages rebuilt; the isle station's checks and negatives pass |
| 2026-10-07 | P1 | done. `core/tags`: culture `zeijani`, jobs `fungiculture alchemy dyeing masonry lampmaking knapping ropemaking`, keys `rock level district`, light kinds `glow-fungus daylight` (digest 617a177c; `test-tags.js` all passed). `core/sockets`: the `zeijani` pack, the `spiralarch` symbol, ten pictographs (ALCHEMIST LAMP STONE DYE POTTER LEATHER KNAPPER ROPE TAVERN INN). The catalog culture file: three FK sets (common, court, trade) and 43 loose pieces (`verify.py --assert` passes on all five pages). `kits/interiors/sets/zeijani.js`: the seven room kinds and ten items (the carved ones provisional until their void plans); a carved bed shelf is a fixture with `bed: n`, which the residence rule now counts (`src/48b-sets.js`, `src/20-rooms.js`); a door between explicit rooms may name `to: '.<room>'`; round rooms need a straight wall for a back piece (the kiva's flat back). `verify.py --sets --assert`: every set passes every check; the error panel shows the known SwiftShader compile drop (interiors KNOWN_ISSUES). Not rebuilt: the builds that bundle the catalog or read `core/sockets` live (their pages gain the new symbol and pack only when next built). The sockets example sheet no longer builds from today's Post-Apoc sources (`KMAT`): pre-existing, left as a separate task |
| 2026-10-07 | textures | the 22 images processed into the library (batches `zeijani-2026-10.json`, `zeijani-cards-2026-10.json`; `core/materials/PLAN.md` has the table); two friezes redone without the period crop (it cut the motif); `PROMPTS-ready.md` pruned to `stone.tuff.hewn` |
| 2026-10-07 | P2 | done. `core/terrain/39-core-cavern.js` and `test-cavern.js` (all passed, every check with a negative: determinism, no hole but the openings' rims, no triangle meshed twice, the winding faces the air, floors within 0.15 m of the mesh, rock at least 0.8 m, no void in the open air outside an opening, the Raufarhólshellir weights, the export loads back to the same meshes). Beyond section 7: **masses** (rock standing on the ground, meshed by the cavern: the kit sheet's blocks, Dhelv's cliffs and fairy chimneys) and **door openings** (a void meeting the air through a face); voids compose in the order added, soft (tubes, halls: smooth minimum) and hard (rooms, stairs: minimum) in two unions, so a junction's fillet never eats a stair's floor; one cell size (0.5 m), see KNOWN_ISSUES. `core/walk`: `poly` floors (`test-walk.js`). The kit page started (forked from Scyvoi's engine: `build.py`, `verify.py`, `materials.json` and `tex/`, 48 families): the cavern host (`40-zj-cave.js`: void plans in a def's own frame, the rock material, the cut-away) and the test block (`41-zj-block.js`); walk mode (F) stands on the `core/walk` floors. `verify.py --assert` passes: the probe's walk route goes in at the door, through the rooms, is refused at the carved bed shelf, down the stair and along the tube, and every negative fails |
| 2026-10-07 | P3a (part) | **Decision: the carved defs' void plans are data in `kits/interiors/sets/zeijani.js`** (rooms with the cavern's fields `carved round ceil rise finish`, and a `voids` list of passages, stairs, shafts, doorways and the sheet's rock block); the kit carves from the same item the interiors kit furnishes from (`cvFromItem`), and built defs write their floors and walls to `core/walk` from it (`37-zj-walk.js`). Every interior is furnished through `core/furnish` (`R.interior`) with each room (`part`) and piece (`furniture`) registered in `core/tags`. Done: the forms (`42`), the four wooden dwellings (`43`), gallery A, the spine (`44`: three levels, twelve cells, hearth hall, kiva with the Ranj burner, cistern, air shaft); every residence passes; the cut-away opens the sheet's ground over a carved def. Module changes on the way: the lattice half a cell up (floors mid-cell), door openings with a height; the interiors placer's `anchors` filter. Next: gallery B (the well), the estates, the constructed houses, the twelve shop types (and `core/sockets` on the page for their signs) |
| 2026-10-07 | P3a (part 2) | The owner's fixes: every doorway passage now overlaps the floors it joins (the walker could not enter the cells), z-fighting on frames, lintels, floors and jars; `stone.tuff.hewn` delivered. **Gallery B, the well** (a 9 m shaft, a carved spiral stair for 1.5 turns, ten cells off five landings, two off the tunnel, a hearth hall and a cistern at the bottom). **The estates**: A the columned hall (engaged columns, a frieze, a pillared hall, a court under its own light shaft with a basin, the family's and the service corridors: 13 rooms), B the loggia (a domed hall, a stair to the family's floor behind five arches, a flight down to a court and the service rooms: 12 rooms); windows are cuts with no walk floor. New room kind `court`. New checks, each with its negative: `walk-joins` (every passage meets a floor at both ends), `walk-route-well`, `walk-route-estates`. The cut-away for carved defs is now a dollhouse (each void cut 2 m above its own floor), so every level shows. Next: the constructed houses, the twelve shop types (and `core/sockets` on the page for their signs) |
| 2026-10-07 | P3a (part 3) | **The constructed houses**: a domed tuff hut (one room, a smoke hole), three domes round a walled yard (living, sleeping, cooking; the yard a `court`), a two-storey house of tuff ashlar planned by the interiors kit (`zbBody` draws any planned body: walls with their openings, slabs round the stairwells, solid stairs) with a frieze at the floor line and a roof terrace (a parapet with stepped merlons, a dome, an awning). **Walk fix**: a planned body's upper floors went on the walk map without their stairwells, so nobody could walk down a stair; they are now cut out (any turn). New check `walk-route-houses` (the planned house's route is a walk of the planner's own nav graph, every room and the stair both ways) with its negative. Next: the twelve shop types |
| 2026-10-07 | P3a (done) | **The twelve shops**, each in a carved front (a cut through the face with a counter across it but for a gap, shutters folded back, the sign in a dark niche, lamps; the smiths' smoke shafts to the top of the rock) and a constructed one (a planned tuff block, an awning, the sign on the parapet, every other one a dome on the roof): weapons, armour, general, food, alchemist, lampwright, stonecutter, dyer, potter, leatherworker, knapper and mirror-maker, rope and caving outfitter. One interior per trade: the selling room's kind requires the trade's goods, the back room's its workstation by role (or the smithy, lab, store, kitchen). **`core/sockets` is on the page** (the zeijani pack draws signs and awnings; shims for its drawing needs). Niche lamps now stand on their sills (they were inside the face). New check `walk-route-shops` (24 shops, 240 legs) with its negative. P3a is complete: 4 wooden dwellings, 3 constructed houses, 2 galleries, 2 estates, 24 shops. Next: P3b, civic and sacred |
| 2026-10-07 | P3b (part) | **The kiva** (its void plan replaces the provisional item): sunk 3.6 m under an earth roof, entered down a ladder through the hatch over the hearth; a bench terrace carved round the round wall (a void room off the walk map), the altar on the flat back wall under the murals, deflector, ventilator (a tunnel to a shaft), sipapu and the great Ranj burner. **The funeral catacombs**: a portal under a frieze of the dead, a stair 4.5 m down to the mortuary chapel, loculi corridors lined with bones, an ossuary chamber at each end, the Keeper's cell. The sheet's ground now stops at every well (a walker goes down a hatch, not over it); the cut-away opens the ground over sunk defs and the cavern's ground patches with their well's site, and opens shafts whole. New check `walk-route-sacred` with its negative (the ladder missing). Next: the temple, the council, the cistern hall, the portal, the caravanserai, the town hall |
| 2026-10-07 | P3b (part 2) | **The temple**, cut from one rock like Kailasa: a gateway with receding frieze tiers through the face into a pit cut from the top of the rock; the podium left standing in it (its stair cut into its front, friezes of the spirits on its four faces), on it the sanctum's drum (open to the sky under a pierced lattice dome of the library's `jali` cut-out, a lamplit shell behind it) and four domed corner shrines; two lamp pillars; cloisters cut into the pit's side walls behind pillars left standing. The cavern now composes a plan in phases (pits, then monoliths, then rooms, then the rest; proven: the cavern's mesh hash unchanged), and plans may carry walk `floor`s (less holes) and `block`s. The jali's scale is 2.2 m. Next: the council, the cistern hall, the portal, the caravanserai, the town hall |
| 2026-10-07 | P3b (part 3) | **The council** (Lalibela's Bete Giyorgis): a cross of rock left standing in a trench cut 9 m down into the ground, its roof at the ground's level with a stepped cross in relief; a stair-tunnel down from a sunken head; the council hall carved inside the cross (the dais in the east arm, benches north and south), labyrinth reliefs on the arms' ends, windows on the sides, stone lanterns round the rim. **The sheet's ground now holes at every well** (r + rim; the cavern meshes the ground inside): a well in open ground (the council's trench, the kiva's hatch) was drawn over. Entry strips at a ground opening run a little past its edge onto the ground (an exact abutment left a hairline a walker's step could land in; on a ladder the overlap stays under 5 cm). Next: the cistern hall, the portal, the caravanserai, the town hall |
| 2026-10-07 | P3b (fixes) | **The owner's review of the furnished buildings.** Carved rooms are furnished in their outline drawn in 0.25 m (the cavern's rounded corners and wall fillet put pieces in the rock; doors move onto the inset outline). Contact shadows under every floor-standing piece (underground the sun casts none, so pieces read as floating). Painted hangings take the cloth's weave. The inspector names interior pieces. The catalog: the bed's rails, slats and drapes no longer z-fight; bins' handles stand proud; a piece with no flat top (`surface: false`: jars, vats, crocks, baskets, larders, barrel racks, the Zeijani's ollas and cradles) hosts nothing; a new canonical material `terracotta` (unglazed, matte) for the Zeijani's pottery, which read as glowing in the glazed ceramic look; the dye vat's dye proud of its rim; no folding screens in the Zeijani's sets; a placed desk gets a chair. The kit: the house door and yard gate open inward, the yard's band stops at the gate, hearths show their fire, the well's head landing is floored and railed, the catacomb's bones stop at the Keeper's door, bands show their whole sheet (murals kept their heads), the jali is a real cut-out (alpha-tested, both faces, projected in world space: it no longer smears toward the crown), copper takes the bronze set and the burner has flames. **A kiva in the temple's pit** (the kiva's plan is one function now, `kivaPlan`). Pre-existing on main, not this branch: the interiors sets sheet's Girder dwelling holds no food container, and its pages log shader-compile errors on this machine |
| 2026-10-07 | P3b (council) | **The council rebuilt bigger and after Kailasa** (the owner: "bigger, grander, more like Kailasa"), still cut down into the ground: a pit 36 x 58 m and 12 m deep (four overlapping wells hole the ground along it), down a sunken lane and a tunnel through the gatehouse; the council hall left standing (a 6 m podium with friezes, the pillared council chamber carved above with the dais, two stairs cut into its flanks, windows, a parapet, a six-tier tower on its roof crowned with a stone disc and a copper finial, kiosks), the pavilion (the Serpent's shrine) with a stepped roof, bridges of rock from the chamber to the pavilion and on to a gallery in the gatehouse, two 16 m lamp pillars, cloisters behind pillars. Its route: 29 legs |
| 2026-10-07 | P3b (cistern) | **The cistern hall** replaces its provisional item: a vaulted hall carved in the rock, 9 m deep; four terraces of rock left standing step down on three sides to the still water (Chand Baori), with flights down the back risers; pillars from the water to the vault; a causeway of rock to a platform with a dipping frame and lanterns; the landing inside the portal is where water is drawn (its interiors room) |
| 2026-10-07 | P3b (portal) | **The portal**: an arched tunnel 10 m wide and 12 m high through a block of tuff (a cavern tube), its ornate rim (a voussoir arch keyed in basalt inside a ring of dark stone, engaged columns flying pennants, a relief panel of the spirits, a stepped crown, the zeijani emblem); a rolling stone door 11 m across rolled into a channel cut in the tunnel's side; three levels of cells either side of the gate, their doorways on ledges with ladders (the ledges are no walk) |
| 2026-10-07 | P3b (town hall) | **The town hall in a rock spire** (a fairy chimney, tapering, with a basalt cap stone and a blocky carved front): the council room at the ground, the records above, the lookout at 11 m with four windows. Spiral stairs cut in the rock outside the rooms join them, each entering its rooms by a short level chord. Lessons: a straight stair between stacked rooms passes under the upper room, whose floor a walker coming down keeps to, so stairs must come in from the side; a stair through a room's own air has nothing under it; a many-sided room's walk edge runs nearer mid-side than its radius, so stair ends sit 0.25 m inside it. Its route is read from the plan (every chord, up and down: 43 legs) |
| 2026-10-07 | P3b (done) | **The caravanserai** (constructed): a half-round court under a roofed colonnade, six rooms round its arc (four guest rooms, a kitchen, a store), the taproom at the foot of a tall round tower whose spout drops a waterfall into the court's round pool, two long pools, a front wall and gate, a fenced stable yard with a thatched lean-to. **P3b is complete**: the kiva, the catacombs, the temple (with its kiva), the council (after Kailasa), the cistern hall, the portal, the town hall, the caravanserai; every one with its route in `walk-route-sacred` (eight routes). Next: P3c |
| 2026-10-07 | P3c (done) | **Works, farms, the guard, the outpost, the stalls and the additions: 34 defs.** Works: the stores (a side tunnel walled off, four store rooms), the warehouse, the granary, the yam and vegetable terraces (crop cards from the library sheets), the alecap beds (a new room kind `alecap`: spawn racks; the compost beds are fixtures), the timber and carved farmhouses, the brewery (its plan replaces the provisional item: taproom, brewing hall, cooperage, a cellar down a flight), the fungal alchemist (selling room, domed still room, glow room, spawn room), the smithy. The guard: the guard post, the carved barracks, the guard headquarters, the outpost's timber barracks, the watchtower, the scouts' jali tower lit inside, the muster ground, the palisade and gate (walk blocks). Trade: the tavern and inn carved and constructed, two stalls (the second in two variants). The additions: vent, rolling stone door, bat roost, dovecote, hot-spring bath, light-well mirror, ancestor niche, signal station. Each carved item carries its own `route` and a planned body `route: 'planned'`: `walk-route-works` walks all 20 (its negative: the brewery's cellar stair missing). **A fix found on the way:** the interiors planner's division depends on the instance's id prefix, and the drawn walls ('draw.'), the probe's routes ('route.') and the walk map and furniture (the record's id) were three different plans of every planned body; all four now take the record's (`zwPrefix`). Also: round rooms got kinds a curved wall can furnish (`taproom`: the caravanserai's tower; `records`: the town hall's), which cleared P3b's two `no-fit` failures in the interiors sheet. Kit verify 35 PASS; the interiors sheet (`--sets --query set=zeijani`) passes with no dropped rooms. Next: P4 |
| 2026-10-07 | P4 (done) | **Dhelv's layout as data** (`settlements/dhelv/src/41-dhelv-layout.js`, [G data]: `DH`). The outpost in the kipuka (the portal and two galleries in the old cone's cliff facing west, the caravanserai on the stream, a palisade of 24 runs round the clearing's west half and its gate, three watchtowers, the timber barracks, dwellings, a pasture); the outer tube 1.9 km at 2%, 10 m wide, its side caves (stores, stables), the rolling stone door; the braid (two strands that part and rejoin, 36.5 m up over 420 m); the hub (a hall 280 by 200 m, the light well's pool with four stalls, the council in its trench, the scouts' tower, shops and a tavern along the south, the guard headquarters, the muster ground, a kiva; in the wall the temple's pit, the barracks, both estates, the brewery, the alchemist, two carved shops, an ancestor niche; a ledge 10 m up round the north and east walls, stacked over the north mouth); three satellite wells (278 to 412 m out, 70 to 84 m across, 34 to 39 m deep: fields, a granary, homes, a smithy on the floor; a gallery, the stores, the alecap beds, a shop, a tavern or inn and a kiva in the wall); the cistern 176 m out; the catacombs 927 m out and 58 m down a processional way from the south well; two scout exits. Tubes cross at three places, 18 to 20 m apart. `tests/test-layout.js`: 12 checks, each with a negative (the graph, the grades, the outer tube, the braid and its crossings, the rock over every way, the square with room to walk, every site a kit def with the def's footprint, each district's list, wealth falling outward, the foreigners' zone ending at the stone door, the outpost apart) and a golden digest. `layout-plan.svg` draws it for tuning (`tests/plan-svg.js`). Next: P5, Dhelv's page |
| 2026-10-07 | P5 (a) | **Dhelv's page, its skeleton** (`settlements/dhelv`: `build.py`, `verify.py`, `src/90-dhelv-scene.js`, `src/91-dhelv-probe.js`). The kit's code runs as it is (its `src/` less the sheet's host); the layout gained its ground (`DH.groundY`: the flows, the kipuka's level hollow, the old cone with its straight cliff where the portal and the galleries stand). The hall (a dome on a 280 by 200 m square, its throat the light well), the three wells, and every way of the layout carved (each run 0.3 m on into the next, 1.2 m into the hall or a well); 105 sites placed with their interiors; the rock meshed near the camera (`DH_STREAM`). Checks with negatives: no void open to the sky but at its openings; the ways walked from the gate to every district through the carved walk map. Found and fixed on the way: **a core cavern bug** (`39-core-cavern.js`: the mesher's quick refusal read no void at a chunk centre outside every void's box, so a chunk whose top face is a big hall's floor was refused; `test-cavern.js` has the case now, failing on the old code); the kit's cavern host meshes chunk by chunk (`cvChunkMesh`) and takes `CV_OPTS`; the kit's camera takes `camGroundY`. The kit's page is unchanged (373 chunks, 751,372 triangles, 35 PASS). Next: P5b, the surface |
| 2026-10-07 | P5 (a, review) | **The owner's review of Dhelv's page.** Fixed: wall sites faced the hall's centre, not square to its elliptical wall (19 degrees off at the estates: fronts clipped, rooms stood open), now the wall's normal, with a plumb 9 m foot wall and a bay before each front; the wells' floors laid out on their entrance axis (checks added); the palisade tangent and run on to the cliff; the stone door walled in round its own passage; forecourts for the fronts a tunnel meets; the portal and galleries cut through the cliff's ground; the light well's rim (the cavern keeps its ground only at the lip); the caravanserai's tower, the cistern's rails, the mushroom stall; the scouts' headquarters rebuilt as three octagonal planned storeys walled in lit lattice. Added at the owner's asking: a marker (double-click), G to go to it, Walk from it, Run (R); the minimap; the temple's lattice replaced by a painted sky dome (a canvas stand-in; the texture prompt is in KNOWN_ISSUES.md), the lattice moved to a new outpost shrine (`zj_shrine`) beside a new kiva; the square filled: the park under the light well (`zj_park`), the row house, the market hall, the public fountain (new types), 34 sites laid in by a placement pass. The planned routes step off a stair's foot and round it before turning for a room. Kit 35 PASS, interiors sheet and Dhelv verify clean |
| 2026-10-07 | P5 (c, light) | **The cave's light** (`settlements/dhelv/src/94-dhelv-light.js`): underground the sun and the sky's reflections go out; daylight comes down the openings (the sky's light straight down, the sun's shadowed beam crossing the floor by the hour, a shaft with motes, a bounce); the lamps' pool of real lights near the eye at any hour; glow fungus along every tunnel; `[` `]` move the hour. Checked: the well floors see the sky at noon (negative: the throat plugged). Tunnel views sit on their tunnels. Next: P5b, the surface |
| 2026-10-07 | P5 (b) | **The kipuka's forest**: the hyperjungle kit read in place (core/biome, its fragments wrapped in one closure so its helper globals and random stream stay its own; its maps in a sidecar `dhelv.tex.hyperjungle.js`); three hero hypertrees round the clearing, saplings, ~2,000 understory plants; the young flows in basalt; the stream. Checked: no tree on the cliff or in a building (negative: a tree at the cliff's foot, one in the caravanserai). Still to do: the Throne kit's pioneers on the flows (it wants a field model: KNOWN_ISSUES.md) |
| 2026-10-07 | P5 (c, cut-away) | **The cut-away at Dhelv's carved sites**: the rock's shader takes a world's own cut boxes (`CV_OPTS.cutBoxes`, `CV_BOXCUT` in `40-zj-cave.js`; off in the kit sheet), so the hall's wall before a front and the ceiling over its bay open above the site's floor + 2 m, as each room's own rock already did; the ground over a site opens on the camera's side. The 32 carved sites nearest the camera (`dhCutBoxes`, every half second). Check `cut-away-sites` (30 sites) with its negative (the turns mirrored: 9 fail). Kit 35 PASS, Dhelv verify clean |
| 2026-10-07 | P5 (c, what is drawn) | **The switch that draws only what is seen, and the budgets.** Dhelv's buildings drawn in cells of 160 m (carved and surface apart), the furniture's batch (1.45M triangles, the most of the page) cut by site after its flush; the camera decides every quarter second: carved cells within 420 m, surface cells above ground or near a mouth, a carved site's interior only from inside it or before its front, built interiors within 90 m, the forest above ground. Every view drew 2.4-2.56M triangles; now 0.6-0.9M besides the rock. Checks `view-budgets` (450 draws, 1.1M triangles at each of the 20 views; negative: everything drawn, 12 views over) and `page-size` (each file under 16 MB: 12.6 and 3.0 MB; negative: a 1 MB limit). Dhelv verify clean |
| 2026-10-07 | P5 (b, the flows) | **The Throne kit on the young lava**, read in place and wrapped as the hyperjungle is (its pack less the host's ground, roof and sea sets, a sidecar of 8.6 MB). It plants first and its big trees keep the hyperjungle off; Dhelv binds its ages (the kipuka 2,600 years, the old cone 8,000, the flow over the city sixty with older lobes and fresh tongues) and its fields on an 8 m grid; its mask keeps it off the cliff, the clearing, the stream, the pasture, the light well, the pits and any scarp. About 4,300 trees in 2.9 s. The plants cut into 400 m cells after the bake and drawn within 1,300 m (underground only up an opening). The budgets now apart: underground 450 draws and 1.1M triangles, the surface 650 and 1.6M (the old growth). `no-trees-on-cliffs-or-in-buildings` covers both kits. Dhelv verify clean. P5 is complete |
| 2026-10-07 | P6 (a) | **The nav graph and its checks** (section 8.3, 1 to 4; `settlements/dhelv/src/72-dhelv-nav.js`): the layout's ways, a grid on each open floor, a door node at each front; every lookup takes y. Checks, each with its negative: nodes on floors (a node moved into the rock), edges walkable with headroom (an edge through a pillar; a low lintel), every door reachable from the gate (the south well's tunnel cut), stacked lookups (the y swapped). The edge check found four faults in the walk map, fixed: a tube's floor over the head of the west ledge stair (stairs now end on a level landing clear of the ways that leave their top), the east ledge stair under the ledge (moved, the layout's golden rewritten), the cliff stairs to the cone's towers (walk strips through the rock with nothing drawn: now built switchbacks). Dhelv verify clean |
| 2026-10-07 | P6 (b) | **The ramblers** on core/simulation (`settlements/dhelv/src/74-dhelv-sim.js`, data; `95-dhelv-life.js`, the drawing): layers for the public, the foreigners (outer zone), the guard and the scouts; 118 places from what was built, every door with its nav node; the roles with their schedules; about 650 people; the stone door shut at night. Drawn from an instanced pool near the camera, dots on the minimap, follow a walker, the nav overlay (V). Checks 5 and 6 with their negatives: a day's run (10,500 poses sound, no route failed, no one stuck, stairs used, all seven districts visited; a walker planted off the floor and one in a pillar fail), the rules (the traders on the outer ways, nothing through the shut door but the guard; a foreign way through the gate and a way through the shut door fail). Dhelv verify clean (38 checks) |
| 2026-10-07 | P6 (c) | **The groups that try the hard routes**, core/simulation events from entries inside the city: the scouts' patrol out the secret way to a scout exit and back, a funeral from each well's kiva to the catacombs, porters from each well's stores to its fields, the guard changing at the stone door, children wandering the square; single file in the tunnels. Check `groups-ran` (each kind out and back in the day; a patrol fired now makes its stop) with its negative (a patrol whose stop nothing offers). **core/simulation, additive:** a port may carry its height and nav node (an entry inside a world of levels); an event's `spread` (0: single file); a group's member stands at a stop where its walk stopped, along the way, not straight back off the last bend (it stood in the catacombs' rock). `test-sim.js` passes; Mungo, Shade and the example sheet rebuilt and checked. The west ledge stair's landing handed to the nav (`DH_REAL`). Dhelv verify clean (40 checks). P6 is complete but for check 7 (no `IX.life` on Dhelv's page) and 8 (the golden trace: P7) |
| 2026-10-07 | P6 (review 2) | **The owner's second review of Dhelv.** Done: stochastic tiling on the cave's rock (Quilez's technique 3 under WebGL2); the sky dome painted from the owner's image and reworked for a hemisphere (`tools/textures/dome_sheet.py`); the council's windows real openings; the stone door rolls back to let the guard and the scouts through while it is shut. **The shelf** ("a shelf sticking out of the slope of the volcano"; "how the lava would actually travel"): the city now lies inside an old spur, an organic shelf 40 to 83 m over the flank on sheer walls (columns and a caprock, `dhWalls`), a narrow ridge behind it up the slope, the outpost in the apron at its west foot (the outer tube 121 m to the stone door); the young lava laid by the Throne's own flow model (`48-dhelv-flows.js`: seven vents, the flows parting at the ridge). **The grove** ("2-3 standardized trees", "LOD"): three hypertrees and three saplings grown once and drawn as instances with far levels (`49-dhelv-grove.js`, 0.15 s); the ground in tiles (125k triangles, from 433k); the furniture's decals in their cells. Verify all passed (most on the surface: 540 draws, 1.51M triangles). Next: the light wells' floors (a breakdown hill with skylight flora, as the Throne's tube station), the park's flora, fungal flora in the tunnels, section 13's extras. P7 waits for a Godot binary. |
| 2026-10-07 | P6 (review 2, floors) | **The wells' floors** ("a low hill", "a skirt of greenery", at the bottom of the well, as the Throne's lava tube station): breakdown piles laid by the layout (`KNOLLS`: the largest discs in each well's daylight clear of its sites and ways; four in the park's quarters, two a pit), drawn with their blocks and walk blocks (`89-dhelv-knolls.js`), grown over by the Throne's skylight zone in a pass of its own (siphon trees on the piles; ferns, moss, tufts on a skirt); the park's placeholder trees, beds and caps left out (`zj_park` `knoll`). **The tunnels' fungi** (`88-dhelv-fungi.js`): the Throne's cave pass along 27 carved ways (3 km), in a band at each wall's foot. Both baked apart and drawn as the underground. Checks with negatives: the piles clear (layout), the wells' trees on their piles, the fungi on the carved floors. Verify all passed (most 589 draws, 1.52M triangles). Next: section 13's extras. |
| 2026-10-08 | P6 (review 3) | **The owner's third review of Dhelv.** The spur's back merges into the slope, which rises sharply round it (no thin ridge; a low crest carries the spur's line up, the flows part round it); the shelf's top edge weathered round (a lip 10 to 15 m in radius, drawn by the walls and the ground alike); the land out to 5 km; the walls' contour search fixed (columns had gone missing where the outline wandered out); the west face in columns and dressed rock, the outpost's mouths cutting the ground only to their tops and their rock kept meshed (the face had gone transparent, the portal invisible). The stream falls off the lip into a plunge pool and sinks in a swallow pool at the lava's edge. **The wells' floors are grassy hills** (`HILLS`: the square's one hill with its lanes over it; each pit's hill with its buildings on level pads), in the library's turf, walked, planted with tree ferns, lehua, ferns and moss (no siphons). Denser tunnel fungi; more dithering on the cave rock and the ground (a second scale, a broad drift). The temple's sky the owner's round painting, mapped polar, stone outside; its podium stair walkable (turned sites' walk blocks were boxed wrong). The stone door's lintel no longer fights; the walkers' line moved off the inspector. **Section 13's extras**: the bath, the bat roost, signal stations, dovecotes, mirrors throwing daylight down the ways, air shafts with caged-bird sentinels, the buried light well, the decoy entrance. Verify all passed (most 568 draws, 1.47M triangles); the kit sheet's too. |

## Appendix A: the owner's brief, verbatim

**The people** (2026-10-07; they were then called the Cthonians):

> Here we have the Cthonians. They, and the ash nomads, may be cousins to the Chichani, though the Islanders are
> ethnically different. When an unknown past calamity occurred, perhaps during the Cataclysm or perhaps later, the ash
> nomads took to wandering, the Chichani took to the sea and migrated off the island entirely, and the Cthonians hid.
> Their greatest cities are built in and around the lava tubes, with dwellings carved into the rock forming spires and
> underground galleries. They known the lava tunnels better than anyone, giving their scouts and raiding parties the
> ability to appear and disappear without warning. The location of their capital is not known to outsiders. They have
> one, main, elaborate capital (a bit smaller than Yuni) 3 smaller (Mungo-size) cave/tufa villages, and a few scattered
> surface farming hamlets. They have extensive knowledge of the cave fungi which they use for medicinal and alchemical
> arts known only to them. They are also known to have a grown a peculiar purple mushroom, the alecap, that, when
> fermented, makes a fairly passable beer.
>
> Vibe: Cappadocia; Petra; Ethiopian cave churches; dwarves; Varanasi and Babylon.

**The manifest:**

> 2 variants: carved vs constructed dwellings Carved dwellings are carved into the tufa or lava tube and take the color
> of the surrounding rock plus a "polished stone" texture (may need separate for tufa vs whatever lava tubes are made
> of). We'll also have some simple wooden dwellings for the farming villages. The capital is mostly underground but has
> several natural light wells.
>
> Manifest:
> -3 poor wooden, 1 middle class wooden. 1-2 variants of carved entrance that opens to galleries of Cappadocian style
> apartments for the poor classes that go deep into the terrain itself. For this build, the 'building' may be more a
> façade and the hidden interiors may be more important. There should be a similar wealthy variant that opens to
> multi-room estates carved in the walls. There will also be 3 constructed poor, middle class, and wealthy buildings,
> -Shops: weapon, armor, general, food, alchemist, and 4-5 more you think might be fitting. Exteriors can be carved or
> constructed but each individual type can use the same interior and exterior signage.
> -Town hall: constructed Cappadocia-style into a rock spire, but more ornately carved, similar to the carved structures
> in the zip. Wealthy buildings also take ornate carvings and relief. Dwellings tend to be more rounded, which civic
> buildings are larger and blockier.
> -warehouses, granary; in the capital this may just consist of side tunnels that are walled off.
> -farms: yam, alecap (underground exclusive), vegetables. Farmhouses (wooden and carved variant)
> -brewery (carved)
> -town guard; carved barracks for the capital
> -watchtower; scout headquarters (can resemble 'temple tower' ; yes I know the name doesn't fit)
> -fungal alchemist (carved)
> -smithy
> -kiva-like shrines is a good idea. For the capital, see the reference images – I have an idea the main temple has the
> massing of 'temple-massing' – with the ornamentation of 'temple-body', but carved from one rock like kailasa. Their
> art style will be partly inspired by fantasy dwarves, partly by southwestern kachina culture, and partly by
> Ashlanders, Cappadocians, and the other influences.
> -council chamber: resembles Ethiopian rock church, but with even more ornate carvings like the image
> "066f9f823da75ca2a6003dc41c7c8e20"
> -cistern hall.
> -entrance to capital is carved to resemble 065e907ce07143c291064fece604d09d, but the rim is more ornate.
> -caravanserai (resembling 12235061828277d6d87434f7873a3802)
> -tavern, inn (carved and constructed variants)
> -mustering ground
> -2 varieties of market stall
> -funeral catacombs
>
> The capital, Dhelv, is organized around a þríhnúkagígur sized interior space, though it's not as far down. One tube
> stretches about 2 km away where the entrance is; there are watchtowers, a barracks, and a palisade around this
> entrance. The caravanserai is also here, as are a handful of dwellings for citiziens who forage, farm, or herd cattle
> outside; foreigners are usually not allowed to go any further. There are entrances to at least 2 underground galleries
> of poor apartments here.
>
> After a braided network of tunnels which climb upward though still underground, the central square is seen around
> that large interior space. It is close enough to the surface to be illuminated by a light well. It is formed from one
> of these junctions you mentioned and has a 2nd level leading to more tunnels. The central square is large enough to
> contain the council chamber, main temple, brewery, alchemist, several constructed shops, guard headquarters, and
> mustering ground. Built into the walls here are the carved barracks entrance and entrances to wealthy dwellings. As
> one gets further away from this square, the wealth level falls off. The braided network of tubes leads to 3 other
> smaller light wells not very far away; These are used for farming surface crops; the tunnels around these wells are
> also used for harvesting fungi and farming alecaps. The walls of these lightwells have entrances to galleries of poor
> apartments, middle class homes, warehouses/granary, and shops. Taverns and a small smithy can be found at each of
> these light wells as well. The funeral catacombs are deeper away from the surface, 2-3x farther than the satellite
> light wells.

**The later notes (the same day):**

> i should also specify that the outside opens to an old growth stand of forest in the kipuka

> build rambling pedestrian life layer, but mostly to test the walk map in this complex underground space

> make sure core/furnish, core/tags, core/materials, and interiors are fully integrated and everything is godot-conscious

> include prompts for needed textures

> coloration of cave could be inspired by Raufarhólshellir *(four photographs: banded blue-grey walls, red, pink,
> purple and teal breakdown ceilings, a collapse skylight, walkways over breakdown)*

> also we can change the culture name to Zeijani

## Appendix B: the reference board (`kits/zeijani/refs/`)

| File | What it shows | Role |
|---|---|---|
| `065e907ce07143c291064fece604d09d.jpg` | a giant arched portal cut in a cliff, terraced cliff dwellings | the capital's entrance |
| `066f9f823da75ca2a6003dc41c7c8e20.jpg` | a cube shrine covered in swirling labyrinth relief, stairs, stone lanterns | the council chamber's ornament |
| `12235061828277d6d87434f7873a3802.jpg` | a tall tower over a colonnaded half-round court with pools and a waterfall | the caravanserai |
| `temple_massing.jpg` | a great domed temple with smaller domes | the main temple's massing |
| `temple-body.jpg` | a pierced lattice dome on an ornate base | the main temple's ornament |
| `temple tower.jpg` | a glowing pierced tower | the scout headquarters |
| `1224e5c68fe6dca9da62d5288fde8522.jpg`, `b82bdcf2d40bf539d19382820b6db61d.jpg` | towers on rock spires | the town hall |
| `6cf98402dc11f97e031a349ee28c4c59.jpg` | an Aksum-like spire | the town hall, civic ornament |
| `19908218b0462a2feb7cf8e4e828e418.jpg`, `a37c48795984e50048744f29ce8e7aa3.jpg` | fairy chimneys; porous spires | tuff country, the villages |
| `2da8190bd6a47f332ad67f2fe1bca439.jpg` | a cavern city carved into the walls | the hub's walls, the galleries |
| `29572039daa05771a254a0a74797f260.jpg` | a dark dwarven pillar plaza | the square, the cistern hall |
| `b719658d3f7a1c84e1a1468cb3319ddd.jpg`, `cliff.jpg` | cliff dwellings under an overhang; a cliff palace | the outpost's terraces, the estates |
| `6159c2bad0db7b65765452bbee2e718d.jpg`, `d117a2ed992b94afc904a803a32e2363.jpg` | a colossal carved face; a grotto face | wealthy and civic fronts |
| `75f7b15531d755f2d16c7de0ce19a8e2.jpg` | mushroom rock dwellings on a cliff | gallery fronts |
| `69fa9a8c82780c51be2f72884410974d.jpg`, `58f4d9623a4c6851df9fa66cc65af167.jpg` | mushroom-capped round houses; a mushroom house | the poor huts, the stalls' canopies |
| `6944740d372f5a3e736791de180306fa.jpg` | pot-shaped houses on stilts | the poor huts |
| `7267d279452cbc574c25df4fa4503d52.jpg` | a conical carved hut with spirals | huts, the kiva's roof |
| `fef0fa08b5815c8824a0d8035ae73650.jpg` | an earth-mound house with a ribbed round door | the middle wooden house, doors |
| `647218aca189bc2fdaaf948d5a3ae215.jpg`, `d35e34b5825441823f76c0457c6e63d6.jpg`, `8261598e02f56f7c52b87b0d43d465a4.jpg` | shell-dome mansions; a white domed house; coloured domes | the constructed houses |
| `77c855f57c2c30f56081868225a497b9.jpg` | conical mud towers | the granary |
| `8f8c7c5c3e10383f1b0b79f2fa11d05a.jpg` | a tower in a town | the watchtower |
| `b148fa731bbcd3051bbb85ea3369e522.jpg` | a cube shrine (a variant) | kiva and shrine fronts |
| `islander port.jpg` | the Islanders' port | not Zeijani |
