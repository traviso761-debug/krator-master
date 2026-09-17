// ---------- ground: OpenStreetMap land cover, the lake and river, piers and breakwaters, every street, alley and trail as geometry, bridges ----------
await stage('ground');
// geometry buffers split into tiles (2 km unless asked) so the camera can skip what it cannot see; opts.far hides a tile beyond that distance
const FAR_MESHES=[];
{let t=0;const c=new THREE.Vector3();animHooks.push(now=>{if(now-t<300)return;t=now;for(const m of FAR_MESHES){c.copy(m.geometry.boundingSphere.center);m.visible=camera.position.distanceTo(c)-m.geometry.boundingSphere.radius<m.userData.far;}});}
function tiledBuffer(material,opts){const tiles=new Map();opts=opts||{};const TS=opts.tile||2000;
  return {
    tile(x,z){const k=Math.floor(x/TS)+','+Math.floor(z/TS);let t=tiles.get(k);if(!t){t={p:[],n:[],c:[],idx:[]};tiles.set(k,t);}return t;},
    quad(t,a,b,c,d,cl,nrm){const base=t.p.length/3;t.p.push(...a,...b,...c,...d);const n=nrm||[0,1,0];t.n.push(...n,...n,...n,...n);for(let k=0;k<4;k++)t.c.push(cl.r,cl.g,cl.b);t.idx.push(base,base+1,base+2,base,base+2,base+3);},
    poly(outer,holes,y,cl){if(outer.length<3)return;const t=this.tile(outer[0][0],outer[0][1]);
      const V=r=>r.map(([x,z])=>new THREE.Vector2(x,z));let faces;try{faces=THREE.ShapeUtils.triangulateShape(V(outer),(holes||[]).map(V));}catch(e){return;}const all=outer.concat(...(holes||[]));
      const base=t.p.length/3;for(const [x,z] of all){t.p.push(x,y,z);t.n.push(0,1,0);t.c.push(cl.r,cl.g,cl.b);}for(const f of faces)t.idx.push(base+f[0],base+f[2],base+f[1]);},
    walls(ring,y0,y1,cl){for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],nx=b[1]-a[1],nz=-(b[0]-a[0]),nl=Math.hypot(nx,nz)||1;
      this.quad(this.tile(a[0],a[1]),[a[0],y1,a[1]],[b[0],y1,b[1]],[b[0],y0,b[1]],[a[0],y0,a[1]],cl,[nx/nl,0,nz/nl]);}},
    ribbon(pts,w,y,cl,sides){if(pts.length<2)return;const h=w/2,L=[],R=[];
      for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[i],c=pts[Math.min(pts.length-1,i+1)];let d1x=b[0]-a[0],d1z=b[1]-a[1],d2x=c[0]-b[0],d2z=c[1]-b[1];
        const l1=Math.hypot(d1x,d1z)||1,l2=Math.hypot(d2x,d2z)||1;d1x/=l1;d1z/=l1;d2x/=l2;d2z/=l2;if(i===0){d1x=d2x;d1z=d2z;}if(i===pts.length-1){d2x=d1x;d2z=d1z;}
        let nx=-(d1z+d2z),nz=d1x+d2x;const nl=Math.hypot(nx,nz)||1;nx/=nl;nz/=nl;const miter=Math.min(2,1/Math.max(0.5,(nx*-d1z+nz*d1x)));
        L.push([b[0]+nx*h*miter,b[1]+nz*h*miter]);R.push([b[0]-nx*h*miter,b[1]-nz*h*miter]);}
      const dark=sides?cl.clone().multiplyScalar(0.7):null;
      for(let i=0;i+1<pts.length;i++){const t=this.tile(pts[i][0],pts[i][1]);
        this.quad(t,[L[i][0],y,L[i][1]],[R[i][0],y,R[i][1]],[R[i+1][0],y,R[i+1][1]],[L[i+1][0],y,L[i+1][1]],cl);
        if(sides)for(const [A,sgn] of [[L,1],[R,-1]]){const nx=(A[i+1][1]-A[i][1])*sgn,nz=-(A[i+1][0]-A[i][0])*sgn,nl=Math.hypot(nx,nz)||1;
          this.quad(t,[A[i][0],y,A[i][1]],[A[i+1][0],y,A[i+1][1]],[A[i+1][0],y-sides,A[i+1][1]],[A[i][0],y-sides,A[i][1]],dark,[nx/nl,0,nz/nl]);}}},
    build(name){const out=[];for(const t of tiles.values()){if(!t.idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(t.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(t.n,3));
        g.setAttribute('color',new THREE.Float32BufferAttribute(t.c,3));g.setIndex(t.idx);g.computeBoundingSphere();const m=new THREE.Mesh(g,material);m.receiveShadow=true;m.userData.noShadow=!opts.cast;if(opts.cast)m.castShadow=true;m.name=name||'';if(opts.far){m.userData.far=opts.far;FAR_MESHES.push(m);}scene.add(m);out.push(m);}return out;}};}
const col=h=>new THREE.Color(h);
const groundMat=off=>new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-off,polygonOffsetUnits:-off*2});
const stoneM=new THREE.MeshLambertMaterial({color:0xbdb5a6}),steelM=new THREE.MeshLambertMaterial({color:0x6b6f75});
section('ground',()=>{
  // the land underneath everything, then the land cover, big areas first so the details paint over them
  const base=new THREE.Mesh(new THREE.PlaneGeometry(B.w+400,B.d+400),new THREE.MeshLambertMaterial({color:0x5c5a53}));base.rotation.x=-Math.PI/2;base.position.set(B.cx,-0.02,B.cz);base.receiveShadow=true;scene.add(base);
  const AREA_COL={residential:'#5b664e',commercial:'#6c6962',industrial:'#615d56',construction:'#7a6e5a',campus:'#66755a',parking:'#4a4b4f',park:'#5f8a48',golf:'#6a9a50',cemetery:'#5a7a48',railyard:'#6a645a',reserve:'#557a44',wood:'#3f6a38',grass:'#6a9a52',zoo:'#648a4a',garden:'#5a9048',sand:'#dccda4',plaza:'#b8b0a2',pitch:'#4f8a3e',track:'#9a4a36',play:'#b89a6a',stadium:'#707070'};
  const BIG=new Set(['park','golf','cemetery','railyard','reserve','wood','grass','zoo']),USE=new Set(['residential','commercial','industrial','construction','campus']);
  const use=tiledBuffer(groundMat(0.5)),land=tiledBuffer(groundMat(1)),detail=tiledBuffer(groundMat(2),{tile:1000,far:4000});
  // residential blocks get a little variety in their yards so a neighbourhood does not read as one flat sheet
  for(const a of AREAS){let c=col(AREA_COL[a.kind]||'#6a9a52');if(a.kind==='residential'){const h=hash3(a.bb.x0,a.bb.z0,11);c=c.clone().offsetHSL(0,(h-0.5)*0.06,(h-0.5)*0.05);}
    (USE.has(a.kind)?use:BIG.has(a.kind)?land:detail).poly(a.o,a.i,0,c);}
  for(const b of BEACHES)detail.poly(b.o,b.i,0,col('#dccda4'));
  use.build('land use');land.build('land');detail.build('land detail');
});
// water: the lake with the real shore (islands cut out), the river, lagoons and harbour basins
const waterM=new THREE.MeshPhongMaterial({color:0x2a5f8c,specular:0x9fc4e0,shininess:90,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6});
section('water',()=>{
  if(LAKE.length>2){const clip=([x,z])=>[Math.max(B.x0-200,Math.min(B.x1+3000,x)),Math.max(B.z0-3000,Math.min(B.z1+3000,z))];
  const shape=new THREE.Shape(LAKE.map(clip).map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const r of ISLANDS)shape.holes.push(new THREE.Path(r.map(([x,z])=>new THREE.Vector2(x,-z))));
  const lake=new THREE.Mesh(new THREE.ShapeGeometry(shape),waterM);lake.rotation.x=-Math.PI/2;lake.position.y=0.05;lake.receiveShadow=true;scene.add(lake);}   // cities without a lake shore skip this
  const wb=tiledBuffer(waterM);for(const w of WATER)wb.poly(w.o,w.i,0.05,col('#2a5f8c'));wb.build('river');
  animHooks.push(now=>{waterM.shininess=70+25*Math.sin(now*0.0011);});
});
// piers and breakwaters: raised slabs with walls down to the water
section('piers',()=>{const pb=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true}),{cast:true}),c=col('#b8b2a6'),side=col('#8a857a');
  for(const p of PIERS){if(p.line)pb.ribbon(p.line,p.w,2.2,c,2.4);else{pb.poly(p.o,p.i,2.2,c);pb.walls(p.o,-0.2,2.2,side);}}
  pb.build('piers');});
// streets: sidewalks under the carriageway, alleys, trails; bridges lifted as decks; Metra at grade
const ROAD_COL={motorway:'#3a3b3f',trunk:'#3a3b3f',primary:'#3c3d41',secondary:'#404145',tertiary:'#44454a',residential:'#48494d',unclassified:'#48494d',living_street:'#4f5054',pedestrian:'#b3ab9c',alley:'#56575a',trail:'#8e8a80'};
const WALKED=new Set(['primary','secondary','tertiary','residential','unclassified','living_street']);
const deckY=r=>r.bridge?6+Math.max(0,r.layer-1)*6:r.layer>0?6*r.layer:0;
const BRIDGES=[];
section('streets',()=>{
  const walk=tiledBuffer(groundMat(4),{tile:1000,far:3000}),road=tiledBuffer(groundMat(5)),trail=tiledBuffer(groundMat(6),{tile:1000,far:5000}),deck=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true}),{cast:true});
  const walkC=col('#a39f95'),lakefront=col('#7f8a8c');
  for(const r of ROADS){const y=deckY(r),c=col(ROAD_COL[r.c]||'#48494d');
    if(y>0){deck.ribbon(r.pts,r.w+(WALKED.has(r.c)?4:1),y,c,1.6);BRIDGES.push(r);continue;}
    if(r.c==='trail'){trail.ribbon(r.pts,r.w,0,/Lakefront/i.test(r.name)?lakefront:c);continue;}
    if(WALKED.has(r.c))walk.ribbon(r.pts,r.w+5,0,walkC);
    (r.c==='alley'?walk:road).ribbon(r.pts,r.w,0,c);}
  const rail=tiledBuffer(groundMat(4));for(const r of RAILS)if(!r.elevated&&r.type==='rail')rail.ribbon(r.pts,5,0,col('#5a534a'));
  walk.build('sidewalks');road.build('streets');trail.build('trails');deck.build('bridges');rail.build('rail');
  // movable (bascule) bridges get a bridge house at each corner, as the river bridges downtown do
  const houseM=new THREE.MeshLambertMaterial({color:0xc8bca8}),roofM=new THREE.MeshLambertMaterial({color:0x5a6a62});let nh=0;
  for(const r of BRIDGES){if(r.bridge!==2||r.len<30)continue;const a=r.pts[0],b=r.pts[r.pts.length-1],dx=(b[0]-a[0])/r.len,dz=(b[1]-a[1])/r.len,ang=-Math.atan2(dz,dx);
    for(const [p,s] of [[a,1],[b,-1]])for(const sd of [-1,1]){const x=p[0]+dx*s*5-dz*sd*(r.w/2+6),z=p[1]+dz*s*5+dx*sd*(r.w/2+6);if(inWater(x,z))continue;
      const h=new THREE.Mesh(new THREE.BoxGeometry(8,10,8),houseM);h.position.set(x,5,z);h.rotation.y=ang;h.castShadow=true;const rf=new THREE.Mesh(new THREE.ConeGeometry(6.2,3,4),roofM);rf.position.set(x,11.5,z);rf.rotation.y=ang+Math.PI/4;scene.add(h,rf);nh++;}}
  ctx.details=Object.assign(ctx.details||{},{bridges:BRIDGES.length,bridgeHouses:nh});
});
