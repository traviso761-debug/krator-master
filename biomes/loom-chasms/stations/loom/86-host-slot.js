// ================================================================= HOST — STATION 3: THE SLOT'S CANOPY (PLAN.md section 4, "The living cables")
// The canopy is src/85-host-canopy.js's (slotCanopy: the anchors by rays at the drawn walls, the records, the builders, the stryders, the checks),
// given this slot (44w: STATION.SLOT, its stepcut STATION.CUT) and the plan's numbers: the grown cables in four tiers 80-150 m over the floor
// (LOOM.SPAN.canopy), a quarter of the stations pioneer shoots, three cable-stryders. Its views are the station's (below).
const SLOT_SITE=(function(){const F=slotCanopy({slot:STATION.SLOT,cut:STATION.CUT,W:99331,prefix:'cable',band:LOOM.SPAN.canopy,tiers:4,low:[40,170],minDepth:100,shootShare:.25,stryders:3,
  lipName:'The slot\'s lip (a fall of 180 m)',lipSign:'the mesa\'s edge, the cables\' tubers on it'});
 const {CABLES,STRYDERS,at,L,lipOff,rimY}=F;
 // ---------------------------------------------------------------- the views (each camera over the drawn ground: 99's check)
 function views(H){const {look}=H,mid=at(L*.5),c2=at(L*.35),g=CABLES.filter(c=>c.stage==='grown'),sh=CABLES.find(c=>c.stage==='shoot'),C0=g[Math.floor(g.length/2)]||CABLES[0];
  const V={};
  {const ex=mid.x+mid.nx*(lipOff+8),ez=mid.z+mid.nz*(lipOff+8),fx=mid.x-mid.nx*(lipOff+10)+mid.ux*120,fz=mid.z-mid.nz*(lipOff+10)+mid.uz*120;   /* across to the far wall, its upper riser */
   V['The slot from its lip']=[ex,solidH(ex,ez)+1.7,ez,fx,rimY(mid)-55,fz];}
  V['Under the canopy']=look(c2.x,c2.z,1.7,c2.x+c2.ux*60,c2.z+c2.uz*60,120);
  V['Along the slot']=[at(40).x,rimY(at(150))+25,at(40).z,at(L*.6).x,rimY(at(L*.6))-90,at(L*.6).z];
  if(C0)V['A cable\'s anchor']=[C0.a[0]+C0.na[0]*14+mid.ux*8,C0.a[1]+4,C0.a[2]+C0.na[2]*14+mid.uz*8,C0.a[0],C0.a[1],C0.a[2]];
  if(sh&&sh.S){const c=at(sh.s),side=(sh.a[0]-c.x)*c.nx+(sh.a[2]-c.z)*c.nz<0?-1:1,ex=c.x+c.nx*side*(lipOff+30)-c.ux*90,ez=c.z+c.nz*side*(lipOff+30)-c.uz*90,top=KSPAN.low(sh.S).p;   /* from the lip behind a shoot's anchor, to the top of its arch */
   V['Pioneer shoots on the up-draft']=[ex,solidH(ex,ez)+2,ez,top[0],top[1],top[2]];}
  if(STRYDERS.length){const d=STRYDERS[0],q=KSPAN.at(d.S,Math.min(1,d.t+.06));V['A cable-stryder asleep']=[q[0],q[1]+2.5,q[2],d.p[0],d.p[1]-.4,d.p[2]];}
  V['The chasm opening below']=look(-900,-300,2,-40000,2000,-1200);
  V['Mount Caelum from the mesa']=look(-600,600,3,-84000,10000,2400);
  V['From afar']=look(-2700,2700,500,1100,0,0);
  return V;}
 F.views=views;return F;})();
