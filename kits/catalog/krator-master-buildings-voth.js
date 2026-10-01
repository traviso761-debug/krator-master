/* ======================================================================
   Voth — Building Registry (13 keys / 17 build "looks")
   culture: 'voth'   |  key prefix: voth_bldg_
   Requires krator-asset-engine.js (ASSET/F/shade/TAU) loaded first.

   House rules for this file
   -------------------------
   * F.frustum's r is a HALF-WIDTH. A sides:4 block spans 2*rBottom across at
     its base, flat faces square to the frame, so a tier's FRONT face sits at
     local z = +rBottom and slopes in to +rTop at the top. F.pyrRoof covers
     exactly w by d at the eaves. Nothing below carries a sqrt(2) fudge.
   * The local frame is handed: F.box(...,ry2,...) puts the box's width axis
     along local (cos ry2, -sin ry2). To lay a box TANGENT to a circle
     parameterised (r*cos a, r*sin a) in (lx, lz) you need ry2 = -(a + PI/2).
     Using ry2 = a turns every ring segment radially — see the arena.
   * Every building is detailed on all four elevations. The catalog is orbited
     and walked around, so a facade-only building reads as unfinished.
   * Helper closures are re-declared inside each build on purpose: this file is
     concatenated with the other registries into one global scope, so there may
     be no top-level declarations of any kind.
   ====================================================================== */

ASSET({
  key: 'voth_bldg_townhouse', name: 'Townhouse', culture: 'voth', family: 'housing',
  districts: ['poor', 'common', 'wealthy'], wealth: [0, 1],
  w: 20, d: 15, h: 23.5, variants: 4,
  /* a velothi tower and a one-storey hovel should not claim the same slot */
  variantDims: [
    { w: 17.5, d: 14, h: 20.5 },
    { w: 14.5, d: 15, h: 23.5 },
    { w: 17.5, d: 14, h: 18 },
    { w: 20, d: 12.5, h: 11.5 }
  ],
  build: function (F) {
    if (F.variant === 3) F.shift(-1.22, -0.32); /* centre the footprint on the origin (verify.py declared-size) */
    const stoneTones = [0x8c8579, 0x958e80, 0x8b8069];
    const roofTones = [0xb35a3a, 0xa04f32, 0xc36a42, 0x6b7a4a, 0x7a5a72, 0xc4813f];
    const plasterTones = [0x8b8069, 0x7e7460, 0x968b73];
    const doorC = 0x1c1a16, timber = 0x4a3a28, glow = 0xffcf87;
    const poor = F.wealth < 0.35, rich = F.wealth > 0.65;

    /* side: 0 = +z (front), 1 = -z, 2 = +x, 3 = -x */
    function nrm(s) { return s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0]; }
    function W(cx, cy, cz, ww, wh, s, wallC, trim) {
      const n = nrm(s), flat = n[1] !== 0;
      F.box(cx, cy, cz, flat ? ww : 0.3, wh, flat ? 0.3 : ww, 0, doorC, 'wood');
      if (!trim) return;
      const t = shade(wallC, -0.24);
      F.box(cx + n[0] * 0.14, cy - 0.26, cz + n[1] * 0.14,
        flat ? ww + 0.6 : 0.85, 0.26, flat ? 0.85 : ww + 0.6, 0, t, 'stone');
    }
    function SH(cx, cy, cz, ww, wh, s) {
      const n = nrm(s), flat = n[1] !== 0, sc = F.pick([0x5a4028, 0x46603f, 0x6b4a2a]);
      for (let k = -1; k <= 1; k += 2) {
        F.box(cx + (flat ? k * (ww / 2 + 0.25) : n[0] * 0.16), cy,
          cz + (flat ? n[1] * 0.16 : k * (ww / 2 + 0.25)),
          flat ? 0.46 : 0.16, wh, flat ? 0.16 : 0.46, 0, sc, 'wood');
      }
    }
    /* a row of openings along one elevation of a block */
    function row(L, s, ys, n, spread, ww, wh, wallC, trim, shut) {
      const nn = nrm(s), flat = nn[1] !== 0;
      for (let i = 0; i < n; i++) {
        const u = n === 1 ? 0 : -spread + 2 * spread * (i / (n - 1));
        const cx = L.x + (flat ? u : nn[0] * (L.w / 2 + 0.06));
        const cz = L.z + (flat ? nn[1] * (L.d / 2 + 0.06) : u);
        W(cx, L.y + ys, cz, ww, wh, s, wallC, trim);
        if (shut) SH(cx, L.y + ys, cz, ww, wh, s);
      }
    }
    function chimney(cx, cz, base, h, wallC) {
      F.box(cx, base, cz, 0.85, h, 0.85, 0, shade(wallC, -0.22), 'stone');
      F.box(cx, base + h, cz, 1.15, 0.55, 1.15, 0, shade(wallC, -0.34), 'stone');
      F.cyl(cx, base + h + 0.55, cz, 0.24, 0.5, 0, 0x3a3128, 'stone');
    }
    function drainpipe(cx, cz, base, h, wallC) {
      F.rod(cx, base, cz, cx, base + h, cz, 0.13, shade(wallC, -0.3), 'metal');
      F.box(cx, base + h - 0.15, cz, 0.5, 0.45, 0.5, 0, shade(wallC, -0.3), 'metal');
    }

    if (F.variant === 0) {
      /* hlaalu: stacked flat-roofed blocks, shrinking, jogged, corniced, parapet cap */
      const c = F.pick(stoneTones), cornice = shade(c, -0.13);
      const lev = [];
      let jx = 0, jz = 0, y = 0, fw = 16, fd = 12;
      [8, 6.5, 4.6].forEach(function (fh) {
        jx += F.rr(-0.5, 0.5); jz += F.rr(-0.35, 0.35);
        F.box(jx, y, jz, fw, fh, fd, 0, c, 'stone');
        F.box(jx, y + fh - 0.28, jz, fw + 0.35, 0.35, fd + 0.35, 0, cornice, 'stone');
        lev.push({ x: jx, z: jz, y: y, w: fw, d: fd, h: fh });
        y += fh; fw *= 0.8; fd *= 0.8;
      });
      const L0 = lev[0], L1 = lev[1], L2 = lev[2];
      F.box(L2.x, y, L2.z, L2.w * 0.9, 0.7, L2.d * 0.9, 0, cornice, 'stone');
      /* stepped plinth */
      F.box(0, 0, 0, 16.9, 0.5, 12.9, 0, shade(c, -0.24), 'stone');
      F.box(0, 0.5, 0, 16.4, 0.28, 12.4, 0, shade(c, -0.1), 'stone');

      /* door: recessed surround, leaf, threshold, lamp bracket */
      const fz = L0.z + 6;
      F.box(L0.x, 0, fz + 0.12, 2.7, 3.5, 0.45, 0, shade(c, -0.2), 'stone');
      F.box(L0.x, 0, fz + 0.3, 1.6, 2.6, 0.28, 0, doorC, 'wood');
      F.box(L0.x, 3.5, fz + 0.16, 3.1, 0.35, 0.6, 0, cornice, 'stone');
      F.box(L0.x, 0, fz + 0.55, 2.3, 0.26, 0.8, 0, shade(c, -0.26), 'stone');
      F.rod(L0.x - 1.7, 3.3, fz + 0.2, L0.x - 1.7, 3.3, fz + 0.85, 0.07, 0x3a2f22, 'metal');
      F.ball(L0.x - 1.7, 3.05, fz + 0.85, 0.24, glow, 'glow');

      /* windows on every elevation, two storeys in the tall ground block */
      row(L0, 0, 1.3, 2, 4.6, 1.3, 1.7, c, true, rich);
      row(L0, 2, 1.5, 2, 3.2, 1.2, 1.6, c, true, false);
      row(L0, 3, 1.5, 2, 3.2, 1.2, 1.6, c, true, false);
      row(L0, 1, 1.5, 2, 3.6, 1.2, 1.6, c, false, false);
      row(L0, 0, 4.9, 3, 5.2, 1.2, 1.6, c, true, rich);
      row(L0, 2, 4.9, 2, 3.2, 1.1, 1.5, c, true, false);
      row(L0, 3, 4.9, 2, 3.2, 1.1, 1.5, c, true, false);
      row(L0, 1, 4.9, 2, 3.6, 1.1, 1.5, c, false, false);
      row(L1, 0, 1.6, 2, 3.4, 1.2, 1.6, c, true, false);
      row(L1, 2, 1.6, 1, 0, 1.1, 1.5, c, true, false);
      row(L1, 3, 1.6, 1, 0, 1.1, 1.5, c, true, false);
      row(L1, 1, 1.6, 1, 0, 1.1, 1.5, c, false, false);
      row(L2, 0, 1.3, 1, 0, 1.1, 1.5, c, true, false);
      row(L2, 1, 1.3, 1, 0, 1.0, 1.4, c, false, false);

      /* projecting first-floor balcony on brackets, front */
      const by = L0.y + L0.h - 0.1, bz = L0.z + L0.d / 2;
      F.box(L0.x, by, bz + 0.55, 6.4, 0.32, 1.5, 0, shade(c, -0.2), 'stone');
      [-2.5, 2.5].forEach(function (ox) {
        F.beam(L0.x + ox, by, bz + 0.05, L0.x + ox, by - 1.1, bz + 1.25, 0.32, 0.32, timber, 'wood');
      });
      F.box(L0.x, by + 0.32, bz + 1.2, 6.4, 0.75, 0.18, 0, timber, 'wood');
      [-3.1, 3.1].forEach(function (ox) {
        F.box(L0.x + ox, by + 0.32, bz + 0.55, 0.18, 0.75, 1.5, 0, timber, 'wood');
      });

      /* roof furniture + rainwater goods */
      chimney(L1.x + L1.w / 2 - 1.2, L1.z - L1.d / 2 + 1.2, L1.y + L1.h, 2.6, c);
      if (F.chance(0.6)) chimney(L0.x - L0.w / 2 + 1.3, L0.z - L0.d / 2 + 1.3, L0.y + L0.h, 2.2, c);
      F.box(L2.x - 1.4, y + 0.7, L2.z, 1.0, 0.7, 1.0, 0, shade(c, -0.28), 'stone');
      drainpipe(L0.x + L0.w / 2 + 0.2, L0.z + L0.d / 2 - 0.5, 0.5, L0.h - 0.4, c);
      if (poor) {
        /* a lean-to props against the flank and a laundry line across the back */
        F.box(L0.x - L0.w / 2 - 1.1, 0.5, L0.z - 2, 2.4, 2.6, 4.2, 0, shade(c, 0.04), 'plaster');
        F.box(L0.x - L0.w / 2 - 1.1, 3.1, L0.z - 2, 2.7, 0.3, 4.5, 0, shade(c, -0.2), 'stone');
        F.rod(L0.x - 5, 6.4, L0.z - L0.d / 2 - 0.1, L0.x + 5, 6.0, L0.z - L0.d / 2 - 0.1, 0.05, 0x6b5a3a, 'rope');
        [-3, 0, 3].forEach(function (ox) {
          F.box(L0.x + ox, 5.1, L0.z - L0.d / 2 - 0.12, 0.9, 1.1, 0.06, 0, F.pick([0x8d7a5e, 0x7a6a8a, 0x9a6a5a]), 'cloth');
        });
      }

    } else if (F.variant === 1) {
      /* velothi: tapering Dunmer tower, stacked octagonal drums, banded, domed */
      const c = F.pick(stoneTones), bandC = shade(c, -0.1);
      const ry = Math.PI / 8;              /* turn a FACE to the front, not an edge */
      const apo = Math.cos(Math.PI / 8);   /* face distance = r * apo */
      /* r at height t within a drum that runs r0 -> r1 over h */
      function faceAt(r0, r1, h, t) { return (r0 + (r1 - r0) * (t / h)) * apo; }
      /* window on one of the eight flats */
      function flat(r, y0, k, ww, wh, col) {
        const th = k * Math.PI / 4;
        F.box(Math.sin(th) * r, y0, Math.cos(th) * r, ww, wh, 0.35, th, col, 'wood');
        F.box(Math.sin(th) * (r - 0.05), y0 - 0.26, Math.cos(th) * (r - 0.05),
          ww + 0.55, 0.26, 0.8, th, shade(c, -0.26), 'stone');
      }

      F.frustum(0, 0, 0, 7.4, 7.1, 1.1, ry, shade(c, -0.24), 'stone', 8);
      F.frustum(0, 1.1, 0, 7.1, 5.9, 7.6, ry, c, 'stone', 8);
      F.frustum(0, 8.7, 0, 6.1, 5.9, 0.5, ry, bandC, 'stone', 8);
      F.frustum(0, 9.2, 0, 5.7, 4.6, 6.0, ry, shade(c, 0.03), 'stone', 8);
      F.frustum(0, 15.2, 0, 4.8, 4.6, 0.45, ry, bandC, 'stone', 8);
      F.frustum(0, 15.65, 0, 4.4, 3.5, 3.5, ry, shade(c, 0.05), 'stone', 8);
      if (F.chance(0.5)) {
        F.dome(0, 19.15, 0, 3.6, 3.0, 0, F.pick([0xb08d3c, 0x93886d]), 'dome');
        F.ball(0, 22.1, 0, 0.42, 0xd0a53c, 'metal');
      } else {
        F.cone(0, 19.15, 0, 3.6, 3.4, 0, F.pick(roofTones), 'roof');
        F.ball(0, 22.2, 0, 0.35, 0xd0a53c, 'metal');
      }

      /* entrance porch on the front flat */
      const g0 = faceAt(7.1, 5.9, 7.6, 0.6);
      F.box(0, 1.1, g0 - 0.4, 3.2, 3.9, 1.2, 0, shade(c, -0.18), 'stone');
      F.box(0, 1.1, g0 + 0.15, 1.7, 2.7, 0.3, 0, doorC, 'wood');
      F.box(0, 5.0, g0 - 0.35, 3.6, 0.4, 1.5, 0, bandC, 'stone');
      [-1, 1].forEach(function (s) {
        F.cyl(s * 1.9, 1.1, g0 + 0.35, 0.3, 3.9, 0, shade(c, -0.12), 'stone');
        F.box(s * 1.9, 5.0, g0 + 0.35, 0.8, 0.3, 0.8, 0, bandC, 'stone');
      });
      [0, 1].forEach(function (i) {
        F.box(0, i * 0.4, g0 + 0.62 + (1 - i) * 0.42, 3.4 - i * 0.35, 0.4, 0.46, 0, shade(c, -0.22), 'stone');
      });
      F.rod(-2.4, 4.4, g0 + 0.2, -2.4, 4.4, g0 + 0.95, 0.07, 0x3a2f22, 'metal');
      F.ball(-2.4, 4.1, g0 + 0.95, 0.25, glow, 'glow');

      /* slit windows right round both lower drums, wider ones on the cardinals */
      [1, 2, 3, 4, 5, 6, 7].forEach(function (k) {
        flat(faceAt(7.1, 5.9, 7.6, 4.2) + 0.05, 4.9, k, k % 2 ? 0.7 : 1.15, 1.7, doorC);
      });
      [0, 2, 4, 6].forEach(function (k) {
        flat(faceAt(5.7, 4.6, 6.0, 2.6) + 0.05, 11.2, k, 1.1, 1.6, doorC);
      });
      [1, 3, 5, 7].forEach(function (k) {
        flat(faceAt(4.4, 3.5, 3.5, 1.4) + 0.05, 16.8, k, 0.7, 1.3, doorC);
      });

      /* bracketed balcony over the door, on the second drum */
      const b0 = faceAt(5.7, 4.6, 6.0, 1.2);
      F.box(0, 10.4, b0 + 0.75, 5.0, 0.3, 1.7, 0, shade(c, -0.2), 'stone');
      [-1.8, 1.8].forEach(function (ox) {
        F.beam(ox, 10.4, b0 + 0.1, ox, 9.3, b0 + 1.45, 0.3, 0.3, timber, 'wood');
      });
      F.box(0, 10.7, b0 + 1.5, 5.0, 0.8, 0.16, 0, timber, 'wood');
      [-2.4, 2.4].forEach(function (ox) {
        F.box(ox, 10.7, b0 + 0.75, 0.16, 0.8, 1.7, 0, timber, 'wood');
      });

      /* external stair + landing up the left flank, and a back buttress */
      const sx = -faceAt(7.1, 5.9, 7.6, 3.0) - 0.4;
      for (let i = 0; i < 6; i++) {
        F.box(sx + 0.1 * i, i * 0.62, -1.4 + i * 0.95, 1.6, 0.62, 1.0, 0, shade(c, -0.16), 'stone');
      }
      F.box(sx + 0.7, 3.7, 4.0, 2.0, 0.3, 2.2, 0, shade(c, -0.16), 'stone');
      F.rod(sx + 0.1, 3.7, -1.4, sx + 0.7, 4.7, 4.6, 0.09, timber, 'metal');
      F.frustum(0, 0, -5.7, 1.3, 0.8, 6.5, 0, shade(c, -0.08), 'stone', 4);
      F.box(0, 6.5, -5.7, 2.0, 0.45, 2.0, 0, bandC, 'stone');
      if (poor) {
        F.box(-3.6, 0, -4.6, 0.55, 8, 0.55, 0, shade(c, -0.25), 'stone');
        F.box(-3.6, 8, -4.6, 0.75, 0.6, 0.75, 0, shade(c, -0.35), 'stone');
      }
      F.rod(2.6, 19.0, 2.6, 2.6, 23.4, 2.6, 0.08, timber, 'metal');
      F.box(2.6, 21.6, 2.9, 0.1, 1.5, 1.1, 0, F.pick([0xa8241c, 0x2f5a86, 0x6b3fa0]), 'cloth');

    } else if (F.variant === 2) {
      /* domed: corniced block, drum + dome, projecting bay on the front */
      const c = F.pick(stoneTones), cornice = shade(c, -0.13);
      const domeC = F.pick([0xb08d3c, 0x93886d]);
      const L = { x: 0, z: 0, y: 0, w: 16, d: 12, h: 9.5 };
      F.box(0, 0, 0, 16.9, 0.5, 12.9, 0, shade(c, -0.24), 'stone');
      F.box(0, 0.5, 0, 16, 9.5, 12, 0, c, 'stone');
      F.box(0, 4.6, 0, 16.3, 0.28, 12.3, 0, shade(c, -0.08), 'stone');
      F.box(0, 9.7, 0, 16.4, 0.4, 12.4, 0, cornice, 'stone');
      F.box(0, 10.1, 0, 15.4, 0.5, 11.4, 0, shade(c, -0.05), 'stone');
      F.cyl(0, 10.6, 0, 4.5, 3, 0, domeC, 'stone');
      F.dome(0, 13.6, 0, 4.5, 4.0, 0, domeC, 'dome');
      F.ball(0, 17.6, 0, 0.4, shade(domeC, 0.15), 'metal');
      /* the drum reads from every side: eight thin ribs and four lucarnes */
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU;
        F.box(Math.sin(a) * 4.5, 10.6, Math.cos(a) * 4.5, 0.3, 3, 0.3, a, shade(domeC, -0.2), 'stone');
      }
      [0, 2, 4, 6].forEach(function (i) {
        const a = i / 8 * TAU;
        F.box(Math.sin(a) * 4.45, 11.4, Math.cos(a) * 4.45, 1.0, 1.5, 0.3, a, 0x1c1a16, 'wood');
      });

      /* door, surround, steps, lamp */
      F.box(0, 0.5, 6.15, 2.7, 3.5, 0.45, 0, shade(c, -0.2), 'stone');
      F.box(0, 0.5, 6.35, 1.6, 2.6, 0.28, 0, doorC, 'wood');
      F.box(0, 4.0, 6.2, 3.1, 0.35, 0.6, 0, cornice, 'stone');
      [0, 1].forEach(function (i) {
        F.box(0, i * 0.26, 6.9 - i * 0.4, 2.8 - i * 0.4, 0.26, 0.8, 0, shade(c, -0.26), 'stone');
      });
      F.rod(-1.7, 3.8, 6.2, -1.7, 3.8, 6.85, 0.07, 0x3a2f22, 'metal');
      F.ball(-1.7, 3.55, 6.85, 0.24, glow, 'glow');

      /* projecting bay on the front flank, corbelled out */
      F.box(4.9, 3.6, 6.35, 3.2, 3.4, 1.5, 0, shade(c, 0.04), 'stone');
      F.box(4.9, 7.0, 6.35, 3.5, 0.35, 1.8, 0, cornice, 'stone');
      F.beam(4.9, 3.6, 6.0, 4.9, 2.2, 7.0, 0.5, 0.5, timber, 'wood');
      F.box(4.9, 4.2, 7.1, 1.9, 1.7, 0.25, 0, doorC, 'wood');
      [-1, 1].forEach(function (s) {
        F.box(4.9 + s * 1.6, 4.2, 6.35, 0.25, 1.7, 1.1, 0, doorC, 'wood');
      });

      /* windows all round */
      row(L, 0, 1.6, 2, 4.3, 1.3, 1.7, c, true, rich);
      row(L, 0, 6.0, 3, 5.4, 1.2, 1.6, c, true, false);
      row(L, 1, 1.6, 3, 5.0, 1.2, 1.6, c, true, false);
      row(L, 2, 1.6, 2, 3.2, 1.2, 1.6, c, true, false);
      row(L, 2, 6.0, 2, 3.2, 1.1, 1.5, c, true, false);
      row(L, 3, 1.6, 2, 3.2, 1.2, 1.6, c, true, poor);
      row(L, 3, 6.0, 2, 3.2, 1.1, 1.5, c, true, false);

      chimney(-6.4, -4.4, 10.1, 2.4, c);
      drainpipe(8.2, -5.3, 0.5, 9.4, c);
      [[-7.6, 7.6], [7.6, 7.6], [-7.6, -7.6], [7.6, -7.6]].forEach(function (p) {
        if (Math.abs(p[1]) > 6) return;
        F.box(p[0], 10.6, p[1], 0.9, 0.9, 0.9, 0, cornice, 'stone');
      });
      [[-7.3, 5.3], [7.3, 5.3], [-7.3, -5.3], [7.3, -5.3]].forEach(function (p) {
        F.box(p[0], 10.6, p[1], 0.95, 1.0, 0.95, 0, cornice, 'stone');
        F.ball(p[0], 11.85, p[1], 0.4, shade(domeC, -0.1), 'metal');
      });
      if (poor) F.box(-8.3, 0.5, -3, 0.6, 8.5, 0.6, 0, shade(c, -0.2), 'stone');

    } else {
      /* hovel: crude patched box, lean-to, props, stovepipe, yard clutter */
      const c = F.pick(plasterTones), trimC = shade(c, -0.18);
      const L = { x: 0, z: 0, y: 0, w: 14, d: 10, h: 7 };
      /* rubble plinth, deliberately uneven */
      for (let i = 0; i < 5; i++) {
        F.box(-5.6 + i * 2.8, 0, F.rr(-0.3, 0.3), 3.2, F.rr(0.3, 0.6), 10.8, 0, shade(c, -0.3), 'stone');
      }
      F.box(0, 0.4, 0, 14, 7, 10, 0, c, 'plaster');
      /* patches of bare stone where the plaster has come away */
      for (let i = 0; i < 4; i++) {
        const s = F.pick([0, 1, 2, 3]), n = nrm(s), flat = n[1] !== 0;
        F.box(n[0] * 7.05 + (flat ? F.rr(-5, 5) : 0), F.rr(1, 4.5), n[1] * 5.05 + (flat ? 0 : F.rr(-3.5, 3.5)),
          flat ? F.rr(1.6, 3) : 0.16, F.rr(1.2, 2.2), flat ? 0.16 : F.rr(1.6, 3), 0, shade(c, -0.22), 'stone');
      }
      F.box(0, 7.4, 0, 14.5, 0.5, 10.5, 0, trimC, 'stone');
      F.box(0, 7.9, 0, 12.6, 0.3, 8.8, 0, shade(c, -0.26), 'stone');

      /* lean-to on the right, sloped timber roof on props */
      F.box(7.8, 0.4, -1, 4.8, 4.6, 6, 0, shade(c, 0.03), 'plaster');
      F.box(7.8, 5.0, -1, 5.2, 0.35, 6.4, 0, trimC, 'stone');
      F.beam(5.8, 5.3, -4.2, 10.2, 4.3, -4.2, 0.35, 0.35, timber, 'wood');
      F.beam(5.8, 5.3, 2.2, 10.2, 4.3, 2.2, 0.35, 0.35, timber, 'wood');
      F.box(8.1, 4.6, -1, 5.2, 0.22, 6.6, 0.1, shade(timber, 0.12), 'wood');
      F.box(10.1, 0.4, -1, 1.2, 2.2, 0.25, 0, 0x201d18, 'wood');
      [-3.6, 1.6].forEach(function (pz) {
        F.rod(10.3, 0, pz, 10.1, 4.5, pz, 0.16, timber, 'wood');
      });

      /* door, shutters, openings on every face */
      F.box(-1.5, 0.4, 5.1, 2.2, 3.0, 0.4, 0, shade(c, -0.2), 'plaster');
      F.box(-1.5, 0.4, 5.3, 1.4, 2.2, 0.25, 0, 0x201d18, 'wood');
      F.box(-1.5, 3.6, 5.5, 2.8, 0.2, 1.4, 0.07, shade(timber, 0.1), 'wood');
      [-2.5, 0.2].forEach(function (px) {
        F.rod(-1.5 + px, 0.4, 6.1, -1.5 + px, 3.5, 6.1, 0.12, timber, 'wood');
      });
      row(L, 0, 1.6, 2, 5.2, 0.95, 1.2, c, true, true);
      row(L, 0, 4.9, 2, 4.0, 0.9, 1.1, c, false, false);
      row(L, 1, 1.9, 3, 4.6, 0.95, 1.2, c, true, false);
      row(L, 1, 5.0, 2, 3.4, 0.9, 1.1, c, false, false);
      row(L, 3, 1.9, 2, 2.8, 0.95, 1.2, c, true, true);
      row(L, 3, 5.0, 1, 0, 0.9, 1.1, c, false, false);

      /* stovepipe + roof junk */
      F.cyl(-5.2, 8.2, -3.2, 0.3, 2.6, 0, 0x3a3128, 'metal');
      F.cyl(-5.2, 10.8, -3.2, 0.44, 0.35, 0, 0x2a241e, 'metal');
      F.box(3.4, 8.2, 2.4, 2.2, 0.26, 1.8, 0.2, shade(timber, -0.1), 'wood');
      F.box(-3.0, 8.2, 3.0, 1.2, 0.5, 1.2, 0, shade(c, -0.3), 'stone');

      /* yard clutter so the base reads close-up */
      F.cyl(-6.9, 0, 3.4, 0.7, 1.5, 0, 0x5a4a34, 'wood');
      F.cyl(-6.9, 1.5, 3.4, 0.73, 0.12, 0, 0x3a3128, 'metal');
      F.box(-7.0, 0, 0.6, 1.3, 1.3, 1.3, 0.3, shade(timber, 0.1), 'wood');
      F.box(-6.4, 1.3, 0.9, 1.1, 1.0, 1.1, -0.2, shade(timber, 0.05), 'wood');
      F.box(5.6, 0, 5.4, 1.5, 1.1, 1.0, 0.12, shade(timber, 0.08), 'wood');
      F.rod(-7.9, 0, -2.4, -7.9, 2.6, -2.4, 0.16, timber, 'wood');
      F.rod(-7.9, 2.6, -2.4, -6.6, 2.4, 5.0, 0.05, 0x6b5a3a, 'rope');
      [-1.4, 0.6].forEach(function (t) {
        F.box(-7.2 + t * 0.7, 1.6, -0.2 + t * 2.4, 0.8, 1.0, 0.06, 0,
          F.pick([0x8d7a5e, 0x7a6a8a, 0x9a6a5a]), 'cloth');
      });
    }
  }
});

ASSET({
  key: 'voth_bldg_clan_compound', name: 'Clan Compound', culture: 'voth', family: 'housing',
  districts: ['estate', 'manor'], wealth: [0.7, 1],
  /* the four corner bastions deliberately oversail the curtain wall by ~3.7 m */
  w: 78, d: 68, h: 19, variants: 1,
  build: function (F) {
    const stoneTones = [0x8c8579, 0x958e80, 0x8b8069];
    const c = F.pick(stoneTones), coping = shade(c, -0.15), doorC = 0x1c1a16;
    const wallH = 4.6, wallT = 1.1;
    const hx = 35 - wallT / 2, hz = 30 - wallT / 2;

    F.box(0, 0, -hz, 70 - wallT * 2, wallH, wallT, 0, c, 'stone');
    F.box(0, wallH - 0.1, -hz, 70 - wallT * 2 + 0.3, 0.3, wallT + 0.3, 0, coping, 'stone');
    [-1, 1].forEach(function (s) {
      F.box(s * hx, 0, 0, wallT, wallH, 60 - wallT * 2, 0, c, 'stone');
      F.box(s * hx, wallH - 0.1, 0, wallT + 0.3, 0.3, 60 - wallT * 2 + 0.3, 0, coping, 'stone');
    });
    const gap = 16;
    [-1, 1].forEach(function (s) {
      const segW = (70 - wallT * 2 - gap) / 2;
      const cx = s * (gap / 2 + segW / 2);
      F.box(cx, 0, hz, segW, wallH, wallT, 0, c, 'stone');
      F.box(cx, wallH - 0.1, hz, segW + 0.3, 0.3, wallT + 0.3, 0, coping, 'stone');
    });
    /* pilaster buttresses right round the outside so the wall is not a blank ribbon */
    [-24, -12, 0, 12, 24].forEach(function (px) {
      [-1, 1].forEach(function (s) {
        if (s > 0 && Math.abs(px) < 12) return;
        F.box(px, 0, s * (hz + 0.75), 1.5, wallH - 0.5, 1.4, 0, shade(c, -0.07), 'stone');
      });
    });
    [-20, -8, 8, 20].forEach(function (pz) {
      [-1, 1].forEach(function (s) {
        F.box(s * (hx + 0.75), 0, pz, 1.4, wallH - 0.5, 1.5, 0, shade(c, -0.07), 'stone');
      });
    });

    /* gatehouse */
    F.box(0, 0, hz, gap + 4, 7.5, 4, 0, c, 'stone');
    F.box(0, 7.2, hz, gap + 4.3, 0.4, 4.3, 0, coping, 'stone');
    F.box(0, 7.6, hz, gap - 2, 0.9, 3.0, 0, shade(c, -0.05), 'stone');
    F.box(0, 0, hz + 1.6, 5, 4, 1.2, 0, doorC, 'wood');
    F.box(0, 4.0, hz + 1.55, 6.0, 0.4, 1.4, 0, coping, 'stone');
    [-1, 1].forEach(function (s) {
      F.box(s * 3.6, 0, hz + 1.6, 1.0, 4.6, 1.3, 0, shade(c, -0.1), 'stone');
      F.box(s * 6.4, 1.6, hz + 2.05, 1.2, 1.5, 0.25, 0, doorC, 'wood');
      F.rod(s * 5.2, 5.0, hz + 2.0, s * 5.2, 5.0, hz + 2.7, 0.08, 0x3a2f22, 'metal');
      F.ball(s * 5.2, 4.7, hz + 2.7, 0.26, 0xffcf87, 'glow');
      F.rod(s * 8.4, 7.6, hz, s * 8.4, 12.4, hz, 0.11, 0x5a4028, 'metal');
      F.box(s * 8.4, 9.6, hz + 0.35, 0.12, 2.4, 1.3, 0, 0xa8241c, 'cloth');
    });

    /* corner bastions */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      const tx = p[0] * hx, tz = p[1] * hz;
      F.frustum(tx, 0, tz, 4.2, 3.3, 14, 0, shade(c, -0.04), 'stone', 4);
      /* cornice now has to cover the real 6.6 m top, not the old sqrt(2)-narrow one */
      F.box(tx, 13.6, tz, 7.4, 0.5, 7.4, 0, coping, 'stone');
      F.box(tx, 14.1, tz, 6.6, 0.9, 6.6, 0, shade(c, -0.1), 'stone');
      [0, 1, 2, 3].forEach(function (s) {
        const n = s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0];
        const r = 4.2 + (3.3 - 4.2) * (7.5 / 14);
        F.box(tx + n[0] * (r + 0.05), 7.0, tz + n[1] * (r + 0.05),
          n[1] ? 1.0 : 0.3, 1.6, n[1] ? 0.3 : 1.0, 0, doorC, 'wood');
      });
      /* clan banner on every bastion */
      F.rod(tx, 15.0, tz, tx, 18.6, tz, 0.13, 0x3a2f22, 'metal');
      F.box(tx, 16.0, tz + 0.5, 0.1, 2.4, 1.4, 0, 0xa8241c, 'cloth');
    });

    /* inner ranges along the back wall */
    const backZ = -hz + 10;
    for (let i = 0; i < 3; i++) {
      if (!F.chance(0.85)) continue;
      const ix = -22 + i * 22 + F.rr(-3, 3);
      const iz = backZ + F.rr(-4, 6);
      const ic = F.pick(stoneTones);
      F.box(ix, 0, iz, 9, 6, 8, 0, ic, 'stone');
      F.box(ix, 5.75, iz, 9.3, 0.3, 8.3, 0, shade(ic, -0.13), 'stone');
      [-1, 1].forEach(function (s) {
        F.box(ix + s * 2.6, 1.4, iz + 4.05, 1.2, 1.6, 0.25, 0, doorC, 'wood');
        F.box(ix + s * 4.55, 1.4, iz, 0.25, 1.6, 1.2, 0, doorC, 'wood');
        F.box(ix + s * 2.6, 1.4, iz - 4.05, 1.1, 1.5, 0.25, 0, doorC, 'wood');
      });
      F.box(ix, 0, iz + 4.1, 1.6, 2.6, 0.35, 0, doorC, 'wood');
      if (F.chance(0.5)) {
        F.pyrRoof(ix, 6, iz, 9.5, 3, 8.5, 0, F.pick([0xb35a3a, 0x6b7a4a, 0xc4813f]), 'roof');
        F.box(ix - 3.2, 6.0, iz - 2.6, 0.8, 3.4, 0.8, 0, shade(ic, -0.25), 'stone');
      } else {
        F.frustum(ix, 6, iz, 3, 2.3, 3.5, 0, shade(ic, 0.04), 'stone', 8);
        F.dome(ix, 9.5, iz, 2.3, 2, 0, F.pick([0xb08d3c, 0x93886d]), 'dome');
        F.ball(ix, 11.6, iz, 0.3, 0xd0a53c, 'metal');
      }
    }
    /* courtyard: well head, paving strip, planting */
    F.cyl(0, 0, 6, 1.6, 0.9, 0, shade(c, -0.18), 'stone');
    F.cyl(0, 0.9, 6, 1.3, 0.2, 0, shade(c, -0.3), 'stone');
    [-1, 1].forEach(function (s) {
      F.rod(s * 1.4, 0.9, 6, s * 1.4, 3.2, 6, 0.12, 0x3a2f22, 'metal');
    });
    F.rod(-1.4, 3.2, 6, 1.4, 3.2, 6, 0.1, 0x3a2f22, 'metal');
    F.box(0, 0, 16, 7, 0.16, 14, 0, shade(c, -0.05), 'stone');
    for (let i = 0; i < 6; i++) {
      F.blob(F.rr(-25, 25), 0.6, F.rr(5, hz - 5), F.rr(0.6, 1.1), F.rr(1, 1.8), F.rnd() * TAU,
        F.pick([0x556b2f, 0x4a5e28]), 'leafy');
    }
  }
});

ASSET({
  key: 'voth_bldg_guild_hall', name: 'Guild Hall', culture: 'voth', family: 'guild',
  districts: ['canton', 'guild-row'], wealth: [0.3, 0.8],
  w: 29.5, d: 20.5, h: 23, variants: 3,
  variantDims: [
    { w: 29.5, d: 20.5, h: 20.5 },  /* smithy: the lean-to shed genuinely oversails */
    { w: 16, d: 17.5, h: 22.5 },    /* alchemist: an octagonal tower, not a block */
    { w: 24, d: 20.5, h: 23 }
  ],
  build: function (F) {
    if (F.variant === 0) F.shift(1.45, -0.69); /* centre the footprint on the origin (verify.py declared-size) */
    const doorC = 0x1c1a16, timber = 0x4a3a28, glow = 0xffcf87;
    function nrm(s) { return s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0]; }
    function windowRow(faceZ, y, count, halfW, wallC, trim) {
      for (let i = 0; i < count; i++) {
        const fx = count === 1 ? 0 : -halfW + (2 * halfW) * (i / (count - 1));
        F.box(fx, y, faceZ, 1.2, 1.5, 0.25, 0, doorC, 'wood');
        if (trim) F.box(fx, y - 0.26, faceZ + (faceZ > 0 ? 0.14 : -0.14), 1.8, 0.26, 0.85, 0, shade(wallC, -0.24), 'stone');
      }
    }
    function windowCol(faceX, y, count, halfD, wallC, trim) {
      for (let i = 0; i < count; i++) {
        const fz = count === 1 ? 0 : -halfD + (2 * halfD) * (i / (count - 1));
        F.box(faceX, y, fz, 0.25, 1.5, 1.2, 0, doorC, 'wood');
        if (trim) F.box(faceX + (faceX > 0 ? 0.14 : -0.14), y - 0.26, fz, 0.85, 0.26, 1.8, 0, shade(wallC, -0.24), 'stone');
      }
    }

    if (F.variant === 0) {
      /* Blacksmith: hlaalu massing, sooty, lean-to forge shed + tall flue */
      const c = 0x4a4642, cornice = shade(c, -0.13);
      F.box(0, 0, 0, 22.6, 0.55, 18.6, 0, shade(c, -0.26), 'stone');
      F.box(0, 0.55, 0, 22, 10, 18, 0, c, 'stone');
      F.box(0, 5.2, 0, 22.25, 0.26, 18.25, 0, shade(c, 0.06), 'stone');
      F.box(0, 10.2, 0, 22.35, 0.35, 18.35, 0, cornice, 'stone');
      F.box(0, 10.55, 0, 17, 6, 14, 0, shade(c, 0.03), 'stone');
      F.box(0, 16.2, 0, 17.35, 0.35, 14.35, 0, cornice, 'stone');
      F.box(0, 16.55, 0, 14.5, 0.7, 12.5, 0, cornice, 'stone');
      /* big forge doors */
      F.box(0, 0.55, 9.1, 4.2, 4.4, 0.5, 0, shade(c, -0.2), 'stone');
      [-1, 1].forEach(function (s) {
        F.box(s * 0.95, 0.55, 9.35, 1.7, 3.6, 0.28, 0, doorC, 'wood');
        F.box(s * 0.95, 2.4, 9.5, 1.8, 0.16, 0.12, 0, shade(0x8a7a5a, -0.2), 'metal');
      });
      F.box(0, 5.0, 9.15, 4.8, 0.4, 0.8, 0, cornice, 'stone');
      /* trade sign on a bracket */
      F.rod(-4.6, 6.6, 9.15, -4.6, 6.6, 11.0, 0.09, 0x3a2f22, 'metal');
      F.rod(-4.6, 6.6, 10.9, -4.6, 5.2, 10.9, 0.06, 0x3a2f22, 'metal');
      F.box(-4.6, 4.0, 10.9, 1.8, 1.3, 0.12, 0, 0x8a7a5a, 'metal');
      F.rod(4.6, 6.6, 9.15, 4.6, 6.6, 10.4, 0.08, 0x3a2f22, 'metal');
      F.ball(4.6, 6.1, 10.4, 0.3, glow, 'glow');
      windowRow(9.05, 5.0, 3, 7, c, true);
      windowRow(9.05, 12.6, 3, 6, c, true);
      windowRow(-9.05, 5.0, 4, 7.5, c, true);
      windowRow(-9.05, 12.6, 3, 6, c, false);
      windowCol(11.05, 5.0, 3, 6, c, true);
      windowCol(11.05, 12.6, 2, 4.5, c, false);
      windowCol(-11.05, 5.0, 2, 5, c, true);
      windowCol(-11.05, 12.6, 2, 4.5, c, false);
      /* lean-to forge shed on the left flank */
      F.box(-13.5, 0, -2, 5, 5.0, 8, 0, shade(c, 0.05), 'stone');
      F.box(-13.5, 5.0, -2, 5.3, 0.3, 8.3, 0, cornice, 'stone');
      F.box(-13.5, 5.3, -2, 4.4, 0.4, 7.4, 0, shade(c, -0.1), 'stone');
      F.box(-13.6, 0, 2.15, 2.6, 3.4, 0.3, 0, doorC, 'wood');
      F.box(-15.4, 1.6, 2.15, 1.1, 1.3, 0.25, 0, doorC, 'wood');
      F.box(-16.05, 1.6, -2, 0.25, 1.3, 1.1, 0, doorC, 'wood');
      F.box(-13.5, 5.6, -2, 0.9, 2.6, 0.9, 0, shade(c, -0.25), 'stone');
      /* flues, both stacks smoking-black */
      F.box(7, 0.55, -6, 1.2, 18.0, 1.2, 0, shade(c, -0.2), 'stone');
      F.box(7, 18.55, -6, 1.5, 0.7, 1.5, 0, shade(c, -0.3), 'metal');
      F.cyl(7, 19.25, -6, 0.45, 1.0, 0, 0x2a241e, 'metal');
      /* forge yard: anvil, quench trough, coal, billets */
      F.cyl(9.6, 0, 7.6, 0.55, 0.75, 0, timber, 'wood');
      F.box(9.6, 0.75, 7.6, 1.9, 0.55, 0.7, 0.3, 0x3a3630, 'metal');
      F.box(12.2, 0, 4.4, 1.6, 0.9, 2.6, 0, timber, 'wood');
      F.blob(12.2, 1.0, 1.0, 1.1, 0.9, 0.4, 0x22201d, 'stone');
      [0, 1, 2].forEach(function (i) {
        F.rod(-12.0 + i * 0.4, 0.2, 7.6, -10.4 + i * 0.5, 0.2, 9.4, 0.12, 0x5a5a5e, 'metal');
      });
      F.box(-9.0, 0, 9.4, 1.4, 1.1, 1.2, 0.2, timber, 'wood');

    } else if (F.variant === 1) {
      /* Alchemist: velothi tower, jade tint, dome cap, glassware on the balconies */
      const c = 0x3f6b56, bandC = shade(c, -0.1);
      const ry = Math.PI / 8, apo = Math.cos(Math.PI / 8);
      function faceAt(r0, r1, h, t) { return (r0 + (r1 - r0) * (t / h)) * apo; }
      function flat(r, y0, k, ww, wh, col) {
        const th = k * Math.PI / 4;
        F.box(Math.sin(th) * r, y0, Math.cos(th) * r, ww, wh, 0.3, th, col, 'glass');
        F.box(Math.sin(th) * (r - 0.05), y0 - 0.26, Math.cos(th) * (r - 0.05),
          ww + 0.55, 0.26, 0.8, th, shade(c, -0.26), 'stone');
      }
      F.frustum(0, 0, 0, 8.4, 8.1, 1.0, ry, shade(c, -0.24), 'stone', 8);
      F.frustum(0, 1.0, 0, 8.1, 6.9, 8.2, ry, c, 'stone', 8);
      F.frustum(0, 9.2, 0, 7.1, 6.9, 0.5, ry, bandC, 'stone', 8);
      F.frustum(0, 9.7, 0, 6.6, 5.4, 6.3, ry, shade(c, 0.04), 'stone', 8);
      F.frustum(0, 16.0, 0, 5.6, 5.4, 0.45, ry, bandC, 'stone', 8);
      F.dome(0, 16.45, 0, 5.2, 4.2, 0, shade(c, 0.06), 'dome');
      F.ball(0, 20.65, 0, 0.42, 0xd0a53c, 'metal');
      F.cone(0, 20.65, 0, 0.5, 1.4, 0, 0xd0a53c, 'metal');
      /* porch */
      const g0 = faceAt(8.1, 6.9, 8.2, 0.6);
      F.box(0, 1.0, g0 - 0.4, 3.4, 4.1, 1.2, 0, shade(c, -0.18), 'stone');
      F.box(0, 1.0, g0 + 0.2, 1.8, 2.8, 0.3, 0, doorC, 'wood');
      F.box(0, 5.1, g0 - 0.35, 3.9, 0.4, 1.6, 0, bandC, 'stone');
      [-1, 1].forEach(function (s) {
        F.cyl(s * 2.0, 1.0, g0 + 0.4, 0.32, 4.1, 0, shade(c, -0.12), 'stone');
        F.box(s * 2.0, 5.1, g0 + 0.4, 0.85, 0.32, 0.85, 0, bandC, 'stone');
        F.rod(s * 2.9, 4.6, g0 + 0.2, s * 2.9, 4.6, g0 + 0.95, 0.07, 0x3a2f22, 'metal');
        F.ball(s * 2.9, 4.3, g0 + 0.95, 0.26, 0x9fe8b0, 'glow');
      });
      [0, 1, 2].forEach(function (i) {
        F.box(0, i * 0.34, g0 + 0.85 + (2 - i) * 0.42, 3.6 - i * 0.3, 0.34, 0.48, 0, shade(c, -0.22), 'stone');
      });
      /* coloured glass all the way round, two tiers */
      [0, 1, 2, 3, 4, 5, 6, 7].forEach(function (k) {
        if (k === 0) return;
        flat(faceAt(8.1, 6.9, 8.2, 4.4) + 0.05, 4.8, k, k % 2 ? 0.8 : 1.3, 1.9, F.pick([0x8fd6b0, 0xc9a227, 0x6b3fa0]));
      });
      [0, 2, 4, 6].forEach(function (k) {
        flat(faceAt(6.6, 5.4, 6.3, 2.8) + 0.05, 11.6, k, 1.2, 1.7, F.pick([0x8fd6b0, 0xc9a227]));
      });
      /* herb balcony ring on the upper drum */
      const b0 = faceAt(6.6, 5.4, 6.3, 1.0);
      [0, 2, 4, 6].forEach(function (k) {
        const th = k * Math.PI / 4, sx = Math.sin(th), sz = Math.cos(th);
        F.box(sx * (b0 + 0.8), 10.6, sz * (b0 + 0.8), 4.4, 0.28, 1.6, th, shade(c, -0.2), 'stone');
        F.box(sx * (b0 + 1.5), 10.88, sz * (b0 + 1.5), 4.4, 0.7, 0.16, th, timber, 'wood');
        F.beam(sx * b0, 10.6, sz * b0, sx * (b0 + 1.4), 9.6, sz * (b0 + 1.4), 0.3, 0.3, timber, 'wood');
        F.box(sx * (b0 + 1.0), 10.88, sz * (b0 + 1.0), 1.1, 0.55, 0.55, th, 0x6b4a2a, 'wood');
        F.blob(sx * (b0 + 1.0), 11.7, sz * (b0 + 1.0), 0.55, 0.7, th, 0x556b2f, 'leafy');
      });
      /* chimney/condenser stack and a weather vane */
      F.cyl(-3.4, 16.0, -3.4, 0.5, 4.2, 0, shade(c, -0.22), 'stone');
      F.cyl(-3.4, 20.2, -3.4, 0.62, 0.4, 0, 0x2a241e, 'metal');
      F.rod(0, 20.9, 0, 0, 22.4, 0, 0.07, 0x3a2f22, 'metal');
      F.box(0.5, 21.6, 0, 1.2, 0.7, 0.08, 0, 0xd0a53c, 'metal');

    } else {
      /* Warrior: tallest, blockiest hlaalu massing, banners, shield boards */
      const c = F.pick([0x8c8579, 0x958e80]), cornice = shade(c, -0.13);
      F.box(0, 0, 0, 22.8, 0.6, 18.8, 0, shade(c, -0.26), 'stone');
      F.box(0, 0.6, 0, 22, 12, 18, 0, c, 'stone');
      F.box(0, 6.2, 0, 22.25, 0.26, 18.25, 0, shade(c, -0.06), 'stone');
      F.box(0, 12.2, 0, 22.35, 0.35, 18.35, 0, cornice, 'stone');
      F.box(0, 12.55, 0, 18, 6.5, 15, 0, shade(c, 0.03), 'stone');
      F.box(0, 19.05, 0, 18.35, 0.35, 15.35, 0, cornice, 'stone');
      F.box(0, 19.4, 0, 15, 0.8, 12.5, 0, cornice, 'stone');
      /* gate */
      F.box(0, 0.6, 9.1, 4.6, 5.0, 0.5, 0, shade(c, -0.2), 'stone');
      [-1, 1].forEach(function (s) {
        F.box(s * 1.05, 0.6, 9.35, 1.8, 3.9, 0.28, 0, doorC, 'wood');
      });
      F.box(0, 5.6, 9.15, 5.2, 0.45, 0.85, 0, cornice, 'stone');
      [0, 1].forEach(function (i) {
        F.box(0, i * 0.3, 9.7 + (1 - i) * 0.5, 5.4 - i * 0.6, 0.3, 0.9, 0, shade(c, -0.24), 'stone');
      });
      F.rod(-2.6, 0.6, 9.4, -2.6, 6.2, 9.4, 0.13, 0x5a4028, 'wood');
      F.rod(2.6, 0.6, 9.4, 2.6, 6.2, 9.4, 0.13, 0x5a4028, 'wood');
      [-1, 1].forEach(function (s) {
        F.box(s * 2.6, 3.6, 9.75, 0.1, 2.4, 1.2, 0, s < 0 ? 0xa8241c : 0x2f5a86, 'cloth');
        F.rod(s * 7.6, 6.6, 9.15, s * 7.6, 6.6, 10.0, 0.08, 0x3a2f22, 'metal');
        F.ball(s * 7.6, 6.15, 10.0, 0.28, glow, 'glow');
      });
      /* shield boards along the string course, all four sides */
      [-8, -4, 0, 4, 8].forEach(function (px) {
        F.cyl(px, 7.2, 9.2, 0.75, 0.2, 0, F.pick([0x8a7a5a, 0x7a4a3a, 0x4a5a6a]), 'metal');
        F.cyl(px, 7.2, -9.2, 0.7, 0.2, 0, F.pick([0x8a7a5a, 0x7a4a3a, 0x4a5a6a]), 'metal');
      });
      windowRow(9.05, 8.8, 3, 7, c, true);
      windowRow(9.05, 15.0, 3, 6, c, true);
      windowRow(-9.05, 3.2, 4, 8, c, true);
      windowRow(-9.05, 8.8, 4, 8, c, true);
      windowRow(-9.05, 15.0, 3, 6, c, false);
      windowCol(11.05, 3.2, 3, 6, c, true);
      windowCol(11.05, 8.8, 3, 6, c, true);
      windowCol(11.05, 15.0, 2, 5, c, false);
      windowCol(-11.05, 3.2, 3, 6, c, true);
      windowCol(-11.05, 8.8, 3, 6, c, true);
      windowCol(-11.05, 15.0, 2, 5, c, false);
      /* roof watch post + masts */
      F.box(-5.0, 20.2, -4.0, 2.6, 2.2, 2.6, 0, shade(c, 0.05), 'stone');
      F.box(-5.0, 22.4, -4.0, 3.0, 0.4, 3.0, 0, cornice, 'stone');
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (p) {
        F.box(p[0] * 7.0, 20.2, p[1] * 5.8, 0.9, 1.1, 0.9, 0, cornice, 'stone');
      });
      /* external stair to a first-floor door on the right flank */
      for (let i = 0; i < 7; i++) {
        F.box(11.4, 0.6 + i * 0.86, 5.4 - i * 1.25, 2.0, 0.86, 1.3, 0, shade(c, -0.14), 'stone');
      }
      F.box(11.05, 6.6, -3.6, 0.3, 2.6, 1.6, 0, doorC, 'wood');
    }
  }
});

ASSET({
  key: 'voth_bldg_palace', name: 'Palace', culture: 'voth', family: 'civic',
  districts: ['canton'], wealth: [1, 1], w: 60, d: 62, h: 58, variants: 1,
  build: function (F) {
    const gilt = 0xd0a53c, basalt = 0x2b2a28, stone = 0x9d9484, glow = 0xffcf87;
    const tiers = [
      { r0: 30, r1: 24, h: 14 },
      { r0: 24, r1: 19.2, h: 11 },
      { r0: 19.2, r1: 15.4, h: 9 },
      { r0: 15.4, r1: 12.3, h: 7 },
      { r0: 12.3, r1: 9.8, h: 6 }
    ];
    /* a sides:4 tier's face sits at z = r0 at its base and z = r1 at its top, so
       anything applied to it has to be built as a battered (sloping) member. */
    function batten(t, y0, side, off, u0, u1, ww, th, col, fam) {
      const z0 = t.r0 + (t.r1 - t.r0) * u0, z1 = t.r0 + (t.r1 - t.r0) * u1;
      const ya = y0 + t.h * u0, yb = y0 + t.h * u1;
      if (side === 0) F.beam(off, ya, z0, off, yb, z1, ww, th, col, fam);
      else if (side === 1) F.beam(off, ya, -z0, off, yb, -z1, ww, th, col, fam);
      else if (side === 2) F.beam(z0, ya, off, z1, yb, off, th, ww, col, fam);
      else F.beam(-z0, ya, off, -z1, yb, off, th, ww, col, fam);
    }

    let y = 0;
    tiers.forEach(function (t, i) {
      F.frustum(0, y, 0, t.r0, t.r1, t.h, 0, shade(stone, -i * 0.02), 'stone', 4);
      /* battered pilasters and dark niches, on all four elevations */
      if (i < 3) {
        const spread = t.r1 * 0.62, n = i === 0 ? 3 : 2;
        for (let s = 0; s < 4; s++) {
          for (let k = 0; k < n; k++) {
            const off = n === 1 ? 0 : -spread + 2 * spread * (k / (n - 1));
            batten(t, y, s, off, 0.06, 0.94, 2.0, 0.55, shade(stone, 0.05), 'stone');
            batten(t, y, s, off, 0.2, 0.78, 1.1, 0.9, basalt, 'stone');
          }
        }
      }
      y += t.h;
      /* gilt cornice: the tier top really is 2*r1 across, and it has to oversail
         the tier above (whose base is also 2*r1) far enough to carry the finials */
      F.box(0, y - 0.45, 0, t.r1 * 2 + 2.4, 0.6, t.r1 * 2 + 2.4, 0, gilt, 'metal');
      F.box(0, y - 0.95, 0, t.r1 * 2 + 1.4, 0.5, t.r1 * 2 + 1.4, 0, shade(stone, -0.18), 'stone');
      if (i < 3) {
        /* corner finials stand on the ledge just outside the tier above */
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
          F.cone(p[0] * (t.r1 + 0.6), y + 0.15, p[1] * (t.r1 + 0.6), 0.6, 2.4, 0, basalt, 'stone');
        });
      }
    });

    /* monumental gate: a projecting pylon on the bottom tier's front face, which
       now stands at z = 30, not the old sqrt(2)-shrunk 21.2 */
    const gz = tiers[0].r0;
    F.box(0, 0, gz - 4.6, 15, 12, 9.2, 0, shade(stone, 0.04), 'stone');
    F.box(0, 11.6, gz - 4.6, 15.8, 0.7, 10.0, 0, gilt, 'metal');
    F.box(0, 0, gz - 0.5, 8.4, 10, 1.4, 0, 0x1c1a16, 'stone');
    F.box(0, 10.0, gz - 0.45, 9.6, 0.7, 1.6, 0, gilt, 'metal');
    [-1, 1].forEach(function (s) {
      F.cyl(s * 5.6, 0, gz + 0.1, 0.85, 10.6, 0, basalt, 'stone');
      F.box(s * 5.6, 10.6, gz + 0.1, 2.2, 0.6, 2.2, 0, gilt, 'metal');
      F.cyl(s * 8.4, 0, gz + 0.8, 0.7, 2.6, 0, basalt, 'stone');
      F.ball(s * 8.4, 2.9, gz + 0.8, 0.55, glow, 'glow');
    });
    [0, 1, 2].forEach(function (i) {
      F.box(0, i * 0.4, gz + 0.5 + (2 - i) * 0.55, 16 - i * 1.6, 0.4, 0.7, 0, shade(stone, -0.18), 'stone');
    });

    /* crown: drum + gilt dome, 4 corner cupolas, spike finial */
    F.cyl(0, y, 0, 8, 3, 0, stone, 'stone');
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU;
      F.box(Math.sin(a) * 8, y, Math.cos(a) * 8, 0.45, 3, 0.45, a, shade(stone, -0.16), 'stone');
    }
    F.dome(0, y + 3, 0, 8, 6, 0, gilt, 'dome');
    F.ball(0, y + 9.3, 0, 0.35, gilt, 'metal');
    F.cone(0, y + 9.3, 0, 0.8, 1.8, 0, gilt, 'metal');
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      const cx = p[0] * 11, cz = p[1] * 11;
      F.cyl(cx, y, cz, 1.6, 2, 0, shade(stone, -0.05), 'stone');
      F.dome(cx, y + 2, cz, 1.6, 1.6, 0, gilt, 'dome');
      F.ball(cx, y + 3.8, cz, 0.28, gilt, 'metal');
      F.rod(p[0] * 7.6, y, p[1] * 7.6, p[0] * 7.6, y + 6.5, p[1] * 7.6, 0.12, basalt, 'metal');
      F.box(p[0] * 7.6, y + 3.4, p[1] * 7.6 + 0.4, 0.1, 2.6, 1.4, 0, 0xa8241c, 'cloth');
    });
  }
});

ASSET({
  key: 'voth_bldg_temple', name: 'Temple', culture: 'voth', family: 'religious',
  districts: ['canton'], wealth: [1, 1], w: 58, d: 60, h: 59, variants: 1,
  build: function (F) {
    const gold = 0xc9a227, stone = 0x9a8f78;
    const redA = 0xa8241c, redB = 0x4a0e0a, glow = 0xffb066;
    const tiers = [
      { r0: 29, r1: 23, h: 13 },
      { r0: 23, r1: 18.4, h: 10.5 },
      { r0: 18.4, r1: 14.7, h: 8.5 },
      { r0: 14.7, r1: 11.8, h: 7 },
      { r0: 11.8, r1: 9.4, h: 6 }
    ];
    function batten(t, y0, side, off, u0, u1, ww, th, col, fam) {
      const z0 = t.r0 + (t.r1 - t.r0) * u0, z1 = t.r0 + (t.r1 - t.r0) * u1;
      const ya = y0 + t.h * u0, yb = y0 + t.h * u1;
      if (side === 0) F.beam(off, ya, z0, off, yb, z1, ww, th, col, fam);
      else if (side === 1) F.beam(off, ya, -z0, off, yb, -z1, ww, th, col, fam);
      else if (side === 2) F.beam(z0, ya, off, z1, yb, off, th, ww, col, fam);
      else F.beam(-z0, ya, off, -z1, yb, off, th, ww, col, fam);
    }

    let y = 0;
    tiers.forEach(function (t, i) {
      F.frustum(0, y, 0, t.r0, t.r1, t.h, 0, shade(stone, -i * 0.02), 'stone', 4);
      if (i < 3) {
        const spread = t.r1 * 0.6, n = i === 0 ? 3 : 2;
        for (let s = 0; s < 4; s++) {
          for (let k = 0; k < n; k++) {
            const off = n === 1 ? 0 : -spread + 2 * spread * (k / (n - 1));
            batten(t, y, s, off, 0.05, 0.95, 1.9, 0.5, shade(stone, 0.06), 'stone');
            batten(t, y, s, off, 0.22, 0.8, 1.0, 0.85, i % 2 ? redB : 0x2a0808, 'stone');
          }
        }
      }
      y += t.h;
      /* gold band across the real 2*r1 tier top, oversailing the tier above */
      F.box(0, y - 0.4, 0, t.r1 * 2 + 2.4, 0.5, t.r1 * 2 + 2.4, 0, gold, 'metal');
      F.box(0, y - 0.85, 0, t.r1 * 2 + 1.4, 0.45, t.r1 * 2 + 1.4, 0, shade(stone, -0.2), 'stone');
      if (i < 4) {
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p, ci) {
          F.cone(p[0] * (t.r1 + 0.6), y + 0.1, p[1] * (t.r1 + 0.6), 0.65, 2.6, 0,
            (ci + i) % 2 === 0 ? redA : redB, 'roof');
        });
      }
    });

    /* the shrine gate: the bottom tier's face is at z = 29 */
    const gz = tiers[0].r0;
    F.box(0, 0, gz - 4.2, 13.5, 11, 8.4, 0, shade(stone, 0.04), 'stone');
    F.box(0, 10.6, gz - 4.2, 14.3, 0.6, 9.2, 0, gold, 'metal');
    F.box(0, 0, gz - 0.5, 7.6, 9.2, 1.4, 0, 0x2a0808, 'stone');
    F.box(0, 9.2, gz - 0.45, 8.8, 0.65, 1.6, 0, gold, 'metal');
    [-1, 1].forEach(function (s) {
      F.cyl(s * 5.1, 0, gz + 0.1, 0.8, 9.8, 0, shade(stone, -0.22), 'stone');
      F.box(s * 5.1, 9.8, gz + 0.1, 2.0, 0.55, 2.0, 0, gold, 'metal');
      F.cyl(s * 7.8, 0, gz + 0.7, 0.75, 2.2, 0, 0x2a0808, 'stone');
      F.blob(s * 7.8, 2.9, gz + 0.7, 0.7, 1.0, 0, glow, 'glow');
      F.rod(s * 6.4, 11.2, gz - 4.2, s * 6.4, 17.4, gz - 4.2, 0.14, 0x2a0808, 'metal');
      F.box(s * 6.4, 13.2, gz - 3.8, 0.1, 3.2, 1.5, 0, redA, 'cloth');
    });
    [0, 1, 2].forEach(function (i) {
      F.box(0, i * 0.38, gz + 0.5 + (2 - i) * 0.52, 14.5 - i * 1.5, 0.38, 0.66, 0, shade(stone, -0.2), 'stone');
    });

    /* 4 corner spires at roof level, gold tips */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      const cx = p[0] * 8, cz = p[1] * 8;
      F.frustum(cx, y, cz, 1.4, 0.7, 6, 0, stone, 'stone', 6);
      F.cone(cx, y + 6, cz, 0.7, 1.6, 0, gold, 'metal');
    });
    /* crown: ribbed gold dome */
    F.cyl(0, y, 0, 7, 3, 0, stone, 'stone');
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU;
      F.box(Math.sin(a) * 7, y, Math.cos(a) * 7, 0.4, 3, 0.4, a, shade(stone, -0.18), 'stone');
    }
    F.dome(0, y + 3, 0, 7, 8, 0, gold, 'dome');
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU;
      F.cone(Math.cos(a) * 5, y + 4, Math.sin(a) * 5, 1, 4.5, 0, shade(gold, -0.08), 'metal');
    }
    F.ball(0, y + 11.2, 0, 0.4, gold, 'metal');
    F.cone(0, y + 11.2, 0, 0.9, 2.2, 0, gold, 'metal');
  }
});

ASSET({
  key: 'voth_bldg_arena', name: 'Arena', culture: 'voth', family: 'civic',
  districts: ['canton'], wealth: [0.5, 1], w: 77, d: 77, h: 27.5, variants: 1,
  build: function (F) {
    const stone = 0x958c78, doorC = 0x1c1a16;
    const tiers = [
      { r: 33, y: 0, h: 5 },
      { r: 27, y: 5, h: 6 },
      { r: 21, y: 11, h: 7 },
      { r: 15, y: 18, h: 4 }
    ];
    const segs = 13;
    /* NB: the frame is handed — a box laid on a circle needs ry2 = -(a + PI/2)
       to sit TANGENT to it. With ry2 = a every segment points radially, which
       both looks like a starburst and inflates the bounding box by ~10%. */
    tiers.forEach(function (t, ti) {
      const boxW = (2 * Math.PI * t.r / segs) * 0.92;
      const boxD = 6.5;
      for (let i = 0; i < segs; i++) {
        const a = i / segs * TAU;
        const bx = Math.cos(a) * t.r, bz = Math.sin(a) * t.r;
        F.box(bx, t.y, bz, boxW, t.h, boxD, -(a + Math.PI / 2), shade(stone, -ti * 0.03), 'stone');
        /* seating steps read as a rake from outside, and the arcade from inside */
        if (ti < 2) {
          F.box(Math.cos(a) * (t.r - 3.0), t.y + t.h - 0.25, Math.sin(a) * (t.r - 3.0),
            boxW * 0.96, 0.3, 1.0, -(a + Math.PI / 2), shade(stone, 0.06), 'stone');
        }
        if (ti === 0 && i % 2 === 0) {
          F.box(Math.cos(a) * (t.r + 3.2), 0, Math.sin(a) * (t.r + 3.2),
            boxW * 0.42, 3.4, 0.4, -(a + Math.PI / 2), doorC, 'stone');
        }
        if (ti === 3 && i % 2 === 0) {
          F.rod(Math.cos(a) * (t.r + 2.6), t.y + t.h, Math.sin(a) * (t.r + 2.6),
            Math.cos(a) * (t.r + 2.6), t.y + t.h + 5.2, Math.sin(a) * (t.r + 2.6), 0.14, 0x3a2f22, 'metal');
          F.box(Math.cos(a) * (t.r + 2.6), t.y + t.h + 1.6, Math.sin(a) * (t.r + 2.6) + 0.35,
            0.1, 3.0, 1.5, -(a + Math.PI / 2), F.pick([0xa8241c, 0x2f5a86, 0xc9a227]), 'cloth');
        }
      }
    });
    /* sand, and the ring markings you can only see from above or from the stands */
    F.cyl(0, 0, 0, 13.5, 0.25, 0, 0x9a8f74, 'stone');
    F.cyl(0, 0.25, 0, 4.0, 0.08, 0, shade(0x9a8f74, -0.14), 'stone');
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      F.box(Math.cos(a) * 9, 0.25, Math.sin(a) * 9, 3.4, 0.1, 0.5, -(a + Math.PI / 2),
        shade(0x9a8f74, -0.2), 'stone');
    }
    /* four entry pavilions on the cardinals, tangent to the ring */
    [0, 1, 2, 3].forEach(function (q) {
      const a = q / 4 * TAU + Math.PI / 2;
      const rx = Math.cos(a) * 35.5, rz = Math.sin(a) * 35.5;
      const rc = F.pick([0x8c8579, 0x958e80]);
      const ar = -(a + Math.PI / 2);
      F.box(rx, 0, rz, 8.5, 6.5, 5, ar, rc, 'stone');
      F.box(rx, 6.2, rz, 8.9, 0.35, 5.4, ar, shade(rc, -0.13), 'stone');
      F.pyrRoof(rx, 6.55, rz, 9.2, 2.2, 5.6, ar, 0xb35a3a, 'roof');
      F.box(Math.cos(a) * 37.8, 0, Math.sin(a) * 37.8, 3.2, 4.4, 0.4, ar, doorC, 'stone');
      [-1, 1].forEach(function (s) {
        const ox = Math.cos(a) * 37.5 - Math.sin(a) * s * 2.6;
        const oz = Math.sin(a) * 37.5 + Math.cos(a) * s * 2.6;
        F.cyl(ox, 0, oz, 0.45, 5.2, 0, shade(rc, -0.12), 'stone');
        F.ball(ox, 5.9, oz, 0.42, 0xffb066, 'glow');
      });
    });
  }
});

ASSET({
  key: 'voth_bldg_warehouse', name: 'Warehouse', culture: 'voth', family: 'industrial',
  districts: ['harbour', 'market'], wealth: [0.2, 0.6], w: 16, d: 13.5, h: 10, variants: 1,
  build: function (F) {
    const c = 0x7a7062, cornice = shade(c, -0.18), roofC = 0x5a5248;
    const dark = shade(c, -0.32), timber = 0x4a3a28, doorC = 0x201d18;
    const poor = F.wealth < 0.35;
    function nrm(s) { return s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0]; }
    function W(cx, cy, cz, ww, wh, s, trim) {
      const n = nrm(s), flat = n[1] !== 0;
      F.box(cx, cy, cz, flat ? ww : 0.3, wh, flat ? 0.3 : ww, 0, doorC, 'wood');
      if (trim) {
        F.box(cx + n[0] * 0.14, cy - 0.24, cz + n[1] * 0.14,
          flat ? ww + 0.5 : 0.8, 0.24, flat ? 0.8 : ww + 0.5, 0, dark, 'stone');
        F.box(cx + n[0] * 0.08, cy + wh * 0.5, cz + n[1] * 0.08,
          flat ? ww : 0.36, 0.1, flat ? 0.36 : ww, 0, dark, 'metal');
      }
    }

    /* plinth, body, string course, eaves */
    F.box(0, 0, 0, 14.8, 0.6, 10.8, 0, dark, 'stone');
    F.box(0, 0.6, 0, 14, 6.2, 10, 0, c, 'stone');
    F.box(0, 3.7, 0, 14.25, 0.26, 10.25, 0, shade(c, 0.06), 'stone');
    F.box(0, 6.5, 0, 14.6, 0.38, 10.6, 0, cornice, 'stone');
    F.pyrRoof(0, 6.88, 0, 15.2, 2.9, 11.2, 0, roofC, 'roof');
    F.box(0, 9.2, 0, 1.5, 0.55, 1.5, 0, shade(roofC, -0.2), 'stone');

    /* pilaster buttresses so the flanks and the back are not blank */
    [-5.6, 5.6].forEach(function (px) {
      F.box(px, 0.6, 5.15, 1.0, 5.8, 0.45, 0, shade(c, -0.09), 'stone');
    });
    [-4.4, 0, 4.4].forEach(function (px) {
      F.box(px, 0.6, -5.15, 1.0, 5.8, 0.45, 0, shade(c, -0.09), 'stone');
    });
    [-3.0, 3.0].forEach(function (pz) {
      [-1, 1].forEach(function (s) {
        F.box(s * 7.15, 0.6, pz, 0.45, 5.8, 1.0, 0, shade(c, -0.09), 'stone');
      });
    });

    /* cargo doors */
    F.box(0, 0.6, 5.1, 5.4, 4.8, 0.5, 0, dark, 'stone');
    [-1, 1].forEach(function (s) {
      F.box(s * 1.2, 0.6, 5.38, 2.2, 4.0, 0.26, 0, doorC, 'wood');
      [1.2, 3.2].forEach(function (hy) {
        F.box(s * 1.2, hy, 5.54, 2.2, 0.16, 0.1, 0, 0x5a5a5e, 'metal');
      });
    });
    F.box(0, 5.4, 5.15, 6.0, 0.45, 0.9, 0, cornice, 'stone');
    /* awning on props over the doors */
    F.box(0, 5.0, 5.95, 5.8, 0.18, 1.7, 0, 0x6b4a2a, 'wood');
    [-2.5, 2.5].forEach(function (px) {
      F.rod(px, 0.6, 6.7, px, 5.0, 6.7, 0.13, timber, 'wood');
    });

    /* loading hatch + hoist beam through the roof slope */
    F.box(0, 6.9, 4.4, 2.6, 2.4, 0.4, 0, dark, 'stone');
    F.box(0, 6.9, 4.62, 2.0, 2.0, 0.24, 0, doorC, 'wood');
    F.beam(0, 7.6, 3.4, 0, 7.6, 6.5, 0.4, 0.55, timber, 'wood');
    F.ball(0, 7.4, 6.4, 0.32, 0x5a5a5e, 'metal');
    F.rod(0, 7.35, 6.4, 0, 3.4, 6.4, 0.05, 0x6b5a3a, 'rope');
    F.box(0, 2.3, 6.4, 1.1, 1.1, 1.1, 0.25, shade(timber, 0.12), 'wood');

    /* barred windows on the flanks and the back, shuttered on the weather side */
    [-2.6, 2.6].forEach(function (pz) {
      W(7.2, 4.6, pz, 1.1, 1.4, 2, true);
      W(-7.2, 4.6, pz, 1.1, 1.4, 3, true);
    });
    [-4.2, 0, 4.2].forEach(function (px) {
      W(px, 4.6, -5.1, 1.1, 1.4, 1, true);
    });
    [-1, 1].forEach(function (s) {
      F.box(-7.35, 4.6, s * 1.05 - 2.6, 0.14, 1.4, 0.5, 0, 0x5a4028, 'wood');
    });

    /* rainwater goods, guild plaque, roof vent */
    F.rod(7.05, 0.6, 5.0, 7.05, 6.5, 5.0, 0.13, dark, 'metal');
    F.box(7.05, 6.3, 5.0, 0.5, 0.45, 0.5, 0, dark, 'metal');
    F.box(0, 5.85, 5.18, 1.7, 0.85, 0.12, 0, poor ? 0x8a7a5a : 0xb08d3c, 'metal');
    F.box(-3.6, 8.0, 1.6, 1.0, 0.8, 1.0, 0, shade(roofC, -0.15), 'wood');

    /* quayside clutter: crates, barrels, bollards with a rope run */
    F.box(-6.6, 0, 5.9, 1.5, 1.4, 1.4, 0.22, shade(timber, 0.12), 'wood');
    F.box(-5.9, 1.4, 6.1, 1.2, 1.1, 1.2, -0.15, shade(timber, 0.05), 'wood');
    F.box(-7.4, 0, 3.9, 1.3, 1.2, 1.3, -0.3, shade(timber, 0.08), 'wood');
    [5.6, 7.0].forEach(function (px) {
      F.cyl(px, 0, -5.9, 0.62, 1.4, 0, 0x5a4a34, 'wood');
      F.cyl(px, 1.4, -5.9, 0.64, 0.1, 0, 0x3a3128, 'metal');
    });
    [-4.6, 4.6].forEach(function (px) {
      F.cyl(px, 0, 6.6, 0.32, 1.1, 0, timber, 'wood');
      F.ball(px, 1.15, 6.6, 0.34, shade(timber, -0.1), 'wood');
    });
    F.rod(-4.6, 1.0, 6.6, 4.6, 0.55, 6.6, 0.06, 0x6b5a3a, 'rope');
  }
});

ASSET({
  key: 'voth_bldg_customs_house', name: 'Customs House', culture: 'voth', family: 'civic',
  districts: ['harbour'], wealth: [0.6, 0.9], w: 21.5, d: 20, h: 15.5, variants: 1,
  build: function (F) {
    F.shift(0, -1.37); /* centre the footprint on the origin (verify.py declared-size) */
    const c = F.pick([0x8c8579, 0x958e80, 0x8b8069]), cornice = shade(c, -0.13);
    const doorC = 0x1c1a16, timber = 0x4a3a28, glow = 0xffcf87;
    function nrm(s) { return s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0]; }
    function W(cx, cy, cz, ww, wh, s, trim, shut) {
      const n = nrm(s), flat = n[1] !== 0;
      F.box(cx, cy, cz, flat ? ww : 0.3, wh, flat ? 0.3 : ww, 0, doorC, 'wood');
      if (trim) {
        F.box(cx + n[0] * 0.14, cy - 0.26, cz + n[1] * 0.14,
          flat ? ww + 0.6 : 0.85, 0.26, flat ? 0.85 : ww + 0.6, 0, shade(c, -0.24), 'stone');
        F.box(cx + n[0] * 0.08, cy + wh, cz + n[1] * 0.08,
          flat ? ww + 0.6 : 0.7, 0.22, flat ? 0.7 : ww + 0.6, 0, shade(c, -0.24), 'stone');
      }
      if (shut) {
        for (let k = -1; k <= 1; k += 2) {
          F.box(cx + (flat ? k * (ww / 2 + 0.25) : n[0] * 0.16), cy,
            cz + (flat ? n[1] * 0.16 : k * (ww / 2 + 0.25)),
            flat ? 0.46 : 0.16, wh, flat ? 0.16 : 0.46, 0, 0x46603f, 'wood');
        }
      }
    }

    F.box(0, 0, 0, 20.8, 0.6, 16.8, 0, shade(c, -0.26), 'stone');
    F.box(0, 0.6, 0, 20, 8, 16, 0, c, 'stone');
    F.box(0, 4.2, 0, 20.3, 0.35, 16.3, 0, cornice, 'stone');
    F.box(0, 8.2, 0, 20.4, 0.4, 16.4, 0, cornice, 'stone');
    F.box(0, 8.6, 0, 19.2, 0.5, 15.2, 0, shade(c, -0.05), 'stone');
    /* quoins on all four corners */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      F.box(p[0] * 9.85, 0.6, p[1] * 7.85, 1.3, 7.6, 1.3, 0, shade(c, 0.07), 'stone');
    });

    /* pedimented entrance porch, off-centre to the left as before */
    F.box(-4, 0.6, 8.15, 4.6, 6.2, 0.5, 0, shade(c, -0.18), 'stone');
    F.box(-4, 0.6, 8.35, 1.8, 2.8, 0.3, 0, doorC, 'wood');
    F.pyrRoof(-4, 8.4, 9.2, 6.4, 1.7, 3.4, 0, cornice, 'roof');
    F.box(-4, 7.9, 9.2, 6.6, 0.5, 3.6, 0, cornice, 'stone');
    [-2.7, -5.3].forEach(function (px) {
      F.cyl(px, 0.6, 9.9, 0.4, 7.3, 0, shade(c, -0.1), 'stone');
      F.box(px, 0.3, 9.9, 1.1, 0.45, 1.1, 0, shade(c, -0.2), 'stone');
      F.box(px, 7.9, 9.9, 1.0, 0.35, 1.0, 0, cornice, 'stone');
    });
    [0, 1].forEach(function (i) {
      F.box(-4, i * 0.3, 10.9 - i * 0.45, 6.6 - i * 0.7, 0.3, 0.9, 0, shade(c, -0.24), 'stone');
    });
    F.rod(-7.6, 5.4, 8.25, -7.6, 5.4, 9.1, 0.08, 0x3a2f22, 'metal');
    F.ball(-7.6, 5.05, 9.1, 0.28, glow, 'glow');
    F.box(-0.2, 3.4, 8.25, 2.2, 1.5, 0.14, 0, 0xb08d3c, 'metal');

    /* lantern cupola */
    F.cyl(2, 8.6, 0, 1.9, 2.4, 0, shade(c, 0.03), 'stone');
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU;
      F.box(2 + Math.sin(a) * 1.9, 8.6, Math.cos(a) * 1.9, 0.3, 2.4, 0.3, a, shade(c, -0.16), 'stone');
    }
    F.cyl(2, 11.0, 0, 1.5, 1.4, 0, 0xffcf87, 'glass');
    F.cone(2, 12.4, 0, 1.6, 2.0, 0, shade(c, -0.18), 'roof');
    F.ball(2, 14.4, 0, 0.3, 0xd0a53c, 'metal');
    F.rod(2, 14.4, 0, 2, 15.6, 0, 0.06, 0x3a2f22, 'metal');

    /* windows on every elevation */
    [-6.8, 0.6, 6.8].forEach(function (px) {
      if (px < -3) return;
      W(px, 1.9, 8.05, 1.3, 1.7, 0, true, true);
    });
    [-6.8, -2.2, 2.2, 6.8].forEach(function (px) {
      W(px, 5.6, 8.05, 1.2, 1.6, 0, true, false);
      W(px, 1.9, -8.05, 1.2, 1.6, 1, true, false);
    });
    [-4.6, 4.6].forEach(function (pz) {
      W(10.05, 1.9, pz, 1.2, 1.6, 2, true, false);
      W(10.05, 5.6, pz, 1.1, 1.5, 2, true, false);
      W(-10.05, 1.9, pz, 1.2, 1.6, 3, true, false);
      W(-10.05, 5.6, pz, 1.1, 1.5, 3, false, false);
    });
    F.box(-10.05, 0.6, 4.6, 0.3, 2.6, 1.6, 0, doorC, 'wood');

    /* quayside: bollards with a rope run, notice board, flag mast */
    [-8.2, -2.4, 3.4].forEach(function (px) {
      F.cyl(px, 0, 9.6, 0.34, 1.2, 0, timber, 'wood');
      F.ball(px, 1.25, 9.6, 0.36, shade(timber, -0.1), 'wood');
    });
    F.rod(-8.2, 1.1, 9.6, -2.4, 0.7, 9.6, 0.06, 0x6b5a3a, 'rope');
    F.rod(-2.4, 0.7, 9.6, 3.4, 1.1, 9.6, 0.06, 0x6b5a3a, 'rope');
    F.rod(6.6, 0, 8.6, 6.6, 2.4, 8.6, 0.12, timber, 'wood');
    F.box(6.6, 1.6, 8.7, 1.6, 1.2, 0.12, 0.2, 0x6b4a2a, 'wood');
    F.rod(8.4, 8.6, -5.2, 8.4, 14.2, -5.2, 0.13, 0x3a2f22, 'metal');
    F.box(8.4, 11.4, -4.8, 0.1, 2.4, 1.4, 0, 0x2f5a86, 'cloth');
    F.box(-8.6, 8.6, -5.6, 1.0, 2.6, 1.0, 0, shade(c, -0.24), 'stone');
    F.box(-8.6, 11.2, -5.6, 1.3, 0.5, 1.3, 0, shade(c, -0.34), 'stone');
  }
});

ASSET({
  key: 'voth_bldg_house_of_healing', name: 'House of Healing', culture: 'voth', family: 'civic',
  districts: ['canton'], wealth: [0.6, 0.9], w: 57, d: 61, h: 23, variants: 1,
  build: function (F) {
    const c = F.pick([0x8c8579, 0x958e80]), cornice = shade(c, -0.13);
    const darkTone = shade(0x8a8f92, -0.18), doorC = 0x1c1a16;
    const half = 28, wallD = 8, wallH = 15, innerHalf = half - wallD;

    F.box(0, 0, -(half - wallD / 2), 56, wallH, wallD, 0, c, 'stone');
    F.box(0, wallH / 2 - 0.2, -(half - wallD / 2), 56.3, 0.3, wallD + 0.3, 0, cornice, 'stone');
    [-1, 1].forEach(function (s) {
      F.box(s * (half - wallD / 2), 0, 0, wallD, wallH, 56, 0, c, 'stone');
      F.box(s * (half - wallD / 2), wallH / 2 - 0.2, 0, wallD + 0.3, 0.3, 56.3, 0, cornice, 'stone');
    });
    const gap = 10, segW = (56 - gap) / 2;
    [-1, 1].forEach(function (s) {
      const cx = s * (gap / 2 + segW / 2);
      F.box(cx, 0, half - wallD / 2, segW, wallH, wallD, 0, c, 'stone');
      F.box(cx, wallH / 2 - 0.2, half - wallD / 2, segW + 0.3, 0.3, wallD + 0.3, 0, cornice, 'stone');
    });
    /* gated entrance: recessed opening, flanking columns, entry stair */
    F.box(0, 0, half - wallD / 2, gap + 2, wallH + 2, wallD * 0.6, 0, shade(c, -0.06), 'stone');
    F.box(0, 0, half - 1, gap - 3, 8, 1, 0, doorC, 'stone');
    F.cyl(-gap / 2 - 1.4, 0, half - 1, 0.4, 8.5, 0, shade(c, -0.1), 'stone');
    F.cyl(gap / 2 + 1.4, 0, half - 1, 0.4, 8.5, 0, shade(c, -0.1), 'stone');
    F.box(0, 8.6, half - 1, gap + 1, 0.5, 1.4, 0, cornice, 'stone');
    [-1, 1].forEach(function (s) {
      F.rod(s * (gap / 2 + 3.2), 9.6, half - 0.6, s * (gap / 2 + 3.2), 9.6, half + 0.4, 0.08, 0x3a2f22, 'metal');
      F.ball(s * (gap / 2 + 3.2), 9.25, half + 0.4, 0.3, 0xffcf87, 'glow');
    });
    for (let i = 0; i < 3; i++) {
      F.box(0, i * 0.35, half + 1 + i * 1.2, gap - 1, 0.35, 1.2, 0, shade(c, -0.05), 'stone');
    }
    F.box(0, wallH - 0.3, -(half - wallD / 2), 56.3, 0.5, wallD + 0.3, 0, darkTone, 'roof');

    /* the outer face was a blank 56 m ribbon on three sides — give it a real elevation */
    function outerRow(s, ys, wh) {
      /* s: 0 = +z front, 1 = -z back, 2 = +x, 3 = -x */
      const n = s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0];
      const flat = n[1] !== 0;
      for (let i = 0; i < 5; i++) {
        const u = -20 + i * 10;
        if (s === 0 && Math.abs(u) < 8) continue;
        const px = flat ? u : n[0] * (half + 0.05);
        const pz = flat ? n[1] * (half + 0.05) : u;
        F.box(px, ys, pz, flat ? 1.4 : 0.3, wh, flat ? 0.3 : 1.4, 0, doorC, 'wood');
        F.box(px + n[0] * 0.15, ys - 0.28, pz + n[1] * 0.15,
          flat ? 2.0 : 0.9, 0.28, flat ? 0.9 : 2.0, 0, shade(c, -0.24), 'stone');
      }
    }
    outerRow(0, 3.0, 2.0);
    outerRow(0, 9.5, 1.8);
    outerRow(1, 3.0, 2.0);
    outerRow(1, 9.5, 1.8);
    outerRow(2, 3.0, 2.0);
    outerRow(3, 3.0, 2.0);
    /* buttress pilasters between them, all four sides */
    [-25, -15, 15, 25].forEach(function (u) {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (n) {
        const flat = n[1] !== 0;
        F.box(flat ? u : n[0] * (half + 0.4), 0, flat ? n[1] * (half + 0.4) : u,
          flat ? 1.6 : 0.8, wallH - 1.2, flat ? 0.8 : 1.6, 0, shade(c, 0.05), 'stone');
      });
    });

    /* covered cloister walkway along the inner face of each wall */
    F.box(0, 6, -(innerHalf - 1.5), 52, 3, 3, 0, darkTone, 'roof');
    F.box(0, 6, innerHalf - 1.5, 52, 3, 3, 0, darkTone, 'roof');
    [-1, 1].forEach(function (s) {
      F.box(s * (innerHalf - 1.5), 6, 0, 3, 3, 52, 0, darkTone, 'roof');
    });
    for (let i = 0; i < 5; i++) {
      const u = -16 + i * 8;
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (n) {
        const flat = n[1] !== 0;
        F.cyl(flat ? u : n[0] * (innerHalf - 1.5), 0, flat ? n[1] * (innerHalf - 1.5) : u,
          0.32, 6, 0, shade(c, -0.1), 'stone');
      });
    }
    /* corner turrets: a sides:4 frustum of half-width 3 is 6 m across and sits
       squarely on the 8 m thick wall head */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      const tx = p[0] * (half - wallD / 2), tz = p[1] * (half - wallD / 2);
      F.frustum(tx, wallH, tz, 3, 2.3, 5, 0, shade(c, -0.05), 'stone', 4);
      F.box(tx, wallH + 4.7, tz, 5.2, 0.4, 5.2, 0, cornice, 'stone');
      F.dome(tx, wallH + 5.1, tz, 2.3, 2.5, 0, darkTone, 'dome');
      F.ball(tx, wallH + 7.7, tz, 0.3, 0xd0a53c, 'metal');
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (n) {
        const flat = n[1] !== 0;
        F.box(tx + n[0] * 2.75, wallH + 1.6, tz + n[1] * 2.75,
          flat ? 0.9 : 0.25, 1.5, flat ? 0.25 : 0.9, 0, doorC, 'wood');
      });
    });
    /* courtyard planting and the healing-spring basin */
    F.cyl(0, 0, 0, 3.2, 0.6, 0, shade(c, -0.14), 'stone');
    F.cyl(0, 0.6, 0, 2.7, 0.14, 0, 0x4a6a78, 'glass');
    F.cyl(0, 0.6, 0, 0.6, 1.5, 0, shade(c, -0.22), 'stone');
    F.blob(0, 2.3, 0, 0.8, 0.9, 0, 0x4a6a78, 'glass');
    for (let i = 0; i < 6; i++) {
      F.blob(F.rr(-14, 14), 0.6, F.rr(-14, 14), F.rr(0.6, 1), F.rr(1, 1.6), F.rnd() * TAU,
        F.pick([0x556b2f, 0x4a5e28]), 'leafy');
    }
    [-1, 1].forEach(function (s) {
      F.box(s * 7, 0, 5, 2.4, 0.5, 0.7, 0, shade(c, -0.2), 'wood');
      F.box(s * 7, 0, -5, 2.4, 0.5, 0.7, 0, shade(c, -0.2), 'wood');
    });
  }
});

ASSET({
  key: 'voth_bldg_tavern', name: 'Tavern', culture: 'voth', family: 'civic',
  districts: ['common'], wealth: [0.3, 0.6], w: 22, d: 33, h: 20.5, variants: 1,
  build: function (F) {
    const c = F.pick([0x8c8579, 0x958e80, 0x8b8069]), cornice = shade(c, -0.13);
    const blue = 0x2f5a86, doorC = 0x1c1a16, timber = 0x4a3a28, glow = 0xffcf87;
    function nrm(s) { return s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0]; }
    function W(cx, cy, cz, ww, wh, s, trim, shut) {
      const n = nrm(s), flat = n[1] !== 0;
      F.box(cx, cy, cz, flat ? ww : 0.3, wh, flat ? 0.3 : ww, 0, doorC, 'wood');
      if (trim) {
        F.box(cx + n[0] * 0.14, cy - 0.26, cz + n[1] * 0.14,
          flat ? ww + 0.6 : 0.85, 0.26, flat ? 0.85 : ww + 0.6, 0, shade(c, -0.24), 'stone');
      }
      if (shut) {
        for (let k = -1; k <= 1; k += 2) {
          F.box(cx + (flat ? k * (ww / 2 + 0.25) : n[0] * 0.16), cy,
            cz + (flat ? n[1] * 0.16 : k * (ww / 2 + 0.25)),
            flat ? 0.46 : 0.16, wh, flat ? 0.16 : 0.46, 0, 0x5a4028, 'wood');
        }
      }
    }

    F.box(0, 0, 0, 20.8, 0.55, 30.8, 0, shade(c, -0.26), 'stone');
    F.box(0, 0.55, 0, 20, 7, 30, 0, c, 'stone');
    F.box(0, 7.25, 0, 20.3, 0.3, 30.3, 0, cornice, 'stone');
    F.box(0, 7.55, 0, 17.2, 5, 26, 0, shade(c, 0.04), 'stone');
    F.box(0, 12.25, 0, 17.5, 0.3, 26.3, 0, cornice, 'stone');
    F.pyrRoof(0, 12.55, 0, 19, 7.5, 27, 0, blue, 'roof');
    F.box(0, 18.5, 0, 1.4, 0.6, 1.4, 0, shade(blue, -0.2), 'roof');
    F.box(6, 0.55, -10, 1.1, 15.5, 1.1, 0, shade(c, -0.2), 'stone');
    F.box(6, 16.05, -10, 1.4, 0.7, 1.4, 0, shade(c, -0.3), 'stone');
    F.cyl(6, 16.75, -10, 0.4, 0.6, 0, 0x3a3128, 'metal');
    F.box(-6.5, 12.55, 6, 0.9, 2.4, 0.9, 0, shade(c, -0.22), 'stone');
    F.box(-6.5, 14.95, 6, 1.2, 0.5, 1.2, 0, shade(c, -0.32), 'stone');

    /* door, sign, lanterns */
    F.box(0, 0.55, 15.1, 3.0, 3.6, 0.45, 0, shade(c, -0.2), 'stone');
    F.box(0, 0.55, 15.35, 2, 2.8, 0.28, 0, doorC, 'wood');
    F.box(0, 4.15, 15.2, 3.4, 0.4, 0.8, 0, cornice, 'stone');
    F.box(0, 5.1, 15.6, 6.4, 0.2, 1.9, 0, 0x6b4a2a, 'wood');
    [-2.7, 2.7].forEach(function (px) {
      F.rod(px, 0.55, 16.4, px, 5.1, 16.4, 0.13, timber, 'wood');
    });
    F.rod(3.2, 6.4, 15.2, 4.9, 6.4, 15.2, 0.09, 0x3a2f22, 'metal');
    F.rod(4.8, 6.4, 15.2, 4.8, 5.1, 15.2, 0.06, 0x3a2f22, 'metal');
    F.box(4.8, 3.6, 15.2, 1.4, 1.5, 0.14, 0, 0x6b4a2a, 'wood');
    [-4.4, 4.4].forEach(function (px) {
      F.rod(px, 4.6, 15.15, px, 4.6, 15.8, 0.07, 0x3a2f22, 'metal');
      F.ball(px, 4.3, 15.8, 0.28, glow, 'glow');
    });

    /* external stair to the first-floor room door on the right flank */
    for (let i = 0; i < 6; i++) {
      F.box(10.4, 0.55 + i * 1.15, 6 - i * 1.4, 1.1, 0.35, 1.5, 0, shade(c, -0.1), 'wood');
      if (i % 2 === 0) F.rod(11.0, 0.9 + i * 1.15, 6 - i * 1.4, 11.0, 2.0 + i * 1.15, 6 - i * 1.4, 0.07, timber, 'metal');
    }
    F.rod(11.0, 2.0, 6, 11.0, 7.7, -1.6, 0.06, timber, 'metal');
    F.box(10.2, 7.55, -3, 1.9, 0.3, 2.4, 0, shade(c, -0.1), 'wood');
    F.box(10.15, 7.85, -3, 0.3, 2.4, 1.6, 0, doorC, 'wood');

    /* windows on all four elevations */
    [4.6, 8.8].forEach(function (fy) {
      [-6, 0, 6].forEach(function (fx) {
        W(fx, fy, 15.05, 1.2, 1.5, 0, true, fy < 6);
      });
    });
    [-4, 4].forEach(function (fx) {
      W(fx, 3.0, -15.05, 1.2, 1.5, 1, true, false);
      W(fx, 9.0, -15.05, 1.1, 1.4, 1, false, false);
    });
    [-10, -3, 4, 11].forEach(function (fz) {
      W(10.05, 3.0, fz, 1.2, 1.5, 2, true, false);
      W(-10.05, 3.0, fz, 1.2, 1.5, 3, true, false);
      W(-10.05, 9.0, fz, 1.1, 1.4, 3, true, false);
    });
    [-8, 0, 8].forEach(function (fz) {
      W(8.65, 9.0, fz, 1.1, 1.4, 2, false, false);
    });

    /* street furniture out front: bench, barrels, a brazier */
    F.box(-7.2, 0, 16.1, 3.2, 0.5, 0.8, 0, shade(c, -0.2), 'wood');
    F.box(-7.2, 0.5, 15.8, 3.2, 0.9, 0.2, 0, shade(c, -0.24), 'wood');
    [6.6, 8.0].forEach(function (px) {
      F.cyl(px, 0, 16.0, 0.6, 1.3, 0, 0x5a4a34, 'wood');
      F.cyl(px, 1.3, 16.0, 0.62, 0.1, 0, 0x3a3128, 'metal');
    });
    F.cyl(-2.6, 0, 16.4, 0.5, 0.9, 0, 0x3a3128, 'metal');
    F.blob(-2.6, 1.1, 16.4, 0.5, 0.6, 0, 0xffb066, 'glow');
  }
});

ASSET({
  key: 'voth_bldg_monastery_chapel', name: 'Monastery Chapel', culture: 'voth', family: 'religious',
  districts: ['monastery'], wealth: [0.5, 0.8], w: 37.5, d: 28.5, h: 32, variants: 1,
  build: function (F) {
    const stone = 0x958c78, cornice = shade(stone, -0.13);
    const crimson = shade(0x9c2d2d, -0.05), doorC = 0x1c1a16;
    const glassColors = [0xa8241c, 0xc9a227, 0x6b3fa0];

    F.box(0, 0, 0, 34.8, 0.6, 25.8, 0, shade(stone, -0.26), 'stone');
    F.box(0, 0.6, 0, 34, 17, 25, 0, stone, 'stone');
    F.box(0, 8.4, 0, 34.3, 0.3, 25.3, 0, shade(stone, 0.05), 'stone');
    F.box(0, 17.2, 0, 34.4, 0.4, 25.4, 0, cornice, 'stone');
    F.pyrRoof(0, 17.6, 0, 35, 8, 26, 0, crimson, 'roof');
    F.box(0, 24.2, 0, 1.6, 0.7, 1.6, 0, shade(crimson, -0.2), 'roof');
    /* corner stair turrets */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      const tx = p[0] * 15, tz = p[1] * 10.5;
      F.frustum(tx, 0, tz, 2.1, 1.7, 27, 0, shade(stone, -0.03), 'stone', 8);
      F.cone(tx, 27, tz, 1.9, 4.5, 0, crimson, 'roof');
      F.ball(tx, 31.5, tz, 0.3, 0xc9a227, 'metal');
      F.cyl(tx, 24, tz, 0.35, 0.5, 0, 0x2a2620, 'metal');
      [6, 12, 18].forEach(function (wy) {
        const r = 2.1 + (1.7 - 2.1) * (wy / 27);
        F.box(p[0] * (15 + (r + 0.05) * 0.7), wy, p[1] * (10.5 + (r + 0.05) * 0.7),
          0.6, 1.6, 0.6, p[0] * p[1] * 0.78, doorC, 'wood');
      });
    });
    /* west front: portal, tympanum, rose window */
    F.box(0, 0.6, 12.4, 6.4, 8.4, 0.8, 0, shade(stone, -0.1), 'stone');
    F.box(0, 0.6, 12.9, 4, 6, 0.5, 0, doorC, 'stone');
    F.dome(0, 6.8, 12.8, 2.3, 1.4, 0, shade(stone, -0.08), 'dome');
    F.box(0, 9.0, 12.5, 7.2, 0.5, 1.1, 0, cornice, 'stone');
    F.cyl(0, 11.4, 12.6, 2.6, 0.35, 0, shade(stone, -0.12), 'stone');
    F.cyl(0, 11.5, 12.7, 2.1, 0.35, 0, F.pick(glassColors), 'glass');
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      F.box(Math.sin(a) * 1.4, 11.5, 12.75 + 0, 0.22, 0.35, 2.8, a, shade(stone, -0.12), 'stone');
    }
    [-1, 1].forEach(function (s) {
      F.cyl(s * 4.0, 0.6, 13.1, 0.42, 8.4, 0, shade(stone, -0.12), 'stone');
      F.box(s * 4.0, 9.0, 13.1, 1.1, 0.4, 1.1, 0, cornice, 'stone');
      F.rod(s * 5.6, 5.4, 12.5, s * 5.6, 5.4, 13.3, 0.08, 0x3a2f22, 'metal');
      F.ball(s * 5.6, 5.05, 13.3, 0.3, 0xffcf87, 'glow');
    });
    [0, 1, 2].forEach(function (i) {
      F.box(0, i * 0.3, 13.4 + (2 - i) * 0.5, 7.0 - i * 0.8, 0.3, 0.7, 0, shade(stone, -0.22), 'stone');
    });
    /* buttresses and clerestory glass on both flanks, plain lancets at the back */
    [-1, 1].forEach(function (s) {
      for (let i = 0; i < 4; i++) {
        const gz = -9 + i * 6;
        F.box(s * 17.05, 5.0, gz, 0.25, 3.4, 1.5, 0, F.pick(glassColors), 'glass');
        F.box(s * 17.05, 11.4, gz, 0.25, 2.6, 1.2, 0, F.pick(glassColors), 'glass');
      }
      for (let i = 0; i < 5; i++) {
        const bz = -11 + i * 5.5;
        F.box(s * 17.7, 0.6, bz, 1.4, 13.5, 1.5, 0, shade(stone, 0.05), 'stone');
        F.box(s * 17.7, 14.1, bz, 1.7, 0.4, 1.8, 0, cornice, 'stone');
      }
    });
    [-9, -3, 3, 9].forEach(function (px) {
      F.box(px, 5.0, -12.55, 1.3, 3.2, 0.25, 0, F.pick(glassColors), 'glass');
      F.box(px + 0, 4.7, -12.7, 1.9, 0.3, 0.7, 0, shade(stone, -0.24), 'stone');
    });
    F.box(0, 0.6, -12.55, 2.4, 3.2, 0.35, 0, doorC, 'wood');
  }
});

ASSET({
  key: 'voth_bldg_monastery_dorm', name: 'Monastery Dormitory', culture: 'voth', family: 'religious',
  districts: ['monastery'], wealth: [0.4, 0.6], w: 27.5, d: 27.5, h: 22.5, variants: 1,
  build: function (F) {
    const stone = 0x8f8977, cornice = shade(stone, -0.13), doorC = 0x1c1a16;
    F.box(0, 0, 0, 26.8, 0.55, 25.8, 0, shade(stone, -0.26), 'stone');
    F.box(0, 0.55, 0, 26, 10, 25, 0, stone, 'stone');
    F.box(0, 10.25, 0, 26.35, 0.35, 25.35, 0, cornice, 'stone');
    F.box(0, 10.6, 0, 26, 8, 25, 0, shade(stone, 0.02), 'stone');
    F.box(0, 18.4, 0, 26.35, 0.35, 25.35, 0, cornice, 'stone');
    F.pyrRoof(0, 18.75, 0, 27, 3, 26, 0, shade(0x9c2d2d, 0), 'roof');
    F.box(0, 20.8, 0, 1.3, 0.55, 1.3, 0, shade(0x9c2d2d, -0.2), 'roof');
    /* entrance pair with a shared hood */
    [-3, 3].forEach(function (px) {
      F.box(px, 0.55, 12.6, 2.4, 3.4, 0.5, 0, shade(stone, -0.18), 'stone');
      F.box(px, 0.55, 12.85, 1.6, 2.6, 0.28, 0, doorC, 'wood');
    });
    F.box(0, 4.0, 12.7, 9.0, 0.45, 1.1, 0, cornice, 'stone');
    [-5.4, 5.4].forEach(function (px) {
      F.rod(px, 3.2, 12.65, px, 3.2, 13.35, 0.08, 0x3a2f22, 'metal');
      F.ball(px, 2.9, 13.35, 0.28, 0xffcf87, 'glow');
    });
    [0, 1].forEach(function (i) {
      F.box(0, i * 0.3, 13.4 + (1 - i) * 0.45, 9.4 - i * 0.9, 0.3, 0.8, 0, shade(stone, -0.24), 'stone');
    });
    /* cell windows, both storeys, all four sides */
    [-1, 1].forEach(function (s) {
      [3.5, 13.5].forEach(function (fy) {
        for (let i = 0; i < 5; i++) {
          const fz = -10 + i * 5;
          F.box(s * 13.05, fy, fz, 0.25, 1.3, 1.1, 0, doorC, 'wood');
          F.box(s * 13.2, fy - 0.24, fz, 0.8, 0.24, 1.7, 0, shade(stone, -0.24), 'stone');
        }
      });
    });
    [-1, 1].forEach(function (s) {
      [3.5, 13.5].forEach(function (fy) {
        [-8.5, -3.5, 3.5, 8.5].forEach(function (px) {
          if (s > 0 && fy < 6 && Math.abs(px) < 6) return;
          F.box(px, fy, s * 12.55, 1.1, 1.3, 0.25, 0, doorC, 'wood');
          F.box(px, fy - 0.24, s * 12.7, 1.7, 0.24, 0.8, 0, shade(stone, -0.24), 'stone');
        });
      });
    });
    /* pilaster strips between the cells, and chimneys */
    [-10, 0, 10].forEach(function (u) {
      [[0, -1], [1, 0], [-1, 0]].forEach(function (n) {
        const flat = n[1] !== 0;
        F.box(flat ? u : n[0] * 13.3, 0.55, flat ? n[1] * 12.8 : u,
          flat ? 1.2 : 0.7, 17.6, flat ? 0.7 : 1.2, 0, shade(stone, 0.05), 'stone');
      });
    });
    [-8, 8].forEach(function (px) {
      F.box(px, 18.75, -8, 1.0, 3.0, 1.0, 0, shade(stone, -0.22), 'stone');
      F.box(px, 21.75, -8, 1.3, 0.5, 1.3, 0, shade(stone, -0.32), 'stone');
    });
    /* cloister bench and water trough along the front */
    F.box(-9.5, 0, 13.4, 4.0, 0.5, 0.9, 0, shade(stone, -0.2), 'wood');
    F.box(9.5, 0, 13.4, 2.6, 0.8, 1.2, 0, shade(stone, -0.16), 'stone');
    F.box(9.5, 0.8, 13.4, 2.2, 0.12, 0.85, 0, 0x4a6a78, 'glass');
  }
});

ASSET({
  key: 'voth_bldg_monastery_hall', name: 'Monastery Assembly Hall', culture: 'voth', family: 'religious',
  districts: ['monastery'], wealth: [0.5, 0.8],
  /* the cloister block used to sit off to one side at bx=-26, which put a third
     of the building outside its declared footprint. It is now attached behind
     the hall, on the centre line, and the declared depth covers it. */
  w: 33.5, d: 46.5, h: 38, variants: 1,
  build: function (F) {
    F.shift(0, 8.2); /* centre the footprint on the origin (verify.py declared-size) */
    const stone = 0x93897a, cornice = shade(stone, -0.13);
    const mutedRed = shade(0x9c2d2d, 0.08), doorC = 0x1c1a16;
    F.box(0, 0, 0, 30.8, 0.55, 25.8, 0, shade(stone, -0.26), 'stone');
    let y = 0.55;
    [10, 9.5, 9].forEach(function (fh, i) {
      F.box(0, y, 0, 30, fh, 25, 0, shade(stone, -i * 0.02), 'stone');
      F.box(0, y + fh - 0.28, 0, 30.35, 0.35, 25.35, 0, cornice, 'stone');
      y += fh;
    });
    F.pyrRoof(0, y, 0, 32, 3.5, 27, 0, shade(mutedRed, 0.08), 'roof');
    F.pyrRoof(0, y + 2, 0, 20, 6, 17, 0, mutedRed, 'roof');
    F.box(0, y + 7.6, 0, 1.6, 0.7, 1.6, 0, shade(mutedRed, -0.2), 'roof');
    /* entrance on the gable end, stone surround + double door + hood */
    F.box(0, 0.55, 12.6, 6.4, 8, 0.9, 0, shade(stone, -0.1), 'stone');
    [-1.6, 1.6].forEach(function (px) {
      F.box(px, 0.55, 13.05, 1.6, 3, 0.4, 0, doorC, 'wood');
    });
    F.box(0, 8.55, 12.7, 7.2, 0.5, 1.3, 0, cornice, 'stone');
    [-1, 1].forEach(function (s) {
      F.cyl(s * 4.0, 0.55, 13.15, 0.4, 8.0, 0, shade(stone, -0.12), 'stone');
      F.rod(s * 5.4, 5.2, 12.6, s * 5.4, 5.2, 13.4, 0.08, 0x3a2f22, 'metal');
      F.ball(s * 5.4, 4.85, 13.4, 0.3, 0xffcf87, 'glow');
      F.rod(s * 8.4, 0.55, 12.7, s * 8.4, 11.5, 12.7, 0.12, 0x3a2f22, 'metal');
      F.box(s * 8.4, 7.4, 13.1, 0.1, 3.2, 1.4, 0, 0xa8241c, 'cloth');
    });
    [0, 1, 2].forEach(function (i) {
      F.box(0, i * 0.3, 13.6 + (2 - i) * 0.5, 7.4 - i * 0.7, 0.3, 0.7, 0, shade(stone, -0.24), 'stone');
    });
    /* tall hall windows on both flanks and the back, three storeys of them */
    [-1, 1].forEach(function (s) {
      [2.5, 12, 21].forEach(function (fy) {
        [-9, 0, 9].forEach(function (fz) {
          F.box(s * 15.05, fy, fz, 0.25, 2.4, 1.2, 0, doorC, 'wood');
          F.box(s * 15.2, fy - 0.26, fz, 0.85, 0.26, 1.8, 0, shade(stone, -0.24), 'stone');
        });
      });
      for (let i = 0; i < 4; i++) {
        F.box(s * 15.7, 0.55, -10.5 + i * 7, 1.4, 19.0, 1.6, 0, shade(stone, 0.05), 'stone');
        F.box(s * 15.7, 19.55, -10.5 + i * 7, 1.7, 0.4, 1.9, 0, cornice, 'stone');
      }
    });
    [2.5, 12, 21].forEach(function (fy) {
      [-9, -3, 3, 9].forEach(function (px) {
        F.box(px, fy, -12.55, 1.2, 2.4, 0.25, 0, doorC, 'wood');
      });
    });
    F.box(0, 0.55, -12.6, 2.6, 3.2, 0.5, 0, doorC, 'wood');

    /* attached 2-storey cloister block, open arcade below, open to the sky.
       Behind the hall and on its centre line so the whole asset stays inside
       its declared box. */
    const bz = -21, r = 9, postN = 8;
    for (let i = 0; i < postN; i++) {
      const a = i / postN * TAU;
      const px = Math.cos(a) * r, pz = bz + Math.sin(a) * r;
      F.cyl(px, 0, pz, 0.35, 3.6, 0, shade(stone, -0.1), 'stone');
      const a2 = (i + 1) / postN * TAU;
      const qx = Math.cos(a2) * r, qz = bz + Math.sin(a2) * r;
      F.beam(px, 3.6, pz, qx, 3.6, qz, 0.4, 0.4, shade(stone, -0.1), 'stone');
    }
    const wallSegs = 8;
    for (let i = 0; i < wallSegs; i++) {
      const a = i / wallSegs * TAU;
      const wx = Math.cos(a) * (r + 0.5), wz = bz + Math.sin(a) * (r + 0.5);
      /* tangent, not radial: ry2 = -(a + PI/2) */
      F.box(wx, 3.6, wz, (2 * Math.PI * (r + 0.5) / wallSegs) * 0.95, 3.4, 1.3,
        -(a + Math.PI / 2), stone, 'stone');
      F.box(wx, 6.9, wz, (2 * Math.PI * (r + 0.5) / wallSegs) * 0.98, 0.35, 1.7,
        -(a + Math.PI / 2), cornice, 'stone');
    }
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) / wallSegs * TAU;
      F.box(Math.cos(a) * (r + 0.6), 5, bz + Math.sin(a) * (r + 0.6), 0.9, 1.6, 0.25,
        -(a + Math.PI / 2), doorC, 'wood');
    }
    F.cyl(0, 0, bz, 1.5, 0.8, 0, shade(stone, -0.16), 'stone');
    F.cyl(0, 0.8, bz, 1.2, 0.14, 0, 0x4a6a78, 'glass');
    for (let i = 0; i < 4; i++) {
      F.blob(F.rr(-5, 5), 0.5, bz + F.rr(-5, 5), F.rr(0.6, 0.9), F.rr(1, 1.4), F.rnd() * TAU,
        0x556b2f, 'leafy');
    }
    /* short link range tying the cloister to the hall */
    F.box(0, 0.55, -14.6, 9, 5.5, 4.2, 0, shade(stone, 0.03), 'stone');
    F.box(0, 5.8, -14.6, 9.4, 0.35, 4.6, 0, cornice, 'stone');
    [-1, 1].forEach(function (s) {
      F.box(s * 4.6, 2.0, -14.6, 0.25, 1.6, 1.2, 0, doorC, 'wood');
    });
  }
});
