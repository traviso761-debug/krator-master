// ================================================================= HOST — the farms (P3b): the fields, the farmhouses, the palisade
// Draws FARMS' records (55b). Each field cell is levelled (its top at its highest corner, its banks down to the ground
// under it: the terraces read as steps), its soil the kit's trodden-earth map tinted by what it grows; on it the crop's
// rows, the paddy's water and its rice, the orchard's trees (stack figs, ember plums), the garden's raised beds, the pen's
// fence: all instanced. The farmhouses, the gatehouses and the watch posts are the Beast Riders' (CAT, instanced through
// the town's helpers, 89c); the palisade's run is a stake every half metre, sunk and pointed; the tracks are ribbons.
const FARMS_MESH={};
const FARMS_DRAW=(function(){if(!FARMS)return null;try{
 const t0=performance.now(),F=FARMS,grp=new THREE.Group();grp.name='the farms';grp.userData.farms=true;
 const hsh=(...k)=>KRAND.unit(KRAND.hash(20261019,...k));
 const mark=o=>{o.userData.host=true;o.userData.farms=true;return o;};
 // ---------------------------------------------------------------- the fields: a levelled slab each, with banks
 const SOIL={crop:townLin(0x6e5240),paddy:townLin(0x6a5444),orchard:townLin(0x5a5436),garden:townLin(0x5a4334),pen:townLin(0x83705a),farmstead:townLin(0x8a7560)};
 {const G=townGroundMat('yard','The fields (levelled on their terraces)',{offset:0}),p=[],u=[],c=[],ix=[];
  F.cells.forEach(C=>{const Q=C.corners,top=SOIL[C.kind]||SOIL.crop,bank=top.map(x=>x*.55),y=C.y,base=p.length/3;let col=top;const v=(x,yy,z)=>{p.push(x,yy,z);u.push(x/G.sc,z/G.sc);c.push(col[0],col[1],col[2]);};
   // the top faces up: the corners' order is the ring's, so the winding is taken from their turn
   const up=(Q[1][1]-Q[0][1])*(Q[2][0]-Q[0][0])-(Q[1][0]-Q[0][0])*(Q[2][1]-Q[0][1])>0;
   Q.forEach(q=>v(q[0],y,q[1]));if(up)ix.push(base,base+1,base+2,base,base+2,base+3);else ix.push(base,base+2,base+1,base,base+3,base+2);
   // the banks (darker: earth in shade): each edge from the top down to the ground under it, less half a metre
   col=bank;
   for(let j=0;j<4;j++){const a=Q[j],b=Q[(j+1)%4],k=p.length/3,ya=Math.min(y,groundH(a[0],a[1])-.5),yb=Math.min(y,groundH(b[0],b[1])-.5);
    v(a[0],y,a[1]);v(b[0],y,b[1]);v(b[0],yb,b[1]);v(a[0],ya,a[1]);
    // facing out, away from the cell's middle: (b - a) x (down) points out for one turn of the corners
    const ex=b[0]-a[0],ez=b[1]-a[1],mx=(a[0]+b[0])/2-C.x,mz=(a[1]+b[1])/2-C.z,out=(-ez*mx+ex*mz)<0;
    if(out)ix.push(k,k+1,k+2,k,k+2,k+3);else ix.push(k,k+2,k+1,k,k+3,k+2);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setIndex(ix);g.computeVertexNormals();
  G.m.side=THREE.FrontSide;const me=mark(new THREE.Mesh(g,G.m));me.userData.inspectLabel=G.m.userData.label;grp.add(me);FARMS_MESH.fields=me;}
 // ---------------------------------------------------------------- what grows: rows, rice, beds, posts (one box, instanced)
 const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
 const CROPC={fonio:[0xb8a052,.5,.8],millet:[0x8c8a3c,1.5,.6],'pigeon pea':[0x4f6b2c,1.1,.9],gourd:[0x5d7a30,.35,1.3],rice:[0x7fa83a,.45,.25],bed:[0x4a5a2a,.42,1.6]};
 const BOX=[],put=(cx,cy,cz,len,ry,w,h,col)=>BOX.push({cx,cy,cz,len,ry,w,h,col});
 F.cells.forEach((C,ci)=>{const Q=C.corners,y=C.y;
  // rows run along the cell (corner 0 to 1), spaced across it
  const rowsAcross=(step,fn)=>{const n=Math.floor((C.across-2)/step);for(let r=0;r<n;r++){const f=(1+r*step+step/2)/C.across,a=lerp(Q[0],Q[3],f),b=lerp(Q[1],Q[2],f),L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    fn((a[0]+b[0])/2,(a[1]+b[1])/2,L,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),r);}};
  if(C.kind==='crop'){const K=CROPC[C.crop]||CROPC.fonio;rowsAcross(1.7,(x,z,L,ry,r)=>put(x,y,z,L-2,ry,K[2],K[1]*(.85+.3*hsh(1,ci,r)),K[0]));}
  else if(C.kind==='paddy'){const K=CROPC.rice;rowsAcross(1.25,(x,z,L,ry,r)=>put(x,y-.05,z,L-3,ry,K[2],K[1],K[0]));}
  else if(C.kind==='garden'){const K=CROPC.bed;rowsAcross(2.6,(x,z,L,ry,r)=>{put(x,y,z,L/2-2.5,ry,K[2],.42,0x6b5038);});rowsAcross(2.6,(x,z,L,ry,r)=>put(x,y+.42,z,L/2-3,ry,K[2]-.3,.35,K[0]));}
  else if(C.kind==='pen'){for(let j=0;j<4;j++){const a=Q[j],b=Q[(j+1)%4],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(-(b[1]-a[1]),b[0]-a[0]),m=lerp(a,b,.5);
    put(m[0],y+.55,m[1],L,ry,.12,.12,0x4a3626);put(m[0],y+1.05,m[1],L,ry,.12,.12,0x4a3626);
    for(let t=0;t<=1.0001;t+=1/Math.max(1,Math.round(L/3))){const q=lerp(a,b,t);put(q[0],y,q[1],.18,ry,.18,1.3,0x3e2c20);}}}});
 {const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);
  const mat=new THREE.MeshStandardMaterial({roughness:.9,metalness:0});const im=mark(new THREE.InstancedMesh(g,mat,Math.max(1,BOX.length)));
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),col=new THREE.Color();
  BOX.forEach((B,i)=>{q.setFromEuler(e.set(0,B.ry,0));m4.compose(new THREE.Vector3(B.cx,B.cy,B.cz),q,new THREE.Vector3(B.len,B.h,B.w));im.setMatrixAt(i,m4);im.setColorAt(i,col.setHex(B.col).convertSRGBToLinear());});
  im.count=BOX.length;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();
  im.userData.inspectLabel='The crops (rows, rice, beds, pens)';grp.add(im);FARMS_MESH.crops=im;}
 // ---------------------------------------------------------------- the paddies' water
 {const p=[],ix=[];F.cells.forEach(C=>{if(C.kind!=='paddy')return;const Q=C.corners,cx=C.x,cz=C.z,k=p.length/3;
   Q.forEach(q=>{const dx=cx-q[0],dz=cz-q[1],l=Math.hypot(dx,dz)||1;p.push(q[0]+dx/l*1.1,C.y+.02,q[1]+dz/l*1.1);});ix.push(k,k+2,k+1,k,k+3,k+2,k,k+1,k+2,k,k+2,k+3);});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
  const me=mark(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:new THREE.Color(0x4e6a5a).convertSRGBToLinear(),roughness:.08,metalness:.1,transparent:true,opacity:.86})));
  me.userData.inspectLabel='The paddies\' water';grp.add(me);FARMS_MESH.water=me;}
 // ---------------------------------------------------------------- the orchards: a tree every seven metres
 {const T=[];F.cells.forEach((C,ci)=>{if(C.kind!=='orchard')return;const Q=C.corners,na=Math.max(1,Math.floor((C.along-4)/7)),nc=Math.max(1,Math.floor((C.across-4)/7));
   for(let i=0;i<na;i++)for(let j=0;j<nc;j++){const fa=(i+.5)/na,fc=(j+.5)/nc,a=lerp(Q[0],Q[1],fa),b=lerp(Q[3],Q[2],fa),q=lerp(a,b,fc),j1=hsh(2,ci,i,j),j2=hsh(3,ci,i,j);
    T.push({x:q[0]+(j1-.5)*1.6,z:q[1]+(j2-.5)*1.6,y:C.y,s:.8+.4*hsh(4,ci,i,j),fig:C.crop==='stack fig'});}});
  const trunk=new THREE.CylinderGeometry(.16,.26,2.6,6);trunk.translate(0,1.3,0);const crown=new THREE.IcosahedronGeometry(1,1);
  const mt=mark(new THREE.InstancedMesh(trunk,new THREE.MeshStandardMaterial({color:new THREE.Color(0x4a3a2c).convertSRGBToLinear(),roughness:.95}),Math.max(1,T.length)));
  const mc=mark(new THREE.InstancedMesh(crown,new THREE.MeshStandardMaterial({roughness:.85,flatShading:true}),Math.max(1,T.length)));
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),col=new THREE.Color();
  T.forEach((t,i)=>{m4.compose(new THREE.Vector3(t.x,t.y,t.z),q,new THREE.Vector3(t.s,t.s,t.s));mt.setMatrixAt(i,m4);
   m4.compose(new THREE.Vector3(t.x,t.y+2.6*t.s+1.1*t.s,t.z),q,new THREE.Vector3(2.4*t.s,1.7*t.s,2.4*t.s));mc.setMatrixAt(i,m4);
   mc.setColorAt(i,col.setHex(t.fig?0x3d5a26:0x6a4a2a).convertSRGBToLinear().multiplyScalar(.85+.3*hsh(5,i)));});
  [mt,mc].forEach(m=>{m.count=T.length;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere&&m.computeBoundingSphere();grp.add(m);});
  mt.userData.inspectLabel=mc.userData.inspectLabel='The orchards (stack figs, ember plums)';FARMS_MESH.trees=T.length;}
 // ---------------------------------------------------------------- the palisade: a stake every half metre along each run
 {const L=[];F.palisade.runs.forEach((R,ri)=>{const P=R.pts;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(len/.5));
    for(let k=(i===1?0:1);k<=n;k++){const q=lerp(a,b,k/n);L.push({x:q[0],z:q[1],y:groundH(q[0],q[1])-.6,h:5.6+.6*hsh(6,ri,i,k),r:.92+.16*hsh(7,ri,i,k)});}}});
  const g=new THREE.CylinderGeometry(.24,.26,5.6,7);g.translate(0,2.8,0);const tip=new THREE.ConeGeometry(.24,.7,7);tip.translate(0,5.95,0);
  const geo=(()=>{const A=g.toNonIndexed(),B=tip.toNonIndexed(),pa=A.attributes.position.array,pb=B.attributes.position.array,na=A.attributes.normal.array,nb=B.attributes.normal.array;
   const pos=new Float32Array(pa.length+pb.length);pos.set(pa);pos.set(pb,pa.length);const nor=new Float32Array(na.length+nb.length);nor.set(na);nor.set(nb,na.length);
   const G2=new THREE.BufferGeometry();G2.setAttribute('position',new THREE.BufferAttribute(pos,3));G2.setAttribute('normal',new THREE.BufferAttribute(nor,3));return G2;})();
  // a stake 5.6 m to its point's foot, scaled a little in height (5.6-6.2 m) and girth
  const im=mark(new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:new THREE.Color(0x3a2c22).convertSRGBToLinear(),roughness:.92}),Math.max(1,L.length)));
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion();
  L.forEach((s,i)=>{m4.compose(new THREE.Vector3(s.x,s.y,s.z),q,new THREE.Vector3(s.r,s.h/5.6,s.r));im.setMatrixAt(i,m4);});
  im.count=L.length;im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.userData.inspectLabel='The palisade (sharpened stakes)';grp.add(im);FARMS_MESH.stakes=L.length;}
 // ---------------------------------------------------------------- the farmhouses, the gatehouses and the watch posts
 const lots=F.houses.concat(F.palisade.gates,F.palisade.posts);const R=townInstances(lots,grp,'farms');
 // ---------------------------------------------------------------- the tracks, and the spring's pool
 {const G=townGroundMat('yard','The farm tracks and the forest road (trodden earth)'),col=townLin(0x7a6450),road=townLin(0x86705e);
  const me=mark(townRibbons(F.tracks.concat([{pts:PR.ROAD.pts,w:PR.ROAD.w,road:true}]),G,groundH,W=>W.road?road:col,.35));grp.add(me);FARMS_MESH.tracks=me;}
 {const S=PR.SPRING,n=40,p=[S.x,0,S.z],ix=[];let lo=1e9;for(let k=0;k<n;k++){const a=k/n*TAU;lo=Math.min(lo,groundH(S.x+Math.cos(a)*S.rx,S.z+Math.sin(a)*S.rz));}
  p[1]=lo+.25;for(let k=0;k<n;k++){const a=k/n*TAU;p.push(S.x+Math.cos(a)*S.rx,lo+.25,S.z+Math.sin(a)*S.rz);ix.push(0,k+1,(k+1)%n+1,0,(k+1)%n+1,k+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
  const me=mark(new THREE.Mesh(g,FARMS_MESH.water?FARMS_MESH.water.material:new THREE.MeshStandardMaterial({color:0x4e6a5a})));me.userData.inspectLabel=S.name;grp.add(me);}
 scene.add(grp);FARMS_MESH.group=grp;
 lots.forEach(L=>REG.push({name:L.name,key:'farms.'+L.key,x:L.x,z:L.z,y:L.y,r:Math.hypot(L.w,L.d)/2,h:L.h}));
 return {cells:F.cells.length,boxes:BOX.length,trees:FARMS_MESH.trees,stakes:FARMS_MESH.stakes,buildings:lots.length,tris:Math.round(R.tris),ms:Math.round(performance.now()-t0)};}
 catch(e){reportErr('farms: '+(e&&e.stack||e));return null;}})();
_mark('farms');
