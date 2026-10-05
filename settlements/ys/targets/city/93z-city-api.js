// ================================================================= YS CITY — the placement's probe: _api.city.place() and the city's invariants
// PLAN.md §4 and P3 step 5: the kit audit (every HYK.def placed at least once; the zero list printed), at least three
// full-height towers, a host's pods on more than one plate, nothing on a street and nothing on anything else, every
// record built, and the land quarter's reclaimed Ancients counted (records; drawn once their types are vendored).
window._api.city.place=()=>ysPlaceCensus();
window._api.city.records=()=>({blds:PLACE.blds.map(r=>({key:r.key,x:+r.x.toFixed(2),z:+r.z.toFixed(2),ry:+r.ry.toFixed(4),y:+r.y.toFixed(2),v:r.v,why:r.why,block:r.block})),
 hosts:PLACE.hosts.map(h=>({n:h.n,block:h.block,type:h.type,x:h.x,z:h.z,ry:h.ry,sink:h.sink,d:h.d,cutY:h.cutY,full:h.full,top:h.top,plates:h.plates,pods:h.pods,ways:h.ways})),
 slots:PLACE.slots.map(s=>{const o=Object.assign({},s);delete o.box;return o;}),moles:PLACE.moles.map(m=>({name:m.name,y:m.y,poly:m.poly}))});
// the spans wait on the bridge graph (PLAN.md P3 step 3): the audit names them apart
const YS_PL_LATER=['hyk_span_l1','hyk_span_l2','hyk_drawbridge','hyk_spiral_stair','hyk_ladder','hyk_lilypad','hyk_walkway','hyk_pontoon'];
function ysCityChecks(){const R=[];const C=ysPlaceCensus();
 {const zero=C.zero.filter(k=>YS_PL_LATER.indexOf(k)<0),later=C.zero.filter(k=>YS_PL_LATER.indexOf(k)>=0);
  R.push({name:'kit-audit-every-def-placed',ok:!zero.length,detail:(zero.length?zero.length+' never placed: '+zero.join(' '):(HYK.order.length-later.length)+' defs placed')+(later.length?'; waiting on the bridge graph: '+later.join(' '):'')});}
 {const full=HOSTS.filter(h=>h.full);R.push({name:'three-full-height-towers',ok:full.length>=3&&full.some(h=>/Pharos/.test(h.n)),detail:full.length+' full: '+full.map(h=>h.n+' '+Math.round(YS_HOST_TYPES[h.rec.type].H+h.rec.sink)+' m')+'; the tallest stump '+Math.round(Math.max(...PLACE.hosts.filter(h=>!h.full).map(h=>h.cutY+h.sink)))+' m'.join(' | ')});}
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
 return R;}
{const _x=window._api.extra;window._api.extra=()=>_x().concat(ysCityChecks());}
