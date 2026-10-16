// ================================================================= HOST — Krator sky (from the crater drylands', the hyperjungle's)
// Baked equirectangular dome and the gas giant as real geometry. Host-only: a biome never touches the sky.
// We stand on the THRONE ITSELF, 95 km south-south-east of the summit and 1.9 km up: the mountain is the whole north
// of the sky, a long grey flank rising to the summit at azimuth 330 (5.4 degrees up: 9 km higher, 95 km off), snow on
// its crown and the plume standing out of it. The plume leans south-east on the high wind and arches over the east
// of the sky, dark brown-grey, its haze dimming the light there. To the south the ground falls away to the Ring Sea's
// silver line, ~1.9 km below. setLightMode('day'|'night') (below) switches the light; the kit's glow follows it.
// u = ((270-az)/360) mod 1.
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180,U=az=>(((270-az)/360)%1+1)%1;
 const facing=(u,az0,p)=>{const az=((270-u*360)%360+360)%360,d=Math.abs(((az-az0)%360+540)%360-180);return Math.pow(Math.max(0,Math.cos(d*Math.PI/180)),p);};
 const azOf=x=>((270-x/w*360)%360+360)%360,dAz=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
 // --- the column: lighter air than the crater floor's, greyed toward the plume in the east ----------------------
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#6c88aa');grd.addColorStop(0.15,'#7c96b4');
 grd.addColorStop(0.30,'#9aaabc');grd.addColorStop(0.42,'#bcc0c2');
 grd.addColorStop(0.478,'#d6d2c8');grd.addColorStop(0.497,'#e2dccc');
 grd.addColorStop(0.503,'#c4b8a4');grd.addColorStop(0.60,'#8e8070');
 grd.addColorStop(0.78,'#6e6256');grd.addColorStop(1.00,'#5a5048');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // --- THE SUN, at the azimuth the directional light uses: (-850,900,500) is azimuth 240, altitude 42 -----------
 const sx=w*U(239.5),sy=HZ-42.4*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,620);
  gl.addColorStop(0,'rgba(255,236,196,.95)');gl.addColorStop(.06,'rgba(255,224,170,.55)');
  gl.addColorStop(.24,'rgba(255,212,150,.2)');gl.addColorStop(1,'rgba(255,210,150,0)');
  g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-620+k*w,sy-620,1240,1240);
  wrapE(sx,sy,15,15,'rgba(255,240,206,1)');}
 // --- cirrus, and cumulus building on the windward side (the north-west) ---------------------------------------
 for(let i=0;i<30;i++){const y=HZ-rr(28,70)*DEG,x=rng()*w,L=rr(200,700),a=rr(-.06,.06);
  g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(248,246,240,'+(.05+.08*rng()).toFixed(3)+')';
  for(let k=0;k<5;k++){g.beginPath();g.ellipse(rr(-L*.4,L*.4),rr(-6,6),L*rr(.3,.6),rr(2,6),0,0,TAU);g.fill();}g.restore();}
 for(let ci=0;ci<50;ci++){const t=Math.pow(rng(),1.5),az=rng()<.6?rr(220,330):rr(0,360),cy=HZ-(5+t*28)*DEG,cx=w*U(az),sc=.35+.9*t+rr(0,.3),cw=rr(60,150)*sc,ch2=cw*rr(.16,.3),ca=(.18+.28*rng())*(1-.3*t);
  wrapE(cx,cy+ch2*.12,cw*.92,ch2*.34,'rgba(168,166,162,'+(ca*.5).toFixed(3)+')');
  for(let p2=0,nP=6+Math.floor(rng()*7);p2<nP;p2++){const px=cx+rr(-1,1)*cw*.78,k2=1-Math.abs(px-cx)/cw,pr=ch2*(.45+.75*k2)*rr(.75,1.2);
   wrapE(px,cy-pr*.55,pr*1.5,pr,'rgba(250,248,242,'+(ca*rr(.6,1)).toFixed(3)+')');}}
 // --- two small moons ------------------------------------------------------------------------------------------
 [[0.38,26,54,'rgba(236,232,224,'],[0.615,17,38,'rgba(226,214,206,']].forEach(M=>{const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.5)');wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.25)');});
 // --- across the Ring Sea, far to the south and south-east: the Inner Wall's faint line, the sea's silver -------
 g.fillStyle='rgba(176,180,186,.35)';g.beginPath();g.moveTo(0,HZ+30);
 for(let x=0;x<=w;x+=2){const az=azOf(x),f=smooth(95,135,az)*smooth(235,195,az);g.lineTo(x,HZ+.6*DEG-f*(.7+.5*fbm(x*.004,3,5,2))*DEG);}g.lineTo(w,HZ+30);g.closePath();g.fill();
 g.fillStyle='rgba(232,236,236,.6)';g.beginPath();g.moveTo(0,HZ+2.2*DEG);for(let x=0;x<=w;x+=2){const e=facing(x/w,160,4);g.lineTo(x,HZ+(1.25-e*.25)*DEG);}g.lineTo(w,HZ+2.2*DEG);g.closePath();g.fill();
 // --- THE THRONE: the flank rising to the summit in the NNW, the crown snowed, the near swells of the flank -------
 const EF=new Float32Array(w+1);
 for(let x=0;x<=w;x++){const d=dAz(azOf(x),330)*Math.PI/180,up=(1+Math.cos(d))/2,dn=(1-Math.cos(d))/2;
  EF[x]=5.4*Math.pow(up,2.2)-1.2*dn*dn+.18*(fbm(x*.006,1,11,3)-.5)+.25*Math.pow(up,8)*(fbm(x*.03,2,12,2)-.5);}
 g.fillStyle='rgba(150,150,154,.9)';g.beginPath();g.moveTo(0,HZ+3*DEG);for(let x=0;x<=w;x+=2)g.lineTo(x,HZ-EF[x]*DEG);g.lineTo(w,HZ+3*DEG);g.closePath();g.fill();
 g.save();g.beginPath();g.moveTo(0,HZ+3*DEG);for(let x=0;x<=w;x+=2)g.lineTo(x,HZ-EF[x]*DEG);g.lineTo(w,HZ+3*DEG);g.closePath();g.clip();
 // the snow above ~7 km (3.1 degrees here), streaked down the gullies; the lit west flank, the shaded east
 for(let x=0;x<=w;x+=3){const e=EF[x];if(e<3)continue;const sl=3.1+.5*(fbm(x*.02,5,13,2)-.5);g.fillStyle='rgba(236,238,242,.75)';g.fillRect(x,HZ-e*DEG,3,(e-sl)*DEG+(fbm(x*.05,6,14,2)>.55?14:0));}
 const lf=g.createLinearGradient(w*U(260),0,w*U(40),0);lf.addColorStop(0,'rgba(236,230,220,.18)');lf.addColorStop(.5,'rgba(236,230,220,0)');lf.addColorStop(1,'rgba(70,72,84,.18)');
 g.fillStyle=lf;g.fillRect(0,HZ-7*DEG,w,10*DEG);g.restore();
 // the near flank: dark swells and old cones close by
 g.fillStyle='rgba(98,92,82,.85)';g.beginPath();g.moveTo(0,HZ+3*DEG);
 for(let x=0;x<=w;x+=2){const az=azOf(x),d=dAz(az,330)*Math.PI/180,up=(1+Math.cos(d))/2,cone=Math.pow(Math.max(0,fbm(x*.012,7,15,2)-.55)/.45,1.4);
  g.lineTo(x,HZ-(1.1*Math.pow(up,1.6)+.35*(fbm(x*.008,3,16,3)-.5)+.6*cone-.4*(1-up))*DEG);}
 g.lineTo(w,HZ+3*DEG);g.closePath();g.fill();
 // --- THE PLUME: out of the summit, rising, then leaning south-east on the high wind and arching over the east ----
 // a path of (azimuth, elevation, width in degrees), dark at its belly, paler where it spreads
 const PATH=[[330,6,1.2],[333,12,2.5],[340,20,4],[358,31,6],[22,42,8],[50,50,10],[78,47,11],[98,38,11],[114,26,10],[126,14,9],[134,6,8]];
 const at=t=>{const f=t*(PATH.length-1),i=Math.min(PATH.length-2,Math.floor(f)),k=f-i,a=PATH[i],b=PATH[i+1],da=((b[0]-a[0]+540)%360)-180;return[(a[0]+da*k+360)%360,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];};
 for(let i=0;i<900;i++){const t=Math.pow(rng(),.85),p=at(t),off=rr(-1,1)*p[2]*.5,el=p[1]+off*.6,az=p[0]+off/Math.max(.25,Math.cos(el*Math.PI/180));
  const r=p[2]*rr(.25,.6)*DEG,belly=rng()<.5,a=(belly?.07:.05)*(1-.4*t);
  wrapE(w*U(az),HZ-el*DEG,r*(1+t)/Math.max(.35,Math.cos(el*Math.PI/180)),r*.75,belly?'rgba(88,80,74,'+a.toFixed(3)+')':'rgba(190,182,170,'+a.toFixed(3)+')');}
 // the plume's haze: the east of the sky greyed and yellowed under it
 for(let i=0;i<40;i++){const az=rr(20,160),el=rr(2,30);wrapE(w*U(az),HZ-el*DEG,rr(200,600),rr(30,120),'rgba(150,140,120,'+(.02+.03*rng()).toFixed(3)+')');}
 // --- the haze at the horizon ----------------------------------------------------------------------------------
 const gm=g.createLinearGradient(0,HZ-DEG*1.6,0,HZ+24);
 gm.addColorStop(0,'rgba(226,220,206,0)');gm.addColorStop(.3,'rgba(226,220,206,.3)');gm.addColorStop(1,'rgba(206,196,178,.85)');
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
const LIGHTS={day:{sunC:0xffdcae,sunI:1.28,hemiS:0xa8b4c4,hemiG:0x5e5048,hemiI:.82,fillI:.24,fog:0xc4bdb0,sky:0xffffff,exp:1.0,night:0},
 night:{sunC:0x8aa6c8,sunI:.2,hemiS:0x2a364a,hemiG:0x0e0c0c,hemiI:.3,fillI:.04,fog:0x1c2028,sky:0x262c3c,exp:1.15,night:1}};
const _onLight=[];
function setLightMode(m){const L=LIGHTS[m]||LIGHTS.day;LIGHT_MODE=m;sun.color.setHex(L.sunC);sun.intensity=L.sunI;
 if(m==='night')sun.position.copy(giantDir).multiplyScalar(1600);else sun.position.set(...SUN_POS);
 hemi.color.setHex(L.hemiS);hemi.groundColor.setHex(L.hemiG);hemi.intensity=L.hemiI;fill.intensity=L.fillI;
 scene.fog.color.setHex(L.fog);sky.material.color.setHex(L.sky);renderer.toneMappingExposure=L.exp;
 if(typeof THRONE!=='undefined'&&THRONE.setNight)THRONE.setNight(L.night);
 _onLight.forEach(f=>f(m));}
