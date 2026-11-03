// ================================================================= HOST — the country past the map (2026-11-02, the final rebuild; necanyons' lines)
// BACKPORT.md section 1's ground set: the floor's square ended at 3.3 km with the shared sky's painted ridges and fog past it. core/terrain's far field (KFAR) carries the land on
// to 14 km: the canopy roof of the plain and the bayou NW-ward (the sea stays open: no land where seaIn is under 0), the hills rising SE, the Inner Wall's first foothills NE and the
// Outer Wall's SW, sunk under the square so nothing fights the ground. KHORIZON is baked over the square with this lattice past it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
// A station sets STATION_FAR before this loads ({h(x,z), color(x,z,y,q), label}).
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const SF=typeof STATION_FAR!=='undefined'?STATION_FAR:{};
 const S0=TERR.R*1.1,ROUT=14000,SINK=20;
 const nz=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
 const seaK=(x,z)=>smooth(0,240,seaIn(x,z));   /* 0 in the sea: the far land ends at the shore's own line */
 const farH=SF.h||((x,z)=>{const s=sOf(x,z),t=tOf(x,z),g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),d=Math.max(Math.abs(x),Math.abs(z))-S0;
  const roof=smooth(0,900,d)*(30+14*nz(x,z,.0012,411,3)*2),hills=smooth(1500,9000,s)*(240+260*nz(x,z,.0007,412,3)*2),wall=smooth(5000,13000,Math.abs(t))*(420+300*nz(x,z,.0005,413,3)*2);
  return mix(-14,g*smooth(1400,0,d)+roof+Math.max(hills,wall,0),seaK(x,z));});
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={wood:L([48,62,38]),oak:L([70,84,48]),gold:L([150,126,76]),far:L([86,100,102]),rock:L([120,106,96]),bed:L([60,86,92])};
 const colr=SF.color||((x,z,y,q)=>{const s=sOf(x,z),n1=nz(x,z,.002,414,2)+.5;let c=mixC(C.wood,C.oak,n1);c=mixC(c,C.gold,smooth(500,2200,s)*.8);c=mixC(c,C.rock,smooth(300,900,y));c=mixC(C.bed,c,seaK(x,z));
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));});
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the floor's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'swlowlands-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=SF.label||'The lowlands past the map';scene.add(mesh);
 return{mesh,mat,G,H:farH,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the floor's square (256 a side, ~26 m) and the far field past it. The floor takes it here, the flora after the bake.
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
