// prefix: lg
// ---------------------------------------------------------------- large dwellings: container stack, twin silo hall, bulkhead manor, tank-tower tenement
// ---- panel helpers (thin wrappers over the engine's plane4/roofP)
function lgP4(mk,p0,p1,pc,th,col){plane4(mk,p0,p1,pc,pc,th,col);}   // p0->p1 first edge, p0->pc second edge
function lgRoof(mk,x0,x1,zLow,yLow,zHigh,yHigh,th,col){roofP(mk,x0,x1,zLow,yLow,zHigh,yHigh,th,col);}
function lgGable(x,y,z,w,d,rise,o){o=o||{};const ov=o.ov===undefined?.4:o.ov,m=o.mat||'corr';const c1=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):jc(o.col,.05);const c2=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):jc(o.col2===undefined?o.col:o.col2,.05);
 const hw=w/2+ov,hd=d/2+ov*.7;lgRoof(m,x-hw,x+hw,z+hd,y,z,y+rise,.07,c1);lgRoof(m,x-hw,x+hw,z-hd,y,z,y+rise,.07,c2);
 for(const sx of [-1,1])poly('plank',[[x+sx*(w/2),y,z-d/2],[x+sx*(w/2),y,z+d/2],[x+sx*(w/2),y+rise*(d/2)/(d/2+ov*.7),z]],jc(pick(PAL.wood),.06),true);
 box('iron',x,y+rise-.02,z,w+ov*2,.1,.16,jc(0x5a4a3c,.05));return y+rise;}
function lgLean(x,zw,w,out,yHigh,yLow,o){o=o||{};const c=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):jc(o.col,.05);lgRoof(o.mat||'corr',x-w/2,x+w/2,zw+out,yLow,zw,yHigh,.06,c);
 const n=Math.max(2,Math.round(w/2.6)+1);for(let k=0;k<n;k++){const px=x-w/2+.1+k*(w-.2)/(n-1);beam('wood',[px,0,zw+out-.1],[px,yLow,zw+out-.1],.11,jc(0x5c4630,.06));}
 beam('wood',[x-w/2,yLow-.02,zw+out],[x+w/2,yLow-.02,zw+out],.1,jc(0x5c4630,.06));}
function lgTarp(x,y,z,w,d,drop,col){const c=col===undefined?P('tarp'):jc(col,.05);lgP4('cloth',[x-w/2,y,z],[x+w/2,y,z],[x-w/2,y-drop,z+d],.02,c);}
function lgSolar(x,y,z,w,d,ry,tilt){W(x,y,z,ry||0,()=>{const t=tilt===undefined?.5:tilt;const z0=-d/2*Math.cos(t);lgP4('glass',[-w/2,0,z0],[w/2,0,z0],[-w/2,d*Math.sin(t),d/2*Math.cos(t)],.05,jc(0x1a2a4a,.05));
 beam('iron',[-w/2,0,z0],[w/2,0,z0],.05,jc(0x8a8a86,.05));const n=Math.round(w/1.6);for(let k=0;k<=n;k++){const px=-w/2+k*w/n;beam('iron',[px,-.05,z0],[px,d*Math.sin(t),d/2*Math.cos(t)],.05,jc(0x8a8a86,.04));}
 for(const sx of [-1,1])beam('iron',[sx*w/2*.8,-.02,z0],[sx*w/2*.8,d*Math.sin(t)*.9,d/2*Math.cos(t)],.05,jc(0x4a4038,.05));});}
// container in its own frame: centre (x,y,z), turned ry. Local front face z=+1.22, ends x=+-len/2. fn(len) draws appliques in that local frame.
function lgBox(x,y,z,ry,len,col,fn){W(x,y,z,ry,()=>{container({len:len,col:col});if(fn)fn(len);});}
// steel post from the ground (or y0) up to y1
function lgPost(x,z,y1,y0,w){beam('iron',[x,y0||0,z],[x,y1,z],w||.12,jc(0x4a4038,.05),false);}
// roof water tank on a little stand
function lgTank(x,y,z,r,h,col){for(let k=0;k<4;k++){const a=k*PI/2+PI/4;beam('iron',[x+Math.cos(a)*r*.75,y,z+Math.sin(a)*r*.75],[x+Math.cos(a)*r*.75,y+.9,z+Math.sin(a)*r*.75],.09,jc(0x4a4038,.05));}
 box('plank',x,y+.9,z,r*2.1,.1,r*2.1,jc(0x5c4630,.06));cyl('sheet',x,y+1.0,z,r,h,jc(col||0x3a6a8a,.05),12,r,true);cyl('iron',x,y+1.0+h*.5,z,r+.04,.08,jc(0x3a3430,.05),12);
 cone('iron',x,y+1.0+h,z,r*.95,r*.3,jc(0x4a4038,.05),12);beam('iron',[x+r,y+1.0,z],[x+r+.5,y+.1,z],.05,jc(0x4a4038,.05),true,5);}
// satellite dish on a pole, aimed by ry
function lgDish(x,y,z,ry,r){r=r||.85;beam('iron',[x,y,z],[x,y+1.3,z],.08,jc(0x6a6a66,.05),true,6);W(x,y+1.5,z,ry,()=>{cylH('iron',0,0,0,r,.1,jc(0xdcd8cc,.04),'z',14);cylH('iron',0,0,.06,r*.97,.03,jc(0xb8b4a8,.04),'z',14);
 beam('iron',[0,0,0],[0,.4,r*.85],.03,jc(0x3a3430,.04),true,4);sph('iron',0,.4,r*.85,.09,jc(0x3a3430,.04));beam('iron',[0,-.3,-.05],[0,-1.5+0,-.05],.05,jc(0x4a4038,.05),true,5);});}
// wood arc rail (posts + top rail) for a curved balcony
function lgArcRail(cx,cz,R,a0,a1,y,h){const n=Math.max(3,Math.round(Math.abs(a1-a0)*R/1.0));const rc=jc(0x5c4630,.06);let p=null;
 for(let k=0;k<=n;k++){const a=a0+(a1-a0)*k/n;const q=[cx+Math.cos(a)*R,cz+Math.sin(a)*R];beam('wood',[q[0],y,q[1]],[q[0],y+h,q[1]],.06,rc,true,5);if(p)beam('wood',[p[0],y+h,p[1]],[q[0],y+h,q[1]],.06,rc);p=q;}}
// stripe of a bright band across a wall (colour blocking / patch): a thin panel on the face
function lgPatch(x,y,z,w,h,col,ry){box('sheet',x,y,z,w,h,.04,jc(col,.05),ry||0);}
// a fixed cloth awning of our own (over a window) with two brackets; sockets are separate
function lgHood(x,y,z,w,col){plane4('cloth',[x-w/2,y,z],[x+w/2,y,z],[x-w/2,y-.35,z+.9],[x+w/2,y-.35,z+.9],.02,jc(col,.06));}

// ================================================================== lg-stack: container stack
defBuilding({key:'lg-stack',name:'Container stack',seed:4210,tags:{type:['multi-family dwelling'],size:'large',core:'shipping container',materials:['container','steel stairs','sheet metal','plank']},w:22,d:18,h:14,build:lgStack});
function lgStack(o){
 let C=[0xd8a020,0xa83a2c,0x2f7f8e,0x4d6f3c,0xd8d4c8,0x2f5f8f,0xc45a30];if(o.v===1)C=C.slice().reverse();
 const y2=CT.H,y3=CT.H*2,y4=CT.H*3;
 // level 1: a 40 ft workshop box, and a 20 ft open-fronted shop bay
 lgBox(-3,0,-2,0,CT.L40,C[0],()=>{door(-4.5,.16,1.22,1.0,2.0,{step:true});win(-2.3,1.05,1.22,1.1,.9,{lit:o.v===1});porthole(0,1.5,1.22,.3);porthole(1.3,1.5,1.22,.3);win(3.4,1.05,1.22,.9,.9,{bars:true});lgPatch(-3.5,.3,1.23,3.2,.6,C[3]);});
 lgBox(6.5,0,-2,0,CT.L20,C[5],null);           // shop bay (drawn closed, then opened with counter and back shelves below)
 W(6.5,0,-2,0,()=>{box('plank',0,.16,1.14,5.4,.9,.5,jc(0x8a6a44,.06));box('plank',0,1.06,1.14,5.6,.08,.7,jc(0x5c4630,.06));
  for(const sx of [-2.7,2.7])box('iron',sx,.16,1.2,.16,2.2,.16,jc(0x4a4038,.05));box('glow',0,2.0,1.12,5.0,.12,.05,jc(0xf2c26a,.05));
  box('plank',-1.4,1.14,1.15,.5,.4,.4,P('wood'));sacks(1.2,1.14,1.15,4);});
 // level 2: a 40 ft box, and a 40 ft box turned across the front and cantilevered out
 lgBox(-1.5,y2,-2,0,CT.L40,C[1],()=>{for(const px of [-4.5,-2.5])porthole(px,1.4,1.22,.34);win(0.2,1.05,1.22,1.6,1.0,{shutters:true});door(3.6,.16,1.22,.95,1.95,{step:false});porthole(5.2,1.4,1.22,.3);lgPatch(-1,1.9,1.23,3,.5,C[4]);});
 lgBox(7,y2,1,PI/2,CT.L40,C[2],()=>{door(-2.0,.16,1.22,1.0,1.95,{step:false});win(0.4,1.1,1.22,1.2,.9);porthole(2.8,1.4,1.22,.32);porthole(4.0,1.4,1.22,.32);win(-4.6,1.1,1.22,.9,.9,{lit:true});lgPatch(3.5,.2,1.23,3,.9,C[0]);});
 // level 3
 lgBox(-2,y3,-2,0,CT.L40,C[4],()=>{win(-3.6,1.05,1.22,1.2,1.0,{shutters:true});win(-1.2,1.05,1.22,1.2,1.0);porthole(1.2,1.4,1.22,.36);porthole(2.6,1.4,1.22,.36);door(4.2,.16,1.22,.95,1.95,{step:false});lgPatch(-3,.15,1.23,4,.55,C[5]);});
 lgBox(7,y3,-2.5,PI/2,CT.L20,C[6],()=>{win(0,1.1,1.22,1.4,.9,{lit:o.v!==1});porthole(-1.7,1.4,1.22,.3);lgPatch(1.6,1.6,1.23,1.4,.7,C[3]);});
 // level 4: one 20 ft box on top (the penthouse)
 lgBox(-4,y4,-2,0,CT.L20,C[2],()=>{win(-1.3,1.1,1.22,1.3,1.0,{lit:true});door(1.2,.16,1.22,.95,1.95,{step:false});porthole(2.3,1.5,1.22,.3);});
 // ---- balconies with rails, steel stairs and landings
 deck(-6,y2,.1,5,1.7,{rail:['l','f']});                                   // level 2 balcony in front of the red box
 stairs(-.4,0,.1,-3.5,y2,.1,1.1);                                        // ground stair, rising left
 deck(-3,y3,.1,5,1.7,{rail:['r','f']});                                    // level 3 balcony
 stairs(-8.4,y2,.4,-5.5,y3,.4,1.1);                                       // upper stair rising right, off the level 2 balcony
 ladder(-3.6,y3,-.72,y4-y3,0);                                            // ladder up to the penthouse roof
 deck(-4.5,y4,-.4,2.4,1.1,{rail:['f','l'],posts:false});                   // a small perch in front of the penthouse door
 beam('iron',[-5.7,y4-.12,-.9],[-5.7,y4-.9,-.2],.06,jc(0x4a4038,.05),true,5);beam('iron',[-3.3,y4-.12,-.9],[-3.3,y4-.9,-.2],.06,jc(0x4a4038,.05),true,5);
 // east side: balcony wall-hung on the turned box, stair down, posts under the cantilever
 deck(9.0,y2,3.0,1.6,5.0,{rail:['r','b'],posts:false});stairs(9.0,0,8.3,9.0,y2,5.5,1.1);
 for(const pz of [.6,5.4])lgPost(9.7,pz,y2-.12,0,.1);
 lgPost(5.95,6.7,y2,0,.16);lgPost(8.05,6.7,y2,0,.16);beam('iron',[5.95,1.6,6.7],[6.6,y2,5.6],.07,jc(0x4a4038,.05));beam('iron',[8.05,1.6,6.7],[7.4,y2,5.6],.07,jc(0x4a4038,.05));
 // ---- rooftop: water tank, dish, solar, stovepipes, antenna
 lgTank(-2.4,y4+CT.H,-2,.85,1.3,0x3a6a8a);lgSolar(-5.2,y4+CT.H+.05,-2.4,2.6,1.4,0,.5);lgDish(.6,y3+CT.H,-2,.5);
 lgSolar(2.4,y3+CT.H+.05,-2,2.6,1.4,0,.5);stovepipe(-6.6,y3+CT.H,-2.7,1.3);antenna(2.8,y3+CT.H,-3,3.2);
 lgTarp(7,y3+CT.H+1.55,-2.5,3.4,2.6,.5,undefined,{poles:false});for(const sx of [-1.6,1.6])for(const dz of [-1.2,1.2])beam('wood',[7+sx,y3+CT.H,-2.5+dz],[7+sx,y3+CT.H+1.55,-2.5+dz],.07,jc(0x5c4630,.06),true,5);
 // hanging lamps and lines
 bottleString([-8.4,y2+1.9,.9],[-3.6,y2+1.9,.9],6);bottleString([-5.5,y3+1.9,.9],[-.6,y3+1.9,.9],6);
 // ---- ground clutter and workshop bay yard
 barrel(-9.8,0,-.6);barrel(-9.3,0,-.9);barrel(-9.5,0,.0);tireStack(-10.3,1.2,4);crate(4.4,0,3.6,.7,.4);crate(4.9,0,4.3,.6,-.2);
 lamp(2.3,0,2.4,3.6);waterButt(-8.8,1.4,-4.2,.6,1.0);junkPile(-9.5,-4.8,1.3,8);junkPile(10.5,-4.8,1.4,8);
 box('plank',6.5,0,4.0,3.0,.9,.7,jc(0x8a6a44,.06));box('iron',4.6,0,3.7,.16,1.5,.16,jc(0x4a4038,.05));box('iron',8.4,0,3.7,.16,1.5,.16,jc(0x4a4038,.05));
 // ---- SOCKETS: awnings on every level, banners on poles, emblem on the big box
 sock('awning',6.5,2.5,-.72,0,{w:5.6,d:1.7,drop:.6,h:1.9});                                  // over the shop bay
 sock('awning',-6.0,3.15,-.74,0,{w:3.6,d:1.5,drop:.5,h:2.65});                                // level 2 balcony (posts reach the deck..)
 sock('awning',-3.0,5.74,-.74,0,{w:3.4,d:1.4,drop:.45,h:1.7});
 sock('awning',-8.0,2.5,-.75,0,{w:1.6,d:1.1,drop:.4,h:2.1});                                  // ground door
 sock('awning',8.24,y2+2.4,3.0,PI/2,{w:2.2,d:1.4,drop:.5,h:1.9});                             // east balcony door
 beam('wood',[-8.4,y2,.9],[-8.4,y2+3.4,.9],.08,jc(0x5c4630,.06),true,6);sock('banner',-8.4,y2+3.3,.95,0,{w:.7,h:1.9});
 beam('wood',[10.2,0,7.2],[10.2,5.0,7.2],.08,jc(0x5c4630,.06),true,6);sock('banner',10.2,4.9,7.25,0,{w:.7,h:2});
 beam('iron',[.6,y3+CT.H,-2],[.6,y3+CT.H+3.2,-2],.06,jc(0x4a4038,.05),true,5);sock('flag',.6,y3+CT.H+3.2,-2,0,{w:1.1,h:.6});
 sock('emblem',2.0,y2+1.5,-.74,0,{w:1.1,h:1.1});sock('paint',2.4,y3+1.3,-.74,0,{w:3,h:1.6});}

// ================================================================== lg-twinsilo: two grain silos joined by a plank hall
defBuilding({key:'lg-twinsilo',name:'Twin silo hall',seed:4220,tags:{type:['multi-family dwelling'],size:'large',core:'grain silo',materials:['galvanised sheet','plank','corrugated roof','timber']},w:31,d:18,h:13,build:lgTwinSilo});
function lgTwinSilo(o){
 const r=4.2,sh=8.4,sx=8.7,sz=-1.2,hz=sz,hd=7.2,hy=4.0;
 for(const s of [-1,1]){W(s*sx,0,sz,0,()=>silo({r:r,h:sh,roofCol:s<0?0xb03c2a:0xa8382a,col:s<0?undefined:jc(0xa8aca8,.05)}));}
 // the hall: plinth, plank/patch walls with windows, gable roof of corrugated sheet
 box('conc',0,0,hz,17.6,.5,hd+.5,jc(0x8a8478,.05));
 const fz=hz+hd/2,bz=hz-hd/2;
 patchWall(0,.5,fz,17.4,hy-.5,0);patchWall(0,.5,bz,17.4,hy-.5,0);
 for(let k=0;k<5;k++){const x=-6.4+k*3.2;if(k===2){door(x,.75,fz+.06,1.4,2.3,{step:false,col:0x7a2e28});continue;}win(x,1.45,fz+.06,1.2,1.1,{shutters:k!==1,lit:o.v===1&&k===3});}
 for(let k=0;k<4;k++)win(-4.8+k*3.2,1.5,bz-.05,1.0,1.0,{});
 lgGable(0,hy,hz,17.2,hd,3.2,{ov:.5,col:jc(0xc0552f,.05)});
 // the gable in the roof: a dormer/vent bay and chimneys
 box('plank',0,hy+.1,fz+.15,4.0,1.4,.3,jc(0x9a7a52,.06));lgRoof('corr',-2.3,2.3,fz+1.3,hy+1.15,fz-.05,hy+2.0,.06,jc(0xb4b8b8,.05));win(0,hy+.2,fz+.3,1.4,1.0,{lit:true});
 box('earth',-4.4,hy+1.4,hz-1.4,.9,3.2,.9,jc(0xa8503a,.06));box('earth',-4.4,hy+4.6,hz-1.4,1.05,.18,1.05,jc(0x6a6660,.05));
 box('earth',4.4,hy+1.4,hz-1.4,.9,2.7,.9,jc(0xa8503a,.06));box('earth',4.4,hy+4.1,hz-1.4,1.05,.18,1.05,jc(0x6a6660,.05));stovepipe(1.2,hy+2.7,hz-1.6,1.2);stovepipe(7.0,hy+2.6,hz-1.0,1.1);
 // wraparound porch: rectangle in front of the hall, arcs around each silo front, rail all round, posts, stairs
 const py=.75;deck(0,py,fz+1.5,8.6,2.6,{col:0x9a7a52,rail:['f'],posts:false});
 for(const s of [-1,1]){const a0=s<0?PI*.22:0,a1=s<0?PI:PI*.78;sector('plank',s*sx,sz,r+.18,r+2.4,a0,a1,py-.14,py+.02,jc(0x9a7a52,.06));lgArcRail(s*sx,sz,r+2.35,a0,a1,py,1.0);
  for(let k=0;k<=4;k++){const a=a0+(a1-a0)*k/4;lgPost(s*sx+Math.cos(a)*(r+2.2),sz+Math.sin(a)*(r+2.2),py-.1,0,.13);}}
 for(const px of [-4.3,-1.5,1.5,4.3])lgPost(px,fz+2.7,py-.1,0,.13);
 stairs(0,0,fz+6.4,0,py,fz+2.8,2.0,{rail:true});
 // silo doors and windows (applique on the drum), balcony in the left silo
 for(const s of [-1,1]){for(const [a,y,lit] of [[PI/2+.55,1.2,0],[PI/2-.55,1.2,0],[PI/2+.3,4.8,1],[PI/2-.3,4.8,0],[PI/2+.85,5.6,0],[PI/2-.85,5.6,1]]){
  const px=s*sx+Math.cos(a)*(r+.02),pz=sz+Math.sin(a)*(r+.02);W(px,0,pz,PI/2-a,()=>{win(0,y,0,.9,1.0,{lit:!!lit&&o.v===1,shutters:y<2});});}
  W(s*sx+Math.cos(PI/2)*(r+.02),0,sz+r+.02,0,()=>{door(0,py,0,1.1,2.1,{step:false,col:s<0?0x2f5f8f:0x3b7f6e});});}
 // upper balcony on each silo: arc deck with rail, held by braces
 for(const s of [-1,1]){const a0=PI*.3,a1=PI*.7,yb=4.0;sector('plank',s*sx,sz,r+.05,r+1.35,a0,a1,yb-.14,yb,jc(0x9a7a52,.06));lgArcRail(s*sx,sz,r+1.3,a0,a1,yb,1.0);
  for(const a of [a0,(a0+a1)/2,a1])beam('wood',[s*sx+Math.cos(a)*(r+1.2),yb-.14,sz+Math.sin(a)*(r+1.2)],[s*sx+Math.cos(a)*(r+.1),yb-1.3,sz+Math.sin(a)*(r+.1)],.09,jc(0x5c4630,.06));}
 // yard
 barrel(-12.4,0,2.8);barrel(-12,0,3.4);sacks(12.4,.0,3.6,5,.4);tireStack(13,1.5,3);waterButt(-9.6,1.4,-7.2,.65,1.1);junkPile(11.5,-7,1.4,8);crate(-11.6,0,5.0,.7,.2);lamp(-6.4,py,fz+2.2,3.2);lamp(6.4,py,fz+2.2,3.2);
 // sockets
 for(const s of [-1,1]){const th=sh+r*.42+.15+.35+.6;beam('iron',[s*sx,sh+r*.42+.3,sz],[s*sx,th,sz],.05,jc(0x4a4038,.05),true,5);sock('flag',s*sx,th+.2,sz,0,{w:1.3,h:.7});}
 sock('awning',0,py+2.5,fz+.1,0,{w:2.4,d:1.4,drop:.5,h:py+2.0});sock('awning',-6.4,py+2.5,fz+.1,0,{w:2.6,d:1.4,drop:.5,h:py+2.0});sock('awning',6.4,py+2.5,fz+.1,0,{w:2.6,d:1.4,drop:.5,h:py+2.0});
 for(const px of [-4.3,4.3]){beam('wood',[px,py,fz+2.7],[px,py+3.6,fz+2.7],.09,jc(0x5c4630,.06),true,6);sock('banner',px,py+3.5,fz+2.75,0,{w:.7,h:2.2});}
 sock('emblem',0,hy+.8,fz+.34,0,{w:1.2,h:1.2});sock('paint',-sx,7.0,sz+r+.02,0,{w:2.4,h:1.6});sock('paint',sx,7.0,sz+r+.02,0,{w:2.4,h:1.6});}

// ================================================================== lg-bulkhead: an Ancient bulkhead as the facade, junk wings around a tyre courtyard
defBuilding({key:'lg-bulkhead',name:'Bulkhead manor',seed:4230,tags:{type:['multi-family dwelling'],size:'large',core:'arcology bulkhead',materials:['ancient ceramic','container','plank','tyres','sheet metal']},w:24,d:20,h:13,build:lgBulkhead});
function lgBulkhead(o){
 const bz=-3.4,bh=9.6,fz=bz+.45+.16;
 W(0,0,bz,0,()=>bulkhead({w:14,h:bh,th:.9,hatch:o.v===1?'door':'round'}));
 // wings: west two-high 40 ft boxes turned to run front-back, east one box; plank rooms behind
 const Cw=[0xa83a2c,0x2f7f8e,0xd8a020,0x4d6f3c];
 lgBox(-8.6,0,2.2,PI/2,CT.L40,Cw[0],()=>{door(-4,.16,1.22,1.0,2.0,{step:true});win(-1.6,1.05,1.22,1.2,.9,{lit:true});porthole(1,1.4,1.22,.32);porthole(2.2,1.4,1.22,.32);win(4.4,1.05,1.22,.9,.9,{bars:true});});
 lgBox(-8.6,CT.H,2.2,PI/2,CT.L40,Cw[1],()=>{win(-3.4,1.05,1.22,1.2,1.0,{shutters:true});porthole(-1,1.4,1.22,.34);porthole(.4,1.4,1.22,.34);win(2.6,1.05,1.22,1.2,1.0);door(4.6,.16,1.22,.95,1.95,{step:false});});
 // east box turned the other way so its front faces west into the yard
 lgBox(8.6,0,1.0,-PI/2,CT.L40,Cw[2],()=>{door(-4,.16,1.22,1.0,2.0,{step:true});win(-1.6,1.05,1.22,1.2,.9);porthole(1,1.4,1.22,.32);porthole(2.2,1.4,1.22,.32);win(4.4,1.05,1.22,.9,.9,{lit:o.v===1});});
 // sheet lean-tos against the east box and the bulkhead, plank rooms behind
 lgLean(8.6,-5.2,2.9,3.2,3.2,2.6,{col:jc(0x2f5f8f,.05)});
 patchWall(0,0,-8.6,12,3.2,0);patchWall(-6,0,-6,5.2,3.2,PI/2);patchWall(6,0,-6,5.2,3.2,PI/2);
 lgGable(0,3.2,-6.2,12.2,5.4,1.6,{ov:.4,col:jc(0x9a7a52,.05)});
 win(-3,1.2,-5.7,1.0,1.0,{});door(2,0,-8.55,1.1,2.1,{step:false});
 // grand steps to the hatch, junk patches bolted on the ceramic, a plank balcony with a door on the right
 box('conc',0,0,fz+1.0,7.5,.18,2.0,jc(0xb0aca2,.04));box('conc',0,0,fz+.6,6.2,.36,1.2,jc(0xb8b4aa,.04));
 lgPatch(-5.2,2.2,fz+.14,1.6,1.1,0x2f7f8e);lgPatch(-4.6,5.6,fz+.14,1.2,1.6,0xc45a30);lgPatch(5.6,6.4,fz+.14,1.8,1.0,0xd8a020);lgPatch(3.4,1.6,fz+.14,1.3,.9,0x4d6f3c);
 deck(5.2,3.4,fz+.9,3.2,1.5,{rail:['f','l','r'],posts:true});door(5.2,3.4,fz+.06,1.0,2.0,{step:false,col:0x2f5f8f});stairs(7.6,0,fz+3.2,6.7,3.4,fz+1.5,1.1);
 lgHood(-5.2,3.5,fz+.14,1.9,0xc45a30);
 // patch bulkhead flanks: plank bays lashed to the ceramic
 patchWall(-7.4,.3,bz+.45,1.6,4.4,PI/2);patchWall(7.4,.3,bz+.45,1.6,4.4,PI/2);
 // tyre and earth courtyard wall across the front with a gate gap, plus a low wall to the wings
 const wz=10.0;tireWall(-7.2,wz,-1.9,wz,5);tireWall(1.9,wz,7.2,wz,5);
 for(const s of [-1,1]){beam('wood',[s*1.9,0,wz],[s*1.9,3.2,wz],.16,jc(0x5c4630,.06),true,7);}beam('wood',[-1.9,3.1,wz],[1.9,3.1,wz],.14,jc(0x5c4630,.06),true,7);
 // courtyard fittings: fire, bench, well of tyres, planters
 fire(-1.5,.02,4.5,.6);tireRing(3.6,5.4,1.1,3,0,TAU);cyl('plain',3.6,.5,5.4,.9,.22,jc(0x3a6a70,.04),12);
 for(const sx of [-3,-.2])box('plank',sx,.32,7.0,1.6,.1,.4,P('woodD'));
 tireRing(-4.4,8.4,.8,2,0,TAU);sph('plain',-4.4,.5,8.4,.58,jc(0x4d6f3c,.1),.6);tireRing(5.2,8.6,.8,2,0,TAU);sph('plain',5.2,.5,8.6,.58,jc(0x5a7a3c,.1),.6);
 // ---- stair up to the roof terrace on the west wing, terrace with rail, tank, dish
 const ty=CT.H*2+.06;deck(-8.0,ty,2.2,4.6,9.6,{rail:['l','f','b','r'],posts:false});
 lgPost(-5.9,-1.8,ty-.1,0);lgPost(-5.9,2.0,ty-.1,0);stairs(-4.9,0,10.0,-4.9,ty,4.2,1.1);
 lgTank(-9.2,ty,-1.6,.8,1.3,0x8a4a3a);lgDish(-9.0,ty,5.0,.5);lgSolar(-9.2,ty+.05,3.6,2.6,1.4,0,.5);stovepipe(-9.3,CT.H*2,2.6,1.2);
 lgTarp(-7.2,ty+2.3,3.2,3.2,2.8,.45,undefined,{poles:false});for(const dx of [-1.5,1.5])for(const dz of [-1.3,1.3])beam('wood',[-7.2+dx,ty,3.2+dz],[-7.2+dx,ty+2.3,3.2+dz],.07,jc(0x5c4630,.06),true,5);
 // east wing junk
 junkPile(11.0,-4.5,1.5,9);barrel(10.6,0,5.4);barrel(11.1,0,5.9);tireStack(10.8,7.5,4);crate(5.6,0,6.0,.7,.3);lamp(-5.6,0,8.4,3.4);lamp(5.6,0,8.4,3.4);
 // sockets: emblem on the bulkhead face, banners on poles by the gate, awnings over wing doors
 sock('emblem',-4.6,bh*.66,fz+.05,0,{w:1.5,h:1.5});sock('emblem',4.6,bh*.66,fz+.05,0,{w:1.5,h:1.5});sock('paint',0,bh-1.0,fz+.05,0,{w:6,h:1.2});
 for(const s of [-1,1]){beam('wood',[s*1.9,3.2,wz],[s*1.9,6.6,wz],.09,jc(0x5c4630,.06),true,6);sock('banner',s*1.9,6.5,wz+.07,0,{w:.9,h:3});}
 beam('iron',[0,bh+.3,bz],[0,bh+3.2,bz],.07,jc(0x4a4038,.05),true,5);sock('flag',0,bh+3.2,bz,0,{w:1.4,h:.8});
 sock('awning',-7.36,2.55,2.2-2.6,PI/2,{w:1.6,d:1.3,drop:.5,h:2.05});sock('awning',7.36,2.55,3.2-2.6+2.0,-PI/2,{w:1.6,d:1.3,drop:.5,h:2.05});
 sock('awning',2,2.65,-8.5,PI,{w:2.4,d:1.4,drop:.5,h:2.15});sock('awning',5.2,5.9,fz+.1,0,{w:3.2,d:1.4,drop:.5,h:2.0});}

// ================================================================== lg-tanktower: a vertical tank wrapped in plank storeys
defBuilding({key:'lg-tanktower',name:'Tank-tower tenement',seed:4240,tags:{type:['multi-family dwelling'],size:'large',core:'storage tank',materials:['tank','plank','sheet metal','pipes']},w:18,d:16,h:21,build:lgTankTower});
function lgTankTower(o){
 const tr=4.0,th=12.4,st=3.1,tx=-4.2,tz=-.6;
 W(tx,0,tz,0,()=>{tankV({r:tr,h:th,col:jc(0x6a8f7a,.04)});});
 // the tank's own hatch, ladder and bands show on the left half
 ladder(tx-tr+.3,.3,tz+1.2,12.3,PI/2+.5);
 const cols=[0xa8503a,0x8a4a2a,0xb8a070,0x9a3a2c,0x6a7a78];if(o.v===1)cols.reverse();
 for(let s=0;s<5;s++){const y=.5+s*st,j=s*.14,x0=-1.2-j*.3,x1=6.6+j,z0=-4.4-j,z1=4.8+j*1.2,h=st-.15;const col=cols[s];
  box('plank',(x0+x1)/2,y-.02,(z0+z1)/2,x1-x0,.22,z1-z0,jc(0x4a3a2c,.06));
  patchWall((x0+x1)/2,y+.2,z1,x1-x0,h-.2,0,{col:col});patchWall(x1,y+.2,(z0+z1)/2,z1-z0,h-.2,PI/2,{col:col});
  sheetWall((x0+x1)/2,y+.2,z0,x1-x0,h-.2,0,{col:col});sheetWall(x0,y+.2,(z0+z1)/2,z1-z0,h-.2,PI/2,{col:col});
  for(let k=0;k<3;k++){const wx=x0+1.3+k*(x1-x0-2.6)/2;if(s===0&&k===1){door(wx,y+.2,z1+.05,1.0,2.0,{step:true});continue;}win(wx,y+1.0,z1+.05,.9,1.05,{lit:o.v===1&&(k+s)%3===0,shutters:(k+s)%2===0});}
  for(let k=0;k<3;k++){const wz=z0+1.8+k*(z1-z0-3.6)/2;W(x1+.05,0,wz,PI/2,()=>win(0,y+1.0,0,.9,1.05,{lit:(k+s)%3===1}));}
  if(s>0){deck((x0+x1)/2,y+.06,z1+.85,5.4,1.5,{rail:['f','l','r'],posts:false});for(const px of [x0+1.4,x1-1.4])beam('wood',[px,y-.8,z1-.05],[px,y+.1,z1+1.5],.08,jc(0x5c4630,.06));}
  lgRoof('corr',x0-.2,x1+.2,z1+.5,y+h+.05,z1-.1,y+h+.55,.05,jc(pick([0xd06a30,0xa8acac,0x2f5f8f,0xc99a2e]),.05));
  // curved plank wrap round the front-left of the tank on storeys 2..5
  if(s>=1){const R=tr+.9,a0=PI*.62,a1=PI*1.18;sector('plank',tx,tz,tr+.05,R,a0,a1,y,y+h,jc(col,.06));sector('plank',tx,tz,R-.02,R+.12,a0,a1,y+h,y+h+.12,jc(0x4a3a2c,.06));
   sector('plank',tx,tz,tr+.05,R+.55,a0,a1,y-.16,y,jc(0x4a3a2c,.06));
   for(const a of [PI*.75,PI*.95,PI*1.12]){const px=tx+Math.cos(a)*(R+.03),pz=tz+Math.sin(a)*(R+.03);W(px,0,pz,PI/2-a,()=>win(0,y+.95,0,.8,1.0,{lit:(s+Math.round(a*3))%2===0}));}}
 }
 // top: tenement roof, tank cap ring, water tank, chimneys
 const ty=.5+5*st;box('plank',(6.6-1.2)/2+.2,ty-.02,.2,9.4,.2,10.4,jc(0x4a3a2c,.06));lgGable(2.6,ty+.1,.2,9.2,9.6,2.3,{ov:.4,col:jc(0xb8502c,.05)});
 lgTank(2.4,ty+2.3,-.4,1.2,1.7,0x3a6a8a);
 box('earth',5.2,ty+.6,-2.4,.9,3.4,.9,jc(0xa8503a,.06));box('earth',5.2,ty+4.0,-2.4,1.05,.16,1.05,jc(0x5a5650,.05));stovepipe(-.4,ty+1.6,2.4,1.4);stovepipe(4.4,ty+2.0,3.0,1.1);
 // catwalk ring with rail on the tank top and a pipe cluster
 sector('plank',tx,tz,tr+.05,tr+.9,PI*1.15,PI*2.2,th-.25,th-.12,jc(0x6a5238,.06));lgArcRail(tx,tz,tr+.85,PI*1.15,PI*2.2,th-.12,.95);
 for(const a of [PI*1.2,PI*1.6,PI*2.1])beam('iron',[tx+Math.cos(a)*(tr+.7),th-.25,tz+Math.sin(a)*(tr+.7)],[tx+Math.cos(a)*(tr+.05),th-1.4,tz+Math.sin(a)*(tr+.05)],.07,jc(0x4a4038,.05));
 // external pipes, in colour, up the tank and the right side
 pipe('iron',[[tx-tr-.4,0,tz+.4],[tx-tr-.4,5,tz+.4],[tx-tr-.1,5.4,tz-.6],[tx-tr-.1,th-.6,tz-.6],[tx-tr-.5,th-.3,tz-.6]],.16,jc(0xc45a30,.05));
 pipe('iron',[[tx-1,.5,tz-tr-.35],[tx-1,th-.4,tz-tr-.35],[tx+.6,th-.2,tz-tr-.3]],.13,jc(0xc99a2e,.05));
 pipe('iron',[[7.7,0,-2.5],[7.7,5.5,-2.5],[8.0,5.5,-3],[8.0,12,-3],[8.2,12,-3],[8.2,ty-.4,-3]],.17,jc(0x6a5a4c,.05));
 pipe('iron',[[-.4,.6,6.6],[-.4,4.8,6.6],[3,4.8,6.7],[3,9.6,6.7]],.11,jc(0x5a5a56,.05));
 for(const [px,py,pz] of [[8.0,8,-3],[tx-tr-.4,3,tz+.4],[3,7,6.7]])cyl('iron',px,py,pz,.26,.14,jc(0x3a3430,.05),8);
 // stair tower: open steel stair zigzagging up the right-front corner
 for(let s=0;s<4;s++){const y=.5+s*st;const fw=(s%2===0);stairs(9.0,y,fw?7.6:3.0,9.0,y+st,fw?3.0:7.6,1.0);deck(9.0,y+st,fw?2.5:8.2,1.6,1.1,{posts:false,rail:fw?['l','r','b']:['l','r','f']});}
 for(const pz of [2.2,8.4])lgPost(9.8,pz,.5+4*st-.1,0,.14);lgPost(8.2,2.2,.5+4*st-.1,0,.14);
 // ground: tyre plinth wall, crates, barrels
 tireWall(-7.6,4.6,-2.6,4.6,2);barrel(5.6,0,7.4);barrel(6.1,0,7.9);crate(2.4,0,7.6,.7,.3);tireStack(-3.5,6.4,3);lamp(4.2,0,7.0,3.4);junkPile(-8,-6.5,1.4,8);waterButt(8.6,1.8,-6,.6,1.0);
 // sockets
 sock('awning',2.6,2.65,lgZ1(),0,{w:2.4,d:1.4,drop:.5,h:2.15});
 for(let s=1;s<5;s+=2)sock('awning',2.7,.5+s*st+2.7,4.8+s*.14*1.2+1.7,0,{w:4.4,d:1.3,drop:.5,h:1.5});
 for(const px of [-.6,7.6]){beam('wood',[px,ty,6.4],[px,ty+4.4,6.4],.09,jc(0x5c4630,.06),true,6);sock('banner',px,ty+4.3,6.45,0,{w:.75,h:2.4});}
 beam('iron',[2.6,ty+2.3,-3],[2.6,ty+5.4,-3],.06,jc(0x4a4038,.05),true,5);sock('flag',2.6,ty+5.4,-3,0,{w:1.2,h:.7});
 sock('emblem',4.6,.5+3*st+1.7,4.8+.14*3*1.2+.1+.04,0,{w:1.2,h:1.2});sock('paint',1.0,.5+2*st+1.4,4.8+.14*2*1.2+.1,0,{w:2.6,h:1.4});}
function lgZ1(){return 5.06;}
