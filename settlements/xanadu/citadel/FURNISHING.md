# Erewhon's citadel furnished: the plan, room by room

The owner, 2026-11-16: "the xanadu citadel desperately needs some fancy furniture ... feel free to ask for textures esp
tapestries and wall-hangings inspired by kubla khan", and: "make sure wall hangings dont wind up near ground, this has been
a recurring issue". `FURNITURE.md` is the blueprint's brief (counts per room); this file is what the furnisher now places
and why. Before: 153 rooms held 1352 pieces (the Hall of Feasts 12, the Dome's baths three Ancients bathroom fittings, the
Sultan's bath the same, 61 wall hangings with their hems under a metre). After: 3637 pieces, every check clean
(`furnish_census.js`, below).

## The register

Not a generic Persian palace: the poem. Kubla's decree is a **stately pleasure-dome**, so the dome comes back in little
wherever the Sultan rests: the baldachin over his bed, the canopy over the Peacock Throne, the gold model on the feast
tables, the lattice box's roof. **A sunny pleasure-dome with caves of ice**: the sorbet tables carry an ice grotto under a
gilt dome; the model on the tables stands on a crystal mound hollowed into caves. **Gardens bright with sinuous rills**:
the salsabil, a carved slab the water ripples down into a meandering rill and a jet; the fountain basins in the halls.
**Many an incense-bearing tree**: standing censers of pierced gold in every rich room. **A damsel with a dulcimer ...
singing of Mount Abora**: the santur on its stand in the music rooms, the harem and the bedchamber; the musicians' dais
with oud, tanbur, chang, frame drums and ney; the hangings. The detail stays LORE 6.13's: Tibetan mass, Mughal masnads and
jali, Turkish hammam stone and kurnas, Persian tray tables and nard boards; gold on everything the Sultan touches. The
Sultan is carried and very fat: the Great Divan is a reinforced couch with its own marble steps, and the silk hoist with its
gilt chair takes him from bath to bed.

## How it is placed

The catalog and the shared pass, no bespoke placement. The citadel's rooms take room kinds of their own, `xc_*`
(`kits/interiors/sets/xanadu-citadel.js`, "THE SULTAN'S COURT FURNISHED"), and the Garden Pleasure Dome's rooms the same
kinds (`kits/interiors/sets/xanadu.js`). A kind has **no aliases**: a room takes only the pieces whose `rooms` list it, and
the Xanadu culture file says which (`kits/catalog/krator-master-furniture-xanadu.js`, the citadel section and its table at
the end). So the curation of every room lives in one table, and a kind asks for its signature pieces by role (the Peacock
Throne, the Great Divan, the state bed, the hoist, the sorbet table, the dais and the dulcimer, the hot stone and the
kurnas, the palanquins, the nard board in the princes' cage) and fills the rest while its area allows. Erewhon's page
furnishes with `?interiors=1` as before (`settlements/xanadu/src/89y-xa-interiors.js`, KFURN, the indexed batch).

**Wall hangings hang high.** Every hanging new here is a wall piece that stands at the floor and draws its own cloth from
its hem up: the Kubla Khan hangings 1.23 m, the great tapestries 1.53 m, the suzanis 1.18 m. The catalog's top-hung cloths
(the court tapestry, banner and scroll, the painted hanging on its poles), which a tall room drops toward the floor
(`furnAnchorY` hangs a cloth's top at 2.7 m whatever the ceiling: a 2.1 m tapestry ends 0.6 m off the floor), are left out
of every `xc_*` kind; the frieze (high) and the wall rug (hem 1.1 m) stay in. Every citadel room that hangs anything is on
an `xc_*` kind, so no low cloth reaches the citadel. The catalog-wide fix belongs in `core/catalog` (`furnAnchorY`: keep a
hung cloth's hem at least a metre up when the ceiling allows); it reaches some thirty builds, so it is its own task.

## The rooms

| Kind | Rooms | Signature (required) | Then, while there is room |
|---|---|---|---|
| `xc_audience` | Hall of Audience | the Peacock Throne under its little dome; four masnads or divans | masnads and divans, tray tables, great tapestries and hangings, censers, chandeliers, lamp trees, guardian lions, fountain basins, carpets, the gold model, candelabra |
| `xc_reception` | the Vizier's reception, the Chancellor's Hall of Seals, the envoys' hall | three masnads or divans, a tray table | the same, smaller |
| `xc_feast` | the Dome's Hall of Feasts | the Great Divan, the musicians' dais, the sorbet table, six dining couches, four tray tables | cushions, censers, hangings, chandeliers, fountains, the dulcimer, planters, ewers and the gold model on the tables |
| `xc_dining` | the State Dining Hall, the Sultan's Dining Room | four couches or masnads, three tray tables, the sorbet table | as the feast (aliased to it) |
| `xc_music`, `xc_musicbox` | Hall of the Musicians, the Musicians' Box | the dais and the dulcimer; in the Box the Sultan's lattice box | instrument racks, cushions, hangings |
| `xc_sultan_day`, `xc_dayroom` | the Sultan's day room, the Kiosk of the Domes; the guests' sitting room | (the Great Divan in the Sultan's two) three seats, a tray table | nard boards, the salsabil and fountains, hangings, censers, the birdcage, the astrolabe, bookcases, a hearth, the dulcimer, the lattice box |
| `xc_bedchamber` | the Great Bedchamber | the state bed under its dome, a chest, the Great Divan, the hoist | screens, censers, the salsabil, hangings, chandelier, the dulcimer |
| `xc_harem` | the Valide's rooms (both floors), the consorts, the favourites, the baths' rest rooms | two day-beds under silk, a chest, two seats | more day-beds, screens, fountains, nard boards, censers, suzanis and hangings, birdcages, the dulcimer |
| `xc_cage` | the Cage of the Princes (both floors) | two day-beds, a chest, two seats, a bookcase, the nard board | the rehal, desks, the astrolabe, screens |
| `xc_guest` | the guest apartments of state, the officers' and envoys' bedrooms | a day-bed, a chest, a seat | screens, a hearth, a suzani |
| `xc_dorm` | the concubines' dormitories (both floors) | six quilted pallets, two chests | up to twenty more pallets, screens, suzanis |
| `xc_bath` | the Sultan's bath, the Baths of the Dome | the hot stone (göbektaşı), two kurnas | the tiled pool, fountains, the salsabil, the Great Divan, peshtemal racks, screens, the hoist, a day-bed |
| `xc_study` | Room of the Vizier, the Vizier's study, the officers' studies, the Mistress of the Harem | a desk, two bookcases, a ledger store | the rehal, the map table, the astrolabe, ledger chests, card cabinets, masnads |
| `xc_chancery` | Chancery of Letters, the Vizier's clerks' hall, the officers' bureaus and halls of ledgers | four desks, two bookcases | up to eight more desks with cabriole chairs, scroll racks, ledger chests |
| `xc_divan` | the Divan Hall | the Vizier's seat, six masnads or divans, two tray tables | the map table, a desk, ledger chests, censers, hangings |
| `xc_treasury`, `xc_gifts` | the treasuries of gifts, the strongrooms, the harem's treasury; the Hall and the Gallery of Gifts | four chests; two stands of gifts | strongboxes, cabinets, gift stands, lacquered armour, lions, the astrolabe |
| `xc_wardrobe` | the Sultan's wardrobe | three presses | racks, chests, screens |
| `xc_loggia` | the Loggia of Appearances | the Great Divan (he is shown to the court on it) | masnads, censers, hangings, the salsabil, birdcages |
| `xc_hall`, `xc_lobby` | the gate iwan, the harem postern, the Vizier's loggias and petitions; the stairs, landings and vestibules | | divans and benches, hangings, censers, lamps, lions, planters |
| `xc_court` | the forecourt, the roof terraces, the Vizier's pool garden | | planters, benches and masnads, fountains, lamps, censers, lions |
| `xc_litter` | the Litter House at the Ramp's foot | the two palanquins | benches, chests, racks |
| `xc_mess`, `xc_temple`, `xc_cell`, `xc_kora` | the guard's mess; the court temple's prayer hall, priests' rooms, drum circuit | tables and benches; the altar, eight rows of cushions, two skylight columns; a bed and a chest; four prayer-wheel rows | as the room needs, plain where the blueprint is plain |

Kept on the shared kinds (they hang nothing low and were furnished already): the guard rooms and the armouries, the
kitchens, the stores and the ice house, the stables, the dormitories of the cooks, bearers, servants, eunuchs and the guard,
the hospital, the harem school, the Mines' assay room (its forge until the assay furnace is made).

## The new pieces (kits/catalog, culture `xanadu`, court tier)

The Peacock Throne; the Great Divan; the masnad (three colours); floor cushions; the gilt dining couch and its tray
tables; the sorbet table with the caves of ice; the gold model of the sunny dome on its caves of ice (a table piece); the
nard board; the standing censer; the great chandelier; the lamp tree; the Sultan's bed under its dome; the day-bed under a
silk canopy (three colours); the quilted pallet; the silk hoist; the damsel's dulcimer (a santur on its stand); the
musicians' dais; the rack of instruments; the Sultan's lattice box; the salsabil; the octagonal fountain basin; the hot
stone of the hammam; the kurna; the rack of peshtemals and pattens; the rehal; the astrolabe and celestial globe; the ledger
chest; the stepped stand of gifts; the gilt-banded chest (two colours); the gilt birdcage; the palanquin; and three
hangings: the Kubla Khan hanging (2:3, four designs), the great tapestry (3:2, four designs), the suzani (two).

## The pictures (delivered 2026-11-17)

The owner's Codex panels are in the library and on the walls: the four Kubla Khan hangings and four great tapestries
(`patterns/xanadu/hanging-*`, `tapestry-*`), the two suzanis (`patterns/common/suzani-roundels`, `.b`), and three new pieces:
- **the sultan's portrait** (`xanadu_court_sultan_portrait`): five turbaned sultans (with crescent staff, in triumph, pensive,
  writing poetry, playing a sitar), in the audience and reception halls, the dining halls, the day rooms, the Divan, the halls,
  the loggias and the Gifts;
- **the envoy's hanging** (`xanadu_court_envoy_hanging`): the easter eggs, the Ancient Mariner, Butler's Erewhon, Caves of Qud and
  Kenshi as Mughal miniatures, gifts from far lands, hung only in the Hall and Gallery of Gifts, the studies and the guest
  apartments, so they turn up now and then;
- **the envoy's tapestry** (`xanadu_court_envoy_tapestry`): the owner's own Kenshi panel, travellers crossing a desert of ruins (16:9).
Each placement of a many-design piece draws its design from its seed, so a hall is not one picture repeated.

How they reach the page: `settlements/xanadu/citadel/materials.json` packs them alone (`tools/textures/pack.py
settlements/xanadu/citadel`, 27 families, 4.8 MB) as `KMAT.pack('xanadu-pics')`, and only the xanadu and erewhon pages take that
pack (`settlements/xanadu/build.py`, `PICS_PACK`). A hanging's decal paints the packed picture at its own resolution
(`xanPicPaint` in the Xanadu culture file); where the page has no pack (the catalog sheet, another world, node) it paints the
stand-in (`xanKublaPaint`, `xanPicStandIn`). This is a stop-gap for image decals in the engine itself, owed in `core/catalog`.
The earlier, non-Mughal takes (`patterns/easter/*.classic`) are in the library for Talia's art museum, not wired.
## Checks

`node settlements/xanadu/citadel/furnish_census.js [--brief] [--assert] [--json f]` furnishes every room of the citadel's
set items and the Pleasure Dome as the page does (KFURN's seed, the whole catalog), headless, in a few seconds, and checks:
the interiors audit on every room (inside, clear, reached), the **hem** of every wall hanging (its lowest drawn point at least
1 m over its floor where the room is tall enough), every floor piece on its floor and every table piece on a host, every
required piece placed, and the residence rule. The page's own verify (`settlements/xanadu/verify.py`, `KRATOR_GL=gpu`) is
the proof of what is drawn. `--where <key>` prints where a piece stands (room, x, z, ry).

**Verified 2026-11-17, on the GPU lanes (`KRATOR_GL=gpu`):** the catalog sheet (`kits/catalog verify.py --assert`, every
page: declared sizes, anchors, tags, palette, shaders) passes; the interiors sets sheet (`kits/interiors verify.py --sets
--assert --seeds 1`) passes every check (inside, height, overlap, doors, clearance, reach, required, determinism, residence,
lights) and is deterministic; with three seeds every seed passes too, but the sheet's renderer dies on the reseed back to seed
0 (it grows past 20 GB over the reseeds and the per-set shots: the sheet's, not the citadel's; run it with `--seeds 1`).
Erewhon (`verify.py dist/erewhon.html --assert --interiors`) passes every check but `erewhon-island-is-the-landform` (the
island measured 71 km from the scale model's landform: the open-world map's, not the furniture's), with shots in the Hall of
Audience, the Divan, the Hall of Feasts, the baths, the Great Bedchamber, the day room, the bath, the Kiosk, the consorts' rooms,
the cage and the musicians' hall.

**The owner's corrections.** The Dome's Hall of Feasts is furnished on the rectangle inside its arcades, so its sides are open
arches: a hanging there stood free with its back to the court (seen from the preset camera), so `xc_feast` takes no hanging,
frieze or wall fountain (the palace's dining halls, `xc_dining`, do). The state bed stands as first placed, its headboard to the west
wall (the owner turned it, then: "that headboard was right the first time").
