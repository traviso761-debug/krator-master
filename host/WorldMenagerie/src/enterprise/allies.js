// ---------- Galaxy class: calling for help ----------
// Original work. Call for help (the Tactical panel, or W.callHelp): a Starfleet ship comes to fight beside the
// Enterprise, as an escort does (traffic.js: she keeps a slot off the quarter and fires on whatever the Enterprise is
// fighting). If one of the fleet is here already she breaks off what she was doing; if not, the nearest one answers
// and is out of warp beside you in about eight seconds.
//
// Starfleet Command keeps count. A call against something the Enterprise could have handled alone (no hostiles at all,
// or a raider or two) costs standing with Command, and so does a second call within five minutes; a call against a
// Lattice ship, a Varr cruiser or four ships or more costs nothing. (The standing itself is kept by the career:
// this module only says what happened, W.emit('standing', {who: 'command', d, why}).)
//
// With no warp core (fuel.js) the one who answers is a fleet tender, and she tows: warp 2 at most, until a starbase
// fits a new core. When the fight is over, and twenty seconds have passed quietly, the ship that came wishes you well
// and goes back to what she was doing (or to warp).
const THREAT={raider:1,'Varr cruiser':3,'Kethri dart':0.5,'Lattice ship':8,'stolen courier':0.5};
const FLEET=['kestrel','meridian','tamar','corvid','halyard','anvil'];

export function allies(W){
  const {THREE,ROOT,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  let ally=null,lastCall=-1e9,calls=0;   // (times on the events' clock, in seconds)
  const say=(who,m)=>W.toast&&W.toast(who,' '+m);
  const threat=()=>(W.foes?W.foes():[]).reduce((a,f)=>a+(THREAT[f.K.name]||1),0);
  function callHelp(){
    if(ally){say('Comms',ally.t.name+' is already with us.');return false;}
    if(S.warp){say('Comms','Not at warp: drop out first, so they can find us.');return false;}
    const tow=W.fuel&&!W.fuel.core(),th=threat(),now=F.T(),soon=now-lastCall<300;lastCall=now;calls++;
    // what it costs with Command
    const small=!tow&&th<2,why=small?(th?'called a starship off her duties for '+(th<=1?'a single raider':'a small fight'):'called a starship off her duties with no enemy in sight'):soon?'a second call for help within minutes':'';
    if(why){W.emit&&W.emit('standing',{who:'command',d:small&&soon?-2:-1,why});say('Starfleet Command','Request granted, Enterprise. Command notes that you '+why+'.');}
    // one of the fleet here already, not busy with anything of her own?
    const here=W.traffic.here().filter(t=>FLEET.includes(t.cls)&&!/escort|wreck/.test(t.task.kind)&&t.task.kind!=='park'&&(!tow||t.cls==='anvil'));
    if(here.length){const t=here.sort((a,b)=>a.g.getWorldPosition(V()).distanceTo(ROOT.position)-b.g.getWorldPosition(V()).distanceTo(ROOT.position))[0];
      if(!W.traffic.escort(t)){say('Comms','There is no room in the formation: release an escort first.');return false;}
      ally={t,local:true,quiet:now,task:t.task};say(t.name,tow?'We have you, Enterprise. Stand by for a tow.':'Breaking off. On our way to you, Enterprise.');W.emit&&W.emit('allied',t);return true;}
    // or the nearest one, out of warp beside her
    const cls=tow?'anvil':th>=4?'meridian':'kestrel',pl=W.herePlace();
    say('Comms',tow?'A fleet tender answers: eight seconds out.':'The nearest starship answers: eight seconds out.');
    ally={pending:true,quiet:now,due:now+8,go:()=>{if(W.herePlace()!==pl||S.warp){ally=null;return;}
      const t=W.traffic.spawn(pl,cls,{kind:'loop',c:()=>V(),r:1,w:0,a:0,n:V().set(0,1,0),say:'Answering the Enterprise\'s call.'});
      if(!W.traffic.escort(t)){W.traffic.remove(t);ally=null;say('Comms','There is no room in the formation: release an escort first.');return;}
      t.g.position.copy(pl.group.worldToLocal(ROOT.localToWorld(V().set(-900,300,1200))));
      F.flash(t.g.getWorldPosition(V()),0xcfe4ff,900,0.8);F.sound('warp');
      ally={t,local:false,quiet:F.T()};say(t.name,tow?'Tractor locked. We have you in tow, Enterprise: warp 2, when you are ready.':'Reporting as ordered, Enterprise. Where do you want us?');W.emit&&W.emit('allied',t);}};
    return true;}
  // she goes when it is quiet (and, a tug, when there is a core again)
  animHooks.push(()=>{if(ally&&ally.pending&&F.T()>ally.due)ally.go();if(!ally||ally.pending)return;const t=ally.t,now=F.T();
    if(!W.traffic.all.includes(t)||t.task.kind!=='escort'){ally=null;return;}
    if(W.foes&&W.foes().length||S.warp||towing())ally.quiet=now;
    if(now-ally.quiet>20){const a=ally;ally=null;say(t.name,'All quiet. We will be on our way, Enterprise: good hunting.');
      if(a.local)W.traffic.release(t,'Back on patrol.');else W.traffic.leave(t);}});
  const towing=()=>!!ally&&!ally.pending&&ally.t.cls==='anvil'&&W.fuel&&!W.fuel.core();
  W.allies={towing,callHelp,ally:()=>ally&&!ally.pending?ally.t:null};
  W.callHelp=callHelp;
  return {act:{callhelp:callHelp},hud:()=>ally?(ally.pending?'help coming':(towing()?'in tow: ':'with us: ')+ally.t.name):'',state:()=>({ally:ally&&(ally.pending?'pending':ally.t.name),calls})};
}
