/* ======================== h3 hash for KratorSky ========================
   h3: the hash KratorSky (81-sky.js, vendored from settlements/iziz/src)
   reads for its star field and gas-giant bands. In the Ancients-lineage
   builds it lives in 10-core.js; the catalog has no core, so it is here.
   ====================================================================== */
function h3(x, y, z) { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); }
