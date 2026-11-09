// ================================================================= HOST — the page handed to core/host  [web]
// The kit's own checks run under verify.py --assert (hostChecks, each kind with a negative in hostNegatives); the hunters' asserts are
// verify.py's ASSERT_JS, through the public API.
const BUDGET={showcase:{tris:1500000,calls:400,rendered:1200000},cls:{life:300000,feature:300000,host:500000},type:{host:'host',far:'host',fauna:'life',phenomenon:'feature',portal:'feature'}};
function hostChecks(){const R=[],add=(name,ok,detail)=>R.push({name,ok:!!ok,detail:detail||''}),KE=KratorExtraplanar,REGY=XPS.registry;
 const chk=REGY.check();add('every phenomenon and portal was registered before it was drawn',chk.ok&&chk.drawn===XPS.field.length,chk.records+' records, '+chk.drawn+' drawn'+(chk.fails.length?': '+chk.fails[0]:''));
 add('every record is in core/tags with the kit\'s tags',REGY.all().every(r=>r.tagRecord&&r.tagRecord.id===r.id&&r.tagRecord.tags.origin==='extraplanar'),REGY.all().length+' records');
 add('every drawn group carries its record',XPS.field.every(g=>g.userData.rec&&REGY.get(g.userData.id)===g.userData.rec),''+XPS.field.length);
 const P=REGY.phenomena();let det=true,inRange=true;for(const r of P){const a=KE.pose(r,37.5),b=KE.pose(r,37.5);det=det&&JSON.stringify(a)===JSON.stringify(b);
  for(let t=0;t<120;t+=1.7){const p=KE.pose(r,t);if(!(p.open>=0&&p.open<=1&&Math.hypot(p.at[0]-r.at[0],p.at[2]-r.at[2])<=r.drift.r+1e-6))inRange=false;}}
 add('a phenomenon\'s pose is a pure function of (seed, t)',det,P.length+' phenomena');add('a phenomenon stays within its drift and its eyes within 0..1',inRange,'');
 let humOk=true,humMax=0;for(let i=0;i<40;i++){const h=KE.humAt(XPS.width+30+i*4,(i%7-3)*12,i*.9,REGY);humOk=humOk&&h>=0&&h<=1&&isFinite(h);humMax=Math.max(humMax,h);}
 add('the hum is bounded 0..1 and heard in the field',humOk&&humMax>0,'loudest '+humMax.toFixed(2));
 add('the hum is silent a kilometre off',KE.humAt(5000,5000,3,REGY)===0,'');
 const O=REGY.portals();let opOk=true;for(const r of O)for(let t=0;t<60;t+=.3){const o=KE.openness(r,t);if(!(o>=0&&o<=1))opOk=false;}
 add('every portal\'s openness is in 0..1 over a minute',opOk,O.length+' portals');
 const open=O.find(r=>r.state==='open'),shut=O.find(r=>r.state==='shut'),dead=O.find(r=>r.state==='dead'),fl=O.find(r=>r.state==='flicker');
 add('open is 1, shut 0, dead a residual, flicker flips',KE.openness(open,1)===1&&KE.openness(shut,1)===0&&KE.openness(dead,1)>0&&KE.openness(dead,1)<.1&&(()=>{let a=1,b=0;for(let t=0;t<120;t+=.25){const o=KE.openness(fl,t);a=Math.min(a,o);b=Math.max(b,o);}return a<.3&&b>.9;})(),'');
 add('the portal that leads to city3 says so',KE.through(open)&&KE.through(open).station==='city3'&&!KE.through(shut),'');
 add('a solid lends its tint to the sky over it',P.filter(r=>r.key==='solid').every(r=>JSON.stringify(KE.tintAt(r.at[0],r.at[2],REGY))===JSON.stringify(r.weather.tint)),'');
 add('the weather is on core/atmos: a pool of mist for every void, a plume for every solid',XPS.field.filter(g=>g.userData.kind==='phenomenon').every(g=>{const w=g.userData.weather,r=g.userData.rec;return (r.key!=='void'||w.mist)&&(r.key!=='solid'||w.plume);}),Object.keys(ATMOS.stats).join(', '));
 add('every hunter maps to a shared silhouette set and its card builds',XPS.lanes.every(L=>{const S=KE.silhouetteOf(L.key);return S&&KE.SILHOUETTES[S.set]&&S.h>0;})&&XPS.far.every(m=>m.userData.tris>0),XPS.far.map(m=>m.userData.set+' '+m.userData.tris).join(', '));
 add('the four silhouette sets are distinct shapes',new Set(XPS.far.map(m=>m.userData.set)).size===4,'');
 return R;}
function hostNegatives(){const R=[],KE=KratorExtraplanar;
 R.push({name:'drawing a record that was never registered throws',failed:(()=>{try{KE.draw.phenomenon(KE.phenomenon('void',{seed:999}),XPS.registry);return false;}catch(e){return true;}})()});
 R.push({name:'registering a record twice throws',failed:(()=>{try{XPS.registry.add(XPS.registry.all()[0]);return false;}catch(e){return true;}})()});
 R.push({name:'an unknown silhouette set throws',failed:(()=>{try{KE.far('blob',3);return false;}catch(e){return true;}})()});
 R.push({name:'an unknown phenomenon kind throws',failed:(()=>{try{KE.phenomenon('ghost');return false;}catch(e){return true;}})()});
 return R;}
const VIEWS=(function(){const V={},W=XPS.width,F=W+30;V['Lanes, all']=[W/2-20,14,42,W/2,5,-6];
 for(const L of XPS.lanes){const d=Math.max(L.w,L.h,L.d)*1.9;V[L.title]=[L.x0+Math.sin(.7)*d,L.h*.5+d*.16,Math.cos(.7)*d+4,L.x0,L.h*.42,0];}
 V['Far tier, the cards behind the hunters']=[W/2,9,150,W/2,6,-20];
 V['The field, the voids']=[F+30,6,46,F+14,3,18];V['The field, the solid and its weather']=[F+50,10,40,F+78,12,12];V['The field, the presence']=[F+22,3,6,F+28,1.8,-6];
 V['Portals, the drowned hall']=[F+92,4,10,F+104,3,-4];V['Portals, the door that leads to city3']=[F-2,3,-36,F+6,2,-44];V['Portals, the tear that flickers']=[F+50,4,54,F+58,2.5,46];
 return V;})();
KHOST.on(SKY.view,'view');
const HOSTED=KHOST.take({build:'extraplanar',controls:[{button:'idle',id:'xpIdle',title:'1: stand',on:()=>XPS.setMode('idle')},{button:'walk',id:'xpWalk',title:'2: walk on the spot',on:()=>XPS.setMode('walk')},
  {button:'march',id:'xpMarch',title:'3: march up and down the lanes',on:()=>XPS.setMode('march')},{button:'attack',id:'xpAttack',title:'X: every hunter attacks once (the tell first)',on:()=>XPS.attack()}],
 keys:{'1':()=>XPS.setMode('idle'),'2':()=>XPS.setMode('walk'),'3':()=>XPS.setMode('march'),'x':()=>XPS.attack()},
 title:'Krator — the extraplanar entities',hint:'Pick a view. The hunters stand in lanes (1 idle, 2 walk, 3 march, X attack: the tell comes first); their far-tier cards stand behind them. East, the field: voids that drift, solids with their own weather, a presence, and the portals. Fly (W A S D, Q E, Shift), F to walk; click a thing for its record.',
 scene,camera,renderer,ground:terrainH,clear:1.2,registry:REG,views:VIEWS,ticks:TICKS,start:'Lanes, all',
 clock:{hour:10.5},draw:location.search.indexOf('nosky')>=0?undefined:SKY.draw,
 stats:()=>'hum here '+XPS.hum.toFixed(2)+'  t '+XPS.t.toFixed(0)+' s  mode '+XPS.mode,
 budget:BUDGET,types:()=>BIO.stats,guards:false,
 api:{hostChecks,hostNegatives,stage:()=>({lanes:XPS.lanes.map(L=>L.key),field:XPS.field.length,far:XPS.far.length,records:XPS.registry.all().length,atmos:ATMOS.stats}),
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};}}});
