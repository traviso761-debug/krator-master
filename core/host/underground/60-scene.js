// ================================================================= UNDERGROUND TEST — the scene: the rock drawn, the props, the lamps
// The rock is KCAVERN.drawRock's (core/terrain/host/39e), its material taking only the soft band of the dither (KFADE, occluder off:
// fading a cave wall shows the void); the props take both. The lamps follow the Tungang plan's lamp code (green on the gallery, amber
// at work, red at home, white at the shaft), with an ambient floor so nothing is black.
KTAGS.page=KTAGS.create({build:'underground'});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0c0b0a);scene.fog=new THREE.Fog(0x0c0b0a,60,220);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.08,900);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled=false;
scene.add(new THREE.HemisphereLight(0xd8d0c0,0x2a2420,.55));scene.add(new THREE.AmbientLight(0x3a3430,.35));
const UG_ROCK=new THREE.MeshStandardMaterial({color:0xb0a594,vertexColors:true,roughness:.95,metalness:0});UG_ROCK.name='ug rock';
KFADE.add(UG_ROCK,{occluder:false});
const UG_DRAW=KCAVERN.drawRock(UGC,{THREE,material:UG_ROCK,tile:48,label:'Rock'});scene.add(UG_DRAW.group);
/* the props: one material per kind, each with the fade (a crate or a rope between the camera and the walker dithers out) */
const UG_MAT={};function ugMat(kind){if(UG_MAT[kind])return UG_MAT[kind];let col={crate:0x8a6a44,table:0x7a5a3a,bench:0x6a5038,bed:0x9a7a6a,rope:0xd8c8a0}[kind];if(col==null)col=0x888888;
 const m=new THREE.MeshStandardMaterial({color:col,roughness:.8});m.name='ug '+kind;KFADE.add(m);return UG_MAT[kind]=m;}
const UG_PROPS=new THREE.Group();UG_PROPS.name='props';scene.add(UG_PROPS);
UG.PROPS.forEach((p,i)=>{const g=p.kind==='rope'?new THREE.CylinderGeometry(p.w/2,p.w/2,p.h,6):new THREE.BoxGeometry(p.w,p.h,p.d);
 const m=new THREE.Mesh(g,ugMat(p.kind));m.position.set(p.x,p.y+p.h/2,p.z);m.name=p.kind+' '+i;if(p.deck!=null)m.userData.deck=p.deck;UG_PROPS.add(m);
 KTAGS.page.add({'class':'prop',kind:p.kind,name:p.kind+(p.deck!=null?' (deck '+p.deck+')':''),at:[p.x,p.y,p.z],size:[p.w,p.d,p.h],ry:0,tags:{culture:'generic'},frag:'60-scene.js'});});
/* the lamps: a point light and a small glowing box each */
const UG_LAMPS=[[-50,3.6,3.6,0x4fd07a],[-10,3.6,-3.6,0x4fd07a],[30,3.6,3.6,0x4fd07a],[70,3.6,-3.6,0x4fd07a],[-8,7.4,10,0xffb050],[0,11.3,22,0xff6050],
 [25,3,-7.5,0xffffff],[96,9,0,0xbfe8ff],[40,10.8,22.5,0xffb050]];
UG_LAMPS.forEach((L,i)=>{const pl=new THREE.PointLight(L[3],1.1,26,1.6);pl.position.set(L[0],L[1],L[2]);scene.add(pl);
 const b=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,.25),new THREE.MeshBasicMaterial({color:L[3]}));b.position.copy(pl.position);b.name='lamp '+i;b.userData.deck=L[1]>8?2:L[1]>4?1:0;scene.add(b);});
