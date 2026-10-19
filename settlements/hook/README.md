# Hook

Hook is the Ancient port city of the Ring Sea's south-western shore, the Izani Empire's premier port, retaken from
Voth a few months before game start (`LORE.md` section 6.2, the Hook entry; section 6.12, "Hook is lost"). `PLAN.md`
is the plan: the Ancient Port kit (`settlements/port`) lays the waterfront, the Ancient town behind it is the layer
under every other, `core/city` lays the town, and six building kits dress the layers of its history. **This folder is
at phase P1**: the waterfront (P0, every Port segment and vessel placed at least once), the ground behind it, the
site on `core/city` (steps 0-5), the Ancient town's ruin hosts on their grid and the site editor page. `LAYOUT.svg`
is the layout the owner approved (2026-10-19), drawn to scale over the P0 run.

## The build

```
git lfs pull --include="settlements/port/tex/*"    # the kit's texture pack is in LFS: pointer files build black surfaces
cd settlements/hook
python3 build.py                                   # dist/hook.html and dist/hook-site.html (+ dist/hook*.tex.port.js, the kit's texture pack)
python3 verify.py dist/hook.html --assert --views "Overview;The Ancient town" --out shots/x
python3 verify.py dist/hook-site.html --assert --out shots/site      # the site editor's own checks
python3 build.py --vendor-check                    # every src/ file that shadows a kit fragment, against the kit's copy
python3 serve.py                                   # http://127.0.0.1:8814/dist/hook-site.html: the editor, saving into site/
```

`build.py` reads the Port kit **in place**: every fragment of `settlements/port/src`, the core lists the kit's own
`build.py` names (`core/materials`, `core/lod`, `core/atmos`, `core/water`, `core/materials/record`) and the kit's
texture pack (`settlements/port/tex`, written beside the page as a sidecar). Nothing of the kit is copied here; the
kit's build rules (seed discipline, one shared scope, unique registration keys) run on Hook's fragments through the
imported `settlements/port/build.py`. A `src/` file with the same name as a kit fragment shadows it and is an adapted
copy that `--vendor-check` reports (none yet).

P1 adds to the page, read in place too (`build.py`, "P1"):

* `core/rand`, `core/space` and `core/tags` under their own names (`KRAND`, `KSPACE`, `KTAGS`);
* `core/city` in one closure (`76-kcity-bundle.js`, as Verge takes it): Hook reads `KCITY` and `KCITY.lib`;
* `site/hook-site.json` inlined as `HOOK_SITE` (`76-hook-site-data.js`);
* the five Ancient host types, `kits/ancients/src/8ap-host-*.js`, as `78*-host-*.js` (the Bell Hall's `HBH` renamed
  `HBLH`: the Port's haven has the name), with the skyscraper and glass-shard helpers they call lifted from
  `52-sky-abc.js` and `42-offices.js` (`78-sky-helpers.js`).

## P1: the ground, the site, the Ancient town

| Fragment | What |
|---|---|
| `src/76-hook-ground.js` | `[G data]` the Heights (a ramp 31 to 46 m, the quays at 6) and the cliff's foot (70 to 150 m at z -1180) as the kit's own layout stamps; `hookGroundH` for what stands on them |
| `src/79-hook-ancient.js` | `[draw]` the five host types registered as Port segments (`anFacet`, `anBastion`, `anArcades`, `anStalks`, `anBell`: a land block the width of the podium, a flat pad at the ground's height, the kit's builder run in a group at the pad with the group transform on, cut at a storey through the kit's Ys hook) |
| `targets/hook/89z-rows.js` | `[G data]` the P0 run, then the ground stamps and the hosts: the site's named hosts, then one per free block of the Ancient grid by `KRAND` (seeded from the stretch, row and column; the type by the site's weights, the decay and the cut by the quarter's ruin level; a block near an avenue, on the Heights' front slope or over a Port footprint stays free); every host and quarter in `core/tags` before anything draws |
| `src/90a-hook-city.js` | `[G data]` `core/city` steps 0-5 on the site after the terrain: the build zone onto the raster, every Port footprint and host filed as a landmark (hard ground), the quarters with their lot mix, holder, mood, layer and ruin level, the painted fields, the three avenues drawn and snapped. Steps 6-12 are P2 |
| `src/90b-hook-city-draw.js` | `[web]` the streets through core/city's own drawing, the quarters' outlines and labels, the markers; `z` toggles the overlay; `window._city` for the verify |

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

`verify.py` is on `tools/harness.py` and runs the kit's invariants (`settlements/port/verify.py`, imported) plus
Hook's own:

* `port-every-key`: every key registered with `PORT_SEG` or `PORT_VESSEL` is placed at least once (`PLAN.md`
  section 2); the five host keys count.
* `hook-vessels-afloat` (soft): every placed vessel's midship is over water deeper than its draft. The ruined berth
  and pen silt up by the kit's design (their d=1 stamps), so their vessels report shallow; read it, do not gate on it.
* `hook-site-plan`: the city plan ran: ten quarters, three ways, every non-vessel item filed as a landmark footprint.
* `hook-hosts-placed`: every named host of the site is placed (one that overlaps a Port footprint reports an error).
* `hook-heights`: the palace marker stands 24-42 m above the quays, the cliff's foot 60 m or more.
* `hook-tags`: every host has a `core/tags` record.

## The layout (`targets/hook/89z-rows.js`)

`PLAN.md` section 2 as a `PORT_LAYOUT_DEF` on the kit's grid placement (`settlements/port/API.md`, "Grid
placement"), the way `settlements/port/targets/harbour` does it. One coastal run, west to east: the Point (`hbHaven`),
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

Decays are per segment, from the plan's table: 0 repaired in the working harbour, 1 worn at the edges, 3 salvage
where the salvagers live. `KNOWN_ISSUES.md` lists what the layout API could not give the plan.

The page is the kit's page: click to inspect, `n` night, `b` the segment-bounds overlay, `l` the LOD panel, `z` the
site overlay. The presets are the views of `PLAN.md` section 5 that exist so far, plus the Heights, the Ancient
town and the cliff's foot (`targets/hook/91z-views.js`).

## Next

P2 (`PLAN.md` section 4): the town on `core/city`
steps 6-12 with the kits' dims, the lot filler drawing a culture then a type, the salvage rule, and the host-lot rule
(a lot on a ruin draws the ruin, then its culture's addition on it).
