// ================================================================= THE LAKE TOWNS — the week: the page's day, the market and the fair (PLAN.md L5)
// [G data] No drawing. The lake's week as the tune sets it (core/region/data/xan-tune.js, read in place): the market boats'
// rounds (T.rounds: a hub and its towns in order) and the fair's two days (T.fairDays, a 7-day week), when the north shore's
// launches loop to Phēr (T.loops, days 'fair'). Phēr's page picks its day the same way (settlements/pher 90q PH_DAY).
//   XL_DAYS.DAY             the page's day: ?day=N (0 and up), else 122 (Phēr's default: a fair day, weekday 3)
//   XL_DAYS.at(key, day)    {day, weekday, fair, loop, fairAway, round, stop, marketDay, market} for a town on a day
//   XL_DAYS.marketDay(key)  the weekday its round's boat calls (null: no round reaches it)
// PROPOSED (the tune leaves them to the page): a round leaves its hub on weekday 0 and calls one town a day in its order, so
// Erehwon's south-east round (seven towns) calls on weekdays 1 to 6 and 0, its west round (six) on 1 to 6; Phēr's two rounds
// call on the days between its fairs (0, 1, 2, 4, 5: their boats are on the fair's loops on 3 and 6). A town's market day is
// the day its round calls: the second stall row stands, the round's barge lies at the quay and the households go down to
// buy (89zu's week). On a fair day a loop town's launch is away on the loop and its fair-goers with it.
const XL_DAYS=(function(){
 const TU=typeof XAN_TUNE!=='undefined'?XAN_TUNE:{},WEEK=7,FAIR=(TU.fairDays||[3,6]).slice();
 const ROUND={},LOOP={};
 for(const R of TU.rounds||[]){const id=R[0],hub=R[1];R[2].forEach((k,i)=>{ROUND[k]={id,hub,i,n:R[2].length};});}
 for(const L of TU.loops||[])if(L.days==='fair')for(const s of L.stops)if(s.indexOf('lk.')===0)LOOP[s.slice(3)]=L.id;
 const wd=d=>((Math.floor(d)%WEEK)+WEEK)%WEEK;
 const FREE=[];for(let d=0;d<WEEK;d++)if(FAIR.indexOf(d)<0)FREE.push(d);
 function marketDay(key){const R=ROUND[key];if(!R)return null;return R.hub==='xan.pher'?FREE[R.i%FREE.length]:(R.i+1)%WEEK;}
 function at(key,day){const w=wd(day),m=marketDay(key),fair=FAIR.indexOf(w)>=0,R=ROUND[key];
  return{day,weekday:w,fair,loop:LOOP[key]||null,fairAway:fair&&!!LOOP[key],round:R?R.id:null,stop:R?R.i:null,marketDay:m,market:m===w};}
 let q=null;try{if(typeof location!=='undefined')q=new URLSearchParams(location.search).get('day');}catch(e){}
 const DAY=q!=null&&q!==''&&isFinite(+q)&&+q>=0?Math.floor(+q):122;
 return{WEEK,FAIR,ROUND,LOOP,FREE,wd,marketDay,at,DAY};})();
