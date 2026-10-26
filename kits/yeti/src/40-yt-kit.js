// prefix: yt
// ================================================================= THE TOOLKIT: shells, vaults, portals, the platform, the lamp, the layers
// PLAN.md sections 2 and 4. Every builder draws in its local frame (origin the plot centre on the ground, +z the front,
// which is south on the sheet); the ground is y = 0 and floors are sunk below it (the sheet's plane is holed for them:
// 90y-yt-ground.js). Sizes are already at the Khaayken's scale (YT_S, 26k-kit.js).
//   ytCatA, ytCatY, ytCatR, ytCatProf   the catenary section: an inverted hanging chain, taller than half its span, so
//                                       every course leans on the one below and no dome needs centring
//   ytShell(mk, prof, col, o)           a shell of revolution on any profile, with doorways cut in its lower band
//                                       (o.doors), its block courses rising as one spiral (o.spiral: the course height;
//                                       the igloo is laid so) or as level rings, and o.slump (the spring's sag)
//   ytDome(mk, R, H, col, o)            ytShell on the catenary
//   ytCorbelProf(R, H, course)          the stepped section of dry slab laid in level courses, each stepping in (the
//                                       tholos, the clochan); ytShell draws it
//   ytRibs(mk, R, H, n, w, col, o)      the ribs of a great hall's dome, on piers, with a crown ring
//   ytVault, ytArchFace, ytPortal       a barrel vault of semi-elliptic section along z; the face closing its thickness;
//                                       the face joining two passage sections (a passage into a bigger tunnel)
//   ytEntry(e)                          the cold-trap passage (PLAN.md section 4)
//   ytSegment(r, zE, n)                 the outline (x,z) of the part of a circle behind the chord z = zE: the platform
//   ytLamp, ytCrownVent, ytIceWindow    the soapstone lamp; the crown vent's sleeve; an ice lens through shell and lining
//   ytLayers, ytFrost                   a wall's layers inside to outside, and the frost rule for a heated pycrete shell
/* the catenary's parameter a for a dome of base radius R rising H: y(r) = H - a(cosh(r/a) - 1), with y(R) = 0 */
function ytCatA(R,H){let lo=R*.02,hi=R*80;for(let i=0;i<64;i++){const a=(lo+hi)/2;if(a*(Math.cosh(R/a)-1)>H)lo=a;else hi=a;}return (lo+hi)/2;}
/* that section's height above its springing at radius r, and the radius at height y (bisection) */
function ytCatY(R,H,r){const a=ytCatA(R,H);return H-a*(Math.cosh(r/a)-1);}
function ytCatR(R,H,y){let lo=0,hi=R;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(ytCatY(R,H,m)>y)lo=m;else hi=m;}return (lo+hi)/2;}
/* the section as a profile [[r, y]], from the springing (r = R, y = y0) up to the crown opening (r = rTop); denser at
   the springing, where it is steep */
function ytCatProf(R,H,y0,n,rTop){const a=ytCatA(R,H),P=[];rTop=rTop||0;
 for(let i=0;i<=n;i++){const r=rTop+(R-rTop)*Math.cos(i/n*PI/2);P.push([r,y0+H-a*(Math.cosh(r/a)-1)]);}return P;}
/* the stepped section of slab laid in level courses (course high), each set in to the catenary: a ledge and a riser a
   course, up to the crown opening rTop */
function ytCorbelProf(R,H,y0,course,rTop){const P=[];let y=0,r=R;rTop=rTop||0;
 while(y<H-1e-6){const y1=Math.min(H,y+course),r1=Math.max(rTop,ytCatR(R,H,y1));P.push([r,y0+y],[r,y0+y1]);if(r1<r-1e-4)P.push([r1,y0+y1]);r=r1;y=y1;if(r<=rTop+1e-4)break;}
 return P;}
/* the profile sagged by the spring (s 0..1): the crown sinks, the foot spreads */
function ytSlumped(prof,s){const R=prof[0][0],y0=prof[0][1],H=Math.max(1e-3,prof[prof.length-1][1]-y0);
 return prof.map(p=>{const f=(p[1]-y0)/H;return [p[0]*(1+.07*s*(1-f)*(1-f)),y0+(p[1]-y0)*(1-.28*s*f)];});}
/* one sweep of a profile from angle a0 to a1 (a1 > a0). Courses: uv u is arc length round the ring, v the length up the
   profile plus, for a spiral, the course height times the turns made, so each course climbs one course per turn. */
/* crown is set for a circular cap sheet (one unrolled dome, its crown at the image's centre): crown.L is the length along
   the whole profile from the foot to the axis, and a point at length s from the foot lands at radius (1 - s/L) of the
   disc, at its angle round the dome: the rings stay evenly spaced and nothing pinches toward the crown */
function ytSweep(mk,prof,a0,a1,seg,col,inward,spiral,vOff,crown,rRef){const n=prof.length,sv=[vOff||0];if(rRef==null){rRef=0;for(const q of prof)rRef=Math.max(rRef,q[0]);}
 for(let j=1;j<n;j++)sv.push(sv[j-1]+Math.hypot(prof[j][0]-prof[j-1][0],prof[j][1]-prof[j-1][1]));
 const at=v=>{const t=v*(n-1),j=Math.min(n-2,Math.floor(t)),f=t-j;return [prof[j][0]+(prof[j+1][0]-prof[j][0])*f,prof[j][1]+(prof[j+1][1]-prof[j][1])*f,sv[j]+(sv[j+1]-sv[j])*f];};
 const dr=prof[n-1][0]-prof[0][0],dy=prof[n-1][1]-prof[0][1],flip=(-dy*(inward?-1:1)+.5*dr)<0;
 psurf(mk,(u,v)=>{const a=a0+(a1-a0)*u,q=at(v);return [Math.cos(a)*q[0],q[1],Math.sin(a)*q[0]];},seg,n-1,col,
  {flip,uvf:crown?(u,v)=>{const a=a0+(a1-a0)*u,q=at(v),rr=.495*Math.max(0,1-q[2]/crown.L),tl=TILE[mk]||1;return [(.5+Math.cos(a)*rr)*tl,(.5+Math.sin(a)*rr)*tl];}
   :(u,v)=>{const a=a0+(a1-a0)*u,q=at(v);return [a*Math.max(.3,rRef),q[2]+(spiral?spiral*a/TAU:0)];}});}
/* a doorway's half-width at height y: an arch {hw, hv, ys} (the outer section of the vault that runs through it: straight
   sides to the springing ys, a semi-ellipse over) or a plain opening {w, h} */
function ytEnvW(d,y){if(d.arch){const a=d.arch;if(y<=a.ys)return a.hw;if(y>=a.ys+a.hv)return 0;const f=(y-a.ys)/a.hv;return a.hw*Math.sqrt(1-f*f);}return y<d.h?d.w/2:0;}
/* a shell of revolution. o.doors [{ga, arch: {hw, hv, ys} | w, h, grow}]: doorways centred on angle ga (+z is PI/2). An
   arched doorway follows the vault through it: the shell is cut in level bands, each band's gap as wide as the arch at
   the band's top (less 3 cm, so the vault's outer face covers the cut; a lining is cut the same, the vault running on into the
   room a hand's breadth so its closed end frames every cut edge). o.inward faces the axis; o.spiral the course height of a spiral; o.slump the spring's sag (0..1); o.seg the
   segments round. */
function ytShell(mk,prof,col,o){o=o||{};const seg=o.seg||48;
 if(o.slump)prof=ytSlumped(prof,o.slump);
 /* a cap sheet (YT_CAPS, 26k-kit.js) maps from the crown: the profile's length, foot to axis */
 let rRef=0;for(const q of prof)rRef=Math.max(rRef,q[0]);
 let crown=null;if(YT_CAPS[mk]){let L=0;for(let j=1;j<prof.length;j++)L+=Math.hypot(prof[j][0]-prof[j-1][0],prof[j][1]-prof[j-1][1]);crown={L:L+prof[prof.length-1][0]};}
 const doors=(o.doors||(o.door?[o.door]:[])).map(d=>Object.assign({grow:-.03},d,{ga:d.ga===undefined?PI/2:d.ga}));
 if(!doors.length){ytSweep(mk,prof,0,TAU,seg,col,o.inward,o.spiral,0,crown,rRef);return prof;}
 const y0=prof[0][1],yN=prof[prof.length-1][1];
 let H=[];for(const d of doors){if(d.arch){const a=d.arch;H.push(a.ys);for(let k=1;k<=6;k++)H.push(a.ys+a.hv*k/6);}else H.push(d.h);}
 H=[...new Set(H.map(h=>+h.toFixed(4)))].filter(h=>h>y0+1e-4&&h<yN-1e-4).sort((p,q)=>p-q);
 const cuts=[y0].concat(H,[yN]);
 const at=y=>{for(let j=1;j<prof.length;j++){const p0=prof[j-1],p1=prof[j];if(p1[1]>p0[1]&&y>=p0[1]-1e-9&&y<=p1[1]+1e-9){const f=(y-p0[1])/(p1[1]-p0[1]);return [p0[0]+(p1[0]-p0[0])*f,y];}}return y<=y0?prof[0]:prof[prof.length-1];};
 for(let b=0;b<cuts.length-1;b++){const ya=cuts[b],yb=cuts[b+1];if(yb-ya<1e-5)continue;
  const band=[at(ya)].concat(prof.filter(p=>p[1]>ya+1e-9&&p[1]<yb-1e-9),[at(yb)]),yq=yb-1e-4,rT=Math.max(.05,at(yb)[0]);
  /* the band's v starts where it lies along the whole profile, so the courses run on across the cuts */
  let vo=0;for(let j=1;j<prof.length;j++){const p0=prof[j-1],p1=prof[j];if(p1[1]<=ya+1e-9){vo+=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);continue;}if(p0[1]<ya)vo+=Math.hypot(band[0][0]-p0[0],ya-p0[1]);break;}
  /* the grow applies only within the arch: above it there is no doorway to widen */
  let G=[];for(const d of doors){const e=ytEnvW(d,yq);if(e<=0)continue;const w=e+d.grow;if(w<=.01)continue;const g=Math.asin(Math.min(.95,w/rT)),st=((d.ga-g)%TAU+TAU)%TAU;G.push([st,st+2*g]);}
  if(!G.length){ytSweep(mk,band,0,TAU,seg,col,o.inward,o.spiral,vo,crown,rRef);continue;}
  G.sort((p,q)=>p[0]-q[0]);const M=[G[0].slice()];for(const g of G.slice(1)){const L=M[M.length-1];if(g[0]<=L[1])L[1]=Math.max(L[1],g[1]);else M.push(g.slice());}
  for(let i=0;i<M.length;i++){const st=M[i][1],e=i+1<M.length?M[i+1][0]:M[0][0]+TAU;if(e-st>1e-3)ytSweep(mk,band,st,e,Math.max(3,Math.round(seg*(e-st)/TAU)),col,o.inward,o.spiral,vo,crown,rRef);}}
 return prof;}
/* a catenary dome shell (see ytShell for o); o.y0 the springing, o.rTop the crown opening, o.n the profile points */
function ytDome(mk,R,H,col,o){o=o||{};return ytShell(mk,ytCatProf(R,H,o.y0||0,o.n||16,o.rTop||0),col,o);}
/* a great hall's ribs: n ribs w square on the meridians of the catenary (R, H), proud of the shell by w/2, each from a
   pier at the springing to a crown ring round the opening rTop */
function ytRibs(mk,R,H,n,w,col,o){o=o||{};const P=ytCatProf(R+w/2,H+w/2,o.y0||0,12,o.rTop||0);
 /* the ribs stand either side of the doorway (at +z), never in it */
 for(let i=0;i<n;i++){const a=PI/2+(i+.5)/n*TAU,c=Math.cos(a),s=Math.sin(a);
  for(let j=1;j<P.length;j++)beam(mk,[c*P[j-1][0],P[j-1][1],s*P[j-1][0]],[c*P[j][0],P[j][1],s*P[j][0]],w,col);
  box(mk,c*(R+w*.6),(o.y0||0)-.2,s*(R+w*.6),w*1.9,1.6,w*1.9,col,-a);}
 ring(mk,0,P[P.length-1][1],0,(o.rTop||.3)+w*.5,w*.55,col);}
/* a barrel vault of semi-elliptic section (half-width hw, rise hv) springing at ys, from z0 to z1 (z0 < z1); o.inward faces in */
function ytVault(mk,hw,hv,ys,z0,z1,col,o){o=o||{};
 psurf(mk,(u,v)=>{const th=u*PI;return [Math.cos(th)*hw,ys+Math.sin(th)*hv,z0+(z1-z0)*v];},12,Math.max(1,Math.round((z1-z0)/1.2)),col,{flip:!!o.inward});}
/* the face closing a vault's thickness at z, between the section (hw, hv) and (hw + t, hv + t); front +1 faces +z, -1 faces -z */
function ytArchFace(mk,hw,hv,t,ys,z,front,col){
 psurf(mk,(u,v)=>{const th=u*PI;return [Math.cos(th)*(hw+t*v),ys+Math.sin(th)*(hv+t*v),z];},12,1,col,{flip:front>0});}
/* a passage's whole opening, floor to crown: up the right wall, over the arch, down the left (s: {hw, hv, ys, yF}) */
function ytOutline(s,u){const L1=s.ys-s.yF,La=PI*(s.hw+s.hv)/2,T=2*L1+La,d=u*T;
 if(d<=L1)return [s.hw,s.yF+d];if(d>=L1+La)return [-s.hw,s.ys-(d-L1-La)];const th=(d-L1)/La*PI;return [Math.cos(th)*s.hw,s.ys+Math.sin(th)*s.hv];}
/* the face at z joining a passage's opening s1 to a bigger tunnel's s2 (a passage running into the tunnel's end) */
function ytPortal(mk,s1,s2,z,front,col){psurf(mk,(u,v)=>{const a=ytOutline(s1,u),b=ytOutline(s2,u);return [a[0]+(b[0]-a[0])*v,a[1]+(b[1]-a[1])*v,z];},24,1,col,{flip:front>0});}
/* how far into a room (its wall's catenary R, H: the lining's, or the shell's where there is none) a passage must run so
   its closed end stands in front of the wall up to the vault's crown yC (the wall curves in above the springing: a vault
   ending at the floor's radius would leave the wall's stepped doorway cut showing round its top) */
function ytRoomReach(R,H,yC,rMax){return Math.min(rMax,ytCatR(R,H,yC)-.05);}
/* the cold-trap entry. e: {z0, z1 (the vault from the room's wall to the mouth), zEnd (the open stepped trench's end),
   yF (its floor), hw, hv, ys (the inner vault), t (the vault's thickness), season, mk (the vault's outer face: 'course'
   for pycrete, 'slab' for stone), coat (the coat over the vault: 'snow', 'turf' or none), covered (the passage ends
   at the mouth in a covered way: no open trench, no steps, no lintel; the tunnel's portal closes it)} */
function ytEntry(e){const hw=e.hw,hv=e.hv,ys=e.ys,yF=e.yF,z0=e.z0,z1=e.z1,zE=e.covered?z1:e.zEnd,t=e.t,wt=Math.max(.3,t+.02),mk=e.mk||'course',inner=mk==='slab'?'slab':'pycrete',inCol=mk==='slab'?P('slab'):P('ice');
 /* the trench: a flagged floor, dry slab walls from the floor to the springing under the vault, to the ground beyond it */
 box('flag',0,yF-.12,(z0+zE)/2,hw*2+wt,.12,zE-z0,P('flag'));
 for(const s of [-1,1]){const gp=e.gap&&e.gap.side===s?e.gap:null,runs=gp?[[z0,gp.z0],[gp.z1,z1]]:[[z0,z1]];
  for(const r of runs)if(r[1]-r[0]>.05)box('slab',s*(hw+wt/2),yF,(r[0]+r[1])/2,wt,ys-yF,r[1]-r[0],P('slab'));
  if(!e.covered)box('slab',s*(hw+wt/2),yF,(z1+zE)/2,wt,-yF+YT_KERB,zE-z1,P('slab'));}
 if(!e.covered){box('slab',0,yF,zE+wt/2,hw*2+wt*2,-yF+YT_KERB,wt,P('slab'));
  /* the steps up out of the open trench to the ground, against its end wall */
  const nS=3,rise=-yF/(nS+1);WKOFF=1;for(let i=1;i<=nS;i++){box('slab',0,yF,zE-(nS-i+.5)*.42,hw*2,rise*i,.42,P('slab'));wkPad(0,zE-(nS-i+.5)*.42,hw*2,.42,yF+rise*i);}WKOFF=0;
  /* the trench walls' tops are kerbs at the ground: a walker steps up onto them from the top tread and off onto the ground */
  wkPad(0,zE+wt/2,hw*2+wt*2,wt,YT_KERB);for(const s of [-1,1])wkPad(s*(hw+wt/2),(z1+zE)/2,wt,zE-z1,YT_KERB);
  ytWalkTarget('outside',0,0,zE+1.6);
  /* the lintel stone over the mouth (the clan's stone; its cut name comes with the lintel band, PLAN.md section 8) */
  box('slab',0,ys+hv+t*.15,z1+.12,hw*2+.5,.34,.42,P('slab'));}
 /* the vault: its inner face, its outer courses, its thickness closed at both ends */
 ytVault(inner,hw,hv,ys,z0,z1,inCol,{inward:true});
 ytVault(mk,hw+t,hv+t,ys,z0,z1,mk==='slab'?P('slab'):P('ice'));
 ytArchFace(inner,hw,hv,t,ys,z0,-1,inCol);if(!e.covered)ytArchFace(mk,hw,hv,t,ys,z1,1,mk==='slab'?P('slab'):P('ice'));
 /* the coat over the vault: drift snow in winter, turf in summer (and always on stone: mass inside, insulation outside) */
 const coat=e.coat!==undefined?e.coat:e.season==='winter'?'snow':e.season==='summer'?'turf':null;
 if(coat){const ct=coat==='snow'?.28:.25,zc=e.covered?z1:z1-.2;ytVault(coat,hw+t+ct,hv+t+ct,ys,z0+.4,zc,P(coat));ytArchFace(coat,hw+t,hv+t,ct,ys,z0+.4,-1,P(coat));if(!e.covered)ytArchFace(coat,hw+t,hv+t,ct,ys,zc,1,P(coat));}
 /* the step up from the passage into the room (its floor stands above the cold trap) */
 if(e.yRoom!=null&&e.yRoom-yF>.35)wkPad(0,z0+.25,hw*2,.5,(yF+e.yRoom)/2);
 if(!e.covered)door(0,yF,zE-3*.42-.2,0,hw*2);else door(0,yF,z1,0,hw*2);}
/* ---------------------------------------------------------------- the walk layer (core/walk): what the boxes cannot say
   37-wk-rec.js reads every box a building draws as a floor or a block; the round and curved parts are said here:
   ytWalkDisc  a round floor (a pit, a junction) as one polygon; ytWalkRing  a round wall as blocks round it, its doorway
   gaps left open; ytWalkBlock  a block in the local frame; ytWalkTarget  a place a walker must reach (verify.py's
   walk-reach check walks the floors from each building's door to every target it registered) */
function ytWalkDisc(cx,cz,r,y,n){if(PLACE_DRY||typeof KWALK==='undefined'||!CURREC||CURREC.cls!=='building'&&CURREC.cls!=='feature')return;n=n||20;const V=new THREE.Vector3(),pts=[];
 for(let i=0;i<n;i++){const a=i/n*TAU;V.set(cx+Math.cos(a)*r,y,cz+Math.sin(a)*r).applyMatrix4(CM);pts.push([V.x,V.z,V.y]);}KWALK.poly({pts,name:'room',tag:'room:'+CURKEY});}
function ytWalkBlock(x0,x1,z0,z1,y0,y1){if(PLACE_DRY||typeof KWALK==='undefined'||!CURREC)return;const V=new THREE.Vector3();let a=1e9,b=-1e9,c=1e9,d=-1e9,e=1e9,f=-1e9;
 for(const [x,z] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1]])for(const y of [y0,y1]){V.set(x,y,z).applyMatrix4(CM);a=Math.min(a,V.x);b=Math.max(b,V.x);c=Math.min(c,V.z);d=Math.max(d,V.z);e=Math.min(e,V.y);f=Math.max(f,V.y);}
 KWALK.block([a,b,c,d,e,f],'wall:'+CURKEY);}
function ytWalkRing(cx,cz,r0,r1,y0,y1,gaps){const gs=(gaps||[]).map(q=>{const g=Math.asin(Math.min(.95,q.w/2/r0));return [q.ga-g,q.ga+g];});
 const inGap=a=>gs.some(g=>{let d=((a-(g[0]+g[1])/2)%TAU+TAU+PI)%TAU-PI;return Math.abs(d)<(g[1]-g[0])/2;});
 const rm=(r0+r1)/2,h=Math.max(.15,(r1-r0)/2),n=Math.max(12,Math.round(TAU*rm/.35));
 for(let i=0;i<n;i++){const a=(i+.5)/n*TAU;if(inGap(a))continue;const x=cx+Math.cos(a)*rm,z=cz+Math.sin(a)*rm;ytWalkBlock(x-h,x+h,z-h,z+h,y0,y1);}}
function ytWalkStrip(ax,az,ay,bx,bz,by,w){if(PLACE_DRY||typeof KWALK==='undefined'||!CURREC)return;const A=new THREE.Vector3(ax,ay,az).applyMatrix4(CM),B=new THREE.Vector3(bx,by,bz).applyMatrix4(CM);
 KWALK.strip({a:[A.x,A.z,A.y],b:[B.x,B.z,B.y],w,name:'ramp',tag:'ramp:'+CURKEY});}
function ytWalkTarget(name,x,y,z,o){if(PLACE_DRY||!CURREC)return;const V=new THREE.Vector3(x,y,z).applyMatrix4(CM);(CURREC.walkTargets=CURREC.walkTargets||[]).push({name,x:+V.x.toFixed(2),y:+V.y.toFixed(2),z:+V.z.toFixed(2),opt:!!(o&&o.opt)});}
/* the walls that reach the ground (a pit's, an open trench's) stand this proud of it: a low kerb of slab, so their tops
   never lie in the ground's plane (z-fighting at a distance) */
const YT_KERB=.05;
/* a round pit's dry slab wall between radii r0 and r1, from the floor y0 to the ground, broken by gaps [{ga, w}] (the
   doorways that come in at floor level or below) */
function ytPitWall(r0,r1,y0,gaps){ytWalkRing(0,0,r0,r1,y0,y0+2.4,gaps);const gs=gaps.map(q=>{const g=Math.asin(Math.min(.95,q.w/2/r0));return [((q.ga-g)%TAU+TAU)%TAU,2*g];}).sort((a,b)=>a[0]-b[0]);
 for(let i=0;i<gs.length;i++){const s=gs[i][0]+gs[i][1],e=i+1<gs.length?gs[i+1][0]:gs[0][0]+TAU;if(e-s>.03)sector('slab',0,0,r0,r1,s,e,y0,YT_KERB,P('slab'),Math.max(3,Math.round((e-s)*7)));}}
/* the part of a circle of radius r behind the chord z = zE, as an outline (x,z) running with the angle (outward faces) */
function ytSegment(r,zE,n){const q=Math.asin(clamp(zE/r,-1,1)),s=PI-q,e=TAU+q,P=[];
 for(let i=0;i<=n;i++){const a=s+(e-s)*i/n;P.push([Math.cos(a)*r,Math.sin(a)*r]);}return P;}
/* the soapstone lamp: a half-moon dish of fat (musk ox and caribou), its wick a line of flame along the straight edge,
   on a low larch stand; its light is a halo (91n-night.js) */
function ytLamp(x,y,z,ry){W(x,y,z,ry||0,()=>{
 box('larch',0,0,0,.5*YT_S,.08,.3*YT_S,P('larch'));
 ellip('soap',0,.1,0,.26*YT_S,.06,.15*YT_S,P('ice'),0,14);
 ellip('plain',0,.14,0,.22*YT_S,.012,.12*YT_S,P('fat'),0,12);
 box('glow',0,.15,.1*YT_S,.32*YT_S,.035,.02,P('flame'));
 haloAt(0,.24,.1*YT_S,0xffb060);});}
/* the crown vent: a soapstone sleeve from y0 to y1 (through lining and shell), a collar round its mouth, its stopper lifted
   on three antler pins (the vent open) */
function ytCrownVent(r,y0,y1){ytSweep('soap',[[r,y0],[r,y1]],0,TAU,12,P('ice'),false,0);ring('soap',0,y1,0,r+.04,.05,P('ice'));
 cyl('soap',0,y1+.16,0,r*.9,.08,P('ice'),12);for(const a of [0,TAU/3,2*TAU/3])pole('horn',[Math.cos(a)*r*.7,y1,Math.sin(a)*r*.7],[Math.cos(a)*r*.7,y1+.17,Math.sin(a)*r*.7],.015,P('bone'));}
/* an ice lens through a dome (R, H: the outer section) at height y on the side at angle a, long enough to pass the shell
   and the lining (len), radius rl; off pushes it out through a coat */
function ytIceWindow(R,H,y,a,len,rl,off){const r=ytCatR(R,H,y)+(off||0),sl=Math.sinh(r/ytCatA(R,H)),tilt=Math.atan(sl);
 WX(Math.cos(a)*r,y,Math.sin(a)*r,Math.atan2(Math.cos(a),Math.sin(a)),tilt,0,()=>{cyl('ice',0,-len,0,rl,len+.05,P('ice'),18);
  ring('slab',0,.03,0,rl+.03,.05,P('slab'));});}
/* ---------------------------------------------------------------- the wall's layers and the frost rule (PLAN.md section 4)
   A layer is {k, m}: its kind and thickness in metres, inside to outside. YT_K is each kind's conductivity (W/m K, the
   survey's figures) or, for a still air gap, its resistance (m2 K/W, R). */
const YT_K={hide:.1,air:{R:.18},pycrete:1.5,stone:2.6,soap:3,earth:1.2,moss:.06,turf:.45,snow:.2,felt:.045,fur:.05,larch:.12};
function ytR(L){return L.reduce((a,l)=>{const k=YT_K[l.k];return a+(k&&k.R?k.R:l.m/(k||1));},0);}
/* the layers of a wall: kind 'pycrete' (a lined pycrete dome), 'store' (unlined pycrete: a cold room), 'stone' (a stone
   house: the slab mass faces the room, moss and turf outside it), by season; the coat counts only where it lies */
function ytLayers(kind,season,o){o=o||{};const L=[];
 if(kind==='pycrete'){L.push({k:'hide',m:.01},{k:'air',m:o.gap||.18},{k:'pycrete',m:o.t||.45});}
 else if(kind==='store'){L.push({k:'pycrete',m:o.t||.45});}
 else if(kind==='stone'){L.push({k:'stone',m:o.t||.6},{k:'moss',m:.25},{k:'turf',m:.2});}
 if(season==='winter'&&kind!=='stone')L.push({k:'snow',m:.3,where:'base'});
 if(season==='winter'&&kind==='stone')L.push({k:'snow',m:.3,where:'base'});
 if(season==='summer'&&kind!=='stone')L.push({k:'moss',m:.1},{k:'turf',m:.2});
 return L;}
/* the frost rule: the inner face of a heated pycrete shell stays below 0 C. Inside air at the crown tIn (warm air pools
   there), at the base tBase (the cold trap keeps the floor's air cold), outside tOut; the coat 'base' counts only at the
   base. Returns {crown, base: {t, ok}, ok}. The survey's rule of thumb (outer resistance under 1.6 times the inner) is this
   with the shell's own resistance left out. */
function ytFrost(L,o){o=o||{};const tOut=o.tOut===undefined?-19:o.tOut,tIn=o.tIn===undefined?14:o.tIn,tBase=o.tBase===undefined?3:o.tBase,FILM_IN=.13,FILM_OUT=.04;
 const i=L.findIndex(l=>l.k==='pycrete');if(i<0)return {ok:true,none:true};
 const zone=(where,t)=>{const rin=FILM_IN+ytR(L.slice(0,i)),rsh=ytR([L[i]]),rout=FILM_OUT+ytR(L.slice(i+1).filter(l=>!l.where||l.where===where));
  const tf=tOut+(t-tOut)*(rsh+rout)/(rin+rsh+rout);return {t:+tf.toFixed(1),ok:tf<0};};
 const crown=zone('crown',tIn),base=zone('base',tBase);return {crown,base,ok:crown.ok&&base.ok};}
