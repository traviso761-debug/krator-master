// Diagnostics and the staged build: every error goes on screen, one section failing does not stop the rest,
// and the build yields between stages so the loading line can show progress (timings in LOAD.times; ?debug prints them).
const seen=new Set();
let errBox=null;
export function report(where,e){const msg=where+': '+(e&&e.message?e.message:e)+'\n'+(e&&e.stack?e.stack.split('\n').slice(0,4).join('\n'):'');if(seen.has(msg))return;seen.add(msg);
  if(!errBox)errBox=document.getElementById('errs');if(errBox){errBox.style.display='block';errBox.textContent+=msg+'\n\n';}else console.error(msg);}
export function installErrorHandlers(){window.addEventListener('error',ev=>report('window',ev.error||ev.message));window.addEventListener('unhandledrejection',ev=>report('promise',ev.reason));}
export function section(name,fn){const was=globalThis.__stage;globalThis.__stage=name;try{fn();}catch(e){report(name,e);}finally{globalThis.__stage=was;}}   // __stage: which stage is running (drawstats.js labels by it)
export const LOAD={t0:performance.now(),last:performance.now(),paint:performance.now(),name:'terrain',times:[]};
// ---------- the loading screen ----------
// Two lines. The top one says what the build is doing right now and comes from `labels`; the bottom one is
// a note about the place, and it changes every couple of seconds while you wait. Kerbal Space Program is
// the obvious ancestor and it is a better idea than it looks: a progress line tells you the machine is
// working, and a line about the place tells you why you are waiting for it. They are drawn from `lines`,
// shuffled so the same one does not come up twice running, and the timer stops itself when the overlay is
// taken off the page.
const cfg={prefix:'loading… ',labels:{},lines:[],lineMs:2400,lineMinMs:550,el:'loading'};
export function configureLoading(o){Object.assign(cfg,o);}
let stageEl=null,lineEl=null,lineTimer=0,bag=[],lineAt=0;
function showLine(){
  if(!lineEl||!cfg.lines.length)return;
  lineAt=performance.now();
  lineEl.style.opacity='0';
  setTimeout(()=>{if(lineEl){lineEl.textContent=nextLine();lineEl.style.opacity='';}},160);
}
function nextLine(){
  if(!cfg.lines.length)return '';
  if(!bag.length){bag=cfg.lines.slice();
    for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=bag[i];bag[i]=bag[j];bag[j]=t;}}
  return bag.pop();
}
function mountLoading(){
  const el=document.getElementById(cfg.el);
  if(!el||stageEl)return el;
  el.textContent='';el.classList.add('two-line');
  stageEl=document.createElement('div');stageEl.className='load-stage';
  lineEl=document.createElement('div');lineEl.className='load-line';
  el.append(stageEl,lineEl);
  if(cfg.lines.length){
    lineEl.textContent=nextLine();lineAt=performance.now();
    lineTimer=setInterval(()=>{
      if(!el.isConnected){clearInterval(lineTimer);lineTimer=0;return;}
      showLine();
    },cfg.lineMs);
  }
  return el;
}
export function stage(name){const now=performance.now();LOAD.times.push({stage:LOAD.name,ms:Math.round(now-LOAD.last)});LOAD.last=now;LOAD.name=name;
  const el=mountLoading();
  // A label the page deliberately set to '' means "say nothing about this stage", not "print the stage's
  // internal name", which is what the old fallback did: City 17 and Rivendell both showed a bare `el`.
  if(el&&stageEl)stageEl.textContent=cfg.prefix+(cfg.labels[name]!==undefined?cfg.labels[name]:name.replace(/-/g,' '));
  // A page that loads in a second would otherwise only ever show one note, so a new stage moves it on too -
  // with a floor under it, or a burst of quick stages flickers.
  if(el&&performance.now()-lineAt>cfg.lineMinMs)showLine();
  if(now-LOAD.paint<70)return null;LOAD.paint=now;
  return new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;LOAD.paint=performance.now();setTimeout(r,0);}};requestAnimationFrame(go);setTimeout(go,120);});}
