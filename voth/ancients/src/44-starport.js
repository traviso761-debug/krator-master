// ================================================================= STARPORT — "the Starfish"
function buildStarport(scene,gx,gz,d){reseed(d>0?9601:9600);KOFF=[gx,0,gz];REGISTER({name:'Starport — the Starfish ('+STATE(d)+')',x:0,z:0,r:360,h:120});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const RD=70,HD=40,NA=5,L=210;
 mesh(lathe({rFn:()=>RD*1.15,H:3,nu:96,nv:1}),skin,G);
 mesh(lathe({rFn:y=>RD*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD,nu:96,nv:24,hole:(u,y)=>{const sky=y>HD*.86;return sky||(holeFn(d,300,null,1.2)||(()=>false))(u,y);}}),skin,G,0,3,0);
 if(d===0)mesh(lathe({rFn:y=>RD*.98*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD,nu:48,nv:10,hole:(u,y)=>y<HD*.84}),MAT.glass,G,0,3,0);
 else mesh(lathe({rFn:y=>RD*.9*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD*.9,nu:48,nv:8}),MAT.dark,G,0,3,0);
 stripRing(0,10,0,RD*.85,d,48);stripRing(0,24,0,RD*.62,d,40);
 const mouths=[];   // the five hangar end walls, merged after the loop: one draw call
 for(let i=0;i<NA;i++){const th=i/NA*TAU+.3;const cx=Math.cos(th),cz=Math.sin(th);const sx=-cz,sz=cx;
  const broken=d>0&&i===2;const hole=holeFn(d,310+i,null,1.4);
  const arm=(u,v)=>{const s=v*L;const t=s/L;const w=38*(1-.55*t);const h=(HD*.75)*(1-.6*t)+6;const q=(u-.5)*2;const x=RD*.6+s;const y=h*Math.pow(clamp(1-q*q,0,1),.55);
   return[x*cx+q*w*sx,y,x*cz+q*w*sz];};
  // RUIN: the broken arm's outer vault has PANCAKED - flattened onto its own
  // floor beyond the break, where it used to stand whole past a narrow gap.
  const armB=broken?(u,v)=>{const p=arm(u,v);if(v>.64)p[1]*=.12+.12*fbm(u*6,v*24,321,2);return p;}:arm;
  mesh(gridSurface(armB,40,60,{uS:8,vS:30,hole:(u,v)=>{const spine=Math.abs(u-.5)<.045&&v<.9;const gap=broken&&v>.5&&v<.64;return spine||gap||(hole&&hole(u*3+i,v*L));}}),skin,G);
  if(d===0)mesh(gridSurface((u,v)=>arm(.455+u*.09,v*.9),6,40,{}),MAT.glass,G);
  else mesh(gridSurface((u,v)=>{const p=armB(u,v);return[p[0]*.985,Math.max(.3,3+(p[1]-3)*.9),p[2]*.985];},20,30,{uS:8,vS:30,hole:(u,v)=>broken&&v>.5&&v<.64}),MAT.guts,G);
  for(let s=20;s<L-10;s+=20){const p=arm(.5,s/L);const lit=d>0?rng()<.1:true;if(broken&&s/L>.5)continue;kput('strip',[p[0],p[1]-2,p[2]],qEuler(0,-th,0),[14,1,1],lit?CYAN:DEAD);}
  if(broken){const p=arm(.5,.57);rubbleRing(p[0],0,p[2],5,40,90,3);for(const v of [.72,.86]){const p2=arm(.5,v);rubbleRing(p2[0],0,p2[2],12,34,30,2.6);}}
  // THE HANGAR MOUTH. Each arm used to end in an open half-tube that showed its
  // own inside. Now its end is walled, with a great dark door in it, lit round
  // its head when intact; in a ruin the wall is holed and the door stands open
  // on the arm's floor. (The pancaked arm has no mouth left to close.)
  if(!broken){const vE=.985,e=arm(.5,vE),e2=arm(.5,1);const n=[e2[0]-e[0],0,e2[2]-e[2]];const nl=Math.hypot(n[0],n[2]);n[0]/=nl;n[2]/=nl;
   const eh=holeFn(d,340+i,null,3);
   mouths.push(gridSurface((u,v)=>{const p=arm(u,vE);return[p[0],p[1]*v,p[2]];},20,6,{uS:4,vS:2,hole:(u,v)=>{const q=(u-.5)*2;if(Math.abs(q)<.42&&v<.62)return true;return eh?eh(u,v*20):false;}}));
   kput('boxD',[e[0]-n[0]*5,5.5,e[2]-n[2]*5],qFacing(n),[26,11,.6],null);
   kput('slab',[e[0]-n[0]*16,.4,e[2]-n[2]*16],null,[16,.8,16],new THREE.Color(d>0?0x3a3430:0x6a625a));
   for(let k=-3;k<=3;k++){const lit=d>0?h3(i,k,341)<.12:true;kput('strip',[e[0]+n[2]*k*3.8+n[0]*.2,11.6,e[2]-n[0]*k*3.8+n[2]*.2],qFacing(n),[3,1,1],lit?new THREE.Color(0xffb060):DEAD);}}
  // landing pad at the arm's end
  const px=(RD*.6+L+52)*cx,pz=(RD*.6+L+52)*cz;kput('slab',[px,1.5,pz],null,[42,3,42],new THREE.Color(d>0?0x4a4038:0x8a8078));
  for(let k=0;k<24;k++){const a=k/24*TAU;const lit=d>0?rng()<.15:true;kput('strip',[px+40*Math.cos(a),3.2,pz+40*Math.sin(a)],qEuler(0,-a,0),[6,1,1],lit?new THREE.Color(0xffb060):DEAD);}
  kput('slab',[px,1.2,pz],qEuler(0,-th,0),[6,2.4,24],new THREE.Color(d>0?0x4a4038:0x8a8078));
  if(d>0){scatterMoss(px,3,pz,0,38,25,2);}
  // REHABILITATED: the aprons are camps - tents pitched on the pads
  if(d===3){civDef('civTent',()=>new THREE.ConeGeometry(1,1,4,1).rotateY(Math.PI/4).translate(0,.5,0),MAT.tarp);
   for(let k=0;k<9;k++){const a=h3(i,k,350)*TAU,r=8+h3(k,i,351)*26,sz=3+h3(i*3,k,352)*3;
    kput('civTent',[px+r*Math.cos(a),3,pz+r*Math.sin(a)],qEuler(0,a,0),[sz,sz*.8,sz*1.4],new THREE.Color().setHSL(.07+h3(k,i,353)*.06,.35,.45+h3(i,k,354)*.2));}
   kput('waterButt',[px+3,4,pz-4],null,[1.2,2,1.2],null);}}
 meshMerged(mouths,skin,G);
 // control needle on the dome
 const NH=70,ncut=d>0?NH*.5:null;mesh(lathe({rFn:y=>4.5*(1-.5*y/NH)+ (y>NH-14?9*Math.pow((y-(NH-14))/14,1.4)*(1-.3*Math.pow((y-(NH-14))/14,4)):0),H:NH,cut:ncut,jag:ncut?2:0,flutes:6,amp:.2,nu:40,nv:30,hole:holeFn(d*.6,330,ncut,1)}),skin,G,0,HD-2,0);
 if(!ncut){kput('slab',[0,HD-2+NH,0],null,[13,.8,13],new THREE.Color(0xd8d4cc));stripRing(0,HD-2+NH-4,0,11,d,24);}
 for(let yy=14;yy<NH-16;yy+=14){if(ncut&&yy>ncut-3)break;kput(d>0?'ringR':'ringW',[0,HD-2+yy,0],qEuler(Math.PI/2,0,0),[5.2,5.2,5],null);}
 apron(G,0,0,RD*1.16,RD*1.7,d,1.6);
 if(d>0){scatterMoss(0,0,0,80,330,260,3);rubbleRing(0,3,0,60,120,80,2.5);trees(0,0,120,330,26);}
 figures(0,120,8,10);KOFF=[0,0,0];return G;}

