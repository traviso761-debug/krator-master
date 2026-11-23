# Krator biome kit — the northern semiarid country: known issues

Read before changing anything here. `build.py` prints the open count.

## Open
- [x] (2026-11-09, verified 2026-11-10) **The succulent columns' quality pass, backported from `biomes/sedesert`** (TODO.md's
  ride-along): `columnGeo` in `50-biome-nsemiarid-species.js` (a narrow rounded foot closed by a cap, a domed top, per-row normals;
  80 triangles a column, was 48 open at both ends) and the sail candelabra's arms seated in `60-biome-nsemiarid-floor.js` (an elbow
  out of the trunk, the arm's column standing on its end, its foot sunk a third of the elbow's radius; the same draws in the same
  order). Per type, `column`: 16,127 instances, 774,096 to 1,290,160 triangles; the `nsemiarid/floor` layer 14,986,645 to
  15,502,709 (16.0 M budget), 15.73 M to 16.24 M scene triangles at the showcase camera, 54 draw calls either way.
  `verify.py --assert` on SwiftShader OK, 65 pass, before and after. The pages that read the species fragment (scablands' coulee,
  dambasins' graveyard, east and port) were rebuilt with it on 2026-11-09.

- [ ] **Station 2, the high country: the owner's eye and decisions** (2026-11-09; `PLAN-STATIONS.md`, "Station 2, as built"). Not judged by the
      owner: the site (5.1 px 848,564), sandstone for the plan's granite (the geology bake: sedimentary), the park's pale golden ground and its
      thin floor from afar, the kin's sizes (x.42-.7 of nhighlands'), the far ridges. **Not taken, the owner's to decide** (as nhighlands' station
      2 left them): `KFIRE`, seasons, `ATMOS.snowCover` with `lee` (the snowbeds are a field and a ground layer), KSTRATA on the faces. The
      wind-shaped facing check is off on this page (`HCHK.facing` wants 20 in view; the bench grows a few frills and trumpets).
- [ ] **`buckthorn` to Korona is owed** (`EXCHANGES.md`, nsemiarid -> korona: "the east lobe's lake shore on Korona's side, about 830 m"). No
      Korona station stands on that shore (the basin's lake is the Tiers' lake inside Korona, the trenches' a salt lake); it goes with the first
      station there (the dam basins' planned station 3, the east bed inside Korona, is the nearest). This kit's `buckthorn` item and `60`'s
      `buckthorn()` are ready to read in place.
- [x] **`bladderpool` from Korona** (closed 2026-11-09): taken as the plan's cousin, the **pond bladderwort** (`50`: the `bladder` item and
      `NSEMIARID.PLANTS.bladderwort`, `tags.kin` `korona.bladderpool`, danger 0; `60`: the floor's last pass), mats on still fresh warm water:
      station 1's spring pool (46; the salt lake none, the stream none), the scablands' plunge lake, potholes and the high line's rain pond; not
      the high country's tarns (cold). Station 1 checks it (`99`: on a fresh surface, none in the salt lake; its negative lifts them). Defined
      after every item and placed last, its texture drawn from KRAND, so nothing else moved.
- [x] **nhighlands' station families were not in its pack** (seen and closed 2026-11-09): its `materials.json` named `ground.needles`,
      `ground.goldgrass`, `ground.slab`, `ground.chaparral`, `ground.fell`, `ground.scree`, `ground.snowbed`, `ground.lush`, but its
      `tex/pack.json` had none (its stations 2-4 were built in a cloud turn with no library images). Re-packed (`pack.py biomes/nhighlands`, every
      older file the same bytes) and its montane, foothills and alpine pages rebuilt and GPU-verified; station 1 and the bogs unchanged.

- [ ] **The final rebuild's look, for the owner's eye** (2026-11-03, pair 9; `PLAN.md` section 11). Not judged by the owner: the ground on
      KGROUND (now Standard, the eight layers hex-tiled, the desert's pavement and the bed's mud polygons as KGROUND kinds: `?kground=0` the old
      floor), the far trees as impostors (gain 2.4, `?diet=0`, `?impgain=`), the basin past the map (`?far=0`), the height fog (`?hfog=0`), the
      solid bodies drawn as wood (`?bodies=leaf` the old still leaf material: the bead chains and the striders may read a touch darker), and KGROUND's relief (`?kgrelief=0` without it).
- [x] **The sun's shadows are attached on `?shadow=1` only.** core/shadow's off-by-default switch (a panel button, `attach` turning nothing on)
      is on the Throne's branch (0293c8c16), not yet on `claude/biome-rebuild`; when it merges, `88-host-build.js` attaches always and the
      button turns them on. Not measured here. **Closed 2026-11-08:** `88-host-build.js` attaches always on core's switch (off at load; core's
      button or `?shadow=1` on, `?shadow=0` none); scablands, which takes this 88, gets it too. Still not timed.
- [ ] **The attach audit cannot see the trees.** The variants' pools (86) are drawn outside the kit's registry, so their crowns are neither
      audited nor counted as structure (ebadlands has the same); the audit covers the floor and its travellers (329 cards above 2 m). A
      tumbler caught against a variant tree's windward face reads as floating with nothing near it.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. 1.42 atm (PLAN.md), a milky dust haze. Kept from the dome: the
      iced Outer Rim in the north and the ranges behind it, the mesas (ridges); the Inner Wall highlands in the south are
      the map's own upland. biomes/scablands (an overlay build) takes this sky. biomes/scablands draws it too: 149 draw
      calls before, 148 after, verify.py --assert passing. Draw calls at the default camera (verify.py --assert, GPU): 90
      before, 87 after.

- [ ] **The trumpets stand still in `?unique=1`**: the core's foliage shader has no spin; the variants' shader, which
      the page draws with, has.
      Stays open (2026-10-25): needs a spin in the core foliage shader (core/biome 30-core-foliage), a shared change.
- [ ] **The catalog owes the fruit.** Apples, walnuts, apricots, pears, pomegranates, pistachios and almonds are drawn
      (on the trees and as windfall) but `kits/catalog/krator-master-furniture-generic-fruit.js` has no piece for any
      of them, so `fruit` is null and the probe names them (`FRUIT_NOT_DRAWN`). Adding them is a catalog change: every
      build that takes the catalog rebuilds (CLAUDE.md), so it waits for the owner's go-ahead. Pistachio and almond are
      not in `kits/crops` either.
      Stays open (2026-10-25): a catalog change (every catalog build rebuilds) waiting for the owner's go-ahead.
      Stays open (2026-10-26): still the catalog's (`kits/catalog`, not this kit's files). The proposal: seven pieces in
      `krator-master-furniture-generic-fruit.js` in its SPEC shape (apple, walnut in its husk, apricot, pear, pomegranate,
      pistachio, almond in its hull), plus the sea buckthorn's berry cluster (the new tugai shrub, 2026-10-26); then set
      `fruit` in `NSEMIARID.HARVEST` and empty `FRUIT_NOT_DRAWN` (98-host-checks.js) of them, and rebuild every catalog build.
- [ ] **No highland spurs.** 12% of the region is over 2.5 km (Dsb, Csb, Dfb, Cfb): `PLAN.md` reads nhighlands and
      ebadlands in place there. Not wired yet.
      Stays open (2026-10-25): a design task (PLAN.md reads nhighlands and ebadlands in place), not a fix.
      Stays open (2026-10-26): still a design task: it means taking two other kits' fragments into this page and a zone for
      them over 2.5 km, a plan step rather than a defect in this kit's files.
- [ ] **The small and weird are first passes**: lathed and card geometry at a few hundred triangles each, read from the
      owner's two reference boards. Judge them from the shots and say which to push further.
      Stays open (2026-10-25): waits for the owner's judgement from the shots.
      Second pass (2026-10-26, `50-biome-nsemiarid-species.js`, a new `lathe2` with true normals and relief): the censer caps
      (a crumpled sheet with blotches) are sponge domes with a rolled rim over a dark pore face and soft pore dots; the
      furlers (fourteen flat spikes) are eleven strap petals cupped round a dark eye; their bulbs (the core's plain lobe in
      one colour) are ribbed, darker at the foot; the roll-egg's cells (a checker) are raised pale cells in a dark net,
      rows offset like a honeycomb. Placement is unchanged (geometry only). Cost: +0.6 M floor triangles (14.30 M ->
      14.84 M of 16 M: censers 5.8k x +28, bulbs 7.6k x +16, furlers 7.6k x +25, eggs 2.1k x +48).
      Stays open (2026-10-26): the mace heads, bead chains, step cones, hitchers and windows are untouched first passes;
      the owner judges the four reworked from the garden shots before the rest go the same way.
- [ ] **The hulk gardens are not here**: the rust vine has its tag and item and nothing places it; it belongs to the dam
      bed's hulks (`biomes/dambasins`, D3, after its flora, D2). The pothole pools' plants are the scablands' own
      (`biomes/scablands`, 2026-10-23: kolk lilies, pothole quills, seep sedge, spray ferns).
      Stays open (2026-10-25): waits for dambasins' flora (D2) and its D3.
      Stays open (2026-10-26): unchanged; the hulks are dambasins' (another biome's files).
- [ ] **Not in the open world yet.** The kit is ready for `WORLD_KITS` (a pass table, make/grow, record mode); the north
      basin's open world (`openworld/north-basin`, data only) is `PLAN.md` step 6.
      Stays open (2026-10-25): a design task (PLAN.md step 6), outside the kit's own src.
      Stays open (2026-10-26): open-world work was out of this pass's scope (the owner).

## Closed

- [x] **The trumpets stood still in `?unique=1`** (closed 2026-10-26). The core's foliage shader has no spin, but the core
      leaves `begin_vertex` alone and each crown item's own origin is the pivot, so the host wraps the core's hook on the
      two spin materials there (`86-host-variants.js`, `VARIANTS.spinUnique`, called from `88-host-build.js` in unique mode):
      the same turn by `SPIN`, made about the instance's own up axis before its matrix, with its own GLSL names (the core
      already declares `_sc`). No core change. A core spin option (`30-core-foliage.js`, `foliageHook`: `o.spin` adding this
      turn) would let other kits have it too; not needed here.
- [x] **The 2026-10-25/26 library sets that fit, wired** (2026-10-26; `materials.json`, `tools/textures/pack.py`): the golden
      poplar (the Euphrates poplar) takes `card.poplar.euphrates` as its own crown card (`poplarLeaf`, whole sheet, keep 0)
      and `bark.poplar.euphrates` as its own bark bucket (`bark6`; the furrowed canvas without the pack); `ground.soda.crust`
      is the eighth ground layer, on the salt pan's middle where the efflorescence fades (the pan lies under the dune field,
      so there it takes most of the sand's share); `card.saltbush` and `card.seabuckthorn` (keep 1, the middle cell) are two
      new floor shrubs: saltbush on salty desert ground and the pan's edge, sea buckthorn in the tugai and on the stream
      banks (+2 draw calls a view, their two items). Not wired: `rock.badland.bedded` and `rock.yardang.silt` (vertical beds
      and flutes want a wall; this stage's ground is one top-down projected sheet), `ground.salt.ochre` (the soda crust took
      the pan), `ground.sand.dune` (the dunes keep the coast sand; worth a look).

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
