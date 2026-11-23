// ---------- Galaxy class: the helm's quick controls, and a way out of every panel ----------
// Original work. While flying, a strip of buttons down the right-hand side puts the captain's most-used orders under
// one finger: shields (Z), red alert, phasers, torpedoes, scan, hail, energise and dock; shields and red alert light
// up while they are on. It is hidden at the turntable, and wherever the page is shown bare.
//
// Every panel the page opens gets a Close button of its own: the ship's (Events, Course) and the shared page's
// (Views, Display), as well as the departments' (sensors, comms, orders: ui.js) and the chart, which have theirs
// already. Escape closes whichever are open.
import {el,button,typing} from './ui.js';

export function helm(W){
  const S=W.flight;
  // ---- the quick strip ----
  const st=document.createElement('style');st.textContent=`
#ent-quick{position:fixed;right:10px;top:50%;transform:translateY(-50%);display:none;flex-direction:column;gap:4px;z-index:5}
#ent-quick.on{display:flex}
#ent-quick button{min-width:92px;padding:7px 12px;font:600 13px Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:.05em;text-align:right;
  background:rgba(10,24,40,.82);color:#dfe8f0;border:1px solid #3f5a74;border-radius:2px;cursor:pointer}
#ent-quick button[aria-pressed="true"]{background:#7fa6c8;color:#08131f}
#ent-quick button.warn[aria-pressed="true"]{background:#e05a4a;color:#000}
html.lcars #ent-quick button{background:var(--b);color:#000;border:0;border-radius:14px 0 0 14px;font-family:var(--lf);font-size:14px}
html.lcars #ent-quick button:nth-child(even){background:var(--c)}
html.lcars #ent-quick button[aria-pressed="true"]{background:var(--on)}
html.lcars #ent-quick button.warn[aria-pressed="true"]{background:#ff5a46}
@media (max-width:600px),(hover:none){#ent-quick{top:auto;bottom:calc(var(--barh,56px) + 210px);transform:none}#ent-quick button{min-width:0;padding:6px 9px}}
body.bare #ent-quick{display:none!important}`;document.head.appendChild(st);
  const box=el('div');box.id='ent-quick';box.setAttribute('role','toolbar');box.setAttribute('aria-label','Helm');
  const B={};
  const add=(k,label,fn,aria,cls)=>{const b=button(label,()=>{W.audio&&W.audio();fn();sync();},aria);if(cls)b.className=cls;B[k]=b;box.append(b);};
  add('sh','Shields',()=>W.toggleShields(),'Shields (Z)');
  add('red','Red alert',()=>W.toggleRed(),'Red alert','warn');
  add('ph','Phasers',()=>W.fire('phasers'),'Phasers (Space)');
  add('tp','Torpedo',()=>W.fire('torpedo'),'Torpedo (T)');
  add('scan','Scan',()=>W.scan&&W.scan(),'Scan (N)');
  add('hail','Hail',()=>W.openComms&&W.openComms(),'Comms (H)');
  add('beam','Energise',()=>W.beam&&W.beam(),'Transporter (B)');
  add('dock','Dock',()=>W.dock&&W.dock(),'Dock (K)');
  document.body.appendChild(box);
  B.sh.setAttribute('aria-pressed','false');B.red.setAttribute('aria-pressed','false');B.dock.setAttribute('aria-pressed','false');
  let was={};
  function sync(){const s=W.shieldsState(),d=W.dockPhase&&W.dockPhase(),now={sh:s.up,red:s.red,dock:!!d,on:S.on,lab:'Shields '+Math.round(s.str)+'%'};
    if(now.on!==was.on)box.classList.toggle('on',now.on);
    for(const k of ['sh','red','dock'])if(now[k]!==was[k])B[k].setAttribute('aria-pressed',String(now[k]));
    if(now.lab!==was.lab){B.sh.textContent=s.str<99.5?now.lab:'Shields';B.sh.setAttribute('aria-label',B.sh.textContent+' (Z)');}
    if(now.dock!==was.dock)B.dock.textContent=d==='docked'?'Cast off':d?'Docking':'Dock';
    was=now;}
  // on a timer, not the frame: it keeps up when frames are few (a background tab, a slow card)
  setInterval(sync,250);

  // ---- a Close on every panel ----
  // [panel id, the bar button that opens it]: closing presses that button, so its aria-expanded and anything else it
  // keeps stay true; a panel no bar button opens is just closed
  const PANELS=[['views','Views'],['display',null],['pitpanel','Events'],['navpanel','Course']];
  const barBtn=t=>t&&[...document.querySelectorAll('#ui button')].find(b=>b.textContent===t);
  function close(id,lab){const p=document.getElementById(id);if(!p||!p.classList.contains('open'))return;
    const b=barBtn(lab);if(b&&lab!=='Course')b.click();else if(lab==='Course'&&W.openNav)W.openNav();else p.classList.remove('open');}
  for(const [id,lab] of PANELS){const p=document.getElementById(id);if(!p)continue;
    const c=button('Close',()=>close(id,lab),'Close '+(lab||id));const row=el('div','ent-closer');row.append(c);p.prepend(row);}
  const cs=document.createElement('style');cs.textContent=`
.ent-closer{grid-column:1/-1;order:-1;display:flex;justify-content:flex-end;margin:0 0 4px}
#views .ent-closer button,#pitpanel .ent-closer button,#display .ent-closer button,#navpanel .ent-closer button{padding:5px 12px;font:13px Helvetica,Arial,sans-serif;background:rgba(10,24,40,.8);color:#dfe8f0;border:1px solid #3f5a74;border-radius:2px;cursor:pointer}
html.lcars #views .ent-closer button,html.lcars #pitpanel .ent-closer button,html.lcars #display .ent-closer button,html.lcars #navpanel .ent-closer button{background:var(--k);color:#000;border:0;border-radius:0 15px 15px 0;font:600 14px var(--lf);text-transform:uppercase;min-width:64px;text-align:right}`;
  document.head.appendChild(cs);
  addEventListener('keydown',e=>{if(e.key!=='Escape'||typing(e))return;for(const [id,lab] of PANELS)close(id,lab);});
  return {state:()=>({quick:box.classList.contains('on')})};
}
