// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (no apostrophe or colon in a name:
// tools/check_views.py), and the town's budget. Points are given in the shore frame (u along the shore, v inland: KS_GROUND).
const ksAt=(u,v)=>KS_GROUND.at(u,v);
function ksEye(u,v,tu,tv,dy){const P=ksAt(u,v),Q=ksAt(tu,tv);return[P[0],terrainH(P[0],P[1])+1.7+ksD(dy,0),P[1],Q[0],terrainH(Q[0],Q[1])+4,Q[1]];}
const VIEWS=(function(){const V={};
 {const a=ksAt(60,-900),b=ksAt(60,300);V['Overview']=[a[0],420,a[1],b[0],0,b[1]];}
 {const a=ksAt(0,250),b=ksAt(0,445);V['The town from above']=[a[0],1150,a[1],b[0],0,b[1]];}   /* the walled square nearly straight down: the blocks and the garden squares */
 {const g=KS_PLAN&&(KS_PLAN.gardens||[]).find(q=>q.id==='governor');if(g){const a=ksAt(g.c[0]-g.nu*4-24,g.c[1]-g.nv*4-24),b=ksAt(g.c[0],g.c[1]);
  V['The Governors garden']=[a[0],g.y+32,a[1],b[0],g.y,b[1]];}}   /* from over its lakeward corner, down its rills */
 V['The harbour']=ksEye(-60,60,-60,-160,4);
 {const a=ksAt(KS_GROUND.HARBOUR.u1+130,-90),b=ksAt(KS_GROUND.HARBOUR.u1+40,-10);V['The drydock and the warehouses']=[a[0],26,a[1],b[0],2,b[1]];}   /* from over the shallows east of the dock, back along the waterfront */
 {const a=ksAt(KS_GROUND.HARBOUR.u1-110,KS_GROUND.HARBOUR.v0-14),b=ksAt(-60,250);V['From the lighthouse']=[a[0],30,a[1],b[0],8,b[1]];}   /* beside the lantern, over the mole, toward the town */
 const PL=KS_PLAN&&KS_PLAN.places,LG=PL?PL.lakeGate:[-60,84],BZ=PL?PL.bazaar:[-60,430],SG=PL?PL.strongbowGate:[346,300];
 V['The Lamp Way']=ksEye(LG[0]+4,LG[1]+40,BZ[0],BZ[1]-40,0);
 V['The bazaar']=ksEye(BZ[0]+24,BZ[1]+26,BZ[0]-10,BZ[1]-10,0);
 V['The Lake Gate from the quay street']=ksEye(LG[0]-26,LG[1]-50,LG[0],LG[1],1);
 {const C=KS_PLAN&&KS_PLAN.wall&&KS_PLAN.wall.corners[0];if(C){const c=[KS_GROUND.u(C.x,C.z),KS_GROUND.v(C.x,C.z)];
  V['The wall from outside the corner bastion']=ksEye(c[0]-60,c[1]-55,c[0]+40,c[1]+150,3);}}
 V['The latex house']=ksEye(-445,560,-445,640,2);
 V['The serai and the Strongbow Gate']=ksEye(SG[0]+150,SG[1]+40,SG[0],SG[1],0);
 V['The tea factory and the fermentaries']=ksEye(-360,620,-300,712,6);
 {const B=KS_PLAN&&KS_PLAN.bridge;if(B){const a=ksAt(B.u0-70,B.v+150),c=[(B.a[0]+B.b[0])/2,(B.a[1]+B.b[1])/2];V['The bridge over Keb Riwa']=[a[0],terrainH(a[0],a[1])+25,a[1],c[0],B.deck-2,c[1]];}}   /* upstream of it, on the bank, the river under its spans */
 {const a=ksAt(KS_GROUND.HARBOUR.u1-110,KS_GROUND.HARBOUR.v0-14),L=KS_GROUND.fall.lip;V['The cataract from the mole']=[a[0],30,a[1],L[0],L[1]-900,L[2]];}   /* over the town's roofs, from above the mole beside the lighthouse */
 V['The White Monastery']=ksEye(260,740,330,840,0);
 {const R=KS_RINGV.find(v=>v.id==='ks.ring.mil');if(R&&R.site){const s=R.site;V['The ring village Mil']=[s.x+180,terrainH(s.x+180,s.z-220)+60,s.z-220,s.x,terrainH(s.x,s.z)+2,s.z];}}
 {const R=KS_RINGV.find(v=>v.id==='ll.hamlet.jal');if(R&&R.site){const s=R.site,L=R.shore||{x:s.x-100,z:s.z-100,ux:-1,uz:-1},c=[L.x+L.ux*140-L.uz*90,L.z+L.uz*140+L.ux*90];V['The fishing hamlet Jal']=[c[0],22,c[1],s.x,terrainH(s.x,s.z)+2,s.z];}}   /* from the water off its quay */
 {const a=ksAt(1400,-1400),b=ksAt(0,350);V['From the lake']=[a[0],12,a[1],b[0],10,b[1]];}
 return V;})();
// the town as one budget (as Qiblai's): every type in the class 'city'
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
