# Streetlab

The Voth site editor and the Voth city plan: the first world on **`core/city`**, the city builder and its infill
(`core/city/README.md` has the method, the records, what a world provides, and the plan to port every settlement to it).

```
python3 build.py                                   # dist/voth-site.html and dist/voth-city.html
python3 verify.py dist/voth-site.html --assert     # headless: the site editor
python3 verify.py dist/voth-city.html --assert     # headless: the city plan on the site
python3 serve.py                                   # serve both pages; the editors save through it
```

Serve the folder (`.claude/launch.json` has `streetlab` on port 8813) and open `/dist/voth-site.html` or `/dist/voth-city.html`.

The folder began as a street-placement toy on a featureless plain, the test bed for the method. The toy is retired:
its machinery is `core/city`, and its own steps 0-5 (a triangle of landmarks, a noisy wall, ring avenues) are in the
git history.

## The Voth site editor (`targets/voth-site`, `dist/voth-site.html`)

The ground of Voth with no roads, for marking out where things go before any street is placed. Run
`python3 serve.py` (the launch.json `streetlab` entry does) and open `/dist/voth-site.html`.

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
* Voth's power houses (`voth_generator`: the steam turbine hall and the fumarole vent house) are placed at step 9, on the
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
| 13 | The country:<br>• Mushroom farms (Voth's mushroomFarm) on the gentle ground of 'mush farm'; windmills (Voth's windmill, sails turning) beside a third of the farmsteads and at each village.<br>• Mines (Voth's mineEntrance) on the steep slopes of the 'mines' polygon and quarries (quarryPit) in 'quarries', each with a track to the roads and workers' houses; the 'more farms' polygon filled with farmsteads on tracks and fields.<br>• S10's village is bigger, with fishing docks; S12 gets a village.<br>• Farming villages by S10 and S11: a green with a well, lanes out from it, cottages, fields round it.<br>• Lanes off each highway beyond the city. Toward the S, SE and NE they carry a suburb that thins with distance (houses with kitchen gardens). Elsewhere, and further out, they are farm tracks to a farmstead among its fields.<br>• Terraced orchards on the slopes of the ridge west of the city.<br>Nothing out here is strung along a highway | Voth's FARMS fields, 19b farmsteads, 70-veg terraced orchards |
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

## Notes

* **Fountain.** The plaza fountain (`sl_fountain`, `core/city/52-city-host-buildings.js`) is a placeholder piece, not a catalog furniture piece.
