// ================================================================= FUEL STATION — "the Well"
function buildFuelStation(scene,gx,gz,d){reseed(9970+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Fuel station — the Well ('+STATE(d)+')',x:0,z:0,r:60,h:30});
 kput('slab',[0,.3,0],null,[52,.6,52],new THREE.Color(d>0?0x4a4038:0x8a8078));
 // canopy: one hyperboloid mast, a lobed hovering disc with a hole, six pump bays under it
 mesh(lathe({rFn:y=>4*Math.sqrt(1+2*Math.pow((y-9)/9,2)),H:18,nu:32,nv:10}),skin,G);
 mesh(lathe({rFn:y=>lerp(30,34,Math.sin(Math.PI*y/3)),H:3,flutes:6,amp:.22,sharp:1,nu:96,nv:4,hole:(u,y)=>false}),skin,G,0,15,0);
 mesh(lathe({rFn:()=>6,H:3.2,nu:24,nv:1}),MAT.dark,G,0,14.9,0);
 if(d>0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(6,30*(1+.22*(.5+.5*Math.cos(6*th))),v);return[r*Math.cos(th),15,r*Math.sin(th)];},96,4,{hole:(u,v)=>fbm(u*5,v*3,900,2)>.55}),MAT.rust,G);
 for(let k=0;k<6;k++){const th=k/6*TAU;const r=20;const x=r*Math.cos(th),z=r*Math.sin(th);const lit=d>0?rng()<.2:true;
  kput('strip',[x,14.6,z],qEuler(0,-th,0),[9,1,1],lit?CYAN:DEAD);
  kput(d>0?'boxR':'boxW',[x,1.6,z],qEuler(0,-th,0),[1.2,2.6,3],null);kput('boxD',[x,2.5,z],qEuler(0,-th,0),[1.3,.8,1.6],null);
  kput('tube',[x,1.6,z+1.8],qEuler(.6,0,0),[.15,3,.15],null);}
 // three storage lobes behind, pipes to the mast
 for(let i=0;i<3;i++){const x=-42+i*16,z=-44;const R=7;const gone=d>0&&i===1;
  if(!gone)mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:28,nv:12,hole:holeFn(d*.7,910+i,null,2)}),skin,G,x,1,z);
  else{const fm=mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:28,nv:12,hole:holeFn(1,911,null,1.5)}),MAT.rust,G,x+3,1,z+4);fm.rotation.set(.5,0,.9);dropFragment(fm,0,1.2);}
  for(let k=0;k<3;k++){const th=k/3*TAU;kput(d>0?'colR':'colW',[x+4*Math.cos(th),0,z+4*Math.sin(th)],null,[.9,1.5,.9],null);}
  kput(d>0?'pipeR':'pipe',[x,1.2,z+22],qEuler(Math.PI/2,0,0),[.5,44,.5],null);}
 kput(d>0?'pipeR':'pipe',[-26,1.2,-44],qEuler(0,0,Math.PI/2),[.6,34,.6],null);
 // kiosk
 mesh(lathe({rFn:y=>5*Math.pow(clamp(1-Math.pow(y/7,2),0,1),.5),H:7,flutes:8,amp:.1,nu:32,nv:8,hole:holeFn(d*.6,920,null,2.5)}),skin,G,34,0,-20);
 kput('archOpen',[29.5,2,-20],qFacing([-1,0,0]),[.3,.35,1],null);stripRing(34,4,-20,3.5,d,10);
 if(d>0){scatterMoss(0,.6,0,0,50,50,1.6);rubbleRing(-42,0,-44,4,20,20,1.5);trees(0,0,60,100,8);}
 figures(0,30,3,4);KOFF=[0,0,0];return G;}

