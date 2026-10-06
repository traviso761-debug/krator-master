# core/tags: draft proposal

**Status: DRAFT, reviewed by Travis 2026-10-05 (his answers are under "Decisions", and they override the text above
them where the two differ). Nothing here is built.** GODOT-PLAN.md Phase 2 item 3 names
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

## Decisions (Travis, 2026-10-05)

1. **Ids: both.** The order id (`bld_00042`) and a `uid`: the `core/rand` integer hash of (class, key, the
   position rounded to 10 cm), so a save that names a building finds it again after the build changes.
2. **Cultures: `FURN_CULTURES` is the master list**, cleaned of what is not a culture (below). `iziz` and `iziz-old`
   are the same culture: the input alias maps `iziz-old` to `iziz`, with no era tag.
3. **Wealth: `poor`, `middle`, `rich`, or `null`.** Civic buildings are a type, not a wealth, and most of them take
   `wealth: null` for now (a poor and a rich temple can be told apart later if a build wants it). The numeric
   0..1 the catalog and the interiors use stays inside them; the tag is the three names, mapped on input
   (`< .35` poor, `< .7` middle, else rich, as `FURN_TIERS`).
4. **Köppen per species**, always. Per settlement, one code for the prototype's visualisation only; the open world
   map will give each place its climate later.
5. **Plants: one record per item, with per-instance ids only** (`flora_00012#37`: the item's record and the
   instance's index in it). An instance has no record of its own; its tags are the item's.
6. **Labels: generated from the record** (example below). A record may add a `note` that is appended; there is no
   free-text override.
7. **Fauna is a special case of the life layer.** Wild animals take the life layer's systems: schedules (diurnal,
   nocturnal), jobs (hunt, graze), relations (beast riders meet less hostility from some animals). In core/tags
   a placed animal or citizen is `class: 'life'` with `kind` its species or role (`fauna` is not a class of its
   own); what it does over time is `core/simulation`'s, not a tag.

### The culture list, cleaned

`FURN_CULTURES` mixes three things: cultures, wealth tiers and generic sets. As tags:

| `FURN_CULTURES` entry | As a core/tags culture |
|---|---|
| `ancient` | `ancient` |
| `ancients-salvage` | `ancient` with `state: 'salvage'` (reused Ancients material, not a people) |
| `yuni-court`, `yuni-common`, `yuni-poor` | `yuni` with `wealth` rich, middle, poor |
| `sahelian` | `yuni` with `style: 'sahelian'` (Travis, 2026-10-05: folded into Yuni). Its pieces and buildings (the carved stool, strip loom, banco bed, clay oven; Yuni's Djenne-front houses and Sankore spires; the mud-banco finishes) are Yuni's Sahelian style, not a people of their own |
| `order`, `nomad`, `voth`, `iziz`, `beast-rider`, `lizardmen`, `eastabyss`, `xanadu`, `screamer`, `islander`, `republican`, `rustic`, `reedlake`, `post-apoc`, `hykkousoi` | themselves (`republican` and `rustic` are, with `painted`, the Highlands' three) |
| `painted` | `painted`: the Highlands' tribal culture (Travis, 2026-10-05) |
| `generic`, `scrap` | not cultures: the catalog's poor-tier sets any culture draws on. A piece keeps them as its catalog `set`, not its culture |

That leaves 18 cultures. `style` is a free tag beside `culture` for a culture's regional or period look (`sahelian`
for Yuni); it never stands in for the culture in a query. Kit and settlement names that are not in the list (`ys` uses
`hykkousoi`; `girder` and `mavs-refuge` use `beast-rider`) map by the build's adapter.

### A label, generated

The inspector's text is made from the record, never stored as text. For Iziz's first gatehouse:

```
{ id: 'bld_00042', uid: 'a91f3c07', class: 'building', kind: 'gatehouse', key: 'iziz_gate', name: 'Gatehouse 1',
  at: [212.0, 41.5, -96.0], ry: 1.57, size: [12, 9, 14],
  tags: { culture: 'iziz', types: ['military', 'infrastructure'], wealth: null, state: 'intact', lit: true } }
```

reads

```
Gatehouse 1
building · Iziz · military, infrastructure · intact · lit
12 × 9 m, 14 m tall · bld_00042
```

A bench placed by the furniture glue: `Bench (variant 2)` / `furniture · Beast Riders · seat · outdoor · in
bld_00017` / `1.8 × 0.5 m · furn_00311`. A plant instance: `Hypertree` / `flora · Köppen Af · harvest: wood,
pods` / `flora_00012#37`. The order of the parts is fixed (name; class, culture, types or kind, state, wealth
when not null, the flags; size and id), and a part with no value is left out. The culture's display name comes
from `FURN_CULTURE_INFO`.

## Open questions for Travis (answered above; kept for the record)

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
