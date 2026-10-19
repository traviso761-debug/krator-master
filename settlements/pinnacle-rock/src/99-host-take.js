// ================================================================= HOST — Pinnacle Rock's views, inspector words and checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment says what
// this page has. PLAN.md section 4 names the views; the ones for what is not built yet (the roosts, the town, the farms'
// fields) come with their stages.
const _fin=id=>ROCK.find(B=>B.id===id),_top=MESA_B.top;
const VIEWS=(function(){const V={},n0=_fin('fin-n0'),e1=_fin('fin-e1');
 V['Overview from the south-east, above the canopy']=[1500,560,1750,0,170,0];
 V['From afar (the knoll and the Inner Wall behind it)']=[2600,700,9000,0,600,-30000];
 if(n0)V['The north fins at roost height, over the gorge']=[n0.x+60,n0.top+20,-860,n0.x,n0.top-25,n0.z];
 if(e1)V['The east fins from the east']=[e1.x+330,e1.top+10,e1.z+90,e1.x,e1.top-30,e1.z];
 V['The Garden\'s mesa from the Crown']=[0,_top+14,-300,0,_top+90,0];
 if(GARDEN_B)V['Among the pinnacles (on the Garden\'s mesa)']=[70,GARDEN_B.top+8,95,-10,GARDEN_B.top+110,-30];
 V['The south nose (where the Stair comes down)']=[220,90,1000,0,140,560];
 V['The farm ring from the forest gate']=[0,12,PR.GATE.z+30,0,140,0];
 V['The gorge under the north rim']=[420,-20,PR.GORGE.z(420),-200,40,-700];
 V['The Inner Wall, north']=[0,_top+30,-560,0,1500,-40000];
 // the roosts (P2)
 {const R=ROOST.roosts.find(r=>r.plat==='deck-fin-e1')||ROOST.roosts.find(r=>/deck-fin-e/.test(r.plat));
  if(R)V['A Quetzal stall on the east fins']=[R.fx+R.ox*34+R.oz*10,R.y+8,R.fz+R.oz*34-R.ox*10,R.fx,R.y+2.5,R.fz];}
 {const G=ROOST.decks.find(d=>d.id==='deck-garden-2');if(G)V['The Garden\'s roost rings']=[G.x+150,G.y+30,G.z+120,G.x,G.y-10,G.z];}
 {const L=ROOST.lifts.find(l=>l.id==='lift-north');if(L)V['The beast lift over the gorge']=[L.tip.x+90,L.tip.y-60,L.tip.z-90,L.tip.x,L.tip.y-90,L.tip.z];}
 {const S=ROOST.stair;if(S&&S.landings.length){const m=S.pts[S.landings[0]];V['The Stair (its middle gate)']=[m[0]-30,m[1]+6,m[2]+45,m[0],m[1]-4,m[2]];}}
 return V;})();

// ---------------------------------------------------------------- the inspector's words: the rock, the zone of the top or
// the floor (the settled plan), a plant's species and harvest
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(NECANYONS.plantOfItem(item)||(HYPERJUNGLE.plantOfItem&&HYPERJUNGLE.plantOfItem(item)));
 const onTop=KSTACKS.at([MESA_B],p.x,p.z)&&p.y>_top-6,Z=onTop?PR.topZoneAt(p.x,p.z):PR.zoneAt(p.x,p.z);
 const hv=PLT&&PLT.tags?PLT.tags.harvest:null;
 return(PLT?PLT.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+
  '\n'+(onTop?'the top: ':'the floor: ')+Z.name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the page's checks (verify.py --assert)
const BUDGET={
 showcase:{tris:16000000,calls:240},
 cls:{pass:7000000,host:1600000},
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','pinnacle/talus':'pass','host':'host'},
};
// the plan's numbers (PLAN.md section 1, the settled layout)
const HCHK={
 // the mesa: 250 m over its south foot, about 1.2 km north-south by 0.8 km
 mesa(B){const b=B.beds[B.beds.length-1],S=a=>{let m=0;for(let k=-6;k<=6;k++)m=Math.max(m,KSTACKS.footR(b,a+k*.03)*(1-b.ch));return m;};   // the widest near each axis: a gully is not the mesa's size
  const ns=S(Math.PI/2)+S(-Math.PI/2),ew=S(0)+S(Math.PI),over=B.top-floorH(0,650);
  return{ok:over>240&&over<260&&ns>1050&&ns<1350&&ew>680&&ew<920,detail:'top '+over.toFixed(0)+' m over the south foot; '+ns.toFixed(0)+' m north-south by '+ew.toFixed(0)+' m'};},
 // the fins: ten, each wholly on the top at least 12 m in from the edge, 40-90 m over it, and SPREAD round the rim (the
 // owner, 2026-10-19: not clustered): at least five of the eight compass sectors hold one, and no 250 m circle holds
 // more than three
 fins(F){const bad=[];F.forEach(B=>{const b=B.beds[0];for(let i=0;i<24;i++){const a=i/24*TAU,R=KSTACKS.footR(b,a),A=KSTACKS.at([MESA_B],b.cx+Math.cos(a)*R,b.cz+Math.sin(a)*R);
   if(!A||A.d>-12){bad.push(B.id+' near the edge');break;}}const h=B.top-_top;if(h<38||h>95)bad.push(B.id+' '+h.toFixed(0)+' m');});
  const sec=new Set(F.map(B=>Math.floor(((Math.atan2(B.z,B.x)+TAU)%TAU)/(TAU/8))));
  let crowd=0;F.forEach(A=>{crowd=Math.max(crowd,F.filter(B=>Math.hypot(A.x-B.x,A.z-B.z)<250).length);});
  return{ok:F.length===10&&!bad.length&&sec.size>=5&&crowd<=3,detail:F.length+' fins; '+sec.size+' of 8 sectors; at most '+crowd+' within 250 m'+(bad.length?'; '+bad.join(', '):'')};},
 // the Garden: a smaller, lower mesa in the middle of the top (40-70 m over it, 350-480 m across), its pinnacles on it,
 // fourteen or more (with those on the Heart), tallest at the centre (the owner, 2026-10-19: even larger): those within
 // 100 m of its middle 180 m or more on average over its top, the outer ones lower; four carry roost rings
 garden(G,GB){const gtop=GB?GB.top:0,b=GB?GB.beds[GB.beds.length-1]:null,across=b?KSTACKS.footR(b,0)+KSTACKS.footR(b,Math.PI):0,rise=GB?GB.top-_top:0;
  const on=G.filter(B=>GB&&B.y0>gtop-10),h=B=>B.top-gtop,avg=L=>L.length?L.reduce((s,B)=>s+h(B),0)/L.length:0;
  const pin=on.filter(B=>B.kind==='spire'),inner=pin.filter(B=>Math.hypot(B.x-GB.x,B.z-GB.z)<100),outer=pin.filter(B=>Math.hypot(B.x-GB.x,B.z-GB.z)>=100),hi=avg(inner),lo=avg(outer);
  return{ok:!!GB&&rise>40&&rise<70&&across>350&&across<480&&on.length>=14&&G.filter(B=>B.ring).length===4&&hi>=180&&hi>lo+20,
   detail:'the Garden\'s mesa '+rise.toFixed(0)+' m over the top, '+across.toFixed(0)+' m across; '+on.length+' stacks on it ('+pin.length+' pinnacles); the centre\'s '+hi.toFixed(0)+
    ' m on average, the outer '+lo.toFixed(0)+' m; '+G.filter(B=>B.ring).length+' with rings'};},
 // the Heart: one more mesa in the Garden's middle (the owner, 2026-10-19), about half the height of the pinnacles there
 // (its rise over the Garden's mesa .4-.6 of theirs), three or more of them rising out of it, and weathered harder than
 // the Garden's mesa: how far its beds' rims stand from the same body cut clean (weather 0), as a share of the radius,
 // half as much again as the Garden's mesa's
 heart(H,GB,G,HS,GS){if(!H||!GB)return{ok:false,detail:'no Heart'};const K=KSTACKS,wx=(B,S)=>{const C=K.make({id:'clean',kind:'butte',x:B.x,z:B.z,y0:B.y0,seed:S.seed,lobes:S.lobes,
   weather:0,shoulder:S.shoulder,bed:S.bed,tiers:[{h:B.top-B.y0,r:S.r,e:S.e,ry:S.ry}]});let d=0,m=0;
   for(let k=0;k<Math.min(B.beds.length,C.beds.length);k++)for(let i=0;i<72;i++){const a=i/72*TAU,r0=K.footR(C.beds[k],a);d+=Math.abs(K.footR(B.beds[k],a)-r0);m+=r0;}return d/m;};
  const rise=H.top-GB.top,on=G.filter(B=>B.kind==='spire'&&K.at([H],B.x,B.z)),ph=on.length?on.reduce((s,B)=>s+B.top-GB.top,0)/on.length:0,wh=wx(H,HS),wg=wx(GB,GS);
  return{ok:on.length>=3&&rise>.4*ph&&rise<.6*ph&&wh>wg*1.5,detail:'the Heart '+rise.toFixed(0)+' m over the Garden\'s mesa; '+on.length+' pinnacles on it, '+ph.toFixed(0)+
   ' m on average; weathered '+(wh*100).toFixed(1)+'% of its radius (the Garden\'s mesa '+(wg*100).toFixed(1)+'%)'};},
 // no tree on the top (the town's ground) past its 12 m rim band, except on the Garden's stacks
 noTrees(T){const on=T.filter(t=>{const S=KSTACKS.at(ROCK,t.x,t.z);return !!S&&TOWN_GROUND.indexOf(S.S)>=0&&S.d<=-12;});
  return{ok:on.length===0,detail:on.length+' trees on the town\'s ground ('+T.length+' trees on the page)'};},
 // the forest keeps out of the farms and the bands' grounds: no hyperjungle geometry inside the palisade or a hedge
 cleared(pts){let n=0,ex=null;for(const p of pts){const Z=PR.zoneAt(p[0],p[1]).zone;if(Z==='farms'||Z==='pasture'||Z==='camp'||Z==='hedged'||Z==='fair'){n++;ex=ex||Z;}}
  return{ok:n===0&&pts.length>1000,detail:n+' forest points in the farms or a band\'s ground'+(ex?' (first in '+ex+')':'')+' of '+pts.length+' sampled'};},
 // the land is the scale model's: the page's floor at the knoll's middle and edge against WORLD.H (42)
 model(){const d=[[0,0],[1800,0],[-1800,0],[0,1800],[0,-1500]].map(q=>Math.abs(floorH(q[0],q[1])-(WORLD.H(q[0],q[1])-WORLD_H0)));
  const wall=WORLD.H(0,-48000)-WORLD_H0;
  return{ok:Math.max(...d)<.01&&wall>2500,detail:'floor = the model ('+Math.max(...d).toFixed(3)+' m off); the Inner Wall '+wall.toFixed(0)+' m over the knoll 48 km north'};},
 // THE ROOSTS (P2). The decks: a stall deck on each Wing's fin (seven) and on the four ringed Garden pinnacles, a ring on
 // every fin; no rock standing on a deck (its inner edge, its middle, its outer edge) from its own stack or any other
 decks(D){const bad=[],K=KSTACKS;D.forEach(d=>{const own=ROCK.find(B=>B.id===d.stack),others=ROCK.filter(B=>B!==own&&B.top>d.y-2);
   for(let i=0;i<d.inner.length;i+=2){const a=d.inner[i],b=d.outer[i],pts=[a,[(a[0]+b[0])/2,(a[1]+b[1])/2],b];
    for(const p of pts){if(own&&K.topAt([own],p[0],p[1])>d.y-1||others.length&&K.topAt(others,p[0],p[1])>d.y-2){bad.push(d.id);return;}}}});
  const st=D.filter(d=>d.level==='stall'),wingFins=st.filter(d=>d.group!=='garden').length,garden=st.filter(d=>d.group==='garden').length,fins=new Set(D.filter(d=>/^fin-/.test(d.stack)).map(d=>d.stack)).size;
  return{ok:!bad.length&&wingFins===7&&garden===4&&fins===10,detail:st.length+' stall decks ('+wingFins+' on the Wings\' fins, '+garden+' in the Garden), '+(D.length-st.length)+' lookout rings; rings on '+fins+' fins'+(bad.length?'; rock on '+bad.slice(0,4).join(', '):'')};},
 // the stalls: every Wing has eight or more, the east fins (the Quetzal's) some; every perch's way out (150 m straight
 // out from its stall, the stall's width either side) has no rock within 10 m under the deck
 stalls(R){const K=KSTACKS,bad=[],by={};R.forEach(r=>{by[r.wing]=(by[r.wing]||0)+1;const tx=-r.oz,tz=r.ox;
   for(let e=4;e<=150&&bad.indexOf(r.id)<0;e+=6)for(const q of [-5.5,0,5.5]){const x=r.fx+r.ox*e+tx*q,z=r.fz+r.oz*e+tz*q;if(K.topAt(ROCK,x,z)>r.y-10){bad.push(r.id);break;}}});
  const east=R.filter(r=>/deck-fin-e/.test(r.plat)).length;
  return{ok:!bad.length&&(by.wingclaw||0)>=8&&(by.quetzal||0)>=8&&(by.nightwing||0)>=8&&east>=8,detail:R.length+' stalls: '+Object.keys(by).map(k=>k+' '+by[k]).join(', ')+'; '+east+' on the east fins'+(bad.length?'; blocked: '+bad.slice(0,4).join(', '):'')};},
 // the bridges: four, each between the stall decks of one group's fins, under 90 m, each end on its deck
 bridges(B,D){const bad=[];B.forEach(b=>{const da=D.find(d=>d.id===b.a.deck),db=D.find(d=>d.id===b.b.deck);
   if(!da||!db||da.group!==db.group||da.level!=='stall'||db.level!=='stall'){bad.push(b.id+' joins two groups');return;}
   if(b.L>90)bad.push(b.id+' '+b.L.toFixed(0)+' m');
   [[b.a,da],[b.b,db]].forEach(q=>{const p=q[0],d=q[1],a=Math.atan2(p.z-d.z,p.x-d.x),i=Math.round(((a/TAU*PRR.N)%PRR.N+PRR.N)%PRR.N)%PRR.N,r=Math.hypot(p.x-d.x,p.z-d.z);
    if(r>Math.hypot(d.outer[i][0]-d.x,d.outer[i][1]-d.z)+.5||r<Math.hypot(d.inner[i][0]-d.x,d.inner[i][1]-d.z))bad.push(b.id+' off its deck');});});
  return{ok:B.length===4&&!bad.length,detail:B.length+' bridges ('+B.map(b=>b.id.replace(/^bridge-/,'')+' '+b.L.toFixed(0)+' m').join(', ')+')'+(bad.length?'; '+bad.join(', '):'')};},
 // the lifts: the cable hangs 3 m or more clear of the wall all the way down, the landing on the ground under the tip
 lifts(L){const bad=[];L.forEach(l=>{if(l.clear<3)bad.push(l.id+' '+l.clear.toFixed(1)+' m off the wall');if(Math.abs(l.foot.y-terrainH(l.foot.x,l.foot.z))>1.5)bad.push(l.id+' landing off the ground');});
  return{ok:L.length===2&&!bad.length,detail:L.map(l=>l.id+': '+l.len.toFixed(0)+' m boom, '+l.clear.toFixed(1)+' m clear, '+(_top-l.foot.y).toFixed(0)+' m drop').join('; ')+(bad.length?'; '+bad.join(', '):'')};},
 // the Stair: from the top to the fair ground, gated three times, no step steeper than the plan's (35 degrees on the
 // flights), every cut flight's tread out of the rock
 stair(S){if(!S)return{ok:false,detail:'no Stair'};const K=KSTACKS,P=S.pts,g=S.ground,end=g[g.length-1],Z=PR.zoneAt(end[0],end[2]).zone;
  let steep=0,buried=0;for(let i=S.shoulder;i+1<P.length;i++){const p=P[i],q=P[i+1],run=Math.hypot(q[0]-p[0],q[2]-p[2]);if(run>.05)steep=Math.max(steep,Math.abs(q[1]-p[1])/run);
   if(K.topAt([MESA_B],p[0],p[2])>p[1]+.05)buried++;}
  return{ok:Math.abs(P[0][1]-_top)<1.5&&(Z==='fair'||PR.inEll(end[0],end[2],PR.FAIR,15))&&S.gates.length===3&&steep<.7&&!buried,
   detail:'from '+P[0][1].toFixed(0)+' m to the '+Z+'; '+S.flights+' flights, '+S.landings.length+' landings, '+S.gates.length+' gates; steepest '+(Math.atan(steep)*180/Math.PI).toFixed(0)+' degrees'+(buried?'; '+buried+' treads in the rock':'')};},
 // the climbs: every deck has one, from the ground at its stack's foot (or the deck under it) to its own height
 climbs(C,D){const bad=[];D.forEach(d=>{const c=C.find(c=>c.deck===d.id);if(!c){bad.push(d.id+' no climb');return;}const P=c.pts,last=P[P.length-1];
   if(Math.abs(last[1]-d.y)>.05)bad.push(d.id+' short');let st=0;for(let i=0;i+1<P.length;i++){const run=Math.hypot(P[i+1][0]-P[i][0],P[i+1][2]-P[i][2]);if(run>.05)st=Math.max(st,(P[i+1][1]-P[i][1])/run);}if(st>.66)bad.push(d.id+' steep');});
  return{ok:!bad.length,detail:C.length+' climbs for '+D.length+' decks, '+C.reduce((s,c)=>s+c.pts.length,0)+' steps'+(bad.length?'; '+bad.slice(0,4).join(', '):'')};},
 // the flyers (Girder's, on these roosts): a quetzal sent in from 300 m out lands on an east fin's perch (P2's test), and
 // in a minute and a half of traffic no beast aloft passes through the rock
 flyers(decks){if(!PRFLY)return{ok:false,detail:'no flyers'};const F=PRFLY,sent=[];
  decks.forEach(id=>{const a=F.land(id,F.SP.Q,12);if(a)sent.push(a);});
  let inRock=0,samples=0;for(let k=0;k<180;k++){F.sim(.5,12);for(const a of F.list()){if(a.state!=='fly')continue;samples++;if(KSTACKS.topAt(ROCK,a.x,a.z)>a.y+.5)inRock++;}}
  const landed=sent.filter(a=>a.state==='perch'&&a.bay&&/deck-fin-e/.test(a.bay.plat.id)),S=F.stats();
  return{ok:landed.length>=1&&inRock===0&&S.usable>=60,detail:sent.length+' quetzals sent to the east fins, '+landed.length+' on a perch; '+S.usable+' of '+(S.bays.ok+S.bays.blocked)+' bays in use; '+
   S.animals+' beasts, '+S.totals.arrivals+' arrivals and '+S.totals.departures+' departures so far; '+inRock+' of '+samples+' samples aloft in the rock'};}};
// where the forest STANDS, sampled: the hyperjungle's instances (every 7th) and its merged meshes' vertices within 4 m of the
// ground (a trunk's foot, a fern: a crown leaning over a hedge is not the forest inside it)
function _forestPts(){const out=[],v=new THREE.Vector3(),M=new THREE.Matrix4();
 scene.traverse(o=>{if(!o.userData||o.userData.kit!=='hyperjungle')return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i+=7){o.getMatrixAt(i,M);v.setFromMatrixPosition(M);out.push([v.x,v.z]);}}
  else if(o.isMesh&&o.geometry&&o.geometry.attributes.position){const P=o.geometry.attributes.position;
   for(let i=0;i<P.count;i+=13){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);if(v.y-terrainH(v.x,v.z)<4)out.push([v.x,v.z]);}}});
 return out;}
const _fins=()=>ROCK.filter(B=>/^fin-/.test(B.id)),_garden=()=>ROCK.filter(B=>/^garden-/.test(B.id));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('the mesa: 250 m, 1.2 by 0.8 km',HCHK.mesa(MESA_B));
 add('ten fins on the rim, spread round it',HCHK.fins(_fins()));
 add('the Garden\'s mesa and its pinnacles',HCHK.garden(_garden(),GARDEN_B));
 add('the Heart: a third mesa, half the pinnacles\' height, the most weathered',HCHK.heart(HEART_B,GARDEN_B,_garden(),PR.HEART_MESA,PR.GARDEN_MESA));
 add('no tree on the town\'s ground',HCHK.noTrees(NECANYONS.TREES||[]));
 add('the forest out of the farms and the grounds',HCHK.cleared(_forestPts()));
 add('the land is the scale model\'s',HCHK.model());
 add('the roost decks: on the Wings\' fins and the Garden, clear of the rock',HCHK.decks(ROOST.decks));
 add('the stalls: every Wing\'s, each with its way out open',HCHK.stalls(ROOST.roosts));
 add('the bridges between a group\'s fins',HCHK.bridges(ROOST.bridges,ROOST.decks));
 add('the lifts: the cables clear of the wall',HCHK.lifts(ROOST.lifts));
 add('the Stair: the top to the fair ground, gated three times',HCHK.stair(ROOST.stair));
 add('a climb to every deck',HCHK.climbs(ROOST.climbs,ROOST.decks));
 add('the flyers: a quetzal lands on an east fin',HCHK.flyers(['deck-fin-e0','deck-fin-e1','deck-fin-e2']));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),F=_fins();
 add('the fins in one row on the north rim (as first drawn)',HCHK.fins(F.map((B,i)=>Object.assign({},B,{x:-270+i*60,z:-520}))));
 add('a fin over the edge',HCHK.fins(F.map((B,i)=>i?B:Object.assign({},B,{beds:[Object.assign({},B.beds[0],{cx:B.beds[0].cx*1.25,cz:B.beds[0].cz*1.25})]}))));
 add('a mesa 180 m high',HCHK.mesa(Object.assign({},MESA_B,{top:MESA_B.top-70})));
 add('the Garden all one height (no taller centre)',HCHK.garden(_garden().map(B=>Object.assign({},B,{top:B.y0+60})),GARDEN_B));
 add('no Garden\'s mesa (the pinnacles on the main top)',HCHK.garden(_garden(),null));
 add('no Heart',HCHK.heart(null,GARDEN_B,_garden(),PR.HEART_MESA,PR.GARDEN_MESA));
 add('a Heart as weathered as the Garden\'s mesa',HCHK.heart(Object.assign({},HEART_B,{beds:KSTACKS.make({id:'x',kind:'butte',x:HEART_B.x,z:HEART_B.z,y0:HEART_B.y0,seed:PR.HEART_MESA.seed,
  lobes:PR.HEART_MESA.lobes,weather:PR.GARDEN_MESA.weather,shoulder:PR.HEART_MESA.shoulder,bed:PR.HEART_MESA.bed,tiers:[{h:HEART_B.top-HEART_B.y0,r:PR.HEART_MESA.r,e:PR.HEART_MESA.e}]}).beds}),GARDEN_B,_garden(),PR.HEART_MESA,PR.GARDEN_MESA));
 add('a Heart as tall as its pinnacles',HCHK.heart(Object.assign({},HEART_B,{top:HEART_B.top+110}),GARDEN_B,_garden(),PR.HEART_MESA,PR.GARDEN_MESA));
 add('a tree in the Crown',HCHK.noTrees((NECANYONS.TREES||[]).concat([{x:0,z:-300,y0:_top}])));
 add('a tree in the farms',HCHK.cleared(_forestPts().concat([[-400,800]])));   // in the fields west of the road
 // the roosts' negatives
 {const d=ROOST.decks.find(d=>d.id==='deck-fin-e1');if(d)add('a deck cut into its fin (its inner edge 3 m into the rock)',HCHK.decks(ROOST.decks.map(D=>D!==d?D:Object.assign({},D,{inner:D.inner.map(p=>{const dx=p[0]-D.x,dz=p[1]-D.z,l=Math.hypot(dx,dz);return [p[0]-dx/l*3.8,p[1]-dz/l*3.8];})}))));}
 add('a perch facing its own fin',HCHK.stalls(ROOST.roosts.map((r,i)=>i?r:Object.assign({},r,{ox:-r.ox,oz:-r.oz}))));
 {const n0=ROOST.decks.find(d=>d.id==='deck-fin-n0'),e0=ROOST.decks.find(d=>d.id==='deck-fin-e0');
  if(n0&&e0)add('a bridge from the north fins to the east',HCHK.bridges(ROOST.bridges.map((b,i)=>i?b:Object.assign({},b,{b:{x:e0.outer[0][0],y:e0.y,z:e0.outer[0][1],deck:e0.id}})),ROOST.decks));}
 add('a lift whose cable rubs the wall',HCHK.lifts(ROOST.lifts.map((l,i)=>i?l:Object.assign({},l,{clear:l.clear-6}))));
 add('the Stair with two gates',HCHK.stair(Object.assign({},ROOST.stair,{gates:ROOST.stair.gates.slice(1)})));
 add('the Stair ending in the gorge',HCHK.stair(Object.assign({},ROOST.stair,{ground:ROOST.stair.ground.concat([[0,0,PR.GORGE.z(0)]])})));
 add('a deck with no climb',HCHK.climbs(ROOST.climbs.slice(1),ROOST.decks));
 add('a quetzal sent to a lookout ring (no stalls)',HCHK.flyers(['deck-fin-ne-look']));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.take({build:'pinnacle-rock',title:'Pinnacle Rock',
 hint:'Pinnacle Rock: the Beast Riders\' roost town on a red sandstone mesa (the rock, the site and the roosts; the town is to come)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 hourTicks:[(dt,hour)=>{if(PRFLY)PRFLY.update(dt,hour);}],   // Girder's flyers on the roosts (89b, build.py flyers_fragment)
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},
  'the roosts':{match:o=>!!(o.userData&&o.userData.roost)},'the flyers':{match:o=>!!(o.userData&&o.userData.flyers)},
  'the far land':{match:o=>!!(o.userData&&o.userData.far)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>({rock:KSTACKS.export(ROCK),plan:PR,roosts:ROOST})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,jungle:()=>window._jungle,far:()=>({rings:FAR.rings,around:FAR.around,water:FAR.water}),
  roosts:()=>({ms:ROOST.ms,decks:ROOST.decks.length,stalls:ROOST.roosts.length,bridges:ROOST.bridges.length,lifts:ROOST.lifts.length,climbs:ROOST.climbs.length,why:ROOST.why})}});
