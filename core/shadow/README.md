# core/shadow

The sun's shadows for any three.js r128 page: one shadow box that follows the view. Owner, 2026-11-03 ("the valley does need
shadows"); `kits/metropolis` takes it first.

| File | Tag | What |
|---|---|---|
| `10-core-shadow.js` | [G data] | `KSHADOW.basis`, `KSHADOW.fit`, `KSHADOW.radiusFor`: where the sun's shadow camera stands and how big its box is, as plain arrays |
| `host/12-core-shadow-host.js` | [web] | `KSHADOW.attach(o)`: the renderer's shadow map readied (off), the switch, the page's sun moved each frame, `cast(root)` |
| `test-shadow.js` | node | the basis, the texel snapping, the radius steps, the switch (on stubs); each check with a negative |

## Off by default

The owner, 2026-11-03: shadows are toggleable and **off by default, in every build and rebuild**. `attach` sets everything up and turns
nothing on. While off the renderer's shadow map is disabled and the sun casts nothing, so three runs no shadow pass and compiles no shadow
variant (r128 declares the map's sampler in a lit material only while the map is on and a light casts): the page costs what it did before
it took `KSHADOW`. The switch follows `WATER.mirrorSwitch` (core/water ext/58):

- a button on the host's panel, `shadows: off` / `on` (`o.ui`, else `KHOST.ui`, looked up once the page has run; `button: false` none);
- `?shadow=1` asks for them at load; `o.on: true` starts on;
- `H.set(on)`, `H.on()`, `H.off()`, `H.enabled()` from the page.

Turning it either way recompiles the lit materials once (their shadow define and sampler come and go). A page whose materials have no texture
unit to spare for the map must not offer the switch (the Throne's isle and vents: `biomes/throne/src/89zz-host-core.js`).

## Taking it

```js
/* build.py: the two fragments, the data half sorting before the page's host */
MP.shadow = KSHADOW.attach({ renderer, scene, camera, sun, ground: terrainH });   /* after the sun and the ground exist; off until switched on */
GROUND.receiveShadow = true;
MP.shadow.cast(group);                     /* every placed group: its lit meshes cast and receive */
MP.shadow.cast(storey, { cast: false });   /* receive only */
```

Options: `on` (false), `ui`, `button` (true), `size` (the map, 4096), `min`, `max`, `k`, `step` (the box: 90 to 600 m, widening 1.2 m a metre of the eye's height, in
steps of 1.25 so it does not change every frame), `reach` (1200 m toward the sun: a tall tower outside the box still throws into
it), `bias`, `normalBias`, `radius`, `soft`, `target()` (a focus of the page's own, else the view ray on the ground).

## How it works

- **It runs in `scene.onBeforeRender`** (chained), for the attached camera only. `core/atmos` sets the sun's position from its
  direction inside its draw, just before rendering; a tick would be overwritten. The direction is read from the sun's position and
  target each frame, then both are moved to the box.
- **The box is snapped to its texel grid** across the light (`KSHADOW.fit`), so a walking or flying eye moves it by whole texels
  and edges hold still. Its size changes in steps (`radiusFor`).
- **What casts:** `cast(root)` flags lit, opaque, depth-writing meshes. Shader materials (a baked shell, an impostor) and transparent
  or unlit ones neither cast nor receive: they draw their own light. So a building casts while it is a real mesh and stops when it
  becomes a shell or an impostor (300 m in the metropolis, where the box rarely reaches).
- **Night:** with the sun's intensity under 0.02 the pass is off.

## Not yet

- **Cascades.** One box: near detail or far reach, not both. Cascades in r128 mean patching the lights' shader chunk (three's
  `CSM` does); the numbers here (`fit` per cascade) already allow it.
- **Godot:** a DirectionalLight3D with PSSM does this natively; `radius` maps to `directional_shadow_max_distance`. Not exported yet.
