// ================================================================= HOST — the page handed to core/host  [web]
// The kit's checks run under verify.py --assert, each with a broken input that must fail (hostNegatives).
const BUDGET={showcase:{tris:9000000,calls:900,rendered:7000000},cls:{pass:7000000,host:900000},type:{host:'host'}};
function mpAudit(){const out={};for(const F of MP.families()){const A=MP.audit(F);out[F.id]={ok:A.ok,fails:A.fails.slice(0,8),n:A.fails.length,rooms:A.rooms,flats:A.flats};}return out;}
// the furnished rooms of one storey, by the two audits kits/ancients-interiors runs
function mpRoomAudit(key,k){const F=MP.FAMILY[key],st=MP.storey(F,k),o=MP.furnish(F,st),fails=[];let pieces=0;(o.rooms||[]).forEach(r=>{pieces+=r.placements.length;if(r.synthetic)return;if(r.recipe){const A=KratorAncientsInteriors.audit(r.recipe,o.catalog);if(!A.ok)fails.push(r.R.id+': '+JSON.stringify(A.fails[0]));}else{const A=KratorInteriors.audit(r.room,r.plan,o.adapter);if(!A.ok)fails.push(r.R.id+': '+JSON.stringify(A.fails[0]));}});return {rooms:(o.rooms||[]).length,pieces,fails};}
function hostChecks(){const R=[],add=(name,ok,detail)=>R.push({name,ok:!!ok,detail:detail||''}),a=mpAudit();
 for(const k in a)add(k+': the plans pass the audit',a[k].ok,a[k].ok?a[k].rooms+' rooms, '+a[k].flats+' flats':a[k].fails[0]);
 /* the Ancients kit's buildings with plans (46d): planned off their hero's grid, so audited here, not in node */
 (MP.ANCIENT_PLANNED||[]).forEach(k=>{if(!MP.FAMILY[k])MP.hero(k);const F=MP.FAMILY[k],A=F?MP.audit(F):null;add(k+': the grid plans pass the audit',A&&A.ok,A?(A.ok?A.rooms+' rooms':A.fails[0]):'no family');});
 add('the stage booted',MPS.ready);if(!MPS.ready)return R;
 /* a wild look (overgrown, 59e) may hold MP.WILD_BUDGET times its family's budget and a few more draw calls (its bark, moss and green); its calls are its meshes less the door leaves */
 MPS.keys.forEach(k=>{const G=MPS.hero[k],H=G.userData,F=MP.FAMILY[k.split('.')[0]],wild=/\.wild$/.test(k),lim=wild?Math.round(F.tris*MP.WILD_BUDGET):F.tris,calls=G.children.filter(c=>c.isMesh&&!c.userData.door&&!c.userData.noShell).length;   /* the page's own planting (the lowland kits' baked meshes, noShell) is the host's, not the hero's */add(k+': hero under its budget',H.tris<=lim,H.tris+' of '+lim);add(k+': hero under '+(wild?16:10)+' draw calls',calls<(wild?16:10),''+calls);add(k+': a cage of 60 triangles or fewer',MPS.rec[k].tris<=60,''+MPS.rec[k].tris);
  if(wild){const W=H.wild||{};add(k+': overgrown (sockets, strands, moss)',W.sockets>0&&W.strands>0&&W.mossed>0,JSON.stringify({sockets:W.sockets,strands:W.strands,roots:W.roots,soil:W.soil,bushes:W.bushes,trees:W.trees,mossed:W.mossed,growthTris:W.tris,planted:H.flora?H.flora.planted:0,plantedTris:H.floraTris==null?0:H.floraTris}));add(k+': the wild shell baked',!!MPS.slot[k]&&MPS.atlasOf[k]!=null,'atlas '+MPS.atlasOf[k]);}});
 add(MPS.impKeys.length+' impostors baked',MPS.impN===MPS.impKeys.length,''+MPS.impN);
 /* the ruins: each state but intact and gutted has its rubble, under 25k triangles (it stands at every ruin within 1 km); every shell's slots in an atlas */
 MPS.keys.filter(k=>MP.RUINS.indexOf(k.split('.')[1])>1).forEach(k=>add(k+': rubble under 25k triangles',MPS.debris[k]&&MPS.debrisTris[k]<=25000,''+MPS.debrisTris[k]));
 add('every shell packs an atlas ('+MPS.atlases.length+')',MPS.packed.length===MPS.keys.reduce((n,k)=>n+KSHELL.slots(MPS.rec[k]).length,0),MPS.packed.length+' slots');return R;}
function hostNegatives(){const R=[];{const F=JSON.parse(JSON.stringify(MP.SPINDLE));F.core.shafts[0].x=9;R.push({name:'a shaft out of the core',failed:!MP.audit(F).ok});}
 /* the overgrowth: at a density of 0 nothing grows; a socket moved off the skin fails the inside test */
 {const G=MP.overgrow(new THREE.Group(),MP.SPINDLE,'crown',{density:0});R.push({name:'no growth at density 0',failed:G.userData.wild.sockets===0&&G.userData.wild.tris===0});}
 {const q=Object.assign({},MP.sockets(MP.SPINDLE,'crown',1).filter(s=>s.kind==='ledge')[0]);q.x+=40;R.push({name:'a socket off the skin',failed:!MP.socketInside(MP.SPINDLE,q)});}
 R.push({name:'a cage over the budget',failed:(()=>{const r=KSHELL.record(Object.assign({},MP.SPINDLE,{shell:Object.assign({},MP.SPINDLE.shell,{sides:16})}),'x');return r.tris>60;})()});return R;}
KHOST.on(SKY.view,'view');KHOST.on(()=>MP.rideView(),'view');
const STOREY_SELECT=[['','take the lift to...']].concat(MP.SPINDLE.levels.map(L=>[String(L.k),'L'+L.k+' '+L.use]));
/* the Ancient dress's statue, rug and cold frame are the post-apoc set's pieces: build.py bundles that culture's file */
MP.walkSync();
const HOSTED=KHOST.take({build:'metropolis',walk:KWALK,controls:[{select:STOREY_SELECT,id:'mpStorey',on:v=>{if(v!=='')MP.ride(+v);}},{button:'cut-away',id:'mpCut',title:'cut the building in front of you at a storey (X; [ ] move the cut)',on:()=>MP.cutToggle()}],keys:{'.':()=>MP.step(1),',':()=>MP.step(-1),'x':()=>MP.cutToggle(),'[':()=>MP.cutStep(-1),']':()=>MP.cutStep(1)},title:'Krator — the metropolis test bed',hint:'Pick a view. The Tiers views are a city: fly (W A S D, Q E, Shift), F to walk. Fly or walk into a tower near you and its storey opens; the lift list and , . change storey. In a pair, west is the real building and east its baked shell. X cuts the building in front of you away at a storey; [ and ] move the cut.',
 scene,camera,renderer,ground:terrainH,clear:1.2,registry:REG,views:VIEWS,ticks:TICKS,onView:n=>MP.show(n),start:'Tiers, the worst street',
 clock:{hour:ATMOS.SKY.viewHour},draw:location.search.indexOf('nosky')>=0?undefined:SKY.draw,
 stats:()=>MPS.ready?('shell bake '+MPS.bakeMs+' ms, all '+MPS.bakeAllMs+' ms'+(MPS.tierN?'\nheroes '+MPS.tierN.heroes+', shells '+MPS.tierN.shells:'')):'baking',
 budget:BUDGET,types:()=>BIO.stats,guards:false,
 api:{hostChecks,hostNegatives,mpAudit,mpRoomAudit,show:n=>MP.show(n),stage:()=>({ready:MPS.ready,imp:MPS.impN,impMs:MPS.impMs,bakeMs:MPS.bakeMs,bakeAllMs:MPS.bakeAllMs,heroes:MPS.keys.map(k=>Object.assign({key:k},MPS.hero[k]?MPS.hero[k].userData:{})),shells:MPS.keys.map(k=>MPS.rec[k]?{key:k,tris:MPS.rec[k].tris,map:MPS.rec[k].map}:null),slots:MPS.packed,tier:MPS.tierN,towers:MPS.towers.length,open:MP.open.map(o=>Object.assign({key:o.key},{k:o.k,tris:o.g.userData.tris,pieces:o.g.userData.pieces,rooms:o.g.userData.rooms}))}),
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};}}});
