// ================================================================= HOST — the fog curve, the far country and the light modes
// (2026-10-26) The painted dome, the gas giant and its ring are gone: 89-host-sky.js draws the shared sky (ATMOS.sky) and drives
// the sun, the hemisphere, the fill, the fog and the exposure by the hour. What this page adds to it stays here: the fog's
// shape, the FAR COUNTRY as a coarse real mesh round the map (to 35 km; the shared sky's ridges stand beyond it), and the
// light modes the rest of the page speaks in. Host-only: a biome never touches the sky.

// ---------------------------------------------------------------- the fog
// The fog's shape lives here (r128 names the varying 'fogDepth', r136+ 'vFogDepth':
// the patch takes either). Not exponential-squared, which leaves the near forest
// crystal clear and walls off the distance: plain exponential out to 4 km, then the optical depth
// grows ever slower (to a 9 km ceiling), so the lowlands and the lake 20 km off
// still read through the haze instead of vanishing into it.
(function(){const C=THREE.ShaderChunk,dv=/vFogDepth/.test(C.fog_fragment)?'vFogDepth':'fogDepth';
 C.fog_fragment=C.fog_fragment.replace(/float fogFactor = 1\.0 - exp\( - fogDensity[^;]*;/,
  'float fogD='+dv+';fogD=fogD<4000.0?fogD:4000.0+5000.0*(1.0-exp(-(fogD-4000.0)/5000.0));\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogD );');})();

// ---------------------------------------------------------------- the far country
// A coarse vertex-coloured skirt from the map's square edge out to 35 km. The
// grid lines are 110 m apart inside +-8250 (so +-3300 falls on them) and widen
// by 6% a line beyond. Inside the square the vertices sit 25 m under terrainH
// (the ground's apron hides the rest); on the edge they ARE terrainH; outside,
// farH continues the flank and is pulled onto the edge within 1.5 km.
//   along the axis (NE, SW)  the same ramp, ridges, scarps and swells, on and on
//   NW (down-axis)           off the foothills onto the lowland plain at -330 m
//                            within ~5 km, low hills, groves, the jade lake
//   SE (up-axis)             the Inner Wall's lower slopes: 2700 m by 13 km,
//                            ridges growing, forest giving way to rock and snow
const FAR=(function(){
 const RIN=TERR.X1,CELL=110,IN2=8250,ROUT=35000,SINK=25;
 const farRamp=typeof STATION_FAR_RAMP==='function'?STATION_FAR_RAMP:(s=>s<=-4900?-330*smooth(-4900,-9800,s):s>=4900?1400+1300*smooth(4900,13000,s)+600*smooth(13000,30000,s):rampH(s));   /* a station on other ground gives its own (stations/<name>/) */
 // the lake: an irregular lobe along the axis, 12-28 km out to the NW; rho<1 is water
 const LK={s:-20000,t:1200,a:8000,b:5000,lev:-355};
 const rimOf=th=>1+.32*(fbm(Math.cos(th)*1.6+4,Math.sin(th)*1.6,91,3)-.5)+.14*(fbm(Math.cos(th)*5+1,Math.sin(th)*5,92,2)-.5);
 const lakeRho=(x,z)=>{const s=(sOf(x,z)-LK.s)/LK.a,t=(tOf(x,z)-LK.t)/LK.b;return Math.hypot(s,t)/rimOf(Math.atan2(t,s));};
 function farH(x,z){const s=sOf(x,z),t=tOf(x,z);
  const k=(1-.5*smooth(-5500,-9500,s))*(1-.45*smooth(9000,20000,Math.max(Math.abs(x),Math.abs(z))));   // the plain is gentler than the flank; far off, the cells are coarse and the grain would alias
  let h=farRamp(s)+k*(baseH(x,z)-rampH(s));
  if(s>4900){const ue=Math.min(2.3,(s+4900)/9800)-1,w=fbm(x*.0007+3,z*.0007-2,61,2)*900;   // the range's spurs grow on
   const rn=1-Math.abs(fbm(t*.0005+w*.0004,s*.00018,66,3)*2-1);
   h+=200*ue*(rn-.55)*1.7+320*ue*(fbm(x*.0003+2,z*.0003,65,3)-.5);}
  if(s<-9000){const rho=lakeRho(x,z);
   if(rho<1.4){const hl=LK.lev+70*(rho-1)-60*smooth(.99,.8,rho)-50*smooth(.8,.3,rho);   /* a shelf, then the deep */h=mix(hl,Math.max(h,LK.lev+12),smooth(1.06,1.4,rho));}}
  return h;}
 // THE LATTICE ON KFAR (core/terrain/44-core-farfield.js, 2026-10-26: HEIGHT-RESEARCH item 3 made core): the same grid
 // lines (110 m inside +-8250, then each 6% wider out to 35 km), heights, colours, detail weights and uv as this fragment
 // drew by hand; the far field's options (FARK: the planet's curvature, a crest pass, exaggeration of the far range) on top
 const GL=KFAR.lines({cell:CELL,inner:IN2,out:ROUT,grow:1.06}),N=GL.length;
 const FARK={curve:{from:RIN},crest:{k:.5,from:9000,to:16000},exag:{from:12000,to:24000,k:1.15,base:-330}};   /* off: {} (the look before 2026-10-26) */
 const L=a=>a.map(v=>Math.pow(v/255,2.2));
 const C={temp:L([42,68,38]),bor:L([32,58,50]),crL:L([66,94,48]),crD:L([22,38,26]),fh:L([52,80,40]),
  mea:L([116,136,70]),mea2:L([100,126,60]),grove:L([58,88,44]),rock:L([92,98,110]),snow:L([232,236,242]),sand:L([184,174,136]),bed:L([96,140,120]),far:L([118,138,150])};
 const mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const rr2=(ROUT-500)*(ROUT-500);let last=null;
 const G=KFAR.grid(Object.assign({lines:GL,dense:true,
  h:(x,z)=>{let h;if(Math.abs(x)<=RIN&&Math.abs(z)<=RIN)h=terrainH(x,z)-(Math.abs(x)===RIN||Math.abs(z)===RIN?0:SINK);
   else{const xb=clamp(x,-RIN,RIN),zb=clamp(z,-RIN,RIN),dO=Math.hypot(x-xb,z-zb);h=farH(x,z);
    if(dO<1500)h+=(terrainH(xb,zb)-farH(xb,zb))*smooth(1500,0,dO);}
   return h;},
  skip:(x0,z0,x1,z1)=>Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2,
  /* colour: dark conifer on the flank (temperate low, boreal high), the crowns in blotches; the lowlands gold-green with
     darker groves; rock and snow up the range; sand round the lake; bluer with distance (q.h: the height before FARK) */
  color:(x,z,y,q)=>{const h=q.h,r=q.r,slope=q.slope;
    const n1=fbm(x*.0031+1,z*.0031-2,96,2),n2=fbm(x*.011,z*.011,97,2);
    let c=mixC(C.temp,C.bor,smooth(450,1150,h));
    c=mixC(c,n1>.5?C.crL:C.crD,Math.min(1,Math.abs(n1-.5)*3.2));
    c=mixC(c,C.fh,smooth(150,-60,h)*.5);                                    // the foothills' broadleaf old growth
    const low=smooth(-80,-230,h);
    if(low>0){const gv=smooth(.40,.56,fbm(x*.0011+5,z*.0011,98,3));let lc=mixC(mixC(C.mea,C.mea2,n2),C.grove,gv);c=mixC(c,lc,low);}
    const rock=Math.max(smooth(1950,2350,h+200*(n1-.5)),smooth(.6,1.0,slope)*smooth(300,900,h));c=mixC(c,C.rock,rock);
    const snow=smooth(2500,2800,h+300*(fbm(x*.0016,z*.0016,99,3)-.5)*2)*(1-smooth(.6,1.0,slope));c=mixC(c,C.snow,snow);
    let wet=0;if(h<-300){const rho=lakeRho(x,z);if(rho<1.25){c=mixC(c,C.sand,.6*smooth(1.07,1.0,rho));if(rho<1){c=mixC(c,C.bed,smooth(1,.9,rho));wet=1;}}}
    c=mixC(c,C.far,.3*smooth(5000,26000,r));
   last={low,snow,rock,wet};return c;},
  attrs:{aDet:{size:1,fn:()=>last.wet?0:(1-.55*last.low)*(1-.75*last.snow)*(1-.4*last.rock)},uv:{size:2,fn:(x,z)=>[x/170,z/170]}}},FARK));
 const geo=KFAR.geometry(G,{attrs:true});
 // the canopy grain: crowns and gaps, multiplied in by aDet (none on water, little on snow)
 let _q=4471;const Q=()=>{_q=(_q*16807)%2147483647;return _q/2147483647;};
 const det=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='rgb(236,236,236)';g.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){const x=Q()*w,y=Q()*h,r=2+Q()*7,dk=Q()<.6;
   g.fillStyle=dk?'rgba(70,70,70,'+(.18+Q()*.3).toFixed(2)+')':'rgba(255,255,255,'+(.2+Q()*.3).toFixed(2)+')';
   for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){g.beginPath();g.arc(x+a*w,y+b*h,r,0,TAU);g.fill();}}});
 det.encoding=THREE.LinearEncoding;det.generateMipmaps=true;det.minFilter=THREE.LinearMipmapLinearFilter;
 // fade to the fog colour by 33.5 km (the dome below the horizon is that colour)
 // and the fog thins up the range's slopes (their snow stands above the valley haze)
 const fade=(m,useDet)=>{m.onBeforeCompile=sh=>{
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vFarR,vFarY;'+(useDet?'\nattribute float aDet;\nvarying float vDet;':''))
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 fwp=modelMatrix*vec4(transformed,1.0);vFarR=length(fwp.xz);vFarY=fwp.y;'+(useDet?'vDet=aDet;':''));
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFarR,vFarY;'+(useDet?'\nvarying float vDet;':''))
   .replace('#include <fog_fragment>',THREE.ShaderChunk.fog_fragment.replace(/float fogFactor = ([^;]*);/,'float fogFactor = ($1)*mix(1.0,0.55,smoothstep(1600.0,3200.0,vFarY));fogFactor=max(fogFactor,smoothstep(24000.0,33500.0,vFarR));'));
  if(useDet)sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 texelColor=texture2D(map,vUv);\n diffuseColor.rgb*=mix(vec3(1.0),texelColor.rgb*1.12,vDet);\n#endif');};};
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:det});fade(mat,true);
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.probeSkip=true;mesh.userData.inspectLabel='Distant country';mesh.frustumCulled=false;scene.add(mesh);
 // the lake: a flat polar mesh at -355 m, reaching a little past the shore so the
 // banks bury its edge (pushed back in depth so they win the near-ties at 20 km)
 const NT=192,RHO=[0,.25,.5,.7,.85,.95,1,1.06,1.12],lp=[],lc=[],li=[];
 const jd=L([34,104,96]),je=L([60,118,106]);
 for(let q=0;q<RHO.length;q++)for(let a=0;a<NT;a++){const th=a/NT*TAU,rm=rimOf(th)*RHO[q],s=LK.s+LK.a*rm*Math.cos(th),t=LK.t+LK.b*rm*Math.sin(th),p=xzOf(s,t);
  lp.push(p[0],KFAR.shape(FARK,p[0],p[1],LK.lev),p[1]);   /* the lake drops and lifts with the land round it (FARK) */
 const cc=mixC(jd,je,smooth(.55,1,RHO[q]));lc.push(cc[0],cc[1],cc[2]);}
 for(let q=0;q<RHO.length-1;q++)for(let a=0;a<NT;a++){const a1=(a+1)%NT,i0=q*NT+a,i1=q*NT+a1,i2=(q+1)*NT+a,i3=(q+1)*NT+a1;li.push(i0,i1,i2,i1,i3,i2);}
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(lc,3));
 lg.setIndex(li);lg.computeVertexNormals();
 if(lg.attributes.normal.getY(NT)<0){for(let i=0;i<li.length;i+=3){const q=li[i+1];li[i+1]=li[i+2];li[i+2]=q;}lg.setIndex(li);lg.computeVertexNormals();}   // (s,t)->(x,z) is a mirror: face it up
 const lmat=new THREE.MeshPhongMaterial({vertexColors:true,specular:0x26302e,shininess:140,polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:2});fade(lmat,false);
 const lake=new THREE.Mesh(lg,lmat);lake.userData.probeSkip=true;lake.userData.inspectLabel='Distant country · the lowland lake';lake.frustumCulled=false;scene.add(lake);
 return{mesh,lake,mat,lmat,H:farH,lakeRho,LAKE:LK,tris:G.count.tris+li.length/3,G,FARK};})();


// ---------------------------------------------------------------- light modes
// setLightMode('day'|'dawn'|'night') jumps the clock to that mode's hour (SKY.modes in 89-host-sky.js: day 15:33, the
// nearest the old afternoon sun; dawn 06:54, the sun 7.5 degrees up; night 22:00). LIGHT_MODE follows the sun (night below -6
// degrees, dawn below 8) and every LIGHT_HOOKS fn(mode) runs on each change (the biome's glow, the host's water and mist).
var LIGHT_HOOKS=window.LIGHT_HOOKS||[];
var LIGHT_MODE='day';
function setLightMode(mode){if(typeof SKY!=='undefined')SKY.setMode(mode);}
// the far country is vertex-coloured: at dawn and at night its colour comes down with the light, as it did
LIGHT_HOOKS.push(m=>{const t=m==='night'?[.62,.66,.74]:m==='dawn'?[1,.93,.86]:[1,1,1];FAR.mat.color.setRGB(t[0],t[1],t[2]);FAR.lmat.color.setRGB(t[0],t[1],t[2]);});
