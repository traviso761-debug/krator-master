# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 13 prompts** (2026-10-27: 1 for the Lozenge's terraced fields, section 35) (after the fifth 2026-10-26 drop) (2026-10-26, later: 2 for kits/resources' evaporite nodes (section 34), 1 termite set (section 32), 2 for acid rain (section 33); 2 Korona redos in section 0, 7 for the planned stations' gaps (section 28), 1 for the Throne (section 29), 1 for Guilin's osmanthus (section 30); 2 added for the southern highlands, section 27; after the merges with main (the Yeti kit's drift snow, section 25; the Outlands' 13, section 26), the NW outer wall and the Bowl; 2 added for the abyssal savannah, section 24): `card.fig` for Mantis's figs (optional, the Bowl); 1 left from before (`metal.enamel.scoured`, optional, section 7); 5 in section 8 for the NW outer wall's still-procedural plants; 2 for the Oidong Valley's carved bark (section 19); and 24 for the four kits planned on main that day (sections 20-23: the Godthrone and the airless rim, the W outer wall, the SW highlands, Godstep valley). Everything else owed before is delivered: `PLAN.md`, "Delivered 2026-10-26" (three drops). A short list at the end names gaps that have no prompt yet. Plus 5 for the Lizardmen's skin and eyes (section 31, the non-human spike, merged 2026-10-26).

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

**2026-10-26:** Korona's two sets came off their prompts (`biomes/korona/KNOWN_ISSUES.md`, "Two textures came off their
prompts"); both are usable as installed, so the redos are the owner's call. Re-pack `biomes/korona` when they land.

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
2026-10-26); its lotus pads `card.lotus` and `ground.lilypond`; its osmanthus `card.osmanthus` (section 30); its ferns and moss
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

## 24. The abyssal savannah (`biomes/abyssal-savannah`, 2026-10-26)

`biomes/abyssal-savannah/PLAN.md` section 10. **Reuse, so no prompt:** `card.grass.dry`, `card.ichu` and `card.rankgrass`
for the grasses, `card.saltbush`, `card.flower.bloom.highland`, `card.firelily`, `card.charred`, `card.acacia` (the
umbrella tree), `card.heartleaf` (the tongue tree), `card.broadleaf` (the kopje fig), `card.fern`, `card.palm` (the Vain
fronds), `bark.cork`, `bark.lepido`, `bark.armored`, `bark.smooth`, `rock.granite.tor`, `rock.sandstone.bedded.red`,
`ground.redsoil`. Two gaps: the ground under the tall grass and the tall grass itself (its stand-ins: `ground.redsoil`,
and `card.grass.dry`'s knee-high bunchgrass drawn three metres tall).

## 27. The southern highlands' last canvases (`biomes/shighlands`, 2026-10-26)

The known-issues pass wired the library over most of the kit's own canvases (the ferns, straps, daisies, the paramo's
bunchgrass, the trumpet's and the frill tree's ribbing, the volute's rind, the tree fern's scars: `biomes/shighlands/materials.json`).
Two have no set: the banded bark of the ruffle-crown and the corkscrew cereus (`SHIGH.barkTex(5)`, bucket `bark5`), and the
escargot begonia's leaf (`TX.shell`, full colour). Each lands as a family in `biomes/shighlands/materials.json`: `bark.banded.ring`
in `LIBBARK[5]` of `50-biome-shigh-species.js` (grey detail, `keep` 0), the begonia sheet as `begonia` through `libCell`
on `M.shell` (full colour, `keep` 1: the instance colour is near-white).

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

**Station 1 built (2026-10-26):** the plan's own sets are all in the library now (`ground.beads.orange`, `rock.palagonite`,
`card.pele.hair`, `rock.megabreccia`, `rock.tafoni`, `ice.debris`, `ice.rust`, `ground.rust.terrace`, `ground.riverweed.red`);
the page wires `ground.beads.orange`, `ground.sand.black`, `ground.obsidian`, `ground.scoria`, `ground.cinder`,
`ground.lava.crust`, `card.pele.hair` and `concrete.ancient` (`biomes/godthrone/materials.json`). **One stand-in**: the
titanium basalt's grain is `rock.basalt.flowbanded` grey under KSTRATA's colours (the plan allows a tint). Optional, if the
owner wants the ilmenite sheen in the map rather than in the material:

#### `rock.basalt.titanium` (optional)
- Kind: tiling rock surface, full colour (keep 1), ~2 m a tile; albedo, normal, roughness.
- Used by: the Godthrone's caldera walls and talus (stations 1, 4), Godstep's flows. Reuse: any fresh black basalt face.

```
A seamless tileable photographic texture of a fresh titanium-rich basalt rock face, seen straight on, about 2 metres across: dense jet-black fine-grained lava (#1c1b1e, #24232a) with a faint steel-blue metallic glint of tiny ilmenite crystals scattered evenly through it, thin horizontal flow banding, a few small round vesicles, fracture planes with sharp conchoidal edges, and here and there a thin layer of glassy orange-and-black beads (#c8641e, #161515) wedged between two flows. No weathering crust, no lichen, no rust, no varnish (it never sees water). Flat even overcast lighting, no cast shadows, no perspective, no vignette, no text. Full colour: not tinted.
```

## 21. The W outer wall (`biomes/wouterwall`, planned 2026-10-26)

The loess bench, the slump scarps and the sturzstroms (`biomes/wouterwall/PLAN.md` section 8). Reused: `ground.steppe`,
`ground.tundra`, `ground.turf.polygon`, `ground.tilled` (the terraces, tinted buff), `card.stipa`, `card.grass.dry`, the
nwouterwall's sets (section 8 here) and `rock.megabreccia` (section 20). Needed before the kit's W1.

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

Station 1 was built 2026-10-26 on the delivered sets (`biomes/swhighlands/materials.json`). Still owed, both stand-ins today
(`card.moss` tinted pale and `ground.grass_ground`, an Earth grass):

#### `card.turf.native`
- Kind: card (a nine-cell sheet of single tufts on magenta, `tools/textures/cards.py`), tintable (keep 0: the instance tints it).
- Used by: the SW highlands' ridge turf (`turf` slot) on the fold crests and the bald. Reuse: any native (non-Earth) short ground
  cover on Krator's wet uplands; the bay's grassy shelves.

```
A 3x3 grid sheet of nine separate small ground-cover tufts, each centred in its own cell with clear space around it, on a flat pure magenta (#FF00FF) background, no shadows on the background. Front view, eye level, each tuft standing upright from its base at the bottom of its cell. The plant: an alien short turf that is not grass: dense clumps of soft, finger-thick succulent filaments 10 to 25 cm tall, rounded at their tips, some ending in tiny pale bead-like nodules, in soft grey-green with a faint blue cast, lighter at the tips; a few tufts sparser and leaning. Even, flat, shadowless studio lighting, high detail, photographic, no text, no border, no watermark.
```

#### `ground.turf.native`
- Kind: surface, keep 1 (its own colour), a KGROUND ground layer (`ground.turf` slot in `biomes/swhighlands/materials.json`).
- Used by: the fold crests' and the bald's ground under the turf cards. Reuse: the SW highlands' other stations' open ground.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The ground of an alien upland meadow seen from above: a close mat of short, soft, rounded succulent filaments in grey-green with a faint blue cast, packed like a cushion, small pale bead-like nodules scattered through it, patches of dark brown peaty soil showing between the clumps, a few tiny pink and orange flower buds. Scale: the frame is 2 metres across.
```

## 23. Godstep valley (`biomes/godstep`, planned 2026-10-26)

The titanium lava staircase (`biomes/godstep/PLAN.md` section 7). Reused: `ground.lava.aa`, `ground.lava.crust`,
`ground.sand.black` (the black dunes), `ground.scoria` (tinted red for the flank vent's crater), `ground.cinder`,
`rock.basalt.*`, `rock.columnar` (the colonnades), `ground.redsoil` (the redlands' soil), `ground.playa.red` (the
lava-dammed playas, tinted pale), `rock.palagonite` (section 20). Needed before the kit's D1.

## 25. The Yeti kit (`kits/yeti`, 2026-10-25)

## 26. The Outlands (`biomes/outlands`, planned 2026-10-26)

The walled basin beyond the Gate (`biomes/outlands/PLAN.md` section 11): a native fungoid flora (violet, teal, rust, copper
green; no leaves, no flowers), cold steppe and desert, a salt lake, copper-stained gem hills, the fog woods. **13 prompts**
(this section raises the count above by 13). Reused: `ground.steppe`, `ground.puna`, the gravel scans, `ground.salt`,
`ground.efflorescence`, `rock.malachite`, `rock.gossan`, the basalt sets, `ice.clear`, `ground.turf.polygon`,
`ground.lichen.crust`, the fungoid `organic.cap.*`, `organic.fungus.bracket`, `ground.mycelium.gold`, `card.fungus.drip`,
`card.shelf.glow`, `card.palm`. Also needed here and owed above: `rock.badland.bedded` (section 9), `ground.salt.ochre` and
`ground.soda.crust` (sections 11, 12), `organic.pod.honeycomb` and `organic.lichen.plates` (section 17). Needed before the
kit's O2.

## 28. The planned stations' gaps (`biomes/STATIONS-SURVEY.md`, 2026-10-26)

"Texture gaps with no prompt yet" in the survey. Each is needed before its station is built. **Reuse, so no prompt:**
nhighlands 2's black oak takes `card.lobed` (its five deeply lobed oak cells, tinted; swlowlands' oaks are
`card.broadleaf`, which has no lobes); ehighlands 2's tree ferns, ferns, hanging moss, mossy bark, bromeliads and orchids
stay the survey's library sets (`card.treefern`, `card.fern`, `card.moss.hanging`, `bark.mossy`, `card.bromeliad`,
`card.orchid.dendrobium`); geometry cones on shighlands 2 can take `fruit.scale` instead of the card below.

#### `card.cornlily`
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one plant per cell, upright.
- Used by: nhighlands 2, the corn lilies of the dry-summer montane meadows. Reuse: any wet mountain meadow's tall herbs (false hellebore, Veratrum; the NW outer wall's and the S highlands' meadows).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: one corn lily plant (Veratrum californicum) standing upright on the bottom of its cell: a single thick stalk clasped by broad oval leaves with deep parallel pleats (#6a8a3a, #7a9a44) spiralling up it, the lowest leaves largest; on five of the nine a tall branched plume of small creamy-white star flowers (#ece8d0) at the top; on two, no flowers yet; on two, the late-summer plant yellowing (#b8a858) with brown seed heads (#8a6a3a). Vary the height. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

## 29. The Throne's plume flora, the last procedural parts (`biomes/throne`, 2026-10-26)

`biomes/throne/KNOWN_ISSUES.md`: the chalice's skirt, the braid cap's vines, the geode pods, ember burrs, wire stalks, gold
pins, blood chalices and the snare rafts' runners. Only the geode's crystal lining has no near set. **Reuse, so no
prompt** (each tinted by its species colour): the chalice parasol's fluted skirt `bark.frill.ribbed` (fluted, ringed);
the braid cap's strangling vines `bark.twisted.red` (twisted fibrous strands, as the rope-tree's); the geode shells
`stone.pumice` or `rock.basalt.vesicular` (cracked grey stone); the blood chalices' flared trumpets
`organic.funnel.trumpet` tinted crimson; the wire stalks and the rafts' runners `organic.tendril.banded`; the gold pins
`card.mushroom.glow` cells if they become cards (as tiny geometry they want no map). The ember burrs have no UVs
(`G.burr` writes 0,0): a map needs UVs first, and their glow is the look.

## 30. Guilin's osmanthus (`biomes/guilin`, 2026-10-26)

`biomes/guilin/KNOWN_ISSUES.md`: the osmanthus shares `card.broadleaf` tinted, and `card.osmanthus` is owed (its flowers
are the point; `card.croptree.glossy` has the leaves but no flowers).

## 31. Lizardmen skin (`core/charactermodels`, the non-human spike, 2026-10-23)

The spike (`core/charactermodels/NONHUMAN.md`) draws the Lizardmen's tail and head with a procedural stand-in
(`tools/mods.py scale_texture`) and leaves the body's human skin, tinted olive. A real people needs these: the three
surfaces go on as tiling detail maps over the neutral skin (the skin tint still colours them), the eyes as the eye
mesh's texture (its alpha is the iris mask, as the human eyes'). Needed before the Lizardmen are a people.

#### `skin.reptile.scales`
- Kind: surface, tintable. Used by: the Lizardmen's bodies, tails and heads (the main skin). Reuse: any reptile, the
  fauna kits' lizards, a scaled therian.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Living reptile skin seen close, the hide of a large lizard's flank: small rounded overlapping scales in loose diagonal rows, each scale gently domed with a slightly darker narrow seam between them, scales a little larger and flatter in places and finer in others, a few faint creases where the skin folds, a soft dry matte sheen. No pattern of spots or bands, no colour blotches. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only. One tile covers 0.25 metres.
```

#### `skin.reptile.scutes`
- Kind: surface, tintable. Used by: the Lizardmen's throats, bellies and the underside of the tail. Reuse: crocodilians,
  turtles' plastrons, a beaked therian's legs.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The belly hide of a large reptile: broad smooth rectangular scutes in straight rows, each a little wider than long, separated by narrow soft grooves, faint fine wrinkles across each scute, smoother and slightly glossier than the flank's scales. No colour markings. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only. One tile covers 0.3 metres.
```

#### `skin.reptile.plates`
- Kind: surface, tintable. Used by: the Lizardmen's skulls and snouts (the head's larger plates). Reuse: armoured reptiles, horned beasts' brows.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The top of a reptile's head: irregular flat polygonal plates of hard skin, three to six sided, of mixed sizes from small to large, fitted together like crazy paving with narrow deep seams, each plate faintly pitted and slightly raised at its middle, dry and matte. No colour markings. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only. One tile covers 0.2 metres.
```

#### `eye.reptile.slit` (1024 px, full colour, not tiling)
- Kind: an eye's iris, front-on. Used by: the Lizardmen's eyes (every caste but the Interpreters). Reuse: any reptile or a cat-eyed therian.

```
A single reptile eye seen straight on, filling a square 1024x1024 frame, flat even lighting, no reflections, no highlights, no eyelids, no skin around it: a round amber-gold iris with fine radial fibres and a darker rim, a narrow vertical black slit pupil in the middle, the iris edge exactly touching the frame's edges, the four corners plain white. No text, no border.
```

#### `eye.reptile.spiral` (1024 px, full colour, not tiling)
- Kind: an eye's iris, front-on. Used by: the Interpreters (LORE 6.20: spiral pupils mark the highest caste).

```
A single reptile eye seen straight on, filling a square 1024x1024 frame, flat even lighting, no reflections, no highlights, no eyelids, no skin around it: a round pale gold iris with fine radial fibres and a darker rim, the pupil a black squared spiral (a single line wound inward in right angles, like the Shang leiwen meander) filling the middle third of the iris, the iris edge exactly touching the frame's edges, the four corners plain white. No text, no border.
## 32. Termite cathedrals (`core/terrain` `KSTACKS` kind `mound`, core gap H10, 2026-10-26)

`biomes/hyperjungle/PLAN-LANDS.md` sections 4 and 10: the fluted clay mounds of every savannah (savannarim first, step
J4). The mound's record carries its clay colour (`clay`, from the ground), so the set is tintable. **Reuse until it
lands, said so:** `earth.banco.eroded` (rain-worn mud wall) tinted by the record's `clay` is the stand-in; it has the
erosion but not the mound's knobbly built-up pellets or its tunnel mouths.

#### `earth.termite`
- Kind: surface, tintable (near-colourless), 2048 px square, one tile 0.5 m.
- Used by: every savannah's termite cathedrals (`KSTACKS` `mound`: the spires and the skirt). Reuse: any built-mud
  surface of an animal (mud-dauber nests, swallow nests), a sun-baked earthen wall's crust.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The hard sun-baked outer wall of a giant termite mound seen close: fine clay built up from countless tiny rounded pellets cemented together, a knobbly crust with shallow vertical rain runnels and soft eroded ridges running one way down the surface, a few small round tunnel mouths and pinholes (2 to 10 mm) with darker hollows, patches of fresh smoother repair clay slightly paler than the weathered crust, a few fine drying cracks, a little loose grit in the hollows. No grass, no insects, no stones, no colour blotches. Matte, dry. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only. One tile covers 0.5 metres.
```

## 33. Acid rain's etched surfaces (`core/atmos` `fx/89-atmos-fx-acid.js`, the Valley of the Ancients, planned, 2026-10-26)

The acid rain's look (`ATMOS.acidOn`, kinds `metal` and `stone`) is **procedural until these land, said so**: pits and a
tarnish on metal, a bleached crust and pale streaks on stone, drawn from a hash in the shader. When the sets land, `acidOn` is to blend
toward them at the etch's weight (a detail map; not written yet). Both tintable, so one set serves any metal or rock.

#### `metal.etched`
- Kind: surface, tintable (near-colourless), 2048 px square, one tile 0.5 m.
- Used by: acid-rain etching on metal (the Valley's ruins, machines, fittings). Reuse: any old corroded metal, a wreck's
  hull, pickled or acid-cleaned steel.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Sheet metal eaten by years of acid rain: a dull matte surface densely pitted with small round and irregular corrosion pits (0.5 to 6 mm), some merged into shallow craters with rough grainy floors, fine etched grain and faint flow marks where acid ran down one way, thin crusty salt deposits ringing a few pits, patches of smoother less-attacked metal between. No rivets, no seams, no paint, no rust flakes, no colour blotches. Matte, dry. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only. One tile covers 0.5 metres.
```

#### `stone.acidstreak`
- Kind: surface, tintable (near-colourless), 2048 px square, one tile 1 m; vertical (up is the top of the image).
- Used by: acid-rain etching on steep stone and masonry (the Valley's walls and cliffs). Reuse: limestone or marble under
  long weathering, a karst wall's solution runnels.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A vertical stone face dissolved by acid rain: a bleached, chalky crust over finer grained rock, long narrow solution runnels and pale streaks running straight down the face from top to bottom, sugary etched grain where the surface has been eaten, small sharp pits, thin flaking skins lifting at a few edges, slightly darker unweathered rock in the hollows between runnels. No moss, no lichen, no cracks across the streaks, no colour blotches. Matte, dry. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only. One tile covers 1 metre.

## 34. The evaporite nodes (`kits/resources`, 2026-10-26)

The gypsum and rock-salt nodes (`node-gypsum-*`, `node-halite-*`: `44r-res-nodes.js`, `RES_EVLOOK`, `resEvap`) draw on
vertex colours; the efflorescence set reads as dark marble on their slabs (`kits/resources/KNOWN_ISSUES.md`). Each lands as
a family in `kits/resources/materials.json` (grey detail, `keep` 0: the kind's colour stays `RES_EVLOOK`'s) and goes on the
slabs in `resEvap`.

#### `ground.gypsum.crust`
- Kind: surface, tintable (`RES_EVLOOK.gypsum`'s pale cream).
- Used by: the gypsum nodes' crust and slabs, at a closed basin's rim. Reuse: any desert gypsum flat or playa rim (the Bowl, the Catch, the salt lakes east of Verge).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A pale bedded gypsum crust at the dry rim of a desert salt basin, seen from above: thin flaky layers of chalky off-white gypsum lifting at their edges into low curled plates, a fine powdery sugary grain between them, scattered small clusters of clear selenite blades (flat glassy crystals a few centimetres long, lying at all angles, catching no light), a few hairline cracks in loose polygons, a faint dusting of fine tan sand in the hollows. No pebbles, no plants, no footprints. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1.5 metres.
```

#### `rock.halite.cut`
- Kind: surface, tintable (`RES_EVLOOK.halite`'s white to faint pink).
- Used by: the rock-salt nodes' cut pit walls and stacked blocks. Reuse: any salt mine face or salt-block wall (a rock-salt hall, salt traders' stacks).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A face of bedded rock salt cut flat by hand picks, seen straight on: coarse interlocking halite crystals, translucent milky white with faint grey and very pale pink bands running level across the face in beds a hand thick, the crystals' cubic cleavage showing as small square steps and facets, shallow parallel pick marks crossing the bands at a slant, a few thin seams of grey clay between beds, a little white salt dust in the marks. No tools, no blocks, no joints between blocks. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1 metre.
```

## 35. The Lozenge's terraced fields (`kits/ancients`, target `lozenge`, 2026-10-27)

The Lozenge (the Arccube at a quarter height) has its upper faces in flights of farm terraces (`targets/lozenge/89d6-lozenge-faces.js`, THE TERRACES). The
treads are `MAT.acSoil`, the concrete map tinted to earth, under coloured instanced crop beds. Lands as a family in
`kits/ancients/materials.json` bound onto `MAT.acSoil` (keep 0: the beds carry the crop colours).

#### `ground.terrace.field`
- Kind: surface, tintable (`MAT.acSoil`'s earth, `0x6e5536`; the ruin's `0x4a4a2a`).
- Used by: the Lozenge's terrace treads, intact and overgrown; the Pile's crop beds (`targets/arcpile`) could take it too. Reuse: any terraced field or allotment ground (hill farms, Hook's town gardens, the isle demo's fields).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Tilled farm soil on a level terrace, seen from above: dark crumbly loam in straight shallow furrows running across the frame, a little straw and crop stubble lying in the furrows, small clods and a few pale pebbles, faint damp patches where the soil is darker, low sprouting seedlings in a few of the rows. No stone walls, no paths, no footprints, no water. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 4 metres.
## 36. The abyss's club-moss carpet (`biomes/eastabyss`, the final rebuild, 2026-10-27)

The coal-swamp jungle's floor (`clubmoss` slot, drawn on the kit's upright tufts) shows the middle cell of `card.moss`, a solid moss
photo with no cut-out, so every tuft is a striped opaque cylinder ("barrels" over the marsh and the jungle floor). The card check's
proposal (the whole cushion) is no better on a tuft. Owed: a cut-out sheet of upright club-moss sprigs.

#### `card.clubmoss`
- Kind: card (a nine-cell sheet of single plants on magenta, `tools/textures/cards.py`), tintable (keep 0: the kit's three
  carpet colours tint it).
- Used by: eastabyss's club-moss carpet (`clubmoss`); the abyssal-savannah and the hyperjungle read the same slot in place.
  Reuse: any lycopod or horsetail ground cover (the Rift's jungle floor, swamp margins).

```
A 3x3 grid sheet of nine separate small club-moss plants, each centred in its own cell with clear space around it, on a flat pure magenta (#FF00FF) background, no shadows on the background. Front view, eye level, each plant standing upright from its base at the bottom of its cell. The plant: a Lycopodium club-moss tuft 20 to 40 cm tall, a few forking upright stems densely clothed in tiny overlapping scale-like needle leaves, like soft green bottle-brushes, some stems ending in a slender pale yellow-green cone; the tufts open and airy, with gaps between the stems so the background shows through; near-colourless pale grey-green so it can be tinted. Even, flat, shadowless studio lighting, high detail, photographic, no text, no border, no watermark.
```

## Gaps with no prompt yet

Owed, but a prompt waits on something first; listed so they are not lost.

- **Korona's therian tribes' skins** (`core/charactermodels/NONHUMAN.md`): fur (short, tintable), feathers, beak keratin and
  throat-sac skin, once LORE 6.18 names the tribes and what each is like; written then, one set per kind of hide.
- **The Yeti kit's lintel band** (`kits/yeti/PLAN.md` section 2): the clan's name in the Khaayken cut script on a
  stone lintel. The chart exists (`lore/tongues-of-krator.html`, the Khaayken section and its cut-letter script: straight-stroke
  Latin capitals, a vowel as one wedge turned four ways, holed for the front vowels), with every sign's exact path data. A
  generator will not keep those letterforms, so the band is a bake from the chart's paths (a PNG or a `TEX.def`, not a
  generated image), cut into the lintel's stone (`stone.soapstone` or `stone.corbel.slab`, already in the library). No
  clan's name is fixed in the kit yet; the bake needs the names.
