// ---------- Galaxy class: refits at a starbase ----------
// Original work. Standing with Starfleet Command (standing.js) buys refits: docked at a starbase, Refits on its card in
// comms (or on the service record, J) opens the quartermaster's list. (No key: every letter is taken.) Each refit is signed off once Command's standing reaches its
// mark, is fitted while the ship is in the clamps, and is kept in the career for good:
//   Mark IX torpedoes        a bigger warhead: torpedoes hit 40% harder (events.js)
//   a shield grid upgrade    the shields wear 30% more slowly under fire (events.js)
//   a faster pattern buffer  the transporter cycles in a little over half the time (transporter.js)
// The effects are W.refit's multipliers (torp, shield, beam), read where each is computed, so a module that fires,
// shields or energises asks W.refit and needs nothing else from here.
import {sidePanel,el,button,typing} from './ui.js';

const REFITS=[
  {id:'torp',name:'Mark IX photon torpedoes',what:'A bigger warhead and a smarter seeker: torpedoes hit forty percent harder.',need:3,on:1.4},
  {id:'beam',name:'A faster pattern buffer',what:'The transporter cycles in a little over half the time: crews off a wreck, and teams up and down, sooner.',need:4,on:0.55},
  {id:'shield',name:'A shield grid upgrade',what:'New emitters along the saucer\'s rim: the shields wear thirty percent more slowly under fire.',need:6,on:1/0.7},
];

export function refit(W){
  const P=sidePanel('ent-refit','Starbase refits',o=>{if(o)render();});
  const C=()=>{const c=W.career?W.career():{};if(!c.refits)c.refits={};return c;};
  const has=id=>!!C().refits[id],val=id=>{const R=REFITS.find(r=>r.id===id);return has(id)?R.on:1;};
  W.refit={get torp(){return val('torp');},get shield(){return val('shield');},get beam(){return val('beam');}};
  const docked=()=>W.dockPhase&&W.dockPhase()==='docked'&&W.dockTarget();
  const sf=()=>W.standing?W.standing.get('starfleet'):0;
  let fitting=null;
  function fit(R){const st=docked();if(!st||has(R.id)||fitting)return;if(sf()<R.need){W.toast&&W.toast('Quartermaster',' Command has not signed that one off yet.');return;}
    fitting=R;W.toast&&W.toast(st.name,' Refit crews are coming aboard: '+R.name.toLowerCase()+'. Keep her in the clamps.');render();
    setTimeout(()=>{fitting=null;if(docked()!==st){W.toast&&W.toast(st.name,' You cast off before the refit was done. It will be here when you come back.');render();return;}
      C().refits[R.id]=true;W.logEntry&&W.logEntry('Refitted at '+st.name+': '+R.name.toLowerCase()+'.');W.toast&&W.toast(st.name,' Refit complete: '+R.name.toLowerCase()+'.');
      W.saveCareer&&W.saveCareer();render();},8000);}
  function render(){if(!P.open())return;P.body.innerHTML='';const st=docked();
    P.body.append(el('div','row',[el('span',null,'Standing with Starfleet Command'),el('span',null,(W.standing?W.standing.label('starfleet'):'')+' ('+sf()+')')]));
    P.body.append(el('div','say',st?'Docked at '+st.name+'. The quartermaster has these on the board:':'Refits are fitted at a starbase: dock (K), then Refits here or on its card in comms (H).'));
    for(const R of REFITS){const card=el('div','card'+(has(R.id)?' ok':''),[el('b',null,R.name),el('div',null,R.what)]);
      const a=el('div','acts');
      if(has(R.id))a.append(el('small',null,'Fitted.'));
      else if(fitting===R)a.append(el('small',null,'Fitting now...'));
      else if(sf()<R.need)a.append(el('small',null,'Command signs it off at a standing of '+R.need+'.'));
      else if(st)a.append(button('Fit it',()=>fit(R)));
      else a.append(el('small',null,'Signed off: dock at a starbase to have it fitted.'));
      card.append(a);P.body.append(card);}
    P.body.append(el('small',null,'Standing rises with every mission done and every commendation (the service record, J).'));}
  W.openRefit=()=>P.toggle(true);
  W.on('docked',st=>{const can=REFITS.filter(R=>!has(R.id)&&sf()>=R.need);if(can.length)W.toast&&W.toast('Quartermaster, '+st.name,' '+(can.length===1?'A refit is':can.length+' refits are')+' signed off and ready to fit (Refits, on the starbase\'s card in comms).');});
  addEventListener('keydown',e=>{if(e.repeat||typing(e))return;if(e.key==='Escape'&&P.open())P.toggle(false);});
  (W.recordExtras=W.recordExtras||[]).push(()=>{const f=REFITS.filter(R=>has(R.id));return [...(f.length?[el('div','row',[el('span',null,'Refits'),el('b',null,f.map(R=>R.name.replace(/^An? /,'')).join(', '))])]:[]),
    el('div','acts',[button('Refits',()=>P.toggle(true),'Starbase refits')])];});
  return {act:{refit:()=>P.toggle(true),refitall:()=>{for(const R of REFITS)C().refits[R.id]=true;render();}},
    hud:()=>fitting?'refitting: '+fitting.name.toLowerCase():'',state:()=>({refits:{...C().refits},torp:W.refit.torp,shield:W.refit.shield,beam:W.refit.beam})};
}
