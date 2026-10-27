// ================================================================= HOST — Span handed to core/host
// The camera, the loop, the panel, the inspector (KTAGS.page: the layout's records), the minimap and the probe are the
// host's (core/host/README.md); this says what the page has: its views, its ground, its sky, its checks.
// THE VIEWS ([camera xyz, target xyz] in the page's frame: x = u downstream, z = v the right bank)
const VIEWS={
 'Over the lake, down the canyon':[-1450,380,-260,-260,-80,0],
 'The Cross from the bay':[-640,6,70,-240,-8,0],
 'The trading post on the Apron':[-400,-22,95,-560,-44,-30],
 'The Basin Tunnel\'s portal':[-570,-34,-96,-570,-38,-172],
 'The Deep Reach from the gun gallery':[-176,-14,8,480,-120,0],
 'Down among the tanks':[-20,-174,-52,330,-128,20],
 'Across from the Middle Bridge':[262,3,-110,262,-70,150],
 'The rims from the south':[520,90,-470,160,-10,120],
 'The Pipe Bridge from below':[640,-176,-36,701,-48,0],
 'The Valley Tunnel':[725,-171,18,725,-174,88],
 'The weir and the lake':[-930,24,120,-1140,-6,0],
 'The lake sites':[-1500,160,180,-1900,0,300],
 'The arena and the highlanders\' quarter':[-320,95,215,-136,0,372],
 'Into the arena':[-92,24,352,-92,2,410],
 'The north gate of the Cross':[-200,8,300,-240,6,232],
 'Dalab\'s Line from the floor':[-60,-172,-55,-174,-170,0],
 'The watch pillar from the rim':[1236,46,-196,1470,-110,-300],
 'The pillar rim from its floor':[1780,-215,-660,1480,-110,-300],
 'Dalab\'s watch post':[1426,40,-250,1470,14,-300],
 'The cliff stair':[1372,-150,-292,1302,-130,-300],
 'The mission temple':[-178,12,368,-179,6,415],
};
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89z-host-sky.js) */
// the page's checks for verify.py --assert: the layout's rules (31-span-rules.js), every part placed, every record a
// known word, every inspector volume over something drawn; each with a negative that must fail
function spanChecks(){const L=SPAN_LAYOUT,R=[];
 SPAN.checks(L).forEach(c=>R.push({name:'layout: '+c.name,ok:c.pass,detail:c.detail.trim()}));
 R.push({name:'every part placed',ok:SP.missing.length===0&&SP.placed.length>=L.parts.length,detail:SP.placed.length+' placed of '+L.parts.length+(SP.missing.length?'; no builder for '+SP.missing.join(', '):'')+' ('+SP.ms+' ms)'});
 // every building of another kit (the Dalab set's, the Post-Apoc kit's) is a def of that kit at the record's footprint: the
 // def's w by d (a barricade's L), within a metre, either way round (a quarter-turned part swaps them)
 const keyed=SPAN_LAYOUT.parts.filter(p=>p.key&&(p.by!=='ancient'||p.key.indexOf('pa:')===0)),badD=keyed.filter(p=>{const q=SP.own.find(x=>x.id===p.id);
  if(!q||!q.def)return true;const a=[q.w,q.d].sort((x,y)=>x-y),b=q.def.slice().sort((x,y)=>x-y);return Math.abs(a[0]-b[0])>1||Math.abs(a[1]-b[1])>1;})
  .map(p=>{const q=SP.own.find(x=>x.id===p.id);return p.id+(q&&q.def?' '+q.w+'x'+q.d+' vs '+q.def.join('x'):' (no def '+p.key+')');});
 R.push({name:'every building of another kit is a def of that kit at the record\'s footprint',ok:keyed.length>0&&!badD.length,
  detail:SP.own.filter(r=>r.kit==='dalab').length+' through the Dalab set, '+SP.own.filter(r=>r.kit==='post-apoc').length+' through the Post-Apoc kit'+(badD.length?'; '+badD.join(', '):'')});
 // the pillar rim (SP5): every part on a pillar stands on the drawn body's top (KSTACKS.topAt at its centre, within 1.5 m),
 // and every stair way is drawn
 const onP=SPAN_LAYOUT.parts.filter(p=>p.on),badP=onP.filter(p=>{const B=SP.pillars.find(b=>b.id===p.on),b=SPAN.bbox(p.shape),c=SPAN.toWorld(SPAN_FRAME,(b[0]+b[1])/2,(b[2]+b[3])/2,0);
  return !B||!(Math.abs(KSTACKS.topAt([B],c[0],c[2])-p.y)<=1.5);}).map(p=>p.id);
 const st=SPAN_LAYOUT.ways.filter(w=>w.kind==='stair');
 R.push({name:'every part on a pillar stands on its drawn top; every stair is drawn',ok:onP.length>0&&!badP.length&&st.every(w=>SP.steps[w.id]>0),
  detail:SP.pillars.length+' pillars; '+onP.length+' on them'+(badP.length?', off the top: '+badP.join(', '):'')+'; '+st.map(w=>w.id+' '+(SP.steps[w.id]||0)+' steps').join(', ')});
 const A=SP.tags.audit();R.push({name:'tags: known vocabulary, a culture each',ok:A.unknown===0&&!A.missingCulture,detail:A.records+' records, unknown '+A.unknown+', missing culture '+A.missingCulture});
 return R;}
function spanNegatives(){const L=JSON.parse(JSON.stringify(SPAN_LAYOUT)),R=[];
 L.parts.find(p=>p.id==='pad_1').y=10;R.push({name:'a pad lifted off the rim fails the ground check',ok:!SPAN.checks(L).find(c=>/stands on the ground/.test(c.name)).pass});
 const M=JSON.parse(JSON.stringify(SPAN_LAYOUT));M.links=M.links.filter(k=>k[0]!=='tunnel_road'&&k[1]!=='tunnel_road');
 R.push({name:'the Tunnel Road removed fails the walk check',ok:!SPAN.checks(M).find(c=>/walkable part is reached/.test(c.name)).pass});
 return R;}
KHOST.take({build:'span',title:'Span',
 hint:'Span: the ruined Ancient arcology in Pan Riba\'s canyon, Dalab\'s fort, trading post and arena, where the SW highlanders\' strongest meets Dalab\'s champions each year (settlements/span/PLAN.md). The ground is a stand-in, the layout\'s own section, until the SW highlands station carves the canyon. Dalab\'s buildings are the Dalab set\'s; the arena, the Line and the highlanders\' quarter the Post-Apoc kit\'s.',
 scene,camera,renderer,ground:(x,z)=>SPAN.groundAt(SPAN_LAYOUT,x,z),clear:1.6,minR:2,maxR:9000,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 records:()=>SP.tags.query({}),
 stats:()=>'inst '+(window._instances||0)+'\nparts '+SP.placed.length,
 minimap:{title:'Span'},
 budget:{showcase:{tris:4000000,calls:900},cls:{},type:{}},
 api:{hostChecks:spanChecks,hostNegatives:spanNegatives,span:()=>({placed:SP.placed.length,missing:SP.missing,ms:SP.ms})}});
