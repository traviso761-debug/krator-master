# kits/tents: known issues

Open (the build prints each `- [ ]` line):

- [ ] The tent toolkit is read in place from kits/scyvoi (vendored identical in three kits): move it to core (PLAN.md, Next 1)
- [ ] No half-pitched or packed pose per tent yet (core/camp C2)
- [ ] Verified on SwiftShader only (the cloud container has no GPU): run verify.py --assert on a GPU lane before the gallery
- [ ] The Republican army's and the Eternians' covers are on their own sets since 2026-11-10 (`cloth.canvas.duck.army` as the family `armyc`,
      `cloth.ripstop` as `ripstop`: materials.json, the two dresses' `cover.key` in `41-tn-dress.js`, the key tables and KIT_FALLBACK in `26k-kit.js`;
      tex/ packed; PROMPTS-NEEDED.md section 42 pruned). The page is not rebuilt yet: check both dresses at the next rebuild (the ripstop's
      roughLift is .15 for its coated sheen; the army canvas keeps the canvas family's breakup)

Notes (deliberate, not bugs):

- **A tent in the `generic` dress has no culture** in core/tags: `generic` is a set there (`52-core-tags-vocab.js`), not a
  culture. `verify.py`'s vocabulary assert allows exactly those; a host pitching a generic tent for a people passes the
  people's culture in `tags`.
- **Small round rooms are octagons** (`tnRoom`: a bell, yurt or cone room under 2.5 m radius; a cone's under 2 m). The
  interiors' placer stands a bed head to a wall, and a 16-gon's 0.8 m sides are narrower than a bed. For the same reason
  the small bell is 6 m across (a centre pole stops a radial bed in anything smaller).
- **Only a family tent is a residence** (the residence rule: a bed, food and a chest a unit). A sleeping tent is a camp's
  bunkhouse (a dormitory: beds and a chest; its people eat at the mess or their household's tent), and a chief's tent is
  a hall (`kits/interiors/sets/tents.js` `IX.TENTS.item`).
- **Thin rooms in some cultures:** a cone's shrine or workshop (Ash Nomads, Beast Riders) and an Eternian bell shrine
  furnish two pieces or one: every required piece, but little else. The catalog has few small pieces for them.
- **`_api.interiors()` is the kit's own** (the tents' rooms by role); the engine's interiors path (`91i-interiors.js`) is
  off here (no `KIT_INTERIORS`), so its X/U controls do nothing beyond the engine's own cut-away.
- **Tent cloth is not a wall to the walker outside a room:** the open forms (fly, awning, screen) and the wagon register no
  walls; the engine's box reader (`37-wk-rec.js`) registers the boxes the forms draw (stakes, poles, wagon beds) as it does
  on every engine kit.
- **The sample camps' ground is flat** (`ground.ok` always true on the sheet); a host passes its own.
