// ================================================================= HOST — the page handed to core/host  [web]
// The kit's checks run under verify.py --assert, each with a broken input that must fail (hostNegatives).
const BUDGET={showcase:{tris:9000000,calls:900,rendered:7000000},cls:{pass:7000000,host:900000},type:{host:'host'}};
function mpAudit(){const out={};for(const F of MP.families()){const A=MP.audit(F);out[F.id]={ok:A.ok,fails:A.fails.slice(0,8),n:A.fails.length,rooms:A.rooms,flats:A.flats};}return out;}
// the furnished rooms of one storey, by the two audits kits/ancients-interiors runs
function mpRoomAudit(key,k){const F=MP.FAMILY[key],st=MP.storey(F,k),o=MP.furnish(F,st),fails=[];let pieces=0;(o.rooms||[]).forEach(r=>{pieces+=r.placements.length;if(r.recipe){const A=KratorAncientsInteriors.audit(r.recipe,o.catalog);if(!A.ok)fails.push(r.R.id+': '+JSON.stringify(A.fails[0]));}else{const A=KratorInteriors.audit(r.room,r.plan,o.adapter);if(!A.ok)fails.push(r.R.id+': '+JSON.stringify(A.fails[0]));}});return {rooms:(o.rooms||[]).length,pieces,fails};}
function hostChecks(){const R=[],add=(name,ok,detail)=>R.push({name,ok:!!ok,detail:detail||''}),a=mpAudit();
 for(const k in a)add(k+': the plans pass the audit',a[k].ok,a[k].ok?a[k].rooms+' rooms, '+a[k].flats+' flats':a[k].fails[0]);
 add('the stage booted',MPS.ready);if(!MPS.ready)return R;
 MPS.keys.forEach(k=>{const H=MPS.hero[k].userData,F=MP.FAMILY[k.split('.')[0]];add(k+': hero under its budget',H.tris<=F.tris,H.tris+' of '+F.tris);add(k+': hero under 10 draw calls',H.calls<10,''+H.calls);add(k+': a cage of 60 triangles or fewer',MPS.rec[k].tris<=60,''+MPS.rec[k].tris);});
 add('four impostors baked',MPS.impN===4,''+MPS.impN);return R;}
function hostNegatives(){const R=[];{const F=JSON.parse(JSON.stringify(MP.SPINDLE));F.core.shafts[0].x=9;R.push({name:'a shaft out of the core',failed:!MP.audit(F).ok});}
 R.push({name:'a cage over the budget',failed:(()=>{const r=KSHELL.record(Object.assign({},MP.SPINDLE,{shell:Object.assign({},MP.SPINDLE.shell,{sides:16})}),'x');return r.tris>60;})()});return R;}
KHOST.on(SKY.view,'view');KHOST.on(()=>MP.rideView(),'view');
const STOREY_SELECT=[['','take the lift to...']].concat(MP.SPINDLE.levels.map(L=>[String(L.k),'L'+L.k+' '+L.use]));
/* the Ancient dress's statue, rug and cold frame are the post-apoc set's pieces: build.py bundles that culture's file */
MP.walkSync();
const HOSTED=KHOST.take({build:'metropolis',walk:KWALK,controls:[{select:STOREY_SELECT,id:'mpStorey',on:v=>{if(v!=='')MP.ride(+v);}}],keys:{'.':()=>MP.step(1),',':()=>MP.step(-1)},title:'Krator — the metropolis test bed',hint:'Pick a view. The Tiers views are a city: fly (W A S D, Q E, Shift), F to walk. Fly or walk into a tower near you and its storey opens; the lift list and , . change storey. In a pair, west is the real building and east its baked shell.',
 scene,camera,renderer,ground:terrainH,clear:1.2,registry:REG,views:VIEWS,ticks:TICKS,onView:n=>MP.show(n),start:'Tiers, the worst street',
 clock:{hour:ATMOS.SKY.viewHour},draw:location.search.indexOf('nosky')>=0?undefined:SKY.draw,
 stats:()=>MPS.ready?('shell bake '+MPS.bakeMs+' ms, all '+MPS.bakeAllMs+' ms'+(MPS.tierN?'\nheroes '+MPS.tierN.heroes+', shells '+MPS.tierN.shells:'')):'baking',
 budget:BUDGET,types:()=>BIO.stats,guards:false,
 api:{hostChecks,hostNegatives,mpAudit,mpRoomAudit,show:n=>MP.show(n),stage:()=>({ready:MPS.ready,imp:MPS.impN,impMs:MPS.impMs,bakeMs:MPS.bakeMs,bakeAllMs:MPS.bakeAllMs,heroes:MPS.keys.map(k=>Object.assign({key:k},MPS.hero[k]?MPS.hero[k].userData:{})),shells:MPS.keys.map(k=>MPS.rec[k]?{key:k,tris:MPS.rec[k].tris,map:MPS.rec[k].map}:null),slots:MPS.packed,tier:MPS.tierN,towers:MPS.towers.length,open:MP.open.map(o=>Object.assign({key:o.key},{k:o.k,tris:o.g.userData.tris,pieces:o.g.userData.pieces,rooms:o.g.userData.rooms}))}),
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};}}});
