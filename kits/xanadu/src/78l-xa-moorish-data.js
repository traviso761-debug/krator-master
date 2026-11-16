// ================================================================= XANADU — the Moorish and Mughal parameters (Erewhon's citadel, 2026-11-09)
// [G data]: plain functions of numbers, no THREE, no DOM. The shapes 78m-xa-moorish.js draws and Godot builds from the same
// numbers: an arch's opening, a muqarnas hood's or cornice's cells, a star-polygon ceiling's panels and ribs, a pointed barrel.
const XMOOR={
 // an arch's opening in a unit frame: the span x in [-.5,.5], y up from the springing (0). Returns [[x,y],...] from the
 // left springing over the crown to the right one. kind: 'pointed' (two-centred, e .25), 'horseshoe' (the Moorish pointed
 // horseshoe: the arcs run on below their widest point, so the opening is narrower at the springing, .84), 'cusped' (the
 // Mughal multifoil: a pointed arch with o.lobes (7) lobes, the cusps pointing in)
 arch(kind,o){o=o||{};const M=(o.n==null?24:o.n),P=[];
  // the left arc about (e, yc) from the springing (y=0) up to the crown, then mirrored
  if(kind==='horseshoe'){const e=.12,yc=.3,r=.62,t0=Math.PI+Math.asin(yc/r),t1=Math.acos(-e/r);for(let i=0;i<=M;i++){const t=t0+(t1-t0)*i/M;P.push([e+r*Math.cos(t),yc+r*Math.sin(t)]);}}
  else{const e=.25,r=.5+e,t1=Math.acos(-e/r);for(let i=0;i<=M;i++){const t=Math.PI-(Math.PI-t1)*i/M;P.push([e+r*Math.cos(t),r*Math.sin(t)]);}}
  const L=P.slice();for(let i=L.length-2;i>=0;i--)L.push([-L[i][0],L[i][1]]);
  if(kind==='cusped'){const n=(o.lobes==null?7:o.lobes),A=o.cusp==null?.07:o.cusp;const out=[];
   for(let i=0;i<L.length;i++){const t=i/(L.length-1),a=L[Math.max(0,i-1)],b=L[Math.min(L.length-1,i+1)];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;
    // the inward normal points toward the opening's middle (0, .3)
    if(nx*(0-L[i][0])+ny*(.3-L[i][1])<0){nx=-nx;ny=-ny;}const k=Math.pow(1-Math.abs(Math.sin(Math.PI*n*t)),2)*A*(t<.02||t>.98?0:1);out.push([L[i][0]+nx*k,L[i][1]+ny*k]);}
   return out;}
  return L;},
 // the crown's height of an arch in the unit frame (the opening's top above the springing)
 crown(kind){const P=XMOOR.arch(kind);let m=0;for(const p of P)m=Math.max(m,p[1]);return m;},
 // a muqarnas hood over a recess w wide and d deep, from its springing up h, in tiers: the cells stand on semicircles about
 // the middle of the opening (0, d), each tier's ring smaller and higher, alternate tiers staggered half a cell. Frame: x
 // across, z from the back wall (0) out to the opening (d), y up from the springing. -> [{x,y,z,a (yaw to face the middle),
 // w, h, d, tier}]
 muqHood(w,d,h,tiers,cellW){const T=(tiers==null?5:tiers),C=(cellW==null?1.1:cellW),out=[],R0=Math.min(w/2,d),th=h/T;
  for(let k=0;k<T;k++){const R=R0*(1-k/T)*.98,Rn=R0*(1-(k+1)/T),n=Math.max(2,Math.round(Math.PI*R/C)),cw=Math.PI*R/n*1.04;
   for(let i=0;i<n;i++){const f=(i+.5+(k%2?.25:-.25)*0)/n,ph=-Math.PI/2+Math.PI*f,x=Math.sin(ph)*R*(w/2)/R0,z=d-Math.cos(ph)*R;
    out.push({x,y:k*th,z,a:Math.atan2(-x,d-z),w:cw,h:th*1.08,d:Math.max(.35,R-Rn+cw*.25),tier:k});}}
  return out;},
 // a muqarnas cornice along a wall of length L: T tiers of cells, each tier stepping dz out from the wall and th down
 // -> [{u (along the wall), y (from the cornice's top, negative), o (out from the wall), w, h, d, tier}]
 muqCornice(L,tiers,cellW,th,dz){const T=(tiers==null?2:tiers),C=(cellW==null?.9:cellW),TH=(th==null?.45:th),DZ=(dz==null?.32:dz),out=[];
  for(let k=0;k<T;k++){const n=Math.max(1,Math.round(L/C)),cw=L/n;for(let i=0;i<n;i++)out.push({u:-L/2+cw*(i+.5)+(k%2?cw/2:0)*(i<n-1?1:0),y:-(k+1)*TH,o:DZ*(T-1-k),w:cw*1.02,h:TH*1.05,d:DZ+.18,tier:k});}
  return out;},
 // a star-polygon ceiling of n points in a unit square ([-.5,.5] both ways): the central star, the ring of darts between its
 // points, the outer kites; each panel's polygon [[x,z],...] and its relief (how far below the ceiling it hangs); the ribs are
 // every panel edge once. -> {panels: [{role: 'star'|'dart'|'kite', pts, drop}], ribs: [[[x,z],[x,z]], ...]}
 star(n){n=(n==null?8:n);const S=.5/2.05,ri=.55,ro=1.48,rf=2.0,ang=i=>i*2*Math.PI/n,P=(r,a)=>[r*Math.cos(a)*S,r*Math.sin(a)*S],panels=[];
  const star=[];for(let i=0;i<n;i++){star.push(P(1,ang(i)));star.push(P(ri,ang(i+.5)));}panels.push({role:'star',pts:star,drop:.24});
  for(let i=0;i<n;i++){panels.push({role:'dart',pts:[P(1,ang(i)),P(ro,ang(i+.5)),P(1,ang(i+1)),P(ri,ang(i+.5))],drop:.16});
   panels.push({role:'kite',pts:[P(1,ang(i)),P(ro,ang(i-.5)),P(rf,ang(i)),P(ro,ang(i+.5))],drop:.08});}
  const seen=new Set(),ribs=[];for(const p of panels)for(let i=0;i<p.pts.length;i++){const a=p.pts[i],b=p.pts[(i+1)%p.pts.length],k=[a,b].map(q=>q[0].toFixed(4)+','+q[1].toFixed(4)).sort().join('|');if(seen.has(k))continue;seen.add(k);ribs.push([a,b]);}
  return{panels,ribs};},
 // a pointed barrel's section in a unit frame (span x [-.5,.5], rise to 1 at the crown) as a polyline, for the vault and its ribs
 barrel(n){const P=XMOOR.arch('pointed',{n:(n==null?12:n)}),c=XMOOR.crown('pointed');return P.map(p=>[p[0],p[1]/c]);},
};

