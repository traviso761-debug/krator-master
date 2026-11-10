// ================================================================= HOST — the site (station 1: Vitreous Hollow)
// PLAN.md section 7, station 1: the Vitreous Boxwork Tarn's cauldron. On the scale model (5.1) the tarn lies at 2,950 m, ~15 x 11 km on
// the 1 km grid round px 1258,326, its walls rising to 4.3-4.8 km within 6 km (the lowest crest out 3,728 m, north toward Spider Lake). The
// page stands on its SOUTH-EAST SHORE (px 1260.75,327.8: region/far.py), y = 0 at the water: the tarn fills the north-west of the box, the
// cauldron's wall rises ~800 m in the first 700 m south and east of it, then eases onto the rim's slopes (+1.4 km at 2.4 km).
//
// WHAT THE STATION ADDS ON THE MODEL (each a plain record, JSON-safe; the export carries them):
//   the SPRING APRON  the model's 1 km grid has no shore: the tarn's cells meet the wall's. The apron is the bench the springs and the wall's
//                     fall have built out from the wall's foot: talus and sinter, ~350 m wide, rising from the water at ~7% to meet the wall.
//                     Its toe is a line (APRON.toe); the apron's height is a plain function of the signed distance in from it
//   the DIKES         KSTACKS.row fins (core/terrain 37, PLAN.md section 2 item 3: basalt and diabase dikes weathered out of the skarn as
//                     walls, boxing the ground into cells): two on one strike (N25E) crossing the apron into the tarn, a third across
//                     them out in the water (the cell's north side, a line of islets). Their feet are set under the lowest ground round them
//   the TALUS         KRELIEF.talus (38) banked against the fins' feet
//   the SPRINGS       the Outland Gate fault's hot water at the wall's foot inside the cell (PLAN.md section 2 item 4): a main spring and
//                     a few lesser pools along the foot (WATER.spring: 47 makes the records, 89w draws them)
//   the SINTER STAIR  the main spring's run-off stepping down the apron to the tarn: WATER.terraces' treads, the ground under them cut level
//                     and each tread's lip a sinter dam (a 2 m KFIELD inset holds them: 47)
// The site is DATA the stage (45) reads: siteBuild(ground) makes the records once the model's ground exists; siteRelief(x, z) is then
// metres over the model; sitePoint(x, z) each record's part there (the zones' fields: 47).
const SITE={
 name:'vitreous',title:'Vitreous Hollow',R:1600,step:8,seed:6101,
 // the climate is the tarn's warm pocket (region/far.py 'clim': the WH cell, +9 °C at the water); its swing (PLAN.md section 3: 16 / 2)
 amp:{warm:7,cold:7},
 // the apron's toe (the new shoreline, page metres, west to north-east round the cauldron's south-east corner), its rise inland (m a m)
 // and its front under the water; reach: how far in from the toe it can run before the wall's own ground takes over
 apron:{toe:[[-2600,-760],[-1800,-790],[-1000,-800],[-300,-820],[250,-860],[650,-960],[930,-1180],[1080,-1520],[1150,-2000],[1200,-2700]],
  rise:.07,front:.5,lift:1.6,reach:520},
 // the dikes (KSTACKS.row): a, b the strike's ends (page metres), n fins, H their height over the lowest ground round the foot, r the
 // foot's half-width, e the elongation (half-length r*e)
 dikes:[
  {id:'dikeW',a:[-1180,120],b:[-560,-1240],n:9,H:[60,150],r:[9,15],e:[3.5,5.5],seed:6111},
  {id:'dikeE',a:[260,60],b:[640,-860],n:6,H:[50,130],r:[8,13],e:[3.5,5],seed:6112},
  {id:'dikeN',a:[-1500,-1420],b:[380,-1560],n:7,H:[30,70],r:[8,14],e:[3,5],seed:6113}],
 // the springs: along the wall's foot between the two dikes (u: 0 the west dike .. 1 the east), the first the main spring
 springs:[{u:.48,r:13,temp:.95,mineral:'sinter',name:'The Vitreous Spring (the cell\'s main vent: boiling, glass-clear over its blue throat)'},
  {u:.22,r:7,temp:.72,mineral:'sinter',name:'A warm pool at the wall\'s foot'},
  {u:.33,r:5,temp:.6,mineral:'iron',name:'A rust pool (iron from the skarn\'s magnetite)'},
  {u:.66,r:8,temp:.8,mineral:'sinter',name:'A hot pool at the wall\'s foot'},
  {u:.8,r:5.5,temp:.55,mineral:'copper',name:'A green pool (copper from the skarn)'}],
 // the sinter stair: from the main spring down the apron to the tarn; treads, its width, the lip's sinter dam (m over the tread)
 stair:{treads:7,w:26,dam:.35,step:2},
 snow:{autumn:[1500,2100],winter:[300,500],spring:[900,1300],summer:[2600,3200]},
 // the hour the page opens at: 13:00 (at 10:00, the frame's usual, the giant eclipses the sun here: ATMOS.sunHidden at this pixel and
 // day is over 0 from 09:00 to 10:59; the station lies 23 degrees east of the W outer wall's, toward the sub-giant point)
 hour:13,
 eye:30,
 views:V=>{const S=SITE_SPRINGS[0],T=SITE_STAIR,toe=APRON_PT(-.25,40),b=SITE_DIKE_MID('dikeW'),c=SITE_DIKE_MID('dikeE'),o={
  'The Vitreous Spring':V([S.x+38,S.z-30,4],[S.x,S.z,0]),
  'Down the sinter stair to the tarn':V([T.a[0]+(T.a[0]-T.b[0])*.08,T.a[1]+(T.a[1]-T.b[1])*.08,6],[T.b[0],T.b[1],0]),
  'The cell from the tarn (the dikes and the wall)':V([toe[0],toe[1]-260,3],[S.x,S.z,60]),
  'The west dike (a basalt wall across the apron)':V([b[0]+170,b[1]+40,4],[b[0],b[1],60]),
  'The east dike':V([c[0]-150,c[1]-60,4],[c[0],c[1],50]),
  'The grove on the apron':V(APRON_PT(-.55,180).concat([2.2]).slice(0,3),APRON_PT(-.45,260).concat([4]).slice(0,3)),
  'The hollow from the wall':V([-200,400,40],[-600,-2500,0]),
  'Across the tarn':V([toe[0]+200,toe[1]+50,8],[-5000,-6000,200])};
  return o;}
};
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
let SITE_RECS=null,SITE_SPRINGS=[],SITE_STAIR=null,DIKES=[],TALUS=null;
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
 SITE_RECS={apron:SITE.apron,dikes:DIKES.map(B=>({id:B.id,dike:B.dike,x:B.x,z:B.z,y0:B.y0,top:B.top})),springs:SITE_SPRINGS,stair:SITE_STAIR};
 return SITE_RECS;}
// a spring's station on the toe (APRON_PT's t) from its place in the cell (u: 0 the west dike .. 1 the east): the dikes cross the toe at
// t -.29 and .24 (their lines against SITE.apron.toe)
function SPRING_T(u){return -.26+.47*u;}
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
