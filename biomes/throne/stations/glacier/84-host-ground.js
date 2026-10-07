// ================================================================= HOST — the ground (the glacier)
// One ground mesh painted from the layout and the fields, and the library's layers over it (materials.json), read through
// the kit's stochastic sampler (THRONE.GLSL_LAY): the snow (two sets, mixed), the moraines' rubble, the spurs' rock, the
// outwash gravel, lichen on the old rock, moss on the warm ground. The GLACIER ICE is drawn in the shader from the ice's own
// coordinates (no library ice yet: core/materials/PLAN.md, ice.glacier): blue-white, crevassed across the icefall and in
// chevrons at its margins, dirt bands (ogives) curving down-glacier below the icefall, a medial moraine, dirty margins;
// snow over it above the icefall. At night the warm ground's moss glows faintly (Krator's own life in the moss).
REGISTER({name:'The glacier',x:upAt(900,GL.pg(900))[0],z:upAt(900,GL.pg(900))[1],y:PROF(900)-80,r:1900,h:260,glacier:true});
{const c=upAt(1500,GL.pg(1500));REGISTER({name:'The icefall (seracs and crevasses)',x:c[0],z:c[1],y:PROF(1500)-60,r:500,h:200,icefall:true});}
{const c=upAt(GL.SNOUT+40,GL.pg(GL.SNOUT));REGISTER({name:'The snout (an ice cliff over the lake)',x:c[0],z:c[1],y:LAKE.level-10,r:340,h:60,snout:true});}
{const c=upAt((termU(TERM.p0)+GL.SNOUT)/2,TERM.p0);REGISTER({name:LAKE.name,x:c[0],z:c[1],y:LAKE.level-12,r:260,h:16,lake:true});}
{const c=upAt(termU(TERM.p0),TERM.p0);REGISTER({name:'The terminal moraine (breached by the river)',x:c[0],z:c[1],y:LAKE.level-6,r:420,h:30,moraine:true});}
{const c=upAt(-1700,riverC(-1700));REGISTER({name:'The outwash (the meltwater river, braided)',x:c[0],z:c[1],y:PROF(-1700)-10,r:950,h:40,river:true});}
REGISTER({name:SHELF.name,x:SHELF.x,z:SHELF.z,y:terrainH(SHELF.x,SHELF.z)-10,r:SHELF.r*1.1,h:50,shelf:true});

// ---------------------------------------------------------------- the paint
const K=hx=>new THREE.Color(hx);
const PAINT={SNOW:K(0xeef2f6),SNOW2:K(0xdfe6ee),ICE:K(0xc4d8e6),ROCK:K(0x5a5654),ROCK2:K(0x6e6a66),MOR:K(0x7a746c),GRAV:K(0x8a8478),LICH:K(0x8a8a6a),MOSS:K(0x3a4a36),WARM:K(0x34302c)};
const _c=new THREE.Color();
function paintAt(c,x,z,at,n,n2,pav){
 c.copy(PAINT.ROCK).lerp(PAINT.ROCK2,clamp(.5+n*1.8,0,1)).lerp(PAINT.GRAV,at('river')*.6+smooth(-900,-1300,uOf(x,z))*.35);
 c.lerp(PAINT.MOR,at('moraine')*.8);c.lerp(PAINT.LICH,at('tundra')*smooth(.5,.7,pav)*.4);
 c.lerp(_c.copy(PAINT.WARM).lerp(PAINT.MOSS,smooth(.4,.7,pav)*.6),at('warm')*.85);
 c.lerp(PAINT.ICE,at('ice')*.9);
 c.lerp(_c.copy(PAINT.SNOW).lerp(PAINT.SNOW2,clamp(.5+n*2+n2,0,1)),smooth(.15,.6,at('snow')));
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
const GL_KEYS=['snow','snow2','moraine','cliff','csand','lichenrock','moss3'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const MAT_GROUND=new THREE.MeshLambertMaterial({map:null,color:0xb0aaa4});
// THE ICE (aI: u down the glacier, a/W across it, crevassing 0..1, how much of the ablation zone's dirt shows; aL1.w the ice)
const GICE=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('throne','ground.ice');return P?KMAT.textures(P,{aniso:8}).map:null;})();
const ICE_GLSL=(GICE?'uniform sampler2D uG_ice;':'')+'vec3 _ice(vec2 p,vec4 I,vec3 base){float n=texture2D(uMacro,p*0.011).r,n2=texture2D(uMacro,p*0.043).g,aw=I.y,u=I.x;'+
 'vec3 c=mix(vec3(0.80,0.88,0.94),vec3(0.62,0.77,0.88),smoothstep(0.3,0.7,n));'+(GICE?'c=mix(c,mix(texture2D(uG_ice,p*0.25).rgb,texture2D(uG_ice,mat2(0.8,-0.6,0.6,0.8)*p*0.11+0.3).rgb,smoothstep(0.35,0.65,n)),0.85);':'')+
 // the dirt bands (ogives): bowed down-glacier, fading with distance from the icefall; the medial moraine; the dirty margins
 'float og=smoothstep(0.5,0.72,fract((u+80.0*aw*aw)/95.0+0.2*n2))*I.w;c=mix(c,vec3(0.52,0.53,0.54),og*0.55);'+
 'c=mix(c,vec3(0.34,0.33,0.32),exp(-pow((aw-0.18+0.05*n2)/0.035,2.0))*I.w*0.85);'+
 'c=mix(c,vec3(0.45,0.43,0.40),smoothstep(0.72,0.98,abs(aw))*0.75);'+
 // the crevasses: across the icefall, chevrons at the margins (pointing up-glacier); deep blue slots, darker in the middle
 'float w1=texture2D(uMacro,p*0.0045).r-0.5,w2=texture2D(uMacro,p*0.019+0.2).g-0.5,jg=texture2D(uMacro,p*0.21).r-0.5;'+
 'float y1=u/14.0+1.1*w1+0.22*w2+0.35*sin(aw*2.6),r1=floor(y1),f1=fract(y1),h1=fract(sin(r1*91.7+floor(aw*7.0+r1*0.37)*13.1)*4375.5);'+
 'float wd=0.012+0.045*fract(h1*7.3)+0.012*jg;float l1=(1.0-smoothstep(wd,wd+0.035,abs(f1-0.5)))*step(0.42,h1);'+
 'float y2=(u+abs(aw)*380.0)/19.0+0.3*w2+0.5*w1,r2=floor(y2),f2=fract(y2),h2=fract(sin(r2*57.3+sign(aw)*7.7+floor(abs(aw)*14.0)*3.1)*2731.9);'+
 'float l2=(1.0-smoothstep(0.01+0.03*fract(h2*5.1)+0.008*jg,0.05+0.03*fract(h2*5.1),abs(f2-0.5)))*step(0.45,h2)*smoothstep(0.82,0.87,abs(aw))*smoothstep(0.97,0.93,abs(aw));'+
 'float cr=max(l1*I.z,l2*0.9);c=mix(c,mix(vec3(0.36,0.58,0.74),vec3(0.08,0.2,0.34),smoothstep(0.3,0.9,cr)),smoothstep(0.05,0.35,cr));'+
 'return c;}';
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};if(GICE)sh.uniforms.uG_ice={value:GICE};sh.uniforms.uNight=GROUNDU.uNight;sh.uniforms.uMacro={value:TEX_MACRO};
 if(GLAY)GL_KEYS.forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1,aI;varying vec4 vL0,vL1,vI;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;vI=aI;');
 const W={snow:'vL0.x',snow2:'vL0.y',moraine:'vL0.z',cliff:'vL0.w',csand:'vL1.x',lichenrock:'vL1.y',moss3:'vL1.z'};
 let decl='uniform sampler2D uDetail,uMacro;uniform float uNight;varying vec3 vGWP;varying vec4 vL0,vL1,vI;'+ICE_GLSL,body;
 // the ice goes on first (over the paint), then the layers: snow over the ice where it lies (the accumulation zone)
 const ice='diffuseColor.rgb=mix(diffuseColor.rgb,pow(_ice(vGWP.xz,vI,diffuseColor.rgb),vec3(2.2))*1.05,vL1.w);';
 if(GLAY){decl+='uniform sampler2D '+GL_KEYS.map(k=>'uG_'+k).join(',')+';'+THRONE.GLSL_LAY;
  body='{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
   'vec3 dt=texture2D(uDetail,p*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*1.04,0.4);'+ice+'vec3 L;'+
   GL_KEYS.map(k=>'L='+(k==='snow'||k==='snow2'?'_layd':'_lay')+'(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');').join('')+'}';}
 else body='{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.6);'+ice+'}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=uNight*vL1.z*vec3(0.05,0.22,0.16);');};
const GROUND=(function(){const N=880,S=TERR.R*2.2,cs=S/N,nx=N+1;MAT_GROUND.map=paintTex(2048,-S/2,-S/2,S);
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),L0=new Float32Array(nx*nx*4),L1=new Float32Array(nx*nx*4),LI=new Float32Array(nx*nx*4);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const at=n=>FC.at(FC.a[n],x,z),u=uOf(x,z),a=pOf(x,z)-GL.pg(u),ice=smooth(.2,2.5,iceAt(x,z)),sn=at('snow'),mor=at('moraine'),sl=at('slope'),rk=at('rock'),n1=fbm(x*.008,z*.008,4922,2);
  const snowK=smooth(.2,.65,sn)*(ice>0?smooth(1250,1550,u):1);
  L0[k*4]=snowK*.85*smooth(.35,.65,n1);L0[k*4+1]=snowK*.85*(1-smooth(.35,.65,n1));L0[k*4+2]=mor*(1-snowK*.7)*.85*(1-ice);L0[k*4+3]=smooth(.55,.85,sl)*rk*(1-ice)*(1-snowK*.5)*.85;
  L1[k*4]=Math.max(at('bar')*.85,smooth(-950,-1250,u)*(1-at('cbelt'))*(1-snowK)*.5)*(1-ice);L1[k*4+1]=at('tundra')*smooth(.5,.75,n1)*.45*(1-snowK);L1[k*4+2]=at('warm')*smooth(.45,.7,n1)*.5*(1-ice);L1[k*4+3]=ice;
  LI[k*4]=u;LI[k*4+1]=a/GL.W(u);LI[k*4+2]=smooth(1250,1400,u)*smooth(1800,1650,u);LI[k*4+3]=smooth(1300,1150,u)*smooth(GL.SNOUT,GL.SNOUT+300,u);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aI',new THREE.BufferAttribute(LI,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Throne\'s north-west flank, ~6 km up';scene.add(m);return m;})();
_onLight.push(m=>{GROUNDU.uNight.value=m==='night'?1:0;});
_mark('ground');
