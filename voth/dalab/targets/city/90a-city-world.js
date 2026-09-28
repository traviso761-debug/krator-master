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

// ---------------------------------------------------------------- the horizon: cleared fields and forest going to the horizon (the brief), under the Krator sky
// An annulus from the terrain's edge out to 9 km painted with fields, hedges and forest blocks, and a merged mesh of
// far-tree blobs in the forest belt. KratorSky (81, attached in 94) gives the giant, its rings, the sun, stars and moon.
(function horizon(){reseed(SEED_CITY+7);const R0=CITY.WORLD/2-40,R1=9000;
 const cv=document.createElement('canvas');cv.width=cv.height=1024;const g=cv.getContext('2d');const S=R1*2/1024,pxh=v=>(v+R1)/S;
 g.fillStyle='#3a4a26';g.fillRect(0,0,1024,1024);
 // clearings with fields: a few dozen discs of farmland with strip fields, more toward the map
 for(let i=0;i<70;i++){const a=rng()*TAU,r=rr(R0*.9,R1*.85),x=Math.cos(a)*r,z=Math.sin(a)*r,rad=rr(260,900);g.save();g.beginPath();g.arc(pxh(x),pxh(z),rad/S,0,7);g.clip();
  g.fillStyle='#7f9a4c';g.fillRect(0,0,1024,1024);const ry=rng()*TAU;for(let k=0;k<30;k++){const d=(k-15)*rad*.09;g.fillStyle=vPick(['#a08a3c','#8a9a38','#b89a48','#6f8a30','#c4a050','#7f9a44']);g.save();g.translate(pxh(x),pxh(z));g.rotate(ry);g.fillRect(d/S,-rad/S,rad*.07/S,rad*2/S);g.restore();}
  g.restore();}
 for(let i=0;i<3000;i++){g.fillStyle=vPick(['rgba(30,50,26,.5)','rgba(60,80,40,.4)','rgba(40,60,30,.5)']);g.beginPath();g.arc(rng()*1024,rng()*1024,rr(2,9),0,7);g.fill();}
 const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;
 const geo=new THREE.RingGeometry(R0,R1,96,1);geo.rotateX(-Math.PI/2);
 // the ring's UVs are polar; give it planar ones so the painting maps as a map
 {const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<pos.count;i++){uv.setXY(i,(pos.getX(i)+R1)/(2*R1),1-(pos.getZ(i)+R1)/(2*R1));}}
 const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,roughness:1,metalness:0}));m.position.y=terrainH(0,0)-.6;m.userData.probeSkip=true;m.name='horizon';scene.add(m);
 // far trees: blobs in the forest belt, one merged mesh
 const geos=[];const ico=new THREE.IcosahedronGeometry(1,0);for(let i=0;i<2600;i++){const a=rng()*TAU,r=rr(R0+60,R1*.7),x=Math.cos(a)*r,z=Math.sin(a)*r;const px=Math.floor(pxh(x)),pz=Math.floor(pxh(z));
  const d=g.getImageData(px,pz,1,1).data;if(d[1]>130&&d[0]>110)continue;   // not on a field
  const h=rr(14,30),w=rr(12,24);const gg=ico.clone();gg.scale(w,h,w);gg.translate(x,terrainH(0,0)-.6+h*.5,z);geos.push(gg);}
 const f=meshMerged(geos,new THREE.MeshStandardMaterial({color:vC(0x2e4a26),roughness:1,flatShading:true}),scene,0,0,0);if(f){f.userData.probeSkip=true;f.name='far forest';}
 window._horizon={trees:geos.length};})();
