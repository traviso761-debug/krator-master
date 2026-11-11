// ================================================================= METROPOLIS — M1, the Ledger: the hero  [draw]
// MP.heroLedger(state) -> a Group. Budget 45k triangles (F.tris). A slab along x: long faces on a 3 m bay grid from the plan (the same facade rule as the Spindle), arches
// of the great arcade and bronze flares every 12 m, blind relief end walls with the fire stairs behind them, a stepped metal roof hall.
MP.heroLedger=function(state,lite,only){const F=MP.LEDGER,S=F.ruins[state]||{},B=MP.builder(lite),ruin=state!=='intact',seedK=MP.idHash(F.id+state);
 const hw=F.footprint.w/2,hd=F.footprint.d/2,roof=F.levels[F.levels.length-1].y+F.levels[F.levels.length-1].h,RU=MP.ruin(F,state),cut=RU.cut;
 /* the tear (MP.ruin, MP.tearAt) by the 3 m bay: a storey stands in a bay while its foot is under the tear there (the broken span's is the arcade's top), so the edge
    steps by storeys and bays; topAt is the top of what stands in a bay. A skeleton's storeys from frame[0] are its frame: slabs, columns, the cores */
 const torn=RU.torn>0||!!RU.span,bayOf=x=>Math.max(0,Math.min(F.bays.n-1,Math.floor((x+hw)/F.bays.width))),bx=i=>-hw+(i+.5)*F.bays.width,tear=x=>MP.tearAt(F,RU,bx(bayOf(x))),
  topAt=x=>{const c=tear(x);let y=0;F.levels.forEach(L=>{if(L.y<c&&L.y<cut)y=Math.max(y,Math.min(L.y+L.h,cut));});return y;},frame0=RU.frame?RU.frame[0]:Infinity,
  patch=(x,y)=>RU.patchy&&y>RU.patchy[0]&&y<RU.patchy[1]&&MP.u(seedK&0xffff,bayOf(x),Math.floor(y/MP.STOREY),91)<.5,
  runs=f=>{const out=[];let a=null;for(let i=0;i<F.bays.n;i++){const on=f(bx(i));if(on&&a==null)a=i;if(!on&&a!=null){out.push([-hw+a*F.bays.width,-hw+i*F.bays.width]);a=null;}}if(a!=null)out.push([-hw+a*F.bays.width,hw]);return out;};
 const WALL=ruin?[.84,.81,.76]:[.97,.97,.95],DARK=[.12,.12,.13],D=.7,sc=ruin?MP.stain(seedK,S.stain==null?.7:S.stain):null;
 const shade=(x,y)=>sc?sc(x*.25,y):null,stained=(x,y)=>shade(x,y)||undefined;
 /* the entrance: the arcade's middle bay, both faces, a screen 7.6 m wide: a pair of sliding leaves 3.3 m across between fixed sidelights they slide behind, 2.9 m tall under a bronze head (DX its half width, DH the leaves' height) */
 const DX=3.82,DH=2.9,doors=[];
 const breach=[];if(S.breach){for(let i=0;i<9;i++){const u=j=>MP.u(seedK&0xffff,i,j),l=2+Math.floor(u(1)*8);breach.push({x:-hw+u(2)*2*hw,w:3+u(3)*9,s:u(4)<.5?1:-1,y0:F.levels[l].y,y1:F.levels[l].y+(1+Math.floor(u(5)*3))*MP.STOREY});}}
 const inBreach=(x,y,s)=>breach.some(b=>b.s===s&&Math.abs(x-b.x)<b.w&&y>b.y0&&y<b.y1);
 const face=function(s,bays,L){const z=s*hd,n=[0,0,s],y0=L.y,y1=Math.min(L.y+L.h,cut),W=F.bays.width,kinds=bays.map(b=>b.kind),m=L.k<2?'concrete':'white';
  // a quad on the long face between x0 and x1 from y0 to y1, at depth d in (corners so that it faces out)
  const Q=(name,x0,x1,a,b,d,o)=>{const zz=z-s*d;if(s>0)B.quad(name,[x0,a,zz],[x1,a,zz],[x1,b,zz],[x0,b,zz],n,o);else B.quad(name,[x1,a,zz],[x0,a,zz],[x0,b,zz],[x1,b,zz],n,o);};
  if(L.use==='arcade'){const dp=F.arcade.depth,gm=ruin?'glassOut':'glass';Q(gm,-hw,-DX,0,y1,dp,{uv:4});Q(gm,DX,hw,0,y1,dp,{uv:4});if(y1>DH+.4)Q(gm,-DX,DX,DH+.4,y1,dp,{uv:4});return;}
  if(!kinds.some(k=>MP.isGlass(k)||k==='louvre')){bays.forEach(b=>{if(ruin&&inBreach(b.x,y0+1.8,s))return;if(torn&&L.y>=tear(b.x))return;if(patch(b.x,y0+1.8))return;Q(m,b.x-W/2,b.x+W/2,y0,y1,0,{col:shade(b.x,y0)||undefined});});return;}
  let sill=9,top=0;kinds.forEach(k=>{const z2=MP.BAYSIZE[k];if(z2){sill=Math.min(sill,z2[1]);top=Math.max(top,z2[2]);}});
  const yS=y0+sill,yT=Math.min(y0+top*(L.h/MP.STOREY),y1-.2);
  bays.forEach(function(b,bi){const x=b.x,a=x-W/2,c=x+W/2,k=b.kind,col=shade(x,y0)||undefined,ym=(yS+yT)/2,gone=ruin&&inBreach(x,ym,s);if(torn&&L.y>=tear(x))return;if(patch(x,ym))return;
   if(gone){Q('glassOut',a,c,y0,y1,2.2,{uv:4});return;}
   Q(m,a,c,y0,yS,0,{col});Q(m,a,c,yT,y1,0,{col});
   /* the sill faces up and the head down on both faces: the corners run the other way round on the north face (z < 0), where the head was culled from below and the eye
      went up through it into the hollow of the wall, to the sky */
   const H=(p0,p1,p2,p3,n)=>s>0?B.quad(m,p0,p1,p2,p3,n,{col,uv:2}):B.quad(m,p0,p3,p2,p1,n,{col,uv:2});H([a,yS,z],[c,yS,z],[c,yS,z-s*D],[a,yS,z-s*D],[0,1,0]);H([a,yT,z-s*D],[c,yT,z-s*D],[c,yT,z],[a,yT,z],[0,-1,0]);
   Q(ruin?'glassOut':'glass',a,c,yS,yT,D,{uv:4});
   const P=(px,y,w,h,d,cl)=>B.panel(px,y,z-s*d/2,s>0?0:Math.PI,w,h,d,cl);
   if(k==='pier'||k==='blank'){P(x,ym,W*1.01,yT-yS,D,WALL);return;}
   if(k==='louvre'){for(let t=0;t<3;t++)P(x,yS+(yT-yS)*(t+.5)/3,W*.98,.26,D*.8,DARK);return;}
   const Z=MP.BAYSIZE[k],jw=W*(1-Z[0])/2,fs=y0+Z[1],ft=y0+Z[2]*(L.h/MP.STOREY);
   if(jw>.04){P(a+jw/2,ym,jw,yT-yS,D,WALL);P(c-jw/2,ym,jw,yT-yS,D,WALL);}
   if(fs>yS+.03)P(x,(yS+fs)/2,W*1.01,fs-yS,D,WALL);if(ft<yT-.03)P(x,(ft+yT)/2,W*1.01,yT-ft,D,WALL);
   // a slim pilaster at every bay line runs the height of the storey: the slab's vertical grain
   P(a,(y0+y1)/2,.34,y1-y0,.34,WALL);
   if(!ruin||MP.u(seedK&0xffff,L.k,bi)<.25)P(x,ym,.09,yT-yS,.14,DARK);});};
 const RUST=[.42,.33,.27];
 /* a skeleton's storey: the four cores (the hero's), and the bare frame, its slab where the tear leaves it and rusted columns every other bay on both faces and down the
    middle, drawn only for only === 'frame', by the rubble (57), as the Spindle's */
 function frameLevel(L){const y=L.y,st=x=>L.y<tear(x);
  if(only!=='frame'){F.core.shafts.forEach(q=>{if(st(q.x))B.box('concrete',q.x-q.w/2,q.x+q.w/2,y,y+L.h,q.z-q.d/2,q.z+q.d/2,{uv:3});});return;}
  runs(st).forEach(r=>{B.quad('concrete',[r[0],y+.02,hd-.4],[r[1],y+.02,hd-.4],[r[1],y+.02,-hd+.4],[r[0],y+.02,-hd+.4],[0,1,0],{uv:3});B.quad('concrete',[r[0],y-.3,-hd+.4],[r[1],y-.3,-hd+.4],[r[1],y-.3,hd-.4],[r[0],y-.3,hd-.4],[0,-1,0],{uv:3});
   B.quad('concrete',[r[0],y-.3,hd-.4],[r[1],y-.3,hd-.4],[r[1],y+.02,hd-.4],[r[0],y+.02,hd-.4],[0,0,1],{uv:2});B.quad('concrete',[r[1],y-.3,-hd+.4],[r[0],y-.3,-hd+.4],[r[0],y+.02,-hd+.4],[r[1],y+.02,-hd+.4],[0,0,-1],{uv:2});});
  for(let i=0;i<F.bays.n;i+=2){const x=bx(i)-F.bays.width/2;if(!st(x+.1))continue;[hd-.7,0,-hd+.7].forEach(z=>B.obox('concrete',x,y+L.h/2,z,0,.6,L.h,.6,{col:RUST,uv:2}));}}
 if(only==='frame'){F.levels.forEach(L=>{if(L.y>=frame0&&L.y<cut)frameLevel(L);});return B.finish(F,state+'.frame');}
 F.levels.forEach(function(L){if(L.y>=cut)return;if(L.y>=frame0){frameLevel(L);return;}const fac=MP.levelFacade(F,L.k);face(1,fac.south,L);face(-1,fac.north,L);
  const y1=Math.min(L.y+L.h,cut);
  if(L.use==='plant'){(torn?runs(x=>L.y<tear(x)):[[-hw,hw]]).forEach(r=>[1,-1].forEach(s=>B.box(ruin?'white':'bronze',r[0]-(r[0]<=-hw?.1:0),r[1]+(r[1]>=hw?.1:0),y1-.5,y1+.4,s>0?hd-.1:-hd-.35,s>0?hd+.35:-hd+.1,{uv:2})));}
  if(L.use==='arcade')[1,-1].forEach(s=>B.box(ruin?'cyanDead':'cyan',-hw,hw,y1-.4,y1-.15,s>0?hd:-hd-.08,s>0?hd+.08:-hd,{uv:2}));});
 // ---- the end walls: blind, in the relief block, with four flat pilasters
 /* a torn slab's end wall stands as high as its end bay; a fallen slab's end walls stand alone, so they are drawn as walls with a back (RU.ends); a skeleton's to its frame */
 const top=Math.min(roof,cut),endTop=s=>RU.ends>0?RU.ends:RU.frame?RU.frame[0]:torn?topAt(s*(hw-1)):top;
 [1,-1].forEach(function(s){const x=s*hw,t=endTop(s),c=stained(s*7,t*.5);if(RU.ends>0)B.box('relief',s>0?x-1.2:x,s>0?x:x+1.2,0,t,-hd,hd,{uv:6,col:c});else if(s>0)B.quad('relief',[x,0,hd],[x,0,-hd],[x,t,-hd],[x,t,hd],[1,0,0],{uv:6,col:c});else B.quad('relief',[x,0,-hd],[x,0,hd],[x,t,hd],[x,t,-hd],[-1,0,0],{uv:6,col:c});
  for(let i=0;i<4;i++){const z=-hd+hd*(i*2+1)/4;B.box('concrete',s>0?x:x-.8,s>0?x+.8:x,0,t+(torn?.4:1.2),z-.7,z+.7,{col:c});}});
 // ---- the arcade: an arch frame and a pier every 12 m, the arches instanced as panels would be flat, so each is a few voussoirs, and the bronze flares over them
 const A=F.arcade,ay=7.2,PX=MP.arcadePiers(F),sp=PX[1]-PX[0];
 for(let i=0;i<PX.length;i++){const x=PX[i],brk=ruin&&MP.u(seedK&0xffff,i,31)<.12;
  [1,-1].forEach(function(s){const z=s*hd;
   if(!brk)B.box('concrete',Math.max(x-1,-hw),Math.min(x+1,hw),0,ay,Math.min(z,z-s*A.depth),Math.max(z,z-s*A.depth),{});
   /* the arch: a spandrel 1 m thick over an elliptical intrados, from the spring (2.4 m) to the crown (6.6 m), face, back and soffit drawn (the slats it was, one-sided panels, showed their culled backs on the north face) */
   if(i<PX.length-1){const a=sp/2-1,cx=x+sp/2,nS=12,z0=z,z1=z-s*1,yA=t=>2.4+(ay-.6-2.4)*Math.sqrt(Math.max(0,1-t*t)),cl={col:ruin?[.8,.77,.72]:[.92,.9,.86],uv:3};
    for(let j=0;j<nS;j++){const ta=-1+2*j/nS,tb=-1+2*(j+1)/nS,xa=cx+a*ta,xb=cx+a*tb,ya=yA(ta),yb=yA(tb),P=(xx,yy,zz)=>[xx,yy,zz],l=Math.hypot(xb-xa,yb-ya)||1,nx=-(yb-ya)/l,ny=(xb-xa)/l;
     if(s>0){B.quad('concrete',P(xa,ya,z0),P(xb,yb,z0),P(xb,ay,z0),P(xa,ay,z0),[0,0,1],cl);B.quad('concrete',P(xb,yb,z1),P(xa,ya,z1),P(xa,ay,z1),P(xb,ay,z1),[0,0,-1],cl);B.quad('concrete',P(xb,yb,z0),P(xa,ya,z0),P(xa,ya,z1),P(xb,yb,z1),[nx,-Math.abs(ny),0],cl);}
     else{B.quad('concrete',P(xb,yb,z0),P(xa,ya,z0),P(xa,ay,z0),P(xb,ay,z0),[0,0,-1],cl);B.quad('concrete',P(xa,ya,z1),P(xb,yb,z1),P(xb,ay,z1),P(xa,ay,z1),[0,0,1],cl);B.quad('concrete',P(xa,ya,z0),P(xb,yb,z0),P(xb,yb,z1),P(xa,ya,z1),[nx,-Math.abs(ny),0],cl);}}}
   // the flare: a bronze curve from the pier's foot to the spandrel, out of the wall
   if(i%1===0&&!(ruin&&MP.u(seedK&0xffff,i,41+s)<.3)){const n=8,Y=F.buttress.y1,O=F.buttress.out,col=ruin?[.55,.5,.42]:[1,1,1],t=.55;
    for(let j=0;j<n;j++){const ya=Y*j/n,yb=Y*(j+1)/n,oa=O*Math.pow(1-ya/Y,1.7),ob=O*Math.pow(1-yb/Y,1.7),l=Math.hypot(oa-ob,yb-ya),nz=(yb-ya)/l*s,ny=(oa-ob)/l,P=(xx,o,y)=>[xx,y,z+s*o];
     if(s>0){B.quad('bronze',P(x-t,oa,ya),P(x+t,oa,ya),P(x+t,ob,yb),P(x-t,ob,yb),[0,ny,nz],{col,uv:2});B.quad('bronze',P(x+t,oa,ya),P(x+t,0,ya),P(x+t,0,yb),P(x+t,ob,yb),[1,0,0],{col,uv:2});B.quad('bronze',P(x-t,0,ya),P(x-t,oa,ya),P(x-t,ob,yb),P(x-t,0,yb),[-1,0,0],{col,uv:2});}
     else{B.quad('bronze',P(x+t,oa,ya),P(x-t,oa,ya),P(x-t,ob,yb),P(x+t,ob,yb),[0,ny,nz],{col,uv:2});B.quad('bronze',P(x+t,0,ya),P(x+t,oa,ya),P(x+t,ob,yb),P(x+t,0,yb),[1,0,0],{col,uv:2});B.quad('bronze',P(x-t,oa,ya),P(x-t,0,ya),P(x-t,0,yb),P(x-t,ob,yb),[-1,0,0],{col,uv:2});}}}});}
 // ---- the arcade's ceiling: the walkway's soffit, 3 m deep under the storey above (without it the eye went up past the one-sided skin into the sky)
 [1,-1].forEach(s=>{const z=s*hd,zi=s*(hd-A.depth),yc=ay-.02;if(s>0)B.quad('concrete',[-hw,yc,zi],[hw,yc,zi],[hw,yc,z],[-hw,yc,z],[0,-1,0],{uv:3});else B.quad('concrete',[-hw,yc,z],[hw,yc,z],[hw,yc,zi],[-hw,yc,zi],[0,-1,0],{uv:3});
  // the entrance's frame on the glass line: posts at the ends and the middle, a head over the leaves; the leaves themselves are MP.doorLeaves'
  {const yaw=s>0?0:Math.PI,zg=s*(hd-A.depth);[-DX+.15,-1.8,1.8,DX-.15].forEach(px=>B.obox('bronze',px,DH/2,zg,yaw,.3,DH,.3,{uv:2}));[-1,1].forEach(q=>B.obox(ruin?'glassOut':'glass',q*(1.95+DX-.3)/2,DH/2,zg,yaw,DX-.3-1.95,DH,.04,{uv:4}));B.obox('bronze',0,DH+.2,zg,yaw,2*DX,.4,.36,{uv:2});
   /* a ruin's doorway stands open, its leaves gone; where the arcade will not open (a fallen slab's) a dark face 1.5 m in closes the hollow behind */
   if(!ruin)doors.push({x:0,z:zg,yaw,w:3.3,h:DH});else if(F.levels[0].h>RU.skin+.01)B.obox('dark',0,DH/2,zg-s*1.5,yaw,3.6,DH+.4,.1,{uv:2});else doors.push({x:0,z:zg,yaw,w:3.3,h:DH,dark:true});}});
 // ---- the roof: the parapet and, intact, the stepped metal hall of the council
 if(torn&&!RU.frame){/* each bay's top: a dark floor over the burnt storeys, and a wall down each step to the next bay (seen from either side) */
  for(let i=0;i<F.bays.n;i++){const x0=-hw+i*F.bays.width,x1=x0+F.bays.width,y=topAt(bx(i));if(y<=0)continue;B.quad('dark',[x0,y,hd],[x1,y,hd],[x1,y,-hd],[x0,y,-hd],[0,1,0],{uv:2});
   if(i+1<F.bays.n){const yn=topAt(bx(i+1)),lo=Math.min(y,yn),hi=Math.max(y,yn);if(hi-lo>.1){B.quad('dark',[x1,lo,-hd],[x1,lo,hd],[x1,hi,hd],[x1,hi,-hd],[1,0,0],{uv:2});B.quad('dark',[x1,lo,hd],[x1,lo,-hd],[x1,hi,-hd],[x1,hi,hd],[-1,0,0],{uv:2});}}}}
 /* a skeleton's skin is closed at the frame's foot by a dark floor: where the tear took the frame's slabs (the rubble's, 57) the eye went down into the hollow building */
 if(RU.frame){const y=RU.frame[0]-.36;B.quad('dark',[-hw,y,hd],[hw,y,hd],[hw,y,-hd],[-hw,y,-hd],[0,1,0],{uv:2});}
 /* an impostor (lite) holds the bare frame too: a card has no trouble with free columns, which a shell fans into sheets */
 if(lite&&RU.frame){F.levels.forEach(L=>{if(L.y>=frame0&&L.y<cut){const o=only;only='frame';frameLevel(L);only=o;}});}
 if(RU.patchy)[1,-1].forEach(s=>{const z=s*(hd-1.2),a=RU.patchy[0],b=RU.patchy[1];if(s>0)B.quad('dark',[-hw,a,z],[hw,a,z],[hw,b,z],[-hw,b,z],[0,0,1],{uv:2});else B.quad('dark',[hw,a,z],[-hw,a,z],[-hw,b,z],[hw,b,z],[0,0,-1],{uv:2});});
 if(!torn){const pcol=stained(0,top);B.box('white',-hw,hw,top-.1,top+1.2,hd-.8,hd,{col:pcol});B.box('white',-hw,hw,top-.1,top+1.2,-hd,-hd+.8,{col:pcol});[1,-1].forEach(s=>B.box('white',s>0?hw-.8:-hw,s>0?hw:-hw+.8,top-.1,top+1.2,-hd+.8,hd-.8,{col:pcol}));B.quad('concrete',[-hw,top+.2,hd],[hw,top+.2,hd],[hw,top+.2,-hd],[-hw,top+.2,-hd],[0,1,0]);
 }
 if(cut>=roof){const c=F.massing[1];for(let i=0;i<c.steps;i++){const k=1-i*.2,w=c.w*k/2,d=c.d*k/2,y0=roof+i*2.8,y1=y0+2.8;B.box('bronze',-w,w,y0,y1-.5,-d,d,{uv:3});B.box('bronze',-w-.5,w+.5,y1-.5,y1,-d-.5,d+.5,{uv:3});}}
 else if(!torn){const c=[.6,.58,.54];for(let i=0;i<12;i++){const x=-44+i*8,h=.8+3*MP.u(seedK&0xffff,i,51);B.panel(x,top+h/2,0,0,.5,h,14,c);}}
 const G=B.finish(F,state);if(!lite)MP.doorLeaves(G,doors);return G;};
/* a hero by family and look: a state ('crown'), or a state overgrown ('crown.wild': the state's hero, then MP.overgrowDress, 59e) */
MP.hero=function(family,look,lite,only){const L=MP.look(look),state=L.state;let out;
 if(MP.DESIGNS&&MP.DESIGNS[family]){const G=MP.heroDesign(MP.DESIGNS[family],state,lite),Fp=MP.FAMILY[family],R=Fp&&Fp.design&&state&&state!=='intact'?MP.ruinDesign(G,Fp,state):G;out=MP.floraDress?MP.floraDress(R,family,state):R;}
 else if(MP.ANCIENTS&&MP.ANCIENTS[family]){const G=MP.heroAncient(MP.ANCIENTS[family],state),Fp=MP.FAMILY[family];out=Fp&&Fp.anc&&state&&state!=='intact'?MP.ruinDesign(G,Fp,state):G;}
 else out=family==='spindle'?MP.heroSpindle(state,lite,only):MP.heroLedger(state,lite,only);
 return L.wild&&MP.overgrowDress?MP.overgrowDress(out,family,state,{lite:!!lite}):out;};
