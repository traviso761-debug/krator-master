// ================================================================= THE HOUSE OF THE TEMPEST — the layout, as data (step 0)  [G data]
// The Order of the Violet Storm's mother house on the West Arm (scale model px 886,1619; settlements/strongwall/tempest/BLUEPRINT.md
// and tempest_plan.json, the blueprint this is drawn from). A concentric fort (the owner, 2026-11-16: "Concentric") in the
// Xanadui fort's record shape (kits/xanadu/src/80f-xa-fort-data.js, XFORT: wards, curtains, towers, gates, stairs, buildings), so
// XFORT's own rules (XFORT.check) and wall walks (XFORT.walks) run on it unchanged, with the rules a concentric house adds on top.
// No THREE, no DOM: node-tested (settlements/tempest/tests/test-tempest.js).
//
// The plan's frame is XFORT's: x across, +z the front (toward the approach), metres, y up from the outer ward's ground. The front
// is the House's east face (the Main Gate, toward Strongwall), so from the blueprint's frame (u west from the Main Gate, v north):
// x = v, z = -u. The page turns it a quarter round (ry = pi/2) so +z faces east and +x north.
//
//   TEMPEST.plan(o)     -> {size:'monastery', S, IN, w, d, wards, curtains, towers, gates, stairs, buildings, barbican, utse,
//                          hosted, inner, areas, people, horses, gold}; o {} for now (the outline is the blueprint's)
//   TEMPEST.check(P)    XFORT's rules and the concentric ones: [] when the plan keeps them, else one line per fault
//   TEMPEST.RULES       the concentric rules by name (plain functions on the records)
//   TEMPEST.outer(P), TEMPEST.inner(P)   the two wards' plans apart (the page draws the inner one 4 m up, on its talus)
//   TEMPEST.stalls(b)   the stalls a stable range holds (two rows at 2.5 m)
//   TEMPEST.fromBlueprint(u, v)   a blueprint point in the plan's frame
const TEMPEST=(function(){
 'use strict';
 const r2=v=>Math.round(v*100)/100;
 /* the sizes (the blueprint's; the fort asset's march curtain, towers and gate towers where they fit) */
 const S={curtH:9,curtT:3.5,walk:2.4,tower:{form:'drum',r:5.5,h:11},corner:{form:'drum',r:7,h:13},gateTower:{form:'square',w:7,h:14},
  sallyTower:{form:'square',w:6,h:12},storm:{form:'square',w:24,h:20},gap:30,gateW:5.5,sallyW:4};
 const IN={y:4,talus:4,curtH:8,curtT:3,walk:2,tower:{form:'drum',r:5,h:10},gap:30};   /* the inner ward: 4 m up on its talus, its curtain 12 m over the outer ground */
 const OUTER=[-95,-130,95,130],INNER=[-48,-55,48,55];   /* x0, z0, x1, z1 (the blueprint's outer u -130..130, v -95..95; inner u -55..55, v -48..48) */
 const UTSE={at:[0,52],w:22,d:22,h:25,floors:5};   /* astride the inner curtain's front (blueprint u -63..-41: 8 m out, 14 m in); the inner gate climbs 4 m through its base */
 const HOSTED={key:'qb_monastery',kit:'kits/qiblai',o:{v:6},at:[0,-6],w:52,d:52,ry:0};   /* the violet great monastery (blueprint u -20..32, v -26..26), its gate facing the front */
 const fromBlueprint=(u,v)=>[v,-u];
 const half=t=>t.r!=null?t.r:t.w/2;
 /* XFORT's winding: front-left, front-right, back-right, back-left */
 const rect=b=>[[b[0],b[3]],[b[2],b[3]],[b[2],b[1]],[b[0],b[1]]];
 const outOf=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;return[r2(-dz/L*1e4)/1e4,r2(dx/L*1e4)/1e4];};
 const lenOf=c=>Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]);
 const along=(c,s)=>{const L=lenOf(c);return[r2(c.a[0]+(c.b[0]-c.a[0])*s/L),r2(c.a[1]+(c.b[1]-c.a[1])*s/L)];};
 const sOf=(c,p)=>{const L=lenOf(c);return((p[0]-c.a[0])*(c.b[0]-c.a[0])+(p[1]-c.a[1])*(c.b[1]-c.a[1]))/L;};
 const segDist=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2)):0;return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);};
 /* a tower at a point of the wall, its centre pushed out along n so its inner face is flush with the wall's (XFORT's rule) */
 function tower(P,id,kind,at,n,spec,t,ctr){const push=Math.max(0,half(spec)-t/2);
  P.towers.push(Object.assign({id,kind,at:[r2(at[0]),r2(at[1])],ctr:ctr||[r2(at[0]+n[0]*push),r2(at[1]+n[1]*push)]},spec));}
 /* a ward: a curtain per edge, a corner tower at each corner (pushed out along the corner's two normals) */
 function ward(P,id,poly,C,spec,y){const n=poly.length,cs=[];
  for(let i=0;i<n;i++){const a=poly[i],b=poly[(i+1)%n];cs.push({id:id+'.c'+i,ward:id,a:a.slice(),b:b.slice(),h:C.curtH,t:C.curtT,walk:C.walk,out:outOf(a,b),edge:i,y:y||0});}
  P.curtains.push(...cs);
  for(let i=0;i<n;i++){const p=poly[i],n1=outOf(poly[(i+n-1)%n],p),n2=outOf(p,poly[(i+1)%n]),bx=n1[0]+n2[0],bz=n1[1]+n2[1],L=Math.hypot(bx,bz)||1;
   tower(P,id+'.t'+i,'corner',p,[bx/L,bz/L],spec,C.curtT);}
  P.wards.push({id,poly:poly.map(p=>p.slice()),y:y||0});return cs;}
 /* a gate at a fraction t along a curtain, a gate tower each side (XFORT's gateOn) */
 function gateOn(P,id,c,t,kind,w,gt){const at=along(c,lenOf(c)*t),g={id,curtain:c.id,t,kind,w,at,ry:r2(Math.atan2(c.out[0],c.out[1]))};P.gates.push(g);
  if(gt){const off=w/2+half(gt)+.5,L=lenOf(c);for(const s of[-1,1])tower(P,id+'.t'+(s<0?'l':'r'),'gate',along(c,L*t+off*s),c.out,gt,c.t);}
  return g;}
 /* along every curtain, interval towers wherever the towers on it stand further apart than the gap, spaced evenly over the run */
 function fill(P,cs,spec,gap){cs.forEach(c=>{const L=lenOf(c),on=P.towers.filter(t=>segDist(t.at,c.a,c.b)<1).map(t=>sOf(c,t.at));   /* XFORT's rule measures between the towers' points on the wall */
  on.push(0,L);on.sort((p,q)=>p-q);let k=1;
  for(let i=1;i<on.length;i++){const s0=on[i-1],s1=on[i],d=s1-s0;if(d<=gap+.01)continue;const n=Math.ceil(d/gap-1e-6)-1;
   for(let j=1;j<=n;j++)tower(P,c.id+'.i'+(k++),'interval',along(c,s0+d*j/(n+1)),c.out,spec,c.t);}});}

 function plan(o){o=o||{};
  const P={size:'monastery',S,IN,wards:[],curtains:[],towers:[],gates:[],stairs:[],buildings:[],areas:[]};
  /* ---- the outer ward: its curtain, the Main Gate in the front (east) curtain, a sally gate in each flank, the Storm Tower in the back */
  const oc=ward(P,'outer',rect(OUTER),S,S.corner,0),front=oc[0],north=oc[1],back=oc[2],south=oc[3];
  gateOn(P,'gate.main',front,.5,'main',S.gateW,S.gateTower);
  gateOn(P,'gate.sally.n',north,(OUTER[3]-16)/(OUTER[3]-OUTER[1]),'sally',S.sallyW,S.sallyTower);   /* the blueprint's u -16: onto the north flank and the trough road */
  gateOn(P,'gate.sally.s',south,(16-OUTER[1])/(OUTER[3]-OUTER[1]),'sally',S.sallyW,S.sallyTower);   /* onto the south flank and the Kruk Warra road */
  tower(P,'storm','great',along(back,lenOf(back)/2),back.out,S.storm,S.curtT,[0,-127]);   /* straddling the back curtain toward Komodo (blueprint u 114..140) */
  fill(P,oc,S.tower,S.gap);
  /* ---- the inner ward: 4 m up on its talus, its own curtain; the utse astride its front, the inner gate through it */
  const ic=ward(P,'inner',rect(INNER),IN,IN.tower,IN.y);
  P.gates.push({id:'gate.inner',curtain:ic[0].id,t:.5,kind:'utse',w:4,at:[0,INNER[3]],ry:0,through:'utse',rise:IN.y});
  tower(P,'utse','gate',[0,INNER[3]],ic[0].out,{form:'square',w:UTSE.w,h:UTSE.h,utse:true},IN.curtT,UTSE.at.slice());   /* a block on the inner front for the walks, the inner gate's tower (drawn as the utse, not a tower): as a gate tower XFORT.walks climbs the wall's own tower beside it first, and keeps no room for a flight up its 25 m */
  fill(P,ic,IN.tower,IN.gap);
  /* ---- the stairs up the curtains' inner faces (XFORT.walks adds one wherever a piece of walk is left unreached) */
  for(const c of oc)for(const u of(c.id===front.id?[.25,.75]:[.2,.8]))P.stairs.push({curtain:c.id,u});
  for(const c of ic)P.stairs.push({curtain:c.id,u:c.id===ic[0].id?.25:c.id===ic[1].id?.8:.5});   /* the north one clear of the infirmary */
  /* ---- the buildings: the blueprint's ranges and blocks (T1, T2), each a body the fort's builders draw. x, z the middle; w across x, d along z.
    Step 3: every range against the outer curtain stands 2.5 m further in than the sheets draw it, so the curtain's stairs climb
    in an alley behind it (XFORT.walks puts a stair 2.5 m off the curtain's line; with the ranges hollow, one inside a range is
    cut off from its walk) */
  const B=(id,kind,u0,u1,v0,v1,h,more)=>{const a=fromBlueprint(u0,v0),b=fromBlueprint(u1,v1),x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),z0=Math.min(a[1],b[1]),z1=Math.max(a[1],b[1]);
   P.buildings.push(Object.assign({id,kind,at:[r2((x0+x1)/2),r2((z0+z1)/2)],w:r2(x1-x0),d:r2(z1-z0),h},more||{}));};
  /* the east range either side of the Main Gate: the guards, the Sword Hall, the Marshal; the gate stable, the guest house (two storeys) */
  B('east.n','range',-125.5,-111.5,9,77,6.4,{ward:'outer',rooms:['guard','sword hall','marshal\'s hall'],upper:['gate watch','bow loft','quiver house','the Marshal']});
  B('east.s','range',-125.5,-111.5,-77,-9,6.4,{ward:'outer',rooms:['guard','gate stable','guest house'],upper:['gate watch','grooms\' loft','hay loft','guest chambers']});
  /* the stables of the north and south, the eight companies over them, a sally gate between each pair */
  B('stables.n.e','stable-range',-112,-22,78.5,90.5,6.4,{ward:'outer',companies:['North Wind','North-East Wind']});
  B('stables.n.w','stable-range',-10,78,78.5,90.5,6.4,{ward:'outer',companies:['North-West Wind','West Wind']});
  B('stables.s.e','stable-range',-112,-22,-90.5,-78.5,6.4,{ward:'outer',companies:['South Wind','South-East Wind']});
  B('stables.s.w','stable-range',-10,78,-90.5,-78.5,6.4,{ward:'outer',companies:['South-West Wind','East Wind']});
  /* the novices' court (north-west): three ranges round the yard */
  B('novices.n','range',80,122,78.5,90.5,6.4,{ward:'outer',rooms:['school of the Song','novices\' refectory'],upper:['novices\' dormitory']});
  B('novices.w','range',113.5,125.5,39,76.5,6.4,{ward:'outer',rooms:['Master of Novices','the Little Armoury','wash house'],upper:['novices\' dormitory']});
  B('novices.s','range',80,111.5,39,51,6.4,{ward:'outer',rooms:['Hall of the Bow'],upper:['elder novices','masters of arms']});
  /* the refectory block (south-west) */
  B('refectory','range',80,111.5,-61,-39,8,{ward:'outer',rooms:['Great Refectory'],upper:[]});
  B('kitchens','range',80,111.5,-78.5,-61,6.4,{ward:'outer',rooms:['great kitchen','bakehouse'],upper:['lay brothers\' dormitory']});
  B('granary','granary',113.5,125.5,-76.5,-39,7,{ward:'outer'});
  B('larder','range',80,122,-90.5,-78.5,6.4,{ward:'outer',rooms:['larder, tea and butter','dairy'],upper:['the Cellarer','stores']});
  /* the west range either side of the Storm Tower */
  B('smithy','smithy',111.5,125.5,12,39,5,{ward:'outer'});
  B('bowyers','smithy',111.5,125.5,-39,-12,5,{ward:'outer',chimney:true});
  /* the hay sheds in the lists, the well of the muster */
  B('hay.n','stables',56,78,66,76.5,4,{ward:'outer',shed:'hay'});
  B('hay.s','stables',-63,-51,-77,-66,4,{ward:'outer',shed:'hay'});
  B('well.muster','cistern',-104,-92,-70,-58,1,{ward:'outer'});
  /* the inner ward's (on the talus: drawn 4 m up) */
  B('infirmary','range',-51,0,30,46,6.4,{ward:'inner',rooms:['infirmary of the Order'],upper:['infirmary, upper ward','the Infirmarer']});
  B('apothecary','smithy',0,12,30,46,4.5,{ward:'inner'});
  B('bath','smithy',-51,-25,-46,-30,4.5,{ward:'inner',chimney:true});
  B('cistern.inner','cistern',-25,-5,-46,-30,1,{ward:'inner'});
  P.barbican={at:fromBlueprint(-150,0),w:52,d:24,curtH:6,curtT:2,open:'south'};   /* before the Main Gate; the road enters its south side and turns (the bent entrance) */
  P.utse=Object.assign({},UTSE,{at:UTSE.at.slice(),beacon:true,chapel:'gilt'});
  P.hosted=Object.assign({},HOSTED,{at:HOSTED.at.slice()});
  P.inner={box:INNER.slice(),y:IN.y,talus:IN.talus,talusBox:[INNER[0]-IN.talus,INNER[1]-IN.talus,INNER[2]+IN.talus,INNER[3]+IN.talus]};
  /* the open grounds (never built on, never dressed) */
  const A=(id,u0,u1,v0,v1)=>{const a=fromBlueprint(u0,v0),b=fromBlueprint(u1,v1);P.areas.push({id,box:[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]});};
  A('muster',-111.5,-63,-76.5,76.5);A('lists.n',-63,80,52,78.5);A('lists.s',-63,80,-78.5,-52);A('archery',-50,76,-74,-58);A('drill',63,111.5,-39,39);A('novices.yard',86,113.5,51,76.5);
  A('inner.court',-41,-20,-26,26);A('fallen',-5,51,-46,-30);A('founder',34,53,-26,26);
  P.chortens={fallen:{box:P.areas.find(a=>a.id==='fallen').box,rows:2,n:14},founder:{at:fromBlueprint(43,0),s:1.6}};
  P.people={companies:8,perCompany:40,captains:8,chapter:65,officers:6,prismarch:2,novices:150,lay:50};
  P.horses={stabledFlanks:292,stabledGate:35,remounts:300};
  P.gold=['gate.main pavilion','utse chapel finial','hosted hall crown'];
  P.w=OUTER[2]-OUTER[0];P.d=(P.barbican.at[1]+P.barbican.d/2)-OUTER[1];
  return P;}

 /* the two wards apart: each a plan XFORT.walks and the fort's builders take, in its own frame: the page places the inner ward's
    def at the talus top, so there its ward and curtains stand at y 0 (XFORT.recY, which the fort asset honours since 2026-11-23,
    would raise them a second time). The whole plan keeps y 4: XFORT.walks on it climbs the inner curtain from the talus */
 const local=r=>r.y?Object.assign({},r,{y:0}):r;
 const sub=(P,w)=>{const ids=new Set(P.curtains.filter(c=>c.ward===w).map(c=>c.id));
  return Object.assign({},P,{wards:P.wards.filter(x=>x.id===w).map(local),curtains:P.curtains.filter(c=>ids.has(c.id)).map(local),
   towers:P.towers.filter(t=>P.curtains.some(c=>ids.has(c.id)&&segDist(t.at,c.a,c.b)<1)),gates:P.gates.filter(g=>ids.has(g.curtain)),
   stairs:P.stairs.filter(s=>ids.has(s.curtain)),buildings:P.buildings.filter(b=>b.ward===w),S:w==='inner'?Object.assign({},P.S,{gap:IN.gap}):P.S});};
 const outer=P=>sub(P,'outer'),inner=P=>sub(P,'inner');
 /* the stalls a stable range holds: two rows of standing stalls, 2.2 m each, along it (a cavalry stable's; the blueprint's 2.5 m
    was loose: at 2.5 the ranges, kept clear of the corner drums, hold 284 for the 292 war horses) */
 const STALL=2.2,stalls=b=>2*Math.floor(Math.max(b.w,b.d)/STALL);

 /* ---------------------------------------------------------------- the rules a concentric house adds */
 const bx=b=>[b.at[0]-b.w/2,b.at[1]-b.d/2,b.at[0]+b.w/2,b.at[1]+b.d/2];
 const inBox=(q,B,m)=>q[0]>=B[0]+m-1e-6&&q[1]>=B[1]+m-1e-6&&q[2]<=B[2]-m+1e-6&&q[3]<=B[3]-m+1e-6;
 const wardBox=(P,id)=>{const w=P.wards.find(x=>x.id===id),xs=w.poly.map(p=>p[0]),zs=w.poly.map(p=>p[1]);return[Math.min(...xs),Math.min(...zs),Math.max(...xs),Math.max(...zs)];};
 const RULES={
  'the inner ward inside the outer, the lists at least 20 m wide':P=>{const O=wardBox(P,'outer'),I=wardBox(P,'inner'),m=Math.min(I[0]-O[0],I[1]-O[1],O[2]-I[2],O[3]-I[3]);
   return m+1e-6<20?['the lists '+r2(m)+' m at their narrowest']:[];},
  'the inner curtain commands the outer':P=>{const o=P.curtains.filter(c=>c.ward==='outer'),i=P.curtains.filter(c=>c.ward==='inner'),oh=Math.max(...o.map(c=>c.h)),ih=Math.min(...i.map(c=>c.y+c.h));
   return ih<oh+2?['the inner curtain\'s top '+ih+' m over the ground against the outer\'s '+oh+' m']:[];},
  'the utse astride the inner front, the inner gate through it':P=>{const U=P.utse,f=P.curtains.find(c=>c.ward==='inner'&&c.edge===0),g=P.gates.find(x=>x.through==='utse'),out=[];
   if(!U||!f)return['no utse or no inner front'];const ub=bx(U);if(!(ub[1]<f.a[1]&&ub[3]>f.a[1]))out.push('the utse does not straddle the inner front');
   if(!g||Math.hypot(g.at[0]-U.at[0],g.at[1]-U.at[1])>U.w/2)out.push('the inner gate is not through the utse');return out;},
  'three gates: the main on the front, a sally on each flank':P=>{const og=P.gates.filter(g=>P.curtains.some(c=>c.id===g.curtain&&c.ward==='outer')),edge=g=>P.curtains.find(c=>c.id===g.curtain).edge,out=[];
   if(og.length!==3)out.push(og.length+' gates in the outer curtain');if(!og.some(g=>g.kind==='main'&&edge(g)===0))out.push('no main gate on the front');
   if(!(og.some(g=>g.kind==='sally'&&edge(g)===1)&&og.some(g=>g.kind==='sally'&&edge(g)===3)))out.push('a flank without its sally gate');return out;},
  'the hosted monastery in the inner ward, clear of its curtain by 6 m':P=>{const H=P.hosted;if(!H)return['no hosted monastery'];
   const I=wardBox(P,'inner'),t=P.IN.curtT/2;return inBox(bx(H),I,6+t)?[]:['the monastery '+H.key+' within 6 m of the inner curtain or outside the ward'];},
  'every building in its ward, none on the talus from outside':P=>{const out=[],O=wardBox(P,'outer'),I=wardBox(P,'inner'),T=P.inner.talusBox,ov=(p,q)=>Math.min(p[2],q[2])-Math.max(p[0],q[0])>.1&&Math.min(p[3],q[3])-Math.max(p[1],q[1])>.1;
   P.buildings.forEach(b=>{const q=bx(b);if(b.ward==='inner'){if(!inBox(q,I,P.IN.curtT/2))out.push(b.id+' outside the inner ward');}
    else{if(!inBox(q,O,P.S.curtT/2))out.push(b.id+' outside the outer ward');if(ov(q,T))out.push(b.id+' on the inner ward\'s talus');}});
   P.areas.filter(a=>!/^(inner|fallen|founder)/.test(a.id)).forEach(a=>P.buildings.filter(b=>b.ward==='outer').forEach(b=>{if(ov(a.box,bx(b))&&b.kind!=='cistern'&&b.kind!=='stables')out.push(b.id+' built on the '+a.id);}));
   return out;},
  'the stables hold the war horses, the halls over them the eight companies':P=>{const R=P.buildings.filter(b=>b.kind==='stable-range'),n=R.reduce((s,b)=>s+stalls(b),0),co=R.reduce((s,b)=>s+(b.companies||[]).length,0),out=[];
   if(n<P.horses.stabledFlanks)out.push(n+' stalls on the flanks for '+P.horses.stabledFlanks+' horses');if(co<P.people.companies)out.push(co+' company halls for '+P.people.companies+' companies');return out;},
  'gold in three places only':P=>P.gold.length!==3?['gold in '+P.gold.length+' places']:[]};
 function check(P){const out=[];
  /* XFORT's rules on the plan as one fort (the inner front's utse is a block of the wall, not a building) */
  if(typeof XFORT!=='undefined')XFORT.check(P).forEach(f=>out.push('xfort '+f));
  for(const k in RULES)RULES[k](P).forEach(f=>out.push(k+': '+f));return out;}
 return{plan,check,RULES,outer,inner,stalls,fromBlueprint,S,IN,OUTER,INNER,UTSE,HOSTED};})();
if(typeof module!=='undefined')module.exports=TEMPEST;
