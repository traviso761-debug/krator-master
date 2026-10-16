/* ======================== Ancients interiors: the audit ========================
   AI.audit(res, cat) -> { ok, fails: [text], n }: a recipe's result checked again from scratch, the way verify.py
   reads it. Every key is in the catalog; every piece stands inside the room; no two solid pieces share floor at an
   overlapping height (a piece on another's surface, and flat rugs, excepted); nothing solid below 2 m stands in the
   door's way or on reserved floor; the recipe's minimum counts are met; no role of the dress is missing.
   ====================================================================== */
(function (AI) {
  'use strict';
  const G = AI._geo, TOL = 0.03;
  AI.audit = function (res, cat) {
    const fails = [], known = {};
    for (const e of cat.list()) known[e.key] = true;
    const P = res.placements, quads = [];
    for (const p of P) {
      if (!known[p.key]) { fails.push(p.role + ': no catalog key ' + p.key); quads.push(null); continue; }
      const dm = cat.dims(p.key, p.v), q = G.corners(p.x, p.z, dm.w, dm.d, p.ry);
      quads.push(q);
      for (const c of q) if (Math.abs(c[0]) > res.w / 2 + TOL || Math.abs(c[1]) > res.d / 2 + TOL) { fails.push(p.role + ' (' + p.key + ') outside the room'); break; }
    }
    for (let i = 0; i < P.length; i++) {
      if (!quads[i] || P[i].flat) continue;
      if (res.door && P[i].y < 2.0) {
        const dr = res.door, dq = G.rectQuad(dr.x - dr.w / 2 - 0.2, dr.x + dr.w / 2 + 0.2, res.d / 2 - 1.4, res.d / 2 + 1);
        if (G.overlap(quads[i], dq, 0.01)) fails.push(P[i].role + ' in the doorway');
      }
      for (const r of res.reserved) if (G.overlap(quads[i], G.rectQuad(r.x0, r.x1, r.z0, r.z1), 0.01)) fails.push(P[i].role + ' on the ' + r.what);
      for (let j = i + 1; j < P.length; j++) {
        if (!quads[j] || P[j].flat || P[i].on === j || P[j].on === i) continue;
        if (G.yOverlap(P[i], P[j]) && G.overlap(quads[i], quads[j], 0.01)) fails.push(P[i].role + ' #' + i + ' overlaps ' + P[j].role + ' #' + j);
      }
    }
    const R = AI.RECIPES[Object.keys(AI.RECIPES).find(k => AI.RECIPES[k].name === res.name)];
    if (R && R.min) for (const role in R.min) if ((res.counts[role] || 0) < R.min[role]) fails.push(role + ': ' + (res.counts[role] || 0) + ' < ' + R.min[role]);
    for (const role of res.missing) fails.push('dress role ' + role + ' has no catalog piece');
    return { ok: !fails.length, fails, n: P.length };
  };
})(KratorAncientsInteriors);
