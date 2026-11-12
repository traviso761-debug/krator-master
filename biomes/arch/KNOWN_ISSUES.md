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
- [ ] **Only the confluence is built.** Stations `dome`, `barrens`, `sound` and `coast` have site records (41) and nothing else.
- [ ] **No fauna yet** (PLAN.md section 8): the five hexapods go to `kits/fauna` as data first.
- [ ] `tests/test-arch-chem.js` is not in `tools/test_all.py`'s glob (it runs `core/`, `settlements/*/tests` and `kits/*/tests`, not `biomes/*/tests`): run it by hand.
