// ---------- Galaxy class: the star chart, courses, and arriving ----------
// Fan work. Star Trek belongs to Paramount; the places on the chart are this project's own.
//
// The ship has a position on a flat chart in light-years (S.map). At warp it moves across the chart along its
// heading, at the Cochrane speed with time sped up (flight.js), so the chart's bearings are real ones: a place to
// the east is reached by heading 000. Setting a course (the Course panel, or C at the helm) turns the ship onto the
// place's bearing at the helm's own turn rate, goes to warp at the chosen factor when it is lined up, holds the
// bearing (you can still steer; let go and it steers back) and drops out on arrival. Dropping out anywhere else
// puts you where you are: at a place if you are within a third of a light-year of one, and otherwise in the
// empty space between.
//
// On arrival the place is drawn in a frame turned to the heading you came in on, so it is ahead of you.
import {PLACES,DEEP,makePlace} from './places.js';
import {lyps,warpC,TIMEX,FULL} from './flight.js';

export function nav(W){
  const {THREE,ROOT,SYS,SKY,animHooks,camera}=W,S=W.flight,{key,fill,amb}=W.lights;
  S.map=new THREE.Vector2(0,0);
  let rs=4242;const rnd=()=>{rs=(rs*1664525+1013904223)>>>0;return rs/4294967296;};
  const kit={THREE,glowTex:W.glowTex,rnd,height:()=>W.renderer.domElement.height,
    sprite:(col,size,op=1)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:W.glowTex,color:col,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));s.scale.setScalar(size);return s;}};

  // home is the sky the page was given: its planet and moon are moved in, and its light is the page's own
  const home={P:PLACES[0],group:new THREE.Group(),solids:[],update:()=>{},sun:W.sun.clone(),fill:W.fillDir.clone()};
  {const sp=W.C.space||{},D=sp.far||900000;
   home.P=Object.assign({},PLACES[0],{light:{colour:'#'+key.color.getHexString(),intensity:key.intensity,ambient:amb?amb.intensity:0.4,
     fill:{colour:'#'+fill.color.getHexString(),intensity:fill.intensity}}});
   for(const o of W.homeBodies)home.group.add(o);
   (sp.bodies||[]).forEach((b,i)=>{const o=W.homeBodies[i];if(!o)return;const d=(b.dist||0.6)*D;
     home.solids.push({name:i===0?'the planet':'the moon',c:o.position.clone(),r:Math.tan((b.deg||6)*Math.PI/180)*d,orbit:true});});}
  const cache=new Map([['home',home]]);
  const get=P=>{if(!cache.has(P.id))cache.set(P.id,makePlace(THREE,P,kit));return cache.get(P.id);};
  let here=home,inWarp=false;
  SYS.add(home.group);

  function setLight(pl){
    const L=pl.P.light;key.color.set(L.colour);key.intensity=L.intensity;if(amb)amb.intensity=L.ambient;
    fill.color.set(L.fill.colour);fill.intensity=L.fill.intensity;
    W.sun.copy(pl.sun).applyQuaternion(SYS.quaternion);W.fillDir.copy(pl.fill).applyQuaternion(SYS.quaternion);
  }
  const yawQ=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0);
  function arrive(){
    let P=null;
    if(course.dest&&course.arrived){P=course.dest;S.map.set(P.ly[0],P.ly[1]);}
    else{let best=0.34;for(const p of PLACES){const d=S.map.distanceTo(new THREE.Vector2(...p.ly));if(d<best){best=d;P=p;}}}
    const pl=P?get(P):get(DEEP);
    if(here.group.parent)SYS.remove(here.group);
    here=pl;inWarp=false;
    // the place's frame: where the ship is, turned to its heading over the galactic plane
    const h=W.heading();yawQ.setFromAxisAngle(Y,Math.atan2(-h.f.z,h.f.x));
    SYS.position.copy(ROOT.position);SYS.quaternion.copy(SKY.quaternion).multiply(yawQ);
    SYS.add(pl.group);pl.group.visible=true;setLight(pl);
    if(W.placeTarget)W.placeTarget();
    // out of warp at a quarter impulse, the dampers taking the rest
    W.setThrottle(Math.max(0.25,S.thr));
    course.clear();
    toast(pl.P.name,pl.P.note);
  }
  W.arrive=arrive;

  // at warp: the place you left is gone at once, and the light is starlight; the ship crosses the chart
  W.warpTick=(dt,fwd)=>{
    if(!inWarp){inWarp=true;here.group.visible=false;setLight(get(DEEP));if(W.rock)W.rock.visible=false;S.punch=900;S.shake+=6;}
    const h=W.heading(),hz=Math.hypot(h.f.x,h.f.z);
    if(hz>1e-3)S.map.x+=h.f.x/hz*lyps(S.warp)*dt*hz,S.map.y+=-h.f.z/hz*lyps(S.warp)*dt*hz;
    if(course.dest){const to=new THREE.Vector2(...course.dest.ly).sub(S.map),d=to.length();
      if(d<lyps(S.warp)*dt*1.5||d<0.003){course.arrived=true;W.dropOut();}}
  };
  W.placeFrame=(now,dt)=>{if(here.group.visible)here.update(now*0.001,dt,camera);};
  animHooks.push(now=>{if(!S.on&&here!==home&&here.group.visible)here.update(now*0.001,0.016,camera);});

  // ---- solid things: the ship holds off them ----
  const wp=new THREE.Vector3(),n=new THREE.Vector3();
  const worldSolids=()=>here.group.visible?here.solids:[];
  W.nearest=()=>{let b=null;for(const s of worldSolids()){if(!s.orbit)continue;SYS.localToWorld(wp.copy(s.c));const d=wp.distanceTo(ROOT.position);
      if(!b||d-s.r<b.d-b.r)b={name:s.name,c:wp.clone(),r:s.r,d};}return b;};
  // the body to orbit: the one you are fewest of its own radii from
  W.orbitable=()=>{let b=null;for(const s of worldSolids()){if(!s.orbit)continue;SYS.localToWorld(wp.copy(s.c));const d=wp.distanceTo(ROOT.position);
      if(d<s.r*6&&(!b||d/s.r<b.d/b.r))b={name:s.name,c:wp.clone(),r:s.r,d};}return b;};
  let holding=0;
  W.collide=(S,dt)=>{holding=Math.max(0,holding-dt);
    for(const s of worldSolids()){SYS.localToWorld(wp.copy(s.c));const m=s.r+(s.orbit?2000:500),d2=wp.distanceToSquared(ROOT.position);
      if(d2<m*m){const d=Math.sqrt(d2);n.copy(ROOT.position).sub(wp).divideScalar(d||1);ROOT.position.copy(wp).addScaledVector(n,m);
        const into=S.vel.dot(n);if(into<0)S.vel.addScaledVector(n,-into);holding=1.5;}}};

  // ---- the course ----
  const course={dest:null,w:6,arrived:false,
    clear(){this.dest=null;this.arrived=false;sync();},
    set(P){this.dest=P;this.arrived=false;if(!S.on)W.startFlight();S.orbit=null;if(S.warp&&!this.lined()){/* turning at warp is allowed: hold the warp */}
      if(S.thr<0.25)W.setThrottle(0.25);sync();},
    setWarp(w){this.w=w;if(S.warp)S.warp=w;sync();},
    bearing(){const to=new THREE.Vector2(...this.dest.ly).sub(S.map);return Math.atan2(to.y,to.x);},
    dir(){if(!this.dest)return null;const b=this.bearing();return new THREE.Vector3(Math.cos(b),0,-Math.sin(b)).applyQuaternion(SKY.quaternion);},
    lined(){return S.steerErr!=null&&S.steerErr<0.025&&S.rate.length()<0.02;}};
  W.course=course;
  // line up, then go
  animHooks.push(()=>{if(!S.on||!course.dest||S.warp||W.spooling||course.arrived)return;
    const d=S.map.distanceTo(new THREE.Vector2(...course.dest.ly));
    if(d<0.01){course.clear();return;}
    if(course.lined())W.engage(course.w);});

  // ---- the panel: the chart, the warp factor, the places ----
  const panel=document.createElement('div');panel.id='navpanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Course');
  const st=document.createElement('style');st.textContent=`#navpanel{position:fixed;left:50%;bottom:calc(var(--barh,56px) + 4px);transform:translateX(-50%);box-sizing:border-box;width:min(560px,calc(100% - 20px));max-height:calc(100% - 150px);overflow:auto;display:none;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:5px;padding:8px;border:1px solid #3f5a74;z-index:6}
#navpanel.open{display:grid}#navpanel .sub{grid-column:1/-1;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin:6px 0 0}
#navpanel canvas{grid-column:1/-1;width:100%;height:auto;background:#060c16;border:1px solid #2a3d52}
#navpanel .row{grid-column:1/-1;display:flex;gap:4px;flex-wrap:wrap}#navpanel .row button{flex:1 0 34px;padding:7px 0;text-align:center}
#navpanel button{padding:8px 10px;text-align:left;font-size:13px;border:1px solid;border-radius:2px;cursor:pointer}
#navpanel button small{display:block;opacity:.75;font-size:11px;margin-top:2px}
#ent-toast{position:fixed;left:50%;top:64px;transform:translateX(-50%);max-width:min(560px,calc(100% - 32px));box-sizing:border-box;padding:8px 14px;background:rgba(8,20,34,.86);border-left:3px solid #7fa6c8;color:#dfe8f0;font:13px/1.45 Helvetica,Arial,sans-serif;z-index:5;pointer-events:none;transition:opacity .8s;opacity:0}
#ent-toast b{display:block;letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#9fc8f0}`;
  document.head.appendChild(st);
  const cv=document.createElement('canvas');cv.width=1080;cv.height=520;cv.setAttribute('aria-label','Star chart');
  const sub=t=>{const h=document.createElement('div');h.className='sub';h.textContent=t;return h;};
  const wrow=document.createElement('div');wrow.className='row';
  for(let w=1;w<=9;w++){const b=document.createElement('button');b.type='button';b.textContent=w;b.setAttribute('aria-label','Warp '+w);b.onclick=()=>course.setWarp(w);wrow.appendChild(b);}
  const pbtns=PLACES.map(P=>{const b=document.createElement('button');b.type='button';b.onclick=()=>course.set(P);return b;});
  panel.append(sub('Star chart'),cv,sub('Warp factor'),wrow,sub('Set a course'),...pbtns);
  document.body.appendChild(panel);
  const toastEl=document.createElement('div');toastEl.id='ent-toast';toastEl.setAttribute('role','status');document.body.appendChild(toastEl);
  let toastT=null;
  function toast(name,note){toastEl.innerHTML='';const b=document.createElement('b');b.textContent=name;toastEl.append(b,document.createTextNode(note||''));
    toastEl.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.style.opacity=0;},7000);}
  const eta=(d,w)=>{const s=d/lyps(w),days=d/warpC(w)*365.25;
    return (s<90?Math.round(s)+' s':Math.round(s/60)+' min')+' ('+(days<2?Math.round(days*24)+' hours':Math.round(days)+' days')+' at warp '+w+')';};
  function sync(){
    for(const b of wrow.children)b.setAttribute('aria-pressed',String(+b.textContent===course.w));
    PLACES.forEach((P,i)=>{const d=S.map.distanceTo(new THREE.Vector2(...P.ly)),b=pbtns[i];
      b.innerHTML='';b.append(P.name);const sm=document.createElement('small');
      sm.textContent=here.P.id===P.id&&d<0.34?'you are here':d.toFixed(1)+' ly · '+eta(d,course.w);b.appendChild(sm);
      b.setAttribute('aria-pressed',String(course.dest===P));});
  }
  // the chart: east to the right, north up, a light-year grid; the ship, its heading, and the course
  function draw(){
    const g=cv.getContext('2d'),Wd=cv.width,H=cv.height;
    let x0=-8,x1=30,y0=-15,y1=9;const sx=Wd/(x1-x0),sy=H/(y1-y0),s=Math.min(sx,sy),ox=(Wd-(x1-x0)*s)/2,oy=(H-(y1-y0)*s)/2;
    const X=x=>ox+(x-x0)*s,Yp=y=>H-oy-(y-y0)*s;
    g.fillStyle='#060c16';g.fillRect(0,0,Wd,H);
    g.strokeStyle='rgba(127,166,200,0.12)';g.lineWidth=1;
    for(let x=Math.ceil(x0/5)*5;x<=x1;x+=5){g.beginPath();g.moveTo(X(x),0);g.lineTo(X(x),H);g.stroke();}
    for(let y=Math.ceil(y0/5)*5;y<=y1;y+=5){g.beginPath();g.moveTo(0,Yp(y));g.lineTo(Wd,Yp(y));g.stroke();}
    g.fillStyle='rgba(159,180,200,0.7)';g.font='18px Helvetica,Arial,sans-serif';g.fillText('5 ly',X(x1-5)+4,Yp(y0)-8);
    if(course.dest){g.strokeStyle='#e8c98a';g.setLineDash([10,8]);g.lineWidth=2;g.beginPath();g.moveTo(X(S.map.x),Yp(S.map.y));g.lineTo(X(course.dest.ly[0]),Yp(course.dest.ly[1]));g.stroke();g.setLineDash([]);}
    for(const P of PLACES){const px=X(P.ly[0]),py=Yp(P.ly[1]);g.fillStyle=course.dest===P?'#e8c98a':'#9fc8f0';g.beginPath();g.arc(px,py,7,0,7);g.fill();
      g.fillStyle='#dfe8f0';g.font='20px Helvetica,Arial,sans-serif';const t=P.name.replace(/^Home: .*/,'Home');const w=g.measureText(t).width;
      const below=P.id==='comet'||P.id==='ice';g.fillText(t,Math.max(6,Math.min(Wd-w-6,below?px-w/2:px+12)),below?py+28:py-10);}
    const h=W.heading?W.heading():null,a=h?Math.atan2(-h.f.z,h.f.x):0,px=X(S.map.x),py=Yp(S.map.y);
    g.save();g.translate(px,py);g.rotate(-a);g.fillStyle='#ffffff';g.beginPath();g.moveTo(16,0);g.lineTo(-9,-9);g.lineTo(-4,0);g.lineTo(-9,9);g.closePath();g.fill();g.restore();
  }
  let tk=0;
  animHooks.push(()=>{if(!panel.classList.contains('open'))return;draw();if(++tk%15===0)sync();});
  W.openNav=()=>{const o=!panel.classList.contains('open');panel.classList.toggle('open',o);if(o){sync();draw();}W.onNavToggle&&W.onNavToggle(o);};

  // the readout: where you are, or where you are going
  const hud=()=>{
    if(course.dest&&!course.arrived){const d=S.map.distanceTo(new THREE.Vector2(...course.dest.ly));
      return 'course: '+course.dest.name+' · '+d.toFixed(2)+' ly'+(S.warp?' · arriving in '+Math.max(1,Math.round(d/lyps(S.warp)))+' s':S.on&&!W.spooling?' · coming about':' · going to warp');}
    if(S.warp)return 'off the chart\'s places';
    let s=here.P.name;const b=W.nearest();
    if(b&&S.on&&!W.orbitInfo())s+=' · '+b.name+' '+Math.max(0,Math.round((b.d-b.r)/1000)).toLocaleString('en')+' km';
    if(holding>0)s+=' · holding off';
    return S.on||here!==home?s:'';
  };
  sync();
  return {panel,hud,course,arrive,here:()=>here};
}
