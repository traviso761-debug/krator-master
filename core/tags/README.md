# core/tags: one registry of what a placed thing is

Every build registers what it places, but in seven shapes that never met (`PROPOSAL.md`, "Why"). This module is the
one record they forward into: an id, a position hash, a class, a kind, and tags from one vocabulary, checked and
exported for Godot (GODOT-PLAN.md Phase 2 item 3; rule 4: everything placed is registered here, with its class and
tags, before it is drawn). It holds no geometry, collision, draw or live state. `PROPOSAL.md` is the design and
Travis's decisions; this file is what was built.

| Fragment | Tag | What |
|---|---|---|
| `50-core-tags.js` | [G data] | `KTAGS.create({build})`: the registry (`add`, `child`, `get`, `remove`, `query`, `at`, `audit`, `export`), the ids, `KTAGS.uid`, `KTAGS.norm` (the input mapping and the checks). No THREE, no DOM: it runs in node. Needs `core/rand` (the uid is a `KRAND.hash`) |
| `52-core-tags-vocab.js` | [G data] | `KTAGS.VOCAB`: classes, the 23 cultures and their display names, the aliases, types, wealth, states, settings, jobs, Köppen, fixture kinds, the known tag keys, the id prefixes. The catalog's lists are copied, not read |
| `53-core-tags-host.js` | [web] | `KTAGS.label(rec, instance)`: the inspector's text, generated from the record |
| `opt/54-core-tags-sound.js` | [G data] | opt-in (a subfolder, so the settlements that take every file in `core/tags` do not take it): the `sound` key and `VOCAB.soundKinds`; `KTAGS.sound` (a record from its kind), `KTAGS.soundLevel` and `soundAt` (gain and pitch for a wind). Its test is `test-sound.js`, its twin `ksound.gd` (`golden-sound.json`) |
| `test-tags.js` | | the node test: the vocabulary against the catalog's source, each check with a negative, a fixed run's ids, the pinned uid and export digest, the proposal's three labels, `golden.json` |
| `ktags.gd`, `ktags_test.gd`, `golden.json` | | the uid in GDScript and its vectors; copied to `godot/tests/tags/` by `godot/tools/sync_core.py` |

```
node core/tags/test-tags.js                    # 'all passed'
node core/tags/test-tags.js --write            # rewrite golden.json after a change to the uid you meant
python3 godot/tools/sync_core.py && godot --headless --path godot --script res://tests/tags/ktags_test.gd
```

## The record

```
{ id, uid, class, kind, key, name, parent, at: [x, y, z], ry, size: [w, d, h] (or r, h), tags: {...}, note, src: { build, frag } }
```

- `class`: `building part fixture furniture prop flora life landmark infrastructure feature`. An unknown class
  throws (a programming error); `fauna` throws with the reason: a placed animal or citizen is `life`, its species or
  role is `kind` (Decisions 7).
- `at`: the base centre, world metres, +Y up, x east, z south. `x, y, z` on input work too. Numbers keep 4 decimals.
- `ry`: three's rotation.y (the front, +z, turns to (sin ry, cos ry)); `yaw` is an alias on input.
- `size`: full extents in the record's own frame; a round thing gives `r` (and `h`).
- `parent`: what it belongs to (a door's building), or null. `T.child` sets it.
- `removed: true` on a removed record; it stays, keeps its id, and `query` and `at` skip it.

## Ids

**The order id** `<prefix>_<5 digits>`: one counter per prefix, from `00000`, in registration order. The prefix is
the class's (`bld part fix furn prop flora life site infra feat`), a fixture's its kind's (`door window light`), or
`rec.prefix`. A record may bring its own id (Yuni's `bld_00042`, core/furnish's `furn_00001`): it passes through
unchanged, and its prefix's counter moves past it so a later made id never collides. A duplicate id throws. A
child's id is a path, `<parent>.<kind or class>.<n>` with a counter per parent and kind (`bld_00098.room.4`). Ids
are never reused: a removed record keeps its own.

**The uid** names a thing across versions of a build (a save that names a building finds it after the build
changes and the order ids shift). It is

```
KRAND.hash(0, str32(class), str32(key), x * 10 + 0.5, y * 10 + 0.5, z * 10 + 0.5)    as 8 lowercase hex digits
```

- `str32(s)`: FNV-1a (offset `0x811C9DC5`, prime `0x01000193`, `Math.imul`) over the UTF-16 code units of `s`, as an
  int32. A null key is `''`. This is the string hash `KRAND.child` uses.
- `KRAND.hash` floors each argument, so each coordinate is `floor(v * 10 + 0.5)`: the position in 10 cm steps,
  rounded half up. The arguments are `at`, after the record's 4-decimal rounding.
- Pinned: `KTAGS.uid('building', 'iziz_gate', [212, 41.5, -96])` is `7bd10f69`. `ktags.gd` gives the same for all
  of `golden.json` in Godot 4.5 (2026-10-05).

The uid is not unique by construction: two records of one class and key within the same 10 cm cell share it. It
matches, the order id names.

**An instance** of an item's record (a plant in a scattered item) is `flora_00012#37` (`KTAGS.instanceId`): the
record's id and the instance's index. An instance has no record; its tags are the item's (Decisions 5).

## Item sets

An item placed many times (a biome kit's foliage clump, boulder or dart: tens of thousands of instances on a page) is
one record, an **item set**, and its instances are rows of a table the registry reads but does not copy (2026-10-12,
for the biome kits; Decisions 5):

```
const S = T.addSet({ class: 'flora', kind: 'fern', key: 'frond', name: 'Fern', at: [0, 0, 0], tags }, table)
                                  -> an ordinary record (its own id and uid) with set: true and count
T.instance(S, 37)                 -> { id: 'flora_00012#37', uid, class, kind, key, name, parent: S.id, at, ry, size, tags }
T.get('flora_00012#37')           -> the same
T.uidOf(S, i), T.uid32Of(S, i)    -> instance i's uid (8 hex digits; the u32), T.uids(S) -> all of them, a Uint32Array
T.count(S), T.sets(), T.isSet(r), T.table(S)
```

- **The table** is anything with `n` (a number, or a getter) and `pos(i, out)` -> `[x, y, z]`; `ry(i)` and
  `size(i, out)` -> `[w, d, h]` are optional. `KTAGS.table()` is a growable typed-array one (`push(x, y, z, ry, w, d, h)`);
  core/biome passes a reader over its own instance matrices, so a plant costs the registry nothing.
- **An instance's `at`** is its position exactly as the table stores it (no 4-decimal rounding), and its uid is
  `KTAGS.uid(class, key, at)` of the set's class and key, so `T.instance(S, i).uid` always recomputes from the
  instance's own fields. A float32 table gives float32 positions: Godot reads the same floats from the export's
  matrices and gets the same uid (`godot/tests/tags/records_test.gd`).
- The set's own `at` is what the build gives (core/biome: `[0, 0, 0]`): its uid names the item, not a place.
- **The instance record is built on demand** and shares the set's `tags` object. The table is read, not copied: a
  moving animal's instance answers where it is now, so its uid is where it stood when asked. Its order id
  (`life_00003#2`) is what names it.
- `audit()` adds `sets`, `instances` and `instancesByClass` when the registry has a set (a registry without sets keeps
  its old shape). `export()` writes each set with its `count`; `export({ instances: true })` adds each set's `table`
  (`at`, `ry`, `size`, `uid` as plain arrays) on a copy, for a small registry or a test. A page's export leaves the
  tables out: the meshes' side tables carry the uids (`biomes/GODOT.md`, "Records").

## Tags

Open but checked. `KTAGS.norm(tags)` maps the input, then checks each key against `VOCAB.keys`:

| Key | Values |
|---|---|
| `culture` | the 23 cultures (`VOCAB.cultures`); display names in `VOCAB.cultureNames`. `VOCAB.noCatalog` lists the two (Jimjam, Dalab, 2026-10-20) that have no catalog furniture set: every other culture is a catalog culture or an alias of one |
| `types` | a list from `BUILDING_TYPES` plus `park`, `military`, `statue`; a single string becomes a list |
| `wealth` | `poor`, `middle`, `rich` or `null`. A number 0..1 maps `< .35` poor, `< .7` middle, else rich; `common` is middle, `court` rich, `civic` null |
| `tier` `state` `setting` `job` `koppen` `set` | the catalog's tiers; `intact ruined rehab toppled salvage`; `indoor outdoor both room`; `FURN_JOBS`; the Köppen codes plus `X` and `H`; `generic scrap` |
| `door`, `light` | Yuni's `DOOR_STYLES`, `LIGHT_KINDS` |
| `lit` | a boolean |
| `harvest` | an object `{ wood, edible: [], medicinal }` |
| `climate`, `aridity` | the root README's flora bands: `hypertropic tropic subtropic temperate montane cold polar`; `arid semiarid mild subhumid humid`; or a range of two, `arid..humid` (`VOCAB.ranges`) |
| `abyssal`, `riparian` | a boolean; `yes`, `no`, `both` (kits/fauna's `non` and `riparian` map onto `no` and `yes`) |
| `diet` | free (an animal's: `fish`, `grass`...) |
| `fire`, `form`, `origin`, `heat`, `plume`, `spiral` | free: a kit's own trait on every species (crater-drylands' fire response, ehighlands' growth form, geyser's and the Throne's origin, geyser's heat, the Throne's plume, shighlands' spiral habit) |
| `style` `room` `biome` `family` `variant` | free |
| `trap` | an object: a carnivorous plant's trap record (`core/biome/37-core-traps.js`) |
| `hazard` | an object (2026-10-26): what can hurt a walker, `{kind, effect, danger, dose, shape, falloff, cycle, trigger, move, nav, tell, stateFn, seed}`; `kind` one of `VOCAB.hazardKinds` (heat cold gas acid poison fall pit thorn grab drown sink slip crush hunter lava fire luck trap time mine), whose row fills the rest. Read by core/hazard (`KHAZ`; `core/hazard/README.md`) |
| `taboo` | an object (2026-10-26, the Outlands' C6): an area a people will not build in, `{of: null (every people) \| [culture...], why, shape}`. A record is of a people by `tags.faction`, else `tags.culture`. Placement asks `KHAZ.forbids` / `KHAZ.tabooOk` (`core/hazard/README.md`, "Adopting it" step 5) |

The culture aliases (`PROPOSAL.md`, "The culture list, cleaned"): `yuni-court`, `yuni-common`, `yuni-poor` are
`yuni` with wealth rich, middle, poor; `sahelian` is `yuni` with `style: 'sahelian'`; `iziz-old` is `iziz`;
`ancients-salvage` is `ancient` with `state: 'salvage'`; `generic` and `scrap` are no culture, `set` instead. An alias
never overwrites a tag the record gives, a `null` included (a civic Yuni building keeps `wealth: null`).

An unknown key or value stays on the record as given and is counted by `T.audit()` (`unknownKeys`,
`unknownValues`, `unknown`), never thrown. `audit()` also counts buildings with no culture or no type. A build that
adopts core/tags must read zero unknowns; when it does not, the vocabulary is wrong, not the build.

**The vocabulary's sources.** The catalog's lists (`FURN_CULTURES`, `BUILDING_TYPES`, `FURN_TIERS`, `FURN_JOBS`,
`FURN_SETTINGS`) and the display names (`FURN_CULTURE_INFO` and each culture file's `FURN_CULTURE(key, { name })`) are
copied into `52-core-tags-vocab.js`, so a build need not load the catalog. `test-tags.js` reads the catalog's source
and fails when a copy drifts. A new culture in the catalog is a failing test until the vocabulary takes it. A settlement's culture with no furniture set yet goes in `noCatalog` instead of the catalog.

## The label

`KTAGS.label(rec, instance)` (53, [web]) makes the inspector's text, never stored (Decisions 6). Parts in a fixed
order, each left out when empty:

1. the name; else the kind or key; else the class
2. class · culture · types (else kind, when there is a name) · job · state · setting · wealth · Köppen · harvest · lit ·
   `hazard: <kind> (<effect>), danger d` · `taboo to <peoples>` · in parent
3. `w × d m` (or `⌀ d m`), `, h m tall` from 2 m up; then the id (`#n` for an instance)
4. the note

```
Gatehouse 1
building · Iziz · military, infrastructure · intact · lit
12 × 9 m, 14 m tall · bld_00042
```

**The hazard's words and overlay** (53, [web], core/hazard loaded): `KTAGS.hazardNow(rec, t, point)` is the state line
(`hazard now: on · 100% · 40 s to the next · dose 0.85/s here · paths avoid it`), `KTAGS.hazardAt(x, y, z, t)` the same for
every hazard at a point, and `KTAGS.hazardLayer()` the host layer that draws each hazard's shape tinted by its kind and
danger (`core/hazard/README.md`, "The overlay and the inspector").

## The export

`T.export()` is `{ format: 'krator-tags', version: 1, build, convention, vocab, records }`. Godot reads it as
`tags.json` and puts each record on its node as the `"krator"` metadata (`godot/krator/records_import.gd`); a
MultiMesh keeps the records of its instances in a side table (`"records"` metadata, by instance index).

## Who takes it

| Build | Since | Adapter |
|---|---|---|
| Yuni | 2026-10-05 | `src/51-fixtures.js`: `FIX_TAGS`, fed by `FIX_BUILDING_BEGIN` and `fixReg` (buildings, doors, windows, lights; ids unchanged). `KRATOR_EXPORT.tags()`, `KRATOR_EXPORT.tagAudit()`. 13044 records, zero unknowns |
| Girder, Mav's Refuge, Locus, Highlands, Roketstad, Post-Apoc | 2026-10-05 | core/furnish: their adapter passes `tags: KTAGS.create({build})` and every piece the placement keeps is registered as class `furniture` (`KFURN.tag`: kind the catalog type, culture, tier, job, setting, room, wealth; parent the building as the build names it). Post-Apoc starts a fresh registry with each world (its ids restart). `core/furnish/fingerprint.py` prints each page's tag audit |

| Iziz (all five targets) | 2026-10-05 | `src/91t-iziz-tags.js`: `REG` read once the world is built, before the first frame (77z-iziz-style rolls trial builds back, so reading as `REG` grows would keep undone records). The class from REG's `cls` (farm plots are features; city furniture by type: plaza a feature, statue a landmark, else a prop; the biome's untagged trees flora, its animals life). Records keep REG's `r`, `h`; a tag `note` becomes the record's note. City: 783 records, zero unknowns |
| Voth | 2026-10-05 | `src/97t-voth-tags.js`: `PLACED` (the claim grid) and the inspector's canton-top footprints (`_inspectFP`), read before the first frame (`gridRemove` takes claims back). `VOTH_TAG_CLASS` turns each claim tag into a class, kind and types; town houses keep their true footprint, base, height, style (`hlaalu velothi domed hovel`) and wealth. 4165 records, zero unknowns. Canton-top records stand at the ground's height under them, not on their deck (inspectClaim keeps no y) |

The vocabulary took Iziz's older spellings as input aliases (2026-10-05): the keys `type` (as `types`) and `place` (as
`setting`); the types `market/shop`, `tavern/inn`, `single-family dwelling`, `multi-family dwelling`; the cultures
`ancients`, `ancients-transplant` (style `transplant`), `ancients-reclaimed` (state `reclaimed`), `iziz-vernacular`
(style `vernacular`), `yuni-order`; the states `destroyed` (ruined) and `rehabilitated` (rehab). New values: types
`plaza`, `fountain`; state `reclaimed`; keys `role`, `quarter`, `part`, `finish`, `destination`, `stalls`, `canopies`
(free), `landmark`, `market` (booleans).

**`KTAGS.page`** is the page's registry, set by the build where it creates it, so an exporter or a probe finds it
without knowing the build (`KTAGS.page.export()`, `KTAGS.page.audit()`).

| The 16 biome kits and the Throne's 10 stations | 2026-10-12 | core/biome (`20-core-kit.js`, "core/tags: what a kit places, as records"): the host passes `BIO.init({ tags: '<build>' })` and the core makes the registry (`KTAGS.page`) at first use. Every item a kit puts is an item set (class `flora`, `life` for an animal, `feature` kind `rock` for a stone; key the item's name; tags the biome, the kit's `TAGS`, its species', plant's or animal's own: harvest, Köppen, diet), read from the item's own instance matrices; `BIO.dynamic` fauna too. Every volume a kit registers (`BIO.register`, or the host's `REGISTER`, which now calls `BIO.record`: trees, logs, herds) is a plain record. Hyperjungle: 28 sets holding 320,125 instances and 225 volumes, zero unknowns; every kit reads zero unknowns (the numbers per kit are in `biomes/GODOT.md`, "Records") |

A build lists `core/rand` and `core/tags` the way it lists `core/lod` (its `build.py`: `RAND_DIR`, `TAGS_DIR`, the
fragment names in `DETERMINISTIC`; a biome kit: `CORE_TAGS`). `godot/tools/export_spike.py` writes any page's
`KTAGS.page` as `tags.json`. Every export node now names its record where one exists: a biome item its set and a uid
per instance, a bucket the volumes it merges (`BIO.export`), a glTF node its record in its extras and a MultiMesh a
`krator_records` side table (`godot/tools/spike_export.js`); the Godot importers put them on node metadata.

## Adopting it: the sound key (H9, 2026-11-03)

`opt/54-core-tags-sound.js` is opt-in: list it by path after `52-core-tags-vocab.js`. It sits in a subfolder because a dozen
settlements take every numbered file in `core/tags`, and those pages must not change. It adds the `sound` key (rule `object`) and
`VOCAB.soundKinds`, and changes nothing else, so a page without it is untouched. An aeolian emitter is a record like anything placed:

```js
T.add({class: 'feature', kind: 'sound', key: 'gjar', at: [x, y, z], r: 40, tags: {sound: KTAGS.sound({kind: 'gjar-organ', axis, seed})}});
```

- **The modes.** `edge` is vortex shedding off a rib or edge (Strouhal: f = .2 u / d). `pipe` is a fissure or a gap closed at its
  foot (f0 = c / 4 (L + .6 r)), overblown to the odd harmonics as the wind rises. `cavity` is a Helmholtz hole, one tone.
- **The presets.** `bamboo-howl` is hyperjungle's howl bamboo, about 75 Hz. `gjar-organ` is High Rift's Singing Gjár: its fundamental
  is under hearing, and its odd harmonics are a drone. `rib-flute` is Outland Gate's singing buttress in the Outland Bore.
- **The wind.** `axis` makes only the wind across that line count (a fissure's strike). The detune is drawn once, from
  `KRAND.hash(seed)`, and stored on the record.
- **Reading it.** `KTAGS.soundLevel(snd, {speed, dir}, {T})` gives `{on, gain, pitch, partials}`; `soundAt` adds the fall with distance.
  Godot reads the exported record with `ksound.gd`'s `level` and `at`, the same numbers to 1e-13.
- **Not written:** core/audio, which would play these. The page can do without it (PLAN-LANDS H9).

## Adopting it: the hazard and taboo keys

A page that already takes core/tags has the keys: the vocabulary (52) carries them, and its records may carry them.
- **A hazard**: `tags: {hazard: {kind}}` on a record (the kinds and what each fills: `VOCAB.hazardKinds`). For the state,
  the dose, the overlay and the export, take core/hazard (`core/hazard/README.md`, "Adopting it").
- **A taboo**: `tags: {taboo: {of: null | [culture...], why}}` on the area's record, registered before anything of a people
  is placed. The label says `taboo to <peoples>`. The placement check is core/hazard's: `KHAZ.tabooOk(culture)` for
  core/city's `rules.groundOk` or a scatter's `accept`, and `KHAZ.tabooAudit()` in verify.
- **The digest**: the vocabulary is in the export, so adding a kind or a key moves `test-tags.js`'s DIGEST (f8fc8840 with
  lava, fire, luck, trap, time, taboo, the ambient rows, acid rain and the dust storms). Rewrite it with a note of what moved it.
