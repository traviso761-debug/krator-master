# cut: the plan (draft, 2026-10-23)

**The Cut**: the bowl an Ancient eigenweapon left in the northern Inner Wall when it deleted a perfect sphere of matter
(`LORE.md` §6.2, Dilihan). What the weapon left behind still acts on what grows there: **the flora is warped, mostly
harmlessly**, the more the nearer the bowl's centre. The kit is mostly a **warp layer over other kits' flora**, with a
few natives of its own, chief among them the **hyperbamboo**.

Owner's brief (2026-10-23): something unique for the Cut, a remnant of the eigenweapon: the flora warped in some mostly
harmless way. Settled the same day: the floor takes **nwlowlands flora adapted to the dense air** (not the eastern
abyss's, which is too far away to share it), led by a **hyperbamboo**; the warp's ideas (combed growth, fixed sizes,
clean bites, straight ranks, echoes, the compass) were approved; a detailed plan was asked for.

**Status: plan, awaiting the owner.** The kit does not decide what the eigenweapon was, who fired it or at what
(`LORE.md` §12 keeps that open).

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/cut/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `tests/test-cut.js`) |
| Pages | three stations (section 8): `dist/cut.html` (the floor), `dist/cut-wall.html`, `dist/cut-face.html`; `python3 build.py --station <name>` as the Throne's |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, and the strata module once `core/terrain/STRATA-PLAN.md` lands), the shared sky, `core/atmos` |
| Read in place | `biomes/nwlowlands` (its species, builders and bamboo groves) for the floor and walls; `biomes/nhighlands` for the lip |
| Its own | the warp field and its effects (section 3), four natives (section 4), the lakes' and flats' ground and the cut faces (section 5) |
| Object | `CUT` (`build`, `dress`, `field`, `warp`, `SPECIES`, `PLANTS`, `HARVEST`), on the `BIOME-API.md` contract |
| Data side | the field, the warp's transforms and the natives' records are plain functions and records (`[G data]`): Godot places the same plants the same way |
| Users | **Dilihan** (`settlements/dilihan/PLAN.md`, not built yet), which reads nhighlands and nwlowlands in place until this kit exists, and takes it after; **Lipp** (village, px 419,289, 3,468 m, 18 km outside the rim) sees the faces |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. The bowl on the model (4.21, surveyed 2026-10-23)

The biome polygon `the cut` (19,000 km², px 425-500 by 258-341) inside the geographic `The Cut`; centre about px 460,302.
The model already holds the bowl: the ground falls to the floor from every side but one.

| Ring (from the centre) | km² | Median height | Air | Rain | Mean (warm/cold month) | Climate |
|---|---|---|---|---|---|---|
| 0-16 km | 570 | **-2,185 m** | 2.10 atm | 1,615 mm | **+39 (44/33)** | XA 52%, XS 18%, XV 16%, Af 14% |
| 16-32 km | 1,600 | -1,930 | 2.04 | 940 | +36 (41/30) | XS 38%, XA, XV, Cfa |
| 32-48 km | 2,900 | -1,620 | 1.96 | 910 | +34 (40/28) | XS 34%, Cfa 24%, XA, XV |
| 48-56 km | 2,450 | -195 | 1.64 | 830 | +27 (35/19) | Cfa 24%, XS, BWh 15%, XV |
| 56-64 km | 2,960 | +630 | 1.48 | 720 | +23 (32/15) | Cfa, BWh, XA, Aw |
| 64-72 km | 3,170 | +2,230 | 1.21 | 550 | +16 (26/6) | Csa, BSh, Dsc, BSk |
| 72-90 km (the lip) | 3,060 | +3,430 (to 6,210) | 1.04 | 470 | +9 (21/-4) | Dsb 25%, Dsc, ET |

- **Two lakes, at two levels**: the upper lake, 2,016 km² at about -1,980 m (px 454-487 by 298-325), rain ~2,050 mm
  over it; and a lower lake, 304 km² at about -2,330 m (px 448-459 by 276-305), north-west of it in the deepest pit.
  No river leaves the bowl: one dry valley runs to the lakes from the south-west. **The bowl drains to itself.**
- **The floor is salt steppe away from the water.** Between 16 and 48 km out, a third or more is abyssal salt steppe
  (XS): the lake effect wets the shore, and the rest of the floor dries to salt.
- **The floor is a hothouse**: a mean of +39 °C within 16 km of the centre, +44 °C in the warmest month, under 2.1 atm of
  wet air. The model's lapse rate (6.5 °C per km) carried 2.2 km below the crater floor. Mist stands over the lakes; the
  floor's summer is deadly to people (section 6).
- **The mouths.** The lip stands under +700 m from bearing 120° to 180° (south-east to south): **the crater mouth**,
  open, the floor running out to the crater. Elsewhere the lip stands 3.2-6.4 km, highest to the east-north-east (6.4 km)
  and the south-west (6.1 km). **The north mouth to the lowlands is cut in 4.22** (the owner, 2026-10-23;
  `tools/scale-model/README.md`): on 4.21 the north lip stands 3.2-4.2 km, a ridge about 50 km across above Jimjam's lake.
- **Dilihan** (px 472,333) is 66 km from the centre on bearing ~160°, at -1,142 m (1.85 atm, Af, ~1,500 mm, +31 °C): in
  the crater mouth, where the bowl opens. That matches its plan's "the southern end, where the bowl opens toward the
  crater"; the walls rise on either side of it.
- **The shape.** At the model's scale the bowl is a shallow spherical cap, about 150 km across and 6-8 km from the lip
  to the floor: the bottom of a sphere far larger than the bowl, not a hemisphere (section 9).

## 2. Air and scale

The floor's 2.0-2.1 atm is the densest air outside the Rift, and dense air is why Krator's lowland plants run large: the
nwlowlands species, carried in from Jimjam's country, grow **about half again** their nwlowlands height on the floor and
walls below 0 m (`habit` scale by pressure, as the hyperjungle's hypertrees), normal on the lip. The hothouse heat and
the salt steppe keep the floor's forest to the water's edge and the river lines.

## 3. The warp

### The field

`CUT.field(x, z)` returns `{s, ar, at}`: a strength `s` and two unit vectors in plan, `ar` (toward the centre) and `at`
(round it, clockwise from above). The strength is 1 at the centre and falls to 0 at the lip:
`s = smoothstep(R, 0.35 R, r)`, with `r` the distance from the centre and `R` the lip's radius on that bearing (from the
model's heights: the ring where the ground stops rising; about 64-80 km). It is plain arithmetic: no texture, no draw
order, identical in the page, a node test and Godot.

The field's **axis** alternates with the radius: every ring of about 6 km the dominant axis switches between `ar` and
`at`, with a soft change over 1 km. Seen from the rim, the forests read as **spokes inside rings** round the lake, the
pattern iron filings take round a magnet.

### The effects (each a function of `s`, applied when a plant is placed)

| Effect | Rule | How it is made |
|---|---|---|
| **Combed growth** (the lead) | a plant leans along the axis by up to 25° x `s`, and stretches along it by up to 1 + 0.6 `s` | a transform on the instanced record at placement: no per-frame cost |
| **Fixed sizes** | where `s` > 0.3, a plant's scale snaps to one of three steps (0.7, 1.0, 1.4); its internodes, leaf sizes and fruit snap to fixed lengths | the builders' size draws quantised (`KRAND` by cell, then rounded); a plant's habit records keep the step |
| **Clean bites** | with probability 0.15 `s` a crown, trunk or boulder is missing a perfect spherical bite (radius 0.2-0.6 of the plant), the surface smooth, the rings or the bamboo's chambers showing; leaves with round holes | three pre-bitten variants per prototype (the bite at baked offsets), chosen by hash; boulders by a spherical carve patch (`core/terrain/36-core-carve.js`); a leaf card variant with holes |
| **Straight ranks** | where `s` > 0.5, leaves and seeds that would spiral grow in straight ranks (90° or 180°), seed heads in spokes | a `ranked` habit flag on the read-in builders' phyllotaxis |
| **Echoes** | rare (2% of plants where `s` > 0.6): a faint copy offset 2-6 m along the axis, seen only at dusk | a second instanced mesh, near band only, its opacity from the world clock |
| **The compass** | a needle points at the centre where `s` > 0.1, weighted by `s` | `CUT.north(x, z)` for any compass item or UI |
| **Stuck fruit** | a share of the fruit sets at its unripe size and stays there | a harvest flag (`stuck`), section 7 |

Nothing in the warp hurts anyone. It fades out at the lip: the lip's forest is nhighlands' as anywhere.

## 4. The flora

| Ring | Ground | Read in place (scaled for the air) | Warp | Natives |
|---|---|---|---|---|
| The lakes' shores (to ~4 km from the water) | wet, 1,600-2,050 mm, +35-39 °C | nwlowlands' glow-willows, paperbarks, stilt pandans, mist palms, tree ferns in the gullies | strong | **hyperbamboo** groves; ring reeds |
| The floor (16-48 km) | salt steppe (XS) with forest strips along the dry valleys | nwlowlands' she-oaks and wattles along the valleys only | strong | **rankgrass** on the salt |
| The walls (48-64 km) | Cfa and BWh, 720-830 mm, +23-27 °C | nwlowlands' columns: ghost gums, blue gums, tower ash, column kauri, banksias, grass trees, wattles; bamboo in the ravines | moderate | **measure melon** on the terraces |
| The lip (64-90 km) | Csa to Dsc, 470-550 mm | nwlowlands' spire cedars, needle cypress, crag pines, then nhighlands' high band | faint, then none | **circle lichen** on the faces |

### The natives

| Key | Name | Model | What it is | Harvest |
|---|---|---|---|---|
| `hyperbamboo` | **Hyperbamboo** | nwlowlands' sky bamboo (26-36 m) in the dense air, after *Dendrocalamus giganteus* | culms 60-80 m and 0.6-1.0 m across in groves of 50-200; **every internode in a clump the same length**, so the nodes line up across a grove like a surveyor's level; whole groves combed along the field; old culms bitten open to their chambers | **shoots** (a vegetable); **culms** (Dilihan's scaffolds, water pipes, the pass road's bridges); leaves (fodder); and once in decades a grove flowers together and dies: **bamboo rice**, a grain harvest the valley remembers (gregarious flowering, as real bamboos do) |
| `rankgrass` | Rankgrass | a salt grass (*Distichlis*, *Puccinellia*) | low blue-grey tussocks on the salt flats that **seed in straight lines** along the field, so the flats are ruled in radial rows from the rim | grazing; salt-tolerant thatch |
| `measuremelon` | Measure melon | a melon vine (*Cucumis melo*) | sweet melons that ripen in **exactly three sizes**; a share stick unripe forever at the smallest (the stuck fruit) | the fruit; and, said in Dilihan, the origin of the colony's measures: a market measure is so many melons |
| `circlelichen` | Circle lichen | crustose lichens (*Rhizocarpon*, *Xanthoria*) | yellow-green and orange **perfect circles** on the bare cut faces, nesting and overlapping, never touching | a medicine: scraped and steeped as an antiseptic wash (as *Usnea*) |

## 5. The ground

- **The curve**: the model's heights, smoothed at 1:1 into one clean concave sweep across the floor and walls; no
  noise added where the sphere cut (the cut is the one smooth thing on Krator).
- **The lakes**: the upper lake fringed with hyperbamboo and reed rings, mist over it at dawn; the lower lake in the
  pit, salt-edged, warmer still.
- **The salt flats**: `ground.salt`, `ground.efflorescence` (both in the library), rankgrass ruled across them.
- **The cut faces**: at the lip, bare and **mirror-smooth curved rock** where nothing has had time to weather, the Wall's
  rock in clean section (the strata module draws any bedded rock cut straight across: `core/terrain/STRATA-PLAN.md`),
  circle lichen the only growth. A `core/terrain` relief stamp holds the smooth sweep where it meets the broken
  mountain above it.
- **The crater mouth**: the floor running out south-east between the walls, Dilihan in it.

## 6. People and heat

The warp is harmless; the floor's climate is not. At +39 °C mean and +44 °C in summer in 2 atm of wet air, the lake
shores are deadly to people in the hot season. So the floor is worked, not lived on: Dilihan's people live in the
crater mouth (+31 °C) and on the walls, and go down to the floor for bamboo and melons in the cool months. The page shows
it: a camp of cutters by the lake, deserted in high summer.

## 7. Crops (`kits/crops`)

A `cut` biome entry: zones `lake` (warmth [5, 5], arid [4, 4], wet, atm 2), `floor` (warmth [5, 5], arid [1, 2], salt,
atm 2), `walls` (warmth [3, 4], arid [2, 3], atm 1), `lip` (warmth [1, 2], arid [1, 2], atm 1). Records: `hyperbamboo`
(vegetable; also `weaving`, `thatch`), `bamboo-rice` (grain, a rare harvest), `measuremelon` (fruit, with `stuck`),
`circlelichen` (herb, medicine), `rankgrass` (thatch). nwlowlands' crops grow here too, at fixed sizes.

## 8. Stations

1. **The floor** (`dist/cut.html`, about px 468,322: -1,960 m, 2 km from the upper lake, ~1,950 mm, +35 °C): the lake,
   hyperbamboo combed into rings round it, rankgrass ruled across the salt flats behind, the walls round the horizon,
   echoes at dusk, the cutters' camp.
2. **The wall** (`-wall`, on Dilihan's side of the crater mouth, r 50-60 km): nwlowlands' columns leaning along the
   field, terraces of measure melons, the curve of the bowl seen across, the city below.
3. **The cut face** (`-face`, about px 427,302: the west lip, ~5,100 m, about -2 °C): the bare curved face, circle
   lichen, the warp fading out into nhighlands' normal forest on the mountain above, the whole bowl below.

## 9. The mouth, the shape, the heat

1. **The north mouth** (settled 2026-10-23): cut on the model in 4.22, on bearings ~345-15°, the bowl's curve continued
   north to a sill at the lowlands' own level (~500-800 m) so Jimjam's lake does not drain in. The pass road runs from
   the lowlands through it, across the floor's edge, and out the crater mouth past Dilihan.
2. **The shape: where the weapon was.** The model's bowl is a shallow spherical cap, ~130-160 km across and 5-8 km deep
   (the floor at -2.2 km under a range ~3.5 km high). A sphere that cuts such a cap has radius R = (a² + h²) / 2h, with a
   the cap's half-width and h its depth: **R about 260-640 km, most likely ~450 km, its centre 250-630 km above the old
   ground**. So the weapon did not go off in the air: anything centred inside the atmosphere (under ~100 km) cuts a bowl
   tens of kilometres deep (centred 20 km up, a 150 km bowl would be ~58 km deep). It was **an orbital detonation, or a
   deletion projected from orbit**: a sphere some 500-1,300 km across, almost all of it empty space, that grazed the
   planet and took the Wall's crest with it. The lore's "the sphere's lower half" would become "the bottom of the sphere"
   (`LORE.md` §6.2), and the Cut gains a second story if the owner wants it: the same sphere took a column of air, and
   the atmosphere falling into the void would have been heard and felt across the crater.
3. **The heat**: open (keep the floor a deadly hothouse, or temper it on the model).

## 10. Order of work

- **C0.** The owner settles the heat and the lore's wording (section 9); the north mouth is on the model's to-do list; the texture prompts (hyperbamboo culm and leaf in Krator's size, rankgrass,
  measure melon, circle lichen, a polished curved rock face; `bark.bamboo.jade`, `fibre.bamboo.lattice`, `ground.salt`,
  `ground.efflorescence` are in the library) into `core/materials/PROMPTS-NEEDED.md`; any model edit (the north mouth)
  goes on the model's to-do list.
- **C1.** The field and the warp's transforms as data, `tests/test-cut.js`: the strength at the centre is 1 and 0 at the
  lip, the axes are unit and orthogonal, the quantised sizes and the bites are the same on every run and machine.
- **C2.** Station 1's ground (the curve, the lakes, the salt flats) and the natives' records.
- **C3.** nwlowlands read in place, scaled for the air and warped; the hyperbamboo groves; rankgrass.
- **C4.** The echoes and the dusk; the compass; the cutters' camp.
- **C5.** Stations 2 and 3, the cut faces (with the strata module if it has landed).
- **C6.** The crops; `verify.py --assert`; `PORT.md`; the gallery (a new biome); Dilihan's plan switched to read this kit.
