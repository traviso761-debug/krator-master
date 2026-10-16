// ================================================================= HOST — Krator sky (from the Hexahedron)
// Baked equirectangular dome (a dry, deep-blue column with an ochre dust haze,
// the sun, a few cumulus and cirrus, the Inner Wall mountains standing high in
// the west, the far side of the Abyss a haze line in the east, low mesas on
// every other horizon) and the gas giant as real geometry. Host-only: a biome
// never touches the sky.

// ---------------------------------------------------------------- the Inner Wall painter
// We are on the plateau of the eastern high desert. The Inner Wall -- the
// crater's great rampart -- stands in the west: a range of peaks 14-22 degrees
// high at azimuth 270, falling to a low blue rim to the north and south, and
// nothing to the east but the haze over the Abyss. u = ((270-az)/360) mod 1,
// so west (az 270) is u=0/1; north u=.75, south u=.25, east u=.5.
// how much a dome column at u faces azimuth az0: 1 straight at it, falling off as cos^p
function facing(u,az0,p){const az=((270-u*360)%360+360)%360,d=Math.abs(((az-az0)%360+540)%360-180);return Math.pow(Math.max(0,Math.cos(d*Math.PI/180)),p);}
function paintWall(g,w,h,HZ,DEG){const base=HZ+6;
 const westOf=u=>facing(u,270,1.2);
 const rimH=(u,layer)=>{const west=westOf(u);
  const n=fbm(u*19+layer*7,layer*3.3,61+layer,3)-.5,n2=fbm(u*131+layer*2,layer,73+layer,3)-.5,n3=fbm(u*400,layer*2,75,2)-.5;
  const peaks=Math.pow(Math.max(0,fbm(u*47+layer,layer*5,91,2)-.5)/.5,1.6);
  return (layer===0?1.2+west*4:.8+west*15.5)*DEG+n*(layer===0?1.5:4.0)*DEG*(0.3+west)+n2*1.6*DEG*(.2+west)+n3*.5*DEG+peaks*4.5*DEG*west;};
 const wallPath=layer=>{g.beginPath();g.moveTo(0,base+40);for(let x=0;x<=w;x+=2)g.lineTo(x,base-rimH(x/w,layer));g.lineTo(w,base+40);g.closePath();};
 // the far ranges: blue-grey, hazed
 g.fillStyle='rgba(150,160,180,.5)';wallPath(0);g.fill();
 // the near wall: violet-grey rock, lit crests, darker toward the foot in its own haze
 const grd=g.createLinearGradient(0,HZ-22*DEG,0,base);
 grd.addColorStop(0,'rgba(120,112,124,1)');grd.addColorStop(.45,'rgba(96,88,98,1)');grd.addColorStop(1,'rgba(128,118,116,1)');
 g.fillStyle=grd;wallPath(1);g.fill();
 g.save();wallPath(1);g.clip();
 // strata and ridges: bands falling to the right (the dip), gullies from the crests
 for(let i=0;i<1800;i++){const u=rng(),e=westOf(u);if(rng()>e*e)continue;
  const x=u*w,top=base-rimH(u,1),t=rng(),y=mix(top,base,t);
  g.strokeStyle='rgba('+(rng()<.55?'56,50,58':'168,160,156')+','+(.10+rng()*.22).toFixed(2)+')';g.lineWidth=1+rng()*1.6;
  g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-90,90),y+rr(-8,8));g.stroke();
  if(rng()<.12){g.strokeStyle='rgba(40,36,44,'+(.2+rng()*.22).toFixed(2)+')';g.lineWidth=rr(1.5,3.5);g.beginPath();g.moveTo(x,top+3);g.lineTo(x+rr(-6,6),mix(top,base,rr(.4,.9)));g.stroke();}}
 // sunlit crests (the sun is WNW: the west faces glow), a shadow under each
 for(let x=0;x<=w;x+=2){const u=x/w,e=westOf(u),top=base-rimH(u,1);
  g.fillStyle='rgba(246,232,214,'+(.42*e).toFixed(2)+')';g.fillRect(x,top,2,3+e*9);
  g.fillStyle='rgba(40,36,44,'+(.2*e).toFixed(2)+')';g.fillRect(x,top+5+e*8,2,4+e*8);}
 // the foot: a paler talus apron and the mountains' own dust haze
 g.beginPath();g.moveTo(0,base+40);for(let x=0;x<=w;x+=2){const u=x/w,e=westOf(u);g.lineTo(x,base-(e*2.4*DEG)*(0.7+0.3*fbm(u*53,2,97,2))-(fbm(u*211,3,98,2)-.5)*1.0*DEG*e);}g.lineTo(w,base+40);g.closePath();
 g.fillStyle='rgba(160,140,124,.8)';g.fill();
 const vv=g.createLinearGradient(0,HZ-16*DEG,0,base);
 vv.addColorStop(0,'rgba(222,206,184,.0)');vv.addColorStop(1,'rgba(222,206,184,.55)');
 g.fillStyle=vv;g.fillRect(0,HZ-16*DEG,w,base-HZ+16*DEG);
 g.restore();}
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180;
 // --- the column: dry air, a deep zenith, an ochre dust band at the horizon -
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#2f5aa0');grd.addColorStop(0.14,'#4570b0');
 grd.addColorStop(0.30,'#6f92c2');grd.addColorStop(0.42,'#9fb4cc');
 grd.addColorStop(0.478,'#cdd2c8');grd.addColorStop(0.497,'#e6d8c0');
 grd.addColorStop(0.503,'#d2b494');grd.addColorStop(0.60,'#b88a66');
 grd.addColorStop(0.78,'#9a6a4c');grd.addColorStop(1.00,'#7a5238');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){
  g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // --- THE SUN, at the azimuth the directional light actually uses ----------
 // sun.position is (-1000,1150,-560): azimuth 299.2, altitude 45.1. u follows
 // the dome's own mapping, u = ((270-az)/360) mod 1.
 const SUNU=((270-299.2)/360%1+1)%1, sx=w*SUNU, sy=HZ-45.1*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,520);
  gl.addColorStop(0,'rgba(255,250,236,.95)');gl.addColorStop(.05,'rgba(255,244,214,.5)');
  gl.addColorStop(.2,'rgba(255,236,196,.16)');gl.addColorStop(1,'rgba(255,230,180,0)');
  g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-520+k*w,sy-520,1040,1040);
  wrapE(sx,sy,15,15,'rgba(255,253,244,1)');}
 // --- cirrus: long thin streaks high up -----------------------------------
 for(let i=0;i<40;i++){const y=HZ-rr(28,70)*DEG,x=rng()*w,L=rr(200,700),a=rr(-.06,.06);
  g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(245,246,250,'+(.05+.1*rng()).toFixed(3)+')';
  for(let k=0;k<5;k++){g.beginPath();g.ellipse(rr(-L*.4,L*.4),rr(-6,6),L*rr(.3,.6),rr(2,6),0,0,TAU);g.fill();}g.restore();}
 // --- a few fair-weather cumulus, flat-based, low ---------------------------
 for(let ci=0;ci<60;ci++){
  const t=Math.pow(rng(),1.5);
  const cy=HZ-(3+t*26)*DEG, cx=rng()*w;
  const sc=.35+.9*t+rr(0,.3), cw=rr(60,140)*sc, ch2=cw*rr(.16,.3);
  const ca=(.2+.3*rng())*(1-.3*t);
  wrapE(cx,cy+ch2*.12,cw*.92,ch2*.34,'rgba(160,150,150,'+(ca*.5).toFixed(3)+')');
  const nP=6+Math.floor(rng()*7);
  for(let p2=0;p2<nP;p2++){
   const px=cx+rr(-1,1)*cw*.78,k2=1-Math.abs(px-cx)/cw;
   const pr=ch2*(.45+.75*k2)*rr(.75,1.2);
   wrapE(px,cy-pr*.55,pr*1.5,pr,'rgba(252,250,246,'+(ca*rr(.6,1)).toFixed(3)+')');}}
 // --- dust veils near the horizon ------------------------------------------
 for(let i=0;i<40;i++)
  wrapE(rng()*w,HZ-rr(2,HZ*.3),rr(300,1200),rr(6,20),'rgba(236,220,196,'+(.03+.06*rng()).toFixed(3)+')');
 // --- two small moons, well off the giant ----------------------------------
 [[0.38,26,54,'rgba(232,228,220,'],[0.615,17,38,'rgba(220,206,198,']].forEach(M=>{
  const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.6)');
  wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.3)');});
 // --- THE INNER WALL in the west --------------------------------------------
 paintWall(g,w,h,HZ,DEG);
 // --- the far side of the Abyss: a haze line low in the east, the desert's
 //     far mesas everywhere else ------------------------------------------------
 const eastOf=u=>facing(u,90,1.6);
 g.beginPath();g.moveTo(0,HZ+20);for(let x=0;x<=w;x+=2){const u=x/w,e=eastOf(u);g.lineTo(x,HZ-(0.35+.35*(fbm(u*40,1,113,2)-.5))*DEG*e-(1-e)*.2*DEG);}g.lineTo(w,HZ+20);g.closePath();g.fillStyle='rgba(176,168,172,.45)';g.fill();
 const mesas=(col,h0,h1,off)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+20);
  for(let x=0;x<=w;x+=2){const u=x/w,e=eastOf(u),n=fbm(off+u*60,off,7,2),step=Math.floor(fbm(off*3+u*180,off*3,11,2)*5)/5;
   let hh=(h0+(h1-h0)*step)*(1-e*.9)*(.6+.4*n);g.lineTo(x,HZ-hh*DEG);}
  g.lineTo(w,HZ+20);g.closePath();g.fill();};
 mesas('rgba(168,132,116,.55)',.15,.7,17.3);
 mesas('rgba(140,98,84,.7)',.1,.45,41.7);
 const gm=g.createLinearGradient(0,HZ-DEG*1.2,0,HZ+24);
 gm.addColorStop(0,'rgba(216,196,172,0)');gm.addColorStop(.3,'rgba(216,196,172,.3)');
 gm.addColorStop(1,'rgba(216,196,172,.95)');
 g.fillStyle=gm;g.fillRect(0,HZ-DEG*1.2,w,DEG*1.2+24);
});
skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,72,44),
 new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));
sky.userData.probeSkip=true;sky.renderOrder=-10;scene.add(sky);
// THE GAS GIANT Krator orbits, ported from Girder's sky as real geometry
// rather than a painted sprite. Canon: 30 degrees across at azimuth 67,
// altitude 25 -- sixty full moons wide. It stands over the Abyss, in the
// north-east, well clear of the Inner Wall: no overlay dome is needed here.
//
// The band coordinates are computed in the FRAGMENT shader from the world-space
// normal against a world-space spin axis, so the mesh needs no rotation of its
// own and there is no local/world convention to get wrong. The axis lies in the
// PLANE OF THE SKY, tilted 23 degrees from the sky's own up: that is the only
// reading that gives both a tilted planet AND rings seen as a hairline.
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
 uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0xc4b4a0)},
 uSpin:{value:0},uRingLat:{value:.08},uHazeK:{value:.30}};
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
  // deeper in the air than its upper one; the air is drier here than on the
  // basin floor, so the floor under the extinction is lower
  ' float up=max(vSky.y,0.0);',
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
  ' c=mix(c,uHazeC,clamp(0.2+uHazeK*exp(-up/0.16),0.0,0.86));',
  ' gl_FragColor=vec4(c,a);}'].join('\n')});
const giantRing=new THREE.Mesh(new THREE.RingGeometry(GIANT_R*1.30,GIANT_R*2.12,256,1),ringMat);
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS.clone().multiplyScalar(Math.cos(.105)).addScaledVector(giantDir,-Math.sin(.105)).normalize());   // opened 6 degrees toward us: a plane exactly edge-on covers no pixel
giantRing.renderOrder=-9;giantRing.userData.probeSkip=true;scene.add(giantRing);
TICKS.push(function(dt){GU.uSpin.value+=dt*0.006;});
