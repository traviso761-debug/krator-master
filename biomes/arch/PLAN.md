# arch: the plan (proposal, 2026-11-11)

**The Arch** (`rmvthearch`, scale model 5.1), with **the Steaming Seamounts** (`rmvseamounts`) inside its south-western end:
Krator's one province of bare mantle (`kits/resources/GEOLOGY.md`, province 11, ultramafic: 8,169 cells of 4 km, about
131,000 km²). A chain of long fault-block islands on two parallel horst lines, with a drowned axial graben between them,
in a hot, wet, dense sea air at 17-29 degrees south. Green-black serpentinite under red laterite, white travertine below
every spring, black lava from the last rifting episode, and the sea steaming off the seamounts.

The owner asked for it on 2026-11-11: **"I do want earth plants here too where appropriate"** and **"Don't just stop
here but fully explore all possibilities an exposed mid ocean ridge offers."** So the plan is broad first (sections 1-4
take every lead and say what is kept and why) and narrows to stations after (sections 11-15).

Status: **a proposal for the owner** (2026-11-11). **Built so far** (2026-11-12): A1 (the chemistry, `tests/test-arch-chem.js`) and A3, station 1, the confluence (`dist/arch.html`, `verify.py --assert` on software GL); the other stations have site records only (`KNOWN_ISSUES.md`). Nothing on the scale model is changed; `LORE.md` is untouched (section
10 holds proposed sentences only); `core/simulation` is untouched (the nickel and jade trade is a later sim pass). Every
species' and place's name is a working name. Where the owner has not answered, the conservative default is taken and
marked **"default taken, owner to confirm"**.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/arch/` (the usual kit layout: `src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `KNOWN_ISSUES.md`) |
| Kind | a biome kit with stations, like `biomes/highrift` and `biomes/geyser`: one main page (`dist/arch.html`, the confluence) and one page per further station (`python3 build.py --station <name>`) |
| Object | `ARCH` (`[G data]`: the chemistry, the confluence gradient, uptake, the soil, the Earth-or-native rule, the rifting episode; section 3) and `ARCHB` (the species and placement on `core/biome`) |
| Read in place | `biomes/geyser` (the springs, sinter and terraces' drawing kinds by the WATER contract, not its code), `biomes/korona` (the carnivory rule `poor x wet x warm`), `biomes/gills` (the hydrogen flames: the candles' flame mesh on `core/atmos`) |
| Out of scope | the scale model (no edits; section 5 lists what its notes overstate); `LORE.md` (section 10 is proposed); `core/simulation` (the agromining and jade trade); the Crook and Copper Glacier (their own kits) |

## 1. Settle first: canon against the model

**The model** (`tools/scale-model/README.md`, 5.0 and 5.1, item 1; `smodel/nw_expansion.py`, `build_arch_midocean_ridge`)
calls the Arch "an exposed subaerial mid-ocean spreading ridge". **`LORE.md` section 2** says Krator has **"no plate
tectonics: one thick, unmoving shell"**, loses its heat through long-lived vents as a heat-pipe world does, and **"tides
crack the shell into rifts without moving it"**. A spreading ridge in Earth's sense is one edge of two plates moving
apart for 100 million years, its new floor carried away and destroyed at a trench. That cannot be on Krator.

### The proposal: the Arch is a tidal dilational band

A **dilational band** is a crack that opened and was filled from below, its two sides parted by a finite amount and then
stopped (Europa's bands are the type: 5-30 km wide, their floors new material that rose into the gap, with a central
trough and ridged flanks; Prockter et al. 2002). On Krator:

1. **The crack.** The giant's tide flexes the shell once a day (the Gills' canon, `biomes/gills/PLAN.md` section 1),
   and a long-lived upwelling under the north-western sea domes the shell into a broad swell: the swell is why the band
   stands above the sea at all, as Iceland stands on its plume. The tide's working fatigues the swell's crest along a
   line until it fails right through the shell. That line is the Arch.
2. **The opening is finite and local, and paid for nearby.** The horst crests stand about 60 km apart across the band
   (section 5): the shell has parted by tens of kilometres, not thousands. The width is taken up by shortening a few
   hundred kilometres to the south-east, in the **Western Boundary Cordillera** and **the Crook**, which the model already
   calls "a deep tectonic trough **squeezed** between the western crater wall and the towering Western Boundary
   Cordillera". One block of shell between the two has moved a few tens of kilometres and will stop; nothing subducts,
   nothing drifts, and the shell as a whole does not move. The canon holds.
3. **It opens in episodes.** Iceland's and Afar's rifts open in **rifting episodes**: Krafla 1975-84 (nine eruptions and
   about twenty dyke intrusions in nine years, the ground pulled apart by several metres), Dabbahu 2005 (a 60 km dyke and
   up to 8 m of opening in a few days; Wright et al. 2006), then centuries of quiet. The Arch does the same: one segment
   at a time, a few metres per episode, a few centuries apart. At that pace 60 km is some millions of years of episodes,
   so the band is old and still working; it is not a young wound.
4. **It is magma-starved, which is why the mantle is bare.** The heat pipe is focused (`LORE.md` section 2: the Throne,
   the Godthrone, the Rift and the vent fields take it), and the Arch lies far from all of them. A crack opening slowly
   over a cool upwelling draws up mantle that barely melts: Earth's **ultraslow ridges** (the Gakkel, the South-West
   Indian Ridge) do exactly this, and on their amagmatic stretches the floor is **peridotite with no crust over it at
   all**, pulled up along long detachment faults (Sauter et al. 2013, "smooth seafloor"). Where melt does reach the band,
   it comes out in fissure eruptions in short **magmatic segments**; between them the mantle is bare and the sea and the
   monsoon serpentinise it. This is what makes province 11.
5. **Core complexes.** Where a detachment has pulled the mantle up and out from under the old shell, the exhumed footwall
   stands as a smooth, **corrugated dome** (the Atlantis Massif, under the Lost City field; Kane's megamullion): the
   Arch's highest ground (1,456 m at px 314,168) is read as one.

**What it changes on the map: nothing.** The model's double ridge, axial trough and seamounts are kept as they are; only
the words change: "spreading ridge" reads "dilational band" in the kit and in the proposed lore, and the rift shoulders
are the cracked swell's lips. The Europa and Iceland pair, and the ultraslow ridges, are the analogues; the Oman and
Cyprus ophiolites show what the band's floor looks like when it is dry land.

**Proposed for `LORE.md` section 2** (for the owner's hand): "Once, in the north-western sea, the tides found a weak line
in the crest of a swell and cracked the shell right through. **The Arch** is that crack: a dilational band, not a
spreading ridge, opened some tens of kilometres in episodes centuries apart and paid for by the Cordillera's folds across
the Crook. The shell did not move; it parted, and the mantle came up into the gap."

### Magnetic stripes and the dynamo: default taken, owner to confirm

Earth's stripes record the field's reversals in new floor carried away from the axis. They need two things: **a dynamo
that reverses**, and **floor accreted across many reversals**. Krator's field is undecided: nothing in `LORE.md`,
`biomes/WORLD.md` or `core/atmos` names one. A body of Krator's size and density (a radius of about 4,800 km, an iron core)
with 2-5x Earth's heat flow could well run a dynamo, but that is the owner's call.

- **Default taken, owner to confirm: no stripes are drawn and nothing in the kit depends on a field.** The stripes are
  invisible to the eye anyway (a survey with a magnetometer would show them), so the choice costs the kit nothing now.
  If the owner gives Krator a reversing dynamo, the band's floor carries a few broad, symmetric stripes across the axis
  (a finite band records a few reversals, not a barcode): a lore fact for the Ancients' survey maps.
- **The giant's field cannot stand in.** Krator orbits inside the giant's magnetosphere, but at its distance (about
  194,000 km, outside Day's 2:1 orbit) a Saturn-class field is of the order of 0.5 microtesla, a hundredth of Earth's
  surface field. A magnetotactic cell's chain (a moment of about 1e-15 A m²) aligns when m B is well above k T: at 50
  microtesla m B / k T is about 12, at 0.5 it is about 0.1, so a giant's field this weak orients nothing.
- **Magnetite does not need a dynamo.** Serpentinisation makes magnetite (section 3), and lightning (the monsoon's
  storms) magnetises it: **lodestones** on the dome's crests (Earth's lodestones are lightning-struck magnetite).
  Kept: a lodestone pulls iron whatever the planet's field is. Whether it points north is the dynamo question again.
- **Magnetotactic life: set aside** until the owner decides the field (section 4).

## 2. The idea, and why it is Krator's

Two native ideas were agreed before the plan; the survey made a third certain.

### 2.1 Living on a pH difference: the confluence curtains

Bare mantle reacting with water (serpentinisation) makes springs at **pH 11 or more** (Oman's Ca-OH springs reach 11.9;
Barnes and O'Neil 1969; Neal and Stanger 1983). The band's magmatic segments make **acid sulphate water at pH 2-3**
(fumarole steam condensing with its H2S oxidised to sulphuric acid, as at Námafjall and Yellowstone's acid springs).
On the Arch the two run downhill side by side: the dome's springs pour off the exhumed mantle toward the graben, the
solfatara's acid streams run along the fissures, and where they meet they do not mix at once.

**The curtain** is a native organism that is a membrane: a sheet-body, 0.5 to 4 m tall and up to tens of metres long,
standing in the stream along the line where the alkaline water meets the acid, keeping the two apart and living on the
difference. It is Earth's **alkaline-vent theory of life's origin** grown into an organism (Russell, Hall and Martin;
Lane and Martin 2012): a natural proton gradient across a thin wall of iron-nickel sulphide.

- **The wall makes itself.** Where alkaline water carrying hydrogen and sulphide meets acid water carrying iron and CO2,
  a precipitate membrane forms at the interface on its own, as a **chemical garden** does: iron-nickel sulphide and
  green rust on the acid face, brucite and aragonite on the alkaline face. The curtain's skeleton is that precipitate,
  and the living tissue lines it and steers where it grows. So every curtain is **two-faced**: **glossy black-green** on
  the acid side, **chalk white** on the alkaline side, a living hem along its top where the water parts.
- **What it lives on.** Three things, each from one side: the **proton gradient** across the wall (for its ATP), the
  **hydrogen** from the alkaline side (its electrons) and the **CO2** from the acid side (its carbon). At pH 11 hydrogen
  is a stronger reducer (its potential falls 59 mV per pH unit) and at pH 3 CO2 is easier to reduce, so the wall lets the
  one drive the other, which is the core of Lane and Martin's argument.
- **Where it can stand.** Only where the two waters run **side by side and slowly**: a fast, turbulent meeting mixes
  them in metres and leaves nothing to live on. So curtains stand where the slope eases: in pools, on the graben's
  flat floor, below the travertine terraces' rims. A curtain holds a stream split, and its own growth makes the split
  last longer downstream: a field of curtains braids a meeting into long parallel channels, milky blue and rust red.
- **Distinct from the Rift battery.** The battery another session is planning is **electrons through a living wire**:
  current carried along a body over metres to kilometres. The curtain is **protons through a living wall**: a gradient
  across a wall under a millimetre thick; nothing is carried along it. One is a nerve the length of a valley, the other
  a cell membrane the size of a bedsheet. They do not look alike either: the battery is a line, the curtain a sheet that
  stands across the water.

### 2.2 Nickel hoarders on the serpentine barrens

Serpentine ground has too little calcium for its magnesium (a Ca:Mg ratio often under 0.2 against 2 or more on ordinary
ground), carries 1,000-5,000 mg/kg nickel with chromium and cobalt, and is short of nitrogen, phosphorus and potassium.
On Earth it carries stunted, endemic floras, rich in species found nowhere else. Some species **hoard** the nickel: a
**hyperaccumulator** holds over 1,000 micrograms per gram (0.1%) in its dry leaves.

- *Pycnandra acuminata* (New Caledonia): its blue-green latex is about 25% nickel by dry weight (Jaffré et al. 1976).
- *Phyllanthus balgooyi* (Palawan, Sabah): its phloem sap is up to about 16.9% nickel (van der Ent and Mulligan 2015).
- *Odontarrhena* (formerly *Alyssum*) on the Balkan barrens: up to about 3% in its leaves; the agromining crop.
- *Berkheya coddii* (Barberton, South Africa): up to about 3.8%.

Metal is **armour**: grazers and pathogens avoid it (the elemental defence hypothesis; Boyd and Martens). The blue-green
sap is the look. **Agromining** is the economy: farm the hoarders, burn them, sell the ash as nickel ore. A field yields
about 100-150 kg of nickel a hectare a year (Bani et al. 2015, Albania), and the ash runs 10-20% nickel, richer than a
mined laterite's 1-2%.

The native hoarders sit beside the Earth ones on **the canon fungoid-host rule** (`biomes/gills/PLAN.md` section 2: a
fleshy body with no leaves, flowers or wood, carrying a partner organism in its skin; a photosynthetic partner in the
light). The native body has no sap vessels, so it hoards nickel as a crust: **the verdigris caps** wear their nickel as
a green mineral skin over a pale flesh, and bleed blue-green when cut.

### 2.3 The ground is New Caledonia's, which the survey made certain

The survey (section 5) puts the Arch at **17.5-29 degrees south** (`ATMOS.siteAt`), tropical monsoon (**Am**, 97% of its
land), **+28 °C** mean, **1,550-2,180 mm** of rain, **1.6 atm** at the shore. That is New Caledonia almost exactly:
20-22.7 degrees south, a third of the island ultramafic, a tropical maritime climate, and the world's best-studied
serpentine flora and nickel ores. So the Arch's Earth life is **New Caledonia's ultramafic maquis**, not California's or
the Balkans' (those are Mediterranean and are dropped, section 4), and its ground has the look the owner will recognise
from photographs of New Caledonia: **red laterite earth over green-black rock, dark green scrub, white silica and
carbonate, and a turquoise sea**.

### 2.4 Why it is alien, and why it is Krator's

**What a reader has not seen.** A landscape where the water's colour tells its pH (milky blue alkaline, rust-red acid,
clear where it has been neutralised), split by standing two-faced walls; a scrub that bleeds turquoise; a red earth that
is nickel ore; flames that have burned in the rock since before the Ancients; a sea that steams.

**The trends it extends.**

| Trend (the files) | How the Arch carries it |
|---|---|
| Native life is vent-born and clusters on geology's energy (`biomes/throne/NOTES.md` 87-96; `biomes/godthrone/PLAN.md`) | the curtains live on the oldest energy there is, the one the alkaline-vent theory puts at life's origin: the mantle's own disequilibrium with water |
| Where Earth life fails, native life is the whole flora; where Earth life is strong, native life is a flavour (`throne/NOTES.md` 88-89) | Earth's tropical serpentine flora holds the barrens and the coast; native life holds the springs' aprons, the confluences, the solfatara and the flame clefts, where the water is too alkaline, too acid or too hot. The rule is a data function (section 3.5) and the verify asserts it |
| The native lineage is a fungoid host with a partner; the partner decides how it lives (canon, the owner, 2026-11-02) | the curtain's partner is a proton-gradient chemolithotroph; the verdigris cap's is photosynthetic; the seep comb's eats hydrogen. Three partners, one body plan |
| A kit's native family reads as one because its members answer one physical problem (`biomes/riftrim/PLAN.md` 109-113) | every native here answers **the chemistry of bare mantle**: too much magnesium and nickel, too little calcium and nitrogen, water too alkaline or too acid |
| Carnivory follows `poor x wet x warm` (`biomes/korona/NOTES.md` 276) | the serpentine barrens are the poorest wet warm ground off Korona: Earth's pitchers and sundews on the seeps (New Caledonia's *Nepenthes vieillardii* grows on exactly this) |
| Iridescence and glow are the native signature, where there is an audience (`rift/NOTES.md`; the Gills' break) | the curtains have no audience and no colour but their chemistry (black-green and white); the verdigris caps' green is their metal. The one iridescent thing is the seep combs' hydrogen-film sheen, which is physics (a thin film), not signal |
| Native fauna are vertebrate-grade hexapods, never insects (`kits/fauna/BIOME-FAUNA-PLAN.md`) | four hexapods (section 8) |
| Native life is the natives' armoury, medicine and trade | nickel from the hoarders, lodestone, jade, umber, hydrogen (section 9) |

## 3. The physics and chemistry, honestly

Each item here is a `[G data]` function in `src/40-biome-arch-chem.js` with a node test (section 14, A1).

### 3.1 Serpentinisation and the springs

- **The reaction.** Olivine and pyroxene plus water make serpentine, brucite and magnetite, and the iron's oxidation
  frees hydrogen: 3 Fe2SiO4 + 2 H2O -> 2 Fe3O4 + 3 SiO2 + 2 H2 (in sum with the magnesium end member, which takes the
  silica as serpentine and brucite). With CO2 about, some of the hydrogen makes methane.
- **Two spring types** (Barnes and O'Neil 1969; Oman's Neal and Stanger 1983; Paukert et al. 2012):
  - **Type I, Mg-HCO3**, the shallow water that has met rock and air: pH 8-9, magnesium-rich, no hydrogen.
  - **Type II, Ca-OH**, the deep water that has reacted out of contact with CO2: **pH 11-12**, calcium-rich, magnesium-
    and carbonate-poor, carrying **hydrogen (up to several mmol/kg) and methane**. It is this that steams with hydrogen
    and lays white travertine the moment it meets the air: Ca2+ + CO2 (from the air) -> CaCO3. Oman's pools grow
    calcite rafts on their surface in hours and their beds in years.
- `ARCH.spring(kind, seed)` gives a spring's water: pH, temperature (the dome's springs are warm, 25-45 °C; the
  solfatara's acid condensate 40-95 °C), H2, CH4, Ca, Mg, Fe, Ni, dissolved inorganic carbon.
- **Carbonation draws CO2 from the air.** Oman's peridotite takes up about 10,000-100,000 t of CO2 a year naturally
  (Kelemen and Matter 2008). The Arch's springs do the same: every terrace is air turned to stone.

### 3.2 The confluence: the arithmetic

- **The energy per proton.** 2.303 R T / F is **60.2 mV per pH unit at 30 °C** (the Arch's streams). Nine units
  (pH 11.5 against 2.5) is **about 540 mV**; eight is 480 mV. A bacterium's own proton motive force is 150-200 mV, so the
  confluence offers **2.7-3.6 times** what a cell builds for itself. That is 52 kJ per mole of protons at 540 mV, while
  one ATP costs about 50 kJ/mol in a living cell: in principle one proton per ATP, where an Earth cell spends three or
  four.
- **The body keeps its interior neutral.** No membrane holds a 9-unit difference across a single layer without leaking;
  the curtain's tissue sits between its two mineral faces at about pH 7, so each face carries **about half the
  gradient** (some 270 mV), close to what a cell's membrane is built for.
- **How much life a spring feeds.** A Type II spring of 1 L/s at pH 11.5 carries 3.2 mmol/s of hydroxide; neutralised
  against acid at 540 mV that is at most about **170 W**. At a 10% yield, 17 W per litre a second. A slow tissue runs at
  0.01-0.1 W/kg, so **a litre a second keeps 170 kg to 1.7 t of curtain**. The dome's springs are a few to tens of L/s:
  each feeds a curtain field of a few to some tens of tonnes; the curtains are a fringe, not a forest.
  `ARCH.curtainMass(flowLs, pHalk, pHacid, yield, rate)` gives it.
- **The hydrogen is the bigger fuel.** At 1 mmol/kg, 1 L/s carries 1 mmol/s of H2, worth about 237 W burned with
  oxygen; the gradient is not the largest energy here. The point is the gradient is free and needs no pumping, and with
  it the hydrogen can fix CO2 at neutral cost. The curtains use both.
- **Mixing.** Protons diffuse at about 9e-9 m²/s, so across a still interface the gradient blurs by only
  sqrt(D t), **about a millimetre in two minutes**: a laminar meeting holds its gradient over metres downstream. A
  turbulent one (Reynolds number in the thousands, the stream faster than about 0.3-0.5 m/s at these depths) mixes the
  two in a few channel widths. `ARCH.mix(alk, acid, f)` gives the mixed pH by charge balance (strong acid against
  hydroxide, with the carbonate system as the buffer: precipitation where CaCO3 or Mg(OH)2 is oversaturated) and
  `ARCH.canStand(meet)` says where a curtain can stand: **a pH difference of at least 5 across the meeting, both flows
  slower than 0.4 m/s, the water under 70 °C, and the acid side above pH 1** (below that, nothing lives; section 3.4).
- **Its colour is its chemistry.** The alkaline water is milky blue-white (suspended calcite and brucite; the Oman pools'
  turquoise in depth). The acid stream carries ferrous iron, clear grey-green where it is fresh and rust-orange where the
  iron oxidises (schwertmannite and jarosite crusts, Rio Tinto's colours). The mixed water below a curtain field is clear.

### 3.3 Nickel uptake and the serpentine syndrome

- **Soil.** Laterite over serpentinite (New Caledonia's ferralsols): total nickel 1,000-5,000 mg/kg (garnierite zones
  1-3%), Ca:Mg 0.02-0.3, nitrogen and phosphorus very low, pH 5-6.5 on the laterite, 7-8.5 on fresh serpentinite rubble.
- `ARCH.uptake(species, soil)`: leaf nickel follows a saturating uptake on the soil's available nickel (a Michaelis-Menten
  curve, each species with its own ceiling and half-saturation): an **excluder** stays under 100 micrograms per gram, an
  **indicator** tracks the soil, a **hyperaccumulator** passes 1,000 (the threshold), a **hypernickelophore** passes
  10,000 (1%; Jaffré's term). The test checks each Earth species against its published range.
- `ARCH.syndrome(soil)` scores the ground's stress: the Ca:Mg ratio, the nickel, the missing nitrogen and phosphorus.
  Stunting (maquis 0.5-3 m where the same climate on ordinary ground carries forest) follows it.

### 3.4 Where life stops (the Dallol lesson)

Dallol's hyperacid, hypersaline ponds (pH under 1, salt over 35%, up to 100 °C) **hold no life at all** (Belilla et al.
2019), though acid alone (Rio Tinto, pH 2) or salt alone does. The Arch has no salt pans (it rains 1,800 mm), but its
solfatara's throats are hot and acid: **below pH 1 or above 90 °C, nothing lives**, not even the native life.
`ARCH.lifeAt(pH, T, salt)` returns `none | native | earth` and the verify asserts it on every placed thing: the throats
are bare, the native life rings them, the Earth life stands back.

### 3.5 The Earth-or-native rule

The kits' rule (`biomes/throne/NOTES.md`): Earth life where it can live, native life where Earth life fails. Here it is
a function of the ground's chemistry, not of distance from a vent:

- **Earth** where pH 4-9.5, ground under 45 °C, no flowing spring water, the Ca:Mg ratio above 0.02 (the serpentine
  specialists' floor) and the ground not fresh lava younger than its pioneers' lag (section 7).
- **Native** where Earth fails and life does not stop: the springs' aprons (pH over 9.5), the acid ground (pH 1-4), the
  confluences, the hot ground (45-90 °C), the hydrogen seeps.
- **Both** in the barrens, where Earth's serpentine flora and the native hoarders grow side by side (the native hoarders
  are drawn to the richest nickel, Earth's to the rest).
- **None** below pH 1, above 90 °C, on lava younger than about five years.

`ARCH.lifeAt` and `ARCH.earthOk` are the rule; every placement asks it, and the verify asserts no Earth plant where it
says Earth fails.

### 3.6 The rifting episode

`ARCH.episode(segment, year)` is the band's clock: each segment (the model's magmatic segments, section 5) has a seeded
recurrence (250-600 years, Iceland's and Afar's range), and an episode lasts 2-10 years: **inflation** (the ground
rises over a shallow chamber), **intrusion** (a dyke runs along the segment: fissures open by 1-8 m, the graben floor
drops by up to 2 m, earthquakes), **eruption** (a fissure fountain line, 1-30 km, Laki-type curtains of fire; lava over the
wet floor), **quiet**. A page asks it for "the last episode was N years ago" to age its fresh flow; the game asks it for
the hazard (section 9). Deterministic from (world, segment, salt) through `core/rand`.

### 3.7 Krator's own numbers

- **Gravity 7.4 m/s²**: travertine rims and curtain walls stand about a third taller than on Earth before they fail; the
  terraces' steps can be 1.3x Earth's for the same rock.
- **Dense air** (1.6 atm at the shore, 1.33 on the summit): oxygen at 0.33 atm partial pressure at the shore. **Hydrogen
  burns readily and its flame is nearly invisible by day**, pale blue at night. The methane flames (Chimaera's gas is
  mostly methane with 7-11% hydrogen; Hosgormez et al. 2008) are the visible ones.
- **The tide.** The sea's tide is small and daily (Krator is locked to the giant; the daily nod of its eccentric orbit
  moves the sea a little). Default taken, owner to confirm: **about 0.5 m** in the sound, enough to expose the White
  Stacks' tops at low water.

## 4. Every lead, kept or set aside

Each lead in the owner's brief, checked against the Arch's climate (Am, +28 °C, 1,800 mm, 1.6 atm, 17-29 degrees S, no
ice anywhere) and Krator's canon.

### Iceland
| Lead | Kept? | Why |
|---|---|---|
| Krafla's rifting fires | **kept** | the rifting episode (3.6), station `sound` |
| Laki's fissure eruption | **kept**, scaled | a fissure line of spatter ramparts in the graben; its haze (laze where it meets the sound) |
| Thingvellir, the gjár | **kept** | the graben floor's open fissures, the main structure of station `sound` |
| Silfra (clear water in a fissure) | **kept**, changed | the gjár on the sound's shore hold clear water filtered through serpentinite: blue, alkaline, warm |
| Reykjanes' saline geothermal field | **kept** | seawater-fed hot brine where the axial fissures reach the sound |
| Námafjall's mud pots | **kept** | the solfatara: mud pots, fumaroles, sulphur, the acid source of the confluences |
| Rootless cones (Mývatn's pseudocraters) | **kept** | lava flowing over the graben's wet mangrove flats blows rootless cones: the monsoon makes the floor wetter than Mývatn's |
| Table mountains, hyaloclastite under ice | **set aside** (ice) / **kept** (hyaloclastite) | no ice on the Arch; hyaloclastite forms where the fissures erupt into the shallow sound and at the seamounts |
| Glacier outburst floods | **set aside** | no glaciers; the hazard that takes their place is the monsoon flash flood down the graben's gullies |
| Black sand plains | **kept** | the seamounts' tephra and the coast; black sand beaches (station `coast`) |
| Moss lava fields (*Racomitrium*) | **set aside** (climate) | a cold-climate moss; the tropical lava pioneers are Hawaii's (section 7) |
### Afar and Danakil
| Lead | Kept? | Why |
|---|---|---|
| Erta Ale's lava lake | **set aside** as standing | a lake needs a steady supply the magma-starved band lacks; one appears during an episode only (a data state, not a landform) |
| Dallol's acid salt ponds | **set aside** as a landscape, **kept** as the limit | the Arch is far too wet for an evaporite pan; the lesson that pH under 1 is sterile is `ARCH.lifeAt` (3.4) |
| Lake Assal below sea level | **set aside** | the graben is already drowned (the sound, 5-8 m deep) |
| Salt flats | **set aside** | 1,800 mm of rain |
| Fissure swarms opening in an episode | **kept** | `ARCH.episode` (3.6) |
### The ophiolites (Oman, Cyprus)
| Lead | Kept? | Why |
|---|---|---|
| The ocean-crust sequence on land | **kept**, re-read | the band's floor shows it where the episodes built it: sheeted dykes in the magmatic segments' scarps, pillow lavas at the sound's edge, gabbro rare, peridotite in the core complexes; the horsts' outer scarps show the old shell's stacked flows instead (`KSTRATA` recipes, section 6) |
| Oman's hyperalkaline pools, travertine, carbonate veins, carbon capture | **kept** | the dome's springs and terraces; white magnesite and calcite veins in the green rock |
| Umbers (Cyprus's iron-manganese sediment) | **kept** | brown pigment beds on the pillow lavas: raw umber is literally Cyprus's |
| Cyprus-type copper sulphides | **kept** | small massive-sulphide bodies on the magmatic segments, gossans over them (`rock.gossan`) |
### The Lost City and the core complex
| Lead | Kept? | Why |
|---|---|---|
| Corrugated domes | **kept** | the dome's whaleback ribbed along the opening direction (station `dome`) |
| Brucite and carbonate chimneys up to 60 m | **kept**, in the sound | chimneys need the spring water to meet seawater's magnesium under water: **the White Stacks**, in the sound below the dome, their tops awash at low tide. On land the springs lay terraces instead |
### Serpentinisation's chemistry
| Lead | Kept? | Why |
|---|---|---|
| Hydrogen and methane seeps, burning (Chimaera) | **kept**, not repeated | the Gills' candles are flames in a breathing throat on a cold mountain; the Arch's are **eternal flames in rock clefts in the rain**, Chimaera's own setting (it is in the Tekirova ophiolite): small, many, lit by lightning, unbothered by the monsoon. The flame mesh is the Gills' (`core/atmos`) |
| Hyperalkaline pools, calcite films, travertine, white veins | **kept** | 3.1, station `dome` |
| Native metals (awaruite, native iron), magnetite | **kept** | awaruite placers in the streams below the dome (Awarua, New Zealand); magnetite in every serpentinite; lodestones (1) |
### Resources and culture
| Lead | Kept? | Why |
|---|---|---|
| Chrysotile asbestos | **kept**, as a hazard and a good | the dome's shear zones; fireproof cloth ("salamander's wool"); its dust in the hazards |
| Nephrite jade at serpentinite contacts (pounamu) | **kept**, rare | where serpentinite meets the old shell's siliceous beds along the detachment: boulders in the streams, a cultural good (section 9) |
| Talc and soapstone | **kept** | carving stone (`stone.soapstone`) from the altered shear zones |
| Chromite | **kept** | podiform pods in the dunite, and with the laterite |
| Platinum placers | **kept**, small | in the streams below the dunite, as the Urals and the Chocó |
| Magnesite | **kept** | white veins and nodules; refractory brick |
| Verde antique | **kept** | the green-and-white serpentine breccia as building stone |
| Nickel laterite (garnierite) | **added** | the wet tropics weather peridotite into nickel laterite, New Caledonia's ore: the red earth itself is the mine |
### The life
| Lead | Kept? | Why |
|---|---|---|
| The confluence curtains | **kept** | 2.1, station `confluence` (the main page) |
| The metal scrub | **kept** | 2.2, station `barrens` |
| Life on hydrogen at the seeps | **kept** | the seep combs (section 7) |
| Carnivorous plants on nutrient-starved seeps | **kept**, changed | *Darlingtonia* is a cool-water Oregon plant and is dropped for climate; its lesson holds, and New Caledonia's own carnivores take the place: *Nepenthes vieillardii* (on ultramafic maquis) and *Drosera* on the seeps |
| Magnetotactic life | **set aside** | the dynamo question (1); the giant's field is too weak |
| Life at the edge of the polyextreme ponds, and where it stops | **kept** | 3.4 |
| Pillow-lava shores and tide pools | **kept** | station `coast` |
| The seamounts' steam | **kept** | station `coast` |
### Earth plants
| Lead | Kept? | Why |
|---|---|---|
| *Racomitrium*, lichens, lyme grass, birch and willow (Iceland) | **set aside** (cold) | replaced by the tropical lava pioneers: Hawaii's *Metrosideros*, *Dicranopteris*, *Stereocaulon* |
| Lupine as an invader | **set aside** | no invader is wanted; Farside's sea flora is the invasion story on this coast already |
| California serpentine (Jeffrey pine, Sargent and McNab cypress, *Streptanthus*, *Darlingtonia*) | **set aside** (Mediterranean, cool) | wrong climate by 15 °C; New Caledonia takes its place |
| New Caledonia's maquis (*Araucaria*, *Pycnandra*) | **kept**, the core of it | 2.3 |
| Balkan *Odontarrhena* barrens | **set aside** as wild | a Mediterranean genus; **kept as a crop only** if the owner wants a planted agromining field (section 9), where it would be grown, not wild |
| *Berkheya coddii* | **kept**, on the lee | a summer-rain subtropical plant (Barberton, 25 degrees S): on the drier Aw lee of the barrens |
| *Phyllanthus balgooyi* | **kept** | tropical ultramafic (Palawan, Sabah) |
### Hazards
All **kept** but the outburst flood (no glaciers): fissures opening, lava fountains, CO2 and H2S in hollows (Dieng's Sinila
crater, 1979, killed 149 people with CO2: a tropical precedent), hydrogen flames, alkali and acid burns, asbestos dust,
the steam vents and tsunamis of the seamounts, plus two the survey adds: monsoon flash floods and laze (section 9).

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-11)

Surveyed with `tools/scale-model/survey_biomes.py` on `tools/scale-model/model/data` and the region store's polygons
(`model/src/51-region-store.js`, `defRegs`), and by hand through `smodel/page.py`. Pressure is 1.6 atm x e^(-h / 8 km).
Latitude from `ATMOS.siteAt`'s frame (Voth's 4.23 px 446,690 at 40 degrees S, 84 km a degree; 5.1 px less (272, 330)).
To be confirmed against `ATMOS.siteAt` at the build.

### The Arch (`rmvthearch`)

| | |
|---|---|
| Polygon | 483,112 km², **land 131,016 km²** (32,754 cells of 2 km: the geology's 8,169 cells of 4 km), water 352,096; px 42,65-515,555 |
| Shape | a NE-SW chain about 900 km long of long fault-block islands on two horst lines, the drowned axial graben between them, an archipelago of smaller blocks at the south-west end; it joins the mainland at its north-east end (px ~500-560, 80-150) |
| Heights | p5 / median / p95 **7 / 69 / 704 m**; the top **1,456 m at px 314,168**. Land by band: 0-100 m 74,596 km² (57%), 100-250 m 21,888, 250-500 m 18,132, 500-750 m 11,216, 750-1,000 m 3,864, 1,000-1,500 m 1,320 |
| Climate | **Am 96.7%** (126,752 km²), **Aw 2.5%** (3,252 km², the lee); rain p5/median/p95 **1,553 / 1,804 / 2,180 mm**; mean **+28 °C**, warm month +29 to +34, cold month +19 to +25 |
| Air | 1.60 atm at the shore, 1.33 atm on the summit |
| Latitude | **17.5 degrees S** (the NE end, py 76) to **28.9 degrees S** (the SW end, py 555); 21 degrees at the middle |
| The axial graben | **drowned**: a sound 5-8 m deep and about 12 km wide between the horsts, from px ~170,342 to 535,108 (the model's six "axial rift lakes" are this water at -2 to -8 m). No inland lake stands above sea level |
| The horsts | across the graben at px 290,228: the north-western horst ~500 m, the south-eastern ~1,190 m, crests ~60 km apart; at px 381,172: ~590 m and ~290 m; at px 457,135: ~650 m and ~440 m |
| Vents | `DATA.vents` holds **two** in the polygon: the main Krakatoan caldera (px 176,322, rim +12 m, throat -680 m, r 32 km) and the south-west Surtseyan vent (px 166,338, rim -18 m, throat -540 m, r 24 km). `nw_expansion.py` sculpts **four** seamount cones (adding px 188,336 and 174,304) |

**What the model's notes overstate** (recorded, not changed): the README's "+500-2,050 m" horsts reach **1,456 m** on the
final heights (the sculpt's 2,050 m target was smoothed and scaled); "a central axial graben under 250 m" is a **sound
5-8 m deep**; "8 shallow phreatomagmatic vents" are **two** in `DATA.vents` and four in the sculpt. The kit uses the
heights as they are.

### The Steaming Seamounts (`rmvseamounts`)

33,776 km² polygon, land 10,860 km², heights p5/median/p95 2 / 16 / 189 m, Am, 1,678 mm, +28 °C, 23-24 degrees S. A
low island over the main caldera (a cone of 115-148 m at px 176,322-326), the Surtseyan caldera 3 km off its south-west
shore.

### The neighbours

The **tsunami coast** (`rmvyk62bgdvs3`, 483,208 km², the mainland littoral, Am 67% and Cfa 23%) faces the Arch across
the Steaming Sea; its notes give a "NE Arch-shielded shadow" where the scour is lowest. **The Crook** (Cfa to EF, up to
7.7 km) and **crookshore** lie south; **Copper Glacier** beyond the Crook; **Farside** (the Eternal State's coast, Farport
at px 294,588) across the sea to the south-east. No kit borders the Arch on land but the mainland at its north-east end.

### The station sites

| Station | Site (5.1 px) | Height | Air | Rain | Mean (warm / cold) | Class | Lat |
|---|---|---|---|---|---|---|---|
| `confluence` (main page) | **324,180**, the dome's south-east foot, 8 km from the sound | 183 m | 1.56 | 1,788 mm | +27 (+32 / +23) | Am | 20.0 S |
| `dome` | **318,178**, the dome's flank (summit 1,456 m at 314,168, 3 km NW) | 863 m | 1.44 | 1,616 mm | +24 (+28 / +19) | Am | 20.0 S |
| `barrens` | **258,246**, the south-eastern horst's lee | 155 m | 1.57 | 1,427 mm | +27 (+32 / +22) | Aw | 21.6 S |
| `sound` | **299,220**, the graben floor on the sound's shore | 7 m | 1.60 | 1,804 mm | +30 (+34 / +26) | Am | 21.0 S |
| `coast` | **167,336**, the seamount island's south-west shore, the Surtseyan caldera 3 km off | 2 m | 1.60 | 1,710 mm | +28 (+33 / +23) | Am | 23.7 S |

The dome's profile from the summit (px 314,168) to the sound's shore (329,188): 1,456, 1,265, 896, 749, 591, 444, 271, 275,
218, 76, 8 m: a 1,450 m fall over 50 km, the springs at its foot.

## 6. The ground and the landforms (`core/terrain`)

- **Rock.** Serpentinite (green-black, scaly, slickensided, white-veined) on the dome and the core complexes; peridotite
  (harzburgite, dunite) with a **buff-orange weathering rind** where it is fresh; **red laterite** (ferralsol, with an
  iron crust, cuirasse, on the plateaus and a green garnierite zone at its base) over both wherever the slope is gentle;
  basalt (pillowed at the sound, sheeted dykes in the magmatic scarps, a'a and pahoehoe on the episodes' flows);
  hyaloclastite and palagonite tuff at the seamounts. `KSTRATA` recipes: **`serpentinite`** (new: green-black with
  shear lenses and white veins), **`laterite`** (red over mottled over green), **`ophiolite`** (pillows over sheeted
  dykes over gabbro, for the magmatic segments' scarps), the existing basalt for the horsts' outer scarps.
- **Landforms.** The **corrugated dome** (`KRELIEF`: a whaleback ribbed along the opening direction, mullions 50-200 m
  apart); the **graben** (normal-fault steps toward the axis, `KRELIEF`); the **gjár** (open fissures 1-20 m wide, tens
  deep, en echelon); **spatter ramparts** and a **fissure flow** (`KLAVA` on the graben's floor from a line source, its age
  from `ARCH.episode`); **rootless cones** where the flow crossed the wet flats; **travertine terraces** below every
  Type II spring (`core/water` terraces); the **solfatara** (mud pots, fumaroles, sulphur, bleached acid ground);
  **eternal flames** in clefts; laterite **lavaka**-style erosion gullies (red amphitheatres where the laterite is stripped;
  New Caledonia's mines and Madagascar's lavaka); the **White Stacks** in the sound; **tuff rings and black sand** at the
  seamounts; **pillow-lava platforms** with tide pools.
- **Ground kinds** (`KGROUND`): `laterite`, `laterite.crust` (cuirasse), `serpentinite.rubble`, `travertine.alk`,
  `acid.bleached`, `sulphur`, `lava.fresh`, `sand.black`, `mangrove.mud` (existing kinds where they exist).

## 7. The flora

### The mixing rule

`ARCH.lifeAt` and `ARCH.earthOk` (3.4, 3.5) decide every placement. Earth's tropical serpentine and coastal flora hold the
barrens, the horsts and the shores; native life holds the springs, the confluences, the solfatara and the flame clefts;
the two share the barrens. The pioneers on fresh lava are Earth's (the wet tropics close a flow in decades) once a flow is
older than its lag; before that it is bare.

### Earth (New Caledonia's maquis; Hawaii's lava; the tropical shore)

| Species | Where | Why it is here |
|---|---|---|
| *Araucaria* (*A. rulei*, *A. muelleri*: the candelabra araucarias of the ultramafic maquis) | the barrens, the horsts' crests | New Caledonia's emblem on exactly this rock; the silhouette that says "serpentine" |
| *Agathis ovata* (the maquis kauri) | the barrens | a stunted kauri of the ultramafic maquis |
| *Gymnostoma deplancheanum* (a she-oak) | everywhere on the laterite | fixes nitrogen through *Frankia*: the answer to the N-poor ground |
| *Pycnandra acuminata* (sève bleue) | the barrens' wetter gullies | the 25% nickel latex: the blue-green bleed |
| *Phyllanthus balgooyi* | the barrens | a hyperaccumulator shrub, green sap |
| *Geissois pruinosa*, *Hybanthus austrocaledonicus* | the barrens | New Caledonia's other nickel hyperaccumulators: the maquis's mid layer |
| *Berkheya coddii* | the Aw lee only | a nickel hoarder of summer-rain grassland |
| *Costularia*, *Lepidosperma* (sedges) | the barrens' floor | the maquis's ground cover on laterite |
| *Dracophyllum*, *Grevillea exul*, *Codia* | the barrens | the maquis's flowering shrubs |
| *Nepenthes vieillardii*, *Drosera* | the seeps on the barrens | carnivory on poor wet warm ground |
| *Metrosideros polymorpha* (ʻōhiʻa), *Dicranopteris linearis* (uluhe), *Stereocaulon* lichen, *Nephrolepis* | fresh lava, by age | the wet tropics' lava pioneers (Hawaii) |
| *Rhizophora*, *Avicennia* | the sound's shores | mangroves in the sheltered graben |
| *Casuarina equisetifolia*, *Scaevola taccada* (naupaka), *Ipomoea pes-caprae*, *Spinifex* | black sand | the tropical strand |
| *Cocos nucifera* | the strand, the sound | drift-sown; default taken, owner to confirm (an Earth crop on an uninhabited coast) |

### Native (fungoid hosts; three partners)

| Species | Partner | Where | Look |
|---|---|---|---|
| **Curtain** (`curtain`) | proton-gradient chemolithotroph | standing in the confluences, `ARCH.canStand` | a wavy sheet 0.5-4 m tall, ribbed, glossy black-green on its acid face, chalk white on its alkaline face, a living pale-green hem along its top; in fields that braid a stream |
| **Hem moss** (`hem`) | the same, juvenile | where a curtain could stand but none has yet | low mineral frills along the meeting line, the curtain's young |
| **Verdigris cap** (`verdigris`) | photosynthetic | the barrens on the richest nickel, beside the Earth hoarders | a fungoid cap 0.3-2 m, a green nickel crust over pale flesh, bleeding blue-green |
| **Lime shelf** (`limeshelf`) | photosynthetic, alkaliphile | the travertine aprons (pH 9.5-11) | white-crusted shelves on the terrace rims, like Farside's spray coral's trick on a native |
| **Seep comb** (`seepcomb`) | hydrogen-oxidising (knallgas) | the hydrogen seeps and flame clefts, outside the flame | cream combs with a thin-film sheen where the hydrogen wets them |
| **Acid felt** (`acidfelt`) | iron-oxidising acidophile | the acid streams and solfatara ground (pH 1-4) | rust-orange and ochre mats and streamers (Rio Tinto's) |
| **Steam fan** (`steamfan`) | photosynthetic, thermophile | the steaming ground at the seamounts and solfatara (45-90 °C) | low grey-green fans in the steam |

## 8. Fauna (`kits/fauna`; vertebrate-grade hexapods, never insects)

The fauna brief's two grazers, one predator, one flyer and one water creature:

- **Verdigris browser** (grazer): a goat-sized hexapod that eats the nickel hoarders the other grazers shun, its blood
  and flesh turned blue-green and poisonous to eat; the agrominers' rival. Its kidneys store nickel as green stones.
- **Seam wader** (grazer): a stilt-legged hexapod that walks the confluences and scrapes the curtains' hems, keeping its
  feet on the neutral water between them; its legs are crusted white on one side.
- **Hollow waiter** (predator): a low ambusher of the graben's gas hollows that eats what the CO2 kills; it breathes in
  long pulses and lies with its head high above the gas.
- **Ash brooder** (flyer): lays its eggs in steaming ground at the seamounts and the solfatara and leaves them to hatch
  (Sulawesi's maleo and Niuafoʻou's megapode do this with volcanic heat).
- **Stack crawler** (water creature): a hexapod of the White Stacks that grazes the chimneys' brucite films.

Earth fauna on the coast: seabirds on the stacks and tuff rings, land crabs on the strand (default taken, owner to
confirm). All data first: `kits/fauna` records with biome tags, traits, diet, schedule scaffolding, before any drawing.

## 9. Resources, hazards and people

### Resources (`kits/resources` only where small and on its grade contract)

- **Nickel**: already a node kind (180 on the ultramafic province, `GEOLOGY.md`). The Arch adds **bio-ore** (the
  hoarders' ash, 10-20% nickel) as a good, and the laterite's garnierite as the node's ore look. No new node kind.
- **Chromite, cobalt, platinum placers, awaruite, magnesite, talc and soapstone, verde antique, chrysotile, lodestone,
  umber, nephrite jade**: goods and ground looks first; any one becomes a node kind only when a settlement needs it and
  only on the kit's grade contract. Default taken, owner to confirm: **none added in this pass**.
- **Hydrogen**: the seeps; the Gills' Geomancer line (only Yuni has the chemistry) holds here too.
- **Agromining**: wild gathering of the hoarders' leaves and caps by default; planted fields (the Earth hoarders, or
  *Odontarrhena* as a crop) only if a people is placed here (owner to confirm).

### Hazards (`core/hazard`, `KHAZ`)

| Hazard | Where | Data |
|---|---|---|
| Fissure opening, lava fountain | the graben in an episode | `ARCH.episode` |
| CO2 and H2S in hollows | the graben's gas hollows, the solfatara | a pool of gas by a hollow's depth and the wind (still air at night is the danger) |
| Hydrogen flame (invisible by day) | the flame clefts | a heat zone round each flame |
| Alkali burn (pH 11-12) | the Type II pools | by contact time |
| Acid burn (pH 1-3), scald | the solfatara, mud pots | `KHAZ` heat and acid |
| Asbestos dust | the dome's shear zones, dry season | dust on disturbance |
| Base surge, tsunami, steam explosions | the seamounts, the coast | the seamounts' state (later; the tsunami coast's physics is `DATA.tsunami_farside`) |
| Laze | where an episode's lava meets the sound | HCl and glass in the steam |
| Monsoon flash flood | the gullies and the gjár | the wet season |

### People: propose, don't decide

`biomes/STATIONS-MAP-5.1.md` puts the Arch in the expansion-pack ground where **who lives there is undecided**. The
neighbours on record: the Eternal State's Farside and Farport across the sea, and the **traders from over the sea** whom
no one on Krator has followed home (`LORE.md` 6.19). Proposals, each for the owner:

1. **Empty but for seasonal gatherers** (default taken, owner to confirm): nickel-leaf and jade gatherers from Farside's
   coast in the dry months, no towns, because the seamounts' tsunamis make ports rare.
2. **The sound as the one safe harbour**: the axial sound is sheltered by a horst on each side from the seamounts' waves;
   the over-sea traders could anchor there out of the State's sight, which would give the State a reason to watch the Arch.
3. **A jade people**, as pounamu is to the Māori: if a people is placed here, the green stone is theirs.

## 10. Lore (proposed sentences only; `LORE.md` untouched)

- Section 2: the dilational band (section 1's paragraph).
- Section 3.1: "**The Arch** is a chain of islands across the north-western sea on the two lips of a crack in the shell,
  the sea drowned in the crack between them. Its rock is the mantle itself, green-black under a red earth that is nickel
  ore, and its springs run milky blue and rust red."
- Section 8: "On the Arch the native life stands in the water: **curtains**, living walls in the streams where alkaline
  water from the mantle meets acid water from the vents, black on one face and white on the other, living on the
  difference. Earth's own serpentine scrub hoards nickel in its sap and bleeds blue-green."

## 11. Stations

| Station | Page | What it shows |
|---|---|---|
| **`confluence`** (main) | `dist/arch.html` | the dome's south-east foot: two Type II springs and their travertine aprons, the acid stream from a small solfatara, the meeting pool and the curtain field braiding the outflow into blue and red channels; seep combs at a flame cleft; maquis on the laterite behind |
| `dome` | `dist/arch-dome.html` | the corrugated whaleback of serpentinite, its springs and white terraces stepping down, the eternal flames in the clefts, a chrysotile shear zone, the red laterite plateau with candelabra araucarias |
| `barrens` | `dist/arch-barrens.html` | the nickel maquis in the Aw lee: red earth, green rock, Earth hoarders and native verdigris caps, pitcher seeps, lavaka gullies, the verdigris browser |
| `sound` | `dist/arch-sound.html` | the graben floor: gjár with blue water, the last episode's fissure flow with spatter ramparts and rootless cones on the mangrove flats, a gas hollow, the White Stacks in the sound |
| `coast` | `dist/arch-coast.html` | the seamount island: black sand, a tuff ring's cliff, a pillow-lava platform with tide pools, the Surtseyan caldera steaming offshore, the ash brooders' warm ground |

## 12. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

| Module | Taken | For |
|---|---|---|
| `core/rand` (`KRAND`) | yes | every placement and every seeded value (springs, episodes, curtains) by (world, cell, index, salt) |
| `core/tags` (`KTAGS`) | yes | every spring, curtain, plant and hazard registered before it is drawn |
| `core/biome` | yes | the species contract, `BIO.fung` for the native caps and curtains' hems, variants, LOD, `BIO.kin` |
| `core/biome` traps (`KTRAPS`) | yes | the pitchers and sundews carry trap records |
| `core/space` (`KSPACE`) | on the page (the biome core's binding) | the kit's own placement does not call it yet: curtains are spaced by walking the meeting's line, plants by KRAND cells (as highrift's). Wanted when the stations grow obstacles |
| `core/mask` (`KMASK`) | **no** | no canvas is read for placement at all: every plant asks the data functions (`ARCH.lifeAt`, `ARCH.earthOk`, the stage's `PH_AT`) directly |
| `core/terrain` | yes | `KGROUND` kinds, `KSTRATA` (new recipes), `KRELIEF` (dome, graben), `KLAVA` (the fissure flow), `KTHERM` (the hot ground and vents), `KFAR`, `KHORIZON` |
| `core/water` | yes | the springs' pools (`still`), the streams (`flow`), the meeting (`ext/55` confluence), the terraces (`ext/53`), looks (`ext/54`: the kit adds its looks to `WATER.LOOKS` from its own fragment), the sea (`open`) at the coast and the sound |
| `core/water/geyser` | yes | `WATER.spring` for the springs' boils and the mud pots |
| `core/atmos` | yes | the standard sky, the monsoon weather, the steam (particles), height fog in the graben. The eternal flames are the kit's own cones (89b): core has no flame module but the brazier's (KNOWN_ISSUES.md) |
| `core/host` (`KHOST`), `core/walk` | yes | the page, camera, probe, inspector, polygon tool |
| `core/hazard` (`KHAZ`) | yes | the gas hollows, the flames, alkali and acid, heat, asbestos |
| `core/shadow` | yes | the sun's shadows |
| `core/materials` | yes | `materials.json`, `tools/textures/pack.py`, `KMAT`, `TEX` |
| `core/export` | yes | the export profile |
| `kits/fauna` | yes (A5) | the five hexapods, data first |
| `kits/resources` | yes, read only | the nickel node and the grade contract; no new node kind this pass |
| `core/simulation`, `core/city`, `core/hamlet` | **no** | no settlement is placed (section 9); the trade is a later sim pass |
| `core/lod`, `core/minimap` | no | single-page stations, as the other biome kits |

## 13. New in core (each small, each a proposal)

1. **`KSTRATA` recipes** `serpentinite`, `laterite`, `ophiolite`: data added to the strata recipe table only if a
   second kit wants them; until then the kit passes its recipes to `KSTRATA` as options (default taken).
2. Nothing else. The water looks, the chemistry and the species stay in the kit; they move to core when a second kit reads
   them (the Gills' White Gills would be the first: they share serpentinisation).

## 14. Order of work

- **A0.** This plan; the texture prompts into `core/materials/PROMPTS-NEEDED.md` (section 15).
- **A1.** `src/40-biome-arch-chem.js` `[G data]`: `ARCH.spring`, `ARCH.mix`, `ARCH.gradient`, `ARCH.canStand`,
  `ARCH.curtainMass`, `ARCH.uptake`, `ARCH.syndrome`, `ARCH.lifeAt`, `ARCH.earthOk`, `ARCH.episode`, with
  `tests/test-arch-chem.js` (each check with a negative: a turbulent meeting refuses a curtain; pH under 1 refuses life;
  an excluder never passes 100 micrograms; an episode's state is the same for the same seed and different for another).
- **A2.** `src/41-biome-arch-sites.js` `[G data]`: the stations' numbers from section 5.
- **A3.** Station `confluence` (`dist/arch.html`): the ground, the springs and terraces, the acid stream, the meeting and
  the curtain field, the maquis and the seep combs; `verify.py --assert`.
- **A4.** Stations `dome`, `barrens`, `sound`, `coast`, in that order.
- **A5.** The fauna in `kits/fauna`; the resources' goods.
- **A6.** `PORT.md`, `INDEX.md`, `BIOME-API.md`, `KNOWN_ISSUES.md`, `tools/check_core_use.py`, the index tools,
  `python3 tools/port_baseline.py`.

**The verify's invariants** (each with a negative): every curtain stands on a meeting line where `ARCH.canStand` says
yes; the pH the page shows at a point is `ARCH.mix`'s; no Earth plant where `ARCH.earthOk` is false; nothing alive where
`ARCH.lifeAt` is `none`; every hoarder's leaf nickel is `ARCH.uptake`'s and over 1,000 micrograms; every spring has its
apron downhill.

## 15. Textures

In the library and used: `rock.laterite`, `ground.redsoil`, `ground.travertine.white`, `ground.travertine.acid`,
`mineral.crust.brucite`, `ground.olivine`, `ground.sulphur`, `ground.sand.black`, `rock.palagonite`, `rock.tuff`,
`stone.soapstone`, `rock.gossan`, `rock.basalt.*`, `ground.lava.*`, `ground.mat.thermal`, `bark.araucaria`,
`bark.mangrove`, `card.carnivore.monkeycup`, `card.naupaka`, `card.creeper.beach`, `card.palm.coconut`, `card.fern`.

To source or generate (prompts in `core/materials/PROMPTS-NEEDED.md` section 43): **`rock.serpentinite`**,
**`rock.peridotite.rind`**, **`mineral.travertine.brucite`** (brucite-and-carbonate travertine), **`rock.basalt.pillow`**,
**`rock.hyaloclastite`**, **`mineral.curtain`** (the curtain's two faces). Until they come the kit draws procedural
stand-ins, each listed in `KNOWN_ISSUES.md`.

## 16. Questions for the owner

1. The canon: is the Arch a **dilational band** (section 1)? And may `LORE.md` say so?
2. **The dynamo**: does Krator have a reversing field (stripes, magnetotaxis, compasses)? Default: undecided, nothing drawn.
3. **People**: empty but for gatherers (default), the over-sea traders' anchorage in the sound, or a jade people?
4. **Earth crops on an empty coast**: coconut and mangroves default to present; is that right?
5. **Agromining**: wild gathering only (default), or planted fields?
6. **The tide**: about 0.5 m daily in the sound (default)?
7. Names: the curtain, the verdigris cap, the stations; and which tongue names the Arch's places.

## Sources

- Prockter, L. M. et al. (2002), "Morphology of Europan bands at high resolution", *JGR Planets* 107.
- Wright, T. J. et al. (2006), "Magma-maintained rift segmentation at continental rupture in the 2005 Afar dyking episode",
  *Nature* 442. Krafla: Björnsson, A. (1985), *JGR* 90.
- Sauter, D. et al. (2013), "Continuous exhumation of mantle-derived rocks at the Southwest Indian Ridge for 11 million
  years", *Nature Geoscience* 6.
- Kelley, D. S. et al. (2001, 2005), the Lost City hydrothermal field, *Nature* 412, *Science* 307.
- Barnes, I. and O'Neil, J. R. (1969), *GSA Bulletin* 80; Neal, C. and Stanger, G. (1983), *EPSL* 66; Paukert, A. N. et al.
  (2012), *Chemical Geology* 330.
- Kelemen, P. B. and Matter, J. (2008), "In situ carbonation of peridotite for CO2 storage", *PNAS* 105.
- Russell, M. J., Hall, A. J. and Martin, W. (2010), *Geobiology* 8; Lane, N. and Martin, W. F. (2012), "The origin of
  membrane bioenergetics", *Cell* 151.
- Jaffré, T. et al. (1976), "*Sebertia acuminata*: a hyperaccumulator of nickel from New Caledonia", *Science* 193.
- van der Ent, A. and Mulligan, D. (2015), *Phyllanthus balgooyi* phloem nickel, *Chemoecology*; van der Ent, A. et al.
  (2015), "Agromining", *Environmental Science and Technology* 49; Bani, A. et al. (2015), *Plant and Soil* 397.
- Boyd, R. S. and Martens, S. N. (1992), the elemental defence hypothesis, *Oikos* 64.
- Belilla, J. et al. (2019), "Hyperdiverse archaea near life limits at the polyextreme geothermal Dallol area", *Nature
  Ecology and Evolution* 3.
- Hosgormez, H. et al. (2008), the Chimaera seep's gas, *Geofluids* 8.
- Le Guern, F. et al. (1982), the Dieng CO2 disaster of 1979, *JVGR* 12.
