# Texture prompts still needed (one list)

Every texture or pattern sheet the owner still has to source or generate, each with its finished prompt. Paste a block
as it is, one image per block. **Everything delivered lives in `PROMPTS-archived.md`** (checked against `core/materials/library/`, `patterns/` and each build's `materials.json` on `origin/main`, 2026-10-19); this file holds only what is still owed.

**Count: 1 prompt** (2026-11-08: `metal.scorched` for the Motor Vehicles kit's burnt ruins, section 36). Before it: **0 prompts** (2026-11-02: section 31, the metropolis's three, delivered: `PLAN.md` "Delivered 2026-11-02"; 2026-10-27, later: the owner's pasted drop of 20 images delivered every entry that still had a prompt block, `PLAN.md` "Delivered 2026-10-27"; only the gaps with no prompt yet, at the end, are owed; two came under new ids, `card.clubmoss.sprig` and `card.palm.costa`, because `card.clubmoss` and `card.palm.fan` were already wired sets. The count before it: 13 prompts (2026-10-27: 1 for the Lozenge's terraced fields, section 35) (after the fifth 2026-10-26 drop) (2026-10-26, later: 2 for kits/resources' evaporite nodes (section 34), 1 termite set (section 32), 2 for acid rain (section 33); 2 Korona redos in section 0, 7 for the planned stations' gaps (section 28), 1 for the Throne (section 29), 1 for Guilin's osmanthus (section 30); 2 added for the southern highlands, section 27; after the merges with main (the Yeti kit's drift snow, section 25; the Outlands' 13, section 26), the NW outer wall and the Bowl; 2 added for the abyssal savannah, section 24): `card.fig` for Mantis's figs (optional, the Bowl); 1 left from before (`metal.enamel.scoured`, optional, section 7); 5 in section 8 for the NW outer wall's still-procedural plants; 2 for the Oidong Valley's carved bark (section 19); and 24 for the four kits planned on main that day (sections 20-23: the Godthrone and the airless rim, the W outer wall, the SW highlands, Godstep valley). Everything else owed before is delivered: `PLAN.md`, "Delivered 2026-10-26" (three drops). A short list at the end names gaps that have no prompt yet. Plus 5 for the Lizardmen's skin and eyes (section 31, the non-human spike, merged 2026-10-26).

**Delivered 2026-11-03:** section 31's five (the Gills: `rock.lamina.pipe`, `mineral.crust.ferromanganese`, `mineral.crust.brucite`,
`card.breathfringe`, `card.turf.limed`) and ten owed on unmerged branches (High Rift, nwbay, nhighlands, ringisles, the rift rim, Copper Glacier),
`PLAN.md` "Delivered 2026-11-03": the ten are wired at their merge, and their entries are deleted on their branches then. Still owed from that
day: `rock.megabreccia` (nhighlands' branch) and `card.umbrella.plate` (the abyssal savannah).

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
titanium basalt's grain is `rock.basalt.flowbanded` grey under KSTRATA's colours (the plan allows a tint). The optional
`rock.basalt.titanium` (the ilmenite sheen in the map) was delivered 2026-10-27 (`PLAN.md`, "Delivered 2026-10-27"): not wired yet.

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

Station 1 was built 2026-10-26 on the delivered sets (`biomes/swhighlands/materials.json`). Its two stand-ins' own sets,
`card.turf.native` and `ground.turf.native`, were delivered 2026-10-27 (`PLAN.md`, "Delivered 2026-10-27"): not wired yet (today
`card.moss` tinted pale and `ground.grass_ground`, an Earth grass).

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

## 36. The Motor Vehicles kit's burnt metal (`kits/motor-vehicles`, 2026-11-08)

`kits/motor-vehicles/KNOWN_ISSUES.md`, "No scorched-metal set": the kit's ruin states (`KratorVehicles.build(key,
{ state: 'burnt' })`, the Ancient's Valley's streets) paint burnt bodies with `metal.rust.heavy` for want of a burnt
set. Lands as the family `scorched` in `kits/motor-vehicles/materials.json` (already there, optional): re-pack the kit
and point the ruin pass's sooted surfaces at it (`krator-vehicles-runtime.js` `ruinColour`). One image, near-colourless.

| id | Prompt |
|---|---|
| `metal.scorched` | Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: burnt-out vehicle body panel after a fire: sheet steel whose paint has burnt off in blistered, curling flakes, leaving bare heat-scaled metal with a fine crazed pattern, patches of matte soot, a few blisters of paint still clinging at the edges of the burnt areas, light surface rust blooming through the scale, faint heat-tint rings (straw, brown, blue) where the metal got hottest, a little grey ash caught in the seams. Near-colourless grey only (the heat-tint rings faint), so it can be tinted. |
## 37. The Ancient Transit kit (`kits/ancient-transit`, 2026-11-08)

The Ancients' transport infrastructure in ruin (the valley's highway, cargo and passenger lines, street furniture). Stand-ins until these
land: `ground.asphalt` for the decks and roads (the lane paint is geometry), `ground.gravel042` for the ballast, `metal.rust.heavy` for the
rails and every ruined metal. **3 prompts.** Each takes the base template, then:

| id | Material line |
|---|---|
| `ground.asphalt.lanes` | Worn dark asphalt road surface with faded lane paint: fine aggregate showing through the bitumen (#4a4846, #585450), a patched crack running across, and one broken white lane dash (#d8d4c8, worn to 60%) along one edge of the tile and a faded yellow edge line (#c8a040) along the other, so the tile repeats as a lane. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
| `ground.ballast.rail` | Railway track ballast: angular grey granite stones 3 to 6 cm (#7e7a74, #8a8680, #6a6660), packed, dusty with rust-brown fines between them (#6a4a36), two faint darker bands across the tile where sleepers lay. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
| `metal.rail.rusted` | The head and web of a steel rail a thousand years idle: flaking orange-brown rust (#8a4a2c, #a65a36) over pitted dark steel (#4a4644), the running surface a dull grey band along the tile's middle with rust creeping over it, scale lifting at the edges. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |

## Gaps with no prompt yet

Owed, but a prompt waits on something first; listed so they are not lost.

- **Bare concrete block** (the World Menagerie's Lake Atitlán and Sarajevo, 2026-10-28): the grey cinder block of an unfinished house (obra gris), laid in running bond with grey mortar, some cells broken. No library set has it; Atitlán's unfinished houses are plaster tinted grey. Needs a read of the block size and the tile before the prompt.
- **Korona's therian tribes' skins** (`core/charactermodels/NONHUMAN.md`): fur (short, tintable), feathers, beak keratin and
  throat-sac skin, once LORE 6.18 names the tribes and what each is like; written then, one set per kind of hide.
- **The Yeti kit's lintel band** (`kits/yeti/PLAN.md` section 2): the clan's name in the Khaayken cut script on a
  stone lintel. The chart exists (`lore/tongues-of-krator.html`, the Khaayken section and its cut-letter script: straight-stroke
  Latin capitals, a vowel as one wedge turned four ways, holed for the front vowels), with every sign's exact path data. A
  generator will not keep those letterforms, so the band is a bake from the chart's paths (a PNG or a `TEX.def`, not a
  generated image), cut into the lintel's stone (`stone.soapstone` or `stone.corbel.slab`, already in the library). No
  clan's name is fixed in the kit yet; the bake needs the names.
