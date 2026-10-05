// ================================================================= MID-RISE — "the Capsule Stalks" (a host made of sockets: plug-in cores on a round deck)
// Three cylindrical service cores of different heights on a shared round podium deck: a central stalk (63 m) and two
// lesser ones (47 and 37 m) on a diagonal. Each core is studded over parts of its height with a dense staggered grid
// of short projecting capsule tubes, each ending in a porthole: plug-in SOCKETS, with plain smooth bands between the
// studded ones and a simple disc cap on top. A bridge joins the centre to each lesser stalk; a disc platform rings
// the centre stalk at 40 m.
// HOST: the sockets are where pods plug in. HOSTSPEC_STALKS.sockets(d) lists every one, local to the builder:
// {x,y,z (the tube's mouth), nx,ny,nz (outward), r, core}; a ruin (d>0) has lost some (the same ones the builder
// leaves off). bands lists the studded bands. Generic pods root on the centre stalk's smooth bands (bearings clear of
// the lesser stalks); avoid() keeps them off its studded bands, the bridges and the disc. Plates every 5 m from 10 m.
const HST={Y0:5,P:5,PR:40,SEED:151,TUBE:{r:.85,len:1.4},
 CORES:[{n:'A',x:0,z:0,r:11,top:63,bands:[[20,30],[44,54]],ruin:51},
        {n:'B',x:-22.5,z:13,r:8.5,top:47,bands:[[12,22],[32,42]],ruin:47},
        {n:'C',x:22.5,z:-13,r:7.5,top:37,bands:[[12,22]],ruin:29}],
 BRIDGES:[['A','B',30],['A','C',25]],DISC:{core:'A',y:40,r:16.5}};
// every socket, in the builder's frame; d>0 drops the ones a ruin has lost (a position hash: no rng)
function hstSockets(d){const out=[];for(const C of HST.CORES){const n=Math.round(TAU*C.r/2.6);
 for(const [y0,y1] of C.bands)for(let j=0,y=y0+1.25;y<y1;y+=2.5,j++)for(let i=0;i<n;i++){const a=(i+(j%2)*.5)/n*TAU;
  if(d>0&&h3(C.x*.13+i*.37,y*.21,C.z*.17+j*.71)<.18)continue;
  const c=Math.cos(a),s=Math.sin(a),R=C.r+HST.TUBE.len;out.push({x:C.x+c*R,y,z:C.z+s*R,nx:c,ny:0,nz:s,r:HST.TUBE.r,core:C.n});}}
 return out;}
// the face radius along bearing th at builder height yl: the outermost core surface the ray leaves (the podium below 5)
function hstRAt(yl,th){if(yl<HST.Y0)return HST.PR;const c=Math.cos(th),s=Math.sin(th);let best=0;
 for(const C of HST.CORES){if(yl>C.top)continue;const b=c*C.x+s*C.z,q=b*b-(C.x*C.x+C.z*C.z)+C.r*C.r;if(q<0)continue;best=Math.max(best,b+Math.sqrt(q));}
 return best||HST.CORES[0].r;}
kdef('hstTube',new THREE.CylinderGeometry(1,1,1,10,1,true).rotateX(Math.PI/2).translate(0,0,.5),MAT.white);
kdef('hstTubeR',new THREE.CylinderGeometry(1,1,1,10,1,true).rotateX(Math.PI/2).translate(0,0,.5),MAT.rust);
kdef('hstPort',new THREE.CircleGeometry(1,10),MAT.winIntact);kdef('hstPortD',new THREE.CircleGeometry(1,10),MAT.winDead);
const HOSTSPEC_STALKS={name:'the Capsule Stalks',key:'midStalks',builder:'buildHostStalks',H:63,Y0:HST.Y0,podium:HST.PR,cap:HST.PR+2,shaped:true,square:false,
 floors:{y0:HST.Y0+HST.P,pitch:HST.P,top:.3,first:.3},k0:0,plate:k=>HST.Y0+HST.P*(k+1)+.3,
 rAt:(yl,th)=>th==null?HST.CORES[0].r+2:hstRAt(yl,th),
 cuts:{tall:[45,60],mid:[35,50],low:[20,35],land:[20,45]},crownY:58,sink:'seabed',minY:9,
 avoid:(yl,h)=>anhCross([25.3,30.3,40.3],yl,h)||HST.CORES[0].bands.some(b=>yl<b[1]+.5&&yl+h>b[0]-.5)||yl+h+1>HST.CORES[0].top,
 bearings:(st,n)=>anhFaces([Math.PI/3,4*Math.PI/3,Math.PI*7/12,Math.PI*19/12],st,n,.3,.04),   // the centre stalk, clear of B (150) and C (330)
 sockets:d=>hstSockets(d),
 bands:HST.CORES.flatMap(C=>C.bands.map(b=>({core:C.n,x:C.x,z:C.z,R:C.r,y0:b[0],y1:b[1]})))};

function buildHostStalks(scene,gx,gz,d){reseed(12030+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const SM=skyShardMark(),Y0=HST.Y0,PS=HST.P,B=new Map();
 REGISTER({name:'The Capsule Stalks — plug-in cores ('+(d===2?'collapsed':STATE(d))+')',x:0,z:0,r:HST.PR+2,h:66});
 const yc=(typeof ysCutY==='function'?ysCutY(d):null),host=yc!=null,gcut=d===2?Y0+PS*3:yc;   // a cut for every core (builder y), or null
 let hole=holeFn(dd*(d===2?1.3:1),HST.SEED,gcut!=null?gcut-Y0+25:null,1.5);   // the cut's erosion over its top 20 m
 if(typeof ysWallHole==='function')hole=ysWallHole(hole,Y0);          // YS: a way-in pod's hole through a core's skin and lining
 // THE PODIUM DECK: a drum, its top, steps at the front; a Ys podium shrinks it, never inside the stalks
 const PRs=(typeof ysPodiumR==='function'?ysPodiumR(HST.PR):HST.PR),pr=clamp(PRs,37.5,HST.PR),shrunk=PRs<HST.PR;
 anhPut(B,CONC(dd),lathe({rFn:()=>pr,H:Y0,nu:64,nv:1}));
 anhPut(B,CONC(dd),anhFan([...Array(64)].map((_,i)=>[pr*Math.cos(i/64*TAU),pr*Math.sin(i/64*TAU)]),Y0,1));
 if(!shrunk)for(let i=0;i<8;i++)kput(BOXC(dd),[0,(i+.5)*Y0/8/2,pr+.4+(7-i)*.7],null,[12,(i+.5)*Y0/8,.7],null);
 for(let k=0;k<64;k++){const a=k/64*TAU,r=pr-.4;if(dd&&h3(k,1,3)<.3)continue;kput(dd?'strutR':'strutW',[r*Math.cos(a),Y0+.55,r*Math.sin(a)],null,[.12,1.1,.12],null);}
 // THE STALKS: each in its own group at its foot, so its holes, lining, plates and rooms are its own; its hole
 // predicate asks the HOST's bearing (u from the builder's axis), which is what ysWallHole and the ways mean
 const socks=hstSockets(d);
 for(const C of HST.CORES){const top=gcut!=null?Math.min(C.top,gcut):(d===1?C.ruin:C.top),L=top-Y0,cutC=top<C.top;
  const P=new THREE.Group();P.position.set(C.x,Y0,C.z);G.add(P);useGroupXF(P);const BP=new Map();
  const hc=hole?(u,y)=>{const a=u*TAU;return hole((Math.atan2(C.z+C.r*Math.sin(a),C.x+C.r*Math.cos(a))/TAU+1)%1,y);}:null;
  const nu=Math.max(32,Math.round(TAU*C.r/1.6));
  anhPut(BP,CONC(dd),lathe({rFn:()=>C.r,H:L,cut:cutC?L:null,jag:cutC?2.5:0,nu,nv:Math.round(L/2.5),hole:hc,seed:HST.SEED}));
  if(dd){anhPut(BP,MAT.guts,lathe({rFn:()=>C.r*.86,H:L,cut:cutC?L:null,jag:cutC?2.5:0,nu:Math.round(nu*.6),nv:Math.round(L/5),hole:hc,seed:HST.SEED}));
   const ys=anhStoreys(Y0,PS,Y0,L,2);for(const y of ys){kput('slab',[0,y,0],null,[C.r*.9,.6,C.r*.9],new THREE.Color(0xbdb7ad));kput('slab',[0,y-.95,0],null,[C.r*.87,.7,C.r*.87],new THREE.Color(0x191b1f));}
   if(ys.length)skyRooms({rFn:()=>C.r*.84,y0:ys[0],y1:L-2,step:PS,soff:1.3,hole:hc,d,seed:HST.SEED});}
  // a thin metal ring at the head and foot of each studded band, the band itself a darker skin behind the tubes
  for(const [b0,b1] of C.bands){if(b0>=top-1)continue;const t1=Math.min(b1,top-.5);
   for(const yy of [b0,t1])if(yy<top-.5)kput(dd?'ringR':'ringW',[0,yy-Y0,0],qEuler(Math.PI/2,0,0),[C.r+.15,C.r+.15,5],null);}
  // the cap: a disc a little proud of the shaft, a low dome on the tallest
  if(!cutC){anhPut(BP,dd?MAT.rust:MAT.white,lathe({rFn:()=>C.r+.9,H:1.6,nu,nv:1}).translate(0,L,0));
   anhPut(BP,dd?MAT.rust:MAT.white,anhFan([...Array(nu)].map((_,i)=>[(C.r+.9)*Math.cos(i/nu*TAU),(C.r+.9)*Math.sin(i/nu*TAU)]),L+1.6,1));
   if(C.n==='A')anhPut(BP,CONC(dd),lathe({rFn:y=>7.5*Math.sqrt(clamp(1-Math.pow(y/4,2),0,1)),H:4,nu:32,nv:5}).translate(0,L+1.6,0));
   if(C.n==='C')kput(dd?'strutR':'strutW',[0,L+1.6+7,0],null,[.4,14,.4],null);}
  anhFlush(BP,P);endGroupXF();
  // the sockets on this stalk: a capsule tube from inside the wall out to the mouth, a porthole on its end
  for(const S of socks){if(S.core!==C.n||S.y>top-1.5)continue;const q=qFacing([S.nx,0,S.nz]),r0=C.r-.25,len=HST.TUBE.len+.25;
   kput(dd?'hstTubeR':'hstTube',[S.x-S.nx*len,S.y,S.z-S.nz*len],q,[S.r,S.r,len],null);
   kput(dd?'hstPortD':'hstPort',[S.x+S.nx*.02,S.y,S.z+S.nz*.02],q,[S.r*.72,S.r*.72,1],null);}}
 // THE BRIDGES (centre to each lesser stalk) and THE DISC round the centre stalk, where the stalks still reach
 const core=n=>HST.CORES.find(C=>C.n===n),topOf=C=>gcut!=null?Math.min(C.top,gcut):(d===1?C.ruin:C.top);
 for(const [a,b,y] of HST.BRIDGES){const A=core(a),Bc=core(b);if(y>topOf(A)-1||y>topOf(Bc)-1)continue;
  const dx=Bc.x-A.x,dz=Bc.z-A.z,D=Math.hypot(dx,dz),ux=dx/D,uz=dz/D,s0=A.r-.3,s1=D-Bc.r+.3,mx=A.x+ux*(s0+s1)/2,mz=A.z+uz*(s0+s1)/2,q=qFacing([ux,0,uz]);
  kput(BOXC(dd),[mx,y-.1,mz],q,[3.2,.8,s1-s0],null);
  for(const sd of [-1,1])kput(dd?'strutR':'strutW',[mx-uz*sd*1.5,y+.9,mz+ux*sd*1.5],q,[.1,.1,s1-s0],null);}
 {const C=core(HST.DISC.core),y=HST.DISC.y,R=HST.DISC.r;if(y<topOf(C)-1){const ring=(r0,r1,yy)=>gridSurface((u,v)=>{const a=u*TAU,r=lerp(r0,r1,v);return[C.x+r*Math.cos(a),yy,C.z+r*Math.sin(a)];},48,1,{});
  anhPut(B,CONC(dd),[ring(C.r,R,y+.3),ring(C.r,R,y-.4),lathe({rFn:()=>R,H:.7,nu:48,nv:1}).translate(C.x,y-.4,C.z)]);
  for(let k=0;k<40;k++){const a=k/40*TAU;if(dd&&h3(k,5,1)<.3)continue;kput(dd?'strutR':'strutW',[C.x+(R-.3)*Math.cos(a),y+.85,C.z+(R-.3)*Math.sin(a)],null,[.1,1.1,.1],null);}}}
 anhFlush(B,G);
 if(dd>0&&!shrunk){scatterMoss(0,0,0,pr+2,pr+80,150,3.2);rubbleRing(0,0,0,pr,pr+50,d===2?150:60,d===2?4:2.5);trees(0,0,pr+20,pr+110,16);vinesOnRing(0,Y0,0,pr-.4,24,4);}
 if(d===2)for(const C of HST.CORES)rubbleRing(C.x,Y0,C.z,C.r*.4,C.r*2.2,60,4);
 if(d>0)skyShards(SM,d===3?.25:.5);
 if(!shrunk)figures(0,pr+8,5,10);KOFF=[0,0,0];return G;}
