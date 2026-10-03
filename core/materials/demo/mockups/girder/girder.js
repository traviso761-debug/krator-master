/* Girder material mockup. Coordinates in metres, Y up. Numbers follow settlements/girder (towers, species, palette).
   Nothing here is Girder's code: it is a stand-in that uses the new texture sets to judge them in place. */
'use strict';
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const HAZE = 0xb7c4ae;
scene.background = new THREE.Color(HAZE);
scene.fog = new THREE.FogExp2(HAZE, 0.00135);
const camera = new THREE.PerspectiveCamera(50, 1, 0.3, 6000);
const aniso = renderer.capabilities.getMaxAnisotropy();

/* ---------- seeded random ---------- */
let seed = 300001;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
const rr = (a, b) => a + (b - a) * rnd();
const pick = a => a[Math.floor(rnd() * a.length)];

/* ---------- textures ---------- */
const IMG = {};
const LIMG = {};
function loadAll() {
    const names = Object.keys(TEX); let n = 0, tot = names.length * 2 + Object.keys(LEAF).length;
    const lp = Object.keys(LEAF).map(k => new Promise(res => { const im = new Image(); im.onload = () => { LIMG[k] = im; n++; res(); }; im.src = LEAF[k].a; }));
    return Promise.all(lp.concat(names.flatMap(k => ['a', 'n'].map(c => new Promise(res => {
        const im = new Image(); im.onload = () => { IMG[k + c] = im; n++; document.getElementById('load').textContent = 'Loading textures… ' + n + '/' + tot; res(); }; im.src = TEX[k][c];
    })))));
}
/* large-scale colour variation by world position, so repeated tiles do not read as a grid at a distance */
let macroTex = null;
function macroize(m, scale, lo, hi) {
    if (!macroTex) { const c = cnv(256, 256), g = c.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 420; i++) { const x = rnd() * 256, y = rnd() * 256, r = rr(10, 60), v = rnd() < .5 ? 0 : 255, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + v + ',' + v + ',' + v + ',.5)'); gr.addColorStop(1, 'rgba(' + v + ',' + v + ',' + v + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
        macroTex = new THREE.CanvasTexture(c); macroTex.wrapS = macroTex.wrapT = THREE.RepeatWrapping; }
    const k = 'macro' + scale + lo + hi;
    m.onBeforeCompile = sh => {
        const NL = String.fromCharCode(10);
        sh.uniforms.uMacro = {value: macroTex};
        sh.vertexShader = sh.vertexShader.replace('#include <common>', 'varying vec3 vWPos;' + NL + '#include <common>').replace('#include <begin_vertex>', ['#include <begin_vertex>', 'vec4 wp_ = vec4(transformed, 1.0);', '#ifdef USE_INSTANCING', 'wp_ = instanceMatrix * wp_;', '#endif', 'vWPos = (modelMatrix * wp_).xyz;'].join(NL));
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', 'uniform sampler2D uMacro;' + NL + 'varying vec3 vWPos;' + NL + '#include <common>').replace('#include <map_fragment>', ['#include <map_fragment>', '{ vec2 mu_ = vec2(vWPos.x + vWPos.z * 0.7, vWPos.y * 0.9 + vWPos.z * 0.35) / ' + scale.toFixed(1) + '; float n_ = texture2D(uMacro, mu_).r * 0.65 + texture2D(uMacro, mu_ * 3.7 + 0.31).r * 0.35; diffuseColor.rgb *= mix(' + lo.toFixed(2) + ', ' + hi.toFixed(2) + ', n_); }'].join(NL));
    };
    m.customProgramCacheKey = () => k; return m;
}
const texCache = {};
function tx(k, c, mx, my) {   // texture k (colour 'a' or normal 'n') tiling every mx by my metres
    const key = [k, c, mx, my].join('|');
    if (texCache[key]) return texCache[key];
    const t = new THREE.Texture(IMG[k + c]); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
    if (c === 'a') t.encoding = THREE.sRGBEncoding;
    t.repeat.set(1 / mx, 1 / (my || mx)); t.needsUpdate = true; return (texCache[key] = t);
}
const matCache = {};
function M(k, scale, o) {   // PBR material from a set; scale = metres per tile (default the set's own)
    o = o || {}; const s = scale || TEX[k].s || 2, key = k + '|' + s + '|' + JSON.stringify(o);
    if (matCache[key]) return matCache[key];
    const m = new THREE.MeshStandardMaterial(Object.assign({map: tx(k, 'a', s), normalMap: tx(k, 'n', s), roughness: o.rough == null ? .85 : o.rough, metalness: o.metal || 0, color: o.color || 0xffffff}, o.extra || {}));
    if (o.side) m.side = o.side;
    if (o.macro !== false) macroize(m, o.macroScale || 70, .62, 1.22);
    return (matCache[key] = m);
}
/* UVs in metres, so a set keeps its size on any box or cylinder */
function worldUV(geo) {
    const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) {
        const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
        if (ay >= ax && ay >= az) uv.setXY(i, p.getX(i), p.getZ(i)); else if (ax >= az) uv.setXY(i, p.getZ(i), p.getY(i)); else uv.setXY(i, p.getX(i), p.getY(i));
    }
    return geo;
}
function cylUV(geo, r) { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, Math.atan2(p.getX(i), p.getZ(i)) * r, p.getY(i)); return geo; }
function BX(w, h, d) { return worldUV(new THREE.BoxGeometry(w, h, d)); }
function add(geo, mat, x, y, z, o) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (o) { if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; if (o.noShadow !== true) { m.castShadow = true; } if (o.recv !== false) m.receiveShadow = true; } else { m.castShadow = m.receiveShadow = true; } (o && o.parent || scene).add(m); return m; }

/* ---------- canvases: noise masks, leaves, ferns, vines ---------- */
function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function blobMask(size, blobs, fn) {   // white blobs on black, used as alpha
    const c = cnv(size, size), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, size, size);
    for (let i = 0; i < blobs; i++) {
        const x = rnd() * size, y = rnd() * size, r = fn ? fn(x, y) : rr(8, 40), gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const t = new THREE.CanvasTexture(c); return t;
}
function leafTex() {
    const c = cnv(256, 256), g = c.getContext('2d');
    for (let i = 0; i < 170; i++) {
        const x = rnd() * 256, y = rnd() * 256, a = rnd() * Math.PI, l = rr(12, 26), w = l * rr(.25, .38), sh = 150 + rnd() * 90 | 0;
        for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) {
            g.save(); g.translate(x + dx, y + dy); g.rotate(a); g.fillStyle = 'rgb(' + sh + ',' + sh + ',' + sh + ')';
            g.beginPath(); g.ellipse(0, 0, l, w, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-l, 0); g.lineTo(l, 0); g.stroke(); g.restore();
        }
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t;
}
function fernTex() {
    const c = cnv(128, 128), g = c.getContext('2d'); g.lineCap = 'round';
    for (let f = 0; f < 9; f++) {
        const ang = (f / 8 - .5) * 2.3, L = rr(48, 62); g.save(); g.translate(64, 126); g.rotate(ang);
        g.strokeStyle = '#2a5a2a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * .08, -L * .55, L * .22, -L); g.stroke();
        for (let i = 3; i < 22; i++) { const t = i / 22, px = L * .22 * t * t * 1.0, py = -L * t, ln = 13 * (1 - t * .85) + 2; g.strokeStyle = i % 2 ? '#3a7a34' : '#2f6a2c'; g.lineWidth = 1.7 * (1 - t * .5); g.beginPath(); g.moveTo(px, py); g.lineTo(px - ln, py - ln * .4); g.moveTo(px, py); g.lineTo(px + ln, py - ln * .4); g.stroke(); }
        g.restore();
    }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
function vineTex() {
    const c = cnv(128, 512), g = c.getContext('2d'); g.lineCap = 'round';
    for (let v = 0; v < 6; v++) {
        let x = rr(14, 114); const ph = rnd() * 6, am = rr(3, 9); g.strokeStyle = '#2a4a24'; g.lineWidth = rr(1.4, 2.6); g.beginPath();
        const end = rr(250, 510); for (let y = 0; y < end; y += 6) { const xx = x + Math.sin(y * .03 + ph) * am; y ? g.lineTo(xx, y) : g.moveTo(xx, y); } g.stroke();
        for (let y = 20; y < end; y += rr(10, 26)) { const xx = x + Math.sin(y * .03 + ph) * am, s = rr(5, 10); g.fillStyle = pick(['#2e5a2a', '#3a6a30', '#274e26', '#4a7a36']); g.beginPath(); g.ellipse(xx + rr(-6, 6), y, s, s * .6, rr(0, 3), 0, 7); g.fill(); }
    }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}

/* ---------- sky, crater wall ---------- */
function sky() {
    const m = new THREE.Mesh(new THREE.SphereGeometry(4800, 32, 16), new THREE.ShaderMaterial({side: THREE.BackSide, depthWrite: false, fog: false,
        uniforms: {sun: {value: new THREE.Vector3(.5, .45, .35).normalize()}},
        vertexShader: 'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'varying vec3 p;uniform vec3 sun;void main(){float h=clamp(p.y,0.,1.);vec3 hz=vec3(.718,.769,.682);vec3 zen=vec3(.42,.58,.70);vec3 c=mix(hz,zen,pow(h,.55));float s=max(dot(p,sun),0.);c+=vec3(1.,.93,.78)*(pow(s,600.)*3.+pow(s,10.)*.22);c=mix(c,hz,smoothstep(.06,0.,p.y));gl_FragColor=vec4(c,1.);}'}));
    m.renderOrder = -2; scene.add(m);
    // the crater wall: a ring of layered ridges far off, already hazed
    for (let k = 0; k < 3; k++) {
        const c = cnv(1024, 128), g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 1024, 128); g.clearRect(0, 0, 1024, 128);
        g.fillStyle = 'rgb(' + [150 - k * 12, 168 - k * 8, 160 - k * 4] + ')'; g.beginPath(); g.moveTo(0, 128);
        for (let x = 0; x <= 1024; x += 8) g.lineTo(x, 128 - (50 + k * 12 + Math.sin(x * .02 + k) * 24 + Math.sin(x * .071 + k * 3) * 12 + rnd() * 6)); g.lineTo(1024, 128); g.fill();
        const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.x = 2; t.encoding = THREE.sRGBEncoding;
        const w = new THREE.Mesh(new THREE.CylinderGeometry(3300 - k * 280, 3300 - k * 280, 900 + k * 150, 64, 1, true), new THREE.MeshBasicMaterial({map: t, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false, color: new THREE.Color().setScalar(.92 + k * .03)}));
        w.position.y = 330 + k * 40; w.renderOrder = -1; scene.add(w);
    }
}

/* ---------- lights ---------- */
const sun = new THREE.DirectionalLight(0xfff0d2, 1.75);
sun.position.set(120, 150, 80); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, {left: -170, right: 170, top: 170, bottom: -170, near: 10, far: 600}); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0xbcd0c8, 0x3d3a26, 0.5));

/* ---------- ground: red soil, moss and litter blended, a trodden mud yard ---------- */
function ground() {
    const S = 2800;
    const g0 = new THREE.Mesh(new THREE.PlaneGeometry(S, S), M('mud', 2.8, {rough: .95, color: 0xb86a4e}));
    g0.rotation.x = -Math.PI / 2; g0.receiveShadow = true; scene.add(g0);
    const layer = (k, scale, mask, dy, color) => {
        const m = new THREE.MeshStandardMaterial({map: tx(k, 'a', scale), normalMap: tx(k, 'n', scale), roughness: .95, transparent: true, alphaMap: mask, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -dy, polygonOffsetUnits: -dy, color: color || 0xffffff}); macroize(m, 90, .7, 1.2);
        const p = new THREE.Mesh(new THREE.PlaneGeometry(S, S), m); p.rotation.x = -Math.PI / 2; p.position.y = dy * .02; p.receiveShadow = true; p.renderOrder = dy; scene.add(p);
    };
    const toPx = v => (v / S + .5) * 512;
    const mossMask = blobMask(512, 300, (x, y) => { const d = Math.hypot(x - 256, y - 256); return d < toPx(90) - 256 + 0 && false ? 0 : rr(10, 46); });
    // clear the yard of moss: paint black disc on a canvas mask built from the blobs
    (() => { const c = mossMask.image, g = c.getContext('2d'); const r = 150 / S * 512; const gr = g.createRadialGradient(256, 256, r * .6, 256, 256, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); mossMask.needsUpdate = true; })();
    layer('moss', 2.5, mossMask, 1, 0xa8b890);
    const litMask = blobMask(512, 420, () => rr(8, 36));
    (() => { const c = litMask.image, g = c.getContext('2d'); const r = 120 / S * 512; const gr = g.createRadialGradient(256, 256, r * .5, 256, 256, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); litMask.needsUpdate = true; })();
    layer('litter', 2.2, litMask, 2, 0xb8a090);
    // the trodden yard: a soft disc of packed mud, with streaks of path to the gate
    const yc = cnv(512, 512), yg = yc.getContext('2d'); yg.fillStyle = '#000'; yg.fillRect(0, 0, 512, 512);
    const yr = 105 / S * 512, ygr = yg.createRadialGradient(256, 256, yr * .55, 256, 256, yr); ygr.addColorStop(0, '#fff'); ygr.addColorStop(1, '#000'); yg.fillStyle = ygr; yg.fillRect(0, 0, 512, 512);
    yg.strokeStyle = '#ddd'; yg.lineWidth = 3.5; yg.lineCap = 'round'; yg.beginPath(); yg.moveTo(256, 256); yg.lineTo(256, 384); yg.stroke();
    layer('mud', 2.6, new THREE.CanvasTexture(yc), 3, 0xe0b898);
}

/* ---------- the four ancient towers ---------- */
const TOWER_OFF = 60, HALF = 24, NF = 30, FH = 5;
const towers = [];
function tower(cx, cz) {
    const g = new THREE.Group(); g.position.set(cx, 0, cz); scene.add(g);
    // floor plates: nine bays per floor, a few fallen in the wild middle floors
    const bay = 16, plate = BX(bay, 1, bay), inst = [];
    for (let k = 0; k <= NF; k++) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const wild = k > 5 && k < 25; if (wild && rnd() < .13 && !(i === 1 && j === 1)) continue; if (k > 25 && k < NF && rnd() < .08 && !(i === 1 && j === 1)) continue;
        inst.push([-bay + i * bay, .6 + k * FH, -bay + j * bay]);
    }
    const im = new THREE.InstancedMesh(plate, M('concrete', 4, {rough: .95, color: 0xa39d92}), inst.length); const d = new THREE.Object3D();
    inst.forEach((p, n) => { d.position.set(p[0], p[1], p[2]); d.updateMatrix(); im.setMatrixAt(n, d.matrix); }); im.castShadow = im.receiveShadow = true; g.add(im);
    // moss on the topsides of plates
    const mm = new THREE.InstancedMesh(new THREE.BoxGeometry(bay * .95, .25, bay * .95), M('moss2', 1.6, {rough: 1}), inst.length); let nn = 0;
    inst.forEach(p => { if (rnd() < .5) { d.position.set(p[0] + rr(-1.5, 1.5), p[1] + .6, p[2] + rr(-1.5, 1.5)); d.scale.set(rr(.3, 1), 1, rr(.3, 1)); d.updateMatrix(); mm.setMatrixAt(nn++, d.matrix); } }); d.scale.set(1, 1, 1); mm.count = nn; mm.receiveShadow = true; g.add(mm);
    // 4x4 cyclopean columns, rust-stained steel edge beams on every plate
    const cl = [-HALF + 1.6, -8, 8, HALF - 1.6], colG = BX(3.2, NF * FH + 1, 3.2), cim = new THREE.InstancedMesh(colG, M('concrete2', 3, {rough: .9, color: 0x9a948a}), 16); let c = 0;
    cl.forEach(x => cl.forEach(z => { d.position.set(x, .6 + NF * FH / 2, z); d.updateMatrix(); cim.setMatrixAt(c++, d.matrix); })); cim.castShadow = cim.receiveShadow = true; g.add(cim);
    const beam = []; for (let k = 0; k <= NF; k++) [[0, -HALF, 0], [0, HALF, 0], [-HALF, 0, 1], [HALF, 0, 1]].forEach(b => beam.push([b[0], .6 + k * FH - .9, b[1], b[2]]));
    const bg = BX(HALF * 2, .8, .5), bim = new THREE.InstancedMesh(bg, M('rust', 2, {rough: .55, metal: .55}), beam.length);
    beam.forEach((b, n) => { d.position.set(b[0], b[1], b[2]); d.rotation.set(0, b[3] ? Math.PI / 2 : 0, 0); d.updateMatrix(); bim.setMatrixAt(n, d.matrix); }); d.rotation.set(0, 0, 0); bim.castShadow = true; g.add(bim);
    // the re-inhabited lower six floors: tarred timber and cane infill between columns, thatch lean-tos
    for (let k = 0; k < 6; k++) for (const x of [-16, 0, 16]) {
        if (rnd() < .45) continue; const y = .6 + k * FH + 2.4, side = pick([-1, 1]);
        add(BX(10, 4.2, .4), M(pick(['tarred', 'carved', 'cane']), 2.2), cx * 0 + x, y, side * (HALF - 3.6), {parent: g});
    }
    // the roost decks on floor 29: a plank ring 15 m wide with huts and rope railings
    const Y = .6 + 29 * FH + .6, W = 15;
    [[0, -HALF - W / 2, HALF * 2 + 2 * W, W], [0, HALF + W / 2, HALF * 2 + 2 * W, W], [-HALF - W / 2, 0, W, HALF * 2], [HALF + W / 2, 0, W, HALF * 2]].forEach((a, n) => {
        if (n === 1 || n === 2) { if (rnd() < .5) return; }
        add(BX(a[2], .4, a[3]), M('plank', 2.4, {rough: .9}), a[0], Y, a[1], {parent: g});
        // rope rail
        add(BX(a[2], .08, .08), M('rope', 1), a[0], Y + 1.1, a[1] + (n < 2 ? (n ? 1 : -1) : 0) * a[3] / 2, {parent: g, noShadow: true});
    });
    for (let i = 0; i < 5; i++) { const a = rnd() * 6.28, r = HALF + rr(3, 12); hut(g, Math.cos(a) * r * (Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? 1 : .4) , Y + .2, Math.sin(a) * r * (Math.abs(Math.sin(a)) > Math.abs(Math.cos(a)) ? 1 : .4), rnd() * 6.28, 4.4, .55); }
    towers.push(g); return g;
}

/* ---------- huts, awnings, banners ---------- */
function gableRoof(parent, w, d, rise, x, y, z, ry, rm) {   // two thatch slopes + ridge
    const slope = Math.hypot(d / 2, rise), ang = Math.atan2(rise, d / 2), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    [-1, 1].forEach(s => { const m = new THREE.Mesh(BX(w + .8, .22, slope + .5), rm); m.rotation.x = s * ang; m.position.set(0, rise / 2, s * d / 4); m.castShadow = m.receiveShadow = true; g.add(m); });
    const ridge = new THREE.Mesh(BX(w + 1, .3, .35), M('carved', 1.5)); ridge.position.y = rise + .1; ridge.castShadow = true; g.add(ridge);
}
function hut(parent, x, y, z, ry, w, big) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    const h = 2.7 * (big ? 1.1 : 1), d = w * 1.35, wm = M(pick(['tarred', 'carved', 'tarred']), 2.2, {rough: .8});
    add(BX(w, h, d), wm, 0, h / 2, 0, {parent: g});
    add(BX(1.1, 2.0, .15), new THREE.MeshStandardMaterial({color: 0x15110d, roughness: 1}), 0, 1.0, d / 2 + .04, {parent: g, noShadow: true});
    add(BX(w * .22, .9, .15), M('cane', 1.2), w * .3, 1.7, d / 2 + .06, {parent: g, noShadow: true});
    gableRoof(g, w, d, 1.5 + w * .2, 0, h, 0, 0, M('thatch', 2.4, {rough: 1}));
    if (rnd() < .55) { const c = pick(['cloth1', 'cloth2', 'cloth3', 'awning']); const a = add(BX(w * .9, .06, 2.0), M(c, 2, {rough: .95}), 0, h - .15, d / 2 + .9, {parent: g}); a.rotation.x = .28; }
    return g;
}
function banner(x, z, key, hgt) {
    hgt = hgt || 7; add(new THREE.CylinderGeometry(.08, .1, hgt, 8), M('carved', 1.5), x, hgt / 2, z);
    const w = 1.6, h = 3.2, geo = new THREE.PlaneGeometry(w, h, 8, 12), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 4 + p.getY(i)) * .12);
    geo.computeVertexNormals(); const m = M(key, 3.2, {rough: .95, side: THREE.DoubleSide}); const c = new THREE.Mesh(geo, m);
    c.position.set(x + w / 2 + .1, hgt - h / 2 - .2, z); c.rotation.y = rnd() * .6; c.castShadow = true; scene.add(c);
}

/* ---------- the village in the yard between the towers ---------- */
function village() {
    const hall = new THREE.Group(); scene.add(hall);
    add(BX(14, 4.2, 9), M('carved', 2.4), 0, 2.1, 0, {parent: hall}); gableRoof(hall, 14, 9, 3.6, 0, 4.2, 0, 0, M('thatch', 2.4, {rough: 1}));
    add(BX(2.2, 3.2, .15), new THREE.MeshStandardMaterial({color: 0x15110d, roughness: 1}), 0, 1.6, 4.55, {parent: hall});
    add(BX(10, .1, 3.2), M('trim', 3, {rough: .5}), 0, 4.0, 5.3, {parent: hall}).rotation.x = .25;
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + rr(-.1, .1), r = 17 + rr(0, 18); hut(scene, Math.cos(a) * r, 0, Math.sin(a) * r, -a + Math.PI / 2 + rr(-.2, .2), rr(3.6, 5.2), rnd() < .2); }
    [0.2, 1.1, 2.0, 2.9, 3.8, 4.7, 5.6].forEach((a, i) => banner(Math.cos(a) * 12.5, Math.sin(a) * 12.5, ['cloth1', 'cloth2', 'cloth3', 'trim', 'sail', 'awning', 'cloth1'][i], 7 + (i % 3)));
    // barrels, rope coils, drying racks
    for (let i = 0; i < 30; i++) { const a = rnd() * 6.28, r = rr(8, 40); const x = Math.cos(a) * r, z = Math.sin(a) * r; if (rnd() < .6) add(new THREE.CylinderGeometry(.5, .5, 1.1, 14), M('carved', 1.2), x, .55, z); else add(new THREE.TorusGeometry(.5, .16, 8, 18), M('rope', .8), x, .16, z, {rx: Math.PI / 2}); }
    // farm plots on the terrace and the palisade (instanced pointed logs)
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + .3, r = rr(52, 62); if (Math.abs(Math.cos(a)) > .6 && Math.abs(Math.sin(a)) > .6) continue; const p = add(BX(14, .12, 9), M('mud', 2.4, {color: 0xa88a70}), Math.cos(a) * r, .06, Math.sin(a) * r, {ry: -a, noShadow: true}); const rows = new THREE.InstancedMesh(new THREE.ConeGeometry(.3, .8, 5), new THREE.MeshStandardMaterial({color: 0x3a6a2e, roughness: 1}), 60); const d = new THREE.Object3D();
        for (let n = 0; n < 60; n++) { d.position.set((n % 12 - 5.5) * 1.1, .5, (Math.floor(n / 12) - 2) * 1.6); d.updateMatrix(); rows.setMatrixAt(n, d.matrix); } rows.position.copy(p.position); rows.rotation.y = -a; rows.castShadow = true; scene.add(rows); }
    const N = 190, R = 128, logs = new THREE.InstancedMesh(cylUV(new THREE.CylinderGeometry(.38, .42, 7, 8, 1), 1), M('ironbark', 2.4), N), tips = new THREE.InstancedMesh(new THREE.ConeGeometry(.38, 1.1, 8), M('ironbark', 2.4), N); const d = new THREE.Object3D(); let n = 0;
    for (let i = 0; i < N; i++) { const a = i / N * 6.283; if (Math.abs(a - Math.PI / 2) < .09) continue; d.position.set(Math.cos(a) * R, 3.4, Math.sin(a) * R); d.rotation.y = rnd() * 6; d.updateMatrix(); logs.setMatrixAt(n, d.matrix); d.position.y = 7.4 + rnd() * .3; d.updateMatrix(); tips.setMatrixAt(n, d.matrix); n++; }
    logs.count = tips.count = n; logs.castShadow = tips.castShadow = true; scene.add(logs, tips);
    // gate posts and a rope bridge between the north towers at roost height
    [-1, 1].forEach(s => { add(new THREE.CylinderGeometry(.9, 1.0, 11, 10), M('carved', 2), s * 5, 5.5, R); });
    add(BX(10, 1.4, 1.2), M('carved', 2), 0, 10.6, R); banner(0, R + 1.5, 'trim', 10);
    const by = .6 + 29 * FH + 1, bx = TOWER_OFF * 2 - 2 * (HALF + 15) + 4;
    add(BX(bx, .25, 2.2), M('plank', 2), 0, by, -TOWER_OFF, {noShadow: false});
    [-1.1, 1.1].forEach(s => add(BX(bx, .08, .08), M('rope', 1), 0, by + 1.2, -TOWER_OFF + s, {noShadow: true}));
}

/* ---------- the hyperjungle: four species of hypertree, understorey, vines ---------- */
const SPECIES = [
  {name: 'Ironbark', H: [215, 270], rb: [15, 18], crown0: .50, crownR: [100, 130], bark: 'ironbark', bs: 10, tint: 0x9a6a52, leaf: [0x1f3d24, 0x254a2a], leafAlt: [0x2c4a2a, 0x1a3520]},
  {name: 'Ghostwood', H: [200, 250], rb: [12, 14], crown0: .46, crownR: [90, 115], bark: 'ghost', bs: 8, leaf: [0x8aa83e, 0x9ab848], leafAlt: [0xa8c456, 0x7a9a3a], tintBark: 0xe6e2d4},
  {name: 'Prism gum', H: [190, 240], rb: [13, 16], crown0: .52, crownR: [110, 140], bark: 'prism', bs: 9, tint: 0xc8c0b0, leaf: [0x2c8a5e, 0x3a9a68], leafAlt: [0x5a3690, 0x6a46a0]},
  {name: 'Gate baobab', H: [150, 175], rb: [21, 25], crown0: .80, crownR: [70, 90], bark: 'baobab', bs: 10, tint: 0xb0a090, leaf: [0x4a6a2a, 0x567a30], leafAlt: [0x3e5e26, 0x4a6a2a]}];
function trunkR(sp, H, rb, y) {
    const u = Math.min(1, y / H);
    if (sp === 3) { const b = u < .15 ? 1 : u < .35 ? 1 + .08 * (u - .15) / .2 : u < .6 ? 1.08 - .16 * (u - .35) / .25 : u < .78 ? .92 - .28 * (u - .6) / .18 : .64 - .54 * (u - .78) / .22; return rb * b * (1 + .38 * Math.exp(-y / 6)); }
    const t = u < .62 ? 1 - .42 * u : .74 - .67 * (u - .62) / .38; return rb * t * (1 + .8 * Math.exp(-y / 10));
}
function jungle() {
    const leaf = leafTex(); leaf.repeat.set(5, 5);
    const leafMats = SPECIES.map((sp, i) => new THREE.MeshStandardMaterial({map: leaf, alphaTest: .5, side: THREE.DoubleSide, roughness: .7, vertexColors: true}));
    const crown = SPECIES.map(() => []);
    const trees = [];
    for (let i = 0; i < 70; i++) {
        const sp = rnd() < .3 ? 0 : rnd() < .45 ? 1 : rnd() < .75 ? 2 : 3, S = SPECIES[sp], H = rr(S.H[0], S.H[1]), rb = rr(S.rb[0], S.rb[1]), a = rnd() * 6.283, r = 175 + Math.pow(rnd(), .8) * 650;
        const x = Math.cos(a) * r, z = Math.sin(a) * r; trees.push({sp, H, rb, x, z});
        const pts = []; for (let k = 0; k <= 28; k++) { const y = Math.pow(k / 28, 1.6) * H; pts.push(new THREE.Vector2(trunkR(sp, H, rb, y), y)); }
        const geo = cylUV(new THREE.LatheGeometry(pts, 28), rb * 1.0);
        const m = M(S.bark, S.bs * .45, {rough: .95, color: S.tintBark || S.tint || 0xffffff});
        const t = new THREE.Mesh(geo, m); t.position.set(x, 0, z); t.castShadow = true; scene.add(t);
        const n = sp === 3 ? 7 : 13;
        for (let c = 0; c < n; c++) {
            const u = S.crown0 + (1 - S.crown0) * rnd() * (sp === 3 ? .25 : 1), ca = rnd() * 6.283, cr = (sp === 3 ? .9 : rnd()) * rr(.2, 1) * (S.crownR[1] * .7);
            const rad = rr(34, 62) * (sp === 3 ? 1.1 : 1);
            crown[sp].push({x: x + Math.cos(ca) * cr, y: sp === 3 ? H * .84 + rnd() * 10 : H * u * .96, z: z + Math.sin(ca) * cr, s: rad, flat: sp === 3 ? .28 : rr(.55, .8)});
        }
        // buttress roots and fungus brackets round the foot
        for (let q = 0; q < 6; q++) { const qa = q / 6 * 6.283 + rnd(), len = rb * 1.9; const root = new THREE.Mesh(new THREE.ConeGeometry(rb * .32, len, 6), m); root.position.set(x + Math.cos(qa) * rb * 1.15, rb * .15, z + Math.sin(qa) * rb * 1.15); root.rotation.z = Math.cos(qa) * 1.2; root.rotation.x = -Math.sin(qa) * 1.2; root.scale.set(1, 1, .6); root.castShadow = true; scene.add(root); }
    }
    SPECIES.forEach((S, i) => {
        const list = crown[i]; if (!list.length) return;
        const geo = new THREE.IcosahedronGeometry(1, 2), pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c1 = new THREE.Color(S.leaf[0]), c2 = new THREE.Color(S.leafAlt[0]);
        for (let v = 0; v < pos.count; v++) { const t = THREE.MathUtils.smoothstep(pos.getY(v), -.5, .7), c = c2.clone().lerp(c1, t); col[v * 3] = c.r; col[v * 3 + 1] = c.g; col[v * 3 + 2] = c.b; }
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const im = new THREE.InstancedMesh(geo, leafMats[i], list.length), d = new THREE.Object3D();
        list.forEach((p, n) => { d.position.set(p.x, p.y, p.z); d.scale.set(p.s, p.s * p.flat, p.s); d.rotation.set(rnd() * 3, rnd() * 3, 0); d.updateMatrix(); im.setMatrixAt(n, d.matrix); im.setColorAt(n, new THREE.Color().setScalar(rr(.78, 1.12))); });
        scene.add(im);
    });
    // understorey: ferns, saplings, fungus
    const fern = new THREE.MeshStandardMaterial({map: fernTex(), alphaTest: .4, side: THREE.DoubleSide, roughness: .9});
    const fg = new THREE.PlaneGeometry(3.2, 3.2); fg.translate(0, 1.5, 0);
    const F = 2600, fi = new THREE.InstancedMesh(fg, fern, F * 2), d2 = new THREE.Object3D();
    for (let i = 0; i < F; i++) { const a = rnd() * 6.283, r = 80 + Math.pow(rnd(), 1.4) * 900, s = rr(.8, 2.6); for (let k = 0; k < 2; k++) { d2.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); d2.rotation.set(0, k * 1.57 + a, 0); d2.scale.set(s, s, s); d2.updateMatrix(); fi.setMatrixAt(i * 2 + k, d2.matrix); } }
    fi.receiveShadow = false; scene.add(fi);
    const capG = new THREE.SphereGeometry(.5, 10, 6, 0, 6.3, 0, 1.4), stemG = new THREE.CylinderGeometry(.1, .14, .5, 8), cols = [0x8d6a5e, 0xa08464, 0xc8a070, 0x7a4a6a];
    for (let i = 0; i < 90; i++) { const a = rnd() * 6.283, r = rr(110, 520), s = rr(.4, 1.8), x = Math.cos(a) * r, z = Math.sin(a) * r, c = pick(cols); add(stemG, new THREE.MeshStandardMaterial({color: 0xd8cdb4, roughness: .9}), x, .25 * s, z, {noShadow: true}).scale.setScalar(s); add(capG, new THREE.MeshStandardMaterial({color: c, roughness: .6}), x, .5 * s, z, {noShadow: true}).scale.setScalar(s); }
    // hanging vines from the towers and the first crown shell
    const vt = vineTex(); const vm = new THREE.MeshStandardMaterial({map: vt, alphaTest: .35, side: THREE.DoubleSide, roughness: .9});
    towers.forEach(t => { for (let i = 0; i < 26; i++) { const k = Math.floor(rr(6, 30)), side = Math.floor(rnd() * 4), off = rr(-HALF, HALF), len = rr(12, 70), w = rr(3, 8); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, len), vm); const y = .6 + k * FH; p.position.set(t.position.x + (side < 2 ? off : (side === 2 ? -HALF : HALF) - (side === 2 ? .4 : -.4)), y - len / 2, t.position.z + (side < 2 ? (side ? HALF + .4 : -HALF - .4) : off)); p.rotation.y = side < 2 ? 0 : Math.PI / 2; scene.add(p); } });
    trees.forEach(t => { if (rnd() < .55) for (let i = 0; i < 3; i++) { const len = rr(30, 90), p = new THREE.Mesh(new THREE.PlaneGeometry(rr(3, 6), len), vm); const a = rnd() * 6.283; p.position.set(t.x + Math.cos(a) * t.rb * .95, rr(55, 150) - len / 2 + 60, t.z + Math.sin(a) * t.rb * .95); p.rotation.y = a + 1.57; scene.add(p); } });
}

/* ---------- camera: orbit, presets ---------- */
const cam = {tx: 0, ty: 20, tz: 0, yaw: 2.4, pitch: .12, dist: 160};
const presets = {
  'Yard': {tx: -6, ty: 10, tz: 6, yaw: .55, pitch: .06, dist: 52},
  'Gate': {tx: 0, ty: 12, tz: 40, yaw: Math.PI, pitch: .1, dist: 95},
  'Tower': {tx: 60, ty: 55, tz: 60, yaw: 2.35, pitch: .12, dist: 170},
  'Roost deck': {tx: 60, ty: 148, tz: -60, yaw: 1.2, pitch: .08, dist: 60},
  'Forest wall': {tx: 0, ty: 90, tz: -300, yaw: 0, pitch: .04, dist: 380},
  'Aerial': {tx: 0, ty: 40, tz: 0, yaw: .8, pitch: .62, dist: 760}
};
let goal = null;
function setCam() {
    const cp = Math.cos(cam.pitch);
    camera.position.set(cam.tx + Math.sin(cam.yaw) * cp * cam.dist, cam.ty + Math.sin(cam.pitch) * cam.dist, cam.tz + Math.cos(cam.yaw) * cp * cam.dist);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
}
function resize() { renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / Math.max(1, innerHeight); camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
let drag = null;
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); drag = {x: e.clientX, y: e.clientY, shift: e.shiftKey || e.button === 2}; canvas.classList.add('d'); goal = null; });
canvas.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    if (drag.shift) { const k = cam.dist * .0012; cam.tx -= Math.cos(cam.yaw) * dx * k; cam.tz += Math.sin(cam.yaw) * dx * k; cam.ty += dy * k; }
    else { cam.yaw -= dx * .006; cam.pitch = Math.max(-.2, Math.min(1.45, cam.pitch + dy * .005)); } });
canvas.addEventListener('pointerup', () => { drag = null; canvas.classList.remove('d'); });
canvas.addEventListener('wheel', e => { e.preventDefault(); goal = null; cam.dist = Math.max(8, Math.min(1500, cam.dist * Math.exp(e.deltaY * .0013))); }, {passive: false});
canvas.addEventListener('contextmenu', e => e.preventDefault());

const bar = document.getElementById('bar'), notes = document.getElementById('notes');
function ui() {
    const b = document.createElement('b'); b.textContent = 'Girder material mockup'; bar.appendChild(b);
    Object.keys(presets).forEach(k => { const x = document.createElement('button'); x.textContent = k; x.onclick = () => { goal = Object.assign({}, presets[k]); }; bar.appendChild(x); });
    const fogB = document.createElement('button'); fogB.textContent = 'Haze'; fogB.className = 'on'; fogB.onclick = () => { const on = scene.fog.density > 0; scene.fog.density = on ? 0 : 0.00135; fogB.className = on ? '' : 'on'; }; bar.appendChild(fogB);
    const nb = document.createElement('button'); nb.textContent = 'Notes: what is missing'; nb.onclick = () => { notes.style.display = notes.style.display === 'block' ? 'none' : 'block'; }; bar.appendChild(nb);
    const h = document.createElement('span'); h.style.color = 'var(--dim)'; h.textContent = 'drag: orbit · shift-drag: pan · wheel: zoom'; bar.appendChild(h);
    notes.innerHTML = '<h4>Used (new sets)</h4><ul><li>Ground: soil Ground068, moss Moss002, litter Ground072, yard mud brown_mud_02</li><li>Towers: cracked_concrete_wall plates, concrete_wall_009 columns, rusty_metal_04 beams, Moss001 caps</li><li>Village: wood.tarred, wood.carved, fibre.cane, fibre.rope, roof.thatch, weathered_brown_planks, Beast Rider cloths 3 to 5, awning, trim</li><li>Trees: Bark015 (ironbark), bark_willow_02 (ghostwood), bark_bluegum (prism gum), bark_brown_01 (baobab)</li></ul>' +
      '<h4>Missing or faked</h4><ul><li><b>Leaf cards with alpha.</b> The canopy is a canvas-drawn leaf pattern on spheres. The AmbientCG Leaf sets are single leaves on a flat background with no alpha map, so they need masks cut first.</li><li><b>Fern, palm and sapling textures.</b> Ferns are canvas strokes. No palm frond or fern sheet in the downloads.</li><li><b>Vine and liana texture.</b> Canvas strokes on a plane.</li><li><b>Ghostwood and prism gum bark.</b> Ghostwood uses a willow bark tinted white; prism gum is plain blue-gum bark with no rainbow streaks (needs a generated streak sheet).</li><li><b>Fungus and bracket textures</b> (flat colours).</li><li><b>Iridescent canopy shader.</b> Violet underside is a vertex-colour gradient, not a view-angle shader.</li><li><b>Water</b> (river, pools), wet mud with footprints, flowers, fallen logs.</li><li><b>Hide and leather</b> for beast-rider tack and tent skins (Leather008/009/033C exist in the AmbientCG set but are not placed).</li><li><b>Terrain relief</b>: the ground is flat; roots and heightfield are not here.</li><li><b>Beast riders, flyers, life layer and interiors</b> are not in the mockup.</li><li>Tower floors are boxes, not Girder\'s real architecture (stairs, cores, walls, interiors).</li></ul>';
}
function frame() {
    if (goal) { const k = .06; ['tx', 'ty', 'tz', 'pitch', 'dist'].forEach(p => cam[p] += (goal[p] - cam[p]) * k); let dy = goal.yaw - cam.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); cam.yaw += dy * k; }
    setCam(); renderer.render(scene, camera); requestAnimationFrame(frame);
}
loadAll().then(() => {
    resize(); sky(); ground();
    towers.length = 0; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(s => tower(s[0] * TOWER_OFF, s[1] * TOWER_OFF));
    village(); jungle(); ui();
    document.getElementById('load').style.display = 'none';
    Object.assign(cam, presets['Yard']); frame();
    window._g = {cam, presets, scene, renderer, camera};
});
