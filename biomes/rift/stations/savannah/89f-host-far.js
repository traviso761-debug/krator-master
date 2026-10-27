// ================================================================= HOST — station 1's far country: the scale model round it (core/terrain KFAR)
// Beyond the ground square, out to 50 km, the model's own heights (44f-host-far-data.js, baked by stations/bake_far.py): the central
// island rising 3.6 km 24 km to the west with its cloud cap's green, the floor's gold savannah, and the terminal sea 6-8 km to the
// north-east as flat water at its level. The model's 4 km cells are joined by Catmull-Rom (no facets on the island's flanks), with a
// little relief noise that grows with distance (KRAND.fbm), and the lattice blends into the page's terrainH over its last 1.5 km.
// The planet's curvature drops the far edge (KFAR's curve). Its fog is thinned to .08 of the page's (KFAR.fogThin): at the page's
// density the 1.94 atm haze swallowed the island whole at 24 km. Colour by height and slope, hazed toward the air with distance.
const FAR=(function(){if(typeof KFAR==='undefined'||!KFAR.grid||typeof FAR_MODEL==='undefined')return null;
 const M=FAR_MODEL,n=M.n,RIN=TERR.R*1.1,ROUT=50000;
 const cr=(p0,p1,p2,p3,t)=>.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);
 const at=(A,i,j)=>{i=Math.max(0,Math.min(n-1,i));j=Math.max(0,Math.min(n-1,j));return A[j*n+i];};
 const mh=(x,z)=>{const u=(x-M.x0)/M.cell,v=(z-M.z0)/M.cell,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,r=[];
  for(let k=-1;k<=2;k++)r.push(cr(at(M.h,i-1,j+k),at(M.h,i,j+k),at(M.h,i+1,j+k),at(M.h,i+2,j+k),fu));return cr(r[0],r[1],r[2],r[3],fv);};
 /* the water level: the nearest water cell's (they are flat seas); null where no water cell is within one cell */
 const wl=(x,z)=>{const i=Math.round((x-M.x0)/M.cell),j=Math.round((z-M.z0)/M.cell);let best=null,bd=1e9;
  for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const w=at(M.w,i+a,j+b);if(w==null)continue;const d=Math.hypot(a,b);if(d<bd){bd=d;best=w;}}return best;};
 const KF=(x,z,o,s)=>KRAND.fbm(x,0,z,o,s);
 const farH=(x,z)=>{const r=Math.hypot(x,z),k=smooth(3000,20000,r);return mh(x,z)+(120*(KF(x*.0006,z*.0006,3,71)-.5)+40*(KF(x*.003,z*.003,2,72)-.5))*(.4+.6*k);};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={sav:L([192,164,88]),sav2:L([164,140,72]),aw:L([128,128,70]),csa:L([104,112,62]),cloud:L([58,92,58]),rock:L([128,116,100]),
  sea:L([150,146,60]),shore:L([220,214,180]),far:L([150,160,168])};
 const GL=KFAR.lines({cell:250,inner:4250,out:ROUT,grow:1.07}),rr2=ROUT*ROUT;let isSea=false;
 const G=KFAR.grid({lines:GL,dense:true,curve:{from:RIN},
  h:(x,z)=>{let h;if(Math.abs(x)<=RIN&&Math.abs(z)<=RIN)h=terrainH(x,z)-4;
   else{const xb=Math.max(-RIN,Math.min(RIN,x)),zb=Math.max(-RIN,Math.min(RIN,z)),dO=Math.hypot(x-xb,z-zb);h=farH(x,z);
    if(dO<1500)h+=(terrainH(xb,zb)-farH(xb,zb))*smooth(1500,0,dO);}
   const w=wl(x,z);return w!=null&&h<w?w:h;},
  skip:(x0,z0,x1,z1)=>(Math.max(Math.abs(x0),Math.abs(x1))<RIN-1&&Math.max(Math.abs(z0),Math.abs(z1))<RIN-1)||Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2,
  color:(x,z,y,q)=>{const h=q.h,w=wl(x,z),n1=KF(x*.002,z*.002,2,73);
   if(w!=null&&h<=w+.5)return mixC(mixC(C.sea,C.shore,.15*n1),C.far,.35*smooth(4000,40000,q.r));
   let c=mixC(C.sav,C.sav2,n1);c=mixC(c,C.aw,smooth(500,1100,h));c=mixC(c,C.csa,smooth(1100,2200,h));c=mixC(c,C.cloud,smooth(2600,3200,h));
   c=mixC(c,C.rock,smooth(.45,.9,q.slope||0)*.7);if(w!=null)c=mixC(c,C.shore,smooth(60,5,h-w)*.6);
   return mixC(c,C.far,.45*smooth(4000,40000,q.r));}});
 camera.far=Math.max(camera.far,ROUT+4000);camera.updateProjectionMatrix();   /* the page's camera ended at 14 km */
 const mesh=KFAR.mesh(G,{name:'far country',label:'Distant country',fogK:.08,frustumCulled:false});mesh.userData.probeSkip=true;scene.add(mesh);
 return{mesh,G,H:farH,tris:G.count.tris};})();
