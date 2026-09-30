// ---------------------------------------------------------------- ring sea rig: oars and paddles
// One InstancedMesh per bank, animated: the stroke sweeps the blade aft IN the water and feathers
// it back ABOVE it. A bank is n oars a side between uA and uB, pivoting at the hull at height hF
// (or at explicit points for paddlers). Oars are built for starboard; port oars are mirrored in z.
//   len outboard length, inb loom inboard, bladeL/bladeW, r shaft radius, sweep (rad), lift (rad),
//   rate (strokes/s), phase, paddle: true = pivot at the hand, steep, no loom
function rsOars(V,H,o){const sides=o.sides||[-1,1],n=o.n,len=o.len,inb=o.inb==null?len*.35:o.inb,bl=o.bladeL||len*.28,bw=o.bladeW||.18,r=o.r||.045;
 const geo=new THREE.CylinderGeometry(r,r*.85,len+inb,6,1);geo.rotateX(Math.PI/2);geo.translate(0,0,(len-inb)/2);
 const blade=new THREE.BoxGeometry(.035,bw,bl);blade.translate(0,0,len-bl/2);
 const G=new THREE.BufferGeometry();{const a=geo.toNonIndexed(),b=blade.toNonIndexed();const cat=k=>{const x=a.attributes[k].array,y=b.attributes[k].array,z=new Float32Array(x.length+y.length);z.set(x);z.set(y,x.length);return z;};
  G.setAttribute('position',new THREE.BufferAttribute(cat('position'),3));G.setAttribute('normal',new THREE.BufferAttribute(cat('normal'),3));G.setAttribute('uv',new THREE.BufferAttribute(cat('uv'),2));
  const C=rsCol(o.col||0xa88660),cc=new Float32Array(G.attributes.position.count*3);for(let i=0;i<cc.length;i+=3){cc[i]=C.r;cc[i+1]=C.g;cc[i+2]=C.b;}G.setAttribute('color',new THREE.BufferAttribute(cc,3));}
 const pivots=[];
 if(o.points){for(const s of sides)for(const P of o.points)pivots.push({s,p:[P[0],P[1],s*Math.abs(P[2])]});}
 else for(const a of rsAlong(H,o.uA,o.uB,n,o.hF,sides)){const k=o.out||.08;pivots.push({s:a.s,p:[a.p[0]+a.n.x*k,a.p[1]+a.n.y*k,a.p[2]+a.n.z*k]});}
 const im=new THREE.InstancedMesh(G,rsMat('woodI'),pivots.length);im.name=(o.name||'oars');im.frustumCulled=false;
 const sweep=o.sweep==null?.42:o.sweep,lift=o.lift==null?.12:o.lift,rate=o.rate||.45,ph=o.phase||0,imm=o.immerse==null?.25:o.immerse;
 const m=new THREE.Matrix4(),mir=new THREE.Matrix4().makeScale(1,1,-1),q=new THREE.Quaternion(),d=new THREE.Vector3(),Z=new THREE.Vector3(0,0,1);
 const pose=t=>{pivots.forEach((P,i)=>{const pitch0=o.pitch!=null?o.pitch:Math.asin(clamp((P.p[1]+imm)/len,0,.98));const a=t*rate*TAU+ph+(o.ripple||0)*i/pivots.length;
   const psi=sweep*Math.sin(a),pitch=pitch0-lift*Math.max(0,Math.cos(a));d.set(Math.sin(psi)*Math.cos(pitch),-Math.sin(pitch),Math.cos(psi)*Math.cos(pitch));
   q.setFromUnitVectors(Z,d);m.makeRotationFromQuaternion(q);if(P.s<0)m.premultiply(mir);m.setPosition(P.p[0],P.p[1],P.p[2]);im.setMatrixAt(i,m);});
  im.instanceMatrix.needsUpdate=true;};
 pose(0);im.userData.pose=pose;im.userData.tCatch=(Math.PI-ph)/(rate*TAU);V.group.add(im);V.anims.push(t=>pose(t));V.oars=(V.oars||0)+pivots.length;return im;}

// ---------------------------------------------------------------- sails
// A sail is a ruled surface between two edge curves drawn IN THE SAIL'S OWN PLANE: A(t) and Bf(t)
// return 2D [s,t] points (metres) for t in 0..1; O is the plane's origin, U and V its axes in the
// vessel frame. belly (m) bows the cloth along U x V (sign picks the side); scallop = number of
// battened panels (junk rigs). The texture is painted by draw(g,W,H,outlinePx) over the 2D bbox.
function rsSail(B,o){const nu=o.nu||20,nv=o.nv||12;const U=rsV(o.U).normalize(),Vv=rsV(o.V).normalize(),N=new THREE.Vector3().crossVectors(U,Vv).normalize();
 const A=[],Bf=[];for(let i=0;i<=nu;i++){A.push(o.A(i/nu));Bf.push(o.Bf(i/nu));}
 let s0=1e9,s1=-1e9,t0=1e9,t1=-1e9;for(const p of A.concat(Bf)){s0=Math.min(s0,p[0]);s1=Math.max(s1,p[0]);t0=Math.min(t0,p[1]);t1=Math.max(t1,p[1]);}
 const dS=Math.max(.01,s1-s0),dT=Math.max(.01,t1-t0);const W=512,Hh=dT/dS>1.4?1024:dT/dS<.7?256:512;
 const outline=A.map(p=>[(p[0]-s0)/dS*W,(1-(p[1]-t0)/dT)*Hh]).concat(Bf.slice().reverse().map(p=>[(p[0]-s0)/dS*W,(1-(p[1]-t0)/dT)*Hh]));
 const mk=rsSailMat(o.key,W,Hh,o.draw,outline);const bel=o.belly||0,sc=o.scallop||0;
 const g=rsGrid((u,v)=>{const i=Math.round(u*nu);const a=A[i],b=Bf[i];const s=lerp(a[0],b[0],v),t=lerp(a[1],b[1],v);
   let off=bel*Math.sin(Math.PI*v)*smooth01(u/.25);if(sc)off*=.55+.45*Math.abs(Math.sin(Math.PI*u*sc));
   return[o.O[0]+U.x*s+Vv.x*t+N.x*off,o.O[1]+U.y*s+Vv.y*t+N.y*off,o.O[2]+U.z*s+Vv.z*t+N.z*off];},nu,nv,
  (u,v)=>{const i=Math.round(u*nu);const a=A[i],b=Bf[i];return[(lerp(a[0],b[0],v)-s0)/dS,(lerp(a[1],b[1],v)-t0)/dT];});
 rsPut(B,mk,g,null,null,null,0xffffff);
 // a point on the sail in the vessel frame (for battens, sheets, spars that follow the cloth)
 const at=(u,v)=>{const i=Math.round(clamp(u,0,1)*nu);const a=A[i],b=Bf[i];const s=lerp(a[0],b[0],v),t=lerp(a[1],b[1],v);let off=bel*Math.sin(Math.PI*v)*smooth01(u/.25);if(sc)off*=.55+.45*Math.abs(Math.sin(Math.PI*u*sc));
  return[o.O[0]+U.x*s+Vv.x*t+N.x*off,o.O[1]+U.y*s+Vv.y*t+N.y*off,o.O[2]+U.z*s+Vv.z*t+N.z*off];};
 return{mk,at,A,Bf};}
function smooth01(x){x=clamp(x,0,1);return x*x*(3-2*x);}
// a spar along the edge of a sail (v=0 or v=1), as a tube following the cloth
function rsSailEdge(B,S,v,r,col,uA,uB,mk){const pts=[];uA=uA||0;uB=uB==null?1:uB;for(let i=0;i<=16;i++)pts.push(S.at(lerp(uA,uB,i/16),v));return rsTube(B,mk||'wood',pts,r,col,48,6);}
// ---------------------------------------------------------------- spars, rigging, flags
// bamboo: a spar with node rings every `node` metres (the Dragons-2 claw spars)
function rsBamboo(B,a,b,r,col,node,ringCol){rsLink(B,'wood',a,b,r,col,8);if(!node)return;const A=rsV(a),Bv=rsV(b),L=A.distanceTo(Bv);const d=Bv.clone().sub(A).normalize();
 const q=new THREE.Quaternion().setFromUnitVectors(_rsUp,d);for(let x=node;x<L-.2;x+=node){const p=A.clone().addScaledVector(d,x);rsPut(B,'rope',new THREE.CylinderGeometry(r*1.25,r*1.25,r*1.2,8,1),[p.x,p.y,p.z],q,null,ringCol||0x5a4128);}}
function rsRope(B,a,b,r,col){return rsLink(B,'rope',a,b,r||.025,col||0x3a3026,4);}
// a pennant streaming aft from p: length, width, colours alternate per segment
function rsPennant(B,p,len,w,cols,droop){const segs=6,pts=[];for(let i=0;i<=segs;i++){const t=i/segs;pts.push([p[0]-t*len,p[1]-(droop||.15)*len*t*t+Math.sin(t*5)*.25*t,p[2]+Math.sin(t*4)*.3*t]);}
 for(let i=0;i<segs;i++){const a=pts[i],b=pts[i+1],hw=w*(1-i/segs)/2,hw2=w*(1-(i+1)/segs)/2;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([a[0],a[1]+hw,a[2],a[0],a[1]-hw,a[2],b[0],b[1]+hw2,b[2],a[0],a[1]-hw,a[2],b[0],b[1]-hw2,b[2],b[0],b[1]+hw2,b[2]],3));g.computeVertexNormals();
  rsPut(B,'cloth',g,null,null,null,cols[i%cols.length]);}}
// a round shield hung on the rail at hull point a (from rsAlong)
function rsShield(B,a,r,col,boss){const N=a.n;const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),N);const p=[a.p[0]+N.x*.05,a.p[1]+N.y*.05,a.p[2]+N.z*.05];
 rsPut(B,'paint',new THREE.CylinderGeometry(r,r,.05,14,1).rotateX(Math.PI/2),p,q,null,col);
 if(boss)rsSphere(B,'metal',r*.25,[p[0]+N.x*.04,p[1]+N.y*.04,p[2]+N.z*.04],[1,1,1],boss,8,6);}
