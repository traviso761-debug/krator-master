// ================================================================= ARCODIGA — water drawn by core/water, ruin watched by core/ruins
// Binds core/atmos waves & skylight for water surfaces only (leaving the Ancients kit's tuned materials unchanged),
// draws ADG_WATER's reservoir, hydro tailraces, Y-waterways and breach cascade, and registers the ruined site (d === 1)
// with KRUINS.watch so verify.py asserts zero floating pieces and zero unseated wrecks.

ATMOS.init({
  THREE: THREE, scene: scene, camera: camera,
  hour: () => (typeof NIGHT !== 'undefined' && NIGHT) ? 0 : 13,
  onFrame: fn => TICKS.push(fn),
  ground: (x, z) => terrainH(x, z),
  seed: 12709,
  err: m => console.warn(m),
  viewH: () => innerHeight,
  pixelRatio: () => renderer.getPixelRatio()
});

const ADG_SKY = new THREE.Scene(), ADG_ENV = { environment: null };
ADG_SKY.add(new THREE.Mesh(sky.geometry, skyMat));
{
  const g = giant.clone();
  g.position.copy(giantDir).multiplyScalar(7000);
  ADG_SKY.add(g);
}
ATMOS.skylight({
  renderer: renderer, sky: ADG_SKY, scene: ADG_ENV,
  ground: () => new THREE.Color(0x5a4636),
  key: () => (typeof NIGHT !== 'undefined' && NIGHT) ? 'n' : 'd'
});

{
  const lin = h => new THREE.Color(h).convertSRGBToLinear();
  const tag = (o, label) => {
    if (!o) return;
    o.userData.lodSkip = true;
    o.userData.inspectLabel = label;
  };
  for (const site of ADG_WATER.sites) {
    const isRuin = site.d === 1;
    for (const S of site.still) {
      const D = WATER.drawStill(S, {
        color: lin(isRuin ? 0x3b6c72 : 0x2c6884),
        roughness: 0.1, metalness: 0.05, envMapIntensity: 0.5, renderOrder: 1
      });
      tag(D.mesh, S.name);
    }
    for (const S of site.flow) {
      const D = WATER.drawFlow(S, {
        shallow: lin(0x689894), deep: lin(0x2d5c64), color: 0xffffff,
        roughness: 0.1, metalness: 0.05, envMapIntensity: 0.5, step: 10, across: 6, margin: 1.5
      });
      tag(D.mesh, S.name);
    }
    for (const S of site.fall) {
      const D = WATER.drawFall(S, {
        color: lin(0xd4e6ea), opacity: 0.92,
        rows: S.drop > 100 ? 60 : 16, cols: 8,
        plungeY: isRuin ? 1.2 : 1.7, spray: true, lipK: 0.85, footK: 0.6, envMapIntensity: 0.3
      });
      tag(D.mesh, S.name);
      tag(D.plunge, S.name + ' plunge');
    }
  }
}

/* Watch the ruined site (d === 1) with core/ruins: 0 floating pieces, every detached wreck seated on the drawn ground */
{
  const R = ADG_WATER.sites.find(s => s.d === 1);
  if (R && typeof KRUINS !== 'undefined') {
    const c = R.c, GROUND = new Set([MAT.rock, MAT.mud, MAT.lawn]);
    KRUINS.watch(scene, {
      name: 'Arcodiga, the ruin',
      inside: (x, z) => Math.abs(x - c.gx) < ARCODIGA.DIM.SPAN / 2 + 40 && z - c.gz > -680 && z - c.gz < 720,
      ground: (x, z) => ADG_WATER.ground(R, x, z),
      skip: (m, def) => GROUND.has(m.material)
        || !!(m.userData && (m.userData.lodSkip || m.userData.interiorFloors))
        || def === 'aiPartR' || def === 'plank'
    });
  }
}
