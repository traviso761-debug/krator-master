// ================================================================= HOST — the country past the map (2026-11-03, the final rebuild; ebadlands' lines)
// BACKPORT.md section 1's ground set: the ground's square ended at 2.9 km with the shared sky's painted ridges and fog past it. core/terrain's far field
// (KFAR) carries the valley on to 14 km by the land's own function (landH without the pools: the floor running on west toward the pass and east over the
// headwall, the walls rising in benches north and south toward the ranges; on scale model 5.1 they stand 2.5-4 km over the floor within 12 km, as here),
// sunk under the square so nothing fights the ground. KHORIZON is baked over the square with this lattice past it: the walls' shadow on the floor and,
// after the bake, on what stands on it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={floor:L([128,140,96]),terrace:L([150,148,118]),scree:L([150,144,136]),rock:L([126,124,122]),snow:L([228,232,238]),far:L([156,160,172])};
 // the far colour by the height over the floor (the floor's green, the terraces' sage, the scree, the granite, the snow from ~2.1 km up: the model's
 // Dsc and ET line round 3.9-4.2 km)
 const colr=(x,z,y,q)=>{const f0=floor0(x),u=y-f0,n1=clamp(KRAND.fbm(x*.002,.5,z*.002,2,414)*.6+KRAND.fbm(x*.011,.5,z*.011,2,415)*.6-.1,0,1);   /* two scales: the snow broken by rock ribs, not one sheet */let c=mixC(C.floor,C.terrace,smooth(80,300,u));
  c=mixC(c,C.scree,smooth(500,900,u));c=mixC(c,C.rock,smooth(900,1500,u)*(.5+.5*n1));c=mixC(c,C.snow,smooth(1900,2400,u)*smooth(.2,.6,n1));
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return landH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'oidong-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The Oidong Valley past the map';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~22 m) and the far field past it. The ground takes it
// here, the flora after the bake (89z).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
