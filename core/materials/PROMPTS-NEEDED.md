# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 44 prompts.** Owed before 2026-10-23: 1 redo (`patterns/tribal/formline`), 1 required (the Northern Highlands' `bark.alder.lichen`) and 4 optional (the Beast Riders' `foliage.thorn.cut`; necanyons' `card.palm.fan`, `card.flametip`, `card.treelily`; each has a library fallback in use). Added 2026-10-23: 1 optional for the Stalkers (`metal.enamel.scoured`, section 7) and 37 for the kits planned that day (sections 8-13: the NW outer wall, the painted highlands, the Cut, the Bowl, the Catch, the rift rim), each needed before its kit's build. A short list at the end names gaps that have no prompt yet.

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

#### `bark.larch`
- Kind: surface, tintable.
- Used by: the fur larch. Reuse: any larch or tamarack.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Larch bark seen flat-on: deep vertical furrows between thick, flaking, scaly plates that peel at their edges, reddish-brown plates with paler grey weathered faces and darker furrows, a few resin beads and small lichen spots. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1 metre.
```

#### `card.larch`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one branch tip per cell.
- Used by: the fur larch's crown in summer (top two rows) and autumn (bottom row). Reuse: any larch; any soft-needled deciduous conifer.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a short drooping branch tip of a Siberian larch hanging down from the top of its cell: soft needles in dense round tufts like small brushes along the twig, a few small upright brown cones. In the top two rows (six sprites) the needles are fresh soft green (#7a9a3a, #8aaa48); in the bottom row (three sprites) they are autumn gold (#d0a030, #e0b848) with a little orange. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `ground.cladonia`
- Kind: surface, full colour.
- Used by: the caribou moss carpets of the taiga floor and the tundra. Reuse: any reindeer-lichen ground (boreal, alpine).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Dense carpet of reindeer lichen (Cladonia rangiferina) seen from directly above: a deep spongy mat of tiny branching antler-like pale grey-green and silver-white tufts (#c8ccb8, #a8b098, #dcdcd0), a few darker green moss patches and fallen brown larch needles between them, the mat dry and springy. Full colour. One tile covers 1 metre.
```

#### `card.snowball`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the woolly snowball, the kit's signature plant of the fellfield. Reuse: any woolly high-alpine column (the Himalayan snowballs).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one woolly snowball plant (Saussurea gossipiphora) standing on the bottom of its cell: an upright column 15-30 cm tall entirely wrapped in thick white-grey wool (#e8e6e0, #cfcac0), the wool hiding the flowers except for a few dark purple-brown flower tips (#4a3040) peeping from the top, a ring of narrow grey-green felted leaves at the base. Vary the height and plumpness between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.pasque`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one clump per cell.
- Used by: the furflower (spring's first flower). Reuse: any pasqueflower or anemone of the steppe.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a small clump of pasqueflowers (Pulsatilla) on the bottom of its cell: upright bell-shaped cups of six violet petals (#6a4a9a, #7a5aaa) with a golden-yellow centre (#e0b030), every stem, bud and the finely cut leaves covered in long silky silver hairs that catch the light. Two of the nine are gone to seed: feathery silver seed heads instead of cups. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. The subject's pinks and violets are deep and saturated, never the background's pure magenta; key with `spill: edge`.
```

#### `card.fireweed`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one stem per cell.
- Used by: Ivan-chai, on the burns and the larch edges. Reuse: any fireweed or willowherb; burn scars in any cold kit.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one tall fireweed stem (Chamerion angustifolium) standing on the bottom of its cell: a straight stem with narrow willow-like leaves, topped by a long spike of four-petalled flowers in deep rose-magenta (#b8306a, #c84a80), opening from the bottom up, buds at the tip. Three of the nine have gone over: the lower spike split into long thin pods spilling white silky seed fluff. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. The subject's pinks and violets are deep and saturated, never the background's pure magenta; key with `spill: edge`.
```

#### `card.cottongrass`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one tuft per cell.
- Used by: the cottongrass of the bogs and the wet tundra. Reuse: any cottongrass or sedge bog.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one tuft of cottongrass (Eriophorum) on the bottom of its cell: narrow grass-like green leaves (#6a7a3a), several thin stems each topped by a fluffy round head of bright white cotton bristles (#f4f4ee) the size of a walnut. Vary the number of heads, one to six. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.seabuckthorn`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one branch per cell.
- Used by: the silverthorn of the gullies. Reuse: any sea buckthorn or silver-leaved thorn.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one branch of sea buckthorn (Hippophae) standing up from the bottom of its cell: narrow silver-grey scaly leaves (#a8aea0, #c4c8bc), a few thorns, and the stems packed solid with small bright orange berries (#e08020, #f0a030). Vary how laden the branches are. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `ice.aufeis`
- Kind: surface, full colour.
- Used by: the aufeis sheets over the frozen streams. Reuse: any layered river ice; frozen seeps on any cold kit.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Aufeis: layered river overflow ice seen from directly above, thin sheets frozen one over another, milky blue-white (#d8e4ec, #b8d0e0) with clearer blue patches (#8ab4d0) where the ice is thick, trapped strings of white air bubbles, fine cracks, a dusting of snow in the hollows. Full colour. One tile covers 3 metres.
```

#### `card.crop.thule`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell, a crop to a row.
- Used by: the Three Gifts on the fields and in `kits/crops`. Reuse: sweetvetch, the Eskimo potato and roseroot wherever they are grown.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a crop plant on the bottom of its cell. Top row: alpine sweetvetch (Hedysarum alpinum), a leafy plant with pinnate leaves and drooping one-sided spikes of pink-purple pea flowers (#a05a8a), the long pale carrot-like taproot (#d8c090) showing below. Middle row: the Eskimo potato (Claytonia tuberosa), a low rosette of narrow green leaves with small white-pink five-petalled flowers, a round white tuber (#e8dcc8) showing below. Bottom row: roseroot (Rhodiola rosea), a clump of upright stems with fleshy blue-green leaves (#6a8a7a) and flat heads of small yellow flowers (#e0c040), a thick knobbly brown root (#8a6a48) showing below. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. The subject's pinks and violets are deep and saturated, never the background's pure magenta; key with `spill: edge`.
```

## 9. Painted highlands (`biomes/paintedhighlands`, planned 2026-10-23)

The banded plateau by Korona (`biomes/paintedhighlands/PLAN.md` section 5, which lists the library sets it reuses). One
greyscale bedded tile tinted by the strata field (cheaper, preferred), and the bloom's flowers.

#### `rock.badland.bedded`
- Kind: surface, tintable (the strata field colours each bed).
- Used by: the stripe badlands' bare slopes. Reuse: every badland on the strata module's `badland` recipe (ebadlands, the Bowl, the painted highlands).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Bare badland mudstone and clay seen flat-on, a soft eroded slope surface: thin horizontal beds of slightly different hardness, the harder beds standing out as small ledges, the softer ones crumbling into popcorn-textured clay, fine vertical rills running down across the beds, a few small fallen chips. Pale neutral grey-beige only (#b8b2a8, #a49e94, #cfc9be): the colours of the beds will be added by tinting. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 2 metres.
```

#### `card.flower.bloom.highland`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one flower clump per cell.
- Used by: the painted highlands' superbloom drifts. Reuse: any desert or steppe wildflower bloom (sedesert, ebadlands, the Bowl's shore).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one clump of desert wildflowers on the bottom of its cell, a different flower in each: blue lupin spikes (#4a5aa8); scarlet penstemon tubes (#c8302a); orange globe mallow cups (#e0782a); red-orange Indian paintbrush (#d84a2a); a spike of lilac blazing star (#8a6ab0, deep, not pink); yellow desert dandelions (#e8c830); white evening primrose (#f0ecdc); orange and yellow Namaqualand daisies (#f08a20, #f0c020); a mound of pale purple pata de guanaco (#8a5aa0). Grey-green leaves at the base of each. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. The subject's pinks and violets are deep and saturated, never the background's pure magenta; key with `spill: edge`.
```

## 10. The Cut (`biomes/cut`, planned 2026-10-23)

The eigenweapon's bowl and its warped flora (`biomes/cut/PLAN.md`). Reuse: `bark.bamboo.jade` for the hyperbamboo's
culms (scaled up), `ground.salt` and `ground.efflorescence` on the flats, the NW lowlands' sets for the floor's forest.

#### `card.bamboo.giant`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one branch per cell.
- Used by: the hyperbamboo's leafy branches. Reuse: any giant bamboo (the NW lowlands' sky bamboo, the hyperjungle).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one leafy side branch of a giant bamboo (Dendrocalamus) hanging from the top of its cell: a thin jointed green twig with clusters of long narrow lance-shaped leaves (#5a8a3a, #7a9a48) fanning out and drooping, a few older leaves yellowing at the tips (#b0a048). Vary the density of the leaves. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.rankgrass`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one tussock per cell.
- Used by: the rankgrass of the Cut's salt flats. Reuse: any salt grass or blue-grey tussock (the Bowl's shore, any salt marsh).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one low tussock of salt grass (Distichlis, Puccinellia) on the bottom of its cell: a dense stiff tuft of short narrow blue-grey leaves (#8a9a9a, #a0aeae) with a few pale straw seed heads (#c8b890), a little white salt crust on the older leaves. Vary the size. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.crop.melon`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one vine section per cell.
- Used by: the measure melon (and any melon field in `kits/crops`). Reuse: every melon, gourd or squash vine.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a section of melon vine (Cucumis melo) lying on the bottom of its cell: hairy trailing stems with broad lobed green leaves (#4a7a2a), curling tendrils, a few small yellow flowers, and one to three netted melons (#c8b060, #a8a050) lying on the stems. Make the melons on each sprite one of exactly three sizes: small as a fist, as a head, or as a large ball. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `rock.lichen.circles`
- Kind: surface, full colour.
- Used by: the circle lichen on the Cut's bare faces. Reuse: any bare rock face with crustose lichen.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Smooth grey-brown basalt rock face (#6a6660) seen flat-on, covered in crustose lichen growing as perfect round circles: yellow-green (#a8b830) and bright orange (#e07820) discs from a coin to a hand across, each with a slightly darker rim, nesting inside each other and lying side by side, close but never touching, bare rock between them. Full colour. One tile covers 1 metre.
```

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

#### `card.saltbush`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one shrub per cell.
- Used by: the Bowl's halophyte belt. Reuse: any saltbush or silver desert shrub (the crater drylands, the Catch's fans).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one rounded saltbush shrub (Atriplex) standing on the bottom of its cell: a dense mound of small silver-grey scurfy leaves (#a8aca0, #c0c4b8) on stiff pale stems, a few clusters of tiny papery winged seeds (#c8b890). Vary the size and how open the mound is. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.brinelamp`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the brine lamp of the halo. Reuse: any salt-crystal succulent.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one brine lamp: a low succulent standing on the bottom of its cell, fleshy upright blue-green leaves (#5a8a7a) whose surfaces are crusted with sparkling white salt crystals (#f0f0ea) secreted from its glands, the crystals catching the light like frost; a short spike of small pale yellow flowers on four of the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `rock.yardang.silt`
- Kind: surface, tintable.
- Used by: the Bowl's silt cliffs and the Catch's wind-carved lake beds. Reuse: every wind-carved lake bed or yardang (the Catch, the Bowl, the dam basins).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Wind-carved old lake-bed silt and clay seen flat-on: fine horizontal laminations a few millimetres thick, smoothed and fluted by the wind into long shallow grooves running one way, the harder layers standing out as thin ridges, pale buff and cream (#d0c0a0, #bcac8c), small fallen flakes and a little blown sand in the grooves. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 2 metres.
```

## 12. The Catch (`biomes/catch`, planned 2026-10-23)

The sealed basin, its sand sea, its five oases and its salt (`biomes/catch/PLAN.md`). Reuse: `rock.yardang.silt` (above)
for the lake beds, `card.tamarisk`, `card.reed`, `ground.gravel019` and `ground.gravel042` for the reg, `card.saltbush`
(above) on the fans.

#### `ground.sand.dune`
- Kind: surface, tintable.
- Used by: the Catch's sand sea (the dune faces and the interdune). Reuse: any wind-rippled dune field (the eastern desert, the Bowl's shore, the dam basins).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Fine dune sand seen from directly above, swept by a steady wind into regular small ripples a few centimetres apart running one way across the whole frame, the ripple crests a little paler and coarser, the troughs finer and slightly darker, perfectly clean sand with no stones, plants or footprints. Warm pale sand colour (#d8c49a, #c8b086). Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1.5 metres.
```

#### `ground.soda.crust`
- Kind: surface, full colour.
- Used by: the alkaline crust of the Catch's terminal lake and its dry beds. Reuse: any soda lake or alkali flat (Lake Natron, Owens Lake).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The crust of a dried alkaline soda lake seen from directly above: brittle white and grey crust of trona and natron (#e8e6e0, #c8c6c0) heaved into small blisters and crisp curled plates, fine powdery white efflorescence in the cracks, a faint pinkish-orange tint (#e0b8a0) in the damper hollows, dark grey mud (#6a6660) showing in a few deeper cracks. Full colour. One tile covers 2 metres.
```

#### `bark.poplar.euphrates`
- Kind: surface, tintable.
- Used by: the oases' Euphrates poplars (the tugai). Reuse: any desert poplar or cottonwood.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Euphrates poplar (Populus euphratica) bark seen flat-on: thick deeply fissured grey-brown bark (#8a7e6a) in long rough ridges, pale grey weathered faces, a few dark wet-looking streaks, small burls, a little salt crusted white in the fissures. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1 metre.
```

#### `card.poplar.euphrates`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one twig per cell.
- Used by: the Euphrates poplars' crowns. Reuse: any desert poplar.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one leafy twig of the Euphrates poplar standing up from the bottom of its cell, showing its two kinds of leaf: narrow willow-like leaves on the lower part of the twig, broad toothed fan-shaped leaves at the tip, all a dusty grey-green (#7a8a5a, #8a9a68). On the bottom row the leaves have turned autumn gold (#d0a830). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

## 13. The rift rim (`biomes/riftrim`, planned 2026-10-23)

The three rims (`biomes/riftrim/PLAN.md` section 3 and 10). Reuse: `card.rheumleaf` for the rimroot, `card.fin.membrane`
for the sailwort (tinted rust), `card.moss.hanging` and `card.beard` for the veil thread (tinted copper), `card.heath` for
the prism heath (the kit tints it by season), `ground.sphagnum` for the moor sponge, `card.groundsel`, `ground.tundra`,
`ground.lichen.crust`, the snows and ices, and the Rift's, the SW lowlands' and the S highlands' own sets for the borrowed
species.

#### `bark.frill.ribbed`
- Kind: surface, tintable.
- Used by: the N rim's frost frill column (and the W's mist frill). Reuse: any ribbed, fluted alien trunk (the Rift's frill trees).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The trunk of an alien tree seen flat-on: the bark drawn into tight vertical ribs and flutes like a column, each rib smooth and slightly waxy, the grooves between them darker, short horizontal scars in rings up the trunk where fins have fallen. Cool teal-grey (#5a7a7a, #4a6a6c). Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1 metre.
```

#### `card.fin.glass`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one fin cluster per cell.
- Used by: the frost frill's translucent fins. Reuse: any glassy, translucent leaf or fin (light-piping alien plants).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a whorl of three to five short stiff fins radiating from a stub on the bottom of its cell, each fin a thin pointed blade like a fin of ice: translucent pale teal glass (#a8d8d8) with clearer edges (#d8f0f0), fine darker veins (#4a8a8c) running from base to tip, the light passing through it. Vary the length and angle of the fins. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.bellfir`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one bell per cell.
- Used by: the N rim's bell fir crowns. Reuse: any bell- or cone-shaped needle crown.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: the tip of a bell fir: an inverted bell, open at the bottom, made of dense pleated blue-green needles (#3a6a6a, #5a8a84) radiating from a pale stalk at the top of its cell, the needles in neat folded pleats like a skirt. On the bottom row the bells are closed for winter: drawn together into a tight pointed bud with frost on the needles. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `ground.lenswort`
- Kind: surface, full colour.
- Used by: the N rim's lenswort carpets. Reuse: any window-leaf succulent ground (Lithops fields).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A dense carpet of tiny succulent plants seen from directly above, packed edge to edge: each plant a pair of fat rounded leaves the size of a fingertip whose flat tops are clear translucent windows (#c8e8e0) like glass beads, the leaf sides pale teal-grey (#8aaca8), a few with small violet flowers (#6a4a9a, deep, not pink) between the leaf pairs, grit showing in the gaps. Full colour. One tile covers 0.5 metres.
```

#### `card.starberry`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one sprig per cell.
- Used by: the N rim's starberry (the fruit). Reuse: any low berry shrub.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one sprig of a low evergreen berry shrub standing on the bottom of its cell: small glossy oval dark green leaves (#2a4a3a), and clusters of berries shaped like five-pointed stars, unripe ones teal (#4a9a9a), ripe ones deep violet (#4a2a7a, not pink). Vary the ripeness across the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.sunrosette`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one rosette per cell.
- Used by: the S rim's sun rosettes. Reuse: any dark, furred alpine rosette.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one large alpine rosette seen from a little above, sitting on the bottom of its cell: a dense round rosette of thick fleshy leaves overlapping like an artichoke, covered in short soft fur, almost black with a deep violet sheen (#1e1a24, #2e2438), the leaf tips silvered with frost, the whole rosette tilted to one side as if facing the sun. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.cushion.anemone`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one cushion per cell.
- Used by: the S rim's cushion anemones. Reuse: any flowering cushion plant.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one dense dome-shaped cushion plant sitting on the bottom of its cell: a tight dome of short dark green-black stalks (#1e2a22) packed together, each tipped with a small spray of bright red anemone-like petals (#c8241e, #e03a2a), so the dome is dotted with red. On three of the nine the sprays are closed for the night: small dark red knots. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.lobelia.lantern`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one spike per cell.
- Used by: the S rim's lantern lobelias. Reuse: any giant alpine lobelia.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one giant alpine lobelia (Lobelia telekii) standing on the bottom of its cell: a tall narrow column 2-3 times as high as it is wide, densely covered in long silver-white hairy bracts (#d8dcd8) that hide pale blue flowers (#8ab0d8) glowing faintly from inside, a rosette of long grey-green leaves at the base. Vary the height. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `rock.lichen.iris`
- Kind: surface, full colour.
- Used by: the S rim's boulder fields. Reuse: any lichen-crusted high-alpine boulder.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Dark grey granite boulder surface (#4a4846) seen flat-on, covered in crustose map lichens: irregular patches in black (#1a1a1c), rust (#a04a20) and an iridescent violet (#5a3a8a, deep, shifting to blue at the edges), each patch outlined by a thin black line where it meets the next, like a map, bare rock showing between some of them. Full colour. One tile covers 1 metre.
```

#### `ground.snow.algae`
- Kind: surface, full colour.
- Used by: the S rim's summer snowfields (snowblood). Reuse: any watermelon-snow field (every high, snowy kit in summer).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Old summer snow seen from directly above: coarse granular snow with sun cups (shallow scalloped hollows), stained by snow algae in streaks and blotches of watermelon red (#c84a5a), rust (#b8603a) and a deeper violet (#6a3a6a) concentrated in the hollows, clean white snow (#f0f0f2) on the ridges between, a little dark dust. Full colour. One tile covers 2 metres.
```

#### `card.mistcup`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one rosette per cell.
- Used by: the W highland's mist cups. Reuse: any tank rosette (bromeliad-like) on the ground.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one ground rosette seen from a little above, on the bottom of its cell: stiff broad leaves curved up into a deep cup, copper-green (#6a7a3a) edged with gold (#c8a040), the cup at the heart holding a small clear pool of water with droplets beaded on the leaves round it. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.lobelarch`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one branch per cell.
- Used by: the W highland's lobe larch. Reuse: any lobed-pad deciduous tree.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one branch tip hanging from the top of its cell, carrying flat round pads of lobed leaves like hands. Top two rows (six sprites): summer, a deep plum-green (#3a4a2a, #5a5a32) with plum stems (#5a2a3a). Bottom row: autumn, the pads turned violet and gold (#6a3a8a, #d0a030; the violet deep, not pink). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `ground.lakebed.algal`
- Kind: surface, full colour.
- Used by: the N rim's algal lake shallows. Reuse: any cold algal shallows or stromatolite flats.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The shallow bed of a cold mountain lake seen from directly above through clear water: soft algal mats in teal (#2a8a8a) and violet (#5a3a8a) spreading over pale grey silt, small rounded stromatolite-like domes a hand across rising from the mats, a few pebbles, the mats' edges frilled. Full colour. One tile covers 2 metres.
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
