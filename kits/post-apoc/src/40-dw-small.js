// prefix: dw
// ---------------------------------------------------------------- small dwellings: 7 types (4x fragments: 40 dw-small)
// EXEMPLAR FRAGMENT. A dwelling = one reclaimed CORE (container / silo / bus / tank ...) + lashed-on ADDITIONS (plank room, lean-to, deck,
// tyre wall ...) + yard junk + SOCKETS for the culture. Never name a culture: declare sockets, the pack fills them.
defBuilding({key:'dw-box',name:'Box house',seed:4010,tags:{type:['single-family dwelling'],size:'small',core:'shipping container',materials:['container','board-and-batten','sheet metal']},w:14,d:8,h:4.8,build:dwBox});
function dwBox(o){
 const cx=1.3,cz=-.9,fz=cz+CT.W/2;                        // container centre, front face z
 W(cx,0,cz,0,()=>container({len:CT.L20}));
 // the container's own door: framed, with a step, nothing in front of it
 door(cx-1.3,.16,fz,1.0,2.0);win(cx+.7,1.05,fz,1.1,.8,{lit:o.v===1});win(cx+2.2,1.05,fz,.8,.8,{bars:true});
 // the room added to the left end: board-and-batten, corrugated and sheet skins, real door opening, flat sheet roof
 const rw=3.0,rx1=cx-CT.L20/2,rx0=rx1-rw,rc=(rx0+rx1)/2,wh=2.3;
 box('plank',rc,0,cz,rw,.16,CT.W,jc(0x6a5a44,.08));
 dwWallOpen(rc,.16,fz,rw,wh,0,'sheet',0x3b7f6e,[{x0:-.5,x1:.5,y0:0,y1:1.95}]);
 dwSkin(rc,.16,cz-CT.W/2,rw,wh,PI,'corr',pick([0x9a3a2c,0xc99a2e,0x2f5f8f]));
 dwSkin(rx0,.16,cz,CT.W,wh,-PI/2,'batten',pick([0x7a5c3c,0x8a6a44]));
 dwPatches(rx0-.03,.5,cz,1.6,1.2,-PI/2,2,.05);
 door(rc,.16,fz+.05,.9,1.9,{step:true,col:0xc99a2e});
 box('wood',rc,.16+1.98,fz+.02,1.3,.12,.18,jc(0x5c4630,.06));
 box('plank',rc,2.46,cz,rw+.5,.07,CT.W+.6,P('galv'));                       // flat sheet roof resting on the walls
 for(const sx of [-1,1])box('wood',rc+sx*(rw/2),2.36,cz,.1,.1,CT.W+.6,jc(0x5c4630,.06));
 // roof furniture on the container: solar panel, stovepipe, a water butt
 dwSolar(cx+1.0,CT.H+.02,cz,3.0,1.6,0,.5);stovepipe(cx-2.4,CT.H,cz-.3,1.4);waterButt(cx+CT.L20/2+.9,.9,cz-.6,.55,.9);
 // yard: barrels and tyre seats kept clear of both doors
 barrel(cx+3.9,0,cz+.8);barrel(cx+4.3,0,cz+.3);crate(cx+3.9,0,cz+1.6,.6,.3);tireStack(rx0-.9,cz+1.4,3);tire(rx0-.9,.12,cz-.4,TYR.R,TYR.t);
 lamp(cx+3.0,0,fz+1.6,2.9);junkPile(rx0-1.5,cz-2.4,1.2,7);
 // SOCKETS: a canopy over the door, a banner on a pole at the corner, an emblem on the front, a livery panel on the end
 sock('awning',cx-1.3,2.3,fz,0,{w:1.8,d:1.2,drop:.5,h:2.3});
 beam('wood',[cx+3.6,0,fz+.9],[cx+3.6,3.4,fz+.9],.08,jc(0x5c4630,.06),true,6);sock('banner',cx+3.6,3.4,fz+.95,0,{w:.7,h:1.9});
 sock('emblem',cx+1.5,2.25,fz,0,{w:.6,h:.4});
 sock('paint',cx,1.3,cz-CT.W/2,PI,{w:3,h:1.5});}
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
 tireRing(-4.6,r+1.6,.72,2,0,TAU);cyl('plain',-4.6,.05,r+1.6,.6,.36,jc(0x4a3626,.06),10);plant('groundcover',-4.6,.5,r+1.6,{r:.55,moisture:'mild'});
 waterButt(-3.0,1.2,-r-.8,.6,1.0);ladder(r*.95*Math.sin(.9),0,-r*.95*Math.cos(.9)-.1,h,PI+.9);
 barrel(3.8,0,r+.4);barrel(4.2,0,r+.9);lamp(-3.6,0,r+.9,3.0);
 sock('awning',0,2.75,r+.02,0,{w:2.0,d:1.3,drop:.55,h:2.5});
 beam('wood',[3.6,0,r+2.9],[3.6,4.0,r+2.9],.08,jc(0x5c4630,.06),true,6);sock('banner',3.6,4.0,r+2.95,0,{w:.7,h:2});
 sock('emblem',0,5.0,r+.03,0,{w:.9,h:.9});}

// ---------------------------------------------------------------- shared helpers for the small dwellings
const dwWood=0x5c4630;
function dwPole(x,y0,z,y1,w,col){beam('wood',[x,y0,z],[x,y1,z],w||.1,col===undefined?jc(dwWood,.06):jc(col,.05),true,6);}
// a rail (posts + top and mid bar) from (x0,z0) to (x1,z1) standing on y
function dwRail(x0,z0,x1,z1,y,h){h=h||1;const c=jc(dwWood,.06);const L=Math.hypot(x1-x0,z1-z0);if(L<.1)return;const n=Math.max(1,Math.round(L/1.3));
 for(let k=0;k<=n;k++){const t=k/n,px=x0+(x1-x0)*t,pz=z0+(z1-z0)*t;beam('wood',[px,y,pz],[px,y+h,pz],.06,c,true,5);}
 beam('wood',[x0,y+h,z0],[x1,y+h,z1],.07,c);beam('wood',[x0,y+h*.5,z0],[x1,y+h*.5,z1],.04,c);}
// a ladder leaning in the current frame: foot at z=za on the ground, top at (zb,yb); w wide, centred on x
function dwLean(x,w,za,zb,yb){const c=jc(0x5a5048,.05);const L=Math.hypot(za-zb,yb);for(const sx of [-1,1])beam('iron',[x+sx*w/2,0,za],[x+sx*w/2,yb,zb],.05,c);
 for(let k=1;k*.32<L;k++){const t=k*.32/L;beam('iron',[x-w/2,yb*t,za+(zb-za)*t],[x+w/2,yb*t,za+(zb-za)*t],.035,c,true,5);}}
// solar panel on a small frame: tilted toward +z, base at y, w x d (plan depth)
function dwSolar(x,y,z,w,d,ry,tilt){W(x,y,z,ry||0,()=>{const t=tilt===undefined?.5:tilt,c=Math.cos(t)*d/2,h=Math.sin(t)*d,fc=jc(0x8a8a86,.05);
 plane4('glass',[-w/2,h+.2,-c],[w/2,h+.2,-c],[-w/2,.2,c],[w/2,.2,c],.05,jc(0x1c2c50,.05));
 for(const [a,b] of [[[-w/2,h+.2,-c],[w/2,h+.2,-c]],[[-w/2,.2,c],[w/2,.2,c]],[[-w/2,h+.2,-c],[-w/2,.2,c]],[[w/2,h+.2,-c],[w/2,.2,c]],[[0,h+.2,-c],[0,.2,c]]])beam('iron',a,b,.05,fc);
 for(const sx of [-.4,.4]){beam('iron',[sx*w,0,-c],[sx*w,h+.2,-c],.05,fc);beam('iron',[sx*w,0,c],[sx*w,.2,c],.05,fc);}});}
// bright patchwork sheets nailed on a wall face (frame: at (x,y,z) facing +z via ry), avoiding nothing: use on solid wall runs only
function dwPatches(x,y,z,w,h,ry,n,z0){W(x,y,z,ry||0,()=>{for(let k=0;k<n;k++){const pw=rr(.5,1.2),ph=rr(.4,.9);box(pick(['sheet','corr','sheet']),rr(-w/2+pw/2,w/2-pw/2),rr(0,Math.max(0,h-ph)),(z0||.06),pw,ph,.03,pick([P('paint'),P('rust'),P('galv'),P('paint')]),0,0,rr(-.05,.05));}});}
// wall quad in the plane z (x0..x1) with heights hA at x0 and hB at x1 (a trapezoid wall under a sloping roof)
function dwTrap(mk,x0,x1,z,y0,hA,hB,col){poly(mk,[[x0,y0,z],[x1,y0,z],[x1,hB,z],[x0,hA,z]],col,true);}

// varied wall skins so no wall reads as a field of thin horizontal stripes. kind: 'batten' (vertical boards + battens) 'corr' (corrugated panel) 'sheet' (large painted sheet panels) 'plank' (one big panel)
function dwBright(h,k){const f=(v)=>Math.min(255,Math.round(v*k));return (f((h>>16)&255)<<16)|(f((h>>8)&255)<<8)|f(h&255);}
function dwSkin(x,y,z,w,h,ry,kind,col){if(w<.05||h<.05)return;W(x,y,z,ry||0,()=>{const cc=[0x3b7f6e,0x9a3a2c,0x2f5f8f,0xc99a2e,0x7a5c3c],c=jc(dwBright(col===undefined?pick(cc):col,kind==='batten'||kind==='plank'?1.35:1.5),.05),fr=jc(0x5c4630,.06);
 if(kind==='corr'){box('corr',0,0,0,w,h,.07,c);box('wood',0,0,-.02,w,.1,.11,fr);box('wood',0,h-.1,-.02,w,.1,.11,fr);}
 else if(kind==='sheet'){const n=Math.max(1,Math.round(w/1.5));for(let k=0;k<n;k++){const pw=w/n;box('sheet',-w/2+pw*(k+.5),0,0,pw-.02,h,.06,k===0?c:jc(dwBright(pick([0x3b7f6e,0x9a3a2c,0x2f5f8f,0xc99a2e,0xb4b8b8,0x8a4a2a]),1.4),.05));}box('wood',0,0,-.02,w,.08,.1,fr);box('wood',0,h-.08,-.02,w,.08,.1,fr);}
 else if(kind==='plank'){box('plank',0,0,0,w,h,.1,c);for(const sx of [-1,1])box('wood',sx*(w/2-.05),0,.02,.1,h,.14,fr);}
 else{box('wood',0,0,0,w,h,.09,c);const n=Math.max(1,Math.round(w/.55));for(let k=0;k<=n;k++)box('wood',-w/2+w*k/n,0,.04,.06,h,.04,jc(0x4a3a2c,.06));}});}
// a wall with clear openings: ops {x0,x1,y0,y1} relative to the wall centre and its base; wall stops short of every opening
function dwWallOpen(x,y,z,w,h,ry,kind,col,ops){W(x,y,z,ry||0,()=>{let cur=-w/2;const o=ops.slice().sort((a,b)=>a.x0-b.x0);
 for(const p of o){dwSkin((cur+p.x0)/2,0,0,p.x0-cur,h,0,kind,col);if(p.y0>.02)dwSkin((p.x0+p.x1)/2,0,0,p.x1-p.x0,p.y0,0,kind,col);if(p.y1<h-.02)dwSkin((p.x0+p.x1)/2,p.y1,0,p.x1-p.x0,h-p.y1,0,kind,col);cur=p.x1;}
 dwSkin((cur+w/2)/2,0,0,w/2-cur,h,0,kind,col);});}
// side wall (in a plane x=const) under a sloping roof: from z0 to z1, heights hA at z0 and hB at z1
function dwTrapZ(mk,x,z0,z1,y0,hA,hB,col){poly(mk,[[x,y0,z0],[x,y0,z1],[x,hB,z1],[x,hA,z0]],col,true);}
// a cut in a roof or skin: dark rim, coaming, lit interior, and a lid ('open' thrown back on a hinge, 'glass' a pane set in the frame). rx tilts it to follow a slope
function dwHatch(x,y,z,w,d,rx,mode){pushM(TF(x,y,z,0,rx||0,0));const rc=jc(0x7a4a2a,.06),dk=jc(0x2a2622,.04);
 box('iron',0,-.09,0,w+.2,.1,d+.2,dk);box('glow',0,-.02,0,w,.03,d,jc(0x9a6a34,.04));
 for(const sx of [-1,1])box('iron',sx*(w/2+.04),-.06,0,.08,.32,d+.16,rc);
 for(const sz of [-1,1])box('iron',0,-.06,sz*(d/2+.04),w+.16,.32,.08,rc);
 if(mode==='glass'){box('glass',0,.16,0,w,.03,d,jc(0x8ab8b0,.05));box('iron',0,.17,0,.05,.04,d,dk);box('iron',0,.17,0,w,.04,.05,dk);}
 else{const t=-1.9,L=d+.12,hz=-d/2-.05,hy=.26,dy=-Math.sin(t),dz=Math.cos(t);box('sheet',0,hy+dy*L/2-.03,hz+dz*L/2,w+.12,.06,L,jc(0x8a4a2a,.05),0,t,0);
  beam('iron',[-w/2-.06,hy,hz],[w/2+.06,hy,hz],.06,dk);beam('iron',[w/2-.1,hy,d/2+.02],[w/2-.1,hy+dy*L*.6,hz+dz*L*.6],.04,dk);}
 popM();}

// ---------------------------------------------------------------- dw-tire: earthship-style round hut
defBuilding({key:'dw-tire',name:'Tyre hut',seed:4030,tags:{type:['single-family dwelling'],size:'small',core:'earth-filled tyres',materials:['tyres','earth','bottle glass','sheet metal']},w:11,d:11,h:5.4,build:dwTire});
function dwTire(o){
 const s=o.v===1?-1:1,R=3.5,H1=6*TYR.H,HW=2.55,dg=.28,fa=PI/2,wa=fa-s*1.15,wh=1.5/R,rise=1.25,RE=R+.75;
 const plast=jc(pick([0xd4b08a,0xcf9a72,0xc9a878]),.03);
 const gaps=[[fa-dg,fa+dg],[wa-wh,wa+wh]].sort((a,b)=>a[0]-b[0]);
 cyl('earth',0,0,0,R-.24,.1,jc(0x9a8a70,.05),20);
 tireRing(0,0,R,6,fa+dg,fa+TAU-dg);
 // plastered upper wall in two arcs, with the doorway and the window left open
 sector('earth',0,0,R-.3,R+.3,gaps[0][1],gaps[1][0],H1,HW,plast);sector('earth',0,0,R-.3,R+.3,gaps[1][1],gaps[0][0]+TAU,H1,HW,plast);
 sector('earth',0,0,R-.3,R+.3,fa-dg,fa+dg,2.25,HW,plast);
 // the bottle-glass window: stepped tiers in a timber frame, plaster infill in the corners
 const tiers=[[3.0,H1,1.85],[2.3,1.85,2.2],[1.5,2.2,2.42]];
 for(const [w,y0,y1] of tiers){const hw=w/2/R;
  W(Math.cos(wa)*R,0,Math.sin(wa)*R,PI/2-wa,()=>bottleWall(0,y0,0,w,y1-y0,0,{th:.34}));
  if(w<3){sector('earth',0,0,R-.3,R+.3,wa-wh,wa-hw,y0,y1,plast);sector('earth',0,0,R-.3,R+.3,wa+hw,wa+wh,y0,y1,plast);}}
 sector('earth',0,0,R-.3,R+.3,wa-wh,wa+wh,2.42,HW,plast);
 // a small second bottle light at the back
 {const ab=fa+s*2.4;W(Math.cos(ab)*R,0,Math.sin(ab)*R,PI/2-ab,()=>{bottleWall(0,1.5,0,1.1,.8,0,{th:.34});});}
 // door with timber frame
 const dz0=R*Math.cos(.14);   // doorway: no tyres inside the opening, timber jambs and lintel close the gap between it and the ring
 for(const sx of [-1,1])box('wood',sx*.78,0,dz0,.46,2.25,.9,jc(0x6a5238,.06));
 box('wood',0,2.05,dz0,2.1,.2,.9,jc(0x6a5238,.06));box('plank',0,0,dz0,1.1,.08,.9,jc(0x6a5a44,.06));
 door(0,.04,dz0-.15,1.0,1.95,{step:false});
 tire(0,.12,R+.85,TYR.R,TYR.t,undefined,rng()*TAU);
 // ring beam and the shallow cone roof of sheet on rafters
 const nb=16;for(let k=0;k<nb;k++){const a0=k/nb*TAU,a1=(k+1)/nb*TAU;beam('wood',[Math.cos(a0)*(R+.05),HW+.1,Math.sin(a0)*(R+.05)],[Math.cos(a1)*(R+.05),HW+.1,Math.sin(a1)*(R+.05)],.3,jc(0x6a5238,.06));}
 const rc=jc(pick([0xb0522e,0x3f7a72,0x8a8a84,0xc99a2e]),.05);
 cyl('corr',0,HW+.05,0,RE,rise,rc,20,.9,true);cyl('iron',0,HW+.03,0,RE+.03,.1,jc(0x5a4a3c,.05),20);
 for(let k=0;k<20;k++){const a=k/20*TAU;beam('wood',[Math.cos(a)*(R-.5),HW,Math.sin(a)*(R-.5)],[Math.cos(a)*(RE+.05),HW-.02,Math.sin(a)*(RE+.05)],.12,jc(dwWood,.06));}
 const top=HW+.05+rise;
 cyl('iron',0,top,0,.95,.14,jc(0x4a4038,.05),12);cyl('glass',0,top+.14,0,.78,.55,jc(pick(PAL.glass),.05),10);for(let k=0;k<8;k++){const a=k/8*TAU;beam('iron',[Math.cos(a)*.78,top+.14,Math.sin(a)*.78],[Math.cos(a)*.78,top+.69,Math.sin(a)*.78],.05,jc(0x4a4038,.05));}
 cone('sheet',0,top+.69,0,1.05,.4,jc(0x8a8a84,.05),10);stovepipe(.6,top-.1,-.9,1.5);
 // solar panel on the roof slope, facing out on the side away from the window
 {const ra=fa+s*.7,ry=(r)=>HW+.05+(RE-r)/(RE-.9)*rise+.16,pts=[];const rc=2.85,hl=.65,hw2=.8,ux=Math.cos(ra),uz=Math.sin(ra),tx=-uz,tz=ux;   /* a true rectangle: tangential width 1.6, radial length 1.3, so glass and frame share the same four corners */
  for(const sr of [-hl,hl])for(const st of [-hw2,hw2]){const r=rc+sr;pts.push([ux*r+tx*st,ry(r),uz*r+tz*st]);}
  plane4('glass',pts[0],pts[1],pts[2],pts[3],.05,jc(0x1c2c50,.05));for(const [a,b] of [[0,1],[2,3],[0,2],[1,3]])beam('iron',pts[a],pts[b],.05,jc(0x8a8a86,.05));
  for(const p of [pts[0],pts[1],pts[2],pts[3]])beam('iron',[p[0],p[1]-.16,p[2]],p,.05,jc(0x4a4038,.05));}
 // berm of earth behind, planted
 for(let a=PI+.2;a<TAU-.1;a+=.42){const rr_=R+.8+rr(-.1,.1);sph('earth',Math.cos(a)*rr_,-.1,Math.sin(a)*rr_,1.7,jc(0x8f7a5a,.05),.9);}
 for(let a=PI+.35;a<TAU-.25;a+=.5)plant('groundcover',Math.cos(a)*(R+.8),1.6,Math.sin(a)*(R+.8),{r:.6,moisture:'arid',cultivated:false});
 // ladder to the roof (side), tyre planters, water butt, junk
 {const al=fa+s*1.0;W(Math.cos(al)*(R+.3),0,Math.sin(al)*(R+.3),PI/2-al,()=>dwLean(0,.5,1.6,.55,3.0));}
 for(const [cx,cz] of [[Math.cos(wa)*(R+1.15),Math.sin(wa)*(R+1.15)],[-s*1.9,R+1.5]]){tireRing(cx,cz,.72,2,0,TAU);cyl('plain',cx,.05,cz,.6,.36,jc(0x4a3626,.06),10);plant('groundcover',cx,.45,cz,{r:.62});plant('flower',cx+.15,.5,cz,{r:.25});}
 {const al=fa+s*2.5;waterButt(Math.cos(al)*(R+.9),1.0,Math.sin(al)*(R+.9),.55,.9);}
 tireStack(s*2.6,R+1.7,3);barrel(-s*3.2,0,R+1.6);crate(-s*3.5,0,R+2.1,.6,.3);junkPile(-s*4.3,R-.6,.9,6);lamp(s*1.0,0,R+1.6,2.6);
 // SOCKETS: awning over the door, banner on a pole by the door, emblem on the plaster between door and window
 sock('awning',0,2.35,R+.3,0,{w:1.8,d:1.3,drop:.5,h:2.4});
 dwPole(-s*3.0,0,R+1.3,4.6,.1);sock('banner',-s*3.0,4.5,R+1.33,0,{w:.7,h:1.9});
 {const ae=fa-s*.5;W(Math.cos(ae)*(R+.31),0,Math.sin(ae)*(R+.31),PI/2-ae,()=>sock('emblem',0,1.85,0,0,{w:.6,h:.6}));}}


// ---------------------------------------------------------------- dw-bus: a wrecked school bus as the home
defBuilding({key:'dw-bus',name:'Bus house',seed:4040,tags:{type:['single-family dwelling'],size:'small',core:'school bus',materials:['bus body','plank','sheet metal','tyres']},w:14,d:9,h:5.2,build:dwBus});
function dwBus(o){
 const cx=2.2,cz=-1.7,L=10.6,zf=cz+1.2,bx0=cx-4.6;                  // bus body spans cx-4.6 .. cx+3.8, side face z=zf
 W(cx,0,cz,0,()=>bus({len:L,col:o.v===1?0x3b7f8e:(o.v===2?0x9a3a2c:0xd8a020)}));
 // rust patches and a stripe on the flank, a door in use, tyre steps
 dwPatches(cx-3.4,.85,zf,1.6,.5,0,2,.02);
 door(cx+2.35,.8,zf,.9,1.5,{step:false});stairs(cx+2.35,0,zf+1.9,cx+2.35,.8,zf+.12,.9,{steel:true});
 // deck along the side, canopy above on posts, stairs down to the yard
 const dx=cx-.6,dw=4.6,dz0=zf,dd=2.0;
 deck(dx,.8,dz0+dd/2,dw,dd);
 dwRail(cx-2.9,zf+dd,cx-2.05,zf+dd,.8);dwRail(cx-1.0,zf+dd,cx+1.7,zf+dd,.8);dwRail(cx-2.9,zf,cx-2.9,zf+dd,.8);dwRail(cx+1.7,zf+dd,cx+1.7,zf+.9,.8);
 stairs(cx-1.5,0,zf+dd+1.9,cx-1.5,.8,zf+dd+.05,1.0);
 box('plank',cx-1.3,2.45,zf-.02,3.6,.4,.08,jc(0x5c4630,.06));                       // fascia lashed along the bus roof edge
 leanRoof(cx-1.3,zf,3.6,dd+.3,2.85,2.65,{col:jc(o.v===1?0xc45a30:0x3f7a72,.05)});
 // deck furniture: a table, tyre seats, a hanging bottle string
 box('plank',cx-.4,.8,zf+1.0,.9,.06,.6,P('woodD'));for(const sx of [-.35,.35])box('wood',cx-.4+sx,.86,zf+1.0,.06,.6,.06,jc(dwWood,.05));
 tire(cx-2.2,.92,zf+1.0,TYR.R*.8,TYR.t*.8);tire(cx+.5,.92,zf+.6,TYR.R*.8,TYR.t*.8);
 bottleString([cx-3.0,2.62,zf+dd+.35],[cx+.4,2.62,zf+dd+.35],7);
 // rear lean-to kitchen of planks and sheet against the back of the bus
 const kx1=bx0,kx0=bx0-3.4,kz0=cz-1.5,kz1=cz+1.5,hN=2.75,hF=2.15,kc=(kx0+kx1)/2;
 box('plank',kc,0,cz,3.4,.16,3.0,jc(0x6a5a44,.08));
 // walls: front with a clear door and hatch opening, corrugated back, batten end wall; all stop under the sloped roof
 dwWallOpen(kc,.16,kz1,3.4,hF-.16,0,'sheet',pick([0x3b7f6e,0x2f5f8f]),[{x0:-1.35,x1:-.45,y0:0,y1:1.9},{x0:.1,x1:1.3,y0:.75,y1:1.7}]);
 dwTrap('corr',kx0,kx1,kz1,hF,hF,hN,jc(0x9a3a2c,.05));
 dwTrap('corr',kx0,kx1,kz0,.16,hF,hN,jc(pick([0xc99a2e,0x3b7f6e]),.05));
 dwSkin(kx0,.16,cz,3.0,hF-.16,-PI/2,'batten',pick([0x7a5c3c,0x9a7a52]));
 dwPatches(kc-.3,.3,kz0-.05,2.2,1.4,PI,2,.05);
 plane4('corr',[kx1+.05,hN+.02,kz0-.3],[kx1+.05,hN+.02,kz1+.3],[kx0-.35,hF-.03,kz0-.3],[kx0-.35,hF-.03,kz1+.3],.07,o.v===1?P('rust'):P('galv'));
 for(const z of [kz0-.3,kz1+.3])beam('wood',[kx1,hN-.02,z],[kx0-.35,hF-.05,z],.09,jc(dwWood,.06));
 // serving hatch with shelf and shutter, and a door, on the +z wall
 win(kc+.7,.95,kz1,1.1,.85,{lit:o.v===1});box('plank',kc+.7,.92,kz1+.28,1.5,.06,.5,jc(0x6a5238,.06));
 door(kc-.9,.16,kz1+.03,.85,1.85,{step:true});
 // roof furniture: bus roof garden, solar, stovepipes
 const ry=2.45;
 for(const [px,pw] of [[cx-3.4,1.5],[cx-1.6,1.5]]){box('plank',px,ry,cz,pw,.42,1.3,jc(0x6a5238,.06));box('plain',px,ry+.4,cz,pw-.1,.04,1.2,jc(0x4a3626,.06));
  for(let k=0;k<4;k++)plant(k%2?'crop':'shrub',px+rr(-pw/2+.25,pw/2-.25),ry+.42,cz+rr(-.4,.4),{r:rr(.22,.32),h:.5});}
 dwSolar(cx+1.1,ry,cz,2.8,1.5,0,.5);stovepipe(cx-.3,ry,cz-.5,1.3);stovepipe(kc-.6,hN-.3,cz+.3,1.7);
 // yard: a water butt on stilts at the kitchen, barrels, crate, tyre seat, junk
 waterButt(kx0+1.0,1.5,kz0-1.2,.6,.9);barrel(kx0+.2,0,kz1+.7);barrel(kx0+.7,0,kz1+1.1);crate(kc-1.6,0,kz1+1.2,.6,.3);tireStack(cx+4.9,zf+1.2,2);tire(cx+5.0,.12,zf+2.6,TYR.R,TYR.t);
 junkPile(kx0+.2,kz0-1.6,1.0,6);lamp(cx+3.0,0,zf+2.4,2.9);
 // poles: banner in the yard, flag at the kitchen's rear corner
 dwPole(cx+4.4,0,zf+3.0,4.3,.1);dwPole(kx0-.3,0,kz0,4.7,.1);
 // SOCKETS
 sock('awning',cx+2.35,2.3,zf,0,{w:1.5,d:1.1,drop:.4,h:1.9});
 sock('awning',kc+.7,1.9,kz1,0,{w:1.6,d:.9,drop:.3,h:1.6});
 sock('banner',cx+4.4,4.2,zf+3.03,0,{w:.7,h:1.8});
 sock('flag',kx0-.3,4.7,kz0,0,{w:1.0,h:.6});
 sock('emblem',cx-.2,1.13,zf+.02,0,{w:.55,h:.55});}


// ---------------------------------------------------------------- dw-tank: a storage tank as a pod (lying, or standing in variant 1)
defBuilding({key:'dw-tank',name:'Tank pod',seed:4050,tags:{type:['single-family dwelling'],size:'small',core:'storage tank',materials:['tank steel','plank','sheet metal','tyres','concrete']},w:11,d:9,h:5.6,build:dwTank});
// a welded-on door vestibule with jambs, lintel, threshold and a hood; the door leaf stands proud of the curved skin. (x, sill y, face z, top y)
function dwPodDoor(x,y,zFace,depth,top,col){
 box('sheet',x,y,zFace-depth/2,1.7,top-y,depth,jc(0x8a3a2c,.05));box('sheet',x,top,zFace-depth/2-.1,1.95,.07,depth+.35,jc(0x8a4a2a,.05));
 door(x,y+.04,zFace+.01,.95,1.7,{step:false,col:col});
 for(const sx of [-1,1])box('wood',x+sx*.58,y,zFace-.02,.13,1.85,.14,jc(0x5c4630,.06));box('wood',x,y+1.85,zFace-.02,1.4,.14,.14,jc(0x5c4630,.06));
 box('plank',x,y-.05,zFace+.12,1.3,.07,.5,jc(0x6a5238,.06));}
function dwTank(o){
 const col=o.v===1?0x9a5a3a:0x4a8f92;
 if(o.v===1)return dwTankStand(o,col);
 const r=1.7,L=8.4,cy=r+.35;
 tankH({r:r,L:L,col:col});
 // tyre cradle: earth-filled stacks chocked against the belly
 for(const sx of [-1,1])for(const sz of [-1,1])tireStack(sx*L*.28,sz*(r+.05),2);
 for(const sx of [-1,1])tireStack(sx*(L/2+.3),0,2);
 // skin cut: a real door in a welded vestibule under the awning, round ports, and roof openings
 dwPodDoor(-1.4,1.3,1.86,.46,3.15,0xe0b030);
 for(const px of [.9,2.0])porthole(px,cy,1.62,.32);
 porthole(-3.4,cy+.15,Math.sqrt(r*r-.15*.15)-.06,.26);
 dwHatch(1.4,3.7,0,1.0,.8,0,'open');                       // hatch with its lid thrown back, lit interior below
 dwHatch(-3.0,3.52,.85,1.0,.8,.52,'glass');                // glass panel set in a framed cut in the sloping skin
 // porch
 deck(-1.6,1.3,2.25,4.0,1.8);
 dwRail(-3.6,3.15,-3.25,3.15,1.3);dwRail(-2.15,3.15,.4,3.15,1.3);dwRail(-3.6,1.5,-3.6,3.15,1.3);dwRail(.4,3.15,.4,1.5,1.3);
 stairs(-2.7,0,5.1,-2.7,1.3,3.2,1.1,{steel:true});
 // ladder to the roof, stovepipe, solar, flag pole
 dwLean(3.9,.5,2.9,1.0,3.35);
 dwSolar(3.15,3.55,0,1.9,1.2,0,.4);stovepipe(-1.8,3.6,.1,1.6);
 // rear lean-to against the flank: corrugated sides and roof, batten back wall, sitting under the roof
 W(0,0,0,PI,()=>{
  leanRoof(-2.3,1.6,3.8,2.4,2.55,1.95,{col:P('galv'),posts:false});
  dwTrapZ('corr',-4.2,1.6,4.0,.16,2.55,1.95,jc(pick([0xc99a2e,0x7a2e28]),.05));dwTrapZ('corr',-.4,1.6,4.0,.16,2.55,1.95,jc(pick([0x3b7f6e,0x2f5f8f]),.05));
  dwSkin(-2.3,.16,4.0,3.8,1.79,0,'batten',pick([0x9a7a52,0x3b7f6e]));box('plank',-2.3,0,2.8,3.8,.16,2.4,jc(0x6a5a44,.08));
  for(const px of [-4.2,-.4])beam('wood',[px,0,4.0],[px,1.95,4.0],.1,jc(0x5c4630,.06));});
 waterButt(4.4,1.9,-1.9,.6,.9);pipe('iron',[[3.5,2.0,-3.6],[4.4,2.0,-3.6],[4.4,2.8,-1.9]],.03,jc(0x6a6a66,.05));
 barrel(5.2,0,1.8);barrel(5.7,0,1.3);crate(4.9,0,2.6,.6,.2);junkPile(5.0,-3.2,1.1,7);lamp(1.3,0,3.4,3.0);
 dwPole(.55,0,3.35,3.8,.1);dwPole(1.2,3.72,-.4,5.4,.06);
 // SOCKETS
 sock('awning',-1.4,3.1,1.86,0,{w:1.5,d:1.3,drop:.45,h:1.35});
 sock('banner',.55,3.7,3.38,0,{w:.7,h:1.6});
 sock('flag',1.2,5.4,-.4,0,{w:1.1,h:.6});
 sock('emblem',3.05,cy,1.71,0,{w:.6,h:.6});}
// standing tank (variant 1): tyre-buttressed, welded door vestibule at porch height, ports round the skin, hatch on the cap, ladder to the roof
function dwTankStand(o,col){
 const r=2.1,h=5.2;tankV({r:r,h:h,col:col});
 for(let a=.5;a<TAU;a+=.5)if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a))-PI/2)>.6)for(let k=0;k<2;k++)tire(Math.cos(a)*(r+.5),.12+k*.24,Math.sin(a)*(r+.5),TYR.R,TYR.t,undefined,rng()*TAU);
 deck(0,1.1,r+.7,3.4,1.9);
 dwRail(-1.7,r+1.65,-1.35,r+1.65,1.1);dwRail(-.25,r+1.65,1.7,r+1.65,1.1);dwRail(-1.7,r-.2,-1.7,r+1.65,1.1);dwRail(1.7,r+1.65,1.7,r-.2,1.1);
 stairs(-.8,0,r+3.5,-.8,1.1,r+1.65,1.0,{steel:true});
 dwPodDoor(0,1.1,r+.24,.5,2.95,0xe0b030);
 for(const [a,y] of [[.85,3.2],[-.85,3.2],[.85,4.6],[-.85,4.6],[PI-.5,3.4],[PI+.5,3.4]])W(Math.sin(a)*r,0,Math.cos(a)*r,a,()=>porthole(0,y,-.02,.3));
 W(0,0,-(r+.05),PI,()=>ladder(0,.1,0,h+.5,0));
 dwHatch(0,6.27,0,.7,.6,0,'open');
 dwSolar(-1.2,5.85,.9,1.8,1.0,0,.35);stovepipe(1.3,6.0,-.5,1.5);
 waterButt(-3.6,1.6,.3,.65,.95);
 // lean-to shed on the east flank
 W(r-.05,0,0,PI/2,()=>{leanRoof(0,0,3.6,2.2,2.8,2.2,{col:jc(0x8a4a2a,.05),posts:false});
  dwTrapZ('corr',-1.8,0,2.2,.16,2.8,2.2,jc(pick([0x9a7a52,0xc99a2e]),.06));dwTrapZ('corr',1.8,0,2.2,.16,2.8,2.2,jc(pick([0x9a7a52,0xc99a2e]),.06));
  dwSkin(0,.16,2.2,3.6,2.04,0,'batten',pick([0x7a2e28,0x3b7f6e]));box('plank',0,0,1.1,3.6,.16,2.2,jc(0x6a5a44,.08));
  for(const px of [-1.8,1.8])beam('wood',[px,0,2.2],[px,2.2,2.2],.1,jc(0x5c4630,.06));});
 barrel(3.9,0,-1.9);crate(-3.2,0,2.9,.6,.4);tireStack(3.4,3.0,3);junkPile(-3.6,-2.6,1.0,6);lamp(2.4,0,r+2.2,3.2);
 dwPole(2.7,0,r+1.9,4.4,.1);dwPole(-.2,6.2,-.9,7.4,.06);
 sock('awning',0,2.9,r+.24,0,{w:1.5,d:1.4,drop:.45,h:1.35});
 sock('banner',2.7,4.3,r+1.93,0,{w:.7,h:1.7});
 sock('flag',-.2,7.4,-.9,0,{w:1.1,h:.6});
 W(Math.sin(1.75)*r,0,Math.cos(1.75)*r,1.75,()=>sock('emblem',0,3.9,.02,0,{w:.7,h:.7}));}

// ---------------------------------------------------------------- dw-bottle: the pretty one, a timber-framed cottage of bottle-glass panels
defBuilding({key:'dw-bottle',name:'Bottle cottage',seed:4060,tags:{type:['single-family dwelling'],size:'small',core:'timber frame + bottle walls',materials:['bottle glass','timber','tyres and earth','corrugated sheet']},w:12,d:10,h:6.4,build:dwBottle});
function dwBottle(o){
 const x0=-3.7,x1=3.7,zf=2.4,zb=-2.4,y0=.5,H=2.6,yt=y0+H;
 const pal=o.v===1?[0x3b7f6e,0xc99a2e,0x7a2e28]:[0x2f6f8f,0xd8a020,0x9a3a2c];
 const frame=jc(0x5c4630,.06);
 // tyre-and-earth foundation course and plank floor
 tireWall(x0,zf,x1,zf,2);tireWall(x0,zb,x1,zb,2);tireWall(x0,zf,x0,zb,2);tireWall(x1,zf,x1,zb,2);
 box('plank',0,.3,0,7.6,.2,4.9,jc(0x6a5a44,.08));
 // timber frame: posts, sill and plate, corner braces
 const fx=[-3.7,-2.1,-.1,.9,2.3,3.7];
 for(const x of fx)for(const z of [zf,zb])box('wood',x,y0,z,.18,H,.18,jc(0x6a5238,.06));
 for(const z of [zf,zb]){box('wood',0,y0,z,7.6,.14,.2,frame);box('wood',0,yt-.14,z,7.6,.2,.22,frame);}
 for(const x of [x0,x1]){box('wood',x,y0,0,.18,H,.18,jc(0x6a5238,.06));box('wood',x,y0,0,.2,.14,4.9,frame);box('wood',x,yt-.14,0,.22,.2,4.9,frame);}
 for(const sx of [-1,1]){const bx=sx*3.7;beam('wood',[bx,y0+.1,zf+.02],[bx-sx*.9,yt-.1,zf+.02],.1,frame);}
 // front wall, complete around every opening: bottle panel | door wall with a real door opening | sheet pier | big bottle panel
 bottleWall(-2.9,1.0,zf,1.6,1.95,0,{th:.3});dwSkin(-2.9,y0,zf,1.6,.5,0,'batten',pal[1]);dwSkin(-2.9,2.95,zf,1.6,yt-2.95,0,'plank',pal[0]);
 dwWallOpen(-1.1,y0,zf,2.0,H,0,'batten',pal[0],[{x0:-.57,x1:.57,y0:0,y1:1.95}]);
 dwSkin(.4,y0,zf,1.0,H,0,'sheet',pal[2]);
 bottleWall(2.3,1.0,zf,2.8,1.95,0,{th:.3});dwSkin(2.3,y0,zf,2.8,.5,0,'batten',pal[1]);dwSkin(2.3,2.95,zf,2.8,yt-2.95,0,'plank',pal[0]);
 door(-1.1,y0,zf+.03,1.0,1.9,{step:false,col:pal[2]});box('wood',-1.1,y0+1.93,zf+.04,1.4,.12,.2,frame);
 // back and side walls, each with a bottle window let into a real opening
 dwWallOpen(0,y0,zb,7.4,H,PI,'corr',pal[0],[{x0:-2.0,x1:-.4,y0:.7,y1:1.8}]);bottleWall(1.2,1.2,zb,1.6,1.1,PI,{th:.3});dwPatches(0,y0+.3,zb-.06,2.8,H-.6,PI,2,0);
 for(const sx of [-1,1]){const c=sx>0?.2:-.2;dwWallOpen(sx*3.72,y0,0,4.8,H,sx*PI/2,sx<0?'sheet':'batten',sx<0?pal[1]:pal[2],[{x0:c-.75,x1:c+.75,y0:.7,y1:1.9}]);bottleWall(sx*3.72,1.2,-.2,1.5,1.2,sx*PI/2,{th:.3});}
 // gable roof of corrugated sheet with repair patches, ridge along x, and a ridge pole with the flag
 gableRoof(0,yt,0,7.6,4.9,1.95,{ov:.45,col:jc(pick([0xb4b8b8,0xc0c2bd]),.04)});
 {const hd=2.45+.45*.7,ri=1.95;for(const [sg,xa,xb,ta,tb,c] of [[1,-3.2,-.6,.12,.6,pal[1]],[1,1.0,3.4,.4,.85,pal[2]],[-1,-2.6,.4,.15,.55,pal[0]]])roofP('corr',xa,xb,sg*hd*(1-ta),yt+ri*ta+.04,sg*hd*(1-tb),yt+ri*tb+.04,.05,jc(c,.05));}
 dwPole(-3.6,yt+1.8,0,yt+3.5,.07);
 // brick chimney against the right gable
 box('earth',x1+.6,0,0,1.5,1.3,1.2,jc(0xa0553a,.05));box('earth',x1+.6,1.3,0,.95,yt+2.5-1.3,.95,jc(0xa0553a,.05));box('conc',x1+.6,yt+2.5,0,1.15,.14,1.15,jc(0x8a8478,.05));stovepipe(x1+.6,yt+2.64,0,.7);
 // porch: plank deck the width of the house, half roofed on posts, tyre step, rail, hanging bottles
 deck(0,y0,zf+1.0,7.6,2.0);
 leanRoof(2.1,zf,3.6,2.0,3.05,2.6,{col:jc(pal[2],.05)});
 dwRail(.1,zf+1.95,3.9,zf+1.95,y0);dwRail(3.9,zf+1.95,3.9,zf+.1,y0);
 bottleString([.2,2.5,zf+1.95],[3.8,2.5,zf+1.95],9);
 tire(-1.1,.12,zf+2.5,TYR.R,TYR.t,undefined,rng()*TAU);box('plank',-1.1,.26,zf+2.05,1.3,.06,.5,P('woodD'));
 box('plank',-2.9,y0+.05,zf+.32,1.4,.26,.3,jc(0x6a5238,.06));box('plain',-2.9,y0+.3,zf+.32,1.3,.03,.2,jc(0x4a3626,.06));for(let k=0;k<5;k++)plant(k%2?'flower':'crop',-2.9-.5+k*.25,y0+.3,zf+.32,{r:.14,h:.3});
 tireRing(-4.6,zf+1.1,.72,2);cyl('plain',-4.6,.05,zf+1.1,.6,.36,jc(0x4a3626,.06),10);plant('groundcover',-4.6,.45,zf+1.1,{r:.62});plant('flower',-4.45,.5,zf+1.1,{r:.25});
 barrel(x0-.6,0,-.3);barrel(x0-.6,0,.3);
 fenceRun(-4.8,zf+3.4,-1.6,zf+3.4,1.0,{type:'pickets'});fenceRun(1.4,zf+3.4,4.8,zf+3.4,1.0,{type:'pickets'});lamp(-1.1,0,zf+3.0,2.8);
 // SOCKETS
 sock('awning',-1.1,y0+2.0,zf,0,{w:1.6,d:1.3,drop:.45,h:1.55});
 sock('banner',3.4,2.6,zf+1.98,0,{w:.6,h:.75});
 sock('flag',-3.6,yt+3.5,0,0,{w:1.1,h:.6});
 sock('emblem',.4,y0+1.6,zf+.05,0,{w:.6,h:.6});}

// ---------------------------------------------------------------- dw-stilt: a plank-and-sheet box up on tall poles
defBuilding({key:'dw-stilt',name:'Stilt perch',seed:4070,tags:{type:['single-family dwelling'],size:'small',core:'salvaged poles and pipes',materials:['plank','sheet metal','poles','pipe','tarp']},w:9,d:11,h:9.6,build:dwStilt});
function dwStilt(o){
 const FY=4.6,hx=2.4,hz=2.0,H1=2.2,RY=FY+H1,pal=o.v===1?[0x3b7f6e,0xc99a2e]:[0x9a3a2c,0x2f6f8f];
 // poles and cross-bracing (mixed timber and rusty pipe)
 const pp=[[-hx,-hz],[hx,-hz],[-hx,hz],[hx,hz],[0,-hz],[0,hz]];
 pp.forEach(([x,z],i)=>{if(i%2)beam('iron',[x,0,z],[x,FY,z],.2,jc(0x7a4a2a,.08),true,8);else dwPole(x,0,z,FY,.24);cyl('conc',x,0,z,.28,.25,jc(0x8a8880,.05),8);});
 for(const z of [-hz,hz]){beam('iron',[-hx,.5,z],[0,2.6,z],.09,jc(0x6a4a30,.06),true,6);beam('iron',[0,.5,z],[hx,2.6,z],.09,jc(0x6a4a30,.06),true,6);beam('iron',[-hx,2.6,z],[0,4.5,z],.09,jc(0x6a4a30,.06),true,6);beam('iron',[hx,2.6,z],[0,4.5,z],.09,jc(0x6a4a30,.06),true,6);
  beam('wood',[-hx,2.4,z],[hx,2.4,z],.14,jc(dwWood,.06));}
 beam('wood',[-hx,2.4,-hz],[-hx,2.4,hz],.14,jc(dwWood,.06));beam('wood',[hx,2.4,-hz],[hx,2.4,hz],.14,jc(dwWood,.06));
 // floor and joists
 for(const x of [-hx,-hx/2,0,hx/2,hx])box('wood',x,FY-.42,0,.14,.14,hz*2+.4,jc(dwWood,.06));
 box('plank',0,FY-.28,0,hx*2+.5,.28,hz*2+.5,jc(0x6a5238,.06));
 // lower room: front wall with real door and window openings, corrugated back, batten and sheet sides
 dwWallOpen(0,FY,hz,hx*2,H1,0,'sheet',pal[0],[{x0:.48,x1:1.62,y0:0,y1:1.95},{x0:-1.98,x1:-.82,y0:.85,y1:1.95}]);
 door(1.05,FY,hz+.03,1.0,1.95,{step:false,col:pal[1]});win(-1.4,FY+.9,hz,1.0,.95,{shutters:true,lit:o.v===1});
 dwWallOpen(0,FY,-hz,hx*2,H1,PI,'corr',pal[0],[{x0:-1.5,x1:-.5,y0:.95,y1:1.85}]);W(0,0,-hz,PI,()=>win(-1.0,FY+.95,.02,.9,.8,{}));
 for(const sx of [-1,1])dwSkin(sx*hx,FY,0,hz*2,H1,sx*PI/2,sx<0?'batten':'corr',sx<0?pal[1]:pal[0]);
 dwPatches(-hx-.03,FY+.3,0,3.0,1.4,-PI/2,2,.05);
 // flat sheet roof resting on the walls, braced out over the deck
 roofP('corr',-hx-.3,hx+.3,hz+.4,RY+.04,-hz-.3,RY+.04,.08,P('galv'));
 for(const bx of [-1.8,0,1.8])beam('wood',[bx,RY-.55,hz+.03],[bx,RY+.02,hz+.4],.08,jc(dwWood,.06));
 // loft cabin on the roof: walls run up to the sloping roof, so nothing floats
 const cy0=RY+.08,cw=1.7,cd=1.5,zc=-.5,CH=1.8,A=cy0+CH,sl=.5/(2*cd);
 dwSkin(0,cy0,zc+cd,cw*2,CH,0,'plank',pal[1]);dwSkin(0,cy0,zc-cd,cw*2,CH+.5,PI,'corr',pal[1]);
 for(const sx of [-1,1])dwTrapZ('corr',sx*cw,zc+cd,zc-cd,cy0,A,A+.5,jc(pal[0],.05));
 win(-1.0,cy0+.6,zc+cd+.04,.8,.7,{lit:o.v===1});
 roofP('corr',-cw-.35,cw+.35,zc+cd+.4,A-sl*.4+.04,zc-cd-.3,A+.5+sl*.3+.04,.08,o.v===1?P('rust'):P('paint'));
 stovepipe(1.0,A+.25,zc-.4,1.4);
 // front deck around, ladder to the deck, steel stair with landing, rails
 deck(.925,FY,hz+.85,hx*2+1.85,1.7);
 dwRail(-hx,hz+1.7,hx+1.85,hz+1.7,FY);dwRail(-hx,hz,-hx,hz+1.7,FY);dwRail(hx+1.85,hz+1.7,hx+1.85,hz+.1,FY);
 deck(3.4,2.3,.7,1.7,2.4);
 dwRail(2.55,-.5,2.55,1.9,2.3);dwRail(4.25,-.5,4.25,1.9,2.3);dwRail(2.55,1.9,3.05,1.9,2.3);dwRail(3.75,1.9,4.25,1.9,2.3);
 stairs(3.4,0,-4.0,3.4,2.3,-.5,1.0,{steel:true});
 ladder(3.4,2.3,1.85,3.35,0);for(const sx of [-1,1]){beam('wood',[3.4+sx*.22,FY+.6,1.85],[3.4+sx*.22,FY+.6,2.05],.06,jc(dwWood,.06));beam('wood',[3.4+sx*.22,FY-.35,1.85],[3.4+sx*.22,FY-.35,2.05],.06,jc(dwWood,.06));}
 // water butt on stilts and gutter pipe, hoist beam with pulley and hanging crate, tarp shelter, junk
 waterButt(-3.8,2.6,-1.4,.65,1.0);pipe('iron',[[-hx-.25,RY,-1.4],[-3.3,RY,-1.4],[-3.8,RY-2.4,-1.4],[-3.8,3.7,-1.4]],.035,jc(0x6a6a66,.05));
 {const hx_=-1.65,hy=cy0+1.5;beam('wood',[hx_,hy,zc+cd],[hx_,hy+.05,4.6],.14,jc(dwWood,.06));beam('wood',[hx_,hy-.9,zc+cd],[hx_,hy,3.2],.09,jc(dwWood,.06));
  cyl('iron',hx_,hy-.3,4.6,.14,.16,jc(0x4a4038,.05),8);beam('plain',[hx_,hy,4.6],[hx_,FY+1.5,4.6],.015,jc(0x8a7a5a,.05),true,3);crate(hx_,FY+.9,4.6,.6,.3);}
 W(0,0,0,PI,()=>{tarp(0,FY-.4,hz,3.6,1.6,2.9,pick([0x3a6a8a,0x8a4a3a,0xb09a4a]),{poles:false});for(const sx of [-1,1])beam('wood',[sx*1.8,0,hz+1.6],[sx*1.8,FY-.4-2.9+.08,hz+1.6],.08,jc(dwWood,.06),true,6);});
 junkPile(-.6,1.3,1.4,9);tireStack(-2.6,3.4,3);barrel(-3.3,0,2.8);barrel(-3.8,0,2.4);crate(1.5,0,4.0,.6,.2);pallet(2.6,0,-3.5,1.2,.9,.4);lamp(-1.9,0,3.7,3.0);
 // SOCKETS: awning posts run from the door head to the ground
 sock('awning',1.05,FY+2.05,hz,0,{w:1.5,d:1.3,drop:.45,h:FY+2.05-.45});
 for(const sx of [-1,1])beam('wood',[1.05+sx*.45,A-.15,zc+cd],[1.05+sx*.45,A-.15,zc+cd+.07],.05,jc(dwWood,.06));
 sock('banner',1.05,A-.15,zc+cd+.07,0,{w:.7,h:1.25});
 sock('emblem',0,cy0+1.2,zc+cd+.05,0,{w:.5,h:.4});
 dwPole(-cw+.1,A+.5,zc-cd,A+1.9,.06);sock('flag',-cw+.1,A+1.9,zc-cd,0,{w:1.0,h:.5});}
