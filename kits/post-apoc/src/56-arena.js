// prefix: ar
// ---------------------------------------------------------------- THUNDERDOME ARENA (civic). Half scrap colosseum, half caged cauldron. Entry (tunnel + ticket booth) faces +z.
// Sand pit r 11 with a tyre-and-sheet wall and three gates, two tiers of scaffold stands (planks, benches, tyre seats), a VIP loge (bus + canopy) on the north side,
// the CAGE (two great steel rings joined by ribs, chain-link and chains) held by four lattice masts that also carry a gantry with winch and hanging chains,
// a ring of light poles and flag poles.
defBuilding({key:'arena',name:'Thunderdome arena',seed:5610,tags:{type:['civic'],size:'large',core:'scaffold + shipping containers + bus',materials:['scaffold','planks','earth-filled tyres','chain-link','corrugated sheet','bus']},w:56,d:56,h:20,budget:240000,build:arBuild});
const arQ=[[.2,PI/2-.34],[PI/2+.34,PI-.2],[PI+.2,1.5*PI-.42],[1.5*PI+.42,TAU-.2]];      // stand quadrants (gaps: E/W gates, S tunnel, N loge)
function arRad(r,a,y,fn){W(Math.cos(a)*r,y,Math.sin(a)*r,PI/2-a,fn);}     // frame with local +z pointing radially outward
function arTire(x,y,z,R,col,ry,rx){if(!_G.arTor){const g=new THREE.TorusGeometry(.67,.33,4,9);g.rotateX(PI/2);_G.arTor=g;}const m=TF(x,y,z,ry,rx||0,0);m.scale(new THREE.Vector3(R,R,R));emit('rubber',_G.arTor,m,col===undefined?jc(0x252220,.05):col);}
/* the stands' tyre seats, armchairs and tables are the catalog's (tireStool, tireChair, tireTable in 34-adds.js: FURNISH), the low-poly copies
   the arena drew are gone; the helpers draw the same random numbers the copies drew, so every colour in the arena is unchanged */
function arBright(){return pick([0xc45a30,0xd8a020,0x3b7f8e,0x4d6f3c,0x9a3a2c,0xd8d0c0,0x2f5f8f,0x8a6a3a,0xc98a2a]);}
function arWood(){return jc(pick([0x6a5238,0x7a6244,0x5c4630,0x8a7050]),.08);}
function arSearch(x,y,z,ry,rx){W(x,y,z,ry,()=>{cylH('iron',0,0,0,.24,.6,jc(0x3a3430,.05),'z',10);sph('glow',0,0,.3,.17,jc(0xfff2c0,.03));box('iron',-.18,-.32,-.1,.36,.32,.2,jc(0x4a4038,.05));});}
// ---- the stands
function arFace(a){return Math.atan2(-Math.cos(a),-Math.sin(a));}        // yaw that turns a furniture piece's +z front toward the pit centre
const arCHSP=2.3,arSTSP=1.8;                                            // spacing along the row (m): chairs, stools
function arRow(r0,w,top,a0,a1,k,tier,mode){const mid=(r0+r0+w)/2;const dk=jc(0x4a4038,.05);
 sector('plank',0,0,r0,r0+w,a0,a1,top-.1,top,jc(0x6a5a44,.06));sector('corr',0,0,r0,r0+.05,a0,a1,top-.55,top-.1,jc(pick([0x8a3a2c,0x3b7f6e,0x7a7a72,0xc99a2e,0x2f5f8f]),.06));
 sector('iron',0,0,r0+.02,r0+.12,a0,a1,top-.8,top-.7,dk);
 const s=2.4/(r0+.06);const n=Math.max(1,Math.round((a1-a0)/s));const st=(a1-a0)/n;
 for(let i=0;i<=n;i++){const a=a0+i*st;const x=Math.cos(a)*(r0+.06),z=Math.sin(a)*(r0+.06);beam('iron',[x,0,z],[x,top-.1,z],.045,dk,true,5);
  if(i<n&&(k+i)%2===0){const b=a+st;beam('iron',[x,0,z],[Math.cos(b)*(r0+.06),top-.75,Math.sin(b)*(r0+.06)],.03,jc(0x5a5048,.05),true,4);}}
 const rc=r0+w*.5;
 if(mode==='bench'){const cs=5/mid;for(let a=a0;a<a1-.001;a+=cs){const b=Math.min(a1,a+cs);sector('plank',0,0,r0+.22,r0+.5,a+.01,b-.01,top,top+.42,jc(arBright(),.08));}
  sector('plank',0,0,r0+.5,r0+.56,a0,a1,top+.3,top+.72,jc(0x5c4630,.06));}
 else{const sp=(mode==='chair'?arCHSP:arSTSP)/rc;const cnt=Math.max(1,Math.floor((a1-a0)/sp));const off=((a1-a0)-(cnt-1)*sp)/2;
  for(let i=0;i<cnt;i++){const a=a0+off+i*sp;const x=Math.cos(a)*rc,z=Math.sin(a)*rc;
   if(mode==='chair'){if(i%4===2)tireTable(x,top,z,{});else tireChair(x,top,z,arFace(a),{});}else tireStool(x,top,z,{});}}
 if(tier===2&&k===4){const rr_=r0+w+.05;for(let i=0;i<=n;i++){const a=a0+i*st;beam('wood',[Math.cos(a)*rr_,top,Math.sin(a)*rr_],[Math.cos(a)*rr_,top+1.1,Math.sin(a)*rr_],.05,jc(0x5c4630,.06),true,5);}sector('wood',0,0,rr_-.03,rr_+.03,a0,a1,top+1.05,top+1.11,jc(0x5c4630,.06));}}
function arStands(){for(const [q0,q1] of arQ){
  const m1=['chair','bench','chair'];for(let k=0;k<3;k++)arRow(13.3+k*1.25,1.25,.9+k*.65,q0,q1,k,1,m1[k]);
  sector('plank',0,0,17.05,17.95,q0,q1,2.85,3.0,jc(0x6a5a44,.06));sector('iron',0,0,17.05,17.12,q0,q1,2.2,2.28,jc(0x4a4038,.05));
  {const n=Math.max(2,Math.round((q1-q0)*17.3/2.4));for(let i=0;i<=n;i++){const a=q0+(q1-q0)*i/n;beam('iron',[Math.cos(a)*17.4,0,Math.sin(a)*17.4],[Math.cos(a)*17.4,2.85,Math.sin(a)*17.4],.05,jc(0x4a4038,.05),true,5);}}
  const m2=['stool','bench','stool','bench','stool'];for(let k=0;k<5;k++)arRow(17.95+k*1.15,1.15,3.9+k*1.05,q0,q1,k,2,m2[k]);
  }}
// ---- the rear screen: one continuous ring of upright panels on a 48-panel grid, equal height, straight top with a cap rail; ground openings only at the E/W gates and the S tunnel
function arScreen(){const NP=48,cw=TAU/NP,H=10.5,r0=24.34,r1=24.42;const open=i=>{const d=k=>Math.min((i-k+NP)%NP,(k-i+NP)%NP);return d(0)===0||i===NP-1||i===0||i===NP/2-1||i===NP/2||(i>=NP/4-2&&i<=NP/4+1)?true:false;};
 const isOpen=i=>i===NP-1||i===0||i===NP/2-1||i===NP/2||(i>=NP/4-2&&i<=NP/4+1);
 for(let i=0;i<NP;i++){const a=i*cw,b=a+cw;const lo=isOpen(i)?3.6:0;const c=i%2?jc(arBright(),.06):jc(arBright(),.06);
  sector('corr',0,0,r0,r1,a+.002,b-.002,lo,H,c);
  const px=Math.cos(a)*(r1+.06),pz=Math.sin(a)*(r1+.06);beam('wood',[px,(isOpen(i)&&isOpen((i+NP-1)%NP))?lo:0,pz],[px,H+.12,pz],.07,jc(0x5c4630,.06),true,6);}
 sector('wood',0,0,r0-.04,r1+.1,0,TAU,H,H+.14,jc(0x5c4630,.06),96);
 sector('iron',0,0,r0-.02,r1+.04,0,TAU,H*.5,H*.5+.09,jc(0x4a4038,.05),96);
 for(let i=0;i<NP;i++){if(i%3!==1)continue;let near=false;for(let k=-2;k<=2;k++)if(isOpen((i+k+NP)%NP))near=true;if(near)continue;const m=(i+.5)*cw;
  arRad(r1+.04,m,H-.02,()=>{sock('banner',0,0,.02,0,{w:1.1,h:3.0});});}}
// ---- the pit
function arPit(){cyl('earth',0,.02,0,28,.04,jc(0xb49a76,.04),56);cyl('plain',0,.05,0,11.2,.03,jc(0xd8c088,.03),48);cyl('plain',0,.08,0,8.2,.02,jc(0xcfb47a,.04),40);cyl('plain',0,.1,0,4.6,.02,jc(0xc8a86a,.04),32);
 for(let k=0;k<9;k++){const a=k/9*TAU+.3,r=rr(2,9.5);const c=pick([0xe6dccb,0x8a6a3a,0x7a2a20]);box('plain',Math.cos(a)*r,.11,Math.sin(a)*r,rr(.15,.6),.02,rr(.15,.5),jc(c,.06),rng()*TAU);}
 for(const [x,z] of [[-5,-3],[4,5],[6,-4],[-3,6]])arTire(x,.14,z,.36,undefined,rng()*TAU);
 // wall: earth core, tyres on the outer face, sheet fence above, timber cap; gaps for the three gates
 const gw=.17,arcs=[[gw,PI/2-gw],[PI/2+gw,PI-gw],[PI+gw,TAU-gw]];
 for(const [a0,a1] of arcs){sector('earth',0,0,10.9,11.6,a0,a1,0,1.0,jc(0x9a7a58,.05));
  const cs=2.7/11.4;let i=0;for(let a=a0;a<a1-.001;a+=cs){const b=Math.min(a1,a+cs);sector('corr',0,0,11.0,11.08,a,b,1.0,2.5,rng()<.8?jc(arBright(),.08):P('galv'));
   const am=(a+b)/2;beam('wood',[Math.cos(a)*11.05,0,Math.sin(a)*11.05],[Math.cos(a)*11.05,2.7,Math.sin(a)*11.05],.07,jc(0x5c4630,.06),true,6);i++;}
  sector('wood',0,0,10.85,11.75,a0,a1,2.5,2.65,jc(0x6a5238,.06));
  const step=.72/11.75;for(let c=0;c<4;c++)for(let a=a0+step*.5+(c%2)*step*.5;a<a1-step*.4;a+=step){const paint=rng()<.12;arTire(Math.cos(a)*11.72,c*.22+.12,Math.sin(a)*11.72,.36,paint?jc(arBright(),.06):undefined,rng()*TAU);}
  }
  // gates: iron posts run to the wall top and carry the cage ring; a chain-link leaf hangs half open (the cage door + emblem plate are in arCage)
 for(let g=0;g<3;g++){const a=g*PI/2;arRad(11.4,a,0,()=>{
   for(const sx of [-1,1]){box('iron',sx*2.0,0,-.3,.26,2.65,.6,jc(0x3a3532,.04));}
   box('iron',0,2.4,-.3,4.26,.25,.6,jc(0x3a3532,.04));      // lintel joining the two gate posts
   W(-1.86,0,-.02,-.9,()=>{quad('chain',.95,1.25,0,1.85,2.4,jc(0xb4b8b8,.05));box('iron',.95,2.45,0,1.85,.06,.06,jc(0x3a3532,.04));box('iron',.95,0,0,1.85,.06,.06,jc(0x3a3532,.04));box('iron',1.85,0,0,.06,2.5,.06,jc(0x3a3532,.04));box('iron',.04,0,0,.06,2.5,.06,jc(0x3a3532,.04));});
   for(const sx of [-1,1])lamp(sx*2.6,0,.9,3.4,{arm:-sx*.35});});}
}
// ---- corridors, entry tunnel, ticket booth, stalls
function arEntry(){
 // south tunnel: two containers on end forming the passage, roofed; arch with emblem at the outer end
 for(const sx of [-1,1])W(sx*2.45,0,18.4,PI/2,()=>container({len:CT.L40,doorEnd:false,col:jc(pick([0xc45a30,0x3b7f8e,0xd8a020]),.05)}));
 // roof: one slab over both containers (no doubled layers), cross-beams on top, floor
 box('sheet',0,CT.H+.02,18.4,7.4,.1,12.3,jc(0x8a8a86,.05));
 for(let k=0;k<6;k++)box('iron',0,CT.H+.12,12.9+k*2.1,7.4,.1,.14,jc(0x3a3430,.05));
 box('conc',0,0,18.4,2.44,.04,12.19,jc(0x8a7a66,.05));
 // outer arch: posts, a solid header beam, a hung plate with its own clear emblem field; banners hang from the posts, well away from the plate
 for(const sx of [-1,1]){box('iron',sx*4.3,0,24.6,.3,6.3,.3,jc(0x3a3532,.04));}entry(0,0,24.6,2.4,2.6);/* front door: the tunnel mouth */
 box('iron',0,6.0,24.6,9.0,.34,.3,jc(0x3a3532,.04));
 for(const sx of [-1,1])box('iron',sx*1.55,4.15,24.6,.1,1.85,.1,jc(0x3a3532,.04));            // hangers
 box('sheet',0,4.15,24.66,3.2,1.85,.1,jc(0xc99a2e,.06));                                       // plate 3.2 x 1.85, front face at z 24.71
 box('iron',0,4.11,24.72,3.36,.06,.05,jc(0x3a3532,.04));box('iron',0,5.94,24.72,3.36,.06,.05,jc(0x3a3532,.04));
 for(const sx of [-1,1])box('iron',sx*1.68,4.11,24.72,.08,1.95,.05,jc(0x3a3532,.04));
 sock('emblem',0,5.07,24.79,0,{w:1.35,h:1.35});sock('emblem',0,5.07,24.585,PI,{w:1.35,h:1.35});
 sock('banner',-4.3,5.95,24.82,0,{w:1.0,h:2.6});sock('banner',4.3,5.95,24.82,0,{w:1.0,h:2.6});
 // rear arch over the pit end of the tunnel: two posts and a full-width solid beam that sits on them
 for(const sx of [-1,1])box('iron',sx*4.3,0,12.1,.3,5.6,.3,jc(0x3a3532,.04));
 box('iron',0,5.35,12.1,9.2,.4,.4,jc(0x3a3532,.04));box('sheet',0,4.55,12.0,8.0,.8,.06,jc(0x6a6a66,.05));
 // E and W gate corridors: sheet flanks
 for(const sx of [-1,1])for(const sz of [-1,1]){W(sx*15.5,0,sz*2.75,0,()=>{box('corr',0,0,0,9.0,3.2,.12,pick([P('galv'),P('rust'),P('paint')]));for(let k=0;k<5;k++)beam('wood',[-4.4+k*2.2,0,0],[-4.4+k*2.2,3.4,0],.08,jc(0x5c4630,.06),true,6);});}
 // ticket booth (container) with hatch, awning, sign
 const bx=9.6,bz=25.4;W(bx,0,bz,0,()=>container({len:CT.L20,doorEnd:false,col:jc(0x3b7f8e,.05)}));
 win(bx-.8,1.1,bz+CT.W/2,1.6,.9,{});door(bx+1.8,.16,bz+CT.W/2,.9,2.0,{step:true});
 sock('awning',bx-.8,2.05,bz+CT.W/2,0,{w:2.4,d:1.2,drop:.35,h:1.55});sock('sign',bx+.2,2.4,bz+CT.W/2+.05,0,{w:2.2,h:.4,trade:'TICKETS'});
 stovepipe(bx+2.2,CT.H,bz-.3,1.2);arQueue(bx);tireStool(bx-2.6,0,bz+2.0,{});
 // two stalls: lean-to counters with awnings
 for(const [sx,c] of [[-9.6,0x8a3a2c],[-15.4,0x3b7f6e]]){W(sx,0,25.4,0,()=>{rngSkip(35);FURNISH('pa_lean_to_stall',0,0,0,0,{v:1});   // the food stall (its drum and crate included)
   sock('awning',0,2.55,1.35,0,{w:4.0,d:1.0,drop:.4,h:2.3});});}
 sock('sign',-12.5,3.2,24.2,0,{w:2.6,h:.6,trade:'FOOD'});box('wood',-12.5,2.7,24.15,2.7,.5,.08,jc(0x5c4630,.06));
}
function arQueue(bx){for(let k=0;k<4;k++){beam('wood',[bx-2.6+k*1.7,0,27.3],[bx-2.6+k*1.7,1.0,27.3],.05,jc(0x5c4630,.06),true,5);}beam('wood',[bx-2.6,.95,27.3],[bx+.8,.95,27.3],.04,jc(0x5c4630,.06));}
// ---- VIP loge (north): raised deck, a bus, a big sheet canopy, a hoarding with the emblem
function arLoge(){const dy=3.6;box('plank',0,dy-.14,-18.7,13.6,.14,7.6,jc(0x6a5a44,.06));
 for(let i=0;i<=4;i++)for(const z of [-22.3,-15.2]){beam('iron',[-6.4+i*3.2,0,z],[-6.4+i*3.2,dy-.14,z],.06,jc(0x4a4038,.05),true,6);}
 for(let i=0;i<4;i++){beam('iron',[-6.4+i*3.2,0,-15.2],[-6.4+(i+1)*3.2,dy-.7,-15.2],.03,jc(0x5a5048,.05),true,4);beam('iron',[-6.4+i*3.2,dy-.7,-15.2],[-6.4+(i+1)*3.2,0,-15.2],.03,jc(0x5a5048,.05),true,4);}
 W(-.5,dy,-19.9,0,()=>bus({len:10.6,col:0xc99a2e}));
 // rail along the front
 arRail(-6.9,-15.05,6.8,-15.05,dy);
 // canopy of sheet on posts, sloping to the pit
 for(const x of [-6.2,-2.1,2.1,6.2])beam('wood',[x,dy,-15.1],[x,dy+3.5,-15.1],.09,jc(0x5c4630,.06),true,6);
 for(const x of [-6.2,-2.1,2.1,6.2])beam('wood',[x,dy,-22.2],[x,dy+4.9,-22.2],.09,jc(0x5c4630,.06),true,6);
 roofP('corr',-7.3,7.3,-14.4,dy+3.5,-22.6,dy+4.9,.08,jc(0xa8402e,.06));roofP('corr',-7.3,7.3,-14.4,dy+3.42,-22.6,dy+4.82,.02,jc(0xd8d0c0,.04));
 for(let k=0;k<8;k++)beam('wood',[-6.8+k*2,dy+3.5,-14.5],[-6.8+k*2,dy+4.9,-22.4],.05,jc(0x5c4630,.06));
 // hoarding with the emblem above the back edge
 box('sheet',0,dy+5.0,-22.5,4.4,3.2,.14,jc(0x6a6a66,.04));for(const x of [-2.5,2.5])beam('wood',[x,dy+4.6,-22.35],[x,dy+8.4,-22.35],.08,jc(0x5c4630,.06),true,6);
 sock('emblem',0,dy+6.6,-22.4+.16,0,{w:2.4,h:2.4});
 sock('banner',-6.2,dy+3.5,-14.95,0,{w:1.2,h:2.6});sock('banner',6.2,dy+3.5,-14.95,0,{w:1.2,h:2.6});
 sock('awning',0,dy+2.2,-14.6,0,{w:4.0,d:1.0,drop:.4,h:1.8});
 for(const x of [-4.2,-3.0,3.0,4.2])tireChair(x,dy,-16.5,0,{});tireTable(0,dy,-16.3,{n:2});tireChair(-.9,dy,-17.3,0,{});tireChair(.9,dy,-17.3,0,{});
 // stair to the loge from behind
 arRail(-6.8,-22.45,6.8,-22.45,dy);arRail(-6.8,-22.45,-6.8,-15.05,dy);arRail(6.8,-22.45,6.8,-15.05,dy);
}
function arRail(x0,z0,x1,z1,y){const L=Math.hypot(x1-x0,z1-z0);const n=Math.max(1,Math.round(L/1.6));for(let k=0;k<=n;k++){const t=k/n;beam('wood',[x0+(x1-x0)*t,y,z0+(z1-z0)*t],[x0+(x1-x0)*t,y+1.0,z0+(z1-z0)*t],.045,jc(0x5c4630,.06),true,5);}beam('wood',[x0,y+1,z0],[x1,y+1,z1],.05,jc(0x5c4630,.06));beam('wood',[x0,y+.5,z0],[x1,y+.5,z1],.035,jc(0x5c4630,.06));}
// ---- the cage (hell-in-a-cell): flush on the pit wall cap, roof 6 m above it
function arPole(x,y0,y1,z,r){beam('wood',[x,y0,z],[x,y1,z],r,jc(0x4a4038,.05),true,6);}
function arCage(){const rc=11.3,WT=2.65,CTP=WT+6.0;const st=jc(0x4a4038,.05),st2=jc(0x5a5048,.05);const gA=[0,PI/2,PI],gh=0;
 const nearGate=a=>false;   // no gates in the cage
 // rings with thickness: the bottom ring sits straight on the wall cap, the top ring carries the roof
 sector('iron',0,0,rc-.47,rc+.47,0,TAU,WT,WT+.5,st,56);
 sector('iron',0,0,rc-.47,rc+.47,0,TAU,CTP,CTP+.55,st,56);
 const N=32,y0=WT+.52,y1=CTP-.02;
 for(let i=0;i<N;i++){const a=i/N*TAU,b=(i+1)/N*TAU,m=(a+b)/2;const gate=nearGate(m);const lo=gate?6.5:y0;
  if(!nearGate(a)||true){const ga=nearGate(a);beam('iron',[Math.cos(a)*rc,ga?6.4:WT+.25,Math.sin(a)*rc],[Math.cos(a)*rc,CTP+.3,Math.sin(a)*rc],.14,st);}
  if(y1-lo>.3){const ch=2*(rc-.16)*Math.sin(PI/N)*.98,hh=y1-lo;arRad(rc-.16,m,(lo+y1)/2,()=>{quad('chain',0,0,0,ch,hh,jc(0xb4b8b8,.05));});}}
 // hoop outside the ribs, unbroken
 sector('iron',0,0,rc+.09,rc+.21,0,TAU,5.7,5.86,st2,56);
 // no upper doors: the cage is closed chain-link all round; an emblem plate hangs on the hoop over each pit gate
 gA.forEach(g=>arRad(rc,g,0,()=>{
  box('sheet',0,4.3,.3,3.4,1.5,.1,jc(pick([0x8a3a2c,0x3b7f6e,0xc99a2e]),.06));
  for(const sx of [-1,1]){box('iron',sx*1.6,4.05,.14,.1,.3,.2,st);box('iron',sx*1.6,5.5,.14,.1,.3,.2,st);}
  for(const y of [4.3,5.75])box('iron',0,y-.03,.4,3.4,.06,.05,jc(0x3a3532,.04));
  sock('emblem',0,5.05,.42,0,{w:1.3,h:1.3});}));
 // roof: radial spokes and two hoops of beams over a chain-link deck, hub ring with a hatch
 const ry=CTP+.275;
 for(let i=0;i<16;i++){const a=i/16*TAU+.1;beam('iron',[Math.cos(a)*1.3,ry,Math.sin(a)*1.3],[Math.cos(a)*(rc-.1),ry,Math.sin(a)*(rc-.1)],.16,st);}
 for(const r of [4.5,7.8])sector('iron',0,0,r-.09,r+.09,0,TAU,CTP+.16,CTP+.39,st2,40);
 sector('chain',0,0,1.45,rc-.1,0,TAU,CTP+.10,CTP+.12,jc(0xb4b8b8,.05),40);
 sector('iron',0,0,1.05,1.5,0,TAU,CTP+.12,CTP+.42,st,20);
 // winch on the roof over the hatch: frame, drum that turns, chain down through the hatch
 for(const sz of [-1,1])beam('iron',[0,CTP+.42,sz*.75],[0,CTP+1.9,sz*.75],.09,st,true,6);beam('iron',[0,CTP+1.9,-.75],[0,CTP+1.9,.75],.08,st);
 spin(0,CTP+1.35,0,0,'z',.4,()=>{cylH('iron',0,0,0,.34,1.2,jc(0x8a8a86,.05),'z',10);for(const sz of [-1,1])cylH('iron',0,0,sz*.62,.5,.05,jc(0x3a3430,.05),'z',10);});
 beam('iron',[0,CTP+1.0,0],[0,4.2,0],.03,jc(0x6a6a66,.05),true,3);for(let q=0;q<10;q++)box('iron',0,CTP+.8-q*.55-.1,0,.07,.2,.1,jc(0x7a7a76,.05),q*1.57);box('iron',-.12,3.9,-.05,.24,.35,.1,jc(0x3a3430,.05));
 // hanging from the roof hoops: chains with hooks and weapons, and four light rigs (cans point down)
 for(let i=0;i<10;i++){const a=i/10*TAU+.2,r=4.5,x=Math.cos(a)*r,z=Math.sin(a)*r,len=rr(1.6,3.4);beam('iron',[x,CTP+.2,z],[x,CTP-len,z],.022,jc(0x6a6a66,.05),true,3);
  for(let q=0;q<len/.55;q++)box('iron',x,CTP-.3-q*.55-.08,z,.06,.16,.09,jc(0x7a7a76,.05),q*1.57);
  if(i%3===0){box('iron',x-.03,CTP-len-1.0,z-.03,.06,1.0,.06,jc(0x4a4038,.05));box('iron',x-.09,CTP-len-.5,z-.09,.18,.5,.18,jc(0x5a5048,.05));}      // spiked club
  else if(i%3===1){box('iron',x-.02,CTP-len-1.3,z-.09,.04,1.3,.18,jc(0x9a9a96,.05));}                                                             // blade
  else sph('iron',x,CTP-len-.12,z,.14,jc(0x3a3430,.05));}
 for(let i=0;i<4;i++){const a=i/4*TAU+PI/4,r=7.8,x=Math.cos(a)*r,z=Math.sin(a)*r;
  for(const [dx,dz] of [[-.4,-.4],[.4,-.4],[.4,.4],[-.4,.4]])beam('iron',[x+dx*.5,CTP+.2,z+dz*.5],[x+dx,CTP-1.6,z+dz],.02,jc(0x6a6a66,.05),true,3);
  box('iron',x-.55,CTP-1.7,z-.55,1.1,.1,1.1,jc(0x3a3430,.05));
  for(const [dx,dz] of [[-.3,-.3],[.3,-.3],[.3,.3],[-.3,.3]]){cyl('iron',x+dx,CTP-2.15,z+dz,.17,.45,jc(0x3a3430,.05),8);sph('glow',x+dx,CTP-2.17,z+dz,.15,jc(0xfff2c0,.03));}}
 // flags on poles rising from the top ring, banners hung on its outer face
 for(let k=0;k<4;k++){const a=PI/4+k*PI/2;arRad(rc,a,CTP+.55,()=>{beam('wood',[0,0,0],[0,3.4,0],.06,jc(0x4a4038,.05),true,6);sock('flag',0,3.5,0,0,{w:1.6,h:.8});});
  arRad(rc+.47,a,CTP+.02,()=>{sock('banner',0,0,.05,0,{w:1.2,h:3.2});});}}
function arPoles(){for(let k=0;k<10;k++){const a=(9+36*k)*PI/180;const x=Math.cos(a)*26.4,z=Math.sin(a)*26.4;const light=k%2===0;
  box('conc',x-.3,0,z-.3,.6,.4,.6,jc(0x8a8880,.05));const h=light?12.5:16;cyl('iron',x,.3,z,.2,h,jc(0x4a4038,.05),8,.08);
  if(light){for(let q=0;q<3;q++){const ao=a+PI+(q-1)*.35;arSearch(x+Math.cos(a)*-.2,h+.3-q*.05,z+Math.sin(a)*-.2,PI/2-ao+PI*0,0);}beam('iron',[x,h+.3,z],[x,h+.9,z],.05,jc(0x4a4038,.05),true,5);sock('flag',x,h+1.0,z,0,{w:1.2,h:.6});}
  else{sock('flag',x,h+.4,z,0,{w:1.8,h:.9});}
  const bx=Math.cos(a),bz=Math.sin(a);}}
function arBuild(o){arPit();arStands();arEntry();arLoge();arScreen();arCage();arPoles();
 // yard junk in the plaza corners
 junkPile(-22,20,2,8);junkPile(22,-19,2,8);tireStack(16,22,3);barrel(-18,0,24);barrel(-18.6,0,23.6);crate(20,0,21,.7,.3);}
