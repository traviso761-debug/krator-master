// ---------- Galaxy class: the side panels ----------
// Original work. One look for the panels the ship's departments open at the right of the screen (comms.js,
// orders.js, sensors.js): a title, a close button, and a body the module fills. One is open at a time; Escape
// closes it. Buttons inside are rebuilt only when what they offer changes (a button rebuilt under the pointer
// cannot be clicked).
let styled=false;
const CSS=`
.entside{position:fixed;right:10px;top:56px;width:min(370px,calc(100% - 20px));max-height:calc(100% - 64px - var(--barh,56px));overflow:hidden auto;display:none;
  box-sizing:border-box;padding:8px;background:rgba(8,20,34,.95);border:1px solid #3f5a74;color:#dfe8f0;font:13px/1.45 Helvetica,Arial,sans-serif;z-index:7}
.entside.open{display:block}
.entside .hd{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.entside .hd b{flex:1;letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:#9fb4c8}
.entside button{padding:5px 9px;font:13px Helvetica,Arial,sans-serif;background:rgba(10,24,40,.8);color:#dfe8f0;border:1px solid #3f5a74;border-radius:2px;cursor:pointer}
.entside button:hover,.entside button:focus-visible{border-color:#9fc8f0}
.entside button[aria-pressed="true"]{background:#7fa6c8;color:#08131f}
.entside .card{margin:6px 0;padding:6px 8px;border-left:3px solid #e8c98a;background:rgba(20,34,52,.6)}
.entside .card.foe{border-left-color:#ff6a5a}.entside .card.ok{border-left-color:#7fc8a0}
.entside .card b{color:#ffe2a8}.entside .acts{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
.entside small{opacity:.75;font-size:11px}
.entside .row{display:flex;justify-content:space-between;gap:10px;font-size:12px;border-bottom:1px solid rgba(63,90,116,.35);padding:1px 0}
.entside .row span:first-child{opacity:.7}.entside .row span:last-child{text-align:right}
.entside .meter{height:4px;background:#1c2c3e;margin:3px 0 1px}.entside .meter i{display:block;height:100%;background:#7fc8a0}
.entside .log p{margin:3px 0;font-size:12px}.entside .log em{color:#9fb4c8;font-style:normal;margin-right:5px}
.entside ul{margin:4px 0;padding-left:18px}.entside li{margin:2px 0}.entside li.done{opacity:.55;text-decoration:line-through}
.entside li.now{color:#ffe2a8}
.entside .say{font-style:italic;color:#cfe0f0}
body.bare .entside{display:none!important}`;

export function sidePanel(id,title,onToggle){
  if(!styled){styled=true;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);}
  const el=document.createElement('div');el.id=id;el.className='entside';el.setAttribute('role','dialog');el.setAttribute('aria-label',title);
  const head=document.createElement('div');head.className='hd';
  const b=document.createElement('b');b.textContent=title;
  const x=document.createElement('button');x.type='button';x.textContent='Close';x.setAttribute('aria-label','Close '+title);
  head.append(b,x);const body=document.createElement('div');body.className='bd';el.append(head,body);document.body.appendChild(el);
  const P={el,body,
    open:()=>el.classList.contains('open'),
    toggle(o){o=o==null?!P.open():!!o;
      if(o)for(const q of document.querySelectorAll('.entside.open'))if(q!==el)q.dispatchEvent(new Event('entclose'));
      el.classList.toggle('open',o);if(onToggle)onToggle(o);}};
  x.onclick=()=>P.toggle(false);el.addEventListener('entclose',()=>P.toggle(false));
  return P;
}
// a little DOM: el('div','card',['text', node, ...])
export function el(tag,cls,kids){
  const e=document.createElement(tag);if(cls)e.className=cls;
  for(const k of [].concat(kids==null?[]:kids))e.append(k&&k.nodeType?k:document.createTextNode(String(k)));
  return e;
}
export function button(label,fn,aria){const b=el('button',null,label);b.type='button';if(aria)b.setAttribute('aria-label',aria);b.onclick=fn;return b;}
export const row=(k,v)=>el('div','row',[el('span',null,k),el('span',null,v)]);
export const typing=e=>e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test((e.target&&e.target.tagName)||'');
// the same pseudo-random numbers from the same name, every time
export function seeded(str){let s=[...String(str)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,2166136261);
  return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
