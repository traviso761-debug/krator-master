# Kirstabal: known issues

Steps K0-K4 of `PLAN.md` (2026-11-16). What is owed, by whom.

## The Xanadu kit (the owner: "it will use just the normal xanadu kit")

The caravanserai, the latex house, the tea factory, the fermentaries and the fishing villages' racks are the kit's own pieces
(2026-11-16: `kits/xanadu/src/87k-xa-lake-trades.js`, opt-in: read in place through `kit.json`, so no other page changed;
`TODO.md` "Ride along" folds it into the kit's FILES). Still owed: wind-catchers (the plan's heat), a barge-port slip, a mole piece (the mole is a rubble bank under quay pieces),
a long bridge (Keb Riwa's 135 m crossing is a run of the kit's 20 m street bridges), a work barge and lake craft (the
moored boat is the Sultan's pleasure barge; the capital's lake owes the same craft), and the White Monastery's white dress of
`xa_monastery` (drawn in the kit's own colours).

## core/hamlet

- **The fishing villages** (the owner, 2026-11-16: "work on fishing villages") are laid on the Xanadu row extended in this
  build (`KS_RING.fishingRow`: boat sheds, fish racks, the fishers' jobs and reach, a quay as the landing), passed to
  `KHAMLET.village` as a row object, because the row's own file reaches ten builds. Moving it into the row rides along with
  the next all-builds rebuild (`TODO.md`).
- **The ceiling of 500** (`KHAMLET.POP_MAX`): Phisharī (1,400), Kāko-Bāgh (1,200), Ōpal-Māuṭh (1,200), Rāis-Ṭeras (1,000)
  and Sekriḍ (800) are laid as their first 240-500 by the census; the rest are their hamlets (the tune holds all of them).

## The page

- **The flora** is the Vale of Xanadu's biome Xanadu's page vendors, a stand-in for the Rift floor's Af country (31-33 C):
  `biomes/xanadu`'s `floor` station is the kit to bind when the page takes today's core/biome (as Qiblai's gardens do).
- **The far field** (the scarp, the lip, the lake beyond 12 km) is the scale model at 2 km a pixel (`src/39k-ks-model.js`),
  smoothed: the scarp is a slope, not a cliff, and the cataract is white water down it, not a free fall. Seen from the town
  through the heat haze (24 km off) it reads as a thin white streak on a pale ridge. The open world (K6, core/world)
  replaces it.
- **Strongbow** is not drawn: its arcology is the Ancients kit's (`kits/ancients/targets/strongbow`), on its own page. The
  Strongbow road runs out over the bridge toward its foot.
- **The town's ground is designed, not cut from the model**: the beach, the apron rising about 9 m a km and the harbour's
  basin near the town, blended into the model north of the town and toward the scarp. The open world's cut (K6) will
  have to agree with it at the town.

## Not done (later steps)

Interiors (K5), the open world (K6), life and the sim's people on the page, the Laitwal road in the tune (the town is not
in this branch's tune), the Council's fifth and the eight monasteries' eighths (Qiblai's side of the tune).
