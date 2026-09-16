// Diagnostics and the staged build: every error goes on screen, one section failing does not stop the rest,
// and the build yields between stages so the loading line can show progress (timings in LOAD.times; ?debug prints them).
const seen=new Set();
let errBox=null;
export function report(where,e){const msg=where+': '+(e&&e.message?e.message:e)+'\n'+(e&&e.stack?e.stack.split('\n').slice(0,4).join('\n'):'');if(seen.has(msg))return;seen.add(msg);
  if(!errBox)errBox=document.getElementById('errs');if(errBox){errBox.style.display='block';errBox.textContent+=msg+'\n\n';}else console.error(msg);}
export function installErrorHandlers(){window.addEventListener('error',ev=>report('window',ev.error||ev.message));window.addEventListener('unhandledrejection',ev=>report('promise',ev.reason));}
export function section(name,fn){try{fn();}catch(e){report(name,e);}}
export const LOAD={t0:performance.now(),last:performance.now(),paint:performance.now(),name:'terrain',times:[]};
const cfg={prefix:'loading… ',labels:{},el:'loading'};
export function configureLoading(o){Object.assign(cfg,o);}
export function stage(name){const now=performance.now();LOAD.times.push({stage:LOAD.name,ms:Math.round(now-LOAD.last)});LOAD.last=now;LOAD.name=name;
  const el=document.getElementById(cfg.el);if(el)el.textContent=cfg.prefix+(cfg.labels[name]||name.replace(/-/g,' '));
  if(now-LOAD.paint<70)return null;LOAD.paint=now;
  return new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;LOAD.paint=performance.now();setTimeout(r,0);}};requestAnimationFrame(go);setTimeout(go,120);});}
