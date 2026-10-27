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
};
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89z-host-sky.js) */
// the page's checks for verify.py --assert: the layout's rules (31-span-rules.js), every part placed, every record a
// known word, every inspector volume over something drawn; each with a negative that must fail
function spanChecks(){const L=SPAN_LAYOUT,R=[];
 SPAN.checks(L).forEach(c=>R.push({name:'layout: '+c.name,ok:c.pass,detail:c.detail.trim()}));
 R.push({name:'every part placed',ok:SP.missing.length===0&&SP.placed.length>=L.parts.length,detail:SP.placed.length+' placed of '+L.parts.length+(SP.missing.length?'; no builder for '+SP.missing.join(', '):'')+' ('+SP.ms+' ms)'});
 // every Dalab building is a def of the Dalab set, and its record's footprint is the def's own (w by d, within a metre)
 const keyed=SPAN_LAYOUT.parts.filter(p=>p.by==='dalab'&&p.kind!=='wall'),badD=keyed.filter(p=>{const q=SP.dalab.find(x=>x.id===p.id);
  return !q||Math.abs(q.w-q.def[0])>1||Math.abs(q.d-q.def[1])>1;}).map(p=>{const q=SP.dalab.find(x=>x.id===p.id);return p.id+(q?' '+q.w+'x'+q.d+' vs '+q.def.join('x'):' (no def '+p.key+')');});
 R.push({name:'every Dalab building is a Dalab set def at its own footprint',ok:keyed.length>0&&!badD.length,detail:SP.dalab.length+' placed through VERN.place'+(badD.length?'; '+badD.join(', '):'')});
 const A=SP.tags.audit();R.push({name:'tags: known vocabulary, a culture each',ok:A.unknown===0&&!A.missingCulture,detail:A.records+' records, unknown '+A.unknown+', missing culture '+A.missingCulture});
 return R;}
function spanNegatives(){const L=JSON.parse(JSON.stringify(SPAN_LAYOUT)),R=[];
 L.parts.find(p=>p.id==='pad_1').y=10;R.push({name:'a pad lifted off the rim fails the ground check',ok:!SPAN.checks(L).find(c=>/stands on the ground/.test(c.name)).pass});
 const M=JSON.parse(JSON.stringify(SPAN_LAYOUT));M.links=M.links.filter(k=>k[0]!=='tunnel_road'&&k[1]!=='tunnel_road');
 R.push({name:'the Tunnel Road removed fails the walk check',ok:!SPAN.checks(M).find(c=>/walkable part is reached/.test(c.name)).pass});
 return R;}
KHOST.take({build:'span',title:'Span',
 hint:'Span: the ruined Ancient arcology in Pan Riba\'s canyon, Dalab\'s fort and trading post (settlements/span/PLAN.md). The ground is a stand-in, the layout\'s own section, until the SW highlands station carves the canyon. Dalab\'s buildings are the Dalab set\'s (settlements/dalab, read in place).',
 scene,camera,renderer,ground:(x,z)=>SPAN.groundAt(SPAN_LAYOUT,x,z),clear:1.6,minR:2,maxR:9000,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 records:()=>SP.tags.query({}),
 stats:()=>'inst '+(window._instances||0)+'\nparts '+SP.placed.length,
 minimap:{title:'Span'},
 budget:{showcase:{tris:4000000,calls:900},cls:{},type:{}},
 api:{hostChecks:spanChecks,hostNegatives:spanNegatives,span:()=>({placed:SP.placed.length,missing:SP.missing,ms:SP.ms})}});
