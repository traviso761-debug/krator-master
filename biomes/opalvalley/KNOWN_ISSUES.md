# biomes/opalvalley: known issues

First pass, 2026-11-11, built in the cloud: checked under software GL (SwiftShader) only. The GPU look pass is owed.

## Stand-ins (procedural, until a library set comes: `core/materials/PROMPTS-NEEDED.md` section 46)

- [ ] **The opaline sinter's play-of-colour** is the ground shader's sheen (`src/84-host-ground.js`, `aOp`, `?sheen=`) over the
  library's plain `ground.sinter`: a **procedural stand-in** for `ground.sinter.opaline` (owed).
- [ ] **The opal seams in the risers** are `KSTRATA`'s thin `opal`/`fireopal` beds (their body colour) under the same sheen: a
  **procedural stand-in** for `rock.opal.matrix` (owed).
- [ ] **The photonic-cuticle leaf card** (`card.leaf.photonic`, owed): the Xanadu kin keep Xanadu's own cards (its procedural maps
  where the pack's families were left out for the page cap); the kit's prism fern takes `card.irisfern`, its pads a **procedural**
  round pad (`TX.pad`, `src/50-biome-opal-species.js`).
- [ ] The silica cushion and the sinter chalice are procedural meshes (`BIO.fung`) on the core's `irid` bark with no map.

## Open

- [ ] **No walk-in adit.** The adits are mouths on the wall (`src/86-host-digs.js`); a `KCAVERN` adit with an opal vug (`KSPELEO.VUG`
  and a `KGEODE.MINERALS` row for precious opal) is `PLAN.md` section 10, step O7.
- [ ] **No opal node in `kits/resources`.** The diggings carry `{kind: 'opal', grade}` in that kit's shape; the node reaches 39 pages
  (5 builds, the isle demo and its open world among them): `PLAN.md` section 9, item 5.
- [ ] **The west lip's fall is not drawn** on the three terrace pages: the last stream ends at its lip near the page's edge (past the
  walkable disc) and the ground drops away; the next station's riser is that drop's own page.
- [ ] **The ten lakes are a page-scale chain**: the model has one lake a tread (`PLAN.md` section 1.0); the pages compress each tread's
  56 km into 5 km, so the drops between the lakes come close together (an ideal type, as High Rift's).
- [ ] **The model's to-dos** (`PLAN.md` section 1.0): `r682`'s stale `to`, the carve's "-460 m" comment. Owed to the next scale model update.
- [ ] **The Rift's kin at the mouth** use the Rift's builders with the pack's `bark2`, `bark4`, `fan` and `broad` only (the page cap).
- [ ] **No `tintFlow` plume** of rock flour: the lakes are drawn on `WATER.terraces`' pools, whose material takes a gradient, not a
  moving tint; the milky water is the gradient's.
- [ ] **No sound**: `OPAL.SOUND` is data for a `core/audio` that does not exist (High Rift's records are the model).
- [ ] The `KSTRATA` opal recipes are handed to `KSTRATA.add` by the kit (`src/84-host-ground.js`) rather than written into core's
  `RECIPES`: adding them there changes every page that loads `35-core-strata.js`. Move them on the next all-builds rebuild (`TODO.md`).

## The look (judged in the software-GL shots, 2026-11-11; the GPU pass is owed)

- [ ] **The walls above the cliff band are pale and smooth** past the near gullies (the ground's paint, not a library set): reads as
  scree or snow at a distance, but flat near. A rock layer on the walls (`rock.tuff` or the owed `rock.opal.matrix`) and the far field's
  colours are the next pass.
- [ ] **The sheen's strength** (`?sheen=`, default .7 on flecks): judged once under SwiftShader; the GPU may want it lower. The first pass's
  coat over the whole mask read as paint and was cut (PLAN.md section 9, item 3).
- [ ] **The prism cloud pines dominate the upper bed** (over a thousand on the page): its tree as the plan has it, but the stand could be
  thinner with more of the glass-plume willows on the tarns' shores.
- [ ] **The Rift's trumpet trees outnumber the kin on the mouth's fan** (~870): right for the threshold, but the Xanadu kin there are few.
- [ ] **The glacier's ice is drawn as ground** (the ice layer on the ground mesh, KGLACIER's thickness in `terrainH`), its seracs and caves by
  KGLACIER's drawer: no subsurface blue in the ice itself.
