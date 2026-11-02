// ---------- Galaxy class: stellar cartography, markers, and the impulse autopilot ----------
// Fan work. Star Trek belongs to Paramount; the places, the starbases and the ships are this project's own.
//
// Three things that make it easy to find your way:
//
//   The autopilot   W.goto({name, pos, stop, done}) flies the ship at impulse to a point (a starbase, a planet, a ship,
//                   anything with a position), turning onto it at the helm's own rate, running up to full impulse and
//                   slowing as it closes so that it stops `stop` metres short. A planet is then orbited; a starbase
//                   is handed to approach control (starbases.js). Any touch on the helm takes it back.
//   Markers         a bracket on screen round each starbase in the place you are at, with its name and range, and an
//                   arrow at the edge of the screen when it is off it or behind you. L cycles them: the starbases
//                   (and whatever the autopilot is flying to), everything (planets, moons, other ships), none. A
//                   marker is a button: click it to go there.
//   Cartography     P, or the Cartography button: a big chart in two scales. Sector is the chart of light-years, with
//                   the starbases at each place, rings of range round the ship and the time to each place at the warp
//                   factor set; System is the place you are at, from above, to scale: planets, moons, starbases,
//                   ships, you, and the autopilot's line. Click anything on either to read about it and go there.
import {PLACES} from './places.js';
import {FULL,lyps} from './flight.js';
import {stationsAt} from './starbases.js';

export function cartography(W){
  const {THREE,ROOT,SYS,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const km=d=>d<1000?Math.round(d)+' m':Math.round(d/1000).toLocaleString('en')+' km';

  // ================= the impulse autopilot =================
  const go={t:null,d:0};
  W.goto=t=>{
    if(S.warp){F.note('Drop out of warp first.');return;}
    if(!S.on)W.startFlight();
    S.orbit=null;if(W.course)W.course.clear();go.t=t;
    if(!t.quiet)F.note('Impulse to '+t.name+', '+km(t.pos().distanceTo(ROOT.position))+'.');
  };
  W.autoDir=()=>go.t?go.t.pos().sub(ROOT.position).normalize():null;
  {const prev=W.cancelAuto;W.cancelAuto=quiet=>{if(go.t&&!quiet&&!go.t.quiet)F.note('Autopilot off.');go.t=null;prev&&prev(quiet);};}
  animHooks.push(()=>{const t=go.t;if(!t)return;
    if(!S.on||S.warp){go.t=null;return;}
    const d=t.pos().distanceTo(ROOT.position)-(t.stop||0);go.d=d;
    if(d<0||d<600&&S.v<150){go.t=null;W.setThrottle(0);if(!t.quiet)F.note('Arrived: '+t.name+'.');if(t.done)t.done();return;}
    // the speed asked for: full impulse far off, then the speed it can still stop from in the distance left (the helm
    // brakes in proportion to the speed it has to lose, so this is a steady deceleration of about 300 m/s/s, with a
    // margin: asked to slow in proportion to the distance instead, it came in at 8 km/s with half a kilometre to go),
    // and held down while it turns onto the line
    const err=S.steerErr==null?1:S.steerErr,v=Math.min(FULL,Math.max(40,0.75*Math.sqrt(600*d)))*Math.max(0.04,1-err/0.8);
    W.setThrottle(Math.sqrt(v/FULL));});
  const orbitOnArrival=()=>{for(const type of ['keydown','keyup'])dispatchEvent(new KeyboardEvent(type,{key:'o'}));};

  // ================= what is here =================
  const wp=V();
  const contacts=()=>{
    const pl=W.herePlace();if(!pl||!pl.group.visible||S.warp)return [];
    const out=[];
    for(const s of pl.solids){if(s.station||/^a rock$/.test(s.name))continue;out.push({kind:s.gate?'gate':s.orbit?'body':'object',name:s.name,local:s.c,r:s.r,gate:s.gate});}
    for(const st of W.stations)if(st.place===pl)out.push({kind:'station',name:st.name,local:st.g.position,r:560,st,note:st.note});
    if(W.traffic)for(const t of W.traffic.here())out.push({kind:'ship',name:t.name,local:t.g.position,r:150,ship:t,note:t.info.info});
    if(W.foes)for(const f of W.foes())out.push({kind:'foe',name:f.K.name,local:pl.group.worldToLocal(f.m.g.getWorldPosition(V())),r:120,foe:f});
    for(const c of out){c.world=SYS.localToWorld(c.local.clone());c.d=Math.max(0,c.world.distanceTo(ROOT.position)-(c.kind==='body'?c.r:0));}
    return out;
  };
  // going to one: a starbase docks, a planet is orbited, anything else is approached and the ship stops short of it
  function goTo(c){
    if(c.kind==='station'){W.dock(c.st);return;}
    if(c.kind==='gate'){const local=c.local.clone();W.goto({name:c.name,pos:()=>SYS.localToWorld(local.clone()),stop:-c.r});return;}
    if(c.kind==='foe'){const g=c.foe.m.g;W.goto({name:c.name,pos:()=>g.getWorldPosition(V()),stop:3000,done:()=>F.note('In weapons range of the '+c.name+'.')});return;}
    if(c.kind==='ship'){const g=c.ship.g;W.goto({name:c.name,pos:()=>g.getWorldPosition(V()),stop:2500,done:()=>F.note('Alongside '+c.name+'.')});return;}
    const local=c.local.clone();
    W.goto({name:c.name,pos:()=>SYS.localToWorld(local.clone()),stop:c.kind==='body'?c.r*1.35:c.r+1500,done:c.kind==='body'?orbitOnArrival:null});
  }
  W.goContact=goTo;W.contacts=contacts;

  // ================= markers =================
  const st=document.createElement('style');st.textContent=`
#ent-marks{position:fixed;inset:0;pointer-events:none;z-index:3;overflow:hidden}
#ent-marks .mk{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;font:11px/1.3 Helvetica,Arial,sans-serif;color:#ffd890;white-space:nowrap;background:none;border:0;padding:0;text-align:left}
#ent-marks .mk i{position:absolute;left:-11px;top:-11px;width:20px;height:20px;border:1.5px solid currentColor;border-radius:2px;opacity:.9;box-sizing:border-box;
  clip-path:polygon(0 0,35% 0,35% 12%,65% 12%,65% 0,100% 0,100% 35%,88% 35%,88% 65%,100% 65%,100% 100%,65% 100%,65% 88%,35% 88%,35% 100%,0 100%,0 65%,12% 65%,12% 35%,0 35%)}
#ent-marks .mk span{position:absolute;left:14px;top:-8px;text-shadow:0 0 3px #000,0 0 2px #000}
#ent-marks .mk.off i{display:block;border:0;width:0;height:0;left:-7px;top:-7px;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:13px solid currentColor;clip-path:none}
#ent-marks .mk.left span{left:auto;right:14px}
#ent-marks .mk.foe{color:#ff6a5a}#ent-marks .mk.gate{color:#b8a0ff}#ent-marks .mk.body{color:#9fc8f0}#ent-marks .mk.ship{color:#9fe8b0}#ent-marks .mk.object{color:#c8c8d8}#ent-marks .mk.tgt{color:#fff2c0}
#ent-marks .mk.tgt i{border-width:2px}
body.bare #ent-marks{display:none}`;
  document.head.appendChild(st);
  const layer=document.createElement('div');layer.id='ent-marks';document.body.appendChild(layer);
  const MODES=['starbases','everything','none'];let mode=0;
  const pool=[];
  const mk=i=>{if(!pool[i]){const b=document.createElement('button');b.type='button';b.className='mk';b.append(document.createElement('i'),document.createElement('span'));
    b.onclick=()=>{const c=b._c;if(c){W.audio&&W.audio();goTo(c);}};layer.appendChild(b);pool[i]=b;}return pool[i];};
  const pc=V(),nd=V();
  function marks(camera){
    let n=0;
    if(MODES[mode]!=='none'){
      const tgt=go.t,dk=W.dockTarget&&W.dockTarget();
      for(const c of contacts()){
        // the autopilot's or docking's target, what the orders want and any hostile are always marked
        const isT=tgt&&tgt.name===c.name||dk&&dk===c.st||W.orderTarget&&W.orderTarget()===c.name;
        if(MODES[mode]==='starbases'&&c.kind!=='station'&&c.kind!=='foe'&&c.kind!=='gate'&&!isT)continue;
        pc.copy(c.world).applyMatrix4(camera.matrixWorldInverse);const behind=pc.z>0;
        nd.copy(c.world).project(camera);let x=nd.x,y=nd.y;if(behind){x=-x;y=-y;}
        const on=!behind&&Math.abs(x)<0.96&&Math.abs(y)<0.92;
        // a marker on the ship itself, or one too far inside a big planet's disc to be any help, is left out
        if(on&&c.d<1)continue;
        if(!on){if(Math.abs(x)<1e-6&&Math.abs(y)<1e-6)y=-1;const m=Math.max(Math.abs(x)/0.93,Math.abs(y)/0.86);x/=m;y/=m;}
        const b=mk(n++);b._c=c;
        b.className='mk '+c.kind+(isT?' tgt':'')+(on?'':' off');
        b.style.transform=`translate(${Math.round((x+1)/2*innerWidth)}px,${Math.round((1-y)/2*innerHeight)}px)`;
        b.firstChild.style.transform=on?'':'rotate('+Math.atan2(x,y)+'rad)';
        // the label on the side away from the edge, so it is never cut off
        b.classList.toggle('left',x>0.4);
        const label=c.name.replace(/^the /,'')+' · '+km(c.d);
        if(b.lastChild.textContent!==label)b.lastChild.textContent=label;
        b.setAttribute('aria-label',(c.kind==='station'?'Dock at ':'Go to ')+c.name+', '+km(c.d));
        b.style.display='';
      }}
    for(let i=n;i<pool.length;i++)pool[i].style.display='none';
  }
  W.preRender.push(marks);
  const cycleMarks=()=>{mode=(mode+1)%MODES.length;F.note('Markers: '+MODES[mode]+'.');syncBar();};

  // ================= the cartography panel =================
  const css=document.createElement('style');css.textContent=`
#cartopanel{position:fixed;left:50%;top:56px;transform:translateX(-50%);box-sizing:border-box;width:min(980px,calc(100% - 20px));max-height:calc(100% - 64px - var(--barh,56px));overflow:hidden auto;display:none;
  padding:8px;background:rgba(8,20,34,.95);border:1px solid #3f5a74;color:#dfe8f0;font:13px/1.45 Helvetica,Arial,sans-serif;z-index:7}
#cartopanel.open{display:block}
#cartopanel .bar{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-bottom:6px}#cartopanel .bar .sp{flex:1}
#cartopanel .bar b{letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:#9fb4c8;margin-right:8px}
#cartopanel button{padding:6px 10px;font:13px Helvetica,Arial,sans-serif;background:rgba(10,24,40,.8);color:#dfe8f0;border:1px solid #3f5a74;border-radius:2px;cursor:pointer}
#cartopanel button[aria-pressed="true"],#cartopanel button[aria-selected="true"]{background:#7fa6c8;color:#08131f}
#cartopanel canvas{display:block;width:100%;height:auto;background:#050a13;border:1px solid #2a3d52;cursor:crosshair;touch-action:none}
#cartopanel .info{min-height:44px;margin:6px 0;padding:6px 8px;border-left:3px solid #e8c98a;background:rgba(20,34,52,.6)}
#cartopanel .info b{color:#ffe2a8}#cartopanel .info .acts{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
#cartopanel .list{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:4px}
#cartopanel .list button{text-align:left}#cartopanel .list small{display:block;opacity:.75;font-size:11px}
#cartopanel .hint{opacity:.7;font-size:11px;margin-top:6px}
body.bare #cartopanel{display:none!important}`;
  document.head.appendChild(css);
  const panel=document.createElement('div');panel.id='cartopanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Stellar cartography');
  const el=(t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e;};
  const bar=el('div','bar'),title=el('b',null,'Stellar cartography');
  const tabSector=el('button',null,'Sector'),tabSystem=el('button',null,'System'),fitB=el('button',null,'Fit'),markB=el('button'),closeB=el('button',null,'Close');
  for(const b of [tabSector,tabSystem,fitB,markB,closeB])b.type='button';
  tabSector.setAttribute('role','tab');tabSystem.setAttribute('role','tab');
  bar.append(title,tabSector,tabSystem,fitB,el('span','sp'),markB,closeB);
  const cv=document.createElement('canvas');cv.setAttribute('aria-label','Chart');
  const info=el('div','info'),list=el('div','list'),hint=el('div','hint');
  panel.append(bar,cv,info,list,hint);document.body.appendChild(panel);

  const C={view:'sector',sel:null,hover:null,zoom:1,dirty:true};
  const syncBar=()=>{tabSector.setAttribute('aria-selected',String(C.view==='sector'));tabSystem.setAttribute('aria-selected',String(C.view==='system'));
    fitB.style.display=C.view==='system'?'':'none';markB.textContent='Markers: '+MODES[mode];};
  markB.onclick=cycleMarks;
  closeB.onclick=()=>toggle(false);
  tabSector.onclick=()=>{C.view='sector';C.sel=null;C.dirty=true;syncBar();};
  tabSystem.onclick=()=>{C.view='system';C.sel=null;C.zoom=1;C.dirty=true;syncBar();};
  fitB.onclick=()=>{C.zoom=1;};
  function toggle(o){o=o===undefined?!panel.classList.contains('open'):o;panel.classList.toggle('open',o);
    if(o){C.dirty=true;size();syncBar();frame();}
    W.onCartoToggle&&W.onCartoToggle(o);}
  W.openCarto=toggle;
  // half as tall as it is wide, or less on a short screen, so the readout under it stays in view
  const size=()=>{const w=Math.max(280,cv.clientWidth||panel.clientWidth-18),r=Math.min(2,devicePixelRatio||1),h=Math.max(200,Math.min(w*0.5,innerHeight-330));cv.width=Math.round(w*r);cv.height=Math.round(h*r);};
  addEventListener('resize',()=>{if(panel.classList.contains('open'))size();});

  // ---- the sector: light-years ----
  const xs=PLACES.map(P=>P.ly[0]),ys=PLACES.map(P=>P.ly[1]);
  const SX0=Math.min(...xs)-3,SX1=Math.max(...xs)+3,SY0=Math.min(...ys)-3,SY1=Math.max(...ys)+3;
  const sector=()=>{const Wd=cv.width,H=cv.height,s=Math.min(Wd/(SX1-SX0),H/(SY1-SY0)),ox=(Wd-(SX1-SX0)*s)/2,oy=(H-(SY1-SY0)*s)/2;
    return {s,X:x=>ox+(x-SX0)*s,Y:y=>H-oy-(y-SY0)*s};};
  const lyOf=P=>new THREE.Vector2(P.ly[0],P.ly[1]);
  const eta=(d,w)=>{const s=d/lyps(w);return s<90?Math.round(s)+' s':Math.round(s/60)+' min';};
  function drawSector(g){
    const Wd=cv.width,H=cv.height,{s,X,Y}=sector(),k=cv.width/1000;
    g.strokeStyle='rgba(127,166,200,0.10)';g.lineWidth=1;
    for(let x=Math.ceil(SX0/5)*5;x<=SX1;x+=5){g.beginPath();g.moveTo(X(x),0);g.lineTo(X(x),H);g.stroke();}
    for(let y=Math.ceil(SY0/5)*5;y<=SY1;y+=5){g.beginPath();g.moveTo(0,Y(y));g.lineTo(Wd,Y(y));g.stroke();}
    const sx=X(S.map.x),sy=Y(S.map.y);
    // range from the ship, and how long each ring is at the warp factor set
    g.setLineDash([4*k,6*k]);g.font=Math.round(11*k)+'px Helvetica,Arial,sans-serif';
    for(const r of [5,10,20]){g.strokeStyle='rgba(159,200,240,0.22)';g.beginPath();g.arc(sx,sy,r*s,0,7);g.stroke();
      g.fillStyle='rgba(159,200,240,0.55)';g.fillText(r+' ly · '+eta(r,W.course.w),sx+r*s*0.71+4*k,sy-r*s*0.71-4*k);}
    g.setLineDash([]);
    for(const P of PLACES){const Q=P.link&&PLACES.find(q=>q.id===P.link);if(!Q||P.id>Q.id)continue;
      g.strokeStyle='rgba(184,160,255,0.55)';g.setLineDash([2*k,5*k]);g.lineWidth=1.5*k;g.beginPath();g.moveTo(X(P.ly[0]),Y(P.ly[1]));
      g.quadraticCurveTo((X(P.ly[0])+X(Q.ly[0]))/2,Math.min(Y(P.ly[1]),Y(Q.ly[1]))-60*k,X(Q.ly[0]),Y(Q.ly[1]));g.stroke();g.setLineDash([]);g.lineWidth=1;}
    const dest=W.course.dest;
    if(dest){g.strokeStyle='#e8c98a';g.setLineDash([10*k,8*k]);g.lineWidth=2*k;g.beginPath();g.moveTo(sx,sy);g.lineTo(X(dest.ly[0]),Y(dest.ly[1]));g.stroke();g.setLineDash([]);g.lineWidth=1;}
    // the dots first, then each label in the first of eight places round its dot that is clear of the dots and of the
    // labels already down (the comet is half a light-year from home, and the ice world's label ran into the giant's)
    const boxes=PLACES.map(P=>[X(P.ly[0])-8*k,Y(P.ly[1])-8*k,16*k,16*k]),hit=(a)=>boxes.some(b=>a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3]);
    for(const P of PLACES){const px=X(P.ly[0]),py=Y(P.ly[1]),sel=C.sel&&C.sel.P===P,hov=C.hover&&C.hover.P===P;
      g.fillStyle=dest===P?'#e8c98a':sel||hov?'#ffffff':'#9fc8f0';g.beginPath();g.arc(px,py,(sel||hov?8:6)*k,0,7);g.fill();
      if(sel){g.strokeStyle='#ffe2a8';g.lineWidth=2*k;g.beginPath();g.arc(px,py,13*k,0,7);g.stroke();g.lineWidth=1;}}
    for(const P of PLACES){const px=X(P.ly[0]),py=Y(P.ly[1]),t=P.name.replace(/^Home: .*/,'Home'),sb=stationsAt(P.id),tx=sb.length?'◆ '+sb.map(x=>'SB '+x.n).join(' · '):'';
      g.font=Math.round(11*k)+'px Helvetica,Arial,sans-serif';const w2=tx?g.measureText(tx).width:0;
      g.font=Math.round(14*k)+'px Helvetica,Arial,sans-serif';const w=Math.max(g.measureText(t).width,w2),h=(tx?30:16)*k;
      let best=null;
      for(const [dx,dy] of [[11,-19],[11,3],[-11,-19],[-11,3],[11,-36],[-11,-36],[11,17],[-11,17]]){
        const bx=dx>0?px+dx*k:px+dx*k-w,by=py+dy*k,bb=[Math.max(2,Math.min(Wd-w-2,bx)),by,w,h];
        if(!best)best=bb;if(!hit(bb)){best=bb;break;}}
      boxes.push(best);
      g.fillStyle='#dfe8f0';g.fillText(t,best[0],best[1]+13*k);
      if(tx){g.fillStyle='#ffc860';g.font=Math.round(11*k)+'px Helvetica,Arial,sans-serif';g.fillText(tx,best[0],best[1]+27*k);}}
    const h=W.heading(),a=Math.atan2(-h.f.z,h.f.x);
    g.save();g.translate(sx,sy);g.rotate(-a);g.fillStyle='#ffffff';g.beginPath();g.moveTo(15*k,0);g.lineTo(-8*k,-8*k);g.lineTo(-4*k,0);g.lineTo(-8*k,8*k);g.closePath();g.fill();g.restore();
    g.fillStyle='rgba(159,180,200,0.7)';g.font=Math.round(12*k)+'px Helvetica,Arial,sans-serif';g.fillText('5 ly grid · east to the right, north up',8*k,H-8*k);
  }
  const sectorHit=(mx,my)=>{const {X,Y}=sector();let b=null,bd=(18*cv.width/1000)**2;
    for(const P of PLACES){const d=(X(P.ly[0])-mx)**2+(Y(P.ly[1])-my)**2;if(d<bd){bd=d;b={P};}}return b;};

  // ---- the system: the place you are at, from above, in metres ----
  let sysView=null;
  function systemFrame(cs){
    const me=SYS.worldToLocal(ROOT.position.clone());let x0=me.x,x1=me.x,z0=me.z,z1=me.z;
    for(const c of cs){const r=c.kind==='body'?c.r:0;x0=Math.min(x0,c.local.x-r);x1=Math.max(x1,c.local.x+r);z0=Math.min(z0,c.local.z-r);z1=Math.max(z1,c.local.z+r);}
    const Wd=cv.width,H=cv.height,pad=1.18,sw=Math.max(2000,(x1-x0)*pad),sh=Math.max(1000,(z1-z0)*pad);
    const s=Math.min(Wd/sw,H/sh)*C.zoom,ctr=C.zoom>1?me:{x:(x0+x1)/2,z:(z0+z1)/2};
    return {s,me,X:x=>Wd/2+(x-ctr.x)*s,Y:z=>H/2+(z-ctr.z)*s};
  }
  const COL={body:'#5f8cc0',object:'#a8a8b8',station:'#ffc860',ship:'#9fe8b0',gate:'#b8a0ff',foe:'#ff6a5a'};
  function drawSystem(g){
    const Wd=cv.width,H=cv.height,k=Wd/1000;
    const pl=W.herePlace();
    if(!pl||!pl.group.visible||S.warp){g.fillStyle='#9fb4c8';g.font=Math.round(16*k)+'px Helvetica,Arial,sans-serif';g.fillText(S.warp?'At warp: nothing near enough to chart.':'Nothing here.',20*k,40*k);sysView=null;return;}
    const cs=contacts(),V2=systemFrame(cs),{s,me,X,Y}=V2;sysView={V2,cs};
    // the autopilot's line
    if(go.t){const t=SYS.worldToLocal(go.t.pos());g.strokeStyle='#e8c98a';g.setLineDash([8*k,6*k]);g.lineWidth=1.5*k;g.beginPath();g.moveTo(X(me.x),Y(me.z));g.lineTo(X(t.x),Y(t.z));g.stroke();g.setLineDash([]);g.lineWidth=1;}
    g.font=Math.round(12*k)+'px Helvetica,Arial,sans-serif';
    for(const c of cs){const x=X(c.local.x),y=Y(c.local.z),sel=C.sel&&C.sel.name===c.name,hov=C.hover&&C.hover.name===c.name;
      g.fillStyle=COL[c.kind];g.strokeStyle=COL[c.kind];
      if(c.kind==='foe'){const r=6*k;g.lineWidth=2*k;g.beginPath();g.moveTo(x-r,y-r);g.lineTo(x+r,y+r);g.moveTo(x+r,y-r);g.lineTo(x-r,y+r);g.stroke();g.lineWidth=1;}
      else if(c.kind==='gate'){const r=Math.max(5*k,c.r*s);g.lineWidth=2*k;g.beginPath();g.arc(x,y,r,0,7);g.stroke();g.beginPath();g.arc(x,y,r*0.5,0,7);g.stroke();g.lineWidth=1;}
      else if(c.kind==='body'||c.kind==='object'){const r=Math.max(3*k,c.r*s);g.globalAlpha=0.35;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.globalAlpha=1;g.beginPath();g.arc(x,y,r,0,7);g.stroke();}
      else if(c.kind==='station'){const r=6*k;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r,y);g.lineTo(x,y+r);g.lineTo(x-r,y);g.closePath();g.fill();}
      else{const h=c.ship.heading,a=Math.atan2(h.z,h.x),r=6*k;g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(r,0);g.lineTo(-r*0.7,-r*0.6);g.lineTo(-r*0.7,r*0.6);g.closePath();g.fill();g.restore();}
      if(sel||hov){g.strokeStyle='#ffffff';g.lineWidth=2*k;g.beginPath();g.arc(x,y,Math.max(10*k,(c.kind==='body'?c.r*s:0)+5*k),0,7);g.stroke();g.lineWidth=1;}
      if(c.kind!=='ship'||hov||sel||C.zoom>4){g.fillStyle=sel||hov?'#ffffff':'#c8d8e8';g.fillText(c.name.replace(/^the /,'')+' · '+km(c.d),x+9*k,y-7*k);}}
    // the ship, pointing the way it is heading
    const f=V().set(1,0,0).applyQuaternion(ROOT.quaternion).applyQuaternion(SYS.quaternion.clone().invert()),a=Math.atan2(f.z,f.x);
    g.save();g.translate(X(me.x),Y(me.z));g.rotate(a);g.fillStyle='#ffffff';g.beginPath();g.moveTo(12*k,0);g.lineTo(-7*k,-7*k);g.lineTo(-3*k,0);g.lineTo(-7*k,7*k);g.closePath();g.fill();g.restore();
    // the scale
    const want=150*k/s,p=Math.pow(10,Math.floor(Math.log10(want))),step=[1,2,5,10].map(m=>m*p).find(m=>m>=want)||p*10;
    g.strokeStyle='#9fb4c8';g.lineWidth=2*k;g.beginPath();g.moveTo(12*k,H-14*k);g.lineTo(12*k+step*s,H-14*k);g.stroke();g.lineWidth=1;
    g.fillStyle='#9fb4c8';g.fillText(km(step)+(C.zoom>1?' · centred on the ship (Fit to see it all)':' · from above; the way you came in is to the right'),12*k,H-22*k);
    g.fillText(pl.P.name,12*k,20*k);
  }
  const systemHit=(mx,my)=>{if(!sysView)return null;const {V2,cs}=sysView;let b=null,bd=(16*cv.width/1000)**2;
    for(const c of cs){const dx=V2.X(c.local.x)-mx,dy=V2.Y(c.local.z)-my,r=c.kind==='body'?c.r*V2.s:0,d=Math.max(0,Math.hypot(dx,dy)-r)**2;if(d<bd){bd=d;b=c;}}return b;};

  // ---- the readout under the chart, and the list ----
  const act=(t,f)=>{const b=el('button',null,t);b.type='button';b.onclick=()=>{W.audio&&W.audio();f();};return b;};
  function showInfo(){
    info.innerHTML='';const x=C.sel||C.hover;
    if(C.view==='sector'){
      if(!x){info.append(el('span',null,'Click a place to read about it and lay in a course. The ship is the white arrow; the rings are light-years from it, with the time to each at warp '+W.course.w+'.'));return;}
      const P=x.P,d=S.map.distanceTo(lyOf(P)),here=W.herePlace().P.id===P.id&&d<0.34,sb=stationsAt(P.id);
      info.append(el('b',null,P.name),el('div',null,P.note),el('div',null,(here?'You are here.':d.toFixed(1)+' ly: '+eta(d,W.course.w)+' at warp '+W.course.w+'.')+(sb.length?' Starbases: '+sb.map(s=>s.n).join(', ')+'.':'')));
      const a=el('div','acts');
      if(here)a.append(act('Show this system',()=>{C.view='system';C.sel=null;C.zoom=1;syncBar();}));
      else{a.append(act('Lay in a course',()=>{W.course.set(P);}));
        for(let w=1;w<=9;w++){const b=act(String(w),()=>{W.course.setWarp(w);});b.setAttribute('aria-label','Warp '+w);b.setAttribute('aria-pressed',String(W.course.w===w));a.append(b);}}
      info.append(a);return;}
    if(!x){info.append(el('span',null,'Click anything to read about it and go there. Scroll to zoom in round the ship.'));return;}
    info.append(el('b',null,x.name),el('div',null,(x.note||{body:'A world: the autopilot takes the ship to a standard orbit over it.',object:'The autopilot stops a little short of it.',ship:'',station:'',
      gate:'A stable wormhole: the autopilot flies the ship into it, and out of its other mouth.',foe:'Hostile. The autopilot brings the ship to three kilometres of it.'}[x.kind])+' '+km(x.d)+' off.'));
    const a=el('div','acts');
    a.append(act({station:'Dock',body:'Go into orbit',object:'Approach',ship:'Come alongside',gate:'Fly through',foe:'Intercept'}[x.kind],()=>goTo(x)));
    if(W.scan)a.append(act('Scan',()=>W.scan(x)));
    if(go.t)a.append(act('Autopilot off',()=>W.cancelAuto()));
    info.append(a);
  }
  function showList(){
    list.innerHTML='';
    if(C.view==='sector'){
      for(const P of [...PLACES].sort((a,b)=>S.map.distanceTo(lyOf(a))-S.map.distanceTo(lyOf(b)))){const d=S.map.distanceTo(lyOf(P)),sb=stationsAt(P.id);
        const b=el('button',null,P.name);b.type='button';b.setAttribute('aria-pressed',String(C.sel&&C.sel.P===P));
        b.append(el('small',null,(W.herePlace().P.id===P.id&&d<0.34?'you are here':d.toFixed(1)+' ly')+(sb.length?' · starbase '+sb.map(s=>s.n).join(', '):'')));
        b.onclick=()=>{C.sel={P};C.dirty=true;};list.append(b);}
      hint.textContent='P opens and closes this, L the markers. 1–9 at the helm set the warp factor; C is the course panel.';return;}
    const cs=sysView?sysView.cs:contacts();
    for(const c of [...cs].sort((a,b)=>a.d-b.d)){const b=el('button',null,c.name);b.type='button';b.setAttribute('aria-pressed',String(C.sel&&C.sel.name===c.name));
      b.append(el('small',null,{body:'world',object:'',station:'starbase',ship:'starship',gate:'wormhole',foe:'hostile'}[c.kind]+(c.kind==='object'?'':' · ')+km(c.d)));
      b.onclick=()=>{C.sel=c;C.dirty=true;};list.append(b);}
    hint.textContent='K docks at the nearest starbase from anywhere in a place. Any touch on the helm takes the ship back from the autopilot.';
  }
  const pos=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height];};
  cv.addEventListener('pointermove',e=>{const [x,y]=pos(e);const h=C.view==='sector'?sectorHit(x,y):systemHit(x,y);if((h&&(h.P||h.name))!==(C.hover&&(C.hover.P||C.hover.name))){C.hover=h;C.dirty=true;}});
  cv.addEventListener('pointerleave',()=>{C.hover=null;C.dirty=true;});
  cv.addEventListener('click',e=>{const [x,y]=pos(e);const h=C.view==='sector'?sectorHit(x,y):systemHit(x,y);C.sel=h;C.dirty=true;});
  cv.addEventListener('dblclick',e=>{const [x,y]=pos(e);const h=C.view==='sector'?sectorHit(x,y):systemHit(x,y);if(!h)return;
    if(h.P){if(W.herePlace().P.id!==h.P.id)W.course.set(h.P);}else goTo(h);});
  cv.addEventListener('wheel',e=>{if(C.view!=='system')return;e.preventDefault();C.zoom=Math.max(1,Math.min(5000,C.zoom*Math.exp(-e.deltaY*0.0015)));},{passive:false});
  // keep the selection current: a contact's distance changes as you fly
  const refreshSel=()=>{if(C.view==='system'&&C.sel&&sysView){const c=sysView.cs.find(c=>c.name===C.sel.name);if(c)C.sel=c;}};
  let tk=0;
  function frame(){
    const g=cv.getContext('2d');g.fillStyle='#050a13';g.fillRect(0,0,cv.width,cv.height);
    if(C.view==='sector')drawSector(g);else drawSystem(g);
    // the text under it every few frames (it is DOM, and buttons that are rebuilt under the pointer cannot be clicked)
    if(C.dirty||++tk%30===0){refreshSel();showInfo();showList();C.dirty=false;}
  }
  animHooks.push(()=>{if(panel.classList.contains('open'))frame();});

  addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA/.test(e.target.tagName||''))return;
    if(e.key==='p'||e.key==='P'){W.audio&&W.audio();toggle();}
    else if(e.key==='l'||e.key==='L')cycleMarks();
    else if(e.key==='Escape'&&panel.classList.contains('open'))toggle(false);});
  syncBar();

  const hud=()=>go.t&&!go.t.quiet?'autopilot: '+go.t.name+', '+km(Math.max(0,go.d))+' to go':'';
  return {hud,toggle,act:{carto:()=>toggle(true),system:()=>{C.view='system';toggle(true);},marks:cycleMarks},
    state:()=>({goto:go.t&&go.t.name,d:Math.round(go.d),marks:MODES[mode],open:panel.classList.contains('open'),view:C.view,n:contacts().length})};
}
