// prefix: dhk
// ================================================================= DHELV: THE WELLS' FLOORS (the owner: "a low hill", "a skirt of greenery", at the bottom
// of each light well, "as the original lava tube biome build"). [web] The breakdown under each opening (the layout's KNOLLS,
// 41: the largest discs clear of the floor's sites and ways, in the daylight): a low pile of the fallen roof, its blocks strewn
// on it, grown over by the Throne kit's skylight flora (its siphon trees, lamp caps, ferns and moss: the zone its lava tube
// station plants under its skylights), planted in a pass of its own on the wells' floors after the world's forests. A pile is a
// walk block (the walkers go round it, as round a building). Drawn underground in cells (DH_CELLS: within its reach of the
// camera wherever it is, the plants too: dhSplitBiome keeps them apart by userData.under).
const DHK={SKIRT:5,groups:[],trees:[],out:null};
let DHK_MAT=null;
function dhkMat(){if(DHK_MAT)return DHK_MAT;
 /* the ground's own basalt maps, read the way the ground reads them (its uv over DH_GROUND), the pile's colour in its vertices */
 const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,vertexColors:true,map:groundMat.map,normalMap:groundMat.normalMap,roughnessMap:groundMat.roughnessMap});
 if(KMAT.mode==='lib'){const L=KMAT.packed('zeijani','basalt');if(L)matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 return DHK_MAT=m;}
/* one pile: rings every 0.75 m, 48 round, out to a lip just under the floor (no seam against the cavern's floor); moss on its
   top and its sunny side, earth and dark rubble lower down; its blocks; its walk blocks (three boxes over its body) */
function dhkPile(K,grp){const g=DH_GROUND,NR=Math.ceil(K.r/.75)+1,NS=48,pos=[],col=[],uv=[],idx=[],R=KRAND.stream(KRAND.hash(7301,Math.round(K.c[0]*10),Math.round(K.c[1]*10)));
 const moss=hc(0x8fa04e),earth=hc(0x96785a),rub=hc(0x726a62),c=new THREE.Color();
 pos.push(K.c[0],(DH.knollAt(K.c[0],K.c[1])||{y:K.y}).y,K.c[1]);col.push(moss.r,moss.g,moss.b);uv.push((K.c[0]-g.x0)/(g.x1-g.x0),(K.c[1]-g.z0)/(g.z1-g.z0));
 for(let i=1;i<=NR;i++)for(let j=0;j<NS;j++){const a=j/NS*TAU,d=Math.min(K.r+.4,K.r*i/(NR-1)),x=K.c[0]+Math.cos(a)*d,z=K.c[1]+Math.sin(a)*d,q=DH.knollAt(x,z),y=q?q.y:K.y-.04;
  pos.push(x,y,z);uv.push((x-g.x0)/(g.x1-g.x0),(z-g.z0)/(g.z1-g.z0));
  const up=(y-K.y)/K.h,n=.5+.5*Math.sin(x*1.3+z*.7)*Math.sin(x*.4-z*1.1);c.copy(rub).lerp(earth,Math.min(1,up*2.2)).lerp(moss,Math.max(0,Math.min(1,up*1.4+n*.5-.35)));col.push(c.r,c.g,c.b);}
 for(let j=0;j<NS;j++)idx.push(0,1+(j+1)%NS,1+j);
 for(let i=1;i<NR;i++)for(let j=0;j<NS;j++){const a=1+(i-1)*NS+j,b=1+(i-1)*NS+(j+1)%NS,d=a+NS,e=b+NS;idx.push(a,b,d,b,e,d);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,dhkMat());m.receiveShadow=m.castShadow=true;m.name='knoll:'+K.id;m.userData.inspectLabel='The breakdown (the fallen roof, grown over)';grp.add(m);
 /* the fallen roof's blocks: heaped on the pile, a few strewn past its foot */
 const n=Math.round(K.r*2.4),bm=new THREE.InstancedMesh(DHK.blockGeo||(DHK.blockGeo=new THREE.DodecahedronGeometry(1,0)),DHK.blockMat||(DHK.blockMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95,flatShading:true})),n),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler();
 for(let i=0;i<n;i++){const a=R.range(0,TAU),d=K.r*Math.sqrt(R.next())*1.08,x=K.c[0]+Math.cos(a)*d,z=K.c[1]+Math.sin(a)*d,q=DH.knollAt(x,z),y=q?q.y:K.y,s=R.range(.25,1.15)*(1.15-.6*d/K.r);
  M.compose(new THREE.Vector3(x,y+s*.15,z),Q.setFromEuler(E.set(R.range(0,TAU),R.range(0,TAU),R.range(0,TAU))),new THREE.Vector3(s*R.range(.8,1.3),s*R.range(.5,.85),s));bm.setMatrixAt(i,M);
  bm.setColorAt(i,c.setHex([0x3a3634,0x46403c,0x2e2a28,0x55504a][Math.floor(R.next()*4)]).multiplyScalar(R.range(.85,1.1)));}
 bm.castShadow=bm.receiveShadow=true;bm.userData.inspectLabel='Breakdown (the fallen roof)';grp.add(bm);
 const q=K.r*.82,top=K.y+K.h+.6;for(const [hx,hz] of [[.92,.38],[.38,.92],[.71,.71]])KWALK.block([K.c[0]-q*hx,K.c[0]+q*hx,K.c[1]-q*hz,K.c[1]+q*hz,K.y-.5,top],'knoll');
 return idx.length/3+n*36;}
/* every pile, in a cell of its well (with the world: buildWorld, after the sites) */
function dhKnolls(){DHK.groups.length=0;const by={};for(const K of DH.KNOLLS)(by[K.well]||(by[K.well]=[])).push(K);
 for(const w in by){const g=new THREE.Group();g.userData.cell='knolls '+w;let tris=0;for(const K of by[w])tris+=dhkPile(K,g);WORLD.add(g);DHK.groups.push(g);
  const bx=new THREE.Box3();for(const K of by[w])bx.union(new THREE.Box3(new THREE.Vector3(K.c[0]-K.r-1,K.y-1,K.c[1]-K.r-1),new THREE.Vector3(K.c[0]+K.r+1,K.y+K.h+2,K.c[1]+K.r+1)));
  const sp=bx.getBoundingSphere(new THREE.Sphere());DH_CELLS.list.push({k:'knolls '+w,g,c:sp.center,r:sp.radius,under:true,tris});}
 return DH.KNOLLS.length;}
/* the piles' flora: the Throne kit again, its host swapped for the wells' floors (the ground the floor and the piles, the mask the
   piles and a skirt of DHK.SKIRT m round them, off the floors' sites; the fields its skylight zone's: skylight 1, humid, the
   piles' slope, a little rock), one pass a well round its piles; baked apart after the world's, with the tunnels' fungi (88), by
   dhbForest (45).
   The world's Throne trees are kept as they were (THRONE.TREES); the wells' are DHK.trees */
function dhKnollFlora(tq){if(typeof THRONE==='undefined'||!DH.KNOLLS.length)return null;const t0=performance.now(),H=BIO.host,K=DH.KNOLLS,S=DHK.SKIRT;
 const keep={t:H.terrainH,m:H.mask,f:H.fields,o:H.origin,c:H.center,ob:H.obstacles,age:THRONE.ageAt},world=THRONE.TREES.slice();DHK.trees.length=0;
 const near=(x,z)=>{let b=K[0],bd=1e9;for(const k of K){const d=Math.hypot(x-k.c[0],z-k.c[1])-k.r;if(d<bd){bd=d;b=k;}}return [b,bd];};
 const sites=DH.SITES.filter(s=>(s.district==='hub'||DH.PITS.some(P=>P.id===s.district))&&!s.park);
 const floorY=(x,z)=>{const q=DH.knollAt(x,z);return q?q.y:near(x,z)[0].y;};
 const sl=(x,z)=>{const e=.75;return Math.min(1,Math.hypot(floorY(x+e,z)-floorY(x-e,z),floorY(x,z+e)-floorY(x,z-e))/(2*e)*1.6);};
 H.terrainH=floorY;H.obstacles=sites.map(s=>{const F=DH.FOOT[s.key]||[6,6];return {x:s.x,z:s.z,r:Math.hypot(F[0],F[1])/2+1,y0:s.y-2,y1:s.y+30};});
 /* the ways on the floors (the layout's, as the piles keep off them): no plant on them */
 const B=DH.byId,ways=DH.EDGES.filter(e=>K.some(k=>Math.abs(B[e.a].y-k.y)<2&&Math.abs(B[e.b].y-k.y)<2)).map(e=>({a:B[e.a],b:B[e.b],hw:e.kind==='square'?2.5:(e.w||4)/2+.5}));
 const onWay=(x,z)=>ways.some(w=>{const dx=w.b.x-w.a.x,dz=w.b.z-w.a.z,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-w.a.x)*dx+(z-w.a.z)*dz)/L2));return Math.hypot(w.a.x+dx*t-x,w.a.z+dz*t-z)<w.hw;});
 let reach=S;H.mask=(x,z)=>near(x,z)[1]<reach&&!onWay(x,z)?1:0;   /* the trees on the piles themselves (reach -1.5), the floor's plants their skirt too */
 H.fields={humid:()=>1,wet:()=>.9,skylight:(x,z)=>near(x,z)[1]<S?1:0,slope:sl,rock:(x,z)=>.12+.4*sl(x,z),owned:()=>0,kedge:()=>0,knear:()=>0,
  iwood:(x,z)=>reach>0&&near(x,z)[1]<S?1:0};   /* the understory's ferns and moss (its island-forest ground), for the floor's passes only: no island trees on the piles */
 THRONE.ageAt=()=>2600;const out={wells:0,trees:0,calls:0,instances:0,ms:0};
 try{for(const w of [...new Set(K.map(k=>k.well))]){const ks=K.filter(k=>k.well===w),c=[0,0];ks.forEach(k=>{c[0]+=k.c[0]/ks.length;c[1]+=k.c[1]/ks.length;});
   const R=Math.max(...ks.map(k=>Math.hypot(k.c[0]-c[0],k.c[1]-c[1])+k.r))+S+2;H.center=c;H.origin=[c];
   const q=tq*2.5;   /* small floors: the kit's density at its stations' (the world's tq is for the flank) */
   reach=-1.5;BIO.cur='throne/trees';THRONE.buildTrees(R,q);reach=S;BIO.cur='throne/floor';THRONE.buildFloor(R,q);THRONE.buildUnderstory(R,q);BIO.cur=null;THRONE.TREES.forEach(T=>DHK.trees.push(T));out.wells++;}}
 catch(e){BIO.cur=null;reportErr('the wells’ flora: '+(e.stack||e));}
 finally{H.terrainH=keep.t;H.mask=keep.m;H.fields=keep.f;H.origin=keep.o;H.center=keep.c;H.obstacles=keep.ob;THRONE.ageAt=keep.age;THRONE.TREES.length=0;world.forEach(T=>THRONE.TREES.push(T));}
 out.trees=DHK.trees.length;out.ms=Math.round(performance.now()-t0);return DHK.out=out;}
/* the wells' trees each on its pile (inside it by a metre), on no way, in no site of its floor: the page's check (91) */
function dhkTreesOk(trees){const B=DH.byId,bad=[],sites=DH.SITES.filter(s=>(s.district==='hub'||DH.PITS.some(P=>P.id===s.district))&&!s.park);
 for(const T of trees){const K=DH.KNOLLS.find(k=>Math.hypot(T.x-k.c[0],T.z-k.c[1])<k.r-1);if(!K){bad.push(Math.round(T.x)+','+Math.round(T.z)+' (off a pile)');continue;}
  const w=DH.EDGES.find(e=>{const a=B[e.a],b=B[e.b];if(Math.abs(a.y-K.y)>=2||Math.abs(b.y-K.y)>=2)return false;const dx=b.x-a.x,dz=b.z-a.z,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((T.x-a.x)*dx+(T.z-a.z)*dz)/L2));
   return Math.hypot(a.x+dx*t-T.x,a.z+dz*t-T.z)<(e.kind==='square'?2.5:(e.w||4)/2);});if(w){bad.push(Math.round(T.x)+','+Math.round(T.z)+' (on the way '+w.a+'-'+w.b+')');continue;}
  const s=sites.find(q=>{const F=DH.FOOT[q.key]||[6,6];return Math.hypot(T.x-q.x,T.z-q.z)<Math.min(F[0],F[1])/2;});if(s)bad.push(Math.round(T.x)+','+Math.round(T.z)+' (in '+s.key+')');}
 return bad;}
