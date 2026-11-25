// ================================================================= HOST WATER & SKY — ATMOS.skyBiome, core/water & core/ruins watch
// Draws Krator's standard coastal sky (`ATMOS.skyBiome`), captures skylight for water reflections, builds all four
// `core/water` surface kinds (open ocean, central park reflection pools, park waterway & linear canal, sea-cliff sluice
// cascade), rides moored vessels on the ocean wave twin, and watches the sub-cliff ruin on `core/ruins`.
const SKY = ATMOS.skyBiome({
  renderer: renderer,
  camera: camera,
  scene: scene,
  sun: sun,
  shade: false,
  site: { px: 215, py: 540 },
  preset: {
    air: { pressure: 1.02, humidity: 0.66 },
    clouds: { cover: 0.32, cumulus: 0.56, cirrus: 0.34 },
    fogDensity: 0.00010
  }
});

ATMOS.bindHost({
  THREE: THREE,
  scene: scene,
  camera: camera,
  renderer: renderer,
  ticks: TICKS,
  ground: (x, z) => AF_STAGE.ground(x, z),
  hour: () => (NIGHT ? 0.5 : 10.25),
  seed: 14808,
  viewH: () => innerHeight
});

{
  const envScene = new THREE.Scene(), WENV = { environment: null };
  envScene.add(SKY.legacy.sky);
  ATMOS.skylight({ renderer: renderer, sky: envScene, scene: WENV, ground: () => new THREE.Color(0x524c42) });
}

const AF_WATER = (function initAfWater() {
  const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
  const WREC = ARCOFORTE.waterRecords(AF_PLAN, WATER, null);

  /* 1. Northern Open Ocean (bounded at z <= -152 so it fills the NW Marina basin & meets the sea cliff and harbour platform) */
  const SEA = WATER.open({
    name: 'Northern Headland Sea',
    level: 0,
    swell: 'ringsea',
    field: 0.42,
    bounds: [-6000, -6000, 6000, -152],
    bed: (x, z) => AF_STAGE.ground(x, z),
    bedBox: [-420, -400, 420, -152],
    bedCell: 5
  });
  const seaDraw = WATER.draw(SEA, {
    color: lin(0x0b3648),
    shallow: lin(0x2a7684),
    deep: lin(0x082838),
    roughness: 0.18,
    metalness: 0.32,
    envMapIntensity: 0.25,
    normalMap: TEX.water,
    detailSize: 44
  });
  seaDraw.mesh.userData.probeSkip = true;
  seaDraw.mesh.userData.inspectLabel = 'Northern Headland Sea (y = 0 m)';

  /* Flat invisible pick plane for camera orbit/pan over the sea (core/water/README.md) */
  const pickGeo = new THREE.PlaneGeometry(3600, 2400);
  pickGeo.rotateX(-Math.PI / 2);
  const pickMesh = new THREE.Mesh(pickGeo, new THREE.MeshBasicMaterial({ visible: false }));
  pickMesh.position.set(0, 0, -1400);
  pickMesh.name = 'sea';
  pickMesh.userData.probeSkip = true;
  pickMesh.userData.lodSkip = true;
  scene.add(pickMesh);

  /* 2. Park Reflection Pools (`WATER.drawStill`) */
  const stillDraws = WREC.still.map(st => {
    const d = WATER.drawStill(st, {
      color: lin(0x225a6c),
      roughness: 0.12,
      metalness: 0.08,
      envMapIntensity: 0.38,
      renderOrder: 1
    });
    d.mesh.userData.probeSkip = true;
    d.mesh.userData.lodSkip = true;
    d.mesh.userData.inspectLabel = st.name;
    return d;
  });

  /* 3. Linear Canal & Central Park Waterway (`WATER.drawFlow`) */
  const flowDraws = WREC.flow.map(fl => {
    const d = WATER.drawFlow(fl, {
      shallow: lin(0x3c8c9c),
      deep: lin(0x1c586c),
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.06,
      envMapIntensity: 0.42,
      step: 8,
      across: 6,
      margin: 1.2,
      renderOrder: 1
    });
    d.mesh.userData.probeSkip = true;
    d.mesh.userData.lodSkip = true;
    d.mesh.userData.inspectLabel = fl.name;
    return d;
  });

  /* 4. Sea-Cliff Sluice Cascade (`WATER.drawFall`) */
  const fallDraws = WREC.fall.map(fa => {
    const d = WATER.drawFall(fa, {
      color: lin(0x9ad4e0),
      opacity: 0.88,
      rows: 32,
      cols: 7,
      plungeY: 0.2,
      spray: 'drop',
      lipK: 0.85,
      footK: 0.65,
      envMapIntensity: 0.28
    });
    d.mesh.userData.probeSkip = true;
    d.mesh.userData.lodSkip = true;
    d.mesh.userData.inspectLabel = fa.name;
    if (d.plunge) {
      d.plunge.userData.probeSkip = true;
      d.plunge.userData.lodSkip = true;
    }
    return d;
  });

  /* 5. Floating fishing/salvage vessels ride the ocean wave twin (`WATER.ride`); lifted vessels stay in their cradles */
  TICKS.push(function rideAfVessels(_dt, t) {
    const sec = t == null ? 0 : t;
    AF_DRAWN.vesselGroups.forEach(vg => {
      if (vg.rec.lifted) return;
      WATER.ride(vg.group, { L: vg.rec.L, B: vg.rec.B }, vg.rec.x, vg.rec.z, 0, sec, 0, (wx, wz, wt) => SEA.heightAt(wx, wz, wt));
    });
  });

  return { sea: SEA, records: WREC, seaDraw, stillDraws, flowDraws, fallDraws };
})();

/* Watch the sub-cliff vault ruin on core/ruins (universal verify check + KRUINS.selfTest) */
if (typeof KRUINS !== 'undefined' && AF_DRAWN.ruinVaultGroup) {
  KRUINS.watch(AF_DRAWN.ruinVaultGroup, {
    name: 'Sub-Cliff Automated Industry Vault Ruin',
    ground: (x, z) => AF_STAGE.ground(x, z)
  });
}
