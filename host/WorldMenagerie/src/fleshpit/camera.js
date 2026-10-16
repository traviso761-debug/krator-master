// ---------- the descent: this page's own camera and its own controls ----------
// Every other place on this site is a city, and a city is looked at the way the engine looks at one: orbit a
// point on the ground, pan across it, zoom. A hole is not a city. What you want here is to ride the shaft -
// pick a depth, hold the axis, turn round it - and to be able to stand outside and read the seven layers off
// it like a cross-section, which is what the back-face trick in organism.js is for.
//
// So this page steers its own camera. The engine offers a hook for it, its camera stack (ctx.pushCam): the frame on top is handed the
// control state once the engine has had its turn, every frame, and may overwrite any of it. A page that never
// sets it - which is every other page on the site - is not affected in any way. On the surface this module
// hands every frame straight back, so up top the park behaves exactly like Chicago.
//
// The controls are all in one panel, because the thing anyone actually wants to do here is go down, and that
// should not be assembled out of three widgets in two corners of the screen. Depth is a readout, a slider, a
// pair of steps and a button per layer; W and S held down ride the shaft, drag turns, shift-drag rides, the
// wheel pulls back.
export function descent(api){
  const {THREE,C,ctx,scene,camera,renderer,sky,sun,ambient,hemi}=api;
  const K=C.descent||{},P=C.pit||{};
  const LAYERS=P.layers||[];
  if(!LAYERS.length)return;
  const RIM=P.rim!==undefined?P.rim:26;
  const AXX=P.axis?P.axis[0]:0,AZZ=P.axis?P.axis[1]:0;
  const orif=(C.landmarks||[]).find(l=>l.model==='orifice'),ORIFICE=(orif&&orif.rim)||266;
  const MIN=K.min!==undefined?K.min:-80, MAX=K.max!==undefined?K.max:3100;
  const RIDE=K.speed||260;                         // metres a second held down, near enough the cages' own speed
  const radiusAt=d=>{
    for(const L of LAYERS){if(d<L.top||d>L.bottom)continue;
      const t=(d-L.top)/Math.max(1,L.bottom-L.top);return L.r0+(L.r1-L.r0)*t;}
    return d<0?LAYERS[0].r0:LAYERS[LAYERS.length-1].r1;
  };
  const layerAt=d=>LAYERS.find(L=>d>=L.top&&d<=L.bottom)||null;
  const clampD=d=>Math.max(MIN,Math.min(MAX,d));
  const focusOf=L=>L.focus!==undefined?L.focus:(L.top+L.bottom)/2;

  // section: outside the shaft, reading it as a drawing. ride: inside it, near the wall.
  const S={mode:'surface',depth:0,goal:0,az:1.15,el:0.2,out:K.out||760,in:K.dist||210,held:0,t:0,seen:null};
  // free: a camera that flies anywhere - over the park, down the shaft, out through the wall and through the
  // ground itself. A position, a heading and a pitch; it is turned into the engine's orbit terms every frame.
  const F={pos:new THREE.Vector3(),yaw:0,pitch:0,speed:K.freeSpeed||60,keys:new Set()};
  const FREE_KEYS=new Set(['w','a','s','d','q','e',' ','c','shift','arrowup','arrowdown','arrowleft','arrowright']);
  const fwd=new THREE.Vector3(),rgt=new THREE.Vector3();
  function freeFrame(now,ctl){
    const dt=Math.min(0.08,(now-(S.t||now))/1000);S.t=now;
    const k=F.keys,v=F.speed*(k.has('shift')?4:1)*dt,cp=Math.cos(F.pitch);
    fwd.set(cp*Math.cos(F.yaw),Math.sin(F.pitch),cp*Math.sin(F.yaw));
    rgt.set(-Math.sin(F.yaw),0,Math.cos(F.yaw));
    if(k.has('w')||k.has('arrowup'))F.pos.addScaledVector(fwd,v);          // along the look, pitch and all
    if(k.has('s')||k.has('arrowdown'))F.pos.addScaledVector(fwd,-v);
    if(k.has('d')||k.has('arrowright'))F.pos.addScaledVector(rgt,v);
    if(k.has('a')||k.has('arrowleft'))F.pos.addScaledVector(rgt,-v);
    if(k.has('e')||k.has(' '))F.pos.y+=v;
    if(k.has('q')||k.has('c'))F.pos.y-=v;
    F.pos.x=Math.max(-4000,Math.min(4000,F.pos.x));F.pos.z=Math.max(-4000,Math.min(4000,F.pos.z));
    F.pos.y=Math.max(RIM-MAX-600,Math.min(3000,F.pos.y));
    // the engine places the camera at target + (cos az cos el, sin el, sin az cos el) * dist and looks at the
    // target, so a target a few metres ahead along the look, and the angles of the way back, put it at F.pos
    const D=4;
    ctl.target.copy(F.pos).addScaledVector(fwd,D);ctl.dist=D;
    ctl.el=Math.asin(Math.max(-1,Math.min(1,-fwd.y)));ctl.az=Math.atan2(-fwd.z,-fwd.x);
    ctl.elMin=-1.5708;ctl.elMax=1.5708;ctl.goal=null;
    if(UI.tick)UI.tick();
  }

  // ---- the frame ----
  ctx.pushCam((now,ctl)=>{
    // A viewpoint button in the engine's own panel sets a fresh fly goal. If this went on overwriting the camera
    // the panel would simply be dead while the descent was on, so a goal we have not seen before is taken as
    // what it is - someone asking for the surface camera back - and the pit hands it over.
    if(ctl.goal&&ctl.goal!==S.seen){S.seen=ctl.goal;if(S.mode!=='surface'&&UI.leave)UI.leave();return;}
    S.seen=ctl.goal;S.ctl=ctl;
    if(S.mode==='free'){freeFrame(now,ctl);return;}
    if(S.mode==='surface')return;                  // the engine's own camera, untouched
    const dt=Math.min(0.08,(now-(S.t||now))/1000);S.t=now;
    if(S.held)S.goal=clampD(S.goal+S.held*RIDE*dt);           // W/S held: ride, rather than step
    // ride up out of the hole and you are back on the surface: no button needed either way
    if(S.goal<=MIN+1&&S.depth<=MIN+20&&S.mode==='ride'&&UI.leave){UI.leave();return;}
    const gap=S.goal-S.depth;
    // ease towards the goal, faster the further it is: a layer button is a lift, not a teleport
    if(Math.abs(gap)>0.5)S.depth+=Math.sign(gap)*Math.min(Math.abs(gap),(RIDE*2.4+Math.abs(gap)*2.2)*dt);
    else S.depth=S.goal;
    const r=radiusAt(S.depth);
    ctl.target.set(P.axis?P.axis[0]:0,RIM-S.depth,P.axis?P.axis[1]:0);
    ctl.az=S.az;ctl.el=S.el;ctl.goal=null;
    // Inside a shaft you look up it as often as down it, so the engine's floor on the camera's tilt - which is
    // right for a city, where you are always above what you are looking at - is opened right out here.
    ctl.elMin=-1.45;ctl.elMax=1.45;
    // How far off the axis to sit. In section, well outside the widest part of the layer; riding, close in to
    // the wall but never through it, and never so close that the near plane eats the picture.
    // Riding, stay inside the well the decks leave open: the Lower Visitor Center is a steel doughnut from
    // half the radius out to the wall, and a camera at four fifths of the radius is inside its floor.
    ctl.dist=S.mode==='section'?Math.max(r*2.6,S.out):Math.max(12,Math.min(S.in,r*0.42));
    if(ctx.details)ctx.details.depth=Math.round(S.depth)+' m';
    if(UI.tick)UI.tick();
  });

  // ---- what it is like in there ----
  // Below the collar there is no sky, and the engine's daylight has no business being visible: the dome goes,
  // the sun with it, the fog turns the colour of the shaft, and the fill comes up so the walls are legible by
  // what the Park Service hung on them. The engine repaints all of that once a frame, so this runs once a frame
  // too. It is driven by where the camera actually is, so the viewpoints in the engine's own panel go dark as
  // well, without the descent being switched on at all.
  const Colour=scene.fog?scene.fog.color.constructor:null;
  const EARTH=Colour?new Colour(0x160c10):null, WARM=Colour?new Colour(0xffb184):null;
  const fog0=scene.fog?scene.fog.density:0.00013,sun0=sun?sun.intensity:0;
  const amb0=ambient?ambient.intensity:0.22, hem0=hemi?hemi.intensity:0.38;
  const ambC=ambient?ambient.color.clone():null;
  let skyOn=true;
  function dark(depth){
    const u=Math.max(0,Math.min(1,(depth-60)/220));
    // the dome goes early: once you are under the plain, a sky on the horizon is a hole in the earth
    if(sky&&(u<0.35)!==skyOn){skyOn=u<0.35;sky.visible=skyOn;}
    if(scene.fog&&EARTH){scene.fog.color.lerp(EARTH,u);
      scene.fog.density=fog0*(1-u)+0.00034*u;      // enough to bed the far chambers into the dark, not enough
      renderer.setClearColor(scene.fog.color);}    // to swallow a three-kilometre section
    // set, never scale: scaling it once a frame drives the sun to nothing in a second and it never comes back,
    // so the park was still dark after climbing out of the hole
    if(sun)sun.intensity=sun0*(1-u);
    if(ambient){ambient.intensity=amb0*(1-u)+0.72*u;if(ambC&&WARM)ambient.color.copy(ambC).lerp(WARM,u);}
    if(hemi)hemi.intensity=hem0*(1-u)+0.12*u;
  }
  api.animHooks.push(()=>dark(RIM-camera.position.y));

  // ---- the panel ----
  const UI={};
  api.onUI(({ui,mkBtn,el,showCard,ctl:ctl0})=>{
    const panel=document.createElement('div');
    panel.id='pitpanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','The pit');
    document.body.appendChild(panel);
    const sub=t=>{const d=document.createElement('div');d.className='sub';d.textContent=t;panel.appendChild(d);return d;};
    const row=()=>{const d=document.createElement('div');d.className='row';panel.appendChild(d);return d;};

    // the readout first: at any moment it says how deep you are and what you are in
    const read=document.createElement('div');read.className='status';panel.appendChild(read);

    sub('Where you stand');
    const modes=row();
    const bSurf=mkBtn('Surface',modes,()=>setMode('surface'));
    bSurf.title='The park, looked at the way every other city on this site is';
    const bSect=mkBtn('Section',modes,()=>setMode('section'));
    bSect.title='Outside the shaft, reading it as a cross-section';
    const bRide=mkBtn('Ride',modes,()=>setMode('ride'));
    bRide.title='Inside the shaft, at the wall';
    const bFree=mkBtn('Free',modes,()=>setMode(S.mode==='free'?'surface':'free'));
    bFree.title='Fly anywhere, through the ground and down the shaft (F)';

    sub('Depth below the plain');
    const dr=row();
    const bUp=mkBtn('▲ 100',dr,()=>step(-100));bUp.title='Up the shaft';
    const slider=document.createElement('input');
    slider.type='range';slider.min=String(MIN);slider.max=String(MAX);slider.step='5';slider.value='0';
    slider.setAttribute('aria-label','Depth below the plain');
    dr.appendChild(slider);
    const bDown=mkBtn('▼ 100',dr,()=>step(100));bDown.title='Down the shaft';

    sub('The layers');
    const layerBtns=LAYERS.map(L=>{
      const b=mkBtn(L.name,panel,()=>go(focusOf(L),true));
      b.title=Math.round(L.top)+'–'+Math.round(L.bottom)+' m below the plain';
      return b;
    });
    const bAll=mkBtn('The whole pit, in section',panel,()=>{S.out=1500;setMode('section');go(1500,false);});
    bAll.title='Stand well back and let the seven layers stack up';

    const hint=document.createElement('div');hint.className='status';
    hint.textContent='From the surface: zoom in on the hole, double-click it, press Page Down, or use the gauge on the right. '
      +'Inside: hold W and S (or ↑ and ↓) to ride; Page Up and Page Down jump; drag to turn, shift-drag to ride, wheel to pull back. '
      +'Ride up past the rim to come out. '
      +'Free camera (F, or the Free button): drag to look, W A S D to fly, Q and E (or C and Space) down and up, Shift for speed, wheel to set the speed.';
    panel.appendChild(hint);

    // ---- the gauge: always on screen, the whole depth of the park at a glance ----
    // A column down the right edge with the seven layers in it, a marker where you are, and a button at each
    // end. Click or drag anywhere on it to go to that depth; from the surface that takes you straight in.
    const gauge=document.createElement('div');gauge.id='pitgauge';gauge.setAttribute('role','slider');
    gauge.setAttribute('aria-label','Depth in the pit');gauge.setAttribute('aria-valuemin',String(MIN));gauge.setAttribute('aria-valuemax',String(MAX));
    gauge.tabIndex=0;
    Object.assign(gauge.style,{position:'fixed',right:'10px',top:'90px',bottom:'calc(var(--barh,56px) + 16px)',width:'86px',
      display:'flex',flexDirection:'column',gap:'4px',zIndex:5,font:'11px/1.2 Georgia,serif',color:'#f0dcc0',userSelect:'none'});
    // under the clock column (#side: the compass, the time bar, the readout), however tall that is, not over it
    {const place=()=>{const sd=document.getElementById('side');if(sd)gauge.style.top=Math.round(sd.getBoundingClientRect().bottom+10)+'px';};setInterval(place,500);requestAnimationFrame(place);}
    const gUp=document.createElement('button'),gDown=document.createElement('button');
    for(const [b,t,d] of [[gUp,'▲ Up','Up towards the surface'],[gDown,'▼ Down','Down the shaft']]){
      b.textContent=t;b.title=d;Object.assign(b.style,{background:'rgba(13,11,46,.9)',color:'#f0dcc0',border:'1px solid #c99a55',padding:'4px',cursor:'pointer'});}
    const track=document.createElement('div');
    Object.assign(track.style,{position:'relative',flex:'1',border:'1px solid #c99a55',background:'rgba(13,11,46,.75)',cursor:'ns-resize',overflow:'hidden'});
    const span=MAX-MIN,frac=d=>(d-MIN)/span;
    const TONE=['#8a7a60','#9a4a48','#b86a6c','#be8a60','#c8b24a','#b8a040','#6e4a3a'];
    LAYERS.forEach((L,i)=>{const b=document.createElement('div');
      Object.assign(b.style,{position:'absolute',left:'0',right:'0',top:(frac(L.top)*100)+'%',height:(frac(L.bottom)-frac(L.top))*100+'%',
        background:TONE[i%TONE.length],opacity:'0.55',borderTop:'1px solid rgba(0,0,0,.4)',padding:'2px 3px',boxSizing:'border-box',
        overflow:'hidden',textShadow:'0 1px 2px #000'});
      b.textContent=L.name.replace(/^The /,'');track.appendChild(b);});
    const surf=document.createElement('div');
    Object.assign(surf.style,{position:'absolute',left:'0',right:'0',top:'0',height:(frac(0)*100)+'%',background:'rgba(120,150,190,.35)',
      padding:'2px 3px',boxSizing:'border-box'});surf.textContent='Surface';track.appendChild(surf);
    const mark=document.createElement('div');
    Object.assign(mark.style,{position:'absolute',left:'-2px',right:'-2px',height:'3px',background:'#ffe8a0',boxShadow:'0 0 6px #ffcf60',pointerEvents:'none'});
    track.appendChild(mark);
    gauge.append(gUp,track,gDown);document.body.appendChild(gauge);
    const depthAt=e=>{const r=track.getBoundingClientRect();return MIN+span*Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));};
    const goTo=d=>{if(S.mode==='free'){F.pos.y=RIM-d;return;}
      if(d<=MIN+5){if(S.mode!=='surface')setMode('surface');return;}
      if(S.mode==='surface'){setMode('ride');S.depth=0;}go(d,false);};
    let gdrag=false;
    track.addEventListener('pointerdown',e=>{gdrag=true;track.setPointerCapture(e.pointerId);goTo(depthAt(e));e.preventDefault();});
    track.addEventListener('pointermove',e=>{if(gdrag)goTo(depthAt(e));});
    track.addEventListener('pointerup',()=>{gdrag=false;});
    gUp.addEventListener('click',()=>S.mode==='surface'?null:(S.goal-150<=MIN?setMode('surface'):step(-150)));
    gDown.addEventListener('click',()=>S.mode==='surface'?dive():step(150));
    gauge.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'||e.key==='PageDown'){S.mode==='surface'?dive():step(e.key==='PageDown'?400:60);e.preventDefault();e.stopPropagation();}
      if(e.key==='ArrowUp'||e.key==='PageUp'){if(S.mode!=='surface')step(e.key==='PageUp'?-400:-60);e.preventDefault();e.stopPropagation();}});
    UI.gauge=()=>{const d=S.mode==='surface'?MIN:S.mode==='free'?Math.max(MIN,Math.min(MAX,RIM-camera.position.y)):S.depth;mark.style.top='calc('+(frac(d)*100)+'% - 1px)';
      gauge.setAttribute('aria-valuenow',String(Math.round(d)));
      gauge.setAttribute('aria-valuetext',S.mode==='surface'?'On the surface':Math.round(d)+' metres below the plain');};

    // ---- one button in the bar, which doubles as the depth gauge ----
    const isOpen=()=>panel.classList.contains('open');
    const btn=mkBtn('The pit',ui,()=>{
      const on=!isOpen();panel.classList.toggle('open',on);btn.setAttribute('aria-expanded',String(on));
      for(const id of ['views','display','menagerie'])
        {const p=document.getElementById(id);if(p&&on)p.classList.remove('open');}
    });
    btn.setAttribute('aria-expanded','false');
    btn.title='Go down the shaft, or come back up';

    // ---- moving ----
    function setMode(m){
      if(m==='free'&&S.mode!=='free'){              // take off from wherever the camera is, looking where it looks
        F.pos.copy(camera.position);camera.getWorldDirection(fwd);
        F.yaw=Math.atan2(fwd.z,fwd.x);F.pitch=Math.asin(Math.max(-1,Math.min(1,fwd.y)));F.keys.clear();S.t=performance.now();
      }
      if(S.mode==='free'&&m==='surface'){           // land: orbit the ground ahead of where the flight ended
        const ahead=F.pos.clone().addScaledVector(fwd,120);
        const g=S.ctl&&S.ctl.target?(api.groundH?api.groundH(ahead.x,ahead.z):0):0;
        if(S.ctl){S.ctl.target.set(ahead.x,g||0,ahead.z);S.ctl.dist=260;S.ctl.el=0.5;S.ctl.az=Math.atan2(-fwd.z,-fwd.x);}
      }
      if(S.mode==='free'&&(m==='section'||m==='ride')){S.depth=S.goal=clampD(Math.max(0,RIM-camera.position.y));}
      if(m!=='surface'&&m!=='free'&&S.mode==='surface'){       // arriving: start from where the camera already is
        S.t=performance.now();
        S.depth=clampD(Math.max(0,RIM-camera.position.y));
        if(S.goal<40)S.goal=140;
        S.el=Math.min(0.5,Math.max(-0.2,S.el));
      }
      S.mode=m;
      // The polyps and the strands hang off the near wall as much as the far one, and in the section view the
      // near wall has been culled away on purpose - so they would be the only thing left standing in front of
      // the cutaway. They belong to the inside of the shaft, and they are shown when you are inside it.
      // In the section the renderer clips away everything on the near side of the cut (section.js), growth and
      // all, so what hangs on the far wall can stay.
      const parts=ctx.pitBus.parts;
      if(parts.setSection)parts.setSection(m==='section');
      else if(parts.fine)parts.fine.visible=(m!=='section');
      if(m==='surface'){S.held=0;S.goal=S.depth=0;dark(0);if(sky)sky.visible=true;
        ctl0.elMin=0.03;ctl0.elMax=1.5;}
      paint();
    }
    UI.leave=()=>setMode('surface');
    function go(d,card){
      if(S.mode==='surface')setMode('section');
      S.goal=clampD(d);
      if(card){const L=layerAt(S.goal);if(L)showCard({name:L.name,
        info:(L.info||'')+' '+Math.round(L.top)+' to '+Math.round(L.bottom)+' m below the plain.'});}
      paint();
    }
    const step=d=>go(S.goal+d,false);

    function paint(){
      const L=layerAt(S.goal);
      for(const [b,m] of [[bSurf,'surface'],[bSect,'section'],[bRide,'ride'],[bFree,'free']])
        b.setAttribute('aria-pressed',String(S.mode===m));
      layerBtns.forEach((b,i)=>b.setAttribute('aria-current',String(LAYERS[i]===L&&S.mode!=='surface')));
      slider.value=String(Math.round(S.goal));
      UI.tick();
    }
    UI.tick=()=>{
      const L=layerAt(S.depth);
      if(S.mode==='free'){const dd=Math.round(RIM-camera.position.y),Lf=layerAt(dd);
        read.textContent='Free camera · '+(dd>0?dd+' m below the plain'+(Lf?' · '+Lf.name:''):Math.round(-dd)+' m above the plain')+' · '+Math.round(F.speed)+' m/s';
        btn.textContent='The pit · free';if(UI.gauge)UI.gauge();return;}
      read.textContent=S.mode==='surface'?'On the surface.'
        :Math.round(S.depth)+' m below the plain'+(L?' · '+L.name:' · the shaft');
      btn.textContent=S.mode==='surface'?'The pit':'The pit · '+Math.round(S.depth)+' m';
      if(UI.gauge)UI.gauge();
    };
    slider.addEventListener('input',()=>go(+slider.value,false));

    // ---- the gestures ----
    // In the pit this module owns the camera outright: the engine's own listeners still fire and still move its
    // control state, and this overwrites that state every frame, so they are simply inert. These read the same
    // gestures and put them where they belong.
    let drag=null;
    el.addEventListener('pointerdown',e=>{
      if(S.mode==='surface')return;
      drag={x:e.clientX,y:e.clientY,ride:e.shiftKey||e.button===2};
    });
    addEventListener('pointerup',()=>{drag=null;});
    el.addEventListener('dblclick',()=>{if(S.mode==='surface'&&overHole())dive();});
    addEventListener('pointercancel',()=>{drag=null;});
    el.addEventListener('pointermove',e=>{
      if(!drag||S.mode==='surface')return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
      if(S.mode==='free'){F.yaw+=dx*0.004;F.pitch=Math.max(-1.55,Math.min(1.55,F.pitch-dy*0.004));return;}
      if(drag.ride){go(S.goal+dy*(S.mode==='section'?2.6:1.3),false);return;}   // drag down, go down
      S.az+=dx*0.006;S.el=Math.max(-1.3,Math.min(1.3,S.el+dy*0.004));
    });
    // From the surface, the way down is the obvious one: look at the hole and keep zooming in, or double-click
    // it. Either drops the camera into the shaft at the rim and rides it down to the collar.
    function overHole(){const c=S.ctl;return c&&Math.hypot(c.target.x-AXX,c.target.z-AZZ)<ORIFICE+40;}
    function dive(){setMode('ride');S.depth=0;S.goal=Math.max(S.goal,180);paint();}
    el.addEventListener('wheel',e=>{
      if(S.mode==='surface'){if(e.deltaY<0&&overHole()&&S.ctl.dist<ORIFICE*0.9)dive();return;}
      const k=Math.exp(e.deltaY*0.0012);
      if(S.mode==='free'){F.speed=Math.max(4,Math.min(1500,F.speed/k));if(UI.tick)UI.tick();return;}
      if(S.mode==='section')S.out=Math.max(180,Math.min(4000,S.out*k));
      else S.in=Math.max(18,Math.min(400,S.in*k));
    },{passive:true});

    // W/S and the arrows ride the shaft for as long as they are held, which is the point of a shaft
    const KEYS={w:-1,s:1,arrowup:-1,arrowdown:1};
    addEventListener('keydown',e=>{
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      const k=e.key.toLowerCase();
      if(k==='escape'&&isOpen()){panel.classList.remove('open');btn.setAttribute('aria-expanded','false');return;}
      const tgt=e.target,typing=tgt&&(tgt.tagName==='INPUT'||tgt.tagName==='TEXTAREA'||tgt.tagName==='SELECT'||tgt.isContentEditable);
      if(typing)return;
      if(k==='f'){setMode(S.mode==='free'?'surface':'free');e.preventDefault();return;}
      if(S.mode==='free'){if(FREE_KEYS.has(k)){F.keys.add(k);e.preventDefault();}return;}
      if(S.mode==='surface'){
        if(k==='pagedown'){dive();e.preventDefault();}
        return;
      }
      if(k==='pageup'){step(-400);e.preventDefault();return;}
      if(k==='pagedown'){step(400);e.preventDefault();return;}
      if(KEYS[k]===undefined)return;
      S.held=KEYS[k];e.preventDefault();
    });
    addEventListener('keyup',e=>{const k=e.key.toLowerCase();F.keys.delete(k);if(k==='shift')F.keys.delete('shift');
      if(KEYS[k]!==undefined&&S.held===KEYS[k])S.held=0;});
    addEventListener('blur',()=>{S.held=0;drag=null;F.keys.clear();});   // a key held as focus leaves never sends its keyup

    // #pit=<depth> in the address opens straight into the shaft, the way #war seals the block on the Dredd page,
    // and #ride=<depth> opens inside it rather than outside
    const m=/(^|&)(pit|ride)=(-?\d+)/.exec(api.HASH0||'');
    if(m){setMode(m[2]==='ride'?'ride':'section');S.depth=S.goal=clampD(+m[3]);paint();}
    // #free opens the free camera; with the engine's v=x,y,z,tx,ty,tz it takes off from there, underground or not
    if(/(^|&)free(&|$)/.test(api.HASH0||'')){
      setMode('free');
      const v=/(^|&)v=([-\d.,]+)/.exec(api.HASH0||'');
      if(v){const n=v[2].split(',').map(Number);if(n.length>=6&&n.every(Number.isFinite)){
        F.pos.set(n[0],n[1],n[2]);const d=new THREE.Vector3(n[3]-n[0],n[4]-n[1],n[5]-n[2]).normalize();
        F.yaw=Math.atan2(d.z,d.x);F.pitch=Math.asin(Math.max(-1,Math.min(1,d.y)));}}
      paint();
    }
    ctx.descend=(d,card)=>go(d,card===undefined?true:card);   // window._iz.descend(1600) from the console
    ctx.details=Object.assign(ctx.details||{},{pitControls:panel.querySelectorAll('button').length+' buttons'});
    paint();
  });

  ctx.details=Object.assign(ctx.details||{},{camera:'descent (src/fleshpit/camera.js)'});
}
