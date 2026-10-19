# kits/fauna: the Fauna kit

One kit for every animal of Krator, the way `kits/catalog` is one catalog of furniture (`biomes/README.md`, "a fauna kit":
the owner's call, 2026-10). Started 2026-10-06 with the Scyvoi's animals: the **drylands goat** (four variants) and the
**fire salamander** (two markings, three breeds), moved here from `kits/scyvoi`. The same day every other animal in the repo
was gathered here and tagged: **48 species, 136 builds** (every variant and breed), each ported from the build that first drew
it, at its real size in metres, with `source` naming every build that draws it. 2026-10-07: the Ash Nomads' and the Scyvoi's
herds: the steppe bison, the staghorn beetle, the ash runner and the millipede's ash herd (**51 species, 150 builds**).
2026-10-19: the mounts of the five Beast Rider tribes that had none (the `riders` group; "The Beast Riders' mounts" below).

| File (group) | Species |
|---|---|
| `livestock` | goat |
| `mounts` | fire salamander |
| `farm` | cattle (dairy cow, brown cow, ox, highland cow), water buffalo, yak, steppe bison, horse, sheep, pig, hen, duck, Dalab lizard |
| `abyss` | flamingo, frilled lizard, marsh emu, pack lizard, riding lizard, dromedary |
| `desert` | desert kite, wadi swift, sand strider, rock lizard, mule deer, coyote |
| `bay` | bay soarer, canopy darter, plains grazer, savannah stalker, bay swimmer, savannah glider, cap moth, bloom glint |
| `hyperjungle` | sky ray, canopy dart, jungle butterfly, hyperjungle strider, bough sloth, and procedural giant insects and jungle fauna (grown large by the ~2 atm lowland air): lattice mantis, stilt walkingstick, horned scarab, harvester ant, leaf katydid, giant caterpillar, gilded orb spider; flyers: atlas moth, emperor hornet, jewel macaw, sparkle hummer, lantern-fly; lantern tree frog, forest tapir, vine boa |
| `ringsea` | giant sea lion (needs the `hyperjungle` file's helpers) |
| `wild` | the biome pass (BIOME-FAUNA-PLAN.md), three waves covering every biome of the plan, and ten more domestic animals (donkey, mule, goose, turkey, rabbit, alpaca, reindeer, bactrian camel, homing pigeon, giant honeybee), and sea and lake fauna (ring dolphin, giant sea turtle, manta ray, giant ring squid, glass jellyfish, reef octopus, ring marlin, banner reef fish, ring cormorant, giant pike, lake sturgeon, giant catfish, lake plesiosaur, lake diver), and eight large hexapods of different countries (dune runner, frost trunker, marsh strider, cavern leaper, cinder crawler, plains hopper, tide crawler, badland digger), and five large hexapods after the owner's reference plates (scytheback, hookstalker, reedneck, gapemaw, clubback), and eight more six-limbed beasts after a second set of plates (burden beast, a saddle and draught animal as massive as a hippo; ember bull; horncrest; barbed ravager; capstilt; slabhorn; gapebill; dunewalker, a desert mount): and six arboreal hyperjungle critters on the `centaur` gait (canopy runner, moss sloth, bough panther, bark skulker, fruit gibber, veil glider): and the fang glider (a six-limbed reptilian glider): and four gliders of the lowlands (all climbers on the centaur gait) (meadow skimmer, hedge glider, cypress glider, sail skimmer), the eastern abyss's rim glider, and four gliders of the Rift's spore-forests, from raccoon to quetzalcoatlus size (lamp glider, spore drifter, gloam hanger, Rift sailwing), and the plumelands' ash racer (a raccoon-sized six-limbed runner): 125 animals, with a new `centaur` gait (grazers, predators, flyers, water creatures) from the shared builders `faWdQuad`, `faWdFish`, `faWdSerpent`, `faWdCrab`, `faWdRay`, `faWdSquid`, `faWdJelly`, `faWdOcto`, `faWdHex` (a flipper option on `faWdQuad` draws paddles); needs the `hyperjungle` file's helpers |
| `flyers` | quetzalcoatlus, giant bat, giant archaeopteryx, giant dragonfly (each with a `'fly'` pose) |
| `crawlers` | draught millipede (with the Ash Nomads' ash herd), giant riding spider |
| `riders` | the Beast Rider tribes' mounts that were missing (2026-10-19): riding tiger, riding raptor, threehorn, hardshell, jungle mammoth (needs the `hyperjungle` file's helpers; the section "The Beast Riders' mounts" below) |
| `voth` | seagull, cliff racer, silt strider, arena tiger, pit lizard, giant beetle, staghorn beetle (the Ash Nomads' mount) |
| `ash` | ash runner (the Ash Nomads' six-legged herd beast) |
| `pets` | dog, cat (baked Meshy models only) |

```
cd kits/fauna && python3 build.py                   # dist/fauna.html (the sheet) and dist/krator-fauna.js (the bundle alone)
python3 verify.py dist/fauna.html --assert          # the invariants (about a minute)
python3 verify.py dist/fauna.html --out shots       # every animal alone, front three-quarter and side (--only key,key: a few)
python3 build.py --groups farm --out scratch/farm.html   # one species file's own page (leaves dist/ alone)
python3 ../../tools/textures/pack.py kits/fauna     # (from the repo root) after a change to materials.json
```

The sheet: a row per animal, every variant and breed, a 1.75 m figure for scale. **Idle (I)**, **Graze (G)**, **Walk (K)**,
**Fly (Y)**, **Swim (U)** set what they are all doing (Fly shows an animal's `'fly'` pose build where it has one);
`?only=key,key` lays out just those; **Night (N)**; **Hover tags (T)** names the animal under the pointer with its tags, traits,
yields and life; **Polygon (P)**.

## Meshy model variants

Some animals carry a second look: a baked Meshy model (`models/<key>.json`, packed by `models_pack.py` from a GLB that `rig/`
cut into parts and rigged), listed in the entry as `models: { variant: 'key' }`. `mdl` may also be a list of groups: only
their models are packed (the Voth city takes the pets' two without the farm's dozen). Today: the four giant flyers, the draught
millipede, and the farm's cow, ox, pig, sheep, goat, hen, horse, water buffalo, yak, bison, duck and Dalab lizard (a sprawl rig: the legs go out, then down), with the dog and cat (group `pets`) as models only. A model plays its
own clips (`perch` for idle and rest, `graze`, `walk`, `flap` / `glide` for flight) and keeps the kit's part names, so a host
animates it the same way. They are heavy (7 to 13 thousand triangles, about 1 MB each), so a bundle takes them only when asked:
`fauna_bundle.bundle(groups, mdl=True)` (the kit's own sheet does); without them a model variant draws the procedural build, and
a model-only animal draws nothing. See `rig/README.md`, and the first open item in `KNOWN_ISSUES.md`.

## What an animal carries (data first)

| Field | What | Checked |
|---|---|---|
| `tags.biomes`, `koppen`, `aridity`, `climate`, `riparian`, `abyssal` | where it lives (the root README: tag fauna by biome) | against `FAUNA_VOCAB` |
| `tags.habitat`, `locomotion` | ground, rock, canopy, marsh, shallows, air, pen ...; walks, runs, climbs, flies, swims ... | vocabulary |
| `tags.domestic`, `herdedBy` | kept, and by whom | |
| `tags.diet` | herbivore, carnivore, omnivore | vocabulary |
| `tags.feeding` | grazer, browser, mixed, frugivore, predator, scavenger, insectivore, filter feeder, detritivore | vocabulary |
| `tags.activity` | diurnal, nocturnal, crepuscular, cathemeral | vocabulary |
| `tags.temperament` | skittish, wary, docile, defensive, aggressive (from bolting first to attacking first); `data.fleeDistance` (m), `data.aggression` (0..1) | vocabulary |
| `traits` | edible, milkable, tameable, rideable, draught, eggs (edible eggs): booleans | each stated; each yield-bearing trait has its yield |
| `yields` | per adult: meat kg, milk L a day, eggs a year, hide (count, with `hideM2`), hair / wool / feathers / silk kg a year, ivory / horn / chitin kg; `{ amount, note }` | known kinds, amounts >= 0 |
| `life` | maturity (years to breeding), lifespan (years), litter (young per birth), gestation (days) | present and sane |
| `size`, `source` | length, height, span (m); every build that draws it `{ build, file, lines, note }` | present |
| `data` | mass, speed (walk, run, fly), gait, legs, wings, herd, schedule (24 hours of activities: GRAZE, REST, HUNT, MILK ...) | legs and wings against the parts |

`KratorFauna.lifeOf(key)` hands a world all of it as one record; a world gives it a faction and a job (the Scyvoi kit does:
`SV_LIFE`).

## How an animal is drawn

As PARTS, each turning about its own pivot: `body`, `head` (with the neck; the ears and jaw ride on it), `tail`, `leg0..legN`
(pairs front to back, left then right), `wingL`/`wingR` (and `wing2L`/`wing2R`), `seg0..segN`. `KratorFauna.animate(group, t,
mode)` turns only those, by the animal's gait (quadruped, sprawl, biped, hexapod, octopod, multipede, flyer, insect, swimmer),
so the geometry never changes and a Godot port can take each part as a bone. Colours are vertex colours (markings, patches);
library sets add grain as triplanar detail maps in each part's own frame (`materials.json`: coat `fur.bat`, sleek `hide.strider`,
shag `fur.sloth`, hair `hair.crest`, skin `hide.leather033c`, scale `organic.scale`, membrane `membrane.bat`, horn `bone.horn`,
chitin `organic.chitin`); `feather` waits on a set, and `glow` is unlit (a glint's light). The wanted sets are in
`core/materials/PLAN.md`, "The Fauna kit".

**For tack**, an animal can publish a body profile and anchors (`KratorFauna.profile`: the salamander's centre line and
half-sizes along its length; saddle, bridle, chest): the Scyvoi kit draws its saddles, barding and collars against it, so the
animal and the culture that rides it stay in separate kits. The riding lizard, pack lizard, Dalab lizard, spider, giant flyers
staghorn beetle (with a profile too) and silt strider carry anchors the same way (saddle, bridle, pack, howdah ...); their tack stays with their cultures.

## The Beast Riders' mounts

LORE.md 6.6 names twelve tribes of the Beast Riders ("more? TBD"). The audit of 2026-10-19 found a mount in the kit for seven;
the five missing were built in `krator-fauna-riders.js` (group `riders`). `verify.py --assert` reads this table (`rider-mounts`):
every tribe in the lore's list must have a row here, and every row a key that is registered and rideable or draught.

| Tribe | Beast | Fauna key | Group | Notes |
|---|---|---|---|---|
| Quetzal | quetzalcoatlus (span 12 m) | `quetzalcoatlus` | flyers | the reigning tribe; from Mav's Refuge |
| Wingclaw | giant archaeopteryx (span 7 m) | `giant-archaeopteryx` | flyers | Pinnacle Rock's own tribe |
| Dragonfly | giant dragonfly (6 m body, four wings) | `giant-dragonfly` | flyers | |
| Nightwing | giant bat (span 9 m) | `giant-bat` | flyers | |
| Spider | giant riding spider | `giant-spider` | crawlers | climbs trunks and leaps on draglines (Mav's Refuge) |
| Raptor | riding raptor | `riding-raptor` | riders | **new**. The Dalab ridge raptor (`ridge-raptor`, wild, 160 kg) is a wild cousin, not a mount |
| Staghorn | staghorn beetle | `staghorn-beetle` | voth | rideable; the Staghorn tribe's is variant 3, the **jungle staghorn** (moss-green, gold sheen, rust-red mandibles), and the beetle is tagged for the hyperjungle and herded by `beast-riders` as well as the Ash Nomads (the owner, 2026-10-19) |
| Threehorn | threehorn | `threehorn` | riders | **new**. The Dalab tricorn (`tricorn`, wild) is a smaller wild cousin |
| Hardshell | hardshell | `hardshell` | riders | **new** |
| Tiger | riding tiger | `riding-tiger` | riders | **new**. Voth's arena tiger (`arena-tiger`) is a wild beast of the bay, not tameable |
| Mammoth | jungle mammoth | `jungle-mammoth` | riders | **new** |
| Longcrawler | draught millipede | `draught-millipede` | crawlers | rideable and draught (the owner, 2026-10-19): the Longcrawlers ride theirs, a saddle on the fourth ring and a bridle at the head (anchors `saddle`, `bridle`) |

The new mounts (each with two breeds and three variants, herded by `beast-riders`, `data.tribe` naming the tribe, tagged for the
hyperjungle; sizes at breed scale 1):

| Key | Size | Breeds | Variants | Modelled on |
|---|---|---|---|---|
| `riding-tiger` | 5.3 m with the tail, 1.6 m at the shoulder, 780 kg | hunter, war (x1.12) | jungle orange, smoke, pale gold | a tiger 1.5 times real size in every length |
| `riding-raptor` | 5.8 m, hip 1.95 m, 600 kg | courser, war (x1.15) | jungle green barred, rust, slate blue | a feathered dromaeosaur past Utahraptor's size: quilled arms, a raised sickle claw, a crest |
| `threehorn` | 9.1 m, hips 3.05 m, 9 t | draught (short brow horns), war (x1.08, long brow horns) | olive and red frill, slate and gold, rust-brown and blue | Triceratops at its real size |
| `hardshell` | 5.3 m with the tail, the dome 2.1 m high, 3.5 t | draught (ringed tail), war (x1.06, Doedicurus's spiked tail club) | ochre, dark with pale rosettes, moss-streaked | Glyptodon grown about 1.6 times in length |
| `jungle-mammoth` | 4 m at the shoulder, 7.7 m tusk tip to tail, 9 t | riding, war (x1.08, longer tusks) | russet-haired, grey near bare, dark brown | the Columbian mammoth, thinly haired for the heat |

Each publishes a body profile (`KratorFauna.profile`: t from the tail tip to the snout) and anchors for tack: `saddle` (where
the rider's hips sit: behind the tiger's withers, over the raptor's hips, on the threehorn's shoulders behind the frill, on the
hardshell's dome, on the mammoth's neck for the mahout), `bridle`, `chest`, `pack`, and on the three heavy beasts `howdah`,
`harness` (the collar) and `trace` (where the traces meet the load). The tack stays with the Beast Riders.

Where the lore is silent the kit chose, and the owner may want to change: the **tiger** (only the tribe's name: a striped great
cat the size of a horse); the **raptor**'s size (the lore says velociraptor, a turkey-sized animal: a rider needs a giant of the
kind); the **mammoth** (only the name: a woolly mammoth would cook in the hyperjungle, so a thin-haired lowland one); the
threehorn and the hardshell at Pinnacle Rock's ranches as draught beasts (settlements/pinnacle-rock/PLAN.md, section 1), the
threehorn and the mammoth as war beasts; every yield, life figure and temperament.

## Taking animals into a world

Bundle them like the catalog: `fauna_bundle.bundle(['livestock', 'mounts'])` in the world's `build.py` (one closure, one
global `KratorFauna`), then `KratorFauna.build(key, {variant, breed, pose, seed})` per animal and `animate` from the frame
loop. `kits/scyvoi/src/56-sa-beasts.js` is the worked example (`saFauna`, `saFlush`).
The Voth city (`settlements/voth`, `build.py` `fauna_fragment`) takes `['voth', 'farm']`: its ranches' herds
(giant beetles, dairy cows, pigs, ducks) and the Arena's beasts are simulation actors with needs
(`targets/voth-city/47-vc-sim-animals.js`), each built fresh while near the camera and played by what it does
(`56c-vc-citizens-host.js`); `lifeOf(key).schedule` gives their resting hours.

## Next

Point the biome kits and the settlements at the bundle in place of their own animal code, one build at a time (each
`source` entry says where an animal is drawn now); see `KNOWN_ISSUES.md`.
