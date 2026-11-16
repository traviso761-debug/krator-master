// prefix: cy
// ================================================================= THE TOOLKIT: walls, roofs, hatches, ladders, the ear door, the hearth, the carving
// Every helper draws in the builder's local frame (core/engine: +z the front, y up from the plot's ground) and decides nothing
// about where a building stands. The rule (PLAN.md section 2): mud and stone below, mud above, timber only where it is dear;
// flat roofs used as floors; the script on every wall that faces a road.
//   cyWall(x0,z0,x1,z1,y0,h,o)   a straight wall on the line (x0,z0)-(x1,z1), centred on it, o.t thick (CY.WALL): a stone socle
//                                (o.socle, CY.SOCLE; 0 none), the brick body in its outer render (o.mk 'render', or 'brick' bare),
//                                the white plaster on its inner face (o.inner: +1 the line's left, -1 its right, 0 none).
//                                o.holes [{at, w, y, h}]: openings, at along the line from (x0,z0) to the opening's middle,
//                                y its sill above y0. The wall is drawn round them (sides, sill, head), so the walk passes them.
//   cyRoof(x0,z0,x1,z1,y,o)      a flat roof over the box: round beams across the short span (o.over past the walls), a reed
//                                mat, and the earth slab whose top is y + o.t (.24); o.hole {x0,x1,z0,z1} the hatch. The slab
//                                is the roof's walk floor; the beams and the mat are drawn past the box reader.
//   cyHatchFrame(h,y)            the raised mud kerb round a hatch hole h at the roof's top y (three sides; the ladder's side open)
//   cyLadder(x,z,y0,y1,yaw,o)    a pole ladder (core/engine svStair, style 'ladder', rungs CY.RUNG apart): returns its plan
//   cyEarHoles(at,w,h,o)         the openings of an EAR DOOR (the culture's mark, PLAN.md section 2: a doorway whose head steps up
//                                in two notches at its corners): the doorway and its two ears, as cyWall holes
//   cyEarDoor(x,z,yaw,w,h,o)     the door's timbers in the wall's plane at (x,z), yaw out: the lintel over the ears, the sill,
//                                and its leaf (core/door, svLeaf: o.leaf false for an open doorway); declares the door()
//   cyHearth(x,z,o), cyOven(x,z,yaw,o), cyPlatform(x0,z0,x1,z1,h,o), cyBin(x,z,yaw,o)   the room's fixed furniture
//   cyCarve(C,cx,y0,zf,w,h,o)    a contour carving (32-cy-contour.js cyContour) on the face z = zf (normal +z) of the frame,
//                                the line's length scaled into w and its pitch into h, raised o.depth (.014), o.lw wide
//   cyRing(x0,z0,x1,z1,y0,h,o)   four walls on the rectangle's wall lines (the corners filled), outward the line's left as
//                                cyWall takes it, plaster inside: o.holes {s,e,n,w: [hole]} with `at` from each wall's start
//                                corner (s from the west end, e from the south, n from the east, w from the north); o.skip
//                                a string of sides not drawn (a wall the neighbour already has)
//   cyTarget(x,y,z,name)         a point the walk must reach from the front (verify.py walk-reach): the room's floor, the roof
function cyRing(x0,z0,x1,z1,y0,h,o){o=o||{};const t=o.t==null?CY.WALL:o.t,e=t/2,H=o.holes||{},skip=o.skip||'';
 const side=(k,ax,az,bx,bz)=>{if(skip.indexOf(k)>=0)return;const hs=(H[k]||[]).map(q=>Object.assign({},q,{at:q.at+e}));
  cyWall(ax,az,bx,bz,y0,h,Object.assign({},o,{holes:hs,inner:-1,trim:t}));};
 side('s',x0-e,z1,x1+e,z1);side('e',x1,z1+e,x1,z0-e);side('n',x1+e,z0,x0-e,z0);side('w',x0,z0-e,x0,z1+e);}
function cyTarget(x,y,z,name){if(PLACE_DRY||!CURREC)return;const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);(CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name});}
function cyWall(x0,z0,x1,z1,y0,h,o){o=o||{};const t=o.t==null?CY.WALL:o.t,soc=o.socle==null?CY.SOCLE:o.socle,mk=o.mk||'render',col=o.col==null?P('mud'):o.col;
 const L=Math.hypot(x1-x0,z1-z0);if(L<.05)return;const yaw=Math.atan2(z0-z1,x1-x0);
 const holes=(o.holes||[]).map(q=>({a:q.at-q.w/2,b:q.at+q.w/2,y0:y0+(q.y||0),y1:y0+(q.y||0)+q.h}));
 /* the inner plaster stops o.trim from each end (a ring wall runs on past its corner, through the next wall's thickness) */
 const p0=o.trim==null?0:o.trim,p1=L-p0;
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{const X=s=>s-L/2;
  const run=(a,b,ya,yb)=>{if(b-a<.01||yb-ya<.01)return;
   const sa=Math.max(ya,y0),sh=Math.min(yb,y0+soc);if(soc>0&&sh>sa)box('stone',X((a+b)/2),sa,0,b-a,sh-sa,t+.04,P('stone'));
   const ba=Math.max(ya,y0+soc);if(yb>ba)box(mk,X((a+b)/2),ba,0,b-a,yb-ba,t,col);
   const ia=Math.max(a,p0),ib=Math.min(b,p1);
   if(o.inner&&ib-ia>.01)box('lime',X((ia+ib)/2),Math.max(ya,y0)+.02,o.inner*(t/2+.008),ib-ia,yb-Math.max(ya,y0)-.02,.016,P('lime'));};
  /* the wall cut at every opening's edge: in each strip, solid between the openings that cover it (an ear door's notches
     stand over its doorway: openings may overlap) */
  const xs=[...new Set([0,L].concat(...holes.map(q=>[q.a,q.b])).filter(v=>v>=0&&v<=L))].sort((p,q)=>p-q);
  for(let i=1;i<xs.length;i++){const a=xs[i-1],b=xs[i],m=(a+b)/2;
   const open=holes.filter(q=>q.a<m&&q.b>m).map(q=>[q.y0,q.y1]).sort((p,q)=>p[0]-q[0]);
   let y=y0;for(const r of open){if(r[0]>y)run(a,b,y,r[0]);y=Math.max(y,r[1]);}
   run(a,b,y,y0+h);}});}
/* o.flush: the slab exactly the box (x0..x1, z0..z1), the beams inside it: roofs that meet their neighbours' in a village */
function cyRoof(x0,z0,x1,z1,y,o){o=o||{};const t=o.t==null?.24:o.t,over=o.over==null?(o.flush?-.05:.35):o.over,w=x1-x0,d=z1-z0,acrossX=w<d,gr=o.flush?0:.12;
 svNoWalk(()=>{const n=Math.max(3,Math.round((acrossX?d:w)/.55));
  for(let i=0;i<n;i++){const f=(i+.5)/n,r=.075+rr(-.01,.015);
   if(acrossX){const z=z0+f*d;pole('timber',[x0-over,y-.08,z],[x1+over,y-.08,z],r,P('timber'),7);}
   else{const x=x0+f*w;pole('timber',[x,y-.08,z0-over],[x,y-.08,z1+over],r,P('timber'),7);}}
  box('reed',(x0+x1)/2,y-.005,(z0+z1)/2,w+.02,.03,d+.02,P('reed'));});
 svWell('roof',(x0+x1)/2,y+.02,(z0+z1)/2,w+gr,t-.02,d+gr,o.col==null?P('roof'):o.col,o.hole||null);
 return y+t;}
function cyHatchFrame(h,y,open){const k=.16,hh=.18;const sides=[['n',h.x0,h.x1,h.z0-k,h.z0],['s',h.x0,h.x1,h.z1,h.z1+k],['w',h.x0-k,h.x0,h.z0-k,h.z1+k],['e',h.x1,h.x1+k,h.z0-k,h.z1+k]];
 for(const s of sides)if(s[0]!==open)box('render',(s[1]+s[2])/2,y,(s[3]+s[4])/2,s[2]-s[1],hh,s[4]-s[3],P('mudL'));}
function cyLadder(x,z,y0,y1,yaw,o){o=o||{};return svStair(x,z,y0,y1,yaw,{style:'ladder',w:o.w==null?.55:o.w,riser:CY.RUNG,run:(y1-y0)/CY.LEAN,mk:'timber',col:P('timber')});}
function cyEarHoles(at,w,h,o){o=o||{};const ew=o.ear==null?Math.min(.26,w*.24):o.ear,eh=o.earH==null?.3:o.earH;
 return [{at,w,y:0,h},{at:at-w/2+ew/2,w:ew,y:h,h:eh},{at:at+w/2-ew/2,w:ew,y:h,h:eh}];}
function cyEarDoor(x,z,yaw,w,h,o){o=o||{};const eh=o.earH==null?.3:o.earH,t=o.t==null?CY.WALL:o.t;
 W(x,0,z,yaw,()=>{box('timber',0,h+eh,0,w+.5,.14,t+.06,P('timber'));
  box('stone',0,-.02,0,w+.12,.06,t+.1,P('stone'));
  if(o.leaf!==false)svLeaf(0,.04,t*.15,0,w-.04,h-.06,{mk:'wood',col:P('wood'),style:'plank',name:o.name||null});
  door(0,0,t/2,0,w,h);});}
function cyHearth(x,z,o){o=o||{};const r=o.r==null?.42:o.r;
 svNoWalk(()=>{cyl('lime',x,0,z,r,.1,P('lime'),16);cyl('ash',x,.1,z,r-.08,.012,P('ash'),14);
  for(let i=0;i<3;i++)sph('glow',x+rr(-.12,.12),.12,z+rr(-.12,.12),.05,new THREE.Color(1,.42,.12),.5,6);});
 smokeAt(x,.4,z,{r:.2,kind:'fire'});}
function cyOven(x,z,yaw,o){o=o||{};const r=o.r==null?.55:o.r;
 W(x,0,z,yaw,()=>{svNoWalk(()=>{lathe('render',0,0,[[r,0],[r,.25],[r*.94,.45],[r*.75,.7],[r*.42,.86],[0,.92]],14,P('mudL'));
  box('plain',0,.12,r-.02,.36,.3,.04,new THREE.Color(.06,.04,.03));sph('glow',0,.2,r-.12,.07,new THREE.Color(1,.4,.1),.5,6);});});}
function cyPlatform(x0,z0,x1,z1,h,o){o=o||{};box('lime',(x0+x1)/2,0,(z0+z1)/2,x1-x0,h,z1-z0,o.col==null?P('lime'):o.col);}
function cyBin(x,z,yaw,o){o=o||{};const w=o.w==null?.6:o.w,d=o.d==null?.45:o.d,h=o.h==null?.55:o.h;
 W(x,0,z,yaw,()=>{for(const s of [-1,1])box('lime',s*(w/2-.03),0,0,.06,h,d,P('lime'));box('lime',0,0,-d/2+.03,w,h,.06,P('lime'));box('lime',0,0,d/2-.03,w,h*.55,.06,P('lime'));
  box('floor',0,0,0,w-.1,h*.35,d-.1,P('ochre'));});}
function cyCarve(C,cx,y0,zf,w,h,o){o=o||{};if(!C||!C.length)return 0;const dp=o.depth==null?.014:o.depth,mk=o.mk||'carve',col=o.col==null?P('carve'):o.col;
 /* o.wrap: a word a row, top to bottom, every row on one scale (the longest word fills w): a slab's narrow face */
 const S0=C.strokes,rows=o.wrap?S0.length:1,rh=h/rows,span=s=>s.pts[s.pts.length-1][0]-s.pts[0][0];
 const sx=o.wrap?w/Math.max(...S0.map(span),1e-3):w/C.length,lw=o.lw==null?Math.max(.012,rh*.06):o.lw,z=zf+dp/2;let n=0;
 /* a wrapped row's pitch is never drawn taller than half the face's width: the line stays a line, not a scribble */
 svNoWalk(()=>{S0.forEach((S,si)=>{const u0=o.wrap?S.pts[0][0]:0,ox=o.wrap?cx-span(S)*sx/2:cx-w/2,vh=o.wrap?Math.min(rh*.8,w*.5):h,oy=o.wrap?y0+h-rh*(si+1)+(rh-vh)/2:y0;
  const X=u=>ox+(u-u0)*sx,Y=v=>oy+v*vh;
  for(let i=1;i<S.pts.length;i++){const a=S.pts[i-1],b=S.pts[i],ax=X(a[0]),ay=Y(a[1]),bx=X(b[0]),by=Y(b[1]);
  const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy);if(L<1e-4)continue;
  if(Math.abs(dx)<.05*Math.abs(dy))box(mk,(ax+bx)/2,Math.min(ay,by)-lw/2,z,lw,Math.abs(dy)+lw,dp,col);
  else{const ex=dx/L*lw/2,ey=dy/L*lw/2;beam(mk,[ax-ex,ay-ey,z],[bx+ex,by+ey,z],dp,col,false,0,lw);}n++;}});});
 return n;}
// ---------------------------------------------------------------- the room's goods and marks (C2)
//   cyHorns(x,y,z,yaw,o)         a plastered pillar against a wall (+z out of it) set with horns: Catalhoyuk's bucrania, here goat
//                                horns in pairs up the pillar and a coyote skull at its head (o.n pairs, default 2)
//   cyBird(x,y,z,s,col)          the runner bird painted on a face (+z out of it): a running ground bird in profile, s its length
//   cyJar(x,z,o)                 a storage jar on the floor (o.h, o.r, o.y)
//   cyQuern(x,z,yaw)             a saddle quern: the lower stone on a mud kerb, the hand stone on it
//   cyLoom(x,z,yaw,o)            an upright warp-weighted loom against a wall: two posts, the beam, the warp, the weights, the cloth
function cyHorns(x,y,z,yaw,o){o=o||{};const n=o.n==null?2:o.n,h=.55+n*.42;
 W(x,y,z,yaw,()=>{box('lime',0,0,-.12,.5,h,.24,P('lime'));
  for(let i=0;i<n;i++){const yy=.45+i*.42;box('lime',0,yy-.04,.02,.34,.16,.12,P('lime'));
   for(const s of [-1,1]){const a=[s*.12,yy+.04,.08],b=[s*.36,yy+.26,.16];pole('bone',a,b,.035,P('horn'),6);pole('bone',b,[s*.4,yy+.38,.1],.022,P('horn'),5);}}
  const ty=h+.02;sph('bone',0,ty+.08,.04,.11,P('bone'),.85,8);cone('bone',0,ty+.06,.14,.05,.18,P('bone'),7);
  for(const s of [-1,1])cone('bone',s*.07,ty+.15,.0,.035,.1,P('bone'),5);});}
function cyBird(x,y,z,s,col){col=col==null?P('red'):col;const d=.006;
 W(x,y,z,0,()=>{ellip('plain',0,0,d,s*.28,s*.12,d,col,0,8);
  beam('plain',[s*.2,s*.04,d],[s*.62,s*.1,d],d,col,false,0,s*.06);
  beam('plain',[-s*.18,s*.06,d],[-s*.3,s*.3,d],d,col,false,0,s*.05);ellip('plain',-s*.34,s*.33,d,s*.08,s*.055,d,col,0,6);
  beam('plain',[-s*.4,s*.33,d],[-s*.52,s*.31,d],d,col,false,0,s*.025);
  for(const k of [-1,1]){beam('plain',[k*s*.04,-s*.08,d],[k*s*.16,-s*.3,d],d,col,false,0,s*.03);beam('plain',[k*s*.16,-s*.3,d],[k*s*.1+s*.04,-s*.46,d],d,col,false,0,s*.025);}});}
function cyJar(x,z,o){o=o||{};const h=o.h==null?.7:o.h,r=o.r==null?.24:o.r,y=o.y==null?0:o.y;
 svNoWalk(()=>lathe('render',x,z,[[r*.45,y],[r,y+h*.3],[r*.95,y+h*.7],[r*.5,y+h*.92],[r*.55,y+h]],12,P('ochre')));}
function cyQuern(x,z,yaw){W(x,0,z,yaw,()=>{box('lime',0,0,0,.8,.28,.5,P('lime'));box('slab',0,.28,0,.62,.08,.36,P('stone'));box('slab',.05,.36,0,.22,.07,.18,P('carve'));});}
function cyLoom(x,z,yaw,o){o=o||{};const w=o.w==null?1.4:o.w,h=o.h==null?2.0:o.h;
 W(x,0,z,yaw,()=>{for(const s of [-1,1])pole('timber',[s*w/2,0,-.05],[s*w/2,h,-.12],.04,P('timber'),6);
  pole('timber',[-w/2-.05,h-.1,-.12],[w/2+.05,h-.1,-.12],.035,P('timber'),6);
  box('plain',0,h*.55,-.09,w-.15,h*.38,.01,o.col==null?new THREE.Color(.62,.42,.12):o.col);
  for(let i=0;i<9;i++){const xx=-w/2+.12+i*(w-.24)/8;box('plain',xx,.25,-.07,.006,h*.3,.006,P('bone'));sph('render',xx,.22,-.07,.05,P('mudD'),1,6);}});}
