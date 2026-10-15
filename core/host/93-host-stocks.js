// ================================================================= CORE HOST — what things hold, and the settlement's stocks
// [web] core/host/93-host-stocks.js (ROADMAP.md section 10, the owner's 2026-10-14 addition: "what things hold, and the
// settlement's stocks"; the owner, 2026-10-15: Voth's new interface is the standard). Ported from Voth's city plan
// (settlements/voth/targets/voth-city/56e-vc-stocks-host.js, and 56d-vc-inspect-host.js's VC.thingsHTML for a citizen),
// generalised: every number is read from what the build hands in as o.holds, which core/simulation fills
// (KHOST.simHolds(SIM), from 77-sim-7-stocks.js: SIM.contents, SIM.stocks, SIM.holders, SIM.placeAt, SIM.whereIs). The
// host never reads a build's globals; a build without o.holds has no stocks view and an inspector without contents.
//
//   o.holds = {
//     contents(id)          SIM.contents's shape: {id, type: 'place' | 'actor' | 'group', name, items: [{item, n, state, as,
//                           wear?, life?, workLife?, slot?}], store?, makes?, inputs?, household?, mess?, sells?, shelf?, ...}
//     stocks()              SIM.stocks's: {minute, order, by: {item: row}, day, today, households, rule} or null
//     holders(item, top)    SIM.holders's: {item, count, total, list: [{id, type, name, state, n, as}]}
//     whereIs(id)           {x, y, z}: a holder's position (fly there)
//     placeAt?(x, z, r)     the nearest place holding something there (the ground of an outdoor site)
//     idOf?(rec, hit)       the holder ids a picked record is (a lot's places): default its key, else its id, if it holds
//     containerOf?(rec)     the place a container piece is part of (the simulation keeps stock by place, not by piece)
//     card?(id)             a holder's own card (a citizen's: the build's), else its contents
//     itemName?(k), placeName?(id), minute?(), paused?(), summary?()   words and the clock
//   }
//   KHOST.simHolds(SIM, extra) -> an o.holds over core/simulation (extra: idOf, containerOf, card, placeName, paused ...)
//   KHOST.stocks.toggle(on), .refresh(), .go(id)      O, or "stocks (o)" in the bar
//   KHOST.holdsFor(rec, hit)                          the inspector's second half (93-host-inspect.js calls it)
// The panel reads itself when opened and every 4 s of real time while the simulated minute moves (never per frame);
// paused, only by "refresh". It keeps nothing beyond the page.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;

// ---------------------------------------------------------------- core/simulation as an o.holds
K.simHolds=function(SIM,extra){extra=extra||{};
 const I=()=>SIM.ITEMS;
 return Object.assign({
  contents:id=>SIM.contents?SIM.contents(id):null,
  stocks:()=>SIM.stocks?SIM.stocks():null,
  holders:(item,top)=>SIM.holders?SIM.holders(item,top):null,
  whereIs:id=>SIM.whereIs?SIM.whereIs(id):null,
  placeAt:(x,z,r)=>SIM.placeAt?SIM.placeAt(x,z,r):null,
  itemName:k=>{const it=I(),Kd=it&&it.kinds&&it.kinds[k];return(Kd&&Kd.name)||String(k).replace(/_/g,' ');},
  placeName:id=>{if(id==null)return'-';const P=SIM.R&&SIM.R.place[id];if(!P)return String(id);const n=P.name||P.kind;return n+(P.kind&&P.kind!==n?' <span class="k">('+P.kind+')</span>':'');},
  minute:()=>SIM.minute?SIM.minute():null,
  lowDays:()=>I()&&I().low,
  summary:()=>{const E=SIM.ECON;return E?'the economy: '+E.warehouses.length+' warehouses and granaries, '+E.sites.length+' sites, '+E.carts.length+' carts, '+E.inflight.length+' imports on the way':'the economy is off: nothing is made, hauled or stored';},
  idOf:(rec,hit)=>{if(!rec)return[];const ids=[rec.key,rec.id].filter(id=>id!=null&&SIM.R&&(SIM.R.place[id]||SIM.R.actor[id]));return ids.slice(0,1);},
 },extra);};

K.onTake(function stocksTake(H){
 const o=H.o,HO=o.holds;if(!HO||!HO.contents)return;
 const THREE=o.THREE||root.THREE,C=K.cam,$=id=>doc.getElementById(id);
 // ---------------------------------------------------------------- the words (Voth's 56e)
 const itemName=k=>HO.itemName?HO.itemName(k):String(k).replace(/_/g,' '),placeName=id=>HO.placeName?HO.placeName(id):String(id);
 const fmt=v=>{if(v==null||!isFinite(v))return'-';const a=Math.abs(v);return a>=100||v===Math.round(v)?Math.round(v).toLocaleString('en-GB'):v.toFixed(1);};
 const signed=v=>{if(v==null)return'-';if(!v)return'0';return'<span class="'+(v>0?'up':'dn')+'">'+(v>0?'+':'&minus;')+fmt(Math.abs(v))+'</span>';};
 const STATE={production:['#d9b24a','at the site'],transit:['#5aa6d9','in transit'],storage:['#9fd49a','in storage'],owned:['#c7a1e0','owned']};
 const chip=st=>{const S=STATE[st];return S?'<i style="display:inline-block;margin-right:4px;background:'+S[0]+';width:8px;height:8px"></i>':'';};
 const css=doc.createElement('style');css.id='khost-stocks-css';css.textContent=
  '#stocks{left:auto;right:14px;top:14px;width:min(700px,calc(100vw - 28px));max-height:calc(100vh - 40px);overflow:auto;display:none;z-index:32;background:rgba(18,20,24,0.97)}'+
  '#stocks table{width:100%;border-collapse:collapse;margin-top:6px;font-size:11.5px}'+
  '#stocks th{text-align:right;color:#e0c98a;font-weight:normal;padding:3px 4px;border-bottom:1px solid rgba(255,255,255,0.15);white-space:nowrap;vertical-align:bottom}'+
  '#stocks th.s{cursor:pointer;text-decoration:underline dotted}#stocks th:first-child,#stocks td:first-child{text-align:left}'+
  '#stocks td{text-align:right;padding:2px 4px;border-bottom:1px solid rgba(255,255,255,0.06);font-variant-numeric:tabular-nums;white-space:nowrap}'+
  '#stocks tr.it,#stocks tr.hd{cursor:pointer}#stocks tr.it:hover td,#stocks tr.hd:hover td{background:rgba(255,255,255,0.06)}#stocks tr.sel td{background:rgba(201,162,39,0.16)}'+
  '#stocks tr.cat td{color:#e0c98a;text-align:left;padding-top:8px;letter-spacing:.05em;text-transform:uppercase;font-size:10.5px}'+
  '#stocks td.det{text-align:left;white-space:normal;background:rgba(0,0,0,0.22);padding:6px 8px;line-height:1.5}#stocks td.det table{margin-top:2px}'+
  '#stocks .lg,#insp-holds .lg{opacity:.78;font-size:11px;margin-top:4px}#stocks .k,#insp-holds .k{opacity:.7}'+
  '.low{color:#e8c25a}.out{color:#ff9a7a}.up{color:#9fd49a}.dn{color:#ff9a7a}'+
  '#insp-holds{font:11.5px/1.45 ui-monospace,Menlo,monospace;color:#e8dcc0;margin-top:4px}#insp-holds table.ct{border-collapse:collapse;margin:2px 0}#insp-holds table.ct td{padding:0 8px 0 0;vertical-align:top}'+
  '#insp-holds .sec{color:#e0c98a;margin-top:5px;font-size:11px;letter-spacing:.05em;text-transform:uppercase}';
 doc.head.appendChild(css);
 const itemsTable=items=>'<table class="ct">'+items.map(e=>'<tr><td>'+chip(e.state)+itemName(e.item)+'</td><td style="text-align:right">'+fmt(e.n)+'</td><td class="k">'+e.as+(e.wear!=null?', '+Math.round(e.wear*100)+'% worn':'')+'</td></tr>').join('')+'</table>';
 // a citizen's things (Voth's 56d VC.thingsHTML, from the contents)
 function thingsHTML(Cn){const by=as=>Cn.items.filter(e=>e.as===as);let h='<div class="sec">things</div>';
  const worn=by('worn').map(e=>itemName(e.item)+' <span class="k">'+(e.slot||'')+', '+Math.round(e.wear*100)+'% worn'+(e.life?' of '+e.life+' days':'')+'</span>');
  h+=worn.length?'wears '+worn.join(' &middot; '):'<span class="k">wears nothing the items count</span>';
  by('tool').forEach(e=>{h+='<br>tool '+itemName(e.item)+' <span class="k">'+Math.round(e.wear*100)+'% worn'+(e.workLife?' of '+e.workLife+' worked hours':'')+'</span>';});
  if(Cn.toolRack)h+='<br>tools drawn at work';
  if(Cn.toolNeed)h+='<br><span class="out">tool broken: needs a '+itemName(Cn.toolNeed)+'</span>';
  const home=by('kept at home');if(home.length)h+='<br>at home: '+home.map(e=>itemName(e.item)+(e.n>1?' &times;'+e.n:'')).join(', ');
  Cn.items.forEach(e=>{if(e.state==='transit')h+='<br>carrying '+fmt(e.n)+' '+itemName(e.item)+' <span class="k">(in transit)</span>';});
  if(Cn.issued)h+='<br><span class="k">issued: the keeper replaces what wears out</span>';
  const Hh=Cn.household;
  if(Hh&&Hh.mess)h+='<br>the household eats at its mess';
  else if(Hh)h+='<br>household food: '+(Hh.items&&Hh.items.length?Hh.items.map(e=>itemName(e.item)+' '+Math.floor(e.n)).join(', '):'none')+' <span class="k">('+(Hh.people||1)+' people, '+(Hh.days!=null?Hh.days.toFixed(1):'-')+' days)</span>';
  if(Cn.group&&Cn.group.items&&Cn.group.items.length)h+='<br>its '+Cn.group.kind+' carries '+Cn.group.items.map(e=>fmt(e.n)+' '+itemName(e.item)+' <span class="k">('+e.as+')</span>').join(', ');
  return h;}
 // a place's or a group's (Voth's 56e VC.contentsHTML)
 function contentsHTML(id,title){const Cn=HO.contents(id);if(!Cn)return'';
  if(Cn.type==='actor')return thingsHTML(Cn);
  let h='<div class="sec">'+(title||'holds')+'</div>';
  if(Cn.type==='place'){
   if(Cn.makes)h+='makes '+Cn.makes.map(g=>{const inp=Cn.inputs&&Cn.inputs[g];return itemName(g)+(inp?' <span class="k">(from '+Object.keys(inp).map(k=>inp[k]+' '+itemName(k)).join(', ')+')</span>':'');}).join(', ')+'<br>';
   if(Cn.store)h+='<span class="k">'+({production:'its store (made, not yet hauled)',transit:'its landing store (for the carts)',storage:'the settlement\'s store'}[Cn.store.state]||'its store')+': '+fmt(Cn.store.held)+(Cn.store.cap?' of '+fmt(Cn.store.cap):'')+(Cn.carts&&Cn.carts.length?' &middot; '+Cn.carts.length+' cart'+(Cn.carts.length===1?'':'s')+' bound here':'')+'</span>';
   const stock=Cn.items.filter(e=>e.as!=='household food');
   if(stock.length)h+=itemsTable(stock);else if(Cn.store)h+=' <span class="k">&middot; empty</span>';
   if(Cn.household){const hf=Cn.items.filter(e=>e.as==='household food');
    h+=(Cn.store?'<br>':'')+'household food: '+(hf.length?hf.map(e=>itemName(e.item)+' '+fmt(e.n)).join(', '):'<span class="out">none</span>')+
     ' <span class="k">('+Cn.household.people+' people, '+fmt(Cn.household.days)+' days'+(Cn.household.days!=null&&Cn.household.days<Cn.household.low?': low, someone goes to buy':'')+')</span>';}
   if(Cn.mess)h+='<br>its residents eat at a mess <span class="k">(no food store of their own: fed from the warehouses)</span>';
   if(Cn.sells)h+='<br>sells '+Cn.sells.map(itemName).join(', ')+' <span class="k">('+(Cn.shelf==='warehouses'?'no shelf of its own: it sells from the settlement\'s warehouses':'abstract stock')+')</span>';
   if(!Cn.items.length&&!Cn.store&&!Cn.household&&!Cn.mess&&!Cn.sells)h+='<span class="k">holds nothing the simulation counts</span>';}
  else if(Cn.type==='group')h+=Cn.members+' people &middot; '+Cn.kind+(Cn.items.length?itemsTable(Cn.items):' <span class="k">&middot; carries nothing</span>');
  return h;}
 const cardHTML=id=>HO.card?HO.card(id)||'':'<b>'+placeName(id)+'</b> <span class="k">'+id+'</span>'+contentsHTML(id);
 // ---------------------------------------------------------------- the inspector's second half
 const insp=$('insp'),box=doc.createElement('div');box.id='insp-holds';if(insp)insp.appendChild(box);
 let shown=null,shownAt=0;
 K.holdsFor=function(rec,hit){shown=null;box.innerHTML='';
  let h='';
  if(rec&&HO.containerOf){const pl=HO.containerOf(rec);if(pl&&HO.contents(pl)){h='<div class="k" style="margin-top:4px">a container: the simulation keeps stock by place, not by piece; this one is part of '+placeName(pl)+'</div>'+contentsHTML(pl,'its place holds');shown={ids:[pl],container:true};}}
  if(!h&&(rec||hit)&&HO.idOf){const ids=(HO.idOf(rec,hit)||[]).filter(id=>HO.contents(id));h=ids.map(p=>contentsHTML(p,ids.length>1?'holds: '+placeName(p):'holds')).join('');if(ids.length)shown={ids};}
  if(!h&&hit&&HO.placeAt){const g=HO.placeAt(hit.point.x,hit.point.z,12);if(g){h='<div class="sec">'+placeName(g)+'</div>'+contentsHTML(g,'holds');shown={ids:[g]};}}
  box.innerHTML=h;shownAt=performance.now();return h;};
 // ---------------------------------------------------------------- the stocks panel (Voth's 56e)
 const P=K.panel('stocks','Stocks');
 P.insertAdjacentHTML('beforeend','<b>Stocks</b> <span id="stk-when" class="k"></span> <button id="stk-close" style="float:right" title="close (o)">&#10005;</button>'+
  '<button id="stk-refresh" style="float:right" title="read the stocks now (the panel reads itself every few seconds while the clock runs; paused, only here)">refresh</button>'+
  '<br><button data-f="all">all</button><button data-f="goods">goods</button><button data-f="owned">owned things</button>'+
  '<div class="k" style="margin-top:4px">At the site: made, not yet hauled (a producer\'s own store). In transit: a cart\'s or a carrier\'s load on the map, and a lot landed for the carts. '+
  'In storage: the warehouses and granaries, and the households\' food stores. Owned: what the people wear, keep at home and work with. The change is the total at one midnight against the one before '+
  '(the simulation\'s daily snapshot); used up = drawn from the stores, less what went into households\' stores, plus what was eaten from them (an item: worn out and broken). '+
  '<span class="low">Low</span>: fewer days of cover than the economy\'s import threshold. <span class="out">Out</span>: a draw or a purchase went unmet. Click an item for its flows and holders.</div><div id="stk-body"></div>');
 const S=K.stocks={on:false,sort:'total',dir:-1,show:'all',open:null,minute:null,at:0,data:null,hold:null,pin:null,ms:0};
 const CATS=[['food','food'],['good','materials and goods'],['owned','owned things']],catOf=r=>r.cat==='food'?'food':r.good?'good':'owned';
 const hmDay=m=>{const mm=((Math.floor(m)%1440)+1440)%1440;return('0'+Math.floor(mm/60)).slice(-2)+':'+('0'+(mm%60)).slice(-2)+' day '+(Math.floor(m/1440)+1);};
 const spanText=s=>!s?'':hmDay(s.from)+' to '+hmDay(s.to)+(s.partial?' <span class="k">(a partial day: the first snapshot was taken mid-day)</span>':'')+(s.jumped?' <span class="out">(the clock jumped in between: hours skipped)</span>':'');
 function flowsHTML(f,r){if(!f)return'<span class="k">none yet</span>';const p=[];
  if(r.good){p.push('made '+fmt(f.made),'imported '+fmt(f.imported),'exported '+fmt(f.exported),'drawn from the stores '+fmt(f.used));if(f.stocked!=null)p.push('of it into households\' stores '+fmt(f.stocked),'eaten at home '+fmt(f.eaten));}
  else{p.push('bought '+fmt(f.bought),'issued '+fmt(f.issued),'worn out '+fmt(f.worn),'broken '+fmt(f.broken));if(f.eaten!=null)p.push('eaten '+fmt(f.eaten));}
  p.push('<b>used up '+fmt(f.consumed)+'</b>','change '+signed(f.change));if(f.unmet)p.push('<span class="out">unmet '+fmt(f.unmet)+'</span>');return p.join(' &middot; ');}
 const paused=()=>HO.paused?!!HO.paused():(H.clock&&H.clock.scale===0);
 S.refresh=function(){if(!S.on)return;const t0=performance.now();S.data=HO.stocks();S.hold=S.open&&S.data&&HO.holders?HO.holders(S.open,12):null;
  S.ms=Math.round(performance.now()-t0);S.minute=HO.minute?HO.minute():null;S.at=performance.now();draw();};
 function detail(r,D){let h='<b>'+itemName(r.item)+'</b> <span class="k">'+(r.good?'a good'+(r.cat==='food'?', a food':''):'an item ('+r.cat+')')+(r.madeOf?', bought for '+itemName(r.madeOf):'')+'</span>';
  if(r.good)h+='<br>use a day '+fmt(r.use)+' &middot; days of cover '+(r.days!=null?fmt(r.days):'-')+(D.rule&&D.rule.lowDays!=null?' <span class="k">(low under '+D.rule.lowDays+')</span>':'');
  if(r.ordered)h+='<br>ordered by timer, not yet landed: '+fmt(r.ordered);
  if(r.wanting)h+='<br>'+fmt(r.wanting)+' short of it now (a kept set short, a tool broken)';
  h+='<br>the last day: '+flowsHTML(r.day,r)+'<br>today so far: '+flowsHTML(r.today,r);
  const Hd=S.hold;
  if(Hd&&Hd.item===r.item){h+='<br><span class="k">held by '+fmt(Hd.count)+(Hd.count>Hd.list.length?', the '+Hd.list.length+' holding most':'')+' (click one to fly there and inspect it):</span><table>';
   Hd.list.forEach(x=>{h+='<tr class="hd" data-id="'+x.id+'"><td>'+chip(x.state)+x.name+' <span class="k">'+x.id+'</span></td><td class="k" style="text-align:left">'+x.as+'</td><td>'+fmt(x.n)+'</td></tr>';});
   h+='</table>';if(!Hd.list.length)h+='<span class="k">nobody holds any</span>';}
  return h;}
 function draw(){const D=S.data,body=$('stk-body');if(!body)return;
  if(!D){body.innerHTML='<div class="k">This world has neither the economy nor the items on: nothing is stocked.</div>';return;}
  const useDay=!!D.day;$('stk-when').textContent='read at '+hmDay(D.minute)+' ('+S.ms+' ms)'+(paused()?' · paused':'');
  const rows=D.order.map(k=>D.by[k]).filter(r=>S.show==='all'||(S.show==='goods'?r.good:!r.good));
  const chg=r=>{const f=useDay?r.day:r.today;return f?f.change:0;},key=S.sort==='name'?r=>itemName(r.item):S.sort==='change'?chg:r=>r.total;
  rows.sort((p,q)=>{const a=key(p),b=key(q);return(a<b?-1:a>b?1:0)*S.dir||(p.item<q.item?-1:1);});
  const arrow=s=>S.sort===s?(S.dir<0?' &#9660;':' &#9650;'):'';
  let h='<table><tr><th class="s" data-s="name">item'+arrow('name')+'</th><th class="s" data-s="total">total'+arrow('total')+'</th>'+
   ['production','transit','storage','owned'].map(st=>'<th>'+chip(st)+STATE[st][1]+'</th>').join('')+
   '<th class="s" data-s="change" title="'+(useDay?'the last day, midnight to midnight':'since the last snapshot: no whole day yet')+'">'+(useDay?'change / day':'change today')+arrow('change')+'</th><th title="days of cover: the warehoused stock over its use a day">days</th><th></th></tr>';
  CATS.forEach(c=>{const rs=rows.filter(r=>catOf(r)===c[0]);if(!rs.length)return;
   h+='<tr class="cat"><td colspan="9">'+c[1]+'</td></tr>';
   rs.forEach(r=>{const f=useDay?r.day:r.today,z=v=>v?fmt(v):'<span class="k">&middot;</span>';
    const mark=(r.out?'<span class="out" title="a draw or a purchase went unmet">out</span> ':'')+(r.low?'<span class="low" title="fewer days of cover than the import threshold">low</span> ':'')+(r.wanting?'<span class="k">'+fmt(r.wanting)+' want</span>':'');
    h+='<tr class="it'+(S.open===r.item?' sel':'')+'" data-k="'+r.item+'"><td'+(r.out?' class="out"':r.low?' class="low"':'')+'>'+itemName(r.item)+'</td><td>'+fmt(r.total)+(r.ordered?'<span class="k" title="an import sent for by timer, not landed: not counted"> +'+fmt(r.ordered)+'</span>':'')+'</td>'+
     '<td>'+z(r.production)+'</td><td>'+z(r.transit)+'</td><td>'+z(r.storage)+'</td><td>'+z(r.owned)+'</td><td>'+(f?signed(f.change):'-')+'</td><td>'+(r.days!=null?fmt(r.days):'')+'</td><td style="text-align:left">'+mark+'</td></tr>';
    if(S.open===r.item)h+='<tr><td class="det" colspan="9">'+detail(r,D)+'</td></tr>';});});
  h+='</table>';const Hh=D.households;
  h+='<div class="lg">'+(D.day?'the last day: '+spanText(D.day):'no whole day yet: the change is since '+spanText(D.today))+
   (Hh&&Hh.n?'<br>households: '+fmt(Hh.n)+' with a food store, '+fmt(Hh.low)+' low'+(HO.lowDays&&HO.lowDays()!=null?' (under '+HO.lowDays()+' days: one of them goes to buy)':'')+', '+fmt(Hh.empty)+' empty':'')+
   (HO.summary?'<br>'+HO.summary():'')+'</div>';
  body.innerHTML=h;
  [].forEach.call(body.querySelectorAll('th.s'),th=>{th.onclick=()=>{const s=th.dataset.s;if(S.sort===s)S.dir=-S.dir;else{S.sort=s;S.dir=s==='name'?1:-1;}draw();};});
  [].forEach.call(body.querySelectorAll('tr.it'),tr=>{tr.onclick=()=>{const k=tr.dataset.k;S.open=S.open===k?null:k;S.hold=S.open&&HO.holders?HO.holders(S.open,12):null;draw();};});
  [].forEach.call(body.querySelectorAll('tr.hd'),tr=>{tr.onclick=e=>{e.stopPropagation();S.go(tr.dataset.id);};});}
 // a holder: fly there and open it in the inspector, kept current while it is shown, a marker over it
 S.go=function(id){const p=HO.whereIs&&HO.whereIs(id);if(!p)return false;const Cn=HO.contents(id),actor=Cn&&(Cn.type==='actor'||Cn.type==='group');
  if(C.ctl.walk)C.walk(false,true);C.ctl.target.set(p.x,p.y||0,p.z);C.ctl.radius=actor?30:80;C.ctl.phi=Math.PI/2-.7;
  if(K.inspectRecord)K.inspectRecord(null);
  const insp=$('insp');if(insp&&insp.classList.contains('min')){insp.classList.remove('min');if(insp._paint)insp._paint();}
  K.inspector(Cn?(Cn.name||id)+'  '+id:id);S.pin=id;box.innerHTML=cardHTML(id);shown={ids:[id],pin:true};shownAt=performance.now();return true;};
 S.toggle=function(on){S.on=on==null?!S.on:!!on;P.style.display=S.on?'block':'none';tb.classList.toggle('on',S.on);if(S.on){P.classList.remove('min');if(P._paint)P._paint();S.refresh();}return S.on;};
 $('stk-close').onclick=()=>S.toggle(false);$('stk-refresh').onclick=()=>S.refresh();
 const fb=[].slice.call(P.querySelectorAll('button[data-f]')),paintF=()=>fb.forEach(b=>b.classList.toggle('on',S.show===b.dataset.f));
 fb.forEach(b=>{b.onclick=()=>{S.show=b.dataset.f;paintF();draw();};});paintF();
 const ui=K.ui,tb=doc.createElement('button');tb.textContent='stocks (o)';tb.id='ly-stocks';tb.title='every good and item, its total and where it is';tb.onclick=()=>S.toggle();if(ui)ui.appendChild(tb);
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 root.addEventListener('keydown',e=>{if(typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;if((e.key==='o'||e.key==='O')&&!(o.keys&&o.keys.o)){S.toggle();e.preventDefault();}});
 // the slow tick: every 4 s of real time while open, when the simulated minute has moved (not while paused)
 setInterval(()=>{if(!S.on||paused())return;const m=HO.minute?HO.minute():null;if(m!==S.minute&&performance.now()-S.at>4000)S.refresh();},1000);
 // what the inspector shows of a holder: kept current each second while the clock runs; a marker over a pinned one
 const mk=new THREE.Mesh(new THREE.ConeGeometry(1.2,2.6,4).rotateX(Math.PI),new THREE.MeshBasicMaterial({color:0x5aa6d9,depthTest:false,transparent:true,opacity:.9}));
 mk.renderOrder=60;mk.visible=false;mk.userData.probeSkip=true;mk.userData.khost='stocks';mk.frustumCulled=false;H.scene.add(mk);
 K.on(function holdsTick(){const pin=shown&&shown.pin?S.pin:null,p=pin&&HO.whereIs?HO.whereIs(pin):null;
  if(p){mk.position.set(p.x,(p.y||0)+9,p.z);mk.visible=true;}else mk.visible=false;
  if(!shown||paused())return;const now=performance.now();if(now-shownAt<1000)return;shownAt=now;
  box.innerHTML=shown.pin?cardHTML(shown.ids[0]):shown.container?'<div class="k" style="margin-top:4px">a container: this one is part of '+placeName(shown.ids[0])+'</div>'+contentsHTML(shown.ids[0],'its place holds'):shown.ids.map(p2=>contentsHTML(p2,shown.ids.length>1?'holds: '+placeName(p2):'holds')).join('');},'after');
});
})(typeof window!=='undefined'?window:globalThis);
