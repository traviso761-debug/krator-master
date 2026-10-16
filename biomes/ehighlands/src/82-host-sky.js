// ================================================================= HOST — Krator sky (from the crater drylands')
// Baked equirectangular dome and the gas giant as real geometry. Host-only: a biome never touches the sky.
// THE LIGHT OF THIN AIR: at ~0.6 atm the column overhead is about 0.8x Earth's. The zenith is a deep cobalt, the
// horizon a narrow pale band, the sun white and small with almost no glow. Distance barely fades: the volcanoes on
// every horizon stand sharp, snow-capped, one breathing a thin plume; lenticular clouds sit over two of them. The
// giant in the north-east is crisp, its night side nearly black. u = ((270-az)/360) mod 1.
const SUN_AZ=((Math.atan2(SUNP[0],-SUNP[2])*180/Math.PI)+360)%360,SUN_ALT=Math.atan2(SUNP[1],Math.hypot(SUNP[0],SUNP[2]))*180/Math.PI;
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180,U=az=>(((270-az)/360)%1+1)%1;
 // --- the column: a deep zenith, a narrow pale band at the horizon, the plateau below it -------------------
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#16337a');grd.addColorStop(0.16,'#1f4a98');
 grd.addColorStop(0.32,'#3466b0');grd.addColorStop(0.43,'#5e8cc6');
 grd.addColorStop(0.482,'#9cb8d8');grd.addColorStop(0.498,'#c8d4e0');
 grd.addColorStop(0.503,'#a89a7c');grd.addColorStop(0.60,'#8a7c5e');
 grd.addColorStop(0.78,'#6e6248');grd.addColorStop(1.00,'#5a5040');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // --- THE SUN: small, white, hard ---------------------------------------------------------------------------
 const sx=w*U(SUN_AZ),sy=HZ-SUN_ALT*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,260);
  gl.addColorStop(0,'rgba(255,252,244,1)');gl.addColorStop(.05,'rgba(250,248,240,.5)');
  gl.addColorStop(.2,'rgba(220,232,250,.12)');gl.addColorStop(1,'rgba(200,220,250,0)');
  g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-260+k*w,sy-260,520,520);
  wrapE(sx,sy,11,11,'rgba(255,253,248,1)');}
 // --- a few small fair-weather cumulus, low and far ------------------------------------------------------------
 for(let ci=0;ci<26;ci++){const t=Math.pow(rng(),1.6),cy=HZ-(2+t*16)*DEG,cx=rng()*w,sc=.3+.6*t,cw=rr(50,120)*sc,ch2=cw*rr(.18,.3),ca=.35+.35*rng();
  wrapE(cx,cy+ch2*.12,cw*.9,ch2*.3,'rgba(150,164,190,'+(ca*.4).toFixed(3)+')');
  for(let p2=0,nP=5+Math.floor(rng()*6);p2<nP;p2++){const px=cx+rr(-1,1)*cw*.75,k2=1-Math.abs(px-cx)/cw,pr=ch2*(.45+.75*k2)*rr(.75,1.2);
   wrapE(px,cy-pr*.55,pr*1.5,pr,'rgba(250,252,255,'+(ca*rr(.6,1)).toFixed(3)+')');}}
 // --- two small moons ---------------------------------------------------------------------------------------
 [[0.38,34,40,'rgba(236,238,244,'],[0.615,22,28,'rgba(226,222,226,']].forEach(M=>{const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.75)');wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.3)');});
 // --- THE VOLCANOES on the horizon: snow-capped stratovolcanoes, blue-grey with distance (little of it in thin air) --
 const cone=(az,hDeg,wPx,snow,plume,lent)=>{const vx=w*U(az),base=HZ+3,vh=hDeg*DEG,P=[];
  for(let i=0;i<=48;i++){const t=i/48,s=t*2-1,pr=Math.pow(1-Math.pow(Math.abs(s),1.15),1.5);P.push([vx+s*wPx,base-vh*pr-(fbm(t*7,az*.1,33,2)-.5)*4*pr]);}
  const path=()=>{g.beginPath();g.moveTo(vx-wPx,base+8);P.forEach(q=>g.lineTo(q[0],q[1]));g.lineTo(vx+wPx,base+8);g.closePath();};
  for(let k=-1;k<=1;k++){g.save();g.translate(k*w,0);
   path();g.fillStyle='rgba(98,112,140,.92)';g.fill();
   g.save();path();g.clip();
   // the lit side (the sun is in the north-west) and the shadowed
   const lf=g.createLinearGradient(vx-wPx,0,vx+wPx,0);lf.addColorStop(0,'rgba(190,200,220,.22)');lf.addColorStop(.5,'rgba(150,160,190,.05)');lf.addColorStop(1,'rgba(40,50,80,.25)');
   g.fillStyle=lf;g.fillRect(vx-wPx,base-vh-10,2*wPx,vh+20);
   // the snow cap, ragged at its lower edge, gullies of snow running down
   const sl=base-vh*(1-snow);g.fillStyle='rgba(244,246,250,.95)';g.beginPath();g.moveTo(vx-wPx,sl);
   for(let x=vx-wPx;x<=vx+wPx;x+=3){const gul=Math.max(0,Math.sin((x-vx)*.21+az))*vh*.12;g.lineTo(x,sl+(fbm(x*.03,az,34,2)-.5)*vh*.12+gul);}g.lineTo(vx+wPx,base-vh-20);g.lineTo(vx-wPx,base-vh-20);g.closePath();g.fill();
   const sh=g.createLinearGradient(vx-wPx,0,vx+wPx,0);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.55,'rgba(120,140,180,0)');sh.addColorStop(1,'rgba(90,110,160,.35)');
   g.fillStyle=sh;g.fillRect(vx-wPx,base-vh-10,2*wPx,vh*snow+30);
   g.restore();
   g.restore();}
  // a fumarole's plume leaning off on the high wind (wrapE draws across the seam itself)
  if(plume)for(let i=0;i<60;i++){const t=i/60;wrapE(vx+t*t*160+rr(-6,6),base-vh-4-t*40-rr(0,8),5+t*26,4+t*16,'rgba(236,238,242,'+(.08*(1-t*.7)).toFixed(3)+')');}
  // a lenticular cloud parked over the summit
  if(lent){for(let j=0;j<3;j++)wrapE(vx+rr(-10,10),base-vh-18-j*7,wPx*.55*(1-j*.18),5-j,'rgba(250,250,252,.6)');}};
 cone(205,6.2,560,.42,false,true);cone(128,4.4,420,.35,true,false);cone(300,3.6,380,.3,false,false);cone(18,2.8,300,.32,false,true);cone(248,2.4,260,.28,false,false);
 // --- the plateau's far edge: low ridges, sharp, a little blue -----------------------------------------------
 const ridge=(col,h0,h1,off)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+20);
  for(let x=0;x<=w;x+=2){const u=x/w,n=fbm(off+u*40,off,7,3);g.lineTo(x,HZ-(h0+(h1-h0)*n)*DEG);}
  g.lineTo(w,HZ+20);g.closePath();g.fill();};
 ridge('rgba(120,128,138,.85)',.15,.8,23.1);
 ridge('rgba(132,118,88,.95)',.05,.35,47.3);
 const gm=g.createLinearGradient(0,HZ-DEG*.8,0,HZ+18);
 gm.addColorStop(0,'rgba(200,212,226,0)');gm.addColorStop(.4,'rgba(200,206,210,.25)');gm.addColorStop(1,'rgba(150,136,104,.9)');
 g.fillStyle=gm;g.fillRect(0,HZ-DEG*.8,w,DEG*.8+18);
});
skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,72,44),
 new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));
sky.userData.probeSkip=true;sky.renderOrder=-10;scene.add(sky);
// THE GAS GIANT Krator orbits, as real geometry (Girder's sky, by way of the crater drylands): 30 degrees across at
// azimuth 66, altitude 25, sixty full moons wide. The band coordinates are computed in the fragment shader from the
// world-space normal against a world-space spin axis that lies in the plane of the sky, tilted 23 degrees: a tilted
// planet with its rings seen as a hairline. In thin air the extinction is slight: a crisp disc, a dark night side.
const GIANT_DIST=6000,GIANT_R=GIANT_DIST*Math.tan(15*Math.PI/180);
const giantDir=new THREE.Vector3(Math.sin(GIANT_AZ*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(GIANT_AZ*Math.PI/180)*Math.cos(25*Math.PI/180)).normalize();
const _gE1=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),giantDir).normalize();
const _gUp=new THREE.Vector3().crossVectors(giantDir,_gE1).normalize();
const GIANT_AXIS=_gUp.clone().multiplyScalar(Math.cos(23*Math.PI/180)).addScaledVector(_gE1,Math.sin(23*Math.PI/180)).normalize();
const GIANT_B1=new THREE.Vector3().crossVectors(GIANT_AXIS,giantDir).normalize();
const GIANT_B2=new THREE.Vector3().crossVectors(GIANT_AXIS,GIANT_B1).normalize();
const GU={
 uSunDir:{value:new THREE.Vector3().copy(sun.position).normalize()},
 uAxis:{value:GIANT_AXIS},uE1:{value:GIANT_B1},uE2:{value:GIANT_B2},
 uZone:{value:new THREE.Color(0x3c7e91)},uBelt:{value:new THREE.Color(0xd6c9a8)},
 uStormC:{value:new THREE.Color(0xb98a63)},uRimCol:{value:new THREE.Color(0x9fd4ea)},
 uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0x6a8cc4)},
 uSpin:{value:0},uRingLat:{value:.08},uHazeK:{value:.12}};
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
  ' float ndv=clamp(dot(N,V),0.0,1.0);',
  ' float limb=pow(max(ndv,0.0015),0.35);',
  ' float ndl=dot(N,uSunDir);',
  ' float day=smoothstep(-0.17,0.17,ndl);',
  ' vec3 outc=col*limb*(0.95*day)+col*limb*uNightC*0.08;',
  ' float fres=pow(max(1.0-ndv,0.0),3.2);',
  ' outc+=uRimCol*fres*0.16*mix(smoothstep(-0.35,0.45,ndl),1.0,0.15);',
  // thin air: a light floor of extinction, deeper only toward the lower limb
  ' float up=max(vSky.y,0.0);',
  ' outc=mix(outc,uHazeC,clamp(0.06+uHazeK*exp(-up/0.16),0.0,0.6));',
  ' gl_FragColor=vec4(outc,1.0);}'].join('\n')});
const giant=new THREE.Mesh(new THREE.SphereGeometry(GIANT_R,96,64),giantMat);
giant.renderOrder=-9;giant.userData.probeSkip=true;scene.add(giant);
const ringMat=new THREE.ShaderMaterial({fog:false,transparent:true,depthWrite:false,
 side:THREE.DoubleSide,uniforms:{uIn:{value:1.30},uOut:{value:2.12},
  uCol:{value:new THREE.Color(0xbcb09a)},uHazeC:GU.uHazeC,uHazeK:GU.uHazeK},
 vertexShader:['varying vec2 vUvR; varying vec3 vSky;',
  'void main(){vUvR=position.xy/'+GIANT_R.toFixed(1)+';vec4 wp=modelMatrix*vec4(position,1.0);',
  ' vSky=normalize(wp.xyz-cameraPosition);',
  ' gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
 fragmentShader:['uniform float uIn,uOut,uHazeK;uniform vec3 uCol,uHazeC;',
  'varying vec2 vUvR; varying vec3 vSky;',
  'void main(){float r=length(vUvR);',
  ' float t=(r-uIn)/(uOut-uIn);',
  ' if(t<0.0||t>1.0)discard;',
  ' float a=0.7*(0.45+0.55*sin(t*34.0))*(1.0-smoothstep(0.86,1.0,t));',
  ' a*=smoothstep(0.0,0.06,t);',
  ' a*=1.0-0.55*smoothstep(0.40,0.46,t)*(1.0-smoothstep(0.46,0.52,t));',
  ' vec3 c=uCol*(0.8+0.3*sin(t*21.0));',
  ' float up=max(vSky.y,0.0);',
  ' c=mix(c,uHazeC,clamp(0.05+uHazeK*exp(-up/0.16),0.0,0.6));',
  ' gl_FragColor=vec4(c,a);}'].join('\n')});
const giantRing=new THREE.Mesh(new THREE.RingGeometry(GIANT_R*1.30,GIANT_R*2.12,256,1),ringMat);
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS.clone().multiplyScalar(Math.cos(.105)).addScaledVector(giantDir,-Math.sin(.105)).normalize());   // opened 6 degrees toward us: a plane exactly edge-on covers no pixel
giantRing.renderOrder=-9;giantRing.userData.probeSkip=true;scene.add(giantRing);
TICKS.push(function(dt){GU.uSpin.value+=dt*0.006;});
