// ================================================================= HOST — the land past a later station's map (core/terrain KFAR) and its horizon
// STAGE.far: {h(x, z) the land past the square (the station's own fall carried on, metres), col(x, z, y, q) -> [r, g, b] linear (q.h the
// height, q.r the range), sink (m: under the ground's square, 14)}. KHORIZON is baked over the square with the far lattice past it (the walls'
// and the far rims' shadows on the map). ?far=0, ?hz=0 off.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined'||!STAGE.far)return null;
 const S0=TERR.R*1.1,ROUT=STAGE.far.out||10000,SINK=STAGE.far.sink==null?14:STAGE.far.sink;
 const G=KFAR.grid({lines:KFAR.lines({cell:50,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>Math.abs(x)<S0&&Math.abs(z)<S0?terrainH(x,z)-SINK:STAGE.far.h(x,z),
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,color:STAGE.far.col});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'outl-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The Outlands (past the map)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-10000,-10000,10000,10000],n:160}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
