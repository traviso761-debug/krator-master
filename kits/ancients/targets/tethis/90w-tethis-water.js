/* ================================================================= TETHIS — shallow sea on core/water & ruins check ([draw])
   Binds core/atmos and core/water after 90-scene.js bakes the kit, retunes the daytime sky dome to a pelagic coastal
   azure matching the sea horizon seamlessly, draws the crystal-clear turquoise shallow coral sea over TETHISWATER's
   bathymetry, hooks vessel heave onto WATER.rideOn, shifts scene lighting & fog to tropical cyan underwater when
   camera.position.y < -0.35 m, and watches the modern Hykkousoi site + Salvage Island P8 with KRUINS.watch. */

ATMOS.init({
  THREE: THREE,
  scene: scene,
  camera: camera,
  hour: function () { return (typeof NIGHT !== 'undefined' && NIGHT) ? 0 : 13.5; },
  onFrame: function (fn) { TICKS.push(fn); },
  ground: function (x, z) { return TETHISWATER.bed(x, z); },
  seed: 12609,
  err: function (m) { console.warn(m); },
  viewH: function () { return innerHeight; },
  pixelRatio: function () { return renderer.getPixelRatio(); }
});

{
  /* Seamless pelagic coastal azure sky dome & matching sea-mist horizon (eliminates stock desert-peach sky seam!) */
  HAZE.setHex(0xb8dce8);
  scene.fog.color.copy(HAZE);
  scene.fog.density = 0.00014;
  hemi.color.setHex(0xfff5e4);
  hemi.groundColor.setHex(0x387886);

  if (typeof skyMat !== 'undefined') {
    skyMat.fragmentShader =
      'uniform float u_n;varying vec3 vP;void main(){' +
      'float h=clamp(normalize(vP).y,-.05,1.);' +
      'vec3 hz=mix(vec3(.48,.72,.82),vec3(.028,.040,.068),u_n);' +
      'vec3 mid=mix(vec3(.22,.52,.74),vec3(.016,.024,.048),u_n);' +
      'vec3 zen=mix(vec3(.08,.28,.54),vec3(.008,.012,.028),u_n);' +
      'float u1=clamp(h*3.2,0.,1.);' +
      'float u2=pow(max(h,0.),.58);' +
      'vec3 c=mix(mix(hz,mid,u1),zen,u2);' +
      'gl_FragColor=vec4(c,1.);}';
    skyMat.needsUpdate = true;
  }

  const TETHIS_SKY = new THREE.Scene(), TETHIS_ENV = { environment: null };
  TETHIS_SKY.add(new THREE.Mesh(sky.geometry, skyMat));
  const gClone = giant.clone();
  gClone.position.copy(giantDir).multiplyScalar(7000);
  TETHIS_SKY.add(gClone);
  ATMOS.skylight({
    renderer: renderer,
    sky: TETHIS_SKY,
    scene: TETHIS_ENV,
    ground: function () { return new THREE.Color(0x287888); },
    key: function () { return (typeof NIGHT !== 'undefined' && NIGHT) ? 'n' : 'd'; }
  });

  const SEA = TETHISWATER.makeSea();
  const D = WATER.draw(SEA, {
    color: 0xffffff,
    shallow: 0x44e0d4,
    deep: 0x093e5c,
    ramp: [1.4, 24.0],
    transparent: true,
    roughness: 0.10,
    metalness: 0.08,
    envMapIntensity: 0.76,
    surf: 140,
    surfDepth: [0.2, 2.5],
    renderOrder: 2
  });
  if (D && D.material) {
    D.material.opacity = 0.64;
    D.material.side = THREE.DoubleSide;
  }

  /* Vessels and pearl-oyster buoys gently heave on the Ring Sea swell */
  ['nvBoatAnc', 'nvBoatHyk', 'nvSailHyk', 'nvBuoyPearl'].forEach(function (nm) {
    if (KIT.meshes[nm] && KIT.meshes[nm].material) {
      WATER.rideOn(KIT.meshes[nm].material, SEA);
    }
  });

  /* Allow preset & manual camera views to dive underwater and bathe underwater views in clear turquoise coral light! */
  TICKS.push(function () {
    if (typeof ctl === 'undefined') return;
    var r = ctl.radius;
    var rawY = ctl.target.y + r * Math.cos(ctl.phi);
    if (rawY < 2.0) {
      var minBed = TETHISWATER.bed(camera.position.x, camera.position.z) + 1.6;
      var cy = Math.max(minBed, rawY);
      if (cy > -0.45 && cy < 0.45) cy = rawY < 0 ? -0.55 : 0.55;
      camera.position.y = cy;
      camera.lookAt(ctl.target);
    }
    var isNight = (typeof NIGHT !== 'undefined' && NIGHT);
    if (camera.position.y < -0.35) {
      scene.fog.color.setHex(isNight ? 0x051c28 : 0x10687e);
      scene.fog.density = 0.0038;
      hemi.color.setHex(isNight ? 0x185468 : 0x4ae6f5);
      hemi.groundColor.setHex(isNight ? 0x06202e : 0x0e4662);
      sun.color.setHex(isNight ? 0x3888a8 : 0x7af2ff);
    } else {
      scene.fog.color.setHex(isNight ? 0x080c14 : HAZE.getHex());
      scene.fog.density = 0.00014;
      hemi.color.setHex(isNight ? 0x3c4c6a : 0xfff5e4);
      hemi.groundColor.setHex(isNight ? 0x121e26 : 0x387886);
      sun.color.setHex(isNight ? 0xa8bce6 : 0xfff0dc);
    }
  });
}

/* ---- core/ruins watch on the modern Hykkousoi site (d = 1): both main arcology AND Salvage Island P8 + fallen B_6_8 ---- */
{
  const R = TETHISWATER.sites.find(function (s) { return s.d > 0; });
  if (R && typeof KRUINS !== 'undefined') {
    const SKIP_DEFS = /^(nvBoatAnc|nvBoatHyk|nvSailHyk|nvBuoyPearl|nvCoralBrain|nvCoralStag|nvCoralFan|nvKelp|nvCapPortI|nvCapPortW|fireWin|ember|emberB)$/;
    KRUINS.watch(scene, {
      name: 'Tethis today (Hykkousoi arcology & Salvage Island P8)',
      inside: function (x, z) {
        return Math.abs(x - R.gx) < 880 && Math.abs(z - R.gz) < 700;
      },
      ground: function (x, z) {
        return TETHISWATER.ground(R, x, z);
      },
      skip: function (m, def) {
        if (m.userData && (m.userData.isSeabed || m.userData.lodSkip)) return true;
        if (def && SKIP_DEFS.test(def)) return true;
        return false;
      },
      analyse: { touch: 0.75, wreckH: 24 }
    });
  }
}
