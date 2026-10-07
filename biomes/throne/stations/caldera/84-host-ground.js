// ================================================================= HOST — the ground (the caldera rim)
// One ground mesh painted from the layout and the fields, and the library's layers over it (materials.json) through the kit's
// stochastic sampler (THRONE.GLSL_LAY): snow on the plateau and the rim (two sets, mixed), the owner's glacier ice armouring
// the crest's outer side, bare cliff rock down the wall (banded by its old flows: dark basalt, red scoria, pale ash layers),
// sulphur round the fumaroles, ash on the wall's terraces, old lava on the floor, scoria on the cones, and round the lake's
// pit the lava veins, glowing (dull by day, bright at night: the summit glow).
REGISTER({name:'The caldera rim',x:CAL.x+Math.cos(Math.PI)*CAL.crest,z:CAL.z,y:CAL.rim-60,r:1300,h:220,rim:true});
REGISTER({name:'The caldera wall (terraced by its old collapses)',x:CAL.x-(CAL.crest+CAL.foot)/2,z:CAL.z,y:CAL.floor-10,r:900,h:560,wall:true});
REGISTER({name:LAKE.name,x:LAKE.x,z:LAKE.z,y:LAKE.level-6,r:LAKE.r*1.15,h:30,lake:true});
CONES.forEach(C=>REGISTER({name:'A spatter cone on the caldera floor',x:C.x,z:C.z,y:terrainH(C.x,C.z)-C.h-6,r:C.r*1.1,h:C.h*2+20,cone:true}));
REGISTER({name:'The summit plateau (penitentes)',x:-1300,z:0,y:CAL.rim-260,r:1400,h:300,plateau:true});

// ---------------------------------------------------------------- the paint
const K=hx=>new THREE.Color(hx);
const PAINT={SNOW:K(0xeef2f8),SNOW2:K(0xdce4ee),BAS:K(0x3c3836),RED:K(0x6a3426),PALE:K(0x8a8070),ASH:K(0x6e6a64),LAVA:K(0x221e1e),SUL:K(0xd8c040),ICE:K(0xc8dcec),SCOR:K(0x5a2a22)};
const _c=new THREE.Color();
function paintAt(c,x,z,at,n,n2,pav){
 // the wall's bands: by height, wavering (the old flows' layers seen in section)
 const y=FC.at(FC.a.h,x,z),b=Math.sin(y*.11+fbm(x*.004,z*.004,5021,2)*6),b2=Math.sin(y*.37+n*4);
 c.copy(PAINT.BAS).lerp(PAINT.RED,smooth(.35,.6,b)).lerp(PAINT.PALE,smooth(.7,.9,b2)*.6);
 c.lerp(_c.copy(PAINT.ASH).lerp(PAINT.BAS,smooth(.4,.7,pav)),at('floor')*.85);
 c.lerp(PAINT.ASH,at('wall')*(1-smooth(.5,.8,at('slope')))*.6);   // ash on the terraces
 c.lerp(PAINT.SUL,smooth(.3,.7,at('warm'))*.7);
 c.lerp(_c.copy(PAINT.SNOW).lerp(PAINT.SNOW2,clamp(.5+n*2+n2,0,1)),smooth(.2,.6,at('snow')));
 return c;}
const paintTex=(W,x0,z0,S)=>BIO.canvasTex(W,W,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=x0+(x/w)*S,wz=z0+(y/h)*S;
  const n=fbm(wx*.03,wz*.03,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5)*.3,pav=fbm(wx*.012+5,wz*.012-2,.7,2);
  paintAt(c,wx,wz,k=>FC.at(FC.a[k],wx,wz),n,n2,pav);const k=1+n*.08+n2*.04;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=128;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const GROUNDU={uNight:{value:0}};
const GL_KEYS=['snow','snow2','cliff','lava','veins','scoria','sulphur','ash','ice'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const MAT_GROUND=new THREE.MeshLambertMaterial({map:null,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uNight=GROUNDU.uNight;sh.uniforms.uMacro={value:TEX_MACRO};
 if(GLAY)GL_KEYS.forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});
 sh.uniforms.uSunDir={value:new THREE.Vector3(...SUN_POS).normalize()};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP,vGN;attribute vec4 aL0,aL1,aL2;varying vec4 vL0,vL1,vL2;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGN=normal;vL0=aL0;vL1=aL1;vL2=aL2;');
 const W={snow:'vL0.x',snow2:'vL0.y',cliff:'vL0.z',lava:'vL0.w',veins:'vL1.x',scoria:'vL1.y',sulphur:'vL1.z',ash:'vL1.w',ice:'vL2.x'};
 // TRIPLANAR (Godot: StandardMaterial3D's uv1_triplanar): the cliff from the three axes, blended by the normal (projected
 // from above it smeared down the 450 m wall)
 let decl='uniform sampler2D uDetail,uMacro;uniform float uNight;uniform vec3 uSunDir;varying vec3 vGWP,vGN;varying vec4 vL0,vL1,vL2;'+
  'vec3 _tri(sampler2D t,vec3 p,vec3 n,float k){vec3 w=pow(abs(n),vec3(4.0));w/=w.x+w.y+w.z;return pow(texture2D(t,p.zy*k).rgb*w.x+texture2D(t,p.xz*k).rgb*w.y+texture2D(t,p.xy*k).rgb*w.z,vec3(2.2));}',body;
 if(GLAY){decl+='uniform sampler2D '+GL_KEYS.map(k=>'uG_'+k).join(',')+';'+THRONE.GLSL_LAY;
  body='vec3 _E_veins=vec3(0.0);{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
   'vec3 dt=texture2D(uDetail,p*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*1.04,0.5);vec3 L;'+
   GL_KEYS.map(k=>'L='+(k==='cliff'?'_tri(uG_cliff,vGWP,normalize(vGN),'+GLAY[k].k.toFixed(4)+');':(k==='snow'||k==='snow2'||k==='ice'?'_layd':'_lay')+'(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);')+'diffuseColor.rgb=mix(diffuseColor.rgb,'+(k==='cliff'?'diffuseColor.rgb*L*2.2':'diffuse*L*1.25')+','+W[k]+');'+(k==='veins'?'_E_veins=L;':'')).join('')+'}';}
 else body='vec3 _E_veins=vec3(0.0);{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.6);}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body)
  // the veins round the lake glow (dull by day, bright at night): the summit glow
  // and GLINTS on the snow: a random facet normal per 14 cm cell, a tight highlight of the sun on it (near the camera only)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n {vec2 gc=floor(vGWP.xz*7.0);vec3 rn=fract(sin(vec3(dot(gc,vec2(12.9,78.2)),dot(gc,vec2(39.3,11.1)),dot(gc,vec2(73.1,52.7))))*43758.5)-0.5;'+
   'vec3 fn=normalize(vec3(rn.x*0.6,1.0,rn.z*0.6)),V=normalize(cameraPosition-vGWP),Hh=normalize(uSunDir+V);float gl=pow(max(dot(fn,Hh),0.0),900.0)*step(0.55,rn.y+0.5);'+
   'totalEmissiveRadiance+=vec3(1.0,0.98,0.94)*gl*4.0*vL0.x*(1.0-uNight)*smoothstep(260.0,30.0,length(cameraPosition-vGWP));}\n totalEmissiveRadiance+=(0.15+uNight)*vL1.x*max(_E_veins*smoothstep(0.05,0.25,_E_veins.r-_E_veins.b)*2.4,vec3(0.5,0.12,0.02)*vL1.x);');};
const GROUND=(function(){const N=880,S=TERR.R*2.2,cs=S/N,nx=N+1;MAT_GROUND.map=paintTex(2048,-S/2,-S/2,S);
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),L0=new Float32Array(nx*nx*4),L1=new Float32Array(nx*nx*4),L2=new Float32Array(nx*nx*4);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const at=n=>FC.at(FC.a[n],x,z),sn=smooth(.2,.65,at('snow')),n1=fbm(x*.008,z*.008,5022,2),sl=at('slope'),fl=at('floor'),wl=at('wall'),rimK=at('rim'),out=at('out');
  const dl=LAKE.de(x,z),hot=smooth(LAKE.r*1.45,LAKE.r*1.05,dl)*smooth(LAKE.r*.95,LAKE.r*1.04,dl)*smooth(.35,.6,n1+.2);
  L0[k*4]=sn*.9;L0[k*4+1]=0;L0[k*4+2]=smooth(.5,.85,sl)*(1-sn*.6)*.75;L0[k*4+3]=fl*(1-sn)*.85;
  L1[k*4]=hot*fl*.9;L1[k*4+1]=smooth(.3,.7,coneAt(x,z).k)*.85;L1[k*4+2]=smooth(.25,.7,at('warm'))*.8;L1[k*4+3]=wl*(1-smooth(.5,.8,sl))*(1-sn)*.6;
  L2[k*4]=out*rimK*smooth(.35,.6,sl)*(1-smooth(.3,.6,at('warm')))*.75;}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Throne\'s summit: the caldera rim, ~10.75 km up';scene.add(m);return m;})();
_onLight.push(m=>{GROUNDU.uNight.value=m==='night'?1:0;});
_mark('ground');
