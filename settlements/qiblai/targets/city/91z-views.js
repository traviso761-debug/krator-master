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
 for(const R of(QC_IX&&QC_IX.rooms)||[]){const y=R.o.y+1.7,gh=R.key==='qb_ix_gatehall',f=gh?loc(R.x,R.z,-R.o.W/2+1.1,R.o.D/2-1,R.ry):loc(R.x,R.z,0,R.o.D/2-2.2,R.ry),
  t=gh?loc(R.x,R.z,R.o.W/2,-R.o.D/6,R.ry):loc(R.x,R.z,0,-R.o.D/2+1,R.ry);   /* a gate hall: from a front corner across to the guardian kings on the far wall */
  /* one view for the first of the gate passages and guard rooms (there are 41 and 48), each of the others its own */
  const one={qb_ix_passage:'Inside a city gate passage',qb_ix_guardroom:'Inside a city gate guard room'}[R.key];if(one&&V[one])continue;
  if(R.key==='qb_ix_passage'&&!/gate passage \(qiblai:wall/i.test(R.name))continue;
  V[one||'Inside: '+R.name]=R.key==='qb_ix_guardroom'?[f[0],y,f[1],loc(R.x,R.z,0,-R.o.D/2,R.ry)[0],R.o.y+1.2,loc(R.x,R.z,0,-R.o.D/2,R.ry)[1]]:[f[0],y,f[1],t[0],R.o.y+1.4,t[1]];}
 // inside a few of the lots' own interiors (90u-qc-lot-interiors.js, built when the camera comes): a lot of each kind nearest the
 // Temple Mountain, from just inside its street door toward the back
 if(typeof QC_LIX!=='undefined')for(const [key,name] of[['qb_row_mid','a row house'],['qb_row_rich','a rich row house'],['qb_shop_row','a shop'],['qb_workshop','a workshop']]){
  const L=QC_LIX.lots.filter(L=>L.p.key===key).sort((a,b)=>Math.hypot(a.x-L0.x,a.z-L0.z)-Math.hypot(b.x-L0.x,b.z-L0.z))[0];if(!L)continue;
  const sh=QC_LIX.types[L.tk].sh,p=L.p,c=Math.cos(sh.ry),s=Math.sin(sh.ry),fr=(u,v)=>loc(p.x,p.z,sh.x+u*c+v*s,sh.z-u*s+v*c,p.ry),y=qcD(p.o.y,0)+sh.y+1.6;
  const f=fr(0,sh.d/2-1.4),t=fr(0,-sh.d/2);V['Inside: '+name]=[f[0],y,f[1],t[0],y-.3,t[1]];
  /* walk in: this house's street door stands open (unlocked here; 90u unlocks every lot's door when its interior comes), seen
     from the street a little to one side, the room through it */
  if(key==='qb_row_rich'&&L.D){const D=L.D,ox=Math.sin(D.yaw),oz=Math.cos(D.yaw);D.locked=false;KDOOR.open(D);
   V['At the open door of '+name]=[D.at[0]+ox*5.5+oz*1.4,D.at[1]+1.7,D.at[2]+oz*5.5-ox*1.4,D.at[0]-ox*3,D.at[1]+1.3,D.at[2]-oz*3];}
  /* upstairs: the type is built here (~0.2 s) so the camera can stand in the middle of the first floor's biggest room, looking
     at its far corner (a fixed spot fell inside a partition or on the stair's head) */
  if(key==='qb_row_rich'&&sh.hs&&sh.hs.length>1){const T=QC_LIX.buildType(QC_LIX.types[L.tk]),R=T&&T.plan.rooms.filter(r=>r.level===1).sort((a,b)=>b.area-a.area)[0];
   if(R){const cx=R.poly.reduce((a,q)=>a+q[0],0)/R.poly.length,cz=R.poly.reduce((a,q)=>a+q[1],0)/R.poly.length,far=R.poly.slice().sort((a,b)=>Math.hypot(b[0]-cx,b[1]-cz)-Math.hypot(a[0]-cx,a[1]-cz))[0];
    const e=loc(p.x,p.z,cx-(far[0]-cx)*.3,cz-(far[1]-cz)*.3,p.ry),g=loc(p.x,p.z,far[0],far[1],p.ry),yu=qcD(p.o.y,0)+R.y+1.6;V['Inside: upstairs in '+name]=[e[0],yu,e[1],g[0],yu-.4,g[1]];}}}
 // a wayside shrine nearest the Temple Mountain, close in front of its window: the chapel inside (kits/qiblai 89q3)
 const sh0=QC_PLACE.filter(p=>p.key==='qb_shrine').sort((a,b)=>Math.hypot(a.x-L0.x,a.z-L0.z)-Math.hypot(b.x-L0.x,b.z-L0.z))[0];
 if(sh0){const y=qcD(sh0.o.y,0),e=loc(sh0.x,sh0.z,.5,2.3,sh0.ry),g=loc(sh0.x,sh0.z,0,-.6,sh0.ry);V['A wayside shrine chapel']=[e[0],y+1.55,e[1],g[0],y+1.0,g[1]];}
 // the monks' quarters: the first whole monastery's back range (built here), from its court door into its biggest ground-floor room
 if(typeof QC_LIX!=='undefined'){const Lm=QC_LIX.lots.find(L=>/^qb_monastery\|/.test(L.tk)&&L.D);const ty=Lm&&QC_LIX.types[Lm.tk],T=ty&&QC_LIX.buildType(ty);
  if(T){const R=T.plan.rooms.filter(r=>r.level===0).sort((a,b)=>b.area-a.area)[0],P=Lm.pose,cx=R.poly.reduce((a,q)=>a+q[0],0)/R.poly.length,cz=R.poly.reduce((a,q)=>a+q[1],0)/R.poly.length;
   const far=R.poly.slice().sort((a,b)=>Math.hypot(b[0]-cx,b[1]-cz)-Math.hypot(a[0]-cx,a[1]-cz))[0],e=loc(P.x,P.z,cx-(far[0]-cx)*.4,cz-(far[1]-cz)*.4,P.ry),g=loc(P.x,P.z,far[0],far[1],P.ry),yy=P.y+R.y+1.6;
   V['Inside the monks quarters']=[e[0],yy,e[1],g[0],yy-.4,g[1]];}
  /* likewise a gate market's shops and the caravanserai's rooms (2026-11-16: "finish all interiors") */
  for(const [rx,nm] of[[/^qb_gate_market(_half)?\|/,'Inside a gate market shop'],[/^qb_caravanserai\|/,'Inside the caravanserai']]){const Lr=QC_LIX.lots.find(L=>rx.test(L.tk)&&L.D),tr=Lr&&QC_LIX.types[Lr.tk],Tr=tr&&QC_LIX.buildType(tr);if(!Tr)continue;
   const R=Tr.plan.rooms.filter(r=>r.level===0).sort((a,b)=>b.area-a.area)[0],P=Lr.pose,cx=R.poly.reduce((a,q)=>a+q[0],0)/R.poly.length,cz=R.poly.reduce((a,q)=>a+q[1],0)/R.poly.length;
   const far=R.poly.slice().sort((a,b)=>Math.hypot(b[0]-cx,b[1]-cz)-Math.hypot(a[0]-cx,a[1]-cz))[0],e=loc(P.x,P.z,cx-(far[0]-cx)*.4,cz-(far[1]-cz)*.4,P.ry),g=loc(P.x,P.z,far[0],far[1],P.ry),yy=P.y+R.y+1.6;
   V[nm]=[e[0],yy,e[1],g[0],yy-.4,g[1]];}}
 // the outer wall's highest gate stair, from the country below its foot, up to the gate
 const stg=QC_EXTRA.filter(p=>p.kind==='stair').sort((a,b)=>b.o.rise-a.o.rise)[0];
 if(stg){const L=qnStairPlan(stg.o.rise).len,e=loc(stg.x,stg.z,9,L+22,stg.ry),g=loc(stg.x,stg.z,0,0,stg.ry);V['The outer gate stair']=[e[0],terrainH(e[0],e[1])+3,e[1],g[0],qcD(stg.o.y,0)+4,g[1]];}
 // the oilfield and Yuni's mission (89zr, 90v): the field from above its south-west corner, the mission from its road, the
 // south avenue's electric lamps from just inside the south gate
 if(typeof QC_OIL!=='undefined'){const O=QC_OIL.O,gy=terrainH(O[0],O[1]);V['The oilfield']=[O[0]-250,gy+110,O[1]+260,O[0]+40,gy,O[1]];
  const ms=QC_OIL.assets.find(R=>R.key==='park_gatehouse');if(ms){const e=[ms.x+30,ms.z+44];V['The Yuni mission']=[e[0],terrainH(e[0],e[1])+1.7,e[1],ms.x-10,terrainH(ms.x,ms.z)+6,ms.z-50];}
  V['The lit south avenue']=[-3,terrainH(-3,QC_B.z1-30)+1.7,QC_B.z1-30,4,terrainH(4,QC_B.z1-220)+4,QC_B.z1-220];}
 // a wheel house nearest the Temple Mountain, from its open front: the wheel, the hangings, the lamps
 const wh=QC_PLACE.filter(p=>p.key==='qb_wheel_house').sort((a,b)=>Math.hypot(a.x-L0.x,a.z-L0.z)-Math.hypot(b.x-L0.x,b.z-L0.z))[0];
 if(wh){const y=qcD(wh.o.y,0),e=loc(wh.x,wh.z,2.2,5.2,wh.ry),g=loc(wh.x,wh.z,-1.5,-4.8,wh.ry);V['Inside a wheel house']=[e[0],y+.8+1.6,e[1],g[0],y+.8+1.8,g[1]];}
 // the four meditation gardens in the corners, each from above its two gates (from inside the city, looking to the corner)
 for(const p of QC_PLACE)if(p.kind==='meditation'){const sx=Math.sign(p.x-L.x),sz=Math.sign(p.z-L.z),cx=p.x-sx*52,cz=p.z-sz*52;
  V['Meditation garden: '+QMED[p.o.v].name]=[cx,terrainH(cx,cz)+34,cz,p.x,terrainH(p.x,p.z)+1,p.z];}
 return V;})();
// the city as one budget (as Erewhon's 93-er-ui.js): every type in the class 'city'
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
