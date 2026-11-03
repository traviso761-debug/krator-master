# The lamina column (`35b-core-lamina.js`, `KSTRATA.lamina`; opt-in, 2026-11-03)

The Gills' plan, section 14 item 3, and section 10 (the pipes as a calendar): a breath pipe lays one couplet a day, 0.2-0.4 mm,
a thicker pale band once a year in the wet season, and marker bands at given ages (the Godthrone's glass, one a summit
eruption; the thin years the Monks read as the Cataclysm). A 90 m pipe holds some 300,000 couplets: past KSTRATA's bed limit
and far under its 0.25 m bake, so the lamina is **a column of its own beside the stack**, not a recipe in `KSTRATA.RECIPES`.
Its years are records (one a year, `KRAND.hash(seed, year, salt)`); its days are arithmetic inside a year. It is read from
the lip down: depth 0 is the lip's last couplet.

| File | |
|---|---|
| `35b-core-lamina.js` | `[G data]`: `KSTRATA.lamina(o)`, `KSTRATA.laminaLoad(json)`, `KSTRATA.LAMINA` (the countries and the marker kinds) |
| `host/35b-core-lamina-shade.js` | `[G shader]`: `KSTRATA.laminaShade(L, {THREE, res})`, the bake as a data texture and `laminaColor(depth, px)` in GLSL |
| `test-lamina.js` | `node core/terrain/test-lamina.js`: 32 checks, each with a negative |

```
const L = KSTRATA.lamina({seed, H, rate (.0003), yearD (KCLOCK.YEAR, 365), wet {at 200, days 40, k 2.2} | false, jitter (.15),
                          half (.5), country 'red' | 'white' | colours {a, b, wet},
                          markers [{name, kind 'glass' | 'thin', age (years before the lip) | depth (m), years, k, th, colour, tint}], died (0)})
L.at(depth)            {depth, h, year (before the lip), yearDay, day (of the pipe, 0 its first), daysAgo, phase, half, wet, layer, marker, thick, colour}
L.atPipe(B, x, y, z)   the same at a point of a KSTACKS chimney (a fallen one along its axis; a broken one keeps its whole H, so its top is older)
L.depthOf(day)         where the pipe's day `day` lies (the inverse of at; test-lamina holds 400 round trips)
L.bands({from, to})    the visible bands: 'wet' each year, 'marker' layers (glass), 'run' (a k marker's years: the thin years)
L.bake({res .01})      rows of 256 RGBA8 texels: the mean colour (sRGB) and the local couplet's thickness
L.shade(depth, px, B)  the shader's arithmetic in JS;  L.export() / KSTRATA.laminaLoad(json)
```

The two countries are the plan's section 7 table: `red` rust-red and black with a paler rust band, `white` bone and
grey-green manganese with a chalk band. A marker's `k` thins (or thickens) its years' couplets and leaves more years in the
same height; its `th` lays a layer of its own (a glass band, 4 mm) at its first year's base. A marker that would start past
the foot throws: a pipe too young to hold it should not be given it.

## Adopting it

1. `build.py`: list `core/terrain/35b-core-lamina.js` after `35-core-strata.js` (and core/rand), and
   `core/terrain/host/35b-core-lamina-shade.js` among the host fragments, when a station draws pipes.
2. One column per pipe variant (the plan's 12-16), not per pipe: `const L = KSTRATA.lamina({seed: KRAND.hash(world, v, 0x1a),
   H: variant.H, country: 'white', markers: [{kind: 'thin', age: 300}]})`. A pipe record keeps its variant's index, so the
   inspector reads `L.atPipe(B, x, y, z).day` ("day 412,117 of this pipe") and `.marker`.
3. The material: `const S = KSTRATA.laminaShade(L, {THREE})`; add `S.uniforms` to the material's, `S.glsl` above the
   fragment shader's `main`, pass the height over the foot along the axis as a varying (an instanced pipe's local y), and
   take `laminaColor(L.H - h, fwidth(L.H - h))` for the albedo (it is linear). Use `#extension GL_OES_standard_derivatives`
   (`extensions: {derivatives: true}`) on WebGL1. The outside of a pipe weathers: mix toward the country's crust colour by
   the kit's own term; the bore and a broken lip show the laminae clean.
4. A pipe whose last couplet is old (a dead pipe in a field the swarm left) takes `died`, so `daysAgo` dates it.

**Checked:** `test-lamina.js`, and on SwiftShader (headless Chromium, r128): the GLSL compiles and the pixels equal
`L.shade` at the same depths (16 rows of a 60 m column, worst 0 of 255). **Not judged:** no shot on a real pipe; the
couplet's phase is depth over its thickness, not the walk's count, so the stripe the eye sees and `L.at`'s half can differ
inside one couplet. **Godot:** no twin yet; the export is the record and the year walk ports bit for bit (`KRAND.hash`).
