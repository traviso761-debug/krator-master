// ---------- Galaxy class: away teams with choices, and sickbay ----------
// Original work. When an away team beams down (transporter.js, W.emit('away')), the first officer reports in an LCARS
// panel: a short scene with two or three choices. What comes of the choice is drawn from the run's seed (orders.js
// W.runSeed), the mission and the place, so the same run gives the same outcome for the same choice. The outcome goes
// into the captain's log at once, and becomes what the team reports when it is brought back up (the 'aboard' entry);
// anyone hurt comes back to sickbay. Brought up before anything was chosen, the team kept to standing orders (the
// first, careful choice).
//
// Sickbay (W.sickbay) holds whoever has been hurt: away teams, a diplomats' brawl. One patient is discharged every
// two minutes, and a starbase's hospital takes the rest when the ship docks. It is kept in the career, with the
// count of everyone ever treated.
//
// The test captain (#mauto) cannot click: with it, a scene picks its own choice after a moment, so it never holds a
// mission up. choicePanel() is shared with diplomats.js.
import {sidePanel,el,button,seeded} from './ui.js';

const MAUTO=new URLSearchParams(location.hash.slice(1)).has('mauto');

// a panel with a scene and its choices; pick(i) is called once, with the index chosen
export function choicePanel(W,id,title){
  const P=sidePanel(id,title,()=>{});let cur=null;
  function show(sc){cur=sc;P.body.innerHTML='';
    P.body.append(el('div','card ok',[el('b',null,sc.head),el('div','say',sc.text)]));
    if(sc.done){P.body.append(el('div','card',[el('div',null,sc.done)]),el('div','acts',[button('Close',()=>P.toggle(false))]));return;}
    const a=el('div','acts');sc.choices.forEach((c,i)=>a.append(button(c,()=>choose(i))));P.body.append(a);
    if(sc.foot)P.body.append(el('small',null,sc.foot));}
  function choose(i){if(!cur||cur.done)return;const sc=cur;W.audio&&W.audio();sc.done=sc.pick(i)||'Done.';show(sc);}
  return {
    // a scene: {head, text, choices:[...], pick(i) -> what came of it, auto: the index #mauto picks}
    ask(sc,open){show(sc);if(open!==false)P.toggle(true);
      if(MAUTO)setTimeout(()=>{if(cur===sc&&!sc.done)choose(sc.auto==null?0:sc.auto);},2500);},
    choose,open:()=>{if(cur)P.toggle(true);},pending:()=>!!(cur&&!cur.done),panel:P};
}

// the scenes: where they are drawn for (a test on the body's name or the place), the scene, and for each choice the
// outcomes it may have [weight, what happened, how many hurt, how good: 0 poor, 1 fair, 2 fine]
const SCENES=[
  {when:(b,pid)=>b==='the hub',text:'The team stands in a hall that lit up as they came into it. Three passages lead on; the one behind them is going dark. Commander, the first officer asks: how far do we go?',
   choices:[['Take readings and touch nothing.',[[6,'They mapped the hall and the passages\' mouths, and came away with nothing but readings: careful, and complete.',0,1],[1,'A panel they did not touch woke anyway and threw one of them across the hall.',1,0]]],
     ['Follow the lights deeper.',[[4,'The lights led to a chamber at the hub\'s heart, where a slow voice spoke in no language anyone knows. They recorded all of it.',0,2],[3,'The passage sealed behind them for an hour. They found another way out, and one turned an ankle doing it.',1,1],[2,'Something in the dark pushed back. Two hurt, none badly; they came away with burns and very good pictures.',2,0]]],
     ['Have the translator try the writing on the walls.',[[5,'The translator made one line out, over and over: "the door is also a road". The science department is delighted.',0,2],[3,'The translator could make nothing of it, but the writing changed while they watched.',0,1]]]]},
  {when:(b,pid)=>pid==='farside',text:'A forest of glassy stalks that chime when the wind moves them, and something moving between them that the tricorders cannot settle on. Your orders, Captain?',
   choices:[['Watch from cover, and record.',[[6,'They watched for an hour. Whatever it is grazes on the chimes. Science calls it the first life recorded past the wormhole.',0,2],[2,'They waited, and nothing came; the readings are good.',0,1]]],
     ['Go and meet it.',[[3,'It let them come close, and touched the first officer\'s hand. Nobody can say what that meant, but nobody was hurt.',0,2],[3,'It was faster than it looked, and frightened. One of the team has a broken arm.',1,0]]],
     ['Take samples and come away.',[[7,'Soil, water and a stalk that still chimes in its case. Quick and clean.',0,1],[1,'A stalk shattered as they cut it. Glass in two of them; sickbay is picking it out.',2,0]]]]},
  {when:(b,pid,k)=>k==='evacuate',text:'The medical team is down. There are more injured than the reports said, and the ground is still moving. The doctor wants to know where to start.',
   choices:[['Triage: the worst hurt up first.',[[7,'The worst hurt came up first, and all of them lived. The doctor calls it textbook.',0,2],[2,'Slow and careful, and an aftershock caught one of our nurses.',1,1]]],
     ['Get everyone to the open ground at once.',[[5,'Everyone out from under the buildings before the next shock. Quick, and nobody else was hurt.',0,2],[3,'The move was rough on the injured, and two of ours were hurt carrying them.',2,0]]],
     ['Go into the fallen hall for the trapped.',[[3,'They brought eleven out of the hall alive. The first officer is putting the team in for commendations.',0,2],[3,'They got the trapped out; the hall came down behind them, and three of ours are hurt.',3,0]]]]},
  {when:()=>true,text:'The team is down on the surface. There are ruins half a kilometre off, a river the other way, and the tricorders say something living is watching from the rocks.',
   choices:[['Survey the ruins.',[[5,'The ruins are a settlement nobody has charted: a few thousand years old, and in good order. Pictures, plans, and pottery.',0,2],[2,'A floor gave way under the geologist; she is bruised, and furious, and has samples of the cellar.',1,1]]],
     ['Follow the river and take samples.',[[6,'Water, soil and core samples, all clean, and a view the team would like to describe at length.',0,1],[1,'The river was faster than it looked. One of them went in, and has swallowed a good deal of it.',1,0]]],
     ['Find out what is watching from the rocks.',[[3,'A family of something like otters, who came out to look at the strangers. The team kept its distance, and the pictures are wonderful.',0,2],[3,'It was not friendly. A bite, a scratch, and two in sickbay with something sickbay has never seen.',2,0]]]]},
];

export function away(W){
  const CP=choicePanel(W,'ent-away','Away team');
  // ---- sickbay ----
  const C=()=>{const c=W.career?W.career():{};if(c.sickbay==null)c.sickbay=0;if(c.treated==null)c.treated=0;return c;};
  let since=0;
  W.sickbay={
    n:()=>C().sickbay,
    add(n,why){if(!(n>0))return;const c=C();c.sickbay+=n;c.treated+=n;W.toast&&W.toast('Sickbay',' '+(n===1?'One':n)+' admitted: '+why);W.emit('injured',{n,why});},
    heal(n,why){const c=C();const k=Math.min(c.sickbay,n==null?c.sickbay:n);if(!k)return;c.sickbay-=k;if(why)W.logEntry&&W.logEntry(why);}};
  W.animHooks.push(()=>{if(++since%7200===0&&C().sickbay>0)W.sickbay.heal(1);});   // about two minutes a patient
  W.on('docked',st=>{const n=C().sickbay;if(n)W.sickbay.heal(n,(n===1?'Our one patient':'Our '+n+' patients')+' went to '+st.name+'\'s hospital.');});

  // ---- the scenes ----
  let team=null,teams=0;
  W.on('away',a=>{
    const pid=W.herePlace().P.id,mk=W.orders&&W.orders.active&&W.orders.active(),kind=mk&&mk.kind;
    const S=SCENES.find(s=>s.when(a.body,pid,kind)),seed=(W.orders&&W.orders.seed?W.orders.seed():'')+a.body+pid+(teams++);
    team={a,S,chose:-1};const t=team;
    const sc={head:'Away team: '+a.body.replace(/^the /,'').replace(/^./,c=>c.toUpperCase()),text:S.text,choices:S.choices.map(c=>c[0]),
      auto:Math.floor(seeded('auto'+seed)()*S.choices.length),foot:'What comes of it is the run\'s own: the same seed, the same choice, the same outcome.',
      pick:i=>resolve(t,i,seed)};
    t.sc=sc;CP.ask(sc);});
  function resolve(t,i,seed){if(t.chose>=0)return t.out[1];t.chose=i;
    const outs=t.S.choices[i][1],r=seeded('away'+seed+i)(),tot=outs.reduce((s,o)=>s+o[0],0);let x=r*tot,o=outs[0];for(const q of outs){if((x-=q[0])<0){o=q;break;}}
    t.out=o;t.a.found=o[1]+(o[2]?' '+(o[2]===1?'One':o[2]===2?'Two':'Three')+' hurt: sickbay is ready for them.':'');
    W.logEntry&&W.logEntry('Away team on '+t.a.body+': '+t.S.choices[i][0].replace(/\.$/,'').toLowerCase()+'. '+o[1]);
    W.emit('awaychoice',{body:t.a.body,choice:i,good:o[3],hurt:o[2]});
    return o[1]+(o[2]?' They are coming back with '+o[2]+' hurt.':'')+' B brings them up.';}
  // brought up before anything was chosen: standing orders (transporter.js tells us as it energises, before the log)
  W.on('upbeam',a=>{const t=team;if(t&&t.a===a&&t.chose<0){CP.choose(0);if(t.chose<0)resolve(t,0,'');}});
  W.on('aboard',a=>{const t=team;if(!t||t.a!==a)return;team=null;
    if(t.chose<0)resolve(t,0,'');
    if(t.out&&t.out[2])W.sickbay.add(t.out[2],'from the away team on '+a.body+'.');});

  return {act:{awayscene:()=>CP.open(),hurt:()=>W.sickbay.add(2,'a test.')},
    hud:()=>{const n=C().sickbay;return (team&&CP.pending()?'away team: awaiting orders':'')+(n?(team?' · ':'')+'sickbay: '+n:'');},
    state:()=>({team:team&&team.a.body,chose:team&&team.chose,sickbay:C().sickbay,treated:C().treated})};
}
