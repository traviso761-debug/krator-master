// ================================================================= MEGASTRUCTURE — "the Unnamed" (cyclopean, unclear purpose)
function buildMega(scene,gx,gz,d){reseed(9995+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Megastructure — the Unnamed ('+STATE(d)+')',x:0,z:0,r:320,h:300});
 // the mass: a leaning, slightly twisted slab-prism, 260 m tall, 300 × 110 in plan, skinned in a dense mosaic of cells
 const H=260,W=300,Dp=110;const lean=.12,twist=.25;
 const frame=y=>{const t=y/H;return{ox:lean*y,rot:twist*t*t,w:W*(1-.18*t)+40*Math.sin(Math.PI*t),dp:Dp*(1-.1*t)};};
 const P=(u,v,side)=>{const y=v*H;const f=frame(y);const s=u*2-1;const c=Math.cos(f.rot),sn=Math.sin(f.rot);let lx,lz;
  if(side===0){lx=s*f.w/2;lz=f.dp/2;}else if(side===1){lx=s*f.w/2;lz=-f.dp/2;}else if(side===2){lx=f.w/2;lz=s*f.dp/2;}else{lx=-f.w/2;lz=s*f.dp/2;}
  const bulge=1+.06*Math.sin(v*Math.PI*2.5+side);lx*=bulge;lz*=bulge;return[f.ox+lx*c-lz*sn,y,lx*sn+lz*c];};
 const cellHole=(u,v,side)=>{const cx=u*(side<2?46:17),cy=v*60;const fx=(cx%1)-.5,fy=(cy%1)-.5;const big=fbm(u*5+side,v*7,1200+side,2);const open=Math.abs(fx)<.3&&Math.abs(fy)<.28&&big>.38;
  return open||(d>0&&fbm(u*3+side*.7,v*5,1210+side,3)<.22);};
 for(let side=0;side<4;side++){mesh(gridSurface((u,v)=>P(u,v,side),side<2?230:90,130,{uS:side<2?40:15,vS:36,hole:(u,v)=>cellHole(u,v,side)}),skin,G);
  mesh(gridSurface((u,v)=>{const p=P(u,v,side);const f=frame(v*H);return[f.ox+(p[0]-f.ox)*.94,p[1],p[2]*.94];},side<2?60:24,40,{}),MAT.dark,G);
  const n=side<2?46:17;for(let j=0;j<60;j++)for(let i=0;i<n;i++){if(!cellHole((i+.5)/n,(j+.5)/60,side))continue;if(rng()>.5)continue;const p=P((i+.5)/n,(j+.5)/60,side);const q=P((i+.5)/n,(j+.5)/60+.001,side);
   const lit=d>0?rng()<.02:rng()<.35;const nrm=side===0?[Math.sin(frame(p[1]).rot),0,Math.cos(frame(p[1]).rot)]:side===1?[-Math.sin(frame(p[1]).rot),0,-Math.cos(frame(p[1]).rot)]:side===2?[Math.cos(frame(p[1]).rot),0,-Math.sin(frame(p[1]).rot)]:[-Math.cos(frame(p[1]).rot),0,Math.sin(frame(p[1]).rot)];
   kput('cell',[p[0]-nrm[0]*2,p[1],p[2]-nrm[2]*2],qFacing(nrm),[3.5,2.6,1],lit?new THREE.Color(0x9fd8ff).multiplyScalar(rr(.3,.8)):DEAD);}}
 // top: a shallow sagging roof and a forest of stubby fins
 mesh(gridSurface((u,v)=>{const f=frame(H);const s=u*2-1,t=v*2-1;const c=Math.cos(f.rot),sn=Math.sin(f.rot);const lx=s*f.w/2,lz=t*f.dp/2;return[f.ox+lx*c-lz*sn,H-8*(1-s*s)*(1-t*t),lx*sn+lz*c];},40,14,{uS:30,vS:10,hole:holeFn(d*.6,1230,null,2)}),skin,G);
 for(let k=0;k<26;k++){const f=frame(H);const s=rr(-.9,.9),t=rr(-.8,.8);const c=Math.cos(f.rot),sn=Math.sin(f.rot);const lx=s*f.w/2,lz=t*f.dp/2;const x=f.ox+lx*c-lz*sn,z=lx*sn+lz*c;const h=rr(10,40);
  if(d>0&&rng()<.4)continue;kput(d>0?'strutR':'strutW',[x,H-2+h/2,z],qEuler(0,-f.rot,rr(-.1,.1)),[rr(3,7),h,rr(1.5,3)],null);}
 // the eye: a great circular void punched through the mass, ringed
 const ey=H*.62,ex=lean*ey;const ER=34;
 kput('tube',[ex,ey,0],qEuler(Math.PI/2,0,0),[ER,Dp*1.02,ER],null);kput(d>0?'ringR':'ringW',[ex,ey,Dp/2+1],null,[ER+4,ER+4,20],null);kput(d>0?'ringR':'ringW',[ex,ey,-Dp/2-1],null,[ER+4,ER+4,20],null);
 // the outrigger: a second, smaller block hung off the east face on three colossal struts, joined by a bridge
 const O=new THREE.Group();O.position.set(W/2*.85+90,120,20);O.rotation.set(.08,.5,-.15);G.add(O);useGroupXF(O);
 const OH=110,OW=90,OD=60;for(let side=0;side<4;side++)mesh(gridSurface((u,v)=>{const s=u*2-1,y=v*OH;const bul=1+.05*Math.sin(v*6);let x,z;if(side===0){x=s*OW/2;z=OD/2;}else if(side===1){x=s*OW/2;z=-OD/2;}else if(side===2){x=OW/2;z=s*OD/2;}else{x=-OW/2;z=s*OD/2;}return[x*bul,y-OH/2,z*bul];},side<2?70:40,60,{uS:20,vS:15,hole:(u,v)=>{const cx=u*(side<2?18:10),cy=v*22;return (Math.abs((cx%1)-.5)<.28&&Math.abs((cy%1)-.5)<.28&&fbm(u*4,v*4,1240+side,2)>.4)||(d>0&&fbm(u*3,v*3,1250,2)<.2);}}),skin,O);
 mesh(new THREE.BoxGeometry(OW*.92,OH*.98,OD*.92),MAT.dark,O);endGroupXF();
 for(let k=0;k<3;k++){const zz=-30+k*30;if(d>0&&k===1)continue;beam(d>0?'strutR':'strutW',[W/2*.8+8,40+k*10,zz],[W/2*.85+70,110+k*8,20+zz*.6],9,7);}
 beam(d>0?'strutR':'strutW',[W/2*.82+lean*180,182,0],[W/2*.85+62,175,15],6,8);beam('tube',[W/2*.82+lean*180,186,0],[W/2*.85+62,179,15],5,5);
 // roots: buttress ribs sinking into a mound
 mesh(lathe({rFn:y=>220*Math.pow(clamp(1-y/26,0,1),.6)+40,H:26,nu:48,nv:6}),MAT.mud,G,W*.1,0,0);
 for(let k=0;k<18;k++){const a=k/18*TAU;const f=frame(0);const r0=Math.abs(Math.cos(a))*f.w/2+Math.abs(Math.sin(a))*f.dp/2;beam(d>0?'strutR':'strutW',[Math.cos(a)*(r0+70),0,Math.sin(a)*(r0+70)],[Math.cos(a)*r0*.98,55,Math.sin(a)*r0*.98],rr(4,9),rr(3,6));}
 for(let yy=40;yy<H-20;yy+=44)stripRing(lean*yy,yy,0,1,d,1);
 if(d>0){rubbleRing(0,0,0,150,320,200,4);scatterMoss(0,0,0,160,380,220,3.5);trees(0,0,240,420,30);vinesOnRing(lean*H,H-2,0,60,40,60);}
 figures(0,240,6,8);KOFF=[0,0,0];return G;}

