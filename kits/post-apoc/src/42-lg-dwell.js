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
 cone('iron',x,y+1.0+h,z,r*.95,r*.3,jc(0x4a4038,.05),12);beam('iron',[x+r,y+1.0,z],[x+r+.5,y+.03,z],.05,jc(0x4a4038,.05),true,5);}
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

// awning bracketed to the wall: the socket draws only the cloth (short stub posts), steel braces carry it. Anchor = wall face at the top edge.
function lgAwn(x,y,z,ry,w,d,drop,o){o=o||{};W(x,y,z,ry||0,()=>{sock('awning',0,0,0,0,{w:w,d:d,drop:drop,h:.2});const ic=jc(0x4a4038,.05);
 for(const sx of [-1,1]){const px=sx*(w/2-.08);beam('iron',[px,-drop-.95,-.02],[px,-drop-.12,d-.08],.05,ic,true,5);box('iron',px-.05,-1.0-drop,-.1,.1,.1,.1,ic);}
 beam('iron',[-w/2+.08,-.06,-.03],[w/2-.08,-.06,-.03],.05,ic,true,5);});}

// ================================================================== lg-stack: container stack
defBuilding({key:'lg-stack',name:'Container stack',seed:4210,tags:{type:['multi-family dwelling'],size:'large',core:'shipping container',materials:['container','steel stairs','sheet metal','plank']},w:22,d:18,h:14,build:lgStack});
function lgStack(o){
 let C=[0xd8a020,0xa83a2c,0x2f7f8e,0x4d6f3c,0xd8d4c8,0x2f5f8f,0xc45a30];if(o.v===1)C=C.slice().reverse();
 const y2=CT.H,y3=CT.H*2,y4=CT.H*3,T={steel:true};
 // level 1: a 40 ft workshop box, and a 20 ft open-fronted shop bay
 lgBox(-3,0,-2,0,CT.L40,C[0],()=>{door(-4.5,.16,1.22,1.0,2.0,{step:true});win(-2.3,1.05,1.22,1.1,.9,{lit:o.v===1});porthole(0,1.5,1.22,.3);porthole(1.3,1.5,1.22,.3);win(3.4,1.05,1.22,.9,.9,{bars:true});lgPatch(-3.5,.3,1.23,3.2,.6,C[3]);});
 lgBox(6.5,0,-2,0,CT.L20,C[5],null);
 W(6.5,0,-2,0,()=>{box('plank',0,.16,1.14,5.4,.9,.5,jc(0x8a6a44,.06));box('plank',0,1.06,1.14,5.6,.08,.7,jc(0x5c4630,.06));
  for(const sx of [-2.7,2.7])box('iron',sx,.16,1.2,.16,2.2,.16,jc(0x4a4038,.05));box('glow',0,2.0,1.12,5.0,.12,.05,jc(0xf2c26a,.05));
  box('plank',-1.4,1.14,1.15,.5,.4,.4,P('wood'));sacks(1.2,1.14,1.15,4);});
 // level 2: door opens on the level-2 balcony (world x -8.5..-3.5); a 40 ft box turned across the front and cantilevered out
 lgBox(-1.5,y2,-2,0,CT.L40,C[1],()=>{door(-3.0,.16,1.22,1.0,1.95,{step:false});porthole(-5.5,1.4,1.22,.32);porthole(-4.4,1.4,1.22,.32);win(.5,1.05,1.22,1.2,1.0,{shutters:true});porthole(3.4,1.4,1.22,.3);});
 lgBox(7,y2,1,PI/2,CT.L40,C[2],()=>{door(-2.0,.16,1.22,1.0,1.95,{step:false});win(0.4,1.1,1.22,1.2,.9);porthole(2.8,1.4,1.22,.32);porthole(4.0,1.4,1.22,.32);win(-4.6,1.1,1.22,.9,.9,{lit:true});lgPatch(3.5,.2,1.23,3,.9,C[0]);});
 // level 3: door opens on the level-3 balcony (world x -5.5..-.5)
 lgBox(-2,y3,-2,0,CT.L40,C[4],()=>{win(-4.6,1.05,1.22,1.2,1.0,{shutters:true});door(-1.5,.16,1.22,.95,1.95,{step:false});win(1.0,1.05,1.22,1.2,1.0);porthole(2.8,1.4,1.22,.36);porthole(4.0,1.4,1.22,.36);lgPatch(-3,.15,1.23,4,.55,C[5]);});
 lgBox(7,y3,-2.5,PI/2,CT.L20,C[6],()=>{win(0,1.1,1.22,1.4,.9,{lit:o.v!==1});porthole(-1.7,1.4,1.22,.3);lgPatch(1.6,1.6,1.23,1.4,.7,C[3]);});
 // level 4: penthouse; door opens on its perch
 lgBox(-4,y4,-2,0,CT.L20,C[2],()=>{door(-.5,.16,1.22,.95,1.95,{step:false});win(1.8,1.1,1.22,1.1,1.0,{lit:true});porthole(-2.0,1.5,1.22,.3);});
 // ---- balconies, steel stairs and landings: every flight ends on a deck edge at the floor height of a door
 deck(-6,y2,.1,5,1.7,{rail:['l','f']});                                          // level 2 balcony, posts to the ground
 stairs(-.4,0,.1,-3.5,y2,.1,1.1,T);                                              // ground -> level 2 (top tread ends at the deck edge x=-3.5)
 deck(-3,y3,.1,5,1.7,{rail:['r','f'],posts:false});                              // level 3 balcony, carried by wall brackets and two posts
 for(const bx of [-5.2,-.8])beam('iron',[bx,y3-.95,-.76],[bx,y3-.12,.85],.07,jc(0x4a4038,.05));
 lgPost(-.65,.85,y3-.12,0,.12);lgPost(-5.35,.85,y3-.12,y2,.12);
 stairs(-8.4,y2,.1,-5.5,y3,.1,1.1,T);                                            // level 2 -> level 3 (top tread ends at the deck edge x=-5.5)
 ladder(-3.2,y3,-.72,y4-y3,0);deck(-4.5,y4,-.4,2.4,1.1,{rail:['f','l'],posts:false});   // ladder to the penthouse perch
 for(const bx of [-5.5,-3.5])beam('iron',[bx,y4-.95,-.8],[bx,y4-.12,.1],.06,jc(0x4a4038,.05),true,5);
 // east side: balcony on the turned box, steel stair down to the yard, brackets and posts
 deck(9.0,y2,3.0,1.6,5.0,{rail:['r','b'],posts:false});stairs(9.0,0,8.3,9.0,y2,5.5,1.1,T);
 for(const pz of [.6,5.4])lgPost(9.7,pz,y2-.12,0,.1);for(const bz of [1.0,3.0,5.0])beam('iron',[8.22,y2-.95,bz],[9.7,y2-.12,bz],.06,jc(0x4a4038,.05),true,5);
 lgPost(5.95,6.7,y2,0,.16);lgPost(8.05,6.7,y2,0,.16);beam('iron',[5.95,1.6,6.7],[6.6,y2,5.6],.07,jc(0x4a4038,.05));beam('iron',[8.05,1.6,6.7],[7.4,y2,5.6],.07,jc(0x4a4038,.05));
 // ---- rooftop: water tank, dish, solar, stovepipes, antenna, a tarp on four posts (all on roofs)
 lgTank(-2.4,y4+CT.H,-2,.85,1.3,0x3a6a8a);lgSolar(-5.2,y4+CT.H+.05,-2.4,2.6,1.4,0,.5);lgDish(.6,y3+CT.H,-2,.5);
 lgSolar(2.4,y3+CT.H+.05,-2,2.6,1.4,0,.5);stovepipe(-7.6,y3+CT.H,-2.7,1.3);antenna(2.8,y3+CT.H,-3,3.2);
 lgTarp(7,y3+CT.H+1.55,-2.5,2.0,2.4,.4);for(const sx of [-1,1])for(const dz of [-1.2,1.2])beam('wood',[7+sx,y3+CT.H,-2.5+dz],[7+sx,y3+CT.H+1.55,-2.5+dz],.07,jc(0x5c4630,.06),true,5);
 bottleString([-8.4,y2+1.9,.9],[-3.6,y2+1.9,.9],6);bottleString([-5.5,y3+1.9,.9],[-.6,y3+1.9,.9],6);
 // ---- ground clutter and workshop yard
 barrel(-9.8,0,-.6);barrel(-9.3,0,-.9);barrel(-9.5,0,.0);tireStack(-10.3,1.2,4);crate(4.4,0,3.6,.7,.4);crate(4.9,0,4.3,.6,-.2);
 lamp(2.3,0,2.4,3.6);waterButt(-8.8,1.4,-4.2,.6,1.0);junkPile(-9.5,-4.8,1.3,8);junkPile(10.5,-4.8,1.4,8);
 box('plank',6.5,0,4.0,3.0,.9,.7,jc(0x8a6a44,.06));box('iron',4.6,0,3.7,.16,1.5,.16,jc(0x4a4038,.05));box('iron',8.4,0,3.7,.16,1.5,.16,jc(0x4a4038,.05));
 // ---- SOCKETS: awnings carried on wall brackets (or posts that reach the ground), banners on poles, emblem and paint on the big boxes
 sock('awning',6.5,2.5,-.72,0,{w:5.6,d:1.7,drop:.6,h:1.9});                                   // over the shop bay: posts to the ground
 sock('awning',-7.5,2.5,-.75,0,{w:1.7,d:1.1,drop:.4,h:2.1});                                  // over the workshop door
 lgAwn(8.24,y2+2.4,3.0,PI/2,2.2,1.4,.5);lgAwn(8.24,y3+2.3,-2.5,PI/2,1.8,1.1,.4);              // east balcony door, top box window
 lgAwn(-1.0,y2+2.3,-.77,0,1.9,.9,.35);lgAwn(-6.6,y3+2.3,-.77,0,1.9,.9,.35);lgAwn(-2.2,y4+2.3,-.77,0,1.7,.9,.35);
 beam('wood',[-8.4,y2,.9],[-8.4,y2+3.4,.9],.08,jc(0x5c4630,.06),true,6);sock('banner',-8.4,y2+3.3,.95,0,{w:.7,h:1.9});
 beam('wood',[10.2,0,7.2],[10.2,5.0,7.2],.08,jc(0x5c4630,.06),true,6);sock('banner',10.2,4.9,7.25,0,{w:.7,h:2});
 beam('iron',[.6,y3+CT.H,-2],[.6,y3+CT.H+3.2,-2],.06,jc(0x4a4038,.05),true,5);sock('flag',.6,y3+CT.H+3.2,-2,0,{w:1.1,h:.6});
 sock('emblem',.75,y2+1.5,-.74,0,{w:1.0,h:1.0});sock('paint',3.7,y2+1.3,-.74,0,{w:1.6,h:1.2});}

// ================================================================== lg-twinsilo: two grain silos joined by a plank hall
defBuilding({key:'lg-twinsilo',name:'Twin silo hall',seed:4220,tags:{type:['multi-family dwelling'],size:'large',core:'grain silo',materials:['galvanised sheet','plank','corrugated roof','timber']},w:31,d:18,h:13,build:lgTwinSilo});
function lgTwinSilo(o){
 const r=4.2,sh=8.4,sx=8.7,sz=-1.2,hz=sz,hd=7.2,hy=4.0;
 for(const s of [-1,1]){W(s*sx,0,sz,0,()=>silo({r:r,h:sh,roofCol:s<0?0xb03c2a:0xa8382a,col:s<0?undefined:jc(0xa8aca8,.05)}));}
 box('conc',0,0,hz,17.6,.5,hd+.5,jc(0x8a8478,.05));
 const fz=hz+hd/2,bz=hz-hd/2;
 patchWall(0,.5,fz,17.4,hy-.5,0);patchWall(0,.5,bz,17.4,hy-.5,0);
 // hall openings only on the free stretch between the silos (|x|<5.8): the silo drums bulge in front of the wall beyond x=+-6.5
 for(const [k,x] of [[0,-5.2],[1,-2.6],[2,0],[3,2.6],[4,5.2]]){if(k===2){door(x,.75,fz+.06,1.4,2.3,{step:false,col:0x7a2e28});continue;}win(x,1.45,fz+.06,1.2,1.1,{shutters:k!==1,lit:o.v===1&&k===3});}
 for(let k=0;k<4;k++)win(-4.8+k*3.2,1.5,bz-.05,1.0,1.0,{});
 lgGable(0,hy,hz,17.2,hd,3.2,{ov:.5,col:0xc0552f,col2:0xa8acac});
 box('plank',0,hy+.1,fz+.15,4.0,1.4,.3,jc(0x9a7a52,.06));lgRoof('corr',-2.3,2.3,fz+1.3,hy+1.15,fz-.05,hy+2.0,.06,jc(0xb4b8b8,.05));win(0,hy+.25,fz+.3,1.0,1.0,{lit:true,mullion:false});
 box('earth',-4.4,hy+1.4,hz-1.4,.9,3.2,.9,jc(0xa8503a,.06));box('earth',-4.4,hy+4.6,hz-1.4,1.05,.18,1.05,jc(0x6a6660,.05));
 box('earth',4.4,hy+1.4,hz-1.4,.9,2.7,.9,jc(0xa8503a,.06));box('earth',4.4,hy+4.1,hz-1.4,1.05,.18,1.05,jc(0x6a6660,.05));stovepipe(1.2,hy+2.7,hz-1.6,1.2);stovepipe(7.0,hy+2.6,hz-1.0,1.1);
 // wraparound porch
 const py=.75;deck(0,py,fz+1.5,8.6,2.6,{col:0x9a7a52,rail:['f'],posts:false});
 for(const s of [-1,1]){const a0=s<0?PI*.22:0,a1=s<0?PI:PI*.78;sector('plank',s*sx,sz,r+.18,r+2.4,a0,a1,py-.14,py+.02,jc(0x9a7a52,.06));lgArcRail(s*sx,sz,r+2.35,a0,a1,py,1.0);
  for(let k=0;k<=4;k++){const a=a0+(a1-a0)*k/4;lgPost(s*sx+Math.cos(a)*(r+2.2),sz+Math.sin(a)*(r+2.2),py-.1,0,.13);}}
 for(const px of [-4.3,-1.5,1.5,4.3])lgPost(px,fz+2.7,py-.1,0,.13);
 stairs(0,0,fz+6.4,0,py,fz+2.8,2.0,{rail:true});
 // silo openings, each on its own face: angle a=PI/2 is the front; "o" runs from the front toward the OUTER side (away from the hall)
 const sw=(s,o,y,w,h,lit,shut)=>{const a=PI/2-s*o;W(s*sx+Math.cos(a)*(r+.02),0,sz+Math.sin(a)*(r+.02),PI/2-a,()=>win(0,y,0,w,h,{lit:lit,shutters:shut}));};
 for(const s of [-1,1]){sw(s,.55,1.2,.9,1.0,0,true);sw(s,.95,1.2,.9,1.0,0,false);           // ground row
  sw(s,.1,4.9,.9,1.0,o.v===1,false);sw(s,1.0,4.9,.9,1.0,0,false);                        // balcony row
  sw(s,.3,6.2,.9,.9,0,false);sw(s,.8,6.2,.9,.9,o.v===1,false);sw(s,1.3,6.2,.9,.9,0,false);// upper row
  W(s*sx,0,sz+r+.02,0,()=>{door(0,py,0,1.1,2.1,{step:false,col:s<0?0x2f5f8f:0x3b7f6e});});
  const a0=s>0?PI/2-1.35:PI/2-.2,a1=s>0?PI/2+.2:PI/2+1.35,yb=4.0;sector('plank',s*sx,sz,r+.05,r+1.35,a0,a1,yb-.14,yb,jc(0x9a7a52,.06));lgArcRail(s*sx,sz,r+1.3,a0,a1,yb,1.0);
  for(const a of [a0,(a0+a1)/2,a1])beam('wood',[s*sx+Math.cos(a)*(r+1.2),yb-.14,sz+Math.sin(a)*(r+1.2)],[s*sx+Math.cos(a)*(r+.1),yb-1.3,sz+Math.sin(a)*(r+.1)],.09,jc(0x5c4630,.06));
  const ad=PI/2-s*.55;W(s*sx+Math.cos(ad)*(r+.02),0,sz+Math.sin(ad)*(r+.02),PI/2-ad,()=>door(0,yb,0,1.0,2.0,{step:false,col:0xc99a2e}));}
 barrel(-12.4,0,2.8);barrel(-12,0,3.4);sacks(12.4,.0,3.6,5,.4);tireStack(13,1.5,3);waterButt(-9.6,1.4,-7.2,.65,1.1);junkPile(11.5,-7,1.4,8);crate(-11.6,0,5.0,.7,.2);lamp(-6.4,py,fz+2.2,3.2);lamp(6.4,py,fz+2.2,3.2);
 for(const s of [-1,1]){const th=sh+r*.42+.15+.35+.6;beam('iron',[s*sx,sh+r*.42+.3,sz],[s*sx,th,sz],.05,jc(0x4a4038,.05),true,5);sock('flag',s*sx,th+.2,sz,0,{w:1.3,h:.7});}
 sock('awning',0,py+2.5,fz+.1,0,{w:2.4,d:1.4,drop:.5,h:py+2.0});sock('awning',-3.9,py+2.5,fz+.1,0,{w:2.6,d:1.4,drop:.5,h:py+2.0});sock('awning',3.9,py+2.5,fz+.1,0,{w:2.6,d:1.4,drop:.5,h:py+2.0});
 for(const px of [-4.3,4.3]){beam('wood',[px,py,fz+2.7],[px,py+3.6,fz+2.7],.09,jc(0x5c4630,.06),true,6);sock('banner',px,py+3.5,fz+2.75,0,{w:.7,h:2.2});}
 sock('emblem',-1.4,hy+.8,fz+.34,0,{w:.9,h:.9});sock('emblem',1.4,hy+.8,fz+.34,0,{w:.9,h:.9});sock('paint',-sx,7.7,sz+r+.02,0,{w:2.4,h:.9});sock('paint',sx,7.7,sz+r+.02,0,{w:2.4,h:.9});}

// a proper well: tyre ring, dark recessed shaft, timber frame with windlass, rope, bucket and a little roof
function lgWell(cx,cz){const R=.9,rope=jc(0x8a7a5a,.05),wd=jc(0x5c4630,.06);
 tireRing(cx,cz,R,3,0,TAU);
 sector('plain',cx,cz,.5,.68,0,TAU,.03,.62,jc(0x14100c,.02));                                  // dark shaft lining
 cyl('plain',cx,.03,cz,.66,.02,jc(0x0a1216,.02),16);                                            // black water, far below the rim
 sector('conc',cx,cz,.66,1.25,0,TAU,.64,.74,jc(0x9a9488,.05));                                  // stone rim
 for(const sx of [-1,1]){beam('wood',[cx+sx*1.15,0,cz],[cx+sx*1.15,2.5,cz],.13,wd,true,7);beam('wood',[cx+sx*1.15,.5,cz+.5],[cx+sx*1.15,1.9,cz],.07,wd,true,5);beam('wood',[cx+sx*1.15,.5,cz-.5],[cx+sx*1.15,1.9,cz],.07,wd,true,5);}
 cylH('wood',cx,2.3,cz,.1,2.3,jc(0x7a5c3c,.06),'x',8);cylH('plain',cx,2.3,cz,.2,.5,rope,'x',8);
 beam('iron',[cx+1.2,2.3,cz],[cx+1.6,2.3,cz],.04,jc(0x3a3430,.05),true,5);beam('iron',[cx+1.6,2.3,cz],[cx+1.6,1.95,cz+.28],.04,jc(0x3a3430,.05),true,5);sph('wood',cx+1.6,1.93,cz+.3,.06,wd);
 beam('plain',[cx,2.15,cz],[cx,1.05,cz],.02,rope,true,4);cyl('sheet',cx,.78,cz,.19,.28,jc(0x8a6a44,.06),10,.17);cyl('iron',cx,.78+.26,cz,.2,.03,jc(0x3a3430,.05),10);beam('iron',[cx-.19,1.06,cz],[cx+.19,1.06,cz],.02,jc(0x3a3430,.05),true,3);
 lgGable(cx,2.55,cz,2.7,1.7,.65,{ov:.15,col:0xb85a3a,col2:0xc99a2e});}

// ================================================================== lg-bulkhead: an Ancient bulkhead fronting a real three-storey house, deep portico, buttresses, attic and wings round a courtyard
defBuilding({key:'lg-bulkhead',name:'Bulkhead manor',seed:4230,tags:{type:['multi-family dwelling'],size:'large',core:'arcology bulkhead',materials:['ancient ceramic','container','plank','tyres','sheet metal']},w:26,d:28,h:18,build:lgBulkhead});
function lgBulkhead(o){
 const bz=-6,bh=9.6,fz=bz+.45+.16,dz=fz+.08,cw=jc(0xcfccc4,.03),cw2=jc(0xb8b4aa,.04),cw3=jc(0xa8a498,.04);
 W(0,0,bz,0,()=>bulkhead({w:14,h:bh,th:.9,hatch:o.v===1?'round':'door'}));
 if(o.v!==1)door(0,.3,bz-.35,2.0,3.05,{step:false,col:0x7a2e28});                                  // the main entrance: a door in the great doorway, facing +z
 // ---- the house behind the facade: a solid three-storey block (plank and sheet over an earth core), floors at .3 / 3.6 / 6.9, roofed and parapeted
 const zc=-10.5,dep=8.1,F=[.3,3.6,6.9],SB=3.3,sc=o.v===1?[0x3b7f8e,0xc99a2e,0x8a4a2a]:[0x8a4a2a,0x3b7f8e,0xc99a2e];
 box('earth',0,0,zc,14,9.9,dep,jc(0xa89880,.05));
 for(let s=0;s<3;s++){patchWall(7.05,F[s],zc,dep,SB,PI/2,{col:sc[s]});patchWall(-7.05,F[s],zc,dep,SB,-PI/2,{col:sc[(s+1)%3]});patchWall(0,F[s],zc-dep/2-.05,14,SB,PI,{col:sc[s]});
  box('plank',0,F[s]-.18,zc,14.5,.36,dep+.4,jc(0x4a3a2c,.06));}
 // parapet, roof sheet, plant on the block roof
 box('sheet',0,9.85,zc,13.8,.1,dep-.2,jc(0x8a4a2a,.06));for(const sx of [-1,1])box('conc',sx*6.85,9.9,zc,.35,.9,dep,cw2);box('conc',0,9.9,zc-dep/2+.1,14,.9,.35,cw2);
 for(const [x,z] of [[-6,-8.3],[6,-8.3],[-6,-12.7],[6,-12.7]]){box('earth',x,9.9,z,1.0,3.4,1.0,jc(0xa8503a,.06));box('conc',x,13.3,z,1.25,.2,1.25,jc(0x6a6660,.05));}
 lgTank(-6,9.9,-10.5,.8,1.3,0x3a6a8a);lgDish(6,9.9,-10.5,.5,.7);stovepipe(-6.2,9.9,-14.0,1.4);stovepipe(6.2,9.9,-14.0,1.2);
 // attic: solid, with a gable roof running front-to-back, windows on every face
 const az=-9.65,ad=8.8;box('conc',0,9.9,az,10,2.8,ad,cw);box('conc',0,12.5,az,10.8,.3,ad+.6,cw2);
 for(let k=0;k<5;k++){box('conc',-4.6+k*2.3,12.2,-5.2,.5,.3,.3,cw3);}
 W(0,12.8,az,PI/2,()=>lgGable(0,0,0,ad+.6,10,1.9,{ov:.5,col:0xb85a3a,col2:0xc99a2e}));
 for(const x of [-2.8,2.8])win(x,10.8,-5.2,1.0,1.1,{lit:o.v===1});
 for(const s of [-1,1])for(const z of [-7.6,-9.65,-11.7])W(s*5.03,0,z,s*PI/2,()=>win(0,10.7,0,.9,1.0,{lit:z>-9}));
 for(const x of [-2.4,2.4])W(x,0,-14.08,PI,()=>win(0,10.7,0,.9,1.0,{}));
 // ---- side and rear faces: doors, windows, balconies, steel stairs, ladders, brackets, awnings
 for(let s=0;s<3;s++){const sill=F[s]+1.0;
  for(const sd of [-1,1]){for(const z of [-7.6,-13.3])W(sd*7.1,0,z,sd*PI/2,()=>win(0,sill,0,1.0,1.2,{lit:(s+z)%3===0,shutters:s===1}));
   if(s===0)W(sd*7.1,0,-10.5,sd*PI/2,()=>door(0,F[0],0,1.0,2.2,{step:true,col:sd<0?0x2f5f8f:0x4d6f3c}));
   else W(sd*7.1,0,-10.5,sd*PI/2,()=>door(0,F[s],0,1.0,2.1,{step:false}));}
  for(const x of [-5.2,-2.6,2.6,5.2])W(x,0,zc-dep/2-.03,PI,()=>win(0,sill,0,1.0,1.2,{lit:(s+x)%2===0}));
  if(s===2)W(0,0,zc-dep/2-.03,PI,()=>win(0,sill,0,1.2,1.2,{lit:true}));}
 W(0,0,zc-dep/2-.03,PI,()=>door(0,F[0],0,1.1,2.2,{step:true,col:0x7a2e28}));
 for(const sd of [-1,1]){const xo=sd*7.9,xr=sd*8.7,ry=sd>0?PI/2:-PI/2,rl=sd>0?['r','b']:['l','b'];
  deck(xo,F[1],-10.5,1.7,3.8,{rail:rl,posts:false});deck(xo,F[2],-11.1,1.7,2.6,{rail:sd>0?['r','f','b']:['l','f','b'],posts:false});
  for(const z of [-12.1,-10.5,-8.9])beam('iron',[sd*7.05,F[1]-1.0,z],[xr-sd*.02,F[1]-.12,z],.06,jc(0x4a4038,.05),true,5);
  for(const z of [-12.0,-10.2])beam('iron',[sd*7.05,F[2]-1.0,z],[xr-sd*.02,F[2]-.12,z],.06,jc(0x4a4038,.05),true,5);
  lgPost(xr,-12.3,F[1]-.12,0,.12);lgPost(xr,-9.3,F[1]-.12,0,.12);lgPost(xr,-12.2,F[2]-.12,F[1],.1);lgPost(xr,-9.9,F[2]-.12,F[1],.1);
  stairs(sd*8.3,0,-5.0,sd*8.3,F[1],-8.6,1.1,{steel:true});ladder(sd*7.35,F[1],-9.5,F[2]-F[1],ry);
  lgAwn(sd*7.05,F[2]+2.5,-11.1,ry,1.8,1.2,.4);}
 deck(0,F[1],zc-dep/2-.85,7.0,1.7,{rail:['l','r','b'],posts:false});
 for(const x of [-3,0,3])beam('iron',[x,F[1]-1.0,zc-dep/2],[x,F[1]-.12,zc-dep/2-1.7],.06,jc(0x4a4038,.05),true,5);
 for(const x of [-3.4,3.4])lgPost(x,zc-dep/2-1.65,F[1]-.12,0,.12);
 lgAwn(0,2.8,zc-dep/2-.02,PI,2.4,1.2,.4);
 // ---- projecting portico with a deep reveal: chunky side walls, two heavy columns, outer piers, entablature, cornice, parapet, steps
 const pw=4.7,pd=3.8,ph=8.2;
 box('conc',0,0,dz+pd/2,2*pw+2.2,.3,pd+.4,cw2);
 for(let k=0;k<3;k++)box('conc',0,0,dz+pd+.2+k*.5,2*pw+1.0+k*.7,.12+(2-k)*.1,.5,cw2);
 for(const sx of [-1,1]){box('conc',sx*(pw-.5),.3,dz+(pd-1.2)/2,.9,ph-.3,pd-1.2,cw);
  cyl('conc',sx*pw,.3,dz+pd-.7,.9,.3,cw2,18);cyl('conc',sx*pw,.6,dz+pd-.7,.75,ph-.9,cw,18);cyl('conc',sx*pw,ph-.3,dz+pd-.7,.9,.3,cw2,18);box('conc',sx*pw,ph,dz+pd-.7,1.9,.3,1.9,cw2);
  box('conc',sx*(pw+1.9),0,dz+pd/2-.2,1.8,ph+.6,pd-.4,cw);box('conc',sx*(pw+1.9),ph+.6,dz+pd/2-.2,2.1,.3,pd,cw2);}
 box('conc',0,ph+.3,dz+pd/2,2*pw+4.4,.9,pd-.3,cw);box('conc',0,ph+1.2,dz+pd/2+.15,2*pw+5.4,.35,pd+.5,cw2);
 for(let k=0;k<10;k++)box('conc',-pw-2.3+k*(2*pw+4.6)/9,ph+.3,dz+pd-.15,.26,.3,.22,cw3);
 box('conc',0,ph+1.55,dz+pd+.05,2*pw+5.2,.6,.3,cw2);for(const sx of [-1,1])box('conc',sx*(pw+2.5),ph+1.55,dz+pd/2,.3,.6,pd,cw2);
 // ---- chunky buttresses flanking the portico, stepped caps
 for(const sx of [-1,1]){box('conc',sx*6.4,0,dz+1.1,1.5,bh-.2,2.2,cw);box('conc',sx*6.4,bh-.8,dz+1.15,1.8,.35,2.5,cw2);box('conc',sx*6.4,bh-.45,dz+1.15,1.55,.55,2.25,cw);cone('conc',sx*6.4,bh+.1,dz+1.15,.6,1.1,cw2,4);}
 box('conc',0,bh-.35,dz-.05,15.4,.35,1.5,cw2);
 // ---- side wings wrap forward: a U of containers, doors centred on their faces with steps, awnings on braces
 const Cw=[0xa83a2c,0x2f7f8e,0xd8a020,0x4d6f3c,0x2f5f8f],zw=1.6;
 const wing=(x,ry,c0,c1)=>{lgBox(x,0,zw,ry,CT.L40,c0,()=>{door(0,.16,1.22,1.0,2.0,{step:true});win(-3.6,1.05,1.22,1.2,.9,{lit:true});win(3.6,1.05,1.22,1.2,.9,{bars:true});porthole(-1.7,1.4,1.22,.32);porthole(1.7,1.4,1.22,.32);});
  lgBox(x,CT.H,zw,ry,CT.L40,c1,()=>{win(-3.6,1.05,1.22,1.2,1.0,{shutters:true});win(3.6,1.05,1.22,1.2,1.0);porthole(-1.2,1.4,1.22,.34);porthole(1.2,1.4,1.22,.34);});};
 wing(-8.6,PI/2,Cw[0],Cw[1]);wing(8.6,-PI/2,Cw[2],Cw[3]);
 lgBox(-8.6,CT.H*2,4.6,PI/2,CT.L20,Cw[3],(len)=>{win(-1.2,1.05,1.22,1.2,1.0,{lit:true});porthole(1.4,1.4,1.22,.32);W(len/2+.02,0,0,PI/2,()=>door(0,.16,0,.95,1.95,{step:false}));});
 lgBox(8.6,CT.H*2,4.6,-PI/2,CT.L20,Cw[4],()=>{win(-1.2,1.05,1.22,1.2,1.0);porthole(1.4,1.4,1.22,.32);porthole(2.4,1.4,1.22,.32);});
 lgTank(8.6,CT.H*2+.06-CT.H+0,-2.4,.8,1.2,0x3a6a8a);stovepipe(8.6,CT.H+.06,-4.0,1.2);lgSolar(8.6,CT.H+.1,.2,2.2,1.2,0,.5);
 lgGable(-8.6,CT.H*3+.05,4.6,2.6,6.0,1.0,{ov:.2,col:0xc45a30,col2:0xc45a30});
 lgAwn(-7.38,2.7,zw,PI/2,2.0,1.1,.4);lgAwn(7.38,2.7,zw,-PI/2,2.0,1.1,.4);
 // ---- courtyard: tyre wall with a gate, a real well, fire, planters
 const wz=10.6;tireWall(-7.6,wz,-1.9,wz,5);tireWall(1.9,wz,7.6,wz,5);
 for(const s of [-1,1]){beam('wood',[s*1.9,0,wz],[s*1.9,3.2,wz],.16,jc(0x5c4630,.06),true,7);}beam('wood',[-1.9,3.1,wz],[1.9,3.1,wz],.14,jc(0x5c4630,.06),true,7);
 tireWall(-7.6,wz,-7.6,8.6,5);tireWall(7.6,wz,7.6,8.6,5);
 fire(-1.5,.02,4.2,.6);lgWell(3.6,4.6);
 for(const sx of [-3.2,-.4])box('plank',sx,.32,6.4,1.6,.1,.4,P('woodD'));
 tireRing(-4.4,8.4,.8,2,0,TAU);plant('groundcover',-4.4,.5,8.4,{r:.6,moisture:'mild'});tireRing(4.6,8.4,.8,2,0,TAU);plant('groundcover',4.6,.5,8.4,{r:.6,moisture:'mild'});
 // ---- west roof terrace on the 2-high wing: reached by a steel stair that ends on the deck edge
 const ty=CT.H*2+.06;deck(-8.0,ty,-1.5,4.6,6.0,{rail:['l','r','b'],posts:false});
 lgPost(-5.85,-4.3,ty-.1,0);lgPost(-5.85,1.2,ty-.1,0);stairs(-6.6,0,6.6,-6.6,ty,1.5,1.1,{steel:true});
 for(const bz2 of [-3.5,-.5])beam('iron',[-7.38,ty-1.2,bz2],[-5.85,ty-.12,bz2],.06,jc(0x4a4038,.05),true,5);
 lgTank(-9.3,ty,-3.6,.8,1.3,0x8a4a3a);lgDish(-6.5,ty,-3.9,.5);lgSolar(-7.9,ty+.05,-2.3,2.4,1.2,0,.5);
 lgTarp(-8.0,ty+2.3,-2.5,3.0,2.0,.4);for(const dx of [-1.5,1.5]){beam('wood',[-8.0+dx,ty,-2.5],[-8.0+dx,ty+2.3,-2.5],.07,jc(0x5c4630,.06),true,5);beam('wood',[-8.0+dx,ty,-.5],[-8.0+dx,ty+1.9,-.5],.07,jc(0x5c4630,.06),true,5);}
 junkPile(11.6,-2.0,1.5,9);barrel(11.6,0,6.4);barrel(12.0,0,6.9);tireStack(11.8,8.4,4);crate(5.6,0,5.6,.7,.3);lamp(-5.6,0,8.4,3.4);lamp(5.6,0,8.4,3.4);
 // ---- sockets: emblems on the reveal walls and attic front, banners on their own free poles in the court (clear of columns, steps, awnings), flag on the attic ridge
 sock('emblem',-(pw-.5)+.46,4.6,dz+1.2,PI/2,{w:1.5,h:1.5});sock('emblem',(pw-.5)-.46,4.6,dz+1.2,-PI/2,{w:1.5,h:1.5});sock('emblem',0,10.9+.6,-5.17,0,{w:1.3,h:1.3});
 sock('paint',-7.36,CT.H+1.3,-4.7,PI/2,{w:1.8,h:1.0});
 for(const s of [-1,1]){const bx=s*5.9,bzp=dz+pd+3.4;beam('wood',[bx,0,bzp],[bx,8.3,bzp],.16,jc(0x5c4630,.06),true,7);sock('banner',bx,8.1,bzp,0,{w:.9,h:3.2});}
 beam('iron',[0,14.6,-5.7],[0,17.0,-5.7],.07,jc(0x4a4038,.05),true,5);sock('flag',0,17.0,-5.7,0,{w:1.4,h:.8});}

// ================================================================== lg-tanktower: a vertical tank wrapped in plank storeys
defBuilding({key:'lg-tanktower',name:'Tank-tower tenement',seed:4240,tags:{type:['multi-family dwelling'],size:'large',core:'storage tank',materials:['tank','plank','sheet metal','pipes']},w:18,d:16,h:21,build:lgTankTower});
function lgTankTower(o){
 const tr=4.0,th=12.4,st=3.1,tx=-4.2,tz=-.6;
 // storey levels are the tank's own band heights: tankV puts rings at .3+th*(.25,.5,.75) = .3+st*(1,2,3); every floor slab sits on one
 const Y0=s=>.3+s*st,U=s=>Y0(s)+.2,X1=s=>6.6+.14*s,Z1=s=>4.8+.168*s,Z0=s=>-4.4-.14*s,X0=s=>-1.2-.042*s,SILL=s=>Y0(s)+1.0;
 W(tx,0,tz,0,()=>{tankV({r:tr,h:th,col:jc(0x6a8f7a,.04)});});
 ladder(tx-tr+.3,.3,tz+1.2,12.3,PI/2+.5);
 const cols=[0xa8503a,0x8a4a2a,0xb8a070,0x9a3a2c,0x6a7a78];if(o.v===1)cols.reverse();
 for(let s=0;s<5;s++){const y=Y0(s),x0=X0(s),x1=X1(s),z0=Z0(s),z1=Z1(s),h=st-.15,col=cols[s],sil=SILL(s);
  box('plank',(x0+x1)/2,y-.02,(z0+z1)/2,x1-x0,.22,z1-z0,jc(0x4a3a2c,.06));
  patchWall((x0+x1)/2,y+.2,z1,x1-x0,h-.2,0,{col:col});patchWall(x1,y+.2,(z0+z1)/2,z1-z0,h-.2,PI/2,{col:col});
  sheetWall((x0+x1)/2,y+.2,z0,x1-x0,h-.2,0,{col:col});sheetWall(x0,y+.2,(z0+z1)/2,z1-z0,h-.2,PI/2,{col:col});
  // front row (door on the ground floor), back row, right-hand row: every window sill is the storey's SILL height
  for(let k=0;k<3;k++){const wx=x0+1.3+k*(x1-x0-2.6)/2;if(s===0&&k===1){door(wx,U(0),z1+.05,1.0,2.0,{step:true});continue;}win(wx,sil,z1+.05,.9,1.05,{lit:o.v===1&&(k+s)%3===0,shutters:(k+s)%2===0});}
  for(let k=0;k<3;k++){const wx=x0+1.5+k*(x1-x0-3.0)/2;W(wx,0,z0-.03,PI,()=>win(0,sil,0,.9,1.05,{lit:(k+s)%3===1}));}
  for(const wz of [-3.3,1.4])W(x1+.05,0,wz,PI/2,()=>win(0,sil,0,.9,1.05,{lit:(wz+s)%2===0}));
  if(s>=1)W(x1+.05,0,s%2?-1.1:3.9,PI/2,()=>door(0,U(s),0,1.0,2.0,{step:false}));       // the door onto this floor's stair landing
  if(s>0){deck((x0+x1)/2,U(s),z1+.85,5.4,1.5,{rail:['f','l','r'],posts:false});for(const px of [x0+1.4,x1-2.6])beam('wood',[px,y-.6,z1-.05],[px,U(s)-.1,z1+1.5],.08,jc(0x5c4630,.06));}
  lgRoof('corr',x0-.2,x1+.2,z1+.5,y+h+.05,z1-.1,y+h+.55,.05,jc(pick([0xd06a30,0xa8acac,0x2f5f8f,0xc99a2e]),.05));
  if(s>=1){const R=tr+.9,a0=PI*.62,a1=PI*1.18;sector('plank',tx,tz,tr+.05,R,a0,a1,U(s),y+h,jc(col,.06));sector('plank',tx,tz,R-.02,R+.12,a0,a1,y+h,y+h+.12,jc(0x4a3a2c,.06));
   sector('plank',tx,tz,tr+.05,R+.55,a0,a1,U(s)-.18,U(s),jc(0x4a3a2c,.06));
   for(const a of [PI*.75,PI*.95,PI*1.12]){const px=tx+Math.cos(a)*(R+.03),pz=tz+Math.sin(a)*(R+.03);W(px,0,pz,PI/2-a,()=>win(0,sil,0,.8,1.0,{lit:(s+Math.round(a*3))%2===0}));}}
 }
 // ---- stair: a steel switchback on the right side. Landings sit at the floor height of each door; every flight ends exactly on a landing edge
 //      odd floors have the landing at the north end (z -1.8..-.4), even floors at the south end (z 3.2..4.6)
 for(let s=1;s<=4;s++){const north=s%2===1,xc=X1(s)+.9,zc=north?-1.1:3.9;deck(xc,U(s),zc,1.6,1.4,{posts:false,rail:north?['r','b']:['r','f'],col:0x8a8a86});
  for(const dz of [-.65,.65])lgPost(xc+.7,zc+dz,U(s)-.12,0,.1);beam('iron',[X1(s)+.02,U(s)-.9,zc],[xc-.1,U(s)-.12,zc],.06,jc(0x4a4038,.05),true,5);}
 stairs(X1(0)+.9,0,3.2,X1(1)+.9,U(1),-.4,1.0,{steel:true});
 stairs(X1(1)+.9,U(1),-.4,X1(2)+.9,U(2),3.2,1.0,{steel:true});
 stairs(X1(2)+.9,U(2),3.2,X1(3)+.9,U(3),-.4,1.0,{steel:true});
 stairs(X1(3)+.9,U(3),-.4,X1(4)+.9,U(4),3.2,1.0,{steel:true});
 // ---- top: roof slab, tenement roof, chimneys; water tank on the flat top of the tank itself
 const ty=Y0(5);box('plank',(6.6-1.2)/2+.2,ty-.02,.2,9.4,.2,10.4,jc(0x4a3a2c,.06));lgGable(2.6,ty+.1,.2,9.2,9.6,2.3,{ov:.4,col:0xb8502c,col2:0xc99a2e});
 lgTank(tx,.3+th+.16+.56,tz,1.3,1.6,0x3a6a8a);
 box('earth',5.2,ty+.6,-2.4,.9,3.4,.9,jc(0xa8503a,.06));box('earth',5.2,ty+4.0,-2.4,1.05,.16,1.05,jc(0x5a5650,.05));stovepipe(-.4,ty+1.2,2.4,1.4);stovepipe(4.4,ty+.9,3.0,1.1);
 // catwalk ring with rail on the tank's shoulder
 const yc=Y0(4)-.1;sector('plank',tx,tz,tr+.05,tr+.9,PI*1.15,PI*2.2,yc-.13,yc,jc(0x6a5238,.06));lgArcRail(tx,tz,tr+.85,PI*1.15,PI*2.2,yc,.95);
 for(const a of [PI*1.2,PI*1.6,PI*2.1])beam('iron',[tx+Math.cos(a)*(tr+.7),yc-.13,tz+Math.sin(a)*(tr+.7)],[tx+Math.cos(a)*(tr+.05),yc-1.3,tz+Math.sin(a)*(tr+.05)],.07,jc(0x4a4038,.05));
 // ---- external pipes: every run goes from a source (gutter, tank port) to an end (a barrel, a wall port), with elbows and wall brackets
 const brk=(p,q)=>beam('iron',p,q,.05,jc(0x4a4038,.05),true,5),pc=jc(0x6a5a4c,.05);
 // A: back eave gutter -> corner down-pipe that jogs out with each jettied floor -> into a barrel
 beam('iron',[-1.6,ty+.03,-4.95],[7.3,ty+.03,-4.95],.16,jc(0x5a4a3c,.05),true,8);
 const pa=[[7.3,ty+.03,-4.95]];for(let s=4;s>=0;s--){const xs=X1(s)+.3,zs=Z0(s)-.3;pa.push([xs,Y0(s)+st-.25,zs]);if(s>0)pa.push([xs,Y0(s)+.05,zs]);}
 const bxa=X1(0)+.3,bza=Z0(0)-.3;pa.push([bxa,.93,bza]);pipe('iron',pa,.09,pc);barrel(bxa,0,bza,0x5a5a56,{open:true});
 for(let s=0;s<=4;s++){const y=Y0(s)+1.4,xs=X1(s)+.3,zs=Z0(s)-.3;brk([X1(s)-.35,y,Z0(s)-.03],[xs,y,zs]);brk([X1(s)+.03,y,Z0(s)+.35],[xs,y,zs]);}
 cyl('iron',X1(2)+.3,Y0(2)+2.0,Z0(2)-.3,.15,.14,jc(0x3a3430,.05),8);
 // B: barrel -> up the back of the tank -> into a wall port near the shoulder
 const angP=(a,r)=>[tx+Math.cos(a)*r,tz+Math.sin(a)*r];
 {const a=PI*1.38,[bx,bz]=angP(a,tr+.36),[wx,wz]=angP(a,tr+.02),yp=th-.5;pipe('iron',[[bx,.93,bz],[bx,yp,bz],[wx,yp,wz]],.11,jc(0xc45a30,.05));barrel(bx,0,bz,0x8a3a2c,{open:true});sph('iron',wx,yp,wz,.2,jc(0x3a3430,.05));
  for(const y of [2.4,5,7.6,10.2]){const [q,r2]=angP(a,tr+.02);brk([q,y,r2],[bx,y,bz]);}}
 // C: a wall port at the third band -> steps out and down to a second barrel
 {const a=PI*1.62,[bx,bz]=angP(a,tr+.55),[wx,wz]=angP(a,tr+.02),yp=Y0(2)+.5;pipe('iron',[[wx,yp,wz],[bx,yp,bz],[bx,.93,bz]],.09,jc(0xc99a2e,.05));barrel(bx,0,bz,0x2f5f8f,{open:true});sph('iron',wx,yp,wz,.16,jc(0x3a3430,.05));
  for(const y of [1.8,3.8]){brk([wx,y,wz],[bx,y,bz]);}}
 // ground: tyre plinth wall, crates, barrels
 tireWall(-7.6,4.6,-2.6,4.6,2);barrel(5.6,0,7.4);barrel(6.1,0,7.9);crate(2.4,0,7.6,.7,.3);tireStack(-3.5,6.4,3);lamp(4.2,0,7.0,3.4);junkPile(-8,-6.5,1.4,8);waterButt(9.2,1.8,-6,.6,1.0);
 // sockets (awnings on the wall face, over the balcony; banners on poles set on the roof slab)
 sock('awning',2.7,2.65,Z1(0)+.06,0,{w:2.4,d:1.4,drop:.5,h:2.15});
 for(const s of [1,3])sock('awning',X0(s)+2.7+1.3,U(s)+2.5,Z1(s)+.06,0,{w:4.4,d:1.5,drop:.5,h:2.0});
 for(const px of [-1.0,7.0]){beam('wood',[px,ty,4.4],[px,ty+4.4,4.4],.09,jc(0x5c4630,.06),true,6);sock('banner',px,ty+4.3,4.45,0,{w:.75,h:2.4});}
 beam('iron',[2.6,ty+2.4,.2],[2.6,ty+5.4,.2],.06,jc(0x4a4038,.05),true,5);sock('flag',2.6,ty+5.4,.2,0,{w:1.2,h:.7});
 sock('emblem',1.35,Y0(4)+1.6,Z1(4)+.1,0,{w:1.1,h:1.1});sock('paint',1.35,Y0(2)+1.4,Z1(2)+.1,0,{w:1.5,h:1.2});}
