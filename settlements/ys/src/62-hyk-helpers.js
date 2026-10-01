// ================================================================= HYKKOUSOI — the building frame, openings, rooms, lights, stairs
// HYK.place() builds one registered building in a LOCAL frame (origin at the plot centre on the ground, +z the front,
// y up), the way the Iziz vernacular does: the group carries position, yaw and scale; the shell kit moves merged
// geometry to world space at the put and kput goes through the group transform. Everything a later pass reads is
// recorded here in WORLD space through 60-ys-registries.js: MARKS (every opening and light), ROOMS and SPOTS
// (DESIGN §7), and the inspector volumes with the project tags.
const HYK_PLACED=[];
HYK.place=function(scene,key,x,z,ry,o){const D=HYK.defs[key];if(!D){reportErr('HYK.place: no such key '+key);return null;}
 o=Object.assign({v:0,y:0,scale:1},o||{});const G=new THREE.Group();G.position.set(x,o.y,z);G.rotation.y=ry||0;if(o.scale!==1)G.scale.setScalar(o.scale);scene.add(G);G.updateMatrix();
 KOFF=[0,0,0];useGroupXF(G);if(o.scale!==1)KXF.s=o.scale;
 const id=HYK_PLACED.length;const rec={key,x,z,ry:ry||0,o,id,name:D.name};HYK_PLACED.push(rec);
 HYK.cur={D,G,x,z,ry:ry||0,o,r0:REG.length,id,key,name:D.name};
 try{D.build(G,o);}catch(e){reportErr(key+' '+e.stack);}
 endGroupXF();HYK.cur=null;return G;};
// local -> world for a point and for a direction (the same rotation as loc(), 69c)
function hykW(lx,ly,lz){const c=HYK.cur;if(!c)return [lx,ly,lz];const s=c.o.scale||1;const p=loc(c.x,c.z,lx*s,lz*s,c.ry);return [p[0],(c.o.y||0)+ly*s,p[1]];}
function hykN(nx,ny,nz){const c=HYK.cur;if(!c)return [nx,ny,nz];const ry=c.ry;return [nx*Math.cos(ry)+nz*Math.sin(ry),ny,-nx*Math.sin(ry)+nz*Math.cos(ry)];}
// the inspector volume (project rule: name, class, tags), in the local frame
function hykReg(name,lx,lz,r,h,tags){const c=HYK.cur;const s=c?(c.o.scale||1):1;const p=c?loc(c.x,c.z,lx*s,lz*s,c.ry):[lx,lz];
 const R={name,x:p[0],y:c?(c.o.y||0):0,z:p[1],r:r*s,h:h*s,cls:'building',key:c?c.key:null,id:REG.length,bld:c?c.id:null,tags:Object.assign({culture:'hykkousoi'},c?c.D.tags:{},tags||{})};REG.push(R);return R;}
// ---------------------------------------------------------------- openings: a hole in a shell gets a lip and a reveal, and is recorded
// op = {p:[x,y,z], n:[nx,ny,nz], r, ky} on a shell in the current frame (from hykPod / hykLatheAt / a conch aperture).
// o:{kind:'door'|'wetdoor'|'window', level, room, lit, nacre, depth, open (a window with no pane), lipCol}
function hykOpening(op,o){o=o||{};const r=op.r,ky=op.ky||1;const n=new THREE.Vector3(op.n[0],op.n[1],op.n[2]).normalize();const P=new THREE.Vector3(op.p[0],op.p[1],op.p[2]);
 const q=qFacing([n.x,n.y,n.z]);const lc=o.lipCol||hC(hPick(o.nacre?HPAL.nacre:HPAL.shell));
 kput(o.nacre?'hkLipN':'hkLip',[P.x+n.x*.05,P.y+n.y*.05,P.z+n.z*.05],q,[r*1.04,r*1.04*ky,r*1.5],lc);
 const depth=o.depth||Math.max(.45,r*.45);const qy=new THREE.Quaternion().setFromUnitVectors(_UP,n);
 kput('hkReveal',[P.x-n.x*depth*.45,P.y-n.y*depth*.45,P.z-n.z*depth*.45],qy,[r*.985,depth,r*.985*ky],null);
 const kind=o.kind||'window';
 if(kind==='window'&&!o.open)kput('hkDisc',[P.x-n.x*depth*.9,P.y-n.y*depth*.9,P.z-n.z*depth*.9],q,[r*.97,r*.97*ky,1],o.lit?hC(0xffe2b8):null);
 const w=hykW(P.x,P.y,P.z),wn=hykN(n.x,n.y,n.z);const c=HYK.cur;
 const m={bld:c?c.id:null,key:c?c.key:null,name:c?c.name:(o.name||null),kind,x:w[0],y:w[1],z:w[2],nx:wn[0],nz:wn[2],w:r*2,h:r*2*ky,level:o.level||'ground',room:o.room!=null?o.room:null,lit:!!o.lit,into:o.into||null};
 if(kind==='door'||kind==='wetdoor'){m.step=[w[0]+wn[0]*1.0,w[2]+wn[2]*1.0];m.thresh=[w[0]-wn[0]*1.0,w[2]-wn[2]*1.0];
  kput('hkTread',[P.x+n.x*.25,P.y-r*ky+.07,P.z+n.z*.25],qEuler(0,Math.atan2(n.x,n.z),0),[r*2.1,.14,1.2],hC(hPick(HPAL.bone)));}
 ysMark(m);return m;}
function hykDoor(op,o){return hykOpening(op,Object.assign({kind:'door'},o||{}));}
function hykWin(op,o){return hykOpening(op,Object.assign({kind:'window'},o||{}));}
// a lamp: a glow-pearl in a shell cup (warm) or a bioluminescent jar (cool); recorded as a light mark
function hykLight(lx,ly,lz,o){o=o||{};const cool=!!o.cool;const r=o.r||.22;
 kput(cool?'hkPearlC':'hkPearl',[lx,ly,lz],null,r,cool?hC(0x9ff4e4):hC(0xffe2b0));
 if(!o.bare)kput('hkBall',[lx,ly-r*.7,lz],null,[r*1.6,r*.9,r*1.6],hC(hPick(o.nacre?HPAL.nacre:HPAL.shell)));
 const w=hykW(lx,ly,lz);const c=HYK.cur;
 return ysMark({bld:c?c.id:null,key:c?c.key:null,name:c?c.name:null,kind:'light',x:w[0],y:w[1],z:w[2],nx:0,nz:0,w:r*2,h:r*2,level:o.level||'ground',warm:!cool,lightKind:o.kind||(cool?'jar':'pearl')});}
// ---------------------------------------------------------------- rooms and the spots the later placer fills (kits/interiors/SPEC.md)
// poly in the local frame, y the floor, h the clear height; o:{doors:[[lx,lz,w,to]], residence, wealth}
function hykRoom(kind,poly,y,h,o){o=o||{};const c=HYK.cur;const wp=poly.map(p=>{const w=hykW(p[0],0,p[1]);return [w[0],w[2]];});
 const R={building:c?c.name:(o.building||null),bld:c?c.id:null,key:c?c.key:null,kind,poly:wp,y:(c?(c.o.y||0):0)+y,h,
  doors:(o.doors||[]).map(d=>{const w=hykW(d[0],0,d[1]);return {at:[w[0],w[2]],w:d[2]||1.1,to:d[3]||'street'};}),windows:o.windows||[],
  culture:'hykkousoi',wealth:o.wealth!=null?o.wealth:.5,residence:!!o.residence};return ysRoom(R);}
function hykSpot(room,kind,lx,lz,ry,w,d){const c=HYK.cur;const p=hykW(lx,0,lz);return ysSpot({room:room.id,bld:c?c.id:null,kind,x:p[0],z:p[2],ry:(c?c.ry:0)+(ry||0),w,d});}
// a circular room polygon (n points) about a local centre
function hykCirclePoly(cx,cz,r,n){const P=[];n=n||14;for(let i=0;i<n;i++){const a=i/n*TAU;P.push([cx+r*Math.cos(a),cz+r*Math.sin(a)]);}return P;}
// the floor plate of a room: a chord disc at y, into the interior bucket
function hykFloor(cx,cz,y,R,o){o=o||{};return hykPut('hkFloor',hykDisc(cx,y,cz,R,{col:o.col||hC(hPick(HPAL.floor)),lobes:o.lobes,nu:o.nu||28}),true);}
// ---------------------------------------------------------------- landings, stairs, ladders (world frame unless inside a building)
// a lily-pad landing: a lobed disc with a domed underside, on a stalk down to the ground if o.stalk
function hykPad(x,y,z,R,o){o=o||{};const col=o.col||hC(hPick(HPAL.shell));const mk=o.mat||'hkShell';
 hykPut(mk,hykDisc(x,y,z,R,{col,lobes:{n:o.lobes||9,amp:.08}}));hykPut(mk,hykDisc(x,y-.3,z,R*.97,{col,sag:-R*.22,down:true,lobes:{n:o.lobes||9,amp:.08}}));
 kput('hkLip',[x,y+.02,z],qEuler(Math.PI/2,0,0),[R*1.0,R*1.0,.9],col);
 if(o.stalk){const yb=o.stalk===true?terrainH(x,z)-1:o.stalk;kput('hkPost',[x,(yb+y)/2,z],null,[R*.14,y-yb,R*.14],col);}
 // a rail round the rim on posts, open over `gap` radians centred on `a0` (the approach), for a perch people stand on
 if(o.rail){const rr=R*.9,a0=o.rail.a0||0,gap=o.rail.gap||0;const n=Math.max(12,Math.round((TAU-gap)*rr/1.2));const bc=o.rail.col||hC(hPick(HPAL.bone));const pts=[];
  for(let i=0;i<=n;i++){const a=a0+gap/2+(TAU-gap)*i/n;pts.push([x+rr*Math.cos(a),y+1.15,z+rr*Math.sin(a)]);}
  hykPut('hkBone',hykTube(pts,()=>.07,{seg:6,col:bc}));for(let i=0;i<=n;i+=2){const p=pts[i];kput('hkPost',[p[0],y+.58,p[2]],null,[.06,1.15,.06],bc);}}
 ysDeck({x0:x-R,z0:z-R,x1:x+R,z1:z+R,w:R*2,y,kind:'pad',own:o.own||null});return {x,y,z,r:R};}
// a spiral stair hugging a round host from y0 down to y1: treads on the face, a rail tube on the outer edge
function hykStairSpiral(cx,cz,rAt,y0,y1,o){o=o||{};const w=o.w||1.1,rise=.19,run=.64,dir=o.dir||1;const col=o.col||hC(hPick(HPAL.bone));const rail=[];
 let a=o.a0||0,y=y0;const nst=Math.max(1,Math.round((y0-y1)/rise));
 for(let i=0;i<=nst;i++){const r=rAt(y)+.1+w/2;kput('hkTread',[cx+r*Math.cos(a),y-.06,cz+r*Math.sin(a)],qEuler(0,-a,0),[w,.12,run*1.08],col);
  const ro=rAt(y)+.1+w;rail.push([cx+ro*Math.cos(a),y+.95,cz+ro*Math.sin(a)]);
  if(i%7===0)kput('hkPost',[cx+ro*Math.cos(a),y+.45,cz+ro*Math.sin(a)],null,[.05,.95,.05],col);
  a+=dir*run/(rAt(y)+.1+w/2);y-=rise;}
 if(rail.length>2)hykPut('hkBone',hykTube(rail,()=>.07,{seg:6,col}));
 return {a1:a,y1:y+rise};}
// a rib bridge: an arched deck between two landings with two bone ribs under its edges and lip rails
function hykBridge(A,B,o){o=o||{};const w=o.w||2.6;const col=o.col||hC(hPick(HPAL.bone));const dcol=o.deckCol||hC(hPick(HPAL.shell));
 const lerpPoly=(P,t)=>{const i=Math.max(0,Math.min(1,t))*(P.length-1);const k=Math.min(P.length-2,Math.floor(i)),f=i-k;const a=P[k],b=P[k+1];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];};
 const mkPts=(P0,P1,rise)=>{const L=Math.hypot(P1.x-P0.x,P1.z-P0.z)||1;const n=Math.max(8,Math.round(L/4));const pts=[];
  for(let i=0;i<=n;i++){const t=i/n;pts.push([P0.x+(P1.x-P0.x)*t,P0.y+(P1.y-P0.y)*t+rise*4*t*(1-t),P0.z+(P1.z-P0.z)*t]);}return {pts,L,n};};
 // one run of deck: the plates, a spine under the centre line with a knuckle every 2.6 m, vertebrae across it every
 // other sample, a knuckled rib along each edge with the rail on posts. A span is a backbone, not a plank. The rail
 // opens where a branch leaves (o2.gaps, with a knuckle at each end) and a branch's rail starts on its parent's rail
 // line (o2.railStart), so railings meet instead of crossing.
 const run=(P0,P1,w,rise,own,kind,o2)=>{o2=o2||{};const M=o2.pre||mkPts(P0,P1,rise);const pts=M.pts,L=M.L,n=M.n;
  hykPut('hkShell',hykDeck(pts,w,{col:dcol,camber:.08,shear0:o2.shear0}));hykPut('hkShell',hykDeck(pts.map(p=>[p[0],p[1]-.5,p[2]]),w*.92,{col:dcol,flip:false,shear0:o2.shear0}));
  const tx=(P1.x-P0.x)/L,tz=(P1.z-P0.z)/L;const rx=-tz,rz=tx;
  hykPut('hkBone',hykTube(pts.map(p=>[p[0],p[1]-.78,p[2]]),t=>.3*(1+.3*Math.max(0,Math.cos(t*L/2.6*TAU))),{seg:9,col}));
  for(let i=2;i<n;i+=2){const p=pts[i];hykPut('hkBone',hykRib([p[0]-rx*w*.52,p[1]-.5,p[2]-rz*w*.52],[p[0]+rx*w*.52,p[1]-.5,p[2]+rz*w*.52],{rise:-.45,r0:.17,r1:.14,n:8,seg:6,col}));}
  const rails={};
  for(const s of [-1,1]){const edge=pts.map(p=>[p[0]+rx*s*w*.46,p[1]-.3,p[2]+rz*s*w*.46]);
   if(o2.shear0){const sh=o2.shear0(s>0?1:0);edge[0]=[edge[0][0]+tx*sh,edge[0][1],edge[0][2]+tz*sh];}   // the curb starts on the mitre
   hykPut('hkBone',hykTube(edge,(t)=>.32*(1+.18*Math.max(0,Math.cos(t*TAU*4)))-.08*Math.sin(t*Math.PI),{seg:8,col}));
   const rail=edge.map(p=>[p[0],p[1]+1.25,p[2]]);if(o2.railStart&&o2.railStart[s])rail[0]=o2.railStart[s];rails[s]=rail;
   const gaps=(o2.gaps||[]).filter(g=>g.side===s).sort((a,b)=>a.s0-b.s0);const inGap=sa=>gaps.some(g=>sa>=g.s0&&sa<=g.s1);
   let seg=[];const flush=()=>{if(seg.length>1)hykPut('hkBone',hykTube(seg,()=>.07,{seg:6,col}));seg=[];};
   let gi=0;for(let i=0;i<=n;i++){const sa=i/n*L;
    while(gi<gaps.length&&gaps[gi].s1<sa){seg.push(lerpPoly(rail,gaps[gi].s0/L));flush();seg.push(lerpPoly(rail,gaps[gi].s1/L));gi++;}
    if(inGap(sa))continue;seg.push(rail[i]);}
   while(gi<gaps.length){seg.push(lerpPoly(rail,gaps[gi].s0/L));flush();seg.push(lerpPoly(rail,gaps[gi].s1/L));gi++;}flush();
   for(const g of gaps)for(const sg of [g.s0,g.s1]){const q=lerpPoly(rail,sg/L);kput('hkBall',q,null,[.2,.18,.2],col);}
   for(let i=0;i<=n;i+=2){if(inGap(i/n*L))continue;const p=edge[i];kput('hkPost',[p[0],p[1]+.62,p[2]],null,[.06,1.25,.06],col);}}
  ysDeck({x0:Math.min(P0.x,P1.x)-w,z0:Math.min(P0.z,P1.z)-w,x1:Math.max(P0.x,P1.x)+w,z1:Math.max(P0.z,P1.z)+w,w,y:Math.max(P0.y,P1.y)+rise,kind:kind||'bridge',own:own||null,a:[P0.x,P0.y,P0.z],b:[P1.x,P1.y,P1.z]});
  return {pts,L,rx,rz,rails};};
 const rise=o.rise!=null?o.rise:Math.min(9,Math.hypot(B.x-A.x,B.z-A.z)*.07);
 const pre=mkPts(A,B,rise);const pts=pre.pts,L=pre.L;const at=t=>lerpPoly(pts,t);
 const tx0=(B.x-A.x)/L,tz0=(B.z-A.z)/L;const rx0=-tz0,rz0=tx0;
 // branches: a narrower run forking off the span at t toward a point (a perch, a landing). The parent's rail opens
 // over the branch's width and the branch's rails begin at the opening's ends, with a knuckle under the fork.
 // A branch's start is MITRED: its two corners slide along its own direction until they lie on the parent's edge line,
 // one cut back and one extended by the same amount, so neither curb clips the parent deck nor stops short of it;
 // the parent's rail opens exactly between those corners.
 const brs=(o.branches||[]).map(br=>{const p=at(br.t);const side=Math.sign((br.to.x-p[0])*rx0+(br.to.z-p[2])*rz0)||1;const bw=br.w||w*.62;
  const P0={x:p[0]+rx0*side*w*.5,y:p[1]-.06,z:p[2]+rz0*side*w*.5};const dx=br.to.x-P0.x,dz=br.to.z-P0.z;const dl=Math.hypot(dx,dz)||1;const ux=dx/dl,uz=dz/dl;const rbx=-uz,rbz=ux;
  const mpx=-tz0,mpz=tx0;const ratio=(rbx*mpx+rbz*mpz)/((ux*mpx+uz*mpz)||1e-6);   // along-branch slide per unit of sideways offset
  const sm=-(bw/2)*ratio;const shear0=v=>sm*(2*v-1);
  const ks=[-1,1].map(sg=>{const sx=P0.x+rbx*sg*bw/2+ux*sm*sg,sz=P0.z+rbz*sg*bw/2+uz*sm*sg;return (sx-p[0])*tx0+(sz-p[2])*tz0;});
  return {br,p,side,bw,P0,ux,uz,rbx,rbz,shear0,s0:br.t*L+Math.min(ks[0],ks[1])-.15,s1:br.t*L+Math.max(ks[0],ks[1])+.15};});
 const main=run(A,B,w,rise,o.own,'bridge',{pre,gaps:brs.map(b=>({side:b.side,s0:b.s0,s1:b.s1}))});
 let nb=0;for(const b of brs){const P0=b.P0,to=b.br.to;const rbx=b.rbx,rbz=b.rbz;
  const E0=lerpPoly(main.rails[b.side],b.s0/L),E1=lerpPoly(main.rails[b.side],b.s1/L);const e0Right=(E0[0]-P0.x)*rbx+(E0[2]-P0.z)*rbz>0;
  run(P0,to,b.bw,b.br.rise!=null?b.br.rise:0,b.br.own||((o.own||'bridge')+' branch'),'bridge',{railStart:{1:e0Right?E0:E1,[-1]:e0Right?E1:E0},shear0:b.shear0});
  // the crotch: the branch's spine grows out of the parent's spine under the deck, through a knuckle, not a blob
  const sp=[b.p[0],b.p[1]-.78,b.p[2]],bs=[P0.x,P0.y-.78,P0.z];const mid=[(sp[0]+bs[0])/2,sp[1]-.12,(sp[2]+bs[2])/2];
  hykPut('hkBone',hykTube([sp,mid,bs,[bs[0]+b.ux*1.6,bs[1],bs[2]+b.uz*1.6]],t=>.3*(1-.2*t),{seg:9,col}));kput('hkBall',sp,null,[.42,.38,.42],col);nb++;}
 // runners: tendrils grown from the edge rib to the nearest member (a strut, a leg, a head) within reach, every so
 // many metres, one per side, sagging, knuckled, rooted on the member with a flare. One per member per stretch of span.
 let nr=0;if(o.runners&&o.runners.members&&o.runners.members.length){const Rn=o.runners;const reach=Rn.reach||12,every=Rn.every||6;const used=[];
  for(let s=every*.5;s<L-every*.5;s+=every){const p=at(s/L);const best={};
   for(const m of Rn.members){const nq=hykSegNearest(m,p);const q=nq.q;const d=Math.hypot(q[0]-p[0],q[1]-p[1],q[2]-p[2]);if(d>=reach)continue;
    const sd=Math.sign((q[0]-p[0])*rx0+(q[2]-p[2])*rz0)||1;if(!best[sd]||d<best[sd].d)best[sd]={m,q,n:nq.n,d};}
   for(const sd of [-1,1]){const b=best[sd];if(!b)continue;if(used.some(u=>u.m===b.m&&Math.hypot(u.q[0]-b.q[0],u.q[1]-b.q[1],u.q[2]-b.q[2])<every*1.5))continue;used.push(b);nr++;
    const a=[p[0]+rx0*sd*w*.46,p[1]-.3,p[2]+rz0*sd*w*.46];   // on the edge rib's centre line: the runner grows out of the rib
    const q=b.q,n=b.n;const dx=q[0]-a[0],dy=q[1]-a[1],dz=q[2]-a[2];const dl=Math.hypot(dx,dy,dz)||1;
    // a cubic from the rib to a point 1.1 m off the face, arriving along the normal, then straight in through the
    // face: the flare on the face is centred on the rib. A landing on a top face takes no sag.
    const h=[q[0]+n[0]*1.1,q[1]+n[1]*1.1,q[2]+n[2]*1.1];const pull=Math.min(2.2,dl*.3),sag=n[1]>.7?0:Math.min(2.5,dl*.18);
    const c1=[a[0]+(h[0]-a[0])*.4,a[1]+(h[1]-a[1])*.4-sag,a[2]+(h[2]-a[2])*.4],c2=[h[0]+n[0]*pull,h[1]+n[1]*pull,h[2]+n[2]*pull];const pts=[];
    for(let i=0;i<=14;i++){const t=i/14,u=1-t;const w0=u*u*u,w1=3*u*u*t,w2=3*u*t*t,w3=t*t*t;pts.push([w0*a[0]+w1*c1[0]+w2*c2[0]+w3*h[0],w0*a[1]+w1*c1[1]+w2*c2[1]+w3*h[1],w0*a[2]+w1*c1[2]+w2*c2[2]+w3*h[2]]);}
    pts.push([q[0]+n[0]*.3,q[1]+n[1]*.3,q[2]+n[2]*.3],[q[0]-n[0]*.5,q[1]-n[1]*.5,q[2]-n[2]*.5]);
    const kn=Math.max(2,Math.round(dl/2.2));hykPut('hkBone',hykTube(pts,t=>(.26-.09*t)*(1+.2*Math.max(0,Math.cos(t*kn*TAU))),{seg:10,col}));
    hykPut('hkBone',hykFlare([q[0]-n[0]*.3,q[1]-n[1]*.3,q[2]-n[2]*.3],n,.3,.7,{col}));   // set .3 m into the face: the rim is buried, the rib roots
    kput('hkBall',[a[0],a[1],a[2]],null,[.46,.4,.46],col);}}}
 return {pts,runners:nr,branches:nb};}
// the nearest point on a member's surface and the surface normal there. A member is a capsule {a,b,r} (a strut, a
// leg) or a box {c,u,v,w,he} (a strut head): centre, three unit axes, half-extents. A runner ends half a metre
// inside the member and its flare lies on the member's face with that normal, so the join is a join.
function hykSegNearest(m,p){
 if(m.c){const d=[p[0]-m.c[0],p[1]-m.c[1],p[2]-m.c[2]];const ax=[m.u,m.v,m.w];const l=ax.map(a=>d[0]*a[0]+d[1]*a[1]+d[2]*a[2]);
  // a box is landed on a FACE, never an edge or a corner: of the faces that face p, the nearest point inside the
  // face's rectangle shrunk by the flare's radius, so the flare lies flat on that face
  const mg=m.margin!=null?m.margin:1.1;let best=null;
  for(let i=0;i<3;i++)for(const sg of [1,-1]){if(sg*l[i]<=m.he[i])continue;const n=ax[i].map(x=>x*sg);
   const c=[0,1,2].map(j=>j===i?sg*m.he[i]:Math.max(-Math.max(0,m.he[j]-mg),Math.min(Math.max(0,m.he[j]-mg),l[j])));
   const q=[m.c[0]+c[0]*m.u[0]+c[1]*m.v[0]+c[2]*m.w[0],m.c[1]+c[0]*m.u[1]+c[1]*m.v[1]+c[2]*m.w[1],m.c[2]+c[0]*m.u[2]+c[1]*m.v[2]+c[2]*m.w[2]];
   // a top face wins by 3 m when p is above it: a runner grabs a strut head from above, where the head shows
   const dist=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])-(n[1]>.7&&p[1]>q[1]?3:0);if(!best||dist<best.d)best={q,n,d:dist};}
  if(best)return {q:best.q,n:best.n};
  // p inside the box: out through the nearest face
  let k=0,bg=1e9;for(let i=0;i<3;i++){const gap=m.he[i]-Math.abs(l[i]);if(gap<bg){bg=gap;k=i;}}const sg=Math.sign(l[k]||1);const c=l.slice();c[k]=sg*m.he[k];
  return {q:[m.c[0]+c[0]*m.u[0]+c[1]*m.v[0]+c[2]*m.w[0],m.c[1]+c[0]*m.u[1]+c[1]*m.v[1]+c[2]*m.w[1],m.c[2]+c[0]*m.u[2]+c[1]*m.v[2]+c[2]*m.w[2]],n:ax[k].map(x=>x*sg)};}
 const ax=m.a[0],ay=m.a[1],az=m.a[2];const bx=m.b[0]-ax,by=m.b[1]-ay,bz=m.b[2]-az;const L2=bx*bx+by*by+bz*bz||1;
 let t=((p[0]-ax)*bx+(p[1]-ay)*by+(p[2]-az)*bz)/L2;t=Math.max(0,Math.min(1,t));const r=m.r||0;const o=[ax+bx*t,ay+by*t,az+bz*t];
 const dx=p[0]-o[0],dy=p[1]-o[1],dz=p[2]-o[2];const d=Math.hypot(dx,dy,dz)||1;const n=[dx/d,dy/d,dz/d];
 return {q:[o[0]+n[0]*r,o[1]+n[1]*r,o[2]+n[2]*r],n};}
