// prefix: in
// ---------------------------------------------------------------- industry and power: smithy, wind generator, fuel generator, warehouse (48 industry, seeds 4800-4899)
const inW=0x5c4630;
function inPost(x,z,h,r){beam('wood',[x,0,z],[x,h,z],r||.11,jc(inW,.06),true,6);}
// lattice tower leg frame: base half-width s0 at y=0 tapering to s1 at H, `n` bays, in the current frame centred on (0,0)
function inLattice(H,s0,s1,n,col,r){col=col||jc(0x8a8a86,.05);const sq=[[-1,-1],[1,-1],[1,1],[-1,1]];
 const S=y=>s0+(s1-s0)*y/H;
 for(const [a,b] of sq)beam('iron',[a*s0,0,b*s0],[a*s1,H,b*s1],r||.09,col,true,6);
 for(let i=0;i<=n;i++){const y=H*i/n,s=S(y);for(let k=0;k<4;k++){const a=sq[k],b=sq[(k+1)%4];if(i>0)beam('iron',[a[0]*s,y,a[1]*s],[b[0]*s,y,b[1]*s],.05,col,true,5);
   if(i<n){const y2=H*(i+1)/n,s2=S(y2);const flip=(i+k)%2;beam('iron',[a[0]*(flip?s2:s),flip?y2:y,a[1]*(flip?s2:s)],[b[0]*(flip?s:s2),flip?y:y2,b[1]*(flip?s:s2)],.04,col,true,4);}}}}
// ground anchor: a concrete block with a ring bolt; and a guy cable from (x0,y0,z0) to it
function inAnchor(ax,az){box('conc',ax-.35,0,az-.35,.7,.3,.7,jc(0x9a9488,.06));tire(ax,.3,az,.16,.03,jc(0x4a4038,.05),0,PI/2,0);}
function inGuy(a,b,sag){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2-(sag||.12),(a[2]+b[2])/2];beam('iron',a,m,.025,jc(0x3a3632,.04),true,3);beam('iron',m,b,.025,jc(0x3a3632,.04),true,3);}
// stencilled digit (7-segment, boxes) centred at (x,y..y+h,z) on a wall facing +z (ry turns it)
function inDigit(x,y,z,d,h,col,ry){const seg={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'}[d]||'abcdefg';const w=h*.55,t=h*.14;const c=jc(col,.03);
 W(x,y,z,ry||0,()=>{const B=(sx,sy,sw,sh)=>box('plain',sx,sy,0,sw,sh,.03,c);
  if(seg.includes('a'))B(0,h-t,w,t);if(seg.includes('g'))B(0,h/2-t/2,w,t);if(seg.includes('d'))B(0,0,w,t);
  if(seg.includes('b'))B(w/2-t/2,h/2,t,h/2);if(seg.includes('c'))B(w/2-t/2,0,t,h/2);if(seg.includes('f'))B(-w/2+t/2,h/2,t,h/2);if(seg.includes('e'))B(-w/2+t/2,0,t,h/2);});}
// ---------------------------------------------------------------- 4810 scrap smithy
defBuilding({key:'smithy',name:'Scrap smithy',seed:4810,tags:{type:['industry'],size:'medium',core:'timber and sheet shed',materials:['sheet metal','tyres','earth','engine block','timber']},w:14,d:12,h:9.5,build:inSmithy});
function inSmithy(o){
 const X0=-5,X1=5,ZB=-4.5,ZF=3.6,EY=3.4,RY=4.9,ZR=-.5;
 // floor of trodden ash, back and left walls of patched sheet, posts
 box('conc',(X0+X1)/2,0,(ZB+ZF)/2,X1-X0,.06,ZF-ZB,jc(0x5a5048,.06));
 for(let k=0;k<5;k++)sheetWall(X0+1+k*2,0,ZB,2.0,3.5,0,{col:pick([0x8a8478,0x8a4a3a,0x3b7f8e,0x7a7a70,0xa8642a])});
 for(let k=0;k<4;k++)sheetWall(X0,0,ZB+1+k*2,2.0,3.3,PI/2,{col:pick([0x8a8478,0x8a4a3a,0x7a7a70,0xa8642a])});
 for(const x of [X0,-1.7,1.7,X1])inPost(x,ZF,EY+.05,.13);for(const z of [ZB,-.5])inPost(X1,z,z===ZB?EY+.1:RY,.13);inPost(X0,ZR,RY,.13);
 // roof: two slopes in bays of different sheet
 const bays=[[-5.7,-2.8],[-2.8,.4],[.4,3.2],[3.2,5.7]];const cols=[0x8a8478,0xa8642a,0x6a7a78,0x8a4a3a];
 bays.forEach((b,i)=>{roofP('corr',b[0],b[1],ZF+.7,EY-.1,ZR,RY,.07,jc(cols[i],.06));roofP('corr',b[0],b[1],ZB-.6,EY+.1,ZR,RY,.07,jc(cols[(i+2)%4],.06));});
 box('iron',0,RY-.04,ZR,12.2,.12,.18,jc(0x4a4038,.05));
 for(const x of [X0,-1.7,1.7,X1]){beam('wood',[x,EY,ZF],[x,RY,ZR],.1,jc(inW,.06));beam('wood',[x,EY+.05,ZB],[x,RY,ZR],.1,jc(inW,.06));}
 beam('wood',[X0,EY,ZF],[X1,EY,ZF],.13,jc(inW,.06));entry(0,0,ZF,3.4,EY);/* front door: the open bay between the middle posts */
 // the shed is a smithy room the interior set plans (kits/interiors/sets/post-apoc.js): its forge with the flue through the roof,
 // bellows, tool rack, anvil and quench trough are the interiors' (?interiors=1). The skips are what their drawing drew.
 {const L=2.8,d=TYR.R*2*.98;let n=2;for(let c=0;c<4;c++)for(let x=-L/2+d/2+(c%2)*d/2;x<=L/2-d/2+1e-6;x+=d)n+=3;rngSkip(n);}   // the forge's tyre course
 rngSkip(42);                                        // the hearth, its glow, hood, flue and stays
 rngSkip(14);shHangSkip(8,'tools');rngSkip(14);      // bellows, the rack of tongs and hammers
 rngSkip(63+8);                                      // the anvil with its hot work and sparks, the quench trough
 // sorted scrap: bins at the left outside: sheets, pipes, tyres, gears and wheels, springs
 const bz0=-3.3;const pens=[[bz0,'sheet'],[bz0+2.3,'pipe'],[bz0+4.6,'tyre'],[bz0+6.9,'gear']];
 for(const [z,k] of pens){const x=-6.2;rngSkip(6);   // the catalog's scrap bins (back to the -x, open toward the smithy); the tyres are a tyre stack
  if(k==='sheet'){rngSkip(8*13);FURNISH('pa_scrap_bin',x,0,z,PI/2,{v:0});}
  if(k==='pipe'){rngSkip(7*3);FURNISH('pa_scrap_bin',x,0,z,PI/2,{v:1});}
  if(k==='tyre')tireStack(x,z,4);
  if(k==='gear'){rngSkip(6*7);FURNISH('pa_scrap_bin',x,0,z,PI/2,{v:2});}}
 // small crane arm with chain hoist at the front right: pipe mast, jib, brace, chain and hook over a cart with an engine block
 const kx=5.7,kz=5.0;cyl('conc',kx,0,kz,.45,.25,jc(0x8a8478,.06),8);cyl('iron',kx,.25,kz,.14,4.6,jc(0x4a4038,.05),10);beam('iron',[kx,4.6,kz],[kx-3.6,4.5,kz],.18,jc(0x5a4a3c,.05));
 beam('iron',[kx,2.9,kz],[kx-2.3,4.45,kz],.09,jc(0x4a4038,.05));box('iron',kx-2.5,4.15,kz-.12,.5,.35,.24,jc(0xa8642a,.06));
 for(let k=0;k<8;k++)box('iron',kx-2.5,3.9-k*.2,kz-.05+(k%2)*.03,.06,.14,.1,jc(0x5a5a56,.05),0,(k%2)*1.5);cone('iron',kx-2.5,2.35,kz,.09,.3,jc(0x3a3430,.05),5);
  rngSkip(6);FURNISH('pa_hand_cart',kx-2.5,0,kz,0,{v:1,ax:.1,az:-.175});   // the trolley with an engine block under the hoist
 // yard clutter: charcoal sacks, coal heap, barrels, lamp
 rngSkip(10);FURNISH('pa_sacks',-4.15,0,4.95,0,{v:2});/* charcoal sacks */barrel(-3.4,0,5.0);barrel(-2.9,0,5.2);lamp(3.6,0,4.6,3.4);
 // SOCKETS
 beam('wood',[-1.4,EY-.08,ZF+.1],[1.4,EY-.08,ZF+.1],.12,jc(inW,.06));sock('awning',0,EY-.1,ZF+.15,0,{w:4.6,d:1.9,drop:.5,h:2.8});
 beam('wood',[-6.5,0,5.2],[-6.5,5.6,5.2],.09,jc(inW,.06),true,6);sock('banner',-6.5,5.6,5.25,0,{w:.9,h:2.2});
 sock('emblem',X0-.08,2.9,-1.0,-PI/2,{w:.9,h:.9});sock('flag',4.3,RY+1.6,ZR,0,{w:1.1,h:.6});sock('paint',X0-.08,1.5,ZB+5.0,-PI/2,{w:1.5,h:1.0});}
// ---------------------------------------------------------------- 4820 wind generator
defBuilding({key:'gen-wind',name:'Wind generator',seed:4820,tags:{type:['infrastructure'],size:'large',core:'lattice tower',materials:['steel lattice','scrap sheet','drum','container','cable']},w:14,d:14,h:24.5,build:inWind});
function inWind(o){
 const tz=-1.0,H=o.v===1?13:19.2;
 W(0,0,tz,0,()=>{
  box('conc',0,0,0,3.8,.5,3.8,jc(0x9a9488,.06));inLattice(H,1.3,o.v===1?.4:.5,o.v===1?6:8,jc(o.v===1?0x8a4a3a:0x8a8a86,.05),.1);
  // platform + yaw bearing, ladder to the first landing, a cable from the nacelle down the leg
  box('iron',0,H,0,1.2,.12,1.2,jc(0x4a4038,.05));cyl('iron',0,H+.12,0,.35,.25,jc(0x3a3430,.05),10);ladder(0,0,1.32,5,0);
  beam('plain',[.3,H,.3],[1.28,.5,1.28],.04,jc(0x1a1816,.03),true,4);
  if(o.v!==1){
   const ny=H+.95;cylH('sheet',0,ny,.2,.6,2.3,jc(0x8a4a3a,.06),'z',14,true);sph('sheet',0,ny,1.35,.6,jc(0x3b7f8e,.06));for(const s of [-1,1])beam('iron',[s*.45,ny-.5,-.8],[s*.45,ny-.9,.9],.06,jc(0x4a4038,.05));
   beam('iron',[0,ny,-.8],[0,ny+.1,-3.7],.09,jc(0x5a4a3c,.05));box('sheet',-.02,ny-.1,-3.7,.05,1.3,1.5,jc(0xa8642a,.06));
   spin(0,ny,1.85,0,'z',1.3,()=>{cyl('iron',0,0,-.05,.3,.1,jc(0x3a3430,.05),10);sph('iron',0,0,.12,.28,jc(0x8a8a86,.05));
    const bc=[0xc45a30,0x3b7f8e,0xd8a02a];for(let k=0;k<3;k++){const a=k*TAU/3+.4,dx=-Math.sin(a),dy=Math.cos(a),px=Math.cos(a),py=Math.sin(a);
     const q=(r,w,z)=>[dx*r+px*w,dy*r+py*w,z];beam('iron',[dx*.3,dy*.3,.02],[dx*4.5,dy*4.5,.05],.09,jc(0x4a4038,.05));
     poly('sheet',[q(.4,.3,0),q(.4,-.32,0),q(2.6,-.5,.12),q(2.6,.15,.12)],jc(bc[k],.05),true);poly('sheet',[q(2.6,.15,.12),q(2.6,-.5,.12),q(4.6,-.22,.04),q(4.6,.12,.04)],jc(bc[(k+1)%3],.05),true);}});
  }else{
   const wy=H+1.5;box('iron',0,H+.12,-.4,.5,1.2,.9,jc(0x3a3430,.05));beam('iron',[0,wy,-.3],[0,wy,-4.0],.09,jc(0x5a4a3c,.05));box('sheet',-.02,wy-.4,-4.0,.05,1.5,1.8,jc(0xc9a03a,.06));
   spin(0,wy,.5,0,'z',.9,()=>{cyl('iron',0,0,-.1,.28,.3,jc(0x3a3430,.05),8);cylH('iron',0,0,0,.28,.3,jc(0x3a3430,.05),'z',8);
    for(let k=0;k<18;k++){const a=k*TAU/18,dx=-Math.sin(a),dy=Math.cos(a),px=Math.cos(a),py=Math.sin(a);const q=(r,w,z)=>[dx*r+px*w,dy*r+py*w,z];
     poly('sheet',[q(1.0,.17,0),q(1.0,-.17,.08),q(2.5,-.22,.14),q(2.5,.16,.06)],jc(pick([0xa8a49a,0x9a9488,0xa8642a,0x7a7a70]),.06),true);}
    for(const R of [1.05,2.5])for(let k=0;k<18;k++){const a=k*TAU/18,b=(k+1)*TAU/18;beam('iron',[Math.cos(a)*R,Math.sin(a)*R,.05],[Math.cos(b)*R,Math.sin(b)*R,.05],.05,jc(0x4a4038,.05),true,4);}
    for(let k=0;k<6;k++){const a=k*TAU/6;beam('iron',[0,0,.02],[Math.cos(a)*2.5,Math.sin(a)*2.5,.05],.035,jc(0x4a4038,.05),true,4);}});
   beam('iron',[0,H-.2,0],[0,.6,0],.05,jc(0x6a6a66,.05),true,4);
  }
  // guy cables: from the tower legs to concrete ground anchors, plus tension turnbuckles
  for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const ax=a*5.6,az=b*5.6-(b>0?.5:.0);for(const yy of [H*.55,H*.85]){const s=1.3+(.5-1.3)*yy/H;const t=(yy/H);inGuy([a*s,yy,b*s],[ax*(1-t*.55)*.0+ax,.3,az+0],.2);}
   inAnchor(ax,az);}
 });
 // control shed: a short container at the foot, with battery rack, cables and a door; solar panel on the roof
 const sx=0,sz=3.9;W(sx,0,sz,0,()=>container({len:CT.L20,col:[0x3b7f8e,0xb8502e,0x4d6f3c][(o.v|0)%3]}));const fz=sz+CT.W/2;
 door(-1.2,.16,fz,1.0,2.0);win(1.1,1.2,fz,.9,.6,{lit:true,bars:true});for(let k=0;k<3;k++)box('iron',.5+k*.3,2.0,fz+.03,.15,.3,.04,jc(0x2a2826,.03));
 solar(1.0,CT.H+.02,sz,2.4,1.4,0,.5);
 rngSkip(62);FURNISH('pa_battery_bank',3.9,0,sz,PI/2);   // the battery bank by the shed's end wall
 pipe('iron',[[3.5,.8,sz-.4],[3.0,.7,sz-.3],[CT.L20/2+.02,.6,sz-.2]],.05,jc(0x1a1816,.03));pipe('iron',[[1.3,.05,-1.0-.4+2.6],[1.3,.05,sz-CT.W/2]],.05,jc(0x1a1816,.03));
 // fence: chain-link round the tower foot and shed with a gate gap, barrels, lamp
 fenceRun(-4.6,-4.2,4.6,-4.2,1.8,{barbed:true});fenceRun(4.6,-4.2,4.6,6.0,1.8,{barbed:true});fenceRun(-4.6,-4.2,-4.6,6.0,1.8,{barbed:true});
 fenceRun(-4.6,6.0,-.6,6.0,1.8,{barbed:true});fenceRun(1.6,6.0,4.6,6.0,1.8,{barbed:true});lamp(-4.0,0,5.4,3.2);barrel(-3.8,0,3.0);barrel(-3.8,0,3.6);
 // SOCKETS
 sock('awning',-1.2,2.7,fz,0,{w:1.9,d:1.2,drop:.45,h:2.25});
 beam('wood',[4.6,0,6.0],[4.6,4.8,6.0],.09,jc(inW,.06),true,6);sock('banner',4.6,4.8,6.05,0,{w:.8,h:2.0});
 sock('flag',-2.4,CT.H+1.6,sz,0,{w:1.0,h:.6});sock('emblem',CT.L20/2+.03,2.25,sz,PI/2,{w:.9,h:.9});sock('paint',-2.0,1.9,fz+.02,0,{w:1.3,h:.9});}
// ---------------------------------------------------------------- 4830 fuel generator
defBuilding({key:'gen-fuel',name:'Fuel generator',seed:4830,tags:{type:['infrastructure'],size:'medium',core:'shipping container',materials:['container','steel drums','tank','chain-link','cable']},w:14,d:12,h:8.4,build:inFuel});
function inFuel(o){
 const cx=-2.8,cz=-2.6,L=CT.L20,fz=cz+CT.W/2;
 W(cx,0,cz,0,()=>container({len:L,col:[0x8a3a2c,0x3b6f7e,0xc9852a][(o.v|0)%3],doorEnd:false}));
 // front: two louvred radiator vents, a door, a conduit; roof: muffler box and the big exhaust stack, a second small stack
 for(const vx of [-4.5,-3.3]){box('iron',vx,.6,fz+.02,1.0,1.4,.06,jc(0x2a2826,.04));for(let k=0;k<9;k++)box('iron',vx,.7+k*.14,fz+.06,.92,.05,.06,jc(0x6a6a66,.05),0,-.3);}
 door(cx+1.4,.16,fz,1.0,2.0);
 pipe('iron',[[cx-.4,.16,fz+.05],[cx-.4,2.4,fz+.05],[cx+.6,2.5,fz+.05]],.05,jc(0x1a1816,.03));
 const stx=cx-2.0;box('iron',stx-.5,CT.H,cz-.5,1.0,.7,1.0,jc(0x3a3430,.05));cyl('iron',stx,CT.H+.7,cz,.3,4.6,jc(0x4a4038,.05),10);for(let k=0;k<4;k++)cyl('iron',stx,CT.H+1.2+k*1.1,cz,.34,.1,jc(0x2a2624,.05),10);
 cyl('iron',stx,CT.H+5.3,cz,.34,.08,jc(0x2a2624,.05),10);cone('iron',stx,CT.H+5.4,cz,.5,.35,jc(0x4a4038,.05),10);for(const s of [-1,1])inGuy([stx,CT.H+4.2,cz],[stx+s*1.6,CT.H,cz+.9],.03);
 stovepipe(cx+.8,CT.H,cz+.3,1.6);
 // cooling fan in the end wall (+x): a static guard ring and a spinning fan
 W(cx+L/2+.02,1.4,cz,PI/2,()=>{tire(0,0,.03,.82,.07,jc(0x3a3430,.05),0,PI/2,0);box('iron',0,-.9,.0,1.8,1.8,.04,jc(0x2a2826,.04));
  cylH('iron',0,0,.06,.86,.05,jc(0x1a1816,.03),'z',16);for(const a of [0,PI/2])beam('iron',[Math.cos(a)*.8,Math.sin(a)*.8,.12],[-Math.cos(a)*.8,-Math.sin(a)*.8,.12],.04,jc(0x8a8a86,.05));});
 spin(cx+L/2+.15,1.4,cz,PI/2,'z',6,()=>{cylH('iron',0,0,0,.1,.08,jc(0xc9a03a,.05),'z',8);for(let k=0;k<5;k++){const a=k*TAU/5;const dx=Math.cos(a),dy=Math.sin(a);poly('sheet',[[dx*.1-dy*.1,dy*.1+dx*.1,0],[dx*.1+dy*.1,dy*.1-dx*.1,0],[dx*.65+dy*.14,dy*.65-dx*.14,.06],[dx*.65-dy*.14,dy*.65+dx*.14,.06]],jc(0xc9a03a,.05),true);}});
 // power pole with cross-arm, three sagging cables to the house
 const ppx=cx+L/2+1.2;beam('wood',[ppx,0,cz+.5],[ppx,5.2,cz+.5],.16,jc(0x5c4630,.06),true,7);box('wood',ppx-.8,4.8,cz+.4,1.6,.1,.1,jc(0x5c4630,.06));
 for(let k=-1;k<=1;k++){const bx=ppx+k*.7;sph('glow',bx,4.95,cz+.45,.06,jc(0xd8e0d8,.03));pipe('iron',[[bx,4.95,cz+.45],[cx+L/2-.3+k*.3,3.8,cz+k*.4],[cx+L/2-.6+k*.5,CT.H,cz+k*.4]],.02,jc(0x1a1816,.03),4);}
 // fuel tank on stilts: horizontal tank on a steel frame, ladder, filler, gauge, hose to a pump at the foot
 const tx=3.7,tz=1.4,ty=2.7,tr=.95,tl=3.6;
 for(const a of [-1,1])for(const b of [-1,1]){beam('iron',[tx+a*1.3,0,tz+b*.8],[tx+a*1.2,ty-.2,tz+b*.7],.11,jc(0x5a5a56,.05),true,6);}
 for(const a of [-1,1]){beam('iron',[tx+a*1.3,.9,tz-.8],[tx+a*1.2,ty-.6,tz+.7],.05,jc(0x5a5a56,.05),true,4);beam('iron',[tx+a*1.3,.9,tz+.8],[tx+a*1.2,ty-.6,tz-.7],.05,jc(0x5a5a56,.05),true,4);}
 for(const a of [-1,1])box('iron',tx+a*1.25-.06,ty-.3,tz-.9,.12,.12,1.8,jc(0x4a4038,.05));
 const tk=jc([0x9a3a2c,0xd8d0b8,0x3a5a7a][(o.v|0)%3],.05);cylH('sheet',tx,ty+tr,tz,tr,tl-tr*.6,tk,'x',18,true);for(const s of [-1,1])sph('sheet',tx+s*(tl/2-tr*.3),ty+tr,tz,tr,tk,1);
 for(const f of [-.3,.3])cylH('iron',tx+f*tl,ty+tr,tz,tr+.03,.1,jc(0x3a3430,.05),'x',18);cyl('iron',tx,ty+tr*2,tz,.28,.25,jc(0x3a3430,.05),10);box('iron',tx+.8,ty+tr*2,tz-.2,.4,.2,.4,jc(0xc9a03a,.06));
 cyl('glass',tx+1.7,ty+.4,tz+.95,.06,1.0,jc(0xd8e0c0,.05),6);ladder(tx-1.7,0,tz+.9,ty+1.2,0);
 const px=tx-.3,pz=tz+2.0;box('iron',px-.3,0,pz-.25,.6,1.5,.5,jc(0xc23a2a,.06));box('glass',px-.2,1.0,pz+.26,.4,.3,.03,jc(0xd8e0c0,.05));box('iron',px-.35,1.5,pz-.3,.7,.1,.6,jc(0x3a3430,.05));
 pipe('iron',[[tx+.5,ty,tz+.95],[px+.4,ty-.8,tz+1.4],[px+.3,1.3,pz]],.06,jc(0x3a3430,.05));pipe('iron',[[px+.3,1.2,pz+.2],[px+.8,.5,pz+.6],[px+1.1,.9,pz+.5]],.04,jc(0x1a1816,.03),6);
 // bund wall round the tank foot
 const bd=jc(0x9a9488,.05);box('conc',tx,0,tz-1.5,4.8,.4,.25,bd);box('conc',tx,0,tz+3.0,4.8,.4,.25,bd);box('conc',tx-2.4,0,tz+.75,.25,.4,4.5,bd);box('conc',tx+2.4,0,tz+.75,.25,.4,4.5,bd);
 // drum store: stacked drums on pallets, three high, left front
 for(let r=0;r<2;r++){const z=2.4+r*1.5;rngSkip(102);FURNISH('pa_drum_store',-5.0,0,z,0);}
 barrel(-5.4,1.88,3.7);barrel(-4.8,1.88,3.7);   // two more on the back store's top row (the kit stood them over the gap)
 // chain-link yard fence with a gate gap, lamp, tarp
 fenceRun(-6.6,-5.2,6.6,-5.2,1.8,{barbed:true});fenceRun(6.6,-5.2,6.6,5.2,1.8,{barbed:true});fenceRun(-6.6,-5.2,-6.6,5.2,1.8,{barbed:true});
 fenceRun(-6.6,5.2,-1.0,5.2,1.8,{barbed:true});fenceRun(1.4,5.2,6.6,5.2,1.8,{barbed:true});lamp(-.2,0,4.4,3.6);
 // SOCKETS
 sock('awning',cx+1.4,2.72,fz,0,{w:1.9,d:1.3,drop:.45,h:2.27});
 beam('wood',[1.4,0,5.2],[1.4,5.0,5.2],.09,jc(inW,.06),true,6);sock('banner',1.4,5.0,5.25,0,{w:.8,h:2.0});
 sock('flag',cx+2.6,CT.H+1.6,cz-.5,0,{w:1.0,h:.6});sock('emblem',cx-.6,2.4,fz+.02,0,{w:.85,h:.85});sock('paint',cx-L/2-.03,1.4,cz,-PI/2,{w:1.6,h:1.1});}
// ---------------------------------------------------------------- 4840 warehouse
defBuilding({key:'warehouse',name:'Warehouse',seed:4840,tags:{type:['industry'],size:'large',core:'corrugated hangar',materials:['corrugated sheet','steel trusses','containers','pallets']},w:26,d:18,h:9.7,build:inWarehouse});
function inWarehouse(o){
 const X0=-11.5,X1=10.5,ZB=-8.5,ZF=2.6,DK=1.15,WH=5.4,RY=8.0,ZR=(ZB+ZF)/2;const cw=[0xd0ccc0,0xd8a02a,0x4a9a98,0xc4502e,0xb8a888,0x5a8acb];
 // foundation and raised dock floor
 box('conc',(X0+X1)/2,0,(ZB+ZF)/2,X1-X0,DK,ZF-ZB,jc(0x8a8478,.05));
 // back and side walls: patchwork panels of corrugated sheet
 for(let k=0;k<11;k++)sheetWall(X0+1+k*2,DK,ZB,2.0,WH-DK,0,{col:cw[(k*5+1)%6],th:.1});
 for(let k=0;k<5;k++){sheetWall(X0,DK,ZB+1.15+k*2.3,2.3,WH-DK,PI/2,{col:cw[(k*3)%6],th:.1});sheetWall(X1,DK,ZB+1.15+k*2.3,2.3,WH-DK,-PI/2,{col:cw[(k*3+2)%6],th:.1});}
 // front wall with three roll-up door openings, doors half raised, a door drum at the head, steel posts between
 const dxs=[-7,-1.5,4.0],dw=3.6;const ops=dxs.map(x=>({x0:x-dw/2,x1:x+dw/2,y0:DK,y1:DK+3.5}));
 wallOpen('corr',(X0+X1)/2,DK,ZF,X1-X0,WH-DK,.1,ops,jc(0xd0ccc0,.04),0);
 for(const x of dxs){const raise=[.8,.4,1.6][dxs.indexOf(x)];box('corr',x,DK,ZF+.02,dw-.1,3.5-raise,.05,jc(pick([0xc4502e,0x2f8f8a,0xb0aca0]),.05));cylH('iron',x,DK+3.5-.05,ZF+.14,.2,dw,jc(0x4a4038,.05),'x',10);
  for(const s of [-1,1])box('iron',x+s*(dw/2+.06),DK,ZF+.05,.14,3.7,.14,jc(0x3a3430,.05));box('iron',x,DK+3.55,ZF+.08,dw+.3,.14,.14,jc(0x3a3430,.05));}
 for(let k=0;k<9;k++)box('iron',X0+k*(X1-X0)/8-.07,DK,ZF+.05,.14,WH-DK,.14,jc(0x4a4038,.05));entry(dxs[1],DK,ZF+.1,dw,3.5);/* front door: the middle roll-up opening, on the dock */
 // gable roof of mixed sheet on trusses; gable end walls with truss and a vent
 const segs=[[X0-.5,X0+5.5],[X0+5.5,X0+10.5],[X0+10.5,X0+16.5],[X0+16.5,X1+.5]];
 segs.forEach((b,i)=>{roofP('corr',b[0],b[1],ZF+.8,WH-.1,ZR,RY,.08,jc(cw[(i*2+1)%6],.06));roofP('corr',b[0],b[1],ZB-.8,WH-.1,ZR,RY,.08,jc(cw[(i*2+4)%6],.06));});
 box('iron',(X0+X1)/2,RY-.05,ZR,X1-X0+1.4,.16,.24,jc(0x4a4038,.05));
 for(const gx of [X0,X1]){poly('corr',[[gx,WH,ZB],[gx,WH,ZF],[gx,RY,ZR]],jc(gx<0?0x8a8478:0x8a4a3a,.05),true);}
 for(let k=0;k<6;k++){const x=X0+.05+k*(X1-X0-.1)/5;beam('iron',[x,WH,ZF],[x,RY,ZR],.13,jc(0x4a4038,.05));beam('iron',[x,WH,ZB],[x,RY,ZR],.13,jc(0x4a4038,.05));beam('iron',[x,WH-.05,ZF],[x,WH-.05,ZB],.1,jc(0x4a4038,.05));
  if(k>0&&k<5){beam('iron',[x,WH,ZF],[x,WH+(RY-WH)*.5,ZR+(ZF-ZR)*.5],.05,jc(0x4a4038,.05),true,4);}}
 // dock: deck of plank, tyre bumpers on the edge, steps, ramp down at the left
 const dx0=-10,dx1=4.6,dz=3.4;box('plank',(dx0+dx1)/2,DK-.1,ZF+dz/2,dx1-dx0,.1,dz,jc(0x7a6448,.07));box('conc',(dx0+dx1)/2,0,ZF+dz/2,dx1-dx0,DK-.1,dz,jc(0x9a9488,.06));
 for(let k=0;k<7;k++)tire(dx0+1.0+k*2.2,.8,ZF+dz+.05,.36,.12,undefined,0,PI/2,0);
 W(dx0,0,ZF+1.1,0,()=>{plane4("plank",[0,DK-.05,0],[0,DK-.05,2.3],[-3.6,0,0],[-3.6,0,2.3],.1,jc(0x7a6448,.07));for(const z of [0,2.3])beam("wood",[0,DK,z],[-3.6,0,z],.08,jc(inW,.06));});
 // jib crane at the dock end
 // overhead portal gantry crane over the loading yard: four splayed legs, two runway girders, a bridge with a trolley and winch, hook block and a slung crate
 const jz=ZF+2.9,gy=jc(0x7c8a98,.05),gd=jc(0x606870,.05),gxL=7.0,gxR=12.6,gz0=3.9,gz1=8.3,gt=6.2,gb=9.8,gtz=5.6;   /* the gantry stands clear of the dock awnings (the last one ends at x = 6.1) */
 for(const gx of [gxL,gxR]){for(const [z,sg] of [[gz0,-1],[gz1,1]]){beam('steel',[gx,0,z+sg*.45],[gx,gt,z],.24,gd);cyl('conc',gx,0,z+sg*.45,.4,.18,jc(0x8a8478,.06),8);
   beam('steel',[gx,gt-1.6,z+sg*.1],[gx,gt,z-sg*.9],.1,gd,true,5);}
  box('steel',gx,gt,(gz0+gz1)/2,.4,.35,gz1-gz0+.6,gy);box('steel',gx,2.2,(gz0+gz1)/2,.12,.12,gz1-gz0,gd);}
 box('steel',(gxL+gxR)/2,gt+.35,gz0,gxR-gxL+1.4,.4,.5,gy);box('steel',(gxL+gxR)/2,gt+.35,gz1,gxR-gxL+1.4,.4,.5,gy);        /* runway girders */
 box('steel',gb,gt+.75,(gz0+gz1)/2,.6,.5,gz1-gz0+.5,gy);                                                                  // bridge girder
 for(const z of [gz0,gz1])box('steel',gb,gt+.75,z,1.0,.5,.7,gd);
 box('sheet',gb-.5,gt+1.25,gtz-.5,1.0,.55,1.1,jc(0x8a4a2a,.06));cylH('steel',gb,gt+1.55,gtz+.1,.22,.9,gd,'x',10);box('glass',gb-.3,gt+1.6,gtz+.06,.6,.3,.03,jc(0x6a9a94,.05));
 for(const sx of [-.14,.14])beam('steel',[gb+sx,gt+1.4,gtz],[gb+sx,3.9,gtz],.06,jc(0x2a2826,.03),true,4);
 box('steel',gb-.25,3.6,gtz-.2,.5,.4,.4,gy);cone('iron',gb,3.35,gtz,.1,.25,jc(0x2a2826,.03),6);
 for(const [a,b] of [[-.55,-.45],[.55,-.45],[.55,.45],[-.55,.45]])beam('steel',[gb,3.5,gtz],[gb+a,2.85,gtz+b],.025,jc(0x2a2826,.03),true,3);
 box('plank',gb-.6,1.75,gtz-.5,1.2,1.1,1.0,jc(0xa08258,.06));box('plank',gb-.6,2.8,gtz-.5,1.24,.05,1.04,jc(0x4a3a2c,.05));box('plank',gb-.6,1.75,gtz-.5,1.24,.06,1.04,jc(0x4a3a2c,.05));
 for(let k=0;k<2;k++)box('steel',gb-.4+k*.2,2.85,gtz-.2,.16,.06,.06,jc(0x6a5a3a,.06));
 // dock goods: crate stacks and sacks on the deck
 rngSkip(21);FURNISH('pa_pallet_load',-9.0,DK,jz-.4,0,{v:1});   // crates on a pallet
 sacks(-6.0,DK,jz-.8,6,0.2);sacks(-5.4,DK+.64,jz-.8,3,.1);
 // yard right of the dock: forklift-height stacks of crates on pallets, tarped, more pallets, a container as a store
 const stacks=[[6.6,4.6],[8.0,4.2],[9.4,4.6],[6.9,6.6],[8.6,6.4]];
 stacks.forEach(([x,z],i)=>{rngSkip(23+(i===1?3:0));FURNISH('pa_pallet_load',x,0,z,0,{v:2});});   // tarped loads on pallets
 rngSkip(2);
 tireStack(11.6,4.2,5);tireStack(11.6,5.0,4);barrel(11.6,0,6.4,0x8a3a2c);barrel(12.1,0,6.7,0x2f62b8);pallet(11.5,0,2.4,1.4,1.2);
 lamp(-10.6,0,ZF+2.2,4.2);lamp(12.0,0,ZF+.8,5.0);
 for(const [i,x] of dxs.entries())inDigit(x,DK+3.8,ZF+.06,i+1,.7,0x2a2826);inDigit(X0-.06,3.6,-1.0,7,1.0,0x2a2826,-PI/2);inDigit(X0-.06,3.6,-1.5,4,1.0,0x2a2826,-PI/2);
 // SOCKETS: awnings over the outer doors (posts land on the deck), banners on a beam bracket, paint panels for stencilled numbers, gable emblem, ridge flag
 sock('awning',dxs[0],WH-.4,ZF+.05,0,{w:4.2,d:2.6,drop:.5,h:WH-.4-.5-DK});sock('awning',dxs[2],WH-.4,ZF+.05,0,{w:4.2,d:2.6,drop:.5,h:WH-.4-.5-DK});
 beam('iron',[-6,WH-.05,ZF+.15],[3,WH-.05,ZF+.15],.1,jc(0x4a4038,.05));
 sock('banner',-4.25,WH-.05,ZF+.2,0,{w:.9,h:2.2});sock('banner',1.25,WH-.05,ZF+.2,0,{w:.9,h:2.2});
 sock('paint',-4.25,DK+1.4,ZF+.06,0,{w:1.8,h:1.5});sock('paint',1.25,DK+1.4,ZF+.06,0,{w:1.8,h:1.5});sock('paint',X0,2.6,-3,-PI/2,{w:2.6,h:1.6});
 sock('emblem',X1+.05,5.2,ZR,PI/2,{w:1.4,h:1.4});sock('flag',X0+1.5,RY+1.6,ZR,0,{w:1.2,h:.7});}
