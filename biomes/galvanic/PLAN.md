# galvanic: the plan (proposal, 2026-11-11)

**The Rift battery**: on the floor of the Great Rift, where the terminal sea falls back off metal-rich mud, the ground
oxidises into its own acid and runs red, and Krator's own life lives on the electric current between two sulfide
minerals. The idea in one line: **the life is the wire, not the battery**. Nature supplies the cell (a sulfide that sits
at a high voltage in acid touching one that sits low); the organism insulates the place where they touch, so the rock
stops short-circuiting itself, and routes the current through its own body instead.

Status: **a proposal for the owner** (asked for 2026-11-11), with station 1 built on it the same day (section 16). Nothing
on the scale model is changed and `LORE.md` is untouched: every lore sentence is *proposed* (section 10). `galvanic` and
every species' name are **working names**, waiting for the owner's or the Krator tongues' words. Where the owner has not
answered, the conservative default is taken and marked **default taken, owner to confirm**.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/galvanic/` (`src/`, `stations/`, `build.py`, `verify.py`, `tests/test-galvanic.js`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `KNOWN_ISSUES.md`) |
| Kind | **a band kit with its own station pages** (the Leucoxene's kind, section 0 of its plan, and High Rift's page frame): the battery's life (`GALV`: the species, the cell's physics, the placement) is one set of fragments any host can read in place; station 1 is this kit's own page because no host kit has the ground it needs (below) |
| Pages | `dist/galvanic.html`, station 1, **the Gossan Strand** (section 12). Later stations: `python3 build.py --station <name>` -> `dist/galvanic-<name>.html` |
| Object | `GALV` on the `BIOME-API.md` contract: `GALV.SPECIES`, `GALV.build`, `GALV.place`; the `[G data]` physics `GALV.cell`, `GALV.yield`, `GALV.acid`, `GALV.stream`, `GALV.season`, `GALV.store` (section 3), pure functions with a node test |
| Read in place | `biomes/rift` (the Rift's savannah trees on the hills past the poisoned ground: `BIO.kin`, riftrim's way; its strata recipe `rift` through `KSTRATA`); nothing copied |
| Out of scope | the scale model (no edits); `core/simulation` (the vitriol and ochre trade is a later sim pass); `LORE.md` (section 10's sentences are for the owner's hand); the animals' models (`kits/fauna`, data first, section 8) |

**Why a band kit and not a Rift station** (the brief asked for one or the other, and why). The battery is not a band of
height or climate but a geochemical setting: sulfide ore, a falling water line, oxygen. It can occur wherever ore meets
air and water: the Rift's terminal seas first, then other hosts (the Throne's vent country, the eastern Abyss's salt
lakes, any gossan over an ore body crossing a water table). So the life belongs in a kit of its own that hosts read in
place, as the Gills' life is read by the Godthrone, the Catch and Xanadu. Station 1 is still its own page rather than a
`biomes/rift` station because (1) the Rift kit's stations are built round its giant trees and the 1.9 atm jungle and
savannah (a 25 M triangle budget, `rift/PLAN-STATIONS.md` section 6), and the strand shares neither their ground nor their
flora; (2) a station inside `biomes/rift` would edit that kit's build and its readers' pages (ringisles, Hook, the open
world read it); (3) the strand needs only a few of the Rift's species, on its northern edge, and the riftrim kit already
shows how to read them in place (`BIO.kin`, its stations' `station.json`). **Default taken, owner to confirm**: if the
owner prefers the strand as a fifth Rift station, the page moves with no change to `GALV` (the kipuka's pattern: the host
builds the ground, this kit dresses it).

## 1. The idea

### How nature builds the battery

Zinc never occurs as metal in nature, so the cell is made of **sulfide minerals**. They conduct electricity (they are
semiconductors), and each sits at its own **rest potential** in acid. Against the standard hydrogen electrode, roughly:

| Mineral | Metal | Rest potential in acid |
|---|---|---|
| pyrite (FeS2) | iron | about +0.63 V |
| chalcopyrite (CuFeS2) | copper (with iron) | about +0.52 V |
| galena (PbS) | lead | about +0.3 V |
| sphalerite (ZnS) | zinc | about -0.24 V |

- **The couple.** Pyrite or chalcopyrite as the positive end (the cathode, where oxygen is reduced on the mineral's
  surface) and sphalerite as the negative (the anode, which dissolves: ZnS -> Zn2+ + S + 2e-) give an open circuit of
  about **0.76-0.87 V** in acid. Miners know the effect as **galvanic interaction**: sphalerite touching pyrite leaches
  several times faster than sphalerite alone, and the pyrite is protected.
- **The acid makes itself.** Pyrite meeting oxygen and water oxidises to sulfuric acid and dissolved iron:
  FeS2 + 3.5 O2 + H2O -> Fe2+ + 2 SO4 2- + 2 H+, and as the iron oxidises and settles as ochre, two more H+ each.
  The run-off reaches **pH 2-3**. Spain's **Rio Tinto** runs wine-red over orange iron terraces off a copper-zinc-iron
  ore body this way, as it has for millions of years.
- **Two field measurements to build on** (checked, section 17):
  - **An ore body crossing the water table is a battery.** Its top, in oxygenated ground, is the cathode; its depth, in
    reducing ground, the anode; the ore itself is the wire. Prospectors find such bodies by their natural
    **self-potential**, hundreds of millivolts at the surface (Sato and Mooney, *Geophysics* 25, 1960, the classic
    "geobattery" model; its mechanism was later debated, by Corry 1985 among others, and it is quoted here as the
    model, not as settled).
  - **Black-smoker chimneys carry a current.** A chimney's sulfide wall conducts electrons from the reducing vent fluid
    inside to the oxygenated seawater outside (Nakamura and colleagues, *Angewandte Chemie* 2010, on a Mariner-field
    chimney); in the Okinawa Trough the same group lit an LED with an in-situ fuel cell at a vent (Yamamoto and
    colleagues, 2013) and then measured current generated **spontaneously over hundreds of metres** of vent field
    (Yamamoto, Nakamura and colleagues, *Angewandte Chemie* 2017). A 2022 follow-up grew bacteria on that electricity
    alone ("*Candidatus* Thiomicrorhabdus electrophagus", Yamamoto and colleagues, *ISME Journal*). The brief credited
    the chimney-wall current and the LED to the 2017 paper; they are the 2010 and 2013 papers.

### The life is the wire

Left alone, a pyrite grain touching a sphalerite grain is a **short circuit**: the current runs through the contact,
the energy is lost as heat, and the zinc dissolves for nothing. Earth's precedents for doing better:

- **Cable bacteria** carry electrons a centimetre or more through their own filaments, from sulfide below to oxygen above;
- ***Acidithiobacillus*** and its kin take electrons straight from pyrite's surface;
- the **scaly-foot snail** of the deep-sea vents grows armour of iron sulfide;
- ***Geobacter*** stores electrons in its own cytochromes and spends them later: a capacitor of protein.

**The Krator version** is a native fungoid host (`biomes/gills/PLAN.md` section 2: the lineage is a host for partners,
and the partner decides whether the body lives on light or on redox; canon, the owner 2026-11-02) whose partner is a
**wire microbe**: a filament like a cable bacterium's, carrying electrons along conductive fibres in its sheath. The host
supplies the three things the filament cannot:

1. **The insulation.** It sheaths its roots on the sphalerite in **elemental sulfur**, the anode's own waste (sphalerite
   leaching leaves a sulfur skin that passivates it; the host lays it down on purpose, thick and continuous). Sulfur is
   one of the best natural insulators there is. Where a root crosses from sphalerite to pyrite the sheath breaks the
   contact: the two minerals stop short-circuiting through the rock and can touch only through the organism.
2. **The reach.** On the positive mineral it grows a body up out of the anoxic mud into the oxygenated acid water, and
   mineralises it with **pyrite and greigite** (the scaly-foot snail's trick): a conductive extension of the cathode,
   brass and black, carrying the oxygen-reducing surface to where the oxygen is.
3. **The store.** In bladders along the runners it banks electrons in mixed-valence iron (magnetite-like grains in a
   protein matrix, *Geobacter*'s cytochromes grown to the size of a fist), charged in the dry season and spent when the
   flood drowns the cathode in anoxic brine (section 3, "The season"). **A literal living battery.**

The filaments run the circuit; the host is the circuit board. The energy is taken where the electrons cross the host's
membranes on the way from anode to cathode (proton pumping, as in every respiring cell): the organism **lives on the
current through itself**.

### What it looks like

The ground is the first thing: a strand of grey-black sulfide mud gone rusty red at the surface, crusted white and blue
with the vitriols (zinc and copper sulfates bloom out of it as it dries), cut by red-wine streams that lay down orange
iron terraces as they go. On it, the life is **circuitry**: yellow sulfur cords running across the dark mud from one
mineral to the next, black crusts filling the contact lines in a pattern like a printed board, brass rods standing in the
streams with a pale frill at the top, and, round the old pools, knobbly black reefs with a peacock tarnish, centuries
old. Nothing glows. Nothing moves faster than the water.

## 2. Why it is alien, and why it is Krator's

### What a reader has not seen

- **A metabolism that is a circuit.** Every Earth chemolithotroph meets its fuel and its oxidant at one cell's surface.
  Here the organism's two electrodes are **minerals it arranges**, metres apart, and it lives between them as a load on
  the line.
- **The organism fixes the rock's short circuit.** The galvanic couple exists with or without it; what it adds is
  insulation. A landscape where the life's first act is to stop the ground wasting its own energy.
- **It mines.** The anode dissolves: the life eats the sphalerite and sends the zinc to the sea. A reef ten centuries old
  stands over a hollow where a zinc vein used to be.
- **A colour that is chemistry.** Red-wine water, orange terraces, white and blue vitriol, yellow sulfur, black and brass:
  every colour on the strand is a mineral's oxidation state.

### The trends it extends (what Krator's native life already does)

| Trend (the files) | How the battery carries it |
|---|---|
| Native life is vent-born and clusters on geology's energy: vents, heat, sulphur, iron, salt, glass (`biomes/throne/NOTES.md`; `biomes/godthrone/PLAN.md`) | its energy is a mineral couple; its body is iron sulfide and sulfur; its site is a vent field's relict ore. It does not need the sun |
| The native lineage is a host for partners; the partner decides light or redox (`biomes/gills/PLAN.md` section 2, canon) | the same rule with a third kind of partner: **an electric one**. The host's job is the same as ever: give the partner the place it needs (here: insulation, reach, storage) |
| Where Earth life fails, native life is the whole flora (`throne/NOTES.md`) | dissolved zinc and copper at pH 2 kill Earth's plants (zinc toxicity is the hard limit of mine-spoil revegetation); the strand is native life only, the Rift's Earth-lineage savannah stops where the acid stops (section 7) |
| Native forms answer one physical problem each (`biomes/riftrim/PLAN.md`; the Gills' breath) | every species here answers the circuit: how to insulate, how to reach oxygen, how to store charge |
| **The Rift: iridescence is the rule** (`LORE.md` section 8; `biomes/rift/NOTES.md`) | the reefs and masts are iridescent, and for once it is not a signal: it is **tarnish**, a thin oxide film on the sulfide (chalcopyrite and bornite tarnish to "peacock ore" on Earth). The Rift's rule, earned by physics |
| The Gills set aside "the wired marsh" (`biomes/gills/PLAN.md` section 4, item 2): cable bacteria at landscape scale, because it separated redox in space as Earth already does, and nothing in it needed Krator | **how this differs**: the wired marsh's electrodes were the mud's own redox layers and its wires were bacteria; the battery's electrodes are **minerals the organism arranges** (it chooses where the sphalerite and the pyrite meet, and insulates the rest), and its energy is a **galvanic mineral couple**, a cell nature built, not sulfide meeting oxygen. And it needs Krator: the Rift's terminal seas are where metal brines and a falling shore come together at 2.2 atm (below) |
| Krator's air is dense (`LORE.md` section 2: 2.2 atm on the Rift's floor) | 0.46 atm of oxygen at the strand: pyrite oxidises faster, the acid is stronger and the cathode better fed than on Earth's Rio Tinto (section 3) |

### Where it breaks a trend, and why the break is earned

- **No glow.** Glow is a native signature (`throne/NOTES.md`), and a battery seems to invite it. It is not earned: the
  cell's power is milliwatts a square metre (section 3), and light would spend it on an audience that does not exist.
  Nothing glows. A spark is not earned either: 0.8 V does not jump a gap.
- **Slow.** The Rift is the jungle Earth's flora never reached, tall and fast. The strand is lichen-slow: crusts, rods a
  metre tall, reefs grown over millennia. The power says so (section 3), and the contrast with the giant trees on the
  hills above is the point.

## 3. The physics, honestly

All of this is in `src/40-galvanic-cell.js` as `[G data]` functions, with `tests/test-galvanic.js` checking each number
quoted here, each check with a negative.

- **The voltage.** Open circuit: pyrite +0.63 V against sphalerite -0.24 V is 0.87 V; chalcopyrite against sphalerite
  0.76 V; galena against sphalerite 0.54 V. A cell delivers most power at about half its open circuit when its losses are
  ohmic: the organism runs its line at about **0.4 V**. Rest potentials shift with pH (about -0.06 V per unit on the
  cathode, less on the anode) and with oxygen; the function carries both, and the gap narrows as the water neutralises
  downstream; and above pH about 4 the minerals passivate (iron and zinc hydroxides coat them), so at pH 5 the cell is weak and at pH 6 it carries almost nothing. The cathode's oxygen supply saturates (o2 / (o2 + 0.1 atm)): a drowned cathode in anoxic brine starves.
- **The current.** Galvanic leaching of sulfide couples in acid runs at roughly **10-100 mA per m2 of contact**. At
  0.4 V that is **4-44 mW/m2** (the strand's best, 2.2 atm and +36 degC, is 100 mA/m2 and 44 mW/m2; Rio Tinto's air and warmth give about 45 mA/m2 and 19 mW/m2); the brief's 5-50 mW/m2 is the same range taken at 0.5 V. Sunlight on Krator's Rift floor
  gives a plant of the same area 2-4 W/m2 of net photosynthesis at 1-2% efficiency: **about a hundred times more**.
- **What that grows.** 20 mW/m2 is 630 kJ/m2 a year. A chemolithotroph turns about a tenth of its energy into biomass at
  about 20 kJ/g: **about 3 g of living matter per m2 per year**, a tenth of an Arctic lichen heath's. So the living part
  is a skin. The bulk is mineral, and it comes from the current, not the food:
  - **The reef is a cathodic deposit.** Every electron reduced at the cathode uses up an H+, so the water at the living
    surface turns less acid than the stream, and iron oxyhydroxide precipitates there (the chemistry of cathodic
    protection, and of Hilbertz's mineral accretion, which grows limestone on cathodes in seawater). By Faraday,
    50 mA/m2 is 16 mol of electrons per m2 a year, enough to drop about 5 mol (480 g) of FeOOH: **0.1-0.25 mm a year**
    of porous crust. A metre of reef is **4,000-10,000 years**. The reefs are as old as the strand's last great fall.
  - **The anode is eaten.** The same 16 mol of electrons dissolve 8 mol of sphalerite: about 0.8 kg of ZnS, **0.2 mm**
    of vein a year under each square metre of contact, and half a kilogram of zinc to the water. That is why the
    strand's water is poison, and why the reefs stand over hollows.
- **The acid.** Pyrite oxidation gives up to 4 H+ per FeS2 oxidised (2 directly, 2 more as the iron oxidises and
  settles). `GALV.acid` takes the rate (the exposed pyrite's area, the oxygen, the temperature: Arrhenius from +25 degC)
  and the water through it, and gives the pH, floored at about 1.6 where sulfate's buffer (HSO4-) holds it; at the
  strand's 2.2 atm and +36 degC the rate is about 2.7 times Rio Tinto's per unit of exposed ore. `GALV.stream` follows a
  stream down: rain and the sea's spray dilute it, so its pH rises with distance; **ochre drops out between pH 2.8 and 4**,
  where dissolved ferric iron can no longer stay up, so the stream lays its iron terraces in one band of its course, and
  its colour follows (wine-red at pH 2, orange over the terraces, clearing below).
- **The season** (the falling shoreline). The terminal sea is fed by the Rift's rivers and emptied only by evaporation:
  it rises in the wet season and falls in the dry. **Default taken, owner to confirm**: a swing of 1.2 m a year (Lake
  Chad's order; the model holds the sea at -2,600 m and the strand at -2,600 to -2,597 m, so a metre's swing floods or
  bares kilometres of it). `GALV.season(day)` gives the sea's level against its mean (lowest about day 70, highest about
  day 250: the southern summer's rains run in through autumn, with the year's day 350 the summer solstice, `LORE.md` section 2);
  the flooded strand is anoxic brine, the cathode drowns and the current falls to a trickle; the bared strand dries,
  its pores fill with air, and the current returns.
- **The store.** `GALV.store(day)`: the jars charge through the dry months on the surplus over the body's upkeep and
  spend through the flood, with a capacity that holds about 60 days of upkeep (*Geobacter*'s cytochromes hold minutes; a
  fist of mixed-valence iron is another matter, and the number is the plan's, not a measurement). A jar flat at the
  end of a long flood is a dead colony: the test checks that a 120-day flood kills one and a 50-day flood does not.
- **The tide (a question, not a given).** Krator's daily tidal flex is canon for the Gills' fissures over heat-pipe vents
  (`gills/PLAN.md` section 3). It could pump fresh acid and oxygen into the strand's cracked ore and flush the products out
  once a day, so the current would swell daily: the Gills' breath again. **Default taken, owner to confirm: not taken.** The
  strand is flat sediment over a sunken vent, not a fissure swarm, and a battery that breathes daily is a Gills idea; the
  battery's own rhythm is the season. `GALV.cell` takes an oxygen supply, so if the owner wants the tide, a daily term is one
  line in `GALV.season` and nothing else changes (section 18, question 1).

## 4. Ideas considered and set aside

1. **The black-smoker reef.** The battery on a live chimney field under the terminal sea, the vent fluid as the anode and
   seawater as the cathode, as the 2017 measurements show. Set aside for station 1: underwater, dark, and it is Earth's
   vent fauna again. It stays as a possible later station in the vent's deep (section 12).
2. **The lightning-fed marsh.** Life that stores lightning. A strike's energy cannot be caught by anything this slow.
3. **The glowing circuit.** See section 2: no audience, no power.
4. **A copper battery with native copper** (Keweenaw). Native copper is real on rift basalts (`kits/resources/GEOLOGY.md`
   favours copper on rift ground), but metal-and-sulfide couples are a faster, cruder cell that corrodes the metal in
   years; the sulfide couple's slow steady current fits the life better. Native copper stays a resource of the hills.
5. **Zinc as a resource node now.** See section 9: not small enough to be done honestly in this session.

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-11)

Read from `tools/scale-model/model/data` through `smodel/page.py` (`heights`, `water_levels`, the climate rasters `c`,
`p`, `tm`, `tw`, `tc`; the script is `tools/survey.py` in this kit). 5.1 canvas, 2 km a pixel; pressure is
1.6 atm x e^(-h/8 km). The regions' polygons are in the artifact's database, not the repo; the survey reads the model's
own classes and water instead (the `rift` polygon is old canvas px 163-615 by 1054-1314, `rift/PLAN-STATIONS.md` section 1,
so 5.1 px 435-887 by 1384-1644).

**The Rift's floor and its seas** (5.1 px 420-900 by 1370-1660):

| Class | km2 | median height |
|---|---:|---:|
| XV abyssal savanna | 39,384 | -1,668 m |
| XA abyssal jungle | 37,424 | -2,009 m |
| WX abyssal salt lake (the terminal seas) | 33,848 | -2,600 m |
| XS abyssal salt steppe (the brine shores) | small patches on the seas' rims | -2,600 m |

**The vents on the Rift's floor** (`DATA.vents`, small phreatomagmatic vents, scale 0.18, radius 1.6 px):

| px | floor | ground at the vent | class |
|---|---:|---:|---|
| 532, 1433 | -1,660 m | -1,531 m | XA |
| 609, 1534 | -1,474 m | -1,568 m | XA (beside `tube_rift_08`, the Southern Rift Basalt Tube Complex) |
| 750, 1551 | -2,224 m | -2,235 m | XV |
| 740, 1586 | -2,584 m | -2,352 m | XA |
| **801, 1573** | **-2,700 m** | -2,597 m | XV |
| 804, 1553 | -1,123 m | -1,110 m | Af |

**The eastern terminal sea** (the water body round px 790,1590): **9,272 km2**, px 758-873 by 1579-1616, level
-2,600 m (the model's floor value `lo`), Sauropolis on its western end (px 765,1596). Round it, **6,544 km2 of land
stands within 10 m of the sea's level** within 24 km of the water: the model's flat strand, which is where a metre of
sea level makes kilometres of shore.

**Station 1's site: the vent at px 801,1573 and the strand on its west.** The vent's crater floor is -2,700 m,
**100 m below the sea**: the model's heights stop at -2,600 m, so its pit exists only as the vent record; on the
ground it is a crater below sea level beside the shore, the Krator twin of the Red Sea's **Atlantis II Deep** (hot metal
brine over sphalerite, chalcopyrite and pyrite muds). Round it:

| Radius | Land | Water | Strand (land at or below -2,590 m) | Height range | Rain (median) | Mean | Classes |
|---|---:|---:|---:|---|---:|---:|---|
| 10 km | 324 km2 | 0 | 200 km2 | -2,599 to -2,247 m | 1,051 mm | +36 degC | XV 204, XA 120 |
| 20 km | 1,124 | 144 | 584 | -2,599 to -1,641 m | 1,051 | +36 | XV 756, XA 328, WX 24, XS 16 |
| 40 km | 3,644 | 1,384 | 1,228 | -2,599 to -302 m | 1,020 | +33 | XV 2,388, XA 676, Aw 308 ... |

At the vent: **-2,597 m, 2.21 atm** (0.46 atm of oxygen), **1,051 mm of rain, mean +36 degC, warmest month +40, coldest
+32**, class XV. The strand runs about 10 km north of the sea to the foot of the hills; the ground then rises to -2,034 m
within 10 km to the north and -1,211 m within 20 km. The sea's shore is about 16 km south of the vent at the model's mean (the strand rows 1574-1580 stand at -2,599 m, the water starts at row 1582).
Neighbours: **Tuatara** (Lizardmen village, px 818,1554, -1,704 m) 51 km north-east, **Sauropolis** (px 765,1596) 85 km
west-south-west on the same sea, Komodo (px 865,1617) 155 km east.

**What the page takes** (an ideal type of 5.2 km, High Rift's frame: it takes the model's numbers, not its pixels): the
page's centre at px 800.2,1572.4 (world 1,600,400, 3,144,800 m), the vent's crater in the page's south-east, the strand
across the middle at -2,600 to -2,596 m, the sea's edge along the south at the season's level, the hills' foot rising
to about -2,450 m along the north edge. **The page compresses the strand**: the model's 16 km from the vent to the water
are drawn as about 3 km, so the vent, the mounds, the terraces and the season's shore stand on one page. The strand's fall
is kept (about a metre and a half across it), which is what makes a metre of sea level move the shore by hundreds of metres. Sky at old-canvas px 528.2,1242.4. `ATMOS.siteAt` to be confirmed at the build
(section 16).

## 6. The ground (`core/terrain`, `core/water`)

- **The strand.** Metal-rich mud at the sea's level, laid when the sea stood higher and the vent was a submarine brine
  pool: grey-black sulfide mud (pyrite, sphalerite, chalcopyrite) under a rusted skin, cracked into polygons as it dries,
  the vitriols blooming white (zinc) and blue (copper) on the driest ridges. Wet where the sea's season reaches.
- **The mounds.** Relict sulfide mounds of the vent field (the chimneys' rubble, 10-50 m across and 3-12 m high), exposed
  as the sea fell, each now a little gossan: an orange-red iron cap over the ore, acid springs at its foot. These are the
  ore bodies crossing the water table (Sato and Mooney's batteries, at the scale of a hill).
- **The Deep.** The vent's crater, 100 m below the sea, holding **hot metal brine** (the Atlantis II Deep runs at about
  60 degC) at the sea's level: dense, still, anoxic, faintly steaming in the morning, its rim of sulfide mounds. The brine
  look (`WATER.lookDraw('brine')`, `core/water` ext/54) with its heat from `KTHERM`.
- **The acid streams.** From the hills and the mounds' springs south across the strand to the sea: wine-red at pH 2,
  laying **iron terraces** (orange rimstone, `WATER.terraces`) where their pH crosses 3 (`GALV.stream`), clearing to the
  brine-tinted sea. The water is `core/water` with the kit's own `acid` look as data (`lookOf` takes an object, so no
  core change, section 14).
- **The hills.** The strand's northern edge rising into the XV savannah: weathered rift fill (`KSTRATA` `rift`), red soil,
  and the Rift's own trees past the acid's reach.

## 7. The flora: native, the battery's

| key | name (working) | what it is | where |
|---|---|---|---|
| `crust` | **wire crust** | the common form: a black crust a few millimetres thick filling the contact lines where the mud's sphalerite and pyrite grains meet, in branching lines like a printed board; the living skin brassy where wet | the oxidising mud near the mounds, the stream banks; never under the flood line's anoxic brine for long |
| `runner` | **sulfur runner** | the insulated roots made visible: yellow cords of sulfur 1-4 cm thick across the dark mud from a sphalerite patch to a pyrite one, bundled where many cells share a line | over the mounds' flanks and the mud between them |
| `mast` | **brass mast** | a rod 0.2-1.4 m tall standing on pyrite in the streams and pools, armoured in pyrite and greigite (brass and black, peacock tarnish), crowned with a pale frill of the oxygen-reducing skin; the cathode carried up to the oxygen | in the acid streams and the pools at the mounds' feet, in the shallow water |
| `reef` | **cell reef** | the old ones: knobbly black mounds 0.5-3 m tall of cathodic iron crust round a core of dead masts, iridescent tarnish on top, the living skin on the windward and the wet side; thousands of years old | the pools and the streams' terrace bands, the Deep's rim |
| `jar` | **store jar** | a bladder the size of a fist to a melon on a runner, charged in the dry season (taut, dark, glossy) and spent in the flood (slack, wrinkled, greyer) | along the runners in the flood zone, the lowest strand |

**The partner** is the wire microbe in every one of them (section 1). **What does not grow here**: Earth's plants (the zinc,
the copper and pH 2), and the Rift's iridescent native jungle (it lives on light and on soil, not on the strand).
**Guests, read in place**: on the hills past the acid's reach, the Rift's savannah trees (`biomes/rift`: the baobab and
the dragon tree, by `BIO.kin`), so the line where the zinc stops is the line where the trees start.

## 8. Fauna (`kits/fauna`, data first; nothing drawn on station 1)

Vertebrate-grade hexapods only, never insects.

- **The ochre wader** (working name): a long-legged six-limbed wader the size of a heron, its feet sheathed in keratin
  thick against the acid; it walks the streams cropping the masts' frills (the only soft, living part), and finds the
  masts in the red water by their **electric field**, as a platypus finds a shrimp (electroreception: the one sense the
  battery earns). Proposed to `kits/fauna` with its record (diet: the masts' frills; activity: dawn and dusk; temperament:
  shy). Not drawn this turn.
- Nothing grazes the crusts or the reefs: they are mineral.

## 9. Resources, hazards, people

- **Resources** (`kits/resources`). The strand is a mine that makes itself:
  - **white vitriol** (zinc sulfate) and **blue vitriol** (copper sulfate), scraped from the efflorescence: mordants for
    dyeing, a wash for wounds, and blue vitriol a fungicide and a pigment;
  - **ochre and red oxide** from the terraces: pigment (section 10's lacquer);
  - **sulfur** from the dead runners: a small, clean source;
  - **zinc and copper ore** in the mounds (sphalerite, chalcopyrite).
  **Zinc as a resource node: default taken, owner to confirm: not added this session.** `kits/resources` places nodes from
  a baked prospectivity layer per family (`GEOLOGY.md`, "The families"; `tools/scale-model/geology.py`): a `zinc` family
  means a new layer in the bake, a rebake of `data/geology.json`, its ledger, the Godot golden vectors and every page that
  inlines the data. That is not small, and the grade contract (one byte per cell per family, the hash's grade) wants the
  layer, not a node definition alone. Proposed for the next resources rebake: `zinc` (sphalerite) with weights rift 120,
  volcanic 150 (the Gills' and the vents' fields), carbonate 90 (Mississippi Valley-type ore), plus `0.8 x copper` where
  the copper byte is over 100 (copper-zinc-iron massive sulfide, Rio Tinto's kind). Copper and iron nodes already favour the
  Rift; this strand is their best showcase.
- **Hazards** (`core/hazard`, `KHAZ`). **Acid** (the streams and pools at pH 2: skin burns, ruined leather), **poison**
  (no water on the strand is drinkable: zinc and copper), **the Deep's brine** (hot, dense and anoxic: a body that falls in
  does not float up clean, and a hollow over it can hold heavy gas on a still morning), **heat** (+36 degC mean in 2.2 atm:
  the Rift floor's own). Registered as tags on the records; the page's walk reads them.
- **People.** The strand is Lizardmen country (`LORE.md` 6.20): Tuatara is 51 km away, Sauropolis on the same sea. Nobody
  lives on the poisoned ground. *Proposed* (section 10): the Lizardmen's **oxblood lacquer** takes its red from the strand's
  ochre, and their Makers cut the vitriols; a caste of Tenders tends the oldest reefs as the reliquaries are tended. On the
  page: nothing that says who comes here, only cut faces on two mounds and a cleared scrape on the terraces (owner to
  confirm before anything is drawn: not drawn on station 1).

## 10. Lore (proposed, for the owner's hand; `LORE.md` untouched)

- For section 8 (Ecology), after the Rift's bullet: "**The Rift battery** (*proposed*, `biomes/galvanic`): on the strands of the
  Rift's terminal seas, where the water falls back off the old vents' metal muds, the ground turns to its own acid and runs
  red over orange terraces, white and blue with vitriol. Krator's own life lives there on the current between two
  minerals: black crusts, yellow sulfur cords, brass rods in the red streams, reefs thousands of years old. Nothing else
  grows on that poisoned ground, and nothing there glows."
- For section 6.20 (the Lizardmen), under "How they build": "Their oxblood lacquer's red is the terminal seas' ochre,
  scraped from the battery strands." (*proposed*: the owner's call whether the Lizardmen go there at all.)
- For section 8's lineage rule (if the Gills' proposed sentence is taken): "...a photosynthetic partner in the light, a
  chemolithotrophic one in the dark, **and on the battery strands of the Rift an electric one, carried in a body that is
  its circuit**."

## 11. How it reads, and what it costs

- **The look**: red, orange and black under a white-hot hazy sky; the brine-blue Deep; yellow lines and brass points on
  the dark mud. The hills' green savannah at the north edge is the only green on the page.
- **The cost**: the life is small and instanced (crusts as ground decals in the ground's paint, runners and masts as
  instanced items, reefs as a few hundred merged lumps). The page's budget is High Rift's: under 3 M triangles held.

## 12. Stations

1. **The Gossan Strand** (`dist/galvanic.html`; built 2026-11-11): the strand west of the vent at px 801,1573 in the dry
   season (the sea at its lowest), the Deep in the south-east, five mounds with their springs, three acid streams to the
   sea with their terraces, the hills' foot and the Rift's trees on the north edge. Presets: the strand at noon, a stream's
   terraces, the Deep, the mounds, the shore, from the hills, the flood (the season's wet half, by the day).
2. *(proposed)* **The Deep** (`--station deep`): down into the crater's rim at the brine's edge, the hot metal brine and its
   muds, the reefs on the rim, the vent's steam; the black-smoker reef as relicts (section 4, item 1).
3. *(proposed)* **The gossan hills** (`--station gossan`): an ore body crossing the water table on the hills, Sato and
   Mooney's battery at a hill's scale: the iron hat above, the reducing ore below, masts in the seeps on the line between.
4. *(proposed)* **Sauropolis's strand**: the same sea's western end beside the city (once the Lizardmen's use is settled).

## 13. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

| Module | Taken | For |
|---|---|---|
| `core/biome` | yes | `BIO`, the species contract, `BIO.kin` for the Rift's trees read in place, items, `BIO.INDEX_ITEMS`, LOD, impostors |
| `core/host` | yes | the page, the camera, the probe, the inspector and polygon tools, the panel (`KHOST.take`) |
| `core/tags` | yes | every crust patch, runner, mast, reef and jar registered before it is drawn |
| `core/rand` | yes | `KRAND` by (world, cell, index, salt) for every placement; never draw order |
| `core/space` | yes | `KSPACE` for the reefs' and masts' keep-clear and the kin trees' clearance |
| `core/terrain` | yes | `KSTRATA` (`rift` recipe on the mounds' and hills' faces), `KGROUND` (the ground's library layers), `KFAR` (the country past the page), `KHORIZON`, `KTHERM` (the Deep's heat) |
| `core/water` | yes | `WATER.open` (the sea, brine look; the Deep, brine look), `WATER.flow` (the acid streams, the kit's `acid` look as data), `WATER.terraces` (the iron terraces), `WATER.spring` (the mounds' acid springs), `WATER.fields` |
| `core/atmos` | yes | the shared sky at the site, the 2.21 atm air, heat haze, the weather (`bindWeather`, hot climate), height fog, rain cover |
| `core/hazard` | yes | `KHAZ`: acid, poison, heat, the Deep's brine |
| `core/clock` | yes | the day of the year drives `GALV.season` (the shore and the jars) |
| `core/materials` | yes | `materials.json`, `tools/textures/pack.py`, `KMAT`, `TEX` |
| `core/export`, `core/shadow`, `core/edits`, `core/minimap` | yes | through the host shell, as High Rift |
| `core/mask` | no | the placement masks are the stage's own functions of the ground (`BIO.mask`); nothing reads canvas pixels |
| `kits/fauna` | no (this turn) | the ochre wader is a data proposal (section 8) |
| `kits/resources` | no (this turn) | no node field on the page; zinc is a proposal for the next rebake (section 9) |
| `core/simulation`, `core/city`, `core/hamlet`, `core/camp` | no | no people on the strand; the trade is a later sim pass |

## 14. New in core

**Nothing.** The `acid` water look is data in the kit (`GALV.LOOKS.acid`), passed to `core/water`'s look functions as an
object (`ext/54`'s `lookOf` takes one). If a second kit wants it (the Throne's acid lakes, High Rift's springs), it moves to
`W.LOOKS` in `ext/54` with the next all-builds rebuild.

## 15. Textures

**In the library** (`materials.json`): `rock.gossan` (the mounds' caps), `ground.rust.terrace` (the iron terraces),
`ground.efflorescence` (the vitriol bloom), `ground.salt.ochre` (the strand's crust), `ground.sulphur` (the runners'
spill, the dead cords), `mineral.crust.ferromanganese` (the reefs' body, a stand-in), `ground.brown_mud_02` (the wet
strand), `ground.travertine.acid`, `rock.galena`.

**Owed** (prompts in `core/materials/PROMPTS-NEEDED.md` section 43; procedural stand-ins until they land, each named in
`KNOWN_ISSUES.md`):
- `ground.sulfide.oxidised`: the strand's mud, grey-black sulfide mud with a rust skin, cracked, yellow and white bloom;
- `organic.reef.galvanic`: the reef's skin, black iron crust with brassy pyrite knobs and a peacock tarnish;
- `rock.sphalerite`: resinous brown-black zinc ore with honey-yellow translucent grains, for the mounds' cut faces.

## 16. Order of work

- **G0.** This plan, pushed before any fragment (done 2026-11-11).
- **G1.** `src/40-galvanic-cell.js` (`[G data]`): `GALV.cell`, `GALV.yield`, `GALV.acid`, `GALV.stream`, `GALV.season`,
  `GALV.store`, the site record; `tests/test-galvanic.js` checks every number in section 3, each with a negative.
- **G2.** The station frame (`build.py` from High Rift's, with `tools/build_sources.py` and `report()`), the ground and the
  water: the strand, the mounds, the Deep, the streams and their terraces, the sea at the season's level.
- **G3.** The species (`50`) and their placement (`60`): runners between mineral patches, crusts on the contact lines,
  masts in the streams, reefs in the terrace bands and pools, jars in the flood zone; the Rift's trees on the hills.
- **G4.** `verify.py --assert` with the probe's invariants, each with a negative: every mast and reef stands in acid water
  (pH under 4, `GALV.stream`); no native life on ground the acid never reaches, no kin tree on ground it does; every jar
  below the year's highest water; the terraces lie only where the stream's pH crosses 2.8-4; nothing glows (no emissive);
  the sea's level is the season's. `PORT.md`, `INDEX.md`, `BIOME-API.md`, `KNOWN_ISSUES.md`, `tools/check_core_use.py`.
- **G5.** The owner's answers (section 18); stations 2 and 3; the wader in `kits/fauna`; zinc at the next resources rebake.

## 17. Sources (checked 2026-11-11)

- M. Sato and H. M. Mooney, "The electrochemical mechanism of sulfide self-potentials", *Geophysics* 25 (1960) 226-249;
  W. Corry's field tests (1985) disputed the mechanism; the "geobattery" model remains the standard reference.
- R. Nakamura, T. Takashima, S. Kato, K. Takai, M. Yamamoto, K. Hashimoto, "Electrical current generation across a black
  smoker chimney", *Angewandte Chemie International Edition* 49 (2010) 7692-7694 (doi 10.1002/anie.201003311).
- M. Yamamoto and colleagues, the in-situ fuel cell at an Okinawa Trough vent that lit an LED (JAMSTEC press release
  2013-09-03; *Angewandte Chemie* 2013).
- M. Yamamoto, R. Nakamura and colleagues, "Spontaneous and widespread electricity generation in natural deep-sea
  hydrothermal fields", *Angewandte Chemie International Edition* 56 (2017) (doi 10.1002/anie.201701768).
- M. Yamamoto and colleagues, in situ electrosynthetic growth on vent electricity, *The ISME Journal* (2022).
- Galvanic interaction in sulfide leaching (pyrite and chalcopyrite cathodic to sphalerite and galena), rest potentials of
  sulfides in acid, acid mine drainage chemistry, Rio Tinto, the Atlantis II Deep, cable bacteria, *Geobacter*'s
  cytochromes, the scaly-foot snail's iron sulfide sclerites, cathodic deposits and Hilbertz's mineral accretion: standard
  literature, quoted in ranges.

## 18. Questions for the owner

1. **The tide**: should the daily tidal flex pump the strand's ore (the current swelling once a day, a Gills-like breath)?
   Default: no; the season is the rhythm (section 3).
2. **The kit's form**: a band kit with its own pages (as built), or a fifth station of `biomes/rift`?
3. **The site**: the vent at px 801,1573 on the eastern terminal sea (as built), or nearer Sauropolis?
4. **Zinc**: add the `zinc` family at the next `kits/resources` rebake with the weights of section 9?
5. **The Lizardmen**: do they work the strand (the ochre for their oxblood lacquer, the vitriols), and may a page show it?
6. **The season's swing**: 1.2 m a year (default), or more?
7. **Names**: the kit, the five species, the wader; from which tongue (the Lizardmen's spiral script has no spoken names)?
8. **The gallery**: a new biome kit's page; publish it at the merge to `main`, as the rule says?
