/* [web] Tune core/lod chunking & screen-error thresholds on the object 94-hl-anim.js created before 97-lod-auto.js runs. */
if (window.LOD_OPTIONS && typeof window.LOD_OPTIONS === 'object') {
  window.LOD_OPTIONS.errPx = 4.5;
  window.LOD_OPTIONS.minPx = 1.6;
  window.LOD_OPTIONS.maxExtent = 180;
}
