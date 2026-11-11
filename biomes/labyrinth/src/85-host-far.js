// ================================================================= HOST — the country past the map (copperglacier's far field, on the scale model)
// core/terrain's far field (KFAR) carries the land on to 24 km by the stage's own function, which past the square is the scale model's heights
// (45: MODEL_H): the north wall's broken toe rising to 6.4 km, the south side to 3-5 km, the neck opening east into the Rift. Sunk under the square so
// nothing fights the ground. KHORIZON is baked over the square with this lattice past it: the walls' shadow on the floor. ?far=0 none, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=24000,SINK=18;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={steppe:L([132,130,92]),park:L([96,108,72]),rock:L([122,118,112]),rock2:L([98,96,92]),snow:L([232,236,242]),far:L([170,176,184])};
 const colr=(x,z,y,q)=>{const n1=clamp(KRAND.fbm(x*.002,.5,z*.002,2,414)*.6+KRAND.fbm(x*.011,.5,z*.011,2,415)*.6-.1,0,1);
  let c=mixC(C.steppe,C.park,smooth(.45,.7,n1)*smooth(1800,1300,y));
  c=mixC(c,mixC(C.rock,C.rock2,n1),smooth(1700,2600,y));
  c=mixC(c,C.snow,smooth(SITE.snowLine[0],SITE.snowLine[1],y)*smooth(.2,.6,n1));
  return mixC(c,C.far,.5*smooth(6000,20000,q.r));};
 const G0=KFAR.grid({lines:KFAR.lines({cell:70,inner:S0+20,out:ROUT,grow:1.035}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return terrainH1(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,
  color:colr});
 const geo=KFAR.geometry(G0),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'labyrinth-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=SITE.region+' past the map';scene.add(mesh);
 return{mesh,mat,G:G0,tris:G0.count.tris};})();
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-24000,-24000,24000,24000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
