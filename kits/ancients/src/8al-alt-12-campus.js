// ================================================================= CAMPUS ALT — "the Garden Bowl"
// A university of terraced brick bars wrapped round three sides of a sunken
// lawn. Every bar steps back a bay at each storey, and every terrace carries a
// planter trough and a curtain of hanging green, so the faces read as hanging
// gardens. The lawn is shaped into sinuous ridges edged in white concrete,
// and a white tensile canopy on masts covers the open-air lecture court at the
// open south side. After arco2 #4, #5 and #16 (the planted terraced brick
// campus round its lawn of curving ridges) and arco2 #6 (the tent roof over
// the garden court).
// Ruin: the middle of the north bar slumped to a talus of brick; the canopy
// hangs in tatters; the bowl is a young wood. The bars are brick, so they do
// not rust: a ruin shows in the dark openings, the slump and the growth.
function buildAltCampus(scene,gx,gz,d){reseed(9916);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),acc=[],br=[];
 REGISTER({name:'Campus alt — the Garden Bowl ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:130,h:24});
 const FH=3.8,NS=6,DP=28,SB=3.6;
 // one terraced bar: centre (cx,cz) of its foot, length L, facing n = (sin ry, cos ry) into the bowl
 const bar=(cx,cz,L,ry,slump)=>{const s=Math.sin(ry),c=Math.cos(ry),t=[c,-s];
  const P=(a,b)=>[cx+t[0]*a+s*b,cz+t[1]*a+c*b];                          // a along the bar, b toward the bowl
  const nSeg=Math.round(L/10);
  for(let k=0;k<nSeg;k++){const a=-L/2+(k+.5)*L/nSeg,sl=slump&&slump(a);
   for(let f=0;f<NS;f++){const dpt=DP-f*SB,b=-f*SB/2,p=P(a,b);
    if(sl&&f>=sl)continue;
    altBox(br,p[0],f*FH+FH/2,p[1],L/nSeg+.04,FH,dpt,ry);
    const fr=P(a,b+dpt/2+.05);
    if(sl&&f===sl-1){altHeap(fr[0],fr[1],8,16,1.6);continue;}
    altBand(fr[0],f*FH+FH*.45,fr[1],L/nSeg*.8,FH*.5,[s,0,c],d,f%2===0);
    // the planter on the terrace in front of the storey above, and its hanging green
    if(f<NS-1){const pl=P(a,b+dpt/2-SB/2+.6);kput('hedge',[pl[0],(f+1)*FH+.5,pl[1]],qEuler(0,ry,0),[L/nSeg*.9,1,1.2],new THREE.Color().setHSL(.27,.45,dd?.28:.34));
     for(let v=0;v<(dd?4:2);v++){const vp=P(a+rr(-4,4),b+dpt/2+.3);kput('vine',[vp[0],(f+1)*FH+.4,vp[1]],null,[1.4,rr(2,dd?6:3.5),1.4],null);}}}}};
 const north=fall?(a=>Math.abs(a+6)<16?(Math.abs(a+6)<9?1:2):0):null;
 bar(0,-62,150,0,north);bar(-82,-6,96,Math.PI/2-.28,null);bar(82,-6,96,-Math.PI/2+.28,null);
 meshMerged(br,MAT.brick,G);br.length=0;
 if(fall){altHeap(-6,-48,22,80,2.6);}
 // THE BOWL: a sunken lawn shaped into ridges
 const BW=62,BD=44,bowl=(x,z)=>{const e=(x/BW)*(x/BW)+(z/BD)*(z/BD);return e<1?-2.4*Math.min(1,(1-e)*4):0;};
 mesh(gridSurface((u,v)=>{const x=(u-.5)*2*BW*1.1,z=(v-.5)*2*BD*1.1;return[x,bowl(x,z)+.05,z+8];},48,32,{uS:20,vS:14}),dd?MAT.turfR:MAT.lawn,G);
 for(let r=0;r<4;r++){const z0=-24+r*13;const ridge=gridSurface((u,v)=>{const x=(u-.5)*BW*1.5,z=z0+8*Math.sin(u*TAU*1.2+r)+v*2.2;return[x,bowl(x,z)+.05+.9*Math.sin(Math.PI*v),z+8];},48,4,{uS:16,vS:1});
  mesh(ridge,dd?MAT.turfR:MAT.lawn,G);
  const lip=[];for(let k=0;k<48;k++){const u0=k/48,u1=(k+1)/48,x0=(u0-.5)*BW*1.5,x1=(u1-.5)*BW*1.5,z0b=z0+8*Math.sin(u0*TAU*1.2+r),z1b=z0+8*Math.sin(u1*TAU*1.2+r);
   if(dd&&altH(k,r,2)<.3)continue;beam(dd?'boxCR':'boxC',[x0,bowl(x0,z0b)+.5,z0b+8],[x1,bowl(x1,z1b)+.5,z1b+8],.35,1);}}
 // the path across, and the lecture court under the canopy at the open south side
 altBox(acc,0,.08,58,140,.16,6);
 const CX=-30,CZ=70;for(let k=0;k<5;k++)altRev(acc,CX,CZ,12+k*3,.3+k*.5,12+k*3+3,.3+k*.5,Math.PI*1.1,Math.PI*1.9,20);
 const masts=[[CX-22,CZ-10,16],[CX+22,CZ-10,14],[CX,CZ-30,18],[CX,CZ+8,9]];
 for(const[x,z,h]of masts)beam(dd?'strutR':'strutW',[x,0,z],[x,h,z],.6,.6);
 const tent=gridSurface((u,v)=>{const x=CX+(u-.5)*44,z=CZ-30+v*38;let y=6;for(const[mx,mz,h]of masts){const dd2=Math.hypot(x-mx,z-mz);y=Math.max(y,h-Math.pow(dd2/14,1.3)*8);}return[x,y,z];},30,24,
  {uS:6,vS:5,hole:dd?(u,v)=>fbm(u*5,v*5,4,2)<(fall?.48:.3):null});
 mesh(tent,dd?MAT.tarp:MAT.white,G);
 altMerge(acc,CM,G);
 REGISTER({name:'Campus alt — the north bar',x:0,z:-62,r:76,h:16});
 REGISTER({name:'Campus alt — the lecture court',x:CX,z:CZ-10,r:26,h:20});
 // forest round it, thick
 altTrees(dd?70:45,150,260,140,110);
 if(dd){for(let i=0;i<biomeN(fall?34:14);i++){const x=rr(-BW,BW),z=rr(-BD,BD);VEG.tree(x,bowl(x,z),z+8,i%3,rr(5,12));}
  rubbleRing(0,0,0,100,120,30,1.4);}
 figures(0,20,8,30);
 if(d===2){reseed(9941);
  for(let k=0;k<10;k++){const x=rr(-BW*.8,BW*.8),z=rr(-BD*.6,BD*.6),yaw=rng()*3;for(let j=0;j<5;j++)kput('hedge',[x+Math.cos(yaw)*(j-2)*1.8,.4,z+8-Math.sin(yaw)*(j-2)*1.8],qEuler(0,yaw,0),[.8,.6,rr(6,10)],new THREE.Color().setHSL(rr(.18,.3),.55,rr(.3,.45)));}
  for(let k=0;k<30;k++){const a=rr(-70,70);if(Math.abs(a+6)<16)continue;const f=Math.floor(rr(0,3));fireWindow([a,f*FH+FH*.45,-62+DP/2-f*SB+.3],[0,0,1],qFacing([0,0,1]),4,1.6);}
  altReclaim(G,{up:70,side:30,r:110,stalls:14,plots:6,people:22,key:'altCampus'});}
 KOFF=[0,0,0];return G;}
