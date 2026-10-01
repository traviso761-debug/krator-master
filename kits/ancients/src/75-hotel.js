// ================================================================= HOTEL — "the Terraces"
function buildHotel(scene,gx,gz,d){reseed(9250+d);KOFF=[gx,0,gz];const SM=skyShardMark();const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Hotel — the Terraces ('+STATE(d)+')',x:0,z:0,r:110,h:80});
 const NS=14,SH=4.2,R=90,a0=-.9,a1=.9;const depth=f=>34-f*1.9;   // crescent, each storey shallower (terraces step back uphill)
 // WHAT WAS OVERHANGING WHAT — three separate radii that were never derived
 // from each other, on a plan where each storey steps back 1.9 m:
 //   * the back wall of storey f stood at R-depth(f)+1 and the terrace slab
 //     over it started at R-depth(f+1) = R-depth(f)+1.9, so every wall head
 //     finished 0.9 m short of the slab it was meant to carry — a continuous
 //     open slot, 165 m of arc, on all thirteen upper storeys;
 //   * the 1 m of slab inboard of each wall was therefore a lip cantilevered
 //     over that slot, resting on nothing;
 //   * and the six garden planters on every even terrace sat at
 //     R-depth(f)-4, FOUR METRES inboard of the inner edge of the very slab
 //     they stand on: 36 ten-metre hedges hanging in the open court, the
 //     highest of them fifty metres up with nothing at all beneath them.
 // Now the three are one chain: a wall stands on its own slab, the slab above
 // laps 1.2 m over it (a real eaves instead of a gap), the planters sit on the
 // 3.1 m of terrace that leaves, and a parapet closes its inner edge.
 const wallR=f=>R-depth(Math.min(f,NS-1));       // back wall of storey f
 const deckR=f=>f>0?wallR(f-1)-1.2:wallR(0)-2;   // inner edge of the slab over it
 // And in the ruin, a storey never survives its own support: `gone` was rolled
 // per level, so level 14 could stand with level 13 gone under it.
 let cutTop=NS+1;
 if(d>0)for(let f=NS-2;f<=NS;f++){if(rng()<.6&&f<cutTop)cutTop=f;}
 // THE EAST HORN HAS COME DOWN (level 1). Losing the top storey or two left
 // the ruin's silhouette the intact one; now the last quarter of the crescent
 // has collapsed in a stepped slope, storey by storey from the 13th down to
 // the 3rd at the horn's end. A storey is lost where f >= fl(u); a slab only
 // where f > fl(u), so the highest surviving storey keeps its roof.
 const fl=u=>d===1&&u>.72?3+Math.floor((1-u)/.28*10*(.85+.3*fbm(u*9,1,2041,2))):99;
 const hConc=[],hBrick=[],hDark=[];   // one mesh per material for the whole crescent
 for(let f=0;f<=NS;f++){const y=f*SH;if(f>=cutTop)continue;
  hConc.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(deckR(f),R+1.5,v);return[Math.sin(a)*r,y,Math.cos(a)*r-R*.7];},80,3,{hole:d>0?(u,v)=>fbm(u*12,f,2000+f,2)<.14||f>fl(u):null}));
  if(f<NS){const WR=wallR(f);const rf=R-.8;
   if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*rf,y+.5+v*(SH-.9),Math.cos(a)*rf-R*.7];},80,1,{}),MAT.glass,G);
   else hDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*(rf-.5),y+.5+v*(SH-.9),Math.cos(a)*(rf-.5)-R*.7];},60,1,{hole:(u,v)=>fbm(u*9,f,2010,2)<.35||f>=fl(u)}));
   // full storey height, so the wall meets the slab under it and the slab over
   // it instead of floating half a metre clear of both
   const lost=u=>f>=fl(u);
   hBrick.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*WR,y+.2+v*SH,Math.cos(a)*WR-R*.7];},60,1,{uS:20,hole:d===1?u=>lost(u):null}));
   hDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(WR,R-1,v);return[Math.sin(a)*r,y+.4,Math.cos(a)*r-R*.7];},40,1,{hole:d===1?u=>lost(u):null}));
   for(let k=0;k<=24;k++){const a=lerp(a0,a1,k/24);if(lost(k/24)){if(k<24)rng();continue;}kput(d>0?'mullR':'mullW',[Math.sin(a)*rf,y+SH/2,Math.cos(a)*rf-R*.7],qEuler(0,a,0),[.5,SH-.8,.5],null);
    if(k<24){const lit=d>0?rng()<.12:rng()<.7;kput('strip',[Math.sin(a+.035)*(rf-1.5),y+SH-.6,Math.cos(a+.035)*(rf-1.5)-R*.7],qEuler(0,a+.035,0),[4,1,1],lit?WARM:DEAD);}}
   // balcony parapet with planters; the terrace behind (roof of the storey below is the terrace of this one)
   for(let k=0;k<24;k++){const a=lerp(a0,a1,(k+.5)/24);if(lost((k+.5)/24))continue;kput(BOXC(d),[Math.sin(a)*(R+1),y+.9,Math.cos(a)*(R+1)-R*.7],qEuler(0,a,0),[6.4,1,.4],null);
    if(d>0||rng()<.4)kput('hedge',[Math.sin(a)*(R+.4),y+1.3,Math.cos(a)*(R+.4)-R*.7],qEuler(0,a,0),[5.5,.7,.9],new THREE.Color().setHSL(rr(.25,.33),.45,d>0?.16:.28));}
   // The court elevation was thirteen storeys of blank brick — the convex face
   // has a full curtain wall and the concave one had not one opening.
   for(let k=0;k<24;k++){const a=lerp(a0,a1,(k+.5)/24);if(lost((k+.5)/24))continue;
    kput(d>0?'winSmD':'winSmI',[Math.sin(a)*(WR-.35),y+2.1,Math.cos(a)*(WR-.35)-R*.7],qFacing([-Math.sin(a),0,-Math.cos(a)]),[1.5,1.5,1],null);
    // MOULDINGS (round 2): a projecting sill under each court window and a
    // hood over it, so the brick elevation has a shadow line per opening.
    // Shared-code round: the shared moulding(), following the wall's curve
    // (they were straight boxes on a curved wall), a weathered sill with a drip
    // and a label hood, merged into the concrete mesh (no instances, no calls).
    const ws=WR-.01,hw=1.3/ws,cw=k=>t=>{const b=a+k*hw*(1-2*t);return[-Math.sin(b),0,-Math.cos(b)];},
     arcAt=(yy,k)=>t=>{const b=a+k*hw*(1-2*t);return[Math.sin(b)*ws,yy,Math.cos(b)*ws-R*.7];};
    hConc.push(moulding(MOULD.sill(.75,.24),arcAt(y+.34,.93),{wn:cw(.93),nu:3,up:[0,1,0],caps:true}));
    hConc.push(moulding(MOULD.hood(.85,.3),arcAt(y+3.6,1),{wn:cw(1),nu:3,up:[0,1,0],caps:true}));}
   // terrace: a parapet on the inner edge of the slab, planters standing on it
   if(f>0){const pr=deckR(f)+.35,pl=pr*(a1-a0)/24*.94;
    for(let k=0;k<24;k++){const a=lerp(a0,a1,(k+.5)/24);if(lost((k+.5)/24))continue;
     kput(BOXC(d),[Math.sin(a)*pr,y+.6,Math.cos(a)*pr-R*.7],qEuler(0,a,0),[pl,1.2,.4],null);}
    if(f%2===0)for(let k=0;k<6;k++){const a=lerp(a0,a1,(k+.5)/6);const r=WR-1.5;if(lost((k+.5)/6))continue;
     kput('hedge',[Math.sin(a)*r,y+.9,Math.cos(a)*r-R*.7],qEuler(0,a,0),[10,1,1.6],new THREE.Color().setHSL(.3,.4,d>0?.15:.26));}}}}
 meshMerged(hConc,CONC(d),G);meshMerged(hBrick,MAT.brick,G);meshMerged(hDark,MAT.dark,G);
 // (0,-R*.7) is the crescent's centre of curvature, not the builder's origin —
 // without it the ledge sampler ranks the two HORNS as the outermost points
 // and hangs every vine and every water stain off the ends of the building.
 if(d>0){mossOnSurface(hConc,0,0,0,170,2.2);vinesFromLedge(hConc,0,0,0,70,18,0,-R*.7);stainsFromLedge(hConc,0,0,0,52,12,0,-R*.7);}
 // THE LIFT TOWERS at the horns were blank hyperboloids with no openings and no
 // top, and read as cooling towers. Now a fluted shaft that tapers, a glazed
 // lift slot facing the court storey by storey, stair windows on the other
 // three faces, a banding ring every fourth storey, a machine-room head with
 // its lid (gone on the ruin, which ends the shaft ragged). Each stands in the
 // end of its horn, so it needs no bridge to the storeys.
 const HT=NS*SH+6,rT=y=>8.4-1.6*clamp(y/HT,0,1);
 for(const s of [-1,1]){const a=s*(a1+.05),tx=Math.sin(a)*(R-14),tz=Math.cos(a)*(R-14)-R*.7;
  const tH=d===1?HT-rr(8,16):HT;
  mesh(lathe({rFn:rT,H:tH,flutes:8,amp:.06,sharp:3,nu:32,nv:14,hole:holeFn(d*.5,2020+s,d===1?tH:null,2.5)}),CONC(d),G,tx,0,tz);
  const inn=[-Math.sin(a),0,-Math.cos(a)],out=[Math.sin(a),0,Math.cos(a)],tan=[Math.cos(a),0,-Math.sin(a)];
  for(let f=0;f<NS;f++){const y=f*SH+SH/2+.4;if(y>tH-3)break;const r=rT(y)*1.065;
   kput(d>0?'paneD':'pane',[tx+inn[0]*(r+.15),y,tz+inn[2]*(r+.15)],qFacing(inn),[2.6,SH-.9,1],null);
   for(const n of (f%2?[out]:[tan,[-tan[0],0,-tan[2]]]))kput(d>0?'winSmD':'winSmI',[tx+n[0]*(r+.1),y,tz+n[2]*(r+.1)],qFacing(n),[1.1,1.3,1],null);
   if(f%4===3)kput(d>0?'ringR':'ringW',[tx,f*SH+.4,tz],qEuler(Math.PI/2,0,0),[rT(f*SH)*1.065+.1,rT(f*SH)*1.065+.1,4],null);
  }
  if(d!==1){kput(SLABC(d),[tx,HT+.5,tz],null,[rT(HT)+1.4,1,rT(HT)+1.4],null);
   kput(BOXC(d),[tx,HT+4,tz],qEuler(0,a,0),[8.4,6,8.4],null);
   kput(SLABC(d),[tx,HT+7.4,tz],null,[6.6,.8,6.6],null);
   for(const n of [inn,out,tan,[-tan[0],0,-tan[2]]])kput(d>0?'paneD':'pane',[tx+n[0]*4.25,HT+4,tz+n[2]*4.25],qFacing(n),[5.4,2.2,1],null);
   if(d===0)kput('strip',[tx+out[0]*(rT(HT)+1.5),HT+.5,tz+out[2]*(rT(HT)+1.5)],qFacing(out),[6,1,1],WARM);}}
 // THE SKY LOBBY. First a 44 m dome floating over the pool deck, then a 14 m
 // cupola on a drum, which was too small for the idea: the top slab is only
 // ~12 m deep, which is all a 1.9 m setback per storey can leave, so a dome was
 // the wrong form for the space. It is now a long glazed barrel vault that
 // follows the arc of the top slab for 105 m, on a concrete kerb, with a rib
 // every 4.4 m and solid end walls. The ruin keeps its ribs, some of them, and
 // dead glass in rags between them.
 const rTop=Math.min(NS,cutTop-1),roofY=rTop*SH;
 {const rIn=deckR(rTop),rOut=R+1.5,rm=(rIn+rOut)/2,wP=(rOut-rIn)*.64,hP=6.4,aP=.62,KB=1.2,aL=-aP,aR=d===1?Math.min(aP,lerp(a0,a1,.68)):aP;
  const PV=(u,v)=>{const a=lerp(aL,aR,u),t=v*Math.PI,r=rm-Math.cos(t)*wP/2,y=roofY+KB+Math.sin(t)*hP;return[Math.sin(a)*r,y,Math.cos(a)*r-R*.7];};
  const pv=[];
  for(const e of [-1,1])pv.push(gridSurface((u,v)=>{const a=lerp(aL,aR,u),r=rm+e*wP/2;return[Math.sin(a)*r,roofY+v*KB,Math.cos(a)*r-R*.7];},48,1,{uS:12}));
  for(const u0 of [0,1])pv.push(gridSurface((w,v)=>{const a=lerp(aL,aR,u0),c=[Math.sin(a)*rm,roofY+KB,Math.cos(a)*rm-R*.7],p=PV(u0,v);
   return[lerp(c[0],p[0],w),lerp(c[1],p[1],w),lerp(c[2],p[2],w)];},2,12,{}));
  for(const u0 of [0,1])pv.push(gridSurface((w,v)=>{const a=lerp(aL,aR,u0),r=rm+(w*2-1)*wP/2;return[Math.sin(a)*r,roofY+v*KB,Math.cos(a)*r-R*.7];},2,1,{}));
  meshMerged(pv,CONC(d),G);
  if(d===0)mesh(gridSurface(PV,48,10,{}),MAT.glass,G);
  else mesh(gridSurface(PV,48,10,{hole:(u,v)=>fbm(u*9,v*3,2031,2)<(d===1?.62:.4)}),MAT.dark,G);
  for(let k=0;k<=24;k++){if(d===1&&rng()<.3)continue;const u=k/24;
   for(let i=0;i<8;i++){if(d===1&&i>=5&&rng()<.5)break;beam(d>0?'mullR':'mullW',PV(u,i/8),PV(u,(i+1)/8),1.1,1.1);}}
  for(let k=0;k<24;k++){const a=lerp(aL,aR,(k+.5)/24),r=rm+wP/2+1.6;
   if(d===0||rng()<.5)kput('hedge',[Math.sin(a)*r,roofY+.5,Math.cos(a)*r-R*.7],qEuler(0,a,0),[3.2,1,1],new THREE.Color().setHSL(rr(.25,.33),.4,d>0?.15:.27));}
  if(d===0)for(let k=0;k<12;k++){const a=lerp(aL,aR,(k+.5)/12),r=rm;
   kput('strip',[Math.sin(a)*r,roofY+KB+hP-.6,Math.cos(a)*r-R*.7],qEuler(0,a,0),[6,1,1],WARM);}}
 // THE PORTE-COCHÈRE. It was a 40 x 24 m canopy on four legs converging to
 // r = 6-14 under its middle: a 20 m cantilever each way that would not stand.
 // Now it laps back onto the curtain wall and stands on a row of four columns
 // along its front edge, with a fascia.
 const zF=R-R*.7-.5,zC=zF+27;
 kput(SLABC(d),[0,.3,0],null,[130,.6,130],null);kput('archOpen',[0,4,R-R*.7+2],qFacing([0,0,1]),[1,.9,2],null);
 kput(BOXC(d),[0,7.6,(zF+zC)/2],null,[40,.9,zC-zF],null);
 kput(BOXC(d),[0,8.4,zC-.4],null,[40.6,1.6,.8],null);
 for(const x of [-18,-6.5,6.5,18])kput(d>0?'colR':'colW',[x,.6,zC-2],null,[1.1,6.6,1.1],null);
 if(d===0)for(let k=-3;k<=3;k++)kput('strip',[k*5.5,7.1,(zF+zC)/2],null,[3,1,1],WARM);
 // THE POOL DECK was a bare 130 m disc with one pool, and that pool stood in
 // the foot of the west lift tower. Now: a lagoon following the arc of the
 // court, loungers and parasols round it, trees in the court; a lap pool, a
 // fountain and a hedged parterre either side of the drive on the south lawn.
 // The ruin's water has silted to a green floor and its hedges have run wild.
 const CZ=-R*.7,deck=.62,lg=[];
 {const r0=30,r1=40,aL=.62;
  mesh(gridSurface((u,v)=>{const a=lerp(-aL,aL,u),r=lerp(r0,r1,v);return[Math.sin(a)*r,deck+.08,Math.cos(a)*r+CZ];},40,2,{}),d===0?MAT.water:MAT.turfR,G);
  mesh(gridSurface((u,v)=>{const a=lerp(-aL,aL,u),r=lerp(r0,r1,v);return[Math.sin(a)*r,deck-.9,Math.cos(a)*r+CZ];},40,2,{}),MAT.dark,G);
  for(const r of [r0-.5,r1+.5])lg.push(gridSurface((u,v)=>{const a=lerp(-aL-.012,aL+.012,u),rr2=r+(v-.5);return[Math.sin(a)*rr2,deck+.35,Math.cos(a)*rr2+CZ];},40,1,{}));
  for(const e of [-1,1])lg.push(gridSurface((u,v)=>{const a=e*(aL+.006),rr2=lerp(r0-1,r1+1,u),w=(v-.5)*.9;return[Math.sin(a)*rr2+Math.cos(a)*w,deck+.35,Math.cos(a)*rr2-Math.sin(a)*w+CZ];},2,1,{}));
  meshMerged(lg,CONC(d),G);
  for(let k=0;k<22;k++){const a=lerp(-aL,aL,(k+.5)/22),r=(k%2?r1+5:r0-5),x=Math.sin(a)*r,z=Math.cos(a)*r+CZ;
   if(d>0){if(rng()<.5)kput('rubble',[x,deck+.3,z],qEuler(rr(-.4,.4),rng()*3,rr(-.4,.4)),[2,.4,.8],null);continue;}
   kput('boxW',[x,deck+.25,z],qEuler(0,a,0),[2.1,.4,.8],null);
   if(k%3===0){kput('mullW',[x,deck+1.4,z],null,[.2,2.6,.2],null);kput('skDome',[x,deck+2.6,z],null,[1.9,.5,1.9],null);}}
  trees(0,CZ,6,22,d>0?10:6);
  for(let k=0;k<8;k++){const a=k/8*TAU;kput('planter',[Math.cos(a)*16,deck+.5,Math.sin(a)*16+CZ],qEuler(0,-a,0),[4,1,2],null);}}
 // the south lawn: a lap pool to the west, a fountain to the east, a parterre
 // in between either side of the drive
 {const lp=[-60,68];
  kput(BOXC(d),[lp[0],deck+.2,lp[1]],null,[28,.4,14],null);
  kput('boxD',[lp[0],deck+.25,lp[1]],null,[25,.4,11],null);
  if(d===0)kput('pane',[lp[0],deck+.5,lp[1]],qEuler(Math.PI/2,0,0),[25,11,1],null);
  else kput('moss',[lp[0],deck+.45,lp[1]],null,[11,.4,5],new THREE.Color().setHSL(.24,.4,.12));
  const fp=[60,68];
  kput(SLABC(d),[fp[0],deck+.4,fp[1]],null,[11,.8,11],null);
  if(d===0){mesh(lathe({rFn:()=>10,H:.1,nu:32,nv:1}),MAT.water,G,fp[0],deck+.75,fp[1]);
   kput(SLABC(d),[fp[0],deck+2,fp[1]],null,[3,3,3],null);kput(SLABC(d),[fp[0],deck+4,fp[1]],null,[4.2,.5,4.2],null);}
  else{kput('moss',[fp[0],deck+.85,fp[1]],null,[8,.4,8],new THREE.Color().setHSL(.25,.4,.13));kput(SLABC(d),[fp[0],deck+1.4,fp[1]],qEuler(.5,0,.3),[3,1.8,3],null);}
  // the parterre: beds edged in low clipped box, a lawn in each; the ruin's
  // beds have grown out into shapeless thicket
  for(const sx of [-1,1])for(let row=0;row<4;row++)for(let c=0;c<3;c++){const x=sx*(24+c*7),z=62+row*12;
   if(Math.hypot(x,z)>118)continue;if(d>0&&rng()<.25)continue;
   if(d>0){const sz=rr(1.2,1.8);kput('hedge',[x,deck+.6*sz,z],qEuler(0,rr(-.3,.3),0),[5.4*sz,1.2*sz,9*sz],new THREE.Color().setHSL(rr(.25,.33),.42,.14));continue;}
   kput('hedge',[x,deck+.05,z],null,[5.4,.1,9.6],new THREE.Color().setHSL(.26,.35,.33));
   for(const e of [-1,1]){kput('hedge',[x+e*2.9,deck+.45,z],null,[.6,.9,10.2],new THREE.Color().setHSL(.3,.45,.16));
    kput('hedge',[x,deck+.45,z+e*4.8],null,[5.2,.9,.6],new THREE.Color().setHSL(.3,.45,.16));}}}
 // the collapsed horn lies at its own foot: a talus of rubble and broken slabs
 if(d===1){const aH=lerp(a0,a1,.88),hx=Math.sin(aH)*(R-12),hz=Math.cos(aH)*(R-12)-R*.7;rubbleRing(hx,.6,hz,4,34,120,4.2);
  for(let k=0;k<9;k++){const a=lerp(a0,a1,rr(.74,.99)),r=rr(R-30,R+8);
   kput(SLABC(d),[Math.sin(a)*r,rr(1,6),Math.cos(a)*r-R*.7],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),[rr(4,9),.7,rr(3,7)],null);}}
 if(d>0){scatterMoss(0,.6,0,20,120,80,2.4);rubbleRing(0,.6,R*.3-R*.7,10,70,40,2.5);trees(0,0,110,160,12);}
 if(d>0)skyShards(SM,d===3?.25:.5);   // glass teeth in the dead openings (52-sky-abc.js)
 figures(0,60,6,12);KOFF=[0,0,0];return G;}

