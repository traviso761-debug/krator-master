// ---------- Galaxy class: diplomatic passengers ----------
// Original work; every people and person here is made up for the page. The envoy orders (orders.js) carry one or two
// delegations from one starbase to another. Once they are aboard (W.diplomats.board, when the ship docks for them),
// their leaders hail the bridge now and then with complaints (in comms.js's transcript and a toast). Two delegations
// aboard at once make trouble: the first time the ship goes to warp with them, a quarrel breaks out, and a step to
// settle it is put into the orders ahead of docking. The Passengers panel offers three ways to settle it; what comes of
// each is drawn from the mission's seed. It moves the standing with Starfleet Command (standing.js), may put someone
// in sickbay (away.js), and the best outcome earns a commendation. The test captain (#mauto) has the panel choose.
import {choicePanel} from './away.js';
import {seeded} from './ui.js';

// [who, their leader, their complaints]
export const DELEGATIONS=[
  ['the Tellurine delegation','Ambassador Oshe Varanth',['The replicators on deck eight make something they insist is tea. It is not tea.',
    'The gravity in our quarters is two percent too high. We measured it.','Our quarters face away from the stars. We were promised stars.']],
  ['the Aphelid envoys','First Speaker Lirr',['The lights in the corridors hum. Does nobody else hear it?','We asked for the arboretum to be closed to the crew. It is still open.',
    'Your counsellor asked how we were feeling. That is not a question Aphelids ask.']],
  ['the Corvane trade mission','Minister Hadrel Kost',['We are told the ship is at warp eight. Our own ships would be at warp nine by now.',
    'Your computer will not discuss tariffs. A ship this size and it will not discuss tariffs.','The Ten Forward bartender has refused our offer to buy the bar.']],
  ['the Sarethi consulate','Consul Ithren Dask',['There is a child on deck five who keeps waving at us. We have not decided how to respond.',
    'The holodeck\'s idea of Sareth is three hundred years out of date and somewhat insulting.','We would like the ship to stop making that noise when it turns.']],
  ['the New Arden council','Councillor Mae Okonkwo-Reyes',['The colony would like it noted that it was promised this ship a month ago.',
    'Our delegation has been seated at the same table as the Corvane at dinner. Again.','Is there a reason the turbolifts play music?']],
];
const QUARREL=[
  ['Give them separate decks and separate mess halls.',[[6,'Kept apart, they sulked in comfort. Nobody spoke to anybody, which the protocol officer counts as a success.',0,1,0],[2,'Apart, each decided the other had the better deck. A formal complaint, in triplicate.',0,0,-1]]],
  ['Host them both at the captain\'s table and make them talk.',[[4,'Dinner ran four hours. By the end they were arguing about wine instead of borders, and they arrive as something like friends.',0,2,2],[3,'Polite, cold, and over by nine. Nothing gained, nothing lost.',0,1,0],[2,'It ended with a thrown glass and a security officer between them. Two to sickbay, both cut.',2,0,-2]]],
  ['Back the senior delegation, and tell the other to keep to its quarters.',[[5,'Order was kept. The junior delegation will be telling Command how it was treated.',0,1,-1],[2,'They kept to their quarters, and wrote to everyone they know. Command has heard about it already.',0,0,-2]]],
];

export function diplomats(W){
  const CP=choicePanel(W,'ent-passengers','Passengers');
  let aboard=null,mission=null,quarrel=null,nextT=0,wasWarp=false,tk=0;
  const say=(who,t)=>{if(W.comms&&W.comms.say)W.comms.say(who,t);else W.toast&&W.toast(who,' '+t);};
  function board(who,m){aboard=who.map(d=>({d,said:0}));mission=m;quarrel=who.length>1?{due:true}:null;nextT=tk+60*40;
    W.logEntry&&W.logEntry('Aboard: '+who.map(d=>d[0]+', led by '+d[1]).join('; and ')+'.');
    say(who[0][1],'Captain. We trust the voyage will be short.'+(who.length>1?' And that we will not be seated with '+who[1][0]+'.':''));}
  function land(ok){if(!aboard)return;const who=aboard.map(a=>a.d[0]).join(' and ');
    W.logEntry&&W.logEntry('Our passengers went ashore: '+who+(quarrel&&quarrel.out?', '+(quarrel.out[3]>=2?'on speaking terms':quarrel.out[3]===0?'still not speaking':'civil')+'.':'.'));
    if(ok!==false&&W.standing)W.standing.add('starfleet',1,'passengers delivered');
    aboard=null;mission=null;quarrel=null;}
  // the quarrel: the first time the ship goes to warp with both aboard
  function startQuarrel(){if(!quarrel||!quarrel.due||!aboard||aboard.length<2)return;quarrel.due=false;
    const [A,B]=aboard.map(a=>a.d),seed=(mission&&mission.seed)||W.runSeed||'';
    W.logEntry&&W.logEntry('Trouble aboard: '+A[0]+' and '+B[0]+' met in a corridor. Security was called.');
    W.orders&&W.orders.interject({text:'Settle the quarrel between the delegations (the Passengers panel).',test:e=>e==='settled',go:()=>CP.open()});
    const sc={head:'A quarrel aboard',text:A[1]+', of '+A[0]+', says that '+B[1]+' insulted them at the turbolift. '+B[1]+' says it was a compliment, badly translated. Both want an apology before the talks. How do you settle it?',
      choices:QUARREL.map(q=>q[0]),auto:Math.floor(seeded('dq'+seed)()*QUARREL.length),
      pick:i=>{const outs=QUARREL[i][1],tot=outs.reduce((s,o)=>s+o[0],0);let x=seeded('quarrel'+seed+i)()*tot,o=outs[0];for(const q of outs){if((x-=q[0])<0){o=q;break;}}
        quarrel.out=o;W.logEntry&&W.logEntry('The quarrel: '+QUARREL[i][0].replace(/\.$/,'').toLowerCase()+'. '+o[1]);
        if(o[2]&&W.sickbay)W.sickbay.add(o[2],'from the quarrel at dinner.');
        if(o[4]&&W.standing)W.standing.add('starfleet',o[4],o[4]>0?'the delegations reconciled':'a diplomatic incident aboard');
        W.emit('settled',{good:o[3],choice:i});return o[1];}};
    CP.ask(sc);}
  W.animHooks.push(()=>{tk++;if(!aboard)return;
    const w=!!W.flight.warp;if(w&&!wasWarp&&quarrel&&quarrel.due)setTimeout(startQuarrel,4000);wasWarp=w;
    // a complaint every minute or so
    if(tk>=nextT){const r=seeded('dc'+(W.runSeed||'')+tk),a=aboard[Math.floor(r()*aboard.length)],c=a.d[2];nextT=tk+60*(50+Math.floor(r()*40));
      say(a.d[1],c[a.said++%c.length]);}});
  // the orders done or given up: they go ashore (or find another ship)
  W.on('mission',m=>{if(m===mission)land(true);});
  W.on('abandoned',m=>{if(m===mission){W.logEntry&&W.logEntry('Our passengers will find other passage.');land(false);}});
  W.diplomats={board,open:()=>CP.open(),aboard:()=>aboard&&aboard.map(a=>a.d[0])};
  return {act:{passengers:()=>CP.open(),quarrel:()=>{if(!aboard)board(DELEGATIONS.slice(0,2),null);quarrel={due:true};startQuarrel();}},
    hud:()=>aboard?'passengers: '+aboard.length+(CP.pending()?' (quarrelling)':''):'',
    state:()=>({aboard:aboard&&aboard.map(a=>a.d[0]),quarrel:quarrel&&{due:quarrel.due,out:quarrel.out&&quarrel.out[3]}})};
}
