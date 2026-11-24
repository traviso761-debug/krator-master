# Hook

Hook is the Ancient port city of the Ring Sea's south-western shore, the Izani Empire's premier port, retaken from
Voth a few months before game start (`LORE.md` section 6.2, the Hook entry; section 6.12, "Hook is lost"). `PLAN.md`
is the plan: the Ancient Port kit (`kits/port`) lays the waterfront, the Ancient town behind it is the layer
under every other, `core/city` lays the town, and six building kits dress the layers of its history. **This folder is
at phase P2**: the waterfront (P0, every Port segment and vessel placed at least once), the ground behind it, the
site on `core/city` and the Ancient town's ruin hosts on their grid (P1), the site editor page, all of it standing on
the Krator Scale Model's ground at 1:1 ("The ground" below), and the town itself (P2): `core/city` steps 6-12 on the
quarters, every lot drawn from its own culture's kit. `LAYOUT.svg` is the layout the owner approved (2026-10-19),
drawn to scale over the P0 run.

## The build

```
git lfs pull --include="kits/port/tex/**,kits/islanders/tex/**,settlements/iziz/tex/**,kits/marr/tex/**"   # the packs are in LFS: pointer files build black surfaces
cd settlements/hook
python3 build.py                                   # dist/hook.html and dist/hook-site.html (+ dist/hook*.tex.*.js, the kits' texture packs)
python3 world/cut.py                               # recut the model round Hook (tools/scale-model/model/data) and add world/landforms.json
node tests/test-hook-world.js                      # the ground and the frame in node (core/world 41 and 41l on the cut)
python3 verify.py dist/hook.html --assert --views "Overview;The Ancient town" --out shots/x
python3 verify.py dist/hook-site.html --assert --out shots/site      # the site editor's own checks
python3 build.py --vendor-check                    # every src/ file that shadows a kit fragment, against the kit's copy
python3 serve.py                                   # http://127.0.0.1:8814/dist/hook-site.html: the editor, saving into site/
```

`build.py` reads the Port kit **in place**: every fragment of `kits/port/src`, the core lists the kit's own
`build.py` names (`core/materials`, `core/lod`, `core/atmos`, `core/water`, `core/materials/record`) and the kit's
texture pack (`kits/port/tex`, written beside the page as a sidecar). Nothing of the kit is copied here; the
kit's build rules (seed discipline, one shared scope, unique registration keys) run on Hook's fragments through the
imported `kits/port/build.py`. A `src/` file with the same name as a kit fragment shadows it and is an adapted
copy that `--vendor-check` reports (none yet).

P1 adds to the page, read in place too (`build.py`, "P1"):

* `core/rand`, `core/space` and `core/tags` under their own names (`KRAND`, `KSPACE`, `KTAGS`); the open world's land,
  read in place as `settlements/pinnacle-rock` reads it: `core/terrain/38-core-relief.js` (`KRELIEF`) as `75a`, the
  scale model's cut (`world/`) decoded by `core/world/world_data.py` into `WORLD_DATA` and `WORLD_R` as
  `75b-hook-world-data.js`, `core/world/41-world-fields.js` (`WORLD`) as `75c` and `41l-world-landforms.js` (`WLAND`,
  the landform records: Hook's spit) as `75cl`;
* `core/city` in one closure (`76-kcity-bundle.js`, as Verge takes it): Hook reads `KCITY` and `KCITY.lib`;
* `site/hook-site.json` inlined as `HOOK_SITE` (`76-hook-site-data.js`);
* the five Ancient host types, `kits/ancients/src/8ap-host-*.js`, as `78*-host-*.js` (the Bell Hall's `HBH` renamed
  `HBLH`: the Port's haven has the name), with the skyscraper and glass-shard helpers they call lifted from
  `52-sky-abc.js` and `42-offices.js` (`78-sky-helpers.js`).

P2 adds the town's kits, each sealed in a closure (`build.py`, "P2"; "P2: the town" below): the Islanders' and the
Vernacular's library packs beside the page (`77-hook-packs.js`, sidecars `dist/hook.tex.islanders.js` and
`.tex.iziz.js`, and Marr's, `.tex.marr.js`), `77a` ISK and `77b` IZV through `settlements/isle-demo/bundles.py` (IZV
with Marr's vassal kit, `kits/marr/src`, in the same closure: its `VERN.def` records draw through the Vernacular's
helpers), `77c` VCAT (the catalog core and
the Voth registries), `77d` HYK (`settlements/voth/foreign.py`'s Ys file list plus its housing, shops, hospitality
and industry), `77e` KPA (`kits/post-apoc/apoc_bundle.py`, the furniture and interiors stubbed), and the kits' boxes
scraped into `HOOK_DIMS` (`77f-hook-dims.js`). The site editor page carries them too (it is the base page plus the
editor), so both pages are about 3.9 MB.

## P1: the ground, the site, the Ancient town

| Fragment | What |
|---|---|
| `src/75d-hook-world.js` | `[G data]` the scale model's ground under Hook: `WORLD.init` on the cut in `world/` (with Hook's spit, `world/landforms.json`, stamped by 41l), the kit's frame laid on the nearest straight real coast to the pin and turned to its bearing, `PORT.natH` set ("The ground" below) |
| `src/76-hook-ground.js` | `[G data]` the Heights (a ramp 31 to 46 m, the quays at 6) and the hill behind (70 to 95 m over z -1180 to -1400) as the kit's own layout stamps, kept only where the model has no such relief (on the 5.1 cut with the spit at +5 m: both kept); `hookGroundH` for what stands on them |
| `src/79-hook-ancient.js` | `[draw]` the five host types registered as Port segments (`anFacet`, `anBastion`, `anArcades`, `anStalks`, `anBell`: a land block the width of the podium, a flat pad at the ground's height, the kit's builder run in a group at the pad with the group transform on, cut at a storey through the kit's Ys hook) |
| `targets/hook/89z-rows.js` | `[G data]` the P0 run, then the ground stamps and the hosts: the site's named hosts, then one per free block of the Ancient grid by `KRAND` (seeded from the stretch, row and column; the type by the site's weights, the decay and the cut by the quarter's ruin level; a block near an avenue, on the Heights' front slope or over a Port footprint stays free); every host and quarter in `core/tags` before anything draws |
| `src/88-hook-programme.js` | `[G data]` the town's programme (P2): each culture's kit and its lot classes (`culture:class`, the kits' own keys), the fallback chain, the quarters' wealth bias, the salvage draw, the host reach |
| `src/90a-hook-city.js` | `[G data]` `core/city` steps 0-12 on the site after the terrain: the build zone onto the raster, cut to the quarters; every Port footprint and host filed as a landmark (hard ground); the quarters with their lot mix, holder, mood, layer and ruin level; the painted fields; the three avenues drawn and snapped; then the builder's own steps 6-12 (P2) with the programme's classes, the lot filler drawing a culture from the quarter's mix, the class from the street and the wealth, the piece by size; the records for the page (`HOOK_CITY.recs`: kit, key, variant, culture, class, quarter, salvage, host), each in `core/tags` |
| `src/90b-hook-city-draw.js` | `[web]` the streets through core/city's own drawing; the quarters' outlines and labels and the markers (`z` shows them); the town: every kit piece built once at the origin by its kit's closure, flattened, and drawn merged (one mesh per material) within 400 m of the camera's target, as massing beyond, a footing under each lot on the slope; `window._city` for the verify |

## P2: the town

The quarters' lots are `core/city`'s steps 6-12 on Hook's site, drawn with five kits read in place and sealed each in
a closure of its own (`build.py`, "P2"; the Islanders and the Vernacular through `settlements/isle-demo/bundles.py`):

| Culture (`layer`) | Kit | Closure | Pieces |
|---|---|---|---|
| `hukoa` | `kits/islanders`, the West set (`iw-*`) | `ISK` | huts, rumah, batak, tongkonan and gadang houses, the chief's house, shophouses and trades, kava house, godowns |
| `kautoa` | `kits/islanders`, the East set (`ie-*`) | `ISK` | the Kautoan houses poor to noble, traders, kava house, guesthouse, warehouse, smithy |
| `tethys` | `settlements/ys` (`hyk_*`) | `HYK` | the Hykkousoi houses poor to rich, eleven shops, tavern, inn, warehouses, smithies |
| `iziz` | the Iziz Vernacular (`vern_*`) with its Ancients core | `IZV` | houses poor to rich, shops, workshops, smithy, tavern, warehouse, silos |
| `voth` | the Voth building catalog (`voth_*`) on the catalog core | `VCAT` | houses poor to rich in five variants, townhouses, manors, seven shops, taverns, warehouses |
| `salvage` | `kits/post-apoc` (`dw-*`, `lg-*`, shops, industry) | `KPA` | container, silo, tyre, bus and tank dwellings, the stack and bulkhead blocks, shops, smithy, warehouse |

The kits' boxes are scraped from their sources at build time into `HOOK_DIMS` (`77f-hook-dims.js`), so the plan
places without the drawing. A lot class is `culture:class`: the lot filler draws the culture from the quarter's
`cultures` (the site file), the class (poor, middle, rich, manor, shop, tavern, industrial) from the street and the
wealth with `core/city`'s own choosers, and the piece by size; a culture without a class builds the class below.
Wealth is `core/city`'s rule from the Customs House plus the quarter's bias (`HOOK_PROG.wealthBias`). The records
carry the nautical salvage draw and the host they stand against as tags; what the kits can do with them is in
`KNOWN_ISSUES.md`, "The town". At the seed of the site's pixel the town has about 1700 lots in some 200 ways; the verify holds it
to no two building boxes overlapping, no corner on a carriageway, every corner on dry ground, and every near piece
built (`hook-lots`, `hook-lots-overlap`, `hook-lots-off-street`, `hook-lots-dry`, `hook-lots-drawn`).

**The site file** (`site/hook-site.json`) is what the site editor saves (below) and what the owner may still edit
by hand: `districts` (the `zone`, the ten `quarter`s with `cultures`, `holder`, `mood`, `layer`, `ruin`, the
`field`s), `markers` A to I (the landmarks of `PLAN.md` section 1), `avenues` (the Hook's axis, the shore road,
the Arsenal road), `hosts` (the named ruins: key, position, decay, cut) and `grid` (the Ancient town's blocks per
stretch of coast, the probability and the weights of the drawn hosts). The frame is the kit's: x west to east,
+z the sea (the world's north), -z inland. Rebuild after an edit; `verify.py --assert` checks the result.

## The site editor (`targets/hook-site`, `dist/hook-site.html`)

Voth's site editor on Hook's page: `python3 serve.py`, open `http://127.0.0.1:8814/dist/hook-site.html`, draw, and
**save** writes `site/hook-site.json` (without the server the button downloads the file: put it in `site/`). Then
`python3 build.py` inlines it into both pages. Every quarter, marker, avenue and named host of the site can be
selected (the list on the right, or a click) and dragged; a quarter's editor holds its layer, ruin level, cultures
("hukoa 70, salvage 30"), holder and mood, a field's its kind and strength, a host's its type, decay, cut, turn and
note. Modes: `1` select, `2` quarter, `3` field, `4` zone, `5` marker, `6` avenue, `7` host, `R`/`L`/`M` the ground
brushes; Ctrl+Z undoes; `z` shows the city plan's own drawing (90b) under the editor's marks.

`build.py` makes the page as a *site target* (`SITE_TARGETS`): Hook's page (the `hook` target's layout and views)
plus Voth's editor **read in place** from `settlements/voth/targets/voth-site`: the model (`10-site-model.js`, as
`93-site-model.js`: `SITE`, the undo stack, the `TERR` delta grid), the tools (`55-site-tools.js`, as `95`) and
the panels of its head (`00-head.html`, lifted into `93a-site-dom.js`, which inserts them into the Port page).
Not Voth's ground (`20-site-cantons.js`, `50-site-scene.js`). Hook's own fragments stand on them:

| Fragment | What |
|---|---|
| `targets/hook-site/94-hook-site-adapter.js` | `[web]` what the tools read from Voth's scene, on the Port's terrain: `VIEW.ext` (the zone's extent), `VIEW.surf`/`pick` (terrainH plus the delta, a hidden pick mesh refined by marching), the overlay as a draped mesh (the Port's terrain shader is left alone), `VIEW.refreshTerrain` onto the Port's terrain chunks, `VIEW.sprite`, the minimap base, `TERR` re-sized to the square, `VOTH` (SEA 0, terrainH, landDist along z, no cantons or causeways), the catalog engine's camera names on the Port's `ctl` and `applyCam`, the frame hooks from `PORT_FRAME`; the Port's orbit, inspector and WASD kept out of a drag, a click and a text field |
| `targets/hook-site/96-hook-site-model.js` | `[web]` Hook's records and tools over Voth's: the district types (zone, quarter, field), a quarter's fields and a field's kind kept through `SITE.clean`, the hosts and the grid saved and loaded, `SITE.json` in Hook's shape (Voth's causeways, stations and routes kept empty in memory and left out of the file), the host mode, selection, dragging and editor, Hook's painting (a quarter in its layer's colour, the damage field hatched, the zone an outline) and minimap, saving to `/save/hook-site` |
| `targets/hook-site/98-hook-site-start.js` | `[web]` the start: the scene pieces, the panel, the site from the server or the inlined copy; `window._site` for the verify |

`verify.py dist/hook-site.html --assert` runs the editor's checks (`SITE_CHECK_JS`): the site loaded with its ten
quarters, nine markers, three avenues, eight hosts and the grid; every item selects and draws its marks; a marker,
a host and a quarter's corner move; the tools add a quarter, two markers, a host and an avenue, undo and redo, a
raise stroke moves the ground and undoes; and a save round-trips (`SITE.clean(JSON.parse(SITE.json()))` is the site
again, hosts and grid included). It shots the map and city views. The ground strokes are saved but not yet applied
by `build.py` (`KNOWN_ISSUES.md`).

`verify.py` is on `tools/harness.py` and runs the kit's invariants (`kits/port/verify.py`, imported) plus
Hook's own:

* `port-every-key`: every key registered with `PORT_SEG` or `PORT_VESSEL` is placed at least once (`PLAN.md`
  section 2); the five host keys count.
* `hook-vessels-afloat` (soft): every placed vessel's midship is over water deeper than its draft. The ruined berth
  and pen silt up by the kit's design (their d=1 stamps), so their vessels report shallow; read it, do not gate on it.
* `hook-site-plan`: the city plan ran: ten quarters, three ways, every non-vessel item filed as a landmark footprint.
* `hook-hosts-placed`: every named host of the site is placed (one that overlaps a Port footprint reports an error).
* `hook-heights`: the palace marker stands 24 m or more above the quays, the hill behind 60 m or more; says which of
  the two stamps the model made unnecessary.
* `hook-world`: the kit's origin stands at the model's 1:1 shoreline (the natural ground there within 12 m of sea
  level, the sea 300 m out, land 300 m in) and prints `HOOK_WORLD.report` (the numbers of "The ground").
* `hook-tags`: every host has a `core/tags` record.

## The ground

Hook stands on the **Krator Scale Model's ground at 1:1** (the owner, 2026-10-19: built in place on the model, so its
terrain never has to be reconciled with the open world). The land is the open world's own, read in place:
`core/world/41-world-fields.js` (`WORLD.H`: the model's heights by Catmull-Rom, the style's detail per biome overlay, the
channels and scarps) and `41l-world-landforms.js` (`WLAND`: the landform records under a cell, stamped through
`WORLD.landHook`), as `settlements/pinnacle-rock` reads them; Hook patches neither. The data is Hook's own cut in
`world/`: `cut.py` runs `tools/scale-model/extract_region.py` on the model's data (`tools/scale-model/model/data`, the 5.1
canvas) over a 40 km box round the pin, with the extractor's 20 km margin, at 500 m cells (`region.json` and the rasters;
`build.py` decodes them with `core/world/world_data.py` into `WORLD_DATA` and `WORLD_R`). The branch's `KLAND` (the
little demo's land rule lifted into `core/terrain`, on a saved 4.21 page) is retired.

**The spit.** On 5.1 Hook's pin (`sm3ft5vrof`, px 809,923) is a wet cell 6 m under the Ring Sea on a drowned flat: -10 to
+5 m for some 8 km south and west, one body with the sea, the plateau rising 1.5 km east. The continental records describe
a peninsula and a spit there (`openworld/populations-gemini.json` "Hook peninsula", `GEOLOGY-SANITY-CHECK.md` "Hook spit",
a carbonate shelf; every road of the Ancient network out of Hook begins with a causeway), and the owner chose to draw it
(2026-11-24). The model's 2 km cells cannot hold it, so it is three landform records in the model's own format,
`world/landforms.json`: 41l benches at +5 m, chained (41l stamps its benches in order, so a chain unions): the peninsula
(4.7 by 1.9 km, its east end cut into the plateau's north-west foot), the hook's shank running 2.4 km south off its west
end and the barb curling back east. `cut.py` adds them to the cut unless the model already carries their ids; the same
records are written up for the model's edit queue (`KNOWN_ISSUES.md`, "The ground on 5.1").

`src/75d-hook-world.js` runs `WORLD.init` and lays the kit's frame on the model: the origin at the nearest straight real
coast to the pin (a shoreline with the sea a metre deep 300 m out and dry land 200, 400 and 600 m in, five stations 750 m
apart within 250 m of their line: not a ripple on the flat), the frame turned to the coast's bearing there, so the P0
waterfront (kit z near 0) stands at the water with the sea before it; `PORT.natH` (the kit option in
`kits/port/src/71-port-terrain.js`, approved by the owner 2026-10-19) takes the model's ground, less the Ring Sea's level, in
place of the kit's own coast. Everything else of the kit (the stamps, the sea, the grid) is unchanged. What the cut says
(the page's `HOOK_WORLD.report`, which `verify.py` prints as `hook-world` and `tests/test-hook-world.js` as `frame`):

| | |
|---|---|
| The pin | px 809,923 on 5.1 (537,593 on 4.21, where the owner moved it to the shore on 2026-10-19); 6 m under the sea on the model, **+5 m on the spit**, 631 m south of the waterfront's origin (px 809, 922.68) |
| The sea | the Ring Sea at **-1,500.19 m** in the model, the cut's one water body |
| The coast's bearing | **-0.3 deg from east**: the peninsula's north shore; the five stations lie on it within 20 m |
| The ground behind the quays | the spit, **+5 m for 1.25 km inland**, the lagoon behind it (-2 m at 2 km, -7 m at 4 km). The Heights and the hill behind are the kit's stamps (below) |
| The sea bed | -22 m at 250 m out, -31 at 500 m, -50 at 1 km, -93 at 2 km: deep water off the waterfront |
| Climate | XA, 4,000 mm/yr, 32 C at the pin (openworld/resources-settlements.json); overlays `SW Bay` and the Ring Sea's |
| Channels | none in the cut reaches the site; a geyser vent 36 km north in the sea, the Zeijani Qarnu-Tubu tube's end 25 km north-east |
| The frame | kit +x = world (-1.000, 0.006), kit +z (the sea) = world (-0.006, -1.000): a half turn. **The kit's -x end, the Point, lies at the world's EAST end**, by the peninsula's root on the plateau, and the Stacks at the west, toward the hook, since a rotation (never a mirror) that puts the sea north puts the kit's east in the world's west. The owner keeps it so (2026-10-19): Iziz's segments (the Customs, the Arsenal) east, Voth's (the Sun Canton, the Stacks) west, toward the Vothic border; `PLAN.md` section 1 reads its zone table from east to west |

**The stamps.** The plan's two landforms behind the quays, the Heights (31 to 46 m) and the hill behind (70 to 95 m
over the site's last 220 m), stay in `src/76-hook-ground.js` as the kit's ramp stamps, kept **only where the model has
no such relief**: a stamp is kept when the model lies under the ramp's surface over its whole footprint (the ramp then
only raises) and dropped where the model already stands as high anywhere in it (a ramp sets the ground, so it would
cut the model's slope). On 4.21 both were dropped (the model's slope stood higher); on the 5.1 spit at +5 m **both are
kept** (`HOOK_GROUND.fromModel`). They are the town's ground, not the map's, so they are not landform records.

## The layout (`targets/hook/89z-rows.js`)

`PLAN.md` section 2 as a `PORT_LAYOUT_DEF` on the kit's grid placement (`kits/port/API.md`, "Grid
placement"), the way `kits/port/targets/harbour` does it. One coastal run, west to east: the Point (`hbHaven`),
the Strand (`hbFish`, `hbMarina`), the Tethyan quarter (`tmPass`), the Customs (`cgStore`, `cgBox`, `cgCrane`), the
Hook (`pier`), the Imperial quay (`quay`), the eastern crane, the Iron Court (`slBerth`, `slPen`), the Arsenal
(`tmShip`, `ddDock`, `ddShed`, `ddYard`), the Sun Canton (`tmHeli`) and the Stacks' shore (`quay110` twice). Behind
the pier the Customs House (`lbAuthority`) and the granary canton (`lbStores`); behind the Sun Canton the necropolis
(`lbTanks`) with the tank houses (`chTank`) behind it, and the container towers and compounds (`chStack`, `chCourt`)
behind the plain quays. Off the pier's end the hook of the Hook: four `spYard` platforms, two seaward and two east.
The vessels: the stack town (`vsGiant`, salvage) grounded in the pier's slip, the Iron Court (`slCarrier`) at the
deep-water berth, the pens' submarine (`slSub`) inside the pen and a second one sunk off the platforms, the grain
ship (`vsPanamax`) along the platforms' west face, the wreck (`vsFeeder`) off the L's east end.

**Compass.** The kit's frame is local: `N` is its land side (-z) and `S` its sea side (+z). On the scale model the sea
lies to Hook's NORTH (the owner, 2026-10-17), so the kit's `S` is the world's north and the run's "west to east" is
the kit's -x to +x. Placing the frame on the model is the open world's business; nothing in the layout changes.

Decays are per segment, from the plan's table, with one change the owner made on seeing the town (2026-10-19): the
working harbour's segments and the Customs House stand at the kit's worn decay 1 like the rest, not at 0, so the
port's buildings take the kit's rust and match the ships; the Izani's fresh repairs come back as dressing records
in P3. 3 is salvage, where the salvagers live. `KNOWN_ISSUES.md` lists what the layout API could not give the plan.

The page is the kit's page: click to inspect, `n` night, `b` the segment-bounds overlay, `l` the LOD panel, `z` the
site overlay. The presets are the views of `PLAN.md` section 5 that exist so far, plus the Heights, the Ancient
town and the hill behind (`targets/hook/91z-views.js`).

## P3: the landmarks, the damage, the pods

The layers' landmarks are civic pieces of their own kits placed by `core/city`'s step 6: each takes an avenue lot
where its `near` scorer wants it, the distance to one of the site's markers A to I (`88-hook-programme.js`
`landmarks`; `90a-hook-city.js` `rules.near`). At this seed: the governor's palace at the head of the Hook's axis
(B), the Customs market and the harbour watch's house by the Customs House (A), the garrison's barracks and tower in
the Iron Court (H), the Kautoan governor's hall on the Heights' east end (G), the Hykkousoi sea temple by the
terminal (F), the Temple of the Sun's stand-in and the necropolis's chapel in the Sun Canton (C, D), the slave
market's cages and the Izani watchtower in the Stacks (E), the Hukoa elders' hall and the moon shrine at the Point
(I). Each is a lot record with a `name` and a `role`, labelled on the page.

The reconquest's **damage field** (the site's `damage` district, 0.8 over the eastern harbour) is read into every
lot's record: at 0.7 and over a lot is **rubble** (drawn as a dark heap over its footprint, its building not built),
between 0.3 and 0.7 **scorched** (a tag for P4's dressing).

The **host-lot rule** draws its first additions: Hykkousoi pods grown on the Tethyan quarter's ruins (the Bell Hall
and the Capsule Stalks) by the Ys kit's own `HYK.placeOn` on the host's radius function (the Ancients kit's
`HOSTSPEC_*`), a bearing and a floor each from the host's own stream (`HOOK_PROG.pods`), each a `core/tags` record
under its host. The other layers' additions and the Ancient Iziz markets hung from the towers are still to come
(`KNOWN_ISSUES.md`, "The landmarks").

## Next

P3's remainder (`KNOWN_ISSUES.md`, "The landmarks"): the pieces the kits lack (the Temple pyramid on the pad, the
Ordinator fortress's wall and its breach, the necropolis's tombs, the Kautoan palace court, the toppled statues, the
war-walkers), then P4: the harbour's life.
