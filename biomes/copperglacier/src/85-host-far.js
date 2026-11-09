// ================================================================= HOST — the country past the map (the final rebuild's ground set; Oidong's lines)
// core/terrain's far field (KFAR) carries the land on to 14 km by the stage's own function (the bed and the ice, terrainH1, without the streams): the
// glacier on up toward its head, the walls rising, the tarn's basin, sunk under the square so nothing fights the ground. KHORIZON is baked over the
// square with this lattice past it: the walls' shadow on the ground and, after the bake (89z), on what stands on it. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={tundra:L([128,132,108]),gravel:L([142,136,126]),rock:L([118,114,110]),ice:L([182,202,216]),snow:L([232,236,242]),water:L([74,150,150]),far:L([160,168,182])};
 const lo=SITE.coral[1]||SITE.snowLine[0];
 const colr=(x,z,y,q)=>{const n1=clamp(KRAND.fbm(x*.002,.5,z*.002,2,414)*.6+KRAND.fbm(x*.011,.5,z*.011,2,415)*.6-.1,0,1),ice=smooth(.5,4,iceAt(x,z));
  let c=mixC(C.tundra,C.gravel,smooth(lo-300,lo+200,y));c=mixC(c,C.rock,smooth(lo+200,lo+900,y)*(.5+.5*n1));
  c=mixC(c,C.snow,smooth(SITE.snowLine[0],SITE.snowLine[1],y)*smooth(.2,.6,n1));c=mixC(c,C.ice,ice*.8);
  if(TARN&&y<TARN.level+.5&&ice<.1)c=C.water;
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));};
 const G0=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;const h=terrainH1(x,z);return TARN&&h<TARN.level&&iceAt(x,z)<.1?TARN.level:h;},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G0),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'copperglacier-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=SITE.region+' past the map';scene.add(mesh);
 return{mesh,mat,G:G0,tris:G0.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side) and the far field past it
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
