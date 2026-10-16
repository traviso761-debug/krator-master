# The Iziz palace citadel: a blueprint

The second palace blueprint, on the method of the Voth one (`settlements/voth/palace/BLUEPRINT.md` holds the study of
Versailles, Topkapı, Heian, Bangkok, the Kuge-machi and Westminster; this one adds the Palatine). The brief (owner,
2026-10-15): the emperor and his whole inner household, consorts, kin and children, live here; the palace houses much of
the bureaucratic machinery of the Iziz military and diplomatic corps; taxation and legal proceedings are done elsewhere.

Decisions taken with the owner: the blueprint covers **the whole citadel precinct**, not only the palace block; the
household is organised **in the Roman manner**, an open imperial family off the same courts and stairs the court uses;
the citadel is **a real war-machine arsenal**, the Empire's last mech depot, so the palace is half fortress; and its
heart is **both** a guarded Ancient power core and a shrine of the deified emperors.

## What is here

| File | What |
|---|---|
| `floors/section.png` | the mesa, the two Ancient levels inside it, the precinct wall, the three tiers, the tower, the lift shaft and the stairs |
| `floors/IU2.png`, `IU1.png` | the Core and the Depot, the Ancient levels in the mesa |
| `floors/I0.png` | the precinct and the base tier's ground storey |
| `floors/I1.png` | the base tier's upper storeys and the precinct buildings' upper floors |
| `floors/I2a.png`, `I2b.png`, `I2c.png` | the Domus: the three storeys of tier 2 |
| `floors/I3.png` | the hangar hall level |
| `floors/I4a.png`, `I4b.png` | the emperor's apartments over the Aula |
| `floors/I5.png` | the tower's six floors side by side |
| `FURNITURE.md` | the manifest: pieces per room from the catalog's Iziz sets, the missing pieces listed at the end |
| `iziz_blueprint.py` | the rooms as data; runs on `settlements/voth/palace/blueprint.py` for the sheets and the manifest |

The frame is the palace builder's own (`src/78-transplant.js` `palace`, placed by `targets/city/90a-city-world.js`):
u runs from the citadel gate inward, v across; the block's local +z (its front, the grand entrance) is -u. The block,
the tiers, the hall, the tower, the curtain wall (84 m), the gate, the plaza, the statue and the two barracks are where
the build puts them. New are the Praetorium, the Hall of Embassies, the rear-arc services, everything inside the
block, and the two Ancient levels in the mesa.

## What Rome adds to the study

The Palatine is the palace the brief describes: one hill, an imperial family living in the open, the Praetorians on
the same hill, the government of the household run by freedmen secretaries (ab epistulis for the letters and the
embassies, a rationibus for the accounts, a libellis for petitions), and ceremony in a public wing (Domus Flavia: the
Aula Regia, the basilica, the lararium, the peristyle, the triclinium) beside a private one (Domus Augustana: lower
courts, the family's apartments, a stadium garden). Lessons taken:

1. **Public wing and private wing on one hill, joined, not walled apart.** The state rooms sit on the hall level; the
   Domus is the tier below, reached by the same Great Stair; the emperor's own rooms are above the Aula.
2. **The family lives among the court.** The empress, the consorts, the kin and the children have suites, not a
   harem; their loggia looks over the city; the nursery is lit by its own light well.
3. **The freedmen run the house.** The Steward (a rationibus) is on the ground floor beside the kitchens; the
   correspondence secretariat is the diplomatic corps' office; the secretaries of the person sit over the emperor's
   bedchamber.
4. **The guard is on the hill.** The two Praetorian barracks stand where the build put them; their officers,
   the Praetorium and the Consilium are a walk from the Aula.
5. **A lararium.** The shrine of the deified emperors is small and central, off the throne room, where the Great
   Stair arrives: the dynasty's dead are the first thing a visitor to the Aula passes.
6. **The hill is hollow.** The Palatine's substructures become the Ancient levels: the mesa was always an Ancient
   bunker, and the hangar hall on tier 3 was its hangar. The lift that fed it still runs.

## The principles the blueprint applies

- **The axis is a ladder of thresholds**: citadel gate, triumphal plaza and the orb-bearer, grand entrance, Vestibule
  of the Orb with its guard rooms, the Atrium, the Well of the Machine, the Great Stair, the Lararium, the Aula Regia,
  and only then the emperor's rooms above.
- **Two secretariats flank the atrium**: the War Secretariat east (clerks, the map room of the legions, the legates'
  waiting room, couriers and signals; the Magister Militum and the Council of Legates above) and the Embassies
  Secretariat west (correspondence, the envoys' waiting room, the treaty archive, the interpreters; the Master of
  Embassies, the Hall of the Envoys and their lodgings above). The Praetorium and the Hall of Embassies in the
  precinct hold the bulk of each corps.
- **The hangar hall is the hinge**: open to the garden terrace for entertaining, the great door into the Aula at its
  back, the old lift under its floor medallion so a mech can be raised into it for a triumph.
- **The arsenal is below**: the Depot at the foot of the mesa with four mech bays, the Forgemasters' repair shop and
  forge, the power cells, the shield generator, the armoury of the legions, the brig and the guard's drill hall; the
  Mech Gate opens on the hill's rear face onto a ramp road; the Depot Stair joins it to the palace's rear.
- **The Core is deepest**: the control room and the power core behind a sealed Ancient door, kept by the Salvagers'
  trusted few; beside them the Reliquary of the Empire and the imperial vault; an Ancient service tunnel out to the
  jungle is the emperor's last way out.
- **The tower is the emperor's own height**: the Map of the Empire, the Council of War, the Treasury of the House,
  the Signal Room (the heliograph and the Ancient set), the Observatory, the Beacon.

## The floors in one table

| Sheet | Level | What it holds |
|---|---|---|
| IU2 | the Core | keepers' vestibule, control room, the core, keepers' quarters and workshop, the Reliquary of the Empire, the imperial vault, the cistern, the escape tunnel, a sealed Ancient vault |
| IU1 | the Depot | the Mech Gate and its tunnel, the concourse, the hangar lift, four mech bays, the repair shop, the forge and foundry, parts and plate, power cells, the armoury of the legions, the drill hall, the mechwrights' quarters, munitions, the brig, the shield generator hall |
| I0 | precinct and base tier ground | the gate, the triumphal plaza and the orb-bearer, the two barracks and drill yards, the Praetorium (standards, legates, records), the Hall of Embassies (audience, interpreters, gifts), the precinct kitchens, the guard mess, the beast stables; in the block the grand entrance, the Vestibule of the Orb, the guard rooms, the atrium, the Well of the Machine, the Great Stair, the two secretariats, the kitchen, the steward, the slaves' hall and quarters, the infirmary, the Depot Stair |
| I1 | base tier, storeys 2 and 3 | the Magister Militum and the Council of Legates, the legions' rolls and quartermasters; the Master of Embassies, the Hall of the Envoys and their lodgings; the household's clerks and dormitories; the third storey as the freedmen's lodgings and the Library of the Palace |
| I2a | the Domus, storey 1 | the family loggia, the empress's antechamber, reception, bedchamber and bath, three kin apartments, the nursery and its light well |
| I2b | the Domus, storey 2 | four consort suites and their bath, the kin's upper rooms, the tutors and the schoolroom |
| I2c | the Domus, storey 3 | the children's bedchambers and nurses, the women's attendants, the wardrobe and treasury of the House, the household shrine, the library and music room |
| I3 | the hall level | the garden terrace under the awning, the hangar hall, the Stair of the Hall, the Consilium, the great door, the Aula Regia, regalia and robing, the Lararium of the Emperors, the triclinium |
| I4a | the emperor's apartments | his loggia over the hall, the antechamber, the tablinum, the bedchamber, the bath, the wardrobe, the upper triclinium, the Oratory of the Orb, the guard of the person |
| I4b | the private apartments, upper | the lantern garden on the hall's roof, the Library of the Emperor, the secretaries of the person, the chamberlain and freedmen, the music room, the winter dining room, the Treasury of the Orb, the Consilium's archive |
| I5 | the tower | the Map of the Empire, the Council of War, the Treasury of the House, the Signal Room, the Observatory, the Beacon Chamber; the cap holds the fire |

## Finishes by decor level

The Iziz palette (orange ashlar, verdigris copper, cream, teal; the deco strips; salvaged electrics): the citadel is
electrified, so the lamps are electric standards and pendants, not candles.
- **Sumptuous (4):** marble floors and sun mosaics, gilt-inlaid mahogany, the sun hangings, Ancient white panel with
  cyan strips where the old fabric shows (the hall, the Well, the Core's cage); bronze doors.
- **Rich (3):** orange ashlar with cream bands, mahogany, sun-medallion rugs, deco chandeliers; the family, the
  envoys, the councils.
- **Fine (2):** plaster over ashlar, teal tile, clerks' desks and scroll cases; the secretariats and the ministries.
- **Plain (1):** plaster and reclaimed panel, corrugate, electric standards; barracks, kitchens, the depot's shops.
- **Bare (0):** board-formed Ancient concrete, bare cells racks and bins; stores, the brig, the munitions.

## Assumptions and open points

- The depot's and core's depths, the mesa's height over the city and the Mech Gate's face are assumed; the build
  has no interior for the palace yet, so nothing is wired. The hangar hall, the lift medallion, the terrace and the
  grand entrance are the build's and are drawn where they are.
- The imperial house has no name in the lore (House Duxun is the exiled claimant's); the sheets say "the House".
- Numbers: a Roman imperial household of a few dozen, four consorts, three kin households, the Praetorians in the two
  barracks (about 120 beds each); the manifest counts precinct zones at a quarter of their area, as the Voth one does.
- Legal proceedings and taxation are elsewhere (owner): no basilica, no counting hall. The Treasury of the House and
  the imperial vault hold the House's own and the reserve, not the revenue.
- The Praetorium and the Hall of Embassies are new buildings in the precinct, on the flanks behind the barracks; their
  footprints keep inside the curtain wall's 84 m but take the drill yards' depth; if the yards must stay whole, the
  corps move to the base tier's third storey and the buildings shrink to two storeys.
