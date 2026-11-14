// ---------- Galaxy class: the helm's quick controls, and a way out of every panel ----------
// Original work. While flying, a strip of buttons down the right-hand side puts the captain's most-used orders under
// one finger: shields (Z), red alert, phasers, torpedoes, scan, hail, energise and dock; shields and red alert light
// up while they are on. It is hidden at the turntable, and wherever the page is shown bare.
//
// Every panel the page opens gets a Close button of its own: the ship's (Events, Course) and the shared page's
// (Views, Display), as well as the departments' (sensors, comms, orders: ui.js) and the chart, which have theirs
// already. Escape closes whichever are open.
//
// The touch stick (beside the strip, on a touch screen, or anywhere with #touch): side to side turns the ship, up
// and down opens and closes the impulse throttle, both by how far it is pushed. It and the gamepad (pad.js) drive
// the helm through one place, W.helmAxes(source, {turn, pitch, roll, thr}), each axis -1..1: the throttle is moved
// by rate, and the turns are added to the keys' in the flight's own helm (W.helmIn), so half a push is half the rate.
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
  const ACT={};
  const add=(k,label,fn,aria,cls)=>{ACT[k]=fn;const b=button(label,()=>{W.audio&&W.audio();W.chirp&&W.chirp();fn();sync();},aria);if(cls)b.className=cls;B[k]=b;box.append(b);};
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

  // the strip's orders by name, for the gamepad's buttons (pad.js)
  W.helmAct=k=>{const f=ACT[k];if(!f)return;W.chirp&&W.chirp();f();sync();};

  // ---- the analog helm: the touch stick and the gamepad ----
  // every source's axes summed: the flight reads the turns once a frame (W.helmIn, flight.js, added to its keys), the
  // throttle is moved here by rate
  const AX={};let lastT=0;
  W.helmAxes=(src,a)=>{if(a)AX[src]=a;else delete AX[src];};
  const sum=()=>{const s={turn:0,pitch:0,roll:0,thr:0};for(const a of Object.values(AX))for(const k in s)s[k]+=a[k]||0;return s;};
  W.helmIn=()=>{if(!Object.keys(AX).length)return null;const s=sum(),c=v=>Math.max(-1,Math.min(1,v));return {turn:c(s.turn),pitch:c(s.pitch),roll:c(s.roll)};};
  W.animHooks.push(now=>{const dt=lastT?Math.min(0.1,(now-lastT)/1000):0;lastT=now;
    const t=sum().thr;if(S.on&&t)W.setThrottle&&W.setThrottle(S.thr+Math.max(-1,Math.min(1,t))*dt*0.5);});

  // ---- the touch stick ----
  const sk=el('div');sk.id='ent-stick';sk.setAttribute('role','application');sk.setAttribute('aria-label','Helm stick: side to side turns, up and down sets the impulse');
  const knob=el('div','knob');sk.append(knob,el('span','lbl','helm'));document.body.append(sk);
  const hq=new URLSearchParams(location.hash.slice(1)),forceTouch=hq.has('touch');
  // #axes=turn,pitch,roll,thr (each -1..1): hold the analog helm there from evt on, as a stick would (for tests)
  if(hq.has('axes')){const [turn,pitch,roll,thr]=hq.get('axes').split(',').map(Number);setTimeout(()=>W.helmAxes('test',{turn,pitch,roll,thr}),+(hq.get('evt')||1.5)*1000+500);}
  let sp=null;
  const stickAt=(x,y)=>{const r=sk.getBoundingClientRect(),R=r.width/2,dx=(x-r.left-R)/R,dy=(y-r.top-R)/R,l=Math.hypot(dx,dy),k=l>1?1/l:1;
    const u=dx*k,v=dy*k;knob.style.transform=`translate(${u*R*0.62}px,${v*R*0.62}px)`;
    // a small dead centre, so a resting thumb does not steer
    const dz=a=>Math.abs(a)<0.12?0:(a-Math.sign(a)*0.12)/0.88;W.helmAxes('stick',{turn:-dz(u),thr:-dz(v)});};
  sk.addEventListener('pointerdown',e=>{sp=e.pointerId;sk.setPointerCapture(e.pointerId);sk.classList.add('on');stickAt(e.clientX,e.clientY);e.preventDefault();});
  sk.addEventListener('pointermove',e=>{if(e.pointerId===sp)stickAt(e.clientX,e.clientY);});
  const up=e=>{if(e.pointerId!==sp)return;sp=null;sk.classList.remove('on');knob.style.transform='';W.helmAxes('stick',null);};
  sk.addEventListener('pointerup',up);sk.addEventListener('pointercancel',up);
  const ss=document.createElement('style');ss.textContent=`
#ent-stick{position:fixed;right:126px;top:50%;width:132px;height:132px;margin-top:-66px;border-radius:50%;display:none;z-index:5;touch-action:none;user-select:none;-webkit-user-select:none;
  background:radial-gradient(circle,rgba(127,166,200,.10) 0 40%,rgba(10,24,40,.55) 41%);border:2px solid #7fa6c8;box-sizing:border-box}
#ent-stick .knob{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:#7fa6c8;opacity:.85;pointer-events:none}
#ent-stick.on .knob{opacity:1;background:#cfe0f0}
#ent-stick .lbl{position:absolute;left:0;right:0;bottom:-18px;text-align:center;font:11px Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#9fb4c8;pointer-events:none}
@media (pointer:coarse),(hover:none){#ent-stick.fly{display:block}}
#ent-stick.fly.force{display:block}
@media (hover:none){#ent-stick{top:auto;margin:0;bottom:calc(var(--barh,56px) + 210px);right:118px}}
@media (max-width:600px){#ent-stick{right:auto;left:14px;top:auto;margin:0;bottom:calc(var(--barh,56px) + 24px);width:120px;height:120px}}
html.lcars #ent-stick{border-color:var(--c);background:radial-gradient(circle,rgba(0,0,0,.2) 0 40%,rgba(0,0,0,.6) 41%)}
html.lcars #ent-stick .knob{background:var(--b)}html.lcars #ent-stick.on .knob{background:var(--on)}
html.lcars #ent-stick .lbl{font:600 12px var(--lf);color:var(--c)}
body.bare #ent-stick{display:none!important}`;document.head.appendChild(ss);
  if(forceTouch)sk.classList.add('force');
  setInterval(()=>{if(sk.classList.contains('fly')!==S.on){sk.classList.toggle('fly',S.on);if(!S.on&&sp!=null){sp=null;W.helmAxes('stick',null);}}},250);

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
  return {state:()=>({quick:box.classList.contains('on'),stick:getComputedStyle(sk).display!=='none',axes:Object.keys(AX)})};
}
