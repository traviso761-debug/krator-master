# The Palace canton: a blueprint

The owner's design notes (quoted in `targets/voth-city/40b-vc-suites.js` on the `claude/voth-interiors` branch and
in that branch's `README.md`, "The Palace and the Temple") fixed the chain of state rooms: the gilt entrance where the
Ancestry bridge lands, a three-storey foyer with the ancestors' statues, a two-storey banquet hall, the three-storey
octagonal throne room under its dome and sun-giant-Krator chandelier, Tzintzun's chambers behind it on two floors, a
two-storey Hall of Judgment off the service hall, guest chambers, clerks, kitchens, servants, guards, stores by the
dock and a personal oubliette. This blueprint keeps all of that and asks what the rest of the building is for, by
studying how five historical palaces actually used their space.

Decisions taken with the owner on 2026-10-15: Tzintzun keeps **kin, not consorts** (the Solar House: adopted heirs,
favourites, their tutors); the **ministries live in the palace** (a Chancery under the state floor); the **big state
rooms keep their footprints** and only the ruler's apartment block is subdivided; the summit is a **Dawn Pavilion and
a high garden**.

## What is here

| File | What |
|---|---|
| `floors/section.png` | the tiers, the storeys and the eight stairs in one section along the main axis |
| `floors/F-1.png` … `floors/F8.png` | one sheet per floor: every room numbered, named and keyed with its kind, decor level and area |
| `FURNITURE.md` | the manifest: pieces per room from the catalog's Voth sets, with the pieces the catalog lacks listed at the end |
| `blueprint.py` | the generator: the rooms as data in the suite's frame (u along the axis, v across, metres), the sheets, the manifest |

The frame is the one `VC.SUITES.Palace` uses, so a sheet's rectangles transcribe straight into `rooms`, `halls`
and `links`. Tier radii (200, 140, 95, 70) and the storey counts are assumptions: read them from
`VC.INT.cantons.Palace.tiers` when wiring, and if a tier has more storeys than drawn, repeat the nearest sheet.

## The study: what the plans teach

**Versailles (first floor).** The Grand Appartement is an enfilade of seven planet rooms ending at the throne (Apollo)
and the Hall of Mirrors; the King's Apartment proper is a ladder of thresholds (Guard Room, first antechamber where he
dined in public, second antechamber where the court waited, bedchamber on the very axis of the palace, council chamber)
and behind it the petits appartements: small rooms, a bath, a library, a games room, lit by internal courtyards
(Cour des Cerfs) and joined by private stairs. The Queen's side mirrors it with a guard room, an antechamber, a salon
and tiny private cabinets round a light well. Government and religion are present but separate (the Chapel, the
Council). Lesson: **depth is rank; each step inward is a smaller room behind a guarded door; the ruler works in
small rooms, not in the throne room.**

**Topkapı, the Harem.** Ninety-three numbered spaces round a spine, the Golden Way, from the Carriage Gate to the
Sultan's Hall, through the eunuchs' courtyard, the main harem door and the Throne Door. The Valide (queen mother) has a
suite of seven rooms (prayer room, bedroom, sitting room with a raised dining platform, salon, reception room, bath,
corridor) and an upper floor. The service side is a whole parallel world: the women slaves' courtyard, dormitory,
bath, laundry, kitchen, pantry, a hospital with its own court, a **food door** and a **food corridor**, a Gate of
Carts, and the Death Gate by which the dead left. The Mabeyn is where the Sultan met viziers: the hinge between
public and private. Lesson: **service has its own gates, corridors and courts; the household is a town; the ruler's
suite includes a bath, a prayer room and a room for receiving ministers; there is always a hidden way out.**

**Heian (the Greater Palace and the Dairi).** The Daidairi is four-fifths ministries, each a walled compound in a
grid: the Brewing Department, the Main Water Office, the Banquet Office, the Ministry of the Imperial Household, the
Department of Divinities. Inside it the Chōdōin is the hall of state for great ceremonies, and inside that the Dairi
holds the Shishinden (ceremony) in front of the Seiryōden (where the emperor actually lived and governed), with the
consorts' pavilions behind, each round its own small garden. Lesson: **government is bulk and lives in its own
compounds; ceremony and daily rule are different buildings; the residence hides behind the hall.**

**Bangkok, the Grand Palace.** An Outer Court of bureaus and the royal temple, a Middle Court of throne halls where the
Maha Monthien group runs public audience (Amarin Winichai), semi-private hall (Phaisan Thaksin), bedchamber
(Chakraphat Phiman) on one axis, and an Inner Court that is a walled town of its own. Pavilions for disrobing, for
regalia, for relics, a garden with an artificial mountain. Lesson: **three courts, public to private, and the
audience-to-bedchamber axis; relics and regalia have rooms of their own.**

**Kyoto, the Kuge-machi.** The Imperial Palace sits inside a walled precinct packed with the court nobles' residences,
each a named compound, with the retired emperors' and the empress dowager's palaces beside it. Lesson: **the great
officers live at the palace, each in a house of their own; former rulers get their own palace** (for Voth, the
Ancestry canton at the far end of the bridge).

**Westminster (principal floor).** A processional spine (Victoria Tower, Robing Room, Royal Gallery, Lords, Central
Hall, Commons) with lobbies as filters, the libraries and dining rooms along the river terrace, and six internal
courts giving light to every office; the Speaker's and the Lord Chancellor's residences at the two ends. Lesson:
**a deep plan breathes through repeated light courts; reading rooms face the garden; the officers' houses book-end
the building.**

## The principles the blueprint applies

1. **A ladder of thresholds on the axis.** Water Gate (dock) and Bridge Porch; Foyer of the Ancestors; Banquet Hall
   (the first antechamber, where the court dines in public); the Octagon of the Sun; the Vestibule of the Sun (the
   Privy Door, one guarded threshold); the Privy Antechamber; and only then the bedchamber. The Waiting Room of the
   Summoned sits by the throne room's south door, the Gallery of the Summoned by the Hall of Judgment.
2. **The ruler works in small rooms.** The owner's 68 × 52 m apartment block becomes a suite: Council Chamber and
   Cabinet of the Orb either side of a privy passage; the Privy Antechamber with the Inner Stair north and the Secret
   Stair south; a Privy Court open to the sky with screened galleries round it; bedchamber, bath, Oratory of the Sun on
   the morning side. Above: Robing Room, Chamber of the Staff, sleeping loggia, private library, the astronomer's
   closet. Above that, reached by the Inner Stair alone: the Treasury of the Sun and its Keeper.
3. **Three palaces in one, touching at guarded doors.** Ceremony on the state floor's axis; government in the Chancery
   below it (ministries round the light courts, the Hall of Petitions the public reaches from the terrace, the Vizier's
   Divan with a screened loggia for the ruler) and in the court offices beside the Hall of Judgment; the household and
   the private palace above and below.
4. **Service runs parallel and hidden.** The Servants' Way (a back stair, dock to summit) and the Kitchen Stair (the
   tier 0 kitchens to the servery beside the banquet hall) are the food corridor and the Gate of Carts; the north and
   south service halls keep the owner's garden doors at their ends; the Great Kitchen stays beside the banquet hall as
   the owner placed it, with larder, scullery, buttery and servery round it.
5. **Courts for light.** Every deep block gets an open court: the court offices, the guests, the servants, the
   household offices, the stores, the kitchens, the laundry, the slaves, the workshops, the Quiet Office, the Solar
   House and the pleasure side. The owner's atria and light wells are the same idea; the Privy Court is the ruler's.
6. **The household is a town.** Tier 0's first storey holds the 150 of the household, the garrison's dormitories,
   the slaves' quarters, and the residences of the great officers (the Vizier's compound, the Commander of the
   Ordinators, the Chief Steward, the Keeper of the Treasury, the Master of Ceremonies, the Chamberlain, the
   Physician), each with a door onto the terrace.
7. **Religion in-house.** The ancestors in the foyer and in the Hall of the Ancestors on tier 2 facing the bridge to
   their necropolis; the Oratory of the Sun in the suite; a chapel for the household and one for the guard; the
   Solar Altar and the Dawn Pavilion on the summit, with the priest-astronomers' college below them.
8. **Guards at every threshold and barracks by the gates.** The Water Guard and the garrison by the Water Gate; the
   Guard Rooms of the Bridge; the Throne Guard; the Privy Guard; the Inner Guard of the Solar House; the Treasury
   Guard; the Garden Door guards; the Ordinators' Water Post by the boat house.
9. **Bulk is stores and bureaucracy.** The dock storey is stores, workshops, kitchens and the garrison; the Chancery is
   the ministries; the oubliette's storey is cellars but for the gaol.
10. **A hidden way out.** The Quiet Office (the Ordinators' secret branch) has its own Gaol Stair to the oubliette and
    the Forgotten Gallery to the Death Gate, a barred arch at the water line; Tzintzun's Secret Stair runs from his
    antechamber down to the same place.
11. **Victory on show.** The Gallery of Victories (Voth means Victory) with the Armoury of Honour and the Banner Hall
    stacked above it, between the Library of the Sun and the guests: the Hall of Battles.

## The floors in one table

| Sheet | Tier, storey | What it holds |
|---|---|---|
| F-1 | under tier 0 | cellars, the cistern, the oubliette (warders, 14 cells, the pit, interrogation), the Forgotten Gallery and the Death Gate, the Secret Stair's foot, the Treasury cellars |
| F0 | tier 0, ground | Water Gate, Weighing Hall, dock stores, the garrison (guard hall, two barracks, armoury, drill court, mess), household kitchen with bakehouse, brewhouse, butchery, laundry, slaves' quarters, workshops (carpenters and gilders, lamp makers, tailors, potters), boat house, the Officials' Entrance Hall off the East Door, the Quiet Office with its holding cells and gaol stair |
| F1 | tier 0, 1 | the Household Hall and chapel, dormitories, the garrison's dormitories, the officers' residences (the court town), the Vizier's compound, the clerks' lodgings, the infirmary |
| F2 | tier 0, 2 | the Chancery: Hall of Petitions, the ministries (Granaries and Tribute, Provinces, Works and Canals, Fleet, Census, Treasury with assay and mint, Slaves, Rites, Embassies, Household, Ordinators, Arsenals, Mines), the Archive of Edicts, the Chancery of Seals, the Heralds, the Divan |
| F3 | tier 1, 1 | the state floor as the owner laid it, with the suite subdivided, the thresholds added, the kitchen's dependencies, the court offices, three state guest suites with their dining hall and bath, the servants, the Ordinators' watch, the household offices, the scriptorium, the Gallery of Victories, the Library of the Sun, six guest chambers, the guests' hammam, the infirmary |
| F4 | tier 1, 2 | the galleries; Robing Room and the Chamber of the Staff; the sleeping loggia; the guests stacked; the senior household |
| F5 | tier 1, 3 | the top galleries; the Skylit Gallery over the banquet hall; the Treasury of the Sun; archives |
| F6 | tier 2, 0 | the Hall of the Ancestors, the Hall of Screens, the dome's drum and its gallery, the Hammam of the Sun, the Solar House (hall, garden court, four kin suites, the school of the heirs, the Mistress of the House), the pleasure side (private feast hall, music room, garden court), the Astronomers' College, the favourites, the plate room; the upper terrace gardens on tier 1's roof |
| F7 | tier 2, 1 | the ruler's screened loggia, the drum gallery, the kin's bedchambers, the astronomers' library |
| F8 | tier 3 | the lantern, the Dawn Pavilion, the Solar Altar, the instruments, the Pool of the Sky, the Kiosk of the Evening, the beacon, the Grove of the Ancestors |

## Finishes by decor level

- **Sumptuous (4):** the owner's palette: carved green stucco with gilt scrolls, green crackle tiles, jade inlay on the
  octagon's diagonals, carved inlaid columns, purple filigree screens, the Tzintzun and procession tapestries, sun
  carpets, the painted chandelier drums; porphyry and black trim at the thresholds.
- **Rich (3):** green stucco and tiles, gilt trim, damask hangings, knotted carpets; the state guests, the kin, the
  officers' residences.
- **Fine (2):** smooth banco over tile, timber ceilings, scroll cases and kilims; the offices and the lesser guests.
- **Plain (1):** ash plaster, tiled ochre floors, lanterns; kitchens, dormitories, guard rooms.
- **Bare (0):** sandstone blocks and candle sconces; stores, cells, the oubliette in the dungeon's darker stone.

## Wiring it (for the interiors branch)

- F3 to F5 extend `VC.SUITES.Palace`: the suite's `rooms` gain the subdivided apartment (council, cabinet, antechamber,
  privy court as an open `court` room with `keepAbove` through the tiers, bedchamber, bath, oratory), the vestibule, the
  waiting rooms and the kitchen's dependencies; the halls' `purposes` per storey become the named lists on the sheets
  (new kinds: `council`, `cabinet`, `antechamber`, `vestibule`, `bath`, `hammam`, `oratory`, `library`, `treasury`,
  `trophy`, `wardrobe`, `music`, `servery`, `buttery`, `infirmary`, `lodging`, `ministry`, `divan`, `petitions`,
  `ancestors_hall`, `kin_chamber`, `pavilion`, `altar`; their programmes are `program()` in `blueprint.py`).
- The Chancery, Household and Dock sheets are zones for the generic planner's `purposes` on tier 0 (today
  `guardroom, store, office, chamber, living, kitchen`): give each quadrant its own list, and name the stairs.
- Tier 2 and the summit want a second suite entry (`tier: 2`) and a deck programme; the dome's `keepAbove` already
  clears the throne room's footprint.
- The eight stairs: the core (as now), the Servants' Way, the Kitchen Stair, the Chancery Stair, the Gaol Stair, the
  Inner Stair (the owner's inner stair, moved to the antechamber), the Secret Stair, the Stair of the Sun.

## Assumptions and open points

- Tier radii and storey counts are guessed from the suite's extents and the storey minimum; the stack decides.
- The Water Gate is placed under the Bridge Porch on the -x face and the Gate of Carts on the south face; the ferry
  piers and the apron flights may want them elsewhere.
- The Vizier is the Grand Vizier of the lore's Ottoman analogy; the Kuge-machi residences assume the great officers
  live at court. If they live in the Guild canton's manors instead, F1's residences become more household.
- Slaves' quarters are drawn because the lore has Nazarite and Wingman slaves in Voth; the census may put them elsewhere.
- The manifest's counts on tier 0 are a quarter of each zone (the planner will cut corridors and courts out of it);
  the census, not the manifest, sets how many beds and bunks the household needs.
