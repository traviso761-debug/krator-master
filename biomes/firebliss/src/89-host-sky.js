// ================================================================= HOST — Krator's sky over the Firebliss Range (every station, at its own site)
// ATMOS.skyBiome draws the standard sky (core/atmos/SKY-PLAN.md section 9) at the station's place on the scale model (the old canvas px: 5.1 px less
// 272, 330), on the host clock, with the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fill, the fog
// and the exposure from the colour script. The site's air (its pressure from its height, SITE.sky's humidity and cloud). Local detail: the range's ridge
// bands round the horizon, and each of the five volcanoes' plumes in the sky where the volcano stands past the far field (the model's vents.json: the
// summit's bearing and height from here, the plume drifting south-east, PLAN.md section 1); a vent on the page itself is 89b's plume.
const SKY_SITE={px:FB_MODEL.px-272,py:FB_MODEL.py-330};
const SKY_PLUMES=(function(){const H0=MODEL.h(0,0),deg=180/Math.PI,out=[];
 MODEL.vents.forEach(v=>{const x=v.at[0],z=v.at[1],d=Math.hypot(x,z);if(d<5000)return;
  const az=v=>(Math.atan2(v[0],-v[1])*deg+360)%360,el=(dx,dz,y)=>Math.atan2(y-H0,Math.hypot(dx,dz))*deg;
  const top=dv(v.peak,5500)+1200,far=dv(v.peak,5500)+2600,dr=[.7071,.7071];
  const via=[x+dr[0]*6000,z+dr[1]*6000],to=[x+dr[0]*22000,z+dr[1]*22000];
  out.push({kind:'plume',from:[az([x,z]),el(x,z,dv(v.peak,5500))],via:[az(via),el(via[0],via[1],top)],to:[az(to),el(to[0],to[1],far)],
   width:[.6,3.2+60000/Math.max(d,8000)*.2],lit:[.86,.82,.78],belly:[.38,.36,.35],alpha:.55,haze:.35,drift:.4,name:v.name});});
 return out.sort((a,b)=>b.from[1]-a.from[1]).slice(0,6).map(p=>{const o=Object.assign({},p);delete o.name;return o;});})();
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:SKY_SITE,
 preset:{air:Object.assign({pressure:SITE_ATM},SITE.sky.air),clouds:SITE.sky.clouds,fogDensity:scene.fog.density,
  ridges:[{base:3.6,amp:3.6,cycles:44,octaves:3,seed:81,peaks:36,peakAmp:1.0,win:null,floor:1.0,dist:24000,haze:.18,snowH:700,forestH:0,rock:[.42,.42,.44],snow:[.93,.94,.96]},
   {base:2.0,amp:2.4,cycles:44,octaves:3,seed:82,peaks:36,peakAmp:.6,win:null,floor:.1,dist:9000,haze:.26,snowH:250,forestH:SITE.tarn?.25:0,rock:[.36,.35,.36],snow:[.92,.93,.95]}],
  landmarks:SKY_PLUMES}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
