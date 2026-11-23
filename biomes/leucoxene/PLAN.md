# leucoxene: the plan (proposal, 2026-11-11)

**The Leucoxene**: white life on black lava. A native body whose partner is a crystal: it builds its skin from the
titanium dioxide that weathering leaves behind in basalt, and that skin, a photocatalyst, turns morning light, air and
melted frost into fixed nitrogen. The body sells that nitrogen to the plants downhill for sugar, so every white dish on a
black slope trails a green tail. The idea in one line: **a fertiliser factory that is also a pioneer**. On ground that is
dry, cold, high and new, it is the first thing that can make a living.

Status: **a proposal for the owner** (2026-11-11). Nothing is built, nothing on the model is changed and `LORE.md` is
untouched. The kit's name (`leucoxene`) and every species' name are working names, waiting for the owner's or the
Krator tongues' words. The owner asked (2026-11-11) whether a station on the Throne would fit, since the Leucoxene is the
first colonist of new lava: it does (section 5), and it is proposed as station 1.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/leucoxene/` (the usual kit layout: `src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`) |
| Kind | **a band kit**, like `biomes/clifflung`: no polygon of its own. Its life is read in place by the kits whose ground it grows on: the Throne's upper lee flank (station 1, a Throne station) and the Godthrone's titanium flanks (station 2, its own page) |
| Object | `LEUCO` (`build`, `dress`, `SPECIES`, `PLANTS`) on the `BIOME-API.md` contract; `LEUCO.wet(t, W, site)` and `LEUCO.yield(...)` as `[G data]` |
| Read in place | `biomes/throne` (station 1's ground, its flow model and flow ages, the upper flank's cushions and lichen), `biomes/godthrone` (station 2's rock recipe, its iron-eaters and crusts); nothing copied |
| Out of scope | the scale model (no edits); `core/simulation` (the trade in pigment and saltpeter is a later sim pass); `LORE.md` (section 9's sentences are proposed, for the owner's hand) |

## 1. The idea

### The partner is a crystal

The native lineage is a fungoid host that carries a partner, and the partner decides how the body lives: a photosynthetic
one in the light, a chemolithotrophic one in the dark (canon, the owner, 2026-11-02; `biomes/gills/PLAN.md` section 2).
The Leucoxene is the third kind of partner, and the first that is not alive: **anatase**, titanium dioxide, held as
nanocrystals in a dead outer rind.

Where it comes from:
- Basalt carries titanium, mostly in **ilmenite** (iron-titanium oxide) and dissolved in its glass. When basalt weathers,
  the iron leaves and the titanium stays: **titanium is immobile**. Weathered ilmenite becomes **leucoxene** (Greek
  "white stranger"), a fine white mass of anatase and rutile. Basaltic glass that weathers to palagonite is enriched in
  titanium the same way. Both are real, and both are why geologists use titanium as the fixed reference when they measure
  what weathering removed.
- The host etches the glass skins and the ilmenite grains of the flow it grows on, with acids at its root tips, keeps the
  titanium and lets the iron go. On the Godthrone the iron-eaters (`biomes/godthrone/PLAN.md`) do half of that work for
  it: **their waste is its food**.

### What the skin does

Anatase is a semiconductor with a band gap of 3.2 eV: it absorbs light shorter than about 387 nm (UVA) and turns each
photon into an electron and a hole at its surface. In a film of water:
- The hole oxidises water to hydroxyl radicals and, a step later, hydrogen peroxide.
- The electron reduces what is adsorbed on the crystal. On iron-doped titania, dinitrogen among it: **N2 to ammonia**.
  This was measured on Earth: titania and titania-bearing desert sands fix nitrogen in sunlight, iron-doped titania best
  (Schrauzer and Guth 1977; it has been studied since as an abiotic source of fixed nitrogen in deserts). Leucoxene from
  ilmenite is iron-doped titania.

The host does on purpose what that sand does by accident. The ammonium dissolves in the morning film; the film seeps
through pores in the rind into the living tissue beneath when the sun dries the surface. Hydroxyl radicals live
nanoseconds and travel nanometres, so the living layer a few micrometres under the crystals is safe.

### It sells nitrogen, it does not live on light

The skin is a nitrogen factory, not a power plant (section 3). The host gets its carbon and energy by trade: its fungal
threads run downslope into the roots of the plants that grow in its run-off, and it pays them nitrogen for sugar. The
mycorrhiza's deal and the legume's deal, turned round: **here the fungus is the fixer**.

### It levels, and it faces the sky, not the sun

The skin works only wet, and up here the water is the night's frost and dew. Frost forms on what faces the open night
sky (a surface open to the sky cools by radiation below the air) and stays longest on what is level. So the body is a
**dish**: a shallow, level bowl on a short stalk, its white face to the zenith whatever the slope under it, shunning
overhangs and walls. On a 15-degree flank the dishes stand level like saucers held out; on a flow front or a rille wall
they grow as **level shelves**, tier above tier.

The dish holds the melt as a film, and the white face keeps it cool, so the film lasts into the bright hours instead of
steaming off the black rock by mid-morning. The dish is tilted a hair downslope, so it overflows at one point of its rim.
That point is where everything downhill begins.

### How the slope reads: dish, collar, tail

- **The dish**: matte white with a faint blue cast, from a hand's width to four metres across.
- **The collar**: under the overflow lip, a strip of bare black rock tens of centimetres long. The overflow carries
  hydrogen peroxide, which lives longer than the radicals and bleaches and kills the lichen and moss spores where it
  lands, until the iron in the basalt breaks it down a short way on.
- **The tail**: beyond the collar, the overflow's ammonium and nitrate feed a green strip running straight downhill, the
  body's partners.
- **The dawn bloom**: in the dry months a rim of white salt (ammonium and nitrate efflorescence) frosts the dish's edge by
  mid-morning and is washed down the tail by the next wet morning, or the next rain.

From above, a black slope covered in white-headed tadpoles, every tail pointing downhill. On the ground, a sign: walk up a
green tail and you reach a white body. **Nothing glows** and nothing is iridescent: it is a day organism with no audience,
and its colour is its chemistry, as the Gills' is (`biomes/gills/PLAN.md` section 2).

## 2. Why it is alien, and why it is Krator's

**What a reader has not seen.** A living body whose working surface is a mineral catalyst it grew from the rock under it;
nitrogen fixation done by light on a crystal instead of by an enzyme; a pioneer that fertilises a slope in visible strips.

**The trends it extends:**

| Trend | How the Leucoxene carries it |
|---|---|
| The native body is a host for partners (canon, 2026-11-02) | the partner is a crystal: the smallest step past the rule, and it keeps the rule |
| Native life clusters on geology's energy (`biomes/throne/NOTES.md`, `biomes/godthrone/PLAN.md`) | its feedstock is the volcano's rock; it lives only on basalt, best on titanium basalt |
| Native forms answer one physical problem each, and a kit's family reads as one (`biomes/riftrim/PLAN.md`) | every species answers the morning film: how to hold it, level, cool, and spend it |
| Lineages cross kits as cousins (`BIO.kin`) | the dishes are cousins of the Throne's caps and the Godthrone's crusts, dressed white |
| Native life is the natives' armoury, medicine and trade (`biomes/throne/NOTES.md`) | a pigment, a disinfectant and saltpeter (section 8) |
| The Godthrone's iron-eaters (`biomes/godthrone/PLAN.md`) | the first two-step food chain on rock: iron-eaters take the iron, the Leucoxene the titanium they leave |

**A proposal it makes possible (lore, for the owner).** *The native lineage never evolved nitrogenase.* If so, native
life needs fixed nitrogen from somewhere, and the vents' ammonia is where it first got it: that is why native life
crowds the vents and under the plume. Earth life arrived with legumes and cyanobacteria, which is why "where Earth life is
strong, native life is a flavour". And the Leucoxene is **how the native lineage left the vents**: the one form that
makes its own nitrogen. One sentence that explains three things already in the notes, offered as a question in section
11, not written into `LORE.md`.

## 3. The physics, honestly

- **Light.** UVA below 387 nm is about 3-4% of sunlight: roughly 30-40 W/m² at noon in clear air, about 110 µmol of
  photons per m² per second. Up here there is more of it: at 0.8 atm the air's Rayleigh optical depth at 365 nm is about
  half the lowland's (1.6 atm), so the direct UVA under a sun 45 degrees high is about 1.8 times the lowland's.
- **Yield.** Six electrons make two ammonia from one N2. The quantum yield of photocatalytic N2 fixation on titania is
  small: 0.01-0.1% is generous for a natural surface. At 0.1%, three wet hours a morning, 150 working mornings a year:
  about 8 kg of nitrogen per hectare of white surface a year; at 0.01%, under 1 kg. That is **a desert biocrust's
  range** (about 1-10 kg N/ha/yr). With dishes on a tenth of a slope, the slope
  gets about 0.1-1 kg N/ha/yr, gathered into the tails. Slow, honest, and enough on ground where nothing else fixes any.
- **Energy.** None worth having: UVA is about a twenty-fifth of the light and almost all of it goes to heat. Hence the trade
  (section 1).
- **Water.** The upper lee flank of the Throne has about 140-160 mm a year and frost most nights (section 5); the warm
  month's mean is near +8 °C, so summer mornings melt the frost. Where the warm month's mean falls below about 0 °C the
  frost never melts into a film, and that is the upper limit: about 6.5 km on the Throne.
- **The lower limit is competition, not physics.** Below the cloud belt's top the air is wetter, the UVA is weaker,
  Earth's nitrogen-fixers and the glassfern and lehua take new flows in decades (`biomes/throne/NOTES.md`, the kipuka),
  and they shade a dish out. On the Throne the Leucoxene thins out below about 4.5 km.
- **Titanium.** Ordinary basalt carries about 1-3% TiO2; the Godthrone's high-titanium basalt (the Moon's high-Ti mare
  basalts are 9-13%) several times that. On the Throne, unless its upper flows are declared titanium-rich, the Leucoxene
  is **the thin-fed frontier**: smaller dishes, wider spacing. On the Godthrone it is **the heartland**: tables and
  white fields.
- **Peroxide.** Hydrogen peroxide is a known product of titania photocatalysis in water and decomposes on iron oxides
  within seconds to minutes; the collar's length is the distance the overflow runs in that time. Tens of centimetres, set
  per dish from its overflow rate.

## 4. Ideas considered and set aside

1. **Life on the giant's induced current.** Electrotrophs eating telluric current driven by the giant's tilted magnetic
   field. A 24 h orbit puts Krator about 194,000 km out (a Saturn-mass giant; it agrees with the giant's 30 degrees); a
   Neptune-like field tilted 47 degrees gives about 270 nT there, swinging every 48 h (a 16 h giant day against a 24 h
   orbit). That induces about 10 mV per km in the crust: about a picowatt per cubic metre. Too little to feed anything.
2. **Night photosynthesis by giantshine.** The full giant, 30 degrees across, gives about 4,000 lux at midnight on the
   side that faces it (geometric albedo about 0.44), short on red where methane absorbs. Real and Krator's own, and it
   could carry a biome; set aside here because it overlaps Korona's giantshine gorges and the east's giant-leaning plants
   (`biomes/korona/NOTES.md`, `biomes/ehighlands/NOTES.md`).
3. **Mirror chirality.** Native life built from the opposite hand of molecules to Earth's, so neither can digest the
   other. A lore-scale decision, not a biome; noted for the owner, not proposed here.

## 5. Where it is on the model (scale model 5.1, surveyed 2026-11-11)

Surveyed from `tools/scale-model/model/data` through `smodel/page.py` (5.1 canvas, 2 km a pixel). Pressure is
1.6 atm x e^(-h/8 km).

### The Throne's upper flanks (station 1)

The Throne's vent is at 5.1 px 846.98,834.22 (`DATA.vents[0]`, summit 10,916 m). Its flanks, by height band, within
40 px of the vent:

| height | atm | km² | rain (median) | mean °C | warm month °C | classes |
|---|---|---|---|---|---|---|
| 3.5-5 km | 0.94 | 2,684 | 345 mm | +3 | +16 | ET, Dfc |
| **5-6 km** | **0.80** | **1,288** | **251 mm** | **-5** | **+8** | EF, ET |
| 6-7 km | 0.71 | 1,000 | 157 mm | -11 | +2 | HT, EF |
| 7-8 km | 0.63 | 800 | 78 mm | -17 | -4 | HF |

The 5-6 km band by bearing: the north-east (45-90 degrees) is the driest, about 157 mm; the windward north-west and west
the wettest, about 300 mm. The plume leans south-east (`biomes/throne/NOTES.md`), so **the north-east is out of the ash
and under clear skies**: the upper lee of Mauna Loa, where the young flows stay black for centuries.

**Station 1's site: px 862.6,825.2** (bearing 60 degrees, 36 km from the vent): 5,630 m, 0.79 atm, 141 mm, mean -5 °C,
warm month +8 °C, ET. The slope there is about 15 degrees (527 m down over the next 2 km). A 5.2 km station spans about
5.3-5.9 km. To be confirmed against `ATMOS.siteAt` at the build.

### The Godthrone's titanium flanks (station 2)

The Godthrone's summit vent is at 5.1 px 849.85,1262.59. Its polygon is mostly airless: class O 248,888 km², HF 39,796,
EF 29,316, ET 5,280 (`biomes/godthrone/PLAN.md` section 1). The Leucoxene's band there is the ET and the upper Dsc/Dwb
at 4.5-6.5 km on the north-east shield, above Godstep's vent (5.1 px 892.8,1145.2, head step about 3.1 km, 1.08 atm;
`biomes/godstep/PLAN.md` section 1), below the dry-cold line the Godthrone plan holds. **The survey is owed**: a quick
radial pass from the summit ran into neighbouring regions (the Catch's hot floor) and is not quoted; the band needs the
polygon mask (`survey_biomes.py`) before a site is chosen.

## 6. The ground

- **Station 1: the Throne's flows of every age.** The Throne kit already lays flows by age with its own flow model (its
  `46`, read in place); the station takes five to seven flows from about 20 to 5,000 years, side by side across the
  slope, so **the succession is the station**:
  - under 30 years: bare black pāhoehoe and ʻaʻā, glass skins shining; nothing;
  - decades: the **paper** in the cracks and on the glass skins;
  - a century or two: the first **dishes**, small and far apart, their tails short;
  - five centuries and more: dishes with long tails, the tails starting to join;
  - the oldest flow: **tables**, the tails grown into meadow strips, and the white salt in the hollows at their ends.
  Each flow's age is a record, and every placement reads it (`KRAND` by cell and salt, never by draw order).
- **Station 2: titanium basalt.** The Godthrone's rock recipe (`KSTRATA` `tibasalt`, `rock.basalt.titanium`), older
  surfaces, leucoxene-speckled weathering rinds, the iron-eaters' red and the Leucoxene's white on the same black.
- **Frost.** `core/terrain` `42-core-frost.js` for the hoar on the rock at dawn; it is gone by mid-morning except on the
  dishes' white faces, which hold it longest.

## 7. The flora

| key | name (working) | what it is |
|---|---|---|
| `paper` | **paper** | the pioneer: a white film millimetres thick on glass skins and in cracks; no dish yet, its tail a hairline of moss |
| `dish` | **dish** | the body: a level bowl 0.1-1.5 m on a short stalk, one overflow lip downslope; the common form |
| `shelf` | **shelf** | dishes on walls (flow fronts, rille walls, tumuli), level brackets in tiers |
| `table` | **table** | the old ones, centuries old: 2-4 m level tables on thick stalks, on the oldest flows; their tails meadow strips |
| `tail` | the tail | not a species: a strip of the partners, laid from each dish's lip straight down the fall line, its length from the dish's yield |

The partners in the tails, read in place: on the Throne the upper flank's teal cushions, mosses and hardy grasses
(`biomes/throne`); on the Godthrone its crusts and riverweed (`biomes/godthrone`). Native partners closest to the dish,
Earth's grasses further down where the nitrogen has spread.

## 8. Fauna, resources, hazards, people

- **Fauna (`kits/fauna`, data first).** One grazer, a vertebrate-grade hexapod: the **salt-licker** (working name), the
  size of a goat, which walks the dishes at mid-morning licking the salt bloom off their rims: a lick that renews every
  day. It cannot eat the dishes (mineral and peroxide); it grazes the tails.
- **Resources (`kits/resources`).**
  - **Titanium white**: the crushed rind, the whitest pigment there is, for paint and glaze. A new good.
  - **Saltpeter**: the salt in the hollows at the tails' ends, accumulated over centuries in the dry; the existing
    `saltpeter` node. Saltpeter means gunpowder, so the white country is strategic, as Earth's guano and nitrate fields
    were. A scrape trade, not a mine: about a tonne of nitrogen per hectare per thousand years at the tails' ends, at the
    yield's upper end.
  - **Disinfectant**: crushed rind in water in the sun sterilises it; on a wound, it cleans.
- **Hazards (`core/hazard`, `KHAZ`).** The cold and the thin air are the Throne's and the Godthrone's own. New here:
  **glare** (a white slope under a hard sun at 0.8 atm: snow-blindness; people wear slit goggles), the **peroxide sting**
  (wet dishes at mid-morning burn bare skin a little), the **dust** (crushed rind is bad to breathe). The glare is the
  atmosphere's look first and a hazard second: `KHAZ` only if a page needs it to act.
- **People.** Who gathers the white and the salt on each flank is the owner's call (section 11). Nothing here is a
  settlement; the stations leave the hollows and the oldest flow's meadows for gatherers' camps.

## 9. Lore (proposed, for the owner's hand; `LORE.md` untouched)

- "On the high dry flanks of the volcanoes, Krator's own life grows white: dishes of a fungoid body whose skin is a
  mineral it takes from the rock, which turns morning light and frost into the nitrogen the slope below it lives on. Its
  rind is the whitest paint there is, and the salt it leaves is saltpeter."
- If the owner takes the nitrogenase question (section 2): "Krator's own life cannot fix nitrogen; it began on the vents'
  ammonia, and only the white dishes ever left."

## 10. Stations

1. **The upper lee** (a Throne station: `python3 build.py --station leucoxene` in `biomes/throne`, `dist/throne-leucoxene.html`;
   the Throne kit's ground and flow model, this kit's life read in place, as the kipuka reads the hyperjungle): the
   north-east flank at about 5.6 km (section 5), out of the plume. Five to seven flows of every age across the slope; the
   succession from bare black to tables and meadow strips (section 6). Presets: dawn (hoar on everything, the dishes
   whitest, the film forming), mid-morning (the film, the salt-lickers, the salt bloom on the dry dishes), noon (dry,
   glare, the plume far off in the south-east), night (frost, the giant low in the north-east, nothing glowing).
2. **The heartland** (this kit's own page, `dist/leucoxene.html`; the Godthrone's rock read in place): the titanium flank
   above Godstep, once the survey is done. White fields, tables, the iron-eaters' red beside them, the saltpeter hollows
   and a gatherers' scrape.
3. *(optional)* **The edge**: the Throne's flank at the cloud belt's top (about 4.5 km), where the dishes meet the
   glassfern and lichen and lose; the lower limit made visible.

## 11. For the owner

1. **The proposal as a whole**: the Leucoxene as a band kit, station 1 on the Throne, station 2 on the Godthrone?
2. **No nitrogenase** (section 2): does the native lineage lack it, so that it began on the vents' ammonia? A lore-level
   rule; the biome works without it.
3. **The Throne's upper flows**: ordinary basalt (the Leucoxene thin there, as proposed) or titanium-rich like the
   Godthrone's?
4. **Station 2's site**: the Godthrone's north-east shield above Godstep (proposed), or the Firebliss Range if its lava is
   made titanium-rich?
5. **Names**: the kit, the species, the salt-licker; from which tongue?
6. **Who gathers**: on the Throne's lee and on the Godthrone; and the pigment and saltpeter trade, for the sim later.

## 12. Core adoption (written before the first fragment, as `CLAUDE.md` asks)

| Module | Taken | For |
|---|---|---|
| `core/biome` | yes | `BIO`, the species contract, `BIO.kin` for the dishes as the Throne's and the Godthrone's cousins, variants, `BIO.INDEX_ITEMS` |
| `core/host` | yes | the page, the camera, the probe, the inspector and polygon tools |
| `core/tags` | yes | every dish, shelf, table and tail registered before it is drawn |
| `core/rand` | yes | `KRAND` by (world, cell, index, salt) for every placement; never draw order |
| `core/mask` | yes | `KMASK` for placement masks (flow age, slope, sky view); never `getImageData` |
| `core/space` | yes | `KSPACE` for spacing the dishes and keeping tails from crossing dishes |
| `core/terrain` | yes | the Throne's ground and flow model read in place (station 1); `KSTRATA` `tibasalt` and `KGROUND` kinds (station 2); `42-core-frost` for the hoar; `KRELIEF` for the flow fronts' shelves |
| `core/atmos` | yes | the sky, the clear dry weather, the frost nights, the glare's look; `ATMOS.siteAt` for each station's air |
| `core/clock`, `core/sched` | yes | the morning: `LEUCO.wet(t, W, site)` drives the film, the salt bloom and the lickers' walk |
| `core/hazard` | yes | `KHAZ`: the cold and thin air (existing); the peroxide sting and dust on the dishes |
| `core/materials` | yes | `materials.json`, `tools/textures/pack.py`, `KMAT`, `TEX` |
| `kits/fauna` | yes | the salt-licker, data first |
| `kits/resources` | yes | the existing `saltpeter` node; titanium white as a new good |
| `core/water` | no | no standing water; the film is the dishes' own state, not a water body |
| `core/simulation` | no | the trade is a later sim pass |

**Nothing new is needed in core.** Two pieces start in the kit and move to core only if a second kit wants them: the
levelling (a species option holding a face level whatever the slope) and `LEUCO.wet` (if `core/atmos` grows a dew and
frost field, the film reads it instead).

## 13. Textures

In the library: `rock.basalt.titanium`, `ground.sand.black`, `rock.palagonite`, `rock.laterite`, `ground.moss*`, the
Throne's 32 textures. To source or generate (prompts to `core/materials/PROMPTS-NEEDED.md` at L0):
- **`crust.anatase`**: a matte white mineral crust with a faint blue cast, micro-cracked like dried slip, granular at
  close range; tileable, albedo, normal, roughness.
- **`rock.basalt.leucoxene`**: black basalt with white leucoxene speckle and white-rimmed vesicles; tileable.
- **The dish's underside and stalk**: fungoid flesh, grey-brown, under a white lip.

## 14. Order of work

- **L0.** The owner's answers (section 11); the texture prompts into `PROMPTS-NEEDED.md`; station 2's survey.
- **L1.** `LEUCO.wet(t, W, site)` and `LEUCO.yield(dish, flowAge, ti)` as `[G data]` with their node test (the film's
  window against the clock, the season and the weather; the yield in section 3's range; determinism; each with a
  negative).
- **L2.** The species: paper, dish, shelf, table; the levelling; the tail laid down the fall line from each lip.
- **L3.** Station 1 in `biomes/throne`: the flows of every age, the succession by flow age, the presets.
- **L4.** The salt-licker in `kits/fauna`; the resources.
- **L5.** Station 2 on the Godthrone's rock; station 3 if wanted.
- **L6.** `verify.py --assert` with the probe's invariants, each with a negative: every dish's face within a few degrees
  of level whatever the slope; every tail runs downhill from its dish's lip and never crosses another dish; nothing on
  flows younger than the paper's age; density rises with flow age; nothing above the upper limit or below the lower; every
  collar bare; nothing glows. `PORT.md`, `INDEX.md`, `BIOME-API.md`, `KNOWN_ISSUES.md`, the index tools,
  `tools/check_core_use.py`, `python3 tools/port_baseline.py`, the gallery.

## Sources

- G. N. Schrauzer and T. D. Guth, "Photolysis of water and photoreduction of nitrogen on titanium dioxide", *Journal of
  the American Chemical Society* 99 (1977): N2 to ammonia on titania and iron-doped titania in sunlight, and on desert
  sands.
- Leucoxene as the alteration product of ilmenite, and titanium's immobility in weathering and palagonitisation: standard
  mineralogy and weathering geochemistry.
- Anatase's band gap (3.2 eV, about 387 nm), hydroxyl radicals and hydrogen peroxide from titania photocatalysis in water:
  standard photocatalysis.
- Biocrust nitrogen fixation, about 1-10 kg N/ha/yr: the dryland biocrust literature.
