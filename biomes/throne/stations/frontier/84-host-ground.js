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
// ---------------------------------------------------------------- the streams' water (the sea is 89w-host-sea.js)
// 2026-10-20 (core/water migration, phase 3): the sea (a grid of 220 x 220 cells with its own wave shader and foam) and the streams (ribbons of
// MeshLambertMaterial every 6 m) are core/water's now. Each stream's water, run by run (it ends where the bed falls under the sea), is a
// WATER.flow along the valley's centre line at streamLevel every 10 m, as wide as the old ribbon (2 w, w = 5 + 2 sin); STREAM_FLOWS
// and the sea are drawn by 89w-host-sea.js. waterH (47) is unchanged: the CPU twin the checks read.
const STREAM_FLOWS=[];
VALLEYS.forEach(V=>{let run=[];const flush=()=>{if(run.length>2){if(run[0][2]<run[run.length-1][2])run.reverse();STREAM_FLOWS.push(WATER.flow({name:'A stream in a lahar valley',pts:run,width:10,speed:1.6}));}run=[];};
 for(let u=-1600;u<=3000;u+=10){const c=V.p+V.amp*Math.sin(u*V.f+V.ph),q=xzOf(u,c);if(Math.abs(q[0])>TERR.R*1.08||Math.abs(q[1])>TERR.R*1.08){flush();continue;}
  const L=streamLevel(u,V);if(L<=SEA+.2){flush();continue;}run.push([q[0],q[1],L]);}
 flush();});
