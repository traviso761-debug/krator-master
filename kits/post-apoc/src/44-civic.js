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

// ================================================================== longhouse
defBuilding({key:'longhouse',name:'Village longhouse',seed:4410,tags:{type:['civic','multi-family dwelling'],size:'large',core:'timber hall with sheet roof',materials:['plank','corrugated sheet','tyres','earth','timber']},w:39,d:18,h:9.5,build:cvLonghouse});
function cvLonghouse(o){
 const HW=30,HD=10,py=.5,wy=3.7,rise=3.0;
 // tyre-and-earth plinth
 box('earth',0,0,0,HW+.6,py,HD+.6,jc(0xa89880,.05));
 for(const sz of [-1,1])tireWall(-HW/2-.1,sz*(HD/2+.35),HW/2+.1,sz*(HD/2+.35),2);
 for(const sx of [-1,1])tireWall(sx*(HW/2+.35),-HD/2,sx*(HW/2+.35),HD/2,2);
 // long walls: patchwork planks and sheet; doors and windows
 for(const s of [-1,1]){W(0,0,0,s<0?PI:0,()=>{const fz=HD/2;patchWall(0,py,fz,HW,wy-py,0);
   for(let k=0;k<6;k++){const x=-12.5+k*5;if(k%2===0)door(x,py,fz+.05,1.3,2.3,{step:false,col:pick([0x7a2e28,0x2f5f8f,0x3b7f6e,0xc99a2e])});else win(x,py+1.0,fz+.06,1.2,1.1,{lit:o.v===1||k===3,shutters:true});}
   // porch: deck, rail, stairs, lean roof, benches
   deck(0,py,fz+1.3,HW-1.5,2.6,{rail:['f'],posts:false});stairs(0,0,fz+4.6,0,py,fz+2.6,2.2);
   lgLean(0,fz,HW-1.5,2.9,wy-.1,wy-.9,{col:s<0?0xb85a3a:0xc0a040});
   for(const x of [-8,-1.5,5.5,11])cvBench(x,py,fz+.55,3.0);
   for(const px of [-13,13])barrel(px,py,fz+1.6);
   for(let k=0;k<3;k++){const x=-6+k*6;sock('awning',x,wy-.5,fz+.02,0,{w:4.6,d:1.6,drop:.5,h:wy-.5-py+.02});}
   for(const x of [-9.5,-3.5,2.5,8.5]){cvPole(x,fz+2.55,4.6,.08);sock('banner',x,4.5,fz+2.6,0,{w:.7,h:2.2});}});}
 // double-pitched sheet roof with smoke vents along the ridge
 lgGable(0,wy,0,HW,HD,rise,{ov:.7,col:0x3b7f8e,col2:0xb85a3a});
 for(let k=0;k<6;k++){const x=-12.5+k*5;box('plank',x,wy+rise-.05,0,.7,.6,.7,jc(0x6a5238,.06));lgRoof('corr',x-.55,x+.55,.6,wy+rise+1.05,-.6,wy+rise+1.05,.05,jc(0x5a5a56,.05));
  for(const [dx,dz] of [[-.4,-.4],[.4,-.4],[.4,.4],[-.4,.4]])beam('iron',[x+dx,wy+rise+.5,dz],[x+dx,wy+rise+1.05,dz],.04,jc(0x4a4038,.05),true,4);box('glow',x,wy+rise+.58,0,.5,.06,.5,jc(0xff9a3a,.06));}
 // gable ends: timber boards, carved bargeboards, an emblem field, flanking totem posts
 for(const s of [-1,1]){const gx=s*(HW/2+.05);W(gx,0,0,s>0?PI/2:-PI/2,()=>{box('plank',0,wy+.35,.02,3.0,3.0,.08,jc(0x3a2a1c,.05),0,0,PI/4);
   for(const sz of [-1,1]){beam('wood',[sz*(HD/2+.6),wy-.15,.25],[0,wy+rise+.55,.25],.2,jc(0x6a4a30,.06));for(let k=1;k<5;k++)box('plank',sz*(HD/2+.6-k*(HD/2+.6)/5.2),wy-.1+k*rise/5.2*1.0,.32,.34,.34,.08,jc(pick([0xc9442a,0xd8a020,0x2f7f8e]),.05),PI/4);}
   for(const sx of [-.3,.3])beam('wood',[sx,wy+rise+.4,.25],[sx*3,wy+rise+1.6,.25],.13,jc(0x6a4a30,.06),true,6);
   sock('emblem',0,wy+.35,.14,0,{w:2.3,h:2.3});sock('paint',0,1.9,.06,0,{w:5,h:2.4});
   for(const sz of [-1,1]){cvPole(sz*(HD/2+1.0),.9,5.6,.16,0x6a4a30);sph('wood',sz*(HD/2+1.0),5.75,.9,.24,jc(0x8a3a2c,.05));sock('flag',sz*(HD/2+1.0),6.0,.9,0,{w:1.3,h:.7});}
  });}
 // yard: a fire ring, tyre seats, junk
 fire(-19,0,.6,.6);tireStack(-20,-1.6,3);junkPile(19.5,-6.4,1.4,7);barrel(-16.7,0,-7.6);barrel(-16.2,0,-8.1);lamp(-16.4,0,7.6,3.6);lamp(16.4,0,-7.6,3.6);
 sock('emblem',0,2.4,HD/2+.1,0,{w:1.2,h:1.2});}

// ================================================================== mess hall
defBuilding({key:'mess',name:'Mess hall',seed:4420,tags:{type:['tavern/inn','civic'],size:'large',core:'shipping container',materials:['container','plank','sheet metal','bottles']},w:20,d:16,h:8,build:cvMess});
function cvMess(o){
 const cz=4.6,L=CT.L40;
 // two 40 ft containers in parallel; the open sides face the hall between them
 W(0,0,cz,PI,()=>container({len:L,col:o.v===1?0x2f7f8e:0xa83a2c,open:'front'}));
 W(0,0,-cz,0,()=>container({len:L,col:o.v===1?0xc45a30:0x2f5f8f,open:'front'}));
 // outer faces (rear box front faces the hall +z? handled by ry): windows, hatch, door
 W(0,0,cz,0,()=>{for(let k=0;k<4;k++)porthole(-4.2+k*2.8,1.5,1.22,.3);door(5,.16,1.22,1.0,2.0,{step:true});win(-7.2,1.05,1.22,.9,.9,{lit:true});});
 W(0,0,-cz,PI,()=>{win(-3,1.05,1.22,1.4,1.0,{shutters:true});win(1.5,1.05,1.22,1.4,1.0,{lit:true});door(4.6,.16,1.22,1.0,2.0,{step:false});});
 // inner faces: counters, shelves and stoves seen through the hall
 box('plank',0,.16,-cz+1.3,9,.9,.5,jc(0x8a6a44,.06));box('plank',0,1.06,-cz+1.3,9.4,.08,.75,jc(0x5c4630,.06));
 for(let k=0;k<3;k++)box('plank',-4+k*4,1.9,-cz+1.35,3.6,.06,.4,jc(0x6a5238,.06));box('glow',0,2.3,-cz+1.2,8,.1,.05,jc(0xf2c26a,.05));
 for(let k=0;k<7;k++){const x=-4+k*1.3;cyl('sheet',x,1.95,-cz+1.35,.12,.28,jc(pick([0xa8acac,0xc45a30,0x8a4a2a]),.06),8);}
 // the hall roof: gable of sheet over the gap and beyond both ends, posts at the four corners
 const ry0=2.8;lgGable(0,ry0,0,L+3.2,2*cz+1.2,2.4,{ov:.3,col:0xc0552f,col2:0xc99a2e});
 for(const sx of [-1,1])for(const sz of [-1,1])lgPost(sx*(L/2+1.2),sz*(cz+.5),ry0+.1,0,.16);
 for(const sx of [-1,1])beam('wood',[sx*(L/2+1.2),ry0-.1,-cz-.5],[sx*(L/2+1.2),ry0-.1,cz+.5],.14,jc(0x5c4630,.06));
 box('earth',0,0,0,L,.08,2*cz-2.4,jc(0x7a6a52,.06));    // the hall floor
 // long tables and benches, lit by lanterns and hung bottles
 for(const z of [-1.2,1.2]){cvTable(0,0,z,10.4,0);}
 for(const z of [-2.1,-.3,.3,2.1])cvBench(0,0,z,10.2);
 for(let k=0;k<5;k++){const x=-4.8+k*2.4;beam('plain',[x,ry0+1.2,0],[x,ry0-.3,0],.01,jc(0x4a4038,.05),true,3);sph('glow',x,ry0-.5,0,.16,jc(0xffd890,.03));cyl('iron',x,ry0-.4,0,.2,.04,jc(0x3a3430,.05),8);}
 bottleString([-6,ry0+.4,-1.6],[6,ry0+.4,-1.6],9);bottleString([-6,ry0+.4,1.6],[6,ry0+.4,1.6],9);
 for(const x of [-3,3])for(const z of [-3.6,3.6])crate(x,0,z,.6,.3);
 // kitchen lean-to on the rear of the far box, stove chimney, serving hatch
 const kz=-cz-1.22;
 lgLean(0,kz,8,3.0,2.6,2.2,{col:0x8a4a2a});patchWall(-4,0,kz-1.5,3,2.4,PI/2);patchWall(4,0,kz-1.5,3,2.4,PI/2);patchWall(0,0,kz-3.0,8,2.3,0);
 box('iron',1.5,0,kz-2.3,1.4,.9,.8,jc(0x3a3430,.05));stovepipe(1.5,.9,kz-2.3,2.5);box('glow',1.1,.35,kz-1.88,.4,.3,.04,jc(0xff9a3a,.06));
 win(-2,1.0,kz-.02,1.6,.9,{lit:true});box('plank',-2,.95,kz-.28,1.8,.06,.5,jc(0x8a6a44,.06));door(3.3,0,kz-2.98,1.0,1.9,{step:false});
 barrel(-3.4,0,kz-2.4);barrel(-2.9,0,kz-2.8);sacks(-1,0,kz-2.5,4);
 // dinner bell on a post at the front corner
 cvPole(9.6,8.0,3.6,.1);beam('wood',[9.6,3.5,8.0],[9.6-.7,3.5,8.0],.08,jc(0x5c4630,.06),true,6);cone('iron',9.0,2.85,8.0,.24,.4,jc(0xb8902a,.05),10);sph('iron',9.0,2.75,8.0,.06,jc(0x3a3430,.05));beam('plain',[9.0,3.5,8.0],[9.0,3.2,8.0],.02,jc(0x3a3430,.05),true,3);
 lamp(-9.4,0,8.0,3.4);lamp(8.6,0,-8.0,3.4);junkPile(9.5,-6.5,1.2,6);tireStack(-9.5,-6.4,3);
 // front tarps/awnings along the dining side
 // sockets
 sock('awning',-3.4,2.5,cz+1.24,0,{w:6,d:2.2,drop:.7,h:1.8});sock('awning',5,2.6,cz+1.24,0,{w:2.4,d:1.4,drop:.5,h:2.1});
 sock('awning',-L/2-1.2,ry0,0,-PI/2,{w:2.6,d:1.6,drop:.5,h:ry0-.5});sock('awning',L/2+1.2,ry0,0,PI/2,{w:2.6,d:1.6,drop:.5,h:ry0-.5});
 sock('awning',-3,2.5,kz-.02,PI,{w:3.6,d:1.4,drop:.5,h:2.0});
 for(const sx of [-1,1]){cvPole(sx*(L/2+1.9),cz+1.6,5.4,.09);sock('banner',sx*(L/2+1.9),5.3,cz+1.65,0,{w:.8,h:2.4});}
 beam('iron',[0,ry0+2.4,0],[0,ry0+4.6,0],.06,jc(0x4a4038,.05),true,5);sock('flag',0,ry0+4.6,0,0,{w:1.4,h:.7});
 sock('emblem',0,ry0+1.0,cz+.6+.15,0,{w:1.3,h:1.3});sock('paint',-4,1.6,cz+1.24,0,{w:4,h:1.2});
 sock('sign',-1,2.45,cz+1.3,0,{w:3,h:.7,trade:'MESS'});}

// ================================================================== chief: big man's house
defBuilding({key:'chief',name:"Big man's house",seed:4430,tags:{type:['civic','single-family dwelling'],size:'large',core:'arcology bulkhead',materials:['ancient ceramic','container','bus','sheet palisade','junk trophies']},w:26,d:20,h:15,build:cvChief});
function cvChief(o){
 const bz=-5.5,bh=7.6,fz=bz+.45+.16;
 W(0,0,bz,0,()=>bulkhead({w:9,h:bh,th:.9,hatch:'door'}));
 // stacked containers flank the bulkhead: two high on the left, three high on the right (the lookout)
 const c=[0xa83a2c,0x2f7f8e,0xd8a020,0x4d6f3c,0x2f5f8f];if(o.v===1)c.reverse();
 lgBox(-8.2,0,bz,0,CT.L20,c[0],()=>{door(-1.4,.16,1.22,1.0,2.0,{step:true});win(.8,1.05,1.22,1.2,.9,{lit:true});porthole(2.3,1.4,1.22,.3);});
 lgBox(-8.2,CT.H,bz,0,CT.L20,c[1],()=>{win(-1.6,1.05,1.22,1.2,1.0,{shutters:true});porthole(.6,1.4,1.22,.34);porthole(1.9,1.4,1.22,.34);win(-.2,1.05,1.22,.01,.01);});
 lgBox(8.2,0,bz,0,CT.L20,c[2],()=>{win(-1.4,1.05,1.22,1.2,.9);door(1.2,.16,1.22,1.0,2.0,{step:true});});
 lgBox(8.2,CT.H,bz,0,CT.L20,c[3],()=>{porthole(-1.6,1.4,1.22,.32);win(.6,1.05,1.22,1.2,1.0,{lit:true});porthole(2.3,1.4,1.22,.32);});
 lgBox(8.6,CT.H*2,bz,0,CT.L20,c[4],()=>{win(-1.2,1.05,1.22,1.3,1.0,{lit:true});door(1.8,.16,1.22,.95,1.95,{step:false});});
 // throne balcony over a stair: deck across the bulkhead front, twin stairs, the throne at the back
 const ty=4.3,tz=fz+1.2;
 deck(0,ty,tz,8.6,2.4,{rail:['f','l','r'],posts:false});
 for(const px of [-4.0,-1.3,1.3,4.0])lgPost(px,fz+2.2,ty-.1,0,.18);for(const sx of [-1,1])beam('iron',[sx*4.0,ty-.5,fz+2.2],[sx*4.0,ty-.2,fz+.1],.1,jc(0x4a4038,.05));
 stairs(-3.4,0,fz+6.4,-3.4,ty,fz+2.5,1.4);stairs(3.4,0,fz+6.4,3.4,ty,fz+2.5,1.4);
 // throne: a tall chair of rebar, hubcaps and a car seat
 W(0,ty,fz+.55,0,()=>{box('sheet',0,0,0,1.3,.6,.9,jc(0x9a3a2c,.05));box('sheet',0,.6,-.4,1.3,1.9,.14,jc(0x9a3a2c,.05));cyl('iron',0,1.9,-.34,.55,.08,jc(0xdcd8cc,.04),14);
  for(const sx of [-1,1]){beam('iron',[sx*.65,.6,-.4],[sx*1.0,3.0,-.5],.07,jc(0x3a3430,.05),true,5);beam('iron',[sx*.65,1.3,-.4],[sx*1.3,2.4,-.5],.06,jc(0x3a3430,.05),true,5);beam('iron',[sx*.66,.6,.4],[sx*.66,1.1,.4],.06,jc(0x3a3430,.05),true,5);}});
 sph('glow',0,ty+3.1,fz+.35,.12,jc(0xffd890,.03));
 // gatehouse: a school bus forms the right side of the front wall; the palisade is tall sheet and posts with spiked tops
 const wz=9.4;W(6.5,0,wz,0,()=>bus({len:8.4}));
 for(const [x0,x1] of [[-11.2,-2.2],[9.2,11.2]]){fenceRun(x0,wz,x1,wz,3.4,{type:'sheet'});for(let x=x0;x<=x1+.01;x+=1.5)cvSpike(x,wz,3.9+rr(-.2,.2),0x4a4038);}
 for(const sx of [-1,1]){fenceRun(sx*11.2,wz,sx*11.2,bz+1,3.4,{type:'sheet'});}
 for(const gx of [-1.9,1.9]){cvPole(gx,wz,5.2,.2,0x4a3a2c);cyl('iron',gx,4.9,wz+.2,.5,.06,jc(0xdcd8cc,.04),14);sph('plain',gx,5.4,wz,.26,jc(0xe0d6c0,.03));}
 beam('wood',[-1.9,4.7,wz],[1.9,4.7,wz],.2,jc(0x4a3a2c,.05),true,7);
 // trophies: bonnets and hubcaps on spiked poles along the yard edge and at the stair
 for(const [x,z,h] of [[-6,7.6,4.2],[-3.6,8.2,3.6],[3.6,8.2,3.6],[-9.6,-.5,3.8],[10.0,-.5,3.8]]){cvSpike(x,z,h,0x4a4038);}
 for(const [x,z] of [[-6,7.6],[-9.6,-.5]]){box('sheet',x,2.6,z,1.3,.06,.9,jc(pick([0xa83a2c,0x2f5f8f,0xd8a020]),.05),.4,.3,0);}
 for(let k=0;k<5;k++)cyl('iron',-3.6,1.2+k*.32,8.2,.32-.02*k,.05,jc(k%2?0xdcd8cc:0xb8902a,.05),12);
 for(let k=0;k<5;k++)cyl('iron',3.6,1.2+k*.32,8.2,.32-.02*k,.05,jc(k%2?0xb8902a:0xdcd8cc,.05),12);
 for(const x of [-9.2,-8.4,-7.6])box('sheet',x,0,7.6+rr(-.2,.2),.9,.08,1.5,jc(pick([0x8a3a2c,0x4d6f3c,0x9a9a92]),.06),rr(-.3,.3),rr(.5,.9));
 for(let k=-4;k<=4;k++){cone('iron',k*1.0,bh+.3,bz,.09,.9+(k%2?.0:.5),jc(0x3a3430,.05),6);}
 for(const sx of [-1,1]){beam('iron',[sx*4.6,bh+.3,bz],[sx*5.4,bh+2.2,bz],.09,jc(0x3a3430,.05),true,5);beam('iron',[sx*4.2,bh+.3,bz],[sx*3.9,bh+2.6,bz],.07,jc(0x3a3430,.05),true,5);}
 sph('plain',0,bh+.75,bz+.2,.3,jc(0xe0d6c0,.03));
 // yard: fire barrel, junk, tyres
 for(let k=0;k<3;k++)barrel(-8.6+k*.5,0,3.0);tireRing(-9.4,4.6,.8,2,0,TAU);fire(-9.4,.44,4.6,.3);crate(9.6,0,2.4,.7,.2);sacks(9.4,0,3.4,4);junkPile(-9.5,-.4,1.4,7);lamp(5.6,0,4.6,3.8);lamp(-5.6,0,4.6,3.8);
 // roof lookout on the three-high stack: antenna, dish, tank, rail
 const ry=CT.H*3+.06;deck(8.6,ry,bz,6,2.3,{rail:['f','l','r','b'],posts:false});lgDish(10.0,ry,bz,-.4,.7);lgTank(6.9,ry,bz,.7,1.1,0x8a3a2c);antenna(8.6,ry,bz,3);
 lgSolar(-8.2,CT.H*2+.05,bz,2.6,1.4,0,.5);ladder(11.3,CT.H*2,bz+1.3,CT.H,0);
 // banner poles everywhere: along the balcony, on the stacks, at the gate
 for(const [x,y,z,h] of [[-4.0,ty,fz+2.2,3.6],[4.0,ty,fz+2.2,3.6],[-10.6,CT.H*2,bz+1.0,4.4],[-6.0,CT.H*2,bz+1.0,4.4],[6.0,CT.H*3,bz+1.0,4.4],[11.0,0,wz-.1,7]]){cvPole(x,z,y+h,.07);sock('banner',x,y+h-.05,z+.06,0,{w:.8,h:2.6});}
 for(const x of [-1.9,1.9])sock('flag',x,5.5,wz,0,{w:1.4,h:.8});
 beam('iron',[0,bh+.3,bz],[0,bh+3.6,bz],.07,jc(0x4a4038,.05),true,5);sock('flag',0,bh+3.6,bz,0,{w:1.6,h:.9});
 // sockets: awnings over the stack doors, emblems on the bulkhead, paint on the yard face
 sock('awning',-9.6,2.5,bz+1.24,0,{w:2.0,d:1.3,drop:.5,h:2.0});sock('awning',9.4,2.5,bz+1.24,0,{w:2.0,d:1.3,drop:.5,h:2.0});
 sock('awning',0,ty+2.6,fz+.14,0,{w:8.6,d:1.9,drop:.6,h:2.4});
 sock('emblem',0,bh-1.0,fz+.06,0,{w:2.0,h:2.0});sock('emblem',-6.2,bh-.5,fz+.06,0,{w:1.2,h:1.2});sock('paint',8.2,6.6,bz+1.24,0,{w:4.2,h:1.6});}

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
 beam('wood',[-3.4-.8,4.9,4.4],[-3.4+.8,4.9,4.4],.06,jc(0x5c4630,.06),true,5);sock('banner',-3.4-.5,4.9,4.5,0,{w:.7,h:1.7});
 sock('flag',-3.4,6.05,4.4,0,{w:1.1,h:.6});sock('flag',3.6,5.25,3.6,0,{w:1.0,h:.55});
 box('plank',0,3.1,-4.5,1.6,1.6,.1,jc(0x3a2a1c,.05),0,0,PI/4);cvPole(-.9,-4.55,3.0,.08);cvPole(.9,-4.55,3.0,.08);sock('emblem',0,3.85,-4.4,PI,{w:1.3,h:1.3});
 sock('paint',0,1.7,-R0*.6,PI,{w:2,h:1.2});}
