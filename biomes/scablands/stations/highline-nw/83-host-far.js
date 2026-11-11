// ================================================================= HOST — the country past the map (replaces the kit's 83-host-range.js: no Inner Wall here)
// core/terrain's far field (KFAR) carries the land on to 14 km by the stage's own heights: NW lowlands' hills rising west, the old bed falling east toward
// the trough (the flood lake's marks on it, KBASIN.land), sunk under the square so nothing fights the ground (nsemiarid's 87-host-far.js, the same
// lattice). KHORIZON is baked over the square with this lattice past it, in 88-host-build.js (NWLOW.farH). Host-only. ?far=0 none of it.
const FAR_LAND=(x,z)=>BASIN.land(x,z,800-.058*Math.max(-7000,Math.min(7000,x))+60*smooth(-2600,-6000,x)-150*smooth(3000,9000,x)+(66)*(fbm(x*.0011+3,z*.0011-1,1801,3)-.5)*2*smooth(-300,-2600,x));
const FAR=(function(){
 if(NWQ.get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18,land=FAR_LAND;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={gold:L([168,154,100]),scrub:L([92,104,72]),forest:L([70,84,56]),young:L([96,108,66]),silt:L([196,186,160]),far:L([160,162,156])};
 // the far colour: the hills' gold and scrub west over the line, the young forest's paler green on the bed east, the silt toward the trough
 const colr=(x,z,y,q)=>{const n1=clamp(KRAND.fbm(x*.002,.5,z*.002,2,4181)*.6+KRAND.fbm(x*.011,.5,z*.011,2,4182)*.6-.1,0,1);
  let c=mixC(C.gold,C.scrub,smooth(.35,.75,n1)*.7);c=mixC(c,C.forest,smooth(.5,.8,n1)*.5);
  c=mixC(c,C.young,smooth(HL.level+4,HL.level-6,y));c=mixC(c,C.silt,smooth(600,520,y)*.6);
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return land(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'scablands-nw-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The flood lake\'s high line past the map';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// the horizon's far heights (88-host-build.js bakes KHORIZON over the square and this past it)
NWLOW.farH=FAR?(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:terrainH(x,z);}:null;
