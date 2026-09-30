// ---------------------------------------------------------------- scene
// Adapted from voth/ancients/src/90-scene.js: same renderer, lights, sky and
// gas giant; the ground plane, ROWS and the ancients builder loop are gone.
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8b494);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
// The three lights and the sky are held in named consts because setNight()
// in 92-camera.js swings all four between day and night.
const hemi=new THREE.HemisphereLight(0xffe8d0,0x5a4a3a,.8);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.7);sun.position.set(-1200,900,900);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc0d0ff,.35);fill.position.set(800,400,-900);scene.add(fill);
// sky dome
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{u_n:{value:0}},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform float u_n;varying vec3 vP;void main(){float h=clamp(normalize(vP).y,-.05,1.);vec3 hz=mix(vec3(.86,.70,.56),vec3(.085,.075,.105),u_n);vec3 zen=mix(vec3(.36,.50,.70),vec3(.014,.018,.040),u_n);vec3 c=mix(hz,zen,pow(h,.55));gl_FragColor=vec4(c,1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(12000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
// the gas giant, low in the north-east (Krator canon: altitude 25°, azimuth 66°)
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
const giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(3000,3000,1);giant.userData.probeSkip=true;scene.add(giant);
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180));

// ---------------------------------------------------------------- THE PORT
// There is no flat ground plane: the terrain replaces it. Order, and why:
//  1. every placed segment's stamps(opt) is collected into the stamp list
//     (plus the layout's own world stamps, e.g. a vessel's mooring pocket);
//  2. the terrain and the sea are built from them - after this terrainH()
//     answers with the final ground;
//  3. the builders run, each charged to its own 'key/d' budget, each followed
//     by pbFlush() (its batched walls and slabs become one mesh per material)
//     and, at d>=3 unless the registration says norepair, portRepair();
//  4. kbake() - instanced detail from every builder, once.
// The target's 89z-rows.js defines PORT_LAYOUT_DEF (portLayoutShowcase() or
// portLayoutSegment(PORT_ONLY)).
portUnderwaterPatch();   // the underwater fade on every MAT material (71-port-terrain.js)
const PORT_LAYOUT=(typeof PORT_LAYOUT_DEF!=='undefined'&&PORT_LAYOUT_DEF)||{items:[],stamps:[],runs:[]};
function portOptFor(it){const R=portRegOf(it.key)||{};
 return {key:it.key,d:it.d,gx:it.gx,gz:it.gz,nb:it.nb||{W:{kind:'land',dz:0},E:{kind:'land',dz:0}},slot:it.slot||0,run:it.run||0,
  ctx:!!it.ctx,W:R.W,LAND:R.LAND,SEA:R.SEA,vessels:PORT_LAYOUT.vessels||[],heading:it.heading||0,
  // a layout item may name the vessel a berth holds, and pass any extra fields
  vessel:it.vessel||null,...(it.opt||{})};}
// 1. stamps
for(const it of PORT_LAYOUT.items){const R=portRegOf(it.key);if(!R){reportErr('layout names unregistered key '+it.key);continue;}
 let st=[];try{st=R.stamps(portOptFor(it))||[];}catch(e){reportErr(it.key+' stamps d='+it.d+' '+e.stack);}
 for(const s of st)portStampAdd(s,it.gx,it.gz,it.key+'/'+it.d+'@'+PORT_LAYOUT.items.indexOf(it));}
for(const s of (PORT_LAYOUT.stamps||[]))portStampAdd(s,0,0,'layout');
// 2. terrain and sea
TSTAT.cur='env/0';
let PORT_TERRAIN=null;
try{PORT_TERRAIN=portBuildTerrain(scene,PORT_LAYOUT);}catch(e){reportErr('terrain '+e.stack);}
TSTAT.cur=null;
// 3. builders (segments, then any free-standing vessels the layout places)
for(const it of PORT_LAYOUT.items){const R=portRegOf(it.key);if(!R)continue;const d=it.d;
 const key=portStatKey(it.key,d);it.stat=key;TSTAT.cur=key;const _r0=REG.length;
 HOLES=(d>=3)?.55:1;KOFF=[0,0,0];KXF=null;
 const opt=portOptFor(it);
 let _G=null;
 PORT_CUR=opt;
 try{_G=R.build(scene,it.gx,it.gz,d,opt);}catch(e){reportErr(it.key+' d='+d+' '+e.stack);}
 PORT_CUR=null;
 try{pbFlush();}catch(e){reportErr(it.key+' flush '+e.stack);}
 HOLES=1;
 if(d>=3&&_G&&!R.norepair){KOFF=[it.gx,0,it.gz];try{portRepair(_G,d);}catch(e){reportErr(it.key+' repair '+e.stack);}}
 KOFF=[0,0,0];KXF=null;
 for(let i=_r0;i<REG.length;i++)if(!REG[i].type)REG[i].type=it.key;
 TSTAT.cur=null;}
window._registered=REG.length;
kbake(scene);
