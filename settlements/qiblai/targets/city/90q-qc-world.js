// ================================================================= QIBLAI — the world: the Krator sky, the painted ground, the river
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). The ground
// mesh wears a canvas painted from the plan's records: the country, the blocks' made ground, every way at its width (the
// kora in its saffron stone, the avenues in ashlar), the ghat way and the road south; the river is a ribbon of water in its
// channel. Nothing reads the canvas back (placement is the plan's, never the paint's). [web]: canvas and three.js.
reseed(QC.SEED+1);const QC_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Erewhon's)
const QC_SKY={hour:9.6,day:120,dens:1.2};
KratorSky.attach(scene,7000);scene.fog.density=.00022;
const qcHemi=scene.children.find(o=>o.isHemisphereLight);
function qcSkyTick(){KratorSky.update(camera.position,QC_SKY.hour,QC_SKY.day,QC_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(qcHemi)qcHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(qcSkyTick);qcSkyTick();
// ---------------------------------------------------------------- the ground's extent, its zone mask and its tint
// The ground is the library's sets in world metres (the Qiblai pack: qGrass the Af country, qDirt the blocks' made ground,
// qCobble the lay streets, qFlag the avenues and the kora; src/89q0z-qb-matlib.js binds them), blended per fragment by a ZONE
// MASK painted from the plan's records (red cobbles, green flagstones, blue made ground, none the grass), under a light TINT
// (neutral grey, the zones a shade apart). The canvases are drawn, never read back: placement is the plan's.
const QCG={x0:-1900,x1:QC_RIVER.x+500,z0:-1500,z1:1900};QCG.W=QCG.x1-QCG.x0;QCG.H=QCG.z1-QCG.z0;
const QCG_PX=4096/Math.max(QCG.W,QCG.H),qgx=x=>(x-QCG.x0)*QCG_PX,qgz=z=>(z-QCG.z0)*QCG_PX;
const qcCanvas=()=>{const c=document.createElement('canvas');c.width=Math.ceil(QCG.W*QCG_PX);c.height=Math.ceil(QCG.H*QCG_PX);return c;};
const qcCv=qcCanvas(),qcMask=qcCanvas();
(function qcPaint(){const g=qcCv.getContext('2d'),m=qcMask.getContext('2d'),B=QC_B;
 const both=(f)=>{f(g,0);f(m,1);};
 const poly=(c,P)=>{c.beginPath();P.forEach((p,i)=>i?c.lineTo(qgx(p[0]),qgz(p[1])):c.moveTo(qgx(p[0]),qgz(p[1])));c.closePath();};
 const line=(c,P,w,closed)=>{c.lineWidth=w*QCG_PX;c.beginPath();P.forEach((p,i)=>i?c.lineTo(qgx(p[0]),qgz(p[1])):c.moveTo(qgx(p[0]),qgz(p[1])));if(closed)c.closePath();c.stroke();};
 const DIRT='rgb(0,0,255)',FLAG='rgb(0,255,0)',COB='rgb(255,0,0)';
 // the country (grass), the outer square's made ground, the blocks (dirt; the tint a shade lighter toward the centre)
 g.fillStyle='#5e6358';g.fillRect(0,0,qcCv.width,qcCv.height);   /* the country: the lush grass muted a little */m.fillStyle='#000';m.fillRect(0,0,qcMask.width,qcMask.height);
 g.fillStyle='#8a8784';g.fillRect(qgx(B.x0),qgz(B.z0),(B.x1-B.x0)*QCG_PX,(B.z1-B.z0)*QCG_PX);m.fillStyle=DIRT;m.fillRect(qgx(B.x0),qgz(B.z0),(B.x1-B.x0)*QCG_PX,(B.z1-B.z0)*QCG_PX);
 const tint={clergy:'#8e8a84',kora:'#908a82',lay:'#878480',temple:'#94908a'};
 for(const b of QC_S.blocks){const gd=b.use==='garden'||b.use==='meditation';g.fillStyle=gd?'#62685c':(tint[b.kind]||'#878480');poly(g,b.poly);g.fill();m.fillStyle=gd?'#000':DIRT;poly(m,b.poly);m.fill();
  if(b.court){const c=b.court,X=qgx(c[0]),Z=qgz(c[1]),W=(c[2]-c[0])*QCG_PX,H=(c[3]-c[1])*QCG_PX;g.fillStyle='#62685c';g.fillRect(X,Z,W,H);m.fillStyle='#000';m.fillRect(X,Z,W,H);}}   /* a courtyard garden: grass, as a garden block */
 // the temple estates' fields (89zq): tilled soil (the dirt, a darker brown), a standing crop (the grass, yellowed), fallow (the
 // grass, paler); each strip a shade of its own by its hash, so the belt is a patchwork, not one green
 for(const f of QC_FIELDS){const h=qcHash(f.id),v=(h%17)-8,b=f.box,X=qgx(b[0]),Z=qgz(b[1]),W=(b[2]-b[0])*QCG_PX,H=(b[3]-b[1])*QCG_PX;
  const c=f.kind==='tilled'?[112+v,98+v,86+v]:f.kind==='crop'?[150+v,140+v,92]:[122+v,124+v,108+v];g.fillStyle='rgb('+c.join(',')+')';g.fillRect(X,Z,W,H);
  if(f.kind==='tilled'){m.fillStyle=DIRT;m.fillRect(X,Z,W,H);}
  else{g.fillStyle='rgba(0,0,0,.06)';for(let r=0;r<b[3]-b[1];r+=6)g.fillRect(X,Z+r*QCG_PX,W,2*QCG_PX);}}   /* the furrows' rows */
 // the ways at their widths: flagstones on the avenues and the kora, cobbles on the rest
 for(const c of[g,m]){c.lineCap='square';c.lineJoin='miter';}
 for(const w of QC_S.ways){const flag=w.kind==='avenue'||w.kind==='kora';g.strokeStyle=w.kind==='kora'?'#958a7a':'#8c8984';m.strokeStyle=flag?FLAG:COB;line(g,w.pts,w.w,w.closed);line(m,w.pts,w.w,w.closed);}
 // the ghat way to the river (flagstones: the pilgrims' road) and the road south (cobbles)
 g.strokeStyle='#8c8984';m.strokeStyle=FLAG;for(const c of[g,m])line(c,[[B.x1,0],[QC_RIVER.x-QC_RIVER.w/2-8,0]],12);
 m.strokeStyle=COB;for(const c of[g,m])line(c,[[0,B.z1],[0,QCG.z1]],10);
 // the river's banks and bed (made ground's dirt, darker)
 g.fillStyle='#6a6660';g.fillRect(qgx(QC_RIVER.x-QC_RIVER.w/2-22),0,(QC_RIVER.w+44)*QCG_PX,qcCv.height);m.fillStyle=DIRT;m.fillRect(qgx(QC_RIVER.x-QC_RIVER.w/2-22),0,(QC_RIVER.w+44)*QCG_PX,qcMask.height);})();
// the ground's material: the tint as its map, the four sets sampled in world metres in the fragment shader (sRGB to linear),
// blended by the mask; their colour times the tint (x 2: a mid grey is no change)
function qcGroundMat(){const tex=new THREE.CanvasTexture(qcCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const mk=new THREE.CanvasTexture(qcMask);mk.encoding=THREE.LinearEncoding;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const scale=k=>{const L=KMAT.packed&&KMAT.packed('qiblai',k);return L&&L.scale?L.scale[0]:3;};
 const U={tGrass:{value:lib('qGrass')},tDirt:{value:lib('qDirt')},tCobble:{value:lib('qCobble')},tFlag:{value:lib('qFlag')},tMask:{value:mk},
  kTile:{value:new THREE.Vector4(1/scale('qGrass'),1/scale('qDirt'),1/scale('qCobble'),1/scale('qFlag'))}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vQcW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvQcW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vQcW;uniform sampler2D tGrass,tDirt,tCobble,tFlag,tMask;uniform vec4 kTile;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 qcT=mapTexelToLinear(texture2D(map,vUv));vec4 qcM=texture2D(tMask,vUv);vec2 qw=vQcW.xz;',
    'vec3 qc=sRGBToLinear(texture2D(tGrass,qw*kTile.x)).rgb;qc=mix(qc,sRGBToLinear(texture2D(tDirt,qw*kTile.y)).rgb,qcM.b);',
    'qc=mix(qc,sRGBToLinear(texture2D(tCobble,qw*kTile.z)).rgb,qcM.r);qc=mix(qc,sRGBToLinear(texture2D(tFlag,qw*kTile.w)).rgb,qcM.g);',
    'diffuseColor.rgb*=qc*qcT.rgb*4.6;','#endif'].join('\n'));};
 mat.customProgramCacheKey=()=>'qiblai-ground';return mat;}
// ---------------------------------------------------------------- the terrain mesh (8 m cells) and the river's water
(function qcTerrain(){const cell=8,NX=Math.round(QCG.W/cell),NZ=Math.round(QCG.H/cell);const geo=new THREE.PlaneGeometry(QCG.W,QCG.H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(QCG.x0+QCG.x1)/2,cz=(QCG.z0+QCG.z1)/2;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;p.setZ(i,terrainH(x,z));uv.setXY(i,qgx(x)/qcCv.width,1-qgz(z)/qcCv.height);}
 geo.computeVertexNormals();
 groundM=new THREE.Mesh(geo,qcGroundMat());groundM.rotation.x=-Math.PI/2;groundM.position.set(cx,0,cz);
 groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);
 const ap=new THREE.Mesh(new THREE.PlaneGeometry(14000,14000),new THREE.MeshStandardMaterial({color:0x3e5530,roughness:1}));ap.rotation.x=-Math.PI/2;ap.position.y=-30;ap.userData.probeSkip=true;scene.add(ap);
 const wm=new THREE.Mesh(new THREE.PlaneGeometry(QC_RIVER.w+8,QCG.H),new THREE.MeshStandardMaterial({color:0x3f7f86,roughness:.12,metalness:.25,transparent:true,opacity:.88}));
 wm.rotation.x=-Math.PI/2;wm.position.set(QC_RIVER.x,QC_RIVER.y,cz);wm.userData.probeSkip=true;wm.name='Nahr ash-Shalalat';scene.add(wm);})();
window._worldMs=Math.round(performance.now()-QC_T0);
