# The Arch: known issues

Open items are `- [ ]`; read them before changing the kit.

## Stand-ins (procedural until the library has the set; PLAN.md section 15, `core/materials/PROMPTS-NEEDED.md` section 43)

- [ ] **The serpentinite on the steep faces** is `KSTRATA` colour bands from the kit's own `arch-serpentinite` recipe (84), not a library set: `rock.serpentinite` is owed.
- [ ] **The peridotite's buff rind** is a bed colour in the same recipe: `rock.peridotite.rind` is owed.
- [ ] **The terraces' and aprons' travertine** draws `ground.travertine.white` (a calcite set); the brucite-and-carbonate crust of a hyperalkaline spring (`mineral.travertine.brucite`) is owed.
- [ ] **The curtain's two faces** are vertex colours on a procedural sheet (50): `mineral.curtain` is owed.
- [ ] **The maquis's cards** (she-oak needles, the hoarder's glossy leaves, the sedge) are procedural canvas cards; no library card is wired yet (candidates: `card.juniper`, `card.broadleaf`, `card.sedge.fen`).
- [ ] `rock.basalt.pillow` and `rock.hyaloclastite` are owed for the stations `sound` and `coast` (not built).

## The page

- [ ] **The flames are the kit's own** additive cones (89b): `core/atmos` has no flame module but the brazier's cone. PLAN.md section 4 said the Gills' flame mesh would be taken; the Gills' candles are planned, not built. Move to a core flame when one exists.
- [ ] **The araucaria is a simple builder**: a stalk trunk and bowed stalk arms, no scale-leaf card. The rope araucaria of `biomes/eastabyss` (`G.rope`) is the better form; reading it in place is the next pass.
- [ ] **The mixed water is acid (pH ~3)**: with the springs' and the solfatara's flows as set (18 against 12 L/s, ARCH.spring's draws), the acid wins downstream (ARCH.mix). Honest, and drawn so; a wetter dome (more spring flow) would neutralise it. Owner to say which they want.
- [ ] **The sound is not drawn**: the station's far field runs south-east to the sound's floor, but no open water is placed there (the sound is ~8 km off the page).
- [ ] **Software GL only**: built in the cloud; `verify.py --assert` ran on SwiftShader. A GPU-lane run is owed.
- [x] **All seven stations are built** (2026-11-12..2026-11-27): the confluence (`dist/arch.html`), the dome, the barrens, the sound, the coast, Fleetborn Cove (`cove`), and the interior axial rift lakes & river (`lakes`, `px 403,170`) (`python3 build.py --station <name>`; `--all` every page). They share one stage (45) and host set, each station's land a branch of `L` keyed by its site record. `tools/test_all.py` rebuilds only the default page (as highrift's stations).
- [ ] **The stream colours** were all the first flow's: `core/water`'s `drawFlow` leaves its colours out of the program cache key. Worked round in `89w` (the kit extends the key); the core fix is parked in `TODO.md`, "Ride along with the next all-builds rebuild".
- [ ] **The sound's flow is drawn, not simulated**: its lobes are a function of the axis (45), not a `KLAVA` run from the fissure (PLAN.md section 6 named `KLAVA`). A `KLAVA` bake of segment 9's episode is the next pass; its age comes from `ARCH.episode` already.
- [x] **The coast's and cove's seas now model the tsunami wave-train and trimline hazard** (2026-11-27): `stations/coast` (`regime: 'seamount'`, `-5.8 m` drawdown exposing the pillow-lava platform, `14.5 m` curling breaking bore, `+26 m` run-up against the `+70 m` tuff-cone refuge rim, scouring backwash, base-surge mist) and `stations/cove` (`regime: 'ghost'`, sill-damped `8.2 m` bore & `+12.5 m` throat run-up composed with live `KTIDE` below the `+76 m` Arcoforte safe refuge) take the shared `core/water/ext/64-core-water-tsunami.js`, `64b-core-water-tsunami-draw.js`, and `core/hazard/24-core-hazard-tsunami.js` modules ready to roll out across all Tsunami Coast biomes.
- [x] **The strand, the mangroves, the maquis and the lava pioneers now use structural multi-limb `BIO.tree` + `BIO.tube` + `BIO.flareJoin` builders** (2026-11-26, 39 species): `bark.araucaria`, `bark.paperbark`, `bark.mangrove` and `card.strap.pandan` are wired in `materials.json` and packed into `tex/`; Fleetborn Cove's 14 m intertidal band places real `arkelp`, `arseagrass`, `arbyssus` and `aroyster` instead of `arhem`/`arlime` stand-ins. Library `card.naupaka` and `card.creeper.beach` remain optional future swaps.
- [ ] **The pillow platform and the hyaloclastite are stand-ins**: `rock.basalt.vesicular` and `rock.palagonite` until `rock.basalt.pillow` and `rock.hyaloclastite` come.
- [x] **Each station page packs only its own ground and flora families** (`_ST_FAMS` in `build.py`, 6–8 of the 14 families in `tex/`).
- [ ] **The dome's summit is not on the page**: the station is the whaleback's south-east flank (~21 km from the 1,456 m summit); the far field carries the flank's fall only, the sky's ridges stand for the rest.
- [x] **The foliage clump items declare `attrs:['aN']` and pass per-instance normals** (2026-11-26): `M.glossy`, `M.needles`, `M.ohiaLeaf` and `M.casuarina` run with `aN:true` and no longer draw black.
- [ ] **No fauna yet** (PLAN.md section 8): the five hexapods go to `kits/fauna` as data first.
- [ ] `tests/test-arch-chem.js` is not in `tools/test_all.py`'s glob (it runs `core/`, `settlements/*/tests` and `kits/*/tests`, not `biomes/*/tests`): run it by hand.
- [x] **The coconut palms' crowns** (`arcoconut` / `coconut`, 2026-11-26): rebuilt with 5-segment V-cambered drooping pinnate fronds (`PALM_FROND_GEO` + `TX.palmFrond`), 3-tier spiralling crowns and basal coconut clusters (`ARCHB.growCoconut`).
- [ ] **The offshore vent's steam is faint at 2.4 km**; the discoloured-water slick over it (89w) is what reads. A taller steam column (or a plume on `core/water`'s plume ext) is the next pass.
- [ ] **Far landforms carry no life past the LOD's reach** (the plants' cell passes stop at the mid and floor distances): the sound's far rootless cones and the gas hollow are given real geometry (spatter rims, a bare floor) so the registry's volumes are not empty.
- [ ] **The cove's tide is the scale model's** (2026-11-25): `stations/cove/station.json` takes `core/water/tide` (`KTIDE`) and a ~4 KB slice of `tools/scale-model/model/data/tides.json` round px 236,242 (`KTIDE_DATA`, written by build.py). The site is gained to a mean day range of 11 m (`SITE.tide.mean`) so the 92-day extremes (-7.27..+7.11 m) sit in the ±7 m band the stage, zonation and splash bands bake; the day range runs 7.5 m at neaps to 14.3 m at the greatest springs. The level follows the host's world clock (`?tideday=N&hour=H`; `?tide=run` races it; the panel's Spring, Neap, Great Ebb and Great Flood jump the clock). The cove writes its sea level directly (not `KTIDE.bindWater`), and `HCHK.dry` holds roots to the tide's datum, not the level at the check's moment. Only the cove takes the tide; the other stations still have a fixed sea.
