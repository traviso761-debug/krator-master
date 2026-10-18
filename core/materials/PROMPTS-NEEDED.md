# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. Nothing in sections 1 to 3 is in `core/materials/library/` or `core/materials/patterns/` on any branch
or worktree (checked 2026-10-14; the two redos in section 3 replace sets that came unusable), and no "Delivered" log in `PLAN.md` or `PROMPTS-ready.md` covers it.

**Count: 20 prompts**: seven for the Resources kit's nodes and 10 for the Ring Sea isles biome (section 1, added
2026-10-15), and three to check first (section 3: `glass.bottle.wall`, and `rock.gossan` and `rock.pegmatite`, where a
library set may do). The other 33 were delivered on 2026-10-14
(two more images came with them: second takes of the Batak and Kautoa boards) and moved to "Delivered 2026-10-14" below.
A short list at the end names gaps that have no prompt yet.

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

### The Resources kit (`kits/resources`)

`kits/resources/KNOWN_ISSUES.md`: "The veins, crusts, seams, pools and grains are vertex colours on simple shapes: the
library has no ore or mineral sets". The nodes are boxes and ellipsoids, so a set is laid on the face that shows the
mineral (a seam band, a crust patch, a pool rim): each lands as a family in `kits/resources/materials.json`, and
`44r-res-nodes.js` draws that face with its key in place of `plain` (a small code change per kind, after delivery). Full
colour: the colour is the point. Sulfur needs no image: `ground.sulphur` is in the library (wired 2026-10-15).

#### `rock.coal`
- Kind: tileable material, full colour; 1.5 m tile. The coal node's seams (`kits/resources`, `node-coal-*`).
- Reuse: coal heaps and bunkers, forge and smithy fuel, a coal barge's hold, a mine's spoil; any coal face.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A face of bituminous coal seen straight on: jet-black coal (#16161a) in thin bright and dull bands, the bright bands with a glassy vitreous lustre and the dull ones matt, broken by two sets of fine straight cleat fractures at right angles into blocky cubes, a few thin grey shale partings (#4a4846), a faint brassy pyrite fleck here and there, black coal dust in the cracks. Full colour (do not mute).
```

#### `ground.tar.seep`
- Kind: tileable material, full colour; 3 m tile. The oil node's stain and pool rims (`node-oil-*`).
- Reuse: tar pits, a boatyard's pitch ground, an oil works' yard, a derrick's spill; any bitumen-soaked ground.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Ground soaked by a natural oil seep, seen from above: glossy black bitumen (#0e0c0a) pooled in hollows and crusted matt dark brown-black (#2a2420) where it has dried, the crust split into irregular plates by fine cracks, small rainbow oil-sheen films on the wet patches, a few half-sunk pebbles and dead grass stalks stuck in the tar, sandy soil (#8a7a5a) showing through at the thinnest edges. Full colour (do not mute).
```

#### `ground.efflorescence`
- Kind: tileable material, full colour; 2 m tile. The saltpeter node's faces and the crust before it (`node-saltpeter-*`).
- Reuse: saltpeter caves and nitre beds, damp cellar and banco walls, the salt-bloomed foot of any earthen wall.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Saltpeter efflorescence on dark earth, seen straight on: crumbly dark brown soil (#4e3c2a) and soft earthen rock, patched with white fluffy mineral bloom (#f2efe6) in feathery needle-like tufts and powdery crusts, thickest along cracks and ledges and thinning to a frosting at its edges, a few damp darker patches where the bloom has dissolved. Full colour (do not mute).
```

#### `rock.malachite`
- Kind: tileable material, full colour; 1.5 m tile. The copper node's veins (`node-copper-*`).
- Reuse: copper mine faces and ore heaps; verdigris-stained rock below old bronze or copper.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Copper-stained rock seen close up: dark grey host rock (#4e4c48) streaked and crusted with bright green malachite (#3e8a5a) in banded botryoidal crusts and smears, patches of deep blue azurite (#2e5a9a), thin turquoise-green films spreading from fractures, a few rusty brown spots. Full colour (do not mute).
```

#### `rock.quartz.vein`
- Kind: tileable material, full colour; 1.5 m tile. The gold node's reef (`node-gold-*`).
- Reuse: any quartz reef or vein in an outcrop; gold diggings and a gold mine's face.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A gold-bearing quartz reef seen straight on: a broad band of milky white quartz (#ece8de) with glassy translucent patches and a few rusty iron-stained cavities (#a4602a), cutting dark grey slate host rock (#4a4844) along its edges, small irregular flecks and thin wires of bright native gold (#e0b030) and a few brassy pyrite cubes in the quartz. Full colour (do not mute).
```

#### `rock.cassiterite`
- Kind: tileable material, full colour; 1.5 m tile. The tin node's stringers (`node-tin-*`).
- Reuse: tin mine faces and ore heaps; greisen and tin-bearing granite outcrops.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Tin ore seen close up: pale grey granite (#a8a49a) cut by white quartz stringers (#e4e0d6) a finger wide, the quartz studded with dark brown-black cassiterite crystals (#2a201c) with a resinous adamantine lustre, some blocky and twinned, a few grains of silvery muscovite mica. Full colour (do not mute).
```

#### `rock.galena`
- Kind: tileable material, full colour; 1.5 m tile. The silver node's veins (`node-silver-*`).
- Reuse: silver and lead mine faces and ore heaps; any galena vein.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Silver-bearing galena vein seen close up: bright lead-grey metallic galena (#b8bcc4) in cubic crystals and cleavage steps with a mirror lustre, set in white quartz and calcite (#eeeae0), patches of black silver sulphide tarnish (#1a1a1e), dark grey host rock (#4a4844) at the vein's edges. Full colour (do not mute).
```

### The Ring Sea isles biome (`biomes/ringisles`)

`biomes/ringisles/KNOWN_ISSUES.md`, "Stand-ins": the lagoon floor, the reef, the coral and seven leaf cards are procedural or near library sets. Each lands as a family in `biomes/ringisles/materials.json` (a card through `BIO.libSwap`). The banana, rice, cane and greens leaves have no prompt yet (see "Gaps with no prompt yet").

#### `ground.lagoon.seagrass`
- Kind: seamless ground tile, natural colour (the ground keeps its own colour). Used by: the lagoon's floor
  (`ground.wetsand` in materials.json, under 0.4-3.5 m of water). Reuse: any warm shallow sea floor.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The floor of a shallow tropical lagoon seen from directly above with the water removed: fine pale coral sand (#e8dcc0, #d8ccb0) in soft ripples, with patches of seagrass meadow (turtle grass) covering about a third of it, the flat ribbon blades lying combed in one direction by the current, dark green (#3e6a32) to olive (#6a7a3a) with some tips bleached pale; small scattered coral fragments, a few shells and a little dark detritus between the blades. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `ground.reef.flat`
- Kind: seamless ground tile, natural colour. Used by: the reef flat and the tide-pool bench (`ground.reef`). Reuse: any
  raised limestone shore, a coral quarry's floor.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A reef flat at low tide seen from directly above: a pavement of dead coral limestone, pale grey-cream (#c8c0a8) and weathered, pitted with small holes and the cut outlines of old coral heads, crusts of pink coralline algae (#c88a8a) in patches, dark grey-green algal turf (#5a6448) in the hollows, scattered broken coral rubble and a few small shallow pools showing pale sand. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `organic.coral.brain`
- Kind: seamless tile for a solid surface (the coral heads: brain and table corals), tinted by the instance colour.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The surface of a living brain coral close up: long winding meandering valleys and ridges like a labyrinth, each ridge rounded and finely ribbed across by tiny septa, the valleys a little darker, the whole a soft cream-tan (#c8b48a) with paler ridge tops. Near-colourless: pale grey only, so it can be tinted.
```

#### `card.seagrass`
- Kind: cut-out card sheet, 3 x 3 on magenta; base at the bottom of each cell. Used by: the seagrass meadows in the
  lagoon (`seagrass`, standing). Reuse: eelgrass, any submerged meadow; waterweed in a lake.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a clump of seagrass (turtle grass) seen from the side as if lifted out of the water, a dozen long flat ribbon blades rising from a short rhizome at the bottom of the cell and curving gently to one side, the blades a hand wide at most, green (#4a7a3a) to olive (#6a7a40), a few tips browned and a few with fine white epiphyte specks; vary the height and the lean of the nine clumps. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.creeper.beach`
- Kind: cut-out card sheet, 3 x 3 on magenta, seen from above. Used by: the beach morning glory (`creeper`, a mat lying
  on the sand; its flowers are separate). Reuse: any creeper over sand or rock.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Seen from directly above, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a patch of beach morning glory (Ipomoea pes-caprae) lying flat as it grows over sand: long green runners branching across the cell, thick glossy two-lobed leaves like a goat's footprint, bright green (#4e8a30) with a paler midrib, some leaves folded, no flowers. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.naupaka`
- Kind: cut-out card sheet, 3 x 3 on magenta. Used by: naupaka, the beach shrub (`naupaka` clumps). Reuse: any fleshy
  coastal shrub.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a leafy shoot tip of beach naupaka (Scaevola taccada), a rosette of thick fleshy spoon-shaped leaves, glossy bright yellow-green (#6aa04a) with pale midribs, crowded at the end of a short pale stem, a few small white half-flowers (petals all on one side) and white berries among them; vary the size and the angle of the nine shoots. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.seagrape`
- Kind: cut-out card sheet, 3 x 3 on magenta. Used by: the sea grape's crown (`grapeleaf` clumps). Reuse: any big
  round-leaved shrub (a tropical almond's leaf mass, a mallow).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a leafy spray of sea grape (Coccoloba uvifera), five to eight big round leathery leaves the size of a plate on a short woody twig, each leaf flat and stiff, olive green (#4e7a34) with prominent red veins (#b8402a), one or two leaves turning red; vary the nine sprays. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.breadfruit`
- Kind: cut-out card sheet, 3 x 3 on magenta. Used by: the breadfruit's crown (`breadleaf` clumps). Reuse: any big
  lobed tropical leaf (a fig, a monstera clump seen whole).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a cluster of breadfruit leaves at a branch tip, three or four huge leaves deeply cut into seven to eleven pointed lobes, glossy dark green (#3e6a2a) with pale yellow-green veins, one round green breadfruit (#9ab43e) with a pebbled skin among them in some of the nine. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.tamarisk`
- Kind: cut-out card sheet, 3 x 3 on magenta. Used by: the salt cedar's foliage (`tamfoliage`; `card.heath` stands in).
  Its pink flower plumes stay procedural (pink cannot be keyed off magenta). Reuse: she-oak (casuarina) needles at a
  distance, any feathery shrub.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a drooping spray of salt cedar (tamarisk) foliage, many fine thread-like branchlets clothed in tiny scale leaves, soft and feathery, grey-green (#7a8a74) to blue-green, hanging from a thin red-brown twig at the top of the cell, no flowers. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.croptree.glossy`
- Kind: cut-out card sheet, 3 x 3 on magenta. Used by: the crop trees' crowns (`glossy` clumps: mango, coffee, clove),
  tinted per species. Reuse: any glossy evergreen (citrus, bay, a mangrove's leaf mass).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a leafy shoot tip of a glossy tropical evergreen like mango or coffee, eight to fourteen long lance-shaped leathery leaves in opposite pairs and whorls along a short green twig, dark glossy green (#2e5226) with paler midribs and a slight wavy edge, a few young leaves at the tip lighter green; vary the nine shoots. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

## 2. Still owed (no open known issue; the build draws its own today)

### Highlands (`settlements/highlands`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

The two other harlequin colourways in the source (`73b-hl-frame.js:239-240`, `hlHarl(ground, diamond, seam)`); only the
green one (`patterns/highlands/harlequin`, `hHarlG`) was delivered. Glazed roof tile on the tents (`hTentHR`, `hTentHG`)
and the bulb domes (`hBulbHG`), drawn by the canvas painter today. Full colour, repeats both ways.

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

#### `glass.bottle.wall`
- Kind: tileable material, full colour; 1.28 m tile. Post-Apoc's bottle walls (`kits/post-apoc/KNOWN_ISSUES.md`: "corrH,
  sheet, iron, steel, bottle and chain stay procedural"). The library's `glass.bottle` is bottle glass, not this wall. Id
  proposed here. **Check:** the other five procedural families there have library sets already (`metal.scrap`,
  `metal.iron`, `metal.steel.brushed`); they want wiring, not images.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A bottle wall seen straight on: the round bases of glass bottles packed in a hexagonal grid and set in grey-brown lime mortar (#8e8674), each base a thick glass disc with a bright centre and a dark rim, in green (#3f9a52), pale green (#8fe0a0), amber (#c98a2a), blue (#2f62b8) and clear (#d5ecea), mixed at random, a little dust and mortar smear on the glass. Full colour.
```

#### `rock.gossan`
- Kind: tileable material, full colour; 2 m tile. The iron node's crust (`node-iron-*`).
- Reuse: iron mine faces and ore heaps, ironstone outcrops, rust-red weathered ground over iron ore.
- **Check:** `rock.basalt.oxidised` (dark basalt with a rusty weathering) may do as it is; try it on the iron nodes first.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Gossan, the rusty iron cap over an ore body, seen close up: spongy cellular iron oxide in rust-red (#8a3e1e), orange-brown (#a4521e) and ochre-yellow (#c08a30) crusts, full of small boxwork cavities where minerals weathered out, black glossy patches of iron oxide (#2a2624), crumbly at the edges. Full colour (do not mute).
```

#### `rock.pegmatite`
- Kind: tileable material, full colour; 1.5 m tile. The rare-earth node's grains (`node-rare-earth-*`).
- Reuse: pegmatite dykes in any granite country; a rare-earth mine's face.
- **Check:** `rock.granite.tor` with the node's own vertex-coloured grains may do; try it first.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Rare-earth pegmatite seen close up: very coarse-grained granite rock with big interlocking crystals of grey glassy quartz (#a8a49c) and pink feldspar (#c87890), violet lepidolite mica flakes (#8a5aa8), scattered small red-brown monazite grains (#a85a3a) and black tourmaline needles (#1e1c1c). Full colour (do not mute).
```

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

## Gaps with no prompt yet

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
