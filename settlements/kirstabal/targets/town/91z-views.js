// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (no apostrophe or colon in a name:
// tools/check_views.py), and the town's budget. Points are given in the shore frame (u along the shore, v inland: KS_GROUND).
const ksAt=(u,v)=>KS_GROUND.at(u,v);
function ksEye(u,v,tu,tv,dy){const P=ksAt(u,v),Q=ksAt(tu,tv);return[P[0],terrainH(P[0],P[1])+1.7+ksD(dy,0),P[1],Q[0],terrainH(Q[0],Q[1])+4,Q[1]];}
const VIEWS=(function(){const V={};
 {const a=ksAt(60,-900),b=ksAt(60,300);V['Overview']=[a[0],420,a[1],b[0],0,b[1]];}
 V['The harbour']=ksEye(-60,60,-60,-160,4);
 {const a=ksAt(KS_GROUND.HARBOUR.u1-110,KS_GROUND.HARBOUR.v0-14),b=ksAt(-60,250);V['From the lighthouse']=[a[0],30,a[1],b[0],8,b[1]];}   /* beside the lantern, over the mole, toward the town */
 V['The Lamp Way']=ksEye(-60,90,-60,390,0);
 V['The bazaar']=ksEye(-20,470,-60,430,0);
 V['The latex house']=ksEye(-445,560,-445,640,2);
 V['The serai and the north gate']=ksEye(470,300,690,236,0);
 {const B=KS_PLAN&&KS_PLAN.bridge;if(B){const a=ksAt(B.u0-70,B.v+150),c=[(B.a[0]+B.b[0])/2,(B.a[1]+B.b[1])/2];V['The bridge over Keb Riwa']=[a[0],terrainH(a[0],a[1])+25,a[1],c[0],B.deck-2,c[1]];}}   /* upstream of it, on the bank, the river under its spans */
 {const a=ksAt(KS_GROUND.HARBOUR.u1-110,KS_GROUND.HARBOUR.v0-14),L=KS_GROUND.fall.lip;V['The cataract from the mole']=[a[0],30,a[1],L[0],L[1]-900,L[2]];}   /* over the town's roofs, from above the mole beside the lighthouse */
 V['The White Monastery']=ksEye(260,740,330,840,0);
 {const R=KS_RINGV.find(v=>v.id==='ks.ring.mil');if(R&&R.site){const s=R.site;V['The ring village Mil']=[s.x+180,terrainH(s.x+180,s.z-220)+60,s.z-220,s.x,terrainH(s.x,s.z)+2,s.z];}}
 {const a=ksAt(1400,-1400),b=ksAt(0,350);V['From the lake']=[a[0],12,a[1],b[0],10,b[1]];}
 return V;})();
// the town as one budget (as Qiblai's): every type in the class 'city'
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
