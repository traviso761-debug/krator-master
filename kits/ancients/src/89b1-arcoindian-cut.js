 // ---- what is cut into the rock --------------------------------------------
 // Four levels of chambers running back from the cavern, plus the buried CITY
 // CENTER hall. The hall is deliberately the one that reaches the section cut,
 // because a 152 m room laid open in a cliff face is the single image that
 // says "half of this city is excavated".
 const HALL={x0:-46,x1:XS,y0:302,y1:452,z0:-700,z1:-460};
 const LEV=[
  {y0:232,y1:292,z0:-790,z1:-460,k:'ind',n:'Industries',x0:-470,x1:XS},
  {y0:312,y1:374,z0:-734,z1:-460,k:'dwe',n:'Dwellings',x0:-470,x1:-76},
  {y0:386,y1:446,z0:-682,z1:-460,k:'dwe',n:'Dwellings',x0:-470,x1:-76},
  {y0:458,y1:512,z0:-636,z1:-464,k:'mee',n:'Meeting areas',x0:-440,x1:XS}];
 // Rooms along each level, irregular in both length and depth. The pillars
 // between them are what make the section read as excavation rather than as one
 // long slot, so they are never less than 14 m.
 const ROOMS=[];
 LEV.forEach((L,li)=>{let x=L.x0,last=null;
  while(x<L.x1-30){const w=rr(56,104),x1=Math.min(x+w,L.x1);
   if(x1-x>34){const zd=rr(.55,1.0);
    last={x0:x,x1:x1,y0:L.y0,y1:L.y1,z0:lerp(L.z1,L.z0,zd),z1:L.z1,k:L.k,n:L.n,lev:li,cut:false};
    ROOMS.push(last);}
   x=x1+rr(14,26);}
  // A level whose east end reaches the section plane MUST land on it. Left to
  // the walk it does not: the last room stops wherever rr(56,104) put it, and
  // the first cut of this type showed one chamber on the cut in the intact
  // variant and two in the ruin, purely on the draw. The section is the whole
  // point of the type; it does not get to be luck.
  if(L.x1>=XS-1&&last){
   if(L.x1-last.x1<42){last.x1=L.x1;last.cut=true;}
   else ROOMS.push({x0:last.x1+rr(15,24),x1:L.x1,y0:L.y0,y1:L.y1,
     z0:lerp(L.z1,L.z0,rr(.6,1.0)),z1:L.z1,k:L.k,n:L.n,lev:li,cut:true});}});
 ROOMS.push({x0:HALL.x0,x1:HALL.x1,y0:HALL.y0,y1:HALL.y1,z0:HALL.z0,z1:HALL.z1,
             k:'cty',n:'City centre (excavated)',lev:9,cut:true,hall:true});
 const inRoom=(x,y,z)=>{for(let i=0;i<ROOMS.length;i++){const R=ROOMS[i];
   if(x>R.x0-1&&x<R.x1+1&&y>R.y0-1&&y<R.y1+1&&z>R.z0-1&&z<R.z1+1)return R;}return null;};

 // Passages: from the back of the cavern into the rock. One per room that
 // touches the wall, at that room's own mid-height, 14 x 13 in section.
 const PASS=[];
 ROOMS.forEach(R=>{if(R.z1<-400)return;
  const px=clamp((R.x0+R.x1)*.5+rr(-14,14),R.x0+12,R.x1-12);
  if(px>XS-24)return;
  const py=R.hall?R.y0+18:R.y0+4;
  PASS.push({x:px,y:py,z0:R.z1,z1:ZB(px)-2,w:R.hall?22:14,h:R.hall?20:13,k:R.k});});
 // One passage is cut lengthways by the section plane, so the section shows a
 // tunnel in long section as well as the rooms in cross-section.
 PASS.push({x:XS,y:318,z0:HALL.z1,z1:ZB(XS)-2,w:18,h:15,k:'cty',half:true});

 // THE STAIR SHAFT. A vertical circulation shaft on the cut plane, from the
 // industries floor up to the meeting-area level, with a landing at each
 // chamber. It is here because the section needed something that runs ACROSS
 // the levels: without it the cut face is four unrelated windows in 560 000 m2
 // of rock, and it is what tells you the excavated half is one building.
 const STAIR={x:XS,z:-524,w:19,y0:LEV[0].y0+2,y1:LEV[3].y1-4};

 // Light wells. Ten into the buried chambers, four through the cavern roof and
 // down over the plinth. Two of them sit exactly on the cut so the section
 // shows a shaft in long section running 200 m up to daylight.
 const WELL=[];
 ROOMS.forEach(R=>{if(R.lev===0)return;                      // industries wants no daylight
  const n=R.hall?3:(rng()<.5?1:0);
  for(let i=0;i<n;i++){const half=!!R.hall&&i===2;
   const wx=half?XS:(R.hall?lerp(R.x0+26,R.x1-30,(i+.5)/2):rr(R.x0+18,R.x1-18));
   const wz=R.hall?(R.z0+R.z1)*.5+rr(-13,13):rr(R.z0+24,R.z1-24);
   WELL.push({x:Math.min(wx,XS),z:wz,r:rr(8,15),y0:R.y1-2,room:R,half:half});}});
 // The four that come down through the VAULT and stand as shafts of daylight
 // over the plinth. They have to land ON the plinth and NOT on a tower, and
 // the plinth's lobing runs 67 to 133 m, so both are tested rather than
 // assumed — a light pool hanging in the air off the edge of the deck is
 // exactly the class of error --assert cannot see.
 const TPOS=TWR.map(T=>{const rd=Math.min(64,Rplinth(T.a)-T.r-10);
  return[PCX+Math.cos(T.a)*rd,PCZ+Math.sin(T.a)*rd,T.r];});
 for(let i=0;i<4;i++){const wr=rr(10,16);let wx=PCX,wz=PCZ,got=false;
  for(let g=0;g<24&&!got;g++){const a3=(i+rr(.12,.88))/4*TAU;
   const r3=Math.min(rr(26,74),Rplinth(a3)-wr-16);
   if(r3<wr+RPLZ*.6)continue;
   wx=PCX+Math.cos(a3)*r3;wz=PCZ+Math.sin(a3)*r3;
   got=!TPOS.some(t=>Math.hypot(wx-t[0],wz-t[1])<t[2]+wr+14);}
  // The bore starts at the LOWEST point of the roof round its rim, not 4 m
  // under the roof at its centre: that 4 m stub of lining was a 28 m drum
  // hanging below the vault, which is what every preset looking up saw.
  if(got){let ry=1e9;for(let k=0;k<8;k++){const a=k/8*TAU;
    const q=roofY(wx+Math.cos(a)*wr,wz+Math.sin(a)*wr);if(q>0)ry=Math.min(ry,q);}
   WELL.push({x:wx,z:wz,r:wr,y0:Math.min(ry,roofY(wx,wz))-.5,cav:true});}}
 const wellY1=W=>platY(W.x,W.z)+2;
 const inWell=(x,z,pad)=>{for(let i=0;i<WELL.length;i++){const W=WELL[i];
   const dx=x-W.x,dz=z-W.z,rr2=W.r+(pad||0);
   if(dx*dx+dz*dz<rr2*rr2)return W;}return null;};

 // ---- what the section plane opens -----------------------------------------
 // Every opening on the cut face, as rectangles in (z,y). The face is punched
 // by the SAME list the chambers are built from, so a room cannot be drawn
 // behind unbroken rock — which is the failure mode that killed the cutaways in
 // the Forest Ring and Arcbeam.
 const CUTO=[];
 ROOMS.forEach(R=>{if(R.cut)CUTO.push([R.z0,R.z1,R.y0,R.y1]);});
 PASS.forEach(P=>{if(P.half)CUTO.push([Math.min(P.z0,P.z1),Math.max(P.z0,P.z1),P.y,P.y+P.h]);});
 WELL.forEach(W=>{if(W.half)CUTO.push([W.z-W.r,W.z+W.r,W.y0,wellY1(W)]);});
 CUTO.push([STAIR.z-STAIR.w*.5,STAIR.z+STAIR.w*.5,STAIR.y0,STAIR.y1]);
 const inCutO=(z,y)=>{for(let i=0;i<CUTO.length;i++){const C=CUTO[i];
   if(z>C[0]+5&&z<C[1]-5&&y>C[2]+4&&y<C[3]-4)return true;}return false;};

 // ---- registry -------------------------------------------------------------
 REGISTER({name:'Arcoindian I — cliff arcology ('+STATE(d)+')',x:PCX,z:PCZ,r:430,h:660});
 REGISTER({name:'Arcoindian I — the overhang',x:-160,z:-150,r:360,y:SHELF-10,h:310});
 REGISTER({name:'Arcoindian I — the courtyard plinth',x:PCX,z:PCZ,r:150,y:PY-18,h:30});
 REGISTER({name:'Arcoindian I — the central plaza and promenade',x:PCX,z:PCZ,r:RPRM+6,y:PY-10,h:26});
 REGISTER({name:'Arcoindian I — the terraces',x:PCX,z:PCZ,r:RTE+10,y:TY0-6,h:PY-TY0+12});
 REGISTER({name:'Arcoindian I — gardens against the rock',x:PCX,z:PCZ-96,r:82,y:PY-6,h:34});
 REGISTER({name:'Arcoindian I — the section cut',x:XS-40,z:-430,r:300,h:CT0});
 REGISTER({name:'Arcoindian I — the cliff foot, transportation',x:PCX,z:-30,r:300,h:110});

 // ---- the cliff face -------------------------------------------------------
 // The mouth is cut 9 m SHORT of the lip and starts 14 m ABOVE the shelf. Both
 // margins are deliberate: gridSurface drops whole quads, so a hole whose edge
 // is the exact boundary leaks up to one cell of daylight where the cavern
 // shell does not quite reach. Shrinking the hole puts a rock brow over the
 // mouth and a rock lip along the front of the shelf, which is what an
 // undercut cliff has anyway.
 const mouthHole=(x,y)=>HR(x)>14&&y>SHELF+9&&y<lipY(x)-9;
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS,u),y=v*ctop(x);
   return[x,y,faceZ(x,y)];},252,80,{uS:(XS-XW)/78,vS:CT0/70,
   hole:(u,v)=>mouthHole(lerp(XW,XS,u),v*ctop(lerp(XW,XS,u)))}));
 // the plateau, lapping 3 m forward over the face top and grading to the plain
 // at the back of the model
 TOP.push(gridSurface((u,v)=>{const x=lerp(XW,XS,u);
   const z0=faceZ(x,ctop(x))+3,z=lerp(z0,ZBK,Math.pow(v,.82));
   return[x,platY(x,z),z];},
   160,48,{uS:(XS-XW)/78,vS:16,
   hole:(u,v)=>{const x=lerp(XW,XS,u),z0=faceZ(x,ctop(x))+3,z=lerp(z0,ZBK,Math.pow(v,.82));
    return !!inWell(x,z,0);}}));
 // THE BROW FRINGE. gridSurface drops whole quads, so the mouth's top edge came
 // back as a flight of 7 x 7 m stairs cut in the rock — the single most
 // artificial thing in the first renders. This is a 32 m band of rock lying 5 m
 // proud of the face along the lip, which covers the stepped edge with a lip a
 // real rock shelter has anyway, and gives the brow a shadow line of its own.
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XA,XS,u),ly=lipY(x),y=ly-15+v*33;
   return[x,y,faceZ(x,y)+5.5-3*Math.abs(v-.45)];},170,4,{uS:(XS-XA)/78,vS:4,
   hole:(u,v)=>HR(lerp(XA,XS,u))<20}));
 // talus banked against the foot of the cliff, largest at the wall
 for(let i=0;i<260;i++){const x=rr(XW+80,XS),t=Math.pow(rng(),1.9);
  const bx=faceZ(x,10)+t*150,sc=rr(4,24)*(1-t*.45);
  kput('aiBlock',[x,sc*.4+(1-t)*(1-t)*20,bx],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.32),rr(.11,.24)));}

 // ---- the cavern shell -----------------------------------------------------
 // One surface: brow lip, over the roof, down the back wall and 6 m under the
 // shelf. The roof's noise is displaced in y and the wall's in z, and both ramp
 // from zero at their seams so the two halves meet exactly.
 const cavPt=(x,v)=>{const h=HR(x);
  if(h<2)return[x,SHELF,ZB(x)];
  if(v<=.66){const s=v/.66,p=bez(x,s);
   // A smooth vault reads as a tarpaulin, so roofN() puts two octaves of
   // spalling in it, ramped from zero at the lip so the mouth edge still lands
   // exactly on the face's hole; scarY() bites the roof fall out of the vault
   // ITSELF rather than laying a second sheet of rock over it, which is what
   // went wrong the first time Arcbeam modelled its rockfall.
   return[x,p[1]+roofN(x,p[0],s)+scarY(x,p[0],s),p[0]];}
  const s=(v-.66)/.34,y=lerp(topY(x),SHELF-6,s);
  return[x,y,ZB(x)+((fbm(x*.013,y*.013,9602,3)*2-1)*20
                    +(fbm(x*.044,y*.044,9624,2)*2-1)*7)*Math.min(1,s*4)];};
 SHADE.push(gridSurface((u,v)=>cavPt(lerp(XA,XS,u),v),140,48,{uS:(XS-XA)/62,vS:9,
   hole:(u,v)=>{const p=cavPt(lerp(XA,XS,u),v);
    return v<.5&&!!inWell(p[0],p[2],-1);}}));

 // WHAT IS ON THE PLATEAU. A bare 1 700 x 1 300 m tabletop with fourteen
 // manholes in it reads as a car park, and the plan view is one of the three
 // the sheet draws. A haul track links the collars, spoil banks stand beside
 // the deepest of them, and scrub takes the hollows.
 {const WC=WELL.filter(w=>!w.half&&!w.cav).sort((a,b)=>a.x-b.x);
  for(let i=1;i<WC.length;i++){const A2=WC[i-1],B2=WC[i];
   const n2=Math.max(2,Math.round(Math.hypot(B2.x-A2.x,B2.z-A2.z)/26));
   for(let j=0;j<n2;j++){const t=(j+.5)/n2;
    const tx=lerp(A2.x,B2.x,t)+rr(-5,5),tz=lerp(A2.z,B2.z,t)+rr(-5,5);
    // A MADE road, laid 0.4 m proud in a dark stone. The first cut used the
    // kit's 'stain' decal, but TEX.stain is mostly light, so multiplying it
    // over pale rock barely darkens and 30 m quads with depthWrite off read
    // as ghosts hovering over the plateau.
    const ang=Math.atan2(B2.z-A2.z,B2.x-A2.x);
    kput(BX,[tx,wellY1(A2)-.6,tz],qEuler(0,-ang,0),[30,.8,15],
     new THREE.Color().setHSL(rr(.06,.10),rr(.10,.20),rr(.10,.17)));}}
  WELL.forEach(W=>{if(W.half||W.cav||rng()<.45)return;
   for(let i=0;i<18;i++){const a3=rng()*TAU,r4=W.r*rr(1.5,3.4),sc=rr(3,11);
    kput('aiBlock',[W.x+Math.cos(a3)*r4,wellY1(W)-1+sc*.35,W.z+Math.sin(a3)*r4],
     qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.8,1.6),sc*rr(.4,.8),sc*rr(.8,1.6)],
     new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.10,.22)));}});
  for(let i=0;i<(dd?120:80);i++){const px5=rr(XW+400,XS-20),pz5=rr(-1180,-120);
   const py5=platY(px5,pz5);
   // and not out over a bay, where the rim has retreated behind z = -120
   if(py5<40||inWell(px5,pz5,26)||pz5>faceZ(px5,ctop(px5))-6)continue;
   kput('hedge',[px5,py5+.5,pz5],qEuler(0,rng()*TAU,0),[rr(2,5),rr(.8,1.5),rr(1.4,3)],
    new THREE.Color().setHSL(rr(.14,.26),rr(.18,.34),dd?rr(.06,.12):rr(.07,.14)));}
  // TORS. The plateau's own relief was 16 m of smooth noise, and from the
  // plateau preset it was a tabletop with manholes in it. Knots of harder
  // caprock stand out of it -- clusters of angular blocks, largest at the
  // middle -- set by a HASH, not the PRNG, so nothing after them moves.
  for(let k=0;k<16;k++){const tx=lerp(XW+320,XS-60,h3(k,1.1,5.5)),tz=lerp(-1150,-260,h3(k,2.7,6.1));
   if(tz>faceZ(tx,ctop(tx))-40||inWell(tx,tz,40)||platY(tx,tz)<60)continue;
   const n=8+Math.floor(h3(k,3.3,7.3)*9),R0=14+20*h3(k,4.9,8.1);
   for(let j=0;j<n;j++){const a=h3(k,j,1.9)*TAU,t=Math.sqrt(h3(k,j,2.8)),r=R0*t;
    const bx=tx+Math.cos(a)*r,bz=tz+Math.sin(a)*r,sc=lerp(15,5,t)*(.7+.6*h3(k,j,3.7));
    kput('aiBlock',[bx,platY(bx,bz)+sc*.25,bz],qEuler(h3(j,k,1)*.6,h3(j,k,2)*TAU,h3(j,k,3)*.6),
     [sc*(1+h3(j,k,4)),sc*(.5+.5*h3(j,k,5)),sc*(1+h3(j,k,6))],
     new THREE.Color().setHSL(.06+.04*h3(j,k,7),.2+.12*h3(j,k,8),.12+.10*h3(j,k,9)));}}}
 // ---- the rock shelf the city stands on ------------------------------------
 // Its outer edge is shelfE(): the weathered face where that reaches far
 // enough forward, a projecting buttress of rock where it does not. Under that
 // edge a battered skirt runs 80 m down the face, 2 m proud of it, so the
 // buttress has an underside and nothing can look through the join.
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XA+26,XS,u);
   const z=lerp(ZB(x)-10,shelfE(x),v);
   return[x,SHELF+(fbm(x*.01,z*.01,9603,3)*2-1)*3.2*Math.min(1,v*4)*Math.min(1,(1-v)*6),z];},
   118,30,{uS:(XS-XA)/62,vS:7}));
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XA+26,XS,u),y=lerp(SHELF,SHELF-80,v);
   return[x,y,lerp(shelfE(x),faceZ(x,SHELF-80)+2,Math.pow(v,.75))];},118,8,{uS:(XS-XA)/62,vS:5}));

 // ---- the section cut ------------------------------------------------------
 // The massif ends here on a master joint. Flatter and less gullied than the
 // weathered face on purpose: a joint plane is a fracture, and it has to read
 // as a cut or the whole section preset is just another cliff.
 const cutZ=(y,q)=>faceZ(XS,y)+2-q;
 const inCavCut=(y,z)=>{if(y<SHELF+12)return false;
  if(z<ZB(XS)+11||z>lipZ(XS)-4)return false;
  const ry=roofY(XS,z);return ry>0&&y<ry-11;};
 const cutX=(y,z)=>XS+((fbm(z*.0062,y*.0062,9604,3)*2-1)*11
   +(fbm(z*.021,y*.021,9627,2)*2-1)*4.5);
 // THE CAVERN'S EDGE ON THE CUT. gridSurface drops whole quads, so the top of
 // the cavern opening came back as a flight of 8 m stairs across the section
 // preset. The main face now leaves a band CB m above the roof edge open as
 // well, and a conformal strip is laid over that band whose lower edge IS the
 // roof curve and which laps 0.9 m proud over the stepped quads above it. Its
 // UVs are recomputed from the main face's own (u,v) so the bedding runs on
 // across the join instead of jumping.
 const CB=15,cZa=ZB(XS)+11,cZb=lipZ(XS)-4;
 const cutU=(y,z)=>Math.pow(clamp((cutZ(y,0)-z)/(cutZ(y,0)+900),0,1),1/.85);
 const cutSX=(y,z)=>{const b=Math.min(1,cutU(y,z)*6);return cutX(y,z)*b+XS*(1-b);};
 const inCavBand=(y,z)=>{if(z<=cZa||z>=cZb)return false;
  const ry=roofY(XS,z);return ry>0&&y>=ry-11&&y<ry-11+CB;};
 CUT.push(gridSurface((u,v)=>{const y=v*ctop(XS),z=lerp(cutZ(y,0),-900,Math.pow(u,.85));
   return[cutX(y,z)*Math.min(1,u*6)+XS*(1-Math.min(1,u*6)),y,z];},128,80,{uS:18,vS:CT0/70,
   hole:(u,v)=>{const y=v*ctop(XS),z=lerp(cutZ(y,0),-900,Math.pow(u,.85));
    return inCavCut(y,z)||inCavBand(y,z)||inCutO(z,y);}}));
 {const g=gridSurface((u,v)=>{const z=lerp(cZa,cZb,u),y=roofY(XS,z)-11+v*(CB+11);
    return[cutSX(y,z)+.9*Math.min(1,v*3),y,z];},90,5,{uS:1,vS:1});
  const P=g.attributes.position,UV=g.attributes.uv;
  for(let i=0;i<P.count;i++){const y=P.getY(i),z=P.getZ(i);
   UV.setXY(i,cutU(y,z)*18,y/ctop(XS)*CT0/70);}
  CUT.push(g);}
 // REVEALS. The chamber openings were rectangles cut in a plane with no
 // thickness, so 900 m of rock read as a sheet of card. Each opening gets four
 // returning faces 17 m deep — a sill, a head and two cheeks — which is what
 // tells the eye how much rock the city is dug out of. They are driven off the
 // SAME rectangles as the holes, so a reveal cannot land where there is no hole.
 const RVD=17;
 CUTO.forEach(C=>{const z0=C[0]+5,z1=C[1]-5,y0=C[2]+4,y1=C[3]-4;
  for(const zz of [z0,z1])CUT.push(gridSurface((u,v)=>
   [cutX(lerp(y0,y1,u),zz)-v*RVD,lerp(y0,y1,u),zz],8,3,{uS:6,vS:3}));
  for(const yy of [y0,y1])CUT.push(gridSurface((u,v)=>
   [cutX(yy,lerp(z0,z1,u))-v*RVD,yy,lerp(z0,z1,u)],12,3,{uS:6,vS:3}));});
 // blocks along the crest, so the plateau does not meet the cut on a drawn line
 for(let i=0;i<70;i++){const z=rr(-880,cutZ(CT0*.9,0)),sc=rr(6,22);
  kput('aiBlock',[XS+rr(-14,16),ctop(XS)-rr(0,10)+sc*.3,z],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.16,.32)));}
 // quarry-like benches at its foot, and the spoil of the joint's own failure
 for(let b=0;b<3;b++){const by=40+b*46,bd=16+b*9;
  CUT.push(gridSurface((u,v)=>[XS+lerp(0,bd,v),by,lerp(cutZ(by,0),-860,Math.pow(u,.85))],40,3,{uS:24,vS:4}));
  CUT.push(gridSurface((u,v)=>[XS+bd,lerp(by,by-46,v),lerp(cutZ(by,0),-860,Math.pow(u,.85))],40,4,{uS:24,vS:5}));}
 for(let i=0;i<150;i++){const t=Math.pow(rng(),1.7),z=rr(-880,cutZ(20,0));
  const sc=rr(4,26)*(1-t*.5);
  kput('aiBlock',[XS+8+t*190,sc*.4+(1-t)*(1-t)*30,z],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.34),rr(.14,.30)));}

 // ---- the excavated half ---------------------------------------------------
 // Chambers are LINED, not hollowed: six surfaces each, so a room seen through
 // a portal or laid open on the cut has a floor, a ceiling and a back to it.
 // The east wall is omitted on the rooms the section plane takes, which is what
 // makes those rooms open onto the cut instead of being sealed behind it.
 const ZLIT={ind:new THREE.Color(0xffb257),cty:CYAN,cul:CYAN,pub:CYAN,
             res:WARM,dwe:WARM,lw:new THREE.Color(0xbfe6ff),mee:new THREE.Color(0xffe0b0),
             gar:new THREE.Color(0xa8ff9a),rsc:new THREE.Color(0xbfe6ff),ply:WARM};
 const litOf=k=>(ZLIT[k]||WARM).clone().multiplyScalar(dd?rr(.10,.32):rr(.32,.88));
 const ROOMC=dd?DEAD:new THREE.Color(0x0f1720);
 // The shared stripRing() was aiming every segment radially — a ring of light
 // strips came out as a comb of spokes pointing at the camera. It was fixed in
 // 36-decor.js while this type was being built, so this is now a one-line alias
 // rather than the private tangential copy the Forest Tower and Plymouth both
 // had to carry. Keeping the local name means the call sites do not care.
 const lring=(cx,cy,cz,r,n)=>stripRing(cx,cy,cz,r,d,n);
 const wellHole=(x,z)=>!!inWell(x,z,-1);
 ROOMS.forEach((R,ri)=>{
  const gx2=(u,v,f)=>f(lerp(R.x0,R.x1,u),lerp(R.z0,R.z1,v));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y0,lerp(R.z0,R.z1,v)],10,10,{uS:8,vS:8}));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y1,lerp(R.z0,R.z1,v)],10,10,{uS:8,vS:8,
   hole:(u,v)=>gx2(u,v,wellHole)}));
  RM.push(gridSurface((u,v)=>[R.x0,lerp(R.y0,R.y1,v),lerp(R.z0,R.z1,u)],10,6,{uS:8,vS:6}));
  if(!R.cut)RM.push(gridSurface((u,v)=>[R.x1,lerp(R.y0,R.y1,v),lerp(R.z0,R.z1,u)],10,6,{uS:8,vS:6}));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z0],10,6,{uS:8,vS:6}));
  // the front wall, punched where its passage comes through
  const P=PASS.find(p=>p.z0===R.z1&&p.x>R.x0&&p.x<R.x1);
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z1],14,8,{uS:8,vS:6,
   hole:(u,v)=>{if(!P)return false;const x=lerp(R.x0,R.x1,u),y=lerp(R.y0,R.y1,v);
    return Math.abs(x-P.x)<P.w*.5&&y>P.y&&y<P.y+P.h;}}));
  // FLOOR PLATES. Pale concrete over a dark soffit, and never the same grey as
  // the void behind them: cut a stack of floors out of one tone and the whole
  // section renders as one ramp. The plate is the only thing that gives a
  // 152 m room a legible number of storeys.
  const st=R.hall?19:20,np=Math.max(1,Math.floor((R.y1-R.y0-8)/st));
  for(let p=1;p<=np;p++){const py=R.y0+p*st;
   if(py>R.y1-6)break;
   // The hall keeps a FIXED 17% light court down its middle at every level,
   // not a random one: it is where its two wells land, and a preset that has
   // to stand in it needs a slot that is in the same place on every floor.
   const inset=R.hall?.17:.06;
   const hl=(u,v)=>{const x=lerp(R.x0,R.x1,u),z=lerp(R.z0,R.z1,v);
    return wellHole(x,z)||(R.hall&&Math.abs(z-(R.z0+R.z1)*.5)<(R.z1-R.z0)*inset*.5)
     ||(dd&&fbm(u*5+p,v*4,9605+p,3)<.28);};
   const pl=dy=>gridSurface((u,v)=>[lerp(R.x0+3,R.x1-(R.cut?0:3),u),py+dy,lerp(R.z0+3,R.z1-3,v)],
    12,10,{uS:6,vS:6,hole:hl});
   SH.push(pl(0));DK.push(pl(-1.3));
   // partitions across the plate, so a storey is rooms and not a shelf
   const nq=Math.max(2,Math.round((R.x1-R.x0)/22));
   for(let q=0;q<nq;q++){const px2=lerp(R.x0+6,R.x1-6,(q+.5)/nq);
    if(rng()<(dd?.55:.28))continue;
    const zc2=rr(R.z0+14,R.z1-14),zl=rr(22,Math.min(96,(R.z1-R.z0)*.55));
    kput(R.hall?BX:BXD,[px2,py+(st-2)*.5,zc2],null,[1.1,st-3,zl],
     R.hall?new THREE.Color(dd?0x6b6459:0xaaa294):null);
    // cells facing the cut, so a room laid open is inhabited
    if(R.cut)for(let c=0;c<3;c++){const cz=zc2+((c+.5)/3-.5)*zl;
     if(rng()<(dd?.6:.22))continue;
     kput('aiPane',[px2+.9,py+4.2,cz],qFacing([1,0,0]),[5.4,3.4,1],
      rng()<(dd?.06:.5)?litOf(R.k):ROOMC);}}
   if(!dd&&rng()<.7)kput('strip',[(R.x0+R.x1)*.5,py+st-3,rr(R.z0+20,R.z1-20)],
    qEuler(0,Math.PI/2,0),[Math.min(70,(R.z1-R.z0)*.5),1.4,1.4],ZLIT[R.k]||CYAN);
   // A COLONNADE down both edges of the hall's light court, storey by storey.
   // Eight plates and a few partitions in a 196 x 240 x 150 m room left it
   // reading as an empty car park; the piers are what make it a hall.
   if(R.hall){const cz3=(R.z0+R.z1)*.5,ci=(R.z1-R.z0)*inset*.5;
    for(const s4 of [-1,1])for(let q2=0;q2<5;q2++){
     const cx3=lerp(R.x0+16,R.x1-12,(q2+.5)/5);
     if(inWell(cx3,cz3+s4*ci,6))continue;
     kput('aiPost',[cx3,py-st+1,cz3+s4*ci],null,[2.5,st-1.4,2.5],
      new THREE.Color(dd?0x6b6459:0xb2aa9c));
     kput(BX,[cx3,py-1.6,cz3+s4*(ci-1.6)],null,[5.6,2.2,4],
      new THREE.Color(dd?0x6b6459:0xb2aa9c));}}}
  if(ri%3===0||R.hall)REGISTER({name:'Arcoindian I — excavated '+R.n.toLowerCase(),
   x:(R.x0+R.x1)*.5,z:(R.z0+R.z1)*.5,r:Math.max(40,(R.x1-R.x0)*.6),y:R.y0-2,h:R.y1-R.y0+4});
  // industry plant, dwellings furniture: enough silhouette that a chamber is
  // not an empty box when a camera is put inside one
  const nf=R.hall?26:Math.round((R.x1-R.x0)/16);
  for(let i=0;i<nf;i++){const fx=rr(R.x0+6,R.x1-6),fz=rr(R.z0+8,R.z1-8);
   if(inWell(fx,fz,4))continue;
   if(R.k==='ind'){const hh=rr(10,Math.min(34,R.y1-R.y0-8));
    kput(dd?'pipeR':'pipe',[fx,R.y0+hh*.5,fz],null,[rr(3,7),hh,rr(3,7)],null);
    if(rng()<.5)kput(BX,[fx,R.y0+2,fz],null,[rr(8,20),4,rr(8,20)],null);}
   else{const hh=rr(3,7);
    kput(BX,[fx,R.y0+hh*.5,fz],qEuler(0,rng()*TAU,0),[rr(5,14),hh,rr(4,11)],null);}}});

 // the stair shaft, built as its x<XS half so the plane lays it open
 {const S2=STAIR,H2=S2.y1-S2.y0;
  RM.push(gridSurface((u,v)=>[S2.x-u*S2.w,lerp(S2.y0,S2.y1,v),S2.z-S2.w*.5],4,22,{uS:4,vS:18}));
  RM.push(gridSurface((u,v)=>[S2.x-u*S2.w,lerp(S2.y0,S2.y1,v),S2.z+S2.w*.5],4,22,{uS:4,vS:18}));
  RM.push(gridSurface((u,v)=>[S2.x-S2.w,lerp(S2.y0,S2.y1,v),S2.z+(u-.5)*S2.w],4,22,{uS:4,vS:18}));
  // flights and landings: a run every 4.6 m, alternating direction
  for(let i=0;i*4.6<H2-4;i++){const fy=S2.y0+i*4.6,dir=(i%2)?1:-1;
   kput('aiStair',[S2.x-S2.w*.5,fy,S2.z-dir*S2.w*.34],qFacing([0,0,dir]),[S2.w*.72,4.6,S2.w*.62],
    new THREE.Color(dd?0x6b6459:0xb7b0a2));
   if(i%2===0)kput(BX,[S2.x-S2.w*.5,fy-.7,S2.z],null,[S2.w*.86,1.4,S2.w*.9],
    new THREE.Color(dd?0x6b6459:0xb7b0a2));
   if(!dd&&i%3===0)kput('strip',[S2.x-2,fy+3.6,S2.z],qEuler(0,Math.PI/2,0),[S2.w*.8,1.2,1.2],CYAN);}
  REGISTER({name:'Arcoindian I — the stair shaft',x:S2.x-S2.w*.5,z:S2.z,r:S2.w,y:S2.y0-2,h:H2+4});}
 // ---- passages -------------------------------------------------------------
 PASS.forEach(P=>{const za=Math.min(P.z0,P.z1),zb2=Math.max(P.z0,P.z1);
  const hw=P.half?0:P.w*.5;
  RM.push(gridSurface((u,v)=>[P.x+lerp(-hw,P.w*.5,u),P.y,lerp(za,zb2,v)],4,16,{uS:4,vS:12}));
  RM.push(gridSurface((u,v)=>[P.x+lerp(-hw,P.w*.5,u),P.y+P.h,lerp(za,zb2,v)],4,16,{uS:4,vS:12}));
  RM.push(gridSurface((u,v)=>[P.x-hw,lerp(P.y,P.y+P.h,v),lerp(za,zb2,u)],16,4,{uS:12,vS:4}));
  if(!P.half)RM.push(gridSurface((u,v)=>[P.x+P.w*.5,lerp(P.y,P.y+P.h,v),lerp(za,zb2,u)],16,4,{uS:12,vS:4}));
  // the portal where it breaks out into the back of the cavern
  if(!P.half){kput('aiPortal',[P.x,P.y,ZB(P.x)+1],qFacing([0,0,1]),[P.w/8,P.h/12,1],null);
   for(const s3 of [-1,1])kput(BX,[P.x+s3*(P.w*.5+3),P.y+P.h*.5,ZB(P.x)+3],null,[6,P.h+6,7],null);
   if(!dd)kput('strip',[P.x,P.y+P.h+.6,ZB(P.x)+4],null,[P.w,1.6,1.6],CYAN);
   else if(rng()<.3)kput('strip',[P.x,P.y+P.h+.6,ZB(P.x)+4],null,[P.w,1.6,1.6],CYAN.clone().multiplyScalar(.3));
   for(let i=0;i<Math.round(P.w/3.4);i++)
    kput(BX,[P.x+((i+.5)/Math.round(P.w/3.4)-.5)*(P.w+6),P.y+P.h+2,ZB(P.x)+2],null,
     [(P.w+6)/Math.round(P.w/3.4)*1.04,4,5],null);}
  const nl=Math.max(2,Math.round((zb2-za)/22));
  for(let i=0;i<nl;i++){const pz=lerp(za+6,zb2-6,(i+.5)/nl);
   if(!dd)kput('strip',[P.x,P.y+P.h-1.6,pz],qEuler(0,Math.PI/2,0),[14,1.3,1.3],CYAN);
   else if(rng()<.2)kput('strip',[P.x,P.y+P.h-1.6,pz],qEuler(0,Math.PI/2,0),[14,1.3,1.3],
    CYAN.clone().multiplyScalar(.35));}});

 // ---- light wells ----------------------------------------------------------
 // Lined in the chamber material and rimmed with a raised collar, so from the
 // plateau each one is a black hole in a ring of stonework rather than the
 // bright patch a shadowless engine makes of any deep void. At the bottom a
 // pale disc is laid on the floor: that is what a shaft of daylight looks like
 // when nothing in the scene can cast one.
 WELL.forEach((W,wi)=>{const y1=wellY1(W),H=y1-W.y0;
  if(!(H>10))return;
  if(W.half){RM.push(gridSurface((u,v)=>{const th=Math.PI*.5+u*Math.PI;
    return[W.x+Math.cos(th)*W.r,W.y0+v*H,W.z+Math.sin(th)*W.r];},12,20,{uS:6,vS:18}));}
  // A cavern well's bore is BLACK for its first 55 m. Arcoindian II found what
  // four attempts at a rim here never did: MAT.aiRoom is a mid-brown that the
  // hemisphere lights through any depth of rock, so the lining itself, seen
  // up through the hole, was the pale "saucer stuck to the ceiling". The rim
  // was never what you were looking at.
  else if(W.cav){BORE.push(lathe({rFn:()=>W.r,H:Math.min(55,H),nu:16,nv:5}).translate(W.x,W.y0,W.z));
   if(H>55)RM.push(lathe({rFn:()=>W.r,H:H-55,nu:16,nv:12}).translate(W.x,W.y0+55,W.z));}
  else RM.push(lathe({rFn:()=>W.r,H:H,nu:16,nv:18}).translate(W.x,W.y0,W.z));
  if(!W.half){
   // the collar on the plateau: an upstand and its own dark reveal
   ROCK.push(lathe({rFn:y2=>W.r*(1.30-.10*y2/9),H:9,nu:18,nv:3}).translate(W.x,y1-2,W.z));
   RM.push(lathe({rFn:()=>W.r*1.02,H:11,nu:16,nv:2}).translate(W.x,y1-2,W.z));
   // a grille of ribs over the mouth, which is the other half of making a hole
   // read as a hole from directly overhead
   const nr=Math.max(3,Math.round(W.r/3.6));
   for(let i=0;i<nr;i++){const t=(i+.5)/nr-.5;
    if(dd&&rng()<.4)continue;
    beam(BX,[W.x+t*W.r*2,y1+6,W.z-W.r*Math.sqrt(Math.max(0,1-4*t*t))],
         [W.x+t*W.r*2,y1+6,W.z+W.r*Math.sqrt(Math.max(0,1-4*t*t))],1.6,1.6);}}
  // A CAVERN well needs a collar on the UNDERSIDE of the vault. Without one it
  // is a grey ellipse in a dark roof and reads as a boulder stuck to the
  // ceiling, which is what the first renders showed.
  // A LIP flush with the vault, not a collar hanging below it. Nothing in this
  // scene casts a shadow, so any surface hung under the roof is lit from
  // outside and from the hemisphere's warm ground colour at once: at 1.6x over
  // 14 m it read as a pendant lamp, at 1.16x over 4.5 m as a bucket. Sitting it
  // mostly ABOVE the roof plane leaves a rimmed hole with a lit bore behind it,
  // which is what a light well looks like from underneath.
  if(W.cav){
   // NOTHING BELOW THE ROOF PLANE: no rim, no lit ring. Every one of those
   // hung under the vault and was lit from outside by a sun nothing occludes.
   // The shell's own hole, the black bore above it, and a bright disc set high
   // in the shaft so the hole has something to show when you look up it.
   kput('aiPool',[W.x,W.y0+(y1-W.y0)*.82,W.z],null,[W.r*1.9,1,W.r*1.9],
    new THREE.Color(dd?0x8e887a:0xcfc8b6));}
  // the pool of daylight at the foot
  const py2=W.cav?PY+.6:(W.room?W.room.y0+.5:SHELF+.5);
  kput('aiPool',[W.x,py2,W.z],null,[W.r*4.2,1,W.r*4.2],
   new THREE.Color(dd?0x5f5b50:0x9c9686));
  if(!dd)for(let i=0;i<10;i++){const th=i/10*TAU;
   kput('strip',[W.x+Math.cos(th)*W.r*.96,W.y0+H*.5+rr(-H*.3,H*.3),W.z+Math.sin(th)*W.r*.96],
    qEuler(0,-th-Math.PI/2,0),[W.r*.5,1.1,1.1],CYAN.clone().multiplyScalar(.6));}});

