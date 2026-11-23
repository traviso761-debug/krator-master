// ================================================================= STRONGWALL — the world: the Krator sky, the near ground and its pad, the far land
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). The near ground (a
// 4 km square round the fort at 10 m: the bench, the pad, the scarp's foot, the slot's head) wears the kit's meadow in world metres
// under a colour per vertex: meadow on the bench, scrub on the scarp's foot, bare rock where it is steep, beaten earth on the pad.
// The far land (the scale model's ground out to 40 km: the scarp up to the gold plateau, the bench falling north, the slot along
// the scarp's foot, the valley west toward the Rift) is one coarse mesh coloured by height, slope and the rivers' lines. [web]
const SW_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Thalaba's and Erewhon's)
camera.near=.5;camera.far=62000;camera.updateProjectionMatrix();
const SW_SKY={hour:9.6,day:200,dens:1.0};   /* a morning in the dry season: Kruk Gill's bed dry */
KratorSky.attach(scene,7000);scene.fog.density=.000016;
const swHemi=scene.children.find(o=>o.isHemisphereLight);
function swSkyTick(){KratorSky.update(camera.position,SW_SKY.hour,SW_SKY.day,SW_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(swHemi)swHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);scene.fog.density=.000016;renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(swSkyTick);swSkyTick();
// ---------------------------------------------------------------- the near ground
const SWG={x0:SW.x-2000,x1:SW.x+2000,z0:SW.z-2000,z1:SW.z+2000};
function swSlope(x,z,e){return Math.hypot(swGround(x+e,z)-swGround(x-e,z),swGround(x,z+e)-swGround(x,z-e))/(2*e);}
function swColour(x,z,h,sl,c){const pad=swPadW(x,z);
 if(h<700)c.setRGB(.52,.53,.40);else if(h<1100)c.setRGB(.55,.52,.40);else if(h<2000)c.setRGB(.50,.46,.38);else c.setRGB(.44,.41,.37);   /* the bench's meadow (Cfb, 18 C), drier up the scarp */
 if(sl>.45)c.lerp(new THREE.Color(.40,.37,.34),Math.min(1,(sl-.45)*2.5));   /* bare rock on the scarp's steeps */
 if(pad>0)c.lerp(new THREE.Color(.62,.55,.44),pad);   /* the pad: beaten earth and gravel */
 return c;}
function swNearMesh(G,cell){const W=G.x1-G.x0,H=G.z1-G.z0,NX=Math.round(W/cell),NZ=Math.round(H/cell),geo=new THREE.PlaneGeometry(W,H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(G.x0+G.x1)/2,cz=(G.z0+G.z1)/2,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz,h=swGround(x,z);p.setZ(i,h);uv.setXY(i,x/6,-z/6);
  swColour(x,z,h,swSlope(x,z,cell),c);col[3*i]=c.r;col[3*i+1]=c.g;col[3*i+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
 const tex=MAT.xMeadow&&MAT.xMeadow.map?MAT.xMeadow.map.clone():null;if(tex){tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1,1);tex.needsUpdate=true;}
 const M=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,vertexColors:true,roughness:.96,metalness:0}));
 M.rotation.x=-Math.PI/2;M.position.set(cx,0,cz);M.userData.isGround=true;M.userData.probeSkip=true;M.name='terrain';scene.add(M);return M;}
groundM=swNearMesh(SWG,10);
const swInNear=(x,z,m)=>x>SWG.x0+m&&x<SWG.x1-m&&z>SWG.z0+m&&z<SWG.z1-m;
// ---------------------------------------------------------------- the far land: the model's ground out to 40 km, one coarse mesh
const SW_FARMESH=(function(){const F=SW_GROUND.far,R=F.x1-F.step,step=F.step,n=Math.round(2*R/step);
 const geo=new THREE.PlaneGeometry(2*R,2*R,n,n),p=geo.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 const rivers=SW_GROUND.rivers||[],segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2)):0;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);};
 const rd=(x,z)=>{let best=1e9,wadi=false;for(const r of rivers)for(let i=0;i+1<r.pts.length;i++){const d=segD(x,z,r.pts[i],r.pts[i+1]);if(d<best){best=d;wadi=r.kind==='wadi';}}return[best,wadi];};
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=-p.getY(i),inNear=swInNear(x,z,60);
  const h=swBil(F,SW_FAR,x,z),gx=swBil(F,SW_FAR,x+step,z)-swBil(F,SW_FAR,x-step,z),gz=swBil(F,SW_FAR,x,z+step)-swBil(F,SW_FAR,x,z-step),sl=Math.hypot(gx,gz)/(2*step);
  p.setZ(i,h-(inNear?6:0));
  if(h<0)c.setRGB(.36,.42,.28);else if(h<1200)c.setRGB(.48,.49,.37);else if(h<2600)c.setRGB(.48,.44,.36);else if(h<3800)c.setRGB(.42,.39,.35);else if(h<4700)c.setRGB(.55,.53,.50);else c.setRGB(.85,.86,.88);   /* the Rift's green floor, the bench, the scarp, the plateau's tundra, the snow */
  if(sl>.3&&h<4700)c.lerp(new THREE.Color(.30,.28,.27),Math.min(1,(sl-.3)*2));
  const[d,wadi]=rd(x,z);if(d<220){const w=1-d/220;c.lerp(wadi?new THREE.Color(.66,.62,.54):new THREE.Color(.24,.32,.34),w*.85);}   /* a wadi's dry gravel, a river's water */
  col[3*i]=c.r;col[3*i+1]=c.g;col[3*i+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
 mesh.rotation.x=-Math.PI/2;mesh.userData.probeSkip=true;mesh.userData.lodSkip=true;mesh.name='far land';scene.add(mesh);return mesh;})();
window._worldMs=Math.round(performance.now()-SW_T0);
