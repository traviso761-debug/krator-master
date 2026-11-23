# biomes/compasshills: index

The Compass Hills (`PLAN.md`, `CROOK-RIA-DECISIONS.md` §2.3.1 & §2.5.4): a `46,216 km²` (`100%` dry land, `X = 977..1139, Y = 185..290`) warm-temperate `Cfa`/`Csa` (`1.45–1.29 atm`, `+767..+1,736 m`) ferruginous sandstone-and-ironstone cuesta upland permanently remagnetized (`lodestone = 220`, `1,129` lode nodes) by the Cataclysmic flux-quench of `Lodestone` (`1058, 224`). Pairs an `85%` Earthlike Mediterranean-continental pine, cork oak, *iron-pistache*, *whorl-olive*, and *saffron* woodland matrix with `15%` grounded ferromagnetic biota (`compassbush` vertical meridian-aligned leaves, `fluxlichen` isogauss contour bands, `ferrotuft` grain-beards, and lightning-vitrified `lodestonespire` crags) and zero-iron bronze/nephrite delver works across four verified stations. Verified: `build.py`, `tests/test-compasshills.js`, `verify.py --assert`. Read `BIOME-API.md`.

Docs: `BIOME-API.md`, `KNOWN_ISSUES.md`, `PLAN.md`, `PORT.md`

Built outputs (never open them; edit `src/` and rebuild): `dist/compasshills.html`, `dist/compasshills-tors.html`, `dist/compasshills-cuesta.html`, `dist/compasshills-gorge.html`

Build: `python3 tools/build.py biomes/compasshills [--station tors|cuesta|gorge]`. Fragments are concatenated in filename order.

From `core/terrain/` (shared; see `core/README.md`): `35-core-strata.js`, `38-core-relief.js`, `43-core-ground.js`, `44-core-farfield.js`, `45-core-horizon.js`

## src/

| Fragment | KB | Responsibility |
|---|---|---|
| `00-head.html` | 1 | Self-contained HTML shell & bronze-bezel `#compass-hud` styles |
| `40-biome-compass-phys.js` | 12 | `COMPASS_PHYS`, `CROPS_BIOME`, `FAUNA` (`[G data]`, `tests/test-compasshills.js`) |
| `41-biome-compass-sites.js` | 6 | `COMPASS_SITES` survey records for `foundry`, `tors`, `cuesta`, `gorge` (`[G data]`) |
| `45-host-stage.js` | 14 | Renderer, 4-station cuesta/quench-moat/tor/gorge heightfields (`KRELIEF`), `KSPACE`, `BIO.init` |
| `50-biome-compass-species.js` | 21 | `COMPASS.SPECIES` (`14` species), `COMPASS.HARVEST`, `100%` library materials (`COMPASS.M`), meridian-aligned `compassbush` vertical leaf-fin builder, fulgurite `lodestonespire` builder, `BIO.flareJoin` trees, octahedral impostors |
| `60-biome-compass-place.js` | 14 | Deterministic cell-seeded placement (`KRAND.hash`), `COMPASS_PHYS.leafAzimuthAt` yaw alignment, `KSPACE` non-overlap, `KTAGS` pre-draw registration, `85/15` matrix balance |
| `70-biome-compass.js` | <1 | `BIO.kitEnd(COMPASS)` closure (`[G data]`) |
| `84-host-ground.js` | 9 | Custom `banded-ironstone` `KSTRATA`, `4` library `KGROUND` layers (`<= 12` samplers), tangent-steered `aBDir` magnetite sand ripples, `KDRAWN` warped grid |
| `85-host-far.js` | 3 | `KFAR` `14 km` textured cuesta horizon, sampler guard, `KHORIZON` occlusion |
| `86-host-works.js` | 7 | `KHAZ` magnetic/lightning hazards, `site:*` reserves (`KTAGS`), and `?works=0` zero-iron bronze, copper & nephrite-jade delver works |
| `88-host-place.js` | <1 | `STATION_BUILD` bridge |
| `89-host-sky.js` | 1 | `ATMOS.skyBiome` at exact `5.1` sky-frame coordinates and `1.44–1.34 atm` pressure |
| `89a-host-atmos.js` | 3 | `ATMOS.bindHost`, spire-targeted `fx/lightning.js` strikes, and `[Field overlay]` streamlines |
| `89w-host-water.js` | 3 | `WATER.flow` (`9102` `Hām-Tsēk` `1,080 m³/s` magnetite narrows & cuesta brooks) and `WATER.still` cisterns |
| `89z-host-build.js` | 3 | `WATER.fields`, `BIO.bake`, `BIO.bakeImpostors`, `KSHADOW` (off at load) |
| `99-host-take.js` | 14 | Compliant preset views, live `#compass-hud` needle, squall/overlay/shadow controls, `hostChecks`, `hostNegatives`, `KHOST.take` |
| `99-tail.html` | <1 | Closes `<script></body></html>` |

## stations/

| Station | Output | `5.1` `(px, py)` |
|---|---|---|
| `foundry` *(default)* | `dist/compasshills.html` | `(1058, 224)` |
| `tors` | `dist/compasshills-tors.html` | `(1128, 248)` |
| `cuesta` | `dist/compasshills-cuesta.html` | `(1046, 258)` |
| `gorge` | `dist/compasshills-gorge.html` | `(1055, 219)` |
