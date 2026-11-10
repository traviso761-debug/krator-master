# kits/tents: API

The kit runs on `core/engine` (the building-kit engine, read in place). Everything below is a global on the built page; the
`[G data]` parts (the table, the dresses, core/camp's mapping, the interiors set) are plain data and pure functions that load
in node as well (`tests/test-tents.js`).

## Placing a tent

```js
place(key, x, z, ry, {dress, role, trade, wear, world, cell, index, tags, y, v})
```

- `key`: a def, `tn-<form>-<size>` (`TN_KEYS`; `tnKey(form, size)`, `tnParse(key)`).
- `dress`: a `TN_DRESS` key or a culture key (`TN_DRESS_ALIAS`: `nomad` -> `desert`, `ashnomad` -> `ash`, `post-apoc` ->
  `postapoc` ...); unknown -> `generic`.
- `role`, `trade`: core/camp's (`TN_ROLES`, `TN_TRADES`); default the form's natural role (`tnRoleOf(form, size)`).
- `wear`: `new` | `worn` | `patched` | `ragged`; default drawn from the dress's weights by the seed.
- `world`, `cell`, `index`: the seed (`tnSeed(o, salt)` = `KRAND.hash(world, cell, index, salt)`): the colours, the wear, the
  patches and tears. Never a draw count.
- `tags`: the core/tags record's tags; pass `tnTags(role, trade, tnDress(dress), form)` (culture from the dress, types and job
  from the role). A tent in the `generic` dress carries the `generic` set and no culture: a host pitching it for a people
  passes that people's culture.
- `y`: the ground height at (x, z); the stakes follow `terrainH` under each one.

The record gets `rec.tent` (`{key, form, size, role, trade, dress, fallback, wear, patches, tears, door, zf, gear, interior}`)
and, for a form with a room, `rec.interior` (`{kind, culture, rooms, pieces, missing, residence, fails, walkTag, floors}`).

## The table (`src/33-tn-table.js`, `[G data]`)

| Name | What |
|---|---|
| `TN_FORMS[form]` | `{name, style, door, open?, nest?, cls?, sizes: {s, m, l}}`; `nest` says why a form has no room |
| `TN_ROLES[role]` | `{name, kind (kits/interiors room kind), types, job?, natural}` |
| `TN_TRADES[trade]` | `{name, kind, job, types?}`: smith, hide, seer, weaver |
| `tnSpec(key)` | the size's numbers with `form` and `size` |
| `tnDims(key)` | `{w, d, h}`: the declared box, guys and stakes counted (what core/camp pitches) |
| `tnRoom(key)` | `{poly, h, door: {at, w, swing}, posts}` in the local frame (+z the door), or `{skip: reason}` |

## The dresses (`src/41-tn-dress.js`, `[G data]`)

`TN_DRESS[key]`, `TN_DRESS_ORDER`, `tnDress(culture)` (with `.fallback` when it fell back), `tnPick`, `tnWear`, `tnWorn`. A
dress is `{name, culture, furn, cover: {key, cols}, roof?, alt?, pattern, band, lining, valance, pole, finial, emblem, field,
ink, ink2, door, rope, stake, floor, wear}` (the file's header has each field).

## core/camp (`core/camp/50-camp-tents.js`, `[G data]`)

| Call | What |
|---|---|
| `KCAMP.TENTS` | `ROLES`, `TRADES`, `YARD`, `FORM_SIZES`, `CULTURES` (per culture row: its dress and the def each role takes), `ALIAS` |
| `KCAMP.tentFor(role, {culture, trade, size})` | `{key, role, trade, dress, kind, pkey, fallback?}`; a size the form lacks takes the nearest |
| `KCAMP.tentKey(key, role, trade)`, `KCAMP.tentParse(pkey)` | the program key `tn-yurt-m@workshop:smith` and back |
| `KCAMP.tentProgram({id, culture, households, sleeping, chief, council, trades, supply, trade, guard, mess, stable, latrine, size, wind, formation})` | `{culture: 'tents:<row>', program: {tents, pens}, row}`; registers the row in `KCAMP.CULTURES` for `KCAMP.pitch` and `KCAMP.census` |
| `KCAMP.tentDims(dims)` | `dims(pkey, v)` for `KCAMP.pitch` from the kit's `tnDims`, grown by the role's yard |
| `KCAMP.halt({id, world, culture, wagons, site, way, formation: 'laager' | 'line', dims, ground, gap, wind})` | a caravan's night halt: `{id, site, formation, culture, gate, way, wind, records, short}` |

A host pitches a band of any people:

```js
const P = KCAMP.tentProgram({id, culture: 'nomad', households: 6, sleeping: 2, trades: ['smith', 'seer']});
const camp = KCAMP.pitch({id, world, culture: P.culture, program: P.program, site, way, formation: 'ring',
                          dims: KCAMP.tentDims(k => tnDims(k)), ground});
for (const r of camp.records) { const q = KCAMP.tentParse(r.key);
  place(q.key, r.x, r.z, r.ry, {role: q.role, trade: q.trade, dress: KCAMP.TENTS.CULTURES['desert'].dress, world, cell, index,
        tags: tnTags(q.role, q.trade, tnDress('desert'), tnParse(q.key).form)}); }
```

## The interiors set (`kits/interiors/sets/tents.js`)

`IX.TENTS.KINDS` (role -> room kind), `IX.TENTS.item(key, {kind, culture, wealth})` (the def's item as that room kind; only a
cottage is a residence). Regenerate the items from the table with `node kits/tents/tests/test-tents.js --write`.

## The probe (`window._api`, `src/99-host-tn.js`)

`tents()`, `stakes()`, `interiors()` (the kit's own: it replaces the engine's, which this kit does not opt into), `camps()`,
`doorsAudit()`, `reachAudit()`, `combos()` (every culture row x role furnished off the sheet), `fingerprint()`, `rebuild()`;
with the engine's `footprints()`, `doors()`, `furniture()`, `tags()`, `materials()`, `kitCoverage()`, `nanSweep()`.
