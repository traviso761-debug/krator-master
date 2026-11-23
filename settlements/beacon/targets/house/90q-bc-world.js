// ================================================================= THE BEACON - the world: the Krator sky, the near ground and its levels, the far land
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). The near ground
// (a 4 km square round the lamp at 10 m: the knoll, its spur, the saddle, the house's levels) wears the kit's meadow in world
// metres under a colour per vertex; the far land (the scale model out to 40 km: the Rift floor 2,500 m below to the south, the
// rim and the middle volcano north) is one coarse mesh coloured by height and slope. The hour is ?hour= (default 18.4: dusk, the
// lamp lit by its schedule, src/40-bc-lamp.js). [web]
const BC_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
camera.near=.5;camera.far=62000;camera.updateProjectionMatrix();
const BC_SKY={hour:(function(){const q=new URLSearchParams(location.search).get('hour');const h=q==null?NaN:parseFloat(q);return isFinite(h)?((h%24)+24)%24:18.05;})(),day:200,dens:1.0};
KratorSky.attach(scene,7000);scene.fog.density=.000014;
const bcHemi=scene.children.find(o=>o.isHemisphereLight);
function bcSkyTick(){KratorSky.update(camera.position,BC_SKY.hour,BC_SKY.day,BC_SKY.dens);const Lg=KratorSky.lighting();
 sun.position.copy(Lg.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=Lg.sunIntensity;sun.color.copy(Lg.sunColor);
 fill.intensity=.22*Lg.dayF+.08;if(bcHemi)bcHemi.intensity=Math.max(.18,Lg.ambient);scene.fog.color.copy(Lg.fog);scene.fog.density=.000014;renderer.setClearColor(Lg.fog);}
FRAME_HOOKS.push(bcSkyTick);bcSkyTick();
// ---------------------------------------------------------------- the near ground
const BCG_BOX={x0:-2000,x1:2000,z0:-2000,z1:2000};
function bcSlope(x,z,e){return Math.hypot(bcGround(x+e,z)-bcGround(x-e,z),bcGround(x,z+e)-bcGround(x,z-e))/(2*e);}
function bcColour(x,z,h,sl,c){const pad=bcPadW(x,z);
 if(h>650)c.setRGB(.50,.52,.38);else if(h>250)c.setRGB(.55,.52,.38);else c.setRGB(.50,.47,.34);   /* the knoll's meadow (Cfb, 17 C), drier down the spur toward the Rift */
 if(sl>.5)c.lerp(new THREE.Color(.42,.38,.34),Math.min(1,(sl-.5)*2.2));   /* bare rock on the scarp's faces */
 if(pad>0)c.lerp(new THREE.Color(.47,.43,.35),pad*.6);   /* the house's levels: beaten earth and gravel, the meadow still through it */
 return c;}
function bcNearMesh(G,cell){const W=G.x1-G.x0,H=G.z1-G.z0,NX=Math.round(W/cell),NZ=Math.round(H/cell),geo=new THREE.PlaneGeometry(W,H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(G.x0+G.x1)/2,cz=(G.z0+G.z1)/2,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz,h=bcGround(x,z);p.setZ(i,h);uv.setXY(i,x/6,-z/6);
  bcColour(x,z,h,bcSlope(x,z,cell),c);col[3*i]=c.r;col[3*i+1]=c.g;col[3*i+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
 const tex=MAT.xMeadow&&MAT.xMeadow.map?MAT.xMeadow.map.clone():null;if(tex){tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1,1);tex.needsUpdate=true;}
 const M=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,vertexColors:true,roughness:.96,metalness:0}));
 M.rotation.x=-Math.PI/2;M.position.set(cx,0,cz);M.userData.isGround=true;M.userData.probeSkip=true;M.name='terrain';scene.add(M);return M;}
groundM=bcNearMesh(BCG_BOX,10);
const bcInNear=(x,z,m)=>x>BCG_BOX.x0+m&&x<BCG_BOX.x1-m&&z>BCG_BOX.z0+m&&z<BCG_BOX.z1-m;
// ---------------------------------------------------------------- the far land: the model's ground out to 40 km, one coarse mesh
const BC_FARMESH=(function(){const F=BC_GROUND.far,R=F.x1-F.step,step=F.step,n=Math.round(2*R/step);
 const geo=new THREE.PlaneGeometry(2*R,2*R,n,n),p=geo.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=-p.getY(i),inNear=bcInNear(x,z,60);
  const h=bcBil(F,BC_FAR,x,z),gx=bcBil(F,BC_FAR,x+step,z)-bcBil(F,BC_FAR,x-step,z),gz=bcBil(F,BC_FAR,x,z+step)-bcBil(F,BC_FAR,x,z-step),sl=Math.hypot(gx,gz)/(2*step);
  p.setZ(i,h-(inNear?6:0));
  if(h<-1200)c.setRGB(.40,.44,.26);else if(h<0)c.setRGB(.50,.48,.32);else if(h<900)c.setRGB(.52,.50,.37);else if(h<1800)c.setRGB(.47,.44,.36);else c.setRGB(.40,.37,.34);   /* the Rift floor's savanna, the scarp, the rim's meadow, the volcano */
  if(sl>.25)c.lerp(new THREE.Color(.34,.30,.28),Math.min(1,(sl-.25)*2));
  col[3*i]=c.r;col[3*i+1]=c.g;col[3*i+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
 mesh.rotation.x=-Math.PI/2;mesh.userData.probeSkip=true;mesh.userData.lodSkip=true;mesh.name='far land';scene.add(mesh);return mesh;})();
window._worldMs=Math.round(performance.now()-BC_T0);
