// core/region/data/east-rift.js — EAST_RIFT [G data]: the Xanadu Sultanate and Longsong's valley as one economy (step X2 of
// core/simulation/PROPOSAL-XANADU.md; the owner, 2026-11-16). It joins two tunes read beside it, unchanged:
//   XAN_TUNE (core/region/data/xan-tune.js), the Sultanate, at its own scale (50 people an actor, its countrysides 200);
//   LS_TUNE (settlements/longsong/src/15-ls-tune.js), Longsong's valley, at 10 (each of its settlements carries `scale`).
// The join:
//   - Longsong's plan (openworld/oidong-highrift) is moved into the Sultanate's frame (openworld/xanadu-oidong-highrift) by
//     the offset between Longsong's two places;
//   - Longsong's calendar windows are prefixed `ls.` (its harvest at 2,000 m is not the lake's);
//   - Longsong's off-map "Xanadu market" goes: its caravan runs to Strongbow (the Order's road down the scarp, about 481 km,
//     19 days), where the Sultan's toll is cut from what it lands; Strongbow's market is supplied from behind with what the
//     caravan buys (salt, iron, tea, gold);
//   - the grant of fealty goes to the Sultan's citadel and the grants of esteem come from it;
//   - the Order's books, paper and lenses go on out through the Iziz gateway (the Order's chapterhouses, Keepwell at Talia);
//   - goods, factions and relations are merged (the Order friendly to all).
//   EAST_RIFT.valley(Pxan, Pls, o) -> the joined valley spec. o: {scale (the Sultanate's), lsScale (Longsong's, 10)}
var EAST_RIFT=(function(){'use strict';
const E={};
E.lsScale=10;
E.caravanDays=19;   /* Longsong to Strongbow, ~481 km at 25 km a day */
E.caravanKeep=20;   /* the days of its own use each end keeps before it sells to the caravan: LS_TUNE's 60 suited the off-map
                       market's pool, but Strongbow, which keeps a month of salt before sending it inland, never held 60 days
                       of it to spare (2026-11-16) */
E.order={books:.1,paper:3,lenses:.5};   /* what the Iziz gateway takes of the Order's goods a day (a floor beside the fealty) */
E.valley=function(Px,Pl,o){o=o||{};
 const X=XAN_TUNE.valley(Px,{scale:o.scale}),L=LS_TUNE.valley(Pl,{scale:o.lsScale==null?E.lsScale:o.lsScale}),C=LS_TUNE.caravan,LS='sq80bzd7ep',SB='sfgtxw10kr';
 const lsScale=L.scale,mkt=C.market;
 /* the frame: Longsong's place in each plan */
 const a=Px.sites.find(s=>s.id===LS),b=Pl.sites.find(s=>s.id===LS),dx=a.x-b.x,dz=a.z-b.z;
 /* the calendar: Longsong's windows prefixed */
 const ren=w=>w==null?w:'ls.'+w,windows=Object.assign({},(X.calendar||{}).windows||{});
 Object.keys(L.calendar.windows).forEach(w=>{windows[ren(w)]=L.calendar.windows[w];});
 const lsS=L.settlements.filter(s=>s.id!==mkt).map(s=>{const c=JSON.parse(JSON.stringify(s));c.x+=dx;c.z+=dz;c.scale=lsScale;
  (c.works||[]).forEach(w=>{if(w.season)w.season=ren(w.season);if(w.pasture&&w.pasture.window)w.pasture.window=ren(w.pasture.window);});return c;});
 /* the caravan to Strongbow (not the market), the toll cut where it lands */
 const lsR=L.roads.filter(r=>r.id!=='caravan').map(r=>JSON.parse(JSON.stringify(r)));
 const cv=L.roads.find(r=>r.id==='caravan');
 lsR.push({id:'caravan.longsong',from:LS,to:SB,minutes:E.caravanDays*1440,carriers:cv.carriers,stagger:cv.stagger,cap:cv.cap,keep:E.caravanKeep,want:cv.want,
  goods:{[LS]:C.out.slice(),[SB]:C.in.slice()},expect:{[SB]:Object.assign({},C.expect),[LS]:Object.assign({},C.need)},
  cut:[{at:SB,to:'xan.citadel',share:XAN_TUNE.toll,why:'the Sultan\'s toll at the Strongbow lift'}]});
 /* Strongbow's market buys what the caravan takes up: tea and gold from behind (Kirstabal from Qiblai), salt and iron at the gate */
 const xR=X.roads.map(r=>r);
 const addGoods=(id,from,gs)=>{const r=xR.find(q=>q.id===id);if(!r)return null;gs.forEach(g=>{if(r.goods[from].indexOf(g)<0)r.goods[from].push(g);});return r;};
 const addExpect=(r,at,e)=>{if(!r)return;r.expect=r.expect||{};r.expect[at]=Object.assign({},r.expect[at]||{});for(const g in e)r.expect[at][g]=(r.expect[at][g]||0)+e[g];};
 const need={tea:C.need.tea,gold:C.need.gold};
 /* and Longsong's salt and iron come in at the lift with the Catch's caravans: Strongbow's gateways expect them on top of
    the south's (a town that falls short of a good never sends it on) */
 {const gs=XAN_TUNE.gateways.filter(G=>G.entry===SB&&G.in.indexOf('salt')>=0);gs.forEach(G=>{const r=X.roads.find(q=>q.id==='trade.'+G.id);
  if(!r)return;r.expect=r.expect||{};r.expect[SB]=Object.assign({},r.expect[SB]||{});r.expect[SB].salt=(r.expect[SB].salt||0)+C.need.salt/gs.length;
  if(G.in.indexOf('iron')>=0)r.expect[SB].iron=(r.expect[SB].iron||0)+C.need.iron;});}
 addExpect(addGoods('road.ks-sb','sl758m2396',['tea','gold']),SB,need);
 addExpect(addGoods('road.qb-ks','skm4jjo2vl',['tea','gold']),'sl758m2396',need);
 /* the Order's goods out through Iziz */
 {const r=xR.find(q=>q.id==='trade.gate.iziz');addGoods('trade.gate.iziz',SB,Object.keys(E.order));addExpect(r,'gate.iziz',E.order);}
 /* fealty and esteem with the citadel */
 const tr=(L.transfers||[]).map(t=>Object.assign({},t,{id:t.id+'.longsong'},t.from===mkt?{from:'xan.citadel'}:{},t.to===mkt?{to:'xan.citadel'}:{}));
 /* goods, factions, relations */
 const goods=Object.assign({},L.goods,X.goods);
 const factions=X.factions.concat(L.factions.filter(f=>!X.factions.some(g=>g.id===f.id)));
 const rel=X.relations.slice(),has=(a,b)=>rel.some(r=>r.a===a&&r.b===b);   /* XAN_TUNE already has the Order (its monastery at Qiblai) */
 X.factions.forEach(f=>{if(f.id==='order')return;if(!has('order',f.id))rel.push({a:'order',b:f.id,stance:'friendly'});if(!has(f.id,'order'))rel.push({a:f.id,b:'order',stance:'friendly'});});
 return Object.assign({},X,{calendar:Object.assign({},X.calendar||{},{windows}),goods,factions,relations:rel,
  settlements:X.settlements.concat(lsS),roads:xR.concat(lsR),transfers:(X.transfers||[]).concat(tr),
  join:{offset:{dx,dz},lsScale,caravan:'caravan.longsong'}});};
return E;})();
if(typeof module!=='undefined')module.exports=EAST_RIFT;
