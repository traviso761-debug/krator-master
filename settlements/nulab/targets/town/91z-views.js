// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (no apostrophe or colon in a name: tools/check_views.py),
// and the town's budget. The eye views stand 1.7 m over the drawn ground (the town's mesh is the ground itself).
function nlEye(x,z,tx,tz,dy,ty){return[x,terrainH(x,z)+1.7+nlD(dy,0),z,tx,terrainH(tx,tz)+nlD(ty,4),tz];}
const VIEWS=(function(){const V={},P=NL_GROUND.PIN,K=NL_PLAN;
 V['Overview']=[1800,NL_GROUND.LAKE+900,-3200,-500,NL_GROUND.LAKE+30,300];
 {const L=NL_TOWN.LAB,pl=K?K.plaza:[P[0],P[1]-95];V['The mound']=nlEye(pl[0]+L[0]*22,pl[1]+L[1]*22,P[0],P[1],1.5,9);}
 {const H=NL_GROUND.HARBOUR;V['The harbour']=[H.x1+260,NL_GROUND.LAKE+40,(H.z0+H.z1)/2+260,H.x0-200,NL_GROUND.LAKE+6,(H.z0+H.z1)/2];}
 {const M=NL_TOWN.MARKET;V['The market']=nlEye(M[0]-70,M[1]+90,M[0],M[1],3,2);}
 {const G=NL_TOWN.GRANARY.c;V['The granary yard']=[G[0]+220,terrainH(G[0]+220,G[1]+140)+60,G[1]+140,G[0],terrainH(G[0],G[1])+4,G[1]];}
 V['Down the harbour road']=nlEye(-640,640,160,-420,0,0);
 V['The copper works']=[5300,NL_GROUND.LAKE+70,2700,5760,NL_GROUND.LAKE+6,2450];
 V['From the bay']=[2600,NL_GROUND.LAKE+14,-1800,-200,NL_GROUND.LAKE+40,200];
 {const R=NL_RINGV.find(v=>v.id==='nl.ring.beanfield');if(R&&R.site){const s=R.site;V['The ring village Beanfield']=[s.x+260,terrainH(s.x+260,s.z-300)+70,s.z-300,s.x,terrainH(s.x,s.z)+2,s.z];}}
 {const R=NL_RINGV.find(v=>v.id==='nl.ring.netshore');if(R&&R.site){const s=R.site;V['The fishing hamlet Net Shore']=[s.x+120,NL_GROUND.LAKE+30,s.z-260,s.x,terrainH(s.x,s.z)+2,s.z];}}
 /* north from the mound's plaza, over the town and the bay to Ledge's cliff 57 km across the lake */
 V['Toward Ledge']=[P[0],terrainH(P[0],P[1])+80,P[1]-200,-12000,1500,-55000];
 return V;})();
// the town as one budget (as Kirstabal's): every type in the class 'city'
BUDGET.showcase={tris:40000000,calls:4000};BUDGET.cls.city=40000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
