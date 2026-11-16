// ================================================================= THALABA — the world: the Krator sky, the painted ground, the far land
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). The near ground
// (the town, the Siṭēps, the Bēnch's fields: a 4.6 km square at 10 m) wears a canvas painted from the plan's records, the
// library's sets blended by a zone mask; nothing reads the canvas back (placement is the plan's, never the paint's). The far
// land (the scale model's ground out to 40 km: the bench, the riser, the gorge's mouth under its 5 km walls, Gāḍz-Phōl, the
// caldera's rim falling to the lake) is one coarse mesh coloured by height, slope and the rivers' lines. [web]: three.js.
reseed(TB.SEED+1);const TB_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Erewhon's and Qiblai's)
// the far land is 40 km out: the camera's far plane goes beyond it, and the haze is thinner than the Vale's
camera.near=.5;camera.far=62000;camera.updateProjectionMatrix();
const TB_SKY={hour:9.4,day:120,dens:1.0};
KratorSky.attach(scene,7000);scene.fog.density=.000018;   /* the dome draws first and writes no depth: the far land draws over it */
const tbHemi=scene.children.find(o=>o.isHemisphereLight);
function tbSkyTick(){KratorSky.update(camera.position,TB_SKY.hour,TB_SKY.day,TB_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(tbHemi)tbHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);scene.fog.density=.000018;renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(tbSkyTick);tbSkyTick();
// ---------------------------------------------------------------- the near ground's extent, its zone mask and its tint
// The library's sets in world metres (the Thalaba pack: tGrass the bench's meadow, tDirt the yards and made ground, tCobble the
// streets and the square, tField the terraces and the fields; src/89t0-tb-matlib.js binds them), blended per fragment by a
// ZONE MASK painted from the plan's records (red cobbles, green fields, blue dirt, none the grass), under a light TINT
const TBG={x0:-2300,x1:2300,z0:-2300,z1:2300};TBG.W=TBG.x1-TBG.x0;TBG.H=TBG.z1-TBG.z0;
const TBG_PX=4096/Math.max(TBG.W,TBG.H),tgx=x=>(x-TBG.x0)*TBG_PX,tgz=z=>(z-TBG.z0)*TBG_PX;
const tbCanvas=()=>{const c=document.createElement('canvas');c.width=Math.ceil(TBG.W*TBG_PX);c.height=Math.ceil(TBG.H*TBG_PX);return c;};
const tbCv=tbCanvas(),tbMask=tbCanvas();
(function tbPaint(){const g=tbCv.getContext('2d'),m=tbMask.getContext('2d');
 const poly=(c,P)=>{c.beginPath();P.forEach((p,i)=>i?c.lineTo(tgx(p[0]),tgz(p[1])):c.moveTo(tgx(p[0]),tgz(p[1])));c.closePath();};
 const line=(c,P,w)=>{c.lineWidth=w*TBG_PX;c.beginPath();P.forEach((p,i)=>i?c.lineTo(tgx(p[0]),tgz(p[1])):c.moveTo(tgx(p[0]),tgz(p[1])));c.stroke();};
 const disc=(c,x,z,r)=>{c.beginPath();c.arc(tgx(x),tgz(z),r*TBG_PX,0,Math.PI*2);c.fill();};
 const box=(c,B)=>c.fillRect(tgx(B[0]),tgz(B[1]),(B[2]-B[0])*TBG_PX,(B[3]-B[1])*TBG_PX);
 const DIRT='rgb(0,0,255)',FIELD='rgb(0,255,0)',COB='rgb(255,0,0)';
 // the country: the bench's meadow, its grass a little dry at 1,500 m in a Cfb year
 g.fillStyle='#6a6c5c';g.fillRect(0,0,tbCv.width,tbCv.height);m.fillStyle='#000';m.fillRect(0,0,tbMask.width,tbMask.height);
 // the fields: the Siṭēps' terraces (the field set, a crop or fallow), the Bēnch's fields (tilled, a crop, fallow); each a
 // shade of its own by its hash, so the belt is a patchwork
 for(const f of TB_FIELDS){const h=tbHash(f.id),v=(h%17)-8,b=f.box;
  const c=f.kind==='tilled'?[116+v,100+v,84+v]:f.kind==='crop'||f.kind==='terrace'?[150+v,140+v,96]:[124+v,124+v,104+v];
  g.fillStyle='rgb('+c.join(',')+')';box(g,b);
  m.fillStyle=f.kind==='tilled'?DIRT:(f.kind==='crop'||f.kind==='terrace')?FIELD:'rgb(0,110,0)';box(m,b);}
 // the town's blocks: made ground (dirt) for the house blocks and the civic ones, the orchards and gardens grass
 for(const b of TB_BLOCKS){const gd=b.use==='orchard'||b.use==='garden',hs=b.use==='houses';g.fillStyle=gd?'#646a58':hs?'#7c7c6e':'#86827a';box(g,b.box);m.fillStyle=gd?'#000':hs?'rgb(0,0,140)':DIRT;box(m,b.box);}   /* the house blocks' yards half grass */
 // the square, the threshing floors
 g.fillStyle='#8c8780';m.fillStyle=COB;for(const c of[g,m])box(c,[TB_SQUARE.x0,TB_SQUARE.z0,TB_SQUARE.x1,TB_SQUARE.z1]);
 g.fillStyle='#9a9286';m.fillStyle=DIRT;for(const T of TB_THRESH)for(const c of[g,m])disc(c,T.x,T.z,T.r);
 // the ways at their widths: cobbles in the town, beaten earth beyond its edge (the roads' far ends, the farm track)
 for(const c of[g,m]){c.lineCap='round';c.lineJoin='round';}
 for(const w of TB_WAYS){const wd=tbD(TB_W[w.cls],5);g.strokeStyle='#8a857c';m.strokeStyle=COB;line(g,w.pts,wd);line(m,w.pts,wd);
  if(w.cls!=='side'){g.strokeStyle='#8f8676';m.strokeStyle=DIRT;
   const out=[];for(const p of w.pts){if(Math.abs(p[0])>680||p[1]<-600||p[1]>360)out.push(p);else if(out.length){line(g,out.concat([p]),wd);line(m,out.concat([p]),wd);out.length=0;out.push(p);}}
   if(out.length>1){line(g,out,wd);line(m,out,wd);}}}
 // the leat's banks (dirt) and the springs' and the tank's stone rims
 g.strokeStyle='#7a7466';m.strokeStyle=DIRT;line(g,TB_LEAT,6);line(m,TB_LEAT,6);
 g.fillStyle='#8a8478';m.fillStyle=COB;for(const S of TB_SPRINGS)for(const c of[g,m])disc(c,S.x,S.z,S.r+1.6);
 {const K=TB_TANK;for(const c of[g,m])box(c,[K.x-K.half-2,K.z-K.half-2,K.x+K.half+2,K.z+K.half+2]);}})();
// the ground's material: the tint as its map, the four sets sampled in world metres in the fragment shader (sRGB to linear),
// blended by the mask; their colour times the tint
function tbGroundMat(){const tex=new THREE.CanvasTexture(tbCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const mk=new THREE.CanvasTexture(tbMask);mk.encoding=THREE.LinearEncoding;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const scale=k=>{const L=KMAT.packed&&KMAT.packed('thalaba',k);return L&&L.scale?L.scale[0]:3;};
 const U={tGrass:{value:lib('tGrass')},tDirt:{value:lib('tDirt')},tCobble:{value:lib('tCobble')},tField:{value:lib('tField')},tMask:{value:mk},
  kTile:{value:new THREE.Vector4(1/scale('tGrass'),1/scale('tDirt'),1/scale('tCobble'),1/scale('tField'))}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vTbW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvTbW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vTbW;uniform sampler2D tGrass,tDirt,tCobble,tField,tMask;uniform vec4 kTile;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 tbT=mapTexelToLinear(texture2D(map,vUv));vec4 tbM=texture2D(tMask,vUv);vec2 tw=vTbW.xz;',
    'vec3 tc=sRGBToLinear(texture2D(tGrass,tw*kTile.x)).rgb;tc=mix(tc,sRGBToLinear(texture2D(tDirt,tw*kTile.y)).rgb,tbM.b);',
    'tc=mix(tc,sRGBToLinear(texture2D(tCobble,tw*kTile.z)).rgb,tbM.r);tc=mix(tc,sRGBToLinear(texture2D(tField,tw*kTile.w)).rgb,tbM.g);',
    'diffuseColor.rgb*=tc*tbT.rgb*4.6;','#endif'].join('\n'));};
 mat.customProgramCacheKey=()=>'thalaba-ground';return mat;}
// ---------------------------------------------------------------- the near terrain mesh (10 m cells)
(function tbTerrain(){const cell=10,NX=Math.round(TBG.W/cell),NZ=Math.round(TBG.H/cell);const geo=new THREE.PlaneGeometry(TBG.W,TBG.H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(TBG.x0+TBG.x1)/2,cz=(TBG.z0+TBG.z1)/2;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;p.setZ(i,terrainH(x,z));uv.setXY(i,tgx(x)/tbCv.width,1-tgz(z)/tbCv.height);}
 geo.computeVertexNormals();
 groundM=new THREE.Mesh(geo,tbGroundMat());groundM.rotation.x=-Math.PI/2;groundM.position.set(cx,0,cz);
 groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);})();
// ---------------------------------------------------------------- the far land: the model's ground out to 40 km, one coarse mesh
// coloured by height (the bench's meadow, the riser's scrub, the gorge's tibasalt walls, snow over 4.6 km), by slope (bare rock on
// the walls) and by the rivers' lines (the Solṭ Siṭrīm across the mouth, the Āirã Siṭrīm down the gorge and over Gāḍz-Phōl, the Qol
// Siṭrīm down to the lake; white where they fall). Under the near ground where the two overlap
const TB_FARMESH=(function(){const F=TB_GROUND.far,R=F.half-F.step,step=F.step,n=Math.round(2*R/step);
 const geo=new THREE.PlaneGeometry(2*R,2*R,n,n),p=geo.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 const rivers=TB_GROUND.rivers||[],rd=(x,z)=>{let best=1e9,fall=0;for(const r of rivers){for(let i=0;i+1<r.pts.length;i++){const a=r.pts[i],b=r.pts[i+1],d=tbSegD(x,z,a,b);
   if(d<best){best=d;fall=Math.abs(a[2]-b[2])/Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1]));}}}return[best,fall];};
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=-p.getY(i),inNear=Math.max(Math.abs(x),Math.abs(z))<TBG.x1-40;
  const h=tbBil(F,TB_FAR,x,z),gx=tbBil(F,TB_FAR,x+step,z)-tbBil(F,TB_FAR,x-step,z),gz=tbBil(F,TB_FAR,x,z+step)-tbBil(F,TB_FAR,x,z-step),sl=Math.hypot(gx,gz)/(2*step);
  p.setZ(i,h-(inNear?8:0));
  if(h<1700)c.setRGB(.42,.44,.33);else if(h<2600)c.setRGB(.44,.42,.34);else if(h<3600)c.setRGB(.38,.36,.33);else if(h<4600)c.setRGB(.30,.29,.28);else c.setRGB(.86,.87,.9);
  if(sl>.35&&h<4600)c.lerp(new THREE.Color(.22,.21,.21),Math.min(1,(sl-.35)*2));   // the tibasalt walls
  const[d,fall]=rd(x,z);if(d<160){const w=1-d/160;c.lerp(fall>.06?new THREE.Color(.92,.93,.94):new THREE.Color(.26,.32,.33),w*.9);}
  col[3*i]=c.r;col[3*i+1]=c.g;col[3*i+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
 mesh.rotation.x=-Math.PI/2;mesh.userData.probeSkip=true;mesh.userData.lodSkip=true;mesh.name='far land';scene.add(mesh);return mesh;})();   /* one coarse mesh: core/lod would chunk it and cull the chunks by distance */
window._worldMs=Math.round(performance.now()-TB_T0);
