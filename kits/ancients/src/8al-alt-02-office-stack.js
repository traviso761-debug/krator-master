// ================================================================= OFFICE ALT 2 — "the Stacked Piers"
// A glass office shaft held between four piers of stacked stone blocks. Each
// pier is its own pile of offset blocks, no two the same height, with one deep
// window punched in each block and here and there a block left out, where a
// garden grows on the block below. The piers end at four different heights,
// so the head of the tower is a ragged crown of blocks. On a planted podium
// with a pier arcade. After arco1 #41 (the tower of stacked blocks round a
// glazed core) and #47 (the cantilevered block piers).
// Ruin: the south-east pier fell from half height and its blocks lie across
// the podium and the plain; the glass is gone and the shaft shows its floors.
function buildAltOfficeStack(scene,gx,gz,d){reseed(9906);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),acc=[],fallen=[];
 REGISTER({name:'Office alt 2 — the Stacked Piers ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:56,h:136});
 const PH=10,CR=11;
 // podium and its arcade
 altBox(acc,0,PH-1,0,76,2,76);
 for(let k=-4;k<=4;k++)for(const[sx,sz]of[[1,0],[-1,0],[0,1],[0,-1]]){const t=k*8.5;
  const x=sx?sx*37:t,z=sz?sz*37:t;kput(BOXC(d),[x,(PH-2)/2,z],null,[2.2,PH-2,2.2],null);}
 kput('boxD',[0,(PH-2)/2,0],null,[66,PH-2,66],null);
 altBand(0,(PH-2)/2,33.2,60,PH-4,[0,0,1],d,true);altBand(-33.2,(PH-2)/2,0,60,PH-4,[-1,0,0],d,false);
 // the four piers
 const piers=[[-14,-14],[14,-14],[-14,14],[14,14]],tops=[];let maxTop=0;
 piers.forEach((P,pi)=>{let y=PH;const top=rr(104,128);const out=[Math.sign(P[0]),Math.sign(P[1])];let bi=0;
  while(y<top){const h=Math.min(top-y,rr(9,17)),sx=rr(11,15),sz=rr(11,15),ox=P[0]+out[0]*rr(-1,3),oz=P[1]+out[1]*rr(-1,3);
   const gap=bi>1&&rng()<.18&&y+h<top-10;const gone=fall&&pi===3&&y>50;
   if(gap){// a block left out: a garden on the block below
    if(!gone)for(let k=0;k<3;k++)VEG.tree(ox+rr(-4,4),y,oz+rr(-4,4),k,rr(4,7)*(dd?1.4:1));
    y+=rr(5,8);bi++;continue;}
   if(gone){// it fell: the same block, lying on its side south-east of the tower
    const a=rr(-.6,.9),r=rr(36,80),fx=14+Math.cos(.8+a)*r,fz=14+Math.sin(.8+a)*r,ry=rng()*3,lie=rng()<.5;
    altBox(fallen,fx,(lie?sx:h)/2-.3,fz,lie?h:sx,lie?sx:h,sz,ry,rr(-.12,.12),rr(-.12,.12));
    y+=h;bi++;continue;}
   altBox(acc,ox,y+h/2,oz,sx,h,sz);
   // one deep window in each outer face of the block
   for(const[nx,nz]of[[out[0],0],[0,out[1]]]){const fx=ox+nx*(sx/2+.05),fz=oz+nz*(sz/2+.05),w=(nx?sz:sx)*rr(.35,.6),wh=h*rr(.35,.55);
    const q=qFacing([nx,0,nz]);
    if(d===0){kput('darkPane',[fx,y+h*.5,fz],q,[w,wh,1],null);if(altH(fx,y,fz)<.45)kput('cell',[fx+nx*.2,y+h*.5,fz+nz*.2],q,[w*.8,wh*.8,1],altH(fz,y,fx)<.5?WARM:CYAN);}
    else{kput('boxD',[fx-nx*.3,y+h*.5,fz-nz*.3],q,[w,wh,1],null);civWin('paneD',[fx,y+h*.5,fz],q,[w,wh,1],.3);}}
   y+=h;bi++;}
  tops.push(y);if(!(fall&&pi===3))maxTop=Math.max(maxTop,y);});
 // the glazed shaft between the piers, with a floor band every 4.2 m
 const SH=maxTop-12;
 if(d===0){for(const[nx,nz]of[[1,0],[-1,0],[0,1],[0,-1]])kput('darkPane',[nx*CR,PH+(SH-PH)/2,nz*CR],qFacing([nx,0,nz]),[2*CR-6,SH-PH,1],null);
  for(let y=PH+4.2;y<SH;y+=4.2)altBox(acc,0,y,0,2*CR+.6,.5,2*CR+.6);
  for(let y=PH+2;y<SH;y+=8.4)for(const[nx,nz]of[[1,0],[0,1]])if(altH(y,nx,nz)<.6)kput('cell',[nx*(CR+.4),y,nz*(CR+.4)],qFacing([nx,0,nz]),[CR*1.2,2.4,1],y%3<1.5?WARM:CYAN);}
 else{kput('boxD',[0,PH+(SH-PH)/2,0],null,[2*CR-3,SH-PH,2*CR-3],null);
  for(let y=PH+4.2;y<SH;y+=4.2){altBox(acc,0,y,0,2*CR,.5,2*CR);
   for(const[nx,nz]of[[1,0],[-1,0],[0,1],[0,-1]])for(let k=-2;k<=2;k++)if(altH(y,k,nx+2*nz)<.55)
    kput('mullR',[nx*CR+(nz?k*4:0),y+2.1,nz*CR+(nx?k*4:0)],null,[.5,4.2,.5],null);}
  for(let y=PH+2;y<SH;y+=4.2)for(const[nx,nz]of[[1,0],[0,1],[-1,0]])altRoomsBox(nx,nz,y,d);}
 altBox(acc,0,SH+.5,0,2*CR+2,1,2*CR+2);
 if(fall){// the snapped pier's stump: a jagged lip of broken blocks
  for(let k=0;k<6;k++)kput(BOXC(d),[14+rr(-5,5),50+rr(0,4),14+rr(-5,5)],qEuler(rr(-.5,.5),rr(0,3),rr(-.5,.5)),[rr(2,4),rr(2,5),rr(2,4)],null);
  altHeap(34,30,20,70,2.6);altHeap(60,52,16,30,1.8);meshMerged(fallen,CM,G);}
 altMerge(acc,CM,G);
 REGISTER({name:'Office alt 2 — the podium garden',x:0,z:0,r:38,h:12});
 // the podium roof garden, between the piers
 for(let i=0;i<biomeN(dd?22:12);i++){const a=rng()*TAU,r=rr(25,35);VEG.tree(r*Math.cos(a),PH,r*Math.sin(a),i%3,rr(4,8));}
 for(const sx of[-1,1])for(const sz of[-1,1])kput('hedge',[sx*30,PH+.5,sz*30],null,[10,1,10],new THREE.Color().setHSL(.27,.4,dd?.3:.36));
 apron(G,0,0,42,58,d,.5);
 if(dd){mossOnRing(0,PH,0,32,30,2);vinesOnRing(0,PH,0,37.5,20,7);
  for(const P of piers)vinesOnRing(P[0]*1.25,PH+rr(20,60),P[1]*1.25,7,4,14);altTrees(16,50,100,40,40);}
 else altTrees(8,55,100,40,40);
 figures(0,48,5,12);
 if(d===2){reseed(9931);
  for(let y=PH+6;y<70;y+=4.2)for(const[nx,nz]of[[1,0],[0,1],[-1,0]]){if(fbm(y*.06,nx*3+nz*5,4,2)<.48)continue;
   fireWindow([nx*(CR-.5),y,nz*(CR-.5)],[nx,0,nz],qFacing([nx,0,nz]),rr(3,6),2.4);}
  altReclaim(G,{up:70,side:40,r:50,stalls:10,plots:8,people:16,key:'altOffS'});}
 KOFF=[0,0,0];return G;}
// The floors a ruined glass shaft shows, on one face: desks, cabinets, a light.
function altRoomsBox(nx,nz,y,d){for(let k=-2;k<=2;k++){const h=altH(k,y,nx+3*nz);if(h>.6)continue;
 const x=nx*7.5+(nz?k*3.6:0),z=nz*7.5+(nx?k*3.6:0);
 kput('boxD',[x,y-1.2+.9,z],qEuler(0,h*3,0),[1.6+h*2,1.8,1+h],null);
 if(h<.08)kput('strip',[x,y+1.6,z],null,[2,1,1],WARM);}}
