// TARGET: fort — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the fort's budget. No apostrophe or colon in a
// view's name (tools/check_views.py, VIEW-NAME). The fort faces north: its Qiblai Gate toward -z, its gorge wall at the pin (z 0).
const swEye=(x,z,tx,tz,dy,ty)=>[x,terrainH(x,z)+1.7+swD(dy,0),z,tx,terrainH(tx,tz)+swD(ty,4),tz];
const VIEWS=(function(){const V={},pg=id=>{const g=SW.P.gates.find(q=>q.id===id);return SW.toPage(g.at[0],g.at[1]);};
 const q=pg('gate.qiblai'),gold=pg('gate.gold'),inner=pg('gate.inner'),water=pg('gate.water'),k=SW.P.buildings.find(b=>b.kind==='keep'),kp=SW.toPage(k.at[0],k.at[1]);
 V['Overview']=[SW.x+260,SW.pad+210,SW.z-330,SW.x,SW.pad+8,SW.z];
 V['The Qiblai Gate']=swEye(q[0]+18,q[1]-90,q[0],q[1],0,6);
 V['The inner ward']=swEye(inner[0]+14,inner[1]+16,kp[0],kp[1],0,10);
 {const cb=SW.P.buildings.find(b=>b.kind==='cistern'),cs=SW.toPage(cb.at[0],cb.at[1]),e=[cs[0]+(inner[0]-cs[0])*.2,cs[1]+(inner[1]-cs[1])*.2];   /* from the open court by the cistern, toward the inner gate */
  V['The keep and its chapel']=swEye(e[0],e[1],kp[0],kp[1],0,22);}
 V['The gorge wall from the scarp']=[gold[0]-260,swGround(gold[0]-260,gold[1]+2600)+70,gold[1]+2600,gold[0],SW.pad+6,gold[1]];   /* the scarp climbs from about 2 km south of the pin (the model's next cell) */
 V['The water gate']=swEye(water[0]-20,water[1]+60,water[0],water[1],0,4);
 V['Down the bench to the north']=[SW.x+40,SW.pad+60,SW.z+120,SW.x-200,SW.pad-120,SW.z-6000];
 V['Up the scarp to the gold']=[SW.x-120,SW.pad+90,SW.z-520,SW.x,SW.pad+1800,SW.z+9000];
 return V;})();
// the fort as one budget (as Thalaba's and Erewhon's): every type in the class 'city'
BUDGET.showcase={tris:6000000,calls:1500};BUDGET.cls.city=6000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
