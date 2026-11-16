// TARGET: city — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the city's budgets
const qcEye=(x,z,tx,tz,dy)=>[x,terrainH(x,z)+1.7+qcD(dy,0),z,tx,terrainH(tx,tz)+4,tz];
const VIEWS=(function(){const V={},S=QC_B.z1,E=QC_B.x1,L=QC_LM,L0=QC_LM;
 V['Overview']=[E+520,820,S+760,L.x,0,L.z];
 V['From the south gate']=qcEye(6,S+40,0,L.z+160,0);
 V['The Rainbow Temple']=qcEye(L.x+18,L.z+95,L.x,L.z,0);
 // the kora: down one side from a third of its length, on the street's outer half, the arcades on the left
 const K=QC_KORA;if(K){const a=K.pts[0],b=K.pts[1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;let nx=-uz,nz=ux;if(nx*(QC_LM.x-a[0])+nz*(QC_LM.z-a[1])>0){nx=-nx;nz=-nz;}
  const o=K.w/4,c=[a[0]+ux*L*.3+nx*o,a[1]+uz*L*.3+nz*o];V['The kora']=qcEye(c[0],c[1],c[0]+ux*120,c[1]+uz*120,0);}
 const m=QC_PLACE.find(p=>p.kind==='monastery'&&p.key==='qb_monastery');if(m)V['A great monastery']=qcEye(m.x+10,m.z+(m.ry?-60:60),m.x,m.z,0);
 const h=QC_PLACE.find(p=>p.kind==='lot'&&p.cls==='poor');if(h)V['A lay street']=qcEye(h.x+Math.sin(h.ry)*9,h.z+Math.cos(h.ry)*9,h.x+Math.cos(h.ry)*40,h.z-Math.sin(h.ry)*40,0);
 V['The ghats']=qcEye(QC_RIVER.x+20,30,QC_RIVER.x-40,0,1.5);
 V['From above the Temple Mountain']=[L.x+240,340,L.z+300,L.x,10,L.z];
 // inside the four walk-in rooms (90t-qc-interiors.js, built when the camera comes): from just inside the front door, eye
 // height on the room's floor, toward the room's head
 for(const R of(QC_IX&&QC_IX.rooms)||[]){const y=R.o.y+1.7,f=loc(R.x,R.z,0,R.o.D/2-2.2,R.ry),t=loc(R.x,R.z,0,-R.o.D/2+1,R.ry);
  V['Inside: '+R.name]=[f[0],y,f[1],t[0],R.o.y+1.4,t[1]];}
 // inside a few of the lots' own interiors (90u-qc-lot-interiors.js, built when the camera comes): a lot of each kind nearest the
 // Temple Mountain, from just inside its street door toward the back
 if(typeof QC_LIX!=='undefined')for(const [key,name] of[['qb_row_mid','a row house'],['qb_row_rich','a rich row house'],['qb_shop_row','a shop'],['qb_workshop','a workshop']]){
  const L=QC_LIX.lots.filter(L=>L.p.key===key).sort((a,b)=>Math.hypot(a.x-L0.x,a.z-L0.z)-Math.hypot(b.x-L0.x,b.z-L0.z))[0];if(!L)continue;
  const sh=QC_LIX.types[L.tk].sh,p=L.p,c=Math.cos(sh.ry),s=Math.sin(sh.ry),fr=(u,v)=>loc(p.x,p.z,sh.x+u*c+v*s,sh.z-u*s+v*c,p.ry),y=qcD(p.o.y,0)+sh.y+1.6;
  const f=fr(0,sh.d/2-1.4),t=fr(0,-sh.d/2);V['Inside: '+name]=[f[0],y,f[1],t[0],y-.3,t[1]];}
 // the four meditation gardens in the corners, each from above its two gates (from inside the city, looking to the corner)
 for(const p of QC_PLACE)if(p.kind==='meditation'){const sx=Math.sign(p.x-L.x),sz=Math.sign(p.z-L.z),cx=p.x-sx*52,cz=p.z-sz*52;
  V['Meditation garden: '+QMED[p.o.v].name]=[cx,terrainH(cx,cz)+34,cz,p.x,terrainH(p.x,p.z)+1,p.z];}
 return V;})();
// the city as one budget (as Erewhon's 93-er-ui.js): every type in the class 'city'
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
