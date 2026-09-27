// ---------- happenings: events that come round on their own ----------
// A scene with long quiet stretches and then something happening - a lander on Europa, a worm on Arrakis - wants
// the same furniture each time, so it is here once:
//
//   a notice      a line at the top saying what is happening, with a "Go and look" button that takes the camera
//                 there (a view function: () => [px,py,pz,tx,ty,tz])
//   run(fn)       per-frame work for an event that is running: fn(now, dt) until it returns false
//   a scheduler   every minute or two one of `order` fires on its own; the Events button turns that off and
//                 fires any of them now
//   the address   #event=<name> fires one on arrival, and &eventlook goes straight to where it is happening
//
// createHappenings(api, {events: {key: [label, fn]}, order: [keys], first, every: [min, max] ms})

export function createHappenings(api,{events,order,first=25000,every=[60000,120000],colours={}}){
  const {animHooks,HASH0}=api;
  const C=Object.assign({bg:'rgba(8,14,22,.86)',fg:'#dfe8ef',edge:'#4f6a80',btn:'rgba(30,50,70,.9)',btnEdge:'#6f8ca4'},colours);
  const hooks=[];let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
    for(let i=hooks.length-1;i>=0;i--){let r;try{r=hooks[i](now,dt);}catch(e){r=false;api.report&&api.report('event',e);}if(r===false)hooks.splice(i,1);}});
  const run=fn=>hooks.push(fn);

  const box=document.createElement('div');
  box.style.cssText=`position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:12;max-width:min(560px,92vw);display:none;background:${C.bg};color:${C.fg};border:1px solid ${C.edge};padding:9px 12px;font:13px/1.45 Georgia,serif;text-align:center`;
  box.setAttribute('role','status');box.setAttribute('aria-live','polite');
  document.body.appendChild(box);
  let boxT=0,lastView=null;
  function notice(title,text,view){lastView=view||lastView;box.innerHTML='';const h=document.createElement('b');h.textContent=title;box.append(h,document.createTextNode(' — '+text+' '));
    if(view&&api.setView){const b=document.createElement('button');b.type='button';b.textContent='Go and look';
      b.style.cssText=`margin-left:6px;background:${C.btn};color:${C.fg};border:1px solid ${C.btnEdge};padding:2px 8px;cursor:pointer;font:12px Georgia,serif`;
      b.onclick=()=>{api.setView(...view());box.style.display='none';};box.appendChild(b);}
    box.style.display='';clearTimeout(boxT);boxT=setTimeout(()=>{box.style.display='none';},16000);}

  const log=[];
  const fire=k=>{try{events[k][1]();log.push(k);}catch(e){api.report&&api.report('event '+k,e);}};
  const R=Math.random;
  const auto={on:true,next:performance.now()+first,i:Math.floor(R()*order.length)};
  animHooks.push(now=>{if(!auto.on||now<auto.next)return;auto.next=now+every[0]+R()*(every[1]-every[0]);fire(order[auto.i++%order.length]);});
  {const m=/(^|&)event=([a-z]+)/.exec(HASH0||'');
   if(m&&events[m[2]])setTimeout(()=>{fire(m[2]);if(/(^|&)eventlook(&|$)/.test(HASH0)&&lastView&&api.setView)api.setView(...lastView(),false);},800);}

  api.onUI(({ui,mkBtn})=>{
    const panel=document.createElement('div');
    panel.style.cssText=`position:fixed;left:10px;bottom:calc(var(--barh,44px) + 14px);z-index:11;display:none;flex-direction:column;gap:4px;background:${C.bg};border:1px solid ${C.edge};padding:8px;font:12px Georgia,serif;color:${C.fg}`;
    const head=document.createElement('div');head.textContent='Make something happen';panel.appendChild(head);
    for(const [k,[label]] of Object.entries(events))mkBtn(label,panel,()=>{fire(k);panel.style.display='none';});
    const ab=mkBtn('On their own: on',panel,()=>{auto.on=!auto.on;ab.textContent='On their own: '+(auto.on?'on':'off');if(auto.on)auto.next=performance.now()+20000;});
    document.body.appendChild(panel);
    const b=mkBtn('Events',ui,()=>{const o=panel.style.display==='none';panel.style.display=o?'flex':'none';b.setAttribute('aria-expanded',String(o));});
    b.setAttribute('aria-expanded','false');b.title=Object.values(events).map(e=>e[0]).join(', ');});
  return {run,notice,fire,log,auto};
}
