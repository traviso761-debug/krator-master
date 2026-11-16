# Strata: the plan (draft, 2026-10-23)

The bedded-rock shader (`BIO.strata`, `35-core-strata.js`) moves into `core/terrain` and grows from one sandstone column
into a rock model that the painted highlands, the eastern badlands, the south-eastern desert, Korona's tepuis and any
later layered country share. Owner (2026-10-23): improve the strata the badlands and the desert already have, and add a
tepui recipe.

**Status (2026-10-26):** S1-S5 are written (`35-core-strata.js`, `host/35-core-strata-shade.js`, `kstrata.gd`,
`godot/shaders/lib/strata.gdshaderinc`; `core/README.md`, "Strata"): the recipes of section 2 and the planned biomes' (`outland`,
`tibasalt`, `tibasalt-ponded`, `megabreccia`/`crest`, `pillar`, `ringfold`, `loess`), formations, folds, faults, the lateral change,
the downslope wash, the cover from the bed, the ledge pass and its close-range line, and the Godot shader, each held to the same
numbers on the CPU, in Godot and on two GPUs. No build is on it yet: S6 (moving sedesert, ebadlands, Shade and the readers onto the core
path, then each look change) is each build's turn in the rebuild, its pixels kept by `BIO.strata`'s legacy path until it moves.
Open: a formation whose base varies from place to place (the W outer wall's loess).

## 0. What there is today

One fragment, `biomes/sedesert/src/35-core-strata.js` (9 KB), byte-identical in `biomes/ebadlands/src` and vendored in
`settlements/shade`; `biomes/ringisles`, `settlements/verge`, `openworld/little-demo` and `openworld/isle-demo` read it
from sedesert. It is good close-up work: a column of beds of irregular thickness baked to a 1 x 1024 texture, a planar
dip and a noise warp, laminae, cross-bedding, colour drifting along each bed, desert varnish, dust on ledges, a bleached
cap. What it lacks:

- **It is not in `core/`**, and it carries its own seeded PRNG and two `x || d` defaults (`opt.seed||4711`,
  `opt.columnM||180`), against CLAUDE.md's rules.
- **Godot does not carry it** (`godot/shaders/ground.gdshader` says so).
- **The warp reads a canvas noise texture**, so only the GPU knows which bed is under a point: nothing on the CPU (a
  painter, a plant pass) can ask what rock it stands on without reading pixels (the `core/mask` rule).
- **One column for every rock**: 46% thick sandstone (2.5-11 m) with cross-bedding and varnish, the canyon look.
  ebadlands works round it by giving every kind of bed a badland colour.
- **It repeats every 120-180 m**, so mountains show the repeat; sedesert's Abyss wall and mountains fall back on the
  painter's own 26 m and 40 m bands (its `KNOWN_ISSUES.md`).
- **Colour only**: hard beds do not stand out as ledges, soft ones are not recessed (sedesert's `KNOWN_ISSUES.md`).
- **Two stratigraphies on one rock**: ebadlands' painter paints its own seven-colour 7 m bands by height under the
  shader's 120 m column; they do not line up.
- One planar dip everywhere; no folds, faults or change across a region.

## 1. The module: `core/terrain/35-core-strata.js`

- **The data side is plain JS** (`[G data]`): recipes, the formation and bed column as records (`{y0, th, kind,
  colour, hardness}`), drawn with `core/rand` (`KRAND`, seeded from the world and a salt, never from draw order), defaults
  as `x == null ? d : x`. Godot builds the same column from the same records.
- **A closed-form warp**: the canvas noise is replaced by a hash noise the GLSL, the JS and Godot compute identically
  (as `core/terrain`'s field does), so `S.at(x, y, z)` gives the bed, its kind, colour and hardness on the CPU, and a node
  test can pin values at known points.
- **The shader side** keeps today's API (`S.inject`, `S.parsFragment`, `strataColor(wp, wn)`, `S.colorAt(y)`) so every
  current user keeps working, plus `S.at` and `S.hardnessAt`.
- **Step 1 changes no pixels**: the fragment moves, the users switch to the core path, the noise is matched to today's,
  and `tools/port_baseline.py` reads `same` for every build that takes it. The look changes come after, page by page.

## 2. Recipes

A recipe gives the kinds of bed, how often each comes, their thickness, palette and hardness, and which effects apply.

| Recipe | Beds | Effects | For |
|---|---|---|---|
| `canyon` | today's column: thick cross-bedded sandstones, thin shales and mudstones, bleached bands, the rare reduced green bed | cross-bedding, varnish, bleached cap | sedesert, Shade, Verge |
| `badland` | thin clays and ash beds (0.3-3 m), many colours in high contrast (pink, cream, gold, grey, maroon, mauve, green-grey, the rare teal), soft | popcorn-clay surface, downslope wash; no varnish, little cross-bedding | ebadlands' mounds, the painted highlands |
| `danxia` | thick red sandstones and conglomerates in alternating colours (red, orange, yellow, white), hard, the softer partings thin | steep walls, ledges, little varnish | the painted highlands' fins and canyon (Zhangye) |
| `rift` | a rift basin's fill over its basement (the owner, 2026-10-23): crystalline basement at the foot; fan gravels and conglomerates; red sandstones; lake marls and **stromatolite limestones** (thin, patchy); **gypsum and salt** from the drying lakes; dark basalt flows and pale ash beds from the vents | ledges at the basalts and limestones, the gypsum soft and recessed (where the caves are), salt crusts weeping at the foot | the rift rim's walls, the Rift kit's trough |
| **`tepui`** | very thick, hard quartzite and quartz sandstone in grey, black and rust (the Roraima beds), thin softer partings; the tops pale and weathered | black algal streaks hanging from every lip where the water runs (as varnish, but black-green), pale crowns, sharp horizontal joints | Korona's tepuis and hoar table, necanyons' caps |

## 3. Formations over beds

Two levels: **formations** tens to hundreds of metres thick, each with its own recipe and tint, and the **beds** inside
them. A formation column (non-repeating over a region's relief, kilometres) picks the recipe at a height; the bed column
of that recipe gives the fine detail. This ends the 120-180 m repeat and gives what reads from afar: the big stripes of a
painted hill, the stacked cliffs of a canyon wall, the tepui's grey table over its rust and black footing.

## 4. Ledges from hardness

The column carries hardness, so a `core/terrain` relief pass (beside `38-core-relief.js`) terraces slopes where rock
shows: steeper in hard beds, eased in soft ones, a bench at the top of each hard bed. Baked into the heightfield, it
ports to Godot for free. At close range a shading line at the top of each hard bed finishes the ledge.

## 5. Structure across a region

- **Folds**: an optional axis, wavelength and amplitude (anticlines and synclines), so ridges carry curved stripes.
- **Faults**: lines that offset the column by a throw, so beds step across them.
- **Lateral change**: a second column blended in over kilometres, so the stack is not the same everywhere.

## 6. The surface

- **Downslope wash**: on gentler slopes the colour comes from a bed a few metres higher, so each band bleeds over the
  slope below it (the Painted Hills).
- **Regolith from the bed**: the dust and loose cover take the local bed's colour, not one dust colour, so popcorn clay
  is its own clay's colour.

## 7. Per build

| Build | Change |
|---|---|
| sedesert | the `canyon` recipe kept; formations for the Abyss wall and the mountains (the painter's private bands go); ledges; the cave's strata once its paint stops reading the coarse field cache |
| ebadlands | the `badland` recipe (the palette workaround goes); the painter samples `S.colorAt` / `S.at` instead of its own 7 m bands; downslope wash; no varnish on clay |
| painted highlands | `badland` and `danxia` formations with folds; flowers placed by `S.at` (each bed favours its own flowers): `biomes/paintedhighlands/PLAN.md` P1 is this work |
| riftrim, rift | the `rift` recipe on the trough's walls and the rim (`biomes/riftrim/PLAN.md` section 4: the caves are cut in its gypsum and limestone) |
| Korona, necanyons | the `tepui` recipe on the tepuis, the hoar table and the caps (optional; each kit decides) |
| Shade, Verge, ringisles, the open worlds | the core path; their look unchanged unless a later step is meant to move it |

## 8. Order of work

- **S1.** Move to `core/terrain`, data and shader split, closed-form warp matched to today's, `S.at`, a node test
  (`core/terrain/test-strata.js`); every user on the core path; the baseline unchanged.
- **S2.** Recipes (`canyon`, `badland`, `danxia`, `rift`, `tepui`) and formations.
- **S3.** Folds, faults, lateral change; downslope wash; regolith from the bed.
- **S4.** Ledges from hardness (the relief pass) and the close-range ledge shading.
- **S5.** Godot: `strataColor` in a `godot/shaders/lib` include, the column from the same records; a twin test.
- **S6.** Per build (section 7): ebadlands and sedesert first, each rebuilt, checked by eye, its baseline row rewritten
  on purpose (`python3 tools/port_baseline.py`); then the painted highlands' P1.

## 9. Varied contacts on the GPU (`35d-core-strata-bake.js`, 2026-11-09)

`KSTRATA.vary` (`35c`) moved contacts on the CPU only; the shaders drew the flat column, so a draped loess's soil bands
did not follow the drape (the W outer wall, Mid Basin). `KSTRATA.varyBake(V, {box, step})` bakes the moved contacts over a
box into an RGBA8 texture (two contacts a texel at 16 bits; only the contacts that move get a channel), `KSTRATA.varyGLSL(B)`
writes `ksVaryYY(xz, v)` (bilinear by hand, V's fix-up, the piecewise-linear remap), and `KSTRATA.varyBakedYY(B, x, y, z)`
is its JS twin on the same bytes. `KSTRATA.varyPatch(fragmentShader, B)` rewrites the strata shader's yy line after
`M.inject`, so the shared shader is not edited. The twin's error against `V.yy` is the bake's contact error (`B.err`,
measured at every cell's centre and edge midpoints) times the local stretch; exact to the 16-bit step for `d`, `plane` and
a `grid` on the bake's lattice; clamped to the edge outside the box. `test-strata-bake.js` runs the GLSL text in
`core/water/glsl-interp.js` against the twin (equal to the last bit), alone and patched into `KSTRATA.GLSL`.

Adopting it:
1. List `35c-core-strata-vary.js` and `35d-core-strata-bake.js` after `35-core-strata.js` (read in place, or `CORE_TERRAIN`).
2. Build the shade from the flat stack (`KSTRATA.shade(V.stack, o)`) and `const B = KSTRATA.varyBake(V, {box, step})` over the
   land the page draws; pick `step` until `B.err` is under the tolerance (a drape's own lattice gives the 16-bit step).
3. In the rock's `onBeforeCompile`: `M.inject(sh); sh.fragmentShader = KSTRATA.varyPatch(sh.fragmentShader, B);
   sh.uniforms.uKSVary = {value: tex}` (a `DataTexture(B.data, B.W, B.H)`, RGBA, NEAREST, no mipmaps), and
   `customProgramCacheKey` with `KSTRATA.varyKey(B)`.
4. Not done: GPU-judged by eye (the GLSL is checked as text only); Godot's `KStrataVary.bake` and `ks_vary_yy` in
   `strata.gdshaderinc` (the twin's arithmetic is the contract).

## 10. Skarn lenses and the rock glaze (`35e-core-strata-skarn.js`, 2026-11-09)

**Skarn** (the NE outer wall's Glass-Skarn Bastion). The plan asked whether `KSTRATA.vary` is enough: it is. Five recipes
are added through `KSTRATA.add` (`skarn`, the mixed column as flat beds; `skarn-marble` the host; `skarn-garnet`,
`skarn-epidote`, `skarn-magnetite` the lenses). `KSTRATA.skarn({seed, base, top, front, lenses, scale})` lays lens horizons
in host marble, each a formation of zero varied thickness except under `pts` bumps at its pods, its two contacts roughened
by `noise` on two channels: each pod pinches out exactly at its rim and swells and necks inside. Pods are zoned from the
front (the intrusion contact, a line or polyline): garnet and magnetite near it, epidote further out. It returns a varied
stack (`V.skarn` lists the lenses and pods as data). Limits: lenses run parallel to the bedding (stratabound), never across
it; a pod's tip tapers smoothly.

**The rock glaze** (Opal Valley's opaline glaze, copper-rose to teal with the sun; the NE wall's pseudotachylite mirrors and
the magnetite's sheen). `KSTRATA.glaze(o)` says which rock glazes (kinds, formations, and faults' bared faces within
`faults` m), in what patches and how thick a film; `KSTRATA.glazeAt(S, G, x, y, z)` gives `{k, thick}`;
`KSTRATA.glazeColour(cosT, thick, ior, sub)` is a thin film's interference tint (Airy, three wavelengths) and
`KSTRATA.glazeGLSL()` the same arithmetic as GLSL. The bark's iridescence (`BIO.iridBarkMat`, the rift's `IRIDBARK`,
`PAL.psyPair`) is a two-colour fresnel mix, so the film is new.

Adopting it:
1. List `35e-core-strata-skarn.js` after `35c-core-strata-vary.js` (the recipes alone need only `35-core-strata.js`).
2. Skarn: `const V = KSTRATA.skarn({seed, base, top, front: {pts}, lenses: 6, scale: 120})`; read it as any varied stack;
   for the GPU, `KSTRATA.varyBake(V, ...)` (section 9). Register the magnetite pods as ore (`V.skarn.lenses`).
3. Glaze: per vertex of the cliff, `KSTRATA.glazeAt(S, G, x, y, z)` into an attribute (k, thick); in the shader
   `c = mix(c, c * (0.35 + 1.3 * ksGlazeColour(dot(N, V), thick, ior, sub)), k)` and a lower roughness where k is high.
4. Not done: judged on a GPU; Godot's `ks_glaze_colour` and a GDScript `glazeAt` (plain data on the stack's export).

## 11. Scale-Model 5.1 Geological Recipes (`35-core-strata.js`, 2026-11-13)

Six strictly additive recipes in `KSTRATA.RECIPES` (`core/terrain/35-core-strata.js`) extend the planetary lithology palette across coastal carbonate platforms, inner-wall contact-metamorphic skarn belts, endorheic strandline basins, radial secondary impact craters, outer rift-shoulder flood basalts, and viscous silicic pancake domes. Because `kstrata.gd` and `host/35-core-strata-shade.js` consume exported `krator-strata` records directly, all six work identically across CPU JS (`S.at`, `S.terrace`, `S.ledge`), Three.js (`KSTRATA.bake` / `KSTRATA.shade`), and Godot (`KStrata.from_export`).

| Recipe | Bed Kinds, Thickness & Hardness | Shader `fx` & Rules | Biome & Showcase Bindings |
|---|---|---|---|
| **`carbonate-shelf`** | `bioclastic` (`p=.38`, `2–5 m`, `hard=.82`, `xbed=.25`), `oolite` (`p=.26`, `2–4.5 m`, `hard=.85`, `xbed=.4`), `marl` (`p=.18`, `0.4–1.4 m`, `hard=.30`, `between`), `visor` (`p=.12`, `0.6–1.8 m`, `hard=.42` wave-cut solution notch), `terrarossa` (`p=.06`, `0.15–0.5 m`, `hard=.20`, `between`); high warm cream/buff albedo (`0xe8dfc8`–`0xf0e8d5`) | `fx: {xbed: .3, varnish: .2, joints: 1, regolith: .5}`; soft `marl`/`visor` under hard `bioclastic`/`oolite` carves overhangs and tidal visors in `S.ledge` | `ringisles` (Kautoa coralgal/rudist reef-bench atolls & Nephtos), `swbay` (low coquina/marl bluffs), `hyperjungle` N shelf (`Port Goto–Crescent`), `crater-drylands` lower benches (`Talon`), `swlowlands` (`klir Rivrh` box-canyon bluffs), `spiderlake` pre-impact basement, `riavalley` / `neo-ozarks` cherty dolomite palisades |
| **`contact-marble`** | `calcite` (`p=.42`, `4–8 m`, `hard=.86`, sugary white `0xedeae2`–`0xf3f0e8`), `bluevein` (`p=.24`, `4–7.5 m`, `hard=.88`, graphite-streaked blue-grey `0xcfd7df`–`0xe4e8ee`), `rosemarble` (`p=.10`, `3.5–6.5 m`, `hard=.85`), `epidote` (`p=.10`, `0.4–1.8 m`, `hard=.90`, pistachio-green, `between`), `garnet` (`p=.08`, `0.4–1.6 m`, `hard=.92`, grossular-red, `between`), `magnetite` (`p=.06`, `0.25–1.2 m`, `hard=.95`, `irid=1`, black specular ore selvage, `between`) | `noRepeat: true`, `fx: {sheen: 1, joints: 1, varnish: .15}`; crisp quarry/scarp vertical jointing + metallic specular glint on `magnetite` selvages (pairs with `35e` `KSTRATA.skarn` where pod lenses are needed) | Inner-wall & rift contact-metamorphic belts: `swbay` (`Almua`–`Voth` harbour cliffs), `cut` (`Dilihan` mouth), `ringisles` (`Tethis` / `Ys` inner-ring contact), `riftrim` / `greenstep` (`Tallwalls` Vrivolci scarp), `korona` (ring-fault trench walls), `copperglacier` (eastern IOCG skarn pass), `seouterwall` (`Jade-Karst Polje` & `Copper-Vein Tarn`) |
| **`evaporite-strand`** | `aragonite` (`p=.32`, `0.5–1.5 m`, `hard=.74`, bright white wave-cemented bench), `tufa` (`p=.20`, `0.4–1.4 m`, `hard=.70`, buff stromatolitic travertine), `gypsum` (`p=.22`, `0.4–1.2 m`, `hard=.48`, selenite crust), `halite` (`p=.16`, `0.4–1.1 m`, `hard=.25`, bright polygonal salt/borate pan), `potash` (`p=.06`, `0.15–0.5 m`, `hard=.18`, rose sylvite parting, `between`), `clay` (`p=.04`, `0.2–0.6 m`, `hard=.15`, `between`) | `noRepeat: true`, `fx: {sheen: 1, regolith: .75, wash: 1.2}`; alternating hard `aragonite`/`tufa` (`>=0.70`) and soft `halite`/`potash` (`<=0.25`) produce crisp `0.4–1.5 m` horizontal wave-cut strandline steps | `nsemiarid` & `dambasins` (`dam` & `dam 2` 360° highstand relic strandlines), `sedesert` (`The Bowl` abyssal salt rings), `catch` (playa/yardang strandlines), `eastabyss` (red-brine margin flats) |
| **`secondary-ejecta`** | `breccia` (`p=.34`, `3–9 m`, `hard=.86`, `xbed=.35`, `jit=.12` chaotic polymictic clast beds), `melt` (`p=.20`, `3–7.5 m`, `hard=.93`, dark vitric impact-melt / suevite sheets), `megaclast` (`p=.18`, `3.5–9 m`, `hard=.88`, pale shocked anorthosite/dolomite boulder horizons), `radial` (`p=.18`, `3–8 m`, `hard=.62`, `xbed=.5`, hummocky ballistic surge ejecta), `fallback` (`p=.10`, `0.5–2 m`, `hard=.30`, `between` rock-flour matrix parting) | `fx: {xbed: .4, varnish: .3, joints: 1, sheen: .5, regolith: .55}`; `3–9 m` chaotic clast-and-melt ledges capped by softer `radial` hummocky ejecta treads (stacks cleanly over `megabreccia` where 60 m Worley blocks form the deep basement) | `spiderlake` (radial secondary crater collar & SW `Hām-Tsēk` breach), `seouterwall` (`Tharn` `D=108 km` secondary crater collar & cryo-fumarole tarn), `copperglacier` (`Copper Tarn` glaciated ejecta collar), `arch` (`Crookshore` twin drowned ejecta bays) |
| **`arch-rift-basalt`** | `colonnade` (`p=.46`, `3–7 m`, `hard=.95`, blue-black tholeiite colonnade tier), `entablature` (`p=.24`, `3–6.5 m`, `hard=.93`, hackly upper tier), `amygdaloid` (`p=.10`, `1.5–3.5 m`, `hard=.55`, zeolite/celadonite vesicular top), `bole` (`p=.14`, `0.3–1.2 m`, `hard=.22`, brick-red baked paleosol interbed, `between`), `serpentinite` (`p=.06`, `1–3 m`, `hard=.60`, waxy emerald-olive slickensided shear lens, `between`) | `fx: {columns: 1, sheen: 1, varnish: .15}`; `hard > 0.92` on `colonnade` & `entablature` triggers hexagonal columns + hackly entablature jointing separated by recessed brick-red `bole` stripes and green `serpentinite` fault lenses | `arch` (`Crookshore` sea-stack horsts & serpentinite shear coves; `Double Delta` onshore basalt horst-gate), `gills` (`White Gills` fault-exhumed detachment serpentinite & electrogenic brucite-pipe windows), outer structural lineaments |
| **`obsidian-pancake`** | `obsidian` (`p=.36`, `2–6 m`, `hard=.90`, `xbed=.35`, `irid=1`, jet-black flow-banded vitreous glass), `rhyodacite` (`p=.28`, `2.5–6 m`, `hard=.88`, `xbed=.4`, devitrified grey-lavender foliated dome core), `perlite` (`p=.18`, `2–4.5 m`, `hard=.58`, pearl-grey hydrated carapace), `pumice` (`p=.14`, `0.8–2.5 m`, `hard=.28`, frothy pale carapace breccia/talus, `between`), `fumarolic` (`p=.04`, `0.3–1.2 m`, `hard=.35`, ochre-silica altered seam, `between`) | `fx: {sheen: 1, xbed: .35, joints: 1, regolith: .45}`; foliated `2–6 m` vitreous obsidian ledges with conchoidal thin-film sheen (`irid=1`) over recessed `pumice` autoclastic talus partings | `firebliss` (5 viscous silicic pancake domes incl. `dome_fb_south`), `godshearth` (resurgent/caldera-margin evolved domes), `throne` (flank cryptodomes & evolved silicic spines), `korona` (5 deep ring-fault trench pancake domes) |
