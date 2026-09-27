# World Menagerie

Procedural models of places, served to the local network by a small Python server. Ten of them so far:
**Iziz**, a science-fantasy city with its own language; **Chicago**, **Portland**, **New York** and
**Venice**, built from OpenStreetMap; **Voth**, a page of its own; and fan work generated from a seed —
**City 17**, **Night City**, **Mega-City One** (twice, once as the comics have it and once as the 2012 film
does), **Mordor**, which is a country rather than a city, **Minas Tirith**, which is the other end of the same
war, the **Kowloon Walled City**, which is one building, **Kyrene**, which is a rotating habitat with its
country overhead, **Mystery Flesh Pit National Park**, which is a hole, **Yellowstone**, which is a real national park
on top of a real one, **the Backrooms**, which go on forever, **the City** from *Blame!*, which very nearly does, and **the Shire**, which is a few miles of hedges round a hill with a hole in it. They run on the same core modules and the same page shell; each place is a data file plus a set of build
stages, and anything only one of them needs travels with that one.

The front page at `/` lists whatever the server is serving, and every scene carries a Home button and a menu
of the others. Both read `/scenes.json`, which the server builds from `site.toml`.

**Site:** http://192.168.124.227:8000/

## Site map

| URL | Also at | File | Page |
|---|---|---|---|
| `/` | `/index.html`, `/iziz`, `/iziz.html` | `iziz.html` | Iziz: massing model |
| `/?city=iziz-b` | | `data/cities/iziz-b.json` | A variant Iziz (rounder wall, another seed, more prints) |
| `/chicago` | `/chicago.html` | `chicago.html` | Chicago: massing model |
| `/portland` | `/portland.html` | `portland.html` | Portland: massing model |
| `/nyc` | `/nyc.html`, `/newyork`, `/manhattan` | `nyc.html` | New York: massing model |
| `/venice` | `/venice.html`, `/venezia` | `venice.html` | Venice: massing model |
| `/city17` | `/city17.html`, `/halflife` | `city17.html` | City 17: massing model (fan work) |
| `/nightcity` | `/nightcity.html`, `/night` | `nightcity.html` | Night City: massing model (fan work) |
| `/kowloon` | `/kowloon.html`, `/kwc`, `/walledcity` | `kowloon.html` | Kowloon Walled City: massing model |
| `/megacity` | `/megacity.html`, `/mc1`, `/dredd` | `megacity.html` | Mega-City One: massing model (fan work) |
| `/dredd2012` | `/dredd2012.html`, `/peachtrees` | `dredd2012.html` | Mega-City One as the 2012 film has it (fan work) |
| `/mordor` | `/mordor.html`, `/sauron` | `mordor.html` | Mordor: the whole land (fan work) |
| `/minastirith` | `/minastirith.html`, `/mt`, `/gondor` | `minastirith.html` | Minas Tirith: the seven circles (fan work) |
| `/fleshpit` | `/fleshpit.html`, `/mfpnp`, `/pit` | `fleshpit.html` | Mystery Flesh Pit National Park (fan work) |
| `/yellowstone` | `/yellowstone.html`, `/ynp`, `/caldera` | `yellowstone.html` | Yellowstone National Park: the real ground and the caldera |
| `/backrooms` | `/backrooms.html`, `/level0`, `/noclip` | `backrooms.html` | The Backrooms (fan work) |
| `/city` | `/blame.html`, `/blame`, `/megastructure`, `/killy` | `blame.html` | The City, after *Blame!* (fan work) |
| `/rivendell` | `/rivendell.html`, `/imladris` | `rivendell.html` | Rivendell: the cleft of the Bruinen (fan work) |
| `/shire` | `/shire.html`, `/hobbiton`, `/bagend` | `shire.html` | The Shire: Hobbiton and Bywater (fan work) |
| `/arrakeen` | `/arrakeen.html`, `/arrakis`, `/dune` | `arrakeen.html` | Arrakeen: the city in the basin (fan work) |
| `/europa` | `/europa.html`, `/conamara`, `/ice` | `europa.html` | Conamara Station: on the ice of Europa |
| `/enterprise` | `/enterprise.html`, `/ncc1701d`, `/galaxy` | `enterprise.html` | Enterprise: Galaxy class (fan work) |
| `/voyager` | `/voyager.html`, `/ncc74656`, `/intrepid` | `voyager.html` | Voyager: Intrepid class (fan work) |
| `/ds9` | `/ds9.html`, `/deepspace9`, `/terok-nor` | `ds9.html` | Deep Space 9 (fan work) |
| `/babylon5` | `/babylon5.html`, `/b5`, `/babylon` | `babylon5.html` | Babylon 5 (fan work) |
| `/kyrene` | `/hab.html`, `/habitat`, `/cylinder` | `hab.html` | Kyrene: a rotating habitat |
| `/krator` | `/krator.html` | `krator.html` | Krator: A Primer |
| `/voth` | `/voth.html`, `/cantons` | `voth.html` | Voth: City of Cantons (built from `src/voth/`) |
| `/tongue` | `/izani-tongue` | `The-Izani-Tongue_2.html` | The Izani Tongue |
| `/painting.jpg` | | `painting.jpg` | The Iziz painting; `image.png` is the master copy |
| `/css/*`, `/src/*`, `/data/*`, `/vendor/*` | | those folders | stylesheets, modules, content, three.js |
| `/healthz` | | (built in) | Returns `ok` |

Any other URL returns 404. A trailing slash is ignored.

### `/`: Iziz

A 3D city built with three.js (served locally from `vendor/`, so the LAN works without internet).
Its state lives in the URL:

**Query parameters** (`/?seed=42&city=iziz-b`)

| Parameter | Effect |
|---|---|
| `seed=N` | Builds a different city (1 to 2147483646). Each city file sets its default (Iziz: 1337). |
| `city=name` | Loads `data/cities/name.json` (default `iziz`). |
| `debug` | Prints the build timing table to the console and exposes the lot list. |

**Hash parameters** (`/#v=...&t=...`): the page keeps these current as you move; **Copy link** in the
Views panel copies them. `v` = camera position and target (6 numbers), `t` = hour, `paused`,
`wire` (`off`/`edges`/`triangles`), `under` (`solid`/`hidden`/`xray`), `colour`
(`textured`/`clay`/`districts`), `life=0`, `weather` (`auto`/`clear`/`rain`/`fog`/`dust`/`windy`),
`day` (`120`/`360`/`720`/`1440`). Example: `/#v=0,720,620,0,20,0&t=18&weather=fog`.

Built-in views: Painting view, Overview, Palace, Temple plaza, Street level, Bridge, Spaceport, Arena,
Arena floor, Temple top, Temple hall, and depending on the city: Sewer outfall, River falls, Rope
bridge, The lake, The docks, Dock road, Painting print. Saved views and display settings live in the
viewer's browser (`localStorage`), not on the server.

**The painting in the city.** Six wall posters in the inner city are framed prints of `painting.jpg`
(count and frame in `data/cities/iziz.json` under `art`). If the image can't load, they stay posters.

### `/chicago`: Chicago

Built from **OpenStreetMap** (map data © OpenStreetMap contributors, ODbL; credited on the page). The map runs
from 18th Street north to Montrose and from Western Avenue to the lake, with full detail downtown, along the
whole lakefront, in Wrigleyville and in Wicker Park, and only the tall or large buildings elsewhere.

- **From the map:** the lake shore (Lake Michigan's outline, the harbours, breakwaters and piers), the river and
  its basins, every park, garden, beach, plaza and pitch, every street, alley and named trail (the Lakefront
  Trail, the Riverwalk, The 606), the L and Metra, stations, and 38,000 buildings at their mapped heights, with
  3D parts where they are mapped (Willis Tower's tubes), land use (residential yards, commercial, industrial, campuses, parking lots),
  and 18,700 mapped trees. Bridges are raised decks; movable ones get bridge houses. Every building is drawn (81,000).
- **Added on top** (`data/cities/chicago.json`): antennas and spires, Cloud Gate (mirrored, aligned with its
  mapped outline), the Pritzker Pavilion's ribbons and lawn trellis, Buckingham and Wicker Park fountains, the
  Centennial Wheel, stadium bowls for Wrigley Field (marquee, scoreboard, light towers) and Soldier Field, and
  a card for every landmark. Heights are corrected where OSM's are missing or wrong.
- **Detailed areas:** the Magnificent Mile (planted medians and sidewalk planters), the Riverwalk, North &
  Ashland, the six corners, Wrigleyville: crosswalks and cycling signals at the real intersections, street
  lights, storefront glass, parked cars (not on Michigan Avenue), people.
- **Everywhere:** trees through every wooded area and park, pitched roofs on houses, rooftop equipment on flat roofs, wooden water tanks on older brick buildings, parkway trees
  along residential streets where none are mapped, cars parked along residential streets and in parking lots, yellow centre lines
  and street lights on the arterials. Small details are hidden with distance.
- **Moving:** cars on Lake Shore Drive and the arterials (up onto the bridges), L trains on every elevated
  line, Metra trains on the commuter lines, cyclists and runners on the Lakefront Trail, tour boats on the river, sailboats and motorboats on the
  lake, the cruise ship and water taxis from Navy Pier, boats moored in every mapped marina, a freighter.
- **Click** any building for its OSM name and height, or its card if it is a landmark.

Views include Skyline from the lake, Cloud Gate, Millennium Park, Riverwalk, River forks, Magnificent Mile, Navy
Pier, Lake Michigan, Lakefront Trail, Lincoln Park, Wrigley Field, Montrose Harbor, the six corners, Pulaski Park.

**Updating the map data:** `python3 tools/fetch-osm.py chicago` downloads from the Overpass API into `data/osm/raw/chicago/`
(cached, not committed; `--refresh` to re-download), then `python3 tools/build-osm-city.py chicago` writes
`data/cities/chicago-osm.json` (`--report` lists where each landmark sits in OSM).

### `/portland`: Portland

The shared engine (`src/engine/stages/`, loaded by `src/portland/main.js`) with Portland's data:
`data/cities/portland.json` and `portland-osm.json`, built from OpenStreetMap the same way. The map runs from
South Waterfront to the Fremont Bridge and from Washington Park to the Lloyd District; every building is drawn.

- **From the map:** the Willamette and its banks, every street, park, trail and tree, MAX light rail and the
  Portland Streetcar (trains and streetcars run on their tracks), 24,000 buildings at their mapped heights.
- **Added on top:** the Steel and Hawthorne lift-bridge towers, the Burnside, Morrison and Broadway bridge
  houses, the Fremont Bridge arch, Tilikum Crossing's cable-stayed towers (each placed where its road crosses
  the river), the White Stag "Portland Oregon" sign (neon at night), the Chinatown Gate, Union Station's clock
  tower, the Pioneer Courthouse cupola, Salmon Street Springs, Skidmore and Keller fountains, the USS Blueback at
  OMSI, the Aerial Tram with moving cabins, the Convention Center spires, Providence Park's bowl, and Mount Hood
  and Mount St. Helens on the horizon at their true apparent size.
- **Detailed areas:** Pioneer Courthouse Square, the Pearl District, Old Town and Chinatown, Waterfront Park.
- **On the river:** sailboats, motorboats and kayaks that keep to the channel; cyclists on the Eastbank
  Esplanade, Waterfront and bridges.
- **Woods:** Forest Park, Washington Park and the other wooded slopes carry their own trees (about 34,000), so
  the West Hills read as forest rather than bare ground.
- **Terrain:** the ground follows real elevation data (AWS Terrain Tiles, from SRTM/NED), so the West Hills,
  Marquam Hill and the river bluffs are modelled; streets, buildings, trees and traffic sit on the slopes, and
  Mount Hood and Mount St. Helens stand on the horizon.

Data: `python3 tools/fetch-osm.py portland`, `python3 tools/fetch-terrain.py portland`, then `python3 tools/build-osm-city.py portland`.

### `/nyc`: New York

Manhattan from the Battery to the north end of Central Park, on the shared engine
(`src/engine/stages/`, loaded by `src/nyc/main.js`) with `data/cities/nyc.json` and `nyc-osm.json`.
76,930 buildings, 14,215 streets, 22,500 trees, over a 7.9 × 11.1 km map.

- **From the map:** every building at its mapped height, including the towers OSM models as stacks of
  parts — the Empire State's mast, the pencil towers on 57th Street. Central Park with its lakes and
  reservoir, the avenue grid, the piers, the bridges to Brooklyn and Queens.
- **Tidal water:** Manhattan's shores are `natural=coastline` in OSM, not water areas, and its land is
  cut by the map box so it never closes into a ring. The city sets `seaLevelWater`, which floods the
  whole box at sea level and lets the elevation grid draw the island. The engine's water lookup asks the
  ground as well as the polygon, so nothing thinks it is standing in the river.
- **Added on top:** the Chrysler and Woolworth spires, the suspension towers and cables of the Brooklyn,
  Manhattan and Williamsburg bridges, and the Statue of Liberty out in the harbour.
- **One World Trade Center** is built rather than extruded. The map has it as a square with a triangle
  glued to each side, all five run up to 417 m, which is a slab with a pin on top; the building is a
  windowless cube for its first twenty storeys and then eight tapering triangles, so the section is a
  square at the foot, a regular octagon at half height and a square again at the parapet, turned 45°
  from the one it started as, with 124 m of mast above that. The landmark carries `"clear"`, which drops
  the mapped parts so the model has the site to itself.

Data: `python3 tools/fetch-osm.py nyc`, `python3 tools/fetch-terrain.py nyc`, then `python3 tools/build-osm-city.py nyc`.

### `/venice`: Venice

The historic centre from OpenStreetMap on the shared engine — and the one city here that inverts everything
the engine assumes. 7,425 buildings, 5,677 ways and 189 water bodies over 5.2 by 3.8 km.

- **The canals are the street network.** Everywhere else the engine's roads carry the traffic and its water
  is scenery; here it is the other way round. The calli are footpaths between buildings, nothing with wheels
  has been through the middle of the city since before there were wheels worth having, and the mapped
  waterways are what the place is organised around. The Grand Canal comes out of the join at 17.6 km of
  chained centre line.
- **The boats** (`src/venice/boats.js`): 90 gondolas, 14 vaporetti and 26 barges, following the mapped canal
  centre lines the way the trains follow the rails. The engine's own boats want open water and keep a margin
  of clear lake around themselves, which a four-metre canal cannot give them. The gondolas are black, which
  they have been by law since 1562, and carry the ferro on the bow.
- **Four things that are shapes rather than heights** (`src/venice/landmarks.js`): the Campanile, with its
  brick shaft, stone belfry, spire and the gilt angel that turns; the Basilica's five domes over a Greek
  cross; the Salute, its great dome held down by sixteen scrolls; and the Rialto, one stone arch with two
  rows of shops standing on it. Everything else is its own mapped footprint.
- **What is only in Venice** (`src/venice/life.js`): 960 comignoli, the bell-mouthed chimney pots that are
  that shape because the city is built of wood inside and a spark on a roof took out a sestiere; 1,000
  bricole, the mooring posts driven into the mud — in threes to mark a channel, singly and striped outside
  the palazzi, in the house's own colours; 240 gondolas tied to them, rocking; washing across the calli at
  second-floor height, because there are no gardens and the campi are public; and awnings on the campi.
- **No terrain.** The city is at sea level and the lagoon is mapped, so the ground is flat by construction
  and the water polygons do the work. `camera: {elMin: -0.35}` lets you look along a canal instead of down
  at it.

Data: `python3 tools/fetch-osm.py venice`, then `python3 tools/build-osm-city.py venice`.

### `/city17`: City 17

Fan work: City 17 from Half-Life 2, on the shared engine (`src/engine/stages/`, loaded by
`src/city17/main.js`). Nothing is surveyed and **no game assets are used** — `tools/make-city17.py`
generates `data/cities/city17-osm.json` from a seed and every shape is modelled from scratch here in the
project's own low-poly style. Half-Life 2 and City 17 belong to Valve.

- **Generated:** the Citadel's exclusion zone torn out of the middle of the city, Eastern-European
  courtyard blocks on a 108 m grid (plated over in Combine armour the closer they are to the cordon),
  the trainstation plaza, the river and the canals running south, the outer Combine wall with its four
  gates, the cordon wall, a rail yard, trams, the razor-train viaduct, rubble in the cleared ground and
  ruins in the wasteland outside the wall.
- **The razor train** comes in on a viaduct that was driven through the city rather than fitted into it:
  the generator keeps every building 26 m clear of the alignment, so the line runs down an open corridor
  with its deck 16 m over the street, on 3.4 m piers. Four trains of five cars, one every 1,200 m of track.
- **The Citadel:** a blade rather than a tower. Half as deep as it is wide, chamfered at the corners so each
  face reads as one plane, tapering the whole way up, with long hull plates standing proud of the faces, six
  seams running its full height, fins hanging off the upper half, a stepped spine of slabs down one edge, and
  a crown that overhangs — a shoulder of plate, a ring of masses on it and eight arms swept out over the city.
  Sixteen cables leave it low down, sag, and come to ground hundreds of metres out in the streets; nothing
  else on the page says how big it is. A lit socket near the top, and seams that only show at night.
- **The occupation** (`src/city17/combine.js`, switched on by the `combine` block in the config): nine striders walking the central prospects on a three-legged gait, 200 manhacks holding
  street corners, four dropships carrying troop pods, sixteen armoured carriers on the arterials,
  2,600 barriers across and along the side streets with field gates over the gaps, 26 sentry posts,
  and queues of people stood at every checkpoint.
- **Added on top:** the Overwatch Nexus with its crest and wall mark, four checkpoints with barriers
  that lift and fields across the gap, generator pylons ringing the cordon, gunships circling it, and
  public screens on masts that light after dark.
- **The mood:** flat overcast sky, a drab palette (`"palette": "drab"` — no vehicle in this city has
  new paint), almost no private traffic, few people out, and a third of the windows lit at night.

Regenerate with `python3 tools/make-city17.py`, then `./sitectl build`.

### `/nightcity`: Night City

Fan work: a coastal cyberpunk megacity drawing on Blade Runner's Los Angeles and on Cyberpunk's Night
City, on the shared engine. Generated from a seed by `tools/make-nightcity.py`; no game or film assets
are used. It opens at 21:36 and it is raining.

- **Generated:** the Pacific and its sea wall, a supertall core on a 92 m grid with towers to 500 m,
  megablock housing a slab to a plot, the retrofitted low city built up in pieces and never cleared, an
  elevated ring freeway on piers with four radials, the dock yards, and the industrial flats.
- **The night stage** (`src/nightcity/neon.js`, switched on by the `neon` block in the config):
  2,800 neon signs bolted to whatever wall faces the street, 1,100 blade signs projecting out over it so
  you read them end-on, 900 lanterns strung across the side streets, 700 market awnings with the light
  under them, 900 rooftop antennas and dishes, a tangle of cable nobody has taken down in fifty years,
  holograms hung over the junctions, 280 spinners in five flight lanes, flare stacks burning on the
  flats, steam off the gratings, and rain.
- **The billboards only advertise the dead.** *Blade Runner* put Atari, Pan Am and Bell on its skyline in
  1982 and then watched all three go under, so every name up there is a company that no longer exists:
  Atari, Enron, Pan Am, Blockbuster, Compaq, Netscape, Polaroid, Woolworth, Lehman Brothers, TWA,
  Commodore, Borders, Tower Records, Circuit City, RadioShack, Napster, WorldCom, Pets.com, Arthur
  Andersen, AltaVista, Geocities, Oldsmobile, Braniff and thirty more. The names are drawn to a canvas
  and used as textures, so they are readable.
- **The signage is mostly not in English.** Blade signs carry 食堂, 薬局, 電気, ラーメン, 質屋, 電脳, 義体
  and the rest, stacked down lit panels. If the machine viewing it has no CJK font the stage measures a
  glyph against one nothing has, notices, and falls back to romaji rather than showing a column of tofu.
- **The sea wall.** The Pacific stands 95 m above the city, and this is what is between them: 208 m of
  battered concrete along the whole shore, going up in four stepped courses each set further inland than
  the one below, pilasters up its landward face, buttresses out into the water, sluice towers along it and
  a road on top. Nobody who lives here has seen the sea. A city sets `waterLevel` to put its water above
  itself; every other city leaves it at nought.
- **Added on top:** the twin corporate ziggurats — seven hundred metres of stepped terraces, lit along
  every lip, with landing decks and beacons at the cap.

Regenerate with `python3 tools/make-nightcity.py`, then `./sitectl build`.

### `/megacity`: Mega-City One

Fan work in the spirit of Judge Dredd's Mega-City One, which belongs to Rebellion. Generated from a seed
by `tools/make-megacity.py`; no assets from the comics, films or games are used.

The whole point of the place is scale, so the geometry is built around one rule: **a city block is one
building**. It holds fifty thousand people, it is three hundred metres across and the better part of a
kilometre tall, and it has a name you can click. 122 of them stand well apart over 6.4 km, so the city
reads as a field of enormous separate objects rather than a grid of streets.

- **Generated:** the blocks, each with its setbacks, balcony decks, roof plant, masts and the sky bridges
  to its neighbours; nine megways curving between them on piers at heights from 62 m to 252 m, never
  touching the ground; a sparse sector grid far below; the Zoom Line; the Port; the hundred-and-twenty
  metre city wall along the west, and the Cursed Earth past it where nothing is built; the Black Atlantic
  to the east, in a colour nobody chose.
- **Added on top:** the Grand Hall of Justice — a bunker the size of a district with a curved shield
  frontage and a crest over the doors — and the Statue of Judgement, 165 m of bronze with one arm out
  over the plaza, at which size it stops being a figure and becomes architecture.

Regenerate with `python3 tools/make-megacity.py`, then `./sitectl build`.

### `/dredd2012`: Mega-City One (2012)

The same city as `/megacity`, done as the 2012 film has it, which is a different place and deliberately so.
Fan work; Judge Dredd belongs to Rebellion and the film to its rights holders, and nothing from either is
used. Generated by `tools/make-dredd2012.py`.

The film shot its city in Johannesburg and Cape Town and kept them, so where the comics city is a field of
curved megastructures with megways weaving between them, this one is **a flat dusty low-rise sprawl that
runs past the horizon** — 144,000 buildings of two to six storeys, packed tight, accreted rather than
planned, on an ordinary street grid with ordinary ground-level traffic. Standing out of it at intervals are
**twenty Mega-Blocks**: plain concrete slabs, no curves and no ornament, two hundred storeys on a bare
apron behind a low perimeter wall, each holding seventy-five thousand people. One of them is Peach Trees,
and from the outside there is nothing to say which.

- **War mode** (`src/dredd2012/warmode.js`, switched on by the `warMode` block in the config): every
  block carries blast shields in housings banded up all four faces, and roof doors over its atrium. The
  button seals one block — Peach Trees, as in the film — and the sections grind down from the apron up
  until there is no opening left anywhere on it. `#war` in the address seals it on load.

Regenerate with `python3 tools/make-dredd2012.py`, then `./sitectl build`.

### `/mordor`: Mordor

Fan work from Tolkien, whose world belongs to the Tolkien Estate; nothing from any book, film or game is
used. Generated by `tools/make-mordor.py` from the published geography.

This one is a country, not a city: **680 km east to west and 560 km north to south, at true proportion.**
That is the whole point of it. Gorgoroth is a plateau you could lose a nation on, and at that scale
Barad-dûr is a splinter and the Black Gate is a scratch across a valley. They are built at their real
size and left small.

- **The land:** the Ered Lithui closing the north and turning down the east; the Ephel Dúath closing the
  west and turning along the south; Cirith Gorgor where they nearly meet, with Udûn behind it and the
  Isenmouthe at its far end; the plateau of Gorgoroth; the spur off the Ash Mountains that Barad-dûr sits
  on; and the land falling south-east to Nurn and the Sea of Núrnen, the only water in Mordor. A 682 × 562
  height grid at 1 km, from 0 to 10,600 m.
- **The ranges are deliberately exaggerated.** At true vertical scale they are swells on the horizon;
  Tolkien's are walls, and the land only reads as enclosed if they are built as walls. They rise hard out
  of the plain rather than doming up to it, their crests are serrated into peaks and saddles, and where
  two ranges meet they join rather than stack.
- **Orodruin is always erupting:** fountains standing out of the pool in the Sammath Naur, flows running
  down all seven flanks, and a plume that climbs eleven kilometres and leans thirty kilometres downwind.
- **The works:** this is what the land is for. Forty-one forge-towns, mine workings cut into both walls,
  and the slave-camps round Núrnen — furnace halls, barrack rows, slag heaps, a walled muster yard with
  corner towers, and 157 stacks burning day and night. At any distance the smoke is the only way you know
  they are there. Ninety fissures burn through the floor of Gorgoroth.
- **The pall:** a ceiling of cloud and volcanic ash that never lifts, with no sun through it, and ash
  falling everywhere.
- **The Eye** is the exception to the scale. The tower is fifteen hundred metres of black iron and from
  a hundred kilometres off it is a splinter — so the Eye on top of it is lit to carry: a flame with a
  wide bloom around it and a beam that sweeps a hundred and seventy kilometres of plain all night. You
  can see it from anywhere on Gorgoroth, which is the point of it.
- **Also built:** the Black Gate with the Towers of the Teeth either side of a gate that is shut, Minas
  Morgul lit a colour nothing healthy is lit, the tower of Cirith Ungol, Durthang, and about a thousand
  orc camps and slave-farms scattered over the plateau and round the shore of Núrnen.

- **The Black Gate opens.** A gate that never moves is a wall with a pattern on it. Each leaf is hinged on
  its jamb and swung back against the inside face when a host comes up the road (`ctx.hosts`, which
  `src/mordor/hosts.js` publishes), and shut behind it; braziers burn along the parapet and on both Teeth.
- **Orodruin is a cone.** Its profile used to be `(1 - d/R)` raised to a power, which gives a dome with a
  flat top and a straight skirt — the opposite of a volcano. It is an exponential now: steep at the head
  where everything that comes out of it lands on itself, flaring at the foot where the flows ran, with
  barrancos cut down the flanks and the Sammath Naur sunk into the summit.
- **The Winding Stair and Torech Ungol** (`windingstair`, `shelob`): the Straight Stair driven at the west
  face of the Ephel Duath so steeply it is nearly a ladder, then switchbacks up it with the drop on the
  other side, and at the head of it the hole that is the only way through the pass — webbed across, with
  what is left outside it lying where it was dropped. Nothing of her is modelled: it is a hole you cannot
  see into, which is the point.
- **The camped hosts**: six more drawn up in squares on the plain under Barad-dûr, thirty-one thousand of
  them, not going anywhere until they are sent.

Regenerate with `python3 tools/make-mordor.py`, then `./sitectl build`.

### `/kyrene`: a rotating habitat

A cylinder 6.4 km across and 19 km long, spun once every hundred and fourteen seconds so that what is bolted
to the inside of the hull is held against it at about a tenth of a gravity short of Earth's. Three strips of
land and three of window run its length, so there is always sky on two sides and country overhead.

**This is the only page on the site that does not run the shared engine.** The engine builds a plane with
gravity pointing down it — terrain, footprints extruded upwards, a sky dome over the lot — and none of that
survives here, where the ground is the inside of a tube and "up" is a direction that depends on where you
are standing. So the page brings its own renderer, camera and controls, the way Voth does, and shares the
core modules with everything else.

- **One mapping, and everything else is written in cylinder coordinates.** `at(u, a, h)` takes a distance
  along the axis, a bearing round it and a height above the hull, and returns a point. The land, the water,
  the towns, the rail and the end caps are all written in `(u, a)` and know nothing about the mapping.
- **The land** is a height field in `(u, a)`: a few tens of metres of relief on a hull kilometres across,
  enough to make a valley read as one. Each valley is **painted** onto a canvas the size of the strip (1024 ×
  4096, three metres a pixel across and five along): the fields on their 420 m grid with plough lines and
  mowing stripes in them, the hedges and the hedgerow trees, the river's banks, the road, the viaduct's shadow,
  the towns' streets and gardens, the woods and the farmyards. It used to be a colour per hull vertex, one every
  hundred and thirty metres, which was a patchwork from a distance and a smear of jagged stairs close to. The
  hull's normals follow the relief, so the valleys are shaded, and retaining walls stand along the edges where
  the land meets the glass.
- **The windows show space.** Under the glass there is nothing: the stars, the star the habitat orbits and the
  planet it orbits it with. They used to be painted dark grey, which read as tarmac, and their white ribs as the
  dashes down a road; the frame is dark metal now, mullions the length and transoms across.
- **The ends are closed.** Each end cap bulges outwards and is terraced from the rim to the hub - an amphitheatre
  of farmed steps with rock on the risers, in patches round the ring - under a smooth, ribbed, plated dome. They
  used to be cones pointing *into* the habitat, drawn back-faced, so from inside both ends were black discs full
  of stars. The sun tube is anchored in both hubs, and the spindle stands out of each.
- **It turns.** Everything that belongs to the habitat hangs off one group, spun once every 114 seconds. From
  outside you see it go round; from inside you go round with it, and the stars and the planet wheel past the
  windows instead. The camera is worked out in the habitat's frame and turned with it; moving things (boats,
  trains, gliders, trees) are oriented from the habitat's own axes rather than with `lookAt`, which works in
  world space and would have them roll as the hull turned.
- **The sun is a tube down the axis**, because there is nowhere else to put one, and it dims and brightens
  rather than rising and setting. It is also why the far valleys are lit from underneath. The light is nine
  point lights down its length, an ambient and a sky/ground fill - and all of it now follows the tube, so
  night is night: the country goes dark, the towns' windows light floor by floor, the trains' windows glow and
  the haze goes from blue to the colour of the dark. **Later** moves the tube on a quarter of a day;
  `#tube=0.75` opens at that point of it (0.25 is noon, 0.75 midnight), and a view can carry a `tube` too.
- **Air.** Nineteen kilometres of it end to end, as haze, so the far cap is pale and the place has a size. It
  is switched off outside, where the air is behind the glass.
- **Which way the hull faces.** Its triangles, wound along `u` and round `a`, already point at the axis, so
  the hull is front-faced with inward normals. Drawn back-faced — which is what a tube seen from inside
  usually wants — the entire country is invisible and all you see is the ribs.
- **What is on it besides fields**: hedges on the same grid as the painted ones; towns laid out as blocks on a
  street grid, in five colours of render, pitched roofs on the low buildings and plant on the flat roofs of the
  tall, and lit windows on every floor; woods and a line of trees down each river, instanced (the old merged
  cones were the heaviest thing on the page); farmsteads; cloud as soft billboards in a ring that turns a little
  faster than the hull, because the air is not quite keeping up with it; boats on the rivers, some under sail;
  trains on the viaducts; and gliders, because at a tenth of a gravity a hundred metres under the axis a person
  with wings can stay up all afternoon.
- **Outside:** the plated skin over the land strips, ring frames, longerons and radiators; the ribbed domes;
  the spindles; and at the north end a **dock** that does not turn - a bearing ring with ships alongside and
  red lamps - with ferries coming and going along the axis. The star lights the hull from outside, and the
  planet is there behind it, with oceans, land, ice, weather, its air at the limb and its cities on the night side.
- **The controls** stand you on the hull with up towards the axis: drag to look, WASD to walk it, Q and E to
  rise, and "Outside" to stand off the whole thing. `#view=<name>` opens at a viewpoint - including the north
  end, a town at night, the dock and the habitat with the planet behind it.
- **The layout is unchanged:** the towns draw on the same random stream in the same order as before, and
  everything added since draws on its own, so `tests/golden/hab-1974.json` still matches.

Edit `data/cities/hab.json` for the dimensions, the day, the haze, the caps and the viewpoints; the geometry is
`src/hab/world.js`, the sky outside and the camera `src/hab/main.js`.

### `/krator`: Krator

A worldbuilding primer: the geography, climate and peoples of a crater world on a tidally locked moon.
`krator-source.html` is the source and stays the source — it is plain prose, one line to a paragraph, with the
short lines being headings — and `tools/build-krator.py` wraps it into the page. Edit the prose, run the builder,
reload. Same arrangement as the Izani Tongue, where the text is kept as text.

### `/voth`: Voth, City of Cantons

A procedural city of stone cantons on water, on the same world as the Krator primer (its sky is Krator's gas
giant). It was written elsewhere and arrived as one 1.8 MB page: a single `BUILD()` function stitched together
from about thirty fragment files by a build script that never came with it. That source is recovered: the
page is now a shell, `css/voth.css` is its look, and the city is `src/voth/stages/` (51 files, split along the
original section banners, in the original order and sharing one scope as they always did), assembled into
`src/voth/build.js` by `tools/build-page.py` like the engine and Iziz. The build process's notes to itself
(632 KB of comments about files that do not exist) were dropped; short explanations stayed.

Nothing it does has changed: `tests/golden/voth-default.json` was taken from the old page and the new one
matches it, with the same draw calls and triangles. It still has its own camera, UI and render loops; bringing
it onto the shared shell is ARCHITECTURE.md §6 steps 3-4.

### `/tongue`: The Izani Tongue

A self-contained reference page (no scripts). Its **City lexicon** tables are generated from
`data/lexicon.json` by `tools/build-tongue.py`; the rest is hand-written. The 84 glyphs baked into it
are reproduced exactly by `src/izani/glyphs.js`, which the test suite checks.

### Not served

`image.png` (master painting), `The-Izani-Tongue_2.pdf`, everything under `tools/`, `tests/`,
`server.py`, `site.toml`, `sitectl`, the docs.

### `/kowloon`: the Kowloon Walled City

A massing model of what stood on the site until it was demolished in 1993-94, generated by
`tools/make-kowloon.py` from published descriptions; no survey, drawing or photograph is used or
redistributed, and every shape is this project's own.

It is the smallest place here and the densest thing in the menagerie by a long way. The site is 210 by
120 metres — two and a half hectares — and at the end it held some three hundred and fifty buildings grown
into each other over forty years, and about thirty-three thousand people. The interesting numbers are the
other way up from every other page: Chicago is 81,000 buildings over eighty square kilometres, this is 500
over a quarter of one, and it is modelled at metre scale rather than ten-metre scale.

- **The block** is a grid of plots six to nine metres across, each run up on its own to between three and
  fourteen storeys — fourteen at the middle, lower round the edges where the older buildings were, and never
  higher, because Kai Tak's approach was overhead. Two in five carry an addition bolted on top in a different
  colour, which is how the place grew. The light wells and the two lanes are gaps left in the grid.
- **The roof** was the only open ground it had: water tanks, huts, pigeon lofts, aerials by the hundred, and
  the rooftop school on the highest roofs at the middle.
- **The Yamen**, three halls round two courtyards, built in 1847 and the only building on the site that was
  ever designed. It outlived everything round it.
- **The section** (`src/kowloon/section.js`): the one page here where the inside matters more than the
  outside, so the renderer gets a clipping plane and the cut can be pushed through the block along either
  axis. The plane turns to face whichever side you are standing on, so walking round the block turns the
  section round with you. `#section=0.45` (or `#section=0.45,along`) opens with the block already cut.
  Nothing is capped: it is a section the way a survey draws one, not a cutaway.
- **What made it a place people lived in** (`src/kowloon/life.js`): the massing was right and it was dead —
  three hundred grey boxes with windows on them. Almost nothing that made the Walled City look like itself
  was put there by whoever owned the building: 1,600 pieces of washing on 420 lines strung across every gap
  wide enough to take one; 1,700 window cages and the air conditioners hung under them; the water pipes,
  which ran up the outside because there was no room inside; 180 shop signs out over the lanes, a quarter of
  them with a tube on the way out; steam off the noodle factories all day; and seventy people on the roof,
  which was the only open ground the place had.
- **The lanes are tunnels.** Once a building had a floor to spare it was built out over the lane, so both
  named lanes ran under everybody else's flats. The void test also had to allow for half a plot either side
  of the line: at 2.6 m it fell between two rows of plot centres and the lanes were never cleared at all,
  which is why Lung Chun Front Road ran straight through the middle of somebody's building.
- **The aeroplane** (`src/kowloon/kaitak.js`): one aircraft on the approach to runway 13 every half minute,
  over the rooftops and turning at the checkerboard. It is the only planning rule the Walled City obeyed.
- **Looking down a lane.** The engine clamps the camera to above whatever it is looking at, which is right
  for a city and useless in a place whose lanes are its subject, so the city file carries
  `camera: {elMin: -0.55}` and one of the viewpoints stands in Lung Chun Front Road.

Regenerate with `python3 tools/make-kowloon.py`, then `./sitectl build`.

### `/minastirith`: Minas Tirith

Fan work. Tolkien's world belongs to the Tolkien Estate; nothing from any book, film or game is used, and
every shape is generated by `tools/make-minastirith.py` or modelled in `src/minastirith/` in this project's
own geometry. It is the other end of the war the Mordor page is at: the same hosts, marching the other way.

The description is unusually exact, and what it describes is a piece of engineering, so the generator takes
it literally. Seven walls, each on its own tier, each tier a hundred feet above the one below, so the
Citadel stands seven hundred feet over the Pelennor and the White Tower three hundred feet over that.

- **The keel** (`keel`, in `src/minastirith/landmarks.js`). A shoulder of Mindolluin comes out through the
  city level with the Citadel, so the seven circles are horseshoes rather than rings, and its east end stops
  dead in mid-air over the lower circles with the point overhanging. A fifty-metre grid cannot hold a cliff,
  so the faces are built here — and the thing every picture of the place agrees on is that it is a **blade**:
  one unbroken sheer face to each side, smooth, fluted vertically, coming to a point. The first two versions
  were slabs and then crags, and both read as rubble tipped through the middle of the city. It is now a
  continuous mesh built to exactly the half-width function the terrain uses (`keel_half` in the generator),
  with thin flutes laid on the faces for scale, scree at the foot, the prow leaning out past its own foot
  with the parapet on top, and the tunnel mouths where the Way crosses.
- **The circles are horseshoes**, which is the whole point of the rock: a wall or a ring street that carried
  straight on across it hangs in mid-air off a cliff. Each ring is cut where it meets the rock (`ring_runs`
  in the generator), and the Way is cut where it crosses with a tunnel mouth at each end of the gap — draped
  on the heightfield it climbed the ridge like a ramp and came out forty metres above the roofs.
- **Heights are relative to the ground under the footprint**, because that is what the engine does with
  them. The generator wrote absolute heights for a long time — the level a wall's top should reach, measured
  from the Pelennor — so every wall and house on the hill was built from the tier it stands on *plus* the
  height of that tier. The seventh circle came out three hundred metres over the Citadel, the White Tower
  was inside it, and the whole place read as a multi-storey car park.
- **The city is a kilometre across** and 250 m tall, packed with terraces of white stone under slate: about
  1,700 buildings inside the walls, thinning as they climb, and nothing lived in on the seventh circle.
- **A city with people in it** (`src/minastirith/life.js`): 190 banners hung from the parapet of every
  circle, waving with a wave that runs down each one, black for the Steward and silver on the seventh; the
  cooking smoke of 420 chimneys, all leaning the same way because it is the same wind, which is the one
  thing that makes a stone city look inhabited from a mile away; 150 market stalls on the wider stretches of
  the lower circles, because the Pelennor has been emptied into the city; and fire in 63 braziers on the
  walls, which comes up as the light goes.
- **The White Tower, the Court of the Fountain and the Great Gate** are modelled (`src/minastirith/landmarks.js`):
  a slender fluted octagon with slit windows, pinnacles and the Steward's black banner; the court with its
  fountain, the dead White Tree and the guard; and the gate with its towers and the steel doors thrown back.
- **A city built before glass.** `windows: false` in the city file turns off the engine's window texture,
  which is a grid of lit offices and turns white stone grey. `streetFurniture: false` does the same for
  painted road markings and lamp standards. Mordor sets both as well.
- **The Pelennor**: townlands inside the Rammas Echor with the Causeway Forts on the road, farms, and the
  Harlond's quays on the Anduin.
- **Osgiliath**, astride the Anduin. Numenorean cities were laid out in rings round a centre, and the centre
  of this one was the great bridge: so it is circles of street broken where the river cuts through them,
  radials out from the bridgehead, a ruined circuit wall, walls standing to every height from a kerb to a
  gable, the Dome of Stars broken open, and the piers of the bridge still in the water with the Causeway
  stopping at the gap.
- **The siege** (`src/mordor/hosts.js`, imported rather than copied — it is the same war, seen from the
  other end). Blocks of orcs drawn up in formation facing the Great Gate, camps of tents round their fires
  behind them, trebuchets on both sides — the besiegers' out on the plain throwing in and the city's own up
  on its circles throwing back — siege towers against the wall, and volleys of arrows going both ways. Two
  in five of the stones that come over the wall are lit, because that is the point of throwing one into a
  city roofed in timber and slate; where one lands something burns, and thirty-four houses inside the walls
  are already burning with ninety more broken open. Grond is built as one object rather than a crowd: a ram
  of black steel slung in chains under a frame on wheels, with a wolf's head on the end of it and trolls on
  the drag ropes. Six thousand Rohirrim are drawn up on the north of the field, not yet moved.
- **War and peace.** The page opens on the siege, and a button takes it away: every module that makes
  something warlike pushes it onto `ctx.warParts` as it builds, and peace hides that list, stops its
  animation hooks, and brings the White Tree into flower. `#war=off` opens on the other one. The city's own
  life — its banners, its cooking smoke, its market stalls — belongs to both and never moves.

Regenerate with `python3 tools/make-minastirith.py`, then `./sitectl build`.

### `/rivendell`: Rivendell

Fan work. Tolkien's world belongs to the Tolkien Estate; every shape is generated by `tools/make-rivendell.py`
or modelled in `src/rivendell/` in this project's own geometry. Rebuilt from Tolkien's text and from his own
drawings of the place (the 1937 watercolour, "Rivendell looking East" and "looking West"), which were used as
references for proportion and arrangement only and are not in the repository.

- **The geography is the books'.** The valley runs east and west: the head of it is east, towards the
  mountains, which close the view up the valley; the Bruinen runs west out of it to the Ford, where the East
  Road crosses. The house is on the north side, so its windows "look south across the ravine".
- **A cleft, not a bowl.** You come over "a wide land the colour of heather and crumbling rock, with patches
  and slashes of grass-green" and it stops. The walls are two hundred metres and more of sheer pale rock -
  buttressed, jointed into columns, with a ragged top, a ledge part way up here and there, and woods on the
  slopes above them - over a green floor with the river winding through it on shingle banks. The house stands
  on a shelf above a rocky bluff, as Tolkien draws it.
- **The ground has its own shader** (`src/rivendell/ground.js`): rock, scree, meadow, shingle, woodland floor and
  moor are decided per pixel from the slope and the height above the water, and the rock is jointed, bedded and
  streaked. The engine's flat horizon plate would have lain over the valley where it runs out of the box, so the
  page draws the moor beyond the box itself, with the valley going on in it, and the mountains at the head.
- **The water** (`water.js`): the Bruinen is one ribbon down the planned line at the real level of the water, so
  it comes down its valley - white in the rapids at the head and over the fall below the bridge, where the bed
  drops. Every side stream is the same ribbon in four parts: a runnel across the moor, a cascade under the rim,
  a sheet down the rock laid just in front of the face, and a brook to the river, with mist at the foot.
- **The woods** (`woods.js`): firs on the rims and the slopes under them, "beech and oak" in groves on the floor,
  birches along the paths; nothing on rock, water, paths or lawns. **Season** switches the woods and the ground
  between Tolkien's summer and the film's autumn (`#autumn` opens in it).
- **The house** (`landmarks.js`), after Tolkien's drawings: a long range of two storeys, stone below and timber
  and plaster above, under a steep red roof with dormers and gilt finials; the square tower at the west end
  with a hipped roof and a balcony; a loggia of slender columns and gently curved arches along the river front;
  the Hall of Fire as a north wing with a hearth and a chimney at each end; the porch on the east side onto the
  gardens; a terrace and balustrade to the edge of the shelf and a stair down the bluff; the east garden with
  its beds, hedges and fountain; stables and a forge. From the film's design, used for its spirit only:
  pavilions on eight slender columns under bell domes gone green, and curved brackets under the eaves.
- **The ways in:** "a narrow bridge of stone without a parapet, as narrow as a pony could well walk on", one
  arch below the house; the path from the Ford along the south side, over a rock by a stair cut into it; and
  "the steep zig-zag path" down a gully in the south wall from the Road on the moor.
- **What moves** (`life.js`): lanterns along the paths and the terrace from dusk, smoke from the chimneys and
  the two hearths, leaves on the river in autumn, birds over the valley.

Regenerate with `python3 tools/make-rivendell.py`. It writes the ground and the paths for the engine
(`rivendell-osm.json`) and the plan of the valley - the river line and levels, the falls, where the house,
bridge, stair, pavilions and Ford are - for the page (`rivendell-valley.json`). Views and cards are in
`rivendell.json`; `#view=<name>` opens one (every engine city now takes `#view=`).

### `/shire`: the Shire - Hobbiton and Bywater

Fan work. Tolkien's world belongs to the Tolkien Estate; every shape is generated by `tools/make-shire.py` or
modelled in `src/shire/` in this project's own geometry. Made after Tolkien's text and his watercolour "The Hill:
Hobbiton-across-the Water" (used for proportion and arrangement only; not in the repository).

The Shire is forty leagues across. This is the heart of it, a few miles of the Westfarthing - "more or less a
Warwickshire village of about the period of Queen Victoria's Diamond Jubilee", Tolkien said:

- **The Hill**, round and steep with a single tree on top, north of the Water. Its south face is dug with holes
  in rows - **Bag End** near the top, **Bagshot Row** lower down - with the gardens in strips below them. A hole
  is "a perfectly round door like a porthole, painted green, with a shiny yellow brass knob in the exact middle",
  deep-set round windows either side, a curved stone face with a brow of turf, a chimney coming up out of the
  grass behind, and a garden in front with a gate, a path and flowers; each is cut into the slope by the
  generator (level ground in front, a bank over the face) so it is dug in, not set down. The doors are every
  colour, as Tolkien paints them. Bag End is the biggest, with the best garden and the notice on its gate.
- **The Water**, "no more than a winding black ribbon, bordered with leaning alder-trees"; **the mill** on it at
  the foot of the Hill - a square tower of yellow stone under a red hipped roof, round windows, a wing beside it
  and a wheel that turns (it is Sarehole Mill, where Tolkien lived as a boy); the bridge with the sign at the
  end pointing WEST; **the Old Grange** with its thatched ricks; **the Party Field** and the Party Tree.
- **Bywater** round its Pool, a mile south-east of the bridge by the Bywater Road and "the avenue of trees going
  from Hobbiton to Bywater"; **the Green Dragon** at the Hobbiton end of it; **the Great East Road** to the south.
- **The country**: every field painted into `data/cities/shire-fields.png` (four metres a pixel; its colour, and
  the direction of its rows in alpha) and drawn by the ground shader with its own furrows or mown swathes; the
  hedges traced by the generator along the same lines the fields were cut on, with trees standing in them;
  orchards in blossom, copses, poplars by the farms, sheep and cows in the pastures, sandy lanes with a grass
  crown between the ruts. Past the edge of the box the country goes on, the shader making up its own fields.
- **What moves**: hobbits walking the lanes, smoke from every chimney, the mill wheel, round windows lit after
  dark, birds.

The views are worked out from the plan when the page loads (`src/shire/main.js`), so regenerating never strands
a camera inside the Hill. Regenerate with `python3 tools/make-shire.py`: it writes the ground
(`shire-osm.json`), the plan (`shire-plan.json`: the Water, holes, houses, lanes, hedges, orchards, copses and
sites) and the field map.

### `/arrakeen`: Arrakeen

Fan work. Dune belongs to the Herbert estate; every shape is generated by `tools/make-arrakeen.py` or
modelled in `src/arrakeen/` in this project's own geometry.

A city built for a world where the only water is what you can take out of the air.

- **The Shield Wall** is the reason anything lives here, so it is built as a wall: a serrated rampart of
  rock standing right across the north and east, steeper on the inner face because that is the side the wind
  has been scouring, with one gap in it for the road out to the deep desert.
- **The town** is courtyard houses packed shoulder to shoulder — a detached house on Arrakis is a way of
  dying, and shade is the only free comfort there is. Thick blind walls, flat roofs, and a windtrap on every
  one of them turned into the same wind; dew collectors along the parapets, awnings across the slots between
  the blocks, cisterns that are the most valuable thing on any street, and a water market.
- **Four models of its own** (`src/arrakeen/landmarks.js`): the Residency, a fortress pretending to be a
  house with a garden in it that is an obscenity; the great windtrap, the only piece of civic architecture on
  the planet; a Guild lighter standing on the fused rock of the landing field with its gantry run up to it;
  and a sietch, which from the outside is a rock with nothing on it, because that is the entire design.
- **The deep desert** (`src/arrakeen/desert.js`): past the last rock, dunes in ranks running with the wind
  with a slip face on the lee side of each, a harvester working a spice blow with a carryall holding station
  over it, spotters quartering the sand upwind, and the sign of what is coming up underneath — a ridge of
  sand running, with a wake of dust off it. The worm itself is never drawn. The dread is in what the sand is
  doing, which is the same decision as Shelob's hole in Mordor.

Regenerate with `python3 tools/make-arrakeen.py`, then `./sitectl build`.

### `/europa`: Conamara Station

Original work, and the only place here whose landscape is neither invented nor mapped from a city: Europa is
real, and what is built is what is actually known about its surface.

- **Double ridges**, two parallel crests with a trough between them, running for hundreds of kilometres and
  crossing each other at every angle. They are what the ice is made of and nobody is sure how they form.
- **Chaos terrain**: blocks the size of city blocks, tilted and turned, in a matrix of rubble — the best
  evidence there is that there is an ocean underneath, and what the station is named for.
- **Lineae**, the long cracks, stained brown along both sides by whatever comes up through them. The only
  colour on the whole moon.
- **The station** is over a bore going twenty kilometres down to that ocean, which is the only reason
  anybody would come. Six pressurised drums on legs round a hub, bermed up to the windows in ice — the hard
  part of living here is Jupiter's radiation belt, not the cold — and nothing touches the ground, because a
  warm thing set on ice at 110 K melts its own hole and falls into it. The plume over the derrick is
  everything that goes down the hole coming back up and freezing on the way out.
- **The sky** (`src/europa/sky.js`): no air, so it is black at noon and the stars do not twinkle; the sun a
  twenty-fifth as bright, small and hard; and Jupiter, twelve degrees across — twenty-four times the width of
  the Moon from Earth — hanging in exactly the same place in the sky for ever, because Europa is tidally
  locked. That last fact is the whole reason to build the page. The bands are vertex colours on a sphere;
  there are no textures anywhere in this project.

Regenerate with `python3 tools/make-europa.py`, then `./sitectl build`.

### `/enterprise`, `/voyager`, `/ds9`: three ships

Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape is
generated by the modules in `src/enterprise/`, `src/voyager/` and `src/ds9/` in this project's own geometry,
built from the published dimensions and the silhouette. Exteriors only - there are no interiors on these
pages.

None of them runs on the shared engine, for the reason the habitat does not: the engine builds a plane with
gravity down it and a sky dome over the lot, and out here there is no ground, no down, and the sky is the
whole sphere. `src/starship/` is the small renderer they share - a turntable camera round one object, a
star field, and a backdrop of worlds and nebulae read out of the city file - with the same panels,
wireframe and menagerie menu every other page has.

- **The backdrops.** Vertex colours on a sphere, because there are no textures anywhere in this project: a
  gas giant is bands blended over the last fifth of each band's width (rounded to a palette index instead,
  they came out as a staircase where the edge crossed the sphere's triangles); a terrestrial world is
  octaves of noise thresholded into land and sea, with a continental shelf ramping continuously down into
  the deeps, an ice edge that wanders instead of following a line of latitude, and weather over the top.
  Four things learned here, all of them the same lesson about what reads at a distance:
  - A cloud has to be flattened *radially* — after `lookAt` that is the local z, not the y. Squash the
    wrong axis and every cloud stands off the planet like a shelf.
  - It has to be a *disc*, not a flattened sphere: a sphere gets its own light and dark side and reads as
    a boulder, while a disc shades evenly and goes dark on the night side with the ground under it.
  - Weather is not scattered. Four hundred discs at random, each up to seven per cent of the planet's
    radius, read as torn paper stuck to a marble. It comes in *systems*, drawn out east-west, and any one
    piece of it is small: these are laid down as several dozen curling trails of small stretched discs,
    thickest either side of the equator.
  - A nebula built from two dozen big additive spheres is a bag of marbles, because a single additive
    sphere is one layer of fragments at one opacity — a flat disc with a hard edge. What works is three
    nested shells per puff (a three-step radial falloff), two thirds of them buried in a dense core and
    the rest a halo of puffs small enough not to be read as circles. All of it merges per colour, so a
    three-hundred-puff nebula costs three draw calls, and so do a thousand cloud discs.
- **The hulls** are tables of cross-sections rather than primitives, because almost nothing on a starship is
  straight — and almost nothing on one is *round* either. `src/starship/` has the lathe (a deflector dish, a
  Bussard cowl, a station core), the fore-and-aft tube and the swept pylon, and each takes a **section
  profile** as well as a table of sizes: a lens with a rim for a saucer, a flat-bottomed slab with a rounded
  shoulder for a nacelle, an aerofoil with a blunt leading edge for a pylon, a hard-bevelled hexagon for
  anything Cardassian. The section is as much of the design language as the dimensions are. Stations also
  carry `ryb`, the half-depth *below* the centreline, because a hull with a domed top and a flat bottom is
  the normal case and an ellipse is the exception. There is no lettering anywhere on any of them: a hull
  number would have to be forty separate extrusions to be legible and would be four pixels tall from
  anywhere you would actually look.
- **Every hull on these pages was inside out**, and had been since the first one was built. `tube` wound its
  skin for stations running stern-to-bow and its end caps for bow-to-stern, so the two never agreed, and
  every table in the project is written bow to stern because that is the order you think a hull in. `lathe`
  has the same trap from the other direction: three.js winds it from the order of the profile points, and
  most of these profiles are written top-down because that is how you think about a dome. The result was
  that back-face culling threw away the near wall of every saucer, engineering hull and nacelle, so you
  looked *through* it at the inside of the far wall and at anything parked between the two — the captain's
  yacht was visible from above, through the saucer. It never showed in the silhouette, which is why it
  survived so long: an inside-out closed hull has exactly the same outline as a solid one.
- **And a saucer is not an extrusion.** Even solid, the primary hulls were the wrong shape, because they
  were built the same way as everything else: a table of stations along x with a fixed cross-section scaled
  to each one. A Starfleet primary hull is a **figure of revolution** — an oblate lens with its aft end cut
  off square — and the height of a point on it depends only on how far that point is from the centre. Built
  as an extrusion it came out stretched: the old Galaxy saucer stood **14 m tall measured 200 m forward
  along the keel and 25 m tall measured 200 m abeam**, a lens in one axis and a fat lens in the other, so it
  read wrong from every angle except dead ahead and dead above. And because a fixed section has a flat top,
  the saucer had a **140-metre plateau** across the middle where the dome should be.

  `discHull` in `src/starship/parts.js` is the right primitive: profile tables read against the true radius,
  a plan truncated by a chord, and a rim carried a little proud so the widest point of the ship is the rim
  and not the shoulder above it. Because the transom is a chord *through* the lens it comes out thicker than
  the rim, which is exactly where the impulse engines fit. It hands back the outline as well as the mesh —
  where the rim is at every angle and how tall it is there — so the windows, lifeboat hatches and phaser
  strips are placed **on** the hull rather than near it.

  The primitives also now pick their winding from the direction the input runs. `tests/hulls.test.js` holds
  both fixes: it builds each one against a stub of three.js, takes every face normal against the vector from
  the body's centroid out to that face, and separately samples a built saucer to check it is the same depth
  forward as abeam and still falling away 70 m off the centreline. Before the fixes a bow-to-stern hull
  scored 0 faces of 64 outward; it now scores 64 of 64 whichever way the table is written. Put the old
  winding back and five of the nine checks fail, which is the only evidence worth having that a regression
  test works.
- **The deflector took three goes, and every one of them failed the same way: something was in front of
  it.** First it was built as a cone with its apex forward — and since a lathe's faces point away from its
  axis, what you were looking at was the *back* of that cone, so it rendered as a blank grey disc. Turned
  round into a proper bowl, the hull's own front cap sat straight across the mouth of the housing and read
  as the dish: a lit disc filling the middle two-thirds, with the amber showing only as a ring round the
  outside. Cap removed, the hull's *skin* then pushed through the bowl from behind, because a bowl narrows
  going aft and a hull does not, and that showed as a pale crescent across the amber. There is no boolean
  subtraction here, so a recess cannot be cut into anything: the hull has to stop short of the bowl's apex
  and the housing skirt flares back over the join. `deflector()` carries that as a note, because the next
  hull to want one will hit it again.
- **Bands have to be geometry, not rows of boxes.** A phaser strip follows a curved hull exactly, and a box
  is a solid with a thickness, so on a dome one edge of it always buries itself and the other always lifts
  off — and overlapping them to close the gaps turned the saucer strips into a ring of gear teeth. `ribbon`
  takes a list of inner/outer vertex pairs and makes a quad strip through them, which is also what the
  concentric panel joins on the ventral and the keel strip down the engineering hull are now.
- **The ventral was a blank dish** with two rings of dashes on it. A Galaxy's underside carries the main
  sensor dome on a raised platform, concentric panel joins, two rings of windows, four docking ports and
  the captain's yacht clamped flat aft of the dome; Voyager carries the aeroshuttle faired into the keel
  with a seam round it, which is the one thing anybody recognises on that ship's belly.
- **The sections are generated, not typed.** `SECT.lens` and `SECT.slabS` take a resolution and produce the
  profile, because a hand-listed one is only as smooth as the patience of whoever typed it — the original
  had three points across the whole top of a saucer, which is where the plateau came from.
- **Galaxy class.** Cut to the published figures: 642.5 m long, 463.7 m across the saucer, 195.3 m from the
  top of the bridge to the bottom of the engineering hull over 42 decks, and nacelles 248 m long, 57 m wide
  and 32 m tall at their widest against 38 by 19 at the collector end (Rick Sternbach's blueprints). Three
  of those corrected the model. The nacelles were 40 m too short, and because their caps have to land on
  the stern, getting the length right pushes their collector ends *under* the saucer's aft quarter — which
  is why the class looks so compact from above. A nacelle is wider than it is tall, 57 by 32, not the
  upright tube it had been. And the engineering hull was 10 m too deep, so the ship stood taller than 195.
  The saucer is a figure of revolution 464 m across, cut off square at x = -197 where the impulse engines
  are: a disc reads as a flying saucer, this reads as a hull. Its rim carries **two** rows of windows with a
  recessed sensor groove between them — the upper is deck 9, which is Ten Forward and unusually tall, and
  the lower is deck 10. Three even rows, which is what was there before, is a Constitution refit's rim. The
  engineering hull carries a blunt nose around the deflector, a dorsal spine running aft from the foot of
  the neck with the upper shuttlebay let into it, three rows of windows and two strakes down each flank —
  without those it is a featureless white egg, which is what it was.
- **The drive sequence** is the only mechanism on any of these pages, and it is on the Intrepid. At cruise
  the pylons lie out and down and raked aft; for warp they come up level and swing forward, four seconds
  of travel eased hard at both ends, held either side. The geometry moving on its own does not read as a
  sequence though — from any distance it is two things quietly changing angle — so everything else answers
  it: the grilles come up from a cold blue to a hot white-blue as the pylons lock, the collectors flare
  hardest *through* the swing, the deflector brightens, and the navigation lights stop blinking and go
  steady, because a ship at warp is not station-keeping. `Drive: auto` on the page cycles to holding at
  warp, then holding at cruise, then back to the timed cycle.
- **Intrepid class.** 343 m long, 133 m across, 66 m tall over 15 decks. The beam was 5 m over, so the
  whole plan outline came in; the height falls out of the rest and lands on 66 with the nacelles drooped.
  No neck — the saucer runs back and down into the engineering section as one body — a teardrop saucer in
  plan with a broad transom across the back of it, and nacelle pylons that *move*, lying out and down in
  normal space and swinging up and forward before the ship goes to warp. It is the only animated mechanism
  on these pages. Both pylons are broad fins about fifty metres of chord across and seven thick; built with
  the chord and the thickness the wrong way round they came out as knitting needles, which is the same
  mistake in a different frame as getting the section wrong.
- **Deep Space 9**, 1,451 m across the docking ring: the opposite design language, and that is the point of
  drawing it next to the other two. Dark brown, ribbed, hexagonal in section, symmetrical in threes and
  sixes rather than about a keel, and not trying to look fast, because it is a building. Core, three
  crossover bridges, **habitat ring**, six supports, docking ring, six horns — leaving the inner ring out
  is most of why the first pass read as a spider. The horns are hexagonal blades, not tubes; with the
  normals smoothed they came out as bent drinking straws, so the whole station is flat-shaded. Off the
  port bow, the wormhole opens every half minute or so and then is not there again, which is the only
  event in this collection.
- **The light.** One hard star, a dim planet-shine fill, and a third light at about a quarter intensity
  that always comes from wherever the camera is. There is nothing physical about the third one. It is
  there because with one key and one fill, whichever way you turn the ship some large flat face of it
  points at neither and a pylon the size of a house goes to pure black.

Each page carries a fingerprint for the test suite the way the cities carry a lot list: every merged mesh,
where its bounding sphere is, how big it is and how many vertices are in it. Nudge one station in a table of
cross-sections and the hash moves.

### `/babylon5`: Babylon 5

Fan work. Babylon 5 belongs to Warner Bros. and J. Michael Straczynski; nothing from the series, its models or
its art is used, and every shape is this project's own geometry (`src/babylon5/station.js`), built from the
silhouette and the published size. It runs on the same page the three starships do (`src/starship/page.js`),
with its numbers in `data/cities/babylon5.json` under `station`.

**Eight kilometres from the docking bay to the stern,** at true size, lying along x with the bow at +x. It is
not a ship and does not look like one: a grey cylinder with things bolted to it, panelled and crowded with
modules, built by the lowest bidder.

- **Command and Control:** the sphere at the bow, its forward face cut into a dish with the docking bay mouth
  sunk in the middle - a lit slot with guide lights round it and lane markers either side, **turning with the
  drum**, so a ship coming in has to roll to match it.
- **The Cobra bays:** four long arms reaching forward along the sphere's flanks, launch slots at their heads.
  Every twenty-odd seconds a Starfury drops out of one, falls clear on the spin and then lights up and goes.
- **The rotating section:** a kilometre across and four long, **turning once every forty-five seconds** (a
  gravity a little under Earth's at the skin), on a bearing at either end. Collars every few hundred metres,
  stringers down its length, window bands, and five hundred modules of every size standing off the skin.
  Only the drum and the bay mouth turn; the sphere, the Cobra bays and everything aft stay still.
- **The Garden: press Cutaway** (or open `#cutaway`). A plane through the axis, turned to face the camera
  every frame, cuts away the near half of the drum wherever you stand, and inside it is the Garden: fields and
  a lake and fourteen hundred trees rolled into a tube, the sky over it being the other side of the same
  landscape, and a line of light down the axis for a sun. Either side of it, decks every forty metres.
- **Aft:** the fusion reactor behind the drum's aft bearing with its glow ports, the spine out to the stern,
  **four solar array wings** in planes through the axis, the thruster cluster and the aft antenna.
- **The traffic:** transports queued down the approach lane off the bow, closing on the bay and rolling to
  match its spin before they go in; five flights of four Starfuries on patrol loops round the station; and a
  launch out of the Cobra bays. At this scale a Starfury is fifteen metres on a station of eight thousand, so
  every ship carries an engine light drawn at a fixed size on screen, and the hull is there for close up.
- **The jump gate** a few kilometres off the bow: four trusses in a square with the corners open, and every
  forty seconds a vortex tears open in it - orange at the rim, blue and white at the throat - and a transport
  comes through.
- **Epsilon III** below, dusty and brown, with a moon, and the system's star behind the station.
- **Click any part** for its card: the sphere, the bay, the Cobra bays, the drum, the bearings, the Garden, the
  reactor, the arrays, the stern, the gate. (Cards are new on the ship page; the three starships do not hang
  any, so nothing changes for them.)

Views: three-quarter, side on, head on at the docking bay, the approach lane, the Cobra bays, the drum, the
Garden, the reactor, the solar arrays, the jump gate, Epsilon III below, far off. The page also takes a closer
minimum distance than the ships (`minD`) and moves its near plane out with the camera distance, so the
panelling does not fight itself in the depth buffer from twenty kilometres off.

### `/fleshpit`: Mystery Flesh Pit National Park

Fan work. Mystery Flesh Pit National Park is Trevor Roberts's project
([mysteryfleshpitnationalpark.com](https://www.mysteryfleshpitnationalpark.com/)) — the park, the Permian
Basin Superorganism, the Anodyne lease and the 2007 incident are his. Nothing of his is used, copied or
redistributed: the surface is generated by `tools/make-fleshpit.py` and everything below the rim is modelled
in `src/fleshpit/`, in this project's own low-poly geometry, from the published descriptions.

A cordoned six-kilometre square of West Texas south-east of Odessa, and the hole in the middle of it.

- **The surface:** a caliche plain at 880 m with mesas north-west and arroyos draining east, olive mesquite on
  it, and 46 pumpjacks nodding across it, because this is the oil field the pit was found in. The orifice, a
  funnel 520 m across at the rim, lined from the paved apron through the stained lip to the animal
  (`landmarks.js`, not a land-use area: areas come out saw-toothed, and the old one had no colour and came out
  lawn-green); the Park Service's collar round the lip, four elevator headframes, and lettered signs at the
  three overlooks. The Upper Visitor Center, park store, ranger station and amphitheatre on the west rim; the
  rim loop and the Rim Trail; Gumption Flat Campground; the monorail; the Anodyne extraction works north-east.
  On the park road in: the entrance sign, Caver Coop (the mascot, a plywood cut-out drawn on canvas in this
  project's own hand) and six Anodyne billboards, lit at night.
- **The parking lots and the plaza** (`src/fleshpit/surface.js`): three lots - visitor parking west of the
  visitor center, the overflow south of it with the RVs along the back, and Anodyne's works lot out past the
  rim loop - each on a graded pad with its own drive in. Striped stalls in double rows, a drive lane round the
  edge with arrows, kerbed islands with shrubs and trees, twin-headed light standards lit at night, disabled
  bays by the walk in, a pay booth, and cars in the stalls (instanced; pickups in the works lot), thicker near
  the walk and thinning to the far corner. The Upper Visitor Center's plaza between its wings: the entrance
  canopy with the name on it, glass doors, three flags, planters with benches, the map board, the gift shop's
  lit windows and awning on one side and the ticket windows opposite, café tables, and on the rim side a
  lettered lobby and a terrace with coin telescopes; the park store and the ranger station are signed too.
- **The pit** (`src/fleshpit/organism.js`, from the `pit` block in the city file): a shaft with seven named
  layers, from the collar to the drainage pit 3,100 m down.
  - **The entry tube** is held open by steel stent hoops every 24 m, cleated into the wall with tension cables
    between them; the wall is pulled in to each hoop, bulges between, and is pale where the steel presses.
  - **The Sand Gullet** at the foot of the stents: the ledge, the three pumps and their discharge up the wall.
  - **The Nexial Cavity** opens out below it, and the **Lower Visitor Center** hangs in the middle: a ring deck
    of two-storey shops with an overlook, hung by eight cables from a ring gantry braced into the dome, and held
    off the wall by eight hydraulic rams. The shops are named (`pit.shops` in the data): lit storefronts and
    striped awnings on the outer concourse, a sign on each side, café tables outside the food places, carts,
    planters, benches and lamp posts, coin telescopes along the inner rail looking down the well, blue
    emergency phones on the outer rail and an information kiosk. Four lifts come down from the rim to the deck, two more go on down to
    the forests; ramps run out to the trailheads.
  - **The Bronchial Forests**, built as what they are: the organism's two lungs (`src/fleshpit/lungs.js`).
    Lobed tissue with fissures, a domed base and the cardiac notch, drawn back-face only like the shaft, under
    a nearly clear pleura so the outline reads from outside; inside, a bronchial tree off the shaft wall (each
    airway splitting unequally, the branching plane turning a quarter turn each generation, cartilage rings on
    the big airways, the pulmonary artery and vein alongside) ending in the glossy air-sac clusters the park
    called bulbules. Both lungs fill and empty about the hilum on the breath. The boardwalks, and Septum Falls
    into its fenced plunge pool; **the Amniotic Thermal Springs** (below), and **the Gift Gardens**, a chamber of gestation organs with the harvest rigs over them; **the Lesser Gastric Sea** with the
    ferry, the terminal, the dam and **Oyster's Shame** in the wall above; **the Prime Labiod Junction**, a pair
    of lips where the seas meet; **the Greater Gastric Sea** and the resort; **Little Detroit** over the drain.
- **The Amniotic Thermal Springs** (`src/fleshpit/springs.js`), laid out after the park's own leaflet for them
  (`AmnioticThrmalSprings.png`): a cluster of ballast bulbs off the south-west of the shaft, each with its wall
  folded like a brain turned inside out, a pool in its lower third, a Geodesic Retaining Frame pressed into the
  wall, and a deck, ladder, hut, lamp, blue emergency phone and name board. Eight are open - Regia, Gratia,
  Placito, Laetis, Viribus, Cupido, Salus and Libido - and their water is coloured by potency, from the pale blue
  of the Main Bath through the blues to the reds of Viribus and Libido at the bottom. The Main Bath is tented up
  into six points round a yellow ring of fresh-air ducts, with two red walkways looping across the pool,
  loungers round it, and the round, blue-windowed Bath House on its near side. The long passage runs up the
  middle with a lift in it, stalks run out to each bath, the Lovers Squeeze is a crawl between Salus and
  Libido, the Complementary Readiness Vestibule waits under Libido, and a glazed truss stair - the enclosed trail
  - comes down to the Bath House from the lift landing in the shaft. On the far side, Anodyne's Commercial
  Extraction Lease Area: its own bulbs full of yellow scaffold and white tanks, off-limits, with the pipe to
  the surface. Unmapped ballast crops lie between the baths. Bathers in every pool. The bath list and its
  potencies are in the data (the springs layer's `baths`).
- **The passages nobody mapped** (`src/fleshpit/tunnels.js`, `pit.tunnels` in the data): ten passages off the
  shaft wall from the entry tube to the drain, each gated at the wall with a bulkhead frame, a grille and a
  padlock (or, for the sealed ones, a bolted plate), a hazard band, a PARK WORKS ONLY board, a flashing red lamp,
  and a ledge and ladder for the crews. Past the grille each wanders off into the animal and the light stops;
  the surveyed ones have a survey line pinned to the floor, and the worked ones a rail, work lamps, a crate and
  an abandoned cart. Each has a card.
- **The section** (`src/fleshpit/section.js`): in the section view the renderer clips away everything on your
  side of a plane through the axis - surface, rim, the near half of every chamber - and a face on the plane,
  the whole width of the map, is coloured like the park's block diagram (`flest_strata.png`): a thin cap of
  grey laminated rock under the ground, a lumpy seam of yellow fat, a pale membrane, and below that the
  organism laid down in beds like sediment - salmon and rose, streaked with pale fibre, with lavender lenses,
  dark slit cavities and vessels winding through - following the land and sagging round the shaft. The voids
  (the shaft, the lungs, the seas, the baths and their passages, the tunnels) are cut open, and where one holds
  fluid the fluid is drawn in the cut to its level. The cut turns with the camera, and the clipping plane is
  installed once and parked when the section is off, so switching never recompiles a shader.
- **The free camera** (`src/fleshpit/camera.js`): press F, or Free in the pit panel, and the camera flies
  anywhere - over the park, down the shaft, out through its wall and through the ground. Drag to look; W, A, S,
  D fly along the look and sideways; Q and E (or C and Space) go straight down and up; Shift is four times
  faster; the wheel sets the speed. The readout gives the depth or height, the layer and the speed, and the gauge
  on the right jumps the camera to a depth. The chambers are drawn back-face only, so from outside them in the
  ground you see into them. `#free` in the address opens in it (with the engine's `v=` it takes off from there);
  F again, Surface, or any viewpoint lands it.
- **Back faces.** The shaft, the collar, the stents and the chambers are drawn back-face only, so from inside
  you see the far wall and never the near one. (The shaft's triangles used to be wound the wrong way for this,
  so the ride showed no wall at all.) The section view no longer depends on it: see the section, above.
- **Everything static is merged by material** at the end of the build, card by card, so the pit is a few
  hundred draw calls rather than a few thousand.
- **Going down** needs no panel: from the surface, zoom in on the hole, double-click it, press Page Down, or use
  the depth gauge down the right edge of the screen - the seven layers to scale, a marker where you are, and ▲/▼
  - which drops the camera in at the rim and rides it down. Ride back up past the rim to come out.
- **The descent** (`src/fleshpit/camera.js`): this page steers its own camera through `ctx.camFrame`, because
  a hole is not a city and orbiting a point on the ground is the wrong control for it. A depth slider, a
  button per layer, a section view and a shaft ride; `#pit=1600` in the address opens outside the shaft at that
  depth and `#ride=1600` inside it (`#2007&pit=420` for the night). Below the collar the sky goes, the sun with
  it, and what light there is comes off the lamps.
- **Depths are the park's, not the organism's.** The 1979 expedition reached 19,102 m and that was not the
  bottom; what is modelled here is the part the public could buy a ticket to.

Regenerate with `python3 tools/make-fleshpit.py`, then `./sitectl build`.

### `/yellowstone`: Yellowstone National Park

A real place, on the shared engine, at the size of a small country: **106 by 110 km**, the whole park and a
little round it. Built by `tools/make-yellowstone.py`, which writes three files: the city file, the map
(`yellowstone-osm.json`) and the land (`yellowstone-land.json`, which the engine does not read and the page
does).

- **The ground is the real ground:** AWS Terrain Tiles on a 150 m grid, 709 × 735, with y = 0 at the lowest
  point on the map (1,550 m, down the Yellowstone at Gardiner) and 2,048 m of relief above it. Where 150 m is
  not enough the ground is sampled again finer: the **Grand Canyon of the Yellowstone** is a 25 m patch from
  zoom-14 tiles, laid into the coarse grid with its edge matched to it, so the canyon is three hundred metres
  deep rather than a shallow V. The roads through the patch are handed to the page and laid on it, because the
  engine would have laid them on the coarse grid and they would have floated over the canyon.
- **From OpenStreetMap:** 391 lakes, each at its own level (Yellowstone Lake is 2,357 m up and the Yellowstone
  at Gardiner is 1,600, and one water sheet cannot hold both), 1,242 rivers and streams drawn as ribbons at
  their own width, the Grand Loop and every road, the boardwalks through the basins, 3,600 buildings, the park
  boundary, and **3,300 mapped geysers and hot springs**, every one of which is a coloured pool and steams.
- **The land cover** (`src/yellowstone/nature.js`): the engine colours ground by height and slope, which paints
  a plateau one flat green. The page recolours it from a grid the generator writes: lodgepole forest, meadow in
  the valley floors (Hayden, Lamar, Pelican), sage in the dry north, wetland, rock and snow on the Absarokas and
  Gallatins, the bare sinter of the thermal basins, and the 1988 burn as a patchwork of young pine and grey
  snags. The walls of the Grand Canyon are yellow, pink and white in bands, which is what hot water did to them.
- **The forest** is grown in 800 m tiles round the camera as it moves, thinned with distance and dropped when
  the camera has gone: eighty per cent of the park is lodgepole, which is a hundred million trees. From high up
  the ground's colour carries it, with the crowns speckled in by the ground's shader.
- **The geysers erupt** (`src/yellowstone/landmarks.js`): Old Faithful, Castle, Grand, Beehive, Riverside,
  Daisy, Great Fountain, Steamboat, Echinus, Clepsydra and Lone Star, each with its own height, interval and
  duration - compressed, because Old Faithful's ninety minutes would mean nobody saw it, but in proportion, so
  Old Faithful still goes more often than Grand and Steamboat hardly ever. The water is thrown and falls back on
  the GPU; a fountain geyser throws it in bursts. They splash for a minute before they go and steam after.
- **The pools are painted rather than modelled**, because what they are is colour: Grand Prismatic's blue
  centre and the rings of bacteria outward, green, yellow, orange, rust, with the mats fanning away in fine
  ridges; Excelsior's crater; Morning Glory, Sapphire, Emerald, Opal, Abyss. Mammoth's travertine terraces step
  down the hill, live and orange at the top and dry and white below; Liberty Cap; the mud pots boil.
- **The steam** is every basin, every mapped spring and every landmark that asked for it, in one set of points
  animated on the GPU. It is heavy on a cold morning and thin on a hot afternoon.
- **The falls:** the Lower and Upper Falls of the Yellowstone, Tower, Gibbon, Lewis, Kepler Cascades, Firehole
  and Fairy, each facing the way its river runs (OSM draws waterways downstream), with mist at the foot.
- **The buildings the map does not do justice to:** the Old Faithful Inn (the Old House under its great roof,
  the dormers, the widow's walk, the wings), the Lake Yellowstone Hotel (lemon yellow, the porticos facing the
  water, whichever way that is), the Roosevelt Arch at the North Entrance, and the lookout on Mount Washburn.
- **The herds:** bison in Hayden and Lamar valleys, in loose groups, grazing and walking on. They are grown with
  distance, up to four times, so a herd across the valley reads as a herd.
- **The caldera.** Press **Caldera** in the bar (or open `#caldera`): the rim of the 631,000-year-old
  Yellowstone Caldera glows round its seventy kilometres, a curtain stands up off it, the two resurgent domes
  (Sour Creek and Mallard Lake) are ringed, the ground turns to glass and the fog thins, and underneath you see
  the magma reservoir the seismologists have mapped, five to seventeen kilometres down and longer than the
  caldera, with the bigger, fainter lower-crust body far under it. Without the button, the rim is still there
  from high enough up to read as a line, and not from the ground. The outline is after the USGS, simplified.
- **Flight:** it is a real place, so it has the aeroplane (`#fly`).

Views include Old Faithful, the Upper Geyser Basin, Grand Prismatic (from the air and from the Fairy Falls
trail), the Lower Falls, the Grand Canyon, Mammoth, Norris, Hayden and Lamar valleys, the lake, the Inn, the
Lake Hotel, the arch, Washburn, West Thumb, Tower Fall, the caldera from above and the whole park.

Regenerate with `python3 tools/make-yellowstone.py` (add `--fetch` to download the elevation tiles and the OSM
extracts into `data/osm/raw/yellowstone/`, which is not committed). Map data © OpenStreetMap contributors, ODbL.

### `/backrooms`: the Backrooms

Fan work. The Backrooms began as one anonymous photograph of an empty yellow office and a caption under it,
and grew into a collaborative fiction, a wiki's worth of numbered levels and Kane Parsons's films. Nothing of
theirs is used: every surface is painted on a canvas when the page opens (`src/backrooms/textures.js`) and the
rooms come out of a seeded generator (`src/backrooms/level.js`) that knows a grid and some numbers.

Like Kyrene, this page does not run on the shared engine: there is no ground, no sky and no map, only the room
you are in and the ones you can see from it. It brings its own renderer and a camera that walks.

- **Endless, and the same every time.** Walls stand on a 2.4 m grid; ten cells by ten make a chunk, and a chunk
  is a pure function of the seed and its coordinates. Chunks are built as you come within two of them and
  dropped when you are three away, so coming back finds the same rooms. Each is laid out like a floor plate:
  cut in two by a wall with at least one way through it, then each half again, stopping at room size or
  sooner. A chunk's west and south edges are its own with a forced opening in each, so the whole plan is
  connected however far it goes. Then the rules are broken on purpose: cuts with no wall and a row of columns
  where it would have been, walls that stop short, doorways one door wide and doorways the width of the cell,
  low-ceilinged halls with a soffit where they meet a taller room, columns through the big rooms.
- **The light is baked.** There are hundreds of panels in view, so none of them is a real light. Every surface
  is cut into a grid and each vertex is lit when its chunk is built, from every panel within 7.2 m that it can
  see round the walls (a walk along the grid lines between them), with an indirect term so the ceiling glows
  round each lamp. Some panels are dead; a few flicker, and the walls and carpet round them flicker with them,
  in the shader, at no cost. Damp stains on the carpet and up the walls come from noise over the world, not
  the textures, so they never repeat.
- **Walking:** click to look (Esc lets the mouse go; dragging works too), W A S D, Shift to run. On a touch
  screen the left third is a stick and the rest is for looking. Walls, doorways and columns stop you.
- **The hum** (`src/backrooms/sound.js`): mains buzz off the ballasts from two oscillators and some noise,
  breathing slowly; it starts the first time you touch the page, and M or the button mutes it.
- **Noclip** (N, or the button): the screen goes to static and you arrive in the next level - **Level 1**, a
  concrete car park with the cars gone, painted bands and hazard kerbs, colder light and more of it dead; the
  **Poolrooms** (Level 37), white tile on every surface, high ceilings and pools of pale water, with a slap of
  water in place of the hum; then back to **Level 0**.
- **God's eye** (G, or the button): the ceiling comes off and the camera goes straight overhead, north up,
  through a 40-degree lens so the walls stand up and it reads as a plan. The tops of the walls are drawn dark,
  the headers over the doors and the soffits where the ceiling steps are left off with the ceiling, and you are
  the red marker - W A S D still walk you, screen-wise, and the walls still stop you. The wheel, or + and -,
  takes the eye from 14 to 110 m up, and the rooms are kept further out the higher it goes. `#god=50` in the
  address opens in it.
- **In the address:** `#seed=1337&level=0&at=x,z,heading` - the page keeps it current, so a link takes someone
  to the same corridor. R, or Start again, goes back to the room you arrived in; Another seed is somewhere else.
  The wireframe is here too, rebuilt as chunks come and go.

### `/city`: the City, after *Blame!*

Fan work after Tsutomu Nihei's *Blame!* (Kodansha, 1997-2003). Nothing from the manga or the 2017 film is used:
every shape comes out of a seeded generator (`src/blame/city.js`) and the numbers in `data/cities/blame.json`.
The page is about one thing, which is how big the City is, and it runs on its own renderer and camera, like
Kyrene and the Backrooms, because nothing here stands on terrain under a sky.

- **The block.** 48 km square and 24.8 km high: four layers of the City with Megastructure slabs between them,
  bottom to top - **the Arcade** (3.2 km: walls of arched windows copied upwards, bridges across the canyons),
  **the Works** (2.6 km: machine towers floor to ceiling, girders, pipes kilometres long), **the Plain** (9 km:
  a ruled floor, towers clustered on its seams, cumulus, a spire hung from the ceiling) and **the Hanging**
  (3.6 km: structure grown down from the ceiling). A shaft 900 m across drops through two slabs, with a stair
  down its wall. Everything is instanced (about 50,000 pieces); what makes a box a wall of windows or a
  machine is a pattern in its material (`src/blame/mats.js`) that fades to its own average tone before it can
  shimmer, so a 7 m window and a 48 km floor share a shader. Each layer has its own fog, eased as you cross.
- **The Megastructure** (`src/blame/detail.js`) is more than slabs: three **trunks** of it a couple of
  kilometres across go through every layer and slab and on past both ends of the block, with plinths, haunches
  and ribs; **beams** tens to hundreds of metres deep run under every ceiling on the 1,600 m seams; the floors
  are plated along the seams; every hole has a collar above and below, and the great shaft has ribs out from its
  rim. In section the fill has an inside: laminations every 60 m, galleries, and rows of round conduits, drawn
  where the cut plane actually passes (the shader follows each pixel's ray back to the plane).
- **More in every layer:** domes, bell towers, colonnades, ledges and an older town along the canyon floors of
  the Arcade; tanks, risers, chimneys and catwalks in the Works; two causeways on piers to the horizon, a lattice
  mast four kilometres high and a monolith on the Plain; dwellings clinging to the stalactites of the Hanging.
- **The Builders** (`src/blame/builders.js`): six-legged machines from 7 m to 120 m long, each putting up a
  wall a course at a time - walking its length laying the next course, turning at the end, stepping up - with
  sparks at the arm. One works a tower across from Killy's platform ("A Builder at work"); the others are in
  every layer. Lifts run up and down the column, the Plain's pylons and the machine towers. None of it is in the
  fingerprint, since it moves.
- **The stack goes on.** From outside the block, copies of it continue above and below - the next block each
  way in full, dimmed, then slabs and air for eight blocks each way, fading - sharing the block's geometry and
  instance buffers ("The stack" view: 400 km of it).
- **Killy** (`src/blame/figures.js`): on a platform 1,450 m up in the Hanging, with Cibo at the edge: the only
  thing in the City whose size you already know, and the only place modelled at human scale. Both are rigged
  figures - armoured plates, jacket, shaggy hair, the GBE in his hand; Cibo's long hair - and breathe, shift
  and look along the void. **Find Killy** (K) rings him from
  anywhere and says how many pixels tall he is from there - 0.2 px from the column, 0.03 px from outside.
- **The section** (X). A plane through the block, everything on your side of it taken away, turning round
  as you walk round. What the cut passes through is drawn as an architect's poché: every material is
  double-sided and a back face - which you only see inside a solid, where the plane has opened it - is drawn
  flat, hatched and unfogged, the Megastructure near-black. The heights are ruled up the left, and a
  slider and "Cut: across/along" move it. The kept half is chosen when the cut is made and stays put - **Flip**
  (F) swaps it - and a camera on the cut-away side is outside the block, so crossing the plane changes nothing.
- **The City** (the button, or the last two views): the whole thing as Nihei sized it, a shell about as wide as
  Jupiter's orbit (1.6 billion km) round the Sun, in a scene of its own with a unit of a million km
  (`src/blame/sphere.js`). In section it is layers from where the Earth was out to the skin. The diameter is
  Nihei's; how deep it goes the manga never says, and the page says so.
- **Fly** (G): drag to look without moving, W A S D along where you are looking, Q/E down and up, the wheel for
  speed (0.5 m/s to 300 km/s), Shift for five times that. Otherwise the camera orbits a point.
- **Pull back** (P): from Killy's shoulder to the solar system in nine moves, a power of ten or so at a time,
  with a line at each. `#tour` in the address starts it.
- **Views** for the platform, the void, the column, the great shaft, the Plain, the Works, the Arcade, the
  block and the City. The HUD always says which layer you are in, how wide the frame is and how big Killy
  is. `#view=N` opens view N; the page keeps `#at=mode,x,y,z,distance,yaw,pitch` and `#cut=axis,0-1,side`
  current, so a link goes to the same place. `?seed=` builds another City.

## Layout

```
iziz.html, chicago.html      page shells: containers + <script type="module" src="src/<city>/main.js">
css/                          iziz.css (shared shell), chicago.css (colours)
data/
  cities/<name>.json          a city's parameters (expressions allowed, see the file's note)
  lexicon.json                Izani words, inscriptions, place names, lore, canon
src/
  core/   diag.js rng.js env.js data.js      error reporting + staged loading, randomness/noise, shader environment, data expressions
  izani/  glyphs.js draw.js atlas.js          the script: strokes/layout/SVG (pure), canvas drawing, the texture atlas
  iziz/   main.js imports.js stages/*.js build.js   the Iziz build: 56 stage files, assembled into build.js
  engine/ imports.js stages/*.js build.js    the shared engine: 11 stage files, assembled into build.js.
                                             It belongs to no city; every page below runs on it.
  chicago/  main.js landmarks.js             Chicago: Cloud Gate, the Pavilion, the Wheel, Wrigley Field
  portland/ main.js landmarks.js             Portland: the bridges, the sign, the gate, the submarine, the tram
  nyc/      main.js landmarks.js             New York: Liberty, the suspension bridges, One World Trade
  venice/   main.js landmarks.js boats.js life.js   Venice: the Campanile, the Salute, the canals, the comignoli
  city17/   main.js landmarks.js combine.js  City 17: the Citadel and the occupation
  nightcity/ main.js landmarks.js neon.js    Night City: the ziggurat and the night stage
  megacity/ main.js landmarks.js             Mega-City One: the Hall of Justice, the Statue of Judgement
  mordor/   main.js landmarks.js forges.js hosts.js   Mordor: the Eye, the works, the hosts
  dredd2012/ main.js warmode.js              Mega-City One (2012): the blast shields and war mode
  fleshpit/ main.js landmarks.js surface.js organism.js springs.js lungs.js tunnels.js section.js anatomy.js promenade.js visitors.js fauna.js incident.js signs.js camera.js   the park: the surface and its lots, the shaft, the springs, the lungs, the tunnels, the section, the heart and vessels, the people, its animals, the night, its lettering, and its own camera
  yellowstone/ main.js landmarks.js nature.js   Yellowstone: the geysers, pools, falls, lodges, herds and caldera; the land cover, forest, rivers and steam
  backrooms/ main.js level.js textures.js sound.js   the Backrooms: its own renderer, the generator and baked light, the canvases, the hum
  blame/    main.js city.js detail.js builders.js figures.js mats.js sphere.js   the City: its own renderer, camera, section and tour; the 25 km block; the Megastructure's structure and the layers' furniture; the Builders and the lifts; Killy and Cibo; the patterns and the poché; the whole of it round the Sun
  minastirith/ main.js landmarks.js life.js  Minas Tirith: the Tower, the Court, the Gate, the rock, the banners
  kowloon/  main.js section.js kaitak.js life.js   the Walled City: the section, the approach, the washing
  starship/ page.js parts.js                 the page the ships and Babylon 5 share: renderer, sky, turntable, cards; the hull pieces
  babylon5/ main.js station.js               Babylon 5: the sphere, the Cobra bays, the drum and the Garden, the arrays, the traffic, the gate
  hab/      main.js world.js               Kyrene: its own renderer, and a world in cylinder coordinates
  shire/    main.js ground.js water.js country.js holes.js buildings.js life.js   the Shire: fields and lanes, the Water, hedges and trees, the holes, the mill and the rest, what moves
  voth/     imports.js stages/*.js build.js   Voth: 51 recovered stages, assembled into build.js (voth.html runs it)
vendor/three/three.min.js     three.js r128 (pinned)
tools/  build-page.py build-tongue.py probe.py check-city.py
        fetch-osm.py fetch-terrain.py build-osm-city.py make-city17.py make-nightcity.py
        make-megacity.py make-mordor.py make-dredd2012.py make-yellowstone.py
        build-krator.py test-pages.py
tests/  run.js *.test.js golden/ fixtures/
server.py  site.toml  sitectl
```

### The loading screen

Two lines. The top one says what the build is doing right now and comes from the page's `labels`; the
bottom one is a note about the place, and it changes every couple of seconds while you wait and again
whenever a stage finishes. Kerbal Space Program is the obvious ancestor and it is a better idea than it
looks: a progress line tells you the machine is working, and a line about the place tells you why you are
waiting for it.

A page passes them to `configureLoading` in its `main.js`:

```js
configureLoading({prefix:'raising Arrakeen… ',
  labels:{ground:'laying the rock',landmarks:'raising the Residency',el:''},
  lines:['The only water is what you can take out of the air, so there is a windtrap on every roof.', …]});
```

They are shuffled and drawn without replacement, so the same one does not come up twice running and a
different one greets you each time the page is opened. A label set to `''` means *say nothing about this
stage* rather than *print the stage's internal name*, which is what the old fallback did. `lineMs` (how
long a note stays up) and `lineMinMs` (how soon a stage change may move it on) are both overridable.

### Stages and `build.js`

A city's code is a set of numbered files in `src/<city>/stages/`. They are fragments of one function
body: `tools/build-page.py` concatenates them in order into `src/<city>/build.js` as
`export async function build(ctx){ … }`, so every stage sees what earlier stages defined, and
`section('name', () => {…})` isolates a stage's failure while `await stage('name')` yields to the
loading text. Things one stage hands to a later one, or to the console, go on `ctx` (`window._iz`).
**Edit the stages, never `build.js`**; `./sitectl build` regenerates it (and `check`, `reload`,
`restart`, `test` and the probe do so automatically).

### Wireframe

Every page now has what Iziz has always had: the model drawn as its own edges, over the solid or instead of
it. `src/core/wire.js` is the shared version — the engine uses it, and so does the habitat page, which has no
engine. Two buttons in the bar, and `#wire=edges&under=xray` in the address.

- **off / edges / triangles** — nothing, the hard edges of each mesh, or every triangle in it.
- **solid / hidden / xray** — the solid under the wire; the solid drawn invisible but still blocking what is
  behind it, which is a hidden-line drawing; or no solid at all.

It is built the first time it is switched on, because for Chicago that is two million triangles' worth of
edges and there is no reason to pay for it unless it is asked for. Edges on a merged tile of more than
120,000 vertices fall back to the tile's own triangles: at that size the difference is invisible and the
cost is not. The two flags that do the work are `colorWrite` and `depthWrite` on the solid's material —
colour off with depth on is exactly a hidden-line view — so no layers and no second render pass.

Meshes are tagged as they are built (`userData.wireCat`: ground, water, road, building, landmark, veg, life)
and coloured by that; anything untagged is guessed from its name. The sky dome and the land beyond the map
carry `userData.noWire`, because neither is part of the model.

### Everything stands on the ground

Three things in the engine used to be measured from the datum rather than from the land under them, which is
the same thing in Chicago and nonsense anywhere the ground moves. Traffic rode at y = 0, so Portland's cars
drove three hundred metres under the west hills; they now take the greater of the bridge deck and the ground
at the car's own position, asked there rather than interpolated between road vertices that can be hundreds of
metres apart. The elevated railway sat at a fixed height above the datum; its deck is now the ground smoothed
along the line and held clear of it, with the columns taking up the difference, because a viaduct is graded
and does not ride over every hummock. And Michigan Avenue's planters kept their flowers and trees at a fixed
height above nothing in particular.

`ribbon()` — which draws every road, sidewalk, trail, bridge deck and railway deck in every city — wound its
top face downwards, so all of them were front-facing at the ground and only visible from underneath. What you
saw from above was the darker skirt drawn down each side, which is why Portland's bridge ramps read as black
spaghetti and City 17's viaduct was invisible from the street. One reversed winding fixes the lot.

### What the engine shares, and what a page owns

The engine in `src/engine/` is run by every city page, so nothing that belongs to one city is in it.
It lived in `src/chicago/` until it was shared by eleven places, which made every one of them import
`../chicago/build.js` to build somewhere that is not Chicago; it is its own folder now and Chicago is a
page beside the others.
A page hands its own work to `build()` on `ctx`:

- `ctx.models` — functions returning landmark models. The engine's own table holds what more than one
  city uses (fountains, cable-stayed bridges, stadium bowls, the roof furniture); everything else —
  Cloud Gate, the Citadel, Barad-dûr, One World Trade — lives in `src/<city>/landmarks.js` and is merged
  in before the landmarks are placed, after which it is indistinguishable from a built-in one.
- `ctx.extras` — `{name, fn}` stages of a page's own. Night City's neon, Mordor's forges and hosts,
  City 17's occupation and Mega-City One's blast shields are all extras; they run after the city is
  built and before the UI, each inside its own `section()`.

- `ctx.camFrame(now, ctl)` — a camera of the page's own. The engine hands it the control state every frame,
  after its own controller has had its turn, and the page may overwrite any of it. Only the Flesh Pit sets it,
  because only the Flesh Pit is a hole; every other page leaves it unset and is not affected in any way.

Both are handed `API`, the engine's innards — `THREE`, the city config, the scene, the geometry and
map lookups, the shared materials, `box`/`group`, `animHooks` and the rest. Each stage adds its own to
`API` as it runs, so a model sees what the landmarks stage sees and an extra sees everything. An extra
that wants a control of its own asks with `API.onUI(fn)`, because the panels do not exist yet when it
runs. The cost of all this is that Chicago, Portland and New York no longer download a line of Mordor.

### Content files

Numbers are numbers; a string is an expression over the values defined above it, `Math` and
`rad(degrees)`, evaluated by `src/core/data.js`. `_` keys are comments. `data/cities/iziz.json` holds
the landmark positions, wall shape, gates, districts, statues, views, constellations and print
settings; `data/lexicon.json` holds every Izani word (`words`, grouped), the carved and painted
inscriptions (`inscriptions`), the landmark → inscription map (`placeNames`), `lore` and `canon`.
After editing the lexicon run `python3 tools/build-tongue.py` to refresh the Tongue page's tables.

### Terrain

`python3 tools/fetch-terrain.py <city>` downloads elevation tiles for the city's area (cached under
`data/osm/raw/<city>/terrain/`, not committed); `tools/build-osm-city.py` samples them into a height grid in
the city's `-osm.json`, with y = 0 at the water level. `terrain` in the city config sets the tile zoom and the
grid spacing (Portland 15 m, Chicago 30 m). A city with no tiles simply stays flat.

### Per-city look

**`python3 tools/check-city.py [city]`** reads a city's config against its map data and reports what will
go wrong before the page is ever loaded. Every check in it is a bug that actually happened here: viewpoints
whose camera sits at or below its target (the orbit control clamps elevation, so you get a bird's eye view
where you asked for a street one — six of Chicago's were broken this way, including its default); height
fixes that would bury a tower the map already models properly as a stack of parts; landmarks whose position
misses their footprint so their spire lands on the ground; models and decor the engine does not have. Run it
after editing a city config.

A city config may set, besides its geography: `sky` (`day`/`dusk`/`night`, each `top` and `hor`), `fog`
(FogExp2 density), `overcast` (0-1: less sun, more fill light), `terrainColours` (`low`, `high`, `steep`,
`far`), `litWindows` (how much of the city lights up at night), `streetTrees`, `parkedCars`, `traffic`
and `people` (0-1 densities), `palette` (`"drab"` puts vehicles and coats in rust, grey and olive),
`attribution` (the credit line in the corner), `bridgeDeck` and `bridgeHeights`, `smog`, `toxicWater` and
`waterColour`, `seaLevelWater` (see New York), `lowRiseFar` (how far buildings under 30 m are drawn) and
`defaultHour` (a city only seen after dark opens there), `quality` (`low` drops shadows entirely, which on a weak GPU is worth more than everything else together;
`?quality=low` in the URL overrides it). A `combine` block (`striders`, `manhacks`, `scanners`, `dropships`,
`apcs`, `barriers`, `smartBarriers`, `turrets`, `fires`, `debris`, `sentries`) turns on the occupation stage,
which every other city skips. An `el` block sets the elevated railway: `height` over the street, `deckWidth`,
`deckDepth`, `pierWidth`, `pierEvery`, `colour`, `trainCars`, `trainEvery` (one train per that many metres of
line), `trainSpeed` and `livery` — Chicago's L is light steel at the defaults, City 17's viaduct is not.
`groundHole` (`{at: [x, z], r}`) removes the ground inside a circle, for a city whose subject is a hole, and
`camera` (`{elMin, elMax}`) widens how far the camera may be tipped, for one whose subject is an interior.
`areaColours` and `roadColours` retune the land-cover and road palettes by kind — the defaults are a modern
map's greens and asphalt, and on the Pelennor a bright `#6a9a52` rectangle reads as a carpet rolled out over
the fields while a graded lane on an ice moon that comes out asphalt-black reads as a canal. `farLevel` puts
the horizon plate at the height the world outside the box actually sits at, for a map whose ground is
hundreds of metres up. `beacons: false` turns off the aircraft warning lights, because a place built before
the wheel does not put a blinking red lamp on its tallest tower. `roofPitch`, `roofRise`, `roofMaxArea`,
`roofMaxHeight`, `roofColours` and `treeColours` set how steep the gables are, how big a footprint still
gets one, what they are covered in and what the foliage is — all of which are cultural facts rather than
constants. `landFromCity` (`{cell, grow, drop, quay,
water}`) is for a city with no height grid at all: the sheet under everything becomes open water and the
land is rasterised out of the city itself, which is how Venice stopped being grey ground with canals cut in
it. Anything left out keeps the Chicago default.

### Scale

A map can be a downtown or a country. Everything in the engine that is written in metres — the water
lookup's cell, the ground grid, the tile sizes, the draw distances, the camera's far plane, the steps the
walkers take along a street — is multiplied by `WORLD`, which is how many times bigger than a city
(20 km) the map is. It is 1 for every city and 34 for Mordor. Terrain colouring is likewise relative to
the land's own relief, because a ramp fixed at 120 m paints a mountain range one flat colour.

Without this a country-sized map tries to allocate a 950 MB water grid and walk 2,800 km of road a metre
at a time, which is exactly what it did the first time it was asked to.

Two backdrop bugs only a big map exposes, both fixed: the sky dome is centred on the world origin, so the
camera can be half a map diagonal from its centre before you count altitude — size it by the far plane
alone and its far side is clipped, showing the clear colour through the sphere's own facets. And the sky
gradient read an interpolated direction without renormalising it, so it followed the dome's tessellation.
Order is now horizon ring < sky dome < far plane, and the dome is sized for the whole map.

### Performance

The frame is spent on two things: shadows and how far detail is drawn. Only objects worth a shadow cast one
— buildings, trees and landmarks, not moving vehicles, street lights, rooftop clutter or a flat city's
terrain — and the shadow map is redrawn when the sun or the view has actually moved rather than on a frame
counter. Draw distance is adaptive: when the frame rate slips the engine gives up distant clutter *before*
it gives up resolution, because a kilometre-away parked car costs less to lose than a sharp image. Buildings
under 30 m carry their own shorter distance so the low-rise thins out while the skyline never does.

Measured on the Snapdragon laptop this runs on, at each city's default view:

| city | before | after |
|---|---|---|
| Portland | 26 fps | 61 fps |
| Chicago | 25 fps at 0.6 resolution | 30 fps at full resolution, 2.7M → 1.9M triangles |
| New York | — | 58 fps with 76,930 buildings |

**Build time** is the other half, and it is nearly all spent turning the map file into geometry. Two
patterns were costing most of it, both of them the kind that reads fine and runs badly:

- `quad()` in the ground stage pushed its twelve numbers as `push(...a,...b,...c,...d)`. That is the same
  twelve numbers, but every call builds four argument lists and makes a variadic call — and it runs once
  per quad for every road, roof, field and river in the city, a couple of million times on Chicago. Written
  out longhand it is identical arithmetic with none of the allocation. The same applied to the roof buffer
  in the buildings stage.
- `inPoly`, `bbox` and `dec` destructured every vertex (`const [x,z]=poly[i]`). Destructuring an array is
  an iterator-protocol call and two property reads; these three are the hottest functions on the site,
  called per edge, per point, per ground cell. Indexed access is the same arithmetic in the same order.

| city | build before | build after | ground stage |
|---|---|---|---|
| Chicago | 7,242 ms | 5,217 ms | 1,995 ms → 1,008 ms |
| Portland | 8,561 ms | 4,938 ms | — |
| New York | — | 4,487 ms | 792 ms → 643 ms |

Because every one of those changes is arithmetically identical, **every golden fingerprint is unchanged** —
which is the point of having them. An optimisation that moves a hash has changed the city, whatever it did
to the clock.

`tools/probe.py` reports draw calls, triangles, frame times and the resolution the GPU settled at, so a
change can be measured rather than guessed at.

### Flight mode

The cities that are real places — Chicago, Portland, New York, Venice, the Walled City — have real terrain
and a real street layout under them, and the only way to get a feel for either is to go and look. Those
pages carry `"flight": true` in their city file and gain a **Fly** button; `#fly` in the address opens
straight into it.

    W / S     pitch (nose down / up, like a stick)
    A / D     bank left / right — banking is what turns her
    Q / E     throttle down / up
    space     level out
    Esc       land

It is not a simulator: no stall, no spin, no fuel. The throttle sets a speed and she holds it, and the
ground and the rooftops push her up rather than ending the flight. Speed scales with the map, because
Chicago is sixteen kilometres corner to corner and the Walled City is one and a half.

This does not replace the camera. The engine's loop hands `ctx.camFrame` the control state after it has
had its own turn with it, so flying is a matter of working out where the aeroplane is and then telling the
orbit camera to sit behind it — target on the aeroplane, azimuth its heading reversed, elevation off its
pitch, and a short leash. Pressing a viewpoint button lands her, because the engine queues a camera move of
its own and the two would fight.

Fly off the edge of the map and, after a couple of seconds of grace with the readout counting it down, she
lands herself and the camera goes home to the page's opening view. There is no terrain out there and no
buildings; the alternative was either stopping dead at an invisible wall or leaving you over blank water
with nothing to look at, and it turned out to be the latter for 1,365 metres before the margin was cut.

### Adding a city

1. `data/cities/<name>.json` for an Iziz-engine variant, opened with `/?city=<name>`; or
2. a new page: `<name>.html` (copy `chicago.html`), `src/<name>/{main.js,imports.js,stages/}`, a
   route in `site.toml`, and `python3 tools/probe.py --page <name>.html --save-golden tests/golden/<name>-<seed>.json`.

### Seeds

The building layout comes from one seeded stream consumed in stage order. Adding a random draw in an
early stage changes every later one, for every seed. `tests/golden/*.json` records the layout of each
page at known seeds; `./sitectl test` fails if it moves. Decoration that should not disturb the layout
uses `hash3(x, z, k)` or its own `mkRng(seed)` stream.

## Managing the server

Use `./sitectl` from this folder. Never run it with `sudo`; it refuses.

| Command | What it does |
|---|---|
| `./sitectl status` | Service state and the site URLs |
| `./sitectl reload` | Build, check `site.toml`, then apply it with no downtime (alias `apply`) |
| `./sitectl restart` | Build, check, restart. Use after editing `server.py`, host or port. |
| `./sitectl start` / `stop` | Start or stop the server |
| `./sitectl enable` / `disable` | Start now and at every login / stop and don't start at login |
| `./sitectl build` | Assemble `src/<city>/build.js` from the stage files |
| `./sitectl check` | Build, validate `site.toml`, list every URL. Nothing else changes. |
| `./sitectl test [seconds]` | Module tests under gjs, then a headless build of every golden page/seed |
| `./sitectl probe …` | `tools/probe.py` with your arguments (metrics, fingerprints, screenshots) |
| `./sitectl logs [N]` / `follow` | Last N log lines / live log |
| `./sitectl url` / `health` | Print the URLs / ask the running server if it's up |
| `./sitectl install` | Rewrite the systemd unit for this folder (after moving the project) |
| `./sitectl boot` | How to start the site at boot without a login |

Editing HTML, CSS, data files or images needs no command: files are read on every request and the
server sends `304 Not Modified` when the browser's copy is current. Editing a stage file needs
`./sitectl build` (or any command that runs it). Editing `server.py` needs `restart`.

### Testing

```
./sitectl test                  # everything: module tests, then every page against its golden (about 1.5 min)
./sitectl test blame iziz       # only the pages whose name starts with these
python3 tools/test-pages.py -j 1   # one page at a time, for a slow machine
gjs -m tests/run.js             # only the module tests (rng, noise, data expressions, Izani glyphs, wire)
python3 tools/probe.py --page chicago.html                                    # metrics for one load
python3 tools/probe.py --seed 42 --expect tests/golden/iziz-42.json           # did the layout move?
python3 tools/probe.py --page chicago.html --hash 'v=-100,12,-620,-600,30,-690&t=21' --shot night.jpg
```

The probe runs a page in headless Firefox against a copy of the site config and reports errors, build
timings, draw calls, triangles, programs, frame times, the adaptive resolution and a SHA-256 fingerprint of
the layout. It reports as soon as the page has finished building - its loading overlay is gone and it has drawn
30 frames - so `--wait` is only a ceiling; a page that never gets there is reported as timed out. It picks free
ports for itself. `--shot` saves the rendered canvas as a JPEG.

`tools/test-pages.py` runs every golden in `tests/golden/` three at a time. A golden's file name is
`<page>-<seed>.json`; it may also carry the `page`, `query` and `hash` it was made with (`iziz-b-7.json` is
`iziz.html?city=iziz-b`; `voth-default.json` has no seed). Pages with nothing to fingerprint - the front page,
Krator, the Tongue - only have to load without an error. Before any of it, `src/*/build.js` must be current with
its stages (`tools/build-page.py --check`): a stale one fails the run rather than being rebuilt behind your back.

Pages that are not built from lots hand the probe a fingerprint of their scene through `src/core/layout.js`
(the Backrooms: the rooms round where you arrive; Voth: its scene straight after `BUILD()`, before anything
moves). To make a golden: `python3 tools/probe.py --page <page>.html --seed N --save-golden tests/golden/<page>-N.json`.

## Configuration (`site.toml`)

Workflow: edit, `./sitectl check`, `./sitectl reload`. If the new config is invalid the server keeps
the old one and logs `reload failed`. Changing `host` or `port` needs `restart`.

`[server]`: `host` (`0.0.0.0` = whole network, `127.0.0.1` = this machine), `port`, `log_requests`,
`health` (URL that answers `ok`), `[server.headers]` sent with every response.

```toml
[[route]]                      # one file at one or more URLs
path = "/lexicon"
aliases = ["/words"]
file = "lexicon.html"
title = "Izani lexicon"        # shown by --check
enabled = true
[route.headers]
"Cache-Control" = "max-age=600"

[[mount]]                      # a whole folder under a prefix; no listings, no escaping the folder
prefix = "/assets"
dir = "assets"
```

Exact routes win over mounts; the longest mount prefix wins. Root-relative links (`/tongue`) keep
working if the address or port changes.

## The server

`server.py` (stdlib only, Python 3.11+): allowlisted routes and mounts, HTTP/1.1 keep-alive, gzip
for text when the client accepts it, `ETag`/`Last-Modified` with `304`, `HEAD`, a health URL, SIGHUP
reload, one log line per request in the journal. No `Range` support, no TLS, no authentication:
fine on the LAN, never port-forward it to the internet.

The systemd **user** service `menagerie` (`~/.config/systemd/user/menagerie.service`) runs it; the unit
runs `server.py --check` before starting, so a missing page file stops start-up. Raw commands, without
`sudo`: `systemctl --user status|start|stop|restart|reload menagerie`, `journalctl --user -fu menagerie`. With
`sudo` they fail with `Failed to connect to user scope bus`. The service starts at login; for boot
without a login run `sudo loginctl enable-linger snapwerks` once.

## Network notes

- The router assigns `192.168.124.227` and may change it (`hostname -I`; reserve it in the router).
- The firewall is off. If you enable one: `sudo ufw allow 8000/tcp`.
- Everything is served locally; no page needs the internet.

## Troubleshooting

| Symptom | Check |
|---|---|
| Page doesn't load | `./sitectl status`, `./sitectl health` |
| Service won't start | `./sitectl logs 20`: a `problem:` line names the missing file |
| A stage edit has no effect | `./sitectl build` (the served file is `build.js`) |
| Red box on the page | that stage failed; the rest still builds. `./sitectl probe --page …` shows the same text |
| `LAYOUT CHANGED` from `test` | a random draw moved: see Seeds above; if intended, re-save the golden with `--save-golden` |
| New route is 404 | `./sitectl check` shows the route table; then `reload` |
| Works locally, not from other devices | IP changed, other network, or a firewall |
| `Failed to connect to user scope bus` | you used `sudo`. Drop it. |

See `AUDIT.md` for the architecture audit this layout came from and what is still open.
