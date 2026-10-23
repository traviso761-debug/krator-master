# Strata: the plan (draft, 2026-10-23)

The bedded-rock shader (`BIO.strata`, `35-core-strata.js`) moves into `core/terrain` and grows from one sandstone column
into a rock model that the painted highlands, the eastern badlands, the south-eastern desert, Korona's tepuis and any
later layered country share. Owner (2026-10-23): improve the strata the badlands and the desert already have, and add a
tepui recipe.

**Status: plan, awaiting the owner.**

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
| Korona, necanyons | the `tepui` recipe on the tepuis, the hoar table and the caps (optional; each kit decides) |
| Shade, Verge, ringisles, the open worlds | the core path; their look unchanged unless a later step is meant to move it |

## 8. Order of work

- **S1.** Move to `core/terrain`, data and shader split, closed-form warp matched to today's, `S.at`, a node test
  (`core/terrain/test-strata.js`); every user on the core path; the baseline unchanged.
- **S2.** Recipes (`canyon`, `badland`, `danxia`, `tepui`) and formations.
- **S3.** Folds, faults, lateral change; downslope wash; regolith from the bed.
- **S4.** Ledges from hardness (the relief pass) and the close-range ledge shading.
- **S5.** Godot: `strataColor` in a `godot/shaders/lib` include, the column from the same records; a twin test.
- **S6.** Per build (section 7): ebadlands and sedesert first, each rebuilt, checked by eye, its baseline row rewritten
  on purpose (`python3 tools/port_baseline.py`); then the painted highlands' P1.
