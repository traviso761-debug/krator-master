// ---------- Galaxy class: keys you can change, a palette for colour-blind eyes, and less motion ----------
// Original work.
//
//   Keys     every key the page answers to, in one table (W.keys.list): what it does, and the key it is pressed with.
//            The help overlay (help.js) shows it and lets any single-key order be moved to another key. The modules
//            go on listening for the key they always did: a key the captain has moved is caught first (on the way
//            down, before any module sees it) and sent on as the key it stands for. Only a real key press is
//            moved, so the tests and the page's own synthetic presses (the orbit on arrival, the touch stick) keep
//            meaning what they say. Moving an order onto a key another order has swaps the two, so no order is
//            ever left without a key. The digits (warp), the arrows and Escape stay where they are.
//   Colour   an LCARS palette built from the Okabe-Ito colours, which stay apart for the commoner kinds of colour
//            blindness, with the pressed state told by brightness as well as colour (html.cb, lcars.js).
//   Motion   reduced motion: no screen shake, no warp flash or punch of the camera, no transitions in the panels.
//            On by default where the system asks for it (prefers-reduced-motion). W.calm() says whether it is on,
//            for any module that adds a flash or a shake.
//
// Each choice is kept from one visit to the next (localStorage). #cb and #calm turn them on for one load.
import {typing} from './ui.js';
const get=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v;}catch(e){return d;}};
const put=(k,v)=>{try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}};

// [the key a module listens for, what it does, group, can it be moved]
const KEYS=[
  ['f','Take the helm (from the turntable)','Helm',false],
  ['w','More impulse (hold)','Helm',true],['s','Less impulse (hold)','Helm',true],['x','All stop','Helm',true],
  ['a','Turn to port','Helm',true],['d','Turn to starboard','Helm',true],
  ['r','Nose up (or ↑)','Helm',true],['f','Nose down (or ↓)','Helm',true],
  ['q','Roll to port','Helm',true],['e','Roll to starboard','Helm',true],
  ['1–9','Warp factor','Helm',false],['0','Drop out of warp','Helm',false],
  ['o','Standard orbit','Helm',true],['c','The star chart, to set a course','Helm',true],['k','Dock (flies there first)','Helm',true],
  [' ','Phasers','Tactical',true],['t','Photon torpedo (Shift: a spread)','Tactical',true],['z','Shields','Tactical',true],
  ['g','Tractor beam','Tactical',true],
  ['j','Orders and the captain\'s log','Departments',true],['n','Scan','Departments',true],['h','Comms','Departments',true],
  ['b','Transporter','Departments',true],['i','Engineering','Departments',true],['p','Stellar cartography','Departments',true],
  ['l','Chart markers','Departments',true],
  ['v','Camera: chase, flyby, bridge, director','The page',true],['m','Sound on or off','The page',true],
  ['?','This help','The page',false],['Escape','Close whatever is open','The page',false]];
const MOVABLE=[...new Set(KEYS.filter(k=>k[3]).map(k=>k[0]))];   // f appears twice (it takes the helm, then pitches): one key
const name=k=>k===' '?'Space':k.length===1?k.toUpperCase():k;
const norm=e=>e.key&&e.key.length===1?e.key.toLowerCase():e.key;

export function access(W){
  const h=new URLSearchParams(location.hash.slice(1)),root=document.documentElement;
  // ================= keys =================
  // bind: the order (by its own key) -> the key it is now pressed with; only moved ones are stored
  let bind={};try{bind=JSON.parse(get('ent-keys','{}'))||{};}catch(e){bind={};}
  let phys={};   // the key pressed -> the key the modules listen for
  const rebuild=()=>{phys={};for(const [c,p] of Object.entries(bind))if(c!==p)phys[p]=c;
    // a key whose order moved away and that no other order took is dead (it would otherwise still do its old job)
    for(const c of Object.keys(bind))if(bind[c]!==c&&!(c in phys))phys[c]='';};
  const keyFor=c=>bind[c]||c;
  rebuild();
  let capture=null;   // the help overlay waiting for a key to move an order to
  function remap(e){
    if(capture&&e.type==='keydown'&&e.isTrusted){e.preventDefault();e.stopImmediatePropagation();
      const k=norm(e);if(k==='Escape'){const f=capture;capture=null;f(null);return;}
      if(k.length===1&&!/[0-9?]/.test(k)){const f=capture;capture=null;f(k);}return;}
    if(!e.isTrusted||typing(e))return;
    const k=norm(e);if(!(k in phys))return;
    e.preventDefault();e.stopImmediatePropagation();const c=phys[k];if(!c)return;
    // the stand-in carries the modifiers (Shift for a spread of torpedoes) and whether it is a repeat
    const ev=new KeyboardEvent(e.type,{key:c,code:e.code,shiftKey:e.shiftKey,repeat:e.repeat,bubbles:true,cancelable:true});
    dispatchEvent(ev);}
  addEventListener('keydown',remap,true);addEventListener('keyup',remap,true);
  // move order c onto key p; the order that had p takes c's old key
  function setKey(c,p){const old=keyFor(c);if(p===old)return;
    const other=MOVABLE.find(o=>o!==c&&keyFor(o)===p);
    bind[c]=p;if(other)bind[other]=old;
    for(const o of Object.keys(bind))if(bind[o]===o)delete bind[o];
    put('ent-keys',Object.keys(bind).length?JSON.stringify(bind):null);rebuild();changed();}
  const resetKeys=()=>{bind={};put('ent-keys',null);rebuild();changed();};
  const extra=[];
  W.keys={
    // [shown key, what it does, group, the order's own key (to move it) or null]
    list:()=>[...KEYS,...extra].map(([c,t,g,mv])=>[c.length===1&&c!=='?'?name(keyFor(c)):c,t,g,mv?c:null]),
    // another module's key, for the help to list (it cannot be moved)
    add:(k,text,group)=>{extra.push([k,text,group||'The page',false]);changed();},
    keyFor,name,set:setKey,reset:resetKeys,moved:()=>Object.keys(bind).length,
    capture:f=>{capture=f;},cancel:()=>{if(capture){const f=capture;capture=null;f(null);}}};

  // ================= colour and motion =================
  const sysCalm=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const opt={cb:h.has('cb')||get('ent-cb','0')==='1',calm:h.has('calm')||get('ent-calm',sysCalm?'1':'0')==='1'};
  const apply=()=>{root.classList.toggle('cb',opt.cb);root.classList.toggle('calm',opt.calm);};
  W.calm=()=>opt.calm;
  W.access={get:k=>opt[k],set(k,v){opt[k]=!!v;put('ent-'+k,opt[k]?'1':'0');apply();changed();}};
  apply();
  // no shake and no punch: the flight keeps adding to them; read back, they are nothing while motion is reduced
  const S=W.flight;
  for(const p of ['shake','punch']){let v=S[p]||0;Object.defineProperty(S,p,{configurable:true,enumerable:true,get:()=>opt.calm?0:v,set:x=>{v=opt.calm?0:x;}});}
  const st=document.createElement('style');st.textContent=`html.calm *,html.calm *::before,html.calm *::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}`;
  document.head.appendChild(st);

  function changed(){if(W.onAccessChange)W.onAccessChange();}
  return {state:()=>({...opt,moved:bind,sysCalm})};
}
