// ================================================================= HOST — the land past the map (core/terrain's far field, KFAR) and its horizon
// The slope's own land (slopeH: the wall, the mast band, the shoulder) carried on to 10 km, sunk under the ground's square so nothing
// fights it; coloured by the same bands as the paint (the fog wall's violet-grey, the mast band's dark green, the shoulder's red-brown),
// fading to the haze. KHORIZON is baked over the square with this lattice past it: the wall's shadow on the slope. ?far=0, ?hz=0 off.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=10000,SINK=14;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const PELT=L([92,82,108]),MAST=L([66,82,70]),GRAV=L([150,124,104]),CREST=L([138,126,120]),HZ=L([201,204,210]);
 const colr=(x,z,y,q)=>{const n=clamp(KRAND.fbm(x*.003,.5,z*.003,2,5717)*.8+KRAND.fbm(x*.013,.5,z*.013,2,5718)*.4-.1,0,1),h=q.h;
  let c=mixC(GRAV,MAST,smooth(2900,3150,h));c=mixC(c,PELT,smooth(3450,3650,h)*smooth(4500,4350,h));c=mixC(c,CREST,smooth(4380,4520,h));c=mixC(c,GRAV,n*.15);
  return mixC(c,HZ,.55*smooth(3500,10000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:50,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>Math.abs(x)<S0&&Math.abs(z)<S0?terrainH(x,z)-SINK:slopeH(x,z),
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'outl-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The Outlands (the slope past the map)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-10000,-10000,10000,10000],n:160}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
