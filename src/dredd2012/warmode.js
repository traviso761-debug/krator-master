// ---------- Mega-City One: the blast shields on the mega-blocks, and war mode ----------
// Every block in this city can shut itself in. The shields live in housings banded up each face, and when
// the block goes to war they grind down out of them until there is no opening left anywhere on it: no doors,
// no windows, no way in and no way out for anyone already inside. In the film that is done to one block, by
// one person, and the whole story follows from it - so the toggle here seals one block, not the sector.
// No other city on the site has any of this, so it is not part of the shared engine: dredd2012.html hands it
// to build() through ctx.extras (see src/engine/stages/06f-extras.js) and every other page is none the wiser.
// It still builds nothing unless the city config carries a "warMode" block.
import { mkRng } from '../core/rng.js';

export function warMode(api) {
  const { THREE, C, ctx, scene, POIS, animHooks, groundH, HASH0 } = api;

  const K = C.warMode; if (!K) return;
  const blocks = POIS.filter(p => p.kind === 'megablock' && p.w > 0);
  if (!blocks.length) return;
  const WR = mkRng(2012), D = new THREE.Object3D();

  // ---- materials ----
  // The shields are not the block. The block is poured concrete, bleached by forty years of sun; these are
  // steel that has been shut in a housing since the block was built, and they come down the colour of rust.
  function ribTex() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#6b4a38'; g.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 256; y += 4) {                       // the grain of the plate
      g.fillStyle = 'rgba(0,0,0,' + (0.04 + WR() * 0.05).toFixed(3) + ')'; g.fillRect(0, y, 64, 2);
    }
    for (let y = 0; y < 256; y += 32) {                      // the ribs, and the bolts along them
      g.fillStyle = 'rgba(0,0,0,0.42)'; g.fillRect(0, y, 64, 5);
      g.fillStyle = 'rgba(255,225,190,0.16)'; g.fillRect(0, y + 5, 64, 2);
      g.fillStyle = 'rgba(0,0,0,0.5)';
      for (let x = 7; x < 64; x += 16) { g.beginPath(); g.arc(x, y + 16, 2.1, 0, 6.3); g.fill(); }
    }
    for (let k = 0; k < 60; k++) {                           // streaks off the bolts
      g.fillStyle = 'rgba(30,14,8,' + (0.06 + WR() * 0.14).toFixed(3) + ')';
      g.fillRect(WR() * 64, WR() * 256, 2 + WR() * 5, 8 + WR() * 40);
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    t.repeat.set(1, 11); return t;
  }
  function hazardTex() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 32; const g = c.getContext('2d');
    g.fillStyle = '#e0a41c'; g.fillRect(0, 0, 128, 32);
    g.fillStyle = '#1a1713';
    for (let x = -32; x < 160; x += 32) { g.beginPath(); g.moveTo(x, 32); g.lineTo(x + 16, 32); g.lineTo(x + 32, 0); g.lineTo(x + 16, 0); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(40,30,16,0.3)'; for (let k = 0; k < 40; k++) g.fillRect(WR() * 128, WR() * 32, 3 + WR() * 9, 2 + WR() * 5);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    t.repeat.set(3, 1); return t;
  }
  const shieldM = new THREE.MeshLambertMaterial({ map: ribTex(), color: 0xb0aba4 });
  const edgeM = new THREE.MeshLambertMaterial({ map: hazardTex() });
  const housingM = new THREE.MeshLambertMaterial({ color: 0x4e4740 });
  const railM = new THREE.MeshLambertMaterial({ color: 0x5a534a });
  const lampM = new THREE.MeshBasicMaterial({ color: 0x3a2a10 });

  // ---- lay the shields out ----
  // Three set-backs to a block, each a little narrower than the one below; each set-back banded into shield
  // sections about ninety metres deep, because a single four-hundred-metre slab is not a door, it is a wall.
  const PANEL = K.panel || 26, BAND = K.band || 92, OUT = K.standoff || 6.5;
  const panels = [], housings = [], rails = [], lamps = [];
  const TIERS = [[0, 0.62, 1.00], [0.62, 0.86, 0.90], [0.86, 1.00, 0.78]];
  blocks.forEach((b, bi) => {
    const g0 = groundH(b.x, b.z), ca = Math.cos(b.ang), sa = Math.sin(b.ang);
    // a point on the block's face, in world: (u along the face, v out from it), before the block's own turn
    const put = (lx, lz) => [b.x + lx * ca - lz * sa, b.z + lx * sa + lz * ca];
    for (const [t0, t1, fw] of TIERS) {
      const y0 = g0 + b.h * t0, y1 = g0 + b.h * t1, hw = b.w * fw / 2, hd = b.d * fw / 2;
      const nb = Math.max(1, Math.round((y1 - y0) / BAND)), bh = (y1 - y0) / nb;
      for (let band = 0; band < nb; band++) {
        const top = y1 - band * bh;
        for (let f = 0; f < 4; f++) {
          // face 0/1 are the long faces (normal along local z), 2/3 the short ones (normal along local x)
          const long = f < 2, sd = f % 2 ? -1 : 1;
          const along = long ? hw * 2 : hd * 2, off = long ? hd : hw;
          const n = Math.max(2, Math.round(along / PANEL)), pw = along / n - 0.5;
          const ry = -b.ang + (long ? 0 : Math.PI / 2);
          for (let i = 0; i < n; i++) {
            const u = -along / 2 + (i + 0.5) * along / n;
            const [px, pz] = long ? put(u, sd * (off + OUT)) : put(sd * (off + OUT), u);
            // the cascade: the sections at the foot of the block come down first and the summit seals last
            panels.push({ b: bi, px, pz, ry, pw, top, bh, order: (t0 + (band / nb) * (t1 - t0)) * 0.55 + WR() * 0.06 });
          }
          // the housing the section lives in, and the channels it rides down
          const [hx, hz] = long ? put(0, sd * (off + OUT)) : put(sd * (off + OUT), 0);
          housings.push({ x: hx, y: top + 2.2, z: hz, ry, w: along + 3 });
          for (const e of [-1, 1]) {
            const [rx, rz] = long ? put(e * along / 2, sd * (off + OUT)) : put(sd * (off + OUT), e * along / 2);
            rails.push({ x: rx, y: top - bh / 2, z: rz, ry, h: bh });
            lamps.push({ x: rx, y: top + 2.2, z: rz });
          }
        }
      }
    }
  });

  // ---- the roof doors, and the atrium under them ----
  // Every block is built as four walls round a hole: the atrium runs the whole two hundred storeys and the
  // flats look into it. What closes it at the top is a pair of leaves that run back into the roof, and they
  // stand open until the block goes to war.
  const roof = [], lips = [], floors = [];
  blocks.forEach((b, bi) => {
    if (!(b.sw > 0)) return;
    const g0 = groundH(b.x, b.z), top = g0 + b.h, ry = -b.ang;
    const ca = Math.cos(b.ang), sa = Math.sin(b.ang);
    const put = (lx, lz) => [b.x + lx * ca - lz * sa, b.z + lx * sa + lz * ca];
    for (const sd of [-1, 1]) {
      const [px, pz] = put(sd * b.sw / 4, 0);
      roof.push({ b: bi, x: px, z: pz, y: top + 2.4, ry, w: b.sw / 2 - 0.6, d: b.sd,
                  // where the leaf ends up once it has run back into the roof
                  dx: -sa * 0 + ca * sd * (b.sw / 2 + 1), dz: sa * sd * (b.sw / 2 + 1) });
    }
    // the coaming round the mouth of it, so the shaft does not just stop at the roofline
    for (let f = 0; f < 4; f++) {
      const long = f < 2, e = f % 2 ? -1 : 1;
      const [lx, lz] = long ? put(0, e * (b.sd / 2 + 2)) : put(e * (b.sw / 2 + 2), 0);
      lips.push({ x: lx, y: top, z: lz, ry, w: long ? b.sw + 8 : b.sd + 8, rot: long ? 0 : Math.PI / 2 });
    }
    const [fx, fz] = put(0, 0);
    floors.push({ x: fx, y: groundH(fx, fz), z: fz, ry, w: b.sw, d: b.sd });
  });

  // ---- the meshes ----
  const mkInst = (geo, mat, n) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; scene.add(m); return m; };
  const shields = mkInst(new THREE.BoxGeometry(1, 1, 3.4), shieldM, panels.length);
  const edges = mkInst(new THREE.BoxGeometry(1, 5.5, 4.6), edgeM, panels.length);
  // Nothing here casts: the block itself already does, and six hundred housings in the shadow map smear
  // into one dark band across the middle of it.
  shields.castShadow = edges.castShadow = false;
  const hz = mkInst(new THREE.BoxGeometry(1, 5.2, 5.6), housingM, housings.length);
  const rl = mkInst(new THREE.BoxGeometry(3.2, 1, 5.2), railM, rails.length);
  const lp = mkInst(new THREE.SphereGeometry(1.1, 6, 5), lampM, lamps.length);
  housings.forEach((h, i) => { D.position.set(h.x, h.y, h.z); D.rotation.set(0, h.ry, 0); D.scale.set(h.w, 1, 1); D.updateMatrix(); hz.setMatrixAt(i, D.matrix); });
  rails.forEach((r, i) => { D.position.set(r.x, r.y, r.z); D.rotation.set(0, r.ry, 0); D.scale.set(1, r.h, 1); D.updateMatrix(); rl.setMatrixAt(i, D.matrix); });
  lamps.forEach((l, i) => { D.position.set(l.x, l.y, l.z); D.rotation.set(0, 0, 0); D.scale.set(1, 1, 1); D.updateMatrix(); lp.setMatrixAt(i, D.matrix); });
  hz.castShadow = rl.castShadow = false;
  const doorM = new THREE.MeshLambertMaterial({ map: ribTex(), color: 0x9a958e });
  const rf = mkInst(new THREE.BoxGeometry(1, 3.6, 1), doorM, Math.max(1, roof.length));
  const lipMesh = mkInst(new THREE.BoxGeometry(1, 5.6, 4.4), housingM, Math.max(1, lips.length));
  const flMesh = mkInst(new THREE.BoxGeometry(1, 2, 1), housingM, Math.max(1, floors.length));
  rf.count = roof.length; lipMesh.count = lips.length; flMesh.count = floors.length;
  lips.forEach((l, i) => { D.position.set(l.x, l.y, l.z); D.rotation.set(0, l.ry + l.rot, 0); D.scale.set(l.w, 1, 1); D.updateMatrix(); lipMesh.setMatrixAt(i, D.matrix); });
  floors.forEach((f, i) => { D.position.set(f.x, f.y, f.z); D.rotation.set(0, f.ry, 0); D.scale.set(f.w, 1, f.d); D.updateMatrix(); flMesh.setMatrixAt(i, D.matrix); });

  // ---- war mode ----
  // Which block goes to war: one of them, by name, the way it happens in the film.
  const NAME = new RegExp(K.block || 'Peach Trees', 'i');
  const sealed = new Set(); blocks.forEach((b, i) => { if (NAME.test(b.name)) sealed.add(i); });
  const war = { t: 0, goal: 0 };
  function draw() {
    for (let i = 0; i < panels.length; i++) {
      const p = panels[i], on = sealed.has(p.b);
      const u = on ? Math.max(0, Math.min(1, (war.t - p.order) / (1 - p.order || 1))) : 0;
      const h = Math.max(0.001, u * p.bh);
      D.position.set(p.px, p.top - h / 2, p.pz); D.rotation.set(0, p.ry, 0); D.scale.set(p.pw, h, 1);
      D.updateMatrix(); shields.setMatrixAt(i, D.matrix);
      D.position.y = p.top - h; D.scale.set(p.pw, 1, 1); D.updateMatrix(); edges.setMatrixAt(i, D.matrix);
    }
    shields.instanceMatrix.needsUpdate = edges.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < roof.length; i++) {
      const r = roof[i], on = sealed.has(r.b);
      // These run the other way to everything else. At rest the roof stands open on the atrium - that is how
      // anything gets flown in or out of a block, and it is what you look down two hundred storeys of. Going
      // to war shuts it, because a block that seals every face and leaves a hole in its lid is not sealed.
      const u = on ? 1 - Math.max(0, Math.min(1, (war.t - 0.18) / 0.82)) : 1;
      D.position.set(r.x + r.dx * u, r.y, r.z + r.dz * u); D.rotation.set(0, r.ry, 0); D.scale.set(r.w, 1, r.d);
      D.updateMatrix(); rf.setMatrixAt(i, D.matrix);
    }
    if (roof.length) rf.instanceMatrix.needsUpdate = true;
  }
  draw();

  let last = performance.now();
  animHooks.push(now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const moving = Math.abs(war.goal - war.t) > 1e-3;
    if (moving) { war.t += Math.sign(war.goal - war.t) * Math.min(Math.abs(war.goal - war.t), (K.speed || 0.075) * dt); draw(); }
    // amber while the shields are running, and a steady red once the block is shut
    const flash = moving ? (Math.sin(now * 0.012) > 0 ? 1 : 0.15) : (war.t > 0.99 ? 0.8 : 0);
    lampM.color.setRGB(moving ? 0.95 * flash : 0.85 * flash, moving ? 0.6 * flash : 0.08 * flash, moving ? 0.08 * flash : 0.06 * flash);
    if (ctx.details && now - (ctx._wT || 0) > 900) { ctx._wT = now; ctx.details.warMode = war.t > 0.99 ? 'sealed' : war.t < 0.01 ? 'open' : Math.round(war.t * 100) + '%'; }
  });

  // ---- the control ----
  // The panels do not exist yet when the extras run, so the button is asked for and built later.
  api.onUI(({ ui, mkBtn }) => {
  const label = () => (war.goal > 0.5 ? 'Open ' : 'Seal ') + (blocks.find((b, i) => sealed.has(i)) || { name: 'the block' }).name;
  const btn = mkBtn(label(), ui, () => { war.goal = war.goal > 0.5 ? 0 : 1; btn.textContent = label(); });
  btn.title = 'Drop the blast shields on the block, the way war mode does it in the film';
  ctx.warMode = s => { war.goal = s ? 1 : 0; btn.textContent = label(); };
  // #war in the address seals it on load, so the state travels with a link the way the view and hour do
  if (/(^|&)war\b/.test(HASH0)) { war.t = war.goal = 1; btn.textContent = label(); draw(); }
  });

  ctx.details = Object.assign(ctx.details || {}, {
    blastShields: panels.length, shieldHousings: housings.length, roofDoors: roof.length, atria: floors.length, warBlock: [...sealed].map(i => blocks[i].name).join(', '), warMode: 'open'
  });
}
