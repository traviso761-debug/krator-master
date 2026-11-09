// ================================================================= HOST — the inspector's words and the probe's checks, handed to core/host
// The views are 98v's (each station's own), the eye's helpers 98u's.
// ---------------------------------------------------------------- the inspector
function hazardWords(p){return typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z):'';}
function describe(hit){const p=hit.point,o=hit.object,t=Math.round(CAVE.temp(p.x,p.z)),V=CAVE.HOLD.at(p.x,p.y+.5,p.z,.5);
 let head;const rec=o.userData.recs&&hit.instanceId!=null?o.userData.recs[hit.instanceId]:null;
 if(rec&&rec.kind==='beam')head='A selenite beam: '+rec.len.toFixed(1)+' m, '+(rec.r*2).toFixed(1)+' m thick, rising at '+Math.round(rec.el*180/Math.PI)+' deg (KSPELEO '+rec.id+')';
 else if(rec&&rec.kind==='block')head='Selenite blocks: '+rec.parts.length+' crystals to '+rec.len.toFixed(1)+' m (KSPELEO '+rec.id+')';
 else if(rec)head='Bladed gypsum: '+rec.pts.length+' points to '+(rec.len*100|0)+' cm (KSPELEO '+rec.id+')';
 else{let best=null;for(const r of REG){if(r.r>300||!r.tags||!r.tags.cave)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}head=(best?best.name+'  ·  ':'')+(o.userData.inspectLabel||o.name||'mesh');}
 return head+'\n'+SITE.name+' · '+(SITE.G+p.y).toFixed(0)+' m ('+(-p.y).toFixed(0)+' m under the shelf) · air '+t+' degC, near 100% humidity'+
  (V?'\nreserved for the hold: '+V.name+' ('+V.kind+', floor '+V.floor.toFixed(1)+', '+V.temp+' degC)':'')+hazardWords(p)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's checks (each with a negative below)
const BUDGET={showcase:{tris:2500000,calls:80},cls:{rock:900000,crystal:1200000,host:400000},type:{cavern:'rock',hypogene:'crystal',selenite:'crystal',blades:'crystal'}};
const instAxes=M=>{const out=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),d=new THREE.Vector3();if(!M)return out;
 for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,s);d.set(0,1,0).applyQuaternion(q);out.push({p:[p.x,p.y,p.z],d:[d.x,d.y,d.z],len:s.y,r:s.x/2});}return out;};
const HCHK={
 /* no drawn crystal stands in a reserved volume (every selenite along its axis, every blade at its point) */
 massingClear(A,B){const H=CAVE.HOLD;let bad=null,n=0;
  for(const a of A){n++;for(let t=a.r;t<=a.len;t+=1){const V=H.at(a.p[0]+a.d[0]*t,a.p[1]+a.d[1]*t,a.p[2]+a.d[2]*t,a.r*.5);if(V){bad=bad||[V.id,a.p.map(v=>v|0)];break;}}}
  for(const b of B){n++;const V=H.at(b.p[0]+b.d[0]*b.len*.5,b.p[1]+b.d[1]*b.len*.5,b.p[2]+b.d[2]*b.len*.5,0);if(V&&!bad)bad=[V.id,b.p.map(v=>v|0)];}
  return{ok:!bad&&n>0,detail:bad?'a crystal in '+bad[0]+' at '+bad[1]:n+' crystals drawn, none in the '+H.volumes.length+' reserved volumes'};},
 /* every reserved volume is open void: its floor's middle and four points round it, 1.5 m up, are in the open */
 massingOpen(L){const bad=[];L.forEach(V=>{const s=V.shape;let P;
   if(s.type==='ellipse')P=[[s.c[0],s.c[1]]].concat([0,1,2,3].map(k=>[s.c[0]+s.rx*.6*Math.cos(k*TAU/4),s.c[1]+s.rz*.6*Math.sin(k*TAU/4)]));
   else if(s.type==='poly'){const c=s.pts.reduce((a,p)=>[a[0]+p[0]/s.pts.length,a[1]+p[1]/s.pts.length],[0,0]);P=[c].concat(s.pts.map(p=>[c[0]+(p[0]-c[0])*.5,c[1]+(p[1]-c[1])*.5]));}
   else{P=[];for(let i=0;i+1<s.pts.length;i++)for(const t of[.2,.5,.8]){const a=s.pts[i],b=s.pts[i+1];P.push([a[0]+(b[0]-a[0])*t,a[2]+(b[2]-a[2])*t,a[1]+(b[1]-a[1])*t]);}}   /* a capsule inside its run (its ends meet a chamber or the page's edge), its floor's height there */
   const shut=P.filter(p=>CAVE.C.sdf(p[0],(p[2]==null?V.floor:p[2])+1.5,p[1])<=.2);if(shut.length)bad.push(V.id+' ('+shut.length+'/'+P.length+')');});
  return{ok:!bad.length&&L.length>0,detail:bad.length?'rock in: '+bad.join(', '):L.length+' volumes open at their floors'};},
 /* the chambers' and shelves' floors are level: the floor under five points within 0.8 m of the record's */
 massingLevel(L){const bad=[];L.forEach(V=>{const s=V.shape;if(s.type==='capsule'||V.water)return;let P;   /* a chamber that is a warm pool: its floor is the water's */
   if(s.type==='ellipse')P=[[s.c[0],s.c[1]]].concat([0,1,2,3].map(k=>[s.c[0]+s.rx*.5*Math.cos(k*TAU/4+.4),s.c[1]+s.rz*.5*Math.sin(k*TAU/4+.4)]));
   else if(V.edge){/* a shelf over its rock: between its edge on the chamber's wall and its back, the corners kept off */const E=V.edge,B=[s.pts[1],s.pts[2]],L=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    P=[];for(const t of[.35,.8])for(const u of[.25,.5,.75])P.push(L(L(E[0],B[0],t),L(E[1],B[1],t),u));}
   else{const c=s.pts.reduce((a,p)=>[a[0]+p[0]/s.pts.length,a[1]+p[1]/s.pts.length],[0,0]);P=[c].concat(s.pts.map(p=>[c[0]+(p[0]-c[0])*.4,c[1]+(p[1]-c[1])*.4]));}   /* a landing: its middle and round it */
   const off=P.map(p=>{let y=V.floor+.5;for(let k=0;k<12&&CAVE.C.sdf(p[0],y-.25,p[1])>.05;k++)y-=.25;return Math.abs(y-V.floor);});const m=Math.max(...off);if(m>.8)bad.push(V.id+' '+m.toFixed(1)+' m');});
  return{ok:!bad.length,detail:bad.length?'not level: '+bad.join(', '):'every chamber and shelf floor level to 0.8 m'};},
 /* the beams stand only in the hot chambers (the megacrystals grew over the feeders) */
 beamsHot(R){const bad=R.filter(r=>r.kind==='beam'&&!CAVE.hotOf(1).some(c=>Math.hypot((r.x-c.c[0])/(c.rx+2),(r.z-c.c[2])/(c.rz+2))<=1));
  return{ok:!bad.length&&R.some(r=>r.kind==='beam'),detail:bad.length?bad.length+' beams outside the feeder chambers (first '+bad[0].id+')':R.filter(r=>r.kind==='beam').length+' beams, all in the feeder chambers'};},
 /* the heat is a hazard with soak over every hot chamber, and the beams are slippery */
 heat(L){const n=CAVE.hotOf(1).length,H=L.filter(r=>r.kind==='heat'&&r.soak&&r.danger>=1),S=L.filter(r=>r.kind==='slip');
  return{ok:H.length>=n&&S.length>=n&&n>0,detail:H.length+' lethal heat hazards with soak, '+S.length+' slip, for '+n+' hot chambers of the drained storey'};},
 /* the water is scalding only near the feeders (KTHERM): every pool at SITE.therm.scald or over has a heat hazard, none under it does */
 poolHeat(P,L){const hz=new Set(L.filter(r=>/:heat$/.test(r.id)).map(r=>r.id.replace(/:heat$/,''))),hot=P.filter(p=>p.temp>=SITE.therm.scald),miss=hot.filter(p=>!hz.has(p.id)),extra=P.filter(p=>p.temp<SITE.therm.scald&&hz.has(p.id));
  return{ok:P.length>0&&hot.length>0&&!miss.length&&!extra.length&&P.some(p=>p.temp<SITE.therm.scald),detail:miss.length?miss.length+' scalding pools without a heat hazard (first '+miss[0].id+')':extra.length?extra.length+' warm pools marked scalding':
   P.length+' pools: '+hot.length+' scalding ('+hot.map(p=>p.temp).join(', ')+' degC), the rest '+P.filter(p=>p.temp<SITE.therm.scald).map(p=>p.temp).join(', ')+' degC'};},
 /* bad air pooled on every active chamber's floor (KKARST's gas, shape.pool) */
 gas(L){const n=CAVE.chambers.filter(c=>c.storey===0).length,G=L.filter(r=>r.kind==='gas'&&r.shape&&r.shape.pool);return{ok:n>0&&G.length>=n,detail:G.length+' pooled gas hazards for '+n+' chambers of the active storey'};},
 /* the active storey's shelves, fields and landing stand dry over the water, on rock: their floors 1 m or more over the table, rock under them */
 dry(L){const T=CAVE.water?CAVE.water.level:-1e9,bad=L.filter(V=>V.storey===0&&V.shape.type==='poly').filter(V=>{const P=V.shape.pts,c=[P.reduce((a,p)=>a+p[0],0)/P.length,P.reduce((a,p)=>a+p[1],0)/P.length];
   const q=V.edge?[(V.edge[0][0]+V.edge[1][0])/2*.3+c[0]*.7,(V.edge[0][1]+V.edge[1][1])/2*.3+c[1]*.7]:c;return V.floor<T+1||CAVE.C.sdf(q[0],V.floor-.4,q[1])>0;});
  const n=L.filter(V=>V.storey===0&&V.shape.type==='poly').length;return{ok:n>0&&!bad.length,detail:bad.length?'wet or hanging: '+bad.map(V=>V.id).join(', '):n+' shelves, fields and the landing dry over the water, on rock'};},
 /* every view's eye stands in the open (the massing view is over the shelf, in the sky) */
 eyes(Cm){const bad=Cm.filter(c=>c.view!==MASSING_VIEW&&(CAVE.C.sdf(c.x,c.y,c.z)<.3||c.y<WL+.3));return{ok:!bad.length,detail:bad.length?'in the rock or the water: '+bad.map(c=>c.view).join(', '):Cm.length+' view cameras in the open air'};},
 /* the active storey's dress keeps off the hold (the hypogene records by their foot and their tip) */
 dressClear(R){const H=CAVE.HOLD;let bad=null;R.forEach(r=>{if(bad)return;const down=r.kind==='stalactite'||r.kind==='chandelier',tip=r.y+(down?-1:1)*(r.len==null?0:r.len);
   const V=H.at(r.x,r.y,r.z,0)||H.at(r.x,tip,r.z,0);if(V)bad=[V.id,r.id];});return{ok:!bad,detail:bad?bad[1]+' in '+bad[0]:R.length+' hypogene pieces, none in a reserved volume'};}};
const hazList=()=>typeof KHAZ!=='undefined'?KHAZ.list().map(r=>KHAZ.of(r)||r).filter(Boolean):[];
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('no crystal stands in the hold\'s reserved volumes',HCHK.massingClear(instAxes(CRYSTALS.sel),instAxes(CRYSTALS.blades)));
 add('every reserved volume is open void',HCHK.massingOpen(CAVE.HOLD.volumes));
 add('the reserved chambers and shelves have level floors',HCHK.massingLevel(CAVE.HOLD.volumes));
 add('the selenite beams stand in the feeder chambers only',HCHK.beamsHot(CAVE.beams.concat(CAVE.floor)));
 add('the hot chambers are lethal heat (soak) and slippery (core/hazard)',HCHK.heat(hazList()));
 add('the active storey\'s dress keeps off the hold',HCHK.dressClear(CAVE.hypo));
 add('the water scalds only near the feeders (KTHERM; a heat hazard on each scalding pool)',HCHK.poolHeat(CAVE.water?CAVE.water.pools:[],CAVE.hazards));
 add('bad air pooled on every active chamber\'s floor',HCHK.gas(hazList()));
 add('the active storey\'s shelves, fields and landing stand dry over the water, on rock',HCHK.dry(CAVE.HOLD.volumes));
 add('the views\' cameras stand in the open',HCHK.eyes(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const N=CAVE.HOLD.volumes.find(v=>v.kind==='chamber'&&!v.water),c=N.shape.c;   /* a dry chamber (the drained storey's): a warm pool's floor is its water */
 add('a beam through the hold\'s hall',HCHK.massingClear([{p:[c[0]-6,N.floor+.5,c[1]],d:[1,0,0],len:12,r:.6}],[]));
 add('a reserved volume in the rock',HCHK.massingOpen([Object.assign({},N,{id:'fake',shape:Object.assign({},N.shape,{c:[c[0]+SITE.half*3,c[1]]})})]));
 add('a reserved floor 3 m off',HCHK.massingLevel([Object.assign({},N,{id:'fake',floor:N.floor+3})]));
 add('a beam in the hold\'s hall',HCHK.beamsHot([{kind:'beam',id:'fake',x:c[0],z:c[1]}]));
 add('no heat hazard',HCHK.heat([]));
 add('a camera in the rock',HCHK.eyes([{view:'rock',x:c[0],y:N.floor-5,z:c[1]}]));
 {const P=(CAVE.water?CAVE.water.pools:[]).map(p=>Object.assign({},p));const h=P.find(p=>p.temp>=SITE.therm.scald);add('a scalding pool with no hazard',HCHK.poolHeat(P,CAVE.hazards.filter(r=>!h||r.id!==h.id+':heat')));}
 add('no pooled gas',HCHK.gas([]));
 {const S=CAVE.HOLD.volumes.find(v=>v.storey===0&&v.kind==='shelf');add('a shelf under the water',HCHK.dry([Object.assign({},S,{id:'fake',floor:(CAVE.water?CAVE.water.level:0)-.5})]));}
 {const Vh=CAVE.HOLD.volumes.find(v=>v.storey===0&&v.kind==='shelf'),m=Vh.shape.pts[0];add('a chandelier on a shelf',HCHK.dressClear([{id:'fake',kind:'chandelier',x:m[0]*.5+Vh.shape.pts[2][0]*.5,y:Vh.floor+3,z:m[1]*.5+Vh.shape.pts[2][1]*.5,len:2}]));}
 return R;}
const EXPORT_BOX=(STATION.key==='hold'?(()=>{const c=CAVE.chambers.find(q=>q.id==='ch:n0:-14,-5');return [c.c[0]-60,c.c[2]-60,c.c[0]+60,c.c[2]+60];})():[FX-60,FZ-60,FX+60,FZ+60]).map(Math.round);
KHOST.take({build:'hearths-'+STATION.key,title:'Krator biome — the Hearths: '+STATION.name,
 hint:STATION.key==='hold'?'The Hearth hold, the active storey (rift rim N): '+(SITE.G+SITE.net.level)+' m, 70 m under the shelf, under a metre of warm water (scalding at the feeders, KTHERM); gypsum chandeliers (KSPELEO hypogene), the fumarole, bad air on the water; the hold\'s lower storey massed on shelves over the water, empty (?massing=1); scale model 5.1 px '+SITE.px+','+SITE.py+' (PLAN.md section 19)':
  SITE.region+': '+(SITE.G-40)+' m, 40 m under the shelf; the Naica of the Hearth hold (KKARST hypogene, KSPELEO selenite, KTHERM '+Math.round(CAVE.temp(FX,FZ))+' degC); '+
  'the hold\'s spaces massed and empty (?massing=1); scale model 5.1 px '+SITE.px+','+SITE.py+' (PLAN.md section 18)',
 scene,camera,renderer,ground:groundEye,clear:1.5,registry:REG,regHas,views:VIEWS,onView,ticks:TICKS,
 clock:{hour:12},inspect:describe,stats:()=>'beams '+CRYSTALS.beams+' · blades '+CRYSTALS.points+' · rock '+ROCK.tris+' tris',
 layers:{'crystals':{match:o=>!!(o.userData&&o.userData.crystal)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'massing':{objects:()=>[MASSING.group]},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export(),cave:()=>CAVE.export(),hold:()=>CAVE.HOLD.export()},
 minimap:{title:SITE.name},
 guards:false,   /* the biome core's card guards: no foliage on this page, so their negatives could not fail */
 budget:BUDGET,types:()=>({cavern:{tris:ROCK.tris,inst:0,meshes:ROCK.meshes},hypogene:{tris:HYPO.tris,inst:0,meshes:HYPO.mesh?1:0},selenite:{tris:CRYSTALS.tris.selenite,inst:CRYSTALS.sel?CRYSTALS.sel.count:0,meshes:1},
  blades:{tris:CRYSTALS.tris.blades,inst:CRYSTALS.blades?CRYSTALS.blades.count:0,meshes:1}}),
 api:{hostChecks,hostNegatives,
  get totals(){return {tris:ROCK.tris+HYPO.tris+CRYSTALS.tris.selenite+CRYSTALS.tris.blades,inst:window._instances,meshes:ROCK.meshes+3,registered:REG.length,types:4};},
  hold:()=>CAVE.HOLD.export(),cave:()=>({chambers:CAVE.chambers.length,passages:CAVE.passages.length,hot:CAVE.hot.map(c=>c.id),beams:CRYSTALS.beams,blocks:CRYSTALS.blocks,points:CRYSTALS.points}),
  exportProfile:['registry','hazards','terrain','stage','atmos','water'],   /* no flora: no items, buckets or BIO materials */
  exportBox:EXPORT_BOX,
  at:(x,z)=>({floor:terrainH(x,z),water:waterH(x,z),temp:CAVE.temp(x,z)})}});
