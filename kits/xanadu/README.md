# kits/xanadu: the Xanadu kit

The architecture of the southern Sultanate of Xanadu: Tibetan massing (battered whitewashed walls, flat roofs, the maroon
twig band, gilded pavilions) with Indian, Turkish and Persian detail, gold on everything wealthy, religious or civic.
Moved unchanged from `settlements/xanadu/src` on 2026-11-03 (MODULARITY-PLAN.md step 4): it is the culture's building kit,
not a settlement's layout. `settlements/xanadu/README.md` describes the buildings, the packages and the sheet.

| Files | What |
|---|---|
| `src/70-xa-tex.js`, `71-xa-mat.js`, `72-xa-helpers.js` | the foundation: the painted palette and textures, materials and kit items, the helpers (the battered mass, the cumba, the roofs) |
| `src/71c-xa-openings.js` | the real doors and glass: `xnDoorway`, `xnPane`, `xnRoom` (below, "Doors and glass") |
| `src/74-xa-dwell.js` ... `81-xa-public.js` | dwellings, trade, farms, sacred, the palace, guilds, military, public buildings |
| `src/82-xa-hill.js` ... `87c-xa-erewhon.js` | the later packages: the hillside, the Turkish houses, the Grand Baths, water and gardens, the vizier's, the spicer's, the Andean houses, Erewhon's pieces |
| `src/88-xa-dress.js`, `89-xa-trades.js` | the dress (palette, painted motifs, the paint filter), the trades table (`XA_TRADES`) |
| `kit_bundle.py` | the kit sealed for another world's page as `XAK` (Longsong's valley villages take it) |

`xanadu.py` names the files (`FOUNDATION`, `BUILDINGS`, `FILES`) and what they draw through. `PORT.md` has their port tags.

**What it draws through.** The Ancients core (`kits/ancients/src`, `core/materials`) and the Iziz Vernacular's materials and
helpers (`kits/iziz-vernacular`). Its library bind (`88y-xanadu-matlib.js`) and its texture pack (`materials.json`, `tex/`) are
still Xanadu's: they move with step 4's matlib item. Its plants come from the Vale of Xanadu biome (`biomes/xanadu`) where a
page loads it (`86b-xa-plants.js`), and fall back to the kit's own shapes without it.

**Doors and glass** (2026-11-03; the owner: "remove all dark voids and make all windows, doors and portals actual doors or
windows that have transparency"). The kit takes the Vernacular's openings (`kits/iziz-vernacular/src/69e5-iziz-openings.js`)
and core/door's `10-core-door.js` and `20-core-glass.js` (KDOOR, KGLASS), read in place (`xanadu.py` `OPENINGS_VERN`, `DOOR`),
so its `vnDoor` is a shut leaf registered in KDOOR and its `vnWin` glass over the room's back, and `71c-xa-openings.js` draws
the kit's own the same way: a gate or doorway drawn as a dark plate is a leaf (two for a wide one: `xnDoorway`), a window or a
shop front glass or a lit pane in front of the room card (`xnPane`), an unglazed opening (a slit, a vent, the oriel's inside, a
blind arch, an iwan's vault, a tent's flap) the room's dim back (`xnRoom`); the arch heads and niches (`xArcDark`) take that dim
back, and the Grand Baths' coloured glass is transparent (core/door's stained kind). Every body of the kit is solid, so every
door is LOCKED, with an id from its def, its placement and its number. A door keeps the old threshold step (69c's). Left dark on
purpose, as they are not openings: wells, the mine shaft, ovens and kilns behind their embers (`vDarkB`). `kit_bundle.py` carries
core/door's 10 and 20 and 69e5 into `XAK` (the kit's own KDOOR; no walk: a proto's doors are in `userData.doors`, locked).

**Hollow walls and interiors** (2026-11-09). The kit's interior set is `kits/interiors/sets/xanadu.js` (one item per def:
the dwellings, trades, farms, sacred buildings, guilds, military, baths, the Turkish and Andean houses; the open pieces
skipped with their reasons). Its pages (`settlements/xanadu`: the sheet and Erewhon) take it with `?interiors=1`
(`settlements/xanadu/src/89y-xa-interiors.js`): the rooms planned and furnished from the catalog (`xanadu`, its chain
`eastabyss`, `generic`), their floors, walls and stairs in core/walk, and the bodies hollow through the Vernacular's auto
bodies (`kits/iziz-vernacular/src/69e6-vern-autobody.js`; `xanadu.py` `HOLLOW_VERN`): a battered block (`xnWall`) or
a plain one that holds a storey of an item's body is four walls cut at the doors and windows, its doors unlocked leaves into
the rooms. A battered or stepped stack is planned INSET (every storey on the footprint they all share), so its walls'
lean never reaches a room. `kit_bundle.py`'s `XAK` (Longsong) does not take it.

**HELD: the citadel** (the owner, 2026-11-09). The Sultan's Palace (`xa_palace`), both Pleasure Domes (`xa_pleasure_dome`,
`xa_pleasure_dome_bay`), the Grand Vizier's palace (`xa_vizier`) and the palace gate (`xa_palace_gate`), the citadel of
`settlements/xanadu/citadel/BLUEPRINT.md`, wait on the owner's visual references: their items are skips that say so, and
their builders are unchanged.

**Erewhon's citadel, Moorish and Mughal** (2026-11-09; `settlements/xanadu/citadel/refs/citadel/STYLE.md`, the owner's five
references). Everything in the citadel but the two Pleasure Domes is new defs, hollow and walkable, room by room on the
blueprint: `xa_cit_palace`, `xa_cit_vizier`, `xa_cit_treasurer`, `xa_cit_chancellor`, `xa_cit_mines`, `xa_cit_envoys`,
`xa_cit_barracks`, `xa_cit_temple`, `xa_cit_kitchens` (the older `xa_palace` and `xa_vizier` stay for the sheet and other
worlds). Three files, listed apart (`xanadu.py` CITADEL, so XAK, Longsong and kits/construction are unchanged):
`78l-xa-moorish-data.js` ([G data] `XMOOR`: arch outlines pointed, horseshoe and cusped; muqarnas hood and cornice cells;
star-polygon ceilings; the pointed barrel), `78m-xa-moorish.js` (the materials, each wired in `materials.json` to the texture
it is owed with a library stand-in: settlements/xanadu/KNOWN_ISSUES.md; the instanced items; the helpers `xmArchHead`,
`xmMuqHood`, `xmMuqCornice`, `xmStarCeiling`, `xmVault`, `xmJali`, `xmBalustrade`, `xmColumnPair`, `xmIwan`, `xmBasin`,
`xmFountain`, `xmRill`), `78n-xa-citadel.js` (`xcPlan`: walls, skins, arched doors with unlocked core/door leaves, windows with
jali and KGLASS's clear pane, floors, ceilings, courts, flights and the Ramp of the Sultan, all drawn from the item in
`kits/interiors/sets/xanadu-citadel.js`, whose rooms the furnisher and core/walk take; each building's massing). A world takes
them with `kxa.paths(kxa.CITADEL)` and the interior set `xanadu-citadel`. The style per room is the item's `style` and `ceil`
(the set file's header). Screenshots and how they compare to the references: `settlements/xanadu/citadel/PALACES.md`.

**Footprints** (2026-11-10; the owner: "the garden pieces ... stick out way over what their footprint is supposed to be").
A def's footprint is its `w x d`, its lot: the sheet spaces sites by it, Erewhon's garden grid and blocks set 8 m and 16 m
tiles side by side by it, and `XAK.dims()` hands it to another world. `fw x fd` is only the slope footing under the body.
Everything a def draws stays on its lot, foliage included: a plant's crown is fitted to the room between its trunk and the
lot line (`xaRoom`, `72-xa-helpers.js`): the kit's own crowns (`xnTree`, `xnCypress`, the garden palm `xnXPPalm`) shrink to
it, and `xaPlant` (`86b-xa-plants.js`) reads the crown the Vale biome is about to draw (its first three draws, replayed from a
seed set on the biome's own stream) and scales the whole tree to fit, reporting an error if the biome ever draws past it.
`node kits/xanadu/tests/test-footprints.js` (a `tools/test_all.py` step) seals the kit as `XAK`, builds every def and variant
alone and measures every instance's box against its lot (0.25 m tolerance, townsfolk left out): a garden or water piece
past it fails; any other def past it must be listed in the test's `KNOWN` with its overhang (`KNOWN_ISSUES.md`, "Defs past
their lot") and must not grow.

**Who takes it.** `settlements/xanadu` reads it in place (its `xanadu` target is the kit's sheet; its `erewhon` target is the
city of Erewhon); `settlements/longsong` takes `kit_bundle.py`'s `XAK` (with Xanadu's texture pack).

**Its own sheet.** Not yet: the sheet is Xanadu's `xanadu` target, on Xanadu's page shell, and `verify.py dist/xanadu.html
--assert` in `settlements/xanadu` is its check.
