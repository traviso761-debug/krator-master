// ================================================================= BLAKHED — the build: the Fellgang town, the villages, the Golden Tears, the toll post
// Every record of the plan is drawn here, none placed (89zb made them):
//   the Fellgang buildings  through the Tungang kit's host API (TG.fg.draw: seated by the kit, floor at the highest corner, plinth to
//                           the lowest), the town in 300 m chunks and each village in one; in town with catalog furniture, KWALK floors
//                           and wall blocks, operable KDOOR plate doors, drystone threshold steps on slopes, and XA_CUT cutaway units (B6)
//   the road & site pieces  wagons, halts, lantern posts, ice tools, Fair hurdles, peace stone, cairns, road signs, Stairhead hoists (TG.fg.pieces)
//   the Golden Tears' compound and Dalab's toll post  the Xanadu kit's (with hollow interiors, podiums & steps, B6) and the Dalab set's pieces
//   page geometry           the Golden Tears' compound wall, the gorge switchback stair's steps and rails, the Winterings' fire ring
// [web]: three.js.
reseed(BK.SEED+2);const BK_B0=performance.now();
const BK_IX_ON=!/[?&]interiors=0\b/.test(location.search),BK_FURN_ON=!/[?&]furniture=0\b/.test(location.search);
const BK_GROUPS=[],BK_TOWN_RECS={};
const bkSphere=(list,pad)=>{let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;for(const r of list){x0=Math.min(x0,r.x-pad);x1=Math.max(x1,r.x+pad);z0=Math.min(z0,r.z-pad);z1=Math.max(z1,r.z+pad);
  const y=terrainH(r.x,r.z);y0=Math.min(y0,y-10);y1=Math.max(y1,y+20);}
 return new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+10);};
const BK_DRAW={recs:0,tris:0,missing:{},lights:[],halls:[],draws:0,errors:[],furniture:0,doors:0,stairs:[],hoists:0};
function bkFg(list,o,range,name){if(!list.length)return null;
 try{const D=TG.fg.draw({records:list,id:o.id||name,focus:o.focus,census:o.census},Object.assign({scene,ground:terrainH,label:name},o));
  D.group.name='chunk:'+name;D.group.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.userData.fgChunk=true;}});
  BK_DRAW.recs+=D.recs.length;BK_DRAW.tris+=D.tris;BK_DRAW.draws++;Object.assign(BK_DRAW.missing,D.missing);BK_DRAW.lights.push(...(D.lights||[]));
  BK_DRAW.furniture+=D.group.userData.furniture|0;BK_DRAW.doors+=D.doorLeaves|0;
  for(const rec of D.recs){if(rec.id)BK_TOWN_RECS[rec.id]=rec;if(rec.stair)BK_DRAW.stairs.push(rec);}
  BK_GROUPS.push({G:D.group,sphere:bkSphere(list,30),range,name,n:list.length});return D;}
 catch(e){BK_DRAW.errors.push(name+': '+(e&&e.message||e));reportErr('blakhed: '+name+': '+(e&&e.stack||e));return null;}}
// ---------------------------------------------------------------- the town: the double hall, then the rest in 300 m chunks
if(BK_PLAN){const fgRecs=BK_PLAN.records.filter(r=>r.set==='fg');
 const townOpt={walk:BK_IX_ON&&typeof KWALK!=='undefined',doors:BK_IX_ON,steps:BK_IX_ON,furnish:BK_IX_ON&&BK_FURN_ON};
 for(const r of fgRecs.filter(r=>r.kind==='hall')){
  const D=bkFg([r],Object.assign({seed:BK.SEED+3,variant:r.variant,pegs:72,slats:48,id:'blakhed.doublehall'},townOpt),1e9,r.name);
  if(D)BK_DRAW.halls.push(Object.assign({variant:r.variant},D.recs[0]&&D.recs[0].fg||{}));}
 const CH={};for(const r of fgRecs){if(r.kind==='hall')continue;const k=Math.floor(r.x/300)+','+Math.floor(r.z/300);(CH[k]=CH[k]||[]).push(r);}
 for(const k of Object.keys(CH).sort())bkFg(CH[k],Object.assign({seed:BK.SEED+10,id:'blakhed.town'},townOpt),2600,'Blakhed: the town ('+k+')');
 /* cutaway units (core/host X): civic and quarter landmarks first, then town dwellings */
 if(BK_IX_ON&&typeof XA_CUT!=='undefined'){
  const ord=fgRecs.slice().sort((a,b)=>(a.quarter==='houses')-(b.quarter==='houses'));
  for(const r of ord){const D=TG.DEFS[r.key],rec=BK_TOWN_RECS[r.id];if(!D||!D.cut||!rec)continue;
   XA_CUT.push({id:'fg.'+r.id,name:r.name||(D.name+' ('+r.quarter+')'),x:r.x,z:r.z,ry:bkD(r.ry,0),w:r.w+.8,d:r.d+.8,levels:[{y:rec.y,h:r.h,name:'room'}]});}}
 try{const P=TG.fg.pieces(BK_PLAN.pieces,{scene,ground:terrainH,label:'Blakhed: wagons, halts, lanterns, ice tools, Fair hurdles, peace stone and road signs'});
  P.group.name='chunk:pieces';P.group.traverse(m=>{if(m.isMesh)m.userData.fgChunk=true;});BK_DRAW.pieces=P.recs.length;BK_DRAW.lights.push(...(P.lights||[]));
  BK_DRAW.furniture+=P.group.userData.furniture|0;
  BK_GROUPS.push({G:P.group,sphere:bkSphere(BK_PLAN.pieces,10),range:1800,name:'pieces',n:P.recs.length});}
 catch(e){BK_DRAW.errors.push('pieces: '+e.message);reportErr('blakhed pieces: '+(e&&e.stack||e));}}
if(BK_RINGS&&BK_RINGS.hoists&&BK_RINGS.hoists.length){
 try{const H=TG.fg.pieces(BK_RINGS.hoists,{scene,ground:terrainH,label:'The Stairhead: the gin wheels and lowering frames'});
  H.group.name='chunk:hoists';H.group.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.userData.fgChunk=true;}});
  BK_DRAW.hoists=H.recs.length;BK_GROUPS.push({G:H.group,sphere:bkSphere(BK_RINGS.hoists,25),range:3600,name:'hoists',n:H.recs.length});}
 catch(e){BK_DRAW.errors.push('hoists: '+e.message);reportErr('blakhed hoists: '+(e&&e.stack||e));}}
// ---------------------------------------------------------------- the villages (the steadings, the Stairhead, the hamlets in the country)
for(const V of BK_VILLAGES)if(V.drawn&&V.records&&V.records.length)
 bkFg(V.records.map(r=>Object.assign({},r)),{seed:BK.SEED+20+(bkHash(V.id)%97),id:V.id,focus:V.focus==='ice'?'ice':V.focus,census:V.census,
  character:V.focus==='ice'?'low':null,furnish:V.kind!=='hamlet'&&BK_IX_ON&&BK_FURN_ON,steps:V.kind!=='hamlet'},V.kind==='hamlet'?5000:3600,V.name);

// ---------------------------------------------------------------- the Xanadu kit's (Golden Tears) and Dalab set's pieces (VERN.place)
const BK_VGROUPS=[],BK_XA_STAIRS=[];let BK_INST=0;
const bkWood=xC(0x6a5a46),bkStone=xC(0x7a766c);
/* seat a Xanadu or Dalab piece at its footprint's highest corner, with a dressed-stone podium down to its lowest and front steps on slopes */
function bkSeatXa(p){const D=VERN.defs[p.key]||{w:10,d:10},w=bkD(D.fw,D.w)+.3,d=bkD(D.fd,D.d)+.3,ry=bkD(p.ry,0),c=Math.cos(ry),s=Math.sin(ry);
 let hi=terrainH(p.x,p.z),lo=hi;const C=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[p.x+a*w/2*c+b*d/2*s,p.z-a*w/2*s+b*d/2*c]);
 for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4],ha=terrainH(a[0],a[1]),hm=terrainH((a[0]+b[0])/2,(a[1]+b[1])/2);hi=Math.max(hi,ha,hm);lo=Math.min(lo,ha,hm);}
 return{D,y:hi,lo,w:bkD(D.w,10),d:bkD(D.d,10),fw:bkD(D.fw,bkD(D.w,10)),fd:bkD(D.fd,bkD(D.d,10))};}
function bkPodiumXa(p,S){const ry=bkD(p.ry,0),f=[Math.sin(ry),Math.cos(ry)],u=[Math.cos(ry),-Math.sin(ry)];
 if(S.y-S.lo>.2){TSTAT.cur='bk_podium/0';vB('vStone',p.x,S.lo-.4,p.z,S.w+.3,S.y-S.lo+.4,S.d+.3,ry,bkStone);vB('vStone',p.x,S.y-.24,p.z,S.w+.5,.24,S.d+.5,ry,xC(0x948e82));}
 if(typeof KWALK!=='undefined'&&(p.set==='xa'||p.set==='dalab')){
  const fw=S.w+.3,Q=[[-fw/2,-S.d/2-.15],[fw/2,-S.d/2-.15],[fw/2,S.d/2+.3],[-fw/2,S.d/2+.3]].map(([sx,tz])=>[p.x+u[0]*sx+f[0]*tz,p.z+u[1]*sx+f[1]*tz,S.y]);
  KWALK.poly({pts:Q,name:p.id+'.apron',tag:'blakhed:podium:'+p.id});
  if(p.key==='xa_serai'){const cw=19.8,CQ=[[-cw,-cw],[cw,-cw],[cw,cw],[-cw,cw]].map(([sx,tz])=>[p.x+u[0]*sx+f[0]*tz,p.z+u[1]*sx+f[1]*tz,S.y+.35]);
   KWALK.poly({pts:CQ,name:p.id+'.court',tag:'blakhed:podium:'+p.id});}
  const dz=S.d/2+.9,fx1=p.x+f[0]*(S.d/2+.2),fz1=p.z+f[1]*(S.d/2+.2),g0=terrainH(p.x+f[0]*dz,p.z+f[1]*dz);
  if(S.y-g0>=.24){const run=Math.min(4.8,Math.max(.8,(S.y-g0)*1.6)),fx0=p.x+f[0]*(S.d/2+.2+run),fz0=p.z+f[1]*(S.d/2+.2+run),y0=terrainH(fx0,fz0),n=Math.max(1,Math.ceil((S.y-y0)/.19)),go=run/n;
   TSTAT.cur='bk_podium/0';
   for(let i=0;i<n;i++){const t=(i+.5)/n,cx=fx0+(fx1-fx0)*t,cz=fz0+(fz1-fz0)*t,top=y0+(S.y-y0)*(i+1)/n,gb=Math.min(terrainH(cx,cz),y0+(S.y-y0)*i/n)-.35;
    if(top>gb+.04)vB('vStone',cx,gb,cz,2.4,top-gb,go+.03,ry,bkStone);}
   KWALK.strip({a:[fx0,fz0,y0],b:[fx1,fz1,S.y],w:2.4,name:p.id+'.steps',tag:'blakhed:steps:'+p.id});
   const st={id:p.id,key:p.key,n,x0:fx0,z0:fz0,y0,x1:fx1,z1:fz1,y1:S.y};p.stair=st;if(p.set==='xa')BK_XA_STAIRS.push(st);}}}
function bkBake(name,list,extra,range,ixOn){const G=new THREE.Group();G.name='chunk:'+name;scene.add(G);
 if(typeof XAF!=='undefined'){XAF.interiors=!!ixOn;VERN.interiors=!!ixOn;}
 for(const p of list){const S=bkSeatXa(p);bkPodiumXa(p,S);
  TSTAT.cur=p.key+'/0';const r0=REG.length,o={v:0,y:S.y};const g=VERN.place(G,p.key,p.x,p.z,bkD(p.ry,0),o);
  if(g){p.G=g;p.floorY=S.y;p.ix=!!(ixOn&&g.userData&&g.userData.interior);}
  for(let i=r0;i<REG.length;i++){REG[i].type=p.key;if(p.name&&i===r0)REG[i].name=p.name;
   /* keep only the compound's primary temple/caravanserai as a permanent skyline landmark label; sibling buildings fade past 320 m */
   if(REG[i].tags&&p.key!=='dalab_temple'&&p.key!=='xa_serai'){REG[i].tags=Object.assign({},REG[i].tags);delete REG[i].tags.role;delete REG[i].tags.landmark;}}}
 if(extra)extra();TSTAT.cur=null;kbake(G);if(typeof xaDoorsBind==='function')xaDoorsBind();BK_INST+=bkD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const pts=list.length?list:[{x:extra&&extra.at?extra.at[0]:0,z:extra&&extra.at?extra.at[1]:0}];
 BK_GROUPS.push({G,sphere:bkSphere(pts,90),range:bkD(range,3000),name,n:list.length});BK_VGROUPS.push(G);return G;}
function bkRails(P,step,h,closed){const Q=closed?P.concat([P[0]]):P;for(let i=0;i+1<Q.length;i++){const a=Q[i],b=Q[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/step)),ry=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;
  for(let k=0;k<n;k++){const t=(k+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=terrainH(x,z);vB('vWood',x,y-.3,z,.16,h+.3,.16,0,bkWood);
   for(const hh of[h*.45,h*.9])vB('vWood',x,y+hh,z,L/n+.1,.09,.07,ry,bkWood);}}}
const BK_PAGE={steps:0,wall:0,dalabWall:0,truceKerb:0};
// the Golden Tears' compound: its Xanadu pieces (with hollow interiors when BK_IX_ON) and its rammed-earth wall with east gate
const BK_TEARS_LIST=BK_PLAN?BK_PLAN.records.filter(r=>r.quarter==='tears'):[];
const BK_DALAB_LIST=BK_PLAN?BK_PLAN.records.filter(r=>r.quarter==='dalab'):[];
if(BK_PLAN){const T=BK_TOWN.TEARS;
 bkBake('the Golden Tears',BK_TEARS_LIST,()=>{TSTAT.cur='bk_tears_wall/0';const cs=Math.cos(T.ry),sn=Math.sin(T.ry),at=(lx,lz)=>[T.c[0]+lx*cs+lz*sn,T.c[1]-lx*sn+lz*cs],hw=T.w/2-4,hd=T.d/2-4;
  const C=[at(-hw,-hd),at(hw,-hd),at(hw,hd),at(-hw,hd)];
  for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2,n=Math.ceil(L/8);
   for(let k=0;k<n;k++){const t=(k+.5)/n;if(i===1&&Math.abs(t-.5)<.06)continue;
    const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;vB('xEarthB',x,terrainH(x,z)-.4,z,L/n+.05,3.6,.7,ry,xC(0xb8a27e));BK_PAGE.wall++;}}
  REG.push({name:'The Golden Tears',key:'bk_tears_wall',type:'bk_tears_wall',cls:'building',x:T.c[0],y:terrainH(T.c[0],T.c[1]),z:T.c[1],r:T.w/2,h:8,tags:{landmark:true}});},3200,BK_IX_ON);
 /* Dalab's mission near the centre of town (~134 people): its 13 Dalab pieces and a low rammed-earth compound wall with relief gate piers */
 const D=BK_TOWN.DALAB;
 bkBake('the Dalab mission',BK_DALAB_LIST,()=>{TSTAT.cur='bk_dalab_wall/0';const Q=D.poly,ec=dCol(DPAL.earth),ed=dCol(DPAL.earthDark),sc=dCol(DPAL.stone);
  for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz)+Math.PI/2,n=Math.max(3,Math.ceil(L/7.5));
   const hasGate=i===3||i===2;
   for(let k=0;k<n;k++){const t=(k+.5)/n,x=a[0]+dx*t,z=a[1]+dz*t,y=terrainH(x,z);
    if(hasGate&&Math.abs(t-.5)<.11){if(Math.abs(Math.abs(t-.5)-.08)<.04){vB('vStone',x,y-.35,z,1.5,3.4,1.3,ry,sc);dnReliefBand(x,y+.5,z,ry,1.1,2.2,sc);dnBannerPole(x,y,z,ry,5.8,dCol(i===3?DPAL.red:DPAL.turq));}continue;}
    vB('dEarth',x,y-.35,z,L/n+.06,2.4,.75,ry,ec);vB('dEarth',x,y+1.98,z,L/n+.1,.22,.88,ry,ed);BK_PAGE.dalabWall++;}}
  REG.push({name:'The Dalab mission compound wall (rammed earth and relief gate piers: page geometry)',key:'bk_dalab_wall',type:'bk_dalab_wall',cls:'building',x:D.c[0],y:terrainH(D.c[0],D.c[1]),z:D.c[1],r:64,h:3.4});},3200,false);
 /* The Market Sanctuary Perimeter & Peace Ring: low dressed-stone boundary kerb linking the 16 fg-truce-post monoliths, dark-slate
    Truce Threshold lintels across all four road gates, and the central circular Peace Ring with council benches & Truce Bell frame */
 {const Wm=BK_TOWN.frame.W,U=BK_TOWN.frame.U,N=BK_TOWN.frame.N,yawU=Math.atan2(U[0],U[1]),yawN=Math.atan2(N[0],N[1]);
  const cDark=xC(0x46484c),cCap=xC(0x948e82),cIron=xC(0x363432);
  const mkTruce=()=>{TSTAT.cur='bk_market_truce/0';
   const corners=[[-40.2,-30.2],[40.2,-30.2],[40.2,30.2],[-40.2,30.2]];
   for(let s=0;s<4;s++){const c0=corners[s],c1=corners[(s+1)%4],a=Wm(c0[0],c0[1]),b=Wm(c1[0],c1[1]);
    const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz)+Math.PI/2,n=Math.ceil(L/3.2);
    for(let k=0;k<n;k++){const t=(k+.5)/n,mu=c0[0]+(c1[0]-c0[0])*t,mv=c0[1]+(c1[1]-c0[1])*t;
     /* leave the 10.8 m Sanctuary Gate mouths open, and pave them with flush dark-slate Truce Threshold sills */
     if((s%2===0&&Math.abs(mu)<5.8)||(s%2===1&&Math.abs(mv)<5.8))continue;
     if(Math.hypot(Math.abs(mu)-40.2,Math.abs(mv)-30.2)<1.4||((s%2===0)&&(Math.abs(Math.abs(mu)-22.5)<1.3)))continue;
     const x=a[0]+dx*t,z=a[1]+dz*t,y=terrainH(x,z);
     vB('vStone',x,y-.28,z,L/n+.05,.62,.62,ry,bkStone);vB('vStone',x,y+.34,z,L/n+.08,.1,.74,ry,cCap);BK_PAGE.truceKerb++;}}
   /* flush dark-slate Truce Threshold sills across all four cardinal Sanctuary Gateways */
   for(const [gu,gv,ry] of [[-40.2,0,yawU],[40.2,0,yawU],[0,-30.2,yawN],[0,30.2,yawN]]){
    const p=Wm(gu,gv),y=terrainH(p[0],p[1]);vB('vStone',p[0],y-.18,p[1],9.2,.25,1.55,ry+Math.PI/2,cDark);
    vB('vStone',p[0],y+.07,p[1],8.8,.03,.28,ry+Math.PI/2,cCap);}
   /* Central Peace Sanctuary Ring (r = 7.4 m) with four cardinal passages, curved stone-and-plank guest benches, and Truce Bell frame */
   const nr=36,R=7.4;for(let k=0;k<nr;k++){const ang=(k+.5)/nr*Math.PI*2,cu=Math.cos(ang),sv=Math.sin(ang);
    if(Math.abs(cu)<.22||Math.abs(sv)<.22)continue;
    const p=Wm(cu*R,sv*R),p2=Wm(Math.cos(ang+.08)*R,Math.sin(ang+.08)*R),ry=Math.atan2(p2[0]-p[0],p2[1]-p[1])+Math.PI/2,y=terrainH(p[0],p[1]);
    vB('vStone',p[0],y-.25,p[1],1.28,.72,.58,ry,bkStone);vB('vStone',p[0],y+.47,p[1],1.34,.09,.68,ry,cCap);
    if(k%2===0){const bp=Wm(cu*(R-1.05),sv*(R-1.05)),by=terrainH(bp[0],bp[1]);
     vB('vStone',bp[0],by-.2,bp[1],1.05,.56,.44,ry,cDark);vB('vWood',bp[0],by+.36,bp[1],1.18,.07,.5,ry,bkWood);}
    BK_PAGE.truceKerb++;}
   /* Truce Bell & Oath-Frame on the west side of the Peace Ring: twin fir posts, carved lintel and hung bronze/iron truce bell */
   const bf=Wm(-4.4,-2.6),by=terrainH(bf[0],bf[1]);
   vB('vStone',bf[0],by-.25,bf[1],2.1,.52,1.25,yawN,bkStone);
   for(const s of[-.76,.76]){const pp=Wm(-4.4+s,-2.6);vPst('vPost',pp[0],by+.26,pp[1],.1,2.85,bkWood);}
   vB('vWood',bf[0],by+2.95,bf[1],2.1,.16,.2,yawN,bkWood);vB('vWood',bf[0],by+3.11,bf[1],2.35,.1,.32,yawN,cCap);
   vPst('vIron',bf[0],by+2.25,bf[1],.28,.48,xC(0xa67c38));vPst('vIron',bf[0],by+2.18,bf[1],.36,.12,xC(0xb88c42));
   vPst('vIron',bf[0],by+2.72,bf[1],.04,.25,cIron);
   REG.push({name:'The Market Truce Ring',key:'bk_market_truce',type:'bk_market_truce',cls:'building',x:0,y:terrainH(0,0),z:0,r:10,h:6,tags:{landmark:true}});};
  mkTruce.at=[0,0];bkBake('the Market truce ring',[],mkTruce,2800,false);}}
// Dalab's toll post at the Stairhead and the gorge stair's steps and rails (the hoists are TG.fg.pieces above)
if(BK_RINGS){bkBake('Dalab\'s toll post and the stair',BK_TOLL,()=>{
  TSTAT.cur='bk_stair/0';const S=BK_RINGS.stair.pts;
  for(let i=0;i+1<S.length;i++){const a=S[i],b=S[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/1.4));
   for(let k=0;k<n;k++){const t=(k+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;vB('vStone',x,terrainH(x,z)-.35,z,BK_RINGS.stair.w,.5,1.2,ry,bkStone);BK_PAGE.steps++;}}
  bkRails(S.map(p=>[p[0]+1.6,p[1]]),4,1.1,false);
  REG.push({name:BK_RINGS.stair.name,key:'bk_stair',type:'bk_stair',cls:'infrastructure',x:S[0][0],y:S[0][2],z:S[0][1],r:30,h:2});},3600,false);}
if(BK_IX_ON){
 if(typeof XAF!=='undefined'){XAF.interiors=true;VERN.interiors=true;}
 if(typeof xaIxWalk==='function'&&typeof XAF!=='undefined'&&XAF.interiors)xaIxWalk();
 else if(typeof KDOOR!=='undefined'&&typeof KWALK!=='undefined'){KDOOR.walk(KWALK);window._doorwaysCleared=KDOOR.clearDoorways(KWALK);}}
window._instances=BK_INST;
// ---------------------------------------------------------------- the runtime LOD: a chunk is drawn while in view and in range
window.LOD_OPTIONS={classify:o=>o.userData&&o.userData.fgChunk?'fg':null,classes:{fg:{simplify:false,minPx:.8}}};
const bkFr=new THREE.Frustum(),bkPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();bkPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);bkFr.setFromProjectionMatrix(bkPm);const P=camera.position;let shown=0;
 for(const e of BK_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&bkFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
window._registered=REG.length;window._chunks=BK_GROUPS.length;window._buildMs=Math.round(performance.now()-BK_B0);
window._bkInteriors={on:BK_IX_ON,fgFurn:BK_DRAW.furniture,fgDoors:BK_DRAW.doors,fgStairs:BK_DRAW.stairs.length,xaStairs:BK_XA_STAIRS.length,
 cutUnits:(typeof XA_CUT!=='undefined'?XA_CUT.length:0)+(typeof XAF!=='undefined'&&XAF.interiors&&typeof xafUnits==='function'?xafUnits(XAF,VERN.defs).length:0),
 xa:window._interiors||null,tearsIx:BK_TEARS_LIST.filter(p=>p.ix).length};
window._blakhed=Object.assign(window._blakhedPlan||{},{drawn:BK_DRAW.recs,draws:BK_DRAW.draws,tris:BK_DRAW.tris,missing:BK_DRAW.missing,halls:BK_DRAW.halls,pieces:BK_DRAW.pieces||0,hoists:BK_DRAW.hoists,
 lights:BK_DRAW.lights.length,errors:BK_DRAW.errors.concat((TG.errors||[]).slice(0,5)),chunks:BK_GROUPS.length,page:BK_PAGE,interiors:window._bkInteriors,
 dalab:BK_DALAB_LIST.map(r=>r.key),tears:BK_TEARS_LIST.map(r=>r.key),toll:BK_TOLL.map(t=>t.key),
 ddims:BK_PLAN?Object.keys(BK_TOWN.DDIMS).map(k=>{const D=VERN.defs[k],X=BK_TOWN.DDIMS[k];return D?[k,Math.abs(D.w-X[0])<.01&&Math.abs(D.d-X[1])<.01]:[k,false];}):[],
 xdims:BK_PLAN?Object.keys(BK_TOWN.XDIMS).map(k=>{const D=VERN.defs[k],X=BK_TOWN.XDIMS[k];return D?[k,Math.abs(D.w-X[0])<.01&&Math.abs(D.d-X[1])<.01]:[k,false];}):[]});
