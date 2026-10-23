# Krator biome kit — the northern semiarid country: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **The frills' fins stay on the column.** On core/atmos's wind (`89b-host-atmos.js`) the trumpets turn, the
      seeds fly off the trees when the wind passes each one's hold, the drift lanterns lift in still air, the furlers shut
      as each gust passes (their material reads `atmWind` where each flower stands), and every crown sways harder and
      leans downwind as the wind rises. What is left a still frame: a frill's fins on its column (its shed side is
      drawn, and its plumes fly, but no fin leaves the column), and the trumpets in `?unique=1` (the core's foliage
      shader has no spin; the variants', which the page uses, has).
- [ ] **The catalog owes the fruit.** Apples, walnuts, apricots, pears, pomegranates, pistachios and almonds are drawn
      (on the trees and as windfall) but `kits/catalog/krator-master-furniture-generic-fruit.js` has no piece for any
      of them, so `fruit` is null and the probe names them (`FRUIT_NOT_DRAWN`). Adding them is a catalog change: every
      build that takes the catalog rebuilds (CLAUDE.md), so it waits for the owner's go-ahead. Pistachio and almond are
      not in `kits/crops` either.
- [ ] **No highland spurs.** 12% of the region is over 2.5 km (Dsb, Csb, Dfb, Cfb): `PLAN.md` reads nhighlands and
      ebadlands in place there. Not wired yet.
- [ ] **The small and weird are first passes**: lathed and card geometry at a few hundred triangles each, read from the
      owner's two reference boards. Judge them from the shots and say which to push further.
- [ ] **The overlays' plants are not here**: hulk gardens (the rust vine has its tag and item, nothing places it) and the
      pothole pools belong to `biomes/dambasins` and `biomes/scablands` (`PLAN.md` sections 5, 6).
- [ ] **Not in the open world yet.** The kit is ready for `WORLD_KITS` (a pass table, make/grow, record mode); the north
      basin's open world (`openworld/north-basin`, data only) is `PLAN.md` step 6.

## Closed

- [x] **The stream was not continuous** (closed 2026-10-23, the owner's screenshot: the water in pieces down the valley).
      The ground is one grid of 13.4 m cells and the stream 14 m wide, so wherever no vertex fell near the centreline a
      triangle bridged the channel bank to bank and hid the water. In every row the stream crosses, the vertex nearest it
      now moves onto the centreline and the next onto the banks (6.5 m, 17 m), and those quads take the lower diagonal
      (`45c-host-ground.js`, `STAGE_GROUND.rows`). The probe reads the drawn mesh's own height under the water every 10 m
      (`the stream shows`), with a negative (the water drawn 1.2 m low).
- [x] **The small and weird were flat colour** (closed 2026-10-23): the striders' barrels wear the library's cactus skin,
      their stilt roots and dead stubs the saxaul's gnarled bark (they had drawn black: a three.js rod has no vertex
      colours, so they take a solid material), the bead chains a smooth waxy skin, the sail candelabra banded joints, the
      mace heads horny plates up each spike, the horn pipes ribbed rings. The lathe, the spike ball and the horn had no
      UVs (every vertex at 0, or the radius): they have them now. Each skin is grey relief about its pack's mean, which
      the material divides out, so a species keeps its colour.
- [x] **Every card showed its whole sheet** (closed 2026-10-23). `build.py`'s `matlib_pack()` (copied from ebadlands)
      left `cell` out of the pack, so the steppe grass drew three by three plants per card ("a sheet of 9", the owner)
      and each maple key flew as a sheet of them. It passes `cell` now and `libCard` windows the texture to it
      (`NSEMIARID.libWindow`, which the seed weather's cards take too). The same bug elsewhere: `TODO.md`, "Card sheets
      shown whole". This kit's aspen, blossom, broom, lobed and sage crowns still take their whole sheet (a cluster of
      sprays on a crown card); unjudged, in that audit.

- [x] **The kit's own wind was one vector** (closed 2026-10-22). `NSEMIARID.setWind` takes a vector or a function
      (x,z) => [dx,dz] for a prevailing wind that turns from place to place, and everything the kit lays down by the wind
      reads it where it stands (`NSEMIARID.windAt`): the travellers' headings, the drifts, the crescents (each grove's
      middle), the frills' shed side, the saxaul's lean, the dandelions' balding. On the way: the variants drew those
      wind-shaped trees at a random turn, across or against the wind; they are now turned onto the wind where they stand
      (`86-host-variants.js`, `turnOf`; the probe checks every one drawn, with a negative).
