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
// Every visit is dealt a different run of orders: the session has a seed of its own (#mseed=<anything> fixes it, for
// tests), the kinds come in a shuffled order, and each mission draws its places, ships, cargo, ambushes and odds from
// that seed. For tests: #mission=<kind> (any of KINDS) accepts that one at once.
import {PLACES} from './places.js';
import {STATIONS,stationName} from './starbases.js';
import {sidePanel,el,button,typing,seeded} from './ui.js';

const WRECKS=[['USS Wren','NCC-80211','kestrel'],['USS Sable Point','NCC-77140','tamar'],['USS Ostrander','NCC-69902','meridian'],['USS Lodestar','NCC-74418','halyard']];
const TRANSPORTS=[['USS Bellwether','NCC-61120','halyard'],['USS Merrow','NCC-61307','halyard'],['USS Kittiwake','NCC-62044','halyard']];
const CARGO=['vaccines for the outer colonies','spare parts for a starbase\'s reactor','a diplomatic pouch','seed stock for a new colony','a relief team of doctors'];
const SURVEY=['comet','binary','nebula','hole','pulsar','disc','eye','rogue','lava','ice'];
const KINDS=['rescue','survey','escort','defend','wormhole','deliver','patrol','contact','probe','evacuate','swarm','storm','relic','hunt'];
const VARR=['Kesh Tal-Varo','Dagh the Unbent','Oru Sevanne','Tarvek of the Long Night'];
const PROBES=['Wayfarer 9','Lantern 14','Meridian Deep 3','Pathfinder 22'];
const PEACEFUL=['rogue','eye','disc','pulsar','relic','comet','binary','nebula','shattered'];

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
  // dock at any starbase: the nearest here, or the course home; never pressed again into a cast-off or a cancel
  // (none here: a course for the nearest place that has one, and docking on arrival)
  let dockOnArrival=false;
  const docked=()=>W.dockPhase&&W.dockPhase()==='docked'&&W.dockTarget();
  const dockAny=()=>{if(docked()){W.emit('docked',docked());return;}if(W.dockPhase&&W.dockPhase())return;if(W.stations.some(s=>s.place===W.herePlace())){W.dock();return;}
    const near=STATIONS.map(s=>place(s.place)).sort((a,b)=>S.map.distanceTo(new THREE.Vector2(...a.ly))-S.map.distanceTo(new THREE.Vector2(...b.ly)))[0];
    dockOnArrival=true;W.course.set(near);};
  W.arriveHooks.push(()=>{if(dockOnArrival){dockOnArrival=false;setTimeout(dockAny,1500);}});
  // energise at a ship: from close enough at once, from further off the autopilot brings her in first
  const beamAt=t=>{const c=t&&W.contacts().find(c=>c.ship===t);if(!c)return;if(c.d<3800){W.beam(c);return;}
    W.goto({name:c.name,pos:()=>t.g.getWorldPosition(V()),stop:2500,done:()=>W.beam(c)});};
  // things put ahead of the ship wait until she has stopped coasting out of warp (she runs on a long way, and would
  // pass them), or forty-five seconds; and only at the place they belong (left before then, they wait for her return)
  const whenSlow=(Pl,fn)=>{let t0=performance.now();const m0=active,iv=setInterval(()=>{if(active!==m0){clearInterval(iv);return;}
    if(here()!==Pl.id||S.warp||W.spooling){t0=performance.now();return;}
    if(S.v<600||performance.now()-t0>45000){clearInterval(iv);fn();}},250);};
  // the fights a mission has set: each comes when the ship is at its place and out of warp; one she left before it
  // began, or warped away from, comes again when she is back (flag.on is true while it is under way)
  let fights=[];
  const arm=(f,delay)=>{const m0=active;setTimeout(function tryIt(){if(active!==m0||f.flag.on||here()!==f.Pl.id)return;
    if(S.warp||W.spooling){setTimeout(tryIt,500);return;}f.spawn();f.flag.on=true;},delay);};
  const fight=(Pl,spawn,flag,delay)=>{const f={Pl,spawn,flag,m:active};fights.push(f);arm(f,delay);};
  W.arriveHooks.push(()=>{for(const f of fights)if(f.m===active&&!f.flag.on&&here()===f.Pl.id)arm(f,3500);});
  const dockAt=n=>()=>{const d=docked();if(d&&d.n===n){W.emit('docked',d);return;}if(here()===stPlace(n)){const st=W.stations.find(s=>s.n===n);if(st)W.dock(st);}else W.course.set(place(stPlace(n)));};

  // ================= the missions =================
  let num=0,offered=null,active=null,spawned=[];
  const SEED=new URLSearchParams(location.hash.slice(1)).get('mseed')||Math.random().toString(36).slice(2);
  // the order the kinds come in this time: a shuffle, dealt again when it runs out (never the same kind twice running)
  const deck=[];const deal=()=>{const r=seeded('deck'+SEED+num),d=KINDS.slice();for(let i=d.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
    deck.push(...d);};
  let lastKind=null;
  const nextKind=()=>{if(!deck.length)deal();if(deck[0]===lastKind&&deck.length>1)deck.push(deck.shift());return lastKind=deck.shift();};
  function make(kind){
    const r=seeded('orders'+SEED+num+kind),pk=a=>a[Math.floor(r()*a.length)],not=a=>a.filter(x=>x!==here());
    const arrive=Pl=>({text:'Set a course for '+Pl.name.replace(/^Home: .*/,'home')+'.',test:(e,d)=>e==='arrive'&&d.P.id===Pl.id||e==='tick'&&here()===Pl.id&&W.herePlace().group.visible,go:course(Pl)});
    if(kind==='rescue'){
      const Pl=place(pk(not(['giant','ice','comet','belt','ocean','rogue','lava']))),[nm,reg,cls]=pk(WRECKS);let wreck=null;
      const m={kind,title:'Distress call: the '+nm,brief:'The '+nm+' ('+reg+') has lost main power at '+Pl.name.replace(/^An? /,'the ').toLowerCase()+'. Life support is failing. Get her crew off.',steps:[
        {...arrive(Pl),done:()=>whenSlow(Pl,()=>{const pl=W.herePlace(),f=V().set(1,0,0).applyQuaternion(ROOT.quaternion),s=V().set(0,0,1).applyQuaternion(ROOT.quaternion);
          const at=pl.group.worldToLocal(ROOT.position.clone().addScaledVector(f,9000).addScaledVector(s,2500).add(V().set(0,600,0)));
          wreck=W.traffic.wreck(pl,cls,at,[nm,reg,cls]);wreck.task.crew=20+Math.floor(r()*70);wreck.task.life=12+Math.round(r()*20);spawned.push(wreck);
          F.note('Sensors: a ship dead ahead, nine kilometres. No main power. It is the '+nm+'.');})},
        {text:'Find the '+nm+': scan her (N), or come within five kilometres.',target:()=>wreck&&wreck.name,
          test:(e,d)=>wreck&&(e==='scan'&&d.c&&d.c.ship===wreck||e==='tick'&&wreck.g.getWorldPosition(V()).distanceTo(ROOT.position)<5000),
          go:()=>{const c=W.contacts().find(c=>c.ship===wreck);if(c)W.goContact(c);}},
        {text:'Beam her crew aboard (B, within five kilometres).',target:()=>wreck&&wreck.name,test:(e,d)=>e==='rescued'&&d===wreck,
          go:()=>beamAt(wreck),
          done:()=>{if(r()<0.65){m.steps.splice(m.i+1,0,{text:'Raiders followed her distress call: drive them off.',test:e=>e==='won'});
            const pid=here();setTimeout(()=>{if(active!==m)return;if(here()!==pid||S.warp){check('won');return;}W.HO.contact();setTimeout(()=>W.HO.contact(),2500);},3500);}}},
        {text:'Take the survivors to a starbase: dock at any.',test:e=>e==='docked',go:dockAny}]};
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
      const Pl=place(pk(not(['giant','ice','ocean','lava','belt','comet']))),hard=num>3;const fl={on:false};
      return {kind,title:'Raiders at '+Pl.name.replace(/^An? /,'the ').replace(/^Home: .*/,'home').toLowerCase(),brief:'Raiders are preying on shipping at '+Pl.name.replace(/^An? /,'the ').toLowerCase()+'. Drive them off.'+(hard?' A Varr cruiser has been seen with them.':''),steps:[
        {...arrive(Pl),done:()=>fight(Pl,()=>{W.HO.contact();setTimeout(()=>W.HO.contact(hard?'varr':'raider'),3000);},fl,4000)},
        {text:'Drive them off.',test:e=>e==='won'&&fl.on,go:()=>{W.flight.on||W.startFlight();if(W.enemy)W.fire('phasers');}}]};}
    if(kind==='deliver'){
      const s=pk(STATIONS.filter(s=>s.place!==here()||r()<0.2)),cargo=pk(CARGO);
      return {kind,title:'Deliver '+cargo.split(' for ')[0].replace(/^an? /,''),brief:'Carry '+cargo+' to '+stName(s.n)+'.',steps:[
        {text:'Dock at '+stName(s.n)+' (K when you are there).',test:(e,d)=>e==='docked'&&d.n===s.n,go:dockAt(s.n),target:()=>stName(s.n)}]};}
    // helpers for the new kinds: a contact here by name, going to it, orbiting a world, a fight when the ship gets there
    const find=n=>W.contacts().find(c=>c.name===n),goTo=n=>()=>{const c=find(n);if(c)W.goContact(c);};
    const nm=Pl=>Pl.name.replace(/^Home: .*/,'home').replace(/^Inside an? /,'the ').replace(/^An? /,'the ').replace(/^The /,'the ');
    const ambush=(Pl,spawn,flag)=>fight(Pl,spawn,flag,3500+r()*3000);
    if(kind==='patrol'){
      const ps=[];const pool=not(PLACES.filter(p=>!p.link).map(p=>p.id));while(ps.length<3){const p=pk(pool);if(!ps.includes(p))ps.push(p);}
      const [A,B,C]=ps.map(place);
      return {kind,title:'Patrol: '+[A,B,C].map(p=>nm(p).replace(/^the /,'')).join(', '),brief:'Raiders have been seen along the frontier. Show the flag at '+nm(A)+', '+nm(B)+' and '+nm(C)+', and sweep each with sensors.',steps:[
        arrive(A),{text:'Sweep '+nm(A)+' with sensors.',test:(e,d)=>e==='scan'&&!d.c&&d.place===A.id,go:()=>W.scan(null)},
        arrive(B),{text:'Sweep '+nm(B)+'.',test:(e,d)=>e==='scan'&&!d.c&&d.place===B.id,go:()=>W.scan(null),
          done:()=>{if(r()<0.5){const fl={on:false};m_ins({text:'Raiders, lying in wait: drive them off.',test:e=>e==='won'&&fl.on});ambush(B,()=>{W.HO.contact();W.HO.contact();},fl);}}},
        arrive(C),{text:'Sweep '+nm(C)+'.',test:(e,d)=>e==='scan'&&!d.c&&d.place===C.id,go:()=>W.scan(null)}]};}
    if(kind==='contact'){
      const Pl=place(pk(not(PEACEFUL)));let oss=null;
      return {kind,title:'First contact',brief:'An unknown ship has been seen at '+nm(Pl)+', watching our traffic. It has done nothing hostile. Make contact, and make it a good one.',steps:[
        {...arrive(Pl),done:()=>whenSlow(Pl,()=>{oss=W.ossari();spawned.push(oss);})},
        {text:'Hold your fire and hail it (H).',target:()=>oss&&oss.name,test:(e,d)=>e==='hail'&&oss&&d.ship===oss,go:()=>W.openComms()},
        {text:'Scan it: politely, at a distance (N).',target:()=>oss&&oss.name,test:(e,d)=>e==='scan'&&oss&&d.c&&d.c.ship===oss,go:()=>{const c=oss&&find(oss.name);if(c)W.scan(c);}},
        {text:'Keep talking until they answer properly.',target:()=>oss&&oss.name,test:(e,d)=>e==='hail'&&oss&&d.ship===oss&&oss.task.hails>=3,go:()=>W.openComms(),
          done:()=>{const m0=active;setTimeout(()=>{if(oss&&active===m0){W.traffic.leave(oss);F.note('The Ossari ship has gone to warp. It left behind a gift: a seed, in a shell of something like glass.');}},7000);}}]};}
    if(kind==='probe'){
      const Pl=place(pk(not(['comet','binary','belt','nebula','pulsar','disc','eye','rogue','relic','shattered','storm']))),pn=pk(PROBES);let pr=null;const fl={on:false},swarmIt=r()<0.45;
      const m={kind,title:'Recover the probe '+pn,brief:'The survey probe '+pn+' went quiet at '+nm(Pl)+' with eleven years of readings aboard. Bring it home.',steps:[
        {...arrive(Pl),done:()=>whenSlow(Pl,()=>{pr=W.traffic.stranger('probe',{kind:'cargo',say:'Its beacon still blinks its number. It is drifting.'},'Probe '+pn,7500,2200);spawned.push(pr);
          F.note('Sensors: the probe\'s beacon, seven kilometres ahead.');})},
        {text:'Find it: scan it (N), or come within four kilometres.',target:()=>pr&&pr.name,test:(e,d)=>pr&&(e==='scan'&&d.c&&d.c.ship===pr||e==='tick'&&all(pr)&&pr.g.getWorldPosition(V()).distanceTo(ROOT.position)<4000),
          go:()=>{const c=pr&&find(pr.name);if(c)W.goContact(c);}},
        {text:'Beam it aboard (B, within four kilometres).',target:()=>pr&&pr.name,test:(e,d)=>e==='recovered'&&d===pr,go:()=>beamAt(pr),
          done:()=>{if(swarmIt){m_ins({text:'Something followed its signal: a Kethri swarm. Fight them off.',test:e=>e==='won'&&fl.on});ambush(Pl,()=>W.HO.swarm(4+Math.floor(r()*3)),fl);}}}]};
      return m;}
    if(kind==='evacuate'){
      const [pid,body,why]=pk([['colony','New Arden','a quake has levelled the colony\'s eastern towns'],['ocean','the water world','a storm surge has drowned the island settlements'],
        ['ice','the ice world','the research station\'s reactor is failing'],['farside','the uncharted world','a survey team is stranded and hurt']].filter(x=>x[0]!==here()));const Pl=place(pid);
      return {kind,title:'Evacuate '+body.replace(/^the /,''),brief:'On '+body+', '+why+'. Get a medical team down and the injured up.',steps:[
        pid==='farside'?{...arrive(place('gate')),text:'Go to the wormhole: they are on its far side.'}:arrive(Pl),
        ...(pid==='farside'?[{text:'Fly through the wormhole.',test:(e,d)=>e==='wormhole'&&d.to.id==='farside',go:goTo('the wormhole'),target:()=>'the wormhole'}]:[]),
        {text:'Go into standard orbit over '+body+' (O).',target:()=>body,test:e=>e==='tick'&&here()===pid&&S.orbit&&S.orbit.b&&S.orbit.b.name===body,go:goTo(body)},
        {text:'Beam down a medical team (B).',test:e=>e==='away'&&here()===pid,go:()=>W.beam()},
        {text:'Bring them up, with the injured (B).',test:e=>e==='aboard',go:()=>W.beam(),done:()=>F.note('Sickbay reports three hundred and twelve aboard. Every bed full, and the corridors.')},
        {text:'Take them to a starbase: dock at any.',test:e=>e==='docked',go:dockAny}]};}
    if(kind==='swarm'||kind==='hunt'){
      const Pl=place(pk(not(['giant','ice','ocean','lava','belt','comet','shattered','relic','colony']))),fl={on:false},cap=pk(VARR);
      return {kind,title:kind==='swarm'?'The swarm at '+nm(Pl):'Hunt the '+cap,brief:kind==='swarm'?'A Kethri swarm has been stripping ships at '+nm(Pl)+'. Go and end it.':
        'The Varr raider-captain '+cap+' has been burning colony ships. Starfleet has a fix on '+(cap.split(' ')[0])+'\'s cruiser at '+nm(Pl)+'. Bring it to battle.',steps:[
        {...arrive(Pl),done:()=>ambush(Pl,()=>{if(kind==='swarm')W.HO.swarm(5+Math.floor(r()*3));else{W.HO.contact('varr');if(r()<0.5)setTimeout(()=>W.HO.contact('raider'),3000);}},fl)},
        {text:kind==='swarm'?'Destroy the swarm (shields up: Z).':'Defeat '+cap+'\'s cruiser, or make it run.',test:e=>e==='won'&&fl.on,go:()=>{if(!W.shieldsState().up)W.toggleShields();}}]};}
    if(kind==='storm'){
      const fl={on:false};
      return {kind,title:'Into the ion storm',brief:'The Science Council wants readings from the eye of the ion storm, where no probe has survived. The Enterprise can.',steps:[
        arrive(place('storm')),
        {text:'Fly into the eye of the storm.',target:()=>'the eye of the storm',test:e=>{if(e!=='tick'||here()!=='storm')return false;const c=find('the eye of the storm');return c&&c.d<5000;},go:goTo('the eye of the storm')},
        {text:'Take readings: sweep the storm (N, then Sweep).',test:(e,d)=>e==='scan'&&!d.c&&d.place==='storm',go:()=>W.scan(null),
          done:()=>{if(r()<0.5){m_ins({text:'Kethri darts hiding in the storm: fight them off.',test:e=>e==='won'&&fl.on});ambush(place('storm'),()=>W.HO.swarm(4),fl);}}},
        {text:'Bring the readings to a starbase: dock at any.',test:e=>e==='docked',go:dockAny}]};}
    if(kind==='relic'){
      return {kind,title:'The ancient ring',brief:'Long-range sensors say the ancient ring\'s hub has woken up: power, for the first time in recorded history. Find out why.',steps:[
        arrive(place('relic')),
        {text:'Scan the hub (N).',target:()=>'the hub',test:(e,d)=>e==='scan'&&d.c&&d.c.name==='the hub',go:()=>{const c=find('the hub');if(c)W.scan(c);}},
        {text:'Go into orbit over the hub and send a team in (O, then B).',target:()=>'the hub',test:e=>e==='away'&&here()==='relic',go:goTo('the hub')},
        {text:'Bring them back (B).',test:e=>e==='aboard',go:()=>W.beam(),done:()=>{const m0=active;if(r()<0.6)setTimeout(()=>{if(active===m0&&here()==='relic'&&!S.warp)W.HO.contact('lattice');},5000);}}]};}
    // the wormhole
    return {kind:'wormhole',title:'Beyond the wormhole',brief:'Nobody has been through the wormhole and come back with readings. Go through, survey what is on the far side, put a team down and come home.',steps:[
      arrive(place('gate')),
      {text:'Fly into the wormhole.',test:(e,d)=>e==='wormhole'&&d.to.id==='farside',go:()=>{const c=W.contacts().find(c=>c.kind==='gate');if(c)W.goContact(c);},target:()=>'the wormhole'},
      {text:'Scan the uncharted world (N).',test:(e,d)=>e==='scan'&&d.place==='farside'&&d.c&&d.c.kind==='body',go:()=>{const c=W.contacts().find(c=>c.kind==='body');if(c)W.scan(c);},target:()=>'the uncharted world'},
      {text:'Go into orbit over it (O) and send an away team down (B).',test:e=>e==='away'&&here()==='farside',go:()=>{const c=W.contacts().find(c=>c.kind==='body');if(c)W.goContact(c);}},
      {text:'Bring the team back up (B).',test:e=>e==='aboard'},
      {text:'Come home through the wormhole.',test:(e,d)=>e==='wormhole'&&d.to.id==='gate',go:()=>{const c=W.contacts().find(c=>c.kind==='gate');if(c)W.goContact(c);},target:()=>'the wormhole'}]};
  }
  function m_ins(step){if(active)active.steps.splice(active.i+1,0,step);dirty=true;}
  const all=t=>W.traffic.all.includes(t);
  function offer(kind){num++;offered=make(kind||nextKind());dirty=true;}
  function accept(){if(!offered)return;
    for(const t of spawned)if(all(t)&&t.task.kind!=='escort')W.traffic.remove(t);spawned=[];fights=[];dockOnArrival=false;
    active=offered;offered=null;active.i=0;entry('New orders: '+active.title+'. '+active.brief);
    W.toast&&W.toast('Starfleet Command',' '+active.brief);fanfare(false);check('tick');dirty=true;}
  function decline(){offer();}
  function abandon(){if(!active)return;entry('Orders abandoned: '+active.title+'.');active=null;fights=[];dockOnArrival=false;offer();}
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
  for(const k of ['scan','rescued','recovered','docked','escort','wormhole','away','aboard','surrender','hail'])W.on(k,d=>check(k,d));
  W.arriveHooks.push(pl=>{entry('Arrived: '+pl.P.name+'.');check('arrive',pl);});
  W.on('docked',st=>entry('Docked at '+st.name+'.'));
  W.on('rescued',t=>entry('Took '+t.name.replace(/^USS /,'the ')+'\'s crew off. All alive.'));
  W.on('wormhole',d=>entry('Through the wormhole: from '+d.from.name.toLowerCase()+' to '+d.to.name.toLowerCase()+'.'));
  W.on('away',a=>entry('Away team down on '+a.body+'.'));
  W.on('aboard',a=>entry('Away team back aboard. '+a.found));
  W.on('surrender',f=>entry('The '+f.K.name+' broke off when we demanded it.'));
  W.on('escort',t=>entry(t.name+' formed up on us.'));
  W.on('recovered',t=>entry('Brought '+t.name.toLowerCase().replace(/^probe/,'the probe')+' aboard.'));
  W.on('ossari',t=>entry('First sight of an Ossari ship: '+t.name.replace(/^The Ossari vessel /,'')+'. Hailing frequencies open.'));
  W.on('scan',d=>{if(d.c&&(d.c.kind==='body'||d.c.kind==='gate'))entry('Scanned '+d.c.name+'.');});
  let foes=0,tk=0;
  animHooks.push(()=>{ly+=S.map.distanceTo(lastMap);lastMap.copy(S.map);
    // gone because we went to warp is not driven off
    const n=W.foes?W.foes().length:0;if(n&&!foes)entry('Hostile contact. Red alert.');
    if(!n&&foes){if(S.warp||W.spooling){entry('We left the hostiles behind.');for(const f of fights)if(f.m===active&&f.flag.on)f.flag.on=false;}else{entry('The hostiles are gone.');W.emit('won');check('won');}}foes=n;
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
  {const h=new URLSearchParams(location.hash.slice(1)),k=h.get('mission');if(k&&KINDS.includes(k)){num=0;offer(k);setTimeout(accept,+(h.get('evt')||1.5)*1000);}}
  const state=()=>({active:active&&active.kind,step:active&&active.i,of:active&&active.steps.length,offered:offered&&offered.kind,commend,log:log.length,last:log[0]&&log[0][1]});
  W.orders.state=state;W.orders.next=()=>{const st=active&&active.steps[active.i];if(st&&st.go)st.go();};
  return {toggle:o=>P.toggle(o),
    act:{orders:()=>P.toggle(true),accept,next:()=>{const st=active&&active.steps[active.i];if(st&&st.go)st.go();}},
    hud:()=>active?'orders: '+(active.i+1)+'/'+active.steps.length+' '+active.title.toLowerCase():offered&&S.on?'new orders (J)':'',
    state};
}
