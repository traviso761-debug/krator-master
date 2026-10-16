// ================================================================= OPEN WORLD — the standard Krator sky
// [G native] The eastern high desert kit's sky (biomes/sedesert/src/82-host-sky.js: the dry deep-blue column, the ochre
// dust at the horizon, the sun where the light is, cirrus and fair-weather cumulus, two moons, the gas giant as real
// geometry with its edge-on rings) with its painted horizon taken away: the Inner Wall and the far mesas were a
// stand-in for land the showcase did not have, and this world draws its own land to the horizon (VISUAL-BAR.md, D).
// The dome and the giant ride with the camera, so a sky 1,400 km wide costs one dome.
var SKY=(function(){const {TAU,rng,rr}=BIO.fn,scene=HOST.scene,camera=HOST.camera;
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180;
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#2f5aa0');grd.addColorStop(0.14,'#4570b0');
 grd.addColorStop(0.30,'#6f92c2');grd.addColorStop(0.42,'#9fb4cc');
 grd.addColorStop(0.478,'#cdd2c8');grd.addColorStop(0.497,'#e0d0b8');
 grd.addColorStop(0.503,'#d2bfa4');grd.addColorStop(1.00,'#d2bfa4');   // below the horizon: the haze, as the fog is
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // the sun at the azimuth and altitude the light uses (HOST.SUN_DIR); u = ((270-az)/360) mod 1 as the kit's dome maps it
 const S=HOST.SUN_DIR,az=(Math.atan2(S.x,-S.z)*180/Math.PI+360)%360,alt=Math.asin(S.y)*180/Math.PI;
 const SUNU=((270-az)/360%1+1)%1,sx=w*SUNU,sy=HZ-alt*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,520);
  gl.addColorStop(0,'rgba(255,250,236,.95)');gl.addColorStop(.05,'rgba(255,244,214,.5)');
  gl.addColorStop(.2,'rgba(255,236,196,.16)');gl.addColorStop(1,'rgba(255,230,180,0)');
  g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-520+k*w,sy-520,1040,1040);
  wrapE(sx,sy,15,15,'rgba(255,253,244,1)');}
 for(let i=0;i<40;i++){const y=HZ-rr(28,70)*DEG,x=rng()*w,L=rr(200,700),a=rr(-.06,.06);
  g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(245,246,250,'+(.05+.1*rng()).toFixed(3)+')';
  for(let k=0;k<5;k++){g.beginPath();g.ellipse(rr(-L*.4,L*.4),rr(-6,6),L*rr(.3,.6),rr(2,6),0,0,TAU);g.fill();}g.restore();}
 for(let ci=0;ci<60;ci++){const t=Math.pow(rng(),1.5),cy=HZ-(3+t*26)*DEG,cx=rng()*w;
  const sc=.35+.9*t+rr(0,.3),cw=rr(60,140)*sc,ch2=cw*rr(.16,.3),ca=(.2+.3*rng())*(1-.3*t);
  wrapE(cx,cy+ch2*.12,cw*.92,ch2*.34,'rgba(160,150,150,'+(ca*.5).toFixed(3)+')');
  for(let p2=0,nP=6+Math.floor(rng()*7);p2<nP;p2++){const px=cx+rr(-1,1)*cw*.78,k2=1-Math.abs(px-cx)/cw,pr=ch2*(.45+.75*k2)*rr(.75,1.2);
   wrapE(px,cy-pr*.55,pr*1.5,pr,'rgba(252,250,246,'+(ca*rr(.6,1)).toFixed(3)+')');}}
 for(let i=0;i<40;i++)wrapE(rng()*w,HZ-rr(2,HZ*.3),rr(300,1200),rr(6,20),'rgba(236,220,196,'+(.03+.06*rng()).toFixed(3)+')');
 [[0.38,26,54,'rgba(232,228,220,'],[0.615,17,38,'rgba(220,206,198,']].forEach(M=>{const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.6)');wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.3)');});
 // the dust at the horizon, the fog's colour, so the land's far edge melts into it
 const gm=g.createLinearGradient(0,HZ-DEG*4,0,HZ+4);
 gm.addColorStop(0,'rgba(210,191,164,0)');gm.addColorStop(.6,'rgba(210,191,164,.55)');gm.addColorStop(1,'rgba(210,191,164,1)');
 g.fillStyle=gm;g.fillRect(0,HZ-DEG*4,w,DEG*4+4);});
skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const DOME=1.8e6;
const sky=new THREE.Mesh(new THREE.SphereGeometry(DOME,72,44),new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));
sky.userData.probeSkip=true;sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);
// THE GAS GIANT: 30 degrees across at azimuth 66, altitude 25 (the kit's canon), its bands from the world normal
const GIANT_DIST=1.5e6,GIANT_R=GIANT_DIST*Math.tan(15*Math.PI/180);
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180)).normalize();
const _gE1=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),giantDir).normalize();
const _gUp=new THREE.Vector3().crossVectors(giantDir,_gE1).normalize();
const GIANT_AXIS=_gUp.clone().multiplyScalar(Math.cos(23*Math.PI/180)).addScaledVector(_gE1,Math.sin(23*Math.PI/180)).normalize();
const GIANT_B1=new THREE.Vector3().crossVectors(GIANT_AXIS,giantDir).normalize();
const GIANT_B2=new THREE.Vector3().crossVectors(GIANT_AXIS,GIANT_B1).normalize();
const GU={uSunDir:{value:HOST.SUN_DIR.clone()},uAxis:{value:GIANT_AXIS},uE1:{value:GIANT_B1},uE2:{value:GIANT_B2},
 uZone:{value:new THREE.Color(0x3c7e91)},uBelt:{value:new THREE.Color(0xd6c9a8)},uStormC:{value:new THREE.Color(0xb98a63)},
 uRimCol:{value:new THREE.Color(0x9fd4ea)},uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0xc4b4a0)},
 uSpin:{value:0},uRingLat:{value:.08},uHazeK:{value:.30}};
const giantMat=new THREE.ShaderMaterial({fog:false,depthWrite:false,uniforms:GU,
 vertexShader:['#include <common>','#include <logdepthbuf_pars_vertex>','varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.0);',' vN=normalize(mat3(modelMatrix)*normal);',
  ' vV=normalize(cameraPosition-wp.xyz);',' vSky=normalize(wp.xyz-cameraPosition);',' gl_Position=projectionMatrix*viewMatrix*wp;','#include <logdepthbuf_vertex>','}'].join('\n'),
 fragmentShader:['#include <common>','#include <logdepthbuf_pars_fragment>','uniform vec3 uSunDir,uAxis,uE1,uE2,uZone,uBelt,uStormC,uRimCol,uNightC,uHazeC;','uniform float uSpin,uRingLat,uHazeK;',
  'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
  'float oval(float lat,float lon,vec4 s){float dl=lat-s.x;float dg=mod(lon-s.y+3.14159265,6.28318531)-3.14159265;return (dg*dg)/(s.z*s.z)+(dl*dl)/(s.w*s.w);}',
  'void main(){','#include <logdepthbuf_fragment>','vec3 N=normalize(vN),V=normalize(vV);',
  ' float sLat=clamp(dot(N,uAxis),-1.0,1.0), lat=asin(sLat);',' float lon=atan(dot(N,uE2),dot(N,uE1))+uSpin;',
  ' float wav=0.42*sin(lon*3.0+lat*6.0)+0.24*sin(lon*7.0-2.1)+0.13*sin(lon*13.0+lat*3.0);',' float b=sin(lat*10.0+wav);',
  ' vec3 col=mix(uZone,uBelt,smoothstep(-0.45,0.45,b));',' col*=0.93+0.12*sin(lat*37.0+1.6*sin(lon*2.0+0.7));',
  ' col=mix(col,uZone*0.70,smoothstep(0.70,1.0,abs(sLat)));',
  ' col=mix(uStormC,col,smoothstep(0.45,1.0,oval(lat,lon,vec4(-0.36,1.10,0.40,0.13))));',
  ' col=mix(uStormC*1.12,col,smoothstep(0.45,1.0,oval(lat,lon,vec4(0.21,4.05,0.26,0.085))));',
  ' col*=1.0-0.34*(1.0-smoothstep(0.0,0.075,abs(lat-uRingLat)));',
  ' float ndv=clamp(dot(N,V),0.0,1.0);',' float limb=pow(max(ndv,0.0015),0.35);',' float ndl=dot(N,uSunDir);',' float day=smoothstep(-0.17,0.17,ndl);',
  ' vec3 outc=col*limb*(0.92*day)+col*limb*uNightC*0.11;',' float fres=pow(max(1.0-ndv,0.0),3.2);',
  ' outc+=uRimCol*fres*0.16*mix(smoothstep(-0.35,0.45,ndl),1.0,0.15);',
  ' float up=max(vSky.y,0.0);',' outc=mix(outc,uHazeC,clamp(0.30+uHazeK*exp(-up/0.16),0.0,0.86));',' gl_FragColor=vec4(outc,1.0);}'].join('\n')});
const giant=new THREE.Mesh(new THREE.SphereGeometry(GIANT_R,96,64),giantMat);giant.renderOrder=-9;giant.userData.probeSkip=true;giant.frustumCulled=false;scene.add(giant);
const ringMat=new THREE.ShaderMaterial({fog:false,transparent:true,depthWrite:false,side:THREE.DoubleSide,
 uniforms:{uIn:{value:1.30},uOut:{value:2.12},uCol:{value:new THREE.Color(0xbcb09a)},uHazeC:GU.uHazeC,uHazeK:GU.uHazeK},
 vertexShader:['#include <common>','#include <logdepthbuf_pars_vertex>','varying vec2 vUvR; varying vec3 vSky;',
  'void main(){vUvR=position.xy/'+GIANT_R.toFixed(1)+';vec4 wp=modelMatrix*vec4(position,1.0);',' vSky=normalize(wp.xyz-cameraPosition);',' gl_Position=projectionMatrix*viewMatrix*wp;','#include <logdepthbuf_vertex>','}'].join('\n'),
 fragmentShader:['#include <common>','#include <logdepthbuf_pars_fragment>','uniform float uIn,uOut,uHazeK;uniform vec3 uCol,uHazeC;','varying vec2 vUvR; varying vec3 vSky;',
  'void main(){','#include <logdepthbuf_fragment>','float r=length(vUvR);',' float t=(r-uIn)/(uOut-uIn);',' if(t<0.0||t>1.0)discard;',
  ' float a=0.62*(0.45+0.55*sin(t*34.0))*(1.0-smoothstep(0.86,1.0,t));',' a*=smoothstep(0.0,0.06,t);',
  ' a*=1.0-0.55*smoothstep(0.40,0.46,t)*(1.0-smoothstep(0.46,0.52,t));',' vec3 c=uCol*(0.8+0.3*sin(t*21.0));',
  ' float up=max(vSky.y,0.0);',' c=mix(c,uHazeC,clamp(0.2+uHazeK*exp(-up/0.16),0.0,0.86));',' gl_FragColor=vec4(c,a);}'].join('\n')});
const giantRing=new THREE.Mesh(new THREE.RingGeometry(GIANT_R*1.30,GIANT_R*2.12,256,1),ringMat);
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS.clone().multiplyScalar(Math.cos(.105)).addScaledVector(giantDir,-Math.sin(.105)).normalize());   // opened 6 degrees toward us: a plane exactly edge-on covers no pixelgiantRing.renderOrder=-9;giantRing.userData.probeSkip=true;giantRing.frustumCulled=false;scene.add(giantRing);
HOST.TICKS.push(dt=>{GU.uSpin.value+=dt*0.006;});
// every frame, before drawing: the dome, the giant and its rings stay centred on the camera
function follow(){const P=camera.position;sky.position.copy(P);giant.position.copy(P).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
return{follow,sky,giant};})();
