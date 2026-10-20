 // ---- the courtyard plinth -------------------------------------------------
 // Its outline is the lobing function everything else inherits; at the back it
 // is buried 18 m INTO the cavern's rock wall, because a plinth that stops two
 // metres short of the rock leaves a 100 m slot behind it that no camera can be
 // kept out of.
 const PX2=(th,r)=>PCX+Math.cos(th)*r, PZ2=(th,r)=>PCZ+Math.sin(th)*r;
 // Every parapet, maisonette, balcony and stair is the same kit box, and a few
 // thousand of them in one material came back as a white ziggurat. One warm
 // stone band, spread over lightness, is what turns the stack back into a town.
 const stoneC=()=>new THREE.Color().setHSL(rr(.06,.11),rr(.05,.16),
  dd?rr(.13,.24):rr(.23,.38));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RPLZ,Rplinth(th),v);
   return[PX2(th,r),PY,PZ2(th,r)];},128,13,{uS:60,vS:13}));
 SH.push(gridSurface((u,v)=>{const th=u*TAU,r=Rplinth(th);
   return[PX2(th,r),lerp(PY,hasT(th)?TY(1):SHELF-4,v),PZ2(th,r)];},128,8,{uS:60,vS:9}));
 SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(Rplinth(th),RPLZ*.5,v);
   return[PX2(th,r),SHELF-4,PZ2(th,r)];},64,6,{uS:30,vS:6}));   // the plinth's own base
 // the sunken plaza and its steps
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=(RPLZ-7)*v;
   return[PX2(th,r),PY-5.4,PZ2(th,r)];},64,5,{uS:22,vS:5}));
 for(let s2=0;s2<4;s2++){const r=RPLZ-s2*1.8,yy=PY-1.35-s2*1.35;
  GRD.push(gridSurface((u,v)=>{const th=u*TAU;return[PX2(th,lerp(r,r-1.8,v)),yy,PZ2(th,lerp(r,r-1.8,v))];},64,1,{uS:22,vS:1}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU;return[PX2(th,r-1.8),lerp(yy,yy-1.35,v),PZ2(th,r-1.8)];},64,1,{uS:22,vS:1}));}
 if(!dd)lring(PCX,PY-4.6,PCZ,RPLZ-9,30);
 // PAVING. A 236 m disc of one concrete reads as a pond from overhead, and the
 // plan is one of the three drawings. Four concentric joint bands and a darker
 // promenade ring give it a grain and mark the ring the sheet labels.
 // The bands go in the WALL material, not the deck's: a joint the same colour
 // as the paving is not a joint. Pale kerb lines on a dark deck.
 for(let b=0;b<5;b++){const rb=RPLZ+6+b*((RPL-RPLZ)/5);
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=Math.min(rb+v*1.9,Rplinth(th)-1);
    return[PX2(th,r),PY+.24,PZ2(th,r)];},110,1,{uS:50,vS:1,
    hole:(u,v)=>rb>Rplinth(u*TAU)-3}));}
 for(let i=0;i<40;i++){const th=i/40*TAU;
  SH.push(gridSurface((u,v)=>{const r=lerp(RPLZ+4,Rplinth(th)-2,u);
    return[PX2(th+v*.007,r),PY+.24,PZ2(th+v*.007,r)];},12,1,{uS:20,vS:1}));}

 // ---- the three towers -----------------------------------------------------
 // Round, as the plan draws them, and placed so no tower can overhang the
 // plinth however the lobing falls: the radius from the plaza centre is clipped
 // against the plinth's own outline at that bearing.
 const TW=[];
 TWR.forEach((T,ti)=>{
  const rad=Math.min(64,Rplinth(T.a)-T.r-10);
  const tx=PX2(T.a,rad),tz=PZ2(T.a,rad);
  /* the tower, its crown and its finial (26 m over its top) stay 4 m under the rock roof over them (the owner's quality
     pass, 2026-10-20: the residential tower at the back went through the vault) */
  const roof=roofY(tx,tz),h=roof>0?Math.max(40,Math.min(T.h,roof-PY-30)):T.h,rFn=y2=>T.r*(1-.11*(y2/h)+.05*Math.sin(Math.PI*y2/h));
  TW.push({x:tx,z:tz,r:T.r,h:h,k:T.k,n:T.n,y0:PY});
  const brk=dd&&ti===1?h*.62:null;                       // the cultural centre has lost its top
  const cutH=brk||h;
  SH.push(lathe({rFn:rFn,H:h,cut:cutH,jag:brk?7:0,flutes:16,amp:.05,sharp:2,nu:56,nv:26,
   seed:9606+ti,hole:holeFn(dd*.7,9607+ti,brk?cutH:null,1.2)}).translate(tx,PY,tz));
  DK.push(lathe({rFn:y2=>rFn(y2)-5,H:cutH-2,nu:28,nv:12}).translate(tx,PY,tz));
  // floor plates, so a hole in a ruined tower looks into storeys
  for(let p=1;p*7.8<cutH-4;p++)
   kput('slabCR',[tx,PY+p*7.8,tz],null,[rFn(p*7.8)-5.6,.7,rFn(p*7.8)-5.6],new THREE.Color(0x24262a));
  // glazing bands and the dwelling fabric between them
  const nby=Math.max(2,Math.round(cutH/26));
  for(let b=0;b<nby;b++){const by=6+b*(cutH-10)/nby;
   const rr2=rFn(by);
   if(!dd)mesh(lathe({rFn:()=>rr2*1.015,H:5.4,nu:36,nv:2}),MAT.glass,G,tx,PY+by,tz);
   else mesh(lathe({rFn:()=>rr2*1.01,H:5.4,nu:24,nv:2}),MAT.aiVoid,G,tx,PY+by,tz);
   const nm=Math.round(TAU*rr2/5.2);
   for(let m=0;m<nm;m++){const th=m/nm*TAU;
    kput(dd?'mullR':'mullW',[tx+Math.cos(th)*rr2*1.03,PY+by+2.7,tz+Math.sin(th)*rr2*1.03],
     qEuler(0,-th,0),[1,5.4,1],null);}
   if(!dd)lring(tx,PY+by+5.9,tz,rr2*1.02,Math.round(TAU*rr2/9));}
  const nc=Math.round(TAU*T.r/6.4),nrw=Math.floor((cutH-10)/4.2);
  for(let j=0;j<nrw;j++){const cy2=8+j*4.2;
   if(cy2>cutH-5)break;
   const rr2=rFn(cy2);
   for(let i=0;i<nc;i++){const th=(i+((j%2)?.3:.7))/nc*TAU;
    if(rng()>(dd?.62:.86))continue;
    kput('aiPane',[tx+Math.cos(th)*rr2*1.02,PY+cy2,tz+Math.sin(th)*rr2*1.02],
     qFacing([Math.cos(th),0,Math.sin(th)]),[3.4,2.6,1],
     rng()<(dd?.04:.34)?litOf(T.k):ROOMC);
    if(rng()<(dd?.012:.03)){
     kput('aiBalc',[tx+Math.cos(th)*rr2,PY+cy2-1.6,tz+Math.sin(th)*rr2],
      qFacing([Math.cos(th),0,Math.sin(th)]),[4.4,2.2,3.0],stoneC());}}}
  // the crown: a gallery, a cap and a lantern
  if(!brk){const rt=rFn(h);
   for(let i=0;i<Math.round(TAU*rt/5);i++){const th=i/Math.round(TAU*rt/5)*TAU;
    kput(BX,[tx+Math.cos(th)*(rt+2.4),PY+h-4,tz+Math.sin(th)*(rt+2.4)],qEuler(0,-th,0),
     [TAU*rt/Math.round(TAU*rt/5)*1.05,5,5.6],stoneC());}
   kput('slabC',[tx,PY+h+1.4,tz],null,[rt*1.14,2.8,rt*1.14],new THREE.Color(dd?0x6d665c:0xcac4b8));
   SH.push(lathe({rFn:y2=>rt*.62*Math.pow(clamp(1-Math.pow(y2/16,2.1),0,1),.55)+.6,H:16,
    flutes:10,amp:.08,sharp:2,nu:26,nv:8,hole:holeFn(dd*.8,9610+ti,null,1.4)}).translate(tx,PY+h+2.8,tz));
   if(!dd){mesh(lathe({rFn:y2=>rt*.58*Math.pow(clamp(1-Math.pow(y2/16,2.1),0,1),.55)+.6,H:16,nu:20,nv:6}),
     MAT.glass,G,tx,PY+h+2.8,tz);
    kput('finial',[tx,PY+h+22,tz],null,[2.6,7,2.6],null);
    lring(tx,PY+h+3.6,tz,rt*.9,Math.round(TAU*rt/8));}}
  REGISTER({name:'Arcoindian I — '+T.n.toLowerCase()+' tower',x:tx,z:tz,r:T.r+8,y:PY-6,h:cutH+26});});
 // the promenade ring: a colonnade round the plaza, skipping anything a tower
 // is standing on
 {const np=Math.round(TAU*RPRM/9);
  for(let i=0;i<np;i++){const th=i/np*TAU,px3=PX2(th,RPRM),pz3=PZ2(th,RPRM);
   if(TW.some(t=>Math.hypot(px3-t.x,pz3-t.z)<t.r+5))continue;
   if(dd&&rng()<.34)continue;
   kput('aiPost',[px3,PY,pz3],null,[2.2,14.1,2.2],null);
   kput(BX,[px3,PY+14.7,pz3],qEuler(0,-th,0),[TAU*RPRM/np*1.05,1.3,3.1],null);}
  if(!dd)lring(PCX,PY+15.8,PCZ,RPRM,Math.round(TAU*RPRM/11));}

 // ---- the terraces ---------------------------------------------------------
 // Nine of them, stepping down and outward over 250 degrees, pinching out to
 // nothing where the plinth turns and runs back to the rock. tf() is what does
 // the pinching: at the flanks the nine risers collapse onto the plinth's own
 // wall, so the stack closes itself instead of showing nine cut ends.
 const CWX=6.4;
 /* THE STAIRS (the owner's quality pass, 2026-10-20). Terrace k's runs climb from its deck to terrace k-1's, every 17
    bays: two flights along the riser on its true tangent (the lobed plan is not a circle, so the radial bearing is not
    the wall's normal), a half landing, a landing at the foot and one at the head that crosses the riser's top onto the
    deck above through a gap in that deck's parapet. Chosen without a draw, so the terrace above can leave its gap. */
 const aiStairs=k2=>{if(k2<1||k2>NT)return [];const nb2=Math.max(24,Math.round(TAU*RT(k2-1,0)/CWX)),out=[];
  for(let i=5;i<nb2;i+=17){const th=(i+.5)/nb2*TAU,e=12/RT(k2-1,th);
   if(tf(th)<.4||tf(th-e*1.2)<.4||tf(th+e*1.2)<.4)continue;
   if(dd&&((i*13+k2*7)%10)>=5)continue;
   const r=RT(k2-1,th),pa=[PX2(th-.002,RT(k2-1,th-.002)),PZ2(th-.002,RT(k2-1,th-.002))],pb=[PX2(th+.002,RT(k2-1,th+.002)),PZ2(th+.002,RT(k2-1,th+.002))];
   const tl=Math.hypot(pb[0]-pa[0],pb[1]-pa[1]),t=[(pb[0]-pa[0])/tl,(pb[1]-pa[1])/tl];let n=[t[1],-t[0]];
   if(n[0]*Math.cos(th)+n[1]*Math.sin(th)<0)n=[-n[0],-n[1]];
   const p=[PX2(th,r),PZ2(th,r)];
   if(IMP&&Math.hypot(p[0]-IMP.x,p[1]-IMP.z)<IMP.r)continue;
   out.push({i:i,th:th,p:p,t:t,n:n,top:[p[0]+t[0]*11.6-n[0]*1.0,p[1]+t[1]*11.6-n[1]*1.0]});}
  return out;};
 const aiFlight=(S,y0)=>{const q=qFacing([S.t[0],0,S.t[1]]),at=(a,b)=>[S.p[0]+S.n[0]*(4.8+b)+S.t[0]*a,S.p[1]+S.n[1]*(4.8+b)+S.t[1]*a],h=TST/2;
  let a=at(-10,0);kput('aiStair',[a[0],y0,a[1]],q,[4.5,h,9],stoneC());
  a=at(0,0);kput(BX,[a[0],y0+h-.35,a[1]],q,[4.5,.7,2.2],stoneC());
  a=at(1,0);kput('aiStair',[a[0],y0+h,a[1]],q,[4.5,h,9],stoneC());
  a=at(11.6,-2.38);kput(BX,[a[0],y0+TST-.35,a[1]],q,[9.25,.7,3.2],stoneC());
  a=at(-11.2,0);kput(BX,[a[0],y0+.1,a[1]],q,[4.5,.2,2.4],stoneC());};
 for(let k=1;k<=NT;k++){const y0=TY(k),y1=TY(k-1),stK=aiStairs(k),gaps=aiStairs(k+1).map(S=>S.top);
  GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RT(k-1,th),RT(k,th),v);
    return[PX2(th,r),y0,PZ2(th,r)];},128,3,{uS:60,vS:4,
    hole:(u,v)=>{const th=u*TAU;if(tf(th)<.05)return true;
     const r=lerp(RT(k-1,th),RT(k,th),v);
     // the terraces the roof fall went through
     if(IMP&&Math.hypot(PX2(th,r)-IMP.x,PZ2(th,r)-IMP.z)<IMP.r*(.78-k*.045))return true;
     return dd&&fbm(Math.cos(th)*3+k,Math.sin(th)*3,9611,2)<.19;}}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=RT(k-1,th);
    return[PX2(th,r),lerp(y0,y1,v),PZ2(th,r)];},128,4,{uS:60,vS:5,
    hole:(u,v)=>tf(u*TAU)<.05}));
  // the outermost terrace's fascia, down to the rock shelf
  if(k===NT)SH.push(gridSurface((u,v)=>{const th=u*TAU,r=RT(k,th);
    return[PX2(th,r),lerp(y0,SHELF-3,v),PZ2(th,r)];},128,2,{uS:60,vS:3,
    hole:(u,v)=>tf(u*TAU)<.05}));
  // DWELLINGS on the riser: three storeys in 11.33 m, one home every 6.4 m of
  // frontage. Parameterised by ARC LENGTH, not by angle, or the homes crowd
  // together where the lobing pulls the outline in.
  const per=TAU*RT(k-1,0);
  const nb=Math.max(24,Math.round(per/CWX));
  for(let i=0;i<nb;i++){const th=(i+.5)/nb*TAU;
   if(tf(th)<.06)continue;
   const r=RT(k-1,th),px3=PX2(th,r),pz3=PZ2(th,r),N=[Math.cos(th),Math.sin(th)];
   const q=qFacing([N[0],0,N[1]]);
   for(let s2=0;s2<3;s2++){const cy2=y0+2.0+s2*3.6;
    if(rng()>(dd?.68:.94))continue;
    kput('aiPane',[px3+N[0]*.4,cy2,pz3+N[1]*.4],q,[s2?3.6:2.4,s2?2.3:3.0,1],
     rng()<(dd?.05:.30)?litOf(k>6?'res':'lw'):ROOMC);}
   if(rng()<(dd?.08:.17))kput('aiBalc',[px3+N[0]*.2,y0+5.2,pz3+N[1]*.2],q,[5.0,2.4,3.2],stoneC());
   if(!dd&&i%9===3)kput('strip',[px3+N[0]*1.1,y1-1.6,pz3+N[1]*1.1],q,[CWX*2.4,1.1,1.1],CYAN);
   // parapet on the deck in front
   if(i%2===0&&!gaps.some(g=>Math.hypot(g[0]-PX2(th,RT(k,th)-1.2),g[1]-PZ2(th,RT(k,th)-1.2))<per/nb*1.05+3)&&!(dd&&rng()<.3)){const r2=RT(k,th);
    kput(BX,[PX2(th,r2-1.2),y0+1.5,PZ2(th,r2-1.2)],qEuler(0,-th,0),[per/nb*2.1,3,2.2],stoneC());}
   // the stair run up to the terrace above (aiStairs)
   {const S=stK.find(S=>S.i===i);if(S)aiFlight(S,y0);}}
  // maisonettes, planting and people out on the deck
  const nd=26+k*2;
  for(let i=0;i<nd;i++){const th=rng()*TAU;
   if(tf(th)<.2)continue;
   const r=rr(RT(k-1,th)+4,RT(k,th)-3);
   const px3=PX2(th,r),pz3=PZ2(th,r);
   const roll=rng();
   if(roll<.34){const bh=rr(5,9);
    kput(BX,[px3,y0+bh*.5,pz3],qEuler(0,-th+rr(-.2,.2),0),[rr(5,11),bh,rr(4,7)],stoneC());
    for(let s3=-1;s3<=1;s3+=2)for(let c2=0;c2<2;c2++)
     kput('aiPane',[px3+Math.cos(th)*s3*.1+Math.cos(th)*s3*3.4,y0+2.6,pz3+Math.sin(th)*s3*3.4],
      qFacing([Math.cos(th)*s3,0,Math.sin(th)*s3]),[2.6,2.2,1],
      rng()<(dd?.05:.4)?litOf('res'):ROOMC);}
   else if(roll<.72)VEG.tree(px3,y0,pz3,i%3,rr(5,dd?12:8));
   else kput('hedge',[px3,y0+.9,pz3],qEuler(0,rng()*TAU,0),[rr(4,9),1.8,rr(1.6,3)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  if(!dd)for(let i=0;i<7;i++){const th=rng()*TAU;if(tf(th)<.25)continue;
   const r=rr(RT(k-1,th)+6,RT(k,th)-4),px3=PX2(th,r),pz3=PZ2(th,r);
   kput('figB',[px3,y0,pz3],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[px3,y0,pz3],null,1,new THREE.Color(0xc9a17e));}}
 // PLAYGROUNDS: two sunken courts bitten out of the wider terraces
 [[2.05,4],[5.05,7]].forEach((P,pi)=>{const th=P[0],k=P[1],y0=TY(k);
  const r=(RT(k-1,th)+RT(k,th))*.5,cx2=PX2(th,r),cz2=PZ2(th,r),cr=13;
  GRD.push(gridSurface((u,v)=>{const a=u*TAU,r2=cr*(1-v);
    return[cx2+Math.cos(a)*r2,y0-4.2,cz2+Math.sin(a)*r2];},24,4,{uS:10,vS:4}));
  SH.push(gridSurface((u,v)=>{const a=u*TAU;
    return[cx2+Math.cos(a)*cr,y0-4.2*v,cz2+Math.sin(a)*cr];},24,2,{uS:10,vS:2}));
  for(let i=0;i<12;i++){const a=i/12*TAU;
   if(dd&&rng()<.4)continue;
   kput(BX,[cx2+Math.cos(a)*(cr+2.2),y0+.7,cz2+Math.sin(a)*(cr+2.2)],qEuler(0,-a,0),[6,1.6,1.4],stoneC());}
  if(!dd)lring(cx2,y0-3.4,cz2,cr*.7,12);
  REGISTER({name:'Arcoindian I — playground '+(pi+1),x:cx2,z:cz2,r:cr+6,y:y0-6,h:14});});

 // ---- gardens and meeting areas on the plinth ------------------------------
 // GARDENS go against the rock face, where the sheet puts them: the back band
 // of the plinth, under the passage portals, in the deepest shade in the model.
 for(let i=0;i<(dd?120:96);i++){const th=rr(Math.PI*.98,Math.PI*2.02);
  if(tf(th)>.30)continue;
  const r=rr(RPRM+14,Rplinth(th)-8),px3=PX2(th,r),pz3=PZ2(th,r);
  if(rng()<.62)VEG.tree(px3,PY,pz3,i%3,rr(6,dd?16:11));
  else kput('hedge',[px3,PY+.9,pz3],qEuler(0,rng()*TAU,0),[rr(5,16),1.9,rr(2,5)],
   new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
 const MEET=[];
 for(let i=0;i<5;i++){const th=Math.PI*(1.08+i*.19);
  const r=Rplinth(th)*.80,px3=PX2(th,r),pz3=PZ2(th,r);
  // a pavilion standing in a tower is exactly the class of placement error no
  // invariant can see, so it is tested for rather than hoped about
  if(TW.some(t=>Math.hypot(px3-t.x,pz3-t.z)<t.r+20))continue;
  MEET.push([px3,pz3]);
  const hR=y2=>15*Math.pow(clamp(1-Math.pow(y2/21,2.1),0,1),.55)+.6;
  SH.push(lathe({rFn:hR,H:21,flutes:10,amp:.09,sharp:2,nu:24,nv:8,
   hole:holeFn(dd*.8,9613+i,null,1.5)}).translate(px3,PY,pz3));
  if(!dd){kput('finial',[px3,PY+25,pz3],null,[2.2,6,2.2],null);
   for(let j=0;j<8;j++){const a=j/8*TAU;
    kput('winBigI',[px3+Math.cos(a)*hR(7)*1.04,PY+7,pz3+Math.sin(a)*hR(7)*1.04],
     qFacing([Math.cos(a),0,Math.sin(a)]),[1.1,1.1,1],null);}}}
 if(MEET.length)REGISTER({name:'Arcoindian I — meeting areas',x:MEET[0][0],z:MEET[0][1],r:30,y:PY-6,h:40});
 if(!dd)for(let i=0;i<26;i++){const th=rng()*TAU,r=rr(RPLZ+4,Rplinth(th)-10);
  kput('figB',[PX2(th,r),PY,PZ2(th,r)],qEuler(0,rng()*TAU,0),1,
   new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[PX2(th,r),PY,PZ2(th,r)],null,1,new THREE.Color(0xc9a17e));}

 // ---- the satellite pods ---------------------------------------------------
 // RESEARCH, out on causeways. They stand on detached stacks of the same rock
 // the cliff is made of, because a 190 m causeway needs something at the far
 // end of it and a pier rising 240 m off the plain would be a bigger structure
 // than the pod it carried.
 // Spaced so no stack stands in front of the station, which the first cut put
 // 104 m directly behind stack II: from any camera out on the plain the whole
 // transport level was hidden behind a 240 m butte.
 const POD=[{x:-430,z:58,ty:252,sr:48,pr:32,nm:'Research pod I'},
            {x:-238,z:142,ty:238,sr:44,pr:29,nm:'Research pod II'},
            {x:80,z:40,ty:258,sr:40,pr:26,nm:'Research pod III'}];
 POD.forEach((P,pi)=>{
  const down=dd&&pi===1;
  // A lathe whose radius varies only with height is a cooling tower, which is
  // exactly what the first cut of these looked like. The stack is therefore a
  // gridSurface with noise in BOTH the bearing and the height: flutes, a
  // shoulder and a fluted talus, so it reads as a weathered stack of the same
  // bedded rock the cliff behind it is made of.
  const stR=(a,t)=>P.sr*(1.34-.46*Math.pow(t,.7))
    *(1+.15*(fbm(2.6*Math.cos(a),2.6*Math.sin(a)+t*3.4,9614+pi,3)*2-1)
       +.06*Math.sin(a*7+t*4)+.05*(fbm(9*Math.cos(a),9*Math.sin(a),9625,2)*2-1))
    +3.8*Math.round(Math.sin(t*27+pi)*2)/2            // bedding benches, as on the cliff
    +26*Math.pow(clamp(1-t/.24,0,1),1.8);
  ROCK.push(gridSurface((u,v)=>{const a=u*TAU;
    return[P.x+Math.cos(a)*stR(a,v),v*P.ty,P.z+Math.sin(a)*stR(a,v)];},
    40,26,{uS:P.sr/7,vS:P.ty/16}));
  // The cap starts on the stack's OWN rim radius, not on a nominal circle: a
  // flat disc laid on a noisy rim leaves a ring of daylight all the way round.
  ROCK.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(stR(a,1),0,Math.pow(v,.9));
    return[P.x+Math.cos(a)*r,P.ty,P.z+Math.sin(a)*r];},40,5,{uS:14,vS:5}));
  for(let i=0;i<34;i++){const a=rng()*TAU,t=Math.pow(rng(),1.6),r=P.sr*(1.36+t*1.5),sc=rr(3,14)*(1-t*.4);
   kput('aiBlock',[P.x+Math.cos(a)*r,sc*.4+(1-t)*10,P.z+Math.sin(a)*r],
    qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.05,.10),rr(.13,.32),rr(.12,.26)));}
  // the pod: a hexagonal drum in two storeys with a ring gallery
  const PH=P.pr*1.15;
  for(let s2=0;s2<2;s2++){const sy=P.ty-1+s2*(PH*.5),sr2=P.pr*(s2?.86:1);
   SH.push(gridSurface((u,v)=>{const a=u*TAU;
     return[P.x+Math.cos(a)*hexR(sr2,a),lerp(sy,sy+PH*.5,v),P.z+Math.sin(a)*hexR(sr2,a)];},
     36,5,{uS:12,vS:5,hole:holeFn(dd*(down?1.1:.55),9615+pi+s2,null,1.2)}));
   GRD.push(gridSurface((u,v)=>{const a=u*TAU,r=hexR(sr2,a)*(1-v);
     return[P.x+Math.cos(a)*r,sy+PH*.5,P.z+Math.sin(a)*r];},36,4,{uS:12,vS:4}));
   for(let i=0;i<Math.round(TAU*sr2/5.4);i++){const a=(i+.5)/Math.round(TAU*sr2/5.4)*TAU;
    const rr3=hexR(sr2,a);
    if(rng()>(down?.35:dd?.6:.9))continue;
    kput('aiPane',[P.x+Math.cos(a)*rr3*1.02,sy+PH*.26,P.z+Math.sin(a)*rr3*1.02],
     qFacing([Math.cos(a),0,Math.sin(a)]),[4.0,3.2,1],
     rng()<(dd?.04:.4)?litOf('rsc'):ROOMC);}
   if(!dd)lring(P.x,sy+PH*.5+1.2,P.z,sr2*.95,Math.round(TAU*sr2/9));}
  SH.push(lathe({rFn:y2=>P.pr*.55*Math.pow(clamp(1-Math.pow(y2/15,2.0),0,1),.5)+.6,H:15,
   nu:24,nv:7,hole:holeFn(dd*.8,9618+pi,null,1.3)}).translate(P.x,P.ty-1+PH,P.z));
  if(!dd)kput('finial',[P.x,P.ty+PH+17,P.z],null,[2.4,6,2.4],null);
  REGISTER({name:'Arcoindian I — '+P.nm.toLowerCase(),x:P.x,z:P.z,r:P.sr+12,h:P.ty+PH+24});
  // the causeway back to the terraces, aimed at the nearest point of the stack
  const ax=PCX+(P.x-PCX)*.42,az=PCZ+(P.z-PCZ)*.42;
  const th2=Math.atan2(P.z-PCZ,P.x-PCX),rA=RT(NT,th2);
  const A=[PX2(th2,rA-4),TY(NT)+1.5,PZ2(th2,rA-4)],B=[P.x,P.ty+3,P.z];
  const L2=Math.hypot(B[0]-A[0],B[2]-A[2]);
  if(!down){beam(BX,A,B,8,15);
   // A HAUNCH at each end, on the causeway's own axis. The first cut hung four
   // diagonal struts under it at 3.4 x 9; beam() leaves the roll of an inclined
   // member to setFromUnitVectors, so each one presented its flat face and they
   // came back as white flaps flapping off the underside.
   for(const t of [.10,.90])beam(BX,
    [lerp(A[0],B[0],t-.09),lerp(A[1],B[1],t-.09)-9,lerp(A[2],B[2],t-.09)],
    [lerp(A[0],B[0],t+.09),lerp(A[1],B[1],t+.09)-9,lerp(A[2],B[2],t+.09)],7,12);
   for(const s3 of [-1,1]){const nx=-(B[2]-A[2])/L2*s3,nz=(B[0]-A[0])/L2*s3;
    beam(BX,[A[0]+nx*7,A[1]+3.2,A[2]+nz*7],[B[0]+nx*7,B[1]+3.2,B[2]+nz*7],3.2,1.6);}
   if(!dd)for(let i=0;i<Math.round(L2/16);i++){const t=(i+.5)/Math.round(L2/16);
    kput('strip',[lerp(A[0],B[0],t),lerp(A[1],B[1],t)+3.6,lerp(A[2],B[2],t)],
     qFacing([B[0]-A[0],0,B[2]-A[2]]),[12,1.3,1.3],CYAN);}}
  else{beam(BX,A,[lerp(A[0],B[0],.26),lerp(A[1],B[1],.26)-4,lerp(A[2],B[2],.26)],8,15);
   beam(BX,[lerp(A[0],B[0],.78),lerp(A[1],B[1],.78)-3,lerp(A[2],B[2],.78)],B,8,15);
   for(let i=0;i<26;i++){const t=rr(.28,.76),sc=rr(3,11);
    kput(BX,[lerp(A[0],B[0],t)+rr(-26,26),sc*.5+rr(0,6),lerp(A[2],B[2],t)+rr(-26,26)],
     qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(1,3),sc,sc*rr(1,2.4)],null);}}});

 // ---- the cliff foot: transportation ---------------------------------------
 // The sheet has TRANSPORTATION running along the foot and INTER-CITY
 // TRANSPORTATION arriving across the plain. Both are here, and three lift
 // towers climb the 226 m of undercut cliff between them and the lowest
 // terrace — which is the only way anyone gets from one to the other.
 const VZ=-26,VY=30;
 for(let i=0;i<Math.round((XS-XW-260)/58);i++){const vx=XW+180+i*58;
  kput(BX,[vx,VY*.5,VZ],null,[9,VY,11],null);
  if(!dd||rng()>.18)beam(BX,[vx-29,VY,VZ],[vx+29,VY,VZ],5.5,16);}
 for(let i=0;i<Math.round((XS-XW-260)/14);i++){const vx=XW+180+i*14;
  if(dd&&rng()<.3)continue;
  for(const s2 of [-1,1])kput(BX,[vx,VY+3.4,VZ+s2*7],null,[13,2.6,1.6],null);}
 if(!dd)for(let i=0;i<Math.round((XS-XW-260)/44);i++)
  kput('strip',[XW+180+i*44,VY+4.6,VZ+7.6],null,[26,1.4,1.4],CYAN);
 // the station
 {const sx=-96,sz=VZ+42,sw=190,sd2=54;
  GRD.push(gridSurface((u,v)=>[sx+(u-.5)*sw,1.2,sz+(v-.5)*sd2],18,8,{uS:16,vS:8}));
  SH.push(gridSurface((u,v)=>{const a=u*Math.PI;
    return[sx+(v-.5)*sw,1.2+30*Math.sin(a),sz+Math.cos(a)*sd2*.5];},24,20,{uS:14,vS:18,
    hole:holeFn(dd*.85,9620,null,1.4)}));
  // FILLED end walls, not a 4%-wide arch ribbon: the first cut left the vault
  // open at both ends and it read as a length of pipe dropped on the grass.
  for(const s2 of [-1,1])SH.push(gridSurface((u,v)=>{const a=u*Math.PI;
    return[sx+s2*sw*.5,1.2+30*Math.sin(a)*(1-v),sz+Math.cos(a)*sd2*.5*(1-v)];},24,6,{uS:12,vS:6,
    hole:(u,v)=>v>.62&&Math.abs(u-.5)<.22}));
  // a train shed alongside, a platform apron and a signal mast, so the stop
  // reads as a terminus rather than as one hut
  SH.push(gridSurface((u,v)=>{const a=u*Math.PI;
    return[sx-14+(v-.5)*sw*.62,1.2+17*Math.sin(a),sz-sd2*.62+Math.cos(a)*sd2*.28];},18,16,{uS:10,vS:12,
    hole:holeFn(dd*.9,9628,null,1.4)}));
  GRD.push(gridSurface((u,v)=>[sx+(u-.5)*(sw+120),2.0,sz+(v-.5)*(sd2+130)],20,14,{uS:18,vS:14}));
  for(let i=0;i<9;i++){const px4=sx+((i+.5)/9-.5)*(sw+60);
   if(dd&&rng()<.3)continue;
   kput(BX,[px4,2.6,sz+sd2*.5+26],null,[(sw+60)/9*.92,1.2,7],new THREE.Color(dd?0x6b6459:0xb0a898));}
  for(let i=0;i<14;i++){const px3=sx+((i+.5)/14-.5)*sw;
   if(dd&&rng()<.3)continue;
   kput('aiPortal',[px3,1.2,sz+sd2*.5+.6],qFacing([0,0,1]),[.9,.8,1],null);}
  if(!dd)for(let i=0;i<9;i++)kput('strip',[sx+((i+.5)/9-.5)*sw,26,sz],qEuler(0,Math.PI/2,0),[30,1.6,1.6],CYAN);
  REGISTER({name:'Arcoindian I — transportation, the cliff foot',x:sx,z:sz,r:120,h:44});
  // INTER-CITY TRANSPORTATION, arriving across the plain on a high viaduct
  for(let i=0;i<13;i++){const t=(i+.5)/13,iz=lerp(sz+sd2*.6,960,t),iy=lerp(46,54,t);
   kput(BX,[sx+58,iy*.5,iz],null,[10,iy,12],null);
   if(!dd||rng()>.14)beam(BX,[sx+58,iy,iz-38],[sx+58,iy,iz+38],6,18);
   if(!dd&&i%3===1)kput('strip',[sx+58,iy+4.2,iz],qFacing([0,0,1]),[30,1.5,1.5],CYAN);}}
 // the lift towers
 for(let i=0;i<3;i++){const lx=PCX-150+i*130,lz=shelfE(lx)-14;
  const lh=SHELF+4;
  SH.push(gridSurface((u,v)=>{const a=u*TAU,r=13+1.6*Math.cos(a*4);
    return[lx+Math.cos(a)*r,v*lh,lz+Math.sin(a)*r];},22,30,{uS:10,vS:26,
    hole:holeFn(dd*.5,9622+i,null,1.2)}));
  for(let j=2;j*13<lh;j++)kput('slabCR',[lx,j*13,lz],null,[13,.8,13],new THREE.Color(0x24262a));
  for(let j=0;j<Math.floor(lh/9);j++){const ly=6+j*9;
   if(ly>lh-8)break;
   if(rng()>(dd?.5:.9))continue;
   kput('aiPane',[lx,ly,lz+14.2],qFacing([0,0,1]),[4.4,3.4,1],
    rng()<(dd?.05:.4)?litOf('lw'):ROOMC);}
  beam(BX,[lx,lh-3,lz],[PX2(Math.atan2(lz-PCZ,lx-PCX),RT(NT,Math.atan2(lz-PCZ,lx-PCX))-2),TY(NT)+1.2,
    PZ2(Math.atan2(lz-PCZ,lx-PCX),RT(NT,Math.atan2(lz-PCZ,lx-PCX))-2)],4.5,13);
  kput('slabC',[lx,lh+2,lz],null,[17,3,17],new THREE.Color(dd?0x6d665c:0xcac4b8));
  if(!dd)lring(lx,lh+4.4,lz,15,12);}
 if(!dd)figures(PCX,VZ+70,14,110);else figures(PCX,VZ+70,5,110);

 // ---- the ruin -------------------------------------------------------------
 // What kills a city under a rock roof is the roof. A slab has come off the
 // vault — the bite is in the cavern shell itself, not a second surface laid
 // over it — and it is lying on the terraces it went through.
 if(IMP){
  REGISTER({name:'Arcoindian I — the roof fall',x:IMP.x,z:IMP.z,r:IMP.r+30,y:SHELF-10,h:300});
  // SLABS, not boulders. The first cut threw dodecahedra up to 72 m across and
  // the roof fall came back as a heap of pale eggs: a 12-face solid at that
  // size has no edge, and rr(.13,.28) lightness renders near-white under a
  // 1.7-intensity sun with ACES tone mapping. A vault sheds PLATES — flat,
  // angular, tilted where they came to rest — so the big pieces are boxes at
  // random attitudes and everything is four stops darker.
  const fallY=(bx,bz)=>{const th=Math.atan2(bz-PCZ,bx-PCX),r4=Math.hypot(bx-PCX,bz-PCZ);
   let by=PY;for(let k=1;k<=NT;k++)if(r4>RT(k-1,th))by=TY(k);
   return r4>RT(NT,th)?SHELF:by;};                // past the last terrace: the bare shelf
  const dkC=()=>new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.05,.13));
  // NOT A RING. The heap used to be radially symmetric with sizes uniform in
  // a band, which read as a sprinkled circle. A fall off a vault lands and
  // RUNS OUT downslope -- out toward the mouth (+z) and down the terraces -- so
  // most pieces are thrown into a fan on that bearing and travel further along
  // it, and the sizes are a power law: a few huge, many small.
  const FA=Math.PI/2;
  for(let i=0;i<130;i++){const t=Math.pow(rng(),1.5),a=rng()<.72?FA+(rng()-.5)*2.3:rng()*TAU;
   const r=IMP.r*(.18+t*1.4)*(1+.75*Math.max(0,Math.cos(a-FA))),sc=(4+26*Math.pow(rng(),3))*(1-t*.42);
   const bx=IMP.x+Math.cos(a)*r,bz=IMP.z+Math.sin(a)*r;
   if(bz>shelfE(bx)-4)continue;                    // ran off the shelf: it is on the plain now
   kput('aiBlock',[bx,fallY(bx,bz)+sc*.42+(1-t)*(1-t)*14,bz],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.7,1.6),sc*rr(.4,.8),sc*rr(.7,1.6)],dkC());}
  for(let i=0;i<22;i++){const t=Math.pow(rng(),1.3),a=rng()*TAU;
   const r=IMP.r*(.12+t*1.25),bx=IMP.x+Math.cos(a)*r,bz=IMP.z+Math.sin(a)*r;
   const L2=rr(18,46)*(1-t*.4);
   kput(BX,[bx,fallY(bx,bz)+rr(2,13)*(1-t),bz],
    qEuler(rr(-.9,.9),rng()*TAU,rr(-.9,.9)),[L2,rr(4,11),L2*rr(.5,1.1)],dkC());}
  // and the dust of it thrown off the shelf onto the plain below
  for(let i=0;i<90;i++){const t=Math.pow(rng(),1.6),sc=rr(4,22)*(1-t*.5);
   kput('aiBlock',[IMP.x+rr(-190,190),sc*.4+(1-t)*16,rr(-120,150)],
    qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.06,.15)));}}

 // ---- merge and dress ------------------------------------------------------
 meshMerged(ROCK,MAT.aiRock,G);meshMerged(TOP,MAT.aiTop,G);
 meshMerged(SHADE,MAT.aiShade,G);
 meshMerged(CUT,MAT.aiCut,G);
 meshMerged(RM,MAT.aiRoom,G);
 meshMerged(SH,wallM,G);
 meshMerged(GRD,deckM,G);
 if(DK.length)meshMerged(DK,MAT.aiVoid,G);
 meshMerged(BORE,MAT.aiBore,G);
 if(dd){
  // stainsFromLedge() aims each streak radially about the BUILDER's origin,
  // which is 300 m from this city's own centre, so it would lay its decals
  // across the terraces instead of down them. Same maths about PC.
  const aiStain=(geos,n,lMax)=>{for(const f of ledgePoints(geos,n,.4)){
    const a=Math.atan2(f.p[2]-PCZ,f.p[0]-PCX),L=rr(5,lMax);
    kput('stain',[f.p[0]+Math.cos(a)*.7,f.p[1]-L*.5,f.p[2]+Math.sin(a)*.7],
     qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.4,4.2),L,1],null);}};
  mossOnSurface(GRD,0,0,0,130,3.6);mossOnSurface(SH,0,0,0,90,3.2);
  mossOnSurface(ROCK,0,0,0,110,4.2);mossOnSurface(TOP,0,0,0,60,4.2);
  vinesFromLedge(GRD,0,0,0,130,26);aiStain(SH,150,22);
  for(let i=0;i<150;i++){const th=rng()*TAU;if(tf(th)<.1)continue;
   const k=1+((rng()*NT)|0),r=RT(k-1,th);
   kput('vine',[PX2(th,r+.6),TY(k-1)-1.4,PZ2(th,r+.6)],
    qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(.9,2),rr(7,34),rr(.9,2)],null);}
  for(let i=0;i<60;i++){const th=rng()*TAU,r=rr(RPLZ+10,Rplinth(th));
   VEG.tree(PX2(th,r),PY,PZ2(th,r),i%3,rr(6,17));}
  trees(PCX,VZ+60,120,420,34);}
 else trees(PCX,VZ+60,150,400,22);

 // ---- the covered surface, measured ----------------------------------------
 // The sheet says 10.5 ha. Integrating the plan on a 4 m lattice rather than
 // trusting the radii is the only way to know whether the lobing and the
 // pinch-out actually landed on the figure; --eval reads it off _api.
 let AREA=0;
 for(let ax=PCX-240;ax<PCX+240;ax+=4)for(let az=PCZ-240;az<PCZ+240;az+=4){
  const th=Math.atan2(az-PCZ,ax-PCX),r=Math.hypot(ax-PCX,az-PCZ);
  const R=Math.max(Rplinth(th),tf(th)>=.05?RT(NT,th):0);
  if(r<=R)AREA+=16;}
 POD.forEach(P=>{AREA+=3*Math.sqrt(3)*.5*P.pr*P.pr;});

 // ---- what the presets are derived from ------------------------------------
 AI_SITE[d]={x:gx,z:gz,d:d,dd:dd,XW:XW,XS:XS,CT0:CT0,SHELF:SHELF,XA:XA,
  PCX:PCX,PCZ:PCZ,PY:PY,TY0:TY0,NT:NT,RPL:RPL,RTE:RTE,RPLZ:RPLZ,RPRM:RPRM,
  crown:SHELF+HR0,lip0:lipY(0),zb0:ZB(0),area:AREA,
  TW:TW.map(t=>({x:t.x,z:t.z,r:t.r,h:t.h,k:t.k,n:t.n,y0:t.y0})),
  POD:POD.map(p=>({x:p.x,z:p.z,ty:p.ty,pr:p.pr,nm:p.nm})),
  HALL:{x0:HALL.x0,x1:HALL.x1,y0:HALL.y0,y1:HALL.y1,z0:HALL.z0,z1:HALL.z1},
  WELL:WELL.map(w=>({x:w.x,z:w.z,r:w.r,y0:w.y0,y1:wellY1(w),cav:!!w.cav,half:!!w.half})),
  ROOMS:ROOMS.map(r=>({x0:r.x0,x1:r.x1,y0:r.y0,y1:r.y1,z0:r.z0,z1:r.z1,k:r.k,n:r.n,
                       cut:!!r.cut,hall:!!r.hall})),
  IMP:IMP?{x:IMP.x,z:IMP.z,r:IMP.r}:null,
  faceZ:(x,y)=>faceZ(x,y),shelfE:x=>shelfE(x),roofY:(x,z)=>roofY(x,z),
  lipY:x=>lipY(x),ZB:x=>ZB(x),TY:k=>TY(k),RT:(k,th)=>RT(k,th),Rplinth:th=>Rplinth(th)};
 KOFF=[0,0,0];return G;}
