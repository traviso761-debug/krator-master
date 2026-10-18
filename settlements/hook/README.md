# Hook

Hook is the Ancient port city of the Ring Sea's south-western shore, the Izani Empire's premier port, retaken from
Voth a few months before game start (`LORE.md` section 6.2, the Hook entry; section 6.12, "Hook is lost"). `PLAN.md`
is the plan: the Ancient Port kit (`settlements/port`) lays the waterfront, `core/city` will lay the town behind it,
and six building kits will dress the layers of its history. **This folder is at phase P0**: the harness and the
waterfront, every Port segment and vessel placed at least once.

## The build

```
git lfs pull --include="settlements/port/tex/*"    # the kit's texture pack is in LFS: pointer files build black surfaces
cd settlements/hook
python3 build.py                                   # dist/hook.html (+ dist/hook.tex.port.js, the kit's texture pack)
python3 verify.py dist/hook.html --assert --views "Overview;The Hook from the sea" --out shots/x
python3 build.py --vendor-check                    # every src/ file that shadows a kit fragment, against the kit's copy
```

`build.py` reads the Port kit **in place**: every fragment of `settlements/port/src`, the core lists the kit's own
`build.py` names (`core/materials`, `core/lod`, `core/atmos`, `core/water`, `core/materials/record`) and the kit's
texture pack (`settlements/port/tex`, written beside the page as a sidecar). Nothing of the kit is copied here; the
kit's build rules (seed discipline, one shared scope, unique registration keys) run on Hook's fragments through the
imported `settlements/port/build.py`. Hook's own fragments go in `src/` (none yet); a `src/` file with the same name
as a kit fragment shadows it and is an adapted copy that `--vendor-check` reports.

`verify.py` is on `tools/harness.py` and runs the kit's invariants (`settlements/port/verify.py`, imported) plus
Hook's own:

* `port-every-key`: every key registered with `PORT_SEG` or `PORT_VESSEL` is placed at least once (`PLAN.md`
  section 2).
* `hook-vessels-afloat` (soft): every placed vessel's midship is over water deeper than its draft. The ruined berth
  and pen silt up by the kit's design (their d=1 stamps), so their vessels report shallow; read it, do not gate on it.

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
the kit's -x to +x. P1 places the frame on the model; nothing in P0's layout changes.

Decays are per segment, from the plan's table: 0 repaired in the working harbour, 1 worn at the edges, 3 salvage
where the salvagers live. `KNOWN_ISSUES.md` lists what the layout API could not give the plan.

The page is the kit's page: click to inspect, `n` night, `b` the segment-bounds overlay, `l` the LOD panel. The
presets are the views of `PLAN.md` section 5 that exist so far (`targets/hook/91z-views.js`).

## Next

P1 (`PLAN.md` section 4): the ground extended inland to the Heights' ridge, the site editor and the zones of
section 1; then the town on `core/city`. The owner's answers to section 6 decide the layers.
