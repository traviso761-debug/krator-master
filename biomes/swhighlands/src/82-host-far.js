// ================================================================= HOST — the fog curve, the far country, the farm's walls, the light modes
// The shared sky (89s-host-sky.js) draws the sky and drives the sun, the hemisphere, the fill, the fog and the exposure by the
// hour. What this page adds: the fog's shape, the FAR COUNTRY round the map on core/terrain's far field (KFAR: the folds run
// on, ridge after ridge parallel to the crest, the ramp rising east toward the crest and falling west toward the Ancient's
// Valley), the stone walls of the Republic's last farm, and the light modes the page speaks in. Host-only.

// ---------------------------------------------------------------- the fog
// plain exponential out to 4 km, then the optical depth grows ever slower (to a 9 km ceiling): the folds read ridge behind
// ridge into the haze instead of vanishing into it (nhighlands' curve)
(function(){const C=THREE.ShaderChunk,dv=/vFogDepth/.test(C.fog_fragment)?'vFogDepth':'fogDepth';
 C.fog_fragment=C.fog_fragment.replace(/float fogFactor = 1\.0 - exp\( - fogDensity[^;]*;/,
  'float fogD='+dv+';fogD=fogD<4000.0?fogD:4000.0+5000.0*(1.0-exp(-(fogD-4000.0)/5000.0));\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogD );');})();

// ---------------------------------------------------------------- the far country (KFAR)
// The same ground function past the map: the four folds (their spines run 90 km), the ramp, the swells; beyond the east and
// west folds the next ridges, every 1.6-2.2 km (KRELIEF.range, seeded by index). Colours by height and slope: the native
// forest's dark green-teal on the flanks, paler turf on the crests, rock on the steep; bluer with distance.
const FAR=(function(){const RIN=TERR.X1,ROUT=30000,SINK=20;
 const MORE=[];for(let k=1;k<=12;k++){for(const sg of[-1,1]){const x=sg<0?-2350-k*1900+180*NZ(k,0,1,201,1):2950+k*2000+200*NZ(k,1,1,202,1);
  MORE.push(KRELIEF.range({a:[x,-90000],b:[x,90000],h:200+130*KRAND.unit(KRAND.hash(WORLD,k,sg+5,203))+12*k,w:520+80*KRAND.unit(KRAND.hash(WORLD,k,sg+5,204)),crest:.72,toe:.12,serr:.06,seed:300+k*2+(sg>0?1:0)}));}}
 const farH=(x,z)=>{let h=g0(x,z);let m=0;for(const f of MORE){const v=f(x,z);if(v>m)m=v;}return Math.max(h,baseH(x,z)+m)+(x>0?.012*Math.max(0,x-6000):0);};
 const GL=KFAR.lines({cell:60,inner:4200,out:ROUT,grow:1.06}),rr2=(ROUT-400)*(ROUT-400);
 const FARK={curve:{from:RIN},crest:{k:.4,from:7000,to:14000}};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={forest:L([40,66,48]),forest2:L([30,56,50]),turf:L([96,118,72]),rock:L([118,108,96]),far:L([118,138,150]),farm:L([112,128,70])};
 let last={rock:0};
 const G=KFAR.grid(Object.assign({lines:GL,dense:true,
  h:(x,z)=>{if(Math.abs(x)<=RIN&&Math.abs(z)<=RIN)return terrainH(x,z)-(Math.abs(x)===RIN||Math.abs(z)===RIN?0:SINK);
   const xb=clamp(x,-RIN,RIN),zb=clamp(z,-RIN,RIN),dO=Math.hypot(x-xb,z-zb);let h=farH(x,z);if(dO<900)h+=(terrainH(xb,zb)-farH(xb,zb))*smooth(900,0,dO);return h;},
  skip:(x0,z0,x1,z1)=>Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2||(x0>-RIN+100&&x1<RIN-100&&z0>-RIN+100&&z1<RIN-100),   /* none under the map's own ground */
  color:(x,z,y,q)=>{const n1=NZ(x,z,.0031,96,2)+.5,r=q.r,slope=q.slope,R=ridgeAt(x,z);
   let c=mixC(C.forest,C.forest2,clamp(Math.abs(n1-.5)*3,0,1));c=mixC(c,C.turf,smooth(.82,.97,R.f)*.6);
   const rock=smooth(.6,1.0,slope);c=mixC(c,C.rock,rock);
   if(z<-1700&&z>-6000&&R.f<.08&&x>-800)c=mixC(c,C.farm,.5*smooth(-1700,-2400,z));   /* the Republic's fields reach on up the north valley */
   c=mixC(c,C.far,.3*smooth(5000,24000,r));last={rock};return c;},
  attrs:{aDet:{size:1,fn:()=>1-.4*last.rock},uv:{size:2,fn:(x,z)=>[x/150,z/150]}}},FARK));
 const geo=KFAR.geometry(G,{attrs:true});
 // the canopy grain: crowns and gaps (a KRAND canvas), multiplied in by aDet
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
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.probeSkip=true;mesh.userData.inspectLabel='Distant country (the ring folds run on)';mesh.frustumCulled=false;scene.add(mesh);
 return{mesh,mat,H:farH,G,FARK,tris:G.count.tris};})();

// ---------------------------------------------------------------- the farm's walls
// Dry-stone walls along the enclosures' hedge lines (KRELIEF.fields hedges), 1.1 m high and 0.7 m thick, following the ground;
// the library's old stone wall (materials.json wallStone) or a grey grain. The farmstead itself is the Republic's builds'
const FARM_WALLS=(function(){const H=1.1,W=.35,pos=[],nor=[],uv=[],idx=[];let n=0,len=0;
 const hedges=FARM_FIELDS.hedges([FARM.x0+30,FARM.x1-30,FARM.z0+10,FARM.z1-30],6);
 const ok=(x,z)=>farmK(x,z)>.5&&BIO.mask(x,z)===0&&!(waterH(x,z)>-1e8)&&slopeAt(x,z)<.35;
 for(const Hd of hedges){const P=Hd.pts;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(!ok(a[0],a[1])||!ok(b[0],b[1]))continue;
  const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*W,nz=dx/l*W,ya=terrainH(a[0],a[1])-.15,yb=terrainH(b[0],b[1])-.15;len+=l;
  const v=[[a[0]-nx,ya,a[1]-nz],[b[0]-nx,yb,b[1]-nz],[b[0]-nx*.7,yb+H,b[1]-nz*.7],[a[0]-nx*.7,ya+H,a[1]-nz*.7],
   [a[0]+nx,ya,a[1]+nz],[b[0]+nx,yb,b[1]+nz],[b[0]+nx*.7,yb+H,b[1]+nz*.7],[a[0]+nx*.7,ya+H,a[1]+nz*.7]];
  const quad=(q,N,u0)=>{const o=pos.length/3;q.forEach((k,j)=>{pos.push(v[k][0],v[k][1],v[k][2]);nor.push(N[0],N[1],N[2]);uv.push(u0+(j===1||j===2?l:0)/1.5,(j>=2?H:0)/1.5);});idx.push(o,o+1,o+2,o,o+2,o+3);n+=2;};
  quad([0,1,2,3],[-nx/W,0,-nz/W],0);quad([5,4,7,6],[nx/W,0,nz/W],0);quad([3,2,6,7],[0,1,0],0);}}
 if(!pos.length)return null;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
 const L=hostLib('wallStone'),m=new THREE.MeshLambertMaterial({color:L?0xffffff:0x8a867a,map:L?L.map:ROCK_GRAIN});
 const me=new THREE.Mesh(g,m);me.userData.host=true;me.userData.inspectLabel='Dry-stone walls (the Iron Republic\'s last farm)';scene.add(me);
 REGISTER({name:FARM.name,key:'structure.farm',kind:'structure',x:(FARM.x0+FARM.x1)/2,z:(FARM.z0+FARM.z1)/2,y:terrainH((FARM.x0+FARM.x1)/2,(FARM.z0+FARM.z1)/2)-5,r:Math.min(FARM.x1-FARM.x0,FARM.z1-FARM.z0)/2,h:30});
 return{mesh:me,tris:n,lenM:Math.round(len)};})();

// ---------------------------------------------------------------- light modes
// setLightMode('day'|'dawn'|'night') jumps the clock to that mode's hour (SKY.modes in 89s-host-sky.js); LIGHT_MODE follows the
// sun and every LIGHT_HOOKS fn(mode) runs on each change (the host's mist and the far country)
var LIGHT_HOOKS=window.LIGHT_HOOKS||[];
var LIGHT_MODE='day';
function setLightMode(mode){if(typeof SKY!=='undefined')SKY.setMode(mode);}
LIGHT_HOOKS.push(m=>{const t=m==='night'?[.62,.66,.74]:m==='dawn'?[1,.93,.86]:[1,1,1];FAR.mat.color.setRGB(t[0],t[1],t[2]);});
