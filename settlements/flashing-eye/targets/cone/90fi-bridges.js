// ================================================================= THE FLASHING EYE — the Way of Shrines drawn: the stacks, their stairs, the rope bridges
// The owner, 2026-11-23: "a sequence of rope bridges to reach the main monastery with a shrine on each step". The records are the
// site's (89zfe: FE_STACKS, FE_BRIDGES; the shrines are FE_PLACE records on the stacks' tops, drawn by 90fg). [web]: three.js.
//   a stack    a cluster of hexagonal basalt columns (the coulee's colonnade, the library's rock.columnar in metres): a main column
//              to the top, a ring of lower columns round it (the stack's fluted crown), the landing's shoulder column on the side the
//              bridge arrives from; a paved cap under the shrine
//   a stair    steps cantilevered from the columns, winding up from the landing (the first stack: from the ground) to the top
//   a bridge   planks on two deck ropes, two hand ropes, the hangers between them, a pair of posts at each end, a string of prayer
//              flags along one side; every rope follows the deck's sag (FE_BRIDGES[i].pts)
reseed(34467);
const FE_WAY=new THREE.Group();FE_WAY.name='the Way of Shrines';scene.add(FE_WAY);
// ---------------------------------------------------------------- the stacks
{const pos=[],uv=[],nor=[],idx=[],T=6;
 const hex=(cx,cz,r,y0,y1,rot)=>{const b=pos.length/3,pts=[];for(let k=0;k<6;k++){const a=rot+k*Math.PI/3;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
  for(let k=0;k<6;k++){const p=pts[k],q=pts[(k+1)%6],nx=Math.cos(rot+(k+.5)*Math.PI/3),nz=Math.sin(rot+(k+.5)*Math.PI/3),s0=k*r/T,s1=(k+1)*r/T,i0=pos.length/3;
   for(const [P,s,y] of[[p,s0,y0],[q,s1,y0],[q,s1,y1],[p,s0,y1]]){pos.push(P[0],y,P[1]);uv.push(s,y/T);nor.push(nx,0,nz);}
   idx.push(i0,i0+2,i0+1,i0,i0+3,i0+2);}
  const c0=pos.length/3;pos.push(cx,y1,cz);uv.push(cx/T,cz/T);nor.push(0,1,0);
  for(let k=0;k<6;k++){pos.push(pts[k][0],y1,pts[k][1]);uv.push(pts[k][0]/T,pts[k][1]/T);nor.push(0,1,0);}
  for(let k=0;k<6;k++)idx.push(c0,c0+1+((k+1)%6),c0+1+k);};
 for(const [si,S] of FE_STACKS.entries()){const h=k=>KRAND.unit(KRAND.hash(34468,si,k)),rot=h(1)*Math.PI,gAt=(x,z,r)=>{let g=terrainH(x,z);for(let k=0;k<6;k++)g=Math.min(g,terrainH(x+Math.cos(k*1.047)*(r||4),z+Math.sin(k*1.047)*(r||4)));return g-3;};   /* each column from below the lowest of the spur's surface under it */
  hex(S.x,S.z,S.r*.7,gAt(S.x,S.z,S.r*.7),S.top-.35,rot);
  for(let k=0;k<7;k++){const a=rot+k*Math.PI*2/7+h(10+k)*.3,d=S.r*(.55+.12*h(20+k)),rr=S.r*(.36+.1*h(30+k)),dy=k%3===0?.35:2+9*h(40+k),x=S.x+Math.cos(a)*d,z=S.z+Math.sin(a)*d;
   hex(x,z,rr,gAt(x,z,rr),S.top-dy,a);}
  /* the crown's foot: broken columns standing a few metres out of the spur, so the gendarme grows from the arete */
  for(let k=0;k<9;k++){const a=rot+k*Math.PI*2/9+h(60+k)*.5,d=S.r*(.95+.35*h(70+k)),x=S.x+Math.cos(a)*d,z=S.z+Math.sin(a)*d,rr=S.r*(.18+.12*h(80+k)),gy=terrainH(x,z);hex(x,z,rr,gAt(x,z,rr),gy+1.5+6*h(90+k),a);}
  hex(S.land[0],S.land[1],S.landR,gAt(S.land[0],S.land[1],S.landR),S.landing-.3,rot+.3);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);
 const map=MAT.feColumnar&&MAT.feColumnar.map;if(map){map.wrapS=map.wrapT=THREE.RepeatWrapping;}
 const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:map||null,color:0xffffff,roughness:.95,metalness:0}));   /* untinted: the face's own colonnade (90fe's shader takes the same map at the same 6 m) */
 m.name='the Way of Shrines: its basalt stacks';m.castShadow=m.receiveShadow=true;m.userData.inspectLabel='The Way of Shrines: a stack of basalt columns';FE_WAY.add(m);
 /* the paved caps under the shrines and on the landings */
 const cap=new THREE.MeshStandardMaterial({color:0x8c8984,roughness:.9});
 for(const S of FE_STACKS){const c=new THREE.Mesh(new THREE.CylinderGeometry(S.r*.98,S.r*.98,.3,6),cap);c.position.set(S.x,S.top-.15,S.z);FE_WAY.add(c);
  {const l=new THREE.Mesh(new THREE.CylinderGeometry(S.landR,S.landR,.3,6),cap);l.position.set(S.land[0],S.landing-.15,S.land[1]);FE_WAY.add(l);}}}
// ---------------------------------------------------------------- the stairs: steps winding up each stack
{const steps=[];
 for(const S of FE_STACKS){const y0=S.landing,rise=S.top-y0,n=Math.ceil(rise/.25),R=S.r*1.12,a0=Math.atan2(S.dir[1],S.dir[0]),turns=rise/24;   /* about 0.65 m of arc a step at 0.25 m a rise */
  for(let k=0;k<n;k++){const t=(k+.5)/n,a=a0+.45+t*turns*Math.PI*2,y=y0+rise*(k+1)/n;steps.push([S.x+Math.cos(a)*R,y,S.z+Math.sin(a)*R,-a]);}}
 /* the stair up the spur's nose, from the Stair of the Eye's head to the first landing: a step every 0.5 m on the crest, never down */
 {const A=FE_NOSE.from,S=FE_STACKS[0],Bp=S.land,L=Math.hypot(Bp[0]-A[0],Bp[1]-A[1]),yaw=Math.atan2(Bp[0]-A[0],Bp[1]-A[1]);let y=-1e9;
  for(let s=0;s<=L;s+=.5){const x=A[0]+(Bp[0]-A[0])*s/L,z=A[1]+(Bp[1]-A[1])*s/L;y=Math.min(S.landing,Math.max(y,terrainH(x,z)+.12));steps.push([x,y,z,yaw+Math.PI/2]);}}
 const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1.7,.22,.55),new THREE.MeshStandardMaterial({color:0x6e6a66,roughness:.95}),steps.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
 steps.forEach((s,i)=>{e.set(0,s[3],0);q.setFromEuler(e);M.compose(new THREE.Vector3(s[0],s[1]-.11,s[2]),q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,M);});
 im.name='the Way of Shrines: its stairs';im.castShadow=true;FE_WAY.add(im);window._feSteps=steps.length;}
// ---------------------------------------------------------------- the rope bridges
{const planks=[],rope=new THREE.MeshStandardMaterial({color:0x5a4632,roughness:.95}),post=new THREE.MeshStandardMaterial({color:0x4a3a2a,roughness:.9}),hang=[],flags=[];
 const at=(P,t)=>{const f=t*(P.length-1),i=Math.min(P.length-2,Math.floor(f)),u=f-i;return[P[i][0]+(P[i+1][0]-P[i][0])*u,P[i][1]+(P[i+1][1]-P[i][1])*u,P[i][2]+(P[i+1][2]-P[i][2])*u];};
 const COL=[0x2a5ac8,0xf2f0ea,0xc8302a,0x2e8a3e,0xe8c030];
 for(const B of FE_BRIDGES){const P=B.pts,dx=B.b[0]-B.a[0],dz=B.b[2]-B.a[2],L=Math.hypot(dx,dz),side=[-dz/L,dx/L],yaw=Math.atan2(dx,dz);
  const off=(p,s,dy)=>new THREE.Vector3(p[0]+side[0]*s,p[1]+dy,p[2]+side[1]*s);
  const n=Math.round(B.span/.42);for(let k=0;k<=n;k++){const t=k/n,p=at(P,t),p2=at(P,Math.min(1,t+.01)),p1=at(P,Math.max(0,t-.01)),pitch=Math.atan2(p2[1]-p1[1],Math.hypot(p2[0]-p1[0],p2[2]-p1[2]));planks.push([p,yaw,pitch]);}
  for(const [s,dy] of[[-.78,-.04],[.78,-.04],[-.82,1.05],[.82,1.05]]){const c=new THREE.CatmullRomCurve3(P.map(p=>off(p,s,dy)));const t=new THREE.Mesh(new THREE.TubeGeometry(c,64,dy>0?.035:.045,5,false),rope);t.castShadow=true;FE_WAY.add(t);}
  for(let k=1;k<n;k+=3){const p=at(P,k/n);for(const s of[-.8,.8]){const a=off(p,s,0),b=off(p,s,1.05);hang.push(a.x,a.y,a.z,b.x,b.y,b.z);}}
  for(let k=1;k<n;k+=2){const p=at(P,k/n),q=off(p,.86,1.55-.25*Math.sin(Math.PI*k/n));flags.push([q.x,q.y,q.z,yaw,COL[k%5]]);}
  for(const [E,end] of[[B.a,0],[B.b,1]])for(const s of[-.95,.95]){const v=off(E,s,0),m=new THREE.Mesh(new THREE.BoxGeometry(.28,2.2,.28),post);m.position.set(v.x,v.y+1.05,v.z);m.castShadow=true;FE_WAY.add(m);}}
 const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1.7,.07,.32),new THREE.MeshStandardMaterial({color:0x7a6248,roughness:.9}),planks.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(0,0,0,'YXZ');
 planks.forEach((p,i)=>{e.set(-p[2],p[1],0);q.setFromEuler(e);M.compose(new THREE.Vector3(p[0][0],p[0][1],p[0][2]),q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,M);});
 im.name='the Way of Shrines: the bridges\' planks';im.castShadow=im.receiveShadow=true;FE_WAY.add(im);
 const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hang,3));FE_WAY.add(new THREE.LineSegments(hg,new THREE.LineBasicMaterial({color:0x3a2e22})));
 const fm=new THREE.InstancedMesh(new THREE.PlaneGeometry(.34,.44),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,side:THREE.DoubleSide}),flags.length);
 flags.forEach((f,i)=>{e.set(0,f[3]+Math.PI/2,0);q.setFromEuler(e);M.compose(new THREE.Vector3(f[0],f[1]-.22,f[2]),q,new THREE.Vector3(1,1,1));fm.setMatrixAt(i,M);fm.setColorAt(i,new THREE.Color(f[4]));});
 fm.name='the Way of Shrines: prayer flags';FE_WAY.add(fm);window._feBridgeParts={planks:planks.length,flags:flags.length};}
FE_WAY.traverse(o=>{o.userData.probeSkip=true;});
window._feWay={stacks:FE_STACKS.length,bridges:FE_BRIDGES.length,spans:FE_BRIDGES.map(B=>+B.span.toFixed(1)),steps:window._feSteps};
