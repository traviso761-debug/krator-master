// ================================================================= HOST — the country past the map (the final rebuild, 2026-11-03; swlowlands' lines)
// BACKPORT.md section 1's ground set: the Vale's square ended at 3.3-3.5 km with the shared sky's painted ridges and fog past it. core/terrain's far field (KFAR)
// carries the land on to 14 km: the lake runs on north, east and west as the map draws it (a flat at the water's level in the lake's colour, so no hole shows
// past the water's own box), its far north shore rising to hills at 9-12 km; the green flanks climb east and west into the rim; the mountains rise south
// behind the cliffs to 2.6 km with snow above 1.7 km, dipping at the cataract's notch (south-east, az 112, as the sky's ridges do). Sunk under the square so
// nothing fights the ground. KHORIZON is baked over the square with this lattice past it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
// A station sets LAND.far before this loads ({h(x,z), color(x,z,y,q), label}) or LAND.far=false for none.
const FAR=(function(){
 if(!XQ_ON('far')||typeof KFAR==='undefined'||LAND.far===false)return null;
 const SF=LAND.far||{};
 const X0=TERR.X0,X1=TERR.X1,Z0=TERR.Z0,Z1=TERR.Z1,ROUT=14000,SINK=20;
 const nz=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
 const out=(x,z)=>Math.max(X0-x,x-X1,Z0-z,z-Z1,0);
 /* the lake: where the map's edge nearest the point is lake, out to the far shore's wavering line ~8.5 km north (east and west it closes in) */
 const isLake=(x,z,g)=>g<-1&&z>-8600+900*nz(x,z,.0004,421,2)*2+.0003*Math.max(0,Math.abs(x)-2500)*Math.abs(x)*.1;
 const farH=SF.h||((x,z)=>{const d=out(x,z),g=terrainH(clamp(x,X0,X1),clamp(z,Z0,Z1));
  if(isLake(x,z,g))return -.4;   /* the lake past the water's box */
  const south=smooth(Z1-200,Z1+5000,z),flank=smooth(1500,8000,Math.abs(x))*smooth(Z0-2000,Z0+2000,z),north=smooth(-8000,-12000,z);
  const az=Math.atan2(x,-z)*180/Math.PI,notch=1-.55*Math.exp(-Math.pow((az-112)/9,2));
  const rid=1-Math.abs(2*KRAND.fbm(x*.0005,.5,z*.0005,3,423)-1);
  const mtn=south*(1500+900*rid+300*nz(x,z,.0011,424,3)*2)*notch,rim=flank*(500+500*rid),far=north*(600+400*rid);
  return g*smooth(1400,0,d)+Math.max(mtn,rim,far,30*smooth(0,800,d));});
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={wood:L([54,74,44]),mead:L([96,116,60]),rossa:L([140,92,64]),rock:L([132,124,120]),snow:L([226,230,236]),far:L([110,124,128]),lake:L([60,128,122])};
 const colr=SF.color||((x,z,y,q)=>{if(y<0)return mixC(C.lake,C.far,.4*smooth(4500,13000,q.r));const n1=nz(x,z,.002,425,2)+.5;let c=mixC(C.wood,C.mead,n1);
  c=mixC(c,C.rossa,smooth(250,700,y)*.5);c=mixC(c,C.rock,smooth(700,1400,y));c=mixC(c,C.snow,smooth(1650,1900,y+120*nz(x,z,.003,426,2)));
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));});
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:Math.max(X1-X0,Z1-Z0)/2+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(x>X0&&x<X1&&z>Z0&&z<Z1)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>X0+100&&x1<X1-100&&z0>Z0+100&&z1<Z1-100,   /* none under the floor's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'xanadu-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=SF.label||'The country round the Vale';scene.add(mesh);
 return{mesh,mat,G,H:farH,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the floor's square (256 a side, ~27 m) and the far field past it. The floor takes it here, the flora after the bake (89z).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||!XQ_ON('hz'))return null;
 const t0=performance.now(),H=KHORIZON.bake({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
