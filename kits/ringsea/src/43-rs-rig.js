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
 {const amp=o.flutter==null?Math.min(.12,.04+.06*Math.abs(bel)):o.flutter,D=N.clone().multiplyScalar((bel<0?-1:1)*amp),c=[];   // the wind's flutter vector (41-rs-tex.js rsSailWind)
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv;let w=Math.sin(Math.PI*v)*smooth01(u/.25)*smooth01((1-u)/.2);if(sc)w*=Math.abs(Math.sin(Math.PI*u*sc));c.push(.5+.5*D.x*w,.5+.5*D.y*w,.5+.5*D.z*w);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));}
 rsPut(B,mk,g,null,null,null,0xffffff);
 {const pa=g.attributes.position,sid=B.sailN=(B.sailN||0)+1;for(let i=0;i<pa.count;i+=3)B.sail.push([pa.getX(i),pa.getY(i),pa.getZ(i),sid,B.rig]);}
 // the cloth, densely sampled (<= ~0.3 m apart), for rsRigEnd: what lies on this sail turns with it
 if(B.rig){const col=(i,v)=>{const a=A[i],b=Bf[i];const s=lerp(a[0],b[0],v),t=lerp(a[1],b[1],v);const u=i/nu;let off=bel*Math.sin(Math.PI*v)*smooth01(u/.25);if(sc)off*=.55+.45*Math.abs(Math.sin(Math.PI*u*sc));
   return[o.O[0]+U.x*s+Vv.x*t+N.x*off,o.O[1]+U.y*s+Vv.y*t+N.y*off,o.O[2]+U.z*s+Vv.z*t+N.z*off];};
  const m=Math.max(2,Math.ceil(Math.max(dS,dT)/nu/.3)),kv=Math.max(nv*2,Math.ceil(Math.max(dS,dT)/.3));
  for(let j=0;j<=kv;j++){const v=j/kv;let prev=col(0,v);B.rig.pts.push(prev);for(let i=1;i<=nu;i++){const c=col(i,v);for(let k=1;k<=m;k++){const f=k/m;B.rig.pts.push([lerp(prev[0],c[0],f),lerp(prev[1],c[1],f),lerp(prev[2],c[2],f)]);}prev=c;}}}
 // a point on the sail in the vessel frame (for battens, sheets, spars that follow the cloth)
 const at=(u,v)=>{const i=Math.round(clamp(u,0,1)*nu);const a=A[i],b=Bf[i];const s=lerp(a[0],b[0],v),t=lerp(a[1],b[1],v);let off=bel*Math.sin(Math.PI*v)*smooth01(u/.25);if(sc)off*=.55+.45*Math.abs(Math.sin(Math.PI*u*sc));
  return[o.O[0]+U.x*s+Vv.x*t+N.x*off,o.O[1]+U.y*s+Vv.y*t+N.y*off,o.O[2]+U.z*s+Vv.z*t+N.z*off];};
 return{mk,at,A,Bf};}
// ---- trim: a rig is everything that turns with a sail about its mast when the vessel trims to the wind.
// rsRig(B, mast, {gain}) opens one (mast: [x,z] for a vertical mast, or [[x,y,z],[x,y,z]] base and head of a
// raked one); every piece put until rsRigEnd(B) (or the next rsRig, or rsBake) is collected, and each of its
// vertices within 0.45 m of a sail of the rig turns with it (weight 1): yards, battens, edge spars (whole, when a
// quarter of the piece lies on the cloth), a sheet's end on the clew (a link's two ends move on their own). The other end of a sheet, on deck, stays put; the mast stands on the axis, so it does not
// move. gain scales the vessel's trim angle for this rig (0.0 = never trims).
function rsRig(B,mast,o){if(B.rig)rsRigEnd(B);o=o||{};let p,ax=0,az=0;
 if(Array.isArray(mast[0])){const a=mast[0],b=mast[1],dy=b[1]-a[1];p=a.slice();ax=(b[0]-a[0])/dy;az=(b[2]-a[2])/dy;}else p=[mast[0],0,mast[1]];
 B.rig={p,ax,az,gain:o.gain==null?1:o.gain,geos:[],pts:[]};return B.rig;}
function rsRigEnd(B){const R=B.rig;if(!R)return;B.rig=null;const H=new Map(),cs=.5,key=(x,y,z)=>x+','+y+','+z;
 for(const q of R.pts){const k=key(Math.floor(q[0]/cs),Math.floor(q[1]/cs),Math.floor(q[2]/cs));(H.get(k)||H.set(k,[]).get(k)).push(q);}
 const near=(x,y,z,r)=>{const r2=r*r,i0=Math.floor(x/cs),j0=Math.floor(y/cs),k0=Math.floor(z/cs);
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){const L=H.get(key(i0+i,j0+j,k0+k));if(L)for(const q of L)if((q[0]-x)**2+(q[1]-y)**2+(q[2]-z)**2<r2)return true;}return false;};
 for(const g of R.geos){const pa=g.attributes.position,n=pa.count,ex=g.attributes.rsAux;
  if(ex){if(ex.getW(0)===2&&near(ex.getX(0),ex.getY(0),ex.getZ(0),.6)){const a2=g.attributes.rsAux2;   // a flag on a yard turns with the yard
    for(let i=0;i<n;i++){ex.setXYZW(i,R.p[0],R.p[1],R.p[2],3);a2.setXYZW(i,R.ax,R.az,R.gain,a2.getW(i));}}continue;}
  // a link (spar, rope: rsLink) moves each end on its own; any other piece moves whole when a quarter of it lies on the sail
  const X1=new Float32Array(n*4),X2=new Float32Array(n*4),hit=[];for(let i=0;i<n;i++)hit.push(near(pa.getX(i),pa.getY(i),pa.getZ(i),.45));
  const cnt=hit.filter(Boolean).length,W=g.userData.rsWith,whole=W?!!W.userData.rsWhole:!g.userData.rsEnds&&cnt>=.25*n;g.userData.rsWhole=whole;let any=false;   // a tube's caps go with the tube
  for(let i=0;i<n;i++)if(g.userData.rsEnds?hit[i]:whole){any=true;X1.set([R.p[0],R.p[1],R.p[2],1],i*4);X2.set([R.ax,R.az,R.gain,0],i*4);}
  if(any){g.setAttribute('rsAux',new THREE.BufferAttribute(X1,4));g.setAttribute('rsAux2',new THREE.BufferAttribute(X2,4));}}
 B.rigs.push({p:R.p,ax:R.ax,az:R.az,gain:R.gain});R.geos=null;R.pts=null;}
function smooth01(x){x=clamp(x,0,1);return x*x*(3-2*x);}
// a spar along the edge of a sail (v=0 or v=1), as a tube following the cloth
function rsSailEdge(B,S,v,r,col,uA,uB,mk){const pts=[];uA=uA||0;uB=uB==null?1:uB;for(let i=0;i<=16;i++)pts.push(S.at(lerp(uA,uB,i/16),v));return rsTube(B,mk||'wood',pts,r,col,48,6);}
// ---------------------------------------------------------------- spars, rigging, flags
// bamboo: a spar with node rings every `node` metres (the Dragons-2 claw spars)
function rsBamboo(B,a,b,r,col,node,ringCol){rsLink(B,'wood',a,b,r,col,8);if(!node)return;const A=rsV(a),Bv=rsV(b),L=A.distanceTo(Bv);const d=Bv.clone().sub(A).normalize();
 const q=new THREE.Quaternion().setFromUnitVectors(_rsUp,d);for(let x=node;x<L-.2;x+=node){const p=A.clone().addScaledVector(d,x);rsPut(B,'rope',new THREE.CylinderGeometry(r*1.25,r*1.25,r*1.2,8,1),[p.x,p.y,p.z],q,null,ringCol||0x5a4128);}}
function rsRope(B,a,b,r,col){return rsLink(B,'rope',a,b,r||.025,col||0x3a3026,4);}
// a pennant streaming aft from p: length, width, colours alternate per segment. It flutters in the vertex shader
// (rsAux kind 2, by its distance from the root) and swings about its root to the apparent wind (uRsFlag).
function rsPennant(B,p,len,w,cols,droop){const segs=6,pts=[];for(let i=0;i<=segs;i++){const t=i/segs;pts.push([p[0]-t*len,p[1]-(droop||.15)*len*t*t+Math.sin(t*5)*.25*t,p[2]+Math.sin(t*4)*.3*t]);}
 for(let i=0;i<segs;i++){const a=pts[i],b=pts[i+1],hw=w*(1-i/segs)/2,hw2=w*(1-(i+1)/segs)/2;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([a[0],a[1]+hw,a[2],a[0],a[1]-hw,a[2],b[0],b[1]+hw2,b[2],a[0],a[1]-hw,a[2],b[0],b[1]-hw2,b[2],b[0],b[1]+hw2,b[2]],3));g.computeVertexNormals();
  const d0=i/segs*len,d1=(i+1)/segs*len,X1=new Float32Array(24),X2=new Float32Array(24);[d0,d0,d1,d0,d1,d1].forEach((d,k)=>{X1.set([p[0],p[1],p[2],2],k*4);X2.set([0,0,1,d],k*4);});
  g.setAttribute('rsAux',new THREE.BufferAttribute(X1,4));g.setAttribute('rsAux2',new THREE.BufferAttribute(X2,4));
  rsPut(B,'cloth',g,null,null,null,cols[i%cols.length]);}}
// a round shield hung on the rail at hull point a (from rsAlong)
function rsShield(B,a,r,col,boss){const N=a.n;const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),N);const p=[a.p[0]+N.x*.05,a.p[1]+N.y*.05,a.p[2]+N.z*.05];
 rsPut(B,'paint',new THREE.CylinderGeometry(r,r,.05,14,1).rotateX(Math.PI/2),p,q,null,col);
 if(boss)rsSphere(B,'metal',r*.25,[p[0]+N.x*.04,p[1]+N.y*.04,p[2]+N.z*.04],[1,1,1],boss,8,6);}
