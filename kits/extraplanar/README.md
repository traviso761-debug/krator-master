# kits/extraplanar: the Ancient's Valley's extraplanar entities

The things that come through in the Valley (`biomes/ancientsvalley/PLAN.md` section 6; the owner, 2026-11-04: a kit of their
own, because they are neither fauna nor characters), as ONE bundle any world takes (`KratorExtraplanar`), the way the mechs and
the vehicles reach other worlds. Two kinds, and the doors they come through:

- **The hunters** walk and strike: four built, rigged, animated bodies on the Mechs kit's machinery (the rig, the two-bone IK
  with planted feet, the idle, the gait, a keyframed attack with its events), registered as the culture `extraplanar` inside this
  kit's closure alone.
- **The phenomena** do not walk: a void with eyes that drifts, a geometric solid with its own weather that hums, a haloed
  presence. They are anomaly RECORDS first (plain data on `core/rand` and `core/space`, `[G data]`), drawn after, their weather
  on `core/atmos`.
- **The portals**, an anomaly kind (`biomes/ancientsvalley/PLAN-ANOMALIES.md` section 4): a record (where, how big, its state,
  what it leads to: a station's coordinates or nowhere) and a drawing: a door standing alone, a tear, the drowned-hall kind for
  `city3` Dorado.

The design rule the kit is built to (the owner, 2026-11-04): **hard to tell apart.** At a distance a stilted entity, a robot
tripod and a mutant on grafted legs share a silhouette, and a hum may be a servo, a presence or a growl; the difference is shown
late, by behaviour. So every hunter's far tier is a card from a **shared silhouette set** the robots' and the mutants' far tiers
can draw too (`API.md`, "The far tier"), every attack opens with the same `call` event of kind `tell`, and `humAt` gives one hum
for whatever is humming. `PLAN.md` is the design; `API.md` the contract; `KNOWN_ISSUES.md` what is not done.

## The hunters

| Key | Name | What it is | Legs, gait, speed | Attack (`attack(g)`): the tell, then | Far tier |
|---|---|---|---|---|---|
| `xp_stilter` | the Stilter | 11.5 m: a ribbed thorax high on three stilt legs, a crescent of bone from the nape, one dark red lens in the ribs, red veins hanging from the hips (whips). Which ribs are broken or gone: the seed | tripod, three-phase, 1.11 m/s | `sting` 3.0 s: the lens lights (`call` `tell` 0.64 s), the thorax dips, a jointed sting folded behind unfolds and stabs the ground: `impact` r 1.2 at `sting_pt` 1.62 s | `tripod` |
| `xp_haloed` | the Haloed | 3.85 m: a hooded robe to a hand off the ground, two long legs and clawed feet under it, long arms with long fingers, the face a black void, a halo ring behind the head with 7 to 13 eyes (the seed) that blink out of time | biped, a glide, 0.99 m/s | `gaze` 2.8 s: the halo's eyes all open and the ring spins up (`call` `tell` 0.74 s), the arms rise, the void's eye opens: `fire` kind `gaze` from `face_pt` at 1.5 s (a 4 m beam, `projectile('gaze')`, speed 120) | `tallwalker` |
| `xp_sunhead` | the Sun-headed | 9.6 m: a bald long-limbed giant, hunched, arms to the knees, tatters at the waist (the seed: how many, how long), the head a sun: a warm glow sphere, pocked with dark craters (the seed), ringed with rays | biped, a heavy plod, 1.13 m/s | `sweep` 3.2 s: the sun flares (`call` `tell` 0.7 s), it bends and sweeps the right arm across the ground: `impact` r 3 at `hand_r_pt` 1.62 s | `giant` |
| `xp_crawler` | the Crawler | 2.6 m at the shoulder, 4 m long: a sleek dark lozenge slung between four long limbs (the fauna kit's `centaur` stance: the front pair arms, the hind pair legs, all four down), a blank head, two clawed hands folded under the chest, a chrome ring floating over its back; spine plates missing by the seed | quadruped, a diagonal walk, 1.54 m/s | `rake` 2.4 s: the ring brightens (`call` `tell` 0.54 s), the body drops and the hands lash out one after the other: `impact` r 0.9 at `claw_l_pt` 1.12 s and `claw_r_pt` 1.52 s | `crawler` |

Triangles 3 800 to 6 400, draw calls 3 to 5 (one SkinnedMesh per bucket: plate, metal, cloth, glow, livery where any), bones 21 to
37. No livery, no regalia: bone-grey, chrome-dark and black, the glow bucket for every eye and the sun. The tell lamps (the lens, the
void's eye, the flare, the ring's glow) are bones scaled to nothing until the clip's middle, so a host that sees one knows the blow is
coming. Every clip returns the hunter to what it was doing.

## The phenomena and the portals

Records (`xp-records.js`, `[G data]`; `tests/test-extraplanar.js` runs them in node), each registered before it is drawn (the draw side
refuses a record that is not: `XP.registry.markDrawn` throws).

| Record | What | Drawn as | Weather (`core/atmos`) |
|---|---|---|---|
| `phenomenon` `void` | a black sphere that is not lit, 2 to 6 m, 3 to 9 eyes (the seed) that open toward the viewer and shut on the far side; wanders at walking pace within `drift.r`, 1 to 4 m up; hums low (38 to 55 Hz, reach 60 m) | an unlit black sphere (no fog on it), the eyes as discs on it | a pool of mist round where it is (`ATMOS.mistRing`, kept on), drifting with it |
| `phenomenon` `solid` | an octahedron, an icosahedron or a stellated form, 4 to 10 m, hanging 6 to 14 m up, turning on its own axis; still or on a slow orbit; the loudest hum (90 to 140 Hz, reach 120 m); it lends the clouds over it a tint (bruise, verdigris, ember or bone) within `weather.tintR` | dark chrome facets, glowing seams, a core of light | a plume from its top and a ring of steam under it (`ATMOS.smoke`), a glow (`ATMOS.glowAdd`), the sky's clouds tinted over it (`ATMOS.cloudMood({tintAt})` with `XP.tintAt`) |
| `phenomenon` `presence` | a standing figure of starlight: 40 to 90 points of light in a dark body, one black eye, a halo ring over it; still; it turns to face the eye; faint hum | an unlit dark envelope, the stars as points, the eye, the halo | breath: a little steam at its feet; a glow |
| `portal` `door` | a door frame 2.4 x 3.6 m standing alone, no wall | chrome jambs and lintel, a sill, the black plane, a frame of light whose brightness is the openness | |
| `portal` `tear` | a jagged vertical rift 1 to 8 m (the seed) | the lips as a seeded polygon, black inside, a glowing lip behind, shards floating round it | |
| `portal` `drowned` | a hall's arch, half gone, leaning, standing in the water: the `city3` kind | the arch and piers in bone, the plane under the springing, lit from below | |

A portal's `state` is `shut`, `open`, `flicker` (a hashed square wave: `flicker.period`, `duty`) or `dead`; `leads` is
`{ station, at: [x, y, z] }` or null (nowhere: an interior with no world coordinates). `XP.openness(rec, t)` is 0..1;
`XP.through(rec)` says where. Every record carries `taint` (space distorted as a hazard to life; the valley's `KANOM` and `KHAZ`
read it) and `hum` (the shared tell; `XP.humAt(x, z, t, R)` sums what is in reach).

## Build and verify

```
cd kits/extraplanar && python3 build.py                       # dist/extraplanar.html (the demo page), dist/krator-extraplanar.js (the bundle)
node tests/test-extraplanar.js                                 # the records in node
python3 verify.py dist/extraplanar.html --assert              # every hunter: builds, feet on the ground standing and walking over a swell,
                                                               # the box, the gait, the attack with its tell first, the budget, the tags,
                                                               # z-fighting, determinism; the field's checks with negatives; the bundle alone
python3 verify.py dist/extraplanar.html --out shots --anim    # one picture per view, each hunter mid-attack
```

The page (`dist/extraplanar.html`, on the biome core and `core/host`): the hunters in lanes with a 1.75 m figure for scale (1 idle,
2 walk, 3 march, X attack), their far-tier cards 40 m behind them, and east of the lanes the field of phenomena and portals with their
weather, under the shared sky with the clouds' mood. Click a thing for its record (the inspector); the panel's stats line shows the
hum where the eye stands.

## Taking the kit into a world

```python
sys.path.insert(0, os.path.join(ROOT, 'kits', 'extraplanar')); import extraplanar_bundle
js = extraplanar_bundle.bundle()          # 272 KB; needs THREE, KRAND, KSPACE on the page (KTAGS for the registry, ATMOS for the weather)
```

```js
const KE = KratorExtraplanar;
const g = KE.build('xp_stilter', { seed: 7 }); g.position.set(x, terrainH(x, z), z); scene.add(g);
KE.update(g, dt, { ground: terrainH }); KE.setState(g, 'walk'); KE.speed(g); KE.attack(g);      /* as KratorMechs */
const R = KE.registry.create({ tags: BIO.tagReg(), cell: 32 });                                   /* the world's core/tags registry */
const v = R.add(KE.phenomenon('void', { at: [x, y, z], seed: 11 })); scene.add(KE.draw.phenomenon(v, R)); KE.draw.weather(scene.children.at(-1), ATMOS);
const p = R.add(KE.portal('drowned', { at: [x, y, z], ry, seed: 43, state: 'open', leads: { station: 'city3', at: [...] } })); scene.add(KE.draw.portal(p, R));
ATMOS.cloudMood(SKY, { tintAt: (x, z) => KE.tintAt(x, z, R) });                                  /* the solids' tints on the sky */
tick(dt => { for (const g of drawn) KE.draw.tick(g, t, [camera.position.x, camera.position.z]); hum = KE.humAt(ex, ez, t, R); });
const card = KE.far('tripod', 11.5); KE.farFace(card, [ex, ez]);                                 /* the far tier */
```

`API.md` has every call. The valley wires it in from the hand-over note; this kit does not edit `biomes/ancientsvalley`.
