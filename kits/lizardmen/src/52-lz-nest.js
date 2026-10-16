// prefix: ln
// ================================================================= THE NEST HALL AND HOSPICE: where the cycle turns from old to new to old
// A Fermat spiral (DESIGN.md section 4): two interleaved arms that meet at the centre. The in-arm is a chain of incubation
// chambers where the hosts lie; the eggs are at the turn, in the centre chamber; the out-arm carries the new out. The
// pathogen is spore-like, so the hall borrows the Rift's spore flora: the chambers are grown domes in a grey-green skin,
// bulging, buttressed by horns, joined by swellings. Every caste uses it, so its mouths carry nested portals.
// Frame: origin on the ground at the plot centre, +z the front (the in-arm's mouth is at the front right, the out-arm's at
// the back left: the two ends of one Fermat spiral r = +-a sqrt(theta)).
/* a grown chamber: a bulging dome (a lathe) in the spore skin, r at the foot, with o.n horn buttresses and a bulge at the top */
function lnDome(x,z,r,o){o=o||{};const h=r*1.1,col=o.col||P('spore');
 W(x,0,z,0,()=>{lzDome(0,0,[[r*.92,0],[r*1.06,h*.3],[r*1.0,h*.6],[r*.7,h*.86],[r*.3,h*1.04],[0,h*1.1]],{mk:'earth',col,seg:16,doors:o.doors});
  const n=o.n||5;for(let i=0;i<n;i++){const a=i*TAU/n+(o.a0||0),bx=Math.cos(a)*r*1.0,bz=Math.sin(a)*r*1.0;
   if((o.doors||[]).some(d=>Math.abs((((a-(PI/2-d.ry))%TAU)+TAU+PI)%TAU-PI)<.7))continue;lzHorn(bx,0,bz,Math.atan2(-bx,-bz),r*1.1,r*.14,{curl:.45,lean:-.35,mk:'bones',nt:7,ns:6});}
  if(o.eye)lzEye(0,h*.95,r*.3,0,r*.14,{mk:'ivory'});});}
/* the way one chamber faces another: the yaw of the direction from p to q */
function lnFace(p,q){return Math.atan2(q[0]-p[0],q[1]-p[1]);}
defBuilding({key:'lz-nest',name:'Nest hall and hospice',seed:7101,caste:'all',cut:true,w:38,d:34,h:9,budget:160000,
 tags:{types:['religious','civic'],wealth:'rich',role:'nursery'},
 note:'the nest hall: a Fermat spiral of grown chambers, the in-arm (hosts on basking slabs, mid-transfer) winding in to the egg chamber at the centre (seven clutch cradles) and the out-arm winding out; spore-grey skin, bone buttresses, nested portals at both mouths',
 build(o){const a=4.6,N=7;lzCutFloor(0);
  const arm=(sg)=>{const pts=[];for(let k=N;k>=1;k--){const th=k*.78+.9,r=a*Math.sqrt(th)*sg;pts.push([Math.cos(th)*r,Math.sin(th)*r,1.4+k*.17]);}return pts;};
  const A=arm(1),B=arm(-1);
  box('earthR',0,0,0,37,.1,33,P('earthP'));
  /* the centre: the egg chamber, the biggest, with the whorl of the Coil on its crown */
  const dhP=lzDoorH(6);
  lnDome(0,0,4.8,{n:9,col:P('spore'),eye:true,doors:[{dh:dhP,ry:lnFace([0,0],A[A.length-1])},{dh:dhP,ry:lnFace([0,0],B[B.length-1])}]});
  for(const [pts,sg] of [[A,1],[B,-1]]){for(let i=0;i<pts.length;i++){const p=pts[i];const mouth=i===0,next=i<pts.length-1?pts[i+1]:[0,0];
    const doors=[{dh:dhP,ry:lnFace(p,next)}];if(mouth)doors.push({dh:dhP,ry:Math.atan2(p[0],p[1])});else doors.push({dh:dhP,ry:lnFace(p,pts[i-1])});
    lnDome(p[0],p[1],p[2],{n:i%2?5:7,a0:i*.9,doors});
   /* the swelling that joins each chamber to the next (and the last to the centre) */
   /* the passage to the next chamber (and from the last to the centre): a tunnel the door's size */
   const q=i<pts.length-1?pts[i+1]:[0,0,4.8];const dh=Math.min(dhP,Math.min(p[2],q[2])*1.1*.8);lzPassage(p,q,dh,dh*.62,'earth',P('spore'));}
   /* the mouth: the outermost chamber's portal, facing away from the centre */
   const m=pts[0],ang=Math.atan2(m[0],m[1]),dh=lzDoorH(6),dw=dh*.62,mx=m[0]+Math.sin(ang)*m[2]*.9,mz=m[1]+Math.cos(ang)*m[2]*.9;
   lzNoCut(()=>{W(mx,0,mz,ang,()=>{lzPortal(0,0,.1,0,dh,{mk:'bronze',eye:sg>0});box('basalt',0,0,.5,dw+.6,.16,.7,P('basaltD'));});});}
  /* inside: the hosts lie on basking slabs along the in-arm; the eggs in their cradles at the centre; the new leave by the out-arm */
  for(let i=2;i<A.length;i++){const p=A[i];FURNISH('lizardmen_common_bed',p[0]*.98,.1,p[1]*.98,Math.atan2(-p[0],-p[1]),{v:1});}
  for(let i=0;i<7;i++){const an=i*TAU/7,r=i?1.9:0;FURNISH('lizardmen_court_egg_cradle',Math.cos(an)*r,.1,Math.sin(an)*r,-an);}
  FURNISH('lizardmen_court_hearth',0,.1,-3.1,0);FURNISH_HANG('lizardmen_court_hanging',0,4.2,0,0);
  for(let i=2;i<B.length;i++){const p=B[i];FURNISH('lizardmen_common_rug',p[0]*.95,.1,p[1]*.95,0);}
  FURNISH('lizardmen_common_desk',A[1][0],.1,A[1][1],Math.atan2(-A[1][0],-A[1][1]));FURNISH('generic_medicine',A[1][0]*.9+.8,.1,A[1][1]*.9,0);
  lzDust(A[0][0]*1.2,A[0][1]*1.2,2.5);}});
