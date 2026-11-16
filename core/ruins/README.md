# core/ruins — nothing floats, every wreck lies on the ground

The owner, 2026-11-10, after the Ancient Engines' quality pass: *"make this check part of the default creation process for ruined structures"*.

**Every ruined structure a build makes is watched** (a ruined building, an engine, a fallen viaduct, a wrecked machine, a collapsed hall): once
it is drawn (its instances baked), the build calls

```js
KRUINS.watch(root, {name, ground: terrainH})          // root: the Object3D that holds it
KRUINS.watch(scene, {name, inside: (x, z) => ..., ground})   // or the scene, with the region that is this structure
```

and the shared verify harness (`tools/harness.py`, `verify_page`) asserts every watched structure on every verify, with the module's self-test as
its negative. A build writes no check of its own for this.

## What it checks

A structure is read into pieces: a plain mesh's connected parts (its triangles joined by shared corners, 1 cm) and each instance of an instanced
mesh, as boxes, each with the ground under it (the lowest of the ground at its corners and centre). Pieces whose boxes come within 0.5 m touch;
touching pieces make clusters; the **main body** is the largest cluster that reaches the ground.

- **No floaters:** every piece belongs to the main body or to a cluster that reaches the ground (within 0.6 m). A stub left in the air when what
  held it was cut away, a light off its rim, a bracket off its wall: each is a floater.
- **Every wreck lies right:** a cluster under 25 m tall that is not the main body is wreckage; its lowest point must be between 0.3 m above and
  1 m below the ground under it (seated on its lowest points, sunk a little; never hovering, never buried). A taller cluster (a half-buried ring,
  a pier in its footing) is a standing body sunk by design: it need only reach the ground.
- **The body stands:** the main body's lowest point is within 0.6 m of the ground.

Decoration is left out: a mesh with `userData.decor`, `userData.probeSkip` or `userData.door`, the Ancients kit's moss, vines, stains, rubble, trees
and figures (`KRUINS.DECOR` on `KIT.defs` names), and whatever `o.skip(mesh, defName)` says.

## Placing wreckage so it passes

Seat a piece on its lowest points: its centre's height is the ground plus `|R10| sx/2 + |R11| sy/2 + |R12| sz/2` less the sink (R its rotation,
s its extents; `kits/ancients` targets/engines `enSeatY`, `en3Debris`). A plate stood at a fixed height whatever its tilt either hovers or is
buried (8ah's `enDebris` sank some 5 m). Keep a structure's wreckage inside the pad or footing it stands on, or seat it on the ground as drawn.

## Files

| File | Tag | What |
|---|---|---|
| `20-core-ruins.js` | [G data] | `KRUINS.analyse(P, o)` on plain boxes (no THREE, no DOM), `KRUINS.verdict(m)`; node-tested (`test-ruins.js`) |
| `21-core-ruins-host.js` | [web] | `KRUINS.watch`, `KRUINS.pieces` (a three.js tree into boxes), `KRUINS.report`, `KRUINS.selfTest` |
| `test-ruins.js` | | `node core/ruins/test-ruins.js`: each check with a negative |

## Taken by

`kits/ancients` (the engines target: `targets/engines/91y-engine-checks.js` watches all twenty engines; `TARGET_READS`), and
`biomes/ancientsvalley` station the Yards (its Engines, `stations/yards/70y-host-yards.js`). kits/metropolis's `MPF.measure` (70f, the farm
families) and `MP.ancientFloaters` (55) are older, narrower counts of the same fault.
