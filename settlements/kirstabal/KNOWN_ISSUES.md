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

- **The flora is the Rift floor's** (the owner, 2026-11-16: "implement rift climate"): the Rift kit (`biomes/rift`) on today's
  core/biome, sealed in `gen/69k2-ks-flora-bundle.js` and zoned by the climate as its fields (`targets/town/90m-ks-flora.js`):
  jungle along the lake and Keb Riwa, savannah inland, 4.2 km round the town. It draws with the kit's **procedural textures**:
  its library pack inline (6.2 MB) would pass the page cap, and a second sidecar pack needs settlements/xanadu/build.py to take
  a kit's extra packs (a change that stales Xanadu's and Qiblai's pages). The kit's own garden plants (xaPlant) stay the Vale's.
  The ring villages past 4.2 km stand in grass and fields, without the Rift's trees. The grass is tinted by the same wetness
  (89zk's `ksWet`: tawny inland, deeper green by the water). The far trees are the core's impostors: the capture renders them
  dark (atlas means 3 to 50 of 255), so they take the Rift page's light (`impostorLook` gain 3.6, wrap 1); at 64 px a view the
  thin-crowned species read as trunks with pale flecks past 1 km (not compared with the Rift's own page yet).
- **The far field** (the scarp, the lip, the lake beyond 12 km) is the scale model at 2 km a pixel (`src/39k-ks-model.js`),
  smoothed: the scarp is a slope, not a cliff, and the cataract is white water down it, not a free fall. Seen from the town
  through the heat haze (24 km off) it reads as a thin white streak on a pale ridge. The open world (K6, core/world)
  replaces it.
- **The interiors (K5, `?interiors=1`)**: only the five K5 buildings are hollow and furnished. The governor's house
  (`xa_rich_b`) and the Two Horns' factor house (`xa_rich_c`) keep the kit's own gap (settlements/xanadu KNOWN_ISSUES.md: their
  items' plan doors are not cut by 69e6 `vaPlanDoors`, `planDoors` 0 here too), so the manor's upper house and the konak are
  sealed: 37 of 54 floors reached, every one of the serai's, the tea factory's and the latex house's. The fix is the kit's
  (kits/interiors/sets/xanadu.js or 69e6), not the town's. No view looks inside: a view in a room would stand in a solid
  block with the interiors off.
- **Strongbow** is not drawn: its arcology is the Ancients kit's (`kits/ancients/targets/strongbow`), on its own page. The
  Strongbow road runs out over the bridge toward its foot.
- **The town's ground is designed, not cut from the model**: the beach, the apron rising about 9 m a km and the harbour's
  basin near the town, blended into the model north of the town and toward the scarp. The open world's cut (K6) will
  have to agree with it at the town.

## Not done (later steps)

Interiors (K5), the open world (K6), life and the sim's people on the page, the Laitwal road in the tune (the town is not
in this branch's tune), the Council's fifth and the eight monasteries' eighths (Qiblai's side of the tune).
