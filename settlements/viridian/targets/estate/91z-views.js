// TARGET: estate — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (page metres, y the ground's own height), and the
// page's budgets. View names: no apostrophe, no colon (tools/check_views.py).
const vtEye=(x,z,tx,tz,dy)=>[x,terrainH(x,z)+1.7+(dy==null?0:dy),z,tx,terrainH(tx,tz)+4,tz];
const VIEWS=(function(){const V={},vtBy=VT_BENCH.y,vtP=id=>VT_PLACE.find(p=>p.id===id);
 V['Overview']=[-1500,vtBy+520,900,250,vtBy+40,0];   /* from over the valley, south-west: the hollow, the bench, the gardens, the scarp */
 V['The head house']=vtEye(-385,8,0,0,0);   /* from the buyers court up the way to the Green Gate and the great monastery */
 V['The bench from above']=[-260,vtBy+130,240,10,vtBy+8,0];
 V['The Low Garden']=vtEye(-150,330,120,640,0);   /* on the south flank's lowest tread, along the rows */
 V['The Low Garden from the bench']=[60,vtBy+40,190,-120,vtBy-30,560];
 {const p=vtP('roll-fire');V['The tea works']=[p.x-200,p.o.y+60,p.z+180,p.x,p.o.y,p.z];}
 {const p=vtP('physic-garden');V['The physic garden']=[p.x-90,p.o.y+40,p.z+70,p.x,p.o.y,p.z];}
 {const p=vtP('pluckers-shelter');V['The High Garden']=vtEye(p.x-40,60,p.x+380,-160,2);}
 V['Up to the scarp']=vtEye(180,-40,4000,0,4);   /* from behind the bench, east up the mist belt to the scarp's face */
 V['Toward Qiblai']=[0,vtBy+60,0,-10000,vtBy-400,4000];   /* west and south-west down the valley, the basin beyond */
 return V;})();
BUDGET.showcase={tris:16000000,calls:2400};BUDGET.cls.city=16000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
