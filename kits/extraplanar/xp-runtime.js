/* ======================================================================
   Krator Extraplanar: the API (kits/extraplanar/xp-runtime.js)

   What extraplanar_bundle.py returns as the single global `KratorExtraplanar`: the hunters through the mechs
   runtime's calls by the same names (KM_API, inside this closure: its MECH registry holds this kit's culture alone),
   the records (XP), the drawing (XPDRAW) and the far tier. API.md is the contract.

     KratorExtraplanar.list / build(key, {seed, variant}) / update(g, dt, {ground}) / setState / attack / speed / state /
       feet / point / reset / lights / audit / clip / dataOf / tagsOf / useTextures / setDetail / dispose     the hunters
     KratorExtraplanar.projectile('gaze' | ...)        the Haloed's beam; the mechs' kinds pass through
     KratorExtraplanar.silhouetteOf(key)                { set, h } for a hunter (the entry's own, or XP.silhouette's)
     KratorExtraplanar.phenomenon / portal / pose / openness / through / humAt / tintAt / registry / VOCAB / SILHOUETTES / silhouette
     KratorExtraplanar.draw                             XPDRAW: phenomenon(rec, R), portal(rec, R), weather(g, ATMOS), tick(g, t, eye)
     KratorExtraplanar.far(set, h), .farFace(mesh, eye) the shared silhouette card
     KratorExtraplanar.XP                               the records module itself (the node test's)
   ====================================================================== */
const XP_API = (function () {
  'use strict';
  const K = KM_API, A = { version: 1, kit: 'extraplanar' };
  for (const k of ['list', 'has', 'get', 'tagsOf', 'dataOf', 'clip', 'audit', 'cultures', 'palette', 'build', 'update', 'setState', 'attack', 'state',
    'speed', 'reset', 'feet', 'point', 'lights', 'dispose', 'useTextures', 'setDetail', 'CLASSES', 'TYPES', 'DRIVES', 'PILOTS', 'WEAPONS', 'BUCKETS']) A[k] = K[k];
  A.projectile = function (kind) { return kind === 'gaze' ? XPDRAW.gazeRod() : K.projectile(kind); };
  A.silhouetteOf = function (key) {
    const E = K.get(key);
    if (!E) return null;
    if (E.silhouette && E.silhouette.set) return { set: E.silhouette.set, h: E.silhouette.h == null ? E.h : E.silhouette.h };
    const s = XP.silhouette(key);
    return s ? { set: s, h: E.h } : null;
  };
  A.hunters = function () { return K.list().map(function (e) { return Object.assign({ silhouette: A.silhouetteOf(e.key) }, e); }); };
  for (const k of ['phenomenon', 'portal', 'pose', 'openness', 'through', 'humAt', 'tintAt', 'registry', 'VOCAB', 'SILHOUETTES', 'silhouette', 'silhouetteBox', 'NAMES', 'TINTS', 'u']) A[k] = XP[k];
  A.XP = XP;
  A.draw = XPDRAW;
  A.far = XPDRAW.card;
  A.farFace = XPDRAW.face;
  return A;
})();
