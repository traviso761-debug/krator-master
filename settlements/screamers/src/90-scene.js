// ---------------------------------------------------------------- scene
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb7c4ae);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
scene.add(new THREE.HemisphereLight(0xbcd0c8,0x3d3a26,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.34);fill.position.set(800,400,900);scene.add(fill);
// Sky dome, BAKED. The volcano was a 3D shield inside the dome, which at 6 km
// through this fog wants to be almost pure haze anyway -- all cost and no read,
// and it kept fighting the dome for depth. Voth and Mav's Refuge paint theirs
// into an equirectangular canvas instead, so that is what this does.
//
// SphereGeometry puts u at phi = 270 - azimuth, so u = ((270-az)/360) mod 1.
// Azimuth 0 is north (-z), the same convention the gas giant below uses. The
// volcano is due SOUTH, az 180, so it lands at u = 0.25.
const skyTex=canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180;
 // --- the column: 1.9 atm, so a milky zenith and a thick haze band ---------
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#5d7ba2');grd.addColorStop(0.14,'#6f8aa9');
 grd.addColorStop(0.30,'#8fa4b7');grd.addColorStop(0.42,'#aebdc2');
 grd.addColorStop(0.478,'#ccd6c9');grd.addColorStop(0.497,'#dde3d2');
 grd.addColorStop(0.503,'#c9d3c0');grd.addColorStop(0.60,'#93a48c');
 grd.addColorStop(0.78,'#6d8068');grd.addColorStop(1.00,'#53664f');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){
  g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // --- THE SUN, at the azimuth the directional light actually uses ----------
 // sun.position is (-1200,900,-600): azimuth 296.6, altitude 33.9. u follows
 // the dome's own mapping, u = ((270-az)/360) mod 1.
 const SUNU=((270-296.57)/360%1+1)%1, sx=w*SUNU, sy=HZ-33.85*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,460);
  gl.addColorStop(0,'rgba(255,246,226,.95)');gl.addColorStop(.06,'rgba(255,238,200,.55)');
  gl.addColorStop(.22,'rgba(255,228,178,.20)');gl.addColorStop(1,'rgba(255,224,170,0)');
  g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-460+k*w,sy-460,920,920);
  wrapE(sx,sy,15,15,'rgba(255,252,240,1)');}
 // --- cumulus: flat-based heaps, crowded toward the horizon ----------------
 for(let ci=0;ci<150;ci++){
  const t=Math.pow(rng(),1.7);
  const cy=HZ-(4+t*58)*DEG, cx=rng()*w;
  const sc=.5+2.1*t+rr(0,.6), cw=rr(70,180)*sc, ch2=cw*rr(.15,.30);
  const ca=(.17+.30*rng())*(1-.32*t);
  wrapE(cx,cy+ch2*.12,cw*.92,ch2*.34,'rgba(146,160,166,'+(ca*.55).toFixed(3)+')');
  const nP=7+Math.floor(rng()*7);
  for(let p2=0;p2<nP;p2++){
   const px=cx+rr(-1,1)*cw*.78,k2=1-Math.abs(px-cx)/cw;
   const pr=ch2*(.45+.75*k2)*rr(.75,1.2);
   wrapE(px,cy-pr*.55,pr*1.5,pr,'rgba(250,250,244,'+(ca*rr(.55,1)).toFixed(3)+')');}}
 // --- humid veils -----------------------------------------------------------
 for(let i=0;i<46;i++)
  wrapE(rng()*w,HZ-rr(14,HZ*.72),rr(300,1100),rr(8,26),
   'rgba(240,246,238,'+(.025+.055*rng()).toFixed(3)+')');
 // --- two small moons, well off the giant ----------------------------------
 [[0.38,26,54,'rgba(226,222,214,'],[0.615,17,38,'rgba(214,198,192,']].forEach(M=>{
  const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.55)');
  wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.28)');});
 // --- THE VOLCANO, due south -----------------------------------------------
 (function(){const vx=w*.25,base=HZ+9,vh=6.4*DEG,vw=345;
  const far=(t,a)=>'rgba('+Math.round(118+54*t)+','+Math.round(134+56*t)+','+Math.round(136+46*t)+','+a+')';
  const flank=(x0,x1,y1,zo)=>{const P=[];
   for(let i=0;i<=26;i++){const t=i/26;
    P.push([x0+(x1-x0)*t,base+(y1-base)*Math.pow(t,1.75)-(fbm(t*4.1+zo,zo,31,2)-.5)*9*Math.sin(t*Math.PI)]);}
   return P;};
  const apex=base-vh,wr=[vx-34,apex],fl=[vx-6,apex+8],er=[vx+30,apex+5];
  const wf=flank(vx-vw,wr[0],wr[1],.6),ef=flank(vx+vw*1.07,er[0],er[1],2.1).reverse();
  const trace=()=>{g.moveTo(vx-vw,base);wf.forEach(q=>g.lineTo(q[0],q[1]));
   g.lineTo(wr[0],wr[1]);g.lineTo(fl[0],fl[1]);g.lineTo(er[0],er[1]);
   ef.forEach(q=>g.lineTo(q[0],q[1]));g.lineTo(vx+vw*1.07,base);};
  [[-660,2.4,540],[600,2.7,600],[-220,3.1,470]].forEach(q=>{
   g.fillStyle=far(.74,.38);g.beginPath();g.moveTo(vx+q[0]-q[2],base);
   for(let k=0;k<=60;k++){const t=k/60,pr=1-Math.pow(Math.abs(t*2-1),1.6);
    g.lineTo(vx+q[0]-q[2]+2*q[2]*t,base-q[1]*DEG*pr-4*Math.sin(t*19.7)*pr);}
   g.lineTo(vx+q[0]+q[2],base);g.closePath();g.fill();});
  g.fillStyle=far(.44,.74);g.beginPath();trace();g.closePath();g.fill();
  g.save();g.beginPath();trace();g.closePath();g.clip();
  const lf=g.createLinearGradient(vx-24,0,vx+vw,0);
  lf.addColorStop(0,'rgba(230,236,240,0)');lf.addColorStop(.35,'rgba(230,236,240,.22)');
  lf.addColorStop(1,'rgba(230,236,240,.05)');
  g.fillStyle=lf;g.fillRect(vx-24,apex-6,vw+48,vh+20);
  const lg=g.createRadialGradient(fl[0],fl[1],2,fl[0],fl[1],34);
  lg.addColorStop(0,'rgba(255,170,110,.18)');lg.addColorStop(1,'rgba(255,170,110,0)');
  g.fillStyle=lg;g.fillRect(fl[0]-40,fl[1]-40,80,80);g.restore();
  for(let i=0;i<150;i++){const t=i/150;
   wrapE(fl[0]+t*t*330+rr(-22,22)*(.3+t),fl[1]-6-t*104-rr(0,17),
    10+t*54+rr(0,15),10+t*46+rr(0,13),
    'rgba(206,212,208,'+(.028*(1-t*.7)).toFixed(3)+')');}
  const vv=g.createLinearGradient(0,apex-20,0,base);
  vv.addColorStop(0,'rgba(200,214,200,.05)');vv.addColorStop(1,'rgba(200,214,200,.68)');
  g.fillStyle=vv;g.fillRect(vx-vw-1200,apex-20,2*(vw+1200),base-apex+20);})();
 // --- horizon haze and the far canopy --------------------------------------
 const hz=g.createLinearGradient(0,HZ-118,0,HZ+40);
 hz.addColorStop(0,'rgba(196,210,192,0)');hz.addColorStop(.6,'rgba(196,210,192,.44)');
 hz.addColorStop(1,'rgba(196,210,192,.86)');
 g.fillStyle=hz;g.fillRect(0,HZ-118,w,158);
 const canopy=(col,h0,h1,R,off,bump,em)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+20);
  for(let x=0;x<=w;x+=2){const an=(x%w)/w*TAU,cx2=Math.cos(an)*R,sz2=Math.sin(an)*R;
   const n=fbm(off+cx2,off+sz2,7,3),n2=fbm(off*3+cx2*6,off*3+sz2*6,11,2);
   let hh=h0+(h1-h0)*n+bump*(n2-.5);
   if(em){const e=fbm(off*7+cx2*2.2,off*7+sz2*2.2,13,2);
    hh+=em*Math.max(0,(e-.74)/.26);}                 // emergents over the line
   g.lineTo(x,HZ-hh*DEG);}
  g.lineTo(w,HZ+20);g.closePath();g.fill();};
 canopy('rgba(112,136,122,.95)',1.4,2.8,9,17.3,.4,1.1);
 canopy('rgba(76,102,90,.98)',.9,1.9,14,41.7,.55,.6);
 const gm=g.createLinearGradient(0,HZ-DEG*1.4,0,HZ+24);
 gm.addColorStop(0,'rgba(196,210,192,0)');gm.addColorStop(.3,'rgba(196,210,192,.32)');
 gm.addColorStop(1,'rgba(196,210,192,.95)');
 g.fillStyle=gm;g.fillRect(0,HZ-DEG*1.4,w,DEG*1.4+24);
});
skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,72,44),
 new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));
sky.userData.probeSkip=true;sky.renderOrder=-10;scene.add(sky);
// the gas giant, low in the north-east (Krator canon: altitude 25°, azimuth 66°)
// THE GAS GIANT Krator orbits, ported from Girder's sky as real geometry
// rather than a painted sprite. Canon: 30 degrees across at azimuth 67,
// altitude 25 -- sixty full moons wide.
//
// The band coordinates are computed in the FRAGMENT shader from the world-space
// normal against a world-space spin axis, so the mesh needs no rotation of its
// own and there is no local/world convention to get wrong. The axis lies in the
// PLANE OF THE SKY, tilted 23 degrees from the sky's own up: that is the only
// reading that gives both a tilted planet AND rings seen as a hairline. An axis
// literally 23 degrees off world-up would sit far out of the ring plane and the
// rings would be wide open.
const GIANT_DIST=6000,GIANT_R=GIANT_DIST*Math.tan(15*Math.PI/180);
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180)).normalize();
const _gE1=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),giantDir).normalize();
const _gUp=new THREE.Vector3().crossVectors(giantDir,_gE1).normalize();
const GIANT_AXIS=_gUp.clone().multiplyScalar(Math.cos(23*Math.PI/180))
 .addScaledVector(_gE1,Math.sin(23*Math.PI/180)).normalize();
const GIANT_B1=new THREE.Vector3().crossVectors(GIANT_AXIS,giantDir).normalize();
const GIANT_B2=new THREE.Vector3().crossVectors(GIANT_AXIS,GIANT_B1).normalize();
const GU={
 uSunDir:{value:new THREE.Vector3().copy(sun.position).normalize()},
 uAxis:{value:GIANT_AXIS},uE1:{value:GIANT_B1},uE2:{value:GIANT_B2},
 uZone:{value:new THREE.Color(0x3c7e91)},uBelt:{value:new THREE.Color(0xd6c9a8)},
 uStormC:{value:new THREE.Color(0xb98a63)},uRimCol:{value:new THREE.Color(0x9fd4ea)},
 uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0xb7c4ae)},
 uSpin:{value:0},uRingLat:{value:.08},uHazeK:{value:.34}};
const giantMat=new THREE.ShaderMaterial({fog:false,depthWrite:false,uniforms:GU,
 vertexShader:[
  'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.0);',
  ' vN=normalize(mat3(modelMatrix)*normal);',
  ' vV=normalize(cameraPosition-wp.xyz);',
  ' vSky=normalize(wp.xyz-cameraPosition);',
  ' gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
 fragmentShader:[
  'uniform vec3 uSunDir,uAxis,uE1,uE2,uZone,uBelt,uStormC,uRimCol,uNightC,uHazeC;',
  'uniform float uSpin,uRingLat,uHazeK;',
  'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
  'float oval(float lat,float lon,vec4 s){float dl=lat-s.x;',
  ' float dg=mod(lon-s.y+3.14159265,6.28318531)-3.14159265;',
  ' return (dg*dg)/(s.z*s.z)+(dl*dl)/(s.w*s.w);}',
  'void main(){vec3 N=normalize(vN),V=normalize(vV);',
  ' float sLat=clamp(dot(N,uAxis),-1.0,1.0), lat=asin(sLat);',
  ' float lon=atan(dot(N,uE2),dot(N,uE1))+uSpin;',
  ' float wav=0.42*sin(lon*3.0+lat*6.0)+0.24*sin(lon*7.0-2.1)+0.13*sin(lon*13.0+lat*3.0);',
  ' float b=sin(lat*10.0+wav);',
  ' vec3 col=mix(uZone,uBelt,smoothstep(-0.45,0.45,b));',
  ' col*=0.93+0.12*sin(lat*37.0+1.6*sin(lon*2.0+0.7));',
  ' col=mix(col,uZone*0.70,smoothstep(0.70,1.0,abs(sLat)));',
  ' col=mix(uStormC,col,smoothstep(0.45,1.0,oval(lat,lon,vec4(-0.36,1.10,0.40,0.13))));',
  ' col=mix(uStormC*1.12,col,smoothstep(0.45,1.0,oval(lat,lon,vec4(0.21,4.05,0.26,0.085))));',
  ' col*=1.0-0.34*(1.0-smoothstep(0.0,0.075,abs(lat-uRingLat)));',
  // clamp not max: two unit vectors can dot a hair over 1.0 and pow() of a
  // negative base is undefined in GLSL
  ' float ndv=clamp(dot(N,V),0.0,1.0);',
  ' float limb=pow(max(ndv,0.0015),0.35);',
  ' float ndl=dot(N,uSunDir);',
  ' float day=smoothstep(-0.17,0.17,ndl);',
  ' vec3 outc=col*limb*(0.92*day)+col*limb*uNightC*0.11;',
  ' float fres=pow(max(1.0-ndv,0.0),3.2);',
  ' outc+=uRimCol*fres*0.16*mix(smoothstep(-0.35,0.45,ndl),1.0,0.15);',
  // extinction: the disc is 30 deg wide, so its lower limb sits a good deal
  // deeper in the air than its upper one
  ' float up=max(vSky.y,0.0);',
  // a floor under the extinction: at this distance even the zenith is looking
// through a lot of 1.9-atm air, and without it the night side punched a
// black hole in a daylit sky
' outc=mix(outc,uHazeC,clamp(0.30+uHazeK*exp(-up/0.16),0.0,0.86));',
  ' gl_FragColor=vec4(outc,1.0);}'].join('\n')});
const giant=new THREE.Mesh(new THREE.SphereGeometry(GIANT_R,96,64),giantMat);
giant.renderOrder=-9;giant.userData.probeSkip=true;scene.add(giant);
// the rings, edge-on because the spin axis lies in the plane of the sky
const ringMat=new THREE.ShaderMaterial({fog:false,transparent:true,depthWrite:false,
 side:THREE.DoubleSide,uniforms:{uIn:{value:1.30},uOut:{value:2.12},
  uCol:{value:new THREE.Color(0xbcb09a)},uHazeC:GU.uHazeC,uHazeK:GU.uHazeK},
 vertexShader:['varying vec2 vUvR; varying vec3 vSky;',
  'void main(){vUvR=position.xy;vec4 wp=modelMatrix*vec4(position,1.0);',
  ' vSky=normalize(wp.xyz-cameraPosition);',
  ' gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
 fragmentShader:['uniform float uIn,uOut,uHazeK;uniform vec3 uCol,uHazeC;',
  'varying vec2 vUvR; varying vec3 vSky;',
  'void main(){float r=length(vUvR);',
  ' float t=(r-uIn)/(uOut-uIn);',
  ' if(t<0.0||t>1.0)discard;',
  ' float a=0.62*(0.45+0.55*sin(t*34.0))*(1.0-smoothstep(0.86,1.0,t));',
  ' a*=smoothstep(0.0,0.06,t);',
  ' a*=1.0-0.55*smoothstep(0.40,0.46,t)*(1.0-smoothstep(0.46,0.52,t));',
  ' vec3 c=uCol*(0.8+0.3*sin(t*21.0));',
  ' float up=max(vSky.y,0.0);',
  ' c=mix(c,uHazeC,clamp(0.26+uHazeK*exp(-up/0.16),0.0,0.86));',
  ' gl_FragColor=vec4(c,a);}'].join('\n')});
const giantRing=new THREE.Mesh(new THREE.RingGeometry(GIANT_R*1.30,GIANT_R*2.12,256,1),ringMat);
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS);
giantRing.renderOrder=-9;giantRing.userData.probeSkip=true;scene.add(giantRing);
tick(function(dt){GU.uSpin.value+=dt*0.006;});

// Ground: hyperjungle floor. The original painter had red Tharnish soil with
// green patches where the ruins stand; here it is the other way round --
// canopy-dark jungle everywhere, opening to trodden red soil where the village
// has cleared it, which is exactly what RUINS already marks out.
(function paintGround(){const c=TEX.ground.image,g=c.getContext('2d'),w=c.width,h=c.height;const id=g.getImageData(0,0,w,h),d=id.data;const S=40000;
 const ruins=RUINS.map(s=>[(s[0]/S+.5)*w,((s[1]-GROUND_C)/S+.5)*h,s[2]*w/S]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1),n3=fbm(x/12,y/12,3,1);
  // dark litter, not lawn: there are no shadow maps here, so the gloom under a
  // closed canopy has to be painted into the floor itself
  let r=30+(n-.5)*22+(n2-.5)*12,gg=42+(n-.5)*30+(n2-.5)*14,b=22+(n-.5)*14;
  let gr=0;for(const R of ruins){const dx=x-R[0],dy=y-R[1];const dd=Math.sqrt(dx*dx+dy*dy)/R[2];gr=Math.max(gr,clamp(1.25-dd,0,1)*clamp((n3-.22)*2.2,0,1));}
  r=lerp(r,146+n2*34,gr);gg=lerp(gg,88+n2*26,gr);b=lerp(b,62,gr);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);TEX.ground.needsUpdate=true;})();
const groundM=new THREE.Mesh(new THREE.PlaneGeometry(40000,40000),MAT.ground);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.05,GROUND_C);groundM.userData.probeSkip=true;scene.add(groundM);

// A target may add builders of its own by declaring EXTRA_BUILDERS in its
// 89z-rows.js fragment, so new work can live entirely in its own target and
// its own new src/ fragment without editing this file.
const BUILDERS=Object.assign({},typeof EXTRA_BUILDERS!=='undefined'?EXTRA_BUILDERS:{},{skyA:buildSkyA,skyB:buildSkyB,skyC:buildSkyC,mega:buildMega,fac:buildFactory,port:buildStarport,gov:buildGovernment,lib:buildLibrary,bunk:buildBunker,off:buildOffices,apt:buildApartments,amph:buildAmphitheater,fuel:buildFuelStation,radar:buildRadarTower,dish:buildDish,house:buildHouses,lab:buildLab,house2:buildHouses2,skyD:buildSkyD,skyE:buildSkyE,skyF:buildSkyF,arc:buildArc,robo:buildRobotics,campus:buildCampus,skyG:buildSkyG,skyH:buildSkyH,dc:buildDataCenter,police:buildPolice,hosp:buildHospital,hotel:buildHotel,dam:buildDam});
// A target may choose which decay levels it shows by declaring DECAYS in its
// 89z-rows.js. 0 intact, 1 ruined, 2 toppled, 3 repaired. Level 3 is a whole
// showcase of its own, so it gets its own target rather than a third variant
// crowding the row.
const SITEX=(R,d)=>d===0?-R.s:d===1?R.s:d===2?R.t:0;
for(const k in ROWS){const R=ROWS[k];
 for(const d of (typeof DECAYS!=='undefined'?DECAYS:[0,1,2])){if(d===2&&R.t===undefined)continue;
 TSTAT.cur=k+'/'+d;const _r0=REG.length,_x=SITEX(R,d);
 HOLES=(d===3)?.55:1;            // repaired: the fabric is only part-eaten
 let _G=null;
 try{_G=BUILDERS[k](scene,_x,R.z,d);}catch(e){reportErr(k+' d='+d+' '+e.stack);}
 HOLES=1;
 // The repaired dressing runs on the group the builder returned, so it reaches
 // every type without a builder knowing level 3 exists.
 if(d===3&&_G){KOFF=[_x,0,R.z];try{repairPass(_G,d);}catch(e){reportErr(k+' repair '+e.stack);}KOFF=[0,0,0];}
 for(let i=_r0;i<REG.length;i++)REG[i].type=k;           // so --assert can name the owner of an empty volume
 TSTAT.cur=null;}}
window._registered=REG.length;
kbake(scene);

