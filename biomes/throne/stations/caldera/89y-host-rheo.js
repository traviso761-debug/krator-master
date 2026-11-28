// ================================================================= HOST — the Rheoliths at the lake's hot ring (biomes/rheolith, read in place: its PLAN.md section 8, step 3)
// The kit's deep mineral-siloxane life lives only where RHEO_PHYS.windowAt says it can (180-550 degC, water activity under .15, pH 3.8 or less). On the
// summit the lava lake is too hot for it (over 600 degC it calcines) and the open floor too cold; between them, the ring of rock round the lake whose
// veins glow at night (84's hot ring) is its country: a breach in the ring on the side toward the rim, two satellite mouths either way along the ring,
// and a bench on the lake's crust shelf at its edge, where the kit's blisters and comb plates gather ("crust shelves in summit lava lakes").
//   THE HEAT    the soil (KTHERM's where the page has vents, else the summit's -5 degC) plus the lake's radiance, 700 degC at its edge falling over ~40 m
//               of rock, plus the conduit's at the mouths: ~430 degC at the throat's walls, ~240 at a satellite's
//   THE WATER   the thin dry air of the summit: water activity .04 at the mouths, .3 away from them
//   THE ACID    pH 1.8 at the mouths, 4.8 150 m off (the plume's acid gas)
// The lake reads as water to the kit (waterH), so nothing is laid on the lava. Before the build (89z). ?rheo=0 none
const RHEO_SITE=(function(){if(typeof RHEO==='undefined'||!RHEO.build||!BREACH)return null;
 const ux=-LAKE.x,uz=-LAKE.z,ul=Math.hypot(ux,uz)||1,a0=Math.atan2(uz/ul,ux/ul),R1=LAKE.r*1.22,at=(a,r)=>({x:LAKE.x+Math.cos(a)*r,z:LAKE.z+Math.sin(a)*r});
 const pit=BREACH;   /* the breach cut into the ground (47, src/44r): on the ring at R1 toward the rim */
 const vents=[{x:pit.x,z:pit.z,s:1}].concat([-100,-50,50,100].map(d=>Object.assign(at(a0+d/R1,R1),{s:.8})));
 const b=at(a0+40/R1,LAKE.r*1.06),bench={x:b.x,z:b.z,rx:30,rz:20};
 const mouthK=(x,z)=>{let k=Math.exp(-Math.pow(Math.hypot(x-pit.x,z-pit.z)/(pit.throatR*1.6),2)),s=0;
  for(let i=1;i<vents.length;i++)s=Math.max(s,Math.exp(-Math.pow(Math.hypot(x-vents[i].x,z-vents[i].z)/2.5,2)));return{k,s};};
 const lakeD=(x,z)=>Math.max(0,Math.hypot(x-LAKE.x,z-LAKE.z)-LAKE.r);
 const temp3=(x,y,z)=>{const m=mouthK(x,z),T0=typeof THERM!=='undefined'&&THERM?THERM.heatAt(x,z):-5;return T0+700*Math.exp(-lakeD(x,z)/40)+430*m.k+240*m.s;};
 const aw=(x,y,z)=>{const m=mouthK(x,z);return .04+.26*(1-smooth(.15,.4,Math.max(m.k,m.s)));};   /* dry across the throat's walls and the mouths */
 const near=(x,z)=>Math.min(...vents.map(V=>Math.hypot(x-V.x,z-V.z)));
 const ph=(x,z)=>1.8+3*smooth(5,150,near(x,z));
 const st=(function(){const cur=BIO.cur;BIO.cur='rheolith/ring';try{return RHEO.build({R:TERR.R-150,quality:1,temp3,aw,ph,pit,pitY:BREACH.y,vents,bench,wind:[.71,.71]});}
  catch(e){reportErr('rheolith: '+e.stack);return null;}finally{BIO.cur=cur;}})();
 REGISTER({name:'The ring\'s throat (the Rheoliths\' breach beside the lava lake: mineral life in the hot rock)',x:pit.x,z:pit.z,y:terrainH(pit.x,pit.z)-pit.r,r:pit.r*1.4,h:pit.r*2,rheo:true});
 return{pit,vents,bench,temp3,aw,ph,counts:st};})();
