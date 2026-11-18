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
- [ ] **All five stations are built** (2026-11-12): the confluence (`dist/arch.html`), the dome, the barrens, the sound and the coast (`python3 build.py --station <name>`; `--all` every page). They share one stage (45) and host set, each station's land a branch of `L` keyed by its site record. `tools/test_all.py` rebuilds only the default page (as highrift's stations).
- [ ] **The stream colours** were all the first flow's: `core/water`'s `drawFlow` leaves its colours out of the program cache key. Worked round in `89w` (the kit extends the key); the core fix is parked in `TODO.md`, "Ride along with the next all-builds rebuild".
- [ ] **The sound's flow is drawn, not simulated**: its lobes are a function of the axis (45), not a `KLAVA` run from the fissure (PLAN.md section 6 named `KLAVA`). A `KLAVA` bake of segment 9's episode is the next pass; its age comes from `ARCH.episode` already.
- [ ] **The coast's sea has no tsunami or base surge**: the Surtseyan caldera is steam over the water only; its eruptions are not modelled.
- [ ] **The strand, the mangroves and the lava pioneers are simple builders** (stalks, crossed cards, combs): the coconut's fronds are a fungoid comb, the mangrove's props bowed stalks. The library has `card.palm.coconut`, `card.naupaka`, `card.creeper.beach`, `bark.mangrove` to wire next.
- [ ] **The pillow platform and the hyaloclastite are stand-ins**: `rock.basalt.vesicular` and `rock.palagonite` until `rock.basalt.pillow` and `rock.hyaloclastite` come.
- [ ] **Each page carries the whole pack** (ten families, ~1 MB) whether its station uses them or not.
- [ ] **The dome's summit is not on the page**: the station is the whaleback's south-east flank (~21 km from the 1,456 m summit); the far field carries the flank's fall only, the sky's ridges stand for the rest.
- [ ] **The maquis's cards are lit as facing up** (`aN:false`): with `aN:true` the foliage hook reads a per-instance normal the kit's items do not declare (`attrs:['aN']`), and every card drew black (seen 2026-11-12). Declare the attribute when the cards move to library cards.
- [ ] **No fauna yet** (PLAN.md section 8): the five hexapods go to `kits/fauna` as data first.
- [ ] `tests/test-arch-chem.js` is not in `tools/test_all.py`'s glob (it runs `core/`, `settlements/*/tests` and `kits/*/tests`, not `biomes/*/tests`): run it by hand.
- [ ] **The coconut palms' crowns read as dark flat plates** (a fungoid comb per frond, seen 2026-11-12): wire `card.palm.coconut` and droop the fronds.
- [ ] **The offshore vent's steam is faint at 2.4 km**; the discoloured-water slick over it (89w) is what reads. A taller steam column (or a plume on `core/water`'s plume ext) is the next pass.
- [ ] **Far landforms carry no life past the LOD's reach** (the plants' cell passes stop at the mid and floor distances): the sound's far rootless cones and the gas hollow are given real geometry (spatter rims, a bare floor) so the registry's volumes are not empty.
