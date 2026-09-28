# Dalab — design doc

## Who builds

The people of Dalab descend — though they do not remember it — from the
employees, patients and test subjects of an Ancient genetic-engineering
laboratory, the domed compound at the centre of their settlement. The
employees' descendants are a caste of priests and rulers who take advice from
the lab's central AI, **The God**, whose counsel has kept a high level of
biomedical knowledge alive and grows more erratic every century. Dalab's
healers are prized across Krator; its genepriests sell modifications (night
vision, pressure adaptation, extra limbs) to outsiders in the **Halls of
Reformation**. Nearly every citizen carries the photosynthesis mod and is
**green-skinned**. The Giant tribes of the north-west came from here, and the
priests keep Giant guards: four-armed ceremonial guards at the temples, two-armed
patrols in the streets.

## Castes and what they build

| caste | wealth tag | builds in | light |
|---|---|---|---|
| peasants (farmers, labourers) | `peasant` | rammed earth, wattle, thatch, reclaimed corrugate and Ancient plate; round plans | none — hearth fire only |
| traders, craftsmen | `middle` | timber post frames, staves, rammed-earth halls, shingle and thatch | none |
| nobles (the priests' kin) | `noble` | grey megalithic stone with carved relief, on earth platforms or inside earth-walled compounds | The God's light |
| priests | `priest` | stone temples on the mounds, round stone houses | The God's light |
| civic (barracks, Halls, embassies) | `civic` | stone and earth compounds; the guests' own idiom inside | The God's light |

## The vibe

**Cahokian monumentality in rammed earth, wood, stone and scrap.** The most
prominent features are the Ancient domes and the dome-shaped ceremonial earth
mounds built in imitation of them by the priests and their labourers. Circular
structures under thatch or shingle cones. Stone only for the wealthy and the
sacred, and then **megalithic** — Tiwanaku / Mesoamerican: battered walls,
stepped cornices, trilithon gates like the Gate of the Sun, carved and sometimes
painted relief bands, steles. Murals and banners everywhere else, in the same
motifs: heroes of Dalab, avatars of The God (the rayed head with one great eye)
and reminders of His watchful benevolence, in a straight Amerindian style or an
Amerindian-inflected Art Deco.

Materials, as the kit renders them (`69d-dalab-mat.js`):

| material | texture | who |
|---|---|---|
| rammed earth | horizontal lifts with joint shadows, form-board marks, pock marks; ochre tints | everyone |
| grey stone | the Iziz ashlar map tinted andesite grey | nobles, priests, civic |
| relief | a stepped-fret meander cut into stone, lit arrises | bands, plinths, gate lintels, steles |
| mural | a 2 m COLOUR tile: fret borders, an avatar and a hero; red ochre, turquoise, gold, black on cream; worn at the foot | friezes on every caste above peasant; a single band on a post house |
| thatch, shingle, oak boards, staves | the Vernacular maps | roofs, halls |
| corrugate, Ancient plate, rust | the Ancients' own salvage maps | scrap huts, smithies, warehouses' doors, the Halls' domes |
| turf | cropped grass with mole-hills | mounds, platforms, ring banks |
| pantile, blue-and-white mosaic, gilt | short re-descriptions of the Iziz ported kit | the Vothic and Historians' embassy halls |

**The sacred deco (round 4).** Temples, priests' houses, the compound chapels
and the palace are terracotta (`DPAL.sacred`) with cream trim (`DPAL.trim`):
cream cornice steps and string courses, fret bands of cream over turquoise
inlay (`dReliefTq`), tall turquoise panels carrying the cream avatar on the
piers (`dDecoPanel`), a stepped ziggurat crest over the door (`dnCrest`), and
diamond-checker tile on the thresholds and landings (`dChecker`). The mounds,
stairs and civic compounds stay grey stone, so the red marks what is holy.

Colour: green skin (`DPAL.skin`) on every figure; robes in cream, red ochre,
turquoise, gold; the priests in white with gold head-dresses.

## The God's light (lighting rule, canon)

Only **priest, noble and civic** defs are tagged `lit:true`; `vLit()` answers it
and every helper that emits light checks it. The light is **cold teal-white**
(`DPAL.god`), an Ancient light the priests keep alive — unlike Iziz's warm bulbs
and unlike the Ancients' own cyan strips, which is how a viewer tells the three
apart from the air. Each lit pane is two instances at one spot: an unlit teal
pane and a dark green glass pane, and the hour of day flips which
`InstancedMesh` is visible. Peasant and trade buildings burn **fire** instead
(the Ancients kit's flame and ember cards): the hearth window of every hut, the
compound fire, the smithy's kiln, the temple altars, the plaza fires at the
mound — fire is not power and is allowed anywhere.

The rest of the package is the Iziz city's: KratorSky by hour, an hour slider,
a seventh preset element for night shots, `N` to toggle. See API.md.

## The mounds

A ceremonial mound is a dome-shaped turfed earthwork (a lathe whose profile is a
smoothstep from the foot to a flat plateau — flat at the foot and the top,
steepest half way), a stone stair with kerbs and stele pairs climbing the front,
a stone temple with a trilithon door and a shingle pyramid on the plateau, the
priest's round stone house beside it, banner poles round the lip, and at the
foot a paved plaza with a fire where the town gathers to watch the ceremony.
The outlying settlements' mounds are r 30 / plateau 13 / h 13; the High Priest's
is r 46 / 20 / 20 on a terrace, with a greater temple and two priests' houses,
inside a ring bank (r 68, palisaded) with one entrance guarded by giants. The
layout pass orients the outlying mounds toward the Ancient lab and the High
Priest's away from it — here every front is +z.

## Registry and tags (project rule)

Every building is registered through `dDef({key,name,family,tags,w,d,h,build})`
(a `VERN.def` that stamps `culture:'dalab'`) and every placed instance registers
inspector volumes carrying `cls:'building'` and its tags:

```
culture: 'dalab'   (embassies also carry guest: iziz | voth | yuni-order)
type:    civic | market/shop | tavern/inn | industry | farm | single-family dwelling |
         multi-family dwelling | infrastructure | religious | military
wealth:  peasant | middle | noble | priest | civic
lit:     true only for priest, noble and civic
role / landmark on the Halls, the mounds
```

Flora is never part of a building; the live-oak avenue, the residual stands and
the farm fields come from the `swlowlands` biome at layout time.
