// ================================================================= HOST — the land past the map: THE GAP'S WALLS, on the scale model's own heights
// core/terrain's far field (KFAR) out to 70 km, its heights the model's (44f-og-far-data.js: 2 km cells, bilinear) with a little detail, eased
// into the page's own floor over the first 4 km past the map: the floor's gentle rise, the walls climbing to 4-5 km 48-54 km out and to
// 10-14 km beyond, airless. Coloured by height: the Cfa floor's green, the benches' grey-green, the walls' rock, snow over ~5.5 km, the bare
// airless crest dark. KHORIZON is baked over the square with the far lattice past it: the walls' shadow on the floor. ?far=0, ?hz=0 off.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=70000,SINK=14;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const FLOOR=L([104,118,74]),BENCH=L([112,116,96]),ROCK=L([120,104,92]),SNOW=L([228,230,234]),AIRLESS=L([74,66,64]),HZ=L([196,204,210]);
 const farH=(x,z)=>{const r=Math.max(Math.abs(x),Math.abs(z)),m=farModel(x,z)+40*(KRAND.fbm(x*.0011,.5,z*.0011,3,6131)-.5)*smooth(1500,4000,farModel(x,z));
  return mix(floorH(x,z),m,smooth(S0,S0+4000,r));};
 const colr=(x,z,y,q)=>{const n=clamp(KRAND.fbm(x*.002,.5,z*.002,2,6133)*.8+.1,0,1),h=q.h;
  let c=mixC(FLOOR,BENCH,smooth(1700,2600,h));c=mixC(c,ROCK,smooth(2600,3800,h));c=mixC(c,SNOW,smooth(5200,6200,h)*(.7+.3*n));c=mixC(c,AIRLESS,smooth(8500,9800,h));
  return mixC(c,HZ,.5*smooth(5000,60000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:50,inner:S0+20,out:ROUT,grow:1.045}),dense:true,
  h:(x,z)=>Math.abs(x)<S0&&Math.abs(z)<S0?terrainH(x,z)-SINK:farH(x,z),
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'ogate-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The Outland Gate (the gap\'s walls, on the scale model\'s heights)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris,farH};})();
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-70000,-70000,70000,70000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
