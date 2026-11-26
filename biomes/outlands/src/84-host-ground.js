// ================================================================= HOST — the ground: the bands, the rock's beds, the colonies' seams
// One ground mesh painted by the slope's bands (so they read from any distance) and by the COLONIES (PLAN.md section 4, "Territories
// and seams"): each territory takes a faint cast of its type (the fog pelt's violet-teal under the veil colonies, the mast colonies'
// dark wet loam, the copper colonies' gravel greened where they feed), and every SEAM between two colonies is painted as a dark zone
// line, so from the crest the slope reads as a cracked mosaic; a young colony's growing edge shows as a fairy ring. Where the rock
// shows (the wall's benches, the buttes' sides, the pit's faces, the wadis' banks) the colour is the strata's own bed (KSTRATA's
// 'outland' recipe: red basalt, pale tuff, red beds, the copper and turquoise bands). Over it, core/terrain's ground shader (KGROUND)
// lays the library's layers: the fog crust under the belt, the wadis' cobble, the shoulder's gravelly sand.
BUTTES.forEach(B=>REGISTER({name:B.name||'A butte of the gem shoulder',x:B.x,z:B.z,y:slopeH(B.x,B.z)-10,r:B.r*1.05,h:B.h+40}));
REGISTER({name:'The open-cast working (the Peak tribe\'s copper pit)',x:PIT.c[0],z:PIT.c[1],y:PIT.rimY-PIT.depth-5,r:PIT.r*1.6,h:PIT.depth+40});
RAV.forEach((R,i)=>{const z=-1500,x=ravX(R,z);REGISTER({name:'A ravine down the fog wall',x,z,y:terrainH(x,z)-120,r:R.w*2,h:260});});
WADIS.forEach((W,i)=>{const P=W.pts[Math.floor(W.pts.length*.4)];REGISTER({name:'A wadi across the gem shoulder',x:P.x,z:P.z,y:P.y-8,r:W.pts[0].w*2.5,h:30});});

// ---------------------------------------------------------------- the painted ground
window._groundMs=0;
OUTL.SEEDS=WADI_SEEDS;
const TEX_GROUND=(function(){const t0=performance.now(),S=TERR.R*2.2,COL=OUTL.colonyMap(TERR.R-150),A={},SA={};
 const K=hx=>new THREE.Color(hx),c=new THREE.Color(),t=new THREE.Color();
 const PELT=K(0x5a4e6a),PELT2=K(0x46606a),LOAM=K(0x3e3a30),MOSSY=K(0x4e5e44),GRAV=K(0x94705c),GRAV2=K(0x7e5e4c),SAND=K(0xa6826a),COBBLE=K(0x9a8e80),
  GREEN=K(0x6a8a62),SEAM=K(0x2a2026),RING=K(0xd8d0b8),CREST=K(0x8a7e78),SNOWY=K(0xc8c4c0);
 const tint={veil:K(0x5c4e74),mast:K(0x3e5a4a),copper:K(0x7a8a66),wadi:K(0x8a9a5a)};
 const tex=BIO.canvasTex(1280,1280,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,wx=(x/w-.5)*S,wz=(y/h-.5)*S;
   const n=fbm(x/22,y/22,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(x/70+5,y/70-2,.7,2),pav2=fbm(x/36-3,y/36+8,.9,2);
   const H=FC.at(FC.a.h,wx,wz),fg=FC.at(FC.a.fog,wx,wz),rk=FC.at(FC.a.rock,wx,wz),ms=FC.at(FC.a.mast,wx,wz),dr=FC.at(FC.a.dry,wx,wz),wd=FC.at(FC.a.wadi,wx,wz),sp=FC.at(FC.a.seep,wx,wz);
   // the shoulder: red-brown gravel and sand, darker in swales
   c.copy(GRAV).lerp(SAND,smooth(.4,.65,pav)*.7).lerp(GRAV2,smooth(.55,.75,pav2)*.5);
   // the mast band: dark wet loam and moss
   t.copy(LOAM).lerp(MOSSY,smooth(.4,.7,pav2)*.7);c.lerp(t,smooth(.2,.7,ms)*(1-dr*.5));
   // the fog wall: the fog pelt's violet and teal
   t.copy(PELT).lerp(PELT2,smooth(.35,.65,pav)).lerp(LOAM,smooth(.6,.8,pav2)*.3);c.lerp(t,smooth(.35,.7,fg));
   // the crest above the belt: wind-scoured grey
   c.lerp(CREST,smooth(4380,4500,H)*.7);
   // the seeps: dark wet streaks
   c.lerp(LOAM,sp*.55);
   // the wadis' cobble floors
   c.lerp(COBBLE,smooth(.4,.9,wd)*.8);
   // the rock where it shows: the strata's bed at the ground (its colour sRGB 0..1)
   // weathered (varnish and grime darken the beds' fresh colours) and, in the belt, crusted over by the fog pelt: the colonies take bare rock
   if(rk>.12){STRATA.at(wx,H,wz,SA);t.setRGB(SA.colour[0]*.72,SA.colour[1]*.7,SA.colour[2]*.7);t.lerp(PELT,smooth(.4,.8,fg)*.55);c.lerp(t,smooth(.12,.55,rk)*.9);}
   // THE COLONIES: a faint cast of the type over its territory, a fairy ring at a young colony's edge, the seam's dark line
   COL.at(wx,wz,A);
   if(A.c){const ty=tint[A.c.type];if(ty)c.lerp(ty,.14*(1-rk));
    if(A.c.age<.4&&!A.c2&&A.ring<5)c.lerp(RING,.35*(1-rk));
    if(A.seam)c.lerp(SEAM,.78);else if(A.c2&&A.gap<COL.seamWidth(A.c,A.c2))c.lerp(SEAM,.25);}
   const k=1+n*.10+n2*.05;
   d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 window._groundMs=Math.round(performance.now()-t0);return tex;})();
// THE LIBRARY GROUND (materials.json: ground.fogcrust, ground.cobble, ground.gravel): three layers over the painted ground, blended per
// vertex (aGL): x the fog crust where the belt lies, y the wadis' cobble, z the shoulder's gravelly sand; mixed with the paint so the
// territories and the seams still show. ?kground=0 the painted ground alone
const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0',KG_RELIEF=KG_ON&&new URLSearchParams(location.search).get('kgrelief')!=='0';
const KGL=(function(){if(!KG_ON)return[];
 const f=KGROUND.layer('outl','ground.fogcrust',{w:'vGL.x',amt:.45,gain:1.25,tint:'diffuse',name:'fog crust'}),
  w=KGROUND.layer('outl','ground.cobble',{w:'vGL.y',amt:.7,gain:1.2,tint:'diffuse',name:'wadi cobble'}),
  s=KGROUND.layer('outl','ground.gravel',{w:'vGL.z',amt:.5,gain:1.2,tint:'diffuse',name:'gravelly sand'});
 return f&&w&&s?[f,w,s]:[];})();
const MAT_GROUND=KG_ON?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xb0aaa4,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xb0aaa4});
/* the fine detail is the library layers' (KGROUND); the paint carries the bands, the rock's beds and the seams */
MAT_GROUND.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec3 aGL;varying vec3 vGL;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGL=aGL;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGL;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{'+(KGL.length?'/*KGROUND*/':'')+'}');};
if(KG_ON)KGROUND.hook(MAT_GROUND,{layers:KGL,key:'outl-ground',relief:KG_RELIEF&&KGL.length?{bump:.07,cavity:.8,mesh:1}:null});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*3);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const rk=smooth(.2,.6,FC.at(FC.a.rock,x,z)),wd=smooth(.3,.9,FC.at(FC.a.wadi,x,z))*(1-rk),f=smooth(.35,.7,FC.at(FC.a.fog,x,z))*(1-rk)*(1-wd),dr=smooth(.3,.8,FC.at(FC.a.dry,x,z))*(1-rk)*(1-wd);
  gl[k*3]=f;gl[k*3+1]=wd;gl[k*3+2]=dr;}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aGL',new THREE.BufferAttribute(gl,3));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF&&KGL.length)KGROUND.cavityMesh(m);
 m.userData.probeSkip=true;m.userData.inspectLabel='The Outlands: the fog wall';scene.add(m);return m;})();
// the buttes and the pit are the ground mesh's own (probeSkip): one probe point each, in the drawn ground at its middle
{const P=[];BUTTES.forEach(B=>P.push(B.x,terrainH(B.x,B.z)-5,B.z));P.push(PIT.c[0],terrainH(PIT.c[0],PIT.c[1])+2,PIT.c[1]);
 RAV.forEach(R=>{const z=-1500,x=ravX(R,z);P.push(x,terrainH(x,z)+2,z);});WADIS.forEach(W=>{const p=W.pts[Math.floor(W.pts.length*.4)];P.push(p.x,terrainH(p.x,p.z)+1,p.z);});
 const o=new THREE.Object3D();o.name='landform probe points';o.userData.probePoints=P;scene.add(o);}
