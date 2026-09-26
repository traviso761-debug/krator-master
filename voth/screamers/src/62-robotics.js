// ================================================================= ROBOTICS FACTORY — "the Assembler"
function buildRobotics(scene,gx,gz,d){reseed(9210+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Robotics factory — the Assembler ('+STATE(d)+')',x:0,z:0,r:230,h:90});
 kput(BOXC(d),[0,2,0],null,[400,4,300],null);
 // main hall: concrete shell with a north-light sawtooth roof of shaped glass
 const HW=200,HD=90,HH=22;kput(BOXC(d),[-40,4+HH/2,0],null,[HW,HH,HD],null);kput('boxD',[-40,4+HH/2,0],null,[HW-2,HH-2,HD-2],null);
 const NB=8;for(let b=0;b<NB;b++){const z0=-HD/2+b*(HD/NB),z1=z0+HD/NB;const gone=d>0&&(b===2||b===5);
  const roof=gridSurface((u,v)=>{const x=-40-HW/2+u*HW;const zz=lerp(z0,z1,v);const y=4+HH+(1-v)*9*(1-.15*Math.pow(u*2-1,2));return[x,y,zz];},40,6,{uS:20,vS:2,hole:holeFn(d*.7,1400+b,null,2)});mesh(roof,CONC(d),G);
  if(!gone&&d===0)mesh(gridSurface((u,v)=>{const x=-40-HW/2+u*HW;return[x,4+HH+v*9*(1-.15*Math.pow(u*2-1,2)),z0+.2];},40,4,{}),MAT.glass,G);
  else if(!gone)mesh(gridSurface((u,v)=>{const x=-40-HW/2+u*HW;return[x,4+HH+v*9*(1-.15*Math.pow(u*2-1,2)),z0+.2];},40,2,{hole:(u,v)=>fbm(u*8,b,1410,2)<.4}),MAT.dark,G);
  for(let k=0;k<=10;k++){const x=-40-HW/2+k*HW/10;kput(d>0?'mullR':'mullW',[x,4+HH+4.5,z0+.3],null,[1,9,1],null);}}
 for(let k=0;k<13;k++){const x=-40-HW/2+k*HW/12;kput(BOXC(d),[x,4+HH/2,HD/2+.6],null,[2.2,HH,2],null);kput(BOXC(d),[x,4+HH/2,-HD/2-.6],null,[2.2,HH,2],null);
  if(k%3===1){kput('archOpen',[x+8,10,HD/2+1.5],qFacing([0,0,1]),[1.4,1.2,2],null);}}
 for(let k=0;k<6;k++){const x=-120+k*32;const lit=d>0?rng()<.15:true;kput('strip',[x,4+HH-1,0],qEuler(0,Math.PI/2,0),[70,1,1],lit?CYAN:DEAD);}
 // vertical assembly tower: fluted concrete drum with open bays, gantry arm
 const tx=110,tz=-40,TH=70,tcut=d>0?TH*.85:null;
 mesh(lathe({rFn:y=>24+3*Math.sin(y*.3),H:TH,cut:tcut,jag:tcut?3:0,flutes:10,amp:.12,sharp:1.5,nu:64,nv:36,hole:(u,y)=>(Math.abs(((u*10)%1)-.5)<.22&&((y%14)>4&&(y%14)<12)&&y>8)||(holeFn(d*.7,1420,tcut,1.5)||(()=>false))(u,y)}),CONC(d),G,tx,4,tz);
 mesh(lathe({rFn:()=>20,H:TH,cut:tcut,jag:3,nu:24,nv:4}),MAT.dark,G,tx,4,tz);
 for(let y=12;y<(tcut||TH)-6;y+=14)for(let k=0;k<10;k++){const th=(k+.5)/10*TAU;const r=21;kput('boxD',[tx+r*Math.cos(th),4+y+2,tz+r*Math.sin(th)],qEuler(0,-th,0),[6,.6,10],null);
  const lit=d>0?rng()<.15:true;kput('strip',[tx+r*Math.cos(th),4+y+7,tz+r*Math.sin(th)],qEuler(0,-th,0),[5,1,1],lit?WARM:DEAD);}
 if(!tcut){kput(SLABC(d),[tx,4+TH+.4,tz],null,[27,.8,27],null);beam(d>0?'strutR':'strutW',[tx,4+TH,tz],[tx-60,4+TH+6,tz+40],3,3);kput('tube',[tx-50,4+TH+2,tz+34],null,[.4,40,.4],null);}
 else rubbleRing(tx,4,tz,26,50,50,3);
 // overhead conveyor from tower to hall
 for(let k=0;k<4;k++){const x=70-k*30;kput(d>0?'colR':'colW',[x,4,10],null,[1.2,26,1.2],null);}kput(d>0?'pipeR':'pipe',[40,31,10],qEuler(0,0,Math.PI/2),[2.2,150,2.2],null);
 // test yard: six mount frames (giant robot chassis on stands)
 for(let i=0;i<6;i++){const x=-140+i*50,z=110;const gone=d>0&&(i===1||i===4);kput(SLABC(d),[x,4.6,z],null,[14,1.2,14],null);
  if(gone){rubbleRing(x,5,z,2,12,20,1.6);continue;}const q=qEuler(0,rr(-.4,.4),d>0?rr(-.15,.15):0);
  kput(BOXC(d),[x,9,z],null,[3,8,3],null);kput('boxD',[x,16,z],q,[12,6,7],null);kput('boxD',[x,21,z],q,[6,4,5],null);
  for(const s of [-1,1]){kput('tube',[x+s*7.5,14,z],q,[1.2,10,1.2],null);kput('tube',[x+s*3.5,7,z+1],q,[1.4,8,1.4],null);}
  const lit=d>0?rng()<.2:true;kput('dot',[x,21,z+2.6],null,[2,.6,.4],lit?CYAN:DEAD);}
 for(let k=0;k<5;k++){const x=-165+k*50;kput(BOXC(d),[x,10,110],null,[2,12,2],null);}kput(BOXC(d),[-40,16.5,110],null,[250,1.6,3],null);
 // silos of parts, loading dock
 for(let i=0;i<4;i++){const x=-170,z=-90+i*30;mesh(lathe({rFn:y=>7*(1-.05*Math.pow(y/24,6)),H:24,nu:24,nv:6,hole:holeFn(d*.7,1430+i,null,2.5)}),skin,G,x,4,z);kput(d>0?'ringR':'ringW',[x,28,z],qEuler(Math.PI/2,0,0),[7.3,7.3,2],null);}
 kput(BOXC(d),[-40,5.5,-HD/2-14],null,[HW*.6,3,14],null);for(let k=0;k<6;k++)kput('archOpen',[-100+k*24,10,-HD/2-.8],qFacing([0,0,-1]),[.9,.9,1.5],null);
 if(d>0){scatterMoss(0,4,0,0,190,150,2.4);rubbleRing(-40,4,0,30,150,60,2.2);trees(0,0,210,290,22);vinesOnRing(-40,4+HH,0,HD/2,20,10);}
 figures(0,60,5,10);KOFF=[0,0,0];return G;}

