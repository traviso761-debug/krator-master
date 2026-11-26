// ---------- Galaxy class: orders against the clock ----------
// Original work. Some orders run against a clock (orders.js gives a mission a `clock`: what is running out, how many
// seconds it has): life support failing aboard a disabled ship, the injured on a world waiting for a medical team.
// The clock starts when the orders are accepted and shows in the orders panel and on the HUD, counting down. Until it
// runs out everyone can still be saved; after it, the share that can be falls steadily over the grace that follows
// (two minutes, say) to a floor (a quarter: some always hold on). The mission's own code reads W.clock.frac() when it
// takes them off, and the log says how many were lost. It stops when the mission's `until` says so, or the mission
// is over or abandoned. #clock=k scales every clock by k.
import {el} from './ui.js';

export function clock(W){
  const {animHooks}=W;
  let c=null;
  const box=el('div','card clock'),txt=el('b'),bar=el('i'),meter=el('div','meter',[bar]),say=el('div','say');box.append(txt,meter,say);
  {const s=document.createElement('style');s.textContent='.entside .card.clock{border-left-color:#ff9a5a}.entside .card.clock b{font-size:15px;letter-spacing:.04em}.entside .card.clock.late{border-left-color:#ff5a5a}';document.head.appendChild(s);}
  // the events' clock (game time: it runs with the frames, as everything else in a fight does)
  const now=()=>W.fx?W.fx.T():performance.now()/1000;
  const left=()=>c?(c.stopped!=null?c.stopped:c.secs-(now()-c.t0)):0;
  // the share that can still be saved, 1 down to the floor
  const frac=()=>{if(!c)return 1;const l=left();return l>=0?1:Math.max(c.floor,1-(1-c.floor)*(-l)/c.grace);};
  // (#clock=k scales every clock by k, for a test that wants to see one run out)
  function start(spec){const k=W.clockScale||1;c={label:spec.label,secs:spec.secs*k,grace:(spec.grace||120)*k,floor:spec.floor==null?0.25:spec.floor,until:spec.until,apply:spec.apply,
    t0:now(),stopped:null,kind:W.orders&&W.orders.state?W.orders.state().active:null,warned:0};paint();}
  function stop(){if(c&&c.stopped==null)c.stopped=left();}
  const mmss=s=>(s<0?'-':'')+Math.floor(Math.abs(s)/60)+':'+String(Math.floor(Math.abs(s)%60)).padStart(2,'0');
  function paint(){if(!c)return;const l=left(),f=frac();
    txt.textContent=c.label+': '+(c.stopped!=null?'done':l>0?mmss(l):'failed');
    bar.style.width=Math.max(0,Math.min(100,l>0?l/c.secs*100:f*100))+'%';bar.style.background=l>60?'#e8c98a':l>0?'#ff9a5a':'#ff5a5a';
    say.textContent=l>0?'Everyone can still be saved.':'Too late for some: about '+Math.round((1-f)*100)+'% are lost, and more every minute.';
    box.classList.toggle('late',l<=0);}
  let pT=0;
  animHooks.push(()=>{if(!c||c.stopped!=null)return;const t=now()*1000;
    // over when the mission says so, or when it is no longer the one running
    const k=W.orders&&W.orders.state?W.orders.state().active:null;if(k!==c.kind||c.until&&c.until()){stop();paint();return;}
    if(c.apply)c.apply(frac());
    const l=left();if(l<60&&c.warned<1){c.warned=1;W.toast&&W.toast('Orders',' One minute left: '+c.label.toLowerCase()+'.');}
    if(l<0&&c.warned<2){c.warned=2;W.toast&&W.toast('Orders',' Too late for some of them: '+c.label.toLowerCase()+' has failed. Every minute now costs lives.');}
    if(t-pT>250){pT=t;paint();}});
  // the orders say when a mission is taken up and when it is given up (orders.js)
  W.on('accepted',m=>{if(m&&m.clock)start(m.clock);});W.on('abandoned',()=>stop());
  W.clock={start,stop,frac,left,el:()=>{paint();return box;},on:()=>!!c&&c.stopped==null};
  {const h=new URLSearchParams(location.hash.slice(1));if(h.has('clock'))W.clockScale=+h.get('clock');}
  return {hud:()=>c&&c.stopped==null?c.label.toLowerCase().replace(/ aboard.*| on .*/,'')+' '+mmss(left()):'',state:()=>c&&{label:c.label,left:Math.round(left()),frac:+frac().toFixed(2),stopped:c.stopped!=null}};
}
