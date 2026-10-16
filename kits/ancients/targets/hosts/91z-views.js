// Budgets for the host types (91-probe.js reads BUDGET at measure time): the brief's ceilings, a ruined tower
// 100 k triangles and a mid-rise 50 k, as two classes of their own so an overrun reports against them.
Object.assign(BUDGET.cls,{hostSky:100000,hostMid:50000});
for(const k in HOSTS_NAME)BUDGET.type[k]=ROWS[k].t?'hostSky':'hostMid';
for(const k in HOSTS_ROW)BUDGET.type[HOSTS_ROW[k]]=ROWS[k].t?'hostSky':'hostMid';
// Presets: the sheet, then per type a hero of each decay, the host row (cut, podium shrunk, a way-in hole), a close
// shot at eye level and, for the towers, the toppled body and the Project by night. HOSTS_FRAME per type: [hero
// target height, camera distance, close-up [dx,y,dz,tx,ty,tz] relative to the intact site].
const HOSTS_FRAME={skyL:[190,760,[60,6,120,0,60,0]],skyM:[160,760,[80,6,140,0,50,0]],
 midArcades:[30,190,[20,3,75,0,18,0]],midStalks:[32,190,[30,3,80,0,24,0]],midBell:[30,200,[10,3,85,10,26,0]]};
const VIEWS=(function(){const V={};
 const zs=Object.values(ROWS).map(R=>R.z),z0=Math.min(...zs),z1=Math.max(...zs);
 V['The sheet']=[1500,1300,(z0+z1)/2+900,0,40,(z0+z1)/2];
 for(const k in HOSTS_NAME){const R=ROWS[k],F=HOSTS_FRAME[k]||[60,300,[30,3,80,0,20,0]],n=HOSTS_NAME[k].replace(/^.* — /,'').replace(/^the /i,''),ty=F[0],D=F[1],c=F[2],RH=ROWS[HOSTS_ROW[k]];
  const hero=(x,z,ni)=>[x-D*.3,ty*.9+D*.1,z+D,x,ty,z].concat(ni?[1]:[]);
  V[n]=hero(-R.s,R.z);
  V[n+' ruined']=hero(R.s,R.z);
  V[n+' reclaimed']=hero(0,R.z);
  if(RH){const w=HOSTS_WAY[HOSTS_ROW[k]+'/1'];
   V[n+' as a host']=w?[w.x+Math.cos(w.a)*D*.35+D*.08,w.y+D*.08,w.z+Math.sin(w.a)*D*.35,R.s,w.y*.8,RH.z]:hero(R.s,RH.z);
   V[n+' reclaimed host']=hero(0,RH.z);}
  V[n+' close']=[-R.s+c[0],c[1],R.z+c[2],-R.s+c[3],c[4],R.z+c[5]];
  if(R.t){V[n+' toppled']=[R.t+120,140,R.z+620,R.t+160,40,R.z];V[n+' Project by night']=hero(R.j,R.z,1);}}
 return V;})();
