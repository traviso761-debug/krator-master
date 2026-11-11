// ================================================================= HOST — the Stair's views (99-host-take.js calls STATION_VIEWS)
const STATION_VIEWS=function(add,o){const {gh,look}=o,S=LUNG.STAIR&&LUNG_L.lungs.find(l=>l.id===LUNG.STAIR.lung),B=LUNG.BRIDGE;
 if(S){const pts=S.pts.filter(p=>p[1]>1800&&p[1]<2300),p=pts[Math.floor(pts.length/2)]||S.pts[Math.floor(S.pts.length/2)],q=S.pts[S.pts.indexOf(p)-6]||S.pts[0],n=FIELDK.normal(p[0],p[2]);
  add('In the cloud: lungs up a ravine',[p[0]+n[0]*60+40,gh(p[0]+n[0]*60+40,p[2]+n[2]*60-60,25),p[2]+n[2]*60-60,q[0],q[1],q[2]],{hour:8.5});
  add('The lung-stair (bređoladra)',[p[0]+n[0]*(S.r+6)+5,p[1]+n[1]*(S.r+6)+3,p[2]+n[2]*(S.r+6),q[0]+n[0]*S.r,q[1]+n[1]*S.r,q[2]+n[2]*S.r]);
  add('Inside the bore: the ribs climb right-handed',[p[0],p[1]+S.r*.05,p[2],q[0],q[1],q[2]]);
  add('The condensation band at mid-morning',[p[0]+n[0]*150+80,gh(p[0]+n[0]*150+80,p[2]+n[2]*150,40),p[2]+n[2]*150,p[0],p[1],p[2]],{hour:9.5});
  add('Noon on the face: the draw',[p[0]+n[0]*90-50,gh(p[0]+n[0]*90-50,p[2]+n[2]*90,30),p[2]+n[2]*90,q[0],q[1],q[2]],{hour:12.5});}
 if(B){const mx=(B.a[0]+B.b[0])/2,mz=(B.a[2]+B.b[2])/2;add('The husk bridge',look(mx-30,mz-50,12,mx,mz,0).map((v,i)=>i===4?B.a[1]:v));}
 add('Up the face from the cloud',look(0,rimZ(0)-SCARP.run*.85,40,0,rimZ(0)-SCARP.run*.3,60));
 add('From afar',look(-2300,-2300,200,300,800,40));};
