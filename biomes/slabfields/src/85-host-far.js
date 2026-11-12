// ================================================================= HOST — the country past the map (highrift's lines, 2026-11-12)
// core/terrain's far field (KFAR) carries the station's land on to 14 km by its own function (landH: the Anvil's cliff along its lobate front east and
// west, its ramp falling south behind the rim, the bench north), sunk under the square so nothing fights the ground. KHORIZON is baked over the square with this lattice past it: the walls' shadow on the floor and,
// after the bake, on what stands on it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={floor:L([150,136,104]),terrace:L([112,104,94]),scree:L([84,76,70]),rock:L([58,52,48]),bole:L([96,52,40]),snow:L([228,232,238]),far:L([156,160,172])}   /* the face: dark flood basalt, red boles between flows */;
 // the far colour by the height over the floor (the floor, the benches, the scree, the wall's gneiss, the snow from ~1.9 km up)
 const colr=(x,z,y,q)=>{const f0=floor0(x),u=y-f0,n1=clamp(KRAND.fbm(x*.002,.5,z*.002,2,414)*.6+KRAND.fbm(x*.011,.5,z*.011,2,415)*.6-.1,0,1);   /* two scales: the snow broken by rock ribs, not one sheet */let c=mixC(C.floor,C.terrace,smooth(80,300,u));
  c=mixC(c,C.scree,smooth(120,260,u));c=mixC(c,C.rock,smooth(220,420,u)*(.7+.3*n1));c=mixC(c,C.bole,.35*smooth(220,420,u)*smooth(.6,.9,.5+.5*Math.sin(y/23+3*n1)));c=mixC(c,C.snow,smooth(SITE.snow[0]-f0,SITE.snow[1]-f0,u)*smooth(.2,.6,n1));
  return mixC(c,C.far,.35*smooth(4500,13000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return landH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'slabfields-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The Slabfields past the map: the Anvil east and west, the middle bench north';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// THE GROUND'S TEXTURE UNITS (the Throne's, ringisles' and geyser's samplersOf): the Mirror's six layers, the horizon, the rain cover and the weather passed
// SwiftShader's 32 units but not the 16 both GPU lanes allow (the GPU verify, 2026-11-04). Counted from a dry run of its onBeforeCompile; window._units
// says what the ground reads (final: at the end of the build, 89z).
const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong',MeshBasicMaterial:'basic',MeshToonMaterial:'toon'};
const samplersOf=m=>{try{const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
  const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
  try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.lightMap?1:0)+(m.aoMap?1:0);
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});return n;}catch(e){return 99;}};
const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
/* what the ground takes after the horizon, measured on the Mirror (2026-11-04): 89a's snow cover and the weather's wetting 4 units, the rain cover 1.
   In the Throne's order: the rain cover where it fits beside the 4, then the horizon on the ground where its 2 fit too */
const UNITS_LATER=4,RAIN_FITS=samplersOf(MAT_GROUND)+1+UNITS_LATER<=MAXT;
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~22 m) and the far field past it. The ground takes it
// here where its two units fit beside what comes later (UNITS_LATER), the flora after the bake (89z).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n,skipped:[]};
 if(samplersOf(MAT_GROUND)+2+(RAIN_FITS?1:0)+UNITS_LATER<=MAXT)KHORIZON.shade(MAT_GROUND,H);else window._horizon.skipped.push('the ground');return H;})();
