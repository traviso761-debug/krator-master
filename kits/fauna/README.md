# kits/fauna: the Fauna kit

One kit for every animal of Krator, the way `kits/catalog` is one catalog of furniture (`biomes/README.md`, "a fauna kit":
the owner's call, 2026-10). Started 2026-10-06 with the Scyvoi's animals: the **drylands goat** (four variants) and the
**fire salamander** (two markings, three breeds), moved here from `kits/scyvoi`. The same day every other animal in the repo
was gathered here and tagged: **48 species, 136 builds** (every variant and breed), each ported from the build that first drew
it, at its real size in metres, with `source` naming every build that draws it. 2026-10-07: the Ash Nomads' and the Scyvoi's
herds: the steppe bison, the staghorn beetle, the ash runner and the millipede's ash herd (**51 species, 150 builds**).

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
| `wild` | the biome pass (BIOME-FAUNA-PLAN.md), three waves covering every biome of the plan, and ten more domestic animals (donkey, mule, goose, turkey, rabbit, alpaca, reindeer, bactrian camel, homing pigeon, giant honeybee), and sea and lake fauna (ring dolphin, giant sea turtle, manta ray, giant ring squid, glass jellyfish, reef octopus, ring marlin, banner reef fish, ring cormorant, giant pike, lake sturgeon, giant catfish, lake plesiosaur, lake diver), and eight large hexapods of different countries (dune runner, frost trunker, marsh strider, cavern leaper, cinder crawler, plains hopper, tide crawler, badland digger), and five large hexapods after the owner's reference plates (scytheback, hookstalker, reedneck, gapemaw, clubback): 100 animals (grazers, predators, flyers, water creatures) from the shared builders `faWdQuad`, `faWdFish`, `faWdSerpent`, `faWdCrab`, `faWdRay`, `faWdSquid`, `faWdJelly`, `faWdOcto`, `faWdHex` (a flipper option on `faWdQuad` draws paddles); needs the `hyperjungle` file's helpers |
| `flyers` | quetzalcoatlus, giant bat, giant archaeopteryx, giant dragonfly (each with a `'fly'` pose) |
| `crawlers` | draught millipede (with the Ash Nomads' ash herd), giant riding spider |
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
cut into parts and rigged), listed in the entry as `models: { variant: 'key' }`. Today: the four giant flyers, the draught
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

## Taking animals into a world

Bundle them like the catalog: `fauna_bundle.bundle(['livestock', 'mounts'])` in the world's `build.py` (one closure, one
global `KratorFauna`), then `KratorFauna.build(key, {variant, breed, pose, seed})` per animal and `animate` from the frame
loop. `kits/scyvoi/src/56-sa-beasts.js` is the worked example (`saFauna`, `saFlush`).

## Next

Point the biome kits and the settlements at the bundle in place of their own animal code, one build at a time (each
`source` entry says where an animal is drawn now); see `KNOWN_ISSUES.md`.
