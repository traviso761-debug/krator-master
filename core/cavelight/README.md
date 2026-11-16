# core/cavelight: the light underground (`KCAVELIGHT`)

One way to light a page below the ground: the lamps as records, a pool of real lights moved to the records nearest the eye,
the switch that puts the sun out when the camera goes under, a clamped exposure ramp from an opening into the dark, and the
daylight that comes down the openings. Lifted from the three copies Krator had (2026-11-11): Dhelv's cave light
(`settlements/dhelv/src/94-dhelv-light.js`), the building-kit engine's night pool (`core/engine/91n-night.js`, forked in
`kits/zeijani/src/91n-night.js`) and the Hearths' cave stations' hand-placed lights (`biomes/hearths/stations/crystals/49-host-stage.js`).
First user: the Line's biome stations (`biomes/line/PLAN.md` section 6). Dhelv may adopt it later; nothing here edits Dhelv,
the engine or the Zeijani kit.

**Why `core/cavelight` and not `core/atmos/cave`.** Fifteen builds list the `core/atmos` folder to pick its `89-atmos-*`
files; a new subfolder there changes that listing and `tools/check_stale.py` reads all fifteen as stale with nothing in them
changed. A top-level folder is listed by no build. The module also needs nothing of `ATMOS` (the Hearths' cave pages, the
Line's starting point, bind no `ATMOS` at all): it reads the page's own sun, hemisphere light and renderer.

| File | Tag | What |
|---|---|---|
| `10-core-cavelight.js` | `[G data]` | `KCAVELIGHT`: the kinds (the Tungang lamp code, wax, glow fungus, the Ancients' strips...), light and opening records, flicker, the nearest-N choice, the under test, the exposure ramp, the openings' daylight as numbers, lamp lines, the export. No THREE, no DOM |
| `90-core-cavelight-host.js` | `[web]` | `KCAVELIGHT.host(o)`: the pool of real lights, the halos, the underground switch, the exposure, the openings' spot, sky light, bounce, shaft and motes in three.js r128 |
| `test-cavelight.js` | | `node core/cavelight/test-cavelight.js`: every data function, each check with a negative |
| `demo/` | | a test page (below): `python3 core/cavelight/demo/build.py`, `python3 core/cavelight/demo/verify.py core/cavelight/demo/dist/cavelight-demo.html --assert` |

Opt-in by path: a page that does not list these files is unchanged.

## A light record

```
{id, x, y, z, kind, colour, range, intensity, flicker, owner, on, seed, hood, to}
  id         stable: built from the owner's id and an index (a lamp line's: <line id>.<n>)
  kind       a row of KCAVELIGHT.KINDS: it fills colour, range, intensity, flicker and hood
  colour     sRGB hex '#rrggbb'        range  m (the light's reach: three.js distance, Godot omni_range)
  intensity  the real light's at its brightest (three.js PointLight intensity, decay 1.6; Godot light_energy)
  flicker    0..1: how far it wavers (a wax flame .08, an electric lamp .01); the phase is the record's own hash
  owner      the core/tags record it belongs to (the lamp piece, the fungus patch, the strip's lining ring), or null
  on         false: a dead lamp (drawn, never lit; a Line lamp that failed)
  seed       the id the flicker's phase is hashed from (default the id)
  hood       a hooded lamp: {dir: [x, y, z], angle (rad)}: a spot, not a point (the white "stop" lamps)
  to         [x, y, z]: a strip's far end (kind 'strip': a line of light from x, y, z to `to`)
```

### The kinds (`KCAVELIGHT.KINDS`)

The Tungang lamp code (`kits/tungang/PLAN.md` 1.2, *proposed*, the owner's question 6): **the coloured lamps mark the ways and
doors, they do not light rooms**; rooms take the warm-white key (Dhelv's lesson: coloured light as the main light turns
every surface to mud). So the coloured kinds are weak and short; `wax` and `lantern` are the key.

| Kind | Colour | Range | Intensity | Flicker | Role |
|---|---|---|---|---|---|
| `lamp-red` | `#ff4a2a` | 4 | .35 | .02 | a home: hung at its door, not in it |
| `lamp-green` | `#48e078` | 6 | .45 | .015 | the Line: walkway posts every 50 m of a kept track, the platforms, the way |
| `lamp-amber` | `#ffb438` | 8 | .7 | .03 | work: the sheds, the cooling plant, the dark beds |
| `lamp-white` | `#f2f4ff` | 16 | 1.8 | .005 | the surface, the Gaffers, danger: "stop"; hooded (a spot down, 0.7 rad) |
| `glowcap` | `#4ad8c0` | 4 | .3 | 0 | blue-green glow-cap: the common light of passages and the poor |
| `fungus` | `#6fe0c0` | 6 | .4 | 0 | Dhelv's glow fungus at the foot of a tunnel wall (an accent) |
| `wax` | `#ffd8a6` | 11 | 1.4 | .07 | hearth wax: the rooms' warm-white key |
| `lantern` | `#ffa860` | 9 | 1.3 | .1 | an oil lamp, a brazier, a hearth: the engine's halos |
| `strip` | `#3ef0ff` | 7 | .9 | .004 | the Ancients' still-lit strips (the hot section only); a segment to `to` |
| `work` | `#fff4e0` | 18 | 2.2 | 0 | a floodlight on a work face, a train's headlamp at rest |

A kit may add its own row (`KCAVELIGHT.kind(name, row)`) or override any field on a record.

## Openings

```
{id, kind, c: [x, z], r, top, floor, dir, ramp, open}
  kind   'well' (a vertical opening: Dhelv's wells, a shaft's foot) | 'portal' (a tunnel mouth: daylight in along dir) |
         'cutting' (a stretch fallen open to the sky)
  c, r   its centre and radius (a portal: its half-width)     top, floor   the sky side's y and the floor's y under it
  dir    a portal's: [x, z], pointing into the tunnel          ramp   m: how far in the exposure ramps to the cave's (300 at the Line's portal; 120 else)
  open   0..1: how much of the sky it lets in at its foot: a portal or a cutting 1, a well (r / 12)^2 (a 3.5 m shaft about .09,
         a 24 m well whole). A narrow shaft lights its floor with its own spots and leaves the eye dark-adapted round it
```

## The functions (`10-core-cavelight.js`)

- `KCAVELIGHT.make(r)`: a checked, filled record (throws on an unknown kind, no id, a non-finite position, a range of 0 or
  less, a negative intensity, a flicker outside 0..1, a strip with no `to`).
- `KCAVELIGHT.add(r)` / `addAll(rs)` / `remove(id)` / `clear()` / `all()` / `get(id)`: the page's store (ids unique: a second
  add of an id throws). `KCAVELIGHT.opening(o)` / `openings()`: the same for openings.
- `KCAVELIGHT.flicker(rec, t)`: the intensity factor now (1 at flicker 0; within 1 +- flicker), phase from `KRAND.hash` of the seed.
- `KCAVELIGHT.near(x, y, z, n, list)`: the n lit records nearest the point (`on !== false`), by distance to the light (a
  strip: to its segment), ties by id. The pool reads it.
- `KCAVELIGHT.line(o)`: lamps along a polyline: `{id, world, pts: [[x, y, z]...], every (50), start (every/2), kind, side (offset
  m to the right of the way), up (m over the line), fail (0..1: the share dead, each lamp's own KRAND.hash(world, n, salt)),
  owner}` -> records. A window cut from the same line gets the same lamps (by chainage, not by draws).
- `KCAVELIGHT.under(o)`: `{y, ground, inVoid, margin (2)}` -> true below the ground by `margin`, or inside a void.
- `KCAVELIGHT.exposure(o)`: the clamped ramp. `{d (m to the opening, Infinity with none), ramp (300), open (1), day (0..1),
  under, surface (1), cave (1.55), max (1.8), floor (.14), night (1.35), sunIn (min(15, ramp x .05) m)}` -> `{exposure, ambient,
  sky, sun, s}`. Above the ground, the surface's. Under: the eye's adaptation `s` runs 0 at the opening to 1 at `ramp`
  (smoothstep; an opening that lets in little sky leaves it near 1); the exposure goes from the surface's to the cave's,
  **clamped to `max`** (no grey daylight in the dark); the ambient falls from the daylight to its **floor** over 70% of the
  ramp, no faster than the eye adapts (nothing pure black, and no dark dip on the way in); the sky's reflections are gone
  by a third of the ramp; the **sun is out within `sunIn` m** (with no shadows it would light through the rock): past the
  mouth daylight comes in only as the openings' own spots.
- `KCAVELIGHT.exposureAt(x, y, z, o, list)`: the same from every opening at a point; the one that leaves the eye least
  dark-adapted wins (a wide portal 50 m off beats a narrow shaft 5 m off). Adds `{opening, d}`. The host calls this.
- `KCAVELIGHT.fog(E, o)`: the fog with the exposure (the Line's portal): `o` `{surface, cave: '#rrggbb', density: [surface, cave]`
  (a `FogExp2`) `| near, far: [surface, cave]` (a `Fog`)`}` -> `{colour, density, near, far}` along `E.s`. The host's `o.fog` applies it to
  `scene.fog` each frame.
- `KCAVELIGHT.nearestOpening(x, y, z, list)`: `{o, d}` (a portal's d is along its dir from the mouth; a well's from its foot).
- `KCAVELIGHT.daylight(O, sun, day)`: the light at one opening now, as numbers: `{on, beam: {from, to, len}, spot: {pos,
  target, angle, intensity} | null, sky: {pos, target, angle, intensity, distance?}, bounce: {pos, distance, intensity},
  shaft: {mid, len, r, dir, opacity} | null}`. `sun` the unit vector toward the sun; `day` 0..1. A well or a cutting: Dhelv's
  numbers (the sun's spot through it onto the floor, the sky's spot straight down, the warm bounce, the shaft of lit air).
  A portal: no shaft; the sun's spot only as far in as the mouth's height lets a low sun reach (at most 8 widths), the sky
  a broad soft spot from just inside the mouth down the tunnel.
- `KCAVELIGHT.export(o)`: `{format: 'krator-cavelight', version: 1, convention, kinds, lights, openings, pool, exposure}`.

## The host (`90-core-cavelight-host.js`)

```js
const CL = KCAVELIGHT.host({THREE, scene, renderer, camera,
  sun,                      // the page's key DirectionalLight (switched off under; null on a page without one)
  hemi,                     // its HemisphereLight: under, its intensity drops to the exposure's ambient floor
  ground: (x, z) => terrainH(x, z),   // the surface's height (Infinity on a page that is all underground)
  inVoid: (x, y, z) => C.sdf(x, y, z) > 0,   // optional: inside a cavern void counts as under
  sunDir: () => LIGHTDIR,   // optional: toward the sun, for the openings' beams
  day: () => 0..1,          // optional: how much daylight there is (1 by default)
  pool: 14,                 // real point lights moved to the records nearest the eye
  halos: true,              // every lit record a glow sprite (one Points draw)
  exposure: {surface, cave, max, floor, ramp},     // overrides of KCAVELIGHT.exposure's ({floor: 1} keeps the page's own key)
  fog: {surface: '#a0c0e0', cave: '#201810', density: [.001, .012]}});   // optional: scene.fog follows the exposure
// each frame, after the camera moved:
CL.update(t);              // t in seconds (the page's clock)
CL.rebuild();              // after adding or removing records: the halos again
CL.state                   // {under, exposure, ambient, pool: n lit, halos, openings lit}
```

- **Under**: `sun.visible = false`, `scene.environment` set aside (no sky in the reflections) and given back on surfacing,
  `hemi.intensity` the exposure's `ambient` (its floor deep in), `renderer.toneMappingExposure` the ramp's.
- **The pool**: N `PointLight`s (decay 1.6) moved to `near()` each frame (under, or at night above: `o.night()`), coloured and
  sized from the record, times `flicker`. A hooded record takes one of `o.spots` (4) `SpotLight`s instead.
- **Halos**: one `Points` draw of every lit record, additive, `toneMapped = false`, `probeSkip`, no raycast; brighter under.
- **Openings**: per opening within 220 m: Dhelv's sun spot (shadowed), the sky's own spot straight down, the warm bounce, the
  shaft of lit air (an additive cylinder) and 320 motes drifting down it (positions from `KRAND`, not `Math.random`).
- Owns nothing else: the page keeps its renderer, fog and camera.

## The demo (`demo/`)

An 800 m bore of the Line's section (37 m wide, 14.6 m to the crown; stand-in geometry, not the Line's look) under a 30 m hill:
its portal onto daylight (the 300 m ramp), a 3.5 m light shaft at 500 m, the lamp code on both walkways (green every 50 m,
12% dead by hash; amber at a shed; the white stop lamp hooded at the far door), a wax-lit refuge with a smoky-quartz cleft
shrine behind it (`KCAVERN` + `KSPELEO.SMOKY`), the hot stretch's cyan strips, glow fungus, and the tunnels' hazards on
core/tags (a rockburst over the hot stretch with its spalls drawn from `KHAZ.spalls`, an inrush's water at the low point
from `KHAZ.flood`, a seal on the shrine's cleft); the HUD says the light's state and what hurts at the eye. Eight views
(keys 1-8), WASD and drag, N for night. **GPU-verified** (2026-11-11, RTX 5060 lane): every check passes, the mean brightness
falls from 198 outside to 161 at the mouth, 62 at 150 m and 49 deep in (never black), the shaft's foot stays dark-adapted.

## Godot (in `PORT.md` terms)

| Fragment | Tag | In Godot |
|---|---|---|
| `10-core-cavelight.js` | `[G data]` | `kcavelight.gd` (later): the same functions; or read the export |
| `90-core-cavelight-host.js` | `[web]` | nothing to port: Godot's own lights do the pool's job |

The export is the contract: **one `OmniLight3D` per lit record** (`omni_range` = range, `light_energy` = intensity,
`light_color` = colour, `omni_attenuation` 1.6, `distance_fade_enabled` true, `distance_fade_begin` 40, `distance_fade_length`
20: Forward+ clusters them, and the fade does what the web pool does by count). A hooded record is a `SpotLight3D` along
`hood.dir` with `spot_angle` = hood.angle in degrees. A strip is an emissive mesh along its segment plus an `OmniLight3D` every
`range` metres along it. Flicker is a script on the light (`light_energy = intensity * flicker(t)`, the same function). The
under switch is a `WorldEnvironment` swap (the sun's `DirectionalLight3D` hidden, `ambient_light_source` colour at the
floor, `tonemap_exposure` the ramp's), driven by `KCAVELIGHT.exposure` on the camera's position each frame. The openings'
light is a `SpotLight3D` (shadowed) and the sky's spot; the shaft and motes a `FogVolume` and `GPUParticles3D`.
