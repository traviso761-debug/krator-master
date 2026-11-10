# The player's settlements (KOUTPOST): the plan

*2026-11-09.* The owner asked for "some kind of registry for outposts ... that should probably go more in the open world
code", then clarified: **"an npc outpost should remain conceptually and mechanically distinct from a player outpost. i am
using outpost as a shorthand for any player settlement."**

So this registry holds **the player's settlements**: every place the player founds, from a first camp to a town. It
holds no NPC place. A search found nothing like it before: `outpost` was a settlement type in the scale model (ten NPC
places), a word in `core/simulation/ROADMAP.md` (sections 9, 10 and 31: "Player establishes an outpost -> Player
Settlement created") and a word in the open worlds' `data/region.json`.

## 1. Two kinds of place, kept apart

| | An NPC settlement or outpost | A player settlement (this registry) |
|---|---|---|
| **Who owns it** | a people, faction or order of the world (`LORE.md`) | the player's faction, always |
| **Who grows it** | the world: its records as written, and later the world tick (`core/camp/PLAN.md` section 7) | the player: founding, building, growing, leaving |
| **Where it is declared** | the scale model's settlements (`tools/scale-model`), settlement builds, `core/city` plans, `core/hamlet` villages, `core/camp` bands, `core/simulation` settlements | `openworld/outposts`, through the player's ops |
| **Its record** | that module's own record | `KOUTPOST`'s record (section 3) |
| **Its id** | that module's ids (scale doc ids such as `sthegate`, a hamlet's or a band's id, a sim settlement id) | `ps-<base36>`; the registry refuses any other |
| **Its rules** | the module's own (layout, census, economy) | the founding rule, the state table and the op log (sections 4 to 6) |
| **Its save data** | the world's data files (the scale model, `world/*.json`, each build's `src/`) | the player's save: `{format: 'krator-player-settlements/1', ops}`, and no seed |

The registry is **mechanically** sealed:
- it starts empty and is never seeded from the world. `fold` refuses a save that carries a `seed`;
- `ADD` takes only `ps-` ids belonging to the registry's own player. An NPC place (`op-sthegate`, or any id) is refused;
- nothing in it edits, copies or wraps an NPC record. A player settlement only points at the NPC world through
  **references** (`refs`, section 3), which are plain ids across the boundary. A ref may not name a `ps-` id;
- the NPC side never stores a player settlement either. The simulation runs one as its own settlement record (section 7),
  and the world's placement reads its ground as a keep-clear disc (section 7). Neither is a shared type.

A settlement can cross the line only one way: when it is **lost** to the world (taken by a faction, an org or a people),
its record stays here with `state: 'lost'` and `lostTo` names the taker. If the world keeps it as one of its own places,
the NPC side makes its own record under its own id, and this registry's record keeps the history. When the player retakes
it, the record comes back to `active`.

## 2. Where it lives: `openworld/outposts/`, not `core/`

- **It is world-scale.** A player settlement is one record for the whole world, wherever the player stands. The open
  world streams regions of the scale model (`little-demo`, `isle-demo`, `north-basin`). The registry sits above them,
  in a folder of the open world shared by every region (like `openworld/ANCIENT-ROADS.md`), not in one region's `src/`.
- **No build needs it to make its page.** `core/` holds what builds take to make their pages. A settlement build never
  needs to know the player's settlements; the open world does.
- **No core part is needed.** The registry reads `core/rand` (`KRAND.hash`, for founded ids) and `core/space` (`KSPACE`,
  for the nearness index) in place, and links to `core/camp`, `core/hamlet`, `core/city` and `core/simulation` by id
  only. It calls none of them, so none changes, and no core file is edited.
- **Dependencies run one way** (`MODULARITY-PLAN.md`): `openworld/outposts` depends on `core/`; `core/` never names it.
  Biome kits do not depend on it either: a kit offers candidate sites as plain data (section 8).

If a game layer (Godot's, or a host's) needs it everywhere, the fragment moves unchanged: it is `[G data]`.

## 3. The record

```
{ id:      'ps-7yy78b',                   stable, never reused (section 6)
  player:  'player',                      the player's faction id; the registry's own, fixed
  name:    'Ridge camp',
  kind:    'hunt',                        what it is for: KOUTPOST.KINDS
  size:    'camp',                        camp | hamlet | village | town (it grows by SET)
  place:   {map:'5.1', px:700, py:900,    the scale model's pixel and its version (the map moves: section 5)
            x:1400000, z:1800000,         world metres on that map: px * 2000, py * 2000 (x east, z south)
            y:null, r:100},               ground height if known; the claim's radius in metres
  state:   'active',                      KOUTPOST.STATES (section 4)
  founded: 1,                             world day (core/clock's day number); always a day: it is founded in play
  left:    null,                          the day it left the player's hands (abandoned, lost, destroyed); null while held
  lostTo:  null,                          on a lost settlement: {kind: faction | org | people, id}, a ref to its taker
  links:   {settlement, camp, hamlet, city, candidate},   ids of what runs and draws THIS settlement
  refs:    [{kind:'sim', id:'kautoa', rel:'trade'},       references across the boundary to NPC places
            {kind:'scale', id:'sthegate', rel:'near'}],
  tags:    [], _note: '...' }
```

- **Kinds** (`KOUTPOST.KINDS`): `home`, `post` (no purpose stated), `trade`, `hunt`, `mine`, `works` (a sulphur works, a
  salt pan: a resource worked rather than lived at), `farm`, `waystation` (a toll, a ford, a pass), `fort`.
- **Sizes and their layout** (`KOUTPOST.layout(rec)`): a `camp` is pitched by `core/camp` (`links.camp`), a `hamlet` or
  `village` by `core/hamlet` (`links.hamlet`), a `town` by `core/city` (`links.city`; `core/city` is to become the
  player's settlement builder). The registry stores the link; the page that draws it follows the link.
- **`links` versus `refs`.** `links` are ids of records that exist *for this settlement* (its own sim settlement, its own
  camp or village layout, the candidate it was founded on). `refs` point *out* at the NPC world: `kind` is one of `scale`,
  `sim`, `camp`, `hamlet`, `city`, `faction`, `people` or `region`, and `rel` is one of `near`, `trade`, `ally`,
  `rival`, `supply` or `took`. A ref is a fact the player's settlement holds about the world; the world's record does
  not change.

## 4. States

| from | to |
|---|---|
| `claimed` (staked, not built) | `active`, `abandoned` |
| `active` (built and held) | `abandoned`, `lost`, `destroyed` |
| `abandoned` (left standing) | `active` (the player returns), `ruined`, `lost` (someone moves in) |
| `ruined` (fallen in) | `active` (rebuilt on the ruin) |
| `lost` (taken: `lostTo` names who took it) | `active` (retaken), `destroyed` |
| `destroyed` (razed) | nothing: a new settlement on the spot is a new record |

Leaving a live state (`claimed`, `active`) sets `left` to the op's day; coming back clears `left` (and `lostTo`).
Moving to `lost` must name the taker in the same op.

## 5. Coordinates: one world frame, and the regions' frames

The scale model is redrawn from time to time. Map 5.1 moved every pixel by +272, +330 from the old canvas, which the
open worlds' `region.json` still use. So a record keeps the **map pixel with its version** and its **world metres on that
version**. `KOUTPOST.MAPS` holds each version's offset from the old canvas (`'4'`: 0, 0; `'5.1'`: 272, 330).
`KOUTPOST.at` gives world metres, and `toMap` re-expresses a place on another version.

A region's page works in its own frame (`region.json` `frame`: `origin_px` on the old canvas, 2,000 m a pixel).
`toRegion` and `fromRegion` convert, so a page can place a marker at a settlement and turn the player's founding click into
a world place. The test checks this against every settlement the three regions list. The model's own 5.1 pixels agree
with all of them but one, Flooded Tower, which was moved on the model after little-demo was cut; the test reports such
moves without failing on them.

## 6. Edits: the player's save is an operation log by id

Like `core/city`'s edits and the stage-3 edit log (`ROADMAP.md` section 10: `{op: ADD | MOVE | SET | REMOVE, id, rec,
cause}`), the registry is **an ordered log of operations** from empty:

```
{format:'krator-player-settlements/1', world:'krator', player:'player', map:'5.1', seedId, ops:[...]}
op: {op:'ADD',    id, rec,            day, cause}   a founding
    {op:'SET',    id, set:{f: v},     day, cause}   name, kind, size, state, left, lostTo, links, refs, tags, _note
    {op:'MOVE',   id, place:{...},    day, cause}   a correction (settlements do not walk)
    {op:'REMOVE', id,                 day, cause}   undo a mistake (a razed settlement is SET to destroyed and kept)
```

- `KOUTPOST.apply(reg, op)` checks an op against the rules and applies it, or refuses it with a reason and leaves the
  registry as it was. `KOUTPOST.fold(save)` replays a save and stops at the first refused op. `KOUTPOST.save(reg)` writes
  the log back out.
- `id`, `player` and `founded` never change; a `REMOVE`d id is never reused.
- `KOUTPOST.found(reg, spec, opt)` and `KOUTPOST.abandon(reg, id, day, cause)` are the common edits. They return the op
  they applied, for the save.
- **Founded ids** are `'ps-' + base36(KRAND.hash(seed, day, x, z, n))`, with `n` counting up past any id already taken.
  The same founding on the same day at the same place gets the same id on every machine and in Godot.

## 7. Where the two worlds touch

- **The simulation.** A player settlement runs as its own `core/simulation` settlement: `SIM.settlement(KOUTPOST.simSpec(rec))`
  gives `{id, faction: the player's, name, kind: 'player', size, outpost: rec.id}`, and the host stores the id back with
  a `SET` of `links.settlement`. The registry never calls SIM, so it runs where SIM is not loaded. It cannot move Voth's
  stocks proof or `test-sim.js`. The world's reactions (raids, caravans, `ROADMAP.md` section 10) come from the
  simulation's ordinary rules about settlements and factions. No rule here names an NPC.
- **Trade.** Trade runs between sim settlements (`SIM.trade` stops are settlement ids). A player settlement's partners are
  its `refs` with `rel: 'trade'` and `kind: 'sim'`; `KOUTPOST.tradeWith(rec)` lists them for the host that opens the
  route. The route itself is a simulation record.
- **The world's keep-clears.**
  - *The world kept off the player's ground:* `KOUTPOST.keepClear(reg)` gives a disc for every settlement still standing
    (all but `destroyed`). A page chains it into its flora and NPC placement clearing (as `openworld/isle-demo`'s camps
    chain `WORLD.clearHook`).
  - *The player kept off the world's ground:* `canFound(..., {clear(x, z, r)})` asks the page, which knows the NPC
    towns' ground, hamlets and camps (`WORLD.townW`, the scale model's list), and refuses with the page's reason. The
    registry holds no NPC footprint.
- **What a settlement stands near.** `KOUTPOST.nearWorld(place, settlements, r)` reads a list of NPC places (the scale
  model's settlements) and returns `refs` (`kind: 'scale'`, `rel: 'near'`) nearest first. It keeps nothing; the host may
  store the refs it wants with a `SET`.

## 8. Candidate sites: hints from the kits, nothing drawn

A biome kit knows where its land suits a settlement (water, warmth, shelter, a resource) and may say so. It offers
**candidates**: plain records, never drawn, and never in the registry until the player founds a settlement on one.

```
{id:'firebliss:great-vale', kit:'firebliss', name:'Great Firebliss Vale',
 place:{map:'5.1', px:184, py:1318, r:900},
 suits:['home', 'farm', 'hunt', 'trade'],        kinds it suits (KINDS)
 has:{water:1, warmth:1, ground:1, resource:0.5, shelter:1},   0..1, the kit's own judgement
 risks:['gas', 'flood'],                         the kit's hazard words
 _note:'the largest valley and tarn; the best ground to grow on'}
```

- **The kit's file** is `biomes/<kit>/outposts.json`, a JSON list. The open world reads it with `KOUTPOST.offer(kit, list)`,
  which checks each entry and keeps the good ones; a bad one is reported and not kept. A kit with only fields and no fixed
  points offers nothing until its stations place them.
- **Reading them.** `KOUTPOST.candidatesNear(reg, x, z, r, {kind, only})` lists them best first (those that suit the
  kind, then by `has`), each with `held` (the player's live settlements on it). `found(reg, {candidate: id, kind, day})`
  founds a settlement on one, taking its place and name and setting `links.candidate`.
- **The first offers** (the 2026-11-09 plans; the files are the kits' to write, on `claude/biome-rebuild` where the
  plans are):
  - **Firebliss Range** (`biomes/firebliss/PLAN.md` section 6), its four oasis valleys at 5.1 px:
    - Great Firebliss Vale, 184,1318: home, farm, hunt; risks gas and flood.
    - Solfatara Glen, 238,1322: works (the sulphur); risks acid, fumes and heat.
    - East Bliss Vale, 284,1318: trade, hunt; risks lahar, and it is the most visited.
    - West Bliss Cauldron, 126,1344: fort; risks cold and gas, and it is remote.
  - **The Labyrinth** (`biomes/labyrinth/PLAN.md`), its two pit tarns, NW 148,1467 (2,919 m) and SW 176,1564 (2,839 m):
    water in a cold land; hunt.
  - **Mid Basin** (`biomes/midbasin/PLAN.md`): the warm artesian springs at the feet of the relay benches and at the
    maars' breaches. The plan gives no points yet, so the kit offers them when its stations place the benches.

  The test carries the Firebliss and Labyrinth sites in this shape, so the files the kits write are proven against the
  checks already.

## 9. What a page does (the browser view, optional)

An open-world region that shows the player's settlements does four things:
1. folds the player's save;
2. keeps the settlements inside its box (`KOUTPOST.inRegion(reg, frame, box)`);
3. registers each in `core/tags` as a landmark and draws it through its layout link (or a marker at
   `KOUTPOST.toRegion(place, frame)` while it is only a claim);
4. chains `keepClear` into its clearing.

None of this is built in this pass. Every open-world page is in the integration pass's rebuild (2026-11-09), and the view
is cheap to add when one of those pages is next touched.

## 10. Core adoption

| Module | Taken | Why |
|---|---|---|
| `core/rand` (`KRAND`) | yes | founded ids: `KRAND.hash` of (seed, day, x, z, n) |
| `core/space` (`KSPACE`) | yes | the nearness index for the founding rule, `near` and `candidatesNear` |
| `core/tags` | by the page | the registry is records; a page registers what it draws (section 9) |
| `core/simulation` | by id | `links.settlement`, `refs` to NPC sim settlements; `simSpec` gives the spec, and the host calls SIM |
| `core/camp`, `core/hamlet`, `core/city` | by id | `links.camp`, `links.hamlet` and `links.city` by size: the layout is theirs |
| `core/terrain`, `core/mask` | no | the registry knows no ground; the page's `opt.ground` and `opt.clear` answer |
| everything drawn (`core/atmos`, `core/water`, `core/host`, `core/materials`) | no | nothing is drawn here |

## 11. Steps

1. **This pass (2026-11-09):**
   - this plan;
   - `src/10-outposts-registry.js` (`[G data]`);
   - the node test (`tests/test-outposts.js`, each check with a negative), run by `tools/test_all.py`;
   - the port lint on the folder.
2. A region page's view (section 9), when an open-world page is next rebuilt.
3. The kits' `outposts.json` (Firebliss and Labyrinth now; Mid Basin when it has points), on their branches.
4. The GDScript twin (`koutpost.gd`) with the same test vectors, when the open world goes to Godot.
5. The game's founding flow: what a claim costs, what makes a camp a hamlet, and the simulation settlement made on
   `active`. These are rules over the player's records, written here as plain functions.

## 12. Questions for the owner

- The founding gap (200 m beyond the claims) and the default claim radius (100 m): are they right for the player?
- Should a lost settlement that the world keeps get an NPC record automatically (by the world tick), or only when the
  owner writes one?
