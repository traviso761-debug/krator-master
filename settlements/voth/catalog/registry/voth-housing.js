/* ======================================================================
   Voth — housing registry (voth-housing)
   Three entries, five designed variants each:
     voth_house_poor    low-class rowhouses, hovels, tenements, shore huts
     voth_house_middle  Hlaalu blocks, Velothi tower-houses, courtyard,
                        canal and corner houses
     voth_house_rich    Hlaalu mansion, Mournhold domed house, pagoda
                        tower-house, terraced villa, canal palazzo
   Everything lives in one IIFE so the shared kit (windows, doors, stairs,
   canopies, roof clutter) is not a top-level declaration.
   Conventions: +z is the FRONT; side s: 0 = +z, 1 = -z, 2 = +x, 3 = -x.
   A "block" B is {x, z, w, d} (plan centre + size); K.fb lays a box against
   one of its faces, `off` being the box centre's distance out from the face.
   Sloped cloth is never a tilted flat box (F.beam's cross-section does not
   follow the frame's rotation): canopies are flat cloth on frames, tents
   are shallow F.pyrRoof, wall awnings are half-buried F.pyrRoof hoods.
   ====================================================================== */
(function () {
  /* ---- palette (copied from PAL, src/05-palette.js) ---- */
  const STONE_POOR = [0x8b8069, 0x7e7460, 0x968b73, 0x726851, 0x877d66, 0x9d9076];
  const STONE = [0x8c8579, 0x958e80, 0x87816f, 0x97907f, 0x9a9384, 0x8f8873, 0xa19a8a, 0x928c7c, 0x9d9686, 0x968f7f];
  const MARBLE = [0xe8e1d2, 0xdfd7c5, 0xf1ebdd];
  const JADE = [0x3f6b56, 0x35594a, 0x4a7d64];
  const LAPIS = [0x1f3f6e, 0x2a4d80, 0x17335c];
  const PORPH = [0x5e1e2d, 0x6a2434, 0x521826];
  const BASALT = [0x2b2a28, 0x322f2b, 0x242220];
  const ROOF = [0xb35a3a, 0xa04f32, 0xc36a42];
  const COPPER = 0x6b7a4a;
  const DOMEC = [0xb08d3c, 0xa0843f, 0x8f7a44, 0xb0a682, 0x9d9379, 0xa8a08a, 0x93886d];
  const SAIL = [0xcfc2a3, 0xc0b190, 0xb8a880, 0xa89878];
  const BANNER = [0x7a2028, 0x8a2f2a, 0x5c4028, 0xe8d9a0, 0xc9b8d6, 0xb8d0b0, 0xb0c8d8, 0xcbb08e, 0xe8c090];
  const FADED = [0x8d7a5e, 0x7a6a8a, 0x9a6a5a, 0xa89878, 0x8a8a6a, 0x9a8a6e];
  const REED = [0x6a6742, 0x767148, 0x5e5b3a];   /* PAL.reed, shaded down: thatch reads pale in sun */
  const MUD = [0x6b5c46, 0x76664d, 0x6f6149];
  const LEAF = [0x4e5a34, 0x43502e, 0x5b6740, 0x49523a, 0x616a41];
  const TIMBERS = [0x4a3a28, 0x5a4a34, 0x6b5a3a, 0x5d5140, 0x4e4536];
  const SHUT = [0x5a4028, 0x46603f, 0x6b4a2a];
  const DOOR = 0x1c1a16, TIMBER = 0x4a3a28, IRON = 0x3a2f22, GLOW = 0xffcf87, ROPE = 0x6b5a3a;
  const GOLD = 0xd0a53c;

  /* ================================================================ kit */
  function kit(F) {
    const K = {};
    const N = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    K.N = N;
    /* point on face s of block B, `u` along the face, `off` out from it */
    K.at = function (B, s, u, off) {
      const n = N[s];
      return s < 2 ? [B.x + u, B.z + n[1] * (B.d / 2 + off)] : [B.x + n[0] * (B.w / 2 + off), B.z + u];
    };
    K.fb = function (B, s, u, y, along, h, dep, off, col, fam) {
      const p = K.at(B, s, u, off);
      F.box(p[0], y, p[1], s < 2 ? along : dep, h, s < 2 ? dep : along, 0, col, fam || 'stone');
    };
    K.rodOut = function (B, s, u, y0, y1, off, r, col) {
      const p = K.at(B, s, u, off);
      F.rod(p[0], y0, p[1], p[0], y1, p[1], r, col, 'wood');
    };
    /* window: dark pane in a reveal (jambs, lintel, sill), options:
       wall, trim, shut (colour or true), bars, arch (stepped pointed head),
       screen (timber lattice), box (flower box), off (face offset) */
    K.win = function (B, s, u, y, ww, wh, o) {
      o = o || {};
      const wall = o.wall != null ? o.wall : 0x8c8579;
      const trim = o.trim != null ? o.trim : shade(wall, -0.18);
      const off = o.off || 0, j = 0.17;
      K.fb(B, s, u, y, ww, wh, 0.3, off, o.pane != null ? o.pane : DOOR, 'wood');
      [-1, 1].forEach(function (k) { K.fb(B, s, u + k * (ww / 2 + j / 2), y - 0.02, j, wh + 0.04, 0.34, off + 0.12, trim, 'stone'); });
      let top = y + wh;
      if (o.arch) {
        K.fb(B, s, u, top, ww * 0.62, wh * 0.16, 0.3, off, DOOR, 'wood');
        K.fb(B, s, u, top + wh * 0.16, ww * 0.26, wh * 0.12, 0.3, off, DOOR, 'wood');
        [-1, 1].forEach(function (k) {
          K.fb(B, s, u + k * (ww * 0.31 + 0.08), top, 0.16, wh * 0.16, 0.3, off + 0.1, trim, 'stone');
          K.fb(B, s, u + k * (ww * 0.13 + 0.08), top + wh * 0.16, 0.16, wh * 0.12, 0.3, off + 0.1, trim, 'stone');
        });
        top += wh * 0.28;
      }
      K.fb(B, s, u, top, ww + 2 * j + 0.12, o.lintelH || 0.22, 0.4, off + 0.14, o.lintel != null ? o.lintel : trim, 'stone');
      if (o.sill !== false) K.fb(B, s, u, y - 0.16, ww + 2 * j + 0.22, 0.16, 0.52, off + 0.22, trim, 'stone');
      if (o.shut) {
        const sc = o.shut === true ? SHUT[0] : o.shut;
        [-1, 1].forEach(function (k) {
          K.fb(B, s, u + k * (ww * 0.75 + j + 0.03), y, ww / 2, wh, 0.08, off + 0.19, sc, 'wood');
          K.fb(B, s, u + k * (ww * 0.75 + j + 0.03), y + wh * 0.3, ww / 2 - 0.1, 0.07, 0.04, off + 0.25, shade(sc, -0.15), 'wood');
        });
      }
      if (o.bars) {
        for (let i = 1; i <= 3; i++) {
          const uu = u - ww / 2 + ww * i / 4;
          K.rodOut(B, s, uu, y, y + wh, off + 0.2, 0.035, IRON);
        }
        K.fb(B, s, u, y + wh * 0.5, ww, 0.06, 0.06, off + 0.2, IRON, 'metal');
      }
      if (o.screen) {
        K.fb(B, s, u, y, ww - 0.06, wh * 0.62, 0.08, off + 0.2, o.screen === true ? TIMBER : o.screen, 'wood');
        for (let i = 1; i < 4; i++) K.fb(B, s, u, y + wh * 0.62 * i / 4, ww - 0.06, 0.05, 0.06, off + 0.26, shade(TIMBER, 0.2), 'wood');
      }
      if (o.box) {
        K.fb(B, s, u, y - 0.6, ww + 0.2, 0.42, 0.45, off + 0.45, o.box === true ? TIMBER : o.box, 'wood');
        for (let i = -1; i <= 1; i++) {
          const p = K.at(B, s, u + i * ww * 0.3, off + 0.45);
          F.blob(p[0], y - 0.1, p[1], 0.26, 0.4, 0, F.pick(LEAF), 'leafy');
        }
      }
    };
    /* door: jambs, head, dark reveal, leaf with battens, steps down to o.ground */
    K.door = function (B, s, u, y, dw, dh, o) {
      o = o || {};
      const wall = o.wall != null ? o.wall : 0x8c8579;
      const trim = o.trim != null ? o.trim : shade(wall, -0.2);
      const off = o.off || 0, j = o.jamb || 0.3, g = o.ground != null ? o.ground : 0;
      const leaf = o.leaf != null ? o.leaf : 0x3a2c1e;
      K.fb(B, s, u, y, dw, dh, 0.3, off, DOOR, 'wood');
      K.fb(B, s, u, y, dw - 0.12, dh - 0.06, 0.1, off + 0.12, leaf, 'wood');
      [0.25, 0.62].forEach(function (t) { K.fb(B, s, u, y + dh * t, dw - 0.2, 0.1, 0.05, off + 0.19, shade(leaf, -0.18), 'wood'); });
      const hp = K.at(B, s, u + dw * 0.25, off + 0.24);
      F.ball(hp[0], y + dh * 0.45, hp[1], 0.06, IRON, 'metal');
      [-1, 1].forEach(function (k) { K.fb(B, s, u + k * (dw / 2 + j / 2), y, j, dh, 0.42, off + 0.16, trim, 'stone'); });
      let top = y + dh;
      if (o.arch) {
        K.fb(B, s, u, top, dw * 0.66, dh * 0.12, 0.3, off, DOOR, 'wood');
        K.fb(B, s, u, top + dh * 0.12, dw * 0.3, dh * 0.1, 0.3, off, DOOR, 'wood');
        [-1, 1].forEach(function (k) {
          K.fb(B, s, u + k * (dw * 0.33 + 0.12), top, 0.24, dh * 0.12, 0.34, off + 0.14, trim, 'stone');
          K.fb(B, s, u + k * (dw * 0.15 + 0.12), top + dh * 0.12, 0.24, dh * 0.1, 0.34, off + 0.14, trim, 'stone');
        });
        top += dh * 0.22;
      }
      K.fb(B, s, u, top, dw + 2 * j + 0.3, o.headH || 0.36, 0.56, off + 0.22, o.head != null ? o.head : shade(trim, -0.06), 'stone');
      /* steps from the sill down to the ground, or a threshold */
      const rise = y - g;
      if (rise > 0.08) {
        const n = Math.max(1, Math.round(rise / 0.24));
        for (let i = 0; i < n; i++) {
          const dep = 0.42 * (i + 1);
          K.fb(B, s, u, g, dw + 2 * j + 0.1 * i, rise - i * rise / n, dep, off + dep / 2, o.step != null ? o.step : shade(trim, -0.08), 'stone');
        }
      } else {
        K.fb(B, s, u, g, dw + 2 * j, 0.12, 0.6, off + 0.3, o.step != null ? o.step : shade(trim, -0.08), 'stone');
      }
      if (o.lamp) {
        const lp = K.at(B, s, u - (dw / 2 + j + 0.35), 0);
        const lq = K.at(B, s, u - (dw / 2 + j + 0.35), 0.65);
        F.rod(lp[0], y + dh + 0.1, lp[1], lq[0], y + dh + 0.1, lq[1], 0.05, IRON, 'metal');
        F.ball(lq[0], y + dh - 0.18, lq[1], 0.2, GLOW, 'glow');
      }
      if (o.hood) {
        const hc = o.hood === true ? shade(TIMBER, 0.1) : o.hood;
        const hw = dw + 2 * j + 0.6;
        K.fb(B, s, u, top + 0.45, hw, 0.14, 1.1, off + 0.55, hc, 'wood');
        [-1, 1].forEach(function (k) {
          const a = K.at(B, s, u + k * (hw / 2 - 0.2), 0.05), b = K.at(B, s, u + k * (hw / 2 - 0.2), 1.0);
          F.beam(a[0], top - 0.35, a[1], b[0], top + 0.45, b[1], 0.12, 0.12, TIMBER, 'wood');
        });
      }
    };
    /* ring parapet sitting on a roof; gaps: [{s, u, len}] */
    K.parapet = function (B, y, h, t, col, gaps, o) {
      o = o || {};
      const cap = o.cap != null ? o.cap : shade(col, -0.12);
      for (let s = 0; s < 4; s++) {
        const L = s < 2 ? B.w : B.d;
        let segs = [[-L / 2, L / 2]];
        (gaps || []).forEach(function (g) {
          if (g.s !== s) return;
          const nx = [];
          segs.forEach(function (sg) {
            const a = g.u - g.len / 2, b = g.u + g.len / 2;
            if (b <= sg[0] || a >= sg[1]) { nx.push(sg); return; }
            if (a > sg[0]) nx.push([sg[0], a]);
            if (b < sg[1]) nx.push([b, sg[1]]);
          });
          segs = nx;
        });
        segs.forEach(function (sg) {
          const len = sg[1] - sg[0], mid = (sg[0] + sg[1]) / 2;
          if (len < 0.05) return;
          K.fb(B, s, mid, y, len, h, t, -t / 2, col, 'stone');
          K.fb(B, s, mid, y + h, len + (o.noCapOver ? 0 : 0.04), 0.12, t + 0.14, -t / 2, cap, 'stone');
        });
      }
    };
    /* straight flight rising from (x0,z0,y0) to (x1,z1,y1), axis-aligned run.
       o.solid: masonry down to o.base; else timber treads + stringers + rail */
    K.flight = function (x0, z0, x1, z1, y0, y1, wd, col, o) {
      o = o || {};
      const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      const L = ax ? x1 - x0 : z1 - z0;
      const n = Math.max(2, Math.round((y1 - y0) / 0.27));
      const rise = (y1 - y0) / n, run = L / n;
      const base = o.base != null ? o.base : y0;
      for (let i = 0; i < n; i++) {
        const c = run * (i + 0.5), top = y0 + rise * (i + 1);
        const cx = ax ? x0 + c : x0, cz = ax ? z0 : z0 + c;
        if (o.solid) {
          F.box(cx, base, cz, ax ? Math.abs(run) + 0.02 : wd, top - base, ax ? wd : Math.abs(run) + 0.02, 0, i % 2 ? col : shade(col, -0.04), 'stone');
        } else {
          F.box(cx, top - 0.09, cz, ax ? Math.abs(run) + 0.06 : wd, 0.09, ax ? wd : Math.abs(run) + 0.06, 0, col, 'wood');
        }
      }
      if (!o.solid) {
        const px = ax ? 0 : wd / 2, pz = ax ? wd / 2 : 0;
        [-1, 1].forEach(function (k) {
          F.beam(x0 + k * px, y0 - 0.1, z0 + k * pz, x1 + k * px, y1 - 0.1, z1 + k * pz, 0.16, 0.16, shade(col, -0.2), 'wood');
        });
      }
      if (o.rail) {
        const k = o.rail, px = ax ? 0 : k * (wd / 2), pz = ax ? k * (wd / 2) : 0;
        const rc = o.railC != null ? o.railC : TIMBER;
        F.rod(x0 + px, y0 + 0.95, z0 + pz, x1 + px, y1 + 0.95, z1 + pz, 0.05, rc, 'wood');
        const m = Math.max(2, Math.round(Math.abs(L) / 1.6));
        for (let i = 0; i <= m; i++) {
          const t = i / m, yy = y0 + (y1 - y0) * t + (t === 0 ? rise : 0) * 0;
          F.rod(x0 + (x1 - x0) * t + px, Math.max(yy, y0), z0 + (z1 - z0) * t + pz, x0 + (x1 - x0) * t + px, yy + 0.95, z0 + (z1 - z0) * t + pz, 0.045, rc, 'wood');
        }
      }
    };
    /* ladder from (x0,y0,z0) to (x1,y1,z1); rails spread along (px,pz) */
    K.ladder = function (x0, y0, z0, x1, y1, z1, px, pz, col) {
      col = col || shade(TIMBER, 0.15);
      [-1, 1].forEach(function (k) {
        F.rod(x0 + k * px * 0.25, y0, z0 + k * pz * 0.25, x1 + k * px * 0.25, y1, z1 + k * pz * 0.25, 0.05, col, 'wood');
      });
      const n = Math.floor((y1 - y0) / 0.34);
      for (let i = 1; i <= n; i++) {
        const t = i / (n + 0.6);
        const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, z = z0 + (z1 - z0) * t;
        F.rod(x - px * 0.25, y, z - pz * 0.25, x + px * 0.25, y, z + pz * 0.25, 0.035, col, 'wood');
      }
    };
    /* flat cloth canopy on a timber frame, top at y; o.posts: corner list
       ([sx, sz] in -1/1) with o.base the foot height; o.val: sides with a
       hanging valance; o.patch: number of patches */
    K.canopy = function (x, z, y, w, d, cloth, o) {
      o = o || {};
      const fr = o.frame != null ? o.frame : TIMBER;
      F.box(x, y - 0.06, z, w, 0.06, d, 0, cloth, 'cloth');
      F.box(x, y - 0.2, z + d / 2 - 0.07, w, 0.14, 0.14, 0, fr, 'wood');
      F.box(x, y - 0.2, z - d / 2 + 0.07, w, 0.14, 0.14, 0, fr, 'wood');
      F.box(x + w / 2 - 0.07, y - 0.2, z, 0.14, 0.14, d, 0, fr, 'wood');
      F.box(x - w / 2 + 0.07, y - 0.2, z, 0.14, 0.14, d, 0, fr, 'wood');
      for (let i = 1; i < Math.round(w / 1.4); i++) F.box(x - w / 2 + i * w / Math.round(w / 1.4), y - 0.16, z, 0.1, 0.1, d, 0, fr, 'wood');
      (o.posts || []).forEach(function (p) {
        const px = x + p[0] * (w / 2 - 0.1), pz = z + p[1] * (d / 2 - 0.1);
        F.rod(px, o.base || 0, pz, px, y - 0.06, pz, 0.09, fr, 'wood');
      });
      (o.val || []).forEach(function (s) {
        const vc = shade(cloth, -0.12);
        if (s < 2) F.box(x, y - 0.5, z + (s === 0 ? 1 : -1) * (d / 2 + 0.02), w, 0.44, 0.04, 0, vc, 'cloth');
        else F.box(x + (s === 2 ? 1 : -1) * (w / 2 + 0.02), y - 0.5, z, 0.04, 0.44, d, 0, vc, 'cloth');
      });
      for (let i = 0; i < (o.patch || 0); i++) {
        const pw = F.rr(0.6, 1.3), pd = F.rr(0.5, 1.1);
        F.box(x + F.rr(-1, 1) * (w / 2 - pw / 2 - 0.1), y, z + F.rr(-1, 1) * (d / 2 - pd / 2 - 0.1), pw, 0.025, pd, 0, F.pick(FADED), 'cloth');
      }
    };
    /* shallow tent: pyramidal cloth on corner posts */
    K.tent = function (x, z, y, w, d, h, cloth, o) {
      o = o || {};
      F.pyrRoof(x, y, z, w, h, d, 0, cloth, 'cloth');
      F.box(x, y - 0.35, z + d / 2 - 0.02, w, 0.35, 0.04, 0, shade(cloth, -0.12), 'cloth');
      F.box(x, y - 0.35, z - d / 2 + 0.02, w, 0.35, 0.04, 0, shade(cloth, -0.12), 'cloth');
      F.box(x + w / 2 - 0.02, y - 0.35, z, 0.04, 0.35, d, 0, shade(cloth, -0.12), 'cloth');
      F.box(x - w / 2 + 0.02, y - 0.35, z, 0.04, 0.35, d, 0, shade(cloth, -0.12), 'cloth');
      if (o.posts !== false) {
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
          const px = x + p[0] * (w / 2 - 0.15), pz = z + p[1] * (d / 2 - 0.15);
          F.rod(px, o.base || 0, pz, px, y + 0.05, pz, 0.08, o.frame || TIMBER, 'wood');
        });
      }
      F.cyl(x, y + h - 0.05, z, 0.07, 0.4, 0, IRON, 'metal');
    };
    /* hood awning on a wall: half-buried pyramids (host must be deeper than proj) */
    K.awning = function (B, s, u, y, len, proj, drop, cloth, o) {
      o = o || {};
      const bays = Math.max(1, Math.round(len / (o.bay || 2.2))), bl = len / bays;
      for (let i = 0; i < bays; i++) {
        const uu = u - len / 2 + bl * (i + 0.5);
        const p = K.at(B, s, uu, 0);
        F.pyrRoof(p[0], y - drop, p[1], s < 2 ? bl : proj * 2, drop, s < 2 ? proj * 2 : bl, 0, i % 2 && o.stripe ? o.stripe : cloth, 'cloth');
      }
      K.fb(B, s, u, y - drop - 0.32, len, 0.32, 0.05, proj, shade(cloth, -0.14), 'cloth');
      if (o.poles) {
        [-1, 1].forEach(function (k) {
          const p = K.at(B, s, u + k * (len / 2 - 0.1), proj - 0.08);
          F.rod(p[0], o.base || 0, p[1], p[0], y - drop, p[1], 0.07, TIMBER, 'wood');
        });
      } else {
        [-1, 1].forEach(function (k) {
          const a = K.at(B, s, u + k * (len / 2 - 0.1), 0.05), b = K.at(B, s, u + k * (len / 2 - 0.1), proj - 0.05);
          F.rod(a[0], y - drop - 0.7, a[1], b[0], y - drop, b[1], 0.05, IRON, 'metal');
        });
      }
    };
    /* hip roof with eave board; o.flare adds a kinked, flared lower skirt */
    K.hip = function (x, z, y, w, d, h, col, o) {
      o = o || {};
      F.box(x, y - 0.28, z, w, 0.28, d, 0, o.fascia != null ? o.fascia : shade(col, -0.25), 'wood');
      if (o.flare) {
        const hs = h * 0.22, wi = w * o.flare, di = d * o.flare;
        F.pyrRoof(x, y, z, w, hs, d, 0, col, 'roof');
        const yu = y + hs * (1 - o.flare) + 0.03;
        F.pyrRoof(x, yu, z, wi, h - (yu - y), di, 0, shade(col, 0.05), 'roof');
      } else {
        F.pyrRoof(x, y, z, w, h, d, 0, col, 'roof');
      }
      if (o.finial !== false) {
        F.cyl(x, y + h - 0.2, z, 0.14, 0.9, 0, o.finC || GOLD, 'metal');
        F.ball(x, y + h + 0.75, z, 0.22, o.finC || GOLD, 'metal');
      }
    };
    /* eave brackets from a block's walls out to its roof edge */
    K.brackets = function (B, y, proj, n, col) {
      for (let s = 0; s < 4; s++) {
        const L = s < 2 ? B.w : B.d;
        for (let i = 0; i < n; i++) {
          const u = -L / 2 + L * (i + 0.5) / n;
          const a = K.at(B, s, u, 0.02), b = K.at(B, s, u, proj);
          F.beam(a[0], y - 0.9, a[1], b[0], y - 0.3, b[1], 0.16, 0.16, col, 'wood');
        }
      }
    };
    /* ribbed dome over y; ribs meridians of rods */
    K.dome = function (x, z, y, r, h, col, o) {
      o = o || {};
      F.dome(x, y, z, r, h, 0, col, 'dome');
      const nr = o.ribs || 0, rc = o.ribC != null ? o.ribC : shade(col, -0.2);
      for (let i = 0; i < nr; i++) {
        const a = i / nr * TAU;
        let px = null;
        for (let k = 0; k <= 5; k++) {
          const ph = k / 5 * Math.PI / 2 * 0.96;
          const q = [x + Math.cos(a) * Math.cos(ph) * r * 1.01, y + Math.sin(ph) * h * 1.01, z + Math.sin(a) * Math.cos(ph) * r * 1.01];
          if (px) F.rod(px[0], px[1], px[2], q[0], q[1], q[2], o.ribR || r * 0.025, rc, 'stone');
          px = q;
        }
      }
      F.cyl(x, y, z, r * 1.03, 0.3, 0, o.ring != null ? o.ring : shade(col, -0.25), 'stone');
    };
    /* ---- props ---- */
    K.jar = function (x, z, y, s, col) {
      col = col || F.pick([0x8a5a3a, 0x7a6a50, 0x9a7050, 0x6b5a48]);
      F.blob(x, y + 0.42 * s, z, 0.34 * s, 0.84 * s, 0, col, 'clay');
      F.cyl(x, y + 0.78 * s, z, 0.15 * s, 0.2 * s, 0, shade(col, -0.1), 'clay');
      F.cyl(x, y + 0.95 * s, z, 0.19 * s, 0.06 * s, 0, shade(col, -0.2), 'clay');
    };
    K.crate = function (x, z, y, s, ry) {
      const c = F.pick(TIMBERS);
      F.box(x, y, z, s, s * 0.8, s, ry || 0, shade(c, 0.12), 'wood');
      F.box(x, y + s * 0.34, z, s + 0.04, 0.08, s + 0.04, ry || 0, shade(c, -0.1), 'wood');
    };
    K.barrel = function (x, z, y, s) {
      F.cyl(x, y, z, 0.42 * s, 1.1 * s, 0, 0x5a4a34, 'wood');
      [0.15, 0.9].forEach(function (t) { F.cyl(x, y + t * s, z, 0.44 * s, 0.07, 0, IRON, 'metal'); });
    };
    K.rug = function (x, z, y, len, alongX, col) {
      col = col || F.pick(BANNER);
      if (alongX) F.rod(x - len / 2, y + 0.16, z, x + len / 2, y + 0.16, z, 0.16, col, 'cloth');
      else F.rod(x, y + 0.16, z - len / 2, x, y + 0.16, z + len / 2, 0.16, col, 'cloth');
    };
    K.pot = function (x, z, y, s) {
      F.cyl(x, y, z, 0.3 * s, 0.45 * s, 0, 0x8a5a3a, 'clay');
      F.blob(x, y + 0.65 * s, z, 0.42 * s, 0.6 * s, 0, F.pick(LEAF), 'leafy');
    };
    /* drying rack: A-frames at the ends, a rail, items hanging off it */
    K.rack = function (x, z, y, len, h, alongX, cols) {
      const hl = len / 2;
      [-1, 1].forEach(function (k) {
        const ex = alongX ? x + k * hl : x, ez = alongX ? z : z + k * hl;
        const sx = alongX ? 0 : 0.35, sz = alongX ? 0.35 : 0;
        F.rod(ex - sx, y, ez - sz, ex, y + h, ez, 0.05, TIMBER, 'wood');
        F.rod(ex + sx, y, ez + sz, ex, y + h, ez, 0.05, TIMBER, 'wood');
      });
      if (alongX) F.rod(x - hl, y + h, z, x + hl, y + h, z, 0.045, TIMBER, 'wood');
      else F.rod(x, y + h, z - hl, x, y + h, z + hl, 0.045, TIMBER, 'wood');
      const n = Math.max(2, Math.floor(len / 0.55));
      for (let i = 0; i < n; i++) {
        const t = -hl + len * (i + 0.5) / n;
        const c = cols ? F.pick(cols) : F.pick(FADED);
        const ih = F.rr(0.35, 0.8);
        if (alongX) F.box(x + t, y + h - ih, z, len / n * 0.8, ih, 0.04, 0, c, 'cloth');
        else F.box(x, y + h - ih, z + t, 0.04, ih, len / n * 0.8, 0, c, 'cloth');
      }
    };
    /* laundry line between two points, cloths hanging */
    K.line = function (x0, y0, z0, x1, y1, z1, n) {
      F.rod(x0, y0, z0, x1, y1, z1, 0.025, ROPE, 'rope');
      const dx = x1 - x0, dz = z1 - z0, ry = Math.atan2(-dz, dx), L = Math.hypot(dx, dz);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, cw = Math.min(L / n * 0.7, 1.1), ch = F.rr(0.5, 1.0);
        F.box(x0 + dx * t, y0 + (y1 - y0) * t - ch, z0 + dz * t, cw, ch, 0.03, ry, F.pick(FADED.concat(SAIL)), 'cloth');
      }
    };
    K.chimney = function (x, z, y, h, col) {
      F.box(x, y, z, 0.8, h, 0.8, 0, shade(col, -0.18), 'stone');
      F.box(x, y + h, z, 1.05, 0.3, 1.05, 0, shade(col, -0.3), 'stone');
      F.box(x, y + h + 0.3, z, 0.5, 0.45, 0.5, 0, shade(col, -0.34), 'stone');
    };
    K.pipe = function (x, z, y, h) {
      F.cyl(x, y, z, 0.13, h, 0, 0x3a3128, 'metal');
      F.cyl(x, y + h, z, 0.24, 0.2, 0, 0x2a241e, 'metal');
    };
    K.drain = function (B, s, u, y0, y1, col) {
      const p = K.at(B, s, u, 0.18);
      F.rod(p[0], y0, p[1], p[0], y1, p[1], 0.1, shade(col, -0.32), 'metal');
      K.fb(B, s, u, y1 - 0.3, 0.42, 0.35, 0.5, 0.25, shade(col, -0.32), 'metal');
    };
    K.cistern = function (x, z, y, r, h, col) {
      F.cyl(x, y, z, r, h, 0, col, 'stone');
      F.cyl(x, y + h, z, r + 0.08, 0.12, 0, shade(col, -0.2), 'stone');
      F.cyl(x, y + h + 0.12, z, r * 0.7, 0.1, 0, shade(TIMBER, 0.1), 'wood');
      [-1, 1].forEach(function (k) { F.cyl(x + k * r * 0.72, y, z, 0.14, h * 0.6, 0, shade(col, -0.1), 'stone'); });
    };
    /* pergola: posts, two beams, joists, vine blobs */
    K.pergola = function (x, z, y, w, d, h, o) {
      o = o || {};
      const pc = o.post != null ? o.post : shade(TIMBER, 0.1);
      const nx = Math.max(1, Math.round(w / 2.6));
      for (let i = 0; i <= nx; i++) {
        const px = x - w / 2 + 0.15 + (w - 0.3) * i / nx;
        [-1, 1].forEach(function (k) {
          if (o.skip && o.skip(i, k)) return;
          F.box(px, y, z + k * (d / 2 - 0.15), 0.24, h, 0.24, 0, pc, o.stone ? 'stone' : 'wood');
        });
      }
      [-1, 1].forEach(function (k) { F.box(x, y + h, z + k * (d / 2 - 0.15), w + 0.4, 0.26, 0.2, 0, TIMBER, 'wood'); });
      const nj = Math.max(3, Math.round(w / 0.6));
      for (let i = 0; i <= nj; i++) F.box(x - w / 2 + w * i / nj, y + h + 0.26, z, 0.12, 0.16, d + 0.6, 0, shade(TIMBER, 0.15), 'wood');
      const nv = o.vines == null ? Math.round(w * d / 5) : o.vines;
      for (let i = 0; i < nv; i++) {
        F.blob(x + F.rr(-0.45, 0.45) * w, y + h + 0.5, z + F.rr(-0.45, 0.45) * d, F.rr(0.5, 0.9), F.rr(0.4, 0.6), 0, F.pick(LEAF), 'leafy');
      }
      if (o.climb) {
        [-1, 1].forEach(function (k) {
          F.blob(x - w / 2 + 0.2, y + h * 0.5, z + k * (d / 2 - 0.15), 0.35, h * 0.9, 0, F.pick(LEAF), 'leafy');
        });
      }
    };
    /* rough stone patch where plaster has come away */
    K.patch = function (B, s, u, y, w, h, col) {
      K.fb(B, s, u, y, w, h, 0.08, 0.02, col, 'stone');
    };
    /* beam ends (vigas) along a face */
    K.vigas = function (B, s, y, n, col, off) {
      const L = s < 2 ? B.w : B.d;
      for (let i = 0; i < n; i++) K.fb(B, s, -L / 2 + L * (i + 0.5) / n, y, 0.22, 0.22, 0.6, (off || 0) + 0.3, col || TIMBER, 'wood');
    };
    /* a small boat, keel along z (or x) */
    K.boat = function (x, z, y, len, alongX, col) {
      col = col || shade(TIMBER, 0.08);
      const bw = len * 0.28, mid = len * 0.62, e = bw * 0.72;
      /* hull: straight midbody, diamond bow and stern, gunwales, thwarts */
      if (alongX) {
        F.box(x, y, z, mid, 0.5, bw, 0, col, 'wood');
        [-1, 1].forEach(function (k) {
          F.box(x + k * mid / 2, y, z, e, 0.5, e, Math.PI / 4, col, 'wood');
          F.beam(x + k * (mid / 2 + e * 0.55), y + 0.3, z, x + k * (mid / 2 + e * 0.75), y + 0.9, z, 0.12, 0.12, shade(col, -0.1), 'wood');
        });
        F.box(x, y + 0.5, z, mid, 0.08, bw + 0.08, 0, shade(col, -0.15), 'wood');
        F.box(x, y + 0.42, z, mid - 0.2, 0.1, bw - 0.2, 0, shade(col, -0.35), 'wood');
        [-0.25, 0.25].forEach(function (t) { F.box(x + t * mid, y + 0.45, z, 0.25, 0.08, bw, 0, shade(col, 0.12), 'wood'); });
      } else {
        F.box(x, y, z, bw, 0.5, mid, 0, col, 'wood');
        [-1, 1].forEach(function (k) {
          F.box(x, y, z + k * mid / 2, e, 0.5, e, Math.PI / 4, col, 'wood');
          F.beam(x, y + 0.3, z + k * (mid / 2 + e * 0.55), x, y + 0.9, z + k * (mid / 2 + e * 0.75), 0.12, 0.12, shade(col, -0.1), 'wood');
        });
        F.box(x, y + 0.5, z, bw + 0.08, 0.08, mid, 0, shade(col, -0.15), 'wood');
        F.box(x, y + 0.42, z, bw - 0.2, 0.1, mid - 0.2, 0, shade(col, -0.35), 'wood');
        [-0.25, 0.25].forEach(function (t) { F.box(x, y + 0.45, z + t * mid, bw, 0.08, 0.25, 0, shade(col, 0.12), 'wood'); });
      }
    };
    /* striped mooring pole with a cap */
    K.mooring = function (x, z, h, c1, c2) {
      const n = 4;
      for (let i = 0; i < n; i++) F.cyl(x, i * h / n, z, 0.16, h / n, 0, i % 2 ? c1 : c2, 'wood');
      F.cone(x, h, z, 0.24, 0.4, 0, GOLD, 'metal');
    };
    /* rail along a straight edge: top rod + balusters */
    K.rail = function (x0, z0, x1, z1, y, h, col, spacing) {
      F.box((x0 + x1) / 2, y + h - 0.08, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.1, 0.1, Math.abs(z1 - z0) + 0.1, 0, col, 'wood');
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / (spacing || 0.5)));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        F.box(x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, 0.08, h - 0.08, 0.08, 0, col, 'wood');
      }
    };
    return K;
  }

  /* ================================================================ POOR */
  function poor(F, K) {
    const c = F.pick(STONE_POOR), trim = shade(c, -0.2), dark = shade(c, -0.3);
    const tim = F.pick(TIMBERS), tim2 = shade(tim, 0.15);
    const bare = shade(c, -0.14);
    function patches(B, sides, y0, y1, n) {
      for (let i = 0; i < n; i++) {
        const s = sides[i % sides.length], L = s < 2 ? B.w : B.d;
        const pw = F.rr(0.9, 1.8), ph = F.rr(0.7, 1.4);
        K.patch(B, s, F.rr(-L / 2 + pw / 2 + 0.2, L / 2 - pw / 2 - 0.2), F.rr(y0, y1 - ph), pw, ph, i % 2 ? bare : shade(bare, 0.06));
      }
    }

    if (F.variant === 0) {
      /* -------- plaster rowhouse pair: two roofs, a roof shack under a
         patched awning, timber stair up the flank, ladder between roofs */
      const cA = c, cB = shade(F.pick(STONE_POOR), 0.04);
      const A = { x: -3.15, z: 0, w: 6.1, d: 8, h: 6.4 };
      const B = { x: 3.05, z: 0.2, w: 6.1, d: 8.4, h: 5.8 };
      [[A, cA], [B, cB]].forEach(function (p) {
        const H = p[0], hc = p[1];
        F.box(H.x, 0, H.z, H.w + 0.24, 0.45, H.d + 0.24, 0, shade(hc, -0.28), 'stone');
        F.box(H.x, 0, H.z, H.w, H.h, H.d, 0, hc, 'plaster');
        F.box(H.x, 3.1, H.z, H.w + 0.12, 0.2, H.d + 0.12, 0, shade(hc, -0.1), 'stone');
        F.box(H.x, H.h - 0.05, H.z, H.w + 0.2, 0.22, H.d + 0.2, 0, shade(hc, -0.18), 'stone');
      });
      /* party-wall pier on the front and back */
      [4.25, -4.05].forEach(function (pz) {
        F.box(-0.1, 0, pz, 0.6, 6.0, 0.5, 0, shade(c, -0.12), 'stone');
        F.box(-0.1, 6.0, pz, 0.8, 0.25, 0.7, 0, dark, 'stone');
      });
      K.parapet(A, A.h + 0.17, 0.7, 0.28, cA, [{ s: 2, u: -2.6, len: 1.0 }]);
      K.parapet(B, B.h + 0.17, 0.6, 0.28, cB, [{ s: 2, u: -3.3, len: 1.2 }]);
      /* fronts */
      K.door(A, 0, -1.3, 0.45, 1.2, 2.3, { wall: cA, leaf: F.pick(SHUT) });
      K.win(A, 0, 1.5, 1.4, 1.0, 1.2, { wall: cA, shut: F.pick(FADED), bars: true });
      K.win(A, 0, -1.3, 4.0, 0.9, 1.2, { wall: cA, shut: F.pick(SHUT) });
      K.win(A, 0, 1.5, 4.0, 0.9, 1.2, { wall: cA, shut: F.pick(SHUT), box: true });
      K.door(B, 0, 1.4, 0.45, 1.2, 2.3, { wall: cB, leaf: shade(tim, 0.1), hood: true });
      K.win(B, 0, -1.4, 1.5, 0.8, 1.0, { wall: cB, bars: true });
      K.win(B, 0, -1.4, 3.9, 0.9, 1.2, { wall: cB, shut: F.pick(FADED) });
      K.win(B, 0, 1.4, 3.9, 0.9, 1.2, { wall: cB, shut: F.pick(FADED) });
      /* patched cloth awning over A's ground window, on poles */
      K.awning(A, 0, 1.5, 3.05, 2.4, 1.2, 0.5, F.pick(FADED), { poles: true, bay: 2.4 });
      /* backs */
      K.door(A, 1, 0.6, 0.45, 1.1, 2.2, { wall: cA });
      K.win(A, 1, -1.7, 1.5, 0.8, 1.0, { wall: cA, bars: true });
      K.win(A, 1, -1.4, 4.0, 0.8, 1.1, { wall: cA });
      K.win(A, 1, 1.4, 4.0, 0.8, 1.1, { wall: cA, shut: F.pick(SHUT) });
      K.win(B, 1, -1.3, 1.5, 0.9, 1.1, { wall: cB });
      K.win(B, 1, 1.4, 1.5, 0.9, 1.1, { wall: cB, shut: F.pick(FADED) });
      K.win(B, 1, 0, 3.9, 0.9, 1.1, { wall: cB });
      K.drain(B, 1, 2.6, 0.45, B.h + 0.1, cB);
      /* laundry line across the backs on wall brackets */
      [[-5.4, 0], [5.2, 0]].forEach(function (p) {
        F.rod(p[0], 3.4, -4.0, p[0], 3.4, -4.7, 0.05, IRON, 'metal');
      });
      K.line(-5.4, 3.4, -4.7, 5.2, 3.3, -4.7, 7);
      /* left flank: windows, a raking shore, a woodpile */
      K.win(A, 3, 1.8, 1.6, 0.8, 1.0, { wall: cA, bars: true });
      K.win(A, 3, -1.2, 4.1, 0.8, 1.0, { wall: cA, shut: F.pick(SHUT) });
      F.beam(-7.7, 0, -1.8, -6.3, 4.6, -1.8, 0.28, 0.28, tim, 'wood');
      F.box(-6.35, 4.3, -1.8, 0.2, 0.6, 0.6, 0, tim, 'wood');
      F.box(-7.7, 0, -1.8, 0.5, 0.25, 0.6, 0, dark, 'stone');
      for (let i = 0; i < 3; i++) for (let k = 0; k < 4 - i; k++) {
        const zz = 0.4 + k * 0.3 + i * 0.15;
        F.rod(-7.2, 0.15 + i * 0.28, zz, -6.3, 0.15 + i * 0.28, zz, 0.13, shade(tim, (k % 2) * 0.1), 'wood');
      }
      /* right flank: windows then the timber stair to B's roof */
      K.win(B, 2, 0.4, 3.9, 0.8, 1.0, { wall: cB });
      K.win(B, 2, 2.6, 1.5, 0.8, 1.0, { wall: cB, bars: true });
      K.flight(6.75, 4.3, 6.75, -2.4, 0, B.h, 1.1, tim2, { rail: 1 });
      F.box(6.72, B.h - 0.2, -3.1, 1.15, 0.2, 1.4, 0, tim2, 'wood');
      [[7.2, -3.7], [7.2, -2.5], [6.3, -3.7]].forEach(function (p) { F.rod(p[0], 0, p[1], p[0], B.h - 0.2, p[1], 0.1, tim, 'wood'); });
      F.beam(7.2, 0.3, -3.7, 7.2, B.h - 0.4, -2.5, 0.1, 0.1, tim, 'wood');
      K.rail(7.25, -3.8, 7.25, -2.4, B.h, 1.0, tim);
      /* patches all round */
      patches(A, [0, 1, 3], 0.6, 6.0, 5);
      patches(B, [0, 1, 2], 0.6, 5.4, 4);
      /* A roof: shack + patched awning in front of it */
      const yA = A.h + 0.17, S = { x: -4.25, z: -1.95, w: 3.1, d: 3.4 };
      F.box(S.x, yA, S.z, S.w, 2.4, S.d, 0, shade(cA, 0.05), 'plaster');
      for (let i = 0; i < 4; i++) K.fb(S, 2, -1.3 + i * 0.85, yA, 0.7, 2.4, 0.06, 0.03, i % 2 ? tim : tim2, 'wood');
      F.box(S.x, yA + 2.4, S.z, S.w + 0.5, 0.18, S.d + 0.5, 0, shade(tim, -0.05), 'wood');
      K.door(S, 0, 0.55, yA, 0.95, 1.95, { wall: cA, ground: yA, jamb: 0.18, leaf: F.pick(SHUT) });
      K.win(S, 3, 0.2, yA + 1.0, 0.6, 0.7, { wall: cA, shut: F.pick(FADED) });
      K.pipe(S.x - 0.9, S.z - 0.9, yA + 2.58, 1.1);
      K.canopy(-4.05, 1.3, yA + 2.3, 3.5, 3.0, F.pick(SAIL), { posts: [[-1, 1], [1, 1]], base: yA, val: [0], patch: 4 });
      F.box(-4.9, yA, 1.2, 1.4, 0.45, 0.45, 0, tim, 'wood');
      K.jar(-2.9, 2.2, yA, 1.0);
      K.rug(-4.3, 2.6, yA, 1.5, true);
      K.pot(-5.5, 3.2, yA, 0.8);
      /* ladder from B's roof over A's parapet */
      K.ladder(0.9, B.h + 0.17, -2.6, 0.12, yA + 1.0, -2.6, 0, 1);
      /* B roof: rack, jars, crates, rugs */
      const yB = B.h + 0.17;
      K.rack(3.1, 1.4, yB, 3.6, 1.7, true);
      [[4.8, -2.6], [5.3, -1.7], [4.7, -0.8]].forEach(function (p) { K.jar(p[0], p[1], yB, 1.15); });
      K.crate(1.2, 3.4, yB, 0.8, 0.2);
      K.crate(2.2, 3.5, yB, 0.7, -0.1);
      K.rug(3.2, -3.0, yB, 1.8, true, F.pick(BANNER));
      K.rug(3.2, -2.6, yB, 1.8, true, F.pick(BANNER));
      K.barrel(1.2, -3.3, yB, 0.9);
      /* street clutter */
      F.box(-4.2, 0, 4.55, 1.8, 0.45, 0.5, 0, tim, 'wood');
      K.jar(0.9, 4.95, 0, 1.2);
      K.crate(-5.5, 4.7, 0, 0.7, 0.3);
    } else if (F.variant === 1) {
      /* -------- courtyard hovel: L of mud rooms round a walled yard,
         hipped lean-to, reed ramada, ladder to a roof of racks */
      const mud = F.pick(MUD), c2 = shade(c, -0.05), reed = F.pick(REED);
      const M = { x: -1.5, z: -2.75, w: 7, d: 4.5, h: 3.3 };
      const W = { x: -3.4, z: 2.15, w: 3.2, d: 5.3, h: 2.8 };
      F.box(M.x, 0, M.z, M.w + 0.3, 0.35, M.d + 0.3, 0, shade(c, -0.3), 'stone');
      F.box(M.x, 0, M.z, M.w, M.h, M.d, 0, c, 'plaster');
      F.box(M.x, M.h, M.z, M.w + 0.16, 0.15, M.d + 0.16, 0, trim, 'stone');
      K.parapet(M, M.h + 0.15, 0.45, 0.25, c, [{ s: 0, u: 2.9, len: 1.0 }]);
      F.box(W.x, 0, W.z, W.w + 0.3, 0.35, W.d + 0.3, 0, shade(c, -0.3), 'stone');
      F.box(W.x, 0, W.z, W.w, W.h, W.d, 0, c2, 'plaster');
      F.box(W.x, W.h, W.z, W.w + 0.3, 0.12, W.d + 0.3, 0, shade(tim, -0.1), 'wood');
      F.pyrRoof(W.x, W.h + 0.12, W.z, W.w + 0.8, 1.1, W.d + 0.8, 0, reed, 'thatch');
      F.box(W.x, W.h + 1.1, W.z, 0.5, 0.2, 0.5, 0, shade(reed, -0.2), 'thatch');
      K.vigas(M, 1, M.h - 0.45, 6, tim);
      K.vigas(M, 3, M.h - 0.45, 4, tim);
      /* yard walls, gate and leaf */
      const wc = shade(mud, 0.05), wallH = 1.9;
      function yw(x, z, w, d) {
        F.box(x, 0, z, w, wallH, d, 0, wc, 'stone');
        F.box(x, wallH, z, w + 0.12, 0.14, d + 0.12, 0, shade(wc, -0.15), 'stone');
      }
      yw(-0.15, 4.6, 3.3, 0.4);
      yw(4.05, 4.6, 1.9, 0.4);
      yw(4.8, -0.2, 0.4, 9.2);
      yw(3.5, -4.8, 3.0, 0.4);
      /* buttresses, a wall niche, a drain hole and rubble patches on the yard walls */
      [-3.4, -0.8, 1.9].forEach(function (pz) {
        F.box(5.15, 0, pz, 0.35, 1.5, 0.6, 0, shade(wc, -0.1), 'stone');
        F.box(5.15, 1.5, pz, 0.28, 0.2, 0.5, 0, shade(wc, -0.18), 'stone');
      });
      F.box(5.02, 0.9, 3.2, 0.06, 0.7, 0.5, 0, DOOR, 'wood');
      F.box(5.1, 0.85, 3.2, 0.2, 0.08, 0.7, 0, shade(wc, -0.2), 'stone');
      F.box(5.02, 0.05, 0.6, 0.06, 0.2, 0.3, 0, DOOR, 'wood');
      [[5.02, 1.0, -2.2, 0.06, 0.7, 1.4], [5.02, 0.3, 2.3, 0.06, 0.6, 1.0], [-0.9, 0.7, 4.82, 1.2, 0.6, 0.06], [4.2, 0.4, 4.82, 0.9, 0.8, 0.06]].forEach(function (b) {
        F.box(b[0], b[1], b[2], b[3], b[4], b[5], 0, shade(wc, -0.14), 'stone');
      });
      /* street shrine niche in the front wall with a lamp */
      F.box(-0.3, 0.9, 4.82, 0.6, 0.8, 0.06, 0, DOOR, 'wood');
      F.box(-0.3, 0.8, 4.9, 0.9, 0.1, 0.25, 0, shade(wc, -0.2), 'stone');
      F.box(-0.3, 1.7, 4.88, 0.9, 0.14, 0.2, 0, shade(wc, -0.2), 'stone');
      F.ball(-0.3, 1.05, 4.9, 0.1, GLOW, 'glow');
      /* reed matting along the right wall top */
      F.box(4.8, wallH + 0.14, -0.2, 0.3, 0.3, 9.2, 0, F.pick(REED), 'thatch');
      [1.35, 3.25].forEach(function (px) {
        F.box(px, 0, 4.6, 0.36, 2.6, 0.5, 0, tim, 'wood');
      });
      F.box(2.3, 2.6, 4.6, 2.5, 0.28, 0.55, 0, tim, 'wood');
      F.box(1.95, 0, 4.0, 0.08, 2.0, 1.0, 0, shade(tim, 0.12), 'wood');
      F.box(1.95, 0.4, 4.0, 0.12, 0.1, 1.0, 0, tim, 'wood');
      /* lean-to between the main room and the right wall */
      F.pyrRoof(2.0, 2.2, M.z + 0.05, 6.1, 1.0, M.d + 0.3, 0, shade(reed, -0.06), 'thatch');
      [[4.6, -4.8], [4.6, -0.6]].forEach(function (p) { F.rod(p[0], 1.9, p[1], p[0], 2.2, p[1], 0.1, tim, 'wood'); });
      F.rod(4.95, 2.18, -5.0, 4.95, 2.18, -0.45, 0.1, tim, 'wood');
      F.rod(4.6, 0, -0.5, 4.6, 2.2, -0.5, 0.12, tim, 'wood');
      for (let i = 0; i < 3; i++) for (let k = 0; k < 3 - i; k++) {
        const zz = -4.2 + k * 0.32 + i * 0.16;
        F.rod(2.3, 0.14 + i * 0.27, zz, 3.9, 0.14 + i * 0.27, zz, 0.13, shade(tim, (k % 2) * 0.1), 'wood');
      }
      K.jar(3.8, -1.2, 0, 1.1); K.jar(3.2, -1.3, 0, 0.9);
      /* main room openings */
      K.door(M, 0, 1.2, 0.3, 1.1, 2.1, { wall: c, ground: 0, leaf: F.pick(SHUT), hood: true });
      K.win(M, 0, -1.3, 1.3, 0.7, 0.8, { wall: c, shut: F.pick(FADED) });
      K.win(M, 1, -2.0, 1.8, 0.6, 0.6, { wall: c, bars: true });
      K.win(M, 1, 1.6, 1.8, 0.6, 0.6, { wall: c, bars: true });
      K.win(M, 3, 0.2, 1.4, 0.6, 0.8, { wall: c, shut: F.pick(SHUT) });
      K.drain(M, 1, 3.2, 0.35, M.h, c);
      /* wing openings: door into yard, street window, flank window */
      K.door(W, 2, 0.2, 0.3, 1.0, 2.0, { wall: c2, ground: 0, leaf: F.pick(SHUT) });
      K.win(W, 0, 0, 1.3, 0.7, 0.7, { wall: c2, bars: true });
      K.win(W, 3, 0.8, 1.3, 0.7, 0.8, { wall: c2, shut: F.pick(FADED) });
      K.win(W, 3, -1.6, 1.4, 0.5, 0.6, { wall: c2 });
      patches(M, [1, 3], 0.4, 3.0, 3);
      patches(W, [0, 3], 0.4, 2.6, 2);
      /* reed ramada over the yard */
      F.pyrRoof(1.9, 2.5, 1.9, 3.8, 0.9, 3.2, 0, reed, 'thatch');
      F.box(1.9, 2.36, 1.9, 3.6, 0.14, 3.0, 0, shade(reed, -0.15), 'thatch');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        F.rod(1.9 + p[0] * 1.6, 0, 1.9 + p[1] * 1.3, 1.9 + p[0] * 1.6, 2.4, 1.9 + p[1] * 1.3, 0.1, tim, 'wood');
      });
      F.box(1.9, 0, 1.9, 1.6, 0.75, 0.9, 0, tim2, 'wood');
      F.box(1.9, 0, 3.0, 1.6, 0.42, 0.4, 0, tim, 'wood');
      F.box(1.9, 0, 0.8, 1.6, 0.42, 0.4, 0, tim, 'wood');
      K.jar(1.6, 1.8, 0.75, 0.45); K.jar(2.2, 2.0, 0.75, 0.4);
      /* hearth + tripod, trough, jars */
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * TAU;
        F.box(3.9 + Math.cos(a) * 0.55, 0, 3.6 + Math.sin(a) * 0.55, 0.3, 0.25, 0.3, a, dark, 'stone');
      }
      F.blob(3.9, 0.12, 3.6, 0.35, 0.2, 0, 0xffb066, 'glow');
      [0, 1, 2].forEach(function (i) {
        const a = i / 3 * TAU;
        F.rod(3.9 + Math.cos(a) * 0.6, 0, 3.6 + Math.sin(a) * 0.6, 3.9, 1.4, 3.6, 0.04, IRON, 'metal');
      });
      F.cyl(3.9, 0.55, 3.6, 0.28, 0.35, 0, IRON, 'metal');
      F.box(-0.8, 0, 0.4, 1.6, 0.5, 0.6, 0, shade(c, -0.2), 'stone');
      F.box(-0.8, 0.44, 0.4, 1.4, 0.06, 0.45, 0, 0x4a5a5a, 'glass');
      K.jar(-1.2, 3.8, 0, 1.0); K.jar(-0.5, 4.1, 0, 0.8);
      /* ladder up to the main roof */
      K.ladder(1.4, 0, 0.4, 1.4, M.h + 0.9, -0.42, 1, 0);
      const yR = M.h + 0.15;
      K.rack(-3.0, -2.0, yR, 3.2, 1.6, true, [0x9a6a5a, 0x8a5a3a, 0xa08464, 0x7a2028]);
      K.rack(-0.2, -3.6, yR, 2.6, 1.4, true);
      for (let i = 0; i < 3; i++) F.rod(-4.6, yR + 0.16 + i * 0.3, -4.0 + i * 0.05, -4.6 + 0.02, yR + 0.16 + i * 0.3, -1.0, 0.16, shade(reed, 0.05), 'thatch');
      K.jar(0.9, -1.3, yR, 0.9); K.jar(-4.4, -0.9, yR, 0.9);
      F.cyl(0.1, yR, -1.2, 0.45, 0.35, 0, shade(reed, -0.1), 'thatch');
    } else if (F.variant === 2) {
      /* -------- narrow tenement: three storeys, timber galleries up the
         flank with stairs and ladders, laundry everywhere, a roof room */
      const T = { x: -0.8, z: 0, w: 5.6, d: 9, h: 10.2 };
      F.box(T.x, 0, T.z, T.w + 0.3, 0.5, T.d + 0.3, 0, shade(c, -0.3), 'stone');
      F.box(T.x, 0, T.z, T.w, T.h, T.d, 0, c, 'plaster');
      [3.4, 6.8].forEach(function (y) { F.box(T.x, y - 0.1, T.z, T.w + 0.14, 0.2, T.d + 0.14, 0, trim, 'stone'); });
      F.box(T.x, T.h - 0.05, T.z, T.w + 0.24, 0.24, T.d + 0.24, 0, trim, 'stone');
      /* quoins on the front corners */
      [-1, 1].forEach(function (k) {
        for (let i = 0; i < 9; i++) F.box(T.x + k * (T.w / 2 - 0.2), 0.5 + i * 1.1, T.z + T.d / 2 + 0.02, i % 2 ? 0.5 : 0.8, 0.5, 0.1, 0, shade(c, -0.12), 'stone');
      });
      K.parapet(T, T.h + 0.19, 0.8, 0.28, c, [{ s: 2, u: -3.8, len: 0.9 }]);
      /* front */
      K.door(T, 0, -1.2, 0.5, 1.2, 2.4, { wall: c, leaf: F.pick(SHUT), lamp: false });
      K.win(T, 0, 1.3, 1.3, 0.9, 1.3, { wall: c, bars: true });
      [4.2, 7.6].forEach(function (y, i) {
        K.win(T, 0, -1.3, y, 0.9, 1.4, { wall: c, shut: F.pick(FADED) });
        K.win(T, 0, 1.3, y, 0.9, 1.4, { wall: c, shut: F.pick(SHUT), box: i === 1 });
      });
      /* cantilevered box balcony at the second floor, cloth screen */
      const fz = T.z + T.d / 2;
      F.box(T.x - 1.3, 3.35, fz + 0.5, 2.2, 0.18, 1.0, 0, tim, 'wood');
      [-2.2, -0.4].forEach(function (px) { F.beam(T.x + px + 0.9, 2.5, fz + 0.05, T.x + px + 0.9, 3.35, fz + 0.9, 0.14, 0.14, tim, 'wood'); });
      K.rail(T.x - 2.35, fz + 0.95, T.x - 0.25, fz + 0.95, 3.53, 0.9, tim2, 0.35);
      F.box(T.x - 1.3, 3.53, fz + 0.99, 2.0, 0.6, 0.03, 0, F.pick(FADED), 'cloth');
      /* laundry across the front at the top floor */
      [-1, 1].forEach(function (k) { F.rod(T.x + k * 2.4, 9.3, fz, T.x + k * 2.4, 9.3, fz + 0.9, 0.04, IRON, 'metal'); });
      K.line(T.x - 2.4, 9.3, fz + 0.9, T.x + 2.4, 9.25, fz + 0.9, 5);
      /* left flank */
      [1.4, 4.4, 7.8].forEach(function (y, i) {
        K.win(T, 3, -2.2, y, 0.8, 1.1, { wall: c, shut: i === 1 ? F.pick(SHUT) : false, bars: i === 0 });
        K.win(T, 3, 2.0, y, 0.8, 1.1, { wall: c, shut: i === 2 ? F.pick(FADED) : false });
      });
      K.drain(T, 3, -4.1, 0.5, T.h, c);
      F.beam(T.x - 4.4, 0, 0, T.x - 2.85, 5.4, 0, 0.3, 0.3, tim, 'wood');
      F.box(T.x - 2.9, 5.0, 0, 0.14, 0.7, 0.7, 0, tim, 'wood');
      /* back: windows and a privy lean-to */
      [1.5, 4.4, 7.8].forEach(function (y) { K.win(T, 1, -1.2, y, 0.8, 1.1, { wall: c }); });
      [4.4, 7.8].forEach(function (y) { K.win(T, 1, 1.3, y, 0.8, 1.1, { wall: c, shut: F.pick(SHUT) }); });
      F.box(T.x + 1.2, 0, -5.3, 2.2, 2.2, 1.6, 0, shade(tim, 0.08), 'wood');
      F.box(T.x + 1.2, 2.2, -5.35, 2.5, 0.12, 1.9, 0, tim, 'wood');
      F.box(T.x + 1.2, 0, -6.12, 0.8, 1.9, 0.06, 0, DOOR, 'wood');
      patches(T, [0, 1, 3], 0.8, 9.5, 7);
      /* right flank: galleries, doors, stairs, ladders */
      const gx = T.x + T.w / 2 + 0.65;           /* gallery centre x */
      const G1 = { y: 3.4, z0: -4.3, z1: 4.3 }, G2 = { y: 6.8, z0: -4.3, z1: 2.6 };
      [G1, G2].forEach(function (G) {
        const zc = (G.z0 + G.z1) / 2, L = G.z1 - G.z0;
        F.box(gx, G.y - 0.18, zc, 1.3, 0.18, L, 0, tim2, 'wood');
        F.box(gx + 0.6, G.y - 0.42, zc, 0.16, 0.26, L, 0, tim, 'wood');
        K.rail(gx + 0.6, G.z0, gx + 0.6, G.z1, G.y, 1.0, tim, 0.45);
        for (let z = G.z0 + 0.1; z <= G.z1 - 0.05; z += (L - 0.2) / 3) {
          F.rod(gx + 0.55, 0, z, gx + 0.55, G.y - 0.18, z, 0.1, tim, 'wood');
          F.beam(gx + 0.55, G.y - 1.1, z, T.x + T.w / 2, G.y - 0.25, z, 0.1, 0.1, tim, 'wood');
        }
      });
      K.door(T, 2, 1.0, G1.y, 1.0, 2.2, { wall: c, ground: G1.y, jamb: 0.2, leaf: F.pick(SHUT) });
      K.door(T, 2, -1.2, G2.y, 1.0, 2.2, { wall: c, ground: G2.y, jamb: 0.2, leaf: F.pick(SHUT) });
      K.win(T, 2, -2.8, G1.y + 1.0, 0.8, 1.0, { wall: c });
      K.win(T, 2, 1.4, G2.y + 1.0, 0.8, 1.0, { wall: c });
      K.win(T, 2, -1.8, 1.4, 0.8, 1.0, { wall: c, bars: true });
      K.door(T, 2, 2.6, 0.5, 1.0, 2.2, { wall: c, jamb: 0.2 });
      K.flight(gx + 1.15, 4.4, gx + 1.15, -1.0, 0, G1.y, 1.0, tim2, { rail: 1 });
      F.box(gx + 1.15, G1.y - 0.18, -1.7, 1.0, 0.18, 1.4, 0, tim2, 'wood');
      F.rod(gx + 1.6, 0, -2.3, gx + 1.6, G1.y - 0.18, -2.3, 0.1, tim, 'wood');
      K.ladder(gx, G1.y, 3.7, gx, G2.y + 0.9, 2.7, 1, 0);
      K.ladder(gx + 0.1, G2.y, -3.3, T.x + T.w / 2 + 0.15, T.h + 1.1, -3.8, 0, 1);
      /* laundry along the gallery rails */
      K.line(gx + 0.62, G1.y + 1.0, G1.z0 + 0.2, gx + 0.62, G1.y + 1.0, 1.0, 4);
      K.line(gx + 0.62, G2.y + 1.0, G2.z0 + 0.2, gx + 0.62, G2.y + 1.0, 2.3, 4);
      /* roof room + canopy + clutter */
      const yR = T.h + 0.19, RR = { x: T.x, z: -2.55, w: 5.0, d: 3.3 };
      F.box(RR.x, yR, RR.z, RR.w, 2.4, RR.d, 0, shade(c, 0.06), 'plaster');
      F.box(RR.x, yR + 2.4, RR.z, RR.w + 0.4, 0.18, RR.d + 0.4, 0, tim, 'wood');
      K.door(RR, 0, 1.3, yR, 0.9, 2.0, { wall: c, ground: yR, jamb: 0.18, leaf: F.pick(SHUT) });
      K.win(RR, 0, -1.2, yR + 1.0, 0.8, 0.8, { wall: c, shut: F.pick(FADED) });
      K.win(RR, 3, 0, yR + 1.0, 0.7, 0.7, { wall: c });
      K.pipe(RR.x - 1.8, RR.z - 0.9, yR + 2.58, 1.0);
      K.canopy(T.x, 1.3, yR + 2.2, 5.0, 3.0, F.pick(SAIL), { posts: [[-1, 1], [1, 1]], base: yR, val: [0, 3], patch: 3 });
      K.barrel(T.x - 1.9, 0.6, yR, 0.9);
      K.jar(T.x - 1.8, 2.3, yR, 0.9);
      K.rack(T.x + 0.6, 1.4, yR, 2.8, 1.5, true);
      F.box(T.x + 1.8, yR, 3.0, 1.0, 0.45, 0.45, 0, tim, 'wood');
    } else if (F.variant === 3) {
      /* -------- shore house on piles: deck, porch, stair, boat landing,
         a reed shelter and a net rack on the roof */
      const tc = shade(c, 0.04), pile = shade(tim, -0.08), deckC = shade(tim, 0.18);
      const yD = 1.8;
      /* deck on piles with stone footings and braces */
      F.box(0, yD - 0.25, 0.5, 9, 0.25, 7, 0, deckC, 'wood');
      F.box(0, yD - 0.55, 0.5, 9.1, 0.3, 0.2, 0, pile, 'wood');
      for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) {
        const px = -4.3 + i * 8.6 / 3, pz = -2.8 + k * 3.3;
        F.box(px, 0, pz, 0.7, 0.35, 0.7, 0, dark, 'stone');
        F.cyl(px, 0.35, pz, 0.18, yD - 0.6, 0, pile, 'wood');
        if (k < 2) F.beam(px, 0.4, pz, px, yD - 0.35, pz + 3.3, 0.12, 0.12, pile, 'wood');
      }
      [-2.8, 0.5, 3.8].forEach(function (pz) { F.box(0, yD - 0.5, pz, 8.8, 0.25, 0.25, 0, pile, 'wood'); });
      /* house */
      const H = { x: -1.0, z: -0.7, w: 6.4, d: 4.2, h: 3.2 };
      F.box(H.x, yD, H.z, H.w, H.h, H.d, 0, tc, 'plaster');
      [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) {
        F.box(H.x + a * (H.w / 2 - 0.12), yD, H.z + b * (H.d / 2 - 0.12), 0.3, H.h, 0.3, 0, tim, 'wood');
      }); });
      F.box(H.x, yD + 1.0, H.z, H.w + 0.06, 0.18, H.d + 0.06, 0, tim, 'wood');
      F.box(H.x, yD + H.h - 0.2, H.z, H.w + 0.1, 0.22, H.d + 0.1, 0, tim, 'wood');
      F.box(H.x, yD + H.h, H.z, H.w + 0.6, 0.16, H.d + 0.6, 0, shade(tim, 0.05), 'wood');
      const yR = yD + H.h + 0.16;
      /* timber roof rail with a gap for the ladder */
      K.rail(H.x - H.w / 2 - 0.2, H.z - H.d / 2 - 0.2, H.x + H.w / 2 + 0.2, H.z - H.d / 2 - 0.2, yR, 0.8, tim);
      K.rail(H.x - H.w / 2 - 0.2, H.z - H.d / 2 - 0.2, H.x - H.w / 2 - 0.2, H.z + H.d / 2 + 0.2, yR, 0.8, tim);
      K.rail(H.x + H.w / 2 + 0.2, H.z - H.d / 2 - 0.2, H.x + H.w / 2 + 0.2, H.z + H.d / 2 + 0.2, yR, 0.8, tim);
      K.rail(H.x - H.w / 2 - 0.2, H.z + H.d / 2 + 0.2, H.x + 1.6, H.z + H.d / 2 + 0.2, yR, 0.8, tim);
      /* openings */
      K.door(H, 0, -1.3, yD, 1.1, 2.2, { wall: tc, ground: yD, jamb: 0.22, leaf: F.pick(SHUT) });
      K.win(H, 0, 1.2, yD + 1.1, 1.0, 1.0, { wall: tc, shut: F.pick(FADED) });
      K.win(H, 1, -1.5, yD + 1.1, 0.8, 0.9, { wall: tc, shut: F.pick(SHUT) });
      K.win(H, 1, 1.5, yD + 1.1, 0.8, 0.9, { wall: tc });
      K.win(H, 3, 0, yD + 1.1, 0.8, 0.9, { wall: tc, shut: F.pick(FADED) });
      K.door(H, 2, 0.3, yD, 1.0, 2.1, { wall: tc, ground: yD, jamb: 0.2 });
      /* porch rails (front and left), leaving the stair gap */
      K.rail(-4.4, 3.95, -3.0, 3.95, yD, 0.95, tim);
      K.rail(-1.4, 3.95, 4.4, 3.95, yD, 0.95, tim);
      K.rail(-4.45, -2.9, -4.45, 3.95, yD, 0.95, tim);
      K.rail(-4.4, -2.95, 4.4, -2.95, yD, 0.95, tim);
      K.rail(4.45, -2.9, 4.45, 0.9, yD, 0.95, tim);
      /* front stair down to the ground */
      K.flight(-2.2, 6.6, -2.2, 4.0, 0, yD, 1.2, deckC, { rail: -1 });
      /* boat landing: lower jetty and steps */
      F.box(6.3, 0.45, 2.1, 3.6, 0.25, 2.6, 0, deckC, 'wood');
      [[4.7, 1.0], [7.9, 1.0], [4.7, 3.2], [7.9, 3.2]].forEach(function (p) {
        F.box(p[0], 0, p[1], 0.6, 0.25, 0.6, 0, dark, 'stone');
        F.cyl(p[0], 0.25, p[1], 0.17, 0.2, 0, pile, 'wood');
      });
      K.flight(6.4, 1.6, 4.5, 1.6, 0.7, yD, 1.1, deckC, {});
      [[8.0, 0.9], [8.0, 3.3]].forEach(function (p) {
        F.cyl(p[0], 0.7, p[1], 0.14, 1.0, 0, pile, 'wood');
        F.cyl(p[0], 1.35, p[1], 0.18, 0.16, 0, ROPE, 'rope');
      });
      K.ladder(8.3, 0, 2.1, 8.1, 0.95, 2.1, 0, 1);
      K.boat(9.4, 2.1, 0, 5.2, false);
      F.rod(9.2, 0.6, 0.4, 8.9, 0.1, 3.8, 0.05, 0x8a7a5a, 'wood');
      /* deck clutter: fish traps, nets, oars, coil */
      [[2.8, 2.5], [3.5, 3.1], [2.9, 3.4]].forEach(function (p) {
        F.cyl(p[0], yD, p[1], 0.32, 0.8, 0, shade(REED[0], -0.05), 'thatch');
        F.cone(p[0], yD + 0.8, p[1], 0.32, 0.3, 0, shade(REED[0], -0.1), 'thatch');
      });
      F.box(1.2, yD + 0.1, 3.97, 2.8, 0.8, 0.04, 0, 0x7a7458, 'cloth');
      F.box(-4.47, yD + 0.1, 0.5, 0.04, 0.8, 3.2, 0, 0x7a7458, 'cloth');
      F.cyl(-3.4, yD, 2.8, 0.45, 0.2, 0, ROPE, 'rope');
      F.rod(-3.8, yD, -2.5, -3.6, yD + 2.6, -2.2, 0.05, tim2, 'wood');
      F.box(-3.6, yD + 2.2, -2.2, 0.08, 0.6, 0.2, 0, tim2, 'wood');
      K.barrel(-3.5, 3.3, yD, 0.8);
      /* ladder porch -> roof */
      K.ladder(1.6, yD, 2.3, 1.6, yR + 0.9, H.z + H.d / 2 + 0.25, 1, 0);
      /* roof: reed shelter, net rack, baskets */
      const reed = F.pick(REED);
      F.pyrRoof(-2.3, yR + 2.0, -1.2, 3.0, 0.8, 2.6, 0, reed, 'thatch');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        F.rod(-2.3 + p[0] * 1.3, yR, -1.2 + p[1] * 1.1, -2.3 + p[0] * 1.3, yR + 2.0, -1.2 + p[1] * 1.1, 0.08, tim, 'wood');
      });
      F.box(-2.3, yR, -1.9, 2.8, 1.6, 0.08, 0, shade(reed, -0.1), 'thatch');
      K.crate(-2.8, -1.0, yR, 0.8, 0.1);
      K.jar(-1.7, -1.2, yR, 0.9);
      /* net rack: two posts, net hanging */
      [0.2, 2.0].forEach(function (px) { F.rod(px, yR, -0.3, px, yR + 1.9, -0.3, 0.07, tim, 'wood'); });
      F.rod(0.0, yR + 1.9, -0.3, 2.2, yR + 1.9, -0.3, 0.05, tim, 'wood');
      F.box(1.1, yR + 0.5, -0.3, 1.9, 1.35, 0.03, 0, 0x6f6c50, 'cloth');
      F.cyl(1.0, yR, 0.9, 0.35, 0.35, 0, shade(reed, -0.15), 'thatch');
    } else {
      /* -------- mudbrick house on a plinth: battered walls, vigas, solid
         stair up the flank, roof cistern, drying racks, jars, roof room */
      const mud = F.pick(MUD), mc = shade(mud, 0.08), pl = shade(c, -0.18);
      const yP = 0.9, H0 = 5.4, r0 = 4.0, r1 = 3.7;
      function face(y) { return r0 - (r0 - r1) * (y - yP) / H0; }
      function blk(y) { const f = face(y); return { x: 0, z: 0, w: 2 * f, d: 2 * f }; }
      F.box(0, 0, 0, 10.4, yP, 10.4, 0, pl, 'stone');
      F.box(0, yP - 0.12, 0, 10.6, 0.12, 10.6, 0, shade(pl, -0.12), 'stone');
      F.frustum(0, yP, 0, r0, r1, H0, 0, mc, 'stone', 4);
      const yT = yP + H0;
      F.box(0, yT, 0, 2 * r1 + 0.1, 0.14, 2 * r1 + 0.1, 0, shade(mc, -0.15), 'stone');
      const PB = { x: 0, z: 0, w: 2 * r1, d: 2 * r1 };
      K.parapet(PB, yT + 0.14, 0.7, 0.3, mc, [{ s: 3, u: -2.9, len: 1.2 }]);
      for (let s = 0; s < 4; s++) for (let i = 0; i < 5; i++) {
        const u = -r1 + 0.2 + i * (2 * r1 - 0.4) / 4;
        const p = K.at(PB, s, u, -0.15);
        if (s === 3 && u < -2.2 && u > -3.6) continue;
        F.blob(p[0], yT + 0.84, p[1], 0.2, 0.25, 0, mc, 'stone');
      }
      /* vigas at two levels on all four faces, canales under the parapet */
      [3.45, yT - 0.4].forEach(function (y) {
        for (let s = 0; s < 4; s++) K.vigas(blk(y), s, y, 6, tim);
      });
      [[0, 1.6], [1, -1.6], [2, 0.8], [3, 1.4]].forEach(function (p) {
        K.fb(PB, p[0], p[1], yT + 0.14, 0.3, 0.2, 1.0, 0.4, shade(tim, 0.1), 'wood');
      });
      /* front: door with timber lintel, windows */
      const bd = blk(2.0);
      K.door(bd, 0, 0, yP, 1.3, 2.3, { wall: mc, ground: yP, head: tim, trim: shade(mc, -0.12), leaf: shade(tim, 0.12) });
      K.flight(0, 6.4, 0, 5.2, 0, yP, 2.6, pl, { solid: true, base: 0 });
      [[-2.2, 1.9], [2.2, 1.9]].forEach(function (p) { K.win(blk(p[1] + 0.5), 0, p[0], p[1], 0.7, 0.9, { wall: mc, lintel: tim, shut: F.pick(FADED) }); });
      [-1.6, 1.6].forEach(function (u) { K.win(blk(4.6), 0, u, 4.3, 0.7, 0.8, { wall: mc, lintel: tim }); });
      /* sides and back */
      K.win(blk(2.3), 2, -1.5, 1.9, 0.7, 0.9, { wall: mc, lintel: tim, bars: true });
      K.win(blk(2.3), 2, 1.5, 1.9, 0.7, 0.9, { wall: mc, lintel: tim });
      K.win(blk(4.6), 2, 0, 4.3, 0.7, 0.8, { wall: mc, lintel: tim, shut: F.pick(SHUT) });
      K.win(blk(2.3), 1, 0, 1.9, 0.7, 0.9, { wall: mc, lintel: tim, bars: true });
      K.win(blk(4.6), 1, -1.8, 4.3, 0.7, 0.8, { wall: mc, lintel: tim });
      K.win(blk(4.6), 1, 1.8, 4.3, 0.7, 0.8, { wall: mc, lintel: tim });
      K.win(blk(4.6), 3, 1.8, 4.3, 0.6, 0.8, { wall: mc, lintel: tim });
      K.win(blk(2.3), 3, 2.4, 1.9, 0.6, 0.8, { wall: mc, lintel: tim, shut: F.pick(SHUT) });
      /* solid stair up the left flank to the roof */
      K.flight(-4.45, 3.9, -4.45, -3.45, yP, yT + 0.14, 1.4, shade(mc, -0.06), { solid: true, base: yP });
      F.box(-5.0, yP, 0.2, 0.3, 0.2, 7.4, 0, shade(mc, -0.2), 'stone');
      /* roof room, canopy, cistern, jars, racks */
      const yR = yT + 0.14, RR = { x: 1.8, z: -2.0, w: 3.2, d: 2.8 };
      F.box(RR.x, yR, RR.z, RR.w, 2.4, RR.d, 0, shade(mc, 0.05), 'stone');
      F.box(RR.x, yR + 2.4, RR.z, RR.w + 0.3, 0.16, RR.d + 0.3, 0, shade(mc, -0.12), 'stone');
      K.vigas(RR, 0, yR + 2.1, 4, tim, 0);
      K.door(RR, 0, 0.6, yR, 0.9, 1.9, { wall: mc, ground: yR, jamb: 0.18, head: tim, leaf: shade(tim, 0.12) });
      K.win(RR, 3, 0.2, yR + 1.0, 0.6, 0.7, { wall: mc, lintel: tim });
      K.win(RR, 2, 0, yR + 1.0, 0.5, 0.6, { wall: mc, lintel: tim });
      K.canopy(1.4, 0.8, yR + 2.2, 4.0, 2.8, F.pick(SAIL), { posts: [[-1, 1], [1, 1]], base: yR, val: [0], patch: 2 });
      [-0.1, 0.8, 1.7].forEach(function (pz) { K.jar(3.0, pz, yR, 1.25); });
      K.jar(2.2, 1.7, yR, 1.0);
      K.cistern(-2.2, -2.2, yR, 0.95, 1.4, shade(mc, -0.05));
      F.rod(-2.2, yR + 0.3, -3.2, -2.2, yR + 0.3, -3.95, 0.07, IRON, 'metal');
      F.rod(-2.2, 0.9, -4.2, -2.2, yR + 0.3, -3.95, 0.07, IRON, 'metal');
      K.jar(-2.2, -4.7, yP, 1.1);
      K.rack(-1.6, 1.3, yR, 3.0, 1.6, true, [0x7a2028, 0x8a2f2a, 0xa08464, 0x9a6a5a]);
      K.rack(-1.6, 2.5, yR, 3.0, 1.4, true);
      /* plinth life: jars, bench, rack of peppers */
      [[-3.2, 4.6], [-2.5, 4.7], [3.0, 4.6]].forEach(function (p) { K.jar(p[0], p[1], yP, 1.0); });
      F.box(2.0, yP, 4.55, 1.8, 0.45, 0.5, 0, tim, 'wood');
      K.rack(4.7, -1.0, yP, 3.0, 1.4, false, [0x7a2028, 0x8a2f2a, 0x6f7d42]);
      K.crate(4.5, 2.6, yP, 0.7, 0.2);
    }
  }

  ASSET({
    key: 'voth_house_poor', name: 'Poor House', culture: 'voth', family: 'housing', source: 'voth-housing',
    districts: ['poor', 'warren', 'shore'], wealth: [0, 0.35],
    blurb: 'Low-class Voth dwellings: plaster rowhouses, mud courtyard hovels, flank-galleried tenements, shore huts on piles and mudbrick plinth houses, every roof put to use.',
    w: 15.3, d: 11.8, h: 14.3, variants: 5,
    variantDims: [
      { w: 15.3, d: 10.3, h: 10.6 },
      { w: 10.9, d: 10.9, h: 5.1 },
      { w: 9.7, d: 11.8, h: 14.3 },
      { w: 14.6, d: 9.9, h: 8.2 },
      { w: 10.6, d: 11.6, h: 9.1 }
    ],
    build: function (F) { poor(F, kit(F)); }
  });
  /* ============================================================== MIDDLE */
  function middle(F, K) {
    const c = F.pick(STONE), trim = shade(c, -0.16), dark = shade(c, -0.3);
    const tim = F.pick(TIMBERS), tim2 = shade(tim, 0.15);
    const shutC = F.pick(SHUT);
    /* shallow pilasters at given u positions on one face */
    function pil(B, s, us, y0, y1, col) {
      us.forEach(function (u) { K.fb(B, s, u, y0, 0.55, y1 - y0, 0.18, 0.09, col, 'stone'); });
    }
    function bands(B, ys, col, over) {
      ys.forEach(function (y) { F.box(B.x, y, B.z, B.w + (over || 0.14), 0.2, B.d + (over || 0.14), 0, col, 'stone'); });
    }

    if (F.variant === 0) {
      /* -------- Hlaalu block: two corniced storeys, rusticated ground floor,
         roof loft under a low copper hip, canopied roof terrace, stone stair
         that climbs the flank and the back */
      const M = { x: 0, z: 0, w: 13, d: 10 }, H = 7.2, yR = H + 0.25;
      const cop = shade(COPPER, F.rr(-0.05, 0.05));
      F.box(0, 0, 0, 13.6, 0.5, 10.6, 0, dark, 'stone');
      F.box(0, 0, 0, M.w, H, M.d, 0, c, 'stone');
      F.box(0, 0.5, 0, M.w + 0.08, 3.1, M.d + 0.08, 0, shade(c, -0.05), 'stone');
      bands(M, [1.5, 2.6], shade(c, -0.12), 0.12);
      F.box(0, 3.55, 0, M.w + 0.3, 0.3, M.d + 0.3, 0, trim, 'stone');
      F.box(0, H - 0.1, 0, M.w + 0.5, 0.35, M.d + 0.5, 0, trim, 'stone');
      F.box(0, H + 0.25 - 0.25, 0, M.w + 0.2, 0.25, M.d + 0.2, 0, shade(trim, -0.06), 'stone');
      pil(M, 0, [-6.2, -3.35, 3.35, 6.2], 3.85, H - 0.1, trim);
      pil(M, 1, [-6.2, 6.2], 3.85, H - 0.1, trim);
      pil(M, 3, [-4.7, 0, 4.7], 3.85, H - 0.1, trim);
      pil(M, 2, [-4.7, 4.7], 3.85, H - 0.1, trim);
      K.parapet(M, yR, 0.85, 0.3, c, [{ s: 1, u: 0.6, len: 1.3 }]);
      /* front */
      K.door(M, 0, 0, 0.5, 1.6, 2.6, { wall: c, arch: true, lamp: true, leaf: shade(tim, 0.05) });
      [-4.7, -2.1, 2.1, 4.7].forEach(function (u) {
        K.win(M, 0, u, 1.4, 1.0, 1.5, { wall: c, shut: shutC, bars: Math.abs(u) < 3 });
        if (Math.abs(u) > 3) K.win(M, 0, u, 4.4, 1.0, 1.7, { wall: c, shut: shutC, box: true });
        else K.win(M, 0, u, 4.4, 1.0, 1.7, { wall: c, shut: shutC });
      });
      /* balcony + french door over the entrance */
      K.door(M, 0, 0, 3.85, 1.2, 2.4, { wall: c, ground: 3.85, jamb: 0.22, leaf: shutC });
      F.box(0, 3.75, 5.75, 3.4, 0.22, 1.5, 0, trim, 'stone');
      [-1.3, 1.3].forEach(function (px) { F.beam(px, 2.9, 5.05, px, 3.75, 6.2, 0.26, 0.26, trim, 'stone'); });
      K.rail(-1.65, 6.45, 1.65, 6.45, 3.97, 0.95, tim, 0.3);
      K.rail(-1.65, 5.1, -1.65, 6.45, 3.97, 0.95, tim, 0.3);
      K.rail(1.65, 5.1, 1.65, 6.45, 3.97, 0.95, tim, 0.3);
      /* sides and back */
      [-2.6, 2.6].forEach(function (u) { K.win(M, 3, u, 1.4, 1.0, 1.5, { wall: c, bars: true }); K.win(M, 3, u, 4.4, 1.0, 1.6, { wall: c, shut: shutC }); });
      K.fb(M, 3, 0, 0.9, 1.0, 1.6, 0.3, 0, DOOR, 'wood');
      K.fb(M, 3, 0, 0.75, 1.4, 0.18, 0.5, 0.2, trim, 'stone');
      K.fb(M, 3, 0, 2.5, 1.4, 0.3, 0.5, 0.2, trim, 'stone');
      F.ball(-6.75, 1.2, 0, 0.12, GLOW, 'glow');
      [-2.6, 2.6].forEach(function (u) { K.win(M, 2, u, 4.5, 1.0, 1.6, { wall: c, shut: shutC }); });
      [-4.8, -2.2].forEach(function (u) { K.win(M, 1, u, 1.4, 1.0, 1.4, { wall: c, bars: true }); });
      [-4.8, -2.2, 2.4, 4.8].forEach(function (u) { K.win(M, 1, u, 4.4, 1.0, 1.6, { wall: c }); });
      K.door(M, 1, -3.5, 0.5, 1.2, 2.3, { wall: c, leaf: tim });
      K.drain(M, 3, -4.95, 0.5, H, c);
      K.drain(M, 0, 6.35, 0.5, H, c);
      /* stair: up the right flank to a landing, then along the back */
      const sc = shade(c, -0.08);
      K.flight(7.1, 3.8, 7.1, -3.4, 0, 3.7, 1.2, sc, { solid: true, base: 0, rail: 1, railC: IRON });
      F.box(7.1, 0, -4.8, 1.2, 3.7, 2.8, 0, sc, 'stone');
      K.flight(6.5, -5.6, 1.3, -5.6, 3.7, yR, 1.2, sc, { solid: true, base: 0, rail: -1, railC: IRON });
      F.box(0.7, 0, -5.6, 1.2, yR, 1.2, 0, sc, 'stone');
      F.box(3.9, 0.5, -6.22, 0.9, 1.6, 0.06, 0, DOOR, 'wood');
      F.box(3.9, 2.1, -6.25, 1.3, 0.2, 0.2, 0, trim, 'stone');
      /* roof loft with copper hip, terrace canopy */
      const L = { x: -3.25, z: -2.45, w: 5.5, d: 4.0 };
      F.box(L.x, yR, L.z, L.w, 3.0, L.d, 0, shade(c, 0.05), 'stone');
      F.box(L.x, yR + 2.8, L.z, L.w + 0.2, 0.2, L.d + 0.2, 0, trim, 'stone');
      K.hip(L.x, L.z, yR + 3.28, L.w + 1.2, L.d + 1.2, 1.5, cop, { finC: shade(cop, -0.2) });
      K.brackets(L, yR + 3.0, 0.55, 3, tim);
      K.door(L, 0, 1.2, yR, 1.1, 2.3, { wall: c, ground: yR, jamb: 0.22, leaf: shutC });
      K.win(L, 0, -1.3, yR + 1.0, 0.9, 1.2, { wall: c, shut: shutC });
      K.win(L, 3, 0, yR + 1.0, 0.8, 1.1, { wall: c });
      K.win(L, 1, 0, yR + 1.0, 0.9, 1.1, { wall: c });
      K.win(L, 2, -0.6, yR + 1.0, 0.8, 1.1, { wall: c, shut: shutC });
      K.chimney(-5.4, -4.3, yR, 4.0, c);
      K.canopy(-0.6, 1.9, yR + 2.8, 10.8, 3.6, F.pick(SAIL), { posts: [[-1, 1], [1, 1], [1, -1]], base: yR, val: [0, 2] });
      F.rod(-0.6, yR, 3.6, -0.6, yR + 2.75, 3.6, 0.09, TIMBER, 'wood');
      F.box(1.2, yR, 1.8, 2.2, 0.8, 1.0, 0, tim2, 'wood');
      [0.6, 1.8].forEach(function (px) { F.box(px, yR, 0.9, 0.5, 0.45, 0.5, 0, tim, 'wood'); F.box(px, yR, 2.7, 0.5, 0.45, 0.5, 0, tim, 'wood'); });
      F.box(-3.0, yR, 2.0, 2.6, 0.03, 1.7, 0, F.pick(BANNER), 'cloth');
      [[-5.9, 4.3], [5.9, 4.3], [5.9, -0.2], [-0.3, -4.3]].forEach(function (p) { K.pot(p[0], p[1], yR, 1.1); });
      K.jar(4.6, -3.8, yR, 1.0); K.jar(5.4, -3.6, yR, 0.9);
      F.box(3.2, yR, -3.9, 1.8, 0.4, 0.8, 0, tim, 'wood');
    } else if (F.variant === 1) {
      /* -------- Velothi tower-house: battered tower with a small dome and
         capped pylons, a battered lower wing whose roof carries a pergola */
      const tx = -3.0, tz = -1.5, r0 = 3.4, r1 = 2.8, TH = 13.5;
      const wx = 2.6, wz = 1.2, w0 = 3.3, w1 = 3.0, WH = 5.0;
      const tf = function (y) { return r0 - (r0 - r1) * y / TH; };
      const wf = function (y) { return w0 - (w0 - w1) * y / WH; };
      const TB = function (y) { const f = tf(y); return { x: tx, z: tz, w: 2 * f, d: 2 * f }; };
      const WB = function (y) { const f = wf(y); return { x: wx, z: wz, w: 2 * f, d: 2 * f }; };
      const bc = shade(c, -0.12), domeC = F.pick(DOMEC);
      F.frustum(tx, 0, tz, r0 + 0.3, r0 + 0.2, 0.6, 0, dark, 'stone', 4);
      F.frustum(tx, 0, tz, r0, r1, TH, 0, c, 'stone', 4);
      [4.6, 9.2].forEach(function (y) { F.frustum(tx, y, tz, tf(y) + 0.14, tf(y + 0.4) + 0.14, 0.4, 0, bc, 'stone', 4); });
      F.frustum(tx, TH, tz, r1 + 0.25, r1 + 0.25, 0.35, 0, bc, 'stone', 4);
      const TT = { x: tx, z: tz, w: 2 * r1 + 0.5, d: 2 * r1 + 0.5 }, yT = TH + 0.35;
      K.parapet(TT, yT, 0.7, 0.3, c, []);
      /* capped pylons at the four corners */
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        const px = tx + p[0] * (r1 + 0.05), pz = tz + p[1] * (r1 + 0.05);
        F.frustum(px, yT, pz, 0.45, 0.32, 1.6, 0, shade(c, -0.05), 'stone', 4);
        F.pyrRoof(px, yT + 1.6, pz, 0.9, 0.6, 0.9, 0, bc, 'stone');
      });
      /* drum + dome */
      F.cyl(tx, yT, tz, 1.9, 1.0, 0, shade(c, 0.04), 'stone');
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU;
        F.box(tx + Math.sin(a) * 1.88, yT + 0.25, tz + Math.cos(a) * 1.88, 0.4, 0.55, 0.14, a, DOOR, 'wood');
      }
      K.dome(tx, tz, yT + 1.0, 2.0, 1.9, domeC, { ribs: 8, ribR: 0.06 });
      F.cyl(tx, yT + 2.85, tz, 0.08, 0.7, 0, GOLD, 'metal');
      F.ball(tx, yT + 3.6, tz, 0.18, GOLD, 'metal');
      /* wing */
      F.frustum(wx, 0, wz, w0 + 0.3, w0 + 0.2, 0.5, 0, dark, 'stone', 4);
      F.frustum(wx, 0, wz, w0, w1, WH, 0, shade(c, 0.03), 'stone', 4);
      F.frustum(wx, WH, wz, w1 + 0.18, w1 + 0.18, 0.3, 0, bc, 'stone', 4);
      const WT = { x: wx, z: wz, w: 2 * w1 + 0.36, d: 2 * w1 + 0.36 }, yW = WH + 0.3;
      K.parapet(WT, yW, 0.75, 0.3, c, [{ s: 2, u: -2.2, len: 1.3 }]);
      [[1, 1], [-1, 1], [1, -1]].forEach(function (p) {
        const px = wx + p[0] * (w1 + 0.05), pz = wz + p[1] * (w1 + 0.05);
        F.frustum(px, yW, pz, 0.4, 0.28, 1.2, 0, shade(c, -0.05), 'stone', 4);
        F.pyrRoof(px, yW + 1.2, pz, 0.8, 0.5, 0.8, 0, bc, 'stone');
      });
      /* pergola on the wing roof, door out of the tower onto it */
      K.pergola(wx + 0.3, wz + 0.2, yW, 5.0, 5.2, 2.4, { climb: true });
      K.door(TB(yW + 1), 2, 1.3, yW, 1.0, 2.3, { wall: c, ground: yW, arch: true, jamb: 0.25, off: -0.02 });
      F.box(wx + 0.3, yW, wz + 0.2, 2.2, 0.75, 1.1, 0, tim2, 'wood');
      K.pot(wx - 1.6, wz + 2.4, yW, 1.1); K.pot(wx + 2.6, wz + 2.6, yW, 1.0);
      K.jar(wx + 2.6, wz - 2.2, yW, 1.0);
      /* tower doors and windows */
      K.door(TB(1.5), 0, -1.0, 0.6, 1.3, 2.6, { wall: c, arch: true, lamp: true, leaf: shade(tim, 0.05) });
      [-1, 1].forEach(function (k) {
        const px = tx - 1.0 + k * 1.55, pz = tz + tf(1.5) + 0.45;
        F.frustum(px, 0, pz, 0.35, 0.25, 3.4, 0, shade(c, -0.05), 'stone', 4);
        F.pyrRoof(px, 3.4, pz, 0.6, 0.45, 0.6, 0, bc, 'stone');
      });
      [[0, -1.0, 6.0], [0, -1.0, 10.4], [0, 1.2, 10.4], [3, 0, 2.0], [3, -1.2, 6.0], [3, 1.2, 6.0], [3, 0, 10.4],
        [1, 0, 2.0], [1, 0, 6.0], [1, -1.2, 10.4], [1, 1.2, 10.4], [2, -1.6, 6.6], [2, 0, 10.4]].forEach(function (w) {
        K.win(TB(w[2] + 0.8), w[0], w[1], w[2], 0.55, 1.5, { wall: c, arch: true, off: -0.02 });
      });
      /* corbelled balcony on the tower's left face */
      const bx = tx - tf(9.2) - 0.7;
      F.box(bx, 9.1, tz, 1.4, 0.25, 2.6, 0, bc, 'stone');
      [-0.9, 0.9].forEach(function (pz) { F.beam(tx - tf(8.3), 8.3, tz + pz, bx - 0.4, 9.1, tz + pz, 0.22, 0.22, bc, 'stone'); });
      K.rail(bx - 0.65, tz - 1.25, bx - 0.65, tz + 1.25, 9.35, 0.9, IRON, 0.3);
      K.door(TB(10), 3, 0, 9.35, 0.9, 2.1, { wall: c, ground: 9.35, arch: true, jamb: 0.2, off: -0.02 });
      /* wing openings */
      K.door(WB(1.2), 0, 1.0, 0.5, 1.3, 2.4, { wall: c, arch: true, leaf: shutC, hood: true });
      K.win(WB(2), 0, -1.6, 1.5, 0.8, 1.4, { wall: c, arch: true, shut: shutC, off: -0.02 });
      K.win(WB(2), 1, 2.0, 1.5, 0.8, 1.4, { wall: c, arch: true, off: -0.02 });
      K.win(WB(2), 2, 1.6, 1.8, 0.8, 1.4, { wall: c, arch: true, off: -0.02 });
      /* solid stair up the wing's right flank to its roof */
      K.flight(wx + w0 + 0.55, 4.6, wx + w0 + 0.55, -1.2, 0, yW, 1.5, shade(c, -0.08), { solid: true, base: 0, rail: 1, railC: IRON });
      /* buttress at the tower back, a drain, a chimney */
      F.frustum(tx, 0, tz - r0 - 0.4, 0.9, 0.5, 7.0, 0, shade(c, -0.06), 'stone', 4);
      F.pyrRoof(tx, 7.0, tz - r0 - 0.4, 1.2, 0.6, 1.2, 0, bc, 'stone');
      K.chimney(tx + 1.5, tz - 1.6, yT, 1.4, c);
    } else if (F.variant === 2) {
      /* -------- courtyard house: four two-storey ranges round an open
         court with a timber gallery, gate passage, roof room and canopy */
      const H = 7.0, yR = H + 0.2, S = 8;
      const inner = shade(c, 0.05);
      F.box(0, 0, 0, 2 * S + 0.6, 0.45, 2 * S + 0.6, 0, dark, 'stone');
      const ranges = [
        { x: 0, z: 5.5, w: 16, d: 5 },
        { x: 0, z: -5.5, w: 16, d: 5 }, { x: -5.5, z: 0, w: 5, d: 6.2 }, { x: 5.5, z: 0, w: 5, d: 6.2 }];
      ranges.forEach(function (R) { F.box(R.x, 0, R.z, R.w, H, R.d, 0, c, 'stone'); });
      const O = { x: 0, z: 0, w: 2 * S, d: 2 * S }, C = { x: 0, z: 0, w: 6, d: 6 };
      /* side pilasters over the range joints */
      [-3.2, 3.2].forEach(function (pz) { [-1, 1].forEach(function (k) {
        F.box(k * (S + 0.08), 0, pz, 0.3, H, 0.8, 0, trim, 'stone');
      }); });
      /* the gate passage comes out in the court as an arch */
      K.door(C, 0, 0, 0.5, 2.2, 3.0, { wall: inner, ground: 0.5, arch: true, leaf: DOOR, jamb: 0.3 });
      /* outer cornices and ring parapet; inner low parapet round the court */
      F.box(0, 3.4, S + 0.02, 2 * S + 0.1, 0.22, 0.2, 0, trim, 'stone');
      F.box(0, 3.4, -S - 0.02, 2 * S + 0.1, 0.22, 0.2, 0, trim, 'stone');
      F.box(S + 0.02, 3.4, 0, 0.2, 0.22, 2 * S + 0.1, 0, trim, 'stone');
      F.box(-S - 0.02, 3.4, 0, 0.2, 0.22, 2 * S + 0.1, 0, trim, 'stone');
      /* roof slab: four strips round the court hole */
      [[0, 5.5, 16, 5], [0, -5.5, 16, 5], [-5.5, 0, 5, 6], [5.5, 0, 5, 6]].forEach(function (r) {
        F.box(r[0], H - 0.1, r[1], r[2] + 0.4, 0.3, r[3] + 0.4, 0, trim, 'stone');
      });
      K.parapet({ x: 0, z: 0, w: 2 * S + 0.4, d: 2 * S + 0.4 }, yR, 0.8, 0.3, c, []);
      K.parapet({ x: 0, z: 0, w: 6.0, d: 6.0 }, yR, 0.6, 0.25, c, [], { cap: trim });
      /* corner pilasters */
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        F.box(p[0] * (S - 0.1), 0, p[1] * (S - 0.1), 0.8, H, 0.8, 0, trim, 'stone');
      });
      /* gateway: portal on the street face, leaves folded into the passage */
      const fz = S;
      F.box(0, 0, fz + 0.2, 4.4, 4.6, 0.4, 0, trim, 'stone');
      F.box(0, 0.45, fz + 0.21, 2.6, 3.25, 0.44, 0, DOOR, 'wood');
      F.box(0, 4.6, fz + 0.25, 4.9, 0.4, 0.6, 0, shade(trim, -0.08), 'stone');
      F.box(0, 3.7, fz + 0.45, 1.3, 0.5, 0.1, 0, F.pick(JADE), 'stone');
      [-1, 1].forEach(function (k) {
        F.box(k * 1.2, 0.45, fz - 0.9, 0.12, 3.1, 1.3, 0, shade(tim, 0.05), 'wood');
        F.rod(k * 1.9, 3.2, fz + 0.4, k * 1.9, 3.2, fz + 1.0, 0.05, IRON, 'metal');
        F.ball(k * 1.9, 2.95, fz + 1.0, 0.2, GLOW, 'glow');
      });
      /* passage floor steps to street */
      F.box(0, 0, fz + 0.7, 3.6, 0.25, 0.8, 0, shade(dark, 0.1), 'stone');
      /* outer windows: small barred below, latticed above */
      const OB = O;
      [-5.5, -3.2, 3.2, 5.5].forEach(function (u) {
        K.win(OB, 0, u, 1.9, 0.7, 0.8, { wall: c, bars: true });
        K.win(OB, 0, u, 4.4, 1.0, 1.6, { wall: c, screen: true });
      });
      [-5.0, -1.7, 1.7, 5.0].forEach(function (u) {
        K.win(OB, 1, u, 1.9, 0.7, 0.8, { wall: c, bars: true });
        K.win(OB, 1, u, 4.4, 1.0, 1.6, { wall: c, shut: shutC });
      });
      [-4.5, 0, 4.5].forEach(function (u) {
        K.win(OB, 2, u, 4.4, 1.0, 1.6, { wall: c, screen: true });
        K.win(OB, 3, u, 4.4, 1.0, 1.6, { wall: c, shut: shutC });
      });
      [-4.5, 4.5].forEach(function (u) { K.win(OB, 3, u, 1.9, 0.7, 0.8, { wall: c, bars: true }); });
      K.door(OB, 2, 1.3, 0.45, 1.2, 2.4, { wall: c, leaf: shutC, hood: true });
      K.win(OB, 2, -5.2, 1.9, 0.7, 0.8, { wall: c, bars: true });
      K.door(OB, 3, 0, 0.45, 2.2, 2.6, { wall: c, leaf: tim });
      K.drain(OB, 1, -7.2, 0.45, H, c);
      K.drain(OB, 2, 7.2, 0.45, H, c);
      /* court: paving, gallery on posts, stair, well */
      F.box(0, 0.45, 0, 6, 0.06, 6, 0, shade(c, -0.2), 'stone');
      const gy = 3.6, gw = 1.2;
      [[0, 3 - gw / 2, 6, gw], [0, -3 + gw / 2, 6, gw], [3 - gw / 2, 0, gw, 6 - 2 * gw], [-3 + gw / 2, 0, gw, 6 - 2 * gw]].forEach(function (g) {
        F.box(g[0], gy - 0.2, g[1], g[2], 0.2, g[3], 0, tim2, 'wood');
      });
      [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8], [0, -1.8], [0, 1.8], [-1.8, 0], [1.8, 0]].forEach(function (p) {
        F.box(p[0], 0.5, p[1], 0.22, gy - 0.7, 0.22, 0, tim, 'wood');
        F.box(p[0], gy - 0.45, p[1], 0.4, 0.25, 0.4, 0, tim, 'wood');
      });
      K.rail(-1.8, 1.8, 1.8, 1.8, gy, 0.95, tim, 0.3);
      K.rail(-1.8, -1.8, 1.8, -1.8, gy, 0.95, tim, 0.3);
      K.rail(1.8, -1.8, 1.8, 1.8, gy, 0.95, tim, 0.3);
      K.rail(-1.8, -1.8, -1.8, -0.2, gy, 0.95, tim, 0.3);
      K.flight(-1.2, 1.7, -1.2, -1.0, 0.5, gy, 0.9, tim2, { rail: 1 });
      F.box(-1.2, gy - 0.2, -1.4, 0.9, 0.2, 0.8, 0, tim2, 'wood');
      /* cloth canopy over part of the gallery */
      K.canopy(0, 2.4, 6.2, 6.0, 1.2, F.pick(SAIL), { val: [2, 3] });
      F.cyl(0.6, 0.5, 0.3, 0.6, 0.8, 0, shade(c, -0.15), 'stone');
      F.cyl(0.6, 1.3, 0.3, 0.64, 0.1, 0, trim, 'stone');
      [-1, 1].forEach(function (k) { F.rod(0.6 + k * 0.55, 1.3, 0.3, 0.6 + k * 0.55, 2.6, 0.3, 0.05, tim, 'wood'); });
      F.rod(0.05, 2.6, 0.3, 1.15, 2.6, 0.3, 0.05, tim, 'wood');
      F.cyl(0.6, 1.6, 0.3, 0.18, 0.3, 0, 0x5a4a34, 'wood');
      K.pot(1.4, -1.2, 0.5, 1.0); K.pot(-0.3, 1.3, 0.5, 0.9); K.jar(1.3, 1.3, 0.5, 1.0);
      /* doors and windows onto the court, both levels */
      [0, 1, 2, 3].forEach(function (s) {
        if (s > 0) K.door(C, s, s < 2 ? -0.9 : 0.9, 0.5, 1.0, 2.2, { wall: inner, ground: 0.5, jamb: 0.2, leaf: shutC, off: 0 });
        if (s > 0) K.win(C, s, s < 2 ? 1.2 : -1.2, 1.3, 0.8, 1.1, { wall: inner });
        K.door(C, s, s < 2 ? 1.0 : -1.0, gy, 0.9, 2.1, { wall: inner, ground: gy, jamb: 0.18, leaf: shutC });
        K.win(C, s, s < 2 ? -1.1 : 1.1, gy + 0.9, 0.8, 1.2, { wall: inner, shut: shutC });
      });
      /* roof room on the back range with a canopied terrace */
      const RR = { x: -4.0, z: -5.6, w: 5.0, d: 3.6 };
      F.box(RR.x, yR, RR.z, RR.w, 2.7, RR.d, 0, shade(c, 0.06), 'stone');
      F.box(RR.x, yR + 2.7, RR.z, RR.w + 0.3, 0.22, RR.d + 0.3, 0, trim, 'stone');
      K.door(RR, 2, 0, yR, 1.0, 2.2, { wall: c, ground: yR, jamb: 0.2, leaf: shutC });
      K.win(RR, 0, 0, yR + 1.0, 0.9, 1.1, { wall: c, shut: shutC });
      K.win(RR, 1, 0.8, yR + 1.0, 0.8, 1.0, { wall: c });
      K.canopy(2.3, -5.5, yR + 2.5, 7.4, 3.8, F.pick(SAIL), { posts: [[1, 1], [1, -1], [-1, 1], [-1, -1]], base: yR, val: [0, 1] });
      F.box(2.0, yR, -5.5, 2.4, 0.7, 1.0, 0, tim2, 'wood');
      K.rug(4.4, -6.5, yR, 1.6, true); K.jar(5.6, -4.3, yR, 1.0);
      K.ladder(2.7, gy, -2.2, 2.7, yR + 0.8, -2.95, 1, 0);
      K.chimney(-6.4, 6.3, yR, 1.6, c);
      [[6.8, 6.8], [-6.8, -3.2], [6.6, 2.5]].forEach(function (p) { K.pot(p[0], p[1], yR, 1.0); });
      /* front range roof: drying racks, rugs airing on a rail, cistern, pots
         along the court parapet, a pigeon cote */
      K.rack(-4.6, 4.4, yR, 4.0, 1.7, true);
      K.rack(-4.6, 6.4, yR, 4.0, 1.5, true, [0x7a2028, 0x9a6a5a, 0xa08464]);
      K.cistern(5.6, 5.4, yR, 1.0, 1.4, shade(c, -0.1));
      F.rod(3.2, yR + 1.2, 6.9, 3.2, yR + 1.2, 3.6, 0.05, tim, 'wood');
      [3.6, 6.9].forEach(function (pz) { F.rod(3.2, yR, pz, 3.2, yR + 1.2, pz, 0.06, tim, 'wood'); });
      [4.3, 5.5, 6.3].forEach(function (pz, i) { F.box(3.2, yR + 0.3, pz, 0.06, 0.9, 1.0, 0, F.pick(BANNER), 'cloth'); });
      [-2.4, 0, 2.4].forEach(function (px) { K.pot(px, 3.5, yR, 0.8); K.pot(-3.5, px, yR, 0.8); });
      F.box(-6.6, yR, -0.8, 1.2, 1.4, 1.2, 0, tim2, 'wood');
      F.pyrRoof(-6.6, yR + 1.4, -0.8, 1.5, 0.6, 1.5, 0, F.pick(ROOF), 'roof');
      for (let i = 0; i < 3; i++) F.box(-6.0, yR + 0.3 + i * 0.35, -0.8 - 0.35 + i * 0.35, 0.06, 0.2, 0.2, 0, DOOR, 'wood');
    } else if (F.variant === 3) {
      /* -------- canal house: quay plinth with water door and water stair,
         three storeys, a loggia on the top floor, an altana on the roof */
      const Q = { x: 0, z: 0.5, w: 9, d: 13 }, yQ = 1.2;
      const Hs = { x: 0, z: -0.25, w: 8, d: 11.5 }, H = yQ + 3.4 * 3, yR = H + 0.25;
      const qc = shade(c, -0.22);
      F.box(Q.x, 0, Q.z, Q.w, yQ, Q.d, 0, qc, 'stone');
      F.box(Q.x, yQ - 0.15, Q.z, Q.w + 0.2, 0.18, Q.d + 0.2, 0, shade(qc, 0.1), 'stone');
      F.box(Q.x, 0, Q.z, Q.w + 0.06, 0.4, Q.d + 0.06, 0, shade(0x4a5a4a, 0.0), 'stone');
      /* the house: lower two storeys full depth, top storey set back for the loggia */
      F.box(Hs.x, yQ, Hs.z, Hs.w, 6.8, Hs.d, 0, c, 'stone');
      const TopB = { x: 0, z: -1.0, w: 8, d: 10 };
      F.box(TopB.x, yQ + 6.8, TopB.z, TopB.w, 3.4, TopB.d, 0, shade(c, 0.04), 'stone');
      bands(Hs, [yQ + 3.3], trim, 0.2);
      F.box(Hs.x, yQ + 6.7, Hs.z, Hs.w + 0.3, 0.3, Hs.d + 0.3, 0, trim, 'stone');
      F.box(Hs.x, H - 0.1, Hs.z, Hs.w + 0.45, 0.35, Hs.d + 0.45, 0, trim, 'stone');
      /* loggia: columns, arches as dark spandrel openings, balustrade */
      const lz = Hs.z + Hs.d / 2 - 0.25;
      [-3.7, -1.25, 1.25, 3.7].forEach(function (px) {
        F.cyl(px, yQ + 7.0, lz, 0.22, 2.4, 0, MARBLE[0], 'stone');
        F.box(px, yQ + 6.8, lz, 0.5, 0.2, 0.5, 0, trim, 'stone');
        F.box(px, yQ + 9.4, lz, 0.55, 0.3, 0.55, 0, trim, 'stone');
      });
      F.box(0, yQ + 9.7, lz, 8, H - 0.1 - (yQ + 9.7), 0.5, 0, shade(c, 0.04), 'stone');
      [-2.45, 0, 2.45].forEach(function (px) {
        F.box(px, yQ + 9.4, lz, 1.4, 0.3, 0.52, 0, shade(c, 0.04), 'stone');
        F.box(px - 0.95, yQ + 9.1, lz, 0.4, 0.3, 0.52, 0, shade(c, 0.04), 'stone');
        F.box(px + 0.95, yQ + 9.1, lz, 0.4, 0.3, 0.52, 0, shade(c, 0.04), 'stone');
      });
      F.box(0, yQ + 7.0, lz, 7.8, 0.12, 0.3, 0, trim, 'stone');
      for (let i = 0; i < 18; i++) F.cyl(-3.5 + i * 7.0 / 17, yQ + 6.9, lz, 0.07, 0.9, 0, MARBLE[1], 'stone');
      F.box(0, yQ + 7.8, lz, 7.8, 0.12, 0.3, 0, trim, 'stone');
      const TBf = TopB;
      K.door(TBf, 0, 0, yQ + 6.8, 1.1, 2.4, { wall: c, ground: yQ + 6.8, jamb: 0.2, leaf: shutC });
      K.win(TBf, 0, -2.5, yQ + 7.6, 0.9, 1.4, { wall: c, shut: shutC });
      K.win(TBf, 0, 2.5, yQ + 7.6, 0.9, 1.4, { wall: c, shut: shutC });
      F.box(0, yQ + 6.8, lz - 0.6, 7.6, 0.02, 1.4, 0, F.pick(BANNER), 'cloth');
      /* water door and water stair on the canal face */
      K.door(Hs, 0, 0, yQ, 2.6, 3.0, { wall: c, ground: yQ, arch: true, leaf: 0x3a4a3a, jamb: 0.4 });
      F.box(0, 0, 7.8, 3.2, 0.3, 1.6, 0, qc, 'stone');
      K.flight(0, 8.6, 0, 7.0, 0.3, yQ, 3.2, shade(qc, 0.08), { solid: true, base: 0 });
      [[-2.7, 8.4], [2.7, 8.4], [-3.5, 8.0]].forEach(function (p, i) {
        K.mooring(p[0], p[1], 3.4 - i * 0.3, F.pick(LAPIS), 0xe8e1d2);
      });
      K.boat(0.2, 9.9, 0, 5.4, true, shade(BASALT[1], 0.1));
      /* first and second floor: windows with small balconies on the canal face */
      [-2.6, 0, 2.6].forEach(function (u) {
        K.win(Hs, 0, u, yQ + 4.0, 1.0, 1.8, { wall: c, arch: true, shut: shutC });
        F.box(u, yQ + 3.75, Hs.z + Hs.d / 2 + 0.4, 1.7, 0.2, 0.8, 0, trim, 'stone');
        K.rail(u - 0.8, Hs.z + Hs.d / 2 + 0.75, u + 0.8, Hs.z + Hs.d / 2 + 0.75, yQ + 3.95, 0.8, IRON, 0.25);
      });
      [-2.6, 2.6].forEach(function (u) { K.win(Hs, 0, u, yQ + 1.0, 0.9, 1.4, { wall: c, bars: true }); });
      /* flanks: windows, street door with steps, hoist beam */
      [-4.2, -1.4, 1.4, 4.2].forEach(function (u) {
        K.win(Hs, 3, u, yQ + 4.2, 0.9, 1.5, { wall: c, shut: shutC });
        K.win(TBf, 3, u - 0.75, yQ + 7.6, 0.9, 1.4, { wall: c });
        K.win(Hs, 3, u, yQ + 1.0, 0.8, 1.2, { wall: c, bars: u > 0 });
      });
      [-4.2, 1.4, 4.2].forEach(function (u) { K.win(Hs, 2, u, yQ + 4.2, 0.9, 1.5, { wall: c, shut: shutC }); });
      [-4.9, -1.4, 1.2].forEach(function (u) { K.win(TBf, 2, u, yQ + 7.6, 0.9, 1.4, { wall: c }); });
      K.door(Hs, 2, -1.4, yQ, 1.3, 2.5, { wall: c, leaf: shade(tim, 0.05), lamp: true });
      K.win(Hs, 2, 2.2, yQ + 1.0, 0.8, 1.2, { wall: c, bars: true });
      K.fb(Hs, 2, 3.4, yQ + 7.9, 0.3, 0.3, 1.8, 0.9, tim, 'wood');
      const hp = K.at(Hs, 2, 3.4, 1.7);
      F.rod(hp[0], yQ + 5.2, hp[1], hp[0], yQ + 7.9, hp[1], 0.03, ROPE, 'rope');
      F.box(hp[0], yQ + 4.7, hp[1], 0.6, 0.5, 0.6, 0, shade(tim, 0.1), 'wood');
      K.fb(Hs, 2, 3.4, yQ + 6.8, 1.1, 2.0, 0.3, 0, DOOR, 'wood');
      /* back */
      [-2.2, 2.2].forEach(function (u) {
        [yQ + 1.0, yQ + 4.2, yQ + 7.6].forEach(function (y) { K.win(Hs, 1, u, y, 0.9, 1.4, { wall: c, shut: y > 5 ? shutC : false }); });
      });
      F.box(0, yQ, Hs.z - Hs.d / 2 - 0.4, 1.4, H - yQ + 2.2, 0.8, 0, shade(c, -0.08), 'stone');
      F.frustum(0, H + 2.2, Hs.z - Hs.d / 2 - 0.4, 0.35, 0.65, 1.0, 0, dark, 'stone', 8);
      K.drain(Hs, 3, -5.5, yQ, H, c);
      /* roof: parapet, altana on posts, ladder, pots, funnel chimney */
      K.parapet({ x: 0, z: -1.0, w: 8.2, d: 10.2 }, yR, 0.7, 0.28, c, []);
      const ay = yR + 2.1, AX = 0.4, AZ = -2.6, AW = 5.2, AD = 4.2;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        F.box(AX + p[0] * (AW / 2 - 0.15), yR, AZ + p[1] * (AD / 2 - 0.15), 0.22, 2.1, 0.22, 0, tim, 'wood');
        F.beam(AX + p[0] * (AW / 2 - 0.15), yR + 1.1, AZ + p[1] * (AD / 2 - 0.15), AX + p[0] * (AW / 2 - 0.15) * 0.2, ay - 0.2, AZ + p[1] * (AD / 2 - 0.15), 0.1, 0.1, tim, 'wood');
      });
      F.box(AX, ay - 0.2, AZ, AW, 0.2, AD, 0, tim2, 'wood');
      K.rail(AX - AW / 2, AZ - AD / 2, AX + AW / 2, AZ - AD / 2, ay, 1.0, tim, 0.35);
      K.rail(AX - AW / 2, AZ + AD / 2, AX + AW / 2 - 1.0, AZ + AD / 2, ay, 1.0, tim, 0.35);
      K.rail(AX - AW / 2, AZ - AD / 2, AX - AW / 2, AZ + AD / 2, ay, 1.0, tim, 0.35);
      K.rail(AX + AW / 2, AZ - AD / 2, AX + AW / 2, AZ + AD / 2, ay, 1.0, tim, 0.35);
      K.ladder(AX + AW / 2 - 0.5, yR, AZ + AD / 2 + 1.0, AX + AW / 2 - 0.5, ay + 0.9, AZ + AD / 2 - 0.05, 1, 0);
      K.line(AX - AW / 2 + 0.2, ay + 1.6, AZ - AD / 2 + 0.3, AX + AW / 2 - 0.2, ay + 1.6, AZ - AD / 2 + 0.3, 4);
      [-1, 1].forEach(function (k) { F.rod(AX + k * (AW / 2 - 0.2), ay, AZ - AD / 2 + 0.3, AX + k * (AW / 2 - 0.2), ay + 1.65, AZ - AD / 2 + 0.3, 0.05, tim, 'wood'); });
      K.pot(-3.2, 3.3, yR, 1.0); K.pot(3.2, 3.3, yR, 1.0); K.jar(-3.1, 1.8, yR, 0.9);
      K.chimney(-3.1, -5.0, yR, 1.3, c);
      F.frustum(-3.1, yR + 2.05, -5.0, 0.3, 0.6, 0.9, 0, dark, 'stone', 8);
    } else {
      /* -------- corner house: chamfered corner with the entrance, a timber
         balcony wrapping the corner, blind rusticated ground floor, roof
         terrace under a shade sail, roof room */
      const H1 = 3.7, H = 7.4, yR = H + 0.25;
      const low = shade(c, -0.1);
      const A = { x: 0, z: -1.5, w: 11, d: 8 }, Bb = { x: -1.5, z: 4, w: 8, d: 3 };
      const R2 = Math.SQRT2, Q = Math.PI / 4;
      F.box(0.3, 0, 0.3, 11.8, 0.45, 11.8, 0, dark, 'stone');
      F.box(3.2, 0, 3.2, 3.6 * R2, 0.45, 3.6 * R2, Q, dark, 'stone');
      function mass(y, h, col) {
        F.box(A.x, y, A.z, A.w, h, A.d, 0, col, 'stone');
        F.box(Bb.x, y, Bb.z, Bb.w, h, Bb.d, 0, col, 'stone');
        F.box(2.5, y, 2.5, 3 * R2, h, 3 * R2, Q, col, 'stone');
      }
      mass(0, H1, low);
      mass(H1, H - H1, c);
      /* rustication grooves on the ground floor */
      [1.2, 2.4].forEach(function (y) {
        F.box(A.x, y, A.z, A.w + 0.08, 0.1, A.d + 0.08, 0, dark, 'stone');
        F.box(Bb.x, y, Bb.z, Bb.w + 0.08, 0.1, Bb.d + 0.08, 0, dark, 'stone');
        F.box(2.5, y, 2.5, 3 * R2 + 0.08, 0.1, 3 * R2 + 0.08, Q, dark, 'stone');
      });
      [[H1 - 0.1, 0.3, 0.3], [H - 0.1, 0.35, 0.5]].forEach(function (b) {
        F.box(A.x, b[0], A.z, A.w + b[2], b[1], A.d + b[2], 0, trim, 'stone');
        F.box(Bb.x, b[0], Bb.z, Bb.w + b[2], b[1], Bb.d + b[2], 0, trim, 'stone');
        F.box(2.5, b[0], 2.5, 3 * R2 + b[2], b[1], 3 * R2 + b[2], Q, trim, 'stone');
      });
      /* parapet round the outline, incl. the chamfer */
      const pc = shade(c, 0.02), ph = 0.9;
      function pw(x, z, w, d, ry) {
        F.box(x, yR, z, w, ph, d, ry || 0, pc, 'stone');
        F.box(x, yR + ph, z, w + 0.06, 0.12, d + 0.14, ry || 0, trim, 'stone');
      }
      pw(-1.5, 5.36, 8.0, 0.28); pw(5.36, -1.5, 0.28, 8.0);
      pw(0, -5.36, 11, 0.28); pw(-5.36, 0, 0.28, 11);
      pw(3.9, 3.9, 3 * R2 + 0.2, 0.28, Q);
      /* chamfer face helper: t along the face (from front toward right) */
      function dface(t, y, w, h, off, dep, col, fam) {
        const cx = 4 + t * 0.7071 + off * 0.7071, cz = 4 - t * 0.7071 + off * 0.7071;
        F.box(cx, y, cz, w, h, dep, Q, col, fam || 'stone');
      }
      /* corner entrance */
      dface(0, 0.45, 1.5, 2.6, 0, 0.3, DOOR, 'wood');
      dface(0, 0.45, 1.38, 2.54, 0.12, 0.1, shade(tim, 0.05), 'wood');
      [-1, 1].forEach(function (k) { dface(k * 1.0, 0.45, 0.4, 2.6, 0.18, 0.4, trim); });
      dface(0, 3.05, 2.5, 0.4, 0.25, 0.55, shade(trim, -0.06));
      dface(0, 0, 2.8, 0.45, 0.45, 0.9, shade(dark, 0.06));
      dface(0, 0, 3.4, 0.22, 0.9, 1.7, shade(dark, 0.1));
      F.rod(4 + 1.6 * 0.7071, 3.0, 4 - 1.6 * 0.7071, 4 + 1.6 * 0.7071 + 0.45, 3.0, 4 - 1.6 * 0.7071 + 0.45, 0.05, IRON, 'metal');
      F.ball(4 + 1.6 * 0.7071 + 0.42, 2.72, 4 - 1.6 * 0.7071 + 0.42, 0.2, GLOW, 'glow');
      /* blind ground floor: high barred windows, a plaque */
      [[0, -3.9], [0, -0.5], [2, -4.2], [2, -0.8], [1, -3], [1, 3], [3, -3], [3, 0.5]].forEach(function (w) {
        const B = w[0] === 0 ? Bb : A;
        const u = w[0] === 0 ? w[1] + 1.5 : (w[0] === 2 ? w[1] + 1.5 : w[1] + (w[0] === 3 ? 1.5 : 0));
        K.win(B, w[0], u, 2.0, 0.8, 0.9, { wall: low, bars: true });
      });
      K.door(A, 1, 0, 0.45, 1.2, 2.4, { wall: low, leaf: tim });
      /* upper floor windows and balcony doors */
      [-3.5, -1.0].forEach(function (u) { K.door(Bb, 0, u, H1 + 0.2, 1.0, 2.4, { wall: c, ground: H1 + 0.2, jamb: 0.2, leaf: shutC }); });
      [-1.5, 1.0].forEach(function (u) { K.door(A, 2, u, H1 + 0.2, 1.0, 2.4, { wall: c, ground: H1 + 0.2, jamb: 0.2, leaf: shutC }); });
      dface(0, H1 + 0.2, 1.2, 2.5, 0, 0.3, DOOR, 'wood');
      dface(0, H1 + 0.2, 1.1, 2.45, 0.1, 0.1, shutC, 'wood');
      [-1, 1].forEach(function (k) { dface(k * 0.8, H1 + 0.2, 0.3, 2.5, 0.12, 0.34, trim); });
      dface(0, H1 + 2.7, 1.9, 0.3, 0.15, 0.4, trim);
      [-4.8, -2.2, 0.3, 2.9].forEach(function (u) { K.win(A, 1, u, H1 + 0.9, 1.0, 1.6, { wall: c, shut: shutC }); });
      [-3.5, -0.8, 1.8].forEach(function (u) { K.win(A, 3, u, H1 + 0.9, 1.0, 1.6, { wall: c, shut: shutC }); });
      K.win(Bb, 3, 0, H1 + 0.9, 1.0, 1.6, { wall: c, shut: shutC });
      K.win(A, 2, -3.8, H1 + 0.9, 1.0, 1.6, { wall: c, shut: shutC });
      /* timber balcony wrapping the corner on brackets */
      const by = H1 + 0.05, bd = 1.1;
      F.box(-1.25, by, 5.5 + bd / 2, 8.5, 0.2, bd, 0, tim2, 'wood');
      F.box(5.5 + bd / 2, by, -1.25, bd, 0.2, 8.5, 0, tim2, 'wood');
      const dm = (8 + 9.556) / 4;
      F.box(dm, by, dm, 4.7, 0.2, bd, Q, tim2, 'wood');
      [-4.5, -2.2, 0.1, 2.3].forEach(function (px) { F.beam(px, by - 0.9, 5.52, px, by, 5.5 + bd - 0.1, 0.18, 0.18, tim, 'wood'); });
      [-4.5, -2.2, 0.1, 2.3].forEach(function (pz) { F.beam(5.52, by - 0.9, pz, 5.5 + bd - 0.1, by, pz, 0.18, 0.18, tim, 'wood'); });
      K.rail(-5.5, 5.5 + bd - 0.05, 2.95, 5.5 + bd - 0.05, by + 0.2, 1.0, tim, 0.28);
      K.rail(5.5 + bd - 0.05, -5.5, 5.5 + bd - 0.05, 2.95, by + 0.2, 1.0, tim, 0.28);
      K.rail(-5.5, 5.5, -5.5, 5.5 + bd - 0.05, by + 0.2, 1.0, tim, 0.28);
      K.rail(5.5, -5.5, 5.5 + bd - 0.05, -5.5, by + 0.2, 1.0, tim, 0.28);
      const ox = dm + 0.5 * 0.7071, oz = dm + 0.5 * 0.7071;
      F.box(ox, by + 1.12, oz, 4.4, 0.1, 0.1, Q, tim, 'wood');
      for (let i = -3; i <= 3; i++) F.box(ox + i * 0.62 * 0.7071, by + 0.2, oz - i * 0.62 * 0.7071, 0.08, 0.95, 0.08, 0, tim, 'wood');
      /* cloth hood over the balcony along the front */
      K.awning(Bb, 0, -2.2, H - 0.6, 5.6, 1.1, 0.5, F.pick(SAIL), { bay: 2.8 });
      /* roof room, terrace, shade sail on four masts */
      const RR = { x: -3.3, z: -3.6, w: 4.0, d: 3.2 };
      F.box(RR.x, yR, RR.z, RR.w, 2.6, RR.d, 0, shade(c, 0.06), 'stone');
      F.box(RR.x, yR + 2.6, RR.z, RR.w + 0.3, 0.2, RR.d + 0.3, 0, trim, 'stone');
      K.door(RR, 0, 0.8, yR, 1.0, 2.2, { wall: c, ground: yR, jamb: 0.2, leaf: shutC });
      K.win(RR, 0, -1.0, yR + 1.0, 0.7, 0.9, { wall: c });
      K.win(RR, 2, 0, yR + 1.0, 0.7, 0.9, { wall: c, shut: shutC });
      K.chimney(-4.8, -2.4, yR, 3.4, c);
      const masts = [[-4.8, 4.8, 3.3], [4.8, -0.8, 3.0], [2.6, 4.8, 2.6], [-0.4, -1.4, 2.6]];
      masts.forEach(function (m) {
        F.rod(m[0], yR, m[1], m[0], yR + m[2], m[1], 0.08, tim, 'wood');
        F.ball(m[0], yR + m[2], m[1], 0.1, IRON, 'metal');
      });
      const sy = yR + 2.55, sail = F.pick(SAIL);
      F.box(0.5, sy, 1.9, 7.4, 0.05, 4.4, 0.28, sail, 'cloth');
      [[-3.1, 3.6], [3.8, 0.3], [2.5, 4.0], [-2.0, -0.4]].forEach(function (p, i) {
        F.rod(p[0], sy, p[1], masts[i][0], yR + masts[i][2] - 0.1, masts[i][1], 0.03, ROPE, 'rope');
      });
      F.box(1.2, yR, 2.0, 2.0, 0.75, 1.1, 0, tim2, 'wood');
      F.box(1.2, yR, 0.9, 1.8, 0.45, 0.45, 0, tim, 'wood');
      F.box(-2.4, yR, 2.2, 2.4, 0.03, 1.6, 0, F.pick(BANNER), 'cloth');
      [[-4.8, 0.4], [3.3, 3.3], [4.7, -4.6], [0.8, 4.7]].forEach(function (p) { K.pot(p[0], p[1], yR, 1.1); });
      K.rack(3.2, -3.6, yR, 3.0, 1.5, true);
      K.drain(A, 1, 5.2, 0.45, H, c);
      K.drain(A, 3, -3.9, 0.45, H, c);
      F.box(-4.3, 0, 5.75, 2.0, 0.45, 0.5, 0, trim, 'stone');
    }
  }

  ASSET({
    key: 'voth_house_middle', name: 'Middle-Class House', culture: 'voth', family: 'housing', source: 'voth-housing',
    districts: ['common', 'core'], wealth: [0.3, 0.7],
    blurb: 'Middle-class Voth houses: a Hlaalu block with a copper-roofed loft, a Velothi tower-house with pergola wing, a gallery courtyard house, a canal house with water door and altana, and a chamfered corner house under a shade sail.',
    w: 17.9, d: 17.7, h: 17.6, variants: 5,
    variantDims: [
      { w: 14.8, d: 12.8, h: 13.2 },
      { w: 14.6, d: 11.7, h: 17.6 },
      { w: 17.9, d: 17.7, h: 10.1 },
      { w: 10.7, d: 17.7, h: 15.4 },
      { w: 13.3, d: 13.3, h: 11.8 }
    ],
    build: function (F) { middle(F, kit(F)); }
  });
  /* ================================================================ RICH */
  function rich(F, K) {
    const c = shade(F.pick(STONE), 0.06), trim = shade(c, -0.14), dark = shade(c, -0.3);
    const marble = F.pick(MARBLE), jade = F.pick(JADE), lapis = F.pick(LAPIS), porph = F.pick(PORPH);
    const tim = F.pick(TIMBERS), tim2 = shade(tim, 0.15), shutC = F.pick(SHUT);
    const cop = shade(COPPER, F.rr(-0.04, 0.04));
    function statue(x, z, y, col) {
      F.box(x, y, z, 1.0, 1.1, 1.0, 0, shade(col, -0.2), 'stone');
      F.box(x, y + 1.1, z, 1.15, 0.15, 1.15, 0, shade(col, -0.3), 'stone');
      F.box(x, y + 1.25, z, 0.7, 0.12, 0.5, 0, col, 'stone');
      [-0.14, 0.14].forEach(function (k) { F.cyl(x + k, y + 1.37, z, 0.11, 0.8, 0, col, 'stone'); });
      F.blob(x, y + 2.55, z, 0.3, 0.9, 0, col, 'stone');
      F.cyl(x, y + 2.1, z, 0.3, 0.5, 0, shade(col, -0.05), 'stone');
      F.ball(x, y + 3.1, z, 0.16, col, 'stone');
      F.rod(x - 0.28, y + 2.85, z, x - 0.55, y + 3.4, z + 0.1, 0.07, col, 'stone');
      F.rod(x + 0.28, y + 2.85, z, x + 0.4, y + 2.2, z + 0.15, 0.07, col, 'stone');
      F.rod(x - 0.55, y + 2.2, z + 0.1, x - 0.55, y + 3.9, z + 0.1, 0.035, GOLD, 'metal');
    }
    /* row of small tiles along a band on all four faces of a block */
    function mosaic(B, y, cols, step) {
      for (let s = 0; s < 4; s++) {
        const L = s < 2 ? B.w : B.d, n = Math.floor(L / step);
        for (let i = 0; i < n; i++) {
          K.fb(B, s, -L / 2 + (i + 0.5) * L / n, y, 0.22, 0.22, 0.06, 0.08, cols[i % cols.length], 'stone');
        }
      }
    }

    if (F.variant === 0) {
      /* -------- Hlaalu mansion: three-storey centre with a top-floor loggia,
         forward wings with oriels, a columned ground loggia with terrace
         over it, green copper hip roofs with wide flared eaves */
      const yP = 0.6;
      const C = { x: 0, z: -1.5, w: 12, d: 9 }, Ct = { x: 0, z: -2.3, w: 12, d: 7.4 };
      const Lw = { x: -9, z: 0.5, w: 6, d: 10 }, Rw = { x: 9, z: 0.5, w: 6, d: 10 };
      F.box(0, 0, -0.5, 25.2, yP, 13.2, 0, dark, 'stone');
      F.box(0, yP - 0.12, -0.5, 25.4, 0.12, 13.4, 0, shade(dark, 0.1), 'stone');
      K.flight(0, 7.4, 0, 6.1, 0, yP, 6.0, shade(dark, 0.08), { solid: true, base: 0 });
      F.box(C.x, 0, C.z, C.w, 7.6, C.d, 0, c, 'stone');
      F.box(Ct.x, 7.6, Ct.z, Ct.w, 3.5, Ct.d, 0, shade(c, 0.03), 'stone');
      [Lw, Rw].forEach(function (W) { F.box(W.x, 0, W.z, W.w, 7.6, W.d, 0, c, 'stone'); });
      /* jade string course at the first floor and a trim course at the second */
      [C, Lw, Rw].forEach(function (B) {
        F.box(B.x, 4.0, B.z, B.w + 0.2, 0.3, B.d + 0.2, 0, jade, 'stone');
        F.box(B.x, 0.6, B.z, B.w + 0.14, 0.4, B.d + 0.14, 0, trim, 'stone');
      });
      F.box(C.x, 7.45, C.z, C.w + 0.2, 0.3, C.d + 0.2, 0, trim, 'stone');
      [Lw, Rw].forEach(function (W) { F.box(W.x, 7.35, W.z, W.w + 0.2, 0.3, W.d + 0.2, 0, trim, 'stone'); });
      /* ground loggia between the wings, terrace on it */
      F.box(0, 4.0, 4.25, 12, 0.4, 2.5, 0, trim, 'stone');
      for (let i = 0; i < 6; i++) {
        const px = -5.4 + i * 2.16;
        F.box(px, yP, 5.1, 0.7, 0.3, 0.7, 0, trim, 'stone');
        F.cyl(px, yP + 0.3, 5.1, 0.26, 2.8, 0, marble, 'stone');
        F.box(px, 3.7, 5.1, 0.7, 0.3, 0.7, 0, trim, 'stone');
      }
      F.box(0, 4.4, 5.35, 12, 0.14, 0.3, 0, jade, 'stone');
      for (let i = 0; i < 30; i++) F.cyl(-5.8 + i * 11.6 / 29, 4.54, 5.35, 0.08, 0.7, 0, marble, 'stone');
      F.box(0, 5.24, 5.35, 12, 0.14, 0.34, 0, trim, 'stone');
      /* centre: door, windows, terrace doors, top loggia */
      K.door(C, 0, 0, yP, 2.0, 3.0, { wall: c, arch: true, leaf: shade(tim, 0.05), ground: yP, jamb: 0.4 });
      [-3.6, 3.6].forEach(function (u) { K.win(C, 0, u, 1.5, 1.1, 1.9, { wall: c, arch: true, bars: true }); });
      [-3.6, 0, 3.6].forEach(function (u) { K.door(C, 0, u, 4.4, 1.2, 2.6, { wall: c, ground: 4.4, arch: true, jamb: 0.26, leaf: shutC }); });
      const lz = C.z + C.d / 2 - 0.3;
      for (let i = 0; i < 6; i++) {
        const px = -5.6 + i * 11.2 / 5;
        F.cyl(px, 7.9, lz, 0.22, 2.7, 0, marble, 'stone');
        F.box(px, 10.5, lz, 0.55, 0.3, 0.55, 0, trim, 'stone');
      }
      F.box(0, 7.6, lz, 12, 0.3, 0.6, 0, trim, 'stone');
      F.box(0, 10.8, lz, 12.2, 0.3, 0.7, 0, trim, 'stone');
      K.rail(-5.8, lz + 0.05, 5.8, lz + 0.05, 7.9, 0.9, jade, 0.3);
      [-3.4, 0, 3.4].forEach(function (u) { K.door(Ct, 0, u, 7.6, 1.1, 2.4, { wall: c, ground: 7.6, jamb: 0.2, leaf: shutC }); });
      F.box(0, 7.62, lz - 0.7, 10, 0.02, 1.2, 0, F.pick(BANNER), 'cloth');
      /* centre back and flanks above the wings */
      [-4, -1.3, 1.3, 4].forEach(function (u) {
        K.win(C, 1, u, 1.6, 1.1, 1.8, { wall: c, arch: true, shut: shutC });
        K.win(C, 1, u, 4.9, 1.1, 1.8, { wall: c, arch: true, shut: shutC });
        K.win(Ct, 1, u, 8.3, 1.0, 1.6, { wall: c, shut: shutC });
      });
      [-2.3, 0.3].forEach(function (u) {
        K.win(Ct, 2, u, 8.3, 1.0, 1.6, { wall: c, shut: shutC });
        K.win(Ct, 3, u, 8.3, 1.0, 1.6, { wall: c, shut: shutC });
      });
      F.box(0, 4.3, C.z - C.d / 2 - 0.6, 4.2, 0.25, 1.2, 0, trim, 'stone');
      [-1.6, 1.6].forEach(function (px) { F.beam(px, 3.2, C.z - C.d / 2 - 0.05, px, 4.3, C.z - C.d / 2 - 1.0, 0.28, 0.28, trim, 'stone'); });
      K.rail(-2.1, C.z - C.d / 2 - 1.15, 2.1, C.z - C.d / 2 - 1.15, 4.55, 0.9, IRON, 0.25);
      /* wings: oriels on the fronts, windows all round */
      [Lw, Rw].forEach(function (W, wi) {
        const fz = W.z + W.d / 2;
        [-1.7, 1.7].forEach(function (u) { K.win(W, 0, u, 1.5, 1.1, 1.9, { wall: c, arch: true, shut: shutC }); });
        F.box(W.x, 4.5, fz + 0.5, 3.2, 2.4, 1.0, 0, shade(c, 0.04), 'stone');
        F.box(W.x, 4.3, fz + 0.5, 3.4, 0.2, 1.2, 0, trim, 'stone');
        F.box(W.x, 6.9, fz + 0.5, 3.5, 0.22, 1.25, 0, trim, 'stone');
        F.pyrRoof(W.x, 7.1, fz, 3.6, 0.8, 2.6, 0, cop, 'roof');
        [-1.2, 1.2].forEach(function (k) { F.beam(W.x + k, 3.3, fz + 0.05, W.x + k, 4.3, fz + 0.9, 0.28, 0.28, trim, 'stone'); });
        [-0.95, 0, 0.95].forEach(function (k) { F.box(W.x + k, 5.0, fz + 1.02, 0.7, 1.5, 0.08, 0, DOOR, 'wood'); });
        [-1, 1].forEach(function (k) { F.box(W.x + k * 1.62, 5.0, fz + 0.5, 0.06, 1.5, 0.6, 0, DOOR, 'wood'); });
        const os = wi === 0 ? 3 : 2;
        [-3, 0, 3].forEach(function (u) {
          if (!(wi === 0 && u === 0)) {
            K.win(W, os, u, 1.5, 1.1, 1.9, { wall: c, arch: true, shut: shutC });
            K.win(W, os, u, 4.9, 1.1, 1.8, { wall: c, arch: true, shut: shutC });
          }
        });
        [-1.5, 1.5].forEach(function (u) {
          K.win(W, 1, u, 1.5, 1.0, 1.7, { wall: c, bars: true });
          K.win(W, 1, u, 4.9, 1.0, 1.7, { wall: c, shut: shutC });
        });
        K.win(W, wi === 0 ? 2 : 3, 3.9, 1.5, 0.8, 1.5, { wall: c, arch: true });
        K.hip(W.x, W.z, 7.6 + 0.28, 8.2, 12.2, 2.8, cop, { flare: 0.72, finC: shade(cop, -0.2) });
        K.brackets(W, 7.6 + 0.28, 1.0, 4, tim);
      });
      K.door(Rw, 2, 3.0, yP, 1.3, 2.6, { wall: c, ground: yP, leaf: tim, lamp: true });
      /* left wing chimney breast */
      F.box(-12.4, yP, 0.5, 0.8, 10.0, 1.4, 0, shade(c, -0.06), 'stone');
      F.box(-12.4, yP + 10.0, 0.5, 1.1, 0.35, 1.7, 0, trim, 'stone');
      F.cyl(-12.4, yP + 10.35, 0.2, 0.2, 0.6, 0, dark, 'stone'); F.cyl(-12.4, yP + 10.35, 0.8, 0.2, 0.6, 0, dark, 'stone');
      /* centre roof */
      K.hip(0, -1.5, 11.1 + 0.28, 14.6, 11.6, 3.9, cop, { flare: 0.72, finC: shade(cop, -0.2) });
      K.brackets(Ct, 11.1 + 0.28, 1.1, 4, tim);
      K.chimney(-4.2, -4.8, 12.2, 2.2, c);
      K.chimney(4.2, -4.8, 12.2, 2.2, c);
      K.drain(C, 1, 5.7, yP, 7.6, c);
      /* forecourt: lamps, potted citrus, benches */
      [-4, 4].forEach(function (px) {
        F.cyl(px, yP, 5.9, 0.12, 2.6, 0, IRON, 'metal');
        F.ball(px, yP + 2.8, 5.9, 0.26, GLOW, 'glow');
      });
      [-11.6, 11.6].forEach(function (px) { K.pot(px, 5.7, yP, 1.3); });
      [-3.3, 3.3].forEach(function (px) { F.box(px, yP, 3.4, 1.8, 0.45, 0.5, 0, marble, 'stone'); });
    } else if (F.variant === 1) {
      /* -------- Mournhold house: square two-storey block with mosaic bands,
         corner turrets with blue caps, a portal frame with a calligraphy
         band and statues, a tiled drum with a ribbed, ringed dome */
      const yP = 0.8, H = 8.8, S = 7;
      const Bk = { x: 0, z: 0, w: 14, d: 14 };
      const tile = [GOLD, marble, jade, porph];
      F.box(0, 0, 0, 15.4, yP, 15.4, 0, dark, 'stone');
      F.box(0, yP - 0.12, 0, 15.6, 0.12, 15.6, 0, shade(dark, 0.1), 'stone');
      F.box(0, 0, 0, 14, H, 14, 0, c, 'stone');
      [4.6, 8.0].forEach(function (y) {
        F.box(0, y, 0, 14.12, 0.42, 14.12, 0, lapis, 'stone');
        mosaic(Bk, y + 0.1, tile, 0.7);
      });
      F.box(0, H - 0.1, 0, 14.6, 0.35, 14.6, 0, trim, 'stone');
      const yR = H + 0.25;
      K.parapet({ x: 0, z: 0, w: 14.4, d: 14.4 }, yR, 0.55, 0.3, c, []);
      for (let s = 0; s < 4; s++) for (let i = 0; i < 12; i++) {
        const p = K.at({ x: 0, z: 0, w: 14.4, d: 14.4 }, s, -6.2 + i * 12.4 / 11, -0.15);
        F.blob(p[0], yR + 0.72, p[1], 0.26, 0.5, 0, trim, 'stone');
      }
      /* corner turrets */
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
        const tx = q[0] * S, tz = q[1] * S;
        F.cyl(tx, 0, tz, 1.5, 0.8, 0, dark, 'stone');
        F.cyl(tx, 0, tz, 1.3, 10.8, 0, shade(c, 0.03), 'stone');
        [4.6, 8.0].forEach(function (y) { F.cyl(tx, y, tz, 1.38, 0.42, 0, lapis, 'stone'); });
        F.cyl(tx, 10.6, tz, 1.45, 0.3, 0, trim, 'stone');
        K.dome(tx, tz, 10.9, 1.45, 1.7, lapis, { ribs: 6, ribR: 0.05, ribC: GOLD });
        F.cyl(tx, 12.5, tz, 0.06, 0.8, 0, GOLD, 'metal');
        F.ball(tx, 13.35, tz, 0.14, GOLD, 'metal');
        const a = Math.atan2(q[0], q[1]);
        [2.2, 6.0, 9.2].forEach(function (y) {
          F.box(tx + Math.sin(a) * 1.28, y, tz + Math.cos(a) * 1.28, 0.3, 1.1, 0.2, a, DOOR, 'wood');
        });
      });
      /* drum, dome, lantern */
      F.cyl(0, yR, 0, 4.8, 0.5, 0, trim, 'stone');
      F.cyl(0, yR + 0.5, 0, 4.3, 3.2, 0, shade(c, 0.04), 'stone');
      for (let i = 0; i < 12; i++) {
        const a = (i + 0.5) / 12 * TAU, b = i / 12 * TAU;
        const wx = Math.sin(a) * 4.3, wz = Math.cos(a) * 4.3;
        F.box(wx, yR + 1.2, wz, 0.8, 1.6, 0.2, a, DOOR, 'wood');
        F.box(wx * 0.998, yR + 2.8, wz * 0.998, 0.45, 0.3, 0.2, a, DOOR, 'wood');
        F.box(Math.sin(b) * 4.35, yR + 0.5, Math.cos(b) * 4.35, 0.4, 3.2, 0.2, b, trim, 'stone');
      }
      F.cyl(0, yR + 3.7, 0, 4.45, 0.45, 0, lapis, 'stone');
      const dy = yR + 4.15;
      K.dome(0, 0, dy, 4.5, 4.4, shade(lapis, 0.12), { ribs: 16, ribR: 0.07, ribC: GOLD, ring: trim });
      [0.35, 0.68].forEach(function (t) {
        const ph = Math.asin(t);
        F.cyl(0, dy + 4.4 * t - 0.06, 0, 4.5 * Math.cos(ph) + 0.05, 0.12, 0, GOLD, 'metal');
      });
      F.cyl(0, dy + 4.2, 0, 1.05, 1.3, 0, marble, 'stone');
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; F.box(Math.sin(a) * 1.03, dy + 4.5, Math.cos(a) * 1.03, 0.3, 0.7, 0.1, a, DOOR, 'wood'); }
      F.dome(0, dy + 5.5, 0, 1.05, 0.9, 0, GOLD, 'metal');
      F.cyl(0, dy + 6.3, 0, 0.07, 1.0, 0, GOLD, 'metal');
      F.ball(0, dy + 7.35, 0, 0.18, GOLD, 'metal');
      /* front portal (pishtaq) with calligraphy band */
      const pz = S + 0.45;
      F.box(0, 0, pz, 5.8, 10.4, 0.9, 0, marble, 'stone');
      F.box(0, 10.4, pz, 6.1, 0.3, 1.1, 0, trim, 'stone');
      for (let i = 0; i < 5; i++) F.pyrRoof(-2.4 + i * 1.2, 10.7, pz, 0.6, 0.6, 0.6, 0, lapis, 'stone');
      F.box(0, yP, pz + 0.47, 3.2, 5.8, 0.06, 0, DOOR, 'wood');
      F.box(0, yP + 5.8, pz + 0.47, 2.2, 0.8, 0.06, 0, DOOR, 'wood');
      F.box(0, yP + 6.6, pz + 0.47, 1.0, 0.6, 0.06, 0, DOOR, 'wood');
      F.box(0, yP, pz + 0.5, 2.0, 3.3, 0.1, 0, shade(tim, 0.02), 'wood');
      F.box(0, yP + 3.3, pz + 0.52, 2.4, 0.3, 0.12, 0, GOLD, 'metal');
      [-1, 1].forEach(function (k) {
        F.box(k * 2.1, yP, pz + 0.48, 0.5, 7.9, 0.08, 0, BASALT[0], 'stone');
        for (let i = 0; i < 9; i++) F.box(k * 2.1, yP + 0.4 + i * 0.85, pz + 0.53, 0.26, i % 2 ? 0.14 : 0.3, 0.04, 0, GOLD, 'metal');
      });
      F.box(0, yP + 7.9, pz + 0.48, 4.7, 0.55, 0.08, 0, BASALT[0], 'stone');
      for (let i = 0; i < 11; i++) F.box(-2.0 + i * 0.4, yP + 8.02, pz + 0.53, i % 3 ? 0.18 : 0.3, 0.3, 0.04, 0, GOLD, 'metal');
      [-1, 1].forEach(function (k) { F.ball(k * 1.9, yP + 3.0, pz + 0.75, 0.22, GLOW, 'glow'); F.rod(k * 1.9, yP + 3.2, pz + 0.45, k * 1.9, yP + 3.2, pz + 0.75, 0.05, IRON, 'metal'); });
      K.flight(0, 9.9, 0, S + 0.9, 0, yP, 5.0, shade(marble, -0.08), { solid: true, base: 0 });
      [-3.8, 3.8].forEach(function (px) { statue(px, 8.9, 0, F.pick(MARBLE)); });
      /* windows: arched below with jade grilles, paired above with balconettes */
      for (let s = 0; s < 4; s++) {
        const us = s === 0 ? [-4.6] : [-4.6, 0];
        us.concat([4.6]).forEach(function (u) {
          if (s === 1 && u === 0) return;
          K.win(Bk, s, u, 1.8, 1.1, 2.0, { wall: c, arch: true, bars: true, trim: marble });
        });
        [-4.6, 4.6].concat(s === 0 ? [] : [0]).forEach(function (u) {
          [-0.65, 0.65].forEach(function (k) { K.win(Bk, s, u + k, 5.6, 0.8, 1.8, { wall: c, arch: true, trim: marble }); });
          K.fb(Bk, s, u, 5.35, 2.6, 0.18, 0.7, 0.35, trim, 'stone');
          const a = K.at(Bk, s, u - 1.25, 0.66), b = K.at(Bk, s, u + 1.25, 0.66);
          F.rod(a[0], 6.2, a[1], b[0], 6.2, b[1], 0.04, IRON, 'metal');
          for (let i = 0; i <= 6; i++) { const t = i / 6; F.rod(a[0] + (b[0] - a[0]) * t, 5.53, a[1] + (b[1] - a[1]) * t, a[0] + (b[0] - a[0]) * t, 6.2, a[1] + (b[1] - a[1]) * t, 0.03, IRON, 'metal'); }
        });
      }
      K.door(Bk, 1, 0, yP, 1.6, 2.8, { wall: c, arch: true, ground: 0, leaf: shade(tim, 0.05), trim: marble });
      /* roof terrace: pots, benches, a small awning */
      [[-5.4, -3.2], [5.4, -3.2], [-5.4, 3.2], [5.4, 3.2]].forEach(function (p) { K.pot(p[0], p[1], yR, 1.2); });
      F.box(0, yR, -5.6, 3.0, 0.45, 0.6, 0, marble, 'stone');
      K.tent(0, 5.4, yR + 2.3, 4.0, 2.2, 0.5, F.pick(SAIL), { base: yR });
      F.box(0, yR, 5.4, 1.6, 0.03, 1.2, 0, F.pick(BANNER), 'cloth');
    } else if (F.variant === 2) {
      /* -------- pagoda tower-house: four-storey tower with flared pent roofs
         at each floor, a gallery under the wide cap, a lantern and a second
         cap; a two-storey hall wing with its own flared hip and a porch */
      const yP = 0.6, roofC = F.pick([cop, cop, F.pick(ROOF)]);
      const T = { x: -3.5, z: -0.5, w: 8, d: 8 }, Wg = { x: 4.5, z: 0.5, w: 8, d: 10 };
      F.box(1.0, 0, 0, 19, yP, 12.4, 0, dark, 'stone');
      F.box(1.0, yP - 0.12, 0, 19.2, 0.12, 12.6, 0, shade(dark, 0.1), 'stone');
      F.box(T.x, 0, T.z, T.w, 14.2, T.d, 0, c, 'stone');
      F.box(Wg.x, 0, Wg.z, Wg.w, 7.4, Wg.d, 0, shade(c, -0.03), 'stone');
      /* corner piers on the tower */
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
        F.box(T.x + q[0] * 3.85, 0, T.z + q[1] * 3.85, 0.6, 14.2, 0.6, 0, trim, 'stone');
      });
      /* flared pent roofs at the 2nd and 3rd floors */
      [4.0, 7.4].forEach(function (y) {
        F.pyrRoof(T.x, y, T.z, 10.6, 2.45, 10.6, 0, roofC, 'roof');
        F.pyrRoof(T.x, y + 0.33, T.z, 9.3, 5.3, 9.3, 0, shade(roofC, 0.05), 'roof');
        F.box(T.x, y - 0.22, T.z, 10.6, 0.22, 10.6, 0, shade(roofC, -0.3), 'wood');
        K.brackets(T, y, 1.2, 3, tim);
      });
      /* top storey gallery */
      F.box(T.x, 10.6, T.z, 10.4, 0.2, 10.4, 0, tim2, 'wood');
      K.rail(T.x - 5.1, T.z - 5.1, T.x + 5.1, T.z - 5.1, 10.8, 1.0, tim, 0.4);
      K.rail(T.x - 5.1, T.z + 5.1, T.x + 5.1, T.z + 5.1, 10.8, 1.0, tim, 0.4);
      K.rail(T.x - 5.1, T.z - 5.1, T.x - 5.1, T.z + 5.1, 10.8, 1.0, tim, 0.4);
      K.rail(T.x + 5.1, T.z - 5.1, T.x + 5.1, T.z + 5.1, 10.8, 1.0, tim, 0.4);
      K.brackets(T, 10.6, 1.1, 3, tim);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
        F.box(T.x + q[0] * 5.0, 10.8, T.z + q[1] * 5.0, 0.22, 3.4, 0.22, 0, tim, 'wood');
      });
      /* cap, lantern, second cap */
      K.hip(T.x, T.z, 14.2 + 0.28, 12.4, 12.4, 5.5, roofC, { flare: 0.62, finial: false });
      K.brackets({ x: T.x, z: T.z, w: 10.0, d: 10.0 }, 14.2 + 0.28, 1.1, 3, tim);
      const Ln = { x: T.x, z: T.z, w: 3.2, d: 3.2 };
      F.box(T.x, 17.2, T.z, 3.2, 2.4, 3.2, 0, shade(c, 0.05), 'stone');
      for (let s = 0; s < 4; s++) K.win(Ln, s, 0, 18.0, 0.7, 1.1, { wall: c, arch: true, sill: false });
      K.hip(T.x, T.z, 19.6 + 0.28, 5.2, 5.2, 2.8, shade(roofC, 0.05), { flare: 0.6, finC: GOLD });
      F.cyl(T.x, 22.6, T.z, 0.05, 0.9, 0, GOLD, 'metal');
      /* tower openings */
      [0.6, 4.0, 7.4].forEach(function (y0, fl) {
        for (let s = 0; s < 4; s++) {
          [-1.8, 1.8].forEach(function (u) {
            if (s === 2 && y0 < 7) return;
            if (s === 0 && fl === 0) return;
            K.win(T, s, u, y0 + (fl === 0 ? 1.2 : 1.0), 0.9, 1.6, { wall: c, arch: true, shut: fl === 1 ? shutC : false, bars: fl === 0 });
          });
        }
      });
      for (let s = 0; s < 4; s++) {
        K.door(T, s, 0, 10.8, 1.1, 2.3, { wall: c, ground: 10.8, arch: true, jamb: 0.22, leaf: shutC });
        [-2.4, 2.4].forEach(function (u) { K.win(T, s, u, 11.7, 0.8, 1.3, { wall: c, arch: true }); });
      }
      K.door(T, 0, 0, yP, 1.4, 2.7, { wall: c, ground: yP, arch: true, lamp: true, leaf: shade(tim, 0.05) });
      /* hall wing */
      F.box(Wg.x, 3.9, Wg.z, Wg.w + 0.2, 0.3, Wg.d + 0.2, 0, trim, 'stone');
      F.box(Wg.x, 0.6, Wg.z, Wg.w + 0.14, 0.4, Wg.d + 0.14, 0, trim, 'stone');
      K.hip(Wg.x, Wg.z, 7.4 + 0.28, 10.2, 12.2, 3.8, roofC, { flare: 0.65, finC: GOLD });
      K.brackets(Wg, 7.4 + 0.28, 1.0, 4, tim);
      K.door(Wg, 0, 0, yP, 1.6, 2.8, { wall: c, ground: yP, arch: true, leaf: shutC });
      K.flight(4.5, 8.0, 4.5, 6.2, 0, yP, 3.0, shade(dark, 0.08), { solid: true, base: 0 });
      K.hip(4.5, 6.35, 3.6 + 0.28, 3.8, 2.7, 1.2, roofC, { flare: 0.6, finC: GOLD });
      [-1.6, 1.6].forEach(function (k) { F.rod(4.5 + k, 0, 7.5, 4.5 + k, 3.62, 7.5, 0.12, tim, 'wood'); });
      F.box(4.5, 3.4, 7.5, 3.6, 0.2, 0.2, 0, tim, 'wood');
      [-2.6, 2.6].forEach(function (u) {
        K.win(Wg, 0, u, 1.6, 1.0, 1.8, { wall: c, arch: true, shut: shutC });
        K.win(Wg, 0, u, 4.8, 1.0, 1.7, { wall: c, arch: true, shut: shutC });
      });
      K.win(Wg, 0, 0, 4.8, 1.2, 1.7, { wall: c, arch: true, screen: true });
      [-3, 0, 3].forEach(function (u) {
        K.win(Wg, 2, u, 1.6, 1.0, 1.8, { wall: c, arch: true, bars: true });
        K.win(Wg, 2, u, 4.8, 1.0, 1.7, { wall: c, arch: true, shut: shutC });
      });
      [-2, 2].forEach(function (u) {
        K.win(Wg, 1, u, 1.6, 1.0, 1.8, { wall: c, arch: true });
        K.win(Wg, 1, u, 4.8, 1.0, 1.7, { wall: c, arch: true, shut: shutC });
      });
      K.drain(Wg, 2, -4.6, yP, 7.4, c);
      /* planters and a lamp post by the porch, a bench under the tower */
      [[1.9, 5.7], [7.1, 5.7]].forEach(function (p) { K.pot(p[0], p[1], yP, 1.3); });
      F.box(-3.5, yP, 4.2, 2.2, 0.45, 0.6, 0, marble, 'stone');
      F.cyl(-7.6, yP, 5.4, 0.1, 2.4, 0, IRON, 'metal');
      F.ball(-7.6, yP + 2.6, 5.4, 0.24, GLOW, 'glow');
    } else if (F.variant === 3) {
      /* -------- terraced villa: arcaded ground storey, a first terrace with
         a pergola and fountain, a second block whose roof is a garden with
         pergola, canopy and planted cypresses, a top pavilion with a hip */
      const yP = 0.4, st = shade(c, -0.06);
      F.box(0, 0, -1, 20.6, yP, 14.6, 0, dark, 'stone');
      /* L1 */
      const L1 = { x: 0, z: -2.25, w: 20, d: 11.5 }, T1 = { x: 0, z: -1, w: 20, d: 14 };
      F.box(L1.x, 0, L1.z, L1.w, 4.6, L1.d, 0, c, 'stone');
      F.box(0, 4.2, 4.75, 20, 0.4, 2.5, 0, trim, 'stone');
      F.box(0, 3.25, 5.65, 20, 0.95, 0.7, 0, c, 'stone');
      for (let i = 0; i < 8; i++) {
        const px = -9.65 + i * 19.3 / 7;
        F.box(px, yP, 5.65, 0.7, 2.85, 0.7, 0, st, 'stone');
        F.box(px, 2.9, 5.65, 0.85, 0.2, 0.85, 0, trim, 'stone');
        if (i < 7) [0.55, 2.2].forEach(function (dx) {
          F.box(px + dx, 3.0, 5.65, 0.5, 0.3, 0.6, 0, c, 'stone');
        });
      }
      for (let i = 0; i < 7; i++) {
        const px = -9.65 + (i + 0.5) * 19.3 / 7;
        F.box(px - 0.95, 3.0, 5.65, 0.4, 0.25, 0.6, 0, c, 'stone');
        F.box(px + 0.95, 3.0, 5.65, 0.4, 0.25, 0.6, 0, c, 'stone');
      }
      F.box(0, yP, 4.75, 20, 0.06, 2.5, 0, shade(c, -0.18), 'stone');
      K.door(L1, 0, 0, yP, 1.8, 2.6, { wall: c, ground: yP, arch: true, leaf: shade(tim, 0.05) });
      [-6.9, -4.1, 4.1, 6.9].forEach(function (u) { K.win(L1, 0, u, 1.3, 1.1, 1.8, { wall: c, arch: true, shut: shutC }); });
      [-1.6, 1.6].forEach(function (u) { K.win(L1, 0, u, 1.3, 0.8, 1.5, { wall: c, bars: true }); });
      [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].forEach(function (u) { K.win(L1, 1, u, 1.5, 1.0, 1.6, { wall: c, shut: shutC }); });
      [-4.5, 0, 4.5].forEach(function (u) { K.win(L1, 2, u, 1.5, 1.0, 1.6, { wall: c, shut: shutC }); });
      [-4.5, 2.5].forEach(function (u) { K.win(L1, 3, u, 1.5, 1.0, 1.6, { wall: c, bars: true }); });
      F.box(0, 4.35, L1.z, 20.3, 0.3, L1.d + 0.3, 0, trim, 'stone');
      /* terrace balustrade: front, flanks (gap for the stair), back corners */
      const yT = 4.6, bal = marble;
      K.rail(-10, 5.95, 10, 5.95, yT, 1.0, bal, 0.3);
      K.rail(-9.95, -8, -9.95, -1.9, yT, 1.0, bal, 0.3);
      K.rail(-9.95, -0.1, -9.95, 6, yT, 1.0, bal, 0.3);
      K.rail(9.95, -8, 9.95, 6, yT, 1.0, bal, 0.3);
      K.rail(-10, -7.95, -7, -7.95, yT, 1.0, bal, 0.3);
      K.rail(7, -7.95, 10, -7.95, yT, 1.0, bal, 0.3);
      /* grand stair up the left flank */
      K.flight(-10.9, 5.8, -10.9, -1.0, 0, yT, 1.6, st, { solid: true, base: 0, rail: -1, railC: bal });
      F.box(-10.9, 0, -1.7, 1.6, yT, 1.4, 0, st, 'stone');
      F.box(-10.9, 0, 6.1, 1.9, 1.1, 0.5, 0, trim, 'stone');
      K.pot(-10.9, 6.1, 1.1, 1.0);
      /* L2 */
      const L2 = { x: 0, z: -3.5, w: 14, d: 9 };
      F.box(L2.x, yT, L2.z, L2.w, 4.0, L2.d, 0, shade(c, 0.03), 'stone');
      F.box(L2.x, 8.4, L2.z, L2.w + 0.4, 0.3, L2.d + 0.4, 0, trim, 'stone');
      [-5.2, -2.6, 0, 2.6, 5.2].forEach(function (u) { K.door(L2, 0, u, yT, 1.1, 2.5, { wall: c, ground: yT, jamb: 0.22, arch: u === 0, leaf: shutC }); });
      [-3.5, 0, 3.5].forEach(function (u) { K.win(L2, 3, u, yT + 1.2, 1.0, 1.6, { wall: c, shut: shutC }); K.win(L2, 2, u, yT + 1.2, 1.0, 1.6, { wall: c, shut: shutC }); });
      [-5, -2, 2, 5].forEach(function (u) { K.win(L2, 1, u, yT + 1.2, 1.0, 1.6, { wall: c }); });
      /* first-terrace pergola, fountain, planters, olive trees */
      K.pergola(-1.0, 3.5, yT, 10.0, 2.8, 2.6, { climb: true });
      F.box(-1.0, yT, 3.5, 2.6, 0.75, 1.1, 0, marble, 'stone');
      F.cyl(5.0, yT, 4.2, 1.0, 0.5, 0, marble, 'stone');
      F.cyl(5.0, yT + 0.45, 4.2, 0.85, 0.06, 0, 0x4a5a5a, 'glass');
      F.cyl(5.0, yT + 0.5, 4.2, 0.15, 0.9, 0, marble, 'stone');
      F.cyl(5.0, yT + 1.4, 4.2, 0.4, 0.12, 0, marble, 'stone');
      [[-9.0, 5.0], [9.0, 5.0], [-9.0, -6.9], [9.0, -6.9]].forEach(function (p, i) {
        F.box(p[0], yT, p[1], 1.2, 0.7, 1.2, 0, st, 'stone');
        if (i < 2) F.tree(p[0], p[1], 'olive', 2.6, yT + 0.7);
        else F.blob(p[0], yT + 1.1, p[1], 0.6, 0.9, 0, F.pick(LEAF), 'leafy');
      });
      [-7.5, -3, 1.5].forEach(function (px) {
        F.box(px, yT, 5.5, 2.4, 0.55, 0.6, 0, st, 'stone');
        for (let k = -1; k <= 1; k++) F.blob(px + k * 0.7, yT + 0.7, 5.5, 0.4, 0.5, 0, F.pick(LEAF), 'leafy');
      });
      /* stair from the terrace to the roof garden */
      K.flight(7.9, 3.4, 7.9, -2.0, yT, 8.7, 1.4, st, { solid: true, base: yT, rail: 1, railC: bal });
      F.box(7.9, yT, -2.7, 1.4, 8.7 - yT, 1.4, 0, st, 'stone');
      /* L2 roof garden */
      const yG = 8.7;
      K.parapet({ x: 0, z: -3.5, w: 14.4, d: 9.4 }, yG, 0.9, 0.25, bal, [{ s: 2, u: 0.8, len: 1.3 }], { cap: trim });
      const L3 = { x: -2.5, z: -5, w: 7, d: 6 };
      F.box(L3.x, yG, L3.z, L3.w, 3.1, L3.d, 0, shade(c, 0.06), 'stone');
      F.box(L3.x, yG + 2.9, L3.z, L3.w + 0.2, 0.2, L3.d + 0.2, 0, trim, 'stone');
      K.hip(L3.x, L3.z, yG + 3.1 + 0.28, 8.4, 7.4, 2.2, F.pick(ROOF), { finC: GOLD });
      K.brackets(L3, yG + 3.38, 0.7, 3, tim);
      K.door(L3, 0, 0, yG, 1.2, 2.3, { wall: c, ground: yG, arch: true, jamb: 0.22, leaf: shutC });
      [-2.2, 2.2].forEach(function (u) { K.win(L3, 0, u, yG + 0.9, 0.9, 1.4, { wall: c, shut: shutC }); });
      [0].forEach(function (u) { K.win(L3, 3, u, yG + 0.9, 0.9, 1.4, { wall: c }); K.win(L3, 2, u, yG + 0.9, 0.9, 1.4, { wall: c, shut: shutC }); });
      [-1.8, 1.8].forEach(function (u) { K.win(L3, 1, u, yG + 0.9, 0.9, 1.4, { wall: c }); });
      K.pergola(-2.5, -0.65, yG, 6.8, 2.4, 2.4, { vines: 5 });
      K.canopy(4.0, -4.6, yG + 2.6, 4.6, 5.0, F.pick(SAIL), { posts: [[-1, -1], [1, -1], [-1, 1], [1, 1]], base: yG, val: [0, 2] });
      F.box(4.0, yG, -4.6, 2.2, 0.03, 3.0, 0, F.pick(BANNER), 'cloth');
      F.box(4.0, yG, -4.6, 1.6, 0.7, 0.9, 0, tim2, 'wood');
      [[-6.4, 0.4], [6.4, 0.4]].forEach(function (p) {
        F.cyl(p[0], yG, p[1], 0.45, 0.6, 0, 0x8a5a3a, 'clay');
        F.tree(p[0], p[1], 'cypress', 3.4, yG + 0.6);
      });
      [-4.5, -1.5, 1.5, 4.5].forEach(function (px) {
        F.box(px, yG, 0.65, 2.0, 0.5, 0.5, 0, st, 'stone');
        for (let k = -1; k <= 1; k++) F.blob(px + k * 0.55, yG + 0.6, 0.65, 0.32, 0.4, 0, F.pick(LEAF), 'leafy');
      });
      K.chimney(-5.2, -7.3, yG + 3.1, 1.2, c);
      K.drain(L2, 1, 6.6, yT, 8.6, c);
      K.drain(L1, 1, -9.6, 0.4, 4.6, c);
    } else {
      /* -------- canal palazzo: quay plinth, arcaded portico with a water
         gate and water stair, piano nobile with a five-light window and a
         balcony on the portico, merlon crest, roof belvedere and canopy,
         walled garden behind */
      const yQ = 1.0, P = { x: 0, z: -1, w: 18, d: 12 }, H = 13.6;
      const qc = shade(c, -0.24);
      F.box(0, 0, 0.5, 20, yQ, 16, 0, qc, 'stone');
      F.box(0, yQ - 0.15, 0.5, 20.2, 0.18, 16.2, 0, shade(qc, 0.12), 'stone');
      F.box(0, 0, 0.5, 20.06, 0.35, 16.06, 0, 0x4a5a4a, 'stone');
      F.box(P.x, 0, P.z, P.w, H, P.d, 0, c, 'stone');
      /* quoins */
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
        for (let i = 0; i < 12; i++) {
          const w = i % 2 ? 0.6 : 1.0;
          F.box(q[0] * (9 - w / 2 + 0.04), yQ + i * 1.05, P.z + q[1] * (6 - 0.3 + 0.04), w, 0.55, 0.6, 0, marble, 'stone');
          F.box(q[0] * (9 - 0.3 + 0.04), yQ + i * 1.05, P.z + q[1] * (6 - w / 2 + 0.04), 0.6, 0.55, w, 0, marble, 'stone');
        }
      });
      F.box(P.x, 5.5, P.z, P.w + 0.3, 0.3, P.d + 0.3, 0, trim, 'stone');
      F.box(P.x, 9.9, P.z, P.w + 0.2, 0.25, P.d + 0.2, 0, trim, 'stone');
      F.box(P.x, H - 0.1, P.z, P.w + 0.7, 0.5, P.d + 0.7, 0, trim, 'stone');
      /* portico */
      [1.8, 4.2, 6.6, 8.65].forEach(function (px) {
        [-1, 1].forEach(function (k) {
          F.box(k * px, yQ, 6.85, 0.7, 3.6, 0.7, 0, marble, 'stone');
          F.box(k * px, yQ + 3.5, 6.85, 0.9, 0.2, 0.9, 0, trim, 'stone');
        });
      });
      F.box(0, 4.6, 6.85, 18, 0.7, 0.7, 0, c, 'stone');
      for (let i = 0; i < 8; i++) {
        const xs = [-8.65, -6.6, -4.2, -1.8, 1.8, 4.2, 6.6, 8.65];
        if (i === 7) break;
        const a = xs[i], b = xs[i + 1];
        F.box(a + 0.55, 4.2, 6.85, 0.45, 0.4, 0.66, 0, c, 'stone');
        F.box(b - 0.55, 4.2, 6.85, 0.45, 0.4, 0.66, 0, c, 'stone');
      }
      F.box(0, 5.3, 6.1, 18, 0.35, 2.2, 0, trim, 'stone');
      F.box(0, yQ, 6.0, 18, 0.05, 2.0, 0, shade(c, -0.18), 'stone');
      K.rail(-8.9, 7.1, 8.9, 7.1, 5.65, 1.0, marble, 0.3);
      /* behind the portico: water door, goods doors, windows */
      const fz = P.z + P.d / 2;
      K.door(P, 0, 0, yQ, 2.8, 3.1, { wall: c, ground: yQ, arch: true, leaf: 0x3a4a3a, jamb: 0.35 });
      [-3.0, 3.0].forEach(function (u) { K.door(P, 0, u, yQ, 1.6, 2.6, { wall: c, ground: yQ, leaf: tim, jamb: 0.25 }); });
      [-7.7, 7.7].forEach(function (u) { K.win(P, 0, u, yQ + 1.2, 0.9, 1.4, { wall: c, bars: true }); });
      /* water stair, poles, boat */
      K.flight(0, 10.3, 0, 8.5, 0, yQ, 3.6, shade(qc, 0.08), { solid: true, base: 0 });
      K.mooring(-2.6, 9.1, 3.6, lapis, marble);
      K.mooring(2.6, 9.1, 3.6, lapis, marble);
      K.mooring(9.4, 9.3, 3.2, porph, marble);
      K.boat(7.0, 9.7, 0, 5.4, true, shade(BASALT[1], 0.1));
      /* piano nobile */
      for (let i = -2; i <= 2; i++) K.win(P, 0, i * 1.2, 6.3, 0.85, 2.4, { wall: c, arch: true, trim: marble });
      K.fb(P, 0, 0, 6.08, 6.4, 0.18, 0.3, 0.35, trim, 'stone');
      [-7.6, -5, 5, 7.6].forEach(function (u) {
        K.win(P, 0, u, 6.3, 1.1, 2.3, { wall: c, arch: true, trim: marble, shut: shutC });
        K.fb(P, 0, u, 8.9 + 0.7, 0.5, 0.5, 0.06, 0.05, porph, 'stone');
      });
      [-3.6, 3.6].forEach(function (u) { K.fb(P, 0, u, 7.3, 0.8, 0.8, 0.06, 0.05, porph, 'stone'); K.fb(P, 0, u, 7.4, 0.5, 0.5, 0.06, 0.09, marble, 'stone'); });
      [-7.6, -5, -2.4, 0, 2.4, 5, 7.6].forEach(function (u) { K.win(P, 0, u, 10.8, 0.9, 1.4, { wall: c, trim: marble }); });
      /* merlon crest */
      for (let s = 0; s < 4; s++) {
        const L = s < 2 ? P.w + 0.7 : P.d + 0.7, n = Math.round(L / 1.2);
        for (let i = 0; i < n; i++) {
          const p = K.at({ x: P.x, z: P.z, w: P.w + 0.7, d: P.d + 0.7 }, s, -L / 2 + (i + 0.5) * L / n, -0.2);
          F.box(p[0], H + 0.4, p[1], 0.45, 0.5, 0.45, 0, marble, 'stone');
          F.pyrRoof(p[0], H + 0.9, p[1], 0.45, 0.4, 0.45, 0, marble, 'stone');
        }
      }
      /* flanks and back */
      [-4.5, -1.5, 1.5, 4.5].forEach(function (u) {
        [2, 3].forEach(function (s) {
          if (!(s === 2 && u === 1.5)) K.win(P, s, u, yQ + 1.3, 0.9, 1.5, { wall: c, bars: true });
          K.win(P, s, u, 6.4, 1.0, 2.2, { wall: c, arch: true, shut: shutC, trim: marble });
          K.win(P, s, u, 10.8, 0.9, 1.4, { wall: c, trim: marble });
        });
      });
      K.door(P, 2, 1.5, yQ, 1.3, 2.6, { wall: c, ground: yQ, leaf: shade(tim, 0.05), lamp: true });
      [-6.5, -3.5, 3.5, 6.5].forEach(function (u) {
        K.win(P, 1, u, 2.3, 1.0, 1.6, { wall: c, shut: shutC });
        K.win(P, 1, u, 6.4, 1.0, 2.2, { wall: c, arch: true, shut: shutC, trim: marble });
        K.win(P, 1, u, 10.8, 0.9, 1.4, { wall: c, trim: marble });
      });
      K.door(P, 1, 0, yQ, 1.6, 2.8, { wall: c, arch: true, leaf: shade(tim, 0.05) });
      F.box(0, 5.8, P.z - P.d / 2 - 0.6, 3.6, 0.22, 1.2, 0, trim, 'stone');
      [-1.3, 1.3].forEach(function (px) { F.beam(px, 4.8, P.z - P.d / 2 - 0.05, px, 5.8, P.z - P.d / 2 - 1.0, 0.26, 0.26, trim, 'stone'); });
      K.rail(-1.8, P.z - P.d / 2 - 1.15, 1.8, P.z - P.d / 2 - 1.15, 6.02, 0.9, IRON, 0.25);
      K.win(P, 1, 0, 6.3, 1.1, 2.3, { wall: c, arch: true, trim: marble });
      K.drain(P, 3, -5.9, yQ, H, c);
      K.drain(P, 2, 5.9, yQ, H, c);
      /* roof: belvedere, canopy, chimneys */
      const yR = H + 0.4;
      F.box(P.x, H, P.z, P.w, 0.4, P.d, 0, shade(c, -0.1), 'stone');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
        F.cyl(q[0] * 1.9, yR, -4.5 + q[1] * 1.6, 0.2, 2.6, 0, marble, 'stone');
      });
      F.box(0, yR, -4.5, 4.4, 0.2, 3.8, 0, marble, 'stone');
      F.box(0, yR + 2.6, -4.5, 4.4, 0.3, 3.8, 0, trim, 'stone');
      K.hip(0, -4.5, yR + 2.9 + 0.28, 5.2, 4.6, 1.6, cop, { finC: GOLD });
      K.rail(-2.1, -2.7, 2.1, -2.7, yR + 0.2, 0.9, IRON, 0.3);
      K.canopy(-4.5, 1.8, yR + 2.4, 5.0, 3.6, F.pick(SAIL), { posts: [[-1, -1], [1, -1], [-1, 1], [1, 1]], base: yR, val: [0] });
      F.box(-4.5, yR, 1.8, 2.8, 0.03, 2.0, 0, F.pick(BANNER), 'cloth');
      F.box(-4.5, yR, 1.8, 1.6, 0.7, 0.9, 0, tim2, 'wood');
      [[5.5, 3.5], [7.5, 3.5], [5.5, 0.5]].forEach(function (p) { K.pot(p[0], p[1], yR, 1.1); });
      [-7.8, 7.8].forEach(function (px) {
        K.chimney(px, -4.5, yR, 1.4, c);
        F.frustum(px, yR + 2.15, -4.5, 0.3, 0.6, 0.9, 0, dark, 'stone', 8);
      });
      /* walled garden behind */
      const gc = shade(c, -0.08), gz0 = -7.5, gz1 = -12;
      F.box(-4.6, 0, gz1, 8.8, 2.6, 0.4, 0, gc, 'stone');
      F.box(4.6, 0, gz1, 8.8, 2.6, 0.4, 0, gc, 'stone');
      F.box(-9.0, 0, (gz0 + gz1) / 2, 0.4, 2.6, gz0 - gz1, 0, gc, 'stone');
      F.box(9.0, 0, (gz0 + gz1) / 2, 0.4, 2.6, gz0 - gz1, 0, gc, 'stone');
      [[-4.6, gz1, 9.0, 0.6], [4.6, gz1, 9.0, 0.6], [-9.0, (gz0 + gz1) / 2, 0.6, 4.5], [9.0, (gz0 + gz1) / 2, 0.6, 4.5]].forEach(function (b) {
        F.box(b[0], 2.6, b[1], b[2] * 0.97, 0.14, b[3], 0, trim, 'stone');
      });
      [-0.6, 0.6].forEach(function (px) {
        F.box(px * 1.1, 0, gz1, 0.6, 3.1, 0.6, 0, trim, 'stone');
        F.ball(px * 1.1, 3.35, gz1, 0.28, marble, 'stone');
      });
      F.box(0, 0, gz1, 0.8, 2.2, 0.08, 0, IRON, 'metal');
      F.box(0, 0.02, (gz0 + gz1) / 2, 1.4, 0.04, 4.4, 0, shade(c, -0.18), 'stone');
      F.cyl(0, 0, -9.8, 1.0, 0.5, 0, marble, 'stone');
      F.cyl(0, 0.45, -9.8, 0.85, 0.06, 0, 0x4a5a5a, 'glass');
      F.cyl(0, 0.5, -9.8, 0.12, 0.8, 0, marble, 'stone');
      F.tree(-5.5, -9.8, 'olive', 4.2);
      F.tree(5.5, -9.8, 'cypress', 5.0);
      [-7.8, 7.8].forEach(function (px) { K.pot(px, -8.3, 0, 1.1); });
    }
  }

  ASSET({
    key: 'voth_house_rich', name: 'Wealthy House', culture: 'voth', family: 'housing', source: 'voth-housing',
    districts: ['wealthy', 'manor'], wealth: [0.65, 1],
    blurb: 'Wealthy Voth houses: a copper-roofed Hlaalu mansion with loggias, a Mournhold domed house with turrets and mosaic bands, a pagoda-eaved tower-house, a terraced roof-garden villa and a canal palazzo with a water gate.',
    w: 26.4, d: 23, h: 23.6, variants: 5,
    variantDims: [
      { w: 26.4, d: 14.6, h: 16 },
      { w: 17, d: 18.4, h: 20.7 },
      { w: 20.2, d: 14.7, h: 23.6 },
      { w: 22.7, d: 15.3, h: 15.3 },
      { w: 20.2, d: 23, h: 19.9 }
    ],
    build: function (F) { rich(F, kit(F)); }
  });
})();
