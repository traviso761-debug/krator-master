// TARGET: kit — the Talia kit sheet (kits/talia/PLAN.md): the set in rows by tier, front (+z) toward the camera, and the
// mixed street, where Talia's buildings stand between Iziz Vernacular ones at every tier (settlements/iziz/VASSAL-KITS.md,
// "The mixed-street check"). Built on the Vernacular's page (kits/talia/build.py), so every vern_* def is here too.
const TITLE='Talia Kit';
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
const GROUND_C=700;
// the rows: [label, keys]; a row is laid left to right, 10 m apart. An entry may be [key, options]
const TAL_ROWS=[
 ['Poor — whitewash',['tal_cube_house','tal_lane_row','tal_hill_stack']],
 ['Middle — whitewash, Byzantine',['tal_loggia_house','tal_dome_house']],
 ['Middle — the orange quarter, the arcade',['tal_tenement','tal_arcade_block']],
 ['Rich',['tal_palazzo','tal_jharokha_house','tal_peristyle_villa']],
 ['Trade',['tal_customs_house','tal_bourse','tal_bath']],
 ['Trade — the caravan road',['tal_caravanserai','tal_agora_stoa','tal_warehouse']],
 ['Trade — the street',['tal_shop_arcade','tal_inn','tal_press']],
];
// the mixed street: Talia's buildings between Vernacular ones of their tier, at the gaps a city lot would leave (4 m)
const TAL_MIXED=[
 ['Mixed street — poor',['vern_house_poor_a','tal_cube_house','vern_house_poor_b','tal_lane_row','vern_house_poor_c','tal_hill_stack']],
 ['Mixed street — middle',['vern_house_mid_a','tal_loggia_house','vern_house_mid_b','tal_dome_house','vern_house_mid_c','tal_tenement']],
 ['Mixed street — middle, multi',['vern_shops','tal_arcade_block','vern_tavern','tal_tenement']],
 ['Mixed street — trade',['vern_market','tal_shop_arcade','vern_shops','tal_press','vern_tavern','tal_inn','vern_warehouse','tal_warehouse']],
 ['Mixed street — rich',['vern_house_rich_a','tal_palazzo','vern_house_rich_b','tal_jharokha_house','tal_peristyle_villa']],
];
const ROWZ=[];const ROWNAME=[];const SITES=[];const TAL_OPT={};
{let z=0;
 const lay=(name,row,gap)=>{ROWZ.push(z);ROWNAME.push(name);const ws=row.map(k=>VERN.defs[k].w+gap);let x=-ws.reduce((a,b)=>a+b,0)/2;
  row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z,ry:0,o:Object.assign({v:0},TAL_OPT[name+'#'+i]||{}),row:name});x+=ws[i];});
  z+=Math.max(...row.map(k=>VERN.defs[k].d))+26;};
 const norm=rows=>rows.map(([n,row])=>[n,row.map((k,i)=>{if(typeof k==='string')return k;TAL_OPT[n+'#'+i]=k[1];return k[0];})]);
 TAL_ROWS.splice(0,TAL_ROWS.length,...norm(TAL_ROWS));
 for(const [n,row] of TAL_ROWS)lay(n,row,10);
 for(const [n,row] of TAL_MIXED)lay(n,row,4);}
