# KLAVA: lava that flows over the ground (core/terrain)

A lava flow as a heightfield cellular automaton of a Bingham fluid: yield strength and a viscosity that rise as it cools,
cooling by radiation and conduction, and solidification into new ground. The MAGFLOW family (Vicari et al. 2007, Del Negro
et al. 2008; INGV's GPUFLOW, https://progetti.ingv.it/en/get-it/geohazard-dtc/gpuflow). Asked for by the owner through
the Godthrone session (2026-10-27, "step 5": the summit lake's overflow onto the caldera floor). Later users: Godstep's
flows and the Throne's.

| File | What |
|---|---|
| `46-core-lava.js` | `KLAVA` ([G data]: no THREE, no DOM, no `Math.random`): `create` a sim on a `KFIELD` lattice, `vent`, `pond`, `step`, `run`, `mass`, `at`, `front`, `writeBack`, `snapshot`/`restore`, `hazard`, `export`; `KLAVA.bind` for core/hazard; `flux`, `rheo`, `RHEO` |
| `test-lava.js` | `node core/terrain/test-lava.js`, each check with a negative (`--write` rewrites `golden-lava.json`) |
| `klava.gd`, `klava_test.gd`, `golden-lava.json` | the GDScript twin (`class_name KLava`, the same stepper on doubles) and its test on the golden case; copies in `godot/tests/terrain/` (`godot/tools/sync_core.py`). Passing in Godot 4.7.2 (2026-10-27), in `tools/test_all.py --nightly` |
| `host/46-core-lava-gpu.js` | `KLAVA.gpu(renderer, sim)`: the same step as render passes on float textures (ping-pong), `KLAVA.gpuCheck` against the CPU ([G shader]) |
| `host/46-core-lava-draw.js` | `KLAVA.surface(sim, o)`: the moving surface as one mesh on core/atmos's lava chunk, its glow from the temperature ([G shader]) |

## Why core/terrain

`KFIELD` is `core/terrain/30-core-field.js` and `KHAZ` is `core/hazard/20-core-hazard.js`. The flow's data is a field: the
ground it runs over is a KFIELD's lattice, and what it leaves is new ground written back into that field (`writeBack`), as
`KSCOUR` and `KBASIN` are processes on the same ground. Its hazard is a thin binding (`KLAVA.bind`, the way `KHAZ.bindFire`
binds a fire) that KHAZ looks up only when a page has both. It also sorts after both: `20` (hazard) < `30` (field) < `46`.

## The model

Each cell of the lattice holds the ground `z` (with any frozen lava on it), the lava's thickness `h` and its temperature `T`
(kelvin). One step of `dt` seconds:

1. **Flux.** Every cell with more than `hmin` of lava sends to each of its eight neighbours whose surface (`z + h`) is lower
   the Bingham sheet flux `q = w G (he - hc)^2 (he + hc/2) / (3 eta)`. Here `G = rho g sin(theta)` over the drop between
   the two surfaces, and `hc = Sy / G` is the yield thickness: nothing flows below it. `he` is the column above the
   neighbour's ground, so a cell does not pour over a step higher than its own surface. `eta` and `Sy` come from the cell's
   `T`. The form is MAGFLOW's `(Sy hc^2 w / 3 eta)(a^3 - 3a^2/2 + 1/2)`, `a = he / hc`, factored so it holds as `Sy -> 0`,
   where it is Jeffreys' sheet. A face is `2/3` of the cell wide and a corner `sqrt2/6`. That makes a uniform sheet's flux
   per unit width Jeffreys' in any direction (the test measures it within 0.05% down an axis and down the diagonal), and the stencil
   the isotropic nine-point one.
2. **Caps.** Each pair's volume is at most a share of the drop between them (`0.1 A dH` a face, `0.025 A dH` a corner; they
   sum to one half). So a step never overshoots, and the sim is stable at any `dt`: a 1e5 s step is in the test. A cell
   never sends more than it holds. When the cap binds, the lava levels as fast as the lattice allows. Accuracy in time
   comes from the adaptive step: `run` steps at `cfl * cell / the fastest mean velocity`.
3. **Gather.** Each cell takes what its neighbours sent, its heat mixed by volume. This is two passes over separate buffers,
   so the order cells are visited in does not matter, and the GPU does the same.
4. **Sources.** A `vent` adds `Q(t) dt` at its temperature, spread over its cells. A `pond` holds its cells at a level (a
   lake). What leaves the pond is its `out` ledger, which a page's lake level can follow: `level(t, out)`.
5. **Cooling.** Radiation from the hot fraction of the top uses MAGFLOW's closed form,
   `T' = T / (1 + 3 eps f sigma T^3 dt / (rho c h))^(1/3)`, where `f` (`exposed`, 0.1) is the share of the crust that is
   open; a bare surface would freeze a 5 m flow in hours. Then conduction into the ground at `Tground` (implicit).
6. **Freezing.** At the solidus the whole column joins the ground (`z += h`, `dep += h`) and stops being lava.

`RHEO.basalt` (the default) is a hot, fluid basalt: `eta` 10^3.5 Pa s at 1400 K rising to 10^7 at the solidus (1173 K),
and `Sy` 100 Pa to 100 kPa. Both are exponential in `T`, as MAGFLOW's yield law is. `RHEO.etna` is MAGFLOW's Etnean
basalt: Giordano & Dingwell's VFT viscosity and Ishihara et al.'s yield. Any field can be overridden (`rheo: {Tvent: 1450}`).

**Mass.** `sim.mass()` gives `erupted = molten + frozen + lost`, kept to rounding (1e-9 of the erupted volume in the
tests). `lost` is what drains off the sim's edge (`edge: 'drain'`: the slope carried on past it; `'wall'` keeps it in).
Pond cells are the reservoir, so they are outside the sum. A vent must not stand in a pond.

**Determinism.** There are no random draws in the step. The one draw is the ground's roughness (`rough`, metres; 0 by
default). It is `KRAND.hash(seed, I, J, 0x1A7A)` on the field's lattice indices, so a sim cropped from the same field gets
the same bumps, and a seed gives other lobes. The test runs the same seed twice and compares the bits.

## What a page gets

- `sim.z`, `h`, `T`, `dep`, `vx`, `vz`, `frozeAt`: Float64Arrays on the lattice (row j, then column i).
- `sim.at(x, z)`: `{h, T, z, dep, surf, molten, heat, crust, vx, vz, frozeAt, pond}`.
- `sim.heat(k)`: 0..1 from the solidus to the vent's temperature. This is the hook a lava shader's glow reads; the crust
  is `1 - heat`.
- `sim.front()`: the molten cells beside cells without molten lava, as a walker's or an NPC's keep-out line.
- `sim.writeBack(field)`: the frozen flow as new ground. It adds the deposits not yet written, bilinear onto every lattice
  point of the field and of its insets. Call it again later and it adds only what froze since. `{all: true}` writes every deposit again, for a page that put its
  field back first; `each(g, k)` names each point raised, so the page can move that vertex of its ground mesh.
- `sim.hazard(o)` and `KLAVA.bind(rec, sim)`: a `kind: 'lava'` record over the sim's box with `stateFn: 'KLAVA.flow'`.
  At a point it is molten (k 1), a fresh crust frozen within `o.hot` seconds of sim time (k .25), or clear. KHAZ hands a
  state function the core/tags record, so a page whose REGISTER does not give it back binds by a key instead:
  `sim.hazard({key: 'overflow'})` puts the key in the hazard's `seed`, and `KLAVA.bind('overflow', sim)` binds it.
  `o.nav` sets the record's navigation costs; a sim's box is wide, so a page may not want KHAZ's `avoid` over all of it.
- `sim.export()`: `krator-lava`, version 1. `h`, `T` and `dep` are Float32 base64 (KFIELD's), for Godot or a save.

## Adopting it

A build opts in by explicit path; it is not pooled. Nothing changes on a page that does not list it.

1. `build.py`: the data half and, for a drawn flow, its three.js halves. Key the host halves so they sort after the page's
   own `46-` fragments; they merge into `KLAVA` whichever loads first:

   ```python
   PATH.setdefault('46-core-lava.js', J('core', 'terrain', '46-core-lava.js'))           # needs 08-core-rand (KRAND) when rough
   PATH.setdefault('46s-core-lava-draw.js', J('core', 'terrain', 'host', '46-core-lava-draw.js'))   # the surface
   PATH.setdefault('46t-core-lava-gpu.js', J('core', 'terrain', 'host', '46-core-lava-gpu.js'))     # only for KLAVA.gpu
   ```

   The surface wants core/atmos's lava chunk (`core/atmos/fx/89-atmos-fx-lava.js`, `ATMOS.init` done). Without it the
   surface falls back to vertex colours.
2. After the field is baked, make the sim over the box the flow can reach. Pick a cell of 20-50 m (`stride` times the
   field's step) for flows kilometres long; the cost is the cells with lava times the steps.

   ```js
   const S = KLAVA.create({field: GROUND_F, box: [x0, z0, x1, z1], stride: 4, seed: WORLD, rough: .5});
   S.vent({x, z, r: 30, Q: t => ..., T: 1420});              // a fissure, a fountain's feed
   S.pond({inside: (x, z) => inPit(x, z), level: (t, out) => lakeLevel(t, out)});   // a lake that spills
   ```
3. Register the hazard before the flow is drawn:
   `const hz = S.hazard(); REGISTER({x: hz.at[0], y: hz.at[1], z: hz.at[2], kind: 'hazard', tags: {hazard: hz.hazard}})`,
   then `KLAVA.bind(rec, S)` (or `S.hazard({key})` and `KLAVA.bind(key, S)`). The page needs core/hazard (core/hazard/README.md, "Adopting it").
4. Run it on the page's clock or a time-lapse: `S.run(seconds)`. Draw it with `const M = KLAVA.surface(S, {crust, sun})`,
   `scene.add(M)`, and `M.update()` after a run. Write the frozen flow back as ground with `S.writeBack(GROUND_F)`, then
   move the ground mesh's vertices with `writeBack`'s `each`: the page owns its mesh. A time-lapse that goes back keeps
   `S.snapshot()`s and `restore`s them, puts its own field heights back, and calls `writeBack(F, {all: true})`.
5. For real time over a big lattice, use `const G = KLAVA.gpu(renderer, S)` and `G.step(dt)` each frame at a fixed `dt`.
   `G.texture` holds the state; `G.pull()` reads it back for the hazard and the surface. Check the GPU once in the page's
   verify: `KLAVA.gpuCheck(renderer, mk, 200, 5)` gives the worst differences against the CPU.
6. `tools/check_core_use.py` and the port lint need nothing more. The data half is `[G data]` and the host halves
   `[G shader]` (core/PORT.md).

The first user is the Godthrone's vent page (`biomes/godthrone`, `89d-host-overflow.js`): the summit lake's overflow
over the pit's lowest lip, behind its `?overflow` switch.

## Godot

`klava.gd` is the CPU stepper, the same arithmetic in the same order on doubles. It meets `golden-lava.json` (the steps,
the mass, the sample cells) to 1e-4 m and 1e-3 K. The engines' `pow` differ by an ulp, and 663 steps carry that to about
2e-6 m. A Vector2 is single precision in GDScript; the twin keeps every intermediate in a float or an Array.

What is left for the port:
- **The GPU stepper.** The two passes as a compute shader (RenderingDevice; storage buffers for `z, h, T, dep` and the
  eight volumes), or as SubViewports with float textures, as on the page. A compute shader is the better fit: one
  dispatch each for the flux and the update.
- **The surface.** An ArrayMesh rewritten from `h` and the heat, or a vertex shader reading the state texture, on the lava
  `.gdshaderinc` (core/atmos/GODOT.md, "Lava").
- **The hazard.** An Area3D per molten region rebuilt from `front()` a few times a second, or one Area3D over the sim's
  box whose body checks ask `at()`. The navigation layer costs from the frozen and molten cells.
- **Export.** `krator-lava` carries the state; `core/export` does not carry it yet. KHAZ's export knows a fire's front
  (`front`), and a lava front (`sim.front()` with `frozeAt`) is the same shape of change: a follow-up in core/hazard,
  left out here so no hazard page changes.

## Known limits

- The whole column freezes at once at the solidus, as in MAGFLOW. There is no crust over a moving core, no lava tube, and
  no levee building beyond what the yield leaves at the margins. A tube would be a pond-like cell that does not cool.
- A cell is either flowing or not. Thin films under `hmin` (2 cm) do not move; they cool and freeze.
- The GPU stepper keeps no ledger (`lost`, a pond's `out`). A pond whose level follows its `out` runs on the CPU.
- The GPU uses float32 with the ground relative to the sim's lowest point. It agrees with the CPU within a tolerance that
  `gpuCheck` reports, not to the bit.
