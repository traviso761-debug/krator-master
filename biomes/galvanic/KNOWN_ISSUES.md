# biomes/galvanic: known issues

Open items are `- [ ]`; `build.py` counts them.

## Stand-ins (procedural or borrowed textures; prompts in `core/materials/PROMPTS-NEEDED.md` section 43)

- [ ] **The strand's mud** is `ground.brown_mud_02` tinted dark under the paint: a stand-in for the owed `ground.sulfide.oxidised` (grey-black sulfide
  mud, rust skin, cracked, the vitriols' bloom).
- [ ] **The reefs and masts have no texture**: their colour is vertex colour on core/biome's iridescent kind (the tarnish). The owed
  `organic.reef.galvanic` would carry the knobs and the peacock film; `mineral.crust.ferromanganese` is the nearest set in the library and is not
  wired (its blue-black is wrong for an iron crust).
- [ ] **No sphalerite on the mounds' cut faces**: `rock.gossan` caps them; the owed `rock.sphalerite` is for the faces once anything cuts them
  (the Lizardmen's scrapes, not drawn: `PLAN.md` section 9).
- [ ] **The crusts are flat lobed discs** (`BIO.fung.crust`), not the branching contact lines of the plan (a printed board's pattern): a ground decal in
  the ground's shader, keyed to the mud's mineral grains, would draw them better at no instance cost.

## Owed

- [ ] **GPU verify**: built and checked in the cloud with software GL (SwiftShader); the two GPU lanes have not run it. The showcase budget, the
  shaders on a 16-unit GPU and the look are to be confirmed there (`KRATOR_GPU_LANE=auto python3 verify.py dist/galvanic.html --assert --all-views`).
- [ ] **The ochre wader** (`PLAN.md` section 8) is a data proposal for `kits/fauna`, not drawn.
- [ ] **Zinc as a resource node** (`PLAN.md` section 9): not added; proposed for the next `kits/resources` rebake.
- [ ] **No steam over the Deep**: the brine is ~60 degC in +36 degC air at 2.2 atm; a faint morning haze would be honest and is not drawn.
- [ ] **The tidal pump** (`PLAN.md` section 3, question 1): not taken (the owner's call).
- [ ] **`tests/test-galvanic.js` is not in `tools/test_all.py`**: that runner collects `core/`, `settlements/` and `kits/` tests only, not `biomes/`.
  Run it by hand (`node biomes/galvanic/tests/test-galvanic.js`).
