// ================================================================= DATA CENTER — "the Vault" (cyclopean, windowless)
function buildDataCenter(scene,gx,gz,d){reseed(9220+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Data center — the Vault ('+STATE(d)+')',x:0,z:0,r:220,h:80});
 const W=260,Dp=140,H=62;
 // berm and the mass: battered box, 4 faces + roof
 mesh(lathe({rFn:y=>(190-3*y),H:8,nu:8,nv:2}),MAT.mud,G);
 const bat=.06;const face=(fx,fz)=>gridSurface((u,v)=>{const y=v*H;const sh=1-bat*v;let x,z;if(fx){x=fx*W/2*sh;z=(u-.5)*Dp*sh;}else{x=(u-.5)*W*sh;z=fz*Dp/2*sh;}return[x,8+y,z];},fx?40:80,16,{uS:fx?14:26,vS:6,hole:holeFn(d*.5,1700+fx+fz*2,null,1.4)});
 [[1,0],[-1,0],[0,1],[0,-1]].forEach(f=>mesh(face(f[0],f[1]),CONC(d),G));
 mesh(gridSurface((u,v)=>{const sh=1-bat;return[(u-.5)*W*sh,8+H,(v-.5)*Dp*sh];},20,10,{uS:26,vS:14,hole:holeFn(d*.7,1701,null,2)}),CONC(d),G);
 kput('boxD',[0,8+H/2,0],null,[W*.94,H,Dp*.94],null);
 // cooling fins: deep concrete ribs on the long faces, a few fallen in ruin
 for(let k=-9;k<=9;k++){const x=k*13;for(const s of [-1,1]){const gone=d>0&&rng()<.18;const z=s*(Dp/2*(1-bat/2)+2);if(!gone)kput(BOXC(d),[x,8+H/2,z],qEuler(-bat*s*.5,0,0),[4,H+2,7],null);else kput('boxCR',[x+rr(-6,6),9.5,z+s*rr(20,50)],qEuler(Math.PI/2*.9,rr(-.3,.3),0),[4,H*.8,7],null);
   const lit=d>0?rng()<.08:true;kput('strip',[x+6.5,8+H*.6,z-s*2.5],qEuler(Math.PI/2,0,0),[H*.5,1,1],lit?new THREE.Color(0x8fd0ff):DEAD);}}
 // roof chillers: 8 drums with dark grilles; exhaust stacks
 for(let i=0;i<8;i++){const x=-105+i*30,z=(i%2?1:-1)*22;const gone=d>0&&(i===2||i===5);mesh(lathe({rFn:y=>11*(1-.02*y),H:12,flutes:16,amp:.05,nu:40,nv:4,hole:holeFn(d*.7,1710+i,null,2.5)}),CONC(d),G,x,8+H,z);
  if(!gone)kput('slab',[x,8+H+12.2,z],null,[10.5,.4,10.5],new THREE.Color(0x1a1d22));else{rubbleRing(x,8+H,z,3,14,20,1.5);}
  kput(d>0?'pipeR':'pipe',[x,8+H+6,z+(i%2?-1:1)*14],qEuler(Math.PI/2,0,0),[1.2,14,1.2],null);}
 for(let i=0;i<3;i++){const x=-30+i*30;mesh(lathe({rFn:y=>4.5*(1-.2*y/40)+1.5*clamp((y-34)/6,0,1),H:40,cut:d>0&&i===1?22:null,jag:2,flutes:8,amp:.1,nu:24,nv:12}),CONC(d),G,x,8+H,-50);}
 // the slit entrance: a deep cut ramping down into the mass; substation yard
 kput('boxD',[0,8+9,Dp/2*.97-2],null,[9,18,16],null);kput(BOXC(d),[0,4,Dp/2+30],qEuler(.12,0,0),[12,1.5,50],null);for(const s of [-1,1])kput(BOXC(d),[s*7,6,Dp/2+30],qEuler(.12,0,0),[1.5,4,50],null);
 for(let i=0;i<6;i++){const x=W/2+30+(i%3)*18,z=-30+Math.floor(i/3)*30;kput('boxD',[x,4,z],null,[10,8,8],null);for(let k=0;k<3;k++)kput('tube',[x-3+k*3,10,z],null,[.6,4,.6],null);kput(d>0?'pipeR':'pipe',[x,9,z+10],qEuler(Math.PI/2,0,0),[.5,14,.5],null);}
 for(let k=0;k<4;k++)kput(d>0?'colR':'colW',[W/2+10+k*22,0,60],null,[1,12,1],null);kput(d>0?'pipeR':'pipe',[W/2+43,11,60],qEuler(0,0,Math.PI/2),[.8,70,.8],null);
 for(let k=-10;k<=10;k++)for(const sz of [-1,1]){const lit=d>0?rng()<.1:true;kput('strip',[k*12,8+H+.6,sz*Dp*.42],null,[8,1,1],lit?new THREE.Color(0x8fd0ff):DEAD);}
 if(d>0){scatterMoss(0,8,0,0,180,120,3);mossOnRing(0,8+H+.3,0,50,30,3);vinesOnRing(0,8+H,0,Dp/2*.9,30,30);rubbleRing(0,8,0,100,200,70,3);trees(0,0,200,290,20);}
 figures(0,120,4,8);KOFF=[0,0,0];return G;}

