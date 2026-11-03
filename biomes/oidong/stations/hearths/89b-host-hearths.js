// ================================================================= HOST — the Cold Hearths, after the atmosphere is bound (89a): the snow off the warm ground, the steam, the engine
// THE SNOW: snow that lies (89a) never lies on ground over 0 degC (KTHERM's snow mask: ATMOS.snowBare), so in a snowfall the disc stays bare and dark in a
// white country, its edge the 0 degree contour (biomes/hearths/PLAN.md section 6). Before the materials compile (the bake is in 89z).
if(ATMOS.snowBare){try{ATMOS.snowBare(THERM.snowMask({box:THERM_BOX,cell:8}));}catch(e){reportErr('snow bare: '+e.stack);}}
// THE STEAM: core/atmos's steam on the fumaroles (a ring of mouths round the vent) and a thin column over the disc; one cloud, no per-frame CPU work
const STEAM=(function(){const L=[];for(let k=0;k<7;k++){const a=k/7*TAU+.4,r=k?6+3*(k%3):0,x=VENT.x+Math.cos(a)*r,z=VENT.z+Math.sin(a)*r;L.push([x,terrainH(x,z)+.4,z,'steam']);}
 for(let k=0;k<5;k++){const a=k/5*TAU+1.1,r=34+12*(k%2),x=VENT.x+Math.cos(a)*r,z=VENT.z+Math.sin(a)*r;L.push([x,terrainH(x,z)+2,z,'steam']);}
 try{return ATMOS.smoke(L,{n:18});}catch(e){reportErr('steam: '+e.stack);return null;}})();
// THE ENGINE (HEARTH.work): the fans open flat by night and in an eclipse (ATMOS.sunHidden at this site), fold into silver spindles by day; cloud closes them.
// One write a frame to the breath's shared state; every fan's material reads it (core/biome 35, mode 'breath', shape 'fold')
const WORK={value:0};
tick(()=>{const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI;
 const t=ATMOS.clock?ATMOS.clock.t||0:0,hid=ATMOS.sunHidden?ATMOS.sunHidden(t):0,W=ATMOS.W||null;
 WORK.value=HEARTH.work(t,{sunAlt:sun.intensity<.02?-20:alt,hidden:hid,W:W?{cloud:W.cloud==null?0:W.cloud}:null,atm:.93});
 BIO.breathState('hearths').value=WORK.value;});
