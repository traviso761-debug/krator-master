# biomes/outlands: known issues

Station 1, the Fog Wall (`dist/outlands.html`), first built 2026-11-09.

## As built (verify.py --assert, 2026-11-09: 53 checks pass, each colony check with its negative control)

708 colonies (veil, mast, copper and wadi), 122,700 forms (365,800 instances), 43,800 seam crusts near the eye; 13.92 M triangles
of a 14 M pass budget, 25 draw calls at the worst view. The build takes ~27 s under software GL, the ground's paint ~5 s of it.

## By design (the owner's calls)

- **The slope is compressed onto one page** (the owner, 2026-11-09: "make the slope fit one page"). The model puts the Fog Rim
  (S1, legacy px 1337,393, 3,883 m) and the Gem Hills' shoulder (S4, legacy px 1352,391, 2,274 m) about 30 km apart; the page holds
  the whole fall at its true heights (4.5 km at the crest to 2.33 km at the south edge) in 7 km, about 4.4x steeper than the
  model's mean slope. The bands keep their heights (the fog belt 3.5-4.4 km, the wet mast band 2.95-3.45 km, the dry shoulder
  below), so the zones and the colonies are where the plan puts them; the distances between them are not.
- **The mast band is Z2's flora above Z2's height.** PLAN.md section 3 puts the wet valley (Cfa) at 2.0-3.0 km; on this slope the
  wet band is the seepage zone under the belt (2.95-3.45 km). The mast colony lives on the wet, not on a height.
- **Only four colony types are on this page** (veil, mast, copper, wadi): the other five's forms come with their stations
  (`OUTL.TYPES[].station`). Nursery and salt are N-basin types (stations 4, 5); river is station 2's; rim is the Gate's.

## Open

- [ ] **The fog field and the drawn fog belt are two computations of one band.** The kit places the veil colonies by the host's
  `fog` field (45-host-stage.js: the band 3.5-4.4 km, the south-facing share); the look is `ATMOS.fogBelt` on the same band
  (89z-host-atmos.js). `ATMOS.fogBeltMake` (the belt's engine-free half) lives in a fragment that loads after the stage, so the
  stage cannot read it; the two agree on the band, not cell for cell.
- [ ] **No fauna yet.** The hexapods that tend the colonies (the fog-drinker at the veil caps' drip, the rock-grazer on the lace
  crust) are `kits/fauna`'s, PLAN.md section 7.
- [ ] **The seam crusts are near-eye only** (range 380 m). Past that the seam is the ground's painted line (a 5.8 m texel), which
  reads from the crest as the mosaic but softens into a smudge at grazing angles.
- [ ] **The ground paint costs ~5 s** (`window._groundMs`): one colony lookup per texel of a 1280 canvas. A raster of the
  colony map (ids and gaps on a 6 m grid) shared by the paint and the placement would halve it.
- [ ] **Forms are instanced items, not trees**: a veil cap is a stalk, a cap, a fringe and a drip ring placed together, and the
  page has no impostors. Past the far LOD the tall forms are drawn in full (they are few: see the page's counts).
- [ ] **The lace crust and the green fans are flat colour.** `organic.lace.copper` is in the library but not yet on the crust
  (nor in `materials.json`): the crust's lathe uv runs round it, not across it; a planar uv option on `BIO.fung.crust` would let
  the library's lace sit on it.
- [ ] **The stalks are plain flesh-white**: no library skin on the stalks and masts yet (the comb mast's rust is the instance colour).
- [ ] **The pit's adits are records only** (KRELIEF.pit gives them; nothing carves them: KCARVE is not taken).
