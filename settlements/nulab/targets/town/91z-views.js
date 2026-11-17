// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (no apostrophe or colon in a name: tools/check_views.py),
// and the town's budget. The eye views stand 1.7 m over the drawn ground.
function nlEye(x,z,tx,tz,dy,ty){return[x,terrainH(x,z)+1.7+nlD(dy,0),z,tx,terrainH(tx,tz)+nlD(ty,4),tz];}
const VIEWS=(function(){const V={},K=NL_PLAN,MD=NL_TOWN.MOUND,PL=K?K.plaza:NL_TOWN.PLAZA;
 /* aerial over the bay looking WSW across the harbour, the dense coastal city in its earthen mound, the set-back palisaded mound and the surrounding fields */
 V['Overview']=[2050,NL_GROUND.LAKE+680,-2250,120,NL_GROUND.LAKE+22,-1350];
 V['The mound']=nlEye(PL[0]+22,PL[1],MD[0],MD[1],1.5,9);
 V['The palisade and outer mound']=[-820,terrainH(-820,-1720)+95,-1720,-260,terrainH(-260,-1350)+8,-1350];
 V['The daughter Halls']=[-420,terrainH(-420,-1585)+34,-1585,-488,terrainH(-485,-1435)+6,-1440];
 {const H=NL_GROUND.HARBOUR;V['The harbour']=[H.x1+145,NL_GROUND.LAKE+36,H.z1+85,H.x0+10,NL_GROUND.LAKE+5,(H.z0+H.z1)/2];}
 {const M=NL_TOWN.MARKET;V['The market']=nlEye(M[0]-72,M[1]+68,M[0],M[1],3.5,2);}
 {const G=NL_TOWN.GRANARY.c;V['The granary yard']=[G[0]+210,terrainH(G[0]+210,G[1]+130)+56,G[1]+130,G[0],terrainH(G[0],G[1])+4,G[1]];}
 V['Down the harbour road']=nlEye(-155,-1350,520,-1350,1.2,2);
 V['The copper works']=[5475,NL_GROUND.LAKE+46,2630,5755,NL_GROUND.LAKE+8,2480];
 V['From the bay']=[2150,NL_GROUND.LAKE+26,-1350,100,NL_GROUND.LAKE+24,-1350];
 {const R=NL_RINGV.find(v=>v.id==='nl.ring.beanfield');if(R&&R.site){const s=R.site;V['The ring village Beanfield']=[s.x+260,terrainH(s.x+260,s.z-300)+70,s.z-300,s.x,terrainH(s.x,s.z)+2,s.z];}}
 {const R=NL_RINGV.find(v=>v.id==='nl.ring.netshore');if(R&&R.site){const s=R.site;V['The fishing hamlet Net Shore']=[s.x+120,NL_GROUND.LAKE+30,s.z-260,s.x,terrainH(s.x,s.z)+2,s.z];}}
 if(typeof NL_LPLAN!=='undefined'&&NL_LPLAN){const L=NL_LPLAN,c1=L.atS(740,150),t1=L.atS(1290,14),c2=L.atS(1735,2),t2=L.atS(L.portal.s,0);
  V['Station 5 and the lake viaduct']=[c1[0],NL_GROUND.LAKE+54,c1[1],t1[0],NL_GROUND.LAKE+7,t1[1]];
  V['Loj Faiv and the Chimes portal']=[c2[0],L.line.floorAt(1735)+4.2,c2[1],t2[0],L.line.floorAt(L.portal.s)+4.6,t2[1]];}
 V['Toward Ledge']=[MD[0],terrainH(MD[0],MD[1])+85,MD[1]-120,-12000,1500,-55000];
 return V;})();
BUDGET.showcase={tris:40000000,calls:4000};BUDGET.cls.city=40000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
