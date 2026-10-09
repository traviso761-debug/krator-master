# World Menagerie

Procedural models of places, served to the local network by a small Python server. Ten of them so far:
**Iziz**, a science-fantasy city with its own language; **Chicago**, **Portland**, **New York** and
**Venice**, built from OpenStreetMap; **Voth**, a page of its own; and fan work generated from a seed —
**City 17**, **Night City**, **Mega-City One** (twice, once as the comics have it and once as the 2012 film
does), **Mordor**, which is a country rather than a city, **Minas Tirith**, which is the other end of the same
war, the **Kowloon Walled City**, which is one building, **Kyrene**, which is a rotating habitat with its
country overhead, **Mystery Flesh Pit National Park**, which is a hole, **Yellowstone**, which is a real national park
on top of a real one, **the Backrooms**, which go on forever, **the City** from *Blame!*, which very nearly does, **the Infinity Castle** from *Demon Slayer*, a hall with rooms hanging from its ceiling that moves when someone plays the biwa, **the Shire**, which is a few miles of hedges round a hill with a hole in it, and **Beach City** from *Steven Universe*, a boardwalk town with a temple in its sea cliff. They run on the same core modules and the same page shell; each place is a data file plus a set of build
stages, and anything only one of them needs travels with that one.

The front page at `/` lists whatever the server is serving, and every scene carries a Home button and a menu
of the others. Both read `/scenes.json`, which the server builds from `site.toml`.

**Site:** `http://<this computer's address>:8000/` (`./sitectl url` prints it for the computer it runs on)

## Controls

The same on every page (`src/core/input.js`), except Iziz until it moves onto the shared core:

| | |
|---|---|
| drag | orbit: the world follows the pointer (drag right, it turns right). Standing on a floor: look round, right is right, down is down |
| right-drag, Shift-drag | pan; two fingers: pinch to zoom and pan together |
| wheel, pinch | nearer and further |
| W A S D, Q E | move; down and up. Shift: five times as fast (the Backrooms run instead) |
| F | fly: the aeroplane over the real cities, the free camera in the City and the Flesh Pit |
| G | the overhead view (the Backrooms) |
| X, C | the cutaway on and off, and which half you keep (the City) |
| Esc | close the panels (and leave Babylon 5's interior) |

Page-only keys: the Backrooms' N (noclip), M (sound), R (start again); the City's K (find Killy), P (pull back).

## Site map

| URL | Also at | File | Page |
|---|---|---|---|
| `/` | `/index.html`, `/iziz`, `/iziz.html` | `iziz.html` | Iziz: massing model |
| `/?city=iziz-b` | | `data/cities/iziz-b.json` | A variant Iziz (rounder wall, another seed, more prints) |
| `/chicago` | `/chicago.html` | `chicago.html` | Chicago: massing model |
| `/portland` | `/portland.html` | `portland.html` | Portland: massing model |
| `/nyc` | `/nyc.html`, `/newyork`, `/manhattan` | `nyc.html` | New York: massing model |
| `/venice` | `/venice.html`, `/venezia` | `venice.html` | Venice: massing model |
| `/rome` | `/rome.html`, `/roma` | `rome.html` | Rome: the historic centre, hills and all, its great buildings modelled |
| `/tokyo` | `/tokyo.html`, `/東京` | `tokyo.html` | Tokyo: Shinjuku to Ginza from OpenStreetMap, Shibuya Crossing, Meiji Jingū, the Palace, Tokyo Station and Tokyo Tower modelled; a map of the city as it grows |
| `/city17` | `/city17.html`, `/halflife` | `city17.html` | City 17: massing model (fan work) |
| `/nightcity` | `/nightcity.html`, `/night` | `nightcity.html` | Night City: massing model (fan work) |
| `/kowloon` | `/kowloon.html`, `/kwc`, `/walledcity` | `kowloon.html` | Kowloon Walled City: massing model |
| `/megacity` | `/megacity.html`, `/mc1`, `/dredd` | `megacity.html` | Mega-City One: massing model (fan work) |
| `/dredd2012` | `/dredd2012.html`, `/peachtrees` | `dredd2012.html` | Mega-City One as the 2012 film has it (fan work) |
| `/mordor` | `/mordor.html`, `/sauron` | `mordor.html` | Mordor: the whole land (fan work) |
| `/minastirith` | `/minastirith.html`, `/mt`, `/gondor` | `minastirith.html` | Minas Tirith: the seven circles (fan work) |
| `/isengard` | `/isengard.html`, `/orthanc`, `/saruman` | `isengard.html` | Isengard: the Ring and Orthanc (fan work) |
| `/moria` | `/moria.html`, `/khazad-dum`, `/dwarrowdelf` | `moria.html` | Moria: Khazad-dûm under the mountains (fan work) |
| `/infinitycastle` | `/infinitycastle.html`, `/mugenjo`, `/infinity-castle`, `/nakime` | `infinitycastle.html` | The Infinity Castle (fan work) |
| `/fleshpit` | `/fleshpit.html`, `/mfpnp`, `/pit` | `fleshpit.html` | Mystery Flesh Pit National Park (fan work) |
| `/yellowstone` | `/yellowstone.html`, `/ynp`, `/caldera` | `yellowstone.html` | Yellowstone National Park: the real ground and the caldera |
| `/backrooms` | `/backrooms.html`, `/level0`, `/noclip` | `backrooms.html` | The Backrooms (fan work) |
| `/city` | `/blame.html`, `/blame`, `/megastructure`, `/killy` | `blame.html` | The City, after *Blame!* (fan work) |
| `/rivendell` | `/rivendell.html`, `/imladris` | `rivendell.html` | Rivendell: the cleft of the Bruinen (fan work) |
| `/shire` | `/shire.html`, `/hobbiton`, `/bagend` | `shire.html` | The Shire: Hobbiton and Bywater (fan work) |
| `/arrakeen` | `/arrakeen.html`, `/arrakis`, `/dune` | `arrakeen.html` | Arrakeen: the city in the basin (fan work) |
| `/beachcity` | `/beachcity.html`, `/beach-city`, `/stevenuniverse`, `/delmarva` | `beachcity.html` | Beach City (fan work) |
| `/hyrule` | `/hyrule.html`, `/botw`, `/breathofthewild`, `/zelda` | `hyrule.html` | Hyrule, after Breath of the Wild (fan work) |
| `/oldesthouse` | `/oldesthouse.html`, `/control`, `/fbc`, `/oldest-house` | `oldesthouse.html` | The Oldest House, after Control (fan work) |
| `/termites` | `/termites.html`, `/termite-mound`, `/mound` | `termites.html` | The Termite Mound: a Macrotermes mound at termite scale |
| `/europa` | `/europa.html`, `/conamara`, `/ice` | `europa.html` | Conamara Station: on the ice of Europa |
| `/enterprise` | `/enterprise.html`, `/ncc1701d`, `/galaxy` | `enterprise.html` | Enterprise: Galaxy class (fan work) |
| `/voyager` | `/voyager.html`, `/ncc74656`, `/intrepid` | `voyager.html` | Voyager: Intrepid class (fan work) |
| `/ds9` | `/ds9.html`, `/deepspace9`, `/terok-nor` | `ds9.html` | Deep Space 9 (fan work) |
| `/babylon5` | `/babylon5.html`, `/b5`, `/babylon` | `babylon5.html` | Babylon 5 (fan work) |
| `/homeworld` | `/homeworld.html`, `/kharak`, `/hw` | `homeworld.html` | Homeworld: the Kharak system, missions 1 and 3 (fan work) |
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
- **Five things that are shapes rather than heights** (`src/venice/landmarks.js`): the Campanile, with its
  brick shaft, stone belfry, spire and the gilt angel that turns; the Basilica's five domes over a Greek
  cross; the Salute, its great dome held down by sixteen scrolls; the Rialto, one stone arch with two
  rows of shops standing on it; and the Doge's Palace on its mapped site - the arcade and the loggia
  holding up a wall of pink and white lozenges, its pointed windows and balcony, the crenellation, the
  Rio wing, the courtyard with the Scala dei Giganti and the Porta della Carta. Its mapped wings are dropped
  with `clearArea` (an outline, so the Basilica beside it keeps its own). Everything else is its own mapped
  footprint.
- **What is only in Venice** (`src/venice/life.js`): 960 comignoli, the bell-mouthed chimney pots that are
  that shape because the city is built of wood inside and a spark on a roof took out a sestiere; 1,000
  bricole, the mooring posts driven into the mud — in threes to mark a channel, singly and striped outside
  the palazzi, in the house's own colours; 240 gondolas tied to them, rocking; washing across the calli at
  second-floor height, because there are no gardens and the campi are public; and awnings on the campi.
- **No terrain.** The city is at sea level and the lagoon is mapped, so the ground is flat by construction
  and the water polygons do the work. `camera: {elMin: -0.35}` lets you look along a canal instead of down
  at it.
- **Alive, as Rome is**, on the same shared stages in `src/core/`:
  - `palazzi.js`: low terracotta roofs; the comignoli are lifted clear of them (`life.lift`).
  - `courts.js`: the corti, kept with `courtyards`, and a vera da pozzo in every campo of 150 m² or more
    (`courts.campoWells`).
  - `streetlife.js` with `style: "venice"`: shopfronts and cafés on the calli and campi; Istrian-stone dress and
    Gothic windows; on every wall in a canal (`water`), the green tide band, water gates and balconies. Smoke rises
    from a share of the chimneys.
  - `crowds.js`: walkers on the calli, crossing the bridges on their decks; tourists at San Marco, the Rialto, the
    Accademia, the Salute; pigeons in the Piazza.
- **Piazza San Marco** (`piazza` in `landmarks.js`): Tirali's Istrian-stone bands, fitted to the mapped outline, and
  Florian's and Quadri's orchestras among their tables.
- **The boats** (`boats.js`) are one instanced mesh per kind: gondolas, with the gondolier in his striped shirt and
  boater, vaporetti, barges and water taxis. The moored gondolas and the washing are instances too.
- The lagoon is `lakeColour`, the calli and campi trachyte grey, the plaster `palette` Venetian.

Data: `python3 tools/fetch-osm.py venice`, then `python3 tools/build-osm-city.py venice`.

### `/rome`: Rome

The historic centre from OpenStreetMap on the shared engine, with its real hills: from the Vatican and Castel
Sant'Angelo across the Tiber to the Lateran, and from Piazza del Popolo past the Forum and the Colosseum to the Pyramid
of Cestius. 17,766 buildings over 5.8 by 5 km; the ground rises from the Tiber 93 m to the tops of the hills.

- **The great buildings are modelled** (`src/rome/landmarks.js`), from their published dimensions, each placed and
  turned to its mapped footprint - OpenStreetMap carries 3D parts for most of them, which gave the bearings - and the
  mapped parts it replaces cleared with `clear` or, where a monument reaches far from its marker, `clearArea`:
  - the Colosseum: eighty bays round its true ellipse, three arcaded storeys with half-columns in the three orders,
    the attic with its pilasters, windows and corbels; the outer ring standing on the north only, the buttresses at its
    broken ends, the second ring ragged on the south; inside, the radial walls, the broken seating vaults with a sector
    of seats rebuilt, the podium, and the arena floor part-rebuilt over the open hypogeum
  - the Pantheon: the brick rotunda, the stepped ring and the low dome with its oculus, the intermediate block, the
    sixteen granite columns of the portico, the inscription on the frieze; the fountain and its obelisk in front
  - St Peter's: Maderno's front with its giant order, loggia, attic, clocks and thirteen statues, the nave, the Greek
    cross and its apses, Michelangelo's dome on its drum of paired columns to 136 m, and the four lesser domes; and
    Bernini's square - the colonnades four deep with their saints, the corridors, the obelisk, both fountains
  - the Vittoriano, Castel Sant'Angelo and the angels of its bridge, the Trevi Fountain, Sant'Agnese in Agone and the
    Four Rivers, the Forum's temples and arches, the Arch of Constantine, the Basilica of Maxentius, the Theatre of
    Marcellus, the Pyramid of Cestius, the Spanish Steps and Trinità dei Monti, Trajan's Column and Marcus Aurelius'
  - the skyline: sixteen church domes, the campaniles, Sant'Ivo's spiral, the Synagogue's square dome, the Lateran's
    front and its fifteen statues, and the obelisks
- **The stone pines and the cypresses** (`src/rome/life.js`) in every mapped park, garden and wood.
- **Palazzi, not houses.** The map leaves most of the centre without heights, and the build tool's default (9 m) is a
  suburb's. `defaultHeights` and `heightSpread` in `rome.json` give untagged buildings a palazzo's four to six floors,
  varied building by building; `ruinZones` keep the Forum and the Palatine low; `facade` gives the walls a palazzo's
  rhythm, tall storeys and windows wide apart. All three are read by the shared tools only when a city sets them.
- **Roofs and courtyards** (`src/rome/palazzi.js`): hipped terracotta roofs with chimneys on the simple blocks, tiled
  slopes and cornices on the rest. `courtyards` keeps the map's inner rings, so a Roman block is open in the middle,
  windowed inside, its roof sloping away from the court.
- **Courtyards, fountains, ruins** (`src/core/courts.js`): court floors, wellheads, fountains, citrus trees and palms,
  pots, porticoes; a basin for every fountain the map names; broken wall tops and strewn drums in the Forum.
- **Street life** (`src/core/streetlife.js`): in the centre, shopfronts (lit at dusk), awnings, signs, the farmacie's
  green crosses, café tables on the pedestrian streets and piazze; plinths, string courses, quoins, balconies and
  flower boxes on the façades; benches, lamps and hedges in the parks, the Pincio's busts, people out on the grass;
  smoke from a share of the chimneys (points moved on the GPU). Built only near the camera, a few ms a frame.
- **People and traffic** (`src/core/crowds.js`, `src/core/traffic.js`): walkers on every street, some in pairs, legs
  swinging with the distance walked; tourists at the sites, strolling or taking photos, kept out of the basins; Fiat
  500s, Vespas, ATAC buses, trams and trains. Only what is near the camera is moved and drawn.
- **Campo de' Fiori, the Barcaccia, the Pantheon's fountain** are modelled too; the river gods, horses and statues
  share helpers in the landmark kit. The compass and the Map button come from `src/core/navmap.js`.
- **For Firefox**: every instanced tile is culled by its own bounds (`instanceCulling`), trees switch near and far
  with hysteresis, ways are chained in linear time (`src/core/chains.js`). `#drawstats` in the address puts a tally of
  draws by stage in the details (`src/core/drawstats.js`); `extraMs` there times each of the page's stages.
- **The Ponte degli Annibaldi** (`annibaldi` in the landmark kit): Cellini's footbridge over Via degli Annibaldi, placed
  from its mapped ends (OSM way 24167622, an unnamed footway the road query leaves out), with its own view of the
  Colosseum. The 12 m elevation grid smears the Oppian spur across the street, so `terrainCuts` carves the cutting
  back to the street's own profile. The engine reads that only when a city sets it, and keeps the uncut ground as
  `groundH0`. The model walls the cut and lays its floor.
- **Via dei Fori Imperiali** is mapped as a service road, which the road query also leaves out. `fetch.extraRoads`
  fetches named service roads into `roads-extra.json`; `namedService`, `namedServiceMatch` and `roadWidths` make the
  street-named ones streets, the avenue 26 m wide.
- **Events** (`src/rome/events.js`, on `src/core/happenings.js`): the Frecce Tricolori over the Vittoriano, a fumata
  from the Sistine Chapel, the Girandola over Castel Sant'Angelo, coins in the Trevi, *Roman Holiday* on a Vespa down
  Via dei Fori Imperiali and up the Corso, and the starlings over the Tiber at dusk. A night or dusk event moves the
  clock. `#event=<name>` fires one on arrival.

Data: `python3 tools/fetch-osm.py rome`, `python3 tools/fetch-terrain.py rome`, then `python3 tools/build-osm-city.py rome`.
The centre is dense, and the public Overpass server times out on whole tiles when it is busy: fetching a tile in
smaller pieces and merging them gets through.

### `/tokyo`: Tokyo

Central Tokyo from OpenStreetMap on the shared engine, the first strip of a city that grows outward: Shinjuku's towers
and Kabukichō, Meiji Jingū's forest, Yoyogi, Shibuya Crossing, Akasaka and Roppongi, the Imperial Palace, Tokyo Station,
Marunouchi, Ginza and Tokyo Tower - 8 by 5 km, 61,854 buildings, built in under four seconds.

- **Landmarks** (`src/tokyo/landmarks.js`, on the shared kit `src/core/landkit.js`):
  - Tokyo Tower: the lattice in its eleven bands, the main and top decks, the antenna.
  - Shibuya Crossing: zebras fitted to the junction's own arms, the diagonals, Hachikō, video screens playing.
  - Tokyo Station's red-brick Marunouchi building with its domes, cleared over the mapped parts with `clearArea`.
  - The Diet's stepped tower, Nijūbashi's stone bridge and the Fushimi-yagura, the Wakō clock tower, Kabukichō's gate,
    Godzilla over the Hotel Gracery, Zōjō-ji's Sanmon, and Meiji Jingū's Ōtorii (turned to its mapped outline).
- **Street life**: `src/core/streetlife.js` with `style: "tokyo"`. It gives shopfronts and fascias, the odd konbini,
  vertical kanban glowing in their own colours after dark, vending machines, izakaya lanterns and air-conditioners. The
  back streets get utility poles and their wires.
- **Trees**: `src/core/groves.js` fills the woods, parks and gardens: Meiji Jingū's forest, Yoyogi, the palace,
  Shinjuku Gyoen. Tokyo's woods are `landuse=forest`, which the land query leaves out, so `fetch.extraLand` brings them
  in `land-extra.json`.
- **Traffic**: `src/core/traffic.js` (`vehicles`) drives on the left (`side: "left"`). The trains keep to their lines,
  coloured by name (`lineColours`: 山手線 green, 中央線 orange, 総武線 yellow).
- **The map**: `src/core/navmap.js` draws the plan from the map data itself. Its "All Tokyo" tab (`navmap.regions`;
  `#mapall` opens it) shows the strip built so far against the areas to come. Stages can draw live layers on the plan
  (`api.MAP_LAYERS`).

- **Facades**: the engine's `facadeStyles` (`src/engine/stages/03-blocks.js`, read only when a city sets them). Each
  style is picked by building type, height and a share, the first that fits winning:
  - towers over 70 m in glass curtain walls with a specular glint;
  - apartments with balcony slabs, frosted railings and washing;
  - offices with ribbon windows;
  - older mid-rises in brown and beige tile.
- **Junctions**: zebras across every arm of every junction of real streets (3,389 of them). The main ones get signals
  on their corners, with Japan's horizontal heads, and white guardrails run along the main roads' kerbs.
- **Roofs** (`src/tokyo/roofs.js`): red aviation lights blinking on every tower over 60 m, helipads on those over
  100 m, and the billboards on the mid-rise roofs of Shinjuku, Shibuya and Ginza, lit at night. Tokyo Tower is
  floodlit orange after dark.

- **The Shuto and the footbridges** (`src/tokyo/streets.js`). The expressway runs on T-shaped concrete piers every
  30 m, with box girders, parapets, lamps and sound walls, drawn from the decks' own heights. `bridgeOverGround`
  measures decks from the ground under them; it is needed on a plateau, and the engine reads it only when a city sets it.
  The 394 footbridges (歩道橋) have steel spans at 5.5 m clearance, stairs at both ends and route signs.
- **3D balconies** on the south faces of apartment blocks near the camera, and **konbini at their mapped doors** in
  their brands' colours (873 stores). Both are in `src/core/streetlife.js`, Tokyo style. `fetch.extraFiles` brings in
  the footbridges and shops as `footbridges-extra.json` and `shops-extra.json`; the build writes them as `footbridges`
  and `konbini`.

- **Greater Tokyo, streamed** (`src/core/metro.js`, `src/core/metroworker.js`). Around the detailed core, the
  whole of Greater Tokyo is drawn, from Yokohama to Chiba city and from Haneda to southern Saitama: 3.9 million
  buildings in 3,477 tiles of 1 km.
  - Tiles within 2.2 km of the camera are fetched and built in a Web Worker, so the main thread never builds
    geometry. They carry the ground, land cover, roads and decks, and buildings in the engine's facade styles
    (`api.BLD_MATS`). A tile left far behind is thrown away.
  - Beyond that, the skyline blocks show the tall buildings out to 26 km. Under them is a coarse ground tinted from
    green to a city carpet by how built-up each place is, and a sea at sea level.
  - Land is taken from the map, not the elevation: eastern Tokyo's zero-metre zones are land. The landmarks outside
    the core (the Skytree, Sensō-ji, the Asahi flame) are reseated on the tiles' ground when their tile arrives.
  - `cameraFar` and `farLevel` are city settings that let the region run to the horizon.
  - Trains run on every rail line in the region (`src/core/metrolife.js`), in their line colours, within 4 km of the
    camera; outside the core they come from `rail.json.gz`, one file of all the region's rail, so a train runs on
    across tiles. Each loaded tile also brings its cars (driving on the left, on the main roads) and people walking
    its streets. They come and go with the tile.
  - The far ground is cut away under each loaded tile, so it never shows through on a slope. Its city/green tint
    comes from how much of each tile is roofed as well as how many buildings it has, so the bay islands read as
    city. `#lifedebug` in the address reports the nearest train, car and person.
  - The elevation is filtered before anything is laid on it. Around Tokyo the AWS terrain tiles carry the city's
    surface: towers stand in them as spikes of up to 50 m, and pits of metres lie on flat ground. A grey opening
    removes raised bumps narrower than about 150 m (buildings, not hills), a small closing fills pits, and a blur
    smooths the rest. This happens in the tiler (`demOpen`, `demClose`, `demBlur` in `metro`) and in the core
    (`terrain.filter`, in metres; opt-in, read by `tools/build-osm-city.py`). The datum is taken before filtering,
    so the two still meet.
  - The streamed roads follow a smoothed profile (about 60 m either way, 180 m for a deck), never below the ground.
  - Walls facing a street get shops, by the street's class (most of a main road or a pedestrian street, a third of a
    residential one): a lit window, an awning, and on taller buildings a vertical sign. The residential streets get
    utility poles every 30 m with their cables, and vending machines. The signs, windows and machines glow after
    dark.
  - The tiles come from `tools/metro-tiler.py`, run with pyosmium in `data/osm/raw/venv`, over Geofabrik's Kantō
    extract (`data/osm/raw/kanto/`). It writes to `data/metro/tokyo/`: about 133 MB, git-ignored, and rebuilt in about
    12 minutes. `--write-only` redoes the tiles from the parsed features in a couple of minutes.
- **The map's "All Tokyo" tab** shows the detailed core and the streamed region.

**Edinburgh** (`edinburgh.html`, `src/edinburgh/`, `data/cities/edinburgh.json`). The Old Town down its ridge from
the Castle, the New Town across the valley, Holyrood under Arthur's Seat, Calton Hill, Dean Village, and Leith on the
Forth: 35,000 buildings on their real ground.
- **The data** came from Geofabrik's Scotland extract, because Overpass timed out on most of the tiles:
  `tools/pbf-to-overpass.py <city> <extract.osm.pbf>` writes the raw files the builder reads, in Overpass's
  `out geom` shape, with the same filters as `tools/fetch-osm.py`.
- **The Castle Rock**: the elevation tiles make it forty metres short. `terrainRaise` (an engine setting: a polygon
  raised to a height with cliffs round it, or a ramp along a profile) puts the rock and the Esplanade back, so the
  castle's mapped buildings stand on it. The model adds the curtain walls and the Half Moon Battery. `terrainCuts`
  lowers the Grassmarket into its hollow.
- **Landmarks** (`src/edinburgh/landmarks.js`): St Giles' and its crown steeple, the Hub's spire, the Scott Monument,
  the National, Nelson and Dugald Stewart Monuments on Calton Hill, the Balmoral's clock tower, the Palace of
  Holyroodhouse's tower front, Holyrood Abbey and the Ross Fountain.
- **Life**: Lothian's maroon buses and the trams, ScotRail and LNER into Waverley (stopping there), crowds on the
  Royal Mile and at the sights, and chimney smoke.
- **Events** (`src/edinburgh/events.js`): the Tattoo's fireworks, the One O'Clock Gun, the haar rolling in off the
  Forth, and a piper by St Giles'.
- **Detail**: St Giles' has its buttresses, traceried windows, clock and crocketed crown; the Scott Monument its arches,
  corner turrets and crocketed spire, with Scott and Maida under it; the National Monument its stylobate, fluted
  columns and triglyph frieze; the Nelson Monument its castellated base and time ball; Holyroodhouse its windows,
  chimneys and crowned cupola; the Castle its flags, Mons Meg and the Half Moon Battery's guns. Added: the Royal
  Scottish Academy and the National Gallery on the Mound, the Camera Obscura, Greyfriars Kirk and Bobby, St Mary's
  Cathedral's three spires, the Old College dome and its Golden Boy, the City Observatory, and Victoria Street's
  painted shopfronts.
- **Crags** (`src/edinburgh/crags.js`): basalt outcrops wherever the ground is steep on the Castle Rock, Arthur's Seat
  and Calton Hill. Princes Street Gardens are cut down into their valley.
- **Trees**: Edinburgh maps every back green as a garden, so the engine's park scattering is configurable now
  (`treeCells`, `treeMinArea`, `treeFar`). Scrub can stay low instead of becoming woodland (`scrub: "low"`, read by
  `tools/build-osm-city.py`), which leaves Arthur's Seat as grass and gorse.
- **Roofs and chimneys**: the tenements and terraces are slate-roofed (`pitchAll`, an engine setting: which building
  types get a pitched roof, and how many of them). `src/edinburgh/oldtown.js` puts chimney stacks with their clay pots
  on the gables (the engine marks the footprints it roofed, and `api.ROOF` gives the pitch). They are drawn in 500 m
  tiles within 900 m of the camera. Victoria Street's walls are painted.
- A landmark's `height` raises the mapped building under it (Chicago's towers use this), so a model's own heights
  are called `towerH`.

**The photograph on the Ponte degli Annibaldi** (`src/rome/photo.js`, `photo` in `rome.json`): a couple at the railing
with the Colosseum behind them, the love padlocks round them, on a hazy evening. The figures are stylised. "The
photograph" among Rome's viewpoints, or `#photo`, opens on it at its hour.

**Tokyo's life, the bay and the seasons.**
- **Stations** (`src/tokyo/stations.js`): wherever the trains stop (the traffic's `stationDwell` and `stationNear`), a
  platform runs beside the track for a ten-car train, under a canopy, with its yellow edge line. It goes on the side
  with no other track and never over another platform. People wait on it by the hour: none in the small hours, a
  few at midday, and full at the two rushes.
- **The Shinkansen** (`vehicles.shinkansen`): the Tōkaidō and Tōhoku lines run sixteen-car N700s with their
  duck-bill noses (traffic's `opts.head`, a second mesh for the end cars), faster, a minute at Tokyo Station. The
  streamed region runs them white and fast too.
- **The bay**: the Rainbow Bridge (its towers, cables, two decks and lamps; `clearDecks` takes the mapped
  expressway's own deck out of the tiles), the Fuji TV building with its sphere, and the Unicorn Gundam, whose frame
  glows after dark. (Odaiba's Ferris wheel closed in 2022, so it is not here.) Yakatabune and the water buses go up
  and down the Sumida (`src/tokyo/water.js`, along `rivers.sumida`).
- **Seasons** (`src/tokyo/seasons.js`): cherries on both banks of the Meguro, along Chidorigafuchi, up Ueno Park and
  in Sumida Park; ginkgo in Icho Namiki. Spring brings the blossom (lit at night), autumn the gold ginkgo. The season
  comes from the date, `#season=`, or the button at the bottom left.
- **Events** (`src/tokyo/events.js`): the Sumidagawa Hanabi, the Sanja Matsuri's mikoshi up Nakamise (`clearPath`
  clears the streamed buildings out of a landmark's approach), the Shibuya scramble at the rush, and Godzilla's
  atomic breath.

**The ground and the trains of the other real cities.** New York, Portland, Rome and Chicago have the same
filter as Tokyo (`terrain.filter`). Their raw map data is not all at hand, so `tools/filter-terrain.py <city>`
filters a built grid in place; it marks the grid and will not filter it twice. Manhattan had towers standing in its
ground up to 44 m, and Portland had its towers and Forest Park's canopy. The engine's commuter trains
(`05-el.js`) used to run at the datum, 0.2 m, wherever the land was, and the light rail and streetcars at 0 off a
bridge. They now ride the ground, a road deck, or across a mapped rail bridge the chord between its ends (at least
`railBridge` metres clear of what it crosses, on a deck that is now drawn). They keep to their named line, never a
yard. Each city sets its livery in `commuter` (`body`, `band`, `cars`, `freight`): Metra in Chicago, Metro-North
in New York, freight on Portland's Union Pacific and BNSF lines, Trenitalia over Venice's Ponte della Libertà.
A city whose own traffic runs its trains (`vehicles`: Rome, Tokyo) does without these. `#raildebug` reports where
the first train is.

Data: `python3 tools/fetch-osm.py tokyo`, `python3 tools/fetch-terrain.py tokyo`, then `python3 tools/build-osm-city.py tokyo`.
A tower mapped as an outline with only its upper parts (the Docomo Yoyogi building's spire) keeps its outline up to its
lowest part.

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
  `src/middleearth/hosts.js` publishes), and shut behind it; braziers burn along the parapet and on both Teeth.
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

Nothing it builds has changed: `tests/golden/voth-default.json` was taken from the old page and the new one
matches it, with the same draw calls and triangles. It now runs on the site's shared core like the other pages
(`src/voth/main.js`): the loading screen that says what it is doing while it builds (it used to sit on one
line for the whole of it), the error box, one render loop instead of five, the site's controls, an address
that keeps the view (`#v=`, `#view=<name>`), context loss, and the wireframe. Its look (`css/voth.css`) and
its panel of tools - the day slider, weather, the inspector, the path viewer, the polygon marker - are its own.

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

- **The keel** (`keel`, in `src/minastirith/landmarks.js`). "A vast pier of rock whose huge out-thrust bulk
  divided in two all the circles of the City save the first... its edge sharp as a ship-keel facing east",
  crowned by a battlement, so that from the Citadel you look sheer down on the Gate seven hundred feet below.
  So in plan it is a ship's bow: 120 m across where it comes out of the Citadel, drawing in along a curve to
  a point, and the stem leans out 60 m over its own foot so the point hangs over the court behind the Great
  Gate. Its top is the Citadel's pavement carried out to that point, with a battlement along both edges that
  meets there. Earlier versions got the one thing that matters wrong — the east end was a thirty-metre wall
  with a platform on it, and from the Pelennor it read as a causeway; the faces were boxes stood against a
  slab, which read as grey skyscrapers; and it ran a kilometre west as a free-standing wall, cutting the
  western circles in two. Now the faces are one mesh, fluted by noise stretched up the face and stained by
  vertex colour, built to exactly `keel_half` in the generator; it rises out of the Citadel; and it is no
  longer in the heightfield, whose fifty-metre ridge stuck out through the faces as a sawtooth of grass.
- **The mountain behind it.** The city stands at the foot of Mindolluin on a spur: the mountain's skirt stops
  at a front behind the city (it used to carry on past it, so levelling the city left it in a crater with a
  steep rim all round), a steep bank climbs from behind the outer wall into the mountain, and each tier's step
  up is made just inside its wall, where the wall hides it, rather than under it, where on a fifty-metre grid
  it spilled out in front as a pale skirt.
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
- **A city with people in it** (`src/minastirith/life.js`; a chimney, a fire or a broken roof goes only where
  a point is inside a house's own outline — `roofAt` answers open ground with the tallest roof within twenty
  metres, which hung chimneys in the air beside every hall and wall): 190 banners hung from the parapet of every
  circle, waving with a wave that runs down each one, black for the Steward and silver on the seventh; the
  cooking smoke of 420 chimneys, all leaning the same way because it is the same wind, which is the one
  thing that makes a stone city look inhabited from a mile away; 150 market stalls on the wider stretches of
  the lower circles, because the Pelennor has been emptied into the city; and fire in 63 braziers on the
  walls, which comes up as the light goes.
- **The Citadel** (`src/minastirith/landmarks.js`). The **White Tower** at the book's fifty fathoms, "a spike
  of pearl and silver": a stepped plinth, a shaft in courses with pilasters up its angles and lancets in its
  faces, a corbelled gallery with a battlement near the top, a belfry stage with pinnacles at its angles, and a
  spire to a silver point, with the Steward's black banner over it. The **Hall of the Kings** against the
  Tower's foot — a nave under a lead roof with a clerestory, aisles lit between buttresses, and a portico of six
  columns under a pediment — where the generator used to put a box a hundred and twenty metres long across the
  seventh wall. The **Court of the Fountain** before its door: a paved square, the sward, the pool and its jet,
  benches, the guard in black and silver, and the White Tree dead and drooping over the water. The seventh
  circle is one level court to its own wall (the tier steps are made inside each wall, except this one), and the
  Closed Door to the Hallows is in its rear wall. And **the Great Gate**, black, with its towers.
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
- **The siege** (`src/middleearth/hosts.js`, imported rather than copied — it is the same war, seen from the
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
- **What the siege has done** (`src/minastirith/decals.js`): the Pelennor cratered and scorched in front of
  the host, trodden to mud under every block and up the lane Grond was dragged along, and stuck with spent
  arrows under the wall; the white walls blackened where fire was thrown at them and the black one scarred
  pale by stones, worst round the Gate. Half the lit stones now clear the wall and come down in the streets
  and on the roofs (`overWall` in the siege config; Mordor's does not set it), and where one lands on open
  ground it leaves a scorch. Soft-edged canvas textures on instanced quads: 565 marks, a handful of draw
  calls, all of it hidden in peace.
- **The Mountains of Shadow, and the Darkness** (`src/minastirith/shadow.js`). The Ephel Duath closes the
  east: a jagged range across the whole horizon beyond the Anduin, with the notch of the Morgul Vale, drawn at
  the angle the real range would stand at from forty-five kilometres - grey-blue in the haze in peace, black
  in the war. In the war the sky is a roof of brown cloud blown out of Mordor, drifting west over the city and
  the mountain to a ragged edge low in the western sky, lit red from underneath in the east where the mountain
  is burning and glowing behind the skyline; the light under it goes brown and short. Neither fits in the map
  (the camera sees twenty-four kilometres), so both are backdrops that travel with the camera, drawn after the
  sky and before everything else, so the land and the city are always in front of them.
- **The garrison** (`src/minastirith/garrison.js`). In the war every circle's wall is manned by the Guard in
  black with silver helms: shoulder to shoulder along the first wall on the side the host is on, spearmen and
  companies of archers under white standards; a watch on each wall above, along the battlement of the rock and
  on the towers of the Gate; and patrols walking the walls between the posts — about 2,400 men, instanced,
  each standing on the top of the wall he belongs to.
- **The Great Gate is shut in the siege** and thrown open in peace; each leaf is its own object, so it can be
  broken in, and `ctx.onWar` puts it back up.
- **Events** (`src/minastirith/events.js`, on the shared `src/core/happenings.js`), every minute or two on
  their own or from the **Events** button, and only in war — peace stops them, puts back what they moved and
  hides the button. **The Steward**: Denethor on fire, out of the Citadel and along the crest of the rock at a
  run (`ctx.keel`, from the landmark, so he is on it), over the parapet at the point and down the whole height
  of the city in a streak of fire and smoke. **The horns of Rohan**: the six thousand riders on the north of the
  field charge the host (`ctx.siege`, from hosts.js), the blocks in the way are pushed off the line, and they
  wheel and re-form. **A Nazgul on the walls**, stooping out of the east and along the first circle, and the
  light going out of the day as it passes. **The White Rider** coming out of the Gate to meet Faramir's company
  with the Nazgul on it, and the light that drives them off. **Mumakil** out of the south with towers on their
  backs. **Black sails** on the Anduin — until the first ship breaks out a banner with a White Tree, seven stars
  and a crown; the ships stay moored until peace. **The Gate broken**: Grond's three strokes, the doors bursting
  in at the third, the Captain of the Nazgul riding in under the arch to find one rider waiting for him — and
  then a cock crows, horns answer out of the north, and the Rohirrim charge. **A siege tower** rolled up to
  the first wall, its bridge let down on the parapet and men going over, and then fired from the wall until
  it goes over backwards and burns. Whatever moves, **Go and look** now follows (`follow` in happenings.js,
  on the engine's camera stack): the target moves with it and the turn and zoom stay yours, until it is
  over, you pick a viewpoint, or press Stop. **The Dead**: once the black ships are in, the Dead Men of
  Dunharrow come off them — two and a half thousand pale figures gathering on the bank — and go across the
  Pelennor like a tide, faster than horses, to the Mumakil (sent for if they are not on the field, and held
  there); they swarm up each beast until it goes over on its side, the host round them breaks, and when the
  last is down, their oath kept, they fade. The ships bring them; asking for them first sends the ships.
  `#event=steward&eventlook` fires one on arrival and follows it; `#evspeed=4` runs every event's clock four
  times faster, for watching a long chain through while working on it.
- **In peace: the Coronation**, from the peace-time Events button (the war's hides in peace, and this one in
  war). The people come up and fill the Court of the Fountain and the Guard lines the way; the King comes
  through them in black mail and a white mantle with the green jewel at his throat, round the pool to the
  steps of the Hall, where the Steward, the Ring-bearer and Mithrandir wait. The crown goes from the Ring-bearer
  to Mithrandir, the King kneels, it is set on his head — and the King's banner breaks out on the Tower (in
  peace it flies the White Tree, the stars and the crown; in war the Steward's black), the Tree sheds blossom
  over the court, and the people bow. Then the court empties.

Regenerate with `python3 tools/make-minastirith.py`, then `./sitectl build`.

### `/isengard`: Isengard

Fan work. Tolkien's world belongs to the Tolkien Estate; nothing from any book, film or game is used. The valley
of Nan Curunir is generated by `tools/make-isengard.py`; the Ring, Orthanc and everything on the plain are
modelled in `src/isengard/`. It is taken from the description in *The Two Towers*, which is exact about it.

- **The land.** Nan Curunir runs south from Methedras, the last peak of the Misty Mountains, which stands 3,600 m
  over the Ring to the north; the Isen comes down its flank in a glen, in under the Ring-wall at the north-east,
  round the plain in a stone cut and out beside the gate, and on south towards the Fords. The engine draws water
  at one level, which is wrong for a river coming down a mountain, so its surface is drawn by the page
  (`isen.js`), falling with its bed. The valley floor is cut down to stumps; **Fangorn** stands on the hills to the
  east as a dark wall of 14,000 trees (`fangorn.js` — the engine's trees are drawn only near the camera), its eaves
  ragged where they have been cut.
- **The Ring** (`ringwall` in `landmarks.js`): "a great ring-wall of stone, like towering cliffs", a mile across
  inside and 55 m high, of black rock — one mesh, fluted by noise up the face like the keel of Minas Tirith, and not
  in the heightfield at all. One way in: a tunnel under an arch in the south wall, lined, with doors of iron at both
  ends; the Isen's gratings at the north-east and beside the gate. Its inner face is cut with 2,600 windows and dark
  doors, some of them lit at night.
- **Orthanc** (`orthanc`): the book's 500 ft is the model's default, and the page raises it to 240 m (`height` in
  `isengard.json`), because against a Ring a mile across it read as a stump. Black rock with a hard shine — four many-sided piers, ribbed up their angles
  and flared at the foot into the plain, welded round a core and opening near the top into four horns that splay
  out to points, with the polished floor between them 500 ft up. A stair of 27 steps to the door, the window and
  balcony above it, and a high window where the palantir glows.
- **Saruman's works** (`works.js`): the plain paved dark, 70 forges between the roads, 150 domes over the shafts
  with vents that steam and glow red or blue or green at night, 38 iron chimneys smoking with fire at their mouths,
  and pillars of marble, copper and iron joined by sagging chains along every road to the centre; gangs of orcs
  about the forges and files of them on the roads; 2,600 stumps across the valley. The hosts march the Isen Road
  (`hosts.js`, the same module as Mordor's and Minas Tirith's, with white banners).
- **Saruman or the Treegarth** (`mode.js` — Minas Tirith's war switch under another name, driving the same flags).
  The Treegarth of Orthanc is what the Ents made of it afterwards: the works gone, the plain green, avenues of
  fruit trees along the old roads and groves between them, pools, and Ents walking among them (`treegarth.js`).
  `#war=off` opens on it. The Ring-wall is built as 48 segments, each whole and broken (its top torn down to a
  jagged stump, tapering back to full height at its ends, with rubble either side and its windows gone); the
  Treegarth has it thrown down in ten places.
- **Saruman's dam** (`dam.js`): across the Isen's glen above the Ring, a gravity dam — straight on the water
  side, stepped down its face — with its ends built into rock shoulders the generator leaves, a parapet along
  the crest, sluice towers and the great iron wheels of its machine-house, three sluices spouting down its face,
  and the reservoir behind it in a basin the generator digs. It is built in seventeen lengths so the middle can be
  broken; the reservoir is a sheet the banks hide, so draining it is lowering one number. In the Treegarth it is
  broken and the basin empty.
- **The smaller things** (`details.js`): torches along the top of the Ring and orcs walking it, the White Hand hung
  on its inner face (all of which goes with a length of wall when it breaks); a paved forecourt at the gate with
  watch-fires, a guard and standards; window slits up the piers of Orthanc and Saruman's banner under his
  balcony; on the plain, fire pits, iron wheels turning over the shafts, timber cranes, warg pens, stacks of
  timber and carts on the roads; outside, the camp of the Uruk-hai south-west of the gate, timber along the
  Fangorn track, burned trunks at the eaves, the great old trees at the very edge of Fangorn and mist under them;
  and Treebeard, in the Treegarth, by the tower.
- **The farmsteads**: ruined steadings down the valley by the road and the river, from before Saruman — the map's
  buildings, which the engine keeps in both Isengards (everything of Saruman's is the page's, so it can go).
  The roads have no pavements (`sidewalks: false`, an engine option): drawn under a paved plain they were a white
  edge along every road.
- **Events** (`events.js`, on `src/core/happenings.js`), in Saruman's Isengard: **the Uruk-hai go to war** —
  Saruman speaks from the balcony to a host drawn up in column on the Way of the Gate, and it marches out through
  the tunnel and down the Isen Road with torches and the White Hand; **the Ents** come out of Fangorn and batter the
  Ring-wall — each tears down the length it has been battering — while five more go to the dam; when the others
  are at the walls they tear its middle out, the reservoir goes down the glen in one wave along the Isen's course,
  and when it reaches the grating the Ring floods until the furnaces go out in steam and Orthanc stands in a
  lake (it stays drowned until the Treegarth); **a Nazgul** comes to Orthanc and circles the horns; **the
  palantir** glows red in the high window; and **felling at the eaves**, trees coming down at the edge of Fangorn.

Regenerate with `python3 tools/make-isengard.py`, then `./sitectl build`.

### `/moria`: Moria

Fan work. Tolkien's world belongs to the Tolkien Estate; nothing from any book, film or game is used. The
mountains are generated by `tools/make-moria.py`; the gates, the halls under the mountain and everything in them
are modelled in `src/moria/`. The page is outside and inside at once: the engine draws the mountains, and the
halls are closed rooms in the rock beneath them, which the viewpoints go into.

The layout follows the Fellowship's road through the mountain as the book gives it (*A Journey in the Dark* and
*The Bridge of Khazad-dûm*), gathered into `plan.js`.

- **Outside.** Caradhras, Celebdil and Fanuidhol, craggy (ridged noise, only on the high mountain) and with snow
  on them (`snow`, an engine option: the snow-line, above which the ground whitens raggedly; `snowShed` sets how
  much of it the steep faces shed). Caradhras is the Redhorn: `terrainTints` works a red into its rock. On the
  west the Walls of Moria (`westgate`): a fluted cliff, tapering into the slope at its ends, and in it the
  **Doors of Durin** between two hollies, with the ithildin — the arch, the crown and seven stars, the anvil and
  hammer, the two trees with their moons, the star of Feanor — coming up as the light goes; the dark pool before
  them (`lakeColour`: still, dark water). On the east the **Dimrill Gate** (`eastgate`) in its own face, its
  doors thrown down on the threshold, and the **Dimrill Stair** going down from it in cut steps, with a stream
  beside it falling to the Mirrormere. The **Dimrill Dale** is closed in by the mountains' arms north and south;
  in **Kheled-zâram** the stars show even by day, and over against **Durin's Stone**, a crown of seven.
  **Durin's Tower** on the summit of Zirakzigil. Each gate stands on a flat the generator leaves right up to the
  cliff line, and the cliff reaches down to wherever the ground in front falls away.
- **The road from the West-gate** (`halls.js`): a stair of two hundred steps inside the Doors; the long road
  east, with a fissure across its floor; the **guard-room** with the well in it; and the **fork of three
  arches**, where the right-hand way goes up and the other two end in fallen rock.
- **The halls**, at the level of the Gates. The **Dwarrowdelf**, a hall a kilometre long carried on six rows of
  pillars eight metres through, its walls black and polished, with a **gallery for every level** — ledges,
  flights of steps between them, and arched doors going off into the dark. The **Second Hall**, its double line
  of black tree-pillars, and right across its floor near the feet of two of them a **fissure of fire**, whose red
  light runs in the polished pillars. The **chasm**, fifty feet across and four hundred metres deep, with fire at
  the bottom and mithril in its walls, and the **Bridge of Khazad-dûm**, one curving spring without kerb or rail.
  The **First Hall** out to the gate.
- **The Seventh Level**, six above the Gates: up a stair from the great hall, the pillared **Twenty-first Hall of
  the North-end**, lit by shafts high in its east wall, and beside it the **Chamber of Mazarbul** — recesses in
  the walls with iron-bound chests broken open, bones and broken weapons, the Book, and Balin's tomb with runes on
  its slab, in the light from the window. From Mazarbul a stair goes down south to the Second Hall. The daylight
  in the shafts follows the hour.
- **The city** (`city.js`, this project's own inventions, made to sit with the book's "dwarf-city"). Down the
  **Grand Stair** from the great hall, the **Hall of the Mansions** in the Third Deep: a vault 150 m high over a
  city of some nine hundred stone houses - an avenue with a canal, a plaza with a fountain, streets and lanes,
  street lamps and great crystal lamps hung from the vault - and on both long walls six storeys of house-fronts
  on terraces with flights of steps between them; **Durin the Deathless**, sixty metres of him, at the west end.
  Through its east wall the **Great Forges**: two rows of hearths under hoods and chimneys, anvils throwing
  sparks, the great furnace and its channel of metal. Down the miners' stair, the **Delvings** in the Tenth Deep:
  the pit of the mithril lode with a headframe lowering its cage, scaffolds down its sides, ore-carts on a rail
  round the rim, mine galleries, and mithril shining in the rock. Up the **Kings' Stair**, the **Hall of Durin's
  Throne** on the Third Level: pillars, the throne on its dais, the crown and seven stars on the wall, and the
  **Seven Fathers** of the Dwarves in stone; through its west wall the **Great Cistern**, pillars in black water
  with causeways across it and a fall of water out of the rock. In Khazad-dum the windows are lit and the
  hearths burn; in Moria the windows are dark and the forges cold. The hall lights follow you: three lights,
  moved a few times a second to the nearest places a light belongs.
- **Getting about** (`walk.js`, on the engine's camera stack). **Walk** at a Dwarf's eye height on the floors the
  halls were carved with (`carve.js` records every floor and everything standing on one): W A S D, drag to look,
  Shift to hurry. Stairs are climbed by walking up them; walls, pillars, houses and hearths stop you, and so
  does the edge of a terrace, the pit, and the Bridge once it has fallen. **Fly** goes anywhere (Q and E down and
  up; F switches between the two). The **Map** (M) is the plan of the city, every floor coloured by its level,
  with you on it: hover for the name and level of a floor, click to be walking there; the places are buttons.
  Three **tours** walk themselves: the Fellowship's road (the great hall, up to Mazarbul, down to the Bridge, out
  to the gate), down into the city (the Mansions, the forges, the mines), and the throne and the cistern. A
  viewpoint chosen while walking puts you on the floor under it. `#walk`, `#walk=<place>`, `#fly`, `#tour=<fellowship|city|kings>`
  and `#map` open that way. The readout names the level: the Seventh Level, the Third Deep.
- **Drawing only what can be seen** (`deep.js`). Everything under the mountain is one group, drawn only when the
  camera is under the ground, at the Dimrill Gate (or the Doors, when they stand open), or with See inside on;
  under the mountain, away from the gates, the mountains are not drawn; the Endless Stair is drawn only with See
  inside. The terrain is on a 100 m grid. Before this the page drew some 630,000 triangles from everywhere and
  could bring a laptop's browser down; now it is 130,000 to 280,000.
- **Under the mountain** (`deep.js`): when the camera is under the ground the sun goes out, the fog closes in
  black, and a light goes with you. **See inside** (`#xray`) makes the mountain glass, to see the halls where they
  lie, and the **Endless Stair**: twelve thousand steps in unbroken spiral from the Deeps to Durin's Tower.
- **Moria or Khazad-dum** (`realm.js`): the dark, orcs round their fires in the great halls, bones in the
  passages (thickest in Mazarbul), pillars thrown down — or Durin's day, the lamps of crystal lit on every pillar,
  wall and gallery, Dwarves in the halls, and the Doors standing open. `#war=off` opens on Khazad-dum.
- **Events** (`events.js`), in Moria: **the Watcher in the Water** — arms out of the pool, the hollies torn down,
  and the Doors blocked with rock; **drums in the deep**, orcs pouring through the great hall and up the stair to
  the door of Mazarbul; **Durin's Bane** — the Balrog across the Second Hall to the Bridge, Gandalf's light, and
  the Bridge broken under it; **the Battle of the Peak** on Zirakzigil, the tower broken; **Caradhras**, a storm
  on the Redhorn Pass; and **a little more light**, the whole Dwarrowdelf seen for a moment. What they break stays
  broken until Khazad-dum.

Regenerate with `python3 tools/make-moria.py`, then `./sitectl build`.

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

### `/beachcity`: Beach City

Fan work. Steven Universe belongs to Rebecca Sugar and Cartoon Network; nothing from the show is used, and every
shape is generated by `tools/make-beachcity.py` or modelled in `src/beachcity/` in this project's own geometry.
Laid out after the map of Beach City published with the show (Sugar, 2014) and the wiki's descriptions of the
places, used as references for arrangement only; neither is in the repository. North is up, as on the map.

- **The town** sits at the west end of a strip of land between Rehoboth Bay (north) and the Atlantic (south), on
  the map's streets. East-west, from the bay: Bay Street (Funland's pier is off it), Waterman Street, Sussex Road,
  Main Street and Boardwalk Street; north-south, from the west: Chestnut Road, Chesapeake Street, Fenton Street,
  Bank Street, Crawford Terrace, and Thayer Street on a slant along the foot of the park, from It's a Wash down to
  Beach Access Drive and Big Donut. Beach City Highway (Route 1A) comes in from the north-west past the water
  tower, the Mayor's house and U-Stor. Every street is lined with lots facing it: shops of two and three storeys
  close and continuous on Main Street and Boardwalk Street, houses with yards elsewhere. Dewey Park, with the
  founder's statue, is the block between Main Street and Boardwalk Street.
- **The boardwalk** runs along the ocean beach; facing it, west to east: the visitor center, Cone 'N' Son, the
  Funland Arcade, Beach Citywalk Fries, Fish Stew Pizza, the T-shirt shop and, past Thayer Street at the foot of
  the hill, Big Donut. Umbrellas and towels on the sand; sailboats on the bay; the wrecked old docks on the bay
  shore east of the car wash.
- **Lighthouse Park** rises from Thayer Street and climbs steadily east to its tip, open grass with a bank down to
  the bay on the north and a tall, fluted cliff of grey rock along the whole of its ocean side, low at the town end
  and higher towards the tip, the beach running under it. The tip is rounded, with the lighthouse on its north edge
  at the end of a path across the park. **The temple** is cut into the cliff at the tip, facing the sea: the statue
  rising out of the sand to the top of the rock, long hair falling either side, a mask-like second face on her
  forehead, eight arms - four closing round the door at her navel, where the beach house is built on tall posts,
  three broken off in the sand, and the top-right one holding its hand up at half her height, palm open, with a
  washer, a dryer, a warp pad and a washing line on it. Broken pillars of stone and a small stone hand stand in the
  sand by the house. **The park stands between the house and the town**: from Steven's deck there is only the beach
  and the sea.
- **The shops**, as described: Big Donut's violet-brown walls, pink and blue roof, pink and brown awnings,
  umbrella table and chocolate donut with pink, green and blue sprinkles; Fish Stew Pizza white under a roof
  striped brick red and light green; the fries in a white building with a wooden fry-box sign; It's a Wash an L of
  wash bay and office with an elephant on its sign. Funland has the wheel, a roller coaster, the teacups, a
  carousel, bumper cars, a drop tower and the midway. Each model is drawn facing +x and turned to its street by
  the site's `ang` in the plan.
- **The sea** is the engine's `seaLevelWater`, with the land cut out of the water sheet (a hole traced from the
  ground, inset five metres from the waterline): one sheet over the whole box is drawn a little towards the camera and
  the town is only metres above it, so from far off the sea was drawn over the town. Its level moves: `ctx.sea`
  (`details.js`) holds a tide - high water at the engine's 0.7 m, half a metre lower twice a day by the clock, or held
  low or high by the Tide button, easing rather than jumping - a swell of a few centimetres, the tower event's drain,
  and the surge when the sea comes back after it, and moves the water and the sea plate past the edge of the map; the surf, the boats and
  the swimmers follow it, and the ground below the waterline is coloured wet sand and sea bed rather than grass. The
  surf lines are traced from the real waterline; past the edge of the map is sea, and the water sheet runs on 6 km
  so the ripples meet the haze. The water itself is the page's: a little transparent, so the shallows show the sand
  and the deep water darkens over a sea bed coloured by depth, with a tiling ripple normal map (forty waves at random
  angles, so it does not read as a grid) drifting across it. The boardwalk is drawn by the page in planks (`life.js`), because the
  engine's piers are concrete. Each landmark's static pieces are merged into one mesh per material
  (`solid()` in `landmarks.js`), which keeps the fluted cliffs to a handful of draw calls. The beaches go to the engine as short polygons on a straight slope: it lays them
  following the ground only at their corners, so a long polygon or a curved slope lets the grass show through.
- **The light:** the engine's sun is over +x in the afternoon (`sunAt` in `01-scene.js`), and the temple faces +x,
  so the page opens at 14:36.
- **What moves:** the wheel, the coaster's train, the teacups, the carousel, the bumper cars and the drop tower;
  the lighthouse's beam after dark; the surf on the ocean beaches (the bay is still); the gulls; the boardwalk lamps;
  sailboats on the bay; kites over the beach and a volleyball game under them. **Mayor Dewey's van** - white, his
  name down the side, loudspeakers on the roof - goes round and round the town (Main Street, Thayer Street,
  Waterman Street, Chestnut Road); click it.
- **People** (`life.js`), two instanced meshes for all of them: on towels and under umbrellas on the sand, walking
  along the edge of the water, swimming past the surf, strolling the boardwalk, in Dewey Park, on Funland's pier,
  and up on the lifeguard stands. At dusk the beach and the park empty - nobody sunbathing, swimming, playing or
  flying a kite in the dark, and the umbrellas and towels go with them - and they come back in the morning; the
  boardwalk, Funland and the town keep their evening crowd.
- **Events** (`events.js`, on `src/core/happenings.js`: every minute or two one turns up on its own, with a notice
  and a Go and look button; the Events button fires any of them, and takes the camera straight to it (following it
  if it moves: `fireAndLook`, every scene on happenings.js), and `#event=<name>` fires one on arrival):
  `handship` - the warship, a giant green left hand with three joints in every finger, comes in over the sea, turns
  to aim a fist with the index finger out and fires on the beach from it (a barrage with a kick and a flash at the
  muzzle for each shot, then a charged shot), flicks an escape pod off over the sea with thumb and index finger, lands
  on its fingertips in front of the temple (kept on the sand from where the tips really are) and walks on them, rises,
  turns upright palm to the beach and waves, and closes into a fist and goes. The fingers close one after another and
  the thumb comes across the palm; `redeye` - a giant red eye comes down out of the sky and the light cannon on the beach
  shoots it into the sea; `tower` - far out, the ocean is pulled up into a tower of
  water a kilometre high: the sea level falls fourteen metres and the sea bed comes out from under the beach, boats
  settle on it and the swimmers get out; then the tower falls and the sea comes back;
  `lion` - Lion, big and pink with a huge pale mane, walks the beach from the temple to the boardwalk and roars a portal open; `monster` - a
  gem monster crawls up the temple's beach and is poofed and bubbled; `fireworks` - over Funland.
- **The hill** is short, steep and tall: up from Thayer Street and climbing harder to 115 m at the tip by the
  lighthouse, rounded across, its high ground olive and tan as the background paintings have it. The statue grows
  with the cliff; the beach house stays on posts at her navel. She is turned on a lathe - hips, waist, chest, broad
  shoulders - with a jaw and cheeks, closed lidded eyes under brows, a ridged nose and lips, the mask on her forehead
  with a small face of its own, curls falling to the sand, and jointed fingers on the four hands round the house.
- **Dressing** (`details.js`): every building gets, from the plan's footprint and the side its street is on, a front
  door, framed windows on each floor (some lit after dark), a porch or a chimney, a picket fence with a path and a
  mailbox; every shop a glass front, a striped awning and a sign board, and units on the flat roofs. Benches, bins and
  hydrants along Main Street and Boardwalk Street, dune grass at the back of the beach, and a clearer blue sea than
  the engine's. All instanced: about a dozen draw calls for the town.

Regenerate with `python3 tools/make-beachcity.py`. It writes the ground, the streets, the houses and the trees for
the engine (`beachcity-osm.json`) and where each landmark stands and faces, the surf lines and the boardwalk for the
page (`beachcity-plan.json`). Views and cards are in `beachcity.json`; `#view=<name>` opens one.

### `/oldesthouse`: the Oldest House, after Control

Fan work after Remedy Entertainment's *Control* (2019) and its expansions; nothing of theirs is used. The Federal
Bureau of Control's headquarters - a windowless brutalist tower in Manhattan, and inside it far more building than
the outside could hold - built sector by sector in `src/oldesthouse/` and laid out from `data/cities/oldesthouse.json`
the way the Bureau's blueprints show them: Executive in the middle, Research to the west, Maintenance to the east,
Containment to the north, Investigations to the south, the Foundation below, the Astral Plane above everything, and
the tower itself on its street. Like the Infinity Castle it brings its own renderer and camera.

- **The kit** (`kit.js`): one Builder takes every static surface as quads in world metres, one array per material,
  cut into ~5 m cells. Every light fitting registers itself, and once the sectors are built `bake()` lights each
  vertex from the fittings near it (and from ambient boxes): pools under the fluorescent panels, the Furnace's gold,
  the Panopticon's teal, the Astral Plane's white - with no runtime lights. The fabric is unlit and shows its baked
  colour. Ceilings are their own meshes (`:ceil` keys), so the **cutaway** (X) lifts them and the House reads like
  its blueprints from above. Furniture and fittings (desks, cubicles, terminals, shelves of files, the Bureau's
  fluted piers, rails, panels, lamps, pipes, planters) are functions of the builder.
- **The surfaces** (`mats.js`): board-marked and panelled concrete, the Bureau's red carpet, walnut, terrazzo, tile,
  grating, black rock, the Ashtray Maze's sunburst paper, the motel's blue, acoustic ceiling tile, filed paper - all
  painted on canvases when the page opens.
- **The sectors**: `executive.js`, `research.js`, `maintenance.js`, `containment.js`, `further.js` (the Foundation,
  Investigations and the Oceanview Motel, the Astral Plane). Each builds its fabric, registers its light, its moving
  things, its views and cards, its fog zones and its events.

### `/termites`: the Termite Mound

A Macrotermes mound on the Namibian savanna, at the scale of the termites that built it: a worker (about 6 mm) is as
long as a person is tall, so the scale is 300 to one. Three metres of mound is a 900 m spire of red clay; the grass
round it stands 100 to 180 m high, the pebbles are the size of houses, and the acacia on the horizon is nearly two
kilometres tall. Built in `src/termites/` from `data/cities/termites.json` and a seed, with its own renderer.

- **The mound** (`mound.js`): one radius for every height and bearing (broad vertical buttresses, a flared skirt,
  a lean to the north), its turrets kept off the cut. The hollows are drawn as their own inside surfaces, merged into
  one mesh: the nest (a ball of flattened chambers and the galleries between them, a third of the chambers placed on
  the cut), the royal cell, the nurseries, the cupola, the chimney up the axis, the connectives out from it at six
  levels and the surface conduits under the skin, the base tunnels, eight foraging tunnels out under the savanna to
  holes in the ground, and the cellar shafts down to damp clay with water standing on their floors. Fungus combs
  on the chamber floors: folded sponges, finer near the cut where you see them close, with their white nodules.
  Older mounds across the savanna, worn down to domes, and a young one still a spire.
- **The cutaway** (X): four clipping planes remove a trench beside the mound (`cut` in the config), and its face is a
  canvas painted from the same geometry: the clay of the mound, the soil in its layers, and every hollow the cut
  passes through punched out with a darker lining, so you see into the far halves of the chambers. The mound's axis,
  the chimney, one connective each way at every level, two foraging tunnels and the cellar lie on the cut. The
  trench's other walls are painted the same way, so the foraging tunnels that cross them show as lined openings.
- **The colony** (`life.js`): 1,400 workers walking the galleries on their floors, soldiers at the tunnel mouths,
  gardeners on the combs, nurses among the eggs and larvae, the queen (26 m, breathing) and the king in the royal
  cell with her attendants. Some carry: a length of grass home along the foraging tunnels, a clay pellet in the
  galleries. Foraging parties come out of the holes on the near side, walk worn trails to the grass and carry it
  home, with soldiers round each hole. Motes show the air: by day up the conduits and down the chimney, by night
  the other way. Stars at night.
- **Inside it is dark**: underground or inside the mound, with the cutaway off, the daylight fades and only the
  lantern you carry is left.
- **Events**: the swarming (dusk; slits open in the skin and the winged alates pour out), a breach (the soldiers
  fill it facing out while the workers wall it up from the rim), the first rains (the sky closes in, drops the size
  of a person fall at their own nine metres a second, and the clay darkens as it soaks and dries again), and a day
  and a night in forty seconds.

### `/hyrule`: Hyrule, after Breath of the Wild

Fan work. The Legend of Zelda: Breath of the Wild and Hyrule belong to Nintendo; nothing from the game is used, and
every shape is generated by `tools/make-hyrule.py` or modelled in `src/hyrule/` in this project's own geometry. The
country is laid out by reading the game's published map by eye - where the regions, mountains, lakes, rivers, roads
and places are - used as a reference for arrangement only: no height, colour or pixel of it is used, and it is not in
the repository. North is up, about twelve kilometres across at eight metres a pixel of the map.

- **The land** is drawn like a contour map by hand. The highlands are `MASSIFS`: about twenty-five outlines read
  off the map by eye (a few dozen points each), each with the height its top reaches and a long slope up to it,
  nested so a highland steps up into its snows: Hebra and Tabantha, the Tundra, the Frontier, Hyrule Ridge, the
  Ridgeland, Eldin and Death Mountain's shoulders, Akkala, Zora's Domain, Necluda, Mount Lanayru, the hills over
  Kakariko, East and West Necluda, the Gerudo Highlands and their apron, the Gerudo Canyon, the southern mesa, and the
  mountains at the edge of the world beyond the low ground that rings the country. Each outline wanders a little and
  each top swells and ridges, so nothing is a flat table; it is all worked at once over the grid with numpy distance
  fields. On top of them, the `FEATURES` made by rule: single peaks, Death Mountain's cone and crater, the cliff-walled
  tables (the Great Plateau, the Great Hyrule Forest, the Rito highland), and the desert's dunes. The coast has the
  map's bays and capes: Lanayru Bay in by its narrow way, Hateno's three capes, the hooked spit, Lurelin's inlet, the
  long Faron shore. Lakes are outlines too, each with a shore that slopes down to the water rather than a wall.
- **The ground's colours** (`paint.js`) are repainted per vertex from the plan's regions: soft greens, jungle in
  Faron, autumn in Akkala, sand in the desert, ash and lava-red on Death Mountain, snow on the cold heights (lower in
  the north and west), grey rock on anything steep. The water - sea, lakes, the castle's and the forest's moats,
  rivers - is clear and rippled, each at its own level.
- **Built**, from one kit of solids and roofs (`kit.js`: gable, hip and Kakariko's hipped-and-gabled roofs, walls
  with merlons, extruded slabs, houses; everything still merged by material, a few draw calls a town). Each place
  stands on a pad of level ground the generator eases into the slope, and nothing grows on it.
  - `castle.js`: **Hyrule Castle**: the curtain wall with round towers, merlons and a gatehouse; two walled terraces
    with turrets; the great hall, two wings and the library under steep slate, rows of tall windows, buttresses; the
    Sanctum's banded keep with its crown of turrets and the great spire; the observation tower and its bridge; slim
    towers everywhere; bridges on piers over the moat; a crown of thin spires round the great one; leaning masses of dark rock round the
    castle crusted with glowing malice, and tendrils of it climbing the terraces. **Castle Town**: its broken ring wall, streets of
    roofless houses (a gable end, a chimney), the plaza and fountain, the church's shell. **The Great Plateau**: the
    Temple of Time (bays of tall open windows, buttresses, half the roof and the rafters of the rest, the west front's
    rose window under its central bell tower and a second spire, the round east end, the goddess, ivy); the rim wall; the old man's cabin.
  - `villages.js`: **Kakariko** (in its valley between walls of rock: houses raised on wooden floors with verandas and lanterns
    under the eaves, on stone terraces under thick thatch with crossed boards at the ridge, trees and gardens, the pond
    and its red-railed arched bridge, the stair up to Impa's, the goddess's statue under its roof, stone lanterns,
    the waterfall coming over the cliff behind, lanterns along the path, the gate, Impa's
    house on its platform, the Great Fairy's bud), **Hateno** (cream walls, red and blue tiled roofs, tall tapering chimney stacks against the gable
    ends, a few round houses along the street, the dye shop's cloths drying on lines, the pasture and its
    cows, trees, Link's house at the east end over the stream and its stone bridge, fields in rows; the Tech Lab with its telescope and blue flame; Fort Hateno),
    **Lurelin** (stilt huts, piers, boats, nets, palms), **Tarrey Town** (white two-storey houses with green trim and red hipped roofs round
    a square on its rock in Lake Akkala, the tall monument, golden trees, the walkway across the water).
  - `peoples.js`: **Zora's Domain** (the plaza with its ring of water and colonnade of luminous arches, the finned spire
    and the cup of glowing petals on its stalk, domed houses,
    lamps, the princess's statue - great, with her trident - in its fountain, the arched bridges), **Goron City** (warm orange rock terraces, rock domes with lit doorways, the lava channel and its stone
    bridges, red-cloth
    shops, fire bowls, mine rails, the hero's statue), **Gerudo Town** (the merloned wall and domed towers, packed
    flat-roofed houses with awnings, the palace's tiers, dome and minarets, palms at the gate, the plaza fountain, pennants across the streets, torch-lit guard posts at the
    gate, the mushroom-shaped rock stacks to the north with water falling from one).
  - `wayside.js`: the **shrines** (tall rounded monoliths on stepped platforms, a swirl of light on the face and lines
    running from it, the lit doorway, the pedestal) and the **stables** (the banded canvas tent with its green crown, the great horse's head high on a
    lattice neck hung with banners, bunting, the sign, a corral with
    horses, the cooking pot).
  - `landmarks.js`: the fifteen Sheikah towers; Rito Village on its pillar, the rock going on up past it to an anvil top; the **Great Deku Tree** (flared trunk on
    its roots, the face with brows and a beard of moss, limbs holding a dome of leaves) and the Master Sword on its
    dais; the three Lomei Labyrinths; the **Akkala Citadel** (broken wall and towers, the stepped-ruin keep, the
    roofless hall, the watchtower, Guardians) and the spiral in the sea; Hylia Bridge, the Tabantha Great Bridge,
    waterfalls; decayed Guardians in the fields.
- **The Divine Beasts** (`divine.js`), each moving, at twice the first size since in the game they tower over the
  land. Each is carved stone: a turned hull banded with seams, jointed limbs, plates, and glowing lines and spirals.
  Vah Ruta stands in the East Reservoir on pillar legs with knee rings and toed feet, fanning great round ears, a
  pavilion on its back, spraying from a six-jointed trunk. Vah Rudania crawls round Death Mountain laid to the slope
  (pitched and rolled to the ground under it): a broad flat body with a domed shell, a wide head with big round eyes,
  splayed legs with spread fingers, a swaying tail. Vah Medoh circles high over Rito Village with a deck and tower
  on its back and wings of long feather panels. Vah Naboris walks the desert on very tall jointed legs, two humps and
  a long neck. Each moving part is merged by material, so each Beast is a few dozen draw calls.
- **Ganon and Death Mountain** (`beasts.js`): Calamity Ganon is rings of crimson malice turning round the Sanctum with an eye in them; Death Mountain has a lava
  lake, lava running downhill from the rim, and smoke.
- **Guardians** (`guardian.js`): one model for the walking and the fallen. A dome of a head with glowing lines over
  it (rings round, lines down) and the eye standing out of the front in a rimmed housing; a squat drum of a body with
  a pointed belly; six spider legs, thigh up to the knee and a long shin down to a pointed foot. The fallen ones are
  sunk to the drum, the head tipped or lying beside it, legs folded or gone, moss over the dome, the eye dark.
- **Life** (`life.js`): Guardian Stalkers walking loops on dry ground with a tripod gait, the head turning and the
  eye's red line sweeping the ground to a red point; wild horses grazing (kept out of the lakes, rivers and moats),
  hawks, and someone in green paragliding down from a tower now and then.
- **The canyons** are cut sheer (`gorge()` in the generator: a flat floor, walls rising over a cell or so, the floor
  stepping down along the way and never below the sea): Tabantha's under its bridge, Tanagar between the Frontier
  and Hyrule Ridge, the western canyon, the Gerudo Canyon's slot down to the desert, the gorge south of Death
  Mountain. Every cliff is painted in strata, red and buff in the canyon country, and the canyon floors are gravel.
- **The biomes' small things** (`details.js`, instanced): skeletons, broken columns and rolling tumbleweeds in the
  desert; hoodoos and natural arches in the canyons; drifts on the snowfields, their lakes frozen, snow falling when
  you are up there; steam vents and lava cracks on the ash; giant red flowers in the jungle; lily pads on the marsh;
  glowing mushrooms and Korok lanterns in the Lost Woods; toadstools in the woods; tufts of tall grass; old snow in
  the tundra; fallen leaves in Akkala.
- **The biomes** (`BIOMES` in the generator, read by `biomes.js`): thirteen, as outlines off the map, baked into a
  48 m raster in the plan and read with soft edges: grassland, highland evergreens (the Frontier, Hyrule Ridge),
  temperate woods, the Lost Woods round the Korok Forest, Faron's jungle, the Lanayru Wetlands' marsh (grassy islets
  in the water), the Gerudo Desert's dunes, the red-rock Gerudo Canyon and southern mesa, the Highlands' arid apron,
  Tabantha's tundra (pale grass, firs thinning out), the snowfields of Hebra, the Gerudo Highlands and Mount
  Lanayru, Akkala's autumn and Eldin's ash. They set the ground's colour and the snow line (`paint.js`), what grows
  (`flora.js`), and where the engine's own round trees go (none in the desert, canyon, ash, snow or tundra).
- **Flora, rocks and clouds** (`flora.js`, instanced, by biome: firs, broadleaves, the Lost Woods' dark trees and
  their drifting fog, jungle palms and ferns, marsh reeds, cacti and scrub, dead trees on the ash, autumn woods,
  flower patches in the grass, rocks coloured by where they lie): firs on Hebra, Tabantha and any high slope (snow on the
  highest), Akkala's woods in autumn, palms along the south coast and round Lurelin and Gerudo, boulders in the
  fields and outcrops on the slopes (pale above the snow line), and soft clouds drifting east, dimmed at night. Only
  the autumn crowns cast shadows: thousands of firs and rocks are not worth theirs.
- **The country, alive** (`alive.js`, instanced): Bokoblin camps out in the wilds (hide tents, a skull rock, a
  campfire with smoke and a glow that grows at night, Bokoblins milling round it), travellers walking and riding the
  roads, deer and boar grazing, smoke from the villages' chimneys, steam off the hot springs and at the foot of the
  waterfalls, stable lanterns and fireflies after dark, and the white lines of the wind over the fields.
- **More of the map**: two dozen lakes (Hyrule Ridge's on its table of land, Skull Lake, Lake Akkala, the Lanayru Great
  Spring, the Hebra and Tabantha lakes, the field's ponds, two teal hot springs on Death Mountain). A lake given no
  level takes the lowest point of its shore, so it sits where the ground puts it; Rito Village's lake does this, on
  its own highland. The two rivers that frame Hyrule Field, the river round the Great Plateau, the Squabble River
  between the Dueling Peaks; the field's own road network; the Tabantha canyon and its great bridge; waterfalls
  wherever a river drops steeply; the western lava field; the islets off Akkala.
- **More places** (`wonders.js`): Kara Kara Bazaar at the desert's oasis, the Seven Heroines, the Coliseum's ruins,
  Lon Lon Ranch in ruins, the goddess's three springs (Courage, Wisdom, Power), three Great Fairies' fountains (Tera,
  Mija, Kaysa), the Akkala Ancient Tech Lab. The Sheikah towers are solid tapering shafts of stacked courses with
  slits and lines of light, leaning buttresses and the round platform on a flared capital. 27 saved views.
- **The dragons** (`dragons.js`, as events): Dinraal (fire) over Akkala, Eldin and Tabantha, Naydra (ice) round
  Mount Lanayru, Farosh (lightning) from Faron to the Gerudo Highlands: seventy instanced segments swimming in
  waves, crest and mane, four clawed legs, the head with branching horns, glowing eyes and whiskers, shedding
  embers, snow or sparks and bolts. The camera flies behind the head.
- **Events** (`events.js`, on `src/core/happenings.js`; `dinraal`, `naydra`, `farosh` as above): `bloodmoon` (a red moon, a crimson sky, embers of malice
  rising), `beasts` (the four Divine Beasts turn blue and fire on the castle), `tower` (a tower activates: blue, a
  column of light, a ring over the land), `glider`, `guardian` (walk alongside a Guardian Stalker), `storm` (rain and
  lightning on the high ground), `korok`.

Regenerate with `python3 tools/make-hyrule.py`. It writes the land, the roads, the villages' houses and the woods for
the engine (`hyrule-osm.json`), and the places, towers, shrines, stables, camps, lakes, moats, rivers and regions for the page
(`hyrule-plan.json`). Views and cards are in `hyrule.json`; `#view=<name>` opens one.

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
  the foot of the Hill - a square tower of yellow stone under a red hipped roof, round windows, a wing beside it,
  standing on the bank with its river wall on a footing in the water and its wheel turning in the stream, a
  sluice gate beside the wheel and a weir upstream (it is Sarehole Mill, where Tolkien lived as a boy); the bridge with the sign at the
  end pointing WEST; **the Old Grange** with its thatched ricks; **the Party Field** and the Party Tree.
- **Bywater** round its Pool, a mile south-east of the bridge by the Bywater Road and "the avenue of trees going
  from Hobbiton to Bywater"; **the Green Dragon** at the Hobbiton end of it; **the Great East Road** to the south.
- **The country**: every field painted into `data/cities/shire-fields.png` (four metres a pixel; its colour, and
  the direction of its rows in alpha) and drawn by the ground shader with its own furrows or mown swathes; the
  hedges traced by the generator along the same lines the fields were cut on, with trees standing in them;
  orchards in blossom, copses, poplars by the farms, sheep and cows in the pastures, sandy lanes with a grass
  crown between the ruts. Past the edge of the box the country goes on, the shader making up its own fields.
- **A working country**: half the land under the plough or the scythe, and market gardens in strips. Twenty-five
  farms, three of them in sight of Hobbiton, each a farmhouse and a barn round a fenced yard with a well, a
  granary on staddle stones, ricks, a cart, a pigsty, a hen house and hens, and a kitchen garden behind. The
  generator decides the work in each field and places it inside the field's own outline (`plan.work`): stooks
  on the wheat being harvested and hobbits reaping, plough teams working up and down a furrow at a time, hay
  carts with hobbits pitching, scarecrows, hobbits hoeing (`src/shire/fields.js`). They all go home at dusk.
- **What moves**: hobbits walking the lanes, smoke from every chimney, the mill wheel, round windows and the
  gate lamps lit after dark, birds, and Gandalf's cart - pony, pointed grey hat, crates of fireworks - going up
  the Hill lane to Bag End and back.
- **From the films**, where they add to Tolkien rather than contradict him: the big oak over Bag End; the Party
  Tree as a great flat-topped pine with a pond and willows beside it; Sam's yellow door at No. 3 Bagshot Row;
  a ring of dressed stone round every door and little porches over some; each hole dressed for whoever lives
  there (washing on a line, a barrow of produce, beehives, cheeses, a giant pumpkin, a woodpile) with a
  vegetable garden, a letterbox and a lamp; the double-arched stone bridge at the mill; the Green Dragon's sign,
  lanterns, ivy and outdoor tables; haystacks in the hay fields.
- **The Party** (the button, or `#party`): Bilbo's eleventy-first birthday in the Party Field - a three-peaked
  marquee with long tables, pavilions, the book's new gate, bunting and strings of lanterns from the Party Tree,
  a dance floor and a band stand, a crowd of guests; after dark, Gandalf's fireworks, and every so often the
  dragon, flying in low over the Water to burst above the tree.

The views are worked out from the plan when the page loads (`src/shire/main.js`), so regenerating never strands
a camera inside the Hill. Regenerate with `python3 tools/make-shire.py`: it writes the ground
(`shire-osm.json`), the plan (`shire-plan.json`: the Water, holes, houses, lanes, hedges, orchards, copses and
sites) and the field map.

### `/arrakeen`: Arrakeen

Fan work. Dune belongs to the Herbert estate; every shape is generated by `tools/make-arrakeen.py` or
modelled in `src/arrakeen/` in this project's own geometry.

A city built for a world where the only water is what you can take out of the air. The look follows what the
films' production designer said of it: brutalist, because a colonial power builds to show its force - thick
stone masses, walls leaning back from the wind, ziggurat, Egyptian and Mayan massing, slits and light wells for
windows - and the palette of Wadi Rum's sandstone and Liwa's sand.

- **The Shield Wall** is the reason anything lives here, so it is built as a wall: mesas and fins of red-ochre
  sandstone, benched where a hard bed stands over a soft one, varnished dark down the faces, cut by gullies,
  with one gap in it for the road out to the deep desert. Buttes and fins stand out on the basin floor like the
  stacks of Wadi Rum.
- **The ground** (`src/arrakeen/ground.js`): sand rippled across the wind, pale on the windward faces and
  darker on the slip faces; stony swept ground on the basin; the city's paving, the landing field fused to dark
  glass with a scorched ring under each pad, and the plantations the qanats feed, in rows.
- **The town** (`src/arrakeen/city.js`, `stone.js`): nearly eighteen hundred battered stone blocks packed
  shoulder to shoulder, with courtyards, the thirteen streets out from the middle and the two ring ways left
  clear; a windtrap on most roofs, all turned into the one wind; dew collectors on the parapets; the city wall
  and its towers, battered hardest of all, with a lintel over each gate; the cisterns in walls of their own;
  the water market under canopies. One stone material draws the pours, the weathering and the slits - and at
  night some of the slits are lit, yellow, white and blue, as the book has the city through the haze.
- **The Residency**: stone masses round a sealed court, the north range stepped up like a ziggurat, a blind
  front with one gate between two pylons, a landing platform for the thopters, and in the court the garden -
  water and green on a world that would drink a man dry. **The great windtrap**: a stone tower ribbed with
  metal fins, crowned with a collar of vanes and a scoop into the wind.
- **The machines** (`src/arrakeen/machines.js`): ornithopters that are dragonflies - a segmented body, a glazed
  nose, two pairs of long wings a side beating in a translucent blur; carryalls, silver-grey wedges with jet pods
  and suspensor bags; harvesters, boxy dust-caked factories on four tracks.
- **The deep desert** (`src/arrakeen/desert.js`): dunes in ranks past the rock, harvesters working a spice blow
  with a carryall holding station over each, spotters quartering the sand, and a ridge of sand running.
- **Events** (`src/arrakeen/events.js`, on the shared `src/core/happenings.js`), every minute or two on their
  own or from the **Events** button: **wormsign** - the carryall comes in, drops its grapples and lifts the
  harvester clear, and where it stood the sand opens and the worm comes up, a ring of segments and a crown of
  teeth, the one time it is drawn; a **Coriolis storm**, a wall of dust across the basin, the light going brown,
  static lightning in it; a **spice blow**, a fountain of sand and melange and a rust-red stain; a **thopter
  patrol** off the Residency's platform to the gap in the wall and back; a **Guild lighter** coming down on the
  field in a ring of blown sand. `#event=wormsign&eventlook` fires one on arrival.

Regenerate with `python3 tools/make-arrakeen.py` (it writes `arrakeen-osm.json` and `arrakeen-city.json`), then
`./sitectl build`.

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

- **The ice** (`src/europa/ice.js`): the plains drawn by a shader, white with a cold blue cast and scored by
  families of fine cracks at their own angles and spacings; the lineae with a dark crack down the middle and the
  reddish-brown stain either side; the chaos as rafts of the old surface - irregular slabs, tilted and frozen
  back in, their tops still cracked like the plains they came from, their sides blue fracture - in a darker,
  browner matrix of rubble; fresh frost round the bore; the aprons with smooth edges.
- **Plumes**: in a vacuum nothing billows. The bore and the vent stacks throw grains on ballistic arcs under a
  gravity an eighth of Earth's - the bore's rise a few hundred metres and take most of a minute to come down -
  and they fall back as frost.
- **The light**: a small hard white sun with only a tight glare (the soft halo is air, and there is none), as
  bright five degrees up as at noon; no sky light, but the ice sends two thirds of the sun back up, so walls in
  shadow are lit from below. Jupiter and the moons are lit by the sun and have phases - Jupiter is full at local
  midnight and new at noon - and the light Jupiter throws on the ice follows its phase.

- **The working station** (`src/europa/details.js`): the lesser buildings are pressurised modules on legs -
  domed ends, bands, an airlock, a strip of lit windows, a whip antenna, radiators on the labs - with a tank
  farm on legs and an arched garage; an insulated steam line on trestles from the bore; three dishes following
  Earth (never more than twelve degrees from the sun, from here) and stowing at night; the derrick's travelling
  block riding its cable; seismometers out on the ice that blink when they report; survey stakes round the
  chaos; beacons chasing round the pads; and the crew in suits, loping between the buildings in long low bounds.
- **Events** (`src/europa/events.js`), every minute or two on their own, or from the **Events** button, each
  with a line saying what it is and a button to go and look: a **lander** coming down on the field and going
  again, its exhaust throwing the ice out in flat sheets; an **icequake**, the tide cracking the shell - the
  view shakes and a new crack opens near the station and stays; the **bore surging**; a **linea venting**, a row
  of jets a kilometre high; a **meteorite**, with its flash, a cone of ejecta a minute in the falling and a
  crater that stays; a **radiation alert**, the site lights red and the crew going in. `#event=lander` in the
  address fires one on arrival (`&eventlook` goes to it). All of them throw grains on ballistic arcs
  (`src/europa/grains.js`).

Regenerate with `python3 tools/make-europa.py` (it writes `europa-osm.json` and `europa-ice.json`), then
`./sitectl build`.

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
- **The defence grid:** pulse cannon turrets (a dome, a base, twin barrels) in rings round the sphere and either
  side of the carousel's trench bands, particle beam blisters on the sphere's waist, and a ring round the
  reactor. Those on the sphere and the drum turn with them.
- **The observation domes:** Dome 1 on the sphere's forward face is C&C, glass over its lit floor and consoles;
  Dome 2, the backup, is across the axis from it.
- **The Core Shuttle:** two cars running the length of the Garden's axis beside the sun, one each way, stopping
  thirteen times (seen in the cutaway or from inside).
- **The jump gate** a few kilometres off the bow: four trusses in a square with the corners open. Every forty
  seconds the lights chase down its prongs, it flashes, and a vortex turns open in front of it (spiral discs,
  orange at the rim and blue-white at the throat), and a transport comes through.
- **Visitors** (`visitors.js`): an Earthforce **Omega-class destroyer** holding station off the carousel, with
  its hammerhead, its own turning drum amidships and its engines and blue radiators aft; and further off a
  Minbari **Sharlin war cruiser**, a glossy blue-green blade of a hull with its great crest. Both have cards.
- **Raiders** (the button, or `#raid`): the gate opens out of turn and eight raiders come through and make runs
  down the carousel, shooting at it. It is condition red: eight Starfuries come off the sphere onto their tails,
  the defence grid opens up (orange pulse fire; the raiders' is green), and the raiders break up one by one
  until the last is gone and the fighters go home. Notices at the foot of the screen, and the count in the HUD.
- **Epsilon III** below, dusty and brown, with a moon, and the system's star behind the station.
- **Click any part** for its card: the sphere, the bay, the Cobra bays, the drum, the bearings, the Garden, the
  reactor, the arrays, the stern, the gate. (Cards are new on the ship page; the three starships do not hang
  any, so nothing changes for them.)

Views: three-quarter, side on, head on at the docking bay, the approach lane, the Cobra bays, the observation
domes, the drum, the raid, the Garden, the reactor, the solar arrays, the jump gate (from in front, to see the
vortex), the destroyer, the Minbari cruiser, Epsilon III below, far off. The star is Epsilon Eridani's, an orange
dwarf, so the light on the hull is warm. The page also takes a closer
minimum distance than the ships (`minD`) and moves its near plane out with the camera distance, so the
panelling does not fight itself in the depth buffer from twenty kilometres off.

### `/homeworld`: Homeworld, the Kharak system

Fan work. Homeworld belongs to its makers (Relic Entertainment, and now Gearbox); nothing from the game, its
models, its art or its sound is used, and every shape is this project's own geometry (`src/homeworld/`), after
the general silhouettes. It runs on the starship page, the way Babylon 5 does, and takes that page's lessons: a
fighter at this scale is a few pixels, so every small craft carries an engine light drawn at a fixed size on
screen and a trail of light behind it (which is how the game drew them too); fire is a streak close to and a
point far off; anything that moves is left out of the model's fingerprint, so the golden holds whichever
mission is showing.

Two missions of the campaign, and a switch between them (**Mission 1** and **Mission 3**, or `#mission=1|3`):

- **The Mothership** stands upright. Her art director made her a tall tower against the flat band of the
  galaxy so that the player could always see which way was up, and she is curved (the players call her the
  Banana): here a hull 3 km tall swept section by section up a spine that bows forward amidships, sharp at the
  prow with a keel-blade down it, blunt aft with the engines stacked up the aft face (the great ones low down),
  the one great hangar through her middle with its mouth and drawn-back doors on both flanks, a small dock low
  on the starboard side, the core and its masts on top, and big blocks of colour on her flanks in the manner
  of the paperback-cover painters the game's art took after (Chris Foss, Peter Elson).
  The fourth pass builds in what the Kushan's own technical briefing says of her. She was laid up in layers
  from the centre outward until the last layer of ceramic armour went on: so the hull here is an inner hull
  showing the honeycomb of her storage (under 65 per cent of her armour, the briefing says) wherever a bay of
  armour is still off, and over it the armour, plate by plate, stood proud with gaps between. The hangar holds
  the cryo trays and the hyperspace core and is open on both flanks: the capital-ship door drawn up, docking
  sleeves reaching out of the mouth. A row of parallel production bays low on the starboard flank. The
  hyperspace drive heavily shielded in the lower aft of her, banded armour with the core's violet glow through
  its slots. Fusion drives venting through shaped magnetic bottles (rings round every plume), manoeuvring jets
  in clusters fore and aft that fire in short bursts, auxiliary fusion pylons out from her flanks. The bow of
  her is deeper than before.
- **The Scaffold** is, in the game, shorter than she is - she stood in its clutches, and in the end parts of it
  went into her: four laced trusses, square frames and bracing, the docking arms open on the face towards her,
  the materials plants clamped to its sides with their fusion torches burning inward, and at its head the
  **Phased Disassembler Array**, a ring of emitters round a chunk of planetoid, cutting it apart with sparks
  flying. Its corner lamps blink.
- **The cryo trays**, "long mechanical cargo containers": a frame of rails and ribs half a kilometre long with a
  thousand Rack Modules racked on its four faces (a hundred sleepers to a module, a hundred thousand to a tray,
  six trays), power units at both ends, a docking clamp, lamps down its back. In the first mission all six wait
  in stable orbit beside the Scaffold, not yet loaded - nobody would risk them before the hyperspace test - and
  **Heavy Lifters** come up from Kharak one after another to dock a module at each. In the third they are the
  same six, out where the Scaffold was.
- **The sky** is the galaxy edge-on, a level band right round the horizon, thicker and brighter toward the core,
  with a dust lane down it: the Kharak system is out on the rim, where that band is the one thing that says
  which way is level. Gold in the first mission, red in the third.
- **Mission 1, the Kharak System.** The Mothership is just out of the **Scaffold**, the orbital cradle of
  girders she was built in (Kharak's only moon), standing upright behind her with its docking arms open, the
  six cryo trays beside it and the Heavy Lifters coming up to them.
  Kharak below: sand seas in bands across the equator, the rock between, salt flats, cooler grey-green lands
  toward the poles, and the poles. The **Research Ship** is being built: its hub, then a module every eight
  seconds, counted in the HUD.
  The trials, on a loop: target drones come out of hyperspace through their windows of light; the seven
  **Scouts** leave their patrol in formation, go in, circle and destroy them one by one, and a **Salvage
  Corvette** takes the last in tow back to the hangar. A **Resource Collector** goes out to the asteroid field,
  chews at a rock with its beam until the rock is smaller, and brings the load home; the **Research Ship**
  stands off with its modules round its hub.
- **Mission 3, Return to Kharak.** The Mothership comes out of hyperspace, a window of light sweeping down her
  length from the prow and the ship appearing behind it; the Scaffold is a wreck of girders tumbling and
  burning, and **Kharak is burning** - fronts of fire crawling across a charred world, embers behind them, smoke
  over the day side, the night side glowing, a red halo in the air. Six **cryo trays** hold the sleepers; the
  first fails as she arrives and breaks up. Taiidan corvettes and interceptors come through their own window in
  waves - four in the first, as in the game - and circle the trays firing; the first corvette of each wave is
  taken, not destroyed, and a Salvage Corvette tows it into the hangar; the Mothership's interceptors go after them; and pairs of Salvage Corvettes
  latch on to the trays one by one and tow them into the hangar. When the last is in, it begins again.
- **Sensors:** the game's tactical map over the scene - rings and spokes on the Mothership's plane, every ship
  a dot on a stalk down to it (`#sensors`).
- The HUD keeps the trials' score, or the trays recovered and the
  hostiles left. Click any ship for its card.

- **Close to** (the third pass): the hull is plated in long courses of plates, each a shade off the next, with
  dark seams, insets and louvres, lit ports along some courses, the orange livery, and grime streaked down it;
  over that, in bands, a few thousand instanced housings, conduits, radiator fins and blisters. The hangar
  mouths have the inside of the hangar painted into them - the deck going back in lamplit perspective - and
  guide lamps that chase in toward the opening; the engines are bells with lit throats and plumes that breathe;
  the running lights, mast lamps and the Scaffold's corner lamps blink. Kharak has the lights of its cities on
  the night side along the cooler belts, and a layer of dust storms drawn out along the latitudes that turns to
  smoke when it burns; a few bright stars carry crosses of light. Engine lights are soft and sized by the ship;
  the trails are ribbons, tapering and fading, never thinner than a couple of pixels; an explosion is a
  fireball, a ring of shock, and sparks. Every craft is baked into a mesh per material, so the whole scene is
  about 110 to 180 draw calls and 110,000 to 145,000 triangles (it was up to 721 calls before).

Views: three-quarter, the Mothership side on, the prow, the engines, the hangar bay, the Scaffold, the trials,
the asteroid field, the cryo trays, the wreck of the Scaffold, Kharak below, far off.

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
- **The desert** (`src/fleshpit/desert.js`): the plain varied with soft patches of pale caliche, red sand and darker
  ground under the brush; three dust devils wandering it and tumbleweeds rolling downwind. Its plants are the Permian
  Basin's (`treeSpecies`: honey mesquite, creosote bush, soaptree yucca). The amphitheatre is seven stepped rows round
  a stage, 20-60 m across, facing the hole (it was drawn with radii of 330 m, a grey slab across the plain). The views
  that had sunk below the plain when it was raised (the park road, the rim from the visitor center) are back above it,
  and Down the shaft looks down the axis instead of into the funnel's wall.
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
- **The ground's surface** (the ground's shader, from per-vertex land-cover weights): close to, each kind of
  ground has a texture of its own, faded out before it is finer than a pixel - the lodgepole's crowns and gaps,
  grass mottled green and straw, sage in grey-green bushes, sinter cracked into plates with the orange and brown
  bacterial mats run out across it in channels and grey where the runoff is wet, rock in strata, the burn's grey
  snags over young green, standing water in the wetlands, drifted snow. The forest's edges are torn by noise
  rather than blurred by the 150 m grid, which used to paint every meadow edge as a soft ink blot.
- **The clouds:** a hundred-odd fair-weather cumulus a couple of kilometres over the plateau, heaped with flat
  bases, whiter on top, warm when the sun is low, drifting on the wind and wrapping round the map. Their shadows
  go over the ground with them (one map-sized texture slid under the ground's shader), thrown off to the side
  away from the sun.
- **The forest** is grown in 800 m tiles round the camera as it moves, thinned with distance and dropped when
  the camera has gone: eighty per cent of the park is lodgepole, which is a hundred million trees. Four kinds
  now: lodgepole; spruce-fir, a dark spire in tiers, high up and in the wet draws; Douglas-fir in the lower,
  drier north; and aspen in clones at the edges of the northern meadows, with the burn's snags. Within 900 m
  each is the whole tree; beyond, a three-sided spike of its own colour, a twentieth of the triangles. From high
  up the ground's colour carries it.
- **Drawing it at a tolerable cost:** the park used to be 1.0 to 2.2 million triangles a frame, which is more
  than a laptop's graphics should be asked for. Now it is 0.3 to 0.85 million: the ground in levels of detail
  (the engine's `terrainLOD`, below: full within 9 km, half to 22 km, a quarter beyond); the Grand Canyon's fine
  patch in three levels (full within 3 km); the far trees as spikes; the small streams drawn only within 10 km,
  in tiles, the rivers always; the small springs with fewer sides.
- **Fixed:** the thermal basins were a flat near-white sheet (the sinter is darker and textured now); the yellow
  and pink of the canyon walls bled out onto the plateau either side (it is on the walls now); the lakes were a
  saturated flat blue (`lakeColour`, deeper and duller).
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
  (C) swaps it - and a camera on the cut-away side is outside the block, so crossing the plane changes nothing.
- **The City** (the button, or the last two views): the whole thing as Nihei sized it, a shell about as wide as
  Jupiter's orbit (1.6 billion km) round the Sun, in a scene of its own with a unit of a million km
  (`src/blame/sphere.js`). In section it is layers from where the Earth was out to the skin. The diameter is
  Nihei's; how deep it goes the manga never says, and the page says so.
- **Fly** (F): drag to look without moving, W A S D along where you are looking, Q/E down and up, the wheel for
  speed (0.5 m/s to 300 km/s), Shift for five times that. Otherwise the camera orbits a point.
- **Pull back** (P): from Killy's shoulder to the solar system in nine moves, a power of ten or so at a time,
  with a line at each. `#tour` in the address starts it.
- **Views** for the platform, the void, the column, the great shaft, the Plain, the Works, the Arcade, the
  block and the City. The HUD always says which layer you are in, how wide the frame is and how big Killy
  is. `#view=N` opens view N; the page keeps `#at=mode,x,y,z,distance,yaw,pitch` and `#cut=axis,0-1,side`
  current, so a link goes to the same place. `?seed=` builds another City.

### `/infinitycastle`: the Infinity Castle

Fan work after Koyoharu Gotouge's *Demon Slayer: Kimetsu no Yaiba* (Shueisha, 2016-2020) and ufotable's anime and
films. Nothing of theirs is used: every shape comes out of a seeded generator (`src/infinitycastle/`) and the
numbers in `data/cities/infinitycastle.json`, and every surface is painted on a canvas when the page opens. The
castle has no published plan and is never the same twice (ufotable made around thirty versions of it for one
television shot), so this is one castle of many; `?seed=` makes another. Its shape follows what the anime and
the films show of it, checked against stills: the Swordsmith Village Upper Moon meeting, the Hashira Training
fall, and the 2025 film's halls, Doma's lake and end credits. It runs on its own renderer and camera, like the
City.

- **A hall, not a pit.** From outside, in the film's end credits, the castle is one block, so here it is a box:
  760 m each way and 520 m high, the far side lost in warm haze. **The floor** is tatami to the horizon, lit in
  pools. **The ceiling** is boards with rooms hanging from it like stalactites, columns of one to five boxes
  upside down, each with small slatted windows a bay apart, as in the shot of Akaza on the tatami. **The walls**
  are buildings stacked from floor to ceiling, two rows deep, some jutting out, a few on their sides or upside
  down. Their room-fronts are drawn by the facade shader (`mats.js`), in the block's own coordinates:
  - tiers 3.6 m high, with posts a ken (1.82 m) apart;
  - runs of lit and dark shoji, doors open onto the dark, and gold fusuma;
  - balustrades with rows of lanterns along them, and tiled eaves.
- **In the air** (`castle.js`, `kit.js`):
  - 700 clusters of real pieces, each with its own up: tatami rooms with fusuma, shoji, engawa and hipped roofs,
    and sliding doors along their fronts (about 7,700 panels, each on its own track); galleries with lanterns hung
    down the middle; stacks of rooms; stairs to nowhere, narrow or wide;
  - **switchback towers**, wide flights zigzagging up between landings the width of both lanes, and **tangles**
    after the manga's Escher pages: a platform with stairs off three or four sides, going up, hung upside down under
    it, or on their sides;
  - the **wide stair**, as the castle's big stairs are drawn: 2.4 m between heavy boxed stringers, closed risers,
    the underside boarded in, spindle rails both sides and a lantern on the top post, so a long stair is a row of
    lanterns;
  - 320 blocks of the walls hung free;
  - bridges straight across from wall to wall, with a lantern on every length;
  - bridges that stop partway and turn into stairs;
  - long straight stairways up the walls, wide (they, the bridges and the spurs are laid out first, and the
    clusters keep off them);
  - houses standing on the floor;
  - shafts of dusty light slanting down from the ceiling.
- **The places** (`places.js`), each a view with a card:
  - **the stage**: a deck of polished boards on seventy-metre stilts against the north wall, with a stair
    straight up to it from the floor;
  - **Nakime**: on a ledge at the back of the stage in front of great studded doors, in black with a striped obi,
    her hair over her eyes and the biwa upright in her lap;
  - **Muzan's lab**: hung upside down from the middle of the ceiling, at the bottom of a cone of red ring-lights
    with red points scattered round it;
  - **the way in**: in the ceiling, the mansion floor with its doors open and the fire above;
  - **the great floor**: polished boards on the tatami under the way in, where the fall comes down;
  - **the cocoon**, in its hall on the south wall;
  - **the stair-well**, on the east wall;
  - **Doma's lake**: on the floor and lit teal, with lotus, boardwalks and lamps on posts, and a palace on stilts
    of two five-roofed towers and a hall up a red stair;
  - **Akaza's hall**: dark polished boards behind a heavy rail on the west wall, with lamps on the beams, the
    compass of his art drawn in light, and pillars pouring water in front of it;
  - **the pillar hall**: high on the west wall and lit grey-green (manga only; the films have not got there).
  Each lit place has its own haze: teal, red or grey-green.
- **The biwa** (B, or the button; `biwa.js`): Nakime strikes it and the whole castle reconfigures. A front goes
  out from her through every wall at 140 m/s, dealing the doors again behind it, and everything the strum moves
  waits for the front to reach it, so the change ripples outward from her. What it moves:
  - **rooms**, near you and all over the hall (up to about 145 a strum): they slide, shuffle through up to five
    slides like a sliding puzzle, turn over, drop or rise, or swap places with a neighbour, swinging past each other;
  - **doors**: the rooms round you slide their doors open or shut, panel after panel, as the front reaches them;
    a great strum slams every one within 260 m;
  - **stairs**: flights, switchbacks and tangles swing 90° about one end, to meet somewhere new;
  - **districts**: every room within 50 m of a point turns 90° about it together, as the castle folds;
  - **the walls**: blocks slide in and out, and some are rammed 40–110 m into the hall like pillars, hold, and are
    usually pulled back; runs of up to fourteen neighbouring blocks ram out one after another, a line of pillars;
  - **the ceiling**: its columns of rooms drop, singly or in a cascade outward from a point, and often rise again;
  - **the floor**: the houses on it slide across the tatami and turn.

  Each strum has two echoes, about 2 and 5 seconds after it, each smaller than the last.

  Nothing leaves the hall, moves into a place, or lands on or passes through the camera. When something big
  slams home near you the camera shakes and there is a thud. **Shift+B**, or **Biwa ×3**, is a great strum: three
  strikes, twice as much of everything, and a wider fold. She plays on her own every 15–30 seconds, with a great
  strum every fourth time, and between strums something near you shifts every second or two: the castle is never
  quite still ("Nakime: playing" turns all of it off; so does `#still` in the address). `#strum` or `#strum=2` makes
  her play as the page opens.

  The sound is made on the page: four plucked strings with a buzzing bridge (the sawari), the slap of the
  plectrum and a hall's echo, and M mutes it. Nothing she moves is in the fingerprint, which is taken before she
  first plays.
- **Fall** (the button, or `#fall`): in through the doors in the ceiling the way the Demon Slayer Corps came,
  520 m down past everything to the great floor in half a minute, with a line at each thing you pass.
- **Getting about:** the site's controls; F flies (the wheel is speed). The HUD says where you are, how high
  you are and how far under the ceiling. The page keeps `#at=x,y,z,distance,yaw,pitch` current, and `#view=N`
  opens view N.

## Layout

```
iziz.html, chicago.html      page shells: containers + <script type="module" src="src/<city>/main.js">
css/                          iziz.css (shared shell), chicago.css (colours)
data/
  cities/<name>.json          a city's parameters (expressions allowed, see the file's note)
  lexicon.json                Izani words, inscriptions, place names, lore, canon
src/
  core/   diag.js rng.js env.js data.js      error reporting + staged loading, randomness/noise, shader environment, data expressions
          shell.js hash.js                  the page shell (renderer, resize, context loss, buttons, loop, boot) and the address (merged, never wiped)
          input.js cylinder.js happenings.js  the site's controls, the drum walker, and events that come round on their own
          dust.js                           anything thrown into the air: dust, smoke, embers (Arrakeen's, Minas Tirith's and Isengard's)
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
  mordor/   main.js landmarks.js forges.js   Mordor: the Eye, the works
  middleearth/ hosts.js                      the war, shared by Mordor and Minas Tirith: the hosts, the Nazgul, the lightning
  dredd2012/ main.js warmode.js              Mega-City One (2012): the blast shields and war mode
  fleshpit/ main.js landmarks.js surface.js organism.js springs.js lungs.js tunnels.js section.js anatomy.js promenade.js visitors.js fauna.js incident.js signs.js camera.js   the park: the surface and its lots, the shaft, the springs, the lungs, the tunnels, the section, the heart and vessels, the people, its animals, the night, its lettering, and its own camera
  yellowstone/ main.js landmarks.js nature.js   Yellowstone: the geysers, pools, falls, lodges, herds and caldera; the land cover, forest, rivers and steam
  backrooms/ main.js level.js textures.js sound.js   the Backrooms: its own renderer, the generator and baked light, the canvases, the hum
  blame/    main.js city.js detail.js builders.js figures.js mats.js sphere.js   the City: its own renderer, camera, section and tour; the 25 km block; the Megastructure's structure and the layers' furniture; the Builders and the lifts; Killy and Cibo; the patterns and the poché; the whole of it round the Sun
  infinitycastle/ main.js mats.js kit.js castle.js places.js biwa.js   the Infinity Castle: its own renderer, camera and fall; the canvases and the facade shader; the kit and its clusters; the shaft, its walls and the void; the places; the biwa
  moria/    main.js plan.js carve.js landmarks.js halls.js city.js deep.js realm.js walk.js events.js   Moria: the plan; carving rooms, passages and floors; the gates and the tower; the halls; the city; the dark and See inside; Moria or Khazad-dum; walking, flying, the map and the tours; what happens
  isengard/ main.js plan.js landmarks.js works.js isen.js fangorn.js treegarth.js mode.js events.js   Isengard: the plan of the Ring; the Ring and Orthanc; Saruman's works; the Isen; Fangorn; the Treegarth; the switch; what happens
  minastirith/ main.js landmarks.js life.js war.js events.js decals.js shadow.js   Minas Tirith: the Tower, the Hall, the Court, the Gate, the rock, the banners; war and peace; what happens in the siege; what it has left; the Ephel Duath and the Darkness
  kowloon/  main.js section.js kaitak.js life.js   the Walled City: the section, the approach, the washing
  starship/ page.js parts.js                 the page the ships and Babylon 5 share: renderer, sky, turntable, cards; the hull pieces
  babylon5/ main.js station.js visitors.js   Babylon 5: the sphere, the Cobra bays, the drum and the Garden, the arrays, the defence grid, the traffic, the gate; the destroyer, the Minbari, the raid
  homeworld/ main.js ships.js kharak.js fleet.js   Homeworld: the Mothership, the Scaffold and the craft; Kharak and the sky; the two missions, the trails, the hyperspace windows, Sensors
  hab/      main.js world.js               Kyrene: its own renderer, and a world in cylinder coordinates
  beachcity/ main.js landmarks.js details.js life.js events.js   Beach City: the temple, the beach house, the lighthouse, the park's cliff, the shops, Funland, the car wash, the old docks; the surf, the boardwalk and the gulls
  oldesthouse/ main.js mats.js kit.js executive.js research.js maintenance.js containment.js further.js   the Oldest House: the kit and its light bake, the surfaces, the sectors
  hyrule/   main.js paint.js flora.js alive.js kit.js biomes.js details.js landmarks.js castle.js villages.js peoples.js wayside.js wonders.js guardian.js divine.js dragons.js beasts.js life.js events.js   Hyrule: the ground's colours and the water; the castle, towers, shrines, stables, plateau, villages; the Divine Beasts, Ganon and Death Mountain's fire; Guardians, horses, hawks, the glider; what happens
  shire/    main.js ground.js water.js country.js holes.js buildings.js fields.js life.js party.js   the Shire: fields and lanes, the Water, hedges and trees, the holes, the mill, farms and the rest, the work in the fields, what moves, Bilbo's party
  voth/     imports.js stages/*.js build.js   Voth: 51 recovered stages, assembled into build.js (voth.html runs it)
vendor/three/three.min.js     three.js r128 (pinned)
tools/  build-page.py build-tongue.py probe.py check-city.py
        fetch-osm.py fetch-terrain.py build-osm-city.py make-city17.py make-nightcity.py
        make-megacity.py make-mordor.py make-minastirith.py make-isengard.py make-moria.py make-dredd2012.py make-yellowstone.py
        make-beachcity.py
        make-hyrule.py
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

### Generated files

Written by a script in `tools/` and committed, so the site runs without a build; regenerate them, never edit
them (`.gitattributes` marks them). The generators share `tools/lib/geo.py`.

| File | Written by |
|---|---|
| `data/cities/<city>-osm.json` for chicago, nyc, portland, venice | `tools/build-osm-city.py <city>`, from the raw cache in `data/osm/raw/` (not committed, not served) |
| `data/cities/<city>-osm.json` for the invented places | `tools/make-<city>.py` |
| `data/cities/europa-ice.json` | `tools/make-europa.py` |
| `data/cities/arrakeen-city.json` | `tools/make-arrakeen.py` |
| `data/cities/rivendell-valley.json` | `tools/make-rivendell.py` |
| `data/cities/shire-plan.json`, `shire-fields.png` | `tools/make-shire.py` |
| `data/cities/beachcity-osm.json`, `beachcity-plan.json` | `tools/make-beachcity.py` |
| `data/cities/hyrule-osm.json`, `hyrule-plan.json` | `tools/make-hyrule.py` |
| `data/cities/yellowstone.json`, `yellowstone-land.json` | `tools/make-yellowstone.py` (the config too: edit the script) |
| `src/engine/build.js`, `src/iziz/build.js`, `src/voth/build.js` | `tools/build-page.py` (`./sitectl build`) from each `stages/` |
| `krator.html` | `tools/build-krator.py` |

Every other `data/cities/<city>.json` is hand-written, and no generator reads or writes it.

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
`waterColour`, `lakeColour` and `lakeSheen` (still dark water, see Moria and Yellowstone), `terrainLOD` (`[d1, d2]`: the ground in three levels of detail by distance, with skirts on the coarse ones - Yellowstone), `terrainTints` (a colour worked into the rock round a point), `snow` and `snowShed`, `seaLevelWater` (see New York), `lowRiseFar` (how far buildings under 30 m are drawn) and
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
without a login run `sudo loginctl enable-linger $USER` once.

## Network notes

- The router assigns this computer's address and may change it (`hostname -I` shows it; reserve it in the router).
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

**The interface, every scene.** "Pause sun" sits in the time bar, beside the clock it stops (the engine's pages and Iziz's).
The compass, on the pages that have the map (`src/core/navmap.js`), sits at the top of the same right-hand column,
above the time bar, and the map opens under the column wherever its bottom is; the Flesh Pit's depth gauge does the
same. `tools/probe.py` reports the interface's layout (`ui`: the box of every fixed or absolute element, every
button, the time bar and the compass), so an overlap can be checked without a screenshot.

**The sun** rises in the east (+x) and sets in the west (`sunAt` in `src/engine/stages/01-scene.js`). It had them
the other way round.

**Flight.** Only the real places fly the aeroplane; the fictional scenes have no Fly button and no fly mode (Blame!,
Infinity Castle, the Oldest House, Termites, Moria, Water 7). In flight the scroll wheel moves the chase camera in and
out from the aeroplane.

**Facades in the real cities.** Chicago, New York and Portland have their own architecture (`facadeStyles`: glass,
ribbon windows, terracotta and limestone, balconies, and their own brick), and their flat roofs are tar, gravel and
membrane rather than the wall's colour (`flatRoofColours`, an engine setting).

**The dress of the buildings** (`src/core/dress.js`, set per city in `C.dress`): what an extruded footprint lacks, put
back from the footprint: cornices and string courses on flat roofs (on Rome's pitched ones too), New York's water towers
and fire escapes, bay windows on the street face, dormers along a pitched roof's ridge. Instanced per 500 m tile and drawn
within `far` of the camera; kept out of the layout fingerprint. Edinburgh, Chicago, Portland, New York and Rome take it.
Craftsman porches (deck, brick pedestals, columns, rail, steps, a shed or gabled roof) and shopfront awnings with their
signboards are parts too; any part, and any `facadeStyles` entry, can take `where` (lat/lon boxes) to keep it to a
neighbourhood. Portland's Arbor Lodge and Kenton use it: painted lap siding (`clapboard`) and porches on the houses,
awnings along Denver Avenue, and Kenton's Paul Bunyan (`bunyan`, `src/portland/landmarks.js`) at Interstate and Denver.

**Tree species** (`C.treeSpecies`, an engine setting in `src/engine/stages/03b-details.js`): a city may plant its own
trees instead of the one generic shape. Each species is a shape (`fir`, `cedar`, `round`, `oval`, `oak`, `slender`,
`small`), a bark colour, foliage colours, a height range and a weight in each place trees go (`street`, `park`, `wood`);
the crown takes the instance colour and the trunk keeps its bark. Portland plants the region's: Douglas fir, western red
cedar, bigleaf maple, red alder and Oregon white oak in Forest Park and the parks; maples, purple-leaf plums, cherries and
dogwoods, sweetgum, London plane and oaks along the streets, after the city's street-tree inventory.
Rome plants stone pines (`umbrella`), Italian cypresses (`column`), planes, holm oaks and oleander, and keeps the view
from the Ponte degli Annibaldi open (`C.treeKeepOut`: lat/lon/radius circles no tree is planted in).

**The photograph** (`src/rome/photo.js`, `#photo`): the couple on the Ponte degli Annibaldi, modelled limb by limb
(limbs between joints, bodies of revolution, painted cloth: his print shirt, her denim with its rip; heads shaped from a sphere - jaw, cheekbones, sockets, nose, lips - with their faces painted on and eyeballs under lids; hair as a shell cut to its hairline), posed as
they stood; the brown handrail, the padlocks heaped at its foot, the grey setts, Rome's crook lamps. The view opens in the
photograph's 3:4 frame at a phone's lens (`C.photo`: `t`, `hour`, `camBack`, `eyeH`, `pitch`, `vfov`); it goes when the
camera leaves the spot.

**Water 7** (`water7.html`, `src/water7/`, `tools/make-water7.py`): fan work after One Piece. The City of Water as a
fountain of a city: seven tiers to 176 m, their walls the old city buried under the new (arched windows in rows), grand
stairs down each wall, tan and peach houses under red barrel vaults (`src/core/dress.js`: vaults, bell towers, washing
lines), the grand canals falling tier to tier and one built as a ramp the yagaras swim up, the Aqua Elevator lifting a
boat up the Lower Town's wall. The Great Fountain on top: basins on arcades two hundred metres across, a jet of three
hundred metres and its mist, arcs into the pool, runnels to the canals' heads. Round it all the sea wall
(`seawall.js`): a ring of dam with its sluices, spillways and tide gauges, lock gates over the docks (`api.LOCKS`), the
rail gate, bell towers (`api.BELLS`), the low old wall along Back Street, the stone bridge to Scrap Island, spray where
the swell breaks. The canals are brim-full between stone walls and copings (the terrain's bed is cut narrower than the
water, so the ten-metre grid's slopes stay under it), the grand canals falling over the quay wall into the moat.
Scrap Island (`franky`): wrecked hulls half buried, mounds of junk, iron plate, chain and anchors, a salvage crane,
rocks round the shore; Franky House in every colour with its gold sign and its mechanical arms, cola barrels, the
Family's flag; Tom's Workers' old office by the bridge; the slipway the Sunny was built on; the King Bulls and the
Family's houseboat afloat off the landing. The city at work (`work.js`): shipwrights on every lift of every dock's
scaffold, hammering; pairs carrying planks over the gangways; sawyers, a foreman; Dock One's crowd cheering at the quay;
barges round the moat, merchantmen at anchor outside the wall, fishing boats under sail, a trader in and out of Dock
Three; gulls; a market on the Market Terrace (each dock's crew drawn only near the camera: `C.water7.workFar`). Its people (`folk.js`, each clickable): Paulie at Dock One's
slip, Iceburg walking Fountain Square with his mouse, Franky and the Franky Family at their house, Kokoro, Chimney and
Gonbe at Shift Station; the yagara rental shop with its tank and its queue; masked revellers along the market; Up
Town's statues, benches, flower beds and balustrade. Back Street is sunk (`backstreet.js`): its ground under the sea so
the tide runs in its streets, boardwalks, boarded doors, a tide line, salt on the roofs; the drowned city on the seabed,
seen when Aqua Laguna draws the sea back. At night (`lights.js`) lanterns on the boats, the market, the cranes, Franky
House, the fountain's lights cycling, the lighthouse's beam. The canals ripple and the yagaras leave wakes. The tier
walls stand 15 m out from the steps (the terrain grid's slope stays behind them) with a walk along the top. Events
added: the Rocketman (out of its brick warehouse, the houseboat harpooned behind), pirates thrown out of Dock One, the
Puffing Tom arriving; Aqua Laguna brings its storm (grey, fog, rain) first. Sound (`sound.js`, off until the Sound
button): surf, the fountain, the yards' hammers, gulls, the whistle, the warning bells - all generated, no files. The sea (`ocean.js`) is an ocean: a moving swell, whitecaps, calm in the moat, a tide, and `api.SEA`
for anything that floats and for Aqua Laguna. Galley-La's seven docks each building a ship (frames, planking, masts,
scaffolding, slewing cranes); the Puffing Tom, a green-and-red 4-4-0 on paddle wheels, on rails that ride the sea out to
Shift Station's lighthouse. Events: Aqua Laguna as the story tells it (bells, the draw-back, three waves, the
Rocketman), a launch at Dock One, the Puffing Tom, a yagara race up the ramp canal, the Sunny's Coup de Burst, a Sea
King, the Going Merry's farewell in the snow.

**Shiganshina** (`shiganshina.html`, `src/shiganshina/`, `tools/make-shiganshina.py`): fan work after Attack on Titan.
Wall Maria's southern district in its U of wall (straight sides out from Wall Maria, a rounded end with the outer
gate; one continuous wall, coursed and buttressed, towers on its corners and the gates closed, so the only way through is
the Colossal Titan's), the half-timbered town on its grid of lanes (the engine's `timber` facade, chimneys from
`src/edinburgh/oldtown.js`), the canal's bridges, the market's stalls and well, the gates and the canal, the town, the farms and the Forest of
Giant Trees inside, the Titans on the plains outside, the Garrison on the walls; the Colossal Titan, the Survey Corps'
return, vertical manoeuvring.

