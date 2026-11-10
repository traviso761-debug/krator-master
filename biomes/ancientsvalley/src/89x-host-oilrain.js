// ================================================================= HOST - the oily rain (a weather mode over the polluted half)
// [web] The owner, 2026-11-09: "a toxic rain effect for the valley ... this one will just be a weather mode, oily rain over the polluted
// portions". The Weather selector gains 'oily rain'. In that mode the sky's own rain stays off and core/atmos's RAIN WALL stands on the
// valley's field instead of a mountain face (fx/89-atmos-fx-rainwall.js, o.field): curtains of dark rain hang over the foul half (F.foul
// over a half, on dry land), seen from the wild half as smears under the cloud, and under them the weather's own streaks fall, the ground
// wets and the fog greys, only while the eye stands in them. The streaks are the colour of oil: core/atmos's ACID RAIN
// (fx/89-atmos-fx-acid.js) puts the rain's colour on a uniform and provides the toxic dose (the 'rain' and 'ph' fields to core/hazard,
// pH 2.5 under the polluted half against clean rain elsewhere); each frame this page sets that colour to a near-black brown with a slow
// rainbow sheen, as oil on water turns. No material is etched (ATMOS.acidOn is not called) and no cover map is rendered: one draw call of
// curtains and a few uniforms (the page is near Chrome's heap limit). Any other mode turns the wall off.
const AV_OIL=(function(){if(!ATMOS.W||typeof ATMOS.rainWall!=='function')return null;const W=ATMOS.W,F=STAGE.F,LY=STAGE.lakeY,MODE='oily rain';
 if(W.MODES.indexOf(MODE)<0)W.MODES=W.MODES.concat([MODE]);
 /* the field: the foul half's land, eased in over its edge, nothing on the water */
 const field=(x,z)=>{if(terrainH(x,z)<LY+.5)return 0;const f=F.foul(x,z);return f<.45?0:f>.75?1:(f-.45)/.3;};
 const R=ATMOS.rainWall({field,centre:[0,0],radius:STAGE.R+600,cell:240,min:.3,top:LY+520,max:600,alpha:.55,colour:[.20,.17,.14],inside:.95,seed:(STAGE.seed|0)+97});
 R.off=W.mode!==MODE;
 /* the dose only in this mode (the other modes' rain is clean, 5.6) */
 const S=ATMOS.acidRain?ATMOS.acidRain({ph:(x,z)=>W.mode===MODE?5.6-3.1*field(x,z):5.6,mmh:24}):null;
 /* the oil's colour: a dark brown base, its hue turning slowly through a thin-film rainbow, faint (the streaks are lit by the page's light) */
 const base=[.16,.13,.10],c=new THREE.Color();
 const clean=ATMOS.PRESETS.rain.color;
 ATMOS.hook(t=>{const on=W.mode===MODE;R.off=!on;if(!S||!ATMOS.U.acidC)return;if(!on){ATMOS.U.acidC.value.setRGB(clean[0],clean[1],clean[2]);return;}const h=(t*.02)%1;c.setHSL(h,.55,.32);ATMOS.U.acidC.value.setRGB(base[0]+.10*c.r,base[1]+.10*c.g,base[2]+.10*c.b);});
 const n=R.cells?R.cells.length:0;
 REGISTER({name:'the oily rain over the polluted half',kind:'weather',x:0,z:0,y:LY,r:STAGE.R+600,h:520,tags:{kind:'weather',mode:MODE,curtains:n,acid:!!S}});
 return{R,S,field,mode:MODE,curtains:n};})();
