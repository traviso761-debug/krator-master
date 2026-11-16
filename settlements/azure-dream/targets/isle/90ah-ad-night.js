// ================================================================= GRĒṬ-ĀIL — the Hall's night on core/sched
// PLAN.md section 5, "A night in the hall" and "Light at night". The night is a set of timetables over the day's 24 hours
// (core/sched's KSCHED.timeline, period 24, the sky's hour as its clock: AD_SKY.hour, ?hour=21), evaluated by AD_NIGHTLY.at(h)
// as plain data, and applied to the page each frame (only where a state changes):
//   the Lulling   19.0-19.5: the gallery's wheels braked one by one, the great wheel last (brake 0 -> 1); the kit's wheels do
//                 not turn yet, so the brake is a state the page carries, not a motion it shows (KNOWN_ISSUES.md)
//   the door      shut 19.5 (after the Lulling) to 6.0 (dawn): the Hall's two drawn doors through core/door (KDOOR.close,
//                 open), so a walker cannot get in at night (core/walk's blocks follow the leaves)
//   the lamps     the azure lamps and the clerestory's blue window from the Lulling to dawn (19.0-6.0); the censers' embers
//                 from the Lulling to the first watch's end (19.0-22.5)
//   the watches   the first 19.5-22.5, the second 22.5-1.5, the third 1.5-6.0: a keeper walks the Keepers' Walk with a hooded
//                 lamp (a timetable in seconds down the walk and back, its lamp in the light pool, 90af)
//   the Station   on a Station's night (?station=1: a stand-in until the page reads core/atmos's sky state for the Station's
//                 real pass) the clerestory's shutters open at its pass, 1.0-2.0, and its light comes down on the sleepers
// [G data] the timetables and AD_NIGHTLY.at; [web] the frame hook that applies them.
reseed(34171);
const AD_NIGHTLY=(function(){const K=KSCHED,T=s=>K.timeline({period:24,segments:s});
 const tt={
  brake:T([{dur:5.5,from:1,name:'the night'},{dur:.5,from:1,to:0,name:'dawn: the wheels freed'},{dur:13,from:0,name:'the day'},
           {dur:.5,from:0,to:1,name:'the Lulling: the wheels braked one by one, the great wheel last'},{dur:4.5,from:1,name:'the night'}]),
  door:T([{dur:6,from:1,name:'shut until dawn'},{dur:13.5,from:0,name:'open'},{dur:4.5,from:1,name:'shut after the Lulling'}]),
  azure:T([{dur:6,from:1},{dur:13,from:0},{dur:5,from:1}]),
  censer:T([{dur:19,from:0},{dur:3.5,from:1,name:'the censers lit'},{dur:1.5,from:0}]),
  watch:T([{dur:1.5,from:2,name:'the second watch'},{dur:4.5,from:3,name:'the third watch'},{dur:13.5,from:0,name:'the day'},
           {dur:3,from:1,name:'the first watch'},{dur:1.5,from:2,name:'the second watch'}]),
  shutters:T([{dur:1,from:0},{dur:.25,from:0,to:1},{dur:.5,from:1,name:'the Station\'s pass: the shutters open'},{dur:.25,from:1,to:0},{dur:22,from:0}])};
 /* the keeper down the Keepers' Walk and back, in seconds: the walk's local z (the azure lamps run -22.5 .. 22.5) */
 const keeper=K.timeline({period:180,segments:[{dur:80,from:-22.5,to:22.5,ease:'linear',name:'down the walk'},{dur:10,from:22.5,name:'at the Porlock Screen'},
  {dur:80,from:22.5,to:-22.5,ease:'linear',name:'up the walk'},{dur:10,from:-22.5,name:'at the shrine'}]});
 const station=/[?&]station=1/.test(typeof location!=='undefined'?location.search:'');
 function at(h){h=((h%24)+24)%24;const v=k=>tt[k].at(h);const b=v('brake'),w=v('watch');
  return{hour:h,brake:b.value,phase:b.name,doorShut:v('door').value>.5,azure:v('azure').value>.5,censers:v('censer').value>.5,
   watch:Math.round(w.value),watchName:w.name,shutters:station?v('shutters').value:0};}
 const S={at,station,keeper,state:null,applied:{},lamp:null,stationLamps:[]};
 /* the keeper's lamp and the Station's light join the lamp pool (AD_LAMPS, 90ae) as entries the hook moves and switches */
 const HP=AD_PLACE.find(p=>p.id==='hall-of-dreaming'),A=AD_HALL;
 if(HP){S.lamp=[HP.x,HP.o.y+A.P+1.0,HP.z,'keeper','keeper'];AD_LAMPS.push(S.lamp);
  for(const z of[-18,-6,6,18])for(const x of[-9,9]){const w=loc(HP.x,HP.z,x,z,HP.ry),L=[w[0],HP.o.y+A.P+7.5,w[1],'station','station'];AD_LAMPS.push(L);S.stationLamps.push(L);}}
 S.tick=function(t){const st=S.state=at(AD_SKY.hour),L=window._adWalk&&window._adWalk.leaves||[];
  if(S.applied.doorShut!==st.doorShut&&typeof KDOOR!=='undefined'){for(const D of L){if(st.doorShut)KDOOR.close(D);else KDOOR.open(D,{by:'npc'});}S.applied.doorShut=st.doorShut;}
  if(S.lamp&&HP){const z=st.watch?keeper.at(t||0).value:0,w=loc(HP.x,HP.z,.6,z,HP.ry);S.lamp[0]=w[0];S.lamp[2]=w[1];}
  return st;};
 return S;})();
// which lamps burn: 90af asks per kind (the night's own lamps by the timetables; the rest by the sky's night, as before)
function AD_LAMPON(kind,night){const st=AD_NIGHTLY.state||AD_NIGHTLY.at(AD_SKY.hour);
 if(kind==='azure'||kind==='pane')return st.azure;if(kind==='censer')return st.censers;if(kind==='keeper')return st.watch>0;
 if(kind==='station')return st.shutters>.5;return night||kind==='gold';}
{let t0=performance.now();AD_NIGHTLY.tick(0);FRAME_HOOKS.push(()=>AD_NIGHTLY.tick((performance.now()-t0)/1000));}
window._adNightly=AD_NIGHTLY;
