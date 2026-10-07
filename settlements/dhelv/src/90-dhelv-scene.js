// ================================================================= DHELV: THE SCENE (P5). Renderer, the standard Krator sky, the ground, the
// city carved from the layout (41-dhelv-layout.js) and the kit's defs placed on it, the rock meshed near the camera only.
// The kit's camera, dev tools, furnishing, night and smoke (kits/zeijani/src 92-camera.js, 91f, 91n, 93) run on what this builds.
const TITLE='Dhelv';
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.autoClear=false;document.body.appendChild(renderer.domElement);
TEXANISO=Math.max(1,Math.min(8,renderer.capabilities.getMaxAnisotropy()||1));for(const k in ZJ_LIBTEX)for(const t of Object.values(ZJ_LIBTEX[k]))if(t)t.anisotropy=TEXANISO;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xd8c4a4,.0011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.15,9000);
const skyScene=new THREE.Scene(),skyCam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,9000);
KratorSky.attach(skyScene,4200);
const SKY={hour:10.5,day:200,dens:1.6,night:false};
const qs=new URLSearchParams(location.search);if(qs.get('hour'))SKY.hour=+qs.get('hour');
const hemi=new THREE.HemisphereLight(0xffe6c8,0x7a5a3e,.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.7);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);{const c=sun.shadow.camera;c.left=-80;c.right=80;c.top=80;c.bottom=-80;c.near=10;c.far=900;}sun.shadow.bias=-.0005;sun.shadow.normalBias=.3;
const LIGHTDIR=new THREE.Vector3(.4,.7,.3).normalize();
function skyApply(){KratorSky.update(new THREE.Vector3(),SKY.hour,SKY.day,SKY.dens);const L=KratorSky.lighting();
 LIGHTDIR.copy(L.sunDir.y>.02?L.sunDir:new THREE.Vector3(.3,.6,-.4).normalize());sun.color.copy(L.sunColor||new THREE.Color(1,.95,.86));
 sun.intensity=L.sunDir.y>.02?L.sunIntensity*1.05:.05;hemi.intensity=.28+L.ambient*.75;scene.fog.color.copy(L.fog);}
skyApply();

// ---------------------------------------------------------------- the ground: the layout's (the flows, the kipuka's hollow, the old cone)
terrainH=DH.groundY;   /* 10-core.js's flat sheet ground, replaced: place(), the cavern and the camera read this */
const DH_GROUND={x0:-2960,x1:860,z0:-560,z1:960,step:5};
const groundMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,vertexColors:true});
{const L=KMAT.mode==='lib'?KMAT.packed('zeijani','earth'):null;
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});const g=DH_GROUND;for(const t of [T.map,T.normalMap,T.roughnessMap])if(t)t.repeat.set((g.x1-g.x0)/L.scale[0],(g.z1-g.z0)/L.scale[1]);
  groundMat.map=T.map;groundMat.normalMap=T.normalMap;groundMat.roughnessMap=T.roughnessMap;matHook(groundMat,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}}
/* the cut-away and the holes, as the kit sheet's ground (its uniforms: 40-zj-cave.js fills the holes and masses) */
const ZJ_CUTSITES={value:[]};for(let i=0;i<32;i++)ZJ_CUTSITES.value.push(new THREE.Vector4(0,0,0,0));
const ZJ_MASSES={value:[]};for(let i=0;i<32;i++)ZJ_MASSES.value.push(new THREE.Vector4(0,0,0,0));
const ZJ_HOLES={value:[]};for(let i=0;i<32;i++)ZJ_HOLES.value.push(new THREE.Vector4(0,0,0,0));
matHook(groundMat,'cutGround',sh=>{sh.uniforms.uCut=ANIMU.uCut;sh.uniforms.uCam=ANIMU.uCam;sh.uniforms.uCutSites=ZJ_CUTSITES;sh.uniforms.uMasses=ZJ_MASSES;sh.uniforms.uHoles=ZJ_HOLES;
 sh.vertexShader='varying vec3 vGW;\n'+sh.vertexShader.replace('#include <project_vertex>','vGW=(modelMatrix*vec4(transformed,1.)).xyz;\n#include <project_vertex>');
 sh.fragmentShader='uniform float uCut;uniform vec3 uCam;uniform vec4 uCutSites[32];uniform vec4 uMasses[32];uniform vec4 uHoles[32];varying vec3 vGW;\n'+sh.fragmentShader.replace('void main() {',
  'void main() {\nfor(int i=0;i<32;i++){vec4 q=uHoles[i];if(q.z<=0.)continue;if(distance(vGW.xz,q.xy)<q.z)discard;}\nif(uCut>.5){for(int i=0;i<32;i++){vec4 q=uCutSites[i];if(q.z<=0.)continue;vec2 d=vGW.xz-q.xy;if(abs(d.x)<q.z&&abs(d.y)<q.w&&dot(d,uCam.xz-q.xy)>0.)discard;}}');});
/* a heightfield of the layout's ground; its colour by what it is: the young flow (dark basalt), the kipuka's floor (old soil),
   the cone (weathered tuff). P5b lays the biomes on it */
function dhGroundMesh(){const g=DH_GROUND,xs=[];for(let x=g.x0;x<=g.x1+1e-6;x+=g.step){xs.push(x);if(Math.abs(x-DH.CONE.cliffX)<1e-6)xs.push(x+.05);}   /* a column 5 cm past the cliff's line: the cliff stands plumb, not a 5 m ramp */
 const nx=xs.length-1,nz=Math.round((g.z1-g.z0)/g.step),pos=new Float32Array((nx+1)*(nz+1)*3),col=new Float32Array((nx+1)*(nz+1)*3),idx=[];
 const cFlow=hc(0x4e4f55),cKip=hc(0x7a6c4c),cCone=hc(0x8a7a62),c=new THREE.Color();
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=xs[i],z=g.z0+j*g.step,y=DH.groundY(x,z),k=(j*(nx+1)+i)*3;pos[k]=x;pos[k+1]=y;pos[k+2]=z;
  const K=DH.KIPUKA,dk=Math.hypot(x-K.c[0],(z-K.c[1])*1.3)/K.r,cone=y>DH.surfaceY(x,z)+.5&&x>DH.cliffX(z)-4;
  c.copy(cone?cCone:dk<1.02?cKip:cFlow);if(!cone&&dk>=1.02&&dk<1+K.edge)c.lerp(cKip,.4);col[k]=c.r;col[k+1]=c.g;col[k+2]=c.b;}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,d=a+nx+1,e=d+1;idx.push(a,d,b,b,d,e);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 const uv=new Float32Array((nx+1)*(nz+1)*2);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=(j*(nx+1)+i)*2;uv[k]=(xs[i]-g.x0)/(g.x1-g.x0);uv[k+1]=j/nz;}geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 geo.setIndex(idx);geo.computeVertexNormals();return geo;}
const groundM=new THREE.Mesh(dhGroundMesh(),groundMat);groundM.receiveShadow=true;groundM.userData.isGround=true;scene.add(groundM);

// ---------------------------------------------------------------- the sites: the layout's, each the kit's def
const SITES=DH.SITES.map(s=>({key:s.key,x:s.x,z:s.z,ry:s.ry,o:{v:s.v|0,y:s.y,walls:s.walls},district:s.district,at:s.at}));
const ONLY=qs.get('only');const ONLYSET=ONLY?new Set(ONLY.split(',')):null;   /* ?only=key,key places just those defs (the ways are carved still) */
const ROWS=[];

// ---------------------------------------------------------------- the ways: the layout's public ways carved in the rock
/* the hall, the satellites' pits, every tube, ramp, stair, the ledge and the scouts' ways; the square's lanes, the pits' floors and
   the kipuka's streets are floors already (the hall's, the shafts', the ground's). Ids are 'dh.*', owned by 'dhelv' */
function dhCarve(){const H=DH.HALL,C=CVC,B=DH.byId;
 C.hall({id:'dh.hall',owner:'dhelv',c:[H.c[0],H.y,H.c[1]],rx:H.rx,rz:H.rz,h:H.h,belly:H.belly,throat:{r0:H.throat.r0,r1:H.throat.r1,top:DH.groundY(H.c[0],H.c[1])+4},blend:6});
 C.opening({id:'dh.hall.well',c:H.c.slice(),r:H.throat.r1,rim:.5,kind:'well'});   /* a narrow rim: the page's ground meets the cavern's at its lip */
 /* the hall's foot: a wall plumb for 9 m round the square's edge (the dome alone curves in from the floor, and the carved fronts in
    it, their columns and their upper rooms, cut through it); the ledge runs on the shelf where the dome springs from its top */
 {const pts=[];for(let i=0;i<72;i++){const a=i/72*TAU;pts.push([H.c[0]+Math.cos(a)*H.rx,H.c[1]+Math.sin(a)*H.rz]);}
  C.room({id:'dh.hall.foot',owner:'dhelv',poly:pts,y:H.y,h:9,ceil:'flat',rise:0,r:0,rock:'basalt',finish:'raw'});}
 /* a bay before each carved front in the hall's or a well's wall: the wall curves, the front is flat, so a shallow cut (to 3.5 m
    out, up to the foot wall's 9 m) keeps the curve from burying the front's ends */
 for(const s of SITES){if(s.at!=='wall'||s.district==='outpost'||!DEFS[s.key]||!DEFS[s.key].originFront)continue;const hw=DEFS[s.key].w/2+.3,c=Math.cos(s.ry),sn=Math.sin(s.ry);
  const poly=[[-hw,.05],[hw,.05],[hw,3.5],[-hw,3.5]].map(([lx,lz])=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c]);
  C.room({id:'dh.bay.'+s.key+'.'+Math.round(s.x)+'.'+Math.round(s.z),owner:'dhelv',poly,y:s.o.y,h:Math.min(9,DEFS[s.key].h),ceil:'flat',rise:0,r:0,rock:'basalt',finish:'raw'});}
 /* a forecourt before each carved front a tunnel ends at (the cistern, the catacombs, the stores): a flat face for the front to
    stand on, the tunnel ending a metre short of it */
 for(const s of SITES){if(s.at!=='ground'||s.key==='zj_stonedoor'||!DEFS[s.key]||!DEFS[s.key].originFront)continue;const fw=Math.min(12,DEFS[s.key].w*.7)/2,c=Math.cos(s.ry),sn=Math.sin(s.ry);
  const poly=[[-fw,.05],[fw,.05],[fw,7],[-fw,7]].map(([lx,lz])=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c]);
  C.room({id:'dh.fore.'+s.key,owner:'dhelv',poly,y:s.o.y,h:6,ceil:'vault',rise:1,r:.6,rock:'basalt',finish:'hewn'});}
 for(const P of DH.PITS){const top=DH.groundY(P.c[0],P.c[1])+2;C.shaft({id:'dh.'+P.id+'.pit',owner:'dhelv',c:P.c.slice(),y0:P.floor,y1:top,r0:P.r,r1:P.r+2,floor:true,rock:'basalt',finish:'raw'});
  C.opening({id:'dh.'+P.id+'.well',c:P.c.slice(),r:P.r+2,rim:.5,kind:'well'});}
 const inPit=n=>DH.PITS.some(P=>Math.hypot(n.x-P.c[0],n.z-P.c[1])<P.r-.5);
 for(const e of DH.EDGES){const a=B[e.a],b=B[e.b];if(e.kind==='square'||e.kind==='street'||e.door==='stonedoor')continue;if(inPit(a)&&inPit(b))continue;   /* the stone door's own passage is the way through it */
  const id='dh.'+e.a+'-'+e.b;if(a.x<-2440&&b.x<-2440&&e.kind!=='tube')continue;   /* the kipuka's paths up the cliff are on the ground */
  if(e.kind==='stair')C.stair({id,owner:'dhelv',a:[a.x,a.y,a.z],b:[b.x,b.y,b.z],w:Math.max(1.2,e.w),h:3.2,rock:'basalt',finish:'hewn'});
  else{const w=e.kind==='secret'?1.6:e.w,h=e.kind==='ledge'?3.4:e.kind==='secret'?2.4:Math.max(3,Math.min(10,w*.9+1.5));
   /* each way runs on past its ends into what it meets, so its floor overlaps the next one's (an exact abutment leaves a hairline
      a step lands in): 1.2 m into the hall or a pit (their floors stand 0.3 m in from their walls), else 0.3 m (a stair not at all:
      a walker keeps to the higher floor across an overlap) */
   const ext=id=>dhOpens(id)?1.2:dhFace(id)?-1:.3,A=dhRun(b,a,ext(e.a)),Bp=dhRun(a,b,ext(e.b));
   C.tube({id,owner:'dhelv',pts:[A,Bp],w,h,blend:e.kind==='ledge'?.5:2,rock:'basalt',finish:e.kind==='door'?'hewn':'raw',walkW:Math.max(.8,w-.8)});}}
 /* the outpost's carved fronts open in the cliff, which is the page's ground: a hole in it at each mouth (the portal's tunnel,
    the galleries' and the lean-to's doorways), inside which the cavern meshes the cliff round the opening */
 for(const s of SITES){if(s.district!=='outpost'||s.at!=='wall')continue;const r={zj_portal:6.8,zj_gallery_a:2.2,zj_gallery_b:2.2,zj_hut_c:1.6}[s.key];if(!r)continue;
  C.opening({id:'dh.mouth.'+s.key+'.'+Math.round(s.z),c:[s.x,s.z],r,rim:.5,kind:'well'});}
 /* where the ways meet the open air: the portal's tunnel is the portal def's; the scouts' exits are holes in the flow */
 for(const n of DH.NODES)if(n.exit)C.opening({id:'dh.exit.'+n.id,c:[n.x,n.z],y:n.y-6,r:8,h:10,kind:'door'});}
const dhOpens=id=>/^h\.[wens]$|^s\d\.(in|up|e)$/.test(id);
const dhFace=id=>/^(cis|k\.head|t\.stores)$/.test(id);   /* a carved front's foot: its forecourt takes the tunnel's end */
function dhRun(p,q,ext){const dx=q.x-p.x,dy=q.y-p.y,dz=q.z-p.z,L=Math.hypot(dx,dz)||1;return [q.x+dx/L*ext,q.y+dy/L*ext,q.z+dz/L*ext];}
/* the kipuka's floor and the cliff paths, for the walker (the rest of the surface is not walked in P5a) */
function dhSurfaceWalk(){const K=DH.KIPUKA,rx=K.r*.97,rz=rx/1.3,cx=DH.CONE.cliffX,t0=Math.acos(Math.max(-1,Math.min(1,(cx-K.c[0])/rx))),pts=[];
 /* the hollow's floor west of the cliff: the kipuka's ellipse cut by a chord at the cliff's foot (convex; the portal's tunnel starts 1.5 m in front of it) */
 for(let i=0;i<=40;i++){const a=t0+(TAU-2*t0)*i/40;pts.push([K.c[0]+Math.cos(a)*rx,K.c[1]+Math.sin(a)*rz,K.floor]);}
 KWALK.poly({pts,name:'the kipuka\'s floor',tag:'ground'});
 for(const e of DH.EDGES){const a=DH.byId[e.a],b=DH.byId[e.b];if(e.kind==='stair'&&a.x<-2440&&b.x<-2440)KWALK.strip({a:[a.x,a.z,a.y],b:[b.x,b.z,b.y],w:e.w,name:'dh.'+e.a+'-'+e.b,tag:'built:stair'});}}

// ---------------------------------------------------------------- the rock, meshed near the camera only (PLAN.md 7: about 2M triangles in all)
const DH_STREAM={R:120,drop:170,budget:10,on:true,meshes:new Map(),keys:[],cen:null,near:[],tick:0,meshed:0,tris:0};
function dhStreamReset(){for(const m of DH_STREAM.meshes.values()){CV_GROUP.remove(m);m.geometry.dispose();}DH_STREAM.meshes.clear();DH_STREAM.tris=0;DH_STREAM.meshed=0;
 const s=CVC.chunk;DH_STREAM.keys=CVC.chunks.slice();DH_STREAM.cen=new Float32Array(DH_STREAM.keys.length*3);
 DH_STREAM.keys.forEach((k,i)=>{const q=k.split(',').map(Number);DH_STREAM.cen[i*3]=(q[0]+.5)*s;DH_STREAM.cen[i*3+1]=(q[1]+.5)*s;DH_STREAM.cen[i*3+2]=(q[2]+.5)*s;});DH_STREAM.tick=0;}
function dhStream(at,force){const S=DH_STREAM;if(!S.on||!S.cen)return 0;const p=at||camera.position;
 if(force||S.tick--<=0){S.tick=12;const c=S.cen,near=[];for(let i=0;i<S.keys.length;i++){const d=Math.hypot(c[i*3]-p.x,(c[i*3+1]-p.y)*1.5,c[i*3+2]-p.z);if(d<S.R&&!S.meshes.has(S.keys[i]))near.push([d,i]);}
  near.sort((a,b)=>a[0]-b[0]);S.near=near.map(n=>n[1]);
  for(const [k,m] of S.meshes){const i=m.userData.ci;if(Math.hypot(c[i*3]-p.x,(c[i*3+1]-p.y)*1.5,c[i*3+2]-p.z)>S.drop){CV_GROUP.remove(m);m.geometry.dispose();S.meshes.delete(k);S.tris-=m.userData.tris;}}}
 const t0=performance.now();let n=0;while(S.near.length&&(force||performance.now()-t0<S.budget)){const i=S.near.shift(),k=S.keys[i];if(S.meshes.has(k))continue;
  const m=cvChunkMesh(k);S.meshes.set(k,m||{userData:{ci:i,tris:0},geometry:{dispose(){}}});if(m){m.userData.ci=i;CV_GROUP.add(m);S.tris+=m.userData.tris;}n++;S.meshed++;}
 return n;}
FRAME_HOOKS.push(()=>dhStream());

// ---------------------------------------------------------------- (re)build the world
let WORLD=null;
function buildWorld(){if(WORLD){scene.remove(WORLD);WORLD.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
 WORLD=new THREE.Group();scene.add(WORLD);GB={};GTARGET=GB;REG.length=0;ZJ_LIFE.length=0;halosReset();SMOKES=[];GSTAT.tris=0;SBS.length=0;SB=null;resetCM();if(!ZJTAGS)zjTagsReset();
 KWALK.clear();cvNew();CULT.cur=CULT.packs.zeijani||CULT.cur;
 CV_OPTS.skipMass=true;CV_OPTS.groundKeep=(x,z)=>CVC.openings.some(O=>O.kind==='well'&&Math.hypot(x-O.c[0],z-O.c[1])<O.r+O.rim+.2);CV_OPTS.wellDoor=q=>{const c=cvW(q.c[0],0,q.c[1]);return terrainH(c[0],c[2])-c[1]>3;};
 const t0=performance.now();
 dhCarve();
 for(const S of SITES){if(ONLYSET&&!ONLYSET.has(S.key))continue;place(S.key,S.x,S.z,S.ry||0,S.o);}
 flushBuckets(GB,WORLD,true);
 const tc=performance.now();CVC.build();const tb=performance.now()-tc;
 while(CV_GROUP.children.length){const m=CV_GROUP.children.pop();m.geometry.dispose();}WORLD.add(CV_GROUP);cvFinishOpenings();dhStreamReset();dhSurfaceWalk();
 CV_STATS={chunks:CVC.chunks.length,tris:0,ms:Math.round(tb),prims:CVC.prims.length};
 window._build={ms:Math.round(performance.now()-t0),cavernBuildMs:Math.round(tb),tris:Math.round(GSTAT.tris),sites:SITES.length,records:REG.length,halos:HALOS.length,life:ZJ_LIFE.length,
  cavern:CV_STATS,walk:{floors:KWALK.floors.length,blocks:KWALK.blocks.length}};return WORLD;}

/* the orbit camera's floor (92-camera.js): the ground, but none while the camera is in a void under it */
function camGroundY(p){const g=terrainH(p.x,p.z);if(CVC&&p.y<g-.5&&CVC.voidSD(p.x,p.y,p.z)<0)return -1e9;return g;}
/* underground the sky is not drawn and a dark fog closes the distance (the rock past the streamed chunks is not meshed);
   the cave's own light (the wells' shafts, the lamps' pool) is P5c's */
const DH_UNDER={on:false,fog:new THREE.Color(0x1c1814),dens:.012};
FRAME_HOOKS.push(()=>{const p=camera.position,u=p.y<terrainH(p.x,p.z)-2;if(u===DH_UNDER.on)return;DH_UNDER.on=u;skyScene.visible=!u;
 if(u){scene.fog.color.copy(DH_UNDER.fog);scene.fog.density=DH_UNDER.dens;}else{scene.fog.density=.0011;skyApply();}});

// ---------------------------------------------------------------- views
function autoViews(){const V={},B=DH.byId,H=DH.HALL;
 const at=(id,dx,dy,dz,ty)=>{const n=B[id];return [n.x+dx,n.y+dy,n.z+dz,n.x,n.y+(ty===undefined?1.5:ty),n.z];};
 V['The square from the ledge']=[DH.onLedge(-PI/2)[0],H.ledgeY+1.7,DH.onLedge(-PI/2)[1]+2,0,2,10];
 V['The square']=[30,3,40,0,6,-20];
 V['Under the light well']=[6,1.7,8,0,30,0];
 V['The west mouth']=at('h.w',22,4,6,2);
 V['The braid']=at('j1',-14,3,4,1.5);
 V['The stone door']=at('t.door',18,2.5,2,1.2);
 V['The outer tube']=at('t5',-30,4,0,2);
 V['The outpost']=[-2760,-40,40,-2560,-70,0];
 V['The portal']=[-2560,-68,10,-2505,-62,0];
 for(const P of DH.PITS){V[P.name+': from the rim']=[P.c[0]+P.r*.8,DH.groundY(P.c[0],P.c[1])+4,P.c[1]+P.r*.8,P.c[0],P.floor+3,P.c[1]];
  V[P.name+': its floor']=[P.c[0]+P.r*.5,P.floor+1.7,P.c[1]+P.r*.3,P.c[0],P.floor+4,P.c[1]];}
 V['The cistern']=at('cis',8,2,8,0);
 V['The catacombs\' head']=at('k.head',-12,2,-10,0);
 V['Over the flow (the city below)']=[-150,DH.surfaceY(0,0)+260,520,-80,0,60];
 V['Over the outpost']=[-2900,40,300,-2580,-70,0];
 return V;}
const ATMOS_HOOKS=[];function atmosFrame(dt){for(const f of ATMOS_HOOKS)f(dt);}
ATMOS.init({THREE,scene,camera,hour:()=>SKY.hour,onFrame:fn=>ATMOS_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:4401,err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const ATMOS_GROUND=new THREE.Color();
ATMOS.skylight({renderer,sky:skyScene,scene,ground:()=>ATMOS_GROUND.copy(hemi.groundColor).multiplyScalar(hemi.intensity),key:()=>SKY.night?'n':'d'});
/* where the cavern's ground and the page's overlap (a ring at each opening's rim), the rock wins the depth test: no fight */
cvRockMat.polygonOffset=true;cvRockMat.polygonOffsetFactor=-1;cvRockMat.polygonOffsetUnits=-2;
