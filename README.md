# World Menagerie

Procedural models of places, served to the local network by a small Python server. Ten of them so far:
**Iziz**, a science-fantasy city with its own language; **Chicago**, **Portland**, **New York** and
**Venice**, built from OpenStreetMap; **Voth**, a page of its own; and fan work generated from a seed —
**City 17**, **Night City**, **Mega-City One** (twice, once as the comics have it and once as the 2012 film
does), **Mordor**, which is a country rather than a city, **Minas Tirith**, which is the other end of the same
war, the **Kowloon Walled City**, which is one building, **Kyrene**, which is a rotating habitat with its
country overhead, and **Mystery Flesh Pit National Park**, which is a hole. They run on the same core modules and the same page shell; each place is a data file plus a set of build
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
| `/kyrene` | `/hab.html`, `/habitat`, `/cylinder` | `hab.html` | Kyrene: a rotating habitat |
| `/krator` | `/voth`, `/voth.html`, `/krator.html` | `krator.html` | Krator: A Primer |
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
  enough to make a valley read as one. The fields are a patchwork on a 420 m grid rather than a colour per
  vertex, because from three kilometres overhead a colour per vertex is a smear. A river runs down the
  middle of each valley and widens into lakes.
- **The sun is a tube down the axis**, because there is nowhere else to put one, and it dims and brightens
  rather than rising and setting. It is also why the far valleys are lit from underneath. A single point
  light at the middle of nineteen kilometres leaves both ends black, so it is seven of them in a line.
- **Which way the hull faces.** Its triangles, wound along `u` and round `a`, already point at the axis, so
  the hull is front-faced with inward normals. Drawn back-faced — which is what a tube seen from inside
  usually wants — the entire country is invisible and all you see is the ribs.
- **The controls** stand you on the hull with up towards the axis: drag to look, WASD to walk it, Q and E to
  rise, and "Outside" to stand off the whole thing. `#view=<name>` opens at a viewpoint.

Edit `data/cities/hab.json` for the dimensions and the viewpoints; the geometry is `src/hab/world.js`.

### `/krator`: Krator

A worldbuilding primer: the geography, climate and peoples of a crater world on a tidally locked moon.
`voth.html` is the source and stays the source — it is plain prose, one line to a paragraph, with the short
lines being headings — and `tools/build-voth.py` wraps it into the page. Edit the prose, run the builder,
reload. Same arrangement as the Izani Tongue, where the text is kept as text.

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

- **The keel.** A shoulder of Mindolluin comes out through the city as a wall of rock standing level with the
  Citadel, and the city is built round it. The road up is cut round it too, so every gate faces the opposite
  way from the one below and no gate can be seen from the gate under it.
- **The tiers** are absolute heights, not something added to the hill: get that wrong and the Pelennor in
  front of the Great Gate stands higher than the gate does, and every viewpoint outside the walls is
  underground looking up through the back of the world.
- **The city is a kilometre across** and 250 m tall, packed with terraces of white stone under slate: about
  1,700 buildings inside the walls, thinning as they climb, and nothing lived in on the seventh circle.
- **The White Tower, the Court of the Fountain and the Great Gate** are modelled (`src/minastirith/landmarks.js`):
  a slender fluted octagon with slit windows, pinnacles and the Steward's black banner; the court with its
  fountain, the dead White Tree and the guard; and the gate with its towers and the steel doors thrown back.
- **A city built before glass.** `windows: false` in the city file turns off the engine's window texture,
  which is a grid of lit offices and turns white stone grey. `streetFurniture: false` does the same for
  painted road markings and lamp standards. Mordor sets both as well.
- **The Pelennor**: townlands inside the Rammas Echor with the Causeway Forts on the road, farms, the
  Harlond's quays on the Anduin, and Osgiliath in ruins on both banks at the edge of the map. The hosts come
  up the Causeway from it (`src/mordor/hosts.js`, imported rather than copied - it is the same war).

Regenerate with `python3 tools/make-minastirith.py`, then `./sitectl build`.

### `/fleshpit`: Mystery Flesh Pit National Park

Fan work. Mystery Flesh Pit National Park is Trevor Roberts's project
([mysteryfleshpitnationalpark.com](https://www.mysteryfleshpitnationalpark.com/)) — the park, the Permian
Basin Superorganism, the Anodyne lease and the 2007 incident are his. Nothing of his is used, copied or
redistributed: the surface is generated by `tools/make-fleshpit.py` and everything below the rim is modelled
in `src/fleshpit/`, in this project's own low-poly geometry, from the published descriptions.

A cordoned six-kilometre square of West Texas south-east of Odessa, and the hole in the middle of it.

- **The surface:** a caliche plain at 880 m with mesas north-west and arroyos draining east; the orifice, a
  funnel 520 m across at the rim with the Park Service's poured collar round the lip and four elevator
  headframes on it; the Upper Visitor Center, park store, ranger station and amphitheatre on the west rim;
  the rim loop road and the Rim Trail; Gumption Flat Campground; the monorail that opened nine months before
  the incident; and the Anodyne extraction works — tanks, sheds, the ballast refinery and the flare stack —
  north-east, because the lease was there before the park was.
- **The pit** (`src/fleshpit/organism.js`, from the `pit` block in the city file): a shaft with seven named
  layers opening off it, from the collar at the top to the drainage pit 3,100 m down — the Throat with the
  Lower Visitor Center's deck ringing it, the Bronchial Forests and their boardwalks, the ballast pods of the
  Amniotic Thermal Springs, the Lesser and Greater Gastric Seas with the ferry terminal, the Agnich dam and
  the resort shelf, and Little Detroit hanging off the wall above the drain. Sphincter rings between the
  layers, and the whole shaft breathes.
- **The wall is the animal.** Eleven veins stand proud of it and wander as they descend, with a hollow either
  side of each and a growth ring every few metres; all of it is cut into the tube itself rather than stuck on,
  because anything stuck on the near wall would still be standing there in the section view. On top of that,
  1,400 polyps in clusters and 260 strands hanging off the rock — those *are* stuck on, so they are shown
  only when you are inside the shaft.
- **What the Park Service left.** Four lamp strings hung from the collar and running the whole way down, a
  lamp every 40 m; four lift cages riding their guides; handrails on everything anyone was allowed to stand
  on; interpretive signs, lit; the Lower Visitor Center with its shopfronts, upper floor, three stair towers,
  radial catwalks and the overlook cantilevered out over the drop; boardwalks and a viewing platform among
  the bronchial trunks; changing huts and steam over the soaking pools; Anodyne's tap and its pipework on the
  springs; the ferry terminal, jetty, buoys and lit spillway on the Lesser Sea; the resort's funicular down
  to the water on the Greater; Little Detroit as 54 containers stacked five levels up a rack, lit, with a
  slewing crane, catwalks, ladders and a flare; and, at the bottom, the catwalk that came down in 2007 and
  the wreck of the rig it fell onto.
- **It is its own cutaway.** The shaft is drawn back-face only: from inside you see the far wall as you
  should, and from outside the near wall is simply not there, so the pit can be read from the side like a
  section. The ground does the same for free — the terrain is single-sided — and the generator digs the
  funnel to exactly where the model takes over so that no ground stands in the way.
- **The orifice is a hole in the ground, and a heightfield cannot have one.** The funnel used to bottom out
  in a flat disc at the mouth depth, which from the rim is a lid over the shaft. The city file now carries
  `groundHole` (`{at, r}`); the engine draws no terrain quad whose middle falls inside it, and the shaft
  flares at the top to meet the cut edge.
- **The descent** (`src/fleshpit/camera.js`): this page steers its own camera through `ctx.camFrame`, because
  a hole is not a city and orbiting a point on the ground is the wrong control for it. A depth slider, a
  button per layer, a section view and a shaft ride; `#pit=1600` in the address opens outside the shaft at that
  depth and `#ride=1600` inside it. Below the collar the sky goes, the sun goes with it, and what light there
  is comes off the lamps. The engine's own tilt limits are right for a city and wrong for a shaft, so the
  descent widens them (`ctl.elMin`/`elMax`) and you can look straight up it; and pressing any viewpoint in the
  engine's panel hands the camera back rather than being ignored.
- **Depths are the park's, not the organism's.** The 1979 expedition reached 19,102 m and that was not the
  bottom; what is modelled here is the part the public could buy a ticket to.

Regenerate with `python3 tools/make-fleshpit.py`, then `./sitectl build`.

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
  venice/   main.js landmarks.js boats.js    Venice: the Campanile, the Salute, the Rialto, and the canals
  city17/   main.js landmarks.js combine.js  City 17: the Citadel and the occupation
  nightcity/ main.js landmarks.js neon.js    Night City: the ziggurat and the night stage
  megacity/ main.js landmarks.js             Mega-City One: the Hall of Justice, the Statue of Judgement
  mordor/   main.js landmarks.js forges.js hosts.js   Mordor: the Eye, the works, the hosts
  dredd2012/ main.js warmode.js              Mega-City One (2012): the blast shields and war mode
  fleshpit/ main.js landmarks.js organism.js camera.js   the park: the shaft below the rim, and its own camera
  minastirith/ main.js landmarks.js          Minas Tirith: the White Tower, the Court, the Great Gate
  kowloon/  main.js section.js kaitak.js     the Walled City: the clipping-plane section, and the approach
  hab/      main.js world.js               Kyrene: its own renderer, and a world in cylinder coordinates
vendor/three/three.min.js     three.js r128 (pinned)
tools/  build-page.py build-tongue.py probe.py check-city.py
        fetch-osm.py fetch-terrain.py build-osm-city.py make-city17.py make-nightcity.py
        make-megacity.py make-mordor.py make-dredd2012.py
        build-voth.py
tests/  run.js *.test.js golden/ fixtures/
server.py  site.toml  sitectl
```

### Stages and `build.js`

A city's code is a set of numbered files in `src/<city>/stages/`. They are fragments of one function
body: `tools/build-page.py` concatenates them in order into `src/<city>/build.js` as
`export async function build(ctx){ … }`, so every stage sees what earlier stages defined, and
`section('name', () => {…})` isolates a stage's failure while `await stage('name')` yields to the
loading text. Things one stage hands to a later one, or to the console, go on `ctx` (`window._iz`).
**Edit the stages, never `build.js`**; `./sitectl build` regenerates it (and `check`, `reload`,
`restart`, `test` and the probe do so automatically).

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
Anything left out keeps the Chicago default.

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

`tools/probe.py` reports draw calls, triangles, frame times and the resolution the GPU settled at, so a
change can be measured rather than guessed at.

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
./sitectl test          # everything
gjs -m tests/run.js     # only the module tests (rng, noise, data expressions, Izani glyphs)
python3 tools/probe.py --page chicago.html --wait 20                          # metrics for one load
python3 tools/probe.py --seed 42 --expect tests/golden/iziz-42.json           # did the layout move?
python3 tools/probe.py --page chicago.html --hash 'v=-100,12,-620,-600,30,-690&t=21' --shot night.jpg
```

The probe runs the page in headless Firefox against a copy of the site config and reports errors,
build timings, draw calls, triangles, programs, frame times, the adaptive resolution and a SHA-256
fingerprint of the building layout. `--shot` saves the rendered canvas as a JPEG.

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
