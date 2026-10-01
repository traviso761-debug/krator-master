// ================================================================= ALTERNATE PERCH — THE RIG
// The Perch's idea, building off the ground, done the other way: not towers on
// a podium but a town on a platform. A two-deck slab 124 x 84 m stands 100 m
// up on four splayed lattice legs, crowded with stacked blocks, cantilevered
// rooms, two capped stacks and a crane, with pods and cables hanging under it.
// Beside it a cup 80 m across on a single stem, pods slung under its dish, and
// a truss bridge climbing from the rig's deck to the cup's rim. (arco1 #3 the
// rig town on its lattice legs over the grass, #8 the disc on a stem with pods
// hung under it, arco2 #43 the Craglorn bridge to a tower; arco1 #0 the
// stacked rig with its capped towers.)
// Ruin: the north-east leg has buckled at mid-height, so the deck has dropped
// at that corner; the crane has fallen over the edge; one stack is snapped;
// the bridge has broken in the middle and both halves hang; the cup's dish is
// holed and two pods lie on the plain. Reclaimed: a shanty town on both decks
// and the cup, a rope bridge where the truss was, hoists and ladders.
function buildAltPerch(scene,gx,gz,d){reseed(9835+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,rec=d===2,skin=SHELL(d),strut=dd?'strutR':'strutW';
 const DY=100,HX=62,HZ=42,CPX=190,CPZ=40,CY=122,CR=40;
 REGISTER({name:'The Rig — platform ('+ALT_STATE[d]+')',x:0,y:62,z:0,r:76,h:110});
 REGISTER({name:'The Rig: legs',x:0,y:0,z:0,r:108,h:84});
 REGISTER({name:'The Rig: the cup',x:CPX,y:0,z:CPZ,r:CR+2,h:CY+12});
 // THE DECK frame: dropped at its +x side in the ruin
 const D=new THREE.Group();D.position.set(0,DY,0);D.rotation.set(brk?.025:0,0,brk?-.045:0);G.add(D);D.updateMatrix();
 const toG=p=>{const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(D.matrix);return[v.x,v.y,v.z];};
 const SK=[],LG=[],DKm=[];
 // THE LEGS: four chords each, X-braced on every face, splayed to wide feet
 const LEGS=[[1,1],[1,-1],[-1,1],[-1,-1]],NLV=8;
 LEGS.forEach((L,li)=>{const T=toG([L[0]*50,-17,L[1]*32]),B=[L[0]*86,0,L[1]*62],buck=brk&&li===0;
  const tMax=buck?.46:1,at=(c,t)=>{const s=lerp(9,5,t);return[lerp(B[0],T[0],t)+c[0]*s,lerp(B[1],T[1],t),lerp(B[2],T[2],t)+c[1]*s];};
  const CH=[[1,1],[1,-1],[-1,-1],[-1,1]];
  CH.forEach(c=>altTube(LG,at(c,0),at(c,tMax),1.2,1.0,8));
  for(let k=0;k<NLV;k++){const t0=k/NLV,t1=(k+1)/NLV;if(t1>tMax+.01)break;
   for(let j=0;j<4;j++){const a=CH[j],b=CH[(j+1)%4];if(buck&&k===NLV*tMax-1&&j===0)continue;
    altTube(LG,at(a,t0),at(b,t1),.45,.45,6);altTube(LG,at(b,t0),at(a,t1),.45,.45,6);altTube(LG,at(a,t1),at(b,t1),.5,.5,6);}}
  kput(BOXC(d),[B[0],1.5,B[2]],null,[24,3,24],null);
  if(buck){// the upper half folded down and out onto the plain
   const M=at([0,0],tMax),F=[M[0]+L[0]*44,0,M[2]+L[1]*28];
   for(const c of CH)altTube(LG,[M[0]+c[0]*7,M[1],M[2]+c[1]*7],[F[0]+c[0]*5,2,F[2]+c[1]*5],1.1,1.0,8);
   for(let k=1;k<5;k++){const a=k/5;beam(strut,[lerp(M[0],F[0],a)-5,lerp(M[1],2,a),lerp(M[2],F[2],a)],[lerp(M[0],F[0],a)+5,lerp(M[1],2,a),lerp(M[2],F[2],a)],.8,.8);}
   const Tc=toG([L[0]*50,-17,L[1]*32]);beam(strut,Tc,[Tc[0]+rr(-4,4),Tc[1]-26,Tc[2]+rr(-4,4)],1,1);
   rubbleRing(F[0],0,F[2],4,30,40,3);}});
 // THE DECKS (in the deck frame)
 useGroupXF(D);
 altBox(SK,0,-1.5,0,HX*2,3,HZ*2);altBox(SK,0,-16.5,0,HX*2-8,2.6,HZ*2-8);
 // between the decks: a perimeter truss and rooms hung inside it
 for(let k=0;k<=15;k++){const x=-HX+4+k*(HX*2-8)/15;for(const s of[-1,1]){const z=s*(HZ-4);
  beam(strut,[x,-15.2,z],[x,-3,z],1,1);if(k<15)beam(strut,[x,-15.2,z],[x+(HX*2-8)/15,-3,z],.6,.6);}}
 for(let k=0;k<=10;k++){const z=-HZ+4+k*(HZ*2-8)/10;for(const s of[-1,1])beam(strut,[s*(HX-4),-15.2,z],[s*(HX-4),-3,z],1,1);}
 altBox(DKm,0,-9.2,0,HX*2-14,11.5,HZ*2-14);
 for(let k=0;k<44;k++){const t=k/44,side=k%4,x=side<2?lerp(-HX+8,HX-8,(k*7%44)/44):(side===2?HX-7.2:-HX+7.2),z=side<2?(side?HZ-7.2:-HZ+7.2):lerp(-HZ+8,HZ-8,(k*5%44)/44);
  const n=side<2?[0,0,side?1:-1]:[side===2?1:-1,0,0];for(const y of[-12.8,-8.8,-4.8])altWin([x+n[0]*.1,y,z+n[2]*.1],n,2.6,1.8,d);}
 // THE TOWN on the upper deck: stacked and cantilevered blocks
 const BL=[[-30,-12,34,18,30,0],[-26,-8,22,12,20,18],[10,-20,28,14,26,0],[6,16,40,10,30,0],[36,24,20,24,16,0],[-42,26,18,8,22,0],[40,-26,24,10,22,0],[-6,-14,16,9,14,14],[2,18,22,8,18,10]];
 BL.forEach((b,i)=>{const[x,z,w,h,dp,y0]=b,top=brk&&i===4?h*.55:h;altBox(SK,x,y0+top/2,z,w,top,dp);
  for(let y=y0+2.4;y<y0+top-1;y+=3.6)for(const[nx,nz,L,W]of[[0,1,w,dp],[0,-1,w,dp],[1,0,dp,w],[-1,0,dp,w]]){
   const nn=Math.max(1,Math.floor(L/3.4));for(let j=0;j<nn;j++){const o=(j+.5)/nn*L-L/2;if(rng()<.25)continue;
    altWin([x+nx*(W/2+.2)+(nz?o:0),y,z+nz*(W/2+.2)+(nx?o:0)],[nx,0,nz],2.2,1.6,d);}}
  if(brk&&i===4){for(let k=0;k<6;k++)kput('plateR',[x+rr(-8,8),y0+top+rr(0,2),z+rr(-6,6)],qEuler(rr(-1,1),rng()*3,rr(-1,1)),[rr(3,6),rr(2,4),.6],null);}
  if(!brk&&rng()<.6)kput(dd?'boxR':'boxW',[x+rr(-w/4,w/4),y0+h+1.2,z+rr(-dp/4,dp/4)],null,[rr(3,6),2.4,rr(3,6)],null);});
 // the accretion: smaller rooms piled on the blocks and on the deck, rooms cantilevered off its edges
 for(let j=0;j<30;j++){const x=rr(-HX+6,HX-6),z=rr(-HZ+6,HZ-6),w=rr(5,12),h=rr(3.5,9),dp=rr(5,11);
  let y0=0;for(const b of BL)if(Math.abs(x-b[0])<b[2]/2-1&&Math.abs(z-b[1])<b[4]/2-1)y0=Math.max(y0,b[5]+b[3]);
  if(brk&&y0>14&&rng()<.5)continue;altBox(SK,x,y0+h/2,z,w,h,dp,rng()<.3?.2:0);
  const n=[0,0,z>0?1:-1];altWin([x,y0+h*.55,z+n[2]*(dp/2+.15)],n,w*.6,1.4,d);}
 for(let j=0;j<16;j++){const side=j%4,t=rr(-.8,.8),w=rr(7,13),h=rr(5,8),o=rr(3,6),y=rr(-14,-4);if(brk&&j%5===0)continue;
  const x=side<2?t*HX:(side===2?HX+o:-HX-o),z=side<2?(side?HZ+o:-HZ-o):t*HZ;
  altBox(SK,x,y,z,side<2?w:2*o+2,h,side<2?2*o+2:w);
  beam(strut,[x,y-h/2,z],[side<2?x:x*.93,-16,side<2?z*.93:z],.6,.6);
  const n=side<2?[0,0,side?1:-1]:[side===2?1:-1,0,0];altWin([x+n[0]*(o+1.2),y,z+n[2]*(o+1.2)],n,4,1.6,d);}
 // two capped stacks
 for(const[x,z,h,snap]of[[-6,-31,72,false],[26,31,56,brk]]){const H=snap?30:h;
  SK.push(lathe({rFn:y=>4.6+1.6*Math.pow(1-y/h,3),H:h,cut:H,jag:snap?3:0,nu:18,nv:8,seed:9836}).translate(x,0,z));
  if(!snap){SK.push(lathe({rFn:y=>8*Math.sqrt(Math.max(0,1-Math.pow((y-5)/5,2)))+.5,H:10,nu:20,nv:6}).translate(x,h-1,z));
   kput(dd?'ringR':'ringW',[x,h+4,z],qEuler(Math.PI/2,0,0),[9.5,9.5,8],null);kput(dd?'postR':'postW',[x,h+16,z],null,[.4,16,.4],null);
   if(!dd)kput('cell',[x,h+4,z+8.4],null,[5,1.2,1],CYAN);}
  else for(let k=0;k<5;k++)kput('plateR',[x+rr(8,30),2,z+rr(-10,10)],qEuler(rr(-.4,.4),rng()*3,rr(-.4,.4)),[rr(3,5),.8,rr(3,8)],null);}
 // the crane: standing and slewed out over the edge, or fallen and hanging off it
 {const cx=50,cz=-32;altBox(SK,cx,15,cz,3.4,30,3.4);
  if(!brk){beam(strut,[cx,30,cz],[cx+10,32,cz-34],1.8,1.8);beam(strut,[cx,30,cz],[cx-4,30.5,cz+12],1.6,1.6);kput(dd?'boxR':'boxW',[cx-4,29,cz+12],null,[4,4,4],null);
   altRope([cx+10,31,cz-34],[cx+10,6,cz-34],.12);}
  else{beam(strut,[cx+1,3,cz-2],[cx+12,-28,cz-26],1.8,1.8);altRope([cx+12,-28,cz-26],[cx+13,-44,cz-27],.15);}}
 // railings round the deck edge
 for(let k=0;k<64;k++){const t=k/64,per=2*(HX*2+HZ*2),L=t*per;let x,z;
  if(L<HX*2){x=-HX+L;z=-HZ+.4;}else if(L<HX*2+HZ*2){x=HX-.4;z=-HZ+L-HX*2;}else if(L<HX*4+HZ*2){x=HX-(L-HX*2-HZ*2);z=HZ-.4;}else{x=-HX+.4;z=HZ-(L-HX*4-HZ*2);}
  if(brk&&rng()<.3)continue;kput(dd?'postR':'postW',[x,.9,z],null,[.15,1.8,.15],null);}
 // pods and cables under the lower deck
 for(let k=0;k<6;k++){const x=-44+k*17.6,z=k%2?18:-20,L=rr(8,18);if(brk&&k===2)continue;
  altRope([x,-17.8,z],[x,-17.8-L,z],.18);SK.push(lathe({rFn:y=>3.4*Math.sin(Math.PI*clamp(y/7,0,1))+.6,H:7,nu:14,nv:6}).translate(x,-17.8-L-7,z));}
 for(let k=0;k<14;k++){const x=rr(-HX+6,HX-6),z=rr(-HZ+6,HZ-6);altRope([x,-17.8,z],[x+rr(-2,2),-17.8-rr(10,40),z+rr(-2,2)],.07);}
 // the green on the deck
 for(let k=0;k<(brk?40:14);k++){const x=rr(-HX+4,HX-4),z=rr(-HZ+4,HZ-4);if(BL.some(b=>Math.abs(x-b[0])<b[2]/2+1&&Math.abs(z-b[1])<b[4]/2+1))continue;
  VEG.tree(x,0,z,k%3,brk?rr(5,10):rr(3,5));}
 endGroupXF();
 meshMerged(SK,skin,D);meshMerged(DKm,MAT.dark,D);
 // THE CUP: a stem, a dish, a glazed ring room and its roof, pods slung below
 {const S=[],hfc=brk?holeFn(.7,9837,null,1.3):null;
  S.push(lathe({rFn:y=>4.6+7.4*Math.pow(1-y/CY,6),H:CY-8,nu:20,nv:12,hole:hfc?(u,y)=>y>30&&hfc(u,y):null}).translate(CPX,0,CPZ));
  S.push(gridSurface((u,v)=>{const th=u*TAU,r=v*CR;return[CPX+r*Math.cos(th),CY-14*(1-v*v),CPZ+r*Math.sin(th)];},64,8,{uS:CR*TAU/8,vS:CR/8,hole:hfc?(u,v)=>v>.3&&hfc(u,v*80):null}));
  S.push(gridSurface((u,v)=>{const th=u*TAU,r=v*CR;return[CPX+r*Math.cos(th),CY,CPZ+r*Math.sin(th)];},64,4,{uS:CR*TAU/8,vS:CR/8,hole:hfc?(u,v)=>v>.3&&hfc(u,v*80+5):null}));
  S.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(CR-1,10,v);return[CPX+r*Math.cos(th),CY+6.5+3*v,CPZ+r*Math.sin(th)];},64,3,{uS:CR*TAU/8,vS:3,hole:brk?(u,v)=>u>.55&&u<.8:null}));
  if(!dd)mesh(lathe({rFn:()=>CR-1.2,H:6.5,nu:64,nv:1}).translate(CPX,CY,CPZ),MAT.glass,G);
  for(let k=0;k<40;k++){const a=k/40*TAU;if(brk&&a>.55*TAU&&a<.8*TAU&&k%2)continue;kput(dd?'mullR':'mullW',[CPX+(CR-1.1)*Math.cos(a),CY+3.25,CPZ+(CR-1.1)*Math.sin(a)],qEuler(0,-a,0),[1,6.5,1],null);}
  stripRing(CPX,CY-.8,CPZ,CR+.1,dd,48);
  for(let k=0;k<6;k++){const a=k/6*TAU+.3,x=CPX+26*Math.cos(a),z=CPZ+26*Math.sin(a),yb=CY-10.5;
   if(brk&&k<2){S.push(lathe({rFn:y=>4*Math.sin(Math.PI*clamp(y/8,0,1))+.8,H:8,nu:14,nv:6}).rotateZ(1.3).translate(CPX+(44+k*14)*Math.cos(a),3,CPZ+(44+k*14)*Math.sin(a)));
    altRope([x,yb,z],[x,yb-6,z],.15);continue;}
   altRope([x,yb,z],[x,yb-12,z],.25);S.push(lathe({rFn:y=>4*Math.sin(Math.PI*clamp(y/8,0,1))+.8,H:8,nu:14,nv:6}).translate(x,yb-20,z));
   altWin([x,yb-16,z+4.3],[0,0,1],2,1.4,d);}
  kput(BOXC(d),[CPX,1,CPZ],null,[22,2,22],null);
  meshMerged(S,skin,G);
  for(let k=0;k<(brk?18:8);k++){const a=rng()*TAU,r=rr(12,CR-4);VEG.tree(CPX+r*Math.cos(a),CY,CPZ+r*Math.sin(a),k%3,rr(4,8));}}
 // THE BRIDGE: deck edge to the cup's rim; broken in the ruin, both halves hanging
 const A=toG([HX,.2,22]),B=[CPX-CR,CY+.2,CPZ-6],BS=[];
 if(!brk){for(const s of[-1,1]){altTube(BS,[A[0],A[1]+s*0+3,A[2]+s*3],[B[0],B[1]+3,B[2]+s*3],.5,.5,6);altTube(BS,[A[0],A[1],A[2]+s*3],[B[0],B[1],B[2]+s*3],.6,.6,6);}
  const n=12;for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,P0=[lerp(A[0],B[0],t0),lerp(A[1],B[1],t0),lerp(A[2],B[2],t0)],P1=[lerp(A[0],B[0],t1),lerp(A[1],B[1],t1),lerp(A[2],B[2],t1)];
   for(const s of[-1,1])altTube(BS,[P0[0],P0[1],P0[2]+s*3],[P1[0],P1[1]+3,P1[2]+s*3],.3,.3,6);}
  const dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2];kput(dd?'plateR':'plateW',[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2],
   new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),new THREE.Vector3(dx,dy,dz).normalize()),[Math.hypot(dx,dy,dz),.5,5.6],null);}
 else{// the rig half droops from its anchor, the cup half hangs from the rim
  const dA=[A[0]+16,A[1]-38,A[2]+3],dB=[B[0]-6,B[1]-30,B[2]-2];
  for(const s of[-1,1]){altTube(BS,[A[0],A[1],A[2]+s*3],[dA[0],dA[1],dA[2]+s*3],.6,.6,6);altTube(BS,[B[0],B[1],B[2]+s*3],[dB[0],dB[1],dB[2]+s*3],.6,.6,6);}
  beam('plateR',A,dA,5,.5);beam('plateR',B,dB,5,.5);
  if(rec){altSag(A,B,8,16,.5,'plank');for(const s of[-1,1])altSag([A[0],A[1]+1.2,A[2]+s*1.4],[B[0],B[1]+1.2,B[2]+s*1.4],7.6,16,.07);}}
 meshMerged(LG,skin,G);if(BS.length)meshMerged(BS,skin,G);
 apron(G,0,0,96,124,dd,.4);
 if(brk){rubbleRing(0,0,0,40,140,150,4);scatterMoss(0,0,0,20,160,110,4);trees(0,0,60,240,46);
  for(let k=0;k<20;k++)kput('plateR',[rr(40,110),rr(.3,1),rr(-70,-10)],qEuler(rr(-.4,.4),rng()*3,rr(-.4,.4)),[rr(3,8),.6,rr(2,6)],null);}
 else{trees(0,0,110,230,20);figures(0,90,10,20);}
 if(rec){KOFF=[gx,0,gz];altReclaim(G,340,40,'altPerch');
  // the climb: ladders up two legs, hoists from the deck, a winch at the foot
  for(const li of[2,3]){const L=LEGS[li],T=toG([L[0]*50,-17,L[1]*32]),Bf=[L[0]*86,0,L[1]*62];
   for(let k=0;k<6;k++){const a=k/6,b=(k+1)/6;altLadder([lerp(Bf[0],T[0],a)+L[0]*7,lerp(0,T[1],a),lerp(Bf[2],T[2],a)],[lerp(Bf[0],T[0],b)+L[0]*7,lerp(0,T[1],b),lerp(Bf[2],T[2],b)],[0,0,1]);}}
  for(let k=0;k<5;k++){const P=toG([rr(-50,40),-18,k%2?HZ-1:-HZ+1]);altRope(P,[P[0],0,P[2]+(k%2?6:-6)],.14);kput('waterButt',[P[0],1,P[2]+(k%2?6:-6)],null,[1.4,2,1.4],null);}
  for(let j=0;j<12;j++){const a=rng()*TAU,r=rr(70,120);kput('shantyBox',[r*Math.cos(a),1.3,r*Math.sin(a)],qEuler(0,rng()*3,0),[rr(3,5),2.6,rr(3,5)],null);
   if(j%3===0)firePit('altPerch',r*Math.cos(a)+3,0,r*Math.sin(a),.8);}
  figures(30,80,20,40);}
 KOFF=[0,0,0];return G;}
