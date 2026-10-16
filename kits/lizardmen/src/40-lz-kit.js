// prefix: lz
// ================================================================= THE LIZARDMEN TOOLKIT: what every building is built with
// The rules of form (DESIGN.md section 2): ribs, horns and tusks OUTSIDE the skin, crossing at the ridge and running on past it
// (lzHorn, lzArchRib, lzRibRoof, lzTuskVault); walls that lean wrong, inward on one face and outward on another (lzWall,
// lzBatterRoom); triangular openings only, sized by caste, nested on the shared buildings (lzPortal, lzDoorH); the leiwen,
// a squared spiral, as the built ornament with one flaw a band (lzLeiwen); the round whorl as the carved one and the spiral
// eye of rank (lzEye); twisted courses (lzTwist); glyph bands laid out as spirals (lzGlyphSpiral); stelae in mirrored pairs,
// some turned or wrapped (lzStela); the clapperless bells (lzBellRack). Odd counts everywhere. No iron: bronze.
// Everything draws in the builder's current frame (origin on the ground at the plot centre, +z the front, y up).
const LZ_T=.14;   /* wall thickness */
/* evenly spaced values from a to b, n of them */
function lzSpan(a,b,n){const o=[];for(let i=0;i<n;i++)o.push(n<2?(a+b)/2:a+(b-a)*i/(n-1));return o;}
/* draw fn's geometry outside the cut-away (a porch, a stela, a rib that stays when the house opens) */
function lzNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}
function lzCutFloor(y){CUTC=[CUTC[0],CUTC[1],CUTC[2]+y,CUTC[3]];}
/* a quadratic bezier through a, c (control), b at t (t past 1 runs on along the same curve: a horn past the ridge) */
function lzBez(a,c,b,t){const u=1-t;return [u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1],u*u*a[2]+2*u*t*c[2]+t*t*b[2]];}
/* ---------------------------------------------------------------- horns, tusks and ribs */
/* a horn: a tapered tube rising from (x,y,z), L long, root radius r, sweeping toward +z of a frame turned ry by o.curl
   (0 straight up, 1 a quarter curl), leaning o.lean (radians, toward +z) from the root. o.mk horn | tusk (ivory) | bones | bronze */
function lzHorn(x,y,z,ry,L,r,o){o=o||{};const curl=o.curl===undefined?.6:o.curl,lean=o.lean||0,mk=o.mk||'horn',col=o.col||P(mk==='ivory'?'tusk':mk==='bones'?'bone':mk==='bronze'?'bronze':'horn');
 const a=[0,0,0],c=[0,L*.62*Math.cos(lean),L*.62*Math.sin(lean)],b=[0,L*Math.cos(lean+curl*.9),L*(Math.sin(lean+curl*.9)+curl*.25)];
 W(x,y,z,ry,()=>tube(mk,t=>lzBez(a,c,b,t),t=>{const q=r*(1-.92*t)+.012;return [q,q*(o.flat||1)];},o.nt||10,o.ns||7,col,{caps:true}));}
/* the pointed arch: a cusp at the apex and sides that bulge outward, y = H (1 - (|z| / hz)^0.72), so it is pointed at any
   rise H (never round: a round arch reads as a mudhif). arch(hz, H).at(s, v) is the point at v (0 the foot, 1 the apex) on
   side s; past 1 it runs on straight along the apex tangent: a rib crossing over the ridge as a horn */
function lzArch(hz,H){const at=(s,v)=>{if(v<=1){const u=1-v;return [0,H*(1-Math.pow(u,.72)),s*hz*u];}const a=at(s,1),b=at(s,.94);const k=(v-1)*4;return [0,a[1]+(a[1]-b[1])*k,a[2]+(a[2]-b[2])*k];};return {at};}
/* a pointed-arch rib across z from z0 (at x) to z1, apex at height h: two arcs meeting at a point, each running on past the
   apex by o.past (0..0.5 of its sweep) so the two cross and stick out: the crossed ribs of a ribcage roof. o.r the root
   radius, o.mk horn | bones | ivory | cane | reed (a bundle) */
function lzArchRib(x,z0,z1,h,o){o=o||{};const r=o.r||.12,mk=o.mk||'bones',col=o.col||(mk==='bones'||mk==='ivory'?P('bone'):mk==='horn'?P('horn'):P('reed')),past=o.past===undefined?.18:o.past,zm=(z0+z1)/2,hz=Math.abs(z1-z0)/2;
 const A=lzArch(hz,h);
 for(const s of [1,-1]){tube(mk,t=>{const p=A.at(s,t*(1+past));return [x,p[1],zm+p[2]];},t=>{const q=r*(1-.55*t);return [q,q];},o.nt||12,o.ns||7,col,{caps:true});}}
/* a ribbed roof over a room L (x) by Wd (z): n ribs (odd) as crossed pointed arches outside a skin of mk hung a little below
   them from eaveY up to ridgeY; the skin is a shell (two sheets). o.over the eave's overhang; o.ends closes the gables
   (triangles in o.endMk); o.past how far the ribs run on past the ridge */
function lzRibRoof(L,Wd,eaveY,ridgeY,n,o){o=o||{};const ov=o.over===undefined?.5:o.over,mk=o.mk||'hide',col=o.col||P(mk==='hide'?'hide':mk==='hideP'?'hideP':mk==='reed'||mk==='thatch'?'reed':'reedL'),hz=Wd/2+ov,ex=o.ext===undefined?.4:o.ext;
 const bend=o.bend===undefined?.95:o.bend;
 /* the skin: a pointed vault, its section the rib's curve (a little inside the ribs) */
 const drop=o.drop===undefined?.4:o.drop;eaveY-=drop;const AR=lzArch(hz*.96,ridgeY-.3-eaveY);const sec=(s,v)=>{const p=AR.at(s,v);return [0,eaveY+p[1],p[2]];};
 /* the inner sheet lies a thickness INSIDE the outer along its normal (an offset straight down pokes through on the steep sides) */
 for(const s of [-1,1]){const f=(u,v)=>{const p=sec(s,v);return [-L/2-ex+(L+2*ex)*u,p[1],p[2]];};
  const inner=(u,v)=>{const p=f(u,v),a=sec(s,Math.min(1,v+.02)),b=sec(s,Math.max(0,v-.02));let ny=a[2]-b[2],nz=-(a[1]-b[1]);const n=Math.hypot(ny,nz)||1;ny/=n;nz/=n;if(ny+s*nz<0){ny=-ny;nz=-nz;}return [p[0],p[1]-ny*.09,p[2]-nz*.09];};
  psurf(mk,f,o.nu||8,o.nv||7,col,{flip:s<0});psurf(mk,inner,o.nu||8,o.nv||7,o.underCol||col,{flip:s>0});}
 if(o.ends!==false)for(const s of [-1,1]){const pts=[];for(let k=0;k<=12;k++){const p=sec(1,k/12);pts.push([s*(L/2+ex),p[1],p[2]]);}for(let k=12;k>=0;k--){const p=sec(-1,k/12);pts.push([s*(L/2+ex),p[1],p[2]]);}
  poly(o.endMk||'mat',pts,o.endCol||P('reedL'),true);}
 const xs=lzSpan(-L/2,L/2,n);for(const x of xs)W(0,eaveY,0,0,()=>lzArchRib(x,-hz*1.06,hz*1.06,ridgeY-eaveY+.08,{r:o.ribR||.16,mk:o.ribMk||'bones',past:o.past===undefined?.2:o.past,col:o.ribCol}));
 /* a ridge pole along the crossing, lashed */
 beam(o.ribMk||'bones',[-L/2-ex,ridgeY+.02,0],[L/2+ex,ridgeY+.02,0],.09,o.ribCol||P('boneO'),true,7);
 for(const x of xs)ring('rope',x,ridgeY+.02,0,.16,.03,P('reedD'),0,0,PI/2,10);}
/* a tusk vault over a room L by Wd: pairs of great tusks (odd count) rising from both sides, curling over the ridge and
   crossing (the warriors' lodge, the owner's tusk-hall references), a hide skin hung between on cords */
function lzTuskVault(L,Wd,h,n,o){o=o||{};const hz=Wd/2,xs=lzSpan(-L/2,L/2,n),r=o.r||.3;
 for(const x of xs)for(const s of [-1,1])lzHorn(x,0,s*hz,s>0?PI:0,h*1.15,r,{curl:.78,lean:.12,mk:o.mk||'ivory',nt:12,ns:9});
 /* the skin: a catenary sheet between the eave line and a ridge line under the crossing */
 const eY=o.eaveY||1.2,rY=h*.86,mk=o.skinMk||'hide',col=o.skinCol||P('hide');
 for(const s of [-1,1]){const f=(u,v)=>{const x=-L/2+L*u,sag=.35*Math.sin(PI*v);return [x,eY+(rY-eY)*v-sag*(1-v)*.6,s*(hz*.92*(1-v)+.0)+(s*.0)];};
  psurf(mk,f,o.nu||10,o.nv||6,col,{flip:s<0});psurf(mk,(u,v)=>{const p=f(u,v);return [p[0],p[1]-.04,p[2]*.99];},o.nu||10,o.nv||6,col,{flip:s>0});}
 beam('bones',[-L/2-.3,rY,0],[L/2+.3,rY,0],.12,P('boneO'),true,7);
 /* a low battered stone wall under the eave on both sides */
 if(o.wall!==false)for(const s of [-1,1])lzWall(s>0?[-L/2,hz*.98]:[L/2,-hz*.98],s>0?[L/2,hz*.98]:[-L/2,-hz*.98],s>0?[-L/2,hz*.98-.12]:[L/2,-hz*.98+.12],s>0?[L/2,hz*.98-.12]:[-L/2,-hz*.98+.12],o.y0||0,eY-.05,o.wallMk||'cyclo',o.wallCol||P('basalt'),[],{});}
/* ---------------------------------------------------------------- walls that lean wrong */
/* one wall face from bottom edge B0->B1 ([x,z]) to top edge T0->T1 at height y0..y0+h (a battered face when T differs from B),
   facing out to the left of B0->B1 seen from above with +y up... (front: B0 west, B1 east). opens: [{s, w, h, door}] with s
   the distance along the bottom edge from B0; every opening is a TRIANGLE (apex up). Two sheets: the face and, LZ_T behind
   it, the inside (o.inner false: none). A door() is declared per door, facing out. o.mk, o.col */
function lzWall(B0,B1,T0,T1,y0,h,mk,col,opens,o){o=o||{};const L=Math.hypot(B1[0]-B0[0],B1[1]-B0[1]);if(L<.05)return;
 const nx=(B1[1]-B0[1])/L,nz=-(B1[0]-B0[0])/L;   /* the outward normal (x,z) */
 const at=(u,v,off)=>{const bx=lerp(B0[0],B1[0],u),bz=lerp(B0[1],B1[1],u),tx=lerp(T0[0],T1[0],u),tz=lerp(T0[1],T1[1],u);return [lerp(bx,tx,v)+nx*off,y0+h*v,lerp(bz,tz,v)+nz*off];};
 const sheet=(u0,u1,ybot)=>{if(u1-u0<1e-3)return;const f=off=>(u,v)=>{const uu=u0+(u1-u0)*u,yb=ybot?ybot(uu):0,vv=yb/h+(1-yb/h)*v;return at(uu,vv,off);};
  const nv=ybot?3:2,nu=ybot?6:Math.max(1,Math.round((u1-u0)*L/2));psurf(mk,f(0),nu,nv,col,{});if(o.inner!==false)psurf(mk,f(-LZ_T),nu,nv,o.innerCol||col,{flip:true});};
 const ops=(opens||[]).slice().sort((a,b)=>a.s-b.s);let u=0;
 for(const q of ops){const ua=(q.s-q.w/2)/L,ub=(q.s+q.w/2)/L,uc=q.s/L;sheet(u,ua);
  /* over the triangle: the bottom edge rises to the apex and falls again */
  sheet(ua,ub,uu=>q.h*(1-Math.abs(uu-uc)/(ub-uc)));
  /* the reveal: two slabs along the slanted sides */
  for(const [ux,uy] of [[ua,ub],[ub,ua]]){const p0=at(ux,0,0),p1=at(uy>ux?uc:uc,q.h/h,0),p2=at(ux,0,-LZ_T);plane4(mk,p0,p1,p2,.02,o.revealCol||col);}
  if(q.door){const p=at(uc,0,-LZ_T/2);door(p[0],p[1],p[2],Math.atan2(nx,nz),q.w);}
  u=ub;}
 sheet(u,1);}
/* a room of four leaning walls: w (x) by d (z) at the ground, y0 up h. o.lean {front, back, left, right}: metres the top
   edge moves IN per metre of height (negative leans out). opens per side as lzWall's. Returns the top corners. o.mkf(side),
   o.colf(side). The DESIGN's rule: at least one face leans in and one out (the defaults do). */
function lzBatterRoom(w,d,y0,h,mk,col,o){o=o||{};const Ln=Object.assign({front:.08,back:-.05,left:.1,right:-.03},o.lean||{});
 const B={fl:[-w/2,d/2],fr:[w/2,d/2],br:[w/2,-d/2],bl:[-w/2,-d/2]};
 const xl=-w/2+Ln.left*h,xr=w/2-Ln.right*h,zf=d/2-Ln.front*h,zb=-d/2+Ln.back*h;const T={fl:[xl,zf],fr:[xr,zf],br:[xr,zb],bl:[xl,zb]};
 const S=[['front',B.fl,B.fr,T.fl,T.fr],['right',B.fr,B.br,T.fr,T.br],['back',B.br,B.bl,T.br,T.bl],['left',B.bl,B.fl,T.bl,T.fl]];
 for(const [side,b0,b1,t0,t1] of S){if(o.skip&&o.skip.includes(side))continue;lzWall(b0,b1,t0,t1,y0,h,o.mkf?o.mkf(side):mk,o.colf?o.colf(side):col,o[side],o);}
 return {T,B,xl,xr,zf,zb};}
/* a flat roof slab on the top corners of a battered room, th thick, over the edge by ov */
function lzSlab(T,y,th,mk,col,ov){ov=ov||0;const pts=[[T.fl[0]-ov,T.fl[1]+ov],[T.fr[0]+ov,T.fr[1]+ov],[T.br[0]+ov,T.br[1]-ov],[T.bl[0]-ov,T.bl[1]-ov]];prism(mk,pts,y,y+th,col);}
/* ---------------------------------------------------------------- openings: triangles, sized by caste, nested on shared buildings */
/* the door of caste c, as an lzWall opening at s along the wall: a triangle doorH(c) high, 0.62 of that wide at the floor */
function lzDoor(c,s){const h=lzDoorH(c);return {s,w:+(h*.62).toFixed(2),h,door:true};}
/* a slit vent for caste c (no window at a human's eye height: the vents sit high, under the eave) */
function lzVent(c,s,y){const h=lzDoorH(c)*.3;return {s,w:h*.5,h,y};}
/* nested portal frames on a wall face: triangles sharing the floor line, from H down by 1/1.25 to 1.2 m (DESIGN.md 3): each
   frame two jambs in o.mk (lacq | bronze | ivory), each a step deeper (-z of the frame turned ry at (x,y,z)); the inmost is
   the real opening (declare it with lzDoor on the wall). o.eye puts a spiral eye at the outer apex */
function lzPortal(x,y,z,ry,H,o){o=o||{};const mk=o.mk||'lacq',col=o.col||(mk==='bronze'?P('bronze'):mk==='ivory'?P('tusk'):P('lacq')),step=o.step||.14;let h=H,i=0;
 W(x,y,z,ry,()=>{while(h>=1.15&&i<7){const w=h*.62,zz=-i*step,t=.1+.03*(6-i);
   for(const s of [-1,1])beam(mk,[s*w/2,0,zz],[s*0,h,zz],t,col,false,undefined,t*1.4);
   box(mk,0,-.02,zz,w+.3,.12,t*1.5,col);   /* the raised threshold */
   h/=LZ_RATIO;i++;}
  if(o.eye)lzEye(0,H+.45,-.02,0,.32,{mk:'bronze'});});}
/* ---------------------------------------------------------------- the ornament */
/* a leiwen panel: w by h, its face +z at z = 0 from y = 0 up, cells of o.cell (m): each cell a squared spiral in raised strokes
   of o.mk (bronze | lacq | lacqR | ivory | basalt) on a backing of o.back (false: none). Chirality: the left half winds one way, the
   right the other (mirrored pairs). The FLAW: one seeded cell lacks one stroke. o.eye: a spiral eye at the panel's centre */
function lzLeiwen(w,h,o){o=o||{};const c=o.cell||.5,nx=Math.max(1,Math.floor(w/c)),ny=Math.max(1,Math.floor(h/c)),mk=o.mk||'bronze',col=o.col||(mk==='bronze'?P('verd'):mk==='ivory'?P('bone'):mk==='basalt'?P('basaltC'):P('oxblood'));
 const t=o.t||.045,pr=o.proud||.03,W0=-nx*c/2,H0=(h-ny*c)/2;const z0=o.back!==false?.06:0;if(o.back!==false)box(o.back||'lacq',0,0,.03,w,h,.06,o.backCol||P('lacq'));
 const flaw=Math.floor(rr(0,nx*ny));let k=0;
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++,k++){const cx=W0+(i+.5)*c,cy=H0+(j+.5)*c,chir=(o.chir!==undefined?o.chir:(i<nx/2?1:-1))*((j%2)?-1:1);
  if(o.eye&&i===(nx>>1)&&j===(ny>>1)){lzEye(cx,cy,z0+pr,0,c*.42,{mk});continue;}
  /* the spiral: a polyline from the outer corner winding in, 7 strokes, the gap g */
  const g=c*.2;let x=-c*.4*chir,y=-c*.4,dir=0,len=c*.8;const strokes=[];
  for(let n=0;n<7;n++){const dx=[1,0,-1,0][dir]*chir,dz=[0,1,0,-1][dir];const x1=x+dx*len,y1=y+dz*len;strokes.push([x,y,x1,y1]);x=x1;y=y1;dir=(dir+1)%4;if(n%2===1)len-=g;if(len<g*.9)break;}
  strokes.forEach((s,n)=>{if(k===flaw&&n===3)return;const mx=cx+(s[0]+s[2])/2,my=cy+(s[1]+s[3])/2,L=Math.hypot(s[2]-s[0],s[3]-s[1])+t;
   if(Math.abs(s[2]-s[0])>1e-6)box(mk,mx,my-t/2,z0+pr/2,L,t,pr,col);else box(mk,mx,my-L/2,z0+pr/2,t,L,pr,col);});}}
/* a spiral eye: a disc facing +z (turned ry at x,y,z), radius R, a raised whorl winding in to a dark pupil. The high castes'
   mark: the more important the building, the more eyes. o.mk bronze | ivory | basalt; o.glow a lit pupil (the seer's hall) */
function lzEye(x,y,z,ry,R,o){o=o||{};const mk=o.mk||'bronze',col=o.col||(mk==='bronze'?P('verd'):mk==='ivory'?P('bone'):P('basaltC')),th=R*.14;
 W(x,y,z,ry,()=>{WX(0,0,0,0,PI/2,0,()=>cyl(mk==='bronze'?'bronzeC':mk,0,-th,0,R,th,mk==='bronze'?P('bronze'):col,18));   /* the disc, from z = -th to 0 */
  /* the whorl and the pupil on BOTH faces, so the eye reads from behind too (the back winds the other way) */
  for(const f of [1,-1]){const zf=f>0?0:-th;tube(mk,t=>{const a=t*TAU*2.3*f,r=R*.14+R*.78*(1-t);return [Math.cos(a)*r,Math.sin(a)*r,zf+f*(.02+.01*t)];},t=>[R*.07,R*.07],22,5,col,{caps:true});
   sph(o.glow?'glow':'plain',0,0,zf+f*.04,R*.2,o.glow?P('glowC'):P('eye'),.6,10);}
  if(o.glow)haloAt(0,0,.1,0x7adacf);});}
/* a glyph band whose strokes follow a squared spiral path winding in from the outer corner (it reads inward and outward):
   small strokes in o.mk on the face +z, w by h from y = 0. The strokes are seeded from the five base glyphs' stroke shapes.
   o.turns the spiral's turns (3); o.mirror winds the other way (the mirrored stela of a pair) */
function lzGlyphSpiral(w,h,o){o=o||{};const mk=o.mk||'bronze',col=o.col||(mk==='bronze'?P('verd'):mk==='ivory'?P('bone'):P('basaltC')),chir=o.mirror?-1:1,turns=o.turns||3,t=o.t||.03,pr=.02;
 let x=-w/2*.9*chir,y=h*.05,dir=0;let lx=w*.9,ly=h*.9;const g=Math.min(lx,ly)/(turns*2+1);if(!(g>.01)){reportErr('lzGlyphSpiral: a band too small to write on ('+w+' x '+h+')');return;}
 for(let n=0;n<turns*4;n++){const horiz=dir%2===0,len=horiz?lx:ly;const dx=horiz?[1,0,-1,0][dir]*chir:0,dz=horiz?0:[0,1,0,-1][dir];
  const steps=Math.max(1,Math.floor(len/(g*.9)));
  for(let k=0;k<steps;k++){const u=(k+.5)/steps,gx=x+dx*len*u,gy=y+dz*len*u,gl=pick([0,1,2,3,4]);
   /* a glyph: serpent (a zigzag), memory (two bars), node (a cross), the Coil (a hook), the fracture (a bar with a break) */
   const s=g*.36;W(gx,gy,pr/2,0,()=>{if(gl===0){box(mk,-s*.3,-s*.4,0,t,s*.5,pr,col);box(mk,s*.3,s*.1,0,t,s*.5,pr,col);box(mk,0,-.0,0,s*.6,t,pr,col);}
    else if(gl===1){box(mk,0,-s*.3,0,s*.7,t,pr,col);box(mk,0,s*.2,0,s*.7,t,pr,col);}
    else if(gl===2){box(mk,0,-s*.4,0,t,s*.8,pr,col);box(mk,0,-t/2,0,s*.8,t,pr,col);}
    else if(gl===3){box(mk,0,-s*.4,0,t,s*.8,pr,col);box(mk,s*.2,s*.37,0,s*.45,t,pr,col);box(mk,s*.4,s*.1,0,t,s*.3,pr,col);}
    else{box(mk,-s*.25,-t/2,0,s*.3,t,pr,col);box(mk,s*.3,-t/2,0,s*.2,t,pr,col);box(mk,0,-s*.4,0,t,s*.3,pr,col);}});}
  x+=dx*len;y+=dz*len;dir=(dir+1)%4;if(horiz)lx-=g;else ly-=g;if(lx<g||ly<g)break;}}
/* a stela: a tapering slab h tall (w at the foot) with a glyph spiral on both faces, the back face mirrored (the Coil
   forward and back), turned ry at (x,z). o.turned lays it face to the ground; o.wrapped binds it in reed matting (the
   texts whose meaning changed: DESIGN.md 2.4); o.mk stone; o.pair draws its mirrored twin at o.pair metres along x */
function lzStela(x,z,ry,h,w,o){o=o||{};const mk=o.mk||'basalt',col=o.col||P('basalt'),th=w*.38;
 const one=(mir)=>{if(o.turned){WX(0,th/2+.02,0,0,-PI/2,0,()=>body(mir));for(const s of [-1,1])box('basalt',s*w*.3,0,0,.3,th/2,.5,P('basaltD'));return;}body(mir);};
 const body=(mir)=>{const B0=[-w/2,th/2],B1=[w/2,th/2],T0=[-w*.33,th*.3],T1=[w*.33,th*.3];
  lzWall(B0,B1,T0,T1,0,h,mk,col,[],{inner:false});lzWall([w/2,-th/2],[-w/2,-th/2],[w*.33,-th*.3],[-w*.33,-th*.3],0,h,mk,col,[],{inner:false});
  lzWall(B1,[w/2,-th/2],T1,[w*.33,-th*.3],0,h,mk,col,[],{inner:false});lzWall([-w/2,-th/2],B0,[-w*.33,-th*.3],T0,0,h,mk,col,[],{inner:false});
  box(mk,0,h-.02,0,w*.66,.12,th*.6,col);box(mk,0,0,0,w,.1,th,col);   /* a solid cap and foot: the slab is never seen through */
  if(o.wrapped){withCloth(clothHang(.6,.03),()=>{for(const s of [-1,1])psurf('mat',(u,v)=>[(-w/2-.06+(w+.12)*u)*(1-.3*v),h*.12+h*.8*v,s*(th/2+.05)*(1-.35*v)],4,4,P('reedL'),{flip:s<0});});
   for(const y of [h*.3,h*.6,h*.85])ring('rope',0,y,0,w*.5*(1-.3*(y/h)),.025,P('reedD'),0,0,0,12);}
  else{/* the bands lie ON the faces, which lean back as the slab tapers: the frame tilts with the face */
   const rx=-Math.atan2(th*.2,h),zf=th/2-th*.2*.08+.006;WX(0,h*.08,zf,0,rx,0,()=>lzGlyphSpiral(w*.6,h*.84,{mk:o.glyphMk||'bronze',mirror:mir,turns:3}));WX(0,h*.08,-zf,PI,rx,0,()=>lzGlyphSpiral(w*.6,h*.84,{mk:o.glyphMk||'bronze',mirror:!mir,turns:3}));}
  if(o.eye)lzEye(0,h+.4,0,0,w*.3,{mk:'bronze'});};
 W(x,0,z,ry,()=>{one(false);if(o.pair)W(o.pair,0,0,0,()=>one(true));});}
/* a twisted stack: n courses of boxes from w0 at the foot to w1 at the top, each turned `twist` past the one below (the obelisks,
   the Interpreters' house). o.mk, o.col; o.each(i, y, w, ry) draws per course */
function lzTwist(x,z,h,n,w0,w1,twist,o){o=o||{};const mk=o.mk||'basalt',col=o.col||P('basalt'),ch=h/n;
 W(x,0,z,o.ry||0,()=>{for(let i=0;i<n;i++){const t=i/(n-1||1),w=lerp(w0,w1,t),ry=i*twist;box(mk,0,i*ch,0,w,ch+.01,w*(o.aspect||1),col,ry);if(o.each)o.each(i,i*ch,w,ry);}});}
/* a standing stone of the circle: a leaning slab with a whorl cut on its face */
function lzMenhir(x,z,h,w,o){o=o||{};W(x,0,z,o.ry||0,()=>{WX(0,0,0,0,0,o.lean||rr(-.08,.08),()=>{lzWall([-w/2,w*.2],[w/2,w*.2],[-w*.3,w*.12],[w*.3,w*.12],0,h,'basalt',P('basalt'),[],{inner:false});
  lzWall([w/2,-w*.2],[-w/2,-w*.2],[w*.3,-w*.12],[-w*.3,-w*.12],0,h,'basalt',P('basalt'),[],{inner:false});lzWall([w/2,w*.2],[w/2,-w*.2],[w*.3,w*.12],[w*.3,-w*.12],0,h,'basalt',P('basalt'),[],{inner:false});
  lzWall([-w/2,-w*.2],[-w/2,w*.2],[-w*.3,-w*.12],[-w*.3,w*.12],0,h,'basalt',P('basalt'),[],{inner:false});box('basalt',0,h-.02,0,w*.6,.1,w*.24,P('basalt'));
  if(o.eye)lzEye(0,h*.6,w*.2+.01,0,w*.22,{mk:'basalt'});});});}
/* a bell rack: a lashed bone frame with n bronze bells (after the bianzhong) and no clappers: silence made visible */
function lzBellRack(x,z,ry,L,h,n){W(x,0,z,ry,()=>{for(const s of [-1,1]){lzHorn(s*L/2,0,0,s>0?PI/2:-PI/2,h*1.1,.13,{curl:.3,mk:'bones'});}
 beam('bones',[-L/2,h,0],[L/2,h,0],.08,P('boneO'),true,7);
 for(const bx of lzSpan(-L/2+.4,L/2-.4,n)){const bh=.42+.1*Math.abs(bx)/L;beam('rope',[bx,h,0],[bx,h-.2,0],.02,P('reedD'),true,5);
  lathe('bronzeC',bx,0,[[.02,h-.2],[.14,h-.26],[.19,h-.2-bh*.75],[.21,h-.2-bh],[.0,h-.2-bh]],12,P('bronze'),{});
  W(bx,h-.2-bh*.55,.215,0,()=>lzLeiwen(.3,.22,{cell:.11,mk:'bronze',back:false,t:.012,proud:.012}));}});}
/* the raised threshold and the stone footing every door has */
function lzThreshold(x,z,ry,w){W(x,0,z,ry,()=>box('stoneP',0,0,.1,w+.4,.18,.5,P('basaltD')));}
/* a pool of dust: the ground round a monument, trodden */
function lzDust(x,z,R){cyl('earthR',x,.005,z,R,.02,P('earthP'),16);}
