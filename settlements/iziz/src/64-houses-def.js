// ================================================================= HOUSES D/E/F
function buildHouses2(scene,gx,gz,d){reseed(9410+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 // SPACING. D, E and F sat at x=0, 60 and 130 on a row whose sites are 120
 // apart, so the intact House F stood in the rehabilitated House D. They now sit
 // at 25, 65 and 105 (the presets aim at 65); D moves by its own group and KOFF.
 const DX=25;
 // D — apse house (Arcosanti): concrete quarter-sphere open to +z, glass front wall
 {KOFF=[gx+DX,0,gz];const Dg=new THREE.Group();Dg.position.x=DX;G.add(Dg);REGISTER({name:'House D — apse house ('+STATE(d)+')',x:0,z:0,r:14,h:12});kput(SLABC(d),[0,.3,0],null,[12,.6,12],null);
  const R=9;mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow(y/R,2),0,1)),H:R,nu:48,nv:16,hole:(u,y)=>Math.sin(u*TAU)>.05||(d>0&&fbm(u*6,y*.3,150,2)<.3)||(Math.hypot(u-.75,y/R-.5)<.07)}),CONC(d),Dg,0,.6,0);
  mesh(lathe({rFn:y=>R*.94*Math.sqrt(clamp(1-Math.pow(y/R,2),0,1)),H:R,nu:24,nv:8,hole:(u,y)=>Math.sin(u*TAU)>.05}),MAT.dark,Dg,0,.6,0);
  if(d===0)mesh(gridSurface((u,v)=>{const x=(u-.5)*R*1.9;const y=v*R*.95*Math.sqrt(clamp(1-Math.pow(x/R,2),0,1));return[x,.6+y,0];},20,6,{}),MAT.glass,Dg);
  for(let k=-3;k<=3;k++){const x=k*2.4;const h=R*.95*Math.sqrt(clamp(1-Math.pow(x/R,2),0,1));kput(d>0?'mullR':'mullW',[x,.6+h/2,0],null,[.6,h,.6],null);}
  kput('archOpen',[3,2.2,.1],qFacing([0,0,1]),[.35,.45,1],null);kput(SLABC(d),[3,.2,8],null,[2.5,.4,2.5],null);
  kput(BOXC(d),[-7,1.6,3],null,[4,.5,5],null);for(let k=0;k<6;k++){const a=Math.PI+(k+.5)/6*Math.PI;const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*4.5,5,Math.sin(a)*4.5],qEuler(0,-a,0),[2,1,1],lit?CYAN:DEAD);}if(d>0){mossOnRing(0,.7,0,9,14,1.2);vinesOnRing(0,7,0,5,6,6);}KOFF=[gx,0,gz];}
 // E — bridge house: a glass box spanning two concrete piers
 {const bx=65;REGISTER({name:'House E — bridge house ('+STATE(d)+')',x:bx,z:0,r:16,h:12});
  for(const s of [-1,1]){mesh(lathe({rFn:y=>2.6*Math.sqrt(1+1.2*Math.pow((y-4)/4,2)),H:8,nu:20,nv:6,hole:holeFn(d*.5,160+s,null,3)}),CONC(d),G,bx+s*9,0,0);}
  // In the ruin the span has failed west of the middle: the floor has broken
  // off the stub still sitting on the west pier and hinged down to the ground,
  // the roof over it has come down beside the house, and the glass box is only
  // the east half. It used to be the intact box with dark glass.
  if(d===0){kput(BOXC(d),[bx,8.3,0],null,[26,.7,8],null);kput(BOXC(d),[bx,12.2,0],null,[27,.7,9],null);}
  else{kput(BOXC(d),[bx+6.5,8.3,0],null,[13,.7,8],null);kput(BOXC(d),[bx+5.5,12.2,0],null,[16,.7,9],null);
   kput(BOXC(d),[bx-9.5,8.3,0],null,[7,.7,8],null);
   const L=Math.hypot(6.5,7.4),an=Math.atan2(7.4,6.5);kput(BOXC(d),[bx-2.75,4.6,.3],qEuler(0,.05,-an),[L,.7,8],null);
   kput(BOXC(d),[bx-8,.9,9],qEuler(.08,.35,-.12),[11,.7,8],null);}
  if(d===0){for(const s of [-1,1])kput('pane',[bx,10.2,s*4],null,[24,3.2,1],null);for(const s of [-1,1])kput('pane',[bx+s*12.5,10.2,0],qEuler(0,Math.PI/2,0),[8,3.2,1],null);}
  else{kput('boxD',[bx+6,10.2,0],null,[11,3,6],null);}
  for(let k=-2;k<=2;k++){if(d>0&&k<0)continue;kput(d>0?'mullR':'mullW',[bx+k*6,10.2,4.1],null,[.5,3.4,.5],null);}
  // stair up the east pier, door at the top
  for(let k=0;k<8;k++){const a=Math.PI/2-(7-k)*.7;kput(BOXC(d),[bx+9+4.5*Math.cos(a),k*1.05+.5,4.5*Math.sin(a)],qEuler(0,-a,0),[3,.4,1.6],null);}kput(BOXC(d),[bx+9,8.7,4.6],null,[3,.4,1.6],null);kput('archOpen',[bx+9,9.9,4.3],qFacing([0,0,1]),[.3,.36,1],null);
  stripRing(bx,11.6,0,3,d,8);if(d>0){mossOnRing(bx,.3,0,10,10,1.2);vinesOnRing(bx+6,12.5,0,6,8,8);}}
 // F — terrace house: three stepped concrete trays into a slope, glass fronts, planters
 {const fx=105;REGISTER({name:'House F — terrace house ('+STATE(d)+')',x:fx,z:0,r:16,h:12});
  mesh(lathe({rFn:y=>16-1.4*y,H:9,nu:6,nv:2}),MAT.rock,G,fx,0,-8);
  for(let t=0;t<3;t++){const y=t*3.6,z=6-t*5,w=16-t*3;
   // in the ruin the top tray has gone: its roof slab has slumped onto the tray
   // below and only a stub of its back wall stands
   if(d>0&&t===2){kput(BOXC(d),[fx+1.5,y+.9,z+1.5],qEuler(.22,.25,.12),[w,.5,7],null);kput('brick',[fx-w/4,y+1,z-3.6],null,[w/2,2,.5],null);continue;}
   kput(BOXC(d),[fx,y+.3,z],null,[w,.6,9],null);kput(BOXC(d),[fx,y+3.4,z-1],null,[w+1,.5,8],null);
   if(d===0)kput('pane',[fx,y+1.9,z+3.8],null,[w-2,2.6,1],null);else kput('boxD',[fx,y+1.9,z+1],null,[w-3,2.6,5],null);
   for(let k=-1;k<=1;k++)kput(d>0?'mullR':'mullW',[fx+k*(w/2-1.5),y+1.9,z+3.9],null,[.5,2.8,.5],null);
   kput('brick',[fx,y+1.9,z-3.6],null,[w,2.8,.5],null);for(const s of [-1,1])kput('brick',[fx+s*(w/2-.25),y+1.9,z],null,[.5,2.8,8.4],null);kput(BOXC(d),[fx-w/2+1.5,y+3.9,z+3],null,[3,.8,2],null);
   for(let k=0;k<3;k++)kput('moss',[fx-w/2+1+k*.8,y+4.4,z+3],null,[1,.5,1],new THREE.Color().setHSL(.28,.5,.2));}
  kput('archOpen',[fx+4,1.9,10.6],qFacing([0,0,1]),[.3,.36,1],null);for(let k=0;k<4;k++)kput(BOXC(d),[fx-7,1.2+k*.9,9-k*1.4],null,[2,.3,1.4],null);
  stripRing(fx,3,6,4,d,8);if(d>0){mossOnRing(fx,.6,6,8,14,1.3);}}
 figures(45,14,4,4);KOFF=[0,0,0];return G;}

