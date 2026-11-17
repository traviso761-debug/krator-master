# Gihon: the garrison town at the Opal River's mouth (brief, 2026-11-17)

Not started: the owner, 2026-11-17, "not yet, next week when i have more usage". This file holds the brief and the owner's
answers so the session that builds it starts here. Nothing in the tune, the region or the pages has changed yet.

## The owner's words (2026-11-17)

> i want to designate opal-mouth as a proper town, Gihon, 8.5k, home of the Golden Tears and the main garrison-town on the
> lower lake. it will use the irregular-square city builder Kirstabal did but will be much larger and have a second, walled
> 'forbidden city' inside it: the garrison fortress, which doubles as the headquarters of the Sultan's Mint and tax
> assessors. Both gold and opals, along with the rich produce of the land, flow through it, and its temple is spectacularly
> decorated with both. the White and Violet orders have monasteries here.
>
> the Landing, at the mouth of the Alph, will also be a little bigger, a village of 2.5k, built along monumental stone piers
> on either side of the river mouth.
>
> there probably ought to be at least a few hamlets or something along the river going towards theodiga

Answers to the two clashes with what was already decided:
- **The Golden Tears:** "Move HQ, keep a court". The head house moves from Strongwall to Gihon's fortress; Strongwall keeps the
  Tears' court as their forward post for the Lizard-country expeditions.
- **The Mint:** "Assay at Strongwall, mint at Gihon". Strongwall assays and smelts the ore to bullion; the bullion and the
  opals go down to Gihon, where the Mint strikes the qud and the assessors value the tax.

## What it replaces and touches (found 2026-11-17)

| Thing | Today | Becomes |
|---|---|---|
| Ōpal-Māuṭh | `ll.opal-mouth`, 955,1607, 1,200, a fishing village of the Lower Lake (`XAN_TUNE.lowerLake`, `T.lowerRounds` round.lower-south; `settlements/kirstabal/src/42-ks-ring.js` `KS_RING.lake`; `openworld/xanadu-oidong-highrift/src/48-world-site.js` `opal-mouth`, pop 500) | **Gihon**, 8,500, a town (`town(...)` in `core/region/data/xan-tune.js`, like Theodiga's and Strongbow's), the Scarp's (P5) garrison town; Kirstabal stays the lake's hub |
| The Golden Tears | `T.tears.houses[0]` `tears.strongwall` (inside Strongwall, `sxan7r1sln`, 912,1640), the camp's ore sold to Strongwall's assay (`tears.rift` cut) | head house at Gihon; `tears.strongwall` becomes the court (forward post); the ore still sold to Strongwall's assay |
| The Mint | `cit.mint` in the capital's citadel ("the Mint and assay (the Master of Mines and Mints)"); `road.sw-er` takes Strongwall's gold to the capital | the Mint and the assessors in Gihon's fortress: Strongwall's gold (`sw.assay`) to Gihon, coin from Gihon to the capital and the Treasury. Whether the citadel keeps an assay or a treasury office is open |
| Opal | Lāiṭwāl's and the mines' opal to Kirstabal by `road.lw-ks` (150 km); the Fifth straight to the citadel | through Gihon (the Opal River's road comes down to its mouth): the assessors take the Fifth there |
| The Landing | `ll.landing`, 932,1600, 600, the barges' stop and the portage road's head to Qiblai | 2,500, built along monumental stone piers on both banks of the Alph's mouth; over core/hamlet's 500, so laid out in full (`core/city`, BUILD-OUT question 1) |
| The Alph to Theodiga | nothing between the Landing (932,1600) and Theodiga (908,1535), about 28 km; the portage road (`T.portage`, 22 km) runs beside the cataracts | a few hamlets along the river (core/hamlet, the Xanadu row: `core/hamlet/xanadu/23-hamlet-xanadu-row.js`), on the portage road |
| The orders | the White Monastery's house at Kirstabal (`T.whiteHouse`, Qiblai's white, runs the latex house); the Violet Storm's head house the Tempest (`T.tempest`, 886,1619) | a White and a Violet monastery in Gihon (daughter houses) |

## The build (for the session)

- **Plan first** (this file grows into the plan): the town's districts, the forbidden city (the garrison fortress, the Mint, the
  assessors' hall, the treasury, the Tears' head house), the temple dressed in gold and opal, the two monasteries, the harbour
  on the lake, the river front on the Opal River; the Landing's piers; the hamlets.
- **The town** on core/city's irregular square (`KCITY.grid`, `core/city/37-city-grid.js`), as Kirstabal is
  (`settlements/kirstabal/src/41-ks-town.js`), much larger, with a second walled square inside it. A target on Xanadu's page
  like Kirstabal, or its own settlement: the session decides from Kirstabal's layout.
- **The tune:** Gihon as a town with its works (the Mint, the garrison's musketeers in `T.muskets`, the Tears' house), the
  Landing at 2,500, the hamlets, the roads re-routed (Strongwall to Gihon for bullion, Lāiṭwāl to Gihon for opal);
  `core/region/tests/test-xan-economy.js` moves on purpose, and its counts.
- **The census and lore:** the Scarp's numbers (`core/region/WEST-RIFT-SCOPE.md` does not cover the Scarp; the census artifact
  does), `LORE.md` (the Mint, the Golden Tears, Gihon), `settlements/xanadu/BUILD-OUT.md` section 1d.
- **Kit pieces:** the new opt-in work pieces (`kits/xanadu/extra/88g-xa-works.js`: the customs house, among others) and the fort
  asset (`kits/xanadu/src/80f-xa-fort-data.js`, `80g-xa-fort.js`) for the fortress. The temple's gold-and-opal dress may want a
  texture: name it in `core/materials/PROMPTS-NEEDED.md`.
