// ================================================================= BUNKER ALT — "the Bastion Drum"
// A concrete drum that flares as it rises, open to the sky through an oculus,
// girdled by bands of firing slits. Four pairs of wedge buttresses splay out
// from its foot, and between each pair a stair climbs to a door at mid-height,
// so the drum has no door at ground level at all. A low wall with four gates
// rings it. After arco1 #43 (the flared drum on stair-carrying buttresses) and
// arco2 #9 (the walled precinct of stepped concrete slabs).
// Ruin: the south-east lip of the drum burst outward down to the slit band
// and lies against the wall; that stair's buttresses cracked and one is down.
function buildAltBunker(scene,gx,gz,d){reseed(9909);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),acc=[];
 REGISTER({name:'Bunker alt — the Bastion Drum ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:62,h:40});
 const H=34,rF=y=>19+10*Math.pow(clamp(y/H,0,1),1.5),bA=Math.PI/4;  // the burst faces south-east (+x,+z)
 const burst=fall?(u,y)=>{const a=u*TAU,da=civDA(a,bA);return y>H-(22-da*30)+4*fbm(a*6,y*.1,2,2);}:null;
 const hf=holeFn(d*.5,9909,null,1.4),hole=(burst||hf)?(u,y)=>(burst&&burst(u,y))||(hf?hf(u,y):false):null;
 mesh(lathe({rFn:rF,H,nu:72,nv:24,hole}),CM,G);                                  // the shell
 mesh(lathe({rFn:y=>rF(y)-2.2,H,nu:48,nv:12,hole:burst}),CM,G);                  // its inner face
 // the roof ring round the oculus, and the parapet lip
 const ra=[];altRev(ra,0,0,rF(H),H,8,H-1.5,0,TAU,72,burst?(u)=>civDA(u*TAU,bA)<.62:null);
 altRev(ra,0,0,8,H-1.5,8,H-5,0,TAU,24);altRev(ra,0,0,0,2,rF(0)-2.2,2,0,TAU,48);meshMerged(ra,CM,G);
 // slit bands
 for(const y of[12,21,29]){const n=Math.round(rF(y)*TAU/3.2);for(let k=0;k<n;k++){const u=(k+.5)/n,a=u*TAU;if(hole&&hole(u,y))continue;
  const r=rF(y)+.1,nn=[Math.cos(a),0,Math.sin(a)];kput(d>0?'cellD':'cell',[r*nn[0],y,r*nn[2]],qFacing(nn),[.5,1.6,1],d>0?null:(k%7?DEAD:new THREE.Color(0xff6a3a)));}
  kput('slab',[0,y+1.4,0],null,[rF(y+1.4)+.4,.35,rF(y+1.4)+.4],new THREE.Color(dd?0x6d665e:0xbab4aa));}
 // four stairs, each between a pair of wedge buttresses
 for(let s=0;s<4;s++){const a=bA+s*Math.PI/2,c=Math.cos(a),sn=Math.sin(a),tg=[-sn,c],broke=fall&&s===0;
  for(const side of[-1,1]){const off=side*7;
   const pts=[[16,0],[44,0],[44,3],[30,16],[24,H-4],[16,H-4]];
   if(broke&&side>0){// this one cracked through and fell outward
    const F=new THREE.Group();F.position.set(c*58+tg[0]*off,0,sn*58+tg[1]*off);F.rotation.order='YXZ';F.rotation.set(-1.35,-a,0);G.add(F);
    const fa=[];altFin(fa,pts.map(p=>[p[0]-30,p[1]]),4,0,0,0,0);meshMerged(fa,CM,F);dropFragment(F,0,.8);
    altFin(acc,[[16,0],[44,0],[44,3],[34,10],[20,8],[16,9]],4,tg[0]*off,0,tg[1]*off,-a);continue;}
   altFin(acc,pts,4,tg[0]*off,0,tg[1]*off,-a);}
  // the flight: 18 steps from the plain to a door at 15 m
  const nS=18;for(let k=0;k<nS;k++){const r=44-k*1.3,y=k*.84;if(broke&&k>6&&k<14)continue;
   kput(BOXC(d),[c*r,(y+.84)/2,sn*r],qEuler(0,-a,0),[1.4,y+.84,10],null);}
  if(broke)altHeap(c*34,sn*34,7,24,1.4);
  const dr=rF(15);kput('archOpen',[c*(dr+.3),15.2+3.4,sn*(dr+.3)],qFacing([c,0,sn]),[.55,.7,1.5],null);
  kput(BOXC(d),[c*(dr+3),15.2,sn*(dr+3)],qEuler(0,-a,0),[6,.6,12],null);}
 altMerge(acc,CM,G);
 // the precinct wall: stepped slabs of differing height, four gates
 const wa=[];const WR=58,nW=40;for(let k=0;k<nW;k++){const a=(k+.5)/nW*TAU;let gate=false;for(let s=0;s<4;s++)if(civDA(a,bA+s*Math.PI/2)<.12)gate=true;if(gate)continue;
  const h=4+3*altH(k,2,3)+(k%3===0?3:0),c=Math.cos(a),sn=Math.sin(a);
  if(fall&&civDA(a,bA)<.5&&altH(k,1,1)<.6){acBox(wa,c*(WR+h/2+1),1,sn*(WR+h/2+1),h,2,WR*TAU/nW*.92,-a,0,(altH(k,5,5)-.5)*.2);continue;}
  acBox(wa,c*WR,h/2,sn*WR,2,h,WR*TAU/nW*.92,-a);acBox(wa,c*WR,h+.6,sn*WR,2.8,1.2,WR*TAU/nW*.5,-a);}
 meshMerged(wa,CM,G);
 REGISTER({name:'Bunker alt — the oculus court',x:0,z:0,r:8,h:8,y:H-6});
 const berm=gridSurface((u,v)=>{const a=u*TAU,r=lerp(61,80,v);return[r*Math.cos(a),4.5*Math.sin(Math.PI*Math.min(1,v*1.4))*(1-.3*v),r*Math.sin(a)];},72,6,{uS:40,vS:3});
 mesh(berm,dd?MAT.turfR:MAT.turf,G);
 if(fall){// the burst lip, in slabs against the wall below it
  for(let k=0;k<9;k++){const a=bA+rr(-.5,.5),r=rr(30,52),s=rr(3,7);
   kput(BOXC(d),[r*Math.cos(a),s*.3,r*Math.sin(a)],qEuler(rr(-.6,.6),rr(0,3),rr(-.6,.6)),[s*1.6,s*.6,s],null);}
  altHeap(Math.cos(bA)*34,Math.sin(bA)*34,16,70,2.4);
  civRooms({cy:2,rFn:y=>rF(y+2)-2.4,y0:6,y1:H-4,step:8,d,seed:9909,rIn:.5,gap:a=>civDA(a,bA)>.9});}
 if(dd){mossOnRing(0,H,0,16,24,2);vinesOnRing(0,H,0,rF(H)-.2,22,14);altTrees(14,84,130,60,60);}
 else altTrees(6,90,130,60,60);
 figures(0,70,4,10);
 if(d===2){reseed(9934);
  for(let k=0;k<6;k++){const a=rr(0,TAU);VEG.tree(3*Math.cos(a),30.6,3*Math.sin(a),k,rr(3,5));}
  for(const y of[12,21])for(let k=0;k<30;k++){const a=(k+.5)/30*TAU;if(civDA(a,bA)<.7||fbm(a*2,y,5,2)<.45)continue;const n=[Math.cos(a),0,Math.sin(a)];
   fireWindow([(rF(y)-.2)*n[0],y,(rF(y)-.2)*n[2]],n,qFacing(n),.8,1.8);}
  acReclaim(G,{up:50,side:20,r:68,stalls:10,plots:10,people:14,key:'altBunk'});}
 KOFF=[0,0,0];return G;}
