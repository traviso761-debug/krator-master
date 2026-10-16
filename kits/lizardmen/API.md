# kits/lizardmen: API

Units, frames, the def, `place()`, `FURNISH` and the probe are the Islanders kit's engine (itself the Scyvoi engine): read
`kits/scyvoi/API.md` and `kits/islanders/API.md`. The culture tag is `lizardmen` (`KIT.culture`); the faction in the life
data is `Lizardmen`, the sub-faction `the Rift floor`. Units are metres; x east, y up, z south. A def's local frame: origin
on the ground at its centre, **+z its front**.

## Fragments

| Fragment | Prefix | What |
|---|---|---|
| `26k-kit.js` | | `KIT`, `LZ_CASTE` (the six castes: height, name, role), `LZ_RATIO` (1.25), `lzDoorH(c)`, `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL`, `P(k)` |
| `10-core` `27-mat` `30-geo` `36-def` `81-sky` `90-scene` `91-probe` `91f-furnish` `91n-night` `92-camera` `93-anim` `99-tail` | | VENDORED from `kits/islanders/src` |
| `40-lz-kit.js` | lz | the toolkit: `lzSpan lzNoCut lzCutFloor lzBez`; `lzArch(hz, H)` (the pointed arch: a cusp at any rise), `lzHorn`, `lzArchRib`, `lzRibRoof` (odd ribs outside a hide or reed skin, crossing at the ridge and running on past it; `drop` hangs the skin below the wall top), `lzTuskVault`; `lzWall` (a leaning face with TRIANGULAR openings, `door()` declared), `lzBatterRoom` (four walls leaning in and out), `lzSlab`; `lzDoor(c, s)`, `lzVent`, `lzPortal` (nested frames); `lzLeiwen` (the squared spiral, mirrored halves, one flaw), `lzEye` (the spiral eye, `glow`), `lzGlyphSpiral`, `lzStela` (`pair`, `turned`, `wrapped`, `eye`), `lzTwist`, `lzMenhir`, `lzBellRack`, `lzThreshold`, `lzDust` |
| `42-lz-dress.js` | lz | `LZ_FURN` (common and court), `lzDim`, `lzFurnRoom(w, d, y, tier, o)` |
| `50-lz-dwell.js` | ld | `ldCell`; the five dwellings |
| `52-lz-nest.js` | ln | `lnDome`; the nest hall |
| `54-lz-trade.js` | lt | `ltHall` (a craft hall), `ltCarcass ltHideFrame ltBoneBin`, `ltSpinner` (geometry turned about a vertical axis by a frame hook: the windmill); the three halls, the granary, the windmill, the farm |
| `55-lz-special.js` | ls | `lsModel` (the village model, recursive); the seer's hall, the medicine hut, the warehouse |
| `56-lz-military.js` | lm | `lmArmour(x, z, ry, h)` (an empty suit h tall), `lmRack`; the barracks, the mustering ground, the lookout |
| `56-sa-beasts.js` | sa | the fauna kit's frilled lizard and burden beast as `life` defs (`saHerd`), `saFlush` |
| `57-lc-camp.js` | lc | `lcSkin(R, h, dh, dw, o)` (a hide cone with a caste-sized triangular door cut in it: declares the door, lays the threshold; `bulge` < 0 sags the skin inward between the frame), `lcSkinR`, `lcStake`, `lcRibs(n, R, h, o)` (odd ribs outside the skin, crossing above the apex), `lcShield`; the four tents (`lc-hide lc-shield lc-seer lc-sail`); `lz-muster` places two of them with `place()` |
| `58-lz-monument.js` | lo | the stelae, the obelisk, the circle, the ley line shrine, the bells |
| `60-lz-reliquary.js` | lr | `lrRings lrSphere lrDodec lrVessel` (the relics); the reliquary and its antechamber; `lrDustBox(x, y, z, w, h, d)` records a box of air whose motes fall upward (`LR_DUST`, a `THREE.Points` layer moved by a frame hook, after 93-anim's smoke); `MAT.lrShim` the shimmer (additive, its alpha breathing with `ANIMU.uTime`: the seven nested triangles converging on the inner door) |
| `89-rows.js` | | `FAMILIES` (the sheet's rows) |

## Rules for a new fragment

- A building fragment (`4x`-`7x`) starts `// prefix: xx` and every top-level name starts with it. Every `defBuilding` has a
  unique numeric `seed:` (dwellings 7001-7099, the nest hall 7101, trades 7201-7299, specialists 7301-7399, military
  7401-7419, the camp's tents 7421-7449, monuments 7501-7599, the reliquary and beasts 7601-7699).
- Every building def declares `caste:` (1-6, or `'all'` for a shared building with nested portals): `verify.py` asserts it.
  Its doors are `lzDoor(caste, s)` openings in an `lzWall`, or an `lzPortal` of `lzDoorH(6)` on a shared building.
- Openings are triangles. No windows at a human's eye height: vents sit high (`lzVent`).
- Walls lean: `lzBatterRoom`'s `lean` has at least one face in and one out.
- Ribs, horns and tusks are outside the skin and run past the ridge; counts are odd (7, 9, 11, 13).
- A def's `w d h` must contain everything it draws (1.6 m slack), horns and spikes included.
- `cls: 'building'` with `tags: {types: [...], wealth, role?, job?}`; `cut: true` when it has an interior, and then 4+ catalog
  pieces (`FURNISH`, `lzFurnRoom`); a front door (`door()` through `lzWall`, or `front:`).
- Furniture is never drawn by the kit: catalog keys only (`lizardmen_common_*`, `lizardmen_court_*`, `generic_*`,
  `generic_trade_*`, `job_*`). The relics in the antechamber and the bone hall's stock are kit geometry, not furniture.
- No iron: `bronze` and `bronzeC` are the metals. No banners, drums, horns, gongs or signal fires on any building.

## Probe (`window._api`)

`footprints() doors() kitCoverage() nanSweep() furniture(all) tags() tagExport() materials() life() setNight(v) setCut(v)
setView(...)`, and `REG DEFS SITES ROWS SV_LIFE`. `window._build` holds the build's counters; `KTAGS.page` the tag registry.
