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
BUDGET.type.roads='env';BUDGET.type['mole quay']='env';BUDGET.type['karst cards']='env';BUDGET.type.river='env';   // the city's own ground work: the road ribbons, the moles' plates and quay walls
BUDGET.type.biome='biome';BUDGET.cls.biome=4500000;   // the biome's passes (89-city-biome charges 'biome/trees', 'biome/floor', 'biome/dress'...): each under 4.5 M
window._api.biome=()=>window._biome;
// the foreign quarter (88c-city-foreign): one class for the three cultures' buildings, budgeted per building (t.n counts them)
for(const c of ['iziz','republic','voth','historians'])BUDGET.type['foreign:'+c]='foreign';BUDGET.cls.foreign=160000;
window._api.city.foreign=()=>window._foreign;
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
  const pairs=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){if(recs[i].standIn===recs[j]||recs[j].standIn===recs[i])continue;   /* a foreign slot's stand-in stands inside its slot */if(ysPlHit(boxes[i],boxes[j]))pairs.push(boxes[i].tag+' / '+boxes[j].tag);}
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
 R.push({name:'harbour-piers',ok:(PLACE.piers||0)>=24,detail:(PLACE.piers||0)+' piers in the harbour (the moles\' every 26 m where a 40 m square off the head is clear, the shore runs)'});
 // Travis (Oct 5 2026) batch 4: the inner quarter as dense as the coast's neighbourhoods, the stumps and the sunk offices
 // at his points, the Wet Cells at the Needle's foot
 {const P1=[[-52.3,-445.6],[-178.0,378.3],[166.1,647.4],[466.6,-328.8]],P2=[[941.5,-1087.0],[538.5,-1127.2],[355.5,-348.0],[563.6,-309.0]];
  const inP=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  const cnt=P=>PLACE.blds.filter(r=>inP(P,r.x,r.z)).length+PLACE.slots.filter(s=>s.fill&&inP(P,s.x,s.z)).length;   /* a filled foreign slot is a building (88c) */
  const n1=cnt(P1),n2=cnt(P2);R.push({name:'inner-quarter-density',ok:n1>=n2,detail:n1+' buildings inside the inner quarter against '+n2+' in the coast quarter'});
  const pt=PLACE.hosts.filter(h=>/Trays stump at the head|Lens stump by the river|sunk Terrace Wedge/.test(h.n));R.push({name:'point-hosts',ok:pt.length===4&&pt.every(h=>h.drawn&&h.pods.length>0),detail:pt.map(h=>h.n+' ('+Math.round(h.x)+','+Math.round(h.z)+') '+h.pods.length+' pods'+(SPANS.list.some(e=>e.na===h.n||e.nb===h.n)?', bridged':h.land?'':', unbridged')).join(' | ')||'none'});
  const wc=PLACE.blds.find(r=>r.key==='hyk_wet_cells');const nd=CITY.STACKS.find(s=>/Needle/.test(s.n));R.push({name:'wet-cells-at-the-needle',ok:!!(wc&&nd&&Math.hypot(wc.x-nd.x,wc.z-nd.z)<nd.r+30&&wc.sink>2),detail:wc?'at ('+Math.round(wc.x)+','+Math.round(wc.z)+'), rock '+wc.sink.toFixed(1)+' m to the bed':'not placed'});}
 {const sh=PLACE.hosts.filter(h=>/strip ring/.test(h.n)||(h.block&&/^9\d,0$|^1\d\d,0$/.test(h.block)&&!/Trays|Lens stump|sunk Terrace/.test(h.n)));R.push({name:'strip-hosts',ok:(PLACE.strip||0)>=6&&sh.every(h=>h.drawn&&h.pods.length>0),detail:(PLACE.strip||0)+' small reclaimed Ancients on the strip east of the inner quarter: '+sh.map(h=>h.type).join(', ')});}
 {const RU=PLACE.ruins||[];R.push({name:'ruins-in-the-east-shallows',ok:RU.length>=3&&RU.every(r=>r.drawn&&r.sink<-6),detail:RU.length?RU.map(r=>r.name+' ('+Math.round(r.x)+','+Math.round(r.z)+') bed '+r.sink.toFixed(1)+' m, '+r.h+' m tall').join(' | '):'none placed'});}
 R.push({name:'half-sunk-band',ok:(PLACE.band||0)>=3,detail:(PLACE.band||0)+' half-sunk mid-rise hosts in the band north-east of the head, '+PLACE.hosts.filter(h=>/half-sunk/.test(h.n)).reduce((s,h)=>s+h.pods.length,0)+' pods'});
 {const lanes=LAYOUT.streets.filter(s=>s.kind==='lane').length,laned=PLACE.blds.filter(b=>b.why==='lane').length;R.push({name:'lanes-lined',ok:lanes>0&&laned>lanes*2,detail:lanes+' lanes, '+laned+' buildings on them, '+(window._roads||0)+' road ribbons'});}
 // the foreign quarter (88c-city-foreign.js): at least 100 slots filled with a foreign building, each inside its slot's box
 // and clear of every street, the three cultures all standing; the embassy and the chapterhouse named
 {const F=window._foreign||{};const fills=PLACE.slots.filter(s=>s.fill);const streets=PLACE.occ.filter(o=>/^(street|highway)/.test(o.tag));const bad=[];let out=0,onSt=0,nd=0;
  const inside=(B,S)=>{for(const [a,c] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const px=B.cx+B.ux[0]*a*B.hw+B.uz[0]*c*B.hd,pz=B.cz+B.ux[1]*a*B.hw+B.uz[1]*c*B.hd;const dx=px-S.cx,dz=pz-S.cz;
   if(Math.abs(dx*S.ux[0]+dz*S.ux[1])>S.hw+.01||Math.abs(dx*S.uz[0]+dz*S.uz[1])>S.hd+.01)return false;}return true;};
  for(const s of fills){const f=s.fill;if(!f.drawn)nd++;if(!inside(f.box,s.box)){out++;if(bad.length<4)bad.push(f.key+' outside its slot');}
   for(const st of streets)if(ysPlHit(f.box,st)){onSt++;if(bad.length<4)bad.push(f.key+' on '+st.tag);break;}}
  const comp=[F.embassy,F.chapterhouse].filter(Boolean);for(const c of comp){const B=(c===F.embassy?YS_FQ.embassy:YS_FQ.chapterhouse).box;for(const st of streets)if(ysPlHit(B,st)){onSt++;if(bad.length<4)bad.push('compound on '+st.tag);break;}}
  const by=F.byCulture||{};const cultures=['iziz','republic','voth'].filter(c=>fills.some(s=>s.fill.culture===c&&s.fill.drawn));
  R.push({name:'foreign-quarter-built',ok:fills.length>=100&&!out&&!onSt&&!nd&&cultures.length===3&&!!(F.embassy&&F.embassy.drawn),
   detail:fills.length+' of '+PLACE.slots.filter(s=>s.kind==='foreign'||s.kind==='chapterhouse').length+' slots filled ('+Object.keys(by).map(c=>by[c]+' '+c).join(', ')+'), '+(F.kept||0)+' stand-ins kept, '+(F.dropped||0)+' dropped'
    +(bad.length?'; '+(out+onSt)+' bad: '+bad.join(' | '):'; every one inside its slot and off the streets')+(nd?'; '+nd+' not drawn':'')
    +'; embassy '+(F.embassy?(F.embassy.drawn?'at '+F.embassy.x+','+F.embassy.z+' (block '+F.embassy.block+', '+F.embassy.cleared+' lane houses cleared)':'not drawn'):'NOT PLACED')
    +'; chapterhouse '+(F.chapterhouse?(F.chapterhouse.drawn?'at '+F.chapterhouse.x+','+F.chapterhouse.z+(F.chapterhouse.onSquare?' on its square':' in block '+F.chapterhouse.block):'not drawn'):'NOT PLACED')
    +'; '+(F.doors||0)+' door marks; merge '+(F.merge?F.merge.instances+' instances into '+F.merge.meshes+' meshes':'none')});}
 // the biome (89-city-biome.js, BIOME-API.md): bound and rooted where the mask allows; the biome's own invariants
 if(typeof NWBAY!=='undefined'&&NWBAY.TREES){const T=NWBAY.TREES,SP=NWBAY.SPECIES,B=window._biome||{};
  const wetSp=t=>/mangrove|pandan|pipereed/.test(SP[t.sp].key);   /* the semi-aquatic fringe stands in the shallows past the mask by design */
  let onWater=0,onStreet=0,inBld=0,onMole=0;const first=[];
  for(const t of T){if(!wetSp(t)&&terrainH(t.x,t.z)<.3){onWater++;if(first.length<4)first.push(SP[t.sp].key+' in the water at '+Math.round(t.x)+','+Math.round(t.z));continue;}
   const c=ysPlClash(ysPlBox(t.x,t.z,.3,.3,0,'bio'));if(c){if(/^(street|highway)/.test(c.tag))onStreet++;else inBld++;if(first.length<4)first.push(SP[t.sp].key+' on '+c.tag);continue;}
   for(const m of PLACE.moles)if(t.x>=m.x0&&t.x<=m.x1&&t.z>=m.z0&&t.z<=m.z1&&ysPlInPoly(m.poly,t.x,t.z)){onMole++;if(first.length<4)first.push(SP[t.sp].key+' on '+m.name);break;}}
  const bad=onWater+onStreet+inBld+onMole;
  R.push({name:'biome-bound',ok:T.length>200&&!bad,detail:T.length+' trees ('+(B.heroes||0)+' heroes, '+(B.far||0)+' impostors, '+(B.karstTrees||0)+' on the karst tops), '+(B.floor||0)+' floor plants, '+(B.dress||0)+' hanging-garden items on '+(B.stacksDressed||0)+' stacks'
   +(bad?'; '+onWater+' in the water, '+onStreet+' on a street, '+inBld+' in a footprint, '+onMole+' on a mole: '+first.join(' | '):'; none in the water, on a street, in a footprint or on a mole')});
  let onFace=0;for(const t of T){const k=BIO.field('karst',t.x,t.z);if(k>.03&&k<.9)onFace++;}
  R.push({name:'nothing-on-a-cliff-face',ok:onFace===0,detail:onFace+' trees rooted where karst is between .03 and .9 (the rim band and the face)'});
  const figs=T.filter(t=>SP[t.sp].key==='clifffig'),onK=figs.filter(t=>BIO.field('karst',t.x,t.z)>.9).length;
  R.push({name:'figs-on-the-karst',ok:figs.length>0&&onK===figs.length,detail:figs.length+' cliff figs, '+onK+' on the karst, '+(B.figsOnEdge||0)+' at a rim with their roots down the face'});
  let tallest=0,tallSp='';for(const t of T)if(t.H>tallest){tallest=t.H;tallSp=SP[t.sp].key;}
  R.push({name:'height-ceiling',ok:tallest<=NWBAY.TEMPLE_H*1.01+.5,detail:'tallest tree '+tallest.toFixed(1)+' m ('+tallSp+') against a ceiling of '+NWBAY.TEMPLE_H+' m'});}
 return R;}
{const _x=window._api.extra;window._api.extra=()=>_x().concat(ysCityChecks());}
