// ================================================================= HOST — Krator sky (from the southern highlands')
// Baked equirectangular dome and the gas giant as real geometry. Host-only: a biome never touches the sky.
// THE SKY OF THE VALLEY: about 1 atm at 1600 m, clear cold air, so the zenith is a deep cool blue and the sun white; the
// horizon is pale and faintly lilac. Snow ranges stand all round: NORTH and SOUTH the valley's walls run on as high
// ridges; EAST the head wall, highest, with the cataract's white thread and its spray; WEST the floor runs out through
// the pass toward Xanadu, lower, in haze, and the Throne stands far off beyond it (azimuth 285).
// u = ((270-az)/360) mod 1.
// A host that stands elsewhere in the valley says where things are (OIDONG_SKY, optional, set before this fragment):
// {head: the head wall's azimuth (90), pass: the pass's (270), throne: the Throne's (285), cataract: false for none}; the
// side walls stand at head +-90. Without it the showcase's valley is drawn as it always was.
const OSKY=(function(){const o=(typeof OIDONG_SKY!=='undefined'&&OIDONG_SKY)||{};
 return {head:o.head==null?90:o.head,pass:o.pass==null?270:o.pass,throne:o.throne==null?285:o.throne,cataract:o.cataract==null?true:o.cataract};})();
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180,U=az=>(((270-az)/360)%1+1)%1;
 const facing=(u,az0,p)=>{const az=((270-u*360)%360+360)%360,d=Math.abs(((az-az0)%360+540)%360-180);return Math.pow(Math.max(0,Math.cos(d*Math.PI/180)),p);};
 // --- the column: a deep cool zenith, a pale lilac horizon; below it the far land in a cool haze -------------------
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#345ea4');grd.addColorStop(0.15,'#4870b2');
 grd.addColorStop(0.30,'#5f84bc');grd.addColorStop(0.42,'#96b0d2');
 grd.addColorStop(0.478,'#c8d0e2');grd.addColorStop(0.497,'#e4e4ec');
 grd.addColorStop(0.503,'#c8ccc8');grd.addColorStop(0.60,'#a4aaa0');
 grd.addColorStop(0.78,'#848a82');grd.addColorStop(1.00,'#6a6e6a');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // --- THE SUN, at the azimuth the directional light uses: (-1000,900,-700) is azimuth 305.0, altitude 36.4 ---
 const sx=w*U(305.0),sy=HZ-36.4*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,520);
  gl.addColorStop(0,'rgba(255,253,244,.95)');gl.addColorStop(.06,'rgba(255,250,232,.5)');
  gl.addColorStop(.24,'rgba(255,246,228,.14)');gl.addColorStop(1,'rgba(255,242,224,0)');
  g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-520+k*w,sy-520,1040,1040);
  wrapE(sx,sy,14,14,'rgba(255,253,248,1)');}
 // --- cirrus high up, thin and still ---------------------------------------------------------------------------
 for(let i=0;i<34;i++){const y=HZ-rr(28,74)*DEG,x=rng()*w,L=rr(220,760),a=rr(-.05,.05);
  g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(250,250,254,'+(.05+.09*rng()).toFixed(3)+')';
  for(let k=0;k<5;k++){g.beginPath();g.ellipse(rr(-L*.4,L*.4),rr(-6,6),L*rr(.3,.6),rr(2,6),0,0,TAU);g.fill();}g.restore();}
 // --- two small moons, well off the giant ------------------------------------------------------------------
 [[0.38,26,54,'rgba(236,236,240,'],[0.615,17,38,'rgba(226,222,226,']].forEach(M=>{const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.5)');wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.25)');});
 // --- the ranges: a range line by azimuth, fbm ridges, snow on the tops ------------------------------------------
 const ridge=(col,snow,hOf,off)=>{const pts=[];for(let x=0;x<=w;x+=2){const u=x/w,n=fbm(off+u*48,off,7,3),k=Math.max(0,fbm(off*2+u*90,off*2,13,2)-.6)/.4,hh=hOf(u,n,k);pts.push([x,HZ+3-hh*DEG,hh]);}
  g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+20);pts.forEach(p=>g.lineTo(p[0],p[1]));g.lineTo(w,HZ+20);g.closePath();g.fill();
  if(snow){g.fillStyle=snow;g.beginPath();g.moveTo(0,HZ+20);pts.forEach(p=>g.lineTo(p[0],p[1]));g.lineTo(w,HZ+20);g.closePath();g.save();g.clip();
   // snow above a snowline that wanders: the tops only
   pts.forEach(p=>{const sl=HZ+3-(p[2]*.62+.9)*DEG;if(p[1]<sl)g.fillRect(p[0],p[1]-1,2,sl-p[1]+1);});g.restore();}};
 // the far ranges (pale), then the near walls (deeper); east the head wall highest, west the pass lowest
 ridge('rgba(168,182,206,.6)','rgba(238,242,248,.75)',(u,n,k)=>{const E=facing(u,OSKY.head,1.6),W=facing(u,OSKY.pass,2);return (2.2+2.6*n+1.4*k)*(1-.55*W)+2.0*E;},23.1);
 ridge('rgba(118,138,166,.72)','rgba(236,240,246,.8)',(u,n,k)=>{const E=facing(u,OSKY.head,2.2),W=facing(u,OSKY.pass,2),NS=Math.max(facing(u,OSKY.head-90,1.4),facing(u,OSKY.head+90,1.4));return (1.4+2.2*n+1.2*k)*(1-.7*W)*(.5+.5*NS)+2.6*E*(1+.3*n);},41.7);
 // --- the cataract at the head: a white thread down the east wall, and spray at its foot --------------------------
 if(OSKY.cataract)(function(){const cx=w*U(OSKY.head),top=HZ+3-3.1*DEG,bot=HZ+2;
  for(let k=-1;k<=1;k++){g.strokeStyle='rgba(248,250,252,.85)';g.lineWidth=5;g.beginPath();g.moveTo(cx+k*w,top);g.lineTo(cx+k*w+6,bot);g.stroke();
   g.strokeStyle='rgba(248,250,252,.4)';g.lineWidth=12;g.beginPath();g.moveTo(cx+k*w,top);g.lineTo(cx+k*w+6,bot);g.stroke();}
  for(let i=0;i<26;i++)wrapE(cx+rr(-70,70),bot-rr(0,30),rr(24,60),rr(8,20),'rgba(244,246,248,'+(.12+.16*rng()).toFixed(3)+')');})();
 // --- THE THRONE, far in the west-north-west over the pass: a pale cone with its plume ----------------------------
 (function(){const vx=w*U(OSKY.throne),base=HZ+2,vh=2.0*DEG,vw=220;const far=a=>'rgba(170,182,200,'+a+')';
  const P=[];for(let i=0;i<=40;i++){const t=i/40,s=t*2-1,pr=Math.pow(1-Math.pow(Math.abs(s),1.25),1.35);P.push([vx+s*vw,base-vh*pr-(fbm(t*5,1.3,31,2)-.5)*4*pr]);}
  g.fillStyle=far(.55);g.beginPath();g.moveTo(vx-vw,base+10);P.forEach(q=>g.lineTo(q[0],q[1]));g.lineTo(vx+vw,base+10);g.closePath();g.fill();
  for(let i=0;i<100;i++){const t=i/100;wrapE(vx+t*t*260+rr(-14,14)*(.3+t),base-vh-4-t*70-rr(0,12),8+t*40+rr(0,10),8+t*34+rr(0,8),'rgba(222,224,228,'+(.03*(1-t*.6)).toFixed(3)+')');}})();
 // the haze at the horizon
 const gm=g.createLinearGradient(0,HZ-DEG*2.2,0,HZ+24);
 gm.addColorStop(0,'rgba(228,230,238,0)');gm.addColorStop(.3,'rgba(228,230,238,.3)');gm.addColorStop(1,'rgba(216,220,226,.6)');
 g.fillStyle=gm;g.fillRect(0,HZ-DEG*2.2,w,DEG*2.2+24);
});
skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,72,44),
 new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));
sky.userData.probeSkip=true;sky.renderOrder=-10;scene.add(sky);
// THE GAS GIANT Krator orbits (canon: 30 degrees across at azimuth 66, altitude 25), as the other kits draw it: the band
// coordinates in the fragment shader from the world normal against a spin axis in the plane of the sky, tilted 23 degrees
const GIANT_DIST=6000,GIANT_R=GIANT_DIST*Math.tan(15*Math.PI/180);
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180)).normalize();
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
 uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0xd0d6e4)},
 uSpin:{value:0},uRingLat:{value:.08},uHazeK:{value:.26}};
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
  ' vec3 outc=col*limb*(0.92*day)+col*limb*uNightC*0.11;',
  ' float fres=pow(max(1.0-ndv,0.0),3.2);',
  ' outc+=uRimCol*fres*0.16*mix(smoothstep(-0.35,0.45,ndl),1.0,0.15);',
  ' float up=max(vSky.y,0.0);',
  ' outc=mix(outc,uHazeC,clamp(0.22+uHazeK*exp(-up/0.16),0.0,0.8));',
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
  ' float a=0.62*(0.45+0.55*sin(t*34.0))*(1.0-smoothstep(0.86,1.0,t));',
  ' a*=smoothstep(0.0,0.06,t);',
  ' a*=1.0-0.55*smoothstep(0.40,0.46,t)*(1.0-smoothstep(0.46,0.52,t));',
  ' vec3 c=uCol*(0.8+0.3*sin(t*21.0));',
  ' float up=max(vSky.y,0.0);',
  ' c=mix(c,uHazeC,clamp(0.26+uHazeK*exp(-up/0.16),0.0,0.86));',
  ' gl_FragColor=vec4(c,a);}'].join('\n')});
const giantRing=new THREE.Mesh(new THREE.RingGeometry(GIANT_R*1.30,GIANT_R*2.12,256,1),ringMat);
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS.clone().multiplyScalar(Math.cos(.105)).addScaledVector(giantDir,-Math.sin(.105)).normalize());
giantRing.renderOrder=-9;giantRing.userData.probeSkip=true;scene.add(giantRing);
TICKS.push(function(dt){GU.uSpin.value+=dt*0.006;});
