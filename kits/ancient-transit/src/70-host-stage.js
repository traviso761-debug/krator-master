// ================================================================= HOST — the test stage  [web]
// What stands where: a street block dressed with every furniture kind in every ruin state; an avenue and two side streets dressed by
// KTRANSIT.dress (with pads filed in KSPACE the kit keeps off); the elevated highway with an off and an on ramp running the page's length,
// culled where its piers meet a pad, over the cargo line at grade and over a second highway (the interchange); the cargo line with two level
// crossings, catenary and a derailed freight train; the elevated passenger line with two stations and a train part fallen from the guideway.
// Everything placed is a record first (KTRANSIT) and a core/tags record (REGISTER) before it is drawn. Built once the library maps are in.
const TRS={ready:false,groups:[],rec:{},ms:0};
TRS.streets=TR_STREETS;
/* the host's pads: what a valley's towers would file in its own KSPACE; the kit lays no furniture on them and KTRANSIT.cull drops the piers in them */
TRS.pads=[{name:'pad A',x:-600,z:60,r:22},{name:'pad B',x:800,z:-70,r:30},{name:'pad C',x:-200,z:-455,r:30},{name:'pad D',x:1100,z:-640,r:26}];
TRS.build=function(){if(TRS.ready)return true;if(window._texPending>0)return false;const t0=performance.now(),g=terrainH,furn=KratorTransitFurniture,sh=TR_SHADOW,R=TRS.rec;
 const space=KSPACE.create({cell:12});TRS.pads.forEach(p=>space.insert(p,p.x,p.z,p.r));
 const blocked=(x,z,r)=>space.some(x,z,r,it=>it.r!=null&&it.name&&Math.hypot(x-it.x,z-it.z)<r+it.r);
 const add=(G,name,kind,tags)=>{scene.add(G);TRS.groups.push(G);const b=new THREE.Box3().setFromObject(G);if(!isFinite(b.min.x))return G;const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;
  REGISTER({name:name,kind:kind,x:cx,z:cz,y:b.min.y-1,r:Math.hypot(b.max.x-b.min.x,b.max.z-b.min.z)/2+2,h:b.max.y-b.min.y+2,tags:Object.assign({kind:kind,tris:Math.round(G.userData.tris||0)},tags||{})});return G;};
 /* the pads themselves, as discs the eye can see */
 {const B=KTRANSIT.builder();TRS.pads.forEach(p=>{const n=24,c=KTRANSIT.COL.concDark;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,y=g(p.x,p.z)+.35;B.tri('concrete',[p.x,y,p.z],[p.x+Math.cos(a)*p.r,y,p.z+Math.sin(a)*p.r],[p.x+Math.cos(b)*p.r,y,p.z+Math.sin(b)*p.r],c,{face:[0,1,0]});}});add(B.finish('pads'),'The host\'s pads','pad',{count:TRS.pads.length});}
 /* the streets, dressed */
 R.war=TR_WAR;
 R.roads=TR_ROADS;R.quake=TR_QUAKE;R.net=TR_NET;const veh=typeof KratorVehicles!=='undefined'?KratorVehicles:null;R.vehicles=!!veh;
 R.dress=TRS.streets.map((st,i)=>{const S=st,Wr=TR_WAR[i],Rd=TR_ROADS[i],D=KTRANSIT.dress(S,{seed:KRAND.child(TR_SEED,st.id),space:space,blocked:blocked,war:Wr,damage:Wr.damageAt,network:TR_NET,road:i});add(KTRANSIT.draw.street(S,D,{furn,shadow:sh,err:reportErr,road:Rd,roadIndex:i,network:TR_NET,ground:g,tilt:Rd.levelAt}),'The street '+st.id+' and its furniture','street',{pieces:D.pieces.length,skipped:D.skipped,width:st.width,kind:Rd.roadKind});
  add(KTRANSIT.draw.war(Wr,{furn,vehicles:veh,shadow:sh,err:reportErr,tilt:Rd.levelAt}),'The war along '+st.id,'war',{craters:Wr.craters.length,pieces:Wr.pieces.length,positions:Wr.positions.length,blockades:Wr.blockades.length});return D;});
 /* the junctions: a patch, the pavement corners, the crosswalks */
 {const JB=KTRANSIT.builder();KTRANSIT.draw.junctions(JB,TR_NET,g);add(JB.finish('junctions'),'The junctions','junction',{count:TR_NET.junctions.length,kinds:TR_NET.junctions.map(J=>J.kind).join(',')});}
 /* the block: every kind in every state it has */
 R.grid=KTRANSIT.dressGrid({ground:g,x:-760,z:110,seed:91});R.gridG=add(KTRANSIT.draw.dress(R.grid,{furn,shadow:sh,err:reportErr}),'The block: every kind in every state','block',{pieces:R.grid.pieces.length});
 /* the highway, its ramps, the interchange */
 R.H=TR_H;   /* built in 45 with the data: its ramps' landing roads are roads of the network (KTRANSIT.joinRamps) */
 R.culled=KTRANSIT.cull(R.H,blocked);
 R.H2=KTRANSIT.highway([[1100,-1750],[1100,250]],{id:'h2',ground:g,over:[R.H],overgrowth:1});
 add(KTRANSIT.draw.highway(R.H,{furn,vehicles:veh,shadow:sh,err:reportErr}),'The highway h1 (two ramps)','highway',{spans:R.H.spans.length,culled:R.culled,blockades:R.H.blockades.length});
 add(KTRANSIT.draw.highway(R.H2,{furn,shadow:sh}),'The highway h2 (over h1)','highway',{spans:R.H2.spans.length});
 /* the cargo line at grade, its crossings, its wreck */
 R.R=TR_CARGO;
 R.F=KTRANSIT.train(R.R,{id:'freight',s:2060,kind:'freight',state:'derailed',from:2});
 add(KTRANSIT.draw.rail(R.R,{shadow:sh}),'The cargo line','rail',{crossings:R.R.crossings.length,ties:R.R.ties.length});
 add(KTRANSIT.draw.train(R.F,{shadow:sh}),'The freight wreck','train',{cars:R.F.cars.length,state:R.F.state});
 /* the elevated passenger line, its stations, its train */
 /* the passenger line in three stretches (the owner, 2026-11-08): bare, partly covered in soil and plants, fully overgrown */
 R.E=KTRANSIT.rail([[-1750,300],[-200,300],[500,620],[1750,620]],{id:'pax',ground:g,elevated:true,stations:[700,2400],overgrowth:s=>s<1100?0:s<2250?1:2,shift:TR_SHIFT,quake:TR_QUAKE});
 R.P=KTRANSIT.train(R.E,{id:'pax1',s:1500,kind:'passenger',state:'fallen',from:2});
 add(KTRANSIT.draw.rail(R.E,{shadow:sh}),'The passenger line (two stations)','rail',{stations:R.E.stations.length,spans:R.E.spans.length});
 add(KTRANSIT.draw.train(R.P,{shadow:sh}),'The fallen passenger train','train',{cars:R.P.cars.length,state:R.P.state});
 /* the subway (its records are TR_SUBWAY, made before the ground): the tunnels, the two stations, a train standing in the first, one derailed in a tunnel */
 R.SW=TR_SUBWAY;R.ST=KTRANSIT.train(R.SW,{id:'metro1',s:930,kind:'passenger',cars:4,state:'standing'});R.SD=KTRANSIT.train(R.SW,{id:'metro2',s:1700,kind:'passenger',cars:4,state:'derailed',from:1});
 add(KTRANSIT.draw.subway(R.SW,{furn,shadow:sh}),'The subway (two stations)','subway',{sections:R.SW.sections.length,stations:R.SW.stations.length,sinkholes:R.SW.sinkholes.length});
 add(KTRANSIT.draw.train(R.ST,{shadow:sh}),'The subway train in the station','train',{cars:R.ST.cars.length,state:R.ST.state});
 add(KTRANSIT.draw.train(R.SD,{shadow:sh}),'The subway train derailed','train',{cars:R.SD.cars.length,state:R.SD.state});
 TRS.ms=Math.round(performance.now()-t0);TRS.ready=true;return true;};
tick(()=>{TRS.build();});
/* the views: [cx, cy, cz, tx, ty, tz] */
const VIEWS={
 'The block':[-700,38,250,-650,0,150],'The block, close':[-748,9,172,-738,3,135],'The avenue':[-60,30,90,120,2,-10],'The highway':[-320,42,-240,-100,16,-520],'The off ramp':[-1130,22,-392,-1100,8,-440],
 'The interchange':[880,75,-640,1100,22,-360],'The level crossing':[428,14,-100,400,2,-150],'The freight wreck':[330,28,-80,250,3,-150],
 'The station':[-960,32,400,-1050,10,300],'The fallen train':[-230,30,410,-300,6,300],'The line, half buried':[20,26,470,-60,12,360],'The line, overgrown':[760,24,730,800,12,622],
 'The subway station, fallen in':(()=>{const S=TR_SUBWAY.stations.find(s=>s.state==='collapsed')||TR_SUBWAY.stations[0];return [S.x+70,46,S.z+40,S.x,S.y+2,S.z];})(),
 'A subway entrance':(()=>{const E=TR_SUBWAY.stations.flatMap(s=>s.entrances).find(e=>e.state==='intact')||TR_SUBWAY.stations[0].entrances[0];return [E.x+22,9,E.z+18,E.x,E.y+1,E.z];})(),
 'A sinkhole':(()=>{const H=TR_SUBWAY.sinkholes.find(h=>h.section)||TR_SUBWAY.sinkholes[0];return H?[H.x+28,22,H.z+22,H.x,terrainH(H.x,H.z)+2,H.z]:[0,30,0,0,0,10];})(),
 'A riot broke out here':[-1250,16,60,-1150,2,0],'Shelled':[-80,22,70,60,2,0],'Bombed to smithereens':[1220,28,80,1340,0,0],
 'A checkpoint':(()=>{const p=TR_WAR[1].positions.find(q=>q.kind==='checkpoint')||TR_WAR[1].positions[0];return p?[p.x+26,10,p.z+30,p.x,2,p.z]:[-300,20,40,-300,2,0];})(),
 'An emplacement':(()=>{const p=TR_WAR[1].positions.find(q=>q.kind!=='checkpoint')||TR_WAR[1].positions[0];return p?[p.x+18,8,p.z+22,p.x,1.5,p.z]:[-300,20,40,-300,2,0];})(),
 'The fault, the avenue':(()=>{const c=KTRANSIT.intersections(TR_QUAKE.path,[[-1500,0],[1500,0]])[0];return c?[c.x+40,14,c.z+45,c.x,terrainH(c.x,c.z)+1,c.z]:[-520,20,40,-520,2,0];})(),
 'The fault, the cargo line':(()=>{const c=KTRANSIT.intersections(TR_QUAKE.path,[[-1750,-150],[650,-150]])[0];return c?[c.x-30,12,c.z+40,c.x,terrainH(c.x,c.z)+1,c.z]:[-535,20,-110,-535,2,-150];})(),
 'The cutting':[-980,18,-95,-900,8,-150],'A road under sand':[430,14,-560,400,2,-500],
 'A barricade of wrecks':(()=>{const b=TR_WAR[1].blockades[0];return b?[b.x+22,9,b.z+26,b.x,1.5,b.z]:[-300,20,40,-300,2,0];})(),
 'The highway blocked':(()=>{const P=KTRANSIT.path([[-1750,-560],[-700,-560],[250,-360],[1750,-360]],{ground:terrainH,radius:80,shift:TR_SHIFT}),p=P.at(1700),yD=terrainH(p.x,p.z)+9;return [p.x+40,yD+14,p.z+30,p.x,yD+1,p.z];})(),
 'A six-arm junction':[850,26,60,800,1,0],'A ramp foot':(()=>{const J=TR_NET.junctions.find(J=>J.ramp);return J?[J.x+34,J.y+16,J.z+40,J.x,J.y+1,J.z]:[-1020,16,-500,-1020,1,-540];})(),'A T junction':[-60,16,50,-100,1,10],'A corner of two streets':[-660,12,600,-700,1,560],'A city street':[-560,7,575,-460,1,560],
 'From the air':[0,950,1500,0,0,-200]};
