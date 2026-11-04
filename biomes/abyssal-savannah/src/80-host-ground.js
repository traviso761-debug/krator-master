// ================================================================= HOST — the ground, the country past the map, the terrain's horizon (the final rebuild, 2026-11-03)
// After the kits (the ground's paint and masks read ABSAV.burn) and before the sky, the air and the water (they bind and wet MAT_GROUND); the build
// (89z) comes after the water, so the flora reads the water's own numbers. BACKPORT.md section 1's ground set (oidong's and ebadlands' lines):
//   the ground   45-host-stage.js's mesh, its layers on KGROUND (core/terrain 43)
//   KFAR         core/terrain's far field (44) carries the rim slope on to 36 km by the land's own function (farH: the floor falling west on 5.1's grade
//                to the savanna belt and the lake, the bench and the plateau east), sunk under the map so nothing fights the ground. It replaces the
//                page's own 300 x 300 far mesh (2026-10-26). ?far=0 none of it
//   KHORIZON     the terrain's horizon (45), baked over the map with the far lattice past it: the risers' and the rim's shadow on the treads at a low
//                sun, on the ground here and on the flora after the bake (89z). ?hz=0 none
try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
const FAR_F=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const SINK=3,L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={jun:L([36,64,42]),jun2:L([48,80,46]),sav:L([142,124,74]),salt:L([200,190,168]),step:L([168,148,100]),plat:L([138,118,86]),far:L([176,170,156])};
 // the far colour as the old mesh's (2026-10-26): the floor's jungle at the slope's foot and round the lake, the savanna belt between, salt patches; the
 // rim's grass, the bench's steppe, the plateau; hazed with distance
 const colr=(x,z,y,q)=>{const xs=x+warpZ(z),n=KF(x*.0011,z*.0011,2,42)-.5;
  let c=mixC(mixC(C.sav,C.step,smooth(500,2500,xs)),C.plat,smooth(3500,9000,xs));
  c=mixC(c,mixC(C.jun,C.jun2,clamp(.5+n*2,0,1)),smooth(-2000,-3400,xs)*smooth(-6200,-4600,xs));
  c=mixC(c,C.salt,smooth(.62,.7,KF(x*.0004,z*.0004,2,43))*smooth(-6500,-9000,xs)*smooth(-26000,-22000,xs)*.7);
  c=mixC(c,mixC(C.jun,C.jun2,clamp(.5-n*2,0,1)),smooth(-24000,-29000,xs));
  c=c.map(v=>v*(1+n*.14));return mixC(c,C.far,.35*smooth(6000,30000,q.r));};
 const X=TERR.X,Z=TERR.Z;
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:Math.max(X,Z)+20,out:FAR.out,grow:1.035}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<X&&Math.abs(z)<Z)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-X+60&&x1<X-60&&z0>-Z+60&&z1<Z-60,   /* none under the ground's rectangle */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'absav-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The far country (the abyss floor, the rim, the plateau)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||!MAT_GROUND||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=Math.max(TERR.X,TERR.Z)*1.02,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR_F?{h:(x,z)=>{const v=FAR_F.G.at(x,z);return v===v?v:0;},box:[-20000,-20000,20000,20000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
