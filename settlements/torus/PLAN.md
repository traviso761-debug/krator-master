# Torus: the plan (draft, 2026-10-17)

Torus is a Vothic city built round the ruined **Forest Ring** arcology, 70 km east-north-east of Voth on the Torus river, 47 km
from the Ring Sea, and the Kingdom's major agricultural centre. Its lore is `LORE.md` §6.12 ("The cities of the
Kingdom"). Drum (`settlements/drum/PLAN.md`) is its twin and holds the shared design: the same three layers (the
reclaimed Ancient town, post-apoc beyond it, the Chichani district), the same phases, and whatever is built for one is
built for both. This plan says only what is Torus's own.

Owner's brief (2026-10-17): a city built around the ruined Forest Ring arcology; submitted around the same time as
Drum; a major agricultural centre; similar architectural style to Drum, with a similar Chichani district.

## 0. What differs from Drum

| | Drum | Torus |
|---|---|---|
| The arcology | `kits/ancients` target `drum`: a tower, 836 m | `kits/ancients` target `ring` (`src/71c-ring.js`): the **Forest Ring**, the barrel arcology, 1,440 m across, bulging at the waist, three concentric circular toruses of forest with terraced living bands between them; ruined state (decay 1) |
| The country | the bay country drying toward the Scyvoi | the Torus river's plain and the bay's farmland: fields, orchards, chinampas on the river, mushroom farms, windmills, villages |
| The fortification | heavy: a frontier | ordinary: a wall and gates, the fortress smaller; Torus's garrison is a granary guard |
| The city's trade | salvage, livestock | grain, fruit, the Kingdom's larder; the Voth catalog's bonded grain store and canal warehouse, the farmhouses (Velothi, chinampa, Hlaalu) |
| Site | px 401,602 | px 502,677, inside the Vothic Kingdom 40 km from its border, the Crag Men's polygon 32 km south, Hook 176 km north-east, Pylon 190 km east |

## 1. The site

The scale model has Torus at px 502,677. The Torus river (*Tors Rivrh*, 58 m3/s) runs past to the Ring Sea 47 km
north. The Forest Ring's rim is 720 m from its centre; the city wraps three quarters of it and the river the fourth.

| Zone | Where | What |
|---|---|---|
| **The Ring** | the centre | the ruin: the lowest torus farmed (terraces of crops where the forest was), the upper two wild forest, the living bands lived in with post-apoc dwellings |
| **The Court** | the ring's foot | the Ancient town, reclaimed (decay 3): the chiefdom's hall, granaries in Ancient halls |
| **The Chichani district** | south-east, on the rise | the governor's palace, the Ordinator citadel, the Temple college, the manors; the Kingdom's granaries under the citadel's eye |
| **The Market town** | between the Court and the gates | post-apoc shops and stalls among Voth shops; the grain market |
| **The Shanties** | the west and north | post-apoc dwellings of the farm labour |
| **The River quarter** | the Torus river | mills, the grain wharf, the chinampas off the bank |
| **The Country** | outside the wall, 3 km | fields, orchards, villages, mushroom farms, windmills: Voth's country (`settlements/voth` steps 13, lifted by name) scaled to a breadbasket |

The country is the point of Torus and comes first after the arcology in P1: the site editor draws the fields as
`core/city` fields (`KCITY.boxIndex`), the villages as satellite sites, the irrigation off the river.

## 2. The layers as kits

As Drum's (`ancient` 10%, `salvage` 50%, `voth` 30%, mixed 10%), with the Voth catalog's farm pieces on the country
and the ring's lowest torus drawn as crop terraces by the swbay kit's `crop-*` stands (the isle demo's crop list,
`biomes/ringisles`, if the swbay kit lacks them: that is a P1 gap to name).

## 3. The order of work

Drum's phases P0-P5, run for both cities in step; Torus adds to P1 the country and to P3 the farmed torus and the
granaries.

## 4. Views for the verify

| View | What it must show |
|---|---|
| Overview from the north | the Ring over the town, the fields to the horizon, the river |
| The farmed torus | the crop terraces where the forest was, the wild toruses above |
| The grain wharf | the river, the mills, the chinampas |
| The Chichani district | the palace and citadel over the granaries |
| Night | the district lit, the farm villages' fires beyond the wall |

## 5. Open questions for the owner

1. Is the lowest torus farmed (the plan), or do the Chichani forbid it as the Ancients' forest?
2. How far does the country reach: the plan draws 3 km of fields; a breadbasket for the Kingdom might want more, as
   satellite villages at the scale model's resolution rather than in the page.
3. **Settled (2026-10-18).** The Forest Ring's people are the **Rinkvolk**, the ring-folk (ring + folk by the Vothic
   rules); Izani *Torani*, Vothic *Tors*.
