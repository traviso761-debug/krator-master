// ================================================================= HOST — Krator sky (from the hyperjungle's)
// Baked equirectangular dome and the gas giant as real geometry. Host-only: a biome never touches the sky.
// THE LIGHT OF DENSE AIR (biomes/WORLD.md): at ~1.9 atm and 0.75 g the column overhead is about 2.7x Earth's. The
// zenith is milky blue, not deep; the horizon is a bright white glare; the sun's disc and its glow are yellow-orange
// even in mid-afternoon. In the south-south-east (azimuth 152) the Throne stands nearly 300 km off, a pale ghost
// in the haze with its plume; a silver line of the Ring Sea lies under it; low kopjes and scrub on every other
// horizon, and the smoke of a far wildfire leaning north-west on the foehn. u = ((270-az)/360) mod 1.
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180,U=az=>(((270-az)/360)%1+1)%1;
 // --- the column: a milky zenith, a white glare at the horizon, the ground below it warm and hazed ----------
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#7a96b8');grd.addColorStop(0.15,'#8aa2be');
 grd.addColorStop(0.30,'#a6b6c8');grd.addColorStop(0.42,'#c6ccce');
 grd.addColorStop(0.478,'#e2e0d6');grd.addColorStop(0.497,'#f0ebde');
 grd.addColorStop(0.503,'#ddd2be');grd.addColorStop(0.60,'#b8a286');
 grd.addColorStop(0.78,'#9a8266');grd.addColorStop(1.00,'#7e6a52');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // --- THE SUN, at the azimuth the directional light uses: (-1000,900,-700) is azimuth 305.0, altitude 36.4 ---
 const sx=w*U(305.0),sy=HZ-36.4*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,620);
  gl.addColorStop(0,'rgba(255,238,196,.95)');gl.addColorStop(.06,'rgba(255,226,170,.55)');
  gl.addColorStop(.24,'rgba(255,214,150,.2)');gl.addColorStop(1,'rgba(255,210,150,0)');
  g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-620+k*w,sy-620,1240,1240);
  wrapE(sx,sy,15,15,'rgba(255,240,206,1)');}
 // --- cirrus high up, a few flat-based cumulus low ---------------------------------------------------------
 for(let i=0;i<34;i++){const y=HZ-rr(28,70)*DEG,x=rng()*w,L=rr(200,700),a=rr(-.06,.06);
  g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(248,246,240,'+(.05+.09*rng()).toFixed(3)+')';
  for(let k=0;k<5;k++){g.beginPath();g.ellipse(rr(-L*.4,L*.4),rr(-6,6),L*rr(.3,.6),rr(2,6),0,0,TAU);g.fill();}g.restore();}
 for(let ci=0;ci<70;ci++){const t=Math.pow(rng(),1.5),cy=HZ-(3+t*30)*DEG,cx=rng()*w,sc=.35+.9*t+rr(0,.3),cw=rr(60,150)*sc,ch2=cw*rr(.16,.3),ca=(.18+.28*rng())*(1-.3*t);
  wrapE(cx,cy+ch2*.12,cw*.92,ch2*.34,'rgba(170,166,160,'+(ca*.5).toFixed(3)+')');
  for(let p2=0,nP=6+Math.floor(rng()*7);p2<nP;p2++){const px=cx+rr(-1,1)*cw*.78,k2=1-Math.abs(px-cx)/cw,pr=ch2*(.45+.75*k2)*rr(.75,1.2);
   wrapE(px,cy-pr*.55,pr*1.5,pr,'rgba(252,248,240,'+(ca*rr(.6,1)).toFixed(3)+')');}}
 // --- veils of haze and dust low down ----------------------------------------------------------------------
 for(let i=0;i<50;i++)wrapE(rng()*w,HZ-rr(2,HZ*.35),rr(300,1200),rr(6,22),'rgba(244,238,226,'+(.03+.06*rng()).toFixed(3)+')');
 // --- two small moons, well off the giant ------------------------------------------------------------------
 [[0.38,26,54,'rgba(236,232,224,'],[0.615,17,38,'rgba(226,214,206,']].forEach(M=>{const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.5)');wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.25)');});
 // --- THE THRONE, far in the south-south-east: a broad pale cone in the haze, the plume leaning north-west -----
 (function(){const vx=w*U(152),base=HZ+6,vh=4.6*DEG,vw=430;
  const far=a=>'rgba(178,184,190,'+a+')';
  const P=[];for(let i=0;i<=40;i++){const t=i/40,s=t*2-1,pr=Math.pow(1-Math.pow(Math.abs(s),1.25),1.35);P.push([vx+s*vw,base-vh*pr-(fbm(t*5,1.3,31,2)-.5)*5*pr]);}
  g.fillStyle=far(.55);g.beginPath();g.moveTo(vx-vw,base+10);P.forEach(q=>g.lineTo(q[0],q[1]));g.lineTo(vx+vw,base+10);g.closePath();g.fill();
  // the lit west flank (the sun is in the north-west)
  g.save();g.beginPath();g.moveTo(vx-vw,base+10);P.forEach(q=>g.lineTo(q[0],q[1]));g.lineTo(vx+vw,base+10);g.closePath();g.clip();
  const lf=g.createLinearGradient(vx-vw,0,vx+vw,0);lf.addColorStop(0,'rgba(236,232,224,.28)');lf.addColorStop(.5,'rgba(236,232,224,.08)');lf.addColorStop(1,'rgba(120,124,134,.12)');
  g.fillStyle=lf;g.fillRect(vx-vw,base-vh-10,2*vw,vh+30);g.restore();
  // the plume: puffs rising and drifting off to one side on the high wind
  for(let i=0;i<140;i++){const t=i/140;wrapE(vx-t*t*360+rr(-18,18)*(.3+t),base-vh-4-t*86-rr(0,14),8+t*48+rr(0,12),8+t*40+rr(0,10),'rgba(214,210,204,'+(.03*(1-t*.6)).toFixed(3)+')');}
  const vv=g.createLinearGradient(0,base-vh-20,0,base);vv.addColorStop(0,'rgba(236,232,222,.08)');vv.addColorStop(1,'rgba(236,232,222,.7)');
  g.fillStyle=vv;g.fillRect(vx-vw-1000,base-vh-20,2*(vw+1000),vh+20);})();
 // --- A FAR WILDFIRE in the north-east: a leaning column of brown-grey smoke, flattening into a shelf ----------
 (function(){const fx=w*U(48),base=HZ-.3*DEG;
  for(let i=0;i<120;i++){const t=i/120,lean=t*t*260;
   wrapE(fx+lean+rr(-10,10)*(.3+t),base-t*22*DEG*(1-.35*t)-rr(0,8),6+t*60+rr(0,10),5+t*26+rr(0,8),'rgba('+Math.round(150+50*t)+','+Math.round(132+50*t)+','+Math.round(116+52*t)+','+(.06*(1-t*.5)).toFixed(3)+')');}
  wrapE(fx+300,base-15*DEG,520,26,'rgba(200,186,168,.10)');})();
 // --- the horizon: the Ring Sea's silver line in the south-east, low kopjes and scrub everywhere -------------
 const facing=(u,az0,p)=>{const az=((270-u*360)%360+360)%360,d=Math.abs(((az-az0)%360+540)%360-180);return Math.pow(Math.max(0,Math.cos(d*Math.PI/180)),p);};
 g.fillStyle='rgba(236,238,236,.5)';g.beginPath();g.moveTo(0,HZ+3);for(let x=0;x<=w;x+=2){const e=facing(x/w,140,6);g.lineTo(x,HZ+3-e*.45*DEG);}g.lineTo(w,HZ+4);g.closePath();g.fill();
 const ridge=(col,h0,h1,off,tor)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+20);
  for(let x=0;x<=w;x+=2){const u=x/w,n=fbm(off+u*48,off,7,3),k=Math.max(0,fbm(off*2+u*90,off*2,13,2)-.6)/.4,sea=facing(u,140,6);
   g.lineTo(x,HZ-((h0+(h1-h0)*n)+tor*Math.pow(k,1.5))*DEG*(1-.85*sea));}
  g.lineTo(w,HZ+20);g.closePath();g.fill();};
 ridge('rgba(176,170,160,.55)',.2,.7,17.3,1.6);
 ridge('rgba(136,124,104,.75)',.1,.4,41.7,.9);
 const gm=g.createLinearGradient(0,HZ-DEG*1.6,0,HZ+24);
 gm.addColorStop(0,'rgba(236,230,216,0)');gm.addColorStop(.3,'rgba(236,230,216,.35)');gm.addColorStop(1,'rgba(222,210,190,.95)');
 g.fillStyle=gm;g.fillRect(0,HZ-DEG*1.6,w,DEG*1.6+24);
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
 uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0xd2d0c4)},
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
  'void main(){vUvR=position.xy/'+GIANT_R.toFixed(1)+';vec4 wp=modelMatrix*vec4(position,1.0);',
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
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS.clone().multiplyScalar(Math.cos(.105)).addScaledVector(giantDir,-Math.sin(.105)).normalize());   // opened 6 degrees toward us: a plane exactly edge-on covers no pixel
giantRing.renderOrder=-9;giantRing.userData.probeSkip=true;scene.add(giantRing);
TICKS.push(function(dt){GU.uSpin.value+=dt*0.006;});
