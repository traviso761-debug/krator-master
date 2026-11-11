// ================================================================= HOST — the country past the map (2026-11-09, the final rebuild, pair 12; nsemiarid's lines)
// BACKPORT.md section 1's ground set: the ground's square ended at 2.86 km, with the shared sky's painted ridges and fog past it. core/terrain's far
// field (KFAR) carries the crater floor on to 12 km by the stage's own land (landH: the plain's long swells rising a little to the north; the kopjes are
// the showcase's and none stands past the map), sunk under the square so nothing fights the ground, coloured as the mosaic reads from afar: red soil,
// straw and olive scrub in patches, a few dark old burns. KHORIZON is baked over the square with this lattice past it: the kopjes' shadow on the plain
// and, after the bake (88-host-build.js), on what stands on it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=12000,SINK=14,land=landH;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={soil:L([156,106,84]),straw:L([176,160,112]),olive:L([106,108,64]),char:L([58,52,46]),far:L([196,188,170])};
 // the far colour: red soil under straw and olive in patches (the old scrub), a burn's dark here and there, all fading to the haze's pale
 const colr=(x,z,y,q)=>{const n1=clamp(KRAND.fbm(x*.0016,.5,z*.0016,2,5311)*.6+KRAND.fbm(x*.009,.5,z*.009,2,5312)*.6-.1,0,1),
   n2=KRAND.fbm(x*.0011+3,.5,z*.0011-2,2,5313);
  let c=mixC(C.soil,C.straw,smooth(.3,.7,n1)*.7);c=mixC(c,C.olive,smooth(.55,.8,n1)*.5);c=mixC(c,C.char,smooth(.66,.74,n2)*.6);
  return mixC(c,C.far,.5*smooth(4000,11000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return land(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'craterdry-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The crater floor past the map';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~22 m) and the far field past it. The ground takes it
// here, the flora after the bake (88-host-build.js).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-12000,-12000,12000,12000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
