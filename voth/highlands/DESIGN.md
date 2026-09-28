# Highlands — design doc

The **Highlands** building kit builds the highland, temperate regions of the Inner Wall. It is a *wooden*
architecture: stone is reserved for the wealthy and for civic buildings (which still use a great deal of
wood), and the poorest build in bamboo. The kit comes in three branches that must read as related cultures
sharing one vocabulary:

| branch | who | leans toward | stone | light |
|---|---|---|---|---|
| **Republican** (`republican`) | the Iron Republic — the most settled, developed highland state | Russian + Transylvanian Saxon, a touch of the Iziz vernacular (salvage metal on the poor and on industry) | socles, rich ground storeys, civic, walls | electric: rich + civic only |
| **Rustic** (`rustic`) | the relatively civilised villages south of the Republic | Norse + Alpine | footings and chalet ground storeys only | none |
| **Tribal** (`tribal`) | the Painted Men and other raider tribes | raw logs, bamboo, thatch; the heaviest carving and paint; cliff settlements | stone circles, hearths | none |

## The shared vocabulary (what makes the three one family)

* **Wood first.** Round-log walls with saddle-notched corners (`hnLogBox`), board walls, carved posts. Poor
  = grey weathered (`HPAL.aged`), middle = fresh pine (`HPAL.pine`), rich = tarred/oiled dark (`HPAL.tar`)
  or Peles red-brown (`HPAL.redwood`).
* **Steep gabled roofs.** Pitch ≈ 1.0–1.6 (rise / half-span) for Russian/Norse/Saxon, 0.55–0.65 for the
  Alpine chalet (wide eaves, stones on the shingle). Roof skins: split shingle (`vShingleB`), fish-scale
  slate/iron (`hGableSc`, tinted slate / green / red), thatch (`vGableT`), turf (`hGableTurf`).
* **Russian rooflines on civic buildings**: tented roofs (`hnTent`), onion domes (`hnOnion`), keel-arch
  kokoshniki (`hnKokoshnik`) and bochka roofs (`hnBochka`), stacked roof tiers.
* **Carved and painted wood is the main decoration.** The *style and palette* of the carving is NW-coast
  formline: black primary lines, red secondary, teal tertiary, on cedar or white — ovoids, U-forms, split-Us,
  and **naturalistic animals by default** (Travis, round 1: the crest faces read as creepy): salmon, orca,
  thunderbird and bear on the boards; eagle, bear and frog on the poles. A human/spirit face (`hlFace`) is kept
  in the kit for specific buildings that later ask for one; nothing uses it by default. It appears as: formline boards (`hnForm` with `hFormA/W/V/T`), friezes (`hnFrieze`), totem
  poles and totem porch posts (`hnTotem`, `hnTotemPost`), thunderbird gable finials (`hnBarge … 'bird'`).
  The *kind* of carving varies by branch (below).
* **East-Asian note**: painted dougong bracket sets (teal arms, red blocks) under civic and rich eaves
  (`hnDougong`, `hnBracketRow`). Republican civic + rich mainly; a few in Rustic halls; none in Tribal.
* **Fretwork**: Russian lace bargeboards and nalichnik window surrounds (`hnBarge … 'lace'`, `hnNal`), Alpine
  cut-out balustrades (`hnBalcony`).

## Branch by branch

**Republican.** Poor: log izba, gable to the street, white/blue nalichniki, a salvage sheet over a leak.
Middle: the Saxon townhouse (fieldstone socle, painted render ground storey — ochre/sand/sage/apricot/rose —
jettied half-timber upper storey, steep scale roof, loft hoist) and the Russian merchant's log house on a
stone storeroom storey with a kryltso porch. Rich: the Peles villa (rubble socle, cream stucco with ashlar
quoins, red-brown half-timber, slate, loggia towers with spires, oriels) and the terem (stacked log volumes,
keel gables, tented towers). Civic: stucco and ashlar with timber loggias, tent/onion/spire roofs, clock
faces, dougong, formline boards at the doors, guild totems at the gates. Industry: log and stone halls with
corrugated salvage roofs and iron chimneys — the Iziz note is strongest here.

**Rustic.** Alpine chalets (whitewashed stone ground storey, log upper, low wide gable, balconies, geraniums,
stones on the shingle) and Norse houses (tarred logs or falu-red boards, steep turf or shingle, crossed
horns/dragon bargeboards). Temple = a stave church (stacked shingle roofs, dragon finials). Village hall =
a Norse longhall. Carving: painted gable crests (`hFormT`), horns, a totem at the hall; less formal than the
Republic, less total than the Tribes.

**Tribal.** Bamboo-and-log huts on stilts with whole painted house-fronts (`hFormW`), thatch or turf,
thunderbird finials, winged totems at the door; the longhouse after the "Skarðavik" sketch (sweeping arched
roof on crossing ribs, flared horn-like wings, a central stair, a cupola). Every dwelling can be built on the
ground (stilts) **or hung on a cliff** (`o.cliff=true`): floor at the placement y, cantilever beams and raking
struts driven back into rock behind (−z). `hnCliffWalk()` joins them with walkways and flights of stairs.

## Lighting rule (canon, as in the Iziz vernacular)

Electric light only on **Republican rich + civic** defs (`lit:true`). `vLit()` inside a builder answers it;
`vnDoor`/`vnLamp`/`vnLampPost` emit bulbs only when true; use window kind `'lit'` only under `vLit()`.
Rustic and Tribal: `lit:false` always. Forge fire (`vEmber`) is not electric and may appear anywhere.

## Tags (project rule)

Every def: `culture: 'highland-<branch>'` (added by `HL.def`), `kit: 'highlands'`, `type` (one or more of
`civic | market/shop | tavern/inn | industry | farm | single-family dwelling | multi-family dwelling |
infrastructure | religious | funerary | military`), `wealth` (`poor|middle|rich|civic`), `lit`. Every placed
instance registers inspector volume(s) through `vnReg`.

## The building list and who owns it (round 1)

Seed blocks and fragment files are owned per work package so packages can be built in parallel.

| package | files | seeds | buildings |
|---|---|---|---|
| **R-A** Republican homes + trade | `74-rep-dwell.js` `75-rep-trade.js` | 20100–20699 | 3 poor / 3 middle / 3 rich houses; beer hall/tavern ×3; shops + workshops; scrap smithy small + large; inn; stables/caravanserai; warehouses |
| **R-B** Republican civic + guilds | `76-rep-civic.js` `77-rep-guild.js` | 20700–21199 | polytheistic temple; barracks + mustering ground; town hall with clocktower; hospital; city watch; theatre; school; guilds: Mercenary, Alchemists (high explosives), Farmers, Smiths, Mechanics (clockwork) |
| **R-C** Republican grand + land | `78-rep-grand.js` `79-rep-land.js` | 21200–21799 | Hall of the Republic; fortress/castle; wall segment, wall towers, gate (Peles); Forgehouse; generator; granary, farmhouse, farm, animal pens, windmill, watermill; mine, quarry |
| **RU** Rustic | `80-rus-dwell.js` `81-rus-village.js` | 22000–22499 | poor/middle/rich houses; temple; village hall; shops; mustering ground; small scrap smithy; granary/mill; farmhouse, farm, animal pens; tavern/inn |
| **TR** Tribal | `84-tri-dwell.js` `85-tri-village.js` | 23000–23499 | small + large dwellings (all cliff-capable); village longhouse; warrior's hall; shaman's house; stone circle; farmhouse, farm, animal pen, granary; small scrap smithy; the cliff settlement |

## Round 2 rulings (Travis)

* **Totems are tribal only.** Republican and Rustic buildings carry carved **pillars** (square shafts whose faces
  stack motifs like a totem) — porch posts, portals, free-standing columns with painted roundel finials.
* **Murals by branch.** Tribal: formline only. Rustic + Republican: formline animals plus Norse/Celtic motifs
  (knots, braids, triskele, tree of life, cats, wolves, Mjölnir, grain, moths, warriors, sun/moon/star, the green
  gas giant; rockets in the Republic), same black/red/teal/ochre palette.
* **The Republic's emblem** — three arms in a triskelion, each fist holding a sword at 90° to the forearm — on
  Republican civic crests and banners.
* **Every shop has a sign** showing its trade's symbol (`HTRADE`).
* **Half-timbering** in four styles (Alemannic, Franconian, Tudor, plain Saxon).
