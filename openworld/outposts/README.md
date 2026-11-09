# openworld/outposts: the outpost registry (KOUTPOST)

The world's list of outposts, the player's and everyone's: where each is, whose, what kind, its state and dates, and
the ids of the records that draw or run it (`core/camp`, `core/hamlet`, `core/city`, `core/simulation`). No spot is
picked for the player; kits may offer candidate sites as hints. `PLAN.md` is the design and the reasons (why it lives
in the open world and not in `core/`).

Everything here is `[G data]`: plain records keyed by stable ids, edited only through an op log, rules as plain
functions; no three.js, no DOM, no SIM calls. It reads `core/rand` (`KRAND`) and `core/space` (`KSPACE`) in place.

| Path | What |
|---|---|
| `src/10-outposts-registry.js` | `KOUTPOST`: the record and its check, map and region coordinates, the op log (`apply`, `fold`, `save`), the founding rule, stable founded ids, nearness, `simSpec`, candidate sites |
| `data/scale-outposts.json` | the scale model's ten `outpost`-typed settlements (map 5.1), the seed |
| `tests/test-outposts.js` | `node openworld/outposts/tests/test-outposts.js`: 24 checks, each with a negative (run by `tools/test_all.py`) |
| `PORT.md` | the port lint's row (`python3 tools/check_port.py openworld/outposts`) |

## Adopting it

### An open-world page (a region)

Load `core/rand/08-core-rand.js`, `core/space/20-core-space.js` and `src/10-outposts-registry.js` (read in place), then:

```js
const file = /* the world's base file: {format:'krator-outposts/1', seed, ops}, or a new one: */
  { seed: KOUTPOST.seed(SCALE_OUTPOSTS.settlements, '5.1'), ops: [] };
const { reg, errors } = KOUTPOST.fold(file);          // errors names the first refused op, if any
const mine = KOUTPOST.inRegion(reg, WORLD_DATA.frame, boxMetres);   // the outposts in this region
for (const o of mine) {
  const p = KOUTPOST.toRegion(o.place, WORLD_DATA.frame);         // local metres: register in core/tags, then draw
}
```

**The player founds an outpost** where they click (the page's own ground test decides what is buildable):

```js
const place = KOUTPOST.fromRegion(x, z, WORLD_DATA.frame, '5.1', 100);   // a world place, claim radius 100 m
const r = KOUTPOST.found(reg, { name, kind: 'hunt', owner: { kind: 'player', id: 'player' }, place, day: clock.day },   // clock = KCLOCK.make(...)
                         { ground: (x, z) => myGroundOk(x, z) });   // ground in world metres: convert back if needed
if (r.ok) save.ops.push(r.op); else showWhy(r.why);    // r.why: 'too close to op-... (The Gate)', 'ground: ...'
```

Later edits are ops too: `KOUTPOST.apply(reg, {op:'SET', id, day, set:{state:'active'}})`, `KOUTPOST.abandon(reg, id,
day, cause)`, a retake `{op:'SET', id, day, set:{state:'active', owner:{...}}}`. `KOUTPOST.save(reg)` writes the base file
back; the player's save is its `ops`.

**On the simulation:** `SIM.settlement(KOUTPOST.simSpec(rec))`, then
`KOUTPOST.apply(reg, {op:'SET', id: rec.id, set:{links:{settlement: <its id>}}})`. A hunting camp is pitched with
`KCAMP.pitch` and linked as `links.camp`; a growing mine or farm is laid out with `KHAMLET.village` (`links.hamlet`).

### A biome kit (candidate sites)

Write `biomes/<kit>/outposts.json`: a list of candidates, each

```json
{"id": "firebliss:great-vale", "kit": "firebliss", "name": "Great Firebliss Vale",
 "place": {"map": "5.1", "px": 184, "py": 1318, "r": 900},
 "suits": ["farm", "hunt", "trade"], "has": {"water": 1, "warmth": 1, "ground": 1, "resource": 0.5, "shelter": 1},
 "risks": ["gas", "flood"], "_note": "why"}
```

`suits` takes `KOUTPOST.KINDS`; `has` takes `water`, `warmth`, `ground`, `resource`, `shelter`, each 0..1. Draw nothing for
a candidate. The open world calls `KOUTPOST.offer('<kit>', list)` (bad entries come back in `errors`, unkept) and
`KOUTPOST.candidatesNear(reg, x, z, r, {kind})` for "places worth settling", best first, each with `held` (the live
outposts on it). `KOUTPOST.found(reg, {candidate: 'firebliss:great-vale', kind, owner, day})` founds on one. The test's
fixture carries the Firebliss Range's four oases and the Labyrinth's two pit tarns in this shape (`PLAN.md` section 8).
