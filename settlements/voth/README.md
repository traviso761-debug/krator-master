# Voth

The Voth site editor and the Voth city plan: the first world on **`core/city`**, the city builder and its infill
(`core/city/README.md` has the method, the records, what a world provides, and the plan to port every settlement to it).

```
python3 build.py                                   # dist/voth-site.html and dist/voth-city.html
python3 verify.py dist/voth-site.html --assert     # headless: the site editor
python3 verify.py dist/voth-city.html --assert     # headless: the city plan on the site
python3 serve.py                                   # serve both pages; the editors save through it
```

Serve the folder (`python3 serve.py`, port 8813) and open `/dist/voth-site.html` or `/dist/voth-city.html`.

This build grew in `settlements/streetlab`, which began as a street-placement toy on a plain, the test bed for the
method. The toy is retired: its machinery is `core/city`, and its own steps 0-5 (a triangle of landmarks, a noisy wall,
ring avenues) are in the history. On 2026-10-14 (the owner: "Rename the folder to voth") Streetlab became
`settlements/voth`, Voth's home, beside the first Voth's source; the first Voth's page is retired ("The source
library" below).

| Path | What |
|---|---|
| `build.py`, `vothlift.py`, `foreign.py`, `ringsea.py` | the build of both pages; what it lifts from `src/` by name; the embassies; the Ring Sea vessels |
| `targets/voth-site/`, `targets/voth-city/` | the two pages' own fragments |
| `site/` | the owner's saved site, marks and plan edits (`serve.py` writes them; the build inlines them) |
| `src/` | **Voth's source library**: the first Voth's fragments, run whole or lifted by name, never copied |
| `catalog/` | Voth's building catalog (`catalog/README.md`): `core/city` builds every lot with its registries |
| `three.min.js` | three.js r128, the copy the pages, the catalog page and the gallery take |
| `verify.py`, `serve.py` | the headless checks; the save server |
| `HANDOFF.md`, `HANDOFF-REFACTOR.md`, `SIM-ROADMAP.md`, `API.md` | the session handoff, the simulation's merge note and its brief, the contract of `src/` |

## The Voth site editor (`targets/voth-site`, `dist/voth-site.html`)

The ground of Voth with no roads, for marking out where things go before any street is placed. Run
`python3 serve.py` and open `/dist/voth-site.html`.

* **The ground is Voth's own.** build.py wraps Voth's data fragments (`05-palette`, `10-core`, `15-shore`, `30a`) in one
  closure, `VOTH`, and lifts the pure pieces it needs from the others by name:
  * the islets and river bridges that `30c-roads.js` adds (the islets change `terrainH`);
  * `groundTone` (`40-ground.js`);
  * the span constants and `bedAt` (`50a`);
  * `shade`, `loc` and `rectFrus` (`45-kit.js`);
  * `span()` and `reclaimedCauseway()` (`50f`).

  Nothing is copied, so a change to Voth's terrain or canton layout shows up on the next build. Roads, buildings
  and the ground canvas are left out.
* **Cantons** are the city's captured models (`voth_city_canton_*`), each anchored by its plinth on the canton's
  own position and lake bed.
* **Bridges and causeways** are Voth's own `span()` and `reclaimedCauseway()` run on its `SPANS`, `CAUSEWAYS` and
  `RBRIDGES`, with the city's seeds. Left out: the stairs and doors that tie each end into a canton's tiers. The span
  pylons are simplified.
* **Districts**: modes 2-6 draw park, market, funerary, plaza and misc districts.
  * Click the ground or the minimap to add corners. Close with the first corner, a double-click or Enter.
  * In select mode (1), drag corners, click a mid-edge dot to add a corner, right-click a corner to remove it, and
    press Delete to remove the selection.
  * Each district has a name, a type and a note.
  * **copy as Voth DISTRICTS entry** gives the line for `30a-layout-districts.js`.
* **Markers**: mode 7 places markers A, B, C... for landmark placement. Each has a letter and a note.
* **Avenues** (mode 8): polylines with a width, painted on the ground over the districts. Finish with a
  double-click or Enter. They edit like districts.
* **Causeways** (mode 9): Voth's nine stand as records (`origin: voth`) that can be reshaped or deleted.
  * The first edit copies them into the site; until then the site keeps `causeways: null`, meaning Voth's own.
  * Drawn ones are built by Voth's own builders, chosen in the editor:
    * `mole`: `reclaimedCauseway`, reclaimed land at the waterline;
    * `bridge`: `span`, at Voth's causeway height over water, easing to the ground ashore, with a pier pad under
      each inner corner.
  * An end inside a canton's square gets Voth's abutment up its flank.
* **Ground** (R raise, L lower, M smooth): brushes. Hold the left button; `[` and `]` resize the brush, and the
  slider sets the strength.
  * Each stroke (`{m, r, s, pts}`) is kept in `site.terrain` and replayed onto a 6 m height-delta grid (`TERR`,
    `10-site-model.js`). The ground everywhere is Voth's `terrainH` plus that delta.
  * Edited ground takes its colour from its new height, by `groundTone`'s rules.
  * Anything that reads the site gets the same ground by replaying the strokes.
* **Undo** (the button, or Ctrl+Z / Ctrl+Y) covers every change, one brush stroke at a time.
* **Surfaces** are library sets (`materials.json`) laid as grey detail under Voth's colours, in world space:
  * `stone.cut` on cantons, bridges and causeways;
  * `ground.dirt` on the ground, with `rock.rock_face` on slopes and `ground.coast_sand_01` at the shore.

  The sun casts shadows over the bay.
* **Saving**:
  * **save** (Ctrl+S) writes `site/voth-site.json` through `serve.py`. Without the server it downloads the file.
  * Every change is also kept as a browser draft, offered back with **restore unsaved draft**.
  * The build inlines `site/voth-site.json`, so commit it with the work.
  * **import** and **export** take the same JSON. **add Voth's current districts** starts from the ones Voth has now.

```
site      {site: 'voth', version, saved, districts, markers, avenues, causeways (null: Voth's own), terrain}
district  {id, type: park|market|funerary|plaza|misc, name, note, poly: [[x, z], ...]}   (Voth's frame: x east, z south)
marker    {id: 'A', x, z, note}
avenue    {id, name, width, note, pts: [[x, z], ...]}
causeway  {id, name, kind: mole|bridge, width, note, origin: voth|drawn, pts}
terrain   [{m: raise|lower|smooth, r, s, pts}, ...]   (brush strokes, replayed in order)
```

`python3 verify.py dist/voth-site.html --assert` checks that:
* every canton is placed;
* the bridges are built;
* the ground is Voth's;
* the tools draw, letter, undo and redo.

## The Voth city plan (`targets/voth-city`, `dist/voth-city.html`)

The toy's street method run on the owner's site (`site/voth-site.json`), over Voth's own ground with the owner's
ground edits, then the country round it and the ferry and elephant bug lines. The step slider shows the city after any
step (0–14). **lots**, **wealth**, **transit** and the **inspector** are toggles.

Since 2026-10-14 the city is a `core/city` instance (`35-vc-steps.js`: `VC.city = KCITY.create({...})`, its steps as
data, its hooks and finish): steps 0-5 call core's site layer with Voth's data (`30-vc-site.js`: the role table
`VC.ROLES`, the zone, the avenues and rings, the highways, the wall's records; `VC.terrGrid` takes the banks and gate
pads), steps 6-8 and the infill's reach are core's defaults, and the road, field and footprint hashes are core's index
on core/space (`VC.clashWide` is folded into `SL.clash`). The placement did not move (hash `ff007aab`, `python3
verify.py dist/voth-city.html --hash`), and the plan's Export button works (it threw).

The sidebar lists the ferry and elephant bug lines: stops (and the map edges a line enters or leaves by), vehicles and
the time for one round. Click a line to pick it out on the map.

**marks (p)** is the polygon tool. It draws areas, lines and points on the ground, each with a name and a note, and
gives a line's length and an area's size and perimeter (also saved, as `length_m` and `area_m2`). Click
the ground to add points; Backspace takes the last one off; Enter or a double-click finishes. Under `serve.py` the marks
save to `site/voth-city-marks.json`, so Claude can read them. Opened any other way, they keep in the browser.
**copy JSON** copies them all. Every panel folds to its title with its **–** button. The lighthouses turn Voth's beacon beams (82-daynight.js), always lit here.

The dev tools (`58-vc-tools.js`):

- **Paths** is Voth's path visualizer (`settlements/voth/src/87-pathviz.js`, lifted by `build.py`). It shows the streets by class, the elephant bug and ferry lines with their stations and each vehicle where it is now, and the painted streets. Pick one or all from its list; it follows the step slider.
- **The pin** comes from Dhelv's camera. A double-click on the ground drops a pin; **G** flies to it; **F** walks from it (Esc clears it). Walking follows the ground.
- **edit (b)** is the plan editor, after the Ys city editor:
  - **place building** puts a Voth kit building, with its variant, where you click. With *align* on, it faces the nearest street and stands back off it. **Q/E** turn the last one 15°; **R** aligns it again.
  - **paint street** draws a street of any class: click points; Backspace, Enter or a double-click, Esc.
  - **delete** takes out a building, placed or generated, or a painted street.
  - **flora** (`59-vc-flora-edit.js`):
    - *select and delete*: a click picks the tree, or the placed plant, the ray passes nearest. Delete (or the button) removes it at once, and Esc lets go.
    - *plant*: a click plants the chosen species or plant on whatever floor is under it (a canton's deck, a park), at the chosen height or the species' own.

    Live, the page hides exactly that tree's instances and triangles. The kit brackets every tree's writes (`SWBAY.onFlora`), and the page maps them to the baked meshes (`VC.flBake`).
    On the next load, the kit's veto (`SWBAY.veto`) leaves a deleted tree unbuilt. It keeps its place, index and seed, so every other tree stays as it was.
    The ground cover the kit scatters by itself (ferns, moss) cannot be picked.
  - **undo** (Ctrl+Z), **save**, **copy JSON**.

  Under `serve.py` the edits save to `site/voth-city-edits.json` (POST `/save/voth-city-edits`). The layout applies them when the page next loads (`VC.applyEdits` in `35-vc-steps.js`):
  - painted streets and placed buildings join at step 3, after the avenues, so later streets and lots work round them. A placed building takes out the lots it overlaps and stands on HARD ground. Its class is the kit class that lists its key, so the census counts it.
  - deletions run once the whole plan is laid. Each takes out the building under its point from the step it was born.

  The flora edits save in the same file (`flora: {del, add}`).

  The page reads the file fresh under `serve.py`; `build.py` inlines it (`EDITS_INIT`) for the static page. Keep the file, even empty: the page asks for it.

At the last step the sidebar shows the **census**: an estimate of residents, the working half of them, and the
workplaces by kind of work (rates in `TUNE.census`; the Voth cantons' own people are not counted).

**Power and light** (`37-vc-light.js`, `TUNE.power`, `TUNE.light`; owner, 2026-10-09):
* Voth's power houses (`voth_generator` v0, the steam turbine hall, and `voth_bldg_power_station`, the power station
  that replaced the small fumarole house on 2026-10-12) are placed at step 9, on the
  avenues and main streets of the industry district, before its lots fill. They stand on HARD ground, as civic lots do,
  and the census staffs them (`TUNE.census.jobs.power`). The generator is no longer one of the random `industrial` pieces.
* Electric light reaches the industry district, the guilds (guild halls, the Guild canton), the clan compounds and wealthy
  houses within `TUNE.power.reach` of a power house, and the Palace and Temple interiors. Each lot carries `light`
  (`electric`, `lantern` or `torch`), shown in the inspector.
* Street lamps are socketed as each street is laid: a wrapper on `SL.addWay` records `way.lamps` at `TUNE.light.every`,
  sides alternating. Once the city stands, each socket's kind is settled:
  * electric masts in the industry district;
  * fancy lantern posts on wealthy streets (wealth at least `TUNE.light.fancy`) and round the canton decks;
  * plain lantern posts elsewhere;
  * torches in the alleys and poor quarters.

  A socket that a later street crossed or a building took slides along its street (`TUNE.light.slide`); failing that, it is dropped.
  The lamps are records (`PLAN.lamps`), drawn from Voth's primitives per step. Their heads glow in the kind's colour
  (`TUNE.light.glow`), always lit until the day and night cycle dims them.

**The flora** (the south-west bay biome; `38-vc-flora.js`, `VC.drawFlora` in `55-vc-host.js`, `TUNE.flora`; owner, 2026-10-09):
* `build.py` bundles `core/biome` (10–40) and `biomes/swbay/src` (50–75) into one closure that exports `BIO` and `SWBAY`.
  The files are read from their own folders. The bootstrap binds THREE before the kit's fragment 50 loads.
  `SWBAY_TEMPLE_H` = 40 keeps the canopy low: small hypertrees. `VC.flora` scales the canopy species' crowns and boles
  by the same ratio (`crownK`).
* **The mask** is its own 4 m grid, rasterised from the plan (no canvas pixels):
  * 0 on water and on everything built or worked: streets, lanes and highways, lots, fields, the wall, plazas and
    markets, the works and farm districts, the monastery, the funerary ground, the orchards, the islets' landmarks and the lamps;
  * inside the wall, open only in the parks;
  * outside the wall, open on the natural ground.
* **The climate:** the parks hand the kit wet lowland, so it grows its jungle there (hyper and rain zones). The rest is
  dry upland, so it grows the savannah: baobabs, monkey puzzles, umbrella thorns, dragon trees, parasols, dry grass.
* The LOD spine covers the parks, a 700 m lattice over the build zone and a 1 km lattice over the open country. The
  kit's runtime LOD (`BIO.lodTick`, every frame) draws only the chunks near the camera.
* The biome builds into one group with the country (step 13). The **flora** layer button hides it.

**The placer's menu** (`58-vc-tools.js`): in place mode the editor shows every Voth kit piece as a picture in a
searchable grid (name or family). Each picture is the piece built once off screen and drawn into a small render target
on the page's own renderer, read back and kept. They are drawn two a frame from when the editor first opens, and the
ones the search shows go first.

**Day and night** (`VC.dayNight` in `55-vc-host.js`, `TUNE.clock`; owner, 2026-10-09). One clock drives the page:
core/clock's `KCLOCK`, a 72-minute day. `build.py` adds `core/clock` and `core/atmos` (`0-core`, `0p-presets`, `2-lights`,
`3-particles`, `4-weather`, `8-export`, `9-host`, `b-skylight`) as their own scripts.
* **The sky** is the standard Krator sky, Voth's own: `build.py voth_sky_fragment()` lifts `20-stage.js` section 5 (the baked
  volcano dome, the sun and moon discs) and `21-sky.js` up to its panel (the gas giant and its rings, the stars, the sun
  disc, the pressure and eclipse model) into `VSKY`, with Voth's core helpers as a private stream. Nothing is copied. It
  is not in core/atmos yet: `GODOT-PLAN.md` moves `21-sky.js` there as a sky preset in the refactor.
  * `VC.dayNight` makes it (`VSKY.make`) and draws its background scene before the city each frame (a wrapper on
    `renderer.render` for the screen pass only).
  * The clock sets its hour, day and day of the year (`TUNE.clock.doy`). Its state drives the city's sun: the key light's
    direction, colour and strength, with planetshine at night and eclipses. It also drives the sky fill, and the fog takes
    the dome's horizon colour.
  * `ATMOS.skylight` captures it as every standard material's reflections, recaptured as the hour moves.
  * The volcano smokes, with a small or large eruption now and then, picked by an integer hash of the clock's quarter
    hour (`TUNE.weather.eruptLarge`, `eruptSmall`), so the same hour always shows the same sky.
* **The weather** is core/atmos's (`ATMOS.weather`) with its opt-in ash modes. The **Weather** select in the panel offers
  auto, clear, rain, storm, fog, ashfall and ash (the ash storm). The page opens clear (`TUNE.weather.mode`).
  * The module draws the rain and the ash flecks.
  * `VC.applyHour` does what the weather does to this scene (`TUNE.weather`): it closes the fog in, dims the sun and the
    fill, browns the haze in ash, lights everything in a lightning flash, and veils the dome (which takes no fog).
  * An ash storm puts the volcano in Voth's violent bake.
* **The lamps:** every lamp head is a core/atmos glow (`ATMOS.glowAdd`) with its own on and off hours
  (`TUNE.light.hours`):
  * electric switches on at once;
  * lanterns are lit one by one through the evening;
  * torches burn out before dawn.

  The lamp heads and the lighthouse beams dim by day.
* **Motion:** the vehicles run on the clock's motion time (times `TUNE.timeScale`), and SIM reads its hour and day.
* **Controls:** the panel has the hour, run/hold, 1x/2x/4x/8x (the clock's `scale`: the day and the motion both run
  faster) and an hour slider. The page opens at 10:00 and runs (`TUNE.clock`).

**Park and plaza furniture** (`39-vc-furnish.js`, `TUNE.parkFurn`; owner, 2026-10-09):
* The pieces are Voth's outdoor pieces from the furniture catalog. `build.py` lifts the Voth section of
  `kits/catalog/krator-master-furniture.js` by its header, so the page carries no other culture's pieces.
* **The site's parks:**
  * benches along the edges, facing in;
  * a statue at the middle, or the obelisk in the largest park;
  * statues at the corners, turned to the middle;
  * a wayside shrine on the longest edge that has room.
* **The site's plaza:** a ring of benches round the fountain, with statues and braziers at its corners.
* **The pocket parks and small plazas** the street method leaves get a bench facing in (or facing the fountain), and sometimes a statue.
* **The big parks** (at least `walkArea`) get gravel walks, painted on the ground overlay and kept bare by the flora mask:
  * a ring round the middle, with benches facing in;
  * spokes out to the middles of the longest edges;
  * lantern posts on alternate sides, benches facing each walk, and an avenue of cherry and dragon trees behind them;
  * between the walks, a lattice of groves (trees with beds of shrubs and blooms), flower gardens, braziers with benches round them, wells and shrines (`TUNE.parkFurn.grove`).

  The plants are records (`VC.parkFlora`), planted by the host with the biome's own builders. Each choice is a KRAND
  hash of the park and the spot.
* **The markets** (the site's market districts and the Market canton's square) have the catalog's canopied stall
  (`voth_market_stall`, produce or exotic), each with crates, baskets, sacks, jars or barrels of stock beside it
  (`VC.marketPitch`, `TUNE.market`). One pitch in five keeps a seller's goods laid on the ground.
* Every piece is a record in `PLAN.districts` (kind `furniture`): inside its green, clear of streets, lots, lamps,
  fountains and each other. The flora's mask leaves its footprint bare. `core/city/52-city-host-buildings.js` draws a `FURN` key
  through `buildFurn`: its meshes serve the near and mid levels, and it is not drawn far.

Streets wear library surfaces (`materials.json` road_* sets, `HOST.ROADTEX`): flagstone avenues, cobbled main
streets, paved side streets, grass-grown alleys, rutted cart roads for the highways and lanes.

`build.py` gives this page a fuller `VOTH` closure:
* Voth's data fragments run whole.
* The islet, river-bridge and harbour blocks of `30c-roads.js` are lifted.
* Every Voth builder the plan uses is lifted by name with its helpers (`vothlift.py`, which reads `settlements/voth/src`).
  This includes the monastery's parts (`61-monastery.js`) and the fishing dock (`65e`).
* The islet build and the whole of `55-chinampa.js` are wrapped to run on demand.
* A hook makes all of Voth's builders stand on the edited ground.
* The primitive shim turns Voth's `"#rrggbb"` colours into numbers.

The page also loads `core/simulation`: the record core, places, ports, navigation, motion, transport routes and the export.

| Step | What | Whose rule |
|---|---|---|
| 0 | The ground: Voth's `terrainH` plus the replayed strokes. An avenue drawn into shallow water gets a bank under it (`TUNE.embank`). Then the raster over the build zone: dry land, under 22° of slope | |
| 1 | Landmarks at the markers. Shrines A–E (A and B on Voth's shrine islets). LH on Voth's lighthouse islet. I: the garrison castle, with the mustering ground before its gate, facing the nearest avenue. HOH. The funerary temple, facing the Temple canton as Voth does | Voth's builders |
| 1 | (also) The shrines and the small lighthouse are the plan's own models in Voth's vocabulary (31-vc-voth.js VC.shrineModel, VC.lighthouseModel): a stepped platform, a domed cella with its door, portico, braziers and lancet windows, Voth's four obelisks; a staged tower with windows, a plinth door, a railed gallery, a glazed lamp room, a keeper's cottage. The islets' own Voth models give way to them | |
| 2 | The Port canton's plain shed() warehouses (deck and quays) give way to kit warehouses round the lighthouse and the Navigator's Guild hall. Deck heights are read off the captured cantons.<br>The rim cantons' decks (Arsenal, Foreign, Granary, Market): Voth's generic deck buildings are stripped from the captured cantons and the decks laid out again: Voth's granary() and three windmills on Granary, barracks and armouries round a drill yard on Arsenal, a paved market square with stalls on Market, six embassies (below) and houses on Foreign.<br>Clan compounds come after the avenues (step 3): one per 14,000 m² of the 'clan compounds' districts, fronting the avenues first.<br>The districts: parks, the plaza (with a fountain), markets (stalls), funerary (temple, tombs, graves).<br>The monastery is walled round its own polygon: a main gate toward the Temple canton and side gates toward avenues. Inside, Voth's chapel, assembly hall, 6 dormitories, stores, a well, pens, 10 coops and up to 30 fields, all kept out of the parks.<br>The ferry stops' piers are booked first. Then the harbour: a quay; long piers spaced for ships (a ship moored either side: a pier's width, two 16 m beams and three 8 m clearances apart, at least 83 m long, and only where the open water ahead leaves a turning basin); fishing docks with moored dhows where no long pier goes, kept a ship's berth off the long ones; kit warehouses and cargo on the quay. The river port: quays square to the current, a barge alongside every other one, sheds.<br>Last, chinampas in Voth's zones, none in the 'chinampa exclusion' polygon | Voth's waterfront, 30c harbours and river docklands, 61-monastery, 65e fishing docks, 55-chinampa |
| 3 | Avenues as drawn, and rings round each park and market (not joined). Each avenue's loose ends join a nearby avenue or causeway landing. Each river bridge end gets an abutment no lot may take and a short avenue on to the nearest avenue | |
| 4 | Highways, then S12's road to the city, then the elephant bug stations. Each station stands off its road with a staging lay-by (a 22 m loop off the road and back, 56 m straight beside the platform, so an elephant bug pulls in, stops alongside and pulls out ahead); the platform and its forecourt are kept from the later streets and lots.<br>Highways E-NE, E along the river, NW along the bay (by S10) and S and SW (by S11). Each is an A* on the ground from the avenue point furthest out. It never crosses a landmark, market, monastery, cemetery or park, and passes 30–60 m from a station it must come by. A verge either side keeps lots off it | |
| 5 | The wall on the west edge of the 'wall' polygon, pushed at least `wall.clear` from the avenues and standing whole. Gates come first: F, G and H at the crossings nearest them, generic gates at the other steep crossings. Each gate is squared to its road, with its towers either side of the road. Then the towers and segments | Voth's 30d/60-land wall |
| 6–12 | Civic buildings, then lots on the avenues (never on the highways), main streets, side streets and alleys, as in the toy. Main streets use void infill on a 10 m grid, with dead-ends where a void backs onto the zone's edge. Lot mixes follow the districts. Wealth runs richest on the bay shore and round the parks and markets. Outside the wall is a sparse suburb | the toy |
| 13 | The country:<br>• Mushroom farms (Voth's mushroomFarm) on the gentle ground of 'mush farm'; windmills (Voth's windmill, sails turning) beside a third of the farmsteads and at each village.<br>• Mines (Voth's mineEntrance) on the steep slopes of the 'mines' polygon and quarries (quarryPit) in 'quarries', each with a track to the roads and workers' houses; the 'more farms' polygon filled with farmsteads on tracks, six mushroom farms, and fields squared to the nearest road. Every country track routes round the fields and the big plots, and a field any road still crosses is taken up (`VC.fieldsOffWays`).<br>• S10's village is bigger, with fishing docks; S12 gets a village.<br>• Farming villages by S10 and S11: a green with a well, lanes out from it, cottages, fields round it.<br>• Lanes off each highway beyond the city. Toward the S, SE and NE they carry a suburb that thins with distance (houses with kitchen gardens). Elsewhere, and further out, they are farm tracks to a farmstead among its fields.<br>• Terraced orchards on the slopes of the ridge west of the city.<br>Nothing out here is strung along a highway | Voth's FARMS fields, 19b farmsteads, 70-veg terraced orchards |
| 14 | Ferry and elephant bug lines as `core/simulation` transport routes (`77-sim-5r-routes.js`).<br>• Each stop is a SIM place (a ferry stop boards at its pier).<br>• A line that enters or leaves by an edge has a SIM port there.<br>• The legs are routed on the `water` and `strider` layers: this page's grids. An elephant bug wades to 9 m, as in Voth's `66-striders.js`.<br>• SIM bakes each timetable, and the host draws every ferry and elephant bug where `SIM.vehiclePose` puts it.<br>• A shore ferry pier gets a paved landing and a street to the nearest street. Every ferry stop has a pier joined to a quay, the shore or a canton (run in under the canton's ledge to its plinth); the four cantons with Voth piers of their own get them built from their records.<br>• Boats keep Voth's boat rule (78b lifeNavBlocked): water deeper than 1.5 m, clear of the cantons' rounded squares, chinampas and every pier deck by 6 m; a smoothed route that would cut a corner falls back to a straighter one.<br>• Elephant bugs walk the roads (cheap) and open ground and wade to 9 m; buildings, cantons, platforms and the wall stop them. They are Voth's own model (79c), legs and gait, with orange awnings | Voth's 65e piers, 66 stations, 78b, 79c |

`python3 verify.py dist/voth-city.html --assert` checks:
* every step runs;
* the three named gates stand on crossings, and every gate is on its road;
* the wall is whole and keeps at least 15 m from the avenues;
* there are five highways, those to the NW and SW pass within 70 m of S10 and S11, and nothing stands on or along them;
* no buildings overlap, stand in water or stand on the wall, and none stands on a river bridge's end;
* there are at least 7 clan compounds;
* no chinampa stands in the exclusion;
* the monastery has nothing in a park, and at least 4 dormitories, 6 coops and 10 fields;
* there are at least 4 fishing docks, and the river quays are square to the current;
* no avenue's ground is under water;
* the country has suburbs, farms, fields, orchards and two villages;
* every line is a SIM transport route that routes in full, SIM reports no problems, and a vehicle's pose is a pure function of time.

**The embassies** (Foreign canton) are other builds' own buildings, drawn by their own code: `foreign.py` reads each
build's kit fragments live from the repo and seals each build in a script of its own (`window.FOREIGN`), so their
globals never meet the city page's. Dalab's stone hall and the Iziz, Republic and Yuni embassies come from
`settlements/dalab`, the Hykkousoi Treasury from `settlements/ys`, the Jimjam School from `settlements/jimjam`
(about 780 KB of their source). A fragment those builds rename or split may need its list in `foreign.py` updated;
`verify.py` fails if any embassy does not draw.

**The cantons, bridges and stairs** (`targets/voth-site/20-site-cantons.js`, `CANT`; owner, 2026-10-09). Both pages
read Voth's captured canton models into levels: each canton's tiers, aprons, raised bands and top deck, and the
Ancestry's spiral walkway as faces. The bridges, causeways and stairs are planned on those levels:
* **The bridges** run from deck to deck. Each candidate end pair is tested for:
  * a grade over `CANT.T.gmax`;
  * clearance from the big captured pieces;
  * the waterfalls.

  The cheapest clean pair wins. A rim canton prefers its top deck; the Palace and Temple keep their bridges near Voth's `DECK`. The captured rails a bridge lands through are cut. Each bridge has its piers, parapets, bridgehead posts and banners.
* **The causeways** stop at a canton's apron and climb it by a flight.
* **Every canton is walkable** from a ferry to its top:
  * a dock flight from each pier onto the apron;
  * a chain of terrace flights up the tiers, each landing on a raised band's top;
  * on the Ancestry, its spiral walkway re-stepped, then a stair to the summit;
  * a door at the bottom of each face a route uses.

  The buried sea stairs and the old walkway slabs are taken out.
* **The Ancestry:**
  * its tombs face inward;
  * its waterfalls are shader sheets with foam at their feet (`VIEW.falls`), four a side, kept clear by the bridges;
  * its flora is the swbay biome's: its cherries become the kit's new ash cherry (`SWBAY.treeAt`), its beds the kit's plants.
* `CANT.walk()` registers it all in core/walk (`KWALK`): floors, strips, blocks and flights. The pin's walker (F) follows those floors, with a ledge guard.

**The chinampas** (`31b-vc-chinampa.js`): each bed is drawn as:
* a mud and soil body inside wattle stakes and withies;
* rows of crops (maize, beans, squash, amaranth, marigold, greens, a seedbed);
* canoes and planks on the canals;
* a Voth poor house on the mature beds.

The willows, reeds and marsh plants are the swbay kit's. Every choice is a KRAND hash of the bed.

**The canton interiors** (`40-vc-interiors.js` plans, `56-vc-interiors-host.js` furnishes and draws; `TUNE.interiors`;
owner, 2026-10-09). Every canton but the Palace and Temple is hollowed into storeys. Each storey has:
* a core stair (two flights and a landing each storey);
* halls with rooms on both sides;
* tunnels in from the doors;
* a stair house up to the top deck (on the Fortress, its keep).

The rooms follow each canton's purpose (`TUNE.interiors.purposes`), with some residences among them:

| Canton | Rooms |
|---|---|
| Arsenal | barracks, smithies, armouries, workshops (weapon making), a mess, offices, stores |
| Guild | workshops, shops, stores, a guildhall |
| Market | shops, stores, a tavern, workshops, a kitchen |
| Granary | bakeries, granaries, a kitchen, stores |
| Arena | training rooms, gladiator barracks, stables, a mess, a shrine |
| Port (the harbour) | warehouses, offices, workshops, a tavern |
| Fortress | ordinator training rooms, barracks, the jail's cells, offices, an armoury, a shrine |
| Foreign | diplomatic offices, reception rooms, a library, living rooms and bedrooms |

The Ancestry is catacombs instead: galleries, cross galleries and tomb chambers.

The rooms are furnished by `kits/interiors` (`ROOM`, `furnishRoom`) from the catalog, with new room kinds (`VC.intPrograms`). The Voth set adds pieces:
* the trade set;
* a bread oven;
* a cell grate;
* a sarcophagus;
* ossuary shelves.

A canton is drawn when it is first shown.

**Cutaway (x):**
* it shows the canton under the camera (or the one the walker is in) cut at a storey;
* PageUp/PageDown or [ and ] step the storey;
* clipping planes on every material, moved each frame, never recompiled.

**The Ring Sea vessels** (`ringsea.py`, `RINGSEA`; owner, 2026-10-09). The Voth watercraft of `kits/ringsea` are built by
that kit's own code, sealed like the embassies (about 100 KB of its source, procedural materials). They are:
* the ferries on every ferry line (`TUNE.vessels.ferry`);
* dhows at the fishing docks;
* barges off the river quays;
* junks and cargo hulks along the long piers (`VC.berthShips`, `TUNE.harbour.ship`).

The moored ones are records (`VC.MOOR`), each scaled to its berth's length and drawn as one InstancedMesh per mesh of its model (`VC.drawVessels`). Their sails flutter on the kit's clock.

**Every building's interior** (`41-vc-building-interiors.js` records, `56b-vc-building-interiors-host.js` draws; `TUNE.ix`;
phase A of `SIM-ROADMAP.md`, the owner's brief of 2026-10-12). Every standing lot building gets rooms and furniture, and the
homes are checked against the brief's rule: per 2 residents a bed, an item store and a food store, and a dining or
entertaining room where the plan allows. Residents are the census's (`TUNE.census.live`); a home that falls short is
**reported, not forced** (the owner's answer to Q3).

* **Types, not lots.** A lot draws a kit model (key, variant, slot), so every lot with the same model and programme has the
  same building. It is planned and furnished once, in the model's frame, and placed by each lot's pose: 8,050 lot
  buildings and 248 others are 124 types, about 8 s at load (no bake needed).
* **The shell** is read off the kit model (`VC.ixProbe` builds it once and hands its boxes to `VC.ixShellFrom`): the main
  block (the biggest volume that spans head height, stands on the ground and is not a thin wall; a round one as the square
  inside it), its floor on any plinth, storeys of `TUNE.ix.storeyH`, the street door mid-front. The boxes are each mesh's
  exact vertices (three.js r128's `Box3.setFromObject` overstates a turned mesh, and Voth's tapered blocks are 4-sided
  cylinders turned 45 degrees). A model with no such block takes `TUNE.ix.fallback` of its footprint and is listed in
  the report (none do now); `TUNE.ix.shells` overrides any `key|v|slot`.
* **The programme** is by lot class (`TUNE.ix.programmes`, per storey, the last repeated upward; `TUNE.ix.single` for a
  one-storey building), or by kit key (`TUNE.ix.byKey`: barracks, school, guild hall, customs house, smithy). A home's
  bedrooms are `chamber`s: a bed and a chest, then as many more beds (`TUNE.ix.chamber`) and stores as the room holds.
* **Furnished** by `kits/interiors` (`planBuilding`, `furnishRoom`) from the catalog, as the cantons are; a home that fails the
  residence rule is furnished again with another seed (three tries).
* **The cutaway (x)** now opens the building nearest the middle of the view when no canton is nearer: the same planes and
  storey keys, its walls with their doors and windows, stairs and furniture drawn the first time it is opened. The inspector
  names its pieces.
* **The buildings off the lots** (session 2): Voth's own builders the city calls are logged by `build.py` with their
  arguments (`VOTH.BUILT`: the monastery's dormitories, chapel and assembly hall, the funerary temple, the House of
  Healing); the city's shrine and lighthouse models record their shells (`VC.ixSite`); the chinampas' stilt huts carry
  their size (`VC.chin.hutList`). Each is planned as `TUNE.ix.sites` says. The House of Healing is counted from the wards
  the city already furnished (its cots and dispensaries), not planned again. The huts' beds are reported as room to
  spare: the census counts the chinampa growers' work, not their homes.
* **Kit models with their own shell**: an ASSET may carry `ix: { block: [x, z, w, d], y, h, storeys }`, read before any
  guess. The citizen simulation's eight new models (`kits/catalog/krator-master-buildings-voth.js`: watchhouse,
  caravanserai, coast-guard berth, weaver, tannery, brewery, butcher, bakery) carry it; they stand nowhere yet (phase B
  places them), so `VC.ixKitCheck` plans each as a lot of the class in `TUNE.ix.kitCheck` and the report lists them. Their
  trades have room kinds of their own (`brewhouse`, `weaving`, `tanyard`, `butchery`, beside the cantons' `bakery`), each
  requiring its trade's pieces by catalog role (the still, barrels and vat; the looms and dye vat; the vats).
* **The density overlay (n)**: residents per hectare on 50 m cells (a diverging ramp round the city's mean), the homes short
  of beds hatched; again for workplaces per hectare; again for off. Its legend has the totals.
* **The report** (the "interiors report" button, and `verify.py`'s output): beds, item and food stores needed and held;
  the shortfall by lot class and by district; the job table of the brief's 1.2 (a row per kind of work, a column per
  furniture kind, with the census's workplaces, the 90% target and the posts placed); every type with its shell, storeys,
  rooms and counts. `VC.ixSlots(i)` is what phase B's places will read; `VC.IX.export()` is all of it as JSON.

**The citizens' places (phase B)** (`42-vc-sim-places.js`; `TUNE.sim`, `TUNE.census.byKey`; `SIM-ROADMAP.md` 2.3). What
phase C's citizens will need, placed and declared, and its deficits reported before anyone walks:
* **The buildings** (`VC.simBuildings`, after the street method and the owner's edits, before the census): the new kit
  models go onto the plan. The trades (14 bakeries, 10 butchers, 8 weavers, 4 breweries, 3 tanneries, `TUNE.sim.place.trades`)
  take shop, craft and industrial lots whose plot holds their model and whose new footprint clears every other building,
  front kept on the street, spread over the city (each next lot the farthest from those its trade holds). Three
  watchhouses take a house near the east, west and south of the city; the central one is the Fortress's armoury. The
  caravanserai is placed at step 3, right after the avenues (`VC.simCaravanserai`, as the House of Healing is): on the
  free ground nearest the River Gate's marker, inside the wall's clearance, fronting an avenue, so the streets and lots
  of steps 6-12 are laid round it (owner, 2026-10-12). The coast-guard berth stands on the water off the Fortress's
  apron, clear of every bridge, causeway and pier, on a stone footing. A converted lot counts in the census as its new
  building (`TUNE.census.byKey`).
* **More work furniture** where the 90% rule fell short (owner, 2026-10-12): dense work rooms used only by those
  buildings' programmes: `factory` (the industrial lots), `enginehall` (the power houses), `drillhall` (the garrison and
  barracks), `guardroom` (the watchhouses and the coast-guard berth), `alehouse` (the taverns and the caravanserai),
  `counting` (the guild hall and the customs house), a stable at the caravanserai, a second storey in the funerary
  temple; the Granary deck's granaries and the mustering ground are work places too.
* **The wells** (`VC.wells`, after the park furniture): `voth_well` on the plazas and market squares and every 150 m along
  the residential streets, none within 90 m of another (or of the parks' and the monastery's wells); the manors and clan
  compounds have their own, in their courtyards (a DRINK on the home). They are a 'Wells' district's art: drawn and
  inspected as the other furniture.
* **The places** (`VC.simPlaces`, after the interiors): every building with an interior, every canton room, every well,
  park, market and burial ground, the fields, piers, mines, quarries, mills and the wall's towers and gates are
  `SIM.place`s (about 11,100), each with its activities (its furniture read through `TUNE.sim.furnAct` over
  core/simulation's `SIM.FURN_ACT`: `SIM.slotsFromFurniture(pieces, map)`), its hours (`TUNE.sim.hours`), its pull for free
  time (`TUNE.sim.pull`) and its work posts with their kind of work (`TUNE.sim.posts` per piece; a canton room's and the
  outdoor work's are the census's).
* **Session 2:** a piece's capacity by its size (`TUNE.sim.postWidth`: a 4.4 m workbench takes two; `seatWidth`: seats
  round a table's edge), the places' `spots` (where people stand: a step before each work piece, seat, table and bed,
  the work ones first, at most 48), an open place's reach `r` and `wander`, and each place's `workplaces`. The density
  overlay's third mode (n) maps work posts against 90% of the workplaces: warm where short, cool where there is room.
  The power station (`voth_bldg_power_station`, four engine halls of up to 20 workstations) took the small power
  house's place, and every kind of work now meets the 90% rule.
* **The 90% rule** (`VC.simWorkAudit`): for every kind of work the census counts, the posts against 90% of its
  workplaces; a short kind is named with its buildings that have the most floor per post (where more posts would go).
  In the report panel (the "interiors report" button) and in `verify.py`'s output.

**The citizens (phase C)** (`43-vc-sim-nav.js`, `44-vc-sim-people.js`; `TUNE.sim.nav`, `TUNE.sim.people`; `SIM-ROADMAP.md`
2.4). Session 1 made the walkable city and the people in it:
* **The pedestrian layer** (`VC.pedNav`): core/simulation's NAV graph, registered as SIM's `pedestrian` layer (about 27,600
  nodes and 35,000 edges, built in about a second at load). Every street of the plan, a node every 20 m, with a shared
  node where two cross and a junction where one stops at another; a dead alley or lane end reached over to the street
  behind it; each plaza a hub joined to the streets round it (a village's lanes start at its green); the park walks;
  the cantons: each terrace a ring of nodes, each top deck a grid, the Ancestry ramp, the flights (stairs cost 1.6
  times), the bridges over their arch, the causeways from canton to street, the canton doors. The layer is `yWeight`ed
  (core/simulation's new opt-in): a place on a terrace finds its node on that terrace, not on the street under it.
  `VC.pedAudit` checks it is one body and lists the places far from it. Not joined yet: the canton rooms (the canton
  interiors' own graph) and the chinampa huts (by kayak, the water layer).
* **The people** (`VC.simPeople`): every home's census residents become SIM actors (53,355, the census exactly), half
  of them of working age (all of a barracks' or a dorm's). The jobs are the places' workplaces, dealt: a home that is
  also a workplace fills its own posts first (not household service, which comes in from outside); 70% of the farm,
  mine and quarry posts go to slaves, housed at the site and counted apart from the census (the owner's Q5); every other
  post to the nearest free workers by the walk on the pedestrian layer (`SIM.nav.field`, core/simulation's new
  multi-source search: one search labels the whole city with its nearest free post), never past 3 km walked. The gentry
  (rich, manor, clan) take only the professions (`gentryJobs`) and otherwise live on their means. Each actor carries its
  home, work, class and wealth (the owner's Q6 recommendation) and a plain day's schedule (session 2 brings the week).
* **The report** (the "interiors report" button, first section; `verify.py`): people by class, workers employed and out
  of work by district, every kind of work's posts filled and how, unfilled, the commutes in metres walked; the pedestrian
  layer's counts and what is off it; an A* check of a sample of the commutes. `verify.py --assert` also asks a sample of
  actors at 8 and at 2 where they go: each worker chooses its work, each sleeper its home.
* **The outside stairs and ladders** (owner, 2026-10-12: "make sure stairs on house exteriors are also navigable"): every
  kit model records each stair and ladder it builds (its registry's `walkRec`; `settlements/voth/catalog/README.md`
  "Walk records"); the model probe (`VC.ixProbe`) collects them per model, variant and seed slot (`VC.IX.walks`), and
  `VC.pedNav` puts them at every standing lot: about 6,800 stairs and 4,700 ladders on 6,400 lots, each a `stairs` (or
  `ladder`, three times the cost) edge from foot to head. A foot at the lot's ground joins its street; two ends of one lot
  at one height (a landing between flights, a roof both reach) join each other; a foot up on a gallery or roof no other
  stair reaches is reached through the house (an `indoor` edge, until the buildings' own graphs are joined). Every head
  is on the main body. The first-person walker gets each stair as a core/walk strip with a landing at its head (not the
  ladders). `verify.py --assert` routes a sample of the heads from the city's middle and stands the walker on a sample
  of the stairs mid-flight.
* **Session 2: the week, running** (`56c-vc-citizens-host.js`; `TUNE.sim.week`, `TUNE.sim.run`, `TUNE.sim.embody`):
  every citizen is stepped once a simulated minute from the frame loop (the owner's Q1), on the page's clock; the hour
  slider re-places everyone. Each kind of work has a shift (`TUNE.sim.week.shifts`, a share on nights for the guards,
  soldiers, stokers and jailers), and each role three days built from it: `work` (8 hours' sleep ending an hour before
  the shift, a meal, the shift, a meal, free time), `off` and `rest` (core/simulation's new `scheds` and `week`). Day 7 is
  the rest day for all but the essential kinds; every worker has a rota day off among the other six (the owner's Q8).
  Free time: SOCIALIZE out, RELAX, IDLE and REST at home (a chair or a bed: `TUNE.sim.alsoAct`, the owner's "chairs,
  stools could be a good target for idle and beds etc for rest"); a house is private (`access: 'private'`). The clock
  has 20x and 60x. The citizens near the view are drawn (up to 1,500 within 220 m: a figure whose tunic says what
  they are doing). The census is sampled at 3, 10, 15 and 20 each day; the report's "The week, running" shows now,
  the samples, and what people wanted and did not get. `verify.py --assert` runs a workday and the rest day's morning
  headless (`VC.simDay`). To keep 54,000 decisions cheap, core/simulation gained a place grid per activity (exact
  nearest-first, an empty answer remembered for the minute), lazy paths (decided from the straight line, found when
  drawn), `SIM.REACH`, and a batched log.
* **More company, the slaves' rest day, worship sized** (owner, 2026-10-12): every plaza and pocket park of the plan is a
  place, its room by its area (`TUNE.sim.greens`: about 26,000 more places to socialize); a house's seats and table
  places take VISIT, its own people and the neighbours within `TUNE.sim.visitR` m (core/simulation's `guests` on a
  private place), and someone who finds no room out visits instead. Slaves work half their shift on the rest day
  (`TUNE.sim.week.slaveRest`). A shrine's, chapel's, the funerary temple's and a canton shrine room's congregation is its
  ground floor at 2.5 m2 a worshipper (`TUNE.sim.worship`); `VC.simWorshipNeed` sizes the rest day's worship (in the
  report and `verify.py`).
* **The rest day's worship** (owner, 2026-10-12: "3 with half; make 2 new unique temple models ... place one on the west
  side and one on the southeast side at the pre-street phase; and make 3 small tomb size shrines ... Clan compounds can
  also take this furniture shrine. Make a house size chapel that can go in the villages"): three services (8, 11, 17),
  half the city dealt one each (core/simulation's actor `alias`: `TUNE.sim.worship.at`, `share`); the Temple of the Ash
  Saints (a Velothi stepped hall under a drummed dome, fire pylons, a portico) and the Temple of the Tide Mother (a
  Hlaalu basilica, its tower and forecourt), kits/catalog, placed at step 5 off an avenue on the west and southeast
  (`VC.simTemples`, the caravanserai's search: `VC.simPrePlace`), each hall about 1,360 standing; a village chapel in
  each village (the house nearest its green); three small shrines (`voth_shrine_stele`, `_lantern`, `_urn`, kits/catalog
  furniture, `holds` 2-3) along the big parks' walks and in every pocket park of 120 m2 or more (`VC.parkShrines`), and
  in every clan compound's shrine room (`clanshrine`, its hall in the small compound). Worship by floor (2.5 m2) and by
  each shrine's `holds`.
* **Benched squares and village shrines** (owner, 2026-10-12: "Add a couple village size shrines and benched squares
  for that overflow"): the overflow was the cantons' people (nowhere within reach to sit with company on a working
  afternoon) and the rest day's worshippers in the suburbs, farms and mines. `VC.simSquares` (`TUNE.sim.place.squares`)
  clears a few house lots at each canton's foot (out from its apron, or from its causeway's land end: the Fortress) for
  34 x 24 m squares fronting a street: a ring of 10 benches round the well `VC.wells` sets in the middle, benches along
  the three inner sides, braziers at the corners (27 benches); each is a plaza green (standing room by area) whose
  benches add seats (`Benched square (<canton>)`). `VC.simVillageShrines` (`TUNE.sim.place.villageShrine`) places the
  `voth_bldg_village_shrine` (kits/catalog: a walled precinct, a pillared hall with a lantern cupola, a forecourt with a
  stele, an offering basin and braziers; its nave holds 81) where the most worshippers are left without room when each
  household's are given to the nearest place with room within 1.5 km, as the citizens choose (`VC.simClearable`,
  `VC.simClearSpot`: the cleared ground both use).
* **Needs, happiness, efficiency, loyalty** (phase C session 3; SIM-ROADMAP.md 2.4 items 4-6): core/simulation's new
  `77-sim-6-needs.js` (opt-in: `SIM.needs`), tuned by `TUNE.sim.needs`. Every citizen carries a meter per need (eat,
  drink, socialize, relax, contemplate, sleep; material waits for phase D's items), 0 met to 100 desperate, rising by the
  hour (more for some trades: the monks' contemplation, less for the soldiers' material) and falling by what they do
  (a meal: hunger and thirst; a tavern or a well: thirst and company; a shrine: contemplation; at home, sitting or
  resting, there is water). Heavy labour (`labour` by trade, the slaves all of it) adds thirst and some hunger at work,
  and a labourer whose thirst reaches 75 walks to the nearest drink (a well; the country's fields, mines and quarries
  keep a water barrel) and back. The free hours of the schedule go where the meters ask: of socializing, relaxing at
  home, a drink, contemplation at a shrine, rest or sitting at home, the one whose fills times the meters is highest and
  that an open place within reach offers, held an hour; one no place takes settles for what it got. One trait each
  (chatty, loner, pious, worldly, glutton, ascetic, restless, steady: a hash of the citizen) weighs a need a third more
  or less. Happiness is 100 less the meters' weighted pain; its band (content, uneasy, unhappy, restless) sets the
  efficiency at work (1, 0.92, 0.8, 0.65); loyalty follows it over three days (loyal, wavering, disloyal: their effects
  are phase F's and G's). The report's "Needs and happiness" gives them by class and by kind of work (with the
  efficiency of those at work now), the deficits by district and the free-time places full; the clock bar shows the mean
  happiness; `verify.py` runs a second workday on from the first and checks the meters hold steady.
* **Things: clothes, tools, food, shopping** (phase D; SIM-ROADMAP.md 2.5): core/simulation's new `77-sim-6-items.js`
  (opt-in: `SIM.items`), set up by `45-vc-sim-items.js` from `TUNE.sim.items`. Stock was abstract in phase D (the owner's
  Q7: every purchase succeeded and was logged by shop and item); phase E's economy (below) draws it from the warehouses. A shop sells by
  its kit model (the alchemist poultices; the clothier, the weaver and the tannery clothes and shoes; the smithy tools,
  arms and armour; the provisioner, the bakery, the butcher and the markets' stalls food; the trader, the enchanter and
  the potter luxuries and household goods). Every citizen wears a set (shirt; trousers or a dress; shoes; a hat or hood
  for some) in the six slots and keeps more at home by class (the owner's Q6: 1 to 6); the armed trades own armour and
  arms, some of the rich a sword; a worker owns its trade's tool or draws it from the rack; labourers carry a waterskin,
  chinampa growers a kayak. Clothes wear by the worn day (at least a year of wear: the owner; everyone starts at a hashed wear) and are replaced from home; a set short is bought on time off
  (and the material meter feels it); a tool (a working year or more of use, at a hashed start) worn out at work is bought during the shift; a worked day may end hurt (a
  poultice from an alchemist). A household keeps a food store: two foods make a meal worth three servings (the richer
  table more), one food a bite, none scraps; a store below a day sends one of its people for three days' food. The
  cantons' rooms, the dormitories, the barracks and the slaves' quarters eat at their mess. The slaves are issued
  their clothes and tools and run no errands (the owner's Q5). The material meter rises slowly; when it is high a
  citizen buys the best luxury or household good its wealth reaches. An errand goes when a seller is open and within
  reach. A household shops when its store falls below two days and buys four (a buffer: a store that runs low after
  the shops shut lasts the night). A meal is eaten out (a tavern, a market's stalls, the caravanserai) by a share that
  grows with wealth, or when the store cannot make one. The chinampa growers' huts and beds are on the `kayak` layer
  through a landing at the nearest street (`VC.simKayaks`): to town by kayak, then on foot. The report's "Things" section; `verify.py` checks the slots, the purchases, the replacements and the meals.
  **The shipwright's docks** (owner, 2026-10-13: "a shipwright's dock that constructs ships and also sells oars,
  kayaks. Nets could come from weaver"): `voth_bldg_shipwright` (kits/catalog: a yard on the shore, a slipway into the
  water with a hull on the stocks, sheerlegs, a timber shed, the shop with oars and kayaks racked), placed by
  `VC.simShipwrights` (`TUNE.sim.place.shipwright`) at the river port and on the nearest natural shore to the harbour
  (the harbour's own coast is its quay deck, 4 m above the water: no slip runs off it). Its 14 shipwrights work the
  slip (the ships they build are phase E's production); it sells oars and kayaks, the weavers nets, and the fishers
  now own their nets (bought from a weaver when worn out).
* **Production, stores, carts, imports** (phase E; SIM-ROADMAP.md 2.6): core/simulation's new `77-sim-6-economy.js`
  (opt-in: `SIM.economy`), set up by `46-vc-sim-economy.js` from `TUNE.sim.economy`. The stock stops being abstract: a
  shop sells from the settlement's store (the 487 warehouses and the Granary deck's granaries), so a purchase can fail
  and a kitchen can run out. Food is counted in servings (a meal is two), the craft goods in lots. The producers make
  their goods by the worked hour, times their workers' efficiency (the needs' band, a missing tool, a hurt), into
  their own store: the 454 fields one crop each (wheat, corn or peppers by a hash, wheat three times as often), the
  chinampas corn and peppers (whichever has fewer days left), the mushroom farms, the fishers' docks, the beetle ranches
  eggs, the bakeries bread from wheat, the weavers cloth, the tanneries leather, the mines metal. Fifty carts (driven
  actors the stepper leaves to the economy; drawn near the camera as a cart and its hauler) take the site whose good
  has fewest days left, then the fullest no other cart is bound for, then the nearest, and unload at the emptiest of
  the six nearest warehouses. Clothes draw cloth, shoes and waterskins leather, tools, arms and armour metal, oars and
  kayaks wood, poultices herbs, luxuries the imported luxuries; a household's food, a meal out or at a mess the foods.
  A good with an import route (wheat, corn, peppers, eggs by river or road; cloth and luxuries by sea; leather, metal,
  wood, herbs) is sent for when it lasts under three days and arrives hours later (the ships, barges and caravans that
  carry it are the next session's: only strider ports stand on the map's edge now). The report's "Production, stores,
  carts, imports" section (per good: the warehouses, the sites, made, used and imported a day, days left);
  `verify.py`'s economy check after two workdays (every producer, the carts, every food made and hauled, none short,
  none under a day, the kitchens' meals, the imports delivered).
* **The carriers** (phase E session 2; `TUNE.sim.economy.carriers`, `VC.simCarriers`): an import now comes as a group
  of people. The road's goods come by caravan (a beetle, its driver and two guards a unit, three to five units) in by
  the strider ports on the highways; it unloads at the caravanserai, lodges there ten hours and leaves the way it
  came. The sea's goods come by ship (ten sailors, four marines) from the north edge to the harbour pier nearest it.
  The lot lands in that place's store and the carts take it on. Leaving, a carrier buys the city's surplus: the good
  with most days left, no more than the last day's surplus. The river's barges wait for a water way: the `water`
  layer finds none from the river's upstream end to the quays, so river imports still come by timer (the report says
  so). Drawn near the camera: a beetle under each driver, a hull under each crew, a mast on a ship. The shipwrights
  now build boats from wood, and a kayak is bought from their stock. `VC.simDays(d0, n)` runs whole days from the
  console (the owner's fast clock, Q2): a week held, every food's stock rising, three to four days left.
* **The animals** (owner, 2026-10-13; `47-vc-sim-animals.js`, `TUNE.sim.animals`, the fauna kit's `farm` and `voth`
  groups): beside the beetle ranches, dairy-cow pastures, pig sties and duck coops (by a pond) stand beside the
  farmsteads (`VC.livestock`, `TUNE.country.livestock`), each its trade's work place (dairymen, swineherds, duck
  keepers). Every pen keeps a herd of actors, the fauna kit's animals, on its own needs (hunger, thirst, sleep, ease):
  in their free hours they feed at the trough, graze, drink, bed down or loaf by what their meters ask. Their
  condition is their yield: eggs and milk by the animal-hour while their keepers tend them, and the dairymen make
  cheese of the milk (four to one). Pork and fowl come by slaughter (owner: "a new animal born every time one is
  slaughtered for meat, and it takes 1 year to grow up"): a share of the pigs and ducks is raised for meat, slaughtered
  once grown for the fauna kit's meat (kg, four servings a kilo, times its condition), and a newborn takes its place
  for a year: the young yield nothing and are drawn small (a pig as a piglet). With one birth a slaughter and a year
  to grow, a herd of N gives at most N/365 a day: meat is rare until breeding comes. Milk, cheese, pork and fowl are foods: the provisioners, the
  butchers and the markets sell them, and cheese makes a better meal (`quality`). The Arena's stables keep its beasts
  (the arena tiger, the pit lizard, the pit beetle) on the same needs; at 11:00 and 16:00 a bout: the keepers' forced
  command (core `SIM.command`) puts two sound beasts on the sand to fight, the stronger by mass, aggression and
  condition wins, and the loser heals three days. `VC.arenaBout(a, b)` stages one by hand. The nearest 40 animals are
  drawn by the fauna kit, walking, grazing, resting or idling as they do. **The pets** (owner, 2026-10-13): a dog and
  a cat for every 40 citizens, each in a household; asleep at home by night, by day they roam the greens and squares
  (moving on every two hours) and now and then mingle where people gather, by their own meters; no food yet. Drawn
  from the fauna kit's baked dog and cat models (`fauna_bundle.bundle(..., mdl=['pets'])`, about 1.9 MB of the page).
* **The wake** (`TUNE.sim.run.wake`, core/simulation `SIM.WAKE`): an actor is asked what it wants only at the soonest
  minute it could change (its schedule's next change, an errand's or a dwell's end, a meter's crossing, a role's
  cycle), not every minute: 74 of the 77 million questions of a day are skipped and the step's p50 fell from 109 ms to
  about 64 ms on a workday (verify.py); two stale wishes in 2.5 million checks. **The lag** (`TUNE.sim.run.lag`, core
  `SIM.LAG`): each citizen's day runs a hashed 0 to 10 minutes behind the clock, so nobody leaves on the dot and the
  hour's decisions spread over its first minutes instead of all falling at :00. **The buckets** (`TUNE.sim.run.buckets`,
  `VC.simBuckets`; owner: "stagger the jobs into 2 buckets separated by 1/2 hour"): the kinds of work are dealt, the
  largest first, to the bucket with fewer workers, and half the city's trades keep their day a half-hour later (their
  shifts, breaks and evenings); those without a trade by parity. Each hour's turn falls in two halves, at :00 and :30:
  the worst minute 1.9 s against 2.5 s, the day's total about 9% more (a smoother day, not a cheaper one).
* Phase B's outdoor trades now stand at their own sites (the ferrymen at the ferry stops, the bug handlers at the strider
  stations, the chinampa growers at the huts, the herders at the ranches, the orchardmen on their hill); every place
  with workplaces offers WORK; a home whose beds fall short still sleeps its people (on the floor).

## Notes

* **Fountain.** The plaza fountain (`sl_fountain`, `core/city/52-city-host-buildings.js`) is a placeholder piece, not a catalog furniture piece.

## The source library (`src/`) and the first Voth

The first Voth was one page, `voth.html`: the generator in `src/` concatenated inside one `BUILD()` by its own build.py,
with a life layer (ships, ferries, barges, dhows, citizens, clergy, trade, arena combat, elephant bug convoys), day and
night, weather, LOD and a minimap. **It was retired on 2026-10-14** (the owner): its page, build, verify, baseline,
library pack and the docs that describe only that page (its README, INDEX, PORT, KNOWN_ISSUES, PASS5, SUBAGENT and the
districts and life-layer briefs) are in `archive/voth-first/`. It is not built or checked any more.

Its `src/` stays here, live: `build.py` runs the data fragments whole (`05-palette`, `10-core`, `15-shore`, `30a`) and
lifts the rest by name (`lift()` and `vothlift.py`: the islets, bridges, harbours, the builders the city places, the
chinampas, the sky, the elephant bug model, the path visualizer). So a change to a fragment shows in the next build of
both pages, and `tools/check_port.py` holds its `[G data]` fragments to the port rule (`PORT.md` tags `src/` and
`targets/` together). `API.md` is its contract: the fields, the shore, the emitters, the palette and the layout
objects the lifted code reads. What is still worth porting from it (its life layer, collision, props) is ported into the
targets and `core/`, not added to `src/`.

Things known about the library (from the first Voth's KNOWN_ISSUES, still true of `src/`):

* `catalog/CITY_INVENTORY.md` cites source lines in fragments that were split since (`65-facade.js:2429`,
  `50-cantons.js:3812`, ...); rerun `catalog/capture/capture.py` (it builds its own instrumented copy from `src/`).
* The comment at `65d-canton-structures.js:30` says a `45-kit.js` bug makes every cloth instance invisible; that bug was
  fixed (`applyClothSway`).
* The first-generation registry and the `voth_*` furniture in `kits/catalog/` were recentred and resized in its verify
  pass (2026-10) without a sync into `src/`: the catalog pieces are rewrites, not copies (the catalog's strider station
  is 10 x 16 m, `siltStriderStation()` in `65b` a 16 x 22 m deck), and the city's builders take their sizes as
  arguments.
