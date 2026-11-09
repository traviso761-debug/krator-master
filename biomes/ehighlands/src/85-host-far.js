// ================================================================= HOST — the country past the map (the final rebuild, pair 13, 2026-11-09; korona's lines)
// BACKPORT.md section 1's ground set: the ground's square ended at 2.9 km with the shared sky and fog past it. core/terrain's far field (KFAR)
// carries the land on from the station's own far function (STAGE.farH; station 1: the puna's swell and the range in the south, its crest flat past
// the square's edge), sunk under the square so nothing fights the ground, coloured by the station's palette (STAGE.far.col: station 1's gold-brown
// puna, grey scree, snow where it is cold) fading to the haze. The tors, the bog, the Mother and the gullies are this map's alone.
// KHORIZON is baked over the square with this lattice past it: the range's and the tors' shadow on the ground and, after the bake (89z), on
// what stands on it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,FO=STAGE.far||{},ROUT=FO.out==null?12000:FO.out,SINK=12,CO=FO.col||{};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const PUNA=L(CO.a||[150,124,80]),PUNA2=L(CO.b||[120,100,70]),SCREE=L(CO.scree||[118,112,106]),SNOW=L(CO.snow||[226,232,238]),HZ=L(CO.haze||[170,186,210]);
 const farH=STAGE.farH,coldAt=FO.cold||(y=>clamp(.16+(y-226)/560,0,1));
 const colr=(x,z,y,q)=>{const n=clamp(KRAND.fbm(x*.003,.5,z*.003,2,2417)*.8+KRAND.fbm(x*.013,.5,z*.013,2,2418)*.4-.1,0,1),cold=coldAt(y);
  let c=mixC(PUNA,PUNA2,n);c=mixC(c,SCREE,smooth(.3,.55,cold));c=mixC(c,SNOW,smooth(.74,.9,cold+.08*(n-.5)));
  return mixC(c,HZ,.55*smooth(3500,ROUT,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:50,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'ehigh-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The eastern highlands (the country past the map)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~22 m) and the far field past it. The ground
// takes it here, the flora after the bake (89z)
const ROUT_=FAR&&STAGE.far&&STAGE.far.out!=null?STAGE.far.out:12000;
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-ROUT_,-ROUT_,ROUT_,ROUT_],n:160}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
