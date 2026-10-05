// ================================================================= YS CITY — the placement's probe: _api.city.place() and the city's invariants
// PLAN.md §4 and P3 step 5: the kit audit (every HYK.def placed at least once; the zero list printed), at least three
// full-height towers, a host's pods on more than one plate, nothing on a street and nothing on anything else, every
// record built, and the land quarter's reclaimed Ancients counted (records; drawn once their types are vendored).
window._api.city.place=()=>ysPlaceCensus();
window._api.city.records=()=>({blds:PLACE.blds.map(r=>({key:r.key,x:+r.x.toFixed(2),z:+r.z.toFixed(2),ry:+r.ry.toFixed(4),y:+r.y.toFixed(2),v:r.v,why:r.why,block:r.block})),
 hosts:PLACE.hosts.map(h=>({n:h.n,block:h.block,type:h.type,x:h.x,z:h.z,ry:h.ry,sink:h.sink,d:h.d,cutY:h.cutY,full:h.full,top:h.top,plates:h.plates,pods:h.pods,ways:h.ways})),
 slots:PLACE.slots.map(s=>{const o=Object.assign({},s);delete o.box;return o;}),moles:PLACE.moles.map(m=>({name:m.name,y:m.y,poly:m.poly}))});
// the spans the bridge graph does not lay yet (PLAN.md P3 step 3): the audit names them apart
const YS_PL_LATER=['hyk_span_l1','hyk_span_l2','hyk_drawbridge','hyk_spiral_stair','hyk_ladder','hyk_lilypad','hyk_walkway','hyk_pontoon'];
BUDGET.type.roads='env';BUDGET.type['mole quay']='env';   // the city's own ground work: the road ribbons, the moles' plates and quay walls
function ysCityChecks(){const R=[];const C=ysPlaceCensus();
 {const spanKey={bridge:null,drawbridge:'hyk_drawbridge',walkway:'hyk_walkway',pontoon:'hyk_pontoon'};const used=new Set(SPANS.list.filter(s=>s.drawn).map(s=>s.kind==='bridge'?(s.level==='L2'?'hyk_span_l2':'hyk_span_l1'):spanKey[s.kind]));
  if(SPANS.list.some(s=>s.drawn&&s.kind==='bridge'&&s.b.pad))used.add('hyk_lilypad');
  R.push({name:'stairs-to-the-water',ok:SPANS.stairs>0,detail:SPANS.stairs+' spiral stairs down a tower\'s face to a wet landing (their plinths left out)'});
  C.zero=C.zero.filter(k=>!used.has(k));   /* a span def is in the city when its helper is (the defs are the sheet's showcases) */
  const zero=C.zero.filter(k=>YS_PL_LATER.indexOf(k)<0),later=C.zero.filter(k=>YS_PL_LATER.indexOf(k)>=0);
  R.push({name:'kit-audit-every-def-placed',ok:!zero.length,detail:(zero.length?zero.length+' never placed: '+zero.join(' '):(HYK.order.length-later.length)+' defs placed')+(later.length?'; waiting on the bridge graph: '+later.join(' '):'')});}
 {const full=HOSTS.filter(h=>h.full);R.push({name:'three-full-height-towers',ok:full.length>=3&&full.some(h=>/Pharos/.test(h.n)),detail:full.length+' full: '+full.map(h=>h.n+' '+Math.round(YS_HOST_TYPES[h.rec.type].H+h.rec.sink)+' m').concat(['the tallest stump '+Math.round(Math.max(...PLACE.hosts.filter(h=>!h.full).map(h=>h.cutY+h.sink)))+' m']).join(' | ')});}
 {const flat=PLACE.hosts.filter(h=>h.pods.length>1&&new Set(h.pods.map(p=>p.y)).size<2);const n=PLACE.hosts.map(h=>new Set(h.pods.map(p=>p.y)).size);
  R.push({name:'pods-on-several-plates',ok:!flat.length,detail:flat.length?flat.length+' hosts with one plate: '+flat.map(h=>h.n).join(' | '):PLACE.hosts.length+' hosts, '+Math.min(...n)+'–'+Math.max(...n)+' plates each'});}
 {const recs=PLACE.blds.concat(PLACE.slots);const boxes=recs.map(r=>r.box);const streets=PLACE.occ.filter(o=>/^(street|highway)/.test(o.tag));const bad=[];
  // the market hall stands over the junction of its three highways (the record says so: `over`)
  recs.forEach((r,i)=>{for(const s of streets)if(!(r.over&&r.over.test(s.tag))&&ysPlHit(boxes[i],s)){bad.push(boxes[i].tag+' on '+s.tag);break;}});
  const pairs=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)if(ysPlHit(boxes[i],boxes[j]))pairs.push(boxes[i].tag+' / '+boxes[j].tag);
  R.push({name:'nothing-on-a-street',ok:!bad.length,detail:bad.length?bad.length+': '+bad.slice(0,4).join(' | '):boxes.length+' footprints clear of '+streets.length+' street and highway boxes'});
  R.push({name:'footprints-clear-of-each-other',ok:!pairs.length,detail:pairs.length?pairs.length+': '+pairs.slice(0,4).join(' | '):boxes.length+' footprints, no two overlapping'});}
 {const nb=PLACE.blds.filter(r=>!r.drawn).length,nh=PLACE.hosts.filter(h=>!h.drawn).length,np=PLACE.hosts.reduce((s,h)=>s+h.pods.filter(p=>!p.drawn).length,0);
  R.push({name:'every-record-built',ok:!nb&&!nh&&!np,detail:(nb||nh||np)?nb+' buildings, '+nh+' hosts, '+np+' pods not built':PLACE.blds.length+' buildings, '+PLACE.hosts.length+' hosts, '+C.pods+' pods built'});}
 {const L=PLACE.hosts.filter(h=>h.land);R.push({name:'land-hosts',ok:L.length>0&&L.every(h=>h.drawn),detail:L.length+' reclaimed Ancients (decay 3) on the land quarter, '+L.filter(h=>h.drawn).length+' drawn, with '+L.reduce((s,h)=>s+h.pods.length,0)+' pods: '+L.map(h=>h.n).join(' | ')});}
 {const nd=SPANS.list.filter(s=>!s.drawn);const by={};for(const s of SPANS.list){const k=s.kind==='bridge'?(s.b.host?'host–host':'host–'+s.b.kind):s.kind;by[k]=(by[k]||0)+1;}
  R.push({name:'bridges-built',ok:!nd.length&&SPANS.list.length>0,detail:SPANS.list.length+' spans ('+Object.keys(by).map(k=>by[k]+' '+k).join(', ')+'), '+nd.length+' not built, '+SPANS.list.reduce((a,s)=>a+(s.piers||0),0)+' piers'});
  // every node of the bridge graph (the drowned hosts, the walled moles, the Citadel, the Winds, the Amphitriton) reaches the shore over it
  const lost=SPANS.refused.filter(r=>/no path/.test(r));R.push({name:'bridge-network-reaches-the-shore',ok:!lost.length,detail:lost.length?lost.length+' cut off: '+lost.join(' | '):SPANS.nodes.length+' nodes, all with a foot path to the shore; '+SPANS.list.filter(s=>s.kind==='bridge'&&s.b.kind==='shore').length+' towers bridged straight to it'});}
 {const T=PLACE.hosts.filter(h=>h.land&&h.tall);R.push({name:'two-skyscraper-stumps-on-land',ok:T.length>=2&&T.every(h=>h.pods.length>0&&h.drawn),detail:T.map(h=>h.n+' '+Math.round(h.top)+' m, '+h.pods.length+' pods').join(' | ')||'none'});}
 {const lanes=LAYOUT.streets.filter(s=>s.kind==='lane').length,laned=PLACE.blds.filter(b=>b.why==='lane').length;R.push({name:'lanes-lined',ok:lanes>0&&laned>lanes*2,detail:lanes+' lanes, '+laned+' buildings on them, '+(window._roads||0)+' road ribbons'});}
 return R;}
{const _x=window._api.extra;window._api.extra=()=>_x().concat(ysCityChecks());}
