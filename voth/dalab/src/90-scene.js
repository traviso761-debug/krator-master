// ---------------------------------------------------------------- scene
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8b090);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00055);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,6000);
scene.add(new THREE.HemisphereLight(0xffe8d0,0x4a3a2a,.7));
const sun=new THREE.DirectionalLight(0xfff0dc,1.6);sun.position.set(-600,700,400);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c8ff,.32);fill.position.set(500,300,-600);scene.add(fill);
// hooks the frame loop runs (city: sky/lighting update); the showcase adds none
const FRAME_HOOKS=[];
// sky dome (the Ancients kit's warm haze sky; the city target swaps in KratorSky and skips this block)
let sky,giant,groundM,LABELS;const SITE_GROUPS=[];
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180));

if(!window.CITY){
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vP;void main(){float h=clamp(normalize(vP).y,-.05,1.);vec3 hz=vec3(.84,.66,.48);vec3 zen=vec3(.30,.42,.66);vec3 c=mix(hz,zen,pow(h,.5));gl_FragColor=vec4(c,1.);}'});
sky=new THREE.Mesh(new THREE.SphereGeometry(5000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(1400,1400,1);giant.userData.probeSkip=true;scene.add(giant);

// ground: packed earth, tiled in world units
TEX.dirt.repeat.set(150,150);
groundM=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),MAT.dirt);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.05,GROUND_C);groundM.userData.probeSkip=true;scene.add(groundM);

// ---------------------------------------------------------------- build every site the target lists
// SITES = [{key, x, z, ry, o, label}] from the target's 89z-rows.js
for(const S of SITES){const k=S.key+'/'+((S.o&&S.o.v)||0);TSTAT.cur=k;const r0=REG.length;
 const G=VERN.place(scene,S.key,S.x,S.z,S.ry||0,S.o);if(G)SITE_GROUPS.push({S,G});
 for(let i=r0;i<REG.length;i++)REG[i].type=S.key;TSTAT.cur=null;}
window._registered=REG.length;
kbake(scene);

// site labels come from src/93-labels.js (the atlas over REG)
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
}   // end showcase-only block
