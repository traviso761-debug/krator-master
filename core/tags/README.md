# core/tags: one registry of what a placed thing is

Every build registers what it places, but in seven shapes that never met (`PROPOSAL.md`, "Why"). This module is the
one record they forward into: an id, a position hash, a class, a kind, and tags from one vocabulary, checked and
exported for Godot (GODOT-PLAN.md Phase 2 item 3; rule 4: everything placed is registered here, with its class and
tags, before it is drawn). It holds no geometry, collision, draw or live state. `PROPOSAL.md` is the design and
Travis's decisions; this file is what was built.

| Fragment | Tag | What |
|---|---|---|
| `50-core-tags.js` | [G data] | `KTAGS.create({build})`: the registry (`add`, `child`, `get`, `remove`, `query`, `at`, `audit`, `export`), the ids, `KTAGS.uid`, `KTAGS.norm` (the input mapping and the checks). No THREE, no DOM: it runs in node. Needs `core/rand` (the uid is a `KRAND.hash`) |
| `52-core-tags-vocab.js` | [G data] | `KTAGS.VOCAB`: classes, the 20 cultures and their display names, the aliases, types, wealth, states, settings, jobs, Köppen, fixture kinds, the known tag keys, the id prefixes. The catalog's lists are copied, not read |
| `53-core-tags-host.js` | [web] | `KTAGS.label(rec, instance)`: the inspector's text, generated from the record |
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

## Tags

Open but checked. `KTAGS.norm(tags)` maps the input, then checks each key against `VOCAB.keys`:

| Key | Values |
|---|---|
| `culture` | the 20 cultures (`VOCAB.cultures`); display names in `VOCAB.cultureNames` |
| `types` | a list from `BUILDING_TYPES` plus `park`, `military`, `statue`; a single string becomes a list |
| `wealth` | `poor`, `middle`, `rich` or `null`. A number 0..1 maps `< .35` poor, `< .7` middle, else rich; `common` is middle, `court` rich, `civic` null |
| `tier` `state` `setting` `job` `koppen` `set` | the catalog's tiers; `intact ruined rehab toppled salvage`; `indoor outdoor both room`; `FURN_JOBS`; the Köppen codes plus `X` and `H`; `generic scrap` |
| `door`, `light` | Yuni's `DOOR_STYLES`, `LIGHT_KINDS` |
| `lit` | a boolean |
| `harvest` | an object `{ wood, edible: [], medicinal }` |
| `style` `room` `biome` `family` `variant` | free |

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
and fails when a copy drifts. A new culture in the catalog is a failing test until the vocabulary takes it.

## The label

`KTAGS.label(rec, instance)` (53, [web]) makes the inspector's text, never stored (Decisions 6). Parts in a fixed
order, each left out when empty:

1. the name; else the kind or key; else the class
2. class · culture · types (else kind, when there is a name) · job · state · setting · wealth · Köppen · harvest · lit · in parent
3. `w × d m` (or `⌀ d m`), `, h m tall` from 2 m up; then the id (`#n` for an instance)
4. the note

```
Gatehouse 1
building · Iziz · military, infrastructure · intact · lit
12 × 9 m, 14 m tall · bld_00042
```

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

A build lists `core/rand` and `core/tags` the way it lists `core/lod` (its `build.py`: `RAND_DIR`, `TAGS_DIR`, the
fragment names in `DETERMINISTIC`). Next (PROPOSAL.md, "Order of adoption"): the biome kits, once
placement writes plant records (the reseeding event). `godot/tools/export_spike.py` writes any page's `KTAGS.page` as
`tags.json`; the glTF importer keeps it as data (root meta `tags`) until the exporter names each mesh's record.
