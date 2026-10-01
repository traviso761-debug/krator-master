// ================================================================= POLICE ALT — "the Watch Cup"
// A square watch post: a blind concrete stem carrying a cup that steps OUT as
// it rises, three trays wider each than the one below, the top one belted with
// a frieze of lozenges, glazed all round under its brow and with a lamp mast.
// The yard round it is closed by a broken palisade of stepped concrete slabs of
// many heights, the way the ossuary precincts are, with one gate and a stair.
// After arco2 #9 (the cup on a stem inside a palisade of stepped slabs) and
// arco1 #47 (the cantilevered heads of the Kordun monument).
// Ruin: the cup's south-east corner broke away and lies at the stem's foot;
// the stem is cracked; a run of the palisade lies flat.
function buildAltPolice(scene,gx,gz,d){reseed(9911);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),acc=[];
 REGISTER({name:'Police alt — the Watch Cup ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:48,h:44});
 // the forecourt and the entry block with its stair
 altBox(acc,0,.3,0,64,.6,64);
 altBox(acc,0,4,-2,22,8,18);kput('archOpen',[0,3.6,7.1],qFacing([0,0,1]),[.5,.6,1],null);
 for(let k=0;k<6;k++)altBox(acc,0,.6+k*.3,8.5+(6-k)*.7,10,.6+k*.6,1.4);
 // the stem, with a vertical crack in a ruin
 const SY=8,SH=16;
 if(!fall)altBox(acc,0,SY+SH/2,-2,9,SH,9);
 else{altBox(acc,-1.4,SY+SH/2,-2,6.2,SH,9);altBox(acc,3.2,SY+SH/2-.4,-2,2.6,SH-.8,9,0,0,-.02);
  kput('boxD',[1.8,SY+SH/2,-2],null,[.5,SH*.8,9.2],null);}
 // the cup: three trays stepping out, a glazed band, the lozenge frieze, a brow
 const T=[[15,4],[21,4],[27,7]];let y=SY+SH;const bite=fall?(x,z)=>x>4&&z>3:()=>false;
 const tray=(w,h,yy)=>{// one tray as four wall boxes and a floor, split so a corner can go
  const half=w/2,seg=3;for(let i=0;i<seg;i++)for(let j=0;j<seg;j++){const cx=-half+(i+.5)*w/seg,cz=-2-half+(j+.5)*w/seg;
   if(bite(cx,cz+2))continue;altBox(acc,cx,yy+.4,cz,w/seg+.02,.8,w/seg+.02);}
  for(const[nx,nz]of[[1,0],[-1,0],[0,1],[0,-1]])for(let i=0;i<seg;i++){const t=-half+(i+.5)*w/seg,cx=nx?nx*half:t,cz=-2+(nz?nz*half:t);
   if(bite(cx,cz+2))continue;altBox(acc,cx,yy+h/2,cz,nx?1:w/seg+.02,h,nz?1:w/seg+.02);}};
 for(const[w,h]of T){tray(w,h,y);y+=h;}
 const CY=y,W=T[2][0];
 // the glazed band under the brow and the lozenge frieze on the top tray
 for(const[nx,nz]of[[1,0],[-1,0],[0,1],[0,-1]]){const q=qFacing([nx,0,nz]);
  for(let k=-5;k<=5;k++){const t=k*2.3,x=nx?nx*(W/2+.55):t,z=-2+(nz?nz*(W/2+.55):t);if(bite(x,z+2))continue;
   kput(BOXC(d),[x,CY-4.4,z],q.clone().multiply(qEuler(0,0,Math.PI/4)),[1.4,1.4,.6],null);}
  const L=T[1][0]-1.2,x=nx*(T[1][0]/2+.1),z=-2+nz*(T[1][0]/2+.1);
  if(!bite(x,z+2))altBand(x,CY-T[2][1]-T[1][1]/2,z,L,2.4,[nx,0,nz],d,true);}
 altBox(acc,0,CY+.5,-2,W+2,1,W+2);
 if(!fall){kput('postW',[-9,CY+9,-11],null,[.4,16,.4],null);kput(d>0?'cellD':'cell',[-9,CY+17,-11],null,[1.4,1.4,1.4],d>0?null:WARM);}
 altMerge(acc,CM,G);
 REGISTER({name:'Police alt — the cup',x:0,z:-2,r:20,h:16,y:SY+SH});
 if(fall){// the broken corner of the cup, at the stem's foot
  const F=new THREE.Group();F.position.set(15,0,12);F.rotation.set(.5,.4,.9);G.add(F);
  const fa=[];altBox(fa,0,0,0,9,7,9);altBox(fa,0,3,4.5,9,1,1);meshMerged(fa,CM,F);dropFragment(F,0,1);altHeap(12,10,9,30,1.6);
  civRooms({cx:0,cy:SY+SH,cz:-2,rFn:()=>9,y0:1,y1:14,step:4.5,d,seed:9911,rIn:.4,gap:a=>civDA(a,Math.PI/4)>.7});}
 // the palisade: stepped slabs of many heights round a 76 m square, one gate south
 const pa=[];const PW=38;
 for(const[nx,nz]of[[1,0],[-1,0],[0,1],[0,-1]])for(let k=0;k<12;k++){const t=-PW+(k+.5)*PW*2/12;if(nz===1&&Math.abs(t)<8)continue;
  const x=nx?nx*PW:t,z=nz?nz*PW:t,h=5+6*altH(k,nx,nz)+(k%4===1?4:0),w=PW*2/12-1.2;
  if(fall&&nx===1&&k>3&&k<9){altBox(pa,x+h/2+1,.9,z,h,1.6,w,0,0,(altH(k,1,2)-.5)*.15);continue;}
  const sx=nx?1.6:w,sz=nz?1.6:w;altBox(pa,x,h/2,z,sx,h,sz);
  // the stepped top: a narrower block on the slab
  altBox(pa,x+(nx?0:w*.18),h+1.5,z+(nz?0:w*.18),nx?1.6:w*.5,3,nz?1.6:w*.5);}
 meshMerged(pa,CM,G);
 if(fall)altHeap(46,0,10,30,1.6);
 apron(G,0,0,40,52,d,.3);
 if(dd){mossOnRing(0,.6,0,30,24,1.6);vinesOnRing(0,CY,-2,13,12,12);altTrees(16,50,90,40,40);
  for(let k=0;k<8;k++)VEG.tree(rr(-30,30),.6,rr(-30,-12),k,rr(5,10));}
 else altTrees(8,52,90,40,40);
 figures(0,28,4,8);
 if(d===2){reseed(9936);
  for(const[nx,nz]of[[-1,0],[0,-1],[0,1]])for(let k=-2;k<=2;k++){const t=k*3.5,n=[nx,0,nz];if(fbm(k,nx+nz*2,3,2)<.4)continue;
   fireWindow([nx?nx*(T[1][0]/2-.2):t,CY-T[2][1]-T[1][1]/2,-2+(nz?nz*(T[1][0]/2-.2):t)],n,qFacing(n),2.4,2);}
  altReclaim(G,{up:40,side:24,r:30,stalls:8,plots:6,people:12,key:'altPolice'});}
 KOFF=[0,0,0];return G;}
