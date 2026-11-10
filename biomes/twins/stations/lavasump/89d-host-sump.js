// ================================================================= HOST — the Red Cistern's lava pond drawn (station 3): core/atmos fx lava
// Once the atmosphere is bound (89a): one disc at the pond's level on core/atmos's lava shader (fx/89-atmos-fx-lava.js: ATMOS.lavaMaterial, the
// Godthrone's lake's way, biomes/godthrone/src/89c-host-lake.js): plates of crust, glowing cracks, overturns; the library's lava crust for the
// grain (materials.json lavaCrust). Its record (the hazard) is 87's, registered before it is drawn.
const POND_DRAW=(function(){if(typeof ATMOS==='undefined'||!ATMOS.lavaMaterial)return null;
 try{const sd=SKY.state&&SKY.state.sunDir?SKY.state.sunDir:[.4,.8,.3],D=[sd.x==null?sd[0]:sd.x,sd.y==null?sd[1]:sd.y,sd.z==null?sd[2]:sd.z];
  const M=ATMOS.lavaMaterial({name:POND.name,centre:[0,0],sun:D,crust:hostGroundLib('lavaCrust',null),scale:.35,crack:1.3,heat:1.25});
  const g=new THREE.CircleGeometry(POND.r+1,96);g.rotateX(-Math.PI/2);g.translate(0,POND.level,0);
  const mesh=new THREE.Mesh(g,M);mesh.renderOrder=1;mesh.userData.inspectLabel=POND.name;scene.add(mesh);
  window._pond={r:POND.r,level:POND.level,T:POND.T};return{mesh,M};}
 catch(e){reportErr('pond: '+e.stack);return null;}})();
