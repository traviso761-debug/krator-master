// prefix: is
// ================================================================= THE ISLANDER TOOLKIT: what both styles build with
// Piles and decks (both styles lift their houses), walls with openings, stairs and ladders, carved posts (the motif the two
// styles share most), finials (buffalo horns, carved figures, the white moon), boards along an edge, scrap (corrugated
// iron, tin, tarps, drums, tyres), megaliths (the East's tombs, the West's jumping stone), fences and palisades, lamps.
// Everything draws in the builder's current frame (origin on the ground at the plot centre, +z the front, y up).
// The roofs are in 41-is-roof.js. Colours are palette keys through P() unless a hex is given.
const IS_T=.12;   // wall and floor thickness
/* the yaw that turns a piece standing at (x,z) to face (tx,tz) (default: the centre) */
function isFace(x,z,tx,tz){return Math.atan2((tx||0)-x,(tz||0)-z);}
/* evenly spaced values from a to b, n of them (n >= 2) */
function isSpan(a,b,n){const o=[];for(let i=0;i<n;i++)o.push(n<2?(a+b)/2:a+(b-a)*i/(n-1));return o;}
/* draw fn's geometry outside the cut-away (a porch, a stair, a post that stays when the house opens) */
function isNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}
/* raise the cut-away's floor: geometry from here on keeps everything below y (a house on piles opens above its floor) */
function isCutFloor(y){CUTC=[CUTC[0],CUTC[1],CUTC[2]+y,CUTC[3]];}
/* ---------------------------------------------------------------- piles and decks */
/* a grid of piles on footing stones from the ground to `top`; tie beams both ways at o.beamY (o.beams false: none).
   o.r radius, o.mk material, o.col colour, o.square square posts, o.skip(x,z) leaves a pile out, o.stone false: no footing */
function isPiles(xs,zs,top,o){o=o||{};const r=o.r||.14,mk=o.mk||'wood',col=o.col||P('woodD');
 for(const x of xs)for(const z of zs){if(o.skip&&o.skip(x,z))continue;if(o.stone!==false)sph('stone',x,.06,z,r*2.1,P('stone'),.42,8);
  if(o.square)box(mk,x,0,z,r*2,top,r*2,col);else cyl(mk,x,0,z,r,top,col,8,o.rt);}
 if(o.beams!==false){const yb=o.beamY||top*.42,x0=xs[0],x1=xs[xs.length-1],z0=zs[0],z1=zs[zs.length-1];
  for(const z of zs)box(mk,(x0+x1)/2,yb,z,x1-x0+r*3,r*1.5,r*1.3,col);for(const x of xs)box(mk,x,yb+r*1.5,(z0+z1)/2,r*1.3,r*1.5,z1-z0+r*3,col);}}
/* a plank floor w x d whose top is at y, on a frame of edge beams (o.beam false: none) */
function isDeck(w,d,y,o){o=o||{};box(o.mk||'planks',o.x||0,y-IS_T,o.z||0,w,IS_T,d,o.col||P('planks'));
 if(o.beam!==false){const c=o.beamCol||P('woodD'),bh=.22;for(const s of [-1,1]){box('wood',(o.x||0),y-IS_T-bh,(o.z||0)+s*(d/2-.08),w,bh,.16,c);box('wood',(o.x||0)+s*(w/2-.08),y-IS_T-bh,(o.z||0),.16,bh,d,c);}}}
/* a railing round a deck edge from a to b ([x,z]) at deck height y: posts, a top rail, o.panel a lattice panel below */
function isRail(a,b,y,o){o=o||{};const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.ceil(L/1.4)+1),h=o.h||.9,c=o.col||P('woodD');
 for(let i=0;i<n;i++){const t=i/(n-1),x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);box('wood',x,y,z,.08,h,.08,c);}
 beam('wood',[a[0],y+h,a[1]],[b[0],y+h,b[1]],.07,c);
 if(o.panel){const ry=Math.atan2(b[0]-a[0],b[1]-a[1])-PI/2;W((a[0]+b[0])/2,y+.08,(a[1]+b[1])/2,ry,()=>box(o.panel,0,0,0,L,h-.16,.04,o.panelCol||WHITE));}}
/* ---------------------------------------------------------------- walls */
/* a wall along local x from -L/2 to L/2 at z = 0, its face +z, from y0 up h. opens: [{x, w, y (sill above y0), h, door}]
   (a door's sill is 0). o.t thickness, o.frame the jamb colour (false: none), o.shut a window's open shutters.
   A door() is declared for each door (the way out +z). */
function isWall(L,y0,h,mk,col,opens,o){o=o||{};const t=o.t||IS_T,fr=o.frame===undefined?P('woodD'):o.frame;opens=(opens||[]).slice().sort((a,b)=>a.x-b.x);let x=-L/2;
 const seg=(a,b,ya,yb)=>{if(b-a>.01&&yb-ya>.01)box(mk,(a+b)/2,y0+ya,0,b-a,yb-ya,t,col);};
 for(const q of opens){const a=q.x-q.w/2,b=q.x+q.w/2,sy=q.door?0:(q.y||.9);seg(x,a,0,h);seg(a,b,0,sy);seg(a,b,Math.min(h,sy+q.h),h);x=b;
  if(fr){for(const s of [a,b])box('wood',s,y0+sy,t*.6,.1,q.h,.06,fr);box('wood',q.x,y0+sy+q.h,t*.6,q.w+.2,.12,.07,fr);if(!q.door)box('wood',q.x,y0+sy-.08,t*.6,q.w+.16,.08,.1,fr);}
  if(q.door)door(q.x,y0,t/2,0,q.w);
  else if(o.shut!==false){for(const s of [-1,1])box(o.shutMk||'planks',q.x+s*(q.w*.75+.04),y0+sy,t*.5+.03,q.w/2,q.h,.04,o.shutCol||P('planks'));}}
 seg(x,L/2,0,h);}
/* four walls round a w x d room from y0 up h; o.front/back/left/right: openings for each side (isWall), o.mkf(side) a
   material per side, o.colf(side) its colour. The front faces +z; the side walls run between the front and back walls. */
function isWalls(w,d,y0,h,mk,col,o){o=o||{};const t=o.t||IS_T;
 const S=[['front',0,d/2-t/2,0,w],['back',0,-d/2+t/2,PI,w],['right',w/2-t/2,0,PI/2,d-2*t],['left',-w/2+t/2,0,-PI/2,d-2*t]];
 for(const [side,x,z,ry,L] of S){if(o.skip&&o.skip.includes(side))continue;W(x,0,z,ry,()=>isWall(L,y0,h,o.mkf?o.mkf(side):mk,o.colf?o.colf(side):col,o[side],o));}}
/* a wall of salvage: panels of random width in planks, tin, corrugated iron, bamboo and tarp, along local x (the scrap look) */
function isPatchWall(L,y0,h,o){o=o||{};let x=-L/2;const mks=o.mks||['reclaimed','tin','corrW','reclaimed','bamboo','corr','planks'];
 while(x<L/2-.05){const w=Math.min(L/2-x,rr(.7,1.6)),mk=pick(mks),c=mk==='reclaimed'||mk==='planks'?P('planks'):mk==='bamboo'?P('bamboo'):mk==='tin'?P('tin'):P('rust');
  const hh=h-rr(0,.25);box(mk,x+w/2,y0,rr(-.02,.02),w,hh,o.t||.06,c);x+=w;}
 for(const s of [-1,1])box('wood',s*(L/2-.05),y0,0,.1,h,.1,P('woodD'));}
/* ---------------------------------------------------------------- stairs and ladders */
/* a flight from y0 (at local z = run, outward) up to y1 (at z = 0), w wide, in a frame turned ry at (x,z). Returns the run. */
function isStair(x,z,ry,y0,y1,w,o){o=o||{};const n=Math.max(2,Math.ceil((y1-y0)/.21)),rise=(y1-y0)/n,go=o.go||.28,run=n*go,mk=o.mk||'planks',c=o.col||P('planks');
 W(x,0,z,ry,()=>{for(let i=0;i<n;i++)box(mk,0,y0+rise*(i+1)-.06,run-go*(i+.5),w,.06,go+.04,c);
  for(const s of [-1,1]){beam('wood',[s*w/2,y0,run+.05],[s*w/2,y1,0],.12,P('woodD'),false,undefined,.26);
   if(o.rail!==false){beam('wood',[s*(w/2+.04),y0+.95,run],[s*(w/2+.04),y1+.95,0],.06,P('woodD'));box('wood',s*(w/2+.04),y0,run,.07,.95,.07,P('woodD'));}}});return run;}
/* a ladder leaning from the ground (lean metres out along +z) up to y1, at (x,z) turned ry */
function isLadder(x,z,ry,y1,o){o=o||{};const w=o.w||.55,lean=o.lean===undefined?.6:o.lean,c=o.col||P('bamboo'),mk=o.mk||'bamboo';
 W(x,0,z,ry,()=>{for(const s of [-1,1])pole(mk,[s*w/2,0,lean],[s*w/2,y1+.5,0],.035,c,6);const n=Math.floor(y1/.32);for(let i=1;i<=n;i++){const t=i*.32/y1;pole(mk,[-w/2,t*y1,lean*(1-t)],[w/2,t*y1,lean*(1-t)],.025,c,5);}});}
/* a notched log ladder (the poor's and the granaries'): one log with steps cut in it */
function isLogLadder(x,z,ry,y1){W(x,0,z,ry,()=>{beam('wood',[0,0,.5],[0,y1,0],.13,P('wood'),true,8);const n=Math.floor(y1/.35);for(let i=1;i<=n;i++){const t=i/(n+1);box('wood',0,t*y1-.04,.5*(1-t)+.06,.2,.06,.1,P('woodD'));}});}
/* ---------------------------------------------------------------- carved posts, figures and finials (the shared motifs) */
/* a carved post (pou) at (x,y,z) h tall, radius r, facing ry: stacked ancestor figures, each a head with shell eyes and a
   red tongue, hands on the belly, a painted band under its feet. o.mk carvedR (the West's red) or carved (the East's natural);
   o.top 'figure' | 'moon' | 'horns' | 'none'; o.n figures (default by height) */
function isPou(x,y,z,h,r,o){o=o||{};const mk=o.mk||'carvedR',c=o.col||P(mk==='carvedR'?'carvR':'carvN'),ry=o.ry||0,n=o.n||Math.max(1,Math.floor(h/1.15));
 W(x,y,z,ry,()=>{cyl(mk,0,0,0,r,h,c,10);const step=h/n;
  for(let k=0;k<n;k++){const y0=k*step+.08,hs=Math.min(1,step/1.1);
   cyl('plain',0,y0,0,r*1.04,.06,P(k%2?'black':'white'),10);
   ellip(mk,0,y0+step*.72,r*.32,r*.95,step*.24,r*.7,c,0,10);                                  /* the head */
   for(const s of [-1,1]){sph('bone',s*r*.38,y0+step*.76,r*.92,.075*hs*r/.2,P('shell'),.8,8);sph('plain',s*r*.38,y0+step*.76,r*.98,.035*hs*r/.2,P('black'),1,6);   /* shell eyes */
    beam(mk,[s*r*.8,y0+step*.5,r*.5],[s*r*.25,y0+step*.28,r*.95],r*.18,c,true,6);}                 /* the arms, hands on the belly */
   box('plain',0,y0+step*.55,r*.92,r*.34,step*.12,r*.14,P('red'));                              /* the tongue */
   ellip(mk,0,y0+step*.3,r*.5,r*.7,step*.2,r*.55,c,0,8);}                                      /* the belly */
  if(o.top==='figure')isFigure(0,h,0,0,r*1.6,{mk,col:c});else if(o.top==='moon')isMoonDisc(0,h+r*1.2,r*.2,0,r*1.2);else if(o.top==='horns')isHorns(0,h,0,0,r*3);});}
/* a small carved figure (tekoteko) standing on a gable or a post: legs, body, a big head with shell eyes; s its height */
function isFigure(x,y,z,ry,s,o){o=o||{};const mk=o.mk||'carvedR',c=o.col||P(mk==='carvedR'?'carvR':'carvN');W(x,y,z,ry,()=>{for(const k of [-1,1])beam(mk,[k*s*.12,0,0],[k*s*.1,s*.32,0],s*.07,c,true,6);
 ellip(mk,0,s*.48,0,s*.17,s*.2,s*.13,c,0,8);ellip(mk,0,s*.8,0,s*.2,s*.2,s*.17,c,0,10);for(const k of [-1,1]){sph('bone',k*s*.08,s*.83,s*.15,s*.04,P('shell'),.8,6);beam(mk,[k*s*.17,s*.6,0],[k*s*.05,s*.42,s*.1],s*.05,c,true,5);}
 box('plain',0,s*.7,s*.15,s*.06,s*.06,s*.03,P('red'));});}
/* buffalo horns curving out and up from (x,y,z), span s (a Toraja and Batak gable finial, the trophy of a feast) */
function isHorns(x,y,z,ry,s,o){o=o||{};W(x,y,z,ry,()=>{for(const k of [-1,1])tube('bone',t=>[k*(s*.06+t*s*.5),t*t*s*.32+Math.sin(t*PI)*s*.06,-t*s*.05],t=>{const r=s*.07*(1-t*.85);return [r,r];},8,6,o.col||P('bone'),{caps:true});
 ellip('carved',0,0,0,s*.1,s*.08,s*.1,P('woodD'),0,8);});}
/* the white island moon on a disc (the Islanders' sign): an upright medallion facing ry, radius R */
function isMoonDisc(x,y,z,ry,R){W(x,y,z,ry,()=>{WX(0,0,0,0,PI/2,0,()=>medallion('medMoon',0,0,0,R*2,{round:true}));cyl('wood',0,-R*1.05,-.04,.04,R*.2,P('woodD'),6);});}
/* a carved board along a polyline (a bargeboard on a gable edge): width along the edge's plane w2 (o.h), thickness t */
function isBoard(pts,h,t,mk,col){for(let i=0;i<pts.length-1;i++)beam(mk,pts[i],pts[i+1],t,col,false,undefined,h);}
/* ---------------------------------------------------------------- scrap */
/* an oil drum standing at (x,y,z): painted, two rolled hoops, a lid; o.lie lays it on its side turned ry */
function isDrum(x,y,z,o){o=o||{};const c=P(o.col||pick(['drumR','drumB','drumY','galv'])),r=.29,h=.88;
 const draw=()=>{cyl('plain',0,0,0,r,h,c,12);for(const yy of [.29,.59])cyl('iron',0,yy,0,r*1.03,.03,P('iron'),12);cyl('tin',0,h,0,r*.98,.012,P('tin'),12);};
 if(o.lie)WX(x,y+r,z,o.ry||0,PI/2,0,()=>W(0,-h/2,0,0,draw));else W(x,y,z,o.ry||0,draw);}
/* a tyre lying flat at (x,y,z) (the scrap roofs are held down by them) */
function isTyre(x,y,z,o){o=o||{};ring('tyre',x,y+.1,z,.3,.11,P('tyre'),o.ry||0,0,0,16);}
/* a tarp thrown over a ridge or a frame: a sagging sheet with corners a,b,c,d (anticlockwise from above), drooping `sag` */
function isTarp(a,b,c,d,sag,col){withCloth(clothHang(1.5,.03),()=>psurf('tarp',(u,v)=>{const p=[0,1,2].map(k=>lerp(lerp(a[k],b[k],u),lerp(d[k],c[k],u),v));p[1]-=sag*4*u*(1-u)*(.4+.6*4*v*(1-v));return p;},6,6,col||P(pick(['tarpB','tarpG','tarpO'])),{up:true}));}
/* a heap of scrap against a wall: sheets leaning, a drum, tyres */
function isScrapHeap(x,z,ry){W(x,0,z,ry,()=>{for(let i=0;i<3;i++)WX(rr(-.8,.8),0,rr(-.2,.2),rr(-.3,.3),-.25,0,()=>box(pick(['corr','corrW','tin']),0,0,0,rr(.7,1.2),rr(1,1.6),.03,P('rust')));
 isDrum(rr(-.6,.6),0,.6,{lie:true,ry:rr(0,PI)});isTyre(.9,0,.4);isTyre(.9,.2,.4);});}
/* ---------------------------------------------------------------- stone */
/* a megalith tomb (the East's, Sumba): a capstone slab on four squat legs over a stone chest; o.figures carved stones on
   top (penji), o.s scale */
function isTomb(x,z,ry,o){o=o||{};const s=o.s||1;W(x,0,z,ry,()=>{box('stone',0,0,0,2.2*s,.7*s,1.4*s,P('stone'));
 for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])box('stone',a*1.0*s,0,b*.6*s,.32*s,1.05*s,.32*s,P('stoneD'));
 box('stone',0,1.05*s,0,3.0*s,.32*s,2.1*s,P('stone'));
 if(o.figures){for(const k of [-1,1])W(k*.9*s,1.37*s,0,0,()=>{box('stone',0,0,0,.3*s,.9*s,.18*s,P('stoneD'));ellip('stone',0,1.0*s,0,.2*s,.22*s,.14*s,P('stoneD'),0,8);});}});}
/* a standing stone */
function isMenhir(x,z,h,r,o){o=o||{};W(x,0,z,o.ry||0,()=>{const c=P('stone');cyl('stone',0,0,0,r,h*.9,c,7,r*.75);ellip('stone',0,h*.9,0,r*.75,h*.12,r*.75*.8,c,0,7);});}
/* ---------------------------------------------------------------- fences, palisades, flags, lamps */
/* a bamboo fence along local x, L long, h high: posts, two rails, close-set split bamboo */
function isFenceRun(L,h,o){o=o||{};const n=Math.max(2,Math.ceil(L/1.6)+1),c=P('bamboo');for(const x of isSpan(-L/2,L/2,n))pole('bamboo',[x,0,0],[x,h+.1,0],.05,P('woodL'),6);
 for(const y of [h*.3,h*.85])pole('bamboo',[-L/2,y,.06],[L/2,y,.06],.035,c,5);box('lattice',0,.05,.03,L,h*.9,.03,WHITE);}
/* a palisade of sharpened logs along local x, L long, h high, with a walkway rail behind (o.walk) */
function isPalisadeRun(L,h,o){o=o||{};const r=.15,n=Math.floor(L/(r*2.05));for(let i=0;i<n;i++){const x=-L/2+r+i*r*2.05,hh=h+rr(-.2,.2),c=P('wood');cyl('wood',x,0,0,r,hh,c,7);cone('wood',x,hh,0,r,.45,c,7);}
 for(const y of [h*.25,h*.7])box('wood',0,y,-r*1.2,L,.18,.14,P('woodD'));
 if(o.walk){box('planks',0,o.walk,-r-.75,L,.1,1.3,P('planks'));for(const x of isSpan(-L/2+.3,L/2-.3,Math.max(2,Math.ceil(L/2.4))))box('wood',x,0,-r-1.3,.16,o.walk,.16,P('woodD'));}}
/* a flagpole with a teal and white pennant (the moon's colours), h tall */
function isFlag(x,z,h,o){o=o||{};pole('wood',[x,0,z],[x,h,z],.06,P('woodD'),6);const len=o.len||1.8,cA=P(o.c||'teal'),cB=P('white');
 withCloth(clothFlag(len,.25),()=>W(x,h-.1,z,o.ry||0,()=>{psurf('flag',(u,v)=>[u*len,-v*(.7-u*.45),0],6,2,cA);psurf('flag',(u,v)=>[u*len*.6,-.14-v*.22*(1-u*.5),.01],4,1,cB);}));}
/* a lamp: a shell-and-gourd oil lamp on a post or hung, with its halo */
function isLamp(x,y,z,o){o=o||{};if(o.post)pole('wood',[x,0,z],[x,y,z],.05,P('woodD'),6);sph('glow',x,y+.08,z,.09,0xffc070,1,8);cone('bone',x,y+.16,z,.16,.14,P('shell'),8);haloAt(x,y+.08,z,0xffc070);}
