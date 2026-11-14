// ---------- Galaxy class: help, settings, and a first visit walked through ----------
// Original work.
//
//   ?        an overlay with every key the page answers to (access.js keeps the table, so a key moved there shows
//            here as moved), each movable one a button: press it, then the new key. Under the keys, the page's
//            switches: sound, music, the bridge's ambience, the log read aloud, the colour-blind palette, reduced
//            motion. The Help button on the bar opens it too; Escape or ? again closes it.
//   The tour on a first visit (nothing in localStorage says it was done or skipped) a card at the lower left walks the
//            captain from the turntable to the first mission: take the helm, a little impulse and a turn, read the
//            orders and accept them, and then the orders' own next-step lines, one at a time, each with its button,
//            until the first mission is done. It only ever waits for the captain; Skip ends it for good. It does not
//            start on a page opened with anything after the # (the tests and the links into a place), except #walk.
import {el,button,typing} from './ui.js';
const get=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const put=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};

export function help(W){
  const S=W.flight,h=new URLSearchParams(location.hash.slice(1));
  const st=document.createElement('style');st.textContent=`
#ent-helpov{position:fixed;inset:0;z-index:20;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55)}
#ent-helpov.open{display:flex}
#ent-helpov .box{position:relative;width:min(760px,calc(100% - 32px));max-height:calc(100% - 32px);overflow:hidden auto;box-sizing:border-box;padding:12px 14px;
  background:rgba(8,20,34,.97);border:1px solid #3f5a74;color:#dfe8f0;font:13px/1.45 Helvetica,Arial,sans-serif}
#ent-helpov .hd{display:flex;align-items:center;gap:8px;margin-bottom:6px}#ent-helpov .hd b{flex:1;letter-spacing:.14em;text-transform:uppercase;color:#9fb4c8}
#ent-helpov .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:4px 18px}
#ent-helpov h3{margin:8px 0 3px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e8c98a}
#ent-helpov .k{display:flex;align-items:baseline;gap:8px;padding:1px 0}
#ent-helpov kbd,#ent-helpov .k button{flex:none;min-width:46px;text-align:center;padding:2px 6px;font:600 12px Helvetica,Arial,sans-serif;background:#1c2c3e;color:#fff;border:1px solid #3f5a74;border-radius:3px}
#ent-helpov .k button{cursor:pointer}#ent-helpov .k button.wait{background:#e8c98a;color:#000}
#ent-helpov button{padding:5px 10px;font:13px Helvetica,Arial,sans-serif;background:rgba(10,24,40,.8);color:#dfe8f0;border:1px solid #3f5a74;border-radius:2px;cursor:pointer}
#ent-helpov button[aria-pressed="true"]{background:#7fa6c8;color:#08131f}
#ent-helpov .sw{display:flex;flex-wrap:wrap;gap:5px}#ent-helpov small{opacity:.75}
#ent-tour{position:fixed;left:14px;bottom:calc(var(--barh,56px) + 8px);width:min(360px,calc(100% - 28px));box-sizing:border-box;z-index:8;padding:9px 11px;
  background:rgba(8,20,34,.95);border:1px solid #e8c98a;color:#dfe8f0;font:13px/1.45 Helvetica,Arial,sans-serif;display:none}
#ent-tour.on{display:block}#ent-tour b{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e8c98a;margin-bottom:3px}
#ent-tour .acts{display:flex;gap:5px;margin-top:6px;flex-wrap:wrap}
#ent-tour button{padding:5px 10px;font:13px Helvetica,Arial,sans-serif;background:rgba(10,24,40,.8);color:#dfe8f0;border:1px solid #3f5a74;border-radius:2px;cursor:pointer}
body.tour #ent-help{display:none!important}
@media (max-width:600px){#ent-tour{bottom:auto;top:84px}}   /* a phone's lower left is the touch stick's */
html.lcars #ent-helpov .box,html.lcars #ent-tour{--k:var(--c);background:rgba(0,0,0,.95);color:var(--txt);font-family:var(--lf);border:0;border-left:20px solid var(--k);border-top:10px solid var(--k);border-radius:30px 0 0 0}
html.lcars #ent-tour{--k:var(--a)}
html.lcars #ent-helpov .hd b,html.lcars #ent-helpov h3,html.lcars #ent-tour b{font:600 14px/1.2 var(--lf);letter-spacing:.16em;color:var(--k);text-align:right}
html.lcars #ent-helpov h3{color:var(--a);text-align:left}
html.lcars #ent-helpov button,html.lcars #ent-tour button{background:var(--b);color:#000;border:0;border-radius:15px;padding:5px 13px 4px;font:600 14px/1.1 var(--lf);letter-spacing:.05em;text-transform:uppercase}
html.lcars #ent-helpov .hd button{background:var(--k);border-radius:0 15px 15px 0}
html.lcars #ent-helpov button[aria-pressed="true"]{background:var(--on)}
html.lcars #ent-helpov kbd,html.lcars #ent-helpov .k button{background:var(--d);color:#000;border:0;border-radius:10px;font:600 13px var(--lf);text-transform:uppercase}
html.lcars #ent-helpov .k button{background:var(--e)}html.lcars #ent-helpov .k button.wait{background:var(--on)}
body.bare #ent-helpov,body.bare #ent-tour{display:none!important}`;document.head.appendChild(st);

  // ================= the overlay =================
  const ov=el('div');ov.id='ent-helpov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Help');ov.setAttribute('aria-modal','true');
  const box=el('div','box');ov.append(box);document.body.append(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)toggle(false);});
  const isOpen=()=>ov.classList.contains('open');
  function toggle(o){o=o==null?!isOpen():!!o;if(!o&&W.keys)W.keys.cancel();ov.classList.toggle('open',o);if(o)render();if(W.onHelpToggle)W.onHelpToggle(o);}
  const sw=(label,on,fn,title)=>{const b=button(label,()=>{if(W.audio&&W.gestured&&W.gestured())W.audio();fn();render();},title);b.setAttribute('aria-pressed',String(!!on));return b;};
  function render(){if(!isOpen())return;box.innerHTML='';
    const close=button('Close',()=>toggle(false),'Close help');
    box.append(el('div','hd',[el('b',null,'Help: every key'),close]));
    const groups={};for(const r of W.keys.list())(groups[r[2]]=groups[r[2]]||[]).push(r);
    const cols=el('div','cols');
    for(const [g,rows] of Object.entries(groups)){const c=el('div');c.append(el('h3',null,g));
      for(const [k,t,,mv] of rows){let key;
        if(mv){key=button(k,()=>{key.textContent='press…';key.classList.add('wait');
          W.keys.capture(p=>{if(p)W.keys.set(mv,p);render();});},'Change the key for '+t+' (now '+k+')');}
        else key=el('kbd',null,k);
        c.append(el('div','k',[key,el('span',null,t)]));}
      cols.append(c);}
    box.append(cols,el('small',null,'Press a key\'s button, then the key you want for it (Escape to leave it). A key another order had swaps with it. '+
      'Drag to look round, scroll to stand off. On a touch screen the stick beside the helm strip steers (side to side) and sets the impulse (up and down); a gamepad flies too: the left stick steers, the right stick or the triggers set the impulse.'));
    if(W.keys.moved())box.append(el('div','sw',[button('Put every key back',()=>{W.keys.reset();render();})]));
    box.append(el('h3',null,'Sound, colour and motion'));
    const sd=W.sound,ac=W.access;
    box.append(el('div','sw',[
      sw('Sound',sd&&!sd.get('mute'),()=>sd.set('mute',!sd.get('mute')),'Sound on or off (M)'),
      sw('Music',sd&&sd.get('music'),()=>sd.set('music',!sd.get('music'))),
      sw('Bridge ambience',sd&&sd.get('amb'),()=>sd.set('amb',!sd.get('amb'))),
      sw('Read the log aloud',sd&&sd.get('speak'),()=>sd.set('speak',!sd.get('speak'))),
      sw('Colour-blind palette',ac.get('cb'),()=>ac.set('cb',!ac.get('cb'))),
      sw('Reduced motion',ac.get('calm'),()=>ac.set('calm',!ac.get('calm'))),
      button('Show the tour again',()=>{toggle(false);tour.start(true);})]));}
  W.onSoundChange=W.onAccessChange=()=>render();
  W.openHelp=o=>toggle(o);
  addEventListener('keydown',e=>{if(typing(e))return;
    if(e.key==='?'&&!e.repeat){e.preventDefault();toggle();}else if(e.key==='Escape'&&isOpen())toggle(false);});

  // ================= the tour =================
  const card=el('div');card.id='ent-tour';card.setAttribute('role','status');card.setAttribute('aria-live','polite');document.body.append(card);
  const ord=()=>W.orders&&W.orders.state?W.orders.state():{};
  const k=c=>W.keys?W.keys.name(W.keys.keyFor(c)):c.toUpperCase();
  // each step: its title, its words (a function, so moved keys show as moved), when it is done, and a button that does it
  const STEPS=[
    {t:'Welcome aboard',say:()=>'This is the Enterprise, alongside Starbase 1. Take the helm: the Fly button on the bar, or '+k('f')+'.',done:()=>S.on,
      act:['Take the helm',()=>W.startFlight&&W.startFlight()]},
    {t:'At the helm',say:()=>'Hold '+k('w')+' for impulse and '+k('a')+' or '+k('d')+' to turn; the arrows pitch. '+k('x')+' is all stop. (On a touch screen, the stick does both.)',
      done:()=>Math.abs(S.thr-base.thr)>0.04||Math.abs(S.rate.y)>0.03||Math.abs(S.rate.z)>0.03},
    {t:'Your orders',say:()=>'Starfleet has orders for you. '+k('j')+' opens them, and the captain\'s log under them. Accept these, or ask for something else.',
      done:()=>!!ord().active,act:['Read the orders',()=>W.openLog&&W.openLog()]},
    // from here on the orders say what is next, and the step's own button does it
    {t:'Orders',say:()=>{const b=W.orders.brief();return b.replace(/^Your orders stand, Enterprise: /,'')+' The orders panel has a button for it; ? lists every key.';},
      done:()=>won,live:true,act:['Do it',()=>W.orders.next&&W.orders.next()]},
    {t:'Well done',say:()=>'First mission done. New orders will follow in the panel (J). ? at any time lists every key, and the switches for sound, colour and motion.',
      done:()=>false,last:true}];
  let i=-1,shown='',won=false,base={thr:0};   // base: the throttle as a step began, so a step asks for a change
  const tour={start(force){if(!force&&get('ent-tour'))return;i=0;shown='';won=false;card.classList.add('on');document.body.classList.add('tour');draw();},
    stop(){i=-1;card.classList.remove('on');document.body.classList.remove('tour');put('ent-tour','done');},
    state:()=>({i,on:card.classList.contains('on')})};
  function draw(){const s=STEPS[i];if(!s)return tour.stop();
    // the orders step redraws when the step moves on (the text changes), not every tick (a button rebuilt under the
    // pointer cannot be clicked)
    const o=ord(),txt=s.say(),sig=i+'|'+txt+'|'+o.step;if(sig===shown)return;shown=sig;card.innerHTML='';
    const acts=el('div','acts');if(s.act&&!(s.live&&!o.active))acts.append(button(s.act[0],()=>{W.audio&&W.audio();s.act[1]();}));
    if(s.live&&o.of)card.append(el('b',null,s.t+': step '+(o.step+1)+' of '+o.of));else card.append(el('b',null,s.t));
    acts.append(button(s.last?'Close':'Skip the tour',()=>tour.stop()));
    card.append(el('div',null,txt),acts);}
  setInterval(()=>{if(i<0)return;if(STEPS[i].done()){i++;shown='';base={thr:S.thr};}draw();},400);
  // the orders step is done when a mission is finished, not when the panel is empty (an abandoned one is not done)
  W.on('mission',()=>{won=true;});
  const plain=!location.hash||location.hash==='#';
  if(h.has('walk'))setTimeout(()=>tour.start(true),800);else if(plain)setTimeout(()=>tour.start(false),1500);
  if(h.has('help'))setTimeout(()=>toggle(true),800);
  return {toggle,tour,state:()=>({open:isOpen(),tour:tour.state()})};
}
