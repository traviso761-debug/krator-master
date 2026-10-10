# kits/desert-nomads: API

Units, frames, the def, `place()`, `FURNISH` and the probe are the Scyvoi kit's: read `kits/scyvoi/API.md`. A world takes a
piece exactly as it takes a Scyvoi one (`place(key, x, z, ry, {y, v})` inside its build pass, then the flushes). The culture
tag is `nomad` (`KIT.culture`); the faction in the life data is `Desert Nomads`.

## Fragments

| Fragment | Prefix | What |
|---|---|---|
| `26k-kit.js` | | `KIT`, `SV_LIB` (felt canvas goat hair hide wood carved lacq stone rock earth rug rope iron patKilim patSadu patSadu2 patLining patLining2 patZellige), `KIT_FALLBACK`, `SVPAL`, `P` |
| `10-core` `27-mat` `30-geo` `36-def` `40-tk-tentkit` `81-sky` `90-scene` `91-probe` `91f-furnish` `91n-night` `92-camera` `93-anim` `99-tail` | | VENDORED from `kits/scyvoi/src` (the sky from `settlements/iziz`) |
| `40d-dk-desert.js` | dk | `dkBand(L, y, h, motif, col, o)` (motifs `tri lozenge arch chevron step`), `dkWall(a, b, fn, out)`, `dkCaidal(o)`, `dkSquare(o)`, `dkBayt(o)`, `dkTuareg(o)`, `dkFinial(y)` |
| `41-tk-dress.js` | tk | the Scyvoi helpers re-keyed to `nomad_*`: `tkRingSeats`, `tkRowSeats`, `tkTea`, `tkHonour`; and `tkCoffee(x, z, ry)`, `tkMajlis(x0, z0, x1, z1, tx, tz)` |
| `42-ds-small.js` | ds | the five small tents |
| `44-dl-large.js` | dl | the five large tents |
| `46-dc-chief.js` | dc | the sheikh's tent (`DC`: its layout) |
| `48-dt-trade.js` | dt | the smithy, hidemaker, supply, seer and hookah tents |
| `56-sa-beasts.js` | sa | the machinery of the Scyvoi kit's beasts (`saFauna`, `saCapture`, `saLife`, `saFlush`) and the desert tack: `saDrape`, `saShadad`, `saPack`, `saHorse`, `saLizard`, `saBridle`; `saMount`, `saHerd` |
| `58-dw-carts.js` | dw | `dwWheel`, `dwCamel`; the camel cart and the camel litter |
| `59-dh-pens.js` | dh | `dhZariba`, `dhStoneRing`, `dhReedFence`, `dhPen`; the hobble post, the kneeling stone, the camel line, the four pens |
| `89-rows.js` | | `FAMILIES` |
