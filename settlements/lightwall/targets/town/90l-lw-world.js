// ================================================================= LĀIṬWĀL — the world: the Krator sky, the painted bench, the north wall, the lake
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY), as Qiblai's
// 90q. The bench's ground mesh (6 m cells) wears a canvas painted from the plan's records: the bench's grass, the built
// blocks' made ground, the fields in strips, every street at its width (the bazaar avenue and the Stair Foot in flagstones,
// the rest cobbles), the shingle shore. Nothing reads the canvas back (placement is the plan's, never the paint's). The
// north wall behind the Glaziers' bands is a coarser mesh in the rock's colour, rising to the far field; the lake is still
// water at -30 over its bed. The ground sets are the Qiblai kit's (kit.json packFrom: the Sultanate's country). [web]
reseed(LW.SEED+1);const LW_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Qiblai's and Erewhon's)
const LW_SKY={hour:16.4,day:150,dens:1.1};
KratorSky.attach(scene,9000);scene.fog.density=.00016;
const lwHemi=scene.children.find(o=>o.isHemisphereLight);
function lwSkyTick(){KratorSky.update(camera.position,LW_SKY.hour,LW_SKY.day,LW_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(lwHemi)lwHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(lwSkyTick);lwSkyTick();
// ---------------------------------------------------------------- the scarp's rock: its strata and its texture
/* the north fault's rock in beds (biomes/opalvalley: the banded rhyolite-ignimbrite column, dark basalt dikes at the contact):
   a tint by height, the beds warped by core/rand's value noise, written into out[0..2] as a multiplier of the library's
   hewn basalt (over 1 lifts it toward the rhyolite's rose and the tuff's pale) */
const LW_BEDS=[[.78,.78,.84],[1.22,1.02,.96],[1.02,.94,.92],[1.34,1.24,1.12],[.86,.84,.88],[1.16,.98,.94]];
function lwStrata(x,y,out){const w=y+6*KRAND.vnoise(x*.012,y*.02,0,LW.SEED+31)+2*KRAND.vnoise(x*.06,y*.1,0,LW.SEED+32),t=w/7.5,i=Math.floor(t),f=t-i,
  a=LW_BEDS[((i%LW_BEDS.length)+LW_BEDS.length)%LW_BEDS.length],b=LW_BEDS[(((i+1)%LW_BEDS.length)+LW_BEDS.length)%LW_BEDS.length],s=f<.8?0:(f-.8)/.2,g=.92+.16*KRAND.vnoise(x*.3,y*.3,0,LW.SEED+33);
 for(let k=0;k<3;k++)out[k]=(a[k]*(1-s)+b[k]*s)*g;return out;}
/* the scarp's rock face: the library's rock.rock_face (a scanned cliff, Xanadu's own xRock: no new pack), at twice its tile,
   through core/terrain's ground shader (KGROUND.hook: hex tiling, the distance scale, triplanar on the steep); the beds' tint
   (lwStrata, the vertex colours) multiplies it */
function lwRockLayer(mat){const T=MAT.xRock&&MAT.xRock.map;if(!T||typeof KGROUND==='undefined')return mat;T.wrapS=T.wrapT=THREE.RepeatWrapping;
 const L=KMAT.packed&&KMAT.packed('xanadu','xRock'),sc=L&&L.scale?L.scale[0]:4;
 return KGROUND.hook(mat,{layers:[{map:T,k:1/(sc*2.2),w:'1.0',lin:true,name:'the scarp: rock face'}],tri:{from:.3,to:.65,far:900},key:'lightwall-rock'});}
// ---------------------------------------------------------------- the bench's canvas: the zone mask and the tint
const LWG={x0:-1300,x1:1300,z0:-300,z1:620};LWG.W=LWG.x1-LWG.x0;LWG.H=LWG.z1-LWG.z0;
const LWG_PX=4096/Math.max(LWG.W,LWG.H),lgx=x=>(x-LWG.x0)*LWG_PX,lgz=z=>(z-LWG.z0)*LWG_PX;
const lwCanvas=()=>{const c=document.createElement('canvas');c.width=Math.ceil(LWG.W*LWG_PX);c.height=Math.ceil(LWG.H*LWG_PX);return c;};
const lwCv=lwCanvas(),lwMask=lwCanvas();
(function lwPaint(){const g=lwCv.getContext('2d'),m=lwMask.getContext('2d');
 const poly=(c,P)=>{c.beginPath();P.forEach((p,i)=>i?c.lineTo(lgx(p[0]),lgz(p[1])):c.moveTo(lgx(p[0]),lgz(p[1])));c.closePath();};
 const line=(c,P,w)=>{c.lineWidth=w*LWG_PX;c.beginPath();P.forEach((p,i)=>i?c.lineTo(lgx(p[0]),lgz(p[1])):c.moveTo(lgx(p[0]),lgz(p[1])));c.stroke();};
 const DIRT='rgb(0,0,255)',FLAG='rgb(0,255,0)',COB='rgb(255,0,0)';
 /* the bench's grass (the middle terrace's Cfb country), the shingle shore below the shore road, the scree at the wall's foot */
 g.fillStyle='#646a58';g.fillRect(0,0,lwCv.width,lwCv.height);m.fillStyle='#000';m.fillRect(0,0,lwMask.width,lwMask.height);
 g.fillStyle='#8c8a82';g.fillRect(0,lgz(LW_ROWS[0]+6),lwCv.width,lwCv.height);m.fillStyle=DIRT;m.fillRect(0,lgz(LW_ROWS[0]+6),lwMask.width,lwMask.height);
 const scree=g.createLinearGradient(0,lgz(LW.WALL-30),0,lgz(LW.FOOT+18));scree.addColorStop(0,'#77706c');scree.addColorStop(1,'rgba(118,112,104,0)');
 g.fillStyle=scree;g.fillRect(0,0,lwCv.width,lgz(LW.FOOT+18));m.fillStyle=DIRT;m.fillRect(0,0,lwMask.width,lgz(LW.FOOT+4));
 /* the built blocks' made ground; the fields in strips along the contour, tilled, in crop or fallow by a hash of the strip */
 for(const b of LW_BLOCKS){if(b.kind==='field'){const xs=b.poly.map(p=>p[0]),zs=b.poly.map(p=>p[1]),X0=Math.min(...xs),X1=Math.max(...xs),Z0=Math.min(...zs),Z1=Math.max(...zs);
   for(let z=Z0,k=0;z<Z1;z+=14,k++){const h=lwHash(b.id+':'+k)%100,v=(h%13)-6,c=h<35?[112+v,98+v,84+v]:h<75?[150+v,142+v,90]:[122+v,126+v,106+v];
    g.fillStyle='rgb('+c.join(',')+')';g.fillRect(lgx(X0),lgz(z),(X1-X0)*LWG_PX,Math.min(13,Z1-z)*LWG_PX);if(h<35){m.fillStyle=DIRT;m.fillRect(lgx(X0),lgz(z),(X1-X0)*LWG_PX,Math.min(13,Z1-z)*LWG_PX);}}}
  else{g.fillStyle={rich:'#8e8a84',middle:'#888580',poor:'#84817c',shore:'#83807a'}[b.kind]||'#878480';poly(g,b.poly);g.fill();m.fillStyle=DIRT;poly(m,b.poly);m.fill();}}
 /* the Stair Foot (flagstones) and the streets at their widths */
 for(const c of [g,m]){c.lineCap='square';c.lineJoin='miter';}
 g.fillStyle='#93897c';m.fillStyle=FLAG;for(const c of [g,m]){c.fillRect(lgx(LW_PLAZA.x0),lgz(LW_PLAZA.z0-14),(LW_PLAZA.x1-LW_PLAZA.x0)*LWG_PX,(LW_PLAZA.z1-LW_PLAZA.z0+14)*LWG_PX);}
 for(const w of LW_STREETS){const flag=w.cls==='avenue';g.strokeStyle=flag?'#93897c':'#8c8984';m.strokeStyle=flag?FLAG:COB;line(g,w.pts,LW_W[w.cls]);line(m,w.pts,LW_W[w.cls]);}
 /* the road west down the valley from the caravanserai, and east to the monastery's spur */
 m.strokeStyle=COB;g.strokeStyle='#8c8984';for(const c of [g,m]){line(c,[[-940,LW_ROWS[0]],[-1300,LW_ROWS[0]+60]],8);line(c,[[940,LW_ROWS[1]],[1000,150]],6);}})();
function lwGroundMat(){const tex=new THREE.CanvasTexture(lwCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const mk=new THREE.CanvasTexture(lwMask);mk.encoding=THREE.LinearEncoding;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const scale=k=>{const L=KMAT.packed&&KMAT.packed('qiblai',k);return L&&L.scale?L.scale[0]:3;};
 const U={tGrass:{value:lib('qGrass')},tDirt:{value:lib('qDirt')},tCobble:{value:lib('qCobble')},tFlag:{value:lib('qFlag')},tMask:{value:mk},
  kTile:{value:new THREE.Vector4(1/scale('qGrass'),1/scale('qDirt'),1/scale('qCobble'),1/scale('qFlag'))}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLwW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLwW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLwW;uniform sampler2D tGrass,tDirt,tCobble,tFlag,tMask;uniform vec4 kTile;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 lwT=mapTexelToLinear(texture2D(map,vUv));vec4 lwM=texture2D(tMask,vUv);vec2 lw=vLwW.xz;',
    'vec3 lc=sRGBToLinear(texture2D(tGrass,lw*kTile.x)).rgb;lc=mix(lc,sRGBToLinear(texture2D(tDirt,lw*kTile.y)).rgb,lwM.b);',
    'lc=mix(lc,sRGBToLinear(texture2D(tCobble,lw*kTile.z)).rgb,lwM.r);lc=mix(lc,sRGBToLinear(texture2D(tFlag,lw*kTile.w)).rgb,lwM.g);',
    'diffuseColor.rgb*=lc*lwT.rgb*4.6;','#endif'].join('\n'));};
 mat.customProgramCacheKey=()=>'lightwall-ground';return mat;}
// ---------------------------------------------------------------- the bench's mesh (6 m cells), the north wall, the lake
(function lwTerrain(){const cell=6,NX=Math.round(LWG.W/cell),NZ=Math.round(LWG.H/cell),geo=new THREE.PlaneGeometry(LWG.W,LWG.H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(LWG.x0+LWG.x1)/2,cz=(LWG.z0+LWG.z1)/2;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;p.setZ(i,terrainH(x,z));uv.setXY(i,lgx(x)/lwCv.width,1-lgz(z)/lwCv.height);}
 geo.computeVertexNormals();
 groundM=new THREE.Mesh(geo,lwGroundMat());groundM.rotation.x=-Math.PI/2;groundM.position.set(cx,0,cz);
 groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='the bench';groundM.receiveShadow=true;scene.add(groundM);
 /* the north wall: from the wall's line back 4.5 km, 40 m cells (8 m near the bands), the rock's colour by height and slope */
 const W={x0:-4200,x1:4200,z0:-4800,z1:LWG.z0+2},rows=[];for(let z=W.z1;z>W.z0;){rows.push(z);z-=z>-420?6:z>-900?20:60;}rows.push(W.z0);
 const cols=[];for(let x=W.x0;x<W.x1;){cols.push(x);x+=Math.abs(x)<1400?12:60;}cols.push(W.x1);
 const pos=[],col=[],idx=[],NC=cols.length,cs=[0,0,0];
 rows.forEach(z=>cols.forEach(x=>{const y=terrainH(x,z);pos.push(x,y,z);lwStrata(x,y,cs);
  /* snow over 2,300 m (local; about 3,600 m in the model), lying thicker where the wall eases */
  const sn=y>2300?Math.min(1,(y-2300)/400)*(.6+.4*KRAND.vnoise(x*.004,z*.004,0,LW.SEED+34)):0;col.push(cs[0]*(1-sn)+2.4*sn,cs[1]*(1-sn)+2.45*sn,cs[2]*(1-sn)+2.55*sn);}));
 for(let j=0;j<rows.length-1;j++)for(let i=0;i<NC-1;i++){const a=j*NC+i,b=a+1,c=a+NC,d=c+1;idx.push(a,b,c,b,d,c);}
 const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));wg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));wg.setIndex(idx);wg.computeVertexNormals();
 const wall=new THREE.Mesh(wg,lwRockLayer(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0,color:0x9a928c})));wall.name='the north wall';wall.userData.isGround=true;wall.userData.probeSkip=true;wall.receiveShadow=true;scene.add(wall);
 /* the lake: still water at -30, milky turquoise (silica in suspension: biomes/opalvalley), out to the far shore */
 const lake=new THREE.Mesh(new THREE.PlaneGeometry(16000,9000),new THREE.MeshStandardMaterial({color:0x78bcbc,roughness:.14,metalness:.08,transparent:true,opacity:.9}));
 lake.rotation.x=-Math.PI/2;lake.position.set(0,LW.LAKE,LW.SHORE+4500);lake.userData.probeSkip=true;lake.name='the great lake';lake.receiveShadow=true;scene.add(lake);
 const bed=new THREE.Mesh(new THREE.PlaneGeometry(16000,9000),new THREE.MeshStandardMaterial({color:0x5c6a62,roughness:1}));bed.rotation.x=-Math.PI/2;bed.position.set(0,-46.5,LW.SHORE+4500);bed.userData.probeSkip=true;scene.add(bed);})();
window._worldMs=Math.round(performance.now()-LW_T0);
