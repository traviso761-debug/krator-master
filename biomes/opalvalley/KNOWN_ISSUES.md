# biomes/opalvalley: known issues

First pass, 2026-11-11; the open issues worked 2026-11-12. Built in the cloud: checked under software GL (SwiftShader) only. The GPU look
pass is owed.

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

- [ ] **No opal node in `kits/resources`.** The diggings carry `{kind: 'opal', grade}` in that kit's shape; the node reaches 39 pages
  (5 builds, the isle demo and its open world among them): `PLAN.md` section 9, item 5.
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

- [ ] **The sheen's strength** (`?sheen=`, default .7 on flecks): judged once under SwiftShader; the GPU may want it lower. The first pass's
  coat over the whole mask read as paint and was cut (PLAN.md section 9, item 3).
- [ ] **The glacier's ice is drawn as ground** (the ice layer on the ground mesh, KGLACIER's thickness in `terrainH`), its seracs and caves by
  KGLACIER's drawer. Since 2026-11-12 the ice takes a cold blue in the ground shader, strongest on its steep faces (`src/84-host-ground.js`,
  `GL`): a tint, not subsurface scattering.

## The walk-in adit (2026-11-12, `src/85w-host-adit.js`)

- [ ] **The portal's edge steps** at the cavern's 0.5 m cell where the tube meets the slope (surface nets); the timber set hides the
  middle of it. A finer cell costs four times the triangles (`core/terrain/39-core-cavern.js`, header).
- [ ] **The miner's lamp is drawn in the rock's own shader** (an emitted term from the eye, `uLamp`), not a `THREE.PointLight`: the
  page's horizon layer (`khorizonl`) shades everything under the hill as under it, which put out a point light's term. The vug's opal
  (`BIO.iridBarkMat`, a Lambert kind) takes no lamp: it shows its colour by the ambient alone, as asked (no glow on the opal).
- [ ] **The lower bed's portal opens as a trench**: its adit stands on a gentle slope, so the cut runs a few metres into the ground
  before the face; the middle bed's is a face in the wall.
- [ ] **One adit a page walks in** (the one nearest the centre); the rest stay mouths on the wall (`src/86-host-digs.js`).
- [ ] **The two rock sets** (`rock.basalt.titanium`, `rock.tuff`) are packed into every page (about 1.4 MB), the glacier, upper-bed and
  mouth pages too, which have no walk-in adit: `materials.json` is one list for the kit. A per-station list is a `tools/textures/pack.py`
  change, for later.

## Fixed 2026-11-12 (the first pass's open items)

- The walk-in adit with its opal vug (above; `PLAN.md` section 10, O7), on the middle and lower beds.
- The west lip's fall: `WATER.fall` from the last tread's lip down the riser (`src/89w-host-water.js`; 160 m on the middle bed), the
  ground there a cliff over 45 m (`src/45-host-stage.js`).
- The walls: a cliff band and gullies in the stage (`wallsAt`), the strata mixed on the walls before the ground layers (`aWall`,
  `src/84-host-ground.js`).
- The upper bed's pines thinned (weight 1 to .5) and the glass-plume willows raised; the Xanadu kin at the Rift's mouth raised against
  the Rift's own trumpets and bell palms (`src/50-biome-opal-species.js`).
- The glacier's ice blue (above).
