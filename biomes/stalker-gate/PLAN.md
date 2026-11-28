# stalker-gate: the plan (proposal, 2026-11-25)

**The Stalker Gate** (`Region 102`, the model's biome polygon **`Stalker Gate`, id `rmvstalkergate`**): the four-way
transtensional graben pass network cut through the +14,000 m Stalker Massif, and the one breathable road between the Yuni
Emirate, the Stalker Range (Hub 01), the Loom Chasms, the Slabfields and the Siphon Pits. The idea in one line: **a country
whose floors are kinder than the sea and whose walls kill you in an hour** - graben troughs at +1,680 to +2,450 m and 1.08
to 1.30 atm, air *denser* than sea level, threaded between +6,000 m basalt horsts where it falls under 0.6 atm. Everything
alive here lives in the bottom four hundred metres of a slot, and everything that moves through it is moving through on its
way somewhere else.

Status: **a proposal for the owner.** Nothing on the scale model is changed; `LORE.md` is untouched. Every lore or model
change this plan would want is marked *proposed* with its wording. Section 11 lists what is built so far.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/stalker-gate/` (`src/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `KNOWN_ISSUES.md`, `PORT.md`, `INDEX.md`, `tests/`) |
| Pages | **its own, one per station** (`python3 tools/build.py biomes/stalker-gate --station <name>`), on the pattern `biomes/korona` set and `biomes/seouterwall` follows. Section 5 proposes four |
| Region on the model | the existing polygon `rmvstalkergate`, px 1333-1554 x 1093-1422. **No height, rain, river or polygon change is proposed**: the graben floors the brief describes are already in the model (section 1) |
| Object | `SGATE` (`SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `zone`, `dress`, `shear`) on the `BIOME-API.md` contract |
| Core | `biome`, `rand`, `tags`, `space`, `hazard`, `host`, `atmos`, `water`, `terrain`, `drawn`, `clock`, `materials`, `export`; section 2 |
| Read in place | `biomes/outlands`, `biomes/ehighlands`, `biomes/nwouterwall`, `biomes/wouterwall` (the neighbours' alpine and cold-steppe flora), `biomes/geyser` (Lake Vapora's thermal water, as the Steampits' and Korona's stations read it), `kits/fauna`, `kits/resources` |
| Out of scope | the Rangers' HQ and any settlement as buildings (`sz85a8i5js` at px 1420,1242 stands on Vapora's shore: a settlement's job, published here as a site); the animals' models (`kits/fauna`); the ore nodes' data (`kits/resources`); the Stalkers themselves (`kits/mechs` has two) |

`biomes/README.md` gets one row. The kit takes the survey's checks from its first commit (`tools/checks_optin.json` under
`recorded`, `minset`, `samplers`, `drawn-ground`, `names`), and its `build.py` and `verify.py` start from `tools/new_build/`.

## 1. Where it is, measured (scale model 5.1)

Surveyed over the polygon (32,338 px = **129,000 km²**), and cross-checked against the model's own generator
(`tools/scale-model/smodel/se_provinces.py`, `build_stalker_gate_terrain`), which is the ground truth for what the
rasters hold:

| | |
|---|---|
| Elevation | **1,783 to 9,837 m**, median **4,057 m**; 84 % over 3,000 m, 26 % over 5,000 m, only 3 % over 8,000 m |
| The low line | row by row **1,783 to 3,939 m**, mostly between **1,850 and 2,900 m**: the graben floors are really there, and a trail can follow them end to end |
| Rain | median **251 mm**, p95 345, max 612 |
| Temperature | median **+3 °C**, min -36, max +24 |
| Water | 116 px at levels **1,910 to 2,460 m** |
| Air | 1.08-1.30 atm on the floors; under 0.6 atm (lethal) on the +6,000 m horsts |
| Climate | `BSk` / `Csb` on the eastern descents (adiabatic foehn warming), `ET` upward |

Far more habitable than its neighbour the `stalker range` (median 7,794 m, 0 mm rain), which is the point: the Gate is
the only way through, and everyone knows it.

**The two waters, settled from the model's own source** (`se_provinces.py`): **Lake Vapora is at +1,910 m**, in the
central Gatehouse pull-apart basin, and **Gate Tarn at +2,460 m**, in the north col. The sound brief
(`biomes/NEW-BIOMES-SOUND-DESIGN-BRIEF.md` section 4) puts "Lake Vapora geothermal caldera" at **+2,180 m**, which is
neither; the Rangers' HQ (`sz85a8i5js`, px 1420,1242, +1,982 m) stands on the shore of the 1,910 m body, which settles
which one is Vapora. **This plan uses the model's numbers** and asks the owner to let the brief's 2,180 m go
(section 12, question 1). The horsts between the passes run +4,400 to +6,800 m.

## 2. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

`README.md`'s "CORE MODULES ARE NOT OPTIONAL" table, read for a biome kit of this kind, and `tools/check_core_use.py`
run before the kit is called done. What it takes, and for each thing not taken, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `buildlib.CORE_BIOME_MIN` (item 26: `10-core-head`, `20-core-kit`, `30-core-foliage`, `40-core-place`, and what the minset rule names), plus `31b-core-leafset`, `32-core-variants`, `33-core-fungoid`, `34-core-impostor` (the far talus and krummholz), `35-core-anim` (the gale's sway), `39-core-lean` (everything leans off the wind), `41-core-env`, `42`/`43-core-export(-host)`, `44-core-stage` | every species on the core's builders; `BIO.kit('stalker-gate')`; `BIO.kin` to the outer-wall kits' cousins |
| `core/rand` | `KRAND` | every field, scree run, boulder and plant cell from `KRAND.hash(world, ix, iz, salt)`. No `Math.sin` hash, no draw order |
| `core/tags` | `50`, `52`, `53` | every plant, boulder, vent, pool and hazard a record, registered **before** it is drawn (`BIO.init({tags})`) |
| `core/space` | `KSPACE` | the keep-clear between boulders, krummholz and the trail; the nearest-vent index Vapora's steam and hazards read. **Never a second spatial hash** |
| `core/hazard` | `KHAZ` (`20-core-hazard.js`, `21-core-hazard-flow.js`) | the wind corridor's `wind` and `fall`, the scree slide's `slide`, the thin air over the horsts (`cold` and the air rule), Vapora's `heat` and its `gas` (CO₂/H₂S pooling in the steam hollows) |
| `core/clock` | `KCLOCK` | the day, so the foehn and the katabatic have their hours |
| `core/terrain` | `30-core-field` + brush, `35-core-strata` + host shade (the horsts' basalt colonnade), `37-core-stacks` (`fin` and `spire` on the arêtes; the razorback needles), `38-core-relief` (`talus`, `pavement`, the scree chutes), `39-core-cavern` (`trench` for the slots), `42-core-frost` (frost-wedging, patterned ground), `43-core-ground` (`KGROUND` layers), `44-core-farfield` + draw, `45-core-horizon` + shade | the defiles, the horsts, the scree, the far massif |
| `core/drawn` | `10-core-drawn.js`, `KDRAWN.add(KDRAWN.grid(...))` | so the audits measure the **drawn** ground, not the sampled one (`tools/new_build/README.md` item 7) |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, the shared sky at each station's pressure, `bindWeather`, height fog (`fogPool`: the steam over Vapora), `3-particles` (steam), `3d-dust`, snow cover, `fx/89-atmos-fx-katabatic.js` and `fx/89-atmos-fx-slopewind.js` (the corridor's wind is the brief's whole first sub-zone) | the sky, the gale, the steam, the light |
| `core/water` | `20`, `21`, `22`, `50`, `51`, `geyser/52` + draw (`WATER.spring`: the hot springs' temperature ramp), `ext/53` + draw (sinter terraces), `ext/54` + draw (the ice kind on Gate Tarn), `ext/57` (the audit) | Lake Vapora, Gate Tarn, the springs |
| `core/host` | `FULL` | the page shell, probe and inspector |
| `core/materials` | `record` (`KMAT`) and the generated pack (`materials.json`, `tools/textures/pack.py biomes/stalker-gate`) | section 9 |
| `core/export` | `07`, `09` | the krator-world container and the hazards section |
| `core/world` | a **style and palette row** for `stalker gate` in `41-world-fields.js` (section 3) | the open world draws this ground when no station is loaded |

**Not taken, and why:** `core/mask` (nothing is placed from a canvas; placement is `KRAND` by cell); `core/city`,
`core/hamlet`, `core/camp`, `core/simulation`, `core/furnish` (nobody lives here: the Rangers' HQ and the relay stations
are **sites published as plain data**, the way `biomes/swhighlands`' pillar rim publishes `SWHI_PILLARS_SITE` and
`biomes/gills` publishes its field's); `core/lod` (the biome core's runtime LOD covers it); `core/engine`, `core/catalog`,
`core/interiors` (no buildings); `33b-core-bamboo`, `36-core-walker`, `37-core-traps` (no carnivorous plants);
`38-core-fire`, `46-core-lava` (nothing burns and nothing erupts: Vapora is hydrothermal, not magmatic at the surface);
`core/coast` (an inland tarn and a caldera lake, not a coastline); `core/ruins` **unless** a station draws a collapsed
relay shelter, and then `KRUINS.watch` on it, as the rule says.

## 3. The ground style and palette (`core/world`)

`core/world/41-world-fields.js` keys `BIOME_STYLE` by the overlay's lower-cased name and **an overlay not listed takes
`desert`** (its line 60). `stalker gate` is not listed, so the open world currently paints this alpine graben country as
south-eastern desert. It wants its own row:

- `BIOME_STYLE['stalker gate'] = 'shear'`, a new `STYLES.shear` and `PAL.shear`: high `ridge` and `rock` (the horsts and
  the sheer slots), `terr` low (no terraces: these are fault blocks, not benches), `dune` 0, `gully` high (the scree
  chutes), `wallK` low (a graben wall leans very little per metre down), `step` large.
- The palette is the brief's: blue-black basalt, grey-green weathered faces, pale frost-shattered talus, and the white of
  steam and rime round Vapora.
- `stalker range` (median 7,794 m, no rain) keeps `highland`, or takes a bare `horst` row later; that is the owner's call
  (section 12, question 3), and it is **not** changed here.

The brief this kit was started from says `stalker gate` resolves to `dryland`/`outlands` and that
`node core/world/test-world-styles.js` reads every name the model can produce. Neither is so on `main`: the fallback is
`desert`, and **there is no `core/world/test-world-styles.js`** (`core/world` holds `test-town-water.js` and
`test-tubes.js` only). So this kit brings its own node test for the row (`tests/test-sgate-style.js` on `tools/ktest.js`),
and section 12 question 4 asks whether a styles test for every overlay name is wanted in `core/world`.

## 4. The country, and what it is for

Four things make this place, and every station is one of them:

1. **The shear.** Transtensional graben: the passes are not valleys cut by water but slots pulled open by strike-slip,
   so they are straight-walled, 300 m wide, and they *meander in plan while staying flat in profile* - the brief's
   "snaky defiles". The model's generator makes them with domain-warped spline curves and pinch-and-swell widths, and the
   kit reads that shape rather than inventing one.
2. **The wind.** A pressure gradient across a 14 km massif with four open doors: the corridor blows, always. Venturi
   acceleration through the pinches, roaring downdrafts off the headwalls, foehn warming on the eastern descents (`Csb`
   where the rain shadow and the warming meet). The wind is the kit's clock the way the breath is the Gills'.
3. **The cold shatter.** Freeze-thaw on basalt at this altitude is violent: frost-wedging cracks go off like gunshots,
   scree slides start themselves, and the talus underfoot is angular and unstable. Nothing here is rounded.
4. **Vapora.** A geothermal caldera lake at +1,910 m under perpetual white steam, warm and wet inside a country that is
   freezing: the one place in the Gate where a body can be warm, which is why the Rangers put their HQ on its shore.

## 5. The stations (four proposed)

| Station | Page | Where | What |
|---|---|---|---|
| `defiles` | `stalker-gate-defiles.html` | a 300 m slot in the central pass network, floor ~+2,200 m, 1.22 atm | **The Snaky Defiles**: the slot meandering out of sight both ways, sheer blue-black basalt walls with colonnade tiers, the gale shrieking through a pinch, angular talus fans spilling from the chutes, a scree slide let go on the wind, krummholz and cushion plants in the lee pockets. The caravan relay trail down the middle |
| `vapora` | `stalker-gate-vapora.html` | Lake Vapora, +1,910 m, px ~1421,1236 | **Lake Vapora**: the caldera lake under its steam lid, sinter terraces and surging hot springs round the rim, the warm wet air against the freezing wind above, rime on everything outside the steam's reach, the Rangers' HQ site on the shore (published, not built) |
| `gatehouse` | `stalker-gate-gatehouse.html` | the four-way junction above Vapora, ~+2,450 m | **The Gatehouse**: where the four passes meet - the one place the whole network is legible, each door a different country's weather coming through it, the relay station's site, and the horsts standing +4,000 m over the junction |
| `northcol` | `stalker-gate-northcol.html` | Gate Tarn, +2,460 m, the north col toward Hub 01 | **The North Col and Gate Tarn**: the high cold end, a frozen-edged tarn in a pull-apart, the air thinning toward the lethal line, frost-wedged needle fields, the Stalker Range's wall beyond |

The brief's four-way junction is why `gatehouse` exists: it is the station that explains the region.

## 6. The flora

Native and Earth-stock both, as the neighbours have it; **read in place** from `biomes/outlands`, `biomes/ehighlands`,
`biomes/nwouterwall` and `biomes/wouterwall` for the cold-steppe and alpine cousins, with the Gate's own answers to the
wind and the shatter (working names; each a `BIO.kin` of a neighbour's where it has one):

| Key | Name | Where | What it is |
|---|---|---|---|
| `shearmoss` | **Shear cushion** | the slot floors and lee pockets | a hard siliceous cushion that grows only in the wind shadow of a boulder, so the floor is dotted wherever something stands |
| `slotgrass` | **Venturi grass** | the pinches | a tussock whose blades are stiff and triangular in section, which hums in the gale: the brief's venturi whistle given a body |
| `screeweed` | **Scree weed** | the live talus | a runner that re-roots as the scree moves under it, the only thing on an unstable fan |
| `krumm` | **Gate krummholz** | the lee of every headwall, to about +2,900 m | wind-trained woody scrub, all growth downwind, flagged and ground-hugging |
| `rimefern` | **Rime fern** | the edge of Vapora's steam | lives on the condensate line where warm wet meets freezing air, white with rime half the day |
| `sintermat` | **Sinter mat** | Vapora's terraces and spring run-off | a thermal mat banded by temperature, as the geyser kit's are (read its banding in place) |
| `frostlichen` | **Frost lichen** | the horsts, to the lethal line | the last thing upward; the transect's top, as the Gills' ice pipes are theirs |

`kits/crops`: a `stalker-gate` zone and the two or three things a caravan could actually eat or trade from here; nothing
is farmed.

## 7. Fauna (`kits/fauna`), named here and built there

| Key | Name | What it does |
|---|---|---|
| `scree_runner` | Scree runner | a hexapod that rides a moving fan deliberately, the way a bird rides a thermal |
| `slot_glider` | Slot glider | holds station in the venturi on fixed wings and never flaps inside the pass |
| `vapora_wader` | Vapora wader | works the warm shallows under the steam, the only animal that is warm here |

The **Stalkers** themselves (`kits/mechs`, two walkers) pass through: the brief's "Stalker Reconnaissance Triads" in the
neighbouring `seouterwall` plan (its section 2.5) are the same creatures, and the Gate is their door. They are drawn from
the mechs bundle, never modelled here.

## 8. Hazards (`core/hazard`), each a `core/tags` record before it is drawn

The wind corridor (`wind`, strongest at the pinches, cycled on the day's foehn hours), a headwall's **scree slide**
(`slide`, set off by the wind above a threshold), **frost-wedge rockfall** (`fall`, under every sheer face), the **thin
air** over the horsts (`cold` plus the air rule: under 0.6 atm is lethal and the page must say so), Vapora's **heat** at
the springs and its **gas** pooling in the steam hollows, and **unstable talus** underfoot (`move`, a slowing).

## 9. Textures

Read `core/materials/PLAN.md` first. **Reuse**: `rock.basalt.flowbanded`, `rock.columnar`, `rock.megabreccia`,
`ground.talus`, `ground.scree`, `ground.puna`, `ground.tundra`, `ground.snow011`, `ground.snow.drift`, `surface.cushion`,
`card.ichu`, `ground.travertine.white`, `stone.geyserite`, `ground.sinter`, `ice.aufeis`, `ice.clear`,
`organic.lichen.plates`, `ground.turf.polygon`. **To source or generate** (into `core/materials/PROMPTS-NEEDED.md` with
paste-ready prompts, never a procedural stand-in without saying so): `rock.basalt.frostshatter` (angular frost-wedged
basalt talus, the kit's commonest surface), `card.krummholz` (wind-flagged scrub cut-out), `card.slotgrass` (stiff
triangular tussock), `ground.rime.crust` (rime-frosted mineral crust at the steam line).

## 10. Order of work

- **S0.** The owner's answers to section 12, and this plan's Core adoption agreed.
- **S1.** The kit's skeleton from `tools/new_build/`, listed in `tools/checks_optin.json`; the `core/world` style and
  palette row with its node test; `BIOME-API.md`, `PORT.md`.
- **S2.** The ground: the defile's shape read from the model, the horsts, the scree chutes and talus, `KDRAWN` on the
  drawn cells; the `defiles` station standing up with nothing growing on it yet.
- **S3.** The flora and its two dresses (wind-shadow and open), the keep-clear on `KSPACE`, the far field.
- **S4.** The wind: `fx/katabatic` and `fx/slopewind` bound, the gale's sway on `35-core-anim`, the hazards on the clock.
- **S5.** `vapora` (the water, the steam lid on `fogPool`, the springs on `WATER.spring`, the sinter), then `gatehouse`
  and `northcol`; the Rangers' HQ and relay sites published as data.
- **S6.** `verify.py --assert` on each station with the probe's invariants, each check with a negative; `PORT.md`, the
  index tools, `tools/check_core_use.py`, `tools/check_port.py`, `python3 tools/port_baseline.py`, the gallery row.
- **S7.** `kits/fauna` (the three above), `kits/crops` (the zone), `kits/resources` (any nodes the owner wants).

## 11. What is built so far

**Nothing but this plan.** The kit's folder holds `PLAN.md` only. S1 onward is unstarted, and the four stations are
proposals, not pages. The session that wrote this built `biomes/catch --station gills-candles` first, which was the
blocking item.

## 12. Open questions for the owner

1. **Lake Vapora's height.** The model and its generator say **+1,910 m** (with Gate Tarn at +2,460 m); the sound brief
   says +2,180 m. This plan follows the model. Is that right, or should the model move?
2. **The brief's +2,180 m caldera** may have been meant as a *third* feature (a hanging geothermal bowl between Vapora and
   the col) rather than an error. If the owner wants it, it is a fifth station and a small model change.
3. **`stalker range`** currently takes `highland`. At a 7,794 m median with no rain it is nearer bare rock. Give it its
   own row, or leave it?
4. **A styles test in `core/world`.** There is no test that every overlay name the model can produce has a `BIOME_STYLE`
   row; names fall back to `desert` silently, which is how this one went unnoticed. Worth adding one for every overlay?
5. **Who holds the Gate?** Four powers meet here and nobody is named as holding it. The Rangers' HQ on Vapora's shore
   implies someone patrols it. Is it the Yuni Emirate's, Hub 01's, shared, or deliberately nobody's?
6. **The Stalkers.** `seouterwall` has reconnaissance triads east of X 1200; the Gate is the door they would use. Do they
   range through it, and does anything live here that is afraid of them?
