// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ] for the town the page draws, and the town's budgets
// (PLAN.md section 3: the overview, from the water, the market, the terraces). No view name holds an apostrophe or a colon.
const xlEye=(x,z,tx,tz,dy)=>[x,xlH(XLK,x,z)+1.7+(dy||0),z,tx,xlH(XLK,tx,tz)+3,tz];
const VIEWS=(function(){const V={},G=XLG,S=XL.SPECS[XLK],L=S.layout,z0=xlShoreZ(XLK,0),find=k=>XLT.place.find(p=>p.key===k);
 const top=G.benches.length?G.benches[G.benches.length-1]:null,mk=L.market;
 V['Overview']=[620,260,z0+520,0,30,z0-260];
 V['From the water']=[60,9,z0+300,0,12,z0-120];
 const g=find('xa_ghat');if(g)V['The landing stair']=[g.x+26,g.o.y+9,g.z+30,g.x,g.o.y-1,g.z];
 {const q=xlAt(XLK,mk.x,L.road+6+mk.d/2);V['The market square']=xlEye(q[0]+mk.w/2+8,q[1]+18,q[0]-10,q[1]-6,1);}
 const t=find('xa_temple');if(t)V['The temple by the landing']=[t.x+40,t.o.y+16,t.z+46,t.x,t.o.y+6,t.z];
 const gv=find('xa_governor');if(gv)V['The governors house']=[gv.x+34,gv.o.y+14,gv.z+40,gv.x,gv.o.y+4,gv.z];
 V['Up the main stair']=xlEye(6,z0-L.road-4,0,z0-(top?top.d0:300),1);
 if(top){const q=xlAt(XLK,(top.x0+top.x1)/2,(top.d0+top.d1)/2);V['The terraces']=[q[0]+260,top.y+90,q[1]+260,q[0],top.y,q[1]];
  const b0=G.benches[0],e=xlAt(XLK,b0.x0+30,b0.d0+60);V['Along the lower bench']=xlEye(e[0],e[1],e[0]+300,xlShoreZ(XLK,e[0]+300)-b0.d0-60,1.5);}
 const br=find('xa_bridge');if(br)V['The stream and the bridge']=[br.x+40,br.o.y+18,br.z+50,br.x,br.o.y,br.z-30];
 V['The fishing dugouts']=[200,26,z0+260,-200,0,z0+900];
 V['From the wall above']=[0,(top?top.y:80)+120,z0-(top?top.d1+260:600),0,10,z0+200];
 return V;})();
// the town as one budget (as Phēr's): every type in the class 'city'
BUDGET.showcase={tris:20000000,calls:2400};BUDGET.cls.city=20000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
