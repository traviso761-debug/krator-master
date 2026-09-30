// prefix: ar
// ---------------------------------------------------------------- THUNDERDOME ARENA (civic). Half scrap colosseum, half caged cauldron. Entry (tunnel + ticket booth) faces +z.
// Sand pit r 11 with a tyre-and-sheet wall and three gates, two tiers of scaffold stands (planks, benches, tyre seats), a VIP loge (bus + canopy) on the north side,
// the CAGE (two great steel rings joined by ribs, chain-link and chains) held by four lattice masts that also carry a gantry with winch and hanging chains,
// a ring of light poles and flag poles.
defBuilding({key:'arena',name:'Thunderdome arena',seed:5610,tags:{type:['civic'],size:'large',core:'scaffold + shipping containers + bus',materials:['scaffold','planks','earth-filled tyres','chain-link','corrugated sheet','bus']},w:56,d:56,h:20,budget:240000,build:arBuild});
const arQ=[[.2,PI/2-.34],[PI/2+.34,PI-.2],[PI+.2,1.5*PI-.42],[1.5*PI+.42,TAU-.2]];      // stand quadrants (gaps: E/W gates, S tunnel, N loge)
function arRad(r,a,y,fn){W(Math.cos(a)*r,y,Math.sin(a)*r,PI/2-a,fn);}     // frame with local +z pointing radially outward
function arTire(x,y,z,R,col,ry){if(!_G.arTor){const g=new THREE.TorusGeometry(.67,.33,4,9);g.rotateX(PI/2);_G.arTor=g;}const m=TF(x,y,z,ry,0,0);m.scale(new THREE.Vector3(R,R,R));emit('rubber',_G.arTor,m,col===undefined?jc(0x252220,.05):col);}
function arBright(){return pick([0xc45a30,0xd8a020,0x3b7f8e,0x4d6f3c,0x9a3a2c,0xd8d0c0,0x2f5f8f,0x8a6a3a,0xc98a2a]);}
function arWood(){return jc(pick([0x6a5238,0x7a6244,0x5c4630,0x8a7050]),.08);}
function arSearch(x,y,z,ry,rx){W(x,y,z,ry,()=>{cylH('iron',0,0,0,.24,.6,jc(0x3a3430,.05),'z',10);sph('glow',0,0,.3,.17,jc(0xfff2c0,.03));box('iron',-.18,-.32,-.1,.36,.32,.2,jc(0x4a4038,.05));});}
// ---- the stands
function arRow(r0,w,top,a0,a1,k,tier){const mid=(r0+r0+w)/2;const dk=jc(0x4a4038,.05);
 sector('plank',0,0,r0,r0+w,a0,a1,top-.1,top,jc(0x6a5a44,.06));sector('corr',0,0,r0,r0+.05,a0,a1,top-.55,top-.1,jc(pick([0x8a3a2c,0x3b7f6e,0x7a7a72,0xc99a2e,0x2f5f8f]),.06));
 sector('iron',0,0,r0+.02,r0+.12,a0,a1,top-.8,top-.7,dk);
 const s=2.4/(r0+.06);const n=Math.max(1,Math.round((a1-a0)/s));const st=(a1-a0)/n;
 for(let i=0;i<=n;i++){const a=a0+i*st;const x=Math.cos(a)*(r0+.06),z=Math.sin(a)*(r0+.06);beam('iron',[x,0,z],[x,top-.1,z],.045,dk,true,5);
  if(i<n&&(k+i)%2===0){const b=a+st;beam('iron',[x,0,z],[Math.cos(b)*(r0+.06),top-.75,Math.sin(b)*(r0+.06)],.03,jc(0x5a5048,.05),true,4);}}
 if(k%2===0){ // bench: coloured planks in chunks
  const cs=5/mid;for(let a=a0;a<a1-.001;a+=cs){const b=Math.min(a1,a+cs);sector('plank',0,0,r0+.22,r0+.5,a+.01,b-.01,top,top+.42,jc(arBright(),.08));}
  sector('plank',0,0,r0+.5,r0+.56,a0,a1,top+.3,top+.72,jc(0x5c4630,.06));
 }else{const step=.8/mid;for(let a=a0+step*.5;a<a1;a+=step){const c=rng()<.25?jc(arBright(),.06):undefined;arTire(Math.cos(a)*(r0+.42),top+.12,Math.sin(a)*(r0+.42),.36,c,rng()*TAU);}}
 if(tier===2&&k===5){ // rail behind the top row
  const rr_=r0+w+.05;for(let i=0;i<=n;i++){const a=a0+i*st;beam('wood',[Math.cos(a)*rr_,top,Math.sin(a)*rr_],[Math.cos(a)*rr_,top+1.1,Math.sin(a)*rr_],.05,jc(0x5c4630,.06),true,5);}sector('wood',0,0,rr_-.03,rr_+.03,a0,a1,top+1.05,top+1.11,jc(0x5c4630,.06));}}
function arStands(){let qi=0;for(const [q0,q1] of arQ){
  for(let k=0;k<5;k++)arRow(13.3+k*.85,.85,.9+k*.5,q0,q1,k,1);
  sector('plank',0,0,17.55,18.6,q0,q1,3.75,3.9,jc(0x6a5a44,.06));sector('iron',0,0,17.53,17.6,q0,q1,3.0,3.05,jc(0x4a4038,.05));
  { // aisle rail + posts to the ground
   const n=Math.max(2,Math.round((q1-q0)*17.6/2.4));for(let i=0;i<=n;i++){const a=q0+(q1-q0)*i/n;beam('iron',[Math.cos(a)*17.9,0,Math.sin(a)*17.9],[Math.cos(a)*17.9,3.75,Math.sin(a)*17.9],.05,jc(0x4a4038,.05),true,5);}}
  for(let k=0;k<6;k++)arRow(18.6+k*.9,.9,4.9+k*.65,q0,q1,k,2);
  // rear screen: patchwork of sheet panels in chunks, ragged top; banner sockets on the top edge
  const cs=3.2/24.4;let ci=0;for(let a=q0;a<q1-.001;a+=cs){const b=Math.min(q1,a+cs);const h=rr(8.6,10.8);const c=rng()<.75?jc(arBright(),.08):P('galv');
   sector('corr',0,0,24.34,24.42,a,b,0,h,c);sector('corr',0,0,24.34,24.42,a,b,0,3.0,jc(pick([0x6a5a44,0x8a3a2c,0x3b7f6e]),.08));
   if(ci%3===1){const m=(a+b)/2;arRad(24.42,m,h,()=>{sock('banner',0,0,.02,0,{w:1.1,h:3.0});});}ci++;}
  // caged ladder up the back at the middle of the quadrant
  {const m=(q0+q1)/2;arRad(24.5,m,0,()=>ladder(0,0,.05,10.4,0));}
  qi++;}}
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
  // sheet-metal spikes along the inner top edge
  for(let a=a0;a<a1;a+=1.1/11){beam('iron',[Math.cos(a)*10.95,2.65,Math.sin(a)*10.95],[Math.cos(a)*10.7,3.15,Math.sin(a)*10.7],.025,jc(0x2e2a28,.05),true,4);}}
 // gates: posts, lintel with emblem plate, chain-link leaf swung half open
 for(let g=0;g<3;g++){const a=g*PI/2;arRad(11.4,a,0,()=>{
   for(const sx of [-1,1]){box('iron',sx*2.0-.13,0,-.3,.26,3.3,.6,jc(0x3a3532,.04));}box('iron',-2.15,3.2,-.3,4.3,.3,.6,jc(0x3a3532,.04));
   box('sheet',0,3.5,.05,3.4,1.1,.12,jc(pick([0x8a3a2c,0x3b7f6e,0xc99a2e]),.06));sock('emblem',0,4.05,.13,0,{w:.95,h:.95});
   box('iron',-1.95,0,.0,.06,2.9,.06,jc(0x3a3532,.04));
   W(-1.9,0,-.02,-.9,()=>{quad('chain',1.0,1.5,0,1.9,2.9,jc(0xb4b8b8,.05));box('iron',1.0,2.9,0,1.9,.06,.06,jc(0x3a3532,.04));box('iron',1.0,0,0,1.9,.06,.06,jc(0x3a3532,.04));box('iron',1.9,0,0,.06,2.9,.06,jc(0x3a3532,.04));});
   for(const sx of [-1,1])lamp(sx*2.6,0,.9,3.6,{arm:-sx*.35});});}
}
// ---- corridors, entry tunnel, ticket booth, stalls
function arEntry(){
 // south tunnel: two containers on end forming the passage, roofed; arch with emblem at the outer end
 for(const sx of [-1,1])W(sx*2.45,0,18.4,PI/2,()=>container({len:CT.L40,doorEnd:false,col:jc(pick([0xc45a30,0x3b7f8e,0xd8a020]),.05)}));
 box('plank',0,CT.H,18.4,2.6,.12,12.19,jc(0x6a5a44,.06));box('sheet',0,CT.H+.1,18.4,2.7,.05,12.3,P('galv'));
 for(let k=0;k<6;k++)box('iron',0,CT.H+.03,12.9+k*2.1,2.7,.09,.09,jc(0x3a3430,.05));
 box('conc',0,0,18.4,2.44,.04,12.19,jc(0x8a7a66,.05));
 // outer arch
 for(const sx of [-1,1]){box('iron',sx*3.95,0,24.75,.3,5.0,.3,jc(0x3a3532,.04));box('iron',sx*3.95,0,12.1,.3,5.0,.3,jc(0x3a3532,.04));}
 box('sheet',0,4.1,24.75,8.3,1.1,.15,jc(0xc99a2e,.06));box('iron',0,3.95,24.75,8.5,.2,.3,jc(0x3a3532,.04));sock('emblem',0,4.65,24.85,0,{w:1.05,h:1.05});
 sock('banner',-3.95,5.0,24.95,0,{w:1.0,h:2.6});sock('banner',3.95,5.0,24.95,0,{w:1.0,h:2.6});
 // E and W gate corridors: sheet flanks
 for(const sx of [-1,1])for(const sz of [-1,1]){W(sx*15.5,0,sz*2.75,0,()=>{box('corr',0,0,0,9.0,3.2,.12,pick([P('galv'),P('rust'),P('paint')]));for(let k=0;k<5;k++)beam('wood',[-4.4+k*2.2,0,0],[-4.4+k*2.2,3.4,0],.08,jc(0x5c4630,.06),true,6);});}
 for(const sx of [-1,1]){W(sx*15.5,0,0,0,()=>{box('plank',0,3.2,0,9,.12,4.4,jc(0x6a5a44,.06));});}
 // ticket booth (container) with hatch, awning, sign
 const bx=9.6,bz=25.4;W(bx,0,bz,0,()=>container({len:CT.L20,doorEnd:false,col:jc(0x3b7f8e,.05)}));
 win(bx-.8,1.1,bz+CT.W/2,1.6,.9,{});door(bx+1.8,.16,bz+CT.W/2,.9,2.0,{step:true});
 sock('awning',bx-.8,2.3,bz+CT.W/2,0,{w:2.4,d:1.2,drop:.35,h:2.3});sock('sign',bx+.2,2.35,bz+CT.W/2+.05,0,{w:2.2,h:.5,trade:'TICKETS'});
 stovepipe(bx+2.2,CT.H,bz-.3,1.2);arQueue(bx);
 // two stalls: lean-to counters with awnings
 for(const [sx,c] of [[-9.6,0x8a3a2c],[-15.4,0x3b7f6e]]){W(sx,0,25.4,0,()=>{box('plank',0,0,0,4.0,.1,2.4,jc(0x6a5a44,.06));wallOpen('plank',0,.1,-1.1,4.0,2.4,.1,[],jc(c,.06));
   for(const px of [-1.9,1.9])beam('wood',[px,0,1.1],[px,2.5,1.1],.07,jc(0x5c4630,.06),true,6);box('plank',0,.1,.95,4.0,.9,.1,jc(0x8a6a3a,.06));box('plank',0,1.0,.95,4.2,.07,.5,jc(0x6a5a44,.06));
   roofP('corr',-2.2,2.2,1.3,2.5,-1.3,2.9,.07,pick([P('galv'),P('paint')]));barrel(1.4,.0,-.5);crate(-1.3,0,-.5,.6,.2);sock('awning',0,2.55,1.35,0,{w:4.0,d:1.0,drop:.4,h:2.3});});}
 sock('sign',-12.5,3.2,24.2,0,{w:2.6,h:.6,trade:'FOOD'});box('wood',-12.5,2.7,24.15,2.7,.5,.08,jc(0x5c4630,.06));
}
function arQueue(bx){for(let k=0;k<4;k++){beam('wood',[bx-2.6+k*1.7,0,27.3],[bx-2.6+k*1.7,1.0,27.3],.05,jc(0x5c4630,.06),true,5);}beam('wood',[bx-2.6,.95,27.3],[bx+.8,.95,27.3],.04,jc(0x5c4630,.06));}
// ---- VIP loge (north): raised deck, a bus, a big sheet canopy, a hoarding with the emblem
function arLoge(){const dy=3.6;box('plank',0,dy-.14,-18.7,13.6,.14,7.6,jc(0x6a5a44,.06));
 for(let i=0;i<=4;i++)for(const z of [-22.3,-15.2]){beam('iron',[-6.4+i*3.2,0,z],[-6.4+i*3.2,dy-.14,z],.06,jc(0x4a4038,.05),true,6);}
 for(let i=0;i<4;i++){beam('iron',[-6.4+i*3.2,0,-15.2],[-6.4+(i+1)*3.2,dy-.7,-15.2],.03,jc(0x5a5048,.05),true,4);beam('iron',[-6.4+i*3.2,dy-.7,-15.2],[-6.4+(i+1)*3.2,0,-15.2],.03,jc(0x5a5048,.05),true,4);}
 W(-.5,dy,-19.9,0,()=>bus({len:10.6,col:0xc99a2e}));
 // stairs at the west end, rail along the front
 stairs(-8.4,0,-15.0,-6.9,dy,-15.0,1.0);arRail(-6.9,-15.05,6.8,-15.05,dy);
 // canopy of sheet on posts, sloping to the pit
 for(const x of [-6.2,-2.1,2.1,6.2])beam('wood',[x,dy,-15.1],[x,dy+3.5,-15.1],.09,jc(0x5c4630,.06),true,6);
 for(const x of [-6.2,-2.1,2.1,6.2])beam('wood',[x,dy,-22.2],[x,dy+4.9,-22.2],.09,jc(0x5c4630,.06),true,6);
 roofP('corr',-7.3,7.3,-14.4,dy+3.5,-22.6,dy+4.9,.08,jc(0xa8402e,.06));roofP('corr',-7.3,7.3,-14.4,dy+3.42,-22.6,dy+4.82,.02,jc(0xd8d0c0,.04));
 for(let k=0;k<8;k++)beam('wood',[-6.8+k*2,dy+3.5,-14.5],[-6.8+k*2,dy+4.9,-22.4],.05,jc(0x5c4630,.06));
 // hoarding with the emblem above the back edge
 box('sheet',0,dy+5.0,-22.5,4.4,3.2,.14,jc(0x6a6a66,.04));for(const x of [-2.1,2.1])beam('wood',[x,dy+4.6,-22.35],[x,dy+8.4,-22.35],.08,jc(0x5c4630,.06),true,6);
 sock('emblem',0,dy+6.6,-22.4+.16,0,{w:2.4,h:2.4});
 sock('banner',-6.2,dy+3.5,-14.95,0,{w:1.2,h:2.6});sock('banner',6.2,dy+3.5,-14.95,0,{w:1.2,h:2.6});
 sock('awning',0,dy+2.2,-14.6,0,{w:4.0,d:1.0,drop:.4,h:1.8});
 // stair to the loge from behind
 stairs(8.5,0,-26.0,8.5,dy,-21.6,1.0);
}
function arRail(x0,z0,x1,z1,y){const L=Math.hypot(x1-x0,z1-z0);const n=Math.max(1,Math.round(L/1.6));for(let k=0;k<=n;k++){const t=k/n;beam('wood',[x0+(x1-x0)*t,y,z0+(z1-z0)*t],[x0+(x1-x0)*t,y+1.0,z0+(z1-z0)*t],.045,jc(0x5c4630,.06),true,5);}beam('wood',[x0,y+1,z0],[x1,y+1,z1],.05,jc(0x5c4630,.06));beam('wood',[x0,y+.5,z0],[x1,y+.5,z1],.035,jc(0x5c4630,.06));}
// ---- masts, the cage, the gantry
function arMast(k){const dk=jc(0x4a4038,.05),lt=jc(0x6a6a66,.05);const h=18.0,w=.65;
 for(const sx of [-1,1])for(const sz of [-1,1]){beam('iron',[sx*w,0,sz*w],[sx*w,h,sz*w],.07,dk,true,6);box('conc',sx*w-.25,0,sz*w-.25,.5,.35,.5,jc(0x8a8880,.05));}
 for(let b=0;b<6;b++){const y0=b*3,y1=y0+3;for(const [a,c] of [[[-w,-w],[w,-w]],[[w,-w],[w,w]],[[w,w],[-w,w]],[[-w,w],[-w,-w]]]){beam('iron',[a[0],y1,a[1]],[c[0],y1,c[1]],.04,lt,true,5);const f=(b%2)?1:-1;beam('iron',[a[0],f>0?y0:y1,a[1]],[c[0],f>0?y1:y0,c[1]],.03,lt,true,4);}}
 box('iron',-.9,h,-.9,1.8,.16,1.8,dk);arPole(0,h,h+1.9,0,.05);
 // arms to the cage rings and the ladder
 for(const [y,rr2] of [[16.1,2.6],[9.25,3.2]]){for(const sx of [-.5,.5])beam('iron',[sx,y,-w],[sx,y,-rr2],.06,dk);beam('iron',[0,y-1.3,-w],[0,y,-rr2+.1],.05,dk);}
 ladder(0,0,w+.08,h-.3,0);
 arSearch(-.45,12.6,w+.35,PI,0);arSearch(.45,12.6,w+.35,PI,0);
 sock('banner',0,14.6,w+.06,0,{w:1.0,h:3.0});sock('flag',0,h+2.0,0,0,{w:1.5,h:.7});}
function arPole(x,y0,y1,z,r){beam('wood',[x,y0,z],[x,y1,z],r,jc(0x4a4038,.05),true,6);}
function arCage(){const T=15.8,Mid=9.0,rT=13.0,rM=12.2;const st=jc(0x4a4038,.05),st2=jc(0x5a5048,.05);const dr=rT-rM,dy=T-Mid;
 const rAt=y=>rM+dr*(y-Mid)/dy;                          // the cone line the ribs and chain-link follow
 // rings with real thickness (0.9 wide, 0.8 tall); nothing else touches their faces
 sector('iron',0,0,rT-.45,rT+.45,0,TAU,T,T+.8,st,56);
 sector('iron',0,0,rM-.45,rM+.45,0,TAU,Mid-.05,Mid+.5,st,56);
 const N=32,y0=Mid+.5,y1=T,tilt=Math.atan2(dr,dy);
 for(let i=0;i<N;i++){const a=i/N*TAU,b=(i+1)/N*TAU;const xa=Math.cos(a),za=Math.sin(a);
  // rib: a 0.14 square section on the cone line, running up into the top ring and down into the mid ring
  beam('iron',[xa*rAt(Mid+.2),Mid+.2,za*rAt(Mid+.2)],[xa*rAt(T+.3),T+.3,za*rAt(T+.3)],.14,st);
  // chain-link panel: tucked .16 inside the rib line so it never shares a plane with a rib, hoop or ring
  const m=(a+b)/2,ym=(y0+y1)/2,rc=rAt(ym)-.16,ch=2*(rc+.02)*Math.sin(PI/N)*.98,hh=Math.hypot(dr*(y1-y0)/dy,y1-y0)-.06;
  arRad(rc,m,ym,()=>{quad('chain',0,0,0,ch,hh,jc(0xb4b8b8,.05),0,tilt,0);});}
 // hoop halfway up: sits OUTSIDE the ribs' outer face, not through the panels
 const ym=(Mid+T)/2;sector('iron',0,0,rAt(ym)+.09,rAt(ym)+.21,0,TAU,ym,ym+.16,st2,56);
 // chains hung under the mid ring (they start inside the ring)
 for(let i=0;i<40;i++){const a=i/40*TAU+.08,len=rr(1.5,5.5);const x=Math.cos(a)*(rM-.1),z=Math.sin(a)*(rM-.1);beam('iron',[x,Mid+.05,z],[x,Mid-len,z],.022,jc(0x6a6a66,.05),true,3);
  if(i%2===0){for(let q=0;q<len/.6;q++)sph('iron',x,Mid-.3-q*.6,z,.05,jc(0x7a7a76,.05),1.7);}sph('iron',x,Mid-len,z,.09,jc(0x3a3430,.05));}
 // heavy swag chains hung from the outside of the top ring
 for(let i=0;i<16;i++){const a=i/16*TAU,b=a+TAU/16,ro=rT+.6;const p=[Math.cos(a)*ro,T+.35,Math.sin(a)*ro],q=[Math.cos(b)*ro,T+.35,Math.sin(b)*ro];const m=[(p[0]+q[0])/2,T-.7,(p[2]+q[2])/2];beam('iron',p,m,.03,jc(0x6a6a66,.05),true,4);beam('iron',m,q,.03,jc(0x6a6a66,.05),true,4);}}
function arGantry(){const dk=jc(0x4a4038,.05);const A=[-10.96,-10.96],B=[10.96,10.96];// runs SW..NE over the pit
 const dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx);
 W((A[0]+B[0])/2,0,(A[1]+B[1])/2,ry,()=>{const y0=17.0,y1=17.9;
  beam('iron',[-L/2,y1,0],[L/2,y1,0],.11,dk);beam('iron',[-L/2,y0,0],[L/2,y0,0],.11,dk);const n=Math.round(L/1.6);
  for(let i=0;i<=n;i++){const x=-L/2+i*L/n;beam('iron',[x,y0,0],[x,y1,0],.05,dk,true,4);if(i<n){const x2=x+L/n;beam('iron',[x,(i%2)?y1:y0,0],[x2,(i%2)?y0:y1,0],.05,dk,true,4);}}
  // trolley + winch with a spinning drum, hanging chains and hooks
  box('iron',-.9,y0-.75,-.55,1.8,.75,1.1,jc(0x8a3a2c,.06));box('iron',-.7,y0-.05,-.6,1.4,.08,1.2,dk);
  spin(0,y0-.45,.68,0,'z',.5,()=>{cylH('iron',0,0,0,.34,.5,jc(0x8a8a86,.05),'z',10);for(let q=0;q<4;q++){const a=q*PI/4;beam('iron',[Math.cos(a)*.55,Math.sin(a)*.55,0],[-Math.cos(a)*.55,-Math.sin(a)*.55,0],.04,jc(0x3a3430,.05));}});
  for(const [x,len] of [[-.5,9.3],[.2,10.0],[.7,6.5]]){beam('iron',[x,y0-.75,0],[x,y0-.75-len,0],.03,jc(0x6a6a66,.05),true,3);for(let q=0;q<len/.55;q++)sph('iron',x,y0-.9-q*.55,0,.055,jc(0x7a7a76,.05),1.6);
   beam('iron',[x,y0-.75-len,0],[x+.2,y0-.75-len-.3,0],.05,jc(0x3a3430,.05),true,4);}
  // cross-wires to the rings: two sagging ropes to each mast end
  for(const sx of [-1,1])beam('wood',[sx*L/2,y1-.1,0],[sx*L/2*.55,y0-.3,.0],.02,jc(0x7a6a52,.06),true,3);});}
// ---- the ring of light poles and flag poles
function arPoles(){for(let k=0;k<10;k++){const a=(9+36*k)*PI/180;const x=Math.cos(a)*26.4,z=Math.sin(a)*26.4;const light=k%2===0;
  box('conc',x-.3,0,z-.3,.6,.4,.6,jc(0x8a8880,.05));const h=light?12.5:16;cyl('iron',x,.3,z,.2,h,jc(0x4a4038,.05),8,.08);
  if(light){for(let q=0;q<3;q++){const ao=a+PI+(q-1)*.35;arSearch(x+Math.cos(a)*-.2,h+.3-q*.05,z+Math.sin(a)*-.2,PI/2-ao+PI*0,0);}beam('iron',[x,h+.3,z],[x,h+.9,z],.05,jc(0x4a4038,.05),true,5);sock('flag',x,h+1.0,z,0,{w:1.2,h:.6});}
  else{sock('flag',x,h+.4,z,0,{w:1.8,h:.9});}
  const bx=Math.cos(a),bz=Math.sin(a);}}
function arBuild(o){arPit();arStands();arEntry();arLoge();arCage();
 for(let k=0;k<4;k++){arRad(15.5,PI/4+k*PI/2,0,()=>arMast(k));}
 arGantry();arPoles();
 // yard junk in the plaza corners
 junkPile(-22,20,2,8);junkPile(22,-19,2,8);tireStack(16,22,3);barrel(-18,0,24);barrel(-18.6,0,23.6);crate(20,0,21,.7,.3);}
