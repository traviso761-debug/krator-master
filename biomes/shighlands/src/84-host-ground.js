// ================================================================= HOST — the ground, the water, the cloud sea, the mist
// One ground mesh painted by the zones (so they read from any distance): chartreuse star moss and dark loam under the
// cloud forest, gold and rust tussock on the paramo, sphagnum green, gold and rust in the bogs with black peat at the
// pools, ochre gravel on the dry side, grey granite on the tors. Then the tarn and the bog pools; then THE CLOUD SEA,
// a level deck at CLOUD_Y over everything north of the rim, thinning to nothing where it laps against the ground; and
// the mist that drifts up the ravines and along the deck's edge.
REGISTER({name:'The cloud sea (the hyperjungle\'s air, pooled below the Wall)',x:0,z:-2600,y:CLOUD_Y-60,r:1400,h:90});
TOR.forEach(K=>REGISTER({name:K.name||'A granite tor',x:K.x,z:K.z,y:plateauH(K.x,K.z)-5,r:K.r*1.05,h:K.h+40}));
RAV.forEach((R,i)=>REGISTER({name:'A ravine of the cloud forest',x:ravX(R,R.head-400),z:R.head-400,y:plateauH(ravX(R,R.head-400),R.head-400)-200,r:R.w*2.2,h:240}));

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
  c.lerp(WETC,smooth(.5,.85,flow)*(1-smooth(.4,.7,bog))*.7);
  // the granite (darker in its joints, by slope)
  // the granite (darker in its joints, by slope), mossed over where the cloud reaches it
  t.copy(GRAN).lerp(GRAN2,clamp(.3+n*1.4+smooth(.5,.9,slope)*.45,0,1)).lerp(MOSSD,smooth(.35,.7,fog)*(.55+.3*smooth(.4,.6,pav2)));c.lerp(t,smooth(.3,.65,rock));
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
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xaaa69e});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uGran={value:SHIGH.ROCKTEX};sh.uniforms.uTuft={value:TEX_TUFT};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aRock;varying float vRock;attribute float aPar;varying float vPar;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vRock=aRock;vPar=aPar;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uGran,uTuft;varying vec3 vGWP;varying float vRock;varying float vPar;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'+
  'vec3 gr=pow(texture2D(uGran,vGWP.xz*0.11+vGWP.y*0.03).rgb,vec3(2.2));'+
  'diffuseColor.rgb*=mix(dt*dt2*1.12,gr*2.6,vRock*0.7);'+
  'vec2 t1=texture2D(uTuft,vGWP.xz*0.21).rg,t2=texture2D(uTuft,vGWP.xz*0.083+vec2(0.41,0.17)).rg;float tb=max(t1.r,t2.r*0.8),ts=max(t1.g,t2.g*0.8);'+
  'diffuseColor.rgb*=1.0-ts*0.4*vPar;diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.62,0.5,0.24)*(1.0+0.5*tb),tb*vPar*0.75);}');};
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),rk=new Float32Array(nx*nx),par=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  rk[k]=smooth(.3,.65,FC.at(FC.a.rock,x,z));par[k]=(1-smooth(.4,.7,FC.at(FC.a.fog,x,z)))*(1-smooth(.4,.75,FC.at(FC.a.oasis,x,z)))*(1-rk[k]);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aPar',new THREE.BufferAttribute(par,1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The southern highlands';scene.add(m);return m;})();

// ---------------------------------------------------------------- the water (the tarn, the bog pools)
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1000,900,-700).normalize()},uSky:{value:new THREE.Color(0xc8d4e0)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' vec3 n=normalize(vec3(0.03*sin(vWP.x*0.41+uT*1.1)+0.02*sin(vWP.z*0.63-uT*0.7),1.0,0.03*cos(vWP.z*0.37+uT*0.9)));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.12+fr*0.62);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.8*vec3(1.0,0.97,0.92);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
function waterDisc(X,Z,R,L,name,c0h,c1h){const c0=new THREE.Color(c0h).convertSRGBToLinear(),c1=new THREE.Color(c1h).convertSRGBToLinear(),PN=32,pos=[X,L,Z],col=[c0.r,c0.g,c0.b],idx=[];
 for(let k=0;k<=PN;k++){const a=k/PN*TAU;pos.push(X+Math.cos(a)*R,L,Z+Math.sin(a)*R);col.push(c1.r,c1.g,c1.b);}for(let k=0;k<PN;k++)idx.push(0,k+2,k+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel=name;m.renderOrder=1;scene.add(m);return m;}
waterDisc(TARN.x,TARN.z,TARN.r*1.35,TARNL,'The tarn',0x1e2e2e,0x4a5a4a);
REGISTER({name:'The tarn',x:TARN.x,z:TARN.z,y:TARNL-8,r:TARN.r*1.5,h:30});
POOLS.forEach(P=>waterDisc(P.x,P.z,P.r*1.25,P.l,'A bog pool',0x1a1a14,0x3a3a28));

// ---------------------------------------------------------------- THE CLOUD SEA
// A level deck at CLOUD_Y north of the rim: billowing white, lit from above, blue-grey in its hollows, drifting
// slowly. Its alpha is a baked mask that thins it to nothing over the last ~45 m where the ground rises through it,
// so the cloud laps against the scarp instead of cutting it with a hard line; mist sprites (below) soften the rest.
const CLOUD=(function(){const N=256,S=TERR.R*2.2,data=new Uint8Array(N*N*4);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,h=FC.at(FC.a.h,x,z),a=smooth(-6,45,CLOUD_Y-h),k=(j*N+i)*4;data[k]=data[k+1]=data[k+2]=255;data[k+3]=a*255;}
 const mask=new THREE.DataTexture(data,N,N,THREE.RGBAFormat);mask.magFilter=THREE.LinearFilter;mask.minFilter=THREE.LinearFilter;mask.wrapS=mask.wrapT=THREE.ClampToEdgeWrapping;mask.needsUpdate=true;
 // a SEAMLESS noise (value noise on a lattice that wraps, four octaves): a tiled texture must not show its tile edges
 const noise=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data,hs=(i,j,o)=>BIO.fn.h3(i,j,o);
  const vn=(x,y,P,o)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy),a=(p,q)=>hs(((p%P)+P)%P,((q%P)+P)%P,o);
   return mix(mix(a(i,j),a(i+1,j),ux),mix(a(i,j+1),a(i+1,j+1),ux),uy);};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0,amp=.5,tot=0;for(let o=0;o<4;o++){const P=4<<o;v+=amp*vn(x/w*P,y/h*P,P,11+o);tot+=amp;amp*=.5;}
   const k=(y*w+x)*4,c=clamp((v/tot-.5)*2.6+.5,0,1)*255;d[k]=d[k+1]=d[k+2]=c;d[k+3]=255;}g.putImageData(id,0,0);});
 noise.encoding=THREE.LinearEncoding;noise.wrapS=noise.wrapT=THREE.RepeatWrapping;
 const U={uT:{value:0},uMask:{value:mask},uNoise:{value:noise},uS:{value:S},uSun:{value:new THREE.Vector3(-1000,900,-700).normalize()},
  uTop:{value:new THREE.Color(0xfcfbf8)},uShade:{value:new THREE.Color(0x7e90a8)},uY:{value:0}};
 const mat=new THREE.ShaderMaterial({fog:true,transparent:true,depthWrite:false,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,U]),
  vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vN;',
   'void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vN=normal;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uS,uY;uniform sampler2D uMask,uNoise;uniform vec3 uSun,uTop,uShade;varying vec3 vWP;varying vec3 vN;',
   'float N(vec2 p){return texture2D(uNoise,p).r;}',
   'void main(){vec2 p=vWP.xz;',
   // the drifting detail: small billows on the big ones, bending the normal a little
   ' vec2 q=p*0.0045-vec2(uT*0.004,-uT*0.0015);float d=N(q)*0.65+N(p*0.017+vec2(uT*0.006,0.0))*0.35;',
   ' float dx=N(q+vec2(0.01,0.0))-N(q-vec2(0.01,0.0)),dz=N(q+vec2(0.0,0.01))-N(q-vec2(0.0,0.01));',
   ' vec3 n=normalize(normalize(vN)+vec3(-dx*1.6,0.0,-dz*1.6));',
   // lit from the sun's side, blue-grey in the hollows between the heaps, bright on their tops
   ' float l=clamp(dot(n,uSun)*0.55+0.5,0.0,1.0),up=smoothstep(uY-28.0,uY+40.0,vWP.y);',
   ' vec3 col=mix(uShade,uTop,smoothstep(0.15,0.95,l*0.75+up*0.55+d*0.25-0.3));',
   ' col+=vec3(0.05,0.05,0.04)*pow(1.0-abs(dot(n,normalize(cameraPosition-vWP))),3.0);',
   ' vec2 mu=p/uS+0.5;float m=(mu.x<0.0||mu.x>1.0||mu.y<0.0||mu.y>1.0)?1.0:texture2D(uMask,vec2(mu.x,mu.y)).a;',
   ' float a=m*smoothstep(0.0,0.3,d+m*0.7);',
   ' gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n')});
 mat.uniforms.fogColor.value=scene.fog.color;mat.uniforms.fogDensity.value=scene.fog.density*.55;mat.uniforms.uY.value=CLOUD_Y;
 // THE RELIEF: heaped billows a few hundred metres across, up to ~40 m over the deck's mean and ~25 m under it, on a
 // grid of ~100 m cells (the drifting detail in the shader does the rest)
 const geo=new THREE.PlaneGeometry(26000,13000,260,130);geo.rotateX(-Math.PI/2);geo.translate(0,0,-6500+400);
 {const P=geo.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),b=fbm(x*.0011+3,z*.0011-7,301,3),b2=fbm(x*.0037-2,z*.0037+5,303,2);
   P.setY(i,CLOUD_Y-24+62*smooth(.36,.74,b)+16*(b2-.5));}geo.computeVertexNormals();}
 const m=new THREE.Mesh(geo,mat);m.userData.probeSkip=true;m.userData.inspectLabel='The cloud sea';m.renderOrder=2;scene.add(m);
 // a second, lower deck a little darker, so a hole in the top one shows more cloud and not the scarp below
 const m2=new THREE.Mesh(new THREE.PlaneGeometry(26000,13000,1,1).rotateX(-Math.PI/2).translate(0,CLOUD_Y-55,-6500+400),new THREE.MeshBasicMaterial({color:0xb8c2cc,fog:true}));m2.userData.probeSkip=true;m2.renderOrder=0;scene.add(m2);
 TICKS.push(dt=>{U.uT.value+=dt;mat.uniforms.uT.value=U.uT.value;});
 return{mat,m,m2};})();

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
 RAV.forEach(R=>{for(let z=rimZ(R.x0)+100;z<R.head;z+=rr(110,180))place('sprite',ravX(R,z)+rr(-30,30),z,rr(8,26),rr(70,160));});
 // the bog hollows: low sheets
 BOGS.forEach(B=>{for(let k=0;k<3;k++)place('sheet',B.x+rr(-B.r*.4,B.r*.4),B.z+rr(-B.r*.4,B.r*.4),rr(2,6));});
 tick((dt,t)=>{for(const m of L){const x=m.ax+Math.sin(t*m.sp+m.ph)*m.amp,z=m.az+Math.cos(t*m.sp*.7+m.ph)*m.amp*.6;m.o.position.x=x;m.o.position.z=z;m.o.position.y=Math.max(FC.at(FC.a.h,x,z),CLOUD_Y-10)+m.lift;}});
 return{L,sheetM,spriteM};})();
