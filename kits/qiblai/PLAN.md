# The Qiblai kit: plan

A vassal building kit for **Qiblai**, the prayer-wheel faith's holy city on the sacred river Ālph: a temple city on a strict
grid, in a blockier but still ornate Xanadu. This plan is for the owner to approve before any code is written.

## The owner's answers (2026-11-11)

| Question | Answer |
|---|---|
| What is Qiblai politically | **The faith's holy city, run by a council of abbots** under the Sultan's suzerainty. No governor's palace. Pilgrims' circuits and ghats on the Ālph. |
| How big | **About 12,000** |
| The grid | **A mandala of nested squares:** concentric walled squares round a central temple mountain, cardinal gates, quarters by ring (clergy inside, guilds and lay folk outward) |
| The massing | **Tibetan cubes with gilt crowns:** battered white and red cubes, flat parapet roofs stacked in terraces; the ornament in bands, windows, gilt roofs and prayer wheels on the temples |

## 1. What is known

**On the map** (moved 2026-11-11; the owner: "by a river and near plentiful resources"):
- scale model 5.1 **px 922,1595** (`60-settlements.js`, id `skm4jjo2vl`; `SETT_MOVED['5.1e3']`). It was at 963,1566,
  which in the open world's data stands 65 km from any river, with no salt within 30 km.
- **At the cataracts of Nahr ash-Shalālāt**, the region's biggest river (~1,100 m³/s), ~1 km from the bank.
- In the open world, `openworld/xanadu-oidong-highrift`, region frame x -538 km, z +52 km. The ground is ~-1,900 m,
  Af, ~30 °C, ~990 mm.
- **Flat:** 37 m of relief over the 1.6 km square, so the mandala's terraces are steps of a few metres, not a hillside.
- **Within 30 km:** rock salt (236/255), potash, rare earths (190), saltpeter, copper (120), oil. Farmland 40%.
- **The Ālph**, the faith's sacred river (LORE.md:479), is ~75 km away: a pilgrimage road, not Qiblai's own river
  (section 9).
- The scale model's old note of a 331 m pad (`build_425_master.py:3413`) does not match the open world's ground at
  either spot.

**Today:** a ring of five farming villages and a ranch, 1,345 people in 228 buildings. There is no city page.

**The faith** (LORE.md §6.13):
- temples, monasteries and a pilgrims' circuit of prayer wheels;
- "no minarets, great prayer wheels instead";
- the sign is the eight-spoked wheel, in saffron and maroon, with turquoise and gold;
- the temple grammarians made a syllabary "on a sound grid for the prayer wheels";
- gold goes on everything religious;
- the faith has no named deity or order yet (LORE.md:1084).

## 2. Lore (proposed, for the owner to keep or change)

### 2a. The faith: the Decree (*Ḍikrī*), and the Broken Wheel it will mend

The owner chose both (2026-11-11): the Decree is the scripture, the Broken Wheel what the Song is for. Both are below.

**The idea in one line.** The Xanadui's scripture is the Ancient poem their land is named from, Coleridge's *Kubla Khan*,
kept for a thousand years by sound alone after the Latin letters were lost. The temple grammarians invented their
syllabary on a sound grid to write down **how the Song sounds**, not what it means. The History Monks keep the same poem as
a text, in English, with its author's name. That gap is the faith's whole drama.

It is Krator's own because:
- the lore already says *Xanadu*, *Alph* and *the Caves of Ice* are Ancient names from the poem (§6.13);
- the Historians already keep *Kubla Khan* (§6.15);
- the sound-grid syllabary already exists "for the prayer wheels";
- and **Qiblai is Kubla**: the Khan's own city.

**What the faithful believe** (each tenet a line of the Song, read devoutly):

| Tenet | From the Song | In practice |
|---|---|---|
| **The Decree.** The world was made right once, by decree: the Khan (*Qublā*) decreed the dome, and the Ancients, his builders, made it. | "did Kubla Khan / A stately pleasure-dome decree" | the faith's name; the Hall of the Decree at the city's heart; Qiblai is where the Decree was first spoken |
| **The Fall.** The Ancients heard "ancestral voices prophesying war" and did not heed them; the dome fell (the Cataclysm). | "Ancestral voices prophesying war!" | humility before the ruins; the faith forbids war-making by its clergy |
| **The Song restores.** The dome can be rebuilt "in air" by the Song sung whole: enough voices, enough turns, every syllable true. | "Could I revive within me / Her symphony and song… / I would build that dome in air" | **the prayer wheels**: each holds the Song in the sound-grid script, so each turn sings it once; the great wheels, turned by the Ālph's water, sing day and night. This is why there are no minarets: the faith does not call, it sings |
| **The Damsel.** The Song was given by a woman with a dulcimer, whom a seer once saw in a vision. | "A damsel with a dulcimer / In a vision once I saw" | the faith's prophet (*the Ḍāmsal*); the dulcimer is its holy instrument; the eight spokes of the wheel are the Song's eight *turnings* (its verses as the faith divides them) |
| **The sacred river.** The Ālph is the Song's river, running "through caverns measureless" to the sunless sea. | "Where Alph, the sacred river, ran" | the ghats at Qiblai; bathing and the river's water in the rites; the abyssal lakes (the "sunless sea") a holy dread |
| **The fountain and the caves.** Earth's breath, the geysers and steaming springs, is the Song breathing; the Ancient Caves of Ice are a relic of the first dome. | "A mighty fountain momently was forced" / "A sunny pleasure-dome with caves of ice!" | pilgrimage to the geysers and to the Caves of Ice (§6.13); **the Singing Gjár** is the holiest place outside Qiblai: there the Song is heard in the stone |
| **Holy dread.** The one who has tasted paradise is circled three times with eyes closed. | "Weave a circle round him thrice, / And close your eyes with holy dread" | **the kora is walked three times, eyes lowered**; honey and milk are the sacraments ("honey-dew… the milk of Paradise"), so the temple estates keep hives and dairies |

**Its colours and signs:** the eight-spoked wheel; gold as the "sunny dome" kept (hence gold on everything holy); the
dulcimer; the dome. The **sound-grid syllabary is holy writing**: a misspelled syllable is a false note in the Song, which
is why Qiblai's grid is strict (below).

**How it differs from the History Monks:**

| | The Decree | The History Monks |
|---|---|---|
| The poem | scripture, kept **by sound**; its meaning is revealed, sung, argued over | a document, kept **as text**, with its author and date |
| The Ancients | the Khan's builders, who fell for not heeding the voices | people to study, whose relics are to be hidden if dangerous |
| Time | a cycle of fall and restoration through the Song | the past to recover; time itself to be slowed (the Procrastinator) |
| Colour | gold, maroon, turquoise | saffron (the Order's) and the Order's blue |
| Practice | singing, wheels, kora, pilgrimage | contemplation, archive, containment, fieldwork |

**What that sets up:**
- **The Monks' secret.** Longsong's sealed library holds the poem's English text and the name of the man who wrote it. The
  Order has always judged that this does no good to tell; a quest could put it in the player's hands.
- **The council against the Sultan.** The Sultan's Pleasure Dome is "built for his feasts" (§6.13). To the council of
  Qiblai, a pleasure-dome built for gluttony, not by the Song, is close to blasphemy. The spendthrift Sultan, the empty seat
  in the Hall and a council that holds the faith's gold make Qiblai the Sultanate's quiet opposition.
- **The Procrastinator** looks like a giant prayer wheel with glowing glyphs (§6.15). Did the Monks build it on the faith's
  wheels, or did the faith copy its wheels from something the Monks hold? Either answer is a story.
- **Jimjam's day-keepers** count the sky. The Decree sings to the sky: two eastern ways of reading heaven, without a
  shared calendar.

**The Broken Wheel: the Song mends the Wheel** (the owner, 2026-11-11: "do both"). The Decree and the sky are one faith.
- Krator's sky holds **the Station**, the Ancients' broken wheel, which crosses the night out of step with every counted
  moon (§6.14; Jimjam does not count it).
- To the Ḍikrīn the Station is **the dome in air**: the dome the Khan decreed, built by the Ancients above the world. **The
  eight-spoked wheel is the Station as it was, whole**, and the faith's sign is its picture.
- **The Fall** is the Wheel breaking: the Ancients did not heed the voices prophesying war, and the dome in air broke.
  Its broken ring still crosses the sky as a warning.
- **The prayer wheels turn for it.** Every turn of a wheel is a turn the broken one cannot make, and each sings the Song
  once. When the Song is sung whole, every syllable true and enough voices, **the Wheel will be mended** and the world made
  right. The great wheels on the Ālph never stop, because the sky's wheel must not be left unturned.
- **The dome on earth** is the Song's other half: the "stately pleasure-dome" the Khan decreed on the ground. The Xanadui
  descend from **Theodiga**, the Ancient dam arcology at the valley mouth (§6.13), so Theodiga is that first dome on earth.
  This is *proposed*, and asks for Theodiga to be redesigned with a dome or a series of domes (the owner, 2026-11-11:
  "maybe"). Then the Sultan's Pleasure Dome is a copy of the holy one, built for feasts: the council's grievance has a
  model to point at.
- **The Station's passes are holy hours.** When it crosses overhead, the wheels are turned faster and the kora is walked.
  When it goes dark in Krator's shadow (Jimjam's ill omen at a birth), the Ḍikrīn sing louder, not quieter.
- **The Monks' Ear** can point at the sky (§4). What the Historians see of the Station is the second thing they do not
  tell Qiblai.

**Names in Xanadui** (proposed; the language's sounds, §6.13):
- *Ḍikrī*, the Decree, and *Ḍikrīn*, its faithful;
- *Qublā*, the Khan;
- *the Ḍāmsal*, the Damsel, and *ḍalsimar*, the dulcimer;
- *Ālph*, the river;
- the Song: *Gīt*.

Scripture is cited with the evidential *-se* ("they say"), the Monks' margin mark "inferred" against it.

### 2b. The city

- **The city is the sound grid made in stone.** The grammarians' syllabary sits on a grid of sounds. Qiblai's plan is that
  grid: each ring a vowel, each cross-street a consonant, each block a syllable. A pilgrim walking the kora "reads" the
  city's prayer. This is why the grid is strict: a crooked street would misspell it.
- **The council of abbots** sits in the Hall of the Decree in the inner square. One abbot comes from each of the eight great
  monasteries, one for each spoke of the wheel. The Sultan's suzerainty is a seat kept empty in the hall and a yearly
  exchange like Longsong's: a grant of fealty answered by grants of esteem.
- **The river is the ninth spoke:** the processional way leaves the east gate for the ghats at the cataracts of Nahr
  ash-Shalālāt. The pilgrims' road goes on to the Ālph, ~75 km away.

## 3. The plan of the city

**The module.**
- Xanadu's garden tiles snap to 8 m (`85b`), and the grid takes that up: **a block is 96 m (12 modules), a street 12 m, a
  pitch of 108 m**.
- At ~12,000 people, the outer square is **15 × 15 blocks, ~1.6 km a side**. The rings are concentric squares of blocks
  (*est.*, to be fitted to the population):

| Ring | Blocks (from the centre) | What stands there | People *est.* |
|---|---|---|---|
| **0: The Temple Mountain** | the central 3 × 3 (~320 m square) | the great temple on its stepped platform; the Hall of the Decree; the treasury; the great prayer wheel house | ~400 (temple staff, keepers) |
| **1: The inner square, the clergy** | ring 1 (16 blocks) | the eight great monasteries (one a spoke); the colleges of the grammarians; the council's offices | ~2,400 monks, novices and lay servants |
| **2: The kora square, pilgrims and guilds** | ring 2 (24 blocks) | **the kora**, the pilgrims' circuit: a ring street lined with prayer-wheel arcades and chortens at every crossing; pilgrims' hostels; the Goldsmiths', Masons' and Spicers' halls; four gate markets | ~3,000 (and ~1,000 pilgrims at the festival) |
| **3: The outer square, lay folk** | rings 3-5 (the rest) | row houses on party walls (poor, middle, rich), workshops and the trades, bakeries, baths, wayside shrines | ~6,000 |
| **Outside the wall** | | the **ghats** at the cataracts of Nahr ash-Shalālāt (east gate), chahar-bagh gardens and the temple estates' farms, the caravanserai on the Erehwon road, the ranch | |

**The walls and gates.**
- Each ring is walled: low walls with gate towers on the cardinal axes inside, a full wall on the outer square.
- The four cardinal avenues run straight from the gates to the Temple Mountain.
- The axis is **true north** (the mandala's), not the river's. The ghat way leaves the east gate on its own line down to the
  Ālph.

**The slope.**
- The site at the cataracts is nearly flat: 37 m of relief over the 1.6 km square. So the terraces are **built up, not
  cut**. Each ring stands on its own level platform, one to three steps (2-6 m) above the ring outside it.
- The city rises toward the Temple Mountain on made ground, the terraces stacked as the massing asks.

**On core/city.**
- core/city has no orthogonal-grid strategy (`core/city/README.md`: alleys, frontage-courts and radial).
- Qiblai's plan is a **site** (steps 0-5: the zone, the Temple Mountain as a landmark, the rings as districts, the avenues,
  the walls) drawn as a nested-squares grid. Its blocks are filled by `frontage-courts` on given polygon blocks, the
  strategy Ys uses.
- A small `grid` / `mandala` site generator would be new core/city work. **That module is another session's**
  (`core/city/PLAN.md`), so this plan asks for it rather than writing it (section 7).

## 4. The style: Tibetan cubes, gilt crowns

Drawn from the Xanadu kit's vocabulary (`settlements/xanadu/DESIGN.md`, `API.md:86-118`). Blockier means:

| Xanadu does | Qiblai does |
|---|---|
| battered walls (`xnWall`, `xnStack`) | a lighter batter (2-3%), crisp cube corners, every volume a box |
| mixed massing: Turkish cumba, Andean paint, Persian domes | **cubes stacked in terraces**; no cumba overhangs, no Andean paint; domes only on the Temple Mountain |
| flat roofs, gilt hip roofs on rich and sacred | **flat parapet roofs everywhere**; **gilt crowns** (pavilions, finials, wheel-and-deer, banners) only on temples, monasteries, gate towers and the kora's chortens |
| windows free in the wall | black trapezoid windows (`xnTibWin`) in **strict rows and columns** (the grid down to the window) |
| the maroon twig band (`xnBand`) on the great buildings | the twig band on every monastery and the kora's buildings: **the colour shows the ring** |
| jharokha, jali | jharokha on rich houses only; jali in the monasteries' cloisters |

**The colour of the rings:**
- white wash on the lay quarters;
- **red** (maroon and redwall) on the monasteries of the inner square;
- saffron trim and turquoise tiles on the kora;
- gold on the Temple Mountain.

From the air the city reads as nested squares of colour.

**The ornament, concentrated:**
- bands, parapet friezes, gilt roundels, prayer-drum rows (`xnXDDrums`);
- **great prayer wheels** (`xnXTBigWheel`) in wheel houses at the kora's corners and gates, instead of minarets;
- the eight-spoked wheel on gates and roofs.

## 5. The building list

Each item is a `VERN.def` record with the `qb_` key prefix and `culture:'qiblai'`, keeping to the Xanadu budget: 60k
triangles for an ordinary building, 250k for the largest.

| Group | Buildings |
|---|---|
| **The Temple Mountain** | the great temple (a stepped platform of three cube terraces, a gold-roofed sanctum, the central dome); the Hall of the Decree; the treasury; the great wheel house |
| **Sacred** | a great monastery (cloister court, assembly hall, cells; one a spoke, 8 dressed variants); a college; a gate temple (4); a chorten (crossing marker, 3 sizes); a prayer-wheel arcade (kora segment, a straight and a corner piece); a wheel house; a wayside shrine (the gap in `XA_TRADES`) |
| **Pilgrims** | a pilgrims' hostel; a caravanserai (the gap in `XA_TRADES`); the ghats (stepped stone stairs to the water, bathing platforms, a ghat shrine) |
| **Civic** | the four gate markets (an arcaded square); ring walls and gate towers (straight, corner, gate); baths; a granary of the temple estates |
| **Guilds** | the Goldsmiths', Masons' and Spicers' halls (and the Farmers', Miners' and Alchemists' as smaller lodges) |
| **Houses** | row houses on party walls in three wealth classes, 2-4 storeys, each a cube with a roof terrace; a corner house; a courtyard house for the rich |
| **Trades** | bakery, butcher, weaver, brewhouse, tannery (the `XA_TRADES` gaps), plus a Xanadu trades-table building for each of the census's trades on a grid frontage |

## 6. The vassal contract (`settlements/iziz/VASSAL-KITS.md`, applied to Xanadu)

- **The engine:** `VERN.def` through `XA.def`'s helpers (the Xanadu kit is on `VERN.def`, `72-xa-helpers.js:14-17`). Qiblai's
  own helpers take the prefix `qn*`; its seed block is **33000-33999** (the Xanadu kit already uses seeds up to 32951; nothing in a kit or
  settlement uses 33000+).
- **The clash rules:** storey heights, plinth, ground and front, footprint classes and the wealth tags match Xanadu's, so a
  Xanadu building and a Qiblai one stand on the same street. **The mixed-street row on the sheet** proves it
  (`verify --assert`).
- **The material bridges:** Qiblai is drawn in the Xanadu pack (`settlements/xanadu/materials.json`: wash, redwall, maroon,
  gold, the tiles, the twig band). New sets only where the look needs them; candidates are below, and they go to
  `core/materials/PROMPTS-NEEDED.md` on approval.
- **The shared accent:** gold, the faith's.

## 7. Build, phases and what it reaches

**The route.** `settlements/xanadu/build.py` has no `--kit` option (only `--target`). Give it one, as Iziz's
(`settlements/iziz/build.py:180-188`): `kits/qiblai/build.py` runs the port lint, then the Xanadu build with its `src/`
merged in. Its sheet is a Xanadu page: the kit's buildings, the mixed street, the inspector and the polygon tool.
`kit_bundle.py` seals it for a world page, as `XAK` is, so the open world's Qiblai can draw it.

| Phase | What |
|---|---|
| Q0 | scaffold: `kit.json`, build and verify wrappers, the `--kit` option in `settlements/xanadu/build.py`, the contract table, `PORT.md`, `INDEX.md` |
| Q1 | the helpers (`qn*`: crisp cube, parapet, terrace stack, window grid, ring colour), the materials bound, the profiles |
| Q2 | the houses: the row house in three wealth classes, the corner house, the courtyard house; the mixed street |
| Q3 | trades, guild halls, markets, baths, the caravanserai, the granary |
| Q4 | sacred: monasteries, college, gate temples, chortens, the kora's arcades and wheel houses, wayside shrines, the ghats |
| Q5 | the Temple Mountain (great temple, Hall of the Decree, treasury, great wheel house); walls and gate towers |
| Q6 | catalog furniture (`kits/catalog` Xanadu culture: the prayer wheels exist) and interiors for the monastery, the hall and the hostel |
| Q7 | the city: the nested-squares site on core/city (the grid generator asked of the core/city session) and the infill; the open-world site at Qiblai with its ring re-planned; the bundle, Godot export, gallery |

**Who else this touches:**
- `settlements/xanadu/build.py` gets the `--kit` option. Its own page must come out byte-identical (proved by the
  baseline).
- New forms that Xanadu itself would want (a crisp-cube helper, the window grid) could go upstream into `kits/xanadu`
  later. They start in Qiblai's own files.

## 8. The economy (for the simulation proposal, `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md`)

**What 12,000 eat.**
- At 180 kg of grain a head, 12,000 need ~2,160 t a year (more at festival).
- Qiblai stands at the cataracts of Nahr ash-Shalālāt in a hot, wet lowland (Af, ~30 °C, ~990 mm), with farmland at
  40% within 30 km: real farming country, likely with two crops a year. Take ~1.8 t/ha and the isle demo's 0.75 ha in
  crop a hand: a farming village of 240 has ~40-60 t to spare *est.*
- **Salt is now in reach:** rock salt at 236/255 within 30 km.

**Where it comes from.**
- The temple estates and the villages that owe them must hold **~30,000 people in 100+ villages** *est.*, or Qiblai buys
  grain in from the Ālph's valley at large.
- Today's ring of 1,345 feeds a tenth of the city.
- **Pilgrims and the faith's offerings are Qiblai's export:** gold, books from the grammarians, wheels, incense.
- **Salt is local:** rock salt within 30 km, since the move to the cataracts.

This is the open world region's next re-plan when Qiblai's city goes on its ground.

## 9. Still open

1. **The faith** is the Decree and the Broken Wheel together (section 2a). Still to name: the eight monasteries and the
   council's title. **Theodiga's domes:** a redesign of `kits/ancients/targets/theodiga` with a dome or a series of
   domes, so it can be the Song's dome on earth.
2. **The textures,** if the Xanadu pack is not enough. Candidates:
   - dressed ashlar for the terrace platforms and ring walls (the pack has rammed earth, stucco and rubble);
   - a beaten-gold roof sheet distinct from Xanadu's gilt;
   - prayer-wheel copper with worn mantra relief.
3. **The upstream question:** do the crisp-cube forms go into `kits/xanadu` once they work, or stay Qiblai's?
4. **The river:** is Nahr ash-Shalālāt holy in its own right (a sister of the Ālph, or the Ālph's name carried down), or
   is the Ālph only a pilgrimage 75 km away?
5. **Qiblai and Longsong:** the Monks are not of the Decree (section 2a); how much do the two talk? The road between them is 568 km.
