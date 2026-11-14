// ---------- Galaxy class: going to warp ----------
// Fan work. Star Trek belongs to Paramount.
//
// The jump itself (the spool, the stretch, the flash where she was) is in events.js, and the star field smeared
// in proportion to the warp factor and the flash over the view at the jump are the shared ones every ship page
// can have (src/starship/warpfx.js, driven from what model() returns as `warp`). This adds the nacelles: a glow
// standing off each warp field grille that builds as the engines spool up, and burns brighter the higher the
// factor, flickering a little as a field does; and the grilles themselves pushed further with the factor.
import {NACELLE} from './dims.js';
import {NACZ,nacHalf} from './hull.js';

export function warpfx(W){
  const {THREE,G,animHooks}=W,S=W.flight,F=W.fx;
  const GR=NACELLE.grille,y=(GR.y0+GR.y1)/2,glows=[];
  for(const side of [1,-1])for(const out of [1,-1])for(let i=0;i<6;i++){
    const x=GR.x0+(GR.x1-GR.x0)*(i+0.5)/6,hw=nacHalf(192-x)[0];
    const s=F.sprite(0x8cc8ff,60,0);s.visible=false;s.position.set(x,y,side*NACZ+out*(hw+2));G.add(s);glows.push(s);}
  let shown=0;
  animHooks.push(now=>{
    // how hard the engines are working: events.js sets the grilles' colour from it (1 + 1.4 k)
    const k=Math.max(0,Math.min(1,(W.grilleMat.color.r-1)/1.4)),f=S.warp||(W.spooling&&W.course?W.course.w:0)||0;
    const want=k*(0.25+0.075*f);
    // (out of sight entirely at rest: two dozen sprites at nothing are still two dozen draws)
    if(want<0.01){if(shown){shown=0;for(const g of glows)g.visible=false;}return;}
    if(!shown)for(const g of glows)g.visible=true;shown=want;
    if(f)W.grilleMat.color.multiplyScalar(1+0.05*f);
    const fl=0.88+0.12*Math.sin(now*0.031)*Math.sin(now*0.0173);
    for(let i=0;i<glows.length;i++){const g=glows[i];g.material.opacity=Math.min(1,want*fl*(0.85+0.15*Math.sin(now*0.004+i)));g.scale.setScalar(50+9*f);}
  });
  return {};
}
