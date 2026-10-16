// prefix: dhk
// ================================================================= DHELV: THE WELLS' FLOORS (the owner, review 3: "the square is one low hill, no rocks,
// with the park lanes on top of it ... ferns and small trees there rather than the siphon tree"; each well's bottom "a low grassy
// hill, place farms and other structures on top of it, and infill with flora"). [web] The layout's HILLS (41: a dome under each
// opening, level pads under the buildings on it), drawn in the library's turf, the layout's ways over each one drawn as paths
// (the square's lanes, the wells' streets), walked (their floors written to the walk map, so the walkers and the nav's grids
// climb them), and planted by the Throne kit in a pass of its own after the world's forests: its island-forest ground (tree
// ferns, lehua, star aloes: no siphon trees), its understory's ferns and moss, off the paths and the pads. Drawn underground in
// cells (DH_CELLS: within its reach of the camera wherever it is; the plants too: dhSplitBiome keeps them apart by userData.under).
const DHK={WALK:2.5,SEG:32,TREES:['treefern','lehua','staraloe'],groups:[],trees:[],out:null};
const DHK_MAT={};
function dhkMat(fam,col){if(DHK_MAT[fam])return DHK_MAT[fam];const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,vertexColors:true});
 const L=KMAT.mode==='lib'?KMAT.packed('zeijani',fam):null;
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});m.map=T.map;m.normalMap=T.normalMap;m.roughnessMap=T.roughnessMap;matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 else m.color.set(col);return DHK_MAT[fam]=m;}
/* the ways on a hill's floor (the layout's edges with both ends on it), each with its path's half width */
function dhkWays(H){const B=DH.byId,lo=H.y-.5,hi=H.y+H.h+.5;return DH.EDGES.filter(e=>{const a=B[e.a],b=B[e.b];return a.y>lo&&a.y<hi&&b.y>lo&&b.y<hi&&
  (Math.hypot(a.x-H.c[0],a.z-H.c[1])<H.r||Math.hypot(b.x-H.c[0],b.z-H.c[1])<H.r);}).map(e=>({a:B[e.a],b:B[e.b],hw:e.kind==='square'?1.8:1.5}));}
const dhkSeg=(x,z,w)=>{const dx=w.b.x-w.a.x,dz=w.b.z-w.a.z,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-w.a.x)*dx+(z-w.a.z)*dz)/L2));return Math.hypot(w.a.x+dx*t-x,w.a.z+dz*t-z);};
/* a site's footprint distance (negative inside), as the layout's */
function dhkFoot(s,x,z){const [w,d,o]=DH.FOOT[s.key]||[4,4,'centre'];if(o==='round')return Math.hypot(x-s.x,z-s.z)-w/2;const c=Math.cos(s.ry),sn=Math.sin(s.ry),dx=x-s.x,dz=z-s.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;
 const z0=o==='front'?-d:-d/2,z1=o==='front'?.5:d/2,qx=Math.abs(lx)-w/2,qz=Math.max(z0-lz,lz-z1);return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0);}
/* one hill: rings every metre, 64 round, out to a lip 4 cm under the floor past its foot (no seam against the cavern's floor);
   turf, a little lighter on the top; its paths draped over it 5 cm up; its walk floors (quads of DHK.WALK m, DHK.SEG round) */
function dhkHill(H,grp){const NR=Math.ceil(H.r)+1,NS=64,pos=[],col=[],uv=[],idx=[],c=new THREE.Color(),lo=hc(0x7d8a52),hi=hc(0xa8b46c),y=(x,z)=>{const q=DH.hillAt(x,z);return q?q.y:H.y-.04;};
 const vert=(x,z,yy)=>{pos.push(x,yy,z);uv.push(x/4,z/4);c.copy(lo).lerp(hi,Math.max(0,Math.min(1,(yy-H.y)/H.h)));col.push(c.r,c.g,c.b);return pos.length/3-1;};
 vert(H.c[0],H.c[1],y(H.c[0],H.c[1]));
 for(let i=1;i<=NR;i++)for(let j=0;j<NS;j++){const a=j/NS*TAU,d=Math.min(H.r+.6,H.r*i/(NR-1)),x=H.c[0]+Math.cos(a)*d,z=H.c[1]+Math.sin(a)*d;vert(x,z,y(x,z));}
 for(let j=0;j<NS;j++)idx.push(0,1+(j+1)%NS,1+j);
 for(let i=1;i<NR;i++)for(let j=0;j<NS;j++){const a=1+(i-1)*NS+j,b=1+(i-1)*NS+(j+1)%NS,d=a+NS,e=b+NS;idx.push(a,b,d,b,e,d);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,dhkMat('turf',0x7d8a52));m.receiveShadow=true;m.name='hill:'+H.id;m.userData.inspectLabel=H.well==='hall'?'The park: the hill under the light well':'The well’s hill';grp.add(m);let tris=idx.length/3;
 /* the paths: each way's line over the hill, sampled every metre, clipped at the hill's foot */
 const pp=[],pu=[],pc=[],pi=[],pcol=hc(0xb8a888);
 for(const w of dhkWays(H)){const L=Math.hypot(w.b.x-w.a.x,w.b.z-w.a.z),ux=(w.b.x-w.a.x)/L,uz=(w.b.z-w.a.z)/L,n=Math.ceil(L);let prev=-1;
  for(let k=0;k<=n;k++){const t=L*k/n,x=w.a.x+ux*t,z=w.a.z+uz*t;if(Math.hypot(x-H.c[0],z-H.c[1])>H.r){prev=-1;continue;}const b0=pp.length/3;
   for(const sd of [-1,1]){const px=x-uz*w.hw*sd,pz=z+ux*w.hw*sd;pp.push(px,y(px,pz)+.05,pz);pu.push(px/3,pz/3);pc.push(pcol.r,pcol.g,pcol.b);}
   if(prev>=0)pi.push(prev,prev+1,b0,b0,prev+1,b0+1);prev=b0;}}
 if(pp.length){const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));g2.setAttribute('uv',new THREE.Float32BufferAttribute(pu,2));g2.setAttribute('color',new THREE.Float32BufferAttribute(pc,3));
  g2.setIndex(pi);g2.computeVertexNormals();const p=new THREE.Mesh(g2,dhkMat('turfPath',0xb8a888));p.material.side=THREE.DoubleSide;p.receiveShadow=true;p.name='hill paths:'+H.id;grp.add(p);tris+=pi.length/3;}
 /* the walk floors: a fan at the top, then quads ring by ring (each planar enough: the dome is gentle, its pads level) */
 const WN=Math.ceil(H.r/DHK.WALK),WS=DHK.SEG,P=(i,j)=>{const d=Math.min(H.r,i*DHK.WALK),a=j/WS*TAU,x=H.c[0]+Math.cos(a)*d,z=H.c[1]+Math.sin(a)*d;return [x,z,y(x,z)];};
 for(let j=0;j<WS;j++){KWALK.poly({pts:[P(0,0),P(1,j),P(1,j+1)],name:'dh.hill.'+H.id,tag:'ground'});
  for(let i=1;i<WN;i++)KWALK.poly({pts:[P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],name:'dh.hill.'+H.id,tag:'ground'});}
 return tris;}
/* every hill, in a cell of its own (with the world: buildWorld, after the sites) */
function dhHills(){DHK.groups.length=0;for(const H of DH.HILLS){const g=new THREE.Group();g.userData.cell='hill '+H.id;const tris=dhkHill(H,g);WORLD.add(g);DHK.groups.push(g);
  const sp=new THREE.Sphere(new THREE.Vector3(H.c[0],H.y+H.h/2,H.c[1]),H.r+1);DH_CELLS.list.push({k:'hill '+H.id,g,c:sp.center,r:sp.radius,under:true,tris});}
 return DH.HILLS.length;}
/* the hills' flora: the Throne kit again, its host swapped for the wells' floors (the ground the hills, the mask the hills off
   their paths and pads; the fields its island forest's: iwood 1, humid, the hills' slope), its trees only the small ones
   (DHK.TREES, its passes filtered for the pass), one pass a hill; baked apart after the world's, with the tunnels' fungi (88),
   by dhbForest (45). The world's Throne trees are kept as they were (THRONE.TREES); the hills' are DHK.trees */
function dhHillFlora(tq){if(typeof THRONE==='undefined'||!DH.HILLS.length)return null;const t0=performance.now(),H=BIO.host;
 const keep={t:H.terrainH,m:H.mask,f:H.fields,o:H.origin,c:H.center,ob:H.obstacles,age:THRONE.ageAt,passes:THRONE.PASSES},world=THRONE.TREES.slice();DHK.trees.length=0;const out={hills:0,trees:0,ms:0};
 try{for(const L of DH.HILLS){const ways=dhkWays(L),sites=L.pads.map(p=>p.s);let edge=1.5;
   const ok=(x,z)=>Math.hypot(x-L.c[0],z-L.c[1])<L.r-edge&&!ways.some(w=>dhkSeg(x,z,w)<w.hw+.6)&&!sites.some(s=>dhkFoot(s,x,z)<1.2);
   const yy=(x,z)=>{const q=DH.hillAt(x,z);return q?q.y:L.y;},sl=(x,z)=>{const e=.75;return Math.min(1,Math.hypot(yy(x+e,z)-yy(x-e,z),yy(x,z+e)-yy(x,z-e))/(2*e)*1.6);};
   H.terrainH=yy;H.obstacles=[];H.mask=(x,z)=>ok(x,z)?1:0;
   H.fields={humid:()=>1,wet:()=>.9,iwood:(x,z)=>ok(x,z)?1:0,slope:sl,rock:()=>.08,owned:()=>0,kedge:()=>0,knear:()=>0};
   THRONE.ageAt=()=>2600;H.center=L.c;H.origin=[L.c];const q=tq*2.5;
   THRONE.PASSES=keep.passes.filter(P=>DHK.TREES.includes(THRONE.SPECIES[P.sp].key));edge=4;
   BIO.cur='throne/trees';THRONE.buildTrees(L.r+2,q);THRONE.TREES.forEach(T=>DHK.trees.push(T));edge=1.5;
   BIO.cur='throne/floor';THRONE.buildFloor(L.r+2,q);THRONE.buildUnderstory(L.r+2,q);BIO.cur=null;out.hills++;}}
 catch(e){BIO.cur=null;reportErr('the hills’ flora: '+(e.stack||e));}
 finally{H.terrainH=keep.t;H.mask=keep.m;H.fields=keep.f;H.origin=keep.o;H.center=keep.c;H.obstacles=keep.ob;THRONE.ageAt=keep.age;THRONE.PASSES=keep.passes;THRONE.TREES.length=0;world.forEach(T=>THRONE.TREES.push(T));}
 out.trees=DHK.trees.length;out.ms=Math.round(performance.now()-t0);return DHK.out=out;}
/* the hills' trees each on its hill (a metre in from its foot), on no path, on no pad: the page's check (91) */
function dhkTreesOk(trees){const bad=[];
 for(const T of trees){const L=DH.HILLS.find(h=>Math.hypot(T.x-h.c[0],T.z-h.c[1])<h.r-1);if(!L){bad.push(Math.round(T.x)+','+Math.round(T.z)+' (off a hill)');continue;}
  const w=dhkWays(L).find(w=>dhkSeg(T.x,T.z,w)<w.hw);if(w){bad.push(Math.round(T.x)+','+Math.round(T.z)+' (on the path '+w.a.id+'-'+w.b.id+')');continue;}
  const s=L.pads.find(p=>dhkFoot(p.s,T.x,T.z)<0);if(s)bad.push(Math.round(T.x)+','+Math.round(T.z)+' (on '+s.s.key+'’s pad)');}
 return bad;}
