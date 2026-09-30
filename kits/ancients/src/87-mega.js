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
 // THE RUIN'S BROKEN CROWN. The ruin used to be the intact mass with more holes
 // and fewer fins, which from the row shot is the same silhouette. Now the
 // west third of the crown has come down: the top line falls away from u=.42
 // to 58% of H at the west face, jagged, and the floors show in the break.
 // `uw` runs west (0) to east (1) on the long faces; the west face is uw=0.
 const crownDrop=uw=>.42*H*Math.pow(clamp((.42-uw)/.42,0,1),.8);
 const crownTop=(uw,j)=>{const dr=crownDrop(uw);return H-dr+Math.min(1,dr/10)*18*(fbm(uw*9+j,1.7,1260,2)-.5);};
 const mcut=(u,v,side)=>d>0&&side!==2&&v*H>crownTop(side===3?0:u,side===3?u*3:0);
 for(let side=0;side<4;side++){mesh(gridSurface((u,v)=>P(u,v,side),side<2?230:90,130,{uS:side<2?40:15,vS:36,hole:(u,v)=>cellHole(u,v,side)||mcut(u,v,side)}),skin,G);
  mesh(gridSurface((u,v)=>{const p=P(u,v,side);const f=frame(v*H);return[f.ox+(p[0]-f.ox)*.94,p[1],p[2]*.94];},side<2?60:24,40,{hole:(u,v)=>mcut(u,v,side)}),MAT.dark,G);
  const n=side<2?46:17;for(let j=0;j<60;j++)for(let i=0;i<n;i++){if(!cellHole((i+.5)/n,(j+.5)/60,side))continue;if(rng()>.5)continue;const p=P((i+.5)/n,(j+.5)/60,side);const q=P((i+.5)/n,(j+.5)/60+.001,side);
   const lit=d>0?rng()<.02:rng()<.35;const nrm=side===0?[Math.sin(frame(p[1]).rot),0,Math.cos(frame(p[1]).rot)]:side===1?[-Math.sin(frame(p[1]).rot),0,-Math.cos(frame(p[1]).rot)]:side===2?[Math.cos(frame(p[1]).rot),0,-Math.sin(frame(p[1]).rot)]:[-Math.cos(frame(p[1]).rot),0,Math.sin(frame(p[1]).rot)];
   if(mcut((i+.5)/n,(j+.5)/60,side))continue;
   kput('cell',[p[0]-nrm[0]*2,p[1],p[2]-nrm[2]*2],qFacing(nrm),[3.5,2.6,1],lit?new THREE.Color(0x9fd8ff).multiplyScalar(rr(.3,.8)):DEAD);}}
 // top: a shallow sagging roof and a forest of stubby fins
 mesh(gridSurface((u,v)=>{const f=frame(H);const s=u*2-1,t=v*2-1;const c=Math.cos(f.rot),sn=Math.sin(f.rot);const lx=s*f.w/2,lz=t*f.dp/2;return[f.ox+lx*c-lz*sn,H-8*(1-s*s)*(1-t*t),lx*sn+lz*c];},40,14,{uS:30,vS:10,hole:(()=>{const hf=holeFn(d*.6,1230,null,2);return(u,v)=>(hf&&hf(u,v))||(d>0&&crownDrop(u)>1);})()}),skin,G);
 for(let k=0;k<26;k++){const f=frame(H);const s=rr(-.9,.9),t=rr(-.8,.8);const c=Math.cos(f.rot),sn=Math.sin(f.rot);const lx=s*f.w/2,lz=t*f.dp/2;const x=f.ox+lx*c-lz*sn,z=lx*sn+lz*c;const h=rr(10,40);
  if(d>0&&rng()<.4)continue;if(d>0&&crownDrop((s+1)/2)>0)continue;kput(d>0?'strutR':'strutW',[x,H-2+h/2,z],qEuler(0,-f.rot,rr(-.1,.1)),[rr(3,7),h,rr(1.5,3)],null);}
 // the eye: a great circular void punched through the mass, ringed
 const ey=H*.62,ex=lean*ey;const ER=34;
 kput('tube',[ex,ey,0],qEuler(Math.PI/2,0,0),[ER,Dp*1.02,ER],null);kput(d>0?'ringR':'ringW',[ex,ey,Dp/2+1],null,[ER+4,ER+4,20],null);kput(d>0?'ringR':'ringW',[ex,ey,-Dp/2-1],null,[ER+4,ER+4,20],null);
 // the outrigger: a second, smaller block hung off the east face on three colossal struts, joined by a bridge
 // In the ruin the outrigger has torn off its struts and lies toppled east of
 // the mass (placed with dropFragment once its meshes exist).
 const O=new THREE.Group();O.position.set(W/2*.85+90,120,20);O.rotation.set(.08,.5,-.15);if(d>0){O.position.set(W/2*.85+175,0,40);O.rotation.set(.2,.55,-1.0);}G.add(O);useGroupXF(O);
 const OH=110,OW=90,OD=60;for(let side=0;side<4;side++)mesh(gridSurface((u,v)=>{const s=u*2-1,y=v*OH;const bul=1+.05*Math.sin(v*6);let x,z;if(side===0){x=s*OW/2;z=OD/2;}else if(side===1){x=s*OW/2;z=-OD/2;}else if(side===2){x=OW/2;z=s*OD/2;}else{x=-OW/2;z=s*OD/2;}return[x*bul,y-OH/2,z*bul];},side<2?70:40,60,{uS:20,vS:15,hole:(u,v)=>{const cx=u*(side<2?18:10),cy=v*22;return (Math.abs((cx%1)-.5)<.28&&Math.abs((cy%1)-.5)<.28&&fbm(u*4,v*4,1240+side,2)>.4)||(d>0&&fbm(u*3,v*3,1250,2)<.2);}}),skin,O);
 mesh(new THREE.BoxGeometry(OW*.92,OH*.98,OD*.92),MAT.dark,O);
 // fallen, its two ends are on show: skin them, torn, so the end does not read
 // as the flat face of the dark core box
 if(d>0)for(const e of [-1,1])mesh(gridSurface((u,v)=>[(u-.5)*OW*1.02,e*OH/2,(v-.5)*OD*1.02],30,20,{uS:20,vS:13,hole:(u,v)=>fbm(u*5,v*4,1280+e,2)<.42}),skin,O);
 endGroupXF();if(d>0)dropFragment(O,0,16);
 // struts and bridge: whole when intact; in the ruin, snapped stubs a third of
 // their length and the broken spans lying on the ground below them
 const snap=(a,b,f)=>[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];
 for(let k=0;k<3;k++){const zz=-30+k*30;if(d>0&&k===1)continue;const A=[W/2*.8+8,40+k*10,zz],B=[W/2*.85+70,110+k*8,20+zz*.6];
  if(d===0)beam('strutW',A,B,9,7);
  else{beam('strutR',A,snap(A,B,.34),9,7);beam('strutR',[A[0]+48,3,zz*1.3+6],[A[0]+118,4,zz*1.6+18],9,7);}}
 if(d===0){beam('strutW',[W/2*.82+lean*180,182,0],[W/2*.85+62,175,15],6,8);beam('tube',[W/2*.82+lean*180,186,0],[W/2*.85+62,179,15],5,5);}
 else{beam('strutR',[W/2*.82+lean*180,182,0],snap([W/2*.82+lean*180,182,0],[W/2*.85+62,175,15],.3),6,8);beam('strutR',[W/2*.82+lean*180+40,3,-24],[W/2*.82+lean*180+96,2.5,-10],6,8);}
 // roots: buttress ribs sinking into a mound
 mesh(lathe({rFn:y=>220*Math.pow(clamp(1-y/26,0,1),.6)+40,H:26,nu:48,nv:6}),MAT.mud,G,W*.1,0,0);
 for(let k=0;k<18;k++){const a=k/18*TAU;const f=frame(0);const r0=Math.abs(Math.cos(a))*f.w/2+Math.abs(Math.sin(a))*f.dp/2;beam(d>0?'strutR':'strutW',[Math.cos(a)*(r0+70),0,Math.sin(a)*(r0+70)],[Math.cos(a)*r0*.98,55,Math.sin(a)*r0*.98],rr(4,9),rr(3,6));}
 for(let yy=40;yy<H-20;yy+=44)stripRing(lean*yy,yy,0,1,d,1);
 if(d>0){rubbleRing(0,0,0,150,320,200,4);scatterMoss(0,0,0,160,380,220,3.5);trees(0,0,240,420,30);vinesOnRing(lean*H+50,H-2,0,40,40,60);}
 figures(0,240,6,8);
 // the fall of the crown: floors exposed in the break (pale plate over a dark
 // soffit, so the section reads), and a talus down the west flank banked on the
 // root mound rather than buried in it
 if(d>0){const moundY=(x,z)=>{const r=Math.hypot(x-W*.1,z);return r>=260?0:r<=40?26:26*(1-Math.pow((r-40)/220,1/.6));};
  for(let y=Math.ceil((H-.42*H)/14)*14;y<H-6;y+=14){const f=frame(y);const c=Math.cos(f.rot),sn=Math.sin(f.rot);
   let ue=0;while(ue<.42&&crownTop(ue,0)<y+5)ue+=.01;const x0=-f.w/2*.93,x1=(ue*2-1)*f.w/2+10,lxc=(x0+x1)/2,L=x1-x0;if(L<8)continue;
   // in broken lengths, not one clean shelf: each piece a little off level and
   // the outermost one sagging where it lost its support
   const np=3+(Math.floor(y)%3);let xa=x0;for(let k=0;k<np;k++){const xb=k===np-1?x1:xa+L/np*(.8+.4*fbm(k,y*.1,1270,2));
    const cx=(xa+xb)/2,ln=xb-xa-1.2,sag=k===np-1?-.12:(fbm(k*1.7,y*.2,1271,2)-.5)*.06,dy=k===np-1?-ln*.06:0;
    const px=f.ox+cx*c,pz=cx*sn;
    kput('boxC',[px,y+dy,pz],qEuler(0,-f.rot,sag),[ln,1.1,f.dp*(.8+.1*fbm(k,y,1272,2))],null);
    kput('boxD',[px,y+dy-1.6,pz],qEuler(0,-f.rot,sag),[ln,.4,f.dp*.78],null);xa=xb;}}
  for(let i=0;i<180;i++){const q=Math.pow(rng(),1.8);const x=-W/2-5-q*120+rr(-10,10),z=rr(-1,1)*(Dp*.7+q*60);const s=rr(2,9)*(1.2-.6*q);
   kput('rubble',[x,moundY(x,z)+s*.3,z],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.3,.5)));}}
 // WARTS ("the Unnamed wants irregular Beksinski warts", from the brief). Blistered
 // growths fused onto the faces in clusters of one to four lobes, flattened
 // against the wall and bunched toward the foot the way a growth creeps up from
 // the roots. Each lobe is a displaced sphere built as a gridSurface so its
 // normals are smooth; all of them merge into one mesh. Drawn AFTER figures()
 // so the PRNG stream feeding everything above is unchanged.
 {const ey2=H*.62,ex2=lean*ey2,wg=[];
  for(let k=0;k<38;k++){const side=k%4;const u=rr(.06,.94),v=.03+.86*Math.pow(rng(),1.35);
   const y=v*H,f=frame(y);const c=Math.cos(f.rot),sn=Math.sin(f.rot);
   const n=side===0?[-sn,0,c]:side===1?[sn,0,-c]:side===2?[c,0,sn]:[-c,0,-sn];
   const tg=[-n[2],0,n[0]];const p=P(u,v,side);
   if(side<2&&Math.hypot(p[0]-ex2,y-ey2)<ER+14)continue;          // keep the eye clear
   if(side===2&&y>30&&y<200&&Math.abs(u-.5)<.45)continue;           // the outrigger's struts land here
   const base=rr(7,17),nb=1+Math.floor(rng()*4),sd=1300+k;
   for(let b=0;b<nb;b++){const s=base*(b?rr(.4,.75):1),sy=s*rr(.8,1.7),sz=s*rr(.45,.7);
    const ot=b?rr(-1,1)*base*.9:0,oy=b?rr(-1,1)*base*.8:0;
    const cx=p[0]+tg[0]*ot+n[0]*sz*.25,cy=y+oy,cz=p[2]+tg[2]*ot+n[2]*sz*.25;
    wg.push(gridSurface((uu,vv)=>{const th=uu*TAU,ph=vv*Math.PI;const dx=Math.sin(ph)*Math.cos(th),dy=Math.cos(ph),dz=Math.sin(ph)*Math.sin(th);
     const r=1+.62*(fbm(dx*2.3+sd,dy*2.3+b,dz*2.3,3)-.5)+.16*Math.sin(th*3+b)*Math.sin(ph)*Math.sin(ph*2+sd);
     const lx=dx*s*r,ly=dy*sy*r,lz=dz*sz*r;
     return[cx+tg[0]*lx+n[0]*lz,Math.max(cy+ly,0),cz+tg[2]*lx+n[2]*lz];},18,12,{uS:3,vS:2}));}}
  meshMerged(wg,skin,G);}
 KOFF=[0,0,0];return G;}

