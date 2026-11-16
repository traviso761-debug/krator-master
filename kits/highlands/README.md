# kits/highlands: the Highlands kit

The wooden architecture of the highland, temperate regions of the Inner Wall, in three related sets: **Republican** (the
Iron Republic: Russian and Transylvanian Saxon, Peles for the grand), **Rustic** (the villages to the south: Norse and
Alpine) and **Tribal** (the Painted Men: bamboo, raw logs, totems, cliff settlements), carved and painted in a NW-coast
formline palette. Moved unchanged from `settlements/highlands/src` on 2026-11-03 (MODULARITY-PLAN.md step 4): it is the
cultures' building kit, not a settlement's layout, and the open-world rebuild places each culture where it lives.
`settlements/highlands/README.md` describes the buildings, the rounds of work and the sheet.

| Files | What |
|---|---|
| `src/70-hl-tex.js`, `71-hl-mat.js`, `71b-hl-motif.js` | the foundation: textures, materials and kit items, the motifs and shop signs |
| `src/71c-hl-openings.js` | the real doors and glass: `hnDoorway`, `hnPane`, `hnRoom`, `hnPlate` (below, "Doors and glass") |
| `src/72-hl-helpers.js`, `72c-hl-plan.js`, `73-hl-carve.js`, `73b-hl-frame.js` | walls and roofs, the carving (totems, posts, dougong), the timber frame |
| `src/88-hl-dress.js`, `89-hl-trades.js`, `89y-hl-furnish.js`, `94-hl-anim.js` | the dress (reclaimed variants, clocks, glazed tiles), the trades table (`HL_TRADES`), the catalog furniture glue (`FURNISH`), the clocks' and orreries' animation |
| `src/74-rep-dwell.js` ... `79f-rep-shipbreak.js` | the Republican set: dwellings, trade, civic, the capital, guilds, the grand, the land, salvage and scrap |
| `src/80-rus-dwell.js`, `81-rus-village.js`, `81b-rus-salvage.js` | the Rustic set |
| `src/84-tri-dwell.js`, `85-tri-village.js`, `85b-tri-salvage.js` | the Tribal set |

`highlands.py` names the files (`FOUNDATION`, `SETS` by culture, `FILES`) and their paths; `culture_files('republican')`
gives the foundation and one culture's set, in filename order. `PORT.md` has their port tags (moved with them).

**What it draws through.** The Ancients core (`kits/ancients/src`, `core/materials`) and the Iziz Vernacular's materials and
helpers (`69b-vern-mat.js`, `69c-vern-helpers.js`, `kits/iziz-vernacular`), which a build takes as before. Its library bind,
`88y-highlands-matlib.js`, is still Highlands' (it moves to `core/materials` with step 4's matlib item).

**Doors and glass** (2026-11-03; the owner: "remove all dark voids and make all windows, doors and portals actual doors or
windows that have transparency"). The kit takes the Vernacular's openings (`kits/iziz-vernacular/src/69e5-iziz-openings.js`)
and core/door's `10-core-door.js` and `20-core-glass.js` (KDOOR, KGLASS), read in place (`highlands.py` `OPENINGS`), so its
`vnDoor` is a shut leaf registered in KDOOR and its `vnWin` glass over the room's back, and `71c-hl-openings.js` draws the
kit's own openings the same way: a doorway a builder drew as a dark plate is a leaf (two for a wide one: `hnDoorway`), a
window clear glass, a lit pane or a stained fanlight (the grand halls' keel heads) in front of the room card (`hnPane`,
`hnPlate`), an unglazed opening (a louvre, a slit, a loggia's core, an open barn door, a mine adit) the room's dim back
(`hnRoom`), the keel recesses and the eyelid dormers' and the totem's voids that dim back too. Every body of the kit is solid
(no 69e hollow walls), so every door is LOCKED: a real leaf, shut, with an id from its def, its placement and its number
(`hl_rep_house_rich@12,-40.0`), that an NPC or a quest can name. A door keeps the kit's old threshold step (69c's), not 69e5's
landing and flight, as the builders draw their own steps (with the interiors on, the furnished defs' bodies are hollow: "Hollow walls" below). Left dark on purpose, as they are not openings: flues, fireboxes and
furnace mouths behind their embers, the mine shaft, the flame trench, scorch marks (`vDarkB`). A page that takes the kit takes
`OPENINGS` and finishes the doors once the world is built (`settlements/highlands/src/95-hl-doors.js`: `IZDOOR.finish`,
`KDOOR.clearDoorways`, the leaves to `KDOORHOST`) and gives the E key (`99-start.js`).

**Hollow walls** (2026-11-09; TODO.md "Doors and glass: what is left"). With the interiors on (`?interiors=1`, Highlands and
Roketstad), a page takes the Vernacular's hollow bodies and auto bodies (`kits/iziz-vernacular/src/69e-vern-hollow.js`,
`69e6-vern-autobody.js`; `highlands.py` `HOLLOW`): while a def with an item in the interiors kit's set
(`kits/interiors/sets/highlands.js`) is built, any block a builder draws (hnStucco, hnLogBox, hnFachBox, a plain vB) whose
footprint matches a storey of the item's bodies, or one of its `shells`, is drawn as four walls of the plan's thickness, cut
where the kit's doors and windows stand (`71c` wraps `hnDoorway hnPane hnRoom hnPlate`; the Vernacular's `vnDoor vnWin`
cut it already), floored at the plan's floor; 69e draws the planned upper floors, partitions and stairs inside. A door on a
hollow face is a leaf in the wall's middle, UNLOCKED, opening into the planned room; a planned door no builder drew is cut
and hung (69e6 `vaPlanDoors`). Nothing changes with the interiors off. **The Hall of the Republic and the Fortress** are
planned room by room on their blueprints (`hall/BLUEPRINT.md`, `fortress/BLUEPRINT.md`): explicit rooms, shells and
stairs in their items, drawn by `src/72c-hl-plan.js` `hnPlan` (floors, shared partitions, balustrades, inner doors,
stairs into core/walk); the Hall's chamber (the horseshoe's tiers, the dais, the members' benches) and the Fortress's bridge
are their builders' (`78-rep-grand.js`). The cut-away (X) opens every furnished building storey by storey.

**Who takes it.**
- Read in place: `settlements/highlands` (its `highlands` target is the kit's sheet, `dist/highlands.html`; its `roketstad`
  target is the town of Roketstad).
- Vendored, checked against this kit (`--vendor-check`): Reed Lake (the five foundation files; `73-hl-carve.js` kept on purpose
  before the catalog-furniture conversion), Dalab and Ys (the foundation's five and `74-rep-dwell.js`, for their embassies'
  Republican dwellings).

**Its own sheet** (done 2026-11-09): `python3 tools/build.py kits/highlands` writes `dist/highlands.html` (the library maps beside
it, `dist/highlands.tex.highlands.js` and `-2.js`); `python3 verify.py dist/highlands.html --assert` checks it (as the Iziz
Vernacular's sheet does, plus `HL_TRADES` against the Voth census through `tools/check_trades.py`). The Republican, Rustic and
Tribal sets, a row per family (`targets/sheet/89z-rows.js`): 172 sites, 237 registered volumes, 325 doors. The page is the kit sheet shared by the kits on the Vernacular's contract (`kits/iziz-vernacular/sheet.py`, `sheet_verify.py`):
the shell (`kits/iziz-vernacular/src/*-vsheet-*`: scene, rows, doors, the take on core/host), the Ancients core read in place from
`kits/ancients/src`, and core's modules: `core/rand`, `core/tags`, `core/walk`, `core/door` (KDOOR and its host: the E key and its
tip), `core/host`, `core/atmos/placeholder`, `core/materials` (records, and the kit's own pack, `materials.json` -> `tex/`, in a
sidecar beside the page). No settlement file is read.
Beside it the kit draws through the Vernacular's `69b`, `69c` and `69e5` (read in place from `kits/iziz-vernacular/src`) and
places catalog furniture through `core/furnish` (the GENERATED `69d-furniture-bundle.js`: the catalog cultures and the
interiors core, as Highlands' page bundles them). Highlands' `highlands` target stays Highlands' sheet.
**Interiors:** the sheet builds the bodies solid, every door locked. A `?interiors=1` mode (Highlands' page has one) goes in
`targets/sheet/` once the kit's interiors and hollow walls land (`kits/interiors/sets/highlands.js`; another session's work):
it already has core/walk, core/door's host and `KDOOR.clearDoorways`. The `doors` assert expects every door locked and must be
relaxed for that mode.
