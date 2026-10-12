 // ---- the master joint -----------------------------------------------------
 // Flatter and less gullied than the weathered face on purpose: a joint plane is
 // a fracture, and it has to read as a cut or the section preset is one more
 // picture of a cliff.
 const cutZ=(y)=>faceZ(XS,y)+2;
 const inCavCut=(y,z)=>{if(y<SILL+10)return false;
  if(z<ZB(XS)+10||z>lipZ(XS)-4)return false;
  const ry=roofY(XS,z);return ry>0&&y<ry-10;};
 // The lens's own footprint on the joint plane. The thickness test MUST be
 // guarded: lth() returns 0 everywhere outside the lens, so the bare
 // |y-LYC| < lth+1.5 was true for a 3 m band at EVERY z, and punched a 3 m slot
 // straight across 900 m of rock at the lens's centreline. It rendered as one
 // thin dark line on the section — the kind of thing that looks like a texture
 // band, survives four invariants and two screenshot rounds, and is only
 // settled by raycasting the face and finding the ray comes out the far side of
 // the massif.
 const inLensCut=(y,z)=>lth(XS,z)>1&&Math.abs(y-LYC)<lth(XS,z)+1.5;
 // THE JOINT PLANE NEVER GOES WEST OF XS. The relief is |noise|, not noise, so
 // the face only ever bulges OUT. Signed noise took it up to 14 m back into the
 // massif, and every cut gallery's floor, ceiling and plate — all of which end
 // at exactly XS, because that is what makes them land on the section — then
 // poked straight through the rock and hung in the air outside it: an 8 m slab
 // running 200 m along the cliff at the lens's own eye level, on a build whose
 // invariants were all green. Only a close camera on the face found it.
 const cutX=(y,z)=>XS+3+Math.abs((fbm(z*.0062,y*.0062,7137,3)*2-1)*11)
   +Math.abs((fbm(z*.021,y*.021,7138,2)*2-1)*5);
 // THE HOLLOW'S EDGE ON THE CUT. Whole quads are what a hole drops, so the top
 // of the hollow came back as a flight of 8 m stairs across every view of the
 // joint. The main face leaves a band CB m above the roof edge open too, and a
 // conformal strip whose lower edge IS the roof curve laps 0.9 m proud over the
 // stepped quads above it, with UVs recomputed from the main face's own (u,v)
 // so the bedding carries across. Arcoindian I has the same fix.
 const CB=15,cZa=ZB(XS)+10,cZb=lipZ(XS)-4;
 const cutU=(y,z)=>Math.pow(clamp((cutZ(y)-z)/(cutZ(y)+880),0,1),1/.85);
 const cutSX=(y,z)=>{const b=Math.min(1,cutU(y,z)*6);return cutX(y,z)*b+XS*(1-b);};
 const inCavBand=(y,z)=>{if(z<=cZa||z>=cZb)return false;
  const ry=roofY(XS,z);return ry>0&&y>=ry-10&&y<ry-10+CB;};
 {const g=gridSurface((u,v)=>{const z=lerp(cZa,cZb,u),y=roofY(XS,z)-10+v*(CB+10);
    return[cutSX(y,z)+.9*Math.min(1,v*3),y,z];},90,5,{uS:1,vS:1});
  const P=g.attributes.position,UV=g.attributes.uv;
  for(let i=0;i<P.count;i++){const y=P.getY(i),z=P.getZ(i);
   UV.setXY(i,cutU(y,z)*38,y/ctop(XS)*CT0/24);}
  CUT.push(g);}
 CUT.push(gridSurface((u,v)=>{const y=v*ctop(XS),z=lerp(cutZ(y),-880,Math.pow(u,.85));
   return[cutX(y,z)*Math.min(1,u*6)+XS*(1-Math.min(1,u*6)),y,z];},124,78,{uS:38,vS:CT0/24,
   hole:(u,v)=>{const y=v*ctop(XS),z=lerp(cutZ(y),-880,Math.pow(u,.85));
    return inCavCut(y,z)||inCavBand(y,z)||inLensCut(y,z)||inCutO(z,y)
      ||(Math.abs(z-A2ST.z)<A2ST.w*.5&&y>A2ST.y0&&y<A2ST.y1);}}));
 // REVEALS. Every opening returns 15 m into the rock — a sill, a head and two
 // cheeks. Without them a plane with rectangles cut in it is a sheet of card,
 // which is precisely the failure that killed three earlier cutaways.
 const RVD=15;
 const reveal=(z0,z1,y0,y1,dep,into)=>{
  for(const zz of [z0,z1])CUT.push(gridSurface((u,v)=>
   [cutX(lerp(y0,y1,u),zz)-v*dep,lerp(y0,y1,u),zz],8,3,{uS:6,vS:3}));
  for(const yy of [y0,y1])CUT.push(gridSurface((u,v)=>
   [cutX(yy,lerp(z0,z1,u))-v*dep,yy,lerp(z0,z1,u)],12,3,{uS:6,vS:3}));};
 CUTO.forEach(C=>reveal(C[0]+5,C[1]-5,C[2]+4,C[3]-4,RVD));
 reveal(A2ST.z-A2ST.w*.5,A2ST.z+A2ST.w*.5,A2ST.y0,A2ST.y1,RVD);
 // blocks along the crest and the spoil of the joint's own failure
 for(let i=0;i<64;i++){const z=rr(-860,cutZ(CT0*.9)),sc=rr(6,22);
  kput('aiBlock',[XS+rr(-14,16),ctop(XS)-rr(0,10)+sc*.3,z],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.16,.32)));}
 for(let b=0;b<3;b++){const by=52+b*52,bd=16+b*9;
  CUT.push(gridSurface((u,v)=>[XS+lerp(0,bd,v),by,lerp(cutZ(by),-840,Math.pow(u,.85))],36,3,{uS:24,vS:4}));
  CUT.push(gridSurface((u,v)=>[XS+bd,lerp(by,by-52,v),lerp(cutZ(by),-840,Math.pow(u,.85))],36,4,{uS:24,vS:5}));}
 for(let i=0;i<140;i++){const t=Math.pow(rng(),1.7),z=rr(-860,cutZ(20));
  const sc=rr(4,26)*(1-t*.5);
  kput('aiBlock',[XS+8+t*200,sc*.4+(1-t)*(1-t)*30,z],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.34),rr(.14,.30)));}

 // ---- the excavated galleries ----------------------------------------------
 const ZLIT={ind:new THREE.Color(0xffb257),cty:CYAN,cul:CYAN,pub:CYAN,
             dwe:WARM,lw:WARM,lrn:new THREE.Color(0xbfe6ff),mar:new THREE.Color(0xffe0b0)};
 const litOf=k=>(ZLIT[k]||WARM).clone().multiplyScalar(dd?rr(.10,.32):rr(.32,.88));
 const ROOMC=dd?DEAD:new THREE.Color(0x0f1720);
 const lring=(cx,cy,cz,r,n)=>stripRing(cx,cy,cz,r,d,n);
 const stoneC=()=>new THREE.Color().setHSL(rr(.06,.11),rr(.05,.16),dd?rr(.13,.24):rr(.23,.38));
 ROOMS.forEach((R,ri)=>{
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y0,lerp(R.z0,R.z1,v)],9,9,{uS:8,vS:8}));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y1,lerp(R.z0,R.z1,v)],9,9,{uS:8,vS:8,
   hole:(u,v)=>!!inWell(lerp(R.x0,R.x1,u),lerp(R.z0,R.z1,v),-1)}));
  RM.push(gridSurface((u,v)=>[R.x0,lerp(R.y0,R.y1,v),lerp(R.z0,R.z1,u)],9,6,{uS:8,vS:6}));
  if(!R.cut)RM.push(gridSurface((u,v)=>[R.x1,lerp(R.y0,R.y1,v),lerp(R.z0,R.z1,u)],9,6,{uS:8,vS:6}));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z0],9,6,{uS:8,vS:6}));
  const P=PASS.find(p=>p.z0===R.z1&&p.x>R.x0&&p.x<R.x1);
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z1],12,7,{uS:8,vS:6,
   hole:(u,v)=>{if(!P)return false;const x=lerp(R.x0,R.x1,u),y=lerp(R.y0,R.y1,v);
    return Math.abs(x-P.x)<P.w*.5&&y>P.y&&y<P.y+P.h;}}));
  // FLOOR PLATES: pale over a dark soffit, never the same grey as the void
  // behind them, or the whole section renders as one ramp.
  const st=18,np=Math.max(1,Math.floor((R.y1-R.y0-6)/st));
  for(let p=1;p<=np;p++){const py=R.y0+p*st;if(py>R.y1-5)break;
   const hl=(u,v)=>{const x=lerp(R.x0,R.x1,u),z=lerp(R.z0,R.z1,v);
    return !!inWell(x,z,-1)||(dd&&fbm(u*5+p,v*4,7139+p,3)<.26);};
   const pl=dy=>gridSurface((u,v)=>[lerp(R.x0+3,R.x1-(R.cut?0:3),u),py+dy,lerp(R.z0+3,R.z1-3,v)],
    10,8,{uS:6,vS:6,hole:hl});
   SH.push(pl(0));DK.push(pl(-1.3));
   const nq=Math.max(2,Math.round((R.x1-R.x0)/24));
   for(let q=0;q<nq;q++){const px2=lerp(R.x0+6,R.x1-6,(q+.5)/nq);
    if(rng()<(dd?.55:.28))continue;
    const zc2=rr(R.z0+13,R.z1-13),zl=rr(20,Math.min(90,(R.z1-R.z0)*.55));
    kput(BXD,[px2,py+(st-2)*.5,zc2],null,[1.1,st-3,zl],null);
    if(R.cut)for(let c=0;c<3;c++){const cz=zc2+((c+.5)/3-.5)*zl;
     if(rng()<(dd?.6:.22))continue;
     kput('aiPane',[px2+.9,py+4.0,cz],qFacing([1,0,0]),[5.2,3.2,1],
      rng()<(dd?.06:.5)?litOf(R.k):ROOMC);}}
   if(!dd&&rng()<.7)kput('strip',[(R.x0+R.x1)*.5,py+st-3,rr(R.z0+18,R.z1-18)],
    qEuler(0,Math.PI/2,0),[Math.min(64,(R.z1-R.z0)*.5),1.4,1.4],ZLIT[R.k]||CYAN);}
  if(ri%3===0)REGISTER({name:'Arcoindian II — excavated '+R.n.toLowerCase(),
   x:(R.x0+R.x1)*.5,z:(R.z0+R.z1)*.5,r:Math.max(40,(R.x1-R.x0)*.6),y:R.y0-2,h:R.y1-R.y0+4});
  const nf=Math.round((R.x1-R.x0)/17);
  for(let i=0;i<nf;i++){const fx=rr(R.x0+6,R.x1-6),fz=rr(R.z0+8,R.z1-8);
   if(inWell(fx,fz,4))continue;
   if(R.k==='ind'){const hh=rr(9,Math.min(30,R.y1-R.y0-8));
    kput(dd?'pipeR':'pipe',[fx,R.y0+hh*.5,fz],null,[rr(3,7),hh,rr(3,7)],null);}
   else{const hh=rr(3,7);
    kput(BX,[fx,R.y0+hh*.5,fz],qEuler(0,rng()*TAU,0),[rr(5,13),hh,rr(4,10)],null);}}});
 PASS.forEach(P=>{const za=Math.min(P.z0,P.z1),zb2=Math.max(P.z0,P.z1);
  const hw=P.half?0:P.w*.5;
  RM.push(gridSurface((u,v)=>[P.x+lerp(-hw,P.w*.5,u),P.y,lerp(za,zb2,v)],3,12,{uS:4,vS:12}));
  RM.push(gridSurface((u,v)=>[P.x+lerp(-hw,P.w*.5,u),P.y+P.h,lerp(za,zb2,v)],3,12,{uS:4,vS:12}));
  RM.push(gridSurface((u,v)=>[P.x-hw,lerp(P.y,P.y+P.h,v),lerp(za,zb2,u)],12,3,{uS:12,vS:4}));
  if(!P.half)RM.push(gridSurface((u,v)=>[P.x+P.w*.5,lerp(P.y,P.y+P.h,v),lerp(za,zb2,u)],12,3,{uS:12,vS:4}));
  if(!P.half){kput('aiPortal',[P.x,P.y,ZB(P.x)+1],qFacing([0,0,1]),[P.w/8,P.h/12,1],null);
   for(const s3 of [-1,1])kput(BX,[P.x+s3*(P.w*.5+3),P.y+P.h*.5,ZB(P.x)+3],null,[6,P.h+6,7],null);
   if(!dd)kput('strip',[P.x,P.y+P.h+.6,ZB(P.x)+4],null,[P.w,1.6,1.6],CYAN);}
  const nl=Math.max(2,Math.round((zb2-za)/22));
  for(let i=0;i<nl;i++){const pz=lerp(za+6,zb2-6,(i+.5)/nl);
   if(!dd)kput('strip',[P.x,P.y+P.h-1.6,pz],qEuler(0,Math.PI/2,0),[13,1.3,1.3],CYAN);}});

 // ---- THE LENS -------------------------------------------------------------
 // Two surfaces, top and bottom. They meet by construction wherever the
 // half-thickness reaches zero — the whole front edge and both flanks — so the
 // lens is a closed solid without a single explicit end cap. That is the payoff
 // of writing the form as a thickness rather than as a set of walls.
 const lensHole=(x,z)=>lth(x,z)<=0;
 const NLU=136,NLV=52;
 LNS.push(gridSurface((u,v)=>{const x=lerp(LCX-LWX,XS,u),a=lz0(x),b=lz1(x);
   const z=lerp(a,b,v);return[x,LYC+lth(x,z),z];},NLU,NLV,{uS:(XS-LCX+LWX)/9,vS:DZ/9,
   hole:(u,v)=>{const x=lerp(LCX-LWX,XS,u),z=lerp(lz0(x),lz1(x),v);
    return lensHole(x,z)||lG(x,z)||inNotch(x,z)||!!inWell(x,z,-2)
      ||(Math.abs(x-A2ST.x)<A2ST.w*.5&&Math.abs(z-A2ST.z)<A2ST.w*.5)
      ||(dd&&SCAR.o&&Math.hypot(x-SCAR.o.x,z-SCAR.o.z)<SCAR.o.r*.42);}}));
 UND.push(gridSurface((u,v)=>{const x=lerp(LCX-LWX,XS,u),a=lz0(x),b=lz1(x);
   const z=lerp(a,b,v);return[x,LYC-lth(x,z),z];},NLU,NLV,{uS:(XS-LCX+LWX)/9,vS:DZ/9,
   hole:(u,v)=>{const x=lerp(LCX-LWX,XS,u),z=lerp(lz0(x),lz1(x),v);
    return lensHole(x,z)||lG(x,z);}}));
 // RIBS ON THE BELLY. The underside is the single largest surface anyone sees
 // from the gorge — 500 x 250 m of it, hanging over a 430 m drop — and as one
 // smooth dark shell it read as a painted ellipse. Fore-and-aft ribs give it a
 // grain and a direction, and they run the way the load does: back into the
 // rock the lens is keyed into.
 for(let i=0;i<30;i++){const x=lerp(LCX-LWX+16,XS-6,(i+.5)/30);
  const a=lz0(x),b=lz1(x);if(!(b>a+40))continue;
  for(let j=0;j<32;j++){const z=lerp(a+10,b-6,(j+.5)/32),t=lth(x,z);
   if(t<7||lG(x,z))continue;
   kput(BXD,[x,LYC-t+1.1,z],null,[4.2,3.0,(b-a-16)/32*1.06],null);}}
 for(let j=0;j<9;j++){const z0f=(j+.5)/9;
  for(let i=0;i<86;i++){const x=lerp(LCX-LWX+16,XS-6,(i+.5)/86);
   const a=lz0(x),b=lz1(x);if(!(b>a+40))continue;
   const z=lerp(a+14,b-10,z0f),t=lth(x,z);
   if(t<9||lG(x,z))continue;
   kput(BXD,[x,LYC-t+1.4,z],null,[(LWX+XS-LCX-22)/86*1.06,2.6,5.2],null);}}
 // THE BANDS. Horizontal planes through the lens, so each one lands exactly on
 // the joint plane whatever the PRNG does. Each plate is punched wherever the
 // lens is thinner than its own height, which is what makes the six plates a
 // nest of decreasing lenses rather than six identical shelves — and that nest,
 // seen in the cut, is the sheet's section.
 for(let k=0;k<=NBD;k++){const py=k===NBD?DECK:bandY(k);
  const need=Math.abs(py-LYC);
  const hl=(u,v)=>{const x=lerp(LCX-LWX,XS,u),z=lerp(lz0(x),lz1(x),v);
   if(lth(x,z)<need+1.2||lG(x,z))return true;
   if(inWell(x,z,-2))return true;
   if(Math.abs(x-A2ST.x)<A2ST.w*.5&&Math.abs(z-A2ST.z)<A2ST.w*.5)return true;
   if(py>=NY-1&&inNotch(x,z))return true;
   if(dd&&SCAR.o&&Math.hypot(x-SCAR.o.x,z-SCAR.o.z)<SCAR.o.r*(.52-k*.06))return true;
   return dd&&fbm(u*7+k,v*5,7141+k,3)<.16;};
  const pl=dy=>gridSurface((u,v)=>{const x=lerp(LCX-LWX,XS,u);
    return[x,py+dy,lerp(lz0(x),lz1(x),v)];},92,40,{uS:60,vS:26,hole:hl});
  if(k===NBD)GRD.push(pl(0));else SH.push(pl(0));
  DK.push(pl(-1.4));}
 // the lens's cut face, and its reveals: the same rectangles that punch it
 LNS.push(gridSurface((u,v)=>{const a=lz0(XS),b=lz1(XS),z=lerp(a,b,u);
   return[XS,LYC+(v*2-1)*lth(XS,z),z];},72,34,{uS:24,vS:14,
   hole:(u,v)=>{const a=lz0(XS),b=lz1(XS),z=lerp(a,b,u);
    return inLCut(z,LYC+(v*2-1)*lth(XS,z));}}));
 LCUT.forEach(C=>{if(C[4])return;
  const z0=C[0]+2,z1=C[1]-2,y0=C[2]+2,y1=C[3]-2;
  for(const zz of [z0,z1])LNS.push(gridSurface((u,v)=>
   [XS-v*13,lerp(y0,y1,u),zz],6,3,{uS:5,vS:3}));
  for(const yy of [y0,y1])LNS.push(gridSurface((u,v)=>
   [XS-v*13,yy,lerp(z0,z1,u)],8,3,{uS:5,vS:3}));});
 // partitions and cells inside the bands, seen through the cut and the nose
 for(let k=0;k<NBD;k++){const y0=bandY(k),need=Math.abs(y0+BTH*.5-LYC);
  for(let i=0;i<34;i++){const x=rr(LCX-LWX+30,XS-8);
   const z=rr(lz0(x)+18,lz1(x)-14);
   if(lth(x,z)<need+6||lG(x,z)||inNotch(x,z)||inWell(x,z,6))continue;
   if(Math.abs(x-A2ST.x)<A2ST.w&&Math.abs(z-A2ST.z)<A2ST.w)continue;
   kput(BXD,[x,y0+BTH*.5,z],qEuler(0,rr(-.3,.3),0),[rr(14,44),BTH-3,1.1],null);
   if(rng()<.5)kput(BXD,[x,y0+BTH*.5,z],qEuler(0,Math.PI/2+rr(-.3,.3),0),[rr(12,38),BTH-3,1.1],null);}
  // a run of cells facing the cut, so a band laid open is inhabited
  for(let i=0;i<9;i++){const z=rr(lz0(XS)+20,lz1(XS)-18);
   if(lth(XS,z)<need+5)continue;
   kput('aiPane',[XS-.8,y0+BTH*.45,z],qFacing([1,0,0]),[5.4,3.4,1],
    rng()<(dd?.06:.55)?litOf(BAND[k].k):ROOMC);}
  REGISTER({name:'Arcoindian II — '+BAND[k].n.toLowerCase()+' (band '+(k+1)+')',
   x:LCX-20,z:-200,r:230,y:y0-1,h:BTH+2});}
 // THE NOSE. Each band's gallery stands where the lens has thinned to that
 // band's own half-height, so the five fronts stagger: the fat middle bands
 // reach nearly to the tip and the thin top and bottom ones sit well back. That
 // stagger is what makes the prow read as a section rather than as a shell.
 // Everything is hung ON the surface at the height lensFZ() solved for, not at
 // the band's own floor: a lens's bottom band is only reached at mid-depth, so a
 // slab laid at band 0's floor out at its front edge hangs ten metres below the
 // belly. That is exactly the class of placement error no invariant can see.
 const NSN=140;
 for(let k=0;k<NBD;k++){const ym=bandY(k)+BTH*.5,need=Math.max(9,Math.abs(ym-LYC));
  const up=ym<LYC?1:-1;                       // which way is INTO the lens here
  for(let i=0;i<NSN;i++){const x=lerp(LCX-LWX,XS,(i+.5)/NSN);
   const zf=lensFZ(x,need);if(zf==null||lG(x,zf))continue;
   if(inNotch(x,zf)||inNotch(x-4,zf)||inNotch(x+4,zf))continue;   // and clear of the court's cheeks, which it poked through
   const nrm=[0,0,1],bw=(LWX+XS-LCX)/NSN*1.08;
   // the walkway ledge along the outline, and a dark reveal band behind it
   kput(BX,[x,ym,zf-1.2],null,[bw,1.3,7],stoneC());
   kput(BXD,[x,ym+up*3.6,zf-2.6],null,[bw,5.4,3],null);
   for(let s2=0;s2<2;s2++){const cy=ym+up*(2.4+s2*4.4);
    if(rng()>(dd?.6:.93))continue;
    kput('aiPane',[x,cy,zf-1.6],qFacing(nrm),[4.4,2.8,1],
     rng()<(dd?.05:.36)?litOf(BAND[k].k):ROOMC);}
   if(rng()<(dd?.05:.13))kput('aiBalc',[x,ym+.4,zf+.6],qFacing(nrm),[5.2,2.2,4.0],stoneC());
   if(i%11===4&&!(dd&&rng()<.4))kput('aiPost',[x,ym+.9,zf+1.6],null,[1.7,up>0?7:2.6,1.7],stoneC());
   if(!dd&&i%17===6)kput('strip',[x,ym+1.9,zf+1.9],qFacing(nrm),[24,1.3,1.3],ZLIT[BAND[k].k]||CYAN);}}
 // THE FLANKS. KNOWN_ISSUES: "the lens's flanks are blank over ~150 m". Out
 // there the lens is too thin for the upper bands, so the nose galleries run
 // out and what is left is 150 m of smooth white shell either side of the sun
 // court. The upper shell is inhabited too: rows of windows set into it
 // parallel to the outline, each on a dark reveal strip, facing along the
 // shell's own normal (solved from lth()'s gradient), thinning out toward the
 // tips where the shell turns into the deck. Hashed, not rng(), so nothing
 // after them moves.
 {const yT=(x,z)=>LYC+lth(x,z);
  const OFF=[5,11,18,26,35,45];
  for(let r=0;r<OFF.length;r++)for(let i=0;i<150;i++){const x=lerp(LCX-LWX+8,XS-6,(i+.5)/150);
   if(x>NX0-8&&x<NX1+8)continue;                           // the sun court has its own face
   const z=lz1(x)-OFF[r]*(.55+.45*sx(x));
   const t=lth(x,z);if(t<5||lG(x,z)||inWell(x,z,4))continue;
   if(h3(i,r,3.7)<.18)continue;                            // a blank bay here and there
   const e=1.5,nx=-(yT(x+e,z)-yT(x-e,z))/(2*e),nz=-(yT(x,z+e)-yT(x,z-e))/(2*e);
   const L=Math.hypot(nx,1,nz),n=[nx/L,1/L,nz/L];
   if(n[1]>.93)continue;                                   // too flat: that is roof, not wall
   const q=qFacing(n),bw=(LWX+XS-LCX)/150*1.02,y=yT(x,z);
   kput(BXD,[x-n[0]*.8,y-n[1]*.8,z-n[2]*.8],q,[bw,3.6,1.6],null);
   kput('aiPane',[x+n[0]*.35,y+n[1]*.35,z+n[2]*.35],q,[bw*.72,2.6,1],
    h3(i,r,5.1)<(dd?.05:.34)?(ZLIT[BAND[Math.min(4,2+(r>>1))].k]||WARM).clone().multiplyScalar((dd?.1:.32)+.5*h3(i,r,6.2)):ROOMC);}}
 // THE SUN COURT: floor, back wall, cheeks, and a flight of steps down the
 // middle of it. Open over the nose, facing due south, catching the winter sun
 // the mouth is oriented for.
 {const ncOK=(x,z)=>lth(x,z)>LYC-NY+2;               // the floor needs belly under it
  GRD.push(gridSurface((u,v)=>{const x=lerp(NX0,NX1,u);
   return[x,NY,lerp(nzB(x),lz1(x)-4,v)];},40,26,{uS:20,vS:16,
   hole:(u,v)=>!ncOK(lerp(NX0,NX1,u),lerp(nzB(lerp(NX0,NX1,u)),lz1(lerp(NX0,NX1,u))-4,v))}));
  // THE BACK WALL OF THE COURT is the coronal section face: 62 m of lens fabric
  // standing due south, punched band by band with the same reveal treatment the
  // joint plane gets, so the three bands it crosses read as storeys and not as
  // holes in a retaining wall.
  const NCO=[];
  for(let k=0;k<NBD;k++){const y0=bandY(k)+3.5,y1=bandY(k)+BTH-3.5;
   if(y1<NY+3||y0>DECK-3)continue;
   for(let i=0;i<4;i++)NCO.push([lerp(NX0+16,NX1-16,i/4)+4,lerp(NX0+16,NX1-16,(i+1)/4)-4,
     Math.max(y0,NY+3),Math.min(y1,DECK-3),k]);}
  SH.push(gridSurface((u,v)=>{const x=lerp(NX0,NX1,u);
   return[x,lerp(NY,DECK,v),nzB(x)];},44,14,{uS:20,vS:8,
   hole:(u,v)=>{const x=lerp(NX0,NX1,u),y=lerp(NY,DECK,v);
    return NCO.some(C=>x>C[0]&&x<C[1]&&y>C[2]&&y<C[3]);}}));
  NCO.forEach(C=>{const z0=nzB(LCX);
   for(const xx of [C[0],C[1]])SH.push(gridSurface((u,v)=>
    [xx,lerp(C[2],C[3],u),z0-v*13],6,3,{uS:5,vS:3}));
   for(const yy of [C[2],C[3]])SH.push(gridSurface((u,v)=>
    [lerp(C[0],C[1],u),yy,z0-v*13],8,3,{uS:5,vS:3}));
   DK.push(gridSurface((u,v)=>[lerp(C[0],C[1],u),C[2]-1.3,z0-v*13],8,3,{uS:5,vS:3}));
   for(let i=0;i<4;i++){const px=lerp(C[0]+2,C[1]-2,(i+.5)/4);
    kput('aiPane',[px,C[2]+4.4,z0-1.4],qFacing([0,0,1]),[5.0,3.2,1],
     rng()<(dd?.06:.55)?litOf(BAND[C[4]].k):ROOMC);}});
  for(const sx2 of [NX0,NX1])SH.push(gridSurface((u,v)=>
   [sx2,lerp(NY,DECK,v),lerp(nzB(sx2),lz1(sx2)-4,u)],26,10,{uS:14,vS:7,
   hole:(u,v)=>!ncOK(sx2,lerp(nzB(sx2),lz1(sx2)-4,u))}));
  // the flight down into the court off the top deck
  for(let s2=0;s2<9;s2++){const sy=NY+s2*(DECK-NY)/9;
   const sz=nzB(LCX)+3-s2*3.2;
   GRD.push(gridSurface((u,v)=>[lerp(NX0+10,NX1-10,u),sy,lerp(sz,sz-3.2,v)],18,1,{uS:12,vS:1}));
   SH.push(gridSurface((u,v)=>[lerp(NX0+10,NX1-10,u),lerp(sy,sy-(DECK-NY)/9,v),sz-3.2],18,1,{uS:12,vS:1}));}
  if(!dd)for(let i=0;i<20;i++){const x=rr(NX0+12,NX1-12),z=rr(nzB(x)+18,lz1(x)-24);
   if(!ncOK(x,z))continue;
   kput('figB',[x,NY,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[x,NY,z],null,1,new THREE.Color(0xc9a17e));}
  for(let i=0;i<30;i++){const x=rr(NX0+10,NX1-10),z=rr(nzB(x)+14,lz1(x)-22);
   if(!ncOK(x,z))continue;
   if(rng()<.6)VEG.tree(x,NY,z,i%3,rr(6,dd?15:10));
   else kput('hedge',[x,NY+.9,z],qEuler(0,rng()*TAU,0),[rr(4,11),1.8,rr(2,4)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  REGISTER({name:'Arcoindian II — the sun court',x:LCX,z:nzB(LCX)+56,r:104,y:NY-6,h:78});}

 // ---- THE ROSETTES on the top deck -----------------------------------------
 // The plan the sheet draws: concentric semicircular rosettes set against the
 // back wall. They are half-round because the wall halves them, not because the
 // building is half of one.
 const ROS=[{x:LCX-168,r:80,k:'res',n:'Residential'},{x:LCX+104,r:68,k:'lw',n:'Living'}];
 ROS.forEach((P,pi)=>{const cz=ZB(P.x)+18;
  if(lG(P.x,cz+P.r*.4))return;                 // went down with the flank
  REGISTER({name:'Arcoindian II — '+P.n.toLowerCase()+' rosette',x:P.x,z:cz+P.r*.4,r:P.r+10,y:DECK-4,h:46});
  for(let ring=0;ring<3;ring++){const rr2=P.r*(.42+ring*.29);
   const nb=Math.max(8,Math.round(Math.PI*rr2/13));
   for(let i=0;i<nb;i++){const th=(i+.5)/nb*Math.PI;          // a half rosette: 0..PI
    const bx=P.x+Math.cos(th)*rr2,bz=cz+Math.sin(th)*rr2;
    if(lth(bx,bz)<LTH*.55)continue;
    if(dd&&rng()<.3)continue;
    const bh=8+ring*3.4;
    kput(BX,[bx,DECK+bh*.5,bz],qEuler(0,-th+Math.PI/2,0),[Math.PI*rr2/nb*.92,bh,10+ring*2],stoneC());
    for(let s2=0;s2<2;s2++)if(rng()<(dd?.5:.9))
     kput('aiPane',[bx+Math.cos(th)*5.6,DECK+3.2+s2*4.2,bz+Math.sin(th)*5.6],
      qFacing([Math.cos(th),0,Math.sin(th)]),[3.6,2.6,1],
      rng()<(dd?.05:.42)?litOf(P.k):ROOMC);
    if(rng()<(dd?.05:.14))kput('aiBalc',[bx+Math.cos(th)*5.2,DECK+2.2,bz+Math.sin(th)*5.2],
     qFacing([Math.cos(th),0,Math.sin(th)]),[4.6,2.2,3.0],stoneC());}
   if(!dd&&ring===2)lring(P.x,DECK+13,cz,rr2,Math.max(8,Math.round(Math.PI*rr2/12)));}
  // the court at the middle of the rosette
  GRD.push(gridSurface((u,v)=>{const th=u*Math.PI,r2=P.r*.40*(1-v);
    return[P.x+Math.cos(th)*r2,DECK+.3,cz+Math.sin(th)*r2];},22,4,{uS:12,vS:4}));
  for(let i=0;i<12;i++){const th=rng()*Math.PI,r2=rr(6,P.r*.36);
   const tx=P.x+Math.cos(th)*r2,tz=cz+Math.sin(th)*r2;
   if(lth(tx,tz)<LTH*.5)continue;
   VEG.tree(tx,DECK,tz,i%3,rr(5,dd?13:9));}});
 // THE CITY CENTER: a larger half-round amphitheatre against the back wall
 {const CCX=LCX-34,CCZ=ZB(CCX)+6,CCR=118;
  for(let s2=0;s2<7;s2++){const r2=CCR*(1-s2*.12),yy=DECK-s2*3.1;
   GRD.push(gridSurface((u,v)=>{const th=u*Math.PI,r3=lerp(r2,r2-CCR*.12,v);
     return[CCX+Math.cos(th)*r3,yy,CCZ+Math.sin(th)*r3];},40,1,{uS:24,vS:1,
     hole:(u,v)=>{const th=u*Math.PI,r3=lerp(r2,r2-CCR*.12,v);
      return lth(CCX+Math.cos(th)*r3,CCZ+Math.sin(th)*r3)<LTH*.45;}}));
   SH.push(gridSurface((u,v)=>{const th=u*Math.PI,r3=r2-CCR*.12;
     return[CCX+Math.cos(th)*r3,lerp(yy,yy-3.1,v),CCZ+Math.sin(th)*r3];},40,1,{uS:24,vS:1,
     hole:(u,v)=>{const th=u*Math.PI,r3=r2-CCR*.12;
      return lth(CCX+Math.cos(th)*r3,CCZ+Math.sin(th)*r3)<LTH*.45;}}));}
  const nc=Math.round(Math.PI*CCR/11);
  for(let i=0;i<nc;i++){const th=(i+.5)/nc*Math.PI;
   const px=CCX+Math.cos(th)*(CCR+7),pz=CCZ+Math.sin(th)*(CCR+7);
   if(lth(px,pz)<LTH*.42)continue;
   if(dd&&rng()<.34)continue;
   kput('aiPost',[px,DECK,pz],null,[2.3,15.2,2.3],null);
   kput(BX,[px,DECK+15.9,pz],qEuler(0,-th+Math.PI/2,0),[Math.PI*CCR/nc*1.06,1.4,4.2],null);}
  if(!dd){lring(CCX,DECK-19,CCZ,CCR*.30,18);
   for(let i=0;i<20;i++){const th=rng()*Math.PI,r2=rr(10,CCR*.8);
    const px=CCX+Math.cos(th)*r2,pz=CCZ+Math.sin(th)*r2;
    if(lth(px,pz)<LTH*.5)continue;
    const yy=DECK-Math.min(6,Math.floor((1-r2/CCR)/.12))*3.1;
    kput('figB',[px,yy,pz],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
    kput('figH',[px,yy,pz],null,1,new THREE.Color(0xc9a17e));}}
  REGISTER({name:'Arcoindian II — the city centre amphitheatre',x:CCX,z:CCZ+CCR*.4,r:CCR+12,y:DECK-26,h:56});}
 // THE CULTURAL CENTER along the front lip: a colonnaded gallery following the
 // lens's own outline, which is where the plan puts it.
 {let n2=0;
  for(let i=0;i<120;i++){const x=lerp(LCX-LWX+30,XS-6,(i+.5)/120);
   const z=lz1(x)-30;if(lth(x,z)<LTH*.34)continue;
   if(inNotch(x,z))continue;
   n2++;
   if(dd&&rng()<.3)continue;
   kput('aiPost',[x,DECK,z],null,[2.1,13.4,2.1],null);
   kput(BX,[x,DECK+14.1,z],null,[(2*LWX)/120*1.1,1.5,16],null);
   if(rng()<.4)kput(BX,[x,DECK+3.6,z-9],null,[(2*LWX)/120*1.05,7.2,9],stoneC());
   if(!dd&&i%9===3)kput('strip',[x,DECK+13,z+7],qFacing([0,0,1]),[22,1.3,1.3],CYAN);}
  if(n2)REGISTER({name:'Arcoindian II — the cultural centre',x:LCX-10,z:lz1(LCX)-30,r:250,y:DECK-4,h:34});}
 // dwellings and planting spread over the rest of the deck
 for(let i=0;i<(dd?150:210);i++){const x=rr(LCX-LWX+30,XS-8);
  const z=rr(lz0(x)+24,lz1(x)-34);
  if(lth(x,z)<LTH*.5||inNotch(x,z)||inWell(x,z,8))continue;
  if(ROS.some(P=>Math.hypot(x-P.x,z-(ZB(P.x)+18))<P.r+8))continue;
  if(Math.hypot(x-(LCX-34),z-(ZB(LCX-34)+6))<130)continue;
  const roll=rng();
  if(roll<.34){const bh=rr(6,13);
   kput(BX,[x,DECK+bh*.5,z],qEuler(0,rng()*TAU,0),[rr(6,14),bh,rr(5,10)],stoneC());
   for(let s2=0;s2<2;s2++)if(rng()<(dd?.4:.85))
    kput('aiPane',[x,DECK+2.8+s2*4,z+4.6],qFacing([0,0,1]),[3.2,2.4,1],
     rng()<(dd?.05:.4)?litOf('lw'):ROOMC);}
  else if(roll<.74)VEG.tree(x,DECK,z,i%3,rr(5,dd?15:10));
  else kput('hedge',[x,DECK+.9,z],qEuler(0,rng()*TAU,0),[rr(4,10),1.8,rr(1.6,3.4)],
   new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}

 // ---- THE ACCESS SHAFT -----------------------------------------------------
 // Built as its x < XS half so the joint plane lays it open over its full
 // 340 m, from the shelf to the plateau, through every band on the way.
 {const S2=A2ST,H2=S2.y1-S2.y0;
  RM.push(gridSurface((u,v)=>[S2.x-u*S2.w,lerp(S2.y0,S2.y1,v),S2.z-S2.w*.5],4,26,{uS:4,vS:20}));
  RM.push(gridSurface((u,v)=>[S2.x-u*S2.w,lerp(S2.y0,S2.y1,v),S2.z+S2.w*.5],4,26,{uS:4,vS:20}));
  RM.push(gridSurface((u,v)=>[S2.x-S2.w,lerp(S2.y0,S2.y1,v),S2.z+(u-.5)*S2.w],4,26,{uS:4,vS:20}));
  for(let i=0;i*4.8<H2-5;i++){const fy=S2.y0+i*4.8,dir=(i%2)?1:-1;
   if(dd&&rng()<.16)continue;
   kput('aiStair',[S2.x-S2.w*.5,fy,S2.z-dir*S2.w*.34],qFacing([0,0,dir]),[S2.w*.72,4.8,S2.w*.62],
    new THREE.Color(dd?0x6b6459:0xb7b0a2));
   if(i%2===0)kput(BX,[S2.x-S2.w*.5,fy-.7,S2.z],null,[S2.w*.86,1.4,S2.w*.9],
    new THREE.Color(dd?0x6b6459:0xb7b0a2));
   if(!dd&&i%4===0)kput('strip',[S2.x-2,fy+3.8,S2.z],qEuler(0,Math.PI/2,0),[S2.w*.8,1.2,1.2],CYAN);}
  // KNOWN_ISSUES: "the access shaft is a blank pale column except where the
  // joint lays it open". Where it stands free in the hollow (under the lens,
  // and between the lens and the vault) it gets a slot window at every other
  // landing on its two open faces, on a dark reveal: the stair inside shows as
  // a rising stagger. Hashed, not rng(), so nothing after it moves.
  {const lyc=LYC-lth(S2.x-S2.w*.5,S2.z),lyt=LYC+lth(S2.x-S2.w*.5,S2.z),
    rf=roofY(S2.x-S2.w*.5,S2.z);
   const FCS=[[[0,0,1],u=>[S2.x-S2.w*(.25+.5*u),S2.z+S2.w*.5]],
              [[-1,0,0],u=>[S2.x-S2.w,S2.z+S2.w*(.25-.5*u)]]];
   for(let i=1;i*4.8<H2-8;i+=2){const fy=S2.y0+i*4.8+1.2;
    if(fy<SILL+6||(fy>lyc-4&&fy<lyt+4)||(rf>0&&fy>rf-6))continue;
    FCS.forEach(([n,P],f)=>{for(let k=0;k<2;k++){if(h3(i,f*2+k,8.3)<.12)continue;
     const [px,pz]=P(k),q=qFacing(n);
     kput(BXD,[px-n[0]*.2,fy,pz-n[2]*.2],q,[S2.w*.36,3.4,1],null);
     kput('aiPane',[px+n[0]*.5,fy,pz+n[2]*.5],q,[S2.w*.28,2.6,1],
      h3(i,f*2+k,9.7)<(dd?.04:.3)?WARM.clone().multiplyScalar(dd?.15:.5):ROOMC);}});}}
  REGISTER({name:'Arcoindian II — the access shaft',x:S2.x-S2.w*.5,z:S2.z,r:S2.w,y:S2.y0-2,h:H2+4});}

