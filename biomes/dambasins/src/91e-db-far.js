// ================================================================ DAM BASINS — the land past the ground's grid (2026-11-08)
// The kit's terrain grid ends 11.5 km either side and 9.5 km landward (71-port-terrain.js portBuildTerrain), inside the
// camera's 14 km reach, so from any height the sky's dark lower half showed past it (the graveyard's overview: a black band
// under the horizon). core/terrain's far field (KFAR) carries the same land (DB_NAT: the bed, its marks and the station's
// shape) on to 16 km on a coarse lattice, sunk under the grid where they overlap, coloured by the bed's own tint
// (dbGroundTint), fogged by the scene. Host-only; ?far=0 none.
const DB_FAR=(()=>{if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined'||!PORT_ST.grid)return null;
 const Gd=PORT_ST.grid,gx0=Gd.xs[0],gx1=Gd.xs[Gd.nx-1],gz0=Gd.zs[0],gz1=Gd.zs[Gd.nz-1],SINK=14;
 const inside=(x,z)=>x>gx0&&x<gx1&&z>gz0&&z<gz1;
 const G=KFAR.grid({lines:KFAR.lines({cell:240,inner:Math.min(-gx0,gx1,-gz0,gz1)-480,out:16000,grow:1.06}),dense:true,
  h:(x,z)=>inside(x,z)?terrainH(x,z)-SINK:DB_NAT(x,z),
  skip:(x0,z0,x1,z1)=>x0>gx0+240&&x1<gx1-240&&z0>gz0+240&&z1<gz1-240,   /* none wholly under the grid */
  color:(x,z,y)=>{const s=1.5,sl=Math.min(3,Math.hypot(DB_NAT(x+s,z)-DB_NAT(x-s,z),DB_NAT(x,z+s)-DB_NAT(x,z-s))/(2*s));return dbGroundTint(x,z,y,sl,[.6,.55,.45],null);}});
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;
 const m=new THREE.Mesh(KFAR.geometry(G),mat);m.name='far';m.userData.probeSkip=true;m.userData.host=true;m.frustumCulled=false;m.userData.inspectLabel='The bed and the land past the map';
 scene.add(m);return{mesh:m,tris:G.count.tris};})();
// THE DOME ON THE EYE: the kit's sky is a 12 km sphere at the origin (90-scene.js) and the camera reaches 14 km, so from a
// station camera a few kilometres off the origin (the graveyard's overview) its far side fell past the far plane and the
// clear colour showed black under the horizon. Here it is kept centred on the eye each frame (a dome is a direction, not
// a place); the giant, a sprite, keeps its own place
if(typeof sky!=='undefined'&&typeof PORT_FRAME!=='undefined')PORT_FRAME.push(()=>{sky.position.copy(camera.position);});
// AND ITS LOWER HALF: the dome's shader takes pow(h, .55) of the view's height, which below the horizon is negative, and
// GLSL's pow of a negative is undefined (black on the GPU): every view from any height that sees past the ground showed a
// black band under the horizon. The kit's own (settlements/port/src/90-scene.js; KNOWN_ISSUES.md: upstream, a shared change);
// here the height is clamped at 0 first, so under the horizon is the horizon's own colour
if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.0),.55)');skyMat.needsUpdate=true;}
