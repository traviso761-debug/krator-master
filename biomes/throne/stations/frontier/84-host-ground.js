// ================================================================= HOST — the ground, the sea, the streams (the frontier)
// One ground mesh painted from the layout and the fields: the forest floor, the fields' red earth on their terraces, the
// clearings' char, the beaches (black sand, olivine-green in the coves), the basalt headland under lichen, the packed
// earth of the trails and the city's footprint, the road's ruts; then the library's layers over it (materials.json).
// The sea is the shared wave field (core/atmos: 89-host-atmos.js binds it); the valleys' streams are ribbons on their beds.
FLOWS.flows.forEach(f=>{let sx=0,sz=0,n=0;const F=FLOWS;
 for(let k=0;k<F.id.length;k+=7){if(F.id[k]!==f.fi)continue;const i=k%F.N,j=(k-i)/F.N,x=F.x0+i*F.cs,z=F.z0+j*F.cs;
  if(x*x+z*z>(TERR.R-150)*(TERR.R-150))continue;sx+=x;sz+=z;n++;}   // only the part on the planted map (the grid's corners lie past it)
 if(!n)return;f.cx=sx/n;f.cz=sz/n;f.rad=Math.sqrt(n*7*F.cs*F.cs/Math.PI);
 REGISTER({name:f.name+' ('+ageLabel(f.age)+')',x:f.cx,z:f.cz,y:terrainH(f.cx,f.cz)-15,r:f.rad*1.1,h:60,flow:f.fi});});
{const b=xzOf(BAY.u,BAY.p);REGISTER({name:'The harbour bay',x:b[0],z:b[1],y:SEA-20,r:BAY.r,h:40});}

// ---------------------------------------------------------------- the ground
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const LITTER=K(0x3e3a26),LITTER2=K(0x4e4630),LAT=K(0x8a4a30),LAT2=K(0x9a5636),CHAR=K(0x2a2622),SAND=K(0x2c2a2a),OLIV=K(0x5a6a3a),ROCK=K(0x4a4844),LICH=K(0x8a8a6a),PACK=K(0x8a6a4c),BED=K(0x6a6050),GRASS=K(0x5a6a34);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(x/80+5,y/80-2,.7,2);
  const at=k=>FC.at(FC.a[k],wx,wz);
  c.copy(LITTER).lerp(LITTER2,clamp(.5+n*1.8,0,1)).lerp(LAT,smooth(.6,.8,pav)*.3);
  c.lerp(GRASS,at('edge')*.4);
  t.copy(LAT).lerp(LAT2,clamp(.5+n*2,0,1));c.lerp(t,at('field')*.92);
  t.copy(CHAR).lerp(LAT,smooth(.6,.8,pav+n2*.4)*.4);c.lerp(t,at('clear')*.92);
  t.copy(SAND).lerp(OLIV,smooth(.55,.75,fbm(wx*.004,wz*.004,4,2))*.7);c.lerp(t,at('coast')*smooth(80,20,uOf(wx,wz)-shoreU(pOf(wx,wz)))*.95);
  t.copy(ROCK).lerp(LICH,smooth(.4,.7,pav)*.5);c.lerp(t,at('rock')*.85);
  c.lerp(BED,at('flow')*.6);c.lerp(PACK,Math.max(at('path'),at('city')*.7));
  const k=1+n*.12+n2*.06;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=128;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const GROUNDU={uNight:{value:0}};
// THE LIBRARY GROUND: eight layers, the later winning, each sampled twice (anti-tiling, as the other stations)
const GL_KEYS=['litter','laterite','burnt','sandblack','olivine','lichenrock','packed','ruts'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 if(GLAY){sh.uniforms.uMacro={value:TEX_MACRO};GL_KEYS.forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1;varying vec4 vL0,vL1;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;');
 const W={litter:'vL0.x',laterite:'vL0.y',burnt:'vL0.z',sandblack:'vL0.w',olivine:'vL1.x',lichenrock:'vL1.y',packed:'vL1.z',ruts:'vL1.w'};
 let decl='uniform sampler2D uDetail;varying vec3 vGWP;varying vec4 vL0,vL1;',body;
 if(GLAY){decl+='uniform sampler2D uMacro,'+GL_KEYS.map(k=>'uG_'+k).join(',')+';vec3 _lay(sampler2D t,vec2 p,vec2 q,float k,float mt){return pow(mix(texture2D(t,p*k).rgb,texture2D(t,q*k*0.47+vec2(0.31,0.17)).rgb,mt),vec3(2.2));}';
  body='{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
   'vec3 dt=texture2D(uDetail,p*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);vec3 L;'+
   GL_KEYS.map(k=>'L=_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');').join('')+'}';}
 else body='{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=dt*dt2*1.12;}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body);};
const GROUND=(function(){const N=600,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),L0=new Float32Array(nx*nx*4),L1=new Float32Array(nx*nx*4);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const at=n=>FC.at(FC.a[n],x,z),coast=at('coast'),d=uOf(x,z)-shoreU(pOf(x,z)),beach=coast*smooth(90,25,d),cove=smooth(.55,.75,fbm(x*.004,z*.004,4,2));
  const pg=PATHGRID.at(x,z),path=smooth(1.8,-.3,pg.d);
  L0[k*4]=at('owned')*.9;L0[k*4+1]=Math.max(at('field')*.9,at('edge')*.3);L0[k*4+2]=at('clear')*.9;L0[k*4+3]=beach*(1-cove)*.95;
  L1[k*4]=beach*cove*.9;L1[k*4+1]=at('rock')*.85;L1[k*4+2]=Math.max(pg.k===1?path:0,at('city')*.8);L1[k*4+3]=pg.k===2?path:0;}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Throne\'s south-west shore';scene.add(m);return m;})();

_mark('ground');
// ---------------------------------------------------------------- THE SEA: the shared wave field (core/atmos, bound in 89)
// A grid over the map and out to the horizon's fog, its depth an attribute (the shallows settle toward glass and foam
// at the edge); the swell displaces it, the chop and the mid waves only shade (Voth's water, from the same module).
const SEAU={uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uShallow:{value:new THREE.Color(0x4a8a80)},uDeep:{value:new THREE.Color(0x1a3a46)},
 uSky:{value:new THREE.Color(0xc6ccc8)},uFogCol:{value:HAZE.clone()},uFogDen:{value:scene.fog.density},uCam:{value:new THREE.Vector3()},uBodyK:{value:1}};
const SEA_MAT=new THREE.ShaderMaterial({uniforms:SEAU,transparent:true,
 vertexShader:['#include <atmos_waves>','attribute float aDepth;','varying vec3 vW; varying float vD; varying vec2 vP;',
  'void main(){vec3 pos=position;vP=pos.xz;vD=aDepth;float att=clamp(aDepth/7.0,0.0,1.0);pos.y+=atmWaveHeight(pos.xz,0.0)*att;',
  ' vec4 wp=modelMatrix*vec4(pos,1.0);vW=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
 fragmentShader:['precision highp float;','#include <atmos_waves>','uniform float uFogDen,uBodyK;uniform vec3 uSun,uShallow,uDeep,uSky,uFogCol,uCam;','varying vec3 vW; varying float vD; varying vec2 vP;',
  'void main(){float att=clamp(vD/7.0,0.0,1.0);float vdist=length(uCam-vW);float lod=1.0-smoothstep(260.0,1500.0,vdist);',
  ' vec3 N=atmWaveNormal(vP,vdist,3.0*(0.08+0.92*att));vec3 V=normalize(uCam-vW);float fres=pow(1.0-clamp(dot(N,V),0.0,1.0),3.4);',
  ' vec3 body=mix(uShallow,uDeep,smoothstep(0.8,25.0,vD));body*=(0.66+0.44*clamp(dot(N,uSun),0.0,1.0))*uBodyK;',
  ' vec3 H=normalize(uSun+V);float spec=pow(clamp(dot(N,H),0.0,1.0),190.0)*1.4*lod;',
  ' vec3 col=mix(body,uSky*uBodyK,clamp(fres*0.86,0.0,0.82))+vec3(1.0,0.95,0.86)*spec*uBodyK;',
  ' float foam=smoothstep(1.4,0.1,vD)*(0.55+0.45*sin(vP.x*0.18+vP.y*0.13+6.283185307*fract(atmWaveT*0.255)));col=mix(col,vec3(0.92)*uBodyK,foam*0.55);',
  ' float fog=1.0-exp(-uFogDen*uFogDen*vdist*vdist);col=mix(col,uFogCol,clamp(fog,0.0,1.0));',
  ' gl_FragColor=vec4(col,mix(0.82,0.96,att));}'].join('\n')});
(function(){const N=220,S=TERR.R*2.6,cs=S/N,nx=N+1,pos=[],dep=[],idx=[];
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const x=-S/2+i*cs,z=-S/2+j*cs;pos.push(x,SEA,z);dep.push(Math.max(0,SEA-terrainH(x,z)));}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx;if(dep[a]<=0&&dep[a+1]<=0&&dep[b]<=0&&dep[b+1]<=0)continue;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aDepth',new THREE.Float32BufferAttribute(dep,1));g.setIndex(idx);
 const m=new THREE.Mesh(g,SEA_MAT);m.userData.probeSkip=true;m.userData.inspectLabel='The Ring Sea';m.renderOrder=1;m.frustumCulled=false;scene.add(m);})();
TICKS.push(()=>SEAU.uCam.value.copy(camera.position));

// ---------------------------------------------------------------- the streams (on the valleys' gravel beds)
const STREAM_MAT=new THREE.MeshLambertMaterial({color:0x4a6a62,transparent:true,opacity:.85,side:THREE.DoubleSide});
VALLEYS.forEach(V=>{const pos=[],idx=[];let prev=-1;
 for(let u=-1600;u<=3000;u+=6){const c=V.p+V.amp*Math.sin(u*V.f+V.ph),q=xzOf(u,c);if(Math.abs(q[0])>TERR.R*1.08||Math.abs(q[1])>TERR.R*1.08){prev=-1;continue;}
  const L=streamLevel(u,V);if(L<=SEA+.2){prev=-1;continue;}const w=5+2*Math.sin(u*.03),a=xzOf(u,c-w),b=xzOf(u,c+w),n=pos.length/3;
  pos.push(a[0],L,a[1],b[0],L,b[1]);if(prev>=0)idx.push(prev,prev+1,n,prev+1,n+1,n);prev=n;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,STREAM_MAT);m.userData.probeSkip=true;m.userData.inspectLabel='A stream in a lahar valley';m.renderOrder=1;scene.add(m);});
_onLight.push(m=>{const k=m==='night'?.16:1;SEAU.uBodyK.value=k;STREAM_MAT.color.setHex(m==='night'?0x101818:0x4a6a62);SEAU.uFogCol.value.copy(scene.fog.color);});
