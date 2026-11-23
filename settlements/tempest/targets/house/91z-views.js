// TARGET: house — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the House's budget. No apostrophe or colon in a
// view's name (tools/check_views.py, VIEW-NAME). The House faces east: its Main Gate toward +x, the Storm Tower toward Komodo at -x.
// A view in the inner ward stands on the talus (4 m over the drawn ground: tpEye's up).
const tpEye=(x,z,tx,tz,dy,ty,up)=>[x,terrainH(x,z)+1.7+tpD(up,0)+tpD(dy,0),z,tx,terrainH(tx,tz)+tpD(ty,4),tz];
const VIEWS=(function(){const V={},pg=id=>{const g=TP_PLAN.gates.find(q=>q.id===id);return TPS.toPage(g.at[0],g.at[1]);},at=p=>TPS.toPage(p[0],p[1]);
 const main=pg('gate.main'),sn=pg('gate.sally.n'),u=at(TP_PLAN.utse.at),h=at(TP_PLAN.hosted.at),st=at(TP_PLAN.towers.find(t=>t.id==='storm').ctr),y4=TPS.inner;
 V['Overview']=[TPS.x+300,TPS.pad+220,TPS.z+330,TPS.x,TPS.pad+8,TPS.z];
 V['The Main Gate']=tpEye(main[0]+95,main[1]+22,main[0],main[1],0,8);
 V['The muster court and the utse']=tpEye(main[0]-22,main[1]+48,u[0],u[1],0,14);
 V['The inner court and the monastery']=tpEye(u[0]-18,u[1]+16,h[0]+26,h[1],0,y4+8,y4);
 V['The Storm Tower from the drill court']=tpEye(st[0]+48,st[1]+24,st[0],st[1],0,14);
 V['The north sally gate']=tpEye(sn[0]+30,sn[1]-70,sn[0],sn[1],0,6);
 V['West toward Komodo']=[st[0],TPS.pad+24,st[1],st[0]-6000,TPS.pad-500,st[1]+400];
 return V;})();
// the House as one budget (as Strongwall's): every type in the class 'city'
BUDGET.showcase={tris:6000000,calls:1500};BUDGET.cls.city=6000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
