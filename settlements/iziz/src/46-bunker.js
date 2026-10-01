// ================================================================= MILITARY BUNKER — "the Redoubt"
function buildBunker(scene,gx,gz,d){reseed(d>0?9701:9700);KOFF=[gx,0,gz];REGISTER({name:'Bunker — the Redoubt ('+STATE(d)+')',x:0,z:0,r:90,h:60});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // earth berm (hex), cyclopean hex mass, casemates
 const berm=lathe({rFn:y=>78-2.2*y,H:10,nu:6,nv:2});mesh(berm,MAT.mud,G);kput('slab',[0,10,0],null,[56,.4,56],new THREE.Color(0x7a4a34));
 const R0=54,R1=46,HM=16;const hole=holeFn(d*.9,400,null,1.2);
 // RUIN: the south-east face is BREACHED - a V blown down through the casemate
 // wall nearly to the berm, the rooms behind it open, the face's ribs and
 // casemate fins gone and its wall lying in slabs down the berm. Before this
 // the ruin kept the intact silhouette with a few holes in it.
 const BR=Math.PI/6,brk=(th,y)=>d>0&&civDA(th,BR)<.3*(.35+.65*clamp(y/HM,0,1))+.03*(fbm(th*9,y*.3,405,2)-.5)&&y>1.5;
 if(d===0)mesh(lathe({rFn:y=>R0-(R0-R1)*y/HM,H:HM,nu:6,nv:8,hole:(u,y)=>hole&&hole(u,y)&&(u>.62&&u<.85)}),skin,G,0,10,0);
 else mesh(gridSurface((u,v)=>{const th=u*TAU,y=v*HM,r=hexR(R0-(R0-R1)*y/HM,th);return[r*Math.cos(th),10+y,r*Math.sin(th)];},96,16,
  {uS:R0*TAU/8,vS:HM/8,hole:(u,v)=>brk(u*TAU,v*HM)||(hole&&hole(u,v*HM)&&(u>.62&&u<.85))}),skin,G);
 if(d>0){mesh(lathe({rFn:y=>(R0-(R0-R1)*y/HM)*.62,H:HM,nu:6,nv:2}),MAT.guts,G,0,10,0);
  // the casemate wall between breach and liner: two floors of rooms
  civRooms({cy:10,rFn:y=>(R0-(R0-R1)*y/HM)*.84,y0:.3,y1:HM,step:8,d,seed:406,rIn:.72,gap:th=>civDA(th,BR)>.6});
  mesh(lathe({rFn:y=>(R0-(R0-R1)*y/HM)*.9,H:HM,nu:6,nv:2,hole:(u,y)=>civDA(u*TAU,BR)<.34}),MAT.guts,G,0,10,0);
  // the blown wall, in slabs down the berm, and the spill
  const n=[Math.cos(BR),0,Math.sin(BR)],bermY=r=>clamp((78-r/.866)/2.2,0,10),rW=hexR(R0,BR);
  for(let k=0;k<7;k++){const r=rW+rr(2,24),t=rr(-14,14);const x=n[0]*r-n[2]*t,z=n[2]*r+n[0]*t;
   kput('boxCR',[x,bermY(r)+rr(.3,1.2),z],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(5,10),rr(1.2,2),rr(4,8)],null);}
  for(let i=0;i<70;i++){const q=Math.pow(rng(),2),r=rW+1+q*24,t=rr(-16,16)*(1-.5*q),sz=rr(.8,3)*(1.2-.5*q);const x=n[0]*r-n[2]*t,z=n[2]*r+n[0]*t;
   kput('rubble',[x,bermY(r)+(1-q)*2.2+sz*.35,z],qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.7,1.5),sz*rr(.5,1),sz*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.35),rr(.3,.55)));}}
 kput('slab',[0,26,0],null,[R1*.98,.8,R1*.98],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 for(let f=0;f<6;f++){const fa=f/6*TAU+Math.PI/6;const n=[Math.cos(fa),0,Math.sin(fa)];const tang=[-n[2],0,n[0]];
  for(let k=-1;k<=1;k++){if(d>0&&f===0&&k===0)continue;const y=20;const rr0=hexR(R0-(R0-R1)*(y-10)/HM,fa)+.3;const px=n[0]*rr0+tang[0]*k*13,pz=n[2]*rr0+tang[2]*k*13;
   kput('finW',[px,y,pz],qFacing(n),[6,1.8,1.6],null);}
  // cliff-face sawtooth ribs (Soleri)
  for(let k=-2;k<=2;k++){const rr0=hexR(R0,fa)+1.2;const px=n[0]*rr0+tang[0]*k*9.5,pz=n[2]*rr0+tang[2]*k*9.5;
   if(d>0&&rng()<.25)continue;if(d>0&&f===0&&Math.abs(k)<2)continue;beam(d>0?'strutR':'strutW',[px,10,pz],[px-n[0]*7,10+HM,pz-n[2]*7],3,2.5);}}
 // gate + ramp on face 0 (facing +z)
 const ga=Math.PI/2;const gR=hexR(R0-(R0-R1)*6.5/HM,ga);kput('archOpen',[Math.cos(ga)*(gR-1.9),16.5,Math.sin(ga)*(gR-1.9)],qFacing([Math.cos(ga),0,Math.sin(ga)]),[1.6,1.6,4],null);
 kput(d>0?'strutR':'strutW',[0,5,hexR(R0,ga)+22],qEuler(-.2,0,0),[14,1.5,44],null);
 // observation cupola + gun-bay portico of leaning struts + petal sensor clusters
 const CH=22,ccut=d>0?CH*.6:null;
 mesh(lathe({rFn:y=>5*Math.sqrt(1+1.6*Math.pow((y-CH*.55)/(CH*.55),2))+(y>CH-6?7*Math.pow((y-(CH-6))/6,1.5):0),H:CH,cut:ccut,jag:ccut?2:0,nu:36,nv:20,hole:holeFn(d*.7,410,ccut,1.5)}),skin,G,0,26,0);
 if(!ccut){kput('slab',[0,26+CH,0],null,[13,1,13],new THREE.Color(0xd8d4cc));stripRing(0,26+CH-2.5,0,11,d,24);for(let k=0;k<8;k++){const th=k/8*TAU;kput('finW',[Math.cos(th)*12.3,26+CH-3,Math.sin(th)*12.3],qEuler(0,-th,0),[5,1.4,1],null);}}
 for(let k=0;k<5;k++){const th=(k/5)*TAU+.9;const fallen=d>0&&(k===1||k===3);
  const a=[Math.cos(th)*38,26.4,Math.sin(th)*38],b=[Math.cos(th)*9,26+CH*(ccut?.5:.85),Math.sin(th)*9];
  if(!fallen)beam(d>0?'strutR':'strutW',a,b,3.2,2.4);else beam('strutR',[a[0],27.6,a[2]],[a[0]*.3+rr(-6,6),28,a[2]*.3+rr(-6,6)],3.2,2.4);}
 if(!ccut){kput('slab',[0,26+CH+.6,0],null,[22,1.2,22],new THREE.Color(0xd8d4cc));aaBattery(G,d,0,26+CH+1.2,0,2.6);}else{aaBattery(G,d,0,26+ccut-2,0,2.6);}
 aaBattery(G,d,26,26.4,-24,3.2);aaBattery(G,d,-30,26.4,-10,3.2);
 if(d>0){mossOnRing(0,10.4,0,50,60,2.5);mossOnRing(0,26.3,0,30,30,2);vinesOnRing(0,26,0,R1*1.02,30,12);rubbleRing(0,10,0,50,72,60,2.5);trees(0,0,90,150,14);}
 figures(0,110,6,8);KOFF=[0,0,0];return G;}

