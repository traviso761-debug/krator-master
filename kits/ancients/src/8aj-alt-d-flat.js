// ================================================================= ALTERNATE FLATIRON — THE UNDULANT
// The acute wedge again, but nothing in it is straight. The plan is a 38-degree
// triangle with a rounded prow and rounded heels; every one of its thirty
// floor edges waves in and out along the facade on two wavelengths, each floor
// out of phase with the one below, so the balconies ripple up the building like
// a cliff of strata. The wall itself swells between them. Iron balconies tangle
// where the edge comes furthest out; an arcade of piers carries it at the
// ground; the parapet rolls; the roof is a field of helmeted chimney stacks and
// three tiled stair domes. (arco2 #40-41 Casa Mila, its undulating floor edges,
// wrought-iron balconies and chimney warriors; arco2 #57 the stepped city
// blocks of the sci plates; arco1 #6 the waved balcony slabs.)
// Ruin: the prow has come down to 50 m, the floors stepping back from the break
// with the facade torn off them; most chimneys have fallen; the iron has
// rusted and dropped. Reclaimed: the broken floors are terraced homes under
// tarps, ladders and lines down the break, gardens on the roof.
function buildAltFlat(scene,gx,gz,d){reseed(9830+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,rec=d===2,stone=CONC(dd);
 const NF=34,GF=6.2,FH=4.2,HT=GF+(NF-1)*FH;
 REGISTER({name:'The Undulant — flatiron ('+ALT_STATE[d]+')',x:-10,z:0,r:78,h:HT+16});
 // THE PLAN: a filleted triangle, resampled evenly by arc length
 const C=[[62,0],[-44,37],[-44,-37]],RAD=[8,13,13],dense=[];
 for(let i=0;i<3;i++){const A=C[(i+2)%3],B=C[i],D=C[(i+1)%3];
  const n=v=>{const L=Math.hypot(v[0],v[1]);return[v[0]/L,v[1]/L];};
  const u1=n([A[0]-B[0],A[1]-B[1]]),u2=n([D[0]-B[0],D[1]-B[1]]),ph=Math.acos(u1[0]*u2[0]+u1[1]*u2[1])/2,r=RAD[i];
  const bi=n([u1[0]+u2[0],u1[1]+u2[1]]),O=[B[0]+bi[0]*r/Math.sin(ph),B[1]+bi[1]*r/Math.sin(ph)],t=r/Math.tan(ph);
  const T1=[B[0]+u1[0]*t,B[1]+u1[1]*t],T2=[B[0]+u2[0]*t,B[1]+u2[1]*t];
  let a1=Math.atan2(T1[1]-O[1],T1[0]-O[0]),a2=Math.atan2(T2[1]-O[1],T2[0]-O[0]);
  while(a2<a1)a2+=TAU;if(a2-a1>Math.PI)a2-=TAU;
  for(let k=0;k<=14;k++){const a=lerp(a1,a2,k/14);dense.push([O[0]+r*Math.cos(a),O[1]+r*Math.sin(a)]);}}
 // start the parameter at the prow tip, so s=0 is the prow
 const cum=[0];for(let i=1;i<=dense.length;i++){const a=dense[i-1],b=dense[i%dense.length];cum.push(cum[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));}
 const LP=cum[dense.length],s0=cum[7];
 const at=s=>{let L=((s*LP+s0)%LP+LP)%LP,i=0;while(cum[i+1]<L)i++;const t=(L-cum[i])/(cum[i+1]-cum[i]),a=dense[i],b=dense[(i+1)%dense.length];
  const tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz);return{x:lerp(a[0],b[0],t),z:lerp(a[1],b[1],t),nx:tz/tl,nz:-tx/tl,tx:tx/tl,tz:tz/tl};};
 const NP=200,PS=[];for(let i=0;i<=NP;i++)PS.push(at(i/NP));
 const P=u=>PS[Math.round(((u%1)+1)%1*NP)];
 const CX=-8.7;
 // the swelling wall, the waving floor edge, the rolling parapet
 const wall=(u,y)=>1.5*Math.sin(u*LP/16*TAU+y*.08);
 const edge=(u,f)=>Math.max(.8,2.4+2.1*Math.sin(u*LP/26*TAU+f*.7)+1.0*Math.sin(u*LP/11*TAU-f*1.2));
 const pdist=u=>{u=((u%1)+1)%1;return Math.min(u,1-u)*LP;};                       // metres along the facade from the prow tip
 const topY=u=>{let t=HT+2.6+2.2*Math.sin(u*LP/30*TAU);
  if(brk){const ds=pdist(u);if(ds<46)t=Math.min(t,50+34*Math.pow(ds/46,1.6)+5*(fbm(u*40,.5,9831,2)*2-1));}
  return t;};
 const hw=holeFn(dd*.75,9832,null,1.4);
 const SK=[],WH=[],FL=[],DGL=[],LIP=[];
 // THE FACADE above the arcade
 SK.push(gridSurface((u,v)=>{const p=P(u),y=lerp(GF,topY(u),v),w=wall(u,y);return[p.x+p.nx*w,y,p.z+p.nz*w];},NP,64,
  {uS:LP/8,vS:HT/8,hole:hw?(u,v)=>hw(u,lerp(GF,HT,v))&&v<.97:null}));
 // the arcade: piers and a recessed glass wall behind them
 DGL.push(gridSurface((u,v)=>{const p=P(u);return[p.x-p.nx*3.4,v*GF,p.z-p.nz*3.4];},NP,1,{uS:LP/8,vS:1}));
 for(let i=0;i<NP;i+=4){const p=P(i/NP);if(brk&&pdist(i/NP)<30)continue;
  kput(BOXC(d),[p.x-p.nx*.4,GF/2,p.z-p.nz*.4],qFacing([p.nx,0,p.nz]),[2.4,GF,2.8],null);}
 // THE FLOOR EDGES: lip and deck per floor, each waving out of phase with the last
 for(let f=1;f<NF;f++){const y=GF+(f-1)*FH,gone=u=>y>topY(u)-1;
  LIP.push(gridSurface((u,v)=>{const p=P(u),e=Math.max(edge(u,f),wall(u,y)+.7);return[p.x+p.nx*e,y-.9+v*1.3,p.z+p.nz*e];},NP,1,{uS:LP/8,vS:.3,hole:brk?u=>gone(u):null}));
  LIP.push(gridSurface((u,v)=>{const p=P(u),e=lerp(wall(u,y)-.2,Math.max(edge(u,f),wall(u,y)+.7),v);return[p.x+p.nx*e,y+.4,p.z+p.nz*e];},NP,1,{uS:LP/8,vS:.5,hole:brk?u=>gone(u):null}));
  // floors inside, which only the ruin shows
  if(brk)FL.push(gridSurface((u,v)=>{const p=P(u),w=wall(u,y)-.3;return[lerp(CX,p.x+p.nx*w,v),y-.2,lerp(0,p.z+p.nz*w,v)];},NP/2,3,
   {uS:LP/8,vS:3,hole:(u,v)=>gone(u)&&v>.15+.6*fbm(u*30,f*.7,9833,2)}));
  // windows between this floor and the next, and the iron where the edge reaches out
  for(let i=0;i<NP;i+=4){const u=(i+1.5*(f%2))/NP,p=P(u),yy=y+2.3;if(yy>topY(u)-2)continue;if(hw&&hw(u,yy))continue;
   const w=wall(u,yy)+.2,n=[p.nx,0,p.nz],q=qFacing(n),pp=[p.x+p.nx*w,yy,p.z+p.nz*w],ww=rr(1.8,2.6);
   kput('darkPane',pp,q,[ww,2.3,1],null);
   if(d===0){if(rng()<.3)kput('cell',[pp[0]+n[0]*.12,yy-.5,pp[2]+n[2]*.12],q,[ww*.8,1.1,1],CYAN.clone().multiplyScalar(.8));}
   else altWin([pp[0]+n[0]*.12,yy,pp[2]+n[2]*.12],n,ww*.85,2.3,d);
   const e=edge(u,f);
   if(e>2.4&&!(brk&&rng()<.45)){const E=[p.x+p.nx*(e-.15),y+.4,p.z+p.nz*(e-.15)],T=[p.tx*1.7,0,p.tz*1.7],iron=dd?'mullR':'boxD';
    for(const h of[.35,.95])for(let k=-1;k<1;k++){const a=[E[0]+T[0]*k,E[1]+h+.25*Math.sin(k*2.4+f),E[2]+T[2]*k],b=[E[0]+T[0]*(k+1),E[1]+h-.25*Math.sin(k*2.4+f),E[2]+T[2]*(k+1)];
     beam(iron,a,b,.12,.12);}
    for(let k=-2;k<=2;k++)beam(iron,[E[0]+T[0]*k*.5,E[1],E[2]+T[2]*k*.5],[E[0]+T[0]*(k*.5+.15*Math.sin(k+f)),E[1]+1.15,E[2]+T[2]*(k*.5+.15*Math.sin(k+f))],.09,.09);}}}
 // THE ROOF and its stacks
 const roof=gridSurface((u,v)=>{const p=P(u),w=wall(u,HT);return[lerp(CX,p.x+p.nx*w,v),HT+.6,lerp(0,p.z+p.nz*w,v)];},NP,4,
  {uS:LP/8,vS:6,hole:brk?(u,v)=>topY(u)<HT+1&&v>.2+.5*fbm(u*20,3,9834,2):null});
 SK.push(roof);
 const roofPts=[];for(let i=0;i<16;i++){const u=(i+.5)/16;if(brk&&pdist(u)<60)continue;const p=P(u),t=rr(.45,.8);roofPts.push([lerp(CX,p.x,t),lerp(0,p.z,t)]);}
 roofPts.forEach((R,i)=>{if(brk&&rng()<.6){if(rng()<.5)kput(dd?'plateR':'plateW',[R[0]+rr(-2,2),HT+1.2,R[1]+rr(-2,2)],qEuler(rr(-1,1),rng()*3,1.4),[1.6,4,1.4],null);return;}
  WH.push(lathe({rFn:y=>1.5+.5*Math.sin(y*.5),H:7,flutes:4,amp:.25,sharp:2,twist:.7,nu:16,nv:7}).translate(R[0],HT+.6,R[1]));
  kput('finial',[R[0],HT+8.4,R[1]],qEuler(0,i,0),[2.1,1.7,2.1],null);
  kput(dd?'boxR':'boxD',[R[0],HT+7.8,R[1]],qEuler(0,i*1.3,0),[3.4,.5,.6],null);});
 for(const t of[.3,.5,.7]){const p=P(t),x=lerp(CX,p.x,.4),z=lerp(0,p.z,.4);if(brk&&pdist(t)<70)continue;
  WH.push(lathe({rFn:y=>5.4*Math.pow(clamp(1-y/10,0,1),.55),H:10,flutes:10,amp:.05,nu:30,nv:8}).translate(x,HT+.6,z));
  kput(dd?'postR':'postW',[x,HT+12,z],null,[.3,4,.3],null);}
 if(!brk)for(let i=0;i<30;i++){const t=rng(),p=P(t),k=rr(.3,.85);kput('hedge',[lerp(CX,p.x,k),HT+1.1,lerp(0,p.z,k)],qEuler(0,rng()*3,0),[rr(1.5,3),1,1],null);}
 apron(G,CX,0,80,104,dd,.6);
 meshMerged(SK,stone,G);meshMerged(LIP,SHELL(d),G);meshMerged(WH,dd?MAT.whiteWorn||MAT.rust:MAT.white,G);meshMerged(DGL,MAT.darkGlass,G);
 if(FL.length)meshMerged(FL,MAT.concreteR,G);
 if(brk){// the prow heap, spilled out over the street
  for(let i=0;i<60;i++){const a=rr(-.8,.8),r=rr(64,110);kput(i%3?'rubble':'boxCR',[r*Math.cos(a),rr(.5,4),r*Math.sin(a)],qEuler(rng()*3,rng()*3,rng()*3),[rr(1.5,5),rr(1,3),rr(1.5,5)],
   i%3?new THREE.Color().setHSL(.07,.15,rr(.35,.5)):null);}
  rubbleRing(CX,0,0,60,110,150,3.5);vinesFromLedge(LIP,0,0,0,160,18,CX,0);mossOnSurface([roof],0,0,0,80,2.5);
  trees(CX,0,85,170,30);}
 else{trees(CX,0,92,150,12);figures(CX,74,14,20);}
 if(rec){
  // homes on the broken floors at the prow: shacks, tarps and fires on each exposed floor
  for(let f=1;f<NF;f++){const y=GF+(f-1)*FH;for(let j=0;j<4;j++){const u=rr(-.07,.07),p=P(u);if(y<topY(u)-1)continue;
   const k=rr(.12,.3),x=lerp(p.x,CX,k),z=lerp(p.z,0,k);
   if(j===0)firePit('altFlat',x,y+.2,z,.7);
   else if(j===1)kput('patchTarp',[x,y+3.1,z],qEuler(-Math.PI/2+rr(-.25,.25),rng()*3,0),[rr(5,8),rr(4,6),1],null);
   else{kput('shantyBox',[x,y+1.3,z],qEuler(0,rng()*3,0),[rr(2.5,4),2.4,rr(2.5,4)],null);if(rng()<.5)kput('planter',[x+2,y+.55,z],null,[2.4,.7,1.2],null);}}}
  // ladders and lines down the break, a hoist with its bucket
  for(let k=0;k<3;k++){const u=-.05+k*.05,p=P(u),y0=Math.min(46,topY(u)-6);altLadder([p.x+p.nx*1.2,0,p.z+p.nz*1.2+1],[p.x+p.nx*1.2,y0,p.z+p.nz*1.2+1],[p.tx,0,p.tz]);}
  for(let k=0;k<6;k++){const a=P(rr(-.09,-.02)),b=P(rr(.02,.09)),y=rr(30,60);altSag([a.x,y,a.z],[b.x,y,b.z],2,6,.06);}
  KOFF=[gx,0,gz];altReclaim(G,170,HT-2,'altFlat');figures(70,0,20,24);}
 KOFF=[0,0,0];return G;}
