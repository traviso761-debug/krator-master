// ================================================================= ROBOTICS ALT — "the Rig"
// The robots were built in the air. A two-deck platform stands 60 m up on
// four splayed lattice legs, crowded with shops, two jib cranes and a domed
// control pod; under it, slung in a cradle of chains, hangs a robot 34 m tall
// half assembled, its legs not yet fitted. Rails run in under the rig from a
// saw-tooth shed on the plain. After arco1 #3 (the tower rig on lattice legs
// over the grass) and arco1 #0 (the domed works crowded onto a platform).
// Ruin: the north-east leg buckled and the platform lists onto it; the robot
// broke its chains and lies on its back under the rig; a jib fell.
function buildAltRobotics(scene,gx,gz,d){reseed(9913);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),SK=SHELL(d),acc=[],sk=[];const ST=dd?'strutR':'strutW';
 REGISTER({name:'Robotics alt — the Rig ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:110,h:110});
 const LY=60,LX=40,LZ=30;
 // the four lattice legs: four chords each, cross-braced, splayed at the foot
 const leg=(fx,fz,tx,tz,h,buck)=>{const ch=[[-2.5,-2.5],[2.5,-2.5],[2.5,2.5],[-2.5,2.5]];const N=10;
  const P=(t,c)=>{let x=lerp(fx,tx,t)+c[0]*(1.4-.4*t),z=lerp(fz,tz,t)+c[1]*(1.4-.4*t),y=t*h;
   if(buck&&t>.45){const k=(t-.45);x+=k*14;z+=k*10;y-=k*k*30;}return[x,y,z];};
  for(let c=0;c<4;c++)for(let i=0;i<N;i++){const a=P(i/N,ch[c]),b=P((i+1)/N,ch[c]),b2=P((i+1)/N,ch[(c+1)%4]);
   beam(ST,a,b,.9,.9);if(!(buck&&i===5&&c<2))beam(ST,a,b2,.4,.4);}
  kput(BOXC(d),[fx,1,fz],null,[10,2,10],null);};
 const legs=[[-1,-1],[1,-1],[-1,1],[1,1]];
 for(const[sx,sz]of legs)leg(sx*(LX+12),sz*(LZ+10),sx*LX,sz*LZ,LY,fall&&sx>0&&sz<0);
 // THE PLATFORM, in its own group so the ruin can list it
 const P=new THREE.Group();P.position.set(-LX,LY,0);G.add(P);if(fall)P.rotation.set(-.05,0,-.09);
 useGroupXF(P);const pa=[];const ox=LX;               // platform-local x is offset so the pivot is the west edge
 altBox(pa,ox,0,0,110,2.4,84);altBox(pa,ox+6,12,-4,86,1.6,64);           // the two decks
 for(const[sx,sz]of[[-1,-1],[1,-1],[-1,1],[1,1]])altBox(pa,ox+sx*36+6,6,sz*26-4,3,12,3);
 // shops on the decks
 for(let k=0;k<7;k++){const x=ox-44+k*14+rr(-2,2),z=rr(34,40)*(k%2?1:-1),w=rr(8,12),h=rr(5,9);altBox(pa,x,1.2+h/2,z,w,h,rr(6,9));
  kput(d>0?'cellD':'cell',[x,1.2+h*.6,z+(z>0?1:-1)*4.6],qFacing([0,0,z>0?1:-1]),[w*.6,1.4,1],d>0?null:(k%2?WARM:CYAN));}
 for(let k=0;k<4;k++){const x=ox-20+k*16,h=rr(6,10);altBox(pa,x,12.8+h/2,-4+rr(-14,14),rr(8,12),h,rr(8,12));}
 meshMerged(pa,SK,P);
 // the control pod: a dome on a drum at the north-west corner of the top deck
 const cp=[];altCyl(cp,ox-30,12.8,-24,9,9,6,24);altDome(cp,ox-30,18.8,-24,9,0,Math.PI/2,1,null,24,6);meshMerged(cp,SK,P);
 if(d===0)stripRing(ox-30,16,-24,9.2,d,20);
 // two jib cranes
 const jib=(x,z,a,fallen)=>{if(fallen)return;for(let y=13;y<36;y+=4){beam(ST,[x-1.2,y,z-1.2],[x+1.2,y+4,z+1.2],.4,.4);}
  kput(dd?'boxR':'boxW',[x,24,z],null,[2.4,24,2.4],null);beam(ST,[x,36,z],[x+Math.cos(a)*34,36,z+Math.sin(a)*34],1.4,1.4);
  beam(ST,[x,40,z],[x+Math.cos(a)*30,36.4,z+Math.sin(a)*30],.3,.3);kput('tube',[x+Math.cos(a)*30,26,z+Math.sin(a)*30],null,[.15,20,.15],null);};
 jib(ox+40,20,-.4,false);jib(ox-2,-30,2.3,fall);
 endGroupXF();
 if(fall){const F=new THREE.Group();F.position.set(-30,0,-70);F.rotation.set(Math.PI/2,0,.6);G.add(F);
  const fa=[];altBox(fa,0,0,0,2.4,36,2.4);altBox(fa,0,17,10,1.4,1.4,30);meshMerged(fa,dd?MAT.rust:MAT.white,F);dropFragment(F,0,.3);altHeap(-30,-60,10,20,1.4);}
 // THE ROBOT, merged; hung under the rig or lying on its back
 const rb=[];const R=(x,y,z,w,h,dp,rx,rz)=>altBox(rb,x,y,z,w,h,dp,0,rx||0,rz||0);
 R(0,18,0,16,14,9);R(0,28,0,20,8,11);R(0,34,1,7,6,7);R(0,9,0,11,6,7);           // torso, chest, head, pelvis
 for(const s of[-1,1]){R(s*12,27,0,5,5,5);R(s*14,18,0,4,13,4,0,s*.15);R(s*15,8,1,3.4,9,3.4,.2,0);}               // shoulders and arms
 R(-4.5,2,0,4,5,4);                                                                                                  // one thigh stub
 const RG=new THREE.Group();G.add(RG);
 if(!fall){RG.position.set(0,LY-50,0);for(const[x,z]of[[-8,-4],[8,-4],[-8,4],[8,4]]){beam('tube',[x,LY-1,z],[x*.8,LY-50+30,z*.8],.5,.5);}}
 else{RG.position.set(10,0,24);RG.rotation.order='YXZ';RG.rotation.set(-Math.PI/2+.1,.6,0);for(let k=0;k<6;k++)kput('tube',[rr(-10,10),LY-rr(4,14),rr(-6,6)],qEuler(rr(-.2,.2),0,rr(-.2,.2)),[.4,rr(8,20),.4],null);}
 meshMerged(rb,dd?MAT.rust:MAT.white,RG);if(fall)dropFragment(RG,0,.6);
 kput(d>0?'cellD':'cell',[RG.position.x,fall?3:RG.position.y+34,fall?RG.position.z+8:4.6],qFacing([0,0,1]),[4,1,1],d>0?null:CYAN);
 // the shed on the plain: saw-tooth roof bays, rails into the rig
 const sh=[];const SX=110;altBox(sh,SX,5,0,60,10,50);
 for(let k=0;k<6;k++){const z=-25+k*10+5;if(fall&&k>=3&&k<=4)continue;
  altFin(sh,[[-5,0],[5,0],[-5,6]],60,SX,10,z,Math.PI/2);if(d===0)kput('pane',[SX,13,z-4.9],qEuler(-.6,0,0),[58,6.4,1],null);}
 for(const z of[-6,6])altBox(sh,0,.3,z,260,.6,1.2);
 meshMerged(sh,CM,G);
 if(fall)altHeap(SX,10,14,40,2);
 altMerge(acc,CM,G);
 REGISTER({name:'Robotics alt — the platform',x:0,z:0,r:60,h:46,y:LY-8});
 REGISTER({name:'Robotics alt — the shed',x:SX,z:0,r:36,h:18});
 apron(G,20,0,90,110,d,.3);
 if(dd){rubbleRing(0,0,0,20,70,50,2);mossOnRing(SX,10.2,0,20,20,1.6);altTrees(20,110,180,140,70);
  for(const[sx,sz]of legs)vinesOnRing(sx*LX,LY,sz*LZ,3,4,30);}
 else altTrees(10,120,180,140,70);
 figures(60,50,5,12);
 if(d===2){reseed(9938);
  for(let k=0;k<26;k++){const x=rr(-50,50),z=rr(-38,38),p=new THREE.Vector3(x+LX,2,z).applyEuler(P.rotation).add(P.position);
   if(k%3===0)firePit('altRobo',p.x,p.y,p.z,rr(.7,1.2));else{kput('shantyBox',[p.x,p.y+1.5,p.z],qEuler(0,rng()*3,0),[rr(3,5),3,rr(3,4)],null);
    kput('shantyRoof',[p.x,p.y+3.2,p.z],qEuler(.2,rng()*3,0),[5,1,5],null);}}
  for(let k=0;k<5;k++)beam('plank',[-LX-12+k*.2,0,-LZ-10],[-LX-2,LY-8,-LZ-2+k*.2],.5,.3);
  altReclaim(G,{up:50,side:24,r:80,stalls:12,plots:12,people:18,key:'altRobo'});}
 KOFF=[0,0,0];return G;}
