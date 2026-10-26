# Planned stations at the old biomes: a survey (2026-10-26)

The owner (2026-10-26): "look at current plans for expanded substations at old biomes and whether they would need new
core or textures". Read-only survey on `claude/biome-rebuild`. "Old" means the kits built before this rebuild's new
ones (cut, catch, farside, nwouterwall, k-guilin, abyssal-savannah); nwouterwall's station 4 and abyssal-savannah's
stations 2-3 are included because they were asked for. Sedesert's bowl, mantis and steppe are built and left out.

**What core has today** (checked in the files): `core/water` open, shore, flow, fall, still, spring/geyser
(`geyser/`), terraces (`ext/`), no ice kind; `core/terrain` field, brush, carve, KSTACKS, KRELIEF, KCAVERN, KBASIN,
KSCOUR, KFROST (`42-core-frost.js`: polygons, circles, alases, pingos, aufeis). **Not in core:** the strata module
(`core/terrain/STRATA-PLAN.md` is "plan, awaiting the owner"; `35-core-strata.js` still lives in sedesert's and
ebadlands' `src/`) and KLAND (not in this checkout). `core/atmos` has the shared sky, weather, snow cover and lava fx.
"Approved" below means `HANDOFF-REBUILD.md` section 4a (R1-R12). The section 2 table is a proposal list awaiting one
approval; its water row (ice kind, per-flow foam, rideGLSL and the rest) is **not** approved.

## The stations

| Biome: station | Plan (section) | What | Status | Core | Textures | Effort; open questions |
|---|---|---|---|---|---|---|
| **throne**: lava delta | none (memory note, agreed 2026-10-10) | an active ocean entry: new black land, laze plume, littoral cones, pumice rafts | agreed, **no plan file** | lava fx and particles exist; the laze as a hazard is **R11**; drifting pumice rafts are **new** (`WATER.rideGLSL`, section 2, not approved; static rafts avoid it) | reuse `ground.lava.crust/veins/aa`, `ground.sand.black`, `stone.pumice`, `ground.cinder`; no gap | M; needs a plan and a site |
| **throne**: blast zone | none (same note) | a St Helens flattened forest and pumice plain | agreed, **no plan file** | none (downed logs are placed records; the blast direction is a field) | reuse `wood.silver`, `bark.char`, `card.charred`, `ground.ash`, `ground.ash.ripples`, `stone.pumice`; no gap | M; needs a plan |
| **throne**: penitentes and the shoulders' cold belt | `KNOWN_ISSUES.md` "Ten stations of ten" | snow spikes below the summit; gill-coral trees among conifers in snow | listed "not yet a station" (could pair with the glacier) | penitentes want ice/snow geometry: **new** (an ice kind, not approved) or host-side like the glacier station's `86-host-glacier.js` | reuse `ground.snow011/015`, `ice.glacier`, `ice.clear`; no gap | S-M; whether it is its own page |
| **throne**: geyser field | same | the Throne's geyser ground | covered by `biomes/geyser` (a shared kit) | none | none | done elsewhere |
| **korona**: the crest road | `NOTES.md` "The high cold country" | a 4 km ring crest where the wind is the climate: yardangs, snow wool, wind-spruce krummholz, road-marks | sketched, not a numbered station | none (snow cover fx; nhighlands' spruce read in place) | reuse `rock.yardang.silt`, `ground.snow011`, `surface.fleece`/`wool.fleece` for snow wool; no gap | S-M; is it a station? |
| **eastabyss**: 2, the winding lakes | `PLAN-STATIONS.md` | a 4.21 snaky lake: mat-reed shallows and jungle to salt steppe and desert on the sills | plan, awaiting owner | none (`WATER.open` with shore, or `still` on a polygon); the shoaling limit and pad bob (section 2) would help | the kit's own sets plus `ground.salt`, `ground.efflorescence`, `ground.lakebed.*`, `ground.playa.red`; no gap | M; A0 site |
| **ebadlands**: 1-4, the transect split | `PLAN-STATIONS.md` | hot waste; canyons and green valleys; montane forest; tree line, tundra and glaciers | plan, awaiting owner | **new: the strata module** (`badland` recipe, STRATA-PLAN S2/S6); station 4's glaciers need **an ice kind** (not approved) or host ice | species exist (moved, not redrawn); station 4 reuses `ground.tundra`, `ice.glacier`, snows; no gap | L (four pages, each S-M); B0: does station 1 stay the overview? |
| **ehighlands**: 2, the wet face | `PLAN-STATIONS.md` sections 3-5 | cloud forest to krummholz climbing the windward face, combed toward the giant | plan, awaiting owner | cloud bank = **R1** height fog; falls down the face: `WATER.fall` exists, "a fall that follows a sloped face" is section 2 (not approved); the water export box (section 2) | reuse `card.treefern`, `card.fern`, `card.moss.hanging`, `bark.mossy`, `ground.moss001-003`, `card.bromeliad`, `card.orchid.dendrobium`; nhighlands' conifers in place. **Gap, no prompt:** its own broadleaves and epiphytes (E3 says prompts first) | L; E0 polygon renames, sites, the vent |
| **hyperjungle**: 2, the savanna edge | `PLAN-STATIONS.md` | monsoon forest, gallery forest, tall-grass savanna, termite cities, a burn front | plan, awaiting owner | none (static burn, as abyssal-savannah) | reuse `card.grass.dry`, `card.ichu`, `ground.burn`, `card.charred`, `ground.redsoil`, `card.acacia`, `earth.banco` for mounds; **owed with prompts** (section 24): `card.grass.thatch`, `ground.savanna.litter`. **Gap, no prompt:** a dry-season deciduous leaf card if the monsoon forest is drawn bare | M-L; J0 site; overlaps abyssal-savannah (read it in place?) |
| **hyperjungle**: 3, the lake and flooded forest | same | várzea and igapó, stilt and buttress roots, floating meadows, black water, high and low water on the clock | plan, awaiting owner | **new: a seasonal water level** on the world clock (a lake whose level and wet line move); floating meadows want `rideGLSL` (section 2, not approved) | reuse `ground.lilypond`, `card.giantpad`, `card.lotus`, `card.reed`, `ground.brown_mud_02`, `rock.wet.dark`; no gap | L |
| **necanyons**: 2, the high benches | `PLAN-STATIONS.md` | benches and tepui-like tables, flametip scrub, sun pitchers on top | plan, awaiting owner | none with KSTACKS; the strata `tepui` recipe is optional (**new**, unapproved) | reuse `rock.quartzite.tepui`, `rock.sandstone.bedded.red`, `card.flametip`, the kit's pitchers; no gap | M; C0 sites |
| **necanyons**: 3, the savanna floor | same | abyssal savanna and salt steppe, sandstone stacks, salt pans, Korona's trench country on the horizon | plan, awaiting owner | none (KSTACKS) | reuse `ground.salt`, `card.carnivore.monkeycup`, abyssal-savannah's sets in place; no gap | M |
| **nhighlands**: 2, dry-summer montane | `PLAN-STATIONS.md` | park-like pine and fir over grass, giant red-barked trees, black oaks, corn lilies, granite domes, fire mosaic | plan, awaiting owner | none (crater-drylands' fire model read in place; domes from relief) | reuse `card.pine`, `bark.ponderosa`, `bark.cedar.red`, `rock.granite.tor`, `card.grass.dry`. **Gap, no prompt:** corn lily card, black-oak leaf (unless swlowlands' oak serves) | L; N0 sites and prompts |
| **nhighlands**: 3, Mediterranean foothills | same | oak savanna on golden grass, chaparral, sycamore creek | plan, awaiting owner | none | swlowlands' oaks and cork in place; `card.grass.dry`, `card.sage`, `card.heath`, `card.broom`, `bark.alder.lichen`. **Gap, no prompt:** a sycamore/plane bark (none in the library) | M |
| **nhighlands**: 4, the alpine | same | tree-line pines, fell-field, talus, snowbeds, a tarn | plan, awaiting owner | none (KFROST, snow cover fx, `WATER.still`) | ebadlands' bristlecones in place; `ground.tundra`, `ground.lichen.crust`, snows; no gap | S-M |
| **oidong**: 2, the high passes | `PLAN-STATIONS.md` | Tibetan cold desert above Longsong: scree, cushions, snow lotus, cairns and prayer stones | plan, awaiting owner | none (KFROST optional) | reuse `ground.puna`, `ground.gravel019/042`, `surface.cushion`, snows, `stone.chiselled`; the snow lotus is already the kit's; no gap | S-M; O0 site on the pilgrims' road |
| **shighlands**: 2, spiral conifers | `PLAN-STATIONS.md` | subalpine forest twisted in helices, showy spiral cones, snowbeds | plan, awaiting owner | none | reuse `bark.wrung`, `bark.twisted.red`, `bark.whorled`, `card.pine`, `card.spruce`; **gap, no prompt:** a large spiral-cone card if wanted | M; H0 sites, prompts |
| **shighlands**: 3, spiral fellfield and ice | same | spiral cushion domes, spiral sorted-stone circles, coiled lichens, a curving icefall | plan, awaiting owner | **new:** a spiral option in KFROST's circles; the icefall needs **an ice kind** (not approved) or host ice | reuse `surface.cushion`, `rock.lichen.circles`, `ice.glacier`; no gap | L |
| **swlowlands**: 2, the great river gorge | `PLAN-STATIONS.md` | a 5,700 m³/s green river in a 600 m gorge, rapids, the mouth on the Ring Sea; Shim's ground | plan, awaiting owner | `WATER.flow` and KRELIEF exist; rapids want per-flow foam (section 2, not approved); Shim reading it wants KLAND (not here) | reuse the kit's oaks and cork, `bark.alder.lichen`, `card.broadleaf`, `rock.limestone.karst`; plane bark is the same gap as above | L; W0 site with Shim's plan |
| **nsemiarid**: the highland spurs | `PLAN.md` section 7; `KNOWN_ISSUES.md` | a zone over 2.5 km (12%) reading nhighlands and ebadlands in place | not wired (a design task) | none | none new | S-M |
| **scablands**: 2, the high line | `PLAN.md` section 3 | the flood lake's high line and rafted wreckage over NW lowlands | later | none in core (KSCOUR, KBASIN exist); blocked on nwlowlands' rock zone, bed response and pass table (`nsemiarid/PLAN.md` section 8) | erratics' and Port kit's packs; no gap | M-L |
| **dambasins**: 2, the ship graveyard | `PLAN.md` section 3 (D1-D2) | hulks drawn to the west notch | planned | none (`KBASIN.sample`; nsemiarid in place) | Port kit's and nsemiarid's packs; no gap | M |
| **dambasins**: 3, the east bed in Korona | same | the overlay over a second biome | later | none in core; Korona needs a `bed` and `salt` response | none new | M |
| **nwouterwall**: 4, the Wall foot | `PLAN.md` section 7; `ECOTONES.md` | the ecotone: nsemiarid's fruit forest and wormwood below, the larch steppe above, under a warped mask | planned "for a future session" | none (Korona's mask form); the `libSwap` cell fix (section 2) matters for any two-slot sheet | both kits' sets; no gap | M; ECOTONES is still a proposal |
| **abyssal-savannah**: 2, the floor's belt | `PLAN.md` section 8 | the parkland at its tallest at 2 atm, rope araucarias, spire mounds, jungle and salt either side | planned (S8) | none (KLAND waits for S7) | station 1's sets plus `bark.araucaria`, `leaf.araucaria`; owed with prompts (section 24) | M |
| **abyssal-savannah**: 3, the bench's edge | same | the rim breaking as cliffs; ebadlands' pinyon and juniper read in place | planned (S8) | none | as station 1; ebadlands in place; no gap | M |
| **swbay / swlowlands / nwlowlands** flora exchanges | each `PLAN-FLORA.md` | species from swhighlands and wouterwall, read in place or derived | wait on two unbuilt kits | none | prompts exist (sections 21-22) | M each, after those kits |
| swlowlands' spring cypress and ribbon-root (ride along now) | `PLAN-FLORA.md` | two derived trees of the kit's own | can ride along | none (`WATER` for the clear springs) | `bark.juniper`, `bark.cedar.red`, `bark.mangrove`; no gap | S |
| nwlowlands' blue-grey marl gorge (ride along now) | `PLAN-FLORA.md` | a stream cut deep into blue clay at the wall's foot | can ride along | covered by `36-core-carve`/KRELIEF (check the carve follows a stream line) | **gap, no prompt:** a blue-grey marl rock set | S-M |

Not stations, noted: the Rift's highlands are the new `biomes/riftrim` kit, not a station of the rift. Ringisles plans no
station. The four new plans (godthrone, swhighlands, wouterwall, godstep) plan stations only inside their own new kits;
godthrone's rim station is to be sited "over a station of a wall kit", a siting note only.

## New core needed

- **The strata module** (STRATA-PLAN, unapproved): ebadlands 1-4 (the `badland` recipe); necanyons 2 and Korona (optional `tepui`).
- **An ice kind in `core/water`** (section 2, unapproved): ebadlands 4, shighlands 3, the Throne's penitentes (else each draws host ice, as the Throne glacier did).
- **A seasonal water level on the clock**: hyperjungle 3.
- **`WATER.rideGLSL` for floaters** (section 2): hyperjungle 3 (floating meadows); the lava delta (pumice rafts, optional).
- **Per-flow foam and a fall on a sloped face** (section 2): swlowlands 2 (rapids), ehighlands 2 (falls down the face).
- **A spiral option in KFROST**: shighlands 3.
- **KLAND in this checkout**: swlowlands 2 (for Shim), abyssal-savannah S7.
- Approved and used: R1 height fog (ehighlands 2's cloud bank, every valley), R11 hazard key (the lava delta's laze, the blast zone).

## Texture gaps with no prompt yet

The ehighlands wet face's own broadleaves and epiphytes; corn lily and black-oak cards (nhighlands 2); a sycamore/plane
bark (nhighlands 3, swlowlands 2); a blue-grey marl rock (nwlowlands' gorge); optional: a dry-season deciduous leaf
(hyperjungle 2), a large spiral-cone card (shighlands 2). Every other station reuses library sets, or sets already
prompted (`PROMPTS-NEEDED.md` sections 21, 22, 24).

## Suggested order (right after the final rebuild, no new core)

1. nsemiarid's highland spurs, oidong 2 and nhighlands 4: small, existing sets only.
2. necanyons 3 and abyssal-savannah 2-3 (one country, savanna sets shared), then necanyons 2 on KSTACKS.
3. eastabyss 2 and dambasins 2.
4. nwouterwall 4, the Wall foot, once ECOTONES is approved.
5. The Throne's blast zone (write its plan first), then the lava delta with static rafts.
6. nhighlands 2-3 and hyperjungle 2 once their few prompts are written and delivered.

Waiting on core: ebadlands (strata, ice), shighlands 3, hyperjungle 3, swlowlands 2, ehighlands 2 (prompts as well).
