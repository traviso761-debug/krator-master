// ================================================================= HOST — the Twins themselves, seen from a station (PLAN.md section 2)
// The two cones stand in the far country (82-host-far.js: map 5.1's relief carries them, Option A's heights: the NW Twin 6,480 m, the SE
// Twin 5,880 m). What the map cannot draw is what makes them active: the NW Twin (Al-Qaran al-Kabir, the Ember Twin) degasses from its
// lava lake, a grey-brown plume leaning downwind and its crater's glow at night; the SE Twin (Al-Qaran al-Saghir, the Rime Twin) steams
// white through its glacier (the Erebus ice towers). Records first (core/tags: each a feature with its plume; the far flag, as the
// Godthrone's vent on its wall station: the probe's occupancy skips it), then drawn: ATMOS.smoke (two kinds added to this page's smoke
// preset: core/atmos 0p, "change a value before placing") and ATMOS.glowAdd (the glow layer, on with the night).
const TWIN_CONES=(function(){const t=[{px:988,py:1458,peak:6480,floor:5980,kind:'plume',name:'The NW Twin, Al-Qaran al-Kabir (the Ember Twin: degassing from its lava lake)',glow:true},
  {px:1042,py:1498,peak:5880,floor:5420,kind:'twinsteam',name:'The SE Twin, Al-Qaran al-Saghir (the Rime Twin: steaming through its glacier)',glow:false}];
 const SP=ATMOS.PRESETS.smoke;
 /* the kinds' indexes run on from the preset's own three (chimney, steam, spray); the page's only smoke is 20-140 km off, so the
    preset's distance fade (its own: a chimney's 0.0018 a metre) is the far air's here */
 /* seen from 20-140 km: sprites hundreds of metres across (14-60 px at 24 km), dense enough to read as a column against the sky */
 SP.plume={index:3,n:70,rate:.02,rise:2600,drift:1800,wobble:80,size:[420,1700],alpha:.42,rainDamp:0,color:[.6,.56,.52]};
 SP.twinsteam={index:4,n:50,rate:.03,rise:1400,drift:900,wobble:50,size:[300,1200],alpha:.38,rainDamp:0,color:[.92,.93,.95]};
 SP.distFade=.00003;SP.pxMax=420;
 const em=[];let glows=0;
 t.forEach(T=>{const p=pxXZ(T.px,T.py);T.x=p[0];T.z=p[1];T.d=Math.hypot(p[0],p[1]);
  REGISTER({name:T.name,x:T.x,z:T.z,y:T.floor-600,r:5500,h:T.peak-T.floor+3000,kind:'feature',far:true,tags:{volcano:'active',twin:T.kind==='plume'?'NW':'SE'}});
  if(T.d>150000)return;   /* past the far plane */
  for(let k=0;k<5;k++){const a=KRAND.unit(KRAND.hash(WORLD,T.px,k,0x7155))*TAU,r=260*KRAND.unit(KRAND.hash(WORLD,T.py,k,0x7156));em.push([T.x+Math.cos(a)*r,T.floor+40,T.z+Math.sin(a)*r,T.kind]);}
  if(T.glow){ATMOS.glowAdd(T.x,T.floor+80,T.z,[1,.42,.12],900,-1,30);glows++;}});
 const fume=em.length?ATMOS.smoke(em):null;ATMOS.finish();
 return{cones:t,fume,emitters:em.length,glows};})();
