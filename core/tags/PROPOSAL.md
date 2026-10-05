# core/tags: draft proposal

**Status: DRAFT for Travis's review (2026-10-05). Nothing here is built.** GODOT-PLAN.md Phase 2 item 3 names
the module; rule 4 says everything placed is registered in it before it is drawn. This draft proposes what goes
in it, grounded in a survey of the registries the builds keep today. Open questions are at the end; the answers
change the shape, so they come before any code.

## Why

Every build already registers what it places, but in seven different shapes that never meet:

| Registry | Where | Ids | Tags |
|---|---|---|---|
| `REGISTER` / `REG` | Ancients lineage, Iziz, Ys, Port, Post-Apoc, Ringsea | none (Ys: array index) | `cls`, `key`, `tags:{culture, type[], wealth, lit, state}`. The Ancients `REGISTER` stub drops them. |
| `SITES` | Girder, Locus, Mav's Refuge, Yuni | none | free text in `label` (`'building · culture: yuni · type: …'`) |
| `PLACED` | Voth | none; entries can be spliced out | one ad-hoc `tag` string (`town`, `shrine`, `fishdock`…); also the collision grid |
| `BIO.register` | biome hosts | none | `kind` sometimes. Species tags (climate, harvest) sit on the kit, not the record |
| `FIX.*` | Yuni | **deterministic** (`bld_00042`, `door_00301`; `bld_00098.room.4`) | `culture`, `types[]`, `family`, `wealth` |
| `KFURN` | core/furnish (5 builds) | **deterministic** (`furn_00001`) | `job`, `room`, `building`, `setting` |
| minimap records | core/minimap (Voth feeds it) | `seq` | `tag` |

The same idea goes by different names. Rotation is `ry`, `yaw`, or absent. The footprint is `fx/fz`
half-extents, `w/d`, `r`, `hx/hz`, or `decl.w/d`. The class is `cls`, `kind`, `tag`, `family` or `type`. The
vocabularies disagree too: Iziz's `iziz-old` is not a catalog culture, Yuni has `park` but no `market` and the
catalog the reverse, and `wealth` is sometimes 0..1 and sometimes `'civic'`. The inspector reads `name` and
`label` and never `tags`; the spike's Godot importers found no ids on biome items and had to invent side tables
for tags on MultiMesh instances.

## What it is

One engine-neutral registry of **what a placed thing is**: `KTAGS`, a [G data] module (no THREE, no DOM), with
a vocabulary table, validation, queries and an export. It does **not** hold geometry, collision, draw state or
live state (Voth's grid, Post-Apoc's `coll` and `tris` stay where they are).

### The record

```
{ id,            'bld_00042': deterministic (below)
  class,         building | part | fixture | furniture | prop | flora | fauna | life | landmark | infrastructure | feature
  kind,          the finer type within the class: a catalog type, a species, a PLACED tag, a fixture kind ('door')
  key,           the build's own key for the thing (asset key, catalog key, species key), or null
  name,          what a person calls it ('Gatehouse 1', 'Hypertree'); label stays the inspector's free text, optional
  parent,        the id of what it belongs to (a door's building, a room's building, a part's compound), or null
  at: [x,y,z],   the base centre, world metres (+Y up, x east, z south): y is where it stands
  ry,            radians about +Y, three's rotation.y (front +z turns to (sin ry, cos ry)); yaw is an alias on input
  size: [w,d,h], full extents in its own frame; r for a round thing instead of w,d (the inspector's rule needs one)
  tags: { culture, types[], wealth, tier, state, setting, job, room, biome, koppen, harvest, lit, ... },
  src: { build, frag } }
```

`tags` is open but checked: known keys take values from the vocabulary, and unknown keys and values are
counted (like the furniture glue's missing keys), never thrown.

### Ids

The rule Yuni and core/furnish already use: `<prefix>_<5 digits>` in registration order, one counter per
prefix (`bld_`, `part_`, `door_`, `win_`, `light_`, `furn_`, `prop_`, `flora_`, `fauna_`, `site_`). A child of
a building takes a path (`bld_00098.room.4`). A build is deterministic, so an id names the same thing on every
load of the same version. A removed record keeps its id, and ids are never reused.

The second form, for matching across versions (open question 1): a `uid`, the `core/rand` integer hash of
(class, key, the position rounded to 10 cm). It survives a reordering that shifts every order id after it.

### Vocabularies (one table, `52-core-tags-vocab.js`)

| Tag | Values | From |
|---|---|---|
| `culture` | the catalog's `FURN_CULTURES` (24, extensible) as the master list; aliases map old spellings (`iziz-old` → `iziz` plus `era:'old'`) | kits/catalog |
| `types` | the union of the catalog's `BUILDING_TYPES` and Yuni's types (adds `park`), plus Iziz's `military`, `statue` | catalog, Yuni, Iziz |
| `wealth` | a number 0..1; the names map to it (`poor` .2, `common` .5, `rich` .8, `civic` .65: Highlands' `hlfWealth`) | Highlands, Iziz |
| `tier` | `poor`, `common`, `court` | catalog |
| `state` | `intact`, `ruined`, `rehab`, `toppled` | Iziz |
| `setting` | `indoor`, `outdoor`, `room` | catalog, core/furnish |
| `job` | `FURN_JOBS` (15) | catalog |
| `koppen` | `Af Am Aw BWh BWk BSh BSk Csa Csb Cfa Cfb Cfc Dfa Dfb Dfc ET EF` plus Krator's `X` (abyssal) and `H` (hyperalpine) | biomes/WORLD.md |
| `harvest` | `{wood, edible[], medicinal}` | nhighlands' schema |
| fixture kinds | `DOOR_STYLES`, `LIGHT_KINDS` | Yuni |

### The API (sketch)

```
const T = KTAGS.create({ build: 'iziz' })
T.add(rec)                 -> the record with its id (fills defaults; counts unknown tags)
T.child(parentId, rec)     -> a record whose id is a path under its parent
T.get(id); T.remove(id)    -> removed records stay, marked (Voth's gridRemove)
T.query({ class, kind, tags: { culture: 'voth' }, box: [x0, z0, x1, z1] })
T.at(x, z, y)              -> the smallest record containing the point: the inspector's rule, once
T.audit()                  -> counts per class, unknown vocabulary, records missing culture or type (Iziz's tagAudit, for every build)
T.export()                 -> { format: 'krator-tags', version: 1, build, convention, vocab, records }
```

### Adapters, so no builder changes at first

Each existing registry gets a one-line forward into `T.add`, and keeps working as it does today:

- `REGISTER(o)` → `{class: o.cls, key: o.key, name, at, r, h, tags: o.tags}`. The Ancients stub stops dropping
  `cls` and `tags`.
- `SITES` entries → parse nothing; the builders that write `label` text pass the same values as `tags`
  (the label text is then made from the tags, not the other way round).
- Voth `claim(...)` → `T.add` with `class` and `kind` from a table keyed by its `tag`. The grid stays Voth's.
- `BIO.register` → `class: 'flora'` or `'fauna'`. The species' tags (climate, harvest, Köppen) are copied
  from the kit.
- Yuni `FIX.*` and `KFURN` → their ids pass through unchanged.

### Who reads it

- **The inspector:** `T.at()` and the record's fields (its label is built from the tags). One host fragment
  for every build, which belongs in `core/host` (Phase 1).
- **The minimap:** `M.fromTags(T, palette)`, with a colour per class or kind, in place of each build feeding it.
- **The exporters:** `krator-tags` beside each export; glTF node `extras` carry the record; `BIO.export` items
  carry an id range or a per-instance id table once plants are records (blocker 10).
- **Godot:** every node's metadata is its record (`set_meta("krator", rec)`, as the spike's Yuni importer
  already does). A MultiMesh holds a side table indexed by instance (the spike's finding). An optional `KTags`
  autoload answers `query` and `at` for gameplay.
- **The life layer:** citizens find doors and workplaces by `class` and `tags.job` instead of each build's own
  lists.

### What proves it

- `node core/tags/test-tags.js`: a fixed list of adds, children and removals gives the same ids and the same
  export digest, and each vocabulary check has a negative.
- Per adopting build, a fingerprint like `core/furnish/fingerprint.py` shows nothing drawn moved, and `audit()`
  counts reach zero unknowns.

## Order of adoption (a proposal)

1. **Yuni** (the plan's named candidate). It already has ids, an export and a Godot importer (the spike's `yuni`
   case), so it proves the record and the export with the least change.
2. **core/furnish.** Its records already have ids; `onRecord` forwards them to `T.add`. That puts five builds'
   furniture on it at once.
3. **Iziz's `REG`** (M5's city). The Ancients stub is fixed and the audit runs on every lineage build.
4. **Voth's `PLACED`** (M6, the life layer).
5. **The biome kits**, once placement writes plant records (the reseeding event): flora and fauna get ids and
   Köppen tags.

Steps 1 and 2 are each about a session, with tests. Step 5 waits for the reseeding event.

## Open questions for Travis

1. **Ids:** registration order only (simple, but a build change can shift them), or also the position-hash `uid`
   for matching across versions (saves a game that references a building)?
2. **Cultures:** is the catalog's `FURN_CULTURES` the master list? Is Iziz's `iziz-old` a separate culture or `iziz`
   with an era?
3. **Wealth:** numbers 0..1 everywhere, with names only on input? Is `civic` a wealth or a type?
4. **Köppen:** per species (what it tolerates), per place (the climate at the spot), or both?
5. **Plants:** a record per plant instance (millions in a whole biome; per tile, thousands), or one record per
   item with per-instance ids only?
6. **Labels:** keep free-text `label` as an override, or always generate it from the tags?
7. **Class list:** is `life` (citizens, animals that walk) one class with `fauna`, or separate?
