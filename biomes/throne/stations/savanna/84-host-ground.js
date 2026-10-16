// ================================================================= HOST — the ground, the pools (the savanna)
// One ground mesh (7 m: the braided channels are 8-20 m across) painted from the layout and the fields, and the library's
// layers over it (materials.json): the dry grass seen from afar, the shoulder's sparse grass, the red laterite in the
// woods and the dongas, the burn's char, the fan's gravel and its channels' sand, the kopjes' lichened basalt, the woods'
// litter. Then the dry season's pools.
REGISTER({name:'The lahar fan (braided channels, dry now)',x:FAN.cx(0),z:0,y:flankH(0,0)-20,r:2500,h:200,fan:true});
REGISTER({name:'A fresh burn (black stubble, the first green)',x:BURN.x,z:BURN.z,y:flankH(BURN.x,BURN.z)-20,r:Math.max(BURN.rx,BURN.rz),h:60,burn:true});
KOPJES.forEach(K=>REGISTER({name:K.name,x:K.x,z:K.z,y:flankH(K.x,K.z)-4,r:K.r*1.2,h:K.h+12,kopje:K.i}));

// ---------------------------------------------------------------- the paint
const K=hx=>new THREE.Color(hx);
const PAINT={GRASS:K(0xb8a060),GRASS2:K(0xa08a50),GREEN:K(0x7a8a46),LAT:K(0x9a5636),LITTER:K(0x5a4a30),CHAR:K(0x2a2622),GRAVEL:K(0x8a8478),SAND:K(0xa89a80),ROCK:K(0x4a4844),LICH:K(0x8a8a6a)};
const _c=new THREE.Color();
function paintAt(c,x,z,at,n,n2,pav){
 c.copy(PAINT.GRASS).lerp(PAINT.GRASS2,clamp(.5+n*1.8,0,1)).lerp(PAINT.GREEN,smooth(.6,.8,pav)*.25);
 c.lerp(_c.copy(PAINT.LITTER).lerp(PAINT.LAT,.35),at('capwood')*.75);c.lerp(PAINT.LAT,at('flow')*.6);
 const b=at('burn');if(b>0){_c.copy(PAINT.CHAR).lerp(PAINT.LAT,smooth(.55,.8,pav+n2*.4)*.35).lerp(PAINT.GREEN,smooth(.7,.85,pav)*.25);c.lerp(_c,b*.92);}
 const f=at('fan');if(f>0){const ch=chanAt(x,z);_c.copy(PAINT.GRAVEL).lerp(PAINT.SAND,ch.bed*.85);c.lerp(_c,f*clamp(at('bar')*1.2+ch.bed,0,1)*.9);c.lerp(PAINT.GRASS2,f*(1-at('bar'))*(1-ch.bed)*.2);}
 c.lerp(_c.copy(PAINT.ROCK).lerp(PAINT.LICH,smooth(.4,.7,pav)*.5),at('rock')*.85);
 return c;}
const paintTex=(W,x0,z0,S,at)=>BIO.canvasTex(W,W,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=x0+(x/w)*S,wz=z0+(y/h)*S;
  const n=fbm(wx*.03,wz*.03,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(wx*.012+5,wz*.012-2,.7,2);
  paintAt(c,wx,wz,k=>FC.at(FC.a[k],wx,wz),n,n2,pav);const k=1+n*.12+n2*.06;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=128;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const GROUNDU={uNight:{value:0}};
const GL_KEYS=['savgrass','shoulder','laterite','burnt','gravel','csand','lichenrock','litter'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const MAT_GROUND=new THREE.MeshLambertMaterial({map:null,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 if(GLAY){sh.uniforms.uMacro={value:TEX_MACRO};GL_KEYS.forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1;varying vec4 vL0,vL1;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;');
 const W={savgrass:'vL0.x',shoulder:'vL0.y',laterite:'vL0.z',burnt:'vL0.w',gravel:'vL1.x',csand:'vL1.y',lichenrock:'vL1.z',litter:'vL1.w'};
 let decl='uniform sampler2D uDetail;varying vec3 vGWP;varying vec4 vL0,vL1;',body;
 if(GLAY){decl+='uniform sampler2D uMacro,'+GL_KEYS.map(k=>'uG_'+k).join(',')+';'+THRONE.GLSL_LAY;   // stochastic tiling: the kit's (70)
  body='{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
   'vec3 dt=texture2D(uDetail,p*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);vec3 L;'+
   GL_KEYS.map(k=>'L=_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');').join('')+'}';}
 else body='{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=dt*dt2*1.12;}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body);};
const GROUND=(function(){const N=800,S=TERR.R*2.2,cs=S/N,nx=N+1;MAT_GROUND.map=paintTex(2048,-S/2,-S/2,S);
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),L0=new Float32Array(nx*nx*4),L1=new Float32Array(nx*nx*4);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const at=n=>FC.at(FC.a[n],x,z),f=at('fan'),ch=f>.05?chanAt(x,z).bed:0,b=at('burn'),rk=at('rock');
  L0[k*4]=at('savanna')*(1-b)*.85;L0[k*4+1]=Math.max(at('savanna')*.3,f*(1-at('bar'))*.4)*(1-b);L0[k*4+2]=Math.max(at('flow'),at('capwood')*.35)*.8;L0[k*4+3]=b*.9;
  L1[k*4]=f*at('bar')*(1-ch)*.9;L1[k*4+1]=f*ch*.9;L1[k*4+2]=rk*.85;L1[k*4+3]=at('capwood')*.75;}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Throne\'s south flank';scene.add(m);return m;})();
_mark('ground');

// ---------------------------------------------------------------- the pools
const POOL_MAT=new THREE.MeshLambertMaterial({color:0x5a6a5a,transparent:true,opacity:.86});
POOLS.forEach(P=>{const g=new THREE.CircleGeometry(P.r*1.2,28).rotateX(-Math.PI/2);g.translate(P.x,P.level,P.z);
 const m=new THREE.Mesh(g,POOL_MAT);m.userData.inspectLabel=P.name;m.renderOrder=1;scene.add(m);
 REGISTER({name:P.name,x:P.x,z:P.z,y:P.level-3,r:P.r*1.2,h:6,pool:P.key});});
_onLight.push(m=>{POOL_MAT.color.setHex(m==='night'?0x101814:0x5a6a5a);GROUNDU.uNight.value=m==='night'?1:0;});
