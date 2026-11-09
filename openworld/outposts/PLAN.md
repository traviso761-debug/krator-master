# The outpost registry (KOUTPOST): the plan

*2026-11-09. The owner: "we don't need to formally pick a spot for the player to set up, but having some kind of registry
for outposts would be good if we don't have one already. Although actually that should probably go more in the open world
code."* A search found none: `outpost` was only a type in the scale model (ten settlements), a word in
`core/simulation/ROADMAP.md` (sections 9, 10, 31: "Player establishes an outpost -> Player Settlement created") and in
the open worlds' `data/region.json`.

## 1. What it is

A world-wide list of **outposts**: small held places (a trade post, a hunting lodge, a mine head, a works, a farm, a
waystation, a fort), whoever holds them: the player, a people, a faction, an order, or nobody (abandoned). The world
reacts to an outpost through the simulation's ordinary networks (`ROADMAP.md` section 10: a raider adds it as a target, a
trader as a stop); the registry is how the world knows the outpost is there, where, whose, since when, and what other
records draw it or run it.

What it is **not**:
- **Not a spot picker.** No place is chosen for the player. The player founds an outpost where the founding rule allows
  (section 6).
- **Not a layout.** What an outpost looks like is `core/camp` (a pitched camp), `core/hamlet` (a village) or `core/city`
  (a planned town, and later the player's settlement builder). The registry links to those records by id.
- **Not an economy.** Stocks, people and trade are `core/simulation`'s settlement records; the registry links to one and
  can hand the simulation the spec to make it (section 7).

## 2. Where it lives: `openworld/outposts/`, not `core/`

The owner leans to the open world's code, and the record's own nature agrees:
- **It is world-scale.** An outpost is one record for the whole world, wherever the player stands. The open world streams
  regions of the scale model (`little-demo`, `isle-demo`, `north-basin`); a page is one region's window onto the world.
  The registry is above the regions, as the scale model's settlement list is, so it lives beside them:
  `openworld/outposts/`, a shared folder of the open world (like `openworld/ANCIENT-ROADS.md`), not one region's `src/`.
- **No build or kit needs it to make its page.** `core/` holds what builds take to make their pages (placement, layout,
  water, sky). A settlement page never needs to know the world's outposts; an open-world region does.
- **No core part is needed.** The registry *reads* `core/rand` (`KRAND.hash` for founded ids) and `core/space`
  (`KSPACE` for the nearness index) in place, and *links* to `core/camp`, `core/hamlet`, `core/city` and
  `core/simulation` by id only: it calls none of them, so none changes. Nothing in `core/` is edited.
- **The direction of dependencies holds** (`MODULARITY-PLAN.md`): `openworld/outposts` depends on `core/`; `core/` never
  names it. A biome kit does not depend on it either: a kit *offers* candidate sites as plain data (section 8), and the
  open world reads them.

If a settlement build ever needs the registry (a town that sends caravans to the world's outposts), the data fragment
moves to `core/outposts/` unchanged: it is `[G data]` and reads only `KRAND` and `KSPACE`.

## 3. The record

One outpost:

```
{ id:      'op-sthegate',                 stable, never reused (section 5)
  name:    'The Gate',
  kind:    'waystation',                  KOUTPOST.KINDS (below)
  owner:   {kind:'people', id:'tierhounds'}   kind: player | people | faction | org | none | unknown
  place:   {map:'5.1', px:1408, py:414,    the scale model's pixel and its version (the map moves: section 4)
            x:2816000, z:828000,          world metres on that map: px * 2000, py * 2000 (x east, z south)
            y:null, r:120},               ground height if known; the claim's radius, metres
  state:   'active',                      KOUTPOST.STATES (below)
  founded: null,                          world day (core/clock's day number); null: it predates the world's start
  abandoned: null,                        world day it was left; null while held
  links:   {scale:'sthegate',             the scale model's settlement doc id
            settlement:null,              core/simulation's settlement id (SIM.settlement)
            camp:null, hamlet:null, city:null,   core/camp's band id, core/hamlet's village id, core/city's plan id
            candidate:null},              the candidate site it was founded on (section 8)
  tags:    [],                            free words (core/tags vocabulary when drawn)
  _note:   '...' }                        the reasoning, kept, as in core/simulation's records
```

**Kinds** (`KOUTPOST.KINDS`): `post` (held, purpose not stated: every seeded outpost the owner has not typed yet),
`trade`, `hunt`, `mine`, `works` (a sulphur works, a salt pan: a resource worked, not lived at), `farm`, `waystation`
(a toll, a ford, a pass), `fort`.

**Owners**: `player` (id: the player's faction id, `'player'` by default), `people` (a people of `LORE.md`, e.g.
`fellgang`, `kimr`), `faction` and `org` (core/simulation's ids), `none` (abandoned or ruined: nobody holds it),
`unknown` (seeded and not yet assigned). A live outpost (`claimed`, `active`) has an owner that is not `none`; a dead one
(`abandoned`, `ruined`, `destroyed`) has `none`, and its last holder goes in the log (section 5), not the record.

**States** and the moves between them (`KOUTPOST.MOVES`, a plain table):

| from | to |
|---|---|
| `claimed` (staked: marked, not built) | `active`, `abandoned` |
| `active` (built and held) | `abandoned`, `destroyed` |
| `abandoned` (left standing) | `active` (reclaimed, perhaps by someone else), `ruined` |
| `ruined` (fallen in) | `active` (refounded on the ruin) |
| `destroyed` (razed) | nothing: a new outpost on the spot is a new record |

**Dates** are world days (`core/clock`'s day number, integers; 0 is a real day). `founded` null means the outpost was
there when the world began (every seed). `abandoned` is set when it leaves a live state and cleared when it is retaken.

**Compatibility with stage 3** (`ROADMAP.md` section 10): ids are stable strings; the record is plain JSON; the links are
ids into the modules that will share one interface (`core/city`, `core/hamlet`, `core/camp`, `core/simulation`), so the
host can show an outpost's town or camp by following a link, and the simulation's settlement keeps its own id.

## 4. Coordinates: one world frame, and the regions' frames

The scale model is re-drawn from time to time (map 5.1 moved every pixel by +272, +330 from the old canvas, which the
open worlds' `region.json` still use). So a record keeps the **map pixel with its version**, and its **world metres on
that version**. `KOUTPOST.MAPS` holds each version's offset from the old canvas (`'4'`: 0, 0; `'5.1'`: 272, 330);
`KOUTPOST.at(px, py, ver)` gives world metres, `KOUTPOST.toMap(place, ver)` re-expresses a place on another version.

A region's page works in its own frame (`region.json` `frame`: `origin_px` on the old canvas, 2,000 m a pixel).
`KOUTPOST.toRegion(place, frame)` and `KOUTPOST.fromRegion(x, z, frame, ver)` convert, so a page places a marker at an
outpost and the player's founding click becomes a world place. The test checks the round trip against every outpost the
three regions' `region.json` list (their local x, z).

## 5. Edits: an operation log by id

Like `core/city`'s edits and the stage-3 edit log (`ROADMAP.md` section 10: `{op: ADD | MOVE | SET | REMOVE, id, rec,
cause}`), the registry is **a base plus an ordered log of operations**, never a mutated file:

```
{format:'krator-outposts/1', world:'krator', map:'5.1', seed:[...records], ops:[...]}
op: {op:'ADD',    id, rec,              day, cause}   a new outpost (founded, or an owner's hand-written one)
    {op:'SET',    id, set:{field: v},   day, cause}   change fields (name, kind, owner, state, links, tags, _note)
    {op:'MOVE',   id, place:{...},      day, cause}   move it (an owner's correction; outposts do not walk)
    {op:'REMOVE', id,                   day, cause}   delete the record (an owner's edit: the world never removes one;
                                                       a razed outpost is SET to destroyed and stays on the books)
```

- `KOUTPOST.apply(reg, op)` checks the op against the rules and applies it, or refuses it with a reason and leaves the
  registry as it was. `KOUTPOST.fold(file)` builds the registry from the seed and the log, failing on the first refused op.
- A SET of `state` must be a move of the table above; it fills `abandoned` (the op's day) and sets the owner to `none` when
  the outpost dies, and clears `abandoned` when it is retaken (the SET names the new owner in the same op).
- Ids are never reused: a REMOVEd id cannot be ADDed again (`reg.gone`).
- `KOUTPOST.found(reg, spec)` and `KOUTPOST.abandon(reg, id, day, cause)` are the two common edits, written as ops: they
  return the op they applied, for the caller's log or save file. The player's save is the log.
- **Founded ids**: `'op-' + base36(KRAND.hash(seed, day, x, z, n))`, `n` counting up past any id taken, so the same founding
  on the same day at the same place gets the same id on every machine and in Godot.

## 6. The founding rule (a plain function)

`KOUTPOST.canFound(reg, spec, opt)` -> `{ok, why}`. An outpost can be founded where:
- the place is a finite point and the kind and owner are known;
- no live outpost's claim overlaps it: the distance between them is at least the sum of their radii plus `opt.gap`
  (default 200 m). A dead outpost's spot can be refounded (a new record, or a SET back to active of the old one);
- `opt.ground(x, z)`, if the page gives one, says yes (dry, not a cliff: the page's own ground test, as `core/hamlet`'s
  `ground.ok`). The registry knows no terrain.

That is all: no spot is picked, and the world's own placement rules (ground, water, slope) stay with the page that knows
the ground.

## 7. Seeding and the simulation

**The scale model's outposts seed it.** `data/scale-outposts.json` holds the scale model's ten `outpost`-typed settlements
as the model lists them (map 5.1 pixels, doc ids, notes): Bastion, Boatmurder, Fort Vaklu, Furrow, Shade, Strongwall,
Tallhouse, The Gate, Tzunfort, Veil. `KOUTPOST.seed(list, ver)` makes their records: id `op-<doc id>`, state `active`,
owner `unknown`, `founded` null, `links.scale` the doc id, and a kind from a short table of what the names and notes
say (Fort Vaklu, Bastion and Strongwall `fort`; The Gate `waystation`, its toll; the rest `post`), each with its
`_note`. The owner's corrections are SET ops in the base file's log, not edits of the seed. When the scale model is
re-read, the list is refreshed and the log still applies (ids are the model's doc ids).

**Some outposts are already settlements.** Shade is a full settlement build (`settlements/shade`, with an economy); its
record links it (`links.settlement`) when that page is on the open world. A registry record is the world's index entry,
not a second copy of the town.

**The simulation.** `KOUTPOST.simSpec(rec)` gives the spec `SIM.settlement({id, faction, name})` takes (`id`: the link,
or the outpost's own id; `faction`: the owner's id when the owner is a faction or the player). The host calls
`SIM.settlement` and stores the id back with a SET of `links.settlement`. The registry never calls SIM, so it runs where
SIM is not loaded and costs the economy nothing (Voth's stocks proof and `test-sim.js` cannot move).

**Camps and hamlets.** A founded hunting camp is pitched by `KCAMP.pitch` and its band id goes in `links.camp`; a mining
or farming outpost that grows is laid out by `KHAMLET.village` and links `links.hamlet`; a town by `core/city`
(`links.city`). The registry stores the link; the page that draws follows it.

## 8. Candidate sites: hints from the kits, nothing drawn

A biome kit knows where its land suits an outpost (water, warmth, shelter, a resource) and may say so. It offers
**candidates**: plain records, never drawn, never in the registry until something is founded on one.

```
{id:'firebliss:great-vale', kit:'firebliss', name:'Great Firebliss Vale',
 place:{map:'5.1', px:184, py:1318, r:900},
 suits:['farm', 'hunt', 'trade'],                 kinds it suits
 has:{water:1, warmth:1, ground:1, resource:0.5, shelter:1},   0..1, the kit's own judgement
 risks:['gas', 'flood'],                          the kit's hazard words
 _note:'the largest valley and tarn; the best ground to grow on; gas pools on its floor on still nights'}
```

- **The kit's file**: `biomes/<kit>/outposts.json`, a JSON list of candidates. The open world collects the kits' files
  (`KOUTPOST.offer(kit, list)` checks and keeps them; a bad candidate is reported, not kept). A kit with no fixed points,
  only fields, writes them when its stations place them; until then it offers nothing (no guesses).
- **What reads them**: `KOUTPOST.candidatesNear(x, z, r, opt)` for a page or a game's "places worth settling" list, best
  first by `has` for a kind (`opt.kind`); `KOUTPOST.found(reg, {candidate: id, ...})` founds on one (its place and
  radius, and `links.candidate`). A candidate that a live outpost already holds says so (`held` in the answer).
- **The first offers** (2026-11-09 plans; the files are the kits' to write, on `claude/biome-rebuild` where the plans are):
  - **Firebliss Range** (`biomes/firebliss/PLAN.md` section 6): the four oasis valleys, 5.1 px: Great Firebliss Vale
    184,1318 (farm, hunt; gas, flood); Solfatara Glen 238,1322 (works: the sulphur; acid, fumes, heat); East Bliss Vale
    284,1318 (trade, hunt; lahar, the most visited); West Bliss Cauldron 126,1344 (fort; cold, gas, remote). The test
    carries these four as its fixture, so the file the kit writes is already proven against the checks.
  - **The Labyrinth** (`biomes/labyrinth/PLAN.md`): the two pit tarns, NW 148,1467 (2,919 m) and SW 176,1564 (2,839 m):
    water in a cold land, the native refuge; hunt.
  - **Mid Basin** (`biomes/midbasin/PLAN.md`): the warm artesian springs at the relay benches' feet and the maars'
    breaches. The plan gives no points yet: the kit offers them when its stations place the benches.

## 9. What a page does (the browser view, optional)

An open-world region that shows outposts: fold the registry, keep the outposts inside its box
(`KOUTPOST.inRegion(reg, frame, box)`), register each in `core/tags` as a landmark, and draw a marker at
`KOUTPOST.toRegion(place, frame)`; the inspector shows the record. Not built in this pass: every open-world page is in the
integration pass's rebuild (2026-11-09), and a marker layer is cheap to add when one of them is next touched.

## 10. Core adoption

| Module | Taken | Why |
|---|---|---|
| `core/rand` (`KRAND`) | yes | founded ids: `KRAND.hash` of (seed, day, x, z, n) |
| `core/space` (`KSPACE`) | yes | the nearness index for the founding rule and `near` / `candidatesNear` |
| `core/tags` | by the page | the registry is records; a page registers what it draws (section 9) |
| `core/simulation` | by id | `links.settlement`; `simSpec` gives the spec, the host calls SIM |
| `core/camp`, `core/hamlet`, `core/city` | by id | `links.camp`, `links.hamlet`, `links.city`: the layout is theirs |
| `core/terrain`, `core/mask` | no | the registry knows no ground; the page's `opt.ground` answers |
| everything drawn (`core/atmos`, `core/water`, `core/host`, `core/materials`) | no | nothing is drawn here |

## 11. Steps

1. **This pass (2026-11-09):** this plan; `src/10-outposts-registry.js` (`[G data]`); `data/scale-outposts.json`; the node
   test (`tests/test-outposts.js`, each check with a negative), run by `tools/test_all.py`; the port lint on the folder.
2. A region page's marker layer (section 9), when an open-world page is next rebuilt.
3. The kits' `outposts.json` (Firebliss, Labyrinth; Mid Basin when it has points), on their branches.
4. The GDScript twin (`koutpost.gd`), with the same test vectors, when the open world goes to Godot.
5. The world tick (`core/camp/PLAN.md` section 7) reads the registry: raids pick live outposts of hostile owners, caravans
   add trading ones as stops; abandonment by neglect (no people for N days) becomes a rule here, as a plain function.

## 12. Questions for the owner

- The seeded outposts' owners and kinds: who holds Bastion, Boatmurder, Furrow, Shade, Strongwall, Tallhouse, The Gate
  (the Tierhounds?), Tzunfort, Veil, Fort Vaklu? Each answer is one SET op in the log.
- The founding gap (200 m beyond the claims) and the default claim radius (100 m): right for the player?
