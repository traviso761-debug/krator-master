# The Rare Devisers' camp at Godshearth: a site plan (proposal, 2026-11-16)

The owner, 2026-11-16 (in the Thalaba session): *"can you make the expedition's semi-permanent main camp as its own
settlement?"*

What is settled, from the owner, the lore and the sim:
- **The Rare Devisers** are the merchant house with the royal licence in scrap and rare artifacts; their main house is at
  Theodiga (`LORE.md`, the three merchant houses). They run the summer expedition into Godshearth from Thalaba
  (`settlements/thalaba/PLAN.md` section 2).
- **The owner: "the Devisers' people from Theodiga run the show, but many of the hired men are locals."**
- **The camp in the sim** (`core/region/data/xan-tune.js`, `T.expedition`, `exp.godshearth`):
  - a separate settlement of **150** (faction `devisers`, home `devisers.thalaba`), at px **828,1380**, **200 km** by road;
  - its make in the expedition window: **90 t of sulfur, 40 t of hearth wax and 60 rarities**;
  - it eats **28.5 t** (camp diet, 190 kg a head), bumped onto Thalaba;
  - the Sultan takes **10 % of the haul and 20 % of the rarities** (the owner), counted out at Thalaba when it comes home.
- **The Dalab mission's party** (40, the owner: "they do their own expedition and hire locals") works the Grove (Godshearth
  station 2) and **pitches its own camp, apart from the Devisers'** (`settlements/thalaba/PLAN.md` section 4).
- **On Thalaba's page** (step T5, 2026-11-16) the expedition's hands already muster at Briḍj in spring, are away up the
  gorge all summer and unload for the count in autumn (`settlements/thalaba/targets/town/89zu-tb-people.js`).
- **Godshearth's own plan** (`biomes/godshearth/PLAN.md` section 5): "nobody lives in the caldera". A seasonal post would be an
  NPC settlement placed with `core/hamlet` or `core/camp`, "not built by this kit".

**The owner's answers to this plan's questions (2026-11-16):**
- **The site: the hot lake's outlet, px 839,1398** ("Yes, the outlet"). The tune's camp moves there
  (`T.expedition.px` [839,1398], `km` 130), and Thalaba's expedition road in the open world now ends at the camp.

Everything below that is not one of those is ***proposed***.

## 1. The site

### The tune's px is a poor camp

The tune's **828,1380** reads (scale model 5.1, `tools/scale-model/model/data`, this branch, with the re-made lake):

| | px | Height | Mean | Rain | Slope | Water |
|---|---|---|---|---|---|---|
| the tune's camp | 828,1380 | 4,217 m | 6 °C | 392 mm | 1.9° | none within 32 km |

That is the slump collar's bench (4,180-4,860 m, `biomes/godshearth/PLAN.md` section 1) under the west wall, not the floor:
- it is dry, cold and high;
- it is 23 km from the Grove, 43 km from the hot lake and 47 km from where the road comes up out of the gorge;
- no river runs within 36 km.

The tune calls its camps' px approximate. This one looks like a placeholder.

### The lake's outlet, px 839,1398 (**the owner's choice**, 2026-11-16)

The floor was searched (2 km cells, x 826-860, y 1378-1412) for dry, flat ground off the hot lake's hot margins, near:
- the road's way in;
- the river;
- the lake;
- the Grove.

The best cell is **px 839,1398**:

| | px | Height | Mean | Rain | Slope | From it |
|---|---|---|---|---|---|---|
| **the camp (proposed)** | **839,1398** | **3,625 m** | 7 °C | 925 mm | 0.5° | on the Āirã Siṭrīm (0.2 km) |
| the hot lake | 837-842, 1392-1396 | 3,642 m (level) | 7 °C | 925 mm | | its south shore 4 km |
| Godshearth station 1, the Hot Lake | 844,1394 | 3,645 m | | | | 13 km |
| the lava tube's end (`tube_god_ssw_14`) | 843,1398 | 3,624 m | | | | 8 km |
| station 2, the Grove (the hearth forest) | 836,1388 | 3,740 m | 6 °C | 910 mm | | 21 km |
| station 3, the North Wall | 848,1375 | 4,120 m | | | | 50 km |
| station 4, the Spillway | 845,1422 | 3,380 m | 9 °C | | | 50 km down the gorge |

**Why here:**
- **The road arrives here.** The Āirã Siṭrīm (`r_gh_spillway`, 126 km, 51 m wide) leaves the hot lake at its south-west
  corner (837,1396) and runs down the spillway gorge to the cataract. The expedition road climbs the gorge beside it. At
  839,1398 the road comes up onto the caldera floor, 112 km by the river from the cataract's top and about **130 km from
  Thalaba**. That is five or six days with the cataract, not the tune's 200 km.
- **Water and flat ground.** The camp stands on the river 0.2 km below the outlet: the lake's overflow, warm at the outlet and
  cooling down the run (*proposed:* drinkable once it has run a few kilometres; the owner's to say). It is above the lake's
  hot margins, on a floor of 0.5°.
- **The works lie round it:**
  - the hot lake's fumarole lines and sinter (the sulfur);
  - the Grove (the hearth wax);
  - the lava tube's mouth, 8 km east.
- **A day's walk.** Everything the camp works is within a day's walk, out and back from one base.

### The country round it

- **Climate.** The floor is temperate by day and freezing at night: the owner's climate for Godshearth (2026-11-09: mild
  days, frosty nights), +7 °C on the model.
- **Air.** Godshearth's plan gives the floor's stations 1.00-1.05 atm (section 7), the caldera's own figures, not the
  thin air of 3.6 km elsewhere.
- **Ground and plants.** Cool meadow and frost-hardy turf on the floor, between the vent discs. The Hearths' discs (25-60 °C
  ground) begin at the vent lines.

## 2. Who is there

The tune's 150 in the expedition season. *Proposed* shares, from Thalaba's plan (section 2) and its page (T5):

| Who | People | What they do |
|---|---|---|
| **The Devisers' own** | 30 | The master of the expedition, the clerks and the assayer of rarities, the guides and the guards. They hold the strongroom and the tally. |
| **The hired men** | 120 | Mostly Thalaba's, a few from the north shore: diggers at the fumarole lines, wax-gatherers in the Grove at dawn, porters, muleteers, cooks. They are the people Thalaba's page sends up in summer. |
| ***Proposed:* the winter keepers** | 6-8 | A storekeeper and a few guards over the stores and the strongroom through the winter. The owner's choice: the camp kept by a few, or left empty. |

The **Dalab party** (40) camps at the Grove, apart: section 3, and question 6.

## 3. The layout (*proposed*)

A **semi-permanent camp**: a core of stone that stands all year, and a field of tents pitched round it each summer.

**The stone core** (the Xanadu kit's buildings and the camp's own pieces, as Thalaba's are):
- the **counting house** with the **strongroom** of the rarities beside it (the Devisers' clerks and assayer);
- the **sulfur sheds** and the **wax store**, long low stone sheds where the loaves and the wax wait for the mule trains;
- the **outfitting yard** with its corrals and the **mule pens** (the trains up from Thalaba);
- a **watch tower** on the rise above the river, over the road and the lake;
- a **bathhouse on the warm outlet water**, the camp's one comfort (*proposed*);
- a **shrine of the Decree** at the gate, where the expedition is blessed on arrival.

**The tent field.** The hired men's tents are pitched in rows on the flat ground south of the core, on the river:
- the **Tents kit's** Xanadu dress (`kits/tents`: `tn-<form>-<size>`, the Xanadu silk dress for the Devisers' own, a plain
  dress for the hired men);
- the cook fires and the latrines downstream.

**The ways:**
- the **expedition road** up the gorge, arriving at the core's gate;
- **tracks** out to the hot lake's fumarole lines (4 km), the Grove (21 km) and the tube's mouth (8 km).

**The Dalab party's camp** at the Grove (836,1388), 21 km north-west, apart from the Devisers' (the owner): a ring of the
Tents kit's tents round a seed store. Whether it is a settlement of its own is question 6.

## 3a. The names (*proposed*, in the Xanadui coined style of Thalaba's Briḍj, Salphar and Siṭēps)

| Place | Proposed | Meaning |
|---|---|---|
| the camp | **Kāmp** | "the camp", as the hired men call it |
| or, by the house's name | **Ḍēbhāizarz' Kāmp** | "the Devisers' camp" |
| the outlet | **Āuṭlēṭ** | "the outlet", where the Āirã Siṭrīm leaves the lake |
| the bathhouse | **Bāṭh** | |

## 4. The economy (in `XAN_TUNE` as it stands; *proposed* changes marked)

- **The make** (the tune, `T.expedition.make`): 90 t of sulfur, 40 t of hearth wax and 60 rarities in the window.
  - The sulfur comes from the fumarole lines round the hot lake (Godshearth's plan, section 8: "sulphur and copper sulphide at
    the fumarole lines", `kits/resources`).
  - The wax is the hearth trees' tallow beads, gathered off the stalks at dawn in the Grove (`biomes/hearths` section 9,
    `kits/crops` zone `hearths`).
  - **The rarities' source is not settled** (question 4): Godshearth holds no ruin. *Proposed:* the lava tube's mouth
    (`tube_god_ssw_14`, the Godthrone SSW Shield's pyroduct, 8 km east) and the sinter aprons.
- **The food** (the tune): 28.5 t a season (190 kg a head), carried up by mule from Thalaba, bumped onto the town.
- **The haul down:** by mule train to Thalaba's Devisers' house, where the Sultan's share is counted.
- ***Proposed* changes to the tune** (step C0, through the tune):
  - `T.expedition.px` to [839,1398];
  - `km` to 130.
  - Neither moves the make; the shorter road makes the trains' cost smaller.
- **The calendar** (question 5):
  - The tune's `expedition` window is year days 120-240. On core/clock's year (`KCLOCK.YEAR`, southern, summer centred on year
    day 350) that is the **winter**. The tune passes no latitude, so all its windows (the harvest at 150-200, the silk's
    spring rearing at 60-120) read like a northern year on core/clock's southern one.
  - Thalaba's page uses the plan's season instead: the muster in spring at year day 290, away from 297 to 45.
  - One of them has to change, and it touches every window in `XAN_TUNE`, not only this camp.

## 5. Core adoption (to write in full before the first fragment)

| Need | Take | Notes |
|---|---|---|
| the ground | the scale model 5.1, bicubic round the pin, as Thalaba's page (`gen/69u`) | the floor, the outlet, the river's first reach, the lake's south shore |
| the hot lake, the outlet, the river | `core/water` (`WATER.still`, `WATER.flow`), the geyser kit's hot-pool ramp (`biomes/geyser`, read in place) for the lake's warm margins | as Godshearth station 1 draws the lake |
| the buildings | the Xanadu kit (`kits/xanadu`: warehouse, granary, pens, smithy, the guild halls) and the camp's own pieces on its contract (`XA.def`), as Thalaba's `tb_*` | the counting house and strongroom, the sheds, the tower, the bathhouse |
| the tents | `kits/tents` (`tn-*`, the Xanadu dress) through `core/camp/50-camp-tents.js` | the rows of the tent field |
| the layout | `core/camp` (`KCAMP.pitch`) for the tent field, with an expedition program; the stone core placed on its records | **a `core/camp` program for an expedition is new** (its programs are the Beast Riders' bands): a proposal for that module |
| the flora | the Hearths kit (`biomes/hearths`, `HEARTH`) read in place, as Godshearth's stations read it; the floor's meadow from the Godshearth host | |
| the people | `core/simulation` as on Thalaba's page: the same people (Thalaba's hands, by id) present here in the window, away the rest of the year | |
| the sky, the light, LOD, tags, rand | `core/atmos`, `core/lod`, `core/tags`, `core/rand`, as every build | |
| the resources | `kits/resources` (`KRES`): the fumarole lines' sulfur node (the camp's own lode record, through the resource-nodes session) | |
| the open world | the region's site record (`openworld/SITES.json`, `model: false` until the scale model lists the pin) | **the corridor up the gorge** (planned to the Spillway, 845,1422) **would run on 24 km to the camp** |

**The page** (question 8, *proposed*):
- a target on Xanadu's page, as Thalaba's is (`settlements/xanadu/build.py --kit`), its ground the scale model's;
- the Hearths kit's plants read in place;
- the alternative is a target on Godshearth's own page, with the Xanadu kit bundled (`XAK`), as the region's villages draw it.

## 6. Steps

| Step | What | Test |
|---|---|---|
| **C0** (part done, 2026-11-16) | **The records** (through the scale-model session's queue and the tune): the camp's pin (**done** on claude/openworld-sites-24defd: `sdevcamp0001` in `SITES.json`, `model: false`, reach 6 km, and the corridors Thalaba-Spillway-camp, 10 km wide, for the region's recut; the pin queued with the scale-model session), `T.expedition.px` and `km` (**done**: [839,1398], 130 km), the calendar's answer (question 5) | `test-xan-economy.js` unchanged but for the trains' road; `cut_site.py --dry` lists the camp |
| **C1** | **The camp's own pieces**, on the Xanadu kit's contract: the counting house and strongroom, the sulfur sheds, the wax store, the tower, the bathhouse, the shrine at the gate; a pieces sheet | the pieces sheet's GPU verify |
| **C2** | **The ground and the water**: the floor round the outlet from the model; the hot lake's south shore, the outlet and the river's first reach on core/water | `on-the-model`, `water-on-core` |
| **C3** | **The camp laid**: the stone core, the tent field (the Tents kit, `core/camp`), the tracks to the works | the camp's checks: everything on good ground, apart, the tents in their rows |
| **C4** | **The people**: the 150 in the window (Thalaba's hands by id), the winter keepers (question 3), on `core/simulation` | the sim's schedules: present in the window, away out of it |
| **C5** | **The open world**: the camp's site in the region's recut; the expedition road on to it (core/world 48s `ways`, Thalaba's spec) | `bake_sites.py`; the region's verify |

## 7. Questions for the owner

1. ~~**The site**~~ **Answered (the owner, 2026-11-16): the lake's outlet, px 839,1398** ("Yes, the outlet").
2. **The name:** Kāmp, Ḍēbhāizarz' Kāmp, or another?
3. **The winter:** is the camp kept through the winter by a few keepers (proposed 6-8), or left empty and locked?
4. **The rarities:** what are Godshearth's rarities, and where do they come from? The lava tube's mouth (proposed), the sinter,
   or something the lore has not said yet?
5. **The calendar:** the tune's expedition is year days 120-240, which on core/clock's year is the winter (and so are its
   harvest and its other windows). Should the tune's year be turned to the southern seasons, or should core/clock read the
   Sultanate as northern? Thalaba's page uses spring-to-autumn for now.
6. **The Dalab party's camp at the Grove:** a settlement of its own as well, or a tent ring drawn on the Grove's station page?
7. **The bathhouse on the warm outlet water:** yes or no?
8. **The page:** a target on Xanadu's page (as Thalaba), or on Godshearth's (with the Xanadu kit bundled)?

## 8. Found on the way (for the sessions that own them; not changed here)

- **`XAN_TUNE`'s calendar** reads as a northern year on core/clock's southern one (question 5). That is the region economy's
  to fix, with the owner's answer.
- **The open-world corridor up the gorge** (the openworld-sites session, 2026-11-16) ends at the Spillway (845,1422). If the
  camp is placed at 839,1398, the corridor and Thalaba's `ways` road go on 24 km to it.
