// ================================================================= HOST — the site: the cauldron's landforms on the model (every station)
// The functions that build a station's landforms from its record (44r: SITE) and read them at a point. Station 1 (Vitreous Hollow) wrote
// them; a cauldron station gives its own record. What a station adds on the model (each a plain record, JSON-safe; the export carries
// them): the SPRING APRON (the shore the 1 km model lacks: talus and sinter built out from the wall's foot, a plain function of the signed
// distance in from its toe), the DIKES (KSTACKS.row fins, PLAN.md section 2 item 3, their feet under the lowest ground round them and their
// height over the water where they stand in the tarn), the TALUS (KRELIEF.talus against the fins' feet), the SPRINGS (the Outland Gate
// fault's hot water at the wall's foot inside the cell: WATER.spring, 89w), the SINTER STAIR (the main spring's run-off: WATER.terraces'
// treads, cut level into the apron, each lip a sinter dam).
// The site is DATA the stage (45) reads: siteBuild(ground) makes the records once the model's ground exists; siteRelief(x, z) is then
// metres over the model; sitePoint(x, z) each record's part there (the zones' fields: 47).
// ---------------------------------------------------------------- the apron: a signed distance in from its toe
// the toe's segments (a polyline): d > 0 inland (to the line's right, walking it west to east: the south and east side), d < 0 lakeward
const _toe=SITE.apron.toe;
function apronD(x,z){let best=1e18,sg=1;for(let i=0;i<_toe.length-1;i++){const a=_toe[i],b=_toe[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,
  t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2)),qx=a[0]+dx*t-x,qz=a[1]+dz*t-z,d2=qx*qx+qz*qz;
  if(d2<best){best=d2;sg=(dx*(z-a[1])-dz*(x-a[0]))>=0?1:-1;}}
 return sg*Math.sqrt(best);}
// the apron's surface over the tarn's level: a few metres at its toe, rising inland; its front drops steeply under the water; the
// roughness of talus and sinter lobes on it (core/rand's noise, never a page fbm)
function apronY(x,z,d){const A=SITE.apron,n=4*(KRAND.fbm(x*.004+2.2,z*.004-6.1,0,3,6102)-.5)*2+1.2*(KRAND.fbm(x*.03,z*.03,0,2,6103)-.5)*2;
 return d>=0?A.lift+A.rise*d+n*smooth(0,60,d):A.lift+A.front*d;}
// a point on the toe at t (-1 the west end .. 1 the east; 0 its middle by length), pushed `inland` metres in (the views)
function APRON_PT(t,inland){const L=[0];for(let i=1;i<_toe.length;i++)L.push(L[i-1]+Math.hypot(_toe[i][0]-_toe[i-1][0],_toe[i][1]-_toe[i-1][1]));
 const s=(t+1)/2*L[L.length-1];let i=0;while(i<_toe.length-2&&L[i+1]<s)i++;const a=_toe[i],b=_toe[i+1],k=(s-L[i])/(L[i+1]-L[i]),dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz);
 return [a[0]+dx*k-dz/n*inland,a[1]+dz*k+dx/n*inland];}
// THE RECORDS (made once the model's ground exists: 45 calls siteBuild): plain data, JSON-safe
let SITE_RECS=null,SITE_SPRINGS=[],SITE_STAIR=null,DIKES=[],TALUS=null,SITE_MOUTHS=[];
const _g0={f:null};
// the apron and the model: the higher wins inland (the wall's foot is the model's), the apron's front lakeward; past its reach the model
function apronGround(x,z,m){const d=apronD(x,z),A=SITE.apron;if(d>A.reach||d<-80)return m;const y=apronY(x,z,d);
 return d>=0?Math.max(m,y):Math.max(m,Math.min(y,m+40));}
function siteBuild(ground){_g0.f=ground;const g1=(x,z)=>apronGround(x,z,ground(x,z));
 // the dikes: each fin's foot under the lowest ground round it (fins on the wall's slope bury their uphill side)
 const low=(x,z,r)=>{let m=g1(x,z);for(let i=0;i<12;i++){const a=i/12*TAU;m=Math.min(m,g1(x+Math.cos(a)*r,z+Math.sin(a)*r));}return m;};
 // a fin standing in the tarn: its height is over the WATER, not the bed (lift: the bed's depth under the level, so a fin in 80 m of water
 // still stands its 30-70 m out of it)
 DIKES=[];SITE.dikes.forEach(D=>{const fins=KSTACKS.row({id:D.id,seed:D.seed,a:D.a,b:D.b,n:D.n,kind:'fin',H:D.H,r:D.r,e:D.e,jitter:10,taper:[.25,.45],
   ground:(x,z)=>low(x,z,D.r[1]*D.e[1]*.8),lift:(x,z,r)=>Math.max(0,-low(x,z,r))});
  fins.forEach(B=>{B.dike=D.id;B.name='A dike (basalt weathered out of the skarn as a wall, '+(B.top-B.y0).toFixed(0)+' m)';DIKES.push(B);});});
 // the talus banked against the fins' feet
 TALUS=KRELIEF.talus({bodies:DIKES,h:12,reach:40,seed:SITE.seed+7});
 // the springs at the wall's foot between the two dikes: each at a station along the toe (SPRING_T: the cell's span between the dikes'
 // crossings, kept 60 m off each), walking in from the toe until the model rises over the apron (the wall's foot), then 20 m and the
 // pool's radius back out onto the apron
 SITE_SPRINGS=SITE.springs.map((S,i)=>{const t=SPRING_T(S.u),tA=APRON_PT(t,0),tB=APRON_PT(t,1),nx=tB[0]-tA[0],nz=tB[1]-tA[1];let q=null;
  for(let d=40;d<SITE.apron.reach;d+=4){const x=tA[0]+nx*d,z=tA[1]+nz*d;if(ground(x,z)>apronY(x,z,d)-.5){q=[x-nx*(20+S.r),z-nz*(20+S.r),d-20-S.r];break;}}
  if(!q)q=[tA[0]+nx*300,tA[1]+nz*300,300];
  // its level: the apron's surface at its middle, a little under (the pool brims in a basin cut into the apron, its downhill side a sinter rim)
  return {key:'spring'+i,name:S.name,x:q[0],z:q[1],r:S.r,temp:S.temp,mineral:S.mineral,d:q[2],main:i===0,t,n:[nx,nz],toe:tA,level:apronY(q[0],q[1],q[2])-.3};});
 // the sinter stair: from the main spring's lip, straight down the apron's slope to the toe; its treads' levels from the apron there to
 // just over the tarn
 const S0=SITE_SPRINGS[0],nx=S0.n[0],nz=S0.n[1];
 const a=[S0.x-nx*(S0.r+2),S0.z-nz*(S0.r+2)],b=[S0.toe[0]-nx*6,S0.toe[1]-nz*6],top=apronY(a[0],a[1],apronD(a[0],a[1]))-.6;
 const N=SITE.stair.treads,lv=[];for(let k=0;k<N;k++)lv.push(top-(top-.6)*k/(N-1));
 SITE_STAIR={a,b,levels:lv,w:SITE.stair.w,n:[nx,nz],len:Math.hypot(b[0]-a[0],b[1]-a[1])};
 // a cave's mouth (station 5: the Epidote Cave's inner mouth): from its station on the toe, in across the apron to the wall's foot (where
 // the ground rises 2 m over the apron), facing out of the rock; its floor the apron's there (47 cuts it: KCARVE)
 SITE_MOUTHS=(SITE.mouths||[]).map(M=>{const tA=APRON_PT(M.t,0),tB=APRON_PT(M.t,1),nx=tB[0]-tA[0],nz=tB[1]-tA[1];let c=null;
  for(let d=10;d<SITE.apron.reach+200;d+=2){const x=tA[0]+nx*d,z=tA[1]+nz*d,dd=Math.min(d,SITE.apron.reach);if(ground(x,z)>apronY(x,z,dd)+2){c=[x,z,dd];break;}}
  if(!c)c=[tA[0]+nx*200,tA[1]+nz*200,Math.min(200,SITE.apron.reach)];
  return {id:M.id,name:M.name,c:[c[0],c[1]],n:[-nx,-nz],hw:M.hw,depth:M.depth,h:M.h,floorY:apronY(c[0],c[1],c[2])+.2};});
 SITE_RECS={mouths:SITE_MOUTHS,apron:SITE.apron,dikes:DIKES.map(B=>({id:B.id,dike:B.dike,x:B.x,z:B.z,y0:B.y0,top:B.top})),springs:SITE_SPRINGS,stair:SITE_STAIR};
 return SITE_RECS;}
// a spring's station on the toe (APRON_PT's t) from its place in the cell (u: 0 the west dike .. 1 the east): SITE.springT [from, span]
function SPRING_T(u){const T=SITE.springT||[-.26,.47];return T[0]+T[1]*u;}
// the stair's frame at a point: s along it (0 at the spring .. len at the toe), u across; the tread there and its level
function stairAt(x,z){const T=SITE_STAIR;if(!T)return null;const dx=T.b[0]-T.a[0],dz=T.b[1]-T.a[1],L=T.len,ux=dx/L,uz=dz/L,qx=x-T.a[0],qz=z-T.a[1],s=qx*ux+qz*uz,u=-qx*uz+qz*ux;
 if(s<-12||s>L+12||Math.abs(u)>T.w/2+14)return null;const n=T.levels.length,k=Math.max(0,Math.min(n-1,Math.floor(s/L*n))),f=s/L*n-k;
 return {s,u,k,f,y:T.levels[k],edge:Math.abs(u)-T.w/2};}
// the middle of a dike's line (the views)
function SITE_DIKE_MID(id){const D=SITE.dikes.find(q=>q.id===id);return [(D.a[0]+D.b[0])/2,(D.a[1]+D.b[1])/2];}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and each record's part
// g0 the model (its tarn's bed deepened: 45, tarnBed), then the apron (and its front), then the stair cut level into it (each tread a still, its lip a sinter dam), then the talus
// against the fins' feet; a fin's footprint marked (KSTACKS.foot)
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const m=tarnBed(MODEL(x,z)),d=apronD(x,z),ga=apronGround(x,z,m);
 let y=ga,part=ga>m+.5?(d<0?'front':'apron'):'model',tread=null;
 // the stair: inside its width a tread's bed under the water (its last eighth the lip's sinter dam over it), along its sides a low rim;
 // eased back into the apron over 10 m out and 12 m past its ends
 const T=stairAt(x,z);if(T){const k=smooth(10,0,T.edge)*smooth(-12,0,T.s)*smooth(SITE_STAIR.len+12,SITE_STAIR.len,T.s);
  if(k>0){const dam=T.f>.88&&T.k<SITE_STAIR.levels.length-1,tgt=T.edge<=0?(dam?T.y+SITE.stair.dam:T.y-.45):T.y+.3;y=y+(tgt-y)*k;
   if(T.edge<=0&&k>.99){part='stair';tread=T.k;}}}
 // a spring's basin: a bowl under its level inside its radius, a sinter rim a hand over the level for 4 m round it (the downhill side
 // stands as a dam over the apron; the uphill side is the apron's own bank)
 for(const S of SITE_SPRINGS){const q=Math.hypot(x-S.x,z-S.z);if(q>S.r+5)continue;
  if(q<S.r){const u=q/S.r;y=Math.min(y,S.level-.5-Math.min(2.5,S.r*.18)*(1-u*u));part='spring';}
  else{const k=smooth(S.r+5,S.r+1,q);y=Math.max(y,y+(S.level+.25-y)*k*(y<S.level+.25?1:0));}break;}
 const tal=TALUS?TALUS(x,z):0;if(tal>.05&&part!=='stair'&&part!=='spring'){y+=tal;if(tal>2)part='talus';}
 // a fin's footprint: the ground stays as it is (the fin is its own mesh, 47, its foot buried under the lowest ground round it); the part
 // says nothing grows there
 let dk=null;const f=DIKES.length?KSTACKS.foot(DIKES,x,z):null;if(f&&f.d<.5){dk=f.S;part='dike';}
 const P={m,d,y,rel:y-m,part,tread,dike:dk?dk.id:null,dikeD:f?f.d:1e9,talus:tal};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
// THE RELIEF (metres over the model's ground, the tarn's bed deepened: 45 adds it to tarnBed(MODEL))
function siteRelief(x,z){return sitePoint(x,z).rel;}
// the zones' site fields: on the apron, on the stair, on a dike
function siteApron(x,z){const P=sitePoint(x,z);return P.part==='apron'||P.part==='stair'||P.part==='talus'&&P.d>0?1:0;}
