# abyssal-savannah: the plan (2026-10-26)

**The abyssal savannah**: the dry grassland of the Eastern Abyss, between the coal-swamp jungle and marsh on its floor
and the high country above its rim. The owner, 2026-10-26: "do e abyss savannah". The eastern abyss kit
(`biomes/eastabyss/KNOWN_ISSUES.md`) carried it as a sketch (umbrella trees, grass, Vain fronds and rosettes on a
smooth ramp under the shelf, the climb into the highlands not designed) and asked for it to be a kit of its own. This
is that kit.

**Status: plan written and station 1 built (2026-10-26).** Every choice the owner has not made is a default, marked
**(default)** and listed in section 12.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/abyssal-savannah/` (`src/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `INDEX.md`) |
| Pages | `dist/abyssal-savannah.html` (station 1, the rim slope, px 1026,350 on map 5.1); stations 2 and 3 (section 8) to follow as `python3 build.py --station <name>`, the Throne's way |
| Object | `ABSAV` (`build`, `zones`, `burn`, `make`, `grow`, `SPECIES`, `HARVEST`, `PASSES`), on the biome contract (`biomes/eastabyss/BIOME-API.md`) |
| Its own | the savannah's species (section 5), its zones and burn mosaic (sections 4 and 6), the rim slope's ground (section 7) |
| Read in place | `biomes/eastabyss` (its jungle species at the slope's foot and in the gullies, by `EASTABYSS.make` / `grow`) |
| Data side | the zones, the burn field, the species records and the placement are plain functions and records, seeded by cell from `core/rand` (`[G data]` where they touch no browser) |
| Users | `biomes/eastabyss` (its savannah zone is to read this kit in place: section 11, step S5); the open world's eastern abyss tiles |

It is a new biome, so it goes in the gallery when it first reaches `main` (not this session: no commit, no publish).

## 1. Where it is on the model (4.22, surveyed 2026-10-26)

Read from the live Krator Scale Model (4.22; the page's `DATA` and its `regions` collection), not the older
little-demo extract (4.19).

**The model has an abyssal savanna class (XV), and it lies on the floor, not the rim.** Inside the `e abysss` biome
polygon (77,900 km², median -1,626 m, 1.96 atm, ~850 mm, +33 °C: XS 30%, XA 17%, XW 14%, XV 13%), XV covers 10,350 km²
at a median of **-1,830 m (2.0 atm), ~1,050 mm, +34 °C**: the belt between the lakes' wet jungle (XA, 1,300-2,400 mm)
and the dry salt steppe and desert (XS, XW, 300-700 mm) a few kilometres back. It runs in clumps along the floor's east
side (px 987-1040), the largest at px 1000,668 (2,060 km²) and px 1031,515 (1,600 km²).

**The rim above is savanna and steppe too, on Earth's classes.** The `east rim` region (the `GENTLE` rim of 4.17: no
escarpment) climbs from the floor to the plateau over 30-50 km where elsewhere the wall rises within one 4 km cell. The
gentlest transects (px 1000-1037, rows 298-358 and 682-706) run from XS or XV on the floor through Am or Af at the foot,
**Aw (tropical savanna)** on the climb and **BSh (hot steppe)** on the bench at the top, to Cfa and BSh on the plateau.

**Station 1's transect: row 350, px 1011-1043** (2 km a pixel):

| px | m | atm | class | rain mm | mean °C | |
|---|---|---|---|---|---|---|
| 1006-1010 | lake | 2.2 | XA | 1,500 | +39 | a lake of the floor, its level -2,331 m |
| 1011-1013 | -1,962 to -1,673 | 2.0 | XA | 1,240-1,410 | +34-38 | the lake jungle's shore |
| 1014-1015 | -1,673 to -1,346 | 1.9 | **XV** | 1,145-1,175 | +33 | the floor's savanna belt (station 2's country) |
| 1016-1019 | -1,346 to -506 | 1.7-1.9 | XA, Am | 1,250-1,440 | +29-32 | the foot: the slope wrings the rain out of the lake air |
| 1020-1022 | -506 to -179 | 1.64-1.7 | **Aw** | 720-1,160 | +26-28 | the climb (station 1) |
| 1023-1032 | -46 to -119 | 1.6 | **BSh** | 440-630 | +26 | the bench, 20 km wide, a shallow hollow at px 1029 |
| 1033-1043 | +53 to +596 | 1.5-1.6 | BSh | 520-660 | +23-25 | the climb to the plateau (`e badlands` from px ~1023) |

So the kit covers both: **the XV belt on the floor** and **the Aw and BSh rim slope above it** (section 12, Q1).
The polygons: the slope to px ~1022 is in `e abysss`, the bench from px ~1023 in `e badlands` (biomes/ebadlands), all of
it in `east rim` and in Nomad Country (political).

## 2. Air and scale

The rim slope stands at 1.6-1.75 atm, the floor's belt at 2.0. In air this thick:

- **Plants lose about half the water an Earth plant would** (transpiration goes as the vapour gap over the total
  pressure: `biomes/crater-drylands/NOTES.md`), so 700-1,100 mm carries a tall, closed grass and a tree every few dozen
  metres, where Earth's Aw at that rain is a thinner savanna. The bench's 450-600 mm is a steppe that would be a semi-desert
  on Earth.
- **There is 0.35-0.42 atm of oxygen**, so dry grass burns fast and hot: **the savannah is a fire mosaic** (section 6),
  as the crater drylands are, but a grass fire, not a scrub fire.
- **Things run large** (the lowland rule: `LORE.md` "Air"): the thatch grass stands 1.8-3.2 m, the umbrella trees
  9-24 m (Earth's flat-top thorns 6-15 m). The floor's belt at 2 atm runs larger still (station 2).
- **The light** is a 2.3x air column's: a milky zenith, a white horizon, distance fading fast (the shared sky's `air`).

## 3. What is wrong in the sketch, and what this kit does instead

The eastabyss page's savannah is `upland > .62` on a smooth ramp 190 m over the basin: umbrella trees thinning with
height, rope araucarias, dry grass, Vain frond patches, rosettes and boulders. What it lacks:

1. **The ground**: the slope's top is a ramp. Here the slope is real terrain (section 7): two risers with a caprock
   rim between treads, gullies cut down them, granite kopjes on the treads, a pan in the bench.
2. **The ecotones**: the jungle stops where `upland` says. Here the jungle **climbs the gullies** as gallery forest and
   thins up the foot over a kilometre, and the bench gives way to the plateau's steppe.
3. **Fire**: none in the sketch. Here every patch of grass has a burn age (section 6), and the flora reads it.
4. **A cast**: four plants. Here eleven species (section 5), the four kept and grown.

## 4. Zones

`ABSAV.zones(x, z)` reads five fields (the eastabyss contract's `wet`, `upland`, `flow`, plus `rock` and the kit's
own `burn`) and returns weights 0..1, the bands as data (`ABSAV.ZONEBANDS`, as eastabyss's):

| zone | where | reads | flora |
|---|---|---|---|
| `foot` | the slope's foot, the jungle letting go (Am) | `upland` < .2, `wet` > .6 | the eastabyss jungle read in place (bell-bark, crown fern, salt cycad, fan palmetto, rope araucaria), thinning upslope; thatch grass and umbrella trees starting |
| `gallery` | the gullies' floors and banks, wherever the slope is | `flow` > .4 | eastabyss's crown ferns, palmettos and strap cordaites up the gully; the tongue tree; reeds at the stream |
| `parkland` | the climb's treads (Aw) | `upland` .15-.7, `rock` low | umbrella trees in loose groves, tall thatch grass, Vain fronds, ember lilies in fresh burns |
| `scarp` | the risers and the caprock rim, the kopjes | `rock` > .4 | rosettes, ember cycads, kopje figs on the tors, sparse grass in the joints |
| `steppe` | the bench (BSh) | `upland` > .7 | short bunchgrass, stub lycopsid colonies, low umbrella trees, bloom patches |
| `pan` | the bench's hollow | `salt` > .3 | blue pan-grass, saltbush, a dry pan that holds water a few weeks of the year |

## 5. The species

Tags on every record, the project rule: `climate`, `aridity`, `abyssal`, `riparian`, `harvest` (`biomes/FRUIT.md`).

### Kept from the sketch, grown

| key | name | what changes |
|---|---|---|
| `umbrella` | **Shelf umbrella-tree** | the flat-topped thorn of the parkland, now in **tiers** (one to three flat crown plates, more with age), on a pale **corky bark** that a grass fire scorches black at the foot and never kills; heights 9-24 m, lower and wider on the bench, a sapling's single plate in fresh burns. Harvest as eastabyss's (light timber, fuel; a bark tea for the gut) plus its **gum** |
| `vain` | **Vain fronds** | still purple (canon). A **fire-follower**: the purple fans flush thickest on burns one to three years old, in patches, and stand up out of the old grass elsewhere |
| `rosette` | **Ember rosette** | the sketch's echeveria rosettes, on the risers, the rim and the kopjes' joints, their tips flushed red with the dry season |
| `thatch` | **Thatch grass** | the sketch's dry grass grown to the dense air's height: 1.8-3.2 m golden tufts on the parkland, 0.5-1 m bunchgrass on the bench; burnt to stubble on a fresh burn |

### The savannah's own (new)

The eastern abyss's flora is Carboniferous (`LORE.md` §"Eastern Abyss"); its dry upland is drawn from what grew on the
Permian and Triassic uplands, the coal swamps' dry neighbours, in dense air and fire:

| key | name | model | what it is | harvest |
|---|---|---|---|---|
| `tongue` | **Tongue tree** | *Glossopteris* | a rounded tree of the gullies and the parkland's damp hollows, 10-26 m, its tongue-shaped leaves in whorled rosettes along the twigs; deciduous: a share of the trees bare or turned orange in the dry season | timber; the seed-tongues are roasted (famine food) |
| `stub` | **Stub lycopsid** | *Pleuromeia* | an unbranched scaly pole 1.4-3.6 m with a tuft of grass-like leaves and one cone on top, in colonies of dozens on the bench: a steppe of green bottle-brushes | the cone's starch (pounded); the poles for fencing |
| `embercycad` | **Ember cycad** | *Encephalartos* | a squat armoured trunk 1-4 m, stiff blue-green fronds, a red-orange cone; on the risers and kopjes; the armour of old leaf bases is fire-proof: after a burn the fronds are brown and the cone stands | the cone's kernels, steeped (as eastabyss's salt cycad) |
| `kopjefig` | **Kopje fig** | a rock fig (*Ficus abutilifolia*) | a broad dark crown 6-14 m on a pale trunk whose roots pour over the granite of a kopje; only on the tors | figs (`generic_fruit_*` when the catalog has one; drawn as clusters) |
| `pangrass` | **Blue pan-grass** | a salt grass (*Sporobolus*) | low blue-grey tussocks round the pan, lilac seed spikes | grazing |
| `saltbush` | **Pan saltbush** | *Atriplex* | grey-green mounds on the pan's rim | grazing; the leaves eaten as a salty green |
| `emberlily` | **Ember lily** | the fire lily (*Cyrtanthus*) | scarlet trumpets that come up out of the ash within weeks of a fire and are gone in a season | none |

**Tags**: every savannah species `climate: 'tropic'`, `abyssal: true` (the dense-air abyss's own); `aridity`
`semiarid` (umbrella, thatch, vain, embercycad, kopjefig, emberlily), `arid` (rosette, stub, pangrass, saltbush),
`subhumid` (tongue); `riparian` `no` but the tongue tree (`both`).

Fauna is the fauna kit's (`kits/fauna`, README "A fauna kit"): the savannah wants grazers and the eastabyss frilled
lizard on its rocks; not drawn in this pass (section 12, Q6).

## 6. Fire: the burn mosaic

`ABSAV.burn(x, z)` returns the years since the patch last burned, 0-12, from a mosaic of patches 250-700 m across (a
jittered cell grid, each cell's age a `KRAND.hash` of the world seed and the cell, its edge broken by `KRAND.fbm`): plain
data, the same in Godot. Steep rock and the gullies' gallery do not burn. What reads it:

| age | ground | what grows |
|---|---|---|
| 0 (this year) | black char, ash, the red soil showing (`ground.burn`) | grass stubble only; ember lilies; charred stems; umbrella trees' feet black |
| 1-3 | green flush over the char | short green grass, Vain fronds at their thickest, bloom patches, umbrella saplings |
| 4-12 | gold | the full thatch grass, Vain fronds in the old grass, the fewest forbs |

It is a static mosaic, not a fire model (the crater drylands' `89-host-fire.js` runs one): a fire that moves, people who
set it (the abyssal people burn for grazing and for game) and smoke are a later step (S6).

## 7. The ground (station 1)

The page is 6.4 by 5 km on the climb at px ~1019-1023, row 350 (section 1). x east (up the slope), z south. y 0 is
-600 m on the model. The model's 4 km cells only give the average grade (about 7%); the risers, gullies and kopjes are
the page's own detail on it, not survey:

- **The foot** (x < -2100, y 0-40): the last of the jungle's terrace, wet, the gullies' fans spreading on it.
- **The first riser** (x ~ -1500, 70 m): a broken slope, rock in its joints.
- **The parkland tread** (x -1200 to 200, y ~150-200): rolling, kopjes on it, the Aw savanna.
- **The rim** (x ~ 400-900, 220 m): the main escarpment, a **caprock** band (bedded rock faces, a lip of slabs) over a
  talus of fallen blocks.
- **The bench** (x > 1100, y ~460-500): the BSh steppe, a shallow **pan** at x ~2300 (as the model's hollow at px 1029).
- **Gullies**: three, from the bench down to the foot, meandering, deepest where the slope is steep; a seasonal stream in
  the main one (`core/water` `WATER.flow`), pools at its foot and the pan's water as `WATER.still`.
- **Kopjes**: granite tors (`rock.granite.tor`), piles of rounded boulders 10-35 m high on the treads, registered.
- **The far country**: a coarse mesh to 9 km: the floor falling away west to the XV belt and the lake 1.7 km below
  (its level -2,331 m), the bench and the plateau rising east.

## 8. Stations

1. **The rim slope** (`dist/abyssal-savannah.html`, built): the climb at px ~1021,350 from the jungle's foot to the
   bench, the gully galleries, the parkland and its kopjes, the caprock rim, the bench's stub-lycopsid steppe and the pan,
   the burn mosaic over all of it; the floor and its lake below to the west.
2. **The floor's belt** (`--station belt`, planned): the XV clump at px 1031,515 (-1,870 m, 2.0 atm, ~1,050 mm, +34 °C),
   between the lake jungle (eastabyss, read in place) and the salt steppe: the parkland at its tallest (the umbrella trees
   to ~28 m, the grass over 3 m), rope araucarias, termite-like spire mounds of the floor's clay ants, the jungle's edge
   one side and the salt's the other.
3. **The bench's edge** (`--station bench`, planned): the top of the climb on a steeper transect (row 414, px 1024-1041:
   XV to Am to Af in 34 km), where the rim breaks as cliffs and the bench steppe meets the plateau's `e badlands` flora
   (`biomes/ebadlands` read in place: pinyon, juniper, chaparral yucca).

The savannah rims are stations of this kit too (section 14; the owner, 2026-11-08, `biomes/hyperjungle/PLAN-LANDS.md` section 14,
answer 1): `--station serim` (the se rim, the incense country), `--station erim` (the e rim near Fridon) and `--station north`
(hyperjungle N's savannah). Section 8 reserved no names for them; `belt` and `bench` above stay planned and unbuilt.

## 9. Crops (`kits/crops`)

An `abyssal-savannah` biome entry (atm 2, dense): zones `parkland` (warmth [4, 4], arid [1, 2]), `steppe` (warmth [4, 4],
arid [0, 1]), `gallery` (warmth [4, 4], arid [2, 3], wet), `pan` (warmth [4, 4], arid [0, 1], salt). Its own records:
`thatch-grass` (thatch; also weaving), `umbrella-gum` (reagent; the tree's gum, a glue and a binder for paint),
`stub-cone` (tuber: the stub lycopsid's starch) and `laterite-ochre` (dye: the rim's red earth; every biome needs a dye,
`kits/crops/DYES.md`). Added 2026-10-26. The crops kit's queries then offer what the climate takes (ashmillet,
sorghum-like grains of the drylands) on top.

## 10. Textures

From the library (`core/materials/library`), through `materials.json` and `tools/textures/pack.py`:

| slot | set | for |
|---|---|---|
| grass, bunch | `card.grass.dry`, `card.ichu` | thatch grass (parkland), bunchgrass (bench) |
| pangrass | `card.rankgrass` | blue pan-grass (the Cut's set reused: the same habit) |
| saltbush | `card.saltbush` | pan saltbush |
| bloom, lily | `card.flower.bloom.highland`, `card.firelily` | bench forbs; ember lilies |
| charred | `card.charred` | the stems on a fresh burn |
| leaflet | `card.acacia` | the umbrella tree's crown plates |
| tongue | `card.heartleaf` | the tongue tree's leaves |
| fig | `card.broadleaf` | the kopje fig |
| frond | `card.fern` | ember cycad fronds |
| fan | `card.palm` (one cell) | Vain fronds (tinted purple) |
| tuft | `card.sword` | the stub lycopsid's leaf tuft |
| bark | `bark.cork`, `bark.lepido`, `bark.armored`, `bark.smooth` | umbrella, stub, cycad, tongue and fig |
| rock | `rock.granite.tor`, `rock.sandstone.bedded.red` | kopjes; the caprock |
| ground | `ground.redsoil`, `ground.burn`, `ground.salt.ochre`, `ground.gravelly_sand` | the ground's detail layers |

**Owed** (prompts in `core/materials/PROMPTS-NEEDED.md` section 24): `ground.savanna.litter` (the ground under tall
grass: straw litter on red soil; `ground.redsoil` stands in) and `card.grass.thatch` (a 3 m plumed thatch grass;
`card.grass.dry`'s bunchgrass stands in).

## 11. Core adoption

The final rebuild's turn (pair 8, 2026-11-03, `claude/rebuild-abyssal-cloud`) took `BACKPORT.md`'s universal set and its row on station 1. Each look
change has a switch, so the owner can compare.

| module | what it does here | switch |
|---|---|---|
| `core/biome` (`CORE_BIOME`) | the kit contract: items, buckets, foliage materials, placement helpers, bake, export; **new:** 31j `BIO.flareJoin` on every bough (umbrella, tongue tree, fig; its roots too), 34 octahedral impostors for the far trees (the umbrella and tongue trees: one atlas, one item `impTrees`), 41 the field contract (`BIO.env`); 33, 35, 39 listed for the readers' parts | `ABSAV.JOINTS=false`, `?diet=0` (the old blobs) |
| the crowns held | the attach audit's 28.4% (leaflet 35,463 of 52,120): a hero's clump gets a twig rod from its plate's hub or the nearest bough end; a mid tree's clump is held toward it (`BIO.holdTo`); a bough's end runs into its plate's hub, and a plate no bough reached gets one. No random numbers: nothing placed moves | `ABSAV.HOLD=false` |
| `core/rand` (`KRAND`) | every placement draw: each cell of each pass reseeds the stream from `KRAND.hash(world, salt, ix, iz)`; the terrain's and the burn's noise is `KRAND.fbm` | |
| `core/tags`, `core/space`, `core/export`, `core/clock` | as before; `core/host` is now `khost.FULL` (the inspector, the edit marks) with the generated edits fragment | |
| `core/terrain` | **new:** 43 `KGROUND` (four library layers on documented masks: red soil, this year's burn, the pan's salt, the bench's gravel; `45-host-stage.js`, "the ground"), 44 `KFAR` (the country past the map to 36 km on 5.1's grade: the floor falling west to the lake, the bench and plateau east; it replaces the page's own far mesh), 45 `KHORIZON` (the risers' and the rim's shadow on the treads at a low sun, the ground and the flora), 35 `KSTRATA` (the caprock's beds, the `canyon` column, coloured into the ground's paint on the rim's steep faces on the CPU: no texture unit). KLAND is still not here: the rim slope is the page's own function on 5.1's grade | `?kground=0`, `?far=0`, `?hz=0`, `?strata=0` |
| `core/shadow` (`KSHADOW`) | the sun's shadows in one view-following box (oidong's lines); its cost on the GPU is the coordinator's to measure (this turn ran in the cloud, no GPU) | `?shadow=0` |
| `core/atmos` | the shared sky at px 1026,350; **new:** height fog, the rain cover, lightning and the particles, the foliage in the atmosphere's wind (`BIO.bindAtmosWind`); the clouds' shadows now go on after the bake, so the flora takes them too | `?hfog=0` |
| `core/water` | the gully stream (`WATER.flow`), its foot pools and the pan (`WATER.drawStill`: no shore grid, so no surf or breakers); **new:** breakup on the stream (ext/56), the audit (57), the reflections switch on the pan, off at load (58), the water as fields (60): the wet band on the ground (`aWet`), `FIELD.wet` and `FIELD.flow` near the water and `WATER.edgeAudit` in the host checks read the water the eye sees | `?fields=0`, `?mirror=probe|live` |
| `core/materials` | the library through `materials.json` (`KMAT`); four new ground slots (`ground.soil`, `ground.burn`, `ground.salt`, `ground.gravel`); card cells by `check_cells.py --fix` (leaflet and saltbush stems, the plate's one cell, the cycad frond's cell and `base: bottom`) | `?mat=proc` |
| not taken | `core/mask` (no placement raster), `core/lod` and `core/minimap` (a station page), `KFIRE` (the burn mosaic stays the kit's static `ABSAV.burn`: moving it onto `KFIRE.history` re-rolls every patch and so every plant that reads it; S6), mounds (station 2's clay ants), seasons, the river-mouth plume (no river meets a lake on the map) | |

**The build order moved** (the final rebuild's rule): `80-host-ground.js` builds the ground, the far field and the horizon after the kits; the sky, the
air and the water follow; `89z-host-build.js` (was 88) places the flora last, on the water's fields.

## 12. Open questions for the owner (each with the default the build uses)

1. **What is "the abyssal savannah"?** The model's XV is the floor's belt at 2 atm; the Aw and BSh rim slope is
   savanna on Earth's classes. **(default)** the kit is both: station 1 the rim slope (what the eastabyss sketch drew),
   station 2 the floor's belt.
2. **Station 1's site**: the gentle east rim at px ~1021,350 (the gentlest transect, a 46 km climb). **(default)**
   **Map 5.1 (2026-11-03):** the climb moved ~5 px east, so the site is px 1026,350 (-638 m, Aw, ~1,240 mm, +30 degC). On 5.1 row 350 reads
   XV at -1,256 to -1,007 m (old px 1019-1022), Aw at -879 to -493 m (1023-1028), BSh from -328 m (1029); the plan's rain figures above are 4.22's
   (`KNOWN_ISSUES.md`: 5.1 is wetter).
3. **The risers, gullies and kopjes are the page's, not the model's** (it cannot resolve them at 4 km a cell).
   **(default)** two risers and a caprock rim on the model's grade.
4. **Fire as a static mosaic**, not a moving fire. **(default)** static; a fire model and the people who burn are S6.
5. **The new cast** (tongue tree, stub lycopsid, ember cycad, kopje fig, pan-grass, saltbush, ember lily) on a
   Permian-upland theme next to the Carboniferous swamp. **(default)** as section 5.
6. **Fauna**: none drawn; grazers and the frilled lizard go to `kits/fauna`. **(default)** deferred.
7. **The jungle at the foot is eastabyss's**, read in place, so its species climb out of the abyss into this kit.
   **(default)** yes; the floor's own species stay in eastabyss.
8. **eastabyss's savannah zone**: reading this kit in place moves every plant eastabyss places after its savannah passes
   (its trees and its floor are each one random stream, the savannah's draws in their middle). **(default)** eastabyss
   is left unchanged; the hookup is S5, done when eastabyss is next re-baselined.
9. **The lake hue**: the Vain fronds stay purple; the blooms and the jungle's accents take eastabyss's lake hue (0, red,
   Locus's lake). **(default)** 0.
10. **Crops**: `thatch-grass`, `umbrella-gum`, `stub-cone`. **(default)** as section 9.

## 13. Order of work

- **S0** (done): the survey (section 1), this plan, the texture prompts (section 10).
- **S1** (done): station 1's ground: the profile, risers, rim, gullies, kopjes, the pan; the fields; the far country.
- **S2** (done): the species and the zones; the eastabyss jungle read in place at the foot and in the gullies.
- **S3** (done): the burn mosaic and what reads it; the floor (grasses, Vain fronds, rosettes, forbs, lilies, charred stems).
- **S4** (done): water on `core/water`; the shared sky; `verify.py --assert` on the GPU; `check_core_use`; the docs.
- **S5**: eastabyss's savannah zone reads this kit in place (its passes 9 and 17's savannah share and its floor's
  `plantSav` call `ABSAV.grow`), with eastabyss's baseline rewritten on purpose; the crops entries (section 9).
- **S6**: a fire model (fronts that move with the wind, smoke, people who set them), on `core/atmos` weather.
- **S7**: the ground on KLAND (the scale model's own heights) when it reaches this checkout.
- **S8**: stations 2 (the floor's belt) and 3 (the bench's edge, with ebadlands read in place); fauna from `kits/fauna`.
- **S9**: the gallery (a new biome), `PORT.md` audited by `tools/audit_port.py`, the index.

## 14. The savannah rims (from PLAN-LANDS J4-J6)

The owner (2026-11-08, `biomes/hyperjungle/PLAN-LANDS.md` section 14, answer 1): no new kit; the savannah rims go to this kit (the scale
model's `extract_region.py` already maps `e savannah rim` and `se savannah rim` to abyssal-savannah). A cloud session had built them as a
kit of their own, `biomes/savannarim` (J4-J6, 2026-11-08); it was folded in here the same day, page for page (each station page differs
from its savannarim page only in the edit layer's key). The plan for the rims is PLAN-LANDS.md (sections 1, 4, 5, 9 to 13): one base
for the three monsoon savannahs, 0.6 to 1 km above the hyperjungle's floor at 1.7-1.9 atm, each land re-tinting and re-weighting it.

| Station | Page | Where | What |
|---|---|---|---|
| 1 `serim` | `dist/abyssal-savannah-serim.html` | the se rim, between Talia (px 801,609) and the laterite, ~1,290 mm, Aw/Am/Cfa, 1.68 atm | the incense country: the Bowl's cousins (rain dragon, rain rose, rain bottle), incense, cloud avocado, the leaning tree fern (H4), the rust miombo and its copper flush (H7; read by Godstep's redlands) |
| 2 `erim` | `dist/abyssal-savannah-erim.html` | the e rim near Fridon (px 755,601), ~1,490 mm, Am/Aw, 1.77 atm | the old lines: seven cousins by BIO.kin of eastabyss's and the e highlands' builders, the pull toward the giant fading west (H4), the savage land's comb tree and elephant ear by reach |
| 3 `north` | `dist/abyssal-savannah-north.html` | hyperjungle N's XV/Aw/BSh part, east of the Hexahedron (px 555,338), ~1,035 mm, 1.88 atm | the blind grass under the bone giants, bloodwood at the jungle's edge |

```
python3 tools/build.py biomes/abyssal-savannah --station serim    # station 1
python3 tools/build.py biomes/abyssal-savannah --station erim     # station 2
python3 tools/build.py biomes/abyssal-savannah --station north    # station 3
```

**Layout.** `build.py` `build_station()`: `src/rim/` is the rims' shared base (the main page never reads it), `stations/<name>/` adds a
station's own fragments (a name in both is the station's) and its `station.json` (`out`, `note`, `neigh`; `core`, `kits` and `paths` as
the crater-drylands pattern has them). Every station has its own land, `44l-host-land.js` (the map and its weights, fires, views and
checks as one record); `erim` has its own passes, `87e-host-own.js` (`src/rim/87e-host-own.js` is the se rim's and does nothing on
another land).

- **One stage for every land.** `src/rim/45-host-stage.js` draws the map from `LAND`: the rise, the river, the forest's edge, kopjes,
  laterite, dambos, the fires. `src/rim/87-host-land.js` places the base on it, and a land's own species in its `landOwn` (87e).
- **The rims' kit** (`src/rim/50`, `52`, `55`, `56`, `60`, `70`: `SAVRIM`, registry, tags and pack key `savannarim`): the species
  records, the builders (`SAVRIM.<key>.make/grow`, `SAVRIM.builders`, `BIO.kitBuilder('savannarim', key)`) and the grass passes
  (`SAVRIM.grass`, `SAVRIM.blindGrass`). The hyperjungle's station `north` reads `src/rim/50`, `55` and `60` and the `blind` and `grass`
  families in place for its gaps (`biomes/hyperjungle/build.py` HOMES). The key was kept so that page, the records' kit ids and Godstep's
  `kitBuilder` call did not move; renaming it is a later, deliberate change.
- **The neighbours are read in place**, never copied (`build_station()` NEIGH): the hyperjungle on every page (its globals 41, its six
  hypertrees for the gallery forest and the outliers, its lands' builders: the bone giants, the bloodwood, the comb tree, the elephant
  ear), and per station the cousins' kits (`neigh`: serim sedesert and crater-drylands, erim eastabyss and ehighlands).
- **Textures.** The rims' families are in this kit's `materials.json` and `tex/` (`build.py` `RIM_PACK`: grass, blind, fan, palmbark,
  termite, incensebark), packed under the key `savannarim` on the station pages and left out of the main page; the rims take this kit's
  `groundDetail` as it is (the same set, ground.savanna.litter, with the same settings).
- Switches: `?land=0` (none of the land's passes), `?fire=0`, `?season=0`, `?kground=0`, `?far=0`, `?hz=0`, `?groundtint=0`;
  `?shadow=1` turns the sun's shadows on.

### Core adoption (PLAN-LANDS.md section 12)

Started from the nearest finished kit, **crater-drylands** (its `build.py`: the core list, the station pattern with `station.json`, the
full core/host interface), and for the host fragments from the **hyperjungle's savanna station** (the nearest finished savannah: its
stage, river, burn mosaic and mounds).

| Module | Taken | Where |
|---|---|---|
| core/biome | 10, 20, 30, 31b, 31j, 32 (kin), 33 (fung, for the hyperjungle read in place), 34, **38 KFIRE (H3)**, **39 the lean (H4)**, 40 (reach), 41, 42-44; **30s the copper flush (H7)** | `build_station()` CORE_BIOME |
| core/rand | every placement a `KRAND.hash(world, i, j, salt)` lattice cell; the builders' numbers from `KRAND.hash(seed, k, salt)` | 55, 60, 87 |
| core/mask | no canvas read for placement (the ground's paint is drawn, never read back) | 45 |
| core/tags | `BIO.init({tags:'savannarim'})`; every tree, grove and landform `REGISTER`ed before the bake draws it | 87 |
| core/space | the river's spans, the land's keep-clear (`KSPACE`) | 45, 87 |
| core/terrain | 37 **KSTACKS.mounds (H10)**, 43 KGROUND, 44 KFAR, 45 KHORIZON | 45, 83, 87 |
| core/water | the river (`WATER.flow`), wet ground and hollows | 89w, 89a |
| core/atmos | the shared sky at the land's place, the wind, the weather, height fog, rain cover, the air's load | 89, 89a |
| core/clock | **the season (H7)**: `BIO.bindSeason` (the grass bleaches, the monsoon kapoks drop); the flush (`21-core-clock-flush`) | 99 |
| core/hazard | the air's dust reaches the walker (KHAZ) | 89a |
| core/shadow | KSHADOW, off by default | 88 |
| core/host | `khost.FULL` (the whole interface) | `build_station()` |
| core/materials | `materials.json`, `tools/textures/pack.py` -> `tex/` | 50, 45, 87 |

### Order (PLAN-LANDS.md section 13)

| Step | What | Page |
|---|---|---|
| J4 (2026-11-08) | the base (red oat grass, blind grass, fan palm, umbrella thorn; gallery forest, kapok and baobab outliers read in place; KFIRE, mounds, seasons) and the north savannah | `north` (and the base on the se rim's map, `serim`) |
| J5 (2026-11-08) | the e rim (H4 lands here) | `erim` |
| J6 (2026-11-08) | the se rim (the rust miombo defined here, read by Godstep's redlands; the red guyed stalk Godstep's) | `serim` |
| fold-in (2026-11-08) | `biomes/savannarim` folded into this kit as stations `serim`, `erim`, `north` | the three above |
