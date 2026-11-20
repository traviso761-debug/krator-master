// ---------- Galaxy class: the Tactical panel ----------
// Original work. One panel for the fight's finer orders (the Tactical button):
//   shields   the four facings, each with its strength; Reinforce moves power to one from the facing opposite
//   weapons   aim at the hull or at the engines (U); remodulate the phasers (against the Lattice: hostile.js)
//   sensors   lay a tachyon net (Y: cloak.js)
//   saucer    separate, and rejoin (saucer.js)
//   fleet     call for help (allies.js)
// The panel is built once and only its words change as the fight goes on, so a button is never rebuilt under the
// pointer. #aim=engines starts with the engines targeted.
import {sidePanel,el,button,typing} from './ui.js';

export function tactical(W){
  const {animHooks}=W;
  W.aim=new URLSearchParams(location.hash.slice(1)).get('aim')==='engines'?'engines':'hull';
  const P=sidePanel('ent-tac','Tactical',o=>{W.onTacToggle&&W.onTacToggle(o);});
  const note=m=>W.fx&&W.fx.note(m);
  function setAim(a){W.aim=a||(W.aim==='engines'?'hull':'engines');note(W.aim==='engines'?'Weapons will target their engines, once their shields are down.':'Weapons will target their hulls.');paint();}
  // ---- built once ----
  const faces={},S=el('div','card');S.append(el('b',null,'Shields'));
  for(const f of ['fore','aft','port','starboard']){const v=el('span'),bar=el('i'),r=el('div','tacrow',[el('span',null,f[0].toUpperCase()+f.slice(1)),v,button('Reinforce',()=>{W.audio&&W.audio();W.reinforce&&W.reinforce(f);paint();},'Reinforce the '+f+' shields')]);
    faces[f]={v,bar};S.append(r,el('div','meter',[bar]));}
  const shSay=el('div','say');S.append(shSay);
  const aimH=button('Hull',()=>setAim('hull')),aimE=button('Engines',()=>setAim('engines')),wSay=el('div','say');
  const Wp=el('div','card',[el('b',null,'Weapons'),el('div','acts',[el('span',null,'Aim at: '),aimH,aimE,button('Remodulate phasers',()=>{W.HO&&W.HO.remodulate();})]),wSay]);
  const tSay=el('div','say');
  const Sn=el('div','card',[el('b',null,'Sensors'),el('div','acts',[button('Lay a tachyon net',()=>{W.audio&&W.audio();W.tachyon&&W.tachyon();paint();})]),tSay]);
  const bSep=button('Separate the saucer',()=>{W.audio&&W.audio();W.saucer&&W.saucer.separate();}),bRej=button('Rejoin',()=>{W.audio&&W.audio();W.saucer&&W.saucer.rejoin();}),sSay=el('div','say');
  const Sc=el('div','card',[el('b',null,'Saucer'),el('div','acts',[bSep,bRej]),sSay]);
  const fSay=el('div','say');
  const Fl=el('div','card',[el('b',null,'Fleet'),el('div','acts',[button('Call for help',()=>{W.audio&&W.audio();W.callHelp&&W.callHelp();})]),fSay]);
  P.body.append(S,Wp,Sn,Sc,Fl,el('small',null,'U aims at the hull or the engines; Y lays a tachyon net.'));
  {const s=document.createElement('style');s.textContent='#ent-tac .tacrow{display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;font-size:12px;margin-top:4px}#ent-tac .tacrow button{padding:2px 7px;font-size:11px}#ent-tac .acts span{align-self:center;font-size:12px;opacity:.75}';document.head.appendChild(s);}
  function paint(){const st=W.shieldsState?W.shieldsState():null;
    if(st&&st.faces)for(const f in faces){const v=Math.round(st.faces[f]);faces[f].v.textContent=v+'%';faces[f].bar.style.width=v+'%';faces[f].bar.style.background=v<35?'#ff6a5a':v<65?'#e8c98a':'#7fc8a0';}
    shSay.textContent=W.hazard&&W.hazard.noShields()?W.hazard.noShields():st&&st.up?'Raised. Keep a strong facing toward the enemy.':'Down (Z raises them).';
    aimH.setAttribute('aria-pressed',String(W.aim!=='engines'));aimE.setAttribute('aria-pressed',String(W.aim==='engines'));
    const f=W.enemy;wSay.textContent=!f?'No hostile in range.':f.disabled?'The '+f.K.name+' is dead in space: G takes her in tow.':f.K.adapt?'The Lattice has learned '+(f.adapt.ph>f.adapt.tp?'our phasers':'our torpedoes')+' best: use the other, or remodulate.':
      W.aim==='engines'?(f.K.noDisable?'This one cannot be disabled.':'Engines '+Math.round(f.eng/f.eng0*100)+'%'+(f.sh>0?', behind her shields':'')+'.'):'Hull '+Math.round(f.hp/f.hp0*100)+'%.';
    tSay.textContent=W.cloak&&W.cloak.ripple()?'A ripple on the net! Fire there.':W.cloak&&W.cloak.hidden()?'Something is here under a cloak. Turn between nets.':'Fans of tachyon beams ahead of the ship, for thirty seconds: a cloaked hull crossing one shows.';
    const m=W.saucer?W.saucer.mode():'home';bSep.disabled=m!=='home';bRej.disabled=m!=='away';
    sSay.textContent=m==='home'?'Docked to the stardrive.':m==='away'?'Away, '+(W.saucer.dist()/1000).toFixed(1)+' km. Fly in under it, or ask it to come to you.':m==='come'?'Coming in: hold still.':'Moving…';
    const a=W.allies&&W.allies.ally();fSay.textContent=a?a.name+' is with us.':'A starship from the fleet joins the fight. Command minds being called for small things.';}
  let pT=0;animHooks.push(now=>{if(P.open()&&now-pT>250){pT=now;paint();}});
  addEventListener('keydown',e=>{if(e.repeat||typing(e))return;const k=e.key.toLowerCase();
    if(k==='u'){W.audio&&W.audio();setAim();}else if(k==='y'){W.audio&&W.audio();W.tachyon&&W.tachyon();}else if(e.key==='Escape'&&P.open())P.toggle(false);});
  setTimeout(()=>{if(W.keys&&W.keys.add){W.keys.add('u','Aim at the hull, or the engines','Tactical');W.keys.add('y','Lay a tachyon net','Tactical');}},0);
  return {toggle:o=>{P.toggle(o);if(P.open())paint();},act:{tactical:()=>{P.toggle(true);paint();},aim:()=>setAim('engines')},
    hud:()=>W.aim==='engines'&&W.foes&&W.foes().length?'aim: engines':''};
}
