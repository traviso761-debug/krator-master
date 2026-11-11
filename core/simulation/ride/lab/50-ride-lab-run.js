// ================================================================= RIDE LAB — the life: the clock, the world, the travellers
// [G data] The world clock is core/clock's standard day (a world minute every 3 real seconds), so a world minute is 3
// motion seconds (SPM); the trains, the walkers and the riders move in motion time, SIM steps once a world minute. Each
// traveller commutes: a journey from the homes at Ledge to the works at Twenny past the gap, a stay, and back, for ever;
// the shift workers go by SIM's own resolver (they choose the train); the lojes are books only (80-sim-ride-line.js).
// The page and the verify read the same functions: RL.tick(t) once a frame, RL.run(minutes) to step the world fast.
const LABCLOCK=KCLOCK.make({hour:7,running:true,scale:1});
const SPM=KCLOCK.DAY_SECONDS/1440;
SIM.init({seed:20261111,hour:()=>LABCLOCK.hour,day:()=>LABCLOCK.day,t:()=>LABCLOCK.t,err:m=>{const e=document.getElementById('errs');e.style.display='block';e.textContent+='sim: '+m+'\n';}});
const RL={L:null,people:[],plan:{},minute:null,journeys:0,failed:0};
RL.L=RIDELAB.declare({secPerMinute:SPM});
RIDELAB.walk(KWALK,RL.L);
RIDELAB.trade(RL.L,{secPerMinute:SPM});
RL.people=RIDELAB.people(RL.L,40);
/* the shift workers (R6): no script sends them; SIM's resolver does. Their role says ride: true, so a decision to work at
   Twenny or sleep at Ledge, past the gap, becomes a journey by train (81-sim-ride-choose.js) */
SIM.role({id:'shift',org:'loj',ride:true,sched:[[0,'SLEEP'],[6,'WORK'],[18,'SLEEP']],prefers:{SLEEP:{pin:'home'},WORK:{pin:'work'}}});
RL.shift=[];{const H=SIM.R.place['ledge.homes'];for(let i=0;i<16;i++)RL.shift.push(SIM.actor({id:'shift'+i,role:'shift',home:'ledge.homes',work:'twenny.works',
  pos:{x:H.x+Math.cos(i*0.7)*4,y:0,z:H.z+Math.sin(i*0.7)*4}}));}
RL.snap0=null;
/* each traveller's next journey: its time (motion seconds) and where to; the first ones leave a few seconds apart */
RL.people.forEach((a,i)=>{RL.plan[a.id]={next:6+i*9,to:'twenny.works'};});
RL.stay=a=>120+((a.k*2654435761)>>>0)%240;
RL.life=function(t){
  for(const a of RL.people){const P=RL.plan[a.id];if(SIM.RIDE.riders[a.id]||t<P.next)continue;
    const T=SIM.journey(a,{to:P.to,t,hold:true});
    if(T){RL.journeys++;P.next=T.arrive+RL.stay(a);P.to=P.to==='twenny.works'?'ledge.homes':'twenny.works';}else{RL.failed++;P.next=t+30;}}};
/* SIM steps once a world minute, catching up after a jump of the clock (at most 240 steps a frame) */
RL.step=function(){const m=SIM.minute();if(RL.minute==null){RL.minute=m-1;}
  let n=0;while(RL.minute<m&&n<240){RL.minute++;SIM.step();n++;if(!RL.snap0)RL.snap0=SIM.ledgerSnap();}if(RL.minute<m)RL.minute=m;};
RL.tick=function(t){RL.life(t);RL.step();RIDELAB.doors(RL.L,t,KWALK);KWALKFRAME.at(KWALK,t);};
/* the world run fast for the verify: minute by minute, the motion clock moved with it (the trains, the porters, the riders) */
RL.run=function(minutes){const C=LABCLOCK;for(let i=0;i<minutes;i++){C.t+=SPM;const m=C.day*1440+Math.round(C.hour*60)+1;C.day=Math.floor(m/1440);C.hour=(m%1440)/60+1e-7;RL.tick(C.t);}};
