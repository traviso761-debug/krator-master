# Strongbow today: the trades census

*Written by `node settlements/strongbow/test-census.js --write` from `src/20-sb-census.js`. Do not edit; edit the records.*

About **7,000** people (the owner, 2026-11-11), of whom **6,700** are in the Sultan's census: **3,200** in the arcology (the foot, the lower and middle Spine, the galleries on the face; about 640 households) and **3,500** in the town (about 700 households). Outside it: **200** outcasts in the upper Spine and **100** monks of the Order in the tower.

Of the Sultan's people, about 2,345 are children and 469 elders. Of the 3,886 adults, **3,135** work at a trade: **1,530** in the arcology, at about 285 workplaces, and **1,605** in the town, at about 411. The other 751 keep house, are too ill to work, or are between work.

Every number is a proposal for the owner (PLAN.md sections 6 and 8 are the budget it sums to).

## By sector

| Sector | In the arcology | In the town | All |
|---|---|---|---|
| Salvage | 380 | 60 | 440 |
| Caravans | 160 | 150 | 310 |
| Trade | 220 | 120 | 340 |
| Crafts from the hull | 240 | 60 | 300 |
| Other crafts | 40 | 200 | 240 |
| Food | 70 | 80 | 150 |
| Farming and herding | 90 | 650 | 740 |
| Building | 40 | 120 | 160 |
| The garrison and the watch | 150 | 40 | 190 |
| Government | 40 | 10 | 50 |
| The lift crews | 60 | 0 | 60 |
| Care | 30 | 40 | 70 |
| Faith | 10 | 15 | 25 |
| Fuel | 0 | 60 | 60 |
| **All** | **1,530** | **1,605** | **3,135** |

## By trade

| Trade | In the arcology | In the town | Workplaces (in / out) | Where | Buildings |
|---|---|---|---|---|---|
| **Salvage** | | | | | |
| hull cutters | 160 | 60 | 16 / 6 | the salvagers' yards in the foot's east wing; the quarry on the fallen lower hull | `xa_scrap_guild_salvage` |
| haulers and sorters | 120 | - | 10 / - | the salvagers' yards; the lift heads | `xa_scrap_store` |
| glass pullers | 60 | - | 10 / - | the upper Spine's working faces (by lift L3) | a room in the layout |
| the guild's clerks and licence keepers | 40 | - | 2 / - | the Salvagers' Guildhall in the east wing | `xa_scrap_guild_salvage` |
| **Caravans** | | | | | |
| serai keepers and grooms | 90 | - | 3 / - | the terminus serai, built over the hall's ruin | `xa_scrap_serai` |
| porters | 70 | - | 2 / - | the plaza and the lobby | a room in the layout |
| drovers and carters | - | 100 | - / 20 | the road spoke; the outer ring's yards | `xa_scrap_silos` |
| innkeepers | - | 50 | - / 5 | the road spoke | `xa_scrap_court` |
| **Trade** | | | | | |
| the bazaar's stallkeepers | 150 | - | 75 / - | the lobby's floor and galleries | a room in the layout |
| money changers | 30 | - | 15 / - | the lobby's first gallery | a room in the layout |
| merchants of the guild | 40 | - | 10 / - | the Merchants' Guildhall on the plaza | `xa_scrap_guild_hall` |
| shopkeepers | - | 100 | - / 50 | the Girder Arcades on the road spoke and the middle ring | `xa_scrap_bazaar` |
| pedlars | - | 20 | - / 20 | the rings | a room in the layout |
| **Crafts from the hull** | | | | | |
| glaziers | 80 | 20 | 16 / 4 | the lower Spine's workshop floors | a room in the layout |
| panel-cutters and fitters | 70 | 20 | 14 / 4 | the lower Spine; sheds on the quarry spoke | a room in the layout |
| bronze-smiths | 50 | 10 | 13 / 3 | the foot's east wing | a room in the layout |
| cable-makers | 40 | 10 | 8 / 2 | the lower Spine | a room in the layout |
| **Other crafts** | | | | | |
| blacksmiths | 10 | 40 | 3 / 10 | the middle ring | a room in the layout |
| potters | - | 30 | - / 10 | the outer ring | a room in the layout |
| weavers and felters (wool, yak hair) | 20 | 60 | 7 / 20 | the middle ring; the drums | a room in the layout |
| tanners | - | 25 | - / 5 | the outer ring, downwind | a room in the layout |
| dyers | - | 15 | - / 5 | the middle ring | a room in the layout |
| carpenters | 10 | 30 | 4 / 10 | the middle ring | a room in the layout |
| **Food** | | | | | |
| millers | - | 15 | - / 5 | the fields spoke | a room in the layout |
| bakers | 20 | 25 | 7 / 9 | the lower Spine; the middle ring | a room in the layout |
| brewers (barley beer) | 10 | 15 | 4 / 5 | the middle ring | a room in the layout |
| butchers | 10 | 15 | 5 / 8 | the middle ring; the lobby | a room in the layout |
| cookshops | 30 | 10 | 15 / 5 | the lobby's galleries; the road spoke | a room in the layout |
| **Farming and herding** | | | | | |
| terrace gardeners | 90 | - | 15 / - | the second and third terraces | a room in the layout |
| barley farmers | - | 380 | - / 95 | the bench's terraced fields | `xa_scrap_farm` |
| herders (yak, sheep) | - | 220 | - / 44 | the high pastures above and below the bench | `xa_scrap_farm` |
| fodder cutters | - | 50 | - / 10 | the fields spoke | `xa_scrap_granary` |
| **Building** | | | | | |
| scrap builders | 30 | 90 | 5 / 15 | yards on the quarry spoke | a room in the layout |
| masons | 10 | 30 | 2 / 6 | yards on the quarry spoke | a room in the layout |
| **The garrison and the watch** | | | | | |
| the Sultan's garrison | 150 | - | 1 / - | the barracks in the foot's west wing; the guard on lift L3 | `xa_scrap_gate` |
| the town watch | - | 40 | - / 4 | the watch towers on the rings | `xa_scrap_tower` |
| **Government** | | | | | |
| the governor's household and officials | 15 | - | 1 / - | the west wing | a room in the layout |
| customs | 15 | - | 1 / - | the serai's gate on the plaza | a room in the layout |
| scribes | 10 | - | 5 / - | the lobby's first gallery | a room in the layout |
| the town headmen's clerks | - | 10 | - / 2 | the inner ring | a room in the layout |
| **The lift crews** | | | | | |
| capstan crews | 48 | - | 3 / - | the capstan houses of lifts L1, L2 and L3 | a room in the layout |
| bridge wardens | 12 | - | 2 / - | the girder bridges to the east galleries | `xa_scrap_bridge` |
| **Care** | | | | | |
| healers | 10 | 15 | 4 / 5 | the lower Spine; the inner ring | a room in the layout |
| teachers | 10 | 15 | 4 / 5 | the drums; the shrine schools | a room in the layout |
| bath attendants | 10 | 10 | 1 / 1 | the bathhouse on the inner ring; the cistern pavilion | `xa_scrap_bath`, `xa_scrap_pavilion` |
| **Faith** | | | | | |
| priests of the Decree | 10 | 15 | 2 / 3 | the Wheel shrines on the plaza and in the town | `xa_scrap_shrine` |
| **Fuel** | | | | | |
| dung and charcoal gatherers | - | 40 | - / 10 | the outer ring | a room in the layout |
| wood carters | - | 20 | - / 5 | the fields spoke | a room in the layout |

## Outside the Sultan's census

**the Order of History Monks** (100, the tower's upper storeys and the crown; the Nock): archivists and scholars 60; the balloon and signal crews on the Nock 12; the house's keepers 28.

**the outcasts of the upper Spine** (200, the soundest drums above the third terrace; their rope ways): scavengers (salvage traded down at night) 60; gardeners of the wild terraces 20; rope-way keepers 10.
