// ================================================================= HOST — Krator sky (from the Hexahedron)
// Baked equirectangular dome (haze column, sun, cumulus, the Inner and Outer
// Walls on the horizon, the inland sea's open horizon to the NW) and the gas
// giant as real geometry. Host-only: a biome never touches the sky.

// ---------------------------------------------------------------- the walls
// We are in Krator's NW quadrant. The OUTER WALL stands far across the lake to the NW,
// low and hazed; the INNER WALL rises as mountains to the SE, near and jagged. Both run
// NE-SW, across the lowlands, so each sinks to the horizon toward the NE and the SW,
// where the country lies open -- a straight wall of height h at distance d subtends
// atan(tan(e0)*cos(az-az0)).
// u = ((270-az)/360) mod 1, as the dome maps it.
function paintWalls(g,w,h,HZ,DEG){const base=HZ+6;
 // NW: the Outer Wall, far across the lake, low and hazed; SE: the Inner Wall's MOUNTAINS, near, high and jagged
 const WALLS=[{az0:315,e0:3.2,col:[128,142,152],jag:.2,name:'outer'},{az0:135,e0:16,col:[78,90,106],jag:1,name:'inner'}];
 WALLS.forEach((W,wi)=>{
  const elev=u=>{const az=((270-u*360)%360+360)%360;let d=((az-W.az0+540)%360)-180;const c=Math.cos(d*Math.PI/180);if(c<=0)return 0;
   const e=Math.atan(Math.tan(W.e0*Math.PI/180)*c)*180/Math.PI;const n=fbm(u*31+wi*7,wi*3.3,81+wi,3)-.5,n2=fbm(u*170+wi,wi,83+wi,2)-.5,pk=Math.pow(Math.max(0,fbm(u*60+wi*5,wi*2,85+wi,2)-.45)/.55,2);
   return Math.max(0,e*(1+n*W.jag*1.4+pk*W.jag*.9)+n2*.25*Math.min(1,e));};   // jag: ridgelines and peaks (the mountains are jagged, the far wall is not)
  const path=()=>{g.beginPath();g.moveTo(0,base+40);for(let x=0;x<=w;x+=2)g.lineTo(x,base-elev(x/w)*DEG);g.lineTo(w,base+40);g.closePath();};
  const c=W.col,grd=g.createLinearGradient(0,HZ-W.e0*DEG*1.2,0,base);
  grd.addColorStop(0,'rgba('+c.join(',')+',1)');grd.addColorStop(1,'rgba('+c.map(v=>v+40).join(',')+',1)');
  g.fillStyle=grd;path();g.fill();g.save();path();g.clip();
  // strata and gullies, stronger where the wall stands high
  for(let i=0;i<1400;i++){const u=rng(),e=elev(u);if(e<.4||rng()>e/W.e0)continue;const x=u*w,top=base-e*DEG,y=mix(top,base,rng());
   g.strokeStyle='rgba('+(rng()<.55?'70,80,90':'170,180,186')+','+(.08+rng()*.16).toFixed(2)+')';g.lineWidth=1+rng()*1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-90,90),y+rr(-1.5,1.5));g.stroke();
   if(rng()<.08){g.strokeStyle='rgba(60,70,80,'+(.12+rng()*.15).toFixed(2)+')';g.lineWidth=rr(1.5,3);g.beginPath();g.moveTo(x,top+2);g.lineTo(x+rr(-3,3),mix(top,base,rr(.3,.8)));g.stroke();}}
  // the lit crest (the sun is in the WNW: the outer wall's crest catches it, the inner wall's face does)
  for(let x=0;x<=w;x+=2){const e=elev(x/w);if(e<.2)continue;const top=base-e*DEG;
   g.fillStyle='rgba(230,228,214,'+(wi?.30:.18).toFixed(2)+')';g.fillRect(x,top,2,2+e*.6);
   g.fillStyle='rgba(40,48,58,'+(.10*Math.min(1,e/3)).toFixed(2)+')';g.fillRect(x,top+3+e*.8,2,3+e);}
  // the air between: a heavy haze toward the foot
  const vv=g.createLinearGradient(0,HZ-W.e0*DEG,0,base);vv.addColorStop(0,'rgba(200,210,210,.04)');vv.addColorStop(1,'rgba(200,210,208,.45)');
  g.fillStyle=vv;g.fillRect(0,HZ-W.e0*DEG*1.3,w,base-HZ+W.e0*DEG*1.3);g.restore();});}
// the sea arc: from the lowlands the inland sea fills the horizon round the NW; no canopy line there
function landW(u){const az=((270-u*360)%360+360)%360,d=Math.abs(((az-318+540)%360)-180);return smooth(52,78,d);}
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
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
 // --- THE WALLS. At 5-8 degrees they stand well under the gas giant's lower
 // limb (25 - 15 = 10 degrees), so no overlay dome is needed in front of it.
 paintWalls(g,w,h,HZ,DEG);
 // --- horizon haze and the far canopy --------------------------------------
 const hz=g.createLinearGradient(0,HZ-80,0,HZ+40);
 hz.addColorStop(0,'rgba(200,210,204,0)');hz.addColorStop(.6,'rgba(200,210,204,.30)');
 hz.addColorStop(1,'rgba(200,210,204,.62)');
 g.fillStyle=hz;g.fillRect(0,HZ-80,w,120);
 const canopy=(col,h0,h1,R,off,bump,em)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+20);
  for(let x=0;x<=w;x+=2){const an=(x%w)/w*TAU,cx2=Math.cos(an)*R,sz2=Math.sin(an)*R;
   const n=fbm(off+cx2,off+sz2,7,3),n2=fbm(off*3+cx2*6,off*3+sz2*6,11,2);
   let hh=(h0+(h1-h0)*n+bump*(n2-.5))*landW(x/w);
   if(em){const e=fbm(off*7+cx2*2.2,off*7+sz2*2.2,13,2);
    hh+=em*Math.max(0,(e-.74)/.26);}                 // emergents over the line
   g.lineTo(x,HZ-hh*DEG);}
  g.lineTo(w,HZ+20);g.closePath();g.fill();};
 canopy('rgba(128,146,132,.55)',.5,1.3,9,17.3,.3,.5);
 canopy('rgba(96,116,100,.7)',.3,.8,14,41.7,.3,.3);
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
