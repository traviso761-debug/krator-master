// ================================================================= HOST — the country past the map (2026-11-02, the final rebuild; swlowlands' and necanyons' lines)
// BACKPORT.md section 1's ground set: the ground's square ended at 3.7 km with the shared sky's painted ridges and fog past it. core/terrain's far field
// (KFAR) carries the land on to 14 km by the land's own far function (LAND.far: on the transect the abyss falling away west of the basin and the range
// rising east toward the outer rim; a station's its own), sunk under the square so nothing fights the ground. KHORIZON is baked over the square with this
// lattice past it: the land's shadow on the ground and, after the bake, on what stands on it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined'||!LAND.far)return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18;
 const nz=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
 const farH=(x,z)=>LAND.far(x,z,S0);
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={waste:L([176,136,110]),steppe:L([142,140,112]),pine:L([78,82,58]),spruce:L([52,60,44]),tundra:L([112,108,86]),snow:L([226,230,236]),far:L([150,150,158]),rock:L([128,104,92])};
 // the far colour by height, the land's own bands carried on (LAND.farBands: [y of the steppe, the pines, the spruce, the tundra, the snow])
 const B=LAND.farBands||[300,700,1000,1350,1650];
 const colr=(x,z,y,q)=>{const n1=nz(x,z,.002,414,2)+.5;let c=mixC(C.waste,C.rock,n1*.5);c=mixC(c,C.steppe,smooth(B[0]-80,B[0]+80,y));c=mixC(c,C.pine,smooth(B[1]-80,B[1]+80,y));
  c=mixC(c,C.spruce,smooth(B[2]-60,B[2]+60,y));c=mixC(c,C.tundra,smooth(B[3]-60,B[3]+60,y));c=mixC(c,C.snow,smooth(B[4]-60,B[4]+60,y)*(.6+.4*n1));
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'riftrim-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=LAND.farLabel||'The badlands past the map';scene.add(mesh);
 return{mesh,mat,G,H:farH,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~29 m) and the far field past it. The ground takes it
// here, the flora after the bake (89z).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
