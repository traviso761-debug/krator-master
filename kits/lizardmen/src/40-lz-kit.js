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
/* the ornament sheets' two takes: a building draws the A or the B take of each by a hash of its seed and place (36-def.js sets
   GABLE_ALT; 30-geo.js emit swaps the key): the vendored table takes the Lizardmen's pairs here */
GABLE_ALT_K.leiwenS='leiwenS2';GABLE_ALT_K.leiwenS2='leiwenS';GABLE_ALT_K.glyphS='glyphS2';GABLE_ALT_K.glyphS2='glyphS';
/* a sheet is in the pack: the panel, band or eye is drawn from it; otherwise as geometry */
const LZ_SHEET=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
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
/* roofs and gables take the solid key of a cloth set: single-sided, so the sun casts no acne on them */
const LZ_SOLID={mat:'matW',hide:'hideW',hidePW:'hidePW',hideP:'hidePW'};function lzSolid(k){return LZ_SOLID[k]||k;}
let LZ_LAST_ROOM=null;
function lzRibRoof(L,Wd,eaveY,ridgeY,n,o){o=o||{};const ov=o.over===undefined?.5:o.over,mk=lzSolid(o.mk||'hide'),col=o.col||P(mk==='hide'||mk==='hideW'?'hide':mk==='hideP'||mk==='hidePW'?'hideP':mk==='reed'||mk==='thatch'?'reed':'reedL'),hz=Wd/2+ov,ex=o.ext===undefined?.4:o.ext;
 const rm=LZ_LAST_ROOM;LZ_LAST_ROOM=null;
 const drop=o.drop===undefined?.4:o.drop;eaveY-=drop;
 /* tall portals under low eaves automatically vault a pointed cross-gable dormer so the roof never cuts across the doorway inside */
 const dorms=o.dormers===false||o.ends===false?[]:(o.dormers||(rm&&Math.abs(rm.w-L)<.06&&Math.abs(rm.d-Wd)<.06?rm.doors:[])).filter(d=>d.topY>eaveY+.06);
 const AR=lzArch(hz*.96,ridgeY-.3-eaveY);
 const dLift=(s,x,v,baseY)=>{let y=baseY;for(const d of dorms){if(d.side!==s)continue;const hw=d.w*.72+.4,tx=1-Math.abs(x-d.x)/hw;if(tx<=0)continue;
   const arch=1-Math.pow(1-tx,.76),yd=Math.min(ridgeY-.22,eaveY+(d.topY+.16-eaveY)*arch+.16*v);
   y=Math.max(y,v>.8?lerp(Math.max(baseY,yd),baseY,(v-.8)/.2):yd);}return y;};
 const sec=(s,v)=>{const p=AR.at(s,v);return [0,eaveY+p[1],p[2]];};
 const nu=dorms.length?Math.max(o.nu||8,Math.min(46,Math.round((L+2*ex)/.42))):o.nu||8,nv=o.nv||7;
 /* the inner sheet lies a thickness INSIDE the outer along its normal (an offset straight down pokes through on the steep sides) */
 for(const s of [-1,1]){const f=(u,v)=>{const x=-L/2-ex+(L+2*ex)*u,p=sec(s,v);return [x,dLift(s,x,v,p[1]),p[2]];};
  const inner=(u,v)=>{const p=f(u,v),a=f(u,Math.min(1,v+.02)),b=f(u,Math.max(0,v-.02));let ny=a[2]-b[2],nz=-(a[1]-b[1]);const m=Math.hypot(ny,nz)||1;ny/=m;nz/=m;if(ny+s*nz<0){ny=-ny;nz=-nz;}return [p[0],p[1]-ny*.09,p[2]-nz*.09];};
  /* continuous UVs (x along, the arc up): the per-column arc-length UVs alias into stripes at a distance */
  const La=Math.hypot(hz,ridgeY-eaveY)*1.15,uvf=(u,v)=>[(L+2*ex)*u,v*La];
  psurf(mk,f,nu,nv,col,{flip:s<0,uvf});psurf(mk,inner,nu,nv,o.underCol||col,{flip:s>0,uvf});}
 /* the end gables stand on the walls' ends, 3 cm proud, and LEAN WITH THEM (o.leanEnds {left, right}: metres in per metre of
    height, lzBatterRoom's convention; o.y0 the wall base): a vertical gable parts from a leaning wall near the top */
 const LE=o.leanEnds||{},wy0=o.y0||0,gxAt=(s,y)=>s*(L/2+.03-((s<0?LE.left:LE.right)||0)*(y-wy0));
 if(o.ends!==false)for(const s of [-1,1]){const pts=[];for(let k=0;k<=12;k++){const p=sec(1,k/12);pts.push([gxAt(s,p[1]),p[1],p[2]]);}for(let k=12;k>=0;k--){const p=sec(-1,k/12);pts.push([gxAt(s,p[1]),p[1],p[2]]);}
  poly(lzSolid(o.endMk||'mat'),pts,o.endCol||P('reedL'),true);}
 const rmk=o.ribMk||'bones',rcol=o.ribCol||(rmk==='bones'||rmk==='ivory'?P('bone'):rmk==='horn'?P('horn'):rmk==='bronzeC'?P('verd'):P('reed')),rr0=o.ribR||.16,past=o.past===undefined?.2:o.past;
 const xs=lzSpan(-L/2,L/2,n),Arib=lzArch(hz*1.06,ridgeY-eaveY+.08);
 for(const x of xs)for(const s of [1,-1]){
  const hit=dorms.find(d=>d.side===s&&Math.abs(x-d.x)<d.w*.58);
  if(hit){/* fork over the portal dormer instead of planting a rib foot dead-centre in front of the doorway */
   const v0=clamp((hit.topY+.18-eaveY)/Math.max(.4,ridgeY-eaveY),0,.78);
   tube(rmk,t=>{const v=v0+(1+past-v0)*t,p=Arib.at(s,v);return [x,eaveY+p[1],p[2]];},t=>{const q=rr0*(1-.5*t);return [q,q];},9,7,rcol,{caps:true});
  }else{
   tube(rmk,t=>{const p=Arib.at(s,t*(1+past));return [x,eaveY+p[1],p[2]];},t=>{const q=rr0*(1-.55*t);return [q,q];},12,7,rcol,{caps:true});
  }}
 /* crossed exoskeleton arch-ribs framing each portal dormer's mouth */
 for(const d of dorms){const hw=d.w*.72+.4,dhR=Math.min(ridgeY-.18,d.topY+.22)-eaveY,AD=lzArch(hw,dhR),zf=d.side*hz*.97;
  for(const ks of [-1,1])tube(rmk,t=>{const p=AD.at(ks,t*1.16);return [d.x+p[2],eaveY+p[1],zf-d.side*.06*t];},t=>{const q=rr0*.78*(1-.48*t);return [q,q];},10,6,rcol,{caps:true});}
 /* a ridge pole along the crossing, lashed */
 beam(rmk,[-L/2-ex,ridgeY+.02,0],[L/2+ex,ridgeY+.02,0],.09,o.ribCol||P('boneO'),true,7);
 for(const x of xs)ring('rope',x,ridgeY+.02,0,.16,.03,P('reedD'),0,0,PI/2,10);}
/* a tusk vault over a room L (x) by Wd (z): pairs of great tusks (odd count) rising from both sides, curling over the ridge
   and crossing (the warriors' lodge, the owner's tusk-hall references), a hide skin hung between them on cords, low battered
   stone walls under its eaves, and stone gables at both ends cut from the SAME section so nothing gaps. o.doors: the +x
   gable's doors [{z, c}] (caste-sized triangles, real openings); o.eyes [[z, y]] spiral eyes on that gable; o.y0 the floor */
function lzTuskVault(L,Wd,h,n,o){o=o||{};const hz=Wd/2,xs=lzSpan(-L/2,L/2,n),r=o.r||.3,y0=o.y0||0;
 for(const x of xs)for(const s of [-1,1])lzHorn(x,y0,s*hz,s>0?PI:0,h*1.15,r,{curl:.78,lean:.12,mk:o.mk||'ivory',col:o.tuskCol,nt:12,ns:9});
 const eY=o.eaveY||1.2,rY=h*.86,mk=lzSolid(o.skinMk||'hide'),col=o.skinCol||P('hide'),hz2=hz*.98;
 const sag=v=>.35*Math.sin(PI*v)*(1-v)*.6,topY=v=>eY+(rY-eY)*v-sag(v);
 for(const s of [-1,1]){const f=(u,v)=>[-L/2+L*u,topY(v),s*hz2*(1-v)];
  const inner=(u,v)=>{const p=f(u,v),a=f(u,Math.min(1,v+.02)),b=f(u,Math.max(0,v-.02));let ny=a[2]-b[2],nz=-(a[1]-b[1]);const m=Math.hypot(ny,nz)||1;ny/=m;nz/=m;if(ny+s*nz<0){ny=-ny;nz=-nz;}return [p[0],p[1]-ny*.07,p[2]-nz*.07];};
  const uvf=(u,v)=>[L*u,v*Math.hypot(hz2,rY-eY)];
  psurf(mk,f,o.nu||10,o.nv||6,col,{flip:s<0,uvf});psurf(mk,inner,o.nu||10,o.nv||6,col,{flip:s>0,uvf});
  /* the low wall under the eave: its top tucked under the skin */
  lzWall(s>0?[-L/2,hz2]:[L/2,-hz2],s>0?[L/2,hz2]:[-L/2,-hz2],s>0?[-L/2,hz2-.1]:[L/2,-hz2+.1],s>0?[L/2,hz2-.1]:[-L/2,-hz2+.1],y0,eY+.08-y0,o.wallMk||'cyclo',o.wallCol||P('basalt'),[],{});}
 beam('bones',[-L/2-.3,rY,0],[L/2+.3,rY,0],.12,P('boneO'),true,7);
 /* the gables: one sheet each, its top the skin's section, its bottom the floor except where a door triangle rises */
 const gmk=o.wallMk||'cyclo',gcol=o.wallCol||P('basalt');
 for(const s of [-1,1]){const gx=s*(L/2+.12),doors=s>0?(o.doors||[]):[];
  const yb=u=>{const z=hz2-2*hz2*u;let y=y0;for(const d of doors){const dh=lzDoorH(d.c),dw=dh*LZ_DW,t=1-Math.abs(z-d.z)/(dw/2);if(t>0)y=Math.max(y,y0+dh*t);}return y;};
  const yt=u=>Math.max(yb(u)+.28,topY(1-Math.abs(1-2*u)));
  const g=off=>(u,v)=>{const z=hz2-2*hz2*u,b=yb(u),t=yt(u);return [gx+off,lerp(b,t,v),z];};
  psurf(gmk,g(0),56,4,gcol,{flip:s<0});psurf(gmk,g(-s*.3),56,4,gcol,{flip:s>0});
  for(const d of doors){const dh=lzDoorH(d.c),dw=dh*LZ_DW,yaw=s>0?PI/2:-PI/2;
   for(const k of [-1,1]){const p0=[gx,y0,d.z+k*dw/2],p1=[gx,y0+dh,d.z],p2=[gx-s*.3,y0,d.z+k*dw/2];plane4(gmk,p0,p1,p2,.02,gcol);}
   door(gx-s*.12,y0,d.z,yaw,dw);
   lzLeaf(gx-s*.02,y0,d.z,yaw,dw,dh,{mk:d.c>=5?'lacqR':'lacq'});
   lzNoCut(()=>{lzPortal(gx+s*.02,y0,d.z,yaw,dh,{mk:d.c>=6?'bronze':'lacqR',shared:d.c>=6});
    W(gx+s*.24,0,d.z,yaw,()=>box('basalt',0,y0-.14,.08,dw+.48,.18,.48,P('basaltD')));});}
  if(s>0)for(const [ez,ey] of o.eyes||[])lzNoCut(()=>lzEye(gx+.02,ey,ez,PI/2,.45,{mk:'bronze'}));}}
/* a domed cell: a lathe of `prof` ([[r, y], ...] from the foot up) with an INNER shell, and real triangular doorways
   cut through both: o.door (one, facing +z of a frame turned o.ry) or o.doors [{dh, ry}] (several, ry the way each faces,
   0 = +z). The lathe is drawn in the arcs between the doors' wedges; a patch closes each wedge above its door; reveal
   strips join the two shells along the slanted edges. o.mk, o.col */
function lzDome(x,z,prof,o){o=o||{};const mk=o.mk||'earth',col=o.col||P('earth'),seg=o.seg||16,r0=prof[0][0],top=prof[prof.length-1][1];
 const R=y=>{for(let i=1;i<prof.length;i++)if(y<=prof[i][1]){const a=prof[i-1],b=prof[i],t=(y-a[1])/Math.max(1e-6,b[1]-a[1]);return lerp(a[0],b[0],t);}return 0;};
 /* a door is a STRAIGHT-EDGED triangle in metres (dw at the floor, the apex at dh), whatever the shell's bulge: its half-angle at
    height y is asin(w(y) / 2 / R(y)); the sector it needs is the widest of those (near the floor) */
 const doors=(o.doors||(o.door?[{dh:o.door,ry:0}]:[])).map(d=>{const dh=Math.min(d.dh,top*.74),dw=Math.min(dh*LZ_DW,r0*1.42),ha=y=>Math.asin(Math.min(.92,dw/2*(1-y/dh)/Math.max(.05,R(y))));
  let aw=0;for(let y=0;y<dh;y+=dh/12)aw=Math.max(aw,ha(y));
  /* the edge's height at a half-angle da (bisection on y: the edge is where ha(y) = da) */
  const yAt=da=>{if(da>=aw)return 0;let lo=0,hi=dh;for(let n=0;n<18;n++){const m=(lo+hi)/2;if(ha(m)>da)lo=m;else hi=m;}return (lo+hi)/2;};
  return {dh,dw,ha,aw,yAt,ry:d.ry||0,ac:PI/2-(d.ry||0),leaf:d.leaf!==false};}).sort((a,b)=>a.ac-b.ac);
 const S=(sc,ysc)=>(a,y)=>{const r=R(y)*sc;return [Math.cos(a)*r,y*ysc,Math.sin(a)*r];};
 const nv=Math.max(6,prof.length*2);
 const panel=(a0,a1,yb,sc,ysc,inward)=>{const f=(u,v)=>{const a=a0+(a1-a0)*u,b=yb(a),y=lerp(b,top,v);return S(sc,ysc)(a,y);};
  const n=Math.max(2,Math.round(seg*Math.abs(a1-a0)/TAU)*2);
  const pm=f(.5,.5),pa=f(.52,.5),pb=f(.5,.52),du=[pa[0]-pm[0],pa[1]-pm[1],pa[2]-pm[2]],dv=[pb[0]-pm[0],pb[1]-pm[1],pb[2]-pm[2]];
  const nx=du[1]*dv[2]-du[2]*dv[1],nz=du[0]*dv[1]-du[1]*dv[0];const out=pm[0]*nx+pm[2]*nz;
  psurf(mk,f,n,nv,col,{flip:inward?out>0:out<0});};
 W(x,0,z,o.ry||0,()=>{if(!doors.length){for(const [sc,ysc,inw] of [[1,1,false],[.88,.97,true]])panel(0,TAU,()=>0,sc,ysc,inw);return;}
  for(const [sc,ysc,inw] of [[1,1,false],[.88,.97,true]]){
   for(let i=0;i<doors.length;i++){const a=doors[i],b=doors[(i+1)%doors.length];const a0=a.ac+a.aw,a1=b.ac-b.aw+(i===doors.length-1?TAU:0);if(a1>a0+1e-4)panel(a0,a1,()=>0,sc,ysc,inw);}
   for(const d of doors)panel(d.ac-d.aw,d.ac+d.aw,a=>d.yAt(Math.abs(a-d.ac)),sc,ysc,inw);}
  /* the reveals along each door's straight slanted edges, between the two shells */
  for(const d of doors){for(const kk of [-1,1])psurf(mk,(u,v)=>{const y=d.dh*u,a=d.ac+kk*d.ha(y),rr0=R(y)*lerp(.88,1,v);return [Math.cos(a)*rr0,y*lerp(.97,1,v),Math.sin(a)*rr0];},6,2,col,{flip:kk<0});
   W(0,0,0,d.ry,()=>{door(0,0,r0*.96,0,d.dw);if(d.leaf)lzLeaf(0,0,r0*.985,0,d.dw,d.dh);});}});}
/* an eye on a dome's slope: at height y on the +z face of a dome of profile prof, the disc laid on the surface (tilted to its slope) */
function lzDomeEye(prof,y,R,o){const Rf=yy=>{for(let i=1;i<prof.length;i++)if(yy<=prof[i][1]){const a=prof[i-1],b=prof[i],t=(yy-a[1])/Math.max(1e-6,b[1]-a[1]);return lerp(a[0],b[0],t);}return 0;};
 const r=Rf(y),dr=Rf(y+.05)-Rf(y-.05),slope=Math.atan2(-dr,.1);   /* the surface leans back by `slope` above the vertical */
 WX(0,y,r+.01,0,-slope,0,()=>lzEye(0,0,0,0,R,o));}
/* a passage between two domed cells: a short tube of mk from p to q ([x, z]), dh high and dw wide, open at both ends */
function lzPassage(p,q,dh,dw,mk,col){/* p, q: [x, z, r] with r each dome's foot radius: a TRIANGULAR tunnel the section of the doors (dw at the
 floor, dh at the apex), from between one dome's two shells to between the other's, so its slopes meet the doors' slanted edges */
 const dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,a=[p[0]+ux*p[2]*.9,p[1]+uz*p[2]*.9],b=[q[0]-ux*q[2]*.9,q[1]-uz*q[2]*.9];
 if(Math.hypot(b[0]-a[0],b[1]-a[1])<.2)return;const sx=-uz,sz=ux;   /* sideways */
 for(const k of [-1,1]){const f=(u,v)=>{const x=lerp(a[0],b[0],u),z=lerp(a[1],b[1],u);return [x+k*sx*dw/2*(1-v),dh*v,z+k*sz*dw/2*(1-v)];};
  psurf(mk,f,2,2,col,{});psurf(mk,f,2,2,col,{flip:true});}}
/* ---------------------------------------------------------------- walls that lean wrong */
/* multi-course doorway helper for hollow twisted towers (lk-watchtower, lk-tower): slices a full dh x dw triangular doorway cleanly
   across course i (height ch), emitting an open-top trapezoidal cut on lower courses and the upper triangular apex on the top course */
function lzCourseDoor(c,s,i,ch){const dh=lzDoorH(c),dw=+(dh*LZ_DW).toFixed(2),y0=i*ch,y1=(i+1)*ch;
 if(y0>=dh-.02)return null;
 const w0=dw*(1-y0/dh);
 if(dh<=y1+.02)return {s,w:w0,h:dh-y0,openOnly:true,courseClip:true};
 const w1=dw*(1-y1/dh);
 return {s,w:w0,wTop:w1,h:ch+.02,fullW:dw,fullH:dh,door:i===0,openOnly:i>0,courseClip:true};}
/* one wall face from bottom edge B0->B1 ([x,z]) to top edge T0->T1 at height y0..y0+h (a battered face when T differs from B),
   facing out to the left of B0->B1 seen from above with +y up... (front: B0 west, B1 east). opens: [{s, w, h, door, openOnly}]
   with s the distance along the bottom edge from B0; every opening is a TRIANGLE (apex up). When a doorway is taller than h,
   the wall automatically rises in a pointed gable hood over the portal so neither outer nor inner sheet ever folds downward. */
function lzWall(B0,B1,T0,T1,y0,h,mk,col,opens,o){o=o||{};const L=Math.hypot(B1[0]-B0[0],B1[1]-B0[1]);if(L<.05)return;
 const nx=-(B1[1]-B0[1])/L,nz=(B1[0]-B0[0])/L;   /* the outward normal (x,z): the front wall runs west to east and faces +z */
 const atY=(u,yL,off)=>{const vb=Math.min(1.12,yL/Math.max(.05,h)),bx=lerp(B0[0],B1[0],u),bz=lerp(B0[1],B1[1],u),tx=lerp(T0[0],T1[0],u),tz=lerp(T0[1],T1[1],u);
  return [lerp(bx,tx,vb)+nx*off,y0+yL,lerp(bz,tz,vb)+nz*off];};
 const ops=(opens||[]).filter(q=>q&&(q.door||q.openOnly)).sort((a,b)=>a.s-b.s);
 const yTop=uu=>{let yt=h;for(const q of ops){if(q.courseClip||q.h+.28<=h)continue;const uc=q.s/L,hw=(q.w*.72+.36)/L,t=1-Math.abs(uu-uc)/hw;if(t>0)yt=Math.max(yt,h+(q.h+.34-h)*t);}return yt;};
 const sheet=(u0,u1,ybot,nuMin)=>{if(u1-u0<1e-3)return;
  const f=off=>(u,v)=>{const uu=u0+(u1-u0)*u,yb=ybot?ybot(uu):0,yt=Math.max(yb+.04,yTop(uu));return atY(uu,lerp(yb,yt,v),off);};
  const uvf=(u,v)=>{const uu=u0+(u1-u0)*u,yb=ybot?ybot(uu):0,yt=Math.max(yb+.04,yTop(uu));return [uu*L,lerp(yb,yt,v)];};
  const nv=ybot?3:2,nu=Math.max(nuMin||1,ybot?6:Math.max(1,Math.round((u1-u0)*L/1.6)));
  psurf(mk,f(0),nu,nv,col,{uvf});if(o.inner!==false)psurf(mk,f(-LZ_T),nu,nv,o.innerCol||col,{flip:true,uvf});};
 /* a vent (an opening with a sill y) is not cut: the room card (core/door: the room's dim back, not a dark void) set a little
    proud of the face, high under the eave */
 for(const q of (opens||[]).filter(q=>q&&!q.door&&!q.openOnly)){const uc=q.s/L,yv=q.y||h*.6;
  const p0=atY(uc-q.w/2/L,yv,.03),p1=atY(uc+q.w/2/L,yv,.03),p2=atY(uc,Math.min(h,yv+q.h),.03);svPanePoly([p0,p1,p2],{glass:false,depth:0});}
 let u=0;
 for(const q of ops){const ua=clamp((q.s-q.w/2)/L,0,1),ub=clamp((q.s+q.w/2)/L,0,1),uc=q.s/L;
  const hwG=!q.courseClip&&q.h+.28>h?(q.w*.72+.36)/L:0,uaG=hwG?Math.max(u,uc-hwG):ua;
  if(uaG>u+1e-3)sheet(u,uaG);
  if(ua>uaG+1e-3)sheet(uaG,ua,null,3);
  if(q.wTop!==undefined){/* open-top trapezoidal lower course of a multi-course tower doorway */
   const uai=clamp((q.s-q.wTop/2)/L,ua,uc),ubi=clamp((q.s+q.wTop/2)/L,uc,ub);
   if(uai>ua+1e-4)sheet(ua,uai,uu=>q.h*(uu-ua)/(uai-ua),3);
   if(ub>ubi+1e-4)sheet(ubi,ub,uu=>q.h*(ub-uu)/(ub-ubi),3);
   for(const [ux0,ux1] of [[ua,uai],[ub,ubi]]){const p0=atY(ux0,0,0),p1=atY(ux1,q.h,0),p2=atY(ux0,0,-LZ_T);plane4(mk,p0,p1,p2,.02,o.revealCol||col);}
  }else{
   /* over the triangle: the bottom edge rises to the apex and falls again, while yTop rises in a pointed gable if q.h > h */
   sheet(ua,uc,uu=>q.h*(1-(uc-uu)/Math.max(1e-5,uc-ua)),4);
   sheet(uc,ub,uu=>q.h*(1-(uu-uc)/Math.max(1e-5,ub-uc)),4);
   for(const ux of [ua,ub]){const p0=atY(ux,0,0),p1=atY(uc,q.h,0),p2=atY(ux,0,-LZ_T);plane4(mk,p0,p1,p2,.02,o.revealCol||col);}
  }
  if(q.door){const dw=q.fullW||q.w,dh=q.fullH||q.h,p=atY(uc,0,-LZ_T/2),pf=atY(uc,0,-.015),yaw=Math.atan2(nx,nz);
   door(p[0],p[1],p[2],yaw,dw);lzLeaf(pf[0],pf[1],pf[2],yaw,dw,dh,{mk:dh>=3.4?'lacqR':'lacq'});}
  u=ub;
  if(hwG){const nextOp=ops[ops.indexOf(q)+1],lim=nextOp?clamp((nextOp.s-nextOp.w/2)/L,0,1):1,ubG=Math.min(lim,uc+hwG);
   if(ubG>u+1e-3){sheet(u,ubG,null,3);u=ubG;}}}
 sheet(u,1);}
/* a room of four leaning walls: w (x) by d (z) at the ground, y0 up h. o.lean {front, back, left, right}: metres the top
   edge moves IN per metre of height (negative leans out). opens per side as lzWall's. Returns the top corners. o.mkf(side),
   o.colf(side). The DESIGN's rule: at least one face leans in and one out (the defaults do). */
function lzBatterRoom(w,d,y0,h,mk,col,o){o=o||{};const Ln=Object.assign({front:.08,back:-.05,left:.1,right:-.03},o.lean||{});
 const B={fl:[-w/2,d/2],fr:[w/2,d/2],br:[w/2,-d/2],bl:[-w/2,-d/2]};
 const xl=-w/2+Ln.left*h,xr=w/2-Ln.right*h,zf=d/2-Ln.front*h,zb=-d/2+Ln.back*h;const T={fl:[xl,zf],fr:[xr,zf],br:[xr,zb],bl:[xl,zb]};
 const S=[['front',B.fl,B.fr,T.fl,T.fr],['right',B.fr,B.br,T.fr,T.br],['back',B.br,B.bl,T.br,T.bl],['left',B.bl,B.fl,T.bl,T.fl]];
 const rDoors=[];
 for(const [side,b0,b1,t0,t1] of S){if(o.skip&&o.skip.includes(side))continue;
  const ops=o[side];lzWall(b0,b1,t0,t1,y0,h,o.mkf?o.mkf(side):mk,o.colf?o.colf(side):col,ops,o);
  if((side==='front'||side==='back')&&ops)for(const q of ops)if(q&&(q.door||q.openOnly)&&!q.courseClip)
   rDoors.push({side:side==='front'?1:-1,x:side==='front'?q.s-w/2:w/2-q.s,w:q.w,topY:y0+q.h+.34});}
 LZ_LAST_ROOM={w,d,y0,h,doors:rDoors};
 return {T,B,xl,xr,zf,zb,doors:rDoors};}
/* a ring of stone along the top of a battered room's walls (T its top corners), `wide` metres in, th thick: a hollow
   course under a course turned past it shows a wedge into the room at each corner, and the ring closes it; gapFront leaves
   the +z front doorway clear when a tall portal rises past the course ring */
function lzCourseRing(T,y,th,wide,mk,col,gapFront){const xl=T.fl[0],xr=T.fr[0],zf=T.fl[1],zb=T.bl[1];
 if(gapFront>0){const gx0=Math.max(xl,-gapFront/2),gx1=Math.min(xr,gapFront/2);
  if(gx0-xl>.08)box(mk,(xl+gx0)/2,y,zf-wide/2,gx0-xl,th,wide,col);
  if(xr-gx1>.08)box(mk,(gx1+xr)/2,y,zf-wide/2,xr-gx1,th,wide,col);
 }else box(mk,(xl+xr)/2,y,zf-wide/2,xr-xl,th,wide,col);
 box(mk,(xl+xr)/2,y,zb+wide/2,xr-xl,th,wide,col);box(mk,xl+wide/2,y,(zf+zb)/2,wide,th,zf-zb,col);box(mk,xr-wide/2,y,(zf+zb)/2,wide,th,zf-zb,col);}
/* a flat roof slab on the top corners of a battered room, th thick, over the edge by ov */
function lzSlab(T,y,th,mk,col,ov){ov=ov||0;/* prism wants its outline anticlockwise seen from above: back-left, back-right, front-right, front-left */
 const pts=[[T.bl[0]-ov,T.bl[1]-ov],[T.br[0]+ov,T.br[1]-ov],[T.fr[0]+ov,T.fr[1]+ov],[T.fl[0]-ov,T.fl[1]+ov]];prism(mk,pts,y,y+th,col);}
/* ---------------------------------------------------------------- openings: triangles, sized by caste, nested on shared buildings */
/* slanted-jamb biparting carapace door valves (replaces the old centre-pivoting single leaf): two mirrored right-triangular
   lacquer/oxblood valves framed in cast Shang bronze with a twin vertical meeting spine and non-orthogonal brace ribs, hinged
   along the OUTER slanted jambs (`DESIGN.md`: nothing meets at 90 degrees). Pressing E folds both valves smoothly outward and
   slightly upward (~103 deg) like beetle/reptile carapace plates, leaving 100% of the triangular doorway unobstructed */
const LZ_VALVES=[],LZ_VGEO={};
function lzPrism2D(pos,nor,uv,idx,pts,z0){const n=pts.length;
 for(const zz of [-z0,z0]){const st=pos.length/3;for(const p of pts){pos.push(p[0],p[1],zz);nor.push(0,0,zz>0?1:-1);uv.push(p[0]+.5,p[1]);}
  for(let i=1;i<n-1;i++){if(zz>0)idx.push(st,st+i,st+i+1);else idx.push(st,st+i+1,st+i);}}
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=dy/L,ny=-dx/L,st=pos.length/3;
  for(const [p,zz] of [[a,-z0],[b,-z0],[b,z0],[a,z0]]){pos.push(p[0],p[1],zz);nor.push(nx,ny,0);}
  uv.push(0,0,L,0,L,z0*2,0,z0*2);idx.push(st,st+1,st+2,st,st+2,st+3);}}
function lzTriValveGeo(s){const k='p'+s;if(LZ_VGEO[k])return LZ_VGEO[k];
 const pos=[],nor=[],uv=[],idx=[],pts=s<0?[[-.494,.005],[-.005,.005],[-.005,.990]]:[[.005,.005],[.494,.005],[.005,.990]];
 lzPrism2D(pos,nor,uv,idx,pts,.36);return LZ_VGEO[k]=fixWind(mkGeo(pos,nor,uv,idx));}
function lzTriTrimGeo(s){const k='t'+s;if(LZ_VGEO[k])return LZ_VGEO[k];
 const pos=[],nor=[],uv=[],idx=[];
 const P0=s<0?[[-.496,.003],[-.004,.003],[-.004,.993]]:[[.004,.003],[.496,.003],[.004,.993]];
 const Q0=s<0?[[-.422,.044],[-.043,.044],[-.043,.856]]:[[.043,.044],[.422,.044],[.043,.856]];
 for(let i=0;i<3;i++){const j=(i+1)%3;lzPrism2D(pos,nor,uv,idx,[P0[i],P0[j],Q0[j],Q0[i]],.54);}
 /* two angled carapace ribs (slanted upward toward the jamb: no 90-degree rails) and a cast latch-plate on the meeting stile */
 for(const [vIn,vOut] of [[.24,.40],[.50,.63]]){
  const xIn=s*.040,xOut1=s*(.494*(1-vOut)),xOut2=s*(.494*(1-(vOut+.034)));
  const rPts=s<0?[[xOut1,vOut],[xIn,vIn],[xIn,vIn+.034],[xOut2,vOut+.034]]:[[xIn,vIn],[xOut1,vOut],[xOut2,vOut+.034],[xIn,vIn+.034]];
  lzPrism2D(pos,nor,uv,idx,rPts,.48);}
 const lPts=s<0?[[-.072,.35],[-.003,.35],[-.003,.45],[-.072,.42]]:[[.003,.35],[.072,.35],[.072,.42],[.003,.45]];
 lzPrism2D(pos,nor,uv,idx,lPts,.62);
 return LZ_VGEO[k]=fixWind(mkGeo(pos,nor,uv,idx));}
const LZ_VTMP={p:new THREE.Vector3(),v:new THREE.Vector3(),ax:new THREE.Vector3(),qH:new THREE.Quaternion(),qW:new THREE.Quaternion(),s:new THREE.Vector3(),m:new THREE.Matrix4(),up:new THREE.Vector3(0,1,0)};
function lzPoseValve(V){const D=V.D,o=D.open||0,e=o*o*(3-2*o),T=LZ_VTMP;T.s.set(V.w,V.h,V.t);
 for(let si=0;si<2;si++){const s=si===0?-1:1,Hx=s*.495*V.w,Hz=.46*V.t,kx=-s*.490*V.w,ky=.987*V.h,L=Math.hypot(kx,ky)||1;
  T.ax.set(kx/L,ky/L,0);T.qH.setFromAxisAngle(T.ax,s*e*1.80);
  T.v.set(-Hx,0,-Hz).applyQuaternion(T.qH);T.v.x+=Hx;T.v.z+=Hz;T.v.applyQuaternion(V.qYaw);
  T.p.set(D.at[0]+T.v.x,D.at[1]+T.v.y,D.at[2]+T.v.z);
  T.qW.copy(V.qYaw).multiply(T.qH);T.m.compose(T.p,T.qW,T.s);
  const g=V.ims[si];g.imP.setMatrixAt(g.idxP,T.m);g.imT.setMatrixAt(g.idxT,T.m);
  g.imP.instanceMatrix.needsUpdate=true;g.imT.instanceMatrix.needsUpdate=true;}}
function lzFlushValves(parent){if(!LZ_VALVES.length)return;
 for(const cutFlag of [false,true]){const sub=LZ_VALVES.filter(v=>v.cut===cutFlag);if(!sub.length)continue;
  for(const si of [0,1]){const s=si===0?-1:1;
   /* group panels by material key (lacq / lacqR / bronzeC), while all bronze exoskeleton frames share one bronzeC InstancedMesh */
   const imT=new THREE.InstancedMesh(lzTriTrimGeo(s),svLeafMat('bronzeC'),sub.length);
   imT.name='lz-door-trim-'+(s<0?'L':'R')+(cutFlag?'-cut':'');imT.userData.doorLeaves=true;
   imT.castShadow=true;imT.receiveShadow=true;imT.frustumCulled=false;
   const byMk=new Map();sub.forEach(V=>{if(!byMk.has(V.mk))byMk.set(V.mk,[]);byMk.get(V.mk).push(V);});
   let ti=0;
   for(const [mk,arr] of byMk){
    const imP=new THREE.InstancedMesh(lzTriValveGeo(s),svLeafMat(mk),arr.length);
    imP.name='lz-door-panel-'+mk+'-'+(s<0?'L':'R')+(cutFlag?'-cut':'');imP.userData.doorLeaves=true;
    imP.castShadow=true;imP.receiveShadow=true;imP.frustumCulled=false;
    arr.forEach((V,pi)=>{imP.setColorAt(pi,V.col);imT.setColorAt(ti,V.trimCol);V.ims[si]={imP,idxP:pi,imT,idxT:ti++};});
    imP.instanceColor.needsUpdate=true;parent.add(imP);SV_OPEN.meshes.push(imP);if(cutFlag)SV_OPEN.cutMeshes.push(imP);}
   imT.instanceColor.needsUpdate=true;parent.add(imT);SV_OPEN.meshes.push(imT);if(cutFlag)SV_OPEN.cutMeshes.push(imT);}}
 for(const V of LZ_VALVES){lzPoseValve(V);KDOORHOST.posed(V.D,()=>lzPoseValve(V));}}
{const lzPrevBuild=buildWorld;buildWorld=function(){LZ_VALVES.length=0;const r=lzPrevBuild();lzFlushValves(WORLD);return r;};}
function lzLeaf(x,y,z,ry,w,h,o){o=o||{};const mk=o.mk||'lacq',col=o.col||P(mk==='lacqR'?'oxblood':'lacq'),trimCol=P('bronze'),t=o.t||.07;
 const ww=w*.985,hh=h*.985,slope=Math.atan2(ww/2,hh);
 /* three cast-bronze knuckle collars anchored along each slanted jamb outside the moving valves */
 W(x,y,z,ry,()=>{for(const s of [-1,1])for(const f of [.16,.48,.80]){
  WX(s*ww*.495*(1-f),hh*f,t*.46,0,0,s*slope,()=>cyl('bronzeC',0,-.03,0,.028,.06,trimCol,8));}});
 if(PLACE_DRY||GTARGET!==GB||typeof KDOOR==='undefined'){
  W(x,y,z,ry,()=>{_svM.compose(_svP.set(0,0,0),_svQ.identity(),_svS.set(ww,hh,t));
   for(const s of [-1,1]){emit(mk,lzTriValveGeo(s),_svM.clone(),col);emit('bronzeC',lzTriTrimGeo(s),_svM.clone(),trimCol);}});
  return null;}
 const at=svW(x,y,z),p0=svW(x,y+hh/2,z),wy=svYaw(ry),e=CM.elements,sc=Math.hypot(e[0],e[1],e[2])||1;
 const base=svDefIndex(),id=o.id==null?base+'.d'+(CURREC?CURREC._doorN++:LZ_VALVES.length):o.id;
 const D=KDOOR.add({id,at,p0,yaw:wy,w:ww*sc,h:hh*sc,t:t*sc,pair:true,swing:1.80,rate:.95,locked:!!o.locked,open:o.open||0,
  key:CURREC?CURREC.key:null,name:o.name||'caste door'});
 LZ_VALVES.push({D,mk,col:typeof col==='number'?hc(col):col.clone(),trimCol:typeof trimCol==='number'?hc(trimCol):trimCol.clone(),
  cut:CUTC[3]>.5,wy,qYaw:new THREE.Quaternion().setFromAxisAngle(LZ_VTMP.up,wy),w:ww*sc,h:hh*sc,t:t*sc,ims:[null,null]});
 return D;}
/* the door of caste c, as an lzWall opening at s along the wall: a triangle doorH(c) high, LZ_DW of that wide at the floor */
function lzDoor(c,s){const h=lzDoorH(c);return {s,w:+(h*LZ_DW).toFixed(2),h,door:true};}
/* a slit vent for caste c (no window at a human's eye height: the vents sit high, under the eave) */
function lzVent(c,s,y){const h=lzDoorH(c)*.3;return {s,w:h*.5,h,y};}
/* stepped exterior portal hood around a clear triangular opening H high (w = H * LZ_DW): all nested frames step OUTWARD in size
   and proud in +z on the exterior face so NOTHING ever protrudes smaller than H into the room or chokes interior headroom!
   Shared ('all'-caste) portals additionally carry stepped bronze caste-tier lug markers along the outer slanted cheeks */
function lzPortal(x,y,z,ry,H,o){o=o||{};const mk=o.mk||'lacq',col=o.col||(mk==='bronze'?P('bronze'):mk==='ivory'?P('tusk'):mk==='lacqR'?P('oxblood'):P('lacq'));
 const nF=o.frames||(H>=4?4:3),step=Math.min(o.step||.05,.065),w0=H*LZ_DW;
 W(x,y,z,ry,()=>{
  for(let k=0;k<nF;k++){const u=nF-1-k,hk=H+.11+.15*u,wk=w0+.14+.22*u,zz=.015+k*step,t=.085+.018*u;
   for(const s of [-1,1])beam(mk,[s*wk/2,0,zz],[0,hk,zz],t,col,false,undefined,Math.min(t*1.25,step*1.35));}
  /* on shared portals (H >= 4 m), mark the lower castes' heights with angled bronze lugs on the OUTSIDE of the slanted cheeks */
  if(o.shared||H>=4.0){const wOut=w0+.14+.22*(nF-1),hOut=H+.11+.15*(nF-1),mCol=P('verd');
   for(let c=1;c<=5;c++){const hc0=lzDoorH(c);if(hc0>=H-.25)continue;const xc=wOut/2*(1-hc0/hOut);
    for(const s of [-1,1])beam('bronzeC',[s*(xc+.02),hc0,.04],[s*(xc+.22),hc0+.09,.05],.045,mCol,false,undefined,.06);}}
  box('basalt',0,-.09,.06,w0+.52,.14,.28,P('basaltD'));   /* low flush threshold sill */
  if(o.eye)lzEye(0,H+.26+.15*(nF-1),.06+.04*nF,0,.32,{mk:'bronze'});});}
/* ---------------------------------------------------------------- the ornament */
/* a leiwen panel: w by h, its face +z at z = 0 from y = 0 up, cells of o.cell (m): each cell a squared spiral in raised strokes
   of o.mk (bronze | lacq | lacqR | ivory | basalt) on a backing of o.back (false: none). Chirality: the left half winds one way, the
   right the other (mirrored pairs). The FLAW: one seeded cell lacks one stroke. o.eye: a spiral eye at the panel's centre */
function lzLeiwen(w,h,o){o=o||{};
 if(LZ_SHEET('leiwenS')&&o.sheet!==false){/* the owner's sheet: one block per 1.2 m, the panel's own size in cells, on a lacquer backing; the eye stays geometry */
  const z0=o.back!==false?.06:0;if(o.back!==false)box(o.back||'lacq',0,0,.03,w,h,.06,o.backCol||P('lacq'));
  quad('leiwenS',0,h/2,z0+.005,w,h,WHITE,0,0,0);if(o.eye)lzEye(0,h/2,z0+.02,0,Math.min(w,h)*.3,{mk:o.mk||'bronze'});return;}
 const c=o.cell||.5,nx=Math.max(1,Math.floor(w/c)),ny=Math.max(1,Math.floor(h/c)),mk=o.mk||'bronze',col=o.col||(mk==='bronze'?P('verd'):mk==='ivory'?P('bone'):mk==='basalt'?P('basaltC'):P('oxblood'));
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
 if(LZ_SHEET('eyeS')&&mk==='bronze'&&!o.glow){/* the owner's eye on a cast disc, both faces */
  W(x,y,z,ry,()=>{WX(0,0,0,0,PI/2,0,()=>cyl('bronzeC',0,-th,0,R,th,P('bronze'),24));for(const f of [1,-1])WX(0,0,f>0?.005:-th-.005,0,f>0?PI/2:-PI/2,0,()=>medallion('eyeS',0,0,0,R*2*.93,{round:true}));});return;}   /* the sheet a little inside the cast disc: its magenta key never reaches the rim */
 W(x,y,z,ry,()=>{WX(0,0,0,0,PI/2,0,()=>cyl(mk==='bronze'?'bronzeC':mk,0,-th,0,R,th,mk==='bronze'?P('bronze'):col,18));   /* the disc, from z = -th to 0 */
  /* the whorl and the pupil on BOTH faces, so the eye reads from behind too (the back winds the other way) */
  for(const f of [1,-1]){const zf=f>0?0:-th;tube(mk,t=>{const a=t*TAU*2.3*f,r=R*.14+R*.78*(1-t);return [Math.cos(a)*r,Math.sin(a)*r,zf+f*(.02+.01*t)];},t=>[R*.07,R*.07],22,5,col,{caps:true});
   sph(o.glow?'glow':'plain',0,0,zf+f*.04,R*.2,o.glow?P('glowC'):P('eye'),.6,10);}
  if(o.glow)haloAt(0,0,.1,0x7adacf);});}
/* a glyph band whose strokes follow a squared spiral path winding in from the outer corner (it reads inward and outward):
   small strokes in o.mk on the face +z, w by h from y = 0. The strokes are seeded from the five base glyphs' stroke shapes.
   o.turns the spiral's turns (3); o.mirror winds the other way (the mirrored stela of a pair) */
function lzGlyphSpiral(w,h,o){o=o||{};
 if(LZ_SHEET('glyphS')&&o.sheet!==false){/* the owner's band, run up the face as columns (the text reads both ways): as many as fit, 0.8 m wide */
  const n=Math.max(1,Math.floor(w/.85)),bw=w/n;for(let i=0;i<n;i++){const x=-w/2+bw*(i+.5);WX(x,h/2,.012,0,0,o.mirror?-PI/2:PI/2,()=>quad('glyphS',0,0,0,h,bw*.92,WHITE,0,0,0));}return;}
 const mk=o.mk||'bronze',col=o.col||(mk==='bronze'?P('verd'):mk==='ivory'?P('bone'):P('basaltC')),chir=o.mirror?-1:1,turns=o.turns||3,t=o.t||.03,pr=.02;
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
 W(x,0,z,o.ry||0,()=>{for(let i=0;i<n;i++){const t=i/(n-1||1),w=lerp(w0,w1,t),ry=i*twist;if(i>=(o.start||0))box(mk,0,i*ch,0,w,ch+.01,w*(o.aspect||1),col,ry);if(o.each)o.each(i,i*ch,w,ry);}});}
/* a standing stone of the circle: a leaning slab with a whorl cut on its face */
function lzMenhir(x,z,h,w,o){o=o||{};W(x,0,z,o.ry||0,()=>{WX(0,0,0,0,0,o.lean||rr(-.08,.08),()=>{lzWall([-w/2,w*.2],[w/2,w*.2],[-w*.3,w*.12],[w*.3,w*.12],0,h,'basalt',P('basalt'),[],{inner:false});
  lzWall([w/2,-w*.2],[-w/2,-w*.2],[w*.3,-w*.12],[-w*.3,-w*.12],0,h,'basalt',P('basalt'),[],{inner:false});lzWall([w/2,w*.2],[w/2,-w*.2],[w*.3,w*.12],[w*.3,-w*.12],0,h,'basalt',P('basalt'),[],{inner:false});
  lzWall([-w/2,-w*.2],[-w/2,w*.2],[-w*.3,-w*.12],[-w*.3,w*.12],0,h,'basalt',P('basalt'),[],{inner:false});box('basalt',0,h-.02,0,w*.6,.1,w*.24,P('basalt'));
  if(o.eye)lzEye(0,h*.6,w*.2+.01,0,w*.22,{mk:'basalt'});});});}
/* a bell rack: two bone posts leaning in (L apart at the foot), a bone beam seated across their tops and lashed, n bronze
   bells (after the bianzhong) hung from it by cords, with no clappers: silence made visible */
function lzBellRack(x,z,ry,L,h,n){W(x,0,z,ry,()=>{const lean=.35;
 for(const s of [-1,1]){beam('bones',[s*L/2,0,0],[s*(L/2-lean),h,0],.16,P('boneO'),true,8);sph('bones',s*(L/2-lean),h,0,.19,P('boneO'),1,8);}
 beam('bones',[-L/2+lean-.3,h+.1,0],[L/2-lean+.3,h+.1,0],.12,P('boneO'),true,8);
 for(const s of [-1,1])for(const k of [-1,1])ring('rope',s*(L/2-lean),h+.1+k*.06,0,.2,.03,P('reedD'),0,0,PI/2,10);
 for(const bx of lzSpan(-L/2+lean+.5,L/2-lean-.5,n)){const bh=.42+.1*Math.abs(bx)/L;beam('rope',[bx,h+.05,0],[bx,h-.2,0],.02,P('reedD'),true,5);
  lathe('bronzeC',bx,0,[[.02,h-.2],[.14,h-.26],[.19,h-.2-bh*.75],[.21,h-.2-bh],[.0,h-.2-bh]],12,P('bronze'),{});
  ring('bronzeC',bx,h-.2-bh*.5,0,.2,.018,P('verd'),0,0,0,16);ring('bronzeC',bx,h-.2-bh*.82,0,.215,.015,P('verd'),0,0,0,16);
  /* between the bands: the leiwen sheet wrapped once round the bell, one row of four cells (uvf: u once round, v a quarter of the sheet) */
  if(LZ_SHEET('leiwenS')){const y1=h-.2-bh*.8,y2=h-.2-bh*.52,tl=TILE.leiwenS||1.2;
   const f=(u,v)=>{const a=u*TAU,y=lerp(y1,y2,v),r=lerp(.212,.198,v)+.006;return [bx+Math.cos(a)*r,y,Math.sin(a)*r];};
   const pm=f(.5,.5),pa=f(.52,.5),pb=f(.5,.52),du=[pa[0]-pm[0],pa[1]-pm[1],pa[2]-pm[2]],dv=[pb[0]-pm[0],pb[1]-pm[1],pb[2]-pm[2]];
   const nx=du[1]*dv[2]-du[2]*dv[1],nz=du[0]*dv[1]-du[1]*dv[0];const out=(pm[0]-bx)*nx+pm[2]*nz;
   psurf('leiwenS',f,24,2,WHITE,{flip:out<0,uvf:(u,v)=>[u*tl,v*tl/4]});}}});}   /* two cast bands round each bell */
/* the raised threshold and the stone footing every door has */
function lzThreshold(x,z,ry,w){W(x,0,z,ry,()=>box('basalt',0,-.16,.14,w+.46,.22,.52,P('basaltD')));}   /* low 6 cm bevelled sill step */
/* a pool of dust: the ground round a monument, trodden */
function lzDust(x,z,R){cyl('earthR',x,-.04,z,R,.12,P('earthP'),24);}   /* 8 cm proud of the ground: a thinner disc fights it at a distance */
