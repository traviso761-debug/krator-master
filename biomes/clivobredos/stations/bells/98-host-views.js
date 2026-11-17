// ================================================================= HOST — the Bells' views (99-host-take.js calls STATION_VIEWS)
const STATION_VIEWS=function(add,o){const {gh,look}=o,B=LUNG_L.bells.filter(b=>b.live).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x)||(a.id<b.id?-1:1)),B0=B[0];
 if(B0){const f=B0.face,cx=B0.x+f[0]*B0.r*5,cz=B0.z+f[1]*B0.r*5;
  add('The bells among the crowns at dawn',[cx-f[1]*30,Math.max(gh(cx,cz,30),B0.y+B0.r*2),cz+f[0]*30,B0.x,B0.y+B0.r,B0.z],{hour:6.6});
  add('Into a bell: the fringe streams inward at noon',[B0.x+f[0]*B0.r*2.2,B0.y+B0.r*3.2,B0.z+f[1]*B0.r*2.2,B0.x,B0.y+B0.r*.8,B0.z],{hour:12.5});
  add('The cold breath: a winter dawn',[cx+f[1]*20,Math.max(gh(cx,cz,18),B0.y+B0.r),cz-f[0]*20,B0.x,B0.y+B0.r,B0.z],{hour:5,day:MIDWINTER});
  const l=LUNG_L.lungs.find(q=>q.id===B0.lung),tip=l.pts[0];
  add('The lungs climbing into the cloud',[cx,Math.max(gh(cx,cz,6),B0.y),cz,tip[0],tip[1],tip[2]]);}
 add('From afar',look(-2300,-2300,250,300,600,300));};
