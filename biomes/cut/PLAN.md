# cut: the plan (draft, 2026-10-23)

**The Cut**: the bowl an Ancient eigenweapon left in the northern Inner Wall when it deleted a perfect sphere of matter
(`LORE.md` §6.2, Dilihan). What the weapon left behind still acts on what grows there: **the flora is warped, mostly
harmlessly**, the more the nearer the bowl's centre. The kit is mostly a **warp layer over other kits' flora**, with a
few natives of its own, chief among them the **hyperbamboo**.

Owner's brief (2026-10-23): something unique for the Cut, a remnant of the eigenweapon: the flora warped in some mostly
harmless way. Settled the same day: the floor takes **nwlowlands flora adapted to the dense air** (not the eastern
abyss's, which is too far away to share it), led by a **hyperbamboo**; the warp's ideas (combed growth, fixed sizes,
clean bites, straight ranks, echoes, the compass) were approved; a detailed plan was asked for.

**Status: building (2026-10-26, branch `claude/cut-biome-75af1e`); the owner's decisions of that day are in section 11.** The kit does not decide what the eigenweapon was, who fired it or at what
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

The table is 4.21's. The 4.22 edit (on the model since 2026-10-23) raises the floor 600 m and cools it (section 6); the
walls and the lip keep theirs. On 4.22 the lakes settle again by the routing as **two salt lakes at two levels**: 2,663 km²
at -1,456 m over the bowl's middle and 497 km² at -1,608 m to its south-east, endorheic (the bowl spills only at -383 m);
they cover more of the floor than 4.21's (2,326 km² drawn), the cooler floor evaporating less.

- **Two lakes, at two levels**: the upper lake, 2,016 km² at about -1,980 m (px 454-487 by 298-325), rain ~2,050 mm
  over it; and a lower lake, 304 km² at about -2,330 m (px 448-459 by 276-305), north-west of it in the deepest pit.
  No river leaves the bowl: one dry valley runs to the lakes from the south-west. **The bowl drains to itself.**
- **The floor is salt steppe away from the water.** Between 16 and 48 km out, a third or more is abyssal salt steppe
  (XS): the lake effect wets the shore, and the rest of the floor dries to salt.
- **The floor is a hothouse on 4.21**: a mean of +39 °C within 16 km of the centre, +44 °C in the warmest month, under
  2.1 atm of wet air: the model's lapse rate (6.5 °C per km) carried 0.9 km below the crater floor. **4.22 tempers it**
  (section 6): the floor raised to about -1.6 km and a closed-basin correction, for a mean of about +31-32 °C.
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

The floor's ~1.95 atm after 4.22 (2.0-2.1 on 4.21) is the densest air outside the Rift, and dense air is why Krator's
lowland plants run large: the nwlowlands species, carried in from Jimjam's country, grow **about half again** their nwlowlands height on the floor and
walls below 0 m (`habit` scale by pressure, as the hyperjungle's hypertrees), normal on the lip. The heat and the salt
steppe keep the floor's forest to the water's edge and the river lines.

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

## 6. People and heat (settled 2026-10-23)

The owner: hot, but habitable year round, and still a little deeper than the crater. Why the floor is hot at all: air
that sinks into a deep basin is compressed and warms, so ventilating the bowl through its mouths would make it hotter,
not cooler; tempering has to heat the floor less or cool it from inside. And in 2 atm sweat evaporates less well than
at 1 atm, so humid heat is harder on the body than the same temperature on Earth: the target sits a little under
Earth's hottest towns. The 4.22 edit (`tools/scale-model/README.md`):

| | 4.21 | 4.22 (target) | 4.22 (on the model, the floor's median) |
|---|---|---|---|
| Floor | -2.2 km | **about -1.6 km**, ~250 m under the central crater floor | -1,438 m (the deepest pits ~-1.6 km) |
| Air | 2.1 atm | ~1.95 atm | 1.92 atm |
| Mean | +39 °C | **~+31-32 °C** | +31 |
| Warmest month | +44 | ~+35-36 | +35 |
| Coldest month | +33 | ~+26 | +26 |
| Nights | | ~+23-26 | +23 (the year's lowest) |

- **The floor raised ~600 m**, fading to nothing at the lip: -3.9 °C by the lapse rate.
- **Afternoon cloud and storms**: the lakes' moisture forced up the walls builds cumulus by noon and storms by afternoon,
  capping the highs. **Night drainage of cold air** off the 3-6 km walls pools on the floor and cools the nights. The
  lakes, fed by snowmelt off the lip, soften the extremes by the shore.
- **The hyperbamboo's shade** cools its understorey a further 2-4 °C: a page effect, not the model's.

**The day on the floor**: fog on the lakes at dawn, cool air lying in the hollows; heat and haze by mid-morning; towers
of cloud on the walls by noon; a storm most afternoons in the wet season; a clear, still night. People live there:
Dilihan's cutters keep villages in the hyperbamboo's shade by the lakes, the town itself in the crater mouth.

## 7. Crops (`kits/crops`)

A `cut` biome entry: zones `lake` (warmth [5, 5], arid [4, 4], wet, atm 2), `floor` (warmth [5, 5], arid [1, 2], salt,
atm 2), `walls` (warmth [3, 4], arid [2, 3], atm 1), `lip` (warmth [1, 2], arid [1, 2], atm 1). Records: `hyperbamboo`
(vegetable; also `weaving`, `thatch`), `bamboo-rice` (grain, a rare harvest), `measuremelon` (fruit, with `stuck`),
`circlelichen` (herb, medicine), `rankgrass` (thatch). nwlowlands' crops grow here too, at fixed sizes.

## 8. Stations

1. **The floor** (`dist/cut.html`, about px 468,322: -1,960 m on 4.21, -1,479 m on 4.22, by the upper lake,
   ~1,950 mm, +30 °C): the lake,
   hyperbamboo combed into rings round it, rankgrass ruled across the salt flats behind, the walls round the horizon,
   echoes at dusk, the cutters' camp.
2. **The wall** (`-wall`, on Dilihan's side of the crater mouth, r 50-60 km): nwlowlands' columns leaning along the
   field, terraces of measure melons, the curve of the bowl seen across, the city below.
3. **The cut face** (`-face`, about px 427,302: the west lip, ~5,100 m on 4.21, ~4,940 m on map 5.1, about -2 °C): the bare curved face, circle
   lichen, the warp fading out into nhighlands' normal forest on the mountain above, the whole bowl below.

## 9. The mouth, the shape, the heat

1. **The north mouth** (settled 2026-10-23): cut on the model in 4.22, on bearings ~345-15°, the bowl's curve continued
   north to a sill at the lowlands' own level, 700 m (666 m on map 5.1), on the lip's line (px 460,262), the pass floor running on at ~670-700
   m to the lowland slope at px 460,225, ~30 km wide there; Jimjam's lake does not drain in, and the pass drains north to
   Jimjam's river (with the divide at the lowland end the bowl took the ridge's north flank and its lake spread over the
   floor). The pass road runs from
   the lowlands through it, across the floor's edge, and out the crater mouth past Dilihan.
2. **The shape: where the weapon was.** The model's bowl is a shallow spherical cap, ~130-160 km across and ~4.5-7.5 km
   deep once 4.22 raises its floor (to about -1.6 km, under a range ~3.5 km high). A sphere that cuts such a cap has
   radius R = (a² + h²) / 2h, with a the cap's half-width and h its depth: **R about 280-730 km, most likely ~510 km, its
   centre 270-720 km above the old ground**. So the weapon did not go off in the air: anything centred inside the atmosphere (under ~100 km) cuts a bowl
   tens of kilometres deep (centred 20 km up, a 150 km bowl would be ~58 km deep). It was **an orbital detonation, or a
   deletion projected from orbit**: a sphere some 500-1,300 km across, almost all of it empty space, that grazed the
   planet and took the Wall's crest with it. The lore's "the sphere's lower half" would become "the bottom of the sphere"
   (`LORE.md` §6.2), and the Cut gains a second story if the owner wants it: the same sphere took a column of air, and
   the atmosphere falling into the void would have been heard and felt across the crater.
3. **The heat** (settled 2026-10-23): tempered on the model in 4.22, the floor still a little deeper than the crater
   (section 6).

## 10. Order of work

- **C0.** The owner settles the lore's wording (section 9); the north mouth and the floor's climate are on the model's
  4.22 list and land before the station sites are fixed; the texture prompts (hyperbamboo culm and leaf in Krator's size, rankgrass,
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

**Where it stands (2026-10-26, branch `claude/cut-biome-75af1e`).** C0: the lore settled (section 11), the texture prompt
for the face written and delivered (`rock.cut.polished`), the four other sets already in the library; the north mouth and the
4.22 floor are on the model. C1: done (`src/41-cut-field.js`, `tests/test-cut.js`). C2, C3: done (station 1). C4: the echoes
(the hyperbamboo's), the compass (the page's needle, `CUT.north`), the camp: done. C5: stations 2 and 3: done, without the strata
module (not landed). C6: the crops (`kits/crops`, a `cut` biome and five records), `verify.py --assert` and `PORT.md` done; the
gallery and Dilihan's plan switched to read this kit are left (`KNOWN_ISSUES.md`), with what the warp does not yet reach.

## Textures

Reuse `bark.bamboo.jade` (the hyperbamboo's culms, scaled up), `ground.salt`, `ground.efflorescence` and the NW lowlands'
sets. To generate: `card.bamboo.giant`, `card.rankgrass`, `card.crop.melon`, `rock.lichen.circles`
(`core/materials/PROMPTS-NEEDED.md` section 10, 2026-10-23).

## 11. Decisions of 2026-10-26 (the owner, at the build)

- **The lore (C0, section 9): both.** The bowl is the bottom of a sphere some 500-1,300 km across, centred in orbit: an
  orbital detonation or a deletion projected from orbit. And the second story: the same sphere took a column of air, and
  the atmosphere falling into the void was heard and felt across the crater. `LORE.md` §6.2's "the sphere's lower half"
  becomes "the bottom of the sphere"; that edit is made on `main` (the lore file is not this kit's), with this note as
  its source.
- **The cutters' camp: props only**, tagged so a future Dilihan kit (an Iziz vassal kit on `settlements/iziz/VASSAL-KITS.md`)
  can take them over: every prop is a core/tags record with `culture:'iziz'`, `style:'dilihan'`, `role:'placeholder'`,
  `job:'carpentry'` and its kind in `variant` (culm stack, drying rack, lean-to, hearth), registered before it is drawn.
- **The cut face: a new set**, `rock.cut.polished`, prompted and delivered the same day (in the library: bedded rock
  sawn smooth, full colour).
- **Scope: all three stations** this session (C1-C6, the gallery left to `main`).

## 12. Exchanges with the neighbours (the owner, 2026-10-26: for the final biome rebuild)

Two species each way with the crater drylands and the northern highlands, each where the two biomes meet on the model, each
showing the warp (or its absence). Every species stays in its home kit; the neighbour reads it in place under its own mask
(`biomes/WORLD.md`), as the Cut reads nwlowlands and nhighlands today. **Settled:** the measure melon's three sizes and its stuck
share **breed true outside the bowl** (the owner: that is why Dilihan's measures hold in the crater too). **The crater drylands' half is
its northern region only** (the owner, 2026-10-26: `rmuqlfgh1u6d8`, north and west of the Throne, the one the crater mouth opens
into); the southern region (`rmuqlgonah5tp`, south of the volcano) neither sends nor takes these species. Not built yet: they go
into the final rebuild, after the shared-sky rebuild of both neighbours has merged.

| # | Species (home kit) | Into | Where | What it shows |
|---|---|---|---|---|
| 1 | Tree aloe (`crater-drylands`) | the Cut | the salt steppe's edge (station 1) and the wall's BWh patches (station 2) | where s > .5 its spiral rosettes grow as flat two-ranked fans (as *Aloe plicatilis*): the straight ranks on a succulent |
| 2 | Parasol pine (`crater-drylands`) | the Cut | the dry wall about the crater mouth (station 2) | its long fire-proof column makes the comb plain: whole stands leaning one way, crowns stretched along the field, three height steps |
| 3 | Rankgrass (`cut`) | the crater drylands (north) | the salt pans and seeps near the mouth | outside the field it seeds as an ordinary salt grass; the ruled rows fade with distance from the mouth |
| 4 | Measure melon (`cut`) | the crater drylands (north) | feral on the seeps along Dilihan's road | still three sizes and its stuck share (it breeds true); a crop of the northern crater's farms through `kits/crops` (`home` gains `crater-drylands`, its note naming the northern region) |
| 5 | Rowan (`nhighlands`) | the Cut | the upper walls' gullies, 64-72 km out (Csa to Dsc) | the stuck fruit: clusters set small and green beside the ripe red ones |
| 6 | Great trumpet (`nhighlands`) | the Cut | the walls' ravines, with the hyperbamboo | where the ranks apply its colonies stand in straight rows of fixed sizes, like organ pipes; its glowing bell-bulbs beside the dusk echoes |
| 7 | Circle lichen (`cut`) | the northern highlands | the crag pillars and boulder fields | away from the warp an ordinary map lichen: round-ish, irregular, touching and merging; the perfect circles only near the lip |
| 8 | Ring reeds (`cut`) | the northern highlands | the tarns and stream mouths (*Phragmites* takes the cold) | an ordinary reed bed outside the field, no bands |

The work: 1, 2, 5 and 6 are lists in this kit (the stations' allow lists for read-in kits, with `crater-drylands` read in place
on the wall station, its pack a sidecar); the warp does the rest. 3, 4, 7 and 8 are additive reads of `src/50-biome-cut-species.js`
(and 55/57's planners) by those two kits' pages, each under its own mask (on the crater drylands, a mask of its northern region only), with a flag that turns the warp's traits off where
s is 0 (rankgrass's rows, the lichen's spacing, the reeds' bands), never the melon's sizes. `CROPS` gains the melon's
`crater-drylands` home. Each exchange gets a host check on the page that receives it (the aloe's fans only where s > .5; the
melon's three sizes in the crater; no ruled rows past the mouth; the lichen's circles touching away from the lip).

**Done on the northern highlands' side (2026-10-26, the final rebuild's test bed):** exchanges 7 and 8. `biomes/nhighlands/build.py`
reads this kit's `41`, `50`, `55`, `57` and `70` by path (renamed `71a`-`71e`, after its own kit closes) and the pack's `reed` sheet;
`biomes/nhighlands/src/87-host-cut.js` draws them with the warp off through two new planners here, `CUT.planLichenPlain` (`57`: the
pillars by rays at the drawn rock, the crag faces) and `CUT.planReedBed` with `CUT.drawReeds` (`55`: the tarn's margin, the stream's
slack pools), with host checks both ways (`CUT.checkLichenPlain`: thalli touching, none nested; `CUT.checkReedBed`: no bands). The
ring reed's climate tag widens to `hypertropic..cold` (Phragmites takes the cold). The crater drylands' two (3, 4) are still to do.

## Core adoption (written before the first fragment, 2026-10-26)

The nearest finished builds: `biomes/korona` (stations, other kits read in place under a mask, core/water) and
`biomes/swbay` (the shared sky, `ATMOS.cloudShade`). `build.py` starts from Korona's; the sky from swbay's.

| Module | Taken | For |
|---|---|---|
| `core/biome` (`CORE_BIOME`) | yes | the kit contract, items, buckets, bake, runtime LOD, export; the nwlowlands and nhighlands kits read in place on it |
| `core/host` (`CORE_HOST`) | yes | camera, loop, clock, panel, inspector, polygon tool, probe (`99-host-take.js` hands it each station) |
| `core/rand` (`KRAND`) | yes | every draw of this kit's own: the natives, the camp, the bites, the echoes, the size steps, each seeded by a hash of (world, cell, index, salt). The read-in kits keep their own streams |
| `core/tags` (`KTAGS`) | yes | every plant and prop registered before it is drawn (`BIO.init({tags:'cut'})`), the camp's placeholder tags |
| `core/atmos` | yes | `ATMOS.bindHost`; **the shared sky** (`core/atmos/sky`, `89-atmos-h-skyhost.js`) at the Cut's pixel, the bowl's walls as **ridge profiles cast from the kit's own bowl model** (`CUT.horizon`), the dense air; `ATMOS.cloudShade`; the weather binding (`ATMOS.bindWeather`) for the afternoon storms (section 6) |
| `core/water` | yes | the lakes as `WATER.open` (station 1), the wall's terrace channels none; the face none (a kit-level check: every station page has a core/water record, as Korona's) |
| `core/terrain` | yes | `38-core-relief.js` (`KRELIEF`) for the face's stamp where the smooth sweep meets the broken mountain (station 3); `36-core-carve.js` for the bitten boulders. **Not** the strata module (`STRATA-PLAN.md`): not landed |
| `core/space` (`KSPACE`) | yes | the natives' keep-clear (groves, melon terraces, the camp) through the biome core's `BIO.clearOf` and its index |
| `core/mask` (`KMASK`) | no | nothing reads a canvas: every mask is a function of the bowl model and the fields |
| `core/materials` | yes | the library through `materials.json` and `tools/textures/pack.py`: `bark.bamboo.jade`, `card.bamboo.giant`, `card.rankgrass`, `card.crop.melon`, `rock.lichen.circles`, `ground.salt`, `ground.efflorescence`, `rock.cut.polished` (the faces); the read-in kits' own packs as sidecars |
| `core/export` | yes | `BIO.export()` (the export profile in `verify.py --assert`) |
| `core/clock` | yes (through core/host) | the hour for the echoes (dusk) and the sky |
| `core/lod`, `core/minimap` | no | the biome core's runtime LOD does the work, as in every biome kit; no minimap on a biome page |
| `core/city`, `core/hamlet`, `core/simulation`, `core/furnish` | no | a biome kit: no town (the camp is props for Dilihan's kit) |

The kit's own data side (`[G data]`, `src/50-biome-cut-field.js`): the bowl model (the radial profile on the 4.22
survey, the lip by bearing, the two lakes), `CUT.field`, the warp's transforms (lean, stretch, size steps, bites, echoes,
ranks) and `CUT.north`. No three.js, no DOM: `tests/test-cut.js` runs it in node.

## Core adoption (pair 10, the final rebuild, 2026-11-04)

Written at the turn (`HANDOFF-REBUILD.md`, "How step 3 runs"; `BACKPORT.md`'s universal set and the Cut's row). A cloud session with no GPU: the pages
were checked in software GL (`verify.py --assert`, a few views each, below); the coordinator runs `--assert --all-views` on the GPU. nhighlands' pair-7
rebuild (`claude/rebuild-nhighlands-cloud`) is merged into this branch first (a fast-forward), so the face and the wall read its rebuilt species.

| Module | Taken | How | Switch |
|---|---|---|---|
| `core/biome` 31b, 31j, 33, 33b, 34, 41, 44 | yes | what the read-in kits' rebuilt species call for: their leaf sets, **`BIO.flareJoin`** at limb joints (nwlowlands and nhighlands flare where a page lists `31j`), the fungoid parts, the octahedral **impostors** of their far trees, `BIO.env` | none (the read-in kits' own) |
| `BIO.bamboo` (33b) | yes | the hyperbamboo's culms (three tiers, three bitten, the echo) are `BIO.bamboo.culm`, vertex for vertex the old `G.culm` (`node core/biome/test-bamboo.js`); `G.culm` stays as the test's reference and the fallback for a page without 33b (nhighlands) | none |
| `KGROUND` (43) | yes | the ground's four library layers per station, hex-tiled, distance-scaled, blended by height; the same weights, strengths and tints as the page's own mix | `?kground=0` the old anti-tiled mix |
| `KFAR` (44) | yes | the far bowl (the bowl's own heights and paint to 120 km) on core's lattice, 37k vertices, fog thinned to .85 | `?kfar=0` the first build's polar skirt |
| `KHORIZON` (45) | yes | baked over the page and the whole bowl (rays to 70 km): the walls' shadow crosses the floor at a low sun, the lip's crest shades the face; the face's own ground is kept out (it went near black under it: `KNOWN_ISSUES.md`) | `?horizon=0`, `=ground`, `=scene`, `=all` |
| `KSTRATA` (35) | yes, the face | the bake puts the west lip in the `impact` province (impactite 255 at px 427,302), so the polished section is the crater wall's **megabreccia** sawn flat (a page recipe at 22 m blocks, 2.6 m nested, no wash or dust), `rock.megabreccia` the grain; `ROCK-PROPOSAL.md` "Where the biomes must change" 1 | `?strata=0` the level beds |
| `KSHADOW` (core/shadow) | attached **off** | the owner (2026-11-03): toggleable and off by default. core/shadow has no off-at-load switch yet, so the page attaches it only when asked; the texture-unit rule (the Throne's) kept | `?shadow=1` turns it on |
| `KWARP` (`KHOOK.warp`) | attached **off** | the field felt as a faint travelling ripple along its own axis (spokes or rings), amplitude .45 m x s, gone within metres of the eye; the warp proper stays placement | `?bend=1` turns it on |
| `core/water` 56, 57, 58, 60, 61 | yes | the lake **without surf or breakers**; the creek's water (a `WATER.flow`; its bed was carved but dry since the first build) and its **plume** into the lake (`tintFlow`); **`WATER.mirrorSwitch`** on the lake or a station's pool, off at load; the trees against the water's own shore (`WATER.fields`, `edgeAudit`, a host check with its negative) | `?plume=0`, `?mirror=probe|live` |
| `core/atmos` height fog, rain cover, lightning | yes | section 6's first lines: mist pooling on the lake and the floor's hollows at dawn (station 1: below 8 m over the water), a broken cloud band on the walls (3.6-4.6 km); no rain under the crowns; the weather's puddles in the floor's hollows (`WATER.hollows`) | the weather selector |
| `check_cells` | 0 faults | the Cut's slots; the read-in kits' packs are their turns' | |
| `KSTACKS`, KCARVE cave mouths, seasons, fog belt | no | the cut is the one smooth thing on Krator (section 5): no stacks or caves on the face; the floor's hothouse has no deciduous season; the height fog's band is the walls' cloud | |

**The exchanges (section 12).** 5 and 6 are built: the **great trumpet** on the wall station, nhighlands read in place there for it alone, its colonies
down the ravine beside the hyperbamboo (the wall's s is .2, so the plan's organ-pipe ranks, which need s > .5, do not show: nothing on the Cut's three
stations stands both in a ravine and in the strong warp); the **rowan** on the face station, thinly: the lip there stands at 66 km, inside the plan's
64-72 km ring, so the rowans nhighlands grows just past it are the exchange's, and they take **the stuck fruit** (`warpKit`'s new `stuck`: a share
`CUT.STUCK` of the berry clusters of the trees in the ring, by the 2 m cell, small and green). Inside the lip the page is all bare face (its grade is ~.5
to the page's edge), so none grow there, and at 4.9 km the lip is boreal, where nhighlands places few rowans (four on the page); the plan's Csa-Dsc
gullies want a station on the upper walls (the owner's call). `warpKit` also gained `allowAt` (a kept species taken back where a station does not want
it), unused now. Each has a host check and a negative. 1 and 2
(the tree aloe and the parasol pine, from the crater drylands) wait for the crater drylands' turn (pair 12); 3 and 4 are that turn's. 7 and 8 are on
nhighlands (pair 7).

**Map 5.1** (`biomes/STATIONS-MAP-5.1.md`, "Small checks"): the north sill is 666 m (it was 700), the west lip at the face 164 m lower (4,936 m); both in
`41-cut-field.js`'s lip table. The floor and the lakes are within 100 m (no change).

**Fixed on the way.** The hyperbamboo's leaf sprays switched LOD 50 m apart from their culms (the core guard's "one LOD key per tree": 43% of the sprays);
their tiers now switch at the culms' distances. No read-in tree stands in the creek's water.

**Readers of this kit** (nhighlands, exchanges 7 and 8, reads `41`, `50`, `55`, `57`, `70`): `41`'s lip table (5.1's numbers), `50`'s culm defs (on
`BIO.bamboo` when the page has it, else `G.culm`: the same vertices) and `55`'s spray tiers changed; nhighlands draws none of the groves, so its pages
move by source bytes only, and they are rebuilt here.
