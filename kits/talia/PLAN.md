# The Talia kit: the design plan

Talia was founded by the **Talei**, a sister people of the Izani, and was one of the first cities to submit to Iziz; its language
and culture long ago assimilated to Iziz's (the Veii to Iziz's Rome). It keeps its own architecture and its own
intellectual life: the University of Talia may be second only to the Aggonmekki in Yuni for science, and ahead of it
in the arts and high culture. It is the last major city before the passes east to the desert and the abyss, and has
grown rich on the trade. It was founded after the Cataclysm and has no Ancient buildings. The architecture is Greek
and Byzantine, with flowery baroque, neoclassical and Indian forms on civic and wealthy buildings, predominantly
white with Iziz orange accents and highlights. Iziz Vernacular buildings will stand among Talia's own. (Owner's
brief, 2026-10-17; LORE §6.2 lists Talia as "gateway to the east".)

Read `settlements/iziz/VASSAL-KITS.md` first: the shared engine, the rules that keep this kit from clashing with the
Vernacular, and the governor's palace programme both vassal cities share.

## 1. The reference board

The owner's pictures, copied into `refs/` (the `talia*` pictures, 28, and `govpalace`; plain Git, like Zeijani's). About twelve fit
"white with orange" closely; the rest give forms in another palette.

| Subject | Best pictures |
|---|---|
| The city as a whole | `talia fancy` (white hill city, orange ribbed domes on drums, cobalt glass, a straight stair up the axis), `talia2` (whitewashed hill town), `talia14` (the dense orange quarter) |
| Temple | `talia fancy` (composition), `talia3 (2)` (white egg domes, rib spire), `talia-temple` (pointed-arch shells round a star rose, a radial plaza), `talia detail` (ogee gables, onion domes) |
| University and halls | `talia (3)` (a long bay facade: round windows between tall ones, an attic band, onion domes, a clock rose), `talia (2)` (college front, imperial stair), `talia hall` (domed pavilion or bath) |
| Cloisters | `talia-cloisters` (white fluted Corinthian stoa, orange coffered ceiling, meander and ring mosaic floor) |
| Housing | `talia2`, `talia` (poor and middle: rounded white cubes, arched loggias), `talia13` (arcades on paired colonnettes), `talia3` (Hawa Mahal: the jharokha front), `talia apt` (luxury towers) |
| Memorials and gates | `talia-memorial`, `talia-memorial2` (stacked lathe spires, gadrooned domes), `talia ornament` (lotus-petal domes, cusped arch, sunburst) |
| Ornament | `talia trim` (gilt Corinthian, pediment), `talia (2)` (scroll gables, balusters), `talia ext forms` (the arch-loop parapet) |
| Interiors | `taliaint3` (civic hall: white shafts flaring into orange honeycomb-mosaic trumpet vaults, white coffers), `taliaint` (two-storey arcaded rotunda with an oculus dome: library), `taliaint2` (house: white plaster, orange vault over a sleeping loft, orange stair treads) |

Form only: `talia5` (red adobe: rill lanes), `talia12` (pink and ochre: melon dome, swept stair walls), `talia (4)`
(teal: orange glow behind deep arches), `talia (5)` and `talia (6)` (cottages: iron scroll rails, worn orange render).

## 2. The rules the generator follows

- **The arch is the opening at every tier.** Round arches by default; pointed and ogee for temples and rich towers;
  cusped and scalloped for memorials, gates and rich accents. Loggias are recessed 1-2 m into the wall.
- **The accent sits in the frame or the recess**, never a random patch. On a white wall the arch reveal, the vault,
  the door, the stair treads are orange; on an orange wall (the showy rich house, `talia (2)`) every frame is white.
- **The bay is the module:** 3-4 m for housing, 4.5-6 m civic. Facades of 3 to 11 bays, odd, with a stressed centre
  bay (wider, taller, gabled or domed) and slightly projecting end pavilions.
- **Storeys:** houses 3-3.5 m; civic ground storey about 6 m, piano nobile about 5 m, an attic band about 2 m with
  small square windows.
- **Columns** are lathes with entasis: Doric for poor and middle porches, Ionic for middle and rich, Corinthian on
  civic and temple; paired on pedestals on the rich.
- **Every important mass ends in a lathe:** a dome on a drum (drum ringed by arched windows, cornice, dome, lantern,
  finial). Hemispheres for the Byzantine, egg-shaped for temples, ribbed melon domes for houses and pavilions, onions
  only as gilt finials and on memorials, lotus-petal tiers only on memorials and gates. Clusters: one big central
  dome, four smaller drum-domes at the corners, kiosk domes on the terraces.
- **Ornament is added by tier, in this order:** rounded edges and arch reveals; string course and cornice;
  architraves with keystones; balusters and balconies; pilasters and an entablature with dentils; cartouches, oculi in
  moulded rings, scroll gables; statuary, gilt capitals, jali. Poor stops at the first, middle at the third or fourth.
- **How the four sources combine:** a Greek or neoclassical base (columns, arcades, cornice), a Byzantine crown
  (drums and domes), Indian pieces as projecting bays, rooftop kiosks and screens, baroque as the gable, balustrade
  and stair dress. Greek leads the University, Byzantine the temple and the skyline, Indian the memorials and the rich
  upper storeys, baroque the rich houses and the public stairs; housing is Mediterranean whitewash.
- **Stairs are a motif:** outside straight stairs and switchbacks on houses, imperial stairs (one flight splitting in
  two) with statue newels on civic and rich buildings, a monumental axial stair to the temple.
- **Paving:** white stone with orange mosaic inlay: meander borders and ring medallions, radial bands on plazas.

Palette (from the pictures): lime white `#F4F1EA`, marble cream `#E8DCC6`, Iziz orange `VPAL.orange` (the accent;
the pictures read `#EE7A1C` to `#F08A24`, close enough to share the one list), burnt orange `#D2601E`, terracotta
tile `#C0583A`, ochre `#DDA23A` (civic ground storeys), gilt `#D9A040` (rich and civic: generously, owner 2026-10-17: capitals, column collars and bases, frieze bands, cartouches, dome ribs, finials, lantern caps, cresting, memorial medallions; never on poor or middle work), verdigris
`VPAL` copper (shared with the Vernacular), cobalt glass `#2F5FB8` (temples), iron `#2A2624` (rails).

## 3. Living beside the Vernacular

The general rules are in `VASSAL-KITS.md` section 2. For Talia in particular:

- **The orange quarter is the bridge.** Talia's dense old quarter (`talia14`) is orange render with terracotta hip
  roofs on short eaves and timber shutters: the nearest Talian form to a Vernacular gable, and the same orange. A
  Vernacular plaster townhouse sits between two orange-quarter tenements without looking foreign.
- **Middle-class kinship.** The Vernacular's middle tier is sand plaster on timber with orange trim; Talia's is white
  lime-wash with orange reveals. Same idea, one value step apart. Keep Talian middle houses to the Vernacular's
  footprints (10-15 m) and two storeys plus a roof terrace.
- **Verdigris** is the shared rich roof: Talian rich houses may take copper melon domes as often as orange tile, and
  then sit beside a Vernacular stone manor's copper roof as a matched pair.
- **Climate.** Talia is at the foot of the eastern passes, likely drier than Iziz (open question 1): flat roofs and
  terraces suit it; the Vernacular's eaves read as the Izani incomers' way of building.
- **Proposed culture mix** for `core/city` zones: the Izani quarter by the palace and the barracks 50% Vernacular;
  the caravan quarter by the east gate 30% (Izani caravanserai, taverns, warehouses); the old town, the University
  and the temple hill 10%.

## 4. What the kit holds (about 50 defs)

Styles in the `style` tag: `whitewash` (poor and middle), `orange` (the old quarter), `classical`, `byzantine`,
`baroque`, `indic`.

**Dwellings**

| Key | Tier | What |
|---|---|---|
| `tal_cube_house` | poor | rounded whitewashed cubes, one or two storeys, flat roof, orange door and reveals, outside stair (`talia2`) |
| `tal_hill_stack` | poor (multi) | rounded cubes stepping back up a slope, switchback stairs, terraces; set on `o.slope` |
| `tal_lane_row` | poor (multi) | a row of narrow houses with a rill down the lane; `o.len`, `o.ends` |
| `tal_loggia_house` | middle | stacked arched alcoves with orange arch bands, iron rails, hanging plants (`talia`) |
| `tal_arcade_block` | middle (multi) | cantilevered blocks with round-arch loggias on paired colonnettes (`talia13`) |
| `tal_dome_house` | middle | a two-storey house with a corner stair tower under a small melon dome, a Doric porch |
| `tal_tenement` | middle (multi) | the orange quarter: four to six storeys of orange render, rows of small arched windows, terracotta hip roof, a round turret on a corner (`talia14`) |
| `tal_palazzo` | rich | the showy house: orange walls, white trim, scroll gables, balustraded balconies, an imperial stair with lions (`talia (2)`) |
| `tal_jharokha_house` | rich (multi) | a tall front of stacked jharokha bays under small cupolas, rising to a stepped crown (`talia3`) |
| `tal_peristyle_villa` | rich | a white courtyard house round a peristyle, a pavilion with a ribbed dome, a garden pool |

**Trade** (the caravan city)

| Key | What |
|---|---|
| `tal_customs_house` | the Emperor's customs on the east road: a baroque front, a weighing court, bonded stores; Izani-run |
| `tal_bourse` | the caravan exchange: a domed hall over a trading floor, arcades round it (`taliaint3` inside) |
| `tal_caravanserai` | a Talian caravanserai: a two-storey arcaded court, a gate with a jharokha over it, camel and crawler bays |
| `tal_agora_stoa` | the market: a long two-storey stoa with shops behind the colonnade; `o.len` |
| `tal_shop_arcade` | a street of shops under an arcade with houses over |
| `tal_warehouse` | vaulted stores, a loading court |
| `tal_bath` | the public baths: a domed hall, a pool court (`talia hall`) |
| `tal_inn` | a merchants' inn round a court |
| `tal_press` | printers and bookbinders (the University's trade) |

**Civic and the University**

| Key | What |
|---|---|
| `tal_uni_hall` | the University's great hall: a long bay facade, ochre ground storey with white pilasters, round windows, an attic band, a clock tower with an onion dome (`talia (3)`) |
| `tal_uni_cloister` | the quad: a white Corinthian stoa round a court, orange coffered ceilings, mosaic floors (`talia-cloisters`) |
| `tal_uni_library` | a rotunda with two arcaded storeys round a well under an oculus dome (`taliaint`) |
| `tal_uni_college` | a residential college: rooms over an arcade, a hall, a chapel dome |
| `tal_observatory` | a drum tower with a ribbed dome that opens |
| `tal_uni_senate`, `tal_uni_faculty`, `tal_uni_anatomy`, `tal_uni_hospital`, `tal_theatre`, `tal_uni_gallery`, `tal_glasshouse` | the rest of the University quarter (section 9b) |
| `tal_odeon` | the theatre and music hall: a half-round cavea under a roof, a pedimented front (the arts) |
| `tal_academy` | the academy of painting and sculpture: top-lit studios behind a classical front |
| `tal_temple` | the main temple: a Byzantine cluster on the temple hill, central dome on a tall drum, four corner drum towers with orange ribbed domes, pointed portals, cobalt glass, a monumental stair (`talia fancy`, `talia-temple` for its rose front). The rite is the Izani state religion; the old Talei pairing of the **Sun and the Giant** as father and mother survives in the iconography: the rose front as the Sun, a banded green disc for the Giant facing it in the apse, the two paired on the doors and the altar |
| `tal_chapel` | a small white egg-dome temple with a rib spire (`talia3 (2)`) |
| `tal_council_house` | the city's own council: a pedimented hall on a podium (the local magistrates) |
| `tal_memorial_spire` | stacked lathe spire on gadrooned domes over a reflecting pool (`talia-memorial`, `talia-memorial2`) |
| `tal_east_gate` | the Gate of the Passes: two drum towers under lotus-petal roofs, a cusped arch with a sunburst between them (`talia ornament`); butts a wall segment |
| `tal_wall`, `tal_wall_tower` | the city wall, white, with orange-capped round towers; `o.len` |
| `tal_fountain` | a nymphaeum: a fountain in a niche of columns |
| `tal_sky_bridge` | an arched bridge between two buildings (`talia11`); its ends set at placement |
| `tal_governor_palace` | section 5 |

## 5. The governor's palace in Talia's style

The programme is `VASSAL-KITS.md` section 3. Talia builds the `govpalace` massing like this:

- The **terrace**: white marble on a moulded base, the front flight a white imperial stair with balustrades and an
  orange runner, lions on the newels (`talia (2)`).
- The **hall block**: a two-storey white arcade, Corinthian columns or piers below, a slimmer arcade above with a
  white balustrade; the upper storey about 0.8 of the lower; a flat roof behind a balustrade (or low orange tile).
- The **great dome**: a tall white drum with arched windows between pilasters; a ribbed dome of orange tile between
  gilt ribs (the ribs answer the picture's lattice); a white lantern with an orange cupola and a gilt finial.
- The **seven pavilions**: chhatri-like rotundas, arcaded drums on 8 to 12 columns, plain or cusped arches, small
  orange or verdigris melon domes; the two rear (residence) pavilions with jali-screened upper storeys.
- The **outside stair**: a straight white flight with a balustrade, landing on the upper gallery under a small
  pediment.
- **Interiors** (decor 2-4): white walls, columns and floors; orange in the vaults, coffers and stair treads; the
  audience hall's columns flaring into orange-mosaic trumpet vaults (`taliaint3`); meander and ring mosaics; gilt
  capitals, coffer rosettes and door leaves in the state rooms (`talia trim`), plainer in the chancery and service.

## 6. Interiors and furniture

- A `talia` culture file in `kits/catalog` (`krator-master-furniture-talia.js`) through `FK.set()`: tub armchairs and
  ottomans in orange, white sofas, low brass round tables, white planters with palms, built-in plaster benches and
  niches, kilims and meander-bordered rugs, lecterns, map and specimen cases, easels, a focal aedicule (`taliaint3`).
- Room kinds for `kits/interiors`: the great hall, the rotunda library, the lecture room, the studio, the cloister
  walk (no furniture), the house with a sleeping loft (`taliaint2`).

## 7. Textures (to add to `core/materials/PROMPTS-NEEDED.md` once the owner agrees)

Reuse first: the library's plaster, marble and terracotta sets, and the Vernacular's copper. Likely gaps: **lime-wash
render**, soft and hand-rounded; **white marble** with a faint vein; **orange mosaic** (honeycomb and the ring
rosettes); **meander border** (a strip); **jali screen** (cut-out on magenta); **star rose window** (`talia-temple`,
a flat disc); **worn orange render** (grey patches under the orange, `talia (6)`). The prompts are written when the
owner agrees the list.

**Delivered 2026-10-18 and wired** (`materials.json`, KNOWN_ISSUES.md): the orange honeycomb mosaic (`taMosaic`: paving
medallions; the trumpet vault item `taVaultMo` for the interiors), the meander band (`taMeander`: paving and terrace
borders), two jali cut-outs (`taJaliA`, `taJaliG`: the jharokha bays), the star rose window (`taRose`, `tanRoseWindow`:
waits for the temple) and the worn orange render (`taRenderW`: the tenement).

## 8. Phases

| Phase | What | Done when |
|---|---|---|
| P0 | `kits/talia` scaffold on the shared IZV list (Pylon's P0 makes it): `build.py`, `verify.py`, the kit sheet, `materials.json`, `INDEX.md`, `PORT.md` | an empty sheet builds and passes |
| P1 | materials and kit items (`ta*`), the helpers: arch frames (round, pointed, ogee, cusped, stepped), the column lathe by order, balusters (instanced), the drum-dome kit (hemisphere, egg, melon, onion, lotus), jharokha bay, entablature | a helper row on the sheet |
| P2 | dwellings, all tiers, and the mixed-street row | eye-level views judged by the owner |
| P3 | trade and the caravan buildings | |
| P4 | the University and the civic set, the temple, memorials, the east gate | |
| P5 | the governor's palace: blueprint sheets after the forks, then the building | |
| P6 | the catalog culture file, interiors | |
| P7 | the Godot export check, the gallery | `tools/test_all.py` passes |

## 9. The site

Talia is on the scale model (`openworld/*/source/settlements.json`, id `sor1zqih8x`, type `city`) at map pixel
(801, 609); Iziz is at (691, 655). At 2 km a pixel that is about 240 km east-north-east of Iziz, inside the little
demo's region (x 623 to 1164), whose roads already end short of an unbuilt Talia
(`openworld/little-demo/KNOWN_ISSUES.md`, "Unbuilt places"). The world page will be placed there.

## 9b. The University of Talia: a quarter of its own

Owner, 2026-10-17: the University is "about 2x the footprint of the ancient campus". The Ancient campus is
`buildCampus` in `kits/ancients/src/76-campus.js` ("the Hill School", one terraced structure on a 58 m hill); the kit
sheet gives it a 660 x 660 m footprint (`targets/kit/89z-rows.js`, `campus:[-370,290,-270,390]`), about 44 ha. Twice
that is about **87 ha: a quarter about 930 m square** (or 1,100 x 790 m to fit the hill), with its own wall and gates,
a district of the city rather than a set of buildings in it. It is the Aggonmekki's rival in science and its better in
the arts, so it holds both:

| Part | What | Keys |
|---|---|---|
| The core | the great hall with the clock tower on the main quad, the cloister quad round it, the library rotunda, the Senate house (the rector and the masters) | `tal_uni_hall`, `tal_uni_cloister`, `tal_uni_library`, `tal_uni_senate` |
| The faculties | natural philosophy (laboratories, a dissecting theatre), medicine (with the teaching hospital), law, letters, mathematics and astronomy (the observatory on the quarter's high point) | `tal_uni_faculty` (three variants by bay count), `tal_uni_anatomy`, `tal_uni_hospital`, `tal_observatory` |
| The arts | the odeon and music hall, the academy of painting and sculpture, the theatre (open air, on the slope), the gallery | `tal_odeon`, `tal_academy`, `tal_theatre`, `tal_uni_gallery` |
| The colleges | ten to twelve residential colleges, each a court with rooms over an arcade, a hall and a chapel dome; rich colleges gilded, poor ones plain whitewash | `tal_uni_college` (`o.wealth`) |
| The town of the gown | students' lodgings, printers and bookbinders, booksellers, taverns, the Vernacular among them | `tal_press`, the dwellings, the Vernacular |
| The grounds | the botanic garden with glasshouses (`talia hall`'s ribbed dome), walks, a reflecting pool, memorials to its scholars | `tal_glasshouse`, `tal_memorial_spire` |

Laid out on `core/city` as a precinct: the core on the axis from the gate, the colleges round courts on a grid, the
arts on the slope, the gardens on the far side. The culture mix inside its wall is 10% Vernacular (Izani scholars'
houses and taverns).

## 10. Open questions for the owner

Settled 2026-10-17: the founders were the Talei; the University is a walled quarter twice the Ancient campus's
footprint (section 9b); rich and civic buildings may be richly gilded; the palace forks take
the recommendations; the reference pictures are in `refs/`. The Talei's old faith was close to the Izani one but paired
the Sun and the Giant as father and mother; they follow the Izani state religion now (the temple keeps the pairing in
its images only).
Talia sits on a hill (owner, 2026-10-18), at the foot of the passes: the temple on its crown, the city stepping down
its slopes (`talia2`, `talia fancy`), the University quarter on a shoulder of it.

None open ("2x the footprint" is twice the Ancient campus's area, about 930 m square: confirmed 2026-10-17).
