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

**Who takes it.** `settlements/xanadu` reads it in place (its `xanadu` target is the kit's sheet; its `erewhon` target is the
city of Erewhon); `settlements/longsong` takes `kit_bundle.py`'s `XAK` (with Xanadu's texture pack).

**Its own sheet.** Not yet: the sheet is Xanadu's `xanadu` target, on Xanadu's page shell, and `verify.py dist/xanadu.html
--assert` in `settlements/xanadu` is its check.

**Scrap Xanadu** (the owner, 2026-11-11; `PLAN-SCRAP.md`). The Xanadu body built with the Ancients' reclaimed materials,
well ordered and never ramshackle (the contrast is `kits/post-apoc`). Whole shell panels are laid in courses as checker,
band and stripe facings; glazing becomes jali grilles, lantern clerestories and glass domes on bronze ribs; girders are
dressed columns and lintels; cable makes the balustrades; bronze the finials and the eight-spoked Wheel; the poor live in tanks, silos and hull vaults nearly as found. Twenty-one defs,
`xa_scrap_*` (culture `xanadu-scrap`), in `src/87s-xs-mat.js` (items), `87t-xs-helpers.js` (the `xnXS*` vocabulary) and
`87u-xs-build.js` (the buildings), `87v-xs-poor.js` (the poor tier and the farm). The package is **opt-in**: `xanadu.py` lists it as `SCRAP`, not in `FILES`, so the
pages that take the kit do not change. Its sheet is `settlements/xanadu`'s `scrap` target (`dist/xanadu-scrap.html`);
`kit_bundle.bundle(scrap=True)` seals it into `XAK` for a world (Strongbow's town first) with core/rand.
