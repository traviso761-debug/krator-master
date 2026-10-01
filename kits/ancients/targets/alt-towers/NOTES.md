# alt-towers — arco alternates, towers group (queue item 3)

Target `alt-towers` (`dist/alt-towers.html`). Six from-scratch builders, one
fragment each, `src/8aj-alt-*.js`. None reuses an existing builder; they share
only kit helpers (`lathe`, `gridSurface`, `holeFn`, `windowsOnLathe`, the
salvage/fire kit) and a few helpers of their own at the head of
`8aj-alt-a-bole.js` (`altBox altTube altSweep altWin altRope altSag altLadder
altReclaim`, kdefs `altPortI/altPortD`, `ALT_STATE`).

## Contract

`buildAltX(scene,gx,gz,d)`, local to its own group at `(gx,0,gz)`, opens with
`reseed(N+d)`. Decays: **0 intact, 1 ruined, 2 reclaimed** (the ruin, lived in:
shanties, tarps, gardens, ropes, ladders, fire cards that show at night),
**3 rehabilitated** (the whole form in ruin materials; the scene loop sets
HOLES=.55 and runs repairPass). In each builder `brk = d===1||d===2` drives
structural loss, `dd = d>0` drives materials, `rec = d===2` the reinhabitation.

**Decay 2 is NOT toppled here.** In the kit's skyscraper rows `d===2` means
toppled; these builders read it as reclaimed, as the coordinator asked. When
integrating into `targets/kit`, give each row a `t` (the reclaimed x) as this
target does, and note that the kit's own toppled presets do not apply.

| key | builder | fragment | seed (claims) | budget class |
|---|---|---|---|---|
| `altBole`  | `buildAltBole`  | `8aj-alt-a-bole.js`  | 9802 (9802-9806) | sky |
| `altStack` | `buildAltStack` | `8aj-alt-b-stack.js` | 9815 (9815-9819) | sky |
| `altHotel` | `buildAltHotel` | `8aj-alt-c-hotel.js` | 9825 (9825-9829) | medium |
| `altFlat`  | `buildAltFlat`  | `8aj-alt-d-flat.js`  | 9830 (9830-9834) | sky |
| `altPerch` | `buildAltPerch` | `8aj-alt-e-perch.js` | 9835 (9835-9839) | mega |
| `altCult`  | `buildAltCult`  | `8aj-alt-f-cult.js`  | 9840 (9840-9844) | medium |

The allocated range 9800-9849 already held Library (9800-9801), Campus
(9810-9814) and Gate (9820-9824); the seeds above are the free blocks in it.

Rows (`89z-rows.js`): one per type along +z; intact x=-s, rehabilitated 0,
ruined +s, reclaimed t=2s. Views (`91z-views.js`): `The rows`, then per type
`<name>`, `<name> ruined`, `<name> reclaimed`, `<name> rehabilitated`,
`<name> by night` (the reclaimed one, night), `<name> close`,
`<name> reclaimed close`.

Shared-file edits (additive, one line each): `build.py` TARGET_OUT gains
`'alt-towers'`; `src/91-probe.js` BUDGET.type gains the six keys.
