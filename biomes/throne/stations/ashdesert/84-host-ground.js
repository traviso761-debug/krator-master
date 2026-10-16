// ================================================================= HOST — the ground (the ash desert)
// One ground mesh (7 m) painted from the layout and the fields, and the library's layers over it (materials.json), read
// through the kit's stochastic sampler (THRONE.GLSL_LAY): the plume's grey ash, the dunes' rippled ash, the mycelium in it,
// the old lava where the wind has scoured it, the rhyolite hills' bands, the mat on the hollow's floor, the hardy grass,
// the yardangs' lichened ash-stone. At night the mat and the mycelium light by their own colours.
FLOWS.flows.forEach(f=>{let sx=0,sz=0,n=0;const F=FLOWS;
 for(let k=0;k<F.id.length;k+=7){if(F.id[k]!==f.fi)continue;const i=k%F.N,j=(k-i)/F.N,x=F.x0+i*F.cs,z=F.z0+j*F.cs;if(x*x+z*z>(TERR.R-150)*(TERR.R-150))continue;sx+=x;sz+=z;n++;}
 if(!n)return;f.cx=sx/n;f.cz=sz/n;f.rad=Math.sqrt(n*7*F.cs*F.cs/Math.PI);
 REGISTER({name:f.name+' ('+ageLabel(f.age)+')',x:f.cx,z:f.cz,y:terrainH(f.cx,f.cz)-15,r:f.rad*1.1,h:60,flow:f.fi});});
HILLS.forEach(H=>REGISTER({name:H.name,x:H.x,z:H.z,y:landH0(H.x,H.z)-6,r:H.r*1.1,h:H.h+30,hill:H.i}));
REGISTER({name:'The ash dunes (their crests across the wind)',x:900,z:900,y:landH0(900,900)-12,r:1700,h:60,dunes:true});
REGISTER({name:'The yardangs (ridges of cemented ash, carved by the wind)',x:-900,z:-900,y:landH0(-900,-900)-10,r:1700,h:60,yardangs:true});

// ---------------------------------------------------------------- the paint
const K=hx=>new THREE.Color(hx);
const PAINT={ASH:K(0x8a8680),ASH2:K(0x9a958c),DARK:K(0x5a5650),LAVA:K(0x3a3632),CREAM:K(0xe2d4b4),ROSE:K(0xb87262),GREY:K(0x6e6862),MAT:K(0x8a2a3a),GRASS:K(0x7a7a5a),LICH:K(0x8a8a6a)};
const _c=new THREE.Color();
function paintAt(c,x,z,at,n,n2,pav){
 c.copy(PAINT.ASH).lerp(PAINT.ASH2,clamp(.5+n*1.8,0,1)).lerp(PAINT.DARK,smooth(.62,.82,pav)*.3*(1-at('dune')));
 const th=FLOWS.thickAt(x,z);c.lerp(PAINT.LAVA,smooth(.4,2,th)*(1-at('dune'))*.8);
 const hl=at('hill');if(hl>0){const y=FC.at(FC.a.h,x,z),b=Math.sin(y*.35+fbm(x*.01,z*.01,4721,2)*4);_c.copy(PAINT.CREAM).lerp(PAINT.ROSE,smooth(.25,.4,b)).lerp(PAINT.GREY,smooth(-.25,-.4,b));c.lerp(_c,hl*.9);}
 c.lerp(PAINT.LICH,at('yard')*.35);c.lerp(PAINT.MAT,at('hollow')*.95);c.lerp(PAINT.GRASS,smooth(.7,.85,pav)*(1-at('dune'))*(1-hl)*.25);
 return c;}
const paintTex=(W,x0,z0,S)=>BIO.canvasTex(W,W,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color();
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
const GL_KEYS=['ash','ripples','mycelium','lava','rhyo','matfloor','shoulder','lichenrock'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const MAT_GROUND=new THREE.MeshLambertMaterial({map:null,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uNight=GROUNDU.uNight;
 if(GLAY){sh.uniforms.uMacro={value:TEX_MACRO};GL_KEYS.forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1;varying vec4 vL0,vL1;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;');
 const W={ash:'vL0.x',ripples:'vL0.y',mycelium:'vL0.z',lava:'vL0.w',rhyo:'vL1.x',matfloor:'vL1.y',shoulder:'vL1.z',lichenrock:'vL1.w'};
 let decl='uniform sampler2D uDetail;uniform float uNight;varying vec3 vGWP;varying vec4 vL0,vL1;',body;
 if(GLAY){decl+='uniform sampler2D uMacro,'+GL_KEYS.map(k=>'uG_'+k).join(',')+';'+THRONE.GLSL_LAY;
  body='{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
   'vec3 dt=texture2D(uDetail,p*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);vec3 L;'+
   GL_KEYS.map(k=>'L=_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');').join('')+'}';}
 else body='{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=dt*dt2*1.12;}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body)
  // at night the mat glows its pink and the mycelium a faint gold (the plume's own life)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=uNight*(vL1.y*vec3(0.55,0.08,0.3)+vL0.z*vec3(0.42,0.34,0.1)*0.6);');};
const GROUND=(function(){const N=760,S=TERR.R*2.2,cs=S/N,nx=N+1;MAT_GROUND.map=paintTex(2048,-S/2,-S/2,S);
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),L0=new Float32Array(nx*nx*4),L1=new Float32Array(nx*nx*4);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const at=n=>FC.at(FC.a[n],x,z),dn=at('dune'),hl=at('hill'),hw=at('hollow'),th=FLOWS.thickAt(x,z),sc=smooth(.4,2,th)*(1-dn),ash=at('ash');
  L0[k*4]=(1-dn)*(1-hl)*(1-hw)*.8;L0[k*4+1]=dn*(1-hw)*.9;L0[k*4+2]=ash*(1-dn)*(1-hl)*(1-hw)*smooth(.55,.8,fbm(x*.008,z*.008,4722,2))*.6;L0[k*4+3]=sc*.85;
  L1[k*4]=hl*.5;L1[k*4+1]=hw*.95;L1[k*4+2]=(1-dn)*(1-hl)*(1-hw)*smooth(.68,.84,fbm(x*.01,z*.01,4723,2))*.4;L1[k*4+3]=at('yard')*.75;}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The ash desert under the plume';scene.add(m);return m;})();
REGISTER({name:HOLLOW.name,x:HOLLOW.x,z:HOLLOW.z,y:terrainH(HOLLOW.x,HOLLOW.z)-3,r:HOLLOW.r*1.3,h:HOLLOW.depth+8,hollow:true});
_onLight.push(m=>{GROUNDU.uNight.value=m==='night'?1:0;});
_mark('ground');
