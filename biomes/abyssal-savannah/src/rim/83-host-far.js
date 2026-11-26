// ================================================================= HOST — the land past the map (after the hyperjungle's 83, 2026-10-27)
// BACKPORT.md section 1's ground set: the painted square ends at 3.96 km and the far impostors at 3.4 km, so from the tower and
// the high presets the forest stopped at an edge with nothing past it but fog. Here core/terrain's far field (KFAR) carries the
// floor on past the square to 14 km, and lifts it into the closed canopy's roof (the crowns at 45-60 m over the floor, rising
// over 1.2 km past the square, so the impostor ring meets it at its own height), coloured as the far canopy reads: the six
// species' greens in patches, the prism gum's and ghostwood's paler stands, bluer with distance. The brook runs on south as a
// darker seam. The terrain's horizon (KHORIZON) is baked over the square with this lattice past it. Host-only. ?far=0 draws none
// of it; a station sets STATION_FAR before this loads ({canopy: false} for open country, {h, color} its own).
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const SF=typeof STATION_FAR!=='undefined'?STATION_FAR:{};   /* the land's own (87 sets STATION_FAR from LAND) */
 const S0=TERR.R*1.1,ROUT=14000,SINK=20,SEED=8113;
 const nz=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
 // the canopy's roof over the floor past the square: 0 at the square's edge, its full height 1.2 km out; patchy in height
 const roof=(x,z)=>{if(SF.canopy===false)return 0;const d=Math.max(Math.abs(x),Math.abs(z))-S0;return smooth(0,1200,d)*(52+14*nz(x,z,.0011,301,3)*2);};
 const farH=SF.h||((x,z)=>terrainH(x,z)+roof(x,z));
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={floor:L([44,52,34]),dark:L([34,58,36]),mid:L([52,80,44]),pale:L([88,110,70]),seam:L([30,44,32]),far:L([62,82,74])};
 const colr=SF.color||((x,z,y,q)=>{const r=smooth(0,1200,Math.max(Math.abs(x),Math.abs(z))-S0),n1=nz(x,z,.0024,302,2)+.5,n2=nz(x,z,.0009,303,2)+.5;
  let c=mixC(C.dark,C.mid,n1);c=mixC(c,C.pale,smooth(.62,.8,n2)*.7);c=mixC(C.floor,c,r);
  c=mixC(c,C.seam,smooth(160,40,riverD(x,z))*r*.6);return mixC(c,C.far,.45*smooth(4500,13000,q.r));});
 const G=KFAR.grid({lines:KFAR.lines({cell:80,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the painted ground */
  color:colr});
 const geo=KFAR.geometry(G);
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'savannarim-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=SF.label||'The savannah past the map';scene.add(mesh);
 return{mesh,mat,G,H:farH,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (core/terrain/45-core-horizon.js, KHORIZON): eight directions over the painted square (256 a side, ~31 m)
// and, past it, the far field. The floor takes it; the flora takes it after the bake (88-host-build.js), the far field does not.
// On this rolling floor it is faint (the swells' lee at a low sun, the canopy roof's edge); ?hz=0 to compare
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
