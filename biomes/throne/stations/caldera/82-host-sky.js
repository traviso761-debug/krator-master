// ================================================================= HOST — Krator sky (the caldera rim: the Throne's summit, ~10.75 km up)
// Baked equirectangular dome and the gas giant as real geometry. Host-only: a biome never touches the sky.
// At the top of the mountain in thin air (~0.4 atm): the sky a deep blue going toward indigo overhead, a pale band at the
// horizon; nothing above but the plume (86 draws it, in the scene). Far below on every side the cloud belts lie as a sea of
// cloud (the horizon dips ~3.5 degrees from here), the Ring Sea a grey line beyond. setLightMode('day'|'night') (below).
// u = ((270-az)/360) mod 1.
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180,U=az=>(((270-az)/360)%1+1)%1;
 const azOf=x=>((270-x/w*360)%360+360)%360,dAz=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#0e2250');grd.addColorStop(0.15,'#183470');
 grd.addColorStop(0.30,'#2c5292');grd.addColorStop(0.42,'#5a80b4');
 grd.addColorStop(0.478,'#9cb6d2');grd.addColorStop(0.497,'#c4d2e0');
 grd.addColorStop(0.503,'#b4c4d4');grd.addColorStop(0.60,'#9aaabc');
 grd.addColorStop(0.78,'#8a98aa');grd.addColorStop(1.00,'#7a8898');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // the sun, where the directional light is: (-850,900,500) is azimuth 240, altitude 42
 const sx=w*U(239.5),sy=HZ-42.4*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,620);gl.addColorStop(0,'rgba(255,238,200,.95)');gl.addColorStop(.06,'rgba(255,228,176,.5)');
  gl.addColorStop(.24,'rgba(255,214,160,.18)');gl.addColorStop(1,'rgba(255,210,150,0)');g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-620+k*w,sy-620,1240,1240);
  wrapE(sx,sy,15,15,'rgba(255,242,210,1)');}
 // cirrus, and towering cumulus over the windward slope (the east and north-east) and out over the sea
 for(let i=0;i<26;i++){const y=HZ-rr(30,70)*DEG,x=rng()*w,L=rr(200,700),a=rr(-.06,.06);
  g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(248,246,240,'+(.05+.07*rng()).toFixed(3)+')';
  for(let k=0;k<5;k++){g.beginPath();g.ellipse(rr(-L*.4,L*.4),rr(-6,6),L*rr(.3,.6),rr(2,6),0,0,TAU);g.fill();}g.restore();}
 for(let ci=0;ci<0;ci++){const t=Math.pow(rng(),1.4),az=rng()<.55?rr(200,340):rr(0,360),cy=HZ-(2+t*20)*DEG,cx=w*U(az),sc=.45+1.1*t+rr(0,.4),cw=rr(70,170)*sc,ch2=cw*rr(.25,.45),ca=(.22+.3*rng())*(1-.2*t);
  wrapE(cx,cy+ch2*.12,cw*.92,ch2*.34,'rgba(150,156,160,'+(ca*.6).toFixed(3)+')');
  for(let p2=0,nP=8+Math.floor(rng()*9);p2<nP;p2++){const px=cx+rr(-1,1)*cw*.78,k2=1-Math.abs(px-cx)/cw,pr=ch2*(.45+.75*k2)*rr(.75,1.2);
   wrapE(px,cy-pr*.7,pr*1.4,pr,'rgba(252,252,248,'+(ca*rr(.6,1)).toFixed(3)+')');}}
 [[0.38,26,54,'rgba(236,232,224,'],[0.615,17,38,'rgba(226,214,206,']].forEach(M=>{const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.5)');wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.25)');});
 // THE CLOUD SEA all round, 2-5 degrees under the horizon (the belts far below on every flank); the Ring Sea beyond it
 g.fillStyle='rgba(150,166,184,.85)';g.fillRect(0,HZ+3.6*DEG,w,1.2*DEG);
 for(let i=0;i<1600;i++){const az=rr(0,360),el=-(2.0+3.2*Math.pow(rng(),.7));
  wrapE(w*U(az),HZ-el*DEG,rr(30,120),rr(6,16),'rgba(248,250,252,'+(.12+.22*rng()).toFixed(3)+')');}
 // the haze at the horizon
 const gm=g.createLinearGradient(0,HZ-DEG*1.6,0,HZ+24);gm.addColorStop(0,'rgba(214,222,216,0)');gm.addColorStop(.3,'rgba(214,222,216,.3)');gm.addColorStop(1,'rgba(190,200,190,.85)');
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

// ---------------------------------------------------------------- day and night
// setLightMode('day'|'night'): the lights, the fog, the dome's tint, the exposure, and the kit's glow (THRONE.setNight).
// At night the giant is the moon: a cold light from the north-east, and the plume's life lights itself.
let LIGHT_MODE='day';
// high and clear: a strong white sun, the snow throwing light back up (a bright ground colour on the hemisphere), the exposure
// held down so the snow keeps its shading; at night the moonlit snow
const LIGHTS={day:{sunC:0xfff6ea,sunI:1.35,hemiS:0x8aa4cc,hemiG:0x7a7c84,hemiI:.7,fillI:.18,fog:0xb8c8dc,sky:0xffffff,exp:.9,night:0},
 night:{sunC:0x8aa6c8,sunI:.2,hemiS:0x24304a,hemiG:0x141418,hemiI:.3,fillI:.04,fog:0x141a26,sky:0x1c2232,exp:1.15,night:1}};
const _onLight=[];
function setLightMode(m){const L=LIGHTS[m]||LIGHTS.day;LIGHT_MODE=m;sun.color.setHex(L.sunC);sun.intensity=L.sunI;
 if(m==='night')sun.position.copy(giantDir).multiplyScalar(1600);else sun.position.set(...SUN_POS);
 hemi.color.setHex(L.hemiS);hemi.groundColor.setHex(L.hemiG);hemi.intensity=L.hemiI;fill.intensity=L.fillI;
 scene.fog.color.setHex(L.fog);sky.material.color.setHex(L.sky);renderer.toneMappingExposure=L.exp;
 if(typeof THRONE!=='undefined'&&THRONE.setNight)THRONE.setNight(L.night);
 _onLight.forEach(f=>f(m));}
