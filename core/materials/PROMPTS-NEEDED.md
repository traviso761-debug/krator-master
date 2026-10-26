# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 2 prompts** (`metal.enamel.scoured`, optional; `card.fig` for Mantis's figs, optional, 2026-10-26; the third 2026-10-26 drop delivered the other 14, see `PLAN.md`) (2026-10-26, later: 8 added in sections 15-17 for the gaps that had no prompt, and the rest of those gaps resolved as reuse; 2 for the Eternian kit in section 18; 2026-10-26: 29 of the 41 added on 2026-10-23 arrived and are in the library, see `PLAN.md` "Delivered 2026-10-26"; the rest of this paragraph is the history of what was owed). Owed before 2026-10-23: 1 redo (`patterns/tribal/formline`), 1 required (the Northern Highlands' `bark.alder.lichen`) and 4 optional (the Beast Riders' `foliage.thorn.cut`; necanyons' `card.palm.fan`, `card.flametip`, `card.treelily`; each has a library fallback in use). Added 2026-10-23: 1 optional for the Stalkers (`metal.enamel.scoured`, section 7) and 41 for the kits planned that day (sections 8-14: the NW outer wall, the painted highlands, the Cut, the Bowl, the Catch, the rift rim, Farside), each needed before its kit's build. The shared sky's six moon maps (added 2026-10-25) were delivered the same day: `PLAN.md`, the Delivered log. A short list at the end names gaps that have no prompt yet.

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

Owed, but a prompt waits on something first; listed so they are not lost. None open (2026-10-26: the five gaps listed
here were prompted in sections 15-17 or resolved above, and the Eternian list in section 18).
