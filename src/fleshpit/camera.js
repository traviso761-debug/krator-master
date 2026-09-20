// ---------- the descent: this page's own camera and its own controls ----------
// Every other place on this site is a city, and a city is looked at the way the engine looks at one: orbit a
// point on the ground, pan across it, zoom. A hole is not a city. What you want here is to ride the shaft -
// pick a depth, hold the axis, turn round it - and to be able to stand outside and read the seven layers off
// it like a cross-section, which is what the back-face trick in organism.js is for.
//
// So this page steers its own camera. The engine offers exactly one hook for it, ctx.camFrame: it is handed the
// control state once the engine has had its turn, every frame, and may overwrite any of it. A page that never
// sets it - which is every other page on the site - is not affected in any way. On the surface this module
// hands every frame straight back, so up top the park behaves exactly like Chicago.
//
// The controls are all in one panel, because the thing anyone actually wants to do here is go down, and that
// should not be assembled out of three widgets in two corners of the screen. Depth is a readout, a slider, a
// pair of steps and a button per layer; W and S held down ride the shaft, drag turns, shift-drag rides, the
// wheel pulls back.
export function descent(api){
  const {C,ctx,scene,camera,renderer,sky,sun,ambient,hemi}=api;
  const K=C.descent||{},P=C.pit||{};
  const LAYERS=P.layers||[];
  if(!LAYERS.length)return;
  const RIM=P.rim!==undefined?P.rim:26;
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

  // ---- the frame ----
  ctx.camFrame=(now,ctl)=>{
    // A viewpoint button in the engine's own panel sets a fresh fly goal. If this went on overwriting the camera
    // the panel would simply be dead while the descent was on, so a goal we have not seen before is taken as
    // what it is - someone asking for the surface camera back - and the pit hands it over.
    if(ctl.goal&&ctl.goal!==S.seen){S.seen=ctl.goal;if(S.mode!=='surface'&&UI.leave)UI.leave();return;}
    S.seen=ctl.goal;
    if(S.mode==='surface')return;                  // the engine's own camera, untouched
    const dt=Math.min(0.08,(now-(S.t||now))/1000);S.t=now;
    if(S.held)S.goal=clampD(S.goal+S.held*RIDE*dt);           // W/S held: ride, rather than step
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
  };

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
    hint.textContent='Hold W and S (or ↑ and ↓) to ride the shaft; Page Up and Page Down jump. '
      +'Drag to turn, shift-drag to ride, wheel to pull back.';
    panel.appendChild(hint);

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
      if(m!=='surface'&&S.mode==='surface'){       // arriving: start from where the camera already is
        S.t=performance.now();
        S.depth=clampD(Math.max(0,RIM-camera.position.y));
        if(S.goal<40)S.goal=140;
        S.el=Math.min(0.5,Math.max(-0.2,S.el));
      }
      S.mode=m;
      // The polyps and the strands hang off the near wall as much as the far one, and in the section view the
      // near wall has been culled away on purpose - so they would be the only thing left standing in front of
      // the cutaway. They belong to the inside of the shaft, and they are shown when you are inside it.
      if(ctx.pitFine)ctx.pitFine.visible=(m!=='section');
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
      for(const [b,m] of [[bSurf,'surface'],[bSect,'section'],[bRide,'ride']])
        b.setAttribute('aria-pressed',String(S.mode===m));
      layerBtns.forEach((b,i)=>b.setAttribute('aria-current',String(LAYERS[i]===L&&S.mode!=='surface')));
      slider.value=String(Math.round(S.goal));
      UI.tick();
    }
    UI.tick=()=>{
      const L=layerAt(S.depth);
      read.textContent=S.mode==='surface'?'On the surface.'
        :Math.round(S.depth)+' m below the plain'+(L?' · '+L.name:' · the shaft');
      btn.textContent=S.mode==='surface'?'The pit':'The pit · '+Math.round(S.depth)+' m';
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
    addEventListener('pointercancel',()=>{drag=null;});
    el.addEventListener('pointermove',e=>{
      if(!drag||S.mode==='surface')return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
      if(drag.ride){go(S.goal+dy*(S.mode==='section'?2.6:1.3),false);return;}   // drag down, go down
      S.az+=dx*0.006;S.el=Math.max(-1.3,Math.min(1.3,S.el+dy*0.004));
    });
    el.addEventListener('wheel',e=>{
      if(S.mode==='surface')return;
      const k=Math.exp(e.deltaY*0.0012);
      if(S.mode==='section')S.out=Math.max(180,Math.min(4000,S.out*k));
      else S.in=Math.max(18,Math.min(400,S.in*k));
    },{passive:true});

    // W/S and the arrows ride the shaft for as long as they are held, which is the point of a shaft
    const KEYS={w:-1,s:1,arrowup:-1,arrowdown:1};
    addEventListener('keydown',e=>{
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      const k=e.key.toLowerCase();
      if(k==='escape'&&isOpen()){panel.classList.remove('open');btn.setAttribute('aria-expanded','false');return;}
      if(S.mode==='surface')return;
      if(k==='pageup'){step(-400);e.preventDefault();return;}
      if(k==='pagedown'){step(400);e.preventDefault();return;}
      if(KEYS[k]===undefined)return;
      S.held=KEYS[k];e.preventDefault();
    });
    addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(KEYS[k]!==undefined&&S.held===KEYS[k])S.held=0;});
    addEventListener('blur',()=>{S.held=0;drag=null;});   // a key held as focus leaves never sends its keyup

    // #pit=<depth> in the address opens straight into the shaft, the way #war seals the block on the Dredd page,
    // and #ride=<depth> opens inside it rather than outside
    const m=/(^|&)(pit|ride)=(-?\d+)/.exec(api.HASH0||'');
    if(m){setMode(m[2]==='ride'?'ride':'section');S.depth=S.goal=clampD(+m[3]);paint();}
    ctx.descend=(d,card)=>go(d,card===undefined?true:card);   // window._iz.descend(1600) from the console
    ctx.details=Object.assign(ctx.details||{},{pitControls:panel.querySelectorAll('button').length+' buttons'});
    paint();
  });

  ctx.details=Object.assign(ctx.details||{},{camera:'descent (src/fleshpit/camera.js)'});
}
