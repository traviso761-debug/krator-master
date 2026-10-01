# Skyscraper I — the Braid — hand-back notes

`src/89k-sky-i.js` · `buildSkyI(scene,gx,gz,d)` · seed `reseed(9760+d)` (claims
9760-9764) · target `skyi` · ROWS key `skyI` (`{z:0,s:300,r:280,t:1200}`) ·
prefix `SI_`/`si` (`SI_SITE`, `MAT.si*`, `TEX.si*`, kdefs
`siBox siBoxR siDim siLit siBeam`). `siBeam` is pushed onto `FIREKIT`, so the
beam from the tip shows only at night. Nothing outside the four files was
edited; `python3 build.py --target kit && python3 jscheck.py .syntax-kit.js`
parses and the kit loads with a clean error panel (its outputs restored).

## What it is (intact, d=0)
* **The shaft**: 446 m, a chamfered-square plan (four broad faces, four narrow)
  in seven tapering stages with a setback ledge and cornice blocks at each knot,
  two pilaster ribs per broad face, and a slanted knife tip (apex off-axis)
  with a lit crystal and, at night, a 900 m beam.
* **Two strands** (A turns +theta, B -theta), each a hollow masonry band: a
  0.34 m-riser stair street on top (~42 deg, ~1 000 steps a strand), outer
  parapet always, inner parapet where it stands free, three storeys of rooms in
  the band (slot-window wall texture), a painted-dark soffit, pilaster ribs,
  projecting bays with lit slots, lit openings, doors into the shaft off the
  stair, people on the steps. The band's depth is measured square to its own
  path, so where the strand goes vertical it stays a solid fin.
* **The braid**: the strands spring from the foot at 64 m (their undersides
  reach down to the podium for the first 40 m — curved buttress walls), climb
  ~2.1 turns and cross three times (y ~104, 174, 232). Near each crossing the
  strand that is OVER swings out by a street width and passes in front; the
  one under hugs the shaft; over/under alternates. The push is computed from
  the angular separation at which the two bands would overlap in height, so it
  is exactly as wide as it must be. Tie-beams join a free-standing strand back
  to the shaft. Above ~60% height they stop turning, stand ~11 m clear of the
  shaft (sky between) and close in on it at the tip.
* **The foot**: 11 stepped, slope-topped masses (to ~100 m) kept under the
  strands' first pass, each with a set-back tier and a stepped front mass with
  a lit door; stepped masses with lit slots cling to the shaft wherever no
  strand passes.
* **Podium** three 4 m tiers (r 88/82/76), grand stairs north and south onto
  landing blocks, apron, ~7 broken **outlying monoliths** at r 104-136 (two
  with lit doors).
* Skins (16 m tile): pale ashlar with warm ochre in it; an "inhabited wall"
  with sparse deep slot windows (lit ~1 in 3, emissive), doubles, recessed
  panel lines. Ruined variants: darker, lichen, runs, dead slots.

## Decay
* **d=1 ruined**: tip snapped at ~336 m (jagged, a sectioned floor inside);
  strand B broken through for 56 m of rise, the lost section lying on the plain
  in two pieces laid on their soffits (on the camera side), rubble; strand A
  broken, a 16 m gap, then a 34 m section **hanging** from a hinge, swung out
  and down into the gap; the fabric eaten by `holeFn` (dark void behind every
  lost cell), a dark lining and floors inside the shaft, dead windows, moss on
  the stairs, vines under the soffits, rubble, trees.
* **d=2 toppled**: stump to 150 m (jagged), upper 296 m laid east on its
  braids. Own topple (same pattern as `toppledUpper`, not the function): the
  tilt is computed from the body's envelope so the tapered body rests on its
  strands instead of floating its tip ~25 m up, as `toppledUpper`'s fixed
  0.94*90 deg would.
* **d=3 rehabilitated**: full height, ruined materials, HOLES=0.55, repairPass.

## Numbers (verify --assert, all PASS)
| decay | tris | instances | meshes |
|---|---|---|---|
| 0 | 38 980 | 1 112 | 8 |
| 1 | 65 844 | 1 451 | 25 |
| 2 | 69 746 | 1 486 | 16 |
| 3 | 71 468 | 1 940 | 9 |

Worst draw calls over 14 views: 83 (whole target scene, 'The row of four' and
'Along the fallen body'). Well under the 400 k ceiling and below the 150-300 k
target band; there is headroom for more detail.

## Views (14)
Skyscraper I (hero, SW) · The row of four · Ruined · Rehabilitated · Toppled ·
Along the fallen body · The crown · The braid · The foot (1.75 m) · Looking up ·
On the street · The fallen strand · The hanging strand · Night.

## Weaknesses (honest)
* From afar it reads as a twisting spire with a spiral street more than the
  reference's heavy braided masses; the strands are broad (22 m) but pale on
  pale, and their dark soffits carry most of the read.
* Soffits and box undersides come out red-brown, not blue: the scene's
  hemisphere ground colour, not the material.
* The toppled upper body's pushed-out strand sections make a tangle at its
  base end (a strand end hangs clear of the ground there).
* Fallen strand pieces are big blocks (22 x 26 m section) and read as masonry
  blocks more than as a piece of street.
* 'On the street' is close to the shaft and steep; it shows the stair but not
  a long run of it.
* Lit slots are small; at night the tower reads mainly by the beam and the
  instanced lit openings.
* Crossings sit at 104-232 m; the lowest crossing is behind the foot masses
  from some angles.

## Design pass (2026-10-01): the crown
Looked at hero, close (the braid, the foot) and ruin range. The weakest part
was the top third: above ~300 m a bare 11 m needle, two pale fins hugging it,
and a lit box stuck on the apex. `siCrown` (called where the shaft reaches the
tip: intact, rehabilitated and the toppled upper body) adds a corbelled COLLAR
on the chamfered plan wrapping both fins at 386-398 m (sized from `siEnv`),
carried on 16 two-step brackets from the shaft; a cornice; three stepped tiers
the knife rises from, with pinnacles at the broad faces' corners; lit slots in
the collar; and a slim lit crystal finial in place of the box. No rng.
