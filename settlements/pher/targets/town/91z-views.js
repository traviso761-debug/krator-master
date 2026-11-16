// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the town's budgets
const phEye=(x,z,tx,tz,dy)=>[x,phH(x,z)+1.7+(dy||0),z,tx,phH(tx,tz)+4,tz];
const VIEWS=(function(){const V={},U=PH.UP,cz=phShoreZ(PH.COVE.x);
 V['Overview']=[1900,1300,1600,200,120,-2200];
 V['From the cove']=[PH.COVE.x+120,14,cz+520,PH.COVE.x,30,cz-500];
 V['The strand street']=phEye(-60,cz-36,360,cz-90,0);
 V['The headland and its light']=[-60,40,700,PH.HEAD.b[0],30,PH.HEAD.b[1]-120];
 const g=PH_PLACE.find(p=>p.key==='xa_vizier');if(g)V['The house of the heir']=[g.x+70,g.o.y+28,g.z+90,g.x,g.o.y+6,g.z];
 V['Up the wall from the strand']=phEye(140,cz-60,180,cz-900,1.5);
 V['The lit avenue on the wall']=[900,phH(900,-2600)+260,-1900,140,phH(140,-2600),-2900];
 V['The fair ground']=phEye(U[0]+60,U[1]+150,U[0],U[1]-60,0);
 V['Upper Phēr from above']=[U[0]+520,phH(U[0],U[1])+340,U[1]+560,U[0],phH(U[0],U[1]),U[1]];
 V['From the rim over the lake']=[U[0]-200,phH(U[0]-200,U[1]+520)+30,U[1]+520,PH.COVE.x,0,1800];
 return V;})();
// the town as one budget (as Qiblai's): every type in the class 'city'
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
