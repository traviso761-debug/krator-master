// ================================================================= THE FLASHING EYE — the world: the sky, the ground near and far, the talus
// Runs after 90-scene (renderer, scene, camera, sun and fill exist; window.CITY skipped the sheet's showcase). [web]: three.js,
// canvas.
//   the sky      KratorSky (Xanadu's 81-sky.js), as the Azure Dream's page takes it; ?hour=21 opens the page by night
//   the ground   three meshes of terrainH (89zfe): the fine box (4 m cells: the bench, the band, the apron), the coarse box (10 m:
//                the cap, the crater, the spur's sides), each holed under the finer; and the far ground (the whole cut, 400 m
//                cells, the world's colours). One ground shader blends the pack's sets in world metres: grass, the cap's ash
//                rising toward the rim, scoria on the crater's walls and rampart, cinder on its floor and the talus, the
//                columnar basalt on every face steeper than ~55 degrees (projected on the face, not the plan); on the fine box a
//                zone mask painted from the site's records (the bench's made ground, the courts' flagstones, the ways' cobbles,
//                the terraces' tilled earth; never read back). Registered with core/drawn for the audits
//   the talus    the KRUBBLE heaps (89zfe) in the basalt, their hollows dark
reseed(34463);const FE_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
camera.far=90000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the sky and its light
const FE_SKY={hour:(/[?&]hour=([\d.]+)/.exec(location.search)||[0,9.5])[1]*1,day:120,dens:1.05};
const feSkyG=KratorSky.attach(scene,60000);scene.fog.density=.000035;
const feHemi=scene.children.find(o=>o.isHemisphereLight);
function feSkyTick(){KratorSky.update(camera.position,FE_SKY.hour,FE_SKY.day,FE_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(feHemi)feHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);FE_SKY.dayF=L.dayF;}
FRAME_HOOKS.push(feSkyTick);feSkyTick();
// ---------------------------------------------------------------- the fine box's zone mask (R cobble, G flagstone, B made ground or tilled)
const FEG=FE_FINE,FEG_W=FEG.x1-FEG.x0,FEG_H=FEG.z1-FEG.z0,FEG_PX=4096/Math.max(FEG_W,FEG_H),fgx=x=>(x-FEG.x0)*FEG_PX,fgz=z=>(z-FEG.z0)*FEG_PX;
const feMask=document.createElement('canvas');feMask.width=Math.ceil(FEG_W*FEG_PX);feMask.height=Math.ceil(FEG_H*FEG_PX);
(function fePaint(){const m=feMask.getContext('2d'),DIRT='rgb(0,0,255)',FLAG='rgb(0,255,0)',COB='rgb(255,0,0)';
 m.fillStyle='#000';m.fillRect(0,0,feMask.width,feMask.height);
 const rect=(x0,z0,x1,z1)=>m.fillRect(fgx(Math.min(x0,x1)),fgz(Math.min(z0,z1)),Math.abs(x1-x0)*FEG_PX,Math.abs(z1-z0)*FEG_PX);
 const line=(P,w)=>{m.lineWidth=w*FEG_PX;m.lineCap='round';m.lineJoin='round';m.beginPath();P.forEach((p,i)=>i?m.lineTo(fgx(p[0]),fgz(p[1])):m.moveTo(fgx(p[0]),fgz(p[1])));m.stroke();};
 /* the bench inside its wall: packed earth; the pads: made ground */
 m.fillStyle=DIRT;{const b=FE.L.zones.bench;rect(b[0][1],b[0][0],b[2][1],-1.5);}
 for(const p of FE_PADS)rect(p.x0,p.z0,p.x1,p.z1);
 m.fillStyle=FLAG;for(const b of FE_PAVED)rect(b[0][0],b[0][1],b[1][0],b[1][1]);
 for(const [k,w,P] of FE_WAYS){m.strokeStyle=k==='kora'||k==='cleft'?FLAG:COB;line(P,w);}})();
// ---------------------------------------------------------------- the ground's material
function feGroundMat(masked,key){
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const sc=k=>{const L=KMAT.packed&&KMAT.packed('qiblai',k);return L&&L.scale?L.scale[0]:3;};
 const mk=masked?new THREE.CanvasTexture(feMask):null;if(mk)mk.encoding=THREE.LinearEncoding;
 const U={tGrass:{value:lib('qGrass')},tDirt:{value:lib('qDirt')},tCobble:{value:lib('qCobble')},tFlag:{value:lib('qFlag')},tAsh:{value:lib('feAsh')},tSco:{value:lib('feScoria')},
  tCin:{value:lib('feCinder')},tCol:{value:lib('feColumnar')},tMask:{value:mk},
  kA:{value:new THREE.Vector4(1/sc('qGrass'),1/sc('qDirt'),1/sc('qCobble'),1/sc('qFlag'))},kB:{value:new THREE.Vector4(1/sc('feAsh'),1/sc('feScoria'),1/sc('feCinder'),1/sc('feColumnar'))},
  uCr:{value:new THREE.Vector3(FE_CR[0],FE_CR[1],FE.L.crater.r)},uBox:{value:new THREE.Vector4(FEG.x0,FEG.z0,FEG_W,FEG_H)}};
 const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.97,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFeW;varying vec3 vFeN;')
   .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvFeN=normalize((modelMatrix*vec4(objectNormal,0.0)).xyz);')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvFeW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vFeW;varying vec3 vFeN;uniform sampler2D tGrass,tDirt,tCobble,tFlag,tAsh,tSco,tCin,tCol,tMask;uniform vec4 kA,kB,uBox;uniform vec3 uCr;\nvec3 feT(sampler2D t,vec2 p){return sRGBToLinear(texture2D(t,p)).rgb;}\nvec4 feM(vec2 p){return texture2D(tMask,p);}')   /* feM: the zone mask, linear data, not a colour (the coarse mesh never reads it) */
   .replace('#include <map_fragment>',['#include <map_fragment>','vec2 w=vFeW.xz;float y=vFeW.y;vec3 n=normalize(vFeN);float dc=length(w-uCr.xy);',
    'vec3 c=feT(tGrass,w*kA.x)*vec3(.68,.72,.56);',   /* an upland meadow at 1,700 m, not the lowland Af grass the set was made for */
    /* the cap's ash: rising with the height toward the rim, all of it within 250 m of the crater */
    'float ash=max(smoothstep(30.0,150.0,y)*0.85,smoothstep(uCr.z+260.0,uCr.z+60.0,dc));c=mix(c,feT(tAsh,w*kB.x),ash);',
    /* the crater: scoria on its walls and rampart, cinder on its floor */
    'float cr=smoothstep(uCr.z+60.0,uCr.z-10.0,dc);c=mix(c,feT(tSco,w*kB.y),cr);c=mix(c,feT(tCin,w*kB.z),smoothstep(uCr.z*0.55,uCr.z*0.3,dc));',
    /* the talus under the band's face (between the face's foot and the talus's toe, by the Lip's curve): cinder */
    'float dl=w.y+'+FE.L.band.lipK.toFixed(6)+'*w.x*w.x;float ta=smoothstep(10.0,30.0,dl)*smoothstep(150.0,105.0,dl)*smoothstep('+FE.L.band.halfLen.toFixed(1)+',' +(FE.L.band.halfLen-FE.L.band.taper).toFixed(1)+',abs(w.x))*smoothstep(0.99,0.9,n.y);c=mix(c,feT(tCin,w*kB.z),ta*0.85);',
    /* the faces: the colonnade, projected on the face (east-west and up) */
    'float st=smoothstep(0.62,0.42,n.y);vec2 fp=abs(n.x)>abs(n.z)?vec2(w.y,y):vec2(w.x,y);c=mix(c,feT(tCol,fp*kB.w),st);',
    masked?'vec2 mu=(w-uBox.xy)/uBox.zw;if(mu.x>0.0&&mu.x<1.0&&mu.y>0.0&&mu.y<1.0){vec4 m=feM(vec2(mu.x,1.0-mu.y));c=mix(c,feT(tDirt,w*kA.y),m.b*(1.0-st));c=mix(c,feT(tCobble,w*kA.z),m.r*(1.0-st));c=mix(c,feT(tFlag,w*kA.w),m.g*(1.0-st));}':'',
    'diffuseColor.rgb*=c;'].join('\n'));};
 mat.customProgramCacheKey=()=>'flashing-eye-ground-'+key;return mat;}
// ---------------------------------------------------------------- the meshes: a plane of B's cells, its heights the ground's, lowered `sink` m where a
// finer box lies over it (its rim left on the ground, so the two meet), registered with core/drawn (Kirstabal's way)
const feIn=(B,x,z,e)=>x>B.x0+e&&x<B.x1-e&&z>B.z0+e&&z<B.z1-e;
function feGroundMesh(B,name,mat,over,sink){const nx=Math.round((B.x1-B.x0)/B.cell),nz=Math.round((B.z1-B.z0)/B.cell),W=B.x1-B.x0,Hh=B.z1-B.z0;
 const geo=new THREE.PlaneGeometry(W,Hh,nx,nz),p=geo.attributes.position,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2,hs=new Float32Array(p.count);
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;let y=terrainH(x,z);if(over&&feIn(over,x,z,B.cell*.5))y-=sink;p.setZ(i,y);hs[i]=y;}
 geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.set(cx,0,cz);m.receiveShadow=true;
 m.userData.isGround=true;m.userData.ground=true;m.userData.probeSkip=true;m.userData.seat='ground';m.name=name;scene.add(m);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.grid({x0:B.x0,z0:B.z0,dx:W/nx,dz:Hh/nz,nx,nz,h:hs}));
 return m;}
groundM=feGroundMesh(FE_FINE,'terrain (the bench and the band)',feGroundMat(true,'fine'));
const feCoarse=feGroundMesh(FE_COARSE,'terrain (the cone)',feGroundMat(false,'coarse'),FE_FINE,3);
const feFootG=feGroundMesh(FE_FOOT,'terrain (the Foot House)',feGroundMat(false,'foot'));
// the far ground: the cut in the world's colours on a 400 m grid aligned to the coarse box (whole cells of it), holed under it
(function feFar(){const B=WORLD.box(),FC=400,C=FE_COARSE,bx0=B[0]-FE.WX,bz0=B[1]-FE.WZ,bx1=B[2]-FE.WX,bz1=B[3]-FE.WZ;
 const X0=C.x0-FC*Math.floor((C.x0-bx0)/FC),Z0=C.z0-FC*Math.floor((C.z0-bz0)/FC),NX=Math.floor((bx1-X0)/FC),NZ=Math.floor((bz1-Z0)/FC);
 const pos=new Float32Array((NX+1)*(NZ+1)*3),col=new Float32Array((NX+1)*(NZ+1)*3),idx=[];
 for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const k=j*(NX+1)+i,x=X0+i*FC,z=Z0+j*FC,edge=[C,FE_FOOT].some(Q=>x>=Q.x0-1&&x<=Q.x1+1&&z>=Q.z0-1&&z<=Q.z1+1);
  pos[3*k]=x;pos[3*k+1]=edge?terrainH(x,z)-4:feModel(x,z,FC);pos[3*k+2]=z;}
 const GR=[.07,.1,.045],DR=[.13,.12,.08],RK=[.16,.15,.14],AS=[.2,.19,.18],mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const k=j*(NX+1)+i,h=pos[3*k+1]+FE.BENCH,hx=pos[3*(j*(NX+1)+Math.min(NX,i+1))+1]-pos[3*(j*(NX+1)+Math.max(0,i-1))+1],
   hz=pos[3*(Math.min(NZ,j+1)*(NX+1)+i)+1]-pos[3*(Math.max(0,j-1)*(NX+1)+i)+1],sl=Math.hypot(hx,hz)/(2*FC);
  let c=mix(GR,DR,feSm(200,1600,h));c=mix(c,AS,feSm(1600,1850,h));c=mix(c,RK,feSm(.3,.7,sl));col[3*k]=c[0];col[3*k+1]=c[1];col[3*k+2]=c[2];}
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const cxm=X0+(i+.5)*FC,czm=Z0+(j+.5)*FC;if(feIn(C,cxm,czm,-1)||feIn(FE_FOOT,cxm,czm,-1))continue;const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const far=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));far.userData.probeSkip=true;far.userData.lodSkip=true;far.name='far ground (the scale model)';scene.add(far);
 /* the lake beyond: a flat sheet at its level where the cut holds water (Erewhon's lake, -520 m), under the far ground */
 const lake=new THREE.Mesh(new THREE.PlaneGeometry(120000,120000),new THREE.MeshStandardMaterial({color:0x1e4e5c,roughness:.2,metalness:.1}));
 lake.rotation.x=-Math.PI/2;lake.position.set(0,-520-FE.BENCH-.5,0);lake.userData.probeSkip=true;lake.userData.lodSkip=true;lake.name="Erewhon's lake (far)";scene.add(lake);
 window._feFar={cells:idx.length/6,grid:[NX,NZ]};})();
// ---------------------------------------------------------------- the talus: the heaps in the basalt, their hollows dark, their blocks a shade lighter
{const pos=[],col=[],idx=[];let base=0;const B=[.12,.115,.11];
 for(const H of FE_TALUS){const o=KRUBBLE.mesh(H,{cell:2.4}),P=o.pos;
  for(let v=0;v<P.length/3;v++){pos.push(P[v*3],P[v*3+1],P[v*3+2]);const k=(o.part[v]?1.12:.95)*(1-.5*o.occ[v]);col.push(B[0]*k,B[1]*k,B[2]*k);}
  for(const q of o.idx)idx.push(base+q);base+=P.length/3;}
 if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0}));
  m.name='the band: its talus (core/terrain KRUBBLE)';m.castShadow=m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel='The band\'s talus: fallen columns (core/terrain KRUBBLE)';scene.add(m);}}
// ---------------------------------------------------------------- core/atmos
ATMOS.init({THREE,scene,camera,hour:()=>FE_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:34463,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
window._worldMs=Math.round(performance.now()-FE_T0);
