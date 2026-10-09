// ---------- details: trees (every mapped tree, and parkway trees along residential streets where none are mapped), rooftop equipment and
// wooden water tanks, cars parked along residential streets and in the parking lots; all instanced in tiles and hidden with distance ----------
await stage('details');
// instances grouped into 700 m tiles with their own bounds; `far` hides a tile beyond that distance from the camera
function tiledInstances(geo,mat,far,cast){const tiles=new Map(),d=new THREE.Object3D();let n=0;
  return {get n(){return n;},
    add(x,y,z,ry,sx,sy,sz,cl){const k=Math.floor(x/(700*WORLD))+','+Math.floor(z/(700*WORLD));let t=tiles.get(k);if(!t){t={m:[],c:[],x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,y1:0};tiles.set(k,t);}
      d.position.set(x,y,z);d.rotation.set(0,ry||0,0);d.scale.set(sx,sy,sz);d.updateMatrix();for(const v of d.matrix.elements)t.m.push(v);if(cl)t.c.push(cl);
      t.x0=Math.min(t.x0,x);t.x1=Math.max(t.x1,x);t.z0=Math.min(t.z0,z);t.z1=Math.max(t.z1,z);t.y1=Math.max(t.y1,y+sy*2);n++;},
    build(){for(const t of tiles.values()){const cnt=t.m.length/16,g=new THREE.BufferGeometry();if(geo.index)g.setIndex(geo.index);for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);
        g.boundingSphere=new THREE.Sphere(new THREE.Vector3((t.x0+t.x1)/2,t.y1/2,(t.z0+t.z1)/2),Math.hypot(t.x1-t.x0,t.z1-t.z0,t.y1)/2+20);
        const im=new THREE.InstancedMesh(g,mat,cnt);im.instanceMatrix.array.set(t.m);if(t.c.length===cnt)t.c.forEach((c,i)=>im.setColorAt(i,c));
        im.castShadow=!!cast;im.receiveShadow=true;im.userData.far=far;if(C.instanceCulling)im.frustumCulled=true;   // a city may have its tiles culled by their own bounds (an InstancedMesh is not, by default)
        FAR_MESHES.push(im);scene.add(im);}}};}
// is this spot clear of buildings, water and roads?
const clearAt=(x,z,pad)=>!inWater(x,z)&&!buildingsAt(x,z,pad).some(b=>inPoly(x,z,b.ring)||pad&&segNearRing(x,z,b.ring,pad))&&!roadsNear(x,z,0.5,r=>r.c!=='trail').length;
function segNearRing(x,z,ring,pad){for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];if(segDist(x,z,a[0],a[1],b[0],b[1])<pad)return true;}return false;}
// ---------- tree species (C.treeSpecies, opt-in) ----------
// A city may plant its own trees instead of the one generic shape: a list of species, each a shape, its bark, its
// foliage colours, a height range, and a weight in each place trees go (street: the parkway strips and mapped street
// trees; park: parks, gardens, cemeteries; wood: the wooded slopes). The shapes, each one unit high:
//   fir      a narrow spire of stacked cones (Douglas fir, hemlock)
//   cedar    a broader cone of drooping tiers (western red cedar)
//   round    a broad round crown of three lobes (maples, London plane, linden)
//   oval     an upright egg narrowing to a point (sweetgum, pin oak, hornbeam)
//   oak      a wide, irregular crown low on a short thick trunk (Oregon white oak)
//   slender  a narrow oval on a long pale trunk (red alder, birch)
//   small    a low dome on a short trunk (flowering plum and cherry, dogwood)
//   umbrella a flat, wide canopy high on a long bare trunk (the stone pine of Rome)
//   column   a tall dark column, closed and pointed (the Italian cypress)
// The instance colour tints the crown only (the trunk keeps its bark): crownF in the vertex colour pass.
function treeSpeciesKit(){
  const parts=[];const lobe=(r,sx,sy,sz,x,y,z,det=0)=>new THREE.IcosahedronGeometry(r,det).scale(sx,sy,sz).translate(x,y,z);
  const cone=(r,h,y)=>new THREE.ConeGeometry(r,h,6,1).translate(0,y+h/2,0);
  const SHAPES={
    fir:()=>({trunk:[0.016,0.03,0.5],crown:[cone(0.17,0.34,0.14),cone(0.14,0.32,0.36),cone(0.105,0.28,0.56),cone(0.07,0.24,0.76)]}),
    cedar:()=>({trunk:[0.016,0.03,0.3],crown:[cone(0.27,0.42,0.06),cone(0.21,0.38,0.34),cone(0.14,0.34,0.6)]}),
    round:()=>({trunk:[0.016,0.026,0.5],crown:[lobe(0.3,1,0.85,1,0,0.62,0),lobe(0.22,1,0.9,1,0.2,0.56,0.08),lobe(0.22,1,0.9,1,-0.16,0.6,-0.14),lobe(0.2,1,0.9,1,0.02,0.8,0.05)]}),
    oval:()=>({trunk:[0.014,0.022,0.4],crown:[lobe(0.24,1,1.55,1,0,0.58,0),lobe(0.14,1,1.3,1,0,0.86,0)]}),
    oak:()=>({trunk:[0.028,0.045,0.42],crown:[lobe(0.3,1.15,0.6,1,0,0.66,0),lobe(0.24,1,0.7,1,0.3,0.6,0.12),lobe(0.22,1,0.7,1,-0.3,0.62,-0.1),lobe(0.2,1,0.7,1,0.06,0.62,0.32),lobe(0.2,1,0.7,1,-0.05,0.78,-0.25)]}),
    slender:()=>({trunk:[0.018,0.028,0.72],crown:[lobe(0.17,1,1.9,1,0,0.66,0),lobe(0.11,1,1.5,1,0.07,0.86,0.03)]}),
    umbrella:()=>({trunk:[0.011,0.019,0.84],crown:[lobe(0.3,1.55,0.32,1.55,0,0.88,0),lobe(0.22,1.4,0.36,1.4,0.26,0.86,0.12),lobe(0.2,1.4,0.36,1.4,-0.26,0.87,-0.14),lobe(0.18,1.3,0.36,1.3,0.06,0.94,0.24),lobe(0.17,1.3,0.36,1.3,-0.1,0.93,-0.27)]}),
    column:()=>({trunk:[0.012,0.02,0.1],crown:[lobe(0.1,1,4.4,1,0,0.48,0),lobe(0.075,1,2.4,1,0,0.8,0)]}),
    small:()=>({trunk:[0.022,0.034,0.42],crown:[lobe(0.34,1,0.62,1,0,0.62,0),lobe(0.24,1,0.7,1,0.22,0.6,0.1),lobe(0.24,1,0.7,1,-0.2,0.62,-0.1)]})};
  // one geometry: the trunk in its bark, the crown white (the instance tints it) and a shade darker underneath
  const build=(shape,bark)=>{const S=SHAPES[shape](),[r0,r1,th]=S.trunk,geos=[new THREE.CylinderGeometry(r0,r1,th,5).translate(0,th/2,0),...S.crown].map(g=>g.toNonIndexed());
    let n=0;for(const g of geos)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),colr=new Float32Array(n*3),cf=new Float32Array(n);
    const bc=new THREE.Color(bark);let o=0;let y0=1e9,y1=-1e9;for(const g of geos.slice(1)){const a=g.attributes.position.array;for(let i=1;i<a.length;i+=3){y0=Math.min(y0,a[i]);y1=Math.max(y1,a[i]);}}
    geos.forEach((g,gi)=>{const a=g.attributes.position.array,m=g.attributes.position.count;pos.set(a,o*3);nor.set(g.attributes.normal.array,o*3);
      for(let i=0;i<m;i++){if(gi===0){colr.set([bc.r,bc.g,bc.b],(o+i)*3);cf[o+i]=0;}else{const k=0.72+0.28*(a[i*3+1]-y0)/Math.max(1e-3,y1-y0);colr.set([k,k,k],(o+i)*3);cf[o+i]=1;}}o+=m;});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(colr,3));g.setAttribute('crownF',new THREE.BufferAttribute(cf,1));return g;};
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});
  mat.onBeforeCompile=sh=>{sh.vertexShader='attribute float crownF;\n'+sh.vertexShader.replace('#include <color_vertex>',
    '#if defined(USE_COLOR)||defined(USE_INSTANCING_COLOR)\nvColor=vec3(1.0);\n#endif\n#ifdef USE_COLOR\nvColor*=color;\n#endif\n#ifdef USE_INSTANCING_COLOR\nvColor.xyz*=mix(vec3(1.0),instanceColor.xyz,crownF);\n#endif');};
  return {build,mat};}
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
  // A city can set its own foliage. The default is a northern summer; Rivendell is always drawn in autumn and
// the gold is most of what makes it that place rather than a wooded gorge with sheds in it.
const T=tiledInstances(treeG,treeM,(C.treeFar||2600)*WORLD,true),   // C.treeFar: how far the trees are drawn
  
      greens=(C.treeColours||['#3f7a3a','#4f8a3a','#356a30','#5a8a44','#2f5f34','#6a8a3a']).map(col);
  // the species, when the city has them: one instance set each, and add(place, ...) picks one by its weights
  let plant=null;const SPC={};
  if(C.treeSpecies){const kit=treeSpeciesKit(),list=C.treeSpecies.map(sp=>({...sp,T:tiledInstances(kit.build(sp.shape,sp.bark||'#4a3a2c'),kit.mat,(C.treeFar||2600)*WORLD,true),cols:(sp.colours||['#3f6a34']).map(col),n:0}));
    const pick=(place,u)=>{let tot=0;for(const sp of list)tot+=(sp.weight&&sp.weight[place])||0;let a=u*tot;for(const sp of list){a-=(sp.weight&&sp.weight[place])||0;if(a<=0&&(sp.weight&&sp.weight[place]))return sp;}return null;};
    plant=(place,x,y,z,u,v)=>{const sp=pick(place,u);if(!sp)return;const [h0,h1]=sp.height||[8,16],h=(h0+(h1-h0)*v)*WORLD,w=h*(0.88+0.24*((u*7.3)%1));
      sp.T.add(x,y,z,v*6.28,w,h,w,sp.cols[Math.floor(((u*13.7)%1)*sp.cols.length)]);sp.n++;};
    plant.build=()=>{for(const sp of list){sp.T.build();SPC[sp.name||sp.shape]=sp.n;}};}
  // C.treeKeepOut: [[lat, lon, radius m], ...], places kept clear of trees (a view that must stay open)
  const KEEP=(C.treeKeepOut||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r*WORLD];}),kept=(x,z)=>KEEP.some(([kx,kz,r])=>(x-kx)**2+(z-kz)**2<r*r);
  const mapped=OSM.trees||[];const have=new Set();
  for(let i=0;i+1<mapped.length;i+=2){const x=mapped[i]/10,z=mapped[i+1]/10;if(!inMap(x,z,5)||inWater(x,z)||kept(x,z))continue;const hs=hash3(x,z,21),h=7+hs*9;if(plant)plant('street',x,groundH(x,z),z,hs,hash3(x,z,22));else T.add(x,groundH(x,z),z,hs*6,h,h,h,greens[Math.floor(hs*greens.length)]);have.add(Math.floor(x/20)+','+Math.floor(z/20));}
  // parkway trees: both sides of residential streets every 14 m where there is room and no mapped tree nearby.
  // A city with few street trees (Vashrin) sets streetTrees to a fraction, or 0 for none.
  let parkway=0;const R=mkRng(606),STREET_TREES=C.streetTrees===undefined?1:C.streetTrees;
  for(const r of ROADS){if(!STREET_TREES||(r.c!=='residential'&&r.c!=='tertiary'))continue;let carry=7;
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.1)continue;const dx=(bx-ax)/L,dz=(bz-az)/L;
      const TSTEP=14*WORLD;for(let u=carry;u<L;u+=TSTEP){if((u<10&&i===0)||(i===r.pts.length-2&&L-u<10))continue;for(const sd of [-1,1]){if(R()<1-0.7*STREET_TREES)continue;const off=r.w/2+2.3,x=ax+dx*u-dz*sd*off,z=az+dz*u+dx*sd*off;
          if(!inMap(x,z,5)||kept(x,z)||have.has(Math.floor(x/20)+','+Math.floor(z/20))||!clearAt(x,z,1.5))continue;const hs=R(),h=8+hs*8;if(plant)plant('street',x,groundH(x,z),z,hs,R());else T.add(x,groundH(x,z),z,hs*6,h,h,h,greens[Math.floor(hs*greens.length)]);parkway++;}}
      carry=Math.max(0,TSTEP-((L-carry)%TSTEP));}}
  // woodland: Forest Park and the other wooded slopes carry their own trees, and parks get a scattering
  // a city may space them its own way (C.treeCells: {kind: metres, 0 for none}) and leave small areas bare
  // (C.treeMinArea: {kind: square metres}: Edinburgh maps every back green as a garden)
  let forest=0;const DENSE={wood:11,reserve:13},OPEN=Object.assign({park:26,cemetery:30,garden:22,zoo:26,golf:34},C.treeCells||{}),MINA=C.treeMinArea||{};
  for(const a of AREAS){const cell=(DENSE[a.kind]||OPEN[a.kind])*WORLD;if(!cell)continue;const dense=!!DENSE[a.kind];
    if(MINA[a.kind]&&(a.bb.x1-a.bb.x0)*(a.bb.z1-a.bb.z0)<MINA[a.kind]*WORLD*WORLD)continue;
    for(let z=a.bb.z0;z<a.bb.z1;z+=cell)for(let x=a.bb.x0;x<a.bb.x1;x+=cell){
      const R2=hash3(x,z,31);if(R2>(dense?0.72:0.34))continue;
      const px=x+(hash3(x,z,32)-0.5)*cell*0.9,pz=z+(hash3(x,z,33)-0.5)*cell*0.9;
      if(!inRec(a,px,pz)||!inMap(px,pz,5)||inWater(px,pz)||kept(px,pz))continue;
      if(have.has(Math.floor(px/20)+','+Math.floor(pz/20)))continue;
      if(buildingsAt(px,pz,2).some(b=>inPoly(px,pz,b.ring))||roadsNear(px,pz,1,r=>r.c!=='trail').length)continue;
      const hs=hash3(px,pz,34),h=dense?14+hs*16:8+hs*8;   // conifers on the wooded slopes are tall
      if(plant)plant(dense?'wood':'park',px,groundH(px,pz),pz,hs,hash3(px,pz,35));else T.add(px,groundH(px,pz),pz,hs*6,h*(dense?0.72:1),h,h*(dense?0.72:1),greens[Math.floor(hs*greens.length)]);forest++;}}
  T.build();if(plant)plant.build();ctx.details=Object.assign(ctx.details||{},{mappedTrees:mapped.length/2,parkwayTrees:parkway,woodlandTrees:forest},plant?{treeSpecies:SPC}:{});
});
section('rooftops',()=>{if(C.rooftops===false)return;   // a city of tiled roofs has none of this kit: no tanks, no units, no parapets
  const hvacM=new THREE.MeshLambertMaterial({color:0xb8b6b0}),tankM=new THREE.MeshLambertMaterial({color:0x6a4a34}),roofTankM=new THREE.MeshLambertMaterial({color:0x3a3430});
  const H=tiledInstances(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),hvacM,1600*WORLD,false),K=tiledInstances(new THREE.CylinderGeometry(1,1,1,12).translate(0,0.5,0),tankM,2500*WORLD,false),
        KR=tiledInstances(new THREE.ConeGeometry(1.15,1,12).translate(0,0.5,0),roofTankM,2500*WORLD,false),KL=tiledInstances(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),hvacM,1600*WORLD,false);
  for(const r of ROOFTOP){const n=Math.min(4,1+Math.floor(r.area/900));
    for(let k=0;k<n;k++){const x=r.x+(hash3(r.x,r.z,k)-0.5)*Math.sqrt(r.area)*0.5,z=r.z+(hash3(r.z,r.x,k)-0.5)*Math.sqrt(r.area)*0.5;if(!inPoly(x,z,r.ring))continue;
      const s=2+hash3(x,z,4)*3;H.add(x,r.h,z,hash3(x,z,5)*3,s,1.2+hash3(x,z,6)*1.5,s*0.7);}
    // a wooden water tank on its steel stand, on about one in six older brick buildings of four storeys or more
    if(r.brick&&r.h>=13&&r.h<=60&&r.hsh<0.16&&inPoly(r.x,r.z,r.ring)){KL.add(r.x,r.h,r.z,0,4.2,3,4.2);K.add(r.x,r.h+3,r.z,0,2.6,5,2.6);KR.add(r.x,r.h+8,r.z,0,1,1.6,1);}}
  // ---- the rest of what is on a roof ----
  // A flat roof is never flat and it is never empty: there is a parapet round the edge of it, a bulkhead
  // where the stair comes up, vents, pipes, aerials and - on anything built since about 1990 - dishes.
  // From street level none of it shows; from anywhere above forty metres it is most of what you see, and
  // without it a city read as a field of blank lids.
  const FURN=C.streetFurniture!==false;
  if(FURN){
    const parapetM=new THREE.MeshLambertMaterial({color:0x9a958c}),ventM=new THREE.MeshLambertMaterial({color:0xa8a49c}),
          pipeM=new THREE.MeshLambertMaterial({color:0x7a756c}),dishM=new THREE.MeshLambertMaterial({color:0xd8d6d0}),
          mastM=new THREE.MeshLambertMaterial({color:0x5a5650});
    const PA=tiledInstances(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),parapetM,1800*WORLD,false),
          VN=tiledInstances(new THREE.CylinderGeometry(1,1,1,7).translate(0,0.5,0),ventM,1200*WORLD,false),
          PP=tiledInstances(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),pipeM,1200*WORLD,false),
          DS=tiledInstances(new THREE.SphereGeometry(1,8,5,0,Math.PI*2,0,Math.PI*0.45),dishM,900*WORLD,false),
          MS=tiledInstances(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),mastM,1500*WORLD,false),
          BK=tiledInstances(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),parapetM,1600*WORLD,false);
    let para=0,kit=0;
    for(const r of ROOFTOP){
      // the parapet: one box to each edge of the footprint, set in a little, half a metre proud
      // Only on roofs big enough to be worth it, and only the first few edges: a parapet to every edge of
      // every footprint in Chicago is a quarter of a million instances for something nobody can see.
      if(r.area>700&&r.ring.length<=16){
        for(let i=0;i<r.ring.length;i++){
          const a2=r.ring[i],b2=r.ring[(i+1)%r.ring.length];
          const len=Math.hypot(b2[0]-a2[0],b2[1]-a2[1]);
          if(len<3)continue;
          const mx=(a2[0]+b2[0])/2,mz=(a2[1]+b2[1])/2,ang=Math.atan2(b2[1]-a2[1],b2[0]-a2[0]);
          PA.add(mx,r.h,mz,-ang,len,0.5+hash3(mx,mz,9)*0.6,0.45);para++;
        }
      }
      const s=Math.sqrt(r.area);
      // the bulkhead over the stair, on anything with more than a ladder
      if(r.h>=11&&hash3(r.x,r.z,12)<0.7){
        const bx2=r.x+(hash3(r.x,r.z,13)-0.5)*s*0.4,bz2=r.z+(hash3(r.z,r.x,13)-0.5)*s*0.4;
        if(inPoly(bx2,bz2,r.ring)){BK.add(bx2,r.h,bz2,hash3(bx2,bz2,14)*3,3.4,2.6+hash3(bx2,bz2,15),3.0);kit++;}
      }
      // vents, pipes, a mast, and a dish or two
      const n=Math.min(4,1+Math.floor(r.area/900));
      for(let k=0;k<n;k++){
        const hx=hash3(r.x+k*7,r.z,20),hz=hash3(r.z,r.x+k*11,21);
        const x=r.x+(hx-0.5)*s*0.7,z=r.z+(hz-0.5)*s*0.7;
        if(!inPoly(x,z,r.ring))continue;
        const w=hash3(x,z,22);
        if(w<0.4)VN.add(x,r.h,z,0,0.35+w*0.5,0.7+w*1.2,0.35+w*0.5);
        else if(w<0.72)PP.add(x,r.h,z,hash3(x,z,23)*3,0.28,0.9+w*2.2,0.28);
        else if(w<0.88)MS.add(x,r.h,z,0,0.12,3+w*5,0.12);
        else DS.add(x,r.h+0.6,z,hash3(x,z,24)*3,1.1+w,0.7,1.1+w);
        kit++;
      }
    }
    PA.build();VN.build();PP.build();DS.build();MS.build();BK.build();
    ctx.details=Object.assign(ctx.details||{},{parapets:para,roofKit:kit});
  }
  H.build();K.build();KR.build();KL.build();ctx.details=Object.assign(ctx.details||{},{rooftopUnits:H.n,waterTanks:K.n});
});
section('parked-cars',()=>{
  const body=new THREE.BoxGeometry(4.5,1.0,1.9).translate(0,0.75,0),cabin=new THREE.BoxGeometry(2.4,0.7,1.7).translate(-0.2,1.6,0);
  const B1=tiledInstances(body,new THREE.MeshLambertMaterial({color:0xffffff}),1100*WORLD,false),C1=tiledInstances(cabin,new THREE.MeshLambertMaterial({color:0x2a3440}),1100*WORLD,false),c=new THREE.Color(),R=mkRng(4242);
  const car=(x,z,a)=>{const gy=groundH(x,z);B1.add(x,gy,z,-a,1,1,1,c.setHSL(carHue(R),carSat(R),carLit(R)).clone());C1.add(x,gy,z,-a,1,1,1);};
  // along both curbs of residential streets, clear of the corners; a city with few cars (Vashrin) sets parkedCars below 1
  const PARKED=C.parkedCars===undefined?1:C.parkedCars;
  for(const r of ROADS){if(!PARKED||r.c!=='residential'||r.len<40)continue;let carry=12;
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.1)continue;const dx=(bx-ax)/L,dz=(bz-az)/L,a=Math.atan2(dz,dx);
      const PSTEP=7*WORLD;for(let u=carry;u<L-12;u+=PSTEP){for(const sd of [-1,1]){if(R()<1-0.4*PARKED)continue;const off=r.w/2-1.2,x=ax+dx*u-dz*sd*off,z=az+dz*u+dx*sd*off;if(!inMap(x,z,5)||inWater(x,z))continue;car(x,z,a);}}
      carry=12;}}
  // rows in the mapped surface parking lots (up to 80 a lot)
  let lots=0;for(const p of AREAS){if(p.kind!=='parking')continue;const w=p.bb.x1-p.bb.x0,dd=p.bb.z1-p.bb.z0;if(w*dd<300)continue;let k=0;
    for(let z=p.bb.z0+4;z<p.bb.z1-3&&k<80;z+=6.5)for(let x=p.bb.x0+2;x<p.bb.x1-2&&k<80;x+=2.8){if(R()<0.4||!inRec(p,x,z))continue;car(x,z,Math.PI/2);k++;}lots++;}
  B1.build();C1.build();ctx.details=Object.assign(ctx.details||{},{parkedResidential:B1.n,parkingLots:lots});
});
section('street-lines-lights',()=>{
  // Painted lines and lamp standards are motor-age furniture. A city that has neither - Mordor's roads, or a
  // place seven thousand years before either - says streetFurniture:false and gets bare roads.
  if(C.streetFurniture===false)return;
  // a double yellow centre line on the arterials (hidden past 1.5 km)
  const lines=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-7,polygonOffsetUnits:-14}),{tile:1000,far:1500*WORLD}),yl=col('#d8b840');
  const offset=(pts,o)=>pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [p[0]-dz/l*o,p[1]+dx/l*o];});
  for(const r of ROADS){if(!['trunk','primary','secondary'].includes(r.c)||deckY(r)>0)continue;for(const o of [-0.25,0.25])lines.ribbon(offset(r.pts,o),0.15,0.01,yl);}
  lines.build('centre lines');
  // street lights along every arterial, 35 m apart on both sides (the detailed areas already have theirs)
  const poleM=new THREE.MeshLambertMaterial({color:0x2e3134}),headM=new THREE.MeshLambertMaterial({color:0xe8e4d8,emissive:0x000000});
  const Pl=tiledInstances(new THREE.CylinderGeometry(0.12,0.16,1,5).translate(0,0.5,0),poleM,1800*WORLD,false),Hd=tiledInstances(new THREE.BoxGeometry(1,1,1),headM,1800*WORLD,false);
  for(const r of ROADS){if(!['trunk','primary','secondary','tertiary'].includes(r.c)||deckY(r)>0)continue;let carry=17;
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.1)continue;const dx=(bx-ax)/L,dz=(bz-az)/L;
      const LSTEP=35*WORLD;for(let u=carry;u<L;u+=LSTEP)for(const sd of [-1,1]){const x=ax+dx*u-dz*sd*(r.w/2+1.3),z=az+dz*u+dx*sd*(r.w/2+1.3);if(!inMap(x,z,5)||focusAt(x,z)||inWater(x,z))continue;
        const gy=groundH(x,z);Pl.add(x,gy,z,0,1,9,1);Hd.add(x+dz*sd*1.6,gy+8.6,z-dx*sd*1.6,-Math.atan2(dz,dx),1.2,0.35,0.5);}
      carry=Math.max(0,LSTEP-((L-carry)%LSTEP));}}
  Pl.build();Hd.build();animHooks.push(()=>{const w=nightF(hourCur);headM.emissive.setRGB(w,w*0.85,w*0.55);});
  ctx.details=Object.assign(ctx.details||{},{arterialLights:Pl.n});
});
Object.assign(API,{tiledInstances});
