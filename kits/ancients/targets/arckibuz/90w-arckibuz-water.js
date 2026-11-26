/* ================================================================= ARCKIBUZ — [draw] core/water binding & core/ruins watch
   Runs after 90-scene.js (builders + kbake). Binds core/atmos (AKB_SKY, AKB_ENV), draws all AKB_WATER still/flow/fall
   records across intact (d=0), ruined (d=1), and refurbished (d=3) sites, and registers KRUINS.watch on the d=1 ruin. */
ATMOS.init({
  THREE, scene, camera,
  hour: () => (typeof NIGHT !== 'undefined' && NIGHT) ? 0 : 13,
  onFrame: fn => TICKS.push(fn),
  ground: (x, z) => terrainH(x, z),
  seed: 12727,
  err: m => console.warn(m),
  viewH: () => innerHeight,
  pixelRatio: () => renderer.getPixelRatio()
});
const AKB_SKY = new THREE.Scene(), AKB_ENV = { environment: null };
AKB_SKY.add(new THREE.Mesh(sky.geometry, skyMat));
{
  const g = giant.clone();
  g.position.copy(giantDir).multiplyScalar(7000);
  AKB_SKY.add(g);
}
ATMOS.skylight({
  renderer,
  sky: AKB_SKY,
  scene: AKB_ENV,
  ground: () => new THREE.Color(0x8a6446),
  key: () => (typeof NIGHT !== 'undefined' && NIGHT) ? 'n' : 'd'
});

{
  const lin = h => new THREE.Color(h).convertSRGBToLinear();
  const tag = (o, label) => {
    if (!o) return;
    o.userData.lodSkip = true;
    o.userData.probeSkip = false;
    o.userData.inspectLabel = label;
  };
  for (let i = 0; i < AKB_WATER.sites.length; i++) {
    const site = AKB_WATER.sites[i];
    for (let j = 0; j < site.still.length; j++) {
      const S = site.still[j];
      const D = WATER.drawStill(S, {
        color: lin(site.d === 1 ? 0x5c6852 : 0x266b84),
        roughness: site.d === 1 ? 0.35 : 0.08,
        metalness: 0.05,
        envMapIntensity: 0.5,
        renderOrder: 1
      });
      tag(D.mesh, S.name);
    }
    for (let j = 0; j < site.flow.length; j++) {
      const S = site.flow[j];
      const D = WATER.drawFlow(S, {
        shallow: lin(0x5f9a94),
        deep: lin(0x285c68),
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.05,
        envMapIntensity: 0.5,
        step: 6,
        across: 4,
        margin: 0.5
      });
      tag(D.mesh, S.name);
    }
    for (let j = 0; j < site.fall.length; j++) {
      const S = site.fall[j];
      const D = WATER.drawFall(S, {
        color: lin(0xd6eaee),
        opacity: 0.9,
        rows: 16,
        cols: 6,
        plungeY: 14.48,
        spray: true,
        lipK: 0.85,
        footK: 0.6,
        envMapIntensity: 0.3
      });
      tag(D.mesh, S.name);
      tag(D.plunge, S.name + ' plunge');
    }
  }
}

/* Watch the d = 1 ruin with core/ruins: zero floating pieces, every detached wreck seated on AKB_WATER.ground */
{
  const R = AKB_WATER.sites.find(s => s.d === 1);
  if (R && typeof KRUINS !== 'undefined') {
    const GROUND_MATS = new Set([
      MAT.ground, MAT.rock, MAT.mud, MAT.lawn,
      MAT.akbDesert, MAT.akbCliff, MAT.akbFieldGreen, MAT.akbFieldRehab, MAT.akbFieldDry, MAT.akbRoad
    ]);
    KRUINS.watch(scene, {
      name: 'Arckibuz, the desert ruin',
      inside: (x, z) => Math.abs(x - R.gx) < 365 && Math.abs(z - R.gz) < 365,
      ground: (x, z) => AKB_WATER.ground(R, x, z),
      skip: (m, def) => GROUND_MATS.has(m.material) ||
        !!(m.userData && (m.userData.lodSkip || m.userData.akbGround)) ||
        !!(def && /^akbCrop/.test(def))
    });
  }
}
