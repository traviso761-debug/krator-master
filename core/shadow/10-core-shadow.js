// ================================================================= CORE/SHADOW — the sun's shadow box, as numbers  [G data]
// One shadow box that follows the view: where to put the sun's shadow camera so its texels stay put while the eye moves (a box that
// slides by less than a texel shimmers every edge it holds), how big to make it for how high the eye is, and how far toward the sun
// it reaches for casters (a 230 m tower 300 m off throws its shadow into the box). Plain arrays, no THREE, no DOM: the host half
// (host/12-core-shadow-host.js) applies it to a DirectionalLight; a Godot port takes the same record for its DirectionalLight3D
// (`directional_shadow_max_distance` from `radius`). Owner, 2026-11-03: the valley wants shadows, the metropolis takes it first.
//
//   KSHADOW.basis(dir)                  the shadow camera's right and up for a sun direction (three's lookAt from the sun to its target)
//   KSHADOW.fit({ dir, focus, radius, size, reach, below })
//     dir     unit vector from the scene toward the sun
//     focus   the point the box is centred on (world)
//     radius  half the box's side, metres; size: the shadow map's texels a side
//     reach   how far toward the sun the camera stands (casters up to that far, along the light); below: depth under the focus kept
//     -> { target, pos, half, near, far, texel }   target: the focus moved onto the texel grid (across the light, not along it)
//   KSHADOW.radiusFor(height, o)          the box's half side for an eye this high above the ground: o.min, o.max, o.k, o.step (a
//                                         ratio: the radius is snapped to powers of it, so it does not change, and shimmer, every frame)
var KSHADOW = (function () {
  'use strict';
  const S = {};
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]); return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 1, 0]; };
  S.basis = function (dir) {
    const z = norm(dir);
    let x = cross([0, 1, 0], z);
    /* straight overhead: three nudges z, so does this */
    if (Math.hypot(x[0], x[1], x[2]) < 1e-6) x = cross([0, 1, 0], norm([z[0] + 1e-4, z[1], z[2]]));
    x = norm(x);
    return { right: x, up: cross(z, x), back: z };
  };
  S.fit = function (o) {
    const B = S.basis(o.dir), F = o.focus, R = o.radius, N = o.size == null ? 4096 : o.size, reach = o.reach == null ? 1000 : o.reach;
    const texel = 2 * R / N, a = dot(F, B.right), b = dot(F, B.up), da = Math.round(a / texel) * texel - a, db = Math.round(b / texel) * texel - b;
    const T = [F[0] + B.right[0] * da + B.up[0] * db, F[1] + B.right[1] * da + B.up[1] * db, F[2] + B.right[2] * da + B.up[2] * db];
    const below = o.below == null ? R : o.below;
    return { target: T, pos: [T[0] + B.back[0] * reach, T[1] + B.back[1] * reach, T[2] + B.back[2] * reach], half: R, near: 0.5, far: reach + below, texel };
  };
  S.radiusFor = function (height, o) {
    o = o || {};
    const lo = o.min == null ? 90 : o.min, hi = o.max == null ? 600 : o.max, k = o.k == null ? 1.2 : o.k, st = o.step == null ? 1.25 : o.step;
    const r = Math.max(lo, Math.min(hi, lo + k * Math.max(0, height)));
    return Math.min(hi, lo * Math.pow(st, Math.round(Math.log(r / lo) / Math.log(st))));
  };
  return S;
})();
if (typeof module !== 'undefined') module.exports = KSHADOW;
