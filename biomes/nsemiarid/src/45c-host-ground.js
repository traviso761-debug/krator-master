// ================================================================= HOST — the painted ground, for any stage
// One mesh, painted by zone from the stage's field cache (FC, FNAMES), with the library's ground layers over it. A stage
// gives STAGE_GROUND: {N (cells a side), label, rows (a channel to snap the mesh to, or null), tint (an overlay's tint
// over the palette, or null)}. Split from the stage 2026-10-23.
// ---------------------------------------------------------------- the ground
// One mesh, painted by zone from the field cache: the steppe's tan and sage, the bed's pale silt with its strandlines
// and the bathtub ring's bleached band, salt white toward the lake, the dunes' sand, olive foothills with their basalt,
// the upland's green, grass and damp at the stream.
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const STEP=K(0xb4a07a),STEP2=K(0xa89a74),SAGE=K(0x9aa284),SILT=K(0xcdbfa2),SILT2=K(0xc2b294),SALT=K(0xf0ece2),SALT2=K(0xe4ddd0),RING=K(0xe8e2d4),STRAND=K(0xa8987a),
  SAND=K(0xdcc49a),SAND2=K(0xe8d4ac),OLIVE=K(0x8a8a5a),OLIVE2=K(0x9a9466),BASALT=K(0x4e4844),BASALT2=K(0x5e5650),GREEN=K(0x5e8a3a),GREEN2=K(0x6e9644),
  SOIL=K(0x7a6248),GRASS=K(0x7a9a44),DAMP=K(0x4a4430);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),F=nm=>FC.at(FC.a[nm],wx,wz);
  const wet=F('wet'),flow=F('flow'),rock=F('rock'),salt=F('salt'),bed=F('bed'),silt=F('silt'),strand=F('strand'),ring=F('ring'),dune=F('dune'),up=F('upland');
  // the steppe: tan and sage
  c.copy(STEP).lerp(STEP2,clamp(.5+n*1.8,0,1)).lerp(SAGE,smooth(.45,.7,fbm(x/60+3,y/60,.6,2))*.5);
  // the foothills: olive, the upland: green over red-brown soil
  t.copy(OLIVE).lerp(OLIVE2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.3,.42,wet)*.8);
  t.copy(GREEN).lerp(GREEN2,clamp(.5+n*1.6,0,1)).lerp(SOIL,smooth(.55,.75,fbm(x/50,y/50,.8,2))*.35);c.lerp(t,smooth(.46,.6,wet)*(1-flow*.3));
  // the old bed: pale silt, the strandlines a little darker, the ring bleached, salt toward the water
  t.copy(SILT).lerp(SILT2,clamp(.5+n*1.6,0,1));c.lerp(t,bed*smooth(.1,.5,silt)*.9);
  c.lerp(STRAND,strand*.14);c.lerp(RING,ring*.75);
  t.copy(SALT).lerp(SALT2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.25,.75,salt)*.92);
  // the dunes: sand
  t.copy(SAND).lerp(SAND2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.1,.5,dune)*.9);
  // basalt where the rock shows
  t.copy(BASALT).lerp(BASALT2,clamp(.5+n*1.8,0,1));c.lerp(t,smooth(.45,.85,rock)*.6);
  // the stream's banks: grass, damp at the water
  c.lerp(GRASS,smooth(.3,.8,flow)*.55);c.lerp(DAMP,smooth(.75,1,flow)*.5);
  // an overlay's tint over the biome's palette (biomes/nsemiarid/PLAN.md section 3): the stage's, if it has one
  if(STAGE_GROUND.tint)STAGE_GROUND.tint(c,F,wx,wz,n);
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// mud cracks on the dry bed (a polygon net), in the vertex weight aCrack
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(90,80,64,.55)';g.lineCap='round';
 const P=[];for(let i=0;i<22;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.34)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.4);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-14,14)+k*w,(a[1]+b[1])/2+rr(-14,14)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
// THE LIBRARY GROUND LAYERS (materials.json ground.*): seven surfaces blended per vertex by zone over the painted ground,
// as the eastern badlands' host does. A keep-0 layer multiplies the painted colour by its relief, a keep-1 layer shows its
// own colour, the others mix the two. Without the pack (?mat=proc, or no tex/) the ground is exactly the painted one.
// GL: [library set, weight(F)] with F the cached fields at the vertex.
const GL=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;
 const P=n=>KMAT.packed('nsemiarid','ground.'+n),rk=F=>smooth(.45,.85,F.rock),dn=F=>smooth(.1,.5,F.dune),open=F=>(1-F.bed*.9)*(1-dn(F))*(1-rk(F));
 const L=[['steppe',F=>smooth(.42,.3,F.wet)*open(F)],['withered',F=>smooth(.3,.42,F.wet)*smooth(.6,.46,F.wet)*open(F)],
  ['grass',F=>smooth(.46,.6,F.wet)*open(F)],['silt',F=>.6*F.bed*smooth(.1,.5,F.silt)*smooth(.6,.3,F.salt)*(1-dn(F))*(1-F.ring)],
  ['crust',F=>.5*clamp(F.ring*.8+smooth(.2,.45,F.salt)*smooth(.85,.6,F.salt),0,1)*(1-dn(F))],['sand',F=>dn(F)],['basalt',F=>rk(F)*.85]];
 if(L.some(l=>!P(l[0])))return null;
 return L.map(l=>{const e=P(l[0]);return{name:l[0],w:l[1],tex:KMAT.textures(e,{aniso:8}).map,scale:e.scale[0],keep:e.tint,mean:e.mean};});})();
// the layers' anti-tiling (2026-10-22): a library set repeats every few metres, and over a plain the repeat reads as a
// grid. Each layer is sampled twice, the second turned 37 degrees, scaled by 1.37 and shifted, and the two are blended by
// a value noise about eight tiles across, so neighbouring tiles never match (a game engine does the same in its ground
// shader: two taps and a noise)
const GTEX=['float gHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
 'float gNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(gHash(i),gHash(i+vec2(1.0,0.0)),f.x),mix(gHash(i+vec2(0.0,1.0)),gHash(i+vec2(1.0,1.0)),f.x),f.y);}',
 'vec3 gTex(sampler2D s,vec2 p){float n=gNoise(p*0.13)*0.65+gNoise(p*0.41+7.3)*0.35;vec2 q=vec2(p.x*0.7986-p.y*0.6018,p.x*0.6018+p.y*0.7986)*1.37+vec2(0.37,0.71);',
 ' return mix(texture2D(s,p).rgb,texture2D(s,q).rgb,smoothstep(0.3,0.7,n));}'].join('\n');
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xa8a29a});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uCrack={value:TEX_CRACK};
 let lay='';
 if(GL){GL.forEach((l,i)=>{sh.uniforms['uGL'+i]={value:l.tex};});
  // a custom sampler is not decoded from sRGB for us: pow 2.2 by hand; a keep-0 layer is its relief, normalised by the
  // pack's mean brightness so the painted colour keeps its level
  // with distance a layer's grain fades toward the painted ground (from 60 m to 450 m): far off its crack nets and tufts
  // read as a lattice, not as ground
  lay='{vec3 _b=diffuseColor.rgb,_a=vec3(0.0);float _s=0.0;vec2 _p=vGWP.xz;float _fd=1.0-0.75*smoothstep(60.0,450.0,length(cameraPosition-vGWP));'+GL.map((l,i)=>{const m=Math.pow(l.mean==null?.78:l.mean,2.2).toFixed(4),
    w='vGL'+Math.floor(i/4)+'.'+'xyzw'[i%4];
   return 'if('+w+'>0.003){vec3 t=pow(gTex(uGL'+i+',_p*'+(1/l.scale).toFixed(4)+'),vec3(2.2));_a+='+w+'*mix(_b*t/'+m+',t,'+l.keep.toFixed(2)+');_s+='+w+';}';}).join('')+
   'diffuseColor.rgb=mix(_b,_a/max(_s,0.001),clamp(_s*_fd,0.0,1.0));vGLs=_s*_fd;}';}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;varying float vCrack;'+(GL?'attribute vec4 aGL0,aGL1;varying vec4 vGL0,vGL1;':''))
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;'+(GL?'vGL0=aGL0;vGL1=aGL1;':''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;'+
   (GL?'varying vec4 vGL0,vGL1;'+GL.map((l,i)=>'uniform sampler2D uGL'+i+';').join('')+GTEX:''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{float vGLs=0.0;vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.11).rgb;'+lay+
   // the procedural grain gives way where a library layer carries its own; the mud cracks stay (the bed's polygons are larger)
   'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85*(1.0-0.7*clamp(vGLs,0.0,1.0)))*mix(vec3(1.0),ck,vCrack);}');};
// A CHANNEL'S ROWS (2026-10-23, the owner: "stream is not continuous"): a cell is ~13 m, a stream ~14 m wide, so a
// triangle whose corners missed the channel bridged it and hid the water in long gaps. In every row a stage's channel
// crosses (STAGE_GROUND.rows: its z range and x of z), the vertex nearest it moves onto its centreline and the next ones
// out to the knots either side, a monotone shift along the row; and those quads take the lower of their two diagonals,
// so the channel runs down the triangles instead of across them.
const GROUND=(function(){const N=STAGE_GROUND.N,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),ck=new Float32Array(nx*nx);
 const g0=GL?new Float32Array(nx*nx*4):null,g1=GL?new Float32Array(nx*nx*4):null,F={};
 const R=STAGE_GROUND.rows,IC=new Int32Array(nx).fill(-99),XC=new Float32Array(nx);
 if(R)for(let j=0;j<nx;j++){const z=-S/2+j*cs;if(z>=R.z0-cs*2&&z<=R.z1+cs*2){XC[j]=R.x(z);IC[j]=Math.round((XC[j]+S/2)/cs);}}
 const KNOT=R?R.knots:[0];
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,z=-S/2+j*cs,o=i-IC[j];let x=-S/2+i*cs;
  if(Math.abs(o)<KNOT.length&&i>0&&i<N)x=XC[j]+Math.sign(o)*KNOT[Math.abs(o)];
  const y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  ck[k]=FC.at(FC.a.bed,x,z)*smooth(.15,.5,FC.at(FC.a.silt,x,z))*(1-smooth(.3,.7,FC.at(FC.a.dune,x,z)))*smooth(.05,.4,FC.at(FC.a.salt,x,z)+.1)*.85;
  if(GL){FNAMES.forEach(n=>F[n]=FC.at(FC.a[n],x,z));let s=0;const w=GL.map(l=>{const v=clamp(l.w(F),0,1);s+=v;return v;}),k1=s>1?1/s:1;
   for(let q=0;q<4;q++){g0[k*4+q]=w[q]*k1;g1[k*4+q]=(w[q+4]||0)*k1;}}}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;
  if(Math.abs(i-IC[j])<=KNOT.length&&pos[a*3+1]+pos[c*3+1]<pos[b*3+1]+pos[d*3+1]){idx[t++]=a;idx[t++]=b;idx[t++]=c;idx[t++]=a;idx[t++]=c;idx[t++]=d;}   // the lower diagonal (a stream row)
  else{idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));
 if(GL){g.setAttribute('aGL0',new THREE.BufferAttribute(g0,4));g.setAttribute('aGL1',new THREE.BufferAttribute(g1,4));}
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel=STAGE_GROUND.label;scene.add(m);return m;})();
