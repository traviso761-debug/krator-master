# deeps: the plan (proposal, 2026-11-02)

**The Deeps**: the floor of the Ring Sea, the one ground on Krator nobody has built and the one its lore has promised the
longest: "their most sacred sites are said to lie on the bottom of the Ring Sea", "the monsters that lurk in the depths"
(`LORE.md` 6.16), "ports with container ships, drone carriers and submarines" (`LORE.md` section 4). The owner's brief
(2026-11-02): a proposal for the sea floor, as the one under-represented place on the map that offers both hazard and
reward. The idea in one line: **a two-storey sea.** The Ring Sea is a warm inland sea in a closed crater basin under 1.9
atm of air that never cools below +30 degC, fed by warm rivers off the Inner Wall, so it is stratified like the Black Sea
and worse: a lit, oxygen-rich upper storey a couple of hundred metres deep, where Earth's reef life grown large and the
Hykkousoi live, and below a sharp line, **the Still**, a black, airless, sulphide deep of 500 to 900 m where no gill
breathes, no wood-borer lives, the Ancients' sunken fleet lies as it sank, and the only life is Krator's own, the
vent-born sulphur lineage, at home where it began. The Hykkousoi can go anywhere in the upper storey and nowhere in the
lower, which is exactly where the prizes are.

Status: **a proposal for the owner.** Nothing is built, nothing on the model is changed and `LORE.md` is untouched. Every
lore and map change this plan wants is marked *proposed*. It is a new domain for the engine (underwater; section 12 and
14 say what that costs), so this plan is longer on the physics and the core than on species. Working names throughout;
the Hykkousoi's words are better.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/deeps/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations, as the Throne's and Korona's (`build.py --station <name>`): `dist/deeps.html` (station 1, the Edge) and `dist/deeps-<name>.html` (section 11) |
| Region on the model | **no new polygon.** The kit's ground is the `Ring Sea` biome polygon's **water**: every wet cell at the -1,500 m level (169,032 km2 connected), whose bed the model already holds (`h` under the water flag); the isles kit (`biomes/ringisles`) keeps the land. Section 5 |
| Object | `DEEPS` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `column`, `still`) on the `BIOME-API.md` contract; `DEEPS.column(x, z, y)` is the water column's state at a point (light, oxygen, temperature, pressure, sulphide) as one pure function of depth and the basin, which every shader, hazard and animal reads; `DEEPS.still(x, z)` the Still's depth there (section 3) |
| Core | `biome`, `rand`, `tags`, `space`, `hazard`, `host` (**a diving camera**, section 14), `atmos` (**an underwater preset**, section 14), `water` (the open sea with its bed, from below), `terrain` (`KFIELD` as the seabed, `KRELIEF`, `KSTACKS`, `KCAVERN`), `clock`; section 13 |
| Read in place | `biomes/ringisles` (the isles above, their reef crests and shore profiles, the geyser kit through it), `biomes/geyser` (the submarine vents' temperature ramp and cycles), `settlements/port` (the Ancient Port kit's vessels, **sunk**: the drone carrier, the submarine, the container ships, as wrecks), `settlements/ys` (the drowned city's streets going down the shelf, by its `waterDepth`/sink plane), `kits/ringsea` (the fleets' hulls on the surface overhead), `kits/fauna` (the sea animals already built: ring dolphin, giant sea turtle, manta ray, giant ring squid, glass jellyfish, reef octopus, ring marlin, banner reef fish, giant sea lion, ring whale) |
| Out of scope | the Hykkousoi's temples as buildings (Ys's and Tethys's kits publish the sites this kit gives them), the Salvagers' and divers' gear (items), the animals' models (`kits/fauna`), the sea's surface (`core/water`, the Ring Sea kit) |

A new biome: it goes in the gallery when it first reaches `main`.

## 1. The idea

The Ring Sea stands at -1,500 m in a closed basin under 1.9 atm of air whose mean over the water is +34 degC and whose
coldest month is +30 (the model's rasters over the 169,000 km2 of connected water). Its rivers come warm off the Inner
Wall's rainy faces (the `Rrivar` rivers of the e inner wall at 40-140 m3/s, the Steampits' `Vai Pou` at 171), and its
bed falls to 888 m in eight basins (section 5). Those facts decide the sea:

- **It never turns over.** A sea mixes when cold surface water sinks in winter. Here the surface never cools, the rivers
  lay a fresher, warmer lid on saltier deep water, and nothing carries oxygen down. Below the wind's mixing and the
  light's reach the water is **anoxic and sulphidic**, as the Black Sea's is below 150 m, and here the deep is warm
  besides (nothing cold ever reached it), so the rot is fast at the top and nil below: a Black Sea at 30 degC.
- **The Still.** The boundary, the chemocline, lies at **150-300 m** by basin (section 3): above it, water rich in oxygen
  (0.4 atm of oxygen in the air above, so the surface holds twice Earth's dissolved oxygen: the reason the Ring Sea grows
  giant sea lions, ring whales and the giant ring squid); below it, hydrogen sulphide, no oxygen, no light, no current, and
  a temperature that never changes. **The Hykkousoi breathe water, not sulphide**: their gills take oxygen, and below the
  Still there is none. The line is as hard for them as the surface is for a drowning man. It is the floor of their world
  and the roof of the prize.
- **The prize keeps.** Nothing that bores wood or rusts iron lives in sulphidic water without oxygen: the Black Sea's
  Byzantine wrecks stand with masts up. The Ring Sea's floor below the Still holds **what sank in the Cataclysm as it
  sank**: the Ancients' ships from the ports the lore lists (container ships, drone carriers, submarines), a thousand
  years down with their holds shut, in water that never moved. Every salvager's story about the Ring Sea is about this,
  and none of them can reach it.
- **Krator's own life is at home there.** Canon: native life began "round volcanic vents" (`throne/NOTES.md:87-89`), and
  it is sulphur chemotrophy where the Throne's vents are (`throne/NOTES.md:293-297`). The Still is the one place on
  Krator that is sulphide from wall to wall, and the geyser isles' vents run on under the sea (*proposed*, section 5):
  so the deep is a native biosphere entire, the sulphur lineage grown into reefs round black smokers at 600-900 m, with
  no Earth competitor, because nothing of Earth's can breathe there. The lineage's cradle, kept as it was.
- **Two storeys, one sea.** Above the Still: Earth's reef life at Krator's size (the fauna kit's), the Hykkousoi's pearl
  beds and sacred ledges, Ys's drowned streets running down the shelf, light to about 80 m and twilight to the line.
  Below it: black water, native reefs on the smokers, the pickled fleet, and the things the lore calls monsters, which
  are the one kind of animal that can cross the line: air-breathers that dive (the ring whale) and native things from
  below that rise at night to hunt the storey above.

So the sea floor is not one biome but two stacked, and the boundary is the biome: where the Hykkousoi's world ends and
the Ancients' sleep begins, and where, once in a few years, a storm rolls the black water up to the surface and kills
every fish in a bay (section 9).

## 2. Why it is alien, and why it is Krator's

### What a reader has not seen

- **A sea with a floor at 200 m that is not the bottom.** A hard chemical line in the water, visible as a change of
  colour and a haze of bacteria, that no gilled thing can cross; the sacred edge of a water-breathing people.
- **A sunken fleet kept new.** The Black Sea does this to Byzantine hulls; here it does it to a civilisation's port
  fleet, drone carriers and submarines included, lying intact in warm black water for a thousand years.
- **A native biosphere entire,** reefs of the sulphur lineage round black smokers with no Earth life anywhere in reach,
  the one place the vent-born life was never pushed back from.
- **Monsters with a reason.** The deep's natives rise through the Still at night; the upper storey's giants dive through
  it holding their breath; the line is where they meet.

### The trends it extends (what Krator's native life already does)

| Trend (the files) | How the Deeps carry it |
|---|---|
| Native life is vent-born and clusters on geology's energy; where Earth life fails, native life is the whole flora (`throne/NOTES.md:87-96, 293-297`; `godthrone/PLAN.md:192-201`) | the Still is where Earth life fails absolutely (no oxygen), and the native sulphur lineage has it entire; the smokers are the vents it began on |
| The body is a host that takes a partner; the partner decides (canon, 2026-11-02, `biomes/gills/PLAN.md`); the partner kinds light, redox, heat (`biomes/hearths/PLAN.md`) | redox partners on sulphide, as the Throne's; the reef bodies are the fungoid host's underwater forms (sealed skins, no leaves); no new partner kind |
| Dense air gives size (`LORE.md` section 2: insects and flyers grow larger; `necanyons/PLAN.md:62`) | twice Earth's dissolved oxygen at the surface is why the upper storey's animals are giants, which the fauna kit already builds (giant sea lion, ring whale, giant ring squid) |
| The sea's plants come ashore at Farside, and are foreign (`farside/PLAN.md:67-70`) | the Ring Sea's own sea life is the inland sea's: Earth's reef kinds that came with the Ancients' aquaculture (*proposed*) above the Still, and nothing of Earth below it |
| Native life is the natives' armoury, medicine and trade (`throne/NOTES.md:109-134`) | nacre and pearls are the Hykkousoi's (`LORE.md` 6.16: "the finest pearldivers and mother-of-pearl workers in the world"); the smokers' sulphide is copper; the fleet is the Salvagers' |
| Every placed thing a hazard record where it hurts (`biomes/HAZARD-RESEARCH.md`; `core/hazard`) | the Still as one `gas` record over a whole basin, pressure as `crush` by depth, drowning as `drown` for the unadapted (section 9) |
| Lineages cross kits as cousins (`BIO.kin`) | the smoker reefs are kin of the Throne's vent coral and brimstone candelabras; the deep's hunters kin of the Rift's gapemaw |

### Where it breaks a trend, and why the break is earned

- **A whole domain, not a flora.** Every biome kit so far is a flora on a ground under a sky. This one is a water column
  with a floor, seen from inside, and most of what it must do is in `core/atmos`, `core/water` and `core/host` before a
  single species (section 14). The break is earned because the lore has pointed at this floor for as long as there has
  been a Ring Sea, a people lives half in it, and the game's central loop (delving the Ancients' wrecks) has its richest
  untouched site here.
- **The reward is where the people cannot go.** Elsewhere the natives are the guides (the Tungangs under the rim, the
  Zeijani in their tubes). Here the Hykkousoi, who own the sea, stop dead at the Still; the deep belongs to whoever
  brings air down with them, which is an Ancient's machine or a held breath. That is the hazard and the reward in one
  line, and it is why the Salvagers and the Hykkousoi need each other.

## 3. The physics, honestly

- **Pressure.** At 0.75 g a metre of water adds 7.4 kPa: 100 m is 7.3 atm of water over 1.9 of air, the deepest floor
  (888 m) about 67 atm. A gilled diver has no gas to narcotise him and nothing to decompress, so the Hykkousoi's depth is
  limited by the body (Earth's fish go to the Still's depth and far past), not by the air; an unadapted human has a
  held breath and the surface.
- **Light.** The air above is dense and hazy (`biomes/WORLD.md`, "Dense air lights the world differently"), so the sea's
  surface gets a little less sun than Earth's tropics and the light is yellower. In clear water the photic zone runs to
  about 80 m, twilight to 200; the Still is at or below the light's end everywhere, so the deep is black.
- **Oxygen.** Warm water holds little oxygen, but the air's oxygen partial pressure is 0.4 atm against Earth's 0.21, so
  the surface holds about **13-15 mg/l**, twice Earth's tropical seas: a rich upper storey. With no overturn, the oxygen
  consumed by the rot of what sinks is never replaced below the mixed layer, and sulphate-reducing microbes take over:
  **hydrogen sulphide below 150-300 m**, as in the Black Sea (whose line is at ~150 m with a 2,000 m deep). The line is
  deeper where the wind mixes most (the open eastern sea) and shallower in sheltered arms (the Bay of Voth's, the
  Steampits' coast). `DEEPS.still(x, z)` gives it per basin from the model's wind and fetch; the plan's numbers: 300 m in
  the great eastern basin, 200 in the southern ones, 150 in the bays.
- **Temperature.** Surface 28-32 degC; the deep the same within a few degrees, since no cold water ever formed (the
  coldest month's air is +30): a warm anoxic deep, which is why its rot stops (no oxygen) and its iron does not rust.
  Round the submarine vents, hot: at 600-900 m water boils at about 250-280 degC, so the smokers run to that and no
  hotter (grey-to-black smokers, not Earth's 350 degC).
- **The vents.** The Ring Sea has "many geysers" (`LORE.md` section 3.1) and the model gives twelve on the isle demo's
  islands alone and more round the Throne's isles; the heat-pipe crust under the sea is the same crust. *Proposed*: the
  vents run on under the water as submarine fields along the isles' lines, with no change to the model's vents (they are
  the kit's own records, at the isles' bearings, below the Still).
- **Storms and the black tide.** A great storm's mixing can lift the Still's water in a sheltered arm: hydrogen sulphide
  reaches the surface, the water goes milky and the fish die, as the Black Sea's and Namibia's shelf's do. Rare, a few
  days, and the Hykkousoi know it (section 9): the one time the deep comes to the living.
- **Preservation.** Below the Still: no oxygen, so no rust and no wood-borers; warm, so what oxygen-free rot there is
  finishes fast and stops. A steel hull a thousand years down is pitted where its paint failed and whole where it held;
  wood, cloth and rope are intact; the holds' contents are what they were, under a skin of black mud. The lore's
  preserved salvage of the Catch (the dry air) has its twin here in the dead water.

## 4. Ideas considered and set aside

1. **A coral sea.** The Ring Sea's shelf as a reef biome: Earth's reef at Krator's size, pearl beds, the Hykkousoi
   among it. Set aside as the whole idea: it is Earth under glass, and Farside and the ring isles already own the shore.
   Kept as the upper storey, where it belongs, in the fauna kit's hands.
2. **The drowned city alone.** Ys's streets going down the shelf as the biome. Set aside: Ys's kit already drowns its
   city and owns its sink plane; a kit of the sea floor cannot be one settlement's forecourt. Kept as station 2's ground,
   read in place.
3. **A kelp forest.** Set aside: Farside's land kelp is the kelp on Krator and it is foreign (`farside/PLAN.md`); an
   inland sea at 30 degC grows no kelp.
4. **The deep as a dark abyss with glowing things.** The Earth deep-sea picture, bioluminescent and cold. Set aside:
   the Ring Sea's deep is warm and sulphidic, not cold and oxygenated; its life is the sulphur lineage on smokers, and
   the lineage does not glow where there is no audience (the Gills' rule). The one glow is the Hykkousoi's lamps.
5. **A sea monster biome.** The Ring Sea told through its leviathans. Set aside as the frame: the animals are
   `kits/fauna`'s and are mostly built; the biome is the water column that makes them, and the monsters are what crosses
   its line.

The Deeps beat them because the mechanism is one paragraph a limnologist would sign (a warm closed sea under dense air
cannot overturn, so it is euxinic below its mixed layer), it is visible (the colour of the Still, the pickled fleet, the
black tide), it needs Krator (1.9 atm, a sea that never cools, a vent-born sulphur lineage, a water-breathing people with a
hard floor), and it is the richest untouched reward on the map with its hazard built into the chemistry.

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-02)

**The sea**: every water cell connected at the -1,500 m level inside and round the `Ring Sea` biome polygon: **169,032
km2**; air over it 1.9 atm, +34 degC (38/30), 2,800 mm. Depth: median 188 m, a tenth over 575 m, the deepest 888 m. By
band: under 50 m 24,800 km2 (the shelves, the drowned coasts, the pearl beds), 50-200 m 62,700 (the lit and twilit
storey), 200-400 m 49,200 (the Still's band), 400-600 m 17,000, over 600 m 15,300 (the dead deeps).

**The deep basins** (over 500 m), the Still's floor and the fleet's resting places:

| Basin (5.1 px) | km2 over 500 m | Deepest | Shore and people |
|---|---|---|---|
| **The Great Deep**, 968,820 (bbox 933-993 by 772-863) | 7,396 | 888 m | the eastern sea off the lee shore: Bipo 64 km, Valapo 91 km, **Mav's Refuge 115 km** (the Beast Riders' lee-shore town), Fort Vaklu; the isle demo's archipelago on its west |
| 939,885 (923-957 by 858-910) | 3,508 | 886 m | **Noa's Regret 94 km** (the ruined arcology with the flooded holds), Fort Vaklu, Nusidi |
| 891,958 (855-923 by 941-978) | 3,012 | 844 m | Port Tobin 87 km, Pylon 98 km, Iziz 154 km: the Empire's water |
| 856,932 (832-898 by 913-959) | 2,544 | 888 m | **Hook 96 km** (the Ancient port city, the premier port, its wreck market and Scraptown), Qarnu-Tubu |
| 943,731 (918-965 by 717-741) | 1,936 | 850 m | **Kautoa 43 km** (the Islanders' capital), Port Goto 83 km |
| 913,927 (895-929 by 913-942) | 1,452 | 836 m | Port Tobin 100 km |
| 921,984 (915-927 by 973-999) | 524 | 809 m | Port Tobin 30 km |
| 741,867 (735-747 by 855-879) | 520 | 589 m | **Temora 53 km, Almua 55 km** (the Vothic coast), Pontus |

- **The shore towns within 20 km of the water**: Ys (789,738), Tethis (733,775) and Nereus (762,805), the Hykkousoi's;
  Zey'danin (795,860) and Temora, Voth's; Kautoa and Valapo, the Islanders'; Port Goto and Fort Kalor, Shell Province's;
  Kierson and Port Visas; Port Tobin and Fort Vaklu, Iziz's; Noa's Regret and Nusidi, ruins; Torus; Dhelv's cavern.
- **The vents**: the model's geysers are shore and island vents (the Steampits' six, the isle demo's twelve, "many more
  ring the Throne's isles", `biomes/geyser/NOTES.md`); one Steampits vent sits on a water cell at px 887,724 under 117 m.
  The submarine fields are *proposed* as the isles' lines continued below the Still (section 3), recorded in the kit.
- **Where the fleet lies** (*proposed*): the Ancients' ports were Hook (canon: the Ancient port city), Ys (a drowned
  Ancient city) and Tethys (an arcology on the shore); the ships that were at sea or at anchor in the Cataclysm went
  down where the storms and the war put them, and the deep water nearest those ports is the Hook basin (856,932, 888 m)
  and the Great Deep. Noa's Regret's flooded holds are the one Ancient hull a player can already walk (the settlement);
  this kit gives the others' positions as records and sinks the Port kit's vessels there.
- **What the kit does not touch**: the isles' land (`biomes/ringisles`), the surface (`core/water`'s open sea and the
  fleets' hulls on it), the model's heights and vents.

## 6. The ground and the landforms (`core/terrain`, under water)

- **The seabed** (`KFIELD`): the model's bed at 1:1 (`h` under the water flag) with the kit's own relief: the shelf's
  sand and reef rock (the isle demo's shore profile continued down), the drop-off's cliffs where the shelf breaks
  (`KRELIEF.range` upside down: the basins' walls), the basin floors' black mud (`KGROUND` a `silt` layer), drowned
  river channels across the shelf (the `Rrivar` rivers' courses below the shore, `KRELIEF.river` as a dead channel),
  slumps and fans at the walls' feet (`KRELIEF.talus`).
- **The Still** (`DEEPS.still(x, z)`, a field): a depth surface over the sea, deeper in the open east, shallower in the
  arms; drawn as the water's colour and haze change, and as the hazard's roof.
- **The smokers** (*proposed* `KSTACKS` kind `smoker`, or the geyser kit's cones re-profiled): chimneys 5-40 m of
  sulphide on the basin floors along the isles' lines, venting (the geyser kit's cycle maths, `WATER.geyser`'s
  `state(t)`, read in place for the pulsing columns), their plumes as particles that rise and spread at a density step.
- **The fleet** (`settlements/port`'s `PORT_VESSEL`s, sunk): hulls on the basin floor and on the drop-off's slopes,
  listing, half in mud, the drone carrier on its side with its flight deck a cliff, the submarine whole in the Hook
  basin, container ships with their stacks spilled downslope; a decay preset per hull per depth (above the Still: rust
  and reef; below: whole and black). `KCAVERN` for a hull a camera can enter (the holds, as Noa's Regret's).
- **Ys's drowned shelf** (station 2): the city's streets continuing down the shelf past the kit's sink plane
  (`settlements/ys`, `waterDepth`, the drowned grid), reef-grown to 30 m, bare and dim to 80, the last towers' tops at
  the twilight's edge.
- **Pearl beds and nacre reefs** (the upper storey's native-looking thing): the Hykkousoi's "close friendship to
  molluscs" and grown nacre (`LORE.md` 6.16): beds of giant oysters on the shelf, and reefs that are nacre-skinned
  (*proposed*: the Hykkousoi's grown biotech, farmed), the city's building stuff growing on the floor.
- **The far field** (`KFAR`, under water): the drop-off fading into the Still's black, the surface a bright ceiling with
  the hulls' shadows crossing it, the isles' roots as dark masses.

Fields and seeds are deterministic from the bed and the basin records (`KRAND` by cell), as every kit's.

## 7. The life

### The upper storey (0 m to the Still): Earth's, at Krator's size, read in place

The fauna kit's sea animals (ring dolphin, giant sea turtle, manta ray, giant ring squid, glass jellyfish, reef octopus,
ring marlin, banner reef fish, giant sea lion, ring whale; `kits/fauna/BIOME-FAUNA-PLAN.md`, "Sea and lake fauna") and
the ring shark it plans, drawn from the fauna bundle with a swimmer gait; the reef's own plants and corals (*proposed*
as Earth's, come with the Ancients' aquaculture: seagrass on the shelf, reef corals to 40 m, sponges and sea fans in the
twilight) as the kit's `card`s and `BIO.fung` forms with Earth models named. The Hykkousoi's pearl beds and nacre reefs
(above). Nothing native lives in the upper storey but the things that rise from below at night.

### The Still (the line): the native sea's upper edge

| Key | Name | Where | What it is |
|---|---|---|---|
| `veil` | **The veil** | the chemocline, a band of 10-30 m | the native biosphere's top: a haze of sulphur-eating microbes where sulphide meets the last oxygen, drawn as a milky, faintly pink layer the light dies in; the Hykkousoi's floor, where their sacred ledges stand just above it (section 9) |
| `veilmat` | **Veil mat** | the drop-off's ledges and walls in the band | the fungoid host with a redox partner, kin of the Throne's thermal mats and acid pads, flat and pale, the first native thing a diver sees, at the edge of where he can breathe |

### The deep (below the Still): Krator's own, entire

| Key | Name | Where | What it is |
|---|---|---|---|
| `smokerreef` | **Smoker reef** | the submarine vents, 600-900 m | the sulphur lineage grown into reefs round the chimneys: stacked cups, candelabras and fans of fleshy body under a sulphide crust (kin of the Throne's vent coral and brimstone candelabras, `throne/NOTES.md:293-297`), pale and rust and black, living on the vents' sulphide and the sulphide of the water itself: the richest native stand on Krator, in the dark, with no Earth competitor within 300 m of water |
| `blackweed` | **Black weed** | the basin floors between the vents | long ribbons of the lineage rooted in the black mud, feeding on the sulphide gradient at the mud's face, swaying in no current: the deep's "grass", and what the fleet lies in |
| `hullgarden` | **Hull garden** | on the wrecks | the lineage colonising Ancient steel: the one place that asks how native life takes Ancient materials (the digests' open hook): rust-eaters on the pitted plate where paint failed, veil mats in the holds' mouths, nothing on the paint that held |
| `deepcup` | **Deep cup** | the drop-off below the Still | cups a metre across on the walls, their mouths up, catching what sinks from the living storey (the deep's one import): the lineage's filter-feeder |

### Fauna (`kits/fauna`; the deep's own, new)

| Key | Name | What it does |
|---|---|---|
| `veilrider` | **Veil-rider** | a native swimmer that lives at the Still and rises through the upper storey at night to hunt, holding the sulphide it breathes as a diver holds air: the "monster" the lore means, the size of a boat, kin of the Rift's gapemaw by `BIO.kin`; the hazard `hunter` of the night sea |
| `mudwalker` | **Mud-walker** | a six-limbed native crawler on the basin floor, grazing the black weed and the hull gardens; what a salvager's lamp finds on a deck |
| `ringwhale` | ring whale | in `kits/fauna`: the one Earth animal that crosses the line, diving through the Still on a held breath to take veil-riders at the band; the Hykkousoi's guide to where the Still lies |

## 8. The people's side

- **The Hykkousoi** (`LORE.md` 6.16): water-breathers whose "most sacred sites are said to lie on the bottom of the Ring
  Sea". *Proposed*: the sites are on the drop-off's ledges **at the Still's edge**, the bottom of their world, where the
  veil begins: temples grown of nacre on the last breathable shelf, lit by their lamps, reached by a dive of 150-300 m
  that only a trueborn Hykkousoi makes. Their pearl divers work the shelf; their pilots know the Still's depth in every
  bay by the ring whales' dives; their tale of what lies below is the Lie's cousin: no Hykkousoi has seen the fleet,
  and all of them know it is there. Gill-wither keeps them to the coast (`LORE.md` 6.16); the Still keeps them to the
  upper sea.
- **The Salvagers** (the Republic's, Iziz's and Hook's guilds; "a refloated Ancient steel tug", Hook's wreck market and
  Scraptown, Iziz's salvage lighter) know the fleet is down there and cannot reach it: a diving bell on a Hykkousoi's
  line reaches the Still and no further. *Proposed*: the game's way down is **an Ancient's machine**: a diving suit or
  submersible from a drowned port's stores (Hook's, Ys's) or the Catch's dry salvage, the one tool that opens the deep;
  the player who has one has the richest site on Krator to himself, and every guild on the sea after him.
- **The Islanders** (Kautoa 43 km from a deep basin) free-dive the shelf for pearls and shell; **Voth** and **Iziz**
  fish and fight on the surface over all of it; **the Beast Riders' Mav's Refuge** looks down on the Great Deep from the
  lee shore.
- **The black tide** (section 3): when a storm rolls the Still up in a bay, the fish die for days and the shore stinks
  of sulphide; the Hykkousoi call it the deep's breath (*proposed*) and read it as an omen; the Islanders dry the dead
  fish. A weather event on `core/atmos`'s weather, rare, with a hazard record (`gas`, mild) on the water's surface.

## 9. Resources, hazards

- **Pearls and nacre** (`kits/crops`? no: the catalog's trade goods): the Hykkousoi's, on the shelf's beds; the nacre
  reefs their building stuff.
- **The fleet**: Ancient hulls, cargo, machines, the submarine's and the drone carrier's contents, preserved as nowhere
  else but the Catch's dry air: the reward, below the Still, reachable with Ancient gear only. *Proposed*: `kits/ancients`
  salvage tables with a `preserved` grade for what comes out of the dead water.
- **Sulphide ore**: the smokers are copper-zinc sulphide (`kits/resources` family `copper`, owner nodes at the vents,
  high grade), which no one mines, because no one can.
- **Medicine**: *proposed* the veil mat's partner as the Hykkousoi's remedy for gill-wither (a sulphur salve), gathered
  at the edge of what they can breathe: the same water two uses, life and death a metre apart.
- **Hazards** (`core/hazard`, each a record): **drowning** (`drown`) for the unadapted below the surface; **pressure**
  (`crush`) by depth for anything with air in it (a diving bell, a lung); **the Still** (`gas`, suffocate) as one record
  over each basin from `DEEPS.still` down, danger 1 for any gilled thing including a Hykkousoi; **the smokers** (`heat`)
  at the vents; **the veil-rider** (`hunter`, by night, in the upper storey); **the black tide** (`gas`, mild, on the
  surface, a weather event); **the dark** (no record: the lamp's reach is the player's problem).

## 10. The lore it proposes

- The Ring Sea is a two-storey sea: oxygen-rich and lit above 150-300 m, sulphidic and dead below (*proposed* for
  `LORE.md` section 3.1's Ring Sea entry).
- The Hykkousoi's sacred sites stand on the drop-off at the Still's edge, the bottom of the breathable sea (*proposed*
  for 6.16).
- The Ancients' Ring Sea fleet lies preserved in the dead deeps; no one has reached it; the way down is an Ancient
  machine (*proposed* for section 4 and 6.16).
- The native sulphur lineage holds the deep entire, round submarine vents along the isles' lines (*proposed* for section
  8; consistent with the Throne's canon and the Hearths' origin).
- The black tide (*proposed* for 6.16 and the Islanders).

## 11. Stations

Each station takes its date and hour from `99-host-take.js`; the host's **diving camera** (section 14) descends from the
surface, so every station begins in the air above the sea and the first ten seconds are the descent.

1. **The Edge** (`dist/deeps.html`; the drop-off off the Hykkousoi's coast between Ys and Tethis, px ~760,760, where the
   shelf breaks to 400 m): **the first ten seconds**: the camera drops from the Ring Sea's bright surface through the
   reef's colour, past the last light into blue-black twilight, and comes to rest on a ledge at 180 m beside a nacre temple
   lit by Hykkousoi lamps, with pearl divers' lines hanging from the brightness far above; below the ledge the water goes
   pink-white in a band and then black, and a ring whale drops through it. The **night** preset: the lamps alone, and a
   veil-rider coming up through the band.
2. **The drowned shelf** (`-ys`; Ys's shelf, px ~789,745): the city's streets going down from the sink plane the Ys kit
   draws, reef-grown to 30 m, bare and dim to 80, the last towers' tops at the twilight's edge, pearl beds between the
   drowned blocks, Hykkousoi divers at work; the surface city overhead through the water.
3. **The smokers** (`-smokers`; a submarine field under the isle demo's archipelago, px ~940,780, 600-800 m): black
   water, the lamp's cone, chimneys venting on the geyser kit's cycles, smoker reefs of the sulphur lineage round them in
   rust and bone, black weed between, mud-walkers; the first native biosphere a player sees entire, and the deadliest
   water on Krator for anything that breathes.
4. **The fleet** (`-fleet`; the Hook basin, px ~856,932, 700-888 m): the Port kit's vessels on the floor: the drone
   carrier on its side with its deck a cliff grown with hull gardens, a container ship's stacks spilled downslope, the
   submarine whole in the mud with its hatch shut; black weed, a mud-walker on the deck; a hold a camera can enter
   (`KCAVERN`), its cargo as it was. The reward, lit by one lamp.
5. **The black tide** (`-tide`, optional; a sheltered bay, the Bay of Voth's mouth or the Steampits' coast): the Still
   rolled up to the surface by a storm, the sea milky and pink, dead fish on the swell, the shore crowded, the Islanders
   drying the catch; seen from the surface, the one station that is not a dive.

## 12. How it reads, and what it costs

- **Geometry.** The seabed is a `KFIELD` like any ground; the reefs and weed are `BIO.fung` forms and cards on the
  core's instancing; the smokers are stacks; the wrecks are the Port kit's hulls (already budgeted there) with a sunk
  dress. Target: **under 5 M triangles and 60 draw calls per view** on the integrated GPU, measured as the Godthrone's
  `PERF.md` measures; the water column costs no triangles.
- **The water from inside** (section 14, the new core): a fog whose colour and density come from `DEEPS.column`
  (blue-green to black with depth, pink-white in the veil's band), light attenuation by depth and wavelength on every
  material (one uniform set), caustics on the shelf from the surface's wave field (`core/water`'s shared field,
  projected), god rays as the surface's light shafts in the upper storey, the surface seen from below as a bright
  ceiling with Snell's window, particles (marine snow, the smokers' plumes, the lamps' motes). Godot has every one of
  these as a built-in (fog volumes, a volumetric light, a `WorldEnvironment` swap on submersion).
- **Motion.** Fish and swimmers are the fauna kit's; the weed sways on `BIO.animHook` with no current (a slow phase);
  the plumes are particles on the geyser kit's cycle.
- **Light.** No sun below 200 m: the lamps (the Hykkousoi's, the player's) are the light, as `core/atmos`'s street
  lamps are a town's at night; the upper storey takes the shared sky through the surface.
- **Godot.** Everything above is data: the bed a field, the Still a function with a GDScript twin, the hazards
  `Area3D`s (the Still's as one volume per basin), the wrecks the Port kit's exports, the column's fog an `Environment`.

## 13. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

Start from `biomes/ringisles` (the isle demo's sea on `core/water` with its bed and shore grid) and `settlements/ys` (the
drowned city). The modules the kit takes, by name, and for each it does not, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10-core-head`, `20-core-kit`, `30-core-foliage` (the cards' two-sided light, re-lit by the column), `31b-core-leafset`, `32-core-variants`, `33-core-fungoid` (`BIO.fung`: the reefs, cups, mats), `34-core-impostor`, `35-core-anim` (the weed's sway), `40-core-place`, `42`/`43-core-export(-host)`, `44-core-stage` | every species on the core's builders and items |
| `core/rand` | `KRAND` | every bed cell, reef, wreck and plume (`KRAND.hash(world, ix, iz, salt)`) |
| `core/tags` | `50`, `52`, `53` | every reef, wreck, vent, temple site and hazard a record |
| `core/space` | `KSPACE` | the keep-clear between wrecks and reefs, the nearest-vent index |
| `core/hazard` | `KHAZ` (`20-core-hazard.js`) | drown, crush, the Still's gas, the smokers' heat, the veil-rider, the black tide |
| `core/clock` | `KCLOCK` | the hour (the night rise), the storms' season |
| `core/terrain` | `30-core-field` + brush (the bed), `37-core-stacks` (`smoker` *proposed*), `38-core-relief` (`range` for the walls, `talus`, `river` for the dead channels), `39-core-cavern` (a hull's holds), `43-core-ground` (`KGROUND`: a `silt` layer *proposed*, sand and reef rock), `44-core-farfield` + draw (the drop-off into black) | the seabed, the walls, the wrecks' interiors |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, `bindWeather` (the storms), `3-particles` (marine snow, plumes, motes), `2-lights` (the lamps); **the underwater preset, *proposed*** (section 14) | the column's light and fog, the lamps, the surface overhead |
| `core/water` | `20`, `21`, `22`, `50`, `51` (the open sea with its `bed` and depth grid, drawn **from below**: *proposed*, section 14), `geyser/52` + draw (the smokers' cycles), `ext/57` | the surface as a ceiling, the bed's depth, the vents' pulses |
| `core/host` | `FULL`, plus **the diving camera, *proposed*** (section 14) | the page shell, the descent |
| `core/materials` | `record` (`KMAT`) and the generated pack (`materials.json`, `tools/textures/pack.py`) | every library set (section 15) |
| `core/export` | `07`, `09` | the krator-world container; the hazards section |

Not taken: `core/mask`, `core/city`, `core/hamlet`, `core/camp`, `core/simulation`, `core/furnish` (the temples and the
divers' gear are a settlement's and the catalog's), `core/lod` (the biome core's covers it), `core/walk` beyond a hull's
holds, `33b-core-bamboo`, `36-core-walker`, `37-core-traps`, `38-core-fire`, `39-core-lean`, `46-core-lava`, `KFROST`,
`KBASIN`, `KSCOUR`, the season beyond the storms. `kits/crops`: nothing (pearls and nacre are the catalog's goods).

`tools/check_core_use.py` runs before the first station is called done; the water-from-below and the underwater preset
are added to its table of what a sea-floor kind needs.

## 14. New in core (this is the real cost of the biome)

1. **An underwater preset in `core/atmos`** (`[G data]` + GLSL): the column's fog (colour and density by depth and by
   `DEEPS.column`'s sulphide band), wavelength-dependent attenuation applied to every material's lighting (one uniform
   set the kits' shaders already have hooks for through `KMAT`), caustics on surfaces near the shelf projected from
   `core/water`'s shared wave field, light shafts in the upper storey, the surface from below as a bright ceiling with
   Snell's window and the hulls' shadows, marine snow. A Godot `Environment` and volumetric fog twin. **The largest
   item**, and the one every later wet page (Ys's canals from inside, the Rift's lakes, Spider Lake) would reuse.
2. **`core/water` drawn from below**: the open surface's mesh and shader seen from the water side (a back face with the
   sky's refraction and total internal reflection past Snell's angle), and `WATER.depthAt` and the bed grid as the
   column's floor. Medium.
3. **A diving camera in `core/host`**: the walker's camera with buoyancy and a vertical axis, a descent rate, a lamp,
   and the `KHAZ` dose for drown and crush by depth; a surface-to-floor path for the presets. Medium.
4. **`DEEPS.column(x, z, y)` and `DEEPS.still(x, z)`** are the kit's own (`[G data]`, with a node test and a GDScript
   twin), but `KHAZ` needs a **volume record** whose roof is a field (the Still's) rather than a fixed `y0`: a small
   extension to `shape` (`y0Fn` by name, as `stateFn` is).
5. **`KSTACKS` kind `smoker`** and **`KGROUND` layer kind `silt`**: small.
6. **The Port kit's vessels as wrecks**: a `sunk` dress (list, mud line, the hull-garden mask) on `PORT_VESSEL`, and a
   placement that lays a hull on a sloping bed. In the Port kit, not core; small.

Nothing else is new. The bed is a `KFIELD`, the reefs `BIO.fung`, the vents the geyser kit's cycles.

## 15. Textures

Read the library first (`core/materials/PLAN.md`). **Reuse:** `ground.silt`, `ground.sand`, `ground.reef.flat`,
`ground.lagoon.seagrass`, `card.reef`, `card.seaweed`, `card.kelp.1` (the twilight's sea fans, re-tinted), `stone.coral`,
`organic.coral.brain`, `organic.flesh.cells`, `organic.coil.ribbed`, `organic.pitcher.throat`, `ground.mat.thermal`,
`ground.sulphur`, `rock.gossan`, `metal.ancient.rust`, `metal.ancient.white`, `metal.hull.rivet`, `metal.rust.plate`,
`metal.container`, `concrete.rust.streaked.sea`, the Port kit's and Ys's own sets (nacre, the Hykkousoi's shell family).

**To source or generate** (generic ids; prompts below, paste-ready, to go into `core/materials/PROMPTS-NEEDED.md` on
approval; never a procedural stand-in without saying so):

- `mineral.sulphide.smoker`: a black smoker's chimney wall. Full colour.
- `ground.mud.euxinic`: the dead deep's black mud with a grey microbial skin. Full colour.
- `organic.reef.sulphur`: the smoker reef's fleshy body under its sulphide crust. Tintable.
- `card.blackweed`: the deep's ribbon weed, a cut-out on magenta.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: the wall of a deep-sea black smoker chimney,
rough knobbly metallic sulphide, charcoal black (#1a1a1c) with brassy
chalcopyrite glints (#9c7a3a) and patches of dull red-brown (#5a3020),
fine sooty texture, a few pale grey anhydrite veins (#c8c4bc). Full colour:
not tinted.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: fine black marine mud (#111214) with a thin,
patchy pale grey-white microbial skin (#b9b6ae) over it, cracked and
curling at its edges, a few small dark pits and faint ripple marks, no
shells, no stones. Full colour: not tinted.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a fleshy organic reef surface of packed rounded
lobes and short tubes, their skin smooth and slightly translucent, crusted
unevenly with a thin granular mineral rind that has flaked away in patches
to show the soft surface beneath. Keep colours natural but slightly muted
and even, so the texture can be tinted to different palettes without
looking stained.
```

```
Flat sheet of cut-outs, square, 2048x2048, on a solid flat bright magenta
background (#ff00ff); no magenta, pink or purple anywhere in the subject; no
grey or white background. Flat, even, shadowless lighting. Subject: six
separate long ribbon-like fronds, each a single smooth strap two to three
metres long and a hand wide, gently waved along its length, charcoal black
(#141414) with a faint dark olive sheen (#2a2e22) and a paler grey edge
(#6a6a66), rooted at a small dark knob. No text, no border, no watermark.
```

Reference images to collect into `refs/`: the Black Sea's intact Byzantine wrecks (the fleet), Lost City and TAG black
smokers (the chimneys), the Black Sea's chemocline from a submersible (the veil), Namibia's sulphide eruptions (the black
tide), a cenote's halocline (the colour of a chemical line in water), Mesoamerican and Polynesian free-divers (the
Hykkousoi), the Port kit's drone carrier and submarine (what sinks).

## 16. Order of work

- **D0.** The owner's yes or no on the two-storey sea, the Still as the Hykkousoi's floor, the fleet, the submarine
  vents, the black tide, the way down (section 17); the texture prompts moved to `PROMPTS-NEEDED.md`.
- **D1.** The core: the underwater preset, the water from below, the diving camera (section 14), each with its test;
  then `DEEPS.column` and `DEEPS.still` with their node tests and the hazard records on them.
- **D2.** The ground: the bed on `KFIELD` from the model's water cells, the drop-off, the basins, the dead channels; the
  Still as a field; the `silt` layer.
- **D3.** Station 1, the Edge: the descent, the temple site published as data, the veil, the ring whale; the fauna kit's
  sea animals in place.
- **D4.** Stations 2-4: Ys's shelf in place; the smokers on the geyser kit's cycles and the sulphur reefs; the Port kit's
  vessels sunk in the Hook basin with one hold walkable. Station 5 if wanted.
- **D5.** `verify.py --assert` with the probe's invariants: every native species below `DEEPS.still` and none above but
  the veil's; every Earth reef species above it; the Still's hazard record's roof equal to the field at ten points; the
  wrecks on the bed (no hull floating); the column's fog colour monotone with depth; each with a negative. `PORT.md`,
  the index tools, `tools/check_core_use.py`, `python3 tools/port_baseline.py`, the gallery.
- **D6.** `kits/fauna`: the veil-rider, the mud-walker, the ring whale's dive. `kits/ancients`: the preserved salvage
  grade. `kits/resources`: the copper owner nodes.

## 17. Open questions for the owner

1. **The two-storey sea**: a euxinic Ring Sea below 150-300 m, as the physics gives. Acceptable canon? It touches
   `LORE.md` 3.1 (the Ring Sea), 6.16 (the Hykkousoi) and section 4 (the fleet).
2. **The Still as the Hykkousoi's floor**: their sacred sites at the edge of the dead water, and no Hykkousoi below it.
3. **The fleet**: the Ancients' ships preserved in the deeps; where they lie (the Hook basin and the Great Deep are the
   plan's); what the submarine and the drone carrier hold.
4. **The way down**: an Ancient diving machine as the one key to the deep. From whose stores?
5. **The submarine vents** (*proposed*): the isles' geyser lines continued under the sea, the sulphur lineage's reefs on
   them; no change to the model's vents.
6. **The black tide**: the deep's breath in a storm, a weather event and an omen.
7. **The monsters**: the veil-rider as the lore's lurker, rising at night; the ring whale as the one Earth diver through
   the line.
8. **The Hykkousoi's words** for the Still, the veil, the sites and the tide; the kit's name (`deeps`).
9. **The core cost**: the underwater preset, the water from below and the diving camera are the biome's real price
   (section 14) and the gift to every later wet page. Build them for this kit, or wait?
