// ================================================================= HOST — the sump's water: core/water's still surface over the trench
// After 89x (core/water draws through core/atmos's binding). The sump: seepage across the chamber's low ground, milky grey-green, waded at 0.65 m.
const SUMP=(function(){if(typeof WATER==='undefined'||!WATER.still)return null;const P=LINE.POOL;
 const S=WATER.still({name:'The sump (seepage across the chamber\'s low ground, waded)',level:LINE.LEVEL,bounds:[P.x0,P.z0,P.x1,P.z1]});
 try{const D=WATER.drawStill(S,{color:0x4a5a52,roughness:.12});D.mesh.userData.inspectLabel=S.name;D.mesh.userData.probeSkip=true;return D;}catch(e){reportErr('sump: '+e.message);return null;}})();
window._sump=!!SUMP;
