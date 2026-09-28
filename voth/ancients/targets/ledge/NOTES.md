# The Ledge — hand-back

Built by an agent that was stopped by an API usage limit while shooting the
ruin. Its first cut was committed in its worktree (f60ab11); the later edits
were recovered, and these notes were written from an independent verification
run (`verify.py --assert --all-views`, 16 views, every shot read).

- `src/89i-ledge.js` — `buildLedge(scene,gx,gz,d)`, `reseed(9740+d)`; the
  layer plan is drawn from a second fixed seed in the same claimed range so
  both decays share one plan. Prefix `LD`/`ld`.
- `targets/ledge/` — `DECAYS=[0,1]`, intact at x=-3600, ruin at x=+3600.

## Measured
| | triangles | instances | meshes |
|---|---|---|---|
| ledge/0 | 604 154 | 25 634 | 9 |
| ledge/1 | 484 272 | 21 924 | 10 |
All six invariants PASS, error panel clean, 33 registered volumes.

## Form
A sandstone cliff with strata, fissures and talus, and a city of pale
limestone slab layers cantilevered off it as an inverted ziggurat: the lowest
layers hug the rock, the upper ones reach furthest, with irregular plan
outlines, galleries, deep rooms, lift cores running up the face, raking
struts under the biggest prows, a plateau above and a settlement at the foot.

## Ruin
The top prow broken off and lying on the talus, mid layers sheared at the rock
line, one wing pancaked onto the layers below, rockfall, dead windows.

## Coordinator fix after recovery
Soffits rendered BROWN from below: a downward face sees only the hemisphere
ground colour, and no albedo can make that neutral. The soffit materials now
carry a painted bounce light (emissive through their own texture), dimmed by
`ldNightDim()` at night. They now read as the pale limestone of the reference.

## Views (16)
The Ledge, The cliff face, The section, The soffits from below, A gallery, The
great prow, The plateau, The foot, A lift core, Night, Ruined, Ruined cliff
face, Ruined section, The fallen prow, The sheared layers, The pancaked wing.

## Weaknesses
- The foot settlement is a grid of small white boxes: reads as a model, not a
  town.
- A single lift core runs down to the ground as a thin stalk under the city.
