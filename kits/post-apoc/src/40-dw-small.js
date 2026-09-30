// prefix: dw
// ---------------------------------------------------------------- small dwellings: 7 types (4x fragments: 40 dw-small)
// EXEMPLAR FRAGMENT. A dwelling = one reclaimed CORE (container / silo / bus / tank ...) + lashed-on ADDITIONS (plank room, lean-to, deck,
// tyre wall ...) + yard junk + SOCKETS for the culture. Never name a culture: declare sockets, the pack fills them.
defBuilding({key:'dw-box',name:'Box house',seed:4010,tags:{type:['single-family dwelling'],size:'small',core:'shipping container',materials:['container','plank','sheet metal']},w:14,d:8,h:4.8,build:dwBox});
function dwBox(o){
 const cx=1.3,cz=-.9,fz=cz+CT.W/2;                        // container centre, front face z
 W(cx,0,cz,0,()=>container({len:CT.L20}));
 door(cx-1.3,.16,fz,1.0,2.0);win(cx+.7,1.05,fz,1.1,.8,{lit:o.v===1});win(cx+2.2,1.05,fz,.8,.8,{bars:true});
 // the plank room added to the left end: patchwork walls, a lean roof of galvanised sheet, its own door
 const rx0=cx-CT.L20/2-3.0,rx1=cx-CT.L20/2;                   // room spans rx0..rx1
 box('plank',(rx0+rx1)/2,0,cz,rx1-rx0,.16,CT.W,jc(0x6a5a44,.08));
 patchWall((rx0+rx1)/2,.16,cz-CT.W/2,rx1-rx0,2.1,0);patchWall(rx0,.16,cz,CT.W,2.1,PI/2);patchWall((rx0+rx1)/2,.16,cz+CT.W/2,rx1-rx0,2.1,0);
 door((rx0+rx1)/2,.16,cz+CT.W/2+.02,.9,1.9,{step:true});
 roofP('corr',rx0-.3,rx1+.05,cz+CT.W/2+.5,2.0,cz-CT.W/2-.3,2.45,.07,P('galv'));
 // roof furniture on the container: solar panel, stovepipe, a water butt
 solar(cx+1.0,CT.H+.02,cz,3.0,1.6,0,.5);stovepipe(cx-2.4,CT.H,cz-.3,1.4);waterButt(cx+CT.L20/2+.9,.9,cz-.6,.55,.9);
 // yard: barrels, tyre seats, a crate, a lamp
 barrel(cx+3.9,0,cz+.8);barrel(cx+4.3,0,cz+.3);crate(cx+3.9,0,cz+1.6,.6,.3);tireStack(rx0-.9,cz+1.2,3);tire(rx0-.9,.12,cz-.4,TYR.R,TYR.t);
 lamp(cx+3.0,0,fz+1.6,2.9);junkPile(rx0-1.5,cz-2.4,1.2,7);
 // SOCKETS: a canopy over the door, a banner on a pole at the corner, an emblem on the front, a livery panel on the end
 sock('awning',cx-1.3,2.5,fz,0,{w:1.8,d:1.2,drop:.5,h:2.5});
 beam('wood',[cx+3.6,0,fz+.9],[cx+3.6,3.4,fz+.9],.08,jc(0x5c4630,.06),true,6);sock('banner',cx+3.6,3.4,fz+.95,0,{w:.7,h:1.9});
 sock('emblem',cx+2.2,1.85,fz,0,{w:.7,h:.7});
 sock('paint',cx+CT.L20/2,1.3,cz,PI/2,{w:2.2,h:2});}
defBuilding({key:'dw-silo',name:'Silo house',seed:4020,tags:{type:['single-family dwelling'],size:'small',core:'grain silo',materials:['galvanised sheet','plank','tyres']},w:11,d:10,h:8.6,build:dwSilo});
function dwSilo(o){
 const r=2.7,h=6.2;silo({r:r,h:h,roofCol:0xc45a30});
 // windows and door punched into the drum as framed applique on its skin
 const ang=[[0,1],[.7,2],[-.7,2],[PI/2,2.1]];
 W(0,0,r+.02,0,()=>{door(0,.45,0,1.0,2.0,{step:false});});
 for(const [a,lv] of [[.6,1],[-.6,1],[.6,2],[-.6,2],[PI,2]]){const y=lv===1?.9:3.4;W(Math.sin(a)*(r+.02),0,Math.cos(a)*(r+.02),a,()=>{win(0,y,0,.9,.9,{shutters:lv===2,lit:o.v===1&&lv===2});});}
 // a plank porch across the front with a lean roof of sheet, stair, rail
 deck(0,.5,r+1.6,6.4,2.8,{rail:['f','l','r'],posts:false});stairs(1.8,0,r+3.2,1.8,.5,r+2.6,1.2);
 for(const sx of [-1,1])for(const sz of [.6,2.9]){beam('wood',[sx*3.0,.45,r+sz],[sx*3.0,3.0,r+sz],.11,jc(0x5c4630,.06));}
 roofP('corr',-3.4,3.4,r+3.2,2.9,r-.2,3.5,.07,P('galv'));
 // a tyre-and-earth raised bed, water butt and yard
 tireRing(-4.6,r+1.6,.72,2,0,TAU);sph('plain',-4.6,.5,r+1.6,.5,jc(0x4d6f3c,.1),.6);
 waterButt(-3.0,1.2,-r-.8,.6,1.0);ladder(r*.95*Math.sin(.9),0,-r*.95*Math.cos(.9)-.1,h,PI+.9);
 barrel(3.8,0,r+.4);barrel(4.2,0,r+.9);lamp(-3.6,0,r+.9,3.0);
 sock('awning',0,2.75,r+.02,0,{w:2.0,d:1.3,drop:.55,h:2.5});
 beam('wood',[3.6,0,r+2.9],[3.6,4.0,r+2.9],.08,jc(0x5c4630,.06),true,6);sock('banner',3.6,4.0,r+2.95,0,{w:.7,h:2});
 sock('emblem',0,5.0,r+.03,0,{w:.9,h:.9});}
