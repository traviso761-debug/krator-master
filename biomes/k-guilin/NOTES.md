# k-guilin — the Hykkousoi hinterlands

Krator's inland tower karst behind the NW bay (`biomes/nwbay`, the bay of Ys): the same limestone province as the bay's
drowned stacks (Krabi, Ha Long), seen where it is not drowned. **Forked from `biomes/guilin`** on 2026-10-26, when the
owner froze guilin as Earth's South China karst reference. The plan, the survey of the scale model's `k-guilin` polygon and
the owner's decisions are in `PLAN.md`; this file says what the page is.

The page: `dist/k-guilin.html`. Build: `python3 build.py`. Verify: `python3 verify.py dist/k-guilin.html --assert`.

## Where (PLAN.md section 1)

The biome polygon `k-guilin` (14,860 km²) round a great freshwater lake (3,641 km² at -1,500 m), between the NW bay
(south) and the Scyvoi's crater drylands (north-east). The page stands on the lake's south-west shore at px 444.5,414.5,
5 km west-south-west of Trigon: the model gives -1,340 m, 1.89 atm, +32 °C mean (+37 in the warmest month, +27 in the
coldest), 1,500-1,900 mm (XA, the hypertropic jungle the lake's shore wets; the plain beyond is tropical savanna). The
lake's surface is the page's y = 0.

## The page (`src/45-host-stage.js`)

3.2 km across (R 1600), x east, z south, y up from the lake:

- **The lake** fills the north edge, a bay of it reaching south to the wadi's mouth: open water on core/water
  (`WATER.open`: its bed baked from the ground, flooded from the north rim, a calm swell and a little of the shared wave
  field), the far lake flat under it beyond the page. A beach of sand and pebbles (the ground's sand layer within ~45 m of
  the shore); lotus beds in its shallows (under 1.6 m of water); pipe reeds in patches; stilt pandans, lotus trumpets,
  banyans and bamboo on the shore.
- **The wadi**: a seasonal river (the model's Borun Gulusu's kind: all three of the polygon's rivers are
  `perennial: false`) from the page's south edge to the lake's bay. Its bed is 80 m of sand and pebble bars cut under the
  plain; the wet season's channel in it is 18 m of water (`WATER.flow`), falling with the plain to the lake.
- **The fenglin**: 22 towers on the plain, two at the wadi's edge and three standing in the lake's shallows, **40 to
  135 m, at nwbay's proportions** (R = H/2.7, as nwbay makes its stacks: the owner asked that the two read as one
  landscape). The towers in the lake carry nwbay's waterline notch (a black band, wet below it). Rock colour and texture
  are nwbay's (both from guilin's: grey limestone streaked black and ochre, moss up the dome, the soil's green-brown where
  a dome's bed leans in).
- **The fengcong**: one base (30 m) in the south-east, eight peaks of 60-125 m on it.
- **The stone forest**: ~900 blades and pinnacles (12-43 m) on the bench at the south-west edge (toward the upland and
  the Scyvoi's drylands), the pond in it.
- **The plain**: paddies on the lake's flats (70 to 520 m back from the shore) and along the wadi (to 450 m from its bars),
  in four states; camphor, osmanthus and pomelo groves; the jungle giants in stands between the towers.
- **The horizon**: low-poly towers 2 to 7 km out on a plain ring that rises from the lake as the page does, none in the
  lake; the lake's open water running on north into the haze.
- **Trigon is not drawn** (no Hykkousoi building kit yet; PLAN.md question 3).

## The flora

guilin's own (`50`, `55`, `57`, `60`), unchanged in kind: phoenix-tail bamboo, banyan, camphor, sweet osmanthus, pomelo,
ring-cupped oak and Masson pine on the towers' domes, Yunnan pine in the stone forest; rice, cliff scrub, the stone
orchid, karst ferns, moss, silvergrass, the sacred lotus, creepers. Banyans and bamboo now also take the lake's shore.

**nwbay's species, read in place** (the owner, 2026-10-26): `build.py` lists nwbay's `50` (species), `55` (trees) and `56`
(variants) between this kit's `48n0` (`BIO.kit('nwbay')`) and `48n9` (`BIO.kitEnd(NWBAY)`), so they run in their own
registry and follow every change made in nwbay. Their maps are nwbay's committed pack, read in place too
(`matlib_pack.fragment(biomes/nwbay, 'nwbay')`). This kit places them by its own zones (`55`: `KGUILIN.BPASSES`), makes
each with `NWBAY.make` and has nwbay grow them as its variants (`NWBAY.plantTrees`):

| Species | Where |
|---|---|
| Cliff fig | at a tower's foot, on the ground: its buttressed root spread (up to ~23 m) clear of the wall, the crown leaning on the face; no root curtains (the owner, 2026-10-26: see "Roots" below) |
| Prism gum, ironbark | the jungle giants, in stands on the plain between the towers, wettest near the lake and the wadi; never on a tower's top |
| Fan-crown | the wet plain and the wadi's banks |
| Flame-crown | the field edges (within 40 m of a paddy) |
| Crown fern | the towers' wet feet, the banks |
| Stilt pandan, lotus trumpet | the beach and the wadi's banks |
| Pipe reed | the lake's shallows, in patches |

Left out as shore or dry-slope species: the lantern mangrove, the cinder pine, the spinewand, the rock bottle, the dragon
tree, the umbrella thorn, the baobabs.

## Roots (the owner's review, 2026-10-26)

"Roots should not be able to spread and hang off the sides of rock stacks." Every tree on a tower's top or dome keeps its
whole root spread on that body's top (`55`: `rootsFit` samples the spread at 16 angles, at half and full reach: each sample
on the same body's top or dome, not its cliff or rim band, within a slope of the foot's height); a tree that does not fit is
moved in toward the top's middle, and one that fits nowhere is not placed. The tops are domes: the widest flat-enough patch
on any tower holds a ~10 m spread, most 1-5 m, so nwbay's cliff figs (an 11-23 m spread of plate buttresses on lobes:
6.3 x their bole) fit on none. The owner chose to put them at the towers' feet (as strangler figs grow on Krabi's karst):
their spread on the ground short of the wall (`groundFit`), moved out from the wall when it touches rock. The kit's own
oaks and pines on the domes (3 x their bole) all fit after recentring. A host check measures every placed tree with the
bole it was drawn with (a negative: a fig moved against its wall fails).

## The sky and the weather

The shared sky (`core/atmos/sky`, `89s-host-sky.js`) at px 444,414 with the model's air (1.89 atm, humid), replacing
guilin's borrowed hyperjungle dome and necanyons' night; the clouds' shade on every lit material; the weather
(`ATMOS.bindWeather`: wet, the base five modes, the ground wetting in the rain), starting clear.

## Numbers (verify.py --assert on the GPU, 2026-10-26)

| | |
|---|---|
| Error panel | clean |
| Build | ~10 s (bake 11.7 s from load) |
| Draw calls | 156-160 over 18 views (budget 220; guilin's were 37-43: nwbay's variants, KNOWN_ISSUES.md) |
| Triangles | 7.4-8.3 M in view (kit trees 3.84 M, floor 1.37 M, nwbay's 1.12 M, cliffs 0.57 M) |
| Instances | 631k |
| Registered volumes | 15.6k |
| Borrowed trees | 2,015 (prism gum 94, ironbark 94, fan-crown 107, cliff fig 85, flame-crown 19, crown fern 491, pandan 596, lotus trumpet 55, pipe reed 474) |
| Trees on the rock | 6,973, every one with its roots on its top |
| Paddies | 1,308 (flooded 280, young 328, green 428, ripe 272) |

Every host check passes and all 17 negatives fail as they must; `python tools/check_core_use.py biomes/k-guilin` reports no
finding; the port lint is clean.
