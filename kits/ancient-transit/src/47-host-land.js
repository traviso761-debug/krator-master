// ================================================================= HOST — the ground mesh, BIO.init, the shadows  [web]
BIO.init({tags:'ancient-transit',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>1,obstacles:[],ticks:tick,seed:73,origin:[[0,0]],center:[0,0],fields:{},register:REGISTER,err:reportErr,
 lod:{hero:300,mid:1000,far:3200,floor:[200,480]},windows:{}});
BIO.setSun(SUN_POS);
/* the ground: a coarse grid (22 m cells) refined where the kit carves or grades it (TR_CARVED: the subway's sinkholes and stair pits, the streets'
   craters, the fault, the roads and the cargo line), so a 7 m crater, a 4 m stair pit and a road's cutting are in the mesh. Every refined cell is
   K x K sub-quads (1.8 m), so two refined neighbours share their vertices; an edge against an UNREFINED neighbour sits on that neighbour's straight
   edge, so there is no crack (the owner, 2026-11-09: pinning every refined edge drew ridges across a cutting at each coarse line) */
const GROUND=(function(){const N=180,S=4000,h=S/N,K=12,c0=KTRANSIT.rgb(0x7a7268),c1=KTRANSIT.rgb(0x5a5648),P=[],U=[],Cc=[],I=[];
 const feats=TR_CARVED.map(f=>({x:f.x,z:f.z,r:f.r*1.4+2}));
 const fine=new Uint8Array(N*N);for(let i=0;i<N;i++)for(let j=0;j<N;j++){const cx=-S/2+(i+.5)*h,cz=-S/2+(j+.5)*h;for(const f of feats){if(Math.abs(f.x-cx)<f.r+h/2&&Math.abs(f.z-cz)<f.r+h/2){fine[i*N+j]=1;break;}}}
 const isFine=(i,j)=>i>=0&&j>=0&&i<N&&j<N&&fine[i*N+j]===1;
 const col=(x,z)=>{const k=KRAND.fbm(x/90+3,0,z/90+8,2,TR_SEED+1);return [c0[0]+(c1[0]-c0[0])*k,c0[1]+(c1[1]-c0[1])*k,c0[2]+(c1[2]-c0[2])*k];};
 const vert=(x,y,z)=>{const i=P.length/3,c=col(x,z);P.push(x,y,z);U.push(x,z);Cc.push(c[0],c[1],c[2]);return i;};
 const H=(x,z)=>terrainH(x,z);
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){const x0=-S/2+i*h,z0=-S/2+j*h,x1=x0+h,z1=z0+h,cx=x0+h/2,cz=z0+h/2;
  if(!isFine(i,j)){const a=vert(x0,H(x0,z0),z0),b=vert(x1,H(x1,z0),z0),c=vert(x1,H(x1,z1),z1),d=vert(x0,H(x0,z1),z1);I.push(a,d,b,b,d,c);continue;}
  /* the refined cell: the ground's own heights, except on an edge whose neighbour is coarse, where they sit on that edge's straight line */
  const k=K,y00=H(x0,z0),y10=H(x1,z0),y11=H(x1,z1),y01=H(x0,z1),grid=[],pinW=!isFine(i-1,j),pinE=!isFine(i+1,j),pinS=!isFine(i,j-1),pinN=!isFine(i,j+1);
  for(let a=0;a<=k;a++){grid.push([]);for(let b=0;b<=k;b++){const x=x0+h*a/k,z=z0+h*b/k;let y;
   if(a===0&&pinW)y=y00+(y01-y00)*b/k;else if(a===k&&pinE)y=y10+(y11-y10)*b/k;else if(b===0&&pinS)y=y00+(y10-y00)*a/k;else if(b===k&&pinN)y=y01+(y11-y01)*a/k;else y=H(x,z);
   grid[a].push(vert(x,y,z));}}
  for(let a=0;a<k;a++)for(let b=0;b<k;b++){const p=grid[a][b],q=grid[a+1][b],r=grid[a+1][b+1],s=grid[a][b+1];I.push(p,s,q,q,s,r);}}
 /* one vertex buffer, normals over the whole; then TILES (TN x TN) of its triangles, each a geometry on the shared attributes with its own
    bounds, so a view draws the tiles in its frustum and not the whole 4 km square (the owner, 2026-11-09: triangles) */
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));g.setIndex(I);g.computeVertexNormals();
 const TN=8,TW=S/TN,tiles=[];for(let t=0;t<TN*TN;t++)tiles.push([]);
 for(let t=0;t<I.length;t+=3){const x=(P[I[t]*3]+P[I[t+1]*3]+P[I[t+2]*3])/3,z=(P[I[t]*3+2]+P[I[t+1]*3+2]+P[I[t+2]*3+2])/3,a=Math.max(0,Math.min(TN-1,Math.floor((x+S/2)/TW))),b=Math.max(0,Math.min(TN-1,Math.floor((z+S/2)/TW)));tiles[a*TN+b].push(I[t],I[t+1],I[t+2]);}
 const G=new THREE.Group();G.name='ground';G.userData.host=true;G.userData.tris=I.length/3;const mat=KTRANSIT.mats().rubble;
 tiles.forEach((ti,t)=>{if(!ti.length)return;const tg=new THREE.BufferGeometry();tg.setAttribute('position',g.attributes.position);tg.setAttribute('normal',g.attributes.normal);tg.setAttribute('uv',g.attributes.uv);tg.setAttribute('color',g.attributes.color);tg.setIndex(ti);
  const bb=new THREE.Box3();for(let q=0;q<ti.length;q++){const v=ti[q]*3;bb.expandByPoint(new THREE.Vector3(P[v],P[v+1],P[v+2]));}tg.boundingBox=bb;tg.boundingSphere=bb.getBoundingSphere(new THREE.Sphere());
  const m=new THREE.Mesh(tg,mat);m.name='ground';m.userData.host=true;m.userData.inspectLabel='the ground';m.userData.tris=ti.length/3;m.userData.tile=t;G.add(m);});
 scene.add(G);return G;})();
/* the sun's shadows (core/shadow): one box that follows the view. A deck's shadow on the street is half the reading of an elevated line. ?noshadow leaves them off */
const TR_SHADOW=/[?&]noshadow/.test(location.search)?null:KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
if(TR_SHADOW)GROUND.traverse(m=>{if(m.isMesh)m.receiveShadow=true;});
