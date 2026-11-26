// ================================================================= HOST - the bend (core/shader KWARP on KHOOK.warp; the final rebuild, pair 10, 2026-11-04)
// [web] BACKPORT.md's universal set: "KHOOK.warp where relevant (the Cut's eigenweapon warp: KWARP)". The Cut's warp proper is placement (CUT.warp: the
// lean, the stretch, the steps, the bites; PLAN.md section 3: "no per-frame cost"), and stays so. This is the one thing the placement cannot show: the
// field itself, felt as a faint ringing. With ?bend=1 (OFF at load: a look decision for the owner, KNOWN_ISSUES.md) every material the scene draws takes
// one vertex warp (KWARP.install): a slow travelling ripple along the field's own axis (spokes or rings, the same alternation as CUT.field, 6 km a ring),
// its amplitude A x s (s the warp's strength there, 0 at the lip), gone within a few metres of the eye so the ground underfoot never slides. The sky
// dome and raw shaders are left out (KWARP's own skip). Nothing changes, and no program is recompiled, without the flag. window._bend says what it did.
window._bend=null;
const BEND=(function(){if(typeof KWARP==='undefined'||new URLSearchParams(location.search).get('bend')!=='1'){window._bend='off (the default; ?bend=1 turns it on)';return null;}
 const site=STAGE.toBowl(0,0),R=CUT.lipR(CUT.bearing(site[0],site[1])),A=STAGE.bendA==null?.45:STAGE.bendA;
 const U={uBendC:{value:new THREE.Vector2(-site[0],-site[1])},uBendR:{value:R},uBendA:{value:A},uBendT:{value:0}};
 const glsl=['uniform vec2 uBendC;uniform float uBendR;uniform float uBendA;uniform float uBendT;',
  'vec3 kWarp(vec3 p){vec2 b=p.xz-uBendC;float r=max(length(b),1.0);float s=smoothstep(uBendR,0.35*uBendR,r);',
  ' vec2 ar=-b/r,at=vec2(-ar.y,ar.x);float q=r/6000.0,f=fract(q)*6000.0,odd=mod(floor(q),2.0),ed=min(f,6000.0-f);',
  ' float k=mix(1.0-odd,odd,smoothstep(0.0,500.0,ed)*0.5+0.5);vec2 ax=normalize(mix(ar,at,k));',
  ' vec3 e=kEye();float near=smoothstep(6.0,40.0,distance(p.xz,e.xz));',
  ' float w=sin(dot(b,ax)*0.0349-uBendT*0.55)*0.7+sin(r*0.0127+uBendT*0.31)*0.3;',
  ' p.xz+=ax*(uBendA*s*near*w);return p;}'].join('\n');
 try{const W=KWARP.install({key:'cut-bend',glsl,uniforms:U,scene});tick(dt=>{U.uBendT.value+=Math.min(dt||0,.1);});
  setTimeout(()=>{try{W.sweep();}catch(e){}},1500);window._bend={on:true,amp:A,lipR:Math.round(R),s:+CUT.field(site[0],site[1]).s.toFixed(2)};window.BEND=W;return W;}
 catch(e){reportErr('bend: '+e.stack);window._bend='failed';return null;}})();
