# core/atmos: one sky for every world (plan)

Status: **step S0 built** (2026-10-25): the model, presets, shader, host and the demo page (`core/atmos/sky/`,
`core/atmos/host/89-atmos-h-skyhost.js`, `core/atmos/demo/`, `node core/atmos/test-sky.js`); no biome has changed. The Godot
twin is the next piece of S0 (section 5). The plan was written (2026-10-25) Written with the owner in a side session of the all-builds biome rebuild
(`HANDOFF-REBUILD.md`, stage 1), which left the sky domes out because no `core/atmos` sky existed. This file is the
plan for that sky; its decisions are in section 2 (the second round in 2.1) and the questions still open are in
section 12.

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

### 2.1 The second round (the owner, 2026-10-25)

| Question | Decision |
|---|---|
| The giant's position | **worked out per site** from the site's latitude and sub-giant longitude; no canon constant |
| Latitudes | **from the Krator scale model**. The model stores no latitude today (a 2 km/px frame and rough labels), so the plan adds a frame to it (3.1, "The site frame") |
| The nebula | **procedural first**; the owner judges it on the demo page and asks for a texture only if it is needed |
| Where the cluster lies | **plausible for a star on the edge of the nebula**, and more or less visible by the time of year (3.4) |
| Stars by day | **on the highest peaks**, more so toward the airless Outer Wall (3.4) |
| The page's first hour | **every page opens at sunrise, 06:00** |
| Game start | **the spring equinox**, which puts sunrise at 06:00 on every page (at an equinox the sun rises at six everywhere) |
| The calendar | **Earth's months, with Jimjam-style names**, until a formal Krator calendar exists (3.1, "The calendar") |
| Review | **a demo page first** (step S0): no biome changes until the owner has seen it |

### 2.2 The third round, while S0 was built (the owner, 2026-10-25)

| Question | Decision |
|---|---|
| Eclipses | **a few weeks a year, not two seasons.** A giant 30 degrees across on Krator's celestial equator (where a tidally locked moon's giant hangs) hides the sun ~2 h a day for ~2.5 months round each equinox (165 days at Voth); no tilt or nod fixes that, because the eclipse depends only on the sun, the giant and Krator in space. So the giant is **lifted** to declination **-37.6**: the sun grazes it only round the southern summer solstice, ~27 days a year, 12 of them total. A deliberate cheat, written as one number (`SKY.giant.decDeg`) |
| Where it stands | **low, for level shots**: the point under it is 87 degrees east of Voth, off the mapped crater, so Voth sees it **ESE, 25 degrees up**; across the map 17 (west) to 39 (east). It is no longer NE, nor "over Korona" (LORE section 2 updated; Korona's "under the giant" in section 3 is now loose) |
| The rings | **edge-on as much as possible**: the giant's spin axis lies in the plane of the sky, tilted 23 degrees from its up (the domes' canon), the ring opened 1.6 degrees, so every site sees a near-level hairline. A daily nod was allowed but buys nothing for the eclipses, so the giant stays fixed |
| Game start | the day after a Double Dark (both moons thin crescents at the first dusk) |
| The months | Jimjam-ized versions of the western calendar (3.1's list) |
| The site frame | Voth at 40 S, 84 km a degree: kept |
| The cluster | owns the winter nights (RA 18 h, dec -30): kept |

### 2.3 The giant, its ring and its moons, after the first look at the demo (the owner, 2026-10-25)

| Question | Decision |
|---|---|
| The giant's face | a quality pass after the owner's ice-giant references: blue zones and belts with wavering edges, sheared by differential rotation; white cloud torn along the belts and curled by two levels of domain warp; vortices that swirl the clouds round them instead of painted ovals; a faint blue-green cast in a few bands, **sky-plankton**; a blue high-haze limb; a soft ring shadow |
| The ring | a quality pass on Saturn's plan: a faint grey inner ring, a dense bright middle ring, a near-empty gap, an outer ring with a narrow gap, a thin outer ringlet, fine ringlets (filtered so they never shimmer); optical depth over the view angle, so near edge-on it is a crisp line; the sunlit face bright, the unlit face glowing only through its thin parts; opened so Krator looks down on the face the sun lights by day; its shadow on the giant from the same structure |
| More moons | **Day**'s vents (lava flows, glow, ash, limb plumes) change with world time. The Laplace chain is filled out: **Two-Day** (Mimas-like) and **Four-Day** (a vitriolic world, cooler than the classic kind). **The Thirteen** becomes a carbon world with tar seas over a quarter of it. The **Week** is Iapetus-like |
| The moons | they orbit in the giant's equator, so from Krator they **ride along the ring line**. **The Week** is two-faced (Iapetus-like, changed from Callisto-like for visibility: its trailing hemisphere bright, its leading one coal-dark, an equatorial ridge), **the Thirteen** clouded (Venus-like), their periods unchanged (6.87 and 12.55 days: the Count of 91 holds). **The Companion** (a working name) is Ceres-like: a Trojan 60 degrees ahead on Krator's own orbit, fixed beside the giant, ~0.3 degrees across, through its phases once a day. Seen from Voth the moons never climb above ~33 degrees: the ring line is low |
| An Io | a Trojan cannot be Io-like (no tidal flexing). A plausible Io orbits **inside Krator in a 2:1 resonance**: 12 h, ~122,000 km, just outside the rings; Krator keeps its orbit eccentric, as Europa does Io's, and the same resonance flexes Krator a little (the Throne). From Krator it would swing ~39 degrees either side of the giant once a day, transiting the disc (~3 degrees across) and hiding behind it. Built as **Day** (the owner's name): it transits the disc once a day, drawn over the giant while it is nearer; its crossing hour drifts ~4 minutes a day against the sun |

(Superseded by 2.3: the moons ride the ring line, so a moon's shadow can cross the giant's face again; the shader does not
draw moon shadows on the giant yet.)

Question 2 of the first round (pages whose fixed sun no hour reaches) follows from the first row: there is no pinned
sun. Each page's light is the model's at its site, and the old light is reproduced only for the before-and-after
comparison (section 8).

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
  altitude and azimuth are derived, never typed (the owner: per site). There is no override.
- **The site frame.** Both come from the scale model's pixel (2 km/px, `x` east, `y` south: `extract_region.py`'s
  `frame`), which today has no latitude. The model gets two constants and two functions, `latOf(px, py)` and
  `subGiantLonOf(px, py)`:
  - the anchor: the reference site, **Voth, at 40 S** (LORE section 2), about px 446,690 (275 km south of Almua's
    px 446,553);
  - the scale: **84 km per degree**, a radius of about 4,800 km: Krator's 7.4 m/s2 at an Earth-like density. Checked
    against the model's own rough labels: it puts the Rift (px y 1087 to 1345) at 49.5 to 55.6 S, against the labelled
    48 to 57 S;
  - the sub-giant meridian: Voth's 21-sky.js puts it 57 degrees east of Voth (giant at altitude 24.7, azimuth 67.3), so
    `subGiantLon = 57 - (px - 446) * 2 / (84 cos lat)`.
  Over the crater's span (about 1,200 by 1,300 px) the giant then moves by some degrees between biomes, rising toward
  the east and the north; the S0 demo shows it at a few sites so the owner can judge the spread.
- **The calendar.** A 365-day year counted from day 0; the southern summer solstice on **day 350** (LORE), so the
  southern spring equinox is day 258.75 and the autumn one day 76.25. Until a formal Krator calendar exists the days are
  dated in **Earth's months**, named in the style of Jimjam's weekdays (the Ancients' words as Jimjam says them;
  *proposed*, the owner to confirm or rename): *Janavari, Pepravari, Mārccu, Ēpral, Mē, Jūn, Julai, Ākasṭu,
  Ceppaṭampar, Akṭōpar, Navampar, Ṭicampar*, with Earth's month lengths, so the solstice is 17 Ṭicampar and the
  equinox **17 Ceppaṭampar**. Jimjam's own counts (the Week, the Thirteen, the Count of 91, the Day Outside) run beside
  it from the moons; the sky shows the date in both.
- **Game start** is the southern spring equinox: **day 259 (17 Ceppaṭampar), 06:00**, sunrise. It is also eclipse season
  (LORE: eclipses come round each equinox), so the demo can show one within a few days of the start.
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
| `defaultHour`, `defaultDay` | the hour and day the page opens on: **06:00 on game start day** for every page (the owner), so these keys exist only for a showcase view or a test. The acceptance frames are views with their own `#hour=` (section 8) |

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

**Where the cluster lies** (the owner: plausible for a star on the edge of the nebula). Krator's sun sits on the
cluster's edge, so the sky is lopsided rather than evenly starry:

- **The near half.** The cluster's core lies in one direction: its brightest members (a dozen hot blue-white stars,
  some brighter than Venus from Earth) within about 25 degrees of the centre, the cluster's fainter members thinning out
  to about 60 degrees. The dust is thickest there: wisps and filaments lit blue by those stars, with dark lanes where
  it is thick enough to hide what is behind it, fading to nothing about 100 degrees from the centre.
- **The far half** looks out of the cluster: an ordinary dark sky, fewer and fainter stars, and the faint band of the
  galaxy, so the contrast between the two halves is itself the show.
- **The direction** is fixed among the stars (as Earth's sky is): the centre at declination **-30** and right ascension
  **18 h**, so seen from 40 S it crosses the meridian 80 degrees up, near the zenith, and is not circumpolar.
- **By the season** (the owner: more or less visible by the time of year): the night sky is the half away from the sun,
  which moves round the stars once a year. In **southern winter** (Jūn, Julai) the cluster is up all night and
  overhead at midnight: the long nights are its season. At the spring equinox (game start) it stands high in the evening
  sky at dusk and sets after midnight; at the autumn equinox it rises after midnight and is high at dawn. In **southern summer** (Ṭicampar, Janavari) it is up by day, near the sun, and gone
  from the night: those are the plain, dark-skied nights. Nothing is scripted for this: the stars turn at the sidereal
  rate (one turn more per year than the sun), and the season follows.

**Stars by day** (the owner: on the highest peaks, more so toward the airless rim). The air's own brightness hides
stars; in thin air it is dimmer. A day-visibility gain from the preset's `air.pressure` lets the brightest cluster
stars and the nebula's core show by day **only where the air is thin**: from about 0.6 atm (the high Walls, the
glacier) faintly, more as it thins, and plainly on the airless Outer Wall's crests, where the sky is dark blue to black
overhead. On the crater floor and the lowlands (1.3 to 2.0 atm) the day sky shows none. Godot reads the same gain.

**The nebula is procedural first** (the owner): domain-warped noise on the celestial sphere, a few octaves on an
integer lattice (bit-exact across engines), shaped by distance from the cluster's centre, lit blue by the bright
stars' directions, with the dark lanes as a second, sharper field. If the owner wants more after seeing it on the demo
page, an authored texture replaces the large forms and the procedural layer keeps the fine wisps (its prompt would go
in `core/materials/PROMPTS-NEEDED.md`).

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
ATMOS.sky(ATMOS.skyPreset('standard', {site:ATMOS.siteAt(px, py), air:{pressure:1.9, humidity:.8},   /* the scale model's pixel */
  clouds:{cover:.45, type:{cumulus:.7, veil:.3}}, ridges:[/* the far canopy */]}),   /* opens 06:00, day 259 */
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
   stands WSW at 42 degrees, which 40 S never reaches). The fit runs again at each page's own latitude from the site
   frame. There is no pinned sun (2.1): a page the model cannot match changes its light, and its side-by-side says
   so in its `KNOWN_ISSUES.md`.
3. **After**, the same frames at the fitted hour (the page itself opens at 06:00, day 259). Side by side per page (reference left), with the sky ablation flag
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
| S0 | the model, the presets, the shader and its Godot twin, the tests; a demo page in `core/atmos/demo/` showing the standard preset at any hour and day, with the ring and ridge checks. Its controls: hour, date (in the Jimjam-named months and Jimjam's counts), a site picker (Voth, the hyperjungle, the Throne, the glacier, an Outer Wall crest) so the giant's spread and stars by day can be judged, air pressure, cloud cover, weather; presets for game start at 06:00, a winter midnight under the cluster, a summer night without it, and an eclipse near the equinox | nothing changes on any page; the owner judges the sky itself, the procedural Pleiades night and the giant's phases here, and decides on the nebula texture |
| S1 | swbay (the template biome; nwbay shares its file) | the simplest dome, a reachable sun |
| S2 | nhighlands | the hardest: the three light modes, the far-country mesh in front, its fog curve; proves the `setLightMode` shim |
| S3 | the remaining biome kits, in groups by sky family: the painted Walls (sedesert, nsemiarid, ebadlands, eastabyss, crater-drylands), the humid ones (hyperjungle and its readers, swlowlands, nwlowlands, rift, xanadu, oidong and Longsong), the ones with light modes (geyser, ringisles), shighlands (the cloud sea), ehighlands | the readers rebuild with their source |
| S4 | Throne station 1, then the ten stations | the most landmarks (the mountain, the plume), the unreachable sun, station 1's budget |
| S5 | the open world (`openworld/isle-demo`) and the PLACED settlements | they take the same preset at their sites |
| later | the 21-sky.js lineage (Voth, Girder, Mav's Refuge, Locus, Yuni ...) onto the same module | Voth's sky is the model's source; its city work owns other files; out of this plan's scope |

The biome rebuild session owns the biome sources and their pages now: S1 onward starts after its stage 1 lands (or is
taken into it by agreement), and each step rides one all-builds rebuild where it can (`TODO.md`, "Ride along").

## 10. Budgets

- **Shader compile time** (measured on the owner's Windows machine, Chrome on ANGLE/Direct3D, 2026-10-25): with the noise
  inlined (eight hashes a call) the sky shader took 16.8 s to compile; reading the noise from a 64^3 volume
  (`ATMOS.skyNoiseVolume`, baked in ~90 ms) brought it to 2.2 s. Keep every new layer on the volume, keep one call site per
  costly function (the moons: one moon a pixel), and measure the compile after each pass. Small angles are taken from the
  chord (`atmSkyAng`): Direct3D's cos is not precise near 1, and a moon under a degree across vanished.

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

### 11.1 Cloud shadows and rain darkening on the ground (asked by the biome rebuild, 2026-10-25)

`TODO.md`, "Rendering ideas": cloud shade in the lighting of every ground and plant material, driven by **the same cloud field
as the sky**, and the ground darkening when wet, through one shared chunk. The biome rebuild left it for the sky because its
clouds must be the sky's clouds. How the field reaches the ground:

1. **One cloud field, anchored to the world.** Today `atmSkyClouds` (S0) puts the cumulus layer on a plane `uCloudH.x` metres
   above the *viewer* and samples it at `d.xz/d.y*H`, so the clouds travel with the camera. It becomes a function of world
   position, `float atmCloudCover(vec2 xz)` (cover 0..1 at world `xz` on the cloud plane, drifting on `uWind*uTime`), and the
   sky samples it at `uCamPos.xz + d.xz/d.y*(H - uCamPos.y)` (`uCamPos`: the page camera's world position, a new uniform; the
   sky scene's own camera stays at the origin). Its fbm reads the noise volume, as everything in the sky does.
2. **The shade.** A ground point `P` is in a cloud's shadow when the ray toward the light crosses the cloud plane inside a
   cloud: `Q = P.xz + L.xz/L.y*(H - P.y)`, `shade = 1 - k*atmCloudCover(Q)` (`k` from the preset: thick cumulus 0.75, thin 0.4;
   0 when `L.y <= 0`). The shadow takes **only the field's first three octaves**: a cloud 1.6 km up casts a penumbra ~15 m wide
   (the sun is 0.53 degrees), so the fine detail would not reach the ground anyway, and it costs a third. The same function
   shades **giantshine** at night, with the giant's direction as `L`.
3. **The chunk** `#include <atmos_cloudshade>` (`core/atmos/sky/`, [G shader], registered at `ATMOS.init` like `atmos_waves`)
   declares the shared uniforms (`uCloud`, `uCloudH`, `uWind`, `uTime`, `uNoise`, `uSunDir`, `uGiantDir`, `uWet`, `uCamPos`)
   and `atmCloudShade(vec3 worldPos, vec3 L)`. `ATMOS.cloudShade(material)` hooks a material by `onBeforeCompile`: a world
   position varying, then
   - **standard materials** (the library families): in `lights_fragment_begin`, after the first directional light's
     irradiance, `directLight.color *= atmCloudShade(vWorldPosition, directLight.direction)` (light 0 is the sun; the
     giantshine light, when it exists, is light 1 and gets its own call);
   - **Lambert** (most flora today): r128 lights Lambert per vertex, so the shade multiplies the directional term in
     `lights_lambert_vertex` with the vertex's world position. Coarse on big triangles, right on grass and leaves.
   - Uniform objects are **shared**, not copied: every hooked material points at the sky's uniforms (`ATMOS.U` gains them),
     so one update a frame moves every shadow.
   The biome core's material makers (`BIO`'s ground and foliage materials) call `ATMOS.cloudShade` once each; a page with no
   shared sky yet gets `cover 0` and a shade of 1, so nothing changes until it migrates.
4. **Rain darkening**, in the same chunk: `uWet` (0..1) is `ATMOS.weather`'s `W.wet` (it already eases up in rain and dries
   slowly). Ground and rock darken (`diffuseColor.rgb *= 1.0 - 0.38*uWet*porosity`), standard materials lose roughness
   (`roughness *= 1.0 - 0.55*uWet`) so wet stone catches the sky in `ATMOS.skylight`, and leaves darken a little
   (`0.15*uWet`). `porosity` is a per-material constant passed to `cloudShade` (soil 1, rock 0.6, leaves 0.4, metal 0).
   Puddles are core/water's, not this.
5. **Agreement.** `test-sky.js` gains: a ground point straight under a cloud is shaded and one under a gap is not, at sample
   positions, from the JS twin `ATMOS.cloudCoverAt(x, z, t)` against the GLSL; and the sky and the ground agree (the sky's
   cover at the zenith over a point equals that point's shade at noon with the sun overhead).
6. **Godot.** `atmos_cloudshade.gdshaderinc` over the `atm_*` global shader parameters (`atm_cloud`, `atm_cloud_h`,
   `atm_wind`, `atm_time`, `atm_wet`, `atm_cam_pos`, the noise as a global `sampler3D`). Each ground and plant shader includes
   it and in `light()` does `ATTENUATION *= atm_cloud_shade(world_pos, LIGHT)` when `LIGHT_IS_DIRECTIONAL` (so the sun and
   the giantshine light are each shaded along their own direction), and the wet terms in `fragment()`.
7. **Order.** It lands with the sky's first biome (S1): the world-anchored field is a change to the sky shader, and the hooks
   need the biome core's material makers, which the biome rebuild owns; the two sessions coordinate that step. Cost: one
   three-octave fbm per ground fragment (per vertex on Lambert), a texture read each.

## 12. Open decisions for the owner

Settled: everything in sections 2, 2.1 and 2.2. Open:

1. **The nebula**: procedural now; the owner judges it on the demo page and asks for a texture only if it falls short.
2. **The Republic's orrery** (`settlements/highlands/NOTES.md`) shows two moons; with the Companion and Day there are four.
3. **Korona "under the giant"** (LORE section 3): the giant now hangs over a point far east of the crater; Korona sees
   it 26 degrees up in the south-east. Reword Korona, or move the point under the giant (it sets the height at Voth).
