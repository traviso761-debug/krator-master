// ================================================================= HOST — the belt's ground, the country past the map, the terrain's horizon
// As station 1's (src/80-host-ground.js): after the kits (the paint reads ABSAV.burn), before the sky, the air and the water; the build (89z)
// comes after the water. The far colours are the model's own classes (GRID51.K): the savanna's gold, the lake jungle's green in the basins,
// the salt steppe pale, the salt lakes' white rims (their water is core/water's, 89w).
//   the ground   45-host-stage.js's mesh, its layers on KGROUND (core/terrain 43)
//   KFAR         core/terrain's far field (44) to 36 km on 5.1's cells (farH), sunk under the map. ?far=0 none of it
//   KHORIZON     the terrain's horizon (45): the basins' rims shading the floor at a low sun. ?hz=0 none
try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
const FAR_F=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const SINK=3,L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={sav:L([150,128,74]),sav2:L([132,116,70]),jun:L([34,62,40]),jun2:L([46,78,44]),salt:L([206,196,174]),step:L([172,152,104]),des:L([190,160,120]),plat:L([138,120,88]),far:L([176,170,156])};
 const colr=(x,z,y,q)=>{const n=KF(x*.0011,z*.0011,2,42)-.5;
  let c=mixC(C.sav,C.sav2,clamp(.5+n*2,0,1));
  c=mixC(c,C.step,classW(x,z,'sbk'));c=mixC(c,C.des,classW(x,z,'wd'));c=mixC(c,C.plat,classW(x,z,'acCg'));
  c=mixC(c,mixC(C.jun,C.jun2,clamp(.5+n*2,0,1)),Math.max(classW(x,z,'A'),inMap(x,z)?jungK(x,z)*.8:0));
  c=mixC(c,C.salt,Math.max(classW(x,z,'~')*.85,inMap(x,z)?FIELD.salt(x,z)*.6:0));
  c=c.map(v=>v*(1+n*.14));return mixC(c,C.far,.35*smooth(6000,30000,q.r));};
 const X=TERR.X,Z=TERR.Z;
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:Math.max(X,Z)+20,out:FAR.out,grow:1.035}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<X&&Math.abs(z)<Z)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-X+60&&x1<X-60&&z0>-Z+60&&z1<Z-60,   /* none under the ground's rectangle */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'absav-belt-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The far country (the abyss floor, the salt lakes, the jungle\'s basins)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||!MAT_GROUND||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=Math.max(TERR.X,TERR.Z)*1.02,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR_F?{h:(x,z)=>{const v=FAR_F.G.at(x,z);return v===v?v:0;},box:[-20000,-20000,20000,20000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
