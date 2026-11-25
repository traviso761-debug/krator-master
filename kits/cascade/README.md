# Cascade Kit (`kits/cascade`)

Procedural Three.js kit for **Cascade** (`568,841` on the Cascade River / *Kaskejt Rivr* in the Iron Republic), inspired by Paolo Soleri's **7. Arcvillage I** (*Arcology: The City in the Image of Man*, 1969 — see `reference/sheet1-site-and-crown.png`, `sheet2-plans.png`, and `sheet3-elevation-section.png`): a **hydropowered industrial-agricultural arcology** where an elevated southern headrace aqueduct (`y = 31.8 m`) feeds a roaring `32.6 m` waterfall cataract inside a **Great Central Industrial Hall**, surrounded by 14 planned interior storeys (`work`, `civic`, `living`, and `rec`), tailrace sluice locks, moored cargo barges, and irrigated Twin Circular Vegetable & Orchard Gardens.

## Three States

1. **`refurbished` (`republican`, Iron Republic centerpiece at `(0, 0)`)**: Reclaimed hydropowered industrial-agricultural arcology ready to anchor Cascade (`openworld/RESOURCES-SETTLEMENTS.md`). Features the arched Southern Elevated Headrace Aqueduct Viaduct, South Headgate Tower, 3 central waterfall cataracts, 4 spinning `r = 6.2 m` overshot hydro-wheels, 4 vertical bevel-gear drive-shaft towers, 5 overhead belt-and-pulley line-shafts, twin high-pressure penstocks, 4 scroll-case hydro-dynamos with glowing arc busbars climbing the 4 inner column-towers, 2 reciprocating cam-driven trip-hammers with glowing billets, 2 `19.5 m` blast cupola smelting furnaces, an overhead travelling bridge ladle crane, 4 moored cargo barges, and 14 storeys furnished in `republican` and `hl-republican` catalog furniture (`AV.DRESS.republican`).
2. **`intact` (`ancient`, at `(-900, -700)`)**: Pre-Cataclysm Ancient hydro-dynamo arcology in brushed white alloy, patinated bronze turbines & mullions, cyan busbars & induction smelters, and `ancient` catalog interiors.
3. **`ruined` (`ancient`, at `(+900, -700)`)**: Post-Cataclysm ruin with breached internal aqueduct span, ruptured penstock, broken upper collar & crown bays, cold furnaces, and `KRUBBLE` collapse mounds watched by `KRUINS.watch` (zero floating fragments, seated wrecks).

## Architecture & Vertical Zoning (0 .. 220.0 m)

- **Elevated Headrace Aqueduct, Central Cataracts & Tailrace Loop (`y = -3.2 .. +33.4 m`)**: Monumental stone-and-concrete Southern Elevated Headrace Aqueduct (`y_water = 32.3 -> 31.8 m`) marching above the lower South Tailrace Spillway (`y = -0.8 m`), plunging `32.6 m` through 3 central cataracts (`WATER.fall` + `WATER.drawFall`) into the `44 × 44 m` Central Turbine Tailrace Basin, and discharging through East/West Tailrace Sluice Houses (`x = ±142 m`) and **Twin Circular Gardens** (`x = ±265 m, r = 106 m`) planted deterministically via `CROPS.forBiome('nhighlands')` and `biomes/nhighlands` trees.
- **L0 Tailrace Turbine Vaults & Barge Quays (`y = 0.4 m`, `work` & `rec`)**: Tailrace turbine halls, ore/coal/ingot barge vaults, heavy smithies, and canal-quay tavern.
- **L1 Central Industrial Hall & Heavy Foundry (`y = 6.0 m`, `work`)**: Open `46 m` tall central powerhouse & foundry atrium around the cataract pit — 4 overshot wheels, 4 scroll-case hydro-dynamos, 2 water-powered trip-hammers, 2 blast cupola smelting furnaces, rolling mills, casting hall, and ingot/coke stores.
- **L2 Line-Shaft Machine Galleries & Terraces (`y = 16.2 m`, `work` & `living`)**: Belt-driven lathe, planer, and patternmaking galleries overlooking the cataract, plus outer apse foremen's apartments.
- **L3 Headrace Level Mills & Apse Flats (`y = 34.2 m`, `work` & `living`)**: Headrace-fed grist, saw, and textile mills (split cleanly around the South Apse aqueduct notch) and sunlit apse flats.
- **L4 Civic Market Ring & Upper Belvederes (`y = 52.2 m`, `civic`, `living`, `rec`)**: Grand Market Arcade, Customs & Registry, Commons Refectory, Clinic, and upper apse cottages buffered above the foundry.
- **L5 Recessed Arched Waist (`y = 72.0 m`, `rec` & `work`)**: Waste-heat foundry steam bathhouses, athletic & militia drill halls, and shift refectories.
- **L6–L8 Mid-Level Rings & 8 Spoke Sky-Bridges (`y = 93.6 .. 122.4 m`, `work`, `civic`, `living`, `rec`)**: Busbar-fed electro-mechanical guild works (`L6`), living-working studios & library (`L7`), and full octagonal residential ring (`L8`) framing the `66 × 66 m` light well.
- **L9–L11 Inverted-Pyramid Cantilevered Collar & Roof Deck (`y = 144.0 .. 172.8 m`, `work`, `civic`, `living`, `rec`)**: Grand Guildhall & Mint (`L9`), Court Apartments (`L10`), and Rooftop Cultural Center, Sky-Pad, Playgrounds & Botanical Cloister (`L11`).
- **L12–L13 Stepped Faceted Pyramidal Crown (`y = 187.2 .. 220.0 m`, `work`, `rec`, `civic`)**: Four-wing skylight conservatory (`L12`, Sheet 1 #2) and High Observatory & Arc-Beacon (`L13`).

## Acceptance Frames (`VISUAL-BAR.md`)

1. **Standing on the ground**: `Ground aqueduct and tailrace canal` — human-scale perspective along the East Quay Promenade (`[22.0, 4.2, 432]`), framing the stone quay, moored cargo barges on the lower tailrace spillway, the soaring `32 m` cyclopean stone arches of the Southern Elevated Headrace Aqueduct, the South Headgate Sluice-Tower, and the `220 m` arcology behind it.
2. **Overview**: `Vista from south-east` — elevated 3/4 view (`[430, 178, 440]`) showing the octagonal massing, elevated southern headrace aqueduct, 8 carved amphitheater apses, 12 column-towers, recessed arched waist, cantilevered collar, 5-tier stepped pyramidal crown, East Tailrace Sluice House, and Twin Circular Gardens.
3. **Interior Hero Views**: `Central Industrial Hall cataract` (`[-3.5, 14.8, -21.5]`) and `Central foundry trip-hammers and cupolas` (`[0.0, 13.6, -3.5]`) inside the Great Central Industrial Hall.

## Controls

- **Preset views** (panel): exterior vistas, **interior Central Industrial Hall cataract & foundry views**, **live hatched vertical cross-section** (`Cross-section refurbished`), and **storey cut-aways** across Work (`Deck 0`, `Deck 1`, `Deck 2`), Civic/Market (`Deck 4`), Rec (`Deck 5`, `Deck 11`), and Living (`Deck 7`) levels.
- **`X`** (and **`[`** / **`]`** or **`PageDown`** / **`PageUp`**): toggle horizontal storey cut-away on the complex in view and step through all 14 decks (`L0`–`L13`).
- **`C`** / **`Shift+C`**: toggle live vertical architectural cross-section / slab cut with hatched solid caps (`#34302c`) and the 8-storey furnished interior stack (`L0, L1, L2, L4, L5, L7, L11, L12`).
- **`F`**: walk on the site plain, Central Industrial Hall foundry floor (`y = 6.0 m`), L2 mezzanine galleries (`y = 16.2 m`), or any open interior deck (`KWALK`).
- **`N`**: toggle Day / Night (`Night in the Republic` lights warm molten cupolas, forge billets, electric arc dynamos, window interiors, and the crown arc-beacon).

## Build & Verify

```bash
python3 tools/build.py kits/cascade
node kits/cascade/tests/test-cascade.js
python3 kits/cascade/verify.py kits/cascade/dist/cascade.html --assert --out kits/cascade/shots
```
