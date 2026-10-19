# Hook

Hook is the Ancient port city of the Ring Sea's south-western shore, the Izani Empire's premier port, retaken from
Voth a few months before game start (`LORE.md` section 6.2, the Hook entry; section 6.12, "Hook is lost"). `PLAN.md`
is the plan: the Ancient Port kit (`settlements/port`) lays the waterfront, the Ancient town behind it is the layer
under every other, `core/city` lays the town, and six building kits dress the layers of its history. **This folder is
at phase P1**: the waterfront (P0, every Port segment and vessel placed at least once), the ground behind it, the
site on `core/city` (steps 0-5) and the Ancient town's ruin hosts on their grid, all of it standing on the Krator Scale
Model's ground at 1:1 ("The ground" below). `LAYOUT.svg` is the layout the owner approved (2026-10-19), drawn to scale
over the P0 run.

## The build

```
git lfs pull --include="settlements/port/tex/*"    # the kit's texture pack is in LFS: pointer files build black surfaces
cd settlements/hook
python3 build.py                                   # dist/hook.html (+ dist/hook.tex.port.js, the kit's texture pack)
python3 world/cut.py <scale-model page.html>       # recut the model round Hook (the page as the Artifact tool saves it)
python3 verify.py dist/hook.html --assert --views "Overview;The Ancient town" --out shots/x
python3 build.py --vendor-check                    # every src/ file that shadows a kit fragment, against the kit's copy
```

`build.py` reads the Port kit **in place**: every fragment of `settlements/port/src`, the core lists the kit's own
`build.py` names (`core/materials`, `core/lod`, `core/atmos`, `core/water`, `core/materials/record`) and the kit's
texture pack (`settlements/port/tex`, written beside the page as a sidecar). Nothing of the kit is copied here; the
kit's build rules (seed discipline, one shared scope, unique registration keys) run on Hook's fragments through the
imported `settlements/port/build.py`. A `src/` file with the same name as a kit fragment shadows it and is an adapted
copy that `--vendor-check` reports (none yet).

P1 adds to the page, read in place too (`build.py`, "P1"):

* `core/rand`, `core/space` and `core/tags` under their own names (`KRAND`, `KSPACE`, `KTAGS`); `core/terrain`'s
  `38-core-relief.js` and `40-core-land.js` (`KRELIEF`, `KLAND`: the open world's ground rule) as `75a`/`75b`, and the
  scale model's cut (`world/`) inlined as `75c-hook-world-data.js`;
* `core/city` in one closure (`76-kcity-bundle.js`, as Verge takes it): Hook reads `KCITY` and `KCITY.lib`;
* `site/hook-site.json` inlined as `HOOK_SITE` (`76-hook-site-data.js`);
* the five Ancient host types, `kits/ancients/src/8ap-host-*.js`, as `78*-host-*.js` (the Bell Hall's `HBH` renamed
  `HBLH`: the Port's haven has the name), with the skyscraper and glass-shard helpers they call lifted from
  `52-sky-abc.js` and `42-offices.js` (`78-sky-helpers.js`).

## P1: the ground, the site, the Ancient town

| Fragment | What |
|---|---|
| `src/75d-hook-world.js` | `[G data]` the scale model's ground under Hook: `KLAND` on the cut in `world/`, the kit's frame laid at the 1:1 shoreline and turned to the coast's bearing, `PORT.natH` set ("The ground" below) |
| `src/76-hook-ground.js` | `[G data]` the Heights (a ramp 31 to 46 m, the quays at 6) and the cliff's foot (70 to 150 m at z -1180) as the kit's own layout stamps, kept only where the model has no such relief (on the 4.21 cut: neither); `hookGroundH` for what stands on them |
| `src/79-hook-ancient.js` | `[draw]` the five host types registered as Port segments (`anFacet`, `anBastion`, `anArcades`, `anStalks`, `anBell`: a land block the width of the podium, a flat pad at the ground's height, the kit's builder run in a group at the pad with the group transform on, cut at a storey through the kit's Ys hook) |
| `targets/hook/89z-rows.js` | `[G data]` the P0 run, then the ground stamps and the hosts: the site's named hosts, then one per free block of the Ancient grid by `KRAND` (seeded from the stretch, row and column; the type by the site's weights, the decay and the cut by the quarter's ruin level; a block near an avenue, on the Heights' front slope or over a Port footprint stays free); every host and quarter in `core/tags` before anything draws |
| `src/90a-hook-city.js` | `[G data]` `core/city` steps 0-5 on the site after the terrain: the build zone onto the raster, every Port footprint and host filed as a landmark (hard ground), the quarters with their lot mix, holder, mood, layer and ruin level, the painted fields, the three avenues drawn and snapped. Steps 6-12 are P2 |
| `src/90b-hook-city-draw.js` | `[web]` the streets through core/city's own drawing, the quarters' outlines and labels, the markers; `z` toggles the overlay; `window._city` for the verify |

**The site file** (`site/hook-site.json`) is the owner's to edit until the editor page comes (`KNOWN_ISSUES.md`):
`districts` (the `zone`, the ten `quarter`s with `cultures`, `holder`, `mood`, `layer`, `ruin`, the `field`s),
`markers` A to I (the landmarks of `PLAN.md` section 1), `avenues` (the Hook's axis, the shore road, the Arsenal
road), `hosts` (the named ruins: key, position, decay, cut) and `grid` (the Ancient town's blocks per stretch of
coast, the probability and the weights of the drawn hosts). The frame is the kit's: x west to east, +z the sea
(the world's north), -z inland. Rebuild after an edit; `verify.py --assert` checks the result.

`verify.py` is on `tools/harness.py` and runs the kit's invariants (`settlements/port/verify.py`, imported) plus
Hook's own:

* `port-every-key`: every key registered with `PORT_SEG` or `PORT_VESSEL` is placed at least once (`PLAN.md`
  section 2); the five host keys count.
* `hook-vessels-afloat` (soft): every placed vessel's midship is over water deeper than its draft. The ruined berth
  and pen silt up by the kit's design (their d=1 stamps), so their vessels report shallow; read it, do not gate on it.
* `hook-site-plan`: the city plan ran: ten quarters, three ways, every non-vessel item filed as a landmark footprint.
* `hook-hosts-placed`: every named host of the site is placed (one that overlaps a Port footprint reports an error).
* `hook-heights`: the palace marker stands 24 m or more above the quays, the cliff's foot 60 m or more; says which of
  the two stamps the model made unnecessary.
* `hook-world`: the kit's origin stands at the model's 1:1 shoreline (the natural ground there within 12 m of sea
  level, the sea 300 m out, land 300 m in) and prints `HOOK_WORLD.report` (the numbers of "The ground").
* `hook-tags`: every host has a `core/tags` record.

## The ground

Hook stands on the **Krator Scale Model's ground at 1:1** (the owner, 2026-10-19: built in place on the model, so its
terrain never has to be reconciled with the open world). The ground rule is the open world's own, `core/terrain/40-core-land.js`
(`KLAND`: Catmull-Rom on the model's 4 km cells, detail in a style per biome overlay, the drainage network carved in,
the escarpments made into cliffs), lifted from `openworld/little-demo`, which now composes on it. The data is the cut
round Hook's pixel in `world/` (`cut.py` runs `tools/scale-model/extract_region.py` on a 40 km box round px 537,596,
with the extractor's own 20 km margin: `region.json` and the rasters; `build.py` inlines them as `HOOK_WORLD_DATA`).

`src/75d-hook-world.js` lays the kit's frame on the model: the origin at the 1:1 shoreline due seaward of Hook's pixel,
the frame turned to the coast's bearing there, so the P0 waterfront (kit z near 0) stands at the water with the sea
before it; `PORT.natH` (the kit option `settlements/port/src/71-port-terrain.js` reads when set) takes the model's
ground, less the Ring Sea's level, in place of the kit's own coast. Everything else of the kit (the stamps, the sea, the
grid) is unchanged. What the cut says (scale model 4.21; the page's `HOOK_WORLD.report`, which `verify.py` prints as
`hook-world`):

| | |
|---|---|
| The sea | the Ring Sea at **−1,500 m** in the model |
| Hook's pixel | on land **592 m above the sea**: the top of a slope, not a coastal shelf. The 1:1 shoreline due seaward (north) is **6.7 km from the pixel**; the kit's origin stands there. The land south of the pixel is a plateau at +740 to +770 m |
| The coast's bearing | **−8.8° from east** (the coast runs ENE, turning north toward the headland east of Hook; the bay west of the Point); the five stations 750 m apart along the shore fit within 150 m of the line |
| The ground behind the quays | a steady slope: **+30 m at 300 m inland, +62 m at 760 m (the Heights' back edge), +115 m at 1,180 m (the cliff's foot line), +195 m at 2 km, +463 m at 4 km**. The palace marker stands 41.6 m over the quays; the cliff's foot line 115 m |
| The sea bed | −10 m at 250 m out, −22 at 500 m, −50 at 1 km, −116 at 2 km |
| The escarpment | **none in the data**: `scarpw` is 0 over the whole cut (the extractor marks escarpments round the eastern abyss only), and no cell behind Hook rises steeply. The Crag Men's cliff of the lore is not in the model's heights |
| Climate | **Af, tropical rainforest**, 4,000 mm/yr, 28 °C mean; overlay `SW Bay` (styled `jungle`: no terraces, no dunes), the Ring Sea overlay from 4 km north of the pixel |
| Channels | six channels in the cut, none nearer than 4.6 km of the pixel (one reaches the bay west of the Point at (−4.6, +1.7) km); the river Grin Rivrh is 45 km west. No channel crosses the site |
| The frame | kit +x = world (−0.988, 0.154), kit +z (the sea) = world (−0.154, −0.988): a half turn less 8.8°. **The kit's −x end, the Point, lies at the world's EAST end of the waterfront**, since a rotation (never a mirror) that puts the sea north puts the kit's east in the world's west; the plan's "from west to east" order is reversed on the ground unless the owner reverses the run |

**The stamps.** The plan's two landforms behind the quays, the Heights (31 to 46 m) and the cliff's foot (70 to
150 m), stay in `src/76-hook-ground.js` as the kit's ramp stamps, kept **only where the model has no such relief**: a
stamp is kept when the model lies under the ramp's surface over its whole footprint (the ramp then only raises) and
dropped where the model already stands as high anywhere in it (a ramp sets the ground, so it would cut the model's
slope). On the 4.21 cut **both are dropped** (`HOOK_GROUND.fromModel`): the model's slope stands higher than either
ramp. The verify's `hook-heights` reads the result (the marker 24 m or more over the quays, the cliff's foot 60 m or
more). `KNOWN_ISSUES.md` says what the slope costs (the pads cut banks, no cliff face) and what the owner may want to
edit in the model.

**What the owner must approve.** The kit option (`PORT.natH`, two hunks in `71-port-terrain.js`: `portNatH` reads
`PORT.natH` when set, the nature scatter skips a tree under sea level) is applied in this branch and the Port's own
pages rebuilt with it; it changes nothing for a build that does not set it. The diff is in the hand-over note.

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

The site editor page (`KNOWN_ISSUES.md`, the first item), then P2 (`PLAN.md` section 4): the town on `core/city`
steps 6-12 with the kits' dims, the lot filler drawing a culture then a type, the salvage rule, and the host-lot rule
(a lot on a ruin draws the ruin, then its culture's addition on it).
