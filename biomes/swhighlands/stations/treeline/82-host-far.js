// ================================================================= HOST — the fog curve, the far country, the light modes (station 6)
// As station 1's (src/82-host-far.js) with this station's ground carried on past the map: the ramp falling west toward the
// folds and the Ancient's Valley, the crest's flank rising east (the shared sky paints the crest's skyline beyond), the spurs on.
(function(){const C=THREE.ShaderChunk,dv=/vFogDepth/.test(C.fog_fragment)?'vFogDepth':'fogDepth';
 C.fog_fragment=C.fog_fragment.replace(/float fogFactor = 1\.0 - exp\( - fogDensity[^;]*;/,
  'float fogD='+dv+';fogD=fogD<4000.0?fogD:4000.0+5000.0*(1.0-exp(-(fogD-4000.0)/5000.0));\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogD );');})();
const FAR=(function(){const RIN=TERR.X1,ROUT=30000,SINK=20;
 const farH=(x,z)=>g0(x,z)+(x<-2400?-.06*(-2400-x)*smooth(-2400,-12000,x):0);
 const GL=KFAR.lines({cell:60,inner:4200,out:ROUT,grow:1.06}),rr2=(ROUT-400)*(ROUT-400);
 const FARK={curve:{from:RIN},crest:{k:.4,from:7000,to:14000}};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={forest:L([44,70,60]),dry:L([128,118,82]),fell:L([118,112,104]),snow:L([232,236,242]),far:L([126,142,154])};let last={rock:0};
 const G=KFAR.grid(Object.assign({lines:GL,dense:true,
  h:(x,z)=>{if(Math.abs(x)<=RIN&&Math.abs(z)<=RIN)return terrainH(x,z)-(Math.abs(x)===RIN||Math.abs(z)===RIN?0:SINK);
   const xb=clamp(x,-RIN,RIN),zb=clamp(z,-RIN,RIN),dO=Math.hypot(x-xb,z-zb);let h=farH(x,z);if(dO<900)h+=(terrainH(xb,zb)-farH(xb,zb))*smooth(900,0,dO);return h;},
  skip:(x0,z0,x1,z1)=>Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2||(x0>-RIN+100&&x1<RIN-100&&z0>-RIN+100&&z1<RIN-100),
  color:(x,z,y,q)=>{const alt=ALT0+q.h,n1=NZ(x,z,.0031,96,2)+.5;
   let c=mixC(C.forest,C.dry,clamp(.35+(n1-.5)*1.5,0,1)*smooth(3500,4000,alt));c=mixC(c,C.fell,smooth(4350,4600,alt));
   c=mixC(c,C.snow,smooth(4800,5300,alt+250*(n1-.5)));c=mixC(c,C.fell,smooth(.6,1,q.slope)*.6);c=mixC(c,C.far,.3*smooth(5000,24000,q.r));last={rock:smooth(.6,1,q.slope)};return c;},
  attrs:{aDet:{size:1,fn:()=>1-.4*last.rock},uv:{size:2,fn:(x,z)=>[x/150,z/150]}}},FARK));
 const geo=KFAR.geometry(G,{attrs:true});
 const det=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='rgb(236,236,236)';g.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){const u=k=>KRAND.unit(KRAND.hash(4471,i,k)),x=u(1)*w,y=u(2)*h,r=2+u(3)*7,dk=u(4)<.6;
   g.fillStyle=dk?'rgba(60,70,64,'+(.18+u(5)*.3).toFixed(2)+')':'rgba(255,255,255,'+(.2+u(5)*.3).toFixed(2)+')';
   for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){g.beginPath();g.arc(x+a*w,y+b*h,r,0,TAU);g.fill();}}});
 det.encoding=THREE.LinearEncoding;det.generateMipmaps=true;det.minFilter=THREE.LinearMipmapLinearFilter;
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:det});mat.userData.farField=true;
 mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vFarR;attribute float aDet;varying float vDet;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 fwp=modelMatrix*vec4(transformed,1.0);vFarR=length(fwp.xz);vDet=aDet;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFarR;varying float vDet;')
   .replace('#include <fog_fragment>',THREE.ShaderChunk.fog_fragment.replace(/float fogFactor = ([^;]*);/,'float fogFactor = ($1);fogFactor=max(fogFactor,smoothstep(22000.0,29500.0,vFarR));'))
   .replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 texelColor=texture2D(map,vUv);\n diffuseColor.rgb*=mix(vec3(1.0),texelColor.rgb*1.12,vDet);\n#endif');};
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.probeSkip=true;mesh.userData.inspectLabel='Distant country (the ramp and the crest)';mesh.frustumCulled=false;scene.add(mesh);
 return{mesh,mat,H:farH,G,FARK,tris:G.count.tris};})();
var LIGHT_HOOKS=window.LIGHT_HOOKS||[];
var LIGHT_MODE='day';
function setLightMode(mode){if(typeof SKY!=='undefined')SKY.setMode(mode);}
LIGHT_HOOKS.push(m=>{const t=m==='night'?[.62,.66,.74]:m==='dawn'?[1,.93,.86]:[1,1,1];FAR.mat.color.setRGB(t[0],t[1],t[2]);});
