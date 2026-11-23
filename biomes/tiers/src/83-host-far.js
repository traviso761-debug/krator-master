// ================================================================= HOST — the stair past the map: the scale model to 118 km (core/terrain KFAR)
// PLAN.md sections 1, 2 and 9: from the lake the Tiers read as a flight of coloured cliffs, each with its tread above it: the Black Step's
// basalt, the Red Step's red beds, the White Step's pale sandstone, the Grey Steps up to the crown's ice under the Outer Wall. KFAR draws the
// scale model's own surface (44v's MODEL.h through the station's 44f cells: the drawn heights, the plan's sill in the far bay's rim) from the
// edge of the ground's square out to 118 km, its lines growing 3.5% a step, with the planet's curvature (R 4,810 km) and a crest pass. THE
// COLOUR is the model's class at each cell and the height: the lake tread's olive (Csa, Cfa), the treads' tawny steppe and cold desert (BSh,
// BSk, BWk, Dsc), the ET tundra's grey-green, the EF ice; the steep cells (the risers, smeared over a cell or two on the model) in the step's
// rock by height (the kit's KSTRATA formations: 44r's TIERS_STEP heights), the hot floor's green (Af, Am, Aw: Korona's rainforest). Host-only.
// KHORIZON is baked over the ground's square with this lattice past it. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=Math.min(118000,MODEL.R-2000),SINK=14;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={olive:L([96,104,66]),green:L([62,92,52]),steppe:L([168,146,104]),desert:L([176,152,116]),tundra:L([128,132,112]),
  black:L([52,48,46]),red:L([150,78,56]),white:L([220,206,180]),grey:L([150,150,144]),frost:L([200,204,210]),ice:L([228,234,240]),far:L([150,156,170])};
 const nz=(x,z,f,s)=>KRAND.fbm(x*f,.5,z*f,2,s)-.5;
 const rockOf=h=>h<2200?C.black:h<2950?C.red:h<3950?C.white:C.grey;
 const colr=(x,z,y,q)=>{const k=MODEL.cls(x,z),h=q.h,band=nz(x,z,.0005,6131)+.5;
  let c=k[0]==='A'?C.green:k==='Csa'||k==='Csb'||k[0]==='C'?mixC(C.olive,C.steppe,.3*band):k==='Dsb'||k==='Dfc'?mixC(C.olive,C.tundra,.4):
   k==='ET'||k==='HT'?C.tundra:k==='EF'||k==='HF'?C.ice:k==='BWk'||k==='BWh'?C.desert:C.steppe;
  const steep=q.slope==null?0:smooth(.12,.4,q.slope);c=mixC(c,rockOf(h+90*(band-.5)),steep*.9);
  c=mixC(c,C.frost,smooth(5600,6400,h)*.5*(1-steep*.5));
  return mixC(c,C.far,.45*smooth(20000,110000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.035}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return MODEL.h(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  curve:{from:S0},crest:{k:.6,from:6000,to:20000},color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'tiers-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=LAND.farLabel||'The Tiers past the map (the scale model 5.1)';scene.add(mesh);
 return{mesh,mat,G,H:MODEL.h,tris:G.count.tris,out:ROUT};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~22 m) and the far field past it. The ground takes it
// here, the flora after the bake (89z). The stair's risers 5-60 km off stand a few degrees up: their shade falls on the shore in the first and last hours.
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,R=FAR?FAR.out:14000,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:MODEL.h(x,z);},box:[-R,-R,R,R],n:240}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
