// ================================================================= HOST — the hazards (every station: PLAN.md section 5), on core/hazard
// The range's dangers are the land's. The geyser kit registers its own (a geyser's column on its clock, a spring's scald, its rim's hot crust, a
// fumarole's gas, a mud pot, an acid field: 46's GEYSER.hazard). This page adds what the plan names and the kit has not, each a record registered
// before anything is drawn, each with its tell (PLAN.md: "readable before they are deadly"):
//   GAS        each hollow a night-gas record (KHAZ.ENV.nightGas, 22): CO2 and H2S pool in it on still nights (19:00 to 06:00, two hours to build and
//              to drain); its tell the dead birds and the bare ground (60 puts the birds in it)
//   CRUST      the sinter over the boiling springs (temp .9 and over): a crust that breaks under a person's weight and stays broken (KHAZ.ENV.crust,
//              22), the boiling water under it a heat record held until it breaks; the tell a hollow sound and steam at the cracks
//   FLOOD      a station's lahar or outburst flood down its gorge (SITE.flood: KHAZ.ENV.flood, a front on the river's own line and bed); the tell a
//              rising roar
//   FALL       the steep: the gorge's walls and the crater's, a cylinder record every ~60 m of edge where the ground falls away
//   THE AIR    the thin air and the cold (KHAZ.provide 'pressure' and 'temperature': 1.6 atm x e^(-h/8 km); the station's mean, its lapse, the vents'
//              warmth at the ground); the plume's ash and acid rain are 89b's
// Each in core/tags (BIO.record) so the hazard overlay, the inspector's hazard line (KTAGS.hazardAt) and the export read them. They are hazard bands,
// not the inspector's named volumes (REG): a hollow on bare ice or a flood's path over water holds nothing the volume check could find, and the
// band's shape is its hazard's own. The night records read the host's clock (KHAZ.bindClock).
const HAZ=(function(){const out={gas:0,crust:0,flood:0,fall:0};if(typeof KHAZ==='undefined')return out;
 const E=KHAZ.ENV||null;
 KHAZ.bindClock(()=>typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock?KHOST.host.clock.hour:13);
 const add=o=>BIO.record(o);
 // ---- the gas in the hollows (the dead birds are its tell: 60)
 HOLLOWS.forEach(H=>{const y=terrainH(H.x,H.z);
  const body=E?E.nightGas(H.r*.9,{h:Math.max(2,H.d*.8),from:19,to:6,ramp:2,danger:.95,dose:2,falloff:'smooth',tell:{sign:'dead birds and bare ground in the hollow; the reek of rotten eggs at dusk',colour:'#8a8a3a'}}):
   {kind:'gas',danger:.95,dose:2,falloff:'smooth',shape:{type:'cyl',r:H.r*.9,h:Math.max(2,H.d*.8)}};
  add({name:H.name,kind:'hollow',x:H.x,z:H.z,y:y-.5,r:H.r,h:H.d+2,tags:{hazard:body}});out.gas++;});
 // ---- the crusts over the boiling springs
 if(E&&LAYOUT)LAYOUT.springs.filter(s=>s.temp>=.9).forEach(s=>{const r=s.r+Math.min(8,s.apron*.5),y=terrainH(s.x+s.r+2,s.z);
  const B=E.crust(r,{mass:60,heal:null,below:'heat',depth:2,under:{danger:.95,dose:4},crust:{tell:{sign:'a hollow ring underfoot, steam from the cracks',colour:'#e8e2d0'}}});
  const c=add({name:'The sinter crust over '+s.name.replace(/\s*\(.*$/,'')+' (it breaks underfoot)',kind:'crust',x:s.x,z:s.z,y:y-.4,r,h:1.2,tags:{hazard:B.crust}});
  if(c){B.below.under.crust=c.id;add({name:'Boiling water under the crust ('+s.name.replace(/\s*\(.*$/,'')+')',kind:'vent',x:s.x,z:s.z,y:y-2.2,r,h:2.2,tags:{hazard:B.below}});out.crust++;}});
 // ---- the gorge's flood (a lahar or an outburst: SITE.flood names its times; the path is the river's own line and bed)
 if(E&&RIVER&&SITE.flood){const F=SITE.flood,P=RIVER.pts.filter((p,i)=>i%6===0||i===RIVER.pts.length-1).map(p=>[p[0],p[2]-(SITE.river.depth==null?1.4:SITE.river.depth),p[1]]);
  const FL=E.flood(P,{w:dv(F.w,RIVER.hw*2.2),speed:dv(F.speed,4),start:dv(F.start,0),period:dv(F.period,null),rise:dv(F.rise,60),hold:dv(F.hold,300),fall:dv(F.fall,900),depth:dv(F.depth,6),
   tell:{sign:'a rising roar up the gorge; the water greying with mud; the lahar\'s marks high on the walls',colour:'#7a6a52'}});
  add({name:F.name||'The gorge\'s flood (a lahar)',kind:'flood',x:FL.at[0],z:FL.at[2],y:FL.at[1],r:30,h:dv(F.depth,6),tags:{hazard:FL.hazard}});out.flood++;}
 // ---- the falls: where the ground drops away steeply (a 60 m lattice over the field grid's slope; the rim is the lattice point's higher side)
 {const cs=60,N=Math.floor(TERR.R/cs);let n=0;
  for(let j=-N;j<=N&&n<260;j++)for(let i=-N;i<=N&&n<260;i++){const x=i*cs,z=j*cs;if(FIELD.slope(x,z)<.82||FIELD.tarn(x,z)>.5)continue;
   const h0=terrainH(x,z),drop=Math.max(h0-terrainH(x+12,z),h0-terrainH(x-12,z),h0-terrainH(x,z+12),h0-terrainH(x,z-12));if(drop<7)continue;
   add({name:SITE.fallName||'A sheer drop',kind:'cliff',x,z,y:h0-drop*2,r:24,h:drop*2+4,tags:{hazard:{kind:'fall',danger:.8,shape:{type:'cyl',r:24,h:drop*2+4},tell:{sign:'the edge: loose ash on the lip'}}}});n++;}
  out.fall=n;}
 // ---- the air: thin and cold (the walker asks KHAZ.here)
 KHAZ.provide('pressure',(x,y,z,t)=>1.6*Math.exp(-y/8000));
 const H0=MODEL.h(0,0);
 KHAZ.provide('temperature',(x,y,z,t)=>{const g=terrainH(x,z),warm=y-g<3?heatAt(x,z)-SOIL:0;return SOIL-6.5*(y-H0)/1000+warm;});
 return out;})();
window._hazards=HAZ;
