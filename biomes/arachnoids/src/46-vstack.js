// ================================================================= HOST — native vertical-stack BIO LOD & M2 mipVariance setup [web]
{
 const _vq = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
 if (typeof BIO !== "undefined") {
  BIO.INDEX_ITEMS = _vq.get("index") !== "0";
  if (BIO.LOD) {
   BIO.LOD.merge = _vq.get("lodmerge") !== "0";
   BIO.LOD.minTris = 1800;
   BIO.LOD.fade = (BIO.LOD.merge && _vq.get("lodfade") !== "0") ? 0.15 : 0;
   BIO.LOD.cull = BIO.LOD.fade > 0 && _vq.get("lodcull") !== "0";
  }
 }
 if (typeof KMAT !== "undefined" && KMAT.packed && typeof KMAT_MIPVAR !== "undefined") {
  for (const fk in KMAT_MIPVAR) {
   const L = KMAT.packed("arachnoids", fk);
   if (L && !L.mipVariance) L.mipVariance = KMAT_MIPVAR[fk];
  }
 }
}
