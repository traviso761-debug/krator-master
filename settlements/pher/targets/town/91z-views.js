// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the town's budgets
const phEye=(x,z,tx,tz,dy)=>[x,phH(x,z)+1.7+(dy||0),z,tx,phH(tx,tz)+4,tz];
const VIEWS=(function(){const V={},cz=phShoreZ(PH.COVE.x),S=PH_SHELF_C,F=phAt(PH_FAIR.x,PH_FAIR.d);
 V['Overview']=[1500,520,900,300,140,-700];
 V['From the cove']=[PH.COVE.x+120,14,cz+520,PH.COVE.x,60,cz-500];
 V['The strand street']=phEye(-60,cz-36,360,cz-90,0);
 V['The headland and its light']=[-60,40,700,PH.HEAD.b[0],30,PH.HEAD.b[1]-120];
 const g=PH_PLACE.find(p=>p.key==='xa_cit_vizier');if(g)V['The palace of the heir']=[g.x+90,g.o.y+40,g.z+120,g.x,g.o.y+6,g.z];
 const c=PH_PLACE.find(p=>p.key==='xa_caravanserai');if(c)V['The caravanserai']=[c.x+80,c.o.y+38,c.z+70,c.x,c.o.y+4,c.z];
 V['Boats in the cove']=[PH.COVE.x+260,24,cz+260,PH.COVE.x-60,0,cz+40];
 V['The fishing dugouts']=[400,40,900,0,0,1600];
 V['The fair ground']=phEye(F[0]+40,F[1]+90,F[0]-20,F[1]-40,1.5);
 V['The plaza on the shelf']=phEye(S[0]-60,S[1]+70,S[0]+20,S[1]-30,0);
 {const A=PH.ways.filter(w=>/contour alley of east/.test(w.tag)&&w.pts.length>40),w=A[Math.floor(A.length/3)];   /* standing in an alley, looking along it */
  if(w){const P=w.pts,a=P[Math.floor(P.length*.3)],b=P[Math.floor(P.length*.75)];V['In the alleys']=phEye(a[0],a[1],b[0],b[1],0);}}
 V['The town on its spur']=[1300,260,200,420,110,-650];
 V['The hairpins of the road']=[1600,phH(560,-2600)+380,-1400,560,phH(560,-2800),-2800];
 V['Over the lake to the far shore']=[PH.COVE.x,60,cz+300,PH.COVE.x-4000,300,40000];
 V['From the rim over the lake']=[400,phH(400,-4900)+30,-4900,PH.COVE.x,0,1800];
 return V;})();
// the town as one budget (as Qiblai's): every type in the class 'city'
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
