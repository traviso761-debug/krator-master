// ---------------------------------------------------------------- animation: the swell, the oars, the sea's normal map
// Each vessel heaves, rolls and pitches on its own phase; its builder's anims (oar strokes) run on
// the same clock. window._api.pause(t) freezes the clock at t seconds (verify.py shots are then
// repeatable).
FRAME_HOOKS.push((dt,now)=>{const t=window._rsPause!=null?window._rsPause:now/1000;
 TEX.rsWater.offset.x=(t*.004)%1;TEX.rsWater.offset.y=(t*.0025)%1;
 for(const p of RS_PLACED){const k=1/Math.sqrt(Math.max(8,p.D.L)/12);const a=t*.55+p.ph;
  p.G.position.y=.18*k*Math.sin(a);p.G.rotation.set(.035*k*Math.sin(a*.8+1.3),0,.018*k*Math.sin(a*.6+.4),'YXZ');
  for(const f of p.V.anims)f(t);}});
// labels start hidden on this sheet (the Labels button shows them): twelve names over one roadstead crowd every wide shot
if(LABELS)LABELS.visible=false;
