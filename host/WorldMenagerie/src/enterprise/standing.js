// ---------- Galaxy class: standing with the powers, and commendations for conduct ----------
// Original work; the peoples are this project's own. What the ship does is remembered, between visits, in the career
// (orders.js, 'ent-career'): a standing with Starfleet Command and with each people met, and the commendations
// earned for doing things well. Both are shown on the service record.
//
// Standing (W.standing.get/add, and W.emit('standing',{who,d,why}) from any module: a call for help used for small
// things lowers Command's) moves with what is done:
//   Starfleet Command  up for every mission done and every commendation, down for orders abandoned and incidents; it
//                      is what buys refits at a starbase (refit.js).
//   the Ossari         a first contact made well opens their traffic and trade (an Ossari trader at quiet places,
//                      who trades a gift for a hail: comms.js); weapons fired while an Ossari ship looks on, with
//                      nothing hostile about, makes them wary of us, and they say so when hailed.
//   the Kethri         remember who broke a swarm: every one broken makes the next swarm bigger (orders.js).
//   the Varr           a captain hunted down is a blood debt; a surrender accepted is respected. Deep enough in their
//                      debt, a Varr cruiser comes with the raiders.
//
// Commendations (MARKS): first contact with no shot fired, a rescue with no one lost, a swarm broken with the shields
// above half, a battle won without a scratch, a surrender accepted, a quarrel aboard made into a friendship, an away
// team's best outcome, every place on the chart visited, docking at Deep Space 9. Each is logged, toasted and counted.
import {PLACES} from './places.js';
import {el,seeded} from './ui.js';

const WHO={starfleet:'Starfleet Command',ossari:'the Ossari',kethri:'the Kethri',varr:'the Varr'};
const START={starfleet:1,ossari:0,kethri:-3,varr:-2};
const MARKS={holdfire:'First contact, no shot fired',noloss:'A rescue with no one lost',shields:'A swarm broken, shields above half',
  unscathed:'A battle won without a scratch',mercy:'A surrender accepted',diplomat:'Enemies at dinner, friends at the door',
  away:'An away team\'s finest hour',pathfinder:'Every place on the chart visited',ds9:'Docked at Deep Space 9'};
const ONCE=['pathfinder','ds9'];

export function standing(W){
  const C=()=>{const c=W.career?W.career():{};if(!c.standing)c.standing={};for(const k in START)if(c.standing[k]==null)c.standing[k]=START[k];
    if(!c.marks)c.marks={};if(!c.met)c.met=[];return c;};
  const clamp=x=>Math.max(-10,Math.min(10,x));
  const norm=w=>{w=String(w||'').toLowerCase();return /starfleet|command|^hq$/.test(w)?'starfleet':/ossari/.test(w)?'ossari':/kethri/.test(w)?'kethri':/varr/.test(w)?'varr':w;};
  function get(who){return C().standing[norm(who)]||0;}
  function add(who,d,why){who=norm(who);if(!d)return;const c=C(),was=c.standing[who]==null?0:c.standing[who];c.standing[who]=clamp(was+d);
    const L0=label(who,was),L1=label(who);
    if(W.logEntry&&why)W.logEntry('Standing with '+(WHO[who]||who)+(d>0?' rises':' falls')+': '+why+'.'+(L0!==L1?' We are '+L1+' with them now.':''));
    else if(W.logEntry&&L0!==L1)W.logEntry('We are '+L1+' with '+(WHO[who]||who)+' now.');
    if(L0!==L1)W.toast&&W.toast('Standing',' '+(WHO[who]||who).replace(/^./,c=>c.toUpperCase())+': '+L1+'.');}
  function label(who,v){v=v==null?get(who):v;
    if(who==='starfleet')return v<0?'under a cloud':v<3?'in good standing':v<6?'well regarded':'held in high regard';
    if(who==='ossari'&&!C().met.includes('ossari'))return 'not yet met';
    return v<=-6?'hostile':v<=-2?'wary':v<2?'neutral':v<6?'cordial':'allied';}
  // how much bigger a people's next fight is, for the grudge they hold (0 to 3)
  const grudge=who=>Math.max(0,Math.min(3,Math.floor((-get(who)-2)/2)));
  W.standing={get,add,label,grudge,who:()=>Object.keys(WHO)};
  W.on('standing',s=>{if(s)add(s.who,+s.d||0,s.why);});

  // ---- commendations ----
  function mark(id,why){const c=C();if(ONCE.includes(id)&&c.marks[id])return;c.marks[id]=(c.marks[id]||0)+1;
    W.logEntry&&W.logEntry('Commendation: '+MARKS[id]+(why?' ('+why+')':'')+'.');W.toast&&W.toast('Commendation',' '+MARKS[id]+'.');
    add('starfleet',1,null);W.saveCareer&&W.saveCareer();}
  W.mark=mark;

  // what a mission has seen: shots fired, the lowest hull, the lowest shields while fighting, anyone hurt
  let ms=null;const fresh=m=>({m,shots:0,hull:W.hull?W.hull():100,sh:100,hurt:0});
  W.on('accepted',m=>{ms=fresh(m);});
  W.on('injured',x=>{if(ms)ms.hurt+=x.n;});
  {const f0=W.fire;if(f0)W.fire=(...a)=>{if(ms)ms.shots++;watchFire();return f0(...a);};}
  W.on('abandoned',()=>{add('starfleet',-1,'orders abandoned');ms=null;});
  W.on('mission',m=>{const s=ms&&ms.m===m?ms:null;ms=null;
    add('starfleet',1,null);
    if(m.kind==='contact'){C().met.includes('ossari')||C().met.push('ossari');add('ossari',s&&s.shots?1:3,s&&s.shots?'a first contact, with weapons fired nearby':'a first contact made well');
      if(s&&!s.shots)mark('holdfire');}
    if((m.kind==='rescue'||m.kind==='evacuate')&&s&&!s.hurt&&s.hull>=50)mark('noloss');
    if(m.kind==='swarm'){add('kethri',-2,'we broke one of their swarms. The Kethri remember');if(s&&s.sh>=50&&s.hull>=99)mark('shields');}
    if(m.kind==='hunt')add('varr',-2,'we brought one of their captains to battle');});
  W.on('surrender',f=>{mark('mercy','the '+f.K.name);if(/Varr/.test(f.K.name))add('varr',1,'we let one of theirs go with honour');});
  W.on('settled',o=>{if(o&&o.good>=2)mark('diplomat');});
  W.on('awaychoice',o=>{if(o&&o.good>=2)mark('away',o.body);});
  W.on('docked',st=>{if(st&&st.n==='ds9')mark('ds9');});
  W.arriveHooks.push(()=>{const v=C().visited||[];if(PLACES.every(p=>v.includes(p.id)))mark('pathfinder');});
  // a fight: the hull and shields at their lowest, for 'unscathed' and the swarm's
  let fight=null;
  W.animHooks.push(()=>{const n=W.foes?W.foes().length:0,h=W.hull?W.hull():100,ss=W.shieldsState?W.shieldsState():{up:false,str:100};
    if(n&&!fight)fight={h0:h,h};if(fight){fight.h=Math.min(fight.h,h);}
    if(ms){ms.hull=Math.min(ms.hull,h);if(n&&ss.up)ms.sh=Math.min(ms.sh,ss.str);}
    if(!n&&fight&&(W.flight.warp||W.spooling))fight=null;});   // left behind at warp: not won
  W.on('won',()=>{if(fight&&fight.h>=fight.h0&&fight.h0>=99)mark('unscathed');fight=null;});

  // ---- the Ossari: weapons fired where they can see ----
  let lastWatch=-1e9;
  function watchFire(){const now=performance.now();if(now-lastWatch<15000)return;
    if(W.foes&&W.foes().length)return;
    const oss=W.traffic&&W.traffic.here().find(t=>t.cls==='ossari');if(!oss)return;lastWatch=now;
    C().met.includes('ossari')||C().met.push('ossari');add('ossari',-6,'they saw us fire our weapons, with nothing to fire at');}

  // ---- Ossari traders: at quiet places, once the Ossari are cordial ----
  const traders=new Map();
  W.arriveHooks.push(pl=>{if(get('ossari')<2||!C().met.includes('ossari')||!W.traffic)return;const id=pl.P.id;
    if(traders.has(id)||!/rogue|eye|disc|pulsar|comet|binary|nebula|shattered|colony|ocean|giant|ds9/.test(id))return;
    const r=seeded('trader'+(W.runSeed||'')+id);if(r()>0.55){traders.set(id,null);return;}
    const n=['Gathered Light','Slow River','Many Hands','Warm Stone'][Math.floor(r()*4)],R=5000+r()*3000,c=new W.THREE.Vector3(14000+r()*6000,(r()-0.5)*2000,(r()-0.5)*14000);
    // a slow circle (traffic.js's loop), marked as a trader for comms.js
    const t=W.traffic.spawn(pl,'ossari',{kind:'loop',trader:true,c:()=>c,r:R,w:40/R,a:r()*6,n:new W.THREE.Vector3(0,1,0),say:'An Ossari trader, its sails half furled. It is open to visitors.'},['The Ossari trader '+n,'','ossari']);
    t.g.traverse(o=>{o.userData.noWire=true;});t.traded=false;traders.set(id,t);
    W.toast&&W.toast('Sensors',' An Ossari trader is here. Since our first contact, they come where we are. Hail it (H).');});

  // ---- the service record ----
  (W.recordExtras=W.recordExtras||[]).push(()=>{const c=C(),out=[el('small',null,'Standing')];
    for(const k of Object.keys(WHO))out.push(el('div','row',[el('span',null,WHO[k].replace(/^./,x=>x.toUpperCase())),el('b',null,label(k)+(k==='ossari'&&!c.met.includes('ossari')?'':' ('+(get(k)>0?'+':'')+get(k)+')'))]));
    const ms=Object.entries(c.marks).filter(([k])=>MARKS[k]);
    out.push(el('small',null,'Commendations for conduct'));
    if(!ms.length)out.push(el('div','say','None yet: no shot fired at a first contact, a rescue with no one lost, a swarm broken with the shields above half...'));
    for(const [k,n] of ms)out.push(el('div','row',[el('span',null,MARKS[k]),el('b',null,n>1?'×'+n:'★')]));
    if(c.treated)out.push(el('div','row',[el('span',null,'Crew treated in sickbay'),el('b',null,String(c.treated))]));
    return out;});

  return {act:{standing:()=>{W.openLog&&W.openLog();},mercy:()=>mark('mercy'),ossarifriend:()=>{C().met.includes('ossari')||C().met.push('ossari');add('ossari',4,'a test');}},
    hud:()=>'',state:()=>({standing:{...C().standing},marks:{...C().marks},traders:[...traders.keys()].filter(k=>traders.get(k))})};
}
