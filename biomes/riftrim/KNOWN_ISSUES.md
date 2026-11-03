# biomes/riftrim: known issues

Open items, each with what is owed. The kit was built in one cloud session (2026-11-03, branch `claude/riftrim-cloud`) with no GPU:
`verify.py --assert` ran in software GL (SwiftShader) on every station; the GPU `--assert --all-views` and the owner's look pass are the
coordinator's (`HANDOFF-REBUILD.md`, the riftrim paragraph).

## Owed to core adoption (`PLAN.md`, "Core adoption", "Not taken this turn")

- [ ] **Ledge's cliff: KCARVE cave mouths, `KSTACKS.contour` benches, and the cliff springs' cave (`KKARST`, karst site 6 of
  `biomes/KARST-SITES-5.1.md`).** The benches are cut into the ground's profile below Ledge's site; no mouth is carved. At the ground's
  11.8 m cells a mouth needs a ~40 m patch (KCARVE's pad must exceed the cell diagonal): a finer ground near the cliff, or a station that
  goes into the cave. The springs are not drawn.
- [ ] **The crossing's portal** is a cut face and a level apron with the Tungangs' lamps in a row (the lobelia's glow item), not a carved
  mouth; the waystation is not built (a settlement's).
- [ ] **The Hearths' stations** (`biomes/hearths/PLAN.md` section 11: `hearths`, `hearths-hold`, `hearths-walk`) are hosted here and not built.
- [ ] **KSHADOW's switch** is the handle's `off()`/`on()` (89z, the panel's select in 99): replace it with core's own switch when it merges.

## The look (for the owner's pass; nothing measured on a GPU yet)

- [ ] **The impostors' gain** is ebadlands' 2.4 (`89z IMP_GAIN`): set it against the near crowns on the GPU.
- [ ] **The frills' fins** are `card.fin.glass` (one fan of fins a card) stood out from the column, tinted teal (N) or copper-teal (W),
  back-lit (`backlit` 1 and .6): whether they read as translucent at a low sun is the look pass's question.
- [ ] **The glass cane** is a procedural clear material on a jointed cylinder: no library set (`core/materials/PROMPTS-NEEDED.md`,
  `card.glasscane`).
- [ ] **The prism heath's seasons**: one card (`card.heath`), tinted per rim; the plan's three seasons are not drawn.
- [ ] **The lantern lobelia's night glow** follows the sun's intensity (`RRIM.night`, 99): check it at dusk on the GPU.
- [ ] **The rims' ground palettes** (45's painter) and the five ground layers each station shows were chosen without a GPU look.

## Data and size

- [x] **The kin kits' packs** are trimmed to the families each station's rows draw with (measured on the page: every material a kin
  mesh uses, by its vendor slot; `station.json`): the pages are 7.4-9.1 MB, under the gallery's 16 MB. A new row needs its families added.
- [ ] **Three catalog fruit pieces are named and not in the catalog yet**: `generic_fruit_bellfir_seed` (the staple), `generic_fruit_starberry`
  (the fruit), `generic_fruit_rimroot` (the medicine): `kits/catalog/krator-master-furniture-generic-fruit.js` (`biomes/FRUIT.md`).
  The crop row reuses `generic_fruit_mast`.
- [ ] **`kits/crops` has no `riftrim` entry** (plan section 7): the starberry, bell seed and rimroot as crop records, and Dalab's crops on the
  basin plain from `CROPS.forBiome`.
- [ ] **The far fields** are each station's own function (`LAND.far`), not a re-cut of the model (`biomes/STATIONS-MAP-5.1.md`, "Regions
  needing a re-cut").
- [ ] **No Godot twin**; `PORT.md` is the audit's provisional tags.

## Borrowed species

- [ ] **The beard tree is not grown** (station 2): the Rift's `B[27]` scatters its blooms and anemones up to .8 m round a limb point; with four
  trees the attach audit failed at 1.86% (12 of 644 cards). Commented, owed as the monkey-puzzle is. Station 2's only borrowed species is now
  the S highlands' crozier: the N rim's Rift cloud forest (PLAN.md section 3) waits on the Rift's turn.
- [ ] **The monkey-puzzle is not grown** (station 2): the Rift's builder (`src/55`, `B[9]`) scatters its blooms up to .6 of a pad's width off
  the pad, and the attach audit failed at 51% on station 2 with it (1,982 of 2,039 blooms floating). Its row is commented; grow it again
  once the Rift holds them (`BIO.holdTo`).

- [ ] **The tier cedar is not grown** (stations 1 and 4): the SW lowlands' builder (`src/55`, `B[16]`) jitters its 4 m pads up to 1.2 m
  off the limbs, and the attach audit failed at 1.96% on station 1 with it (273 of 6,186 needle cards floating; the limit is 1%). Its row is
  commented in the two lands; grow it again once swlowlands holds them (`BIO.holdTo`), as ebadlands waits on sedesert's mesquite.

- [ ] The S highlands' kin (coilbark, spiral aloe, crozier) are read from a kit whose own rebuild turn (pair 12) has not run: take its
  species as they change (keys kept). Its registry is `shigh` (station.json's fourth entry).
- [ ] The kin are unique trees within 500 m of the LOD spine (87): the vendors' builders draw lite crowns past their hero range and those
  float (the attach audit, 2026-11-03). Past it no kin grows; a far tier for them (their own impostors) is owed.
