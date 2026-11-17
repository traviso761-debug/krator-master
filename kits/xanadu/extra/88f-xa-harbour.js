// ================================================================= XANADU — the lake harbour: the quay, the mole, the warehouse, the drydock, the slip, the river bridge, the white dress
// OPT-IN until the kit's next all-builds rebuild (kits/xanadu/README.md, "Opt-in pieces"; 2026-11-17, settlements/kirstabal
// KNOWN_ISSUES.md, the stand-ins the town owed the kit; the owner: "make a real quay model and fill the other stand-ins with a
// proper model"): settlements/kirstabal takes it through its kit.json "external". Each
// piece is drawn in its own frame, front +z, its deck or waterline at local y 0 unless noted, opening with its own reseed.
// Seeds 34301-34399.
//   xa_harbour_quay   a 34 m run of quay (the old xa_quay was a 24 m slab in a 34 m plot): a battered ashlar wall in courses,
//                     the weed line at the water (local y -2.4: the town sets the deck 2.4 m over the lake), granite coping,
//                     a paved deck, bollards, mooring rings, fenders, water stairs down the face; v 0 a jib crane, v 1 a
//                     cargo stack and a weighing tripod, v 2 the harbour master's tally shed
//   xa_mole_run       the breakwater, o.len metres long (default 34): a quay face on the harbour side (-z), a paved top, a
//                     parapet on the lake side (+z) with boulder armour under it, lamps; o.len stretches it to its run
//   xa_river_span     a 26 m piece of a segmental stone arch bridge (along z): v 0 a pier with cutwaters and a refuge over it,
//                     a half arch either side meeting the next piece's at the crown; v 1 the abutment: a half arch on +z, the
//                     solid abutment and its wing walls on -z
//   xa_slip           the barge slip: a stone ramp into the lake (its head at y 0, -z), timber ways, a capstan, a work barge's
//                     hull in frame on its cradle
//   xa_harbour_warehouse  the waterfront warehouse: a stone ground storey of arched loading bays, a lime-washed loft storey
//                     (v 1: two), a hoist beam over the loft door, a tiled gable roof, the loading platform; v 2 a timber
//                     arcade along its front
//   xa_drydock        the graving dock (its rim at y 0, 2.4 m over the lake: the town sets it so): stepped side walls, the head
//                     wall's stair, mitre gates at the lake end standing open with their balance beams, the pump house's
//                     treadwheel, sheerlegs; drawn flooded with a cargo barge (extra/88d's xa_lake_barge, when the page has
//                     it) afloat in it under scaffolds (the lake's water is one plane: a dry basin needs core/water to mask it)
// The lake craft are extra/88d-xa-lakecraft.js's (the dugout, the launch, the cargo barge), tagged as vessels there.
//   xa_monastery_white  the monastery (77-xa-sacred) in the White Monastery's lime-white (Qiblai's white monastery, the owner,
//                     2026-11-16): the same builder and seed under a paint filter, as the Palopo twins (88-xa-dress)

// ---------------------------------------------------------------- shared: the courses of a stone face, bollards, a lamp
// a face of ashlar courses along x (length L, centred on x0), its front at z = zf facing +z (s = 1) or -z (s = -1), from y0 up to
// y1: each course a row of blocks, the joints staggered, each lower course 4 cm proud (the batter), the wet courses darker
function xhCourses(x0,L,zf,s,y0,y1,stone,wet){const ch=.6,n=Math.max(1,Math.round((y1-y0)/ch)),h=(y1-y0)/n;
 for(let k=0;k<n;k++){const y=y1-(k+1)*h,pr=k*.04,c=y+h<wet?stone.clone().multiplyScalar(.62):stone,off=k%2?.6:0;
  for(let x=-L/2-off;x<L/2;x+=1.2){const a=Math.max(x,-L/2),b=Math.min(x+1.2,L/2);if(b-a<.05)continue;
   vB('vStone',x0+(a+b)/2,y,zf-s*(.5-pr),b-a-.03,h-.03,1+.0,0,c.clone().multiplyScalar(rr(.9,1.06)));}}
 if(wet>y0&&wet<y1)vB('vStone',x0,wet-.25,zf+s*(n*.04*.5+.01),L,.5,.06,0,xC(0x4a5a3c));}   /* the weed line at the water */
function xhBollard(x,y,z){const ir=xC(0x2a2826);vPst('vIron',x,y,z,.17,.5,ir);vBall('vBall',x,y+.55,z,.22,ir,.14);}
function xhLamp(x,y,z,lit){const ir=xC(0x2a2826);vPst('vIron',x,y,z,.07,3.6,ir);vB('vIron',x,y+3.6,z,.36,.08,.36,0,ir);
 vB('vIron',x,y+3.7,z,.3,.45,.3,0,ir);vBall('vBulb',x,y+3.92,z,.13);kput('xConeP',[x,y+4.25,z],null,[.26,.3,.26],ir);if(lit)vBall('vBulb',x,y+3.92,z,.16);}
function xhFolk(x,z,n,s){if(typeof vnFolk==='function')vnFolk(x,z,n,s);}

// ---------------------------------------------------------------- the quay: 34 m along x, its face at z = +5 over the water
function buildXaHarbourQuay(G,o){reseed(34301+(o.v|0));const V=xV(o),L=34,F=5,stone=xC(xPick(XPAL.stone)),cope=stone.clone().multiplyScalar(1.14),tim=xC(0x5a4632),lit=xLit();
 vnReg('Quay',0,0,L/2,6);
 vB('vStone',0,-7.2,-.2,L,6.9,10.2,0,stone.clone().multiplyScalar(.8));          /* the body, behind the face */
 xhCourses(0,L,F,1,-7.2,-.35,stone,-2.4);
 vB('vStone',0,-.35,F-.45,L,.35,1.0,0,cope);                                      /* the coping, a hand proud of the face */
 xnPave(0,-.5,L,9,0,stone.clone().multiplyScalar(.95),1.6,-.35);                 /* the deck's flags, top at 0 */
 for(let k=0;k<4;k++){const x=-L/2+4.25+k*8.5;xhBollard(x,0,F-.6);              /* a bollard, and a ring on the face under it */
  kput('vHoop',[x,-1.1,F+.08],null,[.2,.2,.4],xC(0x2a2826));vB('vIron',x,-.95,F+.02,.12,.18,.1,0,xC(0x2a2826));}
 for(let k=0;k<8;k++){const x=-L/2+2.1+k*4.25;vB('vWood',x,-3.1,F+.18,.3,3.0,.3,0,tim);}   /* the fenders */
 vB('vWood',0,-1.2,F+.36,L,.28,.24,0,tim);                                        /* their rubbing strake */
 for(const x of[-11,11])vB('vDarkB',x,-1.7,F+.03,.36,.3,.04,0);                 /* drain outlets */
 /* water stairs down the face, a flight against the wall, its outer side walled */
 {const x0=V===1?-L/2+3:L/2-9;for(let k=0;k<8;k++)vB('vStone',x0+k*.42,-.3-(k+1)*.3,F+.85,.44,.3,1.5,0,stone.clone().multiplyScalar(k>5?.65:.92));
  vB('vStone',x0+1.7,-2.7,F+1.7,3.8,2.7,.3,0,stone.clone().multiplyScalar(.85));vB('vStone',x0+1.7,0,F+1.7,3.8,.18,.42,0,cope);vB('vIron',x0-.3,0,F+.2,.06,.9,1.2,0,xC(0x2a2826));}
 for(const x of[-8.5,8.5])xhLamp(x,0,-4.4,lit);
 if(V===0){/* the jib crane: a stone pad, a timber post, a raking jib over the water, the rope and a bale on the hook */
  const x=-6;vB('vStone',x,0,1.6,3,.4,3,0,stone);vPst('vPost',x,.4,1.6,.28,7.4,tim);xnMember('vWood',[x,1.4,1.6],[x,7.2,6.4],.28,.24,[1,0,0],tim);
  xnMember('vWood',[x,5.8,1.6],[x,6.6,5.2],.16,.14,[1,0,0],tim);vBeam([x,7.2,6.4],[x,3.2,6.4],.03,xC(0x2e2a26),'vRope');vnCrate(x,2.4,6.4,1.0,.3);
  for(let k=0;k<3;k++)vnBarrel(x+3+k*1.1,0,0,.36,.9,xC(0x8a6a48));vnSacks(4,0,-1,6);}
 else if(V===1){/* a cargo stack under a tarp, bales, the weighing tripod */
  vB('vWood',5,0,-1.5,6,1.4,3.2,0,xC(0x8a6a48));vB('vTarpB',5,1.4,-1.5,6.2,.9,3.4,0,xC(0xb8a070));for(let k=0;k<5;k++)vB('vClothB',-4+k*1.3,0,-2.6,1.1,.9,1.1,0,xC(xPick([0xc8b898,0xb8a080,0xa89070])));
  const t=[-9,0,1];for(const a of[0,2.1,4.2])xnMember('vWood',[t[0]+Math.cos(a)*1.3,0,t[2]+Math.sin(a)*1.3],[t[0],3.4,t[2]],.12,.12,[0,1,0],tim);vBeam([t[0],3.4,t[2]],[t[0],1.6,t[2]],.02,xC(0x2e2a26),'vRope');vnCrate(t[0],1.0,t[2],.7,.2);}
 else{/* the harbour master's tally shed: a lime-washed room, a flat roof, an awning, the tally table */
  xnWall(-8,0,-2.4,5,3,4,0,xC(xPick(XPAL.wash)),'wash');xnFlatRoof(-8,3,-2.4,5,4,0,xC(xPick(XPAL.wash)),{parapet:.4});vnDoor(-8,0,-.4,0,1.1,2.2,'vWood',tim,tim,false);
  vnAwning(-8,2.6,.6,0,5,2.2,xC(xPick([0xa8382a,0x2f7a4a,0xe8a030])));vB('vWood',-6.2,.8,1.2,1.6,.1,.8,0,tim);vnSacks(2,0,-1.4,4);}
 xhFolk(0,0,4,6);}
XA.def({key:'xa_harbour_quay',name:'Harbour quay',family:'Dockyard',tags:{type:['infrastructure','industry'],wealth:'poor',lit:true},w:34,d:14,h:9,fw:34,fd:11,build:buildXaHarbourQuay});

// ---------------------------------------------------------------- the mole: o.len along x, the harbour's quay face at z = -8, the lake at +z
function buildXaMoleRun(G,o){reseed(34311+(o.v|0));const L=o.len==null?34:o.len,stone=xC(xPick(XPAL.stone)),cope=stone.clone().multiplyScalar(1.14),tim=xC(0x5a4632),lit=xLit(),H=-8,P=4.6;
 vnReg('Mole',0,0,L/2,4);
 vB('vStone',0,-7,-.8,L,6.65,14.4,0,stone.clone().multiplyScalar(.78));         /* the body */
 xhCourses(0,L,H,-1,-7,-.35,stone,-2.4);vB('vStone',0,-.35,H+.45,L,.35,1.0,0,cope);
 xnPave(0,(H+P)/2,L,P-H-.1,0,stone.clone().multiplyScalar(.95),1.8,-.35);
 const nb=Math.max(1,Math.round(L/9));for(let k=0;k<nb;k++){const x=-L/2+(k+.5)*L/nb;xhBollard(x,0,H+.6);vB('vWood',x,-3.1,H-.18,.3,3.0,.3,0,tim);}
 vB('vWood',0,-1.2,H-.36,L,.28,.24,0,tim);
 /* the parapet on the lake side: battered, a coping, slots for the spray to drain */
 vB('vStone',0,-.35,P+.75,L,1.75,1.5,0,stone.clone().multiplyScalar(.9));vB('vStone',0,1.4,P+.75,L+.02,.22,1.7,0,cope);
 for(let x=-L/2+3;x<L/2-1;x+=6)vB('vDarkB',x,-.3,P+.02,.5,.22,.04,0);
 /* the lake face below it and its armour: boulders in three rows down into the water */
 vB('vStone',0,-7,P+1.6,L,6.65,.8,0,stone.clone().multiplyScalar(.7));
 for(let r=0;r<3;r++){const z=P+2.3+r*1.25,y=-1.0-r*1.1;for(let x=-L/2+.8+rr(0,.6);x<L/2-.4;x+=rr(1.4,2.1))
  kput('xBoulder',[x,y,Math.min(z+rr(-.3,.3),7.6)],qEuler(rng()*3,rng()*3,0),[rr(.7,1.1),rr(.6,.9),rr(.7,1.0)],xC(xPick([0x8a8070,0x7a7266,0x948a78])).multiplyScalar(r>0?.8:1));}
 const nl=Math.max(1,Math.round(L/17));for(let k=0;k<nl;k++)xhLamp(-L/2+(k+.5)*L/nl,0,P-.6,lit);
 xhFolk(0,-2,Math.max(1,Math.round(L/12)),L/3);}
XA.def({key:'xa_mole_run',name:'Mole',family:'Dockyard',tags:{type:['infrastructure'],wealth:'civic',lit:true},w:34,d:16,h:4,fw:34,fd:16,build:buildXaMoleRun});

// ---------------------------------------------------------------- the river bridge: a segmental arch, 26 m a piece along z
// v 0: the pier at z = 0 (3.2 m thick, cutwaters up- and downstream, a refuge over it), a half arch either side, each crown at
// the piece's end (z = +-13) where the next piece's half arch meets it. v 1: the abutment: the half arch on +z, springing from
// the abutment's face at z = -1.6, the solid abutment and its wing walls on -z. The deck at 0, the intrados' crown at -1.9,
// the springing at -6: a span of 22.8 m clear rising 4.1 m. The piers go 16 m down, under any river bed.
function buildXaRiverSpan(G,o){reseed(34321);const V=(o.v|0)%2,W=8,L=26,T=1.6,ys=-6,yc=-1.9,c=L/2-T,r=yc-ys,R=(c*c+r*r)/(2*r),th=.95;
 const stone=xC(xPick(XPAL.stone)),ring=stone.clone().multiplyScalar(1.12),dark=stone.clone().multiplyScalar(.74),cope=stone.clone().multiplyScalar(1.18),lit=xLit();
 vnReg('Bridge',0,0,W/2,L/2);
 vB('vStone',0,-.9,0,W,.9,L,0,stone);                                               /* the deck */
 vB('vStone',0,-.9,0,W+.16,.2,L,0,cope);                                            /* the string course at its edge */
 const half=sg=>{/* sg = +1: the half arch on +z (pier face at +T, crown at +L/2); -1 on -z */
  const zc=sg*L/2,a0=Math.asin(c/R),N=11;
  for(let i=0;i<N;i++){const a=a0*(i+.5)/N,da=a0/N,zz=zc-sg*Math.sin(a)*(R+th/2),yy=yc-R+Math.cos(a)*(R+th/2);   /* a voussoir: its middle at radius R + th/2, a from the crown */
   kput('vStone',[0,yy,zz],qEuler(sg*a,0,0),[W,th,(R+th)*da+.02],ring.clone().multiplyScalar(i%2?1:.95));}
  for(let k=0;k<Math.ceil(c);k++){const z0=sg*(T+k),z1=sg*Math.min(T+k+1,L/2),zm=(z0+z1)/2,d=L/2-Math.abs(zm),ex=yc-R+Math.sqrt(Math.max(0,(R+th)*(R+th)-d*d));   /* the spandrel over the extrados */
   if(ex<-.9)vB('vStone',0,ex-.05,zm,W-.02,-.9-ex+.05,Math.abs(z1-z0),0,stone.clone().multiplyScalar(rr(.93,1.03)));}};
 half(1);
 if(V===0){half(-1);
  vB('vStone',0,-16,0,W,16-.9,2*T,0,dark);                                           /* the pier */
  for(const s of[-1,1]){vB('vStone',s*W/2,-16,0,2.26,16-5.2,2.26,Math.PI/4,dark);      /* the cutwaters, up- and downstream */
   vB('vStone',s*W/2,-5.2,0,1.9,.4,1.9,Math.PI/4,cope);vB('vStone',s*W/2,-4.8,0,1.6,3.9,1.6,Math.PI/4,stone);   /* their cap, and the pilaster up to the refuge */
   vB('vStone',s*(W/2+.55),-.9,0,1.3,.9,3.2,0,stone);                                 /* the refuge's floor, over the cutwater */
   vB('vStone',s*(W/2+1.0),0,0,.45,1.05,3.4,0,stone);vB('vStone',s*(W/2+1.0),1.05,0,.6,.14,3.6,0,cope);
   for(const z of[-1.5,1.5]){vB('vStone',s*(W/2+.6),0,z,1.1,1.05,.4,0,stone);vB('vStone',s*(W/2+.6),1.05,z,1.2,.14,.55,0,cope);}
   xhLamp(s*(W/2+1.0),1.19,0,lit);}
  for(const s of[-1,1]){const x=s*(W/2-.25);for(const zz of[[-L/2,-1.7],[1.7,L/2]]){const zm=(zz[0]+zz[1])/2,ll=zz[1]-zz[0];
   vB('vStone',x,0,zm,.5,1.05,ll,0,stone);vB('vStone',x,1.05,zm,.64,.14,ll,0,cope);}}}
 else{/* the abutment and its wing walls (they flare back from the face at z = -T), the parapet ending on a pier-post */
  vB('vStone',0,-16,-(L/2-T)/2-T,W,16-.9,L/2-T,0,dark);
  for(const s of[-1,1]){const p=loc(0,0,s*(W/2+1.6),-L/2+4.5,s*.32);vB('vStone',p[0],-12,p[1],.9,12+.95,7.6,s*.32,dark);vB('vStone',p[0],.05,p[1],1.04,.14,7.7,s*.32,cope);
   const x=s*(W/2-.25);vB('vStone',x,0,(L/2-T)/2,.5,1.05,L/2+T,0,stone);vB('vStone',x,1.05,(L/2-T)/2,.64,.14,L/2+T,0,cope);
   vB('vStone',x,0,-T,.9,1.6,.9,0,stone);kput('xConeP',[x,1.6,-T],null,[.5,.5,.5],cope);}
  vB('vStone',0,-.9,-L/2+(L/2-T)/2,W,.9,L/2-T,0,stone);}
 xhFolk(0,0,2,L/3);}
XA.def({key:'xa_river_span',name:'River bridge span',family:'Public',tags:{type:['infrastructure'],wealth:'civic',lit:true},w:13,d:26,h:4,fw:13,fd:26,nv:2,build:buildXaRiverSpan});

// ---------------------------------------------------------------- the slip: its head at z = -15 (y 0), its toe in the lake at +z
function buildXaSlip(G,o){reseed(34331+(o.v|0));const stone=xC(xPick(XPAL.stone)),tim=xC(0x6a5236),timD=xC(0x4a3a28),pitch=Math.atan2(3.4,30);
 vnReg('Slip',0,0,6,5);
 kput('vStone',[0,-1.7-.4,0],qEuler(pitch,0,0),[9,.8,30.2],stone.clone().multiplyScalar(.9));   /* the ramp: y 0 at its head, -3.4 at its toe */
 for(const s of[-1,1]){kput('vStone',[s*4.9,-1.7-.2,0],qEuler(pitch,0,0),[.8,1.6,30.2],stone);   /* its kerbs */
  kput('vWood',[s*1.6,-1.7+.08,0],qEuler(pitch,0,0),[.36,.24,30],timD);}                           /* the ways */
 const Y=z=>-1.7-z*3.4/30;   /* the ramp's top at z */
 /* the cradle and a work barge's hull in frame on it: keel, ribs, the first strakes */
 const z0=-6,L=16;for(let k=0;k<5;k++){const z=z0-L/2+2+k*3;vB('vWood',0,Y(z)+.25,z,4.6,.5,.5,0,timD);}
 vB('vWood',0,Y(z0)+.75,z0,.4,.4,L,0,timD);                                                        /* the keel (the ramp's fall taken up by the cradle) */
 for(let k=0;k<9;k++){const z=z0-L/2+1+k*1.75;for(const s of[-1,1])xnMember('vWood',[s*.2,Y(z0)+1,z],[s*2.6,Y(z0)+2.6,z],.16,.16,[0,0,1],tim);}
 for(const s of[-1,1])for(let j=0;j<2;j++)vB('vWood',s*(1.0+j*.9),Y(z0)+1.35+j*.6,z0+(j?2:0),.12,.28,L-(j?6:2),0,tim.clone().multiplyScalar(1.1));
 /* the capstan at the head, the hauling rope down to the cradle; timber and a pitch pot */
 vB('vStone',0,0,-13.8,3,.3,2.4,0,stone);vPst('vPost',0,.3,-13.8,.45,1.1,timD);for(const a of[0,Math.PI/2])kput('vWood',[0,1.2,-13.8],qEuler(0,a,0),[3.4,.14,.14],tim);
 vBeam([0,.9,-13.4],[0,Y(z0-L/2)+.9,z0-L/2],.04,xC(0x8a7a58),'vRope');
 for(let k=0;k<4;k++)vB('vWood',4.2,0+k*.3,-11.5,.9,.28,6,0,tim.clone().multiplyScalar(rr(.9,1.1)));
 vPst('vIron',-3.8,0,-12,.4,.6,xC(0x2a2826));vB('vStone',-3.8,-.05,-12,1.2,.1,1.2,0,xC(0x3a3430));
 xhFolk(0,-10,3,3);}
XA.def({key:'xa_slip',name:'Barge slip',family:'Dockyard',tags:{type:['industry'],wealth:'poor',lit:false},w:12,d:32,h:6,fw:11,fd:31,build:buildXaSlip});

// ---------------------------------------------------------------- the waterfront warehouse: its front (+z) to the quay
// a round arch head of voussoirs over an opening w wide whose top is at y, in the face z (front +z)
function xhArchHead(x,y,z,w,c){const R=w/2,N=9;for(let i=0;i<N;i++){const a=Math.PI*(i+.5)/N,p=[x+Math.cos(a)*(R+.25),y+Math.sin(a)*(R+.25)];
 kput('vStone',[p[0],p[1],z+.05],qEuler(0,0,a-Math.PI/2),[Math.PI*(R+.5)/N+.02,.5,.3],c.clone().multiplyScalar(i%2?1:.92));}
 vB('vDarkB',x,y-.02,z+.02,w-.1,R,.06,0);}
function buildXaHarbourWarehouse(G,o){reseed(34361+(o.v|0));const V=xV(o),W=30,D=16,H0=4.4,H1=3.4,floors=V===1?2:1,stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),
 tim=xC(xPick(XPAL.timber)),timD=xC(0x4a3a28),tile=xC(xPick(XPAL.tile)),lit=xLit();
 vnReg('Warehouse',0,0,W/2+1,H0+H1*floors+4);
 vB('vStone',0,0,0,W+.6,.5,D+.6,0,stone.clone().multiplyScalar(.85));
 xnWall(0,.5,0,W,H0,D,0,stone,'stone');
 for(let k=0;k<5;k++){const x=-W/2+3+k*6;vnDoor(x,.5,D/2,0,3,2.9,'vWood',timD,tim,false);xhArchHead(x,.5+2.9,D/2,3,stone.clone().multiplyScalar(1.1));}
 for(const s of[-1,1])vnDoor(s*W/2,.5,0,s*Math.PI/2,2.6,2.8,'vWood',timD,tim,false);
 vB('vStone',0,.5+H0,0,W+.3,.3,D+.3,0,stone.clone().multiplyScalar(1.1));   /* the string course */
 let y=.8+H0;for(let f=0;f<floors;f++){xnWall(0,y,0,W-.4,H1,D-.4,0,wash,'wash');
  for(let k=0;k<6;k++){const x=-W/2+2.6+k*5;if(f===floors-1&&k===2)continue;vB('vDarkB',x,y+1,D/2-.18,1.4,1.4,.1,0);for(let j=0;j<5;j++)vB('vWood',x,y+1.08+j*.27,D/2-.12,1.5,.07,.12,0,tim);
   vB('vWood',x,y+.92,D/2-.1,1.7,.12,.3,0,timD);}
  y+=H1;}
 /* the loft door and the hoist beam over it, the rope down to a bale on the platform */
 const xd=-W/2+2.6+2*5;vnDoor(xd,y-H1+.2,D/2-.2,0,1.8,2.4,'vWood',timD,tim,false);
 vB('vWood',xd,y+.3,D/2+.4,.4,.4,3.0,0,timD);xnMember('vWood',[xd,y-.8,D/2-.1],[xd,y+.2,D/2+1.4],.18,.18,[1,0,0],timD);vBall('vIron',xd,y+.15,D/2+1.75,.16,xC(0x2a2826));
 vBeam([xd,y+.1,D/2+1.75],[xd,1.9,D/2+1.75],.03,xC(0x3a3026),'vRope');vB('vClothB',xd,1.3,D/2+1.75,.9,.6,.7,0,xC(0xc8b898));
 vnGableRoof(0,y,0,W+1.2,D+1.4,3.6,Math.PI/2,'xGableT',tile,.7);
 /* the loading platform along the front, its steps; v 2 a timber arcade over it */
 vB('vWood',0,.5,D/2+1.4,W-1,.45,2.6,0,tim);for(let k=0;k<3;k++)vB('vStone',W/2-2.5,.5-(k+1)*.16,D/2+2.9+k*.36,2.4,.16,.36,0,stone);
 if(V===2){for(let k=0;k<7;k++)vPst('vPost',-W/2+1+k*(W-2)/6,.95,D/2+2.5,.16,3.2,timD);vnAwning(0,4.1,D/2,0,W-.6,3,tile);}
 vnSacks(-9,.95,D/2+1.4,6);for(let k=0;k<3;k++)vnBarrel(6+k*1.0,.95,D/2+1.6,.36,.9,xC(0x8a6a48));vnCrate(10.5,.95,D/2+1.4,1.1,.2);vnCrate(10.5,1.95,D/2+1.4,.9,.5);
 if(lit)for(const x of[-9,9])vBall('vBulb',x,3.8,D/2+.25,.12);
 xhFolk(0,D/2+4,3,6);}
XA.def({key:'xa_harbour_warehouse',name:'Harbour warehouse',family:'Dockyard',tags:{type:['industry','market/shop'],wealth:'middle',job:'warehousing',lit:true},w:32,d:21,h:15,fw:31,fd:20,build:buildXaHarbourWarehouse});

// ---------------------------------------------------------------- the drydock: 48 m along z, its gate at +z on the lake
function buildXaDrydock(G,o){reseed(34371+(o.v|0));const L=48,B=14,T=4,WL=-2.4,stone=xC(xPick(XPAL.stone)),cope=stone.clone().multiplyScalar(1.14),dark=stone.clone().multiplyScalar(.7),
 tim=xC(0x6a5236),timD=xC(0x3e3022),tile=xC(xPick(XPAL.tile)),lit=xLit();
 vnReg('Drydock',0,0,B/2+T,6);
 /* the side walls, their inner faces in three altars down to the water, the coping */
 for(const s of[-1,1]){vB('vStone',s*(B/2+T/2),-8,0,T,8-.3,L,0,stone.clone().multiplyScalar(.85));vB('vStone',s*(B/2+T/2),-.3,0,T+.1,.3,L,0,cope);
  for(let k=1;k<=3;k++)vB('vStone',s*(B/2-.35-(k-1)*.7),-8,-1.5,.7,8-.8*k,L-3,0,(k===3?dark:stone).clone().multiplyScalar(rr(.92,1.02)));
  vB('vStone',s*(B/2+T/2),WL-.25,0,T+.02,.5,L+.02,0,xC(0x4a5a3c));}
 /* the head wall and its stair down to the floor */
 vB('vStone',0,-8,-L/2+1.5,B,8-.3,3,0,stone.clone().multiplyScalar(.85));vB('vStone',0,-.3,-L/2+1.5,B,.3,3.1,0,cope);
 for(let k=0;k<8;k++)vB('vStone',0,-.3-(k+1)*.4,-L/2+3+k*.45,3,.4,.45,0,stone.clone().multiplyScalar(k>5?.7:.95));
 /* the gate piers and the mitre gates standing open against the walls, their balance beams over the rims */
 for(const s of[-1,1]){vB('vStone',s*(B/2+T/2),-8,L/2-1.6,T+.6,8.3,3.2,0,stone);vB('vStone',s*(B/2+T/2),.3,L/2-1.6,T+.8,.25,3.4,0,cope);
  const lx=s*(B/2-.6);vB('vWood',lx,-4.6,L/2-6.2,.5,4.9,7.2,0,timD);for(let k=0;k<4;k++)vB('vIron',lx+s*.27,-4.2+k*1.2,L/2-6.2,.04,.14,7.2,0,xC(0x2a2826));
  vB('vWood',lx-s*.1,.2,L/2-6.2,.4,.12,7.4,0,tim);   /* the gate's walk */
  xnMember('vWood',[lx,.6,L/2-2.8],[s*(B/2+T-.4),.9,L/2-10.5],.32,.32,[0,1,0],tim);}   /* the balance beam */
 /* the work barge afloat in the dock, scaffolds and shores along her */
 if(VERN.defs.xa_lake_barge)xnSub('xa_lake_barge',0,WL,1,0,{v:1});
 for(const s of[-1,1]){for(let k=0;k<6;k++){const z=-10+k*4;vPst('vPost',s*4.6,WL,z,.1,4.6,timD);}vB('vWood',s*4.6,WL+2.7,0,1,.1,21,0,tim);vB('vWood',s*4.6,WL+4.4,0,.1,.1,21,0,timD);
  for(let k=0;k<4;k++){const z=-8+k*5.5;xnMember('vWood',[s*(B/2-1.6),-1.6,z],[s*3.4,WL+1.8,z],.18,.18,[0,0,1],timD);}}
 /* the pump house on the east rim: a stone room, a tiled roof, its treadwheel; the sheerlegs over the head */
 {const x=B/2+T/2,z=-L/2+7;vB('vStone',x,0,z,3.6,3,4.6,0,stone);vnGableRoof(x,3,z,4.2,5.2,1.4,0,'xGableT',tile,.4);
  kput('vHoop',[x,2.4,z+4.2],qEuler(0,Math.PI/2,0),[2.2,2.2,1.6],tim);for(let k=0;k<6;k++)kput('vWood',[x,2.4,z+4.2],qEuler(k*Math.PI/6,0,0),[.12,4.3,.12],timD);
  vPst('vPost',x-.9,0,z+4.2,.14,2.6,timD);vPst('vPost',x+.9,0,z+4.2,.14,2.6,timD);vPst('vPipe',x-1.6,-2.6,z+1,.18,2.6,xC(0x3a3430));}
 for(const s of[-1,1])xnMember('vWood',[s*(B/2+1.2),0,-L/2+2],[0,9,-L/2+5.5],.3,.3,[1,0,0],timD);vBeam([0,9,-L/2+5.5],[0,1,-L/2+5.5],.04,xC(0x8a7a58),'vRope');
 for(const s of[-1,1])for(let k=0;k<4;k++)xhBollard(s*(B/2+.6),0,-L/2+8+k*10);
 for(const s of[-1,1])xhLamp(s*(B/2+T-.6),0,0,lit);
 xhFolk(B/2+2,0,3,6);xhFolk(-B/2-2,-8,2,4);}
XA.def({key:'xa_drydock',name:'Drydock',family:'Dockyard',tags:{type:['industry','infrastructure'],wealth:'civic',job:'shipwrighting',lit:true},w:23,d:49,h:10,fw:22,fd:48,build:buildXaDrydock});

// ---------------------------------------------------------------- the White Monastery's dress
// the walls, the battered storeys and the red walls of the Tibetan great house go lime-white; the gilt, the dark window frames,
// the timber and the roofs keep their colours
const XH_WHITE=new Set(['xWashB','xEarthB','vPlaster','xWallW','xWallE','xWallS','xWallD','vStone@wall']);
const _xhKputWhite=kput;
kput=function(name,p,q,s,c){const C=VERN.cur;if(!C||!C.o||!C.o.whiteDress)return _xhKputWhite(name,p,q,s,c);
 const wall=XH_WHITE.has(name)||/^xBat[WESD]\d\d$/.test(name),red=c&&c.r>.38&&c.g<.3&&c.b<.3&&name!=='xGoldB'&&name!=='xGold';
 if(wall||(red&&Array.isArray(s)&&Math.max(s[0],s[2])>2)){const w=C.white.clone().multiplyScalar(.97+.03*((p[0]*7.1+p[2]*3.3)%1+1)%1);return _xhKputWhite(name,p,q,s,w);}
 return _xhKputWhite(name,p,q,s,c);};
{const D=VERN.defs.xa_monastery;if(D){const T=Object.assign({},D.tags);
 XA.def({key:'xa_monastery_white',baseKey:'xa_monastery',name:'Monastery (the White Monastery)',family:'Sacred',tags:T,w:D.w,d:D.d,h:D.h,fw:D.fw,fd:D.fd,nv:D.nv,
  build:function(G,o){const C=VERN.cur;o.whiteDress=true;C.white=xC(0xf4f1e8);D.build(G,o);o.whiteDress=false;}});}}
