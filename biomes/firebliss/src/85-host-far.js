// ================================================================= HOST — the country past the map (the final rebuild's ground set)
// core/terrain's far field (KFAR) carries the land on to 14 km on the model's own heights (MODEL.h and the stage's detail, no thermal ground), sunk
// under the square so nothing fights the ground: the tarn on past the page, the walls rising to the spine, Mons' cone and the other craters where they
// are in reach. The model's water cells (FB_MODEL.wl) are water in the far field at their own levels. KHORIZON is baked over the square with this
// lattice past it: the walls' shadow on the ground and, after the bake (89z), on what stands on it. ?far=0 none of it, ?hz=0 no horizon.
const WL=(function(){const M=FB_MODEL,n=M.n;return(x,z)=>{const i=Math.round(M.px+x/M.cell-M.i0),j=Math.round(M.py+z/M.cell-M.j0);if(i<0||j<0||i>=n||j>=n)return null;return M.wl[j*n+i];};})();
const FAR=(function(){
 if(GQ.get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={green:L([92,112,64]),soil:L([96,86,72]),ash:L([88,86,82]),cinder:L([104,78,66]),rock:L([84,80,78]),snow:L([232,236,242]),water:L([70,120,118]),far:L([160,166,178])};
 const top=SITE.tarn?LEVEL+(SITE.floor||[0,200])[1]:-1e9;
 const farH=(x,z)=>{const h=land0(x,z),w=WL(x,z);return w!=null&&h<w?w:h;};
 const colr=(x,z,y,q)=>{const n1=clamp(KRAND.fbm(x*.002,.5,z*.002,2,414)*.6+KRAND.fbm(x*.011,.5,z*.011,2,415)*.6-.1,0,1),w=WL(x,z);
  let c=mixC(C.ash,C.cinder,smooth(.4,.7,n1)*.6);if(SITE.tarn)c=mixC(c,mixC(C.green,C.soil,smooth(.4,.7,n1)),smooth(top+60,top-60,y));
  c=mixC(c,C.rock,smooth(3600,4600,y)*(.4+.4*n1));c=mixC(c,C.snow,smooth(SITE.snowLine[0],SITE.snowLine[1],y)*smooth(.2,.6,n1+.2));
  if(w!=null&&y<=w+.5)c=C.water;
  return mixC(c,C.far,.5*smooth(4500,13000,q.r));};
 const G0=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>Math.abs(x)<S0&&Math.abs(z)<S0?terrainH(x,z)-SINK:farH(x,z),
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the ground's square */
  color:colr});
 const geo=KFAR.geometry(G0),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'firebliss-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=SITE.region+' past the map';scene.add(mesh);
 return{mesh,mat,G:G0,tris:G0.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side) and the far field past it
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||GQ.get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
