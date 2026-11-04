// ================================================================= HOST — the country past the map (2026-11-03, the final rebuild, pair 9; oidong's lines)
// BACKPORT.md section 1's ground set: the ground's square ended at 3.7 km with the shared sky's painted ridges and fog past it. core/terrain's far field
// (KFAR) carries the basin on to 14 km by the stage's own land (landH: the plain swelling south into the foothills and the upland plateau, the old
// bed's bowl north; on scale model 5.1 the north basin runs on flat for a hundred kilometres, so the far field is mostly the plain), sunk under the
// square so nothing fights the ground. KHORIZON is baked over the square with this lattice past it: the foothills' and the upland's shadow on the plain
// and, after the bake, on what stands on it. Host-only; an overlay with its own land (biomes/scablands) gives FAR_LAND. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18,land=typeof FAR_LAND==='function'?FAR_LAND:typeof landH==='function'?landH:terrainH;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={steppe:L([176,158,120]),sage:L([150,154,124]),olive:L([132,132,90]),green:L([98,130,66]),silt:L([200,188,160]),basalt:L([84,78,72]),far:L([168,160,150])};
 // the far colour: the steppe's tan and sage on the plain, olive in the foothills, the upland's green, the bed's pale silt in the north, basalt on the steeps
 const colr=(x,z,y,q)=>{const n1=clamp(KRAND.fbm(x*.002,.5,z*.002,2,4171)*.6+KRAND.fbm(x*.011,.5,z*.011,2,4172)*.6-.1,0,1);
  let c=mixC(C.steppe,C.sage,smooth(.35,.75,n1)*.6);c=mixC(c,C.olive,smooth(760,1000,y));c=mixC(c,C.green,smooth(1150,1350,y));
  c=mixC(c,C.silt,smooth(-3000,-4500,z)*smooth(700,620,y));
  const s=Math.hypot(land(x+40,z)-land(x-40,z),land(x,z+40)-land(x,z-40))/80;c=mixC(c,C.basalt,smooth(.35,.7,s)*.7);
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return land(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'nsemiarid-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=STAGE_GROUND.label+' past the map';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~29 m) and the far field past it. The ground takes it
// here, the flora after the bake (88-host-build.js).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
