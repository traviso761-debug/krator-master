/* ================================================================= ARCKIBUZ — core/water records & ruin ground twin
   [G data] Pure engine-neutral data: no THREE, no DOM, no Math.random, no rng().
   Builds core/water records (WATER.still, WATER.flow, WATER.fall) per site:
     - d = 0 (Intact) & d = 3 (Refurbished):
         1. Rooftop WATER RESERVOIR head-tank basin (y = 118.6 m on the NE shoulder)
         2. Trunk-to-Court Aqueduct Cascade (WATER.fall from y = 22.0 m into the Sunken Court Cistern at y = 14.4 m)
         3. Sunken Court Reflection Cistern (y = 14.42 m) + Shaded Rock-Cut Moat Cooling Channels (y = 2.48 m)
         4. Polygonal VEGETABLE GARDENS main irrigation rills (WATER.flow along the West & South causeways, y = 28.14 m)
     - d = 1 (Ruined):
         Rooftop reservoir breached and dry; irrigation canals dry; only a shallow silted rain-seepage pool (y = 2.55 m)
         in the lowest NW moat corner.
   AKB_WATER.ground(site, x, z) returns the world-space ground under the ruin for core/ruins (KRUINS.watch). */
const AKB_WATER = (function () {
  'use strict';

  const sites = [];

  function boxPolyW(gx, gz, x0, x1, z0, z1) {
    return [[gx + x0, gz + z0], [gx + x1, gz + z0], [gx + x1, gz + z1], [gx + x0, gz + z1]];
  }

  function addSite(d, gx, gz, P, opts) {
    const H = ARCKIBUZ.HULL;
    const R = H.reservoir, C = H.cistern, M = H.moatChannels;
    const o = opts || {};
    const noTerrain = !!o.noTerrain;
    const groundFn = typeof o.ground === 'function' ? o.ground : null;
    const W = (x, z, y) => [gx + x, gz + z, y];
    const site = { d, gx, gz, dim: P.dim, hull: H, noTerrain, groundFn, still: [], flow: [], fall: [] };

    if (typeof WATER === 'undefined') {
      sites.push(site);
      return site;
    }

    if (d === 0 || d === 3) {
      /* 1. Rooftop WATER RESERVOIR head-tank (inside concrete walls) */
      const ins = R.wallT + R.inset;
      site.still.push(WATER.still({
        name: d === 3 ? 'Restored rooftop water reservoir' : 'Rooftop water reservoir',
        level: R.waterY,
        poly: boxPolyW(gx, gz, R.x0 + ins, R.x1 - ins, R.z0 + ins, R.z1 - ins)
      }));

      /* 2. Aqueduct cascade & Sunken Court Reflection Cistern */
      site.fall.push(WATER.fall({
        name: 'Court cistern cascade',
        lip: [W(C.lipX0, C.lipZ, C.lipY), W(C.lipX1, C.lipZ, C.lipY)],
        dir: [0, -1],
        speed: C.speed,
        drop: C.drop,
        spread: C.spread
      }));
      site.still.push(WATER.still({
        name: 'Sunken court cistern',
        level: C.waterY,
        poly: boxPolyW(gx, gz, C.x0, C.x1, C.z0, C.z1)
      }));

      /* 3. Shaded rock-cut moat cooling channels */
      site.still.push(WATER.still({
        name: 'West cliff cooling channel',
        level: M.west.level,
        poly: boxPolyW(gx, gz, M.west.x0, M.west.x1, M.west.z0, M.west.z1)
      }));
      site.still.push(WATER.still({
        name: 'South cliff cooling channel',
        level: M.south.level,
        poly: boxPolyW(gx, gz, M.south.x0, M.south.x1, M.south.z0, M.south.z1)
      }));

      /* 4. Irrigated VEGETABLE GARDENS main aqueduct rills on the desert rim (omitted when demo terrain is disabled) */
      if (!noTerrain) {
        for (let i = 0; i < H.canals.length; i++) {
          const cn = H.canals[i];
          site.flow.push(WATER.flow({
            name: cn.name,
            pts: cn.pts.map(pt => W(pt[0], pt[1], pt[2])),
            width: cn.width,
            speed: cn.speed
          }));
        }
      }
    } else {
      /* d = 1 (Ruined): Reservoir breached & dry; only a shallow silted seepage puddle in the NW moat corner */
      site.still.push(WATER.still({
        name: 'Silted moat seepage pool',
        level: M.ruin.level,
        poly: boxPolyW(gx, gz, M.ruin.x0, M.ruin.x1, M.ruin.z0, M.ruin.z1)
      }));
    }

    sites.push(site);
    return site;
  }

  function ground(site, x, z) {
    if (site && site.groundFn) return site.groundFn(x, z);
    return ARCKIBUZ.HULL.groundAt(x - site.gx, z - site.gz, site.d);
  }

  function reset() {
    sites.length = 0;
  }

  return { sites, addSite, ground, reset };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AKB_WATER;
