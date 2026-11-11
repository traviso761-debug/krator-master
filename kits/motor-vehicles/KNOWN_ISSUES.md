# kits/motor-vehicles: known issues

`verify.py --assert` passes with nothing deferred.

## Open

- [ ] **The detail maps are 256 px a family.** A tile is 0.8 to 2 m, so close up (under a metre) the grain softens. They
  are kept small because every world that takes the bundle carries them (`bundle(['geomancer'])` adds about 250 KB to
  Locus and Mungo). `size` in `materials.json` raises them for every vehicle.
- [ ] **Triplanar on sloped faces.** A face at 45 degrees blends two projections, so stripes (the tarp, the planks, the
  corrugation) cross-fade there. The detail normal is applied in object space and is not flipped for the back faces
  of double-sided triangles (pennants, tarps, awnings): their undersides are lit as if bumped the other way.
- [ ] **No Geomancer symbol in `core/sockets/38-symbols.js`.** The guild's sign (a brass flame on a brown disc, brass
  rim: the Locus fuel-station pole sign) is modelled on the buggy (disc, ring, two tapers), not painted. If the
  Geomancers get a socket pack or painted banners, add a `flame` symbol and `SYMBOL_OF.geomancer` upstream, re-vendor
  `kits/catalog/krator-symbols.js`, and the buggy can carry it as a decal (one more draw call).
- [ ] **Signs are modelled, not decals.** The Republic triskelion, the Izani sun, the abyssal star and the Post-Apoc gear
  are built from triangles and discs on the bodies (no extra draw call), and read from a few metres. If close views
  want the painted symbols of `core/sockets/38-symbols.js`, add them as decals (one more draw call each).
- [ ] **The crawler's lid and the six-wheeler's rocket rack do not move.** The lid's angle is the variant (open in
  Survey, shut in Hauler, and its struts are drawn for that angle); the rack does not traverse. Moving them needs a
  pivot child each (one or two more draw calls) and struts that follow the lid.
- [ ] **Two big vehicles over the 6 000-triangle default.** `rep_crawler` (about 14 000, eight wire wheels) and
  `pa_crawler_hab` (about 14 000: four belts, twelve road wheels) declare `budget.tris` 15 500 and draw 10 and 15 meshes.
  Each is meant as one to a world; a fleet of them wants a lower-detail build (`setDetail(0.5)` thins only round parts).
- [ ] **The suspension does not move.** Arms and coilovers are part of the static body: `roll()` and `steer()` turn
  the wheels only. A host that bounces wheels over terrain would separate them from the arms.
- [ ] **The hab's sprockets and idlers do not turn.** The belts run (`roll()`) and the road wheels turn; the sprockets
  and idlers are round discs in the static body, so it does not show from outside.
- [ ] **No exporter yet** (`core/export`, GODOT-PLAN.md rule 10). The data is exportable as is (`KratorVehicles.list()`);
  the meshes need the shared exporter when it exists (`PORT.md` says what crosses: the slot per vertex, the belt loops).
- [ ] **No scorched-metal set** (2026-11-08). The ruin pass paints charred surfaces (burnt bodies, exploded wrecks)
  with `char`, the library's charred bark (`bark.char`) as a low-contrast grey detail, because the library has no
  burnt paint or heat-blued steel; `scorched` (`metal.scorched`) is wired in `materials.json` as optional and its
  prompt is in `core/materials/PROMPTS-NEEDED.md` (section 36). When it lands: pack, and the pass takes it by itself
  (`krator-vehicles-runtime.js` `ruinColour`: `charS`).
- [ ] **The Ancients' cabins are hollow but their hulls are single-sided.** A liner (`F.tub` `inside`) gives the
  interior its walls; the canopy glass is single-sided too, so through the near pane the far pane is not drawn (it
  reads as clear glass). The running gear is a beam axle, a knuckle, an upright and a trailing link per wheel, not a
  modelled suspension: like every other vehicle's, it does not move with `roll()` or `steer()`.
- [ ] **The aircraft are ground props.** The helicopter and the jet are `VEHICLE`s on their landing gear (the kit has
  no airframe kind): `speed` is their flying speed but `roll()` only turns the wheels, the rotor and the fans do not
  turn, and nothing flies. Their boxes are large (the rotor 10.6 m, the span 26 m): a host placing them in a street
  checks the box against the buildings. The tank's lance and turret are static (a wreck's turn is baked by the build).
  A `skidded` wreck's furrow is drawn geometry (a trough and berms on y = 0), not a cut in the host's terrain: on a
  slope it floats or sinks; the host's ground should be flat under the trail (the settled box runs a vehicle's length
  behind the tail).
- [ ] **A castoring nose wheel does not steer.** The aircraft's nose wheels are `steer: false` with `maxSteer` 0
  because a steered single wheel has no room for a fork that clears its swing (the clearance check).
- [ ] **A ruin is a prop.** After a tilt or an overturn a wheel's `rotation.x` spin is no longer about its axle (the
  holder carries the settle as a quaternion and three.js composes the Euler on top); `steer()` turns the pivots the
  same way; a tracked ruin's belts do not run (`roll()` leaves them). A host drives intact vehicles and places ruins.
- [ ] **The ruin pass does not tear the belts, the wheels or the lamps' records apart.** A torn wreck cuts the body
  buckets at the cut plane; its wheels and lamps follow the half they stand in whole, and a tracked vehicle's belts
  only settle. A belt crossing the cut would show as one piece.
- [ ] **The Ancients' sills are boxy for the clearance check.** A superellipse of n 4 and over at the sill, with locks
  of 0.3 to 0.38 rad, keeps a shrouded steered wheel 2 cm clear of the skin at full lock (`krator-vehicles-ancient.js`,
  the header's formula). A rounder sill wants wheel arches, which `F.tub` cannot cut.
- [ ] **The ruin pass is per vehicle, not per fleet.** Each build runs the noise and the deformation over every vertex
  (a 5 000-triangle vehicle: a few milliseconds); a street of a hundred ruins built at once wants them spread over
  frames, or built once per (key, variant, seed, state) and cloned.

## By design

- **The abyssal lamps are lanterns on the shared lamp material.** The abyssal people have nothing electric, so the
  truck's "headlamps" are oil lanterns (warm lenses, `data.lamps: 'oil lanterns'`); `lights()` lights them the same way.

## Fixed 2026-11-08

- **The atlas stopped at 16 slots while `materials.json` listed 20.** `vehicles-detail.js` sized its shader tables
  and `vehicle_bundle.py` the atlas at 16 cells, so slots 16 to 19 (`rustB`, `rustC`, `whitePaint`, `bluePlate`: the
  hab's other rusts, the Republic's and the Empire's cream, the Empire's teal) sampled off the atlas (clamped to its
  edge). Both take 32 now (eight rows of four, only the rows the bundled cultures need), and the Ancients' families
  and the ruin families are slots 20 to 24.
- **`window._texPending` was a function**, which the harness's `textures-decoded` wait (`!window._texPending`) never
  saw clear: the universal assert failed on every run. It is a flag now (`src/90-sheet.js`), cleared when the atlas
  has decoded.

## Fixed 2026-10-06

- **Textures.** Every vehicle (the buggy too) takes library detail maps: chipped paint, clean paint, bare metal, rust,
  corrugated iron, canvas, tarp, planks (`materials.json`, `vehicles-detail.js`), by triplanar projection from one kit
  atlas, so no vehicle draws more meshes than before. `?mat=proc` on the sheet, `KratorVehicles.setTextures(false)` or
  `vehicle_bundle.bundle(cultures, tex=False)` gives the vertex-colour look.
- **Tracks run.** The hab's belts are one mesh, `belts`, whose shoes `roll()` runs round each loop (the bottom run
  stays on the ground and goes back as the hab goes on). `verify.py` checks it.
- **Full lock.** Worse than recorded: the buggy's steered tyres went about 10 cm into the tub's side walls, the
  coilovers and the uprights, not only near the nose. The tub now stops at z 0.74 with a narrow footwell to the
  bulkhead, the nose and its cheek panels are narrower, and the coilovers and uprights moved inboard. The abyssal truck's
  chassis rails brushed its tyres too (moved in 5 cm). `verify.py` now checks every steered wheel at full lock both ways
  (`clearance`).
- **The tools list the kit's own files.** `tools/audit_port.py` takes this kit's top-level files as it does the
  catalog's (`PORT.md` is generated); `tools/make_index.py` already did.
- **The sheet's ground** is converted to linear on this page (`src/90-sheet.js`), so it is sand, not pale.

- [x] (2026-10-06) **Tyre rubber.** `rubber.tyre` was delivered (texturepalooza); the kit is repacked and the `rubber` slot is live.
