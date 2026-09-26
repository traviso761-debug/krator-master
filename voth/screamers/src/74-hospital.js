// ================================================================= HOSPITAL — "the Cloister" (Prentice quatrefoil over a podium)
function buildHospital(scene,gx,gz,d){reseed(9240+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Hospital — the Cloister ('+STATE(d)+')',x:0,z:0,r:120,h:90});
 // podium: 3 storeys, glass ribbons between concrete slabs
 const PW=170,PD=110,SH=5;for(let f=0;f<=3;f++){kput(BOXC(d),[0,f*SH,0],null,[PW,.8,PD],null);if(f<3){if(d===0){kput('pane',[0,f*SH+2.8,PD/2],null,[PW-2,3.6,1],null);kput('pane',[0,f*SH+2.8,-PD/2],null,[PW-2,3.6,1],null);kput('pane',[PW/2,f*SH+2.8,0],qEuler(0,Math.PI/2,0),[PD-2,3.6,1],null);kput('pane',[-PW/2,f*SH+2.8,0],qEuler(0,Math.PI/2,0),[PD-2,3.6,1],null);}
  kput('boxD',[0,f*SH+2.8,0],null,[PW-3,3.6,PD-3],null);for(let x=-PW/2+5;x<PW/2;x+=10)for(const s of [-1,1])kput(BOXC(d),[x,f*SH+2.8,s*PD/2],null,[.8,4,.8],null);
  for(let k=0;k<8;k++){const lit=d>0?rng()<.15:true;kput('strip',[-70+k*20,f*SH+4.4,PD/2-1],null,[12,1,1],lit?CYAN:DEAD);}}}
 kput('archOpen',[0,2.2,PD/2],qFacing([0,0,1]),[1.2,.9,2],null);kput(BOXC(d),[0,5.5,PD/2+12],null,[30,.8,20],null);for(const s of [-1,1])kput(BOXC(d),[s*13,2.7,PD/2+20],null,[1,5.5,1],null);
 // bed tower: four lobes cantilevered from a square core, oval windows in rows
 const CY=3*SH,TH=42;kput(BOXC(d),[0,CY+TH/2-4,0],null,[22,TH-8,22],null);kput(BOXC(d),[0,CY+TH/2+4,0],null,[24,TH+8,8],null);kput(BOXC(d),[0,CY+TH/2+4,0],null,[8,TH+8,24],null);
 const LR=26;for(let l=0;l<4;l++){const a=l*Math.PI/2+Math.PI/4;const cx=Math.cos(a)*24,cz=Math.sin(a)*24;const gone=d>0&&l===2;const hole=holeFn(d*.8,1900+l,null,2);
  if(gone){rubbleRing(cx*2.5,0,cz*2.5,10,40,50,3);continue;}
  mesh(lathe({rFn:y=>LR*(1-.35*Math.pow(clamp(1-y/8,0,1),2))*(1-.03*Math.pow(clamp((y-TH+6)/6,0,1),2)),H:TH,nu:48,nv:20,hole}),CONC(d),G,cx,CY+8,cz);
  mesh(lathe({rFn:()=>LR*.9,H:TH-2,nu:24,nv:2}),MAT.dark,G,cx,CY+9,cz);kput('slab',[cx,CY+8+TH,cz],null,[LR*.98,.8,LR*.98],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  for(let r=0;r<5;r++)for(let k=0;k<14;k++){const th=a-Math.PI*.55+k/13*Math.PI*1.1;const u=((th%TAU)+TAU)%TAU/TAU;const yy=12+r*6.5;if(hole&&hole(u,yy))continue;kput(d>0?'ovalD':'ovalI',[cx+LR*1.0*Math.cos(th),CY+8+yy,cz+LR*1.0*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.5,1.9,1],null);}
  if(r=>0)stripRing(cx,CY+8+TH-2,cz,LR*.85,d,24);if(d>0){vinesOnRing(cx,CY+8+TH,cz,LR,12,16);mossOnRing(cx,CY+8+TH+.4,cz,LR*.7,8,2);}}
 // helipad + plant on the core
 kput(SLABC(d),[0,CY+TH+5,0],null,[16,1,16],null);kput('boxD',[0,CY+TH+5.6,0],null,[1,.2,1],null);for(let k=0;k<12;k++){const a=k/12*TAU;const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*14,CY+TH+5.8,Math.sin(a)*14],qEuler(0,-a,0),[3,1,1],lit?new THREE.Color(0xffb060):DEAD);}
 for(let k=0;k<3;k++)kput(d>0?'pipeR':'pipe',[-6+k*6,CY+TH+8,0],null,[.8,6,.8],null);
 // ambulance apron
 kput(SLABC(d),[0,.3,0],null,[130,.6,130],null);for(let k=0;k<5;k++)kput('boxD',[-40+k*20,.7,PD/2+42],null,[6,.1,12],null);
 if(d>0){scatterMoss(0,3*SH+.4,0,0,80,60,2.5);rubbleRing(0,.6,0,60,120,50,2.5);trees(0,0,100,150,10);}
 figures(0,90,5,10);KOFF=[0,0,0];return G;}

