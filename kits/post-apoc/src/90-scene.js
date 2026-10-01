// ---------------------------------------------------------------- scene: renderer, sky, ground, lights, the showcase layout, (re)building the world
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xd2b894,.00075);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,9000);
const hemi=new THREE.HemisphereLight(0xffe6c8,0x6a4a34,.85);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.75);const SUNDIR=new THREE.Vector3(-.55,.66,.38).normalize(),LIGHTDIR=SUNDIR.clone(),MOONDIR=new THREE.Vector3(.5,.52,-.42).normalize();scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);{const c=sun.shadow.camera;c.left=-70;c.right=70;c.top=70;c.bottom=-70;c.near=10;c.far=700;}sun.shadow.bias=-.0006;sun.shadow.normalBias=.35;
const fill=new THREE.DirectionalLight(0xc0d0ff,.32);fill.position.set(800,400,-900);scene.add(fill);
const FRAME_HOOKS=[];
// standard Krator skybox: dusty gradient, gas giant low in the north-east (altitude 25 deg, azimuth 66 deg), a sun disc on the light's line
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{u_n:{value:0},u_d:{value:0}},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform float u_n;uniform float u_d;varying vec3 vP;float hs(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}void main(){vec3 d=normalize(vP);float h=clamp(d.y,-.05,1.);vec3 hz=mix(vec3(.86,.72,.55),vec3(.07,.085,.14),u_n);vec3 zen=mix(vec3(.33,.47,.68),vec3(.008,.014,.05),u_n);vec3 c=mix(hz,zen,pow(h,.5));c=mix(c,vec3(.95,.42,.2),u_d*pow(1.-h,3.));vec3 g=floor(d*230.);float st=step(.9968,hs(g));c+=vec3(st)*u_n*clamp(d.y*2.,0.,1.)*(.45+.55*hs(g+3.));gl_FragColor=vec4(c,1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(6000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
const giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(1900,1900,1);giant.userData.probeSkip=true;scene.add(giant);
const giantDir=new THREE.Vector3(Math.sin(66*PI/180)*Math.cos(25*PI/180),Math.sin(25*PI/180),-Math.cos(66*PI/180)*Math.cos(25*PI/180));
const sunTex=canvasTex(256,256,(g,w,h)=>{const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,250,235,1)');gr.addColorStop(.12,'rgba(255,244,214,1)');gr.addColorStop(.2,'rgba(255,226,170,.55)');gr.addColorStop(1,'rgba(255,200,140,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
sunTex.wrapS=sunTex.wrapT=THREE.ClampToEdgeWrapping;
const sunDisc=new THREE.Sprite(new THREE.SpriteMaterial({map:sunTex,fog:false,transparent:true,depthWrite:false}));sunDisc.scale.set(700,700,1);sunDisc.userData.probeSkip=true;scene.add(sunDisc);
// ground: one big dusty plane, tiled in world units. Water (the dock) is drawn by the dock itself as a plate just above it.
TEX.dirt.repeat.set(1,1);
const groundMat=new THREE.MeshStandardMaterial({map:TEX.dirt,roughness:1});TEX.dirt.repeat.set(3200/TILE.dirt,3200/TILE.dirt);
const groundM=new THREE.Mesh(new THREE.PlaneGeometry(3200,3200),groundMat);groundM.rotation.x=-PI/2;groundM.receiveShadow=true;groundM.userData.isGround=true;scene.add(groundM);
// ---------------------------------------------------------------- layout: rows by family, front (+z) toward the camera
const SITES=[],ROWS=[];
const ONLY=(new URLSearchParams(location.search)).get('only');const ONLYSET=ONLY?new Set(ONLY.split(',')):null;   // ?only=key,key builds just those defs
// a row entry is 'key', 'key@culture' (dresses that site in a culture's marks) or {key, o} (place() options, e.g. the large compound: o.size, o.slots)
const SITEKEY=k=>{if(typeof k!=='string')return {key:k.key,o:Object.assign({v:0},k.o||{})};const kk=k.split('@');return {key:kk[0],o:kk[1]?{v:0,culture:kk[1]}:{v:0}};};
(function layout(){let z=0;const GAP=9;for(const F of FAMILIES){const keys=F.keys.map(SITEKEY).filter(k=>DEFS[k.key]&&(!ONLYSET||ONLYSET.has(k.key)));
 if(!keys.length)continue;
 const DK=k=>declOf(k.key,k.o);const ws=keys.map(k=>DK(k).w+GAP),total=ws.reduce((a,c)=>a+c,0),dmax=Math.max(...keys.map(k=>DK(k).d)),hmax=Math.max(...keys.map(k=>DK(k).h));
 z+=dmax/2;let x=-total/2;keys.forEach((k,i)=>{SITES.push({key:k.key,x:x+ws[i]/2,z,ry:0,o:k.o});x+=ws[i];});
 ROWS.push({family:F.name,z,d:dmax,w:total,h:hmax,keys:keys.map(k=>k.key)});z+=dmax/2+Math.max(26,hmax*1.3)+8;}})();
const GROUND_C=ROWS.length?ROWS[ROWS.length-1].z/2:0;groundM.position.set(0,0,GROUND_C);
// ---------------------------------------------------------------- (re)build the world for a culture
let WORLD=null;
function buildWorld(cultureKey){if(WORLD){scene.remove(WORLD);WORLD.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
 WORLD=new THREE.Group();scene.add(WORLD);GB={};GTARGET=GB;SPINNERS.length=0;regClear();plantsReset();halosReset();SOCK_ALL.length=0;GSTAT.tris=0;SBS.length=0;SB=null;resetCM();
 CULT.cur=CULT.packs[cultureKey]||CULT.generic;const t0=performance.now();
 window._compounds=[];for(const S of SITES)place(S.key,S.x,S.z,S.ry||0,S.o);
 flushBuckets(GB,WORLD,true);
 for(const sp of SPINNERS){const grp=new THREE.Group();grp.matrixAutoUpdate=false;grp.matrix.copy(sp.world);const inner=new THREE.Group();grp.add(inner);flushBuckets(sp.buckets,inner,true);sp.node=inner;WORLD.add(grp);}
 if(typeof nightRebuild==='function')nightRebuild();
 if(typeof doorsRebuild==='function')doorsRebuild();
 window._build={ms:performance.now()-t0,tris:GSTAT.tris,culture:CULT.cur.key,sites:SITES.length,spinners:SPINNERS.length};return WORLD;}
FRAME_HOOKS.push(dt=>{for(const sp of SPINNERS)if(sp.node)sp.node.rotation[sp.axis]+=sp.rate*dt;});
// views: an opening, an overview, a row shot per family and an eye-level shot per building
function autoViews(){const V={};const R=ROWS;const mid=R[Math.floor(R.length/2)];
 V['Opening']=[R[0].w*.28,Math.max(20,R[0].d*.8),R[0].z+R[0].d*.5+38,0,4,R[0].z];
 V['Overview']=[-R[0].w*.9,R[R.length-1].z*.7,R[R.length-1].z*.5+150,0,2,mid.z];
 for(const r of R){const dist=Math.max(44,Math.min(r.w*.55,200),(r.h||0)*1.7);V[r.family]=[r.w*.12,Math.max(16,dist*.42),r.z+r.d/2+dist,0,Math.min(3+(r.h||0)*.3,14),r.z];}
 for(const S of SITES){const D=declOf(S.key,S.o);const dist=Math.max(11,Math.max(D.w,D.h)*.85+D.d*.4);V[D.name+(S.o.size?' ('+S.o.size+')':'')+(S.o.culture?' ('+S.o.culture+')':'')+' — eye level']=[S.x+D.w*.15,1.7,S.z+D.d/2+dist*.55,S.x,Math.min(D.h,12)*.35,S.z];}
 return V;}
