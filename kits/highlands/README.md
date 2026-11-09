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
| `src/72-hl-helpers.js`, `73-hl-carve.js`, `73b-hl-frame.js` | walls and roofs, the carving (totems, posts, dougong), the timber frame |
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
landing and flight, as the builders draw their own steps. Left dark on purpose, as they are not openings: flues, fireboxes and
furnace mouths behind their embers, the mine shaft, the flame trench, scorch marks (`vDarkB`). A page that takes the kit takes
`OPENINGS` and finishes the doors once the world is built (`settlements/highlands/src/95-hl-doors.js`: `IZDOOR.finish`,
`KDOOR.clearDoorways`, the leaves to `KDOORHOST`) and gives the E key (`99-start.js`).

**Who takes it.**
- Read in place: `settlements/highlands` (its `highlands` target is the kit's sheet, `dist/highlands.html`; its `roketstad`
  target is the town of Roketstad).
- Vendored, checked against this kit (`--vendor-check`): Reed Lake (the five foundation files; `73-hl-carve.js` kept on purpose
  before the catalog-furniture conversion), Dalab and Ys (the foundation's five and `74-rep-dwell.js`, for their embassies'
  Republican dwellings).

**Its own sheet.** Not yet: the sheet is Highlands' `highlands` target, on Highlands' page shell (scene, probe, labels,
`99-start.js`), and `verify.py dist/highlands.html --assert` in `settlements/highlands` is its check.
