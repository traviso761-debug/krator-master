// ================================================================= HOST — the far country (KFAR, core/terrain/44; 2026-11-23, KNOWN_ISSUES.md "The far field")
// Each station's land past the map is the scale model's (5.1): its region (REGION_DATA, build.py from region.json: tools/sites51.py sited it and the
// Godthrone's tools/region.py baked it, a 2 km lattice of heights round the site) read through the Godthrone's REGION (45a5, read in place). The
// ring is one coarse KFAR mesh round the map square out to 60 km: at the map's edge it is the page's own ground (terrainH), and past it eases to the
// model's relief, measured from the page's own centre (each station is an ideal type: its heights stay its own, the model's shape is round them).
// Below the Ring Sea (-1,500 m on the model) it lies flat at the page's sea level, the sea's colour. KHORIZON (89zz) reads it past the map (FAR.G.at,
// FAR.R). Its colours by the model's height and the slope: the station's floor colour low (FAR_LOW, a station's 45 may set it), rock on the steep,
// bare high ground above 3.5 km, snow above 5 km. Without a region or under ?far=0, none (the sky's ridges stand in, as before).
const FAR=(function(){if(typeof KFAR==='undefined'||typeof REGION==='undefined'||!REGION||(typeof CORE_Q!=='undefined'&&CORE_Q.get('far')==='0'))return null;
 const RIN=TERR.R,ROUT=60000,R1=RIN*2.4,Y0=terrainH(0,0),D=REGION.D,SEAM=-1500,SEAP=typeof SEA!=='undefined'?SEA:null;
 const CELL=typeof FAR_CELL!=='undefined'?FAR_CELL:220;   /* station 1 coarser: it stands at its triangle ceiling */
 const GL=KFAR.lines({cell:CELL,inner:RIN*2,out:ROUT,grow:1.07});
 const L=h=>[Math.pow(((h>>16)&255)/255,2.2),Math.pow(((h>>8)&255)/255,2.2),Math.pow((h&255)/255,2.2)],mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={low:L(typeof FAR_LOW!=='undefined'?FAR_LOW:0x5a5a40),rock:L(0x4a4642),bare:L(0x6a645c),snow:L(0xe4e8ee),sea:L(0x1a3a46)};
 const abs=(x,z)=>D.y0+REGION.h(x,z);   /* the model's own height there */
 const sea=(x,z)=>SEAP!=null&&abs(x,z)<SEAM&&Math.max(Math.abs(x),Math.abs(z))>RIN;
 const rr2=(ROUT-500)*(ROUT-500);
 const G=KFAR.grid({lines:GL,dense:true,
  h:(x,z)=>{if(sea(x,z))return SEAP;const r=Math.max(Math.abs(x),Math.abs(z));const lo=terrainH(x,z);return r<=RIN?lo:REGION.blend(lo,x,z,RIN,R1,Y0);},
  skip:(x0,z0,x1,z1)=>(x0>=-RIN&&x1<=RIN&&z0>=-RIN&&z1<=RIN)||Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2,
  color:(x,z,y,q)=>{if(sea(x,z))return C.sea;const a=abs(x,z),sl=q.slope||0;let c=mixC(C.low,C.bare,smooth(2800,3800,a));
   c=mixC(c,C.rock,smooth(.35,.8,sl));return mixC(c,C.snow,smooth(4700,5300,a)*(1-smooth(.6,.9,sl)*.6));}});
 const mesh=KFAR.mesh(G,{name:'far:country',label:'The Throne round the station (the far country, scale model 5.1)'});
 mesh.frustumCulled=false;mesh.userData.probeSkip=true;mesh.userData.farField=true;scene.add(mesh);
 REGISTER({name:'The Throne round the station (the far country)',x:0,z:0,y:Y0-6000,r:ROUT,h:14000,far:true});
 return{mesh,G,R:ROUT,tris:G.count?G.count.tris:0,site:[D.px,D.py]};})();
