// ================================================================= HOSPITAL — "the Cloister" (Prentice quatrefoil over a podium)
function buildHospital(scene,gx,gz,d){reseed(9240+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Hospital — the Cloister ('+STATE(d)+')',x:0,z:0,r:120,h:90});
 // podium: 3 storeys, glass ribbons between concrete slabs
 const PW=170,PD=110,SH=5;for(let f=0;f<=3;f++){kput(BOXC(d),[0,f*SH,0],null,[PW,.8,PD],null);if(f<3){if(d===0){kput('pane',[0,f*SH+2.8,PD/2],null,[PW-2,3.6,1],null);kput('pane',[0,f*SH+2.8,-PD/2],null,[PW-2,3.6,1],null);kput('pane',[PW/2,f*SH+2.8,0],qEuler(0,Math.PI/2,0),[PD-2,3.6,1],null);kput('pane',[-PW/2,f*SH+2.8,0],qEuler(0,Math.PI/2,0),[PD-2,3.6,1],null);}
  // WARDS (round 2): the dark core is pulled back 7.5 m from the ribbon, and the
  // band in front of it is cut into bays at the facade posts, a bed in each,
  // so the ribbon (glass or empty frame) shows rooms instead of a grey box face
  // 1.5 m behind it. Hash-placed: no rng draw moves.
  kput('boxD',[0,f*SH+2.8,0],null,[PW-15,3.6,PD-15],null);
  if(f<3){for(let x=-PW/2+5;x<PW/2;x+=10)for(const s of [-1,1]){const hh=h3(x,f,1911+s);kput(BOXC(d),[x,f*SH+2.8,s*(PD/2-4)],null,[.25,4.2,7],null);
    if(x+5<PW/2){const tip=d>0&&hh>.72;kput(d>0?'boxR':'boxW',[x+5+(hh-.5)*3,f*SH+.4+(tip?.55:.45),s*(PD/2-6.2)],tip?qEuler(.2,hh*4,1.3):null,[2.2,tip?1:.6,1.1],null);
     if(hh<.4)kput('boxD',[x+1,f*SH+1.4,s*(PD/2-6.9)],null,[1.2,2,.6],null);}}
   for(let z=-PD/2+10;z<PD/2-5;z+=10)for(const sx of [-1,1])kput(BOXC(d),[sx*(PW/2-4),f*SH+2.8,z],null,[7,4.2,.25],null);}
  // ruin: the ribbon glazing is gone but for teeth of it left in the frames
  if(d>0)for(let x=-PW/2+10;x<PW/2;x+=10)for(const sd of [-1,1]){const hh=h3(x,f,1905+sd);if(hh<.5)civShardAt([x,f*SH+2.8,sd*PD/2],qFacing([0,0,sd]),8.6,3.6,.1,hh*2);}for(let x=-PW/2+5;x<PW/2;x+=10)for(const s of [-1,1])kput(BOXC(d),[x,f*SH+2.8,s*PD/2],null,[.8,4,.8],null);
  for(let k=0;k<8;k++){const lit=d>0?rng()<.15:true;kput('strip',[-70+k*20,f*SH+4.4,PD/2-1],null,[12,1,1],lit?CYAN:DEAD);}}}
 kput('archOpen',[0,2.2,PD/2],qFacing([0,0,1]),[1.2,.9,2],null);kput(BOXC(d),[0,5.5,PD/2+12],null,[30,.8,20],null);for(const s of [-1,1])kput(BOXC(d),[s*13,2.7,PD/2+20],null,[1,5.5,1],null);
 // bed tower: four lobes cantilevered from a square core, oval windows in rows
 const CY=3*SH,TH=42;kput(BOXC(d),[0,CY+TH/2-4,0],null,[22,TH-8,22],null);kput(BOXC(d),[0,CY+TH/2+4,0],null,[24,TH+8,8],null);kput(BOXC(d),[0,CY+TH/2+4,0],null,[8,TH+8,24],null);
 const LR=26;for(let l=0;l<4;l++){const a=l*Math.PI/2+Math.PI/4;const cx=Math.cos(a)*24,cz=Math.sin(a)*24;const gone=d>0&&l===0;const hole=holeFn(d*.8,1900+l,null,2);
  // RUIN: the lobe facing the row camera has fallen to a ragged stump (it was
  // the one at the back, where no preset saw it, and its rubble lay buried
  // inside the podium); the back-right lobe is torn off at two thirds.
  const lcut=d>0&&l===3?TH*.62:null;
  if(gone){// what stays is the torn inner shell, still keyed to the core
   mesh(lathe({rFn:y=>LR*(1-.35*Math.pow(clamp(1-y/8,0,1),2)),H:TH,cut:TH*.8,jag:5,nu:48,nv:20,seed:1907,hole:(u,y)=>civDA(u*TAU,a+Math.PI)>.75+.6*(fbm(u*9,y*.09,1906,2)-.5)-.25*y/TH}),CONC(d),G,cx,CY+8,cz);
   rubbleRing(cx,CY+.4,cz,LR*.7,LR*1.7,70,3.2);for(let k=0;k<6;k++){const q=h3(k,1,1908);kput('boxCR',[cx+Math.cos(a+q*2-1)*(LR+8+q*10),CY+1.5,cz+Math.sin(a+q*2-1)*(LR+8+q*10)],qEuler(q-.5,q*6,.4-q*.8),[8+q*6,1,5+q*5],null);}continue;}
  mesh(lathe({rFn:y=>LR*(1-.35*Math.pow(clamp(1-y/8,0,1),2))*(1-.03*Math.pow(clamp((y-TH+6)/6,0,1),2)),H:TH,cut:lcut,jag:lcut?3:0,seed:1909,nu:48,nv:20,hole}),CONC(d),G,cx,CY+8,cz);
  if(d>0){mesh(lathe({rFn:()=>LR*.62,H:lcut?lcut-4:TH-2,nu:24,nv:2}),MAT.dark,G,cx,CY+9,cz);   // wards behind the holes
   civRooms({cx,cy:CY+8,cz,rFn:y=>LR*(1-.35*Math.pow(clamp(1-y/8,0,1),2)),y0:9.2,y1:TH-2,step:6.5,d,seed:1910+l,rIn:.62,dens:9,cut:lcut});}
  else mesh(lathe({rFn:()=>LR*.9,H:TH-2,nu:24,nv:2}),MAT.dark,G,cx,CY+9,cz);if(!lcut)kput('slab',[cx,CY+8+TH,cz],null,[LR*.98,.8,LR*.98],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  for(let r=0;r<5;r++)for(let k=0;k<14;k++){const th=a-Math.PI*.55+k/13*Math.PI*1.1;const u=((th%TAU)+TAU)%TAU/TAU;const yy=12+r*6.5;if(hole&&hole(u,yy))continue;if(lcut&&yy>lcut-4)continue;civWin(d>0?'ovalD':'ovalI',[cx+LR*1.0*Math.cos(th),CY+8+yy,cz+LR*1.0*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.5,1.9,1],null);}
  const top=lcut?lcut-3:TH;if(!lcut)stripRing(cx,CY+8+TH-2,cz,LR*.85,d,24);if(d>0){vinesOnRing(cx,CY+8+top,cz,LR,12,16);if(!lcut)mossOnRing(cx,CY+8+TH+.4,cz,LR*.7,8,2);else rubbleRing(cx*1.9,CY+.4,cz*1.9,2,14,24,2.4);}}
 // helipad + plant on the core
 const RF=CY+8+TH;kput(SLABC(d),[0,RF+.9,0],null,[16,1,16],null);kput('boxD',[0,RF+1.45,0],null,[6,.12,1],null);kput('boxD',[0,RF+1.45,0],null,[1,.12,6],null);for(let k=0;k<12;k++){const a=k/12*TAU;const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*14,RF+1.5,Math.sin(a)*14],qEuler(0,-a,0),[3,1,1],lit?new THREE.Color(0xffb060):DEAD);}
 for(let k=0;k<3;k++)kput(d>0?'pipeR':'pipe',[-16-k*2.5,RF+3,19],null,[.8,6,.8],null);
 // ambulance apron
 kput(SLABC(d),[0,.3,0],null,[130,.6,130],null);for(let k=0;k<5;k++)kput('boxD',[-40+k*20,.7,PD/2+42],null,[6,.1,12],null);
 if(d>0){scatterMoss(0,3*SH+.4,0,0,80,60,2.5);rubbleRing(0,.6,0,60,120,50,2.5);trees(0,0,100,150,10);}
 figures(0,90,5,10);civFlatten(G);KOFF=[0,0,0];return G;}

