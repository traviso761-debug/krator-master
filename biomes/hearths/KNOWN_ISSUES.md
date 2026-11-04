# biomes/hearths: known issues

The kit's one page is the Cave of Crystals (`python3 build.py`, `dist/hearths-crystals.html`; PLAN.md section 18). The life in `src/`
is read in place by `biomes/oidong` (its station 3) and has no page here.

## The Cave of Crystals (stations/crystals, 2026-11-03)

- [ ] **Textures owed.** The selenite is `stone.alabaster` (massive gypsum) tinted pale green and the iron stain is `rock.gossan`
  toned down: stand-ins until `mineral.selenite` and `rock.limestone.ironstained` are delivered (`core/materials/PROMPTS-NEEDED.md`
  section 36). Wire them as `crystal.selenite` and `rock.ironstain` in `materials.json`, re-pack, rebuild, verify.
- [ ] **The hold's massing is proposed.** Which chambers a loj takes (the three cooler ones round the feeders), the shelves, the night
  road and the way down are this station's proposal (PLAN.md section 18); the settlement kit and the owner decide. The records are
  `CAVE.HOLD` (export: the panel's "export hold", or `_api.hold()`).
- [ ] **Where the page lives.** Its planned host, `biomes/riftrim`, has no build. When it gets one the station moves there as
  `--station hearths-crystals`; its fragments read only the core.
- [ ] **The approaches stop at the page.** The night road is carved to the box's edge 25 m under the shelf, and the way down to a
  landing at the active storey's level, which this page does not carve (its maze is 4 m off: `continues` in each record).
- **No height fog.** `ATMOS.heightFog` reads the shared sky's uniforms and there is no sky underground: the haze is the scene's
  FogExp2, warm brown.
- **The crystals' light is faked.** No refraction: a glow in the shader that grows with the grazing view (the path through the
  crystal), lit by the camera's lamp by distance and by each instance's share of the vents' daylight and the wells' glow (`aGlow`,
  baked when the page builds). The beams are drawn translucent without sorting inside their one draw; overlaps can show the far
  beam over the near at some angles.
- **The floors of the hold's chambers are levelled by a monolith.** KCAVERN joins a hall and its passages smoothly, which sank each
  chamber's floor up to 1.7 m where the passages meet at its node; a `KCAVERN.monolith` fills each hold chamber's floor back to its
  record's height. The feeder chambers keep the dip (their crystals stand in it).
- **`check_port` does not read `stations/`.** The station's tags are kept by hand in `PORT.md`'s notes; the two `[G data]` fragments
  were checked against its rules.
- **KSHADOW** is off at page load (`?shadow=1`, the owner's default since 2026-11-03); it was not measured here: the vents' spot is
  not a sun and the shadow box follows a directional light.
