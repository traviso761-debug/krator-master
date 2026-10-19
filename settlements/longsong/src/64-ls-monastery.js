// ================================================================= LONGSONG — the monastery, drawn from the plan's records
// [draw] Every building in LS.BUILDINGS is first a core/tags record (class building, culture order, its types), then
// drawn by its kind with the kit (62-ls-arch.js). Nothing here decides where a thing goes: the plan (40) does.
// The order: the records; the outer wall and its gate; the ward's terraces and rows; the Great Stair and the White
// Palace's base; the White Palace round the Debate Court; the Assembly drum; the Red Palace and its roof; the Eastern
// Watch; the Closed Ward; the hermits' cells; the chortens, the prayer-wheel rows, the lamps, the flags.
const gY=(x,z)=>terrainH(x,z);
const minG=(x,z,w,d)=>{let m=1e9;for(const a of [-.5,0,.5])for(const b of [-.5,0,.5])m=Math.min(m,gY(x+a*w,z+b*d));return m;};
const BREC={};   // id -> the building's registered volume
LS.BUILDINGS.forEach(B=>{const y=LS.baseY(B),r=B.r!=null?B.r:Math.hypot(B.w,B.d)/2,yg=Math.min(y,minG(B.x,B.z,B.w||2*B.r,B.d||2*B.r));
 const top=LS.topY(B)+(B.cone||0)+(B.kind==='louvre'?20:B.kind==='roofhall'?8:B.kind==='drum'?9:B.kind==='archive'?7:B.kind==='school'?5:3);
 const tags={culture:'order',types:B.types.slice()};if(B.wealth)tags.wealth=B.wealth;
 const rec={name:B.name,cls:'building',kind:B.kind,key:'longsong_'+B.id,x:B.x,z:B.z,y:yg,r,h:top-yg,tags,note:B.note||(B.sheet?'the blueprint\'s sheet '+B.sheet:null)};
 if(B.contain)rec.note=(rec.note?rec.note+' · ':'')+'containment: '+B.contain;
 REGISTER(rec);BREC[B.id]=rec;});

// ---------------------------------------------------------------- the outer wall, its towers and gates
(function(){const W=LS.WALL,G=LS.GROUNDS,h=W.h,t=W.t,gaps=[];
 W.gates.forEach(g=>{if(g.side==='n')gaps.push(['n',g.x-g.w/2,g.x+g.w/2]);if(g.side==='s')gaps.push(['s',g.x-g.w/2,g.x+g.w/2]);
  if(g.side==='w')gaps.push(['w',g.z-g.w/2,g.z+g.w/2]);if(g.side==='e')gaps.push(['e',g.z-g.w/2,g.z+g.w/2]);});
 const inGap=(side,s)=>gaps.some(q=>q[0]===side&&s>q[1]&&s<q[2]);
 const run=(side,x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/6),ry=Math.atan2(-(z1-z0),x1-x0);
  for(let i=0;i<n;i++){const s0=i/n,s1=(i+1)/n,sm=(s0+s1)/2,x=lerp(x0,x1,sm),z=lerp(z0,z1,sm),along=side==='n'||side==='s'?x:z;if(inGap(side,along))continue;
   const g0=Math.min(gY(lerp(x0,x1,s0),lerp(z0,z1,s0)),gY(lerp(x0,x1,s1),lerp(z0,z1,s1)),gY(x,z)),g1=Math.max(gY(x,z),g0);
   const seg=L/n+.05;
   ARCH.box('ashlar',x,g0-1.5,z,seg,2.6,t+.8,{ry,col:LSP.granite,top:false,batter:.2});
   ARCH.box('wall',x,g0+1.1,z,seg,g1-g0+h-1.1,t,{ry,col:LSP.white,batter:.35,top:false});
   ARCH.box('wall',x,g1+h,z,seg,1,t-.6,{ry,col:LSP.red2,topCol:LSP.roof});}};
 run('n',G.x0,G.z0,G.x1,G.z0);run('e',G.x1,G.z0,G.x1,G.z1);run('s',G.x1,G.z1,G.x0,G.z1);run('w',G.x0,G.z1,G.x0,G.z0);
 W.towers.forEach(([x,z],i)=>{const g=minG(x,z,10,10),top=Math.max(gY(x,z),g)+h+6;
  lsBlock(x,z,10,10,g,g+1,2,(top-g-1)/2,{batter:.6,winSides:x<0?'w':x>0?'e':'n',win:{spacing:5}});
  REGISTER({name:'A corner tower of the outer wall',cls:'building',kind:'tower',key:'longsong_tower_'+i,x,z,y:g,r:7.5,h:top-g+3,tags:{culture:'order',types:['military','infrastructure']}});});
 REGISTER({name:'The outer wall (7 m of whitewashed stone on a granite plinth)',cls:'building',kind:'wall',key:'longsong_wall',x:0,z:0,y:-14,r:290,h:70,tags:{culture:'order',types:['infrastructure','military']}});
 // the posterns: a small door in the wall
 W.gates.filter(g=>g.side!=='n').forEach(g=>{const x=g.side==='w'?G.x0:g.side==='e'?G.x1:g.x,z=g.side==='s'?G.z1:g.z,nx=g.side==='w'?-1:g.side==='e'?1:0,nz=g.side==='s'?1:0;
  lsDoor(x+nx*(t/2+.1),gY(x+nx*3,z+nz*3),z+nz*(t/2+.1),nx,nz,2.6,3.4,{});});})();

// ---------------------------------------------------------------- the Great Gate: the parabolic arch between two pylons
(function(){const B=LS.building('gatehouse'),y=LS.baseY(B),z=B.z,span=12,H=16,th=B.d,yg=minG(0,z,B.w,th)-.5;
 // the pylons: battered granite towers banded in the Order's blue
 for(const s of [-1,1]){const px=s*(span/2+5.2),Hp=y-yg+30,wAt=k=>9.6-2*1.4*(y-yg+k)/Hp,dAt=k=>th+2-2*1.4*(y-yg+k)/Hp;
  // the pylons in the chapterhouses' carved glyph panels (brick relief) on a granite foot, banded by the mosaic course
  ARCH.box('ashlar',px,yg,z,9.8,y-yg+2.2,th+2.2,{col:LSP.granite,batter:.2,top:false});
  ARCH.box('glyph',px,y+2,z,wAt(2),28,dAt(2),{col:0xffffff,batter:1.4*(28/Hp),topCol:0xe0d4cc});
  for(const k of [9,17,27])ARCH.bandBox('mosaic',px,y+k,z,wAt(k)+.3,.7,dAt(k)+.3,{});
  ARCH.cyl('gilt',px,y+30,z,.5,.1,2.6,{seg:8,col:LSP.gold});}
 // the arch: the voussoir ring on both faces and its soffit, the spandrels filled to the gatehouse floor
 const N=22,yT=y+H+3.2,par=(u,R)=>[u*R*span/2,y+H*R*(1-u*u)];
 for(const zf of [z-th/2,z+th/2]){const sgn=zf<z?-1:1;
  for(let i=0;i<N;i++){const u0=-1+2*i/N,u1=-1+2*(i+1)/N,a0=par(u0,1),a1=par(u1,1),b0=[a0[0]*1.18,y+(a0[1]-y)*1.13+.6],b1=[a1[0]*1.18,y+(a1[1]-y)*1.13+.6];
   const P=(q)=>[q[0],q[1],zf+sgn*.05];
   if(sgn<0){ARCH.quad('ashlar',P(a0),P(a1),P(b1),P(b0),LSP.granite2);ARCH.quad('wall',P(b0),P(b1),P([b1[0],yT]),P([b0[0],yT]),LSP.white);}
   else{ARCH.quad('ashlar',P(a1),P(a0),P(b0),P(b1),LSP.granite2);ARCH.quad('wall',P(b1),P(b0),P([b0[0],yT]),P([b1[0],yT]),LSP.white);}
   ARCH.quad('ashlar',[a1[0],a1[1],z-th/2],[a0[0],a0[1],z-th/2],[a0[0],a0[1],z+th/2],[a1[0],a1[1],z+th/2],LSP.granite);}}
 // the gatehouse over it: white, the red band, the Order's sigil over the arch, the windows
 const yH=lsBlock(0,z,span+8,th,yT,yT,1,4.8,{rich:true,roundels:true,blueCourse:true,win:{spacing:4.6}});
 lsGiltRoof(0,yH,z,12,9,3.6);
 lsDecal(SIGNS.SIGIL,0,y+H+1.6,z-th/2-.12,3.2,3.2,0,-1,{label:"The Order's sigil (the wheel round the hourglass) over the Great Gate"});
 // the leaves, open
 for(const s of [-1,1])ARCH.box('wood',s*(span/2-1.4),y,z+th/2-.5,.35,H*.62,4.6,{col:LSP.wood,ry:s*.5});
 // the bridge before it: a granite causeway on three arches over the stream
 const Bd=BRIDGE,dz0=Bd.z-Bd.L/2,dz1=Bd.z+Bd.L/2,yd=Bd.deck;
 ARCH.box('ashlar',0,yd-1.2,Bd.z,LS.BRIDGE.w,1.2,Bd.L,{col:LSP.granite});
 for(const s of [-1,1])ARCH.box('ashlar',s*(LS.BRIDGE.w/2-.3),yd,Bd.z,.6,1.1,Bd.L,{col:LSP.granite2});
 for(let k=-1;k<=1;k++)ARCH.box('ashlar',0,Bd.water-4,Bd.z+k*Bd.L*.3,LS.BRIDGE.w-.4,yd-1.2-(Bd.water-4),3,{col:LSP.granite2,batter:.3});
 // the ramps from the banks up to the deck
 ARCH.wedge('paving',-LS.BRIDGE.w/2,LS.BRIDGE.w/2,dz1,dz1+0.01,yd,yd,yd-1,LSP.granite);
 REGISTER({name:LS.BRIDGE.name,cls:'infrastructure',kind:'bridge',key:'longsong_bridge',x:0,z:Bd.z,y:Bd.water-4,r:Bd.L/2+2,h:yd-Bd.water+7,tags:{culture:'order',types:['infrastructure']}});
 // a causeway from the bridge to the gate over the bank
 {const za=dz1,zb=z-th/2-1,ya=yd,yb=y;const n=8;for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,zz0=lerp(za,zb,t0),zz1=lerp(za,zb,t1),y0=lerp(ya,yb,t0),y1=lerp(ya,yb,t1),gmin=Math.min(gY(0,zz0),gY(0,zz1))-1;
  ARCH.box('ashlar',0,gmin,(zz0+zz1)/2,LS.BRIDGE.w+1,Math.max(y0,y1)-gmin,zz1-zz0+.05,{col:LSP.granite,topCol:LSP.granite2});}}})();

// ---------------------------------------------------------------- the ward: the terraces' retaining walls, the avenue, the rows
(function(){const W=LS.WARD;
 W.terraces.forEach((T,i)=>{if(i===W.terraces.length-1)return;const nx=W.terraces[i+1],z=T.z1,hi=nx.y,lo=T.y;
  for(const [x0,x1] of [[W.x0,LS.AVENUE.x0-4],[LS.AVENUE.x1+4,W.x1]]){ARCH.box('ashlar',(x0+x1)/2,lo-.5,z-.4,x1-x0,hi-lo+1.1,.8,{col:LSP.granite});}
  // the avenue's steps between the terraces
  const n=Math.ceil((hi-lo)/.18);for(let k=0;k<n;k++)ARCH.box('ashlar',0,lo,z-1.6+k*3.2/n,LS.AVENUE.x1-LS.AVENUE.x0+8,(k+1)*(hi-lo)/n,3.2/n+.02,{col:LSP.granite2});});
 // the rows: Tibetan houses and courtyard buildings; their doors face the avenue
 LS.BUILDINGS.filter(B=>B.base==='ward'&&(B.kind==='house'||B.kind==='court')).forEach(B=>{const y=LS.baseY(B),yg=minG(B.x,B.z,B.w,B.d),nx=B.x<0?1:-1;
  const rich=B.wealth==='rich'||B.id==='printing-house';
  if(B.kind==='house'){lsBlock(B.x,B.z,B.w,B.d,yg,y,B.floors,B.storey,{rich,roundels:rich});
   lsDoor(B.x+nx*(B.w/2+.05),y,B.z,nx,0,1.8,2.9,{curtain:LSP.saffron});}
  else{const dp=Math.min(10,B.d*.3),R=[[B.x,B.z-B.d/2+dp/2,B.w,dp],[B.x,B.z+B.d/2-dp/2,B.w,dp],[B.x-B.w/2+dp/2,B.z,dp,B.d-2*dp],[B.x+B.w/2-dp/2,B.z,dp,B.d-2*dp]];
   R.forEach(([x,z,w,d],k)=>lsBlock(x,z,w,d,yg,y,B.floors,B.storey,{rich,roundels:rich,win:{spacing:4.6}}));
   // the court: paved, a gallery of lacquered posts round it, a chorten or a well in the middle
   ARCH.box('paving',B.x,y-.4,B.z,B.w-2*dp,.52,B.d-2*dp,{col:LSP.granite,sides:''});
   const ix=B.w/2-dp-1.6,iz=B.d/2-dp-1.6;for(let a=-ix;a<=ix+.01;a+=3.2)for(const s of [-1,1])ARCH.cyl('wood',B.x+a,y,B.z+s*iz,.18,.16,B.storey,{seg:6,col:LSP.wood});
   ARCH.box('wood',B.x,y+B.storey,B.z,2*ix+1,.3,2*iz+1,{col:LSP.woodDark,top:false});
   lsChorten(B.x,y,B.z,.35);
   lsDoor(B.x+nx*(B.w/2+.05),y,B.z,nx,0,3,3.6,{curtain:LSP.saffron});}});
 // the Geomancers' lodge carries Yuni's colours on its door (the Order's friends)
 {const B=LS.building('geomancers');lsDecal(SIGNS.sign('The Geomancers\' Lodge','Guests of the Order, from Yuni. Knock; wait.'),B.x-B.w/2-.2,LS.baseY(B)+4.4,B.z+3.4,2.4,1.2,-1,0,{label:'The Geomancers\' lodge\'s sign'});}
 // the drill ground: beaten earth inside a low granite kerb; the raked court: a kerb and three standing stones
 {const D=LS.DRILL,y=LS.wardY(D.z);ARCH.box('ashlar',D.x,y-.3,D.z,D.w+1,.5,D.d+1,{col:LSP.granite2,sides:'nesw',top:false});ARCH.box('paving',D.x,y-.25,D.z,D.w,.46,D.d,{col:0xa89878,sides:''});
  REGISTER({name:D.name,cls:'feature',kind:'drill',key:'longsong_drill',x:D.x,z:D.z,y:y-1,r:Math.hypot(D.w,D.d)/2,h:8,tags:{culture:'order'}});}
 {const R=LS.RAKED,y=LS.wardY((R.z0+R.z1)/2),cx=(R.x0+R.x1)/2,cz=(R.z0+R.z1)/2;
  ARCH.box('ashlar',cx,y-.2,cz,R.x1-R.x0,.35,R.z1-R.z0,{col:LSP.granite,topCol:0xece6d6});
  [[-8,-6,2.6],[5,3,1.8],[9,-7,1.2]].forEach(([dx,dz,h])=>ARCH.cyl('ashlar',cx+dx,y,cz+dz,1.1*h/2,.6*h/2,h,{seg:7,col:LSP.granite2}));
  REGISTER({name:R.name,cls:'feature',kind:'garden',key:'longsong_raked',x:cx,z:cz,y:y-1,r:24,h:6,tags:{culture:'order',types:['park']}});}
 // the reservoir on the rock's rear terrace
 {const R=LS.RESERVOIR,rb=Math.min(minG(R.x,R.z,R.w+2,R.d+2),R.y)-1;ARCH.box('ashlar',R.x,rb,R.z,R.w+2,R.y+6.1-rb,R.d+2,{col:LSP.granite,top:false,batter:.5});ARCH.box('paving',R.x,R.y+3.6,R.z,R.w,.1,R.d,{col:0x4a5a5e,sides:''});   // its floor (its water: core/water, 89w)
  REGISTER({name:R.name,cls:'infrastructure',kind:'reservoir',key:'longsong_reservoir',x:R.x,z:R.z,y:R.y-1,r:26,h:9,tags:{culture:'order',types:['infrastructure']}});}})();

// ---------------------------------------------------------------- the Great Stair and the White Palace's base (L1)
(function(){const WP=LS.building('white-palace'),B0=WP.base0,T=LS.ROCK.top,zA=LS.STAIR_Z[0],zB=LS.STAIR_Z[1];
 // the base: a battered white mass against the rock's face, blind but for slits low down and windows high up
 const yg=Math.min(minG(0,(B0.z0+B0.z1)/2,B0.x1-B0.x0,B0.z1-B0.z0),B0.y0)-1;
 ARCH.box('ashlar',0,yg,(B0.z0+B0.z1)/2,B0.x1-B0.x0+1,B0.y0-yg+2,B0.z1-B0.z0+1,{col:LSP.granite,top:false});
 ARCH.box('wall',0,B0.y0+1,(B0.z0+B0.z1)/2,B0.x1-B0.x0,B0.y1-B0.y0-1,B0.z1-B0.z0,{col:LSP.white,batter:3.2,top:false,sides:'new'});
 lsWindows(B0.x1-3.2,B0.z0,B0.x0+3.2,B0.z0,0,-1,B0.y0+1,8,(B0.y1-B0.y0-1)/8,{batter:3.2,from:5,spacing:6,w:1.1});
 ARCH.box('twig',0,B0.y1-1.6,(B0.z0+B0.z1)/2-.2,B0.x1-B0.x0-6,1.4,B0.z1-B0.z0-5.8,{col:LSP.maroon,top:false,sides:'n'});
 // the three ramps, each a solid wedge in its own band with a parapet on its open (north) side; a landing at each turn
 // spanning the two bands, its parapet round the outer end; the top landing reaching back to the base's top
 const LW=LS.LANDING;
 LS.STAIR.forEach((S,i)=>{const yb=-2,za=S.z0,zb=S.z1,dir=Math.sign(S.x1-S.x0);ARCH.wedge('wall',S.x0,S.x1,za,zb,S.y0,S.y1,yb,LSP.white);
  const n=Math.ceil(Math.abs(S.x1-S.x0)/4);for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,x0=lerp(S.x0,S.x1,t0),x1=lerp(S.x0,S.x1,t1),y0=lerp(S.y0,S.y1,t0),y1=lerp(S.y0,S.y1,t1);
   if(dir<0)ARCH.quad('paving',[x0,y0+.02,zb],[x0,y0+.02,za],[x1,y1+.02,za],[x1,y1+.02,zb],LSP.granite);else ARCH.quad('paving',[x0,y0+.02,za],[x0,y0+.02,zb],[x1,y1+.02,zb],[x1,y1+.02,za],LSP.granite);
   ARCH.box('wall',(x0+x1)/2,(y0+y1)/2,za-.3,Math.abs(x1-x0)+.05,1.1,.6,{col:LSP.white,topCol:LSP.red2});}
  // the landing at its top: level, from this ramp's band to the next one's (or to the base's top), past the turn
  const nx=LS.STAIR[i+1],zTop=nx?nx.z1:B0.z0+3.6,lx=S.x1+dir*(LW/2-.5),lz0=za,lz1=zTop;
  ARCH.box('wall',lx,yb,(lz0+lz1)/2,LW,S.y1-yb,lz1-lz0,{col:LSP.white,topCol:LSP.granite});
  ARCH.box('paving',lx,S.y1-.02,(lz0+lz1)/2,LW,.06,lz1-lz0,{col:LSP.granite2,sides:''});
  ARCH.box('wall',lx,S.y1,lz0-.3,LW+.6,1.1,.6,{col:LSP.white,topCol:LSP.red2});                         // the parapet along the front
  ARCH.box('wall',S.x1+dir*(LW-.5+.3),S.y1,(lz0+lz1)/2,.6,1.1,lz1-lz0+.6,{col:LSP.white,topCol:LSP.red2});});   // and round its outer end
 REGISTER({name:'The Great Stair (three ramps up the White Palace\'s base)',cls:'infrastructure',kind:'stair',key:'longsong_great_stair',x:0,z:(zA+zB)/2,y:-2,r:68,h:44,tags:{culture:'order',types:['infrastructure','religious']}});
 // the forecourt at the avenue's head: paved, the two chortens (plan), the Great Chorten on the avenue
 ARCH.box('paving',0,-1.95,-6,150,.5,12,{col:LSP.granite,sides:'n'});
 // the great thangka, hung on the base's face for the festival of the register: the wheel and its eight seals
 // (2026-10-19: east of the ramps, between the second turn's landing and the base's corner; it had hung behind the ramps)
 lsDecal(SIGNS.THANGKA,81,T-17,B0.z0+2.3,13,19.5,0,-1,{label:'The great thangka of the register (the wheel and its eight seals), hung for the festival'});})();

// ---------------------------------------------------------------- the White Palace round the Debate Court (L2-L4)
(function(){const B=LS.building('white-palace'),T=LS.ROCK.top,C=B.court,st=B.storey,z0=21,z1=95;
 const blk=(x0,x1,za,zb,floors,o)=>lsBlock((x0+x1)/2,(za+zb)/2,x1-x0,zb-za,T-.5,T,floors,st,Object.assign({batter:.6,lit:true},o||{}));
 // the north range (the front over the base), the side ranges (outer three storeys, inner four), the south range
 const RG=B.ranges;
 blk(-80,80,z0,C.z0,RG.front,{winSides:'ns',blueCourse:true});
 for(const s of [-1,1]){const xo0=s<0?-95:80,xo1=s<0?-80:95,xi0=s<0?-80:C.x1,xi1=s<0?C.x0:80;
  blk(xo0,xo1,z0,z1,RG.outer,{winSides:s<0?'nws':'nes'});blk(xi0,xi1,C.z0,z1,RG.inner,{winSides:'nsew',rich:false});}
 blk(C.x0,C.x1,C.z1,z1,RG.back,{winSides:'n'});
 // the loggia over the court (L4): a row of lacquered columns along the front range's roof
 const yL=T+RG.front*st+1.2;for(let x=-30;x<=30;x+=4)ARCH.cyl('wood',x,yL,z0+2,.2,.18,3.2,{seg:6,col:LSP.wood});
 ARCH.box('wood',0,yL+3.2,z0+2,64,.35,3,{col:LSP.woodDark});
 // the Debate Court: paved, open to the sky; its curved arcaded galleries round the court on two levels (the
 // chapterhouses' curved gallery wings), the Assembly Hall's porch at its head
 ARCH.box('paving',0,T-.3,(C.z0+C.z1)/2,C.x1-C.x0,.4,C.z1-C.z0,{col:LSP.granite,sides:''});
 // the gallery's line: a rectangle 3.6 m in from the court's walls with corners of radius 9 (a stadium), from the court's
 // south-west round by the north to its south-east: the court's head (south) stays open to the Assembly Hall's porch
 const gin=3.6,rc=9,X0=C.x0+gin,X1=C.x1-gin,Z0=C.z0+gin,Z1=C.z1-gin,line=[];
 const arc=(cx,cz,a0,a1)=>{for(let k=0;k<=6;k++){const a=a0+(a1-a0)*k/6;line.push([cx+Math.cos(a)*rc,cz+Math.sin(a)*rc,cx+Math.cos(a)*(rc+gin),cz+Math.sin(a)*(rc+gin)]);}};
 const seg=(x0,z0,x1,z1,ox,oz)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/4));for(let k=1;k<n;k++){const t=k/n,x=lerp(x0,x1,t),z=lerp(z0,z1,t);line.push([x,z,x+ox*gin,z+oz*gin]);}};
 seg(X0,Z1-4,X0,Z0+rc,-1,0);arc(X0+rc,Z0+rc,Math.PI,Math.PI*1.5);seg(X0+rc,Z0,X1-rc,Z0,0,-1);arc(X1-rc,Z0+rc,Math.PI*1.5,Math.PI*2);seg(X1,Z0+rc,X1,Z1-4,1,0);
 for(let lv=0;lv<2;lv++){const y=T+lv*st;
  for(let i=0;i<line.length-1;i++){const p0=line[i],p1=line[i+1];
   // the bay: a brick pier and a pointed-parabolic head (the chapterhouses' curved arcades), the mosaic course over
   // the upper storey on the court's face
   lsParabolicBay(p0[0],p0[1],p1[0],p1[1],y,st,{depth:.7,pier:.75});
   if(i===line.length-2)ARCH.box('brick',p1[0],y,p1[1],.75,st,.8,{ry:Math.atan2(-(p1[1]-p0[1]),p1[0]-p0[0]),col:0xf2ece6});
   if(lv===1){const cx=(C.x0+C.x1)/2,cz=(C.z0+C.z1)/2,dx=p1[0]-p0[0],dz=p1[1]-p0[1],inw=(-dz)*(cx-p0[0])+dx*(cz-p0[1])>0,o=.45;
    const A=inw?p0:p1,Bq=inw?p1:p0,nx=inw?-dz:dz,nz=inw?dx:-dx,nl=Math.hypot(nx,nz)||1;
    ARCH.bandLine('mosaic',A[0]+nx/nl*o,A[1]+nz/nl*o,Bq[0]+nx/nl*o,Bq[1]+nz/nl*o,y+st+.05,.62,{});}
   // the gallery's floor and roof (to the ranges behind)
   const q0=[p0[2],p0[3]],q1=[p1[2],p1[3]];
   ARCH.quad('paving',[p1[0],y+st,p1[1]],[p0[0],y+st,p0[1]],[q0[0],y+st,q0[1]],[q1[0],y+st,q1[1]],LSP.granite);
   ARCH.quad('paving',[q1[0],y+st-.3,q1[1]],[q0[0],y+st-.3,q0[1]],[p0[0],y+st-.3,p0[1]],[p1[0],y+st-.3,p1[1]],LSP.granite2);}}
 lsDecal(SIGNS.sign('The Debate Court','Seen, said, inferred: say which. The examination is held here at the change of the year.'),0,T+2.2,C.z1-1.4,4.4,2.2,0,-1,{label:'The Debate Court\'s board'});})();

// ---------------------------------------------------------------- the drum halls: the Assembly, the Hall of Hours, the Observatory
// the chapter house's round halls (ROOMS.md section 1): red fired brick on a granite plinth, the round relief-ringed
// windows, the mosaic course and the glyph panels under the eaves, terracotta cones (the Assembly's with the lantern)
LS.BUILDINGS.filter(B=>B.kind==='drum').forEach(B=>{const y=LS.baseY(B),R=B.r,H=B.floors*B.storey;
 const yg=B.base==='rock'?LS.ROCK.top-.5:y-.5;
 lsDrum(B.x,y,B.z,R,{yg,floors:B.floors,storey:B.storey,cone:B.cone,lantern:B.lantern,dome:B.dome,winFrom:B.winFrom,glass:B.id==='assembly'?0x5a4630:LSP.black});
 if(B.clock)lsDecal(SIGNS.DIAL,B.x,y+H*.56,B.z-R*.98-.2,R*.9,R*.9,0,-1,{label:'The dial of the Hall of Hours: twelve bells round the water clock'});
 if(B.id==='assembly'){lsDoor(B.x,y,B.z-R-.05,0,-1,3.4,4.4,{curtain:LSP.saffron});
  // the porch at the court's head: brick piers under a parabolic head, a little gilt roof
  lsParabolicBay(B.x-6.2,B.z-R-3.5,B.x+6.2,B.z-R-3.5,y,6,{depth:4.6,pier:1.1,spring:.45});ARCH.box('brick',B.x+6.2,y,B.z-R-3.5,1.1,6,4.7,{col:0xf2ece6});
  lsGiltRoof(B.x,y+6.2,B.z-R-3.5,12,4,1.6);}});

// ---------------------------------------------------------------- the Red Palace (R1-R3) and its wings; the gilded roofs over it
(function(){const T=LS.ROCK.top;
 ['red-wings','red-palace'].forEach(id=>{const B=LS.building(id),y=LS.baseY(B),yg=T-.5;
  lsBlock(B.x,B.z,B.w,B.d,yg,y,B.floors,B.storey,{col:LSP.red,rich:true,roundels:true,blueCourse:true,batter:B.floors*B.storey*.05,
   round:!!B.roundWindows,roundFrom:4,winFrom:id==='red-palace'?3:2,win:{spacing:4.4}});});
 // the white lower storeys of the Red Palace's front (the Potala's Red Palace stands on white)
 {const B=LS.building('red-palace');ARCH.box('wall',B.x,T,B.z-B.d/2+.4,B.w-.2,3*B.storey,1,{col:LSP.white,top:false,sides:'n'});
  lsWindows(B.x+B.w/2-2,B.z-B.d/2-.15,B.x-B.w/2+2,B.z-B.d/2-.15,0,-1,T,3,B.storey,{spacing:4.4});}
 LS.BUILDINGS.filter(B=>B.kind==='roofhall').forEach(B=>lsGiltRoof(B.x,LS.baseY(B),B.z,B.w,B.d,B.w*.28));
 // the victory banners (gyaltsen) on the Red Palace's corners: cylinders of saffron and the Order's blue
 const R=LS.building('red-palace'),yT=LS.topY(R)+2.4;
 for(const sx of [-1,1])for(const sz of [-1,1]){const x=R.x+sx*(R.w/2-3),z=R.z+sz*(R.d/2-3);
  ARCH.cyl('cloth',x,yT,z,.55,.55,2.6,{seg:10,col:sx*sz>0?LSP.saffron:LSP.blue});ARCH.cyl('gilt',x,yT+2.6,z,.6,.12,.8,{seg:10,col:LSP.gold});
  ARCH.cyl('dark',x,yT-2,z,.07,.07,2,{seg:5,col:LSP.dark,top:false});}})();

// ---------------------------------------------------------------- the Eastern Watch: the Archive's louvre tower
// (ROOMS.md section 1: the Order's Archive tower) a brick drum on a granite foot, banded by the mosaic course, its upper
// third a stack of eight wavy louvre rings round a slimmer core; the Order's bell hangs in the top ring, the instruments
// (the needle, the chime, the slow pendulum) on the gallery under it; the gilt finial
(function(){const B=LS.building('eastern-watch'),T=LS.ROCK.top,H=B.floors*B.storey,R=B.r,x=B.x,z=B.z;
 const yS=T+H*.68,yTop=T+H;
 ARCH.cyl('ashlar',x,T-.5,z,R+.7,R+.5,2.2,{seg:28,col:LSP.granite,top:false});
 ARCH.cyl('brick',x,T+1.5,z,R,R*.9,yS-T-1.5,{seg:28,col:0xf2ece6,top:false});
 for(const k of [.3,.62])ARCH.bandRing('mosaic',x,T+(yS-T)*k,z,R*(1-.1*k)+.08,.62,{seg:28});
 // slit windows up the drum
 for(let f=1;f<7;f++)for(let i=0;i<4;i++){const a=(i+.5)/4*Math.PI*2+f*.4,yy=T+f*(yS-T)/7,rr=R*(1-.1*(yy-T)/(yS-T))+.04;
  ARCH.box('dark',x+Math.cos(a)*rr,yy,z+Math.sin(a)*rr,.5,1.6,.1,{ry:-a+Math.PI/2,col:LSP.black});}
 // the gallery and the core
 ARCH.cyl('brick',x,yS,z,R*.9+.8,R*.9+.8,.5,{seg:28,col:0xe0d4cc});
 const rc=R*.45;ARCH.cyl('brick',x,yS+.5,z,rc,rc,yTop-yS+.5,{seg:16,col:0xf2ece6});
 for(let k=0;k<8;k++)lsLouvre(x,yS+1.6+k*(yTop-yS-1.4)/8,z,rc+.05,R*.9-rc+.6-k*.06,.35,5);
 // the bell in the top ring (open), the instruments on the gallery
 const yb=yTop+1;ARCH.cyl('brick',x,yb,z,rc+.3,rc+.3,.4,{seg:16,col:0xe0d4cc});
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ARCH.box('brick',x+Math.cos(a)*(rc-.1),yb+.4,z+Math.sin(a)*(rc-.1),.4,3.6,.4,{ry:-a,col:0xf2ece6});}
 ARCH.cyl('bronze',x,yb+1.4,z,1.15,.55,2,{seg:20,col:0x8a6a3a,bottom:true});ARCH.dome('bronze',x,yb+3.4,z,.55,{seg:12,rows:3,col:0x8a6a3a});
 for(let k=0;k<3;k++)ARCH.ring('bronze',x+R*.9,yS+1.6,z-R*.3,.5-k*.06,.04,.05,{seg:14,col:0xc0a060});
 ARCH.cyl('terra',x,yb+4,z,rc+.9,.12,3.2,{seg:16,col:0xffffff,bottom:true});
 ARCH.cyl('gilt',x,yb+7.2,z,.35,.05,2.6,{seg:8,col:LSP.gold});ARCH.dome('bronze',x,yb+7.5,z,.42,{seg:10,rows:4,col:0xb08a48});})();

// ---------------------------------------------------------------- the Lower Gate and its paired drums (L1)
(function(){const B=LS.building('lower-gate'),y=LS.baseY(B),st=B.storey;
 lsBlock(B.x,B.z,B.w-14,B.d,y-.5,y,B.floors,st,{rich:true,roundels:true,winSides:'n'});
 // the paired drums of the chapter house's gate: brick under terracotta cones and brass balls
 for(const s of [-1,1])lsDrum(B.x+s*(B.w/2-3.4),y,B.z,3.6,{yg:y-.5,floors:B.floors,storey:st,cone:4.4,seg:24,winFrom:1});
 lsDoor(B.x,y,B.z-B.d/2-.05,0,-1,3,4,{curtain:LSP.saffron});
 // the wardens' plaque: the Lower Gate is the first threshold
 lsDecal(SIGNS.sign('The Lower Gate','The first threshold. State your name and what you carry. The wardens record both.'),B.x+5.5,y+2.4,B.z-B.d/2-.15,3.2,1.6,0,-1,{label:'The Lower Gate\'s plaque'});})();

// ---------------------------------------------------------------- the rock top's other houses: the Closed Ward, the specimen hall, the meditation cells, the rear shrine
(function(){const T=LS.ROCK.top;
 LS.BUILDINGS.filter(B=>B.base==='rock'&&(B.kind==='house'||B.kind==='court')).forEach(B=>{const y=LS.baseY(B);
  if(B.kind==='court'){const dp=9,R=[[B.x,B.z-B.d/2+dp/2,B.w,dp],[B.x,B.z+B.d/2-dp/2,B.w,dp],[B.x-B.w/2+dp/2,B.z,dp,B.d-2*dp],[B.x+B.w/2-dp/2,B.z,dp,B.d-2*dp]];
   R.forEach(([x,z,w,d])=>lsBlock(x,z,w,d,T-.5,y,B.floors,B.storey,{win:{spacing:5}}));
   ARCH.box('paving',B.x,y-.3,B.z,B.w-2*dp,.45,B.d-2*dp,{col:0x8aa070,sides:''});   // the garden open to the sky (15 cm over the rock)
   lsChorten(B.x,y,B.z,.3);}
  else lsBlock(B.x,B.z,B.w,B.d,T-.5,y,B.floors,B.storey,{rich:B.id==='rear-shrine',roundels:B.id==='rear-shrine'});
  if(B.contain){// the containment's marks: a seal strip on each side of the one door, the register's plaque, the blue sigil
   const nz=-1,zf=B.z-B.d/2-.06;lsDoor(B.x,y,zf+.05,0,nz,2,3,{col:0x2a2a3a});
   lsDecal(SIGNS.SEAL,B.x-1.6,y+1.6,zf-.12,.45,1.8,0,-1,{label:'A seal strip of the Order'});lsDecal(SIGNS.SEAL,B.x+1.6,y+1.6,zf-.12,.45,1.8,0,-1,{label:'A seal strip of the Order'});
   lsDecal(B.contain==='LS-P'?SIGNS.sign('The Closed Ward · '+B.contain,'One door, one warden. Those held here are guests of the Order and are treated so.'):SIGNS.sign('The specimen hall · '+B.contain,'What is kept here is catalogued in the register. Touch nothing unlisted.'),
    B.x+4.4,y+2.6,zf-.12,3.4,1.7,0,-1,{label:B.name+' (its plaque)'});
   lsDecal(SIGNS.SIGIL,B.x,y+B.floors*B.storey-1.6,zf-.12,2.2,2.2,0,-1,{label:'The Order\'s sigil: under containment'});}});
 // the hermits' cells on the east cliff, their ladders down to the kora. Each stands where the cliff's face is at its
 // floor's height (found along its row, not assumed), its back built 1.2 m into the rock on a stone ledge corbelled out
 // of the face, its ladder from its door straight down to the ground under the ladder (2026-10-19: they floated)
 LS.HERMITS.forEach((H,i)=>{let xf=H.x;for(let x=H.x-40;x<=H.x+40;x+=.25){if(gY(x,H.z)<H.y){xf=x;break;}}
  const y=H.y,xc=xf+.5,lb=Math.min(gY(xf+1.8,H.z),y-2.5);
  ARCH.box('ashlar',xf+.6,lb,H.z,3.4,y-lb,3.6,{col:LSP.granite2,batter:.6,top:false});            // the ledge
  ARCH.box('wall',xc,y,H.z,3.4,2.6,3,{col:LSP.white,topCol:LSP.roof,batter:.15});
  ARCH.box('twig',xc,y+2.4,H.z,3.3,.4,2.9,{col:LSP.maroon,top:false});
  lsWindows(xc+1.71,H.z+1.5,xc+1.71,H.z-1.5,1,0,y,1,2.6,{spacing:3,w:.8});
  const xl=xc+2.4,gl=gY(xl,H.z);for(let k=0;k<2;k++)ARCH.box('wood',xl,gl-.2,H.z-.5+k,.12,y-gl+.4,.12,{col:LSP.woodDark});
  for(let r=gl+.4;r<y;r+=.4)ARCH.box('wood',xl,r,H.z,.1,.06,1.1,{col:LSP.wood});
  H.drawn={x:xc,y};
  REGISTER({name:'A hermit\'s cell on the east cliff (reached by its ladder)',cls:'building',kind:'cell',key:'longsong_hermit_'+i,x:xc,z:H.z,y:y-1,r:3.5,h:5,tags:{culture:'order',types:['religious','dwelling-single']}});});})();

// ---------------------------------------------------------------- the Order's own in the ward: the Printing House (a small Archive), the Hall of Forms
// THE ARCHIVE (ROOMS.md section 1): an elliptical drum of brick fin-piers with dark glazing between, a broad wavy pale
// roof on a soffit of timber slats, a second raised wavy roof over a clerestory
(function(){const B=LS.building('printing-house'),y=LS.baseY(B),H=B.floors*B.storey,a=B.a,b=B.b,yg=minG(B.x,B.z,B.w,B.d);
 ARCH.box('ashlar',B.x,yg-1,B.z,2*a+1.2,y-yg+1.4,2*b+1.2,{col:LSP.granite,top:false});
 ARCH.box('paving',B.x,y-.1,B.z,2*a,.2,2*b,{col:LSP.granite,sides:''});
 const per=Math.PI*(3*(a+b)-Math.sqrt((3*a+b)*(a+3*b))),n=Math.round(per/2.2),E=t=>[B.x+Math.cos(t)*a,B.z+Math.sin(t)*b];
 for(let i=0;i<n;i++){const t0=i/n*Math.PI*2,t1=(i+1)/n*Math.PI*2,p=E(t0),q=E(t1),nrm=Math.atan2(Math.sin(t0)*a,Math.cos(t0)*b);
  // the fin: a brick blade standing out radially
  ARCH.box('brick',p[0]+Math.cos(nrm)*.5,y,p[1]+Math.sin(nrm)*.5,1.5,H+.6,.42,{ry:-nrm,col:0xf2ece6});
  // the glazing between, set back; a door on the avenue's side
  const door=Math.abs(Math.cos((t0+t1)/2)-1)<.004;
  ARCH.quad('dark',[q[0],y,q[1]],[p[0],y,p[1]],[p[0],y+H,p[1]],[q[0],y+H,q[1]],door?0x7a2e1e:0x2a3036);
  ARCH.quad('wood',[q[0],y+B.storey-.15,q[1]],[p[0],y+B.storey-.15,p[1]],[p[0],y+B.storey+.15,p[1]],[q[0],y+B.storey+.15,q[1]],LSP.woodDark);}
 // the walls' top (a ring beam) and the roof slab under the wavy roof
 {const N=48;for(let i=0;i<N;i++){const p=E(i/N*Math.PI*2),q=E((i+1)/N*Math.PI*2);ARCH.quad('brick',[q[0],y+H,q[1]],[p[0],y+H,p[1]],[p[0],y+H+.6,p[1]],[q[0],y+H+.6,q[1]],0xe0d4cc);
   ARCH.tri('paving',[B.x,y+H+.55,B.z],[q[0],y+H+.55,q[1]],[p[0],y+H+.55,p[1]],ARCH.col(LSP.granite2));}}
 lsWavyRoof(B.x,y+H+.9,B.z,a+3.2,b+3.2,1.1,7,{thick:.45,rise:.9});
 // the clerestory and the second, raised wavy roof
 {const a2=a*.5,b2=b*.55,N=28;for(let i=0;i<N;i++){const t0=i/N*Math.PI*2,t1=(i+1)/N*Math.PI*2,p=[B.x+Math.cos(t0)*a2,B.z+Math.sin(t0)*b2],q=[B.x+Math.cos(t1)*a2,B.z+Math.sin(t1)*b2];
   ARCH.quad('dark',[q[0],y+H+1.6,q[1]],[p[0],y+H+1.6,p[1]],[p[0],y+H+3.4,p[1]],[q[0],y+H+3.4,q[1]],0x2a3036);
   if(i%2===0)ARCH.box('brick',p[0],y+H+1.6,p[1],.35,1.8,.35,{col:0xf2ece6});}}
 lsWavyRoof(B.x,y+H+3.5,B.z,a*.5+1.6,b*.55+1.6,.7,5,{thick:.35,rise:.6});
 lsDoor(B.x+a+.3,y,B.z,1,0,2.6,3.4,{curtain:LSP.saffron});
 lsDecal(SIGNS.sign('The Printing House','The Order\'s press. Copies for the chapterhouses: Yuni, Iziz, Dalab, Ys, Verge, Keepwell.'),B.x+a+.9,y+4.4,B.z+3,2.6,1.3,1,0,{label:'The Printing House\'s board'});})();
// THE SCHOOL (ROOMS.md section 1, the Hall of Forms): undulating brick walls on a whitewashed dado, parabolic heads on
// the openings, a warped conoid roof of terracotta tile on a straight ridge (the Sagrada Familia's schools)
(function(){const B=LS.building('hall-of-forms'),y=LS.baseY(B),H=B.storey,hw=B.w/2,hd=B.d/2,yg=minG(B.x,B.z,B.w,B.d),amp=.55,wl=5.6;
 ARCH.box('ashlar',B.x,yg-1,B.z,B.w+1.6,y-yg+1.2,B.d+1.6,{col:LSP.granite,top:false});
 // a wall: along the edge from (ax,az) to (bx,bz), undulating out along its normal (nx,nz); doors under parabolic heads
 const wall=(ax,az,bx,bz,nx,nz,doors)=>{const L=Math.hypot(bx-ax,bz-az),N=Math.ceil(L/.8),tx=(bx-ax)/L,tz=(bz-az)/L;
  const off=u=>amp*Math.sin(u/wl*Math.PI*2)*Math.min(1,u/2,(L-u)/2);
  for(let i=0;i<N;i++){const u0=i*L/N,u1=(i+1)*L/N,P=(u,yy,d)=>[ax+tx*u+nx*(off(u)+(d||0)),yy,az+tz*u+nz*(off(u)+(d||0))];
   const door=doors.some(c=>Math.abs((u0+u1)/2-c)<1.4);
   ARCH.quad('wall',P(u0,y),P(u1,y),P(u1,y+1.3),P(u0,y+1.3),LSP.white);          // the white dado
   ARCH.quad('brick',P(u0,y+1.3),P(u1,y+1.3),P(u1,y+H),P(u0,y+H),0xf2ece6);
   if(door)ARCH.quad('dark',P(u0,y,.1),P(u1,y,.1),P(u1,y+3.2,.1),P(u0,y+3.2,.1),LSP.black);}
  // the windows: tall openings under parabolic heads every wave
  for(let c=wl/2;c<L-1;c+=wl){if(doors.some(d=>Math.abs(c-d)<2))continue;const cx=ax+tx*c+nx*(off(c)+.06),cz=az+tz*c+nz*(off(c)+.06),N2=8,w=.75;
   for(let k=0;k<N2;k++){const s0=-1+2*k/N2,s1=-1+2*(k+1)/N2,P=(sv,yy)=>[cx+tx*sv*w,yy,cz+tz*sv*w];
    const h0=y+2.2+(1-Math.pow(Math.abs(s0),1.6))*1.8+1.4,h1=y+2.2+(1-Math.pow(Math.abs(s1),1.6))*1.8+1.4;
    ARCH.quad('dark',P(s0,y+2.2),P(s1,y+2.2),P(s1,h1),P(s0,h0),LSP.black);}}
  return off;};
 wall(B.x+hw,B.z-hd,B.x-hw,B.z-hd,0,-1,[hw]);wall(B.x-hw,B.z+hd,B.x+hw,B.z+hd,0,1,[]);
 wall(B.x+hw,B.z+hd,B.x+hw,B.z-hd,1,0,[]);wall(B.x-hw,B.z-hd,B.x-hw,B.z+hd,-1,0,[hd]);
 // the conoid roof: a straight ridge along x at mid-depth; from it to each long wall the tiles warp, their eave line
 // waving up and down (in phase with the walls'), so the roof is a ruled surface of straight rafters
 const NX=Math.ceil(B.w/1),yR=y+H+2.2;
 for(const sz of [-1,1])for(let i=0;i<NX;i++){const x0=B.x-hw-.6+i*(B.w+1.2)/NX,x1=x0+(B.w+1.2)/NX,ew=u=>y+H+.2+.9*Math.sin((u-(B.x-hw))/wl*Math.PI*2);
  const a0=[x0,yR,B.z],a1=[x1,yR,B.z],e0=[x0,ew(x0),B.z+sz*(hd+.9)],e1=[x1,ew(x1),B.z+sz*(hd+.9)];
  if(sz>0)ARCH.quad('terra',a0,e0,e1,a1,0xffffff);else ARCH.quad('terra',a1,e1,e0,a0,0xffffff);
  }
 // the gables: the brick triangle under the roof's ends (both faces)
 for(const sx of [-1,1]){const xe=B.x+sx*(hw+.3),a=[xe,y+H,B.z-hd-.9],b=[xe,y+H,B.z+hd+.9],c=[xe,yR,B.z],K=ARCH.col(0xf2ece6);ARCH.tri('brick',a,b,c,K);ARCH.tri('brick',b,a,c,K);}
 ARCH.box('brick',B.x,yR-.1,B.z,B.w+1.4,.35,.5,{col:0xe0d4cc});
 lsDecal(SIGNS.sign('The Hall of Forms','The operatives\' hall. Enter barefoot. What is slowed here stays slowed.'),B.x-hw-.9,y+3.6,B.z+3.2,2.6,1.3,-1,0,{label:'The Hall of Forms\' board'});})();

// ---------------------------------------------------------------- the Chapterhouse Court (the pilgrims' square inside the gate)
// the chapter house's circular forecourt: the curved wall of carved glyph panels on its two arcs (the avenue's axis
// open), the mosaic course on its coping; the two blue reflecting pools lined in the mosaic; the tea rotunda; the stele
(function(){const C=LS.COURT,y=LS.wardY(C.z),R=C.r;
 ARCH.cyl('paving',C.x,y-.4,C.z,R+1.2,R+1.2,.5,{seg:48,col:LSP.granite});
 for(const [a0,a1] of C.arcs){const N=Math.ceil((a1-a0)*R/1.4);for(let i=0;i<N;i++){const t0=a0+(a1-a0)*i/N,t1=a0+(a1-a0)*(i+1)/N;
   const P=(t,r,yy)=>[C.x+Math.cos(t)*r,yy,C.z+Math.sin(t)*r],L=(t1-t0)*R/4.4,u0=(t0-a0)*R/4.4;
   // the inner face (to the court) and the outer, both carved; the coping; the mosaic over the inner face
   ARCH.quadUV('glyph',P(t0,R,y),P(t1,R,y),P(t1,R,y+C.wallH),P(t0,R,y+C.wallH),[u0,.5],[u0+L,.5],[u0+L,.5+C.wallH/4.36],[u0,.5+C.wallH/4.36],0xffffff);
   ARCH.quadUV('glyph',P(t1,R+.8,y),P(t0,R+.8,y),P(t0,R+.8,y+C.wallH),P(t1,R+.8,y+C.wallH),[u0+L,.5],[u0,.5],[u0,.5+C.wallH/4.36],[u0+L,.5+C.wallH/4.36],0xffffff);
   ARCH.quad('ashlar',P(t0,R-.15,y+C.wallH),P(t1,R-.15,y+C.wallH),P(t1,R+.95,y+C.wallH+.25),P(t0,R+.95,y+C.wallH+.25),LSP.granite);
   ARCH.quadUV('mosaic',P(t0,R-.02,y+C.wallH-.62),P(t1,R-.02,y+C.wallH-.62),P(t1,R-.02,y+C.wallH),P(t0,R-.02,y+C.wallH),[i*(t1-t0)*R/1.08,0],[(i+1)*(t1-t0)*R/1.08,0],[(i+1)*(t1-t0)*R/1.08,1],[i*(t1-t0)*R/1.08,1],0xffffff);}
  // the wall's ends: granite piers
  for(const t of [a0,a1])ARCH.box('ashlar',C.x+Math.cos(t)*(R+.4),y,C.z+Math.sin(t)*(R+.4),1.3,C.wallH+.6,1.3,{col:LSP.granite,ry:-t});}
 // the reflecting pools: a mosaic kerb, the water (dark blue, glossy)
 C.pools.forEach(Pq=>{ARCH.bandRing('mosaic',Pq.x,y-.05,Pq.z,Pq.r+.3,.5,{seg:32});ARCH.cyl('paving',Pq.x,y+.45,Pq.z,Pq.r+.3,Pq.r+.3,.06,{seg:32,col:LSP.granite});
  });   // (its water: core/water, 89w-ls-water.js)
 // the tea rotunda: eight brick posts, a terracotta cone, a brass ball
 {const Rr=C.rotunda,yr=y;ARCH.cyl('ashlar',Rr.x,yr-.3,Rr.z,Rr.r+.6,Rr.r+.6,.6,{seg:24,col:LSP.granite});
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ARCH.cyl('brick',Rr.x+Math.cos(a)*Rr.r,yr+.3,Rr.z+Math.sin(a)*Rr.r,.28,.24,3.2,{seg:8,col:0xf2ece6});}
  ARCH.ring('wood',Rr.x,yr+3.5,Rr.z,Rr.r-.2,.6,.4,{seg:24,col:LSP.woodDark});
  ARCH.cyl('terra',Rr.x,yr+3.9,Rr.z,Rr.r+1.1,.12,3.4,{seg:24,col:0xffffff,bottom:true});ARCH.dome('bronze',Rr.x,yr+7.3,Rr.z,.35,{seg:10,rows:3,col:0xb08a48});
  ARCH.cyl('wood',Rr.x,yr+.3,Rr.z,1.2,1.2,.75,{seg:12,col:LSP.wood});
  REGISTER({name:Rr.name,cls:'building',kind:'rotunda',key:'longsong_tea_rotunda',x:Rr.x,z:Rr.z,y:yr-.5,r:Rr.r+1.4,h:8.5,tags:{culture:'order',types:['tavern']}});}
 // the stele of the vow
 {const S=C.stele;ARCH.box('ashlar',S.x,y-.2,S.z,2.4,.6,1.4,{col:LSP.granite2});ARCH.box('glyph',S.x,y+.4,S.z,1.5,3.4,.5,{col:0xffffff,batter:.15});
  ARCH.box('terra',S.x,y+3.8,S.z,1.9,.4,.9,{col:0xffffff});
  lsDecal(SIGNS.sign('The vow of the Order','Seen, said, inferred. What is held is held, not hidden.'),S.x,y+2.2,S.z-.28,1.3,.9,0,-1,{label:S.name});
  REGISTER({name:S.name,cls:'landmark',kind:'stele',key:'longsong_stele',x:S.x,z:S.z,y:y-.5,r:1.6,h:5,tags:{culture:'order',types:['religious']}});}
 REGISTER({name:'The Chapterhouse Court (the glyph wall, the reflecting pools)',cls:'feature',kind:'court',key:'longsong_chapter_court',x:C.x,z:C.z,y:y-1,r:R+1.5,h:C.wallH+2,tags:{culture:'order',types:['religious','park']}});})();

// ---------------------------------------------------------------- outside the wall: the mani wall, the chorten garden
(function(){const M=LS.MANI;
 for(let i=1;i<M.pts.length;i++){const a=M.pts[i-1],b=M.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/4),ry=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);
  for(let k=0;k<n;k++){const t=(k+.5)/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t),g=minG(x,z,L/n,M.w);
   ARCH.box('mani',x,g-.4,z,L/n+.04,M.h+.4,M.w,{ry,col:0xffffff,topCol:0xd8d4cc,batter:.15});
   ARCH.box('wall',x,g+M.h,z,L/n+.04,.22,M.w-.2,{ry,col:LSP.white});}}
 // a small chorten at each end
 for(const e of [M.pts[0],M.pts[M.pts.length-1]]){lsChorten(e[0],minG(e[0],e[1],3,3),e[1],.42);}
 REGISTER({name:M.name,cls:'landmark',kind:'mani-wall',key:'longsong_mani_wall',x:(M.pts[0][0]+M.pts[M.pts.length-1][0])/2,z:(M.pts[0][1]+M.pts[M.pts.length-1][1])/2,y:gY(M.pts[1][0],M.pts[1][1])-1.5,r:56,h:9,tags:{culture:'order',types:['religious']}});
 // the chorten garden: rows of small chortens (the Order's dead who are not founders) and the sang burner
 const G=LS.CHORTEN_GARDEN;
 for(let r=0;r<G.rows;r++)for(let k=0;k<G.per;k++){const x=G.x0+12+k*(G.x1-G.x0-18)/(G.per-1),z=G.z0+10+r*(G.z1-G.z0-20)/(G.rows-1);lsChorten(x,minG(x,z,3,3),z,G.s);}
 {const Bn=G.burner,g=gY(Bn.x,Bn.z);ARCH.box('wall',Bn.x,g,Bn.z,1.8,1.6,1.8,{col:LSP.white,batter:.2});ARCH.cyl('wall',Bn.x,g+1.6,Bn.z,.6,.3,1.1,{seg:10,col:LSP.white});
  ARCH.box('dark',Bn.x,g+.5,Bn.z-.91,.6,.5,.02,{col:LSP.black});}
 REGISTER({name:G.name,cls:'feature',kind:'cemetery',key:'longsong_chorten_garden',x:(G.x0+G.x1)/2,z:(G.z0+G.z1)/2,y:gY((G.x0+G.x1)/2,(G.z0+G.z1)/2)-2,r:Math.hypot(G.x1-G.x0,G.z1-G.z0)/2,h:10,tags:{culture:'order',types:['religious','funerary']}});})();

// ---------------------------------------------------------------- the Garden of Held Water (behind the masters' cells)
// the fountain's jets stand in the air, every drop where it was; the held cherry's petals stop as they fall
const HELD=(function(){const G=LS.HELD,T=LS.ROCK.top,F=G.fountain,cx=(G.x0+G.x1)/2,cz=(G.z0+G.z1)/2;
 const gb=Math.min(minG(cx,cz,G.x1-G.x0,G.z1-G.z0),T)-1;ARCH.box('ashlar',cx,gb,cz,G.x1-G.x0,T+.15-gb,G.z1-G.z0,{col:LSP.granite2,topCol:0x6e8a52,batter:.3});
 ARCH.cyl('ashlar',F.x,T,F.z,F.r+.4,F.r+.4,.7,{seg:24,col:LSP.granite,top:false});ARCH.cyl('ashlar',F.x,T+.1,F.z,F.r,F.r,.01,{seg:24,col:0x3a4a5a});   // the basin (its water: 89w)
 ARCH.cyl('ashlar',F.x,T,F.z,.5,.4,1.6,{seg:10,col:LSP.granite2});
 // the held jets: drops along eight arcs, each one still (instanced spheres: they do not move, ever)
 const drops=[];for(let j=0;j<8;j++){const a=j/8*Math.PI*2;for(let k=1;k<26;k++){const t=k/26,r=t*F.r*.92,h=1.6+4*t*(1-t)*2.4;drops.push([F.x+Math.cos(a)*r,T+h,F.z+Math.sin(a)*r]);}}
 for(let k=0;k<14;k++)drops.push([F.x,T+1.6+k*.18,F.z]);
 // the held cherry's petals: in the air under its crown, between the branches and the ground
 const C=G.cherry,pet=[];for(let k=0;k<70;k++){const u=KRAND.unit(KRAND.hash(7301,k,1)),v=KRAND.unit(KRAND.hash(7301,k,2)),w=KRAND.unit(KRAND.hash(7301,k,3));
  pet.push([C.x+(u-.5)*7,T+.6+v*3.4,C.z+(w-.5)*7,KRAND.unit(KRAND.hash(7301,k,4))*6.28]);}
 const gd=new THREE.SphereGeometry(.06,6,4),md=new THREE.MeshStandardMaterial({color:0xcfe6f0,roughness:.05,metalness:0,transparent:true,opacity:.8});
 const im=new THREE.InstancedMesh(gd,md,drops.length),M=new THREE.Matrix4();drops.forEach((p,i)=>{M.makeTranslation(p[0],p[1],p[2]);im.setMatrixAt(i,M);});
 im.userData.host=true;im.userData.arch=true;im.userData.cls='fixture';im.userData.inspectLabel='The held fountain: every drop where it was';scene.add(im);
 const gp=new THREE.PlaneGeometry(.12,.1),mp=new THREE.MeshLambertMaterial({color:0xf4c8d4,side:THREE.DoubleSide});
 const ip=new THREE.InstancedMesh(gp,mp,pet.length),Q=new THREE.Quaternion(),E=new THREE.Euler(),S=new THREE.Vector3(1,1,1),V=new THREE.Vector3();
 pet.forEach((p,i)=>{E.set(p[3],p[3]*1.7,p[3]*.4);Q.setFromEuler(E);V.set(p[0],p[1],p[2]);M.compose(V,Q,S);ip.setMatrixAt(i,M);});
 ip.userData.host=true;ip.userData.arch=true;ip.userData.cls='fixture';ip.userData.inspectLabel='The held cherry\'s petals, stopped as they fell';scene.add(ip);
 // the held cherry's trunk and limbs (its crown is a card of the farms' atlas: 85-ls-farms.js)
 ARCH.cyl('wood',C.x,T,C.z,.32,.2,2.6,{seg:7,col:0x4a3428});for(let k=0;k<4;k++){const a=k*1.7;ARCH.cyl('wood',C.x+Math.cos(a)*.6,T+2.4,C.z+Math.sin(a)*.6,.14,.07,1.8,{seg:5,col:0x4a3428});}
 REGISTER({name:G.name+': the held fountain and the held cherry',cls:'feature',kind:'garden',key:'longsong_held_garden',x:cx,z:cz,y:T-1,r:Math.hypot(G.x1-G.x0,G.z1-G.z0)/2,h:9,tags:{culture:'order',types:['park','religious']}});
 return {drops:drops.length,petals:pet.length,cherry:C};})();

// ---------------------------------------------------------------- the chortens, the lamps
LS.CHORTENS.forEach((C,i)=>{const y=minG(C.x,C.z,7*C.s,7*C.s);lsChorten(C.x,y,C.z,C.s);
 REGISTER({name:C.name||'A chorten (a stupa of the Order: white, the gilt rings and the sun and moon)',cls:'building',kind:'chorten',key:'longsong_chorten_'+i,x:C.x,z:C.z,y:y-.5,r:3.6*C.s,h:15*C.s,tags:{culture:'order',types:['religious','funerary']}});});
LS.LAMPS.forEach((L,i)=>lsLamp(L.x,gY(L.x,L.z),L.z));
REGISTER({name:'The Order\'s electric lamps along the avenue (the salvaged generator\'s reach)',cls:'fixture',kind:'light',key:'longsong_lamps',x:0,z:-100,y:-8,r:90,h:12,tags:{culture:'order',lit:true}});

// ---------------------------------------------------------------- the prayer-wheel rows: one instanced drum, turning
// Each wheel turns about its own axis in the vertex shader at its own pace (aSpin); a third stand still (nobody has
// passed). The galleries are a lacquered rail and a little roof over the row.
const WHEELS=(function(){const pos=[],rot=[];
 LS.WHEELS.forEach(W=>{const L=Math.hypot(W.x1-W.x0,W.z1-W.z0),n=Math.floor(L/.75),tx=(W.x1-W.x0)/L,tz=(W.z1-W.z0)/L;
  // each wheel on its axle between a bottom and a top rail (2026-10-19: they hung in the air)
  for(let i=0;i<n;i++){const x=W.x0+tx*(i+.5)*L/n,z=W.z0+tz*(i+.5)*L/n,y=gY(x,z);pos.push([x,y,z]);ARCH.cyl('bronze',x,y+.5,z,.03,.03,1.1,{seg:4,col:0x6a5232,top:false});}
  // the gallery: a rail and a roof
  for(let s=0;s<L;s+=6){const s1=Math.min(L,s+6),x=W.x0+tx*(s+s1)/2,z=W.z0+tz*(s+s1)/2,y=gY(x,z),ry=Math.atan2(-tz,tx);
   ARCH.box('wood',x,y+2.6,z,s1-s+.05,.3,1.4,{ry,col:LSP.woodDark});ARCH.box('slate',x,y+2.9,z,s1-s+.05,.25,1.8,{ry,col:0x5a2a22});
   ARCH.cyl('wood',x+tx*(s1-s)/2,y,z+tz*(s1-s)/2,.1,.1,2.6,{seg:5,col:LSP.wood});
   ARCH.box('ashlar',x,y-.2,z,s1-s+.05,.62,.7,{ry,col:LSP.granite});            // the stone sill
   ARCH.box('wood',x,y+.42,z,s1-s+.05,.1,.55,{ry,col:LSP.woodDark});            // the bottom rail
   ARCH.box('wood',x,y+1.5,z,s1-s+.05,.1,.55,{ry,col:LSP.woodDark});}});        // the top rail
 const g=new THREE.CylinderGeometry(.24,.24,.8,14,1);g.translate(0,1.05,0);
 // the painted band: a gold ring top and bottom, the mantra in the Order's blue on red
 const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#8e2f24';x.fillRect(0,0,256,64);
 x.fillStyle='#d8b048';x.fillRect(0,0,256,9);x.fillRect(0,55,256,9);for(let i=0;i<8;i++)SIGNS.glyph(x,16+i*32,32,26,KRAND.hash(41,i),'#e8d8a8',2);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;
 // the library's repousse band (patterns/order/prayer-wheel, delivered 2026-10-19) when packed; the painted canvas else
 const WL=(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong','wheel'):null,WT=WL?KMAT.textures(WL,{aniso:8}):null;
 const m=WT?new THREE.MeshStandardMaterial({map:WT.map,normalMap:WT.normalMap||null,roughnessMap:WT.roughnessMap||null,roughness:.5,metalness:.55}):new THREE.MeshLambertMaterial({map:t});
 if(WT&&WT.map){WT.map.wrapS=THREE.RepeatWrapping;}
 const spin=new Float32Array(pos.length);for(let i=0;i<pos.length;i++)spin[i]=LS.wheelSpin(i);   // the plan's (40): data, not the shader's
 m.onBeforeCompile=sh=>{sh.uniforms.uT={value:0};m.userData.sh=sh;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;attribute float aSpin;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n{float a=uT*aSpin;float c=cos(a),s=sin(a);transformed.xz=mat2(c,-s,s,c)*transformed.xz;}');};
 m.customProgramCacheKey=()=>'ls-wheels'+(WT?'-lib':'');
 const im=new THREE.InstancedMesh(g,m,pos.length),M=new THREE.Matrix4();
 pos.forEach((p,i)=>{M.makeTranslation(p[0],p[1],p[2]);im.setMatrixAt(i,M);});
 g.setAttribute('aSpin',new THREE.InstancedBufferAttribute(spin,1));
 im.userData.arch=true;im.userData.host=true;im.userData.inspectLabel='A prayer wheel of the drum rows (turned by every pilgrim who passes)';im.userData.cls='fixture';
 scene.add(im);TICKS.push((dt,t)=>{if(m.userData.sh)m.userData.sh.uniforms.uT.value=t;});
 LS.WHEELS.forEach((W,i)=>REGISTER({name:'A row of prayer wheels under its gallery',cls:'fixture',kind:'prayer-wheels',key:'longsong_wheels_'+i,x:(W.x0+W.x1)/2,z:(W.z0+W.z1)/2,y:gY((W.x0+W.x1)/2,(W.z0+W.z1)/2)-1,r:Math.hypot(W.x1-W.x0,W.z1-W.z0)/2,h:5,tags:{culture:'order',types:['religious']}}));
 return {mesh:im,count:pos.length};})();

// ---------------------------------------------------------------- the prayer flags: strings of five colours, fluttering
const FLAGS=(function(){const pos=[],col=[],ph=[],idx=[],C=[0x2e5aa8,0xf0ece0,0xb83a2a,0x3a8a4a,0xe0b030].map(h=>new THREE.Color(h).convertSRGBToLinear());
 const end=e=>e[3]==='pole'?[e[0],gY(e[0],e[2])+e[1],e[2]]:[e[0],e[1],e[2]];
 LS.FLAGS.forEach((F,fi)=>{const a=end(F.a),b=end(F.b);
  for(const e of [F.a,F.b])if(e[3]==='pole'){const y=gY(e[0],e[2]);ARCH.cyl('wood',e[0],y,e[2],.09,.06,e[1]+.3,{seg:5,col:LSP.woodDark});}
  const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),n=Math.floor(L/.62),sag=L*.06;
  for(let i=0;i<n;i++){const t=(i+.5)/n,x=lerp(a[0],b[0],t),z=lerp(a[2],b[2],t),y=lerp(a[1],b[1],t)-sag*4*t*(1-t),cc=C[i%5],o=pos.length/3;
   const dx=(b[0]-a[0])/L*.22,dz=(b[2]-a[2])/L*.22;
   pos.push(x-dx,y,z-dz, x+dx,y,z+dz, x+dx,y-.5,z+dz, x-dx,y-.5,z-dz);for(let k=0;k<4;k++){col.push(cc.r,cc.g,cc.b);ph.push(k<2?0:1);}
   idx.push(o,o+1,o+2,o,o+2,o+3);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setAttribute('aLow',new THREE.Float32BufferAttribute(ph,1));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
 m.onBeforeCompile=sh=>{sh.uniforms.uT={value:0};m.userData.sh=sh;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;attribute float aLow;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\n{float w=sin(uT*3.1+position.x*.7+position.z*.5)*.5+.5;transformed.x+=aLow*(.12+.16*w);transformed.z+=aLow*.18*sin(uT*2.3+position.x*.4);}');};
 m.customProgramCacheKey=()=>'ls-flags';
 const mesh=new THREE.Mesh(g,m);mesh.userData.arch=true;mesh.userData.host=true;mesh.userData.inspectLabel='Prayer flags (the five colours)';mesh.userData.cls='fixture';scene.add(mesh);
 TICKS.push((dt,t)=>{if(m.userData.sh)m.userData.sh.uniforms.uT.value=t;});
 return {mesh,count:pos.length/12};})();

// ---------------------------------------------------------------- the monastery's own checks (verify.py --assert; 99-host-take.js calls them)
const MCHK={
 // every building in the plan is a core/tags record of the Order, of the building class
 records(L){const T=KTAGS.page||(BIO.tagReg&&BIO.tagReg());const miss=L.filter(B=>{const r=T&&T.query?T.query({key:'longsong_'+B.id}):null;return !r||!r.length||r[0]['class']!=='building'||!r[0].tags||r[0].tags.culture!=='order';});
  return{ok:L.length>20&&!miss.length,detail:L.length+' buildings in the plan'+(miss.length?'; not recorded as the Order\'s buildings: '+miss.slice(0,4).map(B=>B.id).join(', '):'; every one a core/tags record (building, culture order)')};},
 // no earth: nothing of the Sahelian earth vocabulary in the plan or the kit's materials (the owner's rule)
 noEarth(B,mats){const bad=B.filter(b=>/banco|rammed|adobe|toron|laterite|mud/i.test(b.name+' '+(b.note||''))).map(b=>b.id).concat(mats.filter(k=>/earth|banco|adobe|rammed/i.test(k)));
  return{ok:!bad.length,detail:bad.length?'earth in: '+bad.join(', '):'stone and lime only: '+mats.length+' materials ('+mats.join(', ')+')'};},
 // the faces: the White Palace's base and the Red Palace face north (toward the sun: their windows on the north side)
 facing(){const B=LS.building('red-palace'),W=LS.building('white-palace');return{ok:W.base0.z0<W.z-W.d/2&&B.z>W.z&&LS.WALL.gates[0].side==='n',detail:'the base\'s face at z '+W.base0.z0+', the Red Palace behind and above at z '+B.z+'; the Great Gate in the '+LS.WALL.gates[0].side+' wall'};},
 // the climb is the rank: each step of the processional route higher than the one before
 climb(){const Y=[LS.wardY(-190),LS.wardY(-100),LS.wardY(-10),LS.baseY(LS.building('lower-gate')),LS.topY(LS.building('white-palace')),LS.topY(LS.building('red-palace'))];
  const ok=Y.every((y,i)=>i===0||y>Y[i-1]);return{ok,detail:'gate '+Y[0]+' → ward '+Y[1]+' → stair\'s foot '+Y[2]+' → Lower Gate '+Y[3]+' → White Palace '+Y[4].toFixed(1)+' → Red Palace '+Y[5].toFixed(1)};}};
function monasteryChecks(add){add('every building a core/tags record of the Order',MCHK.records(LS.BUILDINGS));
 add('stone and lime: no earth construction',MCHK.noEarth(LS.BUILDINGS,Object.keys(ARCH.A)));
 add('the monastery faces north, to the sun',MCHK.facing());
 add('the climb is the rank (each threshold higher)',MCHK.climb());
 if(typeof farmChecks==='function')farmChecks(add);
 if(typeof waterChecks==='function')waterChecks(add);
 if(typeof vaultChecks==='function')vaultChecks(add);}
function monasteryNegatives(add){add('a building recorded as an Ancients one',MCHK.records(LS.BUILDINGS.concat([{id:'not-recorded'}])));
 add('a rammed-earth granary',MCHK.noEarth([{id:'x',name:'a rammed-earth granary'}],['wall']));
 add('the Red Palace given one storey (below the White)',(function(){const r=LS.building('red-palace'),f=r.floors;r.floors=1;const o=MCHK.climb();r.floors=f;return o;})());
 if(typeof farmNegatives==='function')farmNegatives(add);
 if(typeof waterNegatives==='function')waterNegatives(add);
 if(typeof vaultNegatives==='function')vaultNegatives(add);}
_mark('monastery');
