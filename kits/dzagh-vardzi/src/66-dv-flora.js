// prefix: dvb
// ================================================================= PLACEHOLDER VARDZIETI GORGE FLORA (cls: 'flora')
// Separate tagged flora defs (README.md rule 1: never baked into building geometry; tagged with climate, aridity,
// abyssal, riparian, and harvest metadata so a Crookwash / Vardzieti mountain biome kit can swap them by key).
const DVB_BIOME='vardzieti-crookwash: rain-fed montane gorges (+950..+2,274 m), non-abyssal, riparian-terrace';
function dvbDef(key,name,seed,o,build){
 return defBuilding({key,name,seed,cls:'flora',kind:o.kind||key,w:o.w,d:o.d,h:o.h,budget:20000,front:{x:0,z:o.d/2,yaw:0},
  tags:{biome:DVB_BIOME,climate:o.climate||'montane',aridity:'humid',abyssal:false,riparian:o.riparian||'both',setting:'outdoor',harvest:o.harvest,role:'placeholder'},
  note:o.note+' (placeholder until the Vardzieti / Crookwash biome kit replaces it)',build});
}

dvbDef('dvb-apricot-tree','Vardzieti terrace apricot tree',7611,{w:4.8,d:4.8,h:5.6,climate:'temperate',riparian:'no',
 harvest:{edible:true,part:'apricots, brandy mash, kernel oil',season:'midsummer'},
 note:'Gnarled sunny gorge-terrace apricot tree bearing golden fruit dried on slate roof-plazas and distilled in qvevri'},()=>{
 const h=rr(4.1,4.8);
 cyl('cypress',0,0,0,.22,h*.48,P('cypress'),8,.12);
 for(let k=0;k<3;k++){
  const a=k/3*TAU+.4,bx=Math.cos(a)*.82,bz=Math.sin(a)*.82;
  beam('cypress',[0,h*.38,0],[bx,h*.68,bz],.09,P('cypress'),true,6);
  ellip('turf',bx*1.12,h*.78+k*.14,bz*1.12,1.35,.95,1.3,P('leaf'),0,8);
  sph('terracotta',bx*1.35,h*.66+k*.12,bz*1.35,.09,P('apricot'),1,6);
 }
});

dvbDef('dvb-red-cypress','Crookwash giant flume red-cypress',7612,{w:5.8,d:5.8,h:13.8,climate:'montane',riparian:'both',
 harvest:{edible:false,wood:'cypress',part:'straight 30 m flume & dedabodzi logs',season:'all year'},
 note:'Tall straight-boled mountain red-cypress shot down gravity timber V-flumes to Flumi-Bridzi'},()=>{
 const h=rr(11.2,12.8);
 cyl('cypress',0,0,0,.38,h*.68,P('cypress'),9,.18);
 for(let k=0;k<5;k++){
  const y=h*(.28+k*.13),r=2.15-k*.32;
  cone('turf',0,y,0,r,1.95-k*.14,P('cypressFoliage'),9);
 }
});

dvbDef('dvb-gorge-barley','Terraced six-row gorge barley plot',7613,{w:3.6,d:2.8,h:1.25,riparian:'no',
 harvest:{edible:true,part:'grain, straw',season:'late summer'},
 note:'Drystone-retained mountain barley & spelt bed irrigated from snowmelt leats'},()=>{
 box('earth',0,0,0,3.2,.1,2.4,P('earth'));
 for(let i=-3;i<=3;i++)for(let j=-2;j<=2;j++){
  const xx=i*.42+rr(-.04,.04),zz=j*.42+rr(-.04,.04),hh=rr(.62,.92);
  cyl('turf',xx,.106,zz,.044,hh,P('saffron'),5,.02);
 }
});

dvbDef('dvb-dyer-madder','Vardzieti crimson madder & saffron bed',7614,{w:3.2,d:2.8,h:1.1,riparian:'yes',
 harvest:{edible:false,part:'crimson dye-root, saffron crocus',season:'autumn'},
 note:'Terraced dye-garden yielding crimson madder and saffron for gorge kilims and chivalric standards'},()=>{
 box('earth',0,0,0,2.8,.1,2.4,P('earth'));
 for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){
  sph('turf',i*.48,.24,j*.42,.22,P('leaf'),.72,7);
  if((i+j)%2===0)sph('wool',i*.48,.38,j*.42,.065,P('crimson'),1,6);
 }
});
