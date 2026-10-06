# kits/motor-vehicles: known issues

`verify.py --assert` passes with nothing deferred.

## Open

- [ ] **No Geomancer symbol in `core/sockets/38-symbols.js`.** The guild's sign (a brass flame on a brown disc, brass
  rim: the Locus fuel-station pole sign) is modelled on the buggy (disc, ring, two tapers), not painted. If the
  Geomancers get a socket pack or painted banners, add a `flame` symbol and `SYMBOL_OF.geomancer` upstream, re-vendor
  `kits/catalog/krator-symbols.js`, and the buggy can carry it as a decal (one more draw call).
- [ ] **Full lock grazes the nose.** At `maxSteer` (0.45 rad) the front tyres' inner rear lugs come within about
  2 cm of the nose box sides (x = +-0.50) at hub height. Narrow the nose or the lock if a host steers hard in close view.
- [ ] **Signs are modelled, not decals.** The Republic triskelion, the Izani sun, the abyssal star and the Post-Apoc gear
  are built from triangles and discs on the bodies (no extra draw call), and read from a few metres. If close views
  want the painted symbols of `core/sockets/38-symbols.js`, add them as decals (one more draw call each).
- [ ] **Tracks do not run.** On `pa_crawler_hab` the road wheels turn (`roll()`), but the belts, sprockets and idlers are
  part of the static body. A host that shows it up close at speed could scroll a belt texture; there is none.
- [ ] **The crawler's lid and the six-wheeler's rocket rack do not move.** The lid's angle is the variant (open in
  Survey, shut in Hauler); the rack does not traverse. Pivots for them would be extra children (more draw calls).
- [ ] **Two big vehicles over the 6 000-triangle default.** `rep_crawler` (about 14 000, eight wire wheels) and
  `pa_crawler_hab` (about 14 000, four belts, twelve road wheels) declare `budget.tris` 15 500 and draw 10 and 14 meshes.
  Each is meant as one to a world; a fleet of them wants a lower-detail build (`setDetail(0.5)` thins only round parts).
- [ ] **The abyssal lamps are lanterns on the shared lamp material.** The abyssal people have nothing electric, so its
  "headlamps" are oil lanterns (warm lenses, `data.lamps: 'oil lanterns'`); `lights()` lights them the same way.
- [ ] **The suspension does not move.** Arms and coilovers are part of the static body: `roll()` and `steer()` turn
  the wheels only. A host that bounces wheels over terrain would separate them from the arms.
- [ ] **No textures.** Vertex colours only, on every vehicle; the material library (`core/materials/`) is not adopted.
  Close up the plate and canvas read flat (the Post-Apoc hab's rust and the crawler's cream panels most of all). Candidates if wanted: a worn painted steel plate (brown, chipped to bare metal), a
  canvas weave (the Locus canvas family), tread rubber. Ask the owner before inventing procedural stand-ins.
- [ ] **No exporter yet** (`core/export`, GODOT-PLAN.md rule 10). The data is exportable as is (`KratorVehicles.list()`);
  the meshes need the shared exporter when it exists.
- [ ] **The tools list only `src/`.** `tools/audit_port.py` and `tools/make_index.py` take top-level files only for
  `kits/catalog`; this kit's own files are tagged by hand in `PORT.md` ("Notes") and `INDEX.md` is hand-written.
  Add `kits/motor-vehicles` to both special cases to have them generated.
- [ ] **The sheet's ground and labels are pale.** The catalog page engine's ground colour is not converted to linear
  (as on the catalog sheet); the vehicles are. Page only.
