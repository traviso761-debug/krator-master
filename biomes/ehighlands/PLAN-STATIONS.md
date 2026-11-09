# ehighlands: the two stations (plan, 2026-10-23)

Owner's decision (2026-10-23): the eastern highlands kit goes back to the eastern Inner Wall, where it began. **Station 1**
is the kit as built, on the wall's **dry** side; **station 2** is new, the **wet** face. The plateau by Korona that the
`e highlands` polygon covered on 2026-10-23 becomes a new biome, the painted highlands (`biomes/paintedhighlands/PLAN.md`).

**Status (2026-11-09): stations 1 and 2 built, and a third the owner asked for, the Lesser Throne** (the owner: "let's do 1 and 2,
also make a caldera/mountain station for lesser throne; feel free to pick appropriate sites from the world model"). The sites were
picked from scale model 5.1 by this session (E0's survey); the polygon renames in section 0 are still the owner's to make. What was
built, and where it departs from the plan below, is the section "Built" at the end.

## 0. The polygons

On the scale model the kit's ground is the polygon now called **`e inner wall`** (106,000 km², px 674-929 by 361-755).
Proposed renames (the owner's to make, or to ask for): `e inner wall` > **`e highlands`**, and the plateau's `e highlands`
> **`painted highlands`**. The wall's crest splits the two stations: each row of the polygon is cut at its highest cell.

## 1. The ground (4.21, surveyed 2026-10-23)

| | Station 1: the dry side (crest and east) | Station 2: the wet face (west) |
|---|---|---|
| Area | 56,000 km² | 50,000 km² |
| Height | median 3.4 km | 0.6 to 4.7 km |
| Rain | about 170 mm | 250 to 3,400 mm, falling with height |
| Climate | BSk 43%, Dfb 19%, BWk 9%, Dfc 9% | Dfb 45%, Cfa 21%, Dfc 17% |
| Peoples | Nomad Country (the Eastern Nomads) | the Empire of Iziz (38% of the polygon) |

**The wet face is the windward one**: air off the inner crater rises up it and drops its rain; the dry side is its
shadow. The face's belts:

| Belt | km² | Rain | Mean (warm/cold) | Air | Climate | What grows |
|---|---|---|---|---|---|---|
| Foot, under 2 km | 11k | ~2,400 mm | +17 to +22 (27-31 / 7-14) | 1.3-1.5 atm | Cfa 77%, Cwa | montane rainforest and cloud forest; the wettest ground (11,000 km² over 2,000 mm, round px 789,614 at ~1.2 km) above the se savannah rim |
| 2-3 km | 7.5k | ~940 mm | +12 (24/0) | 1.16 | Dfb, Cfa | mixed broadleaf forest |
| 3-4 km | 18.5k | ~630 mm | +6 (19/-7) | 1.02 | Dfb 80% | montane conifer and broadleaf: the largest belt |
| Over 4 km | 13.5k | ~300 mm | +1 (14/-12) | 0.91 | Dfc, ET | spruce-fir to krummholz under the crest |

Rivers off the face: Rrivar Falz (135 m³/s), Rrivar Isguifta (126), Rrivar Grin (111), Rrivar Loña (74).

## 2. Station 1: the dry side (the kit as built)

- **Re-site it on the crest's lee** (over 4.5 km: 6,500 km², ~110 mm, ET and Dsc, warm month +12, 0.86 atm), the band
  nearest the kit's cold cushion plateau. Below it the dry side is BSk steppe at 2.5-4.5 km (~200 mm), then cold desert.
- **The air note changes.** The kit was written for ~0.6 atm; the crest reads about 0.86. Nothing in the look depends on
  thin air (the cushions answer the cold, the dry and the wind), so `NOTES.md` and the kit's inspector words are
  rewritten, and the `kits/crops` entry `ehighlands` goes from `atm: 0` to `atm: 1`.
- **The geyser field** stays only if the model backs it: the polygon holds one vent (`DATA.vents`); E0 checks which side.

## 3. Station 2: the wet face (new, `dist/ehighlands-face.html`)

A forest that climbs the face, every belt still **growing toward the giant**, the kit's theme: crowns lean one way,
bracts and leaves turn to the gas giant, epiphytes and mosses grow thickest on the giant-facing side of each trunk, so
from below the forest looks combed toward one point in the sky.

- **The foot's cloud forest**: tree ferns, broadleaf evergreens heavy with moss, a cloud bank standing at the belt's top
  most mornings; the giant-facing epiphyte gardens. Own species (the kit has none for this belt).
- **The mixed belt and the montane belt**: broadleaf and conifer together; `biomes/nhighlands`' spruces and cedars read
  in place for the conifers, with a "toward the giant" lean applied; own broadleaves.
- **Under the crest**: spruce-fir thinning to krummholz, and the first cushions of station 1 coming over the crest.
- Rivers in gorges with falls down the face (the core's `waterH`, as nhighlands' stream).

## 4. Crops

`kits/crops` `ehighlands` gains a `forest` zone (warmth [1, 3], arid [3, 4]) and a `cloud` zone (warmth [2, 3], arid [4,
4], wet). One fruit, one staple and one medicine from station 2's own flora, as every newer kit (to be chosen with the
species).

## 5. Order of work

- **E0.** The owner renames the polygons (or asks); the two sites are chosen from the model; the vent checked.
- **E1.** Station 1 re-sited: the air note, the crops entry, the inspector's words; the build rebuilt and verified.
- **E2.** Station 2's ground: the belts from height and rain, the gorges.
- **E3.** Station 2's flora, with texture prompts written first (`core/materials/PROMPTS-NEEDED.md`).
- **E4.** `verify.py --assert` for both pages, `PORT.md`, the gallery (a fix to one kit republishes only its files).

## Built (2026-11-09; a cloud session: built and smoke-loaded only, the GPU verify is owed)

**E0, the survey (scale model 5.1, `tools/scale-model/model/data`; px on the 5.1 canvas, old canvas in brackets).** On 5.1 the wall is
not the 4.21 polygon's broad belts: the wet face is a scarp of listric slump terraces climbing from about -0.2 km (Am at its foot, the
inner crater's lowland) to 3.7 km across about 40 km, the crest near 4.5-5.7 km at px x 1090-1130, and the dry side falls east through
Dfc and Dsc to BSk and BWk steppe. The polygon's one vent (`DATA.vents`) is the Lesser Throne's (px 1130,854: floor 6,070 m, rim
6,880 m), on the crest itself. The giant stands at azimuth 58-61, altitude 34-35 at all three sites (`ATMOS.skyState`), not LORE's 66
and 25: each station leans its plants to its own.

| | Site (5.1 px [old]) | Height | Climate | Rain | Mean (warm/cold) | Air |
|---|---|---|---|---|---|---|
| 1, the dry side | 1133,732 [861,402]: the crest's lee | 4,968 m | BSk under ET | ~110 mm | -1 C (+12/-14) | 0.86 atm |
| 2, the wet face | 1077,754 [805,424]: the foot's cloud forest | 1,271 m (page 1.05-1.95 km) | Cfa | 4,000 mm (the model's ceiling) | +21 C (30/11) | 1.36 atm |
| 3, the Lesser Throne | 1130,854 [858,524]: the summit caldera | floor 6,070, rim 6,880 m | EF | ~110 mm | -9 C (+4/-22) | 0.75-0.68 atm |

**E1, station 1 (`dist/ehighlands.html`, the showcase): re-sited, not redrawn.** The sky's site is the crest's lee (861,402), the air
0.86 atm (the sky's preset, `EHIGH.ATM`, the page's words and `NOTES.md`), the giant at 60. The page's map is the kit as built (an ideal
type: its range in the south stands for the crest, which on the model is west and 1.4 km higher). **The geyser field is gone**: the
model does not back it on this side (section 2), its one vent is station 3's. The crops entry (`kits/crops`, `atm: 0` to `1`, and the
forest and cloud zones of section 4) is **not changed**: it reaches five other builds (Longsong, Nwouterwall and its stations, the crops
sheet), so it is left for a turn that rebuilds them (KNOWN_ISSUES.md).

**E2 and E3, station 2 (`--station face`, `dist/ehighlands-face.html`).** One belt, not four: the page is 5.2 km of the foot's cloud
forest, climbing east from about 1,050 to 1,950 m in three slump benches (a 220 m scarp every 1.4 km, each bench tilted back against the
scarp above, with sag ponds at its inner edge); a headwater of the Na'ashǫ́'ii Buruuk (r365, the Riders' tongue; it reaches the river about
18 km down) cuts a slot gorge back through each scarp and leaves each bench over a fall of about 110 m (`WATER.fallsOf`, three on the
page, one more in the ground's margin); the cloud bank stands from the second bench up (`ATMOS.fogBelt`, `?belt=0`). The flora is the
kit's own: **species 7, the combed laurel** (a moss-laden laurel, its bole leaning to the giant, its crown thrown out on that side,
epiphyte gardens and tank bromeliads on the upper, giant-facing side of every limb, old man's beard under it) and **species 8, the giant's
tree fern** (fronds longest and flattest toward the giant), on a floor of cloud ferns, cushion moss, bromeliads and mossy stones (the
`cloud` zone from the host's `forest` field). The textures were already in the library (`card.broadleaf.cloud` and
`card.epiphyte.garden`, commissioned for this belt; `card.treefern`, `card.fern`, `card.beard`, `card.bromeliad`, `card.moss`,
`bark.mossy`, `ground.moss001`): no prompt is owed. **Not built:** the belts above (the mixed broadleaf belt, the montane conifers with
nhighlands' spruces read in place, spruce-fir and krummholz under the crest); each would be a station of its own on this scarp.
(Built the same day as stations 4-6, below.)

**Station 3, the Lesser Throne (`--station lesser`, `dist/ehighlands-lesser.html`; new, not in the plan above).** The young volcano that
buried the Order of Historians' first monastery (LORE.md). The page is 8.4 km: the summit caldera (5 km across), its rim high to the
west-north-west (6,857 m) and broken to the east-south-east where the last lava left it; a young cinder cone on the floor with its own
crater; fumaroles on the cone and along the ring fault (station 1's geyser fragment, `STAGE.kettle` false: they steam, none spouts); a
small acid lake frozen under the high rim and warm acid pools by the vents; the flow out through the breach and down the flank, and on it
**the skylight of the buried archive's tube** (`tube_lesser_06`, "Entombed First Monastery Lava-Tube Vaults": a fallen roof, registered;
the vaults themselves are not drawn). A polar desert of ash, pumice and young lava (`ground.ash`, `ground.scoria`), snow on the high rim
and the shaded walls: **nothing lives but on the vents' warm ground**, where the kit's hardiest come back in rings (mat algae nearest,
then turf, cushions, woolbacks: the fumarole oases of the Andes' highest volcanoes), turned to the giant like the plateau's. The host's
`warm` field lowers `cold`, and its `barren` field zeroes every zone elsewhere (a check holds it: 'life only on the vents' warm
ground'). The Godthrone stands on the south-western horizon, 450 km off and 25 km high (a ridge in the sky's preset).

**Stations 4-6, the rest of the wet face (2026-11-09, the owner: "add another station for krummholz etc", then "do mixed broadleaf and
montane conifer stations too").** All three on station 2's transect, so the face reads as one climb: 1.05-1.95 km (station 2), 2.35-2.85
(5), 3.1-3.6 (6), 4.56-5.12 (4). They share one land generator (`src/45f-host-wallface.js`, `WALLFACE`: a face climbing east, slump
scarps with the stream falling at each lip, rocky ribs running down it with a gully between each pair, the stream in the middle one,
height belts from the station's `belts`), so each station's `46-host-land.js` is its STAGE and its numbers. One cold scale for all three
(`.6 + (h - 4800 m) x .00044`, 0 below ~3.4 km), which the fir reads for its form.

| | Site (5.1 px [old]) | Page | Climate | Rain | Mean (warm/cold) | Air | Flora |
|---|---|---|---|---|---|---|---|
| 5, the mixed belt (`--station mixed`) | 1079,755 [807,425] | 2.35-2.85 km, two benches | Cfa | ~4,000 mm | +15 C (25/4) | 1.17 | the combed beech; the last laurels and tree ferns at the bottom edge, the first firs in patches at the top; the cloud bank's top at the foot |
| 6, the montane belt (`--station montane`) | 1076,747 [804,417] | 3.1-3.6 km, one scarp | Dfb | ~2,070 mm | +9 C (21/-4) | 1.07 | fir and beech stands in a patchwork, the firs gaining with height |
| 4, the treeline (`--station treeline`) | 1105,750 [833,420] | 4.56-5.12 km, to the crest's shoulder | Dfc | ~250 mm | 0 C (13/-13) | 0.88 | the combed fir upright, flagged, then krummholz; ragbark in the gullies; an avalanche chute's meadow; cushions and woolbacks over the crest; a tarn |

**The "mixed broadleaf" belt is a rainforest on 5.1**, not the plan's ~940 mm: the model's face is wet to 3 km. The conifers are the kit's
own (species 9, **the combed fir**), not nhighlands' read in place: a lean cannot be put on another kit's finished trees (core/biome's
`BIO.leanTo` is a placement helper), and the fir's three forms (upright, flagged with its branches only on the giant side, a krummholz mat
stretched toward the giant) are the point of the treeline. The broadleaf is species 10, **the combed beech** (a southern beech: flat tiers
thrown out toward the giant). Textures from the library: `card.spruce`, `bark.spruce`, `ground.needles`, `card.broadleaf`,
`bark.birch.lichen`; no prompt owed.

