# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 48 prompts.** Owed before 2026-10-23: 1 redo (`patterns/tribal/formline`), 1 required (the Northern Highlands' `bark.alder.lichen`) and 4 optional (the Beast Riders' `foliage.thorn.cut`; necanyons' `card.palm.fan`, `card.flametip`, `card.treelily`; each has a library fallback in use). Added 2026-10-23: 1 optional for the Stalkers (`metal.enamel.scoured`, section 7) and 41 for the kits planned that day (sections 8-14: the NW outer wall, the painted highlands, the Cut, the Bowl, the Catch, the rift rim, Farside), each needed before its kit's build. Added 2026-10-26: 24 more for the kits planned that day (sections 15-18: the
Godthrone and the airless rim, the W outer wall, the SW highlands, Godstep valley), **72 in all**. A short list at the end
names gaps that have no prompt yet.

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

## 14. Farside (`biomes/farside`, planned 2026-10-23)

The ocean coast where the sea's plants are invading the land (`biomes/farside/PLAN.md` section 9, which lists the many
marine sets the library already has: the kelp cards, seaweed, seagrass, reef and coral sets).

#### `bark.kelp.stipe`
- Kind: surface, tintable.
- Used by: the land kelp's stipes. Reuse: any giant kelp or algal stalk.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The surface of a giant kelp stalk seen flat-on, as a trunk: smooth, rubbery, slightly glossy olive-brown skin (#6a5a2a, #7a6a32) with long faint lengthwise streaks, a fine pale crust of lime (#c8c0a8) in patches as if stiffened with chalk, small round scars where blades and bladders have broken off, a few tiny white tube-worm coils. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 0.5 metres.
```

#### `ground.wrack`
- Kind: surface, full colour.
- Used by: the strand's wrack heaps and the kelp coast's floor. Reuse: any beach wrack line or seaweed-covered ground.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Ground thickly covered with heaped, wet, cast-up seaweed seen from directly above: tangled olive-brown bladderwrack straps with paired bladders (#5a4a22, #7a6a30), golden kelp blades (#a88a3a), a few crimson red-weed fronds (#8a2a2a) and emerald sea lettuce (#3a8a3a), all glistening wet, small pale shells and sand showing in the gaps. Full colour. One tile covers 1.5 metres.
```

#### `organic.sponge`
- Kind: surface, full colour.
- Used by: the fog sponges on the fog belt's bark and rock. Reuse: any sponge or porous encrusting organism.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A living sponge crust seen flat-on: a soft, lumpy, porous surface of irregular rounded knobs and low chimneys, each with a dark open pore (osculum) at its top, the whole surface pitted with fine pores, ochre and orange (#c8902a, #d8702a) shading to grey (#8a8478) at the edges, damp and slightly velvety. Full colour. One tile covers 0.5 metres.
```

#### `card.wineweed`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one frond or sheet per cell.
- Used by: the wine weed hung from the trees at the front and in the fog belt. Reuse: any red seaweed.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one red seaweed hanging from the top of its cell: on five of the nine, thin translucent ruffled sheets (Porphyra) in deep wine-red and crimson (#7a1a2a, #9a2a30) with darker veins; on four, finely branching fronds (Gracilaria) in dark crimson to brown-red (#6a1a1a, #8a3a2a), glistening wet, a few drops at the tips. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. The subject's reds are deep wine and crimson, never the background's pure magenta; key with `spill: edge`.
```

## 15. The Godthrone and the airless rim (`biomes/godthrone`, planned 2026-10-26)

The titanium shield volcano, its glass halo, the orange belt, the bloodfalls and the airless crest
(`biomes/godthrone/PLAN.md` section 8). Reused from the library: `ground.lava.aa`, `ground.lava.crust`,
`ground.lava.veins`, `ground.obsidian`, `ground.sand.black`, `ground.scoria`, `ground.cinder`, the `rock.basalt.*` sets
(tinted near-black with a cool sheen for the titanium basalt), `rock.columnar` (the escarpment's colonnades),
`stone.pumice`, `ice.glacier`, `ice.clear`, `ground.snow011`, `ground.travertine.white` (under the rust terraces' tint).
Needed before the kit's G1.

#### `ground.beads.orange`
- Kind: surface, full colour.
- Used by: the glass halo round the summit vent. Reuse: any fire-fountain bead deposit; the Moon's orange soil anywhere.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A loose drift of tiny volcanic glass beads seen from directly above, like the Moon's orange soil under a hand lens: countless round and teardrop beads, most of them translucent orange glass (#d8701c, #e88a30, #c05a14) with a faint glassy sheen, mixed with opaque jet-black beads (#141210, #222018) in streaks and patches, a few broken bead shards and dumbbell-shaped beads, very fine and well sorted, the surface gently rippled. Full colour. One tile covers 0.5 metres.
```

#### `rock.palagonite`
- Kind: surface, full colour.
- Used by: the orange belt, where the glass weathers. Reuse: any altered basaltic glass and hyaloclastite (Iceland, Hawaii, Mars-like ground).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A face of palagonite tuff seen flat-on: soft, crumbly altered volcanic glass in ochre, yellow-orange and rust (#c08a3a, #d49a40, #a85c28), set with angular fragments of fresh black glass and grey basalt (#1c1a18, #4a4642) that have not altered yet, a fine granular texture, small pits where grains fell out, faint bedding lines. Full colour. One tile covers 2 metres.
```

#### `card.pele.hair`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one tuft per cell.
- Used by: the mats of glass hair caught in the halo's hollows. Reuse: any lava fountain's surroundings (the Throne's vents, the geyser kit's lava).

```
A sheet of nine separate cut-out sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a loose tangled tuft of Pele's hair, volcanic glass spun into threads as fine as human hair: golden-brown to honey-gold (#c89a40, #e0b860, #a87830), glinting, the threads matted and wind-combed in one direction, a few tiny black glass teardrops (Pele's tears, #181614) caught at the thread ends. Vary the size and shape: some tufts flat and wide, some balled. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `rock.megabreccia`
- Kind: surface, full colour.
- Used by: the airless rim's crest and the W outer wall's slump scarps. Reuse: any impact crater's walls; fault breccia; any shattered patchwork rock.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: An impact megabreccia rock face seen flat-on: angular blocks of many different rocks jammed together at every angle, a patchwork with no layering: pale grey granite, banded red-and-cream sandstone, dark green-black basalt, white marble, rust-red shale (#b8b4ac, #c07050, #2a3028, #e8e4dc, #8a3a2a), from fist-sized to filling a quarter of the frame, set in a fine grey crushed-rock matrix (#7a7670) flecked with small black and bottle-green glass blobs (#101410, #2a5a3a), sharp fractures, no weathering varnish, fresh colours. Full colour. One tile covers 4 metres.
```

#### `rock.tafoni`
- Kind: surface, tintable.
- Used by: the salt- and frost-weathered rock of the dry-cold line and the airless rim. Reuse: any rock face with honeycomb weathering (coasts, deserts, Antarctica).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A rock face with honeycomb weathering (tafoni) seen flat-on: a lattice of rounded cavities and hollows from fingertip-sized to fist-sized, thin sharp ridges and walls between them, larger hollows holding smaller ones inside, the rock grey-buff and fine grained, slightly darker inside the cavities. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1 metre.
```

#### `ice.debris`
- Kind: surface, full colour.
- Used by: the relic debris-covered glaciers on the flanks and in the rim's cirques. Reuse: any rubble-covered glacier, rock glacier or buried-ice field.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A debris-covered glacier seen from directly above: a thin skin of angular grey and dark brown rock rubble and grit (#6a6660, #4a4038, #8a8478) over old glacier ice, the blue-white ice (#bcd4e0, #8ab4cc) showing through in round sublimation pits and cracks where the cover is thin, the pits ringed by darker sorted gravel, dry and dusty, no meltwater. Full colour. One tile covers 4 metres.
```

#### `ice.rust`
- Kind: surface, full colour.
- Used by: the bloodfalls: the ice cliff and the snow stained by the iron seep. Reuse: any glacier stained by iron, algae or mineral springs.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Glacier ice seen flat-on, stained by an iron-rich seep: white and pale blue ice (#e8eef2, #b8d0dc) with streaks, drips and broad washes of blood-red and rust (#9a1a14, #c0301c, #7a2a1a) running down it in vertical runnels, the red deepest in the runnels and fading to orange-brown at their edges, a few frozen red drips and icicle stubs, small air bubbles in the clear ice. Full colour. One tile covers 2 metres.
```

#### `ground.rust.terrace`
- Kind: surface, full colour.
- Used by: the rust terraces under the bloodfalls. Reuse: any iron-rich spring's deposits; acid mine seeps; ochre springs.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Iron-oxide spring deposits seen from directly above: small stepped terraces and rimmed pools like travertine but made of soft rust, deep red-orange and ochre (#a8401c, #c8682a, #d89a48), the pool floors darker and smoother, the rims crusted and slightly paler, thin films of shallow water in a few pools, fine silky rust-red slime on the wet surfaces. Full colour. One tile covers 1 metre.
```

#### `ground.riverweed.red`
- Kind: surface, full colour.
- Used by: the blood river's red riverweed carpeting its rapids and pools (the Godthrone's station 6; the Xanadu and rift kits downstream). Reuse: any crimson aquatic plant bed (Caño Cristales).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A dense carpet of crimson aquatic plants growing on smooth river rock, seen from directly above as if through very clear shallow water: tufts of short fine-branched red and wine-purple fronds (#b01830, #8a1a3a, #c83a3a) combed in one direction by the current, some tufts more orange-red, small patches of bare dark grey rock (#3a3836) and yellow-green algae (#9aa830) between them. Full colour. One tile covers 1 metre.
```

## 16. The W outer wall (`biomes/wouterwall`, planned 2026-10-26)

The loess bench, the slump scarps and the sturzstroms (`biomes/wouterwall/PLAN.md` section 8). Reused: `ground.steppe`,
`ground.tundra`, `ground.turf.polygon`, `ground.tilled` (the terraces, tinted buff), `card.stipa`, `card.grass.dry`, the
nwouterwall's sets (section 8 here) and `rock.megabreccia` (section 15). Needed before the kit's W1.

#### `rock.loess`
- Kind: surface, full colour.
- Used by: the gully walls, the earth pillars and the cave-house fronts. Reuse: any loess country; any soft silt cliff.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A vertical loess cliff seen flat-on: massive, fine, pale buff-yellow silt (#c8a878, #d4b888, #b89868) with no bedding, split by vertical joints and shallow vertical runnels, tiny white root casts and calcium nodules scattered through it, one or two faint horizontal darker brown bands of buried soil (#9a7a58) across the frame, a few small holes from burrows, the surface dusty and dry. Full colour. One tile covers 2 metres.
```

#### `rock.rubble.sturzstrom`
- Kind: surface, tintable.
- Used by: the sturzstrom lobes' hummocks. Reuse: any rock-avalanche or landslide debris; moraine rubble.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Rock-avalanche debris seen from directly above: a chaotic spread of angular rock blocks from fist-sized to a metre across, many of them shattered in place into jigsaw pieces that still fit together, fresh sharp edges, packed in crushed rock grit and dust, no rounding and no sorting, no plants. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 4 metres.
```

#### `organic.dusttower`
- Kind: surface, full colour.
- Used by: the dust towers of the loess tablelands (and, tinted, the red dust reef and the dust spire in the lowlands). Reuse: any colonial mound-building organism.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The surface of an alien colonial organism's mound seen flat-on: dark blue-black cemented silt (#1a1c24, #2a2c34) covered in raised round bosses from coin-sized to palm-sized, each boss a tight spiral shell-like whorl ringed in bright orange (#e07020, #f0902a), the orange bleeding into the dark between them in veins, fine pale dust caught in the hollows. Full colour. One tile covers 1 metre.
```

#### `card.puya`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the puya spike (and its derived blue and candelabra forms in the lowlands). Reuse: any giant terrestrial bromeliad or rosette spike.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. In the top two rows (six sprites): a giant Puya raimondii rosette standing on the bottom of its cell: a dense round ball of hundreds of long stiff narrow spears with hooked spines, grey-green (#7a8a70, #8a9a80), the lower dead spears hanging in a brown skirt (#6a5a40) round a short thick trunk. In the bottom row (three sprites): the same rosette crowned by a huge flower spike many times its height, the spike packed with cream-green flowers (#c8d0a0, #a8b880) in spirals. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

## 17. The SW highlands (`biomes/swhighlands`, planned 2026-10-26)

Native fungoid life on the Inner Wall's south-west sector (`biomes/swhighlands/PLAN.md` section 8). Reused from the
library, so not asked for: `organic.cap.porous` (the bead cone), `organic.flesh.cells` (the cell lamp, tinted yellow),
`organic.fungus.bracket` and `organic.fungus.gill` (the shelf coral, tinted orange), `organic.lattice.cage` (the lattice
oak's gaps), `bark.whorled` (the whorl column), `bark.boojum` (the bottle brush), `bark.twisted.red` and `bark.mangrove`
(the stilt pod tree's stilts), `skin.alien.banded` (the banded coral), `card.alienflora.glow` and `card.mushroom.glow` (the
glow tubes), `card.fungus.drip` (the drip cap), `card.beads.bell` (the bead cone's eggs), `card.vine.hanging.*` and
`card.streamer` (the weeping wisp), `card.tendril` (the fishing bridge's vines), `card.carnivore.*` and
`card.pitcher.trumpet` (the bulb trumpets), `card.flowerspike` and `card.firelily` (the torch spike),
`rock.limestone.karst`, `rock.sandstone.navajo`, `ground.moss001`-`003`, `ground.sphagnum` (the hanging swamps); the glass
tower is `biomes/ehighlands`' own. Needed before the kit's H1.

#### `rock.sandstone.liesegang`
- Kind: surface, full colour.
- Used by: Span's tableland and the pillar rim (`refs/01`). Reuse: any banded red-and-white sandstone country (Zion, the Wave).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A smooth quartz sandstone cliff face seen flat-on: broad horizontal beds alternating iron-red (#b83a3a, #c84a48) and bleached chalk-white (#ece4dc, #d8ccc4), crossed at a slant by thin wavy diagonal bands of darker red and ochre (Liesegang bands, #8a2a28, #c08040) that cut across the beds like contour lines, fine vertical weathering streaks, a few thin dark partings, a faint sugary grain. Full colour. One tile covers 4 metres.
```

#### `rock.limestone.opal`
- Kind: surface, full colour.
- Used by: the opal-shell limestone in the ring folds' ridges. Reuse: any ammolite or shell-bed limestone; a precious-stone inlay.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A weathered limestone bed seen flat-on, packed with fossil shells whose broken faces shine like ammolite: grey-buff limestone matrix (#a8a090, #8a8478) holding curved shell fragments and whole coiled shells from fingernail to hand size, their broken nacre flashing iridescent fire in patches of red, green, gold and blue (#c83a2a, #3aa860, #e0b030, #3a70c0), the colours in mosaic-like cells, the rest of the shells dull grey-brown. Full colour. One tile covers 1 metre.
```

#### `bark.cord.braided`
- Kind: surface, tintable.
- Used by: the lattice oak (and, tinted lacquer-red, the lowlands' red lattice sprawl). Reuse: any tree whose trunk is a braid of cords or roots (strangler figs, rope trees).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A tree trunk made of many smooth living cords seen flat-on: rounded cords from finger-thick to arm-thick running roughly vertically, twisting round each other in a loose braid, fusing where they touch, dark gaps between them, the cords' skin smooth with fine lengthwise wrinkles and a few small pale lenticels, faintly glossy. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1 metre.
```

#### `organic.pod.honeycomb`
- Kind: surface, full colour.
- Used by: the stilt pod tree's spore pods (`refs/02`). Reuse: any alien seed head or honeycombed fruiting body.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The skin of an alien spore pod seen flat-on: a close honeycomb of raised rounded hexagonal cells, mint and sea green (#7ac8a8, #5aa888), each cell with a dark round open pit in its centre (#1a3a30) ringed by a paler lip (#a8e0c8), the cells packed edge to edge in slightly uneven rows, a faint waxy sheen. Full colour. One tile covers 0.5 metres.
```

#### `organic.lichen.plates`
- Kind: surface, full colour.
- Used by: the log crust on fallen trees and landslide scars (`refs/12`). Reuse: any foliose lichen on wood or rock in a wet native forest.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Old weathered grey wood (#6a6660) seen flat-on, covered in rosettes of leafy lichen: round wavy-edged plates from coin to saucer size, teal-green in the middle (#3a8a7a, #4aa090) shading to gold and ochre at their lobed rims (#c8a040, #d8b050), overlapping one another, a few pale blue-white frosted tufts (#c8dce8) of fine branching lichen between them. Full colour. One tile covers 0.5 metres.
```

#### `card.bulbheath`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one clump per cell.
- Used by: the bulb heath on the balds (and the bay's savanna). Reuse: any alien water-storing bulb plant.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a clump of two to four swollen water-storing bulbs standing on the bottom of its cell, round to pear-shaped, smooth slate blue-grey (#6a7a98, #8090b0) with scattered round yellow eyespot pores ringed in dark olive (#d8c040, #4a5030); from the tops rise broad curling leaves in deep green (#2a7a5a) and a few lily-like flowers in salmon-orange and coral (#e8784a, #f09060); in three sprites the bulbs carry thin pale-blue antennae ending in glowing blue droplets (#60c0f0). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.wingreed`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one stem per cell.
- Used by: the wing reed in the hanging swamps. Reuse: any alien reed or patterned-leaf herb.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one or two tall dark stalks (#2a2430) standing on the bottom of their cell, each topped by a pair of upright leaves shaped like butterfly wings: velvety near-black (#1a1820) with bold gold-yellow veins and eye-spots (#e0b030, #f0c840) and a pale cream wing edge, a knobbly olive-green swelling (#5a6a3a) halfway up each stalk. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.triplets`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the bearded triplets in the rain wall's understorey (and the bay's jungle floor). Reuse: any bat-flower-like shade herb.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a low plant on the bottom of its cell carrying two or three broad drooping bracts like wide leaves, deep teal shading to blue-violet at the base (#1aa890, #2a6a8a, #3a3a7a), each bract crowned with a cluster of pale yellow pointed flowers (#f0e080) and trailing many long thin teal whiskers (#3ac8a8) down past the bottom of the plant, a small rust-red fruiting knot at the centre (#a84a3a). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. The subject's blues and violets are deep and saturated, never the background's pure magenta; key with `spill: edge`.
```

#### `card.scarp.succulents`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the dry east scarp: arrowheads (top row), coral melon (middle row), star-fruit caudex (bottom row); the arrowheads and coral melon also in the lowlands' hills. Reuse: any dry alien scrub.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Top row: an aloe-like clump of spiny grey-green leaves on pale swollen roots, throwing up tall slim stems each tipped by a yellow-green spearhead bud (#c8d040, #8ab048) over a skirt of hanging orange tubular flowers (#f08a20). Middle row: a short plant of thick green stems (#4a8a5a) branching into bright red coral-like arms (#d83a20, #e85a30) that carry round pale-green ribbed melons (#a8d070). Bottom row: a squat swollen pale grey-green stem (#a8b08a) with a few broad grey leaves on top and green spiky star-shaped fruits (#6a8a40) on short stalks. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

## 18. Godstep valley (`biomes/godstep`, planned 2026-10-26)

The titanium lava staircase (`biomes/godstep/PLAN.md` section 7). Reused: `ground.lava.aa`, `ground.lava.crust`,
`ground.sand.black` (the black dunes), `ground.scoria` (tinted red for the flank vent's crater), `ground.cinder`,
`rock.basalt.*`, `rock.columnar` (the colonnades), `ground.redsoil` (the redlands' soil), `ground.playa.red` (the
lava-dammed playas, tinted pale), `rock.palagonite` (section 15). Needed before the kit's D1.

#### `rock.laterite`
- Kind: surface, full colour.
- Used by: the redlands' breakaway cliffs (`refs/05`). Reuse: any tropical laterite or iron-crusted red cliff.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A laterite cliff face seen flat-on: deep brick-red and rust earth (#a83a24, #c04a2a, #8a3020) cut by many fine vertical rain runnels and fluted ribs, a hard iron crust in darker purple-brown nodules and pea-sized pisolites (#5a2a20) near the top, paler pink-orange mottled clay (#d8806a) in patches, crumbling grains at the foot of the runnels. Full colour. One tile covers 2 metres.
```

#### `card.guyedstalk`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the red guyed stalk on the rilles' floors, the Talovolci's fibre crop (`refs/01`). Reuse: any tall alien crop or wetland stalk.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one very tall thin stalk standing on the bottom of its cell, dark red-brown (#6a2a2a), held upright by four to six thin red guy-roots (#a83a30) that run from partway up the stalk out and down to the ground like tent ropes, topped by a flat open cup of fleshy pointed red petals (#c83a30, #e05a40) with paler orange tips (#f08a50); in three sprites the cup is still a tight closed red bud like an artichoke. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

## 19. The Outlands (`biomes/outlands`, planned 2026-10-26)

The walled basin beyond the Gate (`biomes/outlands/PLAN.md` section 11): a native fungoid flora (violet, teal, rust, copper
green; no leaves, no flowers), cold steppe and desert, a salt lake, copper-stained gem hills, the fog woods. **13 prompts**
(this section raises the count above by 13). Reused: `ground.steppe`, `ground.puna`, the gravel scans, `ground.salt`,
`ground.efflorescence`, `rock.malachite`, `rock.gossan`, the basalt sets, `ice.clear`, `ground.turf.polygon`,
`ground.lichen.crust`, the fungoid `organic.cap.*`, `organic.fungus.bracket`, `ground.mycelium.gold`, `card.fungus.drip`,
`card.shelf.glow`, `card.palm`. Also needed here and owed above: `rock.badland.bedded` (section 9), `ground.salt.ochre` and
`ground.soda.crust` (sections 11, 12), `organic.pod.honeycomb` and `organic.lichen.plates` (section 17). Needed before the
kit's O2.

#### `ground.wadi.cobble`
- Kind: surface, full colour.
- Used by: the dry wadi floors (Z7). Reuse: any dry river bed, arroyo or braided channel.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A dry desert river bed: water-rounded cobbles and pebbles of mixed rock packed together, 3 to 20 cm across, grey basalt (#4a4846), pale tuff (#c8bfae), red sandstone (#9a5a40) and the odd green-stained stone (#5a8a70), with drapes of cracked pale silt (#bfb3a0) curling between them in the hollows and a little coarse sand (#a89a84). Full colour. One tile covers 2 metres.
```

#### `ground.pavement.desert`
- Kind: surface, full colour.
- Used by: the cold desert plateau (Z5, the Nursery Plateau). Reuse: any desert pavement, reg or gibber plain.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A desert pavement: a tight interlocking mosaic of flat angular pebbles 1 to 6 cm across, set flush in pale silt like cobbles in a road, their tops polished dark by desert varnish (#3a2a22, #5a3a28, #6a4a30), a few lighter quartz pebbles (#d8d0c0), thin lines of pale silt (#c8b8a0) between the stones. Full colour. One tile covers 1 metre.
```

#### `ground.biocrust.fog`
- Kind: surface, full colour.
- Used by: the fog woods' ground carpet, the fog pelt (Z3). Reuse: any damp alien biocrust or moss-crust floor.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A damp living crust carpeting the ground: soft rounded lumps and cushions of fleshy crust, a few centimetres high, packed tight, in deep violet (#4a2a5a), teal (#2a6a6a) and blue-grey (#5a6a7a), beaded with tiny water droplets, small paler lilac pores (#9a80b0) dotting their tops, dark damp soil (#2a2420) showing in the cracks between them. Not moss and not grass: no leaves, no blades. Full colour. One tile covers 1 metre.
```

#### `rock.turquoise.vein`
- Kind: surface, full colour.
- Used by: the gem hills' turquoise workings (station 3). Reuse: any turquoise or copper-altered host rock.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Pale altered rock, chalky cream and buff (#d8cdb8, #c4b49a), with rust-brown limonite stains (#9a5a2a), cut by a network of thin veins and rounded nodules of robin's-egg turquoise (#4ab0b0, #6ac8c0, #2a8a90), some nodules with fine dark brown matrix lines like a spider's web (#4a3a2a). Full colour. One tile covers 1 metre.
```

#### `rock.schist.emerald`
- Kind: surface, full colour.
- Used by: the gem hills' emerald workings (station 3). Reuse: any dark mica schist or gem-bearing metamorphic rock.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Dark glittering mica schist in thin wavy layers, charcoal and dark grey-brown (#2a2826, #3a3632, #4a4440) with a faint silvery mica sheen, folded around white calcite veins (#e0dcd4), with scattered small six-sided green beryl crystals and clusters (#1a8a4a, #2aa860, #0a6a3a) set in the calcite. Full colour. One tile covers 1 metre.
```

#### `ice.lake.saltrim`
- Kind: surface, full colour.
- Used by: the frozen lakes of the plateau (Z8), the Gate. Reuse: any frozen saline lake, frozen pan or brine ice.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The frozen surface of a salty lake: clear dark blue-black ice (#1a2a3a, #2a3a4a) with trapped white bubble columns, crossed by pressure cracks rimmed with crusts of white salt crystals (#e8ecec) and pale frost flowers (#d8e0e4), patches of thin powder snow (#e0e6ea) caught in the cracks. Full colour. One tile covers 2 metres.
```

#### `organic.cap.violet`
- Kind: surface, full colour.
- Used by: the veil caps' discs and the fog woods' caps (Z3). Reuse: any violet or teal alien fungal cap.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The top skin of a giant fleshy fungal cap seen close: a soft velvety surface of fine radiating fibres and shallow wrinkles, deep violet (#4a2a6a) shading to teal (#2a6a70) in irregular patches, sprinkled with small round paler pores (#9a88c0), a few darker veins (#2a1a3a) branching through it, slightly damp. Full colour. One tile covers 1 metre.
```

#### `organic.pleat.skin`
- Kind: surface, full colour.
- Used by: the pleat columns and drum clusters, the water-storing bodies (Z2, Z5). Reuse: any ribbed succulent-like alien skin.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A smooth taut fleshy skin folded into regular vertical pleats about 5 cm apart, like an accordion, blue-grey and grey-teal (#5a7a80, #4a6a72, #7a9a9a) with a waxy bloom, the pleat edges thin rust-orange lines (#a85a30), tiny pale pores (#c0ccc8) along the ridges. The pleats run straight from the top edge to the bottom edge. Full colour. One tile covers 1 metre.
```

#### `organic.lace.copper`
- Kind: surface, full colour.
- Used by: the lace crust and green fans on the gem hills' rock and spoil (station 3). Reuse: any copper-stained rock crust.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Weathered pale grey rock (#a8a49c) covered in a living lace: a net of thin branching rootlike strands and flat lobed patches in bright copper blue-green and turquoise (#2aa8a0, #4ac0a8, #1a8a7a), thicker where they meet, with small rust-orange dots (#c06a30) at the knots, the bare rock showing through the gaps. Full colour. One tile covers 1 metre.
```

#### `card.fogcomber`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one piece per cell.
- Used by: the veil caps' hanging thread fringes and the comb masts' combs (Z3).

```
A sheet of nine separate cut-out sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Sprites 1-6: a hanging curtain of many very fine silvery-white threads (#d8dce0, #b8c0c8) falling straight down from a thin dark slate-blue band at the top (#2a3040), strung with tiny water beads, each curtain a little different in length and density, the ends ragged. Sprites 7-9: a thin flat teal comb plate (#2a7a78) with a row of fine teeth along its lower edge, edged in rust (#a85a30). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.outlands.scrub`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the sac brush, grey cushion and ember scrub of the steppe and desert (Z4, Z5).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Alien desert shrubs with no leaves and no flowers. Sprites 1-3: a low bristly bush of thin wiry grey stems (#6a6a62) carrying many small round sealed sacs in dusty teal (#6a9a98). Sprites 4-6: a dense dome-shaped cushion of fused grey stems (#8a8a84) with a rust-red heart showing in the gaps (#8a4a30). Sprites 7-9: an upright shrub of hard rust-red tubes (#a84a2a) flushing scarlet at their tips (#d83a20), like a bundle of thin coral. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.outlands.crust`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one piece per cell.
- Used by: the needle fur, crust rosettes, pebble mats and salt fans (Z4-Z6).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Small alien ground plants with no leaves and no flowers. Sprites 1-3: a tuft of very fine upright rust and straw tubes like stiff fur (#a86a3a, #c8a070). Sprites 4-5: a flat spiral rosette of overlapping teal-grey crust lobes (#5a7a78) seen slightly from above. Sprites 6-7: a cluster of rounded blue-grey plates that look like pebbles (#6a7480). Sprites 8-9: a pale upright fan crusted with white salt crystals (#e8e8e0) over a pink core (#d8a0a0). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject except the pale pink core of sprites 8-9.
```

#### `card.outlands.wadi`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the ribbon mat, bell pool, curtain weed and glow bell of the springs and seeps (Z1-Z3, Z7).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Alien water plants with no leaves and no flowers. Sprites 1-2: long flat bright green ribbons (#3a9a4a) streaming sideways as if in a current. Sprites 3-4: a cluster of hanging bell-shaped translucent teal bladders (#4a9a98) on short pale stalks. Sprites 5-6: a trailing veil of dark green and deep blue-grey strands (#2a4a2a, #2a3a4a) hanging straight down. Sprites 7-9: a bell-shaped cluster of upright grey tubes (#7a8080) whose open tips glow soft blue-green (#6ae0c8). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
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
