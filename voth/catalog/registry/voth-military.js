/* ======================================================================
   voth-military — garrisons, barracks, mustering grounds, field camps
   source: 'voth-military'   family: 'military'   key prefix: voth_

   Vocabulary borrowed from the city's own defences (src/65-facade.js):
   ordinatorFortress() — basalt masses banded light/dark, a light coping band
   over dark merlons, green-and-gold hangings, iron signal masts, green
   sorcerous flame on the corner towers; crenellate() — slim Velothi merlons,
   deeper across the coping than they are wide along the run;
   wallSegmentBasalt() — dark columnar-jointing seams down a basalt face;
   watchtower() — a sentry perch with a hatch-gap in its parapet and a ladder.

   Everything shared lives in kit(F) inside this one IIFE; no top-level
   declarations other than the IIFE itself.
   ====================================================================== */
(function () {
  /* ---- palette (copied from src/05-palette.js; registries cannot see PAL) */
  const STONE = [0x8c8579, 0x7f7a6d, 0x958e80, 0x87816f, 0x97907f, 0x827c6e, 0x8f8873, 0x8a8272];
  const POOR = [0x8b8069, 0x7e7460, 0x968b73, 0x877d66];
  const BASALT = [0x2b2a28, 0x322f2b, 0x242220];
  const GREY = [0x8c8f8a, 0x7e827c, 0x969992];
  const ROOF = [0xb35a3a, 0xa04f32, 0xc36a42, 0x6b7a4a, 0x7a5a72, 0xc4813f];
  const SAIL = [0xcfc2a3, 0xc0b190, 0xb8a880, 0xa89878];
  const MUD = [0x6b5c46, 0x5f523e, 0x76664d, 0x564b3a, 0x6f6149];
  const BANNER = [0x7a2028, 0x8a2f2a, 0x5c4028, 0x4a3220];
  const GREEN = 0x2f6b3a, GOLD = 0xc9a227, GREEN_D = 0x1d4726;
  const DOOR = 0x1c1a16, TIMBER = 0x4a3a28, TIMBER2 = 0x5a4028, TIMBER3 = 0x6b5a44;
  const IRON = 0x3a3630, IRON2 = 0x2a2622, ROPE = 0x8a7a5a;
  const FLAME = 0x6dff8a, FLAME_HOT = 0xd8ffc0, FIRE = 0xffa040, WARM = 0xffcf87;
  const STRAW = 0xb8a266, GUAR = [0x7d6a4e, 0x6f5d44, 0x8a7656];

  function kit(F) {
    const K = {};
    K.nrm = (s) => s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0];
    /* a box standing proud of the face plane of side s at (x,z): its back sits
       on the plane, it protrudes t along the outward normal; w runs along the face */
    K.fbox = (x, y, z, s, w, h, t, col, fam) => {
      const n = K.nrm(s), flat = n[1] !== 0;
      F.box(x + n[0] * t / 2, y, z + n[1] * t / 2, flat ? w : t, h, flat ? t : w, 0, col, fam);
    };
    /* point along a face: u across the face from (x,z) */
    K.along = (x, z, s, u) => { const n = K.nrm(s); return n[1] !== 0 ? [x + u, z] : [x, z + u]; };
    /* a pointed-arch head: a flat triangle (thin pyramid) standing on y */
    K.archHead = (x, y, z, s, w, h, t, col, fam) => {
      const n = K.nrm(s), flat = n[1] !== 0;
      F.pyrRoof(x + n[0] * t / 2, y, z + n[1] * t / 2, flat ? w : t, h, flat ? t : w, 0, col, fam || 'stone');
    };
    /* window: dark opening, jamb reveals, sill and lintel; y = bottom of opening */
    K.win = (x, y, z, s, w, h, wallC, opt) => {
      opt = opt || {};
      const tr = shade(wallC, -0.22), n = K.nrm(s), flat = n[1] !== 0;
      K.fbox(x, y, z, s, w, h, 0.07, opt.glass ? 0x2c3238 : DOOR, opt.glass ? 'glass' : 'wood');
      K.fbox(x, y - 0.2, z, s, w + 0.5, 0.2, 0.3, tr, 'stone');
      if (opt.pointed) K.archHead(x, y + h, z, s, w + 0.5, w * 0.55, 0.16, tr);
      else K.fbox(x, y + h, z, s, w + 0.45, 0.26, 0.18, tr, 'stone');
      [-1, 1].forEach((k) => K.fbox(x + (flat ? k * (w / 2 + 0.1) : 0), y, z + (flat ? 0 : k * (w / 2 + 0.1)), s, 0.2, h, 0.14, tr, 'stone'));
      if (opt.bars) {
        const nb = Math.max(2, Math.round(w / 0.3));
        for (let i = 1; i < nb; i++) {
          const u = -w / 2 + w * i / nb, p = K.along(x + n[0] * 0.1, z + n[1] * 0.1, s, u);
          F.rod(p[0], y, p[1], p[0], y + h, p[1], 0.03, IRON, 'metal');
        }
      }
      if (opt.shut) {
        [-1, 1].forEach((k) => {
          const u = k * (w / 2 + 0.45), p = K.along(x, z, s, u);
          K.fbox(p[0], y, p[1], s, w * 0.5, h, 0.08, opt.shut, 'wood');
        });
      }
    };
    /* arrow slit with a splayed surround */
    K.slit = (x, y, z, s, h, wallC) => {
      K.fbox(x, y - 0.15, z, s, 0.7, h + 0.3, 0.06, shade(wallC, -0.18), 'stone');
      K.fbox(x, y, z, s, 0.2, h, 0.1, DOOR, 'wood');
      K.fbox(x, y + h * 0.45, z, s, 0.55, 0.14, 0.1, DOOR, 'wood');
    };
    /* door with surround, ironbound leaf, lintel and threshold step; y = floor */
    K.door = (x, y, z, s, w, h, wallC, opt) => {
      opt = opt || {};
      const tr = shade(wallC, -0.2);
      K.fbox(x, y, z, s, w + 0.8, h + 0.35, 0.22, tr, 'stone');
      K.fbox(x, y, z, s, w, h, 0.3, opt.col || DOOR, 'wood');
      [0.3, 0.72].forEach((f) => K.fbox(x, y + h * f, z, s, w + 0.02, 0.12, 0.34, IRON, 'metal'));
      if (opt.pointed) K.archHead(x, y + h + 0.35, z, s, w + 0.8, w * 0.6, 0.22, tr);
      else K.fbox(x, y + h + 0.35, z, s, w + 1.3, 0.35, 0.45, shade(wallC, -0.3), 'stone');
      if (opt.step !== false) K.fbox(x, Math.max(0, y - 0.22), z, s, w + 1.0, 0.22, 0.9, shade(wallC, -0.26), 'stone');
    };
    /* dark rectangular opening with a pointed head (gate passages, arcades) */
    K.opening = (x, y, z, s, w, h, t, col) => {
      K.fbox(x, y, z, s, w, h, t, col || DOOR, 'wood');
      K.archHead(x, y + h, z, s, w, w * 0.5, t, col || DOOR, 'wood');
    };
    /* crenellation: merlons along a segment (any direction) */
    K.cren = (ax, az, bx, bz, y, col, mw, mh, md, gapK) => {
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      const per = mw * (1 + (gapK == null ? 0.75 : gapK));
      const n = Math.max(1, Math.floor(L / per)), ry = Math.atan2(-dz, dx);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        F.box(ax + dx * t, y, az + dz * t, mw, mh, md, ry, col, 'stone');
      }
    };
    /* breastwork + merlons along a segment: the Velothi parapet */
    K.parapet = (ax, az, bx, bz, y, thick, col, merlC, mh) => {
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), ry = Math.atan2(-dz, dx);
      F.box((ax + bx) / 2, y, (az + bz) / 2, L, 0.95, thick, ry, col, 'stone');
      K.cren(ax, az, bx, bz, y + 0.95, merlC, 0.85, mh || 1.05, thick, 0.8);
    };
    K.parapetRect = (cx, cz, hx, hz, y, thick, col, merlC, mh) => {
      const ix = hx - thick / 2, iz = hz - thick / 2;
      K.parapet(cx - hx, cz + iz, cx + hx, cz + iz, y, thick, col, merlC, mh);
      K.parapet(cx - hx, cz - iz, cx + hx, cz - iz, y, thick, col, merlC, mh);
      K.parapet(cx + ix, cz - iz + thick / 2, cx + ix, cz + iz - thick / 2, y, thick, col, merlC, mh);
      K.parapet(cx - ix, cz - iz + thick / 2, cx - ix, cz + iz - thick / 2, y, thick, col, merlC, mh);
    };
    /* merlons round a drum */
    K.crenRing = (cx, cz, r, y, n, col, mw, mh, md) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        F.box(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, mw, mh, md, -a - Math.PI / 2, col, 'stone');
      }
    };
    /* Velothi pylon: a tapered square pier under a slab and a small cap roof */
    K.pylon = (x, z, y0, r, h, col, capC) => {
      F.frustum(x, y0, z, r, r * 0.74, h, 0, col, 'stone', 4);
      F.box(x, y0 + h, z, r * 1.9, 0.32, r * 1.9, 0, shade(col, -0.2), 'stone');
      F.pyrRoof(x, y0 + h + 0.32, z, r * 1.9, r * 0.95, r * 1.9, 0, capC || shade(col, -0.3), 'roof');
      return y0 + h + 0.32 + r * 0.95;
    };
    /* green sorcerous flame in an iron basin, y = basin foot */
    K.flame = (x, y, z, s) => {
      s = s || 1;
      F.cyl(x, y, z, 0.16 * s, 0.35 * s, 0, IRON2, 'metal');
      F.frustum(x, y + 0.35 * s, z, 0.25 * s, 0.55 * s, 0.35 * s, 0, IRON, 'metal', 8);
      F.cone(x, y + 0.6 * s, z, 0.42 * s, 1.0 * s, 0, FLAME, 'glow');
      F.cone(x, y + 0.62 * s, z, 0.22 * s, 0.7 * s, 0, FLAME_HOT, 'glow');
      return y + 1.6 * s;
    };
    /* iron signal mast with collars, a crossbar and the green flame on top */
    K.mast = (x, y, z, h, s) => {
      s = s || 1;
      F.box(x, y, z, 0.9 * s, 0.35, 0.9 * s, 0, IRON2, 'metal');
      F.rod(x, y, z, x, y + h, z, 0.09 * s, IRON, 'metal');
      [0.35, 0.7].forEach((f) => F.cyl(x, y + h * f, z, 0.16 * s, 0.14, 0, IRON2, 'metal'));
      F.rod(x - 0.7 * s, y + h * 0.82, z, x + 0.7 * s, y + h * 0.82, z, 0.05 * s, IRON, 'metal');
      return K.flame(x, y + h, z, 0.7 * s);
    };
    /* hanging banner on a face: y = top edge */
    K.banner = (x, y, z, s, w, h, col, trimC) => {
      K.fbox(x, y - h, z, s, w, h, 0.07, col, 'cloth');
      K.fbox(x, y - h, z, s, w, 0.3, 0.1, trimC || GOLD, 'cloth');
      K.fbox(x, y - h * 0.55, z, s, w * 0.4, w * 0.4, 0.1, trimC || GOLD, 'cloth');
      K.fbox(x, y, z, s, w + 0.5, 0.14, 0.24, IRON, 'metal');
    };
    /* flagpole with a flag streaming along +x (or -x) */
    K.flagpole = (x, z, y0, h, col, dir, trimC) => {
      dir = dir || 1;
      F.cyl(x, y0, z, 0.35, 0.4, 0, shade(0x8c8579, -0.2), 'stone');
      F.rod(x, y0, z, x, y0 + h, z, 0.08, TIMBER, 'wood');
      F.ball(x, y0 + h + 0.12, z, 0.14, GOLD, 'metal');
      const fw = Math.min(2.2, h * 0.3), fh = fw * 0.62;
      F.box(x + dir * fw * 0.26, y0 + h - fh - 0.15, z, fw * 0.5, fh, 0.05, 0, col, 'cloth');
      F.box(x + dir * fw * 0.74, y0 + h - fh - 0.05, z, fw * 0.5, fh * 0.9, 0.05, dir * 0.12, col, 'cloth');
      F.box(x + dir * fw * 0.5, y0 + h - fh - 0.15, z, fw, 0.18, 0.06, 0, trimC || GOLD, 'cloth');
    };
    /* a flight of solid steps rising along dir from (x,z) at y0 */
    K.stair = (x, z, y0, dir, n, rise, run, width, col) => {
      const d = K.nrm(dir), flat = d[1] !== 0;
      for (let i = 0; i < n; i++) {
        const o = (i + 0.5) * run;
        F.box(x + d[0] * o, y0, z + d[1] * o, flat ? width : run, (i + 1) * rise, flat ? run : width, 0, i % 2 ? col : shade(col, -0.05), 'stone');
      }
    };
    /* sloped plate between two edge midpoints; width runs across the slope.
       Only for axis-aligned slopes in the local frame. */
    K.slope = (x0, y0, z0, x1, y1, z1, width, thick, col, fam) => {
      if (Math.abs(z1 - z0) >= Math.abs(x1 - x0)) F.beam(x0, y0, z0, x1, y1, z1, width, thick, col, fam);
      else F.beam(x0, y0, z0, x1, y1, z1, thick, width, col, fam);
    };
    /* props ------------------------------------------------------------ */
    K.crate = (x, y, z, s, ry, col) => {
      col = col || F.pick([0x7a6246, 0x6b5a44, 0x85705a]);
      F.box(x, y, z, s, s, s, ry || 0, col, 'wood');
      F.box(x, y + s * 0.45, z, s + 0.04, s * 0.1, s + 0.04, ry || 0, shade(col, -0.25), 'wood');
    };
    K.barrel = (x, y, z, r, h) => {
      r = r || 0.4; h = h || 1.0;
      F.cyl(x, y, z, r, h, 0, 0x6b4a2a, 'wood');
      F.cyl(x, y + h * 0.15, z, r + 0.03, 0.08, 0, IRON, 'metal');
      F.cyl(x, y + h * 0.78, z, r + 0.03, 0.08, 0, IRON, 'metal');
    };
    K.stack = (x, z, n, s) => {
      for (let i = 0; i < n; i++) {
        const lx = x + (i % 2) * s * 1.05, lz = z + Math.floor(i / 4) * s * 1.05, ly = (Math.floor(i / 2) % 2) * s;
        K.crate(lx, ly, lz, s * F.rr(0.9, 1.0), F.rr(-0.1, 0.1));
      }
    };
    /* spear/weapon rack: two posts, two rails, spears leaning, shields on top */
    K.rack = (x, z, len, alongX, n) => {
      const ax = alongX ? 1 : 0, az = alongX ? 0 : 1;
      [-1, 1].forEach((k) => F.box(x + ax * k * len / 2, 0, z + az * k * len / 2, 0.14, 1.7, 0.14, 0, TIMBER, 'wood'));
      [0.35, 1.45].forEach((yy) => F.box(x, yy, z, alongX ? len + 0.2 : 0.1, 0.1, alongX ? 0.1 : len + 0.2, 0, TIMBER2, 'wood'));
      n = n || Math.round(len / 0.35);
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + 0.2 + (len - 0.4) * (i / Math.max(1, n - 1));
        const bx = x + ax * u + az * 0.18, bz = z + az * u + ax * 0.18;
        const tx = x + ax * u - az * 0.06, tz = z + az * u - ax * 0.06;
        F.rod(bx, 0, bz, tx, 2.3, tz, 0.03, TIMBER3, 'wood');
        F.cone(tx, 2.3, tz, 0.05, 0.28, 0, 0x8a8a86, 'metal');
      }
    };
    /* training dummy: post, arm bar, straw body, sack head */
    K.dummy = (x, z, ry) => {
      F.box(x, 0, z, 0.5, 0.18, 0.5, ry || 0, TIMBER, 'wood');
      F.rod(x, 0, z, x, 1.9, z, 0.07, TIMBER, 'wood');
      const c = Math.cos(ry || 0), s = Math.sin(ry || 0);
      F.rod(x - c * 0.7, 1.35, z + s * 0.7, x + c * 0.7, 1.35, z - s * 0.7, 0.05, TIMBER2, 'wood');
      F.blob(x, 1.15, z, 0.28, 0.9, 0, STRAW, 'cloth');
      F.blob(x, 1.8, z, 0.18, 0.36, 0, 0xa89878, 'cloth');
      F.box(x, 1.05, z, 0.62, 0.1, 0.62, ry || 0, 0x6b4a2a, 'wood');
    };
    /* archery butt: a straw boss on an A-frame, facing +z (or -z with f=-1) */
    K.butt = (x, z, f) => {
      f = f || 1;
      [-1, 1].forEach((k) => {
        F.rod(x + k * 0.7, 0, z - f * 0.5, x + k * 0.45, 1.9, z, 0.05, TIMBER, 'wood');
        F.rod(x + k * 0.7, 0, z + f * 0.25, x + k * 0.45, 1.9, z, 0.05, TIMBER, 'wood');
      });
      F.rod(x, 1.2, z - f * 0.05, x, 1.2, z + f * 0.3, 0.72, STRAW, 'cloth');
      F.rod(x, 1.2, z + f * 0.3, x, 1.2, z + f * 0.33, 0.5, 0xe8d9a0, 'cloth');
      F.rod(x, 1.2, z + f * 0.33, x, 1.2, z + f * 0.36, 0.3, 0x7a2028, 'cloth');
      F.rod(x, 1.2, z + f * 0.36, x, 1.2, z + f * 0.39, 0.12, 0xe8d9a0, 'cloth');
      for (let i = 0; i < 3; i++) F.rod(x + F.rr(-0.3, 0.3), 1.2 + F.rr(-0.3, 0.3), z + f * 0.3, x + F.rr(-0.3, 0.3), 1.2 + F.rr(-0.3, 0.3), z + f * 0.8, 0.012, TIMBER3, 'wood');
    };
    /* horizontal wheel (disc on a lateral axis) */
    K.wheel = (x, y, z, r, alongX) => {
      if (alongX) F.rod(x - 0.08, y, z, x + 0.08, y, z, r, TIMBER2, 'wood');
      else F.rod(x, y, z - 0.08, x, y, z + 0.08, r, TIMBER2, 'wood');
      if (alongX) F.rod(x - 0.14, y, z, x + 0.14, y, z, r * 0.22, IRON, 'metal');
      else F.rod(x, y, z - 0.14, x, y, z + 0.14, r * 0.22, IRON, 'metal');
    };
    return K;
  }

  /* ====================================================================
     voth_garrison
     ==================================================================== */
  ASSET({
    key: 'voth_garrison', name: 'Garrison Castle', culture: 'voth', family: 'military',
    source: 'voth-military',
    districts: ['fortress', 'wall', 'harbor', 'canton'], wealth: [0.4, 1],
    blurb: 'A basalt Velothi fortress with drum and square towers, portcullised gatehouse and keep; or a squat harbour fort with diamond bastions, a sea gate and a signal tower.',
    w: 62, d: 60, h: 29, variants: 2,
    variantDims: [
      { w: 62, d: 60, h: 29 },
      { w: 41, d: 52, h: 29 }
    ],
    build: function (F) {
      const K = kit(F);
      if (F.variant === 0) {
        /* ---------------- Velothi fortress, basalt ---------------- */
        const wallC = shade(F.pick(BASALT), 0.16), band = shade(wallC, 0.14), dark = shade(wallC, -0.2);
        const trimL = shade(GREY[2], 0.2), trimD = shade(GREY[0], -0.34);
        const capC = shade(F.pick([0x3f4a52, 0x4a3f3a, 0x3a4438]), 0.05);
        const X = 26, Z = 22, T = 3.2, H = 9;
        /* battered curtain: stepped talus, the wall, coping band, walk parapet */
        function curtain(ax, az, bx, bz, out) {
          const alongX = az === bz, L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az);
          const cx = (ax + bx) / 2, cz = (az + bz) / 2, on = K.nrm(out);
          const bw = (t) => alongX ? [L, t] : [t, L];
          let s = bw(T + 2.2); F.box(cx + on[0] * 0.3, 0, cz + on[1] * 0.3, s[0], 1.3, s[1], 0, dark, 'stone');
          s = bw(T + 1.1); F.box(cx + on[0] * 0.2, 1.3, cz + on[1] * 0.2, s[0], 1.4, s[1], 0, shade(wallC, -0.08), 'stone');
          s = bw(T); F.box(cx, 0, cz, s[0], H, s[1], 0, wallC, 'stone');
          s = bw(T + 0.5); F.box(cx, H * 0.55, cz, s[0], 0.3, s[1], 0, band, 'stone');
          s = bw(T + 0.6); F.box(cx, H - 0.4, cz, s[0], 0.4, s[1], 0, trimL, 'stone');
          /* outer breastwork with merlons, low inner kerb */
          const oa = [ax + on[0] * (T / 2 - 0.3), az + on[1] * (T / 2 - 0.3)], ob = [bx + on[0] * (T / 2 - 0.3), bz + on[1] * (T / 2 - 0.3)];
          K.parapet(oa[0], oa[1], ob[0], ob[1], H, 0.6, shade(wallC, 0.04), trimD, 1.1);
          F.box(cx - on[0] * (T / 2 - 0.2), H, cz - on[1] * (T / 2 - 0.2), alongX ? L : 0.4, 0.6, alongX ? 0.4 : L, 0, shade(wallC, 0.04), 'stone');
          /* outer face: columnar-jointing seams, slits, pylon buttresses */
          const fx = cx + on[0] * T / 2, fz = cz + on[1] * T / 2;
          const nj = Math.floor(L / 2.4);
          for (let i = 0; i < nj; i++) {
            const u = -L / 2 + (i + 0.5) * (L / nj), p = K.along(fx, fz, out, u);
            K.fbox(p[0], 2.7, p[1], out, 0.12, H - 3.2, 0.05, shade(wallC, -0.26), 'stone');
          }
          const nb = Math.max(1, Math.round(L / 9));
          for (let i = 0; i < nb; i++) {
            const u = -L / 2 + (i + 0.5) * (L / nb), p = K.along(fx, fz, out, u);
            K.pylon(p[0] + on[0] * 0.8, p[1] + on[1] * 0.8, 0, 1.15, H - 0.6, shade(wallC, 0.02), capC);
            const q = K.along(fx, fz, out, u + L / nb / 2 * (i < nb - 1 || nb === 1 ? 1 : -1) * 0.5);
            K.slit(q[0], 4.2, q[1], out, 1.8, wallC);
          }
          /* inner face: seams at the talus line and putlog holes */
          const ix = cx - on[0] * T / 2, iz = cz - on[1] * T / 2;
          K.fbox(ix, 0, iz, out ^ 1, L, 0.8, 0.35, dark, 'stone');
          for (let i = 0; i < Math.floor(L / 4); i++) {
            const p = K.along(ix, iz, out ^ 1, -L / 2 + (i + 0.5) * 4);
            K.fbox(p[0], 6.2, p[1], out ^ 1, 0.35, 0.35, 0.05, DOOR, 'wood');
          }
        }
        /* side mapping: out = outward normal side of that wall run */
        curtain(-X, -Z, X, -Z, 1);           /* back */
        curtain(-X, Z, -6.5, Z, 0);          /* front left of gate */
        curtain(6.5, Z, X, Z, 0);            /* front right of gate */
        curtain(-X, -Z, -X, Z, 3);           /* left */
        curtain(X, -Z, X, Z, 2);             /* right */

        /* bailey floor: flagged court, a darker cross of paths */
        F.box(0, 0, 0, 2 * X - T, 0.12, 2 * Z - T, 0, shade(STONE[3], -0.12), 'stone');
        F.box(0, 0.12, 5, 3.2, 0.04, 2 * Z - T - 10, 0, shade(STONE[0], -0.02), 'stone');
        F.box(0, 0.12, 5, 2 * X - T - 2, 0.04, 2.6, 0, shade(STONE[0], -0.02), 'stone');

        /* ---- front drum towers (z = +Z) */
        [-1, 1].forEach((k) => {
          const tx = k * X, tz = Z, R0 = 5.2, R1 = 4.4, TH = 14;
          F.frustum(tx, 0, tz, R0 + 0.7, R0 + 0.2, 1.6, 0, dark, 'stone', 18);
          F.frustum(tx, 1.6, tz, R0 + 0.2, R1, TH - 1.6, 0, wallC, 'stone', 18);
          F.cyl(tx, H * 0.55, tz, R0 - 0.35, 0.3, 0, band, 'stone');
          F.cyl(tx, TH - 0.5, tz, R1 + 0.35, 0.5, 0, trimL, 'stone');
          K.crenRing(tx, tz, R1 + 0.1, TH, 16, trimD, 0.9, 1.3, 0.55);
          /* inner lantern drum, conical cap, mast and flame */
          F.cyl(tx, TH, tz, 2.6, 2.6, 0, shade(wallC, 0.06), 'stone');
          F.cyl(tx, TH + 2.6, tz, 3.0, 0.35, 0, trimL, 'stone');
          F.cone(tx, TH + 2.95, tz, 3.4, 4.2, 0, capC, 'roof');
          K.mast(tx, TH + 6.3, tz, 1.8, 0.8);
          for (let i = 0; i < 4; i++) {
            const a = k > 0 ? -0.2 + i * 0.75 : Math.PI + 0.2 - i * 0.75;
            const sx = tx + Math.cos(a) * (R0 - 0.1), sz = tz + Math.sin(a) * (R0 - 0.1);
            F.box(sx, 5.5, sz, 0.26, 1.9, 0.5, -a, DOOR, 'wood');
            F.box(sx, 10, sz, 0.26, 1.5, 0.5, -a, DOOR, 'wood');
          }
          /* lantern door onto the tower top and small slits */
          F.box(tx - k * 0.2, TH, tz - 2.55, 1.0, 1.9, 0.2, 0, DOOR, 'wood');
          /* hanging banner on the outer face of each drum */
          F.box(tx, 6.5, tz + R0 - 0.3, 1.6, 5.2, 0.12, 0, k < 0 ? GREEN : GOLD, 'cloth');
          F.box(tx, 11.7, tz + R0 - 0.3, 2.1, 0.16, 0.3, 0, IRON, 'metal');
        });

        /* ---- back square towers (z = -Z): battered, open pavilion cap */
        [-1, 1].forEach((k) => {
          const tx = k * X, tz = -Z, R0 = 4.8, R1 = 4.1, TH = 15;
          F.frustum(tx, 0, tz, R0 + 0.6, R0 + 0.3, 1.5, 0, dark, 'stone', 4);
          F.frustum(tx, 1.5, tz, R0 + 0.2, R1, TH - 1.5, 0, wallC, 'stone', 4);
          F.box(tx, H * 0.55, tz, 2 * R0 + 0.1, 0.3, 2 * R0 + 0.1, 0, band, 'stone');
          F.box(tx, TH - 0.45, tz, 2 * R1 + 0.7, 0.45, 2 * R1 + 0.7, 0, trimL, 'stone');
          K.parapetRect(tx, tz, R1 + 0.3, R1 + 0.3, TH, 0.55, shade(wallC, 0.04), trimD, 1.0);
          /* pavilion: four posts, slab, pyramid cap, flame beneath */
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((c) => F.box(tx + c[0] * 2.2, TH, tz + c[1] * 2.2, 0.55, 2.6, 0.55, 0, shade(wallC, 0.08), 'stone'));
          F.box(tx, TH + 2.6, tz, 5.8, 0.35, 5.8, 0, trimL, 'stone');
          F.pyrRoof(tx, TH + 2.95, tz, 6.4, 3.0, 6.4, 0, capC, 'roof');
          K.flame(tx, TH, tz, 1.0);
          F.rod(tx, TH + 5.9, tz, tx, TH + 7.6, tz, 0.07, IRON, 'metal');
          F.ball(tx, TH + 7.6, tz, 0.16, GOLD, 'metal');
          /* slits on the three outer faces, two tiers */
          [1, k > 0 ? 2 : 3].forEach((s) => {
            const n = K.nrm(s);
            [-2, 2].forEach((u) => {
              const p = K.along(tx + n[0] * (R0 - 0.05), tz + n[1] * (R0 - 0.05), s, u);
              K.slit(p[0], 5, p[1], s, 1.8, wallC);
            });
            const p2 = K.along(tx + n[0] * (R1 + 0.25), tz + n[1] * (R1 + 0.25), s, 0);
            K.slit(p2[0], 10.4, p2[1], s, 1.6, wallC);
          });
          /* door from the wall-walk on the bailey side */
          K.door(tx - k * (R1 + 0.2), H, tz + 1.2, k > 0 ? 3 : 2, 1.2, 2.2, wallC, { step: false });
        });

        /* ---- gatehouse: two square towers, a passage block, portcullis */
        const GZ = Z + 1.5;
        [-1, 1].forEach((k) => {
          const tx = k * 5.0;
          F.frustum(tx, 0, GZ, 3.8, 3.3, 13, 0, wallC, 'stone', 4);
          F.frustum(tx, 0, GZ, 4.3, 4.0, 1.4, 0, dark, 'stone', 4);
          F.box(tx, 12.6, GZ, 7.4, 0.4, 7.4, 0, trimL, 'stone');
          K.parapetRect(tx, GZ, 3.6, 3.6, 13, 0.5, shade(wallC, 0.04), trimD, 1.0);
          K.flame(tx, 13, GZ, 1.1);
          K.slit(tx, 6, GZ + 3.6, 0, 1.8, wallC);
          K.slit(tx + k * 3.6, 6, GZ, k > 0 ? 2 : 3, 1.8, wallC);
          K.banner(tx, 11.8, GZ + 3.4, 0, 1.6, 4.8, k < 0 ? GREEN : GOLD, k < 0 ? GOLD : GREEN);
        });
        F.box(0, 0, GZ - 0.5, 3.4, 11, 7, 0, shade(wallC, 0.03), 'stone');
        F.box(0, 10.6, GZ - 0.5, 4.2, 0.4, 7.4, 0, trimL, 'stone');
        K.cren(-1.7, GZ + 2.8, 1.7, GZ + 2.8, 11, trimD, 0.8, 1.1, 0.6);
        /* machicolation gallery over the gate */
        const MZ = GZ + 3.0;
        F.box(0, 8.3, MZ + 0.5, 6.2, 1.3, 1.0, 0, shade(wallC, 0.06), 'stone');
        for (let i = 0; i < 5; i++) F.box(-2.4 + i * 1.2, 7.5, MZ + 0.35, 0.4, 0.8, 0.7, 0, trimD, 'stone');
        /* passage: pointed opening, portcullis half-raised, leaves open inside */
        K.opening(0, 0.12, 0, 0, 3.0, 4.2, 0.1, DOOR);
        F.box(0, 0.12, GZ - 0.5, 2.9, 4.2, 7.2, 0, 0x14120f, 'wood');
        for (let i = 0; i < 7; i++) {
          const px = -1.35 + i * 0.45;
          F.box(px, 1.6, GZ + 3.12, 0.1, 3.8, 0.1, 0, IRON, 'metal');
          F.cone(px, 1.25, GZ + 3.12, 0.07, 0.35, 0, IRON, 'metal');
        }
        for (let j = 0; j < 6; j++) F.box(0, 1.9 + j * 0.62, GZ + 3.12, 3.0, 0.09, 0.12, 0, IRON, 'metal');
        F.box(0, 0.12, GZ + 3.0, 3.8, 0.3, 0.3, 0, trimD, 'stone');
        K.archHead(0, 4.32, GZ + 3.0, 0, 4.2, 2.1, 0.25, trimL);
        /* rear arch into the bailey */
        K.opening(0, 0.12, GZ - 4.0, 1, 2.9, 4.2, 0.1, DOOR);
        K.archHead(0, 4.32, GZ - 4.0, 1, 4.1, 2.0, 0.25, trimL);
        [-1, 1].forEach((k) => F.box(k * 1.9, 0.12, GZ - 4.6, 0.12, 3.8, 1.2, k * 0.4, DOOR, 'wood'));
        /* apron: flagged approach, two pylon lamp-posts with green flame */
        F.box(0, 0, GZ + 5.5, 9, 0.18, 4, 0, shade(STONE[0], -0.1), 'stone');
        [-1, 1].forEach((k) => {
          const top = K.pylon(k * 4.1, GZ + 6.6, 0.18, 0.55, 2.6, shade(wallC, 0.05), capC);
          F.box(k * 4.1, 0.18, GZ + 6.6, 1.4, 0.35, 1.4, 0, dark, 'stone');
          K.flame(k * 4.1, top - 0.05, GZ + 6.6, 0.55);
        });

        /* ---- wall-walk stairs either side of the gate, inside */
        [-1, 1].forEach((k) => {
          K.stair(k * 7.2, Z - T / 2 - 1.1, 0, k > 0 ? 2 : 3, 12, H / 12, 0.95, 2.2, shade(wallC, 0.05));
        });
        /* and one up the back wall to the square towers */
        K.stair(-6, -Z + T / 2 + 1.1, 0, 3, 12, H / 12, 0.95, 2.2, shade(wallC, 0.05));

        /* ---- keep: battered stepped tower, terraces, dome, mast */
        const KZ = -8.5;
        const kc = shade(wallC, 0.04);
        F.frustum(0, 0, KZ, 8.6, 8.2, 1.2, 0, dark, 'stone', 4);
        F.frustum(0, 1.2, KZ, 8.0, 7.0, 8.0, 0, kc, 'stone', 4);
        F.box(0, 8.8, KZ, 14.6, 0.45, 14.6, 0, trimL, 'stone');
        K.parapetRect(0, KZ, 7.2, 7.2, 9.25, 0.5, shade(kc, 0.05), trimD, 1.0);
        F.frustum(0, 9.25, KZ, 5.6, 4.9, 7.0, 0, shade(kc, 0.12), 'stone', 4);
        F.box(0, 15.9, KZ, 10.4, 0.4, 10.4, 0, trimL, 'stone');
        K.parapetRect(0, KZ, 5.1, 5.1, 16.3, 0.45, shade(kc, 0.05), trimD, 0.9);
        F.frustum(0, 16.3, KZ, 3.7, 3.3, 4.6, 0, kc, 'stone', 4);
        F.cyl(0, 20.9, KZ, 3.4, 0.45, 0, trimL, 'stone');
        F.dome(0, 21.35, KZ, 3.2, 2.7, 0, shade(GREY[1], -0.25), 'dome');
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4;
          F.cone(Math.cos(a) * 1.6, 21.35, KZ + Math.sin(a) * 1.6, 0.14, 2.3, a, shade(GREY[1], -0.4), 'dome');
        }
        K.mast(0, 24, KZ, 2.6, 1.0);
        /* keep openings, all four sides */
        K.door(0, 1.2, KZ + 7.8, 0, 1.8, 3.0, kc, { pointed: true });
        K.stair(0, KZ + 10.9, 0, 1, 2, 0.6, 0.9, 3.4, shade(kc, -0.05));
        K.banner(0, 8.4, KZ + 7.2, 0, 2.2, 3.4, GREEN, GOLD);
        [0, 1, 2, 3].forEach((s) => {
          const n = K.nrm(s);
          [-4, 4].forEach((u) => {
            const p = K.along(n[0] * 7.75, KZ + n[1] * 7.75, s, u);
            K.win(p[0], 3.4, p[1], s, 0.9, 1.6, kc, { pointed: true, bars: true });
          });
          if (s !== 0) { const p = K.along(n[0] * 7.8, KZ + n[1] * 7.8, s, 0); K.slit(p[0], 3.2, p[1], s, 2.0, kc); }
          [-2, 2].forEach((u) => {
            const p = K.along(n[0] * 5.3, KZ + n[1] * 5.3, s, u);
            K.win(p[0], 11.3, p[1], s, 0.8, 1.5, kc, { pointed: true });
          });
          const p3 = K.along(n[0] * 3.45, KZ + n[1] * 3.45, s, 0);
          K.slit(p3[0], 17.6, p3[1], s, 1.6, kc);
        });
        /* terrace door on tier 2, outside stair up the keep's right flank */
        K.door(0, 9.25, KZ + 5.4, 0, 1.2, 2.3, kc, { step: false });
        K.stair(8.3, KZ + 6.5, 0, 1, 12, 9.25 / 12, 0.95, 2.0, shade(kc, 0.06));

        /* ---- well, near the gate path */
        const WX = -9, WZ = 9;
        F.cyl(WX, 0.12, WZ, 1.3, 0.95, 0, shade(STONE[2], -0.1), 'stone');
        F.cyl(WX, 1.07, WZ, 1.4, 0.14, 0, shade(STONE[2], -0.25), 'stone');
        F.cyl(WX, 1.0, WZ, 1.0, 0.1, 0, 0x1c2a2a, 'glass');
        [-1, 1].forEach((k) => F.box(WX + k * 1.25, 1.07, WZ, 0.22, 2.0, 0.22, 0, TIMBER, 'wood'));
        F.rod(WX - 1.35, 2.5, WZ, WX + 1.35, 2.5, WZ, 0.1, TIMBER2, 'wood');
        F.rod(WX, 2.5, WZ, WX, 1.5, WZ, 0.02, ROPE, 'wood');
        F.cyl(WX, 1.3, WZ, 0.2, 0.3, 0, 0x6b4a2a, 'wood');
        F.box(WX, 3.07, WZ, 3.2, 0.1, 2.4, 0, TIMBER, 'wood');
        F.pyrRoof(WX, 3.17, WZ, 3.4, 1.2, 2.6, 0, capC, 'roof');
        F.box(WX + 1.9, 0.12, WZ + 0.3, 0.7, 0.5, 1.6, 0, TIMBER, 'wood');

        /* ---- stables: lean-to against the left curtain, stalls, hay, trough */
        const SX0 = -X + T / 2, SX1 = SX0 + 6.4, SZ0 = -1, SZ1 = 17;
        const SL = SZ1 - SZ0, SC = (SZ0 + SZ1) / 2;
        for (let i = 0; i <= 6; i++) {
          const z = SZ0 + SL * i / 6;
          F.box(SX1 - 0.2, 0.12, z, 0.3, 3.2, 0.3, 0, TIMBER, 'wood');
          if (i > 0 && i < 6) F.box((SX0 + SX1) / 2 - 0.4, 0.12, z, SX1 - SX0 - 1.2, 1.5, 0.12, 0, TIMBER2, 'wood');
        }
        F.box(SX1 - 0.2, 3.1, SC, 0.35, 0.35, SL + 0.4, 0, TIMBER, 'wood');
        K.slope(SX0, 5.1, SC, SX1 + 0.5, 3.1, SC, SL + 0.9, 0.22, shade(ROOF[3], -0.15), 'roof');
        F.box(SX0 + 0.3, 0.12, SC, 0.5, 5.0, SL, 0, TIMBER2, 'wood');
        for (let i = 0; i < 6; i++) {
          const z = SZ0 + SL * (i + 0.5) / 6;
          F.box(SX0 + 1.0, 0.12, z, 0.8, 0.8, 1.8, 0, TIMBER2, 'wood');
          F.blob(SX0 + 1.0, 1.0, z, 0.5, 0.35, 0, STRAW, 'cloth');
          F.blob((SX0 + SX1) / 2, 0.2, z + 0.3, 1.0, 0.25, 0, shade(STRAW, -0.1), 'cloth');
        }
        [0, 1, 2].forEach((i) => F.box(SX1 + 1.4, 0.12 + (i === 2 ? 0.8 : 0), SZ1 - 1.2 - (i % 2) * 1.3, 1.6, 0.8, 1.0, 0, STRAW, 'cloth'));
        F.box(SX1 + 0.9, 0.12, SZ0 + 2, 0.8, 0.7, 3.0, 0, shade(STONE[1], -0.2), 'stone');
        F.box(SX1 + 0.9, 0.7, SZ0 + 2, 0.6, 0.1, 2.8, 0, 0x2a3a3a, 'glass');

        /* ---- armoury/smithy range against the right curtain */
        const AX0 = X - T / 2 - 6.5, AX1 = X - T / 2, AZ0 = 1, AZ1 = 14;
        const ac = shade(STONE[1], -0.1), acx = (AX0 + AX1) / 2, acz = (AZ0 + AZ1) / 2;
        F.box(acx, 0.12, acz, AX1 - AX0, 5.2, AZ1 - AZ0, 0, ac, 'stone');
        F.box(acx, 5.32, acz, AX1 - AX0 + 0.4, 0.35, AZ1 - AZ0 + 0.4, 0, shade(ac, -0.15), 'stone');
        K.parapet(AX0 + 0.2, AZ0, AX0 + 0.2, AZ1, 5.67, 0.4, ac, shade(ac, -0.2), 0.8);
        K.parapet(AX0, AZ1 - 0.2, AX1, AZ1 - 0.2, 5.67, 0.4, ac, shade(ac, -0.2), 0.8);
        K.parapet(AX0, AZ0 + 0.2, AX1, AZ0 + 0.2, 5.67, 0.4, ac, shade(ac, -0.2), 0.8);
        K.door(AX0, 0.12, acz - 2.5, 3, 1.9, 2.8, ac);
        K.win(AX0, 2.0, acz + 2.5, 3, 1.1, 1.3, ac, { bars: true });
        K.win(AX0, 2.0, acz + 4.8, 3, 1.1, 1.3, ac, { bars: true });
        K.win(acx, 2.0, AZ1, 0, 1.1, 1.3, ac, { bars: true });
        K.door(acx, 0.12, AZ0, 1, 1.5, 2.5, ac);
        F.box(AX1 - 1.5, 5.67, AZ0 + 3, 1.0, 5.0, 1.0, 0, shade(ac, -0.25), 'stone');
        F.box(AX1 - 1.5, 10.67, AZ0 + 3, 1.3, 0.4, 1.3, 0, shade(ac, -0.35), 'stone');
        F.cyl(AX1 - 1.5, 11.07, AZ0 + 3, 0.3, 0.5, 0, IRON2, 'metal');
        F.cyl(AX0 - 1.6, 0.12, acz + 0.5, 0.45, 0.7, 0, TIMBER, 'wood');
        F.box(AX0 - 1.6, 0.82, acz + 0.5, 1.2, 0.4, 0.45, 0, IRON2, 'metal');
        K.rack(AX0 - 0.5, acz + 3.6, 3.2, false, 7);
        K.stack(AX0 - 2.4, AZ1 + 1.6, 6, 0.9);
        K.barrel(AX0 - 3.6, 0.12, AZ0 + 0.9);
        K.barrel(AX0 - 4.5, 0.12, AZ0 + 1.3);

        /* banners on the curtain's inner face and at the rear */
        K.banner(-12, H - 0.5, -Z + T / 2, 0, 1.8, 4.0, GREEN, GOLD);
        K.banner(12, H - 0.5, -Z + T / 2, 0, 1.8, 4.0, GOLD, GREEN);
        K.banner(0, H - 0.6, -Z - T / 2, 1, 2.2, 4.4, GREEN, GOLD);
        K.banner(-X - T / 2, H - 0.6, 0, 3, 2.0, 4.2, GOLD, GREEN);
        K.banner(X + T / 2, H - 0.6, 0, 2, 2.0, 4.2, GREEN, GOLD);
        /* postern in the back wall */
        K.door(14, 0.0, -Z - T / 2, 1, 1.3, 2.4, wallC, { pointed: true });
        K.fbox(14, 0, -Z - T / 2 - 1.3, 1, 2.6, 0.3, 1.6, dark, 'stone');
      } else {
        /* ---------------- harbour / river fort ---------------- */
        const wallC = F.pick(STONE), base = shade(F.pick(BASALT), 0.12), band = shade(wallC, -0.14);
        const trimL = shade(wallC, 0.2), trimD = shade(wallC, -0.3);
        const capC = F.pick([0x6b7a4a, 0x4a5a52, 0x5a5048]);
        const X = 14, Z = 14, T = 2.6, H = 8;
        /* stone quay platform the fort stands on */
        F.box(0, 0, 0, 45, 1.0, 45, 0, base, 'stone');
        F.box(0, 1.0, 0, 45.3, 0.25, 45.3, 0, shade(base, 0.2), 'stone');
        /* waterline stain and mooring rings round the quay face */
        F.box(0, 0, 0, 45.1, 0.35, 45.1, 0, shade(base, -0.3), 'stone');
        const Y0 = 1.25;
        function curtain(ax, az, bx, bz, out, gap) {
          const alongX = az === bz, L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az);
          const cx = (ax + bx) / 2, cz = (az + bz) / 2, on = K.nrm(out);
          const bw = (t) => alongX ? [L, t] : [t, L];
          let s = bw(T + 1.6); F.box(cx + on[0] * 0.3, Y0, cz + on[1] * 0.3, s[0], 1.6, s[1], 0, shade(wallC, -0.12), 'stone');
          s = bw(T); F.box(cx, Y0, cz, s[0], H, s[1], 0, wallC, 'stone');
          s = bw(T + 0.4); F.box(cx, Y0 + 1.6, cz, s[0], 0.3, s[1], 0, band, 'stone');
          s = bw(T + 0.5); F.box(cx, Y0 + H - 0.35, cz, s[0], 0.35, s[1], 0, trimL, 'stone');
          const oa = [ax + on[0] * (T / 2 - 0.25), az + on[1] * (T / 2 - 0.25)], ob = [bx + on[0] * (T / 2 - 0.25), bz + on[1] * (T / 2 - 0.25)];
          K.parapet(oa[0], oa[1], ob[0], ob[1], Y0 + H, 0.5, wallC, trimD, 1.0);
          const fx = cx + on[0] * T / 2, fz = cz + on[1] * T / 2;
          [-L / 4, L / 4].forEach((u) => {
            if (gap && Math.abs(u) < gap) return;
            const p = K.along(fx, fz, out, u);
            K.slit(p[0], Y0 + 3.6, p[1], out, 1.8, wallC);
          });
          const ix = cx - on[0] * T / 2, iz = cz - on[1] * T / 2;
          for (let i = 0; i < Math.floor(L / 3.5); i++) {
            const p = K.along(ix, iz, out ^ 1, -L / 2 + (i + 0.5) * 3.5);
            K.fbox(p[0], Y0 + 5.6, p[1], out ^ 1, 0.3, 0.3, 0.05, DOOR, 'wood');
          }
        }
        curtain(-X, -Z, -3.5, -Z, 1); curtain(3.5, -Z, X, -Z, 1);
        curtain(-X, Z, -2.5, Z, 0); curtain(2.5, Z, X, Z, 0);
        curtain(-X, -Z, -X, Z, 3); curtain(X, -Z, X, Z, 2);
        F.box(0, Y0, 0, 2 * X - T, 0.1, 2 * Z - T, 0, shade(STONE[4], -0.1), 'stone');

        /* ---- diamond bastions at the four corners, with a ballista each */
        const BR = 5.2, BH = H - 0.6;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((c, ci) => {
          const bx = c[0] * X, bz = c[1] * Z;
          F.frustum(bx, Y0, bz, BR + 0.5, BR + 0.3, 1.4, Math.PI / 4, shade(wallC, -0.12), 'stone', 4);
          F.frustum(bx, Y0, bz, BR + 0.2, BR - 0.2, BH, Math.PI / 4, shade(wallC, 0.03), 'stone', 4);
          F.frustum(bx, Y0 + BH - 0.35, bz, BR + 0.1, BR + 0.1, 0.35, Math.PI / 4, trimL, 'stone', 4);
          const tip = BR * Math.SQRT2;
          const pts = [[bx + tip, bz], [bx, bz + tip], [bx - tip, bz], [bx, bz - tip]];
          for (let e = 0; e < 4; e++) {
            const a = pts[e], b = pts[(e + 1) % 4];
            /* only the outward edges get the parapet */
            const mx = (a[0] + b[0]) / 2 - bx, mz = (a[1] + b[1]) / 2 - bz;
            if (mx * c[0] < 0 && mz * c[1] < 0) continue;
            const ix = -Math.sign(mx) * 0.3, iz = -Math.sign(mz) * 0.3;
            K.parapet(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, Y0 + BH, 0.5, wallC, trimD, 1.0);
            /* a slit in the middle of each outer face */
            const phi = Math.atan2(mz, mx), fr = BR + 0.08;
            F.box(bx + Math.cos(phi) * fr, Y0 + 2.8, bz + Math.sin(phi) * fr, 0.25, 1.8, 0.4, -phi - Math.PI / 2, DOOR, 'wood');
            F.box(bx + Math.cos(phi) * (fr - 0.05), Y0 + 2.6, bz + Math.sin(phi) * (fr - 0.05), 0.7, 2.2, 0.3, -phi - Math.PI / 2, trimD, 'stone');
          }
          if (ci === 1) return; /* the signal tower rises from this one */
          /* ballista */
          const by = Y0 + BH, fx = bx + c[0] * 1.2, fz = bz + c[1] * 1.2, ry = Math.atan2(c[0], c[1]);
          F.cyl(fx, by, fz, 0.35, 0.8, 0, TIMBER, 'wood');
          F.box(fx, by + 0.8, fz, 0.4, 0.3, 2.6, ry, TIMBER2, 'wood');
          const px = Math.sin(ry), pz = Math.cos(ry);
          F.rod(fx + px * 0.9 - pz * 1.3, by + 1.0, fz + pz * 0.9 + px * 1.3, fx + px * 0.9 + pz * 1.3, by + 1.0, fz + pz * 0.9 - px * 1.3, 0.06, TIMBER3, 'wood');
          F.rod(fx - px * 1.2, by + 1.05, fz - pz * 1.2, fx + px * 1.6, by + 1.05, fz + pz * 1.6, 0.04, IRON, 'metal');
          K.crate(fx - c[0] * 1.6, by, fz + c[1] * 0.2, 0.6, 0.3);
        });

        /* ---- signal tower on the back-right bastion */
        const SX = X, SZ = -Z, sy = Y0 + BH, STH = 14;
        F.frustum(SX, sy, SZ, 3.2, 2.8, STH, 0, shade(wallC, 0.06), 'stone', 4);
        F.box(SX, sy + STH * 0.5, SZ, 6.5, 0.3, 6.5, 0, band, 'stone');
        F.box(SX, sy + STH - 0.4, SZ, 6.4, 0.4, 6.4, 0, trimL, 'stone');
        K.parapetRect(SX, SZ, 3.2, 3.2, sy + STH, 0.45, wallC, trimD, 0.9);
        const ly = sy + STH;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((c) => F.box(SX + c[0] * 2.3, ly, SZ + c[1] * 2.3, 0.45, 2.8, 0.45, 0, TIMBER, 'wood'));
        F.box(SX, ly + 2.8, SZ, 5.4, 0.3, 5.4, 0, TIMBER2, 'wood');
        F.pyrRoof(SX, ly + 3.1, SZ, 6.0, 2.2, 6.0, 0, capC, 'roof');
        K.flame(SX, ly, SZ, 1.3);
        /* signal mast with a yard and hoisted flags */
        F.rod(SX, ly + 5.3, SZ, SX, ly + 9.6, SZ, 0.1, TIMBER, 'wood');
        F.rod(SX - 1.8, ly + 8.4, SZ, SX + 1.8, ly + 8.4, SZ, 0.06, TIMBER, 'wood');
        [-1.6, -0.6, 0.6, 1.6].forEach((u, i) => {
          F.rod(SX + u, ly + 8.4, SZ, SX + u, ly + 7.6, SZ, 0.015, ROPE, 'wood');
          F.box(SX + u, ly + 6.9, SZ, 0.55, 0.7, 0.04, 0, [GREEN, GOLD, 0x7a2028, 0xe8d9a0][i], 'cloth');
        });
        F.ball(SX, ly + 9.7, SZ, 0.18, GOLD, 'metal');
        [0, 2, 1].forEach((s) => {
          const n = K.nrm(s);
          [0.3, 0.62].forEach((f) => {
            const r = 3.2 - 0.4 * f;
            K.slit(SX + n[0] * r, sy + STH * f, SZ + n[1] * r, s, 1.5, wallC);
          });
        });
        K.door(SX - 3.05, sy, SZ + 0.5, 3, 1.1, 2.2, wallC, { step: false });

        /* ---- sea gate: a projecting water-gate block on the back wall */
        const GZ = -Z - 1.2;
        F.box(0, Y0, GZ, 8.4, H + 2.4, 5.2, 0, shade(wallC, 0.04), 'stone');
        F.box(0, Y0 + H + 2.0, GZ, 9.0, 0.4, 5.8, 0, trimL, 'stone');
        K.parapetRect(0, GZ, 4.2, 2.6, Y0 + H + 2.4, 0.45, wallC, trimD, 1.0);
        K.opening(0, Y0 - 0.4, GZ - 2.6, 1, 4.2, 4.8, 0.1, 0x14120f);
        K.archHead(0, Y0 + 4.4, GZ - 2.6, 1, 5.4, 2.4, 0.3, trimL);
        for (let i = 0; i < 9; i++) F.box(-1.9 + i * 0.475, Y0 + 2.2, GZ - 2.75, 0.1, 4.0, 0.1, 0, IRON, 'metal');
        for (let j = 0; j < 6; j++) F.box(0, Y0 + 2.4 + j * 0.6, GZ - 2.75, 4.3, 0.09, 0.12, 0, IRON, 'metal');
        K.banner(-3.0, Y0 + H + 1.6, GZ - 2.6, 1, 1.4, 3.6, GREEN, GOLD);
        K.banner(3.0, Y0 + H + 1.6, GZ - 2.6, 1, 1.4, 3.6, GOLD, GREEN);
        K.win(0, Y0 + 7.4, GZ - 2.6, 1, 1.2, 1.3, wallC, { pointed: true, bars: true });
        [2, 3].forEach((s) => K.slit(s === 2 ? 4.2 : -4.2, Y0 + 5, GZ, s, 1.8, wallC));
        /* landing stage, steps to the water and a timber jetty */
        const LZ = -24.5;
        F.box(0, 0, LZ, 12, 1.0, 4, 0, base, 'stone');
        F.box(0, 1.0, LZ, 12.2, 0.25, 4.2, 0, shade(base, 0.2), 'stone');
        [-1, 1].forEach((k) => {
          for (let i = 0; i < 4; i++) F.box(k * (6.35 + i * 0.7), 0, LZ, 0.7, 1.0 - i * 0.25, 4.0, 0, shade(base, 0.1), 'stone');
          F.cyl(k * 4.8, 1.25, LZ - 1.3, 0.3, 0.8, 0, IRON2, 'metal');
          F.cyl(k * 4.8, 2.05, LZ - 1.3, 0.38, 0.14, 0, IRON2, 'metal');
        });
        const JZ0 = LZ - 2, JL = 6;
        F.box(-2.0, 0.9, JZ0 - JL / 2, 2.6, 0.22, JL, 0, TIMBER3, 'wood');
        for (let i = 0; i <= 2; i++) [-1, 1].forEach((k) => F.cyl(-2.0 + k * 1.15, 0, JZ0 - 0.2 - i * (JL - 0.4) / 2, 0.18, 1.5, 0, TIMBER, 'wood'));
        F.box(-2.0, 1.12, JZ0 - JL + 0.3, 2.6, 0.5, 0.3, 0, TIMBER, 'wood');
        K.stack(-9.5, -19.5, 5, 0.9);
        K.barrel(-5.6, 1.25, -19.2); K.barrel(-6.5, 1.25, -18.9);

        /* ---- land gate on the front */
        [-1, 1].forEach((k) => {
          const top = K.pylon(k * 3.4, Z + 1.0, Y0, 1.4, H + 1.4, shade(wallC, 0.04), capC);
          K.flame(k * 3.4, top - 0.1, Z + 1.0, 0.6);
        });
        F.box(0, Y0 + 4.2, Z, 5.2, H - 4.2, T, 0, wallC, 'stone');
        K.opening(0, Y0, Z + T / 2, 0, 3.2, 3.6, 0.08, 0x14120f);
        [-1, 1].forEach((k) => F.box(k * 1.3, Y0, Z + T / 2 + 0.1, 0.7, 3.4, 0.2, 0, TIMBER2, 'wood'));
        K.archHead(0, Y0 + 3.6, Z + T / 2, 0, 4.2, 2.0, 0.25, trimL);
        K.banner(0, Y0 + H - 0.3, Z + T / 2, 0, 1.6, 1.6, GREEN, GOLD);
        K.stair(0, 22.5 + 4 * 0.55, 0, 1, 4, Y0 / 4, 0.55, 5.0, shade(base, 0.15));

        /* ---- inside: barrack range along the left wall, cistern, stair */
        const BX0 = -X + T / 2, BX1 = BX0 + 6, BZ0 = -7, BZ1 = 9;
        const bc = shade(wallC, -0.06), bcx = (BX0 + BX1) / 2, bcz = (BZ0 + BZ1) / 2;
        F.box(bcx, Y0, bcz, 6, 6.4, BZ1 - BZ0, 0, bc, 'stone');
        F.box(bcx, Y0 + 3.2, bcz, 6.3, 0.25, BZ1 - BZ0 + 0.3, 0, band, 'stone');
        F.box(bcx, Y0 + 6.4, bcz, 6.4, 0.35, BZ1 - BZ0 + 0.4, 0, trimL, 'stone');
        [BZ0 + 3, bcz, BZ1 - 3].forEach((z, i) => {
          if (i === 1) K.door(BX1, Y0, z, 2, 1.4, 2.5, bc);
          else K.win(BX1, Y0 + 1.1, z, 2, 1.0, 1.3, bc, { shut: 0x46603f });
          K.win(BX1, Y0 + 4.3, z, 2, 1.0, 1.3, bc, { shut: 0x46603f });
        });
        K.win(bcx, Y0 + 4.3, BZ1, 0, 1.0, 1.3, bc);
        K.win(bcx, Y0 + 4.3, BZ0, 1, 1.0, 1.3, bc);
        /* timber shade awning on the barrack roof, used as a lookout */
        const ry0 = Y0 + 6.75;
        [[BX0 + 1, BZ0 + 1], [BX1 - 0.5, BZ0 + 1], [BX0 + 1, BZ0 + 7], [BX1 - 0.5, BZ0 + 7]].forEach((p) => F.box(p[0], ry0, p[1], 0.2, 2.4, 0.2, 0, TIMBER, 'wood'));
        F.box(bcx + 0.25, ry0 + 2.4, BZ0 + 4, 5.0, 0.08, 6.6, 0, F.pick(SAIL), 'cloth');
        F.box(BX1 - 0.4, ry0 + 2.1, BZ0 + 4, 0.06, 0.35, 6.6, 0, GREEN, 'cloth');
        K.stack(BX0 + 1.8, BZ0 + 9.5, 4, 0.8);
        F.box(bcx, ry0, BZ1 - 1.2, 1.2, 0.1, 1.2, 0, TIMBER, 'wood');
        /* stair to the wall-walk, right side */
        K.stair(X - T / 2 - 1.1, Z - 6, Y0, 1, 11, H / 11, 0.9, 2.0, shade(wallC, 0.05));
        /* cistern with a lid and a pump post */
        F.box(4, Y0, 3, 4.2, 1.1, 3.2, 0, shade(wallC, -0.15), 'stone');
        F.box(4, Y0 + 1.1, 3, 4.5, 0.2, 3.5, 0, trimL, 'stone');
        F.box(3, Y0 + 1.3, 3, 0.3, 1.3, 0.3, 0, IRON, 'metal');
        F.rod(3, Y0 + 2.5, 3, 3.8, Y0 + 2.9, 3, 0.05, IRON, 'metal');
        K.barrel(6.8, Y0, 3.6); K.barrel(6.9, Y0, 2.6);
        K.rack(2, -6, 3.5, true, 8);
        F.box(-2, Y0, -3, 2.4, 0.9, 1.2, 0, TIMBER, 'wood');
        /* flags on the curtain and outer-face banners */
        K.banner(-X - T / 2, Y0 + H - 0.5, 0, 3, 1.8, 3.8, GREEN, GOLD);
        K.banner(X + T / 2, Y0 + H - 0.5, 4, 2, 1.8, 3.8, GOLD, GREEN);
      }
    }
  });

  /* ====================================================================
     voth_barracks
     ==================================================================== */
  ASSET({
    key: 'voth_barracks', name: 'Barracks', culture: 'voth', family: 'military',
    source: 'voth-military',
    districts: ['fortress', 'wall', 'common', 'canton'], wealth: [0.3, 0.8],
    blurb: 'A long Hlaalu barracks with an arcaded ground floor, two dormitory storeys, armoury, chimneyed mess and a roof drill deck; or a battered Velothi block round a drill court with a guard tower.',
    w: 49, d: 36, h: 22, variants: 2,
    variantDims: [
      { w: 49, d: 17, h: 19 },
      { w: 35, d: 36, h: 22 }
    ],
    build: function (F) {
      const K = kit(F);
      if (F.variant === 0) {
        /* ---------------- Hlaalu long barracks ---------------- */
        const c = F.pick(STONE), cornice = shade(c, -0.14), plinthC = shade(c, -0.26);
        const shut = F.pick([0x46603f, 0x5a4028, 0x6b4a2a]);
        const X = 16, ZB = -6, ZF = 6, ZI = 2.6, G = 4.4, H = 11.2;
        /* plinth and the two masses: set-back ground floor, full-depth upper */
        F.box(0, 0, 0, 2 * X + 0.8, 0.35, ZF - ZB + 0.8, 0, plinthC, 'stone');
        F.box(0, 0.35, (ZB + ZI) / 2, 2 * X, G - 0.35, ZI - ZB, 0, c, 'stone');
        F.box(0, G, 0, 2 * X, H - G, ZF - ZB, 0, c, 'stone');
        F.box(0, 0.35, (ZI + ZF) / 2, 2 * X - 0.4, 0.12, ZF - ZI, 0, shade(c, -0.18), 'stone');
        F.box(0, G, 0, 2 * X + 0.3, 0.5, ZF - ZB + 0.3, 0, cornice, 'stone');
        F.box(0, 7.75, 0, 2 * X + 0.2, 0.22, ZF - ZB + 0.2, 0, shade(c, -0.06), 'stone');
        F.box(0, H, 0, 2 * X + 0.6, 0.4, ZF - ZB + 0.6, 0, cornice, 'stone');
        /* roof parapet with coping */
        const RY = H + 0.4;
        [[0, ZF - 0.2, 2 * X, 0.4], [0, ZB + 0.2, 2 * X, 0.4], [X - 0.2, 0, 0.4, ZF - ZB], [-X + 0.2, 0, 0.4, ZF - ZB]].forEach((q) => {
          F.box(q[0], RY, q[1], q[2], 1.0, q[3], 0, c, 'stone');
          F.box(q[0], RY + 1.0, q[1], q[2] + 0.2, 0.18, q[3] + 0.2, 0, cornice, 'stone');
        });
        F.box(0, RY, 0, 2 * X - 0.8, 0.06, ZF - ZB - 0.8, 0, shade(c, -0.1), 'stone');
        /* arcade: piers with bases and capitals, arched haunches in every bay */
        const NB = 9, bay = 2 * X / NB;
        for (let i = 0; i <= NB; i++) {
          const px = -X + i * bay, pw = (i === 0 || i === NB) ? 1.3 : 0.9;
          const cx = i === 0 ? px + pw / 2 : i === NB ? px - pw / 2 : px;
          F.box(cx, 0.35, ZF - 0.5, pw, G - 0.35, 1.0, 0, shade(c, 0.04), 'stone');
          F.box(cx, 0.35, ZF - 0.5, pw + 0.3, 0.45, 1.3, 0, cornice, 'stone');
          F.box(cx, G - 0.55, ZF - 0.5, pw + 0.3, 0.3, 1.3, 0, cornice, 'stone');
        }
        for (let i = 0; i < NB; i++) {
          const x0 = -X + i * bay + (i === 0 ? 1.3 : 0.45), x1 = -X + (i + 1) * bay - (i === NB - 1 ? 1.3 : 0.45);
          F.beam(x0, G - 1.3, ZF - 0.5, x0 + 0.9, G - 0.25, ZF - 0.5, 0.45, 1.0, shade(c, 0.04), 'stone');
          F.beam(x1, G - 1.3, ZF - 0.5, x1 - 0.9, G - 0.25, ZF - 0.5, 0.45, 1.0, shade(c, 0.04), 'stone');
          const mx = (x0 + x1) / 2;
          /* rear wall of the arcade: doors in three bays, windows between */
          if (i === 1 || i === 4 || i === 7) K.door(mx, 0.47, ZI, 0, 1.5, 2.6, c, { step: false });
          else K.win(mx, 1.4, ZI, 0, 1.2, 1.5, c, { shut: shut });
          /* lamps on the pier faces */
          if (i % 3 === 1) { F.rod(mx, 3.3, ZI, mx, 3.3, ZI + 0.5, 0.05, IRON, 'metal'); F.ball(mx, 3.05, ZI + 0.5, 0.18, WARM, 'glow'); }
          /* dormitory windows, two storeys, front and back */
          [5.6, 8.7].forEach((y) => {
            K.win(mx, y, ZF, 0, 1.2, 1.7, c, { shut: shut });
            K.win(mx, y, ZB, 1, 1.1, 1.6, c, { shut: y > 8 ? shut : null });
          });
          if (i !== 4) K.win(mx, 1.4, ZB, 1, 1.0, 1.3, c, { bars: true });
        }
        K.door(0, 0.35, ZB, 1, 1.6, 2.7, c);
        /* back: timber gallery along the first floor with a stair down */
        F.box(-6, 4.9, ZB - 0.8, 12, 0.22, 1.6, 0, TIMBER, 'wood');
        for (let i = 0; i <= 6; i++) {
          F.box(-12 + i * 2, 0.35, ZB - 1.45, 0.2, 5.8, 0.2, 0, TIMBER, 'wood');
          F.beam(-12 + i * 2, 4.2, ZB - 1.45, -12 + i * 2, 4.9, ZB - 0.05, 0.15, 0.15, TIMBER, 'wood');
        }
        F.box(-6, 5.9, ZB - 1.55, 12, 0.12, 0.12, 0, TIMBER2, 'wood');
        F.box(-6, 5.12, ZB - 1.55, 12, 0.08, 0.08, 0, TIMBER2, 'wood');
        K.door(-9, 4.9 + 0.22, ZB, 1, 1.2, 2.3, c, { step: false });
        for (let i = 0; i < 9; i++) F.box(1.0 + i * 0.95, 0.35, ZB - 0.8, 0.95, 0.35 + (i + 1) * 0.5 - 0.35 + 0.14, 1.4, 0, i % 2 ? TIMBER3 : TIMBER2, 'wood');
        [-15.2, 15.2].forEach((x) => { F.rod(x, 0.35, ZB - 0.15, x, H, ZB - 0.15, 0.1, shade(c, -0.3), 'metal'); F.box(x, H - 0.4, ZB - 0.2, 0.45, 0.4, 0.4, 0, shade(c, -0.3), 'metal'); });
        /* the upper end walls (above the wings) */
        [-1, 1].forEach((k) => {
          [-2.5, 2.5].forEach((z) => K.win(k * X, 8.7, z, k > 0 ? 2 : 3, 1.1, 1.6, c, { shut: shut }));
        });
        /* shield boards and green banners on the front string course */
        [-12, -4, 4, 12].forEach((x, i) => {
          F.rod(x, 5.1, ZF + 0.1, x, 5.1, ZF + 0.35, 0.34, [0x8a7a5a, 0x7a4a3a, 0x4a5a6a][i % 3], 'metal');
        });
        [-X + 1.2, X - 1.2].forEach((x, i) => K.banner(x, 10.6, ZF, 0, 1.2, 4.2, i ? GOLD : GREEN, i ? GREEN : GOLD));

        /* ---- armoury wing (+x): heavy, barred, one ironbound door */
        const AX0 = X, AX1 = X + 7, AZ = 0, AD = 10, AH = 7.4, ac = shade(c, -0.08);
        F.box((AX0 + AX1) / 2 + 0.2, 0, AZ, AX1 - AX0 + 0.8, 0.35, AD + 0.8, 0, plinthC, 'stone');
        F.box((AX0 + AX1) / 2, 0.35, AZ, AX1 - AX0, AH - 0.35, AD, 0, ac, 'stone');
        F.box((AX0 + AX1) / 2, AH, AZ, AX1 - AX0 + 0.4, 0.35, AD + 0.4, 0, cornice, 'stone');
        F.box((AX0 + AX1) / 2, AH + 0.35, AD / 2 - 0.2, AX1 - AX0, 0.8, 0.4, 0, ac, 'stone');
        F.box((AX0 + AX1) / 2, AH + 0.35, -AD / 2 + 0.2, AX1 - AX0, 0.8, 0.4, 0, ac, 'stone');
        F.box(AX1 - 0.2, AH + 0.35, AZ, 0.4, 0.8, AD, 0, ac, 'stone');
        [0.35, AH * 0.5].forEach((y) => F.box((AX0 + AX1) / 2, y, AZ, AX1 - AX0 + 0.15, 0.25, AD + 0.15, 0, cornice, 'stone'));
        K.door((AX0 + AX1) / 2, 0.35, AD / 2, 0, 2.2, 3.0, ac);
        F.box((AX0 + AX1) / 2, 3.9, AD / 2 + 0.2, 1.5, 1.2, 0.12, 0, 0x8a7a5a, 'metal');
        [-2.6, 0, 2.6].forEach((z) => K.win(AX1, 4.6, z, 2, 0.9, 1.1, ac, { bars: true }));
        [-1.8, 1.8].forEach((x) => K.win((AX0 + AX1) / 2 + x, 4.6, -AD / 2, 1, 0.9, 1.1, ac, { bars: true }));
        K.door(AX1, 0.35, -2.5, 2, 1.2, 2.3, ac);
        K.rack(AX1 + 0.5, 2.2, 2.6, false, 6);
        /* ladder from the armoury roof to the main roof */
        [-0.45, 0.45].forEach((dz) => F.box(X + 0.35, AH + 0.35, -3 + dz, 0.1, H + 1.5 - AH, 0.1, 0, TIMBER, 'wood'));
        for (let i = 1; i < 9; i++) F.box(X + 0.35, AH + 0.35 + i * 0.5, -3, 0.08, 0.06, 0.9, 0, TIMBER2, 'wood');

        /* ---- mess hall wing (-x): hip roof, two chimneys, big windows */
        const MX0 = -X - 8, MX1 = -X, MD = 13, MH = 6.4, mc = shade(c, 0.05), mcx = (MX0 + MX1) / 2;
        F.box(mcx - 0.2, 0, 0, MX1 - MX0 + 0.8, 0.35, MD + 0.8, 0, plinthC, 'stone');
        F.box(mcx, 0.35, 0, MX1 - MX0, MH - 0.35, MD, 0, mc, 'stone');
        F.box(mcx, MH, 0, MX1 - MX0 + 0.5, 0.35, MD + 0.5, 0, cornice, 'stone');
        F.pyrRoof(mcx, MH + 0.35, 0, MX1 - MX0 + 1.4, 2.8, MD + 1.4, 0, F.pick([0x6b7a4a, 0x5f6e44]), 'roof');
        [-3.8, 0, 3.8].forEach((z) => K.win(MX0, 1.6, z, 3, 1.4, 2.4, mc, { pointed: true }));
        [-2.2, 2.2].forEach((dx) => {
          K.win(mcx + dx, 1.6, -MD / 2, 1, 1.3, 2.3, mc, { pointed: true });
        });
        K.door(mcx - 1.5, 0.35, MD / 2, 0, 1.6, 2.7, mc, { pointed: true });
        K.win(mcx + 2.2, 1.6, MD / 2, 0, 1.3, 2.3, mc, { pointed: true });
        K.stair(mcx - 1.5, MD / 2 + 1.5, 0, 1, 1, 0.35, 0.6, 2.8, plinthC);
        [-3.2, 3.2].forEach((z) => {
          F.box(MX0 - 0.55, 0, z, 1.1, 10.4, 1.3, 0, shade(mc, -0.2), 'stone');
          F.box(MX0 - 0.55, 10.4, z, 1.5, 0.45, 1.7, 0, shade(mc, -0.32), 'stone');
          F.cyl(MX0 - 0.55, 10.85, z, 0.3, 0.55, 0, 0x2a241e, 'stone');
        });
        /* kitchen yard at the back of the mess */
        for (let i = 0; i < 4; i++) F.rod(mcx - 3 + F.rr(-0.1, 0.1), 0.2 + i * 0.3, -MD / 2 - 1.2, mcx + 0.5, 0.2 + i * 0.3, -MD / 2 - 1.2, 0.16, TIMBER3, 'wood');
        K.barrel(mcx + 2.0, 0, -MD / 2 - 1.0); K.barrel(mcx + 2.9, 0, -MD / 2 - 1.1);
        F.box(mcx - 1.5, 0, -MD / 2 - 0.5, 0.5, 0.9, 0.5, 0, TIMBER, 'wood');

        /* ---- roof: drill deck, awning, watch room, flag, cistern */
        const aw = F.pick(SAIL);
        [-14.2, -8.6, -3.0].forEach((x) => [-4.2, 4.2].forEach((z) => {
          F.box(x, RY, z, 0.22, 2.9, 0.22, 0, TIMBER, 'wood');
        }));
        F.box(-8.6, RY + 2.9, 0, 11.6, 0.1, 8.8, 0, aw, 'cloth');
        [-4.4, 4.4].forEach((z) => F.box(-8.6, RY + 2.55, z, 11.6, 0.35, 0.05, 0, GREEN, 'cloth'));
        [-4.2, 4.2].forEach((z) => F.box(-8.6, RY + 2.8, z, 11.6, 0.14, 0.14, 0, TIMBER2, 'wood'));
        [-11.5, -5.7].forEach((x) => { F.box(x, RY, -1.5, 3.2, 0.5, 0.45, 0, TIMBER2, 'wood'); F.box(x, RY, 1.5, 3.2, 0.5, 0.45, 0, TIMBER2, 'wood'); F.box(x, RY, 0, 3.0, 0.8, 1.2, 0, TIMBER3, 'wood'); });
        K.dummy(1.5, 1.8, 0); K.dummy(4.5, 1.8, 0.4); K.dummy(1.5, -2.2, 0);
        /* dummies stand on the roof deck */
        K.rack(4.0, -4.6, 3.4, true, 8);
        /* watch room: the stair head, with door, windows, parapet and flag */
        const WX = 11.5, WZ = -2.0, ww = 6.0, wd = 6.4, wh = 3.0;
        F.box(WX, RY, WZ, ww, wh, wd, 0, shade(c, 0.04), 'stone');
        F.box(WX, RY + wh, WZ, ww + 0.4, 0.3, wd + 0.4, 0, cornice, 'stone');
        K.parapetRect(WX, WZ, ww / 2, wd / 2, RY + wh + 0.3, 0.35, shade(c, 0.04), cornice, 0.6);
        K.door(WX - 1.2, RY, WZ + wd / 2, 0, 1.2, 2.3, c, { step: false });
        K.win(WX + 1.4, RY + 1.0, WZ + wd / 2, 0, 0.9, 1.1, c, { shut: shut });
        K.win(WX - ww / 2, RY + 1.0, WZ, 3, 0.9, 1.1, c, { shut: shut });
        K.win(WX, RY + 1.0, WZ - wd / 2, 1, 0.9, 1.1, c);
        K.win(WX + ww / 2, RY + 1.0, WZ, 2, 0.9, 1.1, c);
        K.flagpole(WX + 1.5, WZ - 1.5, RY + wh + 0.3, 4.2, GREEN, 1);
        for (let i = 0; i < 6; i++) F.box(WX + 2.2, RY + wh + 0.3 - 3.3 + 0.55 * i + 0.05, WZ - wd / 2 - 0.3, 0.06, 0.06, 0.6, 0, TIMBER, 'wood');
        F.cyl(6.5, RY, 3.6, 1.1, 1.5, 0, 0x6b4a2a, 'wood');
        F.cyl(6.5, RY + 0.3, 3.6, 1.15, 0.1, 0, IRON, 'metal');
        F.cyl(6.5, RY + 1.2, 3.6, 1.15, 0.1, 0, IRON, 'metal');
        K.stack(13.2, 3.5, 3, 0.8);
      } else {
        /* ---------------- Velothi barracks round a drill court ---------------- */
        const c = F.pick(POOR), dark = shade(c, -0.22), band = shade(c, -0.12), cop = shade(c, 0.12);
        const capC = F.pick([0x4a3f3a, 0x5a5048, 0x3f4a52]);
        const O = 16, I = 9.5, H = 7.6, D = O - I;
        /* a battered range between (x0,z0)-(x1,z1); outer side out */
        function range(x0, z0, x1, z1, out, ends) {
          const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0, on = K.nrm(out);
          F.box(cx, 0, cz, w, H, d, 0, c, 'stone');
          const alongX = on[1] !== 0, L = alongX ? w : d;
          const fx = cx + on[0] * (alongX ? 0 : w / 2), fz = cz + on[1] * (alongX ? d / 2 : 0);
          K.fbox(fx, 0, fz, out, L, 1.3, 0.9, dark, 'stone');
          K.fbox(fx, 1.3, fz, out, L, 1.1, 0.45, shade(c, -0.1), 'stone');
          F.box(cx, H - 0.35, cz, w + 0.4, 0.35, d + 0.4, 0, band, 'stone');
          F.box(cx, 3.6, cz, w + 0.2, 0.2, d + 0.2, 0, band, 'stone');
          /* rounded Velothi parapet: a low wall and a coping roll */
          const ox = fx - on[0] * 0.2, oz = fz - on[1] * 0.2;
          F.box(ox, H, oz, alongX ? L : 0.4, 0.8, alongX ? 0.4 : L, 0, c, 'stone');
          if (alongX) F.rod(ox - L / 2, H + 0.8, oz, ox + L / 2, H + 0.8, oz, 0.24, cop, 'stone');
          else F.rod(ox, H + 0.8, oz - L / 2, ox, H + 0.8, oz + L / 2, 0.24, cop, 'stone');
          /* outer face: pylon buttresses and small high windows between */
          const nb = Math.max(2, Math.round(L / 6));
          for (let i = 0; i <= nb; i++) {
            const u = -L / 2 + L * i / nb;
            if (Math.abs(u) > L / 2 - 1.2) continue;
            const p = K.along(fx, fz, out, u);
            K.pylon(p[0] + on[0] * 0.55, p[1] + on[1] * 0.55, 0, 0.75, H + 0.4, shade(c, 0.04), capC);
          }
          for (let i = 0; i < nb; i++) {
            const u = -L / 2 + L * (i + 0.5) / nb, p = K.along(fx, fz, out, u);
            K.win(p[0], 4.6, p[1], out, 0.7, 1.1, c, { pointed: true });
            K.slit(p[0], 2.6, p[1], out, 0.9, c);
          }
          F.box(cx, H, cz, w - 0.2, 0.05, d - 0.2, 0, shade(c, -0.08), 'stone');
          /* inner kerb along the court edge */
          const ix = cx - on[0] * (alongX ? 0 : w / 2 - 0.15), iz = cz - on[1] * (alongX ? d / 2 - 0.15 : 0);
          F.box(ix, H, iz, alongX ? L : 0.3, 0.5, alongX ? 0.3 : L, 0, c, 'stone');
          /* end faces that are exposed: talus, a window and a slit */
          (ends || []).forEach((es) => {
            const en = K.nrm(es), eL = en[1] !== 0 ? w : d;
            const ex = cx + en[0] * w / 2, ez = cz + en[1] * d / 2;
            K.fbox(ex, 0, ez, es, eL, 1.3, 0.9, dark, 'stone');
            K.fbox(ex, 1.3, ez, es, eL, 1.1, 0.45, shade(c, -0.1), 'stone');
            K.win(ex, 4.6, ez, es, 0.7, 1.1, c, { pointed: true });
            K.slit(ex, 2.6, ez, es, 0.9, c);
          });
        }
        range(-O, -O, O, -I, 1, [2, 3]);
        range(-O, -I, -I, I, 3);
        range(I, -I, O, I, 2);
        range(-O, I, -2.4, O, 0, [3]);
        range(2.4, I, O, O, 0, [2]);
        /* roof life: hatches, a shaded sleeping deck, a cistern, drying lines */
        [[-12.7, -6], [12.7, 5], [-6, -12.7], [8, -12.7]].forEach((q) => {
          F.box(q[0], H, q[1], 1.4, 0.35, 1.4, 0, shade(c, -0.12), 'stone');
          F.box(q[0], H + 0.35, q[1], 1.1, 0.08, 1.1, 0, TIMBER, 'wood');
        });
        [[-9, -14.8], [-1, -14.8], [-9, -10.7], [-1, -10.7]].forEach((q) => F.box(q[0], H, q[1], 0.2, 2.6, 0.2, 0, TIMBER, 'wood'));
        F.box(-5, H + 2.6, -12.75, 8.4, 0.08, 4.5, 0, F.pick(SAIL), 'cloth');
        for (let i = 0; i < 4; i++) F.box(-8 + i * 2, H + 0.05, -12.75, 1.6, 0.18, 0.7, 0, F.pick([0x8a2f2a, 0x5c4028, 0xa89878]), 'cloth');
        F.cyl(-12.7, H, 3, 1.3, 1.6, 0, 0x6b4a2a, 'wood');
        [0.35, 1.25].forEach((y) => F.cyl(-12.7, H + y, 3, 1.34, 0.1, 0, IRON, 'metal'));
        [[12, -4], [14.4, -4]].forEach((q) => F.box(q[0], H, q[1], 0.12, 1.8, 0.12, 0, TIMBER, 'wood'));
        F.rod(12, H + 1.7, -4, 14.4, H + 1.7, -4, 0.02, ROPE, 'wood');
        [12.5, 13.3, 14.0].forEach((x) => F.box(x, H + 1.0, -4, 0.55, 0.7, 0.03, 0, F.pick(SAIL), 'cloth'));
        /* gate: a taller block over the passage, flanking pylons, flame */
        F.box(0, 3.8, (I + O) / 2, 4.8, H + 1.8 - 3.8, D, 0, shade(c, 0.04), 'stone');
        F.box(0, H + 1.5, (I + O) / 2, 5.3, 0.35, D + 0.5, 0, band, 'stone');
        K.parapet(-2.4, O - 0.25, 2.4, O - 0.25, H + 1.85, 0.5, c, dark, 0.9);
        K.parapet(-2.4, I + 0.25, 2.4, I + 0.25, H + 1.85, 0.5, c, dark, 0.9);
        F.box(0, 0, (I + O) / 2, 4.8, 0.1, D, 0, dark, 'stone');
        K.archHead(0, 3.8, O, 0, 4.8, 1.6, 0.05, 0x14120f);
        K.archHead(0, 3.8, I, 1, 4.8, 1.6, 0.05, 0x14120f);
        [-1, 1].forEach((k) => {
          const top = K.pylon(k * 3.4, O + 0.9, 0, 1.0, H + 2.6, shade(c, 0.06), capC);
          K.flame(k * 3.4, top - 0.08, O + 0.9, 0.55);
          F.box(k * 2.45, 0, O - 1.0, 0.18, 3.4, 1.6, k * 0.5, TIMBER2, 'wood');
        });
        K.banner(0, H + 1.4, O, 0, 2.0, 2.4, GREEN, GOLD);
        /* court faces: doors below, windows above, a timber gallery round */
        const GY = 3.8;
        [[0, 1, 2 * I], [0, 3, 2 * I], [0, 2, 2 * I], [0, 0, 2 * I]].forEach((q) => {
          const s = q[1], n = K.nrm(s);
          /* the court face of the range on side s of the court faces inward (s ^ 1) */
          const fx = n[0] * I, fz = n[1] * I, fs = s ^ 1;
          for (let i = 0; i < 5; i++) {
            const u = -I + 2 * I * (i + 0.5) / 5;
            if (s === 0 && Math.abs(u) < 3) continue;
            const p = K.along(fx, fz, fs, u);
            if (i % 2 === 0) K.door(p[0], 0, p[1], fs, 1.2, 2.4, c, { pointed: true });
            else K.win(p[0], 1.2, p[1], fs, 0.9, 1.3, c, { pointed: true });
            K.door(p[0], GY + 0.2, p[1], fs, 1.0, 2.1, c, { step: false, pointed: true });
          }
          if (s === 0) return;
          /* gallery deck, posts and rail on this face */
          const gd = 1.5, alongX = n[1] !== 0;
          const gx = fx - n[0] * gd / 2, gz = fz - n[1] * gd / 2, L = 2 * I - (alongX ? 0 : 2 * gd);
          F.box(gx, GY, gz, alongX ? L : gd, 0.2, alongX ? gd : L, 0, TIMBER, 'wood');
          const rx = fx - n[0] * (gd - 0.08), rz = fz - n[1] * (gd - 0.08);
          F.box(rx, GY + 1.0, rz, alongX ? L : 0.1, 0.1, alongX ? 0.1 : L, 0, TIMBER2, 'wood');
          for (let i = 0; i <= 6; i++) {
            const u = -L / 2 + L * i / 6, p = K.along(rx, rz, fs, u);
            F.box(p[0], 0, p[1], 0.22, GY + 1.1, 0.22, 0, TIMBER, 'wood');
          }
          /* awning over the gallery */
          const ax = fx - n[0] * gd, az = fz - n[1] * gd;
          K.slope(fx, GY + 3.1, fz, ax, GY + 2.5, az, L, 0.08, s === 1 ? F.pick(SAIL) : shade(F.pick(SAIL), -0.1), 'cloth');
          for (let i = 0; i <= 6; i++) {
            const u = -L / 2 + L * i / 6, p = K.along(fx - n[0] * gd, fz - n[1] * gd, fs, u);
            F.box(p[0], GY + 1.1, p[1], 0.12, 1.4, 0.12, 0, TIMBER, 'wood');
          }
        });
        /* stair up to the gallery in the back-left corner */
        K.stair(-I + 0.8, I - 2.2, 0, 1, 7, GY / 7, 0.85, 1.4, shade(c, 0.06));
        /* drill court: packed earth, sparring ring, racks, dummies, trough */
        F.box(0, 0, 0, 2 * I, 0.08, 2 * I, 0, F.pick(MUD), 'stone');
        F.cyl(1.5, 0.08, -1.5, 3.2, 0.05, 0, shade(0x9a8a6a, -0.12), 'stone');
        for (let i = 0; i < 12; i++) { const a = i * TAU / 12; F.box(1.5 + Math.cos(a) * 3.3, 0.08, -1.5 + Math.sin(a) * 3.3, 0.45, 0.25, 0.3, -a, shade(c, -0.1), 'stone'); }
        K.rack(-I + 1.6, -2.5, 4.0, false, 10);
        K.rack(I - 1.9, 0, 4.0, false, 10);
        K.dummy(-4, 4.5, 0.3); K.dummy(-1.5, 5.2, -0.2); K.dummy(1, 4.5, 0.1);
        F.box(5.5, 0.08, -6.5, 3.0, 0.8, 1.0, 0, shade(c, -0.15), 'stone');
        F.box(5.5, 0.8, -6.5, 2.8, 0.06, 0.8, 0, 0x2a3a3a, 'glass');
        F.box(4.0, 0.08, -6.5, 0.3, 1.6, 0.3, 0, IRON, 'metal');
        K.flagpole(-5.5, -5.5, 0.08, 7, GREEN, 1);
        K.barrel(6.6, 0.08, 6.5); K.barrel(7.4, 0.08, 7.3); K.stack(-7.5, 6.3, 3, 0.8);

        /* ---- guard tower at the front-right corner */
        const TX = O - 2.5, TZ = O - 2.5, TH = 16.5;
        F.frustum(TX, 0, TZ, 4.4, 4.1, 1.4, 0, dark, 'stone', 4);
        F.frustum(TX, 1.4, TZ, 4.0, 3.3, TH - 1.4, 0, shade(c, 0.05), 'stone', 4);
        F.box(TX, H - 0.35, TZ, 8.2, 0.35, 8.2, 0, band, 'stone');
        F.box(TX, TH - 0.4, TZ, 7.4, 0.4, 7.4, 0, cop, 'stone');
        K.parapetRect(TX, TZ, 3.5, 3.5, TH, 0.45, c, dark, 0.9);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((q) => F.box(TX + q[0] * 2.2, TH, TZ + q[1] * 2.2, 0.45, 2.5, 0.45, 0, shade(c, 0.1), 'stone'));
        F.box(TX, TH + 2.5, TZ, 5.4, 0.3, 5.4, 0, cop, 'stone');
        F.pyrRoof(TX, TH + 2.8, TZ, 6.2, 2.6, 6.2, 0, capC, 'roof');
        K.flame(TX, TH, TZ, 1.0);
        F.rod(TX, TH + 5.4, TZ, TX, TH + 6.4, TZ, 0.06, IRON, 'metal');
        [0, 2].forEach((s) => {
          const n = K.nrm(s);
          [4.5, 10.5].forEach((y) => {
            const r = 4.0 - 0.7 * (y / TH);
            K.slit(TX + n[0] * r, y, TZ + n[1] * r, s, 1.6, c);
          });
          const r2 = 4.0 - 0.7 * (12.6 / TH);
          K.win(TX + n[0] * r2, 12.6, TZ + n[1] * r2, s, 0.8, 1.2, c, { pointed: true });
        });
        [1, 3].forEach((s) => {
          const n = K.nrm(s), r2 = 4.0 - 0.7 * (11 / TH);
          K.slit(TX + n[0] * r2, 11, TZ + n[1] * r2, s, 1.6, c);
        });
        K.banner(TX, TH - 1.2, TZ + 3.45, 0, 1.6, 4.0, GOLD, GREEN);
      }
    }
  });

  /* ====================================================================
     voth_mustering_grounds
     ==================================================================== */
  ASSET({
    key: 'voth_mustering_grounds', name: 'Mustering Grounds', culture: 'voth', family: 'military',
    source: 'voth-military',
    districts: ['fortress', 'wall', 'outskirts'], wealth: [0.2, 0.8],
    blurb: 'A walled parade field with a canopied reviewing stand, flagpoles, weapon racks, dummies, archery butts and a small armoury shed.',
    w: 56, d: 42, h: 10,
    build: function (F) {
      const K = kit(F);
      const c = F.pick(STONE), cop = shade(c, -0.16), earth = F.pick([0x76664d, 0x6f6149, 0x7a6a50]);
      const X = 26, Z = 18, WH = 1.4, WT = 0.6;
      /* field: packed earth, a flagged processional way, marker stones */
      F.box(0, 0, 0, 2 * X, 0.08, 2 * Z, 0, earth, 'stone');
      F.box(0, 0.08, 3.5, 4, 0.06, 2 * Z - 7, 0, shade(c, -0.05), 'stone');
      for (let i = 0; i < 7; i++) F.box(0, 0.14, Z - 1.5 - i * 4.4, 4.2, 0.03, 0.18, 0, cop, 'stone');
      for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) {
        const x = -14 + q * 2.4 + (q > 2 ? 17.6 : 0), z = -3 + r * 3;
        if (x > 0) continue;
        F.cyl(x, 0.08, z, 0.14, 0.25, 0, shade(c, 0.1), 'stone');
      }
      /* boundary wall with piers, coping, and two gates */
      function wall(ax, az, bx, bz, out, gaps) {
        const alongX = az === bz, L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az);
        const lo = alongX ? Math.min(ax, bx) : Math.min(az, bz);
        const cuts = [lo].concat(...(gaps || []).map((g) => [g[0], g[1]])).concat([lo + L]);
        for (let i = 0; i < cuts.length; i += 2) {
          const a = cuts[i], b = cuts[i + 1], m = (a + b) / 2, len = b - a;
          if (len <= 0.05) continue;
          const cx = alongX ? m : ax, cz = alongX ? az : m;
          F.box(cx, 0, cz, alongX ? len : WT, WH, alongX ? WT : len, 0, c, 'stone');
          F.box(cx, WH, cz, alongX ? len + 0.1 : WT + 0.25, 0.16, alongX ? WT + 0.25 : len + 0.1, 0, cop, 'stone');
          F.box(cx, 0, cz, alongX ? len : WT + 0.3, 0.3, alongX ? WT + 0.3 : len, 0, cop, 'stone');
          const np = Math.max(1, Math.round(len / 5.5));
          for (let k = 0; k <= np; k++) {
            const t = a + len * k / np, px = alongX ? t : ax, pz = alongX ? az : t;
            F.box(px, 0, pz, 0.85, WH + 0.45, 0.85, 0, shade(c, 0.05), 'stone');
            F.box(px, WH + 0.45, pz, 1.05, 0.14, 1.05, 0, cop, 'stone');
            F.pyrRoof(px, WH + 0.59, pz, 0.8, 0.35, 0.8, 0, cop, 'stone');
          }
        }
        void out;
      }
      wall(-X, Z, X, Z, 0, [[-2.8, 2.8]]);
      wall(-X, -Z, X, -Z, 1);
      wall(-X, -Z, -X, Z, 3);
      wall(X, -Z, X, Z, 2, [[2.5, 5.5]]);
      /* main gate: two Velothi pylons, a timber lintel beam, banners, flames */
      const capC = F.pick([0x4a3f3a, 0x3f4a52, 0x6b7a4a]);
      [-1, 1].forEach((k) => {
        const top = K.pylon(k * 3.5, Z, 0, 0.95, 4.2, shade(c, 0.04), capC);
        K.flame(k * 3.5, top - 0.05, Z, 0.5);
        F.box(k * 3.5, 0, Z, 2.2, 0.4, 2.2, 0, cop, 'stone');
        K.banner(k * 3.5, 3.6, Z + 0.72, 0, 1.0, 2.4, k < 0 ? GREEN : GOLD, k < 0 ? GOLD : GREEN);
        F.box(k * 2.0, 0.08, Z + 0.9, 0.14, 2.0, 1.9, k * 0.6, TIMBER2, 'wood');
      });
      F.box(0, 3.7, Z, 7.9, 0.4, 0.45, 0, TIMBER, 'wood');
      F.box(0, 2.6, Z + 0.25, 3.2, 1.0, 0.08, 0, GREEN, 'cloth');
      F.box(0, 2.6, Z + 0.3, 3.3, 0.18, 0.08, 0, GOLD, 'cloth');
      /* side gate on the right wall */
      [2.5, 5.5].forEach((z, i) => {
        F.box(X, 0, z, 1.0, 2.4, 1.0, 0, shade(c, 0.05), 'stone');
        F.box(X, 2.4, z, 1.2, 0.18, 1.2, 0, cop, 'stone');
        F.box(X - 0.7, 0.08, z + (i ? -0.7 : 0.7), 1.4, 1.6, 0.1, i ? -0.3 : 0.3, TIMBER2, 'wood');
      });

      /* ---- reviewing stand: dais, stepped seats, canopy, banners */
      const SZ = -Z + 3.6, SW = 15, SD = 5.6, SH = 1.6;
      F.box(0, 0, SZ, SW, SH, SD, 0, c, 'stone');
      F.box(0, SH, SZ, SW + 0.3, 0.18, SD + 0.3, 0, cop, 'stone');
      F.box(0, 0, SZ, SW + 0.5, 0.35, SD + 0.5, 0, cop, 'stone');
      for (let i = 0; i < 5; i++) F.box(0, 0, SZ + SD / 2 + 0.2 + (4 - i) * 0.45, 4.2 - i * 0.1, SH * (i + 1) / 5, 0.45, 0, shade(c, i % 2 ? 0.03 : -0.03), 'stone');
      [-1, 1].forEach((k) => F.box(k * 2.25, 0, SZ + SD / 2 + 1.1, 0.35, SH + 0.5, 2.3, 0, cop, 'stone'));
      /* front face panels with shields */
      [-5.5, -3.2, 3.2, 5.5].forEach((x, i) => {
        K.fbox(x, 0.35, SZ + SD / 2, 0, 1.8, 1.0, 0.06, shade(c, -0.1), 'stone');
        F.rod(x, 0.85, SZ + SD / 2 + 0.06, x, 0.85, SZ + SD / 2 + 0.2, 0.4, i % 2 ? GOLD : 0x7a4a3a, 'metal');
      });
      [-1, 1].forEach((k) => K.win(k * SW / 2, 0.45, SZ, k > 0 ? 2 : 3, 0.8, 0.8, c, { bars: true }));
      /* seats: two stepped benches along the back of the dais */
      F.box(0, SH + 0.18, SZ - 1.6, SW - 1.4, 0.5, 1.2, 0, shade(c, 0.05), 'stone');
      F.box(0, SH + 0.18, SZ - 2.4, SW - 1.4, 1.0, 0.8, 0, shade(c, 0.08), 'stone');
      F.box(0, SH + 0.68, SZ - 1.6, SW - 2.0, 0.08, 1.0, 0, 0x7a2028, 'cloth');
      F.box(0, SH + 0.18, SZ - 0.6, 1.2, 1.3, 0.7, 0, TIMBER, 'wood');
      F.box(0, SH + 1.48, SZ - 0.6, 1.4, 0.1, 0.9, -0.0, TIMBER2, 'wood');
      F.box(-2.8, SH + 0.18, SZ - 1.7, 1.2, 1.9, 0.9, 0, TIMBER, 'wood');
      F.box(-2.8, SH + 0.68, SZ - 1.1, 1.2, 0.12, 1.0, 0, TIMBER2, 'wood');
      /* canopy: posts, a sloping cloth roof, striped valance, hangings */
      const PY = SH + 0.18, cf = SZ + SD / 2 - 0.4, cb = SZ - SD / 2 + 0.4, cw = SW - 0.8;
      [-cw / 2, -cw / 6, cw / 6, cw / 2].forEach((x) => {
        F.cyl(x, PY, cf, 0.14, 3.6, 0, TIMBER, 'wood');
        F.cyl(x, PY, cb, 0.14, 4.4, 0, TIMBER, 'wood');
        F.cyl(x, PY + 3.6, cf, 0.2, 0.2, 0, GOLD, 'metal');
      });
      F.box(0, PY + 3.5, cf, cw + 0.3, 0.18, 0.18, 0, TIMBER2, 'wood');
      F.box(0, PY + 4.3, cb, cw + 0.3, 0.18, 0.18, 0, TIMBER2, 'wood');
      const cloth = F.pick(SAIL);
      K.slope(0, PY + 4.55, cb - 0.3, 0, PY + 3.7, cf + 0.5, cw + 0.8, 0.08, cloth, 'cloth');
      for (let i = 0; i < 12; i++) {
        const x = -cw / 2 - 0.1 + (cw + 0.2) * (i + 0.5) / 12;
        F.box(x, PY + 3.1, cf + 0.52, (cw + 0.2) / 12, 0.55, 0.05, 0, i % 2 ? GREEN : GOLD, 'cloth');
      }
      [-1, 1].forEach((k) => F.box(k * (cw / 2 + 0.35), PY + 3.45, SZ, 0.05, 0.55, SD - 0.6, 0, GREEN, 'cloth'));
      [-cw / 3, cw / 3].forEach((x, i) => F.box(x, PY + 1.4, cf + 0.1, 1.0, 2.0, 0.05, 0, i ? GOLD : GREEN, 'cloth'));
      /* flagpoles behind the stand and at the corners of the field */
      for (let i = 0; i < 7; i++) K.flagpole(-12 + i * 4, -Z + 0.9, 0, 8.5, [GREEN, GOLD, GREEN, 0x7a2028, GREEN, GOLD, GREEN][i], 1);
      K.flagpole(-X + 2, Z - 2, 0.08, 6.5, GOLD, 1);
      K.flagpole(X - 2, Z - 2, 0.08, 6.5, GREEN, -1);

      /* ---- weapon racks along the left wall, dummies in the left field */
      [-8, -2.5, 3].forEach((z) => K.rack(-X + 1.1, z, 3.6, false, 9));
      for (let r = 0; r < 2; r++) for (let q = 0; q < 4; q++) K.dummy(-18 + q * 3, 7 + r * 3.6, F.rr(-0.3, 0.3));
      F.box(-19.8, 0.08, 10.6, 0.5, 0.45, 2.6, 0, TIMBER, 'wood');
      for (let i = 0; i < 4; i++) F.rod(-19.8, 0.53, 9.6 + i * 0.6, -19.8, 1.4, 9.7 + i * 0.6, 0.04, TIMBER3, 'wood');

      /* ---- archery range on the right: butts, shooting line, quivers */
      [12, 15.5, 19, 22.5].forEach((x) => { K.butt(x, -9, 1); F.box(x, 0.08, -9.6, 1.8, 0.3, 0.6, 0, shade(earth, -0.1), 'stone'); });
      F.box(17.2, 0.08, 9, 13, 0.1, 0.35, 0, cop, 'stone');
      [11, 14.5, 18, 21.5].forEach((x) => {
        F.rod(x, 0.08, 9, x, 1.3, 9, 0.05, TIMBER, 'wood');
        F.cyl(x + 0.3, 0.08, 9.6, 0.16, 0.7, 0, 0x6b4a2a, 'wood');
        for (let i = 0; i < 4; i++) F.rod(x + 0.3, 0.7, 9.6, x + 0.3 + F.rr(-0.08, 0.08), 1.1, 9.6 + F.rr(-0.08, 0.08), 0.012, TIMBER3, 'wood');
      });
      F.box(17.2, 0.08, -11, 13, 1.8, 0.4, 0, TIMBER2, 'wood');
      F.box(17.2, 1.88, -11, 13.2, 0.12, 0.6, 0, TIMBER, 'wood');

      /* ---- armoury shed, front-left corner */
      const AX = -X + 4, AZ = Z - 4.2, sc = shade(c, -0.05);
      F.box(AX, 0.08, AZ, 5.4, 3.0, 4.6, 0, sc, 'stone');
      F.box(AX, 3.08, AZ, 5.8, 0.25, 5.0, 0, cop, 'stone');
      F.pyrRoof(AX, 3.33, AZ, 6.4, 1.6, 5.6, 0, F.pick(ROOF), 'roof');
      K.door(AX + 2.7, 0.08, AZ - 0.4, 2, 1.4, 2.3, sc);
      K.win(AX, 1.3, AZ - 2.3, 1, 0.9, 0.8, sc, { bars: true });
      K.win(AX, 1.3, AZ + 2.3, 0, 0.9, 0.8, sc, { bars: true });
      K.win(AX - 2.7, 1.3, AZ, 3, 0.9, 0.8, sc, { bars: true });
      F.box(AX + 2.75, 2.5, AZ + 1.2, 0.08, 0.7, 1.0, 0, 0x8a7a5a, 'metal');
      K.rack(AX + 3.3, AZ + 1.5, 2.2, false, 5);
      K.barrel(AX + 3.4, 0.08, AZ - 2.0); K.barrel(AX + 4.3, 0.08, AZ - 2.3);
      K.stack(AX - 1.5, AZ - 4.2, 3, 0.8);
      /* water trough by the side gate */
      F.box(X - 2.2, 0.08, 1.2, 1.0, 0.75, 3.0, 0, shade(c, -0.15), 'stone');
      F.box(X - 2.2, 0.8, 1.2, 0.8, 0.05, 2.8, 0, 0x2a3a3a, 'glass');
    }
  });

  /* ====================================================================
     voth_army_camp
     ==================================================================== */
  ASSET({
    key: 'voth_army_camp', name: 'Army Camp', culture: 'voth', family: 'military',
    source: 'voth-military',
    districts: ['outskirts', 'wilds', 'wall'], wealth: [0.1, 0.6],
    blurb: 'A field camp inside a ditch-and-palisade: rows of ridge and bell tents, a command pavilion, cookfires, guar pens, supply wagons and a watch platform.',
    w: 64, d: 56, h: 10,
    build: function (F) {
      const K = kit(F);
      const earth = F.pick(MUD), bank = shade(earth, 0.08), ditch = shade(earth, -0.55);
      const X = 26, Z = 20, stake = F.pick([0x5d5140, 0x6a5c48, 0x4e4536]);
      const tentC = () => shade(F.pick(SAIL), F.rr(-0.12, 0.02));
      /* trodden ground */
      F.box(0, 0, 0, 2 * X, 0.05, 2 * Z, 0, shade(earth, 0.05), 'stone');
      F.box(0, 0.05, 6, 4.5, 0.03, 2 * Z - 12, 0, shade(earth, -0.08), 'stone');
      F.box(0, 0.05, -3, 2 * X - 8, 0.03, 3.5, 0, shade(earth, -0.08), 'stone');
      /* ---- rampart bank + palisade + ditch + counterscarp, per side */
      function side(ax, az, bx, bz, out, gap) {
        const alongX = az === bz, on = K.nrm(out);
        const lo = alongX ? Math.min(ax, bx) : Math.min(az, bz), hi = alongX ? Math.max(ax, bx) : Math.max(az, bz);
        const segs = gap ? [[lo, gap[0]], [gap[1], hi]] : [[lo, hi]];
        const fixed = alongX ? az : ax;
        const at = (u, off) => alongX ? [u, fixed + on[1] * off] : [fixed + on[0] * off, u];
        const bx2 = (u0, u1, off, wid, y, h, col, fam) => {
          const m = (u0 + u1) / 2, L = u1 - u0, p = at(m, off);
          F.box(p[0], y, p[1], alongX ? L : wid, h, alongX ? wid : L, 0, col, fam || 'stone');
        };
        segs.forEach((sg) => {
          const u0 = sg[0], u1 = sg[1];
          bx2(u0, u1, -1.6, 3.6, 0, 0.6, bank);
          bx2(u0, u1, -1.4, 2.6, 0.6, 0.6, shade(bank, 0.05));
          bx2(u0, u1, -0.1, 0.3, 1.2, 2.1, shade(stake, -0.15), 'wood');
          bx2(u0, u1, -0.4, 0.14, 2.3, 0.14, TIMBER2, 'wood');
          const n = Math.floor((u1 - u0) / 0.42);
          for (let i = 0; i < n; i++) {
            const u = u0 + (i + 0.5) * (u1 - u0) / n, p = at(u, 0.12), hh = 2.4 + ((i * 7) % 5) * 0.08;
            F.box(p[0], 1.1, p[1], 0.34, hh, 0.34, 0, i % 3 ? stake : shade(stake, 0.08), 'wood');
            F.frustum(p[0], 1.1 + hh, p[1], 0.17, 0.02, 0.45, 0, shade(stake, 0.12), 'wood', 4);
          }
        });
        /* ditch and counterscarp run the full side, ends mitred by overlap */
        const e = alongX ? 0 : 0.012;
        bx2(lo - 2.3, hi + 2.3, 1.4, 1.8, 0, 0.35 + e, shade(bank, -0.05));
        bx2(lo - 4.9, hi + 4.9, 3.6, 2.6, 0, 0.04 + e, ditch);
        bx2(lo - 6.5, hi + 6.5, 5.7, 1.6, 0, 0.5 + e, bank);
        /* stakes set in the berm as an obstacle line */
        for (let u = lo + 1; u < hi - 0.5; u += 1.6) {
          if (gap && u > gap[0] - 1.5 && u < gap[1] + 1.5) continue;
          const p = at(u, 1.5);
          F.beam(p[0], 0.3, p[1], p[0] + on[0] * 0.9, 1.2, p[1] + on[1] * 0.9, 0.1, 0.1, stake, 'wood');
        }
      }
      side(-X, Z, X, Z, 0, [-2.6, 2.6]);
      side(-X, -Z, X, -Z, 1);
      side(-X, -Z, -X, Z, 3);
      side(X, -Z, X, Z, 2);
      /* corners of the bank filled */
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((q) => F.box(q[0] * (X - 1.6), 0, q[1] * (Z - 1.6), 3.6, 1.2, 3.6, 0, bank, 'stone'));

      /* ---- gate: two log towers, open leaves, crossbeam, plank bridge */
      [-1, 1].forEach((k) => {
        const gx = k * 4.0, gz = Z - 0.6;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((q) => F.rod(gx + q[0] * 1.1, 0, gz + q[1] * 1.1, gx + q[0] * 1.1, 6.2, gz + q[1] * 1.1, 0.16, stake, 'wood'));
        F.box(gx, 4.4, gz, 2.9, 0.22, 2.9, 0, TIMBER, 'wood');
        [0, 1, 2, 3].forEach((s) => {
          const n = K.nrm(s);
          F.box(gx + n[0] * 1.38, 4.62, gz + n[1] * 1.38, n[1] ? 2.9 : 0.1, 1.0, n[1] ? 0.1 : 2.9, 0, TIMBER2, 'wood');
        });
        K.slope(gx, 7.0, gz - 1.6, gx, 6.1, gz + 1.7, 3.2, 0.08, tentC(), 'cloth');
        F.beam(gx + k * 1.1, 0.2, gz + 1.1, gx + k * 1.1, 4.4, gz - 1.1, 0.12, 0.12, TIMBER, 'wood');
        for (let i = 0; i < 6; i++) F.box(gx - k * 1.25, 0.6 + i * 0.66, gz - 1.1, 0.5, 0.07, 0.07, 0, TIMBER2, 'wood');
        F.box(k * 2.2, 0, Z + 0.4, 0.2, 2.8, 2.4, k * 0.9, TIMBER2, 'wood');
      });
      F.box(0, 5.7, Z - 0.6, 10.5, 0.3, 0.3, 0, TIMBER, 'wood');
      F.box(0, 3.9, Z - 0.4, 2.6, 1.8, 0.06, 0, GREEN, 'cloth');
      F.box(0, 3.9, Z - 0.36, 2.7, 0.2, 0.06, 0, GOLD, 'cloth');
      F.box(0, 0.35, Z + 3.6, 4.2, 0.2, 6.2, 0, TIMBER3, 'wood');
      [-1, 1].forEach((k) => F.box(k * 2.0, 0.55, Z + 3.6, 0.15, 0.6, 6.2, 0, TIMBER, 'wood'));

      /* ---- tents */
      function ridge(x, z, L, W, H, alongX, col) {
        const hw = W / 2, eave = 0.35;
        if (alongX) {
          K.slope(x, H, z, x, eave, z + hw, L, 0.06, col, 'cloth');
          K.slope(x, H, z, x, eave, z - hw, L, 0.06, shade(col, -0.06), 'cloth');
          [-1, 1].forEach((k) => {
            F.pyrRoof(x + k * L / 2, 0, z, 0.06, H, W, 0, shade(col, -0.1), 'cloth');
            F.rod(x + k * (L / 2 + 0.05), 0, z, x + k * (L / 2 + 0.05), H + 0.35, z, 0.05, TIMBER, 'wood');
            F.rod(x + k * (L / 2 + 0.05), H, z, x + k * (L / 2 + 1.1), 0, z, 0.015, ROPE, 'wood');
            [-1, 1].forEach((j) => F.rod(x + k * L * 0.3, eave + 0.05, z + j * (hw + 0.02), x + k * L * 0.3, 0, z + j * (hw + 0.8), 0.012, ROPE, 'wood'));
          });
          F.rod(x - L / 2 - 0.1, H + 0.05, z, x + L / 2 + 0.1, H + 0.05, z, 0.05, TIMBER, 'wood');
          F.pyrRoof(x + L / 2 + 0.05, 0, z, 0.08, H * 0.7, W * 0.45, 0, 0x2a241e, 'wood');
        } else {
          K.slope(x, H, z, x + hw, eave, z, L, 0.06, col, 'cloth');
          K.slope(x, H, z, x - hw, eave, z, L, 0.06, shade(col, -0.06), 'cloth');
          [-1, 1].forEach((k) => {
            F.pyrRoof(x, 0, z + k * L / 2, W, H, 0.06, 0, shade(col, -0.1), 'cloth');
            F.rod(x, 0, z + k * (L / 2 + 0.05), x, H + 0.35, z + k * (L / 2 + 0.05), 0.05, TIMBER, 'wood');
            F.rod(x, H, z + k * (L / 2 + 0.05), x, 0, z + k * (L / 2 + 1.1), 0.015, ROPE, 'wood');
          });
          F.rod(x, H + 0.05, z - L / 2 - 0.1, x, H + 0.05, z + L / 2 + 0.1, 0.05, TIMBER, 'wood');
          F.pyrRoof(x, 0, z + L / 2 + 0.05, W * 0.45, H * 0.7, 0.08, 0, 0x2a241e, 'wood');
        }
      }
      function bell(x, z, r, H, col, pennant) {
        F.cyl(x, 0.05, z, r, 1.0, 0, shade(col, -0.08), 'cloth');
        F.cone(x, 1.05, z, r * 1.08, H - 1.05, 0, col, 'cloth');
        F.cyl(x, 1.0, z, r * 1.1, 0.25, 0, pennant, 'cloth');
        F.rod(x, H - 0.2, z, x, H + 0.8, z, 0.05, TIMBER, 'wood');
        F.box(x + 0.35, H + 0.45, z, 0.7, 0.3, 0.03, 0, pennant, 'cloth');
        F.box(x, 0.05, z + r - 0.02, 0.9, 1.5, 0.08, 0, 0x2a241e, 'wood');
        F.box(x + 0.6, 0.05, z + r + 0.1, 0.6, 1.6, 0.05, -0.5, shade(col, -0.04), 'cloth');
        for (let i = 0; i < 6; i++) {
          const a = i * TAU / 6 + 0.3;
          F.rod(x + Math.cos(a) * r * 0.7, H * 0.55, z + Math.sin(a) * r * 0.7, x + Math.cos(a) * (r + 1.3), 0, z + Math.sin(a) * (r + 1.3), 0.012, ROPE, 'wood');
          F.box(x + Math.cos(a) * (r + 1.3), 0, z + Math.sin(a) * (r + 1.3), 0.08, 0.3, 0.08, 0, TIMBER, 'wood');
        }
      }
      [-17, -13, -9, 9, 13, 17].forEach((x) => [-0.5, 4, 8.5, 13].forEach((z) => ridge(x + F.rr(-0.2, 0.2), z, 2.6, 3.0, 2.0, false, tentC())));
      [[-18, -6.8], [-13, -6.8], [13, -6.8], [18, -6.8]].forEach((q, i) => bell(q[0], q[1], 1.9, 3.6, tentC(), i % 2 ? GOLD : GREEN));
      /* bedrolls and kit outside a few tents */
      [[-15, 2], [11, 6.5], [15, 11]].forEach((q) => { F.rod(q[0], 0.15, q[1], q[0] + 1.3, 0.15, q[1], 0.15, F.pick([0x8a2f2a, 0x5c4028]), 'cloth'); F.cyl(q[0] + 0.3, 0, q[1] + 0.7, 0.3, 0.3, 0, IRON, 'metal'); });

      /* ---- command pavilion: walls, hip roof, valance, porch, map table */
      const PZ = -12, PW = 10, PD = 7, pc = F.pick(SAIL);
      F.box(0, 0.05, PZ, PW, 2.6, PD, 0, shade(pc, -0.05), 'cloth');
      F.box(0, 2.65, PZ, PW + 0.3, 0.45, PD + 0.3, 0, GREEN, 'cloth');
      F.box(0, 2.65, PZ, PW + 0.35, 0.12, PD + 0.35, 0, GOLD, 'cloth');
      F.pyrRoof(0, 3.1, PZ, PW + 0.8, 3.2, PD + 0.8, 0, pc, 'cloth');
      [-1, 1].forEach((k) => {
        F.rod(k * 2.2, 0, PZ, k * 2.2, 7.2, PZ, 0.09, TIMBER, 'wood');
        F.box(k * 2.2 + 0.6, 6.4, PZ, 1.2, 0.6, 0.03, 0, k < 0 ? GREEN : GOLD, 'cloth');
      });
      /* entrance: dark opening with tied-back flaps, porch awning, standards */
      F.box(0, 0.05, PZ + PD / 2, 2.4, 2.3, 0.08, 0, 0x2a241e, 'wood');
      [-1, 1].forEach((k) => F.box(k * 1.45, 0.05, PZ + PD / 2 + 0.15, 0.55, 2.3, 0.12, k * 0.4, shade(pc, -0.1), 'cloth'));
      [-2, 2].forEach((x) => F.rod(x, 0.05, PZ + PD / 2 + 2.6, x, 2.7, PZ + PD / 2 + 2.6, 0.07, TIMBER, 'wood'));
      K.slope(0, 2.95, PZ + PD / 2, 0, 2.5, PZ + PD / 2 + 2.8, 4.6, 0.06, shade(pc, 0.05), 'cloth');
      F.box(0, 2.3, PZ + PD / 2 + 2.78, 4.6, 0.3, 0.04, 0, GREEN, 'cloth');
      F.box(0.0, 0.05, PZ + PD / 2 + 1.5, 1.8, 0.85, 1.0, 0, TIMBER, 'wood');
      F.box(0.0, 0.9, PZ + PD / 2 + 1.5, 1.6, 0.03, 0.9, 0, 0xcbb08e, 'cloth');
      [-1.2, 1.2].forEach((x) => F.box(x, 0.05, PZ + PD / 2 + 1.5, 0.5, 0.5, 0.5, 0, TIMBER2, 'wood'));
      [-4, 4].forEach((x, i) => K.flagpole(x, PZ + PD / 2 + 1.2, 0.05, 5.5, i ? GOLD : GREEN, i ? 1 : -1, i ? GREEN : GOLD));
      /* side and rear elevations: window panels and guy lines */
      [-1, 1].forEach((k) => {
        F.box(k * (PW / 2 + 0.02), 1.0, PZ, 0.05, 0.9, 1.6, 0, 0x2a241e, 'wood');
        F.box(0 + k * 2.5, 1.0, PZ - PD / 2 - 0.02, 1.4, 0.9, 0.05, 0, 0x2a241e, 'wood');
        [-2.5, 0, 2.5].forEach((dz) => { F.rod(k * PW / 2, 2.7, PZ + dz, k * (PW / 2 + 2.0), 0.05, PZ + dz, 0.015, ROPE, 'wood'); F.box(k * (PW / 2 + 2.0), 0, PZ + dz, 0.1, 0.3, 0.1, 0, TIMBER, 'wood'); });
      });

      /* ---- cookfires with tripods, pots and log seats */
      function fire(x, z) {
        for (let i = 0; i < 7; i++) { const a = i * TAU / 7; F.blob(x + Math.cos(a) * 0.75, 0.15, z + Math.sin(a) * 0.75, 0.2, 0.28, a, 0x5a5550, 'stone'); }
        F.rod(x - 0.5, 0.15, z - 0.2, x + 0.5, 0.2, z + 0.2, 0.09, 0x3a2f22, 'wood');
        F.rod(x - 0.3, 0.15, z + 0.4, x + 0.3, 0.2, z - 0.4, 0.09, 0x3a2f22, 'wood');
        F.cone(x, 0.1, z, 0.4, 0.8, 0, FIRE, 'glow');
        F.cone(x, 0.1, z, 0.2, 0.55, 0, 0xffe0a0, 'glow');
        [0, 1, 2].forEach((i) => { const a = i * TAU / 3; F.rod(x + Math.cos(a) * 0.9, 0, z + Math.sin(a) * 0.9, x, 1.7, z, 0.035, TIMBER, 'wood'); });
        F.rod(x, 1.7, z, x, 1.15, z, 0.012, IRON, 'metal');
        F.cyl(x, 0.75, z, 0.32, 0.42, 0, IRON2, 'metal');
        F.cyl(x, 1.17, z, 0.34, 0.05, 0, IRON, 'metal');
        [[-1.9, 0], [1.9, 0]].forEach((q) => F.rod(x + q[0], 0.22, z - 0.9, x + q[0], 0.22, z + 0.9, 0.22, TIMBER3, 'wood'));
      }
      fire(-4.6, 1.5); fire(4.6, 1.5); fire(-4.6, 10.5); fire(4.6, 10.5);

      /* ---- guar pen and picket line, back-left */
      function guar(x, z, ry, col) {
        /* a pack guar: leaning capsule body, heavy hind legs, small arms,
           long tapering tail, blunt head on a short neck, saddle bags */
        const c = Math.cos(ry), s = Math.sin(ry);
        const P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
        const hip = P(0, -0.25), sh = P(0, 0.35);
        F.rod(hip[0], 1.0, hip[1], sh[0], 1.55, sh[1], 0.46, col, 'cloth');
        F.ball(hip[0], 1.0, hip[1], 0.46, col, 'cloth');
        F.ball(sh[0], 1.55, sh[1], 0.42, shade(col, 0.06), 'cloth');
        [-1, 1].forEach((k) => {
          const th = P(k * 0.34, -0.2), kn = P(k * 0.38, 0.2), ft = P(k * 0.36, -0.05);
          F.rod(th[0], 1.0, th[1], kn[0], 0.55, kn[1], 0.17, shade(col, -0.05), 'cloth');
          F.rod(kn[0], 0.55, kn[1], ft[0], 0.08, ft[1], 0.11, shade(col, -0.1), 'cloth');
          const t2 = P(k * 0.36, 0.2);
          F.box(t2[0], 0, t2[1], 0.28, 0.12, 0.5, ry, shade(col, -0.25), 'cloth');
          const a0 = P(k * 0.32, 0.55), a1 = P(k * 0.36, 0.85);
          F.rod(a0[0], 1.45, a0[1], a1[0], 1.1, a1[1], 0.06, col, 'cloth');
          const bag = P(k * 0.52, -0.05);
          F.box(bag[0], 0.95, bag[1], 0.28, 0.55, 0.7, ry, k > 0 ? 0x6b4a2a : 0x5c4028, 'cloth');
        });
        const t0 = P(0, -0.6), t1 = P(0, -1.3), t2 = P(0, -2.0);
        F.rod(t0[0], 0.9, t0[1], t1[0], 0.5, t1[1], 0.2, col, 'cloth');
        F.rod(t1[0], 0.5, t1[1], t2[0], 0.12, t2[1], 0.1, shade(col, -0.05), 'cloth');
        const n0 = P(0, 0.55), n1 = P(0, 0.85), n2 = P(0, 1.35);
        F.rod(n0[0], 1.75, n0[1], n1[0], 1.95, n1[1], 0.2, col, 'cloth');
        F.rod(n1[0], 1.95, n1[1], n2[0], 1.85, n2[1], 0.22, shade(col, 0.08), 'cloth');
        F.ball(n2[0], 1.85, n2[1], 0.22, shade(col, 0.08), 'cloth');
        const ey = P(0, 1.05);
        F.box(ey[0], 2.05, ey[1], 0.46, 0.08, 0.1, ry, 0x1c1a16, 'wood');
        const sb = P(0, -0.02);
        F.box(sb[0], 1.35, sb[1], 0.9, 0.12, 0.8, ry, 0x7a2028, 'cloth');
      }
      const GX0 = -22, GX1 = -12.5, GZ0 = -16, GZ1 = -10.3;
      const fence = (ax, az, bx, bz) => {
        const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.2));
        for (let i = 0; i <= n; i++) { const t = i / n; F.box(ax + (bx - ax) * t, 0, az + (bz - az) * t, 0.2, 1.4, 0.2, 0, stake, 'wood'); }
        [0.55, 1.15].forEach((y) => F.rod(ax, y, az, bx, y, bz, 0.06, TIMBER3, 'wood'));
      };
      fence(GX0, GZ0, GX1, GZ0); fence(GX0, GZ0, GX0, GZ1); fence(GX1, GZ0, GX1, GZ1 - 2.2);
      fence(GX0, GZ1, GX1 - 3, GZ1);
      F.box((GX0 + GX1) / 2, 0.05, (GZ0 + GZ1) / 2, GX1 - GX0 - 0.3, 0.03, GZ1 - GZ0 - 0.3, 0, shade(earth, -0.12), 'stone');
      guar(-19.5, -13.6, 0.6, F.pick(GUAR)); guar(-15.2, -12.6, -0.9, F.pick(GUAR)); guar(-17.2, -14.3, 2.6, F.pick(GUAR));
      F.box(-20.5, 0.05, -11.8, 2.4, 0.6, 0.8, 0, TIMBER, 'wood');
      F.box(-20.5, 0.65, -11.8, 2.2, 0.05, 0.6, 0, STRAW, 'cloth');
      [0, 1, 2].forEach((i) => F.box(-13.2, 0.05 + (i === 2 ? 0.7 : 0), -9.2 + (i % 2) * 1.0, 1.4, 0.7, 0.9, 0, STRAW, 'cloth'));
      /* picket line by the left bank */
      [-7, -1].forEach((z) => F.rod(-21.2, 0, z, -21.2, 1.5, z, 0.08, stake, 'wood'));
      F.rod(-21.2, 1.35, -7, -21.2, 1.35, -1, 0.025, ROPE, 'wood');
      guar(-20.2, -5.3, -1.57, F.pick(GUAR)); guar(-20.2, -2.8, -1.57, F.pick(GUAR));

      /* ---- supply wagons, crates, barrels, back-right */
      function wagon(x, z, ry, covered) {
        const c = Math.cos(ry), s = Math.sin(ry);
        const P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
        const bc = F.pick([0x6b5a44, 0x5a4a38]);
        F.box(x, 0.8, z, 1.7, 0.2, 3.4, ry, bc, 'wood');
        [-1, 1].forEach((k) => {
          const sp = P(k * 0.82, 0);
          F.box(sp[0], 1.0, sp[1], 0.08, 0.5, 3.4, ry, shade(bc, 0.08), 'wood');
          [-1.05, 1.05].forEach((v) => {
            const w = P(k * 1.0, v);
            if (Math.abs(ry) < 0.01) K.wheel(w[0], 0.55, w[1], 0.55, true);
            else F.rod(w[0] - c * 0.08, 0.55, w[1] + s * 0.08, w[0] + c * 0.08, 0.55, w[1] - s * 0.08, 0.55, TIMBER2, 'wood');
          });
        });
        const e = P(0, 1.7), t = P(0, 3.4);
        F.rod(e[0], 0.7, e[1], t[0], 0.45, t[1], 0.06, TIMBER, 'wood');
        const a0 = P(0, -1.05), a1 = P(0, 1.05);
        [a0, a1].forEach((a) => F.rod(a[0] - c * 1.0, 0.55, a[1] + s * 1.0, a[0] + c * 1.0, 0.55, a[1] - s * 1.0, 0.05, IRON, 'metal'));
        if (covered) {
          const b0 = P(0, -1.55), b1 = P(0, 1.55);
          F.rod(b0[0], 1.1, b0[1], b1[0], 1.1, b1[1], 0.82, F.pick(SAIL), 'cloth');
        } else {
          const q = P(0, -0.7); K.crate(q[0], 1.0, q[1], 0.8, ry);
          const q2 = P(0, 0.4); F.rod(q2[0] - c * 0.6, 1.3, q2[1] + s * 0.6, q2[0] + c * 0.6, 1.3, q2[1] - s * 0.6, 0.28, 0xa89878, 'cloth');
          const q3 = P(0.1, 1.2); K.barrel(q3[0], 1.0, q3[1], 0.3, 0.7);
        }
      }
      wagon(13.5, -13.6, 0, true); wagon(17.5, -13.6, 0, false); wagon(20.8, -9.0, 0, true);
      K.stack(9.2, -15.6, 8, 0.9); K.stack(10.4, -10.4, 5, 0.8);
      [[20.2, -15.8], [21.0, -15.6], [20.6, -14.9], [21.6, -14.6]].forEach((q) => K.barrel(q[0], 0.05, q[1]));
      for (let i = 0; i < 3; i++) F.rod(12.5 + i * 0.1, 0.25 + i * 0.35, -11.2, 12.6 + i * 0.1, 0.25 + i * 0.35, -9.7, 0.25, 0xa89878, 'cloth');

      /* ---- watch platform, front-right inside the bank */
      const WX = 20.5, WZ = 14.5, WY = 5.6;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((q) => F.rod(WX + q[0] * 1.35, 0, WZ + q[1] * 1.35, WX + q[0] * 1.2, WY + 2.2, WZ + q[1] * 1.2, 0.13, stake, 'wood'));
      [1.4, 3.6].forEach((y) => {
        F.beam(WX - 1.3, y, WZ + 1.3, WX + 1.3, y + 1.6, WZ + 1.3, 0.1, 0.1, TIMBER, 'wood');
        F.beam(WX - 1.3, y, WZ - 1.3, WX + 1.3, y + 1.6, WZ - 1.3, 0.1, 0.1, TIMBER, 'wood');
      });
      F.box(WX, WY, WZ, 3.2, 0.2, 3.2, 0, TIMBER, 'wood');
      [0, 1, 2, 3].forEach((s) => {
        const n = K.nrm(s);
        F.box(WX + n[0] * 1.55, WY + 1.0, WZ + n[1] * 1.55, n[1] ? 3.2 : 0.08, 0.1, n[1] ? 0.08 : 3.2, 0, TIMBER2, 'wood');
        if (s !== 3) F.box(WX + n[0] * 1.55, WY + 0.2, WZ + n[1] * 1.55, n[1] ? 3.2 : 0.06, 0.6, n[1] ? 0.06 : 3.2, 0, shade(TIMBER2, 0.1), 'wood');
      });
      F.box(WX, WY + 2.2, WZ, 3.6, 0.1, 3.6, 0, tentC(), 'cloth');
      [-0.4, 0.4].forEach((dz) => F.beam(WX - 2.6, 0, WZ + dz, WX - 1.6, WY + 0.9, WZ + dz, 0.08, 0.08, TIMBER, 'wood'));
      for (let i = 1; i < 12; i++) { const t = i / 12; F.box(WX - 2.6 + t, t * (WY + 0.9), WZ, 0.06, 0.06, 0.8, 0, TIMBER2, 'wood'); }
      F.cyl(WX + 0.8, WY + 0.2, WZ - 0.8, 0.12, 0.4, 0, IRON2, 'metal');
      F.cone(WX + 0.8, WY + 0.6, WZ - 0.8, 0.2, 0.45, 0, FIRE, 'glow');
      K.flagpole(WX - 1.2, WZ - 1.2, WY + 2.2, 1.8, GREEN, 1);
      /* camp standard at the crossroads */
      K.flagpole(0, -3, 0.05, 7.5, GREEN, 1, GOLD);
      K.rack(7, -3.6, 3.0, true, 7); K.rack(-7, -3.6, 3.0, true, 7);
    }
  });
})();
