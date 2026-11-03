# kits/xanadu: the Xanadu kit

The architecture of the southern Sultanate of Xanadu: Tibetan massing (battered whitewashed walls, flat roofs, the maroon
twig band, gilded pavilions) with Indian, Turkish and Persian detail, gold on everything wealthy, religious or civic.
Moved unchanged from `settlements/xanadu/src` on 2026-11-03 (MODULARITY-PLAN.md step 4): it is the culture's building kit,
not a settlement's layout. `settlements/xanadu/README.md` describes the buildings, the packages and the sheet.

| Files | What |
|---|---|
| `src/70-xa-tex.js`, `71-xa-mat.js`, `72-xa-helpers.js` | the foundation: the painted palette and textures, materials and kit items, the helpers (the battered mass, the cumba, the roofs) |
| `src/74-xa-dwell.js` ... `81-xa-public.js` | dwellings, trade, farms, sacred, the palace, guilds, military, public buildings |
| `src/82-xa-hill.js` ... `87c-xa-erewhon.js` | the later packages: the hillside, the Turkish houses, the Grand Baths, water and gardens, the vizier's, the spicer's, the Andean houses, Erewhon's pieces |
| `src/88-xa-dress.js`, `89-xa-trades.js` | the dress (palette, painted motifs, the paint filter), the trades table (`XA_TRADES`) |
| `kit_bundle.py` | the kit sealed for another world's page as `XAK` (Longsong's valley villages take it) |

`xanadu.py` names the files (`FOUNDATION`, `BUILDINGS`, `FILES`) and what they draw through. `PORT.md` has their port tags.

**What it draws through.** The Ancients core (`kits/ancients/src`, `core/materials`) and the Iziz Vernacular's materials and
helpers (`kits/iziz-vernacular`). Its library bind (`88y-xanadu-matlib.js`) and its texture pack (`materials.json`, `tex/`) are
still Xanadu's: they move with step 4's matlib item. Its plants come from the Vale of Xanadu biome (`biomes/xanadu`) where a
page loads it (`86b-xa-plants.js`), and fall back to the kit's own shapes without it.

**Who takes it.** `settlements/xanadu` reads it in place (its `xanadu` target is the kit's sheet; its `erewhon` target is the
city of Erewhon); `settlements/longsong` takes `kit_bundle.py`'s `XAK` (with Xanadu's texture pack).

**Its own sheet.** Not yet: the sheet is Xanadu's `xanadu` target, on Xanadu's page shell, and `verify.py dist/xanadu.html
--assert` in `settlements/xanadu` is its check.
