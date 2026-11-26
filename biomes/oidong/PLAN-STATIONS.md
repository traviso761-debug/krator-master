# oidong: the stations (plan 2026-10-23; built in the rebuild turn, pair 6, 2026-11-03)

The kit draws the Oidong Valley's floor: the serene pools, moss woods and blossom meadows. About 70% of its polygon is the
**very dry high country round the valley**. Three pages: the valley floor (station 1, `dist/oidong.html`), the high passes
(station 2, `--station passes`) and the Cold Hearths (station 3, `--station hearths`, `biomes/hearths/PLAN.md` section 11).

## The ground on scale model 5.1 (re-surveyed 2026-11-03)

`tools/scale-model/model/data` (5.1, canvas 1821 x 1723, 2 km a pixel); px here are 5.1's (old canvas = minus 272, 330).
Gemini's Round 2 (`smodel/tranche3_biomes.py`, 2C) sculpted "a 4-stepped U-shaped mirror-pool floor (+2,800..+3,400 m) below
a +300 m eastern headwall cataract, flanked by smooth south-wall piedmont gravel fans". **What landed is not quite that:**
the steps are blended at 78% only where there is no water (`~whas`), so along the axis (px 1034-1184, py 1588-1608) the
model shows **a chain of lakes stepping up east** (1,768 m at px 1030; 1,901, 1,909, 1,916, 1,922-1,938, 1,957-1,994 and
2,008-2,017 m by px 1144) with **benches of 2,500-2,990 m beside them** on the south side (the steps' heights, laid next to
the water), and the headwall (px 1177-1194) falls in the big lake at 2,000 m (WH), so it did not land at all. Rain fell
from 329 to 188 mm at the floor, as `STATIONS-MAP-5.1.md` says.

| Where | px (5.1) | Height | Rain | Mean (warm/cold) | Class |
|---|---|---|---|---|---|
| The valley floor (station 1's ground) | 1080,1595 | 1,895-1,935 m (the lakes 1,901-1,938) | 173-188 mm | +11 (18/4), night -2 | Cfb |
| Longsong (on the apron south of the east lake) | 1226,1626 | 2,076 m | 988 mm | +11 (23/-1) | Csa |
| The south benches beside the lakes | 1122-1142,1600 | 2,800-2,990 m | 125-141 mm | +5 (17/-7) | BSk, BWk |
| The passes' shelf (station 2) | 1212,1637 | 5,091 m (30 km relief 2.4 km) | 141 mm | -8 (6/-20), night -30 | ET |
| The Cold Hearths' vent (station 3) | 1186,1591 | 4,333 m (relief 3.2 km) | 110 mm | -3 (10/-16), night -25 | Dsc |
| The lower vent | 1097,1583 | 3,322 m | 157 mm | +4 (15/-7) | Dfc |

**What the pages take** (each page is a 5.2 km ideal type, under three model pixels, so it takes the numbers, not the pixels):
- **Station 1:** the floor at **1,890 m** (was 1,580: the old page followed the 4.23 survey's ~1.6 km), **four steps** with
  one pool on each and an 11 m riser between (the model's chain of lakes; at the page's scale its steps are 7-20 m), and the
  **300 m headwall** with its cataract at the head (Gemini's intent and the task's; the model's own pixel lost it to the lake).
  Rain 188 mm: the weather is `cold`, neither wet nor dry; the valley is semi-arid, its pools fed by the cataract and kept open
  by the north rim's vents (`biomes/hearths/PLAN.md`, canon 2026-11-02). Longsong's rock stays where the page had it.
- **Station 2:** the passes' shelf at 5,050 m.
- **Station 3:** the Cold Hearths at 4,330 m.

## Station 2: the high passes (`--station passes`, `dist/oidong-passes.html`)

A Tibetan cold desert above the valley: a gravel shelf at 5,050 m on the valley's south wall (6 km south of Longsong, 3 km
above it), crossed west to east by the pilgrims' road through a saddle between two knobs of shattered granite; **cairns** at
the saddle and along the road, two **prayer-stone walls** the road parts round; bare gravel with **desert pavement**
(KGROUND `clast`), **sorted stone polygons** in the frost hollows (KGROUND `polygon`), scree and talus under the steeps
(KGROUND `clast` in 3D cells, and the scree stones placed on the same rock mask); **cushion plants**, the **snow lotus**
among the stones, **sky poppies** only in the damp hollows and at a meltwater tarn; the edge north falling to the valley and
the heights south rising to snow (the far field). No tree. The monastery stays on the valley floor (the owner, 2026-10-23).
`kits/crops`' `pass` zone was not added: the station grows no crop.

## Station 3: the Cold Hearths (`--station hearths`, `dist/oidong-hearths.html`)

`biomes/hearths/PLAN.md` section 11, item 3, on the passes' ground (station.json `"base": "passes"`) at the north rim's
numbers: one point vent (KTHERM, 96 degC, reach 150 m, soil -3) at the map's centre; the hearth field from
`biomes/hearths/src` read in place (`HEARTH.layout`, the narrow-fan "cold" dress): the ember mat on 60-95 degC, hearth trees
on 25-60 (about 120 m across), coal moss between, stokers at the edge laid toward the warmer ground, tallow beads, and two
rings of snapped, fallen dead stalks; the cold desert's cushions and snow lotus off the ground over 8 degC; the snow kept off
the warm ground (`ATMOS.snowBare` on the field's snow mask); steam on the fumaroles; the fans open by night and in an
eclipse and fold to silver by day (`HEARTH.work` into `BIO.breathState('hearths')`, the breath's `fold`). The pilgrims' road
passes south of the disc with a cairn and prayer stones at its edge; the valley falls away south.

Not built here (`biomes/hearths/PLAN.md`): the boil cups (no hot pool at this vent), the shade caps (their mixed ring is a
host forest; the Cold Hearths have none), the animals (`kits/fauna`), the hazards beyond the vent's heat record (the fissure
lows' gas, the thin ground), the presets (the page loads at day: `#hour=22` opens the fans), the textures (section 15; the
parts are vertex-shaded).

## Core adoption (the rebuild turn, 2026-11-03)

The universal set (`BACKPORT.md` section 1 and section 5) and the kit's row, on every page unless said:

| Module | Taken | Where |
|---|---|---|
| `BIO.INDEX_ITEMS`, `BIO.LOD.merge/minTris/fade/cull`, the runtime LOD tick | yes (`?index=0` `?lodmerge=0` `?lodfade=0` `?lodcull=0`) | `45-host-stage.js`, `99-host-take.js` |
| Octahedral impostors (34) | the far trees (nwlowlands' lines), `BIO.impostorLook` gain 2.6 (`?diet=0` the old blobs, `?impgain=`) | `55`, `89z` |
| Cards on their geometry | `check_cells.py --fix`: the bead strings' base, the sage card's cell; 0 faults | `materials.json`, `tex/` |
| `BIO.flareJoin` (31j) | every hero limb through `limb()`, 6+ sides at the joint; a ground-running trunk and the lattice strands not | `55` |
| The attach audit at 1% | the wisteria's racemes held to their limbs (`BIO.holdTo`; the raceme keeps its card cell), the cedar's and pagoda fir's mid tier draw their limb rods: 3.88% to 0.77% | `55` |
| `BIO.fung`, `BIO.bamboo` | listed (33, 33b); **not yet moved onto**: the moon caps, chalice caps and jade bamboo keep the kit's own geometry (a follow-up: it moves no placement but every cap's shape) | `build.py` |
| The shared sky, height fog (R1), rain cover (R10), lightning, snow that lies, `bindWeather` | yes; the climate `cold` (5.1: 188 mm) | `89a` |
| Wet ground and puddles (R9) | **off by default** (`?wet=1`): `WATER.wetGround` on this page's KGROUND Standard ground drew it black in clear weather (Arc, not traced); the valley is semi-arid | `89a`, `KNOWN_ISSUES.md` |
| `BIO.bindAtmosWind` (R8), `BIO.setA2C` (R7), `BIO.setGround` (R5) | yes | `89a`, `89z` |
| Water: W4 gradients, tall falls, no surf or breakers on still water | the pools (and the plunge pool) are `WATER.drawPools`, which draws no surf or breakers; the cataract a tall fall (`plungeR` 34, `footK` .8); breakup on the stream | `89w` |
| `WATER.mirrorSwitch` | off at load, on the Mirror (the lowest step; the others reflect its plane); station 2's tarn too | `99` |
| `KGROUND`, `KFAR`, `KHORIZON` | yes: the four library layers on their masks (moss, forest, sand, marble), the passes' pavement, polygons and talus; the far field to 14 km by `landH`; the horizon | `84`, `85` |
| `KSHADOW` (core/shadow) | yes (`?shadow=0`); cost in `KNOWN_ISSUES.md` | `89z` |
| Water as fields (ext/60), `BIO.env` (41), `WATER.edgeAudit` | yes: the wet band (`aWet`), `FIELD.wet`/`flow` from the shore, trees kept off the water by its shore (`OIDONG.SHORE`), the check | `89z`, `55`, `99` |
| The review's three lines | ground layers on documented masks (`84` heads); scour and talus feed placement on station 2 (the scree stones on the same rock mask the talus layer draws on); wet ground and flora on `WATER.fieldAt` | |
| KSTRATA (the row's "strata on the valley walls") | **dropped**: the walls are granite with marble veins, no beds | |
| The fog belt, seasonal paddy levels (the row) | not taken: the page has no fog belt (the mist is the cataract's), no paddies | |
| `BIO.kin` (the row: the five shared species) | the five are separate copies in each kit (EXCHANGES.md); xanadu's session keeps its own; nothing read across | |
| KTHERM, breath, lean, `snowBare`, KHAZ flow | station 3 (`stations/hearths/station.json`) | |
