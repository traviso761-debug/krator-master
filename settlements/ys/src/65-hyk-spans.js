// ================================================================= HYKKOUSOI — SPANS (agent F): the pieces of the walk grid
// Rib bridges at L1 and L2, the Amphitriton's drawbridge, the spiral stair down a host, the bone ladder, the lily-pad
// landing, the grown walkway at the quay datum and the pontoon walkway at the wet datum (DESIGN §3, §6). Every deck is
// a backbone (hykBridge: spine, vertebrae, edge ribs, rails on posts), every landing a lily pad on a stalk rooted with
// flares at both ends, every rib that meets a surface ends inside it through a flare and a knuckle.
//
// Two layers. The HELPERS do the work in whatever frame is current (inside a HYK builder: the local frame; in the city,
// called from a layout pass with no frame: world) and take END POINTS, {x,y,z} at deck level:
//   hykSpanBridgeL1(A,B,o)  hykSpanBridgeL2(A,B,o)  hykSpanDrawbridge(A,B,o)  hykSpanWalkway(A,B,o)
//   hykSpanPontoon(A,B,o)   hykSpanLadder(x,z,y0,y1,o)  hykSpanLilypad(x,y,z,R,o)  hykSpanStairStraight(A,B,o)
//   hykSpanStairSpiral(cx,cz,rAt(y,a),y0,y1,o)   // bearing-aware: hugs a lobed host, smooths an overhang, brackets into the face
// o carries hykBridge's own options through (w, rise, own, branches, runners) plus level (the door marks' datum) and
// ground(x,z) (the local y a stalk roots in; default: the terrain under it). The DEFS (HYK.def) are free-standing
// showcases of those helpers for the kit sheet: each makes its own two ends (lily pads on stalks 36–48 m apart along
// x) and calls the helper between them. A span's thresholds are recorded as door marks at each end (every piece on the
// sheet has a door for the probe; a bridge's doors are where it is stepped onto), a wet landing as a wetdoor.
// Seeds 30200–30249 (brief §3): one builder every six.
// ---------------------------------------------------------------- shared bits
const hykSpanBone=()=>hC(hPick(HPAL.bone));
// the ground's local y under a local point (frame-agnostic: hykW is the identity with no frame)
function hykSpanGround(lx,lz){const w=hykW(lx,0,lz);return terrainH(w[0],w[2])-(HYK.cur?(HYK.cur.o.y||0):0);}
// a mark in the current frame (world when there is none), tagged with the current building
function hykSpanMark(kind,lx,ly,lz,nx,nz,w,h,level,extra){const c=HYK.cur;const p=hykW(lx,ly,lz),n=hykN(nx,0,nz);
 const m=Object.assign({bld:c?c.id:null,key:c?c.key:null,name:c?c.name:null,kind,x:p[0],y:p[1],z:p[2],nx:n[0],nz:n[2],w,h,level:level||'ground',room:null,lit:false},extra||{});
 if(kind==='door'||kind==='wetdoor'){m.step=[p[0]+n[0],p[2]+n[2]];m.thresh=[p[0]-n[0],p[2]-n[2]];}return ysMark(m);}
// a stalk: the trunk under a lily pad, a fluted ringed lathe from yBase up to yTop, rooted with a flare into the ground
// and a flare up into the pad's underside. Nothing stands on a bare post.
function hykSpanStalk(x,z,yTop,yBase,R,o){o=o||{};const col=o.col||hC(hPick(HPAL.shell));const mat=o.mat||'hkShell';const rb=o.rb||R*.5,rt=o.rt||R*.24;const H=yTop-yBase;if(H<=.3)return;
 hykPut(mat,hykLathe({H,yBase,cx:x,cz:z,rFn:y=>rb+(rt-rb)*Math.pow(y/H,.7),nu:22,nv:Math.max(4,Math.round(H/1.5)),flute:{n:9,amp:.06,sharp:1.4},rings:{n:Math.max(3,Math.round(H/2.2)),amp:.03},noise:{amp:.03,su:3,sv:1,seed:((x*3)|0)+(z|0)},col}));
 hykPut(mat,hykFlare([x,yBase,z],[0,1,0],rb*.98,rb*.7,{col}));
 hykPut(mat,hykFlare([x,yTop,z],[0,-1,0],rt*1.05,rt*.9,{col}));}
// a lily pad on a stalk: hykPad (lobed disc, domed underside, lip, rail on posts) plus the stalk and, if asked, a lamp
// on a rail post. o:{col,mat,own,rail:{a0,gap},stalk:false,ground (local y),lamp:{a,cool,level}}
function hykSpanPad(x,y,z,R,o){o=o||{};const col=o.col||hC(hPick(HPAL.shell));
 const pad=hykPad(x,y,z,R,{col,mat:o.mat,own:o.own,lobes:o.lobes,rail:o.rail});
 if(o.stalk!==false){const yb=o.ground!=null?o.ground:hykSpanGround(x,z)-.8;hykSpanStalk(x,z,y-.3-R*.22+.15,yb,R,{col,mat:o.mat});}
 if(o.lamp){const a=o.lamp.a!=null?o.lamp.a:Math.PI/2;const rr=R*.9;const px=x+rr*Math.cos(a),pz=z+rr*Math.sin(a);hykSpanLampPost(px,y,pz,{cool:o.lamp.cool,level:o.lamp.level,h:2.1});}
 return pad;}
// the walking plate over a hykBridge run: hykDeck's default winding faces down (62), so the plate seen from above is
// the underside one half a metre down and the spine shows through it as a ridge; this lays an up-wound plate at deck level
function hykSpanDeckTop(pts,w,col){hykPut('hkShell',hykDeck(pts.map(p=>[p[0],p[1]+.01,p[2]]),w,{col:col||hC(hPick(HPAL.shell)),camber:.08,flip:false}));}
// a lamp on a post: a bone post from a deck or rim up `h`, a short bracket, the pearl (warm) or jar (cool) in its cup
function hykSpanLampPost(x,y,z,o){o=o||{};const col=o.col||hykSpanBone();const h=o.h||2.4;kput('hkPost',[x,y+h/2,z],null,[.08,h,.08],col);kput('hkBall',[x,y+h,z],null,[.14,.12,.14],col);
 return hykLight(x,y+h+.22,z,{r:o.r||.2,cool:!!o.cool,nacre:o.nacre,level:o.level||'ground',bracket:[x,y+h,z]});}
// a rail on posts along a polyline: a bone tube at +hr, posts every `every` metres
function hykSpanRail(pts,o){o=o||{};const col=o.col||hykSpanBone();const hr=o.h||1.1;const every=o.every||1.3;
 hykPut('hkBone',hykTube(pts.map(p=>[p[0],p[1]+hr,p[2]]),()=>.07,{seg:6,col}));
 let acc=every;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);let s=acc;
  while(s<=L){const t=s/L;const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];kput('hkPost',[p[0],p[1]+hr/2,p[2]],null,[.06,hr,.06],col);s+=every;}acc=s-L;}
 if(o.ends!==false)for(const p of [pts[0],pts[pts.length-1]])kput('hkPost',[p[0],p[1]+hr/2,p[2]],null,[.06,hr,.06],col);}
// ---------------------------------------------------------------- the rib bridges
// L1: the promenade span. hykBridge's backbone with the L1 look: a second, lower hand-rail, knuckles where the edge ribs
// land, a lamp on a post at each end. o: w rise own branches runners level lamps col deckCol
function hykSpanBridgeL1(A,B,o){o=o||{};const col=o.col||hykSpanBone();const w=o.w||2.6;const L=Math.hypot(B.x-A.x,B.z-A.z)||1;const lv=o.level||'L1';
 const rise=o.rise!=null?o.rise:Math.min(3.2,L*.065);
 const br=hykBridge(A,B,{w,rise,col,deckCol:o.deckCol,own:o.own||'span L1',branches:o.branches,runners:o.runners});
 const tx=(B.x-A.x)/L,tz=(B.z-A.z)/L,rx=-tz,rz=tx;const pts=br.pts;const n=pts.length-1;hykSpanDeckTop(pts,w,o.deckCol);
 for(const s of [-1,1])hykPut('hkBone',hykTube(pts.map(p=>[p[0]+rx*s*w*.46,p[1]+.32,p[2]+rz*s*w*.46]),()=>.05,{seg:6,col}));   // the lower hand-rail
 for(const e of [pts[0],pts[n]])for(const s of [-1,1])kput('hkBall',[e[0]+rx*s*w*.46,e[1]-.3,e[2]+rz*s*w*.46],null,[.4,.36,.4],col);
 if(o.lamps!==false){hykSpanLampPost(pts[0][0]+rx*w*.46+tx*1.3,pts[0][1]-.05,pts[0][2]+rz*w*.46+tz*1.3,{level:lv,col});hykSpanLampPost(pts[n][0]-rx*w*.46-tx*1.3,pts[n][1]-.05,pts[n][2]-rz*w*.46-tz*1.3,{level:lv,col});}
 hykSpanMark('door',pts[0][0],pts[0][1],pts[0][2],-tx,-tz,w,2.3,lv);hykSpanMark('door',pts[n][0],pts[n][1],pts[n][2],tx,tz,w,2.3,lv);
 return br;}
// L2: the high span between the big towers. Wider, a higher rise, the vertebrae more pronounced (a rib at every sample,
// a joint knuckle on the spine under each), taller rails (a top rail on tall posts).
function hykSpanBridgeL2(A,B,o){o=o||{};const col=o.col||hykSpanBone();const w=o.w||3.0;const L=Math.hypot(B.x-A.x,B.z-A.z)||1;const lv=o.level||'L2';
 const rise=o.rise!=null?o.rise:Math.min(6.5,L*.11);
 const br=hykBridge(A,B,{w,rise,col,deckCol:o.deckCol,own:o.own||'span L2',branches:o.branches,runners:o.runners});
 const tx=(B.x-A.x)/L,tz=(B.z-A.z)/L,rx=-tz,rz=tx;const pts=br.pts;const n=pts.length-1;hykSpanDeckTop(pts,w,o.deckCol);
 for(let i=1;i<n;i+=2){const p=pts[i];hykPut('hkBone',hykRib([p[0]-rx*w*.55,p[1]-.5,p[2]-rz*w*.55],[p[0]+rx*w*.55,p[1]-.5,p[2]+rz*w*.55],{rise:-.6,r0:.22,r1:.17,n:8,seg:6,col}));
  kput('hkBall',[p[0],p[1]-.78,p[2]],null,[.56,.5,.56],col);for(const s of [-1,1])kput('hkBall',[p[0]+rx*s*w*.55,p[1]-.5,p[2]+rz*s*w*.55],null,[.36,.3,.36],col);}
 for(const s of [-1,1]){const edge=pts.map(p=>[p[0]+rx*s*w*.46,p[1]-.3,p[2]+rz*s*w*.46]);hykPut('hkBone',hykTube(edge.map(p=>[p[0],p[1]+1.95,p[2]]),()=>.07,{seg:6,col}));
  for(let i=1;i<n;i+=2){const p=edge[i];kput('hkPost',[p[0],p[1]+.98,p[2]],null,[.06,1.95,.06],col);kput('hkBall',[p[0],p[1]+1.95,p[2]],null,[.12,.1,.12],col);}
  for(const e of [edge[0],edge[n]])kput('hkBall',e,null,[.44,.4,.44],col);}
 if(o.lamps!==false){hykSpanLampPost(pts[0][0]+rx*w*.46+tx*1.3,pts[0][1]-.05,pts[0][2]+rz*w*.46+tz*1.3,{level:lv,col,h:2.8});hykSpanLampPost(pts[n][0]-rx*w*.46-tx*1.3,pts[n][1]-.05,pts[n][2]-rz*w*.46-tz*1.3,{level:lv,col,h:2.8});}
 hykSpanMark('door',pts[0][0],pts[0][1],pts[0][2],-tx,-tz,w,2.3,lv);hykSpanMark('door',pts[n][0],pts[n][1],pts[n][2],tx,tz,w,2.3,lv);
 return br;}
// ---------------------------------------------------------------- the drawbridge (built DOWN: closed)
// Two leaves meet at mid-span. At each abutment two bone spires stand either side of the deck; from the top of each an
// arm pivots on a knuckle: its heel carries a shell counterweight (up, when the leaf is down), its tip a chain down to
// the leaf's far corner. The leaves hinge on a transverse pin at the abutment, braced to the spires' feet. A,B are the
// abutment thresholds at deck level. o: w own level col spireH
function hykSpanDrawbridge(A,B,o){o=o||{};const col=o.col||hykSpanBone();const col2=hC(hPick(HPAL.shell));const w=o.w||3.2;const L=Math.hypot(B.x-A.x,B.z-A.z)||1;const lv=o.level||'L1';
 const tx=(B.x-A.x)/L,tz=(B.z-A.z)/L,rx=-tz,rz=tx;const gap=.4;const own=o.own||'drawbridge';
 const M=[(A.x+B.x)/2,(A.y+B.y)/2+.28,(A.z+B.z)/2];
 const Ma={x:M[0]-tx*gap/2,y:M[1],z:M[2]-tz*gap/2},Mb={x:M[0]+tx*gap/2,y:M[1],z:M[2]+tz*gap/2};
 const lA=hykBridge(A,Ma,{w,rise:0,col,own:own+' leaf A'}),lB=hykBridge(Mb,B,{w,rise:0,col,own:own+' leaf B'});hykSpanDeckTop(lA.pts,w);hykSpanDeckTop(lB.pts,w);
 const SH=o.spireH||9.5;
 for(const end of [{P:A,d:1,tip:Ma},{P:B,d:-1,tip:Mb}]){const P=end.P,dx=tx*end.d,dz=tz*end.d;   // d: along the span, away from this abutment
  // the hinge pin across the deck's end, knuckled, braced to the spires' feet
  const hy=P.y-.55;const pin=[[P.x-rx*(w*.5+1.0),hy,P.z-rz*(w*.5+1.0)],[P.x+rx*(w*.5+1.0),hy,P.z+rz*(w*.5+1.0)]];
  hykPut('hkBone',hykTube(pin,()=>.2,{seg:8,col}));for(const q of pin)kput('hkBall',q,null,[.38,.38,.38],col);
  for(const s of [-1,1]){const sx=P.x+rx*s*(w*.5+1.1)-dx*1.3,sz=P.z+rz*s*(w*.5+1.1)-dz*1.3;   // the spire's foot, behind the hinge
   hykPut('hkBone',hykLathe({H:SH,yBase:P.y-.5,cx:sx,cz:sz,rFn:y=>.62*Math.pow(1-y/SH*.78,1.1)+.08,nu:18,nv:14,flute:{n:8,amp:.1,sharp:1.3},twist:.25,rings:{n:5,amp:.03},col}));
   hykPut('hkBone',hykFlare([sx,P.y-.5,sz],[0,1,0],.66,.7,{col}));
   const top=[sx,P.y-.5+SH,sz];kput('hkBall',top,null,[.52,.48,.52],col);   // the pivot knuckle
   // the brace from the foot to the pin's end
   hykPut('hkBone',hykTube([[sx,P.y-.2,sz],[P.x+rx*s*(w*.5+1.0),hy,P.z+rz*s*(w*.5+1.0)]],()=>.11,{seg:6,col}));
   // the arm: heel up and back with the counterweight, tip down and forward; knuckled, thick at the pivot
   const heel=[sx-dx*4.2,top[1]+2.3,sz-dz*4.2],tip=[sx+dx*5.4,top[1]-1.1,sz+dz*5.4];
   hykPut('hkBone',hykTube([heel,[sx-dx*2.0,top[1]+1.1,sz-dz*2.0],top,[sx+dx*2.6,top[1]-.5,sz+dz*2.6],tip],(t)=>(.18+.14*Math.sin(t*Math.PI))*(1+.18*Math.max(0,Math.cos(t*5*TAU))),{seg:8,col}));
   kput('hkBall',heel,null,[1.25,1.1,1.25],col2);kput('hkBall',[heel[0],heel[1]-.2,heel[2]],null,[.95,1.3,.95],col2);   // the counterweight: a shell boulder
   kput('hkBall',tip,null,[.26,.26,.26],col);
   // the chain from the tip down to the leaf's far corner at mid-span
   const corner=[end.tip.x+rx*s*w*.46,end.tip.y+.08,end.tip.z+rz*s*w*.46];const cl=Math.hypot(corner[0]-tip[0],corner[1]-tip[1],corner[2]-tip[2]);
   const ch=[];for(let i=0;i<=16;i++){const t=i/16;ch.push([tip[0]+(corner[0]-tip[0])*t,tip[1]+(corner[1]-tip[1])*t-.35*Math.sin(t*Math.PI),tip[2]+(corner[2]-tip[2])*t]);}
   hykPut('hkBone',hykTube(ch,(t)=>.07*(1+.6*Math.max(0,Math.cos(t*cl/.45*TAU))),{seg:6,col}));kput('hkBall',corner,null,[.22,.2,.22],col);}}
 hykSpanMark('door',A.x,A.y,A.z,-tx,-tz,w,2.3,lv);hykSpanMark('door',B.x,B.y,B.z,tx,tz,w,2.3,lv);
 return {A,B,M,leaves:2};}
// ---------------------------------------------------------------- stairs
// A straight flight from A (bottom) to B (top), {x,y,z}: treads between two knuckled bone strings, a rail on posts on
// the side(s) asked. o: w rails:'both'|'left'|'right'|'none' col
function hykSpanStairStraight(A,B,o){o=o||{};const col=o.col||hykSpanBone();const w=o.w||1.2;const dy=B.y-A.y;const L=Math.hypot(B.x-A.x,B.z-A.z)||1;const tx=(B.x-A.x)/L,tz=(B.z-A.z)/L,rx=-tz,rz=tx;
 const nst=Math.max(2,Math.round(dy/.19));const run=L/nst;const ry=Math.atan2(tx,tz);
 for(let i=0;i<nst;i++){const t=(i+.5)/nst;kput('hkTread',[A.x+(B.x-A.x)*t,A.y+dy*(i+1)/nst-.06,A.z+(B.z-A.z)*t],qEuler(0,ry,0),[w,.12,run*1.08],col);}
 for(const s of [-1,1]){const a=[A.x+rx*s*w*.5,A.y-.1,A.z+rz*s*w*.5],b=[B.x+rx*s*w*.5,B.y-.1,B.z+rz*s*w*.5];
  hykPut('hkBone',hykTube([a,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],b],(t)=>.12*(1+.25*Math.max(0,Math.cos(t*L/.9*TAU))),{seg:6,col}));kput('hkBall',a,null,[.2,.2,.2],col);kput('hkBall',b,null,[.2,.2,.2],col);
  const side=s>0?'right':'left';if(o.rails==='none'||(o.rails&&o.rails!=='both'&&o.rails!==side))continue;
  hykSpanRail([[a[0],a[1]+.1,a[2]],[b[0],b[1]+.1,b[2]]],{col,h:.95,every:1.1});}
 return {nst,run};}
// A spiral stair hugging a round or lobed host from y0 down to y1 (y0 > y1). rAt(y,a) is the host's face radius at
// height y and LOCAL angle a about (cx,cz) (the caller converts a to a world bearing if its host is lobed). The treads
// follow the face; where the face steps in (a body on a core, an overhang) the stair closes on it no faster than
// .14 m a step, so no tread is ever a metre from the last. A knuckled stringer runs under the treads' outer edge, a
// bracket rib every six steps ends inside the face through a flare and a knuckle, a rail on posts rides the outer
// edge. Returns {a1,y1,r1} (the last tread's angle, height and face radius). o: a0 dir w col
function hykSpanStairSpiral(cx,cz,rAt,y0,y1,o){o=o||{};const w=o.w||1.1,rise=.19,run=.64,dir=o.dir||1;const col=o.col||hykSpanBone();
 const nst=Math.max(1,Math.round((y0-y1)/rise));let a=o.a0||0,y=y0;let r=rAt(y,a);const rail=[],str=[];let last=null;
 for(let i=0;i<=nst;i++){const rf=rAt(y,a);r=Math.max(rf,r-.14);if(rf<r&&rf>r-.14)r=rf;   // the face, smoothed over a step-in
  const rc=r+.1+w/2,ro=r+.1+w;const cs=Math.cos(a),sn=Math.sin(a);
  kput('hkTread',[cx+rc*cs,y-.06,cz+rc*sn],qEuler(0,-a,0),[w,.12,run*1.08],col);
  rail.push([cx+ro*cs,y+.95,cz+ro*sn]);str.push([cx+(r+.1+w*.82)*cs,y-.24,cz+(r+.1+w*.82)*sn]);
  if(i%7===0)kput('hkPost',[cx+ro*cs,y+.45,cz+ro*sn],null,[.05,.95,.05],col);
  if(i%6===3&&i<nst){const fp=[cx+(rf+.05)*cs,y-1.2,cz+(rf+.05)*sn];const nrm=[cs,0,sn];const under=[cx+(r+.1+w*.7)*cs,y-.26,cz+(r+.1+w*.7)*sn];
   const dl=Math.hypot(under[0]-fp[0],under[1]-fp[1],under[2]-fp[2]);const mid=[(under[0]+fp[0])/2,(under[1]+fp[1])/2-Math.min(1.2,dl*.12),(under[2]+fp[2])/2];
   hykPut('hkBone',hykTube([under,mid,[fp[0]+cs*.4,fp[1]+.05,fp[2]+sn*.4],fp,[fp[0]-cs*.5,fp[1],fp[2]-sn*.5]],(t)=>(.15-.04*t)*(1+.22*Math.max(0,Math.cos(t*Math.max(2,Math.round(dl/1.6))*TAU))),{seg:7,col}));
   hykPut('hkBone',hykFlare(fp,nrm,.16,.4,{col}));kput('hkBall',[fp[0]+cs*.4,fp[1],fp[2]+sn*.4],null,[.2,.2,.2],col);kput('hkBall',under,null,[.2,.18,.2],col);}
  last={a,y,r};a+=dir*run/rc;y-=rise;}
 if(rail.length>2){hykPut('hkBone',hykTube(rail,()=>.07,{seg:6,col}));hykPut('hkBone',hykTube(str,(t)=>.13*(1+.25*Math.max(0,Math.cos(t*nst/3*TAU))),{seg:7,col}));}
 return {a1:last.a,y1:last.y,r1:last.r};}
// ---------------------------------------------------------------- the ladder
// A bone ladder from (x,z) at y0 up to y1 with a cage: two knuckled stringers, rungs, hoops joined by bars from 2.4 m
// up, the stringers' tops curled over toward -z (the landing side) and knuckled. The climber stands on the +z side.
function hykSpanLadder(x,z,y0,y1,o){o=o||{};const col=o.col||hykSpanBone();const H=y1-y0;const hw=.36;
 for(const s of [-1,1]){const pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push([x+s*hw,y0+H*t,z]);}pts.push([x+s*hw,y1+.25,z-.25],[x+s*hw,y1+.3,z-.6]);
  hykPut('hkBone',hykTube(pts,(t)=>.085*(1+.3*Math.max(0,Math.cos(t*H/.6*TAU))),{seg:6,col}));kput('hkBall',[x+s*hw,y1+.3,z-.6],null,[.15,.15,.15],col);kput('hkBall',[x+s*hw,y0,z],null,[.16,.16,.16],col);}
 for(let yy=y0+.32;yy<y1-.05;yy+=.3)kput('hkPost',[x,yy,z],qEuler(0,0,Math.PI/2),[.04,hw*2,.04],col);
 const cR=.72,cz=z+.55;for(let yy=y0+2.4;yy<y1-.1;yy+=1.4)kput('hkLip',[x,yy,cz],qEuler(Math.PI/2,0,0),[cR,cR,.35],col);
 if(H>3.2){for(let k=0;k<5;k++){const a=Math.PI/2-.75+k*.375;const px=x+cR*Math.cos(a),pz=cz+cR*Math.sin(a);hykPut('hkBone',hykTube([[px,y0+2.4,pz],[px,y1-.1,pz]],()=>.03,{seg:5,col}));}}
 return {x,z,y0,y1};}
// ---------------------------------------------------------------- the lily-pad landing
function hykSpanLilypad(x,y,z,R,o){o=o||{};return hykSpanPad(x,y,z,R,Object.assign({lamp:{a:(o.rail?o.rail.a0:0)+1.3,cool:true,level:o.level||'quay'}},o));}
// ---------------------------------------------------------------- the grown walkway
// A long low deck at the quay datum: hykBridge's backbone with no rise, on stalks from the spine down into the ground
// every `every` metres (each rooted with a flare, knuckled at the spine). o: w every own level ground(x,z) col
function hykSpanWalkway(A,B,o){o=o||{};const col=o.col||hykSpanBone();const col2=hC(hPick(HPAL.shell));const w=o.w||2.4;const L=Math.hypot(B.x-A.x,B.z-A.z)||1;const lv=o.level||'quay';
 const br=hykBridge(A,B,{w,rise:o.rise||0,col,own:o.own||'walkway',branches:o.branches,runners:o.runners});hykSpanDeckTop(br.pts,w);
 const tx=(B.x-A.x)/L,tz=(B.z-A.z)/L;const every=o.every||5;
 for(let s=every*.5;s<L-every*.3;s+=every){const px=A.x+tx*s,pz=A.z+tz*s,py=A.y+(B.y-A.y)*s/L-.78;const g=o.ground?o.ground(px,pz):hykSpanGround(px,pz)-.6;if(py-g<.6)continue;
  const rb=Math.min(.75,.3+(py-g)*.05);hykPut('hkShell',hykLathe({H:py-g,yBase:g,cx:px,cz:pz,rFn:y=>rb+(.26-rb)*Math.pow(y/(py-g),.8),nu:14,nv:Math.max(3,Math.round((py-g)/1.2)),flute:{n:7,amp:.07,sharp:1.3},rings:{n:3,amp:.03},col:col2}));
  hykPut('hkShell',hykFlare([px,g,pz],[0,1,0],rb*.98,rb*.8,{col:col2}));kput('hkBall',[px,py,pz],null,[.4,.36,.4],col);}
 hykSpanMark('door',A.x,A.y,A.z,-tx,-tz,w,2.3,lv);hykSpanMark('door',B.x,B.y,B.z,tx,tz,w,2.3,lv);
 return br;}
// ---------------------------------------------------------------- the pontoon walkway
// Floating shell segments at the wet datum, linked by knuckles: each a squashed superellipsoid float (barnacle grey:
// the poor blocks' link) with a deck plate and edge ribs on top, a rail on posts both sides; between segments two
// knuckled links and a short plate over the gap. A,B at deck level; o.sea (the water's y; default A.y - 1) sets the
// draught. o: segL own col level
function hykSpanPontoon(A,B,o){o=o||{};const col=o.col||hC(hPick(HPAL.barnacle));const bone=hykSpanBone();const dcol=hC(hPick(HPAL.barnacle),.92);const sea=o.sea!=null?o.sea:A.y-1.0;
 const L=Math.hypot(B.x-A.x,B.z-A.z)||1;const tx=(B.x-A.x)/L,tz=(B.z-A.z)/L,rx=-tz,rz=tx;const ry=Math.atan2(tx,tz);const lv=o.level||'wet';
 const segL=o.segL||5.2,gap=.7;const n=Math.max(1,Math.round((L+gap)/(segL+gap)));const sl=(L-(n-1)*gap)/n;const hw=1.25;
 const at=(s,side,dy)=>[A.x+tx*s+rx*(side||0),A.y+(dy||0),A.z+tz*s+rz*(side||0)];
 for(let k=0;k<n;k++){const s0=k*(sl+gap),s1=s0+sl,sm=(s0+s1)/2;const c=at(sm);
  const pod=hykPod({a:hw,b:.66,c:sl/2,e1:.78,e2:.72,cy:sea+.3,nu:30,nv:14,noise:{amp:.025,su:3,sv:2,seed:k+7},col});
  pod.geo.rotateY(ry);pod.geo.translate(c[0],0,c[2]);hykPut('hkBarn',pod.geo);
  hykPut('hkBarn',hykDeck([at(s0+.15,0,.0),at(sm),at(s1-.15,0,.0)],hw*1.9,{col:dcol,camber:.05}));
  for(const sd of [-1,1]){const e=[at(s0+.1,sd*hw*.92,-.04),at(sm,sd*hw*.92,-.04),at(s1-.1,sd*hw*.92,-.04)];hykPut('hkBone',hykTube(e,()=>.11,{seg:6,col:bone}));
   hykSpanRail(e,{col:bone,h:.95,every:1.3});}
  if(k<n-1){const g0=s1,g1=s1+gap;for(const sd of [-.8,.8]){const a=at(g0-.25,sd,-.3),b=at(g1+.25,sd,-.3);const m=[(a[0]+b[0])/2,a[1]+.02,(a[2]+b[2])/2];
    hykPut('hkBone',hykTube([a,m,b],()=>.12,{seg:6,col:bone}));kput('hkBall',a,null,[.22,.2,.22],bone);kput('hkBall',b,null,[.22,.2,.22],bone);kput('hkBall',m,null,[.3,.26,.3],bone);}
   hykPut('hkBone',hykDeck([at(g0-.3,0,-.03),at((g0+g1)/2,0,-.03),at(g1+.3,0,-.03)],hw*1.5,{col:bone}));}}
 ysDeck({x0:Math.min(A.x,B.x)-hw,z0:Math.min(A.z,B.z)-hw,x1:Math.max(A.x,B.x)+hw,z1:Math.max(A.z,B.z)+hw,w:hw*2,y:A.y,kind:'pontoon',own:o.own||'pontoon',a:[A.x,A.y,A.z],b:[B.x,B.y,B.z]});
 hykSpanMark('wetdoor',A.x,A.y,A.z,-tx,-tz,hw*2,2.3,lv);hykSpanMark('wetdoor',B.x,B.y,B.z,tx,tz,hw*2,2.3,lv);
 return {n,sl};}
// ================================================================= the defs: free-standing showcases for the kit sheet
// Two lily pads on stalks along x, the span between them; the rail of each pad opens toward the deck.
function hykSpanEnds(y,X,R,w,o){o=o||{};const gap=2*Math.asin(Math.min(.95,(w/2+.5)/(R*.9)))+.12;
 const pa=hykSpanPad(-X,y,0,R,{rail:{a0:0,gap},own:o.own,col:o.col});const pb=hykSpanPad(X,y,0,R,{rail:{a0:Math.PI,gap},own:o.own,col:o.col});
 return {A:{x:-X+R*.6,y:y+.06,z:0},B:{x:X-R*.6,y:y+.06,z:0},pa,pb};}
function hykSpanDefL1(G,o){reseed(30200+(o.v|0));const E=hykSpanEnds(12,18,3.4,2.6,{own:'span L1'});hykSpanBridgeL1(E.A,E.B,{level:'L1'});hykReg('Rib bridge L1',0,0,23,16);}
HYK.def({key:'hyk_span_l1',name:'Rib bridge L1',family:'spans',row:'Spans',w:44,d:8,h:17,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykSpanDefL1});
function hykSpanDefL2(G,o){reseed(30206+(o.v|0));const E=hykSpanEnds(28,24,3.8,3.0,{own:'span L2'});hykSpanBridgeL2(E.A,E.B,{level:'L2'});hykReg('Rib bridge L2',0,0,29,37);}
HYK.def({key:'hyk_span_l2',name:'Rib bridge L2',family:'spans',row:'Spans',w:56,d:9,h:37,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykSpanDefL2});
function hykSpanDefDraw(G,o){reseed(30212+(o.v|0));const E=hykSpanEnds(12,21,4.4,3.2,{own:'drawbridge'});hykSpanDrawbridge(E.A,E.B,{level:'L1'});hykReg('Drawbridge',0,0,27,24);}
HYK.def({key:'hyk_drawbridge',name:'Drawbridge',family:'spans',row:'Spans',w:52,d:12,h:24,tags:{type:['infrastructure'],wealth:'civic',lit:false},build:hykSpanDefDraw});
// The spiral stair is GROWN: the sheet hangs it on a host (HYK.placeOn, the G frame: origin on the face at the datum,
// +z out). A head pad on a rib in front of the face, the stair down the face (bearing-aware, so it hugs a lobed host)
// to a wet landing on a stalk at +1, with a jar lamp and a skiff berth. Pads are drawn in LOCAL coordinates and the
// landing is recorded on the host by hand (o.landing in 62 double-transforms: see the report).
function hykSpanDefStair(G,o){reseed(30218+(o.v|0));const col=hykSpanBone();const host=o.host;const rs=o.rs;const wet=(o.wet!=null?o.wet:1.0)-o.y;const dir=o.dir||1;
 const toBearing=al=>{const n=hykN(Math.cos(al),0,Math.sin(al));return Math.atan2(n[2],n[0]);};
 const rAt=(yl,al)=>host.rAt(yl+o.y,toBearing(al));
 // the head pad; the first tread lands on its rim: the tread circle (rs+.65 about the host's axis) meets the pad's rim
 const R=2.6,pz=3.0;const rc=rs+.65,dc=rs+pz;const cd=clamp((rc*rc+dc*dc-R*R)/(2*rc*dc),-1,1);const a0=Math.PI/2+dir*Math.acos(cd);
 const first=[rc*Math.cos(a0),-rs+rc*Math.sin(a0)];const ga=Math.atan2(first[1]-pz,first[0]);
 hykPad(0,0,pz,R,{col:hC(hPick(HPAL.shell)),own:host.n,rail:{a0:ga-dir*.45,gap:2.0}});
 const wp=hykW(0,0,pz);host.landings.push({x:wp[0],y:wp[1],z:wp[2],r:R,level:o.level,a:o.a});
 hykPut('hkBone',hykRib([0,-3.4,.1],[0,-.45,pz],{rise:-1.4,r0:.36,r1:.26,knuckles:3,col}));
 hykSpanMark('door',0,0,pz,0,1,2.4,2.3,o.level);
 const st=hykSpanStairSpiral(0,-rs,rAt,-.1,wet+.12,{a0,dir,w:1.1,col});
 // the wet landing: 3 m beyond the stair's foot, on a stalk to the bed, a stub deck from the last tread onto it
 const ro=st.r1+.1+1.1;const wr=ro+3.1;const cs=Math.cos(st.a1),sn=Math.sin(st.a1);const wx=wr*cs,wz=-rs+wr*sn;const yb=hykSpanGround(wx,wz)-.8;
 hykSpanPad(wx,wet,wz,3.3,{own:host.n+' wet landing',ground:yb,rail:{a0:st.a1+Math.PI,gap:1.5},lamp:{a:st.a1+Math.PI/2,cool:true,level:'wet'}});
 const f0=[(st.r1+.1)*cs,wet-.02,-rs+(st.r1+.1)*sn],f1=[(wr-3.3*.8)*cs,wet+.02,-rs+(wr-3.3*.8)*sn];
 hykPut('hkShell',hykDeck([f0,[(f0[0]+f1[0])/2,wet,(f0[2]+f1[2])/2],f1],1.2,{col:hC(hPick(HPAL.shell)),camber:.04}));
 for(const s of [-1,1]){const px=-sn*s*.6,pzz=cs*s*.6;hykPut('hkBone',hykTube([[f0[0]+px,wet-.2,f0[2]+pzz],[f1[0]+px,wet-.2,f1[2]+pzz]],()=>.12,{seg:6,col}));}
 hykSpanMark('wetdoor',wx+2.4*cs,wet,wz+2.4*sn,cs,sn,2.4,2.4,'wet');
 const bw=hykW(wx+4.6*cs,wet,wz+4.6*sn);const hd=hykN(cs,0,sn);BERTHS.push({host:host.n,x:bw[0],z:bw[2],heading:Math.atan2(hd[2],hd[0])+Math.PI/2,kind:'skiff'});
 hykReg('Spiral stair',0,pz,R+1.2,3.5);}
HYK.def({key:'hyk_spiral_stair',name:'Spiral stair',family:'spans',row:'Spans',grown:true,w:7.6,d:7.6,h:4,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykSpanDefStair});
// the ladder: a wet pad in front and below, an L1 pad behind and above, the caged ladder between
function hykSpanDefLadder(G,o){reseed(30224+(o.v|0));const y0=1.0,y1=12.0;
 hykSpanPad(0,y1,-1.2,2.8,{rail:{a0:Math.PI/2,gap:1.2},own:'ladder head'});
 hykSpanPad(0,y0,2.6,2.6,{rail:{a0:Math.PI/2,gap:1.1},own:'ladder foot',lamp:{a:Math.PI,cool:true,level:'wet'}});
 hykSpanLadder(0,2.0,y0,y1,{});
 hykSpanMark('wetdoor',0,y0,4.9,0,1,2.4,2.4,'wet');hykSpanMark('door',0,y1,1.3,0,1,1.0,2.3,'L1');
 hykReg('Bone ladder',0,.8,4.2,13);}
HYK.def({key:'hyk_ladder',name:'Bone ladder',family:'spans',row:'Spans',w:6,d:10,h:14,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykSpanDefLadder});
// the lily pad at the quay datum, a straight flight up to it from the ground in front
function hykSpanDefPad(G,o){reseed(30230+(o.v|0));const R=3.4,y=2.5;
 hykSpanLilypad(0,y,0,R,{rail:{a0:Math.PI/2,gap:.95},level:'quay',own:'lily pad'});
 hykSpanStairStraight({x:0,y:0,z:R*.9+4.6},{x:0,y:y,z:R*.9-.1},{w:1.3,rails:'both'});
 hykSpanMark('door',0,y,R*.9,0,1,1.3,2.3,'quay');
 hykReg('Lily-pad landing',0,1.2,R+1.5,5);}
HYK.def({key:'hyk_lilypad',name:'Lily-pad landing',family:'spans',row:'Spans',w:8,d:16,h:5,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykSpanDefPad});
// the walkway: 40 m at +2.5 on stalks, a flight down to the ground at each end
function hykSpanDefWalk(G,o){reseed(30236+(o.v|0));const y=2.5;
 hykSpanWalkway({x:-20,y,z:0},{x:20,y,z:0},{w:2.4,every:5,level:'quay',own:'walkway'});
 hykSpanStairStraight({x:-25.2,y:0,z:0},{x:-20.3,y,z:0},{w:2.0,rails:'both'});hykSpanStairStraight({x:25.2,y:0,z:0},{x:20.3,y,z:0},{w:2.0,rails:'both'});
 hykReg('Grown walkway',0,0,27,5);}
HYK.def({key:'hyk_walkway',name:'Grown walkway',family:'spans',row:'Spans',w:52,d:5,h:5,tags:{type:['infrastructure'],wealth:'civic',lit:false},build:hykSpanDefWalk});
// the pontoon: 40 m at the wet datum; on the sheet its floats sit in the ground plane as if afloat (sea = -.45)
function hykSpanDefPontoon(G,o){reseed(30242+(o.v|0));hykSpanPontoon({x:-20,y:.55,z:0},{x:20,y:.55,z:0},{sea:-.45,own:'pontoon',level:'wet'});hykReg('Pontoon walkway',0,0,22,3);}
HYK.def({key:'hyk_pontoon',name:'Pontoon walkway',family:'spans',row:'Spans',w:44,d:4,h:3,tags:{type:['infrastructure'],wealth:'poor',lit:false},build:hykSpanDefPontoon});
