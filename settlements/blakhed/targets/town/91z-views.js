// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the town's budget. No apostrophe or colon in a view's
// name (tools/check_views.py, VIEW-NAME). Every eye stands on the drawn ground plus its height (core/drawn)
const bkEye=(x,z,tx,tz,dy,ty)=>[x,terrainH(x,z)+1.7+bkD(dy,0),z,tx,terrainH(tx,tz)+bkD(ty,3),tz];
const VIEWS=(function(){const V={},T=BK_TOWN,Wm=T.frame.W;
 V['Overview']=(()=>{const e=Wm(-120,960),t=Wm(35,10);return[e[0],terrainH(e[0],e[1])+320,e[1],t[0],terrainH(t[0],t[1])+8,t[1]];})();
 {const e=Wm(-49,14),t=Wm(10,-2);V['The Market']=bkEye(e[0],e[1],t[0],t[1],1.1,2.2);}
 {const e=Wm(108,34),t=T.DALAB.c;V['The Dalab mission']=bkEye(e[0],e[1],t[0],t[1],4,4);}
 {const dg=BK_PLAN&&BK_PLAN.records.find(r=>r.key==='fg-dugout-icehouse'&&r.quarter==='market');
  if(dg){const c=Math.cos(dg.ry),s=Math.sin(dg.ry),ex=dg.x+3.5*c+14.5*s,ez=dg.z-3.5*s+14.5*c;
   V['The dugout ice-house']=bkEye(ex,ez,dg.x,dg.z,1.5,1.6);}}
 {const a=BK_GROUND.river.along(BK_GROUND.river.sPin+520,350),b=BK_GROUND.river.along(BK_GROUND.river.sPin+880,175);V['The Icegarth']=bkEye(a.x,a.z,b.x,b.z,14,0);}
 {const r=T.ropewalk,a=BK_GROUND.river.along(r[0]-55,168),b=BK_GROUND.river.along(r[0]+145,80);V['The Ropewalk']=bkEye(a.x,a.z,b.x,b.z,4,0);}
 {const F=T.FAIR;V['The Fairfell']=bkEye(F.c[0]-55,F.c[1]-170,F.c[0],F.c[1],10,0);}
 {const cp=BK_PLAN&&BK_PLAN.camps&&BK_PLAN.camps[0];
  if(cp){const ex=cp.x+cp.way[0]*(cp.R+9.5),ez=cp.z+cp.way[1]*(cp.R+9.5);V['The Winterings']=bkEye(ex,ez,cp.x,cp.z,2.4,1.2);}
  else{const W0=T.WINTER;V['The Winterings']=bkEye(W0.c[0]+95,W0.c[1]-150,W0.c[0],W0.c[1],8,0);}}
 {const e=Wm(-385,12),t=Wm(-285,10);V['The Folds']=bkEye(e[0],e[1],t[0],t[1],7,0);}
 {const C=T.TEARS.c,e=Wm(405,155);V['The Golden Tears']=bkEye(e[0],e[1],C[0],C[1],14,4);}
 if(BK_PLAN){const dh=BK_PLAN.records.find(r=>r.key==='fg-doublehall'),rec=dh&&typeof BK_TOWN_RECS!=='undefined'&&BK_TOWN_RECS[dh.id];
  if(dh){const c=Math.cos(dh.ry),s=Math.sin(dh.ry),y=rec?rec.y:terrainH(dh.x,dh.z);
   V['Inside the double hall']=[dh.x+8*c-1.4*s,y+1.75,dh.z-8*s-1.4*c,dh.x-7*c-.8*s,y+1.6,dh.z+7*s-.8*c];}
  const sr=BK_PLAN.records.find(r=>r.key==='xa_serai');
  if(sr){const c=Math.cos(sr.ry),s=Math.sin(sr.ry),y=bkD(sr.floorY,terrainH(sr.x,sr.z))+.35;
   V['Inside the caravanserai court']=[sr.x+6*c+8*s,y+1.8,sr.z-6*s+8*c,sr.x-4*c-12*s,y+2.6,sr.z+4*c-12*c];}}
 {const C=T.CAIRN;V['The cairn hall']=bkEye(C[0]-28,C[1]+38,C[0],C[1],2,0);}
 if(BK_RINGS){const H=BK_RINGS.hoists[0],R=BK_GROUND.river,a=R.along(R.sLip-900,420);V['The Stairhead']=bkEye(a.x,a.z,H.x,H.z,30,0);
  const t=BK_TOLL[0];if(t)V['The toll post']=bkEye(t.x-70,t.z+50,t.x,t.z,6,4);
  const b=R.along(R.sLip+2600,500);V['The falls from below']=[b.x,terrainH(b.x,b.z)+120,b.z,H.x,H.y,H.z];}
 {const a=BK_GROUND.river.along(BK_GROUND.river.sPin-950,-220),b=BK_GROUND.river.along(BK_GROUND.river.sPin,120);V['Over the ford']=bkEye(a.x,a.z,b.x,b.z,18,0);}
 V['Down the river to the rim']=(()=>{const e=Wm(320,-240);return[e[0],terrainH(e[0],e[1])+170,e[1],17000,1500,-17000];})();
 return V;})();
// the town as one budget (as Thalaba's): every type in the class 'city'
BUDGET.showcase={tris:40000000,calls:4000};BUDGET.cls.city=40000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
