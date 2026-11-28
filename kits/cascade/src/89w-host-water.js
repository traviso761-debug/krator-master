// ================================================================= HOST — elevated aqueduct, central cataracts & tailrace canals (core/water)  [web]
// Draws the elevated Southern Headrace Aqueduct (y = 32.3 -> 31.8 m), the Bifurcated Surge Headbox pool, the three
// roaring 32.6 m Central Industrial Hall cataracts (WATER.fall + WATER.drawFall), the Central Turbine Plunge Basin,
// and the lower South/East/West tailrace discharge & circular-garden irrigation canals on core/water.
const AV_WATER = (function () {
  'use strict';
  const env = new THREE.Scene();
  const WENV = { environment: null };
  env.add(new THREE.Mesh(sky.geometry, sky.material));
  const gClone = giant.clone();
  gClone.position.copy(giantDir).multiplyScalar(GIANT_DIST);
  env.add(gClone);
  ATMOS.skylight({
    renderer: renderer,
    sky: env,
    scene: WENV,
    ground: function () { return new THREE.Color(0x364438); },
    key: function () { return LIGHT_MODE; }
  });

  const lin = function (c) { return new THREE.Color(c).convertSRGBToLinear(); };
  const wy = AV.DIM.CANAL_WATER_Y;
  const HY = AV.DIM.HYDRO;
  function toPts(arr, y0, y1) {
    const n = arr.length;
    return arr.map(function (p, i) {
      const u = n > 1 ? i / (n - 1) : 0;
      return [p[0], p[1], y0 + (y1 - y0) * u];
    });
  }

  const flows = [];
  const specs = [
    { name: 'Elevated south headrace aqueduct', pts: toPts(AV.CANAL_LINES.aqueduct, HY.aqueductY + 0.5, HY.aqueductY), width: 10.6, margin: 0.45, speed: 2.35, rapids: [0.001, 0.014], order: 3 },
    { name: 'South tailrace spillway canal', pts: toPts(AV.CANAL_LINES.south, wy, wy - 0.08), width: AV.DIM.CANAL_W, margin: 1.1, speed: 1.35, rapids: [0.04, 0.22], order: 2 },
    { name: 'East tailrace trunk canal', pts: toPts(AV.CANAL_LINES.eastStem, wy, wy - 0.04), width: AV.DIM.CANAL_W, margin: 1.1, speed: 1.15, rapids: [0.05, 0.24], order: 2 },
    { name: 'West tailrace trunk canal', pts: toPts(AV.CANAL_LINES.westStem, wy, wy - 0.04), width: AV.DIM.CANAL_W, margin: 1.1, speed: 1.15, rapids: [0.05, 0.24], order: 2 },
    { name: 'East garden north loop', pts: toPts(AV.CANAL_LINES.eastNorth, wy - 0.04, wy - 0.09), width: 11.0, margin: 1.0, speed: 0.65, rapids: [0.06, 0.25], order: 2 },
    { name: 'East garden south loop', pts: toPts(AV.CANAL_LINES.eastSouth, wy - 0.04, wy - 0.09), width: 11.0, margin: 1.0, speed: 0.65, rapids: [0.06, 0.25], order: 2 },
    { name: 'West garden north loop', pts: toPts(AV.CANAL_LINES.westNorth, wy - 0.04, wy - 0.09), width: 11.0, margin: 1.0, speed: 0.65, rapids: [0.06, 0.25], order: 2 },
    { name: 'West garden south loop', pts: toPts(AV.CANAL_LINES.westSouth, wy - 0.04, wy - 0.09), width: 11.0, margin: 1.0, speed: 0.65, rapids: [0.06, 0.25], order: 2 }
  ];

  specs.forEach(function (sp) {
    const F = WATER.flow({ name: sp.name, pts: sp.pts, width: sp.width, speed: sp.speed, rapids: sp.rapids });
    const D = WATER.drawFlow(F, {
      rapids: sp.rapids,
      shallow: lin(0x4b6868),
      deep: lin(0x23383c),
      color: 0xffffff,
      roughness: 0.16,
      metalness: 0.04,
      envMapIntensity: 0.38,
      step: 8,
      across: 6,
      margin: sp.margin,
      renderOrder: sp.order
    });
    D.mesh.userData.probeSkip = true;
    D.mesh.userData.inspectLabel = sp.name;
    flows.push({ flow: F, draw: D });
  });

  // Elevated Bifurcated Surge Headbox pool at y = 31.8 m feeding the 3 cataract sluices & twin penstocks
  const headboxStill = WATER.still({
    name: 'Central Headrace Surge Basin',
    bounds: [-20.2, 15.6, 20.2, 23.6],
    level: HY.aqueductY
  });
  const headboxDraw = WATER.drawStill(headboxStill, {
    color: lin(0x2a484e),
    roughness: 0.14,
    metalness: 0.02,
    envMapIntensity: 0.38,
    renderOrder: 2
  });
  headboxDraw.mesh.userData.probeSkip = true;
  headboxDraw.mesh.userData.inspectLabel = 'Central Headrace Surge Basin';

  // Three roaring 32.6 m Central Industrial Hall cataracts (main plunge + west & east overshot wheel chutes)
  const falls = [];
  const catDefs = (AV.SITES && AV.SITES.refurbished && AV.SITES.refurbished.plan.hydroHall)
    ? AV.SITES.refurbished.plan.hydroHall.cataracts
    : [];
  catDefs.forEach(function (ct, ci) {
    const S = WATER.fall({
      name: ct.name,
      lip: ct.lip,
      dir: ct.dir,
      speed: ct.speed,
      drop: ct.drop,
      spread: ci === 0 ? 1.1 : 0.45
    });
    const D = WATER.drawFall(S, {
      color: 0xc2dfe2,
      opacity: 0.94,
      rows: 32,
      cols: ci === 0 ? 10 : 6,
      margin: 0.35,
      edge: 0.35,
      lipK: 0.88,
      footK: 0.84,
      plungeY: wy + 0.06,
      plungeR: ci === 0 ? 9.2 : 3.8,
      spray: 'drop',
      envMapIntensity: 0.32,
      renderOrder: 4
    });
    D.mesh.userData.probeSkip = true;
    D.mesh.userData.inspectLabel = ct.name;
    if (D.plunge) {
      D.plunge.userData.probeSkip = true;
      D.plunge.userData.inspectLabel = ct.name + ' Plunge Pool';
    }
    falls.push({ fall: S, draw: D });
  });

  const bh = AV.DIM.BASIN_HALF;
  const basinStill = WATER.still({
    name: 'Central Turbine Tailrace Basin',
    bounds: [-bh - 0.8, -bh - 0.8, bh + 0.8, bh + 0.8],
    level: wy,
    fountain: [0, 8.5]
  });
  const basinDraw = WATER.drawStill(basinStill, {
    color: lin(0x243b40),
    roughness: 0.14,
    metalness: 0.02,
    envMapIntensity: 0.36,
    renderOrder: 2
  });
  basinDraw.mesh.userData.probeSkip = true;
  basinDraw.mesh.userData.inspectLabel = 'Central Turbine Tailrace Basin';

  return {
    flows: flows,
    falls: falls,
    headboxStill: headboxStill,
    headboxDraw: headboxDraw,
    basinStill: basinStill,
    basinDraw: basinDraw
  };
})();
