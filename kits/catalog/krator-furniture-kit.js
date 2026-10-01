/* ======================================================================
   Krator Furniture Kit (FK)
   The interiors-phase furniture sets are not 600 hand-modelled pieces: they
   are ONE parametric builder per role (bed, table, hearth, tapestry ...)
   driven by a per-culture STYLE SHEET, plus bespoke pieces where a culture
   earns them. A culture file (krator-master-furniture-<culture>.js) is a
   palette, a style sheet or two, FK.set() calls and a few FURN() overrides.

   Load order: krator-asset-engine.js, this file, then any culture file.
   Every builder draws only through the frame F (kits/furniture/SPEC.md
   "No host globals"): the kit is part of the furniture registry, not of the
   host, so a host that supplies F runs these pieces unchanged.

   THE STYLE SHEET  (every colour a palette key of the culture, FPAL[culture])
     wood, woodDark?, woodLight?   timber keys        woodFam   'wood' | 'bamboo' | 'reed' | 'mahogany' | 'lacquer' | 'rust' | 'plastic' | 'bone'
     cloth: [keys]                  soft furnishings   clothFam  'cloth' | 'hide' | 'reed'
     accent, accentFam              trim, inlay, finials: 'metal' 'gold' 'nacre' 'bone' 'bronze' 'ceramic' 'jade' 'obsidian' ...
     metal, metalFam                ironwork (lamps, hinges, rails)
     clay, clayFam                  pots and jars: 'stone' | 'ceramic'
     stone, stoneFam                hearths, plinths
     rope?                          lashings, bed strings (family 'rope')
     flame, ember                   fire keys (family 'glow')
     legs      'straight' 'turned' 'splayed' 'block' 'trestle' 'x' 'post' 'lashed' 'pedestal' 'strut' 'cabriole'
     motif     'dots' 'studs' 'chevron' 'wave' 'step' 'scale' 'skull' 'lozenge' 'spiral' 'lash' 'rivet' 'none'
     bedBase   'rope' 'plank' 'woven' 'slab'      seat     'cushion' 'plank' 'hide' 'woven'
     finial    'ball' 'knob' 'point' 'skull' 'disc' 'none'
     hearth    'mud' 'stone' 'tile' 'iron' 'drum'  fire   'tripod' 'bowl' 'ring' 'drum' 'pit' 'basket'
     lamp      'oil' 'candle' 'lantern' 'torch' 'bulb' 'glass'
     rug       'knotted' 'woven' 'hide' 'reed' 'rag' 'felt'
     screen    'lattice' 'cloth' 'carved' 'hide' 'reed' 'panel'
     store     'jars' 'sacks' 'baskets' 'crates' 'barrels' 'gourds'
     shelfFill 'books' 'scrolls' 'jars' 'bundles' 'tablets' 'parts'
     rack      'tools' 'cloaks' 'weapons' 'nets' 'spears'
     art       'mask' 'skull' 'plate' 'panel' 'mosaic' 'shield' 'antler' 'relief' 'sunplate' 'horns'
     statue    'figure' 'idol' 'totem' 'urn' 'globe' 'skullpole' 'obelisk' 'vase' 'guardian'
     tapestry  'medallion' 'stripes' 'chevrons' 'grid' 'sun' 'waves' 'diamond' 'wheel' 'claw' 'moon' 'spiral' 'figure'
     canopy    true | false (court bed: posts and hangings, or a dais with a tall head)
     sym?      a SYMBOLS key (core/sockets/38-symbols.js); default: the culture's pack's symbol (SYMBOL_OF)
     emblem?   { field, edge, band, disc?, ink, ink2? } palette keys for painted hangings: the pack's banner colours
     board     'slate' 'hide' 'bark' 'panel' 'plastic'
     lampCol?  palette key of the lamp's glass or shade; cushionsOn? extra cushions on seats

   THE ROLES  (FK.ROLES[tier]) list, per tier, the role, its FURN type, rooms, anchor, clearance,
   default dims, variants and which style slots it draws with (so FK.set() can declare `materials`
   truthfully). Dims may be overridden per culture (spec.dims[role]) and any role replaced by a
   bespoke build (spec.override[role] = { build, w, d, h, ... }) or skipped (spec.skip).
   ====================================================================== */
const FK = (function () {
  'use strict';
  const K = {};
  const SLOT_FAM = { wood: 'woodFam', cloth: 'clothFam', accent: 'accentFam', metal: 'metalFam', clay: 'clayFam', stone: 'stoneFam' };
  const SLOT_DEFAULT = { woodFam: 'wood', clothFam: 'cloth', accentFam: 'metal', metalFam: 'metal', clayFam: 'stone', stoneFam: 'stone' };

/* ======== Palette resolve and frame helpers ======== */
  /* ------------------------------------------------------------ palette resolve */
  K.pal = function (F, S) {
    const c = (k, alt) => F.col(k != null ? k : alt);
    const wood = c(S.wood);
    const P = {
      wood: wood,
      woodD: S.woodDark ? c(S.woodDark) : F.shade(wood, -0.22),
      woodL: S.woodLight ? c(S.woodLight) : F.shade(wood, 0.14),
      wf: S.woodFam || 'wood',
      cloth: F.cols(S.cloth), cf: S.clothFam || 'cloth',
      acc: c(S.accent, S.wood), af: S.accentFam || 'metal',
      metal: c(S.metal, S.accent != null ? S.accent : S.wood), mf: S.metalFam || 'metal',
      clay: c(S.clay, S.wood), clf: S.clayFam || 'stone',
      stone: c(S.stone, S.clay != null ? S.clay : S.wood), sf: S.stoneFam || 'stone',
      rope: S.rope ? c(S.rope) : F.shade(wood, 0.3),
      flame: S.flame ? c(S.flame) : null, ember: S.ember ? c(S.ember) : null,
      pick: () => F.pick(S.cloth)
    };
    P.clothL = F.shade(P.cloth[0], 0.35);
    return P;
  };
  /* a local offset (lx, lz) about (cx, cz) turned by ry: the engine's own frame convention */
  K.rot = function (cx, cz, lx, lz, ry) {
    const c = Math.cos(ry), s = Math.sin(ry);
    return [cx + lx * c + lz * s, cz - lx * s + lz * c];
  };

/* ======== Legs ======== */
  /* ------------------------------------------------------------ legs
     w, d: the outer footprint the legs stay inside; h: their height. o.r: leg half-width. */
  K.legs = function (F, P, S, w, d, h, o) {
    o = o || {};
    const r = o.r || Math.max(0.025, Math.min(0.05, w * 0.045)), style = o.style || S.legs || 'straight';
    const ix = w / 2 - r - 0.01, iz = d / 2 - r - 0.01;
    const c = o.color || P.woodD, f = o.fam || P.wf;
    const corners = [[-ix, -iz], [ix, -iz], [-ix, iz], [ix, iz]];
    if (style === 'turned') {
      for (const [x, z] of corners) {
        F.cyl(x, 0, z, r, h, 0, c, f);
        F.cyl(x, h * 0.3, z, r * 1.35, r * 1.2, 0, F.shade(c, -0.12), f);
        F.cyl(x, h * 0.62, z, r * 1.25, r, 0, F.shade(c, 0.08), f);
      }
    } else if (style === 'splayed') {
      for (const [x, z] of corners) F.beam(x * 0.82, h, z * 0.82, x, 0, z, r * 1.6, r * 1.6, c, f);
    } else if (style === 'block') {
      for (const x of [-ix, ix]) F.box(x, 0, 0, r * 2.2, h, d * 0.82, 0, c, f);
    } else if (style === 'trestle') {
      for (const x of [-ix, ix]) {
        F.beam(x, h, 0, x, 0, -iz * 0.9, r * 1.4, r * 1.4, c, f);
        F.beam(x, h, 0, x, 0, iz * 0.9, r * 1.4, r * 1.4, c, f);
        F.box(x, 0, 0, r * 2, r * 1.2, d * 0.9, 0, F.shade(c, -0.1), f);
      }
      F.box(0, h * 0.35, 0, w - r * 4.4, r * 1.6, r * 1.6, 0, c, f);
    } else if (style === 'x') {
      for (const x of [-ix, ix]) {
        F.beam(x, h, -iz, x, 0, iz, r * 1.3, r * 1.3, c, f);
        F.beam(x, h, iz, x, 0, -iz, r * 1.3, r * 1.3, c, f);
      }
      F.box(0, h * 0.45, 0, w - 4.4 * r, r * 1.4, r * 1.4, 0, c, f);
    } else if (style === 'post' || style === 'lashed') {
      for (const [x, z] of corners) {
        F.cyl(x, 0, z, r, h, 0, c, f);
        for (let y = h * 0.28; y < h * 0.95; y += h * 0.34) F.cyl(x, y, z, r * 1.12, r * 0.5, 0, F.shade(c, -0.15), f);
        if (style === 'lashed') F.cyl(x, Math.max(0, h - r * 3.2), z, r * 1.3, r * 1.8, 0, P.rope, 'rope');
      }
    } else if (style === 'pedestal') {
      const rb = Math.min(w, d) * 0.3;
      F.cyl(0, 0, 0, rb, r * 1.5, 0, c, f);
      F.cyl(0, 0, 0, r * 2, h, 0, c, f);
      F.cyl(0, h * 0.45, 0, r * 2.6, r * 1.2, 0, F.shade(c, -0.1), f);
    } else if (style === 'strut') {
      for (const [x, z] of corners) {
        F.box(x, 0, z, r * 1.7, h, r * 0.45, 0, c, f);
        F.box(x, 0, z, r * 0.45, h, r * 1.7, 0, c, f);
      }
    } else if (style === 'cabriole') {
      for (const [x, z] of corners) {
        F.beam(x * 0.9, h, z * 0.9, x, h * 0.45, z, r * 1.5, r * 1.5, c, f);
        F.beam(x, h * 0.45, z, x * 0.93, 0, z * 0.93, r * 1.3, r * 1.3, c, f);
        F.ball(x * 0.93, r * 0.9, z * 0.93, r * 1.1, F.shade(c, 0.1), f);
      }
    } else {
      for (const [x, z] of corners) F.box(x, 0, z, r * 2, h, r * 2, 0, c, f);
    }
    if (o.stretchers && style !== 'block' && style !== 'pedestal' && style !== 'trestle' && style !== 'x') {
      for (const s of [-1, 1]) F.box(0, h * 0.22, s * iz, w - r * 4.4, r, r, 0, c, f);
    }
    return { r: r, ix: ix, iz: iz };
  };

/* ======== Motifs, bands, finials, cushions ======== */
  /* ------------------------------------------------------------ motifs
     one unit of the culture's motif at (x, y, z), size s, on a face whose outward normal
     is +z turned by ry. Everything stays within s/2 of the point and `out` m proud of the face. */
  K.motifAt = function (F, P, S, x, y, z, s, ry, kind) {
    kind = kind || S.motif || 'none';
    const c = P.acc, f = P.af, out = 0.012;
    const at = (lx, lz) => K.rot(x, z, lx, lz, ry || 0);
    if (kind === 'none') return;
    if (kind === 'dots') {
      const p = at(0, out); F.ball(p[0], y, p[1], s * 0.3, c, f);
    } else if (kind === 'studs' || kind === 'rivet') {
      const p = at(0, out); F.box(p[0], y - s * 0.22, p[1], s * 0.44, s * 0.44, out * 2, ry, kind === 'rivet' ? P.metal : c, kind === 'rivet' ? P.mf : f);
    } else if (kind === 'chevron') {
      const a = at(-s * 0.4, out), m = at(0, out), b = at(s * 0.4, out);
      F.beam(a[0], y - s * 0.25, a[1], m[0], y + s * 0.25, m[1], s * 0.14, out * 2, c, f);
      F.beam(m[0], y + s * 0.25, m[1], b[0], y - s * 0.25, b[1], s * 0.14, out * 2, c, f);
    } else if (kind === 'wave') {
      const a = at(-s * 0.45, out), m = at(0, out), b = at(s * 0.45, out);
      F.beam(a[0], y - s * 0.15, a[1], m[0], y + s * 0.2, m[1], s * 0.12, out * 2, c, f);
      F.beam(m[0], y + s * 0.2, m[1], b[0], y - s * 0.15, b[1], s * 0.12, out * 2, c, f);
      F.ball(m[0], y + s * 0.26, m[1], s * 0.1, F.shade(c, 0.2), f);
    } else if (kind === 'step') {
      for (let i = 0; i < 3; i++) {
        const p = at(-s * 0.3 + i * s * 0.3, out);
        F.box(p[0], y - s * 0.4 + i * s * 0.22, p[1], s * 0.28, s * 0.2, out * 2, ry, i % 2 ? F.shade(c, -0.15) : c, f);
      }
    } else if (kind === 'scale') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const p = at(-s * 0.22 + i * s * 0.44 + (j ? s * 0.22 : 0) - (j ? s * 0.22 : 0), out);
        F.blob(p[0], y - s * 0.2 + j * s * 0.4, p[1], s * 0.2, s * 0.26, 0, j ? F.shade(c, -0.12) : c, f);
      }
    } else if (kind === 'skull') {
      const p = at(0, out + s * 0.01);
      F.ball(p[0], y + s * 0.08, p[1], s * 0.15, c, f);
      F.box(p[0], y - s * 0.2, p[1], s * 0.22, s * 0.14, s * 0.1, ry, F.shade(c, -0.1), f);
      const e1 = at(-s * 0.06, out + s * 0.14), e2 = at(s * 0.06, out + s * 0.14);
      F.ball(e1[0], y + s * 0.1, e1[1], s * 0.03, P.woodD, P.wf);
      F.ball(e2[0], y + s * 0.1, e2[1], s * 0.03, P.woodD, P.wf);
    } else if (kind === 'lozenge') {
      const p = at(0, out);
      F.box(p[0], y - s * 0.18, p[1], s * 0.36, s * 0.36, out * 2, ry, c, f);
      F.box(p[0], y - s * 0.09, p[1], s * 0.18, s * 0.18, out * 3, ry, P.woodD, P.wf);
    } else if (kind === 'spiral') {
      for (let i = 0; i < 6; i++) {
        const a = i * 1.05, rr = s * 0.08 + i * s * 0.05;
        const p = at(Math.cos(a) * rr, out);
        F.ball(p[0], y + Math.sin(a) * rr, p[1], s * 0.07, c, f);
      }
    } else if (kind === 'lash') {
      const p = at(0, 0);
      F.cyl(p[0], y - s * 0.3, p[1], s * 0.3, s * 0.6, 0, P.rope, 'rope');
    } else if (kind === 'band') {
      const p = at(0, out);
      F.box(p[0], y - s * 0.12, p[1], s, s * 0.24, out * 2, ry, c, f);
    }
  };
  /* a run of motif units along a face: centre (x, y, z), length w, unit size s, normal +z turned by ry */
  K.band = function (F, P, S, x, y, z, w, s, ry, kind) {
    kind = kind || S.motif || 'none';
    if (kind === 'none') return;
    const n = Math.max(1, Math.floor(w / (s * 1.4)));
    const step = w / n;
    for (let i = 0; i < n; i++) {
      const p = K.rot(x, z, -w / 2 + step * (i + 0.5), 0, ry || 0);
      K.motifAt(F, P, S, p[0], y, p[1], s, ry, kind);
    }
  };
  /* a disc of radius r facing +z, from z0 to z1 (the engine's F.cyl is vertical only; a rod can lie along z) */
  K.disc = function (F, x, y, z0, z1, r, c, f) { F.rod(x, y, z0, x, y, z1, r, c, f); };
  /* a finial on top of a post at (x, y, z); it rises at most 2.2 r */
  K.finial = function (F, P, S, x, y, z, r) {
    const k = S.finial || 'ball';
    if (k === 'none') return;
    if (k === 'ball') F.ball(x, y + r, z, r, P.acc, P.af);
    else if (k === 'knob') { F.cyl(x, y, z, r * 0.6, r * 0.8, 0, P.acc, P.af); F.ball(x, y + r * 1.2, z, r * 0.8, P.acc, P.af); }
    else if (k === 'point') F.cone(x, y, z, r, r * 2.2, 0, P.acc, P.af);
    else if (k === 'disc') { F.cyl(x, y, z, r * 1.3, r * 0.35, 0, P.acc, P.af); F.ball(x, y + r * 0.7, z, r * 0.5, P.acc, P.af); }
    else if (k === 'skull') { F.ball(x, y + r, z, r, P.acc, P.af); F.box(x, y, z, r * 1.2, r * 0.6, r, 0, F.shade(P.acc, -0.1), P.af); }
  };
  /* ------------------------------------------------------------ emblems
     The culture's device, drawn with the socket packs' own SYMBOLS (core/sockets/38-symbols.js,
     vendored as krator-symbols.js) so a tapestry matches the banner on the building. K.symbolOf
     picks the symbol: the sheet's `sym`, else the culture's pack's (SYMBOL_OF), else the culture's own. */
  K.symbolOf = function (S, culture) {
    if (S && S.sym) return S.sym;
    const info = (typeof FURN_CULTURE_INFO !== 'undefined' && FURN_CULTURE_INFO[culture]) || {};
    const table = typeof SYMBOL_OF !== 'undefined' ? SYMBOL_OF : {};
    return (info.pack && table[info.pack]) || table[culture] || null;
  };
  K.hasSym = function (sym) { return !!(sym && typeof SYMBOLS !== 'undefined' && SYMBOLS[sym]); };
  /* the emblem colours as CSS, from the sheet's `emblem` keys or its cloth and accent */
  K.emblemCols = function (F, S) {
    const e = S.emblem || {}, c = (k, alt) => F.css(F.col(k != null ? k : alt));
    const cl = S.cloth;
    return { field: c(e.field, cl[0]), edge: c(e.edge, cl[1 % cl.length]), band: c(e.band, cl[2 % cl.length]),
      disc: e.disc ? c(e.disc) : null, ink: c(e.ink, S.accent || cl[3 % cl.length]), ink2: c(e.ink2, e.ink != null ? e.ink : (S.accent || cl[3 % cl.length])) };
  };
  /* paint a banner field: edges, end bands, an optional disc and the symbol (the packs' drawBan, minus its grain) */
  K.paintBanner = function (g, W, H, E, sym, o) {
    o = o || {};
    g.fillStyle = E.field; g.fillRect(0, 0, W, H);
    const e = Math.min(W, H) * (o.edge == null ? 0.09 : o.edge);
    if (e > 0) {
      g.fillStyle = E.edge;
      if (H > W) { g.fillRect(0, 0, e, H); g.fillRect(W - e, 0, e, H); g.fillStyle = E.band; g.fillRect(0, 0, W, e * 0.8); g.fillRect(0, H - e * 0.8, W, e * 0.8); }
      else { g.fillRect(0, 0, W, e); g.fillRect(0, H - e, W, e); g.fillStyle = E.band; g.fillRect(0, 0, e * 0.8, H); g.fillRect(W - e * 0.8, 0, e * 0.8, H); }
    }
    const R = Math.min(W * 0.4, H * 0.32) * (o.scale || 1), cx = o.cx != null ? o.cx * W : W / 2, cy = o.cy != null ? o.cy * H : (H > W * 1.25 ? H * 0.38 : H * 0.5);
    if (E.disc) { g.fillStyle = E.disc; g.beginPath(); g.arc(cx, cy, R * 1.06, 0, Math.PI * 2); g.fill(); }
    if (K.hasSym(sym)) SYMBOLS[sym](g, cx, cy, R * 0.94, E.ink, E.ink2);
    else { g.fillStyle = E.ink; g.beginPath(); g.arc(cx, cy, R * 0.5, 0, Math.PI * 2); g.fill(); }
    if (o.bands && H > W * 1.25) { g.fillStyle = E.band; for (let k = 0; k < 3; k++) g.fillRect(W * 0.24, H * 0.66 + k * H * 0.06, W * 0.52, H * 0.025); }
  };
  /* a seeded number stream for painting (canvas paint runs once per key, never from the piece's own stream) */
  K.paintRng = function (seed) { let st = (seed * 2654435761) >>> 0; return () => { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; }; };

  /* a cushion (flattened ellipsoid) */
  K.cushion = function (F, P, x, y, z, w, d, t, col) {
    F.blob(x, y + t / 2, z, Math.min(w, d) / 2, t, 0, col || P.pick(), P.cf);
    if (w !== d) F.box(x, y + t * 0.15, z, w * 0.9, t * 0.7, d * 0.9, 0, col || P.cloth[0], P.cf);
  };

/* ======== Role builders: beds and seating (bed, bedFine, bench, chair, throne, divan) ======== */
  /* ================================================================ role builders
     Every builder: (F, S, o) with o = { w, d, h, variant, court } and the piece inside
     x ±w/2, z ±d/2, y 0..h. +z is the front. */
  const B = {};
  K.build = B;

  B.bed = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const head = S.bedHead !== 'none' && H > 0.75;
    const legH = Math.min(0.38, H * (head ? 0.42 : 0.62)), r = 0.045;
    const L = K.legs(F, P, S, W - 0.02, D - 0.02, legH, { r: r });
    for (const s of [-1, 1]) {
      F.box(s * (W / 2 - 0.06), legH - 0.1, 0, 0.07, 0.1, D - 0.1, 0, P.wood, P.wf);
      F.box(0, legH - 0.1, s * (D / 2 - 0.06), W - 0.1, 0.1, 0.07, 0, P.wood, P.wf);
    }
    const base = S.bedBase || 'plank';
    if (base === 'rope') {
      for (let i = 0; i < 8; i++) F.rod(-W / 2 + 0.1, legH - 0.03, -D / 2 + 0.14 + i * (D - 0.28) / 7, W / 2 - 0.1, legH - 0.03, -D / 2 + 0.14 + i * (D - 0.28) / 7, 0.011, P.rope, 'rope');
      for (let i = 0; i < 4; i++) F.rod(-W * 0.3 + i * W * 0.2, legH - 0.035, -D / 2 + 0.1, -W * 0.3 + i * W * 0.2, legH - 0.035, D / 2 - 0.1, 0.011, F.shade(P.rope, -0.1), 'rope');
    } else if (base === 'woven') {
      F.box(0, legH - 0.04, 0, W - 0.14, 0.03, D - 0.14, 0, P.rope, 'rope');
    } else if (base === 'slab') {
      F.box(0, 0, 0, W - 0.02, legH, D - 0.02, 0, P.stone, P.sf);
    } else {
      for (let i = 0; i < 6; i++) F.box(0, legH - 0.04, -D / 2 + 0.2 + i * (D - 0.4) / 5, W - 0.14, 0.03, 0.12, 0, F.shade(P.wood, 0.05), P.wf);
    }
    const matt = P.pick();
    F.box(0, legH, 0.02, W - 0.16, 0.1, D - 0.16, 0, matt, P.cf);
    F.blob(0, legH + 0.15, -D / 2 + 0.3, Math.min(0.3, W * 0.28), 0.12, 0, P.clothL, P.cf);
    if (v === 1) {
      const b = P.pick();
      F.box(0, legH + 0.1, D * 0.1, W - 0.06, 0.05, D * 0.62, 0, b, P.cf);
      for (const s of [-1, 1]) F.box(s * (W / 2 - 0.03), legH - 0.12, D * 0.1, 0.02, 0.26, D * 0.62, 0, F.shade(b, -0.1), P.cf);
      F.box(0, legH + 0.15, -D * 0.2, W - 0.06, 0.04, 0.12, 0, F.shade(b, 0.12), P.cf);
    }
    if (head) {
      F.box(0, 0, -D / 2 + 0.035, W - 0.02, H, 0.06, 0, P.wood, P.wf);
      K.band(F, P, S, 0, H - 0.14, -D / 2 + 0.065, W - 0.3, 0.1, 0);
      for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.06), H - 0.08, -D / 2 + 0.035, 0.035);
    }
  };

  /* court bed: canopy with posts and hangings, or a dais with a tall head and a hanging behind */
  B.bedFine = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const canopy = S.canopy !== false;
    const plinthH = 0.36;
    F.box(0, 0, 0, W - 0.1, 0.08, D - 0.1, 0, P.woodD, P.wf);
    F.box(0, 0.08, 0, W - 0.06, plinthH - 0.12, D - 0.06, 0, P.wood, P.wf);
    F.box(0, plinthH - 0.04, 0, W - 0.02, 0.04, D - 0.02, 0, P.woodL, P.wf);
    for (const s of [-1, 1]) K.band(F, P, S, s * (W / 2 - 0.03), 0.2, 0, D - 0.4, 0.1, s * Math.PI / 2);
    K.band(F, P, S, 0, 0.2, D / 2 - 0.03, W - 0.4, 0.1, 0);
    F.box(0, plinthH, 0, W - 0.14, 0.14, D - 0.14, 0, P.clothL, P.cf);
    const cover = P.pick();
    F.box(0, plinthH + 0.14, D * 0.1, W - 0.12, 0.04, D * 0.68, 0, cover, P.cf);
    for (let k = 0; k < 3; k++) F.blob((k - 1) * W * 0.28, plinthH + 0.21, -D / 2 + 0.3, Math.min(0.22, W * 0.14), 0.15, F.rr(-0.2, 0.2), P.pick(), P.cf);
    const hang = P.cloth[(v + 1) % P.cloth.length];
    if (canopy) {
      const px = W / 2 - 0.06, pz = D / 2 - 0.06, postH = H - 0.1;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        F.cyl(sx * px, 0, sz * pz, 0.04, postH, 0, P.acc, P.af);
        for (const y of [0.4, 1.2]) F.cyl(sx * px, y, sz * pz, 0.055, 0.05, 0, F.shade(P.acc, -0.15), P.af);
        K.finial(F, P, S, sx * px, postH, sz * pz, 0.045);
      }
      F.box(0, H - 0.22, 0, W - 0.02, 0.08, D - 0.02, 0, P.woodD, P.wf);
      F.box(0, H - 0.14, 0, W - 0.1, 0.04, D - 0.1, 0, hang, P.cf);
      K.band(F, P, S, 0, H - 0.18, D / 2 - 0.01, W - 0.4, 0.07, 0);
      for (const s of [-1, 1]) {
        F.box(s * (W / 2 - 0.02), H - 0.46, 0, 0.02, 0.24, D - 0.06, 0, F.shade(hang, -0.1), P.cf);
        F.box(0, H - 0.46, s * (D / 2 - 0.02), W - 0.06, 0.24, 0.02, 0, F.shade(hang, -0.1), P.cf);
      }
      F.box(0, plinthH + 0.1, -D / 2 + 0.03, W - 0.2, H - 0.6 - plinthH, 0.03, 0, hang, P.cf);
      for (const sx of [-1, 1]) {
        F.box(sx * (W / 2 - 0.15), plinthH, D / 2 - 0.1, 0.14, H - 0.5 - plinthH, 0.06, 0, F.shade(hang, 0.05), P.cf);
        F.blob(sx * (W / 2 - 0.15), plinthH + 0.6, D / 2 - 0.1, 0.09, 0.12, 0, P.acc, P.af);
      }
    } else {
      F.box(0, plinthH - 0.05, -D / 2 + 0.04, W - 0.04, H - plinthH + 0.05, 0.07, 0, P.wood, P.wf);
      F.box(0, plinthH + 0.2, -D / 2 + 0.08, W - 0.3, H - plinthH - 0.5, 0.03, 0, hang, P.cf);
      K.band(F, P, S, 0, H - 0.16, -D / 2 + 0.08, W - 0.3, 0.12, 0);
      for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.07), H - 0.06, -D / 2 + 0.04, 0.04);
      for (const s of [-1, 1]) F.cyl(s * (W / 2 - 0.08), plinthH, D / 2 - 0.08, 0.035, 0.5, 0, P.acc, P.af);
    }
  };

  B.bench = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const seat = S.seat || 'plank', pad = seat === 'cushion' ? 0.06 : seat === 'hide' ? 0.03 : seat === 'woven' ? 0.025 : 0;
    const seatH = Math.min(0.46, H) - pad, backed = v === 1 && H > 0.6;
    K.legs(F, P, S, W, D, seatH - 0.05, { stretchers: true });
    F.box(0, seatH - 0.05, 0, W, 0.05, D, 0, P.wood, P.wf);
    if (seat === 'cushion') F.box(0, seatH, 0, W - 0.08, 0.06, D - 0.06, 0, P.pick(), P.cf);
    else if (seat === 'hide') F.box(0, seatH, 0, W - 0.04, 0.03, D - 0.02, 0, P.cloth[0], P.cf);
    else if (seat === 'woven') F.box(0, seatH, 0, W - 0.06, 0.025, D - 0.06, 0, P.rope, 'rope');
    if (backed) {
      for (const s of [-1, 1]) F.box(s * (W / 2 - 0.04), seatH, -D / 2 + 0.035, 0.05, H - seatH, 0.05, 0, P.woodD, P.wf);
      F.box(0, H - 0.1, -D / 2 + 0.035, W - 0.08, 0.1, 0.03, 0, P.wood, P.wf);
      F.box(0, seatH + 0.12, -D / 2 + 0.035, W - 0.08, 0.06, 0.03, 0, P.wood, P.wf);
      K.band(F, P, S, 0, H - 0.05, -D / 2 + 0.05, W - 0.3, 0.07, 0);
    }
  };

  B.chair = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, stool = o.stool || H < 0.6;
    const seat = S.seat || 'plank', pad = seat === 'cushion' ? 0.07 : seat === 'hide' ? 0.025 : seat === 'woven' ? 0.02 : 0;
    const seatH = (stool ? Math.min(0.45, H) : 0.45) - pad;
    const L = K.legs(F, P, S, W, D, seatH - 0.04, { stretchers: !stool });
    if (stool && (S.legs === 'splayed' || S.legs === 'turned')) F.cyl(0, seatH - 0.04, 0, Math.min(W, D) / 2, 0.04, 0, P.wood, P.wf);
    else F.box(0, seatH - 0.04, 0, W, 0.04, D, 0, P.wood, P.wf);
    if (seat === 'cushion') K.cushion(F, P, 0, seatH, 0, W - 0.06, D - 0.06, 0.07);
    else if (seat === 'hide') F.box(0, seatH, 0, W - 0.03, 0.025, D - 0.03, 0, P.cloth[0], P.cf);
    else if (seat === 'woven') F.box(0, seatH, 0, W - 0.05, 0.02, D - 0.05, 0, P.rope, 'rope');
    if (!stool) {
      const bz = -D / 2 + 0.03;
      for (const s of [-1, 1]) F.box(s * (W / 2 - 0.03), seatH - 0.04, bz, 0.045, H - seatH + 0.04, 0.045, 0, P.woodD, P.wf);
      F.box(0, H - 0.09, bz, W - 0.06, 0.09, 0.03, 0, P.wood, P.wf);
      F.box(0, seatH + 0.14, bz, W - 0.06, 0.05, 0.025, 0, P.wood, P.wf);
      K.band(F, P, S, 0, H - 0.045, bz + 0.016, W - 0.2, 0.06, 0);
    }
  };

  B.throne = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const seatH = 0.5, bz = -D / 2 + 0.05;
    F.box(0, 0, 0, W, 0.06, D, 0, P.woodD, P.wf);                        /* dais step */
    const L = K.legs(F, P, S, W - 0.1, D - 0.1, seatH - 0.1, { r: 0.05 });
    F.box(0, seatH - 0.1, 0, W - 0.1, 0.07, D - 0.1, 0, P.wood, P.wf);
    K.band(F, P, S, 0, seatH - 0.065, D / 2 - 0.05, W - 0.4, 0.06, 0);
    K.cushion(F, P, 0, seatH - 0.03, 0.02, W - 0.22, D - 0.22, 0.08);
    F.box(0, seatH - 0.1, bz, W - 0.1, H - seatH + 0.1, 0.08, 0, P.wood, P.wf);   /* back */
    F.box(0, seatH + 0.1, bz + 0.045, W - 0.3, H - seatH - 0.45, 0.02, 0, P.pick(), P.cf);
    K.band(F, P, S, 0, H - 0.18, bz + 0.05, W - 0.3, 0.12, 0);
    for (const s of [-1, 1]) {
      F.box(s * (W / 2 - 0.1), seatH - 0.03, 0.02, 0.07, 0.25, D - 0.25, 0, P.woodD, P.wf);      /* arms */
      F.box(s * (W / 2 - 0.1), seatH + 0.22, 0.02, 0.1, 0.05, D - 0.2, 0, P.wood, P.wf);
      F.cyl(s * (W / 2 - 0.1), seatH - 0.03, D / 2 - 0.15, 0.035, 0.26, 0, P.acc, P.af);
      K.finial(F, P, S, s * (W / 2 - 0.1), H - 0.12, bz, 0.05);
      F.box(s * (W / 2 - 0.07), 0.06, bz, 0.06, H - 0.1, 0.1, 0, P.woodD, P.wf);
    }
    K.finial(F, P, S, 0, H - 0.14, bz, 0.06);
  };

  B.divan = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const platH = 0.34;
    K.legs(F, P, S, W, D, platH - 0.06, { r: 0.04 });
    F.box(0, platH - 0.08, 0, W, 0.08, D, 0, P.wood, P.wf);
    K.band(F, P, S, 0, platH - 0.04, D / 2 + 0.0, W - 0.3, 0.06, 0);
    F.box(0, platH, 0, W - 0.08, 0.1, D - 0.08, 0, P.pick(), P.cf);
    F.box(0, platH - 0.08, -D / 2 + 0.03, W, Math.min(0.42, H - platH), 0.06, 0, P.wood, P.wf);   /* low back */
    F.box(0, platH + 0.1, -D / 2 + 0.07, W - 0.1, Math.min(0.3, H - platH - 0.14), 0.08, 0, P.cloth[1 % P.cloth.length], P.cf);
    for (const s of [-1, 1]) {
      F.rod(s * (W / 2 - 0.16), platH + 0.22, -D * 0.05, s * (W / 2 - 0.16), platH + 0.22, D * 0.3, 0.12, P.pick(), P.cf);
      F.ball(s * (W / 2 - 0.16), platH + 0.22, D * 0.3, 0.12, P.acc, P.af);
    }
    for (let k = 0; k < 3; k++) K.cushion(F, P, (k - 1) * W * 0.26, platH + 0.1, D * 0.05, 0.4, 0.4, 0.1);
  };

/* ======== Role builders: tables, desks and storage (table, lowTable, desk, chest, cabinet, bookcase, wallShelves, store) ======== */
  B.table = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const t = Math.min(0.06, H * 0.08);
    K.legs(F, P, S, W - 0.06, D - 0.06, H - t, { stretchers: H > 0.6 });
    if (H > 0.6) F.box(0, H - t - 0.08, 0, W - 0.2, 0.08, D - 0.2, 0, P.woodD, P.wf);   /* apron */
    if (o.round) {
      F.cyl(0, H - t, 0, Math.min(W, D) / 2, t, 0, P.wood, P.wf);
      F.cyl(0, H - 0.005, 0, Math.min(W, D) / 2 - 0.02, 0.005, 0, P.woodL, P.wf);
    } else {
      F.box(0, H - t, 0, W, t, D, 0, P.wood, P.wf);
      F.box(0, H - 0.005, 0, W - 0.06, 0.005, D - 0.06, 0, P.woodL, P.wf);
      K.band(F, P, S, 0, H - t / 2, D / 2 - 0.0, W - 0.4, t * 0.9, 0);
    }
    if (v === 1) F.box(0, H, 0, W * 0.3, 0.012, D - 0.02, 0, P.pick(), P.cf);         /* runner */
    if (o.court) for (const s of [-1, 1]) F.box(s * (W / 2 - 0.04), H - t - 0.04, 0, 0.08, 0.04, D - 0.1, 0, P.acc, P.af);
  };

  B.lowTable = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const t = 0.04, legStyle = S.legs === 'turned' || S.legs === 'pedestal' ? 'pedestal' : S.legs;
    K.legs(F, P, S, W - 0.04, D - 0.04, H - t, { style: legStyle, r: 0.035 });
    if (o.round) {
      F.cyl(0, H - t, 0, Math.min(W, D) / 2, t, 0, P.wood, P.wf);
      F.cyl(0, H - 0.004, 0, Math.min(W, D) / 2 - 0.06, 0.004, 0, o.court ? P.acc : P.woodL, o.court ? P.af : P.wf);
    } else {
      F.box(0, H - t, 0, W, t, D, 0, P.wood, P.wf);
      F.box(0, H - 0.004, 0, W - 0.08, 0.004, D - 0.08, 0, o.court ? P.acc : P.woodL, o.court ? P.af : P.wf);
      if (o.court) F.box(0, H - 0.003, 0, W - 0.2, 0.004, D - 0.2, 0, P.wood, P.wf);
    }
    K.band(F, P, S, 0, H - t / 2, D / 2, W - 0.3, t * 0.9, 0);
  };

  B.desk = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const topH = Math.min(0.78, H - 0.02), t = 0.05;
    K.legs(F, P, S, W - 0.04, D - 0.04, topH - t, { stretchers: true });
    F.box(0, topH - t, 0, W, t, D, 0, P.wood, P.wf);
    F.box(0, topH - t - 0.16, 0, W - 0.12, 0.16, D - 0.14, 0, P.woodD, P.wf);          /* drawer box */
    for (let i = 0; i < 2; i++) F.box(-W / 4 + i * W / 2, topH - t - 0.13, D / 2 - 0.065, W * 0.38, 0.1, 0.012, 0, P.wood, P.wf);
    for (let i = 0; i < 2; i++) F.ball(-W / 4 + i * W / 2, topH - t - 0.08, D / 2 - 0.05, 0.016, P.acc, P.af);
    /* a low gallery at the back with pigeon-holes */
    if (H > topH + 0.12) {
      F.box(0, topH, -D / 2 + 0.1, W - 0.02, H - topH, 0.2, 0, P.woodD, P.wf);
      for (let i = 0; i < 4; i++) F.box(-W * 0.36 + i * W * 0.24, topH + 0.03, -D / 2 + 0.105, W * 0.18, H - topH - 0.06, 0.19, 0, F.shade(P.woodD, -0.3), P.wf);
      K.band(F, P, S, 0, H - 0.03, -D / 2 + 0.2, W - 0.3, 0.05, 0);
    }
    F.box(0.1, topH, 0.08, 0.3, 0.012, 0.22, 0.1, P.clothL, 'plaster');                /* a sheet */
    F.cyl(-W / 2 + 0.16, topH, -0.08, 0.035, 0.08, 0, P.clay, P.clf);                   /* ink pot */
  };

  B.chest = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const lid = Math.min(0.14, H * 0.22), foot = Math.min(0.1, H * 0.15);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * (W / 2 - 0.06), 0, sz * (D / 2 - 0.06), 0.08, foot, 0.08, 0, P.woodD, P.wf);
    F.box(0, foot, 0, W - 0.06, H - lid - foot, D - 0.06, 0, P.wood, P.wf);
    F.box(0, H - lid, 0, W, lid, D, 0, P.woodL, P.wf);
    const bands = v === 1 ? [-W * 0.3, 0, W * 0.3] : [0];
    for (const x of bands) {
      F.box(x, foot, D / 2 - 0.02, 0.05, H - lid - foot, 0.015, 0, P.metal, P.mf);
      F.box(x, H - lid, 0, 0.045, lid + 0.005, D + 0.005, 0, F.shade(P.metal, -0.08), P.mf);
    }
    F.box(0, H - lid - 0.16, D / 2 - 0.02, 0.12, 0.14, 0.015, 0, P.acc, P.af);       /* lock plate */
    F.ball(0, H - lid - 0.08, D / 2 - 0.005, 0.02, F.shade(P.acc, 0.15), P.af);
    if (v === 1) K.band(F, P, S, 0, H - lid - 0.3, D / 2 - 0.016, W - 0.5, 0.08, 0);
    for (const s of [-1, 1]) F.rod(s * (W / 2 - 0.003), H / 2, -0.08, s * (W / 2 - 0.003), H / 2, 0.08, 0.016, P.metal, P.mf);
  };

  B.cabinet = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    F.box(0, 0, 0, W, 0.1, D, 0, P.woodD, P.wf);
    F.box(0, 0.1, -0.01, W - 0.04, H - 0.26, D - 0.04, 0, P.wood, P.wf);
    F.box(0, H - 0.16, 0, W, 0.16, D, 0, P.woodD, P.wf);                                 /* cornice */
    K.band(F, P, S, 0, H - 0.08, D / 2, W - 0.3, 0.11, 0);
    const zf = D / 2 - 0.018;
    for (const s of [-1, 1]) {
      F.box(s * (W / 4 - 0.01), 0.14, zf, W / 2 - 0.08, H - 0.36, 0.012, 0, P.woodL, P.wf);    /* doors */
      F.box(s * (W / 4 - 0.01), 0.24, zf + 0.008, W / 2 - 0.22, H - 0.56, 0.008, 0, P.acc, P.af);   /* inlaid panel */
      F.box(s * (W / 4 - 0.01), 0.3, zf + 0.012, W / 2 - 0.3, H - 0.68, 0.006, 0, P.wood, P.wf);
      F.ball(s * 0.05, H / 2, zf + 0.012, 0.02, P.acc, P.af);
    }
    K.motifAt(F, P, S, -W / 4, H * 0.68, zf + 0.012, 0.12, 0);
    K.motifAt(F, P, S, W / 4, H * 0.68, zf + 0.012, 0.12, 0);
  };

  /* wall-anchored: back at z = -d/2 */
  B.bookcase = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const zb = -D / 2;
    F.box(0, 0, zb + 0.015, W, H, 0.03, 0, P.woodD, P.wf);                                  /* back board */
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.03), 0, 0, 0.06, H, D, 0, P.wood, P.wf);
    F.box(0, H - 0.08, 0, W, 0.08, D, 0, P.wood, P.wf);
    if (o.court) K.band(F, P, S, 0, H - 0.04, D / 2, W - 0.3, 0.07, 0);
    const n = Math.max(2, Math.round((H - 0.2) / 0.42)), gap = (H - 0.14) / n;
    const fill = S.shelfFill || 'books';
    for (let k = 0; k < n; k++) {
      const y = 0.06 + k * gap;
      F.box(0, y, 0, W - 0.12, 0.03, D - 0.03, 0, P.wood, P.wf);
      let x = -W / 2 + 0.1;
      const top = y + gap - 0.03;
      while (x < W / 2 - 0.14) {
        if (fill === 'books') {
          const bw = F.rr(0.03, 0.06), bh = Math.min(top - y - 0.06, F.rr(0.22, 0.32));
          F.box(x + bw / 2, y + 0.03, -D * 0.1, bw, bh, D * 0.6, 0, P.pick(), P.cf);
          x += bw + 0.004;
        } else if (fill === 'scrolls') {
          const rr = 0.035;
          for (let j = 0; j < 2; j++) F.rod(x + rr, y + 0.03 + rr + j * rr * 2, -D / 2 + 0.08, x + rr, y + 0.03 + rr + j * rr * 2, D / 2 - 0.06, rr, F.shade(P.clothL, F.rr(-0.1, 0.05)), 'plaster');
          x += rr * 2 + 0.01;
        } else if (fill === 'tablets') {
          F.box(x + 0.05, y + 0.03, -D * 0.1, 0.1, Math.min(top - y - 0.06, 0.2), 0.03, F.rr(-0.1, 0.1), P.stone, P.sf);
          x += 0.13;
        } else if (fill === 'parts') {
          F.box(x + 0.07, y + 0.03, 0, 0.12, F.rr(0.06, 0.16), F.rr(0.08, D - 0.1), F.rr(-0.2, 0.2), F.shade(P.metal, F.rr(-0.2, 0.1)), P.mf);
          x += 0.17;
        } else if (fill === 'bundles') {
          F.rod(x + 0.05, y + 0.08, -D / 2 + 0.06, x + 0.05, y + 0.08, D / 2 - 0.06, 0.05, P.pick(), P.cf);
          x += 0.12;
        } else {
          const s = Math.min(1, (top - y - 0.05) / 0.3) * F.rr(0.7, 1);
          F.frustum(x + 0.08, y + 0.03, 0, 0.055 * s, 0.09 * s, 0.1 * s, 0, P.clay, P.clf, 9);
          F.frustum(x + 0.08, y + 0.03 + 0.1 * s, 0, 0.09 * s, 0.05 * s, 0.14 * s, 0, F.shade(P.clay, 0.05), P.clf, 9);
          x += 0.2;
        }
      }
    }
  };

  B.wallShelves = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const zb = -D / 2;
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.03), 0, zb + 0.03, 0.06, H, 0.06, 0, P.woodD, P.wf);   /* uprights on the wall */
    const n = 3, gap = (H - 0.1) / n;
    const fill = S.store || 'jars';
    for (let k = 0; k < n; k++) {
      const y = 0.08 + k * gap;
      F.box(0, y, 0, W - 0.04, 0.035, D - 0.02, 0, P.wood, P.wf);
      for (const s of [-1, 1]) F.beam(s * (W / 2 - 0.08), y, zb + 0.04, s * (W / 2 - 0.08), y - 0.12, zb + 0.04, 0.03, 0.03, P.woodD, P.wf);
      for (let j = 0; j < 3; j++) {
        const x = -W * 0.3 + j * W * 0.3 + F.rr(-0.05, 0.05), top = y + gap - 0.04;
        const sc = Math.min(1, (top - y - 0.05) / 0.3) * F.rr(0.75, 1);
        if (fill === 'sacks' || fill === 'baskets') {
          F.blob(x, y + 0.035 + 0.08 * sc, 0, 0.1 * sc, 0.16 * sc, 0, fill === 'sacks' ? P.pick() : P.rope, fill === 'sacks' ? P.cf : 'rope');
        } else if (fill === 'crates') {
          F.box(x, y + 0.035, 0, 0.18 * sc, 0.14 * sc, 0.16 * sc, F.rr(-0.1, 0.1), F.shade(P.wood, F.rr(-0.1, 0.1)), P.wf);
        } else if (fill === 'gourds') {
          F.ball(x, y + 0.035 + 0.07 * sc, 0, 0.07 * sc, F.shade(P.clay, F.rr(-0.1, 0.1)), 'plant');
          F.cyl(x, y + 0.035 + 0.12 * sc, 0, 0.025 * sc, 0.06 * sc, 0, F.shade(P.clay, -0.2), 'plant');
        } else {
          F.frustum(x, y + 0.035, 0, 0.055 * sc, 0.09 * sc, 0.1 * sc, 0, P.clay, P.clf, 9);
          F.frustum(x, y + 0.035 + 0.1 * sc, 0, 0.09 * sc, 0.05 * sc, 0.13 * sc, 0, F.shade(P.clay, 0.06), P.clf, 9);
        }
      }
    }
  };

  /* floor storage: jars, sacks, baskets, crates, barrels or gourds in a group */
  B.store = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.store || 'jars';
    const spots = [[-W * 0.28, 0.02, 1], [W * 0.1, -D * 0.12, 0.85], [W * 0.32, D * 0.14, 0.7]];
    for (const [x, z, s] of spots) {
      if (kind === 'sacks') {
        F.blob(x, H * 0.45 * s, z, Math.min(W * 0.2, D / 2 - 0.02), H * 0.9 * s, F.rr(-0.4, 0.4), P.pick(), P.cf);
        F.cyl(x, H * 0.86 * s, z, 0.05, 0.03, 0, P.rope, 'rope');
      } else if (kind === 'baskets') {
        F.frustum(x, 0, z, 0.1 * s, 0.16 * s, H * 0.75 * s, 0, P.rope, 'rope', 12);
        F.cyl(x, H * 0.75 * s, z, 0.17 * s, 0.03, 0, F.shade(P.rope, -0.15), 'rope');
      } else if (kind === 'crates') {
        F.box(x, 0, z, Math.min(W * 0.3, 0.4) * s, H * 0.9 * s, Math.min(D - 0.04, 0.4) * s, F.rr(-0.15, 0.15), F.shade(P.wood, F.rr(-0.1, 0.1)), P.wf);
        F.box(x, H * 0.9 * s - 0.03, z, Math.min(W * 0.3, 0.4) * s + 0.01, 0.03, 0.04, 0, P.woodD, P.wf);
      } else if (kind === 'barrels') {
        F.frustum(x, 0, z, 0.12 * s, 0.15 * s, H * 0.4 * s, 0, P.wood, P.wf, 12);
        F.frustum(x, H * 0.4 * s, z, 0.15 * s, 0.12 * s, H * 0.4 * s, 0, P.wood, P.wf, 12);
        for (const y of [0.15, 0.62]) F.cyl(x, H * y * s, z, 0.155 * s, 0.02, 0, P.metal, P.mf);
      } else if (kind === 'gourds') {
        F.ball(x, 0.12 * s, z, 0.12 * s, F.shade(P.clay, F.rr(-0.1, 0.1)), 'plant');
        F.cyl(x, 0.2 * s, z, 0.05 * s, H * 0.5 * s, 0, F.shade(P.clay, -0.1), 'plant');
        F.ball(x, 0.2 * s + H * 0.5 * s, z, 0.07 * s, F.shade(P.clay, 0.08), 'plant');
      } else {
        F.frustum(x, 0, z, 0.09 * s, 0.15 * s, H * 0.42 * s, 0, P.clay, P.clf, 12);
        F.frustum(x, H * 0.42 * s, z, 0.15 * s, 0.08 * s, H * 0.4 * s, 0, F.shade(P.clay, 0.05), P.clf, 12);
        F.cyl(x, H * 0.82 * s, z, 0.095 * s, H * 0.08 * s, 0, F.shade(P.clay, -0.12), P.clf);
        if (o.court) F.cyl(x, H * 0.5 * s, z, 0.153 * s, 0.03, 0, P.acc, P.af);
      }
    }
  };

/* ======== Role builders: fire and light (hearth, fire, lamp, hanging, candle) ======== */
  /* wall hearth: mud, stone, tile, iron or an oil-drum stove; fire inside and a light */
  B.hearth = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.hearth || 'stone', zb = -D / 2;
    const tile = S.tile ? F.col(S.tile) : P.acc, tf = S.tile ? 'ceramic' : P.af;
    const body = kind === 'mud' ? P.stone : kind === 'tile' ? tile : kind === 'iron' || kind === 'drum' ? P.metal : P.stone;
    const bf = kind === 'tile' ? tf : kind === 'iron' || kind === 'drum' ? P.mf : P.sf;
    const benchH = Math.min(0.72, H * 0.4);
    if (kind === 'drum') {
      F.box(0, 0, zb + 0.02, W * 0.7, H * 0.72, 0.04, 0, F.shade(body, 0.12), bf);           /* heat shield on the wall */
      F.box(W * 0.36, 0, zb + 0.22, W * 0.24, 0.3, 0.4, 0.1, P.woodD, P.wf);                   /* fuel: a bin of scrap wood */
      for (let i = 0; i < 4; i++) F.rod(W * 0.3 + F.rr(-0.06, 0.06), 0.3, zb + 0.08, W * 0.4 + F.rr(-0.06, 0.06), 0.34 + F.rr(0, 0.08), zb + 0.4, 0.02, F.shade(P.woodD, F.rr(-0.1, 0.1)), P.wf);
      F.cyl(-W * 0.36, 0, zb + 0.2, 0.12, 0.26, 0, P.metal, P.mf);                             /* ash bucket */
      F.cyl(0, 0, zb + 0.32, 0.3, benchH + 0.2, 0, body, bf);
      F.cyl(0, benchH + 0.2, zb + 0.32, 0.31, 0.03, 0, F.shade(body, -0.2), bf);
      F.box(0, 0.15, zb + 0.6, 0.26, 0.26, 0.04, 0, F.shade(body, -0.35), bf);
      F.cyl(0, benchH + 0.2, zb + 0.14, 0.07, H - benchH - 0.2, 0, F.shade(body, -0.1), bf);   /* flue */
      F.ball(0, 0.28, zb + 0.5, 0.08, P.flame || P.acc, 'glow');
      F.lamp(0, 0.4, zb + 0.6, 0.6, 5);
      return;
    }
    F.box(0, 0, 0, W, benchH, D, 0, body, bf);
    F.box(0, benchH, 0.02, W - 0.04, 0.04, D - 0.06, 0, F.shade(body, 0.08), bf);
    if (kind === 'tile') for (let r = 0; r < 3; r++) for (let c = 0; c < Math.floor(W / 0.2); c++) {
      F.box(-W / 2 + 0.12 + c * 0.2, 0.08 + r * 0.2, D / 2 - 0.004, 0.17, 0.17, 0.008, 0, (r + c) % 2 ? P.clothL : F.shade(tile, 0.12), (r + c) % 2 ? tf : tf);
    }
    if (kind === 'stone') for (let i = 0; i < 7; i++) F.box(-W / 2 + 0.12 + i * (W - 0.24) / 6, F.rr(0.05, benchH - 0.3), D / 2 - 0.01, F.rr(0.12, 0.22), F.rr(0.1, 0.18), 0.02, 0, F.shade(body, F.rr(-0.18, 0.12)), bf);
    /* fire box, fire, pot */
    const fx = -W * 0.2;
    F.box(fx, 0.08, D / 2 - 0.02, Math.min(0.42, W * 0.3), 0.3, 0.05, 0, F.shade(body, -0.55), bf);
    F.box(fx, benchH + 0.04, 0.0, 0.42, 0.02, 0.42, 0, F.shade(body, -0.55), bf);
    if (P.ember) F.blob(fx, benchH + 0.07, 0, 0.17, 0.05, 0, P.ember, 'glow');
    F.ball(fx, benchH + 0.1, 0, 0.09, P.flame || P.acc, 'glow');
    F.frustum(fx, benchH + 0.06, 0, 0.14, 0.2, 0.12, 0, P.clay, P.clf, 10);
    F.frustum(fx, benchH + 0.18, 0, 0.2, 0.15, 0.12, 0, F.shade(P.clay, 0.06), P.clf, 10);
    /* hood stepping back to the flue */
    const hoodW = W * 0.8;
    F.box(0, benchH + 0.04, zb + 0.17, hoodW, 0.5, 0.34, 0, body, bf);
    F.box(0, benchH + 0.54, zb + 0.14, hoodW * 0.76, 0.3, 0.28, 0, F.shade(body, 0.04), bf);
    F.box(0, benchH + 0.84, zb + 0.1, hoodW * 0.45, H - benchH - 0.84, 0.2, 0, F.shade(body, 0.08), bf);
    F.box(0, benchH + 0.34, zb + 0.35, hoodW + 0.04, 0.05, 0.04, 0, o.court ? P.acc : F.shade(body, 0.12), o.court ? P.af : bf);   /* mantel */
    if (o.court) K.band(F, P, S, 0, benchH + 0.72, zb + 0.29, hoodW * 0.7, 0.08, 0);
    F.lamp(fx, benchH + 0.3, 0.1, 0.8, 6);
  };

  /* free-standing fire: tripod brazier, bowl on a stand, stone ring, cut drum, pit, iron basket */
  B.fire = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.fire || 'bowl', R = Math.min(W, D) / 2;
    const fy = (y) => { if (P.ember) F.blob(0, y + 0.02, 0, R * 0.55, 0.05, 0, P.ember, 'glow'); F.ball(0, y + 0.1, 0, R * 0.3, P.flame || P.acc, 'glow'); F.cone(0, y + 0.1, 0, R * 0.2, R * 0.6, 0, P.flame || P.acc, 'glow'); F.lamp(0, y + 0.3, 0, 0.9, 7); };
    if (kind === 'tripod') {
      const bh = H * 0.55;
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; F.rod(Math.cos(a) * (R - 0.02), 0, Math.sin(a) * (R - 0.02), Math.cos(a) * R * 0.5, bh, Math.sin(a) * R * 0.5, 0.015, P.metal, P.mf); }
      F.frustum(0, bh - 0.02, 0, R * 0.4, R * 0.7, H * 0.2, 0, P.metal, P.mf, 12);
      fy(bh + H * 0.15);
    } else if (kind === 'ring') {
      for (let i = 0; i < 9; i++) { const a = i * F.TAU / 9; F.box(Math.cos(a) * (R - 0.1), 0, Math.sin(a) * (R - 0.1), 0.18, F.rr(0.1, 0.16), 0.14, -a, F.shade(P.stone, F.rr(-0.15, 0.1)), P.sf); }
      F.cyl(0, 0, 0, R * 0.6, 0.03, 0, F.shade(P.stone, -0.5), P.sf);
      for (let i = 0; i < 3; i++) F.rod(-R * 0.4, 0.05 + i * 0.03, (i - 1) * 0.1, R * 0.4, 0.05 + i * 0.03, (1 - i) * 0.08, 0.025, P.woodD, P.wf);
      fy(0.08);
      /* a tripod over it */
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * (R - 0.03), 0, Math.sin(a) * (R - 0.03), 0, H - 0.05, 0, 0.015, P.woodD, P.wf); }
      F.rod(0, H - 0.3, 0, 0, H * 0.55, 0, 0.006, P.metal, P.mf);
      F.frustum(0, H * 0.45, 0, 0.1, 0.13, 0.1, 0, P.metal, P.mf, 10);
    } else if (kind === 'drum') {
      F.cyl(0, 0, 0, R * 0.9, H * 0.7, 0, P.metal, P.mf);
      F.cyl(0, H * 0.7 - 0.02, 0, R * 0.92, 0.03, 0, F.shade(P.metal, -0.2), P.mf);
      for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.box(Math.cos(a) * R * 0.9, H * 0.25, Math.sin(a) * R * 0.9, 0.06, 0.12, 0.02, -a, F.shade(P.metal, -0.5), P.mf); }
      fy(H * 0.7);
    } else if (kind === 'pit') {
      F.cyl(0, 0, 0, R, 0.08, 0, P.stone, P.sf);
      F.cyl(0, 0.08, 0, R * 0.8, 0.02, 0, F.shade(P.stone, -0.5), P.sf);
      for (let i = 0; i < 3; i++) F.rod(-R * 0.5, 0.1 + i * 0.03, (i - 1) * 0.1, R * 0.5, 0.1 + i * 0.03, (1 - i) * 0.08, 0.03, P.woodD, P.wf);
      fy(0.14);
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; F.rod(Math.cos(a) * (R - 0.03), 0, Math.sin(a) * (R - 0.03), 0, H - 0.05, 0, 0.015, P.woodD, P.wf); }
      F.rod(0, H - 0.3, 0, 0, H * 0.55, 0, 0.006, P.rope, 'rope');
      F.frustum(0, H * 0.45, 0, 0.1, 0.13, 0.1, 0, P.clay, P.clf, 10);
    } else if (kind === 'basket') {
      F.cyl(0, 0, 0, R * 0.5, 0.04, 0, P.metal, P.mf);
      F.cyl(0, 0.04, 0, 0.03, H * 0.45, 0, P.metal, P.mf);
      const by = H * 0.49;
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.rod(Math.cos(a) * R * 0.5, by, Math.sin(a) * R * 0.5, Math.cos(a) * R * 0.85, by + H * 0.3, Math.sin(a) * R * 0.85, 0.012, P.metal, P.mf); }
      F.cyl(0, by, 0, R * 0.5, 0.03, 0, P.metal, P.mf);
      F.cyl(0, by + H * 0.3, 0, R * 0.86, 0.02, 0, P.metal, P.mf);
      fy(by + 0.05);
    } else {
      F.cyl(0, 0, 0, R * 0.55, 0.05, 0, P.metal, P.mf);
      F.cyl(0, 0.05, 0, 0.035, H * 0.4, 0, P.metal, P.mf);
      F.frustum(0, H * 0.42, 0, R * 0.35, R, H * 0.25, 0, P.metal, P.mf, 14);
      if (o.court) K.band(F, P, S, 0, H * 0.55, R * 0.95, R * 1.4, 0.06, 0);
      fy(H * 0.65);
    }
  };

  B.lamp = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.lamp || 'oil', R = Math.min(W, D) / 2;
    const glass = S.lampCol ? F.col(S.lampCol) : (P.flame || P.acc);
    if (kind === 'torch') {
      F.cyl(0, 0, 0, R * 0.9, 0.06, 0, P.stone, P.sf);
      F.cyl(0, 0.06, 0, 0.03, H - 0.3, 0, P.woodD, P.wf);
      F.cyl(0, H - 0.3, 0, 0.055, 0.12, 0, P.rope, 'rope');
      F.cone(0, H - 0.2, 0, 0.06, 0.2, 0, P.flame || P.acc, 'glow');
      F.lamp(0, H - 0.1, 0, 0.9, 7);
      return;
    }
    if (kind === 'bulb' || kind === 'glass') {
      F.cyl(0, 0, 0, R * 0.8, 0.04, 0, P.metal, P.mf);
      F.cyl(0, 0.04, 0, 0.025, H - 0.3, 0, P.metal, P.mf);
      F.rod(0, H - 0.3, 0, R * 0.5, H - 0.12, 0, 0.015, P.metal, P.mf);
      F.ball(R * 0.5, H - 0.12, 0, 0.07, glass, 'glow');
      if (kind === 'glass') F.cone(R * 0.5, H - 0.22, 0, R * 0.45, 0.14, 0, F.shade(glass, 0.2), 'glass');
      F.lamp(R * 0.5, H - 0.12, 0, 0.8, 7);
      return;
    }
    /* oil, candle or lantern: a stand with a tray or cage */
    F.frustum(0, 0, 0, R * 0.9, R * 0.4, 0.05, 0, P.acc, P.af, 12);
    F.cyl(0, 0.05, 0, 0.022, H - 0.32, 0, P.acc, P.af);
    for (const y of [0.3, 0.7]) if (y < H - 0.4) F.ball(0, y, 0, 0.04, F.shade(P.acc, 0.1), P.af);
    const ty = H - 0.28;
    if (kind === 'lantern') {
      F.box(0, ty, 0, R * 1.1, 0.03, R * 1.1, 0, P.metal, P.mf);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * R * 0.5, ty, sz * R * 0.5, 0.012, 0.22, 0.012, 0, P.metal, P.mf);
      F.box(0, ty + 0.03, 0, R * 0.95, 0.16, R * 0.95, 0, glass, 'glass');
      F.pyrRoof(0, ty + 0.22, 0, R * 1.1, 0.06, R * 1.1, 0, P.metal, P.mf);
      F.ball(0, ty + 0.1, 0, 0.03, P.flame || P.acc, 'glow');
    } else if (kind === 'candle') {
      F.frustum(0, ty, 0, 0.03, 0.07, 0.03, 0, P.acc, P.af, 12);
      F.cyl(0, ty + 0.03, 0, 0.022, 0.18, 0, P.clothL, 'plaster');
      F.cone(0, ty + 0.21, 0, 0.012, 0.06, 0, P.flame || P.acc, 'glow');
    } else {
      F.frustum(0, ty, 0, 0.03, 0.09, 0.05, 0, P.acc, P.af, 12);
      F.cyl(0, ty + 0.05, 0, 0.07, 0.06, 0, P.clay, P.clf);
      F.cone(0, ty + 0.11, 0, 0.018, 0.09, 0, P.flame || P.acc, 'glow');
      F.cyl(0, ty + 0.11, 0, 0.035, 0.1, 0, glass, 'glass');
    }
    F.lamp(0, H - 0.12, 0, 0.6, 6);
  };

  /* ceiling: a chain or cord from the ceiling (y = H) to a hanging lamp of the culture's kind */
  B.hanging = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, H = o.h;
    const kind = S.lamp || 'oil', R = W / 2, glass = S.lampCol ? F.col(S.lampCol) : (P.flame || P.acc);
    F.cyl(0, H - 0.03, 0, 0.07, 0.03, 0, P.metal, P.mf);                                    /* ceiling rose */
    const drop = H * 0.45;
    F.rod(0, H - 0.03, 0, 0, H - drop, 0, 0.008, kind === 'torch' ? P.rope : P.metal, kind === 'torch' ? 'rope' : P.mf);
    const y = H - drop;
    if (kind === 'lantern' || kind === 'torch') {
      F.box(0, y - 0.03, 0, R * 1.9, 0.03, R * 1.9, 0, P.metal, P.mf);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * R * 0.9, y - 0.4, sz * R * 0.9, 0.012, 0.37, 0.012, 0, P.metal, P.mf);
      F.box(0, y - 0.4, 0, R * 1.7, 0.03, R * 1.7, 0, P.metal, P.mf);
      F.box(0, y - 0.37, 0, R * 1.6, 0.3, R * 1.6, 0, glass, 'glass');
      F.ball(0, y - 0.2, 0, 0.035, P.flame || P.acc, 'glow');
    } else if (kind === 'bulb' || kind === 'glass') {
      F.cone(0, y - 0.25, 0, R * 0.98, 0.25, 0, P.metal, P.mf);
      F.ball(0, y - 0.24, 0, 0.07, glass, 'glow');
    } else if (kind === 'candle') {
      F.cyl(0, y - 0.04, 0, R, 0.04, 0, P.metal, P.mf);
      for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.cyl(Math.cos(a) * R * 0.75, y, Math.sin(a) * R * 0.75, 0.014, 0.12, 0, P.clothL, 'plaster'); F.cone(Math.cos(a) * R * 0.75, y + 0.12, Math.sin(a) * R * 0.75, 0.008, 0.04, 0, P.flame || P.acc, 'glow'); }
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * R * 0.9, y, Math.sin(a) * R * 0.9, 0, y + 0.3, 0, 0.005, P.metal, P.mf); }
    } else {
      /* an oil bowl on three chains */
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(0, y, 0, Math.cos(a) * R * 0.85, y - 0.3, Math.sin(a) * R * 0.85, 0.005, P.metal, P.mf); }
      F.frustum(0, y - 0.42, 0, R * 0.45, R * 0.9, 0.12, 0, P.acc, P.af, 12);
      F.cone(0, y - 0.3, 0, 0.02, 0.1, 0, P.flame || P.acc, 'glow');
      F.cyl(0, y - 0.3, 0, R * 0.5, 0.06, 0, glass, 'glass');
    }
    F.lamp(0, y - 0.2, 0, 0.7, 7);
  };

  /* surface: a candle on a dish; court: a candelabra */
  B.candle = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, H = o.h;
    if (o.court) {
      F.frustum(0, 0, 0, 0.08, 0.04, 0.03, 0, P.acc, P.af, 12);
      F.cyl(0, 0.03, 0, 0.016, H * 0.45, 0, P.acc, P.af);
      F.ball(0, H * 0.25, 0, 0.03, F.shade(P.acc, 0.12), P.af);
      const arms = [[-W / 2 + 0.03, 0], [W / 2 - 0.03, 0], [0, 0]];
      for (const [x, z] of arms) {
        if (x) F.beam(0, H * 0.45, 0, x, H * 0.55, z, 0.014, 0.014, P.acc, P.af);
        const y = x ? H * 0.55 : H * 0.48;
        F.frustum(x, y, z, 0.015, 0.035, 0.02, 0, P.acc, P.af, 10);
        F.cyl(x, y + 0.02, z, 0.013, H * 0.28, 0, P.clothL, 'plaster');
        F.cone(x, y + 0.02 + H * 0.28, z, 0.008, 0.04, 0, P.flame || P.acc, 'glow');
      }
      F.lamp(0, H, 0, 0.4, 4);
      return;
    }
    F.cyl(0, 0, 0, W / 2, 0.012, 0, P.clay, P.clf);
    F.cyl(0, 0.012, 0, 0.022, H - 0.06, 0, P.clothL, 'plaster');
    F.cone(0, H - 0.05, 0, 0.012, 0.05, 0, P.flame || P.acc, 'glow');
    F.lamp(0, H, 0, 0.3, 3);
  };

/* ======== Role builders: soft, screens, trade and work (rug, screen, counter, workbench, loom, rack, ladder, board) ======== */
  B.rug = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const kind = S.rug || 'woven';
    const field = P.cloth[v % P.cloth.length], border = P.cloth[(v + 1) % P.cloth.length], acc = o.court ? P.acc : P.clothL;
    if (kind === 'hide') {
      F.blob(0, 0.008, 0, Math.min(W, D) / 2 * 0.98, 0.016, 0, field, P.cf);
      F.box(0, 0.004, 0, W * 0.96, 0.012, D * 0.7, 0, field, P.cf);
      F.box(0, 0.004, 0, W * 0.7, 0.012, D * 0.96, 0, field, P.cf);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * W * 0.42, 0.002, sz * D * 0.4, W * 0.12, 0.012, D * 0.14, sx * sz * 0.5, F.shade(field, -0.1), P.cf);
      return;
    }
    if (kind === 'reed') {
      for (let i = 0; i < Math.floor(D / 0.1); i++) F.box(0, 0, -D / 2 + 0.05 + i * 0.1, W, 0.012, 0.09, 0, F.shade(field, i % 2 ? 0 : -0.06), 'reed');
      for (const s of [-1, 1]) F.box(0, 0.012, s * (D / 2 - 0.03), W, 0.006, 0.05, 0, border, P.cf);
      return;
    }
    if (kind === 'rag') {
      for (let i = 0; i < Math.floor(D / 0.08); i++) F.box(0, 0, -D / 2 + 0.04 + i * 0.08, W - F.rr(0, 0.08), 0.014, 0.075, 0, P.pick(), P.cf);
      return;
    }
    F.box(0, 0, 0, W, 0.012, D, 0, border, P.cf);
    if (kind === 'knotted' || kind === 'felt') {
      F.box(0, 0.012, 0, W - 0.3, 0.006, D - 0.3, 0, acc, o.court ? P.af : P.cf);
      F.box(0, 0.018, 0, W - 0.4, 0.006, D - 0.4, 0, field, P.cf);
      F.cyl(0, 0.024, 0, Math.min(W, D) * 0.22, 0.004, 0, acc, o.court ? P.af : P.cf);
      F.cyl(0, 0.026, 0, Math.min(W, D) * 0.14, 0.004, 0, F.shade(field, -0.25), P.cf);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * (W / 2 - 0.4), 0.024, sz * (D / 2 - 0.35), 0.22, 0.004, 0.22, Math.PI / 4, acc, o.court ? P.af : P.cf);
      for (const s of [-1, 1]) for (let i = 0; i < Math.floor(D / 0.14); i++) F.box(s * (W / 2 - 0.04), 0, -D / 2 + 0.07 + i * 0.14, 0.08, 0.006, 0.05, 0, P.clothL, P.cf);
    } else {
      /* woven stripes */
      const n = Math.floor((D - 0.2) / 0.18);
      for (let i = 0; i < n; i++) F.box(0, 0.012, -D / 2 + 0.1 + 0.09 + i * 0.18, W - 0.2, 0.006, 0.12, 0, i % 2 ? field : acc, P.cf);
      K.band(F, P, S, 0, 0.03, 0, W - 0.6, 0.1, 0, 'none');
    }
  };

  B.screen = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.screen || 'lattice', n = 3, pw = (W - 0.04) / n;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.02 + pw * (i + 0.5), ry = (i === 1 ? 0 : (i === 0 ? 1 : -1)) * 0.3, zc = i === 1 ? D * 0.3 : -D * 0.2;
      const pw2 = pw * 0.95;
      F.box(x, 0, zc, pw2, 0.05, 0.05, ry, P.woodD, P.wf);
      F.box(x, H - 0.06, zc, pw2, 0.06, 0.05, ry, P.woodD, P.wf);
      const ends = [K.rot(x, zc, -pw2 / 2 + 0.02, 0, ry), K.rot(x, zc, pw2 / 2 - 0.02, 0, ry)];
      for (const e of ends) F.box(e[0], 0, e[1], 0.04, H, 0.05, ry, P.woodD, P.wf);
      if (kind === 'cloth' || kind === 'hide') F.box(x, 0.05, zc, pw2 - 0.06, H - 0.11, 0.015, ry, kind === 'hide' ? P.cloth[0] : P.cloth[i % P.cloth.length], P.cf);
      else if (kind === 'reed') for (let j = 0; j < Math.floor((H - 0.1) / 0.06); j++) F.box(x, 0.06 + j * 0.06, zc, pw2 - 0.06, 0.05, 0.012, ry, F.shade(P.rope, j % 2 ? -0.05 : 0.03), 'reed');
      else if (kind === 'panel' || kind === 'carved') {
        F.box(x, 0.05, zc, pw2 - 0.06, H - 0.11, 0.02, ry, P.wood, P.wf);
        for (let j = 0; j < 3; j++) {
          const p = K.rot(x, zc, 0, 0.012, ry);
          K.motifAt(F, P, S, p[0], H * 0.25 + j * H * 0.25, p[1], Math.min(0.16, pw2 * 0.5), ry);
        }
      } else {
        for (let j = 1; j < 5; j++) { const p = K.rot(x, zc, -pw2 / 2 + pw2 * j / 5, 0, ry); F.box(p[0], 0.05, p[1], 0.016, H - 0.11, 0.016, ry, P.wood, P.wf); }
        for (let j = 1; j < Math.floor(H / 0.25); j++) F.box(x, 0.05 + j * 0.25, zc, pw2 - 0.06, 0.016, 0.016, ry, P.wood, P.wf);
      }
      if (o.court) K.finial(F, P, S, ends[0][0], H - 0.06, ends[0][1], 0.025);
    }
  };

  B.counter = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    F.box(0, 0, 0.02, W - 0.04, 0.08, D - 0.12, 0, P.woodD, P.wf);
    F.box(0, 0.08, 0, W - 0.1, H - 0.15, D - 0.14, 0, P.wood, P.wf);
    for (let i = 0; i < Math.floor(W / 0.6); i++) F.box(-W / 2 + 0.35 + i * 0.6, 0.08, D / 2 - 0.08, 0.1, H - 0.15, 0.03, 0, P.woodD, P.wf);
    F.box(0, H - 0.07, 0, W, 0.07, D, 0, P.woodL, P.wf);
    F.box(0, H - 0.11, D / 2 - 0.02, W, 0.04, 0.04, 0, P.woodD, P.wf);
    F.box(0, H * 0.5, -D / 2 + 0.1, W - 0.2, 0.03, 0.14, 0, P.wood, P.wf);              /* keeper's shelf */
    if (v === 1) K.band(F, P, S, 0, H * 0.5, D / 2 - 0.05, W - 0.5, 0.12, 0);
    F.frustum(W * 0.3, H * 0.5 + 0.03, -D / 2 + 0.1, 0.045, 0.06, 0.08, 0, P.clay, P.clf, 10);   /* a jar on the keeper's shelf */
  };

  B.workbench = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const topH = Math.min(0.9, H) - 0.1;      /* the tools on it reach H */
    K.legs(F, P, S, W, D, topH - 0.08, { style: S.legs === 'turned' ? 'straight' : S.legs, stretchers: true, r: 0.045 });
    F.box(0, topH - 0.08, 0, W, 0.08, D, 0, P.wood, P.wf);
    F.box(0, 0.2, 0, W - 0.2, 0.03, D - 0.2, 0, P.woodD, P.wf);                        /* lower shelf */
    F.box(0, 0.25, -D / 2 + 0.02, W - 0.1, H - 0.25, 0.04, 0, F.shade(P.woodD, -0.1), P.wf);   /* tool board on the wall */
    for (let i = 0; i < 4; i++) F.box(-W * 0.3 + i * W * 0.2, topH + 0.02, -D / 2 + 0.05, 0.03, F.rr(0.05, Math.max(0.06, H - topH - 0.04)), 0.03, 0, P.metal, P.mf);
    F.box(W / 2 - 0.1, topH - 0.04, D / 2 - 0.05, 0.14, 0.14, 0.08, 0, P.metal, P.mf);  /* vice */
    F.rod(W / 2 - 0.1, topH + 0.03, D / 2 + 0.0, W / 2 - 0.1, topH + 0.03, D / 2 - 0.22, 0.012, P.metal, P.mf);
    F.box(-W * 0.3, topH, -0.1, 0.05, 0.03, 0.26, 0.3, P.woodD, P.wf);                 /* mallet */
    F.cyl(-W * 0.3, topH, 0.03, 0.03, 0.09, 0, P.metal, P.mf);
    F.box(0.05, topH, 0.05, 0.3, 0.05, 0.12, -0.2, F.shade(P.wood, 0.1), P.wf);         /* a worked block */
    for (let i = 0; i < 4; i++) F.box(-W * 0.35 + i * 0.12, 0.23, 0, 0.06, F.rr(0.04, 0.1), 0.2, 0, F.shade(P.metal, F.rr(-0.1, 0.1)), P.mf);
    F.cyl(W * 0.1, topH, -D * 0.3, 0.06, 0.1, 0, P.clay, P.clf);
  };

  B.loom = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    for (const s of [-1, 1]) {
      F.box(s * (W / 2 - 0.04), 0, -D / 2 + 0.05, 0.07, H, 0.07, 0, P.woodD, P.wf);
      F.beam(s * (W / 2 - 0.04), H * 0.6, -D / 2 + 0.05, s * (W / 2 - 0.04), 0, D / 2 - 0.05, 0.06, 0.06, P.woodD, P.wf);
      F.box(s * (W / 2 - 0.04), 0, 0, 0.09, 0.06, D - 0.04, 0, P.woodD, P.wf);
    }
    F.rod(-W / 2 + 0.08, H - 0.05, -D / 2 + 0.05, W / 2 - 0.08, H - 0.05, -D / 2 + 0.05, 0.03, P.wood, P.wf);
    F.rod(-W / 2 + 0.08, 0.3, -D / 2 + 0.05, W / 2 - 0.08, 0.3, -D / 2 + 0.05, 0.03, P.wood, P.wf);
    for (let i = 0; i < 14; i++) { const x = -W * 0.36 + i * W * 0.72 / 13; F.rod(x, 0.3, -D / 2 + 0.05, x, H - 0.05, -D / 2 + 0.05, 0.004, P.rope, 'rope'); }
    F.box(0, 0.3, -D / 2 + 0.05, W * 0.74, H * 0.4, 0.02, 0, P.pick(), P.cf);
    F.box(0, H * 0.5, -D / 2 + 0.03, W * 0.8, 0.04, 0.06, 0, P.wood, P.wf);              /* beater */
    K.band(F, P, S, 0, H * 0.5, -D / 2 + 0.066, W * 0.5, 0.035, 0);
    F.box(0, 0.06, D * 0.25, W * 0.6, 0.05, 0.25, 0, P.wood, P.wf);                      /* bench */
    F.box(0.1, 0.11, D * 0.25, 0.14, 0.04, 0.05, 0.4, P.woodL, P.wf);                   /* shuttle */
  };

  B.rack = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.rack || 'tools', zb = -D / 2;
    F.box(0, H - 0.12, zb + 0.03, W, 0.12, 0.06, 0, P.woodD, P.wf);
    F.box(0, 0.1, zb + 0.03, W, 0.1, 0.06, 0, P.woodD, P.wf);
    if (kind === 'weapons' || kind === 'spears') {
      for (let i = 0; i < 4; i++) {
        const x = -W * 0.36 + i * W * 0.24;
        F.cyl(x, 0.2, zb + 0.1, 0.014, H - 0.35, 0, P.wood, P.wf);
        if (kind === 'spears') F.cone(x, H - 0.15, zb + 0.1, 0.03, 0.14, 0, i % 2 ? P.acc : P.metal, i % 2 ? P.af : P.mf);
        else F.box(x, H - 0.5, zb + 0.1, 0.06, 0.35, 0.015, 0, P.metal, P.mf);
      }
      const sr = Math.min(0.26, W * 0.2);
      K.disc(F, W / 2 - sr - 0.02, 0.2 + sr, zb + 0.1, zb + 0.14, sr, P.acc, P.af);
      F.box(0, 0.2, zb + 0.14, W * 0.26, 0.03, Math.min(0.4, D - 0.16), 0, P.acc, P.af);
    } else if (kind === 'cloaks') {
      for (let i = 0; i < 3; i++) {
        const x = -W * 0.32 + i * W * 0.32;
        F.rod(x, H - 0.14, zb + 0.06, x, H - 0.1, zb + 0.16, 0.014, P.acc, P.af);
        F.box(x, 0.3 + F.rr(0, 0.1), zb + 0.12, 0.3, H - 0.75, 0.12, 0, P.pick(), P.cf);
        F.box(x, 0.2, zb + 0.14, 0.26, 0.02, 0.16, 0, P.pick(), P.cf);
      }
    } else if (kind === 'nets') {
      for (let i = 0; i < 3; i++) {
        const x = -W * 0.32 + i * W * 0.32;
        F.rod(x, H - 0.14, zb + 0.06, x, H - 0.1, zb + 0.18, 0.014, P.wood, P.wf);
        F.blob(x, H * 0.55, zb + 0.14, 0.12, H * 0.3, 0, P.rope, 'rope');
        F.blob(x, H * 0.25, zb + 0.14, 0.16, H * 0.14, 0, F.shade(P.rope, -0.1), 'rope');
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const x = -W * 0.4 + i * W * 0.2;
        F.rod(x, H - 0.14, zb + 0.06, x, H - 0.1, zb + 0.18, 0.012, P.acc, P.af);
        if (i % 2) { F.box(x, H - 0.55, zb + 0.14, 0.03, 0.45, 0.03, 0, P.wood, P.wf); F.box(x, H - 0.6, zb + 0.14, 0.14, 0.06, 0.05, 0, P.metal, P.mf); }
        else { F.box(x, H - 0.5, zb + 0.14, 0.025, 0.4, 0.025, 0, P.wood, P.wf); F.box(x, H - 0.56, zb + 0.14, 0.05, 0.12, 0.012, 0, P.metal, P.mf); }
      }
      F.box(0, 0.2, zb + 0.16, W * 0.3, 0.12, 0.2, 0, P.woodD, P.wf);
      F.box(W * 0.3, 0.2, zb + 0.16, 0.2, 0.2, 0.2, 0.2, P.clay, P.clf);
    }
  };

  /* leaning ladder: touches the wall at its top */
  B.ladder = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const zt = -D / 2 + 0.03, zb = D / 2 - 0.03;
    for (const s of [-1, 1]) F.beam(s * (W / 2 - 0.03), H - 0.03, zt, s * (W / 2 - 0.03), 0.03, zb, 0.05, 0.05, P.woodD, P.wf);
    const n = Math.floor(H / 0.3);
    for (let i = 1; i <= n; i++) { const t = i / (n + 0.5); F.rod(-W / 2 + 0.05, 0.03 + t * (H - 0.06), zb - t * (zb - zt), W / 2 - 0.05, 0.03 + t * (H - 0.06), zb - t * (zb - zt), 0.018, P.wood, P.wf); }
  };

  B.board = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.board || 'slate', zb = -D / 2;
    F.box(0, 0.4, zb + 0.03, W, H - 0.4, 0.06, 0, P.woodD, P.wf);
    const face = kind === 'slate' ? P.stone : kind === 'hide' ? P.cloth[0] : kind === 'bark' ? P.woodD : kind === 'plastic' ? P.clothL : P.woodL;
    const ff = kind === 'slate' ? P.sf : kind === 'hide' ? P.cf : kind === 'plastic' ? 'plastic' : P.wf;
    F.box(0, 0.46, zb + 0.065, W - 0.12, H - 0.52, 0.01, 0, face, ff);
    for (let i = 0; i < 5; i++) F.box(-W * 0.3 + F.rr(0, W * 0.5), 0.6 + i * (H - 0.9) / 5, zb + 0.072, F.rr(0.15, W * 0.5), 0.015, 0.004, 0, P.clothL, 'plaster');
    K.motifAt(F, P, S, W * 0.3, H - 0.25, zb + 0.072, 0.14, 0);
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.05), 0, zb + 0.05, 0.08, 0.45, 0.1, 0, P.woodD, P.wf);
    F.box(0, 0.42, zb + 0.09, W - 0.2, 0.03, 0.06, 0, P.wood, P.wf);                   /* chalk ledge */
  };

/* ======== Role builders: surface pieces (bowl, jug, books) ======== */
  B.bowl = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, H = o.h, v = o.variant || 0;
    const R = W / 2;
    F.cyl(0, 0, 0, R * 0.45, 0.015, 0, F.shade(P.clay, -0.12), P.clf);
    F.frustum(0, 0.015, 0, R * 0.5, R * 0.98, H * 0.42, 0, P.clay, P.clf, 14);
    F.cyl(0, H * 0.43, 0, R * 0.9, 0.01, 0, o.court ? P.acc : P.clothL, o.court ? P.af : P.clf);
    if (v === 0) {
      for (let i = 0; i < 5; i++) { const a = i / 5 * F.TAU + F.rr(-0.2, 0.2), r = i ? R * 0.42 : 0; F.ball(Math.cos(a) * r, H * 0.5 + (i ? 0 : R * 0.2), Math.sin(a) * r, R * 0.22, P.pick(), 'plant'); }
    } else {
      for (let i = 0; i < 3; i++) F.cyl(F.rr(-0.02, 0.02), H * 0.44 + i * 0.015, F.rr(-0.02, 0.02), R * 0.7, 0.014, 0, F.shade(P.clothL, F.rr(-0.1, 0.05)), 'plant');
    }
  };

  B.jug = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const tray = o.court;
    let y = 0;
    if (tray) { F.cyl(0, 0, 0, Math.min(W, D) / 2, 0.012, 0, P.acc, P.af); y = 0.012; }
    const jx = -W * 0.2, jh = H - y - 0.02;
    F.frustum(jx, y, 0, 0.055, 0.09, jh * 0.3, 0, P.clay, P.clf, 12);
    F.frustum(jx, y + jh * 0.3, 0, 0.09, 0.045, jh * 0.3, 0, F.shade(P.clay, 0.05), P.clf, 12);
    F.cyl(jx, y + jh * 0.6, 0, 0.04, jh * 0.32, 0, F.shade(P.clay, -0.05), P.clf);
    F.cyl(jx, y + jh * 0.92, 0, 0.05, jh * 0.08, 0, o.court ? P.acc : F.shade(P.clay, -0.12), o.court ? P.af : P.clf);
    F.beam(jx, y + jh * 0.85, -0.045, jx, y + jh * 0.42, -0.1, 0.022, 0.012, F.shade(P.clay, -0.08), P.clf);
    for (const [x, z] of [[W * 0.2, D * 0.15], [W * 0.34, -D * 0.2]]) F.frustum(x, y, z, 0.028, 0.038, jh * 0.22, 0, o.court ? P.acc : F.shade(P.clay, 0.1), o.court ? P.af : P.clf, 10);
  };

  B.books = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const fill = S.shelfFill || 'books';
    if (fill === 'scrolls' || fill === 'bundles') {
      let y = 0;
      const rr = Math.min(0.035, H / 6);
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 3 - row; i++) F.rod(-W * 0.25 + i * rr * 2.1 + row * rr, y + rr, -D / 2 + 0.02, -W * 0.25 + i * rr * 2.1 + row * rr, y + rr, D / 2 - 0.02, rr, F.shade(P.clothL, F.rr(-0.12, 0.04)), 'plaster');
        y += rr * 1.75;
      }
      F.box(W * 0.28, 0, 0, 0.09, 0.02, D * 0.8, 0.1, P.pick(), P.cf);
      F.cyl(W * 0.28, 0.02, 0, 0.012, 0.012, 0, P.acc, P.af);
    } else if (fill === 'tablets') {
      for (let i = 0; i < 3; i++) F.box(-W * 0.2 + i * 0.03, i * 0.025, 0, W * 0.5, 0.025, D * 0.7, F.rr(-0.15, 0.15), F.shade(P.stone, F.rr(-0.1, 0.1)), P.sf);
    } else {
      let y = 0;
      for (let i = 0; i < 5; i++) {
        const w = F.rr(W * 0.55, W * 0.8), d = F.rr(D * 0.55, D * 0.8), t = Math.min(0.06, H / 5.5) * F.rr(0.7, 1), r = F.rr(-0.25, 0.25);
        F.box(0, y, 0, w, t, d, r, P.pick(), P.cf);
        F.box(0, y + 0.005, 0.006, w - 0.02, t - 0.01, d - 0.005, r, P.clothL, 'plaster');
        y += t;
      }
      if (o.court) F.box(0, y, 0, W * 0.2, 0.01, D * 0.3, 0, P.acc, P.af);
    }
  };

/* ======== Role builders: tapestry, wall art, statues ======== */
  /* tapestry: a rod, a field, borders and the culture's device in the middle. Wall anchor. */
  B.tapestry = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2;
    const sym = K.symbolOf(S, o.culture);
    if (v !== 2) {
      /* painted: the emblem on the pack colours (v 0), on the sheet's second cloth (v 1), or a banded field with a row of small emblems (v 3) */
      F.rod(-W / 2, H - 0.04, zb + 0.05, W / 2, H - 0.04, zb + 0.05, 0.02, P.woodD, P.wf);
      for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.03), H - 0.08, zb + 0.05, 0.03);
      const E = K.emblemCols(F, S);
      if (v === 1) { const t = E.field; E.field = F.css(P.cloth[1 % P.cloth.length]); E.band = t; }
      const top = H - 0.08, bot = 0.12, fh = top - bot;
      const key = 'tap:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.field + E.ink;
      F.decal(0, bot, zb + 0.03, W - 0.1, fh, 0, key, function (g, cw, ch) {
        if (v === 3) {
          const n = 7, bh = ch / n;
          for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? E.band : E.field; g.fillRect(0, i * bh, cw, bh + 1); }
          g.fillStyle = E.edge; g.fillRect(0, 0, cw, bh * 0.4); g.fillRect(0, ch - bh * 0.4, cw, bh * 0.4);
          const R = Math.min(bh * 1.3, cw / 8);
          for (let i = 0; i < 3; i++) if (K.hasSym(sym)) SYMBOLS[sym](g, cw * (0.2 + i * 0.3), ch * 0.5, R, E.ink, E.ink2);
        } else K.paintBanner(g, cw, ch, E, sym, { bands: true });
      }, P.cf);
      const fr = F.col(S.emblem && S.emblem.band ? S.emblem.band : S.cloth[2 % S.cloth.length]);
      for (let i = 0; i < Math.floor((W - 0.2) / 0.1); i++) F.box(-W / 2 + 0.15 + i * 0.1, 0.03, zb + 0.03, 0.04, 0.09, 0.01, 0, fr, P.cf);   /* fringe */
      return;
    }
    const kind = S.tapestry || 'medallion';
    const field = P.cloth[v % P.cloth.length], edge = P.cloth[(v + 1) % P.cloth.length], band = P.cloth[(v + 2) % P.cloth.length];
    const ink = P.acc, inkF = P.af;
    F.rod(-W / 2, H - 0.04, zb + 0.05, W / 2, H - 0.04, zb + 0.05, 0.02, P.woodD, P.wf);
    for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.03), H - 0.08, zb + 0.05, 0.03);
    const top = H - 0.08, bot = 0.12, cy = (top + bot) / 2, fh = top - bot;
    F.box(0, bot, zb + 0.02, W - 0.1, fh, 0.02, 0, field, P.cf);
    F.box(0, bot, zb + 0.032, W - 0.1, 0.1, 0.004, 0, band, P.cf);
    F.box(0, top - 0.1, zb + 0.032, W - 0.1, 0.1, 0.004, 0, band, P.cf);
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.1), bot, zb + 0.032, 0.1, fh, 0.004, 0, edge, P.cf);
    const zf = zb + 0.038, R = Math.min(W - 0.4, fh - 0.4) / 2;
    if (kind === 'stripes') {
      for (let i = 0; i < Math.floor(fh / 0.24); i++) F.box(0, bot + 0.12 + i * 0.24, zf, W - 0.3, 0.1, 0.004, 0, i % 2 ? band : ink, i % 2 ? P.cf : inkF);
    } else if (kind === 'chevrons') {
      for (let i = 0; i < Math.floor(fh / 0.3); i++) K.motifAt(F, P, S, 0, bot + 0.25 + i * 0.3, zf, Math.min(W - 0.4, 0.5), 0, 'chevron');
    } else if (kind === 'grid') {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) F.box(-R * 0.6 + i * R * 0.6, cy - R * 0.6 + j * R * 0.6 - 0.05, zf, R * 0.3, R * 0.3, 0.004, 0, (i + j) % 2 ? ink : band, (i + j) % 2 ? inkF : P.cf);
    } else if (kind === 'sun') {
      K.disc(F, 0, cy, zf, zf + 0.004, R * 0.42, ink, inkF);
      for (let i = 0; i < 12; i++) { const a = i * F.TAU / 12; F.beam(Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5, zf, Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9, zf, 0.05, 0.004, ink, inkF); }
    } else if (kind === 'waves') {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) K.motifAt(F, P, S, -R * 0.6 + j * R * 0.6, cy - R * 0.5 + i * R * 0.5, zf, R * 0.5, 0, 'wave');
    } else if (kind === 'diamond') {
      F.beam(-R, cy, zf, 0, cy + R, zf, 0.06, 0.004, ink, inkF); F.beam(0, cy + R, zf, R, cy, zf, 0.06, 0.004, ink, inkF);
      F.beam(R, cy, zf, 0, cy - R, zf, 0.06, 0.004, ink, inkF); F.beam(0, cy - R, zf, -R, cy, zf, 0.06, 0.004, ink, inkF);
      F.box(0, cy - R * 0.25, zf, R * 0.5, R * 0.5, 0.004, 0, band, P.cf);
    } else if (kind === 'wheel') {
      K.disc(F, 0, cy, zf, zf + 0.004, R * 0.95, ink, inkF);
      K.disc(F, 0, cy, zf + 0.004, zf + 0.008, R * 0.8, field, P.cf);
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.beam(0, cy, zf + 0.008, Math.cos(a) * R * 0.85, cy + Math.sin(a) * R * 0.85, zf + 0.008, 0.04, 0.004, ink, inkF); }
      K.disc(F, 0, cy, zf + 0.012, zf + 0.016, R * 0.18, ink, inkF);
    } else if (kind === 'claw') {
      for (let i = -1; i <= 1; i++) F.beam(i * R * 0.45 - R * 0.2, cy + R * 0.8, zf, i * R * 0.45 + R * 0.2, cy - R * 0.8, zf, 0.08, 0.004, ink, inkF);
    } else if (kind === 'moon') {
      K.disc(F, 0, cy, zf, zf + 0.004, R * 0.7, ink, inkF);
      K.disc(F, R * 0.3, cy + R * 0.1, zf + 0.004, zf + 0.008, R * 0.6, field, P.cf);
      for (let i = 0; i < 5; i++) F.ball(-R + i * R * 0.5, bot + 0.3, zf, 0.03, band, P.cf);
    } else if (kind === 'spiral') {
      for (let i = 0; i < 16; i++) { const a = i * 0.7, rr = R * 0.1 + i * R * 0.055; F.ball(Math.cos(a) * rr, cy + Math.sin(a) * rr, zf, 0.035, ink, inkF); }
    } else if (kind === 'figure') {
      K.disc(F, 0, cy + R * 0.55, zf, zf + 0.006, R * 0.18, ink, inkF);
      F.box(0, cy - R * 0.3, zf, R * 0.5, R * 0.7, 0.006, 0, ink, inkF);
      for (const s of [-1, 1]) F.beam(s * R * 0.25, cy + R * 0.3, zf, s * R * 0.7, cy + R * 0.7, zf, 0.06, 0.006, ink, inkF);
      for (const s of [-1, 1]) F.box(s * R * 0.15, cy - R * 0.95, zf, R * 0.18, R * 0.65, 0.006, 0, ink, inkF);
      for (let i = 0; i < 4; i++) F.ball(-R * 0.9 + i * R * 0.6, cy + R * 0.95, zf, 0.04, band, P.cf);
    } else {
      K.disc(F, 0, cy, zf, zf + 0.004, R * 0.9, band, P.cf);
      K.disc(F, 0, cy, zf + 0.004, zf + 0.008, R * 0.7, ink, inkF);
      K.disc(F, 0, cy, zf + 0.008, zf + 0.012, R * 0.4, field, P.cf);
      K.motifAt(F, P, S, 0, cy, zf + 0.012, R * 0.5, 0);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) K.motifAt(F, P, S, sx * (W / 2 - 0.26), cy + sy * (fh / 2 - 0.26), zf, 0.14, 0);
    }
  };

  /* a tall banner on a crossbar: the emblem at the top, bands below, a swallow-tail or fringed end */
  B.banner = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    if (v === 1) { const t = E.field; E.field = E.band; E.band = t; }
    F.rod(-W / 2, H - 0.05, zb + 0.06, W / 2, H - 0.05, zb + 0.06, 0.018, P.acc, P.af);
    for (const s of [-1, 1]) K.finial(F, P, S, s * (W / 2 - 0.02), H - 0.1, zb + 0.06, 0.025);
    F.rod(0, H - 0.05, zb + 0.06, 0, H - 0.01, zb + 0.015, 0.008, P.metal, P.mf);           /* hung from a hook on the wall */
    const top = H - 0.07, bot = 0.22, fh = top - bot;
    const key = 'ban:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.field;
    F.decal(0, bot, zb + 0.035, W - 0.04, fh, 0, key, function (g, cw, ch) {
      K.paintBanner(g, cw, ch, E, sym, { bands: true, cy: 0.3, scale: 1.1 });
      g.fillStyle = E.edge; for (let k = 0; k < 2; k++) g.fillRect(0, ch * (0.62 + k * 0.14), cw, ch * 0.05);
    }, P.cf);
    const fc = F.col(S.emblem && S.emblem.field ? S.emblem.field : S.cloth[0]);
    if (v === 0) { for (const s of [-1, 1]) F.beam(s * W * 0.22, bot, zb + 0.035, s * W * 0.4, 0.02, zb + 0.035, W * 0.3, 0.012, v === 1 ? F.col(S.cloth[2 % S.cloth.length]) : fc, P.cf); }
    else for (let i = 0; i < Math.floor((W - 0.08) / 0.06); i++) F.box(-W / 2 + 0.06 + i * 0.06, bot - 0.18, zb + 0.035, 0.03, 0.18, 0.008, 0, F.col(S.cloth[2 % S.cloth.length]), P.cf);
  };

  /* a long low frieze on a rail: lozenges and a row of small emblems */
  B.frieze = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    F.box(0, H - 0.05, zb + 0.03, W, 0.05, 0.06, 0, P.woodD, P.wf);
    F.box(0, 0, zb + 0.03, W, 0.04, 0.06, 0, P.woodD, P.wf);
    const fh = H - 0.09;
    const key = 'frz:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.field;
    F.decal(0, 0.04, zb + 0.035, W - 0.04, fh, 0, key, function (g, cw, ch) {
      g.fillStyle = v ? E.band : E.field; g.fillRect(0, 0, cw, ch);
      g.fillStyle = E.edge; g.fillRect(0, 0, cw, ch * 0.1); g.fillRect(0, ch * 0.9, cw, ch * 0.1);
      const n = Math.max(3, Math.round(cw / ch * 1.2)), R = ch * 0.3;
      for (let i = 0; i < n; i++) {
        const cx = cw * (i + 0.5) / n, cy = ch / 2;
        if (i % 2 === 0 && K.hasSym(sym)) SYMBOLS[sym](g, cx, cy, R, v ? E.field : E.ink, E.ink2);
        else { g.fillStyle = v ? E.field : E.band; g.beginPath(); g.moveTo(cx, cy - R); g.lineTo(cx + R * 0.7, cy); g.lineTo(cx, cy + R); g.lineTo(cx - R * 0.7, cy); g.closePath(); g.fill(); }
      }
    }, P.cf);
    if (o.court) K.band(F, P, S, 0, H - 0.025, zb + 0.06, W - 0.3, 0.04, 0);
  };

  /* a hanging scroll: rollers top and bottom, a paper or hide field of glyph columns and a seal, or a painted scene */
  B.scroll = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    const hide = S.clothFam === 'hide' || S.clothFam === 'reed';
    const paper = hide ? F.css(F.col(S.cloth[3 % S.cloth.length])) : F.css(F.shade(P.clothL, 0.4)), ink = hide ? E.ink : F.css(F.shade(P.woodD, -0.5));
    const fam = hide ? P.cf : 'plaster';
    for (const y of [H - 0.04, 0.0]) { F.rod(-W / 2, y + 0.02, zb + 0.05, W / 2, y + 0.02, zb + 0.05, 0.022, P.woodD, P.wf); for (const s of [-1, 1]) F.ball(s * (W / 2 - 0.03), y + 0.02, zb + 0.05, 0.028, P.acc, P.af); }
    F.rod(-W * 0.35, H - 0.02, zb + 0.05, 0, H - 0.005, zb + 0.015, 0.006, P.rope, 'rope');
    F.rod(W * 0.35, H - 0.02, zb + 0.05, 0, H - 0.005, zb + 0.015, 0.006, P.rope, 'rope');
    const fh = H - 0.1;
    const key = 'scr:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.ink + paper;
    F.decal(0, 0.05, zb + 0.03, W - 0.06, fh, 0, key, function (g, cw, ch) {
      const r = K.paintRng(17 + v * 7 + (sym || '').length);
      g.fillStyle = paper; g.fillRect(0, 0, cw, ch);
      g.fillStyle = E.edge; g.fillRect(0, 0, cw, ch * 0.03); g.fillRect(0, ch * 0.97, cw, ch * 0.03);
      if (v === 0) {
        g.strokeStyle = ink; g.lineCap = 'round';
        const cols = Math.max(2, Math.floor(cw / 22));
        for (let c = 0; c < cols; c++) {
          const x = cw * (c + 0.5) / cols;
          let y = ch * 0.1;
          while (y < ch * 0.8) {
            const n = 1 + Math.floor(r() * 3);
            for (let k = 0; k < n; k++) { g.lineWidth = 1.2 + r() * 1.6; g.beginPath(); g.moveTo(x - 6 + r() * 4, y + k * 4); g.lineTo(x + 2 + r() * 5, y + 1 + k * 4 + r() * 3); g.stroke(); }
            y += 8 + n * 4 + r() * 6;
          }
        }
        if (K.hasSym(sym)) { g.fillStyle = E.field; g.fillRect(cw * 0.6, ch * 0.84, cw * 0.3, cw * 0.3); SYMBOLS[sym](g, cw * 0.75, ch * 0.84 + cw * 0.15, cw * 0.11, E.ink, E.ink2); }
      } else {
        if (K.hasSym(sym)) SYMBOLS[sym](g, cw / 2, ch * 0.28, cw * 0.3, E.ink, E.ink2);
        g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(cw * 0.08, ch * 0.62); g.lineTo(cw * 0.92, ch * 0.62); g.stroke();
        g.fillStyle = ink;
        for (let i = 0; i < 4; i++) { const x = cw * (0.2 + i * 0.2), y = ch * 0.62; g.beginPath(); g.arc(x, y - 22, 4, 0, Math.PI * 2); g.fill(); g.fillRect(x - 3, y - 17, 6, 14); g.fillRect(x - 5, y - 3, 3, 3); g.fillRect(x + 2, y - 3, 3, 3); }
        g.fillStyle = E.band; for (let i = 0; i < 6; i++) g.fillRect(cw * 0.1 + i * cw * 0.14, ch * 0.72, cw * 0.09, ch * 0.04);
      }
    }, fam);
  };

  /* a knotted rug hung on the wall: border, guard of lozenges, a medallion of the emblem, fringe at the foot */
  B.wallRug = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    F.rod(-W / 2, H - 0.03, zb + 0.04, W / 2, H - 0.03, zb + 0.04, 0.016, P.woodD, P.wf);
    const fh = H - 0.14;
    const key = 'rug:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + W.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.field;
    F.decal(0, 0.1, zb + 0.025, W - 0.04, fh, 0, key, function (g, cw, ch) {
      const r = K.paintRng(31 + v);
      g.fillStyle = v ? E.band : E.edge; g.fillRect(0, 0, cw, ch);
      const b = Math.min(cw, ch) * 0.1;
      g.fillStyle = E.ink2; g.fillRect(b * 0.5, b * 0.5, cw - b, ch - b);
      g.fillStyle = v ? E.edge : E.field; g.fillRect(b, b, cw - 2 * b, ch - 2 * b);
      g.fillStyle = E.band;
      for (let x = b * 1.5; x < cw - b * 1.5; x += b * 1.2) for (const y of [b * 1.3, ch - b * 1.3]) { g.beginPath(); g.moveTo(x, y - b * 0.35); g.lineTo(x + b * 0.35, y); g.lineTo(x, y + b * 0.35); g.lineTo(x - b * 0.35, y); g.closePath(); g.fill(); }
      const R = Math.min(cw, ch) * 0.26;
      g.fillStyle = E.band; g.beginPath(); g.moveTo(cw / 2, ch / 2 - R * 1.3); g.lineTo(cw / 2 + R * 1.3, ch / 2); g.lineTo(cw / 2, ch / 2 + R * 1.3); g.lineTo(cw / 2 - R * 1.3, ch / 2); g.closePath(); g.fill();
      if (E.disc) { g.fillStyle = E.disc; g.beginPath(); g.arc(cw / 2, ch / 2, R * 1.05, 0, Math.PI * 2); g.fill(); }
      if (K.hasSym(sym)) SYMBOLS[sym](g, cw / 2, ch / 2, R * 0.9, E.ink, E.ink2);
      for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(0,0,0,' + (0.03 + r() * 0.06).toFixed(3) + ')'; g.fillRect(r() * cw, r() * ch, 2 + r() * 3, 1 + r() * 2); }
    }, P.cf);
    for (let i = 0; i < Math.floor((W - 0.1) / 0.05); i++) F.box(-W / 2 + 0.07 + i * 0.05, 0.0, zb + 0.025, 0.02, 0.1, 0.008, 0, P.clothL, P.cf);
  };

  /* a string of pennants along a cord: alternating fields, the emblem on every second one */
  B.pennants = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    F.rod(-W / 2, H - 0.02, zb + 0.06, W / 2, H - 0.02, zb + 0.06, 0.006, P.rope, 'rope');
    for (const s of [-1, 1]) F.rod(s * (W / 2 - 0.01), H - 0.02, zb + 0.06, s * (W / 2 - 0.01), H - 0.01, zb + 0.012, 0.006, P.metal, P.mf);
    const n = Math.max(3, Math.floor(W / 0.34)), pw = (W - 0.06) / n, ph = H - 0.05;
    const fields = [E.field, E.band, E.edge];
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.03 + pw * (i + 0.5), f = fields[(i + v) % fields.length], withSym = i % 2 === 0;
      const key = 'pen:' + o.culture + ':' + (sym || 'none') + ':' + f + ':' + (withSym ? 1 : 0) + ':' + pw.toFixed(2) + 'x' + ph.toFixed(2);
      F.decal(x, H - 0.03 - ph, zb + 0.045, pw - 0.02, ph, 0, key, function (g, cw, ch) {
        g.fillStyle = f; g.beginPath(); g.moveTo(0, 0); g.lineTo(cw, 0); g.lineTo(cw / 2, ch); g.closePath(); g.fill();
        g.fillStyle = E.edge; g.fillRect(0, 0, cw, ch * 0.08);
        if (withSym && K.hasSym(sym)) SYMBOLS[sym](g, cw / 2, ch * 0.32, cw * 0.26, f === E.ink ? E.field : E.ink, E.ink2);
      }, P.cf);
    }
  };

  /* a painted hide or cloth stretched on a frame of poles: the emblem large, a procession or a hunt under it */
  B.paintedHanging = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const zb = -D / 2, sym = K.symbolOf(S, o.culture), E = K.emblemCols(F, S);
    const hideCol = F.css(F.col(S.cloth[3 % S.cloth.length]));
    for (const s of [-1, 1]) F.cyl(s * (W / 2 - 0.03), 0, zb + 0.05, 0.03, H, 0, P.woodD, P.wf);
    for (const y of [H - 0.06, 0.03]) F.rod(-W / 2 + 0.02, y + 0.03, zb + 0.05, W / 2 - 0.02, y + 0.03, zb + 0.05, 0.025, P.wood, P.wf);
    const fh = H - 0.3, fw = W - 0.24;
    for (let i = 0; i < 6; i++) { const t = (i + 0.5) / 6; F.rod(-fw / 2, 0.15 + t * fh, zb + 0.05, -W / 2 + 0.03, 0.17 + t * fh, zb + 0.05, 0.006, P.rope, 'rope'); F.rod(fw / 2, 0.15 + t * fh, zb + 0.05, W / 2 - 0.03, 0.17 + t * fh, zb + 0.05, 0.006, P.rope, 'rope'); }
    for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5; F.rod(-fw / 2 + t * fw, 0.15 + fh, zb + 0.05, -fw / 2 + t * fw + 0.02, H - 0.03, zb + 0.05, 0.006, P.rope, 'rope'); }
    const key = 'hid:' + o.culture + ':' + (sym || 'none') + ':' + v + ':' + fw.toFixed(2) + 'x' + fh.toFixed(2) + ':' + E.ink;
    F.decal(0, 0.15, zb + 0.05, fw, fh, 0, key, function (g, cw, ch) {
      const r = K.paintRng(53 + v * 3);
      g.fillStyle = hideCol; g.beginPath(); g.moveTo(cw * 0.04, ch * 0.08); g.lineTo(cw * 0.3, 0); g.lineTo(cw * 0.7, ch * 0.02); g.lineTo(cw * 0.97, ch * 0.1); g.lineTo(cw, ch * 0.6); g.lineTo(cw * 0.94, ch); g.lineTo(cw * 0.1, ch * 0.97); g.lineTo(0, ch * 0.5); g.closePath(); g.fill();
      for (let i = 0; i < 80; i++) { g.fillStyle = 'rgba(60,30,10,' + (0.03 + r() * 0.07).toFixed(3) + ')'; g.beginPath(); g.arc(r() * cw, r() * ch, 2 + r() * 6, 0, Math.PI * 2); g.fill(); }
      if (K.hasSym(sym)) SYMBOLS[sym](g, cw / 2, ch * 0.36, Math.min(cw, ch) * 0.26, E.ink, E.ink2);
      g.fillStyle = E.ink;
      const n = 5 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const x = cw * (0.12 + 0.76 * i / (n - 1)), y = ch * 0.8;
        if (v === 1 && i % 2) { g.fillRect(x - 10, y - 10, 20, 8); g.fillRect(x - 9, y - 2, 3, 7); g.fillRect(x + 6, y - 2, 3, 7); g.beginPath(); g.arc(x + 11, y - 12, 4, 0, Math.PI * 2); g.fill(); }
        else { g.beginPath(); g.arc(x, y - 16, 3.5, 0, Math.PI * 2); g.fill(); g.fillRect(x - 2.5, y - 12, 5, 9); g.fillRect(x - 4, y - 3, 2.5, 6); g.fillRect(x + 1.5, y - 3, 2.5, 6); g.fillRect(x + 3, y - 14, 1.5, 9); }
      }
      g.fillStyle = E.ink2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cw * (0.2 + i * 0.3), ch * 0.12, 3, 0, Math.PI * 2); g.fill(); }
    }, S.clothFam === 'hide' ? 'hide' : P.cf);
  };

  /* wall art: a mask, a mounted skull, a plate, a painted panel, a mosaic, a shield, antlers, a relief ... */
  B.art = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h, v = o.variant || 0;
    const kind = (v === 1 && S.art2) ? S.art2 : (S.art || 'plate'), zb = -D / 2;
    const R = Math.min(W, H) / 2;
    if (kind === 'mask') {
      F.box(0, H / 2 - R * 0.9, zb + 0.01, R * 1.3, R * 1.8, 0.02, 0, P.woodD, P.wf);
      K.disc(F, 0, H / 2, zb + 0.03, zb + 0.03 + Math.min(0.1, D * 0.4), R * 0.6, P.wood, P.wf);                 /* the face */
      const zf = zb + 0.03 + Math.min(0.1, D * 0.4);
      F.ball(0, H / 2 - R * 0.1, zf, R * 0.12, P.woodD, P.wf);                                                  /* nose */
      for (const s of [-1, 1]) F.ball(s * R * 0.25, H / 2 + R * 0.2, zf, R * 0.1, P.acc, P.af);                 /* eyes */
      F.box(0, H / 2 - R * 0.5, zf - 0.01, R * 0.5, R * 0.08, 0.02, 0, P.acc, P.af);                             /* mouth */
      for (let i = 0; i < 5; i++) F.cone(-R * 0.5 + i * R * 0.25, H / 2 + R * 0.6, zb + 0.06, R * 0.08, R * 0.38, 0, i % 2 ? P.acc : P.cloth[0], i % 2 ? P.af : P.cf);
    } else if (kind === 'skull' || kind === 'horns') {
      F.box(0, H / 2 - R * 0.8, zb + 0.01, R * 1.1, R * 1.6, 0.03, 0, P.woodD, P.wf);
      const sr = Math.min(R * 0.45, D / 2 - 0.05);
      if (kind === 'skull') {
        F.ball(0, H / 2 + R * 0.1, zb + 0.04 + sr, sr, P.acc, 'bone');
        F.box(0, H / 2 - R * 0.6, zb + 0.06, sr * 1.1, sr * 0.6, sr * 0.9, 0, F.shade(P.acc, -0.08), 'bone');
        for (const s of [-1, 1]) F.ball(s * sr * 0.4, H / 2 + R * 0.15, zb + 0.04 + sr * 1.7, sr * 0.22, P.woodD, P.wf);
      }
      for (const s of [-1, 1]) {
        F.rod(s * R * 0.35, H / 2 + R * 0.45, zb + 0.1, s * R * 0.95, H / 2 + R * 0.9, zb + 0.08, 0.03, F.shade(P.acc, -0.15), 'bone');
        F.rod(s * R * 0.95, H / 2 + R * 0.9, zb + 0.08, s * R * 0.7, H / 2 + R * 0.98, zb + 0.06, 0.02, F.shade(P.acc, -0.15), 'bone');
      }
    } else if (kind === 'panel' || kind === 'relief') {
      F.box(0, H / 2 - R * 0.98, zb + 0.01, W - 0.02, R * 1.96, 0.04, 0, P.woodD, P.wf);
      F.box(0, H / 2 - R * 0.85, zb + 0.05, W - 0.16, R * 1.7, 0.01, 0, kind === 'relief' ? P.stone : P.cloth[0], kind === 'relief' ? P.sf : P.cf);
      for (let i = 0; i < 3; i++) K.motifAt(F, P, S, -R * 0.55 + i * R * 0.55, H / 2, zb + 0.06, R * 0.5, 0);
      for (let i = 0; i < 2; i++) F.box(0, H / 2 + (i ? 1 : -1) * R * 0.65, zb + 0.062, W - 0.3, 0.02, 0.004, 0, P.acc, P.af);
    } else if (kind === 'mosaic') {
      F.box(0, H / 2 - R * 0.98, zb + 0.01, W - 0.02, R * 1.96, 0.03, 0, P.stone, P.sf);
      const n = 7, cs = (Math.min(W, H) - 0.14) / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const d = Math.hypot(i - 3, j - 3);
        const c = d < 1 ? P.acc : d < 2.5 ? P.cloth[0] : P.cloth[1 % P.cloth.length];
        F.box(-cs * 3 + i * cs, H / 2 - cs * 3.5 + j * cs, zb + 0.04, cs * 0.85, cs * 0.85, 0.006, 0, d < 1 ? c : F.shade(c, F.rr(-0.08, 0.08)), d < 1 ? P.af : 'ceramic');
      }
    } else if (kind === 'shield') {
      K.disc(F, 0, H / 2, zb + 0.03, zb + 0.06, R * 0.95, P.wood, P.wf);
      K.disc(F, 0, H / 2, zb + 0.06, zb + 0.08, R * 0.8, P.cloth[0], P.cf);
      F.ball(0, H / 2, zb + 0.08, Math.min(R * 0.2, D / 2 - 0.09), P.metal, P.mf);
      K.motifAt(F, P, S, 0, H / 2 + R * 0.5, zb + 0.08, R * 0.35, 0);
      for (const s of [-1, 1]) F.rod(s * R * 0.8, H / 2 - R * 0.5, zb + 0.02, s * R * 0.1, H / 2 + R * 0.8, zb + 0.02, 0.02, P.woodD, P.wf);
    } else if (kind === 'antler') {
      F.box(0, H / 2 - R * 0.5, zb + 0.01, R, R, 0.03, 0, P.woodD, P.wf);
      for (const s of [-1, 1]) {
        F.rod(s * R * 0.15, H / 2, zb + 0.08, s * R * 0.7, H / 2 + R * 0.7, zb + 0.12, 0.025, P.acc, 'bone');
        F.rod(s * R * 0.4, H / 2 + R * 0.35, zb + 0.1, s * R * 0.95, H / 2 + R * 0.4, zb + 0.14, 0.018, P.acc, 'bone');
        F.rod(s * R * 0.7, H / 2 + R * 0.7, zb + 0.12, s * R * 0.6, H / 2 + R * 0.98, zb + 0.1, 0.015, P.acc, 'bone');
      }
    } else if (kind === 'sunplate') {
      K.disc(F, 0, H / 2, zb + 0.02, zb + 0.04, R * 0.98, P.acc, P.af);
      K.disc(F, 0, H / 2, zb + 0.04, zb + 0.06, R * 0.55, F.shade(P.acc, 0.2), P.af);
      for (let i = 0; i < 12; i++) { const a = i * F.TAU / 12; F.ball(Math.cos(a) * R * 0.78, H / 2 + Math.sin(a) * R * 0.78, zb + 0.06, R * 0.06, P.woodD, P.wf); }
      F.ball(0, H / 2, zb + 0.07, R * 0.12, P.cloth[0], P.cf);
    } else {
      K.disc(F, 0, H / 2, zb + 0.02, zb + 0.04, R * 0.98, P.clay, P.clf);
      K.disc(F, 0, H / 2, zb + 0.04, zb + 0.05, R * 0.78, P.cloth[0], P.cf);
      K.disc(F, 0, H / 2, zb + 0.05, zb + 0.06, R * 0.35, P.acc, P.af);
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; K.motifAt(F, P, S, Math.cos(a) * R * 0.57, H / 2 + Math.sin(a) * R * 0.57, zb + 0.06, R * 0.2, 0, S.motif === 'none' ? 'dots' : S.motif); }
    }
  };

  /* floor ornament: a figure, an idol, a totem pole, an urn, a globe, a skull pole, an obelisk, a vase, a guardian beast */
  B.statue = function (F, S, o) {
    const P = K.pal(F, S), W = o.w, D = o.d, H = o.h;
    const kind = S.statue || 'figure', R = Math.min(W, D) / 2;
    const plinthH = Math.min(0.3, H * 0.2);
    F.box(0, 0, 0, W, plinthH, D, 0, P.stone, P.sf);
    K.band(F, P, S, 0, plinthH / 2, D / 2, W - 0.2, plinthH * 0.4, 0);
    const y0 = plinthH, bh = H - plinthH;
    if (kind === 'idol' || kind === 'guardian') {
      F.box(0, y0, 0, R * 1.4, bh * 0.45, R * 1.2, 0, P.acc, P.af);
      F.blob(0, y0 + bh * 0.62, 0, R * 0.7, bh * 0.4, 0, P.acc, P.af);
      for (const s of [-1, 1]) F.cone(s * R * 0.5, y0 + bh * 0.78, 0, R * 0.2, bh * 0.2, 0, F.shade(P.acc, -0.1), P.af);
      for (const s of [-1, 1]) F.ball(s * R * 0.3, y0 + bh * 0.68, R * 0.5, R * 0.1, P.woodD, P.wf);
      F.box(0, y0 + bh * 0.45, R * 0.4, R * 0.8, bh * 0.1, R * 0.4, 0, F.shade(P.acc, -0.2), P.af);
    } else if (kind === 'totem' || kind === 'skullpole') {
      F.cyl(0, y0, 0, R * 0.45, bh, 0, P.wood, P.wf);
      for (let i = 0; i < 3; i++) {
        const y = y0 + bh * (0.15 + i * 0.3);
        if (kind === 'skullpole') { F.ball(0, y + R * 0.4, R * 0.08, R * 0.4, P.acc, 'bone'); F.box(0, y, R * 0.2, R * 0.5, R * 0.3, R * 0.4, 0, F.shade(P.acc, -0.1), 'bone'); }
        else { F.box(0, y, 0, R * 1.6, bh * 0.22, R * 1.1, 0, i % 2 ? P.woodL : P.acc, i % 2 ? P.wf : P.af); K.motifAt(F, P, S, 0, y + bh * 0.11, R * 0.55, R * 0.8, 0); }
      }
      for (const s of [-1, 1]) F.beam(0, y0 + bh * 0.9, 0, s * (W / 2 - 0.02), y0 + bh * 0.98, 0, 0.08, 0.1, P.acc, P.af);
    } else if (kind === 'urn' || kind === 'vase') {
      F.frustum(0, y0, 0, R * 0.4, R * 0.9, bh * 0.45, 0, P.clay, P.clf, 16);
      F.frustum(0, y0 + bh * 0.45, 0, R * 0.9, R * 0.35, bh * 0.35, 0, F.shade(P.clay, 0.05), P.clf, 16);
      F.cyl(0, y0 + bh * 0.8, 0, R * 0.45, bh * 0.2, 0, F.shade(P.clay, -0.08), P.clf);
      F.cyl(0, y0 + bh * 0.42, 0, R * 0.91, bh * 0.06, 0, P.acc, P.af);
      K.band(F, P, S, 0, y0 + bh * 0.45, R * 0.88, R * 1.2, bh * 0.08, 0);
      if (kind === 'vase') for (let i = 0; i < 4; i++) { const a = i * 1.6; F.rod(0, y0 + bh * 0.9, 0, Math.cos(a) * R * 0.5, y0 + bh * 1.0, Math.sin(a) * R * 0.5, 0.01, P.rope, 'plant'); F.ball(Math.cos(a) * R * 0.5, y0 + bh * 1.0, Math.sin(a) * R * 0.5, R * 0.12, P.pick(), 'plant'); }
    } else if (kind === 'globe') {
      F.cyl(0, y0, 0, R * 0.5, bh * 0.1, 0, P.wood, P.wf);
      F.cyl(0, y0 + bh * 0.1, 0, R * 0.12, bh * 0.35, 0, P.wood, P.wf);
      F.ball(0, y0 + bh * 0.72, 0, R * 0.82, P.acc, P.af);
      F.rod(-R * 0.6, y0 + bh * 0.2, 0, R * 0.6, y0 + bh * 0.99, 0, 0.02, P.metal, P.mf);
    } else if (kind === 'obelisk') {
      F.frustum(0, y0, 0, R * 0.5, R * 0.3, bh * 0.85, 0, P.stone, P.sf, 4);
      F.cone(0, y0 + bh * 0.85, 0, R * 0.42, bh * 0.15, Math.PI / 4, P.acc, P.af);
      for (let i = 0; i < 3; i++) K.motifAt(F, P, S, 0, y0 + bh * (0.2 + i * 0.25), R * 0.48 - i * R * 0.06, R * 0.5, 0);
    } else {
      /* a standing figure, robed */
      F.frustum(0, y0, 0, R * 0.7, R * 0.4, bh * 0.55, 0, P.stone, P.sf, 10);
      F.cyl(0, y0 + bh * 0.55, 0, R * 0.42, bh * 0.22, 0, P.stone, P.sf);
      F.ball(0, y0 + bh * 0.87, 0, R * 0.26, F.shade(P.stone, 0.05), P.sf);
      F.dome(0, y0 + bh * 0.95, 0, R * 0.28, bh * 0.05, 0, P.acc, P.af);
      for (const s of [-1, 1]) F.beam(s * R * 0.35, y0 + bh * 0.72, 0, s * R * 0.2, y0 + bh * 0.45, R * 0.4, R * 0.18, R * 0.18, P.stone, P.sf);
      F.ball(0, y0 + bh * 0.47, R * 0.42, R * 0.12, P.acc, P.af);
    }
  };

/* ======== Roles per tier (FK.ROLES), materials and the registrar FK.set() ======== */
  /* ================================================================ roles and the registrar */
  const SIT = ['hall', 'tavern', 'court', 'bedroom', 'study', 'antechamber'];
  /* role: { type, setting, rooms, anchor, clear, w, d, h, variants, variantNames, uses, build, opts } */
  K.ROLES = {
    poor: [
      { role: 'bed', type: 'bed', rooms: ['bedroom', 'barracks'], clear: { front: 0.6 }, w: 1.0, d: 1.95, h: 0.5, variants: 2, variantNames: ['plain', 'with blanket'], uses: ['wood', 'cloth', 'rope'], build: 'bed' },
      { role: 'bench', type: 'bench', rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'yard'], setting: 'both', clear: { front: 0.6 }, w: 1.5, d: 0.36, h: 0.45, uses: ['wood', 'cloth', 'rope'], build: 'bench' },
      { role: 'stool', type: 'chair', rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'bedroom', 'study'], setting: 'both', clear: { front: 0.5 }, w: 0.42, d: 0.42, h: 0.45, uses: ['wood', 'cloth', 'rope'], build: 'chair', opts: { stool: true } },
      { role: 'table', type: 'table', rooms: ['hall', 'tavern', 'kitchen'], setting: 'both', clear: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 }, w: 1.6, d: 0.8, h: 0.76, variants: 2, variantNames: ['bare', 'with a runner'], uses: ['wood', 'cloth', 'accent'], build: 'table' },
      { role: 'chest', type: 'storage', rooms: ['bedroom', 'store', 'hall'], clear: { front: 0.6 }, w: 0.95, d: 0.5, h: 0.55, variants: 2, variantNames: ['plain', 'banded'], uses: ['wood', 'metal', 'accent'], build: 'chest' },
      { role: 'wall_shelves', type: 'shelf', rooms: ['kitchen', 'store', 'workshop'], anchor: 'wall', clear: { front: 0.6 }, w: 1.1, d: 0.3, h: 1.4, uses: ['wood', 'clay', 'cloth', 'rope'], build: 'wallShelves' },
      { role: 'store', type: 'storage', rooms: ['kitchen', 'store', 'hall', 'yard'], setting: 'both', clear: { front: 0.5 }, w: 1.0, d: 0.55, h: 0.75, uses: ['clay', 'cloth', 'rope', 'wood', 'metal', 'accent'], build: 'store' },
      { role: 'hearth', type: 'stove', rooms: ['kitchen', 'hall'], anchor: 'wall', clear: { front: 0.9 }, w: 1.3, d: 0.75, h: 1.7, uses: ['stone', 'clay', 'metal', 'accent', 'wood'], fire: true, build: 'hearth' },
      { role: 'fire', type: 'brazier', rooms: ['hall', 'tavern', 'yard', 'court'], setting: 'both', clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 0.7, d: 0.7, h: 0.9, uses: ['metal', 'stone', 'wood', 'accent', 'rope'], fire: true, build: 'fire' },
      { role: 'lamp', type: 'lamp', rooms: ['hall', 'bedroom', 'tavern', 'study', 'shrine', 'antechamber'], clear: {}, w: 0.3, d: 0.3, h: 1.4, uses: ['accent', 'metal', 'clay', 'stone', 'wood', 'rope'], fire: true, glass: true, plaster: true, build: 'lamp' },
      { role: 'mat', type: 'rug', rooms: ['hall', 'bedroom', 'shrine'], clear: {}, w: 1.8, d: 1.2, h: 0.03, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['cloth', 'accent'], reed: true, build: 'rug' },
      { role: 'counter', type: 'counter', rooms: ['tavern', 'market', 'store', 'hall'], setting: 'both', clear: { front: 0.9, back: 0.7 }, w: 2.0, d: 0.65, h: 1.0, variants: 2, variantNames: ['plain', 'decorated front'], uses: ['wood', 'clay', 'accent'], build: 'counter' },
      { role: 'workbench', type: 'workstation', rooms: ['workshop', 'yard'], setting: 'both', anchor: 'wall', clear: { front: 0.9 }, w: 1.5, d: 0.65, h: 0.9, uses: ['wood', 'metal', 'clay'], build: 'workbench' },
      { role: 'rack', type: 'rack', rooms: ['workshop', 'hall', 'barracks', 'store', 'antechamber'], anchor: 'wall', clear: { front: 0.6 }, w: 1.1, d: 0.3, h: 1.7, uses: ['wood', 'metal', 'accent', 'cloth', 'clay', 'rope'], build: 'rack' },
      { role: 'ladder', type: 'ladder', rooms: ['store', 'workshop', 'library', 'hall'], anchor: 'wall', clear: { front: 0.5 }, w: 0.5, d: 0.5, h: 2.2, uses: ['wood'], build: 'ladder' },
      { role: 'board', type: 'board', rooms: ['school', 'workshop', 'hall', 'study'], anchor: 'wall', clear: { front: 0.8 }, w: 1.2, d: 0.14, h: 1.5, uses: ['wood', 'stone', 'cloth', 'accent'], plaster: true, plastic: true, build: 'board' },
      { role: 'bowl', type: 'vessel', rooms: ['hall', 'kitchen', 'tavern'], anchor: 'surface', clear: {}, w: 0.32, d: 0.32, h: 0.18, variants: 2, variantNames: ['fruit', 'flatbread'], uses: ['clay', 'cloth', 'accent'], plant: true, build: 'bowl' },
      { role: 'jug', type: 'vessel', rooms: ['hall', 'kitchen', 'tavern', 'bedroom'], anchor: 'surface', clear: {}, w: 0.42, d: 0.26, h: 0.32, uses: ['clay', 'accent'], build: 'jug' }
    ],
    common: [
      { role: 'bed', type: 'bed', rooms: ['bedroom', 'barracks'], clear: { front: 0.6, left: 0.5 }, w: 1.15, d: 2.0, h: 0.95, variants: 2, variantNames: ['plain', 'with blanket'], uses: ['wood', 'cloth', 'rope', 'accent', 'stone'], build: 'bed' },
      { role: 'bench', type: 'bench', rooms: ['hall', 'tavern', 'kitchen', 'court', 'yard'], setting: 'both', clear: { front: 0.6 }, w: 1.6, d: 0.4, h: 0.9, variants: 2, variantNames: ['open', 'backed'], variantDims: [{ h: 0.48 }, { h: 0.9 }], uses: ['wood', 'cloth', 'rope', 'accent'], build: 'bench' },
      { role: 'chair', type: 'chair', rooms: ['hall', 'tavern', 'study', 'bedroom', 'library', 'school'], clear: { front: 0.5 }, w: 0.48, d: 0.48, h: 0.95, uses: ['wood', 'cloth', 'rope', 'accent'], build: 'chair' },
      { role: 'stool', type: 'chair', rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'bedroom'], setting: 'both', clear: { front: 0.5 }, w: 0.42, d: 0.42, h: 0.45, uses: ['wood', 'cloth', 'rope'], build: 'chair', opts: { stool: true } },
      { role: 'table', type: 'table', rooms: ['hall', 'tavern', 'kitchen', 'library'], setting: 'both', clear: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 }, w: 1.8, d: 0.9, h: 0.78, variants: 2, variantNames: ['bare', 'with a runner'], uses: ['wood', 'cloth', 'accent'], build: 'table' },
      { role: 'low_table', type: 'table', rooms: ['hall', 'bedroom', 'court', 'antechamber'], clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 1.0, d: 0.7, h: 0.42, uses: ['wood', 'accent'], build: 'lowTable' },
      { role: 'desk', type: 'desk', rooms: ['study', 'library', 'school', 'shrine'], anchor: 'wall', clear: { front: 0.8 }, w: 1.3, d: 0.65, h: 1.1, uses: ['wood', 'accent', 'clay', 'cloth'], plaster: true, build: 'desk' },
      { role: 'chest', type: 'storage', rooms: ['bedroom', 'store', 'hall'], clear: { front: 0.7 }, w: 1.1, d: 0.6, h: 0.65, variants: 2, variantNames: ['plain', 'banded'], uses: ['wood', 'metal', 'accent'], build: 'chest' },
      { role: 'bookcase', type: 'shelf', rooms: ['library', 'study', 'hall', 'store', 'shrine'], anchor: 'wall', clear: { front: 0.7 }, w: 1.4, d: 0.4, h: 2.0, uses: ['wood', 'cloth', 'clay', 'stone', 'metal', 'accent'], plaster: true, build: 'bookcase' },
      { role: 'wall_shelves', type: 'shelf', rooms: ['kitchen', 'store', 'workshop'], anchor: 'wall', clear: { front: 0.6 }, w: 1.2, d: 0.32, h: 1.5, uses: ['wood', 'clay', 'cloth', 'rope'], plant: true, build: 'wallShelves' },
      { role: 'store', type: 'storage', rooms: ['kitchen', 'store', 'hall', 'yard'], setting: 'both', clear: { front: 0.5 }, w: 1.0, d: 0.55, h: 0.85, uses: ['clay', 'cloth', 'rope', 'wood', 'metal', 'accent'], plant: true, build: 'store' },
      { role: 'hearth', type: 'stove', rooms: ['kitchen', 'hall', 'tavern'], anchor: 'wall', clear: { front: 0.9 }, w: 1.5, d: 0.8, h: 1.9, uses: ['stone', 'clay', 'metal', 'accent', 'wood'], fire: true, build: 'hearth' },
      { role: 'fire', type: 'brazier', rooms: ['hall', 'tavern', 'yard', 'court', 'shrine'], setting: 'both', clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 0.7, d: 0.7, h: 1.0, uses: ['metal', 'stone', 'wood', 'accent', 'rope'], fire: true, build: 'fire' },
      { role: 'lamp', type: 'lamp', rooms: ['hall', 'bedroom', 'tavern', 'study', 'shrine', 'antechamber', 'library'], clear: {}, w: 0.34, d: 0.34, h: 1.6, uses: ['accent', 'metal', 'clay', 'stone', 'wood', 'rope'], fire: true, glass: true, plaster: true, build: 'lamp' },
      { role: 'candle', type: 'lamp', rooms: ['hall', 'bedroom', 'study', 'shrine', 'tavern'], anchor: 'surface', clear: {}, w: 0.16, d: 0.16, h: 0.3, uses: ['clay', 'accent'], fire: true, plaster: true, build: 'candle' },
      { role: 'hanging', type: 'lamp', rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'shrine', 'antechamber'], anchor: 'ceiling', clear: {}, w: 0.5, d: 0.5, h: 1.0, uses: ['metal', 'accent', 'rope'], fire: true, glass: true, plaster: true, build: 'hanging' },
      { role: 'rug', type: 'rug', rooms: ['hall', 'bedroom', 'court', 'shrine', 'study'], clear: {}, w: 2.2, d: 1.5, h: 0.03, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['cloth', 'accent'], reed: true, build: 'rug' },
      { role: 'screen', type: 'screen', rooms: ['hall', 'bedroom', 'antechamber', 'court'], clear: { front: 0.4 }, w: 1.6, d: 0.5, h: 1.8, uses: ['wood', 'cloth', 'accent', 'rope'], reed: true, build: 'screen' },
      { role: 'counter', type: 'counter', rooms: ['tavern', 'market', 'store', 'hall'], setting: 'both', clear: { front: 1.0, back: 0.8 }, w: 2.3, d: 0.75, h: 1.05, variants: 2, variantNames: ['plain', 'decorated front'], uses: ['wood', 'clay', 'accent'], build: 'counter' },
      { role: 'workbench', type: 'workstation', rooms: ['workshop', 'yard'], setting: 'both', anchor: 'wall', clear: { front: 0.9 }, w: 1.6, d: 0.7, h: 0.9, uses: ['wood', 'metal', 'clay'], build: 'workbench' },
      { role: 'loom', type: 'loom', rooms: ['workshop', 'hall'], setting: 'both', anchor: 'wall', clear: { front: 1.0 }, w: 1.3, d: 0.9, h: 1.7, uses: ['wood', 'cloth', 'rope', 'accent'], build: 'loom' },
      { role: 'rack', type: 'rack', rooms: ['workshop', 'hall', 'barracks', 'store', 'antechamber'], anchor: 'wall', clear: { front: 0.6 }, w: 1.2, d: 0.35, h: 1.8, uses: ['wood', 'metal', 'accent', 'cloth', 'clay', 'rope'], build: 'rack' },
      { role: 'ladder', type: 'ladder', rooms: ['store', 'workshop', 'library', 'hall'], anchor: 'wall', clear: { front: 0.5 }, w: 0.5, d: 0.5, h: 2.3, uses: ['wood'], build: 'ladder' },
      { role: 'board', type: 'board', rooms: ['school', 'workshop', 'study', 'library'], anchor: 'wall', clear: { front: 0.8 }, w: 1.3, d: 0.14, h: 1.6, uses: ['wood', 'stone', 'cloth', 'accent'], plaster: true, plastic: true, build: 'board' },
      { role: 'art', type: 'art', rooms: ['hall', 'bedroom', 'tavern', 'shrine', 'antechamber', 'study'], anchor: 'wall', clear: {}, w: 0.7, d: 0.3, h: 0.7, variants: 2, variantNames: ['first', 'second'], uses: ['wood', 'clay', 'cloth', 'accent', 'metal', 'stone'], bone: true, ceramic: true, build: 'art' },
      { role: 'banner', type: 'banner', rooms: ['hall', 'tavern', 'shrine', 'antechamber', 'barracks', 'market'], anchor: 'wall', clear: {}, w: 0.7, d: 0.12, h: 2.0, variants: 2, variantNames: ['swallow-tail', 'fringed'], uses: ['wood', 'cloth', 'accent', 'metal'], build: 'banner' },
      { role: 'scroll', type: 'banner', rooms: ['hall', 'study', 'library', 'shrine', 'bedroom', 'school'], anchor: 'wall', clear: {}, w: 0.7, d: 0.12, h: 1.6, variants: 2, variantNames: ['glyph columns', 'painted scene'], uses: ['wood', 'cloth', 'accent', 'rope'], plaster: true, build: 'scroll' },
      { role: 'pennants', type: 'banner', rooms: ['hall', 'tavern', 'market', 'yard', 'antechamber'], setting: 'both', anchor: 'wall', clear: {}, w: 2.4, d: 0.12, h: 0.55, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['cloth', 'metal', 'rope'], build: 'pennants' },
      { role: 'bowl', type: 'vessel', rooms: ['hall', 'kitchen', 'tavern'], anchor: 'surface', clear: {}, w: 0.34, d: 0.34, h: 0.2, variants: 2, variantNames: ['fruit', 'flatbread'], uses: ['clay', 'cloth', 'accent'], plant: true, build: 'bowl' },
      { role: 'jug', type: 'vessel', rooms: ['hall', 'kitchen', 'tavern', 'bedroom'], anchor: 'surface', clear: {}, w: 0.44, d: 0.28, h: 0.34, uses: ['clay', 'accent'], build: 'jug' },
      { role: 'books', type: 'book', rooms: ['library', 'study', 'school', 'shrine', 'hall'], anchor: 'surface', clear: {}, w: 0.42, d: 0.32, h: 0.26, uses: ['cloth', 'accent', 'stone'], plaster: true, build: 'books' }
    ],
    court: [
      { role: 'bed', type: 'bed', rooms: ['bedroom'], clear: { front: 0.8, left: 0.6, right: 0.6 }, w: 1.8, d: 2.3, h: 2.3, variants: 2, variantNames: ['first hangings', 'second hangings'], uses: ['wood', 'cloth', 'accent'], build: 'bedFine' },
      { role: 'throne', type: 'chair', rooms: ['hall', 'court', 'shrine'], clear: { front: 1.0, left: 0.4, right: 0.4 }, w: 0.95, d: 0.85, h: 1.7, uses: ['wood', 'cloth', 'accent'], build: 'throne' },
      { role: 'divan', type: 'seating', rooms: ['hall', 'court', 'bedroom', 'antechamber'], setting: 'both', clear: { front: 0.8 }, w: 2.2, d: 0.95, h: 0.85, uses: ['wood', 'cloth', 'accent'], build: 'divan' },
      { role: 'table', type: 'table', rooms: ['hall', 'court', 'library'], clear: { front: 0.7, back: 0.7, left: 0.7, right: 0.7 }, w: 2.4, d: 1.0, h: 0.8, variants: 2, variantNames: ['bare', 'with a runner'], uses: ['wood', 'cloth', 'accent'], build: 'table', opts: { court: true } },
      { role: 'low_table', type: 'table', rooms: ['hall', 'bedroom', 'court', 'antechamber'], clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 1.1, d: 0.75, h: 0.45, uses: ['wood', 'accent'], build: 'lowTable', opts: { court: true } },
      { role: 'desk', type: 'desk', rooms: ['study', 'library', 'court'], anchor: 'wall', clear: { front: 0.9 }, w: 1.5, d: 0.7, h: 1.2, uses: ['wood', 'accent', 'clay', 'cloth'], plaster: true, build: 'desk', opts: { court: true } },
      { role: 'cabinet', type: 'storage', rooms: ['hall', 'bedroom', 'study', 'court', 'shrine'], anchor: 'wall', clear: { front: 0.8 }, w: 1.3, d: 0.55, h: 2.0, uses: ['wood', 'accent'], build: 'cabinet' },
      { role: 'bookcase', type: 'shelf', rooms: ['library', 'study', 'hall', 'court'], anchor: 'wall', clear: { front: 0.8 }, w: 1.6, d: 0.42, h: 2.3, uses: ['wood', 'cloth', 'clay', 'stone', 'metal', 'accent'], plaster: true, build: 'bookcase', opts: { court: true } },
      { role: 'hearth', type: 'stove', rooms: ['hall', 'court', 'bedroom', 'kitchen'], anchor: 'wall', clear: { front: 1.0 }, w: 1.8, d: 0.85, h: 2.2, uses: ['stone', 'clay', 'metal', 'accent', 'wood'], fire: true, build: 'hearth', opts: { court: true } },
      { role: 'fire', type: 'brazier', rooms: ['hall', 'court', 'shrine', 'antechamber'], setting: 'both', clear: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, w: 0.8, d: 0.8, h: 1.1, uses: ['metal', 'stone', 'wood', 'accent', 'rope'], fire: true, build: 'fire', opts: { court: true } },
      { role: 'lamp', type: 'lamp', rooms: ['hall', 'bedroom', 'court', 'study', 'shrine', 'antechamber', 'library'], clear: {}, w: 0.4, d: 0.4, h: 1.8, uses: ['accent', 'metal', 'clay', 'stone', 'wood', 'rope'], fire: true, glass: true, plaster: true, build: 'lamp' },
      { role: 'candelabra', type: 'lamp', rooms: ['hall', 'bedroom', 'court', 'study', 'shrine'], anchor: 'surface', clear: {}, w: 0.4, d: 0.2, h: 0.5, uses: ['accent'], fire: true, plaster: true, build: 'candle', opts: { court: true } },
      { role: 'hanging', type: 'lamp', rooms: ['hall', 'court', 'shrine', 'antechamber', 'bedroom', 'library'], anchor: 'ceiling', clear: {}, w: 0.7, d: 0.7, h: 1.2, uses: ['metal', 'accent', 'rope'], fire: true, glass: true, plaster: true, build: 'hanging' },
      { role: 'carpet', type: 'rug', rooms: ['hall', 'bedroom', 'court', 'shrine', 'study', 'antechamber'], clear: {}, w: 3.0, d: 2.1, h: 0.03, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['cloth', 'accent'], reed: true, build: 'rug', opts: { court: true } },
      { role: 'screen', type: 'screen', rooms: ['hall', 'bedroom', 'antechamber', 'court'], clear: { front: 0.4 }, w: 1.8, d: 0.55, h: 2.0, uses: ['wood', 'cloth', 'accent', 'rope'], reed: true, build: 'screen', opts: { court: true } },
      { role: 'tapestry', type: 'banner', rooms: ['hall', 'court', 'bedroom', 'shrine', 'antechamber', 'library'], anchor: 'wall', clear: {}, w: 1.6, d: 0.12, h: 2.1, variants: 4, variantNames: ['emblem', 'emblem, second field', 'woven device', 'banded, emblem row'], uses: ['wood', 'cloth', 'accent'], build: 'tapestry' },
      { role: 'banner', type: 'banner', rooms: ['hall', 'court', 'shrine', 'antechamber', 'library'], anchor: 'wall', clear: {}, w: 0.8, d: 0.12, h: 2.4, variants: 2, variantNames: ['swallow-tail', 'fringed'], uses: ['wood', 'cloth', 'accent', 'metal'], build: 'banner' },
      { role: 'frieze', type: 'banner', rooms: ['hall', 'court', 'antechamber', 'library', 'shrine'], anchor: 'wall', clear: {}, w: 2.6, d: 0.1, h: 0.7, variants: 2, variantNames: ['on the field', 'on the band'], uses: ['wood', 'cloth', 'accent'], build: 'frieze' },
      { role: 'wall_rug', type: 'banner', rooms: ['hall', 'court', 'bedroom', 'antechamber'], anchor: 'wall', clear: {}, w: 2.0, d: 0.1, h: 1.6, variants: 2, variantNames: ['first colours', 'second colours'], uses: ['wood', 'cloth', 'accent'], build: 'wallRug' },
      { role: 'scroll', type: 'banner', rooms: ['hall', 'court', 'study', 'library', 'shrine', 'bedroom'], anchor: 'wall', clear: {}, w: 0.8, d: 0.12, h: 1.9, variants: 2, variantNames: ['glyph columns', 'painted scene'], uses: ['wood', 'cloth', 'accent', 'rope'], plaster: true, build: 'scroll' },
      { role: 'painted_hanging', type: 'banner', rooms: ['hall', 'court', 'shrine', 'antechamber'], anchor: 'wall', clear: {}, w: 1.8, d: 0.12, h: 2.0, variants: 2, variantNames: ['procession', 'hunt'], uses: ['wood', 'cloth', 'accent', 'rope'], hide: true, build: 'paintedHanging' },
      { role: 'art', type: 'art', rooms: ['hall', 'court', 'bedroom', 'shrine', 'antechamber', 'study'], anchor: 'wall', clear: {}, w: 0.9, d: 0.4, h: 0.9, variants: 2, variantNames: ['first', 'second'], uses: ['wood', 'clay', 'cloth', 'accent', 'metal', 'stone'], bone: true, ceramic: true, build: 'art' },
      { role: 'statue', type: 'statue', rooms: ['hall', 'court', 'shrine', 'antechamber', 'library', 'yard'], setting: 'both', clear: { front: 0.5 }, w: 0.7, d: 0.7, h: 1.7, uses: ['stone', 'accent', 'wood', 'clay', 'metal', 'cloth'], bone: true, plant: true, build: 'statue' },
      { role: 'jug', type: 'vessel', rooms: ['hall', 'court', 'bedroom'], anchor: 'surface', clear: {}, w: 0.5, d: 0.3, h: 0.36, uses: ['clay', 'accent'], build: 'jug', opts: { court: true } },
      { role: 'bowl', type: 'vessel', rooms: ['hall', 'court'], anchor: 'surface', clear: {}, w: 0.38, d: 0.38, h: 0.2, variants: 2, variantNames: ['fruit', 'flatbread'], uses: ['clay', 'cloth', 'accent'], plant: true, build: 'bowl', opts: { court: true } }
    ]
  };

  /* the canonical materials a role's build can touch, from the style sheet's families */
  K.materialsFor = function (S, R) {
    const fams = new Set();
    for (const slot of (R.uses || [])) {
      if (slot === 'rope') fams.add('rope');
      else fams.add(S[SLOT_FAM[slot]] || SLOT_DEFAULT[SLOT_FAM[slot]]);
    }
    if (R.fire) fams.add('glow');
    if (R.glass) fams.add('glass');
    if (R.plant) fams.add('plant');
    if (R.plaster) fams.add('plaster');
    if (R.reed) fams.add('reed');
    if (R.bone) fams.add('bone');
    if (R.ceramic) fams.add('ceramic');
    if (R.plastic) fams.add('plastic');
    if (R.hide) fams.add('hide');
    if (S.tile && (R.build === 'hearth' || R.build === 'art')) fams.add('ceramic');
    if ((R.uses || []).indexOf('wood') >= 0 && (S.woodFam === 'bamboo' || S.legs === 'lashed' || S.motif === 'lash')) fams.add('rope');
    const out = new Set();
    for (const f of fams) out.add(FAMILY_TO_MATERIAL[f] || 'unassigned');
    return [...out].sort();
  };

  /* FK.set({ culture, tier, S, names?, dims?, override?, skip?, rooms?, prefix? }):
     registers every role of the tier as FURN entries keyed <culture>_<tier>_<role>. */
  K.set = function (spec) {
    const culture = spec.culture, tier = spec.tier || 'common', S = spec.S;
    const prefix = spec.prefix || (culture + '_' + tier + '_');
    const names = spec.names || {}, dims = spec.dims || {}, over = spec.override || {}, skip = spec.skip || [];
    const roles = K.ROLES[tier];
    const made = [];
    for (const R of roles) {
      if (skip.indexOf(R.role) >= 0) continue;
      const o = over[R.role] || {};
      const d = Object.assign({ w: R.w, d: R.d, h: R.h }, dims[R.role] || {}, o.w ? { w: o.w, d: o.d, h: o.h } : {});
      const build = o.build || B[R.build];
      const opts = Object.assign({}, R.opts || {}, o.opts || {});
      const entry = {
        key: prefix + R.role, name: o.name || names[R.role] || (FURN_CULTURE_INFO[culture] ? FURN_CULTURE_INFO[culture].name : culture) + ' ' + R.role.replace(/_/g, ' '),
        culture: culture, tier: tier, type: o.type || R.type, setting: o.setting || R.setting || 'indoor',
        rooms: (o.rooms || (spec.rooms && spec.rooms[R.role]) || R.rooms).slice(), anchor: o.anchor || R.anchor || 'floor',
        clearance: Object.assign({}, o.clearance || R.clear || {}),
        materials: o.materials || K.materialsFor(S, R),
        w: d.w, d: d.d, h: d.h, variants: o.variants || R.variants || 1,
        variantNames: o.variantNames || R.variantNames,
        variantDims: o.variantDims || (R.variantDims && !o.w ? R.variantDims.map(function (vd) { return Object.assign({ w: d.w, d: d.d, h: d.h }, vd); }) : undefined),
        role: R.role, kit: true,
        build: function (F) { const vd = entry.variantDims && entry.variantDims[F.variant] || d; build(F, S, Object.assign({ w: vd.w, d: vd.d, h: vd.h, variant: F.variant, court: tier === 'court', culture: culture }, opts)); }
      };
      if (entry.variantNames && entry.variantNames.length !== entry.variants) entry.variantNames = undefined;
      FURN(entry);
      made.push(entry.key);
    }
    return made;
  };
  return K;
})();
