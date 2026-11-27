// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (no apostrophe or colon in a name:
// tools/check_views.py), and the town's budget. Points are given in the shore frame (u along the shore, v inland: GH_GROUND).
const ghAt=(u,v)=>GH_GROUND.at(u,v);
function ghEye(u,v,tu,tv,dy){const P=ghAt(u,v),Q=ghAt(tu,tv);return[P[0],terrainH(P[0],P[1])+1.7+ghD(dy,0),P[1],Q[0],terrainH(Q[0],Q[1])+4,Q[1]];}
const VIEWS=(function(){const V={};
 {const a=ghAt(60,-1300),b=ghAt(60,600);V['Overview']=[a[0],620,a[1],b[0],0,b[1]];}
 {const a=ghAt(0,500),b=ghAt(0,705);V['The town from above']=[a[0],1700,a[1],b[0],0,b[1]];}
 const PL=GH_PLAN&&GH_PLAN.places,LG=PL?PL.lakeGate:[0,154],BZ=PL?PL.bazaar:[-60,640],RG=PL?PL.riverGate:[546,700],WG=PL?PL.westGate:[-546,700],FC=PL?PL.fc:[400,400];
 const FB=GH_PLAN&&GH_PLAN.fc?GH_PLAN.fc.box:[265,265,530,530],FY=GH_PLAN&&GH_PLAN.fc&&GH_PLAN.fc.terrace?GH_PLAN.fc.terrace.y:30;
 {const a=ghAt(FB[0]-170,FB[1]-170),b=ghAt(FC[0],FC[1]);V['The forbidden city']=[a[0],FY+95,a[1],b[0],FY,b[1]];}   /* from over the town to its north-west, down onto its wall and its courts */
 {const g=(GH_PLAN&&GH_PLAN.fc&&GH_PLAN.fc.grid.gates||[]).find(q=>q.side==='v-');if(g){const q=[GH_GROUND.u(g.x,g.z),GH_GROUND.v(g.x,g.z)];V['The forbidden city north gate']=ghEye(q[0],q[1]-80,q[0],q[1],2);}}
 {const m=GH_PLAN&&GH_PLAN.extra.find(r=>r.id==='gh.fc.mint');if(m){const q=[GH_GROUND.u(m.x,m.z),GH_GROUND.v(m.x,m.z)];V['The Mint and the assessors']=[m.x+50,FY+14,m.z-40,m.x+25,FY+4,m.z];}}
 {const t=GH_PLAN&&GH_PLAN.lots.find(r=>r.id==='gh.temple');if(t){const fx=Math.sin(t.ry),fz=Math.cos(t.ry);V['The temple in gold and opal']=[t.x+fx*120+fz*30,t.y+34,t.z+fz*120-fx*30,t.x,t.y+18,t.z];}}
 V['The harbour']=ghEye(-60,80,-60,-160,4);
 V['The bazaar']=ghEye(BZ[0]+28,BZ[1]+30,BZ[0]-10,BZ[1]-10,0);
 V['The Lake Gate from the quay street']=ghEye(LG[0]-30,LG[1]-90,LG[0],LG[1],1);
 {const B=GH_PLAN&&GH_PLAN.bridge;if(B){const c=[(B.a[0]+B.b[0])/2,(B.a[1]+B.b[1])/2];V['The river front and the bridge']=[c[0]+40,terrainH(c[0]+120,c[1]+260)+30,c[1]+260,c[0],B.deck-2,c[1]];}}
 V['The River Gate']=ghEye(RG[0]+150,RG[1]-40,RG[0],RG[1],2);
 V['The Strongwall quarter']=ghEye(WG[0]-260,WG[1]+40,WG[0]-60,WG[1],14);
 {const C=GH_PLAN&&GH_PLAN.wall&&GH_PLAN.wall.corners[0];if(C){const c=[GH_GROUND.u(C.x,C.z),GH_GROUND.v(C.x,C.z)];V['The wall from outside the corner bastion']=ghEye(c[0]-70,c[1]-60,c[0]+40,c[1]+160,3);}}
 {const R=GH_RINGV.find(v=>v.id==='gh.ring.padi');if(R&&R.site){const s=R.site;V['The ring village Padi']=[s.x+180,terrainH(s.x+180,s.z-220)+60,s.z-220,s.x,terrainH(s.x,s.z)+2,s.z];}}
 {const a=ghAt(1500,-1500),b=ghAt(0,600);V['From the lake']=[a[0],14,a[1],b[0],14,b[1]];}
 return V;})();
BUDGET.showcase={tris:40000000,calls:4000};BUDGET.cls.city=40000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
