# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 14 prompts: 1 redo (`patterns/tribal/formline`), 9 required (the Northern Highlands' `bark.alder.lichen`; the Eternian kit's eight, section 8), and 4 optional: the Beast Riders' `foliage.thorn.cut` and necanyons' `card.palm.fan`, `card.flametip`, `card.treelily` (each has a library fallback in use).** A short list at the end names gaps that have no prompt yet.

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
## 8. The Eternian kit and the Sanctum (`kits/eternian`, `kits/ancients` target `coil`, 2026-10-20)

The True Heirs' court (`LORE.md` §6.19, `kits/eternian/PLAN.md` §2 and §10): translucent stone in bronze tracery, the
talking heads, the sign. The arcology draws all of these procedurally until they arrive. Reuse first, no prompt needed:
`metal.bronze`, `metal.bronze.cast`, `metal.gold`, `metal.pewter` (the heads' metals by rank), `roof.scale.gilt` (the
court's fish-scale roofs, tinted per metal), `metal.ancient.white` (the kept host), `glass.clear` (the surviving plate
glass).

#### `stone.onyx`
- Used by: the bays' and the court's lights behind the bronze tracery (lit from behind by the cyan strips). Reuse: any
  palace, temple or bath that glazes in stone.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a thin polished slab of honey onyx cut across its layers: soft wavy parallel bands running mostly horizontally, cream (#efe4c8) through pale honey (#d9b884) to amber (#b7884a), a few fine milky-white veins (#f6f1e6) crossing the bands at a shallow angle, faint cloudy depth in the paler bands. Polished but shown matte: no reflections, not backlit. One tile covers 1 metre. Full colour: not tinted.
```

#### `stone.alabaster`
- Used by: the court's palest lights, the Withdrawn's blind bays, lamp shades. Reuse: any culture's translucent lamps.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a polished slab of white alabaster: a soft waxy near-white (#f1ece2) with large cloudy drifts of cream (#e4dccd) and pale grey (#d6d0c4), a few fine thread-like grey veins (#c2bbae) wandering across it, a faint granular depth. Shown matte: no reflections, not backlit. One tile covers 1 metre. Full colour: not tinted.
```

#### `metal.titanium`
- Used by: the colossus on the Sanctum's crown and the Heirs' metal figures (the owner's Gagarin reference). Reuse:
  any polished modern metal monument.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: brushed and lightly polished titanium plate: fine straight horizontal brushing in a cool mid grey (#9aa1a8), broad soft clouds of very faint straw and blue heat tint (#a8a08a, #8c9aae) drifting across it, a few flat panel seams (#6d737a) dividing it into large rectangles. No rivets, no rust, no scratches, no dents. One tile covers 4 metres. Full colour: not tinted.
```

#### `patterns/eternian/screen-pierced`
- Used by: the pierced bronze screens where a wall must breathe, the sealed bays of the Withdrawn. A cut-out:
  `cards.py` keys the magenta to alpha.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a pierced cast-bronze screen: a continuous geometric lattice of interlocking stepped squares and right-angle maze turns, like a circuit board drawn as Art Deco fretwork, the bars about one fortieth of the tile wide, every opening cut clean through to a solid flat bright magenta (#ff00ff) background. The bronze is a warm polished brown-gold (#9c7a3c) with slightly darker bevelled edges (#6e5428). No curves, no animals, no faces, no letters or glyphs. No magenta, pink or purple in the bronze, no grey or white background. The pattern repeats in both directions. Full colour: not tinted.
```

#### `patterns/eternian/talking-heads`
- Used by: the Ancient terminal faces the Machine Talkers wake (the petition walls, the gates, the Regent's hall). A
  sheet of nine; the build cuts the cells.

```
A sheet of nine separate screen panels in a 3x3 grid, square, 2048x2048, each panel filling its cell edge to edge, a thin black gap between the cells. Front-on, orthographic, flat even lighting, no reflections, no text, no watermark. Each panel: a dark glass display (#0b1215) showing a calm, serene face drawn in glowing cyan line art (#39d6e8), built from flat faceted planes like an Art Deco cubist sculpture: closed eyes as two downward-curved lids, a straight nose, a small closed mouth, a stepped geometric headdress, faint horizontal scan lines across the glass. Eight of the nine are calm and differ in face (long, broad, aged, young, male, female) and headdress. The ninth is subtly deranged: the same kind of face with one eye open, its lines doubled and slipping sideways, a few horizontal tear bands, still cyan only. No red, no skulls, no snarls, no sun rays, no letters. Full colour: not tinted.
```

#### `patterns/eternian/sign`
- Used by: the State's banners on the gates and walls (the sign, `LORE.md` §6.19: a gold face with its eyes closed on
  black, green highlights). Not tiled.

```
A flat, front-on hanging banner, portrait, 1024x2048, filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette. No perspective, no text, no letters, no watermark. A matte black cloth field (#141416). In the upper middle, a large serene face in gold (#d8b24a) with its eyes closed, built from flat faceted planes in the Art Deco cubist manner, a stepped Deco headdress above it; green (#3f8a5a) highlights pick out the planes of the cheeks and brow and draw a thin line under the closed lids. Below the face a narrow vertical band of gold right-angle maze pattern, like a circuit board, runs down to the hem; a thin gold border just inside the edge. Faint woven and embroidered cloth texture. No sun rays or ray halo, no red, no skull, no weapons. Full colour: not tinted.
```

#### `patterns/eternian/circuit-maze`
- Used by: the circuit-maze brocade (rank by the number of turns), stone bands on the ministries, the banners' edges.
  Tinted per use: gold on black for the court, white on black for the ministers. Reuse: the Ancients' own trim.

```
Seamless tileable texture, 2048x512, the pattern repeating horizontally. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Material: a woven brocade band of a right-angle maze pattern like an Ancient circuit board: continuous lines turning at right angles, small square pads and stepped corners, laid out as a running border between a straight rule above and below; the lines light (#e8e6e0) on a near-black ground (#1a1a1c), a faint woven texture. Geometric only: no glyphs, no letters, no faces. Near-colourless: greys only, so it can be tinted.
```

#### `patterns/eternian/face-frieze`
- Used by: the friezes of the podium, the gate pylons and the ministries (the Bayon done in Deco). Tinted pale stone
  for the State, bronze for the court.

```
Seamless tileable texture, 2048x1024, the pattern repeating horizontally. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Material: a carved stone relief frieze: a row of three large serene faces with closed eyes, each built from flat faceted planes in the Art Deco cubist manner (a straight nose, flat cheek planes, a stepped geometric headdress), alternating with narrow fluted pilasters and stepped Deco chevrons; crisp shallow carving, pale stone (#ddd6c8) with soft grey in the recesses (#a9a296). Calm and serene: no snarls, no skulls, no weapons, no letters. Near-colourless: pale grey only, so it can be tinted.
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
