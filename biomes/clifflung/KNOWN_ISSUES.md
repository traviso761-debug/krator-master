# biomes/clifflung: known issues

Open items are `- [ ]`; build.py counts them.

## Stand-ins (say so: CLAUDE.md, "Textures")

- [ ] **The ring's skin is `organic.pleat.skin`**, not the owed `organic.lung.ring` (a helix-ribbed tintable skin); the helix ribs are geometry
  (the unit tube's ridges), so they read without it. The prompt is in `core/materials/PROMPTS-NEEDED.md` section 44.
- [ ] **The throat comb is `organic.tendril.banded`** (tinted near black), not the owed `organic.comb.throat`.
- [ ] **The husk is `organic.lichen.plates`** (grey detail under the faded band), not the owed `organic.husk.dry`; a husk is not yet split along
  its ribs (its geometry is a live ring's).
- [ ] **The fall-out lawn is a canvas card** (`src/72-biome-lung.js`, `lawnTex`: seedlings drawn from KRAND), a procedural stand-in until
  `card.fallout.lawn` is delivered.

## The kit

- [ ] **The sheen band is a front, not a band.** Each ring wets as the condensation engine's share passes its lag (the lag rising foot to tip), so
  the wet front climbs the lung through the morning and falls back toward dusk; but every ring below the front stays wet, where the plan's
  ladder has a band with dry rings below it at noon. A band needs a second scalar (the front's lower edge) on `BIO.animHook`'s breath mode.
- [ ] **The bore is drawn, not walked.** A ring is a hollow tube (the bore item, ribbed, inward-facing) and a camera can stand inside it (the
  Stair's "Inside the bore"), but the floor is not written to core/walk: `KCAVERN.pipe` (core/terrain, built for this kit) meshes a body on
  a 0.5 m lattice (marching cells: an estimated several hundred thousand triangles for a 3 km lung, not measured), too many for a page of ten. Owed: the pipe's records exported for Godot with
  its floor, and the walk floor for the stretch near the camera.
- [ ] **No fauna.** The flue-rider, the ring-crawler and the mouth-maw are `kits/fauna`'s to build (PLAN.md section 16, L7); the maw's lie is a
  hazard record (`hunter`) with nothing drawn in it. The fang glider is not read in place yet (the Bells reads the hyperjungle with `fauna: false`).
- [ ] **The deck stays a ceiling the Bells does not draw.** On the Bells the cloud above the canopy is the fog belt (900-2600 m), not the
  cloud deck: core/atmos's deck is drawn to be seen from above.
- [ ] **The scarp is KRELIEF.scarp, not the kit's own.** The plan (L2) expected to draw the face itself until `KRELIEF.scarp` landed; it had landed
  (core/terrain, 2026-11-02, built for this kit), so the face is on it from the first fragment. Shighlands is not moved onto it (L7).
- [ ] **The far lungs.** `KFAR.streaks` past the map are placed by KRAND along the rim, not by a layout of the far Wall's ravines.
- [ ] **Mouths over the lip:** a mouth stands at the pipe's top point, back of the rim, and the pipe meets it with an elbow hidden inside the
  mouth's flare; a close camera below the lip can see the joint.

## Not in the open world

The stations are ideal types on their own maps. The open world places the lungs from the model's scarp once the next scale model update
builds it (PLAN.md section 5; the owner, 2026-11-02): `LUNG.layout` takes any `KRELIEF.scarp`, so the open world hands it the model's.
