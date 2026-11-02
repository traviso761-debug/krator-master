// ---------- Galaxy class: orders, and the captain's log ----------
// Original work. Starfleet sends orders (J, or the Orders button): a rescue, a survey, an escort, raiders to drive
// off, a delivery, the far side of the wormhole. Each is a few steps, done in order; the panel shows them with a
// button for the next one where it has an obvious one (a course, docking, a scan), the step's target is always
// marked on screen (cartography.js's markers), and each step is ticked off by what the other modules report
// happening (W.emit: 'scan', 'rescued', 'docked', 'escort', 'wormhole', 'away', and arriving, and the hostiles being
// gone). A finished mission is a commendation (kept in this browser) and the next orders come in.
//
// The log keeps itself: arrivals, docking, battles, rescues, scans and the wormhole go in it by stardate (a made-up
// clock that runs with time and with light-years travelled).
//
// For tests: #mission=rescue (or survey, escort, defend, deliver, wormhole) accepts that one at once.
import {PLACES} from './places.js';
import {STATIONS,stationName} from './starbases.js';
import {sidePanel,el,button,typing,seeded} from './ui.js';

const WRECKS=[['USS Wren','NCC-80211','kestrel'],['USS Sable Point','NCC-77140','tamar'],['USS Ostrander','NCC-69902','meridian'],['USS Lodestar','NCC-74418','halyard']];
const TRANSPORTS=[['USS Bellwether','NCC-61120','halyard'],['USS Merrow','NCC-61307','halyard'],['USS Kittiwake','NCC-62044','halyard']];
const CARGO=['vaccines for the outer colonies','spare parts for a starbase\'s reactor','a diplomatic pouch','seed stock for a new colony','a relief team of doctors'];
const SURVEY=['comet','binary','nebula','hole','pulsar','disc','eye','rogue','lava','ice'];
const ROTATION=['rescue','survey','escort','defend','wormhole','deliver'];

export function orders(W){
  const {THREE,ROOT,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const P=sidePanel('ent-orders','Orders and log',o=>{W.onLogToggle&&W.onLogToggle(o);if(o)dirty=true;});
  const LS='ent-commendations';let commend=0;try{commend=+localStorage.getItem(LS)||0;}catch(e){}
  let ly=0;const t0=performance.now(),lastMap=S.map.clone();
  const stardate=()=>(51204.3+(performance.now()-t0)/600000+ly*0.04).toFixed(1);
  const log=[];let dirty=true;
  const entry=t=>{log.unshift([stardate(),t]);if(log.length>40)log.pop();dirty=true;};
  const place=id=>PLACES.find(p=>p.id===id),here=()=>W.herePlace().P.id;
  const stName=n=>stationName({n}),stPlace=n=>STATIONS.find(s=>s.n===n).place;
  const course=Pl=>()=>{if(here()!==Pl.id)W.course.set(Pl);};
  const dockAt=n=>()=>{if(here()===stPlace(n)){const st=W.stations.find(s=>s.n===n);if(st)W.dock(st);}else W.course.set(place(stPlace(n)));};

  // ================= the missions =================
  let num=0,offered=null,active=null,spawned=[];
  function make(kind){
    const r=seeded('orders'+num+kind),pk=a=>a[Math.floor(r()*a.length)],not=a=>a.filter(x=>x!==here());
    const arrive=Pl=>({text:'Set a course for '+Pl.name.replace(/^Home: .*/,'home')+'.',test:(e,d)=>e==='arrive'&&d.P.id===Pl.id||e==='tick'&&here()===Pl.id&&W.herePlace().group.visible,go:course(Pl)});
    if(kind==='rescue'){
      const Pl=place(pk(not(['giant','ice','comet','belt','ocean','rogue','lava']))),[nm,reg,cls]=pk(WRECKS);let wreck=null;
      const m={kind,title:'Distress call: the '+nm,brief:'The '+nm+' ('+reg+') has lost main power at '+Pl.name.replace(/^An? /,'the ').toLowerCase()+'. Life support is failing. Get her crew off.',steps:[
        {...arrive(Pl),done:()=>{const pl=W.herePlace(),f=V().set(1,0,0).applyQuaternion(ROOT.quaternion),s=V().set(0,0,1).applyQuaternion(ROOT.quaternion);
          const at=pl.group.worldToLocal(ROOT.position.clone().addScaledVector(f,9000).addScaledVector(s,2500).add(V().set(0,600,0)));
          wreck=W.traffic.wreck(pl,cls,at,[nm,reg,cls]);wreck.task.crew=20+Math.floor(r()*70);wreck.task.life=12+Math.round(r()*20);spawned.push(wreck);
          F.note('Sensors: a ship dead ahead, nine kilometres. No main power. It is the '+nm+'.');}},
        {text:'Find the '+nm+': scan her (N), or come within five kilometres.',target:()=>wreck&&wreck.name,
          test:(e,d)=>wreck&&(e==='scan'&&d.c&&d.c.ship===wreck||e==='tick'&&wreck.g.getWorldPosition(V()).distanceTo(ROOT.position)<5000),
          go:()=>{const c=W.contacts().find(c=>c.ship===wreck);if(c)W.goContact(c);}},
        {text:'Beam her crew aboard (B, within five kilometres).',target:()=>wreck&&wreck.name,test:(e,d)=>e==='rescued'&&d===wreck,
          go:()=>{const c=W.contacts().find(c=>c.ship===wreck);if(c)W.beam(c);},
          done:()=>{if(r()<0.65){m.steps.splice(m.i+1,0,{text:'Raiders followed her distress call: drive them off.',test:e=>e==='won'});
            setTimeout(()=>{W.HO.contact();setTimeout(()=>W.HO.contact(),2500);},3500);}}},
        {text:'Take the survivors to a starbase: dock at any.',test:e=>e==='docked',go:()=>{const sts=W.stations.filter(s=>s.place===W.herePlace());if(sts.length)W.dock();else W.course.set(place('home'));}}]};
      return m;}
    if(kind==='survey'){
      const Pl=place(pk(not(SURVEY)));
      return {kind,title:'Survey: '+Pl.name.replace(/^An? /,'').replace(/^./,c=>c.toUpperCase()),brief:'The Science Council wants new readings of '+Pl.name.replace(/^An? /,'the ').toLowerCase()+'. Go and look closely.',steps:[
        arrive(Pl),
        {text:'Scan what is there (N, or Scan on the system chart).',test:(e,d)=>e==='scan'&&d.place===Pl.id&&d.c&&/body|object|gate/.test(d.c.kind),go:()=>W.scan()},
        {text:'Sweep the whole place with sensors.',test:(e,d)=>e==='scan'&&d.place===Pl.id&&!d.c,go:()=>W.scan(null)}]};}
    if(kind==='escort'){
      const sts=STATIONS.filter(s=>s.place!=='belt'),a=pk(sts.filter(s=>s.place!==here())),b=pk(sts.filter(s=>s.place!==a.place)),[nm,reg,cls]=pk(TRANSPORTS);let tr=null;
      const PA=place(a.place),PB=place(b.place);
      return {kind,title:'Escort the '+nm,brief:'The transport '+nm+' is carrying '+pk(CARGO)+' from '+stName(a.n)+' to '+stName(b.n)+'. Raiders have been seen on the way. See her there.',steps:[
        {...arrive(PA),text:'Go to '+stName(a.n)+' ('+PA.name.replace(/^Home: .*/,'home').replace(/^An? /,'the ').toLowerCase()+').',
          done:()=>{const pl=W.herePlace(),st=W.stations.find(s=>s.n===a.n)||W.stations.find(s=>s.place===pl);if(!st)return;
            const R=2600,c=st.g.position;tr=W.traffic.spawn(pl,cls,{kind:'loop',c:()=>c,r:R,w:200/R,a:r()*6,n:V().set(0,1,0),say:'Waiting for her escort.'},[nm,reg,cls]);spawned.push(tr);
            F.note('The '+nm+' is waiting by '+st.name+'.');}},
        {text:'Hail the '+nm+' and have her form up on you (H).',target:()=>tr&&tr.name,test:(e,d)=>e==='escort'&&d===tr,go:()=>{W.openComms&&W.openComms();}},
        {text:'Bring her to '+stName(b.n)+'.',test:(e,d)=>e==='arrive'&&d.P.id===PB.id&&tr&&tr.task.kind==='escort',go:course(PB),
          done:()=>{setTimeout(()=>{if(tr){W.traffic.release(tr,'Delivered to '+stName(b.n)+', and unloading.');F.note('The '+nm+' is breaking formation: "Thank you, Enterprise. We\'ll take it from here."');}},4000);}}]};}
    if(kind==='defend'){
      const Pl=place(pk(not(['giant','ice','ocean','lava','belt','comet']))),hard=num>3;let fought=false;
      return {kind,title:'Raiders at '+Pl.name.replace(/^An? /,'the ').replace(/^Home: .*/,'home').toLowerCase(),brief:'Raiders are preying on shipping at '+Pl.name.replace(/^An? /,'the ').toLowerCase()+'. Drive them off.'+(hard?' A Varr cruiser has been seen with them.':''),steps:[
        {...arrive(Pl),done:()=>{setTimeout(()=>{W.HO.contact();setTimeout(()=>W.HO.contact(hard?'varr':'raider'),3000);fought=true;},4000);}},
        {text:'Drive them off.',test:e=>e==='won'&&fought,go:()=>{W.flight.on||W.startFlight();if(W.enemy)W.fire('phasers');}}]};}
    if(kind==='deliver'){
      const s=pk(STATIONS.filter(s=>s.place!==here()||r()<0.2)),cargo=pk(CARGO);
      return {kind,title:'Deliver '+cargo.split(' for ')[0].replace(/^an? /,''),brief:'Carry '+cargo+' to '+stName(s.n)+'.',steps:[
        {text:'Dock at '+stName(s.n)+' (K when you are there).',test:(e,d)=>e==='docked'&&d.n===s.n,go:dockAt(s.n),target:()=>stName(s.n)}]};}
    // the wormhole
    return {kind:'wormhole',title:'Beyond the wormhole',brief:'Nobody has been through the wormhole and come back with readings. Go through, survey what is on the far side, put a team down and come home.',steps:[
      arrive(place('gate')),
      {text:'Fly into the wormhole.',test:(e,d)=>e==='wormhole'&&d.to.id==='farside',go:()=>{const c=W.contacts().find(c=>c.kind==='gate');if(c)W.goContact(c);},target:()=>'the wormhole'},
      {text:'Scan the uncharted world (N).',test:(e,d)=>e==='scan'&&d.place==='farside'&&d.c&&d.c.kind==='body',go:()=>{const c=W.contacts().find(c=>c.kind==='body');if(c)W.scan(c);},target:()=>'the uncharted world'},
      {text:'Go into orbit over it (O) and send an away team down (B).',test:e=>e==='away'&&here()==='farside',go:()=>{const c=W.contacts().find(c=>c.kind==='body');if(c)W.goContact(c);}},
      {text:'Bring the team back up (B).',test:e=>e==='aboard'},
      {text:'Come home through the wormhole.',test:(e,d)=>e==='wormhole'&&d.to.id==='gate',go:()=>{const c=W.contacts().find(c=>c.kind==='gate');if(c)W.goContact(c);},target:()=>'the wormhole'}]};
  }
  function offer(kind){num++;offered=make(kind||ROTATION[(num-1)%ROTATION.length]);dirty=true;}
  function accept(){if(!offered)return;
    for(const t of spawned)if(t!==active&&t.task.kind!=='escort')try{W.traffic.remove(t);}catch(e){}spawned=[];
    active=offered;offered=null;active.i=0;entry('New orders: '+active.title+'. '+active.brief);
    W.toast&&W.toast('Starfleet Command',' '+active.brief);fanfare(false);check('tick');dirty=true;}
  function decline(){const k=offered&&offered.kind;offer(ROTATION[(ROTATION.indexOf(k)+1)%ROTATION.length]);}
  function abandon(){if(!active)return;entry('Orders abandoned: '+active.title+'.');active=null;offer();}
  function check(e,d){if(!active)return;const st=active.steps[active.i];if(!st||!st.test(e,d))return;
    st.ok=true;if(st.done)st.done();active.i++;dirty=true;
    if(active.i>=active.steps.length){commend++;try{localStorage.setItem(LS,String(commend));}catch(err){}
      entry('Mission complete: '+active.title+'. Starfleet sends its compliments (commendation '+commend+').');
      W.toast&&W.toast('Starfleet Command',' Well done, Enterprise: '+active.title.toLowerCase()+', done. New orders follow.');fanfare(true);
      active=null;setTimeout(()=>offer(),3000);}
    else{const nx=active.steps[active.i];W.toast&&W.toast('Orders',' '+nx.text);if(e!=='tick')check('tick');}}
  function fanfare(big){const A=W.audio&&W.audio();if(!A)return;const {a,master}=A,t=a.currentTime;
    const notes=big?[[523,0],[659,0.14],[784,0.28],[1047,0.42]]:[[659,0],[880,0.12]];
    for(const [f,dt] of notes){const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(master);
      g.gain.setValueAtTime(0,t+dt);g.gain.linearRampToValueAtTime(0.08,t+dt+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dt+(big&&dt>0.4?1.2:0.35));o.start(t+dt);o.stop(t+dt+1.3);}}

  // ================= what happens, from the other modules =================
  for(const k of ['scan','rescued','docked','escort','wormhole','away','aboard','surrender','hail'])W.on(k,d=>check(k,d));
  W.arriveHooks.push(pl=>{entry('Arrived: '+pl.P.name+'.');check('arrive',pl);});
  W.on('docked',st=>entry('Docked at '+st.name+'.'));
  W.on('rescued',t=>entry('Took '+t.name.replace(/^USS /,'the ')+'\'s crew off. All alive.'));
  W.on('wormhole',d=>entry('Through the wormhole: from '+d.from.name.toLowerCase()+' to '+d.to.name.toLowerCase()+'.'));
  W.on('away',a=>entry('Away team down on '+a.body+'.'));
  W.on('aboard',a=>entry('Away team back aboard. '+a.found));
  W.on('surrender',f=>entry('The '+f.K.name+' broke off when we demanded it.'));
  W.on('escort',t=>entry(t.name+' formed up on us.'));
  W.on('scan',d=>{if(d.c&&(d.c.kind==='body'||d.c.kind==='gate'))entry('Scanned '+d.c.name+'.');});
  let foes=0,tk=0;
  animHooks.push(()=>{ly+=S.map.distanceTo(lastMap);lastMap.copy(S.map);
    const n=W.foes?W.foes().length:0;if(n&&!foes)entry('Hostile contact. Red alert.');if(!n&&foes){entry('The hostiles are gone.');W.emit('won');check('won');}foes=n;
    if(++tk%20===0)check('tick');if(P.open()&&(dirty||tk%120===0))render();});

  // ================= the panel =================
  function render(){dirty=false;P.body.innerHTML='';
    P.body.append(el('div','row',[el('span',null,'Stardate '+stardate()),el('span',null,commend+' commendation'+(commend===1?'':'s'))]));
    if(active){const card=el('div','card ok',[el('b',null,active.title),el('div',null,active.brief)]);const ul=el('ul');
      active.steps.forEach((s,i)=>ul.append(el('li',i<active.i?'done':i===active.i?'now':null,s.text)));card.append(ul);
      const st=active.steps[active.i],a=el('div','acts');if(st&&st.go)a.append(button(goLabel(st),()=>{W.audio&&W.audio();st.go();}));a.append(button('Abandon',abandon));card.append(a);P.body.append(card);}
    else if(offered){P.body.append(el('div','card',[el('b',null,'New orders: '+offered.title),el('div',null,offered.brief),
      el('div','acts',[button('Accept',()=>{W.audio&&W.audio();accept();}),button('Something else',decline)])]));}
    const lg=el('div','log');for(const [d,t] of log.slice(0,14))lg.append(el('p',null,[el('em',null,d),t]));
    P.body.append(el('small',null,'Captain\'s log'),log.length?lg:el('div','say','Nothing yet.'),el('small',null,'J opens orders. N scans, H hails, B energises, P is the chart.'));}
  const goLabel=s=>/course|^Go to|^Bring/.test(s.text)?'Lay in a course':/Dock/.test(s.text)?'Dock':/Scan|Sweep/.test(s.text)?'Scan':/Beam/.test(s.text)?'Energise':/Hail/.test(s.text)?'Open comms':/Find/.test(s.text)?'Approach':/Fly into|through/.test(s.text)?'Fly in':/orbit/.test(s.text)?'Go into orbit':/Drive/.test(s.text)?'Fire':'Go';
  W.orderTarget=()=>{const st=active&&active.steps[active.i];return st&&st.target?st.target():null;};
  W.orders={brief:()=>active?'Your orders stand, Enterprise: '+active.steps[active.i].text:offered?'New orders for you, Enterprise: '+offered.brief+' (J to read them.)':'No new orders. Enjoy the quiet.'};
  W.openLog=()=>P.toggle(true);
  addEventListener('keydown',e=>{if(e.repeat||typing(e))return;if(e.key==='j'||e.key==='J'){W.audio&&W.audio();P.toggle();}else if(e.key==='Escape'&&P.open())P.toggle(false);});
  offer();entry('Ship\'s log: the Enterprise, alongside Starbase 1. All systems ready.');
  {const h=new URLSearchParams(location.hash.slice(1)),k=h.get('mission');if(k&&ROTATION.includes(k)){num=0;offer(k);setTimeout(accept,+(h.get('evt')||1.5)*1000);}}
  const state=()=>({active:active&&active.kind,step:active&&active.i,of:active&&active.steps.length,offered:offered&&offered.kind,commend,log:log.length,last:log[0]&&log[0][1]});
  W.orders.state=state;W.orders.next=()=>{const st=active&&active.steps[active.i];if(st&&st.go)st.go();};
  return {toggle:o=>P.toggle(o),
    act:{orders:()=>P.toggle(true),accept,next:()=>{const st=active&&active.steps[active.i];if(st&&st.go)st.go();}},
    hud:()=>active?'orders: '+(active.i+1)+'/'+active.steps.length+' '+active.title.toLowerCase():offered&&S.on?'new orders (J)':'',
    state};
}
