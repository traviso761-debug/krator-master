# Krator biome kit — the north-west bay (Oct 2026)

## What this is
The biome of Ys (`settlements/ys/DESIGN.md` §8), as its own kit on the biome-core contract
(BIOME-API.md): the NORTH-WEST BAY of the Ring Sea as one ideal-type artifact, "Krator biome —
the north-west bay". A fork of `biomes/swbay` (the bay, the volcano far-country, the stepped
river, the reeds, the fauna) re-keyed for what Ys's brief asks: KARST (Krabi, Railay),
an IGNEOUS shore, TRAVERTINE (Semuc Champey, Pamukkale) and a SEMI-AQUATIC flora zone,
under the eastern abyss's height ceiling, with three land species new to the region.

What I read first: `biomes/README.md`; swbay's BIOME-API / INDEX / NOTES / KNOWN_ISSUES and
every one of its fragments; eastabyss's BIOME-API (the fields contract, the reed beds, the
sky scale-tree's 100–124 m as the ceiling's reference); DESIGN.md §2 and §8; the travertine
and terrain reference sheets in `settlements/ys/refs/` (Krabi stacks with forest on top and
a black notch at the waterline, Semuc's chain of turquoise pools with cream lips, Pamukkale's
white shelves, Havasu's cascades, the Raja Ampat aerial of karst islands in a lagoon);
`kits/ancients/src/75-biome-45-bind.js` and `settlements/iziz/build.py` for how a world
vendors a biome (the core byte-identical, the biome fragments copied, a 45-bind written by
the world).

## The map (host, 45-host-stage.js)
5 km across, the map's centre 400 m NW of the bay's NW shore; x east, z south, north is −z.
The bay is a concave inlet in the SE quadrant, open toward the SE edge (swbay's ellipse
mirrored: u runs inland along the NW diagonal, v along the coast toward the NE), the ground
round it a metre or two above a water plane at y=0. From the shore: 0–600 m the bay jungle,
500–1300 m the rainforest as the rise begins, 1200 m+ the dry upper slopes toward the Inner
Wall (24 m over the jungle, 120 m over the rainforest, 250 m at the far slopes, tilted up to
the NW). One river comes down from the NW into the bay's NW shore through a small delta.
Beyond the map a coarse FAR COUNTRY mesh (18 km, 70 m cells) carries the volcano 8 km SE
across the water (swbay's cone, moved), the INNER WALL as a high ridge (up to 1.7 km) on the
N and W horizon that drops away toward the sea, and the water the bay opens into.

Everything the biome knows about the map arrives through five climate fields (wet / salt /
upland / flow / karst) plus terrainH.

TWELVE KARST STACKS stand in the bay and on its shore (40–132 m): each a noisy ellipse
footprint, a face mesh of rings (dense at the waterline notch and the rim) that undercuts
13 % at the waterline, bellies, carries two ledges and rounds into a domed top; limestone
vertex colours with dark runnels, a wet black band at the notch, moss toward the rim, a
forest-floor cap. `terrainH()` returns the dome inside a footprint (so the biome roots a
forest on top), `groundH()` is the ground without them (the ground mesh), and `karst(x,z)`
is the field the biome zones from. The host's mask is zero on the rim band and the faces.
The faces go to `NWBAY.dress(geos,{karst:true})`.

THE RIVER'S DESCENT IS TERRACED: the bed climbs in 5 m steps on the slope (swbay's trick),
the channel is wider (13–34 m), and the water ribbon's height is SNAPPED to each tread's
pool level (tread + 1.5 m; a sheet on every riser), sampled every 5 m, so it reads as a
staircase of flat turquoise pools with cascades between them. A RIMSTONE LIP (a cream
crescent tube, bowed downstream, with a second lower lip as the crust apron) holds every
pool; foam cards ride the risers; the ground under the terrace reach is a finer strip mesh
(3 × 4 m) with the coarse mesh feathered a metre under it; the ground texture paints crust
on the banks, pale pool beds and cream risers. Three SHELF-POOL mounds on the shore each
carry a stair of rimstone pools (lip ring, crust skirt, water disc).

THE IGNEOUS SHORE: two lava tongues (ellipses in bay coordinates with ragged edges) raise
the ground a few metres, dry the `wet` field, paint the ground black with rust mottling and
the beach below them black sand; one headland is COLUMNAR BASALT, an InstancedMesh of
hexagonal prisms on a hex grid, their tops stepping with a noise field, on a plinth.

Sun WNW, gas giant NE as canon; the sky fragment is swbay's.

## The vibe
Krabi's green-topped towers in a turquoise bay, Semuc's pools up the valley, a black lava
cove with wind-bent pines, mangroves and reeds in the lagoons, and the bay jungle behind it
all -- the same megaflora as the southwest bay (prism gums, ironbarks, baobabs, fan-crowns,
tree ferns) but no fungoid canopy: the cap-trees, parasols, bracket trees and coral fungus
went with the fork, and the parasol savannah became the dry upper slopes (baobab stands,
dragon trees, umbrella thorns). Epiphytes are everywhere and trend to red and purple
(canon); lianas hang from the boughs where it is wet.

## The flora (50/55/60)
Sixteen species (the table is in BIOME-API.md). New to the region:
- Cliff fig (30–55 m): a strangler rooted on the karst. A lattice bole (bark kind 5: a
  braid of fused roots) on plate buttresses; the boughs toward the rim are longer, lower
  and droop over the edge (the pass reads the rim's distance and direction from the karst
  field: `NWBAY.karstEdge`); AERIAL ROOTS drop from those boughs to the rim and run straight
  down the face as tubes to the waterline (or the foot of the cliff), with strands and moss.
  Nearly every fig is placed at the rim (accept 1 within 26 m of the edge, .18 inland).
- Flame-crown (15–28 m): a short wrinkled bole, three to five limbs rising and flattening
  into one wide flat umbrella of fern-fine leaves (a bipinnate texture), with a SCARLET FLUSH
  on one side of the crown in patches (a per-tree bloom angle and fraction; bloom cards on
  the flushed clumps). The lowland terraces, the valley floor, the jungle's edge, the banks.
- Cinder pine (10–25 m): a leaning, kinked bole in black cracked-plate bark (kind 7),
  every branch leeward (down the salt gradient, i.e. inland), the dark needle clumps sheared
  to a plane sloping up leeward, dead stubs to windward. The lava fields and the headlands.
Borrowed: the lantern mangrove (SW lowlands, rebuilt on this kit's helpers and recoloured:
a dark trunk on a cage of prop roots in the shallows, drop roots, a glossy blue-green dome
with the bay's hue in it), the pipe reed and the mat-reed beds (eastern abyss, verbatim
technique; the beds are exported in `NWBAY.REEDBEDS`), the lotus trumpet (Xanadu, rebuilt:
fluted bole, arcing arms, ribbed cups fringed with iridescent lotus cards). New small ones:
the stilt pandan (a cone of stilt roots, a forking stem, heads of serrated straps).
The floor by zone adds sea-grape and salt scrub on the shore and the tidal rim,
pneumatophores in the mud, lily pads and lotus flowers on still fresh water, limestone
boulders on the stack tops, black lava boulders and cinder scrub on the lava.

## The dress pass (65)
swbay's, plus the cliff treatment with `opt.karst`: on a face the wall samples become root
curtains and lianas, ferns rooted in the cracks, epiphyte rosettes and moss streaks (no
brackets); the ledges carry CURTAIN FIGS (a glossy crown on a stub with strands dropped over
the edge) as well as tree ferns; the notch's overhang grows beards.

## The fauna (75)
swbay's bay-side kinds to start: BAY SOARERS wheeling over the water (the loops clear the
canopy, the stack tops and anything the host registered), CANOPY DARTERS round the crowns
(prism gums, fan-crowns, ironbarks, figs), pods of BAY SWIMMERS in the deep water, BLOOM
GLINTS under the epiphyte-laden crowns. The herd, the stalker, the gliders and the cap
moths went with the savannah and the fungoid canopy.

## Verification
`verify.py` is swbay's harness plus the biome's own invariants from `91-host-probe.js`:
`height-ceiling` (no tree over NWBAY.TEMPLE_H), `nothing-on-a-cliff-face` (no tree where
karst is .03–.9), `figs-on-the-karst` (every fig on karst > .9), `nothing-rooted-under-water`
(no non-mangrove with its foot below −1.9 m). three.min.js is found beside another build
(`find_three`). Shots and numbers: see the end of this file.

## Lessons this build cost
- A karst stack is three things that must agree: a field (where the rock is), a height
  (terrainH on the top) and a mesh (the face). Deriving all three from one footprint
  function (`stackRad`) and one dome function (`domeH`) is what keeps the figs' feet on the
  drawn surface; the rim ring at rho .92 and the mask's rim band (d > −4) are the slack.
- Snapping a ribbon's height to the tread level (instead of bed + constant) is what turns a
  stepped channel into a staircase of pools; everything else (lips, foam, crust) decorates
  that one decision.
- A root curtain that is a tube beats one that is a ribbon: a 60 m ribbon is a line, a 60 m
  tube with a 1.4 m wobble is a root.
- A patchy flush needs a per-tree angle, not a per-clump coin: the coin gives confetti,
  the angle gives Delonix.
- The lee of a wind-sheared tree can be read off any monotone field (the salt gradient
  here) without the biome knowing where the sea is.

## Shots looked at, numbers
(filled in below after each verification run)
