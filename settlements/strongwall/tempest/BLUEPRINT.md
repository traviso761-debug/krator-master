# The House of the Tempest: the Order of the Violet Storm's mother house on the West Arm

A blueprint on the large-buildings method (`painting-to-3d-world`, `references/large-buildings.md` Part 1), on the
generator the Voth, Iziz, Longsong and Erewhon blueprints share (`settlements/voth/palace/blueprint.py`). The site,
the order and the fort asset are in `settlements/strongwall/PLAN.md` sections 3a and 5.

**From the owner and the lore** (everything else here is *proposed*):
- The owner, 2026-11-16: "also the House of the Tempest asset. we can use the large building planning skill for this
  one".
- The order (the owner, 2026-11-16; `PLAN.md` 3a): *"the Order of the Violet Storm is a martial order that protects the
  Vale against Lizardmen incursions"*. It is one of Qiblai's eight great monasteries, the violet one (`LORE.md` 6.13:
  the Prismarchy, the eight colours). **Qiblai's violet monastery is this house's daughter.**
- **600 in the Gold March. Sword and bow.** The monks ride **horses**. The site is **the West Arm** (px 886,1619), a
  flat crest at 519 m, `Cfb`, with the forward lookout on its west brow (879,1618). The name is **the House of the
  Tempest**.
- The building is a dzong in the full sense: the Qiblai kit's great monastery in its **violet dress** inside the fort
  asset's curtain, towers and gate (`PLAN.md` section 5, `size:'monastery'`). The gilt crown goes on its assembly hall;
  its gate keeps the forts' gilt pavilion. Inside are a drill court and archery butts, an armoury of swords and bows
  (no powder), and stables.
- The beacon keepers are the Yellow Monastery (Qiblai's gold spoke); the forts' gold is on the gate pavilion and the
  keep's chapel only (`PLAN.md` 5.5).

**The owner's forks, 2026-11-16** (asked before drawing; each changes whole floors):

| Fork | The owner's answer | What it set |
|---|---|---|
| How the martial and monastic sides divide | **Concentric**: the violet monastery in the middle; the fort's martial ranges against the curtain all round it (Krak des Chevaliers) | two curtains; the inner ward on a talus holds the kit's monastery, the outer ward holds the companies, the horses, the novices, the kitchens |
| Where the violet Prismarch lives and rules | **Here, in the utse**: the war room and the order's banner below, his cell in the middle, his chapel and the beacon on top; he rides to Qiblai for the councils | the Prismarch's tower astride the inner curtain, the inner gate through its base (sheet U) |
| How the novices are trained | **Their own court**: dormitory, school, refectory, the Master of Novices; the Song in the morning, the bow in the afternoon; the cloister only at their vows | the novices' court in the outer ward's north-west corner |
| How the order musters and sallies | **Horses inside, three gates**: war horses in the outer ward, a muster court inside the Main Gate (east, toward Strongwall), a sally gate north and south onto either road; remounts in a walled paddock outside | stables along the north and south curtains with the companies over them; the muster court before the utse |

## What is here

| File | What |
|---|---|
| `floors/T0.png` | the crest round the House (1,000 x 800 m): the road, the Maydan, the remounts' paddock, the tank, the terraces, the tea garden, the beacon and relay bearings |
| `floors/T1.png` | the House, ground floor: barbican, gates, the outer ward's ranges and grounds, the inner ward |
| `floors/T2.png` | the House, upper storey: the eight companies over their horses, the lofts, the novices' dormitories |
| `floors/M1.png`, `M2.png`, `MR.png` | the great monastery (the kit's block): ground, upper floor and the hall's gallery, the hall's third storey and the roofs |
| `floors/U.png` | the Prismarch's tower, its five floors side by side |
| `floors/section.png` | along the axis from the barbican to the Storm Tower |
| `FURNITURE.md` | the manifest from the same data, the pieces the catalog lacks at the end |
| `tempest_blueprint.py` | the rooms as data; runs on the shared generator with Longsong's Xanadu key map and programmes |

**Frame.** u runs from the Main Gate (east, toward Strongwall, drawn on the left) west along the axis toward
Komodo's side; v across, v > 0 north (up the sheet); metres. The outer curtain's line is u -130..130, v -95..95 (260 x
190 m), the barbican before it at u -162..-138. The inner curtain is u -55..55, v -48..48, on a 4 m talus. The kit's
monastery stands at u -20..32, v -26..26 with its gate facing east; its frame converts as u = 6 - z, v = x
(`kits/qiblai/src/89q3-qb-sacred.js`, `buildQbMonastery`: W = D = 52, ranges 7 m deep, the hall 24 x 17 m). The utse is
u -63..-41, v -11..11. With the barbican and the towers the footprint is about 300 x 205 m.

## The plans studied, and what they teach

- **Krak des Chevaliers** (the Hospitallers, 12th-13th c.). Two curtains, the inner on a great sloping talus and
  higher than the outer so both can shoot; the lists between them; the long, bent, vaulted entrance ramp with its turns
  and machicolations; inside the inner ward the great hall, the chapel and a 120 m warehouse; the Grand Master's tower
  on the inner curtain. Lesson: **concentric is depth without a line: every side manned, the inner ward reached only by
  crossing the outer, and the way in turns.**
- **Malbork** (the Teutonic Order). The High Castle is the convent (chapter house, church, refectory, dormitory, a
  two-storey cloister); the Middle Castle the Grand Master's palace, the great refectory, the infirmary and the guests;
  the outer bailey the stables, armoury, granary and workshops, with the servants' own church. Lesson: **a military
  order is a convent with a barracks round it: the brothers' house in the middle, the horses and the trades outside it.**
- **The Templars' rule.** Each knight with his horses and his squire; the Marshal keeps the arms and the horses; the
  brothers eat together in silence while a reading is sung, sleep clothed with a lamp lit, and keep a daily chapter
  where faults are confessed. Lesson: **the order sleeps dressed by its horses; the arms are issued, not owned.**
- **The dzongs of Bhutan** (Punakha, Paro's Rinpung, Trongsa). Monastery and fortress in one battered white enclosure:
  the administrative court and the monastic court, the utse tower between them, the assembly hall and its chapels in
  the monastic court; the dzong's balcony from which the lama shows himself at the festival; the archery ground
  outside, where two targets stand 145 m apart. Lesson: **the ruler's tower stands between the two worlds, and he is
  seen from it.**
- **The ribats of Ifriqiya** (Sousse, Monastir). Warrior-ascetics in a square of cells round a court, a prayer hall
  upstairs, corner towers and a tall signal tower; a chain of ribats along the coast passing fire signals from post to
  post. Lesson: **a frontier house is one link in a chain of fires.**
- **Shaolin.** One axis of halls, the abbot's room behind the main hall, the Pagoda Forest of the abbots' tombs, and
  the Thousand Buddha Hall's floor worn into hollows by the monks' stance practice. Lesson: **the drill and the
  scripture share one axis, and the dead masters stand together in their own ground.**
- **Gyantse** and the **Tibetan gonkhang.** The dzong on its rock with the monastery joined to it by walls; and in the
  monasteries the protector chapel (*gönkhang*), dark, its pillars hung with old weapons and armour. Lesson: **a
  fighting order hangs its dead brothers' arms in the holiest dark room.**
- **The Mamluk maydan and the yabusame.** The cavalry's own training ground beside the citadel (the *furusiyya*: the
  lance, the bow from the saddle, the target on a pole) and the Japanese mounted-archery track with its three targets.
  Lesson: **riders train outside the walls, on ground of their own.**
- **The Qiblai kit's great monastery** (`kits/qiblai`, `qb_monastery`, `o.v` 6). Two-storey cell ranges round a
  cloistered court with jali, the gate tower in front, the assembly hall at the back under the gilt crown with the
  wheel and deer, the Song drum in the court for the violet spoke. Lesson: **keep the kit's block whole as the convent;
  build the order round it, not into it.**

## The principles the blueprint applies

1. **Concentric, with a line through it** (the owner's fork; Krak, Malbork). The barbican, the Main Gate, the muster
   court, the utse, the inner court, the Gate of the Song, the cloister court, the porch, the Assembly Hall, the Shrine
   of the Storm. Depth is holiness: a raider meets the outer curtain, then the lists, then the inner curtain on its
   talus.
2. **The Prismarch stands between the wards** (the owner's fork; the dzong's utse). Everyone who enters the Song passes
   through his tower's base. The war room and the banner are below him, his chapel and the beacon above; the companies
   form under his balcony.
3. **The sword stays in the Sword Ward.** No blade passes the Gate of the Song: the brothers rack their swords and bows
   in the Blade Room by it (*proposed*). The cloister is the Decree's, the outer ward the order's work.
4. **The order sleeps over its horses** (the Templars, the owner's fork). Eight companies of forty (*proposed*, named for
   the eight winds) sleep dressed above the stables of the north and south curtains, each pair of halls with a stair and
   its captains between, each flank's companies with their own sally gate onto their own road. The captains' stairs run
   from the stables to the wall walk: at the gong each company either mans its own stretch of curtain or goes down to its
   horses, without crossing another company's ground.
12. **The horse is the House's biggest eater.** Hay sheds in the lists hold each flank's week; the year's hay is in barns
    and ricks on the crest; the muck goes out by the sally gates to two middens and onto the terraces, which is why the
    terraces can give two fifths of the grain.
5. **The arms are issued at the threshold.** The Sword Hall and the Quiver House stand by the Main Gate and the muster
   court; the Marshal lives over his hall.
6. **One link in a chain of fires** (the ribats). The Storm Tower on the west front reads the brow relay's mirrors and
   fires and sends them to the utse; the utse's beacon sends them east to Strongwall and the watch line.
7. **Boys are kept apart until their vows** (the owner's fork). The novices' court has one door, onto the drill court;
   the Master of Novices and the masters of arms live in it.
8. **The dead are kept close** (Shaolin, the gonkhang). The Field of the Fallen in the inner ward, the Founder's
   Chorten behind the hall, and the Protectors' Chapel at the hall's top with the dead brothers' arms on its pillars.
9. **The wounded lie by the hall** (the Hospitallers). The infirmary is in the inner ward, an altar at its end so the
   sick hear the Song.
10. **Riders train outside** (the maydan). The drill court and the 120 m range are inside; the Maydan, the horse-archery
    track and the long shots are on the crest, with the remounts' paddock and the byres.
11. **There is always a hidden way out.** The Founder's Way runs from a stair in the Founder's Garden under the drill
    court and the west curtain to the brow's scrub (*proposed*).

## Who lives where (*proposed*; the owner's 600)

| Who | People | Where |
|---|---|---|
| **The professed in the eight companies**: forty brothers each and a captain | 320 + 8 | the company halls over the stables (T2) |
| **The chapter**: the Prior, the chant-master, the Song-singers who keep the hall and the drum day and night, the librarians, the old brothers back from the companies | ~65 | the great monastery's 49 cells (ten on M1, 39 on M2), the young singers two to a cell |
| **The officers**: the Marshal, the Cellarer, the Infirmarer, the Master of Novices and the two masters of arms | 6 | at their work (T1, T2) |
| **The Prismarch** and his secretary | 2 | the utse (U) |
| **Novices** | 150 | the novices' court (T1, T2) |
| **Lay brothers**: cooks, grooms, smiths, the bowyers and fletchers, the herdsmen | 50 | over the kitchens, the grooms' loft, the byres on the crest |
| | **~601** | |

**Horses** (*proposed*): 292 war horses in the north and south stables (stalls at 2.5 m, two rows in a 12 m range:
the manifest's count) and 35 in the Gate Stable for the officers, couriers and the Prismarch; some 300 remounts on the crest by day
and in the walled paddock by night; the milking herd at the byres.

## The floors in one table

| Sheet | Level | What it holds |
|---|---|---|
| T0 | the crest | the House, the barbican, the Strongwall road and the caravan halt; the north and south sally tracks down the flanks; the Maydan and the horse-archery track; the remounts' paddock, the hay barns and ricks, the byres, the great tank, the near corner of the commons; the two middens; the barley terraces west and south, the threshing floors, the tea garden, the hives; the thorn brake where the Founder's Way comes out; the beacon line east and the relay west |
| T1 | ground | the barbican, the Main Gate and its guards, the Sword Hall, the Marshal's Hall, the Gate Stable, the guest house; the stables of the north and south with their sally gates, hay sheds and garderobe turrets; the novices' court (school, refectory, the Little Armoury, the Hall of the Bow); the Great Refectory, the kitchens, the granary, the dairy; the Storm Tower (the west watch, its fuel store and stair), the smithy, the bowyers; the muster court over its great cistern, the lists, the archery range, the drill court; three corner stairs; in the inner ward the utse, the inner court with the oath stone, the monastery, the infirmary, the bath, the cistern, the Field of the Fallen, the Founder's Garden and Chorten, the Founder's Way; the 28 towers drawn grey as one entry |
| T2 | upper | the gate chamber and the gilt pavilion, the Bow Loft, the Quiver House, the Marshal, the grooms, the guests; the eight company halls and the captains' stairs up to the wall walk; the novices' dormitories and the masters of arms; the lay brothers, the Cellarer, the stores; the Storm Tower's signal room and the west watch's barrack, the armourers, the bow-curing loft; the infirmary's upper ward; the wall walk round the outer curtain |
| M1 | monastery, ground | the Gate of the Song, the porter's lodge, the Blade Room, the sacristy; the cloister court and the Wheel of the Storm; the kora ring (the cloister walks, the court's arms beside the hall, the passage behind it); the porch, the Assembly Hall, the Shrine of the Storm; the Library of the Song, the scriptorium, the tea kitchen; the old brothers' ten cells; the chapter house, the treasury, the store, the latrines |
| M2 | monastery, upper | the Drum of the Hours; 39 cells drawn one by one (front ranges on a corridor, side ranges on the gallery over the cloister roof); the Prior, the chant-master, the daughter house's guests on the gallery over the kora; the Masters' Gallery round the hall's void |
| MR | monastery, top | the Hall of Vigil round the light well under the gilt crown (the crown's pavilion is the hall's lantern); the Protectors' Chapel behind it, windowless; the lookout; the roofs with their stair heads, the prayer-flag masts and the incense altar (sang) |
| U | the utse | U0 the inner gate, its keepers, the runners; U1 the War Room and the raid ledger; U2 the Hall of the Banner and the balcony; U3 the audience room, the Prismarch's cell, his secretary; U4 his chapel, the roof terrace, the beacon |

## Finishes and the dress (*proposed*)

- **The monastery** is the kit's, in its violet dress (`QSPOKE[6]`: the walls, trim and band in the spoke's colour), the
  crown on the hall, the Song drum in the court.
- **The curtains, towers and gates** are the fort asset's. *Proposed:* the `march` dress (rubble under lime wash) with
  the twig band in violet instead of maroon, so the order's colour reads from the crest as Qiblai's rings do; dressed
  ashlar (`royal`) on the utse and the Main Gate.
- **Gold, and only here:** the Main Gate's gilt pavilion and the utse's chapel (the fort asset's rule, `PLAN.md` 5.5),
  and the holy crown on the Assembly Hall (the monasteries' crown, `kits/qiblai/PLAN.md` section 4). The rest is
  white, violet and timber: a soldier's house.
- **Inside:** butter lamps, the prayer wheels, violet silks on the hall's pillars; lamellar laced in violet; the
  catalog's Xanadu common set in the companies' halls, its court set only in the hall, the chapels, the utse's upper
  rooms and the chapter house.
- **Decor.** Sumptuous (4): the Assembly Hall, the Shrine of the Storm, the Protectors' Chapel, the Prismarch's chapel,
  the Founder's Chorten. Rich (3): the War Room, the Hall of the Banner, the audience room, the inner court, the
  chapter house, the Library of the Song, the Field of the Fallen, the Main Gate. Fine (2): the Marshal, the
  infirmary, the guest house, the refectory, the school. Plain (1): the company halls, the stables, the lofts, the
  workshops, the novices' rooms. Bare (0): stores, granary, towers, cisterns.

## For the fort asset (`size:'monastery'`, `PLAN.md` 5.4)

The owner's concentric answer means the fourth size is **two curtains**, not a ward in a line:
- an **outer curtain** (here 260 x 190 m) with corner drums and interval towers at about 30 m, ranges against it on
  every side (stables, barracks, workshops), a **Main Gate** with the gilt pavilion behind a **bent barbican**, and **two
  sally gates** on the flanks;
- an **inner curtain** (here 110 x 96 m) on a **4 m talus**, higher than the outer (12 m), with four drums;
- **the keep is the utse**, astride the inner curtain, with the inner gate through its base (a covered ramp);
- the inner ward takes **another kit's building** whole (`qb_monastery`, `o.v` 6) at its centre: the plan's rule "the
  keep stands clear of the curtain by at least 6 m" becomes "the hosted building stands clear of the inner curtain by
  at least 6 m".
- A **west front** toward the enemy with one great tower (the Storm Tower) and no gate.

## Lore (*proposed*, for the owner)

- **The Decree forbids war-making by its clergy** (`kits/qiblai/PLAN.md` 2a, "The Fall"). The Violet Storm's answer,
  *proposed*: it **makes no war; it keeps the Vale**. It never rides beyond the Rift's rim except in pursuit of a raid,
  and it takes no spoil but arms, which go to the Protectors' Chapel. The council can therefore keep a martial order
  without breaking the Song, and the order's founding is a story (the first raid the Vale could not bear).
- The **eight companies named for the eight winds** echo the eight spokes; the banner is the eight-spoked wheel struck
  through by lightning.
- The **oath stone** in the inner court: the vows are taken on it, and the companies touch it before a sally.

## Assumptions and open points

- The talus (4 m), the storeys (about 4.5 m in the ranges), the curtains (outer 9 m, inner 12 m), the utse (22 x 22 m,
  about 23 m) and the Storm Tower (about 20 m) are assumptions for the fort asset and the build to settle.
- The crest is flat (35 m a km): the sheet draws a rectangle; at 1:1 the outline may follow the crest's crown.
- The terraces: two fifths of the grain is 43 t in the sim's test year (`xan.tempest`); at about 1.8 t/ha on ground
  manured from 600 horses that is some 24 ha, which the west and south terraces of T0 hold.
- Water: no stream on the crest (the Kruk Warra's head is 16-18 km south). Roof water into the cisterns under the
  inner ward and the muster court; the great tank for the herds. About 25,000 m2 of roof at 990 mm gives some 20,000 m3
  a year against about 10,000 for the people and the horses.
- **Fodder is not in the sim yet** (an open point for `xan.tempest`). 327 stabled horses eat about 1,000 t of hay a
  year at 8 kg a day, and some 240 t of barley at 2 kg, which is more than the House's own grain (about 107 t). Two ways
  out, both *proposed*: keep only the duty companies' horses stabled and the rest on grass by rota (the barley falls to
  about a third); or give the House a fodder line in the tune (hay from the crest's meadows, barley up from Strongwall).
  Pasture: 600-odd horses and the milking herd want several hundred hectares; the West Arm (some 24 x 18 km) has them,
  so T0 draws only the commons' near corner.
- The brow lookout (879,1618) and its relay are 14 km west, off T0; they are fort-asset watch posts, sited at 1:1.
- The counts (eight companies of forty, the chapter of about 65, 292 + 35 stabled horses) are a starting point; the
  sim holds the House as one settlement of 600 (`xan.tempest`).
- The manifest counts every room at its full area except the crest sheet's zones; it does not dress open grounds.
