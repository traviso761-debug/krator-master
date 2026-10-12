// ---------- the ordinary buildings of Rome: tiled roofs and cornices ----------
// The engine draws every mapped footprint as walls and a flat lid. Rome is not flat-topped: from any height it is a
// field of terracotta, the roofs of the palazzi hipped and tiled, the courtyard blocks ringed with tiled slopes round
// their light wells, and every wall finished under the eaves with a cornice. This stage puts them on, from the
// footprints the engine drew (API.FOOTPRINTS):
//
//   a simple footprint (near enough a rectangle, not too big) gets a hipped roof over its best-fitting rectangle,
//   eaves out past the walls, a chimney or two on the slopes
//   anything else - an L, a block round a courtyard, an odd corner lot - gets a tiled slope rising inward from every
//   edge, which is what those roofs are from above
//   every wall long enough gets its cornice: a pale stone lip under the eaves
//
// Houses and churches keep the engine's own pitched roofs, towers their flat tops. The roofs are drawn in tiles with
// their own bounds (out of the frame, not drawn); the cornices only near the camera. Map data (c) OpenStreetMap
// contributors, ODbL; the geometry is this project's own.

export function palazzi(api){
  const CHIMNEYS=api.chimneys=api.chimneys||[];
  const {THREE,C,scene,FOOTPRINTS,animHooks,camera}=api;const K=C.palazzi;if(!K||!FOOTPRINTS)return;
  const SKIP=new Set(['house','detached','semidetached_house','terrace','bungalow','cabin','church','chapel','cathedral','basilica','roof','shed','garage','garages','ruins','temple','arch','triumphal_arch']);
  const TILE=K.tile||400,PITCH=Math.tan((K.pitch||24)*Math.PI/180),EAVE=K.eave||0.6,BAND=K.band||5,CF=K.corniceFar||800;
  const tiles=new Map();
  const tileOf=(x,z)=>{const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);let t=tiles.get(k);if(!t){t={roof:{p:[],n:[],c:[],i:[]},corn:{p:[],n:[],c:[],i:[]}};tiles.set(k,t);}return t;};
  // a quad (four points, wound so its normal faces `face`) into a buffer
  const V=THREE.Vector3,ta=new V(),tb=new V(),tn=new V();
  function quad(buf,a,b,c,d,col,face){ta.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);tb.set(d[0]-a[0],d[1]-a[1],d[2]-a[2]);tn.crossVectors(ta,tb).normalize();   /* (b-a)x(d-a): the side the winding shows */
    if(face&&tn.x*face[0]+tn.y*face[1]+tn.z*face[2]<0){[b,d]=[d,b];tn.negate();}
    const base=buf.p.length/3;for(const v of [a,b,c,d]){buf.p.push(v[0],v[1],v[2]);buf.n.push(tn.x,tn.y,tn.z);buf.c.push(col.r,col.g,col.b);}buf.i.push(base,base+1,base+2,base,base+2,base+3);}
  function tri(buf,a,b,c,col,face){quad(buf,a,b,c,c,col,face);}
  const area=r=>{let s=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];s+=a[0]*b[1]-b[0]*a[1];}return s/2;};
  // the smallest rectangle round a ring, trying each edge's direction
  function minRect(r){let best=null;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.5)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
      let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of r){const u=p[0]*ux+p[1]*uz,v=-p[0]*uz+p[1]*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
      const A=(u1-u0)*(v1-v0);if(!best||A<best.A)best={A,ux,uz,u0,u1,v0,v1};}return best;}
  const roofCol=new THREE.Color(),stone=new THREE.Color(K.cornice||'#e6dccb'),chim=new THREE.Color(K.chimney||'#9a5a3e');
  const TERRA=(K.roofColours||['#b8623c','#a95434','#c0704a','#9c4e32','#b46a48']).map(c=>new THREE.Color(c));
  let hips=0,bands=0,cornices=0,skipped=0;
  for(const f of FOOTPRINTS){const r=f.ring,H=f.h-f.g;if(f.tall||SKIP.has(f.t)||H<5||r.length<3){skipped++;continue;}
    const A=Math.abs(area(r)),cx=r.reduce((s,p)=>s+p[0],0)/r.length,cz=r.reduce((s,p)=>s+p[1],0)/r.length,y=f.h,sgn=Math.sign(area(r))||1;
    if(api.inWater(cx,cz)){skipped++;continue;}   // bridge piers are mapped as buildings: no roofs on them
    const t=tileOf(cx,cz);
    roofCol.copy(TERRA[Math.floor((f.hsh*7.31%1)*TERRA.length)]).multiplyScalar(0.9+0.2*((f.hsh*13.7)%1));
    const rect=minRect(r);
    const holes=f.holes||[];
    if(!holes.length&&rect&&A/rect.A>0.84&&r.length<=8&&A<3500&&Math.min(rect.u1-rect.u0,rect.v1-rect.v0)<=(K.hipMax||22)){   /* wider than that, a Roman block has a courtyard, not one great hip */
      // a hipped roof over the rectangle, the eaves out past the walls
      const {ux,uz}=rect,u0=rect.u0-EAVE,u1=rect.u1+EAVE,v0=rect.v0-EAVE,v1=rect.v1+EAVE,L=u1-u0,W=v1-v0,P=(u,v,yy)=>[u*ux-v*uz,yy,u*uz+v*ux];
      const long=L>=W,half=(long?W:L)/2,rh=Math.min(half*PITCH,K.ridgeMax||5),top=y+rh,vm=(v0+v1)/2,um=(u0+u1)/2;
      const c00=P(u0,v0,y),c10=P(u1,v0,y),c11=P(u1,v1,y),c01=P(u0,v1,y);
      if(long){const r0=P(u0+half,vm,top),r1=P(u1-half,vm,top);quad(t.roof,c00,c10,r1,r0,roofCol,[0,1,0]);quad(t.roof,c11,c01,r0,r1,roofCol,[0,1,0]);tri(t.roof,c10,c11,r1,roofCol,[0,1,0]);tri(t.roof,c01,c00,r0,roofCol,[0,1,0]);}
      else{const r0=P(um,v0+half,top),r1=P(um,v1-half,top);quad(t.roof,c10,c11,r1,r0,roofCol,[0,1,0]);quad(t.roof,c01,c00,r0,r1,roofCol,[0,1,0]);tri(t.roof,c00,c10,r0,roofCol,[0,1,0]);tri(t.roof,c11,c01,r1,roofCol,[0,1,0]);}
      // a chimney or two, standing out of the slopes
      const nc=f.hsh<0.5?1:2;for(let k=0;k<nc;k++){const cu=u0+L*(0.3+0.4*((f.hsh*(7+k*5))%1)),cv=v0+W*(0.3+0.4*((f.hsh*(11+k*3))%1)),b0=P(cu,cv,y),w=0.5;
        const pts=[[-w,-w],[w,-w],[w,w],[-w,w]].map(([a,b])=>[b0[0]+a,b0[2]+b]),y1=top+1.4;
        CHIMNEYS.push([b0[0],y1,b0[2],f.hsh]);   // for the smoke (src/core/streetlife.js)
        for(let s=0;s<4;s++){const a=pts[s],b=pts[(s+1)%4];quad(t.roof,[a[0],y,a[1]],[b[0],y,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],chim,[b[1]-a[1],0,-(b[0]-a[0])]);}
        quad(t.roof,[pts[0][0],y1,pts[0][1]],[pts[1][0],y1,pts[1][1]],[pts[2][0],y1,pts[2][1]],[pts[3][0],y1,pts[3][1]],chim,[0,1,0]);}
      hips++;}
    else{
      const band=(r0,sgn)=>{
      // the ring with its little steps taken out (a vertex less than 1.5 m on from the last kept one is dropped): a
      // zigzag of short mapped edges would otherwise throw a spike of roof out of every step
      const r=[];for(const p of r0){const q=r[r.length-1];if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>=1.5)r.push(p);}if(r.length>3&&Math.hypot(r[0][0]-r[r.length-1][0],r[0][1]-r[r.length-1][1])<1.5)r.pop();if(r.length<3)return;
      // a tiled slope rising inward from every edge: the inner line set in by BAND metres (mitred, clamped)
      const n=r.length,inner=[];for(let i=0;i<n;i++){const a=r[(i-1+n)%n],p=r[i],b=r[(i+1)%n];
        let e1x=p[0]-a[0],e1z=p[1]-a[1],e2x=b[0]-p[0],e2z=b[1]-p[1];const l1=Math.hypot(e1x,e1z)||1,l2=Math.hypot(e2x,e2z)||1;e1x/=l1;e1z/=l1;e2x/=l2;e2z/=l2;
        // (the offset is clamped: a sharp corner must not throw the inner line out past the wall)
        // inward normals: for a counter-clockwise ring (positive area, x/z) the inside is to the left of each edge
        const n1x=-e1z*sgn,n1z=e1x*sgn,n2x=-e2z*sgn,n2z=e2x*sgn;let mx=n1x+n2x,mz=n1z+n2z;const ml=Math.hypot(mx,mz)||1;mx/=ml;mz/=ml;
        const cos=Math.max(0.35,mx*n1x+mz*n1z),d=Math.min(Math.min(BAND,Math.min(l1,l2)*0.45)/cos,BAND*1.3,Math.min(l1,l2)*0.8);inner.push([p[0]+mx*d,p[1]+mz*d]);}
      for(let i=0;i<n;i++){const j=(i+1)%n,a=r[i],b=r[j],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.3)continue;const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,ox=ez*sgn*EAVE,oz=-ex*sgn*EAVE;
        quad(t.roof,[a[0]+ox,y,a[1]+oz],[b[0]+ox,y,b[1]+oz],[inner[j][0],y+BAND*PITCH*0.8,inner[j][1]],[inner[i][0],y+BAND*PITCH*0.8,inner[i][1]],roofCol,[0,1,0]);}
      };
      band(r,sgn);for(const hr of holes)band(hr,-(Math.sign(area(hr))||1));   // round a courtyard the slope rises away from it
      bands++;}
    // the cornice: a pale lip along each wall long enough to carry one, under the eaves
    const lip=(r,sgn)=>{for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<3)continue;const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,ox=ez*sgn,oz=-ex*sgn;
      quad(t.corn,[a[0],y-0.05,a[1]],[b[0],y-0.05,b[1]],[b[0]+ox*0.75,y-0.7,b[1]+oz*0.75],[a[0]+ox*0.75,y-0.7,a[1]+oz*0.75],stone,[ox,-0.6,oz]);
      quad(t.corn,[a[0]+ox*0.75,y-0.7,a[1]+oz*0.75],[b[0]+ox*0.75,y-0.7,b[1]+oz*0.75],[b[0]+ox*0.75,y-1.15,b[1]+oz*0.75],[a[0]+ox*0.75,y-1.15,a[1]+oz*0.75],stone,[ox,0,oz]);cornices++;}};
    lip(r,sgn);for(const hr of holes)lip(hr,-(Math.sign(area(hr))||1));}
  // into meshes, one roof and one cornice mesh a tile
  const roofM=new THREE.MeshLambertMaterial({vertexColors:true}),cornM=new THREE.MeshLambertMaterial({vertexColors:true});
  const mk=(b,m)=>{if(!b.i.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));g.setIndex(b.i);g.computeBoundingSphere();const me=new THREE.Mesh(g,m);me.userData.wireCat='buildings';scene.add(me);return me;};
  const CORN=[];let tris=0;
  for(const t of tiles.values()){const rm=mk(t.roof,roofM);if(rm){rm.castShadow=true;rm.receiveShadow=true;tris+=t.roof.i.length/3;}const cm=mk(t.corn,cornM);if(cm){cm.receiveShadow=true;CORN.push(cm);tris+=t.corn.i.length/3;}}
  {let last=-1e9;animHooks.push(now=>{if(now-last<300)return;last=now;for(const m of CORN){const s=m.geometry.boundingSphere;m.visible=camera.position.distanceTo(s.center)-s.radius<CF;}});}
  api.ctx.details=Object.assign(api.ctx.details||{},{palazziHipRoofs:hips,palazziRoofBands:bands,cornices,palazziSkipped:skipped,palazziTris:Math.round(tris)});
}
