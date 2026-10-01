// ---------------------------------------------------------------- scene (Xanadu showcase)
// Rows by family, front (+z) toward the camera. A target may list extra SITES (a compound at a given scale) in its
// 89z-rows.js (XA_EXTRA).
const XA_ROWS=[];   // {family, z, d, keys}
// A row's camera stands rowCamDist() in front of it (+z), i.e. between it and the next row; when the next row is
// tall (a temple, the palace) the gap is widened so the previous row's camera is not behind a 40 m wall.
const rowCamDist=w=>Math.max(40,Math.min(w*.55,260));
const eyeCamDist=D=>Math.max(10,Math.max(D.w,D.h||0)*.9+D.d*.5);   // an eye-level camera stands this far in front of the plot centre
const XA_ALLV=(typeof XA_VARIANTS!=='undefined')&&XA_VARIANTS;   // a target may show every def at all its variants (o.v = 0 … nv-1)
const xaVs=k=>{if(!XA_ALLV)return[0];const n=VERN.defs[k].nv||3,out=[];for(let v=0;v<n;v++)out.push(v);return out;};   // every variant, v0 first
(function xaLayout(){let z=0;const fams=XA.families();
 let prev=null;fams.forEach((F,fi)=>{const ws=F.keys.map(k=>(VERN.defs[k].w+9)*xaVs(k).length);const total=ws.reduce((a,c)=>a+c,0);
  const dmax=Math.max(...F.keys.map(k=>VERN.defs[k].d||VERN.defs[k].w)),hmax=Math.max(...F.keys.map(k=>VERN.defs[k].h||0));
  if(prev)z+=Math.max(0,Math.max(rowCamDist(prev.w),prev.h*1.7)+10-22);   // every row: keep the previous row's camera out of this row's plots
  z+=dmax/2;let x=-total/2;
  F.keys.forEach((k,i)=>{const vs=xaVs(k),u=ws[i]/vs.length;vs.forEach((v,j)=>SITES.push({key:k,x:x+u*(j+.5),z,ry:0,o:{v}}));x+=ws[i];});
  prev={family:F.family,z,d:dmax,w:total,h:hmax,keys:F.keys};XA_ROWS.push(prev);
  const eyeNeed=Math.max(...F.keys.map(k=>eyeCamDist(VERN.defs[k])))-dmax/2+6;   // keep eye-level cameras clear of the next row
  z+=dmax/2+Math.max(22,eyeNeed);});
 for(const S of XA_EXTRA){S.z=z+S.depth/2;SITES.push(S);XA_ROWS.push({family:S.family||S.key,z:S.z,d:S.depth,w:S.depth,keys:[S.key]});z+=S.depth+30;}})();
const GROUND_C=(XA_ROWS.length?XA_ROWS[XA_ROWS.length-1].z:0)/2;
// views: an opening, an overview, one per row, and an eye-level shot per building
function xaAutoViews(extra){const V={};const R=XA_ROWS;if(!R.length)return V;const mid=R[Math.floor(R.length/2)];
 V['Opening']=[R[0].w*.25,Math.max(24,R[0].d*.9),R[0].z+R[0].d*.5+44,0,5,R[0].z];
 V['Overview']=[-900,520,mid.z+80,0,10,mid.z];
 for(const r of R){const dist=Math.max(rowCamDist(r.w),(r.h||0)*1.7);V[r.family]=[0,Math.max(18,dist*.45),r.z+r.d/2+dist,0,Math.min(4+(r.h||0)*.35,20),r.z];}
 for(const S of SITES){const D=VERN.defs[S.key];if(!D)continue;const dist=eyeCamDist(D);
  const E=D.eye;   // a def may name its own eye-level stance: [dx,dz,tdx,tdz] from its plot centre (the lane looks down its length)
  for(const X of(D.eyes||[]))V[D.name+(S.o.v?' v'+S.o.v:'')+' — '+X[0]]=[S.x+X[1],1.7+(X[5]||0),S.z+X[2],S.x+X[3],Math.min(D.h||6,14)*.3,S.z+X[4]];   // extra stances
  V[D.name+(S.o.v?' v'+S.o.v:'')+' — eye level']=E?[S.x+E[0],1.7+(E[4]||0),S.z+E[1],S.x+E[2],Math.min(D.h||6,14)*.3,S.z+E[3]]:[S.x+D.w*.18,1.7,S.z+dist,S.x,Math.min(D.h||6,14)*.4,S.z];}
 return Object.assign(V,extra||{});}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8ccb4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00042);   // the dry gold haze of a high valley
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,6000);
scene.add(new THREE.HemisphereLight(0xdde8ff,0x6a5a3a,.7));
const sun=new THREE.DirectionalLight(0xfff0d8,1.7);sun.position.set(-500,760,520);scene.add(sun);          // a high, hard mountain sun
const fill=new THREE.DirectionalLight(0xb8c8ff,.3);fill.position.set(500,300,-600);scene.add(fill);
// hooks the frame loop runs (city: sky/lighting update); the showcase adds none
const FRAME_HOOKS=(typeof FRAME_HOOKS_PRE!=='undefined')?FRAME_HOOKS_PRE.slice():[];
// sky dome (the Ancients kit's haze sky, deepened toward the zenith for altitude; the city target swaps in KratorSky)
let sky,giant,groundM,LABELS;const SITE_GROUPS=[];
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180));

if(!window.CITY){
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vP;void main(){float h=clamp(normalize(vP).y,-.05,1.);vec3 hz=vec3(.86,.82,.72);vec3 zen=vec3(.16,.34,.68);vec3 c=mix(hz,zen,pow(h,.6));gl_FragColor=vec4(c,1.);}'});
sky=new THREE.Mesh(new THREE.SphereGeometry(5000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(1400,1400,1);giant.userData.probeSkip=true;scene.add(giant);

// ground: dry valley grass, tiled in world units
TEX.xMeadow.repeat.set(400,400);
groundM=new THREE.Mesh(new THREE.PlaneGeometry(3200,3200),MAT.xMeadow);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.05,GROUND_C);groundM.userData.probeSkip=true;scene.add(groundM);

// ---------------------------------------------------------------- build every site the target lists
// SITES = [{key, x, z, ry, o, label}] laid out by xaLayout() from the registry (89z-rows.js may add XA_EXTRA)
for(const S of SITES){const k=S.key+'/'+((S.o&&S.o.v)||0);TSTAT.cur=k;const r0=REG.length;
 const G=VERN.place(scene,S.key,S.x,S.z,S.ry||0,S.o);if(G)SITE_GROUPS.push({S,G});
 for(let i=r0;i<REG.length;i++)REG[i].type=S.key;TSTAT.cur=null;}
window._registered=REG.length;
kbake(scene);
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);BIO.bake();}   // the gardens' biome plants

// site labels come from src/93-labels.js (the atlas over REG)
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
}   // end showcase-only block
