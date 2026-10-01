/* ======================================================================
   Krator Asset Engine
   Shared contract + geometry kit for the ASSET (building) / FURN / PLANT
   registries harvested from Voth, Iziz, Mav's Refuge, Girder, Yuni and the
   Ancients kit. Include this file (or the equivalent globals from your own
   build) before krator-master-furniture.js, krator-master-plants.js and/or
   krator-master-buildings-*.js.

   (2026-10: the registries, palettes, frame and geometry kit are in
   krator-furniture-core.js, loaded BEFORE this file; this file is the page:
   scene, camera, renderer, controls, ground, labels and the frame loop.)

   Provides: scene/camera/renderer, orbit + WASD/walk camera control, a
   geometry kit (box/cyl/cone/dome/blob/ball/beam/rod/frustum/pyrRoof), a
   procedural F.tree() helper, the three registries with per-variant
   variantDims support, buildAsset/buildFurn/buildPlant (each returning a
   selectable THREE.Group), rebuildInstance() and measureInstance(), the
   per-culture furniture palette FPAL (F.col / F.cols / key-aware F.pick and
   F.shade) and the building type vocabulary BUILDING_TYPES.

   Conventions that matter:
     - box/cyl/cone/dome sit with their BOTTOM at y; blob/ball are CENTRED at y.
     - The build frame's origin is the footprint centre on the ground, +z FRONT.
     - F.frustum's r is a HALF-WIDTH: the block spans 2*r. With sides:4 the flat
       faces are square to the frame, so the front face sits at local z = +r.
       It is square in plan and cannot make a rectangular trough — use boxes.
     - F.pyrRoof covers EXACTLY w by d at the eaves and meets at one point;
       F.hipRoof covers the same w by d but rises to a RIDGE along the longer
       side — use it for any roof that is not square.
     - A vertical-axis F.cyl cannot be tilted; use F.rod/F.beam between two
       points for anything leaning, arching or horizontal.
     - For a block placed at (cos a, sin a) * r, ry = -a points its long axis
       RADIALLY; for a tangential ring segment you want ry = -a - PI/2.
     - measureInstance() measures transformed vertices, not Box3.expandByObject,
       which takes the AABB of an AABB and overstates anything rotated off-axis.
   ====================================================================== */

/* ---------------------------------------------------------------- scene */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd8dccb);
scene.fog = new THREE.Fog(0xc9cdbb, 700, 2800);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 5000);
camera.position.set(0, 70, 130);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('app').appendChild(renderer.domElement);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.86;

scene.add(new THREE.HemisphereLight(0xcfd9f2, 0x3d3a2c, 0.42));
const sun = new THREE.DirectionalLight(0xffeccb, 1.55);
sun.position.set(160, 260, 90);
scene.add(sun);
/* low cool fill from the opposite side so unlit faces read as form, not flat white */
const fill = new THREE.DirectionalLight(0x8ea6cc, 0.28);
fill.position.set(-140, 90, -120);
scene.add(fill);

/* subdivided: one 8 km quad interpolates depth badly in software GL (SwiftShader), and
   hid anything within ~3 cm of the ground (labels, rugs, mats) a few metres off the origin */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(8000, 8000, 100, 100),
  new THREE.MeshLambertMaterial({ color: 0x9b9472 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const grid = new THREE.GridHelper(8000, 400, 0x333333, 0x333333);
grid.material.opacity = 0.05;
grid.material.transparent = true;
scene.add(grid);

/* ------------------------------------------------------- camera control
   Minimal self-contained orbit/pan/zoom + WASD fly/walk, no external dependency.
   Two modes share one anchor (ctl.target) and one heading (az/el):
     orbit  — camera sits ctl.dist away, orbiting the anchor
     walk   — camera sits AT the anchor looking along the heading (first person)
   WASD moves the anchor in both, so it pans the sheet in orbit and walks in walk. */
const ctl = {
  target: new THREE.Vector3(0, 6, 0), dist: 150, az: 0.9, el: 0.55,
  dragging: false, panning: false, lastX: 0, lastY: 0,
  walk: false, eyeHeight: 1.7, speed: 1,
  keys: Object.create(null)
};
function _headingVecs() {
  /* fwd = the way the camera faces, flattened to the ground; right = the camera's right hand
     (fwd turned clockwise seen from above: facing -z, right is +x) */
  const fwd = new THREE.Vector3(-Math.sin(ctl.az), 0, -Math.cos(ctl.az));
  const right = new THREE.Vector3(Math.cos(ctl.az), 0, -Math.sin(ctl.az));
  return { fwd, right };
}
function updateCamera() {
  if (ctl.walk) {
    const el = Math.max(-1.35, Math.min(1.35, ctl.el));
    camera.position.copy(ctl.target);
    const dir = new THREE.Vector3(-Math.cos(el) * Math.sin(ctl.az), -Math.sin(el), -Math.cos(el) * Math.cos(ctl.az));
    camera.lookAt(camera.position.clone().add(dir));
  } else {
    const el = Math.max(0.05, Math.min(1.45, ctl.el));
    const x = ctl.target.x + ctl.dist * Math.cos(el) * Math.sin(ctl.az);
    const y = ctl.target.y + ctl.dist * Math.sin(el);
    const z = ctl.target.z + ctl.dist * Math.cos(el) * Math.cos(ctl.az);
    camera.position.set(x, y, z);
    camera.lookAt(ctl.target);
  }
}
updateCamera();
renderer.domElement.addEventListener('mousedown', (e) => {
  if (e.button === 2) ctl.panning = true; else ctl.dragging = true;
  ctl.lastX = e.clientX; ctl.lastY = e.clientY;
});
window.addEventListener('mouseup', () => { ctl.dragging = false; ctl.panning = false; });
window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - ctl.lastX, dy = e.clientY - ctl.lastY;
  ctl.lastX = e.clientX; ctl.lastY = e.clientY;
  if (ctl.dragging) {
    ctl.az -= dx * 0.006;
    ctl.el += (ctl.walk ? dy * 0.005 : dy * 0.006);     /* walk: drag down to look down, as drag right looks right */
    updateCamera();
  } else if (ctl.panning) {
    const { fwd, right } = _headingVecs();
    const k = ctl.walk ? 0.05 : ctl.dist * 0.0015;
    ctl.target.addScaledVector(right, -dx * k);          /* right-drag pans: the ground follows the pointer */
    ctl.target.addScaledVector(fwd, -dy * k);
    updateCamera();
  }
});
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
renderer.domElement.addEventListener('wheel', (e) => {
  if (ctl.walk) { ctl.speed = Math.max(0.15, Math.min(8, ctl.speed * (1 - e.deltaY * 0.001))); }
  else { ctl.dist = Math.max(3, Math.min(2000, ctl.dist * (1 + e.deltaY * 0.001))); }
  updateCamera(); e.preventDefault();
}, { passive: false });
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* --------------------------------------------------------- WASD movement */
const _MOVE_KEYS = { w: 1, a: 1, s: 1, d: 1, q: 1, e: 1, ' ': 1, shift: 1, control: 1 };
function _isTyping(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}
window.addEventListener('keydown', (e) => {
  if (_isTyping(e)) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
  ctl.keys[k] = true;
  if (_MOVE_KEYS[k]) e.preventDefault();
  if (k === 'f') { window._setWalk(!ctl.walk); }
});
window.addEventListener('keyup', (e) => { ctl.keys[e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { ctl.keys = Object.create(null); });

window._setWalk = function (on) {
  if (on === ctl.walk) return;
  const { fwd } = _headingVecs();
  if (on) {
    /* step into the scene: stand where the camera was looking, at eye height */
    ctl.target.copy(camera.position);
    ctl.target.y = ctl.eyeHeight;
    ctl.walk = true;
    ctl.el = Math.max(-0.2, Math.min(0.35, ctl.el * 0.3));
  } else {
    ctl.walk = false;
    ctl.dist = Math.max(30, ctl.dist);
    ctl.target.addScaledVector(fwd, ctl.dist * 0.35);
    ctl.target.y = 6;
    ctl.el = 0.55;
  }
  updateCamera();
  if (window._onWalkChange) window._onWalkChange(ctl.walk);
};

let _lastT = performance.now();
function _moveStep(now) {
  const dt = Math.min((now - _lastT) / 1000, 0.1);
  _lastT = now;
  const k = ctl.keys;
  let mx = 0, mz = 0, my = 0;
  if (k['w']) mz += 1;
  if (k['s']) mz -= 1;
  if (k['d']) mx += 1;
  if (k['a']) mx -= 1;
  if (k['e'] || k[' ']) my += 1;
  if (k['q']) my -= 1;
  if (!mx && !mz && !my) return;
  /* base speed: metres/sec. In orbit it scales with how far out you are, so it
     feels the same whether you're reading a whole row or one doorway. */
  let base = ctl.walk ? 9 * ctl.speed : Math.max(12, ctl.dist * 0.55);
  if (k['shift']) base *= 3.4;
  if (k['control'] || k['alt']) base *= 0.28;
  const step = base * dt;
  const { fwd, right } = _headingVecs();
  if (mz) ctl.target.addScaledVector(fwd, mz * step);
  if (mx) ctl.target.addScaledVector(right, mx * step);
  if (my) ctl.target.y += my * step;
  if (ctl.walk) ctl.target.y = Math.max(0.4, ctl.target.y);
  updateCamera();
}

window._gotoRow = function (z, width) {
  ctl.walk = false;
  ctl.target.set(width ? width / 2 - 20 : 0, 6, z);
  ctl.dist = Math.max(70, (width || 140) * 0.7);
  ctl.az = 0.75; ctl.el = 0.55;
  updateCamera();
  if (window._onWalkChange) window._onWalkChange(false);
};

/* --------------------------------------------------------------- labels */
function groundLabel(text, x, z, big) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = big ? 160 : 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = big ? 'rgba(30,26,18,0.92)' : 'rgba(255,255,255,0.88)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = big ? '#f5efdd' : '#20201a';
  ctx.font = (big ? 'bold 64px' : '40px') + ' Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 512, big ? 100 : 82);
  const tex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(big ? 34 : 15, big ? 5.3 : 1.9);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, big ? 0.08 : 0.06, z);
  scene.add(m);
  return m;
}
function scaleFigure(x, z) {
  mkCyl(x, 0, z, 0.22, 1.5, 0, 0x3a5a7a, 'cloth');
  mkBall(x, 1.68, z, 0.22, 0xe0b090, 'skin');
}

function animate(now) {
  requestAnimationFrame(animate);
  _moveStep(now || performance.now());
  if (window._inspectorTick) window._inspectorTick();
  if (window._frameHooks) for (const fh of window._frameHooks) fh(now || performance.now());
  renderer.render(scene, camera);
}
animate();
