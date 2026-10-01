# Jimjam: design notes

The source brief is `jimjam-chatgpt-prompt.md` (repo root), sections 5–7, with the reference images listed
in `AGENT-BRIEF.md`. This file records what was built.

## Materials (`src/60-jj-mat.js`)

Every texture is procedural (canvas) and carries its own colour, mortar included. Instance tints are
white by default and only ever a small multiplier.

| material | what | tile |
|---|---|---|
| `brick` | red running bond, 0.24 × 0.08 m bricks, a darker header course every 6, scorched ends, speckle, lit and shadowed arrises | 1.92 m |
| `brickYellow`, `brickDeep`, `brickDark` | the same in yellow, deep red and vitrified near-black (images 6–8) | 1.92 m |
| `bandBrick` | red with yellow header courses every 4 | 1.92 m |
| `marble` | near-white ashlar, 1.2 × 0.6 m blocks, soft branching veins, polished (roughness 0.36) | 2.4 m |
| `ochre` | lime plaster wash with mottling and cracks (poor houses) | 4 m |
| `domeGold`, `slate`, `terracotta` | scale patterns for domes | per dome |
| `shaft_*` | the six relief patterns for ornamental shafts (spiral, chevron, diamond, ogee, fleur, tracery) | wraps the shaft |
| `sunray` | the red-and-yellow radial inlay | one disc |

All tiled materials are **world-UV'd** (`jjWorldUV`): a box or cylinder of any size tiles in metres.

## Wealth tiers

* **poor**: ochre plaster over deep brick, flat terraces, a barrel vault, a terracotta dome, external stairs, a timber jharokha, plain chimneys; no gold, little marble.
* **middle**: banded brick, marble string courses and surrounds, oriels, loggias, turrets, clustered patterned chimney stacks.
* **rich**: high marble podiums and stairs, gold onion domes, slate ribbed domes with lanterns, chhatri pavilions, a staged spire, arcaded courts; lit.
* **civic** (library, school, temple, palace, caravanserai, amphitheater, fortress, barracks, walls): the full vocabulary at scale; lit.

## Lighting

Oil lamps and braziers glow on rich and civic buildings only (`lit:true`). The showcase is lit at 10:30 on
Krator day 350 (the southern summer solstice): the sky module puts the city at 40° S, so the sun stands in
the north, and every building is turned to face north (`ry = π`). Sun shadows follow the camera target.

## The solstice rule

The temple's monumental arch frames the sun **at sunset on the summer solstice**, as the Krator sky draws
it: day 350, the evening hour at which the sun is 3° up (about 19:05), azimuth about 242° (west-south-west).
The temple computes this from `KratorSky.sunDir` on first use and sets its own yaw, `ry = π − A`, so the
sightline (an observer at the sanctuary door, 1.7 m above the podium, looking out through the arch) points at
the setting sun. `window._api.solsticeCheck()` casts that ray and returns `ok:true` only if it passes through
the arch opening without touching the temple. The temple row is the southmost on the sheet, so the sightline
runs over open ground.
