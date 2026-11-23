# The Flashing Eye: the Order of the Flashing Eye's head house on the east volcano

A blueprint on the large-buildings method (`painting-to-3d-world`, `references/large-buildings.md`: Part 1 for the rooms,
Part 2 for the layout as data). It runs on the generator that the Voth, Iziz, Longsong, Erewhon, Tempest and Beacon
blueprints share (`settlements/voth/palace/blueprint.py`), with Longsong's Xanadu key map and programmes. The site, the
Order, the people, the signals and the economy are in `PLAN.md`.

**From the owner and the lore** (everything else here is *proposed*):
- The owner, 2026-11-16: the **east volcano** of Erewhon's lake, a cliffside house on the cone **facing the Rift**; the cone
  gets a vent that **flashes** (Strombolian, red at night); the cliff band is **authored on the page**; about **320**; the Eye
  keeps the council's **mirror line by day** and is **the relay between the Beacon and the capital**, which reaches it
  through the Beacon's **Rim Post** (856,1532).
- The crimson monastery's dress is the Qiblai kit's `QSPOKE[0]` (crimson walls, saffron trim, the oxblood band). The holy
  crown is the monasteries' (`kits/qiblai/PLAN.md` section 4). The Decree forbids war-making by its clergy.

## What is here

| File | What |
|---|---|
| `src/30-fe-layout.js` | **the layout** (`[G data]`): the frame at the Lip (881,1527.1), the crater, the band, the zones, the walls, the gates, the links, the parts with their footprints, beds and fires, the ways (with heights), the sights, the line, water and the census |
| `src/31-fe-rules.js` | the rules as plain functions (`FLASHING_EYE.checks`, `reach`, `area`, `water`, `toPx`) and the page's ground (`FLASHING_EYE.ground`: the bench, the band, the crater) |
| `test-flashing-eye.js` | `node settlements/flashing-eye/test-flashing-eye.js`: every rule passes on the layout and fails on a copy broken in its one way; the tune's px and people; the ground is sign-safe and meets the model (66 checks) |
| `layout_dump.js` | the layout, its area, water, checks and the axis profile as JSON (what the generator draws from) |
| `tools/sights.py` | the sights on the scale model (the method of `PLAN.md` section 3) |
| `flashing_blueprint.py` | the sheets and `FURNITURE.md`. It refuses to draw if a rule fails |
| `floors/` | the sheets below |
| `FURNITURE.md` | the manifest: every room's pieces, the totals, and the pieces the catalog lacks (**NEW**) |

```
node settlements/flashing-eye/test-flashing-eye.js
python settlements/flashing-eye/flashing_blueprint.py
```

## The sheets

| Sheet | What |
|---|---|
| **E0** | the cone from the crater to the band's foot (3 x 2.2 km): the crater and its vent, the Open Kora, the Eye Post, the Way of Breath with its chortens and the Halfway Shelter, the terraces, byres and woodlot on the cap, the bench, the Lip, the Cleft Stair, the mule road round the band's west end, the head of the Stair of the Eye; the sights from the Mirror Hall's balcony and the Eye Post |
| **E1** | the bench's ground floor behind its wall (144 x 180 m): the Lip Range on the Lip, the Red Monastery and its court, the Hall of the Ember on the axis, the Mule Court and its ranges, the chapter range, the novices' court, the Mirror School, the Pilgrims' Court; the three gates; the lower kora |
| **E2** | the upper storeys: the dormitories, the infirmary's upper ward, the novices' school, the Mirror School's code room, the Veil Room over the Gate of Breath |
| **M1, M2, MR** | the kit's great monastery whole (`qb_monastery`, `o.v 0`) in the crimson dress: the Gate of the Open Eye, the Assembly Hall under the gilt crown, the Shrine of the Eye on the axis, the Watchers' Chapel |
| **L** | the Lip Range (120 x 14 m), four floors side by side: L-2 and L-1 in the band's top (the Vault of Breaths, the readers' gallery with windows in the face), L0 at the bench (the Mirror Hall and its balcony, the reading room, the guest hall, the audience hall), L1 (the Master of Mirrors, the guest chambers, the Prismarch's cell, oratory and mirror room) |
| **H** | the Hall of the Ember (20 x 16 m), two floors: the porch, the hall, the gilt sanctum with its north window on the plume; the gallery and the Book of the Ember |
| **P** | the Eye Post (8 x 8 m, 12 m), four levels: the watch room, the rim's Book of Breaths, the mirror room, the platform with the 60 cm heliograph and the fire basket |
| **T** | the towers (the revamp, 2026-11-23): four floors each of the Mirror Tower, the Labrang Tower and the Ember Tower's shaft |
| **F** | the Foot House at the spur's foot (60 x 80 m): the pilgrims' hostel (120 beds), the mule stables, the stores, the muleteers |
| **section** | along the spur: the whole profile from the crater to the apron (heights x2, the model's line dashed), and the bench and the band (the Lip Range's floors in the rock, the monastery, the Hall of the Ember, the face and its talus) |

## The rules the layout keeps

Section 2.3 of the plan, each with a negative in the test:
- every part in its zone; no two parts on one level overlap; no building in a wall; every gate on its wall;
- every zone reached from the Foot House; **the mules reach the bench without the Cleft Stair**; the rim from the bench;
- the monastery 4 m clear of the walls, its gate to the south;
- **the Lip Range on the Lip** (its front within 3 m of the Lip, 110-130 m long); **nothing else within 12 m of the Lip**;
- **the Hall of the Ember on the axis**, north of the monastery, the crater within 3 degrees of its north window;
- **no building in the crater**; the rim's buildings within 80 m of the rim;
- the ways at 10 % or less (the Cleft Stair excepted); each way runs from what it serves to what it serves;
- **the pilgrims stop at the Threshold Chorten**, 25 m or more outside the rim;
- the balcony and the Eye Post see the Beacon, Erehwon and the Tears' camp by 10 m or more; what neither sees is reached
  through one they see; **the line** (the Beacon, the Rim Post, the Eye, Erehwon; the Eye, the Beacon, G1, Qiblai) clear by
  10 m at every hop;
- **no oil burned on the mountain**: every fire is the Ember's or the fire basket's;
- the roofs and courts give the year's water, the cisterns hold 90 days;
- **gold only on the Assembly Hall's crown and the Ember's sanctum**;
- **everyone has a bed**: 280 on the bench, 40 at the Foot House (the tune's 320);
- the band is 100-300 m high (the owner's range), about 1.5 km long, its face turned 163-197 degrees.

## What is assumed

- **The ground.** `FLASHING_EYE.ground` patches the model's surface (the bench filled, the band cut, the crater). Until the
  scale-model session cuts the vent (step F0) the page draws the crater from the layout; the section's model is a stand-in
  surface with the spur's slopes, not the region cut.
- **The storeys** are about 4.2 m; the Lip Range's two lower floors are cut into the band's top.
- **The Foot House** is drawn on its own sheet; it is 6.6 km south of the bench, off the page's near ground.
- **The furniture counts** are a brief for the furnisher (the generator's programmes), not a placement: they run high,
  as the Beacon's do.

## Pieces the catalog lacks (NEW)

Seven are new here: the Eye Post's 60 cm heliograph, the fire basket, the Ember's hearth, the Book's lectern, the mirror
bench, the crimson banner and the veil rack. Four are shared with the Beacon's and the Tempest's lists (the signal
lectern, the hour drum, the reader's seat, the 30 cm signal mirror). `FURNITURE.md` describes each.

*Built 2026-11-23*: all eleven are in `kits/catalog/krator-master-furniture-xanadu.js` (the four shared ones as the Beacon's B8
made them); `flashing_blueprint.py` keeps the list as `NEW_BUILT` and marks nothing NEW. The page's interiors are built on sheets
L, H and P (`src/32-fe-rooms.js`, `targets/cone/90fk-fe-interiors.js`; `KNOWN_ISSUES.md` says what they keep and what they do not).
