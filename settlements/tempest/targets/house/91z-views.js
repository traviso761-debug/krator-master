// TARGET: house — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the House's budget. No apostrophe or colon in a
// view's name (tools/check_views.py, VIEW-NAME). The House faces east: its Main Gate toward +x, the Storm Tower toward Komodo at -x.
// The inner ward's drawn ground is its talus top (89zs), so a view there stands on it.
const tpEye=(x,z,tx,tz,dy,ty,up)=>[x,terrainH(x,z)+1.7+tpD(up,0)+tpD(dy,0),z,tx,terrainH(tx,tz)+tpD(ty,4),tz];
const VIEWS=(function(){const V={},pg=id=>{const g=TP_PLAN.gates.find(q=>q.id===id);return TPS.toPage(g.at[0],g.at[1]);},at=p=>TPS.toPage(p[0],p[1]);
 const main=pg('gate.main'),sn=pg('gate.sally.n'),u=at(TP_PLAN.utse.at),h=at(TP_PLAN.hosted.at),st=at(TP_PLAN.towers.find(t=>t.id==='storm').ctr),y4=TPS.inner;
 V['Overview']=[TPS.x+300,TPS.pad+220,TPS.z+330,TPS.x,TPS.pad+8,TPS.z];
 V['The Main Gate']=tpEye(main[0]+95,main[1]+22,main[0],main[1],0,8);
 V['The muster court and the utse']=tpEye(main[0]-22,main[1]+48,u[0],u[1],0,14);
 V['The inner court and the monastery']=tpEye(u[0]-18,u[1]+16,h[0]+26,h[1],0,8);   /* the inner ward's ground is the talus top (89zs) */
 V['The Storm Tower from the drill court']=tpEye(st[0]+48,st[1]+24,st[0],st[1],0,14);
 V['The north sally gate']=tpEye(sn[0]+30,sn[1]-70,sn[0],sn[1],0,6);
 /* step 4: the crest (sheet T0) */
 {const fb=id=>{const b=TP_GROUNDS.fields.find(f=>f.id===id).box,c=at([(b[0]+b[2])/2,(b[1]+b[3])/2]);return c;};
  V['Over the crest from the east']=[TPS.x+620,TPS.pad+260,TPS.z+260,TPS.x-80,TPS.pad,TPS.z-40];
  const pd=fb('paddock'),hy=fb('hay');V['The remounts paddock and the hay barns']=tpEye(hy[0]-40,hy[1]-20,pd[0],pd[1],0,2);
  const md=fb('maydan');V['The Maydan']=tpEye(md[0]+40,md[1]+70,md[0]-60,md[1],0,3);}
 V['West toward Komodo']=[st[0],TPS.pad+24,st[1],st[0]-6000,TPS.pad-500,st[1]+400];
 return V;})();
// the House as one budget (as Strongwall's): every type in the class 'city'
BUDGET.showcase={tris:6000000,calls:1500};BUDGET.cls.city=6000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
