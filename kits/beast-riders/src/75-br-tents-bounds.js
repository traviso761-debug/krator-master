// prefix: brt
/* ======================================================================
   The Beast Riders' tents (5): BOUNDARIES (owner, 2026-10-19: "each band's pasture and camp sits inside its own thorn
   hedge"). Parametric pieces a settlement lays along a polyline (BR_RUN, 79-br-camp.js, cuts the line into pieces and
   gives each its place, turn, length and seed); each is a stretch along local x, centred on the origin:
     br_hedge_thorn   a cut-thorn barrier (a boma) on stakes: (v0) a run, its length F.span (default 8 m), joinable end
                      to end; (v1) a gate: a woven thorn leaf on a frame between two carved posts, stubs of brush either side
     br_fence_rail    a pasture's split-rail fence: (v0) a run, its length F.span (default 8 m); (v1) a field gate of rails
                      with its brace, swung half open, between carved posts
   The brush is hashed from each branch's own index along the piece (brtU), so a run cut at any length is the same brush.
   The thorn has no library set of its own (core/materials/PROMPTS-NEEDED.md, `foliage.thorn.cut`): it takes 'bark'.
   ====================================================================== */

ASSET({
  key: 'br_hedge_thorn', name: 'Thorn hedge (cut thorn on stakes)', culture: 'beast-rider', family: 'defensive',
  types: ['infrastructure'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'thorn-hedge', role: 'boundary' },
  span: { default: 8, gate: 7 }, w: 8.4, d: 4.6, h: 3.6, variants: 2, variantNames: ['a run (its length the span, default 8 m)', 'a gate: a woven thorn leaf between carved posts'],
  variantDims: [{ w: 8.4, d: 2, h: 2.1 }, { w: 7.4, d: 4.6, h: 3.6 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), L = F.span > 0 ? F.span : (v ? 7 : 8), h = 1.75, t = 1.5;
    if (!v) { brtThorn(F, B, -L / 2, L / 2, h, t, 0); B.flush(); return; }
    const g = 2.0;
    brtThorn(F, B, -L / 2, -g - 0.25, h, t, 0); brtThorn(F, B, g + 0.25, L / 2, h, t, 7);
    for (const s of [-1, 1]) { brmPost(F, s * g, 0, 0, 2.7, 0.3, BRM.red, BRM.gilt); brmFinial(F, s * g, 2.7, 0, s, 0, 0.45, BRM.deep); }
    /* the leaf: a frame of poles hinged on the west post, swung 70 degrees in, thorn lashed over it */
    const ga = 1.2, w = 2 * g - 0.2, ux = Math.cos(ga), uz = -Math.sin(ga), x0 = -g + 0.1, P = function (s, y, n) { return [x0 + ux * s - uz * ((n == null ? 0 : n)), y, uz * s + ux * ((n == null ? 0 : n))]; };
    const fr = function (a, b, r) { B.stick(BRTN.poleDark, BRT_LASH, [a[0], a[1], a[2], b[0], b[1], b[2], (r == null ? 0.05 : r)]); };
    fr(P(0, 0.05), P(0, 1.85)); fr(P(w, 0.05), P(w, 1.85)); fr(P(0, 0.2), P(w, 0.2)); fr(P(0, 1.0), P(w, 1.0)); fr(P(0, 1.8), P(w, 1.8)); fr(P(0, 0.2), P(w, 1.8), 0.04);
    for (let i = 0; i < Math.round(w * 9); i++) {
      const U = function (k) { return brtU(F, 131, i, k); }, s = w * (i + U(0)) / Math.round(w * 9), y = 0.1 + U(1) * 1.6, l = 0.6 + U(2) * 0.8, a = (U(3) - 0.5) * 2.6, n = (U(4) - 0.5) * 0.4;
      const p = P(s, y, n), q = P(Math.max(-0.1, Math.min(w + 0.1, s + Math.sin(a) * l)), Math.max(0.05, Math.min(2.05, y + Math.cos(a) * l * 0.6)), n + (U(5) - 0.5) * 0.3);
      B.stick(U(6) < 0.4 ? BRTN.thornDry : BRTN.thorn, BRT_THORN, [p[0], p[1], p[2], q[0], q[1], q[2], 0.028, 0.006]);
    }
    B.stick(BRTN.poleDark, BRT_LASH, [-g, 2.45, 0, g, 2.45, 0, 0.09]);
    B.flush();
  }
});

ASSET({
  key: 'br_fence_rail', name: 'Pasture rail fence', culture: 'beast-rider', family: 'farm',
  types: ['farm', 'infrastructure'], districts: ['pasture'], wealth: [0, 1], tags: { style: 'split-rail', role: 'boundary' },
  span: { default: 8, gate: 5 }, w: 8.4, d: 2.4, h: 2.8, variants: 2, variantNames: ['a run (its length the span, default 8 m)', 'a field gate between carved posts'],
  variantDims: [{ w: 8.4, d: 0.6, h: 2.1 }, { w: 5.4, d: 2.4, h: 2.8 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), L = F.span > 0 ? F.span : (v ? 5 : 8);
    if (!v) { brtRail(F, B, -L / 2, 0, L / 2, 0, 1.6, 3); B.flush(); return; }
    const g = 1.9;
    if (L / 2 > g + 0.4) { brtRail(F, B, -L / 2, 0, -g - 0.15, 0, 1.6, 3); brtRail(F, B, g + 0.15, 0, L / 2, 0, 1.6, 3); }
    for (const s of [-1, 1]) brmPost(F, s * g, 0, 0, 2.4, 0.26, BRM.red, BRM.gilt);
    const ga = 0.6, w = 2 * g - 0.3, ux = Math.cos(ga), uz = Math.sin(ga), x0 = -g + 0.15;
    const P = function (s, y) { return [x0 + ux * s, y, uz * s]; };
    for (const y of [0.35, 0.8, 1.25, 1.65]) { const a = P(0, y), b = P(w, y); B.stick(BRTN.rail, BRT_LASH, [a[0], a[1], a[2], b[0], b[1], b[2], 0.055]); }
    for (const s of [0.05, w - 0.05]) { const a = P(s, 0.2), b = P(s, 1.75); B.stick(BRTN.poleDark, BRT_LASH, [a[0], a[1], a[2], b[0], b[1], b[2], 0.06]); }
    { const a = P(0.1, 0.35), b = P(w - 0.1, 1.65); B.stick(BRTN.rail, BRT_LASH, [a[0], a[1], a[2], b[0], b[1], b[2], 0.05]); }
    B.flush();
  }
});
