// ================================================================= HOST — the chasm past the map: the scale model to 120 km (core/terrain KFAR)
// PLAN.md section 3, "The sky is wide": from the floor the walls are a skyline of 10-12 km rock 30-120 km off on both hands, 1-11 degrees up;
// that skyline IS the chasm. KFAR draws the scale model's own surface (44v's MODEL.h through the station's 44f cells: the drawn heights, no
// sculpt of the page's own) from the edge of the ground's square out to 118 km, its lines growing 3.5% a step, with the planet's curvature
// (R 4,810 km: 1.4 km down at 120 km, so the far wall sits as it would) and a crest pass so the walls' rims stay sharp on the coarse lattice.
// The colour is the model's climate class at each cell (44f: c) and the height: the Deep's dark floor and salt, the benches' tan desert, the
// basalt walls banded dark and rust, frost over the ET line, ice in the EF band, bare grey rock over 8.8 km (the airless crests: O).
// KHORIZON is baked over the ground's square with this lattice past it: the walls' shadow on the floor at a low sun. Host-only.
// ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=Math.min(118000,MODEL.R-2000),SINK=14;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={floor:L([58,56,48]),salt:L([200,194,180]),desert:L([150,128,100]),basalt:L([66,62,60]),rust:L([104,70,54]),frost:L([196,200,206]),
  ice:L([226,232,238]),bare:L([110,106,104]),far:L([150,154,166])};
 const nz=(x,z,f,s)=>KRAND.fbm(x*f,.5,z*f,2,s)-.5;
 const colr=(x,z,y,q)=>{const k=MODEL.cls(x,z),h=q.h,band=nz(x,z,.0004,4211)+.5,st=.5+.5*Math.sin(h/180+band*3);
  let c=mixC(C.desert,C.floor,smooth(400,-300,h));
  if(k==='XW'&&h<-1000)c=mixC(c,C.salt,.25*smooth(.55,.75,band));   /* a pale crust in the trough's lowest hollows */
  const steep=q.slope==null?0:smooth(.25,.6,q.slope);c=mixC(c,mixC(C.basalt,C.rust,st*.5),Math.max(steep*.85,smooth(2600,4200,h)));
  c=mixC(c,C.frost,smooth(4800,5600,h)*.55*(1-steep*.5));c=mixC(c,C.ice,(k==='EF'?.8:0)*(1-steep*.6));
  c=mixC(c,C.bare,smooth(8400,9200,h)*.7);
  return mixC(c,C.far,.45*smooth(20000,110000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.035}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return MODEL.h(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  curve:{from:S0},crest:{k:.6,from:6000,to:20000},color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'gch-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=LAND.farLabel||'The Great Chasm past the map (the scale model 5.1)';scene.add(mesh);
 return{mesh,mat,G,H:MODEL.h,tris:G.count.tris,out:ROUT};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side, ~22 m) and the far field past it. The ground takes it
// here, the flora after the bake (89z). The walls 60 km off stand 5-10 degrees up: their shade falls on the floor in the first and last hours.
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,R=FAR?FAR.out:14000,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:MODEL.h(x,z);},box:[-R,-R,R,R],n:240}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
