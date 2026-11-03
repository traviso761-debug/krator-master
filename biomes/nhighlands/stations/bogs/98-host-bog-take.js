// ================================================================= HOST — station 5, the bog country: its views, its checks, its still (read by src/99-host-take.js)
// STATION_VIEWS    the station's presets in place of station 1's (the tower, the falls, the temperate giants are not here)
// STATION_SKIP     station 1's own invariants this station has no feature for (verify.py passes them as "not on this station"):
//                  the falls (a mire stream on a 0.4% grade has none), the tower, the trumpet colonies (the understorey trumpet is the wet
//                  old growth's), every species placed (the mire takes eleven of the kit's)
// STATION_CHECKS   the mire's own invariants, each with a broken input that must fail (verify.py --assert, "negative: ...")
// MIRROR_STILL     the reflections switch on the dubh lochan (the bog pools' one mesh; the pools stand within a metre of its level)
const STATION_SKIP=['stream-descends','tower-hung-with-growth','trumpets-and-glow-found','every-species-placed'];
const STATION_EXPORT_BOX=[LOCHAN.x-150,LOCHAN.z-150,LOCHAN.x+150,LOCHAN.z+150];   /* the export profile's box: the lochan, its pools and hummocks */
const MIRROR_STILL={materials:[POOLS_DRAW.material||POOLS_DRAW.mesh.material],level:LOCHAN.level,center:[LOCHAN.x,LOCHAN.z],radius:LOCHAN.a*3};
const STATION_VIEWS=function(add,G){const P=(s,t)=>xzOf(s,t);
 {const c=P(2600,-300),t=P(-1600,200);add('Overview: the bog country from the SE rise',[c[0],G(c[0],c[1])+90,c[1],t[0],G(t[0],t[1])+6,t[1]]);}
 {const D=DOMES[0],a=-2.3,cx=LOCHAN.x+Math.cos(a)*(LOCHAN.a+35),cz=LOCHAN.z+Math.sin(a)*(LOCHAN.a+35);add('The dubh lochan',[cx,G(cx,cz)+4,cz,LOCHAN.x,LOCHAN.level+1,LOCHAN.z]);}
 {const D=DOMES[0],cx=D.x+D.R*.55,cz=D.z+D.R*.3;add('A raised bog: pools and ridges',[cx,G(cx,cz)+14,cz,D.x,G(D.x,D.z)-2,D.z]);}
 {const c=P(2050,250),t=P(2350,-150);add('The string fen',[c[0],G(c[0],c[1])+8,c[1],t[0],G(t[0],t[1]),t[1]]);}
 {const i=Math.floor(STREAM.P.length*.55),p=STREAM.P[i],q=STREAM.P[i+14],a=STREAM.P[i-1],dx=q[0]-a[0],dz=q[1]-a[1],l=Math.hypot(dx,dz)||1,cx=p[0]-dz/l*5,cz=p[1]+dx/l*5;
  add('The peat stream and its hags',[cx,STREAM.level[i]+2.4,cz,q[0],STREAM.level[i+14]+1,q[1]]);}
 {const T=NHL.TREES.filter(T=>T.sp===NHL.KEY.greattrumpet&&T.lv===2).sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0];
  if(T){const cx=T.x+44,cz=T.z+30;add('A great trumpet alone in the fen',[cx,G(cx,cz)+4,cz,T.x,T.y0+T.H*.5,T.z]);
   const cx2=T.x+20,cz2=T.z-14;add('Night: the trumpets over the pools',[cx2,G(cx2,cz2)+3,cz2,T.x,T.y0+T.H*.45,T.z],'night');}}
 {const K=KNOLLS[0],a=Math.atan2(-K.z,-K.x),cx=K.x+Math.cos(a)*(K.R+160),cz=K.z+Math.sin(a)*(K.R+160);add('The lagg: the wood meets the mire',[cx,G(cx,cz)+3,cz,K.x,G(K.x,K.z)+10,K.z]);}
 {const c=P(-1800,400),t=P(400,-200);add('Morning fog on the flats',[c[0],G(c[0],c[1])+5,c[1],t[0],G(t[0],t[1])+4,t[1]],'dawn');}};
const STATION_CHK={
 // the mire is open: no tree over 8 m on its open ground (bog > .75) but the great trumpets, which stand there alone
 open(trees){const bad=trees.filter(T=>T.H>8&&T.sp!==NHL.KEY.greattrumpet&&FIELD.bog(T.x,T.z)>.75);
  return{ok:!bad.length,detail:bad.length?bad.length+' tall trees on the open mire (first '+NHL.SPECIES[bad[0].sp].key+' '+bad[0].H.toFixed(1)+' m at '+[bad[0].x|0,bad[0].z|0]+')':trees.length+' trees, none over 8 m on the open mire but the great trumpets'};},
 // the pools stand in the peat: each level under the ground round its rim, over its own floor
 pools(L){let bad=0,first=null;for(const P of L){const lip=P.poly.reduce((m,q)=>Math.min(m,terrainH(q[0]+(q[0]-P.x)*.15,q[1]+(q[1]-P.z)*.15)),1e9),floor=terrainH(P.x,P.z);
   if(!(P.level<lip+.05&&floor<P.level-.2)){bad++;first=first||P;}}
  return{ok:!bad,detail:bad?bad+' of '+L.length+' pools hang over the peat or have no floor (first at '+[first.x|0,first.z|0]+')':L.length+' pools, each under its lip and over its floor'};},
 // the mire's plants are drawn: the hummocks, cotton-grass, cloudberry and the corn lilies of the lagg
 plants(N){const thin=Object.keys(N).filter(k=>!(N[k]>=50));return{ok:!thin.length,detail:(thin.length?'too few: '+thin.join(', ')+'; ':'')+JSON.stringify(N)};},
 // the mire's hazards are registered (core/hazard records on core/tags): the domes' soft ground, the pools' quaking edges, the lochan
 hazards(R){const H=R.filter(r=>r.tags&&r.tags.hazard),k={};H.forEach(r=>{k[r.tags.hazard.kind]=(k[r.tags.hazard.kind]||0)+1;});
  return{ok:(k.sink||0)>=DOMES.length&&(k.drown||0)>=1,detail:H.length+' hazard records '+JSON.stringify(k)};}};
const stationN=()=>{const c=it=>{let n=0;BIO.baked.forEach(o=>{if(o.isInstancedMesh&&o.name==='biome:'+it)n+=o.count;});return n;};return{cushion:c('cushion'),cotton:c('cotton'),cloudberry:c('cloudberry'),cornlily:c('cornlily')};};
function STATION_CHECKS(){const R=[],add=(name,r)=>R.push({name,ok:r.ok,detail:r.detail}),neg=(name,r)=>R.push({name:'negative: '+name,ok:!r.ok,detail:(!r.ok?'fails as it must: ':'PASSED A BROKEN INPUT: ')+r.detail});
 add('the mire is open (no tall tree on the open bog)',STATION_CHK.open(NHL.TREES));
 add('the bog pools stand in the peat',STATION_CHK.pools(BOG_POOLS));
 const N=stationN();add('the mire\'s plants are drawn',STATION_CHK.plants(N));
 add('the mire\'s hazards are registered',STATION_CHK.hazards(BOG_HAZARDS));
 neg('a 30 m spruce at the lochan\'s crown',STATION_CHK.open([{sp:NHL.KEY.spirespruce,H:30,x:DOMES[0].x+200,z:DOMES[0].z}]));
 neg('a pool hung 2 m over the peat',STATION_CHK.pools([Object.assign({},BOG_POOLS[0],{level:BOG_POOLS[0].level+2})]));
 neg('no corn lilies drawn',STATION_CHK.plants(Object.assign({},N,{cornlily:0})));
 neg('no hazard registered',STATION_CHK.hazards([]));
 return R;}
const STATION_FRUIT=['berry'];   /* the rowans on the knolls (and the cloudberry's card, not a catalog fruit: KNOWN_ISSUES.md); no beech or oak for mast, no trumpet colonies for pods */
