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

## By design

- **The abyssal lamps are lanterns on the shared lamp material.** The abyssal people have nothing electric, so the
  truck's "headlamps" are oil lanterns (warm lenses, `data.lamps: 'oil lanterns'`); `lights()` lights them the same way.

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
