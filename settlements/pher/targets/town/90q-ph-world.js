// ================================================================= PHĒR — the world: the Krator sky, the painted ground, the lake
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). The near
// ground (the town's two levels and the wall between) is a mesh at 10 m cells wearing a canvas painted from the plan's
// records: the strand's sand, the wall's grass, the rim's fields, the stream, every way at its width, the fair ground. The
// far ground is a coarse mesh coloured by height and slope out to the caldera's rim; the lake is a plane at its level (y 0).
// Nothing reads the canvas back (placement is the plan's, never the paint's). [web]: canvas and three.js.
reseed(PH.SEED+1);const PH_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Qiblai's and Erewhon's)
const PH_SKY={hour:9.2,day:120,dens:1.1};
KratorSky.attach(scene,9000);scene.fog.density=.00016;
const phHemi=scene.children.find(o=>o.isHemisphereLight);
function phSkyTick(){KratorSky.update(camera.position,PH_SKY.hour,PH_SKY.day,PH_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(phHemi)phHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(phSkyTick);phSkyTick();
// ---------------------------------------------------------------- the near ground's extent and its painted canvas
const PHG={x0:-1300,x1:1500,z0:PH.UP[1]-650,z1:1500};PHG.W=PHG.x1-PHG.x0;PHG.H=PHG.z1-PHG.z0;
const PHG_PX=4096/Math.max(PHG.W,PHG.H),pgx=x=>(x-PHG.x0)*PHG_PX,pgz=z=>(z-PHG.z0)*PHG_PX;
const phCv=document.createElement('canvas');phCv.width=Math.ceil(PHG.W*PHG_PX);phCv.height=Math.ceil(PHG.H*PHG_PX);
(function phPaint(){const g=phCv.getContext('2d'),W=phCv.width,H=phCv.height,img=g.createImageData(W,H),D=img.data;
 // the ground's colour by place: lake bed, wet sand, the strand's sand, grass on the wall, the rim's tilled plain; darker on steep ground
 const col=(x,z)=>{const y=phH(x,z),e=6,s=Math.hypot(phH(x+e,z)-phH(x-e,z),phH(x,z+e)-phH(x,z-e))/(2*e),d=phShoreZ(x)-z;
  if(y<-.2)return[86,104,96];if(y<1.6)return[176,160,128];
  let c=d<0?(y<4?[176,160,128]:[100,112,72]):d<PH.WALL.strand*.8?[170,152,118]:d<PH.WALL.top?[96,116,66]:[118,124,74];   /* the headland and the point (land out in the lake): a beach at the water, grass on top */
  if(d>PH.WALL.top+200){const f=(Math.floor((x+4000)/90)+Math.floor((z+8000)/70))%3;c=f===0?[132,120,84]:f===1?[122,128,76]:[110,122,70];}
  const r=Math.min(1,Math.max(0,(s-.25)/.35));return[c[0]+(118-c[0])*r,c[1]+(108-c[1])*r,c[2]+(94-c[2])*r];};
 for(let j=0;j<H;j+=2)for(let i=0;i<W;i+=2){const c=col(PHG.x0+(i+1)/PHG_PX,PHG.z0+(j+1)/PHG_PX);
  for(const [a,b] of[[0,0],[1,0],[0,1],[1,1]]){if(i+a>=W||j+b>=H)continue;const k=((j+b)*W+i+a)*4;D[k]=c[0];D[k+1]=c[1];D[k+2]=c[2];D[k+3]=255;}}
 g.putImageData(img,0,0);
 const line=(P,w,closed)=>{g.lineWidth=w*PHG_PX;g.beginPath();P.forEach((p,i)=>i?g.lineTo(pgx(p[0]),pgz(p[1])):g.moveTo(pgx(p[0]),pgz(p[1])));if(closed)g.closePath();g.stroke();};
 g.lineCap='round';g.lineJoin='round';
 // the stream: its water down the channel to the cove
 g.strokeStyle='#3f6f78';const SP=[];for(let z=phShoreZ(PH.COVE.x)+4;z>=PHG.z0;z-=10)SP.push([phStreamX(z),z]);line(SP,7);
 // the fair ground (packed earth), the ways at their widths: the avenues in ashlar, the streets and lanes in cobbles
 const F=PH_FAIR,U=PH.UP;g.fillStyle='#a69a84';g.fillRect(pgx(U[0]-F.hw),pgz(U[1]-F.hd),2*F.hw*PHG_PX,2*F.hd*PHG_PX);
 for(const w of PH.ways){g.strokeStyle=w.cls==='avenue'?'#a8a194':w.cls==='main'?'#9b9386':'#8f887b';line(w.pts,w.w,w.closed);}
 // a dooryard of trodden earth under every building, a shade darker than the ground
 g.fillStyle='rgba(92,80,64,.35)';for(const p of PH_PLACE){const b=p.bo,c=Math.cos(p.ry),s=Math.sin(p.ry),hw=b.hw+2,hd=b.hd+2;
  g.beginPath();[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].forEach((q,i)=>{const x=p.x+q[0]*c+q[1]*s,z=p.z-q[0]*s+q[1]*c;i?g.lineTo(pgx(x),pgz(z)):g.moveTo(pgx(x),pgz(z));});g.closePath();g.fill();}})();
// ---------------------------------------------------------------- the meshes: the near ground, the far ground, the lake
(function phTerrain(){const cell=10,NX=Math.round(PHG.W/cell),NZ=Math.round(PHG.H/cell),geo=new THREE.PlaneGeometry(PHG.W,PHG.H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(PHG.x0+PHG.x1)/2,cz=(PHG.z0+PHG.z1)/2;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;p.setZ(i,phH(x,z));uv.setXY(i,pgx(x)/phCv.width,1-pgz(z)/phCv.height);}
 geo.computeVertexNormals();const tex=new THREE.CanvasTexture(phCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 groundM=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0}));groundM.rotation.x=-Math.PI/2;groundM.position.set(cx,0,cz);
 groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);
 // the far ground: 80 m cells over the caldera's north side, coloured by height and slope, a metre under the near mesh where they meet
 const F={x0:-14000,x1:14000,z0:-16000,z1:9000},fc=80,fx=Math.round((F.x1-F.x0)/fc),fz=Math.round((F.z1-F.z0)/fc),fg=new THREE.PlaneGeometry(F.x1-F.x0,F.z1-F.z0,fx,fz);
 const fp=fg.attributes.position,fcx=(F.x0+F.x1)/2,fcz=(F.z0+F.z1)/2,cols=new Float32Array(fp.count*3),lin=c=>Math.pow(c/255,2.2);
 for(let i=0;i<fp.count;i++){const x=fp.getX(i)+fcx,z=-fp.getY(i)+fcz,inNear=x>PHG.x0+20&&x<PHG.x1-20&&z>PHG.z0+20&&z<PHG.z1-20,y=phH(x,z)-(inNear?3:0);fp.setZ(i,y);
  const s=Math.abs(phH(x,z-40)-phH(x,z+40))/80,c=y<0?[86,104,96]:s>.2?[112,108,92]:y<30?[164,150,118]:y<520?[92,112,62]:[116,122,72];
  cols[i*3]=lin(c[0]);cols[i*3+1]=lin(c[1]);cols[i*3+2]=lin(c[2]);}
 fg.setAttribute('color',new THREE.BufferAttribute(cols,3));fg.computeVertexNormals();
 const far=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));far.rotation.x=-Math.PI/2;far.position.set(fcx,0,fcz);
 far.userData.probeSkip=true;far.name='far ground';scene.add(far);
 // the lake at its level: one plane to the horizon
 const lake=new THREE.Mesh(new THREE.PlaneGeometry(60000,60000),new THREE.MeshStandardMaterial({color:0x3d7480,roughness:.1,metalness:.3,transparent:true,opacity:.9}));
 lake.rotation.x=-Math.PI/2;lake.position.set(0,PH.LAKE,20000);lake.userData.probeSkip=true;lake.name='Erewhon\'s lake';scene.add(lake);})();
window._worldMs=Math.round(performance.now()-PH_T0);
