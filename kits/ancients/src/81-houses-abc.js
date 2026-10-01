// ================================================================= HOUSES v2
// petalRing, but returning the petals' geometries for the caller to merge (one
// mesh per house instead of one per petal), with the decay holes scaled by
// HOLES rather than by d: petalRing's own `.3*d` threshold is .9 at decay 3,
// which ate every petal of the rehabilitated houses (as it did the Government's).
function housePetals(out,n,Rb,Hp,W,lean,curl,y,d,seed,skipFn){const k=d>0?HOLES:0;
 for(let i=0;i<n;i++){if(skipFn&&skipFn(i))continue;
  out.push(petalGeo(Rb,Hp,W,lean,curl,k>0?(u,v)=>fbm(u*3+i,v*5,seed+i,2)<.3*k:null).rotateY(-i/n*TAU).translate(0,y,0));}}
function buildHouses(scene,gx,gz,d){reseed(9400+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // SPACING. The three houses used to sit at x=0, 70 and 140 on a row whose sites
 // are only 120 apart, so each variant's House C stood inside the next
 // variant's House A (intact C at 20 vs rehabilitated A at 0). They now sit at
 // 30, 70 and 110 - same middle house, same presets - and each cluster keeps
 // ~15 m of clear ground from its neighbour. A and C shift by moving KOFF and
 // their own group, so nothing inside the blocks changed.
 const AX=30,CX=-30;
 // A — petal house: petals part at the front, a porch of two leaning struts marks the door
 {KOFF=[gx+AX,0,gz];REGISTER({name:'House A — petal house ('+STATE(d)+')',x:0,z:0,r:14,h:14});
  const P=new THREE.Group();P.position.x=AX;G.add(P);const aS=[lathe({rFn:()=>9.5,H:1,nu:40,nv:1})];kput('slab',[0,1,0],null,[9.5,.4,9.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  // the ruin's dark liner stands 1.6 m in from the eaten drum (was .4 m, so a
  // hole showed a flat dark wall) and the band between is furnished (round 2)
  const hA=holeFn(d*.5,101,null,3);
  aS.push(lathe({rFn:()=>5,H:5.5,nu:32,nv:3,hole:hA}).translate(0,1,0));if(d>0)mesh(lathe({rFn:()=>3.4,H:5.5,nu:16,nv:1}),MAT.dark,P,0,1,0);
  if(hA)for(let k=0;k<16;k++){const th=(k+.5)/16*TAU;if(!hA((k+.5)/16,2.5))continue;domRoom([4.8*Math.cos(th),1.2,4.8*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],1.4,5.2,d,101);}
  kput('archOpen',[0,3.2,5.1],qFacing([0,0,1]),[.4,.5,1],null);for(let k=1;k<4;k++){const th=k/4*TAU+Math.PI/2;civWin(d>0?'winSmD':'winSmI',[Math.cos(th)*5.1,3.6,Math.sin(th)*5.1],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.4,1],null);}
  housePetals(aS,8,6.6,11,5.2,1.6,.5,1,d,110,i=>i===2||(d>0&&i===5));housePetals(aS,8,3.8,13,3.6,-.6,.4,1,d,120,d>0?(i=>i===6):null);meshMerged(aS,skin,P);
  beam(d>0?'strutR':'strutW',[-4,1,10],[-2,6,5.5],.8,.6);beam(d>0?'strutR':'strutW',[4,1,10],[2,6,5.5],.8,.6);kput(d>0?'boxR':'boxW',[0,6.2,7.5],qEuler(.3,0,0),[6,.4,5],null);
  kput('slab',[0,.2,14],null,[3,.4,3],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  if(d===0)mesh(lathe({rFn:y=>4.2*Math.sqrt(clamp(1-Math.pow(y/6,2),0,1)),H:6,nu:24,nv:6}),MAT.glass,P,0,6.5,0);
  if(d>0){const fm=mesh(petalGeo(6.6,11,5.2,1.6,.5,null),MAT.rust,P,14,.6,-6);fm.rotation.set(0,.9,Math.PI/2*.9);dropFragment(fm,0,.15);mossOnRing(0,1.4,0,8,14,1.2);}
  stripRing(0,5.5,0,4.3,d,12);KOFF=[gx,0,gz];}
 // B — hypar-shell house: a real room block inside the two shells, glass gables, door in the front gable
 {REGISTER({name:'House B — hypar-shell house ('+STATE(d)+')',x:70,z:0,r:14,h:14});kput('slab',[70,.5,0],null,[13,.5,13],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  // In the ruin the front shell has come down: it lies face-down in front of
  // the room block, whose gable and door now stand exposed, so the ruin changes
  // the silhouette instead of only its skin. (The rear one fell first, but it
  // hid behind the front one from every side a preset looks from.)
  {const Bg=new THREE.Group();G.add(Bg);luceShells(Bg,70,0,16,13,5,d,130,skin);
   if(d>0){const m=Bg.children[1];G.attach(m);m.rotation.set(1.25,0,-.06);m.position.set(70,0,11);dropFragment(m,.55,.25);}}
  kput(d>0?'boxR':'boxW',[70,3.5,0],null,[9,6,7],null);kput('boxD',[70,3.5,0],null,[8.6,5.6,6.6],null);
  kput('archOpen',[70,2.2,4.0],qFacing([0,0,1]),[.35,.4,1],null);kput('archOpen',[70,2.2,4.9],qFacing([0,0,1]),[.35,.4,1],null);
  for(let s=-1;s<=1;s+=2)for(let k=-1;k<=1;k+=2)civWin(d>0?'winSmD':'winSmI',[70+k*2.5,4.2,s*3.6],qFacing([0,0,s]),[1.2,1.2,1],null);
  for(let k=-1;k<=1;k+=2)civWin(d>0?'winSmD':'winSmI',[70+k*4.6,3.2,0],qFacing([k,0,0]),[1.4,1.6,1],null);
  kput('slab',[70,.2,10],null,[2.5,.4,2.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));stripRing(70,8.5,0,2.2,d,8);if(d>0)mossOnRing(70,.9,0,8,10,1.1);}
 // C — lobed cluster house (Goldberg): kept, entry path added
 {KOFF=[gx+CX,0,gz];REGISTER({name:'House C — lobed cluster house ('+STATE(d)+')',x:140,z:0,r:12,h:12});const P=new THREE.Group();P.position.set(140+CX,0,0);G.add(P);
  const cS=[lathe({rFn:()=>2.6,H:10,nu:20,nv:2})],cD=[];
  for(let l=0;l<3;l++){const a=l/3*TAU+.5,ox=Math.cos(a)*4.6,oz=Math.sin(a)*4.6;const gone=d>0&&l===1;
   kput(d>0?'colR':'colW',[140+ox,0,oz],null,[1.1,3.2,1.1],null);if(gone){rubbleRing(140+ox,0,oz,1,5,18,1.2);continue;}
   const hC=holeFn(d,140+l,null,2.5);
   cS.push(lathe({rFn:y=>3.6*(1-.05*Math.pow(y/7,6)),H:7,nu:28,nv:10,hole:hC}).translate(ox,3,oz));if(d>0)cD.push(lathe({rFn:()=>2.3,H:7,nu:14,nv:1}).translate(ox,3,oz));
   if(hC)for(let k=0;k<12;k++){const th=(k+.5)/12*TAU;if(!hC((k+.5)/12,3.5))continue;domRoom([140+ox+3.4*Math.cos(th),3.3,oz+3.4*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],1.1,6.6,d,140+l);}
   kput(d>0?'ringR':'ringW',[140+ox,10,oz],qEuler(Math.PI/2,0,0),[3.7,3.7,2],null);
   // floor and domed cap: each lobe was a bare tube on a single column, open
   // at the top and at the bottom.
   kput('slab',[140+ox,3,oz],null,[3.7,.5,3.7],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
   if(!(d>0&&l===2))cS.push(lathe({rFn:y=>3.7*Math.sqrt(clamp(1-Math.pow(y/2.6,2),0,1)),H:2.6,nu:20,nv:6}).translate(ox,10,oz));
   for(let yy=1.5;yy<6;yy+=2.6)for(let k=-1;k<=1;k++){const th=a+k*.55;civWin(d>0?'ovalD':'ovalI',[140+ox+3.6*Math.cos(th),3+yy,oz+3.6*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.55,.8,.8],null);}}
  meshMerged(cS,skin,P);meshMerged(cD,MAT.dark,P);kput('slab',[140,10.2,0],null,[2.8,.5,2.8],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));kput('archOpen',[140-2.6,1.8,0],qFacing([-1,0,0]),[.28,.36,1],null);kput('slab',[132,.2,0],null,[2.5,.4,2.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  stripRing(140,8,0,2.2,d,8);if(d>0)mossOnRing(140,.3,0,7,12,1.1);KOFF=[gx,0,gz];}
 figures(50,14,4,4);KOFF=[0,0,0];return G;}

