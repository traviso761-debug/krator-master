# rheolith: the plan (proposal, 2026-11-17)

**The Rheoliths** (working name, after Orion's Arm's *rheolithoids*): a hidden, mineral-and-siloxane biosphere living at
**180–550 °C** inside Krator's volcanic throats, caldera ring-faults, geyser constrictions and floating lava-lake crusts,
seeded from **Four-Day** by impact ejecta eons ago. The idea in one line: **life whose solvent is hot vitriol and volcanic
vapour, whose flesh is silicone and zeolite, and whose metabolism engineers the plumbing of the crust**. Carbon life never
meets it face to face and survives—on cold, wet ground a rheolith vitrifies into dead glass or hydrolyses to opal—yet its
shed skins, ejected star-cores and mineral chokes litter Krator's vent country, and anyone who knows how to feed, flux or
poison a seam can gag a geyser, seal a tunnel crack, or rot the buoyancy out from under a lava crust.

Status: **Step 1 (`RHEO_PHYS` + unit tests) and Step 2 (`dist/rheolith.html`, Station 1: *The Breached Throat*) built**
(owner sign-off 2026-11-17). No scale-model rasters, no existing biome builds (`throne`, `firebliss`, `geyser`), and no lines
of `LORE.md` are modified: proposed lore wording stays in section 9 for the owner's hand. **Who, if anyone, lives in the
Firebliss Range permanently stays open** (section 6.4 holds both branches); the **Locus Chapterhouse stays internally
divided** on whether *loiv-staun* is feral Ancient grout or a living creature (section 6.1); and the **Ranj distribution**
across East Throne, Zey'danin, Voth's pockets and the Hykkousoi plantations is explained by short-lived rheolith vapours
and microporous zeolite sinter (section 6.3a).

---

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/rheolith/` (`build.py`, `verify.py`, `src/`, `materials.json`, `tex/`, `BIOME-API.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `tests/test-rheolith.js`): **a shared kit of deep mineral-siloxane life and surface remnants, with its own standalone station showcase (`dist/rheolith.html`) so host baselines stay untouched until ride-along** |
| Pages | **no biome polygon of its own on the map**; `dist/rheolith.html` (`--station throat`, default) showcases **The Breached Throat** (a collapsed SE Throne rift graben at `1,380 m` peering into a `340–580 °C` conduit, with live `[Gag]`, `[Salt]` and `[Dross]` controls). Read in place later onto host stations (section 8): `biomes/throne` (`vents`, `caldera`, `tube`), `biomes/firebliss` (`glen`, `mons`, plus held Patera `crossing`), `biomes/geyser` (`corona`, `puna`), `kits/zeijani` and Locus |
| Object | `RHEO` (`SPECIES`, `BYPRODUCTS`, `REAGENTS`, `byKey`, `PLACED`, `plantOfItem`, `speciesOfItem`, `build`) on the `BIOME-API.md` contract, backed by `[G data]` pure physics/state module `RHEO_PHYS` (`windowAt`, `choke`, `buoyancy`, `seal`, `byproductAt`, `ranjViability`; no THREE, no DOM, tested by `node biomes/rheolith/tests/test-rheolith.js` on `tools/ktest.js`) |
| Core | `core/biome` (`CORE_BIOME_MIN` + `31j`, `32`, `35`, `37`, `41`, `42`, `43`, `44`), `core/drawn`, `core/rand` (`KRAND`), `core/tags` (`KTAGS`), `core/space` (`KSPACE`), `core/hazard` (`KHAZ`), `core/water` (`WATER.spring`, `WATER.geyser`), `core/terrain` (`KSTRATA`, `KGEODE`, `KGROUND`, `KFAR`, `KHORIZON`, `KTHERM`), `core/atmos`, `core/materials/record`, `core/shadow`, `core/export`, `core/host`; full table in section 7.3 |
| Read in place | `throat` showcase reads `biomes/throne` (`throne.spice` wild & stunted Ranj trees and `throne.bonebell`) in place via `BIO.kin` (`siphon-pits` / `galvanic` pattern), never touching `biomes/throne/`'s files or manifests |
| Out of scope | changing the scale model; editing `LORE.md` directly; settling whether Firebliss has permanent inhabitants or the Patera enabled (`biomes/firebliss/PLAN.md` §11); economy simulation recipes (`core/simulation`, a later pass) |

---

## 1. The science: why 180–550 °C works and 1,100 °C does not

### 1.1 Why pure basalt magma fails ("the liquid-rock trap")
Feinberg and Shapiro (*Life Beyond Earth*, 1980) proposed silicate "lavobes" swimming in molten rock, and Orion's Arm's
*Rheolithoids* places kalsilite-and-zeolite organisms directly inside magma oceans. Systematic review of silicon
astrobiology (Petkowski, Bains & Seager 2020, *Life* 10(6): 84) rules out liquid silicate rock as a solvent:
1. **The solvent melts the scaffold.** Silicon's strongest structural bond in minerals is `Si–O` (~452 kJ/mol, vs.
   346 kJ/mol for `C–C` and 222 kJ/mol for `Si–Si`). At basalt liquidus temperatures (1,050–1,200 °C), all `Si–O` bonds in
   the melt break and reform on a millisecond timescale—no more permanent than hydrogen bonds in liquid water. Any silicate
   body or crystal-lattice "genome" dissolves or randomises into the melt.
2. **Zeolites collapse before rock melts.** Nanoporous aluminosilicate zeolites dehydrate and recrystallise into dense
   feldspars or glass at **450–700 °C**, centuries of degrees below liquid basalt.

### 1.2 Why liquid water also blocks silicon life
In liquid water (`< 120 °C` on Krator), almost all `Si–Si`, `Si–H`, `Si–N` and `Si–O–C` bonds hydrolyse rapidly into inert
amorphous silica (`SiO2`). That is why Earth's biota—and Krator's native carbon-and-water clade, including the 40–90 °C
thermosynthetic **Hearths** (`biomes/hearths/PLAN.md`)—can only use silica as passive structural glass.

### 1.3 The 180–550 °C vitriolic / fumarolic window
Step out of molten basalt and into the **dry magmatic-hydrothermal throat, fumarole condensate, and basal lava-crust zone
(180–550 °C)**—where liquid water boils off, and the working fluids are **concentrated sulfuric acid (`H2SO4`, liquid to
300–340 °C at Krator's 1.2–2.0 atm), volcanic gases (`SO2`, `H2S`, `HF`, `SiF4`, `HCl`, `CO`, `H2`), and low-melting
alkali-sulfate/halide/sulfide films**—and four real inorganic chemistries lock together:

| Function | Terran carbon life | Krator rheoliths (180–550 °C) | Real-world chemical basis |
|---|---|---|---|
| **Working solvent** | Liquid `H2O` (0–119 °C) | Concentrated `H2SO4` films, supercritical acid brines, halide-sulfate melts | Petkowski, Bains & Seager (2020); Bains et al. (2021): `H2SO4` has near-zero free water activity and stabilises diverse organosilicon/siloxane species |
| **Flexible soft tissue** | Lipids, proteins (`C–C`, `C–N`) | **Polysiloxanes** (`–Si–O–Si–` silicones) & cage **silsesquioxanes** | Bond energy ~452–460 kJ/mol; elastomeric and hydrophobic from 150 °C to 450–550 °C (to 600 °C with `Al`/metal-oxide cross-linking) |
| **Cell membranes & redox batteries** | Phospholipid bilayers, quinones, ATP | **Polyoxometalate (POM) vesicles** (`[SiW12O40]4-`, `Mo`/`V` Keggin cages) + **zeolite** sieves | Cronin group "iCHELLs" (Glasgow): tungsten/molybdenum metal-oxide clusters around `SiO4` cores self-assemble into porous inorganic membranes and hold multi-electron redox states |
| **Heritable information** | Linear `DNA`/`RNA` polymers | **Solid-state crystal defects & `Ge`/`Se`/telluride plaques** intercalated in kalsilite/mica sheets | Cairns-Smith (*Genetic Takeover*, 1982) defect replication + chalcogenide phase-change lattices (`GeSe`, `Bi2Te3`) stable to >500 °C |
| **Signalling & motility** | Action potentials, actin-myosin | **Oscillating cation-exchange waves** (`Na+`, `Ca2+`, `Cu+/Cu2+`, `Fe2+/Fe3+`) in semi-plastic zeolite/siloxane | Solid-supported Belousov-Zhabotinsky redox waves driving reversible unit-cell swelling (peristalsis at cm/hour) |
| **Predation / digestion** | Proteases, stomach HCl | **Fluoride & alkali fluxing** (`HF`, `SiF4`, `Na`/`B` sulfates) | `Si–F` (565 kJ/mol) is stronger even than `Si–O` (`SiF4` is a natural volcanic trace gas): fluoride cleaves silicate lattices at 200 °C the way salt melts ice |

**What happens outside their window (`RHEO_PHYS.viability`):**
- **Over ~600 °C (lava contact):** siloxane chains cross-link and calcine to pure `SiO2` slag; zeolites collapse; plaques melt.
- **Under ~140 °C (surface air):** polysiloxane gums pass their glass-rubber transition or stiffen, cation waves stall, and
  the organism **vitrifies** into dormant, brittle mineral glass (survivable if dry; revivable if reheated gently in acid).
- **In liquid water / rain (`< 100 °C`, high `a_H2O`):** fluoride/siloxane active sites hydrolyse irreversibly into dead
  opaline sinter and clay—**true death**.

---

## 2. Origin: panspermia down the Laplace well from Four-Day

Canon (`LORE.md` §2) places Krator in a **1:2:4:8 Laplace chain** (`Day` at 12 h → `Krator` at 24 h → `Two-Day` at 2 d →
`Four-Day` at 4 d, ~489,000 km), where **Four-Day** is a Mars-sized **vitriolic world**: sulfuric-acid seas, dark red
thiogen life, kept warm by tidal flexing and greenhouse.

1. **Launch & transit.** Large impacts on Four-Day during early bombardment (and occasional basin-forming strikes since)
   spalled crustal boulders out of Four-Day's shallow gravity well. Falling *inward* down the gas giant's potential well,
   ejecta crosses Krator's orbit repeatedly at moderate relative speeds. Vitrified inside porous sulfate-basalt boulders,
   dormant endoliths survive vacuum, cosmic rays and shock heating intact.
2. **The water filter.** Nearly every boulder that fell onto Krator drowned in the Ring Sea, rotted in the hyperjungle's
   4 m rains, or lay frozen on the Outer Wall. Only boulders that punched into **active calderas, rift fumaroles, or hot
   ash sheets over heat-pipe vents** landed in hot `H2SO4`/`SO2` vapour with no liquid water—a chemical mirror of Four-Day's
   deep fumarolic floor.
3. **Why Krator kept them.** On Earth, plate drift shuts off hotspot volcanoes every few million years, stranding immobile
   vent clades in cooling rock. Krator is a **stagnant-lid heat-pipe moon** (`LORE.md` §2): the Throne, the Godthrone,
   Korona's plume and Firebliss's arc sit over the *same* mantle pipes for hundreds of millions of years. Each major vent
   complex became an isolated deep archipelago where Four-Day's endoliths radiated into macroscopic mineral reefs and
   grazers—entirely separate from both Earth's introduced life and Krator's native water-based fungoid-partner clade.

---

## 3. The ecosystem: four guilds and their surface byproducts

Live rheoliths are **macroscopic but non-sentient** (0.1 to 15 m across, slow as slime moulds or corals, no more self-aware
than microbes, just as in Hiloenu's baseline in Orion's Arm). Because they live at **180–550 °C**, a player almost never
walks up to a live one in the open—only peers down at them through heat shimmer in a **250 °C fumarole throat, a drained
lava-tube hot reach, a breached drill-hole, or a patera skylight**.

Instead, **95% of what the world shows on the surface is their dead, shed, or vitrified byproducts**—which look like
nothing geology or carbon biology makes on its own.

### 3.1 Guild 1 — **Choke-Coral** (`chokecoral`, sessile gas-redox autotroph)
- **Where alive:** 220–480 °C constrictions of geyser pipes, fumarole chimneys and caldera ring-fissures.
- **Body & metabolism:** Nested, asymmetric flutes and honeycomb baffles (0.3–4 m across) of kalsilite, melilite and
  nanoporous zeolite bound by tough aluminosiloxane mortar, grown round a fist-sized **vortex-twinned nucleus** of flat
  germanium-selenium (`GeSe`) memory plaques. Catalyses rising magmatic gas disequilibria (`SO2 + 2 H2S -> 3 S + 2 H2O(g)`,
  `2 CO + SO2 -> 2 CO2 + S`, `H2` oxidation), storing chemical energy in polyoxometalate cages and endothermic crystal
  transitions.
- **Geological effect:** **Narrows and throttles vent conduits** to hold gas residence time and temperature steady—turning
  open steam cracks into rhythmic geysers, or sealing leaking side-cracks completely.
- **Surface byproducts (`RHEO.BYPRODUCTS`):**
  1. **`staregg` (Star-Eggs / Seed-Stones):** Dead nuclei torn off throat walls during explosive eruptions and flung onto
     caldera rims or welded into tuff beds (`0.15–0.8 m` ovoids). Split open, they do **not** show concentric agate bands
     like an ordinary geode: they show a **five- or seven-fold spiral vortex core** interleaved with mirror-bright metallic
     `Ge`/`Se` plates that flash oil-slick violet and bronze—uncannily like grown circuitry.
  2. **`throatcollar` (Honeycomb Throat-Collars):** Exposed hexagonal-spiral zeolite sinter lining extinct or breached
     fumarole mouths—too mathematically regular for wild splash sinter.

### 3.2 Guild 2 — **Wire-Vein** (`wirevein`, sessile thermoelectric autotroph)
- **Where alive:** 250–550 °C steep thermal gradients (`200–400 °C/m`) in fissure walls, magma-chamber roofs and deep
  boreholes.
- **Body & metabolism:** Flat dendritic mats (`0.5–6 m`) extending conductive needles of **bismuth telluride (`Bi2Te3`),
  pyrite and native bismuth** from the hot crack face back into cooler wall-rock. Runs on the **Seebeck (thermoelectric)
  effect**: a 250 K drop across doped telluride-sulfide couples generates ~50–100 mV continuously, trickle-charging
  tungsten-silicate Keggin clusters without needing rich gas flow. When rock cracks or a drill bit cuts it, it extrudes a
  fast-curing aluminosiloxane callus to restore thermal insulation between its hot and cold poles.
- **Geological effect:** **Self-healing rock cement**; seals fractures and jams deep boreholes overnight.
- **Surface byproducts:**
  3. **`bismuthnest` (Threaded Bismuth Hoppers):** Builds directly on the Throne's existing fumarole bismuth pockets
     (`biomes/CRYSTAL-CAVES-5.1.md` §3, `throne/stations/vents/87g-host-bismuth.js`): where `wirevein` grew, native bismuth
     (melting at 271 °C) crystallises on cooling into rainbow-oxide **hopper steps skewered by hair-fine silver telluride
     wires**.
  4. **`scarplug` (Bore-Scars / Black Pitch-Stone):** Bulging, ropey dark-amber siloxane calluses sealing old fault seams
     or Geomancer drill cores—leathery and self-sealing above 200 °C, snapping like amber-tinted obsidian on the surface.

### 3.3 Guild 3 — **Foam-Reef** (`foamreef`, sessile crust-buoyancy autotroph)
- **Where alive:** 200–520 °C **porous basal underside** of floating basalt lava-lake crusts—above all the **Firebliss
  Patera** (`biomes/firebliss/PLAN.md` §11a, if placed) and persistent crust shelves in summit lava lakes (`throne-caldera`).
- **Body & metabolism:** Broad, flat tabular rafts (`2–15 m` wide, `0.3–1.2 m` thick) fused to the underside of cooling
  basalt crust, a few metres above the 1,150 °C melt. Feeds on rising magmatic `CO`, `H2`, `SO2` and radiant IR. Because
  sinking with a foundering crust plate into 1,150 °C melt kills it instantly, `foamreef` evolved to **trap volcanic gas in
  glazed, closed-cell zeolite foam chambers**, actively maintaining positive buoyancy against the densifying basalt above it.
- **Geological effect:** **Delays crust foundering along colonised lanes.** Where `foamreef` forms continuous keels under a
  lava lake's crust, the plate stays buoyant weeks or months past Hon/Rathbun abiotic densification, while uncolonised or
  grazed zones sag and open skylights.
- **Surface byproducts:**
  5. **`bellblister` (Ringing Blisters):** Low, blue-iridescent pahoehoe domes (`3–12 m` across) over `foamreef` gas keels
     that stay noticeably warmer (+15–30 °C on `KTHERM`) yet **ring clear as a bronze bell** under a staff instead of
     thudding dull.
  6. **`combplate` (Honeycomb Raft-Slag):** Pale, ultralight geometric zeolite-foam slabs flipped up onto seam ramparts
     when a plate finally founders—light enough to float on water despite being stone.

### 3.4 Guild 4 — **Flux-Creeper** (`fluxcreeper`, motile siloxane heterotroph)
- **Where alive:** 180–450 °C fracture networks, fumarole aprons and crust seams wherever the three autotroph guilds grow.
- **Body & metabolism:** Slow (`5–30 cm/hr`), flattened cushion-amoeboids (`0.1–2.5 m` across) with a semi-molten,
  high-plasticity **methylphenyl-/fluoro-polysiloxane integument** driven by rotating convection/ion-exchange cells (Steve
  Bowers's rotating zeolite cells, grounded at 300 °C). Concentrates volcanic fluorides and alkalis into internal POM
  vacuoles, then presses over `chokecoral` or `foamreef` colonies and **secretes `HF` / `SiF4` and alkali-sulfate flux**,
  depolymerising their silicate armour at 250 °C to ingest their reduced `Ge`/`Se` plaques and charged metal-oxide clusters.
- **Geological effect:** **Rock-rot and valve-breaker.** Dissolves mineral plugs in geysers (triggering phreatic blasts),
  rots out `foamreef` buoyancy blisters under lava crusts (opening skylights), and eats out soft overhangs in hot tunnels.
- **Surface byproducts:**
  7. **`throatskin` (Throat-Skins / Shed Rinds):** Leathery, asbestos-pale to rust-red elastomeric polysiloxane sheets
     peeling around active acid fumarole lips (`150–250 °C` zone)—still flexible where bathed in hot steam, snapping like
     brittle horn or mica a few metres out in cold air.
  8. **`etchhalo` (Fluoride Etch-Halos & Red Rime):** Dead white `SiF4`-hydrolysed silica frost, pitted "worm-eaten" basalt
     sponge, and blood-red `Se` sublimate rings round a vent—the unmistakable surface sign that `fluxcreepers` are
     actively eating a conduit plug below.

---

## 4. Influencing them: geological control as gameplay

Because rheoliths control **conduit aperture (`choke`), crust gas-fraction (`buoyancy`), fracture sealing (`seal`), and
margin polymerisation (`viscosity`)**, influencing them gives players and factions bounded, physical leverage over volcanic
hazards—without magic, telepathy or instant terrain deformation.

### 4.1 The four reagents (`RHEO.REAGENTS`)

All four come from materials Krator's resource and trade map already holds:

| Reagent | Made from | Target guild | Immediate chemical action | Geological outcome |
|---|---|---|---|---|
| **1. Brimstone-Iron Cake** (*"Gag-cake"*) | Sulphur (`Solfatara Glen`, `Throne vents`) + iron filings / red ochre (`galvanic`, `Iron Republic`) | Feeds `chokecoral` & `wirevein` | Fuels rapid zeolite/siloxane accretion (`+choke`, `+seal`) | **Seals** gas/steam leaks in tunnels (`KHAZ.TUNNEL.reseal`); **quiets** a geyser or fumarole for 1–5 days while **charging subsurface pressure**; stiffens a cooling lava-lobe margin |
| **2. Alkali-Fluorite Salt** (*"Flux-salt" / "Seam-salt"*) | Potash/soda alkali (`the Catch`, `Rift` salt pans) + fluorite/halide crust | Stimulates `fluxcreeper` frenzy & directly fluxes `Si–O` networks | Depolymerises zeolite plugs & buoyancy foam (`-choke`, `-buoyancy`, `-seal`) | **Triggers** a geyser or phreatic acid-steam blast on a choked vent; **rots** `foamreef` blisters to open a skylight or founder weak patera crust; **breaches** a crusted lava levee |
| **3. Heavy Dross** (*"Dead-lead" / "Barite-slag"*) | Lead-silver galena slag (`Neo-Ozarks`, `Yuni`) or barite | Poisons all guilds (irreversible `Pb2+`/`Ba2+` lock in zeolite pores) | Kills cation oscillation; precipitates dense barite/galena (`density +`, `viability -> 0`) | **Kills bore-healing** so drills or delvers can cut through a hot seam without it sealing behind them; **weights** a floating crust plate to sink prematurely |
| **4. Hot Vitriol Bath** (*"Keeping-flask"*) | Concentrated `H2SO4` (`galvanic` / Geomancer still-house) held at 220–300 °C | Sustains Dormant `staregg` / live drill-core | Prevents hydrolysis and keeps siloxane above glass transition | Keeps a specimen **alive in a retort** (Geomancer lab study, high-temp chemical catalysis, or seeding a sterile hot bore) |

### 4.2 Four concrete gameplay loops & their backfires

Every manipulation runs on a deterministic state curve (`RHEO_PHYS`, section 7), never an instant button press, and always
carries a conservation-of-energy catch:

1. **The Geyser / Phreatic Valve (Crossing vs. Ambush)**
   - *Calm a crossing:* Toss **Brimstone-Iron Cakes** into a geyser throat (`biomes/geyser` or `throne-vents`) 6–12 hours
     before crossing. `chokecoral` proliferates, throttling the vent (`WATER.geyser` `pre` vanishes; steam drops to a hiss).
     *The catch:* heat input from below has not stopped. `RHEO_PHYS.choke` accumulates stored enthalpy `P`. Leave it gagged
     past `P_crit` (~48–96 h), and the rock collar shatters in a **2–3x radius phreatic blowout** (`KHAZ` `heat` + `crush` +
     `acid` rain-out).
   - *Spring the trap:* Cast **Flux-Salt** down a naturally choked fumarole (marked by `throatcollar` and quiet strain) or
     one you gagged earlier. Within **3–10 minutes** (warned by a sharp `SiF4` hiss, white frost puff and harmonic tremor),
     flux-grazers and fluoride cleave the plug and fire a directed boiling acid-steam surge across the trail—the classic
     **Andarū ambush** against Vothic columns.

2. **Tunnel & Arcology Geothermal Bores (Sealing vs. Breaching)**
   - In deep Zeijani galleries, Ancient geothermal shafts, or mines (`22-core-hazard-tunnel.js`):
   - Packing a weeping `SO2`/`CO2` crack with **Gag-cake** lets `wirevein` knit an airtight `scarplug` in **1–2 hours**
     (`KHAZ.TUNNEL.reseal`), making an unbreathable delve campable.
   - Conversely, a passage sealed for centuries by an overgrown `scarplug` (too rubbery-tough at 250 °C for picks, and
     self-healing behind chisels) must first be poisoned with **Heavy Dross** (vitrifying it brittle so picks shatter it)
     or dissolved with **Flux-Salt** (at the cost of venting `HF`/`SiF4` acid gas for twenty minutes—stand upwind!).

3. **Lava-Lake Crust & Patera Seam Sabotage (`KHAZ.crust`)**
   - On any persistent crusted lava sheet (and at full regional scale if the **Firebliss Patera** of `firebliss/PLAN.md`
     §11 is active):
   - Following **`bellblister` lanes** (detected by staff-ring pitch, subtle blue sheen, and +20 °C warmth) gives caravans
     and delvers a thick, buoyant causeway (`KHAZ.crust` load limit 3–5x surrounding crust).
   - Pouring **Flux-Salt** or **Heavy Dross** into radial cooling cracks along a plate margin kills or dissolves the
     `foamreef` keel over **6–24 hours**: the bell-ring goes dull, steam hisses yellow-white (`etchhalo`), and the plate
     **sags into a skylight or founders** under the next heavy load (`KHAZ.crust` threshold drops below boot/pack-beast
     weight).

4. **Lava-Lobe Steering (Outpost Protection)**
   - Near active effusive fissures (`throne-vents`, `throne-delta`, `Copper-Fissure Vent`), seeding the upslope cooling
     levee on your outpost's side with **Gag-cake** cross-links siloxane-silicate levee crust (+viscosity), while **Flux-Salt**
     on the opposite bank thins and breaches the crust there, nudging a slow pahoehoe tongue down a neighbouring gully.

---

## 5. How they look and sound (scene & shader tells, no glowing clichés)

Following the rule of `clivobredos` and `galvanic`: **rheoliths do not bioluminesce**. Any light in a throat is pure
blackbody incandescence from >550 °C rock deeper down (`KTHERM` / Planck ramp), never magic neon veins. Their alienness is
**geometric, textural and acoustic**:

- **Geometry that breaks geology's rules:** five- and seven-fold asymmetric spirals (`staregg` cores, `throatcollar` mouths)
  and hexagonal zeolite honeycombs—symmetries crystals in abiotic rock are forbidden or vanishingly unlikely to take at
  metre scale.
- **Wrong material stiffness:** `throatskin` flaps and trembles like heavy wet chamois leather in a 220 °C fumarole jet
  (`BIO.bindAtmosWind` / vertex flutter driven by vent phase), while identical sheets two metres downslope lie shattered
  into sharp obsidian-amber shards.
- **Iridescent metallic cleavage:** split `staregg` xenoliths and `bismuthnest` pockets catch grazing sun with thin-film
  interference (`GeSe` bronze-violet and `Bi2O3` peacock gold-blue, via existing `irid` / `KGEODE` hooks).
- **Sound (`core/audio` data hooks):**
  - *Choked throat:* a slow, rhythmic metallic *tick-tick-groan* (15–40 s period: oscillating zeolite expansion waves).
  - *Bell-blister under foot/staff:* a clear, resonant bronze *tink* vs. dangerous thin crust's hollow *knock*.
  - *Flux-grazed seam (`etchhalo`):* a dry fizzing hiss like bacon fat on hot iron (`SiF4` hydrolysing air moisture).

---

## 6. Who knows what: four lenses, none complete

No faction on Krator has a textbook of silicon xenobiology. Four groups touch the deep biome, and each interprets it
through its own craft:

### 6.1 The Geomancers (Locus & the Yuni Cloisters — `LORE.md` §6.9)
- **What they suspect:** *The only people on Krator who have an inkling the deep stone is alive.*
- **How they met it:** Drilling deep oil, brine and geothermal cores along the Eastern Abyss faults and SE volcanic vents
  (`gills/PLAN.md` §10: *"pioneers in exploiting the various tectonic / volcanic resources of the southeast map quadrant"*).
  Below ~200 °C in acid-sulfate fault zones, drillers hit **"bit-rot"** (Yuni speech: ***roddo***): bores that squeeze and
  cement themselves shut round a drill string overnight with rubbery dark aluminosiloxane, and core barrels that come up
  steaming with spiral `staregg` hearts (`LIVE-CORE` stencilled in Yuni gate capitals on the Chapterhouse boxes, spoken
  ***loiv-kō*** or ***loiv-staun***).
- **Behind closed doors at Locus:** In the back of the Locus still-house, senior Geomancers keep fist-sized `chokecoral` and
  `fluxcreeper` cuttings submerged in boiling glass retorts of concentrated `H2SO4` (`Hot Vitriol Bath`). They have watched
  cuttings creep toward sulphur dust, bud new five-fold plaques over months, and die instantly if a drop of water hits the
  acid.
- **Their internal split (*settled 2026-11-17: keep divided*):** Half the Chapterhouse thinks ***loiv-staun*** is an Ancient
  self-healing borehole grout gone feral; a quiet minority (who have compared fresh meteorite falls from the sky with deep
  cores) suspects a true creature of the rock. Either way, they guard **Heavy Dross** (to kill *roddo* on their drills) and
  **Gag-cake** (to seal blowout wells) as guild secrets.
- **If the Monks of History (`LORE.md` §6.15) ever hear of it:** An Oidong folio would mark `"Geomancer drillers lose bits
  to stone that mends in a night"` with `◉` (*seen*), `"The live-stone in Locus's retorts eats brimstone and breeds"` with
  `◌` (*said*), and `"Its seed fell from Four-Day in the old bombardments"` with `△` (*inferred*).

### 6.2 The Zeijani (Carved tuff villages inside the Throne — `LORE.md` §6.17)
- **What they know:** *Sacred lithic lore and deep-gallery survival craft.*
- **How it meets canon:** The Zeijani carve their towns (`Dhelv`, `Šurpu-Dhelv`, `Qarnu-Tūbu`, and `Nūru-Šaplu` inside a
  drained magma chamber) into the Throne's welded tuff and **revere thundereggs and vugs as shrines** (`LORE.md` line 568;
  `CRYSTAL-CAVES-5.1.md` §4).
- **Folk taxonomy:** Zeijani carvers sharply distinguish common agate thundereggs (*dead eggs*, silent) from rare
  **`Ṣṭār-eggim`** (*star-eggs*, vortex-twinned `staregg` xenoliths embedded in pyroclastic tuff beds) and **`Ḫuṭṭ-eggim`**
  (*hot-eggs*, still-warm `chokecoral` / `wirevein` nodes met where a gallery nears an active fumarole chimney). Cutting into
  a *hot-egg* is strict taboo: both out of reverence and because breaching its pocket vents scalding `HF`/`SO2`.
- **Practical delve-craft:**
  - *Feeding the wall:* Zeijani masons pack hot, weeping gas cracks in lower galleries with sulphur-and-iron paste so the
    mountain "knits its skin" (`scarplug`), keeping `Dhelv` and `Nūru-Šaplu` breathable.
  - *Reading the rot:* When white fluoride frost (`etchhalo`) blooms on a warm gallery wall and the rock begins to fizz,
    Zeijani elders recognise that "the stone-worms are grazing" (`fluxcreeper`), wall off the drift with tuff blocks, and
    abandon that level before the roof slumps.

### 6.3 The Andarū (Ash nomads of the Throne's plume & rifts — `LORE.md` §6.17)
- **What they know:** *Surface fumarole augury and guerrilla vent-craft.*
- **How it meets canon:** Roaming the dim, acid-drizzling south-east lee and rift grabens (`biomes/throne/NOTES.md` §§"Why
  the lee is alien", "Zey'danin and the south-west frontier"), the Andarū live among active fumaroles, harvest wild **Ranj**,
  and fight Vothic plantation-clearers and Ordinators.
- **Folk practice:**
  - *Reading `šrūt-skinni` ("throat-skins"):* Andarū scouts read fumarole lips like weather vanes. Supple, freshly shed
    siloxane skins mean a clean, open vent; dry, throttled honeycomb collars (`throatcollar`) ticking slowly underground
    mean a choked, primed pipe; white frost and red selenium (`etchhalo`) mean the plug is rotting and about to blow.
  - *Gagging & salting (`saltu`):* Andarū war-bands carry cakes of rift brimstone and pouches of crusted alkali-fluoride
    salt. Weeks before a raid they gag fumaroles beside a ridge trail; when Vothic patrols or spice-raiders march up from
    Zey'danin, a scout drops a handful of *saltu* down the upwind pipe and retreats—letting `fluxcreepers` blow a scalding
    acid-steam curtain across the column minutes later.

### 6.3a The Ranj distribution across the Ring (*settled 2026-11-17* — `RHEO_PHYS.ranjViability`)
Canon (`LORE.md` §6.12, §6.16, §6.17; `biomes/throne/NOTES.md` l. 94–133; `biomes/WORLD.md` l. 106–108) sets a four-part
geographical puzzle: wild **Ranj** bleeds its healing red resin abundantly along the Throne's east/SE and NNE rifts, **Voth's
huge plantations round Zey'danin fail** despite carted ash and sulphur, **Voth succeeded in small pockets** of its own
territory (`Spice Isle`, `Temora`, scattered SW bay clearings), and **the Hykkousoi run mostly successful plantations**
across the north-west Ring.

Tying Ranj's symbiotic bracket-fungus to **short-lived volatile cyclic methylsiloxanes (`D3`/`D4`) and methylated
selenium/germanium (`(CH3)2Se`) exhaled by active 180–550 °C rheolith throats** solves all four parts without a single
ad-hoc exception:
1. **Why East/SE & NNE Throne bear wildly:** The Throne's active flank rift zones run **NNE and SE** (`throne/NOTES.md`
   l. 94–96). Hundreds of shallow fumarolic throats (`220–480 °C`) exhale siloxane-and-selenium trace vapours straight into
   the root-and-mist seam (`throatDistM < 85 m`).
2. **Why Zey'danin fails (`throne-frontier`):** Zey'danin sits on the **riftless windward SW flank** (`throne/NOTES.md`
   l. 96, 100–106), drenched by `2,500–4,000 mm` of monsoon rain over cold, deep-weathered laterite. Cyclic methylsiloxanes
   hydrolyse in wet air and rain within hours (`rainMm > 2200` with no local throat → `vapour01 -> 0`). Carting cold dry
   volcanic ash and elemental sulfur copies the rock's bulk chemistry while missing the fugitive deep-throat vapour entirely.
3. **Why Voth succeeded in small pockets (`Spice Isle`, `Temora`, SW ring-fault coves):** Voth's purely Vothic spice port
   **Temora** (`LORE.md` l. 441, 462) and **Spice Isle** (`WORLD.md` l. 108, bridged to the Throne beside five western
   crater-floor geysers in `throne-isle`) sit directly over the **Inner Crater's southern ring-fault**, where isolated
   hydrothermal pipes (`200–350 °C` beneath caprock) still harbour relict `chokecoral` colonies. Vothic clearers who happened
   to plant on warm fault-seep aprons hit bearing ground by luck; plantations laid out a kilometre off the fault stand
   yellowing and dry.
4. **Why the Hykkousoi run mostly successful plantations (`LORE.md` l. 70, 548–552; `nwbay/src/44n-host-geology.js`):**
   Two canon facts converge in the north-west:
   - *Ring-fault geyser geography:* One-fifth of the **West Ring Isles** off the Hykkousoi coast are active geyser domes
     (`WORLD.md` l. 106, `4.12`), and the NW Bay's drowned limestone benches meet active volcanic ring-fault vents (`nwbay`
     marble contact), giving scores of warm `throatcollar` geyser aprons ("breathing ground").
   - *Grown-biotech empiricism:* Unlike Voth's rectilinear hillside clearers, the Hykkousoi are biological growers (*"their
     biotech is grown"*, inheritors of Ys's drowned gene-lab craft). Hykkousoi spice-masters site groves strictly on steaming
     geyser-dome aprons and warm fault seeps, and dress every planting pit with freshly quarried damp **honeycomb vent-sinter
     (`throatcollar` / `combplate` zeolite gravel)** and live fungal root-balls ferried from bearing geyser isles. Nanoporous
     zeolite cages trap adsorbed methylsiloxane and selenium vapours like a molecular sponge (`zeoliteMulch: 0..1`), bleeding
     them slowly into the rhizosphere while warm fault-steam sustains the underlying throat. Neither Hykkousoi nor Voth
     suspect deep mineral life—Hykkousoi call the practice *matching the warm humours of the earth*.

### 6.4 Firebliss (**kept open** — the owner, 2026-11-17)
`biomes/firebliss/PLAN.md` currently holds two possibilities: canonically **nobody lives in the range permanently** (only
**Fellgang** bands over the fells and **Kimr** hunters up the Warras pass through semi-regularly, with **Tungang** caverns
280 km east), while **Section 11** (`PATERA_ON = False`, held) sketches the **Firebliss Patera, the Holm and seasonal
crust-readers**, and the owner has not yet decided who—if anyone else—lives in Firebliss.

The rheolith design accommodates **whichever way Firebliss settles** with zero rework:
- **Case A — No permanent residents (Fellgangs & Kimr only):**
  - **Solfatara Glen** (`firebliss-glen`) and **Firebliss Mons** (`firebliss-mons`) display the untouched wild state:
    `throatskin` rinds around Solfatara's acid pots, `staregg` xenoliths on Mons's crater moraines, and `etchhalo` frosts
    around unstable phreatic pits.
  - Passing **Fellgang** sulphur-gatherers keep practical taboos inherited from their Tungang tunnel-ancestors (*"never
    chip a ringing pot; never camp by white-frosted brimstone"*) and trade intact `staregg` cores east toward Dalab/Locus as
    high-value curios.
- **Case B — A Firebliss people and/or Patera crust-readers are added later:**
  - Anyone living on or seasonally working the range inherits direct folk-empiricism around `foamreef` (`bellblister` safe
    paths across lava crust, staff-listening) and `fluxcreeper` ("salting a seam" to open skylights or bleed fumarole
    pressure), viewing the patera or valley plumbing as a single moody sleeper beneath the rock rather than discrete beasts.

### 6.5 Working glossary in Krator's tongues (derived by `lore/tongues-of-krator.html` rules; *owner to confirm/rename*)

| Referent | Zeijani (chiselled wedges) | Andarū (ash nomad) | Yuni / Geomancers (gate stencil → spoken) |
|---|---|---|---|
| `staregg` (vortex xenolith core) | **Ṣṭār-eggim** ("star-egg") | **Stār-eggi** | `STAR-CORE` → *stā-kō* |
| Live/warm node in a wall or bore | **Ḫuṭṭ-eggim** ("hot-egg") | **Ḫutt-eggi** | `LIVE-STONE` → *loiv-staun* |
| Borehole healing / siloxane callus (`scarplug`) | **Ṣqārum** ("scar") | **Skāru** | `BIT-ROT` → *roddo* |
| Shed fumarole siloxane rind (`throatskin`) | **Šrūṭ-ṣqinnim** ("throat-skin") | **Šrūt-skinni** | `VENT-HIDE` → *ven-hoid* |
| Fluoride frost + grazer rock-rot (`etchhalo`) | **Pēṭ-rīmim** ("bite-rime") | **Pēt-rīmi** | `WHITE-ROT` → *woid-ro'* |
| Flux-salt reagent (alkali-fluoride) | **Ṣalṭum** | **Saltu** | `FLUX-SALT` → *flak-sol'* |

---

## 7. Data & core architecture (`[G data]`, deterministic, Godot-ready)

### 7.1 `RHEO_PHYS` (`src/40-rheolith-phys.js` — pure functions, no THREE/DOM)
Every number a shader, `KHAZ` hazard, inspector label or quest script reads comes from six pure functions plus `RHEO_SITES`:

1. **`RHEO_PHYS.windowAt({tempC, waterActivity, acidPh}) -> {viable, state, k}`**
   - `tempC > 600`: `{viable: false, state: 'calcined', k: 0}`
   - `180 <= tempC <= 550` and `waterActivity < 0.15`: `{viable: true, state: 'active', k: 0..1}` (peaking at 310 °C,
     `acidPh <= 1.5`)
   - `tempC < 180` and `waterActivity < 0.25`: `{viable: false, state: 'vitrified', k: 0}` (dormant glass; revivable)
   - `tempC < 140` and `waterActivity >= 0.25`: `{viable: false, state: 'hydrolysed', k: 0}` (dead opaline sinter)
2. **`RHEO_PHYS.choke(ventRec, t, doses) -> {aperture, pressure, periodScale, heightScale, state, tell, blast}`**
   - Integrates `chokecoral` growth (`+gagCake`) against `fluxcreeper` grazing (`+fluxSalt`) and heavy-metal kill
     (`+heavyDross`).
   - Feeds `WATER.geyser` cycle modulation: narrower `aperture` lengthens period and raises burst height until `aperture <
     0.08`, where the geyser goes silent (`state: 'gagged'`) and `pressure` climbs linearly toward phreatic blowout (`blast:
     true` when `pressure >= 1` or when `fluxSalt` cleaves a pressurized plug).
3. **`RHEO_PHYS.buoyancy(crustAgeDays, reefCover, doses) -> {effCover, thicknessM, loadKg, ringPitchHz, state}`**
   - Extends Hon et al. (1994) / Rathbun porosity clock (`firebliss/PLAN.md` §11a): `reefCover` (0..1) holds basal gas
   - Multiplies safe `loadKg` by `1 + 2.5 * effCover` and raises acoustic `ringPitchHz` (~180 Hz bronze bell vs. ~55 Hz
     thin-crust knock). `fluxSalt` or `heavyDross` decays `effCover -> 0` over 6–24 game-hours.
4. **`RHEO_PHYS.seal(crackRec, t, doses) -> {sealed01, gasLeakK, brittle, state}`**
   - Drives borehole/gallery fracture healing: `gagCake` drives `sealed01 -> 1`; `heavyDross` sets `brittle: true` so
     mechanical picks breach without self-healing.
5. **`RHEO_PHYS.byproductAt({distM, tempC, windDot, recentFlux, crust}) -> weights`**
   - Deterministic zone weights for all eight byproducts (`throatcollar` at 0–4 m, `throatskin` at 2–11 m where 110–260 °C,
     `etchhalo` where `recentFlux > 0.25`, `bismuthnest` & `scarplug` on steep hot fissure walls, `bellblister` & `combplate`
     on crusted lava benches, `staregg` on the downwind ballistic ejecta apron).
6. **`RHEO_PHYS.ranjViability({throatTempC, throatDistM, zeoliteMulch, rainMm}) -> {fruiting, vapour01, why}`**
   - Models trace cyclic-methylsiloxane / organoselenium delivery from a subsurface throat (`windowAt` active at
     `throatTempC`), radial dispersion (`throatDistM`), monsoon washout (`rainMm`), and Hykkousoi microporous zeolite-sinter
     mulch (`zeoliteMulch`, buffering vapour out to plantation aprons where warm fault steam persists).

### 7.2 `core/tags` and `core/hazard` wiring
- Every placed guild colony and surface byproduct (`staregg`, `throatcollar`, `bismuthnest`, `scarplug`, `bellblister`,
  `combplate`, `throatskin`, `etchhalo`) registers in `core/tags` before draw (`CLAUDE.md` rule), carrying `tags.resource`
  and observer-neutral physical inspector text alongside Zeijani / Andarū / Yuni craft names.
- `etchhalo` vents carry `tags.hazard` (`kind: 'acid'`, `danger: 0.65`, `tell: {colour: 'white-red', fx: 'frost',
  sound: 'fizz', sign: 'pitted stone and white fluoride rime'}`).
- The central breached throat carries `tags.hazard` (`kind: 'heat'`, `danger: 0.95`) and dynamically updates its geyser
  `offAt()` and phreatic surge state through `THROAT` (`86-host-throat.js`).

### 7.3 Core modules adopted (`biomes/rheolith/build.py`)

| Module | Fragments | What `rheolith` uses it for |
|---|---|---|
| `core/biome` | `buildlib.CORE_BIOME_MIN` + `31j`, `32`, `35`, `37`, `41`, `42`, `43`, `44` | Kit registry (`BIO.kit('rheolith')`), procedural meshes & instancing, thin-film `iridBarkMat`, `BIO.kin` (`throne.spice`, `throne.bonebell`), wind flutter, world export |
| `core/drawn` | `10-core-drawn.js` | Registers the drawn ground grid (`KDRAWN.add(KDRAWN.grid(...))`) for camera/eye ground-clearance audits (survey item 28) |
| `core/rand` | `08-core-rand.js` | Deterministic `KRAND.hash` / `KRAND.unit` / `KRAND.fbm` across placement, geode pockets and geyser particles (never `Math.random`) |
| `core/tags` | `50`, `52`, `53` | Records every guild colony, byproduct, tree, bismuth pocket and hazard volume in `KTAGS` before draw |
| `core/space` | `20-core-space.js` | Spatial keep-clear index (`KSPACE`) between fumarole collars, kin trees and crust blisters |
| `core/terrain` | `35` (`KSTRATA` + `35z` shade), `39f`/`39g` (`KGEODE`), `43` (`KGROUND`), `44` (`KFAR` + draw), `45` (`KHORIZON` + shade), `47` (`KTHERM`) | Flood-basalt rift walls, five library ground layers under 16 samplers, fumarole native-bismuth hopper pockets (`bismuthnest`), 14 km far-field, horizon occlusion, baked thermal field (`26–540 °C`) |
| `core/hazard` | `20-core-hazard.js`, `21-core-hazard-flow.js` | Heat, acid-gas and crust-collapse hazard volumes (`KHAZ`) |
| `core/water` | `20`, `21`, `22`, `50`, `51`, `geyser/52`, `52b`, `ext/56`, `57`, `58`, `60` | Hot sulfuric acid springs (`WATER.spring`), the central throttled geyser throat (`WATER.geyser` modulated live by `RHEO_PHYS.choke`), shore wetness fields |
| `core/atmos` | `0`, `0p`, `3`, `4`, `8`, `9`, `a`, `b`, `sky/e,f,g,j`, `host/c,e,h,i,j`, `fx/raincover,lightning` | Shared Krator sky at the SE Throne rift (`1,380 m`, `1.18 atm`), wind driving `throatskin` flutter, height fog, weather |
| `core/materials` | `record/23-mat-record.js`, `25-matlib-host.js` + `matlib_pack.py` | Five ground material families (`ground.cinder`, `ground.crust`, `ground.sinter`, `ground.efflorescence`, `ground.basalt`) + `throne` kin bark/cap subset |
| `core/shadow` | `10-core-shadow.js`, `host/12-core-shadow-host.js` | Toggleable sun shadow box (`?shadow=1`, off at load) |
| `core/export` | `07-core-export.js`, `09-core-export-adapters.js` | `krator-world` container + `physics` exporter (`krator-rheolith`) |
| `core/host` | `khost.FULL` + `94-host-polytool.js` | Camera, clock, preset views, `[Gag]`, `[Salt]`, `[Dross]`, `[Reset]` controls, click inspector, `window._api` |

---

## 8. Host stations & rollout order

`biomes/rheolith` builds its own standalone showcase (`dist/rheolith.html`) first so **zero existing host manifests or
`PORT-BASELINE.json` entries move** until each host station's ride-along pass:

| Step | Status | Host | Station / Target | What `RHEO` adds there |
|---|---|---|---|---|
| **1** | **Built** | `biomes/rheolith/` | `src/40-rheolith-phys.js` + `tests/test-rheolith.js` | Pure `[G data]` `RHEO_PHYS` (`windowAt`, `choke`, `buoyancy`, `seal`, `byproductAt`, `ranjViability`) + `RHEO_SITES.throat`, tested with `T.ok` and `T.neg` on `tools/ktest.js` |
| **2** | **Built** | `biomes/rheolith/` | `dist/rheolith.html` (`--station throat`, default) | **The Breached Throat** (SE Throne rift graben at `1,380 m`): collapsed skylight peering into live `340–540 °C` `chokecoral`, `wirevein`, `foamreef` keel & creeping `fluxcreeper`; all 8 surface byproducts; `KGEODE` bismuth pockets; wild bearing Ranj on the warm fumarole halo vs. stunted Ranj on the cold rim (`BIO.kin` from `throne`); live `[Gag]`, `[Salt]`, `[Dross]`, `[Reset]` controls |
| **3** | Proposed | `biomes/throne/` | `--station vents`, `caldera`, `tube` | Read `RHEO` in place onto Throne stations during the next Throne rebuild pass |
| **4** | Proposed | `biomes/firebliss/` | `glen` (`Solfatara Glen`) & `mons` (`Firebliss Mons`); plus Patera `crossing` if/when `PATERA_ON = True` | Wild `throatskin` aprons and `etchhalo` pots in Solfatara Glen; cold-vitrified `staregg` xenoliths on Mons's crater floor; `bellblister` & `combplate` ready for the Patera crust |
| **5** | Proposed | `biomes/geyser/` & `kits/zeijani/` | `corona`, `puna`, Zeijani shrines & Locus | `throatcollar` geyser nozzles on Korona; split `staregg` shrine niche, gallery `scarplug`, and Locus `Hot Vitriol Bath` specimen retort |

---

## 9. Proposed lore additions (for the owner's hand; `LORE.md` untouched)

- **For `LORE.md` §2 (under `Four-Day`):**
  > *Proposed:* Ancient impacts on Four-Day flung vitriolic crust inward down the giant's gravity well; on wet Krator all
  > of it perished in water save what fell into dry, acid volcanic throats above ~200 °C, where a hidden mineral-siloxane
  > biota ("rheoliths") still lines deep vents (§8).
- **For `LORE.md` §6.9 (under `The Geomancers`):**
  > *Proposed:* Deep in hot, acid fault bores their drills meet *roddo* ("bit-rot"): seams that mend themselves overnight
  > with tough dark siloxane and cores with five-fold metallic hearts (*loiv-staun*). Behind closed doors in the Locus
  > still-house, senior Geomancers keep cuttings alive in boiling vitriol flasks; the Chapterhouse itself is split between
  > those who call *loiv-staun* feral Ancient borehole grout and a quiet minority—the only people on Krator—who suspect the
  > deep vent-stone is alive.
- **For `LORE.md` §6.12 / §6.16 (under `Ranj` & `Hykkousoi`):**
  > *Proposed:* Ranj's symbiotic fungus fruits only where it breathes trace methylsiloxane and selenium vapours exhaled by
  > live subsurface rheolith throats—why wild Ranj bleeds along the Throne's eastern rifts, why Voth's monsoon-drenched
  > clearings round riftless Zey'danin stand barren save over isolated ring-fault pipes at Temora and Spice Isle, and why
  > Hykkousoi spice-masters succeed by planting on West Ring geyser domes and mulching root-pits with freshly quarried
  > zeolite vent-sinter that holds the earth's "warm humours".
- **For `LORE.md` §6.17 (under `The Zeijani's stone eggs` & `Andarū`):**
  > *Proposed:* Beside common agate thundereggs, Zeijani carvers revere rare *Ṣṭār-eggim* (vortex-cored xenoliths from deep
  > throats) and shun *Ḫuṭṭ-eggim* (live hot-wall nodes); they feed weeping gallery cracks brimstone-and-iron paste so the
  > rock seals itself, and wall off drifts where white fluoride rime warns that deep grazers are rotting the stone. Above
  > ground under the plume, the Andarū read shed *šrūt-skinni* ("throat-skins") round fumaroles to foretell blasts, and gag
  > or salt choked vents to blow boiling acid steam across Vothic columns.
- **For `LORE.md` §8 (`Ecology highlights`):**
  > *Proposed:* **Deep vents (the Rheoliths):** Separate from both Earth's life and Krator's water-based native clade, a
  > mineral-and-polysiloxane ecosystem seeded from vitriolic Four-Day inhabits dry, sulfuric-acid volcanic throats, geyser
  > pipes and lava-crust undersides at 180–550 °C. Never seen alive on cold wet ground—where it vitrifies to glass or
  > hydrolyses to opal—it shows at the surface through five-fold *star-egg* xenoliths, leathery fumarole *throat-skins*,
  > honeycomb zeolite collars, and ringing buoyancy blisters on lava crusts; feeding, salting or poisoning a seam lets
  > those with the craft seal cracks, gag or trigger geysers, and rot lava crusts.

---

## 10. Settled & open decisions

- **Settled (2026-11-17):**
  - *Origin:* Panspermia down the Laplace well from vitriolic **Four-Day** (§2).
  - *Ranj link:* Adopted with the full Ring distribution (§6.3a: East/NNE Throne rifts, riftless Zey'danin failure, Voth's
    ring-fault pockets at Spice Isle & Temora, Hykkousoi geyser-dome siting + zeolite vent-sinter mulch).
  - *Geomancers' inner circle:* Kept **divided** (§6.1: feral Ancient borehole grout vs. living deep-rock organism).
  - *First prototype:* Standalone `biomes/rheolith/` (`RHEO_PHYS` + unit tests + `dist/rheolith.html` *The Breached Throat*
    with `[Gag]`, `[Salt]`, `[Dross]` controls).
- **Kept open (per 2026-11-17):**
  1. **Firebliss's people (`section 6.4`):** Who, if anyone, lives permanently in the Firebliss Range—and whether the held
     Firebliss Patera (`biomes/firebliss/PLAN.md` §11) turns on—stays open until the owner decides.

