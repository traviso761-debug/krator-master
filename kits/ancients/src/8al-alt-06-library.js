// ================================================================= LIBRARY ALT — "the Reading Star"
// A white ovoid reading hall with six short barrel pods thrust out of it at
// mid-height, each ending in one great round window with a spoked frame, the
// reading rooms. A long curving ramp lifts readers off the plain and into the
// front pod; there is no ground-floor entrance. An oculus lights the hall from
// above. After arco1 #46 and #105 (the white spheroid with radiating porthole
// pods, reached by a long ramp) and arco2 #50-52 (the bulging Moebius shells).
// Ruin: the north-east pod has broken off and lies on the plinth; the hall's
// shell is holed; the ramp broke at its middle pier and its span lies below.
function buildAltLibrary(scene,gx,gz,d){reseed(9910);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),SK=SHELL(d),acc=[],sk=[];
 REGISTER({name:'Library alt — the Reading Star ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:50,h:50});
 const HY=24,HR=24,PY=20,NP=6,PR=8.5,PL=40;
 // the plinth
 altCyl(acc,0,0,0,36,34,4,48);
 // the hall: an ovoid on the plinth, holed in a ruin
 const hh=holeFn(d*.8,9910,null,1.2);
 const ov=gridSurface((u,v)=>{const th=u*TAU,ph=lerp(.12,Math.PI*.86,v),r=HR*(1+.06*Math.cos(3*th)*Math.sin(ph));
  return[r*Math.sin(ph)*Math.cos(th),HY+HR*1.05*Math.cos(ph),r*Math.sin(ph)*Math.sin(th)];},64,24,{uS:HR*TAU/8,vS:HR*3/8,hole:hh?(u,v)=>hh(u,v*60):null});
 sk.push(ov);
 altRev(sk,0,0,HR*Math.sin(.12),HY+HR*1.05*Math.cos(.12),5,HY+HR*1.05*Math.cos(.12)-2,0,TAU,24);   // oculus lip
 if(d===0)mesh(lathe({rFn:()=>HR*.62,H:3,nu:24,nv:1}),MAT.glass,G,0,HY+HR*1.05-1.5,0);
 mesh(lathe({rFn:y=>HR*.9*Math.sqrt(clamp(1-Math.pow((y-HR)/(HR*1.08),2),.01,1)),H:2*HR,nu:32,nv:10}),MAT.dark,G,0,HY-HR,0);
 // the six pods
 for(let p=0;p<NP;p++){const a=Math.PI/2+p/NP*TAU,c=Math.cos(a),s=Math.sin(a),n=[c,0,s],broke=fall&&p===4;
  const pod=(P,off)=>{const g=new THREE.CylinderGeometry(PR,PR*1.12,PL-14,28,6,true);
   const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const yy=pa.getY(i)/(PL-14)+.5,b=1+.10*Math.sin(Math.PI*yy);pa.setX(i,pa.getX(i)*b);pa.setZ(i,pa.getZ(i)*b);}
   g.computeVertexNormals();g.rotateZ(-Math.PI/2);g.translate(off+(PL-14)/2,0,0);return g;};
  if(broke){const F=new THREE.Group();F.position.set(c*44,0,s*44);F.rotation.order='YXZ';F.rotation.set(0,-a+.5,-.18);G.add(F);
   const fa=[pod(F,-PL/2)];meshMerged(fa,SK,F);dropFragment(F,4,.6);
   altHeap(c*30,s*30,10,30,1.6);continue;}
  const g=pod(G,14);g.rotateY(-a);g.translate(0,PY,0);sk.push(g);
  // the round window and its spoked frame
  const e=[c*PL,PY,s*PL],q=qFacing(n);
  if(d===0)kput('ovalI',e,q,[PR*.92,PR*.92,1],null);else civWin('ovalD',e,q,[PR*.92,PR*.92,1],.4);
  kput(dd?'ringR':'ringW',e,q,[PR*1.04,PR*1.04,PR*.9],null);
  for(let k=0;k<8;k++){const t=k/8*Math.PI;const ax=[-s*Math.cos(t),Math.sin(t),c*Math.cos(t)];
   if(dd&&altH(p,k,3)<.4)continue;beam(dd?'strutR':'strutW',[e[0]-ax[0]*PR*.92+n[0]*.3,e[1]-ax[1]*PR*.92,e[2]-ax[2]*PR*.92+n[2]*.3],[e[0]+ax[0]*PR*.92+n[0]*.3,e[1]+ax[1]*PR*.92,e[2]+ax[2]*PR*.92+n[2]*.3],.35,.35);}
  if(d===0)kput('cell',[e[0]-n[0]*1.2,e[1],e[2]-n[2]*1.2],q,[PR*1.2,PR*1.2,1],WARM);
  // a cradle under each pod down to the plinth
  for(const t of[.45,.8]){const r=14+(PL-14)*t;altBox(acc,c*r,(4+PY-PR)/2,s*r,2.4,PY-PR-4+.6,PR*.9,-a);}}
 meshMerged(sk,SK,G);
 // THE RAMP: from the plain, south-west, curving round to enter the front pod
 const rp=t=>{const a=lerp(Math.PI*1.1,Math.PI*.5,t),r=lerp(96,PL+1,Math.pow(t,.8));return[r*Math.cos(a)+lerp(-10,0,t),lerp(0,PY-PR+.8,Math.pow(t,1.1)),r*Math.sin(a)];};
 const brkT=fall?[.42,.6]:null,okT=t=>!(brkT&&t>brkT[0]&&t<brkT[1]);
 const deck=gridSurface((u,v)=>{const p=rp(u),q=rp(Math.min(1,u+.01)),dx=q[0]-p[0],dz=q[2]-p[2],L=Math.hypot(dx,dz)||1,w=(v-.5)*7;
  return[p[0]-dz/L*w,p[1],p[2]+dx/L*w];},60,1,{uS:20,vS:1,hole:brkT?(u)=>!okT(u):null});
 acc.push(deck);
 for(let k=1;k<12;k++){const t=k/12;if(!okT(t))continue;const p=rp(t);if(p[1]<1.2)continue;altBox(acc,p[0],p[1]/2,p[2],1.6,p[1],1.6);}
 for(let k=0;k<60;k++){const t=k/60;if(!okT(t)||!okT(t+1/60))continue;const p=rp(t),q=rp(t+1/60),dx=q[0]-p[0],dz=q[2]-p[2],L=Math.hypot(dx,dz)||1;
  for(const sd of[-1,1])beam(dd?'strutR':'strutW',[p[0]-dz/L*3.5*sd,p[1]+.6,p[2]+dx/L*3.5*sd],[q[0]-dz/L*3.5*sd,q[1]+.6,q[2]+dx/L*3.5*sd],.25,1.2);}
 if(fall){const p=rp(.51);const F=new THREE.Group();F.position.set(p[0],0,p[2]);G.add(F);
  const fa=[];altBox(fa,0,0,0,24,.8,7,Math.atan2(rp(.55)[2]-rp(.47)[2],rp(.55)[0]-rp(.47)[0])*-1,0,.3);meshMerged(fa,CM,F);dropFragment(F,0,.3);altHeap(p[0],p[2],8,20,1.4);}
 altMerge(acc,CM,G);
 REGISTER({name:'Library alt — the hall',x:0,z:0,r:24,h:50,y:4});
 apron(G,0,0,36,52,d,.5);
 if(dd){mossOnRing(0,4,0,30,30,2);vinesOnRing(0,HY+10,0,HR*.9,18,12);rubbleRing(0,4,0,24,34,30,1.4);altTrees(18,56,110,40,40);
  civRooms({cy:4,rFn:()=>HR*.85,y0:6,y1:36,step:7,d,seed:9910,rIn:.55});}
 else altTrees(10,60,110,40,40);
 figures(-60,60,6,10);
 if(d===2){reseed(9935);
  for(let p=0;p<NP;p++){if(p===4)continue;const a=Math.PI/2+p/NP*TAU,n=[Math.cos(a),0,Math.sin(a)];const t=[-n[2],0,n[0]];for(let k=0;k<3;k++){const o=rr(-4,4),h=rr(-5,1);fireWindow([n[0]*(PL-.4)+t[0]*o,PY+h,n[2]*(PL-.4)+t[2]*o],n,qFacing(n),rr(1.2,2),rr(1,1.6));}}
  altReclaim(G,{up:40,side:24,r:52,stalls:9,plots:10,people:14,key:'altLib'});}
 KOFF=[0,0,0];return G;}
