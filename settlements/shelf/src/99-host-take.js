// ================================================================= HOST — Shelf handed to core/host
// The camera, the loop, the panel, the inspector (KTAGS.page: the layout's records), the minimap and the probe are the host's
// (core/host/README.md); this says what the page has: its views, its ground, its sky, its checks.
// THE VIEWS ([camera xyz, target xyz] in the layout's frame: x along the face, z out of it toward Dalab's plain, y above sea level).
const VIEWS={
 'Shelf from the plain':[260,3150,4300,0,3300,0],
 'The face from the shelf':[700,2890,950,0,3300,60],
 'The gash and the prows wreck':[320,2960,1150,0,3020,320],
 'The pancaked wing':[-950,3320,640,-380,3220,100],
 'The sheared layers':[760,3110,560,250,3050,60],
 'The plateau from the Wall':[0,3960,-1700,0,3682,-300],
 'The caravan terminus':[-1380,3742,-760,-820,3684,-420],
 'The fort':[1320,3745,-280,860,3684,-450],
 'The shelf town':[920,2905,1040,0,2836,320],
 'Under the overhang':[-260,2837,250,0,3200,20],
 'The halting place':[-1540,2875,820,-1230,2832,440],
 'Down the face from the plateau':[-60,3722,-40,0,3000,500],
 'The road tunnels lower portal':[-985,2852,95,-1060,2838,8],
 'The portal house on the plateau':[-1170,3702,-150,-1256,3688,-200],
 'The road up the escarpment':[-1150,3050,3150,-1380,2820,2150],
};
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89z-host-sky.js) */
function shelfFootprints(own){return own.filter(r=>r.kit==='dalab').filter(r=>{const a=[r.w,r.d].sort((x,y)=>x-y),b=r.def.slice().sort((x,y)=>x-y);
 return Math.abs(a[0]-b[0])>1||Math.abs(a[1]-b[1])>1;}).map(r=>r.id+' '+r.w+'x'+r.d+' vs '+r.def.join('x'));}
function shelfChecks(){const L=SHELF_LAYOUT,R=[];
 SHELF.checks(L).forEach(c=>R.push({name:'layout: '+c.name,ok:c.pass,detail:c.detail.trim()}));
 R.push({name:'every part placed by its kit',ok:STOWN.missing.length===0&&STOWN.placed.length===L.parts.length,
  detail:STOWN.placed.length+' placed of '+L.parts.length+(STOWN.missing.length?'; missing '+STOWN.missing.slice(0,8).join(', '):'')+' ('+STOWN.ms+' ms)'});
 const badD=shelfFootprints(STOWN.own);
 R.push({name:'every Dalab building is a def of the set at the record\'s footprint',ok:STOWN.own.some(r=>r.kit==='dalab')&&!badD.length,
  detail:STOWN.own.filter(r=>r.kit==='dalab').length+' through the Dalab set'+(badD.length?'; '+badD.join(', '):'')});
 R.push({name:'every deck drawn from its record',ok:SSHELL.stats.decks===L.decks.length,detail:SSHELL.stats.decks+' decks, '+SSHELL.stats.blocks+' blocks, '+SSHELL.stats.stubs+' stubs; '+Math.round(SSHELL.tris/1000)+'k triangles'});
 const A=STAGS.T.audit();R.push({name:'tags: known vocabulary, a culture each',ok:A.unknown===0&&!A.missingCulture&&A.records>=L.decks.length,detail:A.records+' records, unknown '+A.unknown+', missing culture '+A.missingCulture});
 return R;}
function shelfNegatives(){const R=[],M=JSON.parse(JSON.stringify(SHELF_LAYOUT));
 M.decks.forEach(d=>{if(SHELF.BROKEN.indexOf(d.state)>=0)d.state='dead';});
 R.push({name:'a shell with nothing broken fails the ruin\'s share',ok:!SHELF.checks(M).find(c=>/held and mended/.test(c.name)).pass});
 R.push({name:'a Dalab building off its def\'s footprint is caught',ok:shelfFootprints([{id:'x',kit:'dalab',w:40,d:10,def:[20,14]}]).length===1});
 return R;}
KHOST.take({build:'shelf',title:'Shelf',
 hint:'Shelf: the Line\'s north station town on the Outer Wall\'s north escarpment, the Dalab Council\'s (settlements/shelf/PLAN.md section 5). The Ancients\' cliff city of 34 layers hung off an 850 m face toward Dalab\'s plain: the station and the caravan terminus on the plateau at 3,680 m, Dalab\'s town on the decks, the shelf town at 2,830 m with the prow\'s wreck across it.',
 scene,camera,renderer,ground:SHELF_H,clear:1.6,minR:2,maxR:30000,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 records:()=>STAGS.T.query({}),
 stats:()=>'shell '+Math.round(SSHELL.tris/1000)+'k tris\nparts '+STOWN.placed.length,
 minimap:{title:'Shelf'},
 budget:{showcase:{tris:6000000,calls:1200},cls:{},type:{}},
 api:{hostChecks:shelfChecks,hostNegatives:shelfNegatives,shelf:()=>({placed:STOWN.placed.length,missing:STOWN.missing,ms:STOWN.ms,decks:SSHELL.stats,tris:SSHELL.tris})}});
