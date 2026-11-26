// ---------- photo mode, for every ship page that asks for it ----------
// Original work. Freeze the scene where it is, free the camera, hide the interface, save a picture.
//
// Frozen means the page's frame hooks stop: the ship, the events, the traffic and the sky all hold exactly where
// they were, and only the camera moves. It is the turntable that moves it, aimed at the ship wherever the ship is
// (at the helm she may be kilometres from where the page began) from wherever the camera was, so the first frame
// of photo mode is the frame you asked for. The lens (wide, normal, long) is the only thing the turntable does
// not already do. The picture is the canvas, drawn once more and read back in the same task, so the page needs no
// preserved drawing buffer (which would cost every other frame something).
//
// Leaving gives everything back: the hooks run on, the turntable goes back to where it was, the lens to what it
// was. A model that flies (the Enterprise) has its own camera at the helm, which simply carries on.
const CSS=`
html.ssphoto body *{visibility:hidden!important}
html.ssphoto canvas.ss-main,html.ssphoto #ssphotobar,html.ssphoto #ssphotobar *{visibility:visible!important}
#ssphotobar{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:40;display:none;align-items:center;flex-wrap:wrap;justify-content:center;gap:6px;
  max-width:calc(100% - 20px);box-sizing:border-box;padding:6px 10px;background:rgba(6,10,18,.72);border:1px solid rgba(255,204,153,.55);border-radius:18px;
  font:12px/1.3 Helvetica,Arial,sans-serif;color:#ffcc99;letter-spacing:.06em}
html.ssphoto #ssphotobar{display:flex}
#ssphotobar.min{opacity:.18}#ssphotobar.min:hover{opacity:1}
#ssphotobar b{color:#ff9966;letter-spacing:.18em;margin-right:4px}
#ssphotobar button{font:12px Helvetica,Arial,sans-serif;padding:4px 10px;border:0;border-radius:12px;background:#cc99cc;color:#120a12;cursor:pointer}
#ssphotobar button[aria-pressed="true"]{background:#ffcc66}
#ssphotobar button.go{background:#ff9966}
#ssphotobar span{opacity:.8}`;

const LENSES=[['Wide',72],['Normal',48],['Long',22]];

// V is the page's turntable (az, el, d, tx, ty, tz, roll); target() is where the subject is, in the world
export function photoMode({THREE,renderer,scene,camera,V,target,name}){
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  renderer.domElement.classList.add('ss-main');
  const bar=document.createElement('div');bar.id='ssphotobar';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Photo mode');
  const b=document.createElement('b');b.textContent='PHOTO';
  const hint=document.createElement('span');hint.textContent='drag to frame · scroll to stand off · WASD, Q and E to move ·';
  bar.append(b,hint);
  const btn=(t,f,cls)=>{const x=document.createElement('button');x.type='button';x.textContent=t;if(cls)x.className=cls;x.onclick=f;bar.appendChild(x);return x;};
  const lensB=LENSES.map(([t,f])=>btn(t,()=>lens(f)));
  btn('Save picture',()=>save(),'go');
  btn('Fade bar',()=>bar.classList.toggle('min'));
  btn('Leave',()=>toggle(false));
  document.body.appendChild(bar);

  let on=false,keep=null,fov0=camera.fov;
  const lens=f=>{camera.fov=f;camera.updateProjectionMatrix();lensB.forEach((x,i)=>x.setAttribute('aria-pressed',String(LENSES[i][1]===f)));};
  function toggle(o){
    o=o==null?!on:!!o;if(o===on)return;on=o;
    document.documentElement.classList.toggle('ssphoto',on);
    if(on){
      keep={...V};fov0=camera.fov;
      // the turntable, aimed at the subject from where the camera is now
      const t=target?target():new THREE.Vector3(),rel=camera.position.clone().sub(t),d=Math.max(1,rel.length());
      Object.assign(V,{tx:t.x,ty:t.y,tz:t.z,d,az:Math.atan2(rel.z,rel.x),el:Math.asin(Math.max(-1,Math.min(1,rel.y/d))),roll:0});
      lens(LENSES.reduce((a,l)=>Math.abs(l[1]-camera.fov)<Math.abs(a-camera.fov)?l[1]:a,48));
    }else{if(keep)Object.assign(V,keep);camera.fov=fov0;camera.updateProjectionMatrix();}
  }
  function save(){
    // drawn and read in one go: the drawing buffer is still there until the task ends
    renderer.render(scene,camera);
    let url;try{url=renderer.domElement.toDataURL('image/png');}catch(e){return;}
    const a=document.createElement('a'),d=new Date(),p=n=>String(n).padStart(2,'0');
    a.download=(name||'ship')+'-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())+'.png';
    a.href=url;document.body.appendChild(a);a.click();a.remove();
  }
  // While frozen, the page's own keys (the helm's, the panels') are held back: only the turntable's movement
  // keys, Shift and Escape get through. Escape leaves.
  addEventListener('keydown',e=>{if(!on)return;const k=e.key.toLowerCase();
    if(k==='escape'){toggle(false);e.stopImmediatePropagation();return;}
    if(!['w','a','s','d','q','e','shift'].includes(k))e.stopImmediatePropagation();},true);
  return {on:()=>on,toggle,save};
}
