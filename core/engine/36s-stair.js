// ================================================================= STAIRS: a flight a walker climbs, drawn and registered (the owner, 2026-11-03)
// "Rework unreached floors by adding stairs": an upper storey, a loft or a podium no stair met. A builder calls these in its
// local frame, as it calls box() (+z the front, y up from the plot's ground), in its own materials:
//   svStair(x,z,y0,y1,yaw,o)   a straight flight from its foot's middle (x, y0, z) climbing toward yaw (0 = +z, PI/2 = +x) up to y1,
//                              where the floor above starts. o: w (.9) its width; riser (.19) the most a step rises; going (.27)
//                              a tread's depth, or run (the flight's length in plan: going = run / treads); style:
//                                'open'    plank treads on two stringers (the default: a timber stair; o.mk 'timber', o.col)
//                                'solid'   stone or brick steps, each solid down to the foot's floor (o.mk 'stone'): podium steps
//                                'ladder'  two rails and rungs, steep (run default rise / 3.2): a loft's, a stilt house's
//                              smk/scol the stringers' (rails') key and colour (default the treads'); rail: 'left' | 'right' |
//                              'both' a handrail on posts on that side (the climber's left or right). Returns the flight's plan
//                              in the local frame: {x0, x1, z0, z1, foot: [x, z], top: [x, z], run, n, riser}: the well the floor
//                              above leaves open (svWell).
//   svWell(mk,x,y,z,w,h,d,col,hole,o)   a slab as box(mk,x,y,z,w,h,d,col) draws it, less a rectangular hole {x0,x1,z0,z1} (local; a
//                              stair's plan): up to four boxes round it, so the floor above is not a lid over the flight; o.walk false:
//                              not read as floors (a string course through the walls, under the floor a walker stands on)
//   svLanding(x,z,y,w,d,o)     a landing or a podium's top step: a box w x d whose top is at y (o.t .2 thick, o.mk, o.col)
// The walk (core/walk, when the page has it and a building or feature is being placed): the treads are drawn past the kit's box
// reader (svNoWalk), and the flight is one KWALK.strip from the foot
// (y0) to the top (y1), w wide, tagged 'stair:<key>', with a pad 0.35 m long past its top so it meets the floor above however
// the builder's slab edge falls; a ladder is KWALKBOX.ladder's rungs (a stack of floors 0.4 m apart). That strip is what
// the Godot export reads as the stair, and what the reachability audit (tools/walk_audit/reach_audit.py) climbs.
const SV_STAIR={n:0,ladders:0};
/* draw fn's boxes without the kit's box reader (core/walk/box through the kit's 37-wk-rec.js, its WKOFF switch): a stair's treads
   (the flight's strip is its walk: a tread narrower than the reach audit's 0.4 m cell is stepped over and read as a floor nobody
   reached), a string course cut round a well */
function svNoWalk(fn){const has=typeof WKOFF!=='undefined',keep=has?WKOFF:0;if(has)WKOFF=1;try{fn();}finally{if(has)WKOFF=keep;}}
function svWalkOn(){return !PLACE_DRY&&typeof KWALK!=='undefined'&&CURREC&&(CURREC.cls==='building'||CURREC.cls==='feature');}
function svWP(x,y,z){const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);return [p.x,p.z,p.y];}   /* a local point as core/walk's [x,z,y] */
function svStair(x,z,y0,y1,yaw,o){o=o||{};const rise=y1-y0;if(!(rise>.05))return null;
 const style=o.style||'open',w=o.w==null?.9:o.w,ux=Math.sin(yaw||0),uz=Math.cos(yaw||0),px=uz,pz=-ux;   /* (ux,uz) the climb, (px,pz) its right */
 const ladder=style==='ladder',rmax=o.riser==null?(ladder?.3:.19):o.riser,n=Math.max(2,Math.ceil(rise/rmax-1e-9)),riser=rise/n;
 const run=o.run!=null?o.run:ladder?rise/3.2:(n-1)*(o.going==null?.27:o.going),going=run/(ladder?n:n-1);
 const mk=o.mk||(style==='solid'?'stone':'timber'),col=o.col,smk=o.smk||mk,scol=o.scol==null?col:o.scol;
 const at=(s,r)=>[x+ux*s+px*r,z+uz*s+pz*r];   /* s along the climb, r to its right */
 const yawB=Math.atan2(ux,uz);
 if(ladder){const rw=w/2;
  for(const r of [-rw,rw]){const a=at(-.02,r),b=at(run+.02,r);beam(smk,[a[0],y0,a[1]],[b[0],y1+.9,b[1]],.07,scol);}   /* the rails run on past the top: a handhold */
  for(let i=1;i<n;i++){const q=at(going*i,0);box(mk,q[0],y0+riser*i-.025,q[1],w-.04,.05,.06,col,yawB);}
  if(svWalkOn()&&typeof KWALKBOX!=='undefined'){const f=at(0,0),t=at(run,0),F=svWP(f[0],y0,f[1]),T=svWP(t[0],y1,t[1]);
   KWALKBOX.ladder(KWALK,[F[0],F[1]],[T[0],T[1],T[2]],{footY:F[2],w:Math.max(.55,w),tag:'stair:'+CURKEY});}
  SV_STAIR.ladders++;}
 else{
  svNoWalk(()=>{
  for(let i=1;i<n;i++){const s=going*(i-.5),q=at(s,0),y=y0+riser*i;   /* tread i: its top at y0 + i risers, over [going(i-1), going i] */
   if(style==='solid'){const s0=going*(i-1),s1=going*i+.01;prism(mk,[at(s0,-w/2),at(s1,-w/2),at(s1,w/2),at(s0,w/2)],y0,y,col);}   /* a solid step from the floor: a prism, which the box reader leaves to the strip */
   else box(mk,q[0],y-.05,q[1],w,.05,going+.03,col,yawB);}
  if(style!=='solid')for(const r of [-w/2-.03,w/2+.03]){const a=at(-.05,r),b=at(run+.02,r);beam(smk,[a[0],y0+.12,a[1]],[b[0],y1-.02,b[1]],.06,scol,false,0,.26);}   /* the stringers */
  const rails=o.rail==='both'?[-1,1]:o.rail==='left'?[-1]:o.rail==='right'?[1]:[];
  for(const sd of rails){const r=sd*(w/2+.02),a=at(.1,r),b=at(run,r);beam(smk,[a[0],y0+.95,a[1]],[b[0],y1+.95,b[1]],.05,scol);
   for(const s of [.1,run]){const q=at(s,r);box(smk,q[0],y0+riser*Math.round(s/Math.max(going,1e-3)),q[1],.05,.95,.05,scol);}}});
  if(svWalkOn()){const f=at(0,0),t=at(run,0),A=svWP(f[0],y0,f[1]),B=svWP(t[0],y1,t[1]),tag='stair:'+CURKEY;
   KWALK.strip({a:A,b:B,w:w,name:'stair',tag});
   const P=[[run,-w/2],[run+.35,-w/2],[run+.35,w/2],[run,w/2]].map(p=>{const q=at(p[0],p[1]);return svWP(q[0],y1,q[1]);});
   KWALK.poly({pts:P,name:'landing',tag});}
  SV_STAIR.n++;}
 const C=[at(0,-w/2-.06),at(0,w/2+.06),at(run,-w/2-.06),at(run,w/2+.06)];
 return {x0:Math.min(...C.map(c=>c[0])),x1:Math.max(...C.map(c=>c[0])),z0:Math.min(...C.map(c=>c[1])),z1:Math.max(...C.map(c=>c[1])),
  foot:at(0,0),top:at(run,0),run,n,riser};}
function svWell(mk,x,y,z,w,h,d,col,hole,o){if(o&&o.walk===false){svNoWalk(()=>svWell(mk,x,y,z,w,h,d,col,hole));return;}if(!hole){box(mk,x,y,z,w,h,d,col);return;}
 const X0=x-w/2,X1=x+w/2,Z0=z-d/2,Z1=z+d/2,hx0=Math.max(X0,hole.x0),hx1=Math.min(X1,hole.x1),hz0=Math.max(Z0,hole.z0),hz1=Math.min(Z1,hole.z1);
 if(hx1<=hx0||hz1<=hz0){box(mk,x,y,z,w,h,d,col);return;}
 const B=(a0,a1,b0,b1)=>{if(a1-a0>.02&&b1-b0>.02)box(mk,(a0+a1)/2,y,(b0+b1)/2,a1-a0,h,b1-b0,col);};
 B(X0,X1,Z0,hz0);B(X0,X1,hz1,Z1);B(X0,hx0,hz0,hz1);B(hx1,X1,hz0,hz1);}
function svLanding(x,z,y,w,d,o){o=o||{};const t=o.t==null?.2:o.t;box(o.mk||'timber',x,y-t,z,w,t,d,o.col);}
/* svStairCase(rect, ys, o): the stairs of a whole house in one place: rect {x0,x1,z0,z1} (local) the stair's zone, ys the floors' heights
   bottom to top ([ground floor, first, second, ...]); one storey's climb per pair. Where the zone is two flights wide (2 w + .1) each
   storey is a dog-leg: flight A along one long side from the zone's start end to a half landing at the far end, flight B back along
   the other side to the start end, where the floor above meets it (its well the whole zone); narrower, one straight flight from the
   start end toward the far end (its well the flight's own length: the floor above meets its top inside the zone).
   o: w (.9), start ('-' the zone's low end along its long axis, the default; '+' the high end), side ('-' | '+': flight A on the low or
   high side across), land (the half landing's depth, w + .1), style, mk, col, smk, scol, riser, rail (as svStair). A flight that
   cannot keep to a 0.19 m riser and a 0.27 m going in the zone keeps the riser and shortens its going down to 0.2 m (no steeper than
   45 degrees: the walker's step), then lets the riser grow to 0.22 m. Returns {wells: [rect per storey above the ground floor], flights,
   arrive: [x, z] where each flight B (or the straight flight) arrives, steep}: cut each upper slab with svWell(..., wells[i]) */
function svStairCase(rect,ys,o){o=o||{};const w=o.w==null?.9:o.w,X0=rect.x0,X1=rect.x1,Z0=rect.z0,Z1=rect.z1,alongX=(X1-X0)>(Z1-Z0);
 const L=alongX?X1-X0:Z1-Z0,S=alongX?Z1-Z0:X1-X0,dog=S>=2*w+.1,land=o.land==null?w+.1:o.land,st=o.start==='+'?1:-1,sd=o.side==='+'?1:-1;
 /* a point at u along the long axis from the start end, v across from the low side */
 const P=(u,v)=>{const a=st<0?(alongX?X0:Z0)+u:(alongX?X1:Z1)-u,b=(alongX?Z0:X0)+v;return alongX?[a,b]:[b,a];};
 const yawOut=alongX?(st<0?PI/2:-PI/2):(st<0?0:PI),yawBack=yawOut+PI;   /* climbing away from the start end, and back toward it */
 const out={wells:[],flights:0,arrive:null,steep:false};
 const fit=(rise,len)=>{let r=o.riser==null?.19:o.riser,n=Math.max(2,Math.ceil(rise/r-1e-9)),g=.27;
  if((n-1)*g>len){g=len/(n-1);if(g<.2){r=.22;n=Math.max(2,Math.ceil(rise/r-1e-9));g=Math.max(.16,Math.min(.27,len/(n-1)));if(g<.2)out.steep=true;}}
  return {riser:rise/n,run:(n-1)*g};};
 const so=Object.assign({},o,{w});
 for(let i=0;i+1<ys.length;i++){const y0=ys[i],y1=ys[i+1],h=y1-y0;
  if(dog){const ym=y0+h/2,f=fit(h/2,L-land),vA=sd<0?w/2+.02:S-w/2-.02,vB=sd<0?S-w/2-.02:w/2+.02;
   const a=P(0,vA),b=P(f.run,vB);
   svStair(a[0],a[1],y0,ym,yawOut,Object.assign({},so,{riser:f.riser+1e-6,run:f.run}));
   const lc=P((f.run+L)/2,S/2);svLanding(lc[0],lc[1],ym,alongX?L-f.run:S,alongX?S:L-f.run,{mk:o.mk,col:o.col,t:.12});
   svStair(b[0],b[1],ym,y1,yawBack,Object.assign({},so,{riser:f.riser+1e-6,run:f.run}));out.arrive=P(0,vB);out.flights+=2;}
  else{const f=fit(h,L),v=S/2,a=P(0,v);svStair(a[0],a[1],y0,y1,yawOut,Object.assign({},so,{riser:f.riser+1e-6,run:f.run}));out.arrive=P(f.run,v);out.flights++;
   const c0=P(0,0),c1=P(f.run,S);out.wells.push({x0:Math.min(c0[0],c1[0]),x1:Math.max(c0[0],c1[0]),z0:Math.min(c0[1],c1[1]),z1:Math.max(c0[1],c1[1])});continue;}
  out.wells.push({x0:X0,x1:X1,z0:Z0,z1:Z1});}
 return out;}
/* svFloor(pts, y): a level floor the box reader cannot see (a prism's, a lathe's: a hexagonal storey), as a core/walk polygon over the
   local [x, z] points at local height y, tagged 'floor:<key>' */
function svFloor(pts,y){if(!svWalkOn()||!pts||pts.length<3)return;KWALK.poly({pts:pts.map(p=>svWP(p[0],y,p[1])),name:'floor',tag:'floor:'+CURKEY});}
/* svClip(pts, a, n): the part of a convex polygon (local [x, z]) on the side of the line through a that n points to: a floor less a band */
function svClip(P,a,n){const out=[],s=p=>(p[0]-a[0])*n[0]+(p[1]-a[1])*n[1];for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],sp=s(p),sq=s(q);
 if(sp>=0)out.push(p);if((sp>=0)!==(sq>=0)){const t=sp/(sp-sq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}return out;}
/* svStripWalk(a, b, w): a kit's own flight (its treads drawn in svNoWalk) as the walk's one strip, a and b local [x, y, z] (the foot and the
   top), tagged 'stair:<key>', with svStair's pad past the top */
function svStripWalk(a,b,w){if(!svWalkOn())return;const A=svWP(a[0],a[1],a[2]),B=svWP(b[0],b[1],b[2]),tag='stair:'+CURKEY,dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,px=uz,pz=-ux;
 KWALK.strip({a:A,b:B,w,name:'stair',tag});
 KWALK.poly({pts:[[0,-w/2],[.35,-w/2],[.35,w/2],[0,w/2]].map(q=>svWP(b[0]+ux*q[0]+px*q[1],b[1],b[2]+uz*q[0]+pz*q[1])),name:'landing',tag});}
