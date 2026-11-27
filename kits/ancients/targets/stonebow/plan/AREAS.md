# Stonebow — Interior Zones & Area Schedule (`AREAS.md`)

Generated from [`8av0-stonebow-plan.js`](../8av0-stonebow-plan.js) and [`8av1-stonebow-interiors.js`](../8av1-stonebow-interiors.js).

## Macro Arcology Metrics (Soleri *21. Stonebow* vs Krator Build)

| Metric | Soleri *21. Stonebow* | Stonebow (`intact`) | Stonebow (`refurbished` centerpiece) |
|---|---|---|---|
| Rim-to-rim canyon span | ~900 m | **900 m** | **900 m** |
| Height above canyon rim | 150 m | **150 m** (`y = 420 -> 570 m`) | **150 m** |
| Total structural height | 450 m | **450 m** (`y = 120 -> 570 m`) | **450 m** |
| Covered surface (footprint + park) | 129 ha (320 acres) | **129.3 ha** | **129.3 ha** |
| Gross lit residential/civic floor | — | **9,753,728 m²** | **897,343 m²** (kept core) |
| Deep cut-and-cover vault floor | — | **1,514,160 m²** | **1,514,160 m²** (sealed delving ruins) |
| Resident population | 200,000 | **192,119** | **17,675** |

## Planned Cut-Away Interior Schedule (`STONEBOW_INT`)

| Zone ID | Name | Refurbished State | Elevations `y` (m) | Storeys | Rooms | Sampled Plate Floor (m²) |
|---|---|---|---|---:|---:|---:|
| `refurb/crown` | Cultural Center and Skylight Crown | Kept & furnished (`d=5`, whole walls, `core/door`) | `496, 508, 520` | 3 | 82 | 9,766 |
| `refurb/bow` | Living-Working Bow Terraces | Kept & furnished (`d=5`, whole walls, `core/door`) | `428, 444, 460, 476` | 4 | 700 | 36,766 |
| `refurb/city` | City Center Arch Concourse | Kept & furnished (`d=5`, whole walls, `core/door`) | `390, 400, 408` | 3 | 481 | 29,592 |
| `refurb/tourist` | Suspended Tourist Center | Kept & furnished (`d=5`, whole walls, `core/door`) | `174, 184` | 2 | 403 | 21,382 |
| `refurb/pylons` | Four Gate Pylons and Bulkheads | Kept & furnished (`d=5`, whole walls, `core/door`) | `386, 454` | 2 | 72 | 3,122 |
| `refurb/vaults-w` | West Automated Industry Vaults | Sealed delving ruin (`d=1`, broken walls, socket) | `342, 358` | 2 | 146 | 12,367 |
| `refurb/vaults-e` | East Factory and Mechanical Vaults | Sealed delving ruin (`d=1`, broken walls, socket) | `266, 342, 358` | 3 | 147 | 12,524 |
| **Total** | **7 cut-away zones** | **5 kept + 2 delving** | `174 .. 520` | **19** | **2031** | **125,521** |
