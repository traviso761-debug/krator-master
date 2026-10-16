// ================================================================= HOST — Krator sky (from the Hexahedron)
// Baked equirectangular dome (haze column, sun, cumulus, the ranges round the
// Vale, the cataract's spray) and the gas giant as real geometry.
// Host-only: a biome never touches the sky.

// ---------------------------------------------------------------- the Vale painter
// We stand in an enclosed mountain valley. South: the high range the chasm is
// cut into (the near slopes are geometry; the snow peaks behind them are paint).
// North: across the lake, the far shore's mountains, bluish with distance. East
// and west the lake runs on between the valley walls. To the east-south-east
// the walls dip to a low saddle where the lake spills over its cataract, and
// the spray stands over the notch. u = ((270-az)/360) mod 1: east (az 90) is
// u=.5, north u=.75, south u=.25, west u=0/1.
const CATARACT_AZ=112;
function paintVale(g,w,h,HZ,DEG,full){
 const azOf=u=>((270-u*360)%360+360)%360;
 const lobe=(u,az0,p)=>Math.pow(Math.max(0,Math.cos((azOf(u)-az0)*Math.PI/180)),p);
 const notch=u=>{let d=Math.abs(((azOf(u)-CATARACT_AZ)%360+540)%360-180);return smooth(16,4,d);};
 // a range line: base height by azimuth, fbm ridges, the notch
 const range=(u,base,amp,f,seed)=>{const r=1-Math.abs(fbm(u*f+seed,seed*.3,61,3)*2-1);return (base(u)+amp*(r*r-.3)+.6*(fbm(u*f*6,seed,73,2)-.5))*(1-.8*notch(u));};
 const farB=u=>4.2+4.8*lobe(u,180,1.2)+2.6*lobe(u,0,1.6)+1.4;
 const nearB=u=>2.2+2.2*lobe(u,0,1.4)+1.2*lobe(u,90,2)+1.2*lobe(u,270,2);
 function layer(base,amp,f,seed,top,bot,snowAt,alpha){
  const H=[];for(let x=0;x<=w;x+=2)H.push(range(x/w,base,amp,f,seed));
  const grd=g.createLinearGradient(0,HZ-16*DEG,0,HZ+4);grd.addColorStop(0,top);grd.addColorStop(1,bot);
  g.fillStyle=grd;g.beginPath();g.moveTo(0,HZ+30);for(let x=0,k=0;x<=w;x+=2,k++)g.lineTo(x,HZ-H[k]*DEG);g.lineTo(w,HZ+30);g.closePath();g.fill();
  // snow on the tops: where the line stands above snowAt degrees, a cap down to a ragged edge
  if(snowAt!=null){for(let x=0,k=0;x<=w;x+=2,k++){const e=H[k]-snowAt;if(e<=0)continue;const y0=HZ-H[k]*DEG,dd=(e*.8+.3*fbm(x*.07,seed,77,2))*DEG;
   g.fillStyle='rgba(236,240,244,'+(alpha*clamp(e/1.2,0,1)).toFixed(2)+')';g.fillRect(x,y0,2,dd);}}
  // gullies and strata
  for(let i=0;i<900;i++){const x=rng()*w,k=Math.round(x/2),top2=HZ-H[k]*DEG;if(H[k]<.6)continue;const y=mix(top2,HZ,rng());
   g.strokeStyle='rgba('+(rng()<.5?'60,64,70':'170,166,160')+','+(.06+rng()*.12).toFixed(2)+')';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-3,3),y+rr(4,20));g.stroke();}
  return H;}
 // the far ranges, pale with distance, snow above 8 degrees
 layer(farB,2.4,11,3.1,'rgba(150,164,184,1)','rgba(178,190,196,1)',7.6,.95);
 // the near walls, darker and greener, round the lake
 const NH=layer(nearB,1.6,17,7.7,'rgba(92,108,104,1)','rgba(132,146,132,1)',null,0);
 // haze over both
 const vv=g.createLinearGradient(0,HZ-12*DEG,0,HZ+2);vv.addColorStop(0,'rgba(200,212,210,0)');vv.addColorStop(1,'rgba(200,212,210,.5)');g.fillStyle=vv;g.fillRect(0,HZ-12*DEG,w,12*DEG+2);
 // the cataract: the lake pouring through the saddle, and its spray standing over it
 const cu=((270-CATARACT_AZ)/360%1+1)%1,cx=cu*w;
 for(let i=0;i<220;i++){const a=rng(),r=rr(4,40)*(1+a*2),yy=HZ-(.6+a*6.5)*DEG,xx=cx+rr(-1,1)*(18+a*120);
  g.fillStyle='rgba(244,248,248,'+(.05+.08*(1-a)).toFixed(3)+')';g.beginPath();g.ellipse(xx,yy,r*1.6,r,0,0,TAU);g.fill();}
 {const fall=g.createLinearGradient(0,HZ-.9*DEG,0,HZ+.2*DEG);fall.addColorStop(0,'rgba(250,252,252,.95)');fall.addColorStop(1,'rgba(220,232,232,.4)');g.fillStyle=fall;g.fillRect(cx-26,HZ-.9*DEG,52,1.1*DEG);}
 if(!full)return;
 // below the horizon: the lake to the north half round, the far land to the south
 for(let x=0;x<w;x+=4){const u=(x+2)/w,nk=smooth(-.2,.3,Math.cos(azOf(u)*Math.PI/180));
  const r=Math.round(mix(150,120,nk)),gg=Math.round(mix(160,176,nk)),b=Math.round(mix(132,170,nk));
  g.fillStyle='rgb('+r+','+gg+','+b+')';g.fillRect(x,HZ+3,4,420);}
 const under=g.createLinearGradient(0,HZ+2,0,HZ+60);under.addColorStop(0,'rgba(196,210,206,.95)');under.addColorStop(1,'rgba(196,210,206,0)');
 g.fillStyle=under;g.fillRect(0,HZ+2,w,60);}
const skyTex=BIO.canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180;
 // --- the column: 1.9 atm, so a milky zenith and a thick haze band ---------
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#5d7ba2');grd.addColorStop(0.14,'#6f8aa9');
 grd.addColorStop(0.30,'#8fa4b7');grd.addColorStop(0.42,'#aebdc2');
 grd.addColorStop(0.478,'#ccd6c6');grd.addColorStop(0.497,'#dde3cf');
 grd.addColorStop(0.503,'#c9d3bc');grd.addColorStop(0.60,'#93a488');
 grd.addColorStop(0.78,'#6d8066');grd.addColorStop(1.00,'#53664d');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){
  g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // --- THE SUN, at the azimuth the directional light actually uses ----------
 // sun.position is (-1200,950,-600): azimuth 296.6, altitude 35.3. u follows
 // the dome's own mapping, u = ((270-az)/360) mod 1.
 const SUNU=((270-296.57)/360%1+1)%1, sx=w*SUNU, sy=HZ-35.3*DEG;
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
 // --- the ranges round the Vale are painted by paintVale() below. The giant
 // (altitude 25, 15 degrees in radius) clears them, so one dome is enough.
 const hz=g.createLinearGradient(0,HZ-80,0,HZ+40);
 hz.addColorStop(0,'rgba(200,210,200,0)');hz.addColorStop(.6,'rgba(200,210,200,.30)');
 hz.addColorStop(1,'rgba(200,210,200,.62)');
 g.fillStyle=hz;g.fillRect(0,HZ-80,w,120);
 paintVale(g,w,h,HZ,DEG,true);
});
skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,72,44),
 new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));
sky.userData.probeSkip=true;sky.renderOrder=-10;scene.add(sky);
// THE GAS GIANT Krator orbits, ported from Girder's sky as real geometry.
// Canon: 30 degrees across at azimuth 66, altitude 25 -- sixty full moons wide.
// The band coordinates are computed in the FRAGMENT shader from the world-space
// normal against a world-space spin axis that lies in the PLANE OF THE SKY,
// tilted 23 degrees from the sky's own up: a tilted planet AND rings seen as a hairline.
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
 uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0xb7c4ac)},
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
  ' float ndv=clamp(dot(N,V),0.0,1.0);',
  ' float limb=pow(max(ndv,0.0015),0.35);',
  ' float ndl=dot(N,uSunDir);',
  ' float day=smoothstep(-0.17,0.17,ndl);',
  ' vec3 outc=col*limb*(0.92*day)+col*limb*uNightC*0.11;',
  ' float fres=pow(max(1.0-ndv,0.0),3.2);',
  ' outc+=uRimCol*fres*0.16*mix(smoothstep(-0.35,0.45,ndl),1.0,0.15);',
  ' float up=max(vSky.y,0.0);',
  ' outc=mix(outc,uHazeC,clamp(0.30+uHazeK*exp(-up/0.16),0.0,0.86));',
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
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS.clone().multiplyScalar(Math.cos(.105)).addScaledVector(giantDir,-Math.sin(.105)).normalize());   // opened 6 degrees toward us: a plane exactly edge-on covers no pixel
giantRing.renderOrder=-9;giantRing.userData.probeSkip=true;scene.add(giantRing);
TICKS.push(function(dt){GU.uSpin.value+=dt*0.006;});
