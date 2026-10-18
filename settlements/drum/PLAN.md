# Drum: the plan (draft, 2026-10-17)

Drum is a Vothic city built round the ruined **Drum** arcology, 220 km north-west of Voth on the Drum river, 47 km
from the Scyvoi's country. Its lore is `LORE.md` §6.12 ("The cities of the Kingdom"). Torus (`settlements/torus/
PLAN.md`) is its twin: the same build with another arcology, another river and a farming country; the two plans share
their phases, and whatever is built for one is built for both.

Owner's brief (2026-10-17): a city built around the ruined Drum arcology from the Ancients kit; submitted to Voth
after the destruction of Wing put the fear of Tzintzun into them; a small, semi-repaired Ancient town round its base
and many post-apoc style buildings; the Chichani's mark is a governor's palace, a fortress and an Ordinator citadel,
with some wealthy buildings in a nearby district; heavily fortified, as it is often subject to Scyvoi raids.

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/drum/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`) |
| Pages | `dist/drum.html` (the city), `dist/drum-site.html` (the site editor, Voth's read in place) |
| The arcology | `kits/ancients` target `drum` (`src/8af-drum.js`, `buildDrum`): the round tower of radial fins and stacked dwelling blocks in nine tiers, 836 m, three arched sky gates, in its **ruined** state (decay 1: the fallen top lies inside 900 m), read in place with its court and radiating walls |
| The Ancient town | the Ancients kit's buildings at decay 3 (reclaimed: the salvage pass patches them) round the Drum's court: the small town the chiefdom kept up |
| Post-apoc | `kits/post-apoc` with its `voth` culture pack (deep purple, the ash-white glyph, ragged cloth): the city beyond the Ancient town |
| The Chichani district | the Voth building catalog (`settlements/voth/catalog`: the governor's palace, the Velothi fortress, barracks, mustering grounds, manors and clan compounds, rich houses, shops, the Temple college) and `voth_bldg_citadel` (`kits/catalog/krator-master-buildings-voth.js`) for the Ordinator citadel |
| Town | `core/city` steps 0-12 on the site layer (`core/city/README.md`, "Porting a settlement"); the wall is the site layer's wall |
| The raiders | `kits/scyvoi`: a raiding camp's traces outside the wall (burnt fields, a lizard-rider's tamga on the rocks), not a camp |
| Biome | the south-west bay kit (`biomes/swbay`), with the crater drylands' scrub (`biomes/crater-drylands`) on the western approaches: Drum stands where the bay country dries out toward the Scyvoi |
| Core | `core/rand`, `core/mask`, `core/tags`, `core/space`, `core/lod`, `core/host`, the shared sky; `core/furnish` for the palace and citadel interiors later |

## 1. The site

The scale model has Drum at px 401,602 (`openworld/little-demo/source/settlements.json`), inside the Vothic Kingdom,
36 km from its border and 47 km from the Scyvoi polygon's edge to the west-north-west; Voth 220 km south-east, Almua
133 km north-east, the Agropolis ruin 93 km north-west. The Drum river (*Drïm Rivrh*, 73 m3/s) runs past.

The Drum's court is 560 m across with an allée 900 m long on the south side (the target's numbers): the city takes the
court and the allée as its axis.

| Zone | Where | What |
|---|---|---|
| **The Drum** | the centre | the ruin itself: the lower tiers lived in (the arcology chiefdom's people, post-apoc dwellings lashed inside the fins), the fallen top a quarry of panels |
| **The Court** | the 560 m court | the Ancient town, reclaimed: the Ancients kit's houses and halls at decay 3, the chiefdom's hall in the largest |
| **The Allée** | south, 900 m | the processional way kept as the main street; the Vothic gate at its end |
| **The Chichani district** | east of the allée's foot | the governor's palace, the Ordinator citadel, the Temple college, the manors and rich houses of the Chichani families and the collaborating chiefs |
| **The Fortress** | the west wall, facing the Scyvoi | the Velothi fortress, barracks, mustering grounds; the wall's strongest stretch |
| **The Shanties** | north and east, inside the wall | post-apoc dwellings, workshops, markets, a shaman hut in the Chichani's despite |
| **The River quarter** | the Drum river's bank | mills, tanneries, the ferry; the river is the wall on that side |
| **Outside** | the country | burnt fields and a tamga: the last raid's traces; watchtowers along the western road |

## 2. The layers as kits

| Layer | Kit | Share of lots |
|---|---|---|
| `ancient` | the Ancients kit's buildings, decay 3 (the Court) | 10% |
| `salvage` | `kits/post-apoc`, culture pack `voth` on the sockets (the chiefdom's people under Vothic rule paint Vothic marks on their scrap) | 55% |
| `voth` | the Voth building catalog (the district, the fortress, the citadel, the gate and wall towers) | 30% |
| `scyvoi` | `kits/scyvoi` traces only, outside the wall | dressing |
| mixed | the market quarter: Voth shops among post-apoc stalls | 5% |

Every building is registered in `core/tags` with `culture` and `layer` before it is drawn. The lot filler draws a
culture per lot from the zone's mix, then a type. The Chichani district is 90% `voth`; the Shanties 90% `salvage`.

**Fortification is the city's own style**: the wall is the site layer's, drawn thick, with the Voth catalog's garrison
pieces at the gates; inside it every poor building has a stockade, a ladder up and a lookout (post-apoc `additions`:
tyre walls, decks, steel stairs); the Drum's sky gates carry watch posts. The Scyvoi raid for livestock and slaves: the
beast pens are inside the wall, and so are the fields nearest it.

## 3. The order of work

Shared with Torus: each phase is done for both cities before the next starts.

- **P0. The harness and the arcology.** `build.py` reading `kits/ancients` (the `drum` target's builder and its kit,
  decay 1) and the swbay biome in place; `verify.py` on `tools/harness.py`; the Drum standing in its ruin on the river's
  plain. Done when `dist/drum.html` shows the ruin, its court and allée, and `--assert` passes.
- **P1. The site.** The site editor saving `site/drum-site.json`: the wall, the gates, the zones with roles and culture
  mixes, the avenues (the allée, the river road, the fortress road). Done when steps 0-5 run on it.
- **P2. The town.** Steps 6-12 with the three kits' dims; the lot filler by zone; the post-apoc `voth` pack on every
  socket. Done when the town fills the site with no overlap, nothing on a street or in the river, `node
  core/city/test-city.js` green.
- **P3. The landmarks.** The governor's palace (the shared Voth programme, in the Chichani district), the Ordinator
  citadel, the Velothi fortress and the wall towers, the chiefdom's hall in the Court, the Temple college, the gate at
  the allée's foot; the raid's traces outside. Done when each stands in its zone and the views of section 4 read.
- **P4. The life.** Citizens (`core/charactermodels`: Chichani, the chiefdom's people, Scyvoi captives), beast pens,
  the ferry, the night (electric light in the Chichani district only). Done when the night view reads as a frontier town.
- **P5. The record.** `README.md`, `KNOWN_ISSUES.md`, `PORT.md`, the gallery entry, the hash into `PORT-BASELINE.json`.

## 4. Views for the verify

| View | What it must show |
|---|---|
| Overview from the south-east | the Drum over the whole town, the wall, the river |
| The allée at eye level | the processional way from the Vothic gate to the Drum's foot, the Court's reclaimed town at its end |
| The Chichani district | purple and gold against grey scrap, the palace and citadel |
| The Fortress from outside | the western wall, the fortress, the burnt fields |
| Inside the Drum | the fins, the dwellings lashed inside, the sky gate's watch post |
| Night | the district lit, the shanties' fires |

## 5. Open questions for the owner

1. **Settled (2026-10-18).** The Drum's people are the **Vinvolk**, the fin-folk (fin + folk by the Vothic rules, f
   and w to v, final g and k devoiced: `lore/tongues-of-krator.html`), in their Chichani-cousin dialect; the Izani
   Empire called them the *Drumani* (Drum + *-ani*, as *Chichani*), Voth calls them the *Drïm*. Still open: what
   became of their chief (a Vothic client governor, or replaced).
2. How much of the Drum's lower tiers is inhabited (the plan: the lowest three of nine)?
3. Is the wall Vothic work (stone, purple-trimmed gates) or the chiefdom's older scrap rampart that Voth faced in
   stone? The plan assumes a Vothic stone wall on the chiefdom's line.
