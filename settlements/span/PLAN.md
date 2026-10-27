# Span: the plan (draft, 2026-10-27)

Span is the ruined Ancient arcology of the south-western highlands, built along and down into **Pan Riba's canyon** through
the `pillar`-sandstone tableland, and now **Dalab's northern outpost** against the machines and mutants of the Ancient's
Valley (`LORE.md` §6.1: "Blade, Span: wrecked arcologies that are northern Dalab outposts"; §6.19: "Dalab guards the Valley
from the south with Blade and Span"). Its biome is `biomes/swhighlands` (`PLAN.md` sections 1, 4 "Span's tableland" and
"The pillar rim", 6 "Span", 7 stations 3 and 4).

Owner's brief (2026-10-26, through the swhighlands plan; the concept `biomes/swhighlands/refs/40-span-arcology.webp`): the
arcology **stands in a canyon**, white curved terraces and ring-walled domes along both rims and **down into the canyon**,
its floors stepping down the walls to hangars and works on the canyon floor; round landing pads on the rims; **bridges
spanning the gap** (the name); a lake upstream on the tableland with outlying ring-walled sites by it. Now a wreck: the white
panels tarnished and overgrown; Dalab's outpost holds the sound parts; **Dalab's watch post** on a pillar-rim tower's top,
reached by a stair cut up its side (`refs/01`, `refs/27`). The arcology should be developed **first**, so the SW highlands
stations (3: the canyon; 4: the pillar rim and the watch post) are designed round it.

**The owner, 2026-10-27**: the trimmed size (about 750,000 m² of floor, about 9,000 people at its peak: `AREAS.md`);
Dalab's own building set (`settlements/dalab`) for everything Dalab builds; **an intact, cleared Ancient tunnel** leads
from Span down to the basin, a handy way onto the plateau's top that Dalab counts as strategic; so Span is **more than an
outpost: a Dalab trading post**, where Dalab trades with whoever lives up there (TBD). The tunnel leads down to **the
south-western lowlands**, Dalab's basin; and **a second Ancient tunnel leads to the Valley** (the owner, 2026-10-27).

**Status: SP1 done (2026-10-27): the layout is data** (`src/30-span-layout.js`, its rules `src/31-span-rules.js`, `[G data]`),
checked by `node settlements/span/test-span.js` (42 checks, every rule with a negative); the sheets and `AREAS.md` are
drawn from it (`python3 span_blueprint.py`, through `layout_dump.js`). Nothing is drawn in 3D yet. The open questions left
are section 9.

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/span/` (`span_blueprint.py` and `floors/` now; later `src/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | `dist/span.html` (the arcology in its canyon); the watch post is shown on swhighlands station 4's page, from Span's records |
| The ground | **not Span's.** The swhighlands kit carves the canyon, makes the lake and the river and dresses the ruin with its flora (section 5 is the hand-over). Span's page reads the station's ground in place, as Pinnacle Rock reads the necanyons kit |
| The buildings | **`kits/ancients`** (the Ancients building kit): its existing builders where one fits (section 6), and new builders in the kit, one per fragment, for the pieces it lacks (the bench gallery, the rim range, the ring-walled dome, the pad on a drum, the Cross). Span's page takes them by name; nothing is copied into the build |
| The plan | a layout fragment that **builds nothing** (`references/vertical-settings.md` section 1 of the painting-to-3d-world skill): every part a record keyed by a stable id, its level, footprint, frame and decay state; every later pass reads it. `[G data]`: Godot runs the same records |
| Dalab's fort and trading post | the rehabilitated parts (the kit's decay 3 `repairPass` on the Ancient fabric) and Dalab's own buildings and additions as records: **the Dalab building set** (`settlements/dalab`: `dalab_market_large`, `dalab_inn`, `dalab_tavern`, `dalab_warehouse`, `dalab_scribes`, `dalab_bathhouse`, `dalab_hut_c`, `dalab_rowhouse`, `dalab_barracks`, `dalab_healers`, `dalab_watchtower`, `dalab_shrine`, `dalab_mound` and its `dn*` helpers: the Line, parapets, pens), placed through its registry (`VERN.place`, `culture:'dalab'`), its fragments read in place. It runs on the same Ancients core as `kits/ancients`, so one page takes both |
| The Basin Tunnel | an Ancient road tunnel, **intact and cleared**, from its upper portal in the Upper Bay's left wall (at the Apron's level) down inside the rock to the basin: one broad way with a guideway down its middle (`LORE.md` §4). Span draws the portal, its gate and the first stretch of the bore; the rest is a route record (its lower portal is the basin's build's, section 5) |
| The watch post | records of Span's, placed on a swhighlands station 4 pillar (`KSTACKS.pillars`): the tower is the kit's, the post and the stair are Span's |

Span is a settlement: it goes in the gallery when it first reaches `main`.

## Core adoption (written before the first fragment, 2026-10-27)

Started from `settlements/pinnacle-rock` (a settlement on rock records from `core/terrain` with a biome kit read in place)
and `settlements/longsong` (one pre-planned complex, blueprinted before it was built, its rooms as data). The modules Span
takes, by name, and for each it does not, why:

| Module | Takes | For |
|---|---|---|
| `core/rand` | `KRAND` | every choice in the layout: each part's decay state, broken pieces, salvage, Dalab's patches by `KRAND.hash(world, part id, index, salt)`; never the kit's global `rng()` for placement (the kit's builders keep their own `reseed` streams inside a building, as every Ancients taker does) |
| `core/tags` | `50`, `52`, `53` | every part, bridge, pad, dome, gallery, hangar, Dalab's additions and the watch post registered before it is drawn (culture `ancient` or `dalab`, state, level) |
| `core/space` | `KSPACE` | the parts' overlap check on each level and the roads' clearance (`SPAN.checks`), the keep-clear the biome kit's dressing reads (no tree in a building, on a pad or a bridge deck) |
| `core/terrain` | the station's ground read in place: `38-core-relief` (`KRELIEF.tableland`/`joints`; the canyon as a `rille` record whose `tops` are Span's bench levels; the Upper Bay as a `pit` with benches), `35-core-strata` (`pillar`: the benches on its hard beds), `36-core-carve` (`KCARVE.face`/`cut`: the hangar mouths and the Basin Tunnel's portal cut into the walls), `37-core-stacks` (`KSTACKS.pillars`: the watch post's tower) | the canyon the arcology is fitted to |
| `core/host` | `FULL` (camera, loop, clock, panel, probe, inspector, polygon tool, marks, minimap, editor, cut-away) | the page shell; the cut-away for the Cross's floors and the wall galleries |
| `core/walk` | `KWALK` floors and blocks (SP3) | where a walker stands, registered as the page draws; the layout's own `links` are the coarse graph between places (every walkable part reached from the Basin Tunnel and the north highway, every way out of Dalab's hold through a named gate, the Line shut), checked in `test-span.js` |
| `core/atmos` | the shared sky (`skyBiome` from the station), `bindHost`, the skylight, height fog | the standard skybox, the canyon's mist |
| `core/water` | read from the station: still (the lake), flow (Pan Riba), fall (the Head Fall, the sluices) | Span adds the weir, the Sluice Stair and the Outfall Gate as structures; the water on them is `core/water`'s |
| `core/materials` | `record` (`KMAT`), `materials.json`, `tools/textures/pack.py` | the Ancients' white panel, tarnish, rust and concrete sets (as `kits/ancients/materials.json`), the sandstone from the station |
| `core/lod` | `KLOD` | 1.6 km of arcology: far parts as proxies |
| `core/minimap`, `core/export`, `core/clock` | as Pinnacle Rock | the map, the krator-world container, the day |
| `core/biome` | read in place through `biomes/swhighlands` | the ruin's flora (drip cap, log crust, anemone trees) is the kit's dress pass on Span's structure records |
| `core/terrain` `KCAVERN` | `39-core-cavern` | the Basin Tunnel's bore behind its portal, as far as the page walks it (a passage with a `door` opening at the portal) |
| `settlements/dalab` (the Dalab set) | read in place | everything Dalab builds (section 0) |

Not taken (each one line): `core/mask` (nothing is placed from a canvas); `core/city` (Span is **one pre-planned Ancient
complex**, no streets or lots: it asks for the `SINGLE_COMPLEX` exemption in `tools/check_core_use.py`, as Longsong has,
until `core/city` gains a single-complex mode; question 5. The trading post on the Apron is a few dozen buildings laid on a
deck the Ancients built, not a street plan); `core/hamlet` (it has no `trading post` or `garrison` focus and no `dalab`
culture row: question 5); `core/furnish`, `kits/interiors`, `kits/catalog` (the Cross's rooms are a later step, 6 in section
7); `core/simulation`, `core/sched`, `core/charactermodels` (the garrison's and the market's life comes after the build, as at
Pinnacle Rock); `kits/mechs` (the Valley's machines are a later life layer: question 7).

## 1. The site

**From the swhighlands plan (scale model 4.22, surveyed 2026-10-26):** Span's marker is **px 282,680**, ~2,534 m, +11 °C,
1,819 mm; Pan Riba (the Span river, 153 m³/s at its mouth, ~42 m³/s here) runs ~2 km from the marker, its bed at ~2,416 m,
in a valley only ~250 m under its shoulders at the model's 2 km a pixel. The kit carves the real canyon, a few hundred
metres deep, in `pillar` sandstone (red and white beds 5-40 m, Liesegang bands, vertical joints). 0.75 g, ~1.1 atm.
Pan Riba flows to the south-western lowlands; the pillar rim, where the tableland breaks down on its west and south, lies
downstream.

**The frame** (every number in this plan and in `span_blueprint.py`): **u runs downstream** along the canyon's axis, **v
across** (v > 0 the right bank, looking downstream), **y from the tableland's rim** (y = 0). Metres. The station session
lays the frame on the river it carves: origin on the river's line, u along its course. Within the Deep Reach the canyon is
straight (the Ancients straightened it); upstream and downstream of the built reach it meanders as the kit likes.

**Assumed** (the station session and the owner settle them; Span's plan scales with them): the rim at y = 0 ≈ 2,600 m; the
Deep Reach floor at y = -180 ≈ 2,420 m, on the model's bed; the lake 8 m under the rim (held by the Ancients' weir).

## 2. The rough floorplan (sheets in `floors/`)

Made on the shared blueprint generator (`settlements/voth/palace/blueprint.py`, the method of
`references/blueprints.md` in the painting-to-3d-world skill: one sheet per level, numbered parts with a key, a section with
heights exaggerated, the assumptions written down). This plan added circles, filled polygons and polylines to the generator
(opt-in keys; the four existing blueprints draw as before). It is at the scale of **districts and buildings**; only the Cross,
where Dalab lives, is drawn to zones. Regenerate with `python3 settlements/span/span_blueprint.py`.

| Sheet | What |
|---|---|
| `S0.png` | the site (~3.9 x 1.6 km): the lake and its two outlying sites, the weir, the canyon head, the Upper Bay, the Cross, the Deep Reach, the roads |
| `S1.png` | the rims (y 0): the bay's ring road and its sixteen domes, the Cross's roof road, the rim ranges along the Deep Reach, pads and rim domes, the Middle Bridge |
| `S2.png` | the walls (benches at y -40, -85, -130) and the Apron (y -45): the three-storey galleries on the -40 and -85 benches, the -130 service ledges; **the trading post on the Apron** at the Basin Tunnel's portal; the Low Bridge (fallen) and the Pipe Bridge with its hung payloads |
| `S3.png` | the canyon floor (y -180) and the slot under the bay: the river, seven hangars cut into the walls, three tanks, the works, Dalab's Line, the Sluice Stair, the Outfall Gate |
| `AREAS.md` | the floor area and the population at the peak, part by part, from the layout (`SPAN.area`): **815,895 m² (8.8 million ft²), about 9,200 people** (the hand estimate was 772,791; the layout counts the gate towers, 38,400 m², and the galleries' true depths) |
| `S4.png` | the Cross's main floor (y -10), Dalab's fort, in zones |
| `section-long.png` | along the canyon (heights x3): lake, weir, Head Fall, the Apron over the slot, the Cross and its sluices, the Deep Reach's tanks and bridges |
| `section-cross.png` | across the Deep Reach (true scale): the stepped walls, the galleries on the benches, a hangar, Tank 2, the Middle Bridge |

**Reading the concept** (`refs/40`, from the lake end): the lake with a landing pad on a stalk at the canyon head; an oval
**bay** ringed by a white road with domes inside and out and craft parked on its floor; a broad white band where two
highways cross the canyon (the **Cross**); below it the **deep canyon**, galleries down both walls, tanks and hulls on the
floor, hangars in the walls; pads and ring-walled domes along the rims; the outlying ring-walled sites by the lake beyond.

### The parts and their states

The kit's decay states (`kits/ancients/API.md`): 0 intact, 1 ruined, 2 toppled, 3 rehabilitated, 5 worn. Nothing at Span is
intact. Each part's state is fixed in the layout (the owner's call where it matters), its broken pieces by `KRAND` per part.

| Part | Where | Size | State |
|---|---|---|---|
| **The Lake Quay** | the lake's right shore, u -2200..-1800 | 400 x 130 m strip, slips and sheds in a low wall | 5 worn, overgrown |
| **The Lake Ring** | the left shore, u -1500 | ring wall r 150 m round a sunken court of six domes, a mole into the lake | 1 ruined, drowned on its lake side |
| **The Weir** | the lake's outlet, u -1050 | 180 m sluice dam holding the lake 8 m up | 5 worn, sound: Pan Riba spills through it |
| **Head Pad** | the canyon head, u -880 | pad r 32 m on a drum, a walkway to the ring road | 5 worn |
| **The Upper Bay** | u -750..-290 | the canyon widened (quarried) into an oval 460 x 320 m at the rim; ten terrace domes round its walls (r ~17), six ring-walled domes outside its ring road (r ~28) | 1 ruined, three domes toppled into the bay; three terrace domes **3: the traders' lodgings** |
| **The Apron** | in the bay, y -45 | an oval deck 370 x 236 m over the river's **slot** (50 m wide, its floor y -60 to -110) | cleared by Dalab: **the trading post** (section 4), one wreck too heavy to strip |
| **The Basin Tunnel's upper portal** | the bay's left wall at the Apron's level, (-570, -160) | an Ancient road portal (r ~18), the Tunnel Road down a ramp onto the Apron | **intact, cleared**: Dalab's gate and wardens |
| **The Cross (the Span)** | u -300..-180, v ±230 | the habitable bridge where the north and south highways cross the canyon: 120 m along the canyon, four storeys over the 300 m span (to y -18; its keel and piers to the river below), its roof the road (y 0); gate towers on both abutments | **3 rehabilitated: Dalab's fort** |
| **The Sluice Stair** | under the Cross | the river steps from y -110 to -180 in four sluices | 1 ruined, still running |
| **The rim ranges** | both rims of the Deep Reach, v ±152..190 | the white curved band: a continuous range 1 km long each side, two storeys over the rim and stepping over the edge | north A (u -180..240) **3: Dalab's Sound Quarter**; north B 1; north C 2 (slumped into the canyon with Rim Pad 3); south A, B 1 |
| **Pads and rim domes** | on the rims | four rim pads (r 28-36), three ring-walled rim domes (r 22-30) | Pad 1 worn (Dalab's drill ground and paddock); Pad 3 toppled into the canyon; the rim dome by the Cross 3 (the genepriests' house) |
| **The wall galleries** | the benches at y -40 and -85, both walls | three-storey gallery buildings 22 m deep, backs cut into the wall, fronts curved white terraces, 1 km long | north -40 (A) 3 (Dalab's stores); the rest 1 |
| **The service ledges** | the benches at y -130, both walls | conduits and a walkway, not floor | 1; mutant nests; the south ledge's downstream half fallen to the floor |
| **The Middle Bridge** | u 262, y 0 | a road bridge, 300 m | 1 ruined, passable; Dalab's forward barricade at its north end |
| **The Low Bridge** | u 482, y -85 | bench to bench | 2 toppled: two stubs, its middle on the floor |
| **The Pipe Bridge** | u 700, y -40 | three sagging pipes with payloads slung on cables (`kits/ancients` canyon target's `HANG`: pod, prison, drum) | 1 ruined; the drum fallen to the floor, the prison hanging by one cable |
| **The hangars** | cut into both walls at the floor, under the benches | seven, 90 x 42 m mouths | 1 ruined; one flooded, one with a craft inside, one (Hangar 6) the machines' den |
| **The tanks** | standing from the floor | three, r 18-28, rising to y -20, -60, -90 | Tank 1 worn, Tank 2 holed, Tank 3 toppled at its top |
| **The works** | the floor | the Engine Works, the Foundry, the Yard (derelict craft and machine wrecks) | 1 ruined |
| **The Outfall Gate** | u 800..830 | the downstream barrage, the river through its sluices | 1 ruined, breached: the machines and mutants come up the canyon through it |
| **The Valley Tunnel's portal** | the right wall on the floor, u 690..760 | an Ancient road portal; its bore runs toward the Valley of the Ancients | 1 ruined: not cleared, held by no one; the machines' way up |

## 3. Assumptions (the numbers)

| Number | Value | Why |
|---|---|---|
| Rim to floor | 180 m (y 0 to -180) | the model's bed (~2,416 m) under a tableland at ~2,600 m; "a few hundred metres" in the biome plan. Deeper is fine: the bench count grows (question 2) |
| Rim to rim (Deep Reach) | 300 m; the floor 140 m | the concept's proportion (a dome ~50 m against the gap); the old kit gorge at 1,400 m read as a plain |
| Benches | y -40, -85, -130; half-widths 128, 105, 85 m | on the `pillar` sandstone's hard beds (5-40 m beds): the walls step back where a hard bed caps a soft one, and every gallery stands on one |
| Wall faces between benches | near sheer (the station's `rille` face ~80°), no talus where built | the Ancients dressed the walls; a talus only at the floor's edge and below the fallen galleries |
| The bay | rim oval 460 x 320 m, the Apron at y -45 | the concept's oval bay: the canyon quarried wide; the Apron is a deck, the river under it in a slot |
| Storey | 4.5 m; gallery buildings three storeys (~14 m) on 22 m deep benches; rim ranges two | the kit's storey; a bench is the gallery's depth; the owner's trim (2026-10-27) |
| The Cross | 120 x 300 m over the canyon, four storeys; gate towers on the abutments | the concept's broad band; 36,000 m² a floor |
| Size at the peak | 815,895 m² of floor, ~9,200 people (`AREAS.md`, from the layout; `test-span.js` holds it between 700,000 and 850,000): homes at 35 m² gross a head, 30-60% of each part's floor | the owner's trim from ~1.34 million m² (15,000-20,000 people): a port and works town of an Ancient arcology's middling size (Arcoindian II: 5,000), not a city the tableland would have to feed |
| Head Fall | ~50 m (lake y -8 to the canyon head y -60) | the lake on the tableland, the canyon below it |
| The built reach | u -900..830, ~1.7 km; the whole site with the lake ~3.9 km | the concept |

## 4. Dalab's fort, its trading post and the watch post

*Proposed* throughout, except what the lore and the owner fix (Dalab holds the sound parts against the Valley's machines and
mutants; an intact, cleared tunnel from the basin, which Dalab counts as strategic; a trading post where Dalab trades with
the plateau's people, TBD; the watch post on a pillar-rim tower with a stair cut up its side).

- **Why Dalab holds Span**: **the Basin Tunnel** (the owner, 2026-10-27): an Ancient road tunnel, intact and cleared, from
  the basin up inside the rock to Span's bay: the handy way onto the plateau's top, and so the key to it. Span also holds the
  crossing (the two Ancient highways meet on the Cross), watches the Valley from the south (the State watches from the north,
  `LORE.md` §6.19), and salvages for the God.
- **The Basin Tunnel**: one broad way with a guideway down its middle, as the Ancients built their roads (`LORE.md` §4),
  lit by Dalab's lamps; wardens' posts and lay-bys along it; a gate at each portal. Its upper portal opens in the Upper Bay's
  left wall at the Apron's level, a ramp down onto the Apron. A road climbing ~1.2-1.5 km at the Ancients' gentle grade is
  20-30 km of tunnel (or shorter in spirals inside the rock): Span draws the portal and the first few hundred metres, the
  rest is a route record. Its lower portal stands at the plateau's foot in **the south-western lowlands** (the owner,
  2026-10-27), placed from the model with that region.
- **The Valley Tunnel** (the owner, 2026-10-27: a second Ancient road tunnel, to the Valley of the Ancients): its portal
  in the right wall on the Deep Reach's floor (u 690..760), beyond the Line: **not cleared, held by no one**. The machines
  and mutants come up it, and up the canyon through the breached Outfall Gate; it is why the Line faces the Deep Reach.
  Its far end and its state inside are question 3.
- **The trading post** (on the Apron, S2): where the tunnel's caravans from Dalab meet the plateau's people, who come down
  the north highway and the bay's ring road (who they are: TBD, question 10). The **market** at its heart; **customs** (the
  scribes' hall) at the tunnel road (tolls, tallies, the priests' cut); **warehouses**; **two inns** (one for the tunnel's
  caravans, one for the plateau's traders) and a **tavern**; a **bath house**; the **caravan yard** where lizard trains are
  made up, with a ramp up to the Cross's stalls; the resident traders' **timber-frame houses** (the trader caste's way,
  §6.1); a **shrine** facing the lab; fields and lizard pens at the Apron's upstream end; three terrace domes rehabilitated
  as **lodgings**. All from the Dalab set (section 0). About 500 people: traders and their households, inn and caravan hands,
  porters, the tunnel's wardens.
- **The arena and the ritual combat** (the owner, 2026-10-27): Span is not only a market town. The SW highlanders come to test
  their strength against Dalab's finest enhanced warriors: once a year their strongest meets Dalab's champion in ritual combat.
  **As long as Dalab wins, year after year, Dalab has their loyalty; should it lose, the consequences might not be pretty.**
  The arena is the Post-Apoc kit's Thunderdome (`kits/post-apoc` 56-arena.js); Dalab runs it (held, its banners at the gate).
  Round it **the highlanders' quarter**: thirteen of the Post-Apoc kit's salvage houses for the fighters, their followers and the
  traders who stay (the people's own marks wait on who they are: the kit's generic dress until then). Arena and quarter stand
  together, compact (180 x 160 m), inside a **palisade** (the kit's `palisade`) on the tableland just outside the Cross's north
  gate, its gate in the south wall's west end opening toward that gate, the nearest way into Span (the owner, 2026-10-27); a
  street runs from the palisade's gate north, then east to the arena's entrance. *Proposed*: the
  champions are the genepriests' best work (cold- and strength-modded Giants among them); the night before the fight the market
  is at its fullest; a loss would mean the tribute, the loyalty and perhaps the tunnel's mouth are in play.
- **Dalab's marks** (2026-10-27): Dalab's own **gates** (the Dalab set's `dalab_gate`: battered rammed-earth pylons with the holy
  red band, timber leaves, banner poles) in the openings it keeps (the Cross's north and south gates, the tunnel's cutting, the
  quarter gate on the rim road), its **banners** (`dalab_banners`) on what it holds (the Cross's roof, the Sound Quarter, Pad 1,
  the arena's gate); **the Line** is a salvage barricade (the Post-Apoc kit's `barricade`: container walls, tyre walls, sheet
  metal, a container gate tower, kept shut) across the floor under the gun gallery.
- **The mission** (the owner, 2026-10-27): inside the palisade, by the arena, a **temple** where Dalab's priests try to
  proselytize the highlanders and where the Dalabits at Span worship (the Dalab set's `dalab_temple`), the priests' house beside
  it (`dalab_priest_house`) and a wayside shrine on the quarter's street (`dalab_shrine`). *Proposed*: the mission is how Dalab
  means to keep the highlanders' loyalty when the champion's arm no longer can.
- **The watch post** (SP5, 2026-10-27): Dalab's post on **the watch pillar** of the pillar rim downstream (L.pillars: a stand-in
  rim, a cliff at u 1300 down to its floor at y -260 and five pillars, until SW highlands station 4 lands): a stone-walled
  compound (the Dalab set's `dalab_post`: beacon pyre, signal mirror toward the Cross, stele) round a watch tower and a hut,
  on the 272 m pillar's top. It is reached by **the cliff stair** cut down the rim's cliff in switchbacks from the rim road,
  a path across the floor, and **the watch stair** cut round the pillar's faces to the post's gate (the layout's line is a
  square round the pillar, its spec; the page draws an even helix fitted to the drawn rock).
- **The garrison**: about 240: a priest-captain, three genepriests (the clinic; the shelf coral as an ore-finder and the
  fishing bridge's venom, swhighlands section 6), Giant street patrols in threes (§6.1), soldiers and lizard riders, servants
  and salvagers, rotated from Dalab. **About 750 people in all**, against the arcology's ~9,200 at its peak.
- **Where they live**: the **Cross** (S4: gate halls at both abutments, the Spine, mess, kitchen, clinic, lizard stalls with a
  ramp down to the Apron, the water hoist, armoury, ready rooms, the sealed lift head, the gun gallery on the downstream face),
  the **Sound Quarter** (north range A and the north -40 gallery under it: quarters, stores, workshops, roof gardens), the rim
  dome by the Cross (the genepriests' house), **Rim Pad 1** (drill ground and paddock). Dalab lives in partitioned corners of
  the Ancient halls; the rest stands empty, sealed or stripped. Its own building is crude and later: rammed earth, timber,
  salvage panels, red marks on what is holy.
- **The Line**: a salvage wall across the canyon floor under the Cross, one gate kept shut; the Cross's gun gallery above it.
  Everything downstream of the Line (the Deep Reach's floor and lower galleries) is **no man's land**: the machines' den in
  Hangar 6, mutant nests on the -130 service ledges. Dalab patrols the rims and the upper galleries, and the forward barricade on
  the Middle Bridge.
- **The mound**: an earth mound beside the south highway (S0 10), imitating the domes, facing the lab (south-west); the
  priest-captain communes with the God from it (§6.1: each town's mound faces the lab).
- **Food**: fields and lizard pens at the Apron's upstream end; the rest up the tunnel from Dalab, and what the plateau
  sells.
- **The watch post**: on a pillar-rim tower (250-300 m, swhighlands station 4), downstream of Span, with a line of sight to
  the Valley's approaches and to the Cross's signal mast (or a relay). A walled compound on the flat top (Dalab's grey
  megalithic stone, the nobles' and the army's), a hut or two, a beacon and signal mirrors; 8 to 15 posted; the stair cut up
  the tower's side, zig-zagging through the cloud forest on the talus and cut into the rock above it (`refs/27`); a rope hoist
  for loads. Its records are Span's, its tower the station's.

## 5. What Span hands the biome kit (the hand-over; also in the shared notes folder)

1. **The frame**: origin on the river's line at the Deep Reach's head; u downstream, v across (right bank +), y from the rim.
   The Deep Reach (u -180..830) straight; the canyon head (u -900..-750) and the reach below the Outfall Gate free.
2. **The canyon's section** (the station carves it; Span fits to it):

   | u | Rim half-width | Floor y | Profile |
   |---|---|---|---|
   | -1050 | (the lake, y -8) | | the weir's sill at y 0 |
   | -900..-750 | 60-70 | -60 | the canyon head, natural; the Head Fall at -900 |
   | -750..-290 | the bay: oval rim 230 x 160 | the slot: -60 to -110 under the Apron (y -45, Span's) | quarried: a `pit` with benches at y -15 and -30 for the terrace domes |
   | -300..-180 | 150 | -110 to -180 (the Sluice Stair, Span's) | under the Cross; abutments cut back to v ±230 |
   | -180..830 | 150 | -180 (to -190 at 820) | **benches at y -40, -85, -130, half-widths 128, 105, 85; floor half-width 70**; faces near sheer; a talus only at the floor's edge (~15 m) |
   | 830 on | the kit's | falls to the plunge fall | natural, meandering |

   Suggested in core: the Deep Reach as `KRELIEF.rille` with `tops` = the bench levels and a steep `face`; the bay as
   `KRELIEF.pit` with `benches`; the hangar mouths and the Basin Tunnel's portal as `KCARVE.cut` sites (sheets S2 and S3
   give each box).
3. **Footprints to keep clear of trees and dressing** (Span's records, by id, published with the layout): every room in
   S0-S3, the roads (the north and south highways at u -240, the rim roads at v ±205, the ring road, the roads to the lake
   sites), the bridges' decks, the pads.
4. **Anchor points**: the lake's level y -8 and its outlet at u -1050; the canyon head u -900; the bay's oval centre
   (-520, 0); the Cross (u -300..-180); the Deep Reach (u -180..830); the Outfall Gate (u 800..830); the two lake sites
   (the Quay u -2200..-1800, v 470..600; the Ring at (-1500, -570), r 150); the mound (-300, -430); **the Basin Tunnel's
   upper portal** at (-570, -160), y -45, in the bay's left wall: the tunnel runs away from the canyon inside the rock, so
   no carve may cross its line (S0: south-west from the portal, falling toward the basin); its lower portal is wherever the
   basin's foot in the south-western lowlands, for the lowlands' session to place; **the Valley Tunnel's portal** on the
   floor's right wall (690..760 x 70..124, y -180), its bore running away from the canyon on the right bank toward the
   Valley: keep carves off both tunnels' lines (`ways` in the layout).
5. **Structures to dress** (the kit's flora on Span's records, a `dress` tag on each): drip cap on piers, posts, the Cross's
   keel and the Pipe Bridge's cables; log crust on everything fallen (Pad 3, the Low Bridge's middle, north range C, the
   fallen south service ledge, the toppled domes); anemone trees on the rim ranges' roofs, the tanks' tops and the ruined
   galleries' terraces; nothing on Dalab's parts (the Cross, the Sound Quarter, the trading post on the Apron, the three
   lodging domes, the tunnel's portal) but its gardens.
6. **The watch post's tower**: a pillar of station 4 whose top is flat and at least ~40 x 40 m, its side with a ledge line a
   stair can follow, a line of sight to the Valley and to the Cross (or a relay), on Dalab's road (the rim road on, downstream).
   The station picks it; Span places the post and the stair on it.

## 6. How it is built (the kit and the method)

**From the skill doc** (painting-to-3d-world: `references/blueprints.md`, `references/vertical-settings.md`, sections 5h, 5j,
5o, 5s): the programme and the rough plan first, approved before any data; a **layout fragment that builds nothing**, with
explicit levels and the walk graph, asserted in node before the browser (parts disjoint per level, every gallery on its bench,
every bridge's ends on its rims or benches, every pad on a rim, every level reached from the roads, each check with a
negative); room and wall ids the same at every decay level, ruins broken by hash, then jittered by placement; interiors as
rooms fitted to the shell the page draws, later.

**`kits/ancients` already has** (each to be checked against the concept before it is used):

| Span's part | From the kit |
|---|---|
| The Pipe Bridge's pipes and payloads | `63-canyon.js` (the canyon target, titled "The Span" in the kit: pipes, `HANG` payloads, the fallen variant); its own gorge rock is not used (question 4) |
| The ring-walled and broken domes | `64-dalab.js` (opaque domes, ribbed passages, a bitten-open quadrant with `sectionInterior`) |
| The Cross's structure | `89-arcbeam.js` (the canyon bridge-city: deep main beams, secondary spans, terraces on both faces) as the model for a new, smaller builder |
| Pads, hangars | `44-starport.js`, `8ao-iz-spaceport.js`, `8al-alt-04-starport.js` |
| Tanks | `78-factory-silo.js`, `84-fuel.js` |
| The works | `88-factory.js`, `8ak-alt-c-works.js` |
| Dalab's patches | the decay-3 `repairPass` |
| Dalab's own buildings | not this kit: the Dalab set in `settlements/dalab` (section 0), on the same core |
| Rooms inside (later) | `8zz-interiors.js` and `kits/ancients-interiors` |

**New builders** (SP2, done: `kits/ancients/targets/span/8as0-span-parts.js`, seeds 12300-12379 in `DESIGN.md`): the **bench gallery** (a curved terrace
building along a path, its back to a wall), the **rim range** (the white curved band on a rim, stepping over the edge), the
**ring-walled dome** (a dome inside a low ring wall, the concept's motif), the **pad on a drum** (a round pad, cantilevered or
on a stalk), the **Cross** (a habitable bridge building), the **weir and sluices**, the **road tunnel portal** (the Basin Tunnel's,
intact: one broad way with a guideway). Built first on a kit target
(`--target span`, every state) before Span's page takes them. They take a ground height from the station (the kit assumes
y = 0 today: `API.md` "Ground contact"), so each builder is called with its part's base y.

## 7. Order of work

- **SP0.** This plan and the rough floorplan; the owner's answers (section 9). The hand-over to the swhighlands session.
- **SP1.** *(done 2026-10-27)* The layout as data: `src/30-span-layout.js` (106 parts, 13 ways, the links; `[G data]`),
  its rules `src/31-span-rules.js` (`SPAN.checks`, the walk graph, `SPAN.area`, the decay seeds by `KRAND.child`, the frame,
  `core/tags` records), `test-span.js` (every rule with a negative; seeds, frame, tags, `AREAS.md`), `layout_dump.js` for the
  sheets. The checks caught, on the first run, two overlaps on the Apron and the floor, a ring dome over the canyon head
  and roads through three domes: all moved.
- **SP2.** *(done 2026-10-27)* The new kit builders on `kits/ancients`' `span` target (`targets/span/8as0-span-parts.js`,
  `dist/span.html`), every state (intact, ruined, toppled, rehabilitated, worn): `buildSpanGallery`, `buildSpanRange`,
  `buildSpanDome`, `buildSpanPad`, `buildSpanCross`, `buildSpanWeir` (and the sluice stair, `steps`), `buildSpanPortal`.
  Each takes `(scene, gx, gz, d, o)` with `o` the layout record's size, base `y` and turn `ry`; decisions by `KRAND`,
  records in core/tags. `verify.py --assert` passes (428 k triangles for all forty). Their gaps: `kits/ancients/KNOWN_ISSUES.md`,
  "Span's pieces". The existing builders (hangars, tanks, works, the Pipe Bridge's `63-canyon.js`) are checked in SP3.
- **SP3.** *(done 2026-10-27)* The page: `build.py` -> `dist/span.html`, the Ancients kit's runtime and Span's pieces read in
  place, core/rand, core/space, core/tags, core/atmos (the shared sky at px 282, 680), core/host FULL; every part of the
  layout drawn at its place and state (`src/8at-host-place.js`); the ground a stand-in, `SPAN.groundAt` (the layout's own
  section, which the station carves). `verify.py --assert` passes (the layout's rules, every part placed, the tags, NaN, the
  inspector's volumes, two negatives). New in the layout on the way: the ground-contact rule (every part that stands on rock
  stands on `SPAN.groundAt`), the portals' and hangars' cuts, the lake's outline; the hangars cut back to the -130 bench
  (they ran under the -85 gallery). Gaps: `KNOWN_ISSUES.md`.
- **SP4.** *(done 2026-10-27, but the Line and the banners)* Dalab's fort and trading post from the Dalab set
  (`settlements/dalab/src`, read in place: the Vernacular helpers, items, dwellings, trade, town types, civic, sacred, its
  library pack in a second sidecar), placed through `VERN.place` at each record's footprint, which is the def's own (a page
  check): the trading post on the Apron building by building, the mound (76 x 90), a watch tower at the Middle Bridge's
  north end. The held Ancient parts carry the kit's decay-3 patches. Left: the Line (no Dalab def), banners and gates, the
  orchards' trees (the flora is the biome kit's): `KNOWN_ISSUES.md`.
- **SP5.** *(done 2026-10-27, on stand-in pillars)* The watch post on a pillar-rim tower: the stand-in rim and pillars (core/terrain
  KSTACKS 'pillar' bodies, their beds KSTRATA's 'pillar' recipe, contoured (KSTACKS.contour, core/terrain 37b) and weathered; the library's grain from
  `materials.json`), the post from the Dalab set, the cliff stair and the watch stair fitted to the drawn rock (Pinnacle Rock's
  rule), and the mission inside the palisade. Station 4's `KSTACKS.pillars` field replaces the stand-in: `KNOWN_ISSUES.md`.
- **SP6.** The Cross's rooms (a blueprint per floor: `blueprints.md` step 6), `kits/interiors`; the life layer after.
- **SP7.** `PORT.md`, the index tools, `tools/check_core_use.py`, the gallery.

## 8. Views for the verify

The concept's view (over the lake, down the canyon); the Cross from the bay; the Deep Reach from the Cross's gun gallery;
the floor among the tanks; across from the Middle Bridge; a hangar mouth; the Pipe Bridge from below; the watch post from
the canyon road and from its top looking toward the Valley.

## 9. Open questions for the owner

Settled 2026-10-27: the layout and the trimmed size (the old question 1); the Dalab set for Dalab's buildings (old 6);
the Basin Tunnel, intact and cleared, down to the south-western lowlands, and a second tunnel to the Valley, in place of
the proposed Under-Wall Portal (old 3); a trading post, not only an outpost.

1. *(settled)*
2. **The depth**: 180 m on the model's bed and three benches, or deeper (250-300 m, four or five benches) as the biome plan's
   "a few hundred metres" allows? *Recommended*: 180 m; deeper only if the station's tableland stands higher.
3. **The Valley Tunnel**: open all the way (the machines' road) or blocked partway (they come over it or round it)? Does
   Dalab mean to clear it, or keep it shut behind the Line? And the Basin Tunnel's lower portal: a fortified portal with a
   small post (*recommended*), placed from the model with the lowlands.
4. **The name clash**: `kits/ancients`' canyon target is titled "The Span" (pipes with hanging payloads, 2026-09). Take it in
   as Span's Pipe Bridge and retitle the target? *Recommended*.
5. **Placement on core**: Span is one pre-planned Ancient complex: the `SINGLE_COMPLEX` exemption from `core/city` (as
   Longsong), with the trading post's buildings as records in Span's layout? Or add a `trading post` focus and a `dalab`
   culture row to `core/hamlet`? *Recommended*: the exemption now; `core/hamlet` when Blade and Ledge need the same.
6. *(settled: the Dalab set)*
7. **The Valley's machines and mutants**: drawn in this build (wrecks only, or `kits/mechs` walkers in Hangar 6), or left to
   the life layer? *Recommended*: wrecks and signs now, live ones with the life layer.
8. **The numbers today**: the garrison (about 240), the trading post (about 500), the watch post (8 to 15).
9. **The ritual combat**: how often (yearly, the owner), who fights (one champion each, or a team), to the death or to yielding,
   what Dalab gains each win (tribute, recruits, the right to the road) and what a loss would cost.
10. **Who lives up there** (TBD, the owner; they are the SW highlanders who fight in the arena, 2026-10-27): the plateau's people Dalab trades with, and what passes: Dalab's mods, healing
    and lowland goods up the tunnel; down it, perhaps the plateau's furs, ore (the shelf coral's finds), the fishing bridge's
    venom and the highlands' plants. Their side of the market waits on it, and their marks (a culture pack) on their quarter.
11. **The watch post's tower**: how far downstream (it must see the Valley and signal the Cross), chosen with station 4.
