// ---------------------------------------------------------------- scene (the Ring Sea roadstead)
// The kit sheet: every registered vessel riding at anchor on open water, rowing in place, in a
// grid of RS_COLS columns, bows east (+x), so a camera on the south side sees every starboard
// broadside. The volcano stands on the NW horizon across the sea (as seen from Mav's Refuge on the
// SE lee shore); the gas giant hangs in the NE.
const TITLE='Ring Sea — Watercraft Kit';
const RS_COLS=4,RS_PX=92,RS_PZ=78;
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xbcd0d6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.0006);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,9000);
scene.add(new THREE.HemisphereLight(0xe6f0ff,0x2e5060,.75));
const sun=new THREE.DirectionalLight(0xfff0d8,1.65);sun.position.set(-500,650,520);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0ccff,.35);fill.position.set(500,300,-600);scene.add(fill);
const FRAME_HOOKS=[];const REG=[];const RS_PLACED=[];
let LABELS=null;
const giantDir=new THREE.Vector3(Math.sin(50*Math.PI/180)*Math.cos(24*Math.PI/180),Math.sin(24*Math.PI/180),-Math.cos(50*Math.PI/180)*Math.cos(24*Math.PI/180));   // NE, 24 deg up
const sunDir=new THREE.Vector3(-500,650,520).normalize();

// ---- the standard Krator sky: gradient dome, the gas giant, the sun
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{uSun:{value:sunDir}},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 uSun;varying vec3 vP;void main(){vec3 d=normalize(vP);float h=clamp(d.y,-.05,1.);vec3 hz=vec3(.80,.86,.88);vec3 zen=vec3(.22,.44,.72);vec3 c=mix(hz,zen,pow(max(h,0.),.5));'+
  'float s=clamp(dot(d,uSun),0.,1.);c+=vec3(1.,.9,.7)*pow(s,64.)*.6+vec3(1.,.95,.85)*pow(s,900.)*4.;gl_FragColor=vec4(c,1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(6000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
const giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(1500,1500,1);giant.userData.probeSkip=true;scene.add(giant);

// ---- the sea: one plane, displaced in its vertex shader by the Gerstner swell (40-rs-core.js: the same
// function the hulls ride, 94-rs-anim.js), with the scrolled normal map for the ripples; the waterline at y=0.
// The grid is fine (6.5 m) over the roadstead and stretches toward the horizon. Out there the cells are too
// coarse to draw a wave, so each wave's DISPLACEMENT fades out beyond ~600 m (lod), but the surface normal and
// the whitecaps are computed per pixel from the same waves at the rest point (vRsP0), each wave faded only
// where it is finer than a pixel: the swell runs to the horizon in the shading at no geometry cost.
TEX.rsWater.repeat.set(260,260);
const RS_CZ=(Math.ceil(RS.order.length/RS_COLS)-1)*RS_PZ/2;
rsSwellSet([[.28,70,18,0,.32],[.16,43,-34,1.7,.26],[.09,27,71,4.1,.18],[.05,17,-8,2.6,.12]]);
const RS_SEALOD={cx:0,cz:RS_CZ,r:[[600,680],[590,650],[580,630],[570,620]]};
const RS_SEA=new THREE.MeshStandardMaterial({color:0x06222e,roughness:.24,metalness:.45,normalMap:TEX.rsWater,normalScale:new THREE.Vector2(.55,.55)});
RS_SEA.onBeforeCompile=sh=>{sh.uniforms.uRsTime=RS_U.uTime;const G=rsSwellGLSL(RS_SEALOD);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+G+'varying vec2 vRsP0;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 rsP0=(modelMatrix*vec4(position,1.)).xz;vec3 rsD=rsSwellD(rsP0);vRsP0=rsP0;transformed+=vec3(rsD.x,-rsD.z,rsD.y);');   // the plane is rotated flat: local z is world up, local y is world -z
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+G+'varying vec2 vRsP0;\n'+
   'float rsHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+
   'float rsNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(rsHash(i),rsHash(i+vec2(1.,0.)),f.x),mix(rsHash(i+vec2(0.,1.)),rsHash(i+vec2(1.,1.)),f.x),f.y);}')
  .replace('#include <color_fragment>','#include <color_fragment>\nfloat rsMpp=length(fwidth(vRsP0));vec4 rsNJ=rsSwellNJ(vRsP0,rsMpp);'+
   // whitecaps: where the crests crowd the water together (the Jacobian drops), broken up by drifting noise
   'float rsFoam=smoothstep(.56,.34,rsNJ.w)*smoothstep(.5,.85,rsNoise(vRsP0*.16+vec2(uRsTime*.05,-uRsTime*.03))*.55+rsNoise(vRsP0*.9-uRsTime*.2)*.45);'+
   'rsFoam*=mix(1.,.45,smoothstep(1.,6.,rsMpp));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.72,.80,.82),rsFoam);')
  .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.85,rsFoam);')
  .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor*=1.-rsFoam;')
  .replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4(rsNJ.xyz,0.)).xyz);');};
const RS_SEAGEO=(()=>{const SN=240,sg=new THREE.PlaneGeometry(2,2,SN,SN),p=sg.attributes.position,uv=sg.attributes.uv;
 const warp=s=>{const a=Math.abs(s);return Math.sign(s)*(a<=.8?a/.8*620:620+5380*((a-.8)/.2)**2);};
 for(let i=0;i<p.count;i++){const x=warp(p.getX(i)),y=warp(p.getY(i));p.setXY(i,x,y);uv.setXY(i,(x+6000)/12000,(y+6000)/12000);}
 sg.computeBoundingSphere();return sg;})();
const groundM=new THREE.Mesh(RS_SEAGEO,RS_SEA);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,0,RS_CZ);groundM.userData.probeSkip=true;groundM.userData.isGround=true;scene.add(groundM);
// ---- the far shore: the volcano NW across the sea, low islands, all unfogged and pre-hazed
{reseed(79001);const far=(col,x,z,r,h,seg)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,seg||24,1,true),new THREE.MeshBasicMaterial({color:col,fog:false}));m.position.set(x,h/2-2,z);m.userData.probeSkip=true;scene.add(m);return m;};
 const vx=-3000,vz=-3900;far(0x7d93a4,vx,vz,1100,620,32);far(0x8499a8,vx+520,vz+260,520,260,20);
 const top=new THREE.Mesh(new THREE.CylinderGeometry(90,120,40,20,1,true),new THREE.MeshBasicMaterial({color:0x6c808e,fog:false}));top.position.set(vx,600,vz);top.userData.probeSkip=true;scene.add(top);
 for(let i=0;i<16;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(rr(60,110)+i*6,12,8),new THREE.MeshBasicMaterial({color:0x98a2aa,fog:false,transparent:true,opacity:.32-i*.015,depthWrite:false}));
  p.position.set(vx+i*i*2.6+rr(-40,40),640+i*52+rr(-20,20),vz+i*22+rr(-30,30));p.scale.set(1.5+i*.05,.9,1.3);p.userData.probeSkip=true;scene.add(p);}
 for(let i=0;i<9;i++){const a=rr(-2.9,-.2),d=rr(3200,4200);far(i%2?0x93a4ac:0x8b9ca6,Math.cos(a)*d,RS_CZ+Math.sin(a)*d,rr(160,420),rr(40,140),14);}}

// ---- build and place every registered vessel
{const keys=RS.order.filter(k=>!window.RS_ONLY||window.RS_ONLY.includes(k));const rows=Math.ceil(keys.length/RS_COLS);
 keys.forEach((k,i)=>{const D=RS.defs[k];const c=i%RS_COLS,r=Math.floor(i/RS_COLS);
  const x=(c-(RS_COLS-1)/2)*RS_PX,z=(rows-1-r)*RS_PZ;TSTAT.cur=k;   // the first row registered rides nearest the southern camera
  const V=D.build();const G=V.group;G.name=k;G.position.set(x,0,z);G.rotation.y=0;scene.add(G);
  let tris=0;G.traverse(o=>{if(o.isMesh&&o.geometry){const t=triOf(o.geometry)*(o.isInstancedMesh?o.count:1);tris+=t;}});
  const t=tcur();if(t){t.tris+=tris;t.meshes+=G.children.length;t.inst+=V.oars||0;}TSTAT.cur=null;
  const bb=new THREE.Box3().setFromObject(G);
  REG.push({name:D.name,cls:'vessel',key:k,x,y:bb.min.y,z,r:Math.max(D.L,D.B)/2+1,h:bb.max.y-bb.min.y,tags:Object.assign({culture:D.culture},D.tags)});
  RS_PLACED.push({k,D,V,G,x,z,ph:h3(i,3,7)*TAU,bb,reg:REG[REG.length-1]});});
 window._registered=REG.length;window._instances=RS_PLACED.reduce((a,p)=>a+(p.V.oars||0),0)||1;window._vessels=RS_PLACED.length;}

// ---- preset views: an opening, an overview, then each vessel from its starboard bow and abeam
function rsViews(){const V={};const P=RS_PLACED;if(!P.length)return V;const zMax=Math.max(...P.map(p=>p.z));
 V['Opening']=[205,15,zMax+92,-5,8,zMax-35];
 V['Overview']=[40,125,zMax+150,0,0,zMax*.42];
 V['Toward the volcano']=[40,14,zMax+120,-600,60,-900];
 for(const p of P){const D=p.D,d=Math.max(D.L,D.H*1.1)*.95+10;
  V[D.name]=[p.x+D.L*.55,Math.max(5,D.H*.28),p.z+d,p.x,D.H*.28,p.z];
  V[D.name+' — abeam']=[p.x,2.2,p.z+d*1.05,p.x,Math.max(2,D.H*.32),p.z];}
 return V;}
const VIEWS=rsViews();
