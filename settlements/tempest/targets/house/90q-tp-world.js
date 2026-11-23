// ================================================================= THE HOUSE OF THE TEMPEST — the world: the Krator sky, the near ground and its pad, the far land
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). Strongwall's world
// (settlements/strongwall/targets/fort/90q-sw-world.js) on this page's ground: the near ground (a 4 km square round the House at
// 10 m: the West Arm's crest and its flanks) wears the kit's meadow in world metres under a colour per vertex (the crest's meadow,
// scrub on the flanks, bare rock where it is steep, beaten earth on the pad); the far land (the model out to 40 km: the Rift's
// edge and Komodo's lowlands west, the bench to Strongwall east) is one coarse mesh coloured by height, slope and the rivers. [web]
const TP_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Strongwall's and Thalaba's)
camera.near=.5;camera.far=62000;camera.updateProjectionMatrix();
const TP_SKY={hour:9.2,day:200,dens:1.0};   /* a morning on the crest */
KratorSky.attach(scene,7000);scene.fog.density=.000016;
const tpHemi=scene.children.find(o=>o.isHemisphereLight);
function tpSkyTick(){KratorSky.update(camera.position,TP_SKY.hour,TP_SKY.day,TP_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(tpHemi)tpHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);scene.fog.density=.000016;renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(tpSkyTick);tpSkyTick();
// ---------------------------------------------------------------- the near ground
const TPG={x0:TPS.x-2000,x1:TPS.x+2000,z0:TPS.z-2000,z1:TPS.z+2000};
function tpSlope(x,z,e){return Math.hypot(tpGround(x+e,z)-tpGround(x-e,z),tpGround(x,z+e)-tpGround(x,z-e))/(2*e);}
function tpColour(x,z,h,sl,c){const pad=tpPadW(x,z);
 if(h<200)c.setRGB(.46,.50,.36);else if(h<450)c.setRGB(.50,.52,.38);else c.setRGB(.53,.53,.39);   /* the crest's meadow (Cfb, 19 C), greener down the flanks toward the Rift */
 if(sl>.45)c.lerp(new THREE.Color(.40,.37,.34),Math.min(1,(sl-.45)*2.5));   /* bare rock on the steeps */
 if(pad>0)c.lerp(new THREE.Color(.62,.55,.44),pad);   /* the pad: beaten earth and gravel */
 return c;}
function tpNearMesh(G,cell){const W=G.x1-G.x0,H=G.z1-G.z0,NX=Math.round(W/cell),NZ=Math.round(H/cell),geo=new THREE.PlaneGeometry(W,H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(G.x0+G.x1)/2,cz=(G.z0+G.z1)/2,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz,h=tpGround(x,z);p.setZ(i,h);uv.setXY(i,x/6,-z/6);
  tpColour(x,z,h,tpSlope(x,z,cell),c);col[3*i]=c.r;col[3*i+1]=c.g;col[3*i+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
 const tex=MAT.xMeadow&&MAT.xMeadow.map?MAT.xMeadow.map.clone():null;if(tex){tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1,1);tex.needsUpdate=true;}
 const M=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,vertexColors:true,roughness:.96,metalness:0}));
 M.rotation.x=-Math.PI/2;M.position.set(cx,0,cz);M.userData.isGround=true;M.userData.probeSkip=true;M.name='terrain';scene.add(M);return M;}
groundM=tpNearMesh(TPG,10);
const tpInNear=(x,z,m)=>x>TPG.x0+m&&x<TPG.x1-m&&z>TPG.z0+m&&z<TPG.z1-m;
// ---------------------------------------------------------------- the far land: the model's ground out to 40 km, one coarse mesh
const TP_FARMESH=(function(){const F=TP_GROUND.far,R=F.x1-F.step,step=F.step,n=Math.round(2*R/step);
 const geo=new THREE.PlaneGeometry(2*R,2*R,n,n),p=geo.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 const rivers=TP_GROUND.rivers||[],segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2)):0;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);};
 const rd=(x,z)=>{let best=1e9,wadi=false;for(const r of rivers)for(let i=0;i+1<r.pts.length;i++){const d=segD(x,z,r.pts[i],r.pts[i+1]);if(d<best){best=d;wadi=r.kind==='wadi';}}return[best,wadi];};
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=-p.getY(i),inNear=tpInNear(x,z,60);
  const h=tpBil(F,TP_FAR,x,z),gx=tpBil(F,TP_FAR,x+step,z)-tpBil(F,TP_FAR,x-step,z),gz=tpBil(F,TP_FAR,x,z+step)-tpBil(F,TP_FAR,x,z-step),sl=Math.hypot(gx,gz)/(2*step);
  p.setZ(i,h-(inNear?6:0));
  if(h<0)c.setRGB(.34,.42,.27);else if(h<1200)c.setRGB(.48,.49,.37);else if(h<2600)c.setRGB(.48,.44,.36);else if(h<3800)c.setRGB(.42,.39,.35);else if(h<4700)c.setRGB(.55,.53,.50);else c.setRGB(.85,.86,.88);   /* the Rift's green floor (Lizard country), the bench, the scarp, the plateau, the snow */
  if(sl>.3&&h<4700)c.lerp(new THREE.Color(.30,.28,.27),Math.min(1,(sl-.3)*2));
  const[d,wadi]=rd(x,z);if(d<220){const w=1-d/220;c.lerp(wadi?new THREE.Color(.66,.62,.54):new THREE.Color(.24,.32,.34),w*.85);}   /* a wadi's dry gravel, a river's water (the Kruk Warra) */
  col[3*i]=c.r;col[3*i+1]=c.g;col[3*i+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
 mesh.rotation.x=-Math.PI/2;mesh.userData.probeSkip=true;mesh.userData.lodSkip=true;mesh.name='far land';scene.add(mesh);return mesh;})();
window._worldMs=Math.round(performance.now()-TP_T0);
