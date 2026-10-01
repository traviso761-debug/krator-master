/* ======================== View: walker figures (THREE) ========================
   IX.view.figures(walkers) -> THREE.Group of simple capsule figures (a body, a head, a nose
   that shows the heading), one per IX.life walker. group.userData.update(t, shows) poses every
   figure at time t from W.at(t) (47-life.js: a pure function of t); shows(pose) -> false hides a
   figure (the demo hides figures on storeys the level selector hides). A dwelling figure on a
   seat sits lower.
   ====================================================================== */
(function (IX) {
  'use strict';
  const V = IX.view = IX.view || {};
  const COLS = [0x6a4a8a, 0x2f6f8f, 0x8a3a2a, 0x3f7a3a, 0x9a7a2a, 0x5a5a6a, 0x8a5a3a, 0x2a5a5a];
  V.figures = function (walkers) {
    const grp = new THREE.Group();
    grp.name = 'walkers';
    const skin = V.lambert(0xd8a888), bodyG = new THREE.CylinderGeometry(0.2, 0.22, 1.0, 10), capG = new THREE.SphereGeometry(0.2, 10, 6),
      headG = new THREE.SphereGeometry(0.15, 10, 8), noseG = new THREE.BoxGeometry(0.06, 0.06, 0.12);
    const figs = walkers.map(function (W, i) {
      const f = new THREE.Group(), mat = V.lambert(COLS[i % COLS.length]);
      const body = new THREE.Mesh(bodyG, mat); body.position.y = 0.72; f.add(body);
      const cap = new THREE.Mesh(capG, mat); cap.position.y = 1.2; cap.scale.y = 0.6; f.add(cap);
      const foot = new THREE.Mesh(capG, mat); foot.position.y = 0.24; foot.scale.set(1.05, 0.6, 1.05); f.add(foot);
      const head = new THREE.Mesh(headG, skin); head.position.y = 1.47; f.add(head);
      const nose = new THREE.Mesh(noseG, skin); nose.position.set(0, 1.47, 0.15); f.add(nose);
      f.userData.walker = W.id;
      f.traverse(function (o) { o.userData.walker = W.id; });
      grp.add(f);
      return f;
    });
    grp.userData.update = function (t, shows) {
      walkers.forEach(function (W, i) {
        const f = figs[i], p = W.at(t);
        if (p.state === 'away' || (shows && !shows(p, W))) { f.visible = false; return; }
        f.visible = true;
        const sit = p.state === 'dwell' && W.target && W.target.final;
        f.position.set(p.x, p.y - (sit ? 0.5 : 0), p.z);
        f.rotation.y = p.heading || 0;
      });
    };
    grp.userData.figures = figs;
    return grp;
  };
})(KratorInteriors);
