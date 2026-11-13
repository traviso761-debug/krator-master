// ---------- Galaxy class: the ship's systems, and engineering ----------
// Original work. The hull is not the only thing a hit can hurt. Seven systems each have an integrity (0 to 100):
//   warp         below 75 the top speed falls (warp 6 below 75, warp 3 below 50); below 25 the ship cannot go to warp,
//                and one already at warp drops out
//   impulse      the top impulse speed scales with it (a third of full at nothing: the thrusters still work)
//   phasers      offline below 25
//   torpedoes    offline below 25
//   shields      the generator: below 25 the shields fall and cannot be raised; they recharge in proportion
//   sensors      offline below 25 (no scans, no sweeps)
//   transporter  offline below 25
// A hit on the hull (shields down) has a good chance of hurting one system, and a hit on the shields a small one
// once they are weak. Damage control works on whatever is hurt, slowly, but can only bring a system back to half:
// past that it takes a starbase's repair crews (docked: starbases.js calls W.repair). So a ship that has fought
// hard limps home. I (or the Engineering button) opens the panel; damage shows on the HUD while there is any.
import {sidePanel,el,button,typing} from './ui.js';

export const SYSTEMS=[['warp','Warp drive'],['impulse','Impulse engines'],['phasers','Phasers'],['torpedoes','Torpedo launchers'],
  ['shields','Shield generator'],['sensors','Sensors'],['transporter','Transporter']];
const OFF=25,DC=50;   // offline below OFF; damage control stops at DC

export function systems(W){
  const {animHooks}=W;
  const I={};for(const [k] of SYSTEMS)I[k]=100;
  const name=k=>SYSTEMS.find(s=>s[0]===k)[1];
  const say=m=>W.toast&&W.toast('Engineering',' '+m);
  let dirty=true,lastNote=0;
  const P=sidePanel('ent-eng','Engineering',o=>{W.onEngToggle&&W.onEngToggle(o);if(o)dirty=true;});

  // damage to one system (amt in points); a crossing of the offline line is reported once
  function damage(k,amt){const was=I[k];I[k]=Math.max(0,I[k]-amt);dirty=true;
    if(was>=OFF&&I[k]<OFF){say(name(k)+' offline.');W.emit&&W.emit('sysdown',k);
      if(k==='warp'&&W.flight.warp){W.course&&W.course.clear();W.dropOut();}
      if(k==='shields'&&W.shieldsState&&W.shieldsState().up)W.toggleShields();}
    else if(k==='warp'&&W.flight.warp>warpMax())W.flight.warp=warpMax();}
  // a hit landed: dm is the bolt's weight, onShields whether the shields took it
  function hit(dm,onShields,shStr){
    const r=Math.random();
    if(onShields){if(shStr>30||r>0.25)return;}else if(r>0.6)return;
    const k=SYSTEMS[Math.floor(Math.random()*SYSTEMS.length)][0];
    damage(k,(onShields?5+Math.random()*7:10+Math.random()*15)*(dm||1));}
  const warpMax=()=>I.warp<OFF?0:I.warp<50?3:I.warp<75?6:9;
  // is k down? (and say so, once a second at most, when asked by something the captain pressed)
  function down(k,quiet){if(I[k]>=OFF)return false;
    if(!quiet&&performance.now()-lastNote>1000){lastNote=performance.now();say(name(k)+(k==='warp'?' is offline: impulse only until it is repaired.':' offline. Damage control is working on it.'));}
    return true;}
  // a starbase's crews (k per frame while docked): everything, all the way
  function repair(k){for(const s in I)if(I[s]<100){I[s]=Math.min(100,I[s]+k*1.5);dirty=true;}}
  // damage control: the worst first, up to half, about a point every two seconds
  let dt0=performance.now();
  animHooks.push(()=>{const now=performance.now(),dt=Math.min(0.2,(now-dt0)/1000);dt0=now;
    let worst=null;for(const s in I)if(I[s]<DC&&(!worst||I[s]<I[worst]))worst=s;
    if(worst){const was=I[worst];I[worst]=Math.min(DC,I[worst]+dt*0.5);if(was<OFF&&I[worst]>=OFF){say(name(worst)+' back online.');W.emit&&W.emit('sysup',worst);}dirty=true;}
    if(P.open()&&dirty)render();});

  function render(){dirty=false;P.body.innerHTML='';
    const bars=el('div','sys');
    for(const [k,lab] of SYSTEMS){const v=Math.round(I[k]),row=el('div','sysrow'+(v<OFF?' off':v<DC?' low':''));
      const bar=el('i');bar.style.width=v+'%';
      row.append(el('span',null,lab),el('b',null,v<OFF?'offline':v+'%'),el('div','sysbar',[bar]));bars.append(row);}
    P.body.append(bars);
    const hurt=SYSTEMS.filter(([k])=>I[k]<100);
    P.body.append(el('div','say',!hurt.length?'All systems at full strength.':
      hurt.some(([k])=>I[k]<DC)?'Damage control is working on the worst of it; it can bring a system back to half. A starbase can do the rest.':
      'Everything is working. A starbase\'s crews can bring it the rest of the way.'));
    if(hurt.length&&W.dock)P.body.append(el('div','acts',[button('Dock for repairs',()=>{W.audio&&W.audio();W.dock();})]));
    P.body.append(el('small',null,'Warp: up to warp '+warpMax()+'. I opens this panel.'));}
  {const st=document.createElement('style');st.textContent=
    '#ent-eng .sysrow{display:grid;grid-template-columns:1fr auto;gap:2px 8px;margin:0 0 8px}#ent-eng .sysbar{grid-column:1/3;height:6px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden}'+
    '#ent-eng .sysbar i{display:block;height:100%;background:#9cf}#ent-eng .low .sysbar i{background:#fc6}#ent-eng .off .sysbar i{background:#f66}#ent-eng .off b{color:#f88}';
   document.head.appendChild(st);}

  addEventListener('keydown',e=>{if(e.repeat||typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='i'||e.key==='I'){W.audio&&W.audio();P.toggle();}else if(e.key==='Escape'&&P.open())P.toggle(false);});

  W.openEng=()=>P.toggle(true);
  W.sys={get:k=>I[k],all:()=>({...I}),damage,hit,down,repair,warpMax,impulse:()=>0.35+0.65*I.impulse/100,shieldRate:()=>I.shields/100,
    // for tests: #sysdmg=warp:80,phasers:60 sets damage once the page is up
    set:(k,v)=>{I[k]=Math.max(0,Math.min(100,v));dirty=true;}};
  {const h=new URLSearchParams(location.hash.slice(1));if(h.has('sysdmg'))setTimeout(()=>{for(const kv of h.get('sysdmg').split(',')){const [k,v]=kv.split(':');if(k in I)damage(k,+v);}},+(h.get('evt')||1.5)*1000);}
  return {toggle:o=>P.toggle(o),act:{eng:()=>P.toggle(true)},
    hud:()=>{const d=SYSTEMS.filter(([k])=>I[k]<OFF).map(([k])=>k);return d.length?'offline: '+d.join(', '):SYSTEMS.some(([k])=>I[k]<DC)?'damaged: I':'';}};
}
