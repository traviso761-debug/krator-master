# kits/mechs: the Mechs kit

Procedural, fully animated walking machines that any Krator world can take as ONE bundle (`KratorMechs`), the way the
motor vehicles and the catalog's furniture reach other worlds. First culture: **Iziz**, ten war-walkers.

The Izani Empire's mechs (LORE.md 6.2, "Ancient survivals") are Ancient *industrial* walkers dug out of the city's
ruins and kept going by the Forgemasters' Guild: loaders, cranes, excavators, pile drivers, cargo striders, refitted
for a war fought mostly against people with swords. A weapon is what the machine already was (a shear, a grab, an
auger, a saw), or a ballista bolted on. The legions dress them as they dress themselves: the sun of Iziz in gilt,
bronze phalerae, horsehair crests, a vexillum or a sashimono-like flag on a springy pole, feathers from the jungle.
Livery: weathered steel and gunmetal, Iziz orange on the armour plates, cream trim, a teal line, bronze fittings.
They stand about three times a man (4.4 to 6.2 m to the top of the hull).

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
  `IZ.phalera`, `IZ.crest`, `IZ.feathers`, `IZ.vexillum`, `IZ.sashimono`, `IZ.numeral`, `IZ.scutum`, `IZ.paint`).
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
