// ---------- happenings: events that come round on their own ----------
// A scene with long quiet stretches and then something happening - a lander on Europa, a worm on Arrakis - wants
// the same furniture each time, so it is here once:
//
//   a notice      a line at the top saying what is happening, with a "Go and look" button that takes the camera
//                 there (a view function: () => [px,py,pz,tx,ty,tz]); given a subject as well (() => [x,y,z],
//                 or null once it is over), the camera then keeps it in frame as it moves - you can still
//                 turn and zoom round it - until it is over, you pick a viewpoint, or you press Stop
//   run(fn)       per-frame work for an event that is running: fn(now, dt) until it returns false
//   a scheduler   every minute or two one of `order` fires on its own; the Events button turns that off and
//                 fires any of them now - and one fired from there takes the camera to it at once (and follows
//                 it, if it moves), as the notice's button would
//   the address   #event=<name> fires one on arrival, and &eventlook goes straight to where it is happening
//   evspeed       #evspeed=N in the address runs every event's own clock N times faster: a way to watch a long
//                 chain (Minas Tirith's ships, then the Dead) through in a minute when working on it
//   active        a scene whose events only belong to one of its states (Minas Tirith's are the siege's) passes
//                 active: () => bool; while it is false nothing fires, and the Events button and notice go away
//
// createHappenings(api, {events: {key: [label, fn]}, order: [keys], first, every: [min, max] ms, active})

export function createHappenings(api,{events,order,first=25000,every=[60000,120000],colours={},active=null}){
  const {animHooks,HASH0}=api;
  const C=Object.assign({bg:'rgba(8,14,22,.86)',fg:'#dfe8ef',edge:'#4f6a80',btn:'rgba(30,50,70,.9)',btnEdge:'#6f8ca4'},colours);
  const hooks=[];let last=performance.now();
  const SPEED=Math.max(0.1,Math.min(20,parseFloat((/(^|&)evspeed=([0-9.]+)/.exec(HASH0||'')||[])[2])||1));
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000)*SPEED;last=now;
    for(let i=hooks.length-1;i>=0;i--){let r;try{r=hooks[i](now,dt);}catch(e){r=false;api.report&&api.report('event',e);}if(r===false)hooks.splice(i,1);}});
  const run=fn=>hooks.push(fn);

  const box=document.createElement('div');
  box.style.cssText=`position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:12;max-width:min(560px,92vw);display:none;background:${C.bg};color:${C.fg};border:1px solid ${C.edge};padding:9px 12px;font:13px/1.45 Georgia,serif;text-align:center`;
  box.setAttribute('role','status');box.setAttribute('aria-live','polite');
  document.body.appendChild(box);
  let boxT=0,lastView=null,lastSubject=null;
  const btnCss=`margin-left:6px;background:${C.btn};color:${C.fg};border:1px solid ${C.btnEdge};padding:2px 8px;cursor:pointer;font:12px Georgia,serif`;

  // ---- following ----
  // The engine's camera stack (ctx.pushCam) hands a frame function the orbit state after the controls have had
  // their turn. Following moves the orbit's target by however far the subject moved since the last frame, so
  // the turn, the height and the zoom stay yours; a viewpoint button makes a new flight goal, and that ends it.
  const chip=document.createElement('div');
  chip.style.cssText=`position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:12;display:none;background:${C.bg};color:${C.fg};border:1px solid ${C.edge};padding:4px 10px;font:12px Georgia,serif`;
  document.body.appendChild(chip);
  let unfollow=null;
  const V=p=>p?(Array.isArray(p)?p:[p.x,p.y,p.z]):null;
  function follow(subject,title){
    if(unfollow)unfollow();
    const ctl=api.ctl;if(!ctl||!api.ctx||!api.ctx.pushCam)return;
    const mine=ctl.goal;let last=null,pop=null;
    const stop=()=>{if(pop)pop();pop=null;chip.style.display='none';unfollow=null;};
    pop=api.ctx.pushCam((now,c)=>{
      if(c.goal&&c.goal!==mine){stop();return;}
      let p=null;try{p=V(subject());}catch(e){}
      if(!p||!p.every(Number.isFinite)){stop();return;}
      if(last){const dx=p[0]-last[0],dy=p[1]-last[1],dz=p[2]-last[2];
        c.target.x+=dx;c.target.y+=dy;c.target.z+=dz;if(c.goal){c.goal.target.x+=dx;c.goal.target.y+=dy;c.goal.target.z+=dz;}}
      last=p;});
    chip.textContent='Following: '+title+' ';
    const b=document.createElement('button');b.type='button';b.textContent='Stop';b.style.cssText=btnCss;b.onclick=stop;chip.appendChild(b);
    chip.style.display='';unfollow=stop;}

  function notice(title,text,view,subject){lastView=view||lastView;lastSubject=view?(subject?[subject,title]:null):lastSubject;
    box.innerHTML='';const h=document.createElement('b');h.textContent=title;box.append(h,document.createTextNode(' — '+text+' '));
    if(view&&api.setView){const b=document.createElement('button');b.type='button';b.textContent=subject?'Go and look (follow)':'Go and look';
      b.style.cssText=btnCss;
      b.onclick=()=>{api.setView(...view());box.style.display='none';if(subject)follow(subject,title);};box.appendChild(b);}
    box.style.display='';clearTimeout(boxT);boxT=setTimeout(()=>{box.style.display='none';},16000);}

  const log=[];
  const on=()=>!active||active();
  const fire=k=>{if(!on())return;try{events[k][1]();log.push(k);}catch(e){api.report&&api.report('event '+k,e);}};
  // fired by hand: go there. The view is taken a moment after, as for &eventlook, once the event has put its subject
  // where it belongs; an event that gave no view leaves the camera where it is.
  const fireAndLook=k=>{const before=lastView;lastView=null;fire(k);
    setTimeout(()=>{if(lastView&&api.setView){try{api.setView(...lastView());}catch(e){}box.style.display='none';if(lastSubject)follow(...lastSubject);}else if(!lastView)lastView=before;},300);};
  const R=Math.random;
  const auto={on:true,next:performance.now()+first,i:Math.floor(R()*order.length)};
  animHooks.push(now=>{if(!auto.on||now<auto.next)return;if(!on()){auto.next=now+5000;return;}auto.next=now+every[0]+R()*(every[1]-every[0]);fire(order[auto.i++%order.length]);});
  {const m=/(^|&)event=([a-z]+)/.exec(HASH0||'');
   // The view is taken a moment after the event fires, not at once: an event puts what it is about where it
   // belongs on its first frame, and a view worked out before that frames wherever the thing was made.
   if(m&&events[m[2]])setTimeout(()=>{fire(m[2]);if(/(^|&)eventlook(&|$)/.test(HASH0))setTimeout(()=>{if(lastView&&api.setView){api.setView(...lastView(),false);
     if(lastSubject)follow(...lastSubject);}},300);},800);}

  api.onUI(({ui,mkBtn})=>{
    const panel=document.createElement('div');
    panel.style.cssText=`position:fixed;left:10px;bottom:calc(var(--barh,44px) + 14px);z-index:11;display:none;flex-direction:column;gap:4px;background:${C.bg};border:1px solid ${C.edge};padding:8px;font:12px Georgia,serif;color:${C.fg}`;
    const head=document.createElement('div');head.textContent='Make something happen';panel.appendChild(head);
    for(const [k,[label]] of Object.entries(events))mkBtn(label,panel,()=>{fireAndLook(k);panel.style.display='none';});
    const ab=mkBtn('On their own: on',panel,()=>{auto.on=!auto.on;ab.textContent='On their own: '+(auto.on?'on':'off');if(auto.on)auto.next=performance.now()+20000;});
    document.body.appendChild(panel);
    const b=mkBtn('Events',ui,()=>{const o=panel.style.display==='none';panel.style.display=o?'flex':'none';b.setAttribute('aria-expanded',String(o));});
    b.setAttribute('aria-expanded','false');b.title=Object.values(events).map(e=>e[0]).join(', ');
    if(active){let shown=true;animHooks.push(()=>{const a=on();if(a===shown)return;shown=a;
      b.style.display=a?'':'none';if(!a){panel.style.display='none';box.style.display='none';if(unfollow)unfollow();b.setAttribute('aria-expanded','false');}});}});
  return {run,notice,fire,fireAndLook,follow,log,auto};
}
