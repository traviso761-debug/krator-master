// TARGET: kit — the Pylon kit sheet (kits/pylon/PLAN.md): the set in rows by tier, front (+z) toward the camera, and the
// mixed street, where Pylon's buildings stand between Iziz Vernacular ones at every tier (settlements/iziz/VASSAL-KITS.md,
// "The mixed-street check"). Built on the Vernacular's page (kits/pylon/build.py), so every vern_* def is here too.
const TITLE='Pylon Kit';
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
const GROUND_C=700;
// the rows: [label, keys]; a row is laid left to right, 10 m apart
const PYL_ROWS=[
 ['Poor — salvage',['pyl_tank_house','pyl_ring_house','pyl_pod_stack','pyl_hex_cells']],
 ['Middle — folk',['pyl_folk_house','pyl_folk_villa']],
 ['Middle — neo-Ancient',['pyl_vault_house','pyl_terrace','pyl_block']],
 ['Rich — neo-Ancient',['pyl_neo_villa','pyl_hex_villa']],
 ['Salvage — yards',['pyl_scrap_yard','pyl_breakers_floor']],
 ['Industry',['pyl_smelter','pyl_sorting_shed','pyl_workshop','pyl_crawler_depot']],
 ['Industry — tanks, crane, conveyor',['pyl_tank_farm','pyl_cable_crane','pyl_conveyor']],
 ['Trade',['pyl_scrap_exchange','pyl_bazaar_lane']],
 ['Civic — guild, assay, watch',['pyl_salvagers_guild','pyl_assay_office','pyl_watch']],
 ['Civic — shrine, school, clinic',['pyl_cult_shrine','pyl_school','pyl_clinic']],
 ["Governor's palace — Pylon's, and the Vernacular's beside it",['pyl_governor_palace','vern_governor_palace']],
 ['Ancients — intact',[['anc_pyl_fort',{mode:'intact'}],['anc_pyl_slab',{mode:'intact'}],['anc_pyl_pods',{mode:'intact'}],['anc_pyl_vaults',{mode:'intact'}],['anc_pyl_gems',{mode:'intact'}],['anc_pyl_hoop',{mode:'intact'}]]],
 ['Ancients — ruined',[['anc_pyl_fort',{mode:'ruin'}],['anc_pyl_slab',{mode:'ruin'}],['anc_pyl_pods',{mode:'ruin'}],['anc_pyl_vaults',{mode:'ruin'}],['anc_pyl_gems',{mode:'ruin'}],['anc_pyl_hoop',{mode:'ruin'}]]],
 ['Ancients — repaired',[['anc_pyl_fort',{mode:'repaired'}],['anc_pyl_slab',{mode:'repaired'}],['anc_pyl_pods',{mode:'repaired'}],['anc_pyl_vaults',{mode:'repaired'}],['anc_pyl_gems',{mode:'repaired'}],['anc_pyl_hoop',{mode:'repaired'}]]],
 ['Temple of the Ancients — intact, repaired',[['pyl_temple',{mode:'intact'}],['pyl_temple',{mode:'repaired'}]]],
];
// the mixed street: Pylon's buildings between Vernacular ones of their tier, at the gaps a city lot would leave (4 m)
const PYL_MIXED=[
 ['Mixed street — poor',['vern_house_poor_a','pyl_tank_house','vern_house_poor_b','pyl_ring_house','vern_house_poor_c','pyl_pod_stack']],
 ['Mixed street — middle',['vern_house_mid_a','pyl_folk_house','vern_house_mid_b','pyl_vault_house','vern_house_mid_c','pyl_folk_villa']],
 ['Mixed street — middle, multi',['vern_shops','pyl_block','vern_tavern','pyl_terrace']],
 ['Mixed street — rich',['vern_house_rich_a','pyl_neo_villa','vern_house_rich_b','pyl_hex_villa']],
 ['Mixed street — industry',['vern_smithy','pyl_workshop','vern_salvage_yard','pyl_smelter','vern_warehouse']],
 ['Mixed street — trade',['vern_market','pyl_bazaar_lane','vern_shops','pyl_scrap_exchange']],
 ['Mixed street — civic',['vern_watch_house','pyl_assay_office','vern_school','pyl_clinic','vern_hospital']],
];
const ROWZ=[];const ROWNAME=[];const SITES=[];const PYL_OPT={};
{let z=0;
 const lay=(name,row,gap)=>{ROWZ.push(z);ROWNAME.push(name);const ws=row.map(k=>VERN.defs[k].w+gap);let x=-ws.reduce((a,b)=>a+b,0)/2;
  row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z,ry:0,o:Object.assign({v:0},PYL_OPT[name+'#'+i]||{}),row:name});x+=ws[i];});
  z+=Math.max(...row.map(k=>VERN.defs[k].d))+26;};
 // a row entry is a key or [key, options] (the Ancients' state: o.mode); the options are kept by row and slot
 const norm=rows=>rows.map(([n,row])=>[n,row.map((k,i)=>{if(typeof k==='string')return k;PYL_OPT[n+'#'+i]=k[1];return k[0];})]);
 PYL_ROWS.splice(0,PYL_ROWS.length,...norm(PYL_ROWS));
 for(const [n,row] of PYL_ROWS)lay(n,row,10);
 for(const [n,row] of PYL_MIXED)lay(n,row,4);}
// the Monolith at full scale (1,100 m), west of the sheet, at its ruin state (o.d = 1), its arch toward the rows
const PYL_MONO={x:-1050,z:700};SITES.push({key:'anc_monolith',x:PYL_MONO.x,z:PYL_MONO.z,ry:Math.PI/2,o:{v:0,d:1},row:'The Monolith'});
