// TARGET: summit — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the page's budgets
const adEye=(x,z,tx,tz,dy)=>[x,terrainH(x,z)+1.7+(dy==null?0:dy),z,tx,terrainH(tx,tz)+4,tz];
const VIEWS=(function(){
 const V={},C=terrainH(0,0),R=AD_ROAD,W=AD_PLACE.find(p=>p.id==='station-watch'),S=AD_PLACE.find(p=>p.id==='pilgrims-shelter');
 V['Overview']=[R.dx*520+260,C+190,R.dz*520,0,C,-30];   /* from over the Dream Road, south-south-east */
 {const e=R.at(330);V['Up the Dream Road']=adEye(e[0]-4,e[1],0,0,0);}
 V['The Summit Chorten and the great wheel']=adEye(8,46,0,-56,0);
 V['The Station Watch']=[W.x+22,W.o.y+22,W.z+48,W.x+2,W.o.y+8,W.z];
 V['The pilgrims shelter']=adEye(S.x-40,S.z+30,S.x,S.z,0);
 /* on the kora between two wheel houses, along it to the next but one */
 {const h=AD_KORA.houses[5],a=Math.atan2(h.x,h.z)+Math.PI/16,t=AD_KORA.houses[7];V['On the High Kora']=adEye(260*Math.sin(a),260*Math.cos(a),t.x*1.02,t.z*1.02,0);}
 V['The High Kora from above']=[0,C+520,420,0,C,0];
 /* the monastery down the isle, 9 km south-south-east, and Erehwon beyond the water */
 V['Toward the monastery']=[R.dx*40,C+24,R.dz*40,R.dx*9000,0,R.dz*9000];
 V['Toward Erehwon']=[0,C+30,60,adWx(841)-AD.WX,0,adWz(1517)-AD.WZ];
 return V;})();
BUDGET.showcase={tris:16000000,calls:2400};BUDGET.cls.city=16000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
