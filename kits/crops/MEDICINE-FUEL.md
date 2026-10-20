# Medicinal and fuel plants by biome (survey, 2026-10-18)

Read from the biome kits' `harvest` tags (`HV(wood, edible[], medicinal, note)` in each `src/50-biome-*-species.js`): a plant is
**medicinal** when its third argument is `true`, and a **fuel plant** when its wood or note names fuel, firewood, charcoal or
resin. Trees, shrubs and floor plants all count. The count is from a regex over the tags, so a plant whose tag is written in
another shape may be missed (nhighlands' list is long and was read by count only).

| Biome | Medicinal | Fuel |
|---|---|---|
| crater-drylands | 6 (prism mallee, ghost gum, tree aloe, fire lily ...) | 4 (prism mallee, frill-tree, broom, chaparral) |
| eastabyss | 3 (bellbark, umbrella, beardoak) | 2 (umbrella, beardoak) |
| ebadlands | 15 | 5 (pinyon, juniper, cottonwood, oak, sage) |
| ehighlands | 8 | 3 (cushion resin, ragbark, tola) |
| geyser | 2 (kanuka tea, clubmoss spores) | 1 (kanuka) |
| **hyperjungle** | 5 (ghostwood, prism gum, baobab, mahogany, ginger) | **0** |
| nhighlands | 23 | 13 |
| nwbay | 11 | 2 (thorn, mangrove charcoal) |
| nwlowlands | 7 | 3 (ghost gum, she-oak, wattle) |
| rift | 8 | 8 |
| ringisles | 15 | 5 |
| sedesert | 9 | 4 (mesquite, yucca, creosote, saltbush) |
| shighlands | 7 | 1 (ruffle leaves: a poor fuel) |
| swbay | 7 | 3 |
| swlowlands | 16 | 11 |
| throne | 15 | 5 |
| xanadu | 13 | 5 |
| oidong (2026-10-19) | 22 (the giant lotus, sacred fig, cherry, marble birch, cloud pine, chalice tree, bell-pod willow, moss-ball tree, temple cedar, camphor laurel; peyote, sky poppy, snow lotus, valley ginseng, monk's sage, moon caps, rainbow brackets, the iridescent lily, moss, tea, lotus) | 4 (cloud pine, temple-cedar incense, monk's sage incense, bamboo offcuts) |

**Every biome has at least one medicinal plant.** Only one biome has no fuel plant, and one more is weak.

## Gaps and candidates

- **hyperjungle: no fuel.** The wood is wet, giant and timber-grade, so the realistic fuels are the dry parts and the resins. Candidates,
  best first:
  1. **Kapok floss** (`kapok`, already drawn: the burst silk pods): tinder and wick. Tag it `fuel (the floss: tinder, wicks)`.
  2. **Mahogany capsules** (`mahogany`, already drawn: the woody five-valved capsules): hard, dry, burn long. Tag `fuel (spent capsules)`.
  3. **Prism-gum resin** (`prismgum`: its gum seals hulls and dresses cuts): torch resin, like damar or copal. Add `resin` to its tag.
  New plant if wanted: **pitch vine**, a woody understorey liana that bleeds a resin and dries on the trellis; card by reuse of
  `card.vine` (no new texture).
- **shighlands: fuel is the ruffle's dry leaves only.** Better: the **coilbark** (`coilbark`: "splits along its twist, turned work
  only"): its offcuts and splits are the natural firewood. Tag `fuel (the split offcuts)`.
- **geyser: one of each is thin but real** (kanuka is both). A second fuel, the **thermal fern's** dead fronds or the dried
  **reed**, would help; low priority.
- **nwbay and nwlowlands fuel** are present but few (mangrove charcoal; she-oak, wattle, ghost gum); no change needed.

## Done (2026-10-18, owner's go-ahead)

- **hyperjungle:** kapok floss (tinder, wicks), spent mahogany capsules and prism-gum torch resin are now tagged fuel in
  `50-biome-hyperjungle-species.js`; a new **pitch vine** (`HYPERJUNGLE.PLANTS.pitchvine`, medicinal and fuel) is named by the
  inspector on the lianas the kit already draws from the hero boles (`60-biome-hyperjungle-floor.js`: it adds an inspector name,
  no new geometry and no random draws).
- **shighlands:** coilbark offcuts are firewood.
- **geyser:** the warm reed is dried fuel as well as thatch.
- Crops kit: `pitch-vine`, `kapok-floss`, `mahogany-capsule`, `prism-resin`, `coilbark-split` and `dried-reed` are fuel records.
- **Not rebuilt:** the settlements that vendor these kits (Iziz, Girder, Pinnacle Rock for the hyperjungle; Dalab, Xanadu and Ys keep
  their own copies and do not have the fruit pass either). They pick the tags up when the open world places them (owner, 2026-10-18).
  The three biome kits themselves are rebuilt.

## For the Crops kit

`PLAN.md` holds `fuel` as a bucket (lamp cap and glow mushroom so far) and reserves `medicine`. Adding the survey would mean:
a `medicine` bucket (group `utility`) with the existing medicinal plants as records, and `fuel` records for these. That is a wider
change than the tags; it is not done here. The tag edits above are one-line changes in each biome's species file and need a
rebuild of that biome and every build that vendors it (the hyperjungle: Iziz, Girder and Pinnacle Rock take it).
