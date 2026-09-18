// ---------- details: trees (every mapped tree, and parkway trees along residential streets where none are mapped), rooftop equipment and
// wooden water tanks, cars parked along residential streets and in the parking lots; all instanced in tiles and hidden with distance ----------
await stage('details');
// instances grouped into 700 m tiles with their own bounds; `far` hides a tile beyond that distance from the camera
function tiledInstances(geo,mat,far,cast){const tiles=new Map(),d=new THREE.Object3D();let n=0;
  return {get n(){return n;},
    add(x,y,z,ry,sx,sy,sz,cl){const k=Math.floor(x/700)+','+Math.floor(z/700);let t=tiles.get(k);if(!t){t={m:[],c:[],x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,y1:0};tiles.set(k,t);}
      d.position.set(x,y,z);d.rotation.set(0,ry||0,0);d.scale.set(sx,sy,sz);d.updateMatrix();for(const v of d.matrix.elements)t.m.push(v);if(cl)t.c.push(cl);
      t.x0=Math.min(t.x0,x);t.x1=Math.max(t.x1,x);t.z0=Math.min(t.z0,z);t.z1=Math.max(t.z1,z);t.y1=Math.max(t.y1,y+sy*2);n++;},
    build(){for(const t of tiles.values()){const cnt=t.m.length/16,g=new THREE.BufferGeometry();if(geo.index)g.setIndex(geo.index);for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);
        g.boundingSphere=new THREE.Sphere(new THREE.Vector3((t.x0+t.x1)/2,t.y1/2,(t.z0+t.z1)/2),Math.hypot(t.x1-t.x0,t.z1-t.z0,t.y1)/2+20);
        const im=new THREE.InstancedMesh(g,mat,cnt);im.instanceMatrix.array.set(t.m);if(t.c.length===cnt)t.c.forEach((c,i)=>im.setColorAt(i,c));
        im.castShadow=!!cast;im.receiveShadow=true;im.userData.far=far;FAR_MESHES.push(im);scene.add(im);}}};}
// is this spot clear of buildings, water and roads?
const clearAt=(x,z,pad)=>!inWater(x,z)&&!buildingsAt(x,z,pad).some(b=>inPoly(x,z,b.ring)||pad&&segNearRing(x,z,b.ring,pad))&&!roadsNear(x,z,0.5,r=>r.c!=='trail').length;
function segNearRing(x,z,ring,pad){for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];if(segDist(x,z,a[0],a[1],b[0],b[1])<pad)return true;}return false;}
section('trees',()=>{
  // one tree = a trunk and a crown in a single low-poly geometry
  const trunk=new THREE.CylinderGeometry(0.022,0.036,0.62,5).translate(0,0.31,0),   // the whole tree is scaled by its height, so a 12 m tree gets a trunk about 40 cm across
  crown=new THREE.IcosahedronGeometry(1,0).scale(0.42,0.38,0.42).translate(0,0.78,0);
  const merge=(a,b)=>{const pa=a.toNonIndexed(),pb=b.toNonIndexed(),g=new THREE.BufferGeometry(),n=pa.attributes.position.count,m=pb.attributes.position.count,pos=new Float32Array((n+m)*3),nor=new Float32Array((n+m)*3),colr=new Float32Array((n+m)*3);
    pos.set(pa.attributes.position.array);pos.set(pb.attributes.position.array,n*3);nor.set(pa.attributes.normal.array);nor.set(pb.attributes.normal.array,n*3);
    for(let i=0;i<n;i++)colr.set([0.36,0.26,0.18],i*3);for(let i=0;i<m;i++)colr.set([1,1,1],(n+i)*3);   // trunks brown; crowns take the instance colour
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(colr,3));return g;};
  const treeG=merge(trunk,crown),treeM=new THREE.MeshLambertMaterial({vertexColors:true});
  // instance colour multiplies the vertex colour, so trunks stay brown only if the instance colour is light: tint crowns with green, trunks darken slightly
  const T=tiledInstances(treeG,treeM,2600,true),greens=['#3f7a3a','#4f8a3a','#356a30','#5a8a44','#2f5f34','#6a8a3a'].map(col);
  const mapped=OSM.trees||[];const have=new Set();
  for(let i=0;i+1<mapped.length;i+=2){const x=mapped[i]/10,z=mapped[i+1]/10;if(!inMap(x,z,5)||inWater(x,z))continue;const hs=hash3(x,z,21),h=7+hs*9;T.add(x,0,z,hs*6,h,h,h,greens[Math.floor(hs*greens.length)]);have.add(Math.floor(x/20)+','+Math.floor(z/20));}
  // parkway trees: both sides of residential streets every 14 m where there is room and no mapped tree nearby
  let parkway=0;const R=mkRng(606);
  for(const r of ROADS){if(r.c!=='residential'&&r.c!=='tertiary')continue;let carry=7;
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.1)continue;const dx=(bx-ax)/L,dz=(bz-az)/L;
      for(let u=carry;u<L;u+=14){if((u<10&&i===0)||(i===r.pts.length-2&&L-u<10))continue;for(const sd of [-1,1]){if(R()<0.3)continue;const off=r.w/2+2.3,x=ax+dx*u-dz*sd*off,z=az+dz*u+dx*sd*off;
          if(!inMap(x,z,5)||have.has(Math.floor(x/20)+','+Math.floor(z/20))||!clearAt(x,z,1.5))continue;const hs=R(),h=8+hs*8;T.add(x,0,z,hs*6,h,h,h,greens[Math.floor(hs*greens.length)]);parkway++;}}
      carry=Math.max(0,14-((L-carry)%14));}}
  // woodland: Forest Park and the other wooded slopes carry their own trees, and parks get a scattering
  let forest=0;const DENSE={wood:11,reserve:13},OPEN={park:26,cemetery:30,garden:22,zoo:26,golf:34};
  for(const a of AREAS){const cell=DENSE[a.kind]||OPEN[a.kind];if(!cell)continue;const dense=!!DENSE[a.kind];
    for(let z=a.bb.z0;z<a.bb.z1;z+=cell)for(let x=a.bb.x0;x<a.bb.x1;x+=cell){
      const R2=hash3(x,z,31);if(R2>(dense?0.72:0.34))continue;
      const px=x+(hash3(x,z,32)-0.5)*cell*0.9,pz=z+(hash3(x,z,33)-0.5)*cell*0.9;
      if(!inRec(a,px,pz)||!inMap(px,pz,5)||inWater(px,pz))continue;
      if(have.has(Math.floor(px/20)+','+Math.floor(pz/20)))continue;
      if(buildingsAt(px,pz,2).some(b=>inPoly(px,pz,b.ring))||roadsNear(px,pz,1,r=>r.c!=='trail').length)continue;
      const hs=hash3(px,pz,34),h=dense?14+hs*16:8+hs*8;   // conifers on the wooded slopes are tall
      T.add(px,groundH(px,pz),pz,hs*6,h*(dense?0.72:1),h,h*(dense?0.72:1),greens[Math.floor(hs*greens.length)]);forest++;}}
  T.build();ctx.details=Object.assign(ctx.details||{},{mappedTrees:mapped.length/2,parkwayTrees:parkway,woodlandTrees:forest});
});
section('rooftops',()=>{
  const hvacM=new THREE.MeshLambertMaterial({color:0xb8b6b0}),tankM=new THREE.MeshLambertMaterial({color:0x6a4a34}),roofTankM=new THREE.MeshLambertMaterial({color:0x3a3430});
  const H=tiledInstances(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),hvacM,1600,true),K=tiledInstances(new THREE.CylinderGeometry(1,1,1,12).translate(0,0.5,0),tankM,2500,true),
        KR=tiledInstances(new THREE.ConeGeometry(1.15,1,12).translate(0,0.5,0),roofTankM,2500,false),KL=tiledInstances(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),hvacM,1600,false);
  for(const r of ROOFTOP){const n=Math.min(4,1+Math.floor(r.area/900));
    for(let k=0;k<n;k++){const x=r.x+(hash3(r.x,r.z,k)-0.5)*Math.sqrt(r.area)*0.5,z=r.z+(hash3(r.z,r.x,k)-0.5)*Math.sqrt(r.area)*0.5;if(!inPoly(x,z,r.ring))continue;
      const s=2+hash3(x,z,4)*3;H.add(x,r.h,z,hash3(x,z,5)*3,s,1.2+hash3(x,z,6)*1.5,s*0.7);}
    // a wooden water tank on its steel stand, on about one in six older brick buildings of four storeys or more
    if(r.brick&&r.h>=13&&r.h<=60&&r.hsh<0.16&&inPoly(r.x,r.z,r.ring)){KL.add(r.x,r.h,r.z,0,4.2,3,4.2);K.add(r.x,r.h+3,r.z,0,2.6,5,2.6);KR.add(r.x,r.h+8,r.z,0,1,1.6,1);}}
  H.build();K.build();KR.build();KL.build();ctx.details=Object.assign(ctx.details||{},{rooftopUnits:H.n,waterTanks:K.n});
});
section('parked-cars',()=>{
  const body=new THREE.BoxGeometry(4.5,1.0,1.9).translate(0,0.75,0),cabin=new THREE.BoxGeometry(2.4,0.7,1.7).translate(-0.2,1.6,0);
  const B1=tiledInstances(body,new THREE.MeshLambertMaterial({color:0xffffff}),1100,false),C1=tiledInstances(cabin,new THREE.MeshLambertMaterial({color:0x2a3440}),1100,false),c=new THREE.Color(),R=mkRng(4242);
  const car=(x,z,a)=>{B1.add(x,0,z,-a,1,1,1,c.setHSL(R(),R()<0.4?0.05:0.5,0.2+R()*0.55).clone());C1.add(x,0,z,-a,1,1,1);};
  // along both curbs of residential streets, clear of the corners
  for(const r of ROADS){if(r.c!=='residential'||r.len<40)continue;let carry=12;
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.1)continue;const dx=(bx-ax)/L,dz=(bz-az)/L,a=Math.atan2(dz,dx);
      for(let u=carry;u<L-12;u+=7){for(const sd of [-1,1]){if(R()<0.6)continue;const off=r.w/2-1.2,x=ax+dx*u-dz*sd*off,z=az+dz*u+dx*sd*off;if(!inMap(x,z,5)||inWater(x,z))continue;car(x,z,a);}}
      carry=12;}}
  // rows in the mapped surface parking lots (up to 80 a lot)
  let lots=0;for(const p of AREAS){if(p.kind!=='parking')continue;const w=p.bb.x1-p.bb.x0,dd=p.bb.z1-p.bb.z0;if(w*dd<300)continue;let k=0;
    for(let z=p.bb.z0+4;z<p.bb.z1-3&&k<80;z+=6.5)for(let x=p.bb.x0+2;x<p.bb.x1-2&&k<80;x+=2.8){if(R()<0.4||!inRec(p,x,z))continue;car(x,z,Math.PI/2);k++;}lots++;}
  B1.build();C1.build();ctx.details=Object.assign(ctx.details||{},{parkedResidential:B1.n,parkingLots:lots});
});
section('street-lines-lights',()=>{
  // a double yellow centre line on the arterials (hidden past 1.5 km)
  const lines=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-7,polygonOffsetUnits:-14}),{tile:1000,far:1500}),yl=col('#d8b840');
  const offset=(pts,o)=>pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [p[0]-dz/l*o,p[1]+dx/l*o];});
  for(const r of ROADS){if(!['trunk','primary','secondary'].includes(r.c)||deckY(r)>0)continue;for(const o of [-0.25,0.25])lines.ribbon(offset(r.pts,o),0.15,0.01,yl);}
  lines.build('centre lines');
  // street lights along every arterial, 35 m apart on both sides (the detailed areas already have theirs)
  const poleM=new THREE.MeshLambertMaterial({color:0x2e3134}),headM=new THREE.MeshLambertMaterial({color:0xe8e4d8,emissive:0x000000});
  const Pl=tiledInstances(new THREE.CylinderGeometry(0.12,0.16,1,5).translate(0,0.5,0),poleM,1800,false),Hd=tiledInstances(new THREE.BoxGeometry(1,1,1),headM,1800,false);
  for(const r of ROADS){if(!['trunk','primary','secondary','tertiary'].includes(r.c)||deckY(r)>0)continue;let carry=17;
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.1)continue;const dx=(bx-ax)/L,dz=(bz-az)/L;
      for(let u=carry;u<L;u+=35)for(const sd of [-1,1]){const x=ax+dx*u-dz*sd*(r.w/2+1.3),z=az+dz*u+dx*sd*(r.w/2+1.3);if(!inMap(x,z,5)||focusAt(x,z)||inWater(x,z))continue;
        Pl.add(x,0,z,0,1,9,1);Hd.add(x+dz*sd*1.6,8.6,z-dx*sd*1.6,-Math.atan2(dz,dx),1.2,0.35,0.5);}
      carry=Math.max(0,35-((L-carry)%35));}}
  Pl.build();Hd.build();animHooks.push(()=>{const w=nightF(hourCur);headM.emissive.setRGB(w,w*0.85,w*0.55);});
  ctx.details=Object.assign(ctx.details||{},{arterialLights:Pl.n});
});
