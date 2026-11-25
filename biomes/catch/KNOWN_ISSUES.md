# biomes/catch: known issues

- [ ] **The walls are painted, not cast.** Each station's horizon is four of the shared sky's ridge layers drawn from the
      survey's distances (PLAN.md section 1): far crests 12-17 km, the Godthrone north-west, the inner walls' snowfields,
      the interior hills. A horizon cast from the scale model's heightfield at the site (SKY-PLAN.md 3.3, "Later") replaces
      them with no code change: the stage's `ridges` take a `profile`.

- [x] **The painted walls were about three times too tall — all four stations are now cast** (measured and corrected 2026-11-25 by the
      scale-model session's horizon cast, 1,024 azimuths per band; `openworld/catch-bowl/PLAN-TERRAIN.md` **P19**). The
      drawn ceiling of a ridge layer is `base + amp + peakAmp` (`core/atmos/sky/89-atmos-e-skymodel.js`,
      `A.ridgeProfile`). From the Catch floor the highest thing visible **anywhere** is **2.97°**, and the tallest ground
      within 240 km subtends under **2°**, and the Godthrone massif itself — **24.8 km high, the tallest ground on the
      map** — subtends only **0.42°** from station 1, standing 451 km off with 21.1 km of that curvature drop. These
      pages drew:

      | Station | Fragment | far crest | inner wall | max drawn |
      |---|---|---|---|---|
      | 1 sand sea | `src/45b-host-stage.js` | `-1.81 / 8.82 / 2.4` | `-1.96 / 8.82 / 3` | 9.41° / 9.86° |
      | 2 Stair's oasis | `stations/oasis/45b-host-stage.js` | **identical** | **identical** | 9.41° / 9.86° |
      | 3 the lake | `stations/lake/45b-host-stage.js` | **identical** | **identical** | 9.41° / 9.86° |
      | 4 north fan | `stations/fan/45b-host-stage.js` | `-2.10 / 12.60 / 2.4` | `-3.00 / 16.80 / 3` | 15.0° / 16.8° |

      Stations 1, 2 and 3 shared the far-crest and inner-wall layers to the digit: the layers were written once and
      copied, so this was one authoring error, not three. (The other two layers were *not* copied wholesale — station 1's
      Godthrone layer read `base:3.6, amp:1.2` where station 4's read `2.2 / 2.8` — so each of the eight was cast and
      reported on its own rather than assumed.) **All four are now cast**, and two further facts came out of doing it:

      - **The eye is the page's `siteH` + 30, not the model cell.** `core/atmos`'s ridges are elevation angles in the
        camera's space and the camera stands on the *page's* ground. The far layers do not care (under 0.1°), but **the
        near layer moves about 0.8° per 100 m — more than its own amplitude**, so it can never be pinned tighter than
        the page's own ground is known. At station 2 the gap is 379 m (the model cell is Stair's hill; `siteH` is the
        spring at its foot, sub-cell on a 2 km grid) and layer 3 moves 1.44°; at station 1 the 98 m gap flips its sign.
      - **`snowH` is in `dist·tan(el)` units, not metres of terrain** (`89-atmos-g-sky.js`: `hgt = dist*tan(radians(el))`,
        and `snowH` and `forestH` are compared against `hgt`). So cutting the amplitudes ~2.5× shrank every drawn
        ridge's `hgt` by the same factor and **put every station's snow line above the ridge it sits on — the snowfields
        vanished entirely** until they were re-expressed as the `hgt` at which the real horizon crosses the intended
        snow line (1,700 / 3,100 / 1,850 / 2,150 for stations 1-4). Station 4's is the instructive one: in its 30-90 km
        band the terrain never reaches the authored 4,400 m at all, so its snowfields were never physically there.
      - `hz` needs no such care and none was changed: `89s` sets `haze = -ln(1-hz)/(dist·fogDensity)` and the shader
        applies `1-exp(-dist·uFogD·R.w)+0.06`, so `dist` cancels and the applied haze is `hz + 0.06` whatever `dist` is.

      It needs no model to see that it is wrong: a 12 km wall subtends ~9° only at about **70 km**, and the Catch is
      ~127,000 km², so from its middle the walls are **150-250 km** off — at 200 km a 12 km wall subtends ~**2.1°** after
      curvature. The authored numbers are a **4.22-era hand survey** the scale model has moved under twice since. Nothing
      is broken and nothing crashes, but every screenshot of the Catch floor misstates the scale of its own horizon.

      **To fix:** cast at each station's pixel with `biomes/seouterwall/region/far.py`'s `ridges_of` (the horizon at 1,024
      azimuths per distance band, with the planet's curvature, `drop = d²/2R`, R from the sky model's `kmPerDeg` 84 →
      4,812,845 m), then take `base` = the band's 2nd percentile elevation angle, `base + amp` = the 98th, `peakAmp` = the
      rest to the max, `dist` = the mean distance of the horizon-defining points. Which makes this entry and the one above
      the same job: the cast is the fix for both.

- [ ] **`STAGE.site` is in the 4.22 legacy frame, not the scale model's** (2026-11-25; `PLAN-TERRAIN.md` **P22**).
      `89-atmos-e-skymodel.js` carries `frame:{mPerPx:2000, refPx:[446,690], ...}` and that `refPx` is a legacy pixel. All
      four stations' `site` values are legacy and map onto their 5.1 pixels by exactly `legacy_shift` (**+272, +330**), so
      **re-siting a station with a model pixel moves the sun, the giant, the ring and the moons.** Nothing in these
      fragments says which frame their numbers are in; this note is the only thing that does.
- [x] **The black storm** (2026-10-26): core/atmos's weather still has no dust-storm mode (a core change: an opt-in `o.dust`
      like `o.ash`), so the host composes one (`src/89y-host-storm.js`, the panel's "air" select or `?air=storm`): ATMOS's
      wind base scaled to a gale (the dust box lifts thick off every bare patch), then, after the shared sky has set the
      hour's light, the fog thickened and turned ochre-brown, the sun dimmed, and the sky pass's own zenith, horizon and haze
      browned so the walls vanish first. When core/atmos gains the mode, this file goes and the select becomes its.
- [x] **The weather host** (`core/atmos/host/89-atmos-e-weatherhost.js`): committed on the biome rebuild (7f174cae0) byte for
      byte as this branch carries it, so the merge is clean.
- [ ] **core/atmos's dust box smears into a band from a high camera** (found 2026-10-26: a flat grey or tan slab across the
      horizon in every "From afar" view). The box of dust sprites rides the camera, so a camera hundreds of metres up sees
      them as one sheet. The page shows the dust only within 140 m of the ground (99-host-take.js); the fix belongs in
      core/atmos (fade the box with the camera's height over the ground).
- [x] **Depth** (the owner, 2026-10-26: more contrast between near and far dunes, and the haze on the far mountains too):
      every station's fog is 2-3x thicker (.00018-.00024), the sand sea opens at 15:30, and each sky ridge takes a target
      share of haze (`hz`) from which 89s works out its haze factor for the station's fog and its distance, so the walls
      fade in the same air as the dunes (far crests ~.7, inner walls ~.5, hills ~.3).
      The walls read as ranges, not slabs: the far and inner layers keep their mean height with twice the variation, more
      cycles and peaks; the fan's snowline is high enough that only peaks carry snow (a level snowline at 35 km read as a
      flat top); a far apron (45c) lays plain ground to 200 km under the same fog (the camera's far plane is 250 km), so a
      high camera no longer sees the void past the mesh filled by the ridges' bodies; the fan's mountain front has a crest
      inside the map and falls behind it, instead of being cut off rising at the mesh's edge.
- [ ] **The Stalkers have no buried pose.** kits/mechs has none yet (kits/mechs/KNOWN_ISSUES.md): the pair stands, pitched
      forward and sunk into the sand. A crouched or lying pose in the kit would read better.
- [ ] **The tunnel's portal is a placeholder** (station 2): a plain concrete frame and a dark mouth, until the Stair build
      draws it from `kits/ancients`. Stair itself (the Hill arcology, the merchants, the divers) is its own build: the Hill's
      slope is left empty here, a `site.stair` record.
- [x] **`CATCH.OASES` carried the 4.21 canvas** (fixed 2026-11-24). Four of the five records stood 75 to 209 km from the
      pins the owner's scale-model edit 5 set: Kolli 209 km out, Lasso 203, Bitta 112, Arfwai 75; only Stair agreed. They
      now carry the **5.1** pixels, every oasis is marked lived-in with its people and its keeper (the owner, 2026-11-16:
      each is kept by one caravan group's hands, ~100 or less), and Stair's note says 750 in place of "a couple of
      hundred". `openworld/catch-bowl/PLAN-TERRAIN.md` P1 has the measurement and `tools/survey.py drift` reproduces it.
      The records are read only by this kit's own checks, so no placement moved; the four pages were rebuilt and the hash
      baseline updated all the same, since the fragment rides in the page.
- [ ] **Stations 1 and 4 stand at 4.21 pixels** (`openworld/catch-bowl/PLAN-TERRAIN.md` P2). Shifted into 5.1, the sand
      sea's point (1072,1340) now reads **4,901 m** and the north fan's (1010,1274) **7,037 m**: both are mountainside.
      Each station's *local ground is synthetic*, authored in its own `45b-host-stage.js`, so neither page is wrong — but
      `STAGE.site` (the sky's place) and `STAGE.ridges` (the walls, "painted from the survey's distances") were surveyed
      at those pixels. Measured candidates: station 1 at **px 1055,1386** (448 m, a 6 m/km slope, the floor's heart
      between Arfwai and the terminal lake) and station 4 at **px 1056,1366** (~1,400 m, Kolli in the frame, the wall
      3,530 m close on the north). Re-siting means re-surveying each station's ridge distances on every bearing and
      rebuilding both pages; a session was spun off for it on 2026-11-24.
- [ ] **The oases' names are proposed** (PLAN.md section 8, 2026-10-26): the owner asked for proposals. Their *places*
      are no longer proposed — they are the model's own pins (above).
- [ ] **No fauna.** The sedesert kit's deer and coyotes are not read (the floor is too hot); the Catch has none of its own
      yet (brine flies at the lake, a wading bird on the brine, the caravans' beasts: for `kits/fauna`).
- [ ] **The dune shrub has no library card.** It is drawn as procedural geometry (green jointed twigs, red fruit), which
      reads; a card (`card.calligonum`) would be finer at the hero range. Not owed yet: say if wanted.
- [x] **The lake drew core/water's breakers' foam** (station 3): `surf:false` stops only the lap; a shore grid's breakers are their own switch
      (core/water 50, `breakers`). 2026-11-08: `breakers:false` beside it in `stations/lake/45b-host-stage.js` (a still brine lake). Not seen on the GPU.
- [ ] **The lake's three other pans** (4.22: 497, 257 and 176 km2) are one playa on station 3; the others are the open
      world's.
- [x] **Look pass** (2026-10-26, with the owner's note that the lake and soda bed read as a blank blob from far, middle and
      even semi-close distance). Not a missing texture: the crusts' sets are pale and low in contrast, the ground shader
      faded every layer's grain to the painted colour past 60 m, and the painted colour had no large-scale variation. Now:
      the soda, efflorescence, ochre and algal sets are packed with a contrast lift (1.3-1.7, materials.json); past 25-220 m
      each layer is read from a second tap six times coarser, so a crust's polygons hold as large shapes (45c); the painted
      ground is mottled at two large scales (`STAGE.macro`); the yardang silt is a relief map over the painted tan, not its
      own near-white. The lake's shore band is steeper (~1.7 degrees over its lowest 600 m) so the strandlines stand as
      benches, the yardangs are kept to the north-western lake beds, the brine's pink margin follows the real depth (it lay
      under dry ground before), and the water takes less of the sky. The oasis's hills and the fan's mountain front take a
      desert-varnished rock set (`ground.rock`, rock.sandstone.varnish) on their steep faces; the fan's braids run down its
      radii; two oasis cameras moved out of a crown and the reeds. The Stalkers lie pitched forward and lower.
- [x] **The oasis hills' outcrops and the lake's low sun** (2026-10-26): forty crags (KSTACKS buttes, 26-70 m) of oxidised
      basalt stand out of the interior hills' steep faces on the west and east ridges, never on the Hill's slope (Stair's
      site) or near the water; the steep faces take the same set (`ground.rock`: the varnished sandstone first tried streaked
      into corduroy in a top-down mapping). The lake station opens at 16:00 (the sun ~19 degrees) so the strandline benches
      and the crusts' polygons throw shadow.
- [ ] **The morning is the giant's eclipse here.** At these sites the sky model puts the eclipse between ~08:00 and ~10:00
      on day 0, so the stations open at 13:00 (the lake at 16:00).

## The final rebuild (pair 11)

Built 2026-11-09 in a cloud session on `claude/integration-b91c04` (b4edff31), with no GPU: the four pages were built and the CPU lints run,
and **no page was loaded in a browser** (the owner's rule for this pair: the coordinator runs the GPU verify). Every change is in `src/`,
`build.py` and `materials.json`; sedesert, core/ and the other kits are untouched. The four pages (`catch`, `catch-fan`, `catch-lake`,
`catch-oasis`) take every change: the stations read src/'s fragments.

**What changed**
- `build.py` on the universal set's lists (ringisles' and korona's): core/biome 31b, 31j, 32, 33, 34, 35, 39, 41, 44 beside what it had;
  core/terrain 43 (KGROUND) and 45 (KHORIZON, with its shade); core/shadow (KSHADOW and its host); core/atmos's height fog
  (`sky/89-atmos-j-fog.js`, `host/89-atmos-j-heightfog.js`), the rain cover and lightning (`fx/`); core/water ext 57, 58, 60; `khost.FULL` (the
  inspector, marks, pictures, minimap, editor, cutaway) and the page's edits (`39-host-edits.js`, keyed `catch` or `catch-<station>`);
  `build_sources.report()` (`--list-sources`); LF writes as before. `check_assembly`'s MISSING `BIO.leafOn`/`leafQ`/`impostor*` on the four
  pages are gone (the sedesert kit read in place calls them), and so is `STAGE.sedMask` (88 reads it only where a station gives one).
- **The ground on KGROUND** (`45c`): the twelve library layers are hex-tiled, read coarser with distance (tile doubling from 30 m, up to 8x:
  the coarse read the owner asked for on 2026-10-26) and blended by height, at the same per-vertex weights and the same keep (a layer's
  colour is t x mix(paint / mean, 1, keep)). `?kground=0` is the page's own blend as before. The ground's eye is `kEye()` now: the old blend
  read `cameraPosition`, which r128 never uploads to a Lambert material, so its distance terms (the coarse tap from 25 m, the fade past
  500 m) measured from the origin, not the camera. The anti-tiling noise texture is gone from the KGROUND path (12 units, was 13).
- **Height fog is core/atmos's** (`89zz`, `ATMOS.heightFog` on `STAGE.fogH`: `y0` the reference height, `1/H` the falloff, sun .3, sky .25).
  The page's own ShaderChunk fog in `45-host-scene.js` is gone (it also read `cameraPosition` on Lambert); `STAGE.fogH.k` (its height share)
  has no counterpart and is no longer read. The dust's colour pull on the fog (89s) is kept. `?hfog=0` the plain fog.
- **`89zz-host-core.js`** (new, every station): `BIO.bindAtmosWind` and `BIO.setA2C`; the impostors' bake and look (gain 2.4, `?impgain=`);
  **KSHADOW off by default, `?shadow=1`**, and only where the ground keeps a texture unit; the rain cover and KHORIZON decided by the
  ground's texture units at load (ringisles' `samplersOf`; `window._units`, `_shadow`, `_rainCover`, `_horizon` say what was done; with
  12 layers the ground should read 12, so on a 16-unit GPU the rain cover and the horizon both go on); the water as fields (`WATER.fields`
  over the square, cell 12) and `BIO.env`, read by nothing placed (`?fields=0`).
- **`98z-host-mirror.js`** (new): `WATER.mirrorSwitch` on the station's largest water (the lake's open surface, the oasis's largest pool,
  the fan's pool; none on the sand sea), **off at load**; the panel's button or `?mirror=probe|live`. 99 draws through it (`HOST_DRAW`).
- **The trees** (`55`): `BIO.flareJoin` on the poplar's limbs and forks (`?flare=0`); **octahedral impostors for the far living poplars**
  (korona's lines: one baked from the hero poplar nearest the middle, at `BIO.bakeImpostors`, so no placement draw moves); the dead and
  the gold poplars keep their blobs (a green crown's bake would leaf them), and so does the salt cedar (under the 7 m the stand-ins start at).
  `?diet=0` keeps the blobs for all. Nothing reads the Catch's species (`reach.py`): keys and indices unchanged.
- **The oasis's floating feathers** (the coordinator's GPU verify, 2026-11-08: `catch-oasis` failed the attach audit, `biome:feather` 120
  of 949 floating, 1.15% overall, limit 1.00%). The sedesert kit's mesquite scatters its clumps in a disc round points on its stems. While
  that kit builds, `88` logs the spans its `BIO.tube`/`BIO.beam` draw (`BIO.segs`, begun again at each tree's first limb) and brings each
  feather further than half its size from the nearest span to half its size from it (`BIO.snapSeg`, `BIO.holdTo`): on its own line, no new
  draw, no draw from the stream. `window._held` = {feathers, moved}; `?hold=0` leaves them. A scratch node test with core's own `snapSeg`
  and `holdTo` passes (a feather 3 m out held to 1 m; one in reach kept; the next tree held only to its own wood). **The fix belongs in
  sedesert's `55`** (`BIO.tree` round each mesquite and `BIO.holdTo` on its clumps; its own page floats the same): for sedesert's next turn.
- **Card cells:** the five nine-cell sheets the kit cuts by uv (`cellUV`: poplar, tamarisk, reed, saltbush, brine lamp) are marked
  `"sheet": "geometry"` in `materials.json` (korona's fix; `check_cells biomes/catch` 0 faults, was 5; the pack is unchanged).

**Checks run (CPU):** `tools/build.py biomes/catch` and `--station fan|lake|oasis` (syntax OK, 106 fragments each, ~9.4 MB);
`check_assembly` no findings on the four pages (23 of its baseline keys can shrink); `check_core_use` none new; `check_port` ok;
`check_source` none over its baseline (one key can shrink: `45c`'s CAMPOS); `check_cells biomes/catch` 0 (`--ratchet` skips in this
checkout, the library's cards are LFS pointers; its five baseline rows can go). No baseline rewritten; `PORT-BASELINE.json` untouched.

**For the GPU verify** (`verify.py --assert --all-views` on the four pages)
- `catch-oasis`'s attach audit with the feathers held (`window._held`), against `?hold=0` for the before.
- The universal asserts (shader-programs, shader-errors, the instance cap, textures-decoded): the ground's program is new (KGROUND over
  twelve layers, plus the horizon and the rain cover); if it fails to link on the Arc, `?kground=0` is the old blend and `?hz=0` drops the
  horizon's two units.
- The look, for the owner's eye: the ground on KGROUND near and far (the crusts' polygons on the lake station from afar; the sand sea's dune
  layers), the height fog against the old (the old had a height share `k` of .75-.85; core's has none), the far poplars' impostors (gain 2.4)
  beside the near ones, the limb collars, the shadows on `?shadow=1` (and their cost).

**Not taken (said here so the next turn need not ask):** KSTRATA (the lake-bed mesas keep 46's KSTACKS look; no lake-sediment recipe
exists), KFAR (the far apron and the shared sky's ridges stand for the far country; the walls' item above), R9 wet ground (a dry basin;
oidong's finding over a KGROUND floor), the sedesert kit's own runtime LOD and impostors (`SEDESERT.LOD.tree` unset: the oasis's mesquite
and palms draw as before), `ATMOS.airLoad` for the black storm (core/atmos has a dust load now, `fx/89-atmos-fx-airload.js`, which
sedesert's haboob uses: moving 89y onto it is a look change for a later turn), fauna.

**Core findings (not edited here):** `core/terrain/43-core-ground.js` should read `kEye()` itself (this page redirects the name, as korona
does); core/atmos's dust box still smears from a high camera (above).
