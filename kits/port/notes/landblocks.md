# Land blocks (prefix `lb`, seeds 20700-20799) — hand-back notes

## Files and keys

| file | registers | seed | W x LAND x SEA |
|---|---|---|---|
| `src/88-lb-a-authority.js` | `lbAuthority` (Port Authority / fortress palace) + the lb kit + `lbLayoutDev`/`lbViewsDev` | 20700+d | 110 x 110 x 0 |
| `src/88-lb-b-stores.js` | `lbStores` (warehouses and silos; uses cg helpers read-only) | 20710+d | 110 x 110 x 0 |
| `src/88-lb-c-tanks.js` | `lbTanks` (fuel-tank farm) | 20720+d | 110 x 110 x 0 |

All register `place:'land'`, decays [0,1,3]. Seeds used 20700-20724; 20730-20799 free.
Dev targets: `lbAuthority`, `lbStores`, `lbTanks` (one block behind a quay110,
natural land W/E/N), `lbBlocks` (all three side by side behind three quay110s,
lbTanks also behind the middle block: block/block seams on W/E and N/S).

## Sides (read by every block through `lbSides(opt)`)
`opt.nb.{W,E,N,S}`; **N = -z (inland), S = +z (toward the sea)**. A neighbour
`{kind:'seg', key}` whose registration has `place:'land'` is treated as a
block: a 4 m half street + 4 m pavement (the W/N block draws the seam's
centre line, so two blocks make one 8 m street). Other `seg` (a coastal
segment): an 8 m service road. `land`: 8 m perimeter road, boundary wall
(d0 white + cyan, d1 broken, d3 salvage palisade), riprap if the ground
outside falls. `sea`: quay wall + dredge outside. Missing N -> land; if a
layout gives neither N nor S (today's coastal-run showcase), S -> sea so the
block finishes its front as a quay.

## Shared-change requests
1. Grid placement (port-infrastructure agent): place `place:'land'` keys
   behind coastal segments, gz = coastal gz - coastal LAND, and pass
   nb N/S/E/W with `key`. Until then `portLayoutShowcase` lays land blocks in
   the coastal run (they then close S as a quay; acceptable, not intended).
   `lbLayoutDev(keys,{back})` in 88-lb-a is a working model of the grid.
2. Colours: r128 treats hex as linear and the lights are strong, so a hex
   renders ~2x brighter than expected (asphalt needs ~0x0f0f0e). Worth a
   line in API.md.

## Weaknesses
- The Authority collapse sector ends in clean stepped walls (no jagged section).
- Fortress banners are dense; the throne tent reads flat from far.
- Stores reuses cgSawtooth/cgVaultHall as-is (same silhouettes as cgStore).
