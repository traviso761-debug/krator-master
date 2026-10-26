# core/atmos: one sky for every world (plan)

Status: **plan, no code yet** (2026-10-25). Written with the owner in a side session of the all-builds biome rebuild
(`HANDOFF-REBUILD.md`, stage 1), which left the sky domes out because no `core/atmos` sky existed. This file is the
plan for that sky; its decisions are in section 2 and the questions still open are in section 12.

It retires the `OWN sky-dome` findings of `python3 tools/check_core_use.py --list` (29 today, section 9), closes
`AUDITS.md` section B gap 4 ("Painted-dome skies have no `core/atmos` sky preset and no shared hour clock"), and does
`GODOT-PLAN.md`'s line for `21-sky.js` ("moves to `core/atmos/` as a sky preset") for the biome pages first.

**Godot first.** The sky is designed as a Godot sky that the three.js pages preview, not the other way round: its
state is plain data, its drawing is one shader with a GLSL twin and a `.gdshader` twin held to agree by a test, as the
wave field and the cloud deck already are (`GODOT.md`).

## 1. What the painted domes do today

Every biome kit and Throne station has its own `src/82-host-sky.js` (10-35 KB each, 29 files, all different by hash
except swbay and nwbay, which are identical). They share a lineage (the Hexahedron's sky, through Girder's giant) and
one shape:

| Layer | How it is drawn today | Where they differ |
|---|---|---|
| The air (zenith to horizon) | a 4096 x 2048 canvas gradient, `canvasTex`, on a `SphereGeometry(9000, 72, 44)` `BackSide` dome, `renderOrder -10`, no depth write | the stops: milky 1.9 atm (swbay), true blue 1 atm (shighlands), deep thin-air blue (glacier), ochre dust (nsemiarid, sedesert), plume-greyed east (Throne) |
| The sun | a radial glow and disc **painted into the canvas** at the azimuth of that page's fixed `sun.position` | the position (each page types its own); nothing moves |
| Clouds | painted ellipses: cumulus heaps, cirrus streaks, humid or dust veils, from the page's own PRNG | count, type and colour per page |
| Two moons | painted discs at fixed u, v | position only; no phases (LORE: the Week and the Thirteen have periods of 6.87 and 12.55 days) |
| Far land | painted into the same canvas: canopy lines (swbay), the Inner or Outer Wall with snow (sedesert, nsemiarid, nhighlands), the Throne and its plume (shighlands, every station), the cloud sea (shighlands, glacier) | the whole of each page's sense of place; drawn with the page's own `fbm` and painters |
| The gas giant | real geometry: a `SphereGeometry(GIANT_R, 96, 64)` with a banded shader at 6 km (`renderOrder -9`), a `RingGeometry` (`-9` or `-8`); `99-host-take.js` `sky.follow` moves dome, giant and ring with the camera | fixed `uSunDir` (the phase never changes); altitude 25 except nhighlands (30, raised to clear its range) |
| Light modes | `setLightMode('day'|'dawn'|'night')` in nhighlands, geyser, ringisles and all eleven Throne pages: a table of sun, hemisphere, fill, fog, exposure and dome uniforms, plus `LIGHT_HOOKS` | three fixed states, not an hour; the other pages have one fixed midday |
| Stars | nhighlands only: a `fract(sin())` hash in its dome shader | |

nhighlands is the most advanced: a data-texture dome whose alpha masks land and cloud so one bake is regraded for dawn
and night, the sun and stars drawn analytically, a real 35 km far-country mesh, a fog curve, and the ring's far half
hidden behind the planet. It also reads canvas pixels (`getImageData` x3, its own findings).

The newest kits (korona, necanyons, guilin) and four settlements (Pinnacle Rock, Longsong, Shade, and the isle demo's
open world, `openworld/isle-demo/src/world/80-world-sky.js`) **read another kit's sky in place** (hyperjungle's,
oidong's, sedesert's), so they change when that file does.

Voth's `settlements/voth/src/21-sky.js` (the 21-sky.js lineage, 11 copies across Voth, Girder, Mav's Refuge, Locus,
Yuni and others) is the other line, and the better model: a **real sun path** from latitude, tilt, day of year and hour;
the giant's position **derived** from latitude and the sub-giant longitude (tidally locked); its phase from the sun;
eclipses; stars wheeling round the south celestial pole; the whole sky in a background scene drawn before the world.
The shared sky lifts that model, not the domes'.

### The two bugs every dome can show (the owner, 2026-10-25)

1. **The far side of the ring draws over the planet.** The giant writes no depth and the ring is drawn after it, so the
   arc that should pass behind the disc paints across it. Only nhighlands fixes it (a ray-sphere test in the ring
   shader).
2. **The giant and its ring draw over the painted mountains.** The far land is painted into the dome (order -10) and
   the giant is drawn after it (-9), so wherever the disc or the ring dips low it lies on top of the Wall or the
   Throne. Celestial objects must be the farthest thing in every scene.

Both are draw-order bugs, and the shared sky removes them by construction (section 4): every layer is composited in one
fragment in a fixed back-to-front order, and the ring's far half is occluded analytically.

## 2. Decisions taken (the owner, 2026-10-25)

| Question | Decision |
|---|---|
| The Godot sky | a **custom `shader_type sky`** `.gdshader` holding every layer, fed by the preset; the three.js page runs a GLSL twin. Not `PhysicalSkyMaterial` (it cannot draw the giant, the nebula or the ridges, and two engines would never match), not baked panoramas (nothing would move) |
| The far hills | **ridge profiles as data**: per biome, layers of elevation by azimuth at a distance, coloured from that biome's own terrain palette and lit by the hour's sun; drawn as the sky's nearest layer. Later the open world's terrain bake writes the same profiles |
| Time of day | **a continuous hour** from `core/clock` (`KCLOCK`): hour and day of year, the sun path from latitude and tilt, colours, exposure and grade interpolated from per-hour keyframes. Pages hold a default hour; the viewer scrubs or runs it; day, dawn and night become hour presets |
| Clouds | **a procedural layer** in the sky shader, riding the `ATMOS` wind, lit by the sun and giantshine, with cover and type per preset. VISUAL-BAR bans "clouds as a texture dome" |
| The night sky | **Krator lies in the Pleiades** (the owner): a spectacular night of many bright blue-white stars and a reflection-dust nebula, a layer of its own (section 3.4) |

## 3. The sky as data

Three records, all plain JSON-able data, `[G data]`, no THREE and no DOM:

### 3.1 The sky model (`ATMOS.skyModel`, one for the whole world)

The ephemeris, lifted from `21-sky.js` (`skyDeclination`, `skySunDir`, `skyGiantPos`, its eclipse and phase terms) and
checked by the same sign table (`skyCheckSigns`) as a node test:

- **Constants** (LORE section 2): day 24 h (one orbit of the giant), tilt 23 degrees, year **365** days (21-sky.js's
  `YEAR=360` is retired here), southern summer solstice day 350; the giant 30 degrees across, bands spinning every
  10 h, ring inner and outer radii 1.30 and 2.12, opened a degree or two toward the viewer; the sun 0.53 degrees; the two
  moons' periods (6.87 and 12.55 days), sizes and orbits, so their phases and positions follow the day count and the
  Double Dark falls every 91 days when it should.
- **Per site:** `latitude` and `subGiantLon` (degrees east of the site to the sub-giant point). From them, the giant's
  altitude and azimuth are derived, never typed; `giantAzOverride`/`giantAltOverride` stay for a showcase page only
  (section 12, question 1).
- **Functions** of `(site, hour, dayOfYear, day)`: `sunDir`, `giantDir`, `giantPhase` (the sun's direction in the giant's
  frame), `moons` (direction, phase), `eclipse` (the sun's fraction hidden by the giant, softened over its disc),
  `starRot` (the celestial sphere's rotation about the south pole), `night` and `twilight` factors.

### 3.2 The sky preset (`PRESETS.sky`, one per biome or station)

What makes a place's sky its own. A biome's `src/82-host-sky.js` becomes this record and one call (section 5).

| Key | What |
|---|---|
| `site` | `{latitude, subGiantLon}`, from the scale model at the biome's pixel (`tools/scale-model`); a station on the Throne gives its own |
| `air` | `pressure` (atm: 0.8 plateau to 2.0 Ring Sea), `turbidity`, `dust` colour and amount, `humidity`: these drive the scattering (zenith colour, horizon whiteness, sun colour at low altitude, how much the giant's lower limb is hazed) instead of hand-typed gradients |
| `keys` | **the colour script**: keyframes by hour (say 0, 5, 6, 7, 12, 17, 18.5, 19.5, 21), each a small table: zenith, horizon and sun-side horizon colours (overrides of the scattering, for art direction), sun colour and intensity, hemisphere sky and ground, fill, fog colour and density, **exposure**, and the **grade** (split-tone shadow and highlight tints, saturation, contrast). Interpolated by hour with a smooth step; the twilight keys can be indexed by sun altitude instead of hour so they follow the season |
| `clouds` | `cover` (0..1), `type` mix (cumulus, cirrus, haze veils, a horizon bank), base height, drift scale on `ATMOS.windAt`, colour; weather raises cover and greys it |
| `ridges` | the far land (3.3) |
| `landmarks` | named far features that are not ridges: the Throne's plume (lean, width, glow at night when the summit glows), a cloud sea below the horizon (shighlands, glacier: a floor at an elevation band with billows, or `core/atmos`'s cloud deck when the page has real ground under it) |
| `night` | the night sky's gains: giantshine strength (scaled by the giant's phase), star and nebula visibility (scaled by `air`: thin air at the glacier shows the brightest stars by day, the Abyss shows few) |
| `defaultHour`, `defaultDay` | the hour and day the page opens on, chosen so its acceptance frames keep today's light where the model can reach it (section 8) |

`PRESETS.sky.standard` is "the standard Krator skybox" `README.md` names: the reference site's air and keys, no ridges.
Every preset is that plus overrides, so most biomes are a page of numbers.

### 3.3 The far land: ridge profiles

A ridge layer is `{dist, elev, colour, snow, forest, haze}`:

- `elev`: elevation in degrees by azimuth, 1024 samples (0.35 degrees each), or the parameters a shared generator turns
  into them (base, amplitude, roughness, peak spikes, azimuth windows: "the Outer Wall in the north, 14-22 degrees, ice
  on its crests"), the generator on `core/rand` and `core/terrain`'s noise, so no page keeps its own `fbm` painter.
- `dist` (metres) sets the aerial perspective: the haze between the viewer and the layer is the fog's own curve at that
  distance, so the ridge always melts into the colour the near terrain fades into (VISUAL-BAR pillar D: "agree with the
  local terrain in colour and light").
- `colour`: rock, forest and snow taken **from the biome's terrain palette** (the ground's own material colours, not
  new ones), lit by the hour's sun: each sample has a facing from the profile's slope and azimuth, so a range is lit on
  its sun side and blue in shadow (pillar B), in alpenglow at dawn, in giantshine at night.
- Layers are ordered far to near; the nearest drawn ridge stops at the page's own far terrain (nhighlands' far-country
  mesh stays as real geometry in front of the sky).
- **Later:** a horizon profile cast from the scale model's heightfield at the site (`tools/scale-model`) writes the same
  record, so the painted placeholder is replaced by the real horizon without a code change (`biomes/WORLD.md`).

Sent to the shader as a small texture (1024 x layers, elevation in one channel, colour index and snow line in the
others) plus a palette uniform array.

### 3.4 The night: the Pleiades

Krator lies inside the Pleiades, so its night is not Earth's:

- **Bright stars**, many of them hot and blue-white, a few dozen far brighter than any star in Earth's sky (cluster
  members a few light-years away): a hand-placed table of the brightest (direction, magnitude, colour), so the
  constellations are canon and the same in every engine and every page.
- **The field**: thousands of fainter stars from an integer hash on a cube-face grid (bit-exact in GLSL, GDShader and JS,
  as the cloud deck's lattice is; never `fract(sin())`), denser and bluer toward the cluster's core.
- **The dust nebula**: the cluster's reflection nebula, blue dust lit by its bright stars, filaments and wisps across a
  broad band of the sky, with dark lanes where the dust is thick. Drawn as a layer on the celestial sphere (wheeling
  with the stars), brightest round the bright stars that light it.
- It all wheels round the south celestial pole with the hour (`starRot`), fades with twilight, is hidden by the giant's
  disc (and by its night side, which is dark against it), dimmed by haze near the horizon, by cloud, and by giantshine
  on the side of the sky near a bright giant.

Whether the nebula is procedural or an authored texture is question 4 in section 12.

## 4. One shader: the layers and their order

One fragment, `#include <atmos_sky>` in three.js and `atmos_sky.gdshaderinc` in Godot, composites back to front:

1. **Deep sky**: the star field, the bright stars, the nebula (on the rotated celestial sphere).
2. **The sun**: disc, corona, glow (dimmed by `eclipse`).
3. **The moons**: discs with their phases.
4. **The giant**: an analytic sphere (a ray-sphere hit gives the normal; no mesh): bands, storms, spin, the terminator
   from the true sun direction, giantshine on its night side from Krator, the limb. It hides layers 1 to 3 behind it.
5. **The ring**: the ray-plane hit tested against the giant's sphere, so **the far half is hidden behind the disc** and
   the near half passes in front of it; it also casts its shadow band on the disc.
6. **The air**: in-scattering and extinction along the view ray (the `air` preset, regraded by the hour's keys), applied
   over everything above, so the giant's lower limb hazes as it does today, and a twilight glow on the sun side.
7. **Clouds**: the procedural layer, lit by the sun and giantshine, over the air.
8. **Landmarks**: the plume, a cloud sea.
9. **Ridges**, far to near, each hazed by its distance.
10. The foot: melts into the fog colour below the nearest ridge, as nhighlands' dome does.

Because the giant, the moons and the stars are layers 1 to 5 and the ridges are layer 9, **no celestial object can lie
over a mountain**, and because the ring tests the giant's sphere in the same fragment, **its far half cannot draw over
the planet**. Two acceptance checks hold this (section 8).

In three.js the shader runs on one low-poly sphere (about 1 k triangles: the direction is per pixel) that follows the
camera, `depthTest` and `depthWrite` off, drawn first, `frustumCulled` false, `probeSkip`; the dome, the giant mesh and
the ring mesh go (about 18 k triangles and two draw calls fewer per page). In Godot it is the `Sky`'s material:
`AT_CUBEMAP_PASS` drops the star field's fine detail and the clouds' high octaves for the radiance map, and
`Sky.process_mode` is incremental with a small radiance size, so the map follows the hour without a cost per frame.

## 5. The module: fragments and the host call

| File | Tag | What |
|---|---|---|
| `core/atmos/89-atmos-e-skymodel.js` | [G data] | 3.1: the ephemeris; `ATMOS.skyState(preset, hour, day)` returns everything one frame needs (directions, phases, eclipse, interpolated keys) as plain numbers |
| `core/atmos/89-atmos-0p-presets.js` (extended) or `89-atmos-f-skypresets.js` | [G data] | `PRESETS.sky.standard`; the ridge generator |
| `core/atmos/89-atmos-g-sky.js` | [G shader] | the `atmos_sky` GLSL chunk (section 4), registered as `#include <atmos_waves>` is, with `skyUniforms(u)`, and CPU twins of what checks read (`skyColorAt(dir)`) |
| `core/atmos/host/89-atmos-h-skyhost.js` | [web] | `ATMOS.sky(preset, {renderer, sun, hemi, fill})`: draws the sphere, follows the camera, and each frame (from `KCLOCK`) sets the sun, hemisphere, fill, fog, exposure and grade from `skyState`; calls `BIO.setSun`; feeds `ATMOS.skylight` (section 7); keeps `setLightMode(mode)` and `LIGHT_HOOKS` as a shim (`day`, `dawn`, `night` set hours from the preset) so the kits' glow and water hooks keep working; replaces `99-host-take.js`'s `sky.follow` |
| `godot/krator/shaders/lib/atmos_sky.gdshaderinc`, `godot/krator/sky.gd` | | the twin and the node that sets its uniforms from `Atmos.gd` and `WorldClock.gd` (`atm_hour`, a new `atm_day`), and the two `DirectionalLight3D`s (sun, giant) and the `Environment` (tonemap exposure, adjustments, a colour-correction LUT from the grade) from the same keys |
| `core/atmos/test-sky.js` (or a section of `test-atmos.js`) | | 21-sky.js's sign table, the moons' 91-day Double Dark, the GLSL agreeing with the JS at sample directions, the ring hidden behind the disc and never over a ridge at sample rays, a fingerprint of the standard preset's export |

`ATMOS.export()` gains `sky`: the preset, the site and the clock, so `godot/tools/export_spike.py` writes the real sky
instead of `KSTAGE`'s one-frame panorama PNG (that stays as the fallback for builds not yet on the shared sky).

A biome's host fragment becomes:

```js
ATMOS.sky(ATMOS.skyPreset('standard', {site:{latitude:-38.5, subGiantLon:61}, air:{pressure:1.9, humidity:.8},
  clouds:{cover:.45, type:{cumulus:.7, veil:.3}}, ridges:[/* the far canopy */], defaultHour:15.2, defaultDay:273}),
  {renderer, sun, hemi, fill});
```

## 6. One hour clock

`core/clock` (`KCLOCK`) is the world clock (`GODOT-PLAN.md` Phase 1, approved 2026-10-02); the biome pages have none.
The sky host makes one per page when the page has none (`KCLOCK.make({hour: preset.defaultHour, running: false})`),
steps it from the page's `TICKS`, and passes `hour: () => C.hour` to `ATMOS.bindHost` instead of today's fixed 13, so
weather, lamps, skylight and the sky all read one hour. The day of year rides `C.day` from `preset.defaultDay`.

The viewer gets an hour slider and a run toggle (in `core/host`, beside the Weather selector), and `#hour=` and `#day=`
in the URL for `verify.py --views` (the hour sweep). Godot's `WorldClock.gd` is the same object.

## 7. Reflections: `ATMOS.skylight` sees the real sky

`ATMOS.skylight({sky})` captures a scene holding only the sky. Today that is the page's dome; afterwards it is the
sky host's own sky scene (the one sphere), so every standard material reflects the hour's sky, the giant at its phase
and the clouds, recaptured every `PRESETS.skylight.stepH` hours and on `key()` changes (the eclipse, weather mode).
`ground()` comes from the preset's hemisphere ground colour at the hour. The capture renders the sky shader's cube
directions directly (no ridges below the horizon's foot are lost: the ridges are in the shader too).

`diffuse` stays 0 in the migration (only specular changes, so each page's tuned hemisphere balance is untouched); a
later per-build step may raise it to light the diffuse term from the sky, matching Godot's
`ambient_light_source = SKY`.

## 8. Proving the look did not regress

Every page that changes its sky changes its hash: all of them, by design. The proof is pictures and numbers:

1. **Before**, on the current build, per page: the two acceptance frames (`VISUAL-BAR.md` section 1) and the hour-sweep
   vista at today's light (day, plus dawn and night where the page has them), from `verify.py --views --out`.
2. **Sun fit.** A tool (`tools/sky_fit.py` or a node script) takes each page's `sun.position` and finds the nearest
   `(hour, day)` the model reaches at the page's site. Measured for three pages at 40 S: swbay's sun is reached within
   0.2 degrees (15:12, day 273), shighlands' exactly (14:45, day 76), **the Throne's is not: 23 degrees off** (its sun
   stands WSW at 42 degrees, which 40 S never reaches). Pages within a degree or two keep their light; the others are
   question 2 in section 12.
3. **After**, the same frames at the fitted hour. Side by side per page (reference left), with the sky ablation flag
   (`#sky=old` while both exist, VISUAL-BAR section 5) so before and after come from the same pose.
4. **Gates** (`tools/harness.py`, shared): the hour sweep (hours 6, 12, 17, 22: the sky's and the lit ground's mean
   colours differ between each pair, none grey), the shadow-colour gate at the golden hour, and two new ones:
   **ring behind the disc** (a frame centred on the giant: no ring pixel inside the disc's far-half silhouette) and
   **nothing over a ridge** (the giant's and the ring's pixels are a subset of the sky above the nearest ridge line,
   checked from `skyColorAt` and a debug view that writes layer ids).
5. **Numbers**: triangles and draw calls per page (each falls), frame time at the default view, texture memory (each
   page drops its 32 MB canvas dome).
6. The owner judges the side-by-sides per biome before the baseline is rewritten for that page.

## 9. What moves on each page, and the order

**Retired findings** (today's `--list`): the sky-dome rule in 18 biome kits (crater-drylands, eastabyss, ebadlands,
ehighlands, geyser, hyperjungle, nsemiarid, nwbay, nwlowlands, oidong, rift, ringisles, sedesert, shighlands, swbay,
swlowlands, xanadu, and station 1's `biomes/throne/src`), the ten Throne stations (ashdesert, caldera, cloudforest,
frontier, glacier, isle, kipuka, savanna, tube, vents) and the open world's `80-world-sky.js`; nhighlands' three
`getImageData` findings go with its dome. Then `--write-baseline`.

**Pages that change hash**: those 29 pages, plus the builds that read a sky in place: korona, necanyons, guilin
(hyperjungle's), Pinnacle Rock (hyperjungle's), Longsong (oidong's), the isle demo's open world (its own copy of
sedesert's). Shade **vendors** sedesert's sky and is not placed on the map, so it is left alone (`--vendor-check` will
show the drift; record it in its `KNOWN_ISSUES.md`).

**Tighten the rule** so a dome cannot come back under another name: `check_core_use.py` also flags `GIANT_R`, a
`RingGeometry` for the ring, and a sky `ShaderMaterial` on a `BackSide` sphere in a build's own fragments.

**Order** (each step a commit, each page judged before the next group):

| Step | What | Why first |
|---|---|---|
| S0 | the model, the presets, the shader and its Godot twin, the tests; a demo page in `core/atmos/demo/` showing the standard preset at any hour and day, with the ring and ridge checks | nothing changes on any page; the owner judges the sky itself, the Pleiades night and the giant's phases here |
| S1 | swbay (the template biome; nwbay shares its file) | the simplest dome, a reachable sun |
| S2 | nhighlands | the hardest: the three light modes, the far-country mesh in front, its fog curve; proves the `setLightMode` shim |
| S3 | the remaining biome kits, in groups by sky family: the painted Walls (sedesert, nsemiarid, ebadlands, eastabyss, crater-drylands), the humid ones (hyperjungle and its readers, swlowlands, nwlowlands, rift, xanadu, oidong and Longsong), the ones with light modes (geyser, ringisles), shighlands (the cloud sea), ehighlands | the readers rebuild with their source |
| S4 | Throne station 1, then the ten stations | the most landmarks (the mountain, the plume), the unreachable sun, station 1's budget |
| S5 | the open world (`openworld/isle-demo`) and the PLACED settlements | they take the same preset at their sites |
| later | the 21-sky.js lineage (Voth, Girder, Mav's Refuge, Locus, Yuni ...) onto the same module | Voth's sky is the model's source; its city work owns other files; out of this plan's scope |

The biome rebuild session owns the biome sources and their pages now: S1 onward starts after its stage 1 lands (or is
taken into it by agreement), and each step rides one all-builds rebuild where it can (`TODO.md`, "Ride along").

## 10. Budgets

- **Throne station 1** is at 19.79 M triangles of its 22 M ceiling and about 200 draw calls against 140. The sky saves
  about 18 k triangles and two draw calls there; it adds no geometry. Its cost is fragment time: one full-screen sky
  shader instead of a textured dome. Budget the shader: the clouds and the nebula at most a few octaves, the star field
  one lookup per cube cell, the ridges one texture fetch per layer, early-outs below the nearest ridge and inside the
  giant's disc.
- **Texture memory** falls on every page: a 4096 x 2048 canvas (32 MB on the GPU) becomes a ridge texture (1024 x 4)
  and, if chosen, one nebula texture (about 2048 x 1024, shared, in the material library).
- **Frame time**: measured before and after on the default view of each page (step 5 of section 8). If a page loses
  more than a millisecond on the reference GPU, the shader's quality settings come down for that page's preset, not the
  layers.
- **Godot**: the radiance map is incremental; the sky shader's cost is per pixel at screen resolution with `AT_HALF_RES_PASS`
  available for the clouds.

## 11. Weather, fog, and what else the sky drives

- `ATMOS.weather`'s `apply(W)` keeps changing the page's fog and ground; the sky reads `W` too: rain and fog raise cloud
  cover and grey the air, storms darken it and lightning flashes it, ash tints it (the Throne), snow whitens it.
- The fog colour is the sky's horizon colour in the view direction at the hour (from `skyColorAt` at elevation 0, the
  sun side warmer), so ground and sky never part at the horizon.
- Exposure and grade apply per hour through `renderer.toneMappingExposure` and a split-tone in the weather hook (the
  `VISUAL-BAR.md` section 6 rows for tone, exposure and per-hour grade, now as data in the preset).

## 12. Open decisions for the owner

1. **The giant's position: derived per site, or one canon placement?** Deriving it from each site's latitude and
   sub-giant longitude is what a tidally locked moon does (Voth's model): the giant stands higher nearer the sub-giant
   point and lower away from it, so it would move between biomes. LORE gives "~25 degrees, ~66 degrees" as canon, and
   nhighlands raised its own to 30. Proposal: derive, and check that every biome's giant stays NE between about 15 and
   40 degrees; a site where it would sink behind its ridges is a showcase override in its preset.
2. **Pages whose fixed sun no hour reaches** (the Throne's, 23 degrees off at 40 S; more after the fit tool runs). Take
   the nearest reachable light and re-shoot the acceptance frames, or allow a pinned sun on a showcase preset? Proposal:
   no pinned sun (Godot has one model); fix the Throne's site latitude first, which may close most of the gap.
3. **Each site's latitude** from the scale model (about 40 S overall, the Rift 48-57 S) or one reference 40 S for every
   biome until the scale model labels latitudes exactly. Proposal: the scale model where it has one, 40 S otherwise.
4. **The nebula: procedural or an authored texture?** Procedural (noise on the celestial sphere, a few octaves) needs no
   asset but tends to look like noise; a painted or generated equirectangular nebula (blue reflection dust, filaments,
   dark lanes, about 4096 x 2048) reads as a real sky and is one shared texture in `core/materials` (its prompt would go
   in `PROMPTS-NEEDED.md`). Proposal: the texture, with procedural fine wisps over it.
5. **Where the cluster lies in Krator's sky**: which part of the sky the nebula and the brightest stars fill (seen from
   40 S, the south celestial pole is fixed and the rest wheels round it), and whether any of the bright stars or
   lanes is already named in the lore or a culture's calendar (Jimjam's).
6. **Seen by day?** In thin air (the glacier, 6 km; the hyperalpine climate) the brightest stars and the nebula's core
   could show faintly by day. Proposal: yes, scaled by pressure, as a preset gain.
7. **The default hour and day per page** (for the acceptance frames and the pages' first look): the fitted hour from
   section 8, or a chosen showcase hour per biome (a colour script's best moment).
8. **The moons** follow their real periods from a day count, so a page opens with the moons at some phase: pick a
   canonical "game start" day (LORE has the solstice on day 350 and the Double Dark every 91 days) or a per-page day.
9. **Step S0's review**: the owner judges the standard sky, the Pleiades night and the giant's phases on the demo page
   before any biome changes. Agreed?
