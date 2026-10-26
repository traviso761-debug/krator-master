// ================================================================= HOST — the black storm (the karaburan, PLAN.md section 3), composed from core/atmos
// core/atmos's weather has no dust-storm mode (KNOWN_ISSUES.md: a core change). Until it does, this host composes one from
// what core/atmos already gives: ATMOS's wind at a gale (its base vector scaled: the weather owns ATMOS.windScale) (the dust box, 89a, lifts thick off every bare dry patch: the
// caustic alkali dust off the lake beds), and, after the shared sky has set the fog and the light for the hour (skyView,
// 89s), the fog thickened and turned ochre-brown and the sun dimmed to a disc. The setting is the panel's select (or
// ?air=still|breeze|storm); it eases in over a few seconds, as core/atmos's weather does. The sky's own values are
// recomputed every frame, so nothing compounds; ATMOS.bindWeather's tracker (89x) follows them as the page's own.
const STORM=(function(){const SCALE={still:.35,breeze:1,storm:3.2},K={still:0,breeze:0,storm:1},OCHRE=new THREE.Color(0x8a6a44);
 const Q=new URLSearchParams(location.search);let mode=SCALE[Q.get('air')]!=null?Q.get('air'):'breeze';
 const B0=ATMOS.windBase.clone();let sc=SCALE[mode];
 const S={k:K[mode],get mode(){return mode;},set(m){if(SCALE[m]!=null)mode=m;},
  // after the sky: the storm's share of the fog, the light and the wind (k 0..1)
  apply(dt){S.k+=(K[mode]-S.k)*Math.min(1,dt*.35);sc+=(SCALE[mode]-sc)*Math.min(1,dt*.35);ATMOS.windBase.copy(B0).multiplyScalar(sc);const k=S.k;if(k<.002)return;
   const f=scene.fog;if(f){f.color.lerp(OCHRE,.85*k);if(f.density!=null)f.density*=1+22*k*k;}
   /* the sky's pass is drawn apart from the world's fog: its own colours and haze take the storm too (the walls go first) */
   {const U=SKY.uniforms,D=new THREE.Color(0x6e5236);U.uZen.value.lerp(D,.8*k);U.uHor.value.lerp(OCHRE,.9*k);U.uFogC.value.lerp(OCHRE,.9*k);U.uFogD.value*=1+40*k;U.uSunI.value*=1-.7*k;}
   sun.intensity*=1-.75*k;HEMI.intensity*=1-.35*k;HEMI.color.lerp(OCHRE,.5*k);fill.intensity*=1-.6*k;}};
 ATMOS.windBase.copy(B0).multiplyScalar(sc);return S;})();
const STORM_CONTROL={select:[['breeze','air: a breeze'],['still','air: still'],['storm','air: a black storm (the karaburan)']],id:'airsel',on:v=>STORM.set(v)};
if(STORM.mode!=='breeze')STORM_CONTROL.select.sort((a,b)=>(b[0]===STORM.mode)-(a[0]===STORM.mode));
