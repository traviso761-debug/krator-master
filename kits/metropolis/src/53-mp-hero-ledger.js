// ================================================================= METROPOLIS — M1, the Ledger: the hero  [draw]
// MP.heroLedger(state) -> a Group. Budget 45k triangles (F.tris). A slab along x: long faces on a 3 m bay grid from the plan (the same facade rule as the Spindle), arches
// of the great arcade and bronze flares every 12 m, blind relief end walls with the fire stairs behind them, a stepped metal roof hall.
MP.heroLedger=function(state,lite){const F=MP.LEDGER,S=F.ruins[state]||{},B=MP.builder(lite),ruin=state!=='intact',seedK=MP.idHash(F.id+state);
 const hw=F.footprint.w/2,hd=F.footprint.d/2,roof=F.levels[F.levels.length-1].y+F.levels[F.levels.length-1].h,cut=S.keep?S.keep*F.height.roof:1e9;
 const WALL=ruin?[.84,.81,.76]:[.97,.97,.95],DARK=[.12,.12,.13],D=.7,sc=ruin?MP.stain(seedK,S.stain==null?.7:S.stain):null;
 const shade=(x,y)=>sc?sc(x*.25,y):null,stained=(x,y)=>shade(x,y)||undefined;
 const breach=[];if(S.breach){for(let i=0;i<9;i++){const u=j=>MP.u(seedK&0xffff,i,j),l=2+Math.floor(u(1)*8);breach.push({x:-hw+u(2)*2*hw,w:3+u(3)*9,s:u(4)<.5?1:-1,y0:F.levels[l].y,y1:F.levels[l].y+(1+Math.floor(u(5)*3))*MP.STOREY});}}
 const inBreach=(x,y,s)=>breach.some(b=>b.s===s&&Math.abs(x-b.x)<b.w&&y>b.y0&&y<b.y1);
 const face=function(s,bays,L){const z=s*hd,n=[0,0,s],y0=L.y,y1=Math.min(L.y+L.h,cut),W=F.bays.width,kinds=bays.map(b=>b.kind),m=L.k<2?'concrete':'white';
  // a quad on the long face between x0 and x1 from y0 to y1, at depth d in (corners so that it faces out)
  const Q=(name,x0,x1,a,b,d,o)=>{const zz=z-s*d;if(s>0)B.quad(name,[x0,a,zz],[x1,a,zz],[x1,b,zz],[x0,b,zz],n,o);else B.quad(name,[x1,a,zz],[x0,a,zz],[x0,b,zz],[x1,b,zz],n,o);};
  if(L.use==='arcade'){Q(ruin?'glassOut':'glass',-hw,hw,0,y1,F.arcade.depth,{uv:4});return;}
  if(!kinds.some(k=>MP.isGlass(k)||k==='louvre')){bays.forEach(b=>{if(ruin&&inBreach(b.x,y0+1.8,s))return;Q(m,b.x-W/2,b.x+W/2,y0,y1,0,{col:shade(b.x,y0)||undefined});});return;}
  let sill=9,top=0;kinds.forEach(k=>{const z2=MP.BAYSIZE[k];if(z2){sill=Math.min(sill,z2[1]);top=Math.max(top,z2[2]);}});
  const yS=y0+sill,yT=Math.min(y0+top*(L.h/MP.STOREY),y1-.2);
  bays.forEach(function(b,bi){const x=b.x,a=x-W/2,c=x+W/2,k=b.kind,col=shade(x,y0)||undefined,ym=(yS+yT)/2,gone=ruin&&inBreach(x,ym,s);
   if(gone){Q('glassOut',a,c,y0,y1,2.2,{uv:4});return;}
   Q(m,a,c,y0,yS,0,{col});Q(m,a,c,yT,y1,0,{col});
   const nu=[0,s>0?1:1,0];B.quad(m,[a,yS,z],[c,yS,z],[c,yS,z-s*D],[a,yS,z-s*D],[0,1,0],{col,uv:2});B.quad(m,[a,yT,z-s*D],[c,yT,z-s*D],[c,yT,z],[a,yT,z],[0,-1,0],{col,uv:2});
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
 F.levels.forEach(function(L){if(L.y>=cut)return;const fac=MP.levelFacade(F,L.k);face(1,fac.south,L);face(-1,fac.north,L);
  const y1=Math.min(L.y+L.h,cut);
  if(L.use==='plant'){[1,-1].forEach(s=>B.box(ruin?'white':'bronze',-hw-.1,hw+.1,y1-.5,y1+.4,s>0?hd-.1:-hd-.35,s>0?hd+.35:-hd+.1,{uv:2}));}
  if(L.use==='arcade')[1,-1].forEach(s=>B.box(ruin?'cyanDead':'cyan',-hw,hw,y1-.4,y1-.15,s>0?hd:-hd-.08,s>0?hd+.08:-hd,{uv:2}));});
 // ---- the end walls: blind, in the relief block, with four flat pilasters
 const top=Math.min(roof,cut);
 [1,-1].forEach(function(s){const x=s*hw,c=stained(s*7,top*.5);if(s>0)B.quad('relief',[x,0,hd],[x,0,-hd],[x,top,-hd],[x,top,hd],[1,0,0],{uv:6,col:c});else B.quad('relief',[x,0,-hd],[x,0,hd],[x,top,hd],[x,top,-hd],[-1,0,0],{uv:6,col:c});
  for(let i=0;i<4;i++){const z=-hd+hd*(i*2+1)/4;B.box('concrete',s>0?x:x-.8,s>0?x+.8:x,0,top+1.2,z-.7,z+.7,{col:c});}});
 // ---- the arcade: an arch frame and a pier every 12 m, the arches instanced as panels would be flat, so each is a few voussoirs, and the bronze flares over them
 const A=F.arcade,ay=7.2;
 for(let i=0;i<=Math.round(2*hw/A.every);i++){const x=-hw+i*A.every,brk=ruin&&MP.u(seedK&0xffff,i,31)<.12;
  [1,-1].forEach(function(s){const z=s*hd;
   if(!brk)B.box('concrete',x-1,x+1,0,ay,Math.min(z,z-s*A.depth),Math.max(z,z-s*A.depth),{});
   if(i<Math.round(2*hw/A.every)){const a=6-1,nV=7,cx=x+A.every/2;
    for(let v=0;v<nV;v++){const t=Math.PI*(v+.5)/nV,w=2*a/nV*1.25,px=cx-Math.cos(t)*a,py=2.4+Math.sin(t)*(ay-2.4-.6)+.0;B.panel(px,(py+ay)/2,z-s*.5,0,w,ay-py,1,[.74,.72,.68]);}}
   // the flare: a bronze curve from the pier's foot to the spandrel, out of the wall
   if(i%1===0&&!(ruin&&MP.u(seedK&0xffff,i,41+s)<.3)){const n=8,Y=F.buttress.y1,O=F.buttress.out,col=ruin?[.55,.5,.42]:[1,1,1],t=.55;
    for(let j=0;j<n;j++){const ya=Y*j/n,yb=Y*(j+1)/n,oa=O*Math.pow(1-ya/Y,1.7),ob=O*Math.pow(1-yb/Y,1.7),l=Math.hypot(oa-ob,yb-ya),nz=(yb-ya)/l*s,ny=(oa-ob)/l,P=(xx,o,y)=>[xx,y,z+s*o];
     if(s>0){B.quad('bronze',P(x-t,oa,ya),P(x+t,oa,ya),P(x+t,ob,yb),P(x-t,ob,yb),[0,ny,nz],{col,uv:2});B.quad('bronze',P(x+t,oa,ya),P(x+t,0,ya),P(x+t,0,yb),P(x+t,ob,yb),[1,0,0],{col,uv:2});B.quad('bronze',P(x-t,0,ya),P(x-t,oa,ya),P(x-t,ob,yb),P(x-t,0,yb),[-1,0,0],{col,uv:2});}
     else{B.quad('bronze',P(x+t,oa,ya),P(x-t,oa,ya),P(x-t,ob,yb),P(x+t,ob,yb),[0,ny,nz],{col,uv:2});B.quad('bronze',P(x+t,0,ya),P(x+t,oa,ya),P(x+t,ob,yb),P(x+t,0,yb),[1,0,0],{col,uv:2});B.quad('bronze',P(x-t,oa,ya),P(x-t,0,ya),P(x-t,0,yb),P(x-t,ob,yb),[-1,0,0],{col,uv:2});}}}});}
 // ---- the roof: the parapet and, intact, the stepped metal hall of the council
 const pcol=stained(0,top);B.box('white',-hw,hw,top-.1,top+1.2,hd-.8,hd,{col:pcol});B.box('white',-hw,hw,top-.1,top+1.2,-hd,-hd+.8,{col:pcol});B.quad('concrete',[-hw,top+.2,hd],[hw,top+.2,hd],[hw,top+.2,-hd],[-hw,top+.2,-hd],[0,1,0]);
 if(cut>=roof){const c=F.massing[1];for(let i=0;i<c.steps;i++){const k=1-i*.2,w=c.w*k/2,d=c.d*k/2,y0=roof+i*2.8,y1=y0+2.8;B.box('bronze',-w,w,y0,y1-.5,-d,d,{uv:3});B.box('bronze',-w-.5,w+.5,y1-.5,y1,-d-.5,d+.5,{uv:3});}}
 else{const c=[.6,.58,.54];for(let i=0;i<12;i++){const x=-44+i*8,h=.8+3*MP.u(seedK&0xffff,i,51);B.panel(x,top+h/2,0,0,.5,h,14,c);}}
 return B.finish(F,state);};
MP.hero=function(family,state,lite){return family==='spindle'?MP.heroSpindle(state,lite):MP.heroLedger(state,lite);};
