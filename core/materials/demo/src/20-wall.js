/* ==== state, renderer, environment ==== */
const PANEL = 2, PITCH = 2.7, COLGAP = 1.6, ROWGAP = 1.2, PERLINE = 3;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1a19);
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 400);
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const view = {matte: 1, dome: false, mode: 'flat', channel: 'lit', repeat: 'metric', scaleMul: 1, tint: false, tintColor: '#c8a070',
              lightAz: -40, lightEl: 38, orbit: false, filter: {committed: true, new: true, scan: true}};

function buildEnv() {
    // a small equirectangular sky: warm ground, pale sky, two soft boxes, so metals have something to reflect
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const g = c.getContext('2d'), grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#9fb8dc'); grad.addColorStop(.45, '#d8dde6'); grad.addColorStop(.5, '#8a7e70'); grad.addColorStop(1, '#3a342e');
    g.fillStyle = grad; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#ffffff';
    g.fillRect(60, 40, 90, 40); g.fillRect(300, 55, 70, 30); g.fillRect(420, 30, 50, 50);
    const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(renderer);
    const t = pm.fromEquirectangular(tex).texture;
    pm.dispose(); tex.dispose();
    return t;
}
scene.environment = buildEnv();
const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x6b5f52, 0.35); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 2.4); scene.add(sun, sun.target);
function placeSun() {
    const az = view.lightAz * Math.PI / 180, el = view.lightEl * Math.PI / 180;
    sun.position.set(Math.sin(az) * Math.cos(el) * 30, Math.sin(el) * 30, Math.cos(az) * Math.cos(el) * 30).add(camTarget);
    sun.target.position.copy(camTarget);
}

/* ==== layout: rows = type, columns = culture ==== */
const L = DEMO.layout, SETS = DEMO.sets;
const cols = L.cols.filter(c => SETS.some(s => s.col === c));
const rows = L.rows.filter(r => SETS.some(s => s.row === r));
const cell = {};
SETS.forEach(s => ((cell[s.row + '|' + s.col] = cell[s.row + '|' + s.col] || []).push(s)));
const colW = cols.map(c => Math.max(1, ...rows.map(r => Math.min(PERLINE, (cell[r + '|' + c] || []).length))) * PITCH);
const rowH = rows.map(r => Math.max(1, ...cols.map(c => Math.ceil((cell[r + '|' + c] || []).length / PERLINE))) * PITCH);
const colX = [], rowY = [];
let x = 0; cols.forEach((c, i) => { colX.push(x); x += colW[i] + COLGAP; });
let y = 0; rows.forEach((r, i) => { rowY.push(y); y -= rowH[i] + ROWGAP; });
const wall = {w: x - COLGAP, h: -y - ROWGAP, left: 0, top: 0};

/* ==== panels ==== */
const frameMat = new THREE.MeshStandardMaterial({color: 0x2a2826, roughness: .9});
const frameGeo = new THREE.BoxGeometry(PANEL + .1, PANEL + .1, .1);
const planeGeo = new THREE.PlaneGeometry(PANEL, PANEL);
const panels = [];
const loader = {total: SETS.length * 3, done: 0};

function mkTex(url, srgb, cb) {
    const img = new Image();
    img.onload = () => {
        const t = new THREE.Texture(img);
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
        if (srgb) t.encoding = THREE.sRGBEncoding;
        t.needsUpdate = true; cb(t);
        loader.done++; document.getElementById('load').textContent = 'Loading textures… ' + loader.done + '/' + loader.total;
        if (loader.done === loader.total) document.getElementById('load').style.display = 'none';
    };
    img.src = url;
}
SETS.forEach(s => {
    const key = s.row + '|' + s.col, list = cell[key], i = list.indexOf(s);
    const r = rows.indexOf(s.row), c = cols.indexOf(s.col);
    const px = colX[c] + (i % PERLINE) * PITCH + PANEL / 2;
    const py = rowY[r] - Math.floor(i / PERLINE) * PITCH - PANEL / 2;
    const lit = new THREE.MeshStandardMaterial({roughness: 1, metalness: s.metal, color: 0xffffff,
        normalScale: new THREE.Vector2(1, 1), envMapIntensity: 0.9});
    // most scan roughness maps are mid-grey (AmbientCG grounds 0.45 to 0.65) and read as wet under a sun and an environment map:
    // pull non-metals toward matte by `Matte` (metals are left alone)
    const NATURAL = ['Ground', 'Stone & rock', 'Brick, paving & tile', 'Plaster & earth', 'Concrete', 'Bark & leaf', 'Roof', 'Fibre & organic', 'Cloth & canvas'];
    const GLOSSY = /marble|tiles144|mosaic|ceramic|glazed|lacquer|gilt|tile-|relief-tile/i;
    const floorV = GLOSSY.test(s.id + s.src) ? .55 : NATURAL.indexOf(s.row) >= 0 ? .9 : .7;   // the matte floor: nothing but polished things may be glossier
    const matteU = {value: s.metal > .3 ? 0 : view.matte}, floorU = {value: floorV};
    lit.onBeforeCompile = sh => { sh.uniforms.uMatte = matteU; sh.uniforms.uFloor = floorU; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', ['uniform float uMatte;', 'uniform float uFloor;', '#include <common>'].join(String.fromCharCode(10))).replace('#include <roughnessmap_fragment>', ['#include <roughnessmap_fragment>', 'roughnessFactor = roughnessFactor + (1.0 - roughnessFactor) * uMatte * 0.8;', 'roughnessFactor = max(roughnessFactor, uFloor * uMatte);'].join(String.fromCharCode(10))); };
    lit.customProgramCacheKey = () => 'matte';
    if (s.metal <= .3) lit.envMapIntensity = .35;
    const mesh = new THREE.Mesh(planeGeo, lit);
    const frame = new THREE.Mesh(frameGeo, frameMat.clone());
    mesh.position.set(px, py, 0); frame.position.set(px, py, -.06);
    mesh.userData.panel = s; scene.add(mesh, frame);
    const p = {s, matteU, mesh, frame, lit, basic: {}, tex: {}, px, py, cap: null};
    s._p = p; panels.push(p);
    mkTex(s.a, true, t => { p.tex.a = t; lit.map = t; lit.needsUpdate = true; applyRepeat(p); });
    mkTex(s.n, false, t => { p.tex.n = t; lit.normalMap = t; lit.needsUpdate = true; applyRepeat(p); });
    mkTex(s.r, false, t => { p.tex.r = t; lit.roughnessMap = t; lit.needsUpdate = true; applyRepeat(p); });
    const cap = document.createElement('div'); cap.className = 'cap';
    cap.innerHTML = '<span class=dot style="background:var(--' + s.status + ')"></span>' + s.id + (s.scaleGuess ? ' · scale?' : '') + '<small>' + s.scale[0] + ' m' + (s.also && s.also.length ? ' · also ' + s.also.join(', ') : '') + '</small>';
    document.getElementById('labels').appendChild(cap); p.cap = cap;
});

function repeatFor(s) {
    if (view.repeat === 'tile1') return [1, 1];
    if (view.repeat === 'tile3') return [3, 3];
    return [PANEL / (s.scale[0] * view.scaleMul), PANEL / (s.scale[1] * view.scaleMul)];
}
function applyRepeat(p) {
    const obj = view.mode === 'objects' && p.obj;
    const r = obj ? objRepeat(p) : repeatFor(p.s);
    ['a', 'n', 'r'].forEach(k => {
        const t = p.tex[k]; if (!t) return;
        t.repeat.set(r[0], r[1]);
        if (obj) t.offset.set(0, 0);
        else if (view.repeat === 'metric') t.offset.set((1 - r[0]) / 2, (1 - r[1]) / 2);
        else t.offset.set(0, 0);
    });
}
function basicMat(p, ch) {
    if (p.basic[ch]) return p.basic[ch];
    const t = p.tex[ch === 'albedo' ? 'a' : ch === 'normal' ? 'n' : 'r'];
    if (!t) return p.lit;
    return (p.basic[ch] = new THREE.MeshBasicMaterial({map: t}));
}
function applyView() {
    panels.forEach(p => {
        applyRepeat(p);
        if (p.s.metal <= .3) p.matteU.value = view.matte;
        p.mesh.material = view.channel === 'lit' ? p.lit : basicMat(p, view.channel);
        p.lit.color.set(view.tint && p.s.tint ? view.tintColor : '#ffffff');
        if (p.lit.color) p.lit.color.convertSRGBToLinear && p.lit.color.convertSRGBToLinear;
        const on = view.filter[p.s.status];
        const ob = view.mode === 'objects';
        if (p.obj) p.obj.traverse(o => { if (o.userData.uses) o.material = view.channel === 'lit' ? p.lit : basicMat(p, view.channel); });
        p.mesh.visible = p.frame.visible = on && !ob; if (p.obj) p.obj.visible = on && ob;
        if (p.obj) { p.objMain.visible = !(view.dome && p.objAlt); if (p.objAlt) p.objAlt.visible = !!view.dome; }
        p.cap.style.display = on ? '' : 'none';
    });
}

/* ==== camera: pan and zoom over the wall ==== */
const camTarget = new THREE.Vector3(wall.w / 2, -wall.h / 2, 0);
let camDist = 40, goal = null;
function setCam() {
    camera.position.set(camTarget.x, camTarget.y, camDist); camera.lookAt(camTarget);
}
let autoFit = true;
function barH() { const b = document.getElementById('bar'); return b ? b.offsetHeight : 0; }
function fitDist(w, h) {   // distance that shows a w x h metre rectangle in the area below the top bar
    const t = Math.tan(camera.fov * Math.PI / 360), H = Math.max(innerHeight - barH(), 50);
    return Math.min(380, Math.max(h / (2 * t) * innerHeight / H, w / (2 * t * (innerWidth / Math.max(innerHeight, 1)))));
}
function fitAll() { flyTo(wall.w / 2, -wall.h / 2, fitDist(wall.w + 8, wall.h + 8), true); }
function flyTo(x, y, d, auto) { if (![x, y, d].every(isFinite)) return; autoFit = !!auto; goal = {x, y, d}; }
function frameRect(x0, x1, y0, y1) { flyTo((x0 + x1) / 2, (y0 + y1) / 2, fitDist(x1 - x0 + 4, y1 - y0 + 3)); }
function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / Math.max(innerHeight, 1);
    camera.setViewOffset(innerWidth, innerHeight, 0, -barH() / 2, innerWidth, innerHeight); camera.updateProjectionMatrix();
    if (autoFit && innerHeight > 50) fitAll();
}
addEventListener('resize', resize); resize();
