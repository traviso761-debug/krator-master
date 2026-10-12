# kits/islanders: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Textures

- [ ] **The painted motifs are canvas stand-ins** (2026-10-12): the West's gable spirals (`patGableW`), the East's woven
      diamonds (`patGableE`), the kowhaiwhai band (`patBand`), the storyboard (`patStory`), the East's woven wall (`patWeave`)
      and the white island moon (`medMoon`) are drawn on canvases in `28-is-paint.js`, not taken from the library. The prompts are
      in `core/materials/PLAN.md` ("Pattern-sheet prompts by culture", Islanders). When a sheet comes: process it into
      `core/materials/patterns/islander/<id>`, add its family (the key above) to `materials.json`, repack; the canvas is then
      never drawn (`KIT_HAS`).
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

## Views and the cut-away

- [ ] The moon discs on the fronts of the West's hall and the chief's house do not open with the cut-away (they are drawn
      outside it), so in a cut-away view they float in front of the open floor.
- [ ] The automatic "Palace of Kautoa - eye level" view stands about 74 m out and the rich-houses row in front blocks it
      (the views come from the vendored `90-scene.js`); use `--cam` for the palace's courts. The trade rows hold 13 buildings
      each, so their row views are distant.
- [ ] The ikat cloths on the Kautoa weaver's rail use the stand-in patterns (`patGableE`, `patWeave`, `tapa`): no hinggi sheet yet.
- [x] The cut-away kept the near half of every raised floor only after the agents' fix (2026-10-12): `isCutFloor` now runs
      before the piles and the deck in both `iwHouse` and `ieHouse`.
