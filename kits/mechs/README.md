# kits/mechs: the Mechs kit

Procedural, fully animated walking machines that any Krator world can take as ONE bundle (`KratorMechs`), the way the
motor vehicles and the catalog's furniture reach other worlds. Three cultures: **Iziz**, seventeen walkers, the
**Stalkers** of the Catch, two, and the **Ancients**, the Ancient's Valley's twelve feral machines (below).

The Izani Empire's mechs (LORE.md 6.2, "Ancient survivals") are Ancient *industrial* walkers dug out of the city's
ruins and kept going by the Forgemasters' Guild: loaders, cranes, excavators, pile drivers, cargo striders, refitted
for a war fought mostly against people with swords. A weapon is what the machine already was (a shear, a grab, an
auger, a saw), or a ballista bolted on. The legions dress them as they dress themselves: the sun of Iziz in gilt,
bronze phalerae, horsehair crests, a vexillum or a sashimono-like flag on a springy pole, feathers from the jungle.
Livery: weathered steel and gunmetal, Iziz orange on the armour plates, cream trim, a teal line, bronze fittings.
Most stand about three times a man (4.4 to 6.9 m to the top of the hull); the Turris is a walking siege tower of
three storeys (13 m), and the Catulus a drone the size of a hound that runs at the Speculator's heels.

| Key | Name | Was | Drive | Pilot | Weapon / attack | Ref |
|---|---|---|---|---|---|---|
| `iz_centurion` | Centurion | cargo loader | biped | chest, behind bars | girder cleaver and hatch scutum: overhead chop | 3 (AMP suit) |
| `iz_forfex` | Forfex | scrap-shear walker | reverse-jointed | glass nose | hydraulic shears: lunge and bite | 2 |
| `iz_testudo` | Testudo | foundation pile driver | biped, squat | sealed chest, vision slit | pile-driver fist and grab: punch | 4 (Dreadnought) |
| `iz_fabrica` | Forge-Warden | shipyard riveter | biped | chest, bronze cage | rivet gun (heated slugs) and hammer fist: volley of three | 5 |
| `iz_fossor` | Fossor | excavator | biped on tracked shoes | chest, amber glass | auger and digging grab: bore | 7 |
| `iz_scorpio` | Scorpio | survey crawler | four spider legs | glass dome | twin torsion ballistae: loose left, loose right, wind back | 8 |
| `iz_aquilifer` | Aquilifer | mine-ventilation walker | biped, twin fans | chest, barred | harpoon carroballista; carries the legion's sun | 9 |
| `iz_castra` | Castra | cargo strider | four long legs | cab (the head) | #0 Road Camp: ballista on a roof turntable, over the cab. #1 Supply Train: stores under the awning, a legionary blowing a shofar on the roof; a horn call, then it rears and stamps | 6 |
| `iz_hoist` | Hoist | walking crane | four splayed legs | caged cab; a rigger on top | slewing crane, four-tined grapple: smash | 1 |
| `iz_talpa` | Talpa | tunnel borer | four beetle legs | saddle on its back | polybolos: the bore head's seven tubes as a rotary bolt-thrower, a six-bolt volley | 11 (the crescent-finned crawler) |
| `iz_rota` | Rota | vehicle-recovery frame | biped | open chest cradle; head is a car cab | salvage saw and wheel shield: sweep | 10 |
| `iz_clipeus` | Clipeus | survey walker | biped | the disc | two shoulder boxes of three bolt tubes (three bolts in turn), a three-fingered grab, a clamp: bolts, then a clamp | 12 (the disc walker) |
| `iz_lictor` | Lictor | pile breaker | biped, tall | egg head pod | a ram arm with an iron fist, a pincer arm; the fasces on its back: overhead smash | 13 (the egg-headed walker) |
| `iz_baiulus` | Baiulus | heavy porter | biped, hunched | open framed seat in the chest | two great arms on shoulder drums, two small grippers: clap | 14 (the four-armed heavy) |
| `iz_turris` | Turris | walking works | four long legs | bridge on the roof; a crew of legionaries on the galleries | three ballistae on the prow balcony, loosed in turn; banners down its sides, hoist cables from its belly | 15 (the walking fort) |
| `iz_speculator` | Speculator | prospector | biped, hunched | closed chest pod | long sampling arms with pincers: snatch; canvas-wrapped legs, kit tied on | 16 (the canvas-legged scout) |
| `iz_catulus` | Catulus | survey drone | four thin legs, trot | none | none: a siren, then a dart | 16 (its drone) |

**The Stalkers** (culture `stalker`, 2026-10-23; `LORE.md` §4, Hub 01; `biomes/catch/PLAN.md` section 6c): the quiet
robotic killers of the Catch, about the size of a man (~1.9 m), in pairs or triads, the Ancients' own make gone feral.
Sleeker than the Iziz walkers (the owner): smooth white shells, tight joints, flexible sleeves on the legs, nothing tied
or bolted on, a red unit stripe, cyan running lights, a red eye. The culture's `detail` profile takes the shared detail
maps three times finer and at a third of their strength (`MECH_CULTURE(..., { detail: { tile, mix } })`), on a material
set of its own, so the shells read as scoured paint, not scrap.

| Key | Name | Drive | Weapon / attack | Ref |
|---|---|---|---|---|
| `st_harpooner` | Harpooner Stalker | biped, a hull leaning forward | two pneumatic harpoon guns on its sides: loose left, loose right (`fire` events, the `barb` projectile, a 1 m steel harpoon) | the owner's canvas-legged walker (the Speculator's reference), made sleek |
| `st_blade` | Blade Stalker | biped, hunched | two long arms ending in hooked blades: over and down, then the other (two `impact` events) | the owner's four-armed heavy (the Baiulus's reference), the hands made blades |

**The Ancients** (culture `ancient`, 2026-11-09; `biomes/ancientsvalley/PLAN.md` section 6, "Feral robots"): the
Ancients' own machines as the Valley finds them, a thousand years feral. Utilitarian, no regalia, no rider by nature:
Ancient white render (the hunters) or the work fleet's faded yellow (the keepers) over a dark frame, dark glass for the sensors, and all of it gone to rust and soot in
the vertex colours (which panels have rusted through is drawn from the seed, so a street of one chassis is not a row of
twins); lenses and lamps are the glow bucket. Three behaviours on shared chassis, so the far view cannot tell them
apart: a **role** tag per variant (`tags.role`, `KratorMechs.roleOf(key, v)`, in `list()`), `keeper | hunter | feigner`.
A KEEPER's "attack" clip is its thousand-year routine (a host plays it at the corners of its round). A FEIGNER is a
keeper chassis's last variant (`feign: [v]` on the entry): the real attack clip with a **tell** the host can read before
the blow: a `call` event of kind `tell`, a red lamp that comes on (the `tell` bone, scaled to nothing except during that
clip) and the head turning to track. Sizes from hound to house.

| Key | Name | Role | Drive | Routine / attack | Variants |
|---|---|---|---|---|---|
| `an_sweeper` | Sweeper | keeper, feigner | quadruped, trots | a brush drum, two broom discs, a hopper whose lid flaps: it stops and sweeps a drift (two `impact`). Feigner: rams with the drum spun up (`impact`) | Sweeper, Feigner |
| `an_porter` | Porter | keeper, feigner | quadruped, splayed (the Hoist's lineage) | the crane slews over the kerb, lowers its hook, loads nothing (`impact`); the pallet kneels for a load (`call` chime). Feigner: the boom comes round with the hook as a flail (two `impact`) | Crane, Pallet, Feigner |
| `an_lamplighter` | Lamplighter | keeper, feigner | biped, tall and thin | a blank white mask, a pole held upright, a dead lantern on a mast: it reaches up and the lantern flickers once (`call` click; the `flick` bone). Feigner: a third eye opens red, the pole comes down (`impact`) | Lamplighter, Feigner |
| `an_gardener` | Gardener | keeper, feigner | quadruped, spidery | shears on one arm, a hand on the other: it snips twice (two `impact`). Feigner: it drops and lunges, the shears close (`impact`) | Gardener, Feigner |
| `an_tripod` | Stilt Tripod | hunter | **tripod**: short thighs out and up, 7 m shins | a hooded head, three feelers under the belly, a beam lance slung under the hull: a horn (`call`), the lance charges (the `charge` bone) and fires (`fire`, kind `beam`) | Stilt |
| `an_shroud` | Shrouded Walker | hunter | biped, hunched | a coat of fourteen hanging conduits ending in hands, a dome of eyes under a hood; the hood lifts, the cannon runs out and fires twice (`fire`, kind `shell`) | Shroud |
| `an_trooper` | Hunched Trooper | hunter | biped | heavy forearms raised as a shield, a shoulder gun with a drum: a burst of three (`fire`, kind `slug`). The Loader is the same frame in the work livery: a loader the war armed | Trooper, Loader |
| `an_courier` | Courier | keeper, feigner | digitigrade, 1.3 m | a box head with a big lens and two aerials, a satchel on its back: it cocks its head, chirps (`call`) and opens the satchel on nothing. Feigner: a cutter comes out of the satchel (`impact`) | Courier, Feigner |
| `an_mender` | Mender | keeper, feigner | **hexapod**, 0.8 m | a domed pod with a torch arm over its back: it strikes an arc on nothing (`call` arc; the `arc` glow). Feigner: the torch to the face (`impact`) | Mender, Feigner |
| `an_watcher` | Watcher | keeper, feigner | **hover**, a ball at head height | one big lens, a ring of small ones, four small fans, two aerials, a hook under it: it sweeps its lens along the street and chirps (two `call`). Feigner: it rises and drops on you with the hook (`impact`) | Watcher, Feigner |
| `an_lifter` | Lifter | keeper, feigner | **hover**, a cargo drone at gutter height | a flat yellow hull on four big ducted fans, a chain and hook under it: it comes down over the kerb and loads nothing (`impact`). Feigner: it drops onto you (`impact` r 2) | Lifter, Feigner |
| `an_wasp` | Wasp | hunter | **hover**, fast | a white teardrop on two fans, a red eye, a gun pod under each wing: a shallow strafing dive, four `fire` (kind `slug`) | Wasp |

The keepers and the Loader wear the **work livery** (the owner's references, 2026-11-09): a safety yellow faded to ochre
(`ANC.work`), hazard stripes on flanks, booms and bumpers (`ANC.hazard`, black on yellow or red on white), twin round
lamps for a face (`ANC.twinLamps`), beacons, whip aerials, ladders and chains. The hunters stay in white render.

**Hovering machines** (`drive: 'hover'`, 2026-11-09): an entry with `hover: { bob, lean, roll }` and no legs rides at
its body bone's height above the host's ground, bobs, and leans into its motion (the host moves it as it moves a walker:
`speed(g)` from a gait that is only a speed, `period: 1, duty: 1, stride: m/s`). Its fans are `MP.fan` spin bones.

The Ancient's Valley takes `mech_bundle.bundle(['ancient'])` (about 300 KB) and builds with `{ bare: true }` (nothing to
strip on these: they carry no regalia).

Every mech has an **idle** (hydraulic breathing, weight shift, torso scan, the cab or head looking round, the pilot's
head turning, banners and feathers stirring), a **plodding walk** (two-bone leg IK; feet planted in the world, so
they do not slide while the host moves the mech; the body dips at each footfall, sways over the planted foot and
twists at the hips; arms swing; toes roll off), and an **attack** clip (keyframed, with `fire` and `impact` events
at the right frame for a host's projectiles and dust).

## How it is built

- One fragment per mech (`krator-mechs-iziz-<mech>.js`), each a `MECH({...})`: data and tags first, then
  `build(F, R)`, which declares a rig (`R.bone`, `R.leg`, `R.dangle`, `R.spin`, `R.link`, `R.banner`) and draws on
  its bones with the catalog primitives plus the mech frame (`mechs-core.js`) and the parts library
  (`mechs-parts.js`: joints, pistons, hoses, cages, feet, the torsion ballista, the seated pilot, fans, tanks,
  wheels, saw, auger, cargo).
- The culture file (`krator-mechs-iziz.js`) holds the palette and the dressing every Iziz mech shares (`IZ.sun`,
  `IZ.phalera`, `IZ.crest`, `IZ.feathers`, `IZ.vexillum`, `IZ.sashimono`, `IZ.numeral`, `IZ.scutum`, `IZ.paint`);
  `krator-mechs-ancient.js` the Ancients' (`ANC.wear`, the seeded rust; `ANC.lens`, `ANC.eyes`, `ANC.visor`,
  `ANC.sleeve`, `ANC.conduit`, `ANC.streak`; the tell: `ANC.tell`, `ANC.hiddenIdle`, `ANC.reveal`, `ANC.feign`).
- The runtime (`mechs-runtime.js`) skins it: every mesh drawn on a bone goes into one of eight buckets (bare plate, livery (plate in a saturated colour), metal, bronze, cloth, hair, glass, glow),
  each one SkinnedMesh on one Skeleton, so a mech is 8 to 12 draw
  calls (banners are one each). Strings, hoses and pistons drawn by `R.link` are weighted along their length and
  stretch as the joints move.
- Textures: the bundle carries none. A host passes library sets to `KratorMechs.useTextures()`; they go on as
  triplanar DETAIL maps over the vertex colours (no UVs), with their luminance as a bump. The kit sheet uses
  `metal.scrap` (plate), `metal.painted.chipped` (livery: where the paint is chipped the shader shows steel),
  `metal.joint.greasy` (metal), `metal.bronze`, `cloth.canvas`, `hair.crest`, the Iziz banner and sun-banner sheets
  (`materials.json`, `tex/`). `?tex=0` shows the vertex colours alone.

## Build and verify

```
cd kits/mechs && python3 build.py
python3 verify.py dist/mechs.html --assert            # every mech: builds, feet on the ground, gait, attack, ...
python3 verify.py dist/mechs.html --out shots --anim  # screenshots: views, a walking frame, three attack frames
python3 verify.py dist/mechs.html --out shots --march # every lane marches 25 s with U-turns; IK reach is reported
python3 verify.py dist/mechs.html --eval "()=>KratorMechs.audit('iz_rota')"   # z-fighting, by bone (also an --assert invariant)
```

After a change to `materials.json`: `python3 tools/textures/pack.py kits/mechs`, then `python3 build.py`.

The sheet (`dist/mechs.html`): two rows of five lanes. Idle (1), Walk on the spot (2), March up and down the lanes
with U-turns (3), Attack (X: all, or the one gone to), Follow (G), Lights (L), Night (N), hover tags (T), polygon (P).

## Adding a mech

A file `krator-mechs-<culture>-<name>.js` with one `MECH({...})` (see `API.md`). Keep the bone count under 96 and
the triangles under 32 000; draw legs hanging straight down from the hip (the bind pose), arms with their rest bend
in the bone; give the attack clip's events a named point (`R.point`). Rerun `verify.py --assert`.
A new culture is `krator-mechs-<culture>.js` with `MECH_CULTURE(...)` and its dressing; the bundle loads it before
its mechs.
