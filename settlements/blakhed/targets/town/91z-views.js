// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the town's budget. No apostrophe or colon in a view's
// name (tools/check_views.py, VIEW-NAME). Every eye stands on the drawn ground plus its height (core/drawn)
const bkEye=(x,z,tx,tz,dy,ty)=>[x,terrainH(x,z)+1.7+bkD(dy,0),z,tx,terrainH(tx,tz)+bkD(ty,3),tz];
const VIEWS=(function(){const V={},T=BK_TOWN,Wm=T.frame.W;
 V['Overview']=(()=>{const e=Wm(-200,1500),t=Wm(150,-150);return[e[0],terrainH(e[0],e[1])+460,e[1],t[0],terrainH(t[0],t[1])+10,t[1]];})();
 {const e=Wm(-60,40),t=Wm(70,-20);V['The Market']=bkEye(e[0],e[1],t[0],t[1],0);}
 {const a=BK_GROUND.river.along(BK_GROUND.river.sPin+1000,420),b=BK_GROUND.river.along(BK_GROUND.river.sPin+1500,180);V['The Icegarth']=bkEye(a.x,a.z,b.x,b.z,14,0);}
 {const r=T.ropewalk,a=BK_GROUND.river.along(r[0]-60,170),b=BK_GROUND.river.along(r[0]+150,80);V['The Ropewalk']=bkEye(a.x,a.z,b.x,b.z,4,0);}
 {const F=T.FAIR;V['The Fairfell']=bkEye(F.c[0]-60,F.c[1]-200,F.c[0],F.c[1],12,0);}
 {const W0=T.WINTER;V['The Winterings']=bkEye(W0.c[0]+120,W0.c[1]-210,W0.c[0],W0.c[1],10,0);}
 {const b=T.BLOCKS.find(b=>b.use==='folds'),c=b.poly[0],d=b.poly[2];V['The Folds']=bkEye(c[0]-40,c[1]-40,(c[0]+d[0])/2,(c[1]+d[1])/2,8,0);}
 {const C=T.TEARS.c;V['The Golden Tears']=bkEye(C[0]+260,C[1]+120,C[0],C[1],18,0);}
 {const C=T.CAIRN;V['The cairn hall']=bkEye(C[0]-30,C[1]+40,C[0],C[1],2,0);}
 if(BK_RINGS){const H=BK_RINGS.hoists[0],R=BK_GROUND.river,a=R.along(R.sLip-900,420);V['The Stairhead']=bkEye(a.x,a.z,H.x,H.z,30,0);
  const t=BK_TOLL[0];if(t)V['The toll post']=bkEye(t.x-70,t.z+50,t.x,t.z,6,4);
  const b=R.along(R.sLip+2600,500);V['The falls from below']=[b.x,terrainH(b.x,b.z)+120,b.z,H.x,H.y,H.z];}
 {const a=BK_GROUND.river.along(BK_GROUND.river.sPin-1300,-260),b=BK_GROUND.river.along(BK_GROUND.river.sPin,120);V['Over the ford']=bkEye(a.x,a.z,b.x,b.z,20,0);}
 V['Down the river to the rim']=(()=>{const e=Wm(400,-300);return[e[0],terrainH(e[0],e[1])+180,e[1],17000,1500,-17000];})();
 return V;})();
// the town as one budget (as Thalaba's): every type in the class 'city'
BUDGET.showcase={tris:40000000,calls:4000};BUDGET.cls.city=40000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
