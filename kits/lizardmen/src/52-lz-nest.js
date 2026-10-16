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
 W(x,0,z,0,()=>{lathe('earth',0,0,[[r*.92,0],[r*1.06,h*.3],[r*1.0,h*.6],[r*.7,h*.86],[r*.3,h*1.04],[0,h*1.1]],16,col,{});
  const n=o.n||5;for(let i=0;i<n;i++){const a=i*TAU/n+(o.a0||0),bx=Math.cos(a)*r*1.0,bz=Math.sin(a)*r*1.0;lzHorn(bx,0,bz,Math.atan2(-bx,-bz),r*1.1,r*.14,{curl:.45,lean:-.35,mk:'bones',nt:7,ns:6});}
  if(o.eye)lzEye(0,h*.95,r*.3,0,r*.14,{mk:'ivory'});});}
defBuilding({key:'lz-nest',name:'Nest hall and hospice',seed:7101,caste:'all',cut:true,w:34,d:30,h:9,budget:160000,
 tags:{types:['religious','civic'],wealth:'rich',role:'nursery'},
 note:'the nest hall: a Fermat spiral of grown chambers, the in-arm (hosts on basking slabs, mid-transfer) winding in to the egg chamber at the centre (seven clutch cradles) and the out-arm winding out; spore-grey skin, bone buttresses, nested portals at both mouths',
 build(o){const a=4.6,N=7;lzCutFloor(0);
  const arm=(sg)=>{const pts=[];for(let k=N;k>=1;k--){const th=k*.78,r=a*Math.sqrt(th)*sg;pts.push([Math.cos(th)*r,Math.sin(th)*r,1.5+k*.17]);}return pts;};
  const A=arm(1),B=arm(-1);
  box('earthR',0,0,0,33,.1,29,P('earthP'));
  /* the centre: the egg chamber, the biggest, with the whorl of the Coil on its crown */
  lnDome(0,0,4.2,{n:9,col:P('spore'),eye:true});
  for(const [pts,sg] of [[A,1],[B,-1]]){for(let i=0;i<pts.length;i++){const p=pts[i];lnDome(p[0],p[1],p[2],{n:i%2?5:7,a0:i*.9});
   /* the swelling that joins each chamber to the next (and the last to the centre) */
   const q=i<pts.length-1?pts[i+1]:[0,0,4.2];const mx=(p[0]+q[0])/2,mz=(p[1]+q[1])/2,rr0=Math.min(p[2],q[2])*.85;ellip('earth',mx,0,mz,rr0,rr0*.55,rr0,P('spore'),0,10);}
   /* the mouth: the outermost chamber's portal, facing away from the centre */
   const m=pts[0],ang=Math.atan2(m[0],m[1]),dh=lzDoorH(6),dw=dh*.62,mx=m[0]+Math.sin(ang)*m[2]*.9,mz=m[1]+Math.cos(ang)*m[2]*.9;
   lzNoCut(()=>{W(mx,0,mz,ang,()=>{poly('plain',[[-dw/2,0,.02],[dw/2,0,.02],[0,dh,-.1]],P('black'),true);lzPortal(0,0,.06,0,dh,{mk:'bronze',eye:sg>0});box('stoneP',0,0,.5,dw+.6,.16,.7,P('basaltD'));});});
   door(mx,0,mz,ang,dw);}
  /* inside: the hosts lie on basking slabs along the in-arm; the eggs in their cradles at the centre; the new leave by the out-arm */
  for(let i=2;i<A.length;i++){const p=A[i];FURNISH('lizardmen_common_bed',p[0]*.98,.1,p[1]*.98,Math.atan2(-p[0],-p[1]),{v:1});}
  for(let i=0;i<7;i++){const an=i*TAU/7,r=i?2.2:0;FURNISH('lizardmen_court_egg_cradle',Math.cos(an)*r,.1,Math.sin(an)*r,-an);}
  FURNISH('lizardmen_court_hearth',0,.1,-3.1,0);FURNISH_HANG('lizardmen_court_hanging',0,4.2,0,0);
  for(let i=2;i<B.length;i++){const p=B[i];FURNISH('lizardmen_common_rug',p[0]*.95,.1,p[1]*.95,0);}
  FURNISH('lizardmen_common_desk',A[1][0],.1,A[1][1],Math.atan2(-A[1][0],-A[1][1]));FURNISH('generic_medicine',A[1][0]*.9+.8,.1,A[1][1]*.9,0);
  lzDust(A[0][0]*1.2,A[0][1]*1.2,2.5);}});
