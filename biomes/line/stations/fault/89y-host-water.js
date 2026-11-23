// ================================================================= HOST — the low point's water: core/water's still surface over the east bore
// After 89x (core/water draws through core/atmos's binding). The flood at the east bore's low point past the fault: still, dark, 0.9 m deep.
const FLOODW=(function(){if(typeof WATER==='undefined'||!WATER.still)return null;const F=LINE.FLOOD;
 const S=WATER.still({name:'The low point (the east bore flooded 0.9 m deep)',level:F.level,bounds:[F.x0,F.z0,F.x1,F.z1]});
 try{const D=WATER.drawStill(S,{color:0x3a4640,roughness:.1});D.mesh.userData.inspectLabel=S.name;D.mesh.userData.probeSkip=true;return D;}catch(e){reportErr('flood: '+e.message);return null;}})();
window._flood=!!FLOODW;
