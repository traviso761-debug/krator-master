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
      class `flora` with biome and harvest tags, placed by the farms and the courts. No Ring Sea islands biome kit exists yet;
      one would replace them by key.

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
