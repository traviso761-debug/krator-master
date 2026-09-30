// ================================================================= EREWHON — the world: terrain, the lake, the stream, the Krator sky, the walls and gates
// Runs after 90-scene (renderer/scene/camera/lights exist; the showcase block was skipped because window.CITY).
reseed(SEED_ER+5);const ER_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
const ERSKY={hour:16.2,day:200,dens:1.4};
// ---------------------------------------------------------------- terrain mesh (built at the END of 90b, once every plot is levelled) and its water
function erTerrainMesh(){const cell=4,NX=Math.round(ER.W/cell),NZ=Math.round(ER.H/cell);const g=new THREE.PlaneGeometry(ER.W,ER.H,NX,NZ);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const lx=p.getX(i),ly=p.getY(i);p.setZ(i,terrainH(lx,-ly));}g.computeVertexNormals();
 const tex=new THREE.CanvasTexture(gcv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=4;tex.minFilter=THREE.LinearMipmapLinearFilter;
 const m=new THREE.MeshStandardMaterial({map:tex,roughness:.96,metalness:0});groundM=new THREE.Mesh(g,m);groundM.rotation.x=-Math.PI/2;groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);window._terrainTex=tex;
 // beyond the map: a dark apron of far ground so the edges do not fall into the void
 const ap=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshStandardMaterial({color:0x4a5a3a,roughness:1}));ap.rotation.x=-Math.PI/2;ap.position.y=-2;ap.userData.probeSkip=true;scene.add(ap);}
function erWater(){const LK=new THREE.Color().setHSL(XANADU_LAKE.hue,.6,.42);const w=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshStandardMaterial({color:LK,roughness:.12,metalness:.25,transparent:true,opacity:.86}));
 w.rotation.x=-Math.PI/2;w.position.y=ER.LAKE;w.material.polygonOffset=true;w.material.polygonOffsetFactor=-1;w.material.polygonOffsetUnits=-2;w.userData.probeSkip=true;w.name='lake';scene.add(w);
 // the stream: a ribbon along its line, a metre and a half under the bank's grade (the channel is cut 3 m into the height field)
 // the stream rises in the Caves of Ice: its head runs into the cave mouth at the cave's floor, then drops into its channel
 const cave=PLAN.find(p=>p.key==='xa_ice_cave');
 const pos=[],idx=[];let vi=0;for(const P0 of ER_LINES.stream){let P=P0;if(cave){const e0=P[0],e1=P[P.length-1];const d0=Math.hypot(e0[0]-cave.x,e0[1]-cave.z),d1=Math.hypot(e1[0]-cave.x,e1[1]-cave.z);
   if(Math.min(d0,d1)<60){const m=[cave.x-Math.sin(cave.ry)*6,cave.z-Math.cos(cave.ry)*6];P=d0<d1?[m].concat(P):P.concat([m]);}}   // into the mouth (local +z of the cave)
  for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;const nx=-dz/l*3,nz=dx/l*3;
   let y=terrainH(P[i][0],P[i][1])+1.4;if(cave){const dc=Math.hypot(P[i][0]-cave.x,P[i][1]-cave.z);if(dc<70){const k=smoothstep(30,70,dc);y=(cave.y+.02)*(1-k)+y*k;}}pos.push(P[i][0]+nx,y,P[i][1]+nz,P[i][0]-nx,y,P[i][1]-nz);if(i>0){const k=vi+2*i;idx.push(k-2,k,k-1,k-1,k,k+1);}}vi+=2*P.length;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const s=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x2aa0b8,roughness:.1,metalness:.2,transparent:true,opacity:.9,side:THREE.DoubleSide}));s.userData.probeSkip=true;s.name='stream';scene.add(s);}
// ---------------------------------------------------------------- the Krator sky and its lighting
KratorSky.attach(scene,6000);scene.fog.density=.00026;
const erHemi=scene.children.find(o=>o.isHemisphereLight);
function erSkyTick(){KratorSky.update(camera.position,ERSKY.hour,ERSKY.day,ERSKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(erHemi)erHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);
 if(typeof BIO!=='undefined'&&BIO.host)BIO.setSun([L.sunDir.x,L.sunDir.y,L.sunDir.z]);}
FRAME_HOOKS.push(erSkyTick);erSkyTick();
// ---------------------------------------------------------------- the walls: the map's red lines as battered curtain walls that step with the ground, a walk and merlons on top
function erWallSeg(a,b,h){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<1)return;const n=Math.max(1,Math.ceil(L/14));const c=xC(xPick(XPAL.stone));
 for(let k=0;k<n;k++){const p=[a[0]+dx*k/n,a[1]+dz*k/n],q=[a[0]+dx*(k+1)/n,a[1]+dz*(k+1)/n];const y0=Math.min(terrainH(p[0],p[1]),terrainH(q[0],q[1]))-3,y1=Math.max(terrainH(p[0],p[1]),terrainH(q[0],q[1]))+h;
  const m=[(p[0]+q[0])/2,(p[1]+q[1])/2],ry=Math.atan2(q[0]-p[0],q[1]-p[1])-Math.PI/2,sl=Math.hypot(q[0]-p[0],q[1]-p[1])+.6;
  kput('xWallD',[m[0],y0,m[1]],qEuler(0,ry,0),[sl,y1-y0,3.4],c);vB('vStone',m[0],y1-.1,m[1],sl*.98,.14,3.2,ry,c.clone().multiplyScalar(1.06));
  const mn=Math.max(1,Math.round(sl/1.5));for(let i=0;i<=mn;i++)for(const s of[-1,1]){const pp=loc(m[0],m[1],-sl*.98/2+sl*.98*i/mn,s*1.4,ry);vB('vStone',pp[0],y1,pp[1],.6,1.2,.5,ry,c);}
  if(k%4===0){vPst('xDrumS',p[0],y0,p[1],2.6,y1-y0+2.4,c);kput('xConeT',[p[0],y1+2.4,p[1]],null,[3,2.2,3],xC(xPick(XPAL.tile)));}}}
TSTAT.cur='er_wall/0';
for(const Wl of ER_LINES.wall)for(let i=0;i<Wl.length-1;i++){const a=Wl[i],b=Wl[i+1];if(GATES.some(g=>Math.hypot((a[0]+b[0])/2-g.x,(a[1]+b[1])/2-g.z)<18))continue;erWallSeg(a,b,8);
 cstroke(mg,[a,b],8,'#000');const mm=[(a[0]+b[0])/2,(a[1]+b[1])/2];BIO_OBSTACLES.push({x:mm[0],z:mm[1],r:Math.hypot(b[0]-a[0],b[1]-a[1])/2+4});}
REG.push({name:'The city walls',x:PAL.x,y:terrainH(PAL.x,PAL.z),z:PAL.z+PAL.r,r:20,h:12,cls:'building',key:'er_wall',tags:{culture:'xanadu',type:['military'],wealth:'civic',lit:false}});
TSTAT.cur=null;
window._worldMs=Math.round(performance.now()-ER_T0);
