# biomes/hearths: known issues

The kit's pages are the Hearth hold's two stations: the Cave of Crystals (`python3 build.py`, `dist/hearths-crystals.html`; PLAN.md section 18)
and the hold's active storey (`--station hold`, `dist/hearths-hold.html`; section 19). Both build the same cave, both storeys carved, and look at
their own storey. The life in `src/`
is read in place by `biomes/oidong` (its station 3) and has no page here.

## The Cave of Crystals (stations/crystals, 2026-11-03)

- [x] **Textures delivered and wired (2026-11-10).** `crystal.selenite` is `mineral.selenite` (full colour, up the crystal's length, 2 m),
  `rock.ironstain` is `rock.limestone.ironstained` (full colour at the stand-in's brightness, 3 m); `core/materials/PLAN.md` "Delivered
  2026-11-10". The iron-stained set came a little off its prompt (rust over most of the face, little grey-buff limestone, no white gypsum
  crusts): usable, since the stain is the point; a redo is the owner's call.
- [ ] **The hold's massing is proposed.** Which chambers a loj takes (the three cooler ones round the feeders), the shelves, the night
  road and the way down are this station's proposal (PLAN.md section 18); the settlement kit and the owner decide. The records are
  `CAVE.HOLD` (export: the panel's "export hold", or `_api.hold()`).
- [ ] **Where the page lives.** Its planned host, `biomes/riftrim`, has no build. When it gets one the station moves there as
  `--station hearths-crystals`; its fragments read only the core.
- [ ] **The night road stops at the page.** It is carved to the box's edge 25 m under the shelf; its run to the surface is recorded
  (`continues`). The way down reaches the active storey: a stair to a landing (a rock platform, a monolith) 1.5 m over the water.
- [ ] **The active storey's dark crops are not drawn.** The field shelves are reserved for them (PLAN.md section 19); the crops are the
  hold's, as its structures are.
- [ ] **The hearth trees' feet in the hold's roof and the night entrance** (section 11's first sketch) are not drawn: the surface is 40 m
  over the active storey's crowns, and the crystal storey's night road is the way up.
- **Both pages carry both storeys** (~450 k rock triangles, ~25 s of building in the browser: the network, two KSPELEO passes and the
  hold's crystal tests). Each page's dress is the whole cave's.
- **The pools' heat is KTHERM's, not KKARST's.** KKARST gives every pool the rising water's 55 degC; the station gives each its KTHERM
  temperature over the feeders and makes only those at 45 or over a heat hazard (48: `pools`, `SITE.therm.scald`).
- **KKARST's hazards are core/tags records, not inspector volumes** (`BIO.record`): a sump's drowning holds nothing drawn.
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
