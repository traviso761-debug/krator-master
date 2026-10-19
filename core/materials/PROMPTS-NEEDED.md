# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. Nothing in sections 1 to 3 is in `core/materials/library/` or `core/materials/patterns/` on any branch
or worktree (checked 2026-10-14; the two redos in section 3 replace sets that came unusable), and no "Delivered" log in `PLAN.md` or `PROMPTS-ready.md` covers it.

**Count: 7 prompts, and 3 optional: section 1 (the Iziz palace citadel's six, 2026-10-19), section 2 (the Northern Highlands' `bark.alder.lichen`), and section 6's three optional (necanyons).** Korona's nineteen were delivered 2026-10-19 ("Delivered 2026-10-19, Korona"), the Oidong Valley's thirteen and the Northern Highlands' staghorn and sun-wheel the same day ("Delivered 2026-10-19"), necanyons' five required ones too ("Delivered 2026-10-19, necanyons"). Sections 4 and 5 were delivered on 2026-10-18 ("Delivered 2026-10-18, the Beast Riders kit and two more"). Everything in sections 1 to 3 was delivered on 2026-10-18 (`tex2.zip`, see "Delivered 2026-10-18"). A short list at the end names gaps that have no prompt yet.

This file replaces the scattered "still owed" lists as the place to look. The prompts were gathered from
`PLAN.md` ("Prompts for generated sources" and the audits below it), `PROMPTS-ready.md`, `PROMPTS-nomads.md`,
`PROMPTS-iziz-beast-riders.md`, `settlements/ys/MATERIAL-PROMPTS.md`, every `KNOWN_ISSUES.md`, `TODO.md` and
`tools/textures/HANDOFF-local.md`. Those files are now history: their open rows are copied here.

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

## 0. Redo: delivered 2026-10-14, needs another take

Each is the original prompt with a correction at the end. The first take stays installed until the redo arrives.
**2026-10-15:** five of the six redos arrived (all but `patterns/tribal/formline`) and are in the library, **not wired**: each says which build to re-pack. Do those re-packs before the Godot export (`GODOT-PLAN.md`, "Before an export: textures delivered but not wired").

#### `patterns/tribal/formline`
- Installed: Highlands `formF`. Why again: came mirror-symmetric, not periodic: the seam shows a doubled eye pair.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of Northwest-coast formline painting on cedar: bold swelling black (#171311) formlines with ovoids and U-shapes, the inner shapes in red (#b3322a) and teal (#2e9488), on a cedar-wood ground (#b27a4c, shading to #8a5634), hand-painted and slightly worn, the wood grain faintly showing. Abstract: no readable figures. The pattern repeats horizontally. Full colour. Correction: the design must repeat, not mirror: the right half is not a reflection of the left, and the motif at the right edge continues straight into the motif at the left edge.
```

#### `ground.travertine.white`
- Installed: the geyser `ground.tufa`. Why again: turquoise water was painted in the pools (the shader lays the water).
- **Redo delivered 2026-10-15** (`Downloads/vothtex.zip`, "Dry Travertine Terrace Texture.png"; batch `redos-2026-10-15.json`): in `library/ground.travertine.white`, replacing the first take. **Not wired:** `biomes/geyser/tex/` still holds the first take. Re-pack it (`python3 tools/textures/pack.py biomes/geyser`), rebuild and verify **before the Godot export**.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Travertine terraces seen from directly above, like Pamukkale: bright white calcite (#f2f0ea) laid down by flowing spring water in scalloped rimstone dams, each dam a smooth rounded lip a hand wide curving in lobes, its outer face draped with fine vertical drip ridges and small stalactite fringes; between the dams shallow pools of pale milky turquoise water (#9ad8d8) over a smooth white floor; faint cream (#e8dcc0) and pale orange-brown (#c8905a) stains where the water slows. Full colour. Correction: the pools are empty and dry: bare white and cream crust in the hollows, no water, no turquoise, no reflections.
```

#### `hide.sleek`
- Installed: fauna `sleek`. Why again: came mid-brown (installed muted 0.8); the vertex colour gives the hue.
- **Redo delivered 2026-10-15** ("Seamless Grayscale Fur Texture.png"): in `library/hide.sleek`, neutral grey, processed with no muting (the first take needed 0.8). **Not wired:** re-pack `kits/fauna` (and drop its `sleek` mute if it carries one), rebuild and verify **before the Godot export**.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Short sleek animal coat seen close up, as on a horse or a deer: very short dense glossy hairs all lying in one direction, faint swirls where the hair changes direction, a soft sheen along the hair, no spots, stripes or markings. Light neutral warm grey-tan so it can be tinted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Correction: neutral mid-grey (#8a8a8a), fully desaturated: no brown, tan or warm cast; only the light and dark of the hide.
```

#### `patterns/islander/storyboard`
- Installed: Islanders `patStory`. Why again: one frigate bird is cut by the left/right seam.
- **Redo delivered 2026-10-15** ("Polynesian Canoe and Sea Life Mural.png"): in `patterns/islander/storyboard`; the figures sit clear of the seams. **Not wired:** re-pack `kits/islanders`, rebuild and verify **before the Godot export**.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Palauan bai storyboard, a carved and painted gable relief in two registers between black and white toothed bands: in the upper register a red canoe with five black paddlers under a white full moon, in the lower one red and white fish and black frigate birds in flight, outlined black (#1e1a18) on an ochre (#c8922e) ground, the relief shallow and hand-cut. The pattern repeats horizontally. Full colour. Correction: every figure whole inside the frame, none touching or crossing an edge; a strip of plain ground runs along the left and right edges so the seam falls on empty ground.
```

#### `patterns/common/grime-streaks`
- Installed: the breakup hook's `grime` parameter. Why again: came as 20 x 8 cells, dark on white (asked: 16 x 8 on transparent).
- **Redo delivered 2026-10-15** ("Grayscale Drip Texture Grid.png", on magenta): keyed to white and processed into `patterns/common/grime-streaks` (the installed form: dark on white). **It is 20 columns by 8 rows again**, not the 16 by 8 asked: whatever reads it must take 20 x 8. No build on this branch packs it yet; wire it (the break-up hook's `grime`) **before the Godot export**.

```
A sheet of 128 separate grime streak masks in a grid of 16 columns by 8 rows, square, 2048x2048, each cell twice as tall as it is wide, on a solid flat pure white background. Front-on, flat, even, shadowless lighting; no text, no border, no grid lines. Each cell holds one vertical stain as on a wall below a window sill or a cornice: it starts at the top edge of its cell as a soft band and runs down, fading out before the bottom edge, nothing crossing into the next cell. Vary them: soot, damp, rust run-off, narrow drips, wide washes, single, forked and several parallel runs, some short, some long. Greyscale only, from pale grey to near-black where the stain is strongest, no colour at all. Correction: exactly 16 columns by 8 rows of separate streaks, each in its own cell with a margin, on a solid magenta (#ff00ff) ground, no white.
```

#### `patterns/islander/gable-east-b`
- Installed: Islanders `patGableE2` (the great uma). Why again: drifts: no exact period, a soft seam.
- **Redo delivered 2026-10-15** ("Seamless Geometric Bamboo Weave.png"): in `patterns/islander/gable-east-b`, an exact period both ways. **Not wired:** re-pack `kits/islanders` (`patGableE2`), rebuild and verify **before the Godot export**.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a woven split-bamboo house facade as on an Ede or Sumba house: a cream (#e6d8b8) woven field in horizontal bands, alternating rows of large nested diamonds in black (#1e1a18) and ochre (#c8922e) with a small dark red (#6e1a12) heart, and rows of triple zigzag lines, thin black bands between the rows, visible weave in every strip. The pattern repeats horizontally. Full colour. Correction: exactly three diamonds across and two rows down, the repeat lining up exactly at the edges, no drift in spacing or size across the image.
```
## 1. Visibly worse without (open in a KNOWN_ISSUES)

### The geyser basin (`biomes/geyser`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

`biomes/geyser/KNOWN_ISSUES.md`: "Six surfaces are procedural until the owner's textures arrive." The two surfaces' stand-ins
are rows in `biomes/geyser/materials.json` (swap their `lib`); the four cards are the kit's own slots. `PLAN.md`, "The
geyser basin", has each set's reuse.

### The Fauna kit (`kits/fauna`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

### The Islanders kit (`kits/islanders`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

`kits/islanders/KNOWN_ISSUES.md`: "The painted motifs are canvas stand-ins" (`28-is-paint.js`), and "no hinggi sheet yet".
Full colour. Palette `ISP_C`: red earth #9a2a1e, dark red #6e1a12, black #1e1a18, white #efe6d2, ochre #c8922e, sea teal
#2a7a7a, sand #c49a5a, bark #8a5a32, cream #e6d8b8. Each sheet lands at `patterns/islander/<name>`; add its family key
(below) to `kits/islanders/materials.json` and repack: the canvas is then never drawn (`KIT_HAS`), no code change.

### The Scyvoi kit (`kits/scyvoi`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

### Iziz (`settlements/iziz`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

`settlements/iziz/KNOWN_ISSUES.md`, "Two surfaces have no good library texture" (the second material pilot, 2026-10-13).
Both near-colourless, tinted.

### The Iziz palace citadel (`settlements/iziz`, the palace page, 2026-10-19)

The palace page (`settlements/iziz/targets/palace`, `dist/iziz-palace.html`) draws its finishes from the library
(`settlements/iziz/palace/materials.json`: marble ashlar, the Iziz mosaics and tile, the gilt band, gold leaf, stucco,
mahogany, the sun banner, the Ancients' panel and concrete, two floor medallions). These six it has no set for
(`settlements/iziz/KNOWN_ISSUES.md`, "The palace citadel's interior: first pass"). Each lands in the library or
`patterns/iziz/`; add its family to `settlements/iziz/palace/materials.json`, run
`python3 tools/textures/pack.py settlements/iziz/palace`, and wire it in `targets/palace/78r-palace-draw.js` (the note
under each says where).

#### `patterns/iziz/coffer`
- Kind: tileable pattern, full colour; one coffer per 2.4 m tile. The sumptuous rooms' ceilings (the Aula, the Hangar
  Hall's neighbours, the emperor's rooms, the state galleries): today cream stucco crossed by plain gold ribs.
- Wire: `palCoffer` on the decor-4 ceiling slab in `78r` `storey()` (the coffer ribs then go).
- Reuse: any Art Deco or Roman coffered ceiling: Talia's halls, Voth's state rooms, a Xanadu dome's soffit.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: One square coffer of an Art Deco palace ceiling seen from directly below, filling the tile: a deep stepped frame of three receding gilded mouldings (#d4a640, #b8862a) with fine chevron and bead ornament, the sunken centre field in deep teal plaster (#1f6e6a) with a small gilded sixteen-rayed sun rosette (#e0b050) and a thin cream (#f3e2c0) inner border, the ribs between coffers in cream plaster with a gilt fillet. The pattern repeats exactly one coffer across and one down. Full colour (do not mute).
```

#### `patterns/iziz/bronze-door`
- Kind: single sheet, full colour, portrait 1024x2560 (one door leaf). The state rooms' open bronze leaves (`78r`
  `doorFrame`: plain dark bronze boxes today) and the great door between the Hangar Hall and the Aula.
- Wire: a `palDoorLeaf` kit item (a box whose front face carries the whole sheet, no world UVs, like `palMedalB`) in place
  of `izBronzeD` for decor-4 leaves.
- Reuse: any cast bronze door: Talia's cathedral, the Ancients kit's reclaimed vaults, Voth's palace gate.

```
A flat, front-on decorative panel, portrait, 1024x2560. Orthographic, flat even shadowless lighting, no cast shadows, no perspective, no text, no border, no watermark. A single composition, not a repeating tile: clear margin of plain dark background round it. Material: One leaf of a monumental cast bronze door in Art Deco style, seen straight on: a tall rectangle divided into five stacked panels by raised bronze rails studded with round bosses; the top panel a half sunburst of sixteen stepped rays rising from the bottom edge, the middle panels stepped chevrons and fluted columns in low relief, the bottom panel a kneeling figure holding up an orb; warm dark bronze (#6e4a22) with a thin brown patina, the raised edges polished bright (#c8962a), a little green verdigris (#4a8a70) in the deepest hollows. Full colour (do not mute).
```

#### `patterns/iziz/crater-map`
- Kind: single sheet, full colour, square 2048x2048. The Map of the Empire (the tower's first floor: "the whole crater
  inlaid in the floor; the legions as bronze markers", BLUEPRINT.md I5), and the map tables' tops.
- Wire: a floor medallion in the tower's map room (`78r` floors: `palMapB`, the way `palMedalB` is laid).
- Reuse: any map floor or map table of the Iziz Empire; a wall map in the Praetorium.

```
A flat, front-on decorative panel, square, 2048x2048. Orthographic, flat even shadowless lighting, no cast shadows, no perspective, no text, no border, no watermark. A single composition, not a repeating tile: clear margin of plain cream marble round it. Material: A floor map inlaid in coloured marble and bronze, seen from directly above: a great round crater about four fifths of the frame across, its rim a ring of reddish-brown stone (#8a5a3a) with mountain ridges picked out in darker veins, the crater floor green-grey jungle marble (#5a7a5a) crossed by blue-grey river channels (#5a7a8a) running to a dark lake near the centre (#2a4a5a); cities as gilt studs (#d4a640) with small gilt rings round the largest, roads as thin bronze lines between them, a sixteen-rayed sun compass rose in gilt at one edge, a border of cream marble (#efe3c8) with an orange chevron band (#e07a2a). No lettering. Full colour (do not mute).
```

#### `patterns/iziz/fresco-legions`
- Kind: tileable pattern, full colour, landscape 2048x1024 (repeats left to right); 4 m across, 2 m high. A painted frieze
  for the feast rooms and the Hall of the Standards (the triclinium, the Hangar Hall's flanks, the Praetorium), above the
  dado where the sun-banner frieze runs today.
- Wire: `palFresco` as the decor-3 and decor-4 frieze in `78r` `style()` for the feast and trophy kinds.
- Reuse: any Roman-style painted frieze: a Talia or Xanadu banquet hall.

```
Seamless tileable texture, landscape, 2048x1024. Orthographic, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no text, no border, no watermark. The left edge must continue into the right edge. Material: A Roman fresco frieze in an Art Deco hand, painted on smooth plaster with slight age crazing: a procession of legionaries in orange tunics and bronze helmets carrying sun-disc standards, two tall walking war machines (mechs) in white and orange plates striding among them, palm trees and a stepped pyramid behind, against a warm cream ground (#efe0c0); a deep red (#9c2d2d) band below and a teal (#2f8f8a) band with a gilt fillet above. Flat matte fresco colours, a little faded. Full colour (do not mute).
```

#### `metal.deck.hangar`
- Kind: tileable material, near-colourless (tinted by the build); 4 m tile. The Depot's floors (the mech bays, the
  concourse, the repair shop, the forge: Ancient concrete today) and the Hangar Lift's surround.
- Wire: `palDeck` (family in `palace/materials.json`) as the floor of the Ancient level's work kinds in `78r` `style()`.
- Reuse: any hangar, dock or vehicle bay floor: Girder's yards, the motor-vehicles kit's garages, the Ancients kit's depots.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Heavy steel hangar deck plates, each about 2 m square, set in a grid with recessed welded seams: a fine raised diamond tread on every plate, flush round tie-down rings set into the plate corners, scuffed tyre and footpad marks, oil stains and a little dust in the seams, faint worn remains of painted guide lines along one seam. Neutral mid grey steel only. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `cloth.damask.court`
- Kind: tileable material, near-colourless (the piece's colour tints it); 0.6 m tile. The court tier's cloth (hangings,
  upholstery, the baldachins, the runner, the carpets): the catalog's `cloth` family is plain silk today, so the court's
  crimson and gold read as flat paint at arm's length.
- Wire: a `damask` family in `kits/catalog/materials.json` and a `FAMILY_SPLITS` row in `kits/catalog/krator-furniture-core.js`
  routing the court cloth keys (`clothGold`, `clothCrimson`) to it. That is a catalog-wide change: every build that bundles
  the detail maps (`tex=True`) gains it, so rebuild those (`CLAUDE.md`, "Rebuild what a shared change reaches").
- Reuse: every culture's court cloth (Voth, Xanadu, Talia, Islanders' palace).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Woven silk damask, the pattern in the weave alone: a repeating figure of a sixteen-rayed sun inside a stepped Art Deco lozenge, with chevron borders between the lozenges, the figure in a glossy satin weave and the ground in a matte twill so the design shows only by its sheen; fine visible threads, a slight softness and a few faint creases. Pale grey only, one colour. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

### The Resources kit (`kits/resources`)

`kits/resources/KNOWN_ISSUES.md`: "The veins, crusts, seams, pools and grains are vertex colours on simple shapes: the
library has no ore or mineral sets". The nodes are boxes and ellipsoids, so a set is laid on the face that shows the
mineral (a seam band, a crust patch, a pool rim): each lands as a family in `kits/resources/materials.json`, and
`44r-res-nodes.js` draws that face with its key in place of `plain` (a small code change per kind, after delivery). Full
colour: the colour is the point. Sulfur needs no image: `ground.sulphur` is in the library (wired 2026-10-15).

### The Ring Sea isles biome (`biomes/ringisles`)

`biomes/ringisles/KNOWN_ISSUES.md`, "Stand-ins": the lagoon floor, the reef, the coral and seven leaf cards are procedural or near library sets. Each lands as a family in `biomes/ringisles/materials.json` (a card through `BIO.libSwap`). The banana, rice, cane and greens leaves have no prompt yet (see "Gaps with no prompt yet").

### The Beast Riders kit's tents (`kits/beast-riders`, 2026-10-19)

`kits/beast-riders/KNOWN_ISSUES.md`, "The thorn hedge has no texture of its own": the cut-thorn barrier
(`br_hedge_thorn`, `src/75-br-tents-bounds.js`) is thin branches of geometry with `bark.ironbark` on them as a detail
map. Lands as the family `thorn` in `kits/beast-riders/materials.json` (tinted: the branches keep their two palette
browns); `70-br-tent-kit.js` `BRT_THORN` then reads `'thorn/bark'`.

#### `foliage.thorn.cut`

```
Seamless tileable texture, 2048x2048, front orthographic, flat even lighting, no shadows: a dense tangle of cut, dry thorn-tree branches piled as a livestock barrier (an African boma), seen side-on: grey-brown twisted branches #5a4632 and #7a6446, thin twigs crossing every way, long straight pale thorns #c8b896 in pairs along every twig, a few dead curled leaves #8a7448, small gaps of near-black shadow #1e1812 between the branches. Muted, tintable. Matte. One tile covers 1.5 metres.
```

## 2. Still owed (no open known issue; the build draws its own today)

### Highlands (`settlements/highlands`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

The two other harlequin colourways in the source (`73b-hl-frame.js:239-240`, `hlHarl(ground, diamond, seam)`); only the
green one (`patterns/highlands/harlequin`, `hHarlG`) was delivered. Glazed roof tile on the tents (`hTentHR`, `hTentHG`)
and the bulb domes (`hBulbHG`), drawn by the canvas painter today. Full colour, repeats both ways.

### The Northern Highlands (`biomes/nhighlands`): the new flora (2026-10-18)

Painted in code today (`biomes/nhighlands/KNOWN_ISSUES.md`, the new flora). The fan-leaf, the moss sleeves, the table
cedar, the serpentwood and the banyan have library candidates already (`card.ginkgo`, `ground.moss001`-`003`,
`card.spruce`, `bark.mossy`, `bark.smooth`): wiring them is the owner's call, no prompt needed.

#### `bark.alder.lichen`

```
Seamless tileable texture, 2048x2048, front orthographic, flat even lighting, no shadows: smooth pale grey alder bark #9c9e96 heavily mottled with white and pale green-grey crustose lichen patches #d8dcd0 and #b8c4a8, a few dark horizontal lenticels #4a4a44, green moss creeping up from the bottom edge #5a7a26. Matte. One tile covers 1 metre.
```

### Ys (`settlements/ys`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

From `settlements/ys/MATERIAL-PROMPTS.md`, "The ocean's rust" (Travis, 2026-10-05: "the ancient buildings here are quite
rusty"); every other set in that file was delivered. Not tinted. Since 2026-10-06 Ys' ruined concrete takes
`concrete.ancient` (`KMAT.bindMat`), so the drowned Ancients are textured, just not rusty; `MAT.rust` stays procedural.

### The Fauna kit (`kits/fauna`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

From `PLAN.md`, "The Fauna kit": "Still needed for fauna". Triplanar detail maps under each animal's vertex colours, so
both are near-colourless.

### The Pylon kit (`kits/pylon`)

The kit draws in the Iziz Vernacular's sets and the library's (`kits/pylon/materials.json`); these three it has no set for
(`kits/pylon/PLAN.md` section 8). Each lands in the library or `patterns/pylon/`; add its family to
`kits/pylon/materials.json` and repack.

#### `tile.hex.glazed`
- Kind: tileable material, near-colourless (tinted amber by the kit); 1 m tile. The honeycomb-tiled walls and street of
  the owner's `refs/1b13731cac223929fb36a94b49c88603.jpg`: rich interiors, the scrap exchange's floors, hex paving.
- Reuse: any glazed hexagonal tile floor or wall (a bath house, a Yuni kitchen, a Hykkousoi hall), tinted to taste.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Glazed ceramic hexagonal tiles about 10 cm across, set flat-side to flat-side in a honeycomb, about twenty tiles across the image: each tile slightly domed with a soft glaze sheen, faint variation of glaze thickness from tile to tile, a few hairline crazing cracks, one or two chipped corners, narrow dark grout lines between them. Pale grey glaze, dark grey grout. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `patterns/pylon/hex-grille`
- Kind: cut-out sheet on magenta, near-colourless; 1 m across. The Ancients' grille in the portholes and lattice
  screens (`refs/ancient office.jpg`, `ancient 2.jpg`, `honeycomb arch.jpg`), drawn now as two crossed iron bars.
- Reuse: any metal hex lattice: vents, gates, window grilles, a dome's skin, catwalk floors.

```
A flat, front-on decorative panel, square, 2048x2048, on a solid flat magenta background (#ff00ff). Orthographic, flat even shadowless lighting, no cast shadows, no perspective, no text, no border. The pattern must repeat: the left edge continues into the right edge and the top into the bottom. The panel: a metal honeycomb grille, a lattice of flat bars about a finger wide forming regular hexagonal openings about a hand across, eight openings across the image, the bars bevelled at their edges with a little wear on the corners and faint machining lines along them; every opening shows only the solid magenta background through it. Dark neutral grey metal. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the metal.
```

#### `plaster.painted.worn`
- Kind: tileable material, full colour; 2 m tile. The salvage tier's and the folk houses' orange paint, flaking to the grey
  render and concrete beneath (the kit tints white stucco orange today, so wear does not show).
- Reuse: any painted render worn back to its base: Talia's poor orange quarter (`talia (6).jpg`), weathered Iziz shops.
- **Check:** `plaster.white_stucco_02` tinted orange may be enough at a distance; judge both on the folk houses first.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: An old rendered wall painted bright orange (#e07a2a), the paint faded and chalky and flaking away in irregular patches to show smooth grey cement render (#8e8b86) beneath, about a third of the surface bare; the paint edges lifted and cracked, a few hairline cracks in the render, faint vertical streaks of grime below the patches. Full colour (do not mute).
```

### The Talia kit (`kits/talia`)

The kit draws in the library's marble, gold and clay tile (`kits/talia/materials.json`); these four it has no set for
(`kits/talia/PLAN.md` section 7). Each lands in the library or `patterns/talia/`; add its family to
`kits/talia/materials.json` and repack.

#### `mosaic.honeycomb`
- Kind: tileable material, full colour; 1 m tile. The orange-gold mosaic over the trumpet vaults, coffers and column
  flares of Talia's halls (`refs/taliaint3.jpg`) and the cloister ceilings (`talia-cloisters.jpg`).
- Reuse: any gilded or orange mosaic vault or apse, Iziz's rich interiors.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A mosaic of small irregular polygonal glass tesserae about 2 cm across, packed like a honeycomb or a cracked glaze, each one a slightly different shade of warm orange and gold (#e89a30, #d8822a, #f0b048, #c87420), a few gold-leaf tesserae with a faint metallic sheen, thin pale cream grout lines (#efe6d2) between them, a slight unevenness of the surface. Full colour (do not mute).
```

#### `patterns/talia/meander`
- Kind: pattern sheet, full colour, 2048x512, repeating along its length; a band 0.5 m tall. The Greek-key border of
  Talia's floors and friezes (`refs/talia-cloisters.jpg`).
- Reuse: any classical floor border or frieze band (Hykkousoi halls, Republic civic floors), tinted or as is.

```
A flat, front-on decorative panel, 2048x512, a long horizontal band. Orthographic, flat even shadowless lighting, no perspective, no objects, no text, no border, no watermark. The band must repeat along its length: the left edge continues into the right edge. The panel: a Greek key (meander) border in white marble inlay (#f4f1ea) on a ground of orange marble (#ee7a1c), the key a continuous squared spiral line about a tenth of the band's height wide, running the whole length, with a thin white fillet along the top and bottom edges of the band; the marble shows faint veining, the inlay joints are fine and tight. Full colour (do not mute).
```

#### `patterns/talia/jali`
- Kind: cut-out sheet on magenta, near-colourless; 1 m across. The pierced stone screens of the jharokha bays and the
  palace's upper pavilions (`refs/talia3.jpg`).
- Reuse: any pierced stone or plaster screen: Mughal-style windows, a harem lattice, Erewhon's citadel.

```
A flat, front-on decorative panel, square, 2048x2048, on a solid flat magenta background (#ff00ff). Orthographic, flat even shadowless lighting, no cast shadows, no perspective, no text, no border. The pattern must repeat: the left edge continues into the right edge and the top into the bottom. The panel: a pierced stone screen (jali) of interlocking eight-pointed stars and small hexagons, the stone bars about two fingers wide with softly rounded carved edges and fine chisel texture, the openings about a third of the area, five star motifs across the image; every opening shows only the solid magenta background through it. Pale warm grey stone. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the stone.
```

#### `patterns/talia/rose-window`
- Kind: one cut-out panel on magenta, full colour, 2048x2048, not tiled; the window is about 9 m across. The star rose of
  Talia's temple front (`refs/talia-temple.jpg`), drawn now as a plain glazed disc.
- Reuse: any rose or oculus window (a chapel, a guild hall's gable).

```
A flat, front-on decorative panel, square, 2048x2048, on a solid flat magenta background (#ff00ff). Orthographic, flat even shadowless lighting, no cast shadows, no perspective, no text. The panel: one circular stained-glass rose window filling the square, edge touching the edge, seen straight on and lit from behind: a sixteen-pointed star pattern of lozenge panes radiating from a white glass centre, the panes slate blue (#4a6a8a), pale gold (#d8c07a), cream (#efe6d2) and a few deep cobalt (#2f5fb8), set in dark lead cames (#2a2624) with a thin stone ring round the outside; everything outside the circle is solid magenta. Full colour (do not mute). Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the window.
```

## 3. Probably needed: check first

Each has a reason it may not be owed. Settle the reason, then generate or drop the entry.

## 6. necanyons (`biomes/necanyons`, 2026-10-19)

The north-eastern canyons, the hyperjungle's transition to Korona (`biomes/necanyons/PLAN.md` section 6, which lists the
library sets it reuses). The five required images were delivered on 2026-10-19 (see "Delivered 2026-10-19, necanyons"
below); `rock.sandstone.bedded.red` was delivered on 2026-10-18 for Pinnacle Rock and serves here too. Three optional
sheets are left; each names the library fallback the kit uses without it.

#### `card.palm.fan` (optional; fallback `card.palm`'s palmetto cells)
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one leaf per cell.
- Used by: the gorge fan palm's crown. Reuse: any fan palm (Livistona, Washingtonia, the bays' palms).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one fan-palm leaf (Livistona) on a long, thin, spiny stalk rising from the bottom of its cell: a round fan wider than it is tall, split two thirds of the way to its centre into about sixty narrow ribbon segments whose tips droop and hang down; glossy mid green (#4a7a3a, #5a8a40) with paler yellow-green (#a0b060) along the folds, one or two old leaves going brown (#8a6a3a) at the tips. Vary how far the segments droop between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.flametip` (optional; fallback `card.croptree.glossy`, tinted)
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one twig end per cell.
- Used by: the flametip scrub forest of the benches. Reuse: any tree with a red new flush (the tepuis, mango and cinnamon flushes).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a short leafy twig end of a tepui shrub-tree standing up from the bottom of its cell: thick, leathery, glossy oval leaves crowded in a spiral at the twig tip, the older leaves below dark olive green (#3e5230), the new flush at the tip bright scarlet to orange-red (#c8321e, #e0602a); on four of the nine a few pale cream five-petalled flowers (#efe2c8) among the leaves. Vary how much of each twig is in red flush. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.treelily` (optional; fallback `card.ichu` and `card.flower.claw`)
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one branch tip per cell. The flowers are lilac: key with `spill: edge` (as `card.crop.saffron`).
- Used by: the stilt lily of the cap plateaus. Reuse: any tree-lily or dracaena-like tuft.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one branch tip of a tree-lily (Vellozia) standing on the bottom of its cell: a short thick stub shaggy with black fibrous old leaf bases (#2a2420), carrying a dense fountain of narrow, stiff, grass-like grey-green leaves (#7a8a6a, #8a9a78) radiating up and outward; on five of the nine, two to four large pale lilac six-petalled flowers (#b8a8d8) on short stalks rising out of the tuft. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta or hot pink anywhere in the subject.
```

## Delivered 2026-10-19, Korona (the owner's twenty images in `Downloads`, batches `korona-2026-10-19.json` and `korona-2026-10-19-cards.json`)

All nineteen prompts of the Korona list (section 7, now removed: the tepui station's nine, the pitcher hollow's ten) came back the
same day and are in the library: `rock.quartzite.tepui`, `ground.quartzite.black`, `ground.peat.black`, `ground.bladder.bed`,
`organic.pitcher.giant`, `organic.pitcher.throat` (wraps across only: its gradient is mapped once down the throat),
`organic.tendril.banded`, `patterns/korona/hum-carving` (tintable), and the cards `card.pitcher.lace`, `card.sundew.great`,
`card.coin.tree`, `card.fan.rainbow`, `card.lacefan.tree`, `card.stormpod`, `card.pitcher.cobra` and `card.pitcher.cobra.b`
(two takes of the cobra lily, both kept for the meadow's variety), `card.pitcher.trumpet`, `card.trap.star`, `card.lure.flower`,
`card.bulb.blood`. Two came off their prompts and are noted in their `meta.json`: `ground.quartzite.black` is pale quartzite with
black patches rather than a black crust (the kit darkens it by vertex colour), and `ground.peat.black` is a rusty moss-and-stick
bog floor rather than black peat (a darker wet peat may still be wanted for the pools' margins). **Not wired:** `biomes/korona` has
no build yet; its `materials.json` takes them when station 1 is built. The reference images are in
`OneDrive/Pictures/krator/korona/`.

## Delivered 2026-10-18 (`Downloads/tex2.zip`, batches `owner-tex2-2026-10-18*.json`)

- **Surfaces:** `rock.coal`, `ground.tar.seep`, `ground.efflorescence`, `rock.malachite`, `rock.quartz.vein`, `rock.cassiterite`, `rock.galena`, `rock.gossan`, `rock.pegmatite` (Resources kit nodes), `glass.bottle.wall` (Post-Apoc), `ground.lagoon.seagrass`, `ground.reef.flat`, `organic.coral.brain` (Ring Sea isles).
- **Cards (nine cells):** `card.seagrass`, `card.creeper.beach`, `card.naupaka`, `card.seagrape`, `card.breadfruit`, `card.tamarisk`, `card.croptree.glossy`.
- **Came unasked, not installed:** an amber mosaic, a Greek-key band, two magenta lattices (arabesque, geometric), an industrial honeycomb grid, a stained-glass rose, a hexagonal ceramic tile, a peeling terracotta wall, a second naupaka-style sheet.

## Delivered 2026-10-14

The owner delivered thirty-five images in seven batches (WebP, 1254 px; the caihua 1774 x 887). Each was processed as `core/materials/PLAN.md` says (batches `tools/textures/batches/owner-2026-10-14.json` and `-cards.json`) and wired; `PLAN.md`, "Delivered 2026-10-14", has the checks and the details. The entries are kept here with their prompts.

#### `ground.travertine.white`
- **Delivered 2026-10-14:** 6.webp. `library/ground.travertine.white`, full colour. Wired: biomes/geyser `ground.tufa` (the Stair), kept at 0.2 of its colour so its painted pools read as pale crust under the shader's own water.
- Kind: tileable material, full colour. Seen from above.
- Used by: the Stair's terraces. Stands in today: `stone.travertine.tufa`, greyed and whitened (Pamukkale's rims are
  whiter and smoother). Reuse: any travertine spring.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Travertine terraces seen from directly above, like Pamukkale: bright white calcite (#f2f0ea) laid down by flowing spring water in scalloped rimstone dams, each dam a smooth rounded lip a hand wide curving in lobes, its outer face draped with fine vertical drip ridges and small stalactite fringes; between the dams shallow pools of pale milky turquoise water (#9ad8d8) over a smooth white floor; faint cream (#e8dcc0) and pale orange-brown (#c8905a) stains where the water slows. Full colour.
```

#### `stone.geyserite`
- **Delivered 2026-10-14:** 8.webp. `library/stone.geyserite`, tinted. Wired: biomes/geyser `sinter` (the cones and beads), in place of ground.clay.popcorn.
- Kind: tileable material, near-colourless (tinted).
- Used by: the geysers' cones and beads. Stands in today: `ground.clay.popcorn` (a badland clay whose nodules read as
  geyserite). Reuse: spring rims, a silica-crusted snag; the Throne's geyser isle.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Geyserite (siliceous sinter) on a geyser's cone seen close up: grey-white silica built up in knobbly beaded crusts like cauliflower and popcorn, rounded beads from a few millimetres to a few centimetres clustered in ridges, a faint pearly sheen on the beads, small dark pits between them, faint buff and salmon stains in streaks. Near-colourless: keep the stains faint so the image reads as grey-white. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `card.streamer`
- **Delivered 2026-10-14:** 7.webp. `library/card.streamer` (nine cells, keyed by unmixing). Wired: biomes/geyser `streamer` (the straight combed clump, flipped onto the ribbon), full colour.
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; base at the bottom of each cell.
- Used by: the flame streamers in the run-off. Stands in today: procedural strands. Reuse: any thermophile streamer,
  waterweed in a current.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a clump of long silky streamers of thermophile filaments, the kind that grow in warm runoff from hot springs, combed out straight and parallel by flowing water, rooted together at the bottom of the cell and streaming up to the top, wet and glossy, bright orange (#e0782a) shading to golden (#f0a040) at the tips, a few strands olive-green (#7a8a34); vary the width and the length of the nine clumps. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.clubmoss`
- **Delivered 2026-10-14:** 9.webp. `library/card.clubmoss` (nine cells, keyed by unmixing). Wired: biomes/geyser `club`, full colour.
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; base at the bottom.
- Used by: the nodding clubmoss on the warm crust. Stands in today: procedural sprigs. Reuse: any clubmoss or horsetail
  understorey.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a small clump of nodding clubmoss (Lycopodiella cernua): three to six upright stems like miniature pine trees, each densely clothed in tiny needle-like leaves, yellow-green (#7aa038) with paler new growth, a small pale yellow cone nodding at each branch tip, rooted at the bottom of the cell; vary the heights and the counts between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.steamcomb`
- **Delivered 2026-10-14:** 4.webp. `library/card.steamcomb` (nine cells). Wired: biomes/geyser `comb` (one fan, its hub at the cell's foot), grey under the comb palette.
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; hub at the bottom middle of each cell.
- Used by: the steam combs' fans (they comb water out of a fumarole's steam). Stands in today: procedural filaments.
  Reuse: sea fans, alien filter feeders.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a fan of very fine, almost hair-thin pale grey-white filaments (#e4e8e0) radiating in a half circle from a small hub at the bottom middle of the cell, like a sea fan or a fine comb, the filaments a little translucent and beaded all over with tiny clear water droplets that catch the light; vary the width and the fullness of the nine fans. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.strap.pandan`
- **Delivered 2026-10-14:** 10.webp. `library/card.strap.pandan` (nine leaves). Wired: biomes/geyser `strap` (one leaf, flipped onto the frond), full colour.
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one leaf per cell, base at the bottom.
- Used by: the stilt pandans' strap leaves (their crowns seen from above are `card.screwpine`). Stands in today:
  procedural leaves. Reuse: screwpines, yuccas, bromeliad leaves.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a single long strap leaf of a screwpine (Pandanus), standing upright from its base at the bottom of the cell to its tip near the top, the last third drooping a little to one side, narrow and keeled down the middle, its edges finely toothed, glossy green (#4e7432) shading to yellow-green (#8aa040) toward the base; vary the curve and the width between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `feather.flight`
- **Delivered 2026-10-14:** 15.webp. `library/feather.flight`. Wired: kits/fauna `flight` (every wing part's feathers; the runtime picks it by part), with `feather` (feather.plumage) on the bodies.
- Kind: tileable material, near-colourless (tinted by each bird's vertex colours; a triplanar detail map).
- Used by: every bird's folded and spread wings (`kits/fauna/KNOWN_ISSUES.md`: "smooth white hens and ducks read as
  plastic until the `feather.plumage` and `feather.flight` sets arrive"). `feather.plumage` is delivered (not yet wired as a
  `feather` family in `kits/fauna/materials.json`); this is its partner. Stands in today: nothing (flat vertex colour).
  Reuse: wings on banners and crests, fletching, feather fans.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Folded bird flight feathers seen from above, as on a closed wing: long primary and secondary feathers about 25 cm long lying parallel and overlapping like roof shingles, each with a visible pale central shaft, smooth vanes and a slightly ragged tip, narrow dark gaps between them. Light neutral grey so it can be tinted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `patterns/islander/gable-west`
- **Delivered 2026-10-14:** 31.webp (and 34.webp, a second board: `patterns/islander/gable-west-b`). Wired: kits/islanders `patGableW`; the variant `patGableW2` on the rumah gadang.
- Kind: pattern sheet, repeats both ways. Family `patGableW`: the West's (Batak) gable boards. Stands in: a canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a painted and lightly carved Batak gable board (gorga): on a red earth (#9a2a1e) ground, pairs of large interlocking spirals drawn as bold black (#1e1a18) lines edged in white (#efe6d2), a white lozenge between each pair with a black diamond at its heart, and toothed borders of black triangles between thin white and black bands. Hand-painted on adzed wood, slightly worn and uneven. The pattern repeats horizontally and vertically. Full colour.
```

#### `patterns/islander/gable-east`
- **Delivered 2026-10-14:** 14.webp (and 35.webp, a second take: `patterns/islander/gable-east-b`; 14 tiles exactly and is the main one). Wired: kits/islanders `patGableE`; the variant `patGableE2` on the great uma.
- Kind: pattern sheet, repeats horizontally. Family `patGableE`: the East's (Kautoa, Sumba) woven facades; also one of the
  ikat stand-ins on the weaver's rail. Stands in: a canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a woven split-bamboo house facade as on an Ede or Sumba house: a cream (#e6d8b8) woven field in horizontal bands, alternating rows of large nested diamonds in black (#1e1a18) and ochre (#c8922e) with a small dark red (#6e1a12) heart, and rows of triple zigzag lines, thin black bands between the rows, visible weave in every strip. The pattern repeats horizontally. Full colour.
```

#### `patterns/islander/kowhaiwhai`
- **Delivered 2026-10-14:** 13.webp. Wired: kits/islanders `patBand` (0.72 m a sheet: one scroll band in 0.36 m).
- Kind: pattern sheet, a band that repeats horizontally. Family `patBand`: rafter and beam bands. Stands in: a canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Maori kowhaiwhai rafter painting: flowing white (#efe6d2) koru scrolls outlined in black (#1e1a18) on red earth (#9a2a1e), each scroll's stem curling into the next in a continuous running pattern, painted on smooth wood. The pattern repeats horizontally. Full colour.
```

#### `patterns/islander/storyboard`
- **Delivered 2026-10-14:** 20.webp. Wired: kits/islanders `patStory`.
- Kind: pattern sheet, two registers, repeats horizontally. Family `patStory`: the Palauan-style gable relief. Stands in:
  a canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Palauan bai storyboard, a carved and painted gable relief in two registers between black and white toothed bands: in the upper register a red canoe with five black paddlers under a white full moon, in the lower one red and white fish and black frigate birds in flight, outlined black (#1e1a18) on an ochre (#c8922e) ground, the relief shallow and hand-cut. The pattern repeats horizontally. Full colour.
```

#### `patterns/islander/weave`
- **Delivered 2026-10-14:** 12.webp. Wired: kits/islanders `patWeave`.
- Kind: pattern sheet, repeats both ways. Family `patWeave`: the East's woven walls; also an ikat stand-in. Stands in: a
  canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on panel of a woven split-bamboo wall: flat strips about four centimetres wide in a twill, pale natural bamboo (#d8c294) and smoked dark strips (#6a5236) stepping into a pattern of nested diamonds, the strips' edges catching a little light. The pattern repeats in both directions. Full colour.
```

#### `patterns/islander/medallion-moon`
- **Delivered 2026-10-14:** 11.webp (the owner delivered it, so `patterns/common/medallion-moonface` was not tried). Wired: kits/islanders `medMoon`.
- Kind: single panel, centred with clear margin (map once). Family `medMoon`: the moon discs on the West's hall and the
  chief's house. Stands in: a canvas. Try first: `patterns/common/medallion-moonface` (in the library, unwired, noted as
  fit for the Islanders' white island moon); if it serves, wire it and drop this entry.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of one round painted emblem, centred, clear margin: the white island moon, a pale full moon (#f6f0e2) with soft grey seas, on a sea-teal (#2a7a7a) disc ringed with white shell discs, inside a black (#1e1a18) ring and an ochre (#c8922e) rim, painted on wood with a little wear. A single motif, not a repeat. Full colour.
```

#### `patterns/islander/hinggi`
- **Delivered 2026-10-14:** 16.webp. Wired: kits/islanders `patHinggi`, the four cloths on the Kautoa weaver's rail (63-ie-trade.js).
- Kind: pattern sheet, repeats horizontally. **New prompt** (none existed): the ikat cloths drying on the Kautoa
  weaver's rail (`ie-weaver`, `63-ie-trade.js`; the weaver's note names indigo and morinda vats). Stands in today:
  `patGableE`, `patWeave` and `tapa`. The kit's palette has no indigo, so #23304a is chosen here.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Sumba hinggi, a hand-woven warp-ikat cloth: the motifs were dyed into the threads before weaving, so every edge is soft and feathered along the vertical threads. Horizontal registers mirrored about the middle of the cloth: wide bands of stylised horses with riders, deer, roosters and crayfish in cream (#e6d8b8) and ochre (#c8922e) on a deep indigo ground (#23304a), separated by narrow bands of small hooked diamonds and stripes in morinda red (#9a2a1e) and dark red (#6e1a12), with thin black (#1e1a18) lines between the bands. Visible plain weave, slightly faded and uneven dye. The pattern repeats horizontally. Full colour.
```

#### `patterns/scyvoi/applique-roof`
- **Delivered 2026-10-14:** 17.webp. Wired: kits/scyvoi `patRoof`, the three Tibetan tents' roofs (patApp stays on walls and bands).
- Kind: pattern sheet, repeats both ways, full colour. **New prompt** (`kits/scyvoi/KNOWN_ISSUES.md`: "not asked for
  yet").
- Used by: the Tibetan tents' roofs. Stands in today: the dense blue appliqué sheet (`patApp`,
  `patterns/scyvoi/applique-blue`); the references show a white roof sewn with a few large blue knots. Colours from
  `SVPAL` (`26k-kit.js`: cream felt, indigo).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Tibetan appliqué tent roof: plain heavy white-cream cotton (#f2ece0) sewn with a few large endless knots cut from indigo cloth (#23345a, a little lighter #2a3c66 where the cloth is worn), each knot about a fifth of the frame across with a thin cream couched outline and visible running stitches, the knots spaced widely in a half-drop grid with plenty of plain white cloth between them; faint fold creases and a little smoke grey along the seams. The pattern repeats in both directions. Full colour.
```

#### `metal.bronze.cast`
- **Delivered 2026-10-14:** 18.webp. Wired: settlements/iziz `cityBronze` (MAT.bronze, bronzeDark: the statues) and `cityBrass` (vpGilt, vpBrass).
- Kind: tileable material, near-colourless (tinted). Isotropic: the statues' kit UVs stretch with each instance's
  scale, so the image must have no direction.
- Used by: the heroic statues (`izBronze`, `izBronzeCyl`, `izBronzeD` on `MAT.bronze`, `bronzeDark`) and the embassy's
  `vpGilt` and `vpBrass`. Stands in today: plain metal (`metal.bronze` is a riveted, seamed panel: wrong on a cast
  figure). Reuse: Ys' Citadel spires (`hkVerd`, now the riveted `metal.bronze.verdigris`; a plain patina suits them
  better), any statue, bell or cast fitting.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Cast bronze surface of a large outdoor statue: smooth cast metal with very fine casting porosity and a soft hammer-dressed undulation, a thin warm brown patina with small mottled patches of pale green verdigris gathered in the hollows; no seams, rivets, panels, letters or edges, isotropic with no direction. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `concrete.rust.streaked`
- **Delivered 2026-10-14:** 19.webp. Wired: settlements/iziz `cityConcRust` (MAT.concRust). Ys took its own sea version (30.webp).
- Kind: tileable material, near-colourless (tinted); vertical streaks run down the image.
- Used by: `MAT.concRust`, the rust-streaked skyscraper skin (112k triangles). Stands in today: the procedural map (no
  library concrete carries the streaks). Ys asks for a salt-sea version of the same surface: `concrete.rust.streaked.sea`
  in section 2.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Weathered poured concrete stained by rust: smooth grey board-formed concrete with faint horizontal formwork lines and small round tie holes, long vertical rust-brown streaks and drips running down from small rusted bolts near the top edge, water stains and a little grime in the board joints. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

---

#### `patterns/highlands/harlequin-red`
- **Delivered 2026-10-14:** 25.webp. Wired: settlements/highlands `hHarlR`.
- Kind: pattern sheet. Used by: `MAT.hHarlR` (`hTentHR`).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of glazed harlequin roof tile: a field of diamond lozenges, each a cream (#d8cfbe) diamond with its points touching the cell edges, set in a deep red (#9a2420) ground, with a thin gold (#c89a30) seam line just inside each diamond's edge and a small soft pale glint on the upper half of each. The pattern repeats in both directions. Full colour, glossy glazed look.
```

#### `patterns/highlands/harlequin-dark`
- **Delivered 2026-10-14:** 24.webp. Wired: settlements/highlands `hHarlGt`.
- Kind: pattern sheet. Used by: `MAT.hHarlGt` (`hTentHG`, `hBulbHG`).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of glazed harlequin roof tile: a field of diamond lozenges, each a mid green (#5f9a50) diamond with its points touching the cell edges, set in a dark bottle-green (#1f5a40) ground, with a thin gold (#c89a30) seam line just inside each diamond's edge and a small soft pale glint on the upper half of each. The pattern repeats in both directions. Full colour, glossy glazed look.
```

#### `metal.rust.heavy`
- **Delivered 2026-10-14:** 23.webp. Wired: settlements/ys `rust` and `pipeRust` (79z gives pipeRust world UVs).
- Kind: tileable material, full colour (not tinted); one tile = 2 m.
- Used by: the struts, legs, pipes and iron of the drowned Ancients (`MAT.pipeRust`, the Conocylinder's strut ring, the
  Capsule Stalks' tubes). Stands in today: the procedural rust.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Heavily corroded steel plate, decades in salt water and spray: flaking layers of orange, red-brown and near-black rust, blistered and scaled, pits and holes eaten through in places showing dark shadow beneath, lines of rusted rivets along a plate seam, a few barnacle clusters and white salt crust at the edges. Keep the rust muted and even in brightness so it reads at a distance as a dark red-brown surface rather than a bright orange one.
```

#### `concrete.rust.streaked.sea`
- **Delivered 2026-10-14:** 30.webp. Wired: settlements/ys `concreteR`.
- Kind: tileable material, full colour (not tinted); one tile = 8 m across and 8 m up; the streaks run strictly down.
  (`MATERIAL-PROMPTS.md` names it `concrete.rust.streaked`; renamed here because Iziz's tintable inland version, section 1,
  holds that id. If one image is to serve both, deliver Iziz's and tint it rusty on Ys.)
- Used by: the ruined concrete of the Monolith, the Warden and the stumps (`MAT.concreteR`) and the Conocylinder stumps'
  rust skin (`MAT.rust`). Stands in today: `concrete.ancient` (clean board marks) and the procedural rust.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Board-formed grey concrete of a tall ruined tower, seen face-on, weathered for centuries beside the sea: long rust streaks running straight down the face from rows of corroded fixings and rebar ends, orange-brown bleeding into dark brown, between them pale salt bloom and grey-green algae staining, small spalls where the concrete has broken off round rusting bars, hairline cracks, the board marks still faintly visible. The streaks run strictly vertical (down the image) so the tile can run up a wall. Keep the base concrete a muted mid grey and the rust a muted orange-brown, with no single streak so distinct that it would repeat visibly on a 300 m tower.
```

#### `hide.sleek`
- **Delivered 2026-10-14:** 22.webp (mid-brown, processed muted 0.8). Wired: kits/fauna `sleek`.
- Kind: tileable material, near-colourless (tinted).
- Used by: the `sleek` family: horse, mule deer, cattle, water buffalo, dromedary, coyote, arena tiger, grazer, stalker,
  strider. Stands in today: `hide.strider` (lighter and streakier than a sleek coat). Reuse: hair-on hide on saddle skirts,
  drum skins, quivers, upholstery.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Short sleek animal coat seen close up, as on a horse or a deer: very short dense glossy hairs all lying in one direction, faint swirls where the hair changes direction, a soft sheen along the hair, no spots, stripes or markings. Light neutral warm grey-tan so it can be tinted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `skin.smooth`
- **Delivered 2026-10-14:** 21.webp. Wired: kits/fauna `skin`.
- Kind: tileable material, near-colourless (tinted).
- Used by: fire salamander, bay swimmer, sky ray, pig (tinted pink), the frilled and pit lizards' bellies. Stands in
  today: `hide.leather033c` (the `skin` family). Reuse: eels, frogs, cave creatures, scaleless fish, oiled leather.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Smooth moist animal skin as on a salamander, a frog or a whale: fine pores, soft wrinkles and creases in loose bands, a few tiny raised bumps, slightly glossy, no scales and no hair. Neutral mid grey so it can be tinted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

---

#### `patterns/tribal/formline`
- **Delivered 2026-10-14:** 2.webp. Wired: settlements/highlands `formF`, the frieze boards of every branch (a 0.5 m panel).
- Kind: pattern sheet, full colour, repeats horizontally. Highlands' Tribal (Northwest-coast) branch; the catalog's
  `Painted` formline colours. Listed "prompted earlier and still owed" in `PLAN.md` (catalog audit). **Check:**
  `patterns/republic/folk-formline-a`/`-b` and the friezes `patterns/highlands/frieze-nw-totemic`, `frieze-asian-nw` may
  already serve. A white-ground variant: swap the cedar ground for white (#efe7d6).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of Northwest-coast formline painting on cedar: bold swelling black (#171311) formlines with ovoids and U-shapes, the inner shapes in red (#b3322a) and teal (#2e9488), on a cedar-wood ground (#b27a4c, shading to #8a5634), hand-painted and slightly worn, the wood grain faintly showing. Abstract: no readable figures. The pattern repeats horizontally. Full colour.
```

#### `patterns/highlands/caihua`
- **Delivered 2026-10-14:** 1.webp (three bands; one installed). Wired: settlements/highlands `hCaihua`, mapped once per bay. The four friezes stay unused.
- Kind: pattern sheet, a long band about 8:1, full colour, repeats horizontally. Highlands' painted beams. **Check:** the
  four wide friezes delivered 2026-10-03 (`frieze-asian-nw`, `frieze-teal-gold`, `frieze-cloud-lotus`,
  `frieze-nw-totemic`) were filed as caihua candidates and are not used yet; if one reads as caihua, wire it instead.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Chinese painted beam (caihua), a long horizontal band about eight times wider than tall: ground blue (#3a6aa8) with green (#3f7a4a) stripes along the top and bottom edges. At each end a teal (#2e9488) block holding a large whorl-flower of concentric rings in white (#efe7d6), teal, blue and ochre (#d19a3a), with black (#201a18) petal scrolls and a smaller whorl either side. In the middle a long white-edged panel with pointed ends, red (#b3322a) inside, filled with six ochre cloud scrolls; ochre dots at the joints and a thin black outline. The pattern repeats horizontally. Full colour, painted.
```

#### `wool.fleece`
- **Delivered 2026-10-14:** 33.webp. Wired: kits/fauna `fleece`, the sheep's wool. `surface.fleece` stays the eastern highlands' woolly plants (it was never on the fauna).
- Kind: tileable material, near-colourless. Fauna: sheep, yak undercoat, goat kids; reuse fleece rugs, felt, saddle
  pads. **Check:** `surface.fleece` (delivered for the eastern highlands' woolly plants, reuse "sheepskin, felt, any
  woolly plant or animal coat") may serve.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Sheep's fleece on the living animal seen close up: dense crimped wool staples about 5 cm long packed side by side, each a twisted lock with a slightly darker weathered tip, small dark gaps between the locks, a few bits of dry grass caught in it. Off-white, evenly muted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `card.grass.panic`
- **Delivered 2026-10-14:** 29.webp (nine base-anchored tufts). Wired: biomes/geyser `grass`, grey under the panic grass palette. The reeds stay procedural.
- Kind: cut-out card sheet, 3 x 3 on magenta, near-grey green (tinted); **base on the bottom edge of each cell**. New
  prompt. `biomes/geyser/KNOWN_ISSUES.md`: "the grass and the reeds are procedural: the library's grass and reed cards are
  centre-anchored, and the kit's tufts stand on the card's bottom edge. A base-anchored panic-grass card would do."
  **Check:** `card.grass.dry` (asked for "standing up from the bottom of each cell") may already be base-anchored. The
  reeds want the same fix (`card.reed`).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a tuft of panic grass, a loose fountain of narrow soft blades arching outward and a few open airy seed panicles on thin stems, the tuft's base sitting exactly on the bottom edge of its cell (not floating in the middle), its top reaching about nine tenths of the cell's height; vary the height, the spread and the number of panicles between the nine. Plain muted grey-green so the sprites can be tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `patterns/scyvoi/salamander-ember` and `patterns/scyvoi/salamander-dun`
- **Delivered 2026-10-14:** 28.webp (ember) and 26.webp (`patterns/scyvoi/salamander-dun`). Wired: kits/fauna `salEmber`, `salDun`, a new FULL-colour slot in the runtime, by variant.
- Kind: pattern sheets, full colour, repeat both ways. New prompts. `kits/fauna/KNOWN_ISSUES.md`: the salamander's
  markings are vertex colours on 16-sided rings and read blocky up close; "a painted skin sheet would be finer". Colours
  from `faSalSkin` (`kits/fauna/krator-fauna-mounts.js`). **Check:** the fauna kit maps grey detail sets under vertex
  colours and has no hook for a full-colour skin; the salamander needs UVs and a slot first.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The back skin of a giant fire salamander seen from above: smooth, moist, slightly glossy skin with fine pores and soft wrinkles, no scales and no hair, fire-black (#161414) with irregular rounded blotches of ember orange (#f07418) and amber (#f4a020) of different sizes, some merging into short broken stripes running along the body, the blotches' edges soft. The pattern repeats in both directions. Full colour.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The back skin of a giant fire salamander seen from above: smooth, moist, slightly glossy skin with fine pores and soft wrinkles, no scales and no hair, dun red-brown (#5a2414) crossed by regular narrow bands of saffron (#d8a028) and gold (#e8c040) running across the body, the bands slightly broken and uneven at their ends. The bands run left to right across the image. The pattern repeats in both directions. Full colour.
```

#### `patterns/iziz/sun-banner` (a periodic redo)
- **Delivered 2026-10-14:** 27.webp: repeats exactly (two periods each way). Replaced the old sheet; kits/mechs tiles it now (mechs-runtime.js).
- Kind: pattern sheet, full colour, must repeat exactly. `kits/mechs/KNOWN_ISSUES.md`: the delivered sheet "is not
  periodic"; banners show a window from one tile, so one wider than 1.8 m or taller than 1.3 m would clamp. **Check:** no
  banner is that large today. The first prompt was not kept verbatim (`chatgpt-2026-10g-mechs.json` records its gist);
  this one is rebuilt from it.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of hand-woven Iziz banner cloth with a visible plain weave, slightly faded and uneven dye: cream (#f1dba6) sixteen-rayed suns in a half-drop grid on Iziz orange (#e07a2a), each sun outlined in deep red (#9c2d2d), with teal (#2f8f8a) stripes running along the top and bottom of each row of suns. Exactly two suns across and two rows down, so the sheet repeats exactly in both directions. Full colour.
```

#### `patterns/common/grime-streaks`
- **Delivered 2026-10-14:** 32.webp: 20 x 8 cells on white (the prompt asked 16 x 8 on transparent). Installed only: the breakup hook's grime parameter is not built.
- Kind: a mask atlas, greyscale, 16 cells across by 8 down (each cell twice as tall as wide). New prompt (`PLAN.md`,
  "Culture pattern sheets", Shared; `TODO.md`: "One generated image; prompt to write in PLAN.md"). Each opening, sill or
  cornice picks a cell by hash. **Check:** the `grime` parameter on `breakup` that reads it is not built yet.

```
A sheet of 128 separate grime streak masks in a grid of 16 columns by 8 rows, square, 2048x2048, each cell twice as tall as it is wide, on a solid flat pure white background. Front-on, flat, even, shadowless lighting; no text, no border, no grid lines. Each cell holds one vertical stain as on a wall below a window sill or a cornice: it starts at the top edge of its cell as a soft band and runs down, fading out before the bottom edge, nothing crossing into the next cell. Vary them: soot, damp, rust run-off, narrow drips, wide washes, single, forked and several parallel runs, some short, some long. Greyscale only, from pale grey to near-black where the stain is strongest, no colour at all.
```

#### `patterns/reedlake/reed-lattice` (cut-out)
- **Delivered 2026-10-14:** 5.webp. `patterns/reedlake/reed-lattice`, an alpha cut-out. Wired: settlements/reedlake `rlLattice`.
- Kind: cut-out pattern sheet on magenta, full colour, repeats both ways. The mudhif fronts' open diamond lattice
  (`MAT.rlLattice`, `74-rl-mat.js`); `PLAN.md` "Reed Lake" prompted it on a dark key and it never came. **Check:** the
  procedural alpha lattice works and no known issue asks for it; the cut-outs stay procedural because the delivered reed
  sheets are opaque, so this is only worth it on magenta.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of an open diamond lattice, like the front of a reed mudhif: flat reed strips crossing diagonally at 45 degrees in both directions, spaced so the gaps are square diamonds that show a solid flat bright magenta (#ff00ff) background, so the lattice can be cut out. One set of strips is straw gold (#c9b06a), the other slightly darker (#b89c5a). A thin dark brown shadow line (#3c2814) runs along one edge of each strip. No magenta, pink or purple anywhere in the strips. The pattern repeats in both directions. Full colour.
```

#### `patterns/reedlake/fringe` (a cut-out redo)
- **Delivered 2026-10-14:** 3.webp. The cut-out redo replaced `patterns/reedlake/fringe`. Wired: settlements/reedlake `rlFringe`.
- Kind: cut-out pattern sheet on magenta, full colour, repeats horizontally. The delivered `fringe` is on a dark ground
  and opaque, so the eave fringe (`MAT.rlFringe`) stays procedural. **Check:** as the lattice above.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of loose reed ends hanging from an eave: about seventy thin, slightly curved strands, each hanging straight down from the top edge. Lengths are uneven, between half and full height. Each strand leans a little to one side. The strands are pale straw (#cbb36e) or darker straw (#b39c5c), spread randomly on a solid flat bright magenta (#ff00ff) background, so they can be cut out. The strands end ragged and loose. No magenta, pink or purple anywhere in the strands. The pattern repeats horizontally. Full colour.
```

---

## Delivered 2026-10-19, the Oidong Valley and two Northern Highlands cards (pasted into the chat as WebP, 1254 px and 1536 x 1024)

Fifteen images from the owner, processed by `tools/textures/cards.py` and `process.py` (batches `oidong-cards-2026-10.json` and
`oidong-surfaces-2026-10.json`, every prompt recorded in each set's `meta.json`).
- **Cards (magenta keyed, 1024 px):** `card.lily.iridescent`, `card.peyote`, `card.mooncap`, `card.beads.bell`, `card.heartleaf`,
  `card.lace.birch`, `card.blossom.cherry`, `card.giantpad`, `card.sunwheel`, `card.staghorn` (rotated a quarter turn so its base is
  at the top: a frond card's v runs along it).
- **Surfaces:** `bark.marble` (full colour), `bark.bamboo.jade` (`keep_aspect`, 1:2), `bark.cedar.red`, `organic.chalicecap`,
  `organic.mossball`.
- **Wired:** `biomes/oidong/materials.json` (the cards by material slot through `BIO.libSwap`; the surfaces by family) and
  `biomes/nhighlands/materials.json` (`staghorn`, `wheel`); `biomes/oidong/KNOWN_ISSUES.md` and `biomes/nhighlands/KNOWN_ISSUES.md` updated.
- **Kept the kit's own:** the ribbed lotus stalks and the daisies, the iridescent bark canvases, the haze blossom's and the wisteria's cards.

## Gaps with no prompt yet

## Delivered 2026-10-18, the Beast Riders kit and two more (pasted into the chat as WebP, 1254 px)

Batches `tools/textures/batches/owner-2026-10-18-beast-riders.json` (surfaces, `process.py`) and
`owner-2026-10-18-beast-riders-cards.json` (the card, `cards.py`); sets in `core/materials/library/`.
- `straw.bedding`, `wood.guano`, `ground.stable.yard`: kits/beast-riders (`materials.json`). `wood.guano`'s drips are
  top-heavy in the source, so a tall surface shows a band of drips each tile.
- `rock.sandstone.bedded.red`: for settlements/pinnacle-rock, not built yet: in the library only until it is wired.
- `card.crop.indigo`: for kits/crops (Jungle indigo): in the library only until the Crops kit wires it.

## Delivered 2026-10-19, necanyons

Five prompts of section 6, pasted into the chat as 1254 px WebPs: `ground.slickrock`, `rock.sandstone.varnish` (batch
`necanyons-2026-10-19.json`) and `card.carnivore.monkeycup`, `organic.trap.lobe`, `card.carnivore.sundew` (batch
`necanyons-2026-10-19-cards.json`, keyed off magenta and kept whole, anchor `none`). The sundew's glandular hairs came hot
pink, close to the key: keyed with `spill: all`, which turns the pink left in them red, as the prompt asked. Wired in
`biomes/necanyons/materials.json`.

## Delivered 2026-10-18, the Throne's new flora

Section 6's six prompts, pasted into the chat as 1254 px WebPs: `ground.moss.crimson`, `organic.cap.medusa`, `organic.coil.ribbed`
(batch `throne-flora-2026-10-18.json`) and `card.blade.pyre`, `card.fan.lace`, `organic.lattice.cage` (batch
`throne-flora-2026-10-18-cards.json`, keyed off magenta and kept whole: `cards.py` anchor `none`, so the sheets' cells stay
equal thirds and the lattice still tiles). Wired in `biomes/throne/materials.json` (`ground.velvet`, `cap.medusa`, `bark.coil`,
`card.pyreblade`, `card.lacefan`, `card.lattice`). Reused, not owed: the chalice stalk, moss domes and geode shells keep
their procedural or existing surfaces; the braid cap stays on the tinted parasol skin.

## Delivered 2026-10-18, crops

Twelve prompts delivered (13 pasted images; the owner's numbering): `card.crop.plume`, `card.crop.clover`, `card.crop.bean`, `card.crop.grainhead`, `card.crop.rosette`, `card.crop.umbrella` (came as a papaya-like spotted trunk with a cut-leaf crown; kept), `card.orchard.broad`, `card.crop.tea`, `card.sunthorn`, `card.orchard.small`, `card.crop.palmate` and `ground.tilled`, all in `core/materials/library/` (batches `crops-2026-10-18-cards.json`, `crops-2026-10-18-ground.json`). **Not wired:** the crops kit is not built yet; no `materials.json` names them. The grain and plume cards carry a faint pink spill (they are tintable, so the tint covers it). One extra image (grey-silver leaf sprays with a pink fringe, image 11) was not used: it duplicates `card.orchard.small`.

Second delivery 2026-10-18 (images 14 to 21; batch `crops-2026-10-18-cards2.json`): `card.crop.flax`, `card.crop.nettle`, `card.crop.cotton`, `card.mushroom.pale`, `card.crop.annatto` (two takes came; the second, image 19, is installed, the first, image 18, is unused), `card.crop.woad`, `card.crop.saffron` (lilac-white as asked; keyed with `spill: edge` to keep the lilac). Not wired, as above.

Owed, but a prompt needs work first; listed so they are not lost.

- **The Ring Sea isles' crop leaves** (`biomes/ringisles`): the banana's (`card.paddle` has banana leaves, but diagonal in their cells), rice and cane blades as standing clumps, and greens. Each needs a card framed upright in its cell.
- **Catalog hangings for Eastern Abyss, Lizardmen and Screamer** (`PLAN.md`, catalog audit, "No pattern sheet at all"):
  the kit's canvas painters work; each culture needs a style read of its culture file before a prompt is written.
- **The shared `detail.*` sets** (plaster grain, stone grain, metal brush) for the `detail` record field (`PLAN.md`, "From
  spiderbench"; `TODO.md`): the field is not built.
- **The Iziz Vernacular's trade surfaces** (`settlements/iziz`, the trades round, 2026-10-16): a plain dyed cloth in
  undyed weave (the weaver's and tailor's lengths are the tarp tinted; `vCloth` is the striped awning map), still water for
  the mill race and the moat landings (tinted glass today), and a world-UV rough rock for the mine's and quarry's crags (the
  shared `rubble` item stretches). Each needs a read of the drawing first: which items carry it, and at what tile.
- **The Throne's drawn details** (`PLAN.md`, The Throne): the mat's veins, the star aloe's star, the trumpet tree's
  funnels, the lamp caps' dishes, the frill pods stay procedural; none has been framed as a texture.

## Stale notes found in the sweep (already delivered)

- `biomes/ehighlands/KNOWN_ISSUES.md` still says `ground.puna` is not delivered: it is (`library/ground.puna`).
- `biomes/throne/KNOWN_ISSUES.md` (the geyser isle) still points at the sinter and mat gaps: `ground.sinter` and
  `ground.mat.thermal` are in the library.
- `TODO.md`'s Girder "four texture gaps (leafy, web, ghostwood, prism gum)": three have sets in `girder/materials.json`;
  the web stays procedural by choice (`PLAN.md`, Girder hookup).
- `settlements/ys/KNOWN_ISSUES.md` says the Ancient towers' `MAT.white` has "no prompt": it binds to `metal.ancient.white`
  since 2026-10-06; the rust is section 2 above.
- `feather.plumage` is delivered but `kits/fauna/materials.json` has no `feather` family yet (wiring, not an image).
