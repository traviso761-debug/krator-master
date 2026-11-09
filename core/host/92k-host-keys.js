// ================================================================= CORE HOST — the one key map: the standard controls, their names and keys
// [web] core/host/92k-host-keys.js (TODO.md, "Viewers": one walk mode and one set of controls in every viewer; MODULARITY-PLAN.md,
// "With step 2"). Opt-in for now (host.py KEYS; it joins host.SHELL at the next all-builds rebuild): a build that takes it names
// its controls by id and gets the same button, the same words and the same key as every other page.
//
//   KHOST.KEYMAP                 [{id, key, label, name, what, owner}] in the help card's order: the camera's keys (90), the
//                                standard controls a build hands in (night, cut-away, door, interiors, shadows, labels), and the
//                                host modules' own (inspect 93, marks 94, polygon tool 94, stocks 93, minimap 97, editor 98,
//                                cut-away 99). `key` is the event key (lower case), `label` how it is written ('X', '[ ]')
//   KHOST.std(id, on, more)      -> {button: 'Night (N)', title, on, id: 'khost-std-<id>', std: id}: a control for o.controls
//   KHOST.standard(o)            -> o: o.std = {id: fn | {on, state?, title?}} becomes the standard buttons (in KEYMAP order,
//                                before o.controls) and keys (a build's own o.keys win); state() paints the button 'on'.
//                                A standard id the build does not hand in has no button. Call it on the take's options:
//                                KHOST.take(KHOST.standard({..., std: {night: () => nightSet(!NIGHT.on)}}))
//   ? (or the Keys button)       the card: every key this page answers, the camera's and the modules' first, then the build's
//                                standard controls, then the build's own keys (o.keyNames {key: words} names them)
//   L                            the polygon tool (94-host-polytool.js) when the page has it: Polygon, Path, then Inspect
// The host modules' buttons are renamed to the standard words on the first frame (the cut-away's 'cutaway (X)' reads
// 'Cut-away (X)'), so every page shows the same names whichever module drew the button.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
// ---------------------------------------------------------------- the key map (core/host/README.md, "The keys")
const M=[
 // the camera (90-host-camera.js): always there
 {id:'move',label:'W A S D',name:'Move',what:'fly (walking: walk); Shift faster, Ctrl or Alt slower',owner:'camera'},
 {id:'updown',label:'Q / E',name:'Down / up',what:'fly down and up (Space up too); E is the door in reach where the page has doors',owner:'camera'},
 {id:'walk',key:'f',label:'F',name:'Walk',what:'first person: the feet on the ground and on the core/walk floors, steps and stairs; walls and blocks stop you (from the pin when there is one)',owner:'camera'},
 {id:'pin',key:'g',label:'G',name:'Fly to the pin',what:'double-click the ground to drop a pin; Esc lifts it',owner:'camera'},
 {id:'mouse',label:'mouse',name:'Look',what:'drag to orbit (walking: look), right-drag to pan, wheel to zoom (walking: speed), click to inspect',owner:'camera'},
 // the standard controls a build hands in (KHOST.standard)
 {id:'cutaway',key:'x',label:'X',name:'Cut-away',what:'open the buildings: the one nearest the view storey by storey where the page has interiors ([ ] the storey), else the near half of every building that has one',owner:'build'},
 {id:'storey',key:'[',label:'[ ]',name:'Storey',what:'the cut-away a storey down or up (PageDown / PageUp, Shift + wheel)',owner:'cutaway'},
 {id:'interiors',key:'u',label:'U',name:'Interiors',what:'plan and furnish every building that has an interior set (kits/interiors); the page reloads with ?interiors=1',owner:'build'},
 {id:'door',key:'e',label:'E',name:'Door',what:'open or shut the door in reach',owner:'build'},
 {id:'night',key:'n',label:'N',name:'Night',what:'night: lamps, fires and windows lit',owner:'build'},
 {id:'shadows',label:'',name:'Shadows',what:'the sun\'s shadows on and off',owner:'build'},
 {id:'labels',label:'',name:'Labels',what:'the names over the buildings',owner:'build'},
 // the host modules' own (each answers its key itself when it is on the page)
 {id:'inspect',key:'i',label:'I',name:'Inspect',what:'the hover tip; a click names what is under the pointer',owner:'module'},
 {id:'polygon',key:'l',label:'L',name:'Polygon tool',what:'lay out a polygon, then a path, then back to inspect (the tools in the inspector panel)',owner:'module'},
 {id:'marks',key:'p',label:'P',name:'Marks',what:'areas, lines and points, named and measured',owner:'module'},
 {id:'minimap',key:'m',label:'M',name:'Minimap',what:'the map of the records',owner:'module'},
 {id:'stocks',key:'o',label:'O',name:'Stocks',what:'what the settlement holds',owner:'module'},
 {id:'editor',key:'b',label:'B',name:'Editor',what:'place, move, turn, remove (Delete, Ctrl+Z)',owner:'module'},
 {id:'keys',key:'?',label:'?',name:'Keys',what:'this card',owner:'host'}];
K.KEYMAP=M;
const BY={};M.forEach(r=>{BY[r.id]=r;});
const words=r=>r.name+(r.label&&r.label!=='mouse'?' ('+r.label+')':'');
K.std=function(id,on,more){const r=BY[id];if(!r)throw new Error('KHOST.std: no standard control '+id);
 return Object.assign({button:words(r),title:r.what,on:on,id:'khost-std-'+id,std:id},more||{});};
K.standard=function(o){const S=o.std||{},ctl=[],keys=Object.assign({},o.keys||{});
 M.forEach(r=>{const s=S[r.id];if(s==null||r.owner!=='build')return;const fn=typeof s==='function'?s:s.on;
  const c=K.std(r.id,()=>fn(),{state:s.state,title:s.title||r.what});ctl.push(c);
  if(r.key&&!(o.keys&&o.keys[r.key]))keys[r.key]=()=>fn();});
 o.controls=ctl.concat(o.controls||[]);o.keys=keys;K._std=ctl;return o;};
// ---------------------------------------------------------------- the card, the polygon tool's key, the modules' buttons renamed
K.onTake(function keysTake(H){
 const o=H.o,ui=K.ui;
 const card=doc.createElement('div');card.id='khost-keys';card.className='khost-chrome';
 card.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:30;display:none;max-width:min(560px,92vw);max-height:80vh;overflow:auto;padding:10px 14px;background:rgba(16,14,18,.94);border:1px solid rgba(216,200,154,.5);border-radius:4px;font:12px/1.45 system-ui,sans-serif;color:#f0e6cc';
 doc.body.appendChild(card);
 const has=r=>r.owner==='camera'||r.owner==='host'||(r.owner==='build'&&(K._std||[]).some(c=>c.std===r.id))||
  (r.id==='inspect'&&!!K.hover)||(r.id==='polygon'&&!!root.POLYTOOL)||(r.id==='marks'&&!!K.marks)||(r.id==='minimap'&&!!(K.minimap||doc.getElementById('khost-minimap')))||
  (r.id==='stocks'&&!!K.stocks)||(r.id==='editor'&&!!K.edit)||((r.id==='cutaway'||r.id==='storey')&&!!(K.cut&&K.cut.to));
 const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
 function fill(){const rows=M.filter(has).map(r=>'<tr><td style="padding:1px 10px 1px 0;color:#e0c98a;white-space:nowrap"><b>'+esc(r.label||'button')+'</b></td><td><b>'+esc(r.name)+'</b> · '+esc(r.what)+'</td></tr>');
  const std=new Set(M.map(r=>r.key).filter(Boolean)),own=Object.keys(o.keys||{}).filter(k=>!std.has(k)),KN=o.keyNames||{};
  const mine=own.map(k=>'<tr><td style="padding:1px 10px 1px 0;color:#e0c98a"><b>'+esc(k.toUpperCase())+'</b></td><td>'+esc(KN[k]||'this page\'s own')+'</td></tr>');
  card.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px"><b style="color:#e0c98a;letter-spacing:.06em;text-transform:uppercase">Keys</b><span style="opacity:.6">? or Esc closes</span></div>'+
   '<table style="border-collapse:collapse;margin-top:6px">'+rows.join('')+(mine.length?'<tr><td colspan="2" style="padding-top:6px;color:#e0c98a">this page</td></tr>'+mine.join(''):'')+'</table>';}
 K.keysCard=function(on){if(on==null)on=card.style.display==='none';if(on)fill();card.style.display=on?'block':'none';if(kb)kb.classList.toggle('on',on);return on;};
 /* the Keys button sits in the bar before #ui, not in it: tools/harness.py's smoke clicks every '#ui button' as a view */
 let kb=null;const bar=doc.getElementById('bar');if(bar){kb=doc.createElement('button');kb.textContent=words(BY.keys);kb.title=BY.keys.what;kb.id='khost-keys-btn';kb.onclick=()=>K.keysCard();bar.insertBefore(kb,ui&&ui.parentNode===bar?ui:null);}
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 /* the polygon tool cycles Polygon, Path, Inspect by its own buttons (#tools, 94-host-polytool.js) */
 function polyKey(){const T=doc.getElementById('tools');if(!T)return false;const B=[].slice.call(T.querySelectorAll('button')),by=t=>B.find(b=>b.textContent===t);
  const on=B.find(b=>b.classList.contains('on')),order=['Polygon','Path','Inspect'],cur=on?order.indexOf(on.textContent):-1,next=by(order[(cur+1)%order.length]);if(next)next.click();return true;}
 root.addEventListener('keydown',e=>{if(typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;
  if(k==='?'&&!(o.keys&&o.keys['?'])){K.keysCard();e.preventDefault();}
  else if(k==='Escape'&&card.style.display!=='none')K.keysCard(false);
  else if((k==='l'||k==='L')&&!(o.keys&&o.keys.l)&&polyKey())e.preventDefault();});
 /* the modules' buttons in the standard words, and the build's standard buttons painted from their state(), each frame */
 const RENAME={'khost-cut-btn':words(BY.cutaway)};let renamed=false;
 if(K.on)K.on(function keysPaint(){if(!renamed){for(const id in RENAME){const b=doc.getElementById(id);if(b){b.textContent=RENAME[id];b.title=BY.cutaway.what;}}renamed=true;}
  (K._std||[]).forEach(c=>{if(c.el&&c.state)c.el.classList.toggle('on',!!c.state());});},'after');
});
})(typeof window!=='undefined'?window:globalThis);
