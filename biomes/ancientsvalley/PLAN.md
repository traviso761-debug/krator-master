# The Ancient's Valley: the overlay (plan, revised 2026-11-03)

**Status: plan, nothing built.** This is the valley's master plan. `PLAN-ANOMALIES.md` holds the detail of the places where physics
fails and of the metropolis's drawing tiers; `kits/metropolis` (branch `claude/metropolis-testbed-2b4995`) holds the towers. Lore marked
*proposed* waits on the owner. Every px is on the 5.1 canvas (1821 x 1723, 2 km a px).

The first version of this file (2026-10-29, never committed) is kept in sections 7 and 8: the fields and the sound.

## 1. The owner's brief (2026-11-03)

Kept whole, because it is the test every station is judged by.

- **This biome sells the feel of the game**, and may shape the arcology builds to come.
- **The hand of man is on screen at all times, and it is clear that man did something very wrong.** At least one artificial
  structure in every medium view. This is expensive; the metropolis test bed has the answers, and heavy methods are spent with care.
- **The core of the Ancient civilization, once heavily populated: a true megalopolis** (Mega-City One of the 2012 *Dredd*, for the
  original scale), its buildings from the Metropolis kit. **But it was idyllic once**, and that shows: Soleri-style planned farmland
  toward the outskirts, ruined park and garden districts, all wildly overgrown with long-feral vegetation. Clear residential, service and
  industrial areas, served by subway tunnels that are now the home of mutants and stranger things. The marked settlements are centres of
  construction, a little more intact; the blast craters were also major centres once.
- **The terrain is scarred.** Some areas will never grow again. Most buildings are ruins; some will collapse under too much force; a few are
  intact enough to loot or squat in.
- **The war unleashed otherworldly forces.** Likely the Lizardmen and a variety of mostly hostile extraplanar entities; and in places the laws of
  physics were injured: time slowed, sped up or frozen for a while; gravity upside down or sideways; impossible geometry; portals to other
  places, some not on Krator; space itself distorted, which is bad for most life; terrain distorted; places larger inside than out. And
  ordinary radiation. **Every hazard has a subtle but visible or audible cue for the attentive.** Some craters, ruins or arcologies have one
  hazard theme over the others, for different Ancient weapons. Between them, relatively normal areas where the natives, organic or
  silicon, are the greatest danger.
- **Who lives here.** Mutants (changed by radiation or extradimensional forces), savage, hunting feral animals, not friendly. Heavily augmented
  humans ("cyberfreaks": a better name is wanted), few, who know the valley's hidden places best; former Ancients or their near descendants,
  distant cousins of the Yusar, lich-like in their prolonged lives, cool and calculating, protective of themselves, willing to bargain and
  willing to break the bargain. Feral robots: some harmlessly keeping a thousand-year routine, some attacking on sight, some feigning docility
  until the moment for betrayal, hard to tell apart from afar; Eternians may influence them, at a risk.
- **Flora:** a mix of the SW and NW lowlands', both scaled larger and made more feral, shaded toward red-purple and blue-purple undertones with
  green; wild overgrowth wherever radiation or worse has not scarred the ground; mutant animals and plants seen too.
- **References:** `C:\Users\travi\OneDrive\Pictures\krator\ancientvalley\` (`landscape`, `anomaly`, `extraplanar`, `mutants`, `cyberfreaks`,
  `robo`, `artifact`). What they show, in one line each (2026-11-03):
  - *landscape*: towers cut off and half-buried, a round tower broken into a C, a stadium-sphere in a meadow, hex farm pods round a civic
    centre (the Soleri farmland), a yellow train on a viaduct through a cliff of ruin, guns and dish arrays rusting in grass, a city of
    bridges drowned in a green sea, a square gate standing alone in dunes. Scale against a figure in almost every one.
  - *anomaly*: Escher stairs and a sky through a torn hole in a field; a car and a house swept into a diagonal smear; floating slabs; a
    sideways waterfall of lava from a hanging block; a door standing in a field; a ring of machines in a marsh; an eyed monolith.
  - *extraplanar*: tall, thin, stilted things; hooded figures with halos and eyes where faces should be; black voids with eyes; a sun-headed
    giant; geometric solids with their own weather. Nothing with a face a person would trust.
  - *mutants*: human stock gone wrong: extra joints, fused mouths, starfish heads, eyes in clusters, machine parts grafted raw; a few still
    wearing clothes and carrying a gun.
  - *cyberfreaks*: augmented humans from a brute with cables for a spine to a spider-cloak of arms; lean, dark, mostly metal below the neck.
  - *robo*: a tripod on stilts, a shrouded walker in a coat of tubes, a hunched armoured trooper, a haloed figure of stars (an extraplanar
    rather than a robot).
  - *artifact*: hand-sized carved tablets with cyan circuitry; a tree-shaped power core in a cavern of ribs.

## 2. Where it is, on the model

- **The polygon:** `ancient's valley` `rmvowuvfa6urs` (`kind: biome`), px 330-528 by 846-1036: about 400 x 380 km. (`tools/scale-model/README.md`
  and `build_425_master.py` call it `rmva8s97fa99i`, an id that exists nowhere else.) A second, `geographic` polygon, "Ancient's Valley"
  `rmucbbtytfxy1`, spans 341-540 by 864-1028.
- **Under it:** by point-in-polygon on `openworld/little-demo/source/regions.json`, 69% of the valley lies on **SW lowlands** (`rmuqlp4ejzqp4`), 14% on
  **NW lowlands** (`rmuqlni4tiwqm`: a strip along the north edge, px y under about 900) and 17% on neither (the West Outer Wall's slump foot, west of
  about px x 360). **All seven basins and Babel are on SW lowlands.** `extract_region.py` hands the valley's pixels to the swlowlands kit (l.102); it
  is not in `OVERLAYS` (l.140).
- **The lake:** body 242 at **17.4 m** (`build_425_master.py` STEP 5C, l.1104-1187; the outlet record says 17), in the box x 360-560, y 910-1068, the
  old trench regraded to -8..-28 m. Brackish, deep, steam-shrouded, with the drowned foundations of arcologies.
- **The seven basins** (`anc_blast_specs`, cut last in the pipeline; `geology.VITRIFIED` paints a `glass` layer, 180 on the floor and 255 on the rim out to
  1.5 r; the rims' colour is trinitite/obsidian melt). Floors and rims are absolute metres:

  | Basin | r | Floor | Rim | Water | Anomaly (`PLAN-ANOMALIES.md` 3) |
  |---|---|---|---|---|---|
  | 476,915 | 6 km | -22 | 132 | dry | the Press |
  | 398,966 | 5.5 km | -26 | 126 | dry | the Stilled Ground |
  | 450,896 | 5 km | -14 | 140 | dry | the House |
  | 406,908 | 6.5 km | -20 | 134 | dry | the Broken Country |
  | 428,948 | 7.5 km | -44 | 38 | drowned, breached at 35 degrees | the Lake That Falls |
  | 460,962 | 7 km | -46 | 36 | drowned, breached at -145 degrees | the Fast Water |
  | 420,984 | 6.5 km | -24 north, -6 south | 76 | the north half wet, the south a dry melt sheet | the Bend |

- **The settlements inside the polygon** (`model/src/60-settlements.js`, and the owner's list of 2026-11-04): **Babel** 456,908 (ruined arcology), **Necropolis**
  406,944, **Dorado** 483,964 (drowned), **Blade** 451,1022 (ruined arcology, Dalab's outpost), **Wheel** 406,886 (ruined arcology), **Thera** 526,955 (ruin, on the
  eastern rampart). Just outside: **Carcosa** 395,812 to the north (the Yusar's core population, LORE 6.19), **Span**
  554,1010 to the east (Dalab's other outpost and trading post, with the Valley Tunnel portal: `settlements/span/PLAN.md`), **Nazar** 582,1079, **Dalab** 464,1112.
- **Rivers:** the Kaskejt Rivr (760 m3/s) over a 1,200 m hanging canyon off the rain wall, River 2 (604) and River 3 (268) in red-sandstone defiles, River 4 in from
  the Outer Wall (`biomes/wouterwall/PLAN.md`). Climate in the lake box is WH or Cfa (STEP 5C, l.1189).
- **Roads:** the Ancients' route under the Inner Wall ends here (LORE 4, l.154; `openworld/ANCIENT-ROADS.md` l.67-73, 119: the trunk Babel, Necropolis, Dorado, Blade,
  Dalab). The older model pass (`smodel/tranche2_biomes.py` l.292-333) drew two raised causeways radiating from Nazar on the old canvas; they have no 5.1 twin yet.

## 3. The shape of the city

*Proposed*, from the brief, for the owner to cut down. The polygon is 400 km across: nothing is drawn at that scale as a city. The city is a
**density field** read from the mask, and a page draws the part of it in reach.

**Density.** Two sets of centres, each a peak of the field: the **marked settlements** (Babel, Necropolis, Dorado, Blade), where buildings stand
more intact, and the **seven basins**, which were major centres and are now glass. Between and round them the city thins from core to
suburb to the planned farmland, and past the farmland to the lowland forest. The lake's foundations are the drowned part of the same city.

**The scale, measured on the model** (2026-11-03, the 5.1 heights and water in the polygon; the script is in this turn's scratchpad, its numbers
here). The polygon is 123,900 km². The lake is **18,600 km²** (px 400-489 by 883-1035: 180 by 300 km, a Lake Ontario). The land climbs from the
shore to the walls in bands, and the bands are the city's zones; the brief's Mega-City One (800 million in the 2012 film) fits them:

| Band | Height | Land | Median distance from the shore | *Proposed* use | People, at the density named |
|---|---|---|---|---|---|
| the floor | under 100 m | 3,600 km² (plus the drowned foundations) | under 10 km | **the core**: the skyscrapers, the civic centre; Babel and Necropolis stand 4 km from the shore; every basin is on it | 40,000 a km² (megablocks): about 150 M |
| the shelf | 100-300 m | about 9,000 km² | 10-20 km | **residential, service and industrial** rings; the subway's reach | 15,000 a km²: about 130 M |
| the terraces | 300-600 m | about 15,000 km² | 20-40 km | **parks, garden suburbs and the first Soleri terraces** on the slope | 2,000 a km²: about 30 M |
| the belt | 600-1,200 m | about 50,000 km² | 40-100 km | **the planned farmland**: Soleri pods and hub towns every 5-10 km, aqueducts and pylon lines between; Blade stands in it (1,229 m, 68 km from the shore) | 200 a km²: about 10 M |
| the walls | over 1,200 m and the Outer Wall's slump | about 28,000 km² | 100 km and more | **forest**, with the lines running through it to Span and the Inner Wall tunnel, dishes on the ridges | |

Under it, 87% of the floor and shelf is SW lowlands and 11% NW; the belt is 42% SW, 13% NW and 44% neither (the slump). Two readings were
offered: **A**, the whole polygon as the city graded by height (the table as it stands); **B**, the city kept to the floor and shelf (about 12,600 km²),
the terraces as the farmland and the belt as forest, a quarter the people and half the built ground.

**The owner's decision (2026-11-03): B first, and measure what it costs the GPU; A stays open if B is cheap enough.** So the first stations are built
to B: the core on the floor, the residential, service and industrial rings on the shelf to 300 m, the Soleri farmland on the terraces to 600 m, and the
lowland forest from there, with the lines running up through it. Either way the feral forest is everywhere inside through the parks and the farmland
gone wild, and the brief's rule holds on the walls through the lines.

**Dorado is the drowned city** (the owner, 2026-11-03): it stands in the lake on Round 3 (px 483,964, -4 m, under water) and stays there, the brief's
submerged foundations made a place: a ruin seen from the water, its upper storeys and crowns above the surface where they still stand, dived into
below.

**Names in the code are numbers.** The settlements' names may change, so records, fields and fragments refer to them by index, never by name
(the owner, 2026-11-03): `city1` Babel (456,908), `city2` Necropolis (406,944), `city3` Dorado (483,964, drowned), `city4` Blade (451,1022), and, added by
the owner's settlement list of 2026-11-04, `city5` **Wheel** (406,886, the ruined Wheel arcology: on the floor at 62 m, 7 km from the shore, on a
water cell of the model, so it stands in or beside a pond of its own, 44 km from `basin4`) and `city6` **Thera** (526,955, a ruin at 1,653 m on the
eastern rampart, 77 km from the shore, on the cascade stair toward Span: outside B's bands, in the forest like Blade); and, by the same rule,
`basin1`..`basin7` in the order of section 2's table (the model's `anc_blast_specs` order). A name lives in one place, a table in the valley's data
fragment, and nowhere else. Veil (448,838, an outpost at 3,393 m) is on the northern wall outside the polygon, the valley's northern gate from
Carcosa's side.

**Zones** (one field, `zone`, with the five kinds below; the kits read it where they place):

| Zone | What stands there | Source of buildings |
|---|---|---|
| **core** | the skyscrapers, 10-15% to full height, the rest stumps, skeletons, rubble (`PLAN-ANOMALIES.md` 13) | `kits/metropolis` (16 designs, 9 Ancients-kit buildings), `kits/ancients` |
| **residential** | midrises in rings and bars round courts, the Terrace, the Long Curve, the Pods; water towers; schools | `kits/metropolis` midrises |
| **service** | the civic slabs (the Ledger), transit halls (the Cupola), markets, hospitals, the subway stations | `kits/metropolis`, `kits/ancients` |
| **industrial** | tanks, pipe racks, the Organ's bronze pipes, cooling towers, gantries, the dish arrays of the references, rail yards | **new**: an industrial family in `kits/metropolis` or a target of `kits/ancients` |
| **park / garden** | the ruined parks: lakes gone to marsh, pavilions, the Terrarium's sphere, follies, avenues of a planted species gone feral | the two lowland kits' flora at 1.3-2 x, the Terrarium, the Arcades |
| **farmland** (the outskirts) | **Soleri's planned developments**: hexagonal and terraced growing pods round a civic hub (reference *landscape* 8), aqueducts, pump houses, the crop rows gone to thicket | **new families in `kits/metropolis`** (the owner, 2026-11-04), as is the industrial family: farm pods and terraces, with shells, impostors and ruin states by the towers' machinery; `kits/crops` for what grew there (`CROPS.forBiome` on the Cfa/Af climate) |

**Lines.** The cheapest way to keep a structure in every view is long linear infrastructure, which costs little and spans kilometres:
**transit viaducts** with their guideway (the reference's yellow train), **pylon lines**, **canal aqueducts**, the **causeways**, and the
subway's ventilation towers and station heads on a grid. These are instanced records, drawn to the far field, and are what the eye catches
between towers. *Proposed*: every station page lays at least one line across its view.

**Underneath.** The subway network: its stations are `kits/interiors` rooms under the service zone's heads, its tunnels the home of mutants and
of stranger things, and **the House** (`PLAN-ANOMALIES.md` 5, "Space") lives naturally in it, because a tunnel's far door can be any door.
The Inner Wall route comes up here. Depth is where the valley goes when the page's ground cannot: the lower levels are outside the world's
coordinates.

**States of a building.** Every placed building is a record in `core/tags` with a ruin state (the test bed's seven: intact, gutted, crown gone,
broken, stump, skeleton, fallen) and, *proposed*, a **stability** (sound, creaking, ready to fall): a creaking building has a tell (dust from the
joints on `core/atmos`, a groan on `core/audio`) and the player who climbs it or fires inside it brings it down; a game rule later, a record
and a tell now. The intact few are the ones to loot or squat in, and they stand nearer the marked settlements.

## 4. The scars

- **The glass.** The basins' floors and rims read as melt glass: the `glass` layer of the model and `kits/resources/ROCK-PROPOSAL.md` row 9
  (vitrified ground: trinitite slag, salvage, a hazard tag), a `KGROUND` layer of its own (dark, glossy, cracked into plates; the owner's
  texture sets, or a prompt in `core/materials/PROMPTS-NEEDED.md` if none fits). Nothing grows on glass.
- **Dead ground** (`scar` field, 0-1): where life will never grow again. Not only the basins: *proposed*, the fallout lobes downwind of each
  basin (the prevailing wind off the rain wall), the industrial zone's spill grounds and the toxic pools. The lowland kits' placement is
  masked out here; the ground is bare, bleached or black, with the Cut's vocabulary where a scar is the eigenweapon's: combed, clean-bitten.
- **Distorted terrain.** Within a basin's own station, slabs and bowls (`PLAN-ANOMALIES.md` 5, "The Bend", "The Broken Country"). Outside a
  station's own ground, the world's one height per point stands.
- **The wrongness in the flora** (next section) is a scar too: where the undertones go purple, something is leaking.

## 5. Life

**Flora: the two lowland kits, read in place and made feral.** Both kits' species, trees, floor and build fragments are read in place as the
Cut reads nwlowlands (`biomes/cut/build.py` l.78-91, `src/46-biome-cut-warp.js`): nothing of the kits is copied, and the overlay wraps
their placement. The valley adds one wrapper, *proposed* `AV.feralKit`, on the Cut's `warpKit` pattern:

- **Scale** 1.3-2 x by a field (`feral`, 0-1), with the biggest in the park zone and the farmland, where the planting was richest and the
  soil the deepest; the swlowlands' sprawl oak and pillar fig and nwlowlands' kauri and tower ash at the top of the range.
- **Species allow lists per zone**: a park's avenue is one species in a row gone feral; a farm pod is its crop's bucket run wild
  (`CROPS.pick`); the core's streets take the cracking-pavement species (grass tree, banksia, manzanita, rattlepod, the bamboos).
- **Tint** (the owner agreed, 2026-11-04): red-purple and blue-purple undertones with the green, as a `KHOOK` layer on the read-in kits' leaf and
  frond materials (a hue rotation toward purple by the `taint` field and a per-instance seed, strongest on the undersides and the new growth), so
  that no species is copied or re-authored, and the tint fades to the kits' own greens at the valley's edge. The kits' species keep their keys and
  indices, as every reader of them does (`HANDOFF-REBUILD.md` l.410). `NWLOW_LOOK` is set before fragment 50 so nwlowlands draws its new look.
- **Mutant plants** (the owner, 2026-11-04: yes, beside the layer): a short list of the valley's own, in the Cut's grammar of wrongness (a tree
  whose two halves are different ages, a fig that grew round and through a tower, a bloom that is an eye of the *extraplanar* folder's kind, a
  thicket that grows toward the nearest machine), each a species of `biomes/ancientsvalley` tagged `mutant`, densest round `city4`.
- **Overgrowth** on the buildings: vines and epiphytes on the ruin states' torn edges, trees rooted on the stumps (reference *landscape* 23), the
  rubble mounds (`KRUBBLE`) seeded as ground.

**Fauna.** Neither lowland kit has any today (`KNOWN_ISSUES.md` of both). The valley takes `kits/fauna`'s `wild` lowland rows for the feral
animals the mutants hunt, and adds **mutant variants**: the same builders with extra joints, fused parts, eye clusters, in the *mutants*
folder's key. Robots and extraplanars are not fauna (below).

## 6. The people and the things

All *proposed* until the owner settles them; the lore is in LORE.md 4 (l.149), 6.19 (l.611-698) and 6.20.

- **Mutants (the ghouls).** LORE l.912: mutants, aka ghouls, of Korona and the Valley; some of the Valley's were True Heirs (l.629). Human stock on
  `core/charactermodels` with body mods (the non-human spike's precedent: tails, heads; new mods for the *mutants* folder's fused mouths,
  starfish heads, extra joints, raw grafts), a few in rags with a gun. Savage, in bands, hunting the feral animals; in the subways by day.
  Camps on `core/camp` when the bands are built.
- **The Cyberliches** (the owner's name, settled 2026-11-04; "cyberfreaks" in the brief). Distant cousins of the Yusar (the cybernetics tribe of Carcosa
  and Henge, LORE l.694; their speech l.667-674). Former Ancients or their near descendants, kept alive lich-like by their technology, having lost
  something of their humanity for it. Few. **Their major haunt is Wheel (`city5`)**, among the machines. The `core/charactermodels` cybernetic arm
  mods are the tribe's; these take them further: metal below the neck, cables for a spine, a cloak of arms. Cool, calculating, self-preserving;
  they bargain and may not keep the bargain. *Cyberliches* is what others call them; a name of their own in the Yusar's way of making words
  (LORE l.668-673: *the Unleft*, *the Stayed*) can come with their speech.
- **Feral robots.** Three behaviours on the same chassis families, so the far view cannot tell them apart: **keepers** (a thousand-year routine:
  a sweeper, a crane that loads nothing, a tram that runs), **hunters** (attack on sight: the Stalkers of `kits/mechs`, `st_harpooner`,
  `st_blade`, are the model of the kind), and **feigners** (docile until the moment). *Proposed*: the valley's own robots are a kit file on
  `kits/mechs` (the *robo* folder: the stilt tripod, the shrouded walker in a coat of tubes, the hunched trooper), and the Ancients kit's
  machines where they already exist. Eternian influence through the Call (LORE l.623-628) is a game system: the biome gives the robots a
  `calls` flag and a tell, nothing more.
- **Extraplanar entities** (settled 2026-11-04: a kit of their own, both kinds). New to the repo. The folder: stilted walkers, haloed hooded
  figures, voids with eyes, a sun-headed giant, geometric solids with their own weather. `kits/extraplanar`, because they are neither fauna nor
  characters: the **hunters** on the fauna kit's gaits with the `centaur` and stilt builders, and the **phenomena** (a void that drifts, a solid
  that hums, a haloed presence) as anomaly records. Where they come through: **portals**, an anomaly kind (`PLAN-ANOMALIES.md` 4), thickest at
  `city3`. Their far-tier silhouettes are shared with the mutants' and the robots' (section 9). *Built 2026-11-09* (`kits/extraplanar`, the session
  valley-extraplanar: four hunters on the mechs machinery, the phenomena and portals as records, the shared silhouette set; `README.md`, `API.md`)
  and **on station 0 the same day** (`75-host-extraplanar.js`, the bundle `39x`): three hunters on avenue-block rounds like the keepers (the Stilter
  toward the lake to the south, the Haloed over the drowned inlet, the Crawler deep in the wild half; the tell, then the blow, at the corners; R
  rides with them), the three phenomena where the themes table puts them (the void over the water of the inlet, the solid humming in a plaza of
  the foul half, the presence in the park gone feral; their weather on the page's core/atmos, the solid's tint in the clouds' mood), three
  drowned-hall portals on the shore under the towers with the lake's line across the arch, each leading to `city3`, and a tear standing alone on
  the dead lobe. Not yet: a dormant pose (a hunter is awake or absent), the robots' and mutants' far tiers on the shared cards, a hit test for the
  gaze (the kit's `KNOWN_ISSUES.md`).
- **The Lizardmen** (settled 2026-11-04). The war loosed them **here**: they came through in the Valley and crossed the Outer Wall to the Rift
  floor, where LORE 6.20 has them now. A few remnants stay in the Valley, and Thera's stair (`city6`) is the way they went. LORE 6.20 gets a
  line to say so when the valley's lore is written up.
- **Visitors:** salvagers under the State's licence (LORE l.681), Dalab's patrols from Blade and Span, the Yusar from Carcosa, the rare bandit.

## 7. Fields (from the first plan, 2026-10-29, revised)

The overlay writes fields on the terrain grid (`WORLD.landHook`), read by the kits beneath and by its own kits:

| Field | Range | Meaning | What it drives |
|---|---|---|---|
| `zone` | kind | core, residential, service, industrial, park, farmland | which kit places, the street grid, the lines |
| `ruin` | 0-1 | nearness and mass of Ancient superstructure | decking, bulkheads, rebar ribs, rubble on the ground |
| `machine` | 0-1 | density of derelict machines and conduits | spark hazards, turret chassis, servo hums, the robots' keepers |
| `toxic` | 0-1 | chemical runoff in the low ground | sludge pools, yellow-green foam, haze; `KHAZ` acid and gas |
| `scar` | 0-1 | dead ground | no placement, bleached or glassed ground |
| `feral` | 0-1 | depth of the old planting | the scale of the read-in flora, the overgrowth |
| `taint` | 0-1 | the leak of what the weapons did | the purple undertones, the mutant species, the anomalies' rims |
| `lake` | 0-1 | nearness to the 17.4 m shore | silt, wave-washed rubble, stranded barges, the drowned foundations |
| `canyon` | 0-1 | depth of the defiles off the rampart | wind, echo, shadow |

## 8. Sound (from the first plan, 2026-10-29)

For `core/audio`; the tag is `ancients-valley`. Beds: a 40 Hz carrier from subterranean coils and a flanged electrical hum near generator
halls; the lake shore's wash; slot-canyon wind off the Outer Wall; the Kaskejt's distant roar. Timed calls: a pneumatic relief valve
every 7-14 s, wind singing in hollow pipes every 20-35 s (the "war horn"), a mutant's cry every 18-30 s. Crossfades: swhighlands down the
cascade stairs, wouterwall to the west; the music from highland horns to dissonant flutes and heartbeat drums. **Added by the brief:** every
hazard's cue is in this mix as much as on screen: the geiger click of radiation, a stilled zone's silence, a fast zone's pitch, a portal's
pressure, a creaking building's groan. The first plan's picks from the sound library, kept for the mix: beds
`adobe-drone-production-element-imaging-alien-bed-01` (the coils), `adobe-drone-production-element-imaging-flange-low-tones-electrical-hum-01`
(the generator halls), `adobe-ambience-ocean-shore-01` (the shore), `adobe-ambience-nature-field-windy-02` (the slot canyons),
`mixkit-calm-thunderstorm-jungle-2415` (the Kaskejt); calls `pixabay-pneumatic-screwdriver-6844` / `mixkit-air-zoom-vacuum-2608` (the valve),
`sfxmint-war-horn-02` (the pipes), `adobe-horror-beast-screech-01` (the mutant).

## 9. The hazards, in brief

`PLAN-ANOMALIES.md` is the detail. The brief adds to it:

- **Radiation**, the run-of-the-mill hazard: a `hazardKinds` row `rad` on `KHAZ` like heat or gas. **Its rules (the owner, 2026-11-04):** a
  slow dose with a long soak. Past a high threshold it is **fatal at once**; below that it **sickens**, and past a lower threshold it **mutates**, with
  a bad mutation more likely than a useful one (a body mod from the mutants' list). If it did not kill, the load **decreases slowly over time**, faster
  or slower with certain medications. **Dalab has a genemod** that raises the tolerable dose, and **shielding** slows the intake considerably. The
  record holds `dose`, `soak`, the two thresholds and a `shield` factor; the game rules (genemod, medications) read them. The tell: a geiger click
  on the audio (the Ancients left counters about) and the dead-ground shimmer; no nav avoid at the rim, so a player can walk in.
- **Portals**, an anomaly kind: a door to elsewhere, some on Krator (a teleport to another station's coordinates) and some not (an interior with
  no world coordinates, as the House's depth). Where the extraplanars come through.
- **Space distorted** as a hazard to life, not only a look: the Bend's and the Broken Country's cores carry a `taint` dose.
- **One theme per place.** The basins keep their seven. **The settlements' themes (the owner, 2026-11-04):**

  | City | Theme | What it means on the page |
  |---|---|---|
  | `city1` Babel | **the House** | the space anomaly: interiors larger than their shells, loops, rewiring, the depth below the subway |
  | `city2` Necropolis | **radiation** | the `rad` hazard at its strongest; dead ground; the geiger tell; the richest unspoiled salvage because nothing lives to take it |
  | `city3` Dorado (drowned) | **extraplanar** | where the entities come through: portals in the drowned halls, phenomena over the water, the lake's steam as their weather |
  | `city4` Blade | **mutagenic** | the mutants' country: the `taint` dose that changes living things; the most wrongly grown flora; Dalab's outpost holds its edge |
  | `city5` Wheel | **machines**, and the augmented's major haunt | the feral robots' keepers at their routines, hunters and feigners among them; the augmented live here among the machines they understand |
  | `city6` Thera | **temporal** | time anomalies on the stair toward Span: stilled and fast pockets, a place a traveller loses days in |

  A player learns a place by its weapon; a theme is the dominant hazard, not the only one.
- **Hard to tell apart** (the owner, 2026-11-04): in some places a mutated creature, an extraplanar entity and a machine cannot be told from one another
  at a distance, and sometimes not up close. This is a design rule for the three kits: **shared silhouettes and shared tells** (a stilted walker may be
  a robot tripod, a stilt-legged entity or a mutant on grafted legs; a hum may be a servo, a presence or a growl), with the difference shown late, by
  behaviour. The far tiers (impostors, far instances) draw the three from one silhouette set on purpose.
- **Normal ground between**: the field's troughs, where the natives are the danger and the page costs nothing for anomalies (rule 5 of
  `PLAN-ANOMALIES.md` 2).

## 10. How it is built

- **A biome overlay on `core/biome`, `core/host`, `core/atmos`, `core/water`, `core/terrain`, `core/tags`, `core/rand`**, with stations as
  the lowland kits have them (`stations/<name>/`, `--station`). Its `build.py` reads **nwlowlands** and **swlowlands** in place as the Cut
  reads nwlowlands and the dam basins read the Ancient Port kit: fragments by path into `48x` slots, their texture packs as sidecars
  (ground, tower and jetty families excluded), nothing copied. `kits/metropolis` is read the same way once it is on `claude/biome-rebuild`;
  a build cannot read a fragment from another branch, so station 0 either waits for that merge or stands on `kits/ancients` alone.
- **The mask** comes from the 5.1 model: the valley polygon, the `glass` layer and the basin specs; `extract_region.py` gets an `OVERLAYS` row
  `"ancient's valley": 'ancientsvalley'` (it is a scale-model tool: the owner's or Gemini's ground, asked first). The fields of section 7 are
  computed on `core/mask` (`KMASK.canvas`, never `getImageData`) from the mask, the settlements' px and the zone plan.
- **The warp:** `07-core-kwarp.js` in the build; `KWARP.install` reaches every material in the scene, the read-in kits' included
  (`core/shader/README.md`, "The warp": 60-71 programs bend on each of the three). Only the Bend's station pays for it.
- **The ground** is the overlay's own stage: `KGROUND` layers for the glass, the dead ground, the pavement and the lowland soils; the lowland
  kits' `terrainH` is not taken (their 45 fragments stay out), the model's heights are. swlowlands' stage reads a `STATION_STAGE` object; the
  overlay provides one.
- **The flora** is the kits', wrapped (section 5); one `BIO.bake()`.
- **The towers** are the test bed's tiers (`PLAN-ANOMALIES.md` 13; measured: 10 heroes and 109 shells on the worst street at 0.39 M triangles
  and 2.9 ms on the Arc 140T, 0.94 M with the rubble). The valley's budget problem is that the lowland kits already draw 7.49 M at their worst
  view against a 7.5 M ceiling: **the city and the flora cannot both be at full density.** The streets, plazas and dead ground take the
  flora out; the park zone takes the towers out; `ATMOS.heightFog` and the steam take everything past 2-3 km. Measured on the Arc 140T,
  named, per station, before the owner's eye.
- **Streets and lots** go on `core/city` where it fits (its README, "Porting a settlement"); the zone field and the lines are plain records
  first.
- **Godot:** records, fields, zones and ruin states port as data; the shells, impostors and the warp need twins (`PLAN-ANOMALIES.md` 9).

## 11. Core adoption

The table in `PLAN-ANOMALIES.md` 8 and 13 stands (`KANOM` new, `KSHELL` new from the test bed, `KHAZ`, `KWALK`, `KHOOK`, `KCLOCK`,
`KFAR`, `kits/interiors`, `core/city`). The brief adds: `core/mask` for the fields, `kits/fauna` and `core/camp` for the mutants' bands,
`core/charactermodels` for the mutants and the augmented, `kits/mechs` for the robots, `kits/crops` for the farmland. `tools/check_core_use.py`
needs `anomaly` in `ALL_MODULES` and a `NOT_APPLICABLE` reason wherever the overlay owns no ground (the dam basins are the precedent).

**Station 0 as built (2026-11-04; `build.py`, `README.md`):**

| Module | Takes | For |
|---|---|---|
| `core/biome` | `BIO.init`, `BIO.kit` / `kitEnd` (the two lowlands and `metro`), `BIO.impostor*`, `BIO.lodFade`, `BIO.bake` | the forest, the towers' impostors, the heroes' dither |
| `core/host` | `khost.SHELL` + the polygon tool | the page shell, `KHOST.take` |
| `core/rand` | `KRAND.hash`, `unit`, `fbm` | every draw of the valley's own (the plan, the fields, the relief); the kits keep their streams |
| `core/tags` | `BIO.init({tags:'ancientsvalley'})`; towers and lines as records | records before anything is drawn |
| `core/space` | `KSPACE` | the plinths in reach of a point (the ground, the masks, the views) |
| `core/terrain` | `KGROUND` (seven layers), `KRUBBLE` (the ruins' heaps, through the metropolis kit; the lobbies' heaps and rubble ramps, `76`), `KRELIEF` listed for its noise | the ground, the rubble |
| `core/water` | `WATER.open` x 2 | the lake and the inlets, the far lake |
| `core/atmos` | the shared sky with the model's ridges, `bindHost`, `bindWeather`, `skylight`, `cloudShade` | the air |
| `core/shader` | `KHOOK.add` (the taint's tint), `KGROUND.hook` | the shader layers; the warp (`KWARP`) waits for the Bend |
| `core/shadow` | `KSHADOW.attach` behind `?shadow=1` | off by default (the owner) |
| `core/walk` | `KWALK` strips, polys, blocks and zones (`41c` `AV.lobbyWalk`); the take's `walk` is `AVL.walk` (`76`) | the lobbies' approaches, the open towers' storeys and stairs, the rubble at the blocked doors and stairs, the fallen towers' shafts, the weak floors (section 15) |
| `core/materials` | `KMAT` packs: the valley's, the two lowlands', the metropolis's (sidecars) | the library |
| `core/export` | `BIO.export` | the export profile |
| `kits/metropolis` | records, plans, facades, shells, designs, heroes, rubble, floors, ruins, the shell bake and draw; not its stage, land, sky, take, interiors, cut-away or the Ancients builders | the towers |
| `kits/interiors`, `kits/ancients-interiors` | bundled | the plans the heroes' windows come from |
| `biomes/swlowlands`, `biomes/nwlowlands` | 50/55/60/70 in place, wrapped by `AV.feralKit` | the forest |
| `kits/mechs` | bundled (`39k`, culture `ancient`) | the keepers (`72`) |
| `kits/extraplanar` | bundled (`39x`: `KratorExtraplanar`, the mechs machinery in its own closure) | the hunters, the phenomena and the portals (`75`), their weather (`89x`) |

**The Terraces (2026-11-10)** take the same modules through the shared fragments, and: `core/rand` and `core/space` in its plan (`41d`, [G data]:
every placement a hash of (seed, index, salt), the pads, roads and fields on `KSPACE`); `kits/crops` read in place (`10`, `20`, `22`, `40` as `38a`-`38d`:
`AV.farmCrops` on `CROPS.forBiome('swlowlands')`) with its pack as a sidecar; `core/biome` for the thicket (a kit of its own, `farmcrops`, its cards cut
by `BIO.geo.cells`, wrapped by `AV.feralKit`); `kits/metropolis`'s farm families (`46f`, `54f`) through the city stage's tiers.

Not taken yet: `core/anomaly` (none on station 0), `core/hazard`, `core/clock` beyond the host's, `core/city` (the plan is a lattice on
records until the streets want lots), `core/mask` (every field is a function), `core/furnish`, `core/hamlet`, `core/camp`, `core/charactermodels`,
`kits/fauna`, `kits/crops`.

## 12. Order of work

1. **Plans settled** (this file, the questions below). `extract_region.py`'s row, the metropolis merge and `core/anomaly` can start in
   parallel: none waits on another.
2. **Station 0, the Overlook: no anomaly.** The look of the valley on a normal day: the city's tiers from a residential edge toward a core, a
   park district gone feral in purple-green, a dead lobe, a viaduct line across the view, the lake's steam, a keeper robot at its routine.
   **This is the test of the brief: the hand of man in every view, and the feel. Stop for the owner's eye.** It also measures the budget split.
   *Built 2026-11-04* (`README.md`, `KNOWN_ISSUES.md`): the city, the forest, the tint, the viaduct, the dead lobe, the lake. *2026-11-08:* the
   steam (banks of mist and plumes on the water, `89u`), the keepers (four kits/mechs walkers on avenue rounds, `72`), the second viaduct across
   the Overlook's view, the land split half wild and half foul (`AV.fields` wild/foul), and the owner's smog (`89v`: the height fog's mist and
   band, the sky's clouds low and turbulent, the air turbid). *2026-11-09:* the transit pass (section 14), the Ancients' keepers (kits/mechs
   culture `ancient`), the wrecks, and the extraplanars from `kits/extraplanar` (`75`: three hunters on rounds, the void over the inlet, the
   solid in a foul plaza, the presence in the park, three drowned-hall portals on the shore and a tear on the dead lobe; section 6). Waiting on
   the owner's eye.
2a. **The Yards: the industrial district, a station of its own** (the owner, 2026-11-10: "we need an industrial district ... these may need
   to be separate stations"; station 0 stays the Overlook as it is). On the shelf (100-300 m), where the plan's industrial ring lies, a
   site on the cargo line inside the subway's reach, upwind of nothing: it is where the foul ground comes from. What stands there: the
   twelve industrial buildings `kits/metropolis` already has and the Overlook never places (`46b`, `46e`: the Vault, the Perforated Stacks,
   the Assembler, the Rig, the Foundry, the Pilotis Works, the Well, the Tank Yard, the Cooling Towers, the Gantry Hall, the Furnace Stacks, the
   Spheres) with their ruin states, shells and impostors; a rail yard on the cargo line (sidings fanning from it, wagons standing and
   overturned from the transit kit's trains, a turntable, loading gantries); and **new** pieces (section 3's table): tank farms in bunds,
   pipe racks between the halls, the dish arrays of the references, chimneys and conveyors. The ground: the spill grounds and toxic pools
   as dead ground (`scar`, section 9), slag heaps, the oily rain over it on most days (`89x`'s mode, here the default), the smog thickest.
   The keepers here are the robots' factory kinds (`kits/mechs` culture `ancient`). Its own stage (`stations/yards/`), site and views.
   *Built 2026-11-10* (`README.md`, "Station 2a"): px 470,921 (a west-east trough on the shelf, 210 m, the line's grade toward Thera and Span),
   the twelve buildings in superblocks round an eight-siding yard with a turntable and gantries, the new pieces as records (`kits/metropolis`
   46f, 57y), the oily rain and the thickest smog, the factory keepers, and three of the owner's new Engines (the same day: "cyclopean machines
   of unclear and mysterious purpose" among the industry; `kits/ancients` targets/engines 8aj, ten of them, the Hive, the Star and the Iris here).
   Waiting on the owner's eye.
2b. **The Terraces: the Soleri farm belt, a station of its own** (the owner, 2026-11-10). On the terraces (300-600 m), past station 0's
   edge: Soleri's planned developments, hexagonal and terraced growing pods round a civic hub town (reference *landscape* 8), aqueducts on
   arches and pump houses, pylon lines, the crop rows and orchards gone to thicket (`kits/crops`, `CROPS.forBiome` on the Cfa/Af climate,
   run wild), the city's skyline below toward the lake. Needs the farm families in `kits/metropolis` first (settled 2026-11-04, section 13
   question 9): the pods, the terrace stacks, the hub's civic buildings, the aqueduct and the pump house, each with ruin states, shells
   and impostors by the towers' machinery. Its own stage (`stations/terraces/`), site and views.
   *Built 2026-11-10* (`README.md`, "The Terraces"; `python3 build.py --station terraces`): the eight farm families in `kits/metropolis` (`46f`,
   `54f`: pod, vault house, growing stack, hub hall, market, water tower, aqueduct module, pump house); the site at **px 455,899** (330 m, Cfa,
   1,694 mm), the south face of the ridge north of city1, the page falling about 180 m to the shelf, city1 and the Overlook's ridge 16-18 km due
   south; the plan as records (`stations/terraces/41d-av-farm.js`, `tests/test-farm.js`): a hub town, the aqueduct on a contour, 36 clusters of
   pods, vault houses and stacks, 33 roads crossing under arches, two pylon lines, about 1,900 parcels of crops and orchards from `kits/crops`
   gone to thicket under the feral wrap, and the city below as a far skyline.
   *The second pass, 2026-11-10* (the owner: "more arrays of the honeycombed growing pods (groups of 12+ pods), the growing pods themselves ought
   to be completely overgrown on top, and the street modeling from the transit kit should be integrated in an overgrown and ruined way"): four
   honeycomb arrays of nineteen pods on a 53 m hex lattice (and the clusters' honeycombs on the same lattice, 176 pods in all); every pod's top
   under broadleaf and fern clumps set on the drawn dome by rays; the roads as the transit kit's network (kerbs, pavements, junctions, dead
   furniture, a riot's war at most) with weeds through the cracks and the wild wood let onto them. Waiting on the owner's eye.
3. `core/anomaly`, then **the Stilled Ground and the Press** (cheap, as `PLAN-ANOMALIES.md` 11 has it), each as a district with its basin.
4. **The House at Babel**, with the subway.
5. The Lake That Falls, the Fast Water, the Bend; radiation and portals as they come.
6. The Broken Country.
7. The people: mutants, the augmented, the robots, the extraplanars, each when its kit exists. *The robots (keepers) and the extraplanars are on
   station 0 since 2026-11-09 (section 6).*
8. Streaming into the open world, after the stations have shown what the valley's language is (the owner, 2026-11-04: stations first).

## 13. Open questions for the owner

1. ~~A name for the augmented~~ **Settled 2026-11-04:** the Cyberliches (section 6).
2. ~~The Lizardmen's origin~~ **Settled 2026-11-04:** loosed here, crossed to the Rift; remnants stay (section 6).
3. ~~The scale of the city~~ **Settled 2026-11-03:** B first (the floor and shelf), measured on the GPU before A is considered; Dorado is the
   drowned city; the code refers to the settlements and basins by number (section 3).
4. **The centres.** `city1`-`city6` as the intact centres (`city3` drowned); the seven basins as the former ones. Carcosa is just outside
   the polygon and the Yusar's: is it the valley's northern gate or another place? Under B, Blade (`city4`, 1,229 m) and Thera (`city6`,
   1,653 m) stand outside the city's bands, in the forest: outposts on their own, which suits Dalab's story of Blade.
5. ~~One hazard theme per settlement~~ **Settled 2026-11-04:** yes; the table in section 9.
6. ~~Radiation's rules~~ **Settled 2026-11-04:** section 9.
7. ~~The extraplanars~~ **Settled 2026-11-04:** a kit of their own, hunters and phenomena (section 6). Still open: which of the folder's
   figures to build first.
8. ~~The flora's tint~~ **Settled 2026-11-04:** the shader layer, and a short list of mutant species beside it (section 5).
9. ~~Where the farm pods and the industrial family live~~ **Settled 2026-11-04:** new families in `kits/metropolis` (section 3).
10. ~~Stations first or streaming~~ **Settled 2026-11-04:** stations first (section 12).
11. ~~The questions of `PLAN-ANOMALIES.md` 12~~ **Settled 2026-11-04:** the eigenweapon's family is the cause; the Press is fatal; time owed is
    capped at a day; 10-15% of towers stand; the Press gets its own `crushing` row.
12. ~~The fields' names~~ **Settled 2026-11-04:** `taint` and `scar`.

**Every question of the plan is settled as of 2026-11-04**, except Carcosa's part (4) and which extraplanar figures come first (7). Station 0 can start.

## 14. The transit pass (the owner, 2026-11-09): the real street grid, the highway, the lines, the war toward the lake

The owner's words: "the transit kit has roads, streets, trains and subways basically ready to go. let's add this in, building a real street grid
with these streets, placing buildings in relation to it, then applying a ton of damage to it. Wrecked vehicles and signs of violence (barricades,
military posts, wrecked tanks and copters) will increase as we approach the lake, as will the height of the average building (nice lake front
property values....) there will be an elevated highway that crosses the map and interfaces appropriately with the street grid, with at least 3
on/off ramp placements. There will be a subway line build with subway stations leading to short stretched of tunnel, though most is blocked off.
A cargo train line will also cross the map. if we need any special functionality for these new intersections, message the transit kit session."

The kit is `kits/ancient-transit` (branch `claude/ancient-transit-2600a6`; its hand-over note `ancient-transit.md` in the shared notes folder,
its `API.md`): road networks as node-and-segment graphs with kerb-line junctions, graded roads that cut and fill, the war along a street (riot to
bombed: scorch, craters, barricades of wrecked vehicles, military positions), the highway with ramps and ruin states, rail at grade with level
crossings and elevated with stations, the subway with stations, entrances and sinkholes, trains standing, derailed or fallen, the street
furniture (replaces `AV_LAMPS`), and depressions the host adds to its own ground (`craterH`, `sinkholeH`, `lineH`).

How the valley takes it (the plan; the work follows the overgrowth commit):
- **The grid stays the lattice** (pitch 165 m, 17 degrees, an avenue every third line): every lattice line inside the page becomes a network def
  (`avenue` 26 m, `road` 11 m) from edge to edge, so the kit's junctions fall at the lattice's crossings and the towers, already kept off the lines,
  stand in relation to real streets with pavements and corners. The roadbed sinking in `ground()` goes; the kit's `lineH` and each road's `levelAt`
  grade the surface instead, and the ground mesh (47) refines along the lines and the carvings as the kit's demo does.
- **Toward the lake** (`lakeK(x,z)` 0..1 from the distance to the water): the family mix leans tall (the Spindle, the Ledger, the Organ, the Reed)
  near the shore in `AV.plan`; the war's `damage(s)` climbs from a riot inland to bombed at the shore, with the military positions, the blockades
  and the tanks and helicopters only in the lakeward half; the strewn wrecks (the wrecks session's records) follow the same gradient.
- **The highway** replaces the second viaduct's boxes: waypoints across the page crossing the Overlook's sight 1.1 km out, at least three ramps
  landing on avenues (the ramp's road at grade joining the network at a junction: special functionality if the kit lacks it, asked of the transit
  session), `cull` against the plinths, the ruin shares by the scar and the lake, overgrowth by the feral field with the kits' species on
  `span.growth.plants`.
- **The lines**: the north viaduct becomes the elevated passenger line with two stations and a fallen train; a cargo line at grade crosses the page
  with level crossings at every street it meets and a derailed freight train; the subway under one avenue with three stations, their entrances on
  the pavements, short open stretches of tunnel between collapsed and silted sections (most of it blocked), sinkholes over the falls.
- **The checks** (`99`): junctions at the lattice's crossings and no tower on a road; the highway's ramps (three or more) and its spans clear of
  the streets; the cargo line's crossings; the subway's stations; the war's damage and the wrecks rising toward the lake (a correlation, with its
  negative). The GPU verify on every view; the budgets (`BUDGETS.json`: 15 M, 900 calls) hold or are raised with a why.

**Built (2026-11-09, `46z-host-stage.js` the records, `74-host-transit.js` the drawing, `99` the checks):** the grid (64 streets on the lattice's
lines, avenues and roads, 824 cross junctions with kerb corners and crosswalks), the war on every street with its damage `.1 + .85 lakeK^1.3`
(the lakeward streets' mean damage 0.57 against 0.31 inland), the military positions and the blockades on the lakeward avenues, the highway on
the second viaduct's line with three ramps (off, on, off) at avenue crossings, the elevated passenger line on the north viaduct (two stations, a
fallen train), the cargo line at grade (37 crossings, a derailed train), the subway under the avenue nearest v = 900 (three stations, 44
sinkholes, two metro trains), the ground carved by the kit's `craterH`, `sinkholeH` and `lineH`. The draw: every road's surface in one builder
finished in 1.5 km chunks, the kit's own draws chunked the same (the kit's 400 m chunks a street were 3,000 draw calls here), the furniture and
the war bucketed into 400 m cells and drawn as the eye comes within 750 m. The triangle budget is 20 M (`BUDGETS.json`), the call ceiling 900.
The ramps' feet are T junctions of the grid (`KTRANSIT.joinRamps`, the transit session's answer the same day). The family mix leans tall toward
the lake (`AV.plan` lakeK/tall/short) and the furniture has a far tier of posts. The towers stand on the kerb lines (`AV.kerbPlace`, 41): each
slides off its node to front a street, its plinth 3 m behind the pavement, an avenue three times as often as a road, a third of them on corners.

## 15. Lobbies and climbs (the owner, 2026-11-09): a fraction of the towers enterable and climbable, the rest blocked by rubble

The owner's words: "i'd like at least a fraction of the buildings here to be actually enterable and climbable; we can strategically block entrance
or ascent to most with well-placed rubble"; "no proper ramp to get into lobby"; and later the same day, "some of these may be more climbable
stumps" and "the more wrecked ones might have a collapsing floor hazard".

**What was wrong.** A tower's plinth is a level pad at the raw ground's height under its centre (`AV.plan`), 3 m behind the pavement; the street is
graded on its own (`KTRANSIT.road`). Measured on the page (552 kerb towers): the plinth stands within 1 m of the street at 40%, within 3 m at 85%,
up to 7 m above or 6 m below it at the tail, a handful further. Between them the ground is a bank of the plinth's 14 m ease cut by the road's
grading: no steps, no ramp. And nothing on the page stands a walker on anything but the ground (`core/walk` was listed, empty): the heroes' storeys
are open frames once ruined (`MP.ruinDesign` cuts the glass and the floors), the planned families' storeys are drawn only on the kit's own page.

**The records first (`41c-av-lobbies.js`, `[G data]`, node-tested).** For every tower that fronts a street (`T.kerb`) and has not fallen:
- **A door** on its skin facing the street: a family with portals (the Spindle's three, between the fins; the Cupola's four) takes the portal
  nearest the street, the rest the middle of the frontage. Its point, its facing, its width.
- **An approach** from the pavement's back edge straight to the door's line on the plinth: the pavement's level (`Rd.levelAt` plus the kerb) at
  its foot, the plinth's (`T.y`) at its head; **steps** (risers of 0.17 m, a slope of 0.55) when the rise is over 0.6 m, else a **ramp**; its run
  as long as the rise wants, eating into the pavement and then the plinth's 6 m rim (a sunk stair) before it reaches the street; 6 m wide at an
  open tower, 4 m at a blocked one. A rise over 6.3 m has no room for a flight: its approach is a **rubble ramp** (a long KRUBBLE heap from the
  pavement to the plinth's edge, the steps fallen), and such a tower is never chosen open. The stage folds every approach into its ground
  (`46z` `ground()`: the plane of the flight across its width, blended over 1.5 m at its sides), so the bank is cut or filled where the steps are
  and the drawn steps sit on the ground mesh.
- **Open or blocked** by `KRAND.hash(seed, tower index, salt)`, never by order. Eligible to open: not fallen, a rise of 6.3 m or less, a family
  with storeys and a stair shaft (all sixteen have), and a climb of two floors at least (the Stalk's 50 m stem has no stair). Every ruin on the
  page leans a little (`AV.lean`, up to 5 degrees) and the climb's plates are level, so an open tower is set plumb: its record's lean is
  cleared before anything is drawn. The share by state:
  **stumps 30%** (the owner: climbable stumps, five to twelve storeys to a view over the streets), skeletons 15%, broken and crown-gone 10%,
  intact and gutted 8%; and the eligible tower nearest the Overlook's start is always open, so the owner finds one. About one tower in eight of
  the kerb towers opens; the rest are **blocked**: seven in ten **at the door** (a heap of rubble against the skin across the doorway, 3.5 to 4 m
  high, and blocks across the door's line), three in ten **at the stair** (the lobby open, the stair choked by a heap on its landing at the first
  to third storey: a flight or two climbed, then nothing).
- **Cut off** (found building it, 2026-11-10): a door whose flight, plinth path or doorway is crossed by a fallen tower's shaft, by a neighbour's
  doorway rubble (two towers on a corner, doors facing), or by a cutting or sinkhole deeper than 2.5 m in its plinth is never open and is left out
  of the blocked check (its way is shut by something else). A door within 1.6 m of its flight's head may stand past its plinth's edge (the slab
  towers were drawn turned against their plinths until the parent session's -yaw fix); its flight ends at the door and a level path runs 4 m in.
- **Walls** (the second pass, 2026-11-10): every standing tower's ground outline as `KWALK` blocks every 1.5 m (the design heroes' own lobby
  outlines, `userData.walk`; the Spindle's skirt and fins and the Ledger's arcade from their records), open only in the door's corridor of an open
  or stair-blocked tower; a blocked tower is then blocked everywhere, not only at its rubble. A door whose way in its own walls cut (an inner
  lobby ring, known only off the hero) is shut at its door before anything is registered (76). The families of several bodies (`F.towers`: the
  Organ, the Pods, the Crescent) have no climb, and intact towers never open.
- **A climb** for an open tower (`AV.climb(F, state, T)`): the family's storeys (`F.levels`, each `y` and `h`) up to what the ruin leaves:
  intact and gutted to the roof, the rest to the whole skin's top (`MP.ruin`'s cut less its torn depth), at most 70 storeys. On each, **a plate**
  (a disc of 0.8 of the skin's radius at that height, `F.envR` or the Spindle's lathe, from 2 m outside the stair to 26 m; a slab family without
  `envR`, the Ledger, its rectangle less 2.5 m) cut into four pieces round the stair's hole; **a switchback stair** in the family's first stair
  shaft (moved to the axis when the shaft's place leaves it outside the plate): a box 3 m by 7.2 m, two flights of 1.4 m a storey with a landing at
  each end, the run fixed (4.6 m) and the riser the storey's (a 7.2 m lobby is steep). The top storey's plate is the roof, or the ruin's torn
  floor: its outer bands broken off by hash.
- **Weak floors** (the owner's hazard): in an open tower that is broken, crown-gone or a skeleton, one plate piece in about one storey in five,
  away from the stair, never the lobby's or the top two: cracked, sagging and darker. A walker standing on one for half a second brings it
  down: the piece falls and is gone, and the walker drops to the storey below. The stair is never weak, so the route up survives a fall.
- **The route** of each door: the approach, the plinth to the door, and for an open tower the stair's landings and flights to its top plate, as
  points; `AV.walkRoute(W, ground, pts)` walks it with the camera's own rules (`core/host`'s `stand`: a step up of 0.7 m at most, the highest
  floor at or under the feet, a block stops it) against a `KWALK` registry. An open tower's route reaches its top; a blocked one's stops at its
  rubble.

**The modules.** `core/walk` carries the walking: every approach is a `KWALK.strip`, every plate piece and landing a level `KWALK.poly` (tag
`weak` on the weak ones), every flight a `strip`, every heap's surface `KRUBBLE.walkTris` as polys and its doorway or stair as `KWALK.block`s
(axis boxes along the door's line every 0.5 m); the weak floors are also `KWALK.zone`s of kind `collapse` for the Godot export. The take hands
the camera `AVL.walk`, a view of `KWALK` that leaves out the floors that have fallen (`core/walk` has no way to take a floor out, and the
records stay as built). `core/space` (`KSPACE`) finds the doors near the eye. `core/tags`: one record a 400 m cell, `REGISTER`ed before anything is
drawn, its tags counting the cell's doors by fate, its climbs, heaps and weak floors (the wrecks' and street cells' way: a door's pieces are
drawn only near the eye, so a record of its own stands empty in every other view and the probe's occupancy check fails it); the doors themselves
are `STAGE.lobbies`' records, keyed by id. `core/rand` (`KRAND`) for every pick: open or blocked, the blocking's kind and storey, the
weak pieces, the torn bands, the heaps' seeds. `core/terrain`'s `KRUBBLE` for every heap. Nothing is copied into the build.

**The drawing (`76-host-lobbies.js`).** A door's group (its steps or ramp, its heap, and for an open tower its plates and stair) is built when the
eye comes within 420 m, one a frame, in the metropolis kit's concrete and rubble (`MP.mats()`, shared) with vertex tints toward the page's rust;
freed (out of the scene, geometry disposed) at 650 m, as `AVTR.freeCell` frees a street cell. The records and the walk registry stay (a few MB).

**The checks (`99`).** Every kerb tower that stands has a door and an approach, its foot on the pavement's level and its head on the plinth's
(within 0.25 m), its slope under 0.6; the open share between 8% and 25% with stumps the most open; each open tower's route continuous from the
pavement to its top plate, rising at least two storeys (a stump's top within 2 m of its ruin's skin); each blocked tower's route stopped by its
rubble, at the door or on the stair; the weak floors only in broken, crown-gone and skeleton towers, never on the route. Negatives: an open tower
with a heap in its stair (the route check fails), a blocked door with its heap taken away (fails), an approach a metre short of the plinth
(fails), a weak floor in an intact tower (fails).

## 16. The effects for the Yards and the Terraces (the owner, 2026-11-10)

The owner's "work on effects we're gonna need for stations 1 and 2", then "both pairs" (the other pair is `PLAN-ANOMALIES.md` 14). Shared
pieces on `core/atmos/fx/`, each a record first (a pure function fills it, seeded on `core/rand` by its id), drawn after, freed or hidden past
its reach, and shown on `core/atmos/fxdemo/` (`#scene=yards`, `#scene=terraces`). **Built 2026-11-10 on `claude/wizardly-cerf-605ac6`.**
*Merged into the valley's branch on 2026-11-10: only its commit a9b780177 (`core/anomaly`, `fx/89-atmos-fx-localtime.js`, the fx demo page).
The plumes, sparks and arcs, sludge, slag and spills below were uncommitted on that branch then and are not here; no valley page takes any of
them yet.*

| Effect | Where | What |
|---|---|---|
| the plumes | `fx/89-atmos-fx-plumes.js` | `ATMOS.plumes(list)`: a **stack**'s soot, thin and long, bent over downwind and seen for kilometres; a **cooling** tower's white cloud, fat and slow, billowing and evaporating as it rises; a **flare**'s flame at a pipe's mouth; a **vent**'s steam from a broken main. A plume may be intermittent (its duty from its id) |
| sparks and arcs | `fx/89-atmos-fx-sparks.js` | `ATMOS.sparks(list)`: a dead machine's showers on a hashed period, falling and fading; `ATMOS.arcs(list)`: a pylon line's arc between two points, a jagged bolt re-drawn each flash from an integer hash of (id, flash, segment), with its flicker light. Each may register a `trap`-like `shock` hazard |
| toxic pools and spill ground | `fx/89-atmos-fx-sludge.js` | `ATMOS.sludgeMaterial(o)`: a pool's surface (yellow-green foam rafts drifting and joining, an oily sheen in bands, slow bubbles); `ATMOS.spillOn(material, spills)`: a `KHOOK` layer on the ground's material for the spill ground (black oily stains with crusted rims and a bleached fringe, up to 16 records); `ATMOS.sludgeFume(pools)`: the low haze over them. Pools register an `acid` hazard |
| the slag glow | `fx/89-atmos-fx-slag.js` | `ATMOS.slagOn(material, o)`: glowing seams in a heap's dark crust (an integer-hash Voronoi in world space), hottest at the fresh pour, breathing slowly, brighter at night |
| the aqueduct spills | `fx/89-atmos-fx-spill.js` | `ATMOS.spillRec(o)` from an aqueduct's deck line and its break: the curtain's lip, direction, speed and drop (also as `WATER.fall`'s options for a page with `core/water`), drips from the cracks along the span, the spray and the wet stain at the foot; `ATMOS.spill(rec)` draws them on `localFx` and the smoke's `spray` |
| wind over the crop rows | `fx/89-atmos-fx-gustsheen.js` | `ATMOS.gustSheenOn(material)`: the paler band that runs across a field as a gust front bends the stems (the foliage's own `atmGust`, so the sheen and the sway agree); `ATMOS.chaff(fields)`: seed heads and chaff lifted along the front |

**Checked 2026-11-10** (`core/atmos/fxdemo/verify.py --assert`): every effect recorded for the export, the pools' acid and the arcs' shock on core/hazard where they are and nowhere else, the slag glowing at night against its heat turned off, the plumes moving, the crop rows moving with the gust against the gust turned off, both spills landing on the ground over their wet stains. `node core/atmos/fx/test-industry.js` holds the records and the JS twins (and the GLSL KRAND chunk against `KRAND.h3`).

The Yards' smog and oily rain are the Overlook's (`89v`, `89x`) with the Yards' defaults; the stations place these records on their own
ground (the tank farms' pools, the stacks of the twelve industrial buildings, the aqueduct's breaks, the farm pods' crops).
