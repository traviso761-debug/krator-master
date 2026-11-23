// prefix: ynb
// ================================================================= PLACEHOLDER WET-COASTAL FLORA (cls: 'flora')
// Separate tagged flora defs (README.md rule 1: never baked into building geometry; tagged with climate, aridity,
// abyssal, riparian, and harvest metadata so a wet-coastal mountain biome kit can swap them by key).
const YNB_BIOME='yonni-scoured-hills: wet, temperate..montane, non-abyssal, coastal-riparian';
function ynbDef(key,name,seed,o,build){
 return defBuilding({key,name,seed,cls:'flora',kind:o.kind||key,w:o.w,d:o.d,h:o.h,budget:20000,front:{x:0,z:o.d/2,yaw:0},
  tags:{biome:YNB_BIOME,climate:o.climate||'temperate',aridity:'humid',abyssal:false,riparian:o.riparian||'both',setting:'outdoor',harvest:o.harvest,role:'placeholder'},
  note:o.note+' (placeholder until the Yonni / Scoured Hills biome kit replaces it)',build});
}

ynbDef('ynb-hill-oat','Wet-hill oat & barley bed',7611,{w:3.6,d:2.8,h:1.3,riparian:'no',harvest:{edible:true,part:'grain, straw',season:'late summer'},
 note:'Terraced coastal hill-oat & six-row barley plot'},()=>{
 box('earth',0,0,0,3.2,.1,2.4,P('earth'));
 for(let i=-3;i<=3;i++)for(let j=-2;j<=2;j++){
  const xx=i*.42+rr(-.04,.04),zz=j*.42+rr(-.04,.04),hh=rr(.65,.98);
  cyl('turf',xx,.1,zz,.045,hh,P('amberCl'),5,.02);
 }
});

ynbDef('ynb-sea-kale','Coastal sea-kale & dyer-madder patch',7612,{w:3.2,d:2.8,h:1.1,riparian:'yes',harvest:{edible:true,part:'leaves, carnelian dye-root',season:'all year'},
 note:'Salt-tolerant sea-kale and red-root madder grown on wet coastal terraces'},()=>{
 box('earth',0,0,0,2.8,.1,2.4,P('earth'));
 for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){
  sph('turf',i*.48,.22,j*.42,.24,P('leaf'),.7,7);
 }
});

ynbDef('ynb-amber-pine','Yonni resinous amber-pine',7613,{w:6.2,d:6.2,h:10.4,climate:'montane',riparian:'no',harvest:{edible:false,wood:'ironwood',part:'timber, fossil-amber resin',season:'all year'},
 note:'Wind-sculpted coastal conifer yielding dense dark timber and golden resin'},()=>{
 const h=rr(7.8,9.2);
 cyl('ironwood',0,0,0,.32,h*.62,P('ironwood'),8,.18);
 for(let k=0;k<4;k++){
  const y=h*(.32+k*.15),r=(2.4-k*.42);
  cone('turf',0,y,0,r,1.65-k*.15,P('pine'),9);
 }
});

ynbDef('ynb-creek-alder','Scoured-Hills riparian alder',7614,{w:5.6,d:5.6,h:7.6,riparian:'yes',harvest:{edible:false,wood:'alder',part:'charcoal wood, bark tannin',season:'all year'},
 note:'Multi-stemmed stream-gorge alder used for smokehouse curing and tanning'},()=>{
 for(let k=0;k<3;k++){
  const a=k/3*TAU+.3,tx=Math.cos(a)*.85,tz=Math.sin(a)*.85;
  beam('wood',[0,0,0],[tx,3.6,tz],.14,P('wood'),true,7);
  ellip('turf',tx*1.15,4.5+k*.35,tz*1.15,1.55,1.15,1.45,P('leaf'),0,8);
 }
});
