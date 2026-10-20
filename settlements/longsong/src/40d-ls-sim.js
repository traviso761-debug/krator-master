// ================================================================= LONGSONG — the people's world as data for core/simulation (PLAN.md P5b)
// [G data] core/simulation (SIM) is the vocabulary; this is Longsong's declaration into it (core/simulation/SCHEMA.md's
// order; settlements/dhelv/src/74-dhelv-sim.js is the worked example):
//   1. the host binding: the page's world clock (core/clock) gives SIM its hour, day and motion time
//   2. the NAVIGATION LAYER 'pedestrian' (LSS.graph): the ward a grid of 4 m cells on its three terraces, the buildings'
//      footprints, the court's carved walls and its pools taken out, the terraces crossed only on the avenue; the Great
//      Stair's three flights and their landings; the Debate Court's open floor on the rock; and 'door' edges into the
//      rooms (the palaces' ranges, the Assembly Hall, the deep stair down to the open vault and the Procrastinator), walked
//      out of sight (LSS.hidden)
//   3. the PLACES, from the plan's (LS.PLACES): each activity's place, its door the nearest node, its spots the free nodes
//      within its reach (no one is stood in a wall)
//   4. the records (activities, factions, orgs, roles from LS.ROLES and LS.SCHEDULES), through SIM.load
//   5. the PEOPLE: one actor per LS.PEOPLE record, by its id, at home where its role sleeps.
// No rule lives in the drawing: 68-ls-life.js reads SIM.pose and draws. Declared once, on the first frame (LSS.init):
// core/simulation loads after this fragment.
const LSS=(function(){const P=LS,O={inited:false,problems:[],places:0,CELL:4};
 const B=P.BUILDINGS,ROCKY=P.ROCK.top;
 // a building's footprint (x0, x1, z0, z1, the heights it fills): drums by their radius, the rest by their sides
 // (the Debate Court's galleries ring the court: its open floor is not inside them)
 const FOOT=B.filter(o=>o.kind!=='gallery').map(o=>{const hw=o.r!=null?o.r:o.w/2,hd=o.r!=null?o.r:o.d/2;return {id:o.id,x0:o.x-hw,x1:o.x+hw,z0:o.z-hd,z1:o.z+hd,y0:P.baseY(o)-1,y1:P.topY(o)-.5,court:o.court||null};});
 // the camp's tents (pitched on festival days): out of the walk graph, and no one stands in one
 const inTent=(x,z)=>P.CAMP.tents.some(t=>Math.abs(x-t.x)<t.w/2+1.4&&Math.abs(z-t.z)<t.d/2+1.4);
 const inFoot=(f,x,z,m)=>x>f.x0-m&&x<f.x1+m&&z>f.z0-m&&z<f.z1+m&&!(f.court&&x>f.court.x0&&x<f.court.x1&&z>f.court.z0&&z<f.court.z1);
 // ---------------------------------------------------------------- 2. the nav graph
 O.graph=function(){if(O._g)return O._g;const nodes=[],edges=[],byId={},C=O.CELL;
  const node=(id,x,y,z,tag)=>{const n={id,x,y,z,tag};nodes.push(n);byId[id]=n;return n;};
  const edge=(a,b,kind,w)=>{const A=byId[a],Bn=byId[b];edges.push({id:'e'+edges.length,a,b,kind,len:Math.hypot(A.x-Bn.x,A.y-Bn.y,A.z-Bn.z),w:w==null?2:w});};
  // the ward: cells on the terraces, out of the footprints (1 m round them), the court's pools and its two carved arcs
  const Ct=P.COURT,W=P.WARD,wardB=FOOT.filter((f,i)=>B[i].base==='ward');
  const arcWall=(x,z)=>{const dx=x-Ct.x,dz=z-Ct.z,r=Math.hypot(dx,dz);if(Math.abs(r-Ct.r)>1.6)return false;const a=Math.atan2(dz,dx);
   return Ct.arcs.some(([a0,a1])=>{let u=a;while(u<a0)u+=Math.PI*2;while(u>a0+Math.PI*2)u-=Math.PI*2;return u<=a1;});};
  const free=(x,z)=>!wardB.some(f=>inFoot(f,x,z,1))&&!inTent(x,z)&&!Ct.pools.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+.8)&&!arcWall(x,z);
  const I=Math.floor((W.x1-W.x0-8)/C),J=Math.floor((-12-(W.z0+6))/C),wid=(i,j)=>'w'+i+'_'+j,X=i=>W.x0+4+i*C,Z=j=>W.z0+6+j*C;
  for(let i=0;i<=I;i++)for(let j=0;j<=J;j++){const x=X(i),z=Z(j);if(free(x,z))node(wid(i,j),x,P.wardY(z),z,'ward');}
  const avenue=x=>x>P.AVENUE.x0&&x<P.AVENUE.x1;
  for(let i=0;i<=I;i++)for(let j=0;j<=J;j++){const a=wid(i,j);if(!byId[a])continue;
   for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1]]){const b=wid(i+di,j+dj),Bn=byId[b];if(!Bn)continue;
    if(di&&dj&&!(byId[wid(i+di,j)]&&byId[wid(i,j+dj)]))continue;          // no corner cut past a building
    const A=byId[a];if(Math.abs(A.y-Bn.y)>.1&&!(avenue(A.x)&&avenue(Bn.x)&&!di))continue;   // a terrace step: the avenue's flight only
    edge(a,b,Math.abs(A.y-Bn.y)>.1?'stair':'floor',di&&dj?2:4);}}
  // the Great Stair: three flights up the base's face (LS.STAIR), a landing at each turn, the top landing to the Lower Gate
  const ST=P.STAIR;let prev=null;
  ST.forEach((F,k)=>{const zc=(F.z0+F.z1)/2,n=Math.max(2,Math.round(Math.abs(F.x1-F.x0)/8));
   for(let s=0;s<=n;s++){const u=s/n,id='s'+k+'_'+s;node(id,F.x0+(F.x1-F.x0)*u,F.y0+(F.y1-F.y0)*u,zc,'stair');if(prev)edge(prev,id,s?'stair':'landing',3);prev=id;}});
  // its foot: the forecourt at the avenue's head (the nearest ward cells)
  const near=(x,z,y,tag)=>{let bn=null,bd=1e9;for(const q of nodes){if(tag&&q.tag!==tag)continue;const d=Math.hypot(q.x-x,q.z-z)+(y==null?0:Math.abs(q.y-y)*4);if(d<bd){bd=d;bn=q;}}return bn;};
  {const F=ST[0],zc=(F.z0+F.z1)/2;const w=nodes.filter(q=>q.tag==='ward'&&Math.hypot(q.x-F.x0,q.z-zc)<9);w.forEach(q=>edge(q.id,'s0_0','floor',3));}
  const top=ST[ST.length-1],last='s'+(ST.length-1)+'_'+Math.max(2,Math.round(Math.abs(top.x1-top.x0)/8));
  node('top',top.x1,ROCKY,11,'rock');   // on the base's top (z 8 to 21), in front of the Lower Gate
  edge(last,'top','landing',3);
  const LG=P.building('lower-gate');node('gate-front',LG.x,ROCKY,LG.z-LG.d/2-4,'rock');edge('top','gate-front','floor',4);
  node('gate-in',LG.x,ROCKY,LG.z,'door');edge('gate-front','gate-in','door',2);
  // the Debate Court's floor (the White Palace's court: open to the sky)
  const WP=P.building('white-palace'),K=WP.court,cid=(i,j)=>'c'+i+'_'+j,ci=Math.floor((K.x1-K.x0-4)/C),cj=Math.floor((K.z1-K.z0-4)/C);
  const rockB=FOOT.filter((f,i)=>B[i].base==='rock'&&B[i].id!=='white-palace');   // the halls that stand into the court (the Assembly's drum)
  for(let i=0;i<=ci;i++)for(let j=0;j<=cj;j++){const x=K.x0+2+i*C,z=K.z0+2+j*C;if(!rockB.some(f=>inFoot(f,x,z,1)))node(cid(i,j),x,ROCKY,z,'court');}
  for(let i=0;i<=ci;i++)for(let j=0;j<=cj;j++)for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1]])if(byId[cid(i,j)]&&byId[cid(i+di,j+dj)])edge(cid(i,j),cid(i+di,j+dj),'floor',4);
  edge('gate-in',near(LG.x,LG.z+LG.d/2+2,ROCKY,'court').id,'door',2);
  // the rooms: door edges from the court's edge into the ranges and the halls, and the deep stair down (walked unseen)
  const room=(id,x,y,z,from)=>{node(id,x,y,z,'door');edge(typeof from==='string'?from:near(from[0],from[1],ROCKY,'court').id,id,'door',2);};
  room('in-front',0,ROCKY,K.z0-4,[0,K.z0+2]);room('in-west',K.x0-6,ROCKY,51,[K.x0+2,51]);room('in-east',K.x1+6,ROCKY,51,[K.x1-2,51]);
  room('in-back',0,ROCKY,K.z1+5,[0,K.z1-2]);
  const AS=P.building('assembly');room('in-assembly',AS.x,ROCKY,AS.z,'in-back');
  room('in-roof',-58,P.topY(WP),60,'in-west');
  const VD=P.PLACES.find(q=>q.id==='vault'),WH=P.PLACES.find(q=>q.id==='wheel');
  room('deep-stair',0,ROCKY-20,K.z1+8,'in-back');room('in-vault',VD.x,VD.y,VD.z,'deep-stair');room('in-wheel',WH.x,WH.y,WH.z-WH.r-4,'in-vault');
  O._g={nodes,edges,byId,near};return O._g;};
 // a walker out of sight: inside a building's footprint (between its floor and its roof), or under the rock
 O.hidden=function(x,y,z){for(const f of FOOT)if(y>f.y0&&y<f.y1&&inFoot(f,x,z,-.3))return true;const ry=P.rockY(x,z);return ry>-1e8&&y<ry-1.5;};
 // ---------------------------------------------------------------- 3. the places
 const yOf=pl=>pl.y==='rock'?ROCKY:pl.y==='ward'?P.wardY(pl.z==null?-100:pl.z):typeof pl.y==='number'?pl.y:P.wardY(pl.z);
 // which plan places sit inside (their walkers reach them by the rooms' doors, not the courts')
 const DOOR={assembly:'in-assembly',cells:'in-west',library:'in-east',refectory:'in-front',roof:'in-roof',vault:'in-vault',wheel:'in-wheel'};
 // the activities whose people stand still at their spot (the life layer animates them: 68)
 const STILL={DRILL:1,DEBATE:1,GUARD:1,TURN_WHEEL:1,KEEP:1,CHAM:1,WATCH:1,FESTIVAL:1};
 O.placeRecs=function(){const G=O.graph(),out=[];
  for(const pl of P.PLACES){const y=yOf(pl);let x=pl.x,z=pl.z,door,spots=[];
   if(pl.ring){const R=pl.ring;x=R.cx;z=R.cz-R.b;}                 // the kora: joined at its north point (the avenue)
   else if(pl.line){x=(pl.line[0][0]+pl.line[1][0])/2;z=(pl.line[0][1]+pl.line[1][1])/2;}
   if(DOOR[pl.id])door=G.byId[DOOR[pl.id]];else door=G.near(x,z,y);
   if(!DOOR[pl.id]&&!pl.ring&&!pl.indoor){const inR=pl.line?(q=>Math.abs(q.x-x)<pl.r&&q.z>pl.line[0][1]&&q.z<pl.line[1][1]):(q=>Math.hypot(q.x-x,q.z-z)<pl.r);
    spots=[];for(const q of G.nodes)if(q.tag!=='door'&&q.tag!=='stair'&&Math.abs(q.y-y)<2&&inR(q)&&!(pl.hole&&Math.hypot(q.x-x,q.z-z)<pl.hole))for(const [ox,oz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const sx=q.x+ox,sz=q.z+oz;
     if(!FOOT.some(f=>q.y+.5>f.y0&&q.y+.5<f.y1&&inFoot(f,sx,sz,1.6))&&!(pl.id==='camp'&&inTent(sx,sz)))spots.push([sx,sz,q.y]);}   // clear of the walls (and the tents) by more than the wander
    // the spots in an order of their own (a hash of the place and the node), so the first comers spread over the place
    spots.sort((a,b)=>KRAND.hash(pl.id.length,Math.round(a[0]*7),Math.round(a[1]*7))-KRAND.hash(pl.id.length,Math.round(b[0]*7),Math.round(b[1]*7)));}
   const indoor=!!pl.indoor;
   out.push({id:pl.id,name:pl.name,kind:pl.id,x:door?door.x:x,y:door?door.y:y,z:door?door.z:z,door:{x:door.x,y:door.y,z:door.z,node:door.id},
    activities:{[pl.activity]:pl.cap},indoor:indoor?true:{},spots:spots.length?spots:undefined,cap:pl.cap,r:DOOR[pl.id]&&!indoor?Math.min(pl.r,6):undefined,
    wander:indoor||STILL[pl.activity]?0:1.2,tags:{plan:pl.id}});}
  return out;};
 // ---------------------------------------------------------------- 4. the records
 O.HOME={monk:'cells',novice:'cells',elder:'cells',operative:'cells',master:'cells',keeper:'cells',warden:'barracks',
  servant:'lay-houses',scholar:'lay-houses',artisan:'lay-houses',trader:'lay-houses',caravan:'caravanserai',pilgrim:'hostel',festgoer:'away'};
 O.world=function(){const acts=new Set();for(const Pn of P.PEOPLE)Pn.schedule.concat(Pn.fest).forEach(a=>acts.add(a));
  const ORG={'The Order of Historians':'order','Oidong':'town','Xanadu Sultanate':'pilgrims'};
  return {activities:[...acts].sort().map(id=>({id,indoor:/^(SLEEP|EAT|STUDY_IN|WORK|REST|REST_W|REST_C|LODGE|TEA|PRAY|AWAY)$/.test(id)})),
   factions:[{id:'historians',name:'The Order of Historians'},{id:'oidong',name:'The people of the Oidong Valley'},{id:'xanadu',name:'The Xanadu Sultanate'}],
   orgs:[{id:'order',faction:'historians',name:'The Order at Longsong'},{id:'town',faction:'oidong',name:'The town in the ward'},
    {id:'pilgrims',faction:'xanadu',name:'Pilgrims',resident:false},{id:'caravans',faction:'xanadu',name:'A caravan from Xanadu',resident:false}],
   // a role per schedule variant (O.roleOf), each on SIM's week: its day's schedule, and the festival's on the festival's weekday
   roles:[...new Set(P.PEOPLE.map(O.roleOf))].map(id=>{const Pn=P.PEOPLE.find(q=>O.roleOf(q)===id),R=P.ROLES.find(q=>q.role===Pn.role),F=P.FESTIVAL;
    return {id,org:R.role==='caravan'?'caravans':ORG[R.faction],name:R.sub,scheds:{day:Pn.schedule,fest:Pn.fest||Pn.schedule},
     week:Array.from({length:F.week},(u,d)=>d===F.day?'fest':'day'),speed:R.role==='pilgrim'||R.role==='festgoer'?.95:R.role==='operative'?1.3:1.1,
     prefers:{SLEEP:{pin:'home'},REST:{pin:'home'},REST_W:{pin:'home'},REST_C:{pin:'home'},LODGE:{pin:'home'},AWAY:{pin:'home'}}};})};};
 O.roleOf=Pn=>Pn.role+'.'+(Pn.variant||0)+(Pn.cham?'.cham':'');   // the cham's dancers: their own festival schedule
 // ---------------------------------------------------------------- the declaration (once; the host's clock)
 O.init=function(clock,o){if(O.inited)return O;O.inited=true;o=o||{};const t0=Date.now(),G=O.graph();
  if(SIM.WEEK!==P.FESTIVAL.week)throw new Error('LSS: the festival is every '+P.FESTIVAL.week+' days; SIM.WEEK is '+SIM.WEEK);
  SIM.init({seed:7401,hour:()=>clock.hour,day:()=>clock.day||0,t:()=>clock.t,err:m=>O.problems.push(m)});
  SIM.nav.layer('pedestrian',{nodes:G.nodes,edges:o.edges?o.edges(G.edges):G.edges,cost:{stair:1.3,landing:1,floor:1,door:1},yWeight:4});
  O.loaded=SIM.load(O.world());
  for(const r of O.placeRecs()){SIM.place(r);O.places++;}
  for(const Pn of P.PEOPLE)SIM.actor({id:Pn.id,role:O.roleOf(Pn),home:O.HOME[Pn.role]});   // its variant's role: the day's and the festival's schedules
  SIM.REF={layer:'pedestrian',x:0,z:-100};
  O.problems=O.problems.concat(SIM.check());O.ms=Date.now()-t0;return O;};
 return O;})();
