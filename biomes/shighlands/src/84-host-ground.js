// ================================================================= HOST — the ground, the water, the cloud sea, the mist
// One ground mesh painted by the zones (so they read from any distance): chartreuse star moss and dark loam under the
// cloud forest, gold and rust tussock on the paramo, sphagnum green, gold and rust in the bogs with black peat at the
// pools, ochre gravel on the dry side, grey granite on the tors. Then the tarn and the bog pools, and the mist that
// drifts up the ravines and along the cloud deck's edge (the deck is core/atmos's: 89z-host-atmos.js).
TOR.forEach(K=>REGISTER({name:K.name||'A granite tor',x:K.x,z:K.z,y:plateauH(K.x,K.z)-5,r:K.r*1.05,h:K.h+40}));
/* the tors are the ground mesh's own rock (probeSkip), so a bare tor's volume held no sample: one probe point a tor, in the drawn rock at its
   centre (halfway from the plateau to the ground's top there), read by core/host's probe (userData.probePoints) */
{const P=[];TOR.forEach(K=>{const b=plateauH(K.x,K.z),t=terrainH(K.x,K.z),y=Math.min(b+K.h+30,Math.max(b,(b+t)/2));P.push(K.x,y,K.z);});
 const o=new THREE.Object3D();o.name='tor probe points';o.userData.probePoints=P;scene.add(o);}
RAV.forEach((R,i)=>{const z=(R.head+R.foot)/2,x=ravX(R,z);REGISTER({name:'A ravine of the cloud forest',x,z,y:terrainH(x,z)-200,r:R.w*2.2,h:400});});   /* down the face, its middle */

// ---------------------------------------------------------------- the ground
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const LOAM=K(0x3e3828),MOSS=K(0x7a9a34),MOSS2=K(0x9ab040),MOSSD=K(0x4e6a2a),GOLD=K(0xc8ac62),OLIVE=K(0x8a8a4a),RUST=K(0x9a6a3a),GREEN=K(0x7a8a42),
  SPH=K(0xa8b83a),SPHR=K(0xa0582e),PEAT=K(0x3a2e22),OCHRE=K(0xb89a78),GRAV=K(0x9a948a),GRAN=K(0x9a948e),GRAN2=K(0x6e6a68),WETC=K(0x3a4a34);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(x/80+5,y/80-2,.7,2),pav2=fbm(x/40-3,y/40+8,.9,2);
  const fog=FC.at(FC.a.fog,wx,wz),wet=FC.at(FC.a.wet,wx,wz),rock=FC.at(FC.a.rock,wx,wz),bog=FC.at(FC.a.oasis,wx,wz),flow=FC.at(FC.a.flow,wx,wz),slope=FC.at(FC.a.slope,wx,wz);
  // the paramo: gold tussock, olive and green swales, rust patches
  c.copy(GOLD).lerp(OLIVE,smooth(.42,.6,pav)*.8).lerp(GREEN,smooth(.52,.66,pav2)*.75).lerp(RUST,smooth(.62,.72,pav)*.7);c.lerp(GOLD,clamp(.5+n*1.6,0,1)*.15);
  // the dry side: ochre soil and grey gravel showing between the tussocks
  t.copy(OCHRE).lerp(GRAV,smooth(.4,.65,pav2)).lerp(GOLD,.25);c.lerp(t,smooth(.44,.24,wet)*smooth(.5,.25,fog));
  // the elfin band and the cloud forest: moss over dark loam, the moss brighter where it is wettest
  t.copy(MOSS).lerp(MOSS2,clamp(.5+n*2,0,1)*.6).lerp(LOAM,smooth(.5,.72,pav)*.45).lerp(MOSSD,smooth(.3,.45,pav2)*.4);c.lerp(t,smooth(.3,.62,fog));
  // the bogs: sphagnum green, gold and rust, black peat in the wettest hollows
  t.copy(SPH).lerp(SPHR,smooth(.5,.66,pav2)*.7).lerp(GOLD,smooth(.62,.74,pav)*.4).lerp(PEAT,smooth(.82,.95,bog)*smooth(.4,.6,pav)*.7);c.lerp(t,smooth(.45,.8,bog));
  // the streams: dark and wet
  c.lerp(WETC,smooth(.5,.85,flow)*(1-smooth(.4,.7,bog))*.4);
  // the granite (darker in its joints, by slope)
  // the granite (darker in its joints, by slope), mossed over where the cloud reaches it
  t.copy(GRAN).lerp(GRAN2,clamp(.3+n*1.4+smooth(.5,.9,slope)*.45,0,1)).lerp(MOSSD,smooth(.35,.7,fog)*(.55+.3*smooth(.4,.6,pav2)));c.lerp(t,smooth(.3,.65,rock));
  if(typeof STATION_PAINT==='function')STATION_PAINT(c,wx,wz,n,pav,pav2);   /* a station's own ground colours (stations/<name>/), in place of the zones' above */
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// THE TUSSOCK PRINT: a fleck map tiled in world metres, swirled clumps (R: the blades, G: the shadow at each clump's
// foot), laid on the open paramo and the dry side (aPar) so the swirl tussocks read at every distance at no cost in
// triangles; the modelled tussocks fill only the foreground.
const TEX_TUFT=BIO.canvasTex(256,256,(g,w,h)=>{const Rr=new Float32Array(w*h),Gg=new Float32Array(w*h),id=g.createImageData(w,h),d=id.data;
 const dot=(A,cx,cy,r,v)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){const q=Math.hypot(x-cx,y-cy)/r;if(q>1)continue;const k=((y%h+h)%h)*w+((x%w+w)%w);A[k]=Math.max(A[k],v*(1-q*q*.5));}};
 for(let i=0;i<70;i++){const cx=rng()*w,cy=rng()*h,R=rr(6,13);dot(Gg,cx+2,cy+2,R*1.1,.9);
  for(let b=0;b<14;b++){const a0=b*2.4,L=R*rr(.8,1.15);for(let t=0;t<=1;t+=.06){const a=a0+t*.9,r=L*t;dot(Rr,cx+Math.cos(a)*r,cy+Math.sin(a)*r,.9+.5*(1-t),rr(.7,1)*(1-.3*t));}}}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,k=y*w+x;d[i]=Rr[k]*255;d[i+1]=Gg[k]*255;d[i+2]=128;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX_TUFT.wrapS=TEX_TUFT.wrapT=THREE.RepeatWrapping;TEX_TUFT.encoding=THREE.LinearEncoding;TEX_TUFT.anisotropy=4;
// THE LIBRARY GROUND (materials.json ground.moss, ground.wetmoss, ground.paramo, ground.sphagnum; core/materials/PLAN.md, Southern
// highlands): four layers over the painted ground, blended per vertex by the zones (aGL: forest moss, paramo grass, bog sphagnum; the wet
// soil in the cloud forest's hollows where a slow noise runs high, and a little on the bog's rim), each mixed with the painted colour so the
// zones' tones still show; the sphagnum keeps most of its own colour (green, gold and rust are the point). The final rebuild (pair 12,
// BACKPORT.md's ground set): the layers are core/terrain's ground shader's (KGROUND, 43-core-ground.js: Mikkelsen's hex tiling, which this
// page wrote for itself, scaled with distance and blended by height), with the same weights and strengths as the page's own mix had, and its
// relief (bump and the mesh's hollows: core/terrain/GROUND.md). On KGROUND the ground is MeshStandard, so the relief reaches the light per
// pixel (r128's Lambert lights per vertex, and never uploads the eye a far scale reads). On top, slow macro noise (TEX_MACRO, ~250 m) varies
// the layers' brightness and drifts their hue between redder and greener stretches, as before. ?kground=0 the page's Lambert ground and
// no library layers (the painted one), ?kgrelief=0 no relief; without the pack (?mat=proc, or an open world) the ground is the painted one.
// TEX_MACRO: three independent SEAMLESS value noises (r, g, b), periodic on their lattice, so its own tiling never shows
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const vn=(x,y,P,o)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy),a=(p,q)=>BIO.fn.h3(((p%P)+P)%P,((q%P)+P)%P,o);
  return mix(mix(a(i,j),a(i+1,j),ux),mix(a(i,j+1),a(i+1,j+1),ux),uy);};
 const fb=(x,y,o)=>{let v=0,amp=.5,t=0;for(let k=0;k<4;k++){const P=4<<k;v+=amp*vn(x/w*P,y/h*P,P,o+k);t+=amp;amp*=.5;}return v/t;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;for(let c=0;c<3;c++)d[k+c]=clamp((fb(x,y,31+c*7)-.5)*2.4+.5,0,1)*255;d[k+3]=255;}
 g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0',KG_RELIEF=KG_ON&&new URLSearchParams(location.search).get('kgrelief')!=='0';
const KGL=(function(){if(!KG_ON)return[];
 if(typeof STATION_KGL==='function')return STATION_KGL();   /* a station's layers on the same three weights (STATION_GL fills them) */
 const m=KGROUND.layer('shigh','ground.moss',{w:'vGL.x*(1.0-kgWet)',amt:.55,gain:1.3,tint:'diffuse',name:'forest moss'}),
  w=KGROUND.layer('shigh','ground.wetmoss',{w:'clamp(vGL.x*kgWet+vGL.z*kgWetB,0.0,1.0)',amt:.6,gain:1.3,tint:'diffuse',name:'wet soil'}),
  p=KGROUND.layer('shigh','ground.paramo',{w:'vGL.y',amt:.5,gain:1.3,tint:'diffuse',name:'paramo grass'}),
  b=KGROUND.layer('shigh','ground.sphagnum',{w:'vGL.z',amt:.85,gain:1.3,tint:'diffuse',name:'sphagnum'});
 return m&&p&&b?[m,p,b,w]:[];})();
const MAT_GROUND=KG_ON?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xaaa69e,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xaaa69e});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uGran={value:SHIGH.ROCKTEX};sh.uniforms.uTuft={value:TEX_TUFT};sh.uniforms.uMacro={value:TEX_MACRO};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aRock;varying float vRock;attribute float aPar;varying float vPar;attribute vec3 aGL;varying vec3 vGL;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vRock=aRock;vPar=aPar;vGL=aGL;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uGran,uTuft;varying vec3 vGWP;varying float vRock;varying float vPar;varying vec3 vGL;uniform sampler2D uMacro;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'+
  'vec3 gr=pow(texture2D(uGran,vGWP.xz*0.11+vGWP.y*0.03).rgb,vec3(2.2));'+
  (KGL.length?'{vec3 mc2=texture2D(uMacro,vGWP.xz*0.0039+vec2(0.43,0.19)).rgb;float kgWet=smoothstep(0.5,0.72,mc2.g)*0.85,kgWetB=smoothstep(0.35,0.7,mc2.g)*0.3;'+
   '/*KGROUND*/'+
   // the slow variation over the layers: brightness, and a drift between redder and greener stretches (stronger in the bog, as real ones are)
   'float tone=mix(0.86,1.1,mc2.b);vec3 hue=mix(vec3(1.05,0.97,0.93),vec3(0.95,1.03,0.97),smoothstep(0.3,0.7,mc2.r));'+
   'vec3 hueB=mix(vec3(1.1,0.94,0.89),vec3(0.91,1.06,0.93),smoothstep(0.3,0.7,mc2.r));float lw=clamp(vGL.x*0.55+vGL.y*0.5,0.0,1.0),bw=clamp(vGL.z*0.85,0.0,1.0);'+
   'vec3 vary=mix(vec3(1.0),tone*hue,lw);vary=mix(vary,mix(0.8,1.12,mc2.b)*hueB,bw);diffuseColor.rgb*=vary;}':'')+
  'diffuseColor.rgb*=mix(dt*dt2*1.12,gr*2.6,vRock*0.7);'+
  /* the tussock print (a station with STATION_TUFT false uses vPar for its own term instead) */
  (typeof STATION_TUFT!=='undefined'&&!STATION_TUFT?'':'vec2 t1=texture2D(uTuft,vGWP.xz*0.21).rg,t2=texture2D(uTuft,vGWP.xz*0.083+vec2(0.41,0.17)).rg;float tb=max(t1.r,t2.r*0.8),ts=max(t1.g,t2.g*0.8);'+
  'diffuseColor.rgb*=1.0-ts*0.4*vPar;diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.62,0.5,0.24)*(1.0+0.5*tb),tb*vPar*0.75);')+
  (typeof STATION_GROUND_GLSL==='string'?STATION_GROUND_GLSL:'')+'}');};   /* a station's own ground term (the fellfield's sorted-stone spirals) */
if(KG_ON)KGROUND.hook(MAT_GROUND,{layers:KGL,key:'shigh-ground',relief:KG_RELIEF&&KGL.length?{bump:.075,cavity:.8,mesh:1}:null});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),rk=new Float32Array(nx*nx),par=new Float32Array(nx*nx),gl=new Float32Array(nx*nx*3);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  rk[k]=smooth(.3,.65,FC.at(FC.a.rock,x,z));par[k]=(1-smooth(.4,.7,FC.at(FC.a.fog,x,z)))*(1-smooth(.4,.75,FC.at(FC.a.oasis,x,z)))*(1-rk[k]);
  if(typeof STATION_GL==='function'){const w=STATION_GL(x,z,rk[k]);gl[k*3]=w[0];gl[k*3+1]=w[1];gl[k*3+2]=w[2];par[k]*=w[3]==null?0:w[3];continue;}
  {const fog=FC.at(FC.a.fog,x,z),bog=smooth(.45,.8,FC.at(FC.a.oasis,x,z))*(1-rk[k]),open=(1-bog)*(1-rk[k]),f=smooth(.32,.62,fog);gl[k*3]=f*open;gl[k*3+1]=(1-f)*open;gl[k*3+2]=bog;}}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aPar',new THREE.BufferAttribute(par,1));g.setAttribute('aGL',new THREE.BufferAttribute(gl,3));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF&&KGL.length)KGROUND.cavityMesh(m);m.userData.probeSkip=true;m.userData.inspectLabel='The southern highlands';scene.add(m);return m;})();

// ---------------------------------------------------------------- the water (the tarn, the bog pools)
/* the tarn, the bog pools and the ravine streams are core/water's now: 89zw-host-water.js */
REGISTER({name:'The tarn',x:TARN.x,z:TARN.z,y:TARNL-8,r:TARN.r*1.5,h:30});

// ---------------------------------------------------------------- THE CLOUD SEA
// The deck itself is core/atmos's (89-atmos-d-clouddeck.js, bound in 89z-host-atmos.js): a field a game engine draws the
// same way. Only the mist below is this host's own.

// ---------------------------------------------------------------- the mist
// Soft sprites stand along the cloud deck's edge where it laps against the scarp, and climb the ravines (the cloud
// pours up them); a few low sheets lie in the bog hollows. All drift, and keep to the ground's height as they go.
const MIST=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),id=g.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const dx=(x-64)/64,dy=(y-64)/64,r=Math.hypot(dx,dy),a=clamp(1-r,0,1)*(.55+.45*fbm(x/22,y/22,3,3));id.data[(y*128+x)*4]=id.data[(y*128+x)*4+1]=id.data[(y*128+x)*4+2]=255;id.data[(y*128+x)*4+3]=clamp(a*a*255,0,255);}
 g.putImageData(id,0,0);const tex=new THREE.CanvasTexture(c);
 const sheetM=new THREE.MeshBasicMaterial({map:tex,color:0xe4eaec,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide});
 const spriteM=new THREE.SpriteMaterial({map:tex,color:0xeef2f2,transparent:true,opacity:.32,depthWrite:false});
 const L=[];reseed(84047);
 const place=(kind,x,z,lift,sz)=>{const h=FC.at(FC.a.h,x,z);let o;
  if(kind==='sheet'){o=new THREE.Mesh(new THREE.PlaneGeometry(rr(120,260),rr(60,140)),sheetM);o.rotation.x=-Math.PI/2;o.rotation.z=rr(0,TAU);}
  else{o=new THREE.Sprite(spriteM);const s=sz||rr(80,200);o.scale.set(s,s*rr(.35,.55),1);}
  o.position.set(x,Math.max(h,CLOUD_Y-10)+lift,z);o.userData.probeSkip=true;o.renderOrder=3;scene.add(o);L.push({o,ax:x,az:z,lift,ph:rr(0,TAU),sp:rr(.012,.035),amp:rr(20,60)});};
 // along the deck's edge: where the ground stands just above CLOUD_Y
 let tries=0,n=0;while(n<44&&tries++<9000){const x=rr(-2700,2700),z=rr(-2800,0),h=FC.at(FC.a.h,x,z);if(Math.abs(h-CLOUD_Y-20)>40)continue;place('sprite',x,z,rr(6,30),rr(120,260));n++;}
 // up the ravines
 RAV.forEach(R=>{for(let z=Math.max(R.foot,DECK_Z)+60;z<R.head-200;z+=rr(110,180))if(FC.at(FC.a.fog,ravX(R,z),z)>.3)place('sprite',ravX(R,z)+rr(-30,30),z,rr(8,26),rr(70,160));});   /* up the ravines while the cloud reaches them */
 // the bog hollows: low sheets
 BOGS.forEach(B=>{for(let k=0;k<3;k++)place('sheet',B.x+rr(-B.r*.4,B.r*.4),B.z+rr(-B.r*.4,B.r*.4),rr(2,6));});
 tick((dt,t)=>{for(const m of L){const x=m.ax+Math.sin(t*m.sp+m.ph)*m.amp,z=m.az+Math.cos(t*m.sp*.7+m.ph)*m.amp*.6;m.o.position.x=x;m.o.position.z=z;m.o.position.y=Math.max(FC.at(FC.a.h,x,z),CLOUD_Y-10)+m.lift;}});
 return{L,sheetM,spriteM};})();
