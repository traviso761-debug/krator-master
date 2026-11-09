# kits/extraplanar: the Ancient's Valley's extraplanar entities (plan, 2026-11-09)

The owner (2026-11-04): the things that come through in the Valley are neither fauna nor characters, so they get a kit of
their own. Two kinds. The **hunters** walk: bodies that take a step and a blow, built on the Mechs kit's machinery (the
rig, the two-bone IK with planted feet, the clips with their events) because that is what already walks and strikes with
a verified gait. The **phenomena** do not walk: a void with eyes that drifts, a geometric solid with its own weather that
hums, a haloed presence; they are anomaly RECORDS first, drawn after. Both come through **portals**, an anomaly kind
(`biomes/ancientsvalley/PLAN-ANOMALIES.md` section 4), thickest at `city3` Dorado: portals in the drowned halls, the
phenomena over the water, the lake's steam as their weather.

References: `C:\Users\travi\OneDrive\Pictures\krator\ancientvalley\extraplanar\` (read 2026-11-09): a bone-grey walker on
three stilt legs under an eclipsed sun, a red-veined pylon on two stilts, a crescent for a head; hooded and robed figures
whose halo is a ring of teeth, of heads, of eyes, the face a void with one eye in it; a galaxy inside a robe; a bald giant
whose head is a sun, pocked, bending over a shed; a chrome thing crouched on four long limbs with a ring floating over
it; a figure of starlight with a single black eye; a ball of eyes on tendrils. "Nothing with a face a person would trust."

## 1. The design rule: hard to tell apart

The owner (2026-11-04): at a distance a stilted entity, a robot tripod and a mutant on grafted legs share a silhouette;
a hum may be a servo, a presence or a growl; the difference is shown late, by behaviour. So:

- The hunters' far tier is a **silhouette card** from a set the three kits share (section 5). `xp_stilter` draws the
  `tripod` card the robots' `an_tripod` can draw; `xp_haloed` the `tallwalker` card a hooded mutant or a trooper can draw;
  `xp_sunhead` the `giant`; `xp_crawler` the `crawler` a mutant on grafted legs can draw.
- The **tells are shared**: every attack starts with a `call` event of kind `tell` (a hum, a glow) the host plays, and
  what follows differs (a stab, a gaze, a sweep, a rake). `XP.humAt(x, z, t)` sums the phenomena's hums in reach so a
  host plays one hum for a presence, a servo or a growl alike.
- Up close the difference is behaviour: a hunter closes and strikes; a phenomenon drifts, hums and does nothing until
  the game rules say so (the records carry `taint`: space distorted as a hazard to life, PLAN-ANOMALIES section 2).

## 2. Core adoption

| Module | Taken for | How |
|---|---|---|
| `core/rand` (`KRAND`) | every seeded decision: which panels are torn, how many eyes on a halo, a phenomenon's drift path (`KRAND.vnoise` on the clock), a portal's flicker | the bundle requires a global `KRAND` as it requires `THREE`; nothing draws from how many draws came before |
| `core/space` (`KSPACE`) | the phenomena and portals index: `XP.registry` files every record at its (x, z, r); `near(x, z, pad)` is the host's tick and the hum | required global, as `KRAND` |
| `core/tags` (`KTAGS`) | every record registered before it is drawn: the registry takes a `KTAGS` registry (or a build name) and `add`s each phenomenon and portal as a `feature` record (kind `phenomenon` or `portal`, key its subkind) with the kit's tags; the demo page's inspector names them | the page's `BIO.init({tags})` registry is handed to `XP.registry.create` |
| `core/atmos` (`ATMOS`) | a phenomenon's weather, **not copied**: `ATMOS.mistRing` for the local fog pooled round a void, `ATMOS.smoke` (`steam`, `chimney`) for the solid's plume and the presence's breath, `ATMOS.glowAdd` for the glow, `ATMOS.cloudMood({tintAt})` with `XP.tintAt(x, z)` for the cloud-mood tint a solid lends the sky over it; the shared sky through `ATMOS.skyBiome` | the page binds `ATMOS.bindHost`; the draw side calls the module only |
| `core/host` (`KHOST`) | the demo page's camera, panel, probe, views and the inspector | `khost.resolve(PATH, khost.SHELL + inspect + polytool)` |
| `core/biome` (`BIO`) | the page is on the biome core: `BIO.init` (the tags registry, the ground, the ticks, the registered volumes the probe reads) | as `kits/metropolis` |
| `core/shader` | `KHOOK`, `KCOLOR` on every page (resolve adds them) | |
| `kits/mechs` | the hunters' machinery: `MECH`, `mechRig`, `mechFrame`, the parts (`MP`), the runtime (the pose layers, IK, planted feet, dangles, spins, clips and events, the z-fighting audit), read in place by the bundle as `mech_bundle.py` reads them | the hunters are a `MECH_CULTURE('extraplanar')` registered INSIDE this kit's closure only: `KratorMechs` keeps its Iziz, Stalkers and the valley's `ancient` culture; `KratorExtraplanar` holds these |
| `kits/fauna` | the gaits the owner named: the `centaur` posture (front pair arms, hind pair legs; all four down at a run) is the Crawler's stance, the tripod's three-phase walk the Stilter's, written as the mechs' gait records (`offsets`, `duty`); the fauna runtime itself is not bundled (its animals are parts on pivots, not a skinned rig with IK, and the feet-on-ground check needs the IK) | the numbers, by name, not the engine |
| `kits/catalog`, `kits/motor-vehicles` | the engine-neutral core (`mat`, `FPAL`, `_target`) and the frame the mechs core is built on | inside the closure, as the mechs bundle |

Not taken, with the reason: `core/water` (the kit places nothing on water; the drowned-hall portal stands in the valley's
lake, which the valley draws), `core/terrain` (no ground of its own: the demo's ground is a flat plain with a gentle
swell for the feet check, `BIO.init`'s `terrainH`), `core/materials` (no library pack yet: the hunters take the mechs'
detail maps through `useTextures` when a host passes them; the demo passes none: see section 8), `core/city`,
`core/hamlet`, `core/simulation` (nothing is placed in a settlement here: the valley places), `core/furnish`,
`kits/interiors` (no interiors), `core/export` (the records export through `KTAGS` on the host page; a `core/export`
adapter is the valley's), `core/lod` (the far tier is the silhouette card of section 5, drawn by the host at its own
distance), `core/mask` (nothing is scattered).

## 3. The hunters (culture `extraplanar`, the keys `xp_*`)

Each a `MECH({...})` on the mechs machinery: data and tags first, the gait, an idle, an attack clip with its tell and
events, `build(F, R)`. Sizes w x d x h in metres. Every one varies with the seed (`KRAND.hash(seed, salt, i)`): which
ribs are broken, how many eyes, the sun's pocks, the skin's tone.

| Key | Name | What it is | Legs and gait | Attack (`attack(g)`) and events | Shares its silhouette with |
|---|---|---|---|---|---|
| `xp_stilter` | the Stilter | 11 m: a small ribbed thorax high on three stilt legs, no head but a crescent blade curving up from the nape, one dark lens in the ribs, red veins hanging from the hips (whips) | tripod (`an_tripod`'s three-phase gait: offsets 0, 1/3, 2/3), 1.2 m/s | `skewer` 3.0 s: the lens lights (`call` kind `tell` 0.6 s), the thorax dips, a jointed sting under the thorax unfolds and stabs the ground: `impact` r 1.2 at `sting_pt` 1.6 s | the robots' `an_tripod`; the mutants' stilt-grafted |
| `xp_haloed` | the Haloed | 3.8 m: a tall hooded robe to 0.35 m off the ground, two long thin legs and clawed feet under it, long arms with long fingers, the face a black void with one eye in it, a halo ring behind the head carrying 7 to 13 eyes (the seed) that blink | biped, a slow glide of a walk (long duty), 1.0 m/s | `gaze` 2.8 s: the halo's eyes all open and the ring spins up (`call` kind `tell` 0.7 s), the arms rise, the void's eye opens: `fire` kind `gaze` from `face_pt` at 1.5 s (a beam the host flies), the arms fall | the robots' `an_shroud` and a hooded trooper; the mutants' robed |
| `xp_sunhead` | the Sun-headed | 9 m: a bald long-limbed giant, hunched, arms to the knees, the head a sun (a warm glow sphere ringed with rays, pocked with dark craters), tatters at the waist | biped, a heavy plod, 1.1 m/s | `sweep` 3.2 s: the sun flares (`call` kind `tell` 0.6 s), it bends and sweeps the right arm across the ground: `impact` r 3 at `hand_r_pt` 1.6 s | the Giants of `core/charactermodels`; a giant mutant |
| `xp_crawler` | the Crawler | 2.6 m at the shoulder, 5 m long: a sleek dark thing crouched on four long limbs (the fauna `centaur` stance: front pair arms, hind pair legs, all four down), a blank lozenge for a head, two short clawed hands under the chest, a ring floating over its back | quadruped on long limbs, a diagonal walk, 1.5 m/s | `rake` 2.4 s: the ring brightens (`call` kind `tell` 0.5 s), the body drops and the hands lash out, one then the other: `impact` r 0.9 at `claw_l_pt` 1.1 s and `claw_r_pt` 1.5 s | a mutant on grafted legs; the robots' quadrupeds |

The look: no livery, no regalia, nothing a people made. Bone-grey, chrome-dark and black surfaces (`plate`, `metal`
buckets) with the glow bucket for every eye and the sun; where the robe is cloth it is the `cloth` bucket. The
materials are the mechs runtime's (`MATSETS` by the culture's `detail` profile: fine and faint, as the Stalkers').

## 4. The phenomena and the portals (records first, `[G data]`)

`xp-records.js` is plain data and pure functions on `KRAND` and `KSPACE`: no THREE, no DOM; `tests/test-extraplanar.js`
runs it in node.

**A phenomenon** `XP.phenomenon(key, o)` -> the record (`class: 'feature', kind: 'phenomenon'`):

```
{ id, kind: 'phenomenon', key: 'void' | 'solid' | 'presence', at: [x, y, z], r, h, ry, seed, state: 'latent' | 'awake',
  drift: { mode: 'wander' | 'orbit' | 'still', r, speed, y: [lo, hi] },       the path XP.pose(rec, t) walks, from KRAND.vnoise
  weather: { fog, plume, tint: [r, g, b], tintR },                           what it lends the air round it (0..1 and a colour)
  hum: { hz, loud, reach },                                                  the shared tell: XP.humAt sums these
  look: { eyes | facets | stars, halo },                                     what the seed drew: how many, where
  taint: dose,                                                               space distorted as a hazard (the valley's KANOM/KHAZ read it)
  tags: { origin: 'extraplanar', role: key, variant } }
```

| key | what | drifts | weather | hum |
|---|---|---|---|---|
| `void` | a black sphere that is not lit (the glow bucket's black: no shading, no fog on it), 2 to 6 m across, with 3 to 9 eyes that open on the side facing the eye and close on the far side; the ground under it is cold | wanders within `drift.r` at walking pace, 1 to 4 m up | a pool of mist round where it is (`ATMOS.mistRing`, kept on), no plume | low, 38 to 55 Hz, reach 60 m |
| `solid` | a geometric solid (an octahedron, an icosahedron or a stellated form: the seed) 4 to 10 m, turning slowly on two axes, its facets a dull dark chrome, seams that glow; it hangs 6 to 14 m up | still, or a slow orbit round a centre | its own weather: a plume (`ATMOS.smoke` `chimney` from its top), a ring of steam under it, and a cloud-mood tint over it (`XP.tintAt` returns its `weather.tint` within `tintR`: the sky's clouds take its colour there) | a chord, 90 to 140 Hz, reach 120 m: the loudest |
| `presence` | a haloed figure of starlight: a standing figure's shape as points of light in a dark body, one black eye, a halo ring over it; it does not walk; it turns to face the eye (`XP.pose` gives `ry` toward a given eye) | still | breath: a little steam at its feet; a glow | faint, 60 Hz, reach 40 m |

`XP.pose(rec, t, eye)` -> `{ at, ry, open, spin }` (the position on the drift path at module time `t`, the yaw, the
eyes' openness 0..1 as a slow hashed breath, the solid's turn), deterministic in (seed, t). `XP.humAt(x, z, t, R)` ->
0..1 from the records in reach (`R.near`), each `loud` times a falloff times a slow beat.

**A portal** `XP.portal(key, o)` -> the record (`class: 'feature', kind: 'portal'`):

```
{ id, kind: 'portal', key: 'door' | 'tear' | 'drowned', at, ry, size: [w, h], seed,
  state: 'shut' | 'open' | 'flicker' | 'dead',
  leads: { station: 'city3', at: [x, y, z] } | null,     a teleport to a station's coordinates, or nowhere (an interior with no world coordinates)
  flicker: { period, duty },                             a flickering portal's hashed square wave
  taint: dose, tags: { origin: 'extraplanar', role: key } }
```

| key | what | where the valley puts it |
|---|---|---|
| `door` | a door frame standing alone, 2.4 x 3.6 m, no wall; through it a dark plane that glows at its edge when open | a field, a square, a roof |
| `tear` | a jagged vertical rift 1 to 8 m tall, its lips glowing, the inside black | a street, a hall's wall |
| `drowned` | a hall's arch half-sunk, the plane under the water line, lit from below: the `city3` kind | Dorado's drowned halls, standing in the lake |

`XP.openness(rec, t)` -> 0..1 (shut 0, open 1, flicker the square wave on (seed, period, duty), dead a residual 0.04);
`XP.through(rec)` -> `leads` or null. The states are what a host sets; the kit decides nothing about when a portal
opens.

**The registry** `XP.registry.create({ tags, space, cell })`: `R.add(rec)` files it in `KTAGS` (`tags.add`) and `KSPACE`
(`space.insert(rec, x, z, r)`), stamps `rec.seq`, and returns it; `R.near(x, z, pad)`, `R.all()`, `R.get(id)`. The draw
side refuses a record with no `seq` (not registered) and stamps `rec.drawnSeq`: the check "registered before drawn" is
`drawnSeq > seq` on every drawn record, and the node test holds it with a negative (drawing an unregistered record throws).

## 5. The shared silhouettes (the far tier)

`XP.SILHOUETTES`: four named outlines, each a polygon in metres at a nominal height (`h`), from which any kit's far
tier may draw its card, and the names the hunters map to (`XP.silhouette(key)`):

| set | h (m) | the shape | who may draw it |
|---|---|---|---|
| `tripod` | 11 | three splayed stilts under a small body with a crescent | `xp_stilter`; the robots' `an_tripod` (8.7 m: the card scales to the entry's `h`); the mutants' stilt-grafted |
| `tallwalker` | 3.8 | a tall hooded taper on two long legs, a ring behind the head | `xp_haloed`; the robots' `an_shroud`, a trooper; a robed mutant |
| `giant` | 9 | a hunched long-armed biped with a round head | `xp_sunhead`; the Giants; a giant mutant |
| `crawler` | 2.6 | a low body slung between four long limbs, a ring over the back | `xp_crawler`; a mutant on grafted legs; a robot quadruped |

`KratorExtraplanar.far(set, h)` -> a THREE mesh (one flat black shape, two-sided, fogged) a host places at the entity's
position and yaws toward the eye each frame (`KratorExtraplanar.farFace(mesh, eye)`); the host swaps it for the
entity's model at its own distance. The contract for the other kits is in `API.md` ("The far tier"): declare
`silhouette: { set, h }` on an entry; draw this kit's card for it. The robots and the mutants do not take it yet.

## 6. The bundle and the page

- `extraplanar_bundle.py`: `bundle()` -> ONE closure defining the single global `KratorExtraplanar`; inside it the catalog
  core, the symbols, the vehicle frame, `mechs-core.js`, `mechs-parts.js`, this kit's culture and hunter files, the
  mechs runtime (its `KM_API` stays inside), `xp-records.js`, `xp-draw.js`, `xp-runtime.js`. `fragments()` lists the files
  in order. It needs `THREE`, `KRAND` and `KSPACE` on the page (and `KTAGS` for the registry, `ATMOS` for the weather).
- The API (`xp-runtime.js`): the hunters through the mechs calls by the same names (`list`, `build(key, {seed, variant})`,
  `update`, `setState`, `attack`, `speed`, `feet`, `point`, `state`, `reset`, `lights`, `projectile('gaze')`, `audit`,
  `useTextures`); `phenomenon`, `portal`, `pose`, `openness`, `through`, `humAt`, `tintAt`, `registry`; `draw.phenomenon(rec)`,
  `draw.portal(rec)`, `draw.weather(rec, ATMOS)`, `draw.tick(g, t, eye)`; `far`, `farFace`, `SILHOUETTES`, `silhouette`.
- The page (`src/`, on the biome core as `kits/metropolis`): the hunters in lanes with a 1.75 m figure for scale (idle,
  walk on the spot, march, attack), a field of phenomena and portals east of the lanes, the mist and the plumes on
  `ATMOS`, the shared sky, `KHOST.take` with views per entity and per phenomenon.
- `verify.py --assert` on the harness: for every hunter, every variant, seeds 1..2: builds, no NaN, **feet on the ground
  standing and while walking over a gentle swell** (each planted foot within `GROUND_TOL` of `ground(x, z)`), the declared
  box, the gait (reach, every leg steps, no slide), the attack's events in order with the `tell` first, the budget, the
  tags, z-fighting, determinism; the phenomena: every record registered before it is drawn (`drawnSeq > seq`), the pose
  deterministic, the hum bounded, the openness in 0..1; the portals: the states; the silhouettes: every hunter maps to a
  set and the card builds; the bundle alone in a blank page adds exactly one global; the page's budget.

## 7. Order of work

1. This plan. 2. `xp-records.js` and its node test. 3. The culture file and the four hunters, checked one by one on the
page. 4. `xp-draw.js` (phenomena, portals, weather, cards) and `xp-runtime.js`. 5. The page, `build.py`, the bundle,
`verify.py`. 6. GPU verify through the lock. 7. `README.md`, `API.md`, `KNOWN_ISSUES.md`, `PORT.md`, the repo's
`INDEX.md`, `test_all.py --no-build`, `tools/build.py kits/extraplanar`, the baseline, the commit, the hand-over note.

## 8. Open and owed

- Textures: none of its own. The hunters' surfaces are vertex colours under the mechs' detail maps when a host passes
  them (the valley passes its mechs set); a set for bone and void-black would be the first to want
  (`core/materials/PROMPTS-NEEDED.md` gets a row if the owner wants one: "bone, weathered, scoured by sand, matte").
- The beam the Haloed's `gaze` looses is `projectile('gaze')` (a 4 m glow rod); the host flies it as the robots' `beam`.
- The feigner/keeper roles are the robots'; a hunter here has one behaviour: it hunts. A dormant pose (a Stilter standing
  dead in a square until it wakes) is not built: `KNOWN_ISSUES.md`.
- The valley wires the kit in (`biomes/ancientsvalley`): the bundle on its page, `XP.registry.create` on its tags, the
  phenomena over Dorado's water, the portals in its drowned halls, `XP.tintAt` into its `cloudMood`. Not this session.
