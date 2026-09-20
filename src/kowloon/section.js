// ---------- the section: a plane you can push through the block ----------
// The Walled City is the one place on this site where the inside matters more than the outside. From any
// angle it is a cliff of facades with nothing to see; what it was is what happened behind them - fourteen
// storeys of flats, factories, dentists' surgeries and lanes with no daylight, grown into each other until
// the whole block was one building.
//
// So this page can cut it open. The renderer gets a clipping plane, and everything in front of the plane is
// simply not drawn - walls, roofs, aerials, the lot. It is a section rather than a cutaway: the geometry is
// not capped, so you see into the rooms the way a building survey draws them, with the floors as lines.
// Only this page sets it up, and it is off until asked for.
export function section(api){
  const {THREE,C,ctx,renderer,camera,animHooks}=api;
  const S={on:false,axis:0,at:0.5};
  const plane=new THREE.Plane(new THREE.Vector3(1,0,0),0);
  // The slider runs over the block, not the map: the block is a fifth of the map across, and a slider that
  // covers the whole thousand metres spends most of its travel cutting empty Kowloon City.
  const K=C.section||{},B=api.B;
  const span=()=>S.axis?(K.z||[B.z0,B.z1]):(K.x||[B.x0,B.x1]);

  // The cut has to take away what is between you and it, so which way the plane faces depends on where you
  // are standing: walk round the block and the section turns round with you.
  function apply(){
    if(!S.on){renderer.clippingPlanes=[];return;}
    const [lo,hi]=span(),at=lo+(hi-lo)*S.at;
    const here=S.axis?camera.position.z:camera.position.x;
    const sign=here<at?1:-1;                      // keep the far side
    plane.normal.set(S.axis?0:sign,0,S.axis?sign:0);
    plane.constant=-sign*at;
    renderer.clippingPlanes=[plane];
  }
  animHooks.push(()=>{if(S.on)apply();});

  api.onUI(({ui,mkBtn})=>{
    const btn=mkBtn('Section',ui,()=>{S.on=!S.on;btn.setAttribute('aria-pressed',String(S.on));
      slider.style.display=S.on?'':'none';axisBtn.style.display=S.on?'':'none';apply();});
    btn.setAttribute('aria-pressed','false');
    btn.title='Cut the block open and push the cut through it';
    const axisBtn=mkBtn('Cut: across',ui,()=>{S.axis=S.axis?0:1;axisBtn.textContent=S.axis?'Cut: along':'Cut: across';apply();});
    axisBtn.style.display='none';
    const slider=document.createElement('input');
    slider.type='range';slider.min='0';slider.max='1000';slider.value='500';
    slider.setAttribute('aria-label','Where the cut is');
    slider.style.cssText='pointer-events:auto;width:200px;align-self:center';
    slider.style.display='none';
    slider.addEventListener('input',()=>{S.at=+slider.value/1000;apply();});
    ui.appendChild(slider);
    // #section=0.42 in the address opens with the block already cut, the way #war and #pit do elsewhere
    const m=/(^|&)section=([\d.]+)(?:,(along|across))?/.exec(api.HASH0||'');
    if(m){S.on=true;S.at=Math.max(0,Math.min(1,+m[2]));S.axis=m[3]==='along'?1:0;
      btn.setAttribute('aria-pressed','true');slider.value=String(Math.round(S.at*1000));
      slider.style.display='';axisBtn.style.display='';axisBtn.textContent=S.axis?'Cut: along':'Cut: across';
      apply();}
  });

  ctx.details=Object.assign(ctx.details||{},{section:'clipping plane (src/kowloon/section.js)'});
}
