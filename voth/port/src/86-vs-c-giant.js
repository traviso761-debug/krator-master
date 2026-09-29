// ================================================================ vsGiant: an ultra-large container ship, 368 x 58 m
// Built by the container-ship kit in 86-vs-a-feeder.js. 368 m long so it fits
// the pier's 420 m slip (the pier takes vessels <= 370 m). Twin-island
// layout: the bridge house FORWARD of midship, the engine casing and twin
// funnels aft; 22 rows, nine tiers on deck, a wall of containers.
//   d=1 ruined    broken in two aft of midship: the stern half settled and
//                 listing, the fore half pitched down by the head and twisted,
//                 torn faces at the break, stacks spilled across the sea
//   d=3 reclaimed the STACK TOWN: the stacks rebuilt into a mountain of homes
//                 (two peaks, terraced down to both rails), windows, balconies
//                 and awnings on every exposed face, shacks, gardens and trees
//                 on the roofs, shack towers on the peaks, a steel truss
//                 bridge from the bridge house to the fore peak, rope bridges,
//                 a salvaged crane kept on the forecastle as structure, the
//                 bridge house and funnels built over. Seeds 20520-20524.
const VS_GCRACK=-60.8;          // the gap between two bays where the ruined hull breaks
const VS_GIANT={key:'vsGiant',name:'Ultra-large container ship',L:368,B:58,T:15,F:16,sb:.62,sa:.66,fc:3.5,nu:120,rows:22,hc:2,
 boot:MAT.vsBootT,mat:MAT.vsHull,zones:[[-168,-114],[-101,33],[49,162]],
 tiers:z=>z>135?7:z>105?8:9,
 house:{z:41,dp:14,w:30,n:10,sh:2.9,step:1,bw:58,bdp:7,se:6,noBoat:true},
 island:{z:-107.5,w:28,dp:11,n:4,sh:2.9},
 ruin:{parts:[{z1:VS_GCRACK,roll:.08,pitch:.08,sink:-9,pz:VS_GCRACK},{z0:VS_GCRACK,roll:-.045,pitch:-.06,sink:-9,pz:VS_GCRACK,dz:7}],holes:10},spill:.2,
 crack:VS_GCRACK,ruinTrees:14,canyon:[44,88,6.5,8]};   // canyon: z0,z1,|x|,max tiers - the valley the truss bridge spans
// The engine casing and twin funnels, aft.
function vsGiantExtra(C,S,d){const I=S.island,par=C.at(I.z),SH=d===0?MAT.white:MAT.vsRust,WN=d===0?MAT.winIntact:MAT.winDead,P=vsSE(I.w,I.dp,4,36),h=I.n*I.sh;
 vsWall(par,SH,P,0,S.F,I.z,h,{nv:4,hole:d===1?(u,v)=>fbm(u*6,v*2,5.5,2)<.33:null});
 for(let j=0;j<I.n;j++)vsWall(par,WN,P,0,S.F+j*I.sh+1,I.z,1.2,{sc:1.012});
 vsLid(par,SH,P,0,S.F+h,I.z);
 S.funTop=[];for(const x of [-6.5,6.5])S.funTop.push(vsFunnel(C,S,{z:I.z,x,w:6,dp:5.4,h:d===1&&x>0?11:22,y0:S.F+h},d));
 if(d===1){C.at(I.z);kput('pipeR',[9,S.F+h+1.5,I.z+5],qEuler(1.2,0,.3),[2.6,11,2.6],null);}
 S.islandTop=S.F+h;
 C.reg(S.name+(d===3?' — funnel village':' — engine casing'),0,I.z,I.w/2,h+22,S.F);}
// ---------------------------------------------------------------- the stack town
// Heights of the mountain: two peaks (and a lower aft hill), falling in
// two-tier terraces to both rails, lumpy on top.
function vsGtHeights(S){const peaks=[[-140,2.5],[-28,7],[98,6]];
 return S.bays.map(z=>{const nr=S.rowsAt(z),row=[];let pk=0;for(const [zp,a] of peaks)pk=Math.max(pk,a*Math.exp(-Math.pow((z-zp)/52,2)));
  for(let r=0;r<nr;r++){const x=(r-(nr-1)/2)*VS.RP,e=Math.min(r,nr-1-r),xf=1-Math.pow(Math.abs(x)/S.hb,2)*.7;
   let n=S.tiers(z)+Math.round(pk*xf+(fbm(z*.045+3,x*.11,7.3,2)-.5)*7+rr(-.8,.8))-Math.max(0,3-e)*2;
   if(z>S.canyon[0]&&z<S.canyon[1]&&Math.abs(x)<S.canyon[2])n=Math.min(n,S.canyon[3]);row.push(clamp(n,1,17));}
  return row;});}
function vsTower(x,y,z,n){let yy=y,w=rr(3.2,4.4),dp=rr(3.2,4.4);
 for(let i=0;i<n;i++){yy=vsShack(x+rr(-.5,.5),yy,z+rr(-.5,.5),w,dp,2.5,rr(-.3,.3),{lit:.6});w*=rr(.86,1);dp*=rr(.86,1);
  if(rng()<.4)kput('plank',[x,yy-.1,z],vsQ(rr(0,TAU)),[w+1.8,.15,dp+1.4],null);}
 kput('postR',[x,yy+4,z],null,[.1,8,.1],VS_RAIL);kput('pkDish',[x+1,yy,z],vsQ(rr(0,TAU)),1.3,null);
 kput('pkCloth',[x+.9,yy+7,z],vsQ(0),[1.8,1.1,1],vsPaint());vsGlow(x,yy+1,z,3);return yy;}
// A steel truss bridge from a to b (level-ish), height h, width w.
function vsTruss(a,b,h,w){const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz),px=dz/L*w/2,pz=-dx/L*w/2,n=Math.max(2,Math.round(L/4.5));
 const P=(t,s,up)=>[lerp(a[0],b[0],t)+s*px,lerp(a[1],b[1],t)+up,lerp(a[2],b[2],t)+s*pz],RC=new THREE.Color(0x8a5a44);
 for(const s of [-1,1]){vsPlank(P(0,s,0),P(1,s,0),.4,.4,RC,'boxR');vsPlank(P(0,s,h),P(1,s,h),.4,.4,RC,'boxR');
  for(let i=0;i<=n;i++){const t=i/n;vsPlank(P(t,s,0),P(t,s,h),.25,.25,RC,'boxR');if(i<n)vsPlank(P(i%2?t:(i+1)/n,s,0),P(i%2?(i+1)/n:t,s,h),.18,.18,RC,'boxR');}}
 for(let i=0;i<=n;i+=2){const t=i/n;vsPlank(P(t,-1,h),P(t,1,h),.25,.25,RC,'boxR');}
 vsPlank(P(0,0,.15),P(1,0,.15),w-.4,.2,null);}
function vsGiantTown(C,S){const hb=S.hb,yb=S.yb,Hh=vsGtHeights(S),B=S.bays,q=vsQ(Math.PI/2);
 const hAt=(bi,x)=>{if(bi<0||bi>=B.length)return 0;const nr=Hh[bi].length,r=Math.round(x/VS.RP+(nr-1)/2);return r<0||r>=nr?0:Hh[bi][r];};
 const adj=(bi,d)=>{const bj=bi+d;return bj>=0&&bj<B.length&&Math.abs(B[bj]-B[bi])<VS.BP+.2?bj:-1;};
 let tops=[];
 B.forEach((z,bi)=>{C.at(z);const row=Hh[bi],nr=row.length,bf=adj(bi,1),ba=adj(bi,-1);
  for(let r=0;r<nr;r++){const x=(r-(nr-1)/2)*VS.RP,n=row[r],hl=r>0?row[r-1]:0,hr=r<nr-1?row[r+1]:0,hf=bf<0?0:hAt(bf,x),ha=ba<0?0:hAt(ba,x);
   for(let t=0;t<n;t++){const y=yb+t*VS.TP,exL=hl<=t,exR=hr<=t,exF=hf<=t,exA=ha<=t,top=t===n-1;
    if(!exL&&!exR&&!exF&&!exA&&!top)continue;                        // buried inside the mountain: never seen
    const home=exL||exR||exF||exA;
    kput('pkCont40R',[x,y,z],q,1,home?(rng()<.4?vsPaint():vsPaintM()):VS_LINE[(rng()*VS_LINE.length)|0].clone().lerp(new THREE.Color(0x7a5a44),.35));
    for(const [ex,sd] of [[exL,-1],[exR,1]])if(ex)for(const o of [-3.1,3.1]){if(rng()<.18)continue;const lit=rng()<.42;
     kput(lit?'dot':'cellD',[x+sd*1.24,y+1.45,z+o+rr(-.5,.5)],q,lit?[.8,1.1,.3]:[1.1,1,.25],lit?WARM:null);}
    for(const [ex,sd] of [[exF,1],[exA,-1]])if(ex&&rng()<.85){const lit=rng()<.45;kput(lit?'dot':'cellD',[x,y+1.45,z+sd*6.12],null,lit?[.8,1.1,.3]:[1,1,.25],lit?WARM:null);
     if(rng()<.25)kput('pkAwn',[x,y+2.4,z+sd*6.9],vsQ(0,sd*.25),[2.2,1,1.4],vsPaint());}
    if((exL||exR)&&(r===0||r===nr-1||rng()<.25)&&rng()<.5){const sd=exL?-1:1;kput('plank',[x+sd*1.85,y+.02,z+rr(-2,2)],null,[1.2,.12,rr(3,6)],null);
     if(rng()<.3)portWashLine(x+sd*2.2,z-3,x+sd*2.2,z+3,y+2,5);}}
   tops.push({x,z,y:yb+n*VS.TP,n,bi,r,e:Math.min(r,nr-1-r)});}});
 // roofs: shacks, gardens, trees, tanks, panels
 for(const T of tops){const u=rng();
  if(u<.22)vsShack(T.x,T.y,T.z+rr(-3.5,3.5),rr(2.2,2.8),rr(3,5),2.4,Math.PI/2+rr(-.2,.2),{});
  else if(u<.36){kput('planter',[T.x,T.y+.3,T.z+rr(-3,3)],vsQ(Math.PI/2),[4,.6,1.6],null);for(let k=0;k<3;k++)kput('leafCard',[T.x+rr(-.8,.8),T.y+.9,T.z+rr(-4,4)],qEuler(0,rng()*TAU,0),[rr(.6,1),rr(.5,.8),rr(.6,1)],new THREE.Color().setHSL(rr(.22,.32),.5,rr(.45,.6)));}
  else if(u<.43)VEG.tree(T.x,T.y,T.z+rr(-3,3),(rng()*3)|0,rr(4,8));
  else if(u<.5)kput('waterButt',[T.x,T.y+1,T.z+rr(-3,3)],null,[1,2,1],null);
  else if(u<.58){for(let k=-1;k<=1;k++)kput('pkSolar',[T.x,T.y+.5,T.z+k*2],vsQ(0,-.4),1,null);}
  else if(u<.61)kput('pkDish',[T.x,T.y,T.z],vsQ(rr(0,TAU)),1.2,null);}
 // shack towers on the peaks
 const pk=tops.filter(T=>T.e>=4).sort((a,b)=>b.y-a.y);const used=[];
 for(const T of pk){if(used.length>=6)break;if(used.some(U=>Math.hypot(U.x-T.x,U.z-T.z)<22))continue;used.push(T);vsTower(T.x,T.y,T.z,4+((rng()*4)|0));}
 // stairs: from the deck up the rail-side terraces, and terrace to terrace
 B.forEach((z,bi)=>{if(bi%3)return;C.at(z);const row=Hh[bi],nr=row.length;
  for(const sd of [-1,1]){const r0=sd<0?0:nr-1,x0=(r0-(nr-1)/2)*VS.RP;
   const rise=yb+row[r0]*VS.TP-S.F;kput('pkStair',[sd*(hb-1),S.F,z-6.1],vsQ(0),[1.1,rise/2,rise*1.15/2.4],null);
   for(let e=0;e<3;e++){const r=r0-sd*e,r1=r-sd;if(r1<0||r1>=nr)break;const y0=yb+row[r]*VS.TP,y1=yb+row[r1]*VS.TP;if(y1<=y0||y1-y0>8.5)continue;
    kput('pkStair',[(r-(nr-1)/2)*VS.RP,y0,z-5.8],vsQ(0),[1.1,(y1-y0)/2,(y1-y0)*1.15/2.4],null);}}});
 // vines and hanging gardens from the terrace edges down the rail sides
 for(const T of tops)if(T.e<=2&&rng()<.35)for(let k=0;k<2;k++){const sd=T.x>0?1:-1;
  kput('vine',[T.x+sd*1.3,T.y,T.z+rr(-5,5)],null,[1.3,rr(2,6),1.3],null);kput('leafCard',[T.x+sd*1.4,T.y-.4,T.z+rr(-5,5)],qEuler(0,rng()*TAU,0),[1,.9,1],new THREE.Color().setHSL(rr(.22,.32),.5,.45));}
 // the truss bridge from the bridge-house roof to the fore peak, rope bridges between towers
 const hs=S.hs,tb=hs.top;
 {const bl=B.findIndex(z=>z>S.canyon[1]),zl=B[bl]-6.1,yl=yb+hAt(bl,0)*VS.TP;C.at(hs.bz);
  vsTruss([0,tb+.2,hs.bz+3],[0,yl+.2,zl],3.4,3.6);kput('plank',[0,yl+.1,zl+2],null,[4,.2,4],null);const zb=zl;
  C.reg('Stack town — truss bridge',0,(hs.bz+zb)/2,(zb-hs.bz)/2+3,6,tb-1);}
 for(let i=1;i<used.length;i++){const A=used[i-1],Bt=used[i];if(Math.hypot(A.x-Bt.x,A.z-Bt.z)>70)continue;C.at(A.z);
  vsWalk([A.x,A.y+2.8,A.z],[Bt.x,Bt.y+2.8,Bt.z],1.4,{sag:2.5});vsLights([A.x,A.y+4.2,A.z],[Bt.x,Bt.y+4.2,Bt.z],12,2.6);}
 // lights, glows and people across the roofs
 for(const T of tops)if(rng()<.06){vsGlow(T.x,T.y+1.2,T.z,3);portFigures(T.x,T.y,T.z,2,1.5);}
 C.reg('Stack town — the mountain',0,-40,70,70,S.F);C.reg('Stack town — fore peak',0,105,58,60,S.F);C.reg('Stack town — aft hill',0,-141,30,40,S.F);
 // --- the bridge house and the funnels, built over
 vsHouseTown(C,S,hs,S.house,{dens:.4});
 {C.at(hs.bz);const y=hs.top-.2;for(let i=0;i<9;i++){const x=rr(-26,26),z=hs.bz+rr(-2.5,2);const y2=vsShack(x,y,z,rr(2.4,3.4),rr(2.4,3.4),2.4,rr(-.2,.2),{});
   if(rng()<.5)vsShack(x+rr(-.4,.4),y2,z,2.4,2.6,2.3,rr(-.3,.3),{});}
  kput('pkDish',[0,y+3,hs.bz-2],vsQ(3),2.2,null);VEG.tree(-20,y,hs.bz,0,6);VEG.tree(20,y,hs.bz,2,6);
  portWashLine(-28,hs.bz+3.4,-8,hs.bz+3.4,y+2.2,10);portWashLine(8,hs.bz+3.4,28,hs.bz+3.4,y+2.2,10);vsGlow(0,y+1.5,hs.bz,4);portFigures(0,y,hs.bz,6,10);}
 {const I=S.island,y=S.islandTop;C.at(I.z);for(let i=0;i<7;i++)vsShack(rr(-11,11),y,I.z+rr(-3,3),rr(2.4,3.2),rr(2.4,3.2),2.4,rr(0,TAU),{});
  kput('waterButt',[-12,y+2,I.z-3],null,[2.2,4,2.2],null);kput('waterButt',[12,y+2,I.z+3],null,[2.2,4,2.2],null);
  portGarden(0,y,I.z,6,6,3);vsHouseTown(C,S,{tiers:[{y:S.F,h:I.n*I.sh,w:I.w,dp:I.dp,cz:I.z}]},{se:4,sh:I.sh,z:I.z},{dens:.3});
  portWashLine(-6.5,I.z,6.5,I.z,S.funTop[0]-3,8);}
 // --- the crane kept on the forecastle as structure, with a house on its cab and one hung from its jib
 {const z=166;const tip=vsCrane(C,S,0,z,3,{H:26,len:44,yaw:Math.PI+.25,el:.42,hook:false});C.at(z);const cy=S.ydz(z)+26+1.6;
  vsShack(0,cy+1.6,z,4,5,2.6,.2,{lit:.7});kput('plank',[0,S.ydz(z)+13,z],null,[6,.2,6],null);vsShack(0,S.ydz(z)+13.1,z+1,3.4,3,2.4,0,{});
  const hy=tip[1]-9;vsShack(tip[0],hy,tip[2],3.2,3.2,2.5,.4,{lit:.8});vsPlank(tip,[tip[0],hy+2.7,tip[2]],.05,.05,VS_RAIL,'strutR');
  for(let i=0;i<4;i++)VEG.tree(rr(-3,3),S.ydz(z+5),z+rr(2.5,7),i%3,rr(5,8));
  C.reg('Stack town — forecastle crane',0,z,8,50,S.F);}
 vsReclaimHull(C,S,{boats:20});
 C.wat();for(let i=0;i<8;i++)portSkiff((rng()<.5?1:-1)*(hb+12+rr(0,14)),rr(-150,150),rr(-.3,.3));}
Object.assign(VS_GIANT,{extra:vsGiantExtra,town:vsGiantTown,noHatchAt:()=>false});
function buildVsGiant(scene,gx,gz,d,opt){reseed(20520+d);return vsShip(scene,gx,gz,d,opt,VS_GIANT);}
PORT_VESSEL({key:'vsGiant',name:'Ultra-large container ship',cls:'vessel',W:220,LAND:0,SEA:0,decays:[0,1,3],length:368,beam:58,draft:15,norepair:true,
 stamps:()=>[],build:buildVsGiant});
