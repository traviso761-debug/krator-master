// ================================================================= HOST — the country past the map (2026-11-03, the final rebuild, pair 7; oidong's lines)
// BACKPORT.md section 1's ground set: the ground's square ended at 3.1 km with the shared sky's painted canopy lines and fog past it. core/terrain's far
// field (KFAR) carries the Steampits on to 14 km by the land's own function: the hyperjungle's plateau rolling on north, east and west at ~90 m (the
// province is ~150 km of it), coloured as its canopy seen from afar, and the coast going on east and west to the beaches; past the shore it sinks under
// the sea (the Ring Sea's own surface draws to 9 km). Sunk under the square so nothing fights the ground. KHORIZON is baked over the square with this
// lattice past it: the basin's walls' shadow on its floor and, after the bake, on what stands on it (88). Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=14;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={canopy:L([52,70,40]),canopy2:L([66,84,48]),sand:L([48,46,44]),far:L([150,162,160])};
 // the far colour: the canopy's two greens broken by the crowns' scale, the black sand at the shore, the haze's grey-green with distance
 const colr=(x,z,y,q)=>{const n=clamp(KRAND.fbm(x*.003,.5,z*.003,2,5311)*.9+KRAND.fbm(x*.017,.5,z*.017,2,5312)*.5-.2,0,1),sz=shoreZ(x);
  let c=mixC(C.canopy,C.canopy2,n);c=mixC(c,C.sand,smooth(sz-60,sz-10,z));return mixC(c,C.far,.55*smooth(4000,13000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return landH(x,z)+(z<shoreZ(x)-40?28*smooth(-200,-40,z-shoreZ(x)):0);},   /* the canopy's height over the plateau */
  skip:(x0,z0,x1,z1)=>(x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100)||z0>shoreZ((x0+x1)/2)+400,   /* none under the ground's square, nor far out under the sea */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'geyser-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The Steampits past the map (the hyperjungle plateau, the coast)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// THE GROUND'S TEXTURE UNITS (the Throne's and ringisles' samplersOf, 89zz): KGROUND's nine surfaces leave the Lambert ground few of the Arc's sixteen, and
// SwiftShader's 32 hid it (the cloud build). Counted from a dry run of its onBeforeCompile; the sun's shadow map takes one (88), the horizon two: the shadow
// first, then the horizon on the ground where both fit (the flora takes the horizon either way). window._units says what the ground reads.
const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong',MeshBasicMaterial:'basic',MeshToonMaterial:'toon'};
const samplersOf=m=>{try{const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
  const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
  try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.lightMap?1:0)+(m.aoMap?1:0);
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});return n;}catch(e){return 99;}};
const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
const SHADOW_WANT=new URLSearchParams(location.search).get('shadow')!=='0'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~12 m) and the far field past it. The ground takes it
// here where it keeps two units past the shadow's, the flora after the bake (88).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n,skipped:[]};
 if(samplersOf(MAT_GROUND)+2+(SHADOW_WANT?1:0)<=MAXT)KHORIZON.shade(MAT_GROUND,H);else window._horizon.skipped.push('the ground');
 return H;})();
window._units.withHorizon=samplersOf(MAT_GROUND);
window._far=FAR?{tris:FAR.tris}:null;
