// ================================================================= HOST — Ledge handed to core/host
// The camera, the loop, the panel, the inspector (KTAGS.page: the layout's records), the minimap and the probe are the host's
// (core/host/README.md); this says what the page has: its views, its ground, its sky, its checks.
// THE VIEWS ([camera xyz, target xyz] in the layout's frame: x east, z south, y above sea level). No apostrophe or colon in a name.
const VIEWS={
 'Ledge from the lake':[150,520,2700,0,950,0],
 'The face from the east shore':[1700,640,1100,0,950,60],
 'The gash and the prows wreck':[260,420,700,0,700,80],
 'The pancaked wing':[640,1260,560,260,1210,90],
 'The sheared layers':[-560,700,460,-150,640,40],
 'The station on deck 20':[160,960,330,80,940,0],
 'The crown and the gene bank':[-420,1650,560,-140,1520,60],
 'The head from the escarpment':[60,1960,-1650,0,1562,-300],
 'The road head and the west gate':[-1150,1640,-560,-600,1566,-350],
 'The Fellgang quarter on the head':[980,1610,-120,680,1566,-360],
 'The foot and the harbour':[620,345,620,100,320,90],
 'Under the overhang':[-330,318,175,0,640,20],
 'The viaduct stumps toward Nulab':[760,312,1300,420,300,650],
 'Down the face from the head':[-60,1600,-30,0,600,300],
};
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89z-host-sky.js) */
// the page's checks for verify.py --assert: the layout's rules, every part placed by its kit, every Dalab building a def at its
// footprint, every deck drawn, the tags; each with a negative that must fail
function ledgeFootprints(own){return own.filter(r=>r.kit==='dalab').filter(r=>{const a=[r.w,r.d].sort((x,y)=>x-y),b=r.def.slice().sort((x,y)=>x-y);
 return Math.abs(a[0]-b[0])>1||Math.abs(a[1]-b[1])>1;}).map(r=>r.id+' '+r.w+'x'+r.d+' vs '+r.def.join('x'));}
function ledgeChecks(){const L=LEDGE_LAYOUT,R=[];
 LEDGE.checks(L).forEach(c=>R.push({name:'layout: '+c.name,ok:c.pass,detail:c.detail.trim()}));
 R.push({name:'every part placed by its kit',ok:LTOWN.missing.length===0&&LTOWN.placed.length===L.parts.length,
  detail:LTOWN.placed.length+' placed of '+L.parts.length+(LTOWN.missing.length?'; missing '+LTOWN.missing.slice(0,8).join(', '):'')+'; '+LTOWN.standin.length+' tg stand-ins ('+LTOWN.ms+' ms)'});
 const badD=ledgeFootprints(LTOWN.own);
 R.push({name:'every Dalab building is a def of the set at the record\'s footprint',ok:LTOWN.own.some(r=>r.kit==='dalab')&&!badD.length,
  detail:LTOWN.own.filter(r=>r.kit==='dalab').length+' through the Dalab set, '+LTOWN.own.filter(r=>r.kit==='fellgang').length+' through the Fellgang set'+(badD.length?'; '+badD.join(', '):'')});
 const fgN=['Z0','Z5'].map(z=>LTOWN.fg[z]?LTOWN.fg[z].recs.length:0),fgW=['Z0','Z5'].map(z=>L.parts.filter(p=>p.zone===z&&p.key&&p.key.indexOf('fg-')===0).length);
 R.push({name:'the Fellgang quarters drawn, a building a record',ok:fgN[0]===fgW[0]&&fgN[1]===fgW[1]&&fgW[0]>0,detail:'head '+fgN[0]+'/'+fgW[0]+', foot '+fgN[1]+'/'+fgW[1]});
 R.push({name:'every deck drawn from its record',ok:LSHELL.stats.decks===L.decks.length,detail:LSHELL.stats.decks+' decks, '+LSHELL.stats.blocks+' blocks, '+LSHELL.stats.stubs+' stubs; '+Math.round(LSHELL.tris/1000)+'k triangles'});
 const A=LTAGS.T.audit();R.push({name:'tags: known vocabulary, a culture each',ok:A.unknown===0&&!A.missingCulture&&A.records>=L.decks.length,detail:A.records+' records, unknown '+A.unknown+', missing culture '+A.missingCulture});
 return R;}
function ledgeNegatives(){const R=[],M=JSON.parse(JSON.stringify(LEDGE_LAYOUT));
 M.decks.forEach(d=>{if(LEDGE.BROKEN.indexOf(d.state)>=0)d.state='dead';});
 R.push({name:'a shell with nothing broken fails half ruined',ok:!LEDGE.checks(M).find(c=>/half ruined/.test(c.name)).pass});
 const S=JSON.parse(JSON.stringify(LEDGE_LAYOUT));S.links.push(['d.39.e1','d.20.e1',{via:'a dead stair'}]);
 R.push({name:'a stair through the dead decks breaks the strike\'s seal',ok:!LEDGE.checks(S).find(c=>/strike seals/.test(c.name)).pass});
 R.push({name:'a Dalab building off its def\'s footprint is caught',ok:ledgeFootprints([{id:'x',kit:'dalab',w:40,d:10,def:[20,14]}]).length===1});
 return R;}
KHOST.take({build:'ledge',title:'Ledge',
 hint:'Ledge: the Realm of Dalab\'s half-ruined Ancient arcology on the West Rift\'s great lake (settlements/ledge/PLAN.md section 9). 42 layers on a 1,265 m face: the head (Dalab and the Fellgangs) on the bench at 1,562 m, the crown, the dead decks, Loj Fower\'s middle decks round the Line\'s station, the sheared layers, the foot and the harbour at 312 m. Decks coloured by life: lit windows where people live, green and red lamps on Loj Fower\'s.',
 scene,camera,renderer,ground:LEDGE_H,clear:1.6,minR:2,maxR:30000,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 records:()=>LTAGS.T.query({}),
 stats:()=>'shell '+Math.round(LSHELL.tris/1000)+'k tris\nparts '+LTOWN.placed.length,
 minimap:{title:'Ledge'},
 budget:{showcase:{tris:6000000,calls:1200},cls:{},type:{}},
 api:{hostChecks:ledgeChecks,hostNegatives:ledgeNegatives,ledge:()=>({placed:LTOWN.placed.length,missing:LTOWN.missing,ms:LTOWN.ms,decks:LSHELL.stats,tris:LSHELL.tris})}});
