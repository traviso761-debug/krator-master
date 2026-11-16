// ================================================================= GRĒṬ-ĀIL — the world: the sky, the ground near and far, the lake
// Runs after 90-scene (renderer, scene, camera, sun and fill exist; window.CITY skipped the sheet's showcase). [web]: three.js,
// canvas.
//   the sky      KratorSky (Xanadu's 81-sky.js), as Qiblai's and Erewhon's pages take it; ?hour=21 opens the page by night
//   the ground   near (AD.BOX, 6 m cells): terrainH (89zad) wearing the Qiblai pack's sets in world metres (qGrass, qDirt,
//                qCobble, qFlag, bound by kits/qiblai 89q0z), blended by a ZONE MASK painted from the site's records (pads and
//                terraces made ground, the ways cobbled, the courts flagged; never read back) and by the shore's band (dirt
//                where the ground comes within 2 m of the lake); far (the whole cut, 72 x 92 km, 400 m cells): the world's
//                ground (WORLD.H with its fine detail left out) coloured in the near ground's key, its grid aligned to the near
//                box and holed under it
//   the lake     core/water's open water (WATER.open, level 0, a calm share of the shared wave field) drawn by WATER.draw, its
//                bed baked from terrainH over the cove; core/atmos's skylight gives it the sky (Locus's lake is the model)
reseed(34152);const AD_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
camera.far=80000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the sky and its light
const AD_SKY={hour:(/[?&]hour=([\d.]+)/.exec(location.search)||[0,10.2])[1]*1,day:120,dens:1.1};
const adSkyG=KratorSky.attach(scene,60000);scene.fog.density=.00004;   /* thin enough that Erehwon's shore and its volcanoes, 20-30 km off, show through the haze */
const adHemi=scene.children.find(o=>o.isHemisphereLight);
function adSkyTick(){KratorSky.update(camera.position,AD_SKY.hour,AD_SKY.day,AD_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(adHemi)adHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(adSkyTick);adSkyTick();
// ---------------------------------------------------------------- the near ground's zone mask and tint
const ADG={x0:AD.BOX[0],z0:AD.BOX[1],x1:AD.BOX[2],z1:AD.BOX[3]};ADG.W=ADG.x1-ADG.x0;ADG.H=ADG.z1-ADG.z0;
const ADG_PX=4096/Math.max(ADG.W,ADG.H),agx=x=>(x-ADG.x0)*ADG_PX,agz=z=>(z-ADG.z0)*ADG_PX;
const adCanvas=()=>{const c=document.createElement('canvas');c.width=Math.ceil(ADG.W*ADG_PX);c.height=Math.ceil(ADG.H*ADG_PX);return c;};
const adCv=adCanvas(),adMask=adCanvas();
(function adPaint(){const g=adCv.getContext('2d'),m=adMask.getContext('2d'),DIRT='rgb(0,0,255)',FLAG='rgb(0,255,0)',COB='rgb(255,0,0)';
 g.fillStyle='#5c6256';g.fillRect(0,0,adCv.width,adCv.height);m.fillStyle='#000';m.fillRect(0,0,adMask.width,adMask.height);
 const rect=(c,x0,z0,x1,z1)=>c.fillRect(agx(Math.min(x0,x1)),agz(Math.min(z0,z1)),Math.abs(x1-x0)*ADG_PX,Math.abs(z1-z0)*ADG_PX);
 const line=(c,P,w)=>{c.lineWidth=w*ADG_PX;c.lineCap='round';c.beginPath();P.forEach((p,i)=>i?c.lineTo(agx(p[0]),agz(p[1])):c.moveTo(agx(p[0]),agz(p[1])));c.stroke();};
 // made ground: every building's pad (dirt) and every stair landing (flagstones); the terraces keep their grass (their courts and
 // walks are paved below)
 for(const p of AD_PADS){if(p.id.startsWith('terrace:'))continue;const L=p.id.startsWith('landing:');g.fillStyle=L?'#8c8984':'#86827a';rect(g,p.x0,p.z0,p.x1,p.z1);m.fillStyle=L?FLAG:DIRT;rect(m,p.x0,p.z0,p.x1,p.z1);}
 // the paved courts (flagstones), the ways (the Lower Way flagged: the pilgrims'; the wharf's and the paths cobbled)
 for(const b of AD_PAVED){g.fillStyle='#8c8984';rect(g,b[0][0],b[0][1],b[1][0],b[1][1]);m.fillStyle=FLAG;rect(m,b[0][0],b[0][1],b[1][0],b[1][1]);}
 for(const [k,w,P] of AD_WAYS){g.strokeStyle=k==='way'?'#8c8984':'#88847c';m.strokeStyle=k==='way'?FLAG:COB;line(g,P,w);line(m,P,w);}})();
function adGroundMat(){const tex=new THREE.CanvasTexture(adCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const mk=new THREE.CanvasTexture(adMask);mk.encoding=THREE.LinearEncoding;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const scale=k=>{const L=KMAT.packed&&KMAT.packed('qiblai',k);return L&&L.scale?L.scale[0]:3;};
 const U={tGrass:{value:lib('qGrass')},tDirt:{value:lib('qDirt')},tCobble:{value:lib('qCobble')},tFlag:{value:lib('qFlag')},tMask:{value:mk},
  kTile:{value:new THREE.Vector4(1/scale('qGrass'),1/scale('qDirt'),1/scale('qCobble'),1/scale('qFlag'))}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aShore;varying float vShore;varying vec3 vAdW;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvAdW=(modelMatrix*vec4(transformed,1.0)).xyz;vShore=aShore;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vAdW;varying float vShore;uniform sampler2D tGrass,tDirt,tCobble,tFlag,tMask;uniform vec4 kTile;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 adT=mapTexelToLinear(texture2D(map,vUv));vec4 adM=texture2D(tMask,vUv);vec2 aw=vAdW.xz;',
    'vec3 ac=sRGBToLinear(texture2D(tGrass,aw*kTile.x)).rgb;ac=mix(ac,sRGBToLinear(texture2D(tDirt,aw*kTile.y)).rgb,max(adM.b,vShore));',
    'ac=mix(ac,sRGBToLinear(texture2D(tCobble,aw*kTile.z)).rgb,adM.r);ac=mix(ac,sRGBToLinear(texture2D(tFlag,aw*kTile.w)).rgb,adM.g);',
    'diffuseColor.rgb*=ac*adT.rgb*4.6;','#endif'].join('\n'));};
 mat.customProgramCacheKey=()=>'azure-dream-ground';return mat;}
// ---------------------------------------------------------------- the near ground (6 m cells) and the far ground (400 m cells)
(function adTerrain(){const cell=6,NX=Math.round(ADG.W/cell),NZ=Math.round(ADG.H/cell),geo=new THREE.PlaneGeometry(ADG.W,ADG.H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(ADG.x0+ADG.x1)/2,cz=(ADG.z0+ADG.z1)/2,sh=new Float32Array(p.count);
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz,h=terrainH(x,z);p.setZ(i,h);uv.setXY(i,agx(x)/adCv.width,1-agz(z)/adCv.height);sh[i]=adSm(2.2,.4,h);}
 geo.setAttribute('aShore',new THREE.BufferAttribute(sh,1));geo.computeVertexNormals();
 groundM=new THREE.Mesh(geo,adGroundMat());groundM.rotation.x=-Math.PI/2;groundM.position.set(cx,0,cz);
 groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.userData.seat='ground';groundM.name='terrain';scene.add(groundM);
 // the far ground: the region cut in the world's colours on a 400 m grid ALIGNED to the near box (AD.BOX is whole cells of it),
 // with the near box's cells left out, so its coarse triangles never stand through the near ground; its edge on the near box's
 // lines, a metre under the near ground's own edge
 const B=WORLD.box(),FC=400,bx0=B[0]-AD.WX,bz0=B[1]-AD.WZ,bx1=B[2]-AD.WX,bz1=B[3]-AD.WZ;
 const X0=ADG.x0-FC*Math.floor((ADG.x0-bx0)/FC),Z0=ADG.z0-FC*Math.floor((ADG.z0-bz0)/FC),NXf=Math.floor((bx1-X0)/FC),NZf=Math.floor((bz1-Z0)/FC);
 const pos=new Float32Array((NXf+1)*(NZf+1)*3),col=new Float32Array((NXf+1)*(NZf+1)*3),idx=[];
 const inNear=(x,z)=>x>ADG.x0-1&&x<ADG.x1+1&&z>ADG.z0-1&&z<ADG.z1+1;
 for(let j=0;j<=NZf;j++)for(let i=0;i<=NXf;i++){const k=j*(NXf+1)+i,x=X0+i*FC,z=Z0+j*FC,onEdge=x>=ADG.x0-1&&x<=ADG.x1+1&&z>=ADG.z0-1&&z<=ADG.z1+1;
  pos[3*k]=x;pos[3*k+1]=onEdge?terrainH(x,z)-1:adBase(x,z,FC);pos[3*k+2]=z;}
 // its colours in the near ground's key (linear): the grass of the isle's slopes, drier with height, rock where steep, sand by
 // the water (the world's own palette reads salmon against the near ground's textured grass at the seam)
 const GR=[.085,.125,.05],DR=[.15,.14,.085],RK=[.2,.185,.165],SD=[.34,.3,.22],mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 for(let j=0;j<=NZf;j++)for(let i=0;i<=NXf;i++){const k=j*(NXf+1)+i,h=pos[3*k+1],hx=pos[3*(j*(NXf+1)+Math.min(NXf,i+1))+1]-pos[3*(j*(NXf+1)+Math.max(0,i-1))+1],
   hz=pos[3*(Math.min(NZf,j+1)*(NXf+1)+i)+1]-pos[3*(Math.max(0,j-1)*(NXf+1)+i)+1],sl=Math.hypot(hx,hz)/(2*FC);
  let c=mix(GR,DR,adSm(80,700,h));c=mix(c,RK,adSm(.35,.8,sl));c=mix(c,SD,adSm(4,.5,h));col[3*k]=c[0];col[3*k+1]=c[1];col[3*k+2]=c[2];}
 for(let j=0;j<NZf;j++)for(let i=0;i<NXf;i++){const cxm=X0+(i+.5)*FC,czm=Z0+(j+.5)*FC;if(inNear(cxm,czm))continue;
  const a=j*(NXf+1)+i,b=a+1,c=a+NXf+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(pos,3));fg.setAttribute('color',new THREE.BufferAttribute(col,3));fg.setIndex(idx);fg.computeVertexNormals();
 const far=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
 far.userData.probeSkip=true;far.userData.lodSkip=true;far.name='far ground (the scale model)';scene.add(far);
 window._adFar={cells:idx.length/6,grid:[NXf,NZf]};})();
// ---------------------------------------------------------------- the lake: core/atmos and core/water
ATMOS.init({THREE,scene,camera,hour:()=>AD_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:34152,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
{const env=new THREE.Scene(),dome=adSkyG.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type==='SphereGeometry');if(dome)env.add(new THREE.Mesh(dome.geometry,dome.material));
 ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x3e4a34)});}
const AD_LAKE=WATER.open({name:"Erehwon's lake",level:0,field:.22,tilt:6,bed:terrainH,bedBox:[ADG.x0,-60,ADG.x1,ADG.z1],bedCell:8});
const AD_LAKE_DRAW=WATER.draw(AD_LAKE,{renderOrder:1,roughness:.12,metalness:.1,envMapIntensity:.22,
 shallow:new THREE.Color(0x4a8a86).convertSRGBToLinear().multiplyScalar(.5),deep:new THREE.Color(0x0e3444).convertSRGBToLinear().multiplyScalar(.7)});
// the lake beyond core/water's own reach (its CDLOD mesh draws the near water): a flat sheet 0.6 m under the level, the deep's
// colour, so the far lake reads as water and not as its bed; under the near surface it is never seen
{const fw=new THREE.Mesh(new THREE.PlaneGeometry(90000,90000),new THREE.MeshStandardMaterial({color:new THREE.Color(0x1e4e5c),roughness:.18,metalness:.15}));
 fw.rotation.x=-Math.PI/2;fw.position.set(0,-.6,0);fw.userData.probeSkip=true;fw.userData.lodSkip=true;fw.name="Erehwon's lake (far)";scene.add(fw);}
window._worldMs=Math.round(performance.now()-AD_T0);
