// ================================================================= THE IZIZ SPACEPORT (kit type izPort)
// Ported from settlements/iziz/src/79-iziz-original.js izSpaceport(), the
// ruined spaceport out along Iziz's north-west causeway: a stepped octagonal
// bunker hub under a dome, a control tower, six landing pads, a fuel farm, a
// broken perimeter wall and a wrecked freighter. The original only ever
// existed ruined, as a handful of scaled kit boxes; this is the same plan
// drawn whole and then taken down, every decay the kit's richest types have.
//
// Plan (local metres, bearing a: x = r cos a, z = r sin a; the kit's views
// stand south-west, bearing ~120-135):
//   hub     plinth (octagon, apothem 37 -> 34, 7 m, battered, a door with a
//           room behind it on every face, the great hall on the causeway
//           face), tier 2 (apothem 26, 7-13 m, a ribbon window band with the
//           offices behind it), the drum (r 16, 13-17.5 m, portholes) and the
//           dome (r 9). Cornices and sill bands are the mouldings.
//   tower   the control tower on the tier-2 roof at bearing 195: an octagonal
//           shaft 52 m tall, a flared glazed cab, a mast: 84 m to the beacon.
//   yard    a container yard at bearing 75, r 98.
//   pads    six at r 70 (bearings 45 + 60 i), each with a blast fence, edge
//           lights and a taxiway to the plinth; two small shuttles on them.
//   freighter on its berth at bearing 15, r 86, standing on four legs.
//   fuel    six tanks on a slab at bearing 135, r 84, piped to a header
//           (Iziz had it at 195; it swapped with the tower's fall line).
//   wall    r 120, gate at bearing 315 (the causeway, as in Iziz), lamp
//           posts, four floodlight masts inside it.
//
// DECAY. Decay 2 means TOPPLED here, as for the kit's towers: the control tower
// is the tall element, and it comes down. The reclaimed state is decay 4, the
// kit's Project slot (rehabilitated, still standing, lived in, fires at night):
//   0 intact     white metal, clean concrete, glass, lit strips
//   1 ruined     the tower snapped at 18 m and its cab lying beyond the plinth;
//                a sector of tier 2 collapsed onto the plinth roof; the dome
//                caved on its south side; the freighter nose-down, legs gone;
//                two tanks toppled; a shuttle gone, the other sunk; the wall
//                gapped; rust, holes, glass teeth, moss, vines, trees in the
//                cracked apron
//   2 toppled    the whole tower down across the apron in two pieces, the
//                dome gone, a wider collapse through tier 2 and the drum, the
//                freighter broken in two and burnt, four tanks down, a mast
//                down, more wall gone
//   3 rehab      no collapse (it was cleared and patched; the scene loop halves
//                the holes and runs repairPass): a beacon on the mast, warm
//                lamps, a salvaged shuttle on a pad, tent camps on two pads,
//                a palisade in the wall gaps, the freighter on its belly as a
//                workshop, a windsock
//   4 reclaimed  the decay-1 ruin lived in (the scene loop also runs
//                repairPass): shanties on the roofs and pads, gardens on the
//                pads, a market inside the gate, fires in the rooms, the
//                freighter's hold and the tier-2 bays, firelight at night
//   5 worn       the scene loop builds decay 0 and runs wornPass
//
// SEEDS. reseed(10460) opens the builder and the whole layout draws no rng()
// (decay choices are position hashes, altH), so every state shares one plan;
// the dressing then reseeds to 10461+d (10461..10465).
function buildIzSpaceport(scene,gx,gz,d){reseed(10460);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,RUIN=d===1||d===4,WRECK=d===2,FALL=RUIN||WRECK,LIVED=d===4,REHAB=d===3;
 const SK=SHELL(d),CM=CONC(d),T8=Math.tan(Math.PI/8),D2R=Math.PI/180;
 const ST=d===2?'toppled':d===4?'reclaimed':d===3?'rehabilitated':d>0?'ruined':'intact';
 const NM=s=>'Iziz spaceport — '+s+' ('+ST+')';
 const pol=(r,a)=>[r*Math.cos(a),r*Math.sin(a)];
 const wrapA=a=>((a%TAU)+TAU)%TAU;
 const inArc=(a,a0,a1)=>wrapA(a-a0)<wrapA(a1-a0);
 const nrm=a=>[Math.cos(a),0,Math.sin(a)];
 const BX=dd?'boxCR':'boxC',SL=dd?'slabCR':'slabC',PI_=dd?'pierR':'pierW',PO=dd?'postR':'postW',RG=dd?'ringR':'ringW',PL=dd?'plateR':'plateW';
 const cm=[],sk=[],dk=[],pv=[];                   // merged before the dressing: concrete, shell, dark, paving
 const FLM=LIVED?fireLightMark():null;
 // ---- octagon helpers: faces centred on bearings k*45deg; hole(k, bearing, w along the face, y)
 const oct=(acc,A0,A1,y0,y1,nu,nv,hole,cx,cz)=>{cx=cx||0;cz=cz||0;
  for(let k=0;k<8;k++){const c=k*Math.PI/4,nx=Math.cos(c),nz=Math.sin(c);
   acc.push(gridSurface((u,v)=>{const s=u*2-1,A=lerp(A0,A1,v),w=A*T8*s;return[cx+nx*A-nz*w,lerp(y0,y1,v),cz+nz*A+nx*w];},nu,nv,
    {uS:A0*T8/4,vS:(y1-y0)/8,hole:hole?(u,v)=>hole(k,c+Math.atan((u*2-1)*T8),(u*2-1)*A0*T8,lerp(y0,y1,v)):null}));}};
 const octRing=(acc,Ai,Ao,y,hole,nu,cx,cz)=>{cx=cx||0;cz=cz||0;
  for(let k=0;k<8;k++){const c=k*Math.PI/4,nx=Math.cos(c),nz=Math.sin(c);
   acc.push(gridSurface((u,v)=>{const s=u*2-1,A=lerp(Ai,Ao,v),w=A*T8*s;return[cx+nx*A-nz*w,y,cz+nz*A+nx*w];},nu||2,1,
    {uS:Ao*T8/4,vS:Math.max(.5,Ao-Ai)/8,hole:hole?(u,v)=>hole(k,c+Math.atan((u*2-1)*T8),0,y):null}));}};
 // a moulding: a band proud of an octagonal face, with its soffit and its top
 const octMould=(acc,A,y,h,p,hole,nu,cx,cz)=>{oct(acc,A+p,A+p,y,y+h,nu||2,1,hole,cx,cz);octRing(acc,A,A+p,y,hole,nu,cx,cz);octRing(acc,A,A+p,y+h,hole,nu,cx,cz);};

 // ================================================================ THE HUB
 const PA0=37,PA1=34,PH=7,TA=26,TY=7,TH=6,DR=16,DY=13,DH=4.5,DOME=9;
 const SPA=-Math.PI/4;                                       // the causeway's bearing (Iziz: 315deg)
 const COL=WRECK?[1.0,2.25]:RUIN?[1.45,2.15]:null;           // the collapsed sector of the upper tiers
 const inCol=a=>!!COL&&inArc(a,COL[0],COL[1]);
 const colH=(k,a)=>inCol(a);
 const DOOR=k=>k===7?[12,6]:[5,4];                          // the great hall faces the causeway
 const PA=y=>lerp(PA0,PA1,y/PH);
 oct(cm,PA0,PA1,0,PH,24,7,(k,a,w,y)=>{const D=DOOR(k);return Math.abs(w)<D[0]/2&&y<D[1];});
 octMould(cm,PA0,0,.8,.55,(k,a,w,y)=>Math.abs(w)<DOOR(k)[0]/2+.6,24);   // the base course
 octMould(cm,PA1,PH-1.05,1.05,.9,null,2);                    // the cornice
 octRing(cm,0,PA1,PH,null,2);                                // the plinth roof, tier 2's floor
 // the rooms behind the doors
 for(let k=0;k<8;k++){const c=k*Math.PI/4,n=nrm(c),t=[-n[2],0,n[0]],q=qFacing(n),[W,H]=DOOR(k),A=PA(H/2),Dp=k===7?16:8;
  const P=(a,w,y)=>[n[0]*a+t[0]*w,y,n[2]*a+t[2]*w];
  kput('boxD',P(A-Dp,0,H/2+.2),q,[W+2,H+.8,.5],null);
  for(const s of[-1,1])kput('boxD',P(A-Dp/2,s*(W/2+.8),H/2+.2),q,[.5,H+.8,Dp],null);
  kput('boxD',P(A-Dp/2,0,H+.5),q,[W+2,.4,Dp],null);
  kput(BX,P(A-Dp/2+1,0,.08),q,[W+2,.16,Dp+2],null);
  for(let j=0;j<(k===7?4:2);j++){const hh=altH(k,j,3,7);kput('strip',P(A-1.5-j*(Dp-2)/((k===7?4:2)-.5),0,H+.25),q,[W*.6,1,1],d===0?CYAN:REHAB&&hh<.5?WARM:DEAD);}
  kput('boxD',P(A-Dp*.62,0,.55),q,[W*.55,1.1,1],null);                     // a counter
  {const hh=altH(k,2,9,3);kput(d===0||hh<.3?'cell':'cellD',P(A-Dp+.4,W*.25,H*.6),q,[1.4,.9,1],d===0?CYAN:hh<.3?WARM:null);}
  if(k===7)for(const s of[-1,1])for(let j=1;j<4;j++)kput(PO,P(A-j*4,s*3.2,H/2),null,[.45,H,.45],null);   // the hall's columns
  // the portal: piers and a lintel, proud of the battered face
  for(const s of[-1,1])kput(BX,P(A+.35,s*(W/2+.7),(H+1.4)/2),q,[1.4,H+1.4,1.7],null);
  kput(BX,P(A+.45,0,H+.7),q,[W+2.8,1.4,1.9],null);
  // glazing: a glass door by day; in a ruin the frame keeps a few teeth
  if(d===0){kput('pane',P(A-.25,0,H/2),q,[W,H,1],null);for(let j=1;j<4;j++)kput('mullW',P(A-.2,W*(j/4-.5),H/2),q,[.5,H,.5],null);
   kput('strip',P(A+1.45,0,H+1.45),q,[W*.8,1,1],k===7?WARM:CYAN);}
  else{const hh=altH(k,5,1,2);if(hh<.6)civShardAt(P(A-.25,-W/4,H/2),q,W*.42,H*.85,.05,hh);if(altH(k,6,2,1)<.45)civShardAt(P(A-.25,W/4,H/2),q,W*.42,H*.85,.05,altH(k,1,6,5));}}
 // TIER 2: the offices behind a ribbon window, piers every third bay
 const BAND=[TY+1,TY+5];
 const t2bay=w=>Math.floor((w/(TA*T8)+1)*6);
 oct(cm,TA,TA,TY,TY+TH,12,6,(k,a,w,y)=>inCol(a)||(y>BAND[0]&&y<BAND[1]&&t2bay(w)%3!==0));
 octMould(cm,TA,BAND[0]-.35,.35,.4,colH,12);octMould(cm,TA,BAND[1],.35,.4,colH,12);
 octMould(cm,TA,TY+TH-.15,.9,.7,colH,12);                    // tier 2's cornice
 octRing(cm,0,TA,TY+TH,colH,12);                             // its roof, the drum's floor
 altRev(dk,0,0,18,TY,18,TY+TH,0,TAU,48,COL?(u)=>inCol(u*TAU):null);   // the core wall behind the offices
 civRooms({rFn:()=>25,y0:TY,y1:TY+TH,step:TH,d,seed:46,rIn:.72,gap:COL?inCol:null,out:[]});
 if(d===0){const ga=[];oct(ga,TA-.3,TA-.3,BAND[0],BAND[1],1,1,null);meshMerged(ga,MAT.glass,G);}
 else for(let k=0;k<8;k++)for(let b=0;b<12;b++){if(b%3===0)continue;const c=k*Math.PI/4,w=((b+.5)/6-1)*TA*T8,a=c+Math.atan(w/TA);if(inCol(a))continue;
  const hh=altH(k*13+b,TY,5);if(hh>.4)continue;const n=nrm(c),t=[-n[2],0,n[0]];
  civShardAt([n[0]*(TA-.3)+t[0]*w,(BAND[0]+BAND[1])/2,n[2]*(TA-.3)+t[2]*w],qFacing(n),1.7,3.4,.05,hh);}
 // the collapse: a roof slab slid down into the gap, its rubble on the plinth roof
 if(COL){const cmid=(COL[0]+COL[1])/2;
  for(let j=0;j<(WRECK?3:1);j++){const a=lerp(COL[0],COL[1],(j+.5)/(WRECK?3:1)),[x,z]=pol(21,a);
   kput('boxCR',[x,TY+2.6,z],qEuler(0,-a,0).multiply(qEuler(0,0,-.42-.1*j)),[12,.7,WRECK?13:15],null);}
  const[x,z]=pol(30,cmid);kput('boxCR',[x,PH+.6,z],qEuler(.2,-cmid+.5,.12),[6,1.2,4],null);}
 // THE DRUM: portholes, a lit band, the operations room inside
 const drumHole=(()=>{const hf=holeFn(dd*.7,463,null,1.6);return(u,y)=>(WRECK&&inCol(u*TAU))||(hf?hf(u,y):false);})();
 mesh(lathe({rFn:()=>DR,H:DH,nu:64,nv:4,hole:drumHole}),SK,G,0,DY,0);
 altRev(sk,0,0,DOME-.2,DY+DH,DR+.7,DY+DH,0,TAU,64,WRECK?(u)=>inCol(u*TAU):null);
 altRev(sk,0,0,DR+.7,DY+DH,DR+.7,DY+DH-.7,0,TAU,64,WRECK?(u)=>inCol(u*TAU):null);
 for(let k=0;k<16;k++){const a=(k+.5)/16*TAU;if(WRECK&&inCol(a))continue;const n=nrm(a),p=[n[0]*(DR+.1),DY+2.1,n[2]*(DR+.1)],q=qFacing(n);
  if(d===0)kput('ovalI',p,q,[.85,.85,1],null);else civWin('ovalD',p,q,[.85,.85,1],.45);
  const hh=altH(k,DY,11);kput('strip',[n[0]*(DR+.25),DY+DH-1.1,n[2]*(DR+.25)],qEuler(0,-a-Math.PI/2,0),[TAU*DR/16*.8,1,1],d===0?CYAN:REHAB&&hh<.4?WARM:DEAD);}
 kput(PO,[0,DY+DH/2,0],null,[2.2,DH,2.2],null);
 for(let k=0;k<10;k++){const a=(k+.5)/10*TAU;if(WRECK&&inCol(a))continue;const n=nrm(a),q=qFacing([-n[0],0,-n[2]]);
  kput('boxD',[n[0]*11.5,DY+.6,n[2]*11.5],q,[2.4,1.2,1],null);
  const hh=altH(k,4,DY);kput(d===0||(REHAB&&hh<.5)?'cell':'cellD',[n[0]*11.3,DY+1.35,n[2]*11.3],q.clone().multiply(qEuler(-.5,0,0)),[1.6,.8,1],d===0?CYAN:REHAB&&hh<.5?WARM:null);}
 // THE DOME: whole, caved on its south side in a ruin, gone in a wreck
 if(!WRECK){const hf=holeFn(dd*.9,467,null,2.2);
  altDome(sk,0,DY+DH,0,DOME,.06,Math.PI/2,.8,(u,v)=>(RUIN&&v<.42+.32*fbm(u*9,1.7,4.4,2)+.18*Math.cos((u-.32)*TAU))||(hf?hf(u,v*12):false),36,10);
  kput(RG,[0,DY+DH+DOME*.8-.1,0],qEuler(Math.PI/2,0,0),[DOME*.55,DOME*.55,3],null);
  kput(PO,[0,DY+DH+DOME*.8+1.2,0],null,[.3,2.6,.3],null);
  if(RUIN)for(let j=0;j<5;j++){const a=lerp(1.4,2.6,altH(j,1,2)),r=4+5*altH(j,2,3);kput(PL,[r*Math.cos(a),DY+.6,r*Math.sin(a)],qEuler(altH(j,3,4)*1.2-.6,altH(j,4,5)*3,altH(j,5,6)*1.2-.6),[4+3*altH(j,6,7),.25,3+2*altH(j,7,8)],null);}}
 else{altRev(sk,0,0,DOME-.2,DY+DH,DOME*.94,DY+DH+1.6,0,TAU,36,(u)=>altH(Math.floor(u*36),1,7)<.45);}
 REGISTER({name:NM('hub'),x:0,z:0,r:PA0+1.5,h:DY+DH+(WRECK?2:DOME)});

 // ================================================================ THE CONTROL TOWER
 const TB=195*D2R,[TX,TZ]=pol(21,TB),TY0=TY+TH,SH=52,TA0=3.6,TA1=3.1,TAy=y=>lerp(TA0,TA1,y/SH);
 // shaft section yA..yB (shaft-local heights), drawn with yA at (ox,oy,oz); jag ragged-tops the last metres
 const shaft=(sa,da,ox,oy,oz,yA,yB,jag,seed)=>{const L=yB-yA;
  oct(sa,TAy(yA),TAy(yB),oy,oy+L,3,Math.max(2,Math.round(L/1.5)),jag?(k,a,w,y)=>y-oy>L-jag*(.25+.75*altH(k,Math.round(w),seed)):null,ox,oz);
  oct(da,TAy(yA)-.45,TAy(yB)-.45,oy,oy+L-(jag||0)*.6,1,1,null,ox,oz);};
 const shaftWin=(ox,oy,oz,yA,yB,cut)=>{for(let y=Math.ceil((yA+2)/4.5)*4.5;y<yB-2.5;y+=4.5){if(cut!=null&&y>cut-2)break;
  for(let k=0;k<8;k+=2){const c=k*Math.PI/4+(Math.floor(y/4.5)%2)*Math.PI/4,n=nrm(c),A=TAy(y)+.05,p=[ox+n[0]*A,oy+y-yA,oz+n[2]*A],q=qFacing(n);
   if(d===0)kput('winSmI',p,q,1,null);else civWin('winSmD',p,q,1,.5);}}};
 const shaftMould=(sa,ox,oy,oz,yA,yB,cut)=>{for(const y of[SH*.5,SH-1.6])if(y>yA&&y<yB-1&&(cut==null||y<cut-1))octMould(sa,TAy(y),oy+y-yA,.8,.4,null,2,ox,oz);};
 // the cab, its floor at (ox,oy,oz): a flared skirt, slanted glazing, an eave, a roof; cabKit adds mullions, consoles, the mast
 const cabGeo=(sa,da,ox,oy,oz,glass)=>{
  altRev(sa,ox,oz,TA1+.2,oy-3.2,9.6,oy,0,TAU,32);altRev(da,ox,oz,0,oy+.05,9.6,oy+.05,0,TAU,32);
  if(glass){const ga=[];altRev(ga,ox,oz,9.6,oy,10.6,oy+4.6,0,TAU,32);mesh(ga[0],MAT.glass,G);}
  altRev(da,ox,oz,0,oy+4.6,10.6,oy+4.6,0,TAU,32);
  altRev(sa,ox,oz,10.6,oy+4.6,11.1,oy+4.7,0,TAU,32);altRev(sa,ox,oz,11.1,oy+4.7,11.1,oy+5.8,0,TAU,32);altRev(sa,ox,oz,11.1,oy+5.8,0,oy+6.8,0,TAU,32);};
 const cabKit=(ox,oy,oz,glass,mast)=>{
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU,n=nrm(a);if(!glass&&!mast&&altH(k,oy,9)<.3)continue;
   beam(PI_,[ox+n[0]*9.6,oy,oz+n[2]*9.6],[ox+n[0]*10.6,oy+4.6,oz+n[2]*10.6],.3,.3);
   if(!glass&&altH(k,oy,3)<.35)civShardAt([ox+n[0]*10.1,oy+2.3,oz+n[2]*10.1],qFacing(n).multiply(qEuler(-.22,0,0)),3.4,4,.05,altH(k,oy,4));}
  for(let k=0;k<8;k++){const a=k/8*TAU,n=nrm(a),q=qFacing(n),hh=altH(k,7,oy);kput('boxD',[ox+n[0]*7.6,oy+.6,oz+n[2]*7.6],q,[2.6,1.2,1],null);
   const on=d===0||(REHAB&&hh<.6);kput(on?'cell':'cellD',[ox+n[0]*7.8,oy+1.35,oz+n[2]*7.8],q.clone().multiply(qEuler(-.6,0,0)),[1.8,.7,1],on?(d===0?CYAN:WARM):null);}
  if(mast){kput(PO,[ox,oy+6.8+6,oz],null,[.35,12,.35],null);kput(RG,[ox,oy+6.8+8,oz],qEuler(Math.PI/2,0,0),[1.6,1.6,4],null);
   kput(PL,[ox+1.2,oy+6.8+10,oz],qEuler(0,.5,.3),[.2,2.4,1.6],null);
   if(d===0||REHAB)kput('dot',[ox,oy+6.8+12.3,oz],null,[1.2,1.6,3],d===0?new THREE.Color(0xff5040):WARM);}};
 // lay a piece of the tower down: shaft +y along bearing `a`, footprint centred at r `rc`, rolled `roll`
 const layPiece=(a,rc,roll,build)=>{const F=new THREE.Group();G.add(F);const dir=new THREE.Vector3(Math.cos(a),-.04,Math.sin(a)).normalize();
  F.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir).premultiply(qAxis(dir.x,dir.y,dir.z,roll));
  const[x,z]=pol(rc,a);F.position.set(x,0,z);const fa=[],fd=[];build(fa,fd,false);meshMerged(fa,SK,F);meshMerged(fd,MAT.dark,F);dropFragment(F,0,.7);
  useGroupXF(F);build(null,null,true);endGroupXF();return F;};
 if(!FALL){shaft(sk,dk,TX,TY0,TZ,0,SH);shaftMould(sk,TX,TY0,TZ,0,SH,null);shaftWin(TX,TY0,TZ,0,SH,null);cabGeo(sk,dk,TX,TY0+SH,TZ,d===0);cabKit(TX,TY0+SH,TZ,d===0,true);
  REGISTER({name:NM('control tower'),x:TX,z:TZ,r:12,h:SH+20,y:TY0});}
 else if(RUIN){const cut=18;shaft(sk,dk,TX,TY0,TZ,0,cut,3.5,31);shaftWin(TX,TY0,TZ,0,cut,cut-1);
  for(let y=4.5;y<cut-2;y+=4.5)kput('slab',[TX,TY0+y,TZ],null,[TA0-.6,.35,TA0-.6],CIV_FLOOR);
  REGISTER({name:NM('control tower stump'),x:TX,z:TZ,r:6,h:cut+1,y:TY0});
  // the top: from 32 m up to the cab, lying beyond the plinth; the length between shattered
  const top=layPiece(TB+.12,58,.5,(fa,fd,kit)=>{if(!kit){shaft(fa,fd,0,0,0,32,SH,null);shaftMould(fa,0,0,0,32,SH,null);cabGeo(fa,fd,0,SH-32,0,false);}
   else{shaftWin(0,0,0,32,SH,null);cabKit(0,SH-32,0,false,false);}});
  REGISTER({name:NM('control tower cab, fallen'),x:top.position.x,z:top.position.z,r:14,h:16});}
 else{const cut=4;shaft(sk,dk,TX,TY0,TZ,0,cut,2.5,37);
  REGISTER({name:NM('control tower stump'),x:TX,z:TZ,r:6,h:cut+1,y:TY0});
  // toppled: the whole shaft down along its bearing, in two pieces with a gap and a kink
  const p1=layPiece(TB+.05,56,.2,(fa,fd,kit)=>{if(!kit){shaft(fa,fd,0,0,0,cut,30,2.2,41);shaftMould(fa,0,0,0,cut,30,28);}else shaftWin(0,0,0,cut,30,28);});
  const p2=layPiece(TB+.12,88,-.35,(fa,fd,kit)=>{if(!kit){shaft(fa,fd,0,0,0,31,SH,null);shaftMould(fa,0,0,0,31,SH,null);cabGeo(fa,fd,0,SH-31,0,false);}
   else{shaftWin(0,0,0,31,SH,null);cabKit(0,SH-31,0,false,false);}});
  {const[x,z]=pol(106,TB+.16);kput(PO,[x,.5,z],qEuler(Math.PI/2,0,TB+.16+Math.PI/2),[.35,12,.35],null);}   // the mast, flung on
  REGISTER({name:NM('control tower, fallen'),x:p1.position.x,z:p1.position.z,r:14,h:12});
  REGISTER({name:NM('control tower cab, fallen'),x:p2.position.x,z:p2.position.z,r:15,h:16});}

 // ================================================================ THE PADS
 const PADS=[0,1,2,3,4,5].map(i=>{const a=(45+60*i)*D2R,[x,z]=pol(70,a);return{i,a,x,z};});
 for(const P of PADS){const{a,x,z,i}=P;
  kput(SL,[x,.4,z],null,[13,.8,13],null);
  kput(RG,[x,.85,z],qEuler(Math.PI/2,0,0),[10,10,3],null);
  if(!FALL)for(const r of[0,Math.PI/2])kput(PL,[x,.83,z],qEuler(0,-a+r,0),[7,.06,1.1],null);
  for(let k=0;k<16;k++){const b=(k+.5)/16*TAU,hh=altH(i,k,23);kput('strip',[x+12.4*Math.cos(b),.88,z+12.4*Math.sin(b)],qEuler(0,-b-Math.PI/2,0),[2.4,1,1],d===0?CYAN:REHAB&&i===1?WARM:DEAD);}
  // the blast fence on the outward side, and the taxiway in
  const fh=(u)=>dd&&altH(i,Math.floor(u*12),29)<(WRECK?.45:.25);
  altRev(cm,x,z,15.6,0,15.6,4.2,a-1,a+1,12,fh);altRev(cm,x,z,16.4,0,16.4,4.2,a-1,a+1,12,fh);altRev(cm,x,z,15.6,4.2,16.4,4.2,a-1,a+1,12,fh);
  {const[mx,mz]=pol(48.5,a);kput(BX,[mx,.3,mz],qEuler(0,-a,0),[20,.36,9],null);
   for(const s of[-1,1])for(let j=0;j<4;j++){const[lx,lz]=pol(41+j*5,a),t=[-Math.sin(a),Math.cos(a)];kput('strip',[lx+t[0]*s*4.4,.54,lz+t[1]*s*4.4],qEuler(0,-a,0),[1.6,1,1],d===0?WARM:DEAD);}}
  REGISTER({name:NM('landing pad '+(i+1)),x,z,r:16.5,h:8});}
 // the two shuttles (pads 1 and 3)
 const hR=t=>t>.72?Math.sqrt(Math.max(0,1-Math.pow((t-.72)/.28,2))):t<.1?.8+.2*t/.1:1;
 const hull=(acc,L,R,ry,t0,t1,hole,nu,nv)=>acc.push(gridSurface((u,v)=>{const t=lerp(t0,t1,v),ph=u*TAU,r=hR(t)*R;return[(t-.5)*L,r*ry*Math.cos(ph),r*Math.sin(ph)];},
  nu||24,nv||16,{uS:R*TAU/8,vS:L*(t1-t0)/8,hole:hole?(u,v)=>hole(u,lerp(t0,t1,v)):null}));
 const hullCap=(acc,L,R,ry,t)=>acc.push(gridSurface((u,v)=>{const ph=u*TAU,r=hR(t)*R*v;return[(t-.5)*L,r*ry*Math.cos(ph),r*Math.sin(ph)];},24,1,{}));
 const nozzle=(acc,x,y,z,r0,r1,h)=>acc.push(new THREE.CylinderGeometry(r0,r1,h,14,1,true).rotateZ(Math.PI/2).translate(x-h/2,y,z));
 const shuttle=(sa,da,hole,yc)=>{const L=18,R=2.4,ry=.8;hull(sa,L,R,ry,0,1,hole,20,12);hull(da,L,R*.9,ry,.04,.96,null,12,6);hullCap(sa,L,R,ry,0);
  altPrism(sa,[[-8,-8],[-8,8],[2,1.8],[2,-1.8]],-.55,-.2);altFin(sa,[[-9,0],[-4.5,0],[-8.4,4.4]],.35,0,R*ry*.7,0,0);
  for(const s of[-1,1])nozzle(da,-L/2,0,s*.95,.6,.85,1.4);
  for(const g of sa.slice(-4))g.translate(0,yc,0);for(const g of da.slice(-3))g.translate(0,yc,0);};
 const SHUT=[PADS[1],PADS[3]];
 SHUT.forEach((P,si)=>{const yaw=P.a+Math.PI/2+.3*si;
  if(WRECK&&si===1)return;if(RUIN&&si===1)return;           // gone (flown, or stripped)
  const C=new THREE.Group();G.add(C);const sa=[],da=[],hf=dd?holeFn(WRECK?1.4:1,71+si,null,2):null,hole=hf?(u,t)=>hf(u,t*18):null;
  const onLegs=d===0||(REHAB&&si===0);const yc=onLegs?3.6:2.1;shuttle(sa,da,hole,yc);
  C.position.set(P.x,.8,P.z);C.rotation.y=-yaw;if(!onLegs){C.rotation.order='YXZ';C.rotation.x=WRECK?.5:.22;C.rotation.z=WRECK?-.25:-.12;}
  meshMerged(sa,SK,C);meshMerged(da,MAT.dark,C);if(!onLegs)dropFragment(C,.8,.6);
  useGroupXF(C);
  if(onLegs)for(const[lx,lz]of[[4,0],[-5,-2],[-5,2]])kput(PO,[lx,(yc-.5)/2,lz],null,[.18,yc-.5,.18],null);
  kput(d===0?'darkPane':'boxD',[6.2,yc+1.55,0],qFacing([.6,.8,0]),[2,1.2,1],null);
  if(REHAB)for(let j=0;j<5;j++)kput('patchPlate',[-4+j*2,yc+2.05,(j%2?-.6:.6)],qEuler(-Math.PI/2+.2,0,(j-2)*.1),[1.8,1.4,1],null);
  endGroupXF();
  REGISTER({name:NM('shuttle'),x:P.x,z:P.z,r:10,h:10});});

 // ================================================================ THE FREIGHTER
 let FG=null;
 const FB=15*D2R,[FX,FZ]=pol(86,FB),FL=46,FR=7,FRY=.78;
 kput(SL,[FX,.5,FZ],null,[24,1,24],null);kput(RG,[FX,1.05,FZ],qEuler(Math.PI/2,0,0),[21,21,3],null);
 {const fyaw=-(FB+Math.PI/2);
  // the hull, in pieces: [t0,t1, group transform]
  const hatch=(u,t)=>Math.abs((t-.5)*FL)<6&&u>.2&&u<.33;         // the cargo door, on the +z flank
  const fhf=dd?holeFn(WRECK?1.5:1.1,83,null,2.4):null;
  const fh=(u,t)=>hatch(u,t)||(fhf?fhf(u,t*FL):false);
  const piece=(t0,t1,place,mat,tail)=>{const F=new THREE.Group();G.add(F);const sa=[],da=[],yc=FR*FRY+2.6;
   hull(sa,FL,FR,FRY,t0,t1,fh,28,Math.round(24*(t1-t0))+2);hull(da,FL,FR*.93,FRY,t0+.02,Math.min(t1,.97),hatch,16,8);
   if(t0>0)hullCap(da,FL,FR*.93,FRY,t0+.02);else hullCap(sa,FL,FR,FRY,0);
   if(t1<1)hullCap(da,FL,FR*.93,FRY,Math.min(t1,.97));
   if(tail){for(const[z,y]of[[-3,-1],[0,1.7],[3,-1]])nozzle(sa,-FL/2,y,z,1.7,2.5,3.2);
    altFin(sa,[[-FL/2,0],[-FL/2+9,0],[-FL/2+1.5,7.5]],.7,0,FR*FRY*.75,0,0);
    for(const s of[-1,1])acBox(sa,-FL/2+5,-.5,s*(FR+2.2),7,.7,4.5);}
   if(t1>.75)acBox(sa,12,FR*FRY+1,0,9,2.6,6.4);                  // the bridge
   for(const g of sa)g.translate(0,yc,0);for(const g of da)g.translate(0,yc,0);
   meshMerged(sa,mat,F);meshMerged(da,MAT.dark,F);place(F);return F;};
  const kitIn=(F,fn)=>{useGroupXF(F);fn(FR*FRY+2.6);endGroupXF();};
  const fit=(yc,front,back)=>{   // the hold and the bridge windows
   if(back){kput('boxD',[0,yc-FR*FRY*.62,0],null,[14,.3,FR*1.5],null);
    for(let j=0;j<6;j++){const hh=altH(j,3,83);kput(hh<.5?(dd?'boxR':'boxW'):PL,[-5+j*2,yc-FR*FRY*.62+1.1,-1.5+3*hh],qEuler(0,hh,0),[1.8,2,1.8],null);}
    for(let j=0;j<3;j++)kput('strip',[-4+j*4,yc+FR*FRY*.7,0],null,[3,1,1],d===0?CYAN:DEAD);}
   if(front){const wy=FR*FRY+1.4+yc;kput(d===0?'darkPane':'boxD',[16.6,wy,0],qFacing([1,0,0]),[5.6,1.3,1],null);
    for(const s of[-1,1])kput(d===0?'darkPane':'boxD',[12,wy,s*3.25],qFacing([0,0,s]),[7.4,1.3,1],null);
    if(d===0)for(let j=0;j<3;j++)kput('cell',[16.85,wy,-1.8+j*1.8],qFacing([1,0,0]),[.9,.6,1],j===1?WARM:CYAN);}};
  if(d===0){FG=piece(0,1,F=>{F.position.set(FX,0,FZ);F.rotation.y=fyaw;},SK,true);
   kitIn(FG,yc=>{for(const sx of[-1,1])for(const sz of[-1,1]){const a=[sx*12,yc-FR*FRY*.7,sz*3.5],b=[sx*13.5,.4,sz*7.5];beam('strutW',a,b,.9,.9);kput('plateW',[b[0],.3,b[2]],null,[3.4,.6,3.4],null);}
    // the ramp down from the open hold
    beam('plateW',[0,yc-FR*FRY*.62,FR*.95],[0,.3,FR+6],7,.35);fit(yc,true,true);});}
  else if(REHAB){FG=piece(0,1,F=>{F.position.set(FX,-1.6,FZ);F.rotation.y=fyaw;F.rotation.order='YXZ';F.rotation.x=.04;},SK,true);
   kitIn(FG,yc=>{fit(yc,true,true);beam('plank',[0,yc-FR*FRY*.62,FR*.95],[0,1.8,FR+5],6,.3);});}
  else if(RUIN){FG=piece(0,1,F=>{F.position.set(FX,0,FZ);F.rotation.order='YXZ';F.rotation.set(.12,fyaw-.35,-.2);dropFragment(F,0,2.4);},SK,true);
   kitIn(FG,yc=>{fit(yc,true,true);for(let j=0;j<4;j++)kput('ringR',[-14+j*9,yc,0],qEuler(0,Math.PI/2,0),[FR*.94,FR*FRY*.94,3],null);});
   {const b=[FX+Math.cos(FB)*16,0,FZ+Math.sin(FB)*16];beam('strutR',[b[0],.5,b[2]],[b[0]+9,1.4,b[2]+3],.9,.9);}}   // a leg, torn off
  else{// WRECK: broken in two at the hold, the stern burnt out
   const fwd=piece(.47,1,F=>{F.position.set(FX+Math.cos(FB+Math.PI/2)*14,0,FZ+Math.sin(FB+Math.PI/2)*14);F.rotation.order='YXZ';F.rotation.set(-.1,fyaw+.25,.3);dropFragment(F,0,2);},SK,false);
   const aft=piece(0,.42,F=>{F.position.set(FX-Math.cos(FB+Math.PI/2)*14,0,FZ-Math.sin(FB+Math.PI/2)*14);F.rotation.order='YXZ';F.rotation.set(.35,fyaw-.4,.1);dropFragment(F,0,2.6);},MAT.guts,true);
   kitIn(fwd,yc=>fit(yc,true,false));FG=fwd;
   kitIn(aft,yc=>{for(let j=0;j<3;j++)kput('ringR',[-20+j*4.5,yc,0],qEuler(0,Math.PI/2,0),[FR*.94,FR*FRY*.94,3],null);});}
  REGISTER({name:NM('freighter'),x:FX,z:FZ,r:WRECK?30:27,h:FR*2+6});}

 // ================================================================ THE FUEL FARM
 const FA=135*D2R,[QX,QZ]=pol(84,FA),QTH=Math.PI/2-FA;
 const loc=(lx,lz)=>[QX+lx*Math.cos(QTH)+lz*Math.sin(QTH),QZ-lx*Math.sin(QTH)+lz*Math.cos(QTH)];
 kput(BX,[QX,.7,QZ],qEuler(0,QTH,0),[34,1.4,22],null);
 const DOWN=WRECK?[1,2,4,5]:RUIN?[2,4]:[];
 const TK=[0,1,2,3,4,5].map(i=>{const[x,z]=loc(-11+(i%3)*11,-5.5+Math.floor(i/3)*11);return{i,x,z};});
 for(const T of TK){const{i,x,z}=T;
  if(DOWN.includes(i)){const F=new THREE.Group();G.add(F);const ta=[];altCyl(ta,0,0,0,4.6,4.6,10,20);
   if(i!==5||!WRECK)altDome(ta,0,10,0,4.6,0,Math.PI/2,.5,null,20,4);
   meshMerged(ta,SK,F);let dx=x-QX,dz=z-QZ;const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;const sw=(altH(i,2,5)-.5)*.5;
   const cx=dx*Math.cos(sw)-dz*Math.sin(sw),cz=dx*Math.sin(sw)+dz*Math.cos(sw);F.position.set(x+cx*7,0,z+cz*7);
   F.rotation.order='YXZ';F.rotation.set(Math.PI/2*.97,Math.atan2(cx,cz),0);dropFragment(F,0,.4);continue;}
  const rupt=WRECK&&i===0;
  if(rupt){mesh(lathe({rFn:()=>4.6,H:10,nu:24,nv:8,hole:(u,y)=>(u>.28&&u<.47&&y>1.5+3*Math.abs(u-.37)*10)||y>9}),SK,G,x,1.4,z);}
  else{altCyl(sk,x,1.4,z,4.6,4.6,10,20);altDome(sk,x,11.4,z,4.6,0,Math.PI/2,.5,null,20,4);
   kput(RG,[x,7.2,z],qEuler(Math.PI/2,0,0),[4.7,4.7,2.5],null);kput(RG,[x,3.6,z],qEuler(Math.PI/2,0,0),[4.7,4.7,2.5],null);}
  const[hx,hz]=loc(-11+(i%3)*11,0);beam(dd?'pipeR':'pipe',[x,2.6,z],[hx,2.6,hz],.35,.35);}
 {const a=loc(-17,0),b=loc(17,0);beam(dd?'pipeR':'pipe',[a[0],2.6,a[1]],[b[0],2.6,b[1]],.55,.55);
  const c=loc(17,0),e=pol(PA0+.5,FA);beam(dd?'pipeR':'pipe',[c[0],.9,c[1]],[e[0],.9,e[1]],.45,.45);}
 REGISTER({name:NM('fuel farm'),x:QX,z:QZ,r:22,h:16});
 // the cargo yard: two rows of containers end to end, some stacked; a ruin knocks some over
 const YA=75*D2R,[YX,YZ]=pol(98,YA),YR=[Math.cos(YA),Math.sin(YA)],YT=[-Math.sin(YA),Math.cos(YA)],YARD=[];
 kput(BX,[YX,.32,YZ],qEuler(0,-YA,0),[18,.4,26],null);
 for(let i=0;i<14;i++){const lr=(i%2?4:-4)*1.55,lt=(Math.floor(i/2)-3)*3.2,x=YX+YR[0]*lr+YT[0]*lt,z=YZ+YR[1]*lr+YT[1]*lt,hh=altH(i,5,YA);
  const col=new THREE.Color().setHSL([.06,.08,.57,.1,.02][(hh*5)|0],dd?.25:.45,dd?.4:.6);
  for(let tier=0;tier<(hh>.55?2:1);tier++){const fell=dd&&tier===1&&altH(i,6,1)<(WRECK?.8:.5),tip=dd&&tier===0&&altH(i,7,2)<(WRECK?.3:.12);
   if(fell){kput(dd?'boxR':'boxW',[x+YR[0]*7+YT[0]*hh*3,1.25,z+YR[1]*7+YT[1]*hh*3],qEuler(0,-YA+hh*1.4,Math.PI/2*.98),[6,2.5,2.5],col);continue;}
   if(tip){kput(dd?'boxR':'boxW',[x,1.75,z],qEuler(0,-YA,0).multiply(qEuler(Math.PI/2,0,0)),[6,2.5,2.6],col);YARD.push([x,z,0]);continue;}
   kput(dd?'boxR':'boxW',[x,.52+1.3+tier*2.62,z],qEuler(0,-YA,0),[6,2.6,2.5],col);
   kput('boxD',[x+YR[0]*(lr>0?3.02:-3.02),.52+1.3+tier*2.62,z+YR[1]*(lr>0?3.02:-3.02)],qEuler(0,-YA,0),[.08,2.3,2.2],null);   // the doors, outward
   if(tier===0)YARD.push([x+YR[0]*(lr>0?3.4:-3.4),z+YR[1]*(lr>0?3.4:-3.4),lr>0?1:-1]);}}
 REGISTER({name:NM('cargo yard'),x:YX,z:YZ,r:16,h:7});

 // ================================================================ THE WALL, THE GATE, THE MASTS
 const WR=120,NW=60;const gapW=a=>Math.abs(Math.atan2(Math.sin(a-SPA),Math.cos(a-SPA)))<.11||Math.abs(Math.atan2(Math.sin(a-SPA-Math.PI),Math.cos(a-SPA-Math.PI)))<.05;
 const wallGone=[];
 for(let i=0;i<NW;i++){const t0=i/NW*TAU,t1=(i+1)/NW*TAU,tm=(t0+t1)/2;if(gapW(tm))continue;
  const hh=altH(i,1,WR),gone=dd&&hh<(WRECK?.42:.28),low=dd&&!gone&&altH(i,2,WR)<.3;
  const a=pol(WR,t0),b=pol(WR,t1),len=Math.hypot(b[0]-a[0],b[1]-a[1]),m=[(a[0]+b[0])/2,(a[1]+b[1])/2],q=qEuler(0,-tm-Math.PI/2,0);
  if(gone){wallGone.push(i);continue;}
  const h=low?1.4+altH(i,3,1):3.2;
  kput(BX,[m[0],h/2,m[1]],q,[len+.3,h,1.2],null);
  if(!low)kput(BX,[m[0],h+.18,m[1]],q,[len+.5,.36,1.8],null);    // the coping
  if(i%5===0){const lean=dd?altH(i,4,2)-.5:0;kput(PO,[a[0],4.5,a[1]],qEuler(lean*.3,0,lean*.25),[.25,9,.25],null);
   kput('dot',[a[0]+lean*1.3,9.1,a[1]],null,[.6,.5,.8],d===0?WARM:DEAD);}}
 // the gate on the causeway: piers, a sign beam, the road out
 {const n=nrm(SPA),t=[-n[2],0,n[0]];
  for(const s of[-1,1]){const p=[n[0]*WR+t[0]*s*14,0,n[2]*WR+t[2]*s*14];kput(BX,[p[0],4.5,p[2]],qEuler(0,-SPA,0),[3.2,9,3.2],null);kput(BX,[p[0],9.3,p[2]],qEuler(0,-SPA,0),[4,.6,4],null);}
  if(!FALL){kput(dd?'boxR':'boxW',[n[0]*WR,10.4,n[2]*WR],qEuler(0,-SPA-Math.PI/2,0),[31,1.7,1],null);
   for(let j=0;j<6;j++)kput('strip',[n[0]*(WR+.6)+t[0]*(j-2.5)*4.4,10.4,n[2]*(WR+.6)+t[2]*(j-2.5)*4.4],qEuler(0,-SPA-Math.PI/2,0),[3.4,1,1],d===0?CYAN:REHAB&&j%2?WARM:DEAD);}
  else{const p=[n[0]*(WR+5)+t[0]*3,0,n[2]*(WR+5)+t[2]*3];kput('boxR',[p[0],.7,p[2]],qEuler(.1,-SPA-Math.PI/2+.4,.05),[31,1.7,1],null);}
  const r0=pol(WR+38,SPA);kput(BX,[r0[0],.2,r0[1]],qEuler(0,-SPA,0),[76,.4,15],null);
  const r1=pol(PA0+40,SPA);kput(BX,[r1[0],.3,r1[1]],qEuler(0,-SPA,0),[80,.3,13],null);}
 const MASTS=[45,165,255,345].map(b=>b*D2R);
 MASTS.forEach((a,mi)=>{const[x,z]=pol(104,a),down=WRECK&&mi===1,lean=RUIN&&mi===2;
  if(down){const F=new THREE.Group();G.add(F);F.position.set(x+8,0,z);F.rotation.set(0,a,Math.PI/2*.96);dropFragment(F,0,.3);
   useGroupXF(F);kput(PO,[0,13,0],null,[.55,26,.55],null);kput(dd?'boxR':'boxW',[0,26.6,0],null,[3.4,1.2,1.4],null);endGroupXF();return;}
  const q=lean?qEuler(.12,0,-.16):null;const F=new THREE.Group();F.position.set(x,0,z);if(q)F.quaternion.copy(q);G.add(F);
  useGroupXF(F);kput(PO,[0,13,0],null,[.55,26,.55],null);for(let j=0;j<3;j++)kput(PO,[0,8+j*7,0],qEuler(0,j,Math.PI/2),[.12,3,.12],null);
  const fq=qFacing([-Math.cos(a),0,-Math.sin(a)]);kput(dd?'boxR':'boxW',[0,26.6,0],fq,[3.6,1.3,1.4],null);
  for(let j=-1;j<=1;j++){const p=new THREE.Vector3(j*1.15,26.1,.8).applyQuaternion(fq);kput('dot',[p.x,p.y,p.z],fq,[.8,.6,.6],d===0||REHAB?WARM:DEAD);}
  endGroupXF();});
 REGISTER({name:NM('perimeter'),x:0,z:0,r:WR+2,h:30});

 // ================================================================ THE APRON
 {const hf=dd?(u,v)=>fbm(u*40,v*9,7.7,2)<(WRECK?.36:.3):null;
  pv.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(PA0+.2,WR+1,v);return[r*Math.cos(a),.25,r*Math.sin(a)];},96,10,{uS:(WR*TAU)/8,vS:(WR-PA0)/8,hole:hf}));}
 apron(G,0,0,WR+1,WR+12,d,.25);
 meshMerged(cm,CM,G);meshMerged(pv,CM,G);meshMerged(sk,SK,G);meshMerged(dk,MAT.dark,G);

 // ================================================================ DECAY DRESSING (own stream)
 reseed(10461+d);
 if(dd){const lush=WRECK?1.3:1;
  rubbleRing(0,0,0,PA0,PA0+8,WRECK?90:60,1.8);
  scatterMoss(0,PH,0,TA+1,PA1-1,Math.round(26*lush),1.5);mossOnRing(0,TY+TH,0,DR+5,18,1.4);
  for(const[A,y,nn,L]of[[PA1+1,PH-.4,Math.round(28*lush),5.5],[TA+.8,TY+TH-.2,16,4.5]])for(let i=0;i<biomeN(nn);i++){const k=(rng()*8)|0,w=rr(-.9,.9)*A*T8,c=k*Math.PI/4;
   if(y>TY&&inCol(c+Math.atan(w/A)))continue;kput('vine',[Math.cos(c)*A-Math.sin(c)*w,y,Math.sin(c)*A+Math.cos(c)*w],qEuler(rr(-.12,.12),0,rr(-.12,.12)),[rr(.8,1.6),rr(2.5,L),rr(.8,1.6)],null);}
  for(const P of PADS)if(altH(P.i,9,1)<.7)scatterMoss(P.x,.85,P.z,0,12,Math.round(12*lush),1.3);
  scatterMoss(0,.1,0,PA0+2,WR-4,Math.round(90*lush),1.8);
  for(const i of wallGone){const[x,z]=pol(WR,(i+.5)/NW*TAU);if(!REHAB)rubbleRing(x,0,z,0,4,7,1.3);}
  // trees in the cracked apron, kept off the pads, the berth and the farm
  const keep=(x,z)=>PADS.some(P=>Math.hypot(x-P.x,z-P.z)<19)||Math.hypot(x-FX,z-FZ)<30||Math.hypot(x-QX,z-QZ)<24||Math.hypot(x-YX,z-YZ)<18||Math.hypot(x,z)<PA0+4;
  const nT=Math.round((WRECK?34:22)*(LIVED?.6:1));for(let i=0;i<nT;i++){const a=rng()*TAU,r=rr(PA0+6,WR-6),x=r*Math.cos(a),z=r*Math.sin(a);if(keep(x,z))continue;VEG.tree(x,terrainH(x+KOFF[0],z+KOFF[2]),z,i%3,rr(5,12));}
  for(let i=0;i<biomeN(28);i++){const a=rng()*TAU,r=rr(WR+14,WR+60);VEG.tree(r*Math.cos(a),terrainH(r*Math.cos(a)+KOFF[0],r*Math.sin(a)+KOFF[2]),r*Math.sin(a),i%3,rr(7,15));}
  if(FALL){const[x,z]=pol(PA0+6,TB+.1);rubbleRing(x,0,z,0,10,WRECK?60:36,2.4);
   const[cx,cz]=pol(30,(COL[0]+COL[1])/2);rubbleRing(cx,PH,cz,0,4.5,WRECK?50:34,1.6);
   const[fx,fz]=[FX,FZ];rubbleRing(fx,0,fz,8,26,WRECK?60:40,2);}
  if(WRECK){const[x,z]=pol(28,1.6);rubbleRing(x,TY+TH,z,0,6,30,1.5);rubbleRing(0,DY,0,0,DOME,40,1.6);}}
 else{for(let i=0;i<biomeN(12);i++){const a=rng()*TAU,r=rr(WR+16,WR+60);VEG.tree(r*Math.cos(a),terrainH(r*Math.cos(a)+KOFF[0],r*Math.sin(a)+KOFF[2]),r*Math.sin(a),i%3,rr(7,14));}}
 // REHABILITATED: the field working again on salvage
 if(REHAB){
  for(const i of wallGone){const t0=i/NW*TAU,t1=(i+1)/NW*TAU,a=pol(WR,t0),b=pol(WR,t1),len=Math.hypot(b[0]-a[0],b[1]-a[1]),tm=(t0+t1)/2;
   for(let j=0;j<5;j++){const f=(j+.5)/5,x=lerp(a[0],b[0],f),z=lerp(a[1],b[1],f);kput('plank',[x,1.3,z],qEuler(rr(-.06,.06),-tm,rr(-.05,.05)),[.35,rr(2.3,2.9),len/5*.95],null);}
   kput('plank',[(a[0]+b[0])/2,2.1,(a[1]+b[1])/2],qEuler(0,-tm-Math.PI/2,0),[len,.25,.3],null);}
  for(const pi of[2,4]){const P=PADS[pi];for(let k=0;k<8;k++){const a=rr(0,TAU),r=rr(3,10),sz=rr(2.6,4.4),tx=P.x+r*Math.cos(a),tz=P.z+r*Math.sin(a);
    const c=new THREE.Color().setHSL(rr(.05,.12),.4,rr(.42,.6));
    for(const s of[-1,1])kput('patchTarp',[tx+Math.cos(a+Math.PI/2)*s*sz*.35,.8+sz*.28,tz+Math.sin(a+Math.PI/2)*s*sz*.35],qEuler(0,-a,0).multiply(qEuler(-s*.9,0,0)),[sz*1.4,sz*.9,1],c);}
   kput('waterButt',[P.x+4,1.8,P.z-3],null,[1.1,2,1.1],null);firePit('izPortR',P.x-2,.85,P.z+2,.6);}
  {const[x,z]=pol(100,TB+.35);kput('postR',[x,5,z],null,[.15,10,.15],null);kput('patchTarp',[x+1.6,9.4,z],qEuler(0,.4,-.1),[3,1,1],new THREE.Color(0xd86a2a));}   // the windsock
  {const sd=nrm(FB),ax=nrm(FB+Math.PI/2);for(let k=0;k<4;k++){const x=FX+sd[0]*(FR+5)+ax[0]*(k-1.5)*9,z=FZ+sd[2]*(FR+5)+ax[2]*(k-1.5)*9;
    kput('shantyBox',[x,1.4,z],qEuler(0,-FB-Math.PI/2,0),[6,2.8,4],null);kput('shantyRoof',[x,3.1,z],qEuler(0,-FB-Math.PI/2,0).multiply(qEuler(.2,0,0)),[7,1,5],null);kput('dot',[x+sd[0]*2.05,2.2,z+sd[2]*2.05],qFacing(sd),[1,1,1],WARM);}}
  figures(0,0,6,90);figures(PADS[2].x,PADS[2].z,5,9);}
 // RECLAIMED: the ruin lived in
 if(LIVED){
  for(let k=0;k<8;k++){if(altH(k,8,1)<.35)continue;const n=nrm(k*Math.PI/4),A=PA(2)-(k===7?7:4);firePit('izPort',n[0]*A,.2,n[2]*A,k===7?1.2:.8);}
  for(let k=0;k<8;k++)for(let b=0;b<12;b++){if(b%3===0)continue;const c=k*Math.PI/4,w=((b+.5)/6-1)*TA*T8,a=c+Math.atan(w/TA);if(inCol(a))continue;
   if(fbm(k*1.3+b*.21,2.2,4.1,2)<.52)continue;const n=nrm(c),t=[-n[2],0,n[0]];
   fireWindow([n[0]*(TA-.6)+t[0]*w,(BAND[0]+BAND[1])/2-.4,n[2]*(TA-.6)+t[2]*w],n,qFacing(n),rr(2,3),rr(2.2,3));}
  if(FG){useGroupXF(FG);const yc=FR*FRY+2.6;firePit('izPort',0,yc-FR*FRY*.62+.2,0,1);for(let j=0;j<3;j++)fireWindow([-14+j*12,yc+1,FR*.97],[0,0,1],qFacing([0,0,1]),2.2,1.6);
   for(let j=0;j<4;j++){kput('shantyBox',[-12+j*7,yc+FR*FRY+1.4,rr(-1.5,1.5)],qEuler(0,rr(-.3,.3),0),[5,2.8,4],null);kput('shantyRoof',[-12+j*7,yc+FR*FRY+3,0],qEuler(.18,0,0),[6,1,5],null);}endGroupXF();}
  // gardens on three pads, shanties on two, the market inside the gate
  for(const pi of[0,2,5]){const P=PADS[pi],yaw=P.a;for(let k=0;k<7;k++){const o=(k-3)*3;
    kput('hedge',[P.x+Math.cos(yaw+Math.PI/2)*o,1.05,P.z+Math.sin(yaw+Math.PI/2)*o],qEuler(0,-yaw,0),[18-Math.abs(o)*.9,.5,1.1],new THREE.Color().setHSL(rr(.18,.32),.5,rr(.28,.42)));}
   kput('waterButt',[P.x+9,1.8,P.z],null,[1.1,2,1.1],null);}
  for(const pi of[1,4]){const P=PADS[pi];for(let k=0;k<9;k++){const a=k/9*TAU+rr(-.2,.2),r=rr(4,10),x=P.x+r*Math.cos(a),z=P.z+r*Math.sin(a),w=rr(3,5),h=rr(2.4,3.2),yw=-a+rr(-.3,.3);
    kput('shantyBox',[x,.8+h/2,z],qEuler(0,yw,0),[w,h,rr(3,4.5)],null);kput('shantyRoof',[x,.8+h+.15,z],qEuler(rr(.1,.22),yw,0),[w*1.25,1,4.8],null);}
   firePit('izPort',P.x,.85,P.z,1);}
  {const n=nrm(SPA),t=[-n[2],0,n[0]];for(let k=0;k<12;k++){const r=PA0+46+k*5,s=k%2?1:-1,x=n[0]*r+t[0]*s*9,z=n[2]*r+t[2]*s*9,yaw=-SPA;
    for(const[ex,ez]of[[-1,-1],[1,-1],[-1,1],[1,1]])kput('postR',[x+t[0]*ex*1.6+n[0]*ez*1.2,1.3,z+t[2]*ex*1.6+n[2]*ez*1.2],null,[.09,2.6,.09],null);
    kput('patchTarp',[x,2.75,z],qEuler(-Math.PI/2+.12,0,0).premultiply(qEuler(0,yaw,0)),[3.8,3,1],new THREE.Color().setHSL(rr(0,.12),rr(.4,.7),rr(.45,.62)));
    kput('planter',[x,.45,z],qEuler(0,yaw,0),[2.6,.9,1],null);if(k%3===0)firePit('izPort',x+t[0]*s*3,.1,z+t[2]*s*3,.5);}
   figures(n[0]*(PA0+70),n[2]*(PA0+70),10,22);}
  for(const[x,z,s]of YARD){if(!s||altH(x,z,3)<.4)continue;const n=[YR[0]*s,0,YR[1]*s];fireWindow([x-n[0]*.3,1.9,z-n[2]*.3],n,qFacing(n),1.8,1.9);kput('patchTarp',[x+n[0]*1.4,2.9,z+n[2]*1.4],qFacing(n).multiply(qEuler(-1.1,0,0)),[2.4,2.4,1],new THREE.Color().setHSL(rr(0,.1),.5,.5));}
  acReclaim(G,{up:70,side:30,r:50,stalls:8,plots:6,people:12,key:'izPort'});
  fireLights(FLM,3);}
 figures(0,0,dd?4:10,100);
 civFlatten(G);
 KOFF=[0,0,0];return G;}
