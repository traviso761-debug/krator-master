# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 13 prompts** (2026-10-26, later: 8 added in sections 15-17 for the gaps that had no prompt, and the rest of those gaps resolved as reuse; 2026-10-26: 29 of the 41 added on 2026-10-23 arrived and are in the library, see `PLAN.md` "Delivered 2026-10-26"; the rest of this paragraph is the history of what was owed). Owed before 2026-10-23: 1 redo (`patterns/tribal/formline`), 1 required (the Northern Highlands' `bark.alder.lichen`) and 4 optional (the Beast Riders' `foliage.thorn.cut`; necanyons' `card.palm.fan`, `card.flametip`, `card.treelily`; each has a library fallback in use). Added 2026-10-23: 1 optional for the Stalkers (`metal.enamel.scoured`, section 7) and 41 for the kits planned that day (sections 8-14: the NW outer wall, the painted highlands, the Cut, the Bowl, the Catch, the rift rim, Farside), each needed before its kit's build. A short list at the end names gaps that have no prompt yet.

Open prompt files elsewhere in this folder (`PROMPTS-ready.md`, `PROMPTS-nomads.md`, `PROMPTS-iziz-beast-riders.md`) are older history; their open rows were copied here.

## How to deliver

- **Name each image after its id** (slashes become folders: `patterns/islander/gable-west.png`). Square 2048 px unless
  the entry says otherwise. A scan that matches is as good as a generated image.
- **Process.** Surfaces and pattern sheets: write a batch file in `tools/textures/batches/` (the exact prompt goes in
  `_source.prompt`, `"pattern": true` for a pattern sheet so it is cropped to its period) and run
  `python3 tools/textures/process.py --batch tools/textures/batches/<delivery>.json "<folder of images>"`. Cut-out
  sheets on magenta go through `tools/textures/cards.py` (its chroma key). Check every set on a contact sheet:
  `python3 tools/textures/preview.py <scratch>/sheet.jpg <set dirs>`.
- **Where sets land:** `core/materials/library/<id>/` or `core/materials/patterns/<culture>/<name>/` (`albedo.jpg`,
  `normal.jpg`, `roughness.png`, `meta.json`). Never commit an original or anything over 1024 px; `meta.json` records the
  source's sha1 and the prompt.
- **Wire it:** add the family to the build's `materials.json`, run `python3 tools/textures/pack.py <build>` (writes
  `<build>/tex/`, commit it), rebuild the build and verify it.
- **Then prune:** delete the entry here, add a line to a "Delivered" log in `PLAN.md`, and close the build's
  `KNOWN_ISSUES.md` item.

Conventions (`PLAN.md`, "Prompts for generated sources" and "Rules, from now"): every block starts with the base
template. **Near-colourless** (tintable) blocks end with the muting sentence and carry no tint hexes: the build's palette
colours them. **Full colour** blocks keep their hexes. Pattern sheets put "a flat, front-on decorative panel" in place of
"perfectly flat surface". Cut-outs are always on solid flat bright magenta (#ff00ff), never grey or white.

---

## 0. Redo: needs another take

Each is the original prompt with a correction at the end. The first take stays installed until the redo arrives.
**2026-10-15:** five of the six redos arrived (all but `patterns/tribal/formline`) and are in the library, **not wired**: each says which build to re-pack. Do those re-packs before the Godot export (`GODOT-PLAN.md`, "Before an export: textures delivered but not wired").

#### `patterns/tribal/formline`
- Installed: Highlands `formF`. Why again: came mirror-symmetric, not periodic: the seam shows a doubled eye pair.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of Northwest-coast formline painting on cedar: bold swelling black (#171311) formlines with ovoids and U-shapes, the inner shapes in red (#b3322a) and teal (#2e9488), on a cedar-wood ground (#b27a4c, shading to #8a5634), hand-painted and slightly worn, the wood grain faintly showing. Abstract: no readable figures. The pattern repeats horizontally. Full colour. Correction: the design must repeat, not mirror: the right half is not a reflection of the left, and the motif at the right edge continues straight into the motif at the left edge.
```

## 1. Beast Riders (optional)

### The Beast Riders kit's tents (`kits/beast-riders`, 2026-10-19)

`kits/beast-riders/KNOWN_ISSUES.md`, "The thorn hedge has no texture of its own": the cut-thorn barrier
(`br_hedge_thorn`, `src/75-br-tents-bounds.js`) is thin branches of geometry with `bark.ironbark` on them as a detail
map. Lands as the family `thorn` in `kits/beast-riders/materials.json` (tinted: the branches keep their two palette
browns); `70-br-tent-kit.js` `BRT_THORN` then reads `'thorn/bark'`.

#### `foliage.thorn.cut`

```
Seamless tileable texture, 2048x2048, front orthographic, flat even lighting, no shadows: a dense tangle of cut, dry thorn-tree branches piled as a livestock barrier (an African boma), seen side-on: grey-brown twisted branches #5a4632 and #7a6446, thin twigs crossing every way, long straight pale thorns #c8b896 in pairs along every twig, a few dead curled leaves #8a7448, small gaps of near-black shadow #1e1812 between the branches. Muted, tintable. Matte. One tile covers 1.5 metres.
```

## 2. Northern Highlands

### The Northern Highlands (`biomes/nhighlands`): the new flora (2026-10-18)

Painted in code today (`biomes/nhighlands/KNOWN_ISSUES.md`, the new flora). The fan-leaf, the moss sleeves, the table
cedar, the serpentwood and the banyan have library candidates already (`card.ginkgo`, `ground.moss001`-`003`,
`card.spruce`, `bark.mossy`, `bark.smooth`): wiring them is the owner's call, no prompt needed.

## 6. necanyons (`biomes/necanyons`, 2026-10-19)

The north-eastern canyons, the hyperjungle's transition to Korona (`biomes/necanyons/PLAN.md` section 6, which lists the
library sets it reuses). The five required images were delivered on 2026-10-19 (see "Delivered 2026-10-19, necanyons"
below); `rock.sandstone.bedded.red` was delivered on 2026-10-18 for Pinnacle Rock and serves here too. The three optional sheets were delivered on 2026-10-25 (card.palm.fan, card.flametip,
card.treelily: PLAN.md, "Delivered 2026-10-25").

## 7. The Stalkers (`kits/mechs`, 2026-10-23; optional)

The two man-sized Stalkers (`st_harpooner`, `st_blade`) wear the kit's `metal.scrap` plate map, three times finer and at a
third of its strength (`kits/mechs/KNOWN_ISSUES.md`, "The Stalkers' shells use the shared maps, finer"). A set of their
own lands as a `plate` map for the `stalker` culture only (the runtime's per-culture material set): add a `plate` override
to the culture's `detail` profile when it is wired.

#### `metal.enamel.scoured`
- Kind: surface, tintable (the shells are white in the vertex colour).
- Used by: the Stalkers' white shells. Reuse: any smooth Ancient machine casing or appliance shell; the Ancient ruins' white panels.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Smooth white enamelled composite casing of an ancient machine, the kind of hard glossy shell a robot or an appliance has, scoured for centuries by blown sand: a very fine even micro-pitting over the whole surface, faint long parallel scratches running one way as if sand-blasted by a steady wind, a few small chips where the enamel has flaked to a pale grey layer underneath, a little fine dust settled in the pits. No panel lines, no seams, no rivets, no markings. Low gloss, smooth to the touch. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 0.5 metres.
```

## 8. NW outer wall (`biomes/nwouterwall`, planned 2026-10-23)

The Yeti Kingdom's high country (`biomes/nwouterwall/PLAN.md` section 8, which lists the library sets it reuses:
`ground.tundra`, `ground.turf.polygon`, `ground.sphagnum`, `ground.lichen.crust`, the snows and ices, `card.lichen`,
`card.moss.hanging` and `card.beard` for the larch beard, `card.pine`, `card.spruce`, `card.stipa` for the plumegrass,
`card.heath`, `surface.cushion` for the cushions, the birch barks). Needed before the kit's N2.

## 9. Painted highlands (`biomes/paintedhighlands`, planned 2026-10-23)

The banded plateau by Korona (`biomes/paintedhighlands/PLAN.md` section 5, which lists the library sets it reuses). One
greyscale bedded tile tinted by the strata field (cheaper, preferred), and the bloom's flowers.

## 10. The Cut (`biomes/cut`, planned 2026-10-23)

The eigenweapon's bowl and its warped flora (`biomes/cut/PLAN.md`). Reuse: `bark.bamboo.jade` for the hyperbamboo's
culms (scaled up), `ground.salt` and `ground.efflorescence` on the flats, the NW lowlands' sets for the floor's forest.

## 11. The Bowl (`biomes/sedesert`, `PLAN-BOWL.md`, planned 2026-10-23)

The abyssal salt lake in the eastern desert. Reuse: `ground.salt`, `ground.efflorescence`, `ground.playa.red`,
`ground.clay.popcorn`, `card.tamarisk`, `bark.saxaul`, `card.samphire` for the glasswort (green; tint its crimson), the
kit's own sets. The banded shallows are water tints, not a texture.

#### `ground.salt.ochre`
- Kind: surface, full colour.
- Used by: the ochre salt rim round the Bowl's lake. Reuse: any iron-stained salt rim or evaporite crust.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Salt crust at the edge of a hypersaline lake seen from directly above: a hard crust of salt in low polygonal ridges, stained ochre and rust (#c89a5a, #b87a3a) where iron-rich brine has dried, paler cream-white salt (#e8e0cc) on the ridge tops, a few small pink-orange stains (#d89070) of salt-loving algae in the hollows. Full colour. One tile covers 2 metres.
```

## 12. The Catch (`biomes/catch`, planned 2026-10-23)

The sealed basin, its sand sea, its five oases and its salt (`biomes/catch/PLAN.md`). Reuse: `rock.yardang.silt` (above)
for the lake beds, `card.tamarisk`, `card.reed`, `ground.gravel019` and `ground.gravel042` for the reg, `card.saltbush`
(above) on the fans.

## 13. The rift rim (`biomes/riftrim`, planned 2026-10-23)

The three rims (`biomes/riftrim/PLAN.md` section 3 and 10). Reuse: `card.rheumleaf` for the rimroot, `card.fin.membrane`
for the sailwort (tinted rust), `card.moss.hanging` and `card.beard` for the veil thread (tinted copper), `card.heath` for
the prism heath (the kit tints it by season), `ground.sphagnum` for the moor sponge, `card.groundsel`, `ground.tundra`,
`ground.lichen.crust`, the snows and ices, and the Rift's, the SW lowlands' and the S highlands' own sets for the borrowed
species.

#### `card.fin.glass`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one fin cluster per cell.
- Used by: the frost frill's translucent fins. Reuse: any glassy, translucent leaf or fin (light-piping alien plants).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a whorl of three to five short stiff fins radiating from a stub on the bottom of its cell, each fin a thin pointed blade like a fin of ice: translucent pale teal glass (#a8d8d8) with clearer edges (#d8f0f0), fine darker veins (#4a8a8c) running from base to tip, the light passing through it. Vary the length and angle of the fins. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

## 14. Farside (`biomes/farside`, planned 2026-10-23)

The ocean coast where the sea's plants are invading the land (`biomes/farside/PLAN.md` section 9, which lists the many
marine sets the library already has: the kelp cards, seaweed, seagrass, reef and coral sets).

## 15. Crop and garden cards: the Ring Sea isles and Guilin (2026-10-26)

`biomes/ringisles/KNOWN_ISSUES.md` (rice and cane blades procedural; greens and sweet potato on a wrong `card.paddle` cell)
and `biomes/guilin/KNOWN_ISSUES.md`, "No cards of its own" and "The plain's grass". Each card stands upright on the bottom
of its cell (the clump quads draw v up). Reuse, so no prompt: the banana's leaves are `card.paddle` turned upright in code
(`libCell(..., rot)`, as the crater drylands do); Guilin's bamboo leaves take `card.bamboo.giant` (in the library since
2026-10-26); its lotus pads `card.lotus` and `ground.lilypond`; its osmanthus `card.croptree.glossy`; its ferns and moss
`card.fern.green`, `card.fern`, `card.moss`.

#### `card.crop.rice`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one clump per cell, upright.
- Used by: the Ring Sea isles' paddies (`crop-rice`), Guilin's rice. Reuse: `kits/crops` rice in every paddy country; any upright tufted grass in water.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no water, no text. Each sprite: one clump of paddy rice (Oryza sativa) standing upright on the bottom of its cell, all its blades rising from a single narrow base: on three cells, young tufts of short bright green blades (#7aa844); on three, full-grown clumps of long narrow green blades (#6a9a3a, #88b04a) arching outward near the tips; on three, ripe clumps whose leaves are yellowing (#b0a848) and whose heavy golden panicles of grain (#c8b45a, #d4c062) droop over to one side. Vary the height and spread. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.crop.cane`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one stand per cell, upright.
- Used by: the Ring Sea isles' sugar cane (`crop-sugarcane`). Reuse: sugar cane anywhere in `kits/crops`; giant reed (Arundo) and sorghum stands; any tall jointed cane grass (`card.crop` stays the broad strap-leaf crops and maize).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one stand of sugar cane (Saccharum officinarum) standing upright on the bottom of its cell: four to eight thick jointed canes (#a89a5a, #8a9a4a) with pale rings at the nodes, rising straight and a little apart, long narrow strap leaves (#7a9a44, #88a84e) springing from the upper half and arching outward and down, dry brown leaves (#a08a5a) hanging against the lower canes. On three of the nine, a silvery-white feathery tassel (#e0dccc) at the top. Vary the height and the number of canes. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.crop.greens`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell, upright.
- Used by: the Ring Sea isles' greens (`crop-greens`) and sweet potato beds (`crop-sweetpotato`), which take `card.paddle`'s elephant-ear cell today. Reuse: the `greens` bucket of `kits/crops` in every kitchen garden; any sweet potato or morning-glory vine on the ground.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one leafy vegetable plant standing on the bottom of its cell, seen from the side and a little above, a different plant in each: bok choy with white stalks and dark green spoon leaves (#3e6a2e); a loose head of frilly mustard greens (#6aa040); slippery cabbage (aibika) with deeply lobed hand-shaped leaves (#4e7a30); water spinach (kangkong) with hollow stems and long arrow-shaped leaves (#5a9038); a bushy amaranth with oval leaves (#6a9a3a); a low leaf lettuce (#8ab858). On the last three cells, a mound of sweet potato vine: trailing stems with heart-shaped and three-lobed leaves (#4e7a30, #5a8636), the stems and young leaves a dull red-brown (#6a4a3a). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.orchid.dendrobium`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one orchid per cell.
- Used by: Guilin's stone orchid on the karst. Reuse: any epiphytic orchid on bark or rock (the hyperjungle, the cloud forests, the NW lowlands).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no rock, no text. Each sprite: one clump of a stone orchid (Dendrobium) growing from the bottom of its cell as it would from a crack in a rock: a tuft of thin jointed cane-like stems (#8a9a4a, #a8a060) leaning outward, narrow leathery leaves (#4a7a34) along their upper parts, grey-white aerial roots (#c8c4b4) at the base, and on six of the nine short sprays of flowers in creamy white (#f4f0e0) and pale yellow (#e8d870), each flower with a small deep orange-brown spot on its lip (#a8582a). Vary the length and lean of the canes. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `ground.grass.lush`
- Kind: surface, full colour.
- Used by: Guilin's plain (`ground.leafy_grass` greened in its shader today). Reuse: any well-watered lowland meadow, pasture or lawn; the paddy bunds of the Ring Sea isles; the NW and SW lowlands' pastures.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Lush, short, well-watered green grass of a rice-growing plain seen from directly above: dense fine blades in fresh green (#5a9a3a, #7ab048) with a few broader darker blades (#4a7a30), scattered clover leaves and small creeping weeds, a little damp dark soil (#3a3424) in a few small gaps. No flowers, no paths, no bare patches, no dry yellow grass. Matte. Full colour. One tile covers 1.5 metres.
```

## 16. Catalog hangings: the Screamers (the Eastern Abyss reuses a set) (2026-10-26)

`PLAN.md`, catalog audit, "No pattern sheet at all". Style read of `kits/catalog/krator-master-furniture-screamer.js`:
the tapestry kind is `figure` ("Painted hide hanging"), motif `dots`, the court's `skull`, cloth family `hide`; palette
feather red #c8342a, yellow #e0b030, blue #2a6aa0, hide tan #9a7a52, black #2a2622, bone #e6dcc6. Lands as
`patterns/screamers/hide-figure` (a `tapestry` row in the Screamers' and the catalog's `materials.json`).
**Eastern Abyss, reuse, so no prompt:** its hanging is `grid` with the `lozenge` motif in indigo, saffron, madder, white
and turquoise (`krator-master-furniture-eastabyss.js`), which is `patterns/common/kilim-star` (a stepped-diamond kilim in
madder, saffron, teal, indigo and cream); its mosaic panel takes `patterns/common/mosaic-star-lapis` or `zellige-blue`.
(Nomad has `patterns/nomad/` and the Lizardmen `patterns/lizardmen/`: both delivered.)

#### `patterns/screamers/hide-figure`
- Kind: pattern sheet, a single motif, full colour.
- Used by: the Screamers' painted hide hangings and hide screens (catalog culture `screamer`). Reuse: any tribal painted hide (a shield face, a drum head, a hide door in the Beast Riders' or the Highlands' tribal set).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. Material: Flat, front-on decorative panel of a stretched, scraped animal hide (#9a7a52, paler #b8986a where it is thin, darker #6a5238 toward its edges) painted by hand with fingertips and a frayed stick: in the middle one stick figure of a person with both arms flung up and its mouth a wide open ring, as if screaming, in black (#2a2622) outlined in bone white (#e6dcc6); round it rings and rows of round dots in red ochre (#c8342a), yellow (#e0b030) and blue (#2a6aa0); along all four edges a border of dots and short tally strokes. The paint is cracked and flaking a little, the hide's pores and a few healed scars showing through it. Naive, primitive body-paint style, as on an Amazonian shield: no realistic anatomy, no letters, no readable signs. A single motif filling the frame, not a repeat. Full colour.
```

## 17. The shared detail sets (`detail.*`, for the record's `detail` field) (2026-10-26)

`PLAN.md`, "From spiderbench": a tiling micro-relief normal blended over the base normal at close range, one shared set
per surface kind for every culture. The field is not built yet (`TODO.md`), so these are the lowest priority: deliver them
before it is. They are relief only: near-uniform, with no feature that would show when a tile repeats every 25 cm.
**Metal brush, reuse, so no prompt:** `metal.steel.brushed` (its normal, at a finer tile).

#### `detail.plaster.grain`
- Kind: surface, tintable (only its normal is used).
- Used by: the `detail` normal of every plaster, render, stucco and limewash record. Reuse: adobe and earth walls at close range.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Fine lime plaster seen flat-on at very close range: an even micro-texture of tiny trowel ripples, fine sand grains and pinholes, all of the same small size and spread evenly over the whole frame, with no cracks, no stains, no patches, no joints and nothing larger than a few millimetres, so that no spot is recognisable when the tile repeats. Near-uniform light grey: the relief only. Matte. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 0.25 metres.
```

#### `detail.stone.grain`
- Kind: surface, tintable (only its normal is used).
- Used by: the `detail` normal of every cut stone, ashlar, paving and concrete record. Reuse: rock faces at close range.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The dressed face of a fine-grained sandstone block seen flat-on at very close range: an even granular micro-relief of mineral grains, tiny pits and a faint fine chisel stipple, all of the same small size and spread evenly over the whole frame, with no joints, no edges, no veins, no cracks, no stains and nothing larger than a few millimetres, so that no spot is recognisable when the tile repeats. Near-uniform mid grey: the relief only. Matte. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 0.25 metres.
```

## Gaps resolved without a prompt (2026-10-26)

Each was on the old "Gaps with no prompt yet" list or in a build's notes; an existing set covers it, so the work left is
wiring (a `materials.json` row and code), not an image.

- **The Iziz Vernacular's trade surfaces** (`settlements/iziz/KNOWN_ISSUES.md`, the trades round): the dyed cloth lengths
  take `cloth.weave.plain` (or `cloth.plain`) tinted per dye, in place of the tinted tarp; the crags of the mine and the
  quarry take `rock.rock_face` on world UVs (the city's `cityRock` family already maps it); the mill race and the moat
  landings want `core/water`'s shader, not a map (`kits/catalog` notes water "wants the shader, not a map").
- **The Throne's drawn details** (`PLAN.md`, The Throne): the star aloe's head and the trumpet tree's funnels were
  delivered on 2026-10-06 (`card.flower.staraloe`, `organic.funnel.trumpet`; `meta.json` says in use); the mat's veins
  take `organic.flesh.cells` (cells parted by pale veins) as a grey detail map, the veins tinted by the instance colour,
  over `ground.mycelium.crimson`; the lamp caps' dishes take `organic.fungus.gill` (radial gills, mapped from above) as a
  grey detail under the glow; the frill pods are only the no-pack fallback of the ruff (`55-biome-throne-trees.js`
  `ruffAt`: with the pack it draws `card.frond.frill`).
- **Dhelv's spur walls** (`settlements/dhelv/KNOWN_ISSUES.md`, "a jointed basalt colonnade would suit"): `rock.columnar`
  or `rock.basalt.polygonal`.
- **Ys's Ancient tower panels** (`settlements/ys/KNOWN_ISSUES.md`, "no prompt for them yet"): `concrete.ancient`,
  `concrete.ancient.b`, `metal.ancient.white` and `concrete.rust.streaked`.
- **The crops kit's fibre cards** (`kits/crops/FIBRE.md` section 5: cotton, flax, nettle): delivered as
  `card.crop.cotton`, `card.crop.flax` and `card.crop.nettle`.
- **The mechs' feathers** (`kits/mechs/KNOWN_ISSUES.md`): `card.feather.archae` and `card.feather.crest` exist; the gap is
  UVs on the feather triangles, not an image.

## Gaps with no prompt yet

Owed, but a prompt waits on something first; listed so they are not lost. (2026-10-26: the five gaps listed here were
prompted in sections 15-17 or resolved above.)

- **The Eternian kit's list** (`kits/eternian/PLAN.md` section 10): its prompts wait for the owner to agree the list. Most
  of it is in the library already (`roof.tile.celadon`, `ceramic.celadon.crackle`, `stone.alabaster`,
  `metal.bronze.verdigris`, `concrete.block.relief`, `patterns/eternian/`); a pale buff brick with lime mortar is the one
  surface with no set seen by name (the bronze tracery cut-out not checked against `patterns/eternian/screen-pierced`).
