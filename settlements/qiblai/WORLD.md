# Qiblai in the open world: the hand-over (Q7f)

What the open world needs to set Qiblai on its ground, and what is done. The region is
`openworld/xanadu-oidong-highrift`; Qiblai's site is `skm4jjo2vl` in `openworld/SITES.json` (px 922,1595 on map 5.1, by the
cataracts of Nahr ash-Shalālāt).

## Done (2026-11-16)

- **The ring is the temple estates.** `openworld/xanadu-oidong-highrift/src/48-world-site.js` (`QIBLAI_ESTATES`, the
  `qiblai-estate` row of core/hamlet's Xanadu row) plans 24 villages, three along each monastery's spoke (bearing i x 45,
  the city's `QSPOKE` order): the rice farms at 7 km (290 people each), the buffalo dairies at 12 km (162) and the
  apiaries at 17.5 km (104), each named for its Order. 4,448 people in all. `farm-1` keeps the old first village's spot
  (north, 7 km), where the region's world checks stand. The apiary is a pending box (the Xanadu kit has no hives).
- **`SITES.json`** names the page (`settlements/qiblai`).

## The city on the world's ground (waits on `openworld/PLAN-SITES.md` step 3)

No region sets a town on the world's ground yet: the generic town steps are still to be lifted out of `ISLE`. When
they are, Qiblai goes on with the same plan as its page. There should be one source, not a copy.

- **The plan.** `KCITY.squares.plan({id: 'qiblai', h: qcCountry})` (core/city `35-city-squares.js`), with the page's
  country `qcCountry(x, z) = -0.016 x + 0.007 z` replaced by the world's ground under the site (`settlements/qiblai/
  targets/city/89zq-qc-site.js`). Then `KCITY.squares.ground(plan, h)` gives the terraces built up over that ground; they
  are never cut. Every record (blocks, ways, walls, gates, monasteries, markets) follows from the plan and its id.
- **The frame.** The city's centre stands on the site's pin, unturned (north is -z, as Erewhon's `ER_WORLD`). Its pin bakes to
  world (-538000, 52000).
- **Its size, as built on the page.**
  - The outer square's wall half is 804 m, so the town is 1.61 km square. Leave a clear margin of about 50 m beyond it
    for the terrace stairs and the perimeter road.
  - The inner walls' halves are 156, 264, 372, 480 and 588 m.
  - The terraces stand 36.8, 30.8, 26.8, 24.8, 22.8 and 20.8 m over the page's datum, from the temple outward: 6/4/2/2/2/2 m
    a step, the owner's answer.
  - On the page the country falls 16 m from west to east across 2 km. The river is 70 m wide, 1,869 m east of the centre,
    with the ghat way between.
- **The gates.** Four avenues run north, east, south and west through a gate in every wall. The outer gates are at
  (0, -801), (802, 0), (0, 802) and (-801, 0), 24 m wide. A terrace stair (`qb_terrace_stair`) runs from each outer gate's
  sill (20.8 m) down to the ground outside.
  - The region's roads join at these stairs' feet (`road.r`; 1,500 m today, which stops short of the town). The south road
    goes on to the Geomancers' oilfield and Yuni's mission about 1.7 km south-east (`targets/city/89zr-qc-oil-site.js`).
  - The links run to Erehwon (415 km) and to Longsong (568 km).
- **Its people.** 11,777 by ring:

  | Ring | People |
  |---|---|
  | The temple | 400 |
  | The clergy ring | 3,580 |
  | The kora | 1,450 |
  | The lay rings | 6,347 |

  The page's walkers are drawn on Verge's rigs (`targets/city/91l-qc-life.js`), not on core/simulation.
- **The pieces.** The kit's buildings travel as the Xanadu kit's bundle with `qiblai=True` (`kits/xanadu/kit_bundle.py`;
  `XAK.dims` lists the `qb_*` defs) and the `qiblai` texture pack. The page's own sealed bundles are KCITY, QC_FLORA and
  YKIT (`gen/`).

## Open, for the owner

- **The estates feed a sixth of the city at most.** By `kits/qiblai/PLAN.md` section 8's estimate, about 30,000 people in
  more than 100 villages must work the land, or Qiblai buys grain from the Ālph's valley. The 24 estates hold 4,448.
  Should the ring grow, with more villages that owe the Orders, out to the site's 30 km? Or does Qiblai import grain? The
  answer sets the next re-plan.
- **The roads stop 1.5 km out.** Once the town stands on the ground, `road.r` should drop to the gate stairs' feet
  (about 850 m).
