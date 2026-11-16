# biomes/clivobredos: known issues

Open items are `- [ ]`; build.py counts them.

## Stand-ins (say so: CLAUDE.md, "Textures")

- [ ] **The ring's skin is `organic.pleat.skin`**, not the owed `organic.lung.ring` (a helix-ribbed tintable skin); the helix ribs are geometry
  (the unit tube's ridges), so they read without it. The prompt is in `core/materials/PROMPTS-NEEDED.md` section 44.
- [ ] **The throat comb is `organic.tendril.banded`** (tinted near black), not the owed `organic.comb.throat`.
- [ ] **The husk is `organic.lichen.plates`** (grey detail under the faded band), not the owed `organic.husk.dry`. Its geometry is its own since
  2026-11-11 (split along two of its six ribs, the skin beside each split curling out).
- [ ] **The fall-out lawn is a geometry stand-in** (`src/72-biome-lung.js`, `lawnG`: three stalks with cotyledons, vertex-coloured), until
  `card.fallout.lawn` is delivered (a canvas card was tried first: its transparent texels darkened ## The kit

- [ ] **No fauna of the lungs' own.** The flue-rider, the ring-crawler and the mouth-maw are `kits/fauna`'s to build (PLAN.md section 16, L7);
  the maw's lie is a hazard record (`hunter`) with nothing drawn in it. The Bells reads the hyperjungle's own fauna in place (its fang gliders
  and sky rays) since 2026-11-11; the Mouths and the Stair draw none.
- [ ] **The deck stays a ceiling the Bells does not draw.** On the Bells the cloud above the canopy is the fog belt (900-2600 m), not the
  cloud deck: core/atmos's deck is drawn to be seen from above.
- [ ] **The bore is walked on strips, not on KCAVERN.** Since 2026-11-11 every drawn segment of a lung (live or husk) writes a core/walk strip
  at its bore's floor, and the Stair's lung-stair one along its rungs, so walk mode (F) goes up the inside and a game reads them from
  `KWALK.export()`. The plan's `KCAVERN.pipe` (built for this kit) is not used: it meshes on a 0.5 m lattice (an estimate of several hundred
  thousand triangles a 3 km lung, not measured) and the rings are drawn as items; the pipe's records would be the export for a game's collision.
- [ ] **Mouths over the lip:** a mouth stands at the pipe's top point, just back of the rim, and the pipe meets it with an elbow inside the
  mouth's flare; a close camera below the lip can see the joint.
- [ ] **The Bells' motes.** The hyperjungle's fauna, read in place on the Bells, includes its glowing motes (the jungle's, `LORE.md:917`);
  the plan has them go out in the flue's cold before the mouth, and nothing of the lungs' own glows (the probe checks the lungs' materials).
  If the owner's "nothing glows" is meant for the whole page, the Bells reads the jungle with `fauna: false` (`STN.fauna`) and loses the gliders.

### Closed (2026-11-11)

- **The sheen is a band.** A KHOOK layer on the skin and bore (`src/72`, `lung:sheenband`; core/shader's door, anchored on core/biome's breath
  term) replaces the wet term with a bump on the rings the state passed by between a quarter and a half of `LUNG.SHEEN_W` (.3), gone past it, so the condensation ladder's rung climbs the lung
  through the morning and falls back toward dusk with dry rings below it. No core change: the anchor is the breath term's own line, and KHOOK
  throws (the verify's program check fails) if core/biome ever writes it differently. The probe checks it (`the sheen is a band`), with a negative.
- **The bore is walked** (above: core/walk strips; the probe's `the bores are walked`, with a negative).
- **The far lungs** stand on the scarp record's own ravines and buttresses past the map (the candidates `LUNG.layout` reads on it), not on
  points scattered along the rim.
- **The husk** is split along its ribs (above).
- **The scarp is KRELIEF.scarp** from the first fragment (it had landed in core before the kit began); moving shighlands onto it is L7.
- **The 08:30 night on the Stair was the giant's eclipse.** At these stations the sun passes behind the giant from about 08:00 to 09:30 on game
  day 0 (`ATMOS.sunHidden`: 1.0 at 08:00-09:00, 0 at 10:00). Not a bug: the breath now reads it (`W.sun`, the host passes
  1 - `ATMOS.sunHidden(t)`), so the solar chimney stalls in the eclipse and the draw dips; the Stair's views keep out of it.
- **Budgets.** The Stair at quality .33 draws 13.6 M triangles (95 calls), inside the showcase's 16 M; the Mouths 14.2 M (87 calls); the Bells
  210 calls against the 240 set for it (the hyperjungle's kit draws by species). Measured under SwiftShader, not on the GPU lanes.
- **The mouths' hazards** stand on the mouth's ground (a mouth's `y` is its ground now), and a husk has no film (its collar is dry).
- **The folder is `clivobredos`** (the owner, 2026-11-11; it was `clifflung`).

d under SwiftShader, not on the GPU lanes.

## Not in the open world

The stations are ideal types on their own maps. The open world places the lungs from the model's scarp once the next scale model update
builds it (PLAN.md section 5; the owner, 2026-11-02): `LUNG.layout` takes any `KRELIEF.scarp`, so the open world hands it the model's.
