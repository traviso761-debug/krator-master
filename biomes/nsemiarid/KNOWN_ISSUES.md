# Krator biome kit — the northern semiarid country: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **The trumpets stand still in `?unique=1`**: the core's foliage shader has no spin; the variants' shader, which
      the page draws with, has.
- [ ] **The catalog owes the fruit.** Apples, walnuts, apricots, pears, pomegranates, pistachios and almonds are drawn
      (on the trees and as windfall) but `kits/catalog/krator-master-furniture-generic-fruit.js` has no piece for any
      of them, so `fruit` is null and the probe names them (`FRUIT_NOT_DRAWN`). Adding them is a catalog change: every
      build that takes the catalog rebuilds (CLAUDE.md), so it waits for the owner's go-ahead. Pistachio and almond are
      not in `kits/crops` either.
- [ ] **No highland spurs.** 12% of the region is over 2.5 km (Dsb, Csb, Dfb, Cfb): `PLAN.md` reads nhighlands and
      ebadlands in place there. Not wired yet.
- [ ] **The small and weird are first passes**: lathed and card geometry at a few hundred triangles each, read from the
      owner's two reference boards. Judge them from the shots and say which to push further.
- [ ] **The hulk gardens are not here**: the rust vine has its tag and item and nothing places it; it belongs to the dam
      bed's hulks (`biomes/dambasins`, D3, after its flora, D2). The pothole pools' plants are the scablands' own
      (`biomes/scablands`, 2026-10-23: kolk lilies, pothole quills, seep sedge, spray ferns).
- [ ] **Not in the open world yet.** The kit is ready for `WORLD_KITS` (a pass table, make/grow, record mode); the north
      basin's open world (`openworld/north-basin`, data only) is `PLAN.md` step 6.

## Closed

- [x] **The frills' fins stayed on the column** (closed 2026-10-23). A gale now strips them: a bearer of the seed weather
      may name its species (`89c-host-seeds.js`, `BEAR.frillFin`), so the frill lets go of its fins as well as its plumes,
      held to 12 m/s (a breeze's gusts never reach it, a gale's do); a fin kites, falling fast, lifted by the gusts on
      its broad side, tumbling end over end. The probe steps the module's clock at a frill: none in a breeze, hundreds in
      high wind, and none under a hold no wind reaches (the negative).
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
