# The geyser basin — notes

## The brief (the owner, 2026-10-07)

"Let's do the geyser biome. This will be relevant to the mainland also, as there are areas (eg, the Steampits) on the
mainland that would be similar." Chosen from the options offered:

- **A new shared biome kit** (`biomes/geyser`, on the shared core), not a Throne station: the Steampits on the
  mainland, the West Ring's geyser isles and, later, the Throne's own geyser isle (station 4) can all load it.
- **The showcase: a geyser basin in the jungle.** A broad steaming basin cut into the hyperjungle, with geysers on
  sinter cones erupting on cycles; prismatic hot springs with mat-banded run-off channels; travertine terraces
  stepping down to the sea; mud pots and fumarole fields; dead forest drowned in silica at the edges, with the jungle
  walling it in.
- **All four features:** erupting geysers (each on its own cycle: rest, preplay, column, steam phase; set off by hand
  or left to the timetable), terraces (stepped warm blue pools), prismatic springs (blue, green, yellow, orange,
  brown rings and colour-streaming run-off), thermophile life (Krator's own heat-loving flora plus adapted Earth
  stragglers).

## Where: the Steampits (the scale model, v4.20, 2 km a pixel)

The Steampits are a thermal province on the mainland's north shore of the Ring Sea, ~244 km north of the Throne's
vent (polygon about px `[[554,380],[571,401],[584,406],[601,410],[625,389],[630,367],[584,355],[564,364]]`, ~150 x
110 km). Read off the model's rasters:

| | |
|---|---|
| height | median -1486 m (-2182 to -549): about the Ring Sea's level; ~1.9 atm; 18% of it water |
| climate | mostly XA (hypertropic jungle, abyssal) and XV (abyssal savanna); WS sea |
| rain, temperature | ~1500 mm; mean ~33 degC (warm month 37, cold 29) |
| geysers | the model's `vents` (kind `geyser`) in and near it at about (565,403), (595,403), (593,405), (581,423), (583,423), (615,417/419), (629,417), (633,393); many more ring the Throne's isles (the West Ring geyser isles); their `floor` -400 to -1300 m |

At ~1.9 atm water boils at ~119 degC, so the springs and the geysers' water run hotter before they boil than on Earth;
the mats keep Earth's temperature bands (life's chemistry, not the pressure, sets them).

**The showcase is one basin of it**, ~2.8 km across (R 1400), the size of one of Yellowstone's basins: `45-host-stage.js`
says what is where. The Throne stands far to the south over the sea in the sky (its summit ~2.7 degrees up, its plume
leaning east).

## The kit

**Layout as data** (`46-biome-geyser-layout.js`, `[G data]`): a host hands `GEYSER.lay(spec)` its thermal layout
(BIOME-API.md) and its ground before the thermal relief. The kit lays out records and from them answers the host's
terrain (`GEYSER.relief`), the life's and the ground's questions (`GEYSER.at`: heat in degC and 0..1, sinter, film,
acid, dead, spray, terr, the flow's direction), the water (`GEYSER.waterAt`) and the clocks (`GEYSER.cycle`).

- **The run-off** is traced downhill from every spring's rim and geyser's mound on the host's ground, with inertia and
  a little wander, until a sink (the host's creek, the sea, a terrace flight), a stall, or its length (by its source's
  size). It cools as it runs (`chT`: from the source's temperature toward the air's, exponentially) and spreads
  (`chW`).
- **The mats** follow the water's temperature, Yellowstone's bands: nothing photosynthetic over ~73 degC (the sinter
  bare and wet), yellow-green to ~63, orange to ~52, orange-brown, then brown-olive under ~45. The ground's shader
  draws them where the film lies, streaked out along the flow (fanned out round a spring): Grand Prismatic's orange
  fingers. The springs' own water is banded from the middle out by their temperature (deep blue where it boils).
- **The terraces** (travertine, the Stair; rebuilt 2026-10-07 after the owner's Pamukkale, Mammoth and Badab-e Surt
  photographs: "fewer, larger, more irregular pools, irregular in height too"). A flight is a field of POOLS, not bands:
  seeds on a jittered grid in the flight's frame (cells ~30 m across the slope, ~18 m down it, a third dropped so some
  pools are big), weighted (a power diagram), their boundaries warped at three scales. Each pool has its own LEVEL: the
  ground at its seed drawn hard toward the flight's TIERS (the ground in steps of 2.6 m, their edges wandering) with a
  little of its own. So the pools crowd onto tiers with tall white walls between them, and pools of nearly one level
  join into one. A higher pool's rim bulges into the lower one (most in the middle of their shared edge): convex arcs
  downhill, cusps pointing up. In a pool: its floor; toward a lower pool its rim (a crest and an inner face, both wider
  the bigger the drop); toward a higher one that pool's curtain, wider the taller the drop. **The pools fill in the
  ground's shader**: each vertex carries its pool's level (and its square: a triangle that spans two pools has a spread
  and draws no water), and a fragment under that level is water (turquoise where hot, greener as it cools). The walls are
  white, draped with drip ribs, the water sheeting down them. No water mesh.
  **Its source and its foot** (the owner: "not clear where the water is coming from", "nor does the bottom interface
  with the shore"): the Stair Spring at its head is a travertine spring (milky turquoise, steaming, no banded mats) on its
  own mound, pouring three broad channels into the top pools; a quarter of the pools stand dry (white flowstone) and the
  floors are uneven, so shallows show pale. At the foot, the pools on the beach are THE SEA (the sand left as it is),
  every real pool stands at least 1.1 m over the water, the last tier's wall stands on the black sand, and outfalls
  run from its lowest pools across the beach into the surf, cooling as they go.
- **The run-off's water** (`65`): a thin sheet draped down every channel, rippling downstream, clear and a little blue
  where hot, so the mats under it show.
- **The eruptions** (`65-biome-geyser-show.js`, `[G shader]`): a drop is thrown up again and again, its age within its
  flight, launched at (now - age) as hard as the geyser's cycle says it played then (GEYSER.cycle, the same maths in
  GLSL). The column stands at once wherever the clock is set; `GEYSER.erupt(key,t)` moves a geyser's clock so its
  column starts at t. Cones jet narrow; fountains burst wide out of their pools; spouters never stop. Steam rises off
  the column and rolls downwind, roaring on through the steam phase; mist where the water lands. Gravity 0.75 g.
  Periods are shortened for a page (a real geyser like the Old Kettle would play every few hours).

## The life (`50`, `55`, `57`, `60`)

| | origin | where (`heat` tag) |
|---|---|---|
| **Stilt pandan** (a screwpine on stilt roots that keep its trunk off the warm ground; strap leaves, orange keys) | Earth | margin: the floor's cool meadow, the creek |
| **Thermal kanuka** (New Zealand's geothermal kanuka: gnarled, tiny leaves, white flowers) | Earth | warm crust |
| **Glass cane** (colonies of hollow stalks armoured with the silica of the spray: opal, banded, beaded at the tips) | Krator | splash: where the geysers' water falls |
| **Steam comb** (a stalk holding a fine fan toward a fumarole, combing water out of its steam) | Krator | hot: round the fumaroles, the acid field's edge |
| **Silica snags** (hypertrees the spreading sinter killed: grey, white-socked, broken; a quarter fallen) | dead | the dead forest |
| hot-springs panic grass, thermal fern, nodding clubmoss, geothermal moss | Earth | warm crust, meadow |
| flame streamers (orange filaments streaming in the run-off), mat jelly | Krator | water: the run-off under ~60 degC |
| kettle lily (pads and flowers on the Stair's cooler pools and the creek) | Krator | water |
| warm reed | Earth | the creek |

Nothing roots over ~70 degC, in a spring, in the run-off's sheet or in a terrace pool; the sinter flats are nearly bare
(their edges only). The **hyperjungle** (its own kit, read in place from `biomes/hyperjungle/src` by `build.py`, in its
own registry) grows on the plateau, the basin's walls and the coast; this kit on the floor, the Stair and the dead
forest (`88-host-build.js`: the mask is swapped per kit, as the Throne's kipuka does).

## Building it

```
cd biomes/geyser && python3 build.py                 # dist/geyser.html + dist/geyser.tex.geyser.js, .tex.hyperjungle.js
python3 verify.py dist/geyser.html --assert          # the invariants, the host's checks and their negative controls
python3 ../../tools/textures/pack.py biomes/geyser   # (from the repo root) after a change to materials.json
```

The page reads its library maps from the sidecar files beside it (publish them with the page); `--inline-packs` puts
them back in the page. `?q=0.5` builds at half density; `?nojungle`, `?nofauna`, `?nobake` as in the other kits.
