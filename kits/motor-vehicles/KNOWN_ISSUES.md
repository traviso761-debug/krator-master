# kits/motor-vehicles: known issues

`verify.py --assert` passes with nothing deferred.

## Open

- [ ] **No Geomancer symbol in `core/sockets/38-symbols.js`.** The guild's sign (a brass flame on a brown disc, brass
  rim: the Locus fuel-station pole sign) is modelled on the buggy (disc, ring, two tapers), not painted. If the
  Geomancers get a socket pack or painted banners, add a `flame` symbol and `SYMBOL_OF.geomancer` upstream, re-vendor
  `kits/catalog/krator-symbols.js`, and the buggy can carry it as a decal (one more draw call).
- [ ] **Full lock grazes the nose.** At `maxSteer` (0.45 rad) the front tyres' inner rear lugs come within about
  2 cm of the nose box sides (x = +-0.50) at hub height. Narrow the nose or the lock if a host steers hard in close view.
- [ ] **The suspension does not move.** Arms and coilovers are part of the static body: `roll()` and `steer()` turn
  the wheels only. A host that bounces wheels over terrain would separate them from the arms.
- [ ] **No textures.** Vertex colours only; the material library (`core/materials/`) is not adopted. Close up the
  plate and canvas read flat. Candidates if wanted: a worn painted steel plate (brown, chipped to bare metal), a
  canvas weave (the Locus canvas family), tread rubber. Ask the owner before inventing procedural stand-ins.
- [ ] **No exporter yet** (`core/export`, GODOT-PLAN.md rule 10). The data is exportable as is (`KratorVehicles.list()`);
  the meshes need the shared exporter when it exists.
- [ ] **The tools list only `src/`.** `tools/audit_port.py` and `tools/make_index.py` take top-level files only for
  `kits/catalog`; this kit's own files are tagged by hand in `PORT.md` ("Notes") and `INDEX.md` is hand-written.
  Add `kits/motor-vehicles` to both special cases to have them generated.
- [ ] **The sheet's ground and labels are pale.** The catalog page engine's ground colour is not converted to linear
  (as on the catalog sheet); the vehicles are. Page only.
