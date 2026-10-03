/* ==== labels, header buttons, inspector, input ==== */
const labelsEl = document.getElementById('labels'), bar = document.getElementById('bar'), side = document.getElementById('side');
const colEls = cols.map(c => { const d = document.createElement('div'); d.className = 'hdr col'; d.textContent = c; labelsEl.appendChild(d); return d; });
const rowEls = rows.map(r => { const d = document.createElement('div'); d.className = 'hdr row'; d.textContent = r; labelsEl.appendChild(d); return d; });

function btn(txt, fn, on) { const b = document.createElement('button'); b.textContent = txt; b.onclick = fn; if (on) b.className = 'on'; return b; }
function grp(label, ...els) { const g = document.createElement('span'); g.className = 'grp'; if (label) { const l = document.createElement('span'); l.className = 'lbl'; l.textContent = label; g.appendChild(l); } els.forEach(e => g.appendChild(e)); bar.appendChild(g); return g; }
const title = document.createElement('b'); title.textContent = 'Material demo kit'; bar.appendChild(title);
grp('', btn('Fit all', fitAll));
grp('Culture', ...cols.map((c, i) => btn(c, () => frameRect(colX[i], colX[i] + colW[i], -wall.h, 0))));
grp('Type', ...rows.map((r, i) => btn(r, () => frameRect(0, wall.w, rowY[i] - rowH[i], rowY[i]))));
const mdBtns = {};
grp('Mode', ...[['flat', 'Flat panels'], ['objects', 'On objects']].map(([k, t]) => (mdBtns[k] = btn(t, () => { view.mode = k; sync(); }))));
const domeBtn = btn('Metal/roof: domes', () => { view.dome = !view.dome; sync(); });
grp('Shape', domeBtn, btn('Reset turns', () => panels.forEach(p => p.obj && p.obj.rotation.set(0, 0, 0))));
const chBtns = {};
grp('View', ...[['lit', 'Lit'], ['albedo', 'Albedo'], ['normal', 'Normal'], ['rough', 'Roughness']].map(([k, t]) => (chBtns[k] = btn(t, () => { view.channel = k; sync(); }))));
const rpBtns = {};
grp('Scale', ...[['metric', 'Metric (2 m panel)'], ['tile1', '1 tile'], ['tile3', '3×3 tiles']].map(([k, t]) => (rpBtns[k] = btn(t, () => { view.repeat = k; sync(); }))));
const mul = document.createElement('input'); mul.type = 'range'; mul.min = -2; mul.max = 2; mul.step = .05; mul.value = 0; mul.style.width = '90px';
const mulT = document.createElement('span'); mulT.textContent = '×1.00';
mul.oninput = () => { view.scaleMul = Math.pow(2, +mul.value); mulT.textContent = '×' + view.scaleMul.toFixed(2); sync(); };
grp('Metric ×', mul, mulT);
const mt = document.createElement('input'); mt.type = 'range'; mt.min = 0; mt.max = 1; mt.step = .05; mt.value = view.matte; mt.style.width = '70px';
mt.oninput = () => { view.matte = +mt.value; sync(); };
grp('Matte', mt);
const tintBtn = btn('Tint', () => { view.tint = !view.tint; sync(); });
const tintIn = document.createElement('input'); tintIn.type = 'color'; tintIn.value = view.tintColor; tintIn.oninput = () => { view.tintColor = tintIn.value; sync(); };
grp('', tintBtn, tintIn);
const az = document.createElement('input'); az.type = 'range'; az.min = -90; az.max = 90; az.value = view.lightAz; az.style.width = '80px'; az.oninput = () => { view.lightAz = +az.value; };
const el = document.createElement('input'); el.type = 'range'; el.min = 5; el.max = 85; el.value = view.lightEl; el.style.width = '80px'; el.oninput = () => { view.lightEl = +el.value; };
const orb = btn('Orbit', () => { view.orbit = !view.orbit; orb.className = view.orbit ? 'on' : ''; });
grp('Light', az, el, orb);
const stBtns = {};
grp('Show', ...Object.keys(L.statuses).map(k => { const b = btn('', () => { view.filter[k] = !view.filter[k]; sync(); }); b.innerHTML = '<span class=dot style="background:var(--' + k + ')"></span>' + L.statuses[k]; stBtns[k] = b; return b; }));

function sync() {
    Object.keys(mdBtns).forEach(k => mdBtns[k].className = view.mode === k ? 'on' : '');
    Object.keys(chBtns).forEach(k => chBtns[k].className = view.channel === k ? 'on' : '');
    Object.keys(rpBtns).forEach(k => rpBtns[k].className = view.repeat === k ? 'on' : '');
    Object.keys(stBtns).forEach(k => stBtns[k].className = view.filter[k] ? 'on' : '');
    domeBtn.className = view.dome ? 'on' : '';
    tintBtn.className = view.tint ? 'on' : '';
    applyView();
}

let selected = null;
function select(p) {
    if (selected) selected.frame.material.emissive.setHex(0x000000);
    selected = p;
    if (!p) { side.style.display = 'none'; return; }
    p.frame.material.emissive.setHex(0x666666);
    const s = p.s, esc = t => String(t).replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
    let src = s.source || {};
    if (s.srcb64) { try { src = JSON.parse(decodeURIComponent(escape(atob(s.srcb64)))); } catch (err) { src = {}; } }
    side.style.display = 'block';
    side.innerHTML = '<h3>' + esc(s.id) + '</h3><div><span class=dot style="background:var(--' + s.status + ')"></span>' + esc(L.statuses[s.status]) + '</div>' +
        '<table>' +
        '<tr><td class=k>Row / column</td><td>' + esc(s.row) + ' / ' + esc(s.col) + '</td></tr>' +
        (s.also && s.also.length ? '<tr><td class=k>Also for</td><td>' + esc(s.also.join(', ')) + '</td></tr>' : '') +
        '<tr><td class=k>Scale</td><td>' + s.scale[0] + ' × ' + s.scale[1] + ' m per tile' + (s.scaleGuess ? ' <b>(estimate: judge it here)</b>' : '') + '</td></tr>' +
        '<tr><td class=k>Metal / rough</td><td>' + s.metal + ' / ' + (+s.rough).toFixed(2) + '</td></tr>' +
        '<tr><td class=k>Tintable</td><td>' + (s.tint ? 'yes' : 'no') + (s.pattern ? ' · pattern sheet' : '') + '</td></tr>' +
        (s.use ? '<tr><td class=k>Use</td><td>' + esc(s.use) + '</td></tr>' : '') +
        (s.note ? '<tr><td class=k>Note</td><td>' + esc(s.note) + '</td></tr>' : '') +
        Object.keys(src).filter(k => k !== 'prompt').map(k => '<tr><td class=k>' + k + '</td><td>' + esc(src[k]) + '</td></tr>').join('') +
        '</table>' + (src.prompt ? '<div class=k>Prompt</div><div class=prompt>' + esc(src.prompt) + '</div>' : '');
    flyTo(p.px, p.py, fitDist(2.6, 2.8));
}

/* input */
let drag = null, downAt = null;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function worldPerPx() { return 2 * camDist * Math.tan(camera.fov * Math.PI / 360) / innerHeight; }
function pickObj(e) {
    if (view.mode !== 'objects') return null;
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    const tgt = []; panels.forEach(p => { if (p.obj && p.obj.visible) p.obj.traverse(o => { if (o.isMesh && o.visible !== false) { o.userData.pp = p; tgt.push(o); } }); });
    const h = ray.intersectObjects(tgt)[0]; return h ? h.object.userData.pp : null;
}
let turning = null;
canvas.addEventListener('dblclick', e => { const p = pickObj(e); if (p) p.obj.rotation.set(0, 0, 0); });
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); turning = pickObj(e); drag = {x: e.clientX, y: e.clientY}; downAt = {x: e.clientX, y: e.clientY}; canvas.classList.add('drag'); goal = null; autoFit = false; });
canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    if (turning) { turning.obj.rotation.y += (e.clientX - drag.x) * .012; turning.obj.rotation.x = Math.max(-1.2, Math.min(1.2, turning.obj.rotation.x + (e.clientY - drag.y) * .012)); drag = {x: e.clientX, y: e.clientY}; return; }
    const k = worldPerPx(); camTarget.x -= (e.clientX - drag.x) * k; camTarget.y += (e.clientY - drag.y) * k;
    drag = {x: e.clientX, y: e.clientY};
});
canvas.addEventListener('pointerup', e => {
    canvas.classList.remove('drag'); drag = null; turning = null;
    if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 5) {
        ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const tgt = [];
        panels.forEach(p => { if (p.mesh.visible) tgt.push(p.mesh); if (p.obj && p.obj.visible) p.obj.traverse(o => { if (o.isMesh) { o.userData.pp = p; tgt.push(o); } }); });
        const hit = ray.intersectObjects(tgt)[0];
        select(hit ? (hit.object.userData.panel ? hit.object.userData.panel._p : hit.object.userData.pp) : null);
    }
});
canvas.addEventListener('wheel', e => {
    e.preventDefault(); goal = null;
    const f = Math.exp(e.deltaY * 0.0012), before = worldPerPx();
    // zoom about the cursor
    const mx = e.clientX - innerWidth / 2, my = e.clientY - innerHeight / 2;
    camDist = Math.min(420, Math.max(2.5, camDist * f));
    const after = worldPerPx();
    camTarget.x += mx * (before - after); camTarget.y -= my * (before - after);
}, {passive: false});
addEventListener('keydown', e => { if (e.key === 'Escape') select(null); if (e.key === 'f') fitAll(); });

/* label projection */
const v3 = new THREE.Vector3();
function project(x, y, z) { v3.set(x, y, z).project(camera); return {x: (v3.x + 1) / 2 * innerWidth, y: (1 - v3.y) / 2 * innerHeight}; }
function labels() {
    const bh = bar.offsetHeight, ppw = innerHeight / (2 * camDist * Math.tan(camera.fov * Math.PI / 360)) * PANEL; // px per panel
    panels.forEach(p => {
        if (!p.mesh.visible && !(p.obj && p.obj.visible)) return;
        const q = project(p.px, p.py - PANEL / 2 - .08, 0);
        const on = ppw > 70 && q.x > -100 && q.x < innerWidth + 100 && q.y > -40 && q.y < innerHeight + 40;
        p.cap.style.display = on ? '' : 'none';
        if (on) { p.cap.style.left = q.x + 'px'; p.cap.style.top = q.y + 'px'; p.cap.style.fontSize = Math.max(10, Math.min(15, ppw / 16)) + 'px'; p.cap.lastChild.style.display = ppw > 150 ? '' : 'none'; }
    });
    cols.forEach((c, i) => { const q = project(colX[i] + colW[i] / 2, 0, 0); colEls[i].style.left = q.x + 'px'; colEls[i].style.top = (bh + 6) + 'px'; colEls[i].style.display = q.x > -60 && q.x < innerWidth + 60 ? '' : 'none'; });
    rows.forEach((r, i) => { const q = project(0, rowY[i] - rowH[i] / 2, 0); rowEls[i].style.left = '8px'; rowEls[i].style.top = q.y + 'px'; rowEls[i].style.display = q.y > bh && q.y < innerHeight ? '' : 'none'; });
}

/* loop */
let last = performance.now();
function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (goal) {
        const k = 1 - Math.pow(.0005, dt);
        camTarget.x += (goal.x - camTarget.x) * k; camTarget.y += (goal.y - camTarget.y) * k; camDist += (goal.d - camDist) * k;
        if (Math.abs(goal.x - camTarget.x) + Math.abs(goal.y - camTarget.y) + Math.abs(goal.d - camDist) < .02) goal = null;
    }
    if (view.orbit) { view.lightAz = ((view.lightAz + 40 * dt + 90) % 180) - 90; az.value = view.lightAz; }
    setCam(); placeSun(); labels();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
}
camDist = 90; sync(); fitAll(); requestAnimationFrame(frame);
window._demo = {view, panels, flyTo, fitAll, select, wall};
