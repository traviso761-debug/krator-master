// ---------- the view from the bridge, for every ship page that has one ----------
// Original work. A camera at the bridge's forward window, looking out over the hull, with LCARS chrome round it:
// elbows in the four corners, a title bar, and a line of readouts along the foot. The chrome is drawn in the
// page, not on the canvas, so it costs the renderer nothing and a photo (photo.js) leaves it out.
//
// A model offers it as `bridge` in what model() returns:
//   eye(v)      where the eye is, in the world, written into v
//   quat(q)     the ship's turn in the world (+x forward, +y up), written into q
//   down        how far below level the eye looks, radians (a bridge looks out over its own bow)
//   title       the bar's title; `readout()` the line along the foot (four times a second)
//   active()    true while the model's own camera is on the bridge (the Enterprise's helm has one): the chrome
//               shows then too, and the page's bridge camera stays out of the way
//   enter()     the model's own way in, if it has one (at the helm, the helm's bridge camera); true if it took it
// At the turntable the bridge view is the page's: drag looks round (a hundred degrees either way, sixty up and
// down), the wheel is the zoom of the viewscreen, Escape or the Views panel leaves.
const CSS=`
#ssbridge{position:fixed;inset:0;pointer-events:none;z-index:2;display:none;font:600 12px/1 "Helvetica Neue",Helvetica,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#000}
#ssbridge.on{display:block}
#ssbridge .el{position:absolute;width:150px;height:62px;border:0 solid #ff9966}
#ssbridge .tl{left:8px;top:var(--sstop,92px);border-width:22px 0 0 64px;border-top-left-radius:46px;border-color:#ff9966}
#ssbridge .bl{left:8px;bottom:calc(var(--barh,56px) + 10px);border-width:0 0 22px 64px;border-bottom-left-radius:46px;border-color:#cc99cc}
#ssbridge .tr{right:8px;top:var(--sstop,92px);border-width:22px 64px 0 0;border-top-right-radius:46px;border-color:#9999ff}
#ssbridge .br{right:8px;bottom:calc(var(--barh,56px) + 10px);border-width:0 64px 22px 0;border-bottom-right-radius:46px;border-color:#ffcc66}
#ssbridge .bar{position:absolute;height:22px;display:flex;align-items:center;gap:8px;white-space:nowrap;overflow:hidden}
#ssbridge .top{left:166px;right:166px;top:var(--sstop,92px)}
#ssbridge .foot{left:166px;right:166px;bottom:calc(var(--barh,56px) + 10px)}
#ssbridge .bar i{flex:1;height:22px;background:#ff9966;border-radius:2px}
#ssbridge .bar i.b{background:#9999ff}#ssbridge .bar i.c{background:#cc99cc}#ssbridge .bar i.d{background:#ffcc66;flex:0 0 40px}
#ssbridge .bar span{color:#ffcc99;padding:0 6px;font-size:13px}
#ssbridge .ro{color:#ffcc99;font-weight:400;letter-spacing:.08em;text-transform:none;font-size:12px}
#ssbridge .side{position:absolute;width:64px;display:flex;flex-direction:column;gap:6px}
#ssbridge .side.l{left:8px;top:calc(var(--sstop,92px) + 92px);bottom:calc(var(--barh,56px) + 102px)}
#ssbridge .side.r{right:8px;top:calc(var(--sstop,92px) + 92px);bottom:calc(var(--barh,56px) + 102px)}
#ssbridge .side i{flex:1;border-radius:2px;background:#cc99cc;color:#000;font-style:normal;font-size:10px;padding:4px;box-sizing:border-box;text-align:right;display:flex;align-items:flex-end;justify-content:flex-end}
#ssbridge .side i:nth-child(2n){background:#9999ff}#ssbridge .side i:nth-child(3n){background:#ff9966}
#ssbridge .side i.blink{animation:ssblink 2.4s steps(2) infinite}
@keyframes ssblink{50%{background:#ffcc66}}
#ssbridge button{pointer-events:auto;position:absolute;right:84px;top:calc(var(--sstop,92px) + 30px);font:600 11px Helvetica,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;
  padding:5px 12px;border:0;border-radius:12px;background:#ff9966;color:#000;cursor:pointer}
html.alert #ssbridge .el,html.alert #ssbridge .bar i{border-color:#ff3322;background:#ff3322}
html.alert #ssbridge .el{background:transparent}
html.alert #ssbridge .side i{background:#aa2211;color:#fff}
@media (max-width:640px){#ssbridge .side{display:none}#ssbridge .el{width:90px;height:44px}#ssbridge .top,#ssbridge .foot{left:104px;right:104px}#ssbridge button{right:40px}}
#ssbridge.model .side{display:none}
body.bare #ssbridge{display:none!important}`;

export function bridgeView({THREE,camera,B}){
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const root=document.createElement('div');root.id='ssbridge';root.setAttribute('aria-hidden','true');
  const mk=(cls,html)=>{const d=document.createElement('div');d.className=cls;if(html)d.innerHTML=html;root.appendChild(d);return d;};
  for(const c of ['el tl','el tr','el bl','el br'])mk(c);
  const top=mk('bar top','<i></i><span></span><i class="b"></i><i class="d"></i>');
  top.querySelector('span').textContent=B.title||'Main viewer';
  const foot=mk('bar foot','<i class="c"></i><span class="ro"></span><i class="d"></i>'),ro=foot.querySelector('.ro');
  // the side columns: numbered blocks, as a bridge console has, one blinking
  for(const s of ['l','r']){const d=mk('side '+s);for(let i=0;i<5;i++){const x=document.createElement('i');x.textContent=String(((s==='l'?47:12)+i*137)%1000).padStart(3,'0')+'-'+(i*31%97);
    if((s==='l'&&i===2)||(s==='r'&&i===4))x.className='blink';d.appendChild(x);}}
  const leave=document.createElement('button');leave.type='button';leave.textContent='Leave the bridge';root.appendChild(leave);
  document.body.appendChild(root);

  let on=false,yaw=0,pitch=0,fov=58,fov0=camera.fov,shown=false,roT=0;
  const q=new THREE.Quaternion(),v=new THREE.Vector3(),up=new THREE.Vector3(),t=new THREE.Vector3();
  function toggle(o){
    o=o==null?!on:!!o;
    if(o&&!on&&B.enter&&B.enter()){return;}
    if(o===on)return;on=o;
    if(on){fov0=camera.fov;yaw=0;pitch=0;fov=58;}else{camera.fov=fov0;camera.updateProjectionMatrix();}
    leave.style.display=on?'':'none';
  }
  leave.onclick=()=>toggle(false);
  addEventListener('keydown',e=>{if(on&&e.key==='Escape')toggle(false);});
  // the camera, when the page's bridge view is on
  function frame(){
    B.eye(v);B.quat(q);
    const p=pitch-(B.down||0);
    t.set(Math.cos(p)*Math.cos(yaw),Math.sin(p),-Math.cos(p)*Math.sin(yaw)).applyQuaternion(q).add(v);
    camera.position.copy(v);camera.up.copy(up.set(0,1,0).applyQuaternion(q));camera.lookAt(t);
    if(Math.abs(camera.fov-fov)>0.01){camera.fov=fov;camera.updateProjectionMatrix();}
  }
  // the chrome, every frame: on while either bridge camera is
  function chrome(now){
    const show=on||!!(B.active&&B.active());
    // (the model's own bridge camera has its own controls on the screen, the helm's: the side columns make way)
    if(show!==shown){shown=show;root.classList.toggle('on',show);root.classList.toggle('model',show&&!on);leave.style.display=on?'':'none';}
    if(show&&B.readout&&now-roT>250){roT=now;ro.textContent=B.readout()||'';}
  }
  return {on:()=>on,toggle,frame,chrome,
    look:(dx,dy)=>{yaw=Math.max(-1.75,Math.min(1.75,yaw+dx*0.004*fov/58));pitch=Math.max(-1.05,Math.min(1.05,pitch+dy*0.004*fov/58));},
    zoom:f=>{fov=Math.max(12,Math.min(75,fov*f));}};
}
