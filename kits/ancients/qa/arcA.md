# QA pass — group arcA

Types: ring (71c), arcbeam (89), plymouth (88), launch (87), darco (86b),
forest (71b), hill (89e). Every change built, `jscheck` PARSES OK, `verify.py
--assert` error panel clean and all invariants PASS on every run, and the shots
were read (before: `shots/qa_<t>_before/`, after: `shots/qa_<t>_after/`, the
intermediate rounds `qa_<t>_r1..r5/`). Seeds unchanged.

Triangles are scene triangles per decay (d0 / d1), ceiling 700 000.

**Resumed 2026-10-01 (second agent).** The first agent was stopped mid-pass
and its diff recovered as commit 8fafcd2. Re-verified on `ancients-resume`
before anything else: all seven targets build, `jscheck` PARSES OK, `verify.py
--assert` error panel clean and every invariant PASS (shots `qa_<t>_v1/`, hero,
ruin and the views this pass touched). Nothing the recovered code did was
broken. Placeholders it left in this file are filled from those runs.

| type | before | after |
|---|---|---|
| ring | 540 922 / 502 668 | 575 366 / 532 580 |
| arcbeam | 488 454 / 472 468 | 499 174 / 483 780 |
| plymouth | 449 262 / 378 270 | 454 530 / 460 890 |
| launch | not recorded (417 072 / 473 360 at build) | 415 200 / 416 058 |
| darco | 248 560 / 236 100 | 248 560 / 236 546 |
| forest | 530 538 / 512 152 | 530 538 / 514 598 |
| hill | 533 256 / 486 016 | 533 022 / 485 782 (recovered state) |

## Forest Ring (`ring`)
Fixed:
- **"Nothing connects."** Each of the four bridges now lands at a GATE: the
  barrel shell is open two lathe columns x three rows behind every landing
  (the bridge bearings are column boundaries, so hole, frame and tunnel agree),
  with a tunnel lining back to the inner mass, a glazed lit screen at its end,
  jambs and a lintel. At the wheel end the inner parapet opens, the inner row
  of the town opens into a paved GATE SQUARE with lamp posts, and a watch tower
  across the street closes each bridge axis. The eight radial stairs were
  twelve blocks on a line that ran UNDER both treads (invisible from every
  preset): each band's treads and risers are now cut by a slot on the stair
  bearing and each terrace has a real 20-step flight in it, with cheek walls,
  rails on posts, a landing on the tread above, a paved apron at the foot and a
  path through the wood to it (soil tapers to nothing across the stair width).
  See `qa_ring_r1/view_The_inner_rings.png`.
- **"The under-truss is decorative ... spokes ... roll"** — every wheel member
  now goes through a local `rbeam()` that fixes the roll (depth in the vertical
  plane through the member, width horizontal); the bridge trusses get one
  diagonal a panel and lateral ties between the pair.
- **"The half-torus has no interior, and the ruin's cut face is a plain
  half-disc"** — the cut faces are replaced by a real section: seven pale floor
  slabs with dark soffits, standing ragged metres out of the tear, a dark
  lining and deck soffit 36 m in, a cross wall closing the view and
  partitions. Edges found on the same 224-column grid as the tube. See
  `qa_ring_r1/c2.png`.
- **"The wheel's wood is open woodland"** — 450 -> 240 m2 a plant, 3 in 4 a
  tree (~1 070 plants, about +20k triangles). The town gets a lane every sixth
  plot and the four gate squares.
- **"The arches and doors are visibly faceted"** — frArch 8 -> 14 segments,
  frDoor 5 -> 9. Also: the lowest window row on every terrace dwelling sat
  across the head of its door; rows lifted to .40/.62/.84.
- **"ring/1 is at 96% of budget"** — obsolete (leaf card); now 76%.
- **"Canopy coarse at eye level"** — already solved by the shared leaf card.
Remaining, with reasons:
- "The wheel hides the barrel's belly", "A stepped crown cannot be seen into
  below 36 degrees" — geometry of the brief, not defects.
- "The cutaway floors do not read" — the crown is a shallow stepped mass; no
  deep fabric to section (the wheel's 80 m tube is, and now does).
- "The ruined shell thins toward the foot" — needs a height term in the shared
  `holeFn`; request below. Decay 2 unsupported.

## Arcbeam (`arcbeam`)
Fixed:
- **"The dropped span reads as a fairly intact white box"** — rebuilt as TWO
  pieces broken across its length, kinked and rolled, every end TORN (each
  face bitten back its own ragged depth), floors running on past the shell as
  stubs, a dark lining inside the walls, cross walls, the fabric's dark cells on
  both long faces (via `useGroupXF`), moss, and a debris pile in the break.
  `qa_arcbeam_r1/view_The_dropped_span.png`.
- **"The rockfall scar is the weakest ruin feature"** — the fresh face has its
  own bedding (dipping stratum, quantised bench, fine break-up); the portal
  linings are holed wherever the scar has taken the rock in front of them, so
  the buried 87 m of beam stands open in the bowl; the portal frame inside the
  bite has come down and lies on the talus.
- **"Vegetation is the kit default ... hedges are flat green boxes"** —
  `VEG.tree` is already the leaf card; the five hedge call sites now lay a row
  of leaf cards on the same footprint (`abHedge`).
- **"Roof decks are under-furnished"** — two ranks of rooflights (glazed; dead
  cells in the ruin) the length of each beam, with benches and lamps on the axis.
- **"The industrial yards are the same layout four times"** — four layouts:
  rank/file counts, pitch, heights and which rank carries stacks differ; one
  yard has a long shed for a rank, one a tank row.
- **"`figures()` places people at y=0 on a gorge floor"** — crowds now placed on
  the banks at the floor's own height (same wash maths), out of the river.
- **"Both decays sit at 92%"** — obsolete; now 71%.
Remaining: "Section across" (no deep fabric; nowhere to stand), "Both" (fog at
3.5 km is a scene setting in 90-scene.js), canyon walls soft at close range
(grid resolution vs budget; not attempted).

## Plymouth (`plymouth`)
Fixed:
- **"The ruin is 'intact with patches' above the slump"** — eleven SECONDARY
  FAILURES on levels 1-11 clear of the slump and the street mouths (own PRNG,
  so the rest of the ruin keeps its stream): the riser, its parapet, its homes
  and the maisonettes above drop out over 36-110 m; behind is a floor, the dark
  lining, cut end walls, broken storey-slab stubs with dark soffits, cross
  walls, and the riser in pieces on the terrace below.
  `qa_plymouth_r1/view_Plymouth_ruined.png`.
- **"The assembly hall is thin"** — a civic quarter: two colonnaded STOAS down
  the plaza's north and south sides (shops behind, lit strip, people) and a
  112 m brick CAMPANILE with belfry and spire (a stump in the ruin, its shaft on
  the plaza).
- **"the mast has no guys"** — four stays to anchor blocks on the roof.
Remaining:
- "Silhouette ... wants a spur or a saddle" — NOT done. The plan is an 8-vertex
  convex octagon that plymInside/plymSeg/the street mouths (SX0/SX1 from
  LV[K0].xn/xp) and the fixed camera stations all key off; a lobe tilts a face,
  moves the street mouth and buries stations. That is a replan, not a QA fix.
- "The light court does not read from overhead", "Everything is bright" —
  kit-wide: no shadows, and soffit/deck tones; see the bounce request below.
- Crown near end sparse; terrace clutter repetition — not attempted.

## Launch (`launch`)
Fixed:
- **"Everything facing down is brown"** — `lxBounce(mat,k)`: a fragment hook
  (after `emissivemap_fragment`, where `normal` is final and flipped for back
  faces) that adds, to any surface whose world normal points down, a NEUTRAL
  bounce equal to the luminance of the hemisphere's own ground term x k. Keyed
  to the hemisphere uniform, so it follows `setNight()` with nothing to sync;
  strength is a uniform (programs are cached on the hook's source text). Applied
  to lxBell/R and to launch-local clones of the white/rust skin and plate
  (`lxSkin`, `lxPlate`), so no other type changes. Collar soffits and the plug
  ceiling now read as pale steel, not brown (`qa_launch_b0` vs `qa_launch_r1`).
- **"Six-fold symmetry is exact"** — the six service towers now stand six
  different heights (160-216 m) and two carry a second jib.
- **"Scoop back walls are single surfaces"** — each scoop's back slope is now
  apron concrete (it is the outside) and two cheeks close it down to the ground,
  so the deflector is a mass, not a dark sail from overhead.
- **"Trench slag, apron debris and crater rubble share one hue band"** — a fifth
  of every debris field is now torn plate in the grating steel.
Remaining: payload frame is a smooth lathe; fallen mast/tower are beam chains;
trench volumes thin in the registry (pass); "look down off the top terrace"
geometrically unachievable (as logged).

## Darco (`darco`) — no open items; from the shots
- The break was a smooth dark cap from 'The break'. Now four PALE floor plates
  with black soffits, with NESTED holes (independent holes on stacked plates
  summed to an unbroken lid — tried and rejected), so the view steps down
  through broken floors into the black shaft.
- The fallen horn lay there WHOLE (clean perpendicular cut, intact skin). Its
  root is now torn on the stump's own `cutV` line, and its skin eaten harder
  than the standing fabric, showing the black inner mass.
- Well under ceiling; no budget spent beyond that.

## Forest Tower (`forest`)
- **"The Forest Tower's shear reveals a flat back wall"** — the shear now opens
  on a section: pale floors (dark before) with dark soffits, ragged stubs past
  the torn skin, pale cross walls every ~24 m of arc, dead windows on the back
  wall, slabs hanging off the torn edge. Only built where the skin is gone.
  `qa_forest_r1/view_The_sheared_tower.png`.
- **"within 7 000 triangles of its ceiling"** — obsolete (leaf card): 76%.

## The Hill (`hill`)
- **The dark band at the lip of the cut** — cause: `gridSurface` tests a quad at
  its CENTRE, so hill quads whose centre lay just outside |corr| 1.25 still
  reached half a cell over the cut at full natural height; their undersides,
  lit only by the hemisphere's red ground term, were the band. Now any quad with
  a corner inside |corr| 1.3 is dropped wherever the flank shoulder is there to
  cover it (radius <= 1 740 m; beyond, it opened holes onto the ground plane,
  seen and backed out in r1), the shoulder runs out to |corr| 2.37 instead of
  1.9, and the slope material carries `lxBounce(...,3.2)`. Measured on 'The cut
  wall', column x=900: band was ~75 px at (65,30,18); now ~24 px at
  (110,60,35) before the stronger bounce (r4), see r5/after for the final.
  The recovered state still showed a red-brown band (bounce-lit underside) above a pale shoulder in that shot: see the second pass below.

## Requests for shared code (not done — outside this group's files)
- Move `lxBounce` into shared materials (22/54) and apply it to BOXC/SLABC/
  PLATE: every soffit in the kit (balconies, galleries, decks) is brown for
  the same reason. The Forest Ring's balcony soffits show it (qa_ring_r1
  `view_The_terraces.png`). hill already borrows it from 87-launch.js.
- `holeFn` wants an optional height term (ring's shell thins toward the foot).
- A roll-fixed `beam()` (the ring's `rbeam`) belongs in 38-helpers2.
