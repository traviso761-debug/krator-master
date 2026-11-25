// ================================================================= CASCADE — stage: refurbished centerpiece, intact & ruined  [web]
// Stages all three states in the showcase world:
//   - (0, 0): Iron Republic Refurbished Cascade (with elevated aqueduct, central cataracts & twin circular gardens)
//   - (-900, -700): Ancient Intact Cascade
//   - (+900, -700): Post-Cataclysm Ruined Cascade (watched by KRUINS.watch)
(function () {
  'use strict';

  TAGS = KTAGS.page || (KTAGS.page = KTAGS.create({ build: 'cascade' }));
  AV.SITES = {};
  AV.STAGE = { ready: false, siteGroup: null };

  // Apply persistent browser/file edits overlay (39-host-edits.js) if present
  var pRef = AV.plan({ state: 'refurbished', culture: 'republican', seed: 19690 });
  if (typeof KHOST_EDITS !== 'undefined' && KHOST_EDITS && KHOST_EDITS.ops) {
    AV.applyEdits(pRef, KHOST_EDITS);
  }
  var pInt = AV.plan({ state: 'intact', culture: 'ancient', seed: 19690 });
  var pRui = AV.plan({ state: 'ruined', culture: 'ancient', seed: 19690 });

  // 1. Site ground, KDRAWN heightfields, Twin Circular Gardens & northern-highlands flora
  var siteGroup = AV.buildSite(19690);
  scene.add(siteGroup);
  AV.STAGE.siteGroup = siteGroup;

  // 2. Build the three 220 m arcology complexes
  var heroRef = AV.buildHero(pRef, { x: 0, y: 0, z: 0 });
  var heroInt = AV.buildHero(pInt, { x: -900, y: 0, z: -700 });
  var heroRui = AV.buildHero(pRui, { x: 900, y: 0, z: -700 });
  scene.add(heroRef);
  scene.add(heroInt);
  scene.add(heroRui);

  AV.SITES.refurbished = { key: 'refurbished', x: 0, y: 0, z: 0, plan: pRef, hero: heroRef };
  AV.SITES.intact = { key: 'intact', x: -900, y: 0, z: -700, plan: pInt, hero: heroInt };
  AV.SITES.ruined = { key: 'ruined', x: 900, y: 0, z: -700, plan: pRui, hero: heroRui };

  // 3. Register the ruined arcology with core/ruins (KRUINS.watch: universal verify assert checks 0 floaters & seated wrecks)
  KRUINS.watch(heroRui, {
    name: 'Cascade post-Cataclysm ruin',
    ground: function (x, z) { return terrainH(x, z); },
    analyse: { touch: 0.65, held: 0.65, lift: 0.35, sink: 1.0, wreckH: 25.0 }
  });

  // 4. Camera-independent interior record pass + always-visible Assembly Hall relic & millwright floor fixtures
  AV.ensureRecords('refurbished');
  ['refurbished', 'intact'].forEach(function (sk) {
    var hpGroup = AV.buildHallFloorProps(sk);
    if (hpGroup) {
      scene.add(hpGroup);
      AV.SITES[sk].hallProps = hpGroup;
    }
  });
  AV.walkSync();

  // 5. Optional sun shadow map (off by default per repo rule; ?shadow=1 or panel toggle turns it on)
  AV.shadow = /[?&]noshadow/.test(location.search) ? null : KSHADOW.attach({ renderer: renderer, scene: scene, camera: camera, sun: sun, ground: terrainH });
  if (AV.shadow) {
    [heroRef, heroInt, heroRui].forEach(function (h) { AV.shadow.cast(h); });
  }

  AV.STAGE.ready = true;
})();
