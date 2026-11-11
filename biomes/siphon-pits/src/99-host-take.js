// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host (highrift's 99)
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){const S=SITE;
 if(SKEY==='terraces'){const z0=L.zc(0),F=S.farms[1];return{'The braids':look(-700,z0-260,14,500,L.zc(500),0),'The terraces':look(-300,240,5,500,1100,40),
  'A farmstead':look(F[0]-90,F[1]-80,6,F[0],F[1],2),'Willow on the bars':look(150,L.zc(150)-70,2.5,450,L.zc(450),0),'Across the graben':look(-2300,1500,180,500,0,0)};}
 if(SKEY==='scarp'){const T=L.TA,a=T(-1900,-500),b=T(300,0),c=T(-300,60),d=T(150,-40),e=T(1500,500),f=T(1800,700);return{'The Ostrukh Wall':[a[0],gh(a[0],a[1],40),a[1],b[0],gh(b[0],b[1],80),b[1]],
  'The switchbacks':[c[0],gh(c[0],c[1],8),c[1],d[0],gh(d[0],d[1],0),d[1]],'Frost polygons on the plateau':[e[0],gh(e[0],e[1],2.2),e[1],f[0],gh(f[0],f[1],0),f[1]],
  'The tollhouse':(()=>{const p=T(S.toll.t-120,S.toll.a+90),q=T(S.toll.t,S.toll.a);return[p[0],gh(p[0],p[1],10),p[1],q[0],gh(q[0],q[1],3),q[1]];})(),'From afar':look(-2400,-2000,400,0,0,0)};}
 if(SKEY==='pitfloor'){const G=S.geyser,c=S.camp;const V={'The grove under the deck':look(-380,-120,3,40,-160,12),'The vent well':look(G.x+90,G.z+70,3,G.x,G.z,10),'The walls and the galls':look(-L.edgeR+260,60,4,-L.edgeR-40,0,60),
  'The roper camp':look(c.x+150,c.z-110,6,c.x,c.z,2),'Up into the deck':look(100,300,2,0,-200,260),'Down from the rim':look(1700,600,30,0,0,0)};
  if(typeof GEODE!=='undefined'&&GEODE){const B=GEODE.block,fx=Math.cos(B.face),fz=Math.sin(B.face);V['The geode on the rim']=look(B.x+fx*9,B.z+fz*9,1.7,B.x,B.z,1.6);}return V;}
 const g0=SITE.gantry;return{'The knife-edge':look(-700,0,1.7,300,0,0),'Down into the south pit':look(120,6,1.7,120,700,-400),'The gantry':look(g0.x+60,-30,4,g0.x,30,0),
  'The Arete from above':look(-900,-500,260,200,0,0),'From afar':look(-2300,-1600,400,0,0,0)};})();
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(SIPHON.plantOfItem(item)||(item==='funnel'||item==='treefrond'||/^bark/.test(item)?SIPHON.byKey.woollysiphon:null));
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 const air=AIR_P(p.x,p.y,p.z),t=AIR_T(p.x,p.y,p.z);
 return name+'\n'+(isItem?'flora · '+SITE.title:'terrain / water / structure')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nground '+HEAT_AT(p.x,p.z).toFixed(0)+' degC · air '+air.toFixed(3)+' atm, '+t.toFixed(1)+' degC (the record\'s mean by the lapse)'+
  (typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+(KTAGS.hazardAt(p.x,p.y,p.z,ATMOS.clock?ATMOS.clock.t:0)||''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:10000000,calls:160},cls:{trees:4500000,floor:4000000,host:2500000},type:{'throne/trees':'trees','siphon/pit':'floor','siphon/cold':'floor','siphon/terraces':'floor','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// the items a tree is made of (the woolly siphon's, and the Throne's siphon it is grown by): stations 2 and 4 must hold none
const TREE_ITEMS=['biome:spfleece','biome:spfringe','biome:funnel','biome:treefrond'];
const HCHK={
 // the station's record against the model's air law (PLAN.md section 0): its pressure, and the page's air field at the station's point
 air(S,P,T){const law=1.6*Math.exp(-S.base/8000),pa=P(0,S.base,0),ta=T(0,S.base,0);const ok=Math.abs(S.atm-law)<.006&&Math.abs(pa-S.atm)<.006&&Math.abs(ta-S.mean)<.05;
  return{ok,detail:'record '+S.atm+' atm, law '+law.toFixed(3)+', the page\'s field '+pa.toFixed(3)+'; '+ta.toFixed(1)+' degC (record '+S.mean+')'};},
 placed(st){const need={terraces:['crops','willow','sedge'],scarp:['cushion','lichen','sedge'],pitfloor:['trees','pelts','felt','galls'],arete:['cushion','lichen']}[SKEY],
  zero=need.filter(k=>!(st&&st[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')};},
 trees(station,list,P){const r=SIPHON.treeRule(station,list),items=P.filter(p=>TREE_ITEMS.indexOf(p[3])>=0).length,cap=SIPHON.TREECAP[station];
  const ok=r.ok&&(cap===0?items===0:true);return{ok,detail:r.detail+'; '+items+' tree-item instances'};},
 felt(P){const bad=P.filter(p=>(p[3]==='biome:spfelt'||p[3]==='biome:spfelthum')&&HEAT_AT(p[0],p[2])>63);return{ok:!bad.length,detail:bad.length?bad.length+' felt on ground over 63 degC':'felt off the hot ground'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 geode(G){const n=G?G.lining.length:0;return{ok:n>1000,detail:n?'the walk-in geode: '+n+' amethyst points in a '+(G.block.pocket.r*2).toFixed(1)+' m pocket':'no geode'};},
 sites(list){const need={terraces:'farmstead',scarp:'tollhouse',pitfloor:'camp',arete:'trail'}[SKEY],n=list.filter(s=>s.kind===need).length;return{ok:n>0,detail:n+' '+need+' site(s) of '+list.length};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the station\'s air agrees with the corrected plan (the air law, the page\'s fields)',HCHK.air(SITE,AIR_P,AIR_T));
 add('the station\'s own life placed',HCHK.placed(window._station));
 add('the tree rule (cap '+SIPHON.TREECAP[SKEY]+')',HCHK.trees(SKEY,SIPHON.TREES,P));
 if(SKEY==='pitfloor'){add('the felt off the hot ground (KTHERM)',HCHK.felt(P));add('the walk-in geode on the rim (S7)',HCHK.geode(typeof GEODE!=='undefined'?GEODE:null));}
 add('nothing rooted under the water',HCHK.dry(P));
 add('the people\'s sites registered',HCHK.sites(SITES_PEOPLE));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('the old plan\'s pressure (7% high)',HCHK.air(Object.assign({},SITE,{atm:+(SITE.atm*1.07).toFixed(2)}),AIR_P,AIR_T));
 add('a field that is not the record\'s',HCHK.air(SITE,(x,y,z)=>AIR_P(x,y,z)*1.05,AIR_T));
 add('nothing placed',HCHK.placed({}));
 const fake=n=>Array.from({length:n},(_,i)=>({x:i,z:0}));
 add(SIPHON.TREECAP[SKEY]===0?'one tree on a treeless station':'one tree over the cap',HCHK.trees(SKEY,fake((SIPHON.TREECAP[SKEY]||0)+1),[]));
 if(SIPHON.TREECAP[SKEY]===0)add('a tree item on a treeless station',HCHK.trees(SKEY,[],[[0,0,0,'biome:spfleece']]));
 if(SKEY==='pitfloor')add('no geode',HCHK.geode(null));
 if(SKEY==='pitfloor')add('felt on the vent',HCHK.felt([[SITE.geyser.x,0,SITE.geyser.z,'biome:spfelt']]));
 add('no site',HCHK.sites([]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(deckView,'view');   /* after the sky: the deck's amber over the fog colour (89b) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const HINT={terraces:"Station 1 of Region 98 (scale model 5.1, px 1519,1453; 2,157 m, 1.22 atm, +15 degC mean, Cwb): the Ostrukh Terraces, the cold arable graben. The braided meltwater from the Stalker glaciers on its cobble bed, loess terraces stepping up both sides with the crops kits/crops gives the station, dwarf blue willow on the bars, farmstead sites (ideal type)",
 scarp:"Station 2 (px 1559,1457; 3,289 m, 1.06 atm, +4 degC, Dsc): the Scarp Pass, the Ostrukh Wall's ravine and scree fan with the caravan road switchbacking up it, the tollhouse site, beacon baskets, frost polygons on the plateau, cushion moss and lichen; no trees (ideal type)",
 pitfloor:"Station 3 (px 1687,1555; 2,277 m, 1.20 atm, +18 degC, Cfa): the Siphon Maar Floor, a maar 420 m deep in the sink, under the amber deck (to 2,580 m). Woolly siphon groves (the Throne's siphon as a kin, in machine-wax pelts) on the warm ground, siphon felt, suture galls at the walls' foot, the vent well's geyser and mud pots, the roper camp (ideal type)",
 arete:"Station 4 (px 1678,1542; 4,269 m, 0.94 atm, -5 degC, ET): the Arete Way, a 6 m knife-edge of basalt between two 420 m pits, crossed on iron stanchions and chains in the blizzard (?weather=clear for a clear day); the rim gantry, the flensers' lairs under the rims; no trees (ideal type)"}[SKEY];
KHOST.take({build:SKEY==='pitfloor'?'siphon-pits':'siphon-pits-'+SKEY,title:'Krator biome — Siphon Pits: '+SITE.title,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+' · trees '+SIPHON.TREES.length,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),sound:()=>({format:'krator-sound',version:0,station:SKEY,note:'records for core/audio (not yet in core)',sources:SIPHON.SOUND[SKEY]}),
  field:()=>KF.export({box:[-400,-400,400,400]}),plan:()=>({station:SKEY,mask:PLAN.mask||null,crops:PLAN.crops||null,sites:window._sites})},
 minimap:{title:SITE.title},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,station:()=>SKEY,trees:()=>SIPHON.TREES.slice(),air:(y)=>({atm:AIR_P(0,y,0),temp:AIR_T(0,y,0)}),sound:()=>SIPHON.SOUND[SKEY],
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:SKEY==='terraces'?[-200,-350,200,50]:SKEY==='pitfloor'?[200,-400,600,0]:[-200,-200,200,200],   /* the terraces' and the pit's hold their water */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),heat:HEAT_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
