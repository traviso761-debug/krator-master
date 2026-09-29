// ================================================================= ROBOTICS FACTORY — "the Assembler"
// THE ROBOT CHASSIS (QA pass 2026-09-29). The test yard's six machines were a
// box, a smaller box and four tubes. Each is now a legged frame: feet, shins,
// thighs, a pelvis, a tapered six-sided torso, a shoulder yoke, two arms with
// clamps, a sensor head; dark actuators at the joints. Built once as merged
// geometry and instanced (civDef), so six of them cost one draw call a part.
// `arm` 0 drops the left arm (the ruined variant). Feet at y=0, facing +z.
function civMergeGeo(geos){let nv=0,ni=0;for(const g of geos){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint32Array(ni);let vo=0,io=0;
 for(const g of geos){const c=g.attributes.position.count;P.set(g.attributes.position.array,vo*3);N.set(g.attributes.normal.array,vo*3);if(g.attributes.uv)U.set(g.attributes.uv.array,vo*2);
  if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)I[io+i]=ix[i]+vo;io+=ix.length;}else{for(let i=0;i<c;i++)I[io+i]=vo+i;io+=c;}vo+=c;}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));G.setIndex(new THREE.BufferAttribute(I,1));return G;}
function civRobotGeo(arm,joints){const B=(w,h,dp,x,y,z,rx)=>{const g=new THREE.BoxGeometry(w,h,dp);if(rx)g.rotateX(rx);return g.translate(x,y,z);};
 const J=(r,l,x,y,z)=>new THREE.CylinderGeometry(r,r,l,10).rotateZ(Math.PI/2).translate(x,y,z);const g=[];
 if(joints){for(const s of [-1,1]){g.push(J(1.1,2.2,s*2.2,4.3,.2),J(1.2,2.6,s*2.1,8.2,0));if(s>0||arm)g.push(J(.9,2,s*5.3,10.6,.4));}g.push(J(1.4,3.6,0,13.3,0).rotateY(0));return civMergeGeo(g);}
 for(const s of [-1,1]){g.push(B(2.6,1,4.2,s*2.2,.5,.7),B(1.8,3.6,2.1,s*2.2,2.6,.2,-.08),B(2.3,3.8,2.5,s*2.1,6.2,0,.1));}
 g.push(B(6.2,1.8,3.2,0,8.6,0));
 g.push(new THREE.CylinderGeometry(3.3,2.4,4.6,6).scale(1,1,.72).translate(0,11.5,0));
 g.push(B(9.8,1.6,3.2,0,13.9,0),B(3.8,.8,2.6,0,12.8,1.6));
 for(const s of [-1,1]){if(s<0&&!arm)continue;g.push(B(1.7,4,1.9,s*5.3,12.6,0),B(1.5,3.8,1.7,s*5.3,9,1.2,-.35),B(1.9,1.4,2,s*5.3,6.9,2.2),B(.5,1.4,.5,s*5.3+.6,5.7,2.6),B(.5,1.4,.5,s*5.3-.6,5.7,2.6));}
 g.push(new THREE.CylinderGeometry(1.7,2.1,2.4,8).translate(0,15.8,0),B(2.8,.7,1.2,0,15.9,1.8),B(.3,2.4,.3,1.2,17.9,-.5));
 return civMergeGeo(g);}
function buildRobotics(scene,gx,gz,d){reseed(9210+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Robotics factory — the Assembler ('+STATE(d)+')',x:0,z:0,r:230,h:90});
 kput(BOXC(d),[0,2,0],null,[400,4,300],null);
 // main hall: concrete shell with a north-light sawtooth roof of shaped glass
 const HW=200,HD=90,HH=22;
 if(d===0){kput(BOXC(d),[-40,4+HH/2,0],null,[HW,HH,HD],null);kput('boxD',[-40,4+HH/2,0],null,[HW-2,HH-2,HD-2],null);}
 else{// RUIN: the hall is a shell - four walls under the holed roof - and what the
  // holes show is the assembly floor: three conveyor lines, the machines along
  // them, travelling gantries overhead, and the dark of the far wall.
  for(const sz of [-1,1])kput(BOXC(d),[-40,4+HH/2,sz*(HD/2-.8)],null,[HW,HH,1.6],null);
  for(const sx of [-1,1])kput(BOXC(d),[-40+sx*(HW/2-.8),4+HH/2,0],null,[1.6,HH,HD],null);
  kput('boxD',[-40,4+HH-1,0],null,[HW-3,.6,HD-3],null);
  for(const lz of [-24,0,24]){kput('boxD',[-40,5.2,lz],null,[HW-24,1.6,4],null);
   for(let x=-128;x<=48;x+=16){const hh=h3(x,lz,1405);if(hh<.25)continue;const sd=hh<.6?1:-1;
    kput(BOXC(d),[x,6,lz+sd*5],null,[4,3.2,4],null);beam('tube',[x,7.6,lz+sd*5],[x+2,13,lz+sd*2.5],1.1,1.1);beam('tube',[x+2,13,lz+sd*2.5],[x+1,9,lz+.5],.8,.8);
    if(hh>.8)kput('boxD',[x+4,8.2,lz],qEuler(0,hh*3,rr(-.2,.2)),[5,4,3],null);}}
  for(let x=-120;x<=40;x+=40){kput(d>0?'strutR':'strutW',[x,4+HH-3,0],null,[1.6,1.6,HD-4],null);kput('boxD',[x,4+HH-5,rr(-30,30)],null,[3,3,4],null);}}
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
 if(!tcut){kput(SLABC(d),[tx,4+TH+.4,tz],null,[27,.8,27],null);beam(d>0?'strutR':'strutW',[tx,4+TH,tz],[tx-60,4+TH+6,tz+40],3,3);kput('tube',[tx-50,4+TH+5-20,tz+33.3],null,[.4,40,.4],null);kput('boxD',[tx-50,4+TH+5-41,tz+33.3],null,[3,2.2,3],null);}
 else rubbleRing(tx,4,tz,26,50,50,3);
 // overhead conveyor from tower to hall
 for(let k=0;k<4;k++){const x=70-k*30;kput(d>0?'colR':'colW',[x,4,10],null,[1.2,26,1.2],null);}kput(d>0?'pipeR':'pipe',[40,31,10],qEuler(0,0,Math.PI/2),[2.2,150,2.2],null);
 // test yard: six mount frames (giant robot chassis on stands)
 for(let i=0;i<6;i++){const x=-140+i*50,z=110;const gone=d>0&&(i===1||i===4);kput(SLABC(d),[x,4.6,z],null,[14,1.2,14],null);
  if(gone){rubbleRing(x,5,z,2,12,20,1.6);continue;}const q=qEuler(0,rr(-.4,.4),d>0?rr(-.15,.15):0);
  // mount frame behind the machine, the machine, its actuators
  kput(BOXC(d),[x,12,z-3.4],null,[3,14,1.6],null);kput(BOXC(d),[x,13.9,z-2.2],null,[5,1.2,1.8],null);
  const one=d>0&&i===5;const bn=civDef('civRobot'+(d>0?(one?'R1':'R'):'W'),()=>civRobotGeo(!one,false),d>0?MAT.rust:MAT.white);
  civDef('civRobotJ',()=>civRobotGeo(true,true),MAT.dark);
  kput(bn,[x,5.2,z],q,1,null);kput('civRobotJ',[x,5.2,z],q,1,null);
  const lit=d>0?rng()<.2:true;const vp=new THREE.Vector3(0,15.9,2.45).applyQuaternion(q);kput('dot',[x+vp.x,5.2+vp.y,z+vp.z],q,[2,.5,.4],lit?CYAN:DEAD);}
 for(let k=0;k<5;k++){const x=-165+k*50;kput(BOXC(d),[x,17,104],null,[2,26,2],null);}kput(BOXC(d),[-40,30.5,104],null,[250,1.6,3],null);
 for(let k=0;k<3;k++){const x=-125+k*80;kput(BOXC(d),[x,30.5,110],null,[3,1.2,14],null);kput('tube',[x,26,116],null,[.25,9,.25],null);kput('boxD',[x,21.2,116],null,[2,1,2],null);}
 // silos of parts, loading dock
 for(let i=0;i<4;i++){const x=-170,z=-90+i*30;mesh(lathe({rFn:y=>7*(1-.05*Math.pow(y/24,6)),H:24,nu:24,nv:6,hole:holeFn(d*.7,1430+i,null,2.5)}),skin,G,x,4,z);kput(d>0?'ringR':'ringW',[x,28,z],qEuler(Math.PI/2,0,0),[7.3,7.3,2],null);}
 kput(BOXC(d),[-40,5.5,-HD/2-14],null,[HW*.6,3,14],null);for(let k=0;k<6;k++)kput('archOpen',[-100+k*24,10,-HD/2-.8],qFacing([0,0,-1]),[.9,.9,1.5],null);
 if(d>0){scatterMoss(0,4,0,0,190,150,2.4);rubbleRing(-40,4,0,30,150,60,2.2);trees(0,0,210,290,22);vinesOnRing(-40,4+HH,0,HD/2,20,10);}
 figures(0,60,5,10);KOFF=[0,0,0];return G;}

