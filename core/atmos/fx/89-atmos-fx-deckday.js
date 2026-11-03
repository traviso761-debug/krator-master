// ================================================================= ATMOS — fx: the cloud deck's day and its air (ATMOS.deckLevel, deckDay, deckIn, provideDeck)
// The Cliff Lungs' section 14 item 5 (2026-11-03): ATMOS.cloudDeck stands at a fixed y, but the cloud sea at the foot of a wall
// laps up against it at dawn and burns back through the day (shighlands/NOTES.md: "laps up against it every day"), and a walker
// in it should be in a fog. This gives the deck's level as a plain function of the hour and the weather (the deck and the kit's
// own breath, LUNG.breath, read the same one, so they cannot disagree), binds a deck to it, says how deep a point is in the cloud,
// and hands core/hazard the sight inside it ('visibility': core/atmos/README.md, "The fields": "the cloud deck gives none yet").
// Opt-in (core/atmos/fx/, listed by path); needs 89-atmos-d-clouddeck.js (deckHeight). No browser API: deckLevel and deckIn are
// [G data] arithmetic, deckDay writes one uniform a frame.
//   ATMOS.deckLevel(hour, W, o) -> y   o: {y (the level's mean), lap (60 m: how far over the mean it laps at its high), burn (60 m:
//        how far under it it sinks at its low), high (8: the hour it is highest, after dawn), low (15.5: the hour it is lowest),
//        fog (40 m more at a full fog), rain (25 m more in rain)}; W {fog, rain} 0..1 or null. Smooth, and the same at 0 and 24
//   ATMOS.deckDay(deck, o) -> {level(), stop()}   deck: ATMOS.cloudDeck's result; each frame its uY is deckLevel(the page's hour,
//        o.weather ? o.weather() : null, o). The deck's ground-clearance window is fixed when it is made (y - down - 30 m, up + down
//        + 90 m tall): make the deck at o.y and keep lap and burn within about 60 m, or the ground's thinning reads a clamped height
//   ATMOS.deckIn(x, y, z, t, level, o) -> 0..1   how deep (x, y, z) is in the cloud at module clock t: 0 above the billows' top
//        there, 1 from o.depth (15 m) under it down
//   ATMOS.provideDeck(KHAZ, {level: () => y, base: (x, y, z, t) => m | null, sight: [600, 25] (m at the top, m deep in it)})
//        registers 'visibility': the lesser of the page's own (base) and the cloud's (the sight falls with deckIn)
(function(){
 'use strict';
 const A=typeof ATMOS!=='undefined'?ATMOS:null;
 if(!A||!A.deckHeight)throw new Error('core/atmos fx/89-atmos-fx-deckday.js: load 89-atmos-d-clouddeck.js first (ATMOS.deckHeight)');
 const fin=(v,w)=>{if(typeof v!=='number'||!isFinite(v))throw new Error('ATMOS.deckLevel: '+w+' must be a finite number');return v;};
 const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 /* the day's curve 0 (low) .. 1 (high): down from `high` to `low` through the day, up again from `low` to tomorrow's `high` */
 const dayK=(h,hi,lo)=>{const H=((h%24)+24)%24,a=((lo-hi)%24+24)%24,u=((H-hi)%24+24)%24;return u<=a?1-ss(0,a,u):ss(a,24,u);};
 A.deckLevel=(hour,W,o)=>{o=o||{};const y=fin(o.y,'y'),lap=fin(o.lap==null?60:o.lap,'lap'),burn=fin(o.burn==null?60:o.burn,'burn'),
   hi=fin(o.high==null?8:o.high,'high'),lo=fin(o.low==null?15.5:o.low,'low');fin(hour,'hour');
  if(lap<0||burn<0)throw new Error('ATMOS.deckLevel: lap and burn are 0 or more');if(((lo-hi)%24+24)%24===0)throw new Error('ATMOS.deckLevel: high and low must be different hours');
  const k=dayK(hour,hi,lo),w=W||{},up=(o.fog==null?40:o.fog)*(w.fog||0)+(o.rain==null?25:o.rain)*(w.rain||0);
  return y-burn+(lap+burn)*k+up;};
 A.deckDay=(deck,o)=>{o=o||{};if(!deck||!deck.mat||!deck.mat.uniforms||!deck.mat.uniforms.uY)throw new Error('ATMOS.deckDay: an ATMOS.cloudDeck result');if(!A.hooks)throw new Error('ATMOS.deckDay: run ATMOS.init first');
  const q=Object.assign({},o,{y:o.y==null?deck.record.y:o.y});let live=true,cur=q.y;
  const tick=(t,hour)=>{if(!live)return;cur=A.deckLevel(hour,q.weather?q.weather():null,q);deck.mat.uniforms.uY.value=cur;};
  A.hook(tick);deck.record.day={y:q.y,lap:q.lap==null?60:q.lap,burn:q.burn==null?60:q.burn,high:q.high==null?8:q.high,low:q.low==null?15.5:q.low,fog:q.fog==null?40:q.fog,rain:q.rain==null?25:q.rain};
  return {level:()=>cur,tick,stop:()=>{live=false;}};};
 A.deckIn=(x,y,z,t,level,o)=>{const dp=o&&o.depth!=null?o.depth:15,top=A.deckHeight(x,z,t,level);return y>=top?0:Math.min(1,(top-y)/dp);};
 A.provideDeck=(KH,o)=>{o=o||{};if(!KH||typeof KH.provide!=='function')throw new Error('ATMOS.provideDeck: KHAZ (core/hazard)');if(typeof o.level!=='function')throw new Error('ATMOS.provideDeck: level, a function of nothing (the deck\'s y now)');
  const S=o.sight||[600,25],base=o.base||null;
  KH.provide('visibility',(x,y,z,t)=>{const k=A.deckIn(x,y,z,t,o.level(),o),v=k>0?S[0]*Math.pow(S[1]/S[0],k):Infinity,b=base?base(x,y,z,t):Infinity;return Math.min(v,b==null?Infinity:b);});};
})();
