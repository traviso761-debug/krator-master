// TARGET: forts — camera presets [camX,camY,camZ, targetX,targetY,targetZ] and the sheet's budget. No apostrophe or colon in a
// view's name (tools/check_views.py, VIEW-NAME). The first entry is the opening shot. A fort's frame: its centre (cx, cz), the gate
// at z +21 (the front, toward +z, the camera's side), the keep at z -6.6, the corral off the left flank, the relay post out on the
// right. The west fort's row is in front (z 0), the south fort's behind it (z -330); the states left to right: kept, damaged, ruined.
const VIEWS=(function(){const V={},at=(id,v)=>{const S=SITES.find(q=>q.key==='xa_fort_watch'&&q.fort===id&&q.o.v===v);return[S.x,S.z];};
 const nm={'march.w':'west','march.s':'south'};
 {const a=at('march.w',1);V['Both forts in their three states']=[a[0]+40,330,a[1]+430,a[0],0,a[1]-165];}
 for(const F of MR.forts)MR.states.forEach((st,v)=>{const c=at(F.id,v);V['The '+nm[F.id]+' fort '+st]=[c[0]+62,38,c[1]+105,c[0],4,c[1]];});
 for(const F of MR.forts){const c=at(F.id,0),n=nm[F.id];
  V['The '+n+' gate and its gun']=[c[0]+9,1.7,c[1]+62,c[0],8,c[1]+21];
  V['The '+n+' keep and its beacon']=[c[0]+46,26,c[1]+58,c[0],17,c[1]-6.6];
  V['The '+n+' stable yard']=[c[0]-32,6,c[1]+70,c[0]-60,1.5,c[1]+30];
  V['The '+n+' relay post']=[c[0]+50,5,c[1]+142,c[0]+64,5,c[1]+120];}
 /* each damaged fort's breach, from outside its curtain: where XFORT.damage put it (the fort's own seed) */
 for(const F of MR.forts){const c=at(F.id,1),D=XFORT.damage(MR.P,'damaged',F.seed),b=D.breaches[0];if(!b)continue;const cu=MR.P.curtains.find(q=>q.id===b.curtain),u=(b.u0+b.u1)/2;
  const m=[c[0]+cu.a[0]+(cu.b[0]-cu.a[0])*u,c[1]+cu.a[1]+(cu.b[1]-cu.a[1])*u],o=cu.out,s=[-o[1],o[0]];
  V['The '+nm[F.id]+' breach']=[m[0]+o[0]*38+s[0]*14,14,m[1]+o[1]*38+s[1]*14,m[0],2.5,m[1]];}
 {const c=at('march.s',2);V['The south ruin from above']=[c[0]+5,95,c[1]+70,c[0],0,c[1]];}
 return V;})();
// the sheet as one budget (as Strongwall's): six forts, their works and posts, every type in the class 'city'
BUDGET.showcase={tris:6000000,calls:1500};BUDGET.cls.city=6000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
