// ================================================================= HOST — the country past the map (stations 2-5; the showcase's 85 on the site's own land)
// KFAR carries the station's ground on to 14 km by its own land function (STATION_SITE.far.h, else land), coloured by the site (far.color(x, z, y, q) ->
// linear [r, g, b]); sunk under the square so nothing fights the ground. KHORIZON over the square and this lattice. ?far=0 none, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=14,FS=SITE.far||{};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const FAR_C=L(FS.haze||[160,166,172]),own=FS.color||((x,z,y,q)=>L([120,116,108]));
 const colr=(x,z,y,q)=>mixC(own(x,z,y,q),FAR_C,.55*smooth(4000,13000,q.r));
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return FS.h?FS.h(x,z):landH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'geyser-field-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=FS.label||'The country past the map';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
window._far=FAR?{tris:FAR.tris}:null;
