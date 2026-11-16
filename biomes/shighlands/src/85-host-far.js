// ================================================================= HOST — the plateau past the map (the final rebuild, pair 12; korona's and oidong's lines)
// BACKPORT.md section 1's ground set: the ground's square ended at 2.86 km with the shared sky and fog past it. core/terrain's far field (KFAR)
// carries the stage's own land (landH: the plateau rising south, its swells, the dry side falling south-east, the scarp dropping north under
// the cloud deck, which hides it) on to 9 km, sunk under the square so nothing fights the ground. The ravines, the tarn and the bogs are the
// square's; past it there are none (the plateau is a record the open world will place from the scale model: KNOWN_ISSUES.md, "Not in the open
// world"). Coloured by the same zones the paint reads (the moss under the cloud near the rim, the paramo's gold and olive, the dry side's
// ochre), fading to the haze. KHORIZON is baked over the square with this lattice past it: the scarp's and the tors' shadows on the ground and,
// after the bake (89zx), on what stands on it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=9000,SINK=14;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const MOSS=L([98,124,52]),GOLD=L([176,152,92]),OLIVE=L([128,128,74]),OCHRE=L([170,146,112]),HZ=L([200,210,214]);
 const colr=(x,z,y,q)=>{const n=clamp(KRAND.fbm(x*.003,.5,z*.003,2,4717)*.8+KRAND.fbm(x*.013,.5,z*.013,2,4718)*.4-.1,0,1);
  const fog=smooth(FOG_BAND[0],FOG_BAND[1],q.h-CLOUD_Y),dry=smooth(1800,3600,x*.6+z*.8)*smooth(-200,300,z-rimZ(x));
  let c=mixC(GOLD,OLIVE,n);c=mixC(c,OCHRE,dry*.8);c=mixC(c,MOSS,fog);
  if(typeof STATION_FARCOL==='function')c=STATION_FARCOL(x,z,q.h,n,L);   /* a station's far colours (linear) */
  return mixC(c,HZ,.55*smooth(3500,9000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:50,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>Math.abs(x)<S0&&Math.abs(z)<S0?terrainH(x,z)-SINK:landH(x,z),
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'shigh-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The southern highlands (the plateau past the map)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~22 m) and the far field past it. The
// ground takes it here, the flora after the bake (89zx).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-9000,-9000,9000,9000],n:160}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
