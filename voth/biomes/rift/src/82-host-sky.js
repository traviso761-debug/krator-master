// ================================================================= HOST — Krator sky (from the Hexahedron)
// Baked equirectangular dome (haze column, sun, cumulus, the Rift's two walls,
// the far lakes down the valley) and the gas giant as real geometry.
// Host-only: a biome never touches the sky.

// ---------------------------------------------------------------- the Rift painter
// We are on the floor of the Rift, a long trench running east-west. Its walls
// stand close on both sides: the north wall over the savannah (12 deg high),
// the south wall beyond the lake and a stretch of far jungle (9 deg). Looking
// east or west down the valley the walls recede to a low line and the
// horizon opens on the next salt lakes, each with its own tinge: pink to the
// west, blue-green to the east. u = ((270-az)/360) mod 1, so east (az 90) is
// u=.5; north u=.75, south u=.25, west u=0/1.
function paintRift(g,w,h,HZ,DEG,full){const base=HZ+6;
 const azOf=u=>((270-u*360)%360+360)%360;
 const lobe=(u,az0,p)=>Math.pow(Math.max(0,Math.cos((azOf(u)-az0)*Math.PI/180)),p);
 const northOf=u=>lobe(u,0,1.5),southOf=u=>lobe(u,180,1.5),eastOf=u=>lobe(u,90,2.2),westOf=u=>lobe(u,270,2.2);
 const near=u=>Math.max(northOf(u),southOf(u));
 const rimH=u=>{const n=northOf(u),s=southOf(u),k=n*12.5+s*9.5+1.3;
  const f=fbm(u*19+3,1,61,3)-.5,f2=fbm(u*131,2,73,2)-.5,notch=Math.pow(Math.max(0,fbm(u*61,5,91,2)-.62)/.38,1.5);
  return k*DEG+f*2.4*DEG*(n+s)+f2*.5*DEG-notch*2.2*DEG*(n+s);};
 const wallPath=()=>{g.beginPath();g.moveTo(0,base+40);for(let x=0;x<=w;x+=2)g.lineTo(x,base-rimH(x/w));g.lineTo(w,base+40);g.closePath();};
 if(full){
  // the far rim: a paler second wall line seen through haze where the valley bends
  g.fillStyle='rgba(150,164,170,.45)';g.beginPath();g.moveTo(0,base+40);for(let x=0;x<=w;x+=2){const u=x/w;g.lineTo(x,base-(1.6+near(u)*3.5)*DEG-(fbm(u*17,7,62,2)-.5)*1.5*DEG);}g.lineTo(w,base+40);g.closePath();g.fill();}
 // the walls: rock, darker up the face, a lit crest, warm strata (the Rift cut through the same beds the ridge shows)
 const grd=g.createLinearGradient(0,HZ-16*DEG,0,base);
 grd.addColorStop(0,'rgba(96,98,92,1)');grd.addColorStop(.5,'rgba(84,86,82,1)');grd.addColorStop(1,'rgba(118,120,110,1)');
 g.fillStyle=grd;wallPath();g.fill();
 g.save();wallPath();g.clip();
 for(let i=0;i<1800;i++){const u=rng(),e=near(u);if(rng()>e*e)continue;
  const x=u*w,top=base-rimH(u),t=rng(),y=mix(top,base,t);
  g.strokeStyle='rgba('+(rng()<.55?'48,50,46':'150,146,132')+','+(.10+rng()*.24).toFixed(2)+')';g.lineWidth=1+rng()*1.6;
  g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-110,110),y+rr(-2,2));g.stroke();
  if(rng()<.035){g.strokeStyle='rgba(36,40,38,'+(.12+rng()*.16).toFixed(2)+')';g.lineWidth=rr(1.5,3.5);g.beginPath();g.moveTo(x,top+3);g.lineTo(x+rr(-4,4),mix(top,base,rr(.3,.7)));g.stroke();}}
 for(let x=0;x<=w;x+=2){const u=x/w,e=near(u),top=base-rimH(u);
  g.fillStyle='rgba(30,34,34,'+(.28*e).toFixed(2)+')';g.fillRect(x,top+4+e*6,2,6+e*10);
  g.fillStyle='rgba(228,222,204,'+(.36*e).toFixed(2)+')';g.fillRect(x,top,2,3+e*7);}
 // the talus apron at the foot of each wall
 g.beginPath();g.moveTo(0,base+40);for(let x=0;x<=w;x+=2){const u=x/w,e=near(u);g.lineTo(x,base-(e*2.6*DEG)*(0.7+0.3*fbm(u*53,2,97,2))-(fbm(u*211,3,98,2)-.5)*1.0*DEG*e);}g.lineTo(w,base+40);g.closePath();
 g.fillStyle='rgba(130,126,112,.85)';g.fill();
 for(let i=0;i<500;i++){const u=rng(),e=near(u);if(rng()>e)continue;const x=u*w,y=base-rng()*e*2.5*DEG;g.fillStyle='rgba('+(rng()<.5?'92,90,80':'164,160,146')+',.5)';g.beginPath();g.ellipse(x,y,rr(2,7),rr(1,3),0,0,TAU);g.fill();}
 const vv=g.createLinearGradient(0,HZ-12*DEG,0,base);
 vv.addColorStop(0,'rgba(198,206,200,.0)');vv.addColorStop(1,'rgba(198,206,200,.42)');
 g.fillStyle=vv;g.fillRect(0,HZ-12*DEG,w,base-HZ+12*DEG);
 g.restore();
 // below the horizon the dome shows wherever the map ends (from the crest the
 // ground's edge lies 7 degrees down): on the overlay the wall fades out under
 // the horizon instead of ending in a hard band, and the main dome carries its
 // haze all the way down
 if(!full){g.save();g.globalCompositeOperation='destination-out';const fo=g.createLinearGradient(0,HZ+2,0,base+40);fo.addColorStop(0,'rgba(0,0,0,0)');fo.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=fo;g.fillRect(0,HZ+2,w,base+40-HZ);g.restore();return;}
 // the ground beyond the map's edge, by azimuth: the savannah's dry grass to the
 // north, the lake and the far shore's jungle to the south, the lakes down the
 // valley east and west; all of it half lost in the haze, as the map's edge is
 for(let x=0;x<w;x+=4){const u=(x+2)/w,n=northOf(u),so=southOf(u),ew=1-Math.max(n,so);
  const r=Math.round(mix(mix(178,150,so),160,ew)),gg=Math.round(mix(mix(168,160,so),166,ew)),b=Math.round(mix(mix(110,96,so),140,ew));
  g.fillStyle='rgb('+Math.round(mix(r,196,.5))+','+Math.round(mix(gg,208,.5))+','+Math.round(mix(b,190,.5))+')';g.fillRect(x,HZ+4,4,420);}
 const under=g.createLinearGradient(0,HZ+2,0,HZ+60);under.addColorStop(0,'rgba(196,208,190,.95)');under.addColorStop(1,'rgba(196,208,190,0)');
 g.fillStyle=under;g.fillRect(0,HZ+2,w,60);
 // the far lakes down the valley, east and west: long bright strips under the haze, each in its own tinge, a pale salt rim
 [[.5,'rgba(112,186,176,','rgba(224,228,206,'],[0,'rgba(222,150,168,','rgba(232,222,206,'],[1,'rgba(222,150,168,','rgba(232,222,206,']].forEach(L=>{const cx=L[0]*w;
  const rim=g.createLinearGradient(0,HZ-.6*DEG,0,HZ+.9*DEG);rim.addColorStop(0,L[2]+'0)');rim.addColorStop(.4,L[2]+'.9)');rim.addColorStop(1,L[2]+'0)');
  g.fillStyle=rim;g.beginPath();g.ellipse(cx,HZ+.15*DEG,w*.075,.75*DEG,0,0,TAU);g.fill();
  const wat=g.createLinearGradient(0,HZ-.3*DEG,0,HZ+.7*DEG);wat.addColorStop(0,L[1]+'.0)');wat.addColorStop(.35,L[1]+'.95)');wat.addColorStop(1,L[1]+'0)');
  g.fillStyle=wat;g.beginPath();g.ellipse(cx,HZ+.2*DEG,w*.062,.5*DEG,0,0,TAU);g.fill();});
 // the far canopies: the jungle on the far shore to the south (tall, blue-green shot with purple), the savannah's low line to the north
 const canopy=(col,h0,h1,R,off,bump,em,wt)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+20);
  for(let x=0;x<=w;x+=2){const u=(x%w)/w,an=u*TAU,cx2=Math.cos(an)*R,sz2=Math.sin(an)*R;
   const n=fbm(off+cx2,off+sz2,7,3),n2=fbm(off*3+cx2*6,off*3+sz2*6,11,2);
   let hh=h0+(h1-h0)*n+bump*(n2-.5);
   if(em){const e=fbm(off*7+cx2*2.2,off*7+sz2*2.2,13,2);hh+=em*Math.max(0,(e-.74)/.26);}
   g.lineTo(x,HZ-hh*DEG*wt(u));}
  g.lineTo(w,HZ+20);g.closePath();g.fill();};
 canopy('rgba(104,138,132,.55)',.6,1.5,9,17.3,.3,.7,u=>southOf(u));
 canopy('rgba(78,108,104,.75)',.4,1.0,14,41.7,.3,.4,u=>southOf(u));
 canopy('rgba(150,150,110,.55)',.25,.5,11,23.1,.15,0,u=>northOf(u));
 canopy('rgba(122,126,90,.6)',.15,.35,17,53.9,.1,0,u=>northOf(u));
 const gm=g.createLinearGradient(0,HZ-DEG*1.4,0,HZ+24);
 gm.addColorStop(0,'rgba(196,208,190,0)');gm.addColorStop(.3,'rgba(196,208,190,.32)');
 gm.addColorStop(1,'rgba(196,208,190,.95)');
 g.fillStyle=gm;g.fillRect(0,HZ-DEG*1.4,w,DEG*1.4+24);}
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
 // --- the RIFT WALLS and the far valley are painted by paintRift() below, onto
 // this dome AND onto a transparent overlay dome drawn after the gas giant, so
 // the north wall stands in front of the giant as it must.
 const hz=g.createLinearGradient(0,HZ-80,0,HZ+40);
 hz.addColorStop(0,'rgba(200,210,200,0)');hz.addColorStop(.6,'rgba(200,210,200,.30)');
 hz.addColorStop(1,'rgba(200,210,200,.62)');
 g.fillStyle=hz;g.fillRect(0,HZ-80,w,120);
 paintRift(g,w,h,HZ,DEG,true);
});
skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,72,44),
 new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));
sky.userData.probeSkip=true;sky.renderOrder=-10;scene.add(sky);
// the walls again, on a transparent dome drawn AFTER the giant (renderOrder -8):
// the north wall must stand in front of a planet that is, after all, behind the horizon
const wallTex=BIO.canvasTex(4096,2048,(g,w,h)=>{const HZ=h*.5,DEG=h/180;g.clearRect(0,0,w,h);paintRift(g,w,h,HZ,DEG,false);});
wallTex.wrapS=THREE.RepeatWrapping;wallTex.wrapT=THREE.ClampToEdgeWrapping;
const wallSky=new THREE.Mesh(new THREE.SphereGeometry(8800,72,44),new THREE.MeshBasicMaterial({map:wallTex,side:THREE.BackSide,fog:false,depthWrite:false,transparent:true}));
wallSky.userData.probeSkip=true;wallSky.renderOrder=-8;scene.add(wallSky);
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
TICKS.push(function(dt){GU.uSpin.value+=dt*0.006;});
