# clivobredos: the plan (proposal, 2026-11-02)

**The Cliff Lungs of the southern Inner Wall**: living flues, colonies hundreds of rings long, that lie against the
Wall's north-facing scarp from the hyperjungle's cloud sea at its foot to the paramo at its crest, and breathe the jungle's
air up through themselves. The idea in one line: **a cloud that has grown a skin**. A saturated updraught against a sunlit
wall is a cumulus tower; a cumulus tower is the one thing on Krator that already moves water from the wet dense foot of
the Wall to its dry thin crest, every morning, for nothing. The lung is a native colony that has wrapped that updraught
in a body: it confines it, drives it with its own dark skin, drinks what condenses inside, and in doing so has become
the only organism on Krator that lives at 1.5 atm and 1.0 atm at once. It is a pipe for water that grows toward the
drought, a road up a wall, a barometer you can read from the jungle, and the Talovolci's stair.

Status: **a proposal the owner has answered (2026-11-02; section 17 has the words).** Nothing is built, nothing on the
model is changed and `LORE.md` is untouched; the lore sentences the owner's answers call for are *proposed* inside the plan
(section 10) for the owner's hand. What the owner settled: the mechanism is canon; the rings are a coral-like colony; the
site stands as a band kit; the Talovolci's stairs, wells and omen stand; the lungs are widely known as the convenient way up
the Wall; the yield stands; **nothing glows** (the mote lamp is struck); the spiral rule reaches native life, so the
right-handed helix and the mirror lung stand; the scarp goes into the next scale model update; **Spirladunon** is the current
name of the place the lore called Daridel; the **Talovolci are the Crag Men** of the old polygon. Working names throughout:
the kit's name (`clivobredos` since 2026-11-11, the Talovolci's word; it was `clifflung`), the species' and the people's words are placeholders for the owner's or the Talovolci's. The sister proposal is the Gills
(`biomes/gills/PLAN.md`, branch `claude/alien-biome-proposal-fb0a42`): this plan takes its form and its trend table, and
deliberately not its mechanism (the Gills are a tide of gas through rock; the lungs are a convection of wet air through
a body). Where this plan says "the Gills' digest", it means the two subagent digests of every biome's notes that fed that
plan's section 2 (2026-11-01), summarised there.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/clivobredos/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations, as the Throne's and Korona's (`build.py --station <name>`): `dist/clivobredos.html` (station 1, the Mouths) and `dist/clivobredos-<name>.html` (section 11) |
| Region on the model | **no new polygon.** The kit is a *band kit* on the `s highlands` polygon's north edge, where it meets `hyperjungle S` and `savage hyperjungle`: the scarp's face from about 300 m to about 3,400 m, px ~745-930 by 1022-1060 on the 5.1 canvas (section 5). The `shighlands` kit keeps the polygon; the lungs are a layer on its face, as `dambasins` is an overlay on the north basin |
| Object | `LUNG` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `breath`, `flues`) on the `BIOME-API.md` contract (the Throne's and sedesert's shape); `LUNG.breath(t, W)` is the one pure function of the clock and the weather that every shader, hazard, animal and the cloud deck's edge read (section 3) |
| Core | `biome`, `rand`, `tags`, `space`, `hazard`, `host`, `atmos` (the shared sky, the weather, **the cloud deck**), `water` (springs, wet ground, falls), `terrain` (`KFIELD` with an inset on the face, `KCAVERN` for the bores, `KSTRATA` `megabreccia`/`crest`, `KRELIEF`, `KGROUND`, `KFAR`, `KHORIZON`, `KFROST`), `clock`; section 13 |
| Read in place | `biomes/shighlands` (the spiral cloud forest on the face and the paramo on the crest: the lungs stand in its country and keep its rule), `biomes/hyperjungle` (the canopy the intake bells stand in), `kits/fauna` (the fang glider, the argali, the chamois, the mountain condor, the sky ray), `kits/crops` (the crest's irrigated zone) |
| Out of scope | the Talovolci's hamlets and Spirladunon as buildings (a settlement or `core/hamlet` plan: this kit publishes the sites); the animals' models (`kits/fauna`); the whole of the Inner Wall's scarp as a landform (a `core/terrain` gap, section 14, which this kit is the first taker of) |

A new biome: it goes in the gallery when it first reaches `main`.

## 1. The idea

The Inner Wall's southern flank stands over the hyperjungle, and the jungle's air, dense and wet and warm, pools
against it as the **cloud sea**: a white deck that laps the scarp every morning and pours up its ravines by day
(`LORE.md:930-935`; `biomes/shighlands/NOTES.md`, "The showcase"; the deck is `core/atmos`'s `d-clouddeck`). Above the
deck is the spiral cloud forest; above that the paramo, where 500-900 mm fall against 2,000-3,600 mm on the face below
(section 5). Between the foot of the scarp and its crest the air drops from 1.5 to 1.0 atm and 14 degrees.

The **lung** is a native colony that spans that whole face. Seen from the jungle it is a dark rib running up the Wall, a
half-pipe three to eight metres across lying against the rock with the rock for its back wall, bridging free where the
face overhangs, following a ravine where there is one, three kilometres from its **bells** in the canopy to its
**mouths** on the paramo's lip. It is hollow. Air goes in at the bottom and comes out at the top, and that is the
whole organism's reason:

- **The engine is condensation, not pressure.** The hydrostatic difference between 1.5 and 1.0 atm drives nothing (it
  is exactly the weight of the air in the pipe: section 4, reading 2). What drives the flue is that saturated air cools
  more slowly as it rises than dry air does, because the water condensing in it gives back its heat: on Krator a dry
  parcel cools 7.4 degrees a kilometre and a saturated one about 4 (section 3), so a saturated parcel from the foot
  arrives at the crest warmer, and therefore lighter, than the air outside the pipe, and the column floats upward. The
  same arithmetic makes every cumulus cloud; the lung is a cumulus with a skin round it that stops it mixing with the
  air it rises through. By day the skin adds a second engine: the face looks north, into the sun at 40 degrees south,
  and the skin's dark sun side heats the air inside as a solar chimney does. The flue draws at about 2 m/s at dawn and
  5-10 m/s at noon; stalls at dusk; trickles backward on clear winter nights (section 3).
- **What the breath carries is water.** The foot's air at 21 degrees and 1.5 atm holds about 10 g of vapour in every
  kilogram; the crest's at 7 degrees and 1.06 atm holds 6. The difference condenses on the bore's inner wall on the
  way up and **runs back down the inside of the pipe against the flow**: a film of distilled water a few millimetres
  thick, re-evaporated where the warm lower rings meet it, condensed again above, so the water climbs the flue in a
  ladder of condensations (the **condensation ladder**, section 3) and the net export comes out at the top: a few
  cubic metres a day per flue, weeping from the mouth's collar onto ground that gets a fifth of the rain the foot does.
  The heat the condensing water gives up keeps the top rings and the mouth above freezing on paramo nights of -8 to -16.
- **What the organism gets** is water where it has none (the colony grows *toward* the drought, because it brings its
  water along: no plant on Earth does), warmth at its cold end, a half-again CO2 partial pressure for the top rings'
  photosynthesis (they breathe the foot's air), and a wind of its own to sow its spores on: every noon the mouths puff
  the colony's spores onto the paramo downwind, and every bell draws in the jungle's. Its energy is **the sun**, taken by
  the photosynthetic partner in its skin (three kilometres of sunlit skin is a hectare and a half of leaf), and its
  minerals come from the rock its holdfasts eat, as the south-western highlands' shelf coral eats stone
  (`biomes/swhighlands/PLAN.md`, "Trees"). It does not feed on the breath: the air is too thin a soup (section 3), and
  the plan says so rather than pretend. The breath is the colony's plumbing, not its food.
- **The colony spans what no ring could.** A lung is a stack of **rings**, each 20-60 m of pipe, each a clonal individual
  budded from the one below; a three-kilometre lung is 60-150 rings. The lowest live at 1.55 atm and 21 degrees in the
  cloud sea, the highest at 1.06 and 7 in the wind, and neither could live at the other's station: a ring's physiology
  is fixed at the pressure it is born at, and shows in its skin, so the lung is banded by height in the same colours
  everywhere on the Wall and a traveller reads the air pressure of any ledge off the nearest ring. **A reef laid on its
  side up a cliff, crossing three climates, one organism.**
- **It is the road.** Its ribs are a ladder; its breath is a lift. A fang glider that enters a bell at noon is carried
  three kilometres up in ten minutes without a wingbeat and comes out of the mouth into the paramo's sky; the
  Talovolci lash stairs to the ribs and climb between their cloud forest and their crest hamlets along the lungs, in
  the warm wet shelter of the breath, with water at every ring; a dead lung, a **husk**, is a dry hollow road and a
  shelter the length of the Wall. On the southern Inner Wall the lungs are the one way up that is not a day's detour.

So three things that are usually separate are one here: the weather (the cloud sea's daily climb up the Wall), the
organism (the colony that canalises it) and the geography (the only road and the only water on a 3 km scarp). A
traveller reads the hour off the breath, the height off the rings, and the way up off the dark ribs on the Wall.

## 2. Why it is alien, and why it is Krator's

### What a reader has not seen

- **An organism whose body is a weather system.** Not a plant that uses wind, but a colony that *is* a confined
  updraught: take the air away and the thing is a dead tube; take the tube away and the air is a cloud. Krator has
  chimney organisms already (the siphon tree, the woolly siphon: section 4) and they breathe a vent's warm air out as
  mist. The lung has no vent: its heat is the sun on its skin and the water in the air, so it can stand anywhere the
  face is wet at the foot, sunlit and cold at the crest. It is the first native form that runs on the weather alone.
- **One body across three climates.** A colony that spans 0.5 atm and 14 degrees, with every member confined to the
  station it was born at, so that position in the body *is* physiology. Nothing on Earth lays one organism across an
  environmental gradient wider than any of its cells can tolerate.
- **A plant that grows toward drought and brings its water.** Every Earth gradient of life runs toward the wet. The
  lung's growing tip is its driest end, and it is the wettest thing there.
- **A pressure barometer you can see from twenty kilometres.** The ring bands make the Wall a graduated scale of the
  air, and the breath hour makes it a clock: dawn steams, noon roars, dusk is silent, a winter night runs backward.

### The trends it extends (what Krator's native life already does)

| Trend (the files) | How the lungs carry it |
|---|---|
| Native life clusters on geology's energy and holds where Earth life fails; where Earth life is strong, native life is a flavour (`biomes/throne/NOTES.md:87-91, 273-275`; `biomes/godthrone/PLAN.md:192-201`) | the face is Earth's (the spiral cloud forest, the paramo's rosettes: `shighlands`); the lungs are the native thread through it, a dozen dark ribs on a green wall, each with the only native community for kilometres living in and on it. The energy they take is the one Earth life on the Wall cannot: the cloud sea's latent heat |
| Native forms answer one physical problem each, and a kit's family reads as one because they share the problem (`biomes/riftrim/PLAN.md:109-113`) | every species here answers the breath: how to stand in it (the bells), how to live in the bore's wet dark (the combs, the ring-crawler), how to live on what the mouth exhales (the breath meadow), how to ride it (the flue-rider). One problem, one family |
| The native lineage is fungoid: fleshy bodies carrying a photosynthetic partner, no leaves, no wood (`biomes/outlands/PLAN.md:51-52`; `biomes/swhighlands/PLAN.md`, "The flora"); the Gills *propose* the lineage's rule, "the body is a host that takes a partner" | the lung is that body plan at its largest: a fleshy tube whose sun side carries the light partner (teal and violet where it is wet, rust where it is dry), pale and ribbed inside, no leaf anywhere. It takes the Gills' rule as given and adds nothing to it |
| The southern highlands' rule: **every plant grows in a spiral, and every spiral turns the same way** (`biomes/shighlands/NOTES.md`, "The brief", "One hand"; `LORE.md:930-935`) | the lung's ribs climb it in a right-handed helix, so the air inside swirls as it rises (section 3: swirl is what keeps a plume together, as a fire whirl's does), and the colony's spiral is the first spiral on the Wall with a job the physics can name. The rare **mirror-handed lung** turns the other way, and the Talovolci will not climb it (section 10, *proposed*) |
| Life carries state on the world clock and the sky's cues (`biomes/ehighlands/NOTES.md:40-47`: everything leans to the giant; the sedesert's sun-dial; the rift's night rosette) | the breath is on the clock and the weather at once (`LUNG.breath(t, W)`): dawn, noon, dusk and the winter reversal are the four states of the whole biome, as the Gills' tide is theirs; the two sister proposals give the native lineage a pulse, one from the sky's tide and one from the sun's day |
| Dispersal by what the air does (`biomes/nsemiarid/PLAN.md:187`, "everything here travels"; the Gills' breath-sown spores) | the lung sows itself on its own exhale and is itself the hyperjungle's ladder to the paramo: every noon the mouths dust the crest with jungle spores, pollen and the glowing motes (`LORE.md:917`), which sprout and die in a lawn round each mouth (the **fall-out meadow**, section 7) |
| Native fauna are vertebrate-grade hexapods coevolved with the flora, never insects (`biomes/outlands/PLAN.md:57-58`; `kits/fauna/BIOME-FAUNA-PLAN.md:52-54`) | three hexapods on the breath (section 8); the fang glider already in the kit rides it |
| Lineages cross kits as cousins, never copies (`BIO.kin`, `core/biome/32-core-variants.js:28-52`) | the flue-rider is kin of the fang glider; the mouth-maw of the Rift's gapemaw; the bells' strainer fringe is the trumpet line's (the funnel that catches water, turned to catch air) |
| Dense air gives size (`LORE.md:47`, insects and flyers grow larger; the hypertrees of 150-480 m, `LORE.md:916`) | the lung is the dense air's gift to the native lineage as the hypertree is its gift to Earth's: at 1.5 atm the same temperature excess lifts half again the mass of air, so the chimney works where on Earth it would barely draw (section 3) |

### Where it breaks a trend, and why the break is earned

- **The largest living thing on Krator is native, and it is a plant of the light.** The native things so far are the
  dark's and the vent's (the Throne's lee, the Gills' throats) or small and weird; size has been Earth life's (the
  hypertrees, the sprawl oaks). The lung is three kilometres long, in full sun, on the one ground that is wet, sunlit
  and steep for three kilometres together. The break is earned because the physics that gives Earth's trees their size
  here (dense air) gives the lung its length (dense air drives the chimney), and because it happens exactly once: the
  Inner Wall's sun-facing wet scarp is the only place on the model where a 3 km face carries a cloud sea at its foot
  and a dry crest at its top (section 5). A reader who asks "why only here" gets an answer in numbers.
- **A native form that Earth life colonises.** Elsewhere the native biome excludes Earth's or is a flavour inside it.
  The lung's lower rings are the spiral cloud forest's trellis: coilbarks and spiral trumpets climb them as the only
  soil-less way up, and the Talovolci use them as the only road. It is the first native structure that is the
  *infrastructure* of an Earth-derived ecology and a human one, which is what a thing this size would be.

## 3. The physics, honestly

All numbers from scale model 5.1 at the chosen stretch (section 5) and the model's air law, 1.6 x exp(-h/8000) atm.

- **The face.** Foot of the scarp proper at ~300 m: 1.54 atm, +21 degC mean (27/15), saturated at dawn when the cloud sea
  stands against the Wall. Crest at ~3,300 m: 1.06 atm, +7 (19/-5), 500-900 mm. Height 3.0 km, pressure drop 0.48
  atm, temperature drop 14 degrees: the model's mean lapse on the face is **4.7 degrees a kilometre**.
- **The adiabats.** Krator's dry adiabatic lapse is g/cp = 7.4/1004 = **7.4 degrees a kilometre** (Earth's is 9.8). The
  saturated lapse at the foot (21 degC, 1.5 atm: the saturation mixing ratio is 10.4 g/kg, lower than Earth's 15.9 at
  the same temperature because the air is denser) is **3.7 degrees a kilometre**, rising to about 4.5 near the crest;
  call the mean over the climb 4.2. So a saturated parcel lifted from the foot arrives at the crest at about **8.5
  degC against the model's +7**: 1.5 degrees warmer; mid-face it runs about 1 degree warmer. The face's air is close
  to moist-neutral, as a wet tropical mountainside is, and the lung lives on the margin: that is *why* it must be a pipe.
  Open air that warm would mix away in a hundred metres; confined, the excess is kept the whole way up.
- **The stack.** Buoyancy pressure over the column: rho x g x H x dT/T = 1.5 x 7.4 x 3,000 x (1.2/290) = about 140 Pa
  from temperature, plus about 50 Pa because saturated air is lighter than the drier air outside (0.6 x 2.6 g/kg x 294 K
  = 0.5 degrees of virtual temperature): **~190 Pa**. Against the bore's friction (f = 0.03, K = fL/D: 30 for a 3 m
  bore, 60 for 1.5 m) that gives v = sqrt(2 dp / rho (1+K)) = **2-3 m/s at dawn**. In Earth's air the same excess gives
  two-thirds the pressure: the dense air is the margin that makes the chimney draw at all.
- **The solar chimney.** The face faces north, into the noon sun at 40 degrees south (`LORE.md:36-38`). A dark skin 3 m
  wide over a 3 km flue takes about 600 W/m2 at noon, 5.4 MW gross; say a third reaches the air after the skin's own
  losses, 1.8 MW. Solving the chimney (dp = rho v^2 (1+K)/2 = g H Q/(A v cp T)) gives v^3 = 2 g H Q/(rho A cp T (1+K)):
  **9 m/s** in a 3 m bore, the air inside about 18 degrees warmer than the crest's when it leaves. The real number sits
  between the two engines by hour and cloud: **5-10 m/s through the middle of the day**, 55-80 m3/s per flue, a
  standing cap cloud over every mouth as the warm wet exhale meets the paramo's air.
- **The stall and the reversal.** On a dry afternoon the foot's air (70% humidity) rises dry for the first kilometre,
  cooling 7.4 a kilometre, and is colder than the face until it saturates: the draught weakens to the solar term alone.
  At dusk both engines stop. On a clear winter night the paramo radiates, the crest's air falls below the bore's, and
  the flue **runs backward** at 1-2 m/s: cold dry crest air drains down the pipe and comes out of the bells as a cold
  mist into the canopy before dawn, the **cold breath**. The wind over the crest (6.5-7.5 m/s on the model) adds a
  suction of half rho v^2, about 30 Pa, a sixth of the stack: it decides the marginal hours, not the day.
- **The water.** Dawn, 5 hours at 2.5 m/s in a 3 m bore: 17 m3/s x 1.6 kg/m3 = 28 kg/s of air, dropping 10.4 - 6.3 =
  4.1 g/kg between the foot and the crest: 0.115 kg/s, **2 tonnes**. Day, 8 hours at 8 m/s, drier: 80 kg/s dropping
  about 1 g/kg: **2.3 tonnes**. **About 4-5 m3 a day from a 3 m flue, 15-20 from a 6 m one.** A Talovolci hamlet of fifty
  drinks 2-3; the paramo's 500 mm a year on a hectare is 14 a day. So one lung waters one hamlet and a third of a
  hectare of meadow at rainforest rates: **a spring, not a river**, and the plan treats it as one. The latent heat of
  the dawn condensation is 0.115 x 2.5 MJ = **290 kW**, released in the top rings: enough to keep a mouth and its
  collar above freezing through a night of -16.
- **The condensation ladder.** The film condensed on the bore's wall runs down under gravity at a few centimetres a
  second against air rising at metres a second; where it reaches rings whose air is still unsaturated it evaporates
  back into the flow and is carried up to condense again. Each ring's wet band is where the ladder's rung is that day;
  the whole set of rungs moves up the flue through the morning and down it toward dusk. In a page it is a band of
  sheen that travels (section 12); in the biology it is why the middle rings never dry and never drown.
- **What else the breath carries, and why it is not food.** The hyperjungle's aerial load (spores, pollen, the glowing
  motes, small insects) runs to tens of micrograms a cubic metre on Earth's rainforest scale; grant Krator's dense,
  spore-heavy air ten times that, and a flue drawing 60 m3/s filters **tens of grams a day**. That feeds the animals
  that lick the wet walls (section 8), not a three-kilometre organism. The lung's carbon is photosynthetic: 3,000 m x
  5 m of sunlit skin is 1.5 ha of leaf, as much as a small wood. The honest reading changes the ecology: the breath is
  water, heat and transport; the catch is the animals'.
- **The swirl.** The ribs' right-handed helix (the southern highlands' rule) puts a spin on the rising column. A
  swirling plume entrains less than a straight one, which is why fire whirls stand tall and smoke rings hold: in the
  bore the swirl keeps the warm core off the cold wall and flings the condensing drops onto it, so the spiral the
  owner's rule demands is the spiral the physics would choose. The mirror-handed lung breathes as well as any; its
  difference is the Talovolci's to read.
- **Why it must be alive.** A dead tube (a lava tube up a cliff) would draw too, for a season. It would fill with the
  jungle's debris in a year, its walls would foul and slow the film, and it could not change its bore. The living lung
  **meters**: sphincter rings narrow the bore when the stack is weak (a smaller bore keeps the velocity up and the film
  moving) and open at noon; it **sheds** the catch to the animals and its own skin to the Talovolci's ropes; it
  **insulates** its sun side with pigment and its shade side with a pale pleated skin; and it **grows upward on its own
  breath**, each new ring founded by spores the breath carried to the mouth's wet collar. It is a plant that has become
  its own irrigation canal.

## 4. Ideas considered and set aside

1. **The chimney tree.** One organism, a siphon tree three kilometres tall rooted at the foot. Set aside: a trunk cannot
   stand it (0.75 g lets a column stand a third taller, not ten times), the Throne's siphon tree
   (`biomes/throne/NOTES.md:218`) and the Siphon Pits' woolly siphon (`biomes/siphon-pits/PLAN.md`, "Xenobota") own the
   chimney tree, and a single body has no answer to a 14-degree, half-atmosphere gradient. The colony of rings is the
   answer to all three, and it is the alien part.
2. **The pressure pump.** The brief's phrase, "the stack effect between 1.9 atm at the foot and 1.0 atm at the crest",
   read as a pressure difference driving flow. Set aside because it is wrong: the hydrostatic difference between the two
   ends is exactly the weight of the air column in the pipe, and a pipe full of the same air as outside carries no flow at
   all. Only a *density* difference between inside and outside drives a stack, and here that difference is latent heat and
   sunlight (section 3). Keeping the plan honest about this is what turned the cliff lung from a skin into a mechanism.
3. **The living cliff.** The face as one epilithic organism: a mat that combs fog, fed by the cloud sea, a kilometre-tall
   lichen. Set aside: it is a skin on a cliff (the brief's own objection), Farside's fog sponges and fog belt own
   fog-combing (`biomes/farside/PLAN.md`), and nothing in it needs the Wall's height: a 50 m sea cliff would do.
4. **The barometric cave.** Fissures in the Wall breathing with the day's pressure swing, life at their mouths. Set aside:
   it is the Gills with a worse site, and the Gills have the tide.
5. **The cold drain.** The reverse organism: a gullet that pours the paramo's cold night air into the jungle, pooling it
   in a frost hollow at the foot where only cold-adapted native life lives. Set aside: cold drainage down 3 km warms
   22 degrees adiabatically and arrives tepid; there is no ecology at the foot of it. The plan keeps its one good image,
   the cold breath at dawn, as the winter reversal.

The lungs beat them because the mechanism is one sentence a physicist would sign (confined moist convection on a sunlit
wall), it is visible every day from twenty kilometres (dark ribs, steaming mouths, cap clouds at noon), it needs Krator
(a 3 km sun-facing scarp with a cloud sea at its foot, dense air to drive it, a native lineage with no leaves to lose), and
it reorganises climate, organism and geography together.

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-02)

Four scarps were surveyed with the model's rasters (`tools/scale-model/smodel/page.py`; every transect in the session's
survey logs): the southern Inner Wall over the hyperjungle, the northern Inner Wall over `hyperjungle N`, the eastern
Inner Wall over the savage hyperjungle, the Eastern Abyss's cliff, and the south-western highlands' scarp to the Ring Sea.

**What the model can and cannot say.** At 2 km a pixel the Wall is a ramp: from the jungle floor (-1,500 to -2,000 m,
1.9-2.1 atm) to the crest (3-5 km) is 100-130 km on every transect, and the steepest cells anywhere run at 40-49% grade
(a 2.5-3.4 km rise over 6-10 km). The 2-4 km *cliff* of the lore ("steep borders", `LORE.md:99-104`) is kit-scale, as the
shighlands kit already draws it (its stage puts the rim 1,400 m over a deck at 1,120 m on its own 5.2 km map). So the
plan takes the model for the air at the foot and the crest, and the kit draws the face. The 1.9 atm end sits 20-60 km out
on the jungle floor; the scarp proper rises from about 1.5 atm.

| Scarp | Foot (the steep step's base) | Crest | Step | Verdict |
|---|---|---|---|---|
| **South Inner Wall over the hyperjungle, Voth to Pylon** (px 745-930 x 1022-1060) | 0-500 m, 1.5-1.6 atm, +20-23 (27-30/14-17), 1,000-2,600 mm, Af/Am/Aw; the rain maximum 3,000-3,600 mm at 1.2-2.4 km on the face | 3.0-3.8 km, 1.0-1.1 atm, +5-9 (18-20/-3 to -8; extremes +26/-16), **470-900 mm**, Dfc/Dsb/Dsc, wind 6.5-7.5 m/s | 3 km over 30-36 km (8-10%); the model's steepest cell on this stretch 1,742 m over 6 km at px 916,1045 | **chosen**: wet saturated foot, dry cold crest, the sun-facing face, the shighlands kit's country, the Talovolci's Daridel 20 km off |
| South-west corner of the Wall over the Vothic coast (px 626-671 x 937-1028) | 0-450 m, 1.5-1.6 atm, +22-24, **500 mm, BSh/Csa** (dry), wind 11-12 m/s | 3.5-3.9 km, 1.0 atm, +3-6, 400-500 mm, Dsb | the model's sharpest Wall: 3.1-3.4 km over 10 km (33%) | no cloud sea: a dry foot gives the flue little to condense; it is the swhighlands plan's "4 km scarp" and its fan coast (`biomes/swhighlands/PLAN.md` sections 1, 7) |
| East Inner Wall over the savage hyperjungle (px 1087-1095 x 835-890) | -240 to +170 m, 1.57-1.65 atm, +26-28, **4,000 mm, Af** | 2.1-2.8 km, 1.13-1.23 atm, +11-14, **4,000 mm**, Cfa/Cwa | 2.4-2.6 km over 6 km (44%) | the wettest foot on the model but a crest as wet as the foot: the ehighlands' wet face (`biomes/ehighlands/PLAN-STATIONS.md`, station 2); a lung there would irrigate a rainforest |
| North Inner Wall over `hyperjungle N` (px 789-977 x 624-651) | -950 to +490 m, 1.5-1.8 atm, +25-33, **150-600 mm, BWh** | 1.8-3.0 km, 1.1-1.27 atm, +9-17, **150-390 mm**, BSk | 2.4-2.9 km over 6 km (40-49%) | the driest crest, which the breath would serve best, but a hot desert foot: the savannah rim's blind grass, no cloud sea to breathe |
| Eastern Abyss cliff (`sedesert` over `e abysss`, px 1241-1273 x 626-1061) | -1,100 to -2,400 m, 1.85-2.16 atm, +30-36, 300-3,700 mm, XS/XV/WX | +130 to +460 m, 1.5-1.57 atm, +20-25, 280-750 mm, BSh/Csa | 1.3-1.95 km over 4 km (33-49%): the lore's 740 m cliff and more | the biggest pressure drop (0.6 atm) over the shortest face, but the crest is hot desert at 1.5 atm: the breath arrives at +28 and condenses little; the shelf is the sedesert kit's and Locus's |

**The chosen stretch** (px 745-930 by 1022-1060, about 370 km of Wall; the kit's stations on its middle, x 770-830):

| Band | Height | Air | Mean (warm/cold) | Rain | Classes | What is there |
|---|---|---|---|---|---|---|
| the jungle floor, 20-60 km north | -1,500 to -800 m | 1.8-1.95 atm | +28-32 (33-37 / 23-28) | 1,500-4,000 mm | XA, WS, Af | the hyperjungle, the Ring Sea's southern arm, Voth (742,1018), Torus (774,1007), Pylon (869,1002), Iziz (963,985) |
| the foot of the scarp | 0-500 m | 1.5-1.6 | +20-23 (27-30 / 14-17) | 1,000-2,600 | Af, Am, Aw | where the cloud sea stands at dawn; the **bells** |
| the cloud belt, the face | 1.2-2.4 km | 1.2-1.38 | +12-17 (22-25 / 2-10) | **3,000-3,600 at x=790** | Af, Cfa | the spiral cloud forest; **Spirladunon** (formerly Daridel; `LORE.md:860`, legacy px 528,687 = 800,1017 on 5.1: 1,371 m, 1.35 atm, +18, 4,000 mm) |
| the crest, the paramo's lip | 3.0-3.8 km | 1.0-1.1 | +5-9 (18-20 / -3 to -8; +26/-16) | 470-900 | Dfc, Dsb, Dsc | the **mouths**, the breath meadows, the Talovolci's crest hamlets (*proposed*) |
| the fellfield | 4.0-4.8 km | 0.88-0.97 | -3 to +3 | 400-500 | Dsc, Dfc | shighlands' planned station 3 |

- **Air:** 1.5 atm at the bells (a little thick for the unadapted; nothing like the abyss cough at 1.9), 1.0 at the
  mouths. A traveller walks the whole lung without adaptation, which is the Talovolci's case too: the lung is the alien
  biome *between* the breathable air of the paramo and the heavy air of the floor.
- **Water:** the face's rivers run north off the Wall into the Ring Sea's arm (the model's `klir Rivrh` and its fellows,
  `DATA.rivers`); the paramo's lip has no river of its own: tarns and bogs (shighlands' stage) and the lungs' wells.
- **Neighbours:** `shighlands` is the polygon and the kit the lungs stand in (its cloud forest on the face, its paramo at
  the crest, its planned subalpine and fellfield stations above: `biomes/shighlands/PLAN-STATIONS.md`); `hyperjungle S`
  and the `savage hyperjungle` at the foot (`biomes/hyperjungle`); `swhighlands` 120 km west along the Wall; `godstep`
  behind the paramo to the south (the Talovolci's canyons, `biomes/godstep/PLAN.md`); the Bowl's walls to the south-east.
- **Who holds it:** the **Talovolci** (`LORE.md` section 6.21; their political polygon, legacy px 402-751 by 592-833, is
  674-1023 by 922-1163 on the 5.1 canvas: the whole stretch; the owner, 2026-11-02: the Talovolci **are** the Crag Men, so
  the old polygon name is theirs). **Spirladunon** (formerly Daridel; the owner, 2026-11-02), their ceremonial settlement,
  is in the cloud belt 20 km west of station 1 (the model's marker at 800,1017, which is right). The Vothic Kingdom and the Empire of Iziz hold
  the floor below (Voth 40-60 km north of the bells; Iziz 90 km north-east). The stretch is inside `little demo`'s box.

*Proposed* map changes (none made): none to heights, rain or polygons in this version. **For the next scale model update
(the owner, 2026-11-02: "do build a scarp into next scale model update")**: the Inner Wall's scarp on this stretch sculpted
into the model's heights as a real step (the face from ~300 m to ~3,300 m over a few cells, benches and ravines at the
model's scale, the talus foot), so the model and the kit's `KRELIEF.scarp` (section 14) agree; the lungs themselves stay
kit-scale. Two notes for the lore and the model's docs: `LORE.md:852-853` can drop "the old name" from the Crag Men (the
Talovolci are that people, and the polygon is rightly theirs), and `LORE.md:860` should read Spirladunon, formerly Daridel.

## 6. The ground and the landforms (`core/terrain`)

- **The face** (`KFIELD` with an **inset** on the scarp, `30-core-field.js`: "finer where the world draws finer (a
  cliff)"): the model's heights at 1:1 for the plateau and the floor, and the kit's own scarp between them: 2-3 km of
  near-vertical `megabreccia` and `crest` rock (`KSTRATA`, `biomes/godthrone/PLAN.md:129`) in benches, ravines and
  buttresses, a talus foot (`KRELIEF.talus`), a rim. The scarp form itself is a core gap (section 14: `KRELIEF.scarp`);
  station 1 draws it as the shighlands stage does today and moves onto the core form when it exists.
- **The lungs** (`KCAVERN`, `39-core-cavern.js`): a lung is a `mass` (rock-like standing body: here flesh) following a 3D
  centreline up the face with a `tube` void inside it, a `door` opening at each end (the bell and the mouth), `ledge`s
  where the ribs stand out; the bore is walkable for what fits (`core/walk` written from the plan), so a camera and a
  glider can go up the inside. Lungs are placed by `KRAND` from (world, ravine, index, salt) on the face's ravines and
  buttresses: 6-14 on a 5.2 km station, 3-8 m across, a few dead (**husks**), a few young (short, from the foot only).
- **The bells** (`KSTACKS` bodies at the foot, kind *proposed* `bell`, or the mass's flared end): flaring mouths 8-20 m
  across standing up into the canopy on prop-like holdfasts, gaping north, the strainer fringe across them.
- **The mouths and the wells** (`core/water`): at each mouth a weeping collar and its pool: `WATER.karstSpring` (a still
  pool with the spring look and a thread leaving it, `ext/54`), its level and outflow scaled by the day's condensate
  (section 3; a pure function, exported); wet ground and a fan of moss below it (`WATER.wetGround`, `hollows`); where the
  lip is a cliff, a thread fall (`WATER.fall`) off it.
- **The breath meadows** (`KRELIEF` strip fields): a soft mask downwind of each mouth (the model's wind here is from the
  north-west, 6.5-7.5 m/s), wet and warm, where the exhale falls: the fall-out lawn, rime-free.
- **The husks** (`KCAVERN` masses with no breath): dry, pale, split, lying along the face and fallen across the talus in
  rings; the road.
- **The cloud sea** (`core/atmos` `d-clouddeck`, bound as shighlands binds it): the deck at the foot's height, drifting on
  the module clock, thinning where the face rises through it; its edge mist up the ravines is the host's own
  (`core/atmos/README.md:298`). *Proposed* (section 14): the deck's height follows the day (`LUNG.breath` reads it).
- **The far field and the horizon** (`KFAR`, `KHORIZON`): the Wall running east and west, the cloud sea to the northern
  horizon with the Throne standing out of it at azimuth 8 (the shighlands sky), the paramo rolling south; the far lungs as
  dark lines on the Wall with their cap clouds as sprites at noon.
- **Frost** (`KFROST`, station 1's rim): patterned ground on the paramo's lip, rime on everything but the breath meadows.

Fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 7. The flora: native, the breath's

**The rule that keeps it one family:** every species stands in the breath, lives on it, or rides it; every one is
fungoid (fleshy, partnered, no leaves); every one that has a long axis spirals, right-handed, by the Wall's rule. Palette:
the lung's pressure bands (teal and violet at the wet foot through sage to rust and bone at the dry crest), the bore's pale
pleated inside, the wet black of the comb, the breath meadow's one vivid thing (the fall-out lawn's jungle green against
the paramo's straw). **Nothing glows** (the owner, 2026-11-02): the hyperjungle's motes drawn up a flue go out in the cold
before they reach the mouth, and a mouth at night is found by its warmth and its sound. Working names; the Talovolci's are
better (section 17).

### The lung itself

| Key | Name | Where | What it is |
|---|---|---|---|
| `lung` | **Cliff lung** | the face, foot to crest | the colony: a half-pipe 3-8 m across lying against the rock, 60-150 **rings** stacked up a ravine or a buttress, bridging free over overhangs, its ribs a right-handed helix. The record is the colony (`KCAVERN` mass + tube), each ring a child record with its birth pressure, so the inspector says "ring 83 of 121, born at 1.21 atm" |
| `ring` | **Lung ring** | one 20-60 m length of pipe | the individual: fleshy wall 0.3-1 m thick, the light partner in its sun-side skin (its colour the **pressure band**: `LUNG.bandAt(atm)`, one function for every lung on the Wall), the shade side pale and pleated (`organic.pleat.skin`), the inside ribbed (`organic.coil.ribbed`), a **sphincter** at its top joint that narrows the bore (the meter: a `BIO.animHook` `breath` mode item). Dead rings go bone-pale and split |
| `bell` | **Intake bell** | the foot, in the canopy | the lung's root end: a flared mouth 8-20 m across on holdfasts that grip and eat the rock, gaping north into the cloud sea, hung with the **strainer fringe** (the trumpet line's funnel, turned to catch air: long violet filaments that keep the jungle's leaves out and stream inward on the draw, outward on the cold breath) |
| `mouth` | **Mouth** | the crest's lip | the lung's growing end: a lip that flares and leans downwind, a **weeping collar** of wet black flesh round it that drips the day's condensate into the well below, the newest rings pale and small above the last full one, a **cap cloud** standing over it at noon (atmos particles) |
| `comb` | **Throat comb** | the bore's inside, below the condensation band | the lung's own lining: wet black combs that hold the film and the catch (section 3); seen at the mouths, in the bells, in cut husks; what the ring-crawler licks |
| `husk` | **Husk** | the face; fallen across the talus | a dead lung: dry, pale, papery, split along its ribs, hollow, a road and a shelter; its rings weather at different rates (the pressure bands outlast each other), so a husk is banded even dead |

### The breath meadows (what the mouths exhale)

| Key | Name | Where | What it is |
|---|---|---|---|
| `fallout` | **Fall-out lawn** | the strip downwind of every mouth | the small-and-weird: the hyperjungle's spores, pollen and seeds carried up the flue sprout in the warm wet exhale and die in the cold a few weeks on: a lawn of jungle seedlings on the paramo, hypertree cotyledons the size of hands, a different crop every month, green against the straw, dead brown at its edge where the breath's warmth ends. The meadow's edge draws the breath's reach on the ground |
| `dewcoil` | **Dew coil** | the meadows, the collars' fans | a fleshy coil 30-80 cm (a crozier that never unrolls) that beads condensate along its spiral and holds it in the cup of its curl through the day: the paramo's drink, for animals and for the Talovolci; right-handed |
| `rimecap` | **Rime cap** | the meadows' outer edge, where the warmth fails | a low grey cap crusted white every night and wet every noon, the frost-and-thaw plant: the breath meadow's border |

### Earth's, read in place

- `biomes/shighlands`: the spiral cloud forest on the face (coilbarks, spiral trumpets, volute trees, crozier tree ferns,
  screw palms) climbing the lungs' lower rings as their trellis, under the kit's **no trees on cliff faces** rule
  (`shighlands/NOTES.md:102`: the lungs are not cliff; they are the one thing that roots on it, and the rule's `cliff`
  weight is what places them); the paramo's ruffle-crowns, giant groundsels, spiral lobelias and bogs at the crest; the
  Whorl Stone's kin as a tor on the lip.
- `biomes/hyperjungle`: the canopy the bells stand in (the ironbark, the ghostwood, the prism gum at the foot's height,
  with their `reach` up the face per `hyperjungle/PLAN-LANDS.md`, "Species cross borders").

## 8. Fauna (`kits/fauna`)

Native, vertebrate-grade hexapods on `faWdHex`'s `amb` anatomy, named here and built there, drawn in the biome from the
fauna bundle, never in the kit. The southern highlands' Earth-like set (argali, chamois, mountain lion, mountain condor:
`kits/fauna/BIOME-FAUNA-PLAN.md`, wave 2) and the hyperjungle's sky rays are read in place.

| Key | Name | Status | What it does |
|---|---|---|---|
| `fang_glider` | fang glider | in `kits/fauna` (hyperjungle, `faWdGlider`) | read in place: enters the bells at noon and rides the flue up; the paramo's mountain condor meets it at the mouths |
| `fluerider` | **Flue-rider** | new | a six-limbed glider smaller than the fang glider (its kin by `BIO.kin`), whose whole life is the breath: it roosts in the bore's upper rings, rides out of the mouth at noon to hunt the paramo, and drops down the outside of the lung at dusk to roost; the one animal that lives at both pressures, because it commutes |
| `ringcrawler` | **Ring-crawler** | new | a hare-sized hexapod that lives inside the bore in the comb band, licking the catch off the wet combs and the film off the walls, climbing against a 5 m/s draught on hooked toes; the lung's cleaner and the maw's food. Blind-ish, pale, the biome's most common animal and never seen outside but at a husk |
| `mouthmaw` | **Mouth-maw** | new | an ambusher that lies in the collar's shadow at a mouth with its gape to the exhale, taking what the breath delivers (ring-crawlers blown out, flue-riders, the Talovolci's goats): the mouth's hazard `hunter` (section 9); kin of the Rift's gapemaw |

The herds "have nothing to run from" is the owed gap in two kits (`biomes/hyperjungle/NOTES.md:77`); here the predator
waits where the road comes out.

## 9. Resources, crops, hazards, people

- **Water** is the resource. Every live mouth is a well of 4-20 m3 a day (section 3). *Proposed*: the Talovolci's crest
  hamlets stand one to a mouth, and a hamlet is named for its lung; the kit publishes each mouth's site and yield as plain
  data (`LUNG_SITES`, as swhighlands' pillar rim publishes `SWHI_PILLARS_SITE`), for `core/hamlet` to place on.
- **Crops** (`kits/crops`): the paramo's `shighlands` zone gains a `breath` zone (warmth cold, arid wet, `how:
  irrigated`): fog-watered terraces below each collar, the cold crops the Talovolci's Gaulish list wants (*proposed*
  from `LORE.md` 6.21: barley and oats for the feasting halls, weld and woad for the dyes, flax), and one native food:
  **dew coil** (the coil's cup, eaten raw; catalogued in `FRUIT.md`'s way).
- **Fibre and rope**: a ring sloughs its outer skin in sheets; the Talovolci's lung-stairs are lashed with rope twisted
  from it (the skin is the trumpet line's fibre, tough and wet-proof). *Proposed* as their trade good to Voth: rope that
  does not rot in the Ring Sea's air.
- **Food from the catch**: **comb cake**, the throat combs' catch scraped from a husk or a dead ring and pressed: a
  protein paste that is also every poison the hyperjungle's spores carry (the angel trumpet, the spider lily:
  `biomes/throne/NOTES.md`, station 3); the same plant, two uses, as the glass tower's pallidine
  (`biomes/ehighlands/NOTES.md`). A Talovolci knows which month's cake is safe.
- **Hazards** (`core/hazard`, every one a `core/tags` record with `tags.hazard` registered before it is drawn, cycled on
  `LUNG.breath` through `KHAZ.STATES['LUNG.breath']`): the **draw** at a bell and in the bore (`grab`, hold, danger .5 at
  noon with a `move` toward the bore, .1 at dawn, off at dusk), the **cold breath** at the bells on winter nights (`cold`,
  freeze, a mist that slows: `move`), the **film** on the bore's wall and the collar's apron (`slip`), the **sphincter**
  (a ring that closes with a walker inside holds in the dark: `pit`, hold, trigger `weight`, reset by the breath), the
  face (`fall`), the mouth-maw (`hunter`). The tell is the hour and the mist: steam at dawn, a cap cloud at noon,
  silence at dusk, cold fog at the bells before a winter dawn.
- **People**: the **Talovolci** (`LORE.md` 6.21; the Crag Men of the old polygon), the Cloud Giants, whose country this is,
  whose Spirladunon stands in the cloud belt 20 km from station 1, who revere the spiral and will not fell a mirror-handed
  tree. Settled (the owner, 2026-11-02; section 10): the lungs are their stairs and their wells, their learned order keeps
  the mirror-handed lungs, and their legionaries came home from Iziz up them. **The lungs are widely known as the convenient
  way up the Wall** (the owner, 2026-11-02): Voth below (40-60 km), the Vothic ports and **Torus**, the **Empire of Iziz**
  east (Pylon, Iziz), the caravans and the legion's recruiters all know the dark ribs for what they are, and the Talovolci's
  stairs are the toll road of the southern Wall. *Proposed*: Dalab's skinchangers came up the lungs when they raided for the
  Talovolci's blood (`LORE.md:877-879`), which is why the Talovolci watch the mouths.

## 10. The Talovolci's stairs (lore: settled in substance, *proposed* in wording)

The owner approved the stairs, the wells and the omen as proposed (2026-11-02: "talovolci proposals fine"), and that the
lungs are widely known as the way up. The names are still the owner's to supply from the Talovolci tongue sheet; the
sentences below are *proposed* wording for `LORE.md`, not written there.

*Proposed* for `LORE.md` section 2 (the mechanism as canon, the owner's yes of 2026-11-02): "On the southern Inner Wall's
scarp native colonies, the **cliff lungs**, stand as living flues from the hyperjungle's cloud sea to the paramo, three
kilometres long, breathing the jungle's saturated air up through themselves on the heat it gives back as it condenses and on
the sun on their skins; each is a coral-like colony of rings, every ring fixed to the air pressure it was born at, so the
Wall is banded by height; they are the Wall's wells and the only convenient way up it." *Proposed* for section 6.21: "**The
Talovolci's stairs** run up the cliff lungs; a crest hamlet stands at a lung's mouth and takes its name from it; a
mirror-handed lung is an omen, never climbed and never drunk from." *Proposed* for section 8: a southern highlands bullet
naming the cliff lungs beside the spiral biome. And the two corrections of section 5: Spirladunon, formerly Daridel; the
Talovolci are the Crag Men.

- **The stairs.** The Talovolci's villages are in the cloud forest and the godstep canyons (`LORE.md` 6.21,
  `biomes/godstep/PLAN.md`); their crest hamlets and summer pastures are on the paramo; the lungs are the way between. A
  **lung-stair** is a ladder of their red-fibre rope and timber lashed to a lung's ribs, with rests at every tenth ring where
  the ring's sphincter joint makes a shelf; a climb of three kilometres takes a day, in the warm breath, with water at
  every rest. A hamlet keeps its stair as a Gaulish people keeps a bridge: a champion's portion goes to whoever climbs it
  fastest at the summer feast.
- **The wells.** A crest hamlet stands at a mouth and takes its name from the lung: the hamlet at *Marios Bređos*, the
  great breath, is *Mariobređuelos*, "great-breath-well" (the words below); its terraces run below the collar; its
  learned order reads the year's weather off the lung's breath hours and the ring bands' colour.
- **The mirror lung.** A left-handed lung is an omen, as a mirror-handed tree is (`LORE.md:863-865`). *Proposed*: no stair
  is ever lashed to one, no hamlet drinks from one; its mouth is a *nemetos*, a sacred grove (the model's own word), where the learned order
  leaves the dead to the mouth-maw. The kit places one mirror lung in about forty (the shighlands' `MIRROR_EVERY` rule,
  scaled), and the host's preset finds it.
- **The road the raiders took.** Dalab's skinchangers came up the lungs disguised as climbers (`LORE.md:877-879`), and the
  Talovolci have watched the mouths since: a watch-hut at each great mouth, a horn, and a cut stair at the first sign.
  The Izani legion recruited at the foot of the stairs; the loanwords came back up them.


### The words (the owner's answer of 2026-11-03: "make up some words from Krator tongues")

Coined by the tongue's own rules (`lore/tongues-of-krator.html`, the Talovolci tab, on the rebuild branch): English roots
run through the Gaulish changes (nouns take *-os* one, *-oi* many, *-a* for some; *f* > *v*; *w* > *u*; the old *gh* of
*high*, *night* > *x*; *th* > *đ*, the tau gallicum; *sh*, *j*, *ch* > *s*, *g*, *c*; the article dropped), compounded the
Gaulish way (*ver-* over, great; *-dunon* a fort; *-magos* a field; the model's prefixes *Uxo-* upper, *Ande-* lower,
*Marios* great, *Levto-* left, below), and cut in stroke-groups along a stone's edge between two spirals turning the
forest's way. The model already names this country in the tongue (`tools/scale-model/smodel/river_names.py`: *Vindos
Rivros* the white-mist river, *Nemetos Brucos* the sacred-grove stream, *Clodos* the cloud sea, *Magos* the paramo plain,
*Dubnos* the deep chasm, *Gilva* a ravine), and the new words keep to that house style. Working names in the kit's tables
stay English; these are what the Talovolci say.

| Talovolci | Gloss | How it is built |
|---|---|---|
| **bređos** (pl. *bređoi*) | a breath; the breath | English *breath*: *th* > *đ*, *-os* |
| **Clivobređos** | the cliff lung (the whole colony) | *cliff* > *clivos* (*f* > *v*) + *bređos*: "cliff-breath". In the country simply *bređos*, as the river is simply *rivros* |
| **ringos** (pl. *ringoi*) | a lung ring, the colony's individual | English *ring* with *-os*; *Uxoringoi*, the upper rings; *Anderingoi*, the lower |
| **mouđos** (pl. *mouđoi*) | a mouth of a lung | English *mouth*: *th* > *đ* |
| **Andemouđos** | the intake bell at the foot | the model's *Ande-* (lower) + *mouđos*: "lower mouth" |
| **Uxomouđos** | the mouth on the crest | *Uxo-* (upper) + *mouđos*: "upper mouth"; *Mariomouđos*, a great mouth, the one a hamlet stands at |
| **Verbređos** | the noon breath, the roaring draw | *ver-* (over, great) + *bređos*: "the over-breath" |
| **Nixtobređos** | the cold breath, the winter night's reversal at the bells | *night* > *nixtos* (*gh* > *x*) + *bređos*: "night-breath" |
| **Clivodeuos** | the condensate, the lung's water | *cliff* > *clivo-* + *dew* > *deuos* (*w* > *u*): "cliff-dew"; what the collar weeps |
| **uelos** (pl. *ueloi*) | a well: a mouth's pool and its hamlet's water | English *well*: *w* > *u* |
| **-uelos** | the crest hamlets' name ending | a lung's name + *-uelos*: *Mariobređuelos*, "great-breath-well", the hamlet at *Marios Bređos*; beside *-dunon* (a fort) and *-magos* (a field) |
| **ladra** (pl. *ladroi*) | a ladder, a stair | English *ladder* with *-a* (as *uatera*, water): the lung-stair is a *bređoladra* |
| **Levtobređos** | the mirror lung, the left-handed one | *left* > *levtos* (*f* > *v*) + *bređos*: "left-breath"; never climbed, never drunk from |
| **nemetos** | a sacred grove, a sacred place | the model's own word (*Nemetos Brucos*); the mirror lung's mouth is a **Levtonemetos**, "the left-grove", where the dead are left to the maw |
| **Scinropos** | the lung-skin rope | *skin* > *scin-* (as in the tongue's *Scincangioi*, the skinchangers) + *rope* > *ropos*: the rope that does not rot |
| **Combocacos** | comb cake, the throat combs' catch pressed | *comb* > *combos* + *cake* > *cacos* (*k* written *c*): "comb-cake" |
| **combos** | a throat comb | English *comb* with *-os* |
| **huscos** (pl. *huscoi*) | a husk, a dead lung: the dry road | English *husk* with *-os* |
| **Gunglomagos** | the fall-out lawn, the jungle's seedlings on the paramo | *jungle* > *gunglos* (*j* > *g*) + *-magos* (a field): "jungle-field" |
| **Deuocoilos** | the dew coil | *dew* > *deuo-* + *coil* > *coilos*: "dew-coil" |
| **Mouđoclodos** | the cap cloud standing over a mouth at noon | *mouđos* + *clodos* (the model's cloud): "mouth-cloud" |
| **Ringocraulos** | the ring-crawler | *ringos* + *crawler* > *craulos* (*w* > *u*) |
| **Mouđomauos** | the mouth-maw | *mouđos* + *maw* > *mauos* (*w* > *u*) |
| **Bređoridos** | the flue-rider | *bređos* + *rider* > *ridos* |
| **bandos** (pl. *bandoi*) | a pressure band, the ring's birth colour | English *band* with *-os*: the Talovolci count a lung's *bandoi* as a traveller counts contours |

The owner's *-dunon* and *-magos* stand; the plan's earlier *-anatlon* (a Gaulish loan, not a word the tongue's rules make)
is withdrawn for *-uelos*, and *nemeton* is corrected to the model's *nemetos*. *Proposed* for a stair's foot-post, cut
between its two spirals: **SUB MOUĐU CLODOS, VER MOUĐU SKIOS**, "under the mouth the cloud, over the mouth the sky", on the
pattern of the tab's own stone ("SUB CLODU SPIRLA, VER CLODU SKIOS").

## 11. Stations

Each station takes its date and hour from `99-host-take.js`; the host's time control moves through the breath (dawn,
noon, dusk, the winter night). `LUNG.breath(t, W)` in -1..1 (the noon draw 1, dawn .3, dusk 0, the winter reversal -.2)
drives the mist, the cap clouds, the sphincters, the fringes, the collars' drip, the film's sheen band, the hazards and
the flue-riders together; the weather's wet and the season set its amplitude.

1. **The Mouths** (`dist/clivobredos.html`, px 790,1048: 3,001 m, 1.10 atm, +9 degC (21/-2), 925 mm, Dfb; the paramo's lip).
   A 5.2 km map on the crest: the lip running east-west, the face falling north through the cloud deck, four live mouths
   and a husk's top on the lip, their wells and collars, the fall-out lawns running away south-east, dew coils and rime
   caps at the lawns' edges, a Talovolci hamlet's site (published, not built) at the greatest mouth, the paramo's
   rosettes and a tor beyond; the Throne out of the cloud sea to the north. Set in spring. **The first ten seconds**: the
   camera stands on rimed turf in blue pre-dawn, the giant huge in the north-east over a white sea of cloud that fills the
   north to the horizon; the sun comes up over the Wall's shoulder and, one after another, the dark mouths along the lip
   begin to steam, the collars drip, the fall-out lawns go from grey to green as the rime melts off them, and a flue-rider
   drops out of the nearest mouth and sails away over the deck. The **noon** preset is the same place six hours on: the
   cloud sea burned back to the foot, the face bare and green, a cap cloud standing over every mouth, the sound of the
   draw, condors and gliders stacked over the lip. The **winter night** preset: stars, giantshine on the rime, the mouths
   silent and faintly steaming the wrong way, found by the warm air over them; nothing glows.
2. **The Bells** (`-bells`, px 790,1024: 529 m, 1.50 atm, +19 (26/13), 2,039 mm, Af; the foot). The foot of the face in the
   hyperjungle's canopy (read in place): six bells standing up among the crowns, gaping north, their fringes streaming
   inward, the lungs climbing out of sight into the cloud deck above, the talus and the first rings in the Wall's shade;
   the cloud sea forming round the camera at dawn and the **cold breath** preset (a winter dawn: cold mist pouring out of
   the bells into the canopy, the fringes streaming outward, rime on the holdfasts).
3. **The Stair** (`-stair`, px 790,1040: 2,023 m, 1.24 atm, +14 (22/5), 3,529 mm, Cfa; mid-face, the rain maximum). Inside
   the cloud: a ravine with two lungs up it, the spiral cloud forest climbing their lower rings, a Talovolci lung-stair
   lashed to one (a placement record, the ladder a prop), a husk across the ravine as a bridge, the condensation band's
   sheen travelling up the live lungs through the morning, ring-crawlers at a split ring, the fang glider going up inside
   (the camera can follow: the bore is a `KCAVERN` tube).
4. **The Husks** (`-husks`, optional, px 850,1038: the face east of the stations where a landslide took the lungs): a field
   of dead lungs lying down the talus in rings, pale and banded, the road through them, the first young lungs growing
   back from the foot, a mirror lung among them with the Talovolci's *Levtonemetos* at its mouth.

## 12. How it reads, and what it costs

- **Geometry.** A lung is a `KCAVERN` mass meshed as the module meshes any body (chunked, integer-hashed), about 40 segments
  round and a ring every 20-60 m: a 3 km lung at the near LOD is ~25-40 k triangles with its ribs in the normal map (the
  library's `organic.coil.ribbed` and the *proposed* `organic.lung.ring`), its bands in the shader (`LUNG.bandAt`: 0 extra
  tris), and a dozen in view are under half a million; the far lungs are `KFAR` lines on the Wall. The bells and mouths are
  the mass's flared ends. The cloud forest and the paramo are shighlands' and the hyperjungle's own budgets, read in place
  (the shighlands page runs its 5.2 km at the usual kit cost). Target: **under 6 M triangles and 60 draw calls per view**
  on the integrated GPU, measured as the Godthrone's `PERF.md` measures (its pages run 2-3 M tris, 20-35 calls).
- **The breath.** The mouths' steam and cap clouds are core/atmos's smoke kind on one emitter per mouth whose rate is
  `LUNG.breath`; the cloud sea is the shared deck; the cold breath is the same emitter run from the bells with a cold
  tint. No per-frame CPU work: everything reads the clock and the weather.
- **Motion.** Sphincters, fringes and the collar's drip move in the vertex shader (`BIO.animHook`, the `breath` mode the
  Gills propose: one scalar uniform), so a hundred rings cost nothing per frame. The **sheen band** (the condensation
  ladder's rung) is a height-windowed roughness term in the ring material on the same uniform: a wet band that climbs
  the lung through the morning. The flue-riders are `kits/fauna` orbit animals whose count follows the breath.
- **Light.** The shared sky; the face is lit from the north by the real sun path. The pressure bands are the biome's
  colour; at night giantshine on the rime and the pale husks is the whole picture: nothing in the biome glows (the owner).
- **Godot.** Everything above is data on the clock: the lungs are `KCAVERN` records (meshes exported), the breath a pure
  function with a GDScript twin, the hazards `Area3D`s on `cycle` with `stateFn`, the cloud deck already has its Godot
  field (`core/atmos/GODOT.md`), the wells `WATER` records. Nothing needs a builder to port.

## 13. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

Start from `biomes/shighlands` (the cloud deck, the scarp stage, the spiral rules) and `biomes/godthrone` (the newest
station kit on the full core with `KHAZ`). The modules the kit takes, by name, and for each it does not, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10-core-head`, `20-core-kit` (`BIO.INDEX_ITEMS`, LOD merge/fade/cull), `30-core-foliage` (ground tint, A2C, back-light, the one wind), `31b-core-leafset`, `32-core-variants` (`BIO.kin`: the flue-rider, the maw, the fringe), `33-core-fungoid` (`BIO.fung`: dew coils, rime caps, the collars, the fringe), `34-core-impostor`, `35-core-anim` (the `breath` mode, *proposed* with the Gills), `40-core-place`, `42`/`43-core-export(-host)`, `44-core-stage` | every species on the core's builders and items |
| `core/rand` | `KRAND` | every lung, ring, bell, coil and meadow cell (`KRAND.hash(world, ix, iz, salt)`); no sin hash, no stream |
| `core/tags` | `50`, `52`, `53` | every lung, ring, mouth, well, coil and hazard a record (`BIO.init({tags})`); the ring's birth pressure a tag |
| `core/space` | `KSPACE` | the keep-clear between lungs and the nearest-mouth index the meadows, hazards and riders read |
| `core/hazard` | `KHAZ` (`20-core-hazard.js`) | the draw, the cold breath, the film, the sphincter, the fall, the maw, each on `LUNG.breath` |
| `core/clock` | `KCLOCK` (`C.day`, `C.hour`) | the hour and the season, so the breath's phase is the sky's |
| `core/terrain` | `30-core-field` + brush (the inset on the face), `35-core-strata` + host shade (`megabreccia`, `crest`), `37-core-stacks` (`bell` *proposed*; `tor` on the lip), `38-core-relief` (`talus`, the strip fields; `scarp` *proposed*), `39-core-cavern` (`mass`, `tube`, `opening` door, `ledge`: the lungs and their bores), `42-core-frost` (the lip), `43-core-ground` (`KGROUND`, `clast` for the breccia), `44-core-farfield` + draw, `45-core-horizon` + shade | the face, the lungs, the paramo, the far Wall |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, the shared sky (`skyBiome`), `bindWeather`, height fog, `d-clouddeck` (the cloud sea), `3-particles` (the steam, the cap clouds, the cold breath) | the sky, the deck, the breath's mist, the light |
| `core/water` | `20`, `21`, `22`, `50`, `51`, `ext/54` + `54b` (`karstSpring`: the wells), `ext/57` (the audit) | the wells and their threads, the collars' wet fans, the paramo's tarn and bogs, wet ground |
| `core/host` | `FULL` (camera, loop, clock, panel, probe, inspector, marks, pictures, minimap) | the page shell; the probe checks section 16's invariants |
| `core/materials` | `record` (`KMAT`) and the generated pack (`materials.json`, `tools/textures/pack.py`) | every library set (section 15) |
| `core/export` | `07`, `09` | the krator-world container; the hazards section |

Not taken: `core/mask` (nothing is placed from a canvas), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`,
`core/furnish` (no settlement: the hamlet sites and the stairs' anchors are published as plain data), `core/lod` (the biome
core's runtime LOD covers it), `33b-core-bamboo`, `36-core-walker`, `37-core-traps` (no carnivorous plants: the hunter is
an animal), `38-core-fire`, `39-core-lean` (the shighlands' spiral, not the ehighlands' lean, is this Wall's rule), `KLAVA`,
`KBASIN`, `KSCOUR`, the season beyond its amplitude on the breath (one season a page). `kits/crops`: the `breath` zone and
the dew coil only; the terraces are the hamlet plan's.

`tools/check_core_use.py` runs before the first station is called done.

## 14. New in core (each small, each a proposal)

1. **`KRELIEF.scarp`.** A wall of given height along a polyline on a heightfield: benches, ravines cut back into it,
   buttresses between, a talus foot, a rim; `at` names the part (face, bench, ravine, talus, rim). Today every kit that
   stands on the Inner Wall (shighlands, the ehighlands' wet face, swhighlands' fan coast, the sedesert's shelf) draws
   its own; the lungs are the fifth, so the form is core. The lungs' centrelines follow its ravines and buttresses.
   **The owner (2026-11-02): build the scarp into the next scale model update.** So this is two things done together: the
   core form the kits draw, and the model-side scarp on the southern Inner Wall (section 5, the map to-do) sculpted into
   the next version's heights with the same profile, so the kit's face and the model's agree where the open world streams it.
2. **`KCAVERN` masses on a sloped centreline.** A `mass` today is a polygon between two heights; the lung needs a hollow
   body following a 3D centreline against a face (`pipe({pts, r, wall, lean})`: a tube void inside a tube mass, meeting
   the ground along one side, with `door`s at the ends and `ledge`s). Small: the tube SDF exists; the mass form does not.
3. **`KSTACKS` kind `bell`** (or the pipe's flared end): a flaring hollow mouth on holdfasts, `topAt` and `ledge` as the
   other kinds.
4. **`BIO.animHook` mode `breath`** (shared with the Gills: one proposal, two takers): a scalar uniform scaling a
   per-item displacement; here the sphincters' narrowing, the fringes' streaming, the drips; plus a height-windowed
   roughness term (the sheen band) driven by the same uniform.
5. **The cloud deck's day.** `ATMOS.cloudDeck` has a fixed `y`; the cloud sea stands at the foot at dawn and burns back
   through the day (`shighlands/NOTES.md`: "laps up against it every day"). *Proposed*: `deckLevel(t, W)` as a `[G data]`
   function of the clock and the weather the deck and `LUNG.breath` both read, so the deck and the breath never disagree;
   and the deck giving an `air` field (`core/atmos/README.md:267`: "the cloud deck gives none yet") so a walker in it is wet.
6. **`KHAZ` on an authored state from the kit.** `stateFn: 'LUNG.breath'` registered in `KHAZ.STATES` as the geyser kit
   registers its own; `grab` with `move` toward the bore for the draw; `pit` with a `weight` trigger for the sphincter. No
   new kind.
7. **`KFAR` lines with sprites.** The far lungs as dark lines on the Wall and their cap clouds as sprites scaled by the
   breath (the Gills ask for the sprites too).

Nothing else is new. The face is a `KFIELD` with an inset, the lungs `KCAVERN` bodies, the wells `WATER.karstSpring`, the
cloud sea the deck.

## 15. Textures

Read the library first (`core/materials/PLAN.md`). **Reuse:** `organic.pleat.skin` (the shade side), `organic.coil.ribbed`
(the bore), `organic.tendril.banded` (the fringe's roots), `organic.flesh.cells` (the collar), `organic.lichen.plates`
(the husks' crust), `rock.megabreccia`, `rock.basalt.flowbanded`, `ground.sphagnum`, `ground.puna`, `surface.cushion`,
`ground.turf.polygon`, `ground.mat.thermal` (the collar's wet fan), `card.ichu`, `card.fern`, `bark.wrung` and the
shighlands' sets read with its species, `stone.geyserite` (the weeping collar's crust where it dries).

**To source or generate** (generic ids; prompts below, paste-ready, to go into `core/materials/PROMPTS-NEEDED.md` on
approval; never a procedural stand-in without saying so):

- `organic.lung.ring`: the ring's sun-side skin, ribbed in a shallow helix. Tintable (the pressure band is the tint).
- `organic.comb.throat`: the throat comb, wet black. Full colour.
- `organic.husk.dry`: a dead ring's papery split skin. Tintable.
- `card.fallout.lawn`: the fall-out lawn's jungle seedlings, a cut-out on magenta.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: the living skin of a huge fleshy tube, taut and
slightly glossy, crossed by broad shallow ribs running diagonally at about
twenty degrees from vertical, each rib a smooth rounded ridge a hand wide
with a fine crease along its crest, the skin between the ribs finely
pebbled with small pores and faint branching veins just under the surface.
Keep colours natural but slightly muted and even, so the texture can be
tinted to different palettes without looking stained.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a wet black organic comb, thousands of short
soft black filaments (#141210) packed in dense parallel rows like a baleen
plate or a gill, beaded with clear water droplets, the rows wavering
slightly, with a few pale grey-green specks of trapped dust and pollen
(#9aa58a) caught between the filaments. Full colour: not tinted.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: the dried dead skin of a huge fleshy tube, thin,
papery and brittle, split along shallow diagonal ribs into curling flakes,
the surface crazed with fine cracks, dusty, with darker fibrous layers
showing where the outer skin has flaked off. Keep colours natural but
slightly muted and even, so the texture can be tinted to different
palettes without looking stained.
```

```
Flat sheet of cut-outs, square, 2048x2048, on a solid flat bright magenta
background (#ff00ff); no magenta, pink or purple anywhere in the subject; no
grey or white background. Flat, even, shadowless lighting. Subject: ten
separate clumps of young tropical seedlings as a lawn, each clump a crowd of
big soft cotyledons and first leaves in several shapes (round, heart-shaped,
palmate, strap-like), bright fresh green (#5fae3c to #8fd05a), a few clumps
yellowing and browning at the edges, no flowers, no soil. No text, no border,
no watermark.
```

Reference images to collect into `refs/`: cumulus towers against a mountain wall (the thing with no skin), solar updraft
towers (Manzanares), a termite mound's chimney cut open (a living flue that meters), colonial tunicates and a stolon'd
hydroid colony (one body of many), baleen and gill rakers (the comb), fog drip under a Monteverde cloud forest, a lava tube
skylight's breath on a cold morning (the siphon tree's precedent, kept separate), the southern highlands' `refs/` for the
spiral and the palette, Roraima's cliff from its talus.

## 16. Order of work

- **L0.** Done in substance (the owner's answers of 2026-11-02, section 17). Left: the Talovolci names from the tongue sheet;
  the texture prompts moved to `PROMPTS-NEEDED.md`; the proposed `LORE.md` sentences (section 10) written by the owner's
  hand; the scarp filed as a to-do for the next scale model update (section 5).
- **L1.** `LUNG.breath(t, W)` and `LUNG.bandAt(atm)` as `[G data]` with their node test (the four states against the clock
  and the weather; determinism; the band function monotone in pressure); the hazard records on it; the condensate yield
  function per mouth from section 3's arithmetic, tested against its numbers.
- **L2.** The ground: the face on `KFIELD` with its inset (the kit's own scarp until `KRELIEF.scarp` lands), the ravines,
  the talus, the lip; the cloud deck bound as shighlands binds it, with the deck's day if approved.
- **L3.** The lungs: the `KCAVERN` pipe form (or masses stacked until it exists), rings as records with birth pressures,
  bells, mouths, husks; placement from the ravines by `KRAND`; the bore walkable; the `breath` anim mode.
- **L4.** The breath itself: the mouths' steam and cap clouds, the cold breath, the sheen band, the collars' drip, the
  wells on `WATER.karstSpring`; station 1 with its three presets.
- **L5.** The flora: fringe, comb, dew coil, rime cap, fall-out lawn; the two kits read in place;
  stations 2 and 3; station 4 if wanted; the Talovolci's sites and stair anchors published as data.
- **L6.** `verify.py --assert` with the probe's invariants: every ring's band equals `LUNG.bandAt` of its birth pressure;
  every lung's rings are monotone in height and pressure; every hazard's state equals `LUNG.breath`'s; the noon preset shows
  steam at every live mouth and none at a husk, the winter-night preset shows it at the bells; nothing of shighlands
  roots on the `cliff` weight but a lung; the mirror lungs under one in thirty; each with a negative. `PORT.md`, the index
  tools, `tools/check_core_use.py`, `python3 tools/port_baseline.py`, the gallery.
- **L7.** `kits/fauna`: the flue-rider, the ring-crawler, the mouth-maw. `kits/crops`: the `breath` zone, the dew coil.
  `core/terrain`: `KRELIEF.scarp` with shighlands moved onto it, in step with the model's scarp in the next update.

## 17. The owner's answers (2026-11-02), and what is still open

The owner's words, verbatim: "mechanism can be canon; rings are a coral-like colony organism; the site is fine; talovolci
proposals fine; the lungs are indeed widely known as a convenient way up; yield is fine, but they should not glow; the spiral
rule does reach native life, and do build a scarp into next scale model update. spirladunon is the new name for daridel;
talovolci are the same as the 'crag men'". Taken question by question:

1. **The mechanism**: **canon.** A native colony that is a confined moist-convection flue, driven by condensation and the
   sun, with no vent under it. The `LORE.md` sentence is proposed in section 10; `LORE.md` itself is untouched here.
2. **The colony**: **a coral-like colony** of rings, each fixed to its birth pressure, the lung banded by height (sections
   1, 7).
3. **The site**: **stands.** The southern Inner Wall between Voth and Pylon as a band kit on the `s highlands` polygon, no
   polygon of its own.
4. **The Talovolci's stairs, wells and omen**: **approved as proposed** (section 10). The names: the owner (2026-11-03)
   asked for words made up from Krator's tongues, so section 10, "The words", coins them by the Talovolci tab's rules
   (*Clivobređos* the lung, *ringos*, *mouđos*, *uelos*, *ladra*, *Levtobređos*, *nemetos*, *Scinropos*, *Combocacos* and
   the rest); *-anatlon* is withdrawn, *nemeton* corrected to the model's *nemetos*.
5. **Who else knows**: **everyone.** The lungs are widely known as the convenient way up the Wall (section 9).
6. **The yield**: **stands** (4-20 m3 a day a lung).
7. **The mote lamp**: **struck.** Nothing in the biome glows (sections 7, 11, 12).
8. **The spiral**: **the rule reaches native life.** The right-handed helix and the mirror lung stand (sections 2, 3, 10).
9. **The scarp**: **build it, into the next scale model update.** `KRELIEF.scarp` and the model-side scarp together
   (sections 5, 14, 16).
10. **The Gills and the lungs**: **both kept.**

Lore facts applied: **Spirladunon** is the current name of the place the lore called Daridel (the model's marker at 800,1017
is right); the **Talovolci are the Crag Men** (the old polygon name is theirs).

Settled since (the owner, 2026-11-11): the folder is `clivobredos`, the Talovolci's word (it was `clifflung`; built under that name on
branch `claude/clifflung-biome` and renamed). Still open: whether the next model update's scarp takes the whole southern stretch (px 745-930) or
the stations' middle first.
