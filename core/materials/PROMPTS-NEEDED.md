# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 8 prompts: 1 redo (`patterns/tribal/formline`), 2 required (the Northern Highlands' `bark.alder.lichen`; n semiarid's `card.tumble`), and 5 optional: the Beast Riders' `foliage.thorn.cut`, necanyons' `card.palm.fan`, `card.flametip`, `card.treelily`, n semiarid's `ground.lakebed.shells` (each has a library fallback in use).** A short list at the end names gaps that have no prompt yet.

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

#### `bark.alder.lichen`

```
Seamless tileable texture, 2048x2048, front orthographic, flat even lighting, no shadows: smooth pale grey alder bark #9c9e96 heavily mottled with white and pale green-grey crustose lichen patches #d8dcd0 and #b8c4a8, a few dark horizontal lenticels #4a4a44, green moss creeping up from the bottom edge #5a7a26. Matte. One tile covers 1 metre.
```

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
## 7. n semiarid (`biomes/nsemiarid`, 2026-10-22)

The northern semiarid kit (the walking steppe, the windblown seeds, the old lake bed; `biomes/nsemiarid/PLAN.md`). Its
`materials.json` wires the library for its leaves, barks and ground. Four of the six images asked for here were delivered
on 2026-10-22 (`card.pappus.giant`, `card.fin.membrane`, `card.stipa`, `bark.saxaul`: `PLAN.md`, the delivered log). Left:
the tumbler's tangle (painted in code today; it lands as the family `tangle`, keep 0, and
`50-biome-nsemiarid-species.js`'s `swap` gains its line) and one optional surface.

#### `card.tumble` (family `tangle`)
- Kind: cut-out card sheet, 3 x 3 on magenta, tintable; one tangle per cell.
- Used by: the tumbling travellers (the walking steppe's rolling plants) and the drifts of dead stems piled against the shrubs.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one dry tumbleweed (Salsola) seen side-on: a roughly round open ball of thin, stiff, much-branched dead stems curving round on themselves, a few tiny spines and papery winged seed husks along them, light showing through the whole ball. Pale bleached straw and grey (#c4b89c, #a09884). Vary from a tight sphere to a flattened, half-broken ball. Muted, tintable: near-colourless greys and off-whites, the build's palette colours it. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `ground.lakebed.shells` (optional; fallback `ground.salt`)

```
Seamless tileable texture, 2048x2048, front orthographic, flat even lighting, no shadows: the dry floor of a lake that drained a thousand years ago, from above: pale grey-buff silt #c8bca4 crusted and curling in thin plates, scattered fine white freshwater snail and mussel shells and shell hash #ece6da half sunk in it, faint thin ripple lines of darker coarse grit #9a8e78 where old shorelines lay, a few dry grass stalks. Matte. Muted, tintable. One tile covers 3 metres.
```

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
