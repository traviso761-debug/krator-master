// ================================================================= HOST — the fog curve, the far country, the light modes (station 4)
// As station 6's (stations/treeline/82-host-far.js) with this station's ground carried on past the map: the table and its rim run
// on east and west (its slots and cliff the same function), the floor falling away south toward the lowlands.
(function(){const C=THREE.ShaderChunk,dv=/vFogDepth/.test(C.fog_fragment)?'vFogDepth':'fogDepth';
 C.fog_fragment=C.fog_fragment.replace(/float fogFactor = 1\.0 - exp\( - fogDensity[^;]*;/,
  'float fogD='+dv+';fogD=fogD<4000.0?fogD:4000.0+5000.0*(1.0-exp(-(fogD-4000.0)/5000.0));\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogD );');})();
const FAR=(function(){const RIN=Math.max(-TERR.X0,TERR.X1,-TERR.Z0,TERR.Z1),ROUT=30000,SINK=20,X0=TERR.X0,X1=TERR.X1,Z0=TERR.Z0,Z1=TERR.Z1;   /* the map is a box, not a square about the origin */
 const farH=(x,z)=>TABLE(x,z)+(z>1600?-.05*(z-1600)*smooth(1600,12000,z):0);
 const GL=KFAR.lines({cell:60,inner:RIN+600,out:ROUT,grow:1.06}),rr2=(ROUT-400)*(ROUT-400);
 const FARK={curve:{from:RIN},crest:{k:.4,from:7000,to:14000}};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={floor:L([74,104,58]),table:L([150,120,96]),rock:L([170,96,80]),white:L([214,200,186]),far:L([126,142,154])};let last={rock:0};
 const G=KFAR.grid(Object.assign({lines:GL,dense:true,
  h:(x,z)=>{if(x>=X0&&x<=X1&&z>=Z0&&z<=Z1)return groundH(x,z)-(x===X0||x===X1||z===Z0||z===Z1?0:SINK);
   const xb=clamp(x,X0,X1),zb=clamp(z,Z0,Z1),dO=Math.hypot(x-xb,z-zb);let h=farH(x,z);if(dO<900)h+=(groundH(xb,zb)-farH(xb,zb))*smooth(900,0,dO);return h;},
  skip:(x0,z0,x1,z1)=>Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2||(x0>X0+100&&x1<X1-100&&z0>Z0+100&&z1<Z1-100),
  color:(x,z,y,q)=>{const n1=NZ(x,z,.0031,96,2)+.5,zz=zone(x,z);
   let c=mixC(C.floor,C.table,smooth(.31,.27,zz));c=mixC(c,mixC(C.rock,C.white,clamp(n1*1.4-.2,0,1)),smooth(.5,1,q.slope));c=mixC(c,C.far,.3*smooth(5000,24000,q.r));last={rock:smooth(.6,1,q.slope)};return c;},
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
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.probeSkip=true;mesh.userData.inspectLabel='Distant country (the tableland and the floor)';mesh.frustumCulled=false;scene.add(mesh);
 return{mesh,mat,H:farH,G,FARK,tris:G.count.tris};})();
var LIGHT_HOOKS=window.LIGHT_HOOKS||[];
var LIGHT_MODE='day';
function setLightMode(mode){if(typeof SKY!=='undefined')SKY.setMode(mode);}
LIGHT_HOOKS.push(m=>{const t=m==='night'?[.62,.66,.74]:m==='dawn'?[1,.93,.86]:[1,1,1];FAR.mat.color.setRGB(t[0],t[1],t[2]);});
