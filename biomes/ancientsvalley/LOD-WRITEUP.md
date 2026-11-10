# The Ancient's Valley: shells clipping through models, and floating foliage

A write-up for a second opinion (2026-11-09). It is meant to be read without the repository: the code that matters is quoted.

## 1. The page

The Ancient's Valley is one self-contained HTML page built with three.js r128 on WebGL2. It shows a ruined metropolis round a lake, about 7 km
across.

- **About 760 towers.** They are ruined skyscrapers of 16 families, from 26 m arcades to 260 m spindles, in six ruin states each.
- **The rainforest.** Two procedural rainforest kits supply the trees and the floor plants, about 500,000 instances in all.
- **Scattered pieces.** Street furniture, wrecked vehicles and debris lie over the streets and plazas.
- **The scale of a frame.** The page draws about 6 to 9 M triangles in 550 to 1,100 draw calls a frame, from 13 M in its registry.
- **Memory.** In the in-app browser it holds about 3.85 of Chrome's 4.19 GB heap.

The owner walks and flies the page and reports what looks wrong, with the camera's position and target (`cam x,y,z tgt x,y,z`).

## 2. The symptoms, reported again and again

The owner reported these between 2026-11-07 and 2026-11-09, each a camera given as position then target:

| Report | Camera |
|---|---|
| "A shell rendered too close" | -504,-7,791 to -505,-5,812 |
| "Pic 47 shows a shell at close range again" | (from a screenshot) |
| "Floating flora and structural elements" | -526,-8,886 to -533,-5,910 |
| "A lot of floating flora" | -434,-4,718 to -438,-4,709 |
| "Shells clip through rendered models at scales they shouldn't be seen" (today) | -535,12,886 to -449,-4,955 |
| "I see some floating flora too" (today) | the same |

Two families of fault keep coming back:

1. **Towers.** A tower's far stand-in, its shell, is seen where its full model should be, or overlapping it. Pieces of towers pop in and out
   as the camera moves.
2. **Foliage.** Plants hang in the air: off the faces of towers, over the ruins' broken tops, or over the ground.

## 3. How a tower is drawn: three tiers

Every tower is a record `{x, y, z, yaw, family, state, lean, ...}`. Each frame (every 150 ms) `tiersTick` sorts the towers into three tiers.

- **Hero.** The full model from the metropolis kit, 30k to 200k triangles, rusted and clipped at the ruin's top. It is drawn for towers
  inside the tower's near radius `nearR`. That radius is 600 m times a family factor, which is 1.3 to 2 for round and thin families.
- **Shell (KSHELL).** A baked stand-in: a low-poly **cage**, the box or stacked frustums of the footprint up to the ruin's height. Its
  fragment shader sphere-traces a heightfield atlas baked from the hero, discarding where the ray leaves. It is used from 0.85 `nearR` to
  3.2 km.
- **Impostor.** Billboard sheets (`BIO.impostor`, 8 views) beyond 3.2 km.

A **dither cross-fade** joins the hero and the shell. Both shaders use the same screen-space hash
`h = fract(52.98 * fract(dot(gl_FragCoord.xy, vec2(0.0671, 0.0058))))`. Both compute the distance from the eye to the tower's box, from its
base to its top. With `s = smoothstep(0.85 R, R, d)`:

- the hero discards where `h < s`, so it fades out;
- the shell discards where `h >= s`, so it fades in.

When both use the same R and the same d, every pixel in the band belongs to exactly one of them.

The tier rule, condensed from `src/70-host-city.js`:

```js
for (const t of towers) {
  const d = boxDistance(t, eye), shellable = t.hasShell && !eyeAboveRoof(t);
  if (!shellable) { if (d < 1000) designHeroes.push(t); continue; }
  const R = t.nearR;                               // 600 * AV_NEARK[family] (1 .. 2)
  if (d < R) near.push(t);                         // a hero candidate
  if (d >= R * .85 && d < 3200) { mid.push(t); t.shell = true; }   // a shell (the dither band overlaps the hero's)
}
// every tower inside .85 R is a hero; the rest of the band fills a pool of 64; heroes kept past R lose their shell
```

## 4. How the foliage is placed

- **Trees and floor plants.** They come from the two rainforest kits as instanced cards and merged buckets. They are chunked for level of
  detail with a key `cx,cz|range|minRange`; past a tree's mid range its impostor card takes over.
- **The feral wrap** (`src/46-av-feral.js`). It wraps the kits' tree builder and scales each tree's instances and triangles about its foot.
  It also **copies** a tree's span onto the ruins' broken tops, the perches.
- **Creepers.** Instanced curtains of vine and moss cards hang from tower faces.
- **The ground.** It is drawn as a 440 by 440 grid over 6.2 km, so cells are about 14 m. Plants stand at the analytic `terrainH(x, z)`.
  That height includes carvings narrower than a cell: crater bowls and rims of 8 to 30 m, road cuttings, sinkholes. Where the mesh's linear
  interpolation and `terrainH` disagree, a plant floats above the drawn ground or sinks into it.

## 5. What was already found and fixed

| Date | Symptom | Cause | Fix |
|---|---|---|---|
| 11-08 | Foreground towers low-res, floors floating | A design's impostor stood where a hero should | Designs are heroes to 1 to 1.4 km |
| 11-08 | Shells smeared seen from above | The shell's top map smears when the eye is over the roof | Such towers are heroes, with no shell |
| 11-09 | Towers popping on the hero-to-shell switch | The design families' heroes stood at full height; the shell and impostor were cut at the ruin's top | Heroes clipped at the record's top |
| 11-09 | Giant pale sheets near the eye | Copied tree rows kept the near key, so far-only impostor cards drew near | Copied rows keep their own range key |
| 11-09 | A shell at 390 m too close | The band was 300 m | The band went to 600 m, and 1.3 to 2 times that for round and thin families (`AV_NEARK`) |
| 11-09 | Floating flora at the Overlook | Creepers and roof trees were placed on the family's footprint (a spindle is 46 m at its foot and 15 m at its break) | Placed on the drawn hero's measured profile |
| 11-09 | 290 m trees | The feral wrap grew the same instances once per batch of rows, 1.3 to the 13th power | Each instance is grown once |
| 11-09 | Floating structural elements after a view jump | One frame drawn with the previous eye's tiers | Retier at once on a jump of 60 m or more |

## 6. Found while writing this (2026-11-09), fixed, awaiting the owner's eye

### 6a. The shell's fade band ignored the families' own radii

The hero fades out over `[0.85 nearR, nearR]` with `nearR` per tower. The shell's band was one uniform per material, `uBand.x = 600`:

```glsl
// the shell's vertex shader (kits/metropolis/src/60-mp-shell-host.js), before the fix
vLodK = vec2(0.0, uBand.x > 0.0 ? smoothstep(uBand.x * (1.0 - uBand.z), uBand.x, ld) : 1.0);
// fragment: if (h < vLodK.x || h >= vLodK.y) discard;
```

For a family with `nearR = 1200`, such as the Stalk or the Pods, the tier rule places the shell from 1020 m. There the shell's
`smoothstep(510, 600, d)` is already 1, so the shell is **fully opaque**. The hero is meanwhile still fully drawn until 1020 m and then
dithering out to 1200 m. Inside that band the coarse traced shell and the detailed hero are drawn together and clip through each other.

`AV_NEARK` arrived on the morning of 11-09, which matches when "shells clip through models" became the complaint.

**The fix.** A per-instance attribute `aBand` carries each family's `nearR`, times the same LOD scale the heroes' fade reads. Zero falls
back to the uniform, so the metropolis kit's own page is unchanged.

### 6b. The shell's distance measured height from y = 0, not from the tower's base

```glsl
dy = max(e.y - aFrame.y, max(-e.y, 0.0));                       // before: H against the world's y = 0
dy = max(e.y - (c.y + aFrame.y), max(c.y - e.y, 0.0));          // after: from the instance's base, as the hero's fade does
```

The towers stand from y = -66 at the lake to y = 50 on the shelf, so the shell and the hero computed different distances. The cross-fade
then left either an overlap, with both drawn, or a gap, with neither.

### 6c. The shell wrote the cage's depth, not the traced surface's

The shell's fragment traces from the cage's face inward and discards misses, but it never wrote `gl_FragDepth`. Every shell pixel carried
the depth of the cage's face, which is in front of the surface actually drawn by up to the cage's inset and, for a jagged ruin, by metres.

Anything standing between the cage's face and the traced wall was therefore hidden or cut by the shell:

- creepers hung 0.35 m off a face;
- trees standing on a broken top, inside the cage, which goes to the ruin's record top;
- rubble at the plinth;
- a neighbour's corner.

**The fix**, writing the traced hit's depth on WebGL2:

```glsl
if (!mpTrace()) discard;
#if __VERSION__ >= 300
{ vec3 vp = -vViewPosition; float dc = length(vp), dh = length(mpHP - vMpE);   // hit distance, same in the instance frame (no scale)
  vec4 cl = projectionMatrix * vec4(vp * (dh / max(dc, 1e-4)), 1.0);
  gl_FragDepth = clamp(cl.z / cl.w * 0.5 + 0.5, 0.0, 1.0); }
#endif
```

This turns off early depth rejection for shells. That costs some speed, but the shell's fragment was already the expensive trace.

## 7. What is still unexplained, and the questions

All four camera coordinates in §2 (`-504,-7,791`, `-526,-8,886`, `-434,-4,718`, and today's `-535,12,886` looking south-east toward
`-449,-4,955`) sit on the sloping lakeward core (`x ~ -535..-434, z ~ 710..955`), where the ground falls from `y ~ +12` down toward the
drowned inlets (`y ~ -30..-66`), war damage on the streets is heaviest (`KTRANSIT.war` craters of `4..15 m` radius), tall lake-front families
(`spindle`, `organ`, `stalk`, `reed`, `swell`, `yoke`, `telescope`, `wedge`) mix with courtyard/curved designs (`pods`, `crescent`,
`terrace`, `arcades`), and four in five towers are cut or collapsed (`22%` `broken`, `25%` `stump`, `16%` `skeleton`, `22%` `fallen`).

Auditing the code paths active in that view after 6a–6c shows why `BIO.attachAudit` still passes (`<= 1%` floating) while both families of
fault persist on screen:

- `BIO.attachAudit` (`core/biome/20-core-kit.js`) measures height above the analytic `terrainH(x, z)`, skips `GROUND.mesh`
  (`probeSkip: true`), treats `AV_CREEPERS` as solid structure rather than foliage (no `material.userData.bio`), and counts active `shell.*`
  box cages as solid structure even where `mpTrace()` discards to air.
- Six separate mismatches in `70-host-city.js`, `71-host-creepers.js`, `88-host-build.js`, `89v-host-smog.js`, and `swlowlands`' floor pass
  remain active after 6a–6c (documented in §8 below).

**Questions for a second opinion:**

1. Is a dithered cross-fade between a real mesh and a ray-marched stand-in sound when both write depth? What should be done where the
   hero's pool cap (64) leaves a tower in the band with only its shell, so that half its pixels are dithered away into holes?
2. With `gl_FragDepth` from the trace, is anything else in three.js r128 likely to fight it? Candidates: the shadow pass, which uses the
   cage with no `customDepthMaterial`; logarithmic depth, which is not used here; and MSAA (`antialias: true`).
3. Leaning towers. The hero group takes the lean quaternion and the shell instance matrix takes the same one. The shell's distance for the
   fade, though, uses the instance's translation and an axis-aligned box swapped by `|instanceMatrix[0].x| < 0.5`. Can a lean of up to
   5 degrees on a 250 m tower shift the box enough to desynchronise the fade?
4. Floating foliage over a coarse ground. Plants stand at `terrainH`, but the drawn ground is a 14 m grid that cannot hold 8 to 30 m
   carvings. Is it better to stand plants on the drawn mesh's interpolated height (`meshH`), or to refine the mesh along the carvings? The
   transit kit's demo refines its ground along lines.
5. Is there a general guard against these classes of fault that a test could enforce? A depth-consistency test between tiers, or a census
   of instances over the drawn ground, run at a set of cameras every build.

---

## 8. Second opinion: remaining root causes in the code (after 6a–6c)

### 8a. `fallen` towers (22% of the city, ~165 towers) are given upright `stump` shells

In `src/70-host-city.js`:

```js
const AV_LOOK = { intact:'intact', gutted:'gutted', crown:'crown', broken:'broken', stump:'stump', skeleton:'stump', fallen:'stump' };
const avImpKey = t => t.family + '.' + AV_LOOK[t.state];
const avCanShell = t => !!t.skey && t.state !== 'skeleton';
// ...
t.ikey = avImpKey(t); t.skey = t.ikey;
```

Because `avCanShell` only excludes `'skeleton'`, every `fallen` tower (`22%` of `STAGE.plan.towers` by `AV.RUIN_CUTS`) is `shellable = true`
with `t.skey = fam + '.stump'`:

- **Hero (`fam.fallen`):** `keep = 0.05..0.10` (`11.7 m` on Spindle; `skin = 0` on Ledger—just a pancaked rubble mound and two end walls;
  `15..18 m` on tall designs; note also `AV_RUINY = {crown:1, broken:1, stump:1}` on line 97 omits `fallen`).
- **Shell (`fam.stump`):** `keep = 0.11..0.28` plus `core`, baked from `fam.intact` up to `R.top` — **`47.8 m` on Spindle, `53.8 m` on
  Telescope, `40..48 m` on Organ/Stalk/Swell/Reed, and a full `126 x 24 x 14 m` building on Ledger**.

Across `[0.85 nearR, nearR]` (`510..600 m` up to `1020..1200 m`), a `40..54 m` intact-skinned building materialises in mid-air over a
collapsed heap, clipping straight through its rubble and standing upright out to `3.2 km`.

**Fix:** Either exclude `fallen` in `avCanShell` (`t.state !== 'skeleton' && t.state !== 'fallen'`) and give `fallen` its own low impostor
look, or bake a dedicated `fallen` shell clipped at `MP.ruin(F, 'fallen').cut` (and add `fallen: 1` to `AV_RUINY`).

### 8b. `avStub` and `impOf` clip `fam.intact` at `R.top` instead of `R.cut`, and leave `gutted` uncut

In `kits/metropolis/src/40-mp-records.js`:

```js
return { state, cut, torn, skin: Math.max(0, skin),
         top: Math.max(cut + (round ? 8 : 1), core + 1, fins, ends), ... };
```

On the **hero**, the outer facade stops at `R.cut` (and tears *downward* by `R.torn = 3.6..10.8 m`); only the narrow `~6 m` central core
reaches `R.core`. In `src/70-host-city.js`, however, `avStub` (and `impOf`) clips the **full-width intact outer skin** (`fam.intact`) at
`R.top`, and skips clipping altogether for `gutted`:

```js
if (look !== 'gutted') {
  const R = MP.ruin(F, look);
  top = Math.max(8, R.top != null ? R.top : (R.cut == null ? 8 : R.cut));
}
```

Consequences:

- `spindle.stump`: hero outer skin ends at `25.7 m`; shell outer skin (`r = 28 m`) rises to **`47.8 m` (`+22.1 m` taller)**.
- `telescope.stump`: hero first drum ends at `35.2 m`; shell (`54 m` wide) rises to **`53.8 m` (`+18.6 m` taller)**.
- Every `broken` and `crown` round family (`spindle`, `telescope`, `cupola`, `spiral`, `terrace`, `stalk`, `swell`) gets **`8..19 m` of
  extra full-width shell wall** above the hero's torn rim. In `[0.85 nearR, nearR]` that extra upper wall has no hero behind it (dithering
  against open sky), and past the band it **swallows the trunks of rooftop perched trees** placed at `R.cut` (`src/88-host-build.js`).
- `spindle.gutted`: the hero cuts off the bronze lamp disc and needle at `0.84 * 234 = 196.6 m`, whereas `avStub('spindle.gutted')` bakes
  the uncut `262 m` intact Spindle into a `204.6 m` frame.

**Fix:** Clip `avStub` and `impOf`'s outer skin at `R.cut` (or better, `MP.tearAtXZ(F, R, x, z)` so the broken skyline matches the hero's
stepped tear), including `gutted` when `R.cut < F.height.tip`.

### 8c. `avProfile` treats courtyards, arcs, arches, and multi-pipe designs as solid discs/boxes

`avProfile(key)` (`src/70-host-city.js`) measures only one max radius `r` and one bounding box `[x0, x1, z0, z1]` per `6 m` height band.
That fixed radially symmetric towers (`spindle`, `telescope`, `spiral`), which is why the Overlook view improved on 11-09, **but fails on
non-convex, hollow, or multi-tower families**:

- **Courtyards (`terrace` has a `56 m` open court; `arcades` has a `52 x 24 m` open court):** `88-host-build.js` samples rooftop trees
  uniformly across the full disc/box, dropping trees straight into open central courts `25..40 m` above the ground.
- **Curved, arched, and multi-tower designs (`crescent`, `pods`, `organ`, `yoke`):**
  - `crescent` is an `18 m` curved bar inside a `180 x 60 m` AABB (~70% empty air): `71-host-creepers.js` hangs curtains along the four AABB
    walls up to `40 m` away from the curved facade, and `88-host-build.js` places rooftop trees into empty air across the chord.
  - `pods` (two spheres at `x = +-34` with open air between them below `y = 28`), `organ` (five separate round pipes in an arc), and `yoke`
    (a `60 m` tall open arch between `x = +-18` below `y = 66`) all receive curtains and rooftop trees in empty space.

**Fix:** Sample actual hero triangles (downward raycast or triangle reservoir sampling on horizontal roof faces for `TOPS`, and inward
horizontal raycasts or actual facade vertex/panel sampling for `AV_CREEPERS`) rather than sampling the band's bounding box.

### 8d. Design-family rubble tilts into mid-air and tower rubble overhangs `50 m` pads

- In `src/70-host-city.js`, `t.shelled` is `true` only for `spindle` and `ledger`. For all **14 design families**, `avDebris` draws nothing;
  instead `MP.ruinDesign` (`kits/metropolis/src/59b-mp-ruin-design.js`) appends `D = MP.debris(F, state)` **inside the hero group `g`**.
- Line 209 then applies `if (t.lean) g.quaternion.copy(avQuat(t))` to the entire hero group—tilting a `150 m` rubble field by up to `5 deg`!
  At `140 m` from the tower's origin, `140 * sin(5 deg) = 12.2 m`, lifting fallen shaft drums, Stalk saucers, and rubble mounds `12 m` into
  the air (and popping all design debris out completely when the hero switches to its shell).
- Even with `lean = 0`, `MP.debrisPlan` places fallen shaft sections and discs at `y = 0` (`world y = T.y`) out to `140..260 m` from
  `(T.x, T.z)`, while `STAGE.pads` (`src/46z-host-stage.js`) only flattens `terrainH` to `~50..65 m`. On the valley slope toward the lake,
  far rubble pieces hang metres over the hillside ("floating structural elements").

**Fix:** Separate `.debris` from `avQuat`'s lean on design heroes (or include all 16 families in `AVC.debris` / `AVC.debrisFar`), and seat
off-pad debris pieces/heaps on `terrainH(wx, wz) - T.y` beyond `T.padR`.

### 8e. Fog hook order, the `above` cliff, `150 ms` tick boundaries, and `lv === 1` floor stems

1. **Height-fog execution order (`src/89v-host-smog.js`):** `ATMOS.heightFogScene(scene)` runs synchronously at script load—reaching
   `GROUND`, `AV_CREEPERS` (71), and `BIO.baked` flora (88)—**before** `AVC.boot()` (70), `AVW` (73), or `AVTR.build()` (74) have added any
   towers, shells, engines, wrecks, or streets to `scene`. Creepers and rooftop trees therefore fog through the thick valley-floor smog pool
   and cloud band (`atmFog`), while the tower heroes and shells right behind them only use plain `FogExp2`, visually detaching tower-mounted
   flora in the mist.
2. **Hard cliff at `above = e.y > t.y + H + 25` (`src/70-host-city.js`):** On low-lying `stump` towers (`t.y ~ -45..-60`), crossing
   `t.y + H + 25` flips `shellable` instantly with no cross-fade. Worse, `!shellable` tests `d < AV_DNEAR` (`1000 m`), which is smaller than
   `nearR` for `pods` (`1200`), `stalk` (`1200`), and `organ` (`1080`)—dropping them straight from hero+shell to a `128 px` billboard
   impostor at `1050 m`. (`!shellable` should test `d < Math.max(AV_DNEAR, nr)`.)
3. **`150 ms` `tiersTick` boundary lag:** `tiersTick` stages `near` (`d < nr`) and `mid` (`d >= 0.85 nr`) every `150 ms`, whereas both
   shaders read live `ld` every frame. Crossing `0.85 nr` outward or `nr` inward between ticks dithers one tier before its partner is in the
   list.
4. **Mid-LOD stemless floor plants (`biomes/swlowlands/src/60-biome-swlowlands-floor.js`):** `earCluster` (line 52) and `heliconia` (line
   56) only emit their `BIO.beam('rod', ...)` stalk when `lv === 2`, leaving `heart` leaves (`+0.4..1.2 m`) and `bloom` clusters
   (`+1.0..2.5 m`) floating without stems in the `lv === 1` mid band.

---

## 9. Answers to the five questions

### Question 1: Dithered cross-fade with `gl_FragDepth`, and the 64-hero pool cap

- **Soundness when both write depth:** Where silhouettes overlap, complementary screen-space dithering (`_lh < s` discards hero, `_lh >= s`
  discards shell) with identical `(s, _lh)` is **partition-exact per pixel** *before* depth testing. At every `(gl_FragCoord.xy)` at most
  one of `{hero, shell}` survives `discard`, so the mesh depth and `gl_FragDepth` never fight in the Z-buffer regardless of draw order or
  surface offset. The only limitation is **non-overlapping silhouettes**: partitioning guarantees mutual exclusion, not union coverage, so
  large massing discrepancies (§8a, §8b) show as stipple across `[0.85 R, R]`. Once silhouettes agree within ~1 m, the edge delta at
  `600..1200 m` is ~1 px wide.
- **Fixing pool-capped shells (`AV_HEROMAX = 64`):** Currently `aBand` is filled statically with `nearR` at boot (`60-mp-shell-host.js` line
  151), so a tower dropped by `rest.slice(room)` inside `[0.85 nearR, nearR)` keeps fading its shell with no hero behind it. Since
  `avShells(mid)` already rewrites `im.instanceMatrix` every `tiersTick`, write `aBand` per active shell instance in the same loop:

```js
// 70-host-city.js: avShells(mid, held)
list.forEach(T => {
  const im = AVC.mesh[T.skey]; if (!im) return;
  const idx = n[T.skey]++;
  M.compose(p.set(T.x, T.y, T.z), avQuat(T), one);
  im.setMatrixAt(idx, M);
  im.geometry.attributes.aBand.setX(idx, held.has(T.id) ? (T.nearR || AV_NEAR) : -1);
});
// mark im.geometry.attributes.aBand.needsUpdate = true alongside instanceMatrix
```

And in `60-mp-shell-host.js` (`DM`):

```glsl
float bx = aBand < 0.0 ? 0.0 : (aBand > 0.0 ? aBand : uBand.x) * uBandS;
```

When `aBand < 0.0`, `bx == 0.0` gives `vLodK.y = 1.0` (100% opaque shell, zero holes). Add a `~15 m` hysteresis bonus for towers already in
`AVC.tierGroups` when sorting `rest` so slot 64 does not chatter, and preload shells into `mid` from `0.80 nearR` (culling `vLodK.y <= 0.0`
in the vertex shader via `gl_Position = vec4(2.0, 2.0, 2.0, 1.0)`) so `150 ms` tick intervals never catch a fading hero without a shell.

### Question 2: Does anything in three.js r128 fight `gl_FragDepth`?

- **Shadow pass (`?shadow=1`):** Shells currently have `castShadow = false` and `receiveShadow = false` (`KSHELL.draw`), so the shadow pass
  never touches them. *If `receiveShadow` is ever enabled on shells*, r128 computes `vDirectionalShadowCoord` in the vertex shader on the
  **cage face**, which will misproject shadows by `1..30 m` unless `directionalShadowCoord` is recomputed in the fragment shader from
  `(instanceMatrix * vec4(mpHP, 1.0))`.
- **Height fog (`ATMOS.heightFogOn`):** Once `ATMOS.heightFogOn` is applied to `AVC.mats` (fixing §8e.1), note `89-atmos-j-heightfog.js`
  integrates fog to vertex `vAtmFogP` (the cage) rather than `(instanceMatrix * vec4(mpHP, 1.0)).xyz`. Looking down through the top of a
  tall cage onto a lower hit shifts vertical mist/band `y` unless `atmFog` uses the traced world point.
- **View-space lighting:** `normalize(vViewPosition)` is **exact** because `mpHP` lies on the same ray through the origin as the cage
  fragment; directional and hemisphere lights are position-independent.
- **MSAA (`antialias: true`):** Without sample-rate shading, WebGL2 evaluates the fragment shader once at pixel centre and broadcasts the
  scalar `gl_FragDepth` to all covered subsamples, losing hardware subsample depth slopes on cage edges. Internal silhouettes already come
  from `mpTrace()` `discard` (1x pixel rate, like `alphaTest` foliage), so cage seams do not crack.
- **24-bit depth precision (`camera.near = 0.6, far = 42000` in `47-host-land.js`):** One 24-bit perspective depth ULP at range $d$ is
  $\Delta d \approx d^2 / (z_{\text{near}} \cdot 2^{24})$. With $z_{\text{near}} = 0.6\text{ m}$, $\Delta d \approx 0.10\text{ m}$ at
  `1 km`, **`0.40 m` at `2 km`** (wider than the `0.35 m` creeper offset!), and **`1.02 m` at `3.2 km`**. Raising `camera.near` from `0.6`
  to `1.0..1.2` (walker clearance is `1.8 m`) doubles depth precision across the whole valley for free.
- **Early-Z & `polygonOffset`:** Writing `gl_FragDepth` disables GPU Early-Z before the fragment shader (GLSL ES 3.00 has no
  `layout(depth_greater)`) and disables `polygonOffset`. Keeping the dither `discard` ahead of `mpTrace()` and vertex-culling
  `vLodK.y <= 0.0` instances avoids wasted traces.

### Question 3: Can a 5-degree lean on a 250 m tower desynchronise the fade?

**No—with one narrow edge case off Station 0:**

1. **Neither shader uses vertex positions for `ld`:** Both `BIO.LODFADE_GLSL` (`avFade`) and `DM` (`60-mp-shell-host.js`) compute one
   constant scalar `ld` per tower from the **un-leaned** world AABB `[T.x +- hb.x, T.y .. T.y + H, T.z +- hb.y]` to `mpC`. Hero and shell
   therefore evaluate the exact same `ld` and `s` regardless of lean angle. (Also, `AV.lean` returns `0` for `intact` and `gutted`, so `250 m`
   intact/gutted towers never lean; max leaning height is `~205 m` on `spindle.crown`, shifting the top at most `17.9 m` inside a `90..180 m`
   fade band.)
2. **The one `hb` swap edge case:** `avHalf` swaps `[a, b]` on `|cos(yaw)| < 0.5`, whereas `DM` swaps on `|instanceMatrix[0].x| < 0.5`
   (which includes `lean`, perturbing `M[0].x` by up to `0.0038`). On Station 0 (`theta = 17 deg`), `|cos(yaw)|` is `0.956` or `0.292`, so
   this **never flips on Overlook**. On a station with `theta ~ 60 deg`, a rectangular slab (`crescent`, `ledger`, `yoke`) could straddle
   `0.5` and desynchronise `ld` by up to `60 m`. Testing `abs(normalize(vec2(instanceMatrix[0].x, instanceMatrix[2].x)).x) < 0.5` (or
   storing pre-oriented `hb = [|c|*a + |s|*b, |s|*a + |c|*b]`) closes that permanently.
3. Where lean *does* cause visible faults right now is **tilting design-hero rubble** (§8d) and **leaving `AV_CREEPERS` leaned past
   `3.2 km`** where impostors stand straight (`AV_CREEPERS` has no max range).

### Question 4: Stand plants on `meshH`, or refine the mesh along carvings?

**Do both together—each solves the half the other misses, at net-lower GPU cost:**

- **`meshH` alone** stops plants from floating at zero memory cost, **but** bridges `14 m` triangles across `8..20 m` street war craters,
  `44` subway sinkholes, and rail cuttings—hiding the war carvings and burying the transit kit's ground scorch discs (`74-host-transit.js`,
  `ground + 0.07`).
- **Refining carvings alone** reveals craters and cuttings, **but** `landGround` (`46z-host-stage.js`) also has ridged crag FBM, `~22 m`
  fine noise, and `14 m` plinth easing (`smooth(0, 14, padD)`). Across unrefined `14 m` cells (and along pinned coarse/fine edges),
  `terrainH - meshH` still reaches `0.4..1.8 m` on slopes and plinth toes.
- **Combined design:**
  1. Port `kits/ancient-transit/src/47-host-land.js`'s crack-free cell subdivision to `47-host-land.js` **only** on the `~3..5%` of `14 m`
     cells touched by `AVT.wars` craters, `AVT.subway.sinkholes`, `STAGE.craters` rims, and `AVT.cargo` cuttings (`K = 6` -> `2.3 m`
     sub-quads, coarse-neighbour edges pinned linear), and split the index buffer into **`8 x 8` frustum-culled tiles** sharing one vertex
     buffer. Total mesh grows by only `~200..250k` triangles (`~10 MB` heap), while **rendered ground triangles per frame drop from `387k`
     (one unculled whole-map mesh) to `~80..120k`**.
  2. Have `GROUND.meshH(x, z)` evaluate the exact drawn triangle (coarse or `K x K` refined) and pass **`GROUND.meshH`** into
     `BIO.init({ terrainH: GROUND.meshH })`, `AV.feralKit({ ground: GROUND.meshH })`, `STAGE.debris`, and `AVW`, keeping analytic `terrainH`
     for water, fields, and road grading. Every carving draws cleanly and every plant, boulder, slab, and wreck sits on the drawn triangle
     to `0.00 m`.

### Question 5: General automated guards (`verify.py --assert`)

First close the three blind spots in `BIO.attachAudit` (`core/biome/20-core-kit.js`): pass `ground: GROUND.meshH` via `KHOST.take`, mark
`AV_CREEPERS` materials with `userData.bio = { kind: 'hang' }` (so creepers are audited as `fol` rather than counted as `str`), and exclude
`shell.*` cages from `str`. Then enforce three fast checks (each with a `hostNegatives` twin):

1. **`HCHK.tierAgreement` (`< 30 ms`):**
   - *Boot/verify silhouette & depth A/B:* Render each `(family, state)` hero vs its `t.skey` shell into a `64 x 64` offscreen depth target
     from 2–3 canonical angles; assert **silhouette IoU >= 0.85** and **median overlapping depth delta <= 1.8 m** (catches §8a `fallen` ->
     `stump`, §8b `avStub` `R.top` +22 m walls, `spindle.gutted` lamp, and §6c `gl_FragDepth`).
   - *Per-camera cross-fade invariant:* At `STAGE.views()` plus the §2 regression cameras, run `AVC.tiersTick()` and assert: if
     `hasHero && t.shell`, `|ld_hero - ld_shell| < 0.05` and `|R_hero - R_shell| < 0.05` (catches §6a, §6b, and `hb` swaps); if
     `!hasHero && t.shell`, `vLodK_shell.y === 1` (catches Q1 pool-cap holes and `150 ms` boundary lag).
2. **`HCHK.groundSeat` (`< 20 ms`):** Sample strided floor instances, `REG` tree feet, `STAGE.debris`, `AVW.records`, and tower rubble
   vertices against `GROUND.meshH(x, z)`; assert `y_foot - GROUND.meshH(x, z) <= 0.35 m` on `>= 99.5%` of samples (`max <= 1.0 m`). Catches
   Q4 coarse-ground floaters, §8d tilted design rubble, and off-pad fallen shaft drums.
3. **`HCHK.towerFlora` (`< 25 ms`):** Assert every creeper curtain and `rooftree` perch lies within `1.8 m` of an actual triangle in
   **both** `AVC.hero[t.key]` and `AVC.stub[t.skey]` (catches §8c empty-air placements on `terrace`, `arcades`, `crescent`, `pods`, `organ`,
   `yoke`).

---

## 10. Maximising detail fidelity without melting the machine

The page currently sits at **3.85 GB of Chrome's 4.19 GB V8 heap**, `550..1,100` draw calls, `6..9 M` rendered triangles, and heavy startup
jank. Counter-intuitively, the codebase has several large, hidden resource leaks and disabled core optimisations; fixing them **frees ~1.7 GB
of JS heap and ~50% of GPU frame time**, buying huge headroom to push visual fidelity *up* while running cooler on mid-range GPUs.

### 10a. Reclaim ~1.7 GB of dead JS heap and 8.8 GB of startup PCIe churn

1. **Drop `AVC.stub` and `H.userData.avFlat` after `KSHELL.bake` (~700–900 MB JS heap saved):**
   `avStub(k)` (`70-host-city.js` lines 40–61, 129) clones every intact hero geometry and runs `clipGeoY`, which expands indexed meshes into
   **non-indexed `Float32Array`s** (3x larger) for all 66 shell keys, and caches them forever on `AVC.stub[k]` and `H.userData.avFlat` even
   though nothing reads them after line 129. Disposing each temporary `avStub(k)` group immediately after its `KSHELL.bake(...)` call and
   deleting `H.userData.avFlat` reclaims ~700–900 MB of heap at zero visual cost.
2. **Bake tower impostors directly into GPU `WebGLRenderTarget`s instead of CPU `Uint8Array` round-trips (~671 MB JS heap + 8.8 GB transfers saved):**
   In `70-host-city.js` (lines 156–162) + `34-core-impostor.js` (lines 210–240), five 14-slot impostor sets (`K = 4`, `8 x 8 x 128 px` =
   `4096 x 4096`) allocate `set.C` and `set.Nm` as `Uint8Array(4096 * 4096 * 4)` (**`134.2 MB` per set x 5 = `671 MB` JS heap**). Worse,
   `AVC.impTick()` bakes 1 look per frame for 66 frames, and on **every single frame** `BIO.bakeImpostors` calls `readRenderTargetPixels`
   (synchronous GPU->CPU stall) and `setTextures(set)`, which disposes and re-uploads **both full `4096 x 4096` textures (`134 MB`) +
   mipmaps** to the GPU (`66 x 134 MB = 8.8 GB` of texture uploads—the main cause of the first-half-minute jank!).
   - Rendering views directly into persistent `WebGLRenderTarget` atlases per set with `viewport`/`scissor` (just as `KSHELL.bake` already
     does in `50 ms`!) and calling `generateMipmap` once when a set's last slot finishes eliminates `671 MB` of JS heap and turns 30 s of
     jank into `< 100 ms`.
   - Also clear `BIO.kits.metro` (`70-host-city.js` line 150) once impostor baking finishes to free another `~300 MB` of non-indexed
     `clipGeoY` buffers, and use `cell: 64` for `stump`/`fallen`/midrise impostors (at `3.2 km`, a `45 m` stump is only `16 px` tall at
     1080p, so `128 px` per view is 8x oversampled).

### 10b. Turn on `core/biome`'s existing draw-call & vertex optimisations in `47-host-land.js`

`swlowlands/src/45-host-stage.js` enables all four `core/biome` optimisations, whereas `ancientsvalley/src/47-host-land.js` (line 26) only
sets `BIO.LOD.fade = .15`:

```js
BIO.INDEX_ITEMS = AVQ_ON('index');          // welds 18-vert foliage cards to 12 indexed verts (-33% card VS load across 500k instances)
BIO.LOD.merge   = AVQ_ON('lodmerge');       // one mesh per chunk with prefix-count LOD (-40..60% flora draw calls, far fewer BufferGeometries)
BIO.LOD.minTris = 1500;                     // coarsens tiny floor-item chunks
BIO.LOD.fade    = BIO.LOD.merge ? .15 : 0;
BIO.LOD.cull    = AVQ_ON('lodcull');        // per-instance vertex-shader range cull on loose floor plants
```

### 10c. Fix `KGROUND`'s hidden `cameraPosition` bug (8x sharper close-up ground!) and cut 65% of its texture fetches

Two huge findings in `core/terrain/43-core-ground.js` + `src/47-host-land.js`:

1. **8x close-up ground blur bug (`MeshLambertMaterial` + `cameraPosition`):** `GROUND` (`47-host-land.js` line 39) uses
   `MeshLambertMaterial` with no `envMap`. In three.js r128, `cameraPosition` is **not uploaded** to `MeshLambertMaterial`—it reads
   `(0, 0, 0)`! Consequently `kgD = length(kgWP - cameraPosition)` in `43-core-ground.js` (line 212) measures distance from the **map
   origin `(0, 0, 0)`** instead of the eye. Everywhere more than `480 m` from the origin (including `-535, 12, 886`, at `1,035 m`!),
   `kgLv` is clamped to `3.0`, blowing up pavement, asphalt, rubble, and rainforest litter tiles **`2^3 = 8x` coarser right under the
   walker's boots**! Computing the eye from `viewMatrix` (`kEye()`) immediately restores **8x sharper ground textures** across the map at
   zero cost.
2. **Skip zero-weight ground layers (-65% ground GPU bandwidth):** Procedural `kind` layers in `43-core-ground.js` (line 216) check
   `if (kgA0 > 0.0)`, **but textured layers (lines 219–223) have no weight guard**. Every ground pixel unconditionally runs `kgSample`
   (6 `8x-aniso` `textureGrad` taps + 1 `textureLod` tap) across **all 7 layers = 49 anisotropic texture fetches/pixel**, even though 4–5
   layer weights are `0.0` at any given spot! Wrapping each layer in `float kgW = clamp(L.w, 0.0, 1.0) * amt; if (kgW > 0.002) { ... }`
   cuts ground fragment bandwidth by ~65–75% with identical pixels.
3. **Free micro-relief lighting on the ground:** `KGROUND` already computes composite height `kgHc` at every pixel. Perturbing the fragment
   normal by screen-space derivatives of `kgHc` (`normalize(normal - vec3(dFdx(kgHc), 0.0, dFdy(kgHc)) * 1.4)`) gives rubble stones, kerb
   cracks, melt glass, and forest litter crisp directional sun relief with **zero normal maps and zero extra texture reads**.

### 10d. Higher tower, ruin, and flora detail at net-lower GPU cost

- **Move `avRust` (rust, soot, laser-burn planes, and wild-half moss) from vertex colours into a shared world/tower-frame shader chunk (run
  in `KSHELL.bake` + hero materials):** Currently `avRust` mutates per-vertex and per-panel colours on ~80 hero clones—which looks blocky up
  close (burns land on whole panels rather than razor lines) and duplicates geometry colour buffers across keys. Evaluating the exact same
  `KRAND`-equivalent noise + laser-plane + moss function per fragment on heroes **and** per texel inside `KSHELL.bake`'s `BF` shader gives
  pixel-sharp scorch cuts, joint rust drips, and tower moss up close, bakes identical colours into shells at **zero runtime shell cost**,
  and lets all ruin states share untouched base geometry buffers.
- **Distance-adaptive `MP_STEPS` on shells:** With `gl_FragDepth` disabling Early-Z, every shell pixel out to `3.2 km` can run up to `32`
  sphere-trace steps + `5` bisection steps. Scaling step count with range (`int nSteps = int(mix(float(MP_STEPS), 10.0, smoothstep(600.0, 2200.0, dist)));`)
  preserves full 32-step fidelity across the hero->shell cross-fade while cutting mid/far shell ray-march cost by ~60%.
- **Chunk & range-cull `AV_CREEPERS`, and spend the saved budget within `0..250 m`:** `AV_CREEPERS` currently draws every curtain across the
  entire `7 km` map in 2 unculled `InstancedMesh`es. Putting creepers into `BIO` chunks (`range: 1400`, `BIO.LOD.fade`) hides invisible
  multi-kilometre curtains and frees budget for **broken-ledge shrubs/ferns on mid-tower tears**, denser plinth-edge root/rubble dressing in
  the nearest `150 m`, and an **adaptive DPR governor** (`1.0..1.5` targeting `>= 50 fps`, since ray-marched shells + hex-tiled ground +
  height fog scale linearly with pixel count on 1440p/4K displays).

---

## 11. What was done with this review (2026-11-09, the valley session)

Each claim below was checked against the code before anything was changed. Commit and verification are in the session's report.

**Applied:**

| Item | Finding, as checked | Change |
|---|---|---|
| 8a | Confirmed: `fallen` mapped to the `stump` look and was shellable | `avCanShell` excludes `fallen`; a fallen tower draws no impostor either (its rubble stands for it) |
| 8b | Confirmed: `avStub` and `impOf` cut the intact skin at `R.top`, `gutted` uncut. The code's own comment says the cut was meant | `avCutTop`: cut at `R.cut`, and `gutted` too where its cut is under the tip |
| 8c | Confirmed: one radius and one box a band | 36-direction outer radii per band for the creepers; roof trees only where an upward face of the drawn ruin lies near the cut (`onRoof`, from the hero's triangles) |
| 8d | Confirmed: design rubble is in the hero group and took the lean | The rubble children take the lean back off |
| 8e.2 | Confirmed: non-shellable heroes stopped at 1 km even where the band is 1.2 km | `d < max(AV_DNEAR, nearR)` |
| Q1 | Agreed | `aBand` is written per instance each tick: the family's band where the hero is held, -1 (an opaque shell) where the pool left none |
| Q2 | Agreed on precision | `camera.near` 0.6 -> 1 m |
| 10a.1 | Confirmed: `AVC.stub` and `avFlat` kept for the page's life | Stubs dropped after their bake; the geometries the stubs own are disposed; shared hero geometries are untouched |

**Not applied yet:**

- **10c (KGROUND's `cameraPosition` on a Lambert ground).** Confirmed: the repository already documents that r128 does not upload
  `cameraPosition` to Lambert materials. The fix is in `core/terrain/43-core-ground.js`, shared by many pages, and every page that takes it must
  be rebuilt. It belongs in its own pass, with the zero-weight layer guard (10c.2), which is in the same file.
- **10a.2 (impostor bake to render targets)** and **10b (core/biome's merge, index and cull switches).** These are core changes that are
  worth doing but larger, and each needs its own verification of the memory it frees.
- **8e.1 (height fog applied before the towers exist).** Confirmed by reading the order. Applying the height fog to the shell material
  needs the traced point for the fog (Q2), so it waits for the shell's fog chunk.
- **8e.3 (150 ms tick lag)** and the **Q1 preload from 0.80 R**: worth trying if the cross-fade still shows a frame of lag after the above.
- **Q4 (plants on `meshH`, ground refined along the carvings)** and **Q5's three checks**: the next floating-flora pass.
- **10d** (rust in a shader chunk, distance-adaptive trace steps, chunked creepers): later passes.
