// ================================================================= APARTMENTS — three variants
// IZS_HOLLOW.apts (a world that builds the apartments' interiors itself, settlements/iziz 78w/78x; 2026-10-19): A's tray
// slabs, dark liners and rooms behind the holes, B's dark mid-wall, floor plates and lit cells (their rng still drawn), and
// C's solid liners are left out (and B's pillars down the middle, which the corridor runs through); a street door is cut in A's stem (+x), B's outer skin (u .36) and each of C's drums
// (facing out of the cluster, at its first storey). Nothing that draws rng is skipped, so nothing else moves.
function aptsIx(){return typeof IZS_HOLLOW!=='undefined'&&!!IZS_HOLLOW.apts;}
function buildApartments(scene,gx,gz,d){reseed(9950+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);let talus=null;
 // A — midrise terrace stack: eight stacked lobed trays, each shifted and shrunk, on a hyperboloid stem
 {REGISTER({name:'Apartments A — terrace stack, midrise ('+STATE(d)+')',x:0,z:0,r:40,h:60});mesh(lathe({rFn:y=>7*Math.sqrt(1+1.5*Math.pow((y-20)/20,2)),H:40,nu:32,nv:12,hole:aptsIx()?(u,y)=>Math.min(u,1-u)<.08&&y<5.6:undefined}),skin,G);
  const aSkin=[],aDark=[];   // one mesh per stack, not two or three per terrace
  for(let s=0;s<8;s++){const y=6+s*5.4;const ox=Math.sin(s*1.3)*5,oz=Math.cos(s*.9)*5;const R=24-s*1.6;const gone=d>0&&s===6;const hole=holeFn(d*.7,700+s,null,2.5);
   if(gone){rubbleRing(ox*3,0,oz*3,10,32,30,2);continue;}
   // floor and ceiling: each tray was an open-ended tube, so from above you
   // looked straight down through all eight of them to the ground.
   const ixT=aptsIx()&&!(d>0&&s===7),ixTop=s===7||(d>0&&s===5);   // the interior's trays (7 hangs unreachable over the gap in a decay); the top one keeps its roof
   if(!ixT)kput('slab',[ox,y,oz],null,[R*.99,.35,R*.99],new THREE.Color(d>0?0x4a4038:0xcfcac2));
   if(!ixT||ixTop)kput('slab',[ox,y+4.6,oz],null,[R*.99,.35,R*.99],new THREE.Color(d>0?0x4a4038:0xcfcac2));
   aSkin.push(lathe({rFn:()=>R,H:4.6,flutes:6,amp:.28,sharp:1,nu:72,nv:3,hole}).translate(ox,y,oz));
   if(d>0&&!aptsIx())aDark.push(lathe({rFn:()=>R*.9,H:4.6,nu:24,nv:1}).translate(ox,y,oz));
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU;const r=R*(1+.28*(.5+.5*Math.cos(6*th)))*(1+v*.1);return[ox+r*Math.cos(th),y+4.6+.4*v,oz+r*Math.sin(th)];},72,1,{}));
   for(let k=0;k<18;k++){const th=(k+.5)/18*TAU;const r=R*(1+.28*(.5+.5*Math.cos(6*th)))+.1;if(hole&&hole(k/18,2.3))continue;civWin(d>0?'winSmD':'winSmI',[ox+r*Math.cos(th),y+2.3,oz+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2,1.7,1],null);}
   // rooms behind the holes in the tray wall (round 2), between the skin and
   // the dark liner at .9R; the tray's floor and ceiling slabs bound them
   if(hole&&!aptsIx())for(let k=0;k<36;k++){const th=(k+.5)/36*TAU;if(!hole((k+.5)/36,2.3))continue;const r=R*(1+.28*(.5+.5*Math.cos(6*th)));
    domRoom([ox+r*.97*Math.cos(th),y+.2,oz+r*.97*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],r*.97-R*.9,4.2,d,700+s);}
   if(s%2===0)stripRing(ox,y+3.5,oz,R*.8,d,18);if(d>0)mossOnRing(ox,y+4.8,oz,R*1.1,10,1.5);}
  meshMerged(aSkin,skin,G);meshMerged(aDark,MAT.dark,G);
  if(d>0){mossOnSurface(aSkin,0,0,0,90,1.8);vinesFromLedge(aSkin,0,0,0,40,12);stainsFromLedge(aSkin,0,0,0,30,9);}
  if(!aptsIx())kput('archOpen',[7,3.5,0],qFacing([1,0,0]),[.5,.5,1],null);}
 // B — honeycomb wall: a long curved slab of hexagonal cells (Beksinski lattice), 12 storeys
 {const bx=150;REGISTER({name:'Apartments B — honeycomb wall, large ('+STATE(d)+')',x:bx,z:0,r:70,h:62});const R=110,a0=-.55,a1=.55,HW=60;
  const hexHole=(u,v)=>{const cx=u*30,cy=v*13;const rowOff=(Math.floor(cy)%2)*.5;const fx=((cx+rowOff)%1)-.5,fy=(cy%1)-.5;return Math.abs(fx)<.32&&Math.abs(fy)<.34&&Math.abs(fx)+Math.abs(fy)*1.2<.52;};
  // THE BITE. In the ruin the upper storeys over the east third of the arc have
  // come down (top line falling to ~45% of HW, jagged), exposing the floor
  // plates in section. The ruin used to be the intact slab with more holes,
  // which is the same silhouette. `bite(u)` is the surviving height at u.
  const bite=u=>{const t=clamp(1-Math.abs(u-.72)/.24,0,1);return HW-(t>0?HW*.55*Math.pow(t,.7)+6*(fbm(u*14,3.1,725,2)-.5)*Math.min(1,t*4):0);};
  const bit=(u,y)=>d>0&&y>bite(u);
  const wall=(off)=>gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R+off;return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},240,80,{uS:30,vS:13,hole:(u,v)=>hexHole(u,v)||bit(u,v*HW)||aptsIx()&&off===0&&Math.abs(u-.36)<.016&&v*HW<4.3||(holeFn(d,710,null,1.5)||(()=>false))(u*3,v*HW)});
  mesh(wall(0),skin,G);mesh(wall(-12),skin,G);
  // cell floors between the skins, dark inner
  if(!aptsIx())mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-6;return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},60,12,{hole:(u,v)=>bit(u,(v+.5/12)*HW)}),MAT.dark,G);
  const bFloors=[];
  for(let f=0;f<13;f++){const y=f*HW/13;if(!aptsIx())bFloors.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-12,R,v);return[bx+Math.sin(a)*r,y,Math.cos(a)*r-R*.8];},60,1,{hole:d>0?(u,v)=>fbm(u*12,f,720+f,2)<.2||bit(u,y+.5):null}));}
  // END WALLS AND ROOF. The block is a 12 m sandwich of two perforated skins;
  // without these it was open along both end elevations and across the whole
  // top, so you looked straight into thirteen storeys of floor slab from the
  // side. The skins are the long elevations, not the whole envelope.
  for(let s=0;s<2;s++){const a=lerp(a0,a1,s);
   bFloors.push(gridSurface((u,v)=>{const r=lerp(R-12,R,u);return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},10,44,{uS:6,vS:13,hole:d>0?(u,v)=>fbm(u*4+s*3,v*7,714+s,2)<.28:null}));}
  bFloors.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-12,R,v);return[bx+Math.sin(a)*r,HW,Math.cos(a)*r-R*.8];},60,4,{uS:20,vS:4,hole:d>0?(u,v)=>fbm(u*9,v*4,716,2)<.24||bit(u,HW-.5):null}));
  meshMerged(bFloors,skin,G);
  for(let k=0;k<30;k++)for(let f=0;f<13;f++){if(rng()>.35)continue;const a=lerp(a0,a1,(k+.5)/30),y=f*HW/13+2.3;const lit=d>0?rng()<.06:true;if(bit((k+.5)/30,y+1))continue;
   if(aptsIx()){if(lit)rr(.4,.9);}else kput('cell',[bx+Math.sin(a)*(R-5),y,Math.cos(a)*(R-5)-R*.8],qFacing([Math.sin(a),0,Math.cos(a)]),[2,1.6,1],lit?WARM.clone().multiplyScalar(rr(.4,.9)):DEAD);}
  for(let k=0;k<7;k++){const a=lerp(a0,a1,(k+.5)/7);const bk=bite((k+.5)/7),h=d>0&&bk<HW-.01?bk-1.5:HW+3;if(!aptsIx())kput(d>0?'colR':'colW',[bx+Math.sin(a)*(R-6),0,Math.cos(a)*(R-6)-R*.8],null,[3,h,3],null);}
  // the fallen storeys: a talus against the foot of the bite, both faces. Run
  // after figures() (see the end) so the PRNG stream above it is unchanged.
  if(d>0)talus=()=>{for(let i=0;i<130;i++){const u=.5+.44*rng(),g=HW-bite(u);if(g<4){rng();rng();continue;}const a=lerp(a0,a1,u),side=rng()<.5?1:-1,q=Math.pow(rng(),1.8);
   const r=side>0?R+2+q*22:R-14-q*18,s=rr(1,3.4)*(1.2-.5*q)*Math.min(1,g/20);
   kput('rubble',[bx+Math.sin(a)*r,s*.4+(1-q)*2.2,Math.cos(a)*r-R*.8],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.8,1.6),s*rr(.5,1),s*rr(.8,1.6)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.35,.55)));}};
  if(d>0){rubbleRing(bx,0,R*.2,10,60,50,2.5);}}
 // C — column cluster: five slim lobed towers (30–48 m) linked by sky bridges
 {const cx=340;REGISTER({name:'Apartments C — column cluster, large ('+STATE(d)+')',x:cx,z:0,r:60,h:52});const cols=[[0,0,48],[26,10,40],[-22,14,36],[8,-26,44],[-18,-18,30]];
  const cBands=[];   // the balcony rings of all five towers in one mesh
  cols.forEach((c,i)=>{const R=7.5,H=c[2];const cut=d>0&&i===1?H*.5:null;const hole=holeFn(d,730+i,cut,2);
   kput(d>0?'colR':'colW',[cx+c[0],0,c[1]],null,[4,10,4],null);
   // the drum's door faces out of the cluster (its centroid is at -1.2, -4; settlements/iziz 78w COLS), 2.6 kit wide, its
   // first storey's height; the liner is holed like the shell
   const du=((Math.atan2(c[1]+4,c[0]+1.2)/TAU)%1+1)%1,door=(u,y)=>Math.min(Math.abs(u-du),1-Math.abs(u-du))<.028&&y<5.8,ixHole=aptsIx()?(u,y)=>(hole&&hole(u,y))||door(u,y):hole;
   mesh(lathe({rFn:()=>R,H:H-10,cut:cut?cut-10:null,jag:cut?2:0,flutes:6,amp:.3,sharp:1,nu:60,nv:24,hole:ixHole,seed:730+i}),skin,G,cx+c[0],10,c[1]);
   if(d>0)mesh(lathe({rFn:()=>R*.85,H:H-10,cut:cut?cut-10:null,jag:2,nu:aptsIx()?60:24,nv:aptsIx()?24:4,seed:730+i,hole:aptsIx()?ixHole:undefined}),MAT.guts,G,cx+c[0],10,c[1]);
   for(let s=0;s*4<(cut||H)-14;s++){const y=10+s*4;cBands.push(lathe({rFn:()=>R*1.08,H:.6,flutes:6,amp:.3,sharp:1,nu:60,nv:1,hole:d>0?(u,v)=>fbm(u*8+s,i,740+s,2)<.22:null}).translate(cx+c[0],y+3.4,c[1]));
    for(let k=0;k<6;k++){const th=k/6*TAU;const u=k/6;if(hole&&hole(u,y-10))continue;const r=R*1.3+.1;civWin(d>0?'winSmD':'winSmI',[cx+c[0]+r*Math.cos(th),y+1.8,c[1]+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.6,1.6,1],null);}
    if(s%3===0)stripRing(cx+c[0],y+2.3,c[1],R*.85,d,12);}
   if(!cut){kput('slab',[cx+c[0],H+.2,c[1]],null,[R*1.1,.5,R*1.1],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));mesh(lathe({rFn:y=>R*.6*Math.sqrt(clamp(1-Math.pow(y/3,2),0,1)),H:3,nu:20,nv:5}),skin,G,cx+c[0],H+.4,c[1]);}
   else rubbleRing(cx+c[0],0,c[1],9,24,40,2);});
  meshMerged(cBands,skin,G);
  [[0,1,22],[0,2,18],[0,3,26],[2,4,16],[1,3,24]].forEach(b=>{const A=cols[b[0]],B=cols[b[1]];if(b[2]>Math.min(A[2],B[2])-4)return;if(d>0&&b[0]===0&&b[1]===1)return;
   beam(d>0?'strutR':'strutW',[cx+A[0],b[2],A[1]],[cx+B[0],b[2],B[1]],2.4,3);beam('tube',[cx+A[0],b[2]+2,A[1]],[cx+B[0],b[2]+2,B[1]],2,2);});
  kput('slab',[cx,.3,0],null,[44,.6,44],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));if(d>0)scatterMoss(cx,.6,0,0,42,40,1.8);}
 figures(60,40,5,6);figures(300,60,4,5);if(talus)talus();KOFF=[0,0,0];return G;}

// ================================================================= APARTMENTS C2 — the column cluster, its columns made for rooms (2026-10-19)
// The owner, on the interiors sheet: "we may need to make a version of the column cluster with larger, more intentionally
// designed-for-rooms columns". Apartments C's drums are 15 m across on stilts; at the city's scale (0.39) they are 5 m
// inside, two rooms beside a ship's ladder a storey. These are four drums 30 m across (radius 15, the lining at .85)
// standing on the ground, a storey every two window bands (8 m: the rooms' height at about 0.4), a door at each foot
// facing out of the cluster, and a window per bay of the plan's cells (sixteen round). Linked by bridges at two levels.
// Ruin: drum 1 is cut at half its height. IZS_HOLLOW.apts: the liner holed like the shell, the doors cut through.
const APC2_COLS=[[0,0,48],[38,10,36],[-34,16,40],[6,-38,32]];
function buildAptsC2(scene,gx,gz,d){reseed(9670+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Apartments C2 — the column cluster, rooms ('+STATE(d)+')',x:0,z:0,r:60,h:50});
 const R=15,bands=[];
 APC2_COLS.forEach((c,i)=>{const H=c[2],cut=d>0&&i===1&&!(aptsIx()&&d===3)?H*.5:null,hole=holeFn(aptsIx()&&d===3?d*.3:d,760+i,cut,2);   /* reclaimed: most of the wall whole (the owner, 2026-10-19) */
  const du=((Math.atan2(c[1]+3,c[0]-2.5)/TAU)%1+1)%1,door=(u,y)=>Math.min(Math.abs(u-du),1-Math.abs(u-du))<.03&&y<6.2,ix=aptsIx();
  const hl=ix?(u,y)=>(hole&&hole(u,y))||door(u,y):hole;
  mesh(lathe({rFn:()=>R,H,cut,jag:cut?2:0,flutes:8,amp:.12,sharp:1.5,nu:96,nv:24,hole:hl,seed:760+i}),skin,G,c[0],0,c[1]);
  if(d>0)mesh(lathe({rFn:()=>R*.85,H,cut,jag:2,nu:ix?96:32,nv:ix?24:4,seed:760+i,hole:ix?hl:undefined}),MAT.guts,G,c[0],0,c[1]);
  for(let s=0;s*4<(cut||H)-2;s++){const y=s*4;bands.push(lathe({rFn:()=>R*1.05,H:.6,flutes:8,amp:.12,sharp:1.5,nu:96,nv:1,hole:d>0?(u,v)=>fbm(u*8+s,i,770+s,2)<(aptsIx()&&d===3?.06:.22):null}).translate(c[0],y+3.4,c[1]));
   for(let k=0;k<16;k++){const th=(k+.5)/16*TAU,u=(k+.5)/16;if(hole&&hole(u,y))continue;if(ix&&door(u,y+1.8))continue;
    if(ix&&d===3){patchOpening([c[0]+(R*1.12+.1)*Math.cos(th),y+1.8,c[1]+(R*1.12+.1)*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),1.9,2.6,i*97+s*16+k);continue;}   /* the glass filled with boards and sheet */
    civWin(d>0?'winSmD':'winSmI',[c[0]+(R*1.12+.1)*Math.cos(th),y+1.8,c[1]+(R*1.12+.1)*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.6,1.6,1],null);}
   if(s%3===0)stripRing(c[0],y+2.3,c[1],R*.85,d,16);}
  if(!cut){kput('slab',[c[0],H+.2,c[1]],null,[R*1.06,.5,R*1.06],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));mesh(lathe({rFn:y=>R*.55*Math.sqrt(clamp(1-Math.pow(y/3,2),0,1)),H:3,nu:24,nv:5}),skin,G,c[0],H+.4,c[1]);}
  else rubbleRing(c[0],0,c[1],R+1,R+10,40,2);
  if(!ix)kput('archOpen',[c[0]+(R+.2)*Math.cos(du*TAU),2.6,c[1]+(R+.2)*Math.sin(du*TAU)],qFacing([Math.cos(du*TAU),0,Math.sin(du*TAU)]),[.45,.5,1],null);});
 meshMerged(bands,skin,G);
 [[0,1,24],[0,2,20],[0,3,16],[1,3,12]].forEach(b=>{const A=APC2_COLS[b[0]],B=APC2_COLS[b[1]];if(b[2]>Math.min(A[2],B[2])-4)return;if(d>0&&b[0]===0&&b[1]===1)return;
  beam(d>0?'strutR':'strutW',[A[0],b[2],A[1]],[B[0],b[2],B[1]],2.4,3);});
 kput('slab',[0,.15,0],null,[60,.3,60],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));if(d>0)scatterMoss(0,.3,0,0,58,40,1.8);
 KOFF=[0,0,0];return G;}
