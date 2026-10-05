// ================================================================= YS CITY — the DRAW pass: the records of 88 built (PLAN.md P3 step 6; GODOT.md item 5)
// Reads PLACE and nothing else decides: the free-standing defs through HYK.place, the hosts through ysPlaceHost (cut,
// sunk, holed for their ways in), the tideline on each, and every pod through HYK.placeOn at the plate and bearing its
// record names. A slot (the foreign quarter, the land quarter's reclaimed Ancients) draws nothing: its builder is not in
// this build yet. The draw code's own scatter (the tideline's weed and specks, the builders' detail) is the lineage's
// stream, reseeded per host here (seeds 32100 + the host's index, below 32400); where things stand came from KRAND.
YS_BUILD.push(function(scene){const t0=performance.now();let fail=0;
 const once=k=>{TSTAT.cur=k+'/0';const t=tcur();t.n=(t.n||0)+1;};   // per-placement budgets (91-ys-probe typeStats)
 for(const r of PLACE.blds){once(r.key);const G=HYK.place(scene,r.key,r.x,r.z,r.ry,{y:r.y,v:r.v});if(!G)fail++;else r.drawn=true;}
 TSTAT.cur=null;
 PLACE.hosts.forEach((h,i)=>{const T=YS_HOST_TYPES[h.type];const builder=typeof window[T.builder]==='function'?window[T.builder]:null;
  if(!builder){reportErr('host type '+h.type+' has no builder '+T.builder);return;}
  const host=ysPlaceHost(scene,{key:T.key,builder,x:h.x,z:h.z,y:h.sink,ry:h.ry,d:h.d,cutY:h.cutY,podium:h.podium,cap:h.cap,rAt:h.rAt,name:h.n,
   floors:h.floors,ways:h.ways,ring:h.wealth==='rich'?1:h.wealth==='middle'?2:3});
  if(!host){fail++;return;}
  // the floors table runs to the top of what stands, not on into the sky over a full tower
  host.floors=host.floors.filter(f=>f.y<h.top+2);host.full=h.full;host.rec=h;h.drawn=true;
  reseed(32100+i);hykTideline(host);
  for(const p of h.pods){once(p.key);const G=HYK.placeOn(scene,p.key,host,{y:p.y,a:p.a,level:p.level,into:p.into});if(G)p.drawn=true;else fail++;}
  TSTAT.cur=null;});
 window._city={blds:PLACE.blds.length,hosts:HOSTS.length,pods:PLACE.hosts.reduce((s,h)=>s+h.pods.length,0),slots:PLACE.slots.length,fail,ms:Math.round(performance.now()-t0)};
});
