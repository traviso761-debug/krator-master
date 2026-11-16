// ================================================================= HOST — the stair's hearth, after the atmosphere is bound (89a): the steam and the engine
// THE STEAM (core/atmos fx/smokegroups): the fumaroles' steam round the vent, steady, and a thin column over the disc that thickens with the night's
// work; the warm spring breathes a little. THE ENGINE (HEARTH.work, biomes/hearths): the fans open flat by night and in an eclipse (ATMOS.sunHidden at
// this site), fold into silver spindles by day; cloud closes them. One write a frame to the breath's shared state (core/biome 35, mode 'breath',
// shape 'fold'), as the Cold Hearths' page does (biomes/oidong/stations/hearths/89b-host-hearths.js). The snow: KTHERM's snow mask is in the ground's
// own snow field (45b: MODEL.fieldsAt), not ATMOS.snowCover's (its own texture unit would take the ground past 15).
const STEAM=(function(){const L=[];for(let k=0;k<8;k++){const a=k/8*TAU+.3,r=k?7+4*(k%3):0,x=VENT.x+Math.cos(a)*r,z=VENT.z+Math.sin(a)*r;L.push([x,terrainH(x,z)+.4,z,'steam']);}
 const S=[];for(let k=0;k<6;k++){const a=k/6*TAU+1.1,r=45+20*(k%2),x=VENT.x+Math.cos(a)*r,z=VENT.z+Math.sin(a)*r;S.push([x,terrainH(x,z)+3,z,'steam']);}
 S.push([SPRING.x,terrainH(SPRING.x,SPRING.z)+.3,SPRING.z,'steam']);
 try{return ATMOS.smokeGroups?ATMOS.smokeGroups({vents:{emitters:L,n:18,k:.7},disc:{emitters:S,n:14,k:0}}):ATMOS.smoke(L.concat(S),{n:18});}catch(e){reportErr('steam: '+e.stack);return null;}})();
const WORK={value:0};
tick(()=>{const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI;
 const t=ATMOS.clock?ATMOS.clock.t||0:0,hid=ATMOS.sunHidden?ATMOS.sunHidden(t):0,W=ATMOS.W||null;
 WORK.value=HEARTH.work(t,{sunAlt:sun.intensity<.02?-20:alt,hidden:hid,W:W?{cloud:W.cloud==null?0:W.cloud}:null,atm:1.14});
 BIO.breathState('hearths').value=WORK.value;if(STEAM&&STEAM.set)STEAM.set('disc',.15+.6*WORK.value);});
// the vent's heat as a hazard (core/hazard's ambient words; the hottest ground a hearth cannot stand)
REGISTER({name:VENT.name,x:VENT.x,z:VENT.z,y:terrainH(VENT.x,VENT.z)-2,r:24,h:8,tags:{hazard:{kind:'heat',danger:.5,falloff:'linear',shape:{type:'cyl',r:16,h:6},radiant:{reach:6}}}});
