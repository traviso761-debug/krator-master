# kits/islanders: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Textures

- [x] **The painted motifs were canvas stand-ins** (2026-10-12). Fixed 2026-10-14: the owner's sheets
      (`patterns/islander/*`) are the gables (`patGableW`, and `patGableW2` on the rumah gadang), the East's facades (`patGableE`,
      `patGableE2` on the great uma), the kowhaiwhai band, the storyboard, the woven wall and the moon. `28-is-paint.js` draws its
      canvas only without the pack (`?mat=proc`). The storyboard's sheet cuts one frigate bird at its repeat.
- [x] The thatch, timber, bamboo, reed mat, corrugated iron, tin, carved wood, coral stone, sand and the tapa sheet are library
      sets (`materials.json`, 41 families with the furniture detail maps).

## Flora

- [ ] **The plants are placeholders** (`57-fl-flora.js`: coconut, banana, taro, breadfruit, the rice paddy) in simple geometry,
      class `flora` with biome and harvest tags, placed by the farms and the courts. biomes/ringisles now exists (2026-10-20 note), but the kit does not take its species yet;
      they would replace the placeholders by key.

## Naming

- [ ] The brief calls the western subculture "eap Kautoa" and the eastern "the Kautao style"; the kit reads Kautoa as the EAST
      (the old island kingdom, after Sumba) and names the western style simply "West" (`style:'west'`, the sub-faction "the Western
      Isles"). Ask the owner for the West's own name; it is one string in `IS_SUB` (26k-kit.js) and the def names' "(West)".

## Scope

- [ ] A kit sheet, not a settlement: no village layout, streets or life layer for people yet (the farm stock carries life
      data). The harbours' canoes and the hulls on the slips are drawn here (`iwCanoe`, `iwHull`, `ieCanoe`, `ieDouble`); the full vessels
      (the oruwa, karakoa, lakatoi, and the drua, kora-kora and lanong added with this kit) are in `kits/ringsea`.
- [ ] The page is about 10 MB, nearly all of it the inlined library maps (512 px); in line with the Nomad kits.

## The trades (2026-10-14)

- [ ] **No `bundle()` yet.** `isDims()` gives a city layout every building's box and tags, but the buildings draw only in this page;
      the bundle that draws them in another page (as `KratorVehicles`) comes with the isle demo's city plan (`settlements/isle-demo/PLAN.md`, P6).
- [ ] The small West work sheds (quarry, sulphur, salt, pens) keep the horned saddle at a small size; their horns still read heavy
      beside a 3 m shed. Judge against the owner's eye.
- [ ] The salt heaps are the catalog's `job_salt_heap`, white domes as tall as a person: larger than a pan's raked heaps.
- [ ] The sulphur crust, the brine and the salt are tinted stand-ins (`IS_SULPHUR`, `IS_BRINE`, `IS_SALT` on `stone`, `water`, `sand`): no
      library set for them. A salt-crust set is asked for with the isle demo's biome (biomes/ringisles); sulphur crust likewise.
- [ ] `build.py --vendor-check` reports DRIFT in `30-geo.js` and `36-def.js` from the A/B gable sheets (9e43e0ba, before this pass):
      deliberate, not yet recorded upstream in kits/scyvoi.

## Mines and ore (2026-10-15)

- [ ] A mine's ore heaps are tinted by `o.metal` at placement, not by the node it works: the sheet draws before it links. A
      settlement page that places mines after their nodes can pass the source's metal. (The nodes and the rule are
      kits/resources'.)

## Views and the cut-away

- [ ] The moon discs on the fronts of the West's hall and the chief's house do not open with the cut-away (they are drawn
      outside it), so in a cut-away view they float in front of the open floor.
- [ ] The automatic "Palace of Kautoa - eye level" view stands about 74 m out and the rich-houses row in front blocks it
      (the views come from the vendored `90-scene.js`); use `--cam` for the palace's courts. The trade rows hold 13 buildings
      each, so their row views are distant.
- [x] The ikat cloths on the Kautoa weaver's rail used stand-in patterns. Fixed 2026-10-14: the four cloths are the owner's hinggi (`patHinggi`).
- [x] The cut-away kept the near half of every raised floor only after the agents' fix (2026-10-12): `isCutFloor` now runs
      before the piles and the deck in both `iwHouse` and `ieHouse`.

## Walking (core/walk)

- [x] **Floors, stairs and walls reach `core/walk`** (2026-10-19). `src/37-wk-rec.js` wraps `emit` and gives every box a BUILDING draws to
      `core/walk/box` (`KWALKBOX`): a flat box is a floor (a deck, a slab, a stair tread), a tall one a block (a wall segment, a post), a tilted
      one nothing; a door is a gap between wall boxes. Ladders (`isLadder`, `isLogLadder`) are strips, or stacks of rung floors when steep
      (the host walker steps up 0.7 m a frame), with a landing at the top. The host takes `walk: KWALK`, so F-walk climbs the stairs and stops at walls.
- [x] The way up now stands under the house's first front door (`isDoorX`, `40-is-kit.js`) unless `doorX` / `stairX` says otherwise: most West
      and East houses put the ladder or stair at x = 0 while the door was at x = -2, so it climbed to a wall. Both beacons' ladders were 0.8 to
      2.6 m short of their platforms and are fixed (`iw-beacon`, `ie-beacon`).
- [x] Found by the walk audit and fixed (2026-10-19): the great uma's tomb stood on its stair axis (now a pair either side, as the other houses have
      them); the ancestor temple's house stair hung 1.6 m past the platform edge (the house moved back) and the lying-in-state slab blocked the
      platform steps (moved forward); the trader's shophouse door was filled with planks by the window stacked over it (`isWall` now stacks an
      opening over a door) and its upper floor had no way up (a stairwell along the back wall; the catalog ladder through the closed slab is gone);
      the Kautoa watchtower's lookout was walled in on all four sides (an opening where the ladder arrives).
- [x] Found by walking each door with the host's walker (`tools/walk_audit/door_walk.py`, 16 of 108 failed, now 7): a stair 0.8 m wide never registered
      (its treads are 0.26 m2; `core/walk/box` wanted 0.3), the ancestor temple's solid steps registered as blocks (`ieSteps` now registers a floor
      per step), the rice barn's ladder stood 0.5 m beside its hatch, the Kautoa wall tower had no way up (a ladder and an opening in the parapet).
- [ ] `door_walk.py` still lists 7: `ie-house-twin` and `ie-hall` (the stair is on the centre line, the doors either side: not a defect), the two
      watchtowers (the walker climbs the ladder beside the door: expected), `ie-granary-great` (arrives, pushed aside five times) and `iw-granary-row`
      (a block stands in the ladder's way at 1.1 m; not found).
- [ ] `python3 tools/walk_audit/run.py dist/islanders.html` still lists 22 buildings. Seen, and left: awnings over shop fronts and the palace's
      stepped ledges (tilted or decorative tops read as floors), rear and side verandas narrower than the walker (0.7 m), the crawl space under raised
      houses, and the upper galleries of the two halls (`iw-hall`, `ie-hall`) and `ip-tower`, which I have not read. `tools/walk_audit/registry_reach.py`
      asks the same of `core/walk` itself.

