# kits/extraplanar: API

One global, `KratorExtraplanar`, from the bundle (`extraplanar_bundle.bundle()`, or `dist/krator-extraplanar.js`). It needs the
globals `THREE` (r128), `KRAND` (`core/rand/08-core-rand.js`) and `KSPACE` (`core/space/20-core-space.js`); the registry files its
records in a `KTAGS` registry when given one (or makes one when `KTAGS` is on the page), and the weather needs `ATMOS` bound
(`ATMOS.bindHost` or `ATMOS.init`). Nothing else leaks (`verify.py` `bundle-alone` checks it in a blank page).

## The hunters

The frame and the calls are the Mechs kit's (`kits/mechs/API.md`): origin at the footprint centre on the ground, **+z forward**, y
up; a host moves the group and calls `update` every frame after moving it; the feet stay planted where the kit put them on
`ground(x, z)`.

```js
KratorExtraplanar.list()                        // -> [{ key, name, culture: 'extraplanar', role, origin, lore, tags, w, d, h, data }]
KratorExtraplanar.hunters()                     // list() plus each one's { silhouette: { set, h } }
KratorExtraplanar.build(key, { seed, variant, linear })  -> THREE.Group, posed standing; the seed draws the wear and the variation
KratorExtraplanar.update(group, dt, { ground(x, z) -> y })   // advance and pose; returns this step's events
KratorExtraplanar.setState(group, 'idle' | 'walk'); .attack(group) -> the clip's length; .state(group); .speed(group)
KratorExtraplanar.feet(group); .point(group, name); .reset(group); .lights(group, on); .dispose(group)
KratorExtraplanar.clip(key); .dataOf(key); .tagsOf(key); .audit(key, { seed }); .useTextures({...}); .setDetail(k)
KratorExtraplanar.projectile('gaze')            // the Haloed's beam, 4 m, +z forward; the mechs' kinds ('bolt', 'barb' ...) pass through
KratorExtraplanar.silhouetteOf(key)             // -> { set, h }: the far-tier card this hunter draws
KratorExtraplanar.CLASSES, .TYPES, .DRIVES, .PILOTS, .WEAPONS, .BUCKETS   // the vocabularies, widened: type 'hunter', drive 'tripod', weapons 'sting', 'gaze', 'sun', 'rake'
```

Events (`update` returns them): `{ type: 'step', key, leg, pos, mass }`, `{ type: 'call', kind: 'tell', key, pos, dir }` (the TELL:
every attack opens with one, the shared tell of the design rule), `{ type: 'impact', key, pos, r }`, `{ type: 'fire', kind: 'gaze',
key, pos, dir, speed }` (loose `projectile('gaze')` from `pos` along `dir`).

| Key | Clip (`attack(g)`) | Events, in order |
|---|---|---|
| `xp_stilter` | `sting` 3.0 s | `call` `tell` at `lens_pt` 0.64 s; `impact` r 1.2 at `sting_pt` 1.62 s |
| `xp_haloed` | `gaze` 2.8 s | `call` `tell` at `face_pt` 0.74 s; `fire` `gaze` from `face_pt` 1.5 s, speed 120 |
| `xp_sunhead` | `sweep` 3.2 s | `call` `tell` at `sun_pt` 0.7 s; `impact` r 3 at `hand_r_pt` 1.62 s |
| `xp_crawler` | `rake` 2.4 s | `call` `tell` at `ring_pt` 0.54 s; `impact` r 0.9 at `claw_l_pt` 1.12 s, at `claw_r_pt` 1.52 s |

`reset(group)` plants the feet at the group's own height (the mechs runtime takes no ground there): place the group, then let the
first `update(dt, { ground })` plant them, or build afresh. Named points a host may read with `point(g, name)`: `lens_pt`,
`sting_pt`; `face_pt`; `sun_pt`, `hand_l_pt`, `hand_r_pt`; `ring_pt`, `claw_l_pt`, `claw_r_pt`.

## The records (`XP`, also `KratorExtraplanar.XP`)

Plain data and pure functions (`xp-records.js`, `[G data]`): no THREE, no DOM; `tests/test-extraplanar.js` runs them in node.

```js
KratorExtraplanar.phenomenon(key, o)   // key 'void' | 'solid' | 'presence'
  // o: { at: [x, y, z], seed, r, h (the hover), ry, state: 'latent' | 'awake', drift: 'wander' | 'orbit' | 'still', driftR, speed, driftY: [lo, hi],
  //      eyes (void), form (solid: 'octahedron' | 'icosahedron' | 'stellated'), tint (solid: a TINTS name or [r, g, b]), tintR, stars (presence), taint, name }
  // -> { id, class: 'feature', kind: 'phenomenon', key, name, at, r, h, hover, ry, seed, state, drift: { mode, r, speed, y }, weather: { fog, plume, tint, tintR },
  //      hum: { hz, loud, reach }, look: { eyes: [{ az, el, s }] | form, facets, seams, axis, spin | stars: [[x, y, z, s]], eye, halo }, taint, tags: { origin: 'extraplanar', role, variant }, src }
KratorExtraplanar.portal(key, o)       // key 'door' | 'tear' | 'drowned'
  // o: { at, ry, seed, size: [w, h], state: 'shut' | 'open' | 'flicker' | 'dead', leads: { station, at: [x, y, z] } | null, flicker: { period, duty }, taint, name }
  // -> { id, class: 'feature', kind: 'portal', key, name, at, ry, size, r, h, seed, state, leads, flicker, taint, tags, src }
KratorExtraplanar.pose(rec, t, eye)    // -> { at, ry, open, spin, pulse } at module time t (s); eye [x, z] turns a presence to the viewer. Pure in (seed, t)
KratorExtraplanar.openness(rec, t)     // -> 0..1: shut 0, open 1, flicker a hashed square wave on (seed, period, duty), dead .04
KratorExtraplanar.through(rec)         // -> rec.leads or null
KratorExtraplanar.humAt(x, z, t, R)    // -> 0..1: the hums of the registry's awake phenomena in reach, summed and clamped (the shared tell)
KratorExtraplanar.tintAt(x, z, R)      // -> [r, g, b] | null: the nearest solid's cloud-mood tint whose tintR holds the point (for ATMOS.cloudMood's tintAt)
KratorExtraplanar.VOCAB                // { phenomena, portals, phenomenonStates, portalStates, drifts, solids, silhouettes }
KratorExtraplanar.TINTS                // bruise, verdigris, ember, bone (sRGB 0..1)
KratorExtraplanar.u(seed, a, b, ...)   // [0, 1) from KRAND.hash: every seeded choice in the kit
```

The registry:

```js
const R = KratorExtraplanar.registry.create({ tags, space, cell, build })
  // tags: a KTAGS registry (the world's: BIO.tagReg()), or none (one is made when KTAGS is on the page); space: a KSPACE grid, or one of `cell` m (32)
R.add(rec)          // files it in core/tags (a 'feature' record: the kit's tags, a note) and core/space (under its whole drift range); stamps rec.seq; returns it. Twice throws
R.near(x, z, pad)   // KSPACE.query: the records whose square holds the point, in insertion order
R.all(); R.get(id); R.phenomena(); R.portals()
R.markDrawn(rec)    // the draw side's: a record that was never registered THROWS; else rec.drawnSeq
R.check()           // -> { ok, fails, records, drawn }: every drawn record was registered first (drawnSeq > seq)
```

## The drawing (`KratorExtraplanar.draw`)

```js
draw.phenomenon(rec, R)   // -> THREE.Group named 'phenomenon:<key>:<id>', userData { kind, key, id, rec }; R.markDrawn(rec) first
draw.portal(rec, R)       // -> THREE.Group named 'portal:<key>:<id>', placed at rec.at, turned rec.ry
draw.weather(g, ATMOS, o) // the phenomenon's weather on core/atmos, parented to the group: { mist } (ATMOS.mistRing, kept on by a hook: a void's pool),
                          // { plume } (ATMOS.smoke: a solid's chimney plume and steam ring, a presence's breath), { glow } (ATMOS.glowAdd). Call after the
                          // binding, before ATMOS.finish(). o.mistN, o.smokeN override the counts
draw.tick(g, t, eye)      // pose it at module time t: the drift, the yaw (a presence to `eye` [x, z]), the eyes (toward the viewer, shut on the far side,
                          // the breath), the solid's spin and pulse, a portal's rim by its openness
```

The host owns the clock (`t`) and calls `tick` every frame for every drawn group; the groups are static otherwise. A world that
places many phenomena keeps them in one registry and draws only what is near.

## The far tier: the shared silhouettes

The contract for the three kits (the owner, 2026-11-04: at a distance a stilted entity, a robot tripod and a mutant on grafted
legs cannot be told apart, on purpose). `XP.SILHOUETTES` is a set of named outlines, each a nominal height and simple polygons in
metres; any kit's far tier may draw its entities from them:

| set | h (m) | the shape | drawn by |
|---|---|---|---|
| `tripod` | 11 | three splayed stilts under a small body with a crescent | `xp_stilter`; the robots' `an_tripod` (scaled to 8.7); a stilt-grafted mutant |
| `tallwalker` | 3.8 | a tall hooded taper on two long legs, a ring behind the head | `xp_haloed`; the robots' `an_shroud`, a trooper; a robed mutant |
| `giant` | 9 | a hunched long-armed biped with a round head | `xp_sunhead`; the Giants; a giant mutant |
| `crawler` | 2.6 | a low body slung between four long limbs, a ring over the back | `xp_crawler`; a mutant on grafted legs; a robot quadruped |

```js
KratorExtraplanar.SILHOUETTES[set]        // { h, parts: [[[x, y], ...], ...] }  (also XP.silhouetteBox(set) -> [x0, x1, y0, y1])
KratorExtraplanar.silhouette(hunterKey)   // -> the set's name
KratorExtraplanar.far(set, h)             // -> THREE.Mesh: one flat black shape, two-sided, fogged, origin on the ground, scaled to h; userData { kind: 'far', set, h, tris }
KratorExtraplanar.farFace(mesh, eye)      // yaw it to the eye ([x, z] or [x, y, z]) each frame
```

A kit joins the contract by declaring `silhouette: { set, h }` on an entry (as the hunters do) and drawing this kit's card for it
past its own far distance; a game's far tier (impostors, far instances) draws the three kinds from this one set. The robots and
the mutants do not take it yet (`KNOWN_ISSUES.md`).

## The shared tells

Three things the design rule shares across the kits, so a host plays them alike for whatever makes them:

- **the silhouette** above;
- **the hum**: `humAt(x, z, t, R)` for the phenomena; a robot's servo and a mutant's growl are the host's own sounds at the same loudness scale (0..1);
- **the tell**: every hunter's attack opens with `{ type: 'call', kind: 'tell', pos, dir }` before the blow (the robots' feigners
  fire the same event); a host that hears it flares its own light or sound, and what follows differs.
