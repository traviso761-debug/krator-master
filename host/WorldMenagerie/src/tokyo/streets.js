// ---------- Tokyo's elevated streets: the Shuto's piers and parapets, and the footbridges ----------
// The Shuto Expressway runs over the city on concrete: a T-shaped pier every thirty metres or so, a steel box girder
// under the deck, a concrete parapet each side, lamps on it, and in places a sound wall. The engine draws the deck
// (a motorway way mapped as a bridge or on a layer); this puts the rest under and along it, from the deck's own
// heights (r.ys), wherever it stands clear of the ground.
// The footbridges (歩道橋, the hodōkyō: OSM footways mapped as bridges, fetched as extraFiles) are steel spans over the
// main roads, 5.5 m clear, painted blue or green, a flight of stairs down at each end and the blue route sign hung on
// the girder over the road.
// Map data (c) OpenStreetMap contributors, ODbL.
export function streets(api){
  const {THREE,C,scene,ROADS,OSM,groundH,dec,animHooks,camera}=api;const K=C.tokyoStreets||{};
  const TILE=600,tiles=new Map(),tileOf=(x,z)=>{const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);let t=tiles.get(k);if(!t)tiles.set(k,t={p:[],n:[],c:[]});return t;};
  const col=new THREE.Color(),m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3(),BOX=new THREE.BoxGeometry(1,1,1).toNonIndexed(),CYL=new THREE.CylinderGeometry(0.5,0.5,1,8).toNonIndexed();
  function put(g,c,x,y,z,ry,sx,sy,sz,rz=0){const t=tileOf(x,z),p=g.attributes.position,n=g.attributes.normal;m4.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,rz,'YXZ')),new THREE.Vector3(sx,sy,sz));nm.getNormalMatrix(m4);col.set(c);
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m4);t.p.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();t.n.push(v.x,v.y,v.z);t.c.push(col.r,col.g,col.b);}}
  const CONC='#b8b6ae',CONC2='#a8a69e',STEEL='#8a9096';
  // ---- the Shuto ----
  let piers=0;
  for(const r of ROADS){if(!r.ys||!(r.c==='motorway'||r.c==='trunk')||!r.layer&&!r.bridge)continue;const pts=r.pts,w=Math.max(r.w||7,6);let run=15;
    for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.5)continue;const ex=(bx-ax)/L,ez=(bz-az)/L,ry=-Math.atan2(ez,ex);
      const y0=r.ys[i],y1=r.ys[i+1],mx=(ax+bx)/2,mz=(az+bz)/2,ym=(y0+y1)/2,gm=groundH(mx,mz);if(ym-gm<2.5){run+=L;continue;}
      const pitch=Math.atan2(y1-y0,L);
      put(BOX,STEEL,mx,ym-0.95,mz,ry,L+0.1,1.3,w*0.62,pitch);                                                 // the box girder
      for(const sd of [-1,1]){const ox=-ez*sd*(w/2-0.15),oz=ex*sd*(w/2-0.15);put(BOX,CONC,mx+ox,ym+0.55,mz+oz,ry,L+0.1,1.1,0.3,pitch);   // the parapets
        if(r.layer>=2&&((i*7+sd)%5===0))put(BOX,'#c8d4d8',mx+ox,ym+2.2,mz+oz,ry,L+0.1,2.2,0.08,pitch);}                   // a sound wall
      // a pier every thirty metres: the column, the cap beam across under the deck
      for(let s=(30-run%30)%30;s<L;s+=30){const x=ax+ex*s,z=az+ez*s,y=y0+(y1-y0)*s/L,g=groundH(x,z),h=y-1.6-g;if(h<2)continue;piers++;
        put(BOX,CONC2,x,g+h/2,z,ry,1.8,h,Math.min(3.2,w*0.35));put(BOX,CONC,x,y-1.9,z,ry,2.2,1.2,w*0.95);
        if(piers%2===0){const lx=x-ez*(w/2-0.2),lz=z+ex*(w/2-0.2);put(CYL,'#7a7e82',lx,y+5,lz,0,0.18,10,0.18);put(BOX,'#7a7e82',lx+ez*1.2,y+9.8,lz-ex*1.2,ry+Math.PI/2,2.6,0.14,0.2);}}   // a lamp
      run+=L;}}
  // ---- the footbridges ----
  let fbs=0;const FBC=['#3e6e9a','#4a7a5e','#6a8a9a','#2e5a8a'];
  for(const fb of OSM.footbridges||[]){const pts=dec(fb.p);if(pts.length<2)continue;let len=0;for(let i=0;i+1<pts.length;i++)len+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);if(len<8||len>120)continue;fbs++;
    let top=-1e9;for(const p of pts)top=Math.max(top,groundH(p[0],p[1]));const y=top+5.5,w=Math.max(2.2,Math.min(fb.w||3,4)),c=FBC[fbs%FBC.length];
    for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.3)continue;const ex=(bx-ax)/L,ez=(bz-az)/L,ry=-Math.atan2(ez,ex),mx=(ax+bx)/2,mz=(az+bz)/2;
      put(BOX,'#9a9890',mx,y,mz,ry,L+0.05,0.12,w);put(BOX,c,mx,y-0.45,mz,ry,L+0.05,0.8,w*0.7);                                  // the deck, the girder
      for(const sd of [-1,1])put(BOX,c,mx-ez*sd*w/2,y+0.6,mz+ex*sd*w/2,ry,L+0.05,1.1,0.08);                                     // the railings (solid panels, as most are)
      if(i===Math.floor((pts.length-1)/2))put(BOX,'#1a4aa0',mx,y-0.6,mz,ry+Math.PI/2,Math.min(4,w+1.4),0.9,0.1);}               // the route sign on the girder
    // the stairs: a flight down at each end, continuing the bridge's line, and the end piers
    for(const [p,q] of [[pts[0],pts[1]],[pts[pts.length-1],pts[pts.length-2]]]){const dx=p[0]-q[0],dz=p[1]-q[1],d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d,g=groundH(p[0],p[1]),run=(y-g)*1.6,ry=-Math.atan2(uz,ux);
      put(BOX,'#9a9890',p[0]+ux*run/2,(y+g)/2,p[1]+uz*run/2,ry,Math.hypot(run,y-g),0.25,w*0.8,-Math.atan2(y-g,run));
      for(const sd of [-1,1])put(BOX,c,p[0]+ux*run/2-uz*sd*w*0.4,(y+g)/2+0.8,p[1]+uz*run/2+ux*sd*w*0.4,ry,Math.hypot(run,y-g),1.0,0.08,-Math.atan2(y-g,run));
      put(BOX,c,p[0],(y+g)/2-0.3,p[1],0,0.5,y-g,0.5);}}
  // ---- into meshes, a tile each ----
  const mat=new THREE.MeshLambertMaterial({vertexColors:true}),MS=[];let tris=0;
  for(const t of tiles.values()){if(!t.p.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(t.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(t.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(t.c,3));g.computeBoundingSphere();
    const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;scene.add(m);MS.push(m);tris+=t.p.length/9;}
  {let last=-1e9;const FAR=K.far||2500;animHooks.push(now=>{if(now-last<300)return;last=now;for(const m of MS){const s=m.geometry.boundingSphere;m.visible=camera.position.distanceTo(s.center)-s.radius<FAR;}});}
  api.ctx.details=Object.assign(api.ctx.details||{},{shutoPiers:piers,footbridges:fbs,streetsTris:Math.round(tris)});
}
