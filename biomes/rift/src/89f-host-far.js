// ================================================================= HOST — a station's far country: the scale model round it (core/terrain KFAR)
// Shared by the stations (2026-10-27): a page with a baked FAR_MODEL (stations/<name>/44f-host-far-data.js) draws it; the old page has
// none and draws nothing. STATION_PAGE.farPal overrides the palette's entries by name (sRGB 0-255 triples). Station 1's description:
// Beyond the ground square, out to 50 km, the model's own heights (44f-host-far-data.js, baked by stations/bake_far.py): the central
// island rising 3.6 km 24 km to the west with its cloud cap's green, the floor's gold savannah, and the terminal sea 6-8 km to the
// north-east as flat water at its level. The model's 4 km cells are joined by Catmull-Rom (no facets on the island's flanks), with a
// little relief noise that grows with distance (KRAND.fbm), and the lattice blends into the page's terrainH over its last 1.5 km.
// The planet's curvature drops the far edge (KFAR's curve). Its haze is in its own colours, not the page's fog (below). Colour by height and slope, hazed toward the air with distance.
const FAR=(function(){if(typeof KFAR==='undefined'||!KFAR.grid||typeof FAR_MODEL==='undefined')return null;
 const M=FAR_MODEL,n=M.n,RIN=TERR.R*1.1,ROUT=50000;
 const cr=(p0,p1,p2,p3,t)=>.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);
 const at=(A,i,j)=>{i=Math.max(0,Math.min(n-1,i));j=Math.max(0,Math.min(n-1,j));return A[j*n+i];};
 const mh=(x,z)=>{const u=(x-M.x0)/M.cell,v=(z-M.z0)/M.cell,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,r=[];
  for(let k=-1;k<=2;k++)r.push(cr(at(M.h,i-1,j+k),at(M.h,i,j+k),at(M.h,i+1,j+k),at(M.h,i+2,j+k),fu));return cr(r[0],r[1],r[2],r[3],fv);};
 /* the water level: the nearest water cell's (they are flat seas); null where no water cell is within one cell. A cell at the model's floor (h 1-2:
    the terminal sea's surface at y 0, which the model's water mask leaves unflagged) is the sea too (the quality pass, 2026-11-09: it drew as a flat
    green plain round the jungle station, 50 km of it) */
 const wl=(x,z)=>{const i=Math.round((x-M.x0)/M.cell),j=Math.round((z-M.z0)/M.cell);let best=null,bd=1e9;
  for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){let w=at(M.w,i+a,j+b);if(w==null&&at(M.h,i+a,j+b)<=2)w=0;if(w==null)continue;const d=Math.hypot(a,b);if(d<bd){bd=d;best=w;}}return best;};
 const KF=(x,z,o,s)=>KRAND.fbm(x,0,z,o,s);
 /* the relief between the model's cells: ridged noise (spurs and gullies) whose depth grows with height over the floor, none on the
    flat (the island's flanks are carved, the savannah stays smooth); two octaves, the gullies' spacing ~1.2 and ~0.5 km */
 const ridged=(x,z,f,sd)=>1-Math.abs(2*KF(x*f,z*f,2,sd)-1);
 const farH=(x,z)=>{const r=Math.hypot(x,z),k=smooth(3000,20000,r),b=mh(x,z),relief=smooth(300,2600,b);
  return b+(120*(KF(x*.0006,z*.0006,3,71)-.5)+40*(KF(x*.003,z*.003,2,72)-.5))*(.4+.6*k)
   +relief*(420*(ridged(x+3e4,z,.0008,74)-.62)+160*(ridged(x,z+3e4,.002,75)-.62));};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 let C={sav:L([192,164,88]),sav2:L([164,140,72]),aw:L([128,128,70]),csa:L([104,112,62]),cloud:L([58,92,58]),rock:L([128,116,100]),
  sea:L([150,146,60]),shore:L([220,214,180]),far:L([176,182,178])};   /* far: the 1.94 atm haze, a pale grey-gold */
 if(STATION_PAGE.farPal)for(const k in STATION_PAGE.farPal)C[k]=L(STATION_PAGE.farPal[k]);
 /* the seam: the lowest ground within 150 m along the page's edge, so a gully or a wash that runs off the page opens onto far ground
    below its own floor (the lattice's 250 m cells spanned a gully's mouth at rim height, and the eye looking up it saw the far
    field's underside: sky) */
 const seamH=(x,z)=>{let m=1e9;const ax=Math.abs(x)>=Math.abs(z);for(let k=-5;k<=5;k++){const t=k*30;m=Math.min(m,ax?terrainH(x,z+t):terrainH(x+t,z));}return m;};
 const GL=KFAR.lines({cell:250,inner:4250,out:ROUT,grow:1.07}),rr2=ROUT*ROUT;let isSea=false;
 const G=KFAR.grid({lines:GL,dense:true,curve:{from:RIN},crest:{k:.6,from:8000,to:16000},   /* crest: the island's ridgelines kept sharp on the coarser outer lattice */
  h:(x,z)=>{let h;if(Math.abs(x)<=RIN&&Math.abs(z)<=RIN)h=seamH(x,z)-6;
   else{const xb=Math.max(-RIN,Math.min(RIN,x)),zb=Math.max(-RIN,Math.min(RIN,z)),dO=Math.hypot(x-xb,z-zb);h=farH(x,z);
    if(dO<1500)h+=(seamH(xb,zb)-6-farH(xb,zb))*smooth(1500,0,dO);}
   const w=wl(x,z);return w!=null&&h<w?w:h;},
  skip:(x0,z0,x1,z1)=>(Math.max(Math.abs(x0),Math.abs(x1))<RIN-1&&Math.max(Math.abs(z0),Math.abs(z1))<RIN-1)||Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2,
  color:(x,z,y,q)=>{const h=q.h,w=wl(x,z),n1=KF(x*.002,z*.002,2,73);
   if(w!=null&&h<=w+.5)return mixC(mixC(C.sea,C.shore,.15*n1),C.far,.6*smooth(3000,45000,q.r));
   let c=mixC(C.sav,C.sav2,n1);c=mixC(c,C.aw,smooth(500,1100,h));c=mixC(c,C.csa,smooth(1100,2200,h));c=mixC(c,C.cloud,smooth(2600,3200,h));
   c=mixC(c,C.rock,smooth(.45,.9,q.slope||0)*.7);if(w!=null)c=mixC(c,C.shore,smooth(60,5,h-w)*.6);
   return mixC(c,C.far,.6*smooth(3000,45000,q.r));}});
 camera.far=Math.max(camera.far,ROUT+4000);camera.updateProjectionMatrix();   /* the page's camera ended at 14 km */
 /* no page fog: the shared sky's fog takes the sky's colour toward each pixel over its own distance (KFAR.fogThin cannot thin it), and
    at 26 km it turned the whole island the gold of the horizon haze. The haze is in the colours instead (HAZE, by distance) */
 const mesh=KFAR.mesh(G,{name:'far country',label:'Distant country',material:new THREE.MeshLambertMaterial({vertexColors:true,fog:false}),frustumCulled:false});mesh.userData.probeSkip=true;scene.add(mesh);
 return{mesh,G,H:farH,tris:G.count.tris};})();
