# Kirstabal: known issues

Steps K0-K4 of `PLAN.md` (2026-11-16). What is owed, by whom.

## The Xanadu kit (the owner: "it will use just the normal xanadu kit")

The caravanserai, the latex house, the tea factory, the fermentaries and the fishing villages' racks are the kit's own pieces
(2026-11-16: `kits/xanadu/src/87k-xa-lake-trades.js`, opt-in: read in place through `kit.json`, so no other page changed;
`TODO.md` "Ride along" folds it into the kit's FILES). The harbour's stand-ins are the kit's own pieces since 2026-11-17 (`kits/xanadu/extra/88f-xa-harbour.js`: the quay, the mole,
the warehouses, the drydock, the slip, the stone arch bridge over Keb Riwa, the White Monastery's white dress; the lake craft
are `extra/88d-xa-lakecraft.js`'s, tagged as vessels). The wind-catchers (the plan's heat) are badgir twins of seven common houses (88f `XH_BADGIR`, about a quarter of the town's
houses). The drydock is drawn
flooded with a barge afloat in it: the lake is one water plane, so a pumped-out basin needs core/water to mask the lake over
it. The pieces' weed line is drawn 2.4 m under their deck, where the town sets the deck over the lake. The vessels' class is
core/tags' new `vessel`; the other pages that inline core/tags rebuild with the next all-builds rebuild (TODO.md).

The empty lots outside the walls are drawn with the Construction kit's site (`kits/construction/src/10-cons-site.js`, read in
place: a cleared, staked plot, some with their materials piled), its plain palette (the kit's library pack is not carried, as
the isle demo does not); the owner's "just the normal xanadu kit" is the town's buildings, and the site gear is no culture's.
Nothing builds on them yet: the sim's builders (core/simulation 77, as the isle demo's 47b) would take them.

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
- **The wall's stone is a stand-in**: `brick.dark` tinted slate grey (families `xSlate`, `xSlateD`) until a coursed-slate set
  is made (`core/materials/PROMPTS-NEEDED.md` section 66). The curtain steps down the slope in runs of at most 14 m, each
  set at the lowest ground under it, so its top steps rather than following the ground. The moat's water follows the apron's
  slope (it falls about 6 m from the inland side to the lake side) with no weirs drawn; its trench is drawn by the town's 6 m
  ground cells, so its slopes are coarse up close.
- **The garden squares** (2026-11-17) are walled (88f `xa_garden_wall`, a gate where a rill axis meets the edge). The
  courts' own rills (the kiosk's, the star court's) run to the parterres beside them and stop, as in Erewhon's garden. The
  blocks round the gardens keep core/city's wandering side streets.
- **Strongbow** is not drawn: its arcology is the Ancients kit's (`kits/ancients/targets/strongbow`), on its own page. The
  Strongbow road runs out over the bridge toward its foot.
- **The town's ground is designed, not cut from the model**: the beach, the apron rising about 9 m a km and the harbour's
  basin near the town, blended into the model north of the town and toward the scarp. The open world's cut (K6) will
  have to agree with it at the town.

## Not done (later steps)

Life and the sim's people on the page, the town drawn in the open world (the region plans its countryside only), the Laitwal road in the tune (the town is not
in this branch's tune), the Council's fifth and the eight monasteries' eighths (Qiblai's side of the tune).
