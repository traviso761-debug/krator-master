# openworld/outposts: the player's settlements (KOUTPOST)

"Outpost" is the owner's shorthand for **any settlement the player founds**, from a camp to a town. NPC outposts and
settlements are not here, and stay conceptually and mechanically apart: they live in the scale model's settlements,
`core/hamlet`, `core/camp`, `core/city` and `core/simulation`. A player settlement only points at them through `refs`.
`PLAN.md` holds the design, the boundary (section 1) and where the two touch (section 7).

Everything here is `[G data]`: plain records keyed by `ps-` ids, edited only through an op log, with the rules as plain
functions. There is no three.js, no DOM and no SIM call. It reads `core/rand` (`KRAND`) and `core/space` (`KSPACE`) in
place.

| Path | What |
|---|---|
| `src/10-outposts-registry.js` | `KOUTPOST`: the record and its check, map and region coordinates, the op log (`apply`, `fold`, `save`), the founding rule, stable ids, `layout`, `simSpec`, `tradeWith`, `nearWorld`, `keepClear`, candidate sites |
| `tests/test-outposts.js` | `node openworld/outposts/tests/test-outposts.js`: 25 checks, each with a negative (run by `tools/test_all.py`) |
| `PORT.md` | the port lint's row (`python3 tools/check_port.py openworld/outposts`) |

## Adopting it

### An open-world page (a region)

Load `core/rand/08-core-rand.js`, `core/space/20-core-space.js` and `src/10-outposts-registry.js`, read in place. Then:

```js
const { reg, errors } = KOUTPOST.fold(playerSave);          // {ops}, or {} for a new game; errors names a refused op
for (const o of KOUTPOST.inRegion(reg, WORLD_DATA.frame, boxMetres)) {
  const p = KOUTPOST.toRegion(o.place, WORLD_DATA.frame);   // local metres: register in core/tags, draw by KOUTPOST.layout(o)
}
WORLD.clearHook = chainClear(WORLD.clearHook, KOUTPOST.keepClear(reg));   // the world's flora and NPC placement keep off
```

**The player founds a settlement** where they click. The page answers the ground and the NPC world's keep-clears; the
registry knows neither:

```js
const place = KOUTPOST.fromRegion(x, z, WORLD_DATA.frame, '5.1', 100);   // a world place, claim radius 100 m
const r = KOUTPOST.found(reg, { name, kind: 'hunt', size: 'camp', place, day: clock.day },   // clock = KCLOCK.make(...)
  { ground: (wx, wz) => myGroundOk(wx, wz), clear: (wx, wz, rr) => npcGroundAt(wx, wz, rr) /* a reason string, or null */ });
if (r.ok) playerSave.ops.push(r.op); else showWhy(r.why);   // 'too close to the player's ps-...', 'the world keeps this clear: ...'
```

**Later edits** are ops too. Each returns `{ok, why}`; `KOUTPOST.save(reg)` writes the log back out:
- `KOUTPOST.apply(reg, {op: 'SET', id, day, set: {state: 'active'}})`;
- a grown camp: `{op: 'SET', id, day, set: {size: 'village', links: {hamlet: <its KHAMLET village id>}}}`;
- `KOUTPOST.abandon(reg, id, day, cause)`;
- a loss: `{op: 'SET', id, day, set: {state: 'lost', lostTo: {kind: 'faction', id}}}`.

**The simulation:**
1. `SIM.settlement(KOUTPOST.simSpec(rec))`;
2. `KOUTPOST.apply(reg, {op: 'SET', id: rec.id, set: {links: {settlement: <its id>}}})`;
3. open trade with `SIM.trade` to the settlements in `KOUTPOST.tradeWith(rec)`.

`KOUTPOST.nearWorld(rec.place, scaleSettlements, 20000)` gives `refs` to the NPC places nearby. It reads them and keeps
none.

### A biome kit (candidate sites)

Write `biomes/<kit>/outposts.json`, a list of candidates. Each is:

```json
{"id": "firebliss:great-vale", "kit": "firebliss", "name": "Great Firebliss Vale",
 "place": {"map": "5.1", "px": 184, "py": 1318, "r": 900},
 "suits": ["home", "farm", "hunt", "trade"], "has": {"water": 1, "warmth": 1, "ground": 1, "resource": 0.5, "shelter": 1},
 "risks": ["gas", "flood"], "_note": "why"}
```

- `suits` takes `KOUTPOST.KINDS`. `has` takes `water`, `warmth`, `ground`, `resource` and `shelter`, each 0..1.
- Draw nothing for a candidate.
- The open world calls `KOUTPOST.offer('<kit>', list)`; bad entries come back in `errors` and are not kept.
- `KOUTPOST.candidatesNear(reg, x, z, r, {kind})` lists "places worth settling" best first, each with `held` (the player's
  live settlements on it).
- `KOUTPOST.found(reg, {candidate: 'firebliss:great-vale', kind, day})` founds a settlement on one.

The test's fixture carries the Firebliss Range's four oases and the Labyrinth's two pit tarns in this shape (`PLAN.md`
section 8).
