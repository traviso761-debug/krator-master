// ================================================================= DALAB CITY — the world: terrain, water, the lab, the mounds
// Runs after 90-scene (renderer/scene/camera/lights exist; the showcase block was skipped because window.CITY).
reseed(SEED_CITY+5);
const CITY_T0=performance.now();
scene.fog.density=.00013;
// the terrain: one plane, 8 m cells, the painted albedo (made at the END of 90b so the footprints are on it)
function cityTerrainMesh(){const N=Math.round(CITY.WORLD/8);const g=new THREE.PlaneGeometry(CITY.WORLD,CITY.WORLD,N,N);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const lx=p.getX(i),ly=p.getY(i);p.setZ(i,terrainH(lx,-ly));}
 g.computeVertexNormals();
 const tex=new THREE.CanvasTexture(gcv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=4;tex.minFilter=THREE.LinearMipmapLinearFilter;
 const m=new THREE.MeshStandardMaterial({map:tex,roughness:.96,metalness:0});
 groundM=new THREE.Mesh(g,m);groundM.rotation.x=-Math.PI/2;groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);
 window._terrainTex=tex;
 // the water: a strip down the river's course and a quad per channel segment, at WATER_Y (a world-wide plane just
 // under the ground z-fought the terrain at a distance)
 const geos=[];{const pts=[];for(let z=-CITY.WORLD/2;z<=CITY.WORLD/2;z+=60)pts.push([riverX(z),z]);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const g=new THREE.PlaneGeometry(150,Math.hypot(b[0]-a[0],b[1]-a[1])+2);g.rotateX(-Math.PI/2);g.rotateY(-Math.atan2(b[0]-a[0],b[1]-a[1]));g.translate((a[0]+b[0])/2,0,(a[1]+b[1])/2);geos.push(g);}
  for(const C of CHANNELS)for(let i=0;i<C.pts.length-1;i++){const a=C.pts[i],b=C.pts[i+1];const g=new THREE.PlaneGeometry(C.w*1.6,Math.hypot(b[0]-a[0],b[1]-a[1])+C.w);g.rotateX(-Math.PI/2);g.rotateY(-Math.atan2(b[0]-a[0],b[1]-a[1]));g.translate((a[0]+b[0])/2,0,(a[1]+b[1])/2);geos.push(g);}}
 const w=meshMerged(geos,new THREE.MeshStandardMaterial({color:0x2a5a52,roughness:.15,metalness:.2,transparent:true,opacity:.86,side:DS}),scene,0,WATER_Y,0);if(w){w.userData.probeSkip=true;w.name='water';}}
// ---------------------------------------------------------------- the Ancient lab, the High Priest's mound, the settlements' mounds
TSTAT.cur='dalab_lab/0';
placeDef('dalab_lab',{x:CITY.LAB.x,z:CITY.LAB.z,ry:0},{scale:CITY.LAB.scale,y:terrainH(CITY.LAB.x,CITY.LAB.z)-.4,landmark:'The Ancient lab',ignoreMask:true});
TSTAT.cur=null;
precinct(CITY.LAB.x,CITY.LAB.z,292*4.105*CITY.LAB.scale+30,'the lab');
placeDef('dalab_high_mound',{x:HIGH_MOUND.x,z:HIGH_MOUND.z,ry:HIGH_MOUND.ry},{y:terrainH(HIGH_MOUND.x,HIGH_MOUND.z),landmark:"High Priest's mound",ignoreMask:true,ignorePrecinct:true});
for(const S of SETTLE){const key=S.main?'dalab_palace_mound':'dalab_mound';const o={x:S.x,z:S.z,ry:S.face};
 placeDef(key,o,{y:terrainH(S.x,S.z),landmark:S.main?"High Priest's palace":S.name+' mound',ignoreMask:true,ignorePrecinct:true,settle:S.key});S.moundOBB=o;}
