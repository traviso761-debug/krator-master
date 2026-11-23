// ================================================================= XANADU'S WORKS — the sheet's world: the Krator sky, the ground, the lake
// Runs after 90-scene (renderer, scene, camera and lights exist; the showcase was skipped: window.CITY). The sheet is flat
// (terrainH is 0: the camps go on their regions' ground with W4): Kōlḍ-Lōḍ's half (west) in the tundra's grey-brown with the
// mill camp's stream, Opal Valley's half (east) on the pale opaline flats with the middle terrace's lake north of the landing.
// Each ground piece is registered with core/drawn (KDRAWN), so the audits measure the drawn ground. The camps' lanes and the
// roads between the camps are strips laid on it from the plan's records (89zw); nothing here places a building. [web]: three.js.
const XW_T0=performance.now();
camera.near=.5;camera.far=20000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Kirstabal's and Phēr's)
const XW_SKY={hour:10.5,day:200,dens:.62};   /* Kōlḍ-Lōḍ's air at 4,800 m: thin and clear */
const xwSkyGroup=KratorSky.attach(scene,12000);xwSkyGroup.traverse(o=>{o.userData.probeSkip=true;});
scene.fog.density=.00011;
const xwHemi=scene.children.find(o=>o.isHemisphereLight);
function xwSkyTick(){KratorSky.update(camera.position,XW_SKY.hour,XW_SKY.day,XW_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(xwHemi)xwHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(xwSkyTick);xwSkyTick();
// ---------------------------------------------------------------- the ground: three flat pieces, each registered with core/drawn
const XW_GROUND=[];
function xwGround(name,x0,z0,x1,z1,col,label){const n=Math.max(1,Math.round((x1-x0)/100)),m=Math.max(1,Math.round((z1-z0)/100));
 const g=new THREE.PlaneGeometry(x1-x0,z1-z0,n,m),c=new THREE.Color(col).convertSRGBToLinear(),cols=new Float32Array(g.attributes.position.count*3),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+(x0+x1)/2,z=-p.getY(i)+(z0+z1)/2,k=.92+.08*Math.sin(x*.013+z*.007)*Math.sin(z*.011-x*.004);cols[i*3]=c.r*k;cols[i*3+1]=c.g*k;cols[i*3+2]=c.b*k;}
 g.setAttribute('color',new THREE.BufferAttribute(cols,3));
 const M=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,metalness:0}));M.rotation.x=-Math.PI/2;M.position.set((x0+x1)/2,0,(z0+z1)/2);
 M.name=name;M.userData.isGround=true;M.userData.probeSkip=true;M.userData.inspectLabel=label;M.receiveShadow=true;scene.add(M);XW_GROUND.push(M);
 if(typeof KDRAWN!=='undefined'){const hs=[];for(let j=0;j<=m;j++)for(let i=0;i<=n;i++)hs.push(0);KDRAWN.add(KDRAWN.grid({x0,z0,dx:(x1-x0)/n,dz:(z1-z0)/m,nx:n,nz:m,h:hs}));}
 return M;}
xwGround('terrain:kold-lod',-2600,-2400,0,2400,0x8a8272,'Kōlḍ-Lōḍ\'s ground: the tundra\'s fell-field (the sheet: flat, W4 puts it on the lode\'s ridge)');
xwGround('terrain:opal',0,-2400,2600,880,0xc8c0ae,'Opal Valley\'s ground: the pale sinter flats of the potch line');
xwGround('terrain:far',-6000,-6000,6000,6000,0x9a9282,'beyond the sheet').position.y=-.35;
// ---------------------------------------------------------------- the middle terrace's lake north of the landing, its bank
{const lake=new THREE.Mesh(new THREE.PlaneGeometry(2600,4000),new THREE.MeshStandardMaterial({color:0x3d6f7c,roughness:.12,metalness:.25,transparent:true,opacity:.92}));
 lake.rotation.x=-Math.PI/2;lake.position.set(1300,XW.LAKE,880+2000);lake.name='the middle terrace\'s lake (Opal Valley)';lake.userData.probeSkip=true;scene.add(lake);
 const bed=new THREE.Mesh(new THREE.PlaneGeometry(2600,4000),new THREE.MeshStandardMaterial({color:0x4a5048,roughness:1}));bed.rotation.x=-Math.PI/2;
 bed.position.set(1300,XW.LAKE-3,880+2000);bed.userData.probeSkip=true;bed.name='the lake bed';scene.add(bed);
 const bank=new THREE.Mesh(new THREE.BoxGeometry(2600,3.4,1.2),new THREE.MeshStandardMaterial({color:0x9a917e,roughness:1}));bank.position.set(1300,-1.7,880.6);
 bank.userData.probeSkip=true;bank.name='the lake\'s bank';scene.add(bank);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.grid({x0:0,z0:881,dx:2600,dz:3999,nx:1,nz:1,h:[XW.LAKE-3,XW.LAKE-3,XW.LAKE-3,XW.LAKE-3]}));}
// ---------------------------------------------------------------- strips on the ground: the camps' lanes, the roads, the stream
const xwStripMat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.95,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
function xwStrip(pts,w,mat,y,name){const pos=[],idx=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;
  pos.push(pts[i][0]+nx,y,pts[i][1]+nz,pts[i][0]-nx,y,pts[i][1]-nz);if(i)idx.push(2*i-2,2*i-1,2*i,2*i-1,2*i+1,2*i);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const M=new THREE.Mesh(g,mat);M.name=name;M.userData.probeSkip=true;M.receiveShadow=true;scene.add(M);return M;}
if(XW_PLAN){const lane=xwStripMat(0x7a6e5c),road=xwStripMat(0x6e6452),yard=xwStripMat(0x938672),water=new THREE.MeshStandardMaterial({color:0x4a7f8a,roughness:.1,metalness:.2});
 for(const C of XW_PLAN.camps){for(const l of C.lanes)xwStrip(l.pts,l.w||6,lane,.04,'lane '+l.id);
  if(C.green){const G=C.green,M=new THREE.Mesh(new THREE.PlaneGeometry(G.w,G.d),yard);M.rotation.set(-Math.PI/2,0,G.ry);M.position.set(G.x,.03,G.z);M.userData.probeSkip=true;M.name='the camp\'s yard '+C.id;scene.add(M);}}
 /* the ore road from the adit camp down to the mill camp (Kōlḍ-Lōḍ's road.sw-gold leaves the mill camp for Strongwall, 50 km
    south), the diggings' cart road to the landing; and the stream the mill's wheels take */
 const S=id=>XW_PLAN.camps.find(c=>c.id===id).site||{x:0,z:0};
 xwStrip([[S('kold-lod.adit').x,S('kold-lod.adit').z],[S('kold-lod.mill').x,S('kold-lod.mill').z],[S('kold-lod.mill').x,2400]],7,road,.035,'the ore road (Kōlḍ-Lōḍ, to Strongwall)');
 xwStrip([[S('opal.diggings').x,S('opal.diggings').z],[S('opal.landing').x,S('opal.landing').z]],6,road,.035,'the diggings\' cart road to the landing');
 const sx=XW.CAMPS[1].stream,sp=[];for(let z=-2400;z<=2400;z+=40)sp.push([sx+18*Math.sin(z*.004),z]);xwStrip(sp,9,water,.06,'the mill camp\'s stream (from the tarn under the lode)');}
window._xwWorldMs=Math.round(performance.now()-XW_T0);
