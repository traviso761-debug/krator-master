// ================================================================= VIRIDIAN — the world: the sky and the mist, the ground near and far
// Runs after 90-scene (renderer, scene, camera, sun and fill exist; window.CITY skipped the sheet's showcase). [web]: three.js,
// canvas. The Azure Dream's page (settlements/azure-dream 90ad) is the model.
//   the sky      KratorSky (Xanadu's 81-sky.js); ?hour=21 opens the page by night. The mist belt (PLAN.md section 1: the
//                westerlies bank against the scarp) is the fog, thicker than a lake page's, so the scarp's top goes grey
//   the ground   near (VT.BOX, 8 m cells, the ground under the terraces: their steps would alias at 8 m) holed under the fine
//                ground (VT.FINE, 2.5 m cells: terrainH with every tread and riser); both wear the Qiblai pack's sets in world
//                metres (qGrass, qDirt, qCobble, qFlag) blended by a ZONE MASK painted from the site's records (pads made
//                ground, the ways cobbled, the courts flagged) and a colour canvas with every hedge row painted on it (89zvb's
//                VT_HEDGES.paint): never read back. Far (the whole cut, 400 m cells): the world's ground, coloured in the near
//                ground's key, holed under the near box
reseed(34366);const VT_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
camera.far=60000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the sky, its light and the mist
const VT_SKY={hour:(/[?&]hour=([\d.]+)/.exec(location.search)||[0,9.4])[1]*1,day:100,dens:1.25};
const vtSkyG=KratorSky.attach(scene,50000);scene.fog.density=.00011;   /* the mist belt: the scarp's top 3-4 km off goes grey */
const vtHemi=scene.children.find(o=>o.isHemisphereLight);
function vtSkyTick(){KratorSky.update(camera.position,VT_SKY.hour,VT_SKY.day,VT_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity*.85;sun.color.copy(L.sunColor);
 fill.intensity=.26*L.dayF+.06;if(vtHemi)vtHemi.intensity=L.ambient*1.1;scene.fog.color.copy(L.fog).lerp(new THREE.Color(.62,.66,.66),.35);renderer.setClearColor(scene.fog.color);}
FRAME_HOOKS.push(vtSkyTick);vtSkyTick();
// ---------------------------------------------------------------- the near ground's zone mask and colour
const VTG={x0:VT.BOX[0],z0:VT.BOX[1],x1:VT.BOX[2],z1:VT.BOX[3]};VTG.W=VTG.x1-VTG.x0;VTG.H=VTG.z1-VTG.z0;
const VTG_PX=4096/Math.max(VTG.W,VTG.H),vgx=x=>(x-VTG.x0)*VTG_PX,vgz=z=>(z-VTG.z0)*VTG_PX;
const vtCanvas=()=>{const c=document.createElement('canvas');c.width=Math.ceil(VTG.W*VTG_PX);c.height=Math.ceil(VTG.H*VTG_PX);return c;};
const vtCv=vtCanvas(),vtMask=vtCanvas();
(function vtPaint(){const g=vtCv.getContext('2d'),m=vtMask.getContext('2d'),DIRT='rgb(0,0,255)',FLAG='rgb(0,255,0)',COB='rgb(255,0,0)';
 g.fillStyle='#5c6256';g.fillRect(0,0,vtCv.width,vtCv.height);m.fillStyle='#000';m.fillRect(0,0,vtMask.width,vtMask.height);
 const rect=(c,x0,z0,x1,z1)=>c.fillRect(vgx(Math.min(x0,x1)),vgz(Math.min(z0,z1)),Math.abs(x1-x0)*VTG_PX,Math.abs(z1-z0)*VTG_PX);
 const line=(c,P,w)=>{c.lineWidth=w*VTG_PX;c.lineCap='round';c.beginPath();P.forEach((p,i)=>i?c.lineTo(vgx(p[0]),vgz(p[1])):c.moveTo(vgx(p[0]),vgz(p[1])));c.stroke();};
 // the tea gardens: the treads' soil a shade darker, then every hedge row a dark leaf-green dash
 g.fillStyle='#55583e';for(const R of VT_TERR){const P=R.zone.poly;g.beginPath();P.forEach((p,i)=>i?g.lineTo(vgx(p[0]),vgz(p[1])):g.moveTo(vgx(p[0]),vgz(p[1])));g.closePath();g.fill();}
 g.fillStyle='#2c4a26';const r=Math.max(1.2,1.1*VTG_PX);for(const L of VT_HEDGES.paint)for(const p of L)g.fillRect(vgx(p.x)-r/2,vgz(p.z)-r/2,r,r);
 // made ground: every pad (dirt), the court (flagged); the bench keeps its grass (its courts are paved below)
 for(const p of VT_PADS){if(p.id==='terrace:bench')continue;const F=p.id==='terrace:court';g.fillStyle=F?'#8c8984':'#86827a';rect(g,p.x0,p.z0,p.x1,p.z1);m.fillStyle=F?FLAG:DIRT;rect(m,p.x0,p.z0,p.x1,p.z1);}
 for(const b of VT_PAVED){g.fillStyle='#8c8984';rect(g,b[0],b[1],b[2],b[3]);m.fillStyle=FLAG;rect(m,b[0],b[1],b[2],b[3]);}
 for(const [k,w,P] of VT_WAYS){g.strokeStyle=k==='way'?'#8c8984':'#88847c';m.strokeStyle=k==='way'?FLAG:k==='road'?COB:DIRT;line(g,P,w);line(m,P,w);}})();
function vtGroundMat(){const tex=new THREE.CanvasTexture(vtCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const mk=new THREE.CanvasTexture(vtMask);mk.encoding=THREE.LinearEncoding;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const scale=k=>{const L=KMAT.packed&&KMAT.packed('qiblai',k);return L&&L.scale?L.scale[0]:3;};
 const U={tGrass:{value:lib('qGrass')},tDirt:{value:lib('qDirt')},tCobble:{value:lib('qCobble')},tFlag:{value:lib('qFlag')},tMask:{value:mk},
  kTile:{value:new THREE.Vector4(1/scale('qGrass'),1/scale('qDirt'),1/scale('qCobble'),1/scale('qFlag'))}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vVtW;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvVtW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vVtW;uniform sampler2D tGrass,tDirt,tCobble,tFlag,tMask;uniform vec4 kTile;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 vtT=mapTexelToLinear(texture2D(map,vUv));vec4 vtM=texture2D(tMask,vUv);vec2 vw=vVtW.xz;',
    'vec3 vc=sRGBToLinear(texture2D(tGrass,vw*kTile.x)).rgb;vc=mix(vc,sRGBToLinear(texture2D(tDirt,vw*kTile.y)).rgb,vtM.b);',
    'vc=mix(vc,sRGBToLinear(texture2D(tCobble,vw*kTile.z)).rgb,vtM.r);vc=mix(vc,sRGBToLinear(texture2D(tFlag,vw*kTile.w)).rgb,vtM.g);',
    'diffuseColor.rgb*=vc*vtT.rgb*4.6;','#endif'].join('\n'));};
 mat.customProgramCacheKey=()=>'viridian-ground';return mat;}
// a grid mesh in world metres over [x0,z0,x1,z1] at cell c, its heights from hf, the cells skip(cx, cz) leaves out, uv on the canvas
function vtGrid(x0,z0,x1,z1,c,hf,skip,mat,name){const NX=Math.round((x1-x0)/c),NZ=Math.round((z1-z0)/c),pos=new Float32Array((NX+1)*(NZ+1)*3),uv=new Float32Array((NX+1)*(NZ+1)*2),idx=[];
 for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const k=j*(NX+1)+i,x=x0+i*c,z=z0+j*c;pos[3*k]=x;pos[3*k+1]=hf(x,z);pos[3*k+2]=z;uv[2*k]=vgx(x)/vtCv.width;uv[2*k+1]=1-vgz(z)/vtCv.height;}
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){if(skip&&skip(x0+(i+.5)*c,z0+(j+.5)*c))continue;const a=j*(NX+1)+i,b=a+1,cc=a+NX+1,d=cc+1;idx.push(a,cc,b,b,cc,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const M=new THREE.Mesh(g,mat);M.userData.isGround=true;M.userData.probeSkip=true;M.userData.seat='ground';M.name=name;M.receiveShadow=true;scene.add(M);return M;}
// the near ground: under the terraces (their steps would alias at 8 m) but with the pads cut, holed under the fine ground; its
// vertices on the fine ground's edge sink 0.8 m, so the coarse cells never stand through the fine ground's treads
const VT_FN=VT.FINE,vtInFine=(x,z)=>x>VT_FN[0]&&x<VT_FN[2]&&z>VT_FN[1]&&z<VT_FN[3];
function vtSmoothH(x,z){let h=vtBase(x,z);for(const p of VT_PADS){const dx=Math.max(p.x0-x,0,x-p.x1),dz=Math.max(p.z0-z,0,z-p.z1);if(dx>=p.skirt||dz>=p.skirt)continue;const d=Math.hypot(dx,dz);if(d>=p.skirt)continue;h+=(p.y-h)*(1-vtSm(0,p.skirt,d));}return h;}
const VT_GMAT=vtGroundMat();
const VT_GROUND=(function(){const onFineEdge=(x,z)=>x>=VT_FN[0]-.1&&x<=VT_FN[2]+.1&&z>=VT_FN[1]-.1&&z<=VT_FN[3]+.1;
 const near=vtGrid(VTG.x0,VTG.z0,VTG.x1,VTG.z1,8,(x,z)=>onFineEdge(x,z)?Math.min(terrainH(x,z),vtSmoothH(x,z))-.8:vtSmoothH(x,z),vtInFine,VT_GMAT,'terrain');
 const fine=vtGrid(VT_FN[0],VT_FN[1],VT_FN[2],VT_FN[3],2.5,terrainH,null,VT_GMAT,'terrain (fine: the terraces)');
 groundM=near;return{near,fine};})();
// ---------------------------------------------------------------- the far ground (400 m cells), holed under the near box
(function vtFar(){const B=WORLD.box(),FC=400,bx0=B[0]-VT.WX,bz0=B[1]-VT.WZ,bx1=B[2]-VT.WX,bz1=B[3]-VT.WZ;
 const X0=VTG.x0-FC*Math.floor((VTG.x0-bx0)/FC),Z0=VTG.z0-FC*Math.floor((VTG.z0-bz0)/FC),NXf=Math.floor((bx1-X0)/FC),NZf=Math.floor((bz1-Z0)/FC);
 const pos=new Float32Array((NXf+1)*(NZf+1)*3),col=new Float32Array((NXf+1)*(NZf+1)*3),idx=[];
 const inNear=(x,z)=>x>VTG.x0-1&&x<VTG.x1+1&&z>VTG.z0-1&&z<VTG.z1+1;
 for(let j=0;j<=NZf;j++)for(let i=0;i<=NXf;i++){const k=j*(NXf+1)+i,x=X0+i*FC,z=Z0+j*FC,onEdge=x>=VTG.x0-1&&x<=VTG.x1+1&&z>=VTG.z0-1&&z<=VTG.z1+1;
  pos[3*k]=x;pos[3*k+1]=onEdge?vtSmoothH(x,z)-1:vtBase(x,z,FC);pos[3*k+2]=z;}
 // its colours in the near ground's key (linear): the mist belt's forest dark below the scarp's face, parkland lower down the
 // valley, rock where steep, the scarp's top drier and paler
 const GR=[.085,.125,.05],WD=[.03,.06,.025],DR=[.15,.14,.085],RK=[.2,.185,.165],mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const wood=(x,z,h)=>vtSm(.3,.5,VT_WOODN.fbm(x/500+1.3,z/500-4.1,3))*vtSm(300,700,h)*vtSm(2300,1800,h);
 for(let j=0;j<=NZf;j++)for(let i=0;i<=NXf;i++){const k=j*(NXf+1)+i,h=pos[3*k+1],hx=pos[3*(j*(NXf+1)+Math.min(NXf,i+1))+1]-pos[3*(j*(NXf+1)+Math.max(0,i-1))+1],
   hz=pos[3*(Math.min(NZf,j+1)*(NXf+1)+i)+1]-pos[3*(Math.max(0,j-1)*(NXf+1)+i)+1],sl=Math.hypot(hx,hz)/(2*FC);
  let c=mix(GR,WD,wood(pos[3*k],pos[3*k+2],h));c=mix(c,DR,vtSm(2000,2600,h));c=mix(c,RK,vtSm(.35,.8,sl));col[3*k]=c[0];col[3*k+1]=c[1];col[3*k+2]=c[2];}
 for(let j=0;j<NZf;j++)for(let i=0;i<NXf;i++){const cxm=X0+(i+.5)*FC,czm=Z0+(j+.5)*FC;if(inNear(cxm,czm))continue;
  const a=j*(NXf+1)+i,b=a+1,c=a+NXf+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(pos,3));fg.setAttribute('color',new THREE.BufferAttribute(col,3));fg.setIndex(idx);fg.computeVertexNormals();
 const far=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
 far.userData.probeSkip=true;far.userData.lodSkip=true;far.name='far ground (the scale model)';scene.add(far);
 window._vtFar={cells:idx.length/6,grid:[NXf,NZf]};})();
window._worldMs=Math.round(performance.now()-VT_T0);
