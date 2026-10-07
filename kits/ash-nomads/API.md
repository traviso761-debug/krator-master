# kits/ash-nomads: API

Units, frames, the def, `place()`, `FURNISH` and the probe are the Scyvoi kit's: read `kits/scyvoi/API.md`. The culture tag is
`ashnomad` (`KIT.culture`); the faction in the life data is `Ash Nomads`.

## Fragments

| Fragment | Prefix | What |
|---|---|---|
| `26k-kit.js` | | `KIT`, `SV_LIB` (felt canvas goat ashCloth hide chitin plates wood carved lacq stone rock earth rug rope iron patFret patNazca patEmber patKilim medSun medAshSun), `KIT_FALLBACK`, `KIT_HAS(k)`, `SVPAL`, `P` |
| `10-core` `27-mat` `30-geo` `36-def` `40-tk-tentkit` `81-sky` `90-scene` `91-probe` `91f-furnish` `91n-night` `92-camera` `93-anim` `99-tail` | | VENDORED from `kits/scyvoi/src` (the sky from `settlements/iziz`) |
| `40a-ak-ash.js` | ak | `akC(hex)` (a cached linear colour), `akMotif(m, ...)` (`fret spiral bird beetle tooth eye`), `akBand(L, y, h, o)`, `akBandRing(r, y, h, o)`, `akRoofColf(bands, N)`, `akConcave(o)` (returns roofY(r)), `akChief(o)`, `akDome(o)`, `akRidge(o)`, `akBanner(x, z, h, o)`, `akSunDisc(y, z, R)`, `akSpire(y, s)` |
| `41-tk-dress.js` | tk | the Scyvoi helpers re-keyed to `ashnomad_*`: `tkRingSeats`, `tkRowSeats`, `tkTea` (a carapace table and the brew set), `tkHonour`; and `tkScreens(x, z, ry, gap)` (two ash screens across a door) |
| `42-as-small.js` | as | the five small tents |
| `44-al-large.js` | al | the five large tents; `alWall(a, b, fn, out)` (a straight wall's frame, its face outward) |
| `46-ac-chief.js` | ac | the chieftain's tent, the assembly (`AC`: its sizes) |
| `48-at-trade.js` | at | the shaman's hut, the smithy, the chitin worker's, the supply tent; `atAwning` |
| `56-sa-beasts.js` | sa | the machinery of the Scyvoi kit's beasts and the ash tack: `saDrape`, `saBeetle`, `saPackFrames`, `saBridle`; `saMount`, `saHerd` |
| `59-ah-pens.js` | ah | `ahRingCorral`, `ahScreenFence`, `ahPen`; the tying post, the beetle line, the corral and the runner pen |
| `89-rows.js` | | `FAMILIES` |
