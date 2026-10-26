# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 35 prompts** (2026-10-26, after the merges with main, the NW outer wall and the Bowl; 2 added for the abyssal savannah, section 24): `card.fig` for Mantis's figs (optional, the Bowl); 1 left from before (`metal.enamel.scoured`, optional, section 7); 5 in section 8 for the NW outer wall's still-procedural plants; 2 for the Oidong Valley's carved bark (section 19); and 24 for the four kits planned on main that day (sections 20-23: the Godthrone and the airless rim, the W outer wall, the SW highlands, Godstep valley). Everything else owed before is delivered: `PLAN.md`, "Delivered 2026-10-26" (three drops). A short list at the end names gaps that have no prompt yet.

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

## 1. Beast Riders (optional)

### The Beast Riders kit's tents (`kits/beast-riders`, 2026-10-19)

`kits/beast-riders/KNOWN_ISSUES.md`, "The thorn hedge has no texture of its own": the cut-thorn barrier
(`br_hedge_thorn`, `src/75-br-tents-bounds.js`) is thin branches of geometry with `bark.ironbark` on them as a detail
map. Lands as the family `thorn` in `kits/beast-riders/materials.json` (tinted: the branches keep their two palette
browns); `70-br-tent-kit.js` `BRT_THORN` then reads `'thorn/bark'`.

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

**Built 2026-10-26** (`biomes/nwouterwall`, its own branch): everything section 8 asked for was delivered and is wired. Five plants
still draw a procedural stand-in (`biomes/nwouterwall/KNOWN_ISSUES.md`, "Procedural plants"); their cards:

#### `card.birch.dwarf`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one shrub per cell.
- Used by: the snow birch (Betula nana) of the tundra and the alases' edges. Reuse: any dwarf birch or low tundra shrub turning in autumn.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one knee-high dwarf birch shrub (Betula nana) standing on the bottom of its cell: a low tangle of thin dark red-brown twigs (#4a2a20) carrying small round leaves with scalloped edges, each the size of a fingernail. Top row in summer green (#4e7a34, #5a863a); middle and bottom rows in autumn: scarlet, orange and wine red (#c84a28, #e07a30, #8a2a24). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. The subject's reds are deep and warm, never the background's pure magenta; key with `spill: edge`.
```

#### `card.willow.woolly`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one shrub per cell.
- Used by: the woolly willow (Salix lanata) of the stream banks and the wet tundra. Reuse: any grey-felted willow, sallow or arctic willow scrub.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one woolly willow shrub (Salix lanata) a metre tall standing on the bottom of its cell: several stout grey-brown stems (#6a5e52) with broad oval leaves covered in dense silvery-grey felt (#b4bcac, #ccd2c4); on six of the nine, fat upright woolly catkins like little white-gold caterpillars (#f4f0e4, #e8d8a0) at the branch tips. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.edelweiss`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the felt star (edelweiss) of the fellfield and the stony tundra. Reuse: any edelweiss or felted alpine star.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a small clump of edelweiss (Leontopodium) on the bottom of its cell, a hand high: narrow grey-green leaves (#8a9478) under one to four flower heads, each a star of thick white-grey woolly bracts (#e8e6dc, #d4d2c8) round a cluster of small yellowish-grey florets (#c8c0a0), everything covered in felt. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.cloudberry`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell.
- Used by: the cloudberry (Rubus chamaemorus) of the alas bogs. Reuse: any bog berry or low lobed-leaf herb of the tundra.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one low cloudberry plant (Rubus chamaemorus) on the bottom of its cell, ankle high: two or three wrinkled kidney-shaped leaves with five shallow lobes (#5a7a3a, #668644) on short stems, and a single upright berry on its own stalk, amber-orange like a small raspberry (#e89040, #f0a050). Top row: the berry still hard and red-gold; middle row: ripe amber; bottom row: autumn, the leaves turned rust-red (#a0482a). Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

#### `card.cladonia`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one tuft per cell.
- Used by: caribou moss (reindeer lichen) tufts standing out of the `ground.cladonia` carpet under the larch and on the tundra. Reuse: any fruticose lichen tuft, coral lichen, cup lichen.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one cushion of reindeer lichen (Cladonia rangiferina) seen from a low side angle, sitting on the bottom of its cell: a rounded clump a hand to two hands across of densely branched, hollow, antler-like tips, pale grey-green and ash white (#c8ccb8, #b4b8a4, #e4e4d4), darker grey toward the base. Vary the size and roundness. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject.
```

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

#### `card.fig` (2026-10-26, Mantis's pocket, `PLAN-BOWL.md` section 11)
- Kind: cut-out card sheet, 3 x 3 on magenta, tintable (grey-green, each instance's colour tints it); a clump fills each cell.
- Used by: the Mantis fig's crown (`biomes/sedesert/stations/mantis`, slot `broad`). Stands in today: the kit's procedural
  small-leaf map (`card.broadleaf` is a monstera bunch, wrong for a fig). Reuse: any fig, banyan or laurel-leaved crown.

```
A sheet of nine separate cut-out foliage sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a dense rounded clump of fig foliage seen from outside the crown, many leathery oval leaves ten to fifteen centimetres long with blunt tips and a pale midrib, overlapping in layers, a few short grey twigs showing between them and two or three small round figs on the twigs; vary the outline and the density of the nine clumps. Keep colours natural but slightly muted and even, a mid grey-green, so the sprite can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
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

## 16. Catalog hangings: the Screamers (the Eastern Abyss reuses a set) (2026-10-26)

`PLAN.md`, catalog audit, "No pattern sheet at all". Style read of `kits/catalog/krator-master-furniture-screamer.js`:
the tapestry kind is `figure` ("Painted hide hanging"), motif `dots`, the court's `skull`, cloth family `hide`; palette
feather red #c8342a, yellow #e0b030, blue #2a6aa0, hide tan #9a7a52, black #2a2622, bone #e6dcc6. Lands as
`patterns/screamers/hide-figure` (a `tapestry` row in the Screamers' and the catalog's `materials.json`).
**Eastern Abyss, reuse, so no prompt:** its hanging is `grid` with the `lozenge` motif in indigo, saffron, madder, white
and turquoise (`krator-master-furniture-eastabyss.js`), which is `patterns/common/kilim-star` (a stepped-diamond kilim in
madder, saffron, teal, indigo and cream); its mosaic panel takes `patterns/common/mosaic-star-lapis` or `zellige-blue`.
(Nomad has `patterns/nomad/` and the Lizardmen `patterns/lizardmen/`: both delivered.)

## 17. The shared detail sets (`detail.*`, for the record's `detail` field) (2026-10-26)

`PLAN.md`, "From spiderbench": a tiling micro-relief normal blended over the base normal at close range, one shared set
per surface kind for every culture. The field is not built yet (`TODO.md`), so these are the lowest priority: deliver them
before it is. They are relief only: near-uniform, with no feature that would show when a tile repeats every 25 cm.
**Metal brush, reuse, so no prompt:** `metal.steel.brushed` (its normal, at a finer tile).

## 18. The Eternian kit (`kits/eternian`, list agreed by the owner 2026-10-26)

`kits/eternian/PLAN.md` section 10. Only the surfaces with no set get a prompt. **Reuse, so no prompt** (most already in
`kits/eternian/materials.json`): the celadon glazed tile is `roof.tile.celadon` (roofs) and `ceramic.celadon.crackle`
(ware, glaze); the alabaster is `stone.alabaster` (a colour map only: no separate thickness map exists, so the
translucency reads from its albedo); the pattern block is `concrete.block.relief` and its takes `.b`-`.e`; the verdigris
copper sheet is `metal.bronze.verdigris`; the culture pattern sheet is `patterns/eternian/circuit-maze` (`.b`, `.c`;
tinted gold on black or white on black); the fish-scale roofs are `metal.scale` and `roof.scale.gilt`; the bronze is
`metal.bronze.cast`; the glazed scale look `patterns/highlands/tile-*`; the Ancient white panels `metal.ancient.white`; the
tracery's grid is `patterns/eternian/screen-pierced` (`.b`), a keyed, tiling pierced cast-bronze screen on magenta. Not
covered: the brick (the kit tints the plain `brick` set today) and the tracery's three window heads.

## 19. The Oidong Valley's carved bark (`biomes/oidong`, 2026-10-26)

The cloud-pad tree (species 17, the diversity pass from the owner's reference photo of patterned trunks) wears a bark
patterned in bold two-tone motifs. Nothing in the library or `patterns/` has it (`bark.tapestry` is carpet-like,
`bark.mosaic` full-colour plates, `bark.cratered` grey pits), so `50-biome-oidong-species.js` paints a procedural stand-in
(`OIDONG.barkTex7`, bucket `bark7`). Lands as the family `bark.carved` in `biomes/oidong/materials.json` (full colour,
`keep` 1: the species' bark colour is a near-white multiplier), then `LIBBARK[7]` in the species fragment. Two takes
(`.b` the variant) so a grove does not repeat one trunk.

#### `bark.carved` (and `bark.carved.b`)
- Kind: surface, full colour (the colour is the point). Square 2048 px; one tile covers about 0.6 m of trunk.
- Used by: the Oidong Valley's cloud-pad tree. Reuse: any sacred or "written" tree, carved totem trunks, burl furniture.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The smooth living bark of a tree that grows its own bold two-tone pattern, as if carved and inked: a pale tan ground (#cdb796, with lighter #dcc8a6 and darker #b8a07c streaks running vertically in the grain), patterned in near-black dark brown (#2e2620) motifs: scattered concentric "target" rings of three or four thick rings with a solid dot at the centre, a few larger nested rings, and one vertical chain of scalloped diamonds (each diamond's four edges bowed inward, a small pale eye in its middle) running the full height of the tile. The motif edges are crisp but slightly irregular, like a pattern grown into the bark rather than painted, with fine bark texture and a few small knots visible through both colours. Matte.
```
For `bark.carved.b`, the same with: "the motifs mostly larger nested rings, five or six rings each, and a column of small target rings instead of the diamond chain."

## 24. The abyssal savannah (`biomes/abyssal-savannah`, 2026-10-26)

`biomes/abyssal-savannah/PLAN.md` section 10. **Reuse, so no prompt:** `card.grass.dry`, `card.ichu` and `card.rankgrass`
for the grasses, `card.saltbush`, `card.flower.bloom.highland`, `card.firelily`, `card.charred`, `card.acacia` (the
umbrella tree), `card.heartleaf` (the tongue tree), `card.broadleaf` (the kopje fig), `card.fern`, `card.palm` (the Vain
fronds), `bark.cork`, `bark.lepido`, `bark.armored`, `bark.smooth`, `rock.granite.tor`, `rock.sandstone.bedded.red`,
`ground.redsoil`. Two gaps: the ground under the tall grass and the tall grass itself (its stand-ins: `ground.redsoil`,
and `card.grass.dry`'s knee-high bunchgrass drawn three metres tall).

#### `ground.savanna.litter`
- Kind: surface, full colour. Square 2048 px; one tile covers about 2 m of ground.
- Used by: the abyssal savannah's parkland (the host's ground detail under the thatch grass, `groundDetail` today
  `ground.redsoil`). Reuse: any tropical savanna or dry grassland floor (the hyperjungle's and SW bay's savannahs).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The floor of a tall-grass savanna in the dry season seen from straight above: red-brown lateritic earth (#9a5e44, #86503a) with small rounded iron-pisolite gravel (#5a3424) and quartz grit, mostly hidden under a mat of fallen dry grass: long straw-coloured blades (#c8b072, #b09858) lying in every direction, a few grey weathered ones (#9a948a), the cut bases of grass tussocks a hand across every 30 cm with fresh green shoots (#7a8a3e) in their middles, a scatter of tiny dry seed heads. Matte.
```

#### `card.grass.thatch`
- Kind: card (nine plants, 3 x 3, on magenta), near-colourless so it can be tinted (the kit tints it gold, green or
  scorched by the burn age). Square 2048 px.
- Used by: the thatch grass (`thatch`, today `card.grass.dry`). Reuse: elephant grass, any tall savanna or riverside grass.

```
Grass card: nine tall tufts of savanna thatching grass, each a dense fountain of long narrow blades rising straight and arching over at the tips, about three times as tall as it is wide, with several tall slender stems carrying feathery seed plumes above the leaves and a few broken and bent blades, standing up from the bottom of each cell, pale cream-white only so they can be tinted, on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. No magenta, pink or purple anywhere in the grass.
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

## 20. The Godthrone and the airless rim (`biomes/godthrone`, planned 2026-10-26)

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

## 21. The W outer wall (`biomes/wouterwall`, planned 2026-10-26)

The loess bench, the slump scarps and the sturzstroms (`biomes/wouterwall/PLAN.md` section 8). Reused: `ground.steppe`,
`ground.tundra`, `ground.turf.polygon`, `ground.tilled` (the terraces, tinted buff), `card.stipa`, `card.grass.dry`, the
nwouterwall's sets (section 8 here) and `rock.megabreccia` (section 20). Needed before the kit's W1.

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

## 22. The SW highlands (`biomes/swhighlands`, planned 2026-10-26)

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

## 23. Godstep valley (`biomes/godstep`, planned 2026-10-26)

The titanium lava staircase (`biomes/godstep/PLAN.md` section 7). Reused: `ground.lava.aa`, `ground.lava.crust`,
`ground.sand.black` (the black dunes), `ground.scoria` (tinted red for the flank vent's crater), `ground.cinder`,
`rock.basalt.*`, `rock.columnar` (the colonnades), `ground.redsoil` (the redlands' soil), `ground.playa.red` (the
lava-dammed playas, tinted pale), `rock.palagonite` (section 20). Needed before the kit's D1.

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

## Gaps with no prompt yet

Owed, but a prompt waits on something first; listed so they are not lost. None open (2026-10-26: the five gaps listed
here were prompted in sections 15-17 or resolved above, and the Eternian list in section 18).
