# The Marches' two watch forts: the west and the south watch forts (plan, 2026-11-22)

The Marches (`Mārchiz`, P8, seat Erehwon, `XAN_TUNE.provinces`) hold three forts of 150 each against the Rift. The third,
the beacon fort over the Rift (`march.e`), is the Beacon's (`settlements/beacon`: the Yellow Monastery below it, the
refurbished Ancient beacon on its keep). This plan is the other two, **in one plan** (the owner, 2026-11-22: "Marches forts:
one plan"), both from the Xanadui fort asset (`kits/xanadu/src/80f-xa-fort-data.js` `XFORT`, `80g-xa-fort.js`; Strongwall's
plan section 5). The order across Xanadu is `settlements/xanadu/BUILD-PLAN.md`. Plans only. Everything not from the owner,
the lore or the tune is *proposed*.

**The fort's size.** The question put to the owner on 2026-11-22 said "the fort asset at size 'march'"; in the asset as
built, `march` is Strongwall's size (two wards, the gorge wall, 250) and **`watch` is the Marches' forts' size** (one ward,
56 x 42 m, a keep, 150: `XFORT.SIZES.watch`, "the Marches' forts"). This plan uses **`watch`**, the size the asset was
designed with for them; the owner's answer (one plan for both) stands. If the owner meant the larger fort, it is one field.

## 1. The records (`XAN_TUNE`, read in place)

| | West watch fort | South watch fort |
|---|---|---|
| Id | `march.w` | `march.s` |
| Name (tune) | The west watch fort | The south watch fort |
| px | 818,1531 (moved with Erehwon +35,+1 from 783,1530) | 843,1546 |
| People | 150, diet `fort` (180 kg of grain, 2 kg of powder a head a year) | 150, diet `fort` |
| Musketeers | 10, hired from the north, 12 dinars a man a year (`T.muskets`, paid on year day 240) | 10 |
| State | `kept` | `kept` |
| Fed from | Erehwon (P8's seat), its arms and powder from their opening stores (Strongwall's plan, W1) | Erehwon |

*Proposed names* (BUILD-OUT question 4 left them): **Wesṭ-Wāch** and **Sāuth-Wāch** (the watch forts, in the Sultanate's
loan-English as Lāiṭ-Hāus and Gōlḍ-Mārch are), the tune's names kept beside them. Not changed in the tune until the owner
takes them.

## 2. The sites and the ground

| | West watch fort | South watch fort |
|---|---|---|
| The model's cell | 289 m, 10 % slope, relief 1,070 m within 7 km, the highest ground near 1,000 m: on the caldera's outer flank, south-west of the lake, 800 m above Erehwon | -213 m, 10 % slope, relief 1,823 m within 7 km: on the south flank where the ground falls to the Rift |
| What it watches | the west road out of the Marches and the trough toward the Rift's west arm | the south road down to the Rift floor and Lizard country (the Golden Tears' camp is 41 km south at 850,1628) |
| Region | Mārchiz, **cut after the vertical stack** (the owner, 2026-11-22: "Wait for the stack"). The west fort's px lies inside `xanadu-lake-shore`'s box (798-890 by 1482-1542) but not its cut: it waits with the south fort |

**Lines of sight on the model** (2 km cells, a tower 20 m, the beacon 30 m, the earth's curve with refraction): none of
the Marches' forts sees another or Erehwon directly. West fort to Erehwon 54 km, blocked by 1,060 m; south fort to Erehwon
58 km, blocked by 830 m; **south fort to the beacon fort 23 km, blocked by only 41 m** (a knoll or a taller tower at 1:1 may
clear it); west to south 58 km, blocked. The Beacon's plan already relays the beacon fort to Erehwon by its Rim Post on the
middle volcano's summit (856,1532). *Proposed*: the forts signal by **relay posts** (`XFORT.post()`: a square tower, its
fire basket, a fuel store, a hut, about 4 men a post by rota from the fort), sited by the same test run on the Mārchiz
region's 1:1 ground when it is cut; the model's 2 km cells are too coarse to place them now. Expected: one or two posts a
fort, on the caldera's outer rim.

## 3. The forts (`XFORT.plan({size: 'watch', ...})`)

The asset's watch fort, as Strongwall's plan section 5 sets it: a single ward (56 x 42 m by default, or a convex outline
fitted to the knoll it stands on), curtains 6 m high and 2.4 m thick with a 1.6 m walk, square towers (6 m, 9 m high) at
every corner and at most every 40 m, a gate between two towers (11 m), a keep (12 x 12 m, 18 m) with the beacon's fire
basket on its roof, the barracks and stores inside, 12 t of grain stored. Dress `march` (rubble under a thick limewash, the
maroon band, tiled roofs on the towers). State `kept`; `XFORT.damage` gives the damaged and ruined states for a raid's
outcome (`core/ruins` watches every fallen piece).

**The garrison** (*proposed* split of the 150): the commander and his household (10), archers and spearmen (90), mounted men
(25) with their horses in the outer yard's stable, the 10 musketeers with their own mess (a mixed lot: Izani, Yuni and free
companies, each in its own dress), a few gunners for one gun on the gate tower (*proposed*: the Marches' forts get one gun
each, Strongwall three), and the relay posts' rota (8-12).

**Outside the walls** (*proposed*, small): a well house or cistern, the stable yard and corral (`xa_corral`), a few
terraces on the knoll's lee for the fort's vegetables (the tune feeds it all from Erehwon: no terrace work), a wayside
shrine at the gate, the road down.

## 4. Kit pieces

From the fort asset (merged): the curtains, towers, gate, keep, beacon, barracks and stores (80g); `xa_fort_post` (the relay
posts); `xa_corral`, `xa_wayside_shrine`. **Missing**: a **field gun on its carriage** for the gate tower (Strongwall's plan
lists the guns: if its F-steps drew them, they are reused; otherwise named here and drawn as a stand-in box).

## 5. Core adoption

| Need | Module | How |
|---|---|---|
| The fort | `kits/xanadu` (`XFORT`, `[G data]`) | `XFORT.plan` then `XFORT.check` (its rules) before drawing; the plan's records drawn by 80g; no fort code of the forts' own |
| The ground | `core/world` | The Mārchiz region's ground at 1:1; the knoll's top fitted to the ward (a convex outline from the ground's level area) |
| The relay posts | `core/world`, the line-of-sight test | Placed by sight on the region's ground; a post is a site record |
| The damage | `core/ruins` (`KRUINS`), `core/rand` | `XFORT.damage` hashed from (seed, piece, salt); every fallen piece watched |
| Placement | `core/rand`, `core/tags` | As everywhere |
| Life | `core/charactermodels` | The garrison and the musketeers in their dresses |
| The economy | `core/region` (`XAN_TUNE`) | The records as they stand |

## 6. Textures

The Xanadui fort's section 54 (`core/materials/PROMPTS-NEEDED.md`: `wall.rubble.limewash` and two more), owed; nothing new.

## 7. Pins (the scale-model queue; listed, not edited)

Two records-only **fort pins** (the `fort` SETT_TYPE exists since 5.1e11): `march.w` at 818,1531 and `march.s` at 843,1546,
*proposed* ids `smarchw0001` and `smarchs0001`, polity the Sultanate, named as the tune names them (or by the owner's names,
section 1). The relay posts are region site records, not pins.

## 8. Steps

| Step | What | When |
|---|---|---|
| **M1** | Both forts planned and drawn on a sheet: **a build of its own, `settlements/marches`** (changed 2026-11-22 from a target on Strongwall's page, so it does not write Strongwall's files while the Strongwall session works on them), reading the fort asset (`kits/xanadu` `XFORT`, 80f/80g) in place, on top of the Strongwall session's latest fort work (`claude/strongwall-plan-c1ee33`); flat ground, `XFORT.check` clean, the three states; the verify asserts the fort's rules. Changes the fort asset needs go to the Strongwall session, not into 80f/80g here | now (no ground needed) |
| **M2** | On the Mārchiz region's ground: each ward fitted to its knoll, the roads, the relay posts by sight; the region's verify | after the stack cuts Mārchiz (BUILD-PLAN.md phase B) |
| **M3** | The pins and (if the owner takes them) the names, in the tune and the queue | with M1 |
