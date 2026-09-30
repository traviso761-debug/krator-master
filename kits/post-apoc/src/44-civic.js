// prefix: cv
// ---------------------------------------------------------------- civic and religious: longhouse, mess hall, big man's house, shaman hut
// (uses lg* helpers from 42-lg-dwell.js: lgBox, lgGable, lgLean, lgRoof, lgTarp, lgP4, lgPost, lgHood, lgPatch, lgArcRail)
function cvBench(x,y,z,len,ry){W(x,y,z,ry||0,()=>{box('plank',0,.42,0,len,.08,.42,jc(0x8a6a44,.06));for(const sx of [-1,1])box('plank',sx*(len/2-.2),0,0,.1,.42,.36,jc(0x5c4630,.06));});}
function cvTable(x,y,z,len,ry){W(x,y,z,ry||0,()=>{box('plank',0,.82,0,len,.07,.9,jc(0x9a7a52,.06));for(const sx of [-1,1])for(const sz of [-1,1])beam('wood',[sx*(len/2-.2),y,sz*.35],[sx*(len/2-.2),.82,sz*.35],.09,jc(0x5c4630,.06));});}
function cvPole(x,z,h,r,col){cyl('wood',x,0,z,r||.09,h,jc(col||0x5c4630,.06),8);}
// a spiked pole: pole with a cone tip
function cvSpike(x,z,h,col){cvPole(x,z,h,.07,col);cone('iron',x,h,z,.06,.5,jc(0x3a3430,.05),6);}
// pennant string from a to b with n cloth flags hanging
function cvFlags(a,b,n,cols){beam('plain',a,b,.012,jc(0x6a5a44,.05),true,3);for(let k=0;k<n;k++){const t=(k+.5)/n;const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t-Math.sin(t*PI)*.05,z=a[2]+(b[2]-a[2])*t;const c=jc(cols[k%cols.length],.06);
 const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz)||1,ux=dx/L*.16,uz=dz/L*.16;poly('cloth',[[x-ux,y,z-uz],[x+ux,y,z+uz],[x,y-.4,z]],c,true);}}
const cvFlagCols=[0xc9442a,0xd8a020,0x2f7f8e,0xe8dcc0,0x4d6f3c,0x8a3a6a];

// ================================================================== longhouse (three interior layouts: v0 feast hall, v1 sleeping hall, v2 council hall)
defBuilding({key:'longhouse',name:'Village longhouse',seed:4410,tags:{type:['civic','multi-family dwelling'],size:'large',core:'timber hall with sheet roof',materials:['plank','corrugated sheet','tyres','earth','timber']},w:40,d:18,h:9.5,build:cvLonghouse});   // o.front:'open'|'closed' picks the front wall (default 'closed'; v=1 and v=2 default to 'open' so their furniture layouts read from the street); o.v 0/1/2 = feast / sleeping / council hall
function cvLonghouse(o){
 const v=o.v|0,HW=30,HD=10,py=.6,wy=3.7,rise=3.0,fz=HD/2,open=(o.front||(v>=1?'open':'closed'))==='open';
 // tyre-and-earth plinth (top .45), plank floor (top .56) inside the walls, boardwalk decks at .56 start OUTSIDE the wall line: no coplanar surfaces
 box('earth',0,0,0,HW+.6,.45,HD+.6,jc(0xa89880,.05));
 for(const sz of [-1,1])tireWall(-HW/2-.1,sz*(HD/2+.35),HW/2+.1,sz*(HD/2+.35),2,{cap:false});
 for(const sx of [-1,1])tireWall(sx*(HW/2+.35),-HD/2,sx*(HW/2+.35),HD/2,2,{cap:false});
 box('plank',0,.45,0,HW-.3,.15,HD-.3,jc(0x8a6a44,.06));
 // back wall (z-): closed patchwork with small doors and windows, porch, benches
 W(0,0,0,PI,()=>{patchWall(0,py,fz,HW,wy-py,0);
  for(let k=0;k<6;k++){const x=-12.5+k*5;if(k%2===0)door(x,py,fz+.05,1.3,2.3,{step:false,col:pick([0x7a2e28,0x2f5f8f,0x3b7f6e,0xc99a2e])});else win(x,py+1.0,fz+.06,1.2,1.1,{lit:true,shutters:true});}
  deck(0,py,fz+1.55,HW-1.5,2.2,{rail:['f'],posts:false,col:0x9a7a52});stairs(0,0,fz+4.4,0,py,fz+2.6,2.2);
  lgLean(0,fz,HW-1.5,2.9,wy-.1,wy-.9,{col:0xc0a040});
  for(const x of [-8,-1.5,5.5,11])cvBench(x,py,fz+.55,3.0);for(const px of [-13,13])barrel(px,py,fz+1.6);
  for(let k=0;k<3;k++)sock('awning',-6+k*6,wy-.5,fz+.02,0,{w:4.6,d:1.6,drop:.5,h:wy-.5-py+.02});
  for(const x of [-9.5,-3.5,2.5,8.5]){cvPole(x,fz+2.55,4.6,.08);sock('banner',x,4.5,fz+2.6,0,{w:.7,h:2.2});}});
 // front wall (z+): 'open' = bays so the hall reads from the street; 'closed' = solid wall with framed doors
 const ops=[];for(const x of [-12,0,12])ops.push({x0:x-1.7,x1:x+1.7,y0:py,y1:py+2.55});for(const x of [-6,6])ops.push({x0:x-2.3,x1:x+2.3,y0:py+.9,y1:py+2.55});
 if(open){
 // front wall (z+): open bays so the hall reads from the street: three door bays and two sill bays between plank pilasters
 wallOpen('plank',0,py-.03,fz,HW,wy-py+.03,.14,ops,0x9a7a52);
 for(const x of [-9,-3,3,9])lgPatch(x,py+1.6,fz+.08,1.4,1.0,pick([0x2f7f8e,0xc45a30,0xd8a020,0x4d6f3c]));
 for(const x of [-15,-9,-3,3,9,15]){box('plank',x,py-.03,fz+.02,.36,wy-py-.05,.3,jc(0x5c4630,.06));}
 for(const x of [-12,0,12]){box('plank',x,py+2.52,fz+.02,3.9,.16,.2,jc(0x5c4630,.06));}
 deck(0,py,fz+1.3,HW-1.5,2.6,{posts:false,col:0x9a7a52});stairs(0,0,fz+4.6,0,py,fz+2.6,2.2);
 for(const px of [-13,13]){barrel(px,py,fz+1.6);barrel(px+.5,py,fz+2.0);}
 for(const x of [-12,12])sock('awning',x,py+2.78,fz+.02,0,{w:3.6,d:1.5,drop:.4,h:2.3});
 for(const x of [-9,-3,3,9]){cvPole(x,fz+1.8,wy+1.75,.09);sock('banner',x,wy+1.65,fz+1.86,0,{w:.7,h:2.2});}   // props that hold the front roof slope lifted
 }else{ // closed front: solid plank wall, three framed door bays (the middle one open a crack, the outer two ajar), small windows, porch roof at normal height
  patchWall(0,py-.03,fz,HW,wy-py+.03,0);
  for(const x of [-12,12]){const sg=x>0?1:-1,hx=x-sg*.7,an=1.1;box('iron',x,py,fz+.075,1.4,2.3,.03,jc(0x14100c,.02));
   for(const sx of [-1,1])box('plank',x+sx*.78,py,fz+.09,.14,2.5,.16,jc(0x5c4630,.06));box('plank',x,py+2.4,fz+.09,1.7,.16,.16,jc(0x5c4630,.06));
   box('plank',hx+sg*Math.cos(an)*.62,py,fz+.12+Math.sin(an)*.62,1.24,2.2,.07,jc(pick([0x7a2e28,0x2f5f8f,0xc99a2e]),.06),-sg*an);}
  door(0,py,fz+.05,1.5,2.4,{step:false,col:0x7a2e28});
  for(const x of [-8,-5,5,8])win(x,py+1.1,fz+.07,1.0,.9,{lit:true,shutters:x%2!==0});
  for(const x of [-9,-3,3,9])lgPatch(x,py+1.9,fz+.08,1.3,.9,pick([0x2f7f8e,0xc45a30,0xd8a020,0x4d6f3c]));
  lgLean(0,fz,HW-1.5,2.7,wy-.1,wy-.8,{col:0xb85a3a});
  for(const x of [-12,0,12])sock('awning',x,py+2.78,fz+.02,0,{w:x?3.6:2.6,d:1.5,drop:.4,h:2.3});
  for(const x of [-9,-3,3,9]){cvPole(x,fz+2.55,4.6,.08);sock('banner',x,4.5,fz+2.6,0,{w:.7,h:2.2});}
  deck(0,py,fz+1.3,HW-1.5,2.6,{posts:false,col:0x9a7a52});stairs(0,0,fz+4.6,0,py,fz+2.6,2.2);
  for(const px of [-13,13]){barrel(px,py,fz+1.6);barrel(px+.5,py,fz+2.0);}
 }
 // ---- interior layouts (hall floor top y=.56, x -14.8..14.8, z -4.9..4.9)
 const lampH=(x,z)=>{beam('plain',[x,wy+.6,z],[x,wy-.35,z],.012,jc(0x4a4038,.05),true,3);sph('glow',x,wy-.55,z,.17,jc(0xffd890,.03));cyl('iron',x,wy-.4,z,.22,.04,jc(0x3a3430,.05),8);};
 if(v===0){ // feast hall: two long tables with benches, hearth pits down the middle, a head table on a dais
  for(const z of [-1.7,1.7])cvTable(-1,py,z,21,0);for(const z of [-2.7,-.7,.7,2.7])cvBench(-1,py,z,20.4);
  for(const x of [-8,0,8]){fire(x,py,0,.36);}
  box('plank',13.6,py,0,2.6,.4,9,jc(0x8a6a44,.06));cvTable(13.7,py+.4,0,6.8,PI/2);cvBench(14.8,py+.4,0,6.6,PI/2);
  for(const z of [-3.6,3.6]){box('plank',12.2,py+.4,z,.7,.7,.7,jc(pick([0x7a2e28,0x2f5f8f]),.06));}
  for(let k=0;k<7;k++){const x=-11+k*4;lampH(x,-1.7);lampH(x,1.7);}
  for(let k=0;k<6;k++){const x=-9+k*3.6;cyl('sheet',x,py+.9,-1.7+((k%2)*3.4),.11,.26,jc(pick([0xa8acac,0xc45a30,0x8a4a2a]),.06),8);}
 }else if(v===1){ // sleeping hall: bunk stalls along the back wall with partitions and curtains, a central hearth, chests along the front
  for(let k=0;k<6;k++){const cx=-12.5+k*5;
   for(const sx of [-1,1])for(const sz of [-1,1])beam('wood',[cx+sx*1.9,py,-4.6+sz*.9],[cx+sx*1.9,py+2.0,-4.6+sz*.9],.09,jc(0x5c4630,.06));
   for(const yy of [.45,1.45]){box('plank',cx,py+yy,-4.6,3.9,.1,2.0,jc(0x8a6a44,.06));box('cloth',cx-.2,py+yy+.1,-4.6,3.3,.14,1.6,jc(pick([0xc9442a,0x2f7f8e,0xd8a020,0x4d6f3c,0x8a3a6a,0xe8dcc0]),.06));box('cloth',cx+1.4,py+yy+.1,-4.6,.6,.18,.9,jc(0xe8dcc0,.05));}
   box('plank',cx-2.5,py,-3.6,.1,2.4,3.2,jc(0x7a5c3c,.06));
   if(k%2===0)plane4('cloth',[cx-1.6,py+2.2,-3.0],[cx+1.6,py+2.2,-3.0],[cx-1.6,py+.6,-3.0],[cx-1.6,py+.6,-3.0],.02,jc(pick([0x8a3a2c,0x5a7a4a,0xb09a4a]),.06));}
  for(const x of [-5,5]){fire(x,py,.4,.45);cvBench(x,py,1.8,3.6);cvBench(x,py,-1.0,3.6);}
  for(let k=0;k<8;k++){const x=-13+k*3.8;box('plank',x,py,3.9,1.1,.6,.6,jc(pick([0x7a5c3c,0x6a4a30]),.06));box('plank',x,py+.6,3.9,1.14,.06,.64,jc(0x4a3a2c,.05));}
  for(let k=0;k<4;k++)lampH(-9+k*6,0);
  for(let k=0;k<3;k++){const x=-8+k*8;beam('wood',[x-1.5,py+2.7,1.2],[x+1.5,py+2.7,1.2],.05,jc(0x5c4630,.06),true,5);for(let j=0;j<4;j++)plane4('cloth',[x-1.2+j*.7,py+2.7,1.2],[x-.7+j*.7,py+2.7,1.2],[x-1.2+j*.7,py+1.9,1.2],[x-1.2+j*.7,py+1.9,1.2],.02,jc(pick([0xc9442a,0xe8dcc0,0x2f7f8e]),.06));}
 }else{ // council hall: central hearth ring, two curved benches, a dais with the chair at the west end
  fire(0,py,0,.55);for(let k=0;k<11;k++){const a=k/11*TAU;sph('conc',Math.cos(a)*1.4,py+.12,Math.sin(a)*1.4,.24,jc(pick([0x9a9488,0xb0a898,0x8a8478]),.08),.7);}
  for(const [r0,r1] of [[3.0,3.5],[4.0,4.45]]){sector('plank',0,0,r0,r1,PI/2+.3,PI*1.5-.3,py,py+.45,jc(0x8a6a44,.06));sector('plank',0,0,r0,r1,-PI/2+.3,PI/2-.3,py,py+.45,jc(0x8a6a44,.06));}
  box('plank',-12.6,py,0,4.6,.5,9.0,jc(0x7a5c3c,.06));box('plank',-12.6,py+.5,0,4.0,.06,8.4,jc(0x9a7a52,.06));
  box('plank',-13.6,py+.56,0,1.0,.55,1.0,jc(0x6a4a30,.06));box('plank',-14.2,py+1.1,0,.2,1.7,1.2,jc(0x6a4a30,.06));cyl('iron',-14.06,py+2.6,0,.4,.06,jc(0xb8902a,.05),12);
  for(const z of [-3.2,3.2]){cvPole(-11,z,3.6,.1);cvPole(-14.5,z,3.6,.1);}
  for(const x of [-8,-4.5,4.5,8]){cvBench(x,py,x<0?-4.0:4.0,3.4);}
  for(const [x,z] of [[-7,0],[7,0],[0,-4.4],[0,4.4]])lampH(x,z);lampH(0,0);lampH(-12.5,-3);lampH(-12.5,3);
  for(let k=0;k<5;k++){cvFlags([-14,wy+1.0,-4.5],[14,wy+1.0,-4.5],0,cvFlagCols);}
 }
 // double-pitched sheet roof with smoke vents along the ridge
 // roof: back slope down to the eave, FRONT slope propped up 1.8 m so the open hall shows under it (a lifted side)
 if(!open)lgGable(0,wy,0,HW,HD,rise,{ov:.7,col:0x3b7f8e,col2:0xb85a3a});else {const hw=HW/2+.7,lift=1.8,ze=fz+1.8;lgRoof('corr',-hw,hw,-(HD/2+.49),wy,0,wy+rise,.07,jc(0x3b7f8e,.05));lgRoof('corr',-hw,hw,ze,wy+lift,0,wy+rise,.07,jc(0xb85a3a,.05));
  box('iron',0,wy+rise-.02,0,HW+1.4,.1,.16,jc(0x5a4a3c,.05));const yf=wy+rise-(rise-lift)*(HD/2)/ze;
  for(const sx of [-1,1])poly('plank',[[sx*HW/2,wy,-HD/2],[sx*HW/2,wy,HD/2],[sx*HW/2,yf,HD/2],[sx*HW/2,wy+rise,0],[sx*HW/2,wy+rise*.09,-HD/2]],jc(0x8a6a44,.06),true);}
 for(let k=0;k<6;k++){const x=-12.5+k*5;box('plank',x,wy+rise-.05,0,.7,.6,.7,jc(0x6a5238,.06));lgRoof('corr',x-.55,x+.55,.6,wy+rise+1.05,-.6,wy+rise+1.05,.05,jc(0x5a5a56,.05));
  for(const [dx,dz] of [[-.4,-.4],[.4,-.4],[.4,.4],[-.4,.4]])beam('iron',[x+dx,wy+rise+.5,dz],[x+dx,wy+rise+1.05,dz],.04,jc(0x4a4038,.05),true,4);box('glow',x,wy+rise+.58,0,.5,.06,.5,jc(0xff9a3a,.06));}
 // gable ends: boards, carved bargeboards, an emblem field, flanking totem posts
 for(const s of [-1,1]){const gx=s*(HW/2+.05);W(gx,0,0,s>0?PI/2:-PI/2,()=>{
   box('plank',0,wy+.35,.02,3.0,3.0,.08,jc(0x3a2a1c,.05),0,0,PI/4);
   for(const sz of [-1,1]){beam('wood',[sz*(HD/2+.6),wy-.15,.25],[0,wy+rise+.55,.25],.2,jc(0x6a4a30,.06));for(let k=1;k<5;k++)box('plank',sz*(HD/2+.6-k*(HD/2+.6)/5.2),wy-.1+k*rise/5.2*1.0,.32,.34,.34,.08,jc(pick([0xc9442a,0xd8a020,0x2f7f8e]),.05),PI/4);}
   for(const sx of [-.3,.3])beam('wood',[sx,wy+rise+.4,.25],[sx*3,wy+rise+1.6,.25],.13,jc(0x6a4a30,.06),true,6);
   sock('emblem',0,wy+.35,.14,0,{w:2.3,h:2.3});sock('paint',0,1.5,.06,0,{w:5,h:1.6});
   for(const sz of [-1,1]){cvPole(sz*(HD/2+1.0),.9,5.6,.16,0x6a4a30);sph('wood',sz*(HD/2+1.0),5.75,.9,.24,jc(0x8a3a2c,.05));sock('flag',sz*(HD/2+1.0),6.0,.9,0,{w:1.3,h:.7});}
  });}
 fire(-19,0,.6,.6);tireStack(-20,-1.6,3);junkPile(19.5,-6.4,1.4,7);barrel(-16.7,0,-7.6);barrel(-16.2,0,-8.1);lamp(-16.4,0,7.6,3.6);lamp(16.4,0,-7.6,3.6);
}

// ================================================================== mess hall
defBuilding({key:'mess',name:'Mess hall',seed:4420,tags:{type:['tavern/inn','civic'],size:'large',core:'shipping container',materials:['container','plank','sheet metal','bottles']},w:23,d:16,h:8,build:cvMess});
function cvMess(o){
 const cz=4.6,L=CT.L40;
 W(0,0,cz,PI,()=>container({len:L,col:o.v===1?0x2f7f8e:0xa83a2c,open:'front'}));
 W(0,0,-cz,0,()=>container({len:L,col:o.v===1?0xc45a30:0x2f5f8f,open:'front'}));
 W(0,0,cz,0,()=>{for(let k=0;k<4;k++)porthole(-4.2+k*2.8,1.5,1.22,.3);door(5,.16,1.22,1.0,2.0,{step:true});win(-7.2,1.05,1.22,.9,.9,{lit:true});});
 W(0,0,-cz,PI,()=>{win(-3,1.05,1.22,1.4,1.0,{shutters:true});win(1.5,1.05,1.22,1.4,1.0,{lit:true});door(4.6,.16,1.22,1.0,2.0,{step:false});});
 box('plank',0,.16,-cz+1.3,9,.9,.5,jc(0x8a6a44,.06));box('plank',0,1.06,-cz+1.3,9.4,.08,.75,jc(0x5c4630,.06));
 for(let k=0;k<3;k++)box('plank',-4+k*4,1.9,-cz+1.35,3.6,.06,.4,jc(0x6a5238,.06));box('glow',0,2.3,-cz+1.2,8,.1,.05,jc(0xf2c26a,.05));
 for(let k=0;k<7;k++){const x=-4+k*1.3;cyl('sheet',x,1.95,-cz+1.35,.12,.28,jc(pick([0xa8acac,0xc45a30,0x8a4a2a]),.06),8);}
 const ry0=2.8;lgGable(0,ry0,0,L+3.2,2*cz+1.2,2.4,{ov:.3,col:0xc0552f,col2:0xc99a2e});
 for(const sx of [-1,1])for(const sz of [-1,1])lgPost(sx*(L/2+1.2),sz*(cz+.5),ry0+.1,0,.16);
 for(const sx of [-1,1])beam('wood',[sx*(L/2+1.2),ry0-.1,-cz-.5],[sx*(L/2+1.2),ry0-.1,cz+.5],.14,jc(0x5c4630,.06));
 box('earth',0,0,0,L,.08,2*cz-2.4,jc(0x7a6a52,.06));
 for(const z of [-1.2,1.2]){cvTable(0,0,z,10.4,0);}
 for(const z of [-2.1,-.3,.3,2.1])cvBench(0,0,z,10.2);
 for(let k=0;k<5;k++){const x=-4.8+k*2.4;beam('plain',[x,ry0+1.2,0],[x,ry0-.3,0],.01,jc(0x4a4038,.05),true,3);sph('glow',x,ry0-.5,0,.16,jc(0xffd890,.03));cyl('iron',x,ry0-.4,0,.2,.04,jc(0x3a3430,.05),8);}
 bottleString([-6,ry0+.4,-1.6],[6,ry0+.4,-1.6],9);bottleString([-6,ry0+.4,1.6],[6,ry0+.4,1.6],9);
 for(const x of [-3,3])for(const z of [-3.6,3.6])crate(x,0,z,.6,.3);
 // ---- kitchen shed at the west end of the hall, entered by a framed doorway (with a step) and a serving hatch in its east wall
 const kx1=-7.7,kx0=-11.2,kd=2.3,kh=2.6;
 box('plank',(kx0+kx1)/2,0,0,kx1-kx0,.14,2*kd,jc(0x6a5a44,.08));
 patchWall((kx0+kx1)/2,.14,-kd,kx1-kx0,kh-.14,0);patchWall((kx0+kx1)/2,.14,kd,kx1-kx0,kh-.14,0);patchWall(kx0,.14,0,2*kd,kh-.14,PI/2);
 wallOpen('plank',0,.14,0,2*kd,kh-.14,.12,[{x0:-.65,x1:.65,y0:.14,y1:2.15},{x0:1.05,x1:2.0,y0:1.0,y1:1.85}],0x8a6a44,PI/2);
 W(kx1,0,0,PI/2,()=>{ // local: x along the wall (world -z), +z out toward the hall
  for(const sx of [-1,1])beam('wood',[sx*.72,.14,.06],[sx*.72,2.25,.06],.13,jc(0x5c4630,.06));beam('wood',[0,2.25,.06],[0,2.25,.06],.1,jc(0x5c4630,.06));box('wood',0,2.15,.0,1.6,.16,.2,jc(0x5c4630,.06));
  box('conc',0,0,.5,1.7,.14,.8,jc(0x8a8478,.05));box('conc',0,0,1.0,1.9,.07,.4,jc(0x8a8478,.05));                     // step
  box('plank',1.55,.96,.3,1.3,.06,.6,jc(0x8a6a44,.06));for(const sx of [1.0,2.1])beam('wood',[sx,.14,.06],[sx,1.95,.06],.09,jc(0x5c4630,.06));box('wood',1.55,1.85,.02,1.3,.1,.14,jc(0x5c4630,.06));
  box('glow',0,.3,-.9,.7,.12,.05,jc(0xff9a3a,.06));});
 W((kx0+kx1)/2,0,0,PI/2,()=>{lgRoof('corr',-kd-.3,kd+.3,-1.9,kh-.35,1.9,kh+.2,.06,jc(0x8a4a2a,.05));});
 box('iron',-9.6,.14,-1.3,1.4,.9,.8,jc(0x3a3430,.05));stovepipe(-9.6,1.04,-1.3,2.4);box('glow',-9.0,.4,-1.3,.05,.3,.4,jc(0xff9a3a,.06));
 box('plank',-10.4,.14,1.2,1.2,.9,.6,jc(0x8a6a44,.06));barrel(-10.7,.14,-.1);sacks(-8.6,.14,1.6,3);
 // dinner bell on a post at the front corner
 cvPole(9.6,8.0,3.6,.1);beam('wood',[9.6,3.5,8.0],[9.6-.7,3.5,8.0],.08,jc(0x5c4630,.06),true,6);cone('iron',9.0,2.85,8.0,.24,.4,jc(0xb8902a,.05),10);sph('iron',9.0,2.75,8.0,.06,jc(0x3a3430,.05));beam('plain',[9.0,3.5,8.0],[9.0,3.2,8.0],.02,jc(0x3a3430,.05),true,3);
 lamp(-9.4,0,8.0,3.4);lamp(8.6,0,-8.0,3.4);junkPile(9.5,-6.5,1.2,6);tireStack(-9.5,-6.4,3);
 // sockets: awnings clear of the lamp, bell and crates
 sock('awning',-3.4,2.5,cz+1.24,0,{w:5.4,d:1.6,drop:.6,h:1.9});sock('awning',5,2.6,cz+1.24,0,{w:2.4,d:1.4,drop:.5,h:2.1});
  sock('awning',kx0+2,2.6,-kd-.02,PI,{w:2.4,d:1.2,drop:.5,h:2.1});
 for(const sx of [-1,1]){cvPole(sx*(L/2+2.9),cz+1.6,5.4,.09);sock('banner',sx*(L/2+2.9),5.3,cz+1.65,0,{w:.8,h:2.4});}
 beam('iron',[0,ry0+2.4,0],[0,ry0+4.6,0],.06,jc(0x4a4038,.05),true,5);sock('flag',0,ry0+4.6,0,0,{w:1.4,h:.7});
 for(const z of [-1.3,1.3])beam('iron',[L/2+1.2,ry0-.1,z],[L/2+1.32,2.62,z],.04,jc(0x3a3430,.05),true,4);
 sock('emblem',5.5,1.5,-cz-1.24,PI,{w:1.1,h:1.1});sock('paint',-9.45,1.3,-kd-.06,PI,{w:2.2,h:.9});
 sock('sign',L/2+1.28,2.3,0,PI/2,{w:3,h:.7,trade:'MESS'});}

// ================================================================== chief: big man's house
defBuilding({key:'chief',name:"Big man's house",seed:4430,tags:{type:['civic','single-family dwelling'],size:'large',core:'arcology bulkhead',materials:['ancient ceramic','container','bus','sheet palisade','junk trophies']},w:25,d:34,h:18,build:cvChief});
function cvChief(o){
 const bz=-5,bh=7.6,fz=bz+.45+.16,dz=fz+.08,cw=jc(0xcfccc4,.03),cw2=jc(0xb8b4aa,.04),H=CT.H;
 W(0,0,bz,0,()=>bulkhead({w:9,h:bh,th:.9,hatch:'door'}));
 door(0,.3,bz-.35,2.0,3.05,{step:false,col:0x7a2e28});                                    // the main entrance, facing +z, under the throne bay
 const c=[0xa83a2c,0x2f7f8e,0xd8a020,0x4d6f3c,0x2f5f8f,0xc45a30,0x8a3a6a];if(o.v===1)c.reverse();
 // ---- thick bulkhead: chunky door reveal, corner piers, cornice
 for(const sx of [-1,1]){box('conc',sx*1.55,.3,bz+.5,.6,3.5,.9,cw2);box('conc',sx*4.9,0,bz+.45,1.3,bh,1.5,cw);box('conc',sx*4.9,bh,bz+.45,1.6,.3,1.8,cw2);cone('conc',sx*4.9,bh+.3,bz+.45,.55,1.1,cw2,4);}
 box('conc',0,3.8,bz+.55,3.7,.5,1.0,cw2);box('conc',0,bh-.35,dz-.05,10.4,.35,1.4,cw2);
 // ---- the rear hall: a solid two-storey block behind the bulkhead with a big gable roof
 const hz=-9.5,hd=8.1,HF=[.3,3.6],SB=3.3;
 box('earth',0,0,hz,10,6.9,hd,jc(0xa89880,.05));
 for(let s=0;s<2;s++){const sc=[c[1],c[5]][s];patchWall(5.04,HF[s],hz,hd,SB,PI/2,{col:sc});patchWall(-5.04,HF[s],hz,hd,SB,-PI/2,{col:c[s?0:2]});patchWall(0,HF[s],hz-hd/2-.05,10,SB,PI,{col:sc});box('plank',0,HF[s]-.18,hz,10.5,.36,hd+.4,jc(0x4a3a2c,.06));}
 W(0,6.9,hz,PI/2,()=>lgGable(0,0,0,hd+.8,10,2.6,{ov:.5,col:0xb85a3a,col2:0xc99a2e}));
 for(const [x,z] of [[-3.2,-7.6],[3.2,-11.4]]){box('earth',x,8.0,z,.9,3.2,.9,jc(0xa8503a,.06));box('conc',x,11.2,z,1.1,.18,1.1,jc(0x6a6660,.05));}
 for(let s=0;s<2;s++){const sill=HF[s]+1.0;for(const sd of [-1,1])for(const z of [-9.0,-12.2])W(sd*5.1,0,z,sd*PI/2,()=>win(0,sill,0,.9,1.2,{lit:(s+z)%2===0,shutters:s===0}));
  for(const x of [-3.4,-1.2,1.2,3.4])W(x,0,hz-hd/2-.03,PI,()=>win(0,sill,0,1.0,1.2,{lit:s===1}));}
 W(0,0,hz-hd/2-.03,PI,()=>door(0,HF[0],0,1.1,2.2,{step:true,col:0x2f5f8f}));lgAwn(0,2.8,hz-hd/2-.02,PI,2.4,1.2,.4);
 for(const sd of [-1,1]){deck(sd*5.85,HF[1],-11.2,1.6,3.0,{rail:sd>0?['r','f','b']:['l','f','b'],posts:false});for(const z of [-12.5,-9.9])beam('iron',[sd*5.05,HF[1]-1.0,z],[sd*6.6,HF[1]-.12,z],.06,jc(0x4a4038,.05),true,5);lgPost(sd*6.6,-12.6,HF[1]-.12,0,.12);lgPost(sd*6.6,-9.8,HF[1]-.12,0,.12);
  W(sd*5.1,0,-11.2,sd*PI/2,()=>door(0,HF[1],0,1.0,2.1,{step:false}));lgAwn(sd*5.05,HF[1]+2.5,-11.2,sd*PI/2,1.8,1.2,.4);}
 // annex rooms between the hall and the wings (solid boxes with flat sheet roofs)
 for(const sd of [-1,1]){box('plank',sd*6.1,0,-7.6,2.3,3.5,5.2,jc(sd<0?0x8a5a30:0x5a7a4a,.06));box('sheet',sd*6.1,3.5,-7.6,2.7,.16,5.6,jc(0x8a4a2a,.06));W(sd*7.26,0,-7.6,sd*PI/2,()=>win(0,1.2,0,.9,1.0,{lit:true}));}
 // rear tower: a three-box stack with a hipped roof, window rows, dish and flag
 for(let k=0;k<3;k++)lgBox(3.6,H*k,-15.3,0,CT.L20,c[(k+2)%c.length],()=>{win(-1.2,1.05,1.22,1.1,1.0,{lit:k===2||o.v===1});porthole(1.2,1.4,1.22,.32);if(k===0)door(0,.16,1.22,.95,1.95,{step:true});});
 lgGable(3.6,H*3+.05,-15.3,6.4,2.7,1.3,{ov:.25,col:0xc45a30,col2:0x8a4a2a});lgDish(4.6,H*3+.05+1.0,-15.6,.2,.6);
 // ---- long wings: rear boxes and front boxes run end to end down both sides, staggered in height (west 3 high behind, 2 in front; east 2 behind, 1 in front + a gate tower)
 const wing=(sd,zc,levels,cols)=>{const x=sd*8.4,ry=sd<0?PI/2:-PI/2;
  for(let k=0;k<levels;k++)lgBox(x,H*k,zc,ry,CT.L40,cols[k],()=>{if(k===0){door(0,.16,1.22,1.0,2.0,{step:true});win(-3.6,1.05,1.22,1.2,.9,{lit:true});win(3.6,1.05,1.22,1.2,.9,{bars:true});porthole(-1.7,1.4,1.22,.32);porthole(1.7,1.4,1.22,.32);}
   else{win(-3.6,1.05,1.22,1.2,1.0,{shutters:k===1});win(3.6,1.05,1.22,1.2,1.0,{lit:k===2});porthole(-1.2,1.4,1.22,.34);porthole(1.2,1.4,1.22,.34);}});
  lgAwn(sd*7.18,2.7,zc,ry,2.0,1.1,.4);};
 wing(-1,-6.1,3,[c[0],c[1],c[3]]);wing(-1,6.1,2,[c[2],c[4]]);wing(1,-6.1,2,[c[5],c[6]]);wing(1,6.1,1,[c[3]]);
 for(let k=1;k<=2;k++)lgBox(8.4,H*k,9.15,-PI/2,CT.L20,c[(k+3)%c.length],()=>{win(-1.2,1.05,1.22,1.2,1.0,{lit:true});porthole(1.4,1.4,1.22,.32);});   // gate tower over the east front box
 lgGable(-8.4,H*3+.05,-6.1,CT.L40+.1,2.6,1.2,{ov:.2,col:0xc45a30,col2:0x8a4a2a});                       // west rear: a long hipped hut roof
 lgDish(8.4,H*3+.05,9.15,-.4,.7);antenna(9.4,H*3,9.6,3);lgSolar(-8.4,H*2+.06,6.0,2.4,1.2,0,.5);
 // west terrace over the front box, steel stair to its south edge; east terrace over the rear box, stair along the outer face
 {const ty=H*2+.06;deck(-7.8,ty,3.15,4.4,5.7,{rail:['l','r','b'],posts:false});lgPost(-5.7,.5,ty-.1,0);lgPost(-5.7,3.9,ty-.1,0);stairs(-6.4,0,11.4,-6.4,ty,6.0,1.1,{steel:true});
  for(const z of [1,4])beam('iron',[-7.18,ty-1.2,z],[-5.75,ty-.12,z],.06,jc(0x4a4038,.05),true,5);lgTank(-9.2,ty,1.4,.75,1.2,0x8a3a2c);
  lgTarp(-7.8,ty+2.2,1.2,3.0,2.0,.4);for(const dx of [-1.5,1.5]){beam('wood',[-7.8+dx,ty,1.2],[-7.8+dx,ty+2.2,1.2],.07,jc(0x5c4630,.06),true,5);beam('wood',[-7.8+dx,ty,3.2],[-7.8+dx,ty+1.8,3.2],.07,jc(0x5c4630,.06),true,5);}}
 {const ty=H*2+.06;deck(9.1,ty,-9.2,3.8,6.0,{rail:['l','r','b'],posts:false});lgPost(10.85,-12.0,ty-.1,0);lgPost(10.85,-6.5,ty-.1,0);stairs(10.4,0,-0.8,10.4,ty,-6.2,1.1,{steel:true});
  for(const z of [-11,-8])beam('iron',[9.62,ty-1.2,z],[10.85,ty-.12,z],.06,jc(0x4a4038,.05),true,5);lgTarp(8.6,ty+2.2,-10.4,3.0,2.0,.4);for(const dx of [-1.5,1.5]){beam('wood',[8.6+dx,ty,-10.4],[8.6+dx,ty+2.2,-10.4],.07,jc(0x5c4630,.06),true,5);beam('wood',[8.6+dx,ty,-8.4],[8.6+dx,ty+1.8,-8.4],.07,jc(0x5c4630,.06),true,5);}}
 // ---- projecting throne bay: a timber room on the front of the bulkhead, deck on posts, side walls with windows, canopy gable with horns, twin steel stairs
 const ty=4.3,bd=5.0;
 deck(0,ty,fz+bd/2,8.6,bd,{rail:['f'],posts:false});
 for(const sx of [-1,1]){lgPost(sx*4.25,fz+bd-.2,ty+3.4,0,.26);lgPost(sx*4.25,fz+.3,ty+3.4,ty,.2);beam('iron',[sx*4.25,ty-1.6,fz+.1],[sx*4.25,ty-.12,fz+2.2],.08,jc(0x4a4038,.05));beam('iron',[sx*4.25,ty-1.6,fz+2.6],[sx*4.25,ty-.12,fz+bd-.6],.08,jc(0x4a4038,.05));
  box('plank',sx*4.15,ty,fz,.3,3.4,bd-1.0,jc(sx<0?0x8a5a30:0xa83a2c,.06));W(sx*4.32,0,fz+1.4,sx*PI/2,()=>win(0,ty+1.0,0,1.0,1.1,{lit:true}));W(sx*4.32,0,fz+3.2,sx*PI/2,()=>win(0,ty+1.0,0,1.0,1.1,{shutters:true}));}
 W(0,ty+3.4,fz+bd/2,PI/2,()=>lgGable(0,0,0,bd,9.4,1.8,{ov:.3,col:0xa83a2c,col2:0xc99a2e}));
 for(const sx of [-1,1]){beam('wood',[sx*.2,ty+5.25,fz+bd+.32],[sx*2.2,ty+6.7,fz+bd+.32],.14,jc(0x3a2a1c,.05),true,6);cone('iron',sx*2.2,ty+6.7,fz+bd+.32,.1,.5,jc(0xd8d0c0,.03),6);}
 stairs(-3.3,0,fz+bd+4.3,-3.3,ty,fz+bd,1.2,{steel:true});stairs(3.3,0,fz+bd+4.3,3.3,ty,fz+bd,1.2,{steel:true});
 W(0,ty,fz+.6,0,()=>{box('sheet',0,0,0,1.3,.6,.9,jc(0x9a3a2c,.05));box('sheet',0,.6,-.4,1.3,1.9,.14,jc(0x9a3a2c,.05));cyl('iron',0,1.9,-.34,.55,.08,jc(0xdcd8cc,.04),14);
  for(const sx of [-1,1]){beam('iron',[sx*.65,.6,-.4],[sx*1.0,2.6,-.5],.07,jc(0x3a3430,.05),true,5);beam('iron',[sx*.65,1.3,-.4],[sx*1.3,2.2,-.5],.06,jc(0x3a3430,.05),true,5);}});
 sph('glow',0,ty+3.0,fz+.9,.12,jc(0xffd890,.03));
 for(let k=-4;k<=4;k++)cone('iron',k*1.0,bh+.3,bz,.09,.9+(k%2?0:.5),jc(0x3a3430,.05),6);
 sph('plain',0,bh+.75,bz+.2,.3,jc(0xe0d6c0,.03));
 // ---- gate wall in front of the wings: bus on the east, sheet-and-post palisade with spiked tops, side fences
 const wz=13.2;W(6.5,0,wz,0,()=>bus({len:8.4}));
 fenceRun(-11.6,wz,-2.2,wz,3.4,{type:'sheet'});for(let x=-11.6;x<=-2.1;x+=1.5)cvSpike(x,wz,3.9+rr(-.2,.2),0x4a4038);
 fenceRun(9.6,wz,11.6,wz,3.4,{type:'sheet'});
 for(const sx of [-1,1]){fenceRun(sx*11.6,wz,sx*11.6,-16,2.4,{type:'sheet'});for(let z=wz;z>-16;z-=2.0)cvSpike(sx*11.6,z,3.8+rr(-.2,.2),0x4a4038);}
 fenceRun(-11.6,-16.3,11.6,-16.3,2.4,{type:'sheet'});
 for(const gx of [-1.9,1.9]){cvPole(gx,wz,5.2,.2,0x4a3a2c);cyl('iron',gx,4.9,wz+.2,.5,.06,jc(0xdcd8cc,.04),14);sph('plain',gx,5.4,wz,.26,jc(0xe0d6c0,.03));}
 beam('wood',[-1.9,4.7,wz],[1.9,4.7,wz],.2,jc(0x4a3a2c,.05),true,7);
 for(const [x,z,h] of [[-6,9.6,4.2],[-3.6,9.4,3.6],[3.6,9.4,3.6],[5.5,9.6,4.2]])cvSpike(x,z,h,0x4a4038);
 for(const [x,z] of [[-6,9.6],[5.5,9.6]])box('sheet',x,2.6,z,1.3,.06,.9,jc(pick([0xa83a2c,0x2f5f8f,0xd8a020]),.05),.4,.3,0);
 for(let k=0;k<5;k++){cyl('iron',-3.6,1.2+k*.32,9.4,.32-.02*k,.05,jc(k%2?0xdcd8cc:0xb8902a,.05),12);cyl('iron',3.6,1.2+k*.32,9.4,.32-.02*k,.05,jc(k%2?0xb8902a:0xdcd8cc,.05),12);}
 for(let k=0;k<3;k++)barrel(-5.6+k*.5,0,5.6);tireRing(-4.6,2.2,.8,2,0,TAU);fire(-4.6,.44,2.2,.3);crate(5.0,0,5.0,.7,.2);sacks(4.6,0,6.2,4);junkPile(-5.5,8.6,1.2,7);lamp(4.6,0,4.0,3.8);lamp(-4.6,0,4.0,3.8);junkPile(0,-17.6,1.4,7);
 // ---- sockets: banners on their own free poles beside the bay, at the gate and on the terraces
 for(const [x,y,z,h] of [[-5.6,0,fz+bd+.9,8.6],[5.6,0,fz+bd+.9,8.6],[11.0,0,wz-.1,7.4]]){cvPole(x,z,y+h,.07);sock('banner',x,y+h-.05,z,0,{w:.8,h:2.6});}
 for(const x of [-1.9,1.9])sock('flag',x,5.5,wz,0,{w:1.4,h:.8});
 beam('iron',[0,bh+2.6,bz],[0,bh+4.6,bz],.07,jc(0x4a4038,.05),true,5);sock('flag',0,bh+4.6,bz,0,{w:1.6,h:.9});
 sock('emblem',0,ty+4.3,fz+bd+.05,0,{w:1.3,h:1.3});sock('emblem',-2.6,ty+2.6,fz+.06,0,{w:1.2,h:1.2});sock('emblem',2.6,ty+2.6,fz+.06,0,{w:1.2,h:1.2});sock('paint',-7.16,H+1.3,-9.0,PI/2,{w:1.8,h:1.0});}

// ================================================================== shaman hut
defBuilding({key:'shaman',name:'Shaman hut',seed:4440,tags:{type:['religious'],size:'small',core:'tyre dome',materials:['tyres','earth','bottle glass','hubcaps','rebar']},w:13,d:13,h:8.5,build:cvShaman});
function cvShaman(o){
 const R0=2.5,Hh=2.3;
 // dome: earth ellipsoid, tyre courses spiral up it, doorway to the front (+z)
 sph('earth',0,0,0,R0-.05,jc(0xb0a088,.05),Hh/(R0-.05));
 for(let c=0;c<9;c++){const y=c*.24+.12,Rc=(R0+.12)*Math.sqrt(Math.max(.02,1-Math.pow(y/(Hh+.1),2)));const n=Math.max(3,Math.round(TAU*Rc/.7));
  for(let k=0;k<n;k++){const a=(k+(c%2)*.5)/n*TAU;if(c<5&&Math.abs(Math.atan2(Math.sin(a-PI/2),Math.cos(a-PI/2)))<.34)continue;tire(Math.cos(a)*Rc,y,Math.sin(a)*Rc,TYR.R,TYR.t,undefined,rng()*TAU,rr(-.25,.25),rr(-.25,.25));}}
 // doorway: plank frame, dark hollow, hide curtain
 box('iron',0,0,R0*.98,1.2,1.4,.1,jc(0x14100c,.02));for(const sx of [-1,1])beam('wood',[sx*.62,0,R0+.15],[sx*.62,1.5,R0+.15],.12,jc(0x5c4630,.06));beam('wood',[-.7,1.5,R0+.15],[.7,1.5,R0+.15],.14,jc(0x5c4630,.06));
 plane4('cloth',[-.5,1.45,R0+.2],[.5,1.45,R0+.2],[-.5,.3,R0+.35],[-.5,.3,R0+.35],.03,jc(0x8a3a2c,.06));
 // bottle-glass windows set into the dome
 for(const a of [.2,PI-.2,PI+.7,-.7+TAU*.0]){const Rw=(R0+.06)*Math.sqrt(1-Math.pow(1.05/(Hh+.1),2));W(Math.cos(a)*Rw,1.05,Math.sin(a)*Rw,PI/2-a,()=>{box('bottle',0,-.4,0,.9,.8,.34,null);for(const sx of [-1,1])beam('wood',[sx*.5,-.45,.2],[sx*.5,.45,.2],.08,jc(0x5c4630,.06));box('glow',0,-.1,-.1,.5,.4,.05,jc(0xf2c26a,.05));});}
 // smoke hole: a tyre collar, a short sheet chimney with a rag cap, a curl of ember glow
 tire(0,Hh-.06,0,.62,.16,undefined,0,0,0);cyl('iron',0,Hh-.05,0,.42,.7,jc(0x6a5a4c,.05),10,.3);box('glow',0,Hh+.68,0,.44,.05,.44,jc(0xff8a3a,.06));
 // ring of stones and tyres round the hut
 for(let k=0;k<26;k++){const a=k/26*TAU,r=5.2+rr(-.15,.15);if(Math.abs(Math.atan2(Math.sin(a-PI/2),Math.cos(a-PI/2)))<.3)continue;const x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(k%3===0)tire(x,.12,z,TYR.R,TYR.t,undefined,rng()*TAU,PI/2-.5,a);else sph('conc',x,.15,z,rr(.2,.34),jc(pick([0x9a9488,0xb0a898,0x8a8478]),.08),.7);}
 // junk totems: pole, hubcap stack, doll heads, pipes and rebar
 function totem(x,z,h,ry,kind){W(x,0,z,ry,()=>{cyl('wood',0,0,0,.14,h,jc(0x5c4630,.06),8);
   for(let k=0;k<6;k++){const y=.9+k*.3;cyl('iron',0,y,0,.42-.02*k,.05,jc(k%2?0xdcd8cc:0xb8902a,.05),12);}
   for(let k=0;k<3;k++){const y=2.9+k*.55;const a=k*2.1;sph('plain',Math.cos(a)*.24,y,Math.sin(a)*.24,.17,jc(pick([0xe8d8c0,0xd8c0a8,0xc8b090]),.05));sph('iron',Math.cos(a)*.24+.06,y+.03,Math.sin(a)*.24+.13,.03,jc(0x1a1614,.02));sph('iron',Math.cos(a)*.24-.06,y+.03,Math.sin(a)*.24+.13,.03,jc(0x1a1614,.02));}
   pipe('iron',[[.15,.5,.1],[.55,.9,.2],[.55,2.0,.1],[.3,2.5,0]],.06,jc(0x8a5a3a,.05));
   for(const [dx,dy,dz] of [[-.8,h-.3,0],[.8,h-.5,.1],[.1,h-.4,.7],[-.4,h-.4,-.7]])beam('iron',[0,h-1.1,0],[dx,dy,dz],.04,jc(0x6a3a26,.05),true,4);
   box('plank',0,h-.2,0,1.4,.12,.12,jc(0x5c4630,.06));cone('iron',0,h,0,.13,.6,jc(0x3a3430,.05),6);
   if(kind===1){box('sheet',0,h-1.0,.16,.9,.9,.05,jc(0xd8a020,.05),0,0,PI/4);}
  });}
 totem(-3.4,4.4,5.4,.4,1);totem(3.6,3.6,4.6,-.4,0);totem(-4.2,-2.4,4.0,1.0,0);
 // hanging bottle chimes on cross-beams, prayer flags strung from the totem tops to the hut
 bottleString([-3.4+.7,5.0,4.4],[3.6-.7,4.2,3.6],7);bottleString([-3.4,4.9,4.4],[-.4,Hh+.9,.3],5);
 cvFlags([-3.4,5.2,4.4],[3.6,4.4,3.6],9,cvFlagCols);cvFlags([-3.4,5.2,4.4],[0,Hh+.9,0],7,cvFlagCols);cvFlags([3.6,4.4,3.6],[0,Hh+.9,0],7,cvFlagCols);cvFlags([-4.2,3.8,-2.4],[0,Hh+.9,0],6,cvFlagCols);
 // offerings: bowls, bones, candles, fruit crates at the foot of the totems
 for(const [x,z] of [[-2.6,4.9],[-3.9,5.2],[2.7,3.9],[3.1,4.6]]){cyl('sheet',x,0,z,.18,.08,jc(pick([0x8a3a2c,0x2f5f8f,0xc99a2e]),.06),10);sph('plain',x,.1,z,.09,jc(pick([0xd8a020,0xc45a30,0x4d6f3c]),.06));}
 for(let k=0;k<4;k++){cyl('plain',-.9+k*.6,0,5.3+rr(-.1,.1),.04,.16,jc(0xe0d6c0,.03),6);sph('glow',-.9+k*.6,.2,5.3,.045,jc(0xffd890,.03));}
 box('plank',1.6,0,5.5,.7,.3,.5,jc(0x8a6a44,.06));for(let k=0;k<3;k++)beam('plain',[-.6+k*.4,0,5.9],[-.6+k*.4+rr(-.15,.15),.05,6.2],.04,jc(0xe0d6c0,.03),true,4);
 tireStack(-5.6,1.4,2);junkPile(5.6,-2.4,1.0,6);barrel(4.6,0,-3.6);
 // sockets: canopy over the door, banner and flag on the totems, emblem on a board
 beam('wood',[-.8,1.6,R0+.1],[-1.1,2.9,R0+.55],.09,jc(0x5c4630,.06));beam('wood',[.8,1.6,R0+.1],[1.1,2.9,R0+.55],.09,jc(0x5c4630,.06));
 sock('awning',0,2.6,R0+.1,0,{w:2.4,d:1.5,drop:.6,h:2.0});
 cvPole(-1.9,3.2,3.7,.07);beam('wood',[-2.3,3.6,3.2],[-1.5,3.6,3.2],.06,jc(0x5c4630,.06),true,5);sock('banner',-1.9,3.55,3.26,0,{w:.7,h:1.6});
 sock('flag',-3.4,6.05,4.4,0,{w:1.1,h:.6});sock('flag',3.6,5.25,3.6,0,{w:1.0,h:.55});
 box('plank',0,3.1,-4.5,1.6,1.6,.1,jc(0x3a2a1c,.05),0,0,PI/4);cvPole(-.9,-4.55,3.0,.08);cvPole(.9,-4.55,3.0,.08);sock('emblem',0,3.85,-4.4,PI,{w:1.0,h:1.0});
}
