// ================================================================= SKYSCRAPERS — three variants, d: 0 intact, 1 ruined, 2 toppled
// each variant = plinth(G,d) + body(P,d,y0,y1) in local coords (local y=0 ⇔ absolute y0)
// `dir` is which way the upper body goes down: +1 (default) east, -1 west. It
// matters when a tower shares its plinth with something else — Skyscraper G's
// drum used to fall straight into its own block stack.
// `angF`, if given, fixes the bearing of the fall (radians, +x through +z),
// with only a little of the usual random yaw left on it. Skyscraper C needs it:
// its three legs stand at 30, 150 and 270 degrees, and a random bearing within
// half a radian of east laid the fallen body straight through the 30-degree leg.
// The rr() is drawn either way, so the PRNG stream is unchanged.
function toppledUpper(G,cx,cz,hc,r0,bodyFn,d,dir,angF){const s=dir===-1?-1:1;const U=new THREE.Group();const a0=rr(-.5,.5),ang=angF!=null?angF+a0*.12:a0;
 U.position.set(cx+s*Math.cos(ang)*(r0*1.6),r0*.82,cz+s*Math.sin(ang)*(r0*1.6));U.rotation.set(0,-ang,-s*Math.PI/2*.94);G.add(U);useGroupXF(U);bodyFn(U,1,hc,null,true);endGroupXF();
 rubbleRing(cx+s*Math.cos(ang)*(r0*2),0,cz+s*Math.sin(ang)*(r0*2),r0*.5,r0*3,140,3.5);}
function skyPlinth(G,d,R){mesh(lathe({rFn:()=>R,H:5,nu:96,nv:1}),SHELL(d),G);kput('slab',[0,5,0],null,[R,.6,R],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 for(let k=0;k<48;k++){const th=k/48*TAU,r=R*.93;if(d>0&&rng()<.2)continue;kput(d>0?'colR':'colW',[r*Math.cos(th),5,r*Math.sin(th)],null,[1.8,12,1.8],null);}
 kput(d>0?'ringR':'ringW',[0,17.3,0],qEuler(Math.PI/2,0,0),[R*.94,R*.94,8],null);
 apron(G,0,0,R*1.02,R*1.5,d,1.4);   // graded skirt: the plinth met the ground on a hard line
 if(d>0){mossOnRing(0,5.3,0,R*.85,120,3);vinesOnRing(0,17.3,0,R*.94,40,14);scatterMoss(0,0,0,R+2,R+100,220,3.5);rubbleRing(0,0,0,R+2,R+80,120,3);trees(0,0,R+30,R+160,30);}}
// THE COLLAPSE SCAR. A level-1 ruin used to be the intact tower cut off
// short and eaten by fbm holes, which at the row presets' distance read as
// "intact with patches": the holes are a few metres across on a 300 m tower.
// This wraps a tower's hole predicate with one big V-shaped scar: from yN up
// to the break the fabric has fallen away down one face, widening to +/-w (in
// u) at the top, with a ragged fbm edge. It faces u0, which each builder sets
// toward its row camera, so the section it opens is the one the preset sees.
// The lining shares the predicate, so the scar shows floor plates, not a wall.
function skyScarHole(hole,u0,w,yN,L,seed){return(u,y)=>{if(hole&&hole(u,y))return true;if(y<yN)return false;
 let e=Math.abs(u-u0)%1;if(e>.5)e=1-e;const t=Math.pow((y-yN)/Math.max(1,L-yN),.75);
 return e<w*t*(.75+.5*fbm(y*.05,u*9,seed||5,2));};}
// GLASS SHARDS (towers QA, round 2). The civic group's civShardAt
// (42-offices.js) leaves a few jagged teeth of glass standing in a dead
// opening. The towers place their dead openings at ~20 call sites, one of them
// the shared windowsOnLathe, so instead of threading civWin through each, a
// builder takes a MARK of the dead-window kit lists when it starts and calls
// skyShards(mark) when it ends: every dead opening placed in between gets the
// same position-hashed chance of shards (no rng draw, so nothing moves). The
// items are already in world space, so KOFF and KXF are cleared round it.
const SKY_SHARD_W={winSmD:[1.1,2,.4,1],winD:[2.2,4.2,.7,1],winBigD:[3,3.6,.7,1],ovalD:[2,2,.6,.68],paneD:[1,1,.12,1],cellD:[1,1,.5,1],skWinD:[1,1,.4,1]};
function skyShardMark(){const m={};for(const k in SKY_SHARD_W)m[k]=KIT.items[k]?KIT.items[k].length:0;return m;}
function skyShards(m,frac){const K0=KOFF,X0=KXF;KOFF=[0,0,0];KXF=null;frac=frac==null?.5:frac;
 for(const k in m){const it=KIT.items[k];if(!it)continue;const W=SKY_SHARD_W[k],n=it.length;
  for(let i=m[k];i<n;i++){const o=it[i];if(!o.q)continue;
   const h=h3(o.p[0]*.173+.3,o.p[1]*.291+.7,o.p[2]*.117+.1);if(h>frac)continue;
   const S=typeof o.s==='number'?[o.s,o.s,o.s]:o.s;
   civShardAt(o.p,o.q,W[0]*S[0]*W[3],W[1]*S[1]*W[3],W[2]*S[2]/2+.04,h);}}
 KOFF=K0;KXF=X0;}
// INTERIORS BEHIND THE OPENINGS (towers QA, round 2). The cut sections already
// show pale plates over dark soffits; this furnishes the storeys between them
// the way civRooms (42-offices.js) furnishes the civic shells — ceiling
// fittings (a few still lit, warm: later people), cabinets and machinery
// silhouettes, radial partitions so the floor reads as rooms, conduit risers
// — but ONLY in the bays where the shell is actually open or the bay beside
// it, the only place anyone can see in. A tower is mostly wall, and furnishing
// all of it would cost more triangles than the tower. civRooms puts its strip
// .7 m under the next floor; the towers hang a soffit 1.2-1.5 m under each
// plate, so the fitting goes under the soffit (`soff`). No rng().
// o: {rFn(y) clear radius inside the lining, y0, y1, step, soff, hole(u,y), d, seed, rIn=.62, dens=7}
function skyRooms(o){const rIn=o.rIn||.62,step=o.step,soff=o.soff||1.4,seed=o.seed||0,hole=o.hole,dd=o.d;if(!hole)return;
 const litP=dd>=3?.22:.05;
 for(let y=o.y0,f=0;y+step<o.y1;y+=step,f++){const ym=y+step*.5,R=o.rFn(ym),n=Math.max(10,Math.round(R*TAU/(o.dens||7)));
  for(let k=0;k<n;k++){const u=(k+.5)/n;
   if(!(hole(u,ym)||hole((u+.7/n)%1,ym)||hole((u+1-.7/n)%1,ym)))continue;
   const th=u*TAU,c=Math.cos(th),s=Math.sin(th),hh=h3(k*1.31+seed,f*2.17,seed*.013),rm=R*(1+rIn)/2,ch=step-soff-.6;
   if(hh<litP)kput('strip',[c*rm,y+ch,s*rm],qEuler(0,-th-Math.PI/2,0),[R*TAU/n*.5,1,1],WARM);
   else kput('boxD',[c*rm,y+ch,s*rm],qEuler(0,-th,0),[.5,.25,R*TAU/n*.45],null);
   if(hh<.6){const hg=Math.min(ch-.6,1.1+hh*2.4),w=1+hh*2.6,rb=R*(rIn+.05)+.5;
    kput('boxD',[c*rb,y+.4+hg/2,s*rb],qEuler(0,-th,0),[1+hh*1.2,hg,w],null);}
   if(k%3===0){const ra=R*(rIn+1)/2;kput(BOXC(1),[Math.cos(th-Math.PI/n)*ra,y+.4+ch/2,Math.sin(th-Math.PI/n)*ra],qEuler(0,-(th-Math.PI/n),0),[R*(1-rIn)*.9,ch,.35],null);}
   if(hh>.85)kput('cellD',[c*R*(rIn+.01),y+1.6,s*R*(rIn+.01)],qFacing([c,0,s]),[.6,.8,1],null);
   if(k%5===2)kput('tube',[c*R*(rIn+.03),ym,s*R*(rIn+.03)],null,[.25,step,.25],null);}}}
// The rehabilitated towers (decay 3) are no longer dressed only by the shared
// repairPass, which gives a 300 m tower the vocabulary of a house: lean-tos
// and water butts. A tower that people climb wants HOISTS — a gantry jutting
// off the top, a cable and a hanging load down to a winch house on the podium
// — and scaffold cages lashed up the face where they are patching. One per
// tower, on the side the row camera sees (+z). Positions only: no rng().
function skyHoist(rFn,top,yFoot,seed){const a=Math.PI*.5+(h3(seed,1.7,2.3)-.5)*.9,c=Math.cos(a),s=Math.sin(a),rTop=rFn(top-1,a);
 const x1=c*(rTop+16),z1=s*(rTop+16);
 beam('strutR',[c*rTop*.6,top,s*rTop*.6],[x1,top+3,z1],1.4,1.4);beam('strutR',[c*rTop*.3,top+9,s*rTop*.3],[x1,top+3,z1],.8,.8);
 kput('strutR',[c*rTop*.3,top+4.5,s*rTop*.3],null,[.9,9,.9],null);
 const yb=yFoot+(top-yFoot)*(.25+.5*h3(seed,4.1,.3));
 beam('tube',[x1,top+3,z1],[x1,yFoot+1,z1],.14,.14);
 kput('shantyBox',[x1,yb,z1],qEuler(0,-a,0),[2.2,2.4,2.2],null);
 const xf=c*(rTop+20),zf=s*(rTop+20);kput('shantyBox',[xf,yFoot+2,zf],qEuler(0,-a,0),[6,4,5],null);kput('shantyRoof',[xf,yFoot+4.2,zf],qEuler(.12,-a,0),[7.5,1,6.5],null);
 // the scaffold cages: two stacks of poles and decks on the face either side of the hoist
 for(const o of [-.22,.2]){const b=a+o,cb=Math.cos(b),sb=Math.sin(b);const y0=yFoot+(top-yFoot)*(.3+.25*h3(seed,o*7,1)),hS=18+20*h3(seed,o,5),rf=rFn(y0+hS/2,b);
  for(const e of [-3,3]){const px=-sb*e,pz=cb*e;
   for(const r of [0,2.4])kput('strutR',[cb*(rf+1+r)+px,y0+hS/2,sb*(rf+1+r)+pz],null,[.3,hS,.3],null);}
  for(let yy=y0;yy<y0+hS;yy+=3.5)kput('plank',[cb*(rf+2.2),yy,sb*(rf+2.2)],qEuler(0,-b,0),[2.6,.2,6.4],null);}}
// --- A: the Conocylinder (Soleri Babel IID) ---------------------------------------------------
// DECAY 4 IS "PROJECT A": rehabilitated and STILL STANDING. It was written when
// level 3 was built as a stump (the standing test was `d<2`; it is `d!==2` now,
// so level 3 stands at full height too), and it remains the one tower a later
// people reoccupied WHOLE and lit with their own fires. Level 4 is
// that building: the same ancient fabric at level 3's reduced hole density (the
// scene loop sets HOLES for it), dressed by the same repairPass, full height
// with its crown frame, and lit at night by fires rather than by the Ancients'
// cyan. Skyscrapers D and H carry the same level 4 as Projects D and H; the
// firelight mask is shared (fireMask, src/69-mat-salvage.js) and only the
// window grid differs between the three.
function buildSkyA(scene,gx,gz,d){reseed(9100+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const PROJ=d===4,FLM=PROJ?fireLightMark():null,SM=skyShardMark();
 const H=420,Y0=64;const rFn=y=>{const t=clamp((y-Y0)/(H-Y0),0,1);return 40+26*Math.pow(Math.abs(t-.42)/.58,1.7)*(t<.42?1:1.15);};
 REGISTER({name:(PROJ?'Project A — Skyscraper A reoccupied whole (rehabilitated)':'Skyscraper A — the Conocylinder ('+(d===2?'toppled':STATE(d))+')'),x:0,z:0,r:110,h:H+60});
 // PLINTH. 120 was set by nothing: the 24 splayed struts land at r=98 and
 // skyPlinth's own column ring sits at R*.93, so 110 is the smallest circle
 // that still carries them with the columns outboard of the strut feet. The
 // apron, the column ring, the cornice ring and every moss/rubble/tree ring
 // derive from R inside the helper, so they all follow.
 // STANCE (round 2): the struts' feet came in from 98 to 80 — steeper legs,
 // the same tower — so the podium comes in from 110 to 92 (ring at 85.6,
 // outboard of the 5.5 m strut feet). This was the Project's loosest podium.
 const SF=80,PR=92;
 skyPlinth(G,dd,PR);
 mesh(lathe({rFn:y=>22-4*y/Y0,H:Y0,nu:48,nv:6,hole:holeFn(dd*.5,3,null,1.5)}),skin,G,0,5,0);
 const NS=24;for(let k=0;k<NS;k++){const th=(k+.5)/NS*TAU;const gone=dd>0&&(k===5||k===13||k===19);
  const a=[Math.cos(th)*SF,5,Math.sin(th)*SF],b=[Math.cos(th)*rFn(Y0)*.96,Y0+6,Math.sin(th)*rFn(Y0)*.96];
  if(!gone)beam(dd>0?'strutR':'strutW',a,b,5.5,4);else{beam('strutR',[a[0],2.6,a[2]],[(a[0]+b[0])/2+rr(-8,8),3.2,(a[2]+b[2])/2+rr(-8,8)],5.5,4);}
  kput(dd>0?'strutR':'strutW',[b[0],b[1]-3,b[2]],qEuler(0,-th,0),[7,9,6],null);}
 kput('slab',[0,Y0+1,0],null,[rFn(Y0)*.97,3,rFn(Y0)*.97],new THREE.Color(dd>0?0x4a3f38:0xcfcac2));kput(dd>0?'ringR':'ringW',[0,Y0+3,0],qEuler(Math.PI/2,0,0),[rFn(Y0),rFn(Y0),10],null);
 const body=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.86:null);const L=(cut!=null?cut:H)-y0;let hole=holeFn(dx,7+(upper?1:0),cut!=null?L:null,1.1);if(d===1&&!upper)hole=skyScarHole(hole,.3,.1,L*.42,L,7);
  const oo={rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut!=null?10:0,flutes:32,amp:.07,sharp:2.5,nu:160,nv:110,hole,seed:7};
  mesh(lathe(oo),SHELL(dx),P,0,0,0);
  if(dx>0){
   // THE CUT SECTION. Both halves of the lesson learned on five other types in
   // this kit were broken here, which is why the tear on the ruined and toppled
   // variants read as a dark hollow instead of as a building sliced open:
   //  1. THE INNER SHELL HAD NO `hole` AT ALL, so it stood intact right behind
   //     every gap in the outer skin and hid the floors. It now takes the SAME
   //     predicate, and the grid is fine enough (80x56, was 64x40) for the
   //     punched openings to line up with the outer ones instead of being four
   //     times coarser.
   //  2. THE FLOOR PLATES WERE 0x2a2c30 AGAINST A 0x2a2622 LINING — dark on
   //     dark, which reads as one grey field, the exact failure mode logged
   //     against the Forest Ring. They are pale concrete now, each with its own
   //     dark soffit 1.5 m under it, so the stack reads as floor/ceiling/void
   //     repeated rather than as a smear.
   mesh(lathe({rFn:y=>rFn(y+y0)*.9,H:H-y0,cut:oo.cut,jag:oo.jag,nu:80,nv:56,hole,seed:7}),MAT.guts,P);
   for(let y=8;y<L-2;y+=8){const rp=rFn(y+y0);
    kput('slab',[0,y,0],null,[rp*.93,.7,rp*.93],new THREE.Color(0xbdb7ad));
    kput('slab',[0,y-1.5,0],null,[rp*.90,.8,rp*.90],new THREE.Color(0x191b1f));}
   for(let k=0;k<60;k++){const th=rng()*TAU,yy=rr(10,L-10),r=rFn(yy+y0)*.86;kput('pipeR',[r*Math.cos(th),yy,r*Math.sin(th)],null,[.5,rr(8,30),.5],null);}
   skyRooms({rFn:y=>rFn(y+y0)*.88,y0:8,y1:L-2,step:8,soff:1.5,hole,d,seed:7});}
  // window cells — and, on Project A, the fires. 20 gangs over 32 bays and ~80
  // storeys lands at ~50% of cells; the mask and the tally are shared.
  const NB=32,NSTO=Math.ceil((L-20)/4.2);
  const burns=PROJ?fireMask('A',NB,NSTO,9104,20):null;
  let si=0;
  for(let y=6;y<L-14;y+=4.2){const sy=si++;
   for(let k=0;k<NB;k++){const u=(k+.5)/NB;if(hole&&hole(u,y))continue;if(rng()<.1)continue;const th=u*TAU,r=rFn(y+y0)+.1;
   const nrm=[Math.cos(th),0,Math.sin(th)],fq=qFacing(nrm);
   if(PROJ){kput('cellD',[r*Math.cos(th),y,r*Math.sin(th)],fq,[2.8,2.3,1],null);
    if(burns(k,sy))fireWindow([r*Math.cos(th),y,r*Math.sin(th)],nrm,fq,2.5,2.1);continue;}
   const lit=dx>0?rng()<.03:rng()<.85;
   const wc=lit?WARM.clone().multiplyScalar(rr(.5,1)):(dx>0?null:new THREE.Color(0x14283c));   // a dead cell is cellD, dark at night too
   kput(wc?'cell':'cellD',[r*Math.cos(th),y,r*Math.sin(th)],fq,[2.8,2.3,1],wc);}}
  // The occupied floors also burn INSIDE, so the fire shows through the holes
  // in the shell and not only in the window openings. One pit per lit storey,
  // dropped on the floor plate, at a bay that storey actually occupies.
  if(PROJ)for(let sy=0,y=6;y<L-14;y+=4.2,sy++){if(!burns.raw((sy*7)%NB,sy))continue;if(rng()<.55)continue;
   const th=((sy*7)+.5)/NB*TAU+rr(-.09,.09),r=rFn(y+y0)*rr(.45,.8);
   firePit('A',r*Math.cos(th),Math.floor(y/8)*8+.6,r*Math.sin(th),rr(1.6,3.2));}
  // The Project gets NO light strips. `stripRing` is an unlit material, so a
  // dead segment is a fixed pale grey — invisible by day against a sunlit wall
  // and a row of glowing dashes at night. And the point of this building is
  // that the Ancients' cyan is gone: the copper went to the salvage crews long
  // before the fires were lit.
  // (a ring across the collapse scar would hang in the gap: none above its foot)
  const scarY=d===1&&!upper?L*.42:1e9;
  if(!PROJ)for(let yy=25;yy<Math.min(L-20,scarY);yy+=25)stripRing(0,yy,0,rFn(yy+y0)*.9,dx,32);
  [.3,.62].forEach(f=>{const ya=Y0+(H-Y0)*f;const yl=ya-y0;if(yl<8||yl>L-10||yl>scarY-8)return;glassBand(P,y=>rFn(y+y0),yl,7,dx,0,0,0,48,PROJ);});
  if(cut==null){const NR=32;for(let k=0;k<NR;k++){const th=k/NR*TAU;const r0=rFn(H)*1.02;beam(dx>0?'strutR':'strutW',[Math.cos(th)*r0,L-6,Math.sin(th)*r0],[Math.cos(th)*(r0+25),L-6+41,Math.sin(th)*(r0+25)],3.2,2.4);}
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*(1+.35*y/40)*(1-.15*Math.pow(y/40,3)),H:40,nu:64,nv:12}),MAT.glass,P,0,L-4,0);mesh(lathe({rFn:y=>12*Math.sqrt(clamp(1-Math.pow(y/16,2),0,1)),H:16,nu:32,nv:8}),SHELL(dx),P,0,L+34,0);kput('finial',[0,L+56,0],null,[5,9,5],null);}}
  else if(!upper){for(let k=0;k<32;k++){const th=k/32*TAU;if(rng()<.5)continue;beam('strutR',[Math.cos(th)*rFn(cut)*1.02,L-6,Math.sin(th)*rFn(cut)*1.02],[Math.cos(th)*rFn(cut)*1.3,L-6+rr(8,26),Math.sin(th)*rFn(cut)*1.3],3.2,2.4);}}};
 const P=new THREE.Group();P.position.set(0,Y0,0);G.add(P);useGroupXF(P);
 if(d!==2)body(P,dd,Y0,null,false);else body(P,1,Y0,Y0+70,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,Y0+70,rFn(Y0+70),(U,dx,y0)=>body(U,1,Y0+70,null,true),d);
 if(dd>0)vinesOnRing(0,Y0,0,rFn(Y0)*.98,60,40);
 // Project A's open fires: the transfer deck at the head of the base cone, the
 // plinth itself, and the crown, where the lantern glass is long gone and the
 // strut ring is the only thing left to stand a beacon in. These are the
 // "exposed decks" — this building is whole, so the only floors open to the
 // sky are the ones the Ancients left open.
 if(PROJ){const cy=Y0+Math.floor((H-Y0-10)/8)*8+.9;   // the topmost floor plate, not thin air
  for(let k=0;k<7;k++){const a=rng()*TAU,r=rr(8,rFn(Y0)*.8);firePit('A',r*Math.cos(a),Y0+2.6,r*Math.sin(a),rr(2,3.6));}
  for(let k=0;k<9;k++){const a=rng()*TAU,r=rr(26,PR*.88);firePit('A',r*Math.cos(a),5.4,r*Math.sin(a),rr(1.8,3.4));}
  for(let k=0;k<5;k++){const a=rng()*TAU,r=rFn(cy)*rr(.25,.8);firePit('A',r*Math.cos(a),cy,r*Math.sin(a),rr(2,4));}}
 if(d===3)skyHoist(y=>rFn(y),H-8,5,9100);
 if(d>0&&!PROJ)skyShards(SM,d===3?.25:.5);
 figures(-PR,PR*1.28,7,6);if(PROJ)fireLights(FLM,3);KOFF=[0,0,0];return G;}
// --- B: the Scallop Stack (Goldberg lobes, widening upward) -------------------------------------
function buildSkyB(scene,gx,gz,d){reseed(9110+d);KOFF=[gx,0,gz];const SM=skyShardMark();const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const H=300,NL=12;const rFn=y=>26+10*Math.pow(clamp(y/H,0,1),1.4);const lobe=(th,y)=>rFn(y)*(1+.3*(.5+.5*Math.cos(NL*th)));
 REGISTER({name:'Skyscraper B — the Scallop Stack ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:100,h:H+40});
 // 110 carried nothing past r=72: the twelve legs stand at 70 and their columns
 // are 4.5 wide. 82 puts skyPlinth's column ring at 76.3, just outboard of them.
 // STANCE (round 2): the legs came in from 70 to 56 (the struts off them are
 // steeper), so the podium is 66 with its ring at 61.4.
 const LR=56,PR=66;
 skyPlinth(G,dd,PR);
 // core + 12 lobed legs spreading out to the plinth
 mesh(lathe({rFn:y=>16,H:30,nu:32,nv:2}),skin,G,0,5,0);
 for(let k=0;k<NL;k++){const th=k/NL*TAU;const gone=dd>0&&(k===3||k===8);const a=[Math.cos(th)*LR,5,Math.sin(th)*LR],b=[Math.cos(th)*rFn(30)*1.15,32,Math.sin(th)*rFn(30)*1.15];
  if(!gone){kput(dd>0?'colR':'colW',[a[0],5,a[2]],null,[4.5,27,4.5],null);beam(dd>0?'strutR':'strutW',[a[0],31,a[2]],b,5,4);}else rubbleRing(a[0],5,a[2],2,16,30,2.2);}
 const body=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.8:null);const L=(cut!=null?cut:H)-y0;let hole=holeFn(dx,17+(upper?1:0),cut!=null?L:null,1.5);if(d===1&&!upper)hole=skyScarHole(hole,.3,.08,L*.45,L,17);
  mesh(lathe({rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut?4:0,flutes:NL,amp:.3,sharp:1,nu:144,nv:60,hole,seed:17}),SHELL(dx),P);
  // THE CUT SECTION, as on Skyscraper A: the lining shares the outer skin's
  // hole predicate (it had none, so it stood whole behind every tear and hid
  // the floors) on a grid that lines up with it, and each plate is pale with a
  // dark soffit under it instead of dark on a dark lining.
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.85,H:H-y0,cut:cut!=null?L:null,jag:cut?4:0,nu:72,nv:30,hole,seed:17}),MAT.guts,P);
   for(let y=5;y<L-2;y+=5){const rp=rFn(y+y0);kput('slab',[0,y,0],null,[rp*.9,.5,rp*.9],new THREE.Color(0xbdb7ad));kput('slab',[0,y-1.2,0],null,[rp*.87,.6,rp*.87],new THREE.Color(0x191b1f));}
   skyRooms({rFn:y=>rFn(y+y0)*.84,y0:5,y1:L-2,step:5,soff:1.2,hole,d,seed:17,dens:6});}
  const bands=[];   // one mesh for the whole stack, not two per storey
  for(let s=0;s*5<L-4;s++){const y=s*5;const bh=dx>0?(u,v)=>fbm(u*10+s,2,18+s,2)<.25*dx||(d===1&&!upper&&hole(u,y)):null;
   bands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(lobe(th,y+y0)*.97,lobe(th,y+y0)*1.1,v);return[r*Math.cos(th),y+3.9,r*Math.sin(th)];},144,2,{hole:bh}));
   bands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lobe(th,y+y0)*1.1;return[r*Math.cos(th),y+3.2+v*1.1,r*Math.sin(th)];},144,1,{uS:30,hole:bh}));
   for(let k=0;k<NL;k++)for(let j=-1;j<=1;j+=2){const th=k/NL*TAU+j*.13;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,y))continue;const r=lobe(th,y+y0)+.1;
    kput(dx>0?'winSmD':'winSmI',[r*Math.cos(th),y+2,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2.6,2.2,1],null);}
   if(s%4===0)stripRing(0,y+2.6,0,rFn(y+y0)*.85,dx,36);}
  meshMerged(bands,SHELL(dx),P);
  if(cut==null){const Q=new THREE.Group();Q.position.set(0,L,0);P.add(Q);kput('slab',[0,L,0],null,[rFn(H)*1.1,1,rFn(H)*1.1],new THREE.Color(dx>0?0x5a4a40:0xd8d4cc));
   const CX=KXF;useGroupXF(Q);KXF={m:CX.m.clone().multiply(Q.matrix),q:CX.q.clone().multiply(Q.quaternion)};petalRing(Q,NL,rFn(H)*.75,42,16,6,1,0,dx,19,SHELL(dx),dx>0?(i=>i%4===1):null);endGroupXF();KXF=CX;/*end the nested group, then restore the outer transform: right both here and in a host (Iziz) whose useGroupXF keeps a stack*/
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*.72*Math.pow(clamp(1-Math.pow(y/30,2),0,1),.6),H:30,nu:48,nv:14}),MAT.glass,P,0,L+1,0);kput('finial',[0,L+38,0],null,[4,7,4],null);}}};
 const P=new THREE.Group();P.position.set(0,32,0);G.add(P);useGroupXF(P);if(d!==2)body(P,dd,32,null,false);else body(P,1,32,32+55,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,87,rFn(87)*1.3,(U,dx,y0)=>body(U,1,87,null,true),d);
 if(d===3)skyHoist(y=>rFn(y)*1.25,H+32-6,5,9110);
 if(d>0)skyShards(SM,d===3?.25:.5);
 figures(-PR,PR*1.28,6,6);KOFF=[0,0,0];return G;}
// --- C: the Tripod (three hyperboloid legs fusing into one fluted shaft) ---------------------------
function buildSkyC(scene,gx,gz,d){reseed(9120+d);KOFF=[gx,0,gz];const SM=skyShardMark();const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const H=380,YM=150;REGISTER({name:'Skyscraper C — the Tripod ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:130,h:H+30});
 // The three hyperboloid legs stand at r=62 and are ~24 wide at the foot, so
 // the outermost fabric on the podium is at ~86. 96 puts the column ring at
 // 89.3 — outboard of the legs and 19 m tighter than the old 115.
 // STANCE (round 2): the legs' feet came in from 62 to 50 (their heads still
 // meet the shaft at r=20, so they stand steeper), outermost fabric ~72, and
 // the podium is 80 with its ring at 74.4.
 const LR=50,PR=80;
 skyPlinth(G,dd,PR);
 const legR=y=>15*Math.sqrt(1+1.2*Math.pow((y-YM*.5)/(YM*.5),2));
 for(let k=0;k<3;k++){const th=k/3*TAU+Math.PI/6;const Lg=new THREE.Group();Lg.position.set(Math.cos(th)*LR,5,Math.sin(th)*LR);const tilt=Math.atan2(LR-20,YM);Lg.rotation.set(0,-th,0);Lg.rotateZ(tilt);G.add(Lg);useGroupXF(Lg);
  const LL=YM/Math.cos(tilt);mesh(lathe({rFn:legR,H:LL,flutes:10,amp:.1,sharp:2,nu:60,nv:30,hole:holeFn(dd*.8,27+k,null,1.5)}),skin,Lg);
  if(dd>0)mesh(lathe({rFn:y=>legR(y)*.85,H:LL,nu:24,nv:4}),MAT.guts,Lg);
  for(let y=8;y<LL-8;y+=6)for(let j=0;j<10;j++){const u=(j+.5)/10;const a=u*TAU,r=legR(y)+.1;kput(dd>0?'winSmD':'winSmI',[r*Math.cos(a),y,r*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[1.6,2.4,1],null);}
  for(let yy=20;yy<LL-10;yy+=30)stripRing(0,yy,0,legR(yy)*.9,dd,20);endGroupXF();}
 // sky bridges between legs
 for(const yb of [60,110]){for(let k=0;k<3;k++){const t1=k/3*TAU+Math.PI/6,t2=(k+1)/3*TAU+Math.PI/6;const r=LR-(LR-20)*yb/YM;const gone=dd>0&&yb===60&&k===1;
  const a=[Math.cos(t1)*r,yb+5,Math.sin(t1)*r],b=[Math.cos(t2)*r,yb+5,Math.sin(t2)*r];if(!gone){beam(dd>0?'strutR':'strutW',a,b,3,4);beam('tube',[a[0],a[1]+2.5,a[2]],[b[0],b[1]+2.5,b[2]],2.6,2.6);}}}
 const rFn=y=>{const t=clamp((y-YM)/(H-YM),0,1);return 34*(1-.35*t)*(1+.12*Math.sin(Math.PI*t));};
 const body=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.9:null);const L=(cut!=null?cut:H)-y0;let hole=holeFn(dx,37+(upper?1:0),cut!=null?L:null,1.2);if(d===1&&!upper)hole=skyScarHole(hole,.3,.08,L*.4,L,37);
  const o={rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut?8:0,flutes:15,amp:.22,sharp:3,nu:120,nv:80,hole,seed:37};mesh(lathe(o),SHELL(dx),P);
  // the cut section, as on A and B: punched lining, pale plates, dark soffits
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.88,H:H-y0,cut:o.cut,jag:o.jag,nu:60,nv:40,hole,seed:37}),MAT.guts,P);
   for(let y=7;y<L-2;y+=7){const rp=rFn(y+y0);kput('slab',[0,y,0],null,[rp*.9,.5,rp*.9],new THREE.Color(0xbdb7ad));kput('slab',[0,y-1.4,0],null,[rp*.87,.6,rp*.87],new THREE.Color(0x191b1f));}
   skyRooms({rFn:y=>rFn(y+y0)*.86,y0:7,y1:L-2,step:7,soff:1.4,hole,d,seed:37});}
  windowsOnLathe({rFn:y=>rFn(y+y0),hole,cut:o.cut},dx,6,L-14,7,15,0,0,0,false);
  const scarY=d===1&&!upper?L*.4:1e9;
  for(let yy=14;yy<Math.min(L-16,scarY);yy+=21)stripRing(0,yy,0,rFn(yy+y0)*.9,dx,24);
  [.35,.7].forEach(f=>{const yl=(H-YM)*f-(y0-YM);if(yl<8||yl>L-10||yl>scarY-8)return;glassBand(P,y=>rFn(y+y0),yl,8,dx,0,0,0,36);});
  if(cut==null){mesh(lathe({rFn:y=>rFn(H)*(1+.5*y/26)*Math.sqrt(clamp(1-Math.pow(y/26,2),0,1)),H:26,nu:48,nv:12,hole:(u,y)=>Math.cos(u*TAU*15)<.2&&y>3}),SHELL(dx),P,0,L-1,0);
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*.95*(1+.5*y/26)*Math.sqrt(clamp(1-Math.pow(y/26,2),0,1)),H:26,nu:48,nv:12}),MAT.glass,P,0,L-1,0);kput('finial',[0,L+30,0],null,[4,8,4],null);}}};
 kput('slab',[0,YM+4,0],null,[42,4,42],new THREE.Color(dd>0?0x4a3f38:0xcfcac2));kput(dd>0?'ringR':'ringW',[0,YM+6,0],qEuler(Math.PI/2,0,0),[42,42,10],null);
 const P=new THREE.Group();P.position.set(0,YM+6,0);G.add(P);useGroupXF(P);if(d!==2)body(P,dd,YM+6,null,false);else body(P,1,YM+6,YM+40,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,YM+40,rFn(YM+40),(U,dx,y0)=>body(U,1,YM+40,null,true),d,1,-Math.PI/6);   // between the legs
 if(d===3)skyHoist(y=>rFn(y),H-6,YM+6,9120);
 if(d>0)skyShards(SM,d===3?.25:.5);
 figures(-PR,PR*1.28,6,6);KOFF=[0,0,0];return G;}

