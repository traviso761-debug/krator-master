// ================================================================= ALTERNATE SKYSCRAPER — THE PIERCED STACK
// Eight rounded bays packed into one waisted shaft, 340 m, lifted 34 m off the
// plain on eight trumpet pilotis, its skin a dense grid of small round windows;
// and 270 m up, an oculus 38 m across goes clean through it, lined, with a
// spoked wheel standing in it. (arco2 #0 Goldberg's lobed tower on flared legs,
// #26-28 Soleri's Babel IID waisted perforated shafts, arco1 #20 and #5 the
// desert towers pierced by a round opening.)
// Ruin: the crown has burst and the floors stand open to the sky; a breach 70 m
// high on the south-east shows the floor plates; one piloti has failed and lies
// on the plain; the wheel has lost most of its rim and spokes. Reclaimed: the
// breach and the oculus are lived in, with hoists to the ground and a market
// under the pilotis.
function buildAltStack(scene,gx,gz,d){reseed(9815+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,rec=d===2,skin=SHELL(d);
 const Y0=34,Y1=342,OY=272,OR=19,NL=8;
 REGISTER({name:'The Pierced Stack ('+ALT_STATE[d]+')',x:0,z:0,r:48,h:Y1+30});
 const Rw=y=>29*Math.sqrt(1+1.2*Math.pow((y-205)/170,2));
 const lobe=th=>.86+.14*Math.pow(Math.abs(Math.cos(NL/2*th)),.5);
 const roll=y=>{const s=clamp((y-(Y1-9))/9,0,1);return 1-.2*(1-Math.sqrt(1-s*s));};
 const rr0=(th,y)=>Rw(y)*lobe(th)*roll(y);
 const nrm=(th,y)=>{const e=.004,r=rr0(th,y),r1=(rr0(th+e,y)-rr0(th-e,y))/(2*e);
  const tx=-r*Math.sin(th)+r1*Math.cos(th),tz=r*Math.cos(th)+r1*Math.sin(th),L=Math.hypot(tx,tz);return[tz/L,0,-tx/L];};
 const inOc=(x,y,m)=>x*x+(y-OY)*(y-OY)<(OR+m)*(OR+m);
 const CUT=brk?326:null,hf=holeFn(dd*.75,9816,CUT,1.3);
 const breach=(th,y)=>brk&&th>.25&&th<1.15&&y>92&&y<168+18*Math.sin(th*7)&&fbm(th*3,y*.05,9817,2)<.62+.3*Math.sin((y-92)/76*Math.PI);
 const SK=[],DK=[],GU=[];
 // THE SHELL: one lobed surface, a quad per storey, the oculus and the decay cut out of it
 const NV=74,top=CUT||Y1;
 SK.push(gridSurface((u,v)=>{const th=u*TAU;let y=Y0+v*(top-Y0);
  if(CUT)y=Y0+v*(CUT+8*(fbm(u*9,1.1,9818,3)*2-1)-Y0);
  const r=rr0(th,y);return[r*Math.cos(th),y,r*Math.sin(th)];},NL*20,NV,{uS:Rw(Y0)*TAU/8,vS:(top-Y0)/8,
  hole:(u,v)=>{const th=u*TAU,y=Y0+v*(top-Y0),x=rr0(th,y)*Math.cos(th);
   if(Math.abs(Math.sin(th))>.3&&inOc(x,y,0))return true;
   if(breach(th,y))return true;
   return !!(hf&&hf(u,y));}}));
 // storey bands every twelve floors: the shaft reads as courses at a distance
 for(let y=Y0+50;y<top-10;y+=50.4){if(Math.abs(y-OY)<OR+3)continue;
  SK.push(gridSurface((u,v)=>{const th=u*TAU,yy=y+v*1.4,r=rr0(th,yy)*1.03;return[r*Math.cos(th),yy,r*Math.sin(th)];},NL*16,1,
   {uS:Rw(y)*TAU/8,vS:.3,hole:(u)=>breach(u*TAU,y)}));}
 // the soffit under the shaft, and the roof (intact and rehabilitated only)
 SK.push(gridSurface((u,v)=>{const th=u*TAU,r=rr0(th,Y0)*v;return[r*Math.cos(th),Y0-1.5*(1-v*v),r*Math.sin(th)];},NL*12,5,{uS:8,vS:5}));
 if(!brk)SK.push(gridSurface((u,v)=>{const th=u*TAU,r=rr0(th,Y1)*v;return[r*Math.cos(th),Y1,r*Math.sin(th)];},NL*12,4,{uS:8,vS:5}));
 // FLOORS behind the skin (they are what the holes show), not inside the oculus
 for(let y=Y0+4.2;y<top-2;y+=4.2){if(Math.abs(y-OY)<OR+3)continue;
  kput('slab',[0,y-1.2,0],null,[Rw(y)*.88,.5,Rw(y)*.88],new THREE.Color(dd?0x2c2824:0x3a3c40));}
 GU.push(lathe({rFn:()=>9,H:top-Y0-4,nu:16,nv:2}).translate(0,Y0,0));     // the lift core
 // THE PORTS: three per bay, every storey
 for(let y=Y0+3.2,f=0;y<top-4;y+=4.2,f++){for(let k=0;k<NL;k++)for(const o of[-.21,0,.21]){
  const th=k/NL*TAU+o+(f%2?.04:-.04),r=rr0(th,y),x=r*Math.cos(th);
  if(inOc(x,y,3)&&Math.abs(Math.sin(th))>.25)continue;if(breach(th,y))continue;if(hf&&hf(th/TAU,y))continue;
  const n=nrm(th,y),p=[x+n[0]*.1,y,r*Math.sin(th)+n[2]*.1];
  if(d===0){kput('altPortI',p,qFacing(n),[1.05,1.35,1],null);if(rng()<.5)kput('dot',[p[0]+n[0]*.2,y,p[2]+n[2]*.2],qFacing(n),[.9,.5,1],CYAN);}
  else if(d===2&&rng()<.07)fireWindow(p,n,qFacing(n),1.6,1.9);
  else if(d===3&&rng()<.2)kput('dot',[p[0]+n[0]*.2,y,p[2]+n[2]*.2],qFacing(n),[1.2,1.4,1],WARM);
  else kput('altPortD',p,qFacing(n),[1.05,1.35,1],null);}}
 // THE OCULUS: lining, collars, and the spoked wheel standing in it
 const Lz=Rw(OY)+1.5;
 SK.push(new THREE.CylinderGeometry(OR,OR,2*Lz,40,1,true).rotateX(Math.PI/2).translate(0,OY,0));
 for(const s of[-1,1]){kput(dd?'ringR':'ringW',[0,OY,s*Lz],null,[OR+.6,OR+.6,8],null);kput(dd?'ringR':'ringW',[0,OY,s*Lz],null,[OR+2.2,OR+2.2,5],null);}
 const NS=12,RIM=OR-1.2;
 for(let k=0;k<32;k++){const a0=k/32*TAU,a1=(k+1)/32*TAU;if(brk&&(k<13||k%5===0))continue;
  beam(dd?'strutR':'strutW',[RIM*Math.cos(a0),OY+RIM*Math.sin(a0),0],[RIM*Math.cos(a1),OY+RIM*Math.sin(a1),0],1.4,1.4);}
 for(let k=0;k<NS;k++){const a=k/NS*TAU+.13;if(brk&&k%3!==1)continue;const L=brk&&k===4?.55:.98;
  beam(dd?'strutR':'strutW',[1.6*Math.cos(a),OY+1.6*Math.sin(a),0],[RIM*L*Math.cos(a),OY+RIM*L*Math.sin(a),0],.7,.9);}
 kput(dd?'boxR':'boxW',[0,OY,0],qEuler(0,0,Math.PI/4),[3.4,3.4,3],null);
 if(!dd)mesh(new THREE.CircleGeometry(RIM,32).translate(0,OY,-.3),MAT.glass,G);
 // THE PILOTIS: eight trumpets under the bay crowns, a glazed lobby drum between them
 const failed=brk?5:-1;
 for(let k=0;k<NL;k++){const th=k/NL*TAU,R0=rr0(th,Y0)*.74,x=R0*Math.cos(th),z=R0*Math.sin(th);
  const trumpet=()=>lathe({rFn:y=>2.6+8*Math.pow(y/Y0,3.2),H:Y0-1.4,nu:18,nv:10});
  if(k===failed){
   // sheared at its foot, it lies out on the plain with its crown towards the tower
   const T=new THREE.Group();T.rotation.set(0,-th,Math.PI/2+.08);T.position.set(x+20*Math.cos(th),0,z+20*Math.sin(th));G.add(T);
   mesh(trumpet(),MAT.rust,T,0,-Y0*.5,0);dropFragment(T,0,1.5);
   kput(dd?'boxCR':'boxC',[x,1.2,z],null,[6,2.4,6],null);rubbleRing(x,0,z,3,26,30,3);continue;}
  SK.push(trumpet().translate(x,0,z));kput(dd?'boxCR':'boxC',[x,.6,z],null,[7,1.2,7],null);}
 DK.push(lathe({rFn:()=>15.5,H:Y0-2,nu:40,nv:2}));
 if(!dd)mesh(lathe({rFn:()=>16.5,H:Y0-2,nu:40,nv:2}),MAT.glass,G);
 for(let j=0;j<32;j++){const a=j/32*TAU;kput(dd?'mullR':'mullW',[16.7*Math.cos(a),(Y0-2)/2,16.7*Math.sin(a)],qEuler(0,-a,0),[1,Y0-2,1],null);}
 // THE CROWN: a turret on each bay, a mast in the middle
 if(!brk){for(let k=0;k<NL;k++){const th=k/NL*TAU,r=rr0(th,Y1)*.66;
   SK.push(lathe({rFn:y=>5-1.2*Math.pow(y/11,4),H:11,nu:16,nv:4}).translate(r*Math.cos(th),Y1,r*Math.sin(th)));
   kput(dd?'ringR':'ringW',[r*Math.cos(th),Y1+7,r*Math.sin(th)],qEuler(Math.PI/2,0,0),[5.3,5.3,5],null);}
  kput(dd?'postR':'postW',[0,Y1+20,0],null,[1.1,40,1.1],null);kput('finial',[0,Y1+42,0],null,[1.6,3,1.6],null);
  stripRing(0,Y1-3,0,rr0(0,Y1-3)*.86+.2,dd,48);}
 else{for(let i=0;i<18;i++){const th=rng()*TAU,r=rr(8,24);kput('plateR',[r*Math.cos(th),top-rr(4,14),r*Math.sin(th)],qEuler(rr(-1,1),rng()*3,rr(-1,1)),[rr(3,8),rr(4,9),.8],null);}}
 // the plinth and its terrace wall
 kput(SLABC(d),[0,.5,0],null,[62,1,62],null);
 for(let k=0;k<40;k++){const a=k/40*TAU;if(k%10===2)continue;kput(BOXC(d),[62*Math.cos(a),1.6,62*Math.sin(a)],qEuler(0,-a,0),[1.2,2.2,9.6],null);}
 apron(G,0,0,62,90,dd,1);
 meshMerged(SK,skin,G);meshMerged(DK,MAT.dark,G);meshMerged(GU,MAT.guts,G);
 if(brk){rubbleRing(0,0,0,30,95,170,4.5);scatterMoss(0,0,0,20,120,90,3.5);trees(0,0,70,170,34);
  // the breach spilled out over the plinth
  for(let i=0;i<26;i++){const th=rr(.3,1.1),r=rr(40,75);kput('plateR',[r*Math.cos(th),rr(.5,2),r*Math.sin(th)],qEuler(rr(-.5,.5),rng()*3,rr(-.5,.5)),[rr(3,7),.7,rr(2,5)],null);}
  vinesOnRing(0,Y0,0,Rw(Y0)*.9,60,22);
  for(let y=96;y<170;y+=4.2)for(let i=0;i<5;i++){const th=rr(.3,1.1),r=Rw(y)*rr(.6,.85);
   kput('moss',[r*Math.cos(th),y-.9,r*Math.sin(th)],null,[rr(1,2.5),.5,rr(1,2.5)],new THREE.Color().setHSL(rr(.22,.32),.4,.1));}}
 else{trees(0,0,70,150,14);figures(0,75,12,16);}
 if(rec){
  // homes on the floor plates the breach opened, each with its fire
  for(let y=96.6;y<166;y+=4.2)for(let i=0;i<4;i++){const th=rr(.32,1.08),r=Rw(y)*rr(.45,.8),x=r*Math.cos(th),z=r*Math.sin(th),yy=y-.95,yaw=rng()*TAU;
   if(rng()<.55){kput('shantyBox',[x,yy+1.3,z],qEuler(0,yaw,0),[rr(2.5,4.5),2.6,rr(2.5,4)],null);
    kput('patchTarp',[x+2*Math.cos(th),yy+3.1,z+2*Math.sin(th)],qEuler(-Math.PI/2+.2,-th,0),[4,3,1],null);}
   else firePit('altStack',x,yy,z,rr(.6,1));}
  // hoists from the breach and from the oculus, a ladder up a piloti
  for(let i=0;i<4;i++){const th=.35+i*.22,y=100+i*16,r=rr0(th,y)+.8;altRope([r*Math.cos(th),y,r*Math.sin(th)],[(r+3)*Math.cos(th),0,(r+3)*Math.sin(th)],.12);
   kput('plank',[(r+3)*Math.cos(th),.5,(r+3)*Math.sin(th)],null,[1.8,1,1.8],null);}
  altRope([0,OY-OR+1,Lz],[0,0,Lz+16],.14);altRope([3,OY-OR+1,-Lz],[3,0,-Lz-16],.14);
  // a village in the oculus
  for(let i=0;i<10;i++){const z=rr(-Lz+3,Lz-3),a=rr(-.5,.5),x=Math.sin(a)*(OR-1),y=OY-Math.cos(a)*(OR-1);
   if(i%3===0)firePit('altStack',x,y,z,.8);else{const yaw=rr(-.2,.2);kput('shantyBox',[x,y+1.2,z],qEuler(0,yaw,a),[3.5,2.4,3],null);
    kput('shantyRoof',[x,y+2.6,z],qEuler(.1,yaw,a),[4.2,1,3.6],null);}}
  altSag([-OR*.7,OY+OR*.7,0],[OR*.7,OY+OR*.7,0],4,8,.08);
  // a market between the pilotis
  for(let k=0;k<NL;k++){if(k===failed)continue;const th=(k+.5)/NL*TAU,r=27,x=r*Math.cos(th),z=r*Math.sin(th);
   kput('patchTarp',[x,3.6,z],qEuler(-Math.PI/2+.15,-th,0),[9,6,1],null);kput('shantyBox',[x*1.08,1.1,z*1.08],qEuler(0,-th,0),[2.4,2.2,5],null);
   firePit('altStack',x*.9,1,z*.9,.7);}
  KOFF=[gx,0,gz];altReclaim(G,90,20,'altStack');figures(0,0,22,45);}
 KOFF=[0,0,0];return G;}
