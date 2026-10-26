# godthrone: the plan (draft, 2026-10-26)

**The Godthrone and the airless rim**: Krator's heights, where the air thins below what anything breathes. The Godthrone
is the shield volcano south of the crater (`LORE.md` §2: "almost Olympus Mons size", its upper reaches airless); the
airless rim is the Outer Wall's crest, all the way round. Little lives up here. The kit is mostly **ground**: rock,
glass, ice and frost, laid out by `core/terrain`, coloured by the strata module and lit by a thin-air sky.

Not the Throne: `biomes/throne` is the volcano at the crater's centre. This kit is the Godthrone.

Owner's brief (2026-10-26):
- **A vent at the Godthrone's highest point**, and the summit raised to Olympus Mons size, so the top is airless in
  practice. This is the 4.23 edit (`tools/scale-model/README.md`, "Proposed for 4.23").
- **Why Krator is volcanic**: a moon locked to its gas giant, heated by tides, with one thick, unmoving shell and focused
  volcanism (the lore note in the same 4.23 item).
- **The Godthrone's lava is titanium-rich**: black, very fluid, and its fountain glass orange, as the Moon's is.
- **The bloodfalls**: an arctic highland in the Godthrone's ice belt where iron-rich rock meets glacial meltwater, and
  the blood river that flows down from it (section 4; the candidate is Qol Ḍrāi).

**Status: plan, awaiting the owner.** Nothing built.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/godthrone/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations, as Korona's and the Throne's: `dist/godthrone.html` (station 1) and `-flank`, `-orange`, `-scarp`, `-rim`, `-blood` (section 7) |
| References | `refs/` (the colonnade scarp, the bloodfalls, the red meltwater, the red riverweed) |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, the strata module), `core/atmos` (the thin-air sky, section 2) |
| Owns | the `godthrone` polygon (323,368 km²), and the **airless band everywhere** (the model's class O, from ~9 km): a heights layer every wall kit reads in place above its own top band (`nwouterwall`'s "airless rim", the W outer wall, `riftrim`, `ebadlands`' outer rim, Yuni's valley walls, the Catch's walls) |
| Its own flora | almost none (section 5): the endoliths in the glass and a few crusts in the HF band |
| Object | `GODT` (`build`, `dress`, `SPECIES`, `GROUND`), on the `BIOME-API.md` contract |
| Out of scope | Pluton's ruin and the Ancients' tunnels inside the mountain (a settlement plan of their own); the ET and EF bands below the airless line on the walls, which belong to each wall's kit |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. The ground (scale model 4.22, surveyed 2026-10-26; the summit after 4.23)

**4.23 is built** (2026-10-26, `tools/scale-model/edit_423.py`, `tools/scale-model/README.md` "4.23"; the model page is version 88): `DATA.hi` is 27,000 m;
the **cone is a weathered shield that fills this polygon** (contours from a round summit rim out to the polygon's outline,
each lower contour parallel to its edges, a slope of ~0.065 over the 210 km from the rim to the 11 km contour), the **rim at 25.0 km**
(0.07 atm; no cell is higher), a 65-77 km caldera with its floor at ~22 km and a nested pit 900 m deeper, and the summit vent at px 577.85, 932.59.
~317,000 km² of ground rose, up to 10.7 km, and radial gullies were cut into it (a stream-power pass, mean cut 110 m, none over 1,200 m).
The rows below were surveyed on 4.22; re-survey them on 4.23 before the open world is cut.

**The polygon**: 323,368 km² (px 389-739 by 748-1159). Climate class O 248,888 km², HF 39,796, EF 29,316, ET 5,280.
Rain is nil over almost all of it (median 0 mm; the wettest twentieth of it ~80 mm).

| Band | km² | Air | Mean (warm/cold month) | Class | What it is |
|---|---|---|---|---|---|
| 5-6 km | 2.5k | 0.80 atm | -10 °C (3/-23) | ET, EF | the foot, where the polygon meets its neighbours |
| 6-7 km | 23.7k | 0.71 | -15 (-3/-28) | EF, ET, HF | cold-based ice, debris-covered tongues |
| 7-8 km | 16.0k | 0.63 | -21 (-8/-34) | EF, HF | **the orange belt** (section 4) |
| 8-9 km | 32.7k | 0.55 | -27 (-14/-40) | HF, O | the dry-cold line |
| 9-12 km | ~141k | 0.49-0.38 | -33 to -45 | O | the high flank: fresh flows, pit chains, the glass mantle |
| 12-17 km | ~107k | 0.34-0.19 | -51 to -82 | O | the upper shield |
| 17-25 km (after 4.23) | the summit | 0.19-0.07 | ~-75 (held: below) | O | the caldera and the summit vent |

- **The summit is a clipped table on 4.22**: 8,416 km² (100 by 108 km, centred on px 575,937) flat at 17,098 ± 9 m, the
  raster's ceiling. **4.23** raises the ceiling and carries the flanks up to a **caldera rim at ~25 km** (0.07 atm), a
  nested caldera 60-80 km across and 2-3 km deep, its floor ~22 km, and **the summit vent** on that floor.
- **Above ~0.1 atm of air the ground's temperature is the sun's**, not the air's (Mars: a mean near -60 °C, days to +20,
  nights to -80). The 4.23 climate holds the mean at about -75 °C above 17 km rather than carrying the lapse to -135.
- **The flanks**: from ~13-14 km at 40 km out to ~10-11 km at 120 km, then down to their feet 300-500 km out. Two sides
  fall hard, as Olympus Mons's **basal escarpment** does: toward the south-western bay (px ~455,870) from 10.4 km to
  0.7 km in 80 km, and on the north-east into the Bowl (to -0.9 km). Elsewhere the shield runs on into the airless
  highlands that join it to the south-western Outer Wall (one airless body of ~510,000 km² with it).
- **Vents**: two on 4.22, both on the south-east flank toward the Catch (px 716,1128 at 11,080 m; px 770,1168 at
  8,535 m), and the summit vent after 4.23.
- **Neighbours**: godstep valley (north-east), the southern highlands, the Rift and rift rim N, the Catch, the Talovolci
  (8,600 km² of overlap) and Xanadu (1,600).
- **The ice country** on the south flank: an EF belt of **25,316 km²** (px 404-665 by 1055-1146) at a median 6,739 m,
  its snow 60-200 mm a year: the Godthrone's one arctic highland. In it a **closed lake of 112 km² at 6,419 m** (px
  571,1068; spill 6,813 m, no outflow, so it evaporates and concentrates: saline), sealed behind an ice-covered ridge at
  ~6.7-6.8 km. Just over that ridge, at ~5.3 km, **Qol Ḍrāi** (Xanadui, "the cold dry valley", r442) begins and falls
  into the Vale of Xanadu: the blood river (section 4). A second lake, 32 km² at 5,503 m (px 424,1098).
- **Pluton** (ruined arcology, px 471,998, 9,535 m, mean -33 °C) on the airless flank: the key to the tunnels the
  Ancients drove up inside the mountain to its summit (`LORE.md` §4), ~270 km of tunnel climbing ~15 km after 4.23.

**The airless rim**: the class O and HF ground outside the polygon, the Outer Wall's crest and the outer rim behind it
(~2.2 million km² in one body round the crater, and the western body above). By height, outside the polygon:

| Band | km² | Air | Mean (warm/cold) |
|---|---|---|---|
| 8-9 km | 379k | 0.55 atm | -26 °C (-13/-39) |
| 9-10 km | 463k | 0.49 | -32 (-19/-45) |
| 10-11 km | 496k | 0.43 | -38 (-25/-51) |
| 11-12 km | 409k | 0.38 | -44 (-31/-57) |
| 12-13 km | 304k | 0.34 | -51 (-38/-64) |
| 13-15 km | 240k | 0.28 | -58 (-45/-71) |
| 15-17 km | 16k | 0.20 | -66 (-53/-79) |

No rain falls on any of it.

## 2. Air, light and what "airless" means here

The model's formula (1.6 atm x e^(-h/8 km)) gives 0.57 atm at 9 km, 0.2 at 15 and 0.07 at the new 25 km rim. Nowhere
is a vacuum: "airless" in this kit means **no one breathes here unaided**. That is what the physics allows, and it
decides the landforms (section 4):
- Dense enough to stop micrometeorites: no space weathering, no Moon-like darkening of the rock.
- Too thin to carry much weight in its wind, but it still blows: ventifacts and sand ripples, slowly.
- Too dry and cold for liquid water above the **dry-cold line** (~8-9 km): above it rock and glass stop changing
  colour. Antarctica's Dry Valleys are the analogue.
- At 0.07 atm the fountain's droplets meet about a fifteenth of Earth's drag. They fly several times further than in
  Hawaii and fall as a halo tens of km across, as the dark ash blankets round Mars's volcanoes do.

**The sky** comes from `core/atmos`'s pressure-driven preset (`biomes/WORLD.md`, "The air"): at 0.4 atm a deep blue
zenith, at 0.2 a dark violet-blue one, at the rim's 0.07 nearly black overhead, the sun small and white, the horizon a
thin bright band, shadows hard and dark with little sky-fill. The lowlands' milky glare is the same preset at the other
end. A station page is where the preset's thin end is tuned.

## 3. The rock: titanium basalt and its glass

**Titanium-rich basalt** (the owner, 2026-10-26), like the Moon's high-titanium maria:
- **Black, with a faint metallic sheen** from ilmenite, very fluid when molten: thin flows, long ones, smooth plains,
  lava channels that carve their own beds (sinuous rilles), tubes.
- **Its quenched glass is orange** (titanium); droplets that crystallise in the dense core of a fountain come down
  **black**. Fountain deposits are a mix of the two, beads of 0.05-1 mm.
- **Fresh above the dry-cold line, altered below it.** Basalt glass that meets water turns to **palagonite**, a soft
  yellow-orange to ochre. On Earth that takes a few thousand years; above ~8-9 km here it never happens.
- **Ilmenite sand**: the heavy black grains the wind and the rare meltwater sort out of the flows, gleaming.

Two strata recipes for `core/terrain/STRATA-PLAN.md` (added there on approval):

| Recipe | Beds | Effects | For |
|---|---|---|---|
| `tibasalt` | thin flows (1-15 m), black with an ilmenite sheen; **orange and black glass-bead horizons** between eruptions (0.1-2 m); rubbly flow tops; below the dry-cold line the bead beds turned ochre palagonite | hard flows as ledges, the bead beds recessed; no varnish above the line | the caldera's walls, the basal escarpments, rille and pit walls |
| `megabreccia` | **no beds**: blocks of every rock, metres to hundreds of metres, at every angle, in a grey matrix flecked with black and bottle-green impact glass; shatter cones on fresh faces; at the crest the **overturned flap**, the crater's beds folded back on themselves upside down | the blocks keep their own colours fresh above the dry-cold line; no varnish | the airless rim's crest and the W outer wall's slump scarps (`biomes/wouterwall`, when planned) |

## 4. Landforms (`core/terrain`)

**On the Godthrone**, top to bottom:
- **The summit caldera** (after 4.23): nested collapse pits with terraced walls of stacked `tibasalt`, a flat glassy
  floor, the summit vent: a fissure and spatter rampart that fountains now and then, fuming in between.
- **The glass halo**: round the summit vent, bead sand mantles everything for tens of km, **orange near the vent and in
  the thick drifts, black where the crystallised beads dominate**, banded where eruptions alternated. It never weathers
  and the thin wind barely moves it, so every old fountain keeps its halo. **Pele's hair** (golden glass threads) is
  caught in the hollows in mats.
- **The high flank's lava plains**: long lobate flows with levees and central channels, sinuous rilles, **pit-crater
  chains** where tubes collapsed, skylights, the flows' black surfaces dusted with bead sand in the hollows. Old flank
  vents keep their own small halos, a field of dark rings.
- **Frost, not snow**: hoarfrost grown straight from the air on shaded rock, sublimation pits and scalloped hollows in
  any old ice; no snowfall to speak of.
- **The dry-cold line and the orange belt** (~7-9 km): where meltwater reaches the glass a few days a year it turns to
  palagonite, so the black and orange halos fade downslope into **ochre and rust-orange**; tafoni and honeycomb rock in
  the salt-weathered flows.
- **Palagonite ridges**: in the orange belt the soft altered glass weathers into knife-edged ridges and deep gullies
  that hold snow all summer, moss on the lower slopes (`refs/05`).
- **The ice belt's edge**: the ice cap ends over a cliff of stacked flows, meltwater falling from under it, turquoise
  proglacial lakes on the black outwash below (`refs/06`); the bloodfalls are one such fall, red.
- **Debris-covered ice** (6-8 km, EF): relic cold-based glaciers buried under rubble, as on the Tharsis volcanoes'
  flanks on Mars and in Antarctica's Dry Valleys: lobate tongues and ridged fans of moraine with ice under them,
  sublimation pits where the cover is thin.
- **The basal escarpments** (the south-western bay side and the Bowl side): cliffs and steep slopes kilometres high
  cutting the stack of flows, each one a ledge, the bead horizons as orange stripes between; thick flows stand in
  colonnades (`refs/01`).

### The bloodfalls and the blood river (the owner, 2026-10-26)

Where iron-rich rock meets glacial meltwater: **a red fall out of the ice** and a red river below it, as at Antarctica's
Blood Falls (`refs/02`) and Colombia's Caño Cristales (`refs/04`).

- **Why it is red.** Titanium basalt is rich in iron (its ilmenite is iron-titanium oxide). Under the ice belt, water
  sealed away from the air for a very long time dissolves the iron as colourless ferrous iron. The mountain's heat (a
  heat-pipe world's warm ground) keeps meltwater liquid under the ice, and salts from the vents' gases make it a brine
  that stays liquid even where it meets the cold. **Where it comes out into the air, the iron rusts in seconds**:
  the water runs blood-red and stains the ice, the rock and the snow.
- **The source**: the closed lake at 6,419 m (section 1) is the reservoir: frozen over, its brine below the ice, as in
  Antarctica's sealed lakes. Its water seeps through the fissured basalt under the ice-covered ridge to the south.
- **The bloodfalls**: where the brine comes out at the ice belt's southern edge, at the head of **Qol Ḍrāi** (~5.3-5.7 km,
  px ~585-595 by 1105-1112): a red cascade down an ice cliff, red-stained icicles and terraces of rust, a red pool steaming
  faintly on cold days, the meltwater channels across the glacier above running red where they pick up the seep
  (`refs/03`). The tributary **Biṭā Ḍrāi** (Xanadui, "the bitter dry valley") joins at 4.9 km: the model's names already
  have the brine in them.
- **The blood river**: Qol Ḍrāi falls ~3 km in its first ~15 km (4,839 m to 1,988 m), then runs on through the Vale of
  Xanadu's dry country (Csb, Csa, ~270-330 mm) to 1,208 m. Below the falls the rust settles out, so the river stays red
  because of its **riverweed**: a native red water plant that thrives on the iron (Caño Cristales' red weed is the habit),
  carpeting every rapid and pool in crimson and purple. Its lower course is the Xanadu and rift kits' ground; they draw
  the weed.
- **On the model** (**done in 4.23, 2026-10-26**: Qol Drai (r442) is perennial and named Red Riwa on the model, +4 m3/s, joined to Siwipt Sitrim (r272), which runs on to the Rift's lake; `tools/scale-model/README.md` "4.23". The plan below was the proposal): on 4.22 Qol Ḍrāi is a dry valley (9.3 m³/s at its end) that
  dies out at 1,208 m (px 555,1134). Made **perennial** (the brine and the ice belt's melt), carried ~25 km on into the
  Rift's lake at -717 m (px 541,1156, where Wāiṭ Ḍrāi ends), it would put a red plume into the Rift's lake. Its name
  stays the owner's call (the Xanadui for "blood river").

**On the airless rim**: the crater's crest in `megabreccia` and its overturned flap; **tafoni and honeycomb** weathering;
**ventifacts** (wind-faceted stones) and desert pavement; **sand-wedge polygons** in the regolith; blockfields; relic
debris-covered ice in the cirques; hoarfrost. The rock keeps its own colours, unvarnished, above the dry-cold line.

The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 5. Life

Almost none, and that is the point: the first kit where the ground is the whole show.
- **Endoliths in the glass** (Krator's own, after Antarctica's cryptoendoliths): a green or black band a few mm under the
  surface of translucent glass beads, broken flows and quartz, seen where a stone is split or a drift is scuffed. To ~9
  km on the Godthrone, a little higher on the rim's sunny faces.
- **Crusts** in the HF band: black and orange lichen on the lee of boulders, snow algae on old ice in the EF band.
- **Iron-eaters** at the bloodfalls: rust-red microbial mats on the seep's terraces, living on the iron and the brine, as
  Blood Falls' microbes do; below them, the blood river's red riverweed (section 4).
- No plants, no animals, no settlement above Pluton.

## 6. The people's side

No one lives here. Pluton's ruin and the Ancients' tunnels to the summit (`LORE.md` §4, `openworld/ANCIENT-ROADS.md`) are
a settlement and dungeon plan of their own; this kit leaves room for a **sealed portal on the caldera's rim** where the
tunnels come out, which that plan dresses. *Proposed*: the Talovolci hold the Godthrone sacred (their land runs to its
foot, and it is the spiral's own mountain if a flow spirals); the orange glass is a pigment and a trade good, gathered
from the halos' edges by parties who climb on bottled air or Ancient breathing gear.

## 7. Stations

1. **The summit vent** (`dist/godthrone.html`, ~22-25 km, after 4.23): the caldera's floor and terraced walls, the
   vent fuming, the orange and black halo, the sky nearly black overhead. The sealed portal on the rim.
2. **The high flank** (`-flank`, ~11-13 km, 0.4-0.33 atm): a black lava plain with levees, a sinuous rille and a
   pit-crater chain, old vents' dark rings, frost in the shadows.
3. **The orange belt** (`-orange`, ~7.5-8.5 km): the dry-cold line, black flows going ochre downslope, palagonite
   cliffs with tafoni, debris-covered ice below, the endolith band in split stones, the first crusts. Near Pluton.
4. **The basal escarpment** (`-scarp`, the south-western bay side): the stack of flows in a cliff kilometres high, the
   bead horizons striped orange through it. (Optional: the strata module's showpiece.)
5. **The airless rim** (`-rim`, ~10-12 km on the Outer Wall's crest; the site chosen from the model in G0, best where it
   stands over a station of a wall kit): the megabreccia crest and its overturned flap, tafoni, ventifacts, sand-wedge
   polygons, relic ice in a cirque.
6. **The bloodfalls** (`-blood`, ~5.5 km, the ice belt's southern edge, EF): the red cascade out of the ice cliff, the red
   meltwater channels on the glacier above, the rust terraces and the red pool, the blood river leaving down Qol Ḍrāi
   with the first riverweed in its rapids, the Vale of Xanadu far below.

## 8. Textures

Already in the library: `ground.lava.aa`, `ground.lava.crust`, `ground.lava.veins`, `ground.obsidian`,
`ground.sand.black`, `ground.scoria`, `ground.cinder`, `rock.basalt.flowbanded`, `rock.basalt.oxidised`,
`rock.basalt.polygonal`, `rock.basalt.vesicular`, `stone.pumice`, `ice.glacier`, `ice.clear`; `beads.glass` to be checked
as a bead-sand base.

To source or generate (generic ids so other kits reuse them; the prompts go into `core/materials/PROMPTS-NEEDED.md` in
G0): **orange glass-bead sand** (the Moon's orange soil: orange and black beads, a little sheen); **palagonite** (ochre to
rust-orange altered glass tuff, crumbly); **Pele's hair** (golden glass threads in a mat, a card); **megabreccia** (a
patchwork rock face of mixed blocks in grey matrix); **tafoni** (honeycomb-weathered rock); **debris-covered ice** (rubble
over blue ice, sublimation pits); **rust-stained ice** (blood-red seep over white and blue glacier ice, frozen drips);
**rust terraces** (iron-oxide crusts stepped like travertine); **red riverweed** (a crimson water-plant mat, for the Xanadu
and rift kits too); **titanium basalt** (black with an ilmenite sheen, or a tint of `rock.basalt.*`).

## 9. Order of work

- **G0.** The owner approves the plan; the 4.23 edit (the ceiling, the summit and its caldera, the summit vent, the
  climate, the lore note); the texture prompts; the rim station's site chosen from the model.
- **G1.** The kit on the biome core with no flora: fields (height, air, the dry-cold line, the glass halo's distance
  from each vent, ice), zones, station 1's ground on the 4.23 heights.
- **G2.** The strata recipes `tibasalt` and `megabreccia` (after `core/terrain/STRATA-PLAN.md`'s S1-S3).
- **G3.** The landforms: the caldera, flows and levees, rilles, pit chains, the halos, debris-covered ice, the rim's
  tafoni, ventifacts and polygons.
- **G4.** The thin-air sky: `core/atmos`'s pressure preset tuned at its thin end.
- **G5.** Stations 2-6; the endoliths, crusts and iron-eaters; the bloodfalls' seep, stained ice and rust terraces.
- **G6.** `verify.py --assert`, `PORT.md`, the index tools, `tools/check_core_use.py`, the gallery.

## 10. Open questions

- The caldera's exact size and depth, and whether the summit vent is active now (fountaining every few years) or only
  fuming.
- Whether the airless band is drawn as this kit everywhere, or each wall kit draws it from this kit's fragments (the
  same ground either way; the difference is who owns the pages).
- The Talovolci's relation to the mountain, and who gathers the orange glass.
