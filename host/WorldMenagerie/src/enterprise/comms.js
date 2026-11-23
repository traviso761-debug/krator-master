// ---------- Galaxy class: communications ----------
// Original work. H (or the Comms button) opens the channels: Starfleet Command, the starbases here, every ship in
// sensor range, and any hostile. Hail one and it answers in its own voice (what it is doing, from its task); ask a
// Federation ship to form up and it becomes an escort (up to three: traffic.js flies them in formation, through warp
// and the wormhole, and has them fire on whatever you are fighting); tell it to resume its duties and it holds
// station where it is. A starbase gives docking clearance. A hostile mostly answers with contempt, but one with its
// hull failing may give up if you demand it, and go.
//
// What is said goes in the panel's transcript and in a toast; hails, form-ups and surrenders are told to the orders
// (W.emit('hail'), 'escort', 'surrender').
import {sidePanel,el,button,typing,seeded} from './ui.js';

export function comms(W){
  const {THREE,animHooks}=W,F=W.fx,V=()=>new THREE.Vector3();
  const P=sidePanel('ent-comms','Comms',o=>{W.onCommsToggle&&W.onCommsToggle(o);if(o){sig='';refresh();}});
  const said=[];let hails=0;
  function chirp(up){const A=W.audio&&W.audio();if(!A)return;const {a,master}=A,t=a.currentTime;
    for(const [f,dt] of up?[[880,0],[1320,0.08]]:[[1320,0],[880,0.08]]){const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(master);
      g.gain.setValueAtTime(0,t+dt);g.gain.linearRampToValueAtTime(0.09,t+dt+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.18);o.start(t+dt);o.stop(t+dt+0.2);}}
  function say(who,text){said.push([who,text]);if(said.length>8)said.shift();W.toast&&W.toast(who,' '+text);chirp(false);sig='';refresh();}

  // what each says
  const line=(t,k)=>{const r=seeded(t.name+k+hails);const pick=a=>a[Math.floor(r()*a.length)];
    const T=t.task;
    if(T.kind==='contact')return ['A long silence. Then a sound like wind chimes, and words put together from our own broadcasts: "You are… loud."',
      '"We have listened to your kind for a long time. You argue with yourselves. We like that."',
      '"Come again, when you are older. Bring nothing that burns." They send a single word, which the computer translates as: welcome.',
      'The chimes again, softer. They seem to be laughing.'][Math.min(3,T.hails-1)];
    if(T.kind==='cargo')return 'Only the probe\'s beacon, repeating its number.';
    if(T.kind==='wreck')return pick(['…main power gone… life support at '+Math.round(T.life||20)+' percent… we have '+(T.crew||40)+' still alive. Please hurry.',
      'This is '+t.name+'. We cannot hold much longer. Can you take us off?']);
    if(T.kind==='escort')return pick(['Holding formation, Enterprise. Say the word.','On your quarter, and staying there.','All quiet back here. We have your stern.']);
    if(T.kind==='park')return pick(['Taking on stores at the starbase. We sail in six hours.','Loading medical supplies for the colonies. Fair winds, Enterprise.']);
    if(T.kind==='transit')return pick(['Passing through to the rim. Nothing to report.','Bound for the sector\'s edge with mail and spares. Good to see you.']);
    if(/orbit/i.test(T.say||''))return pick(['In orbit, mapping the weather systems. It\'s quieter than it looks.','Surveying from orbit. The planet\'s magnetic field is doing something odd.']);
    if(/Survey/.test(T.say||''))return pick(['Survey under way. You would not believe the readings here.','Taking samples. Mind the dust on your way through.']);
    return pick(['On patrol. All quiet in the sector.','Patrol route, as usual. Good hunting, Enterprise.','Nothing on our sensors but you, Enterprise.']);};
  const foeLine=f=>{const n=f.K.name;
    if(n==='Lattice ship')return 'A chord of noise, then: "YOUR SHIP WILL BE MEASURED."';
    if(n==='Kethri dart')return 'A burst of clicks, too fast to follow. The computer cannot make words of it.';
    if(n==='Varr cruiser')return f.hp/f.hp0<0.4?'"You fight well. That will be sung of you, for an hour."':'"You have the look of prey that fights back. Good."';
    return f.hp/f.hp0<0.4?'"All right! All right. Hold your fire."':'"Heave to and drop your shields, Federation."';};

  function hail(c){hails++;chirp(true);if(c.ship&&c.ship.task.kind==='contact')c.ship.task.hails++;W.emit&&W.emit('hail',c);
    if(c.kind==='hq'){say('Starfleet Command',W.orders?W.orders.brief():'No new orders, Enterprise.');return;}
    if(c.kind==='station'){say(c.st.name,'Enterprise, this is '+c.st.name+' approach control. Berth one is yours whenever you want it.');return;}
    if(c.kind==='foe'){say('The '+c.name,foeLine(c.foe));return;}
    say(c.ship.name,line(c.ship,'hail'));}
  function formUp(t){if(!W.traffic.escort(t)){say(t.name,'Your formation is full, Enterprise. We\'ll stay here.');return;}
    say(t.name,'Forming up on you, Enterprise. Where you go, we go.');W.emit&&W.emit('escort',t);}
  function dismiss(t){W.traffic.release(t,'Holding station where the Enterprise left it.');say(t.name,'Understood. Resuming our duties.');}
  function surrender(f){
    if(f.hp/f.hp0>=0.4||f.K.name==='Lattice ship'){say('The '+f.K.name,f.K.name==='Lattice ship'?'Nothing. The noise does not change.':'Laughter, and the channel closes.');return;}
    if(f.flee){say('The '+f.K.name,'They are already running.');return;}
    f.flee=true;f.fleeT=F.T();say('The '+f.K.name,f.K.name==='Varr cruiser'?'"We go. Not because you asked."':'"We\'re leaving! We\'re leaving."');W.emit&&W.emit('surrender',f);}

  // the channels: rebuilt only when who is here changes
  let sig='';
  function channels(){const cs=W.contacts?W.contacts():[];
    return [{kind:'hq',name:'Starfleet Command'},...cs.filter(c=>c.kind==='station'||c.kind==='ship'||c.kind==='foe')];}
  function refresh(){if(!P.open())return;
    const ch=channels(),s=ch.map(c=>c.name+':'+(c.ship?c.ship.task.kind:'')).join('|')+'#'+said.length+(said.length?said[said.length-1][1]:'');
    if(s===sig)return;sig=s;P.body.innerHTML='';
    for(const c of ch){
      const card=el('div','card'+(c.kind==='foe'?' foe':c.kind==='hq'?' ok':''),[el('b',null,c.name)]);
      if(c.kind!=='hq')card.append(el('small',null,' · '+(c.kind==='foe'?'hostile':c.kind==='station'?'starbase':c.ship.task.kind==='escort'?'escort':c.ship.task.kind==='wreck'?'disabled':(/contact|cargo/.test(c.ship.task.kind)?'unknown':'starship'))+' · '+Math.round(c.d/1000).toLocaleString('en')+' km'));
      const a=el('div','acts',[button(c.kind==='hq'?'Open a channel':'Hail',()=>hail(c),'Hail '+c.name)]);
      if(c.kind==='station')a.append(button('Request docking',()=>{W.dock(c.st);say(c.st.name,'Cleared to dock, Enterprise. Follow the beacons in.');}));
      if(c.kind==='ship'&&!/wreck|contact|cargo/.test(c.ship.task.kind))a.append(c.ship.task.kind==='escort'?button('Resume your duties',()=>dismiss(c.ship)):button('Form up on us',()=>formUp(c.ship)));
      if(c.kind==='ship'&&c.ship.task.kind==='wreck'&&W.beam)a.append(button('Beam them aboard',()=>W.beam(c)));
      if(c.kind==='foe')a.append(button('Demand surrender',()=>surrender(c.foe)));
      card.append(a);P.body.append(card);}
    const log=el('div','log');for(const [w,t] of said)log.append(el('p',null,[el('em',null,w),t]));
    if(said.length)P.body.append(el('small',null,'Transcript'),log);
    P.body.append(el('small',null,'H opens comms. Escorts follow you through warp and fire on what you fight.'));}
  let tk=0;animHooks.push(()=>{if(P.open()&&++tk%30===0)refresh();});
  addEventListener('keydown',e=>{if(e.repeat||typing(e))return;if(e.key==='h'||e.key==='H'){W.audio&&W.audio();P.toggle();}else if(e.key==='Escape'&&P.open())P.toggle(false);});
  W.openComms=()=>P.toggle(true);
  const escorts=()=>W.traffic?W.traffic.escorts():[];
  // #ev=formup: the nearest Federation ship here forms up
  const formNearest=()=>{const c=(W.contacts?W.contacts():[]).filter(c=>c.kind==='ship'&&!/escort|wreck|contact|cargo/.test(c.ship.task.kind)).sort((a,b)=>a.d-b.d)[0];if(c)formUp(c.ship);};
  return {toggle:o=>P.toggle(o),say,
    act:{comms:()=>P.toggle(true),formup:formNearest,hailhq:()=>hail({kind:'hq',name:'Starfleet Command'})},
    hud:()=>{const e=escorts();return e.length?'escorts: '+e.map(t=>t.name.replace(/^USS /,'')).join(', '):'';},
    state:()=>({open:P.open(),said:said.length,escorts:escorts().map(t=>t.name)})};
}
