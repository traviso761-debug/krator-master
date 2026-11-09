// ================================================================= HOST — the vent line's steam and the Hearths' engine (Godshearth, station 1), after the air is bound
// THE STEAM: core/atmos's steam on the vent line's fumaroles (47b: GH_FUM), steady; the geyser field's own steam is the geyser kit's (65).
// THE ENGINE (HEARTH.work): the fans open flat by night and in an eclipse (ATMOS.sunHidden at this site), fold into silver spindles by day; cloud closes
// them; the floor's air is 1.01 atm, so thin air takes nothing off. One write a frame to the breath's shared state; every fan's material reads it
// (core/biome 35, mode 'breath', shape 'fold'). Under the owner's climate the nights are cold and clear, so the grove works every night, hardest in winter.
const GH_STEAM=(function(){try{return ATMOS.smoke(GH_FUM.map(f=>[f.x,terrainH(f.x,f.z)+.4,f.z,'steam']),{n:16});}catch(e){reportErr('steam: '+e.stack);return null;}})();
const GH_WORK={value:0};
if(typeof HEARTH!=='undefined')tick(()=>{const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI;
 const t=ATMOS.clock?ATMOS.clock.t||0:0,hid=ATMOS.sunHidden?ATMOS.sunHidden(t):0,W=ATMOS.W||null;
 GH_WORK.value=HEARTH.work(t,{sunAlt:sun.intensity<.02?-20:alt,hidden:hid,W:W?{cloud:W.cloud==null?0:W.cloud}:null,atm:1});
 BIO.breathState('hearths').value=GH_WORK.value;});
