// prefix: brt
/* ======================================================================
   The Beast Riders kit: the TENT KIT (2026-10-19). The owner: "a tent-based nomadic/semi nomadic set, still consistent
   with the style, inspired by yurts and these types of barrel-shaped tents, that has the same trades as scyvoi and
   appropriate pen and animal trainer structures". The shared builders the tent set draws with (71-75: the tents, the
   pens and trainers, the bands' own grounds, the boundaries; 79: BR_CAMP), on the catalog's engine (F.*), in the
   mounts' vocabulary (50-br-mounts.js, read before this: BRM, brmLin, brmPost, brmFinial). Its two main forms are the
   owner's two reference images:
     brtDome     the HIDE DOME (common dwellings and traders): a squat dome about as wide as tall, a patchwork of pale
                 cream hides sewn in gores and courses, a skirt of spotted fur with a torn hem, a bound-leather crown ring
                 or an ochre sunburst cap, a short mast with a sign board or a banner on a cross-bar; a door, or a wide
                 cut-away front (a trader's); painted claw sigils on the flank; guy ropes to iron hook stakes all round
     brtBarrel   the BARREL PAVILION (chiefs, councils, shrines, large trades): a lower drum of upright cloth panels
                 between poles, a sloping painted band at the shoulder (chevrons and diamonds), a narrower clerestory
                 drum, a flat pale roof disc; the frame's poles standing above both rims with pointed finials; striped
                 awnings on poles, pennant strips between them, ladders, an arched door under a fringed valance
   and their parts: brtGuy (a guy rope to an iron hook stake), brtAwning, brtPennant, brtCrown (ring or cap, mast,
   board or banner, a beast-head finial), brtSigil (the claw, the spiral claw), brtLattice (a yurt's lattice wall),
   brtCorral (rope-and-pole or log rails round a polygon), brtRail (a split-rail fence run), brtThorn (a cut-thorn
   barrier on stakes), brtVault (a hooped hide tunnel: the double dome's vestibule, the crawlers' shed).
   Frame: as every ASSET, origin at the footprint's centre on the ground, +z the front (the door). Angles round a tent
   are measured from +x toward +z (a point at angle a is (r cos a, r sin a)), so the front is a = PI / 2.

   Deterministic from core/rand: every varying choice is KRAND.unit(KRAND.hash(seed, variant, salt, i, j)) (brtU) of
   the thing's own indices (a hide's gore and course, a thorn branch's place along the run), never of how many draws
   came before it, so a tent built alone is the tent built in a camp.

   Many small parts go through a BATCH (brtBatch): poles, ropes, stakes, lattice, thorn brush, nets, fringes, stripes
   and painted marks are merged into one mesh per colour and surface (thin four-sided tapered prisms and flat quads),
   so a tent is tens of meshes, not hundreds. A curved sheet (a hide, a panel) is one parametric surface (brtSurf,
   the core's _surfGeo, double-sided). Both are plain indexed BufferGeometry in the frame, like every F.* primitive,
   so the inspector, measureInstance and the box audit see real vertices.

   Surfaces (materials.json, the kit's families over the catalog's): 'tenthide' (cloth.hide.canopy: the domes' hides),
   'pelt' (hide.pelt.cat: the spotted fur skirt), 'canvas' (cloth.canvas.tent: the pavilions' panels, bands, awnings),
   'lash' (wood.lash: lashed poles and frames), and the kit's 'rope', 'hide', 'timber', 'straw', 'yard', 'reed', 'bark'.
   The cut thorn brush has no set of its own: it takes 'bark' (bark.ironbark) until `foliage.thorn.cut` is delivered
   (core/materials/PROMPTS-NEEDED.md).
   ====================================================================== */

/* the tents' colours (sRGB, turned to linear as Girder draws: brmLin, 50-br-mounts.js): the references' pale cream
   hides and spotted brown fur, the pavilion's orange, rust red, cream and dark brown, Girder's red, gilt and verdigris */
const BRT_SRGB = {
  hide: [0xe2d4b4, 0xd8c8a2, 0xcdb88e, 0xeadcc0, 0xc6ae86, 0xd4c09a], hideOld: [0xb39a74, 0xa48a62, 0xc0a880],
  fur: 0x6a4a30, furPale: 0x86623e, spot: 0x3e2818, leather: 0x34261a, ochre: 0xc08436, ochreDark: 0x94602a,
  orange: [0xd27a2c, 0xc46a24, 0xdb8a3a], rust: 0x9a3a22, red: 0x9a2e22, cream: 0xe8d8b4, brown: 0x4a3020,
  roof: 0xe4dac4, iron: 0x24201c, sigil: 0x2a1c14, rope: 0xa8966a, pole: 0x6a5038, poleDark: 0x4e3a28, plank: 0x8a6c48,
  thorn: 0x4a3a2a, thornDry: 0x7a6446, rail: 0x7a6248, water: 0x2c4844, reed: [0x7a8a42, 0x8e9a4e, 0x66763a],
  net: 0x8a7a58, silk: 0xeceee8, earth: 0x6a5238, straw: 0xc9b07a, green: 0x3f7a3a, gilt: 0xb08432, verd: 0x2f6a5a,
  bone: 0xe8e0cc, moss: 0x4e6a34, litter: 0x5e5636
};
const BRT = {}; for (const k in BRT_SRGB) BRT[k] = brmLin(BRT_SRGB[k]);
const BRT_HIDE = 'tenthide/hide', BRT_PELT = 'pelt/hide', BRT_CANVAS = 'canvas/cloth', BRT_LASH = 'lash/wood',
  BRT_THORN = 'bark', BRT_FRONT = Math.PI / 2;

/* a draw in [0, 1) from the thing's own indices (core/rand: KRAND.hash of seed, variant, salt and up to two indices) */
function brtU(F, salt, i, j) { return KRAND.unit(KRAND.hash(F.seed, F.variant, salt, i == null ? 0 : i, j == null ? 0 : j)); }
function brtPick(F, arr, salt, i, j) { return arr[Math.floor(brtU(F, salt, i, j) * arr.length) % arr.length]; }
/* the turn that faces a piece at (x, z) toward (cx, cz) (its front, +z, then points there) */
function brtFace(x, z, cx, cz) { return Math.atan2(((cx == null ? 0 : cx)) - x, ((cz == null ? 0 : cz)) - z); }
function brtAt(r, a, cx, cz) { return [((cx == null ? 0 : cx)) + r * Math.cos(a), ((cz == null ? 0 : cz)) + r * Math.sin(a)]; }

/* a mesh of the frame's own (a geometry already in local coordinates): placed and turned as the frame, the catalog's
   material for (colour, family) double-sided, into the instance's group */
function brtMesh(F, geo, col, fam) {
  const m = new THREE.Mesh(geo, _matDbl(col, furnFamily(F.asset ? F.asset.culture : '', col, fam)));
  m.position.set(F.x, F.y, F.z); m.rotation.y = F.ry;
  return _add(m);
}
/* a parametric sheet: fn(u, v) -> [x, y, z] local, nu by nv cells */
function brtSurf(F, nu, nv, fn, col, fam) { return brtMesh(F, _surfGeo(Math.max(1, nu | 0), Math.max(1, nv | 0), fn, false), col, fam); }

/* THE BATCH: thin sticks (tapered four-sided prisms) and flat quads, merged per colour and family.
     B.stick(col, fam, [ax, ay, az, bx, by, bz, r0, r1])     B.line(col, fam, pts, r0, r1)  (a tapering polyline)
     B.quad(col, fam, p00, p10, p01, p11)                    (bilinear corners; a diamond is top, right, left, bottom)
     B.flush()                                               one mesh per colour and family */
function brtBatch(F) {
  const S = new Map();
  function get(col, fam) { const k = col + '|' + fam; let e = S.get(k); if (!e) S.set(k, e = { col: col, fam: fam, P: [], I: [] }); return e; }
  const B = {
    stick: function (col, fam, s) {
      const e = get(col, fam), ax = s[0], ay = s[1], az = s[2], dx = s[3] - ax, dy = s[4] - ay, dz = s[5] - az;
      const L = Math.hypot(dx, dy, dz); if (L < 1e-4) return;
      const tx = dx / L, ty = dy / L, tz = dz / L;
      let ux = 0, uy = 1, uz = 0; if (Math.abs(ty) > 0.9) { ux = 1; uy = 0; }
      let px = ty * uz - tz * uy, py = tz * ux - tx * uz, pz = tx * uy - ty * ux; const pl = Math.hypot(px, py, pz); px /= pl; py /= pl; pz /= pl;
      const qx = ty * pz - tz * py, qy = tz * px - tx * pz, qz = tx * py - ty * px;
      const r0 = s[6], r1 = s[7] == null ? s[6] : s[7], base = e.P.length / 3;
      for (let end = 0; end < 2; end++) {
        const r = end ? r1 : r0, cx = ax + dx * end, cy = ay + dy * end, cz = az + dz * end;
        for (let k = 0; k < 4; k++) { const c = [1, 0, -1, 0][k], sn = [0, 1, 0, -1][k]; e.P.push(cx + r * (c * px + sn * qx), cy + r * (c * py + sn * qy), cz + r * (c * pz + sn * qz)); }
      }
      for (let k = 0; k < 4; k++) { const a = base + k, b = base + (k + 1) % 4; e.I.push(a, b, a + 4, b, b + 4, a + 4); }
    },
    line: function (col, fam, pts, r0, r1) {
      r1 = r1 == null ? r0 : r1;
      for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], t0 = i / (pts.length - 1), t1 = (i + 1) / (pts.length - 1);
        B.stick(col, fam, [a[0], a[1], a[2], b[0], b[1], b[2], r0 + (r1 - r0) * t0, r0 + (r1 - r0) * t1]); }
    },
    quad: function (col, fam, p00, p10, p01, p11) {
      const e = get(col, fam), base = e.P.length / 3;
      e.P.push(p00[0], p00[1], p00[2], p10[0], p10[1], p10[2], p01[0], p01[1], p01[2], p11[0], p11[1], p11[2]);
      e.I.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    },
    flush: function () {
      S.forEach(function (e) {
        if (!e.I.length) return;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(e.P, 3)); geo.setIndex(e.I); geo.computeVertexNormals();
        brtMesh(F, geo, e.col, e.fam);
      });
      S.clear();
    }
  };
  return B;
}
/* a rope from a to b sagging `sag` at its middle, as a few straight lengths */
function brtRope(B, a, b, sag, r, col) {
  const pts = []; for (let i = 0; i <= 4; i++) { const t = i / 4; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]); }
  B.line(col == null ? BRT.rope : col, 'rope', pts, r == null ? 0.016 : r);
}

/* ==== THE HIDE DOME ==== */
/* the dome's surface: a superellipse profile (fuller shoulders than a sphere: n 2.6) R wide and H high about (cx, cz),
   cut where its radius is the crown ring's. S.at(t) is {r, y, nr, ny} at a fraction t of the arc from the rim (0) to
   the crown (1), (nr, ny) its outward normal; S.tOf(y) is the inverse; S.pt(a, t, off) the point at angle a, `off`
   out along the normal; S.ptY(a, y, off) the same by height */
function brtDomeSurf(cx, cz, R, H, cR, n) {
  n = n == null ? 2.6 : n;
  const rows = [], N = 28, pmax = Math.acos(Math.pow(Math.min(0.98, cR / R), n / 2));
  for (let i = 0; i <= N; i++) { const p = pmax * i / N; rows.push([R * Math.pow(Math.cos(p), 2 / n), H * Math.sin(p)]); }
  const s = [0]; for (let i = 1; i <= N; i++) s.push(s[i - 1] + Math.hypot(rows[i][0] - rows[i - 1][0], rows[i][1] - rows[i - 1][1]));
  const L = s[N];
  const S = { cx: cx, cz: cz, R: R, H: H, cR: cR, top: rows[N][1], rows: rows };
  S.at = function (t) {
    const want = Math.max(0, Math.min(1, t)) * L; let i = 1; while (i < N && s[i] < want) i++;
    const a = rows[i - 1], b = rows[i], k = (want - s[i - 1]) / Math.max(1e-6, s[i] - s[i - 1]);
    const dr = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dr, dy) || 1;
    return { r: a[0] + dr * k, y: a[1] + dy * k, nr: dy / l, ny: -dr / l };
  };
  S.tOf = function (y) { let lo = 0, hi = 1; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (S.at(m).y < y) lo = m; else hi = m; } return (lo + hi) / 2; };
  S.rAt = function (y) { return S.at(S.tOf(y)).r; };
  S.pt = function (a, t, off) { const q = S.at(t), r = q.r + ((off == null ? 0 : off)) * q.nr; return [cx + r * Math.cos(a), q.y + ((off == null ? 0 : off)) * q.ny, cz + r * Math.sin(a)]; };
  S.ptY = function (a, y, off) { return S.pt(a, S.tOf(y), off); };
  /* along the surface: a point du metres round and dv metres up from (a, y), for marks drawn on it */
  S.on = function (a, y, du, dv, off) { const yy = y + dv; return S.ptY(a + du / Math.max(0.3, S.rAt(yy)), yy, off); };
  return S;
}

/* brtDome(F, B, o): draws a hide dome and returns its surface (brtDomeSurf) with door: the opening's angles.
   o: { cx, cz, R, H, cR (crown ring radius, default 0.16 R), n (profile), front (angle of the door, default +z),
        gores (10), courses (4), hides (colours, default BRT.hide), old (0..1: share of darker, older hides),
        door: { w, h } a doorway, or open: { w, h } a wide cut-away front (a trader's: no flap, a lintel pole),
        skirt: { h (0.6), col, fam (default the pelt), rag (the torn hem's depth, 0.22), spots (true) } or false (no skirt, no guys: an open frame),
        base (the height the hides start at, 0: an open frame below them),
        crown: { kind 'ring'|'star', mast (height, 0 none), sign 'board'|'banner'|null, banner colour, finial },
        sigils: [{ a (angle), y, s (size), kind 'claw'|'spiral', col }], guys (count, 0 none), reach (guy reach out),
        floor (a colour: the floor of hides inside, null none) }  */
function brtDome(F, B, o) {
  const R = o.R, H = o.H, cR = o.cR == null ? 0.16 * R : o.cR, cx = (o.cx == null ? 0 : o.cx), cz = (o.cz == null ? 0 : o.cz);
  const S = brtDomeSurf(cx, cz, R, H, cR, o.n), front = o.front == null ? BRT_FRONT : o.front;
  const G = o.gores == null ? 10 : o.gores, C = o.courses == null ? 4 : o.courses, D = Math.PI * 2 / G;
  const hides = o.hides || BRT.hide, old = o.old == null ? 0.15 : o.old;
  /* the opening, as a rectangle in (angle from the front, t): half-width in radians, top as t */
  const op = o.open || o.door, half = op ? (op.w / 2) / R : 0, tTop = op ? S.tOf(op.h) : 0;
  /* the course boundaries: even in t, each jittered per gore (a boundary shared by the two hides on it) */
  const tB = o.base ? S.tOf(o.base) : 0;   /* o.base: the hides start at that height (an open frame below: the smithy) */
  const tb = function (i, j) { if (j <= 0) return tB; if (j >= C) return 1; return tB + (1 - tB) * (j / C + (brtU(F, 12, i, j) - 0.5) * 0.4 / C); };
  for (let i = 0; i < G; i++) {
    let g0 = -D / 2 + i * D; if (g0 >= Math.PI - 1e-9) g0 -= Math.PI * 2;
    const g1 = g0 + D;
    for (let j = 0; j < C; j++) {
      const t0 = tb(i, j), t1 = tb(i, j + 1);
      const col = brtU(F, 13, i, j) < old ? brtPick(F, BRT.hideOld, 14, i, j) : brtPick(F, hides, 15, i, j);
      const off = ((i + j) % 2) * 0.014 + 0.004 * j;
      const part = function (a0, a1, s0, s1) {
        if (a1 - a0 < 1e-4 || s1 - s0 < 1e-4) return;
        const nu = Math.max(2, Math.ceil((a1 - a0) * R / 0.45)), nv = Math.max(2, Math.ceil((s1 - s0) * 9));
        brtSurf(F, nu, nv, function (u, v) { return S.pt(front + a0 + (a1 - a0) * u, s0 + (s1 - s0) * v, off); }, col, BRT_HIDE);
      };
      if (!op || t0 >= tTop || g1 <= -half || g0 >= half) { part(g0, g1, t0, t1); continue; }
      /* the hide is cut by the opening: what stands either side of it, and what is over it */
      part(g0, Math.min(g1, -half), t0, t1); part(Math.max(g0, half), g1, t0, t1);
      part(Math.max(g0, -half), Math.min(g1, half), Math.max(t0, tTop), t1);
    }
  }
  /* the skirt of fur round the foot, its hem torn: each column of the sheet ends at its own height */
  if (o.skirt === false) { brtCrown(F, B, cx, cz, S.top, cR, o.crown || {}); (o.sigils || []).forEach(function (g) { brtSigil(F, B, S, front + g.a, g.y, (g.s == null ? 1 : g.s), g.kind || 'claw', g.col == null ? BRT.sigil : g.col); }); S.front = front; S.half = half; return S; }
  const sk = o.skirt || {}, skH = sk.h == null ? Math.min(0.75, 0.2 * H) : sk.h, rag = sk.rag == null ? 0.22 : sk.rag;
  const a0 = op ? half + 0.02 : 0, a1 = op ? Math.PI * 2 - half - 0.02 : Math.PI * 2;
  const nuS = Math.max(16, Math.round((a1 - a0) * R / 0.16));
  brtSurf(F, nuS, 3, function (u, v) {
    const k = Math.round(u * nuS), hem = (k % 2 ? 0.25 : 0) * rag + brtU(F, 21, k) * rag * 0.75;
    const y = hem + (skH - hem) * v;
    return S.ptY(front + a0 + (a1 - a0) * u, Math.max(0.01, y), 0.04 + 0.03 * (1 - v));
  }, sk.col == null ? BRT.fur : sk.col, sk.fam || BRT_PELT);
  if (sk.spots !== false) {
    const nS = Math.round((a1 - a0) * R / 0.5);
    for (let k = 0; k < nS; k++) {
      const a = front + a0 + (a1 - a0) * (k + 0.2 + brtU(F, 22, k) * 0.6) / nS, y = skH * (0.35 + brtU(F, 23, k) * 0.5), p = S.ptY(a, y, 0.075);
      F.ell(p[0], p[1], p[2], 0.045 + brtU(F, 24, k) * 0.06, 0.035 + brtU(F, 25, k) * 0.045, 0.016, Math.PI / 2 - a, BRT.spot, BRT_PELT);
    }
  }
  /* the opening's frame: lashed jambs and a lintel; a dwelling's door has its flap rolled up over it */
  if (op) {
    const pl = S.ptY(front - half, 0.02, 0.06), pr = S.ptY(front + half, 0.02, 0.06), tl = S.ptY(front - half, op.h, 0.06), tr = S.ptY(front + half, op.h, 0.06);
    B.stick(BRT.pole, BRT_LASH, [pl[0], 0, pl[2], tl[0], tl[1] + 0.1, tl[2], 0.06, 0.05]);
    B.stick(BRT.pole, BRT_LASH, [pr[0], 0, pr[2], tr[0], tr[1] + 0.1, tr[2], 0.06, 0.05]);
    const lx = 0.25 * Math.cos(front), lz = 0.25 * Math.sin(front);
    B.stick(BRT.poleDark, BRT_LASH, [tl[0] + lx + 0.2 * Math.sin(front), tl[1] + 0.04, tl[2] + lz - 0.2 * Math.cos(front), tr[0] + lx - 0.2 * Math.sin(front), tr[1] + 0.04, tr[2] + lz + 0.2 * Math.cos(front), 0.055]);
    if (o.door) {   /* the rolled flap */
      B.stick(BRT.hideOld[0], BRT_HIDE, [tl[0] + lx * 0.6, tl[1] + 0.22, tl[2] + lz * 0.6, tr[0] + lx * 0.6, tr[1] + 0.22, tr[2] + lz * 0.6, 0.12]);
      for (const p of [tl, tr]) brtRope(B, [p[0] + lx * 0.5, p[1] + 0.5, p[2] + lz * 0.5], [p[0] + lx * 0.7, p[1] + 0.1, p[2] + lz * 0.7], 0, 0.012);
    }
  }
  /* the crown, its mast and sign */
  brtCrown(F, B, cx, cz, S.top, cR, o.crown || {});
  /* painted sigils on the flank */
  (o.sigils || []).forEach(function (g) { brtSigil(F, B, S, front + g.a, g.y, (g.s == null ? 1 : g.s), g.kind || 'claw', g.col == null ? BRT.sigil : g.col); });
  /* guy ropes from the shoulder to iron stakes all round (none across the opening) */
  const nG = o.guys == null ? 8 : o.guys;
  if (nG > 0) {
    const yA = H * 0.62, reach = o.reach == null ? R * 0.9 + 0.8 : o.reach;
    for (let k = 0; k < nG; k++) {
      const a = front + Math.PI / nG + k * Math.PI * 2 / nG + (brtU(F, 31, k) - 0.5) * 0.12;
      let rel = ((a - front) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      if (op && Math.abs(rel) < half + 0.25) continue;
      const p = S.ptY(a, yA, 0.03), q = brtAt(R + reach, a, cx, cz);
      brtGuy(B, p, q[0], q[1]);
    }
  }
  if (o.floor != null) F.cyl(cx, 0, cz, R - 0.12, 0.04, 0, o.floor, 'straw/cloth');
  S.front = front; S.half = half;
  return S;
}

/* a guy rope from p ([x, y, z] on the tent) to a black iron hook stake driven in at (sx, sz), leaning away */
function brtGuy(B, p, sx, sz) {
  const dx = sx - p[0], dz = sz - p[2], l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
  const top = [sx + ux * 0.1, 0.42, sz + uz * 0.1];
  B.stick(BRT.iron, 'metal', [sx - ux * 0.04, -0.12, sz - uz * 0.04, top[0], top[1], top[2], 0.028, 0.022]);
  B.stick(BRT.iron, 'metal', [top[0], top[1], top[2], top[0] - ux * 0.13, top[1] - 0.1, top[2] - uz * 0.13, 0.02, 0.012]);
  brtRope(B, p, [top[0] - ux * 0.06, top[1] - 0.04, top[2] - uz * 0.06], 0.06 + l * 0.01, 0.014);
}

/* the crown: a ring of bound dark leather and iron at the crown hole, then a cap ('ring': a low dark dome; 'star': an
   ochre leather sunburst); a short mast (o.mast metres) with a cross-bar and a plank sign board or a hanging banner
   (ochre, a gilt claw on it); a beast-head finial at the mast's head (o.finial false: none) */
function brtCrown(F, B, cx, cz, y, cR, o) {
  F.lathe(cx, y - 0.14, cz, [[cR + 0.1, 0], [cR + 0.16, 0.1], [cR + 0.14, 0.24], [cR - 0.02, 0.28]], 0, BRT.leather, 'hide', { nu: 20 });
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, p = brtAt(cR + 0.17, a, cx, cz); F.box(p[0], y - 0.08, p[1], 0.07, 0.22, 0.07, -a, BRT.iron, 'metal'); }
  if (o.kind === 'star') {
    F.lathe(cx, y + 0.06, cz, [[cR * 1.9 + 0.15, 0], [cR * 1.3 + 0.1, 0.1], [cR * 0.7, 0.22], [0.1, 0.32]], 0, BRT.ochre, 'hide', { nu: 48, flute: { n: 9, amp: 0.6, sharp: 2.2 } });
  } else {
    F.dome(cx, y + 0.1, cz, cR + 0.05, (cR + 0.05) * 0.45, 0, BRT.leather, 'hide');
  }
  const mh = o.mast == null ? 0 : o.mast;
  if (!mh) return;
  const y0 = y + 0.2, yt = y0 + mh;
  B.stick(BRT.poleDark, BRT_LASH, [cx, y0, cz, cx, yt, cz, 0.06, 0.045]);
  if (!o.sign) {   /* a bare mast: a pennant off its head */
    B.quad(o.banner == null ? BRT.red : o.banner, 'cloth', [cx, yt - 0.08, cz], [cx + 0.9, yt - 0.2, cz], [cx, yt - 0.42, cz], [cx + 0.9, yt - 0.3, cz]);
    F.cone(cx, yt, cz, 0.06, 0.26, 0, BRT.gilt, 'metal'); return;
  }
  const bar = o.bar == null ? 1.3 : o.bar, yb = yt - 0.3;
  B.stick(BRT.poleDark, BRT_LASH, [cx - bar / 2, yb, cz, cx + bar / 2, yb, cz, 0.04]);
  if (o.sign === 'board') {
    for (const s of [-1, 1]) brtRope(B, [cx + s * bar * 0.36, yb, cz], [cx + s * bar * 0.36, yb - 0.28, cz], 0, 0.012);
    F.box(cx, yb - 0.75, cz, bar * 0.86, 0.48, 0.06, 0, BRT.plank, 'wood');
    F.box(cx, yb - 0.79, cz + 0.035, bar * 0.92, 0.06, 0.03, 0, BRT.poleDark, 'wood');
    F.box(cx, yb - 0.33, cz + 0.035, bar * 0.92, 0.06, 0.03, 0, BRT.poleDark, 'wood');
    if (o.mark) brtFlatClaw(B, cx, yb - 0.51, cz + 0.04, 0.32, BRT.sigil);
  } else if (o.sign === 'banner') {
    const bw = bar * 0.8, bh = o.bannerH == null ? 1.15 : o.bannerH, col = o.banner == null ? BRT.ochre : o.banner;
    F.box(cx, yb - bh - 0.02, cz, bw, bh, 0.04, 0, col, 'cloth');
    /* the swallow-tail foot, and the gilt claw on it */
    B.quad(col, 'cloth', [cx - bw / 2, yb - bh - 0.02, cz], [cx, yb - bh - 0.02, cz], [cx - bw / 2, yb - bh - 0.32, cz], [cx, yb - bh - 0.12, cz]);
    B.quad(col, 'cloth', [cx, yb - bh - 0.02, cz], [cx + bw / 2, yb - bh - 0.02, cz], [cx, yb - bh - 0.12, cz], [cx + bw / 2, yb - bh - 0.32, cz]);
    brtFlatClaw(B, cx, yb - bh * 0.5, cz + 0.03, bh * 0.36, BRT.gilt);
    brtFlatClaw(B, cx, yb - bh * 0.5, cz - 0.03, bh * 0.36, BRT.gilt);
  }
  if (o.finial !== false) brmFinial(F, cx, yt - 0.05, cz, 0, 1, 0.42, BRM.deep);
  else F.cone(cx, yt, cz, 0.08, 0.3, 0, BRT.gilt, 'metal');
}
/* the claw as three slashes on a flat face (facing z) centred at (x, y, z), s high */
function brtFlatClaw(B, x, y, z, s, col) {
  for (let k = -1; k <= 1; k++) {
    const pts = []; for (let i = 0; i <= 4; i++) { const t = i / 4; pts.push([x + k * 0.3 * s - 0.12 * s + 0.24 * s * t + Math.sin(Math.PI * t) * 0.06 * s, y + 0.5 * s - s * t, z]); }
    B.line(col, 'cloth', pts, 0.045 * s, 0.012 * s);
  }
}
/* a painted sigil on a curved surface S (brtDomeSurf or a drum: anything with S.on(a, y, du, dv, off)), at angle a and
   height y, s metres across: 'claw' (the Riders' three talon slashes), 'spiral' (the spiral claw of the reference: a
   spiral of a turn and a half, three hooked claws off its outer end) */
function brtSigil(F, B, S, a, y, s, kind, col) {
  const on = function (du, dv) { return S.on(a, y, du * s, dv * s, 0.02); }, R0 = 0.07, R1 = 0.022;
  if (kind === 'spiral') {
    const sp = []; for (let i = 0; i <= 26; i++) { const th = i / 26 * Math.PI * 3, rr = 0.06 + 0.1 * th / Math.PI; sp.push(on(rr * Math.cos(th), rr * Math.sin(th))); }
    B.line(col, 'cloth', sp.reverse(), R0 * s * 1.1, R1 * s);
    const th = Math.PI * 3, ex = 0.36 * Math.cos(th), ey = 0.36 * Math.sin(th);
    for (let k = -1; k <= 1; k++) {
      const pts = []; for (let i = 0; i <= 4; i++) { const t = i / 4, an = Math.PI + k * 0.5 + t * 0.5; pts.push(on(ex + Math.cos(an) * 0.42 * t + k * 0.05, ey + Math.sin(an) * 0.42 * t - 0.08 * t * t)); }
      B.line(col, 'cloth', pts, R0 * s, R1 * s * 0.6);
    }
    return;
  }
  for (let k = -1; k <= 1; k++) {
    const pts = []; for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push(on(k * 0.3 - 0.12 + 0.24 * t + Math.sin(Math.PI * t) * 0.07, 0.5 - t)); }
    B.line(col, 'cloth', pts, R0 * s * 1.2, R1 * s * 0.5);
  }
}

/* ==== THE BARREL PAVILION ==== */
/* a drum's surface for marks (S.on): a cylinder of radius r about (cx, cz) */
function brtDrumSurf(cx, cz, r) {
  return { on: function (a, y, du, dv, off) { const aa = a + du / r, rr = r + ((off == null ? 0 : off)); return [cx + rr * Math.cos(aa), y + dv, cz + rr * Math.sin(aa)]; } };
}
/* brtBarrel(F, B, o): draws a barrel pavilion and returns its measures {r1, h1, r2, y2, top, poleA}.
   o: { cx, cz, n (sides, 12), r1, h1 (the lower drum), hs (the shoulder band's rise), r2, h2 (the clerestory),
        front, panels [two colours], upper [two colours], band { base, rim, motif, motif2 }, roof (colour),
        door { w, h (to the arch's spring), rise }, awnings [{ a (angle from the front), w, d }], pennants (true),
        ladders [angles from the front], guys (true), mast (metres over the roof, 0 none), floor (colour),
        centre (true: a centre pole inside) }  */
function brtBarrel(F, B, o) {
  const cx = (o.cx == null ? 0 : o.cx), cz = (o.cz == null ? 0 : o.cz), n = (o.n == null ? 12 : o.n), r1 = o.r1, h1 = o.h1, hs = o.hs == null ? 0.9 : o.hs, r2 = o.r2, h2 = o.h2 == null ? 1.4 : o.h2;
  const front = o.front == null ? BRT_FRONT : o.front, D = Math.PI * 2 / n, P = o.panels || [BRT.orange[0], BRT.orange[1]];
  const U = o.upper || [BRT.orange[2], BRT.orange[0]], band = o.band || {}, y2 = h1 + hs, yT = y2 + h2;
  const ang = function (i) { return front - D / 2 + i * D; };
  const at = function (r, a, y) { return [cx + r * Math.cos(a), y, cz + r * Math.sin(a)]; };
  const lerp3 = function (p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]; };
  /* a panel between two poles: a sheet from (a0, y0) to (a1, y1) at radius r, bellied a little outward */
  const panel = function (r, a0, a1, y0, y1, col, u0, u1, yb) {
    u0 = (u0 == null ? 0 : u0); u1 = u1 == null ? 1 : u1;
    const am = (a0 + a1) / 2, nx = Math.cos(am), nz = Math.sin(am), A = at(r, a0, 0), Bq = at(r, a1, 0);
    brtSurf(F, 4, 4, function (u, v) {
      const uu = u0 + (u1 - u0) * u, bot = yb ? yb(uu) : y0, y = bot + (y1 - bot) * v, b = 0.035 * r * Math.sin(Math.PI * uu) * (0.4 + 0.6 * Math.sin(Math.PI * v));
      return [A[0] + (Bq[0] - A[0]) * uu + nx * b, y, A[2] + (Bq[2] - A[2]) * uu + nz * b];
    }, col, BRT_CANVAS);
  };
  /* the lower drum; the door panel (0) cut by an arched doorway */
  const side = 2 * r1 * Math.sin(D / 2), dr = o.door || { w: Math.min(1.6, side * 0.62), h: Math.min(1.9, h1 * 0.62) };
  const du = Math.min(0.42, (dr.w / 2) / side), rise = dr.rise == null ? dr.w * 0.45 : dr.rise;
  const arch = function (u) { const q = (u - 0.5) / du; return dr.h + rise * Math.sqrt(Math.max(0, 1 - q * q)); };
  for (let i = 0; i < n; i++) {
    const col = P[i % P.length];
    if (i) { panel(r1, ang(i), ang(i + 1), 0, h1, col); continue; }
    panel(r1, ang(0), ang(1), 0, h1, col, 0, 0.5 - du); panel(r1, ang(0), ang(1), 0, h1, col, 0.5 + du, 1);
    panel(r1, ang(0), ang(1), 0, h1, col, 0.5 - du, 0.5 + du, arch);
  }
  /* the arch's fringed valance: a band over the arch in cream and red, a fringe hanging from it */
  {
    const A = at(r1 + 0.06, ang(0), 0), Bq = at(r1 + 0.06, ang(1), 0), N = 14, pts = [];
    for (let k = 0; k <= N; k++) { const u = 0.5 - du + 2 * du * k / N, p = lerp3(A, Bq, u); pts.push([p[0], arch(u), p[2]]); }
    for (let k = 0; k < N; k++) {
      const p = pts[k], q = pts[k + 1], c = k % 2 ? BRT.red : BRT.cream;
      B.quad(c, BRT_CANVAS, [p[0], p[1], p[2]], [q[0], q[1], q[2]], [p[0], p[1] + 0.26, p[2]], [q[0], q[1] + 0.26, q[2]]);
      for (let f = 0; f < 3; f++) { const t = (f + 0.5) / 3, x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t, z = p[2] + (q[2] - p[2]) * t;
        B.stick(f % 2 ? BRT.ochre : BRT.red, 'cloth', [x, y, z, x, y - 0.2, z, 0.012, 0.008]); }
    }
  }
  /* the poles at the panels' joins, standing over the rim with pointed finials; rafters up the band; the upper poles */
  const fin = function (x, y, z, r) { F.cone(x, y, z, r, 0.32, 0, BRT.gilt, 'metal'); };
  for (let i = 0; i < n; i++) {
    const a = ang(i), p = at(r1 + 0.07, a, 0), q = at(r2 + 0.06, a, 0);
    B.stick(BRT.poleDark, BRT_LASH, [p[0], 0, p[2], p[0], h1 + 0.42, p[2], 0.07, 0.06]); fin(p[0], h1 + 0.4, p[2], 0.08);
    B.stick(BRT.poleDark, BRT_LASH, [p[0], h1 + 0.02, p[2], q[0], y2 + 0.02, q[2], 0.05]);
    B.stick(BRT.poleDark, BRT_LASH, [q[0], y2 - 0.05, q[2], q[0], yT + 0.36, q[2], 0.055, 0.045]); fin(q[0], yT + 0.34, q[2], 0.065);
  }
  /* the shoulder band: red rims, a cream field, chevrons and diamonds in alternation, side by side */
  const bb = band.base == null ? BRT.cream : band.base, rim = band.rim == null ? BRT.red : band.rim, m1 = band.motif == null ? BRT.red : band.motif, m2 = band.motif2 == null ? BRT.brown : band.motif2;
  for (let i = 0; i < n; i++) {
    const a0 = ang(i), a1 = ang(i + 1), A0 = at(r1 + 0.03, a0, h1), A1 = at(r1 + 0.03, a1, h1), C0 = at(r2 + 0.03, a0, y2), C1 = at(r2 + 0.03, a1, y2);
    const S2 = function (s, t, off) { const p = lerp3(lerp3(A0, A1, s), lerp3(C0, C1, s), t), am = (a0 + a1) / 2, k = (off == null ? 0 : off); return [p[0] + Math.cos(am) * k, p[1] + k * 0.6, p[2] + Math.sin(am) * k]; };
    const Q = function (col, c00, c10, c01, c11, off) { B.quad(col, BRT_CANVAS, S2(c00[0], c00[1], off), S2(c10[0], c10[1], off), S2(c01[0], c01[1], off), S2(c11[0], c11[1], off)); };
    Q(rim, [0, 0], [1, 0], [0, 0.16], [1, 0.16], 0); Q(bb, [0, 0.16], [1, 0.16], [0, 0.84], [1, 0.84], 0); Q(rim, [0, 0.84], [1, 0.84], [0, 1], [1, 1], 0);
    if (i % 2 === 0) {   /* a chevron, an arrow pointing up: two arms meeting at the top */
      Q(m1, [0.12, 0.24], [0.26, 0.24], [0.42, 0.74], [0.56, 0.62], 0.012); Q(m1, [0.74, 0.24], [0.88, 0.24], [0.44, 0.62], [0.58, 0.74], 0.012);
      Q(m2, [0.4, 0.24], [0.6, 0.24], [0.46, 0.4], [0.54, 0.4], 0.014);
    } else {             /* a diamond with a dark heart */
      Q(m1, [0.5, 0.22], [0.78, 0.5], [0.22, 0.5], [0.5, 0.78], 0.012); Q(m2, [0.5, 0.38], [0.62, 0.5], [0.38, 0.5], [0.5, 0.62], 0.014);
    }
  }
  /* the clerestory drum and the roof: a pale disc, nearly flat, a red edge, a short mast with a pennant */
  for (let i = 0; i < n; i++) panel(r2, ang(i), ang(i + 1), y2, yT, U[i % U.length]);
  F.lathe(cx, yT - 0.02, cz, [[r2 + 0.32, 0], [r2 + 0.3, 0.1], [r2 * 0.55, 0.34], [0.12, 0.5]], 0, o.roof == null ? BRT.roof : o.roof, BRT_CANVAS, { nu: 32 });
  F.lathe(cx, yT - 0.16, cz, [[r2 + 0.34, 0], [r2 + 0.36, 0.1], [r2 + 0.33, 0.2]], 0, BRT.red, BRT_CANVAS, { nu: 32 });
  const mast = o.mast == null ? 1.6 : o.mast;
  if (mast > 0) {
    B.stick(BRT.poleDark, BRT_LASH, [cx, yT + 0.4, cz, cx, yT + 0.4 + mast, cz, 0.06, 0.045]);
    brmFinial(F, cx, yT + 0.35 + mast, cz, 0, 1, 0.42, BRM.deep);
    B.quad(BRT.red, 'cloth', [cx, yT + mast, cz], [cx + 1.1, yT + mast - 0.15, cz], [cx, yT + mast - 0.5, cz], [cx + 1.1, yT + mast - 0.3, cz]);
  }
  /* the awnings, the pennant strips between them, the ladders, the guys */
  const aw = o.awnings || [];
  aw.forEach(function (w, k) { brtAwning(F, B, cx, cz, r1, front + w.a, h1 * 0.86, (w.w == null ? 2.4 : w.w), (w.d == null ? 1.9 : w.d), k); });
  if (o.pennants !== false) {
    const nP = o.pennantN || n;
    for (let k = 0; k < nP; k++) {
      const a = ang(k) + D * (nP === n ? 0.5 : 0) + (nP === n ? 0 : k * Math.PI * 2 / nP);
      const rel = ((a - front) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      if (Math.abs(rel) < D * 0.8) continue;
      if (aw.some(function (w) { const d = ((a - front - w.a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; return Math.abs(d) < (((w.w == null ? 2.4 : w.w)) / 2 + 0.4) / r1; })) continue;
      brtPennant(B, brtDrumSurf(cx, cz, r1 + 0.1), a, h1 - 0.02, Math.min(2.2, h1 * 0.6), k);
    }
  }
  (o.ladders || []).forEach(function (la) { brtLadder(B, cx, cz, r1, front + la, h1 * 0.96); });
  if (o.guys !== false) for (let i = 0; i < n; i += 2) {
    const a = ang(i), rel = ((a - front) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
    if (Math.abs(rel) < D * 1.2) continue;
    if (aw.some(function (w) { const d = ((a - front - w.a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; return Math.abs(d) < (((w.w == null ? 2.4 : w.w)) / 2 + 0.5) / r1; })) continue;
    const p = at(r1 + 0.07, a, h1 + 0.3), q = brtAt(r1 + h1 * 0.75 + 1, a, cx, cz);
    brtGuy(B, p, q[0], q[1]);
  }
  if (o.centre !== false) B.stick(BRT.pole, BRT_LASH, [cx, 0, cz, cx, yT + 0.45, cz, 0.12, 0.1]);
  if (o.floor != null) F.cyl(cx, 0, cz, r1 - 0.1, 0.04, 0, o.floor, 'straw/cloth');
  return { r1: r1, h1: h1, r2: r2, y2: y2, top: yT, ang: ang, n: n, front: front };
}
/* a striped awning off a drum of radius r at angle a: its inner edge on the drum at height y, `d` out and 0.55 m lower,
   `w` wide, in red and cream stripes, a row of hanging diamonds along its edge, two poles with finials, two guys */
function brtAwning(F, B, cx, cz, r, a, y, w, d, k) {
  const ca = Math.cos(a), sa = Math.sin(a), tx = -sa, tz = ca, yo = y - 0.55;
  const P = function (s, out, yy) { return [cx + ca * (r + 0.1 + out) + tx * s, yy, cz + sa * (r + 0.1 + out) + tz * s]; };
  const nS = Math.max(3, Math.round(w / 0.42));
  for (let i = 0; i < nS; i++) {
    const s0 = -w / 2 + w * i / nS, s1 = -w / 2 + w * (i + 1) / nS, c = (i + k) % 2 ? BRT.cream : BRT.red;
    B.quad(c, BRT_CANVAS, P(s0, 0, y), P(s1, 0, y), P(s0, d, yo), P(s1, d, yo));
  }
  const nD = Math.max(4, Math.round(w / 0.3));
  for (let i = 0; i < nD; i++) {
    const s = -w / 2 + w * (i + 0.5) / nD, c = i % 2 ? BRT.red : BRT.cream, hw = w / nD / 2;
    B.quad(c, BRT_CANVAS, P(s, d, yo), P(s + hw, d, yo - 0.15), P(s - hw, d, yo - 0.15), P(s, d, yo - 0.3));
  }
  for (const s of [-w / 2, w / 2]) {
    const p = P(s, d, 0); B.stick(BRT.poleDark, BRT_LASH, [p[0], 0, p[2], p[0], yo + 0.3, p[2], 0.045, 0.04]);
    F.cone(p[0], yo + 0.28, p[2], 0.06, 0.26, 0, BRT.gilt, 'metal');
    const q = P(s * 1.25, d + 1.5, 0); brtGuy(B, [p[0], yo + 0.2, p[2]], q[0], q[2]);
  }
}
/* a pennant strip hanging on a drum S (S.on) at angle a from height y, `len` long: three bands of colour and a
   pointed foot, a chevron in each band */
function brtPennant(B, S, a, y, len, k) {
  const w = 0.17, cols = [[BRT.red, BRT.cream, BRT.ochre], [BRT.cream, BRT.rust, BRT.brown], [BRT.ochre, BRT.red, BRT.cream]][k % 3];
  const seg = len * 0.28;
  for (let i = 0; i < 3; i++) {
    const y0 = -seg * i, y1 = -seg * (i + 1);
    B.quad(cols[i], 'cloth', S.on(a, y, -w, y0, 0.02), S.on(a, y, w, y0, 0.02), S.on(a, y, -w, y1, 0.02), S.on(a, y, w, y1, 0.02));
    const c2 = cols[(i + 1) % 3];
    B.quad(c2, 'cloth', S.on(a, y, -w * 0.8, y0 - seg * 0.25, 0.03), S.on(a, y, 0, y0 - seg * 0.55, 0.03), S.on(a, y, -w * 0.8, y0 - seg * 0.45, 0.03), S.on(a, y, 0, y0 - seg * 0.75, 0.03));
    B.quad(c2, 'cloth', S.on(a, y, 0, y0 - seg * 0.55, 0.03), S.on(a, y, w * 0.8, y0 - seg * 0.25, 0.03), S.on(a, y, 0, y0 - seg * 0.75, 0.03), S.on(a, y, w * 0.8, y0 - seg * 0.45, 0.03));
  }
  const yf = -seg * 3;
  B.quad(cols[2], 'cloth', S.on(a, y, -w, yf, 0.02), S.on(a, y, w, yf, 0.02), S.on(a, y, -0.01, yf - len * 0.16, 0.02), S.on(a, y, 0.01, yf - len * 0.16, 0.02));
}
/* a lashed ladder leaning on a drum of radius r at angle a, its head at height h */
function brtLadder(B, cx, cz, r, a, h) {
  const ca = Math.cos(a), sa = Math.sin(a), tx = -sa, tz = ca, foot = r + 0.3 + h * 0.3, head = r + 0.14;
  for (const s of [-0.24, 0.24]) B.stick(BRT.pole, BRT_LASH, [cx + ca * foot + tx * s, 0, cz + sa * foot + tz * s, cx + ca * head + tx * s, h, cz + sa * head + tz * s, 0.04]);
  const nR = Math.floor(h / 0.32);
  for (let i = 1; i <= nR; i++) { const t = i / (nR + 0.6), rr = foot + (head - foot) * t, y = h * t;
    B.stick(BRT.pole, BRT_LASH, [cx + ca * rr - tx * 0.26, y, cz + sa * rr - tz * 0.26, cx + ca * rr + tx * 0.26, y, cz + sa * rr + tz * 0.26, 0.022]); }
}

/* ==== FRAMES, FENCES, HEDGES ==== */
/* a yurt's lattice wall: crossed laths round (cx, cz) at radius r, h high, from angle a0 to a1 (absolute) */
function brtLattice(B, cx, cz, r, h, a0, a1, col) {
  const N = Math.max(2, Math.round((a1 - a0) * r / 0.32)), dA = h / r * 0.9;
  for (let i = 0; i <= N; i++) {
    const a = a0 + (a1 - a0) * i / N;
    for (const s of [1, -1]) { const b = a + s * dA; if (b < a0 - 1e-6 || b > a1 + 1e-6) continue;
      const p = brtAt(r, a, cx, cz), q = brtAt(r, b, cx, cz); B.stick(col == null ? BRT.plank : col, BRT_LASH, [p[0], 0.04, p[1], q[0], h, q[1], 0.022]); }
  }
  for (const y of [0.06, h]) for (let i = 0; i < N; i++) { const p = brtAt(r, a0 + (a1 - a0) * i / N, cx, cz), q = brtAt(r, a0 + (a1 - a0) * (i + 1) / N, cx, cz); B.stick(BRT.poleDark, BRT_LASH, [p[0], y, p[1], q[0], y, q[1], 0.03]); }
}
/* a corral round the closed polygon pts ([[x, z], ...] local): posts every `step` (2.6), `rails` rails to height h;
   o.rope: rope rails that sag (a portable rope-and-pole corral), else lashed pole rails; o.gate: { e (the edge index),
   w } a gap at that edge's middle between two tall gate posts under a cross-bar, a beast-head on each;
   o.post (radius), o.col */
function brtCorral(F, B, pts, h, o) {
  o = o || {};
  const step = (o.step == null ? 2.6 : o.step), nR = (o.rails == null ? 3 : o.rails), pr = (o.post == null ? 0.07 : o.post), col = o.col == null ? BRT.pole : o.col;
  const posts = [];
  for (let e = 0; e < pts.length; e++) {
    const a = pts[e], b = pts[(e + 1) % pts.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let runs = [[0, L]];
    if (o.gate && o.gate.e === e) { const g = o.gate.w / 2; runs = [[0, L / 2 - g], [L / 2 + g, L]];
      const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      for (const s of [-1, 1]) { const x = a[0] + ux * (L / 2 + s * g), z = a[1] + uz * (L / 2 + s * g); B.stick(BRT.poleDark, BRT_LASH, [x, -0.2, z, x, h + 0.9, z, pr * 1.8, pr * 1.5]);
        brmFinial(F, x, h + 0.88, z, ux * s, uz * s, 0.32, BRM.deep); }
      B.stick(BRT.poleDark, BRT_LASH, [a[0] + ux * (L / 2 - g), h + 0.7, a[1] + uz * (L / 2 - g), a[0] + ux * (L / 2 + g), h + 0.7, a[1] + uz * (L / 2 + g), pr * 1.2]);
    }
    runs.forEach(function (r) {
      if (r[1] - r[0] < 0.3) return;
      const n = Math.max(1, Math.round((r[1] - r[0]) / step)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      const P = []; for (let i = 0; i <= n; i++) { const s = r[0] + (r[1] - r[0]) * i / n; P.push([a[0] + ux * s, a[1] + uz * s]); }
      P.forEach(function (p, i) { if (i === 0 && posts.length && Math.hypot(posts[posts.length - 1][0] - p[0], posts[posts.length - 1][1] - p[1]) < 0.05) return; posts.push(p);
        B.stick(col, BRT_LASH, [p[0], -0.15, p[1], p[0] + (brtU(F, 41, e, i) - 0.5) * 0.08, h + 0.12, p[1], pr, pr * 0.85]); });
      for (let i = 0; i < n; i++) for (let k = 0; k < nR; k++) {
        const y = h * (k + 1) / (nR + 0.15), p = P[i], q = P[i + 1];
        if (o.rope) brtRope(B, [p[0], y, p[1]], [q[0], y, q[1]], 0.07, 0.018);
        else B.stick(o.railCol == null ? BRT.rail : o.railCol, BRT_LASH, [p[0], y + (brtU(F, 42, i, k) - 0.5) * 0.06, p[1], q[0], y + (brtU(F, 43, i, k) - 0.5) * 0.06, q[1], pr * 0.62]);
      }
    });
  }
}
/* a split-rail fence run from (ax, az) to (bx, bz): posts every 2.4 m, `rails` split rails (flat beams) between */
function brtRail(F, B, ax, az, bx, bz, h, rails) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.4)), ux = (bx - ax) / L, uz = (bz - az) / L;
  for (let i = 0; i <= n; i++) { const x = ax + ux * L * i / n, z = az + uz * L * i / n; B.stick(BRT.poleDark, BRT_LASH, [x, -0.25, z, x, h + 0.15, z, 0.09, 0.08]); }
  for (let i = 0; i < n; i++) for (let k = 0; k < rails; k++) {
    const y = h * (k + 1) / (rails + 0.2), x0 = ax + ux * L * i / n, z0 = az + uz * L * i / n, x1 = ax + ux * L * (i + 1) / n, z1 = az + uz * L * (i + 1) / n;
    F.beam(x0 - ux * 0.15, y + (brtU(F, 44, i, k) - 0.5) * 0.05, z0 - uz * 0.15, x1 + ux * 0.15, y + (brtU(F, 45, i, k) - 0.5) * 0.05, z1 + uz * 0.15, 0.06, 0.15, brtPick(F, [BRT.rail, BRT.pole, BRT.plank], 46, i, k), BRT_LASH);
  }
}
/* a cut-thorn barrier (a boma) along x from x0 to x1 at z 0: thorn branches piled across stakes, `h` high and `t` thick;
   each branch's place, lean and twigs are hashed from its own index along the run (brtU), so a run cut at any length
   draws the same brush where it overlaps another */
function brtThorn(F, B, x0, x1, h, t, salt) {
  salt = (salt == null ? 0 : salt);
  const L = x1 - x0, nS = Math.max(1, Math.round(L / 1.7));
  for (let i = 0; i <= nS; i++) { const x = x0 + L * i / nS; for (const s of [-1, 1]) B.stick(BRT.poleDark, BRT_LASH, [x, -0.2, s * t * 0.2, x + (brtU(F, 50 + salt, i, s) - 0.5) * 0.12, h * 0.85, s * t * 0.18, 0.045, 0.032]); }
  /* the cut branches piled across the stakes, lying along the run and up out of it, each bristling with twigs */
  const per = 30, nB = Math.max(8, Math.round(L * per));
  for (let i = 0; i < nB; i++) {
    const U = function (k) { return brtU(F, 51 + salt, i, k); };
    const x = x0 + L * (i + U(0)) / nB, z = (U(1) - 0.5) * t * 0.9, y = Math.pow(U(2), 1.6) * h * 0.7;
    const len = 0.8 + U(3) * 1.3, lean = (U(4) - 0.5) * Math.PI, up = 0.05 + U(5) * 0.6;
    let dx = Math.cos(lean), dz = Math.sin(lean) * 0.6, dy = up; const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
    if (U(6) < 0.5) dx = -dx;
    const ex = Math.max(x0 - 0.15, Math.min(x1 + 0.15, x + dx * len)), ey = Math.min(h, y + dy * len), ez = Math.max(-t / 2, Math.min(t / 2, z + dz * len));
    const col = U(7) < 0.4 ? BRT.thornDry : BRT.thorn;
    B.stick(col, BRT_THORN, [x, y, z, ex, ey, ez, 0.04, 0.01]);
    for (let k = 0; k < 4; k++) {
      const tt = 0.25 + 0.18 * k, px = x + (ex - x) * tt, py = y + (ey - y) * tt, pz = z + (ez - z) * tt;
      const tl = 0.2 + U(8 + k) * 0.35, ta = U(12 + k) * Math.PI * 2, tu = U(16 + k) * 0.9 - 0.2;
      B.stick(col, BRT_THORN, [px, py, pz, Math.max(x0 - 0.15, Math.min(x1 + 0.15, px + Math.cos(ta) * tl)), Math.max(0.02, Math.min(h + 0.1, py + tl * tu)), Math.max(-t / 2 - 0.1, Math.min(t / 2 + 0.1, pz + Math.sin(ta) * tl)), 0.012, 0.003]);
    }
  }
}
/* a hooped hide tunnel from p to q (local [x, z]), w wide and h high, nH hoops: the double dome's vestibule, the
   crawlers' shed; o.open: the ends left open; o.col, o.cols (hides) */
function brtVault(F, B, p, q, w, h, nH, o) {
  o = o || {};
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uz = (q[1] - p[1]) / L, nx = -uz, nz = ux;
  const P = function (s, th, off) { const r = 1 + ((off == null ? 0 : off)) / Math.max(w / 2, h), x = p[0] + ux * s + nx * Math.cos(th) * w / 2 * r, z = p[1] + uz * s + nz * Math.cos(th) * w / 2 * r; return [x, Math.sin(th) * h * r, z]; };
  const cols = o.cols || BRT.hide, nSeg = Math.max(1, nH - 1), dr = o.door, thD = dr ? Math.asin(Math.min(0.95, dr.h / h)) : 0;
  for (let i = 0; i < nSeg; i++) {
    const s0 = L * i / nSeg, s1 = L * (i + 1) / nSeg, col = o.col == null ? brtPick(F, cols, 61, i) : o.col;
    const part = function (a, b, th0) { if (b - a < 1e-3) return; brtSurf(F, 2, 10, function (u, v) { return P(a + (b - a) * u, th0 + (Math.PI - th0) * v, (i % 2) * 0.014); }, col, BRT_HIDE); };
    if (!dr || s1 <= dr.s0 || s0 >= dr.s1) { part(s0, s1, 0); continue; }
    part(s0, Math.max(s0, dr.s0), 0); part(Math.min(s1, dr.s1), s1, 0); part(Math.max(s0, dr.s0), Math.min(s1, dr.s1), thD);
  }
  if (dr) {   /* the door's lashed jambs and lintel on the front */
    for (const s of [dr.s0, dr.s1]) { const a = P(s, 0, 0.06), b = P(s, thD, 0.06); B.stick(BRT.pole, BRT_LASH, [a[0], 0, a[2], b[0], b[1] + 0.08, b[2], 0.055, 0.05]); }
    const a = P(dr.s0 - 0.2, thD, 0.08), b = P(dr.s1 + 0.2, thD, 0.08); B.stick(BRT.poleDark, BRT_LASH, [a[0], a[1] + 0.05, a[2], b[0], b[1] + 0.05, b[2], 0.05]);
  }
  for (let i = 0; i < nH; i++) { const s = L * i / Math.max(1, nH - 1), pts = []; for (let k = 0; k <= 10; k++) pts.push(P(s, Math.PI * k / 10, 0.05)); B.line(BRT.poleDark, BRT_LASH, pts, 0.05); }
  B.stick(BRT.poleDark, BRT_LASH, [p[0], h + 0.05, p[1], q[0], h + 0.05, q[1], 0.05]);
}
/* a lean-to of hides on poles: front posts at z0 (height hf), back posts at z1 (height hb), from x0 to x1; the roof of
   hides overhangs both a little and sags between the rafters; col: one colour, else the hides in turn */
function brtLeanTo(F, B, x0, x1, z0, z1, hf, hb, col) {
  const nP = Math.max(2, Math.round((x1 - x0) / 2.8) + 1), za = z0 - 0.35 * Math.sign(z1 - z0), zb = z1 + 0.25 * Math.sign(z1 - z0);
  const yz = function (z) { return hf + (hb - hf) * (z - z0) / (z1 - z0); };
  for (let i = 0; i < nP; i++) { const x = x0 + (x1 - x0) * i / (nP - 1);
    B.stick(BRT.poleDark, BRT_LASH, [x, -0.1, z0, x, hf + 0.06, z0, 0.08, 0.07]); B.stick(BRT.poleDark, BRT_LASH, [x, -0.1, z1, x, hb + 0.06, z1, 0.08, 0.07]);
    B.stick(BRT.pole, BRT_LASH, [x, yz(za) + 0.06, za, x, yz(zb) + 0.06, zb, 0.05]); }
  const nH = Math.max(2, Math.round((x1 - x0) / 1.6));
  for (let i = 0; i < nH; i++) {
    const xa = x0 - 0.2 + (x1 - x0 + 0.4) * i / nH, xb = x0 - 0.2 + (x1 - x0 + 0.4) * (i + 1) / nH, c = col == null ? brtPick(F, BRT.hide.concat(BRT.hideOld), 62, i) : col;
    brtSurf(F, 3, 4, function (u, v) { const z = za + (zb - za) * v; return [xa + (xb - xa) * u, yz(z) + 0.14 + (i % 2) * 0.012 - Math.sin(Math.PI * u) * 0.06, z]; }, c, BRT_HIDE);
  }
}
