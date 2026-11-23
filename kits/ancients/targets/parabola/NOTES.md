# Parabola — notes

The Bowl's arcology (owner, 2026-11-11: design A of `openworld/ANCIENT-NETWORK.md` section 8.11, on the branch
`claude/ancient-network-9cc3e7`). A city that was a solar furnace. It stands at scale model 5.1 px 970,1186: 1 716 m,
15 degC mean, 314 mm of rain, on the Bowl's south-west rim near the Godsgate, over the Bowl's salt floor and Mantis's
oasis. It is the Rift line's possible station 13, at the end of the Godsgate highway and of the Izani road from Mantis.
"Parabola" is the working name that came with the design. Facts not in 8.11 are marked *proposed*: the owner decides lore. The owner answered the plan's five questions on 2026-11-11, each keeping its default (below).

## The plan

The model is the plan's records (`8av0-parabola-plan.js`, [G data]); the drawing (`8av1-parabola-draw.js`) decides nothing.

| | |
|---|---|
| The dish | a paraboloid 1 800 m across the rim and 320 m deep (focal length 633 m), its axis **tilted 30 degrees to the north**, where Krator's noon sun stands (the settlements lie near 40 S): it faces out over the Bowl, its back to the rim's hill. The tilt puts the dish's lowest point 731 m from the vertex toward the north lip, only 10 m under that lip, and the back rim 910 m over it |
| The inner face | **41 level terraces**, each a 6-storey (21.9 m) riser of dwellings behind a glazed front, the tread above it a farm (its roof). The terraces follow the dish's level contours, which on a tilted paraboloid are circles about the lowest point: full rings low down, then horseshoes opening north once they meet the rim. A lip of every tread is on the true paraboloid; the stepped face lies inside it. **The basin** at the bottom is a level plaza out to the first riser, closed on the north by the rim's parapet |
| The mirrors | a bank of mirror panels on every terrace lip, each aimed at the focus (owner, 2026-11-11), with the cyan strip under it. Treads steeper than 58 degrees (the top of the back) are mirror-clad, not farmed |
| The outer face | the Ancients' white seamed shell 55 m behind the inner face, on **24 organic ribs** (Soleri, Gaudi) running from a boss under the vertex to the rim, swelling where they land on the piers, with a **bronze band** at each landing |
| The piers | **three Cyclopean piers** at the ribs under the back (south, 540 m tall) and the north-west and north-east (about 200 m): the dish's mass stands inside their triangle (a node test) |
| The focus | the **receiver**, a 76 m sphere of bronze frame and blue glass at the focus, 800 m up, on a **tripod mast** of three 713 m legs from the inner face, each carrying a stair |
| The terminus hall | at the lowest point, inside the shell under the basin: a vault 320 m long, 64 m wide and 30 m high, opening through the north lip onto a viaduct where the Rift line (station 13) and the Godsgate way arrive from the Bowl |
| People | about 120 000 as built: the dwellings are the lit depth behind each front (16 m, one-sided), six storeys, 80% of it homes at 45 m2 gross a person. The deep fabric under the terraces is services and structure |

The ruin, as deltas by id (`PARABOLA.ruin`):

- **the mirrors**: 84% of the lip panels fallen, by a hash of each panel's id: most lie broken on the tread below; those near the
  rim's ends and in the breach went over into **the scree** outside, where they glitter;
- **the receiver** cracked (a gash and a third of its panes gone) and leaning 14 degrees in its seat; **the mast's stairs gone**;
- **the windward quarter of the shell down**: the west (owner, 2026-11-11), its panels and the ribs'
  upper reaches fallen into a debris fan, the upper terraces of that quarter slumped with it, the dark fabric behind them open;
- **the lower decks drifted** with Bowl sand: the low terraces' ends at the north lip, the hall's mouth and its platforms;
- **the inner terraces wild orchard** and meadow in the mild climate;
- **a rain lake** in the basin, 6 m deep over the plaza, held by the north parapet (10 m): the only standing fresh water for a day's
  march (a `core/water` still record, `PB_SITE[1].lake`);
- **an Izani customs post** at the hall's portal and **a caravanserai** in the hall, where the Izani road from Mantis ends (owner, 2026-11-11: keep it).

## Core adoption

| Module | Taken | How, or why not |
|---|---|---|
| `core/rand` (`KRAND`) | yes | every choice in the plan and the ruin is `KRAND.hash` of the plan's seed and a record's own indices (`pb.t.<k>.<s>`, `pb.m.<k>.<s>.<i>`), never a count of draws. The drawing's own rubble keeps the kit's `reseed()` stream, as every builder does |
| `core/tags` (`KTAGS`) | yes | `TAGS_TARGETS` in `build.py`; the dish a building, its terraces, piers, ribs, mast, receiver and hall parts, the mirror banks fixtures, the orchard flora, the post and serai buildings, registered before anything is drawn |
| `core/water` (`WATER.still`) and `core/atmos` (the wave clock, the skylight) | yes | the rain lake is a still record, drawn by `WATER.drawStill` (as Xanadu's kit page does: `settlements/xanadu/targets/xanadu/90-xa-still.js`); read in place through `TARGET_READS` |
| `core/terrain` | no | the kit page's ground is the flat showcase plain (`terrainH` 0), as every target's. The plan takes a `ground(x, z)` function (default flat), so the open world passes the scale model's rim and the piers stand on it |
| `core/space`, `core/mask` | no | nothing is placed by search or by a raster: every record's place is a function of the dish |
| `core/atmos` sky, `core/host` | no | the kit page's sky, camera, probe and inspector are the kit's (`90-scene.js`, `91-probe.js`, `92-camera.js`), shared by every target. The builder moves the kit's sun to the north for this page only, where Krator's noon sun stands, so the inner face is lit as it would be |
| `core/materials` | yes, the kit's | the kit's bound families: `MAT.white` (the shell), the Arccube's concrete, dwelling and shade maps, the Wheel's grass and stone. **Owed**: the bronze bands and the receiver's frame are an untextured bronze standard material; `metal.bronze` is in the library but binding it is a change to the kit's `materials.json`, which reaches every Ancients page (ride along with the next all-Ancients rebuild) |
| `core/biome`, the biome kits | no | the orchard is the kit's own trunk and leaf cards, as the Pile's gardens are; the open world's flora pass grows the Bowl rim's species on `PB_SITE[1].treads` |
| `core/city`, `core/simulation` | no | a single complex; its life layer waits for the open world |

## Files

| File | What |
|---|---|
| `8av0-parabola-plan.js` | the plan, [G data]: the dish's frame, terraces and their segments, mirrors, ribs, shell panels, piers, the mast and receiver, the hall, the stats, the ruin's deltas, the orchard and sand records. KRAND only, ids stable |
| `8av1-parabola-draw.js` | the drawing: core/tags first (`KTAGS.parabola`), then the terraces, basin and rim, the shell and ribs, the piers, the mast and receiver, the hall and viaduct, the ruin's pieces |
| `90p-parabola-lake.js` | the rain lake: `WATER.still` from the ruin's record, drawn with `WATER.drawStill` |
| `test-parabola.js` | `node kits/ancients/targets/parabola/test-parabola.js` |
| `89z-rows.js`, `91z-views.js` | the two sites (intact west, ruin east) and the views |
| `plan/` | the blueprint: sheets, `BLUEPRINT.md`, `AREAS.md`, the generator |

Build: `python3 tools/build.py kits/ancients --target parabola` (or `python3 kits/ancients/build.py --target parabola`). Plan seed 9710 (KRAND); the builder's own stream reseed(9920 + d).

## The owner's answers (2026-11-11: every one keeps the default as built)

1. **Height**: keep the 30 degree tilt; the back rim about 980 m over the ground, the receiver about 800 m up.
2. **Facing**: north, over the Bowl, its back to the hill.
3. **The windward side**: the west quarter is the one down.
4. **The mirrors**: a bank of panels on every terrace lip aimed at the focus, and the steep top of the back mirror-clad; the terraces stay
   homes and farms.
5. **The Izani customs post and caravanserai** in the terminus hall: keep them.

## Weaknesses

- The terraces are level rings and arcs of one riser height; the references' varied sections (cantilevered decks, hanging gardens) are
  not in it.
- The deep fabric between the stepped face and the shell is not drawn; where the shell is down it is a dark broken skin.
- Shell panels are quads between ribs on one offset paraboloid; the seams are the panel edges, not a modelled joint.
- The leaning receiver is turned about its seat, but the legs still end where the upright sphere was: their heads run into it.
- Fallen mirror panels lie whole or halved on the treads; they are not shattered into shards. Sand drifts are squashed domes.
- The farms are the Wheel's grass with crop beds as coloured boxes (a terraced-field set is owed, `core/materials/PROMPTS-NEEDED.md`
  section 35, as for the Pile); the steep treads' mirror fields are the deck concrete under posted panels.
- Lit 2026-11-11 on a GPU lane: the heaviest decay is 638k triangles of the 700k mega budget (the 13 933 mirror panels are a quarter
  of it); 43 draw calls at the hero view.
