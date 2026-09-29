// TARGET: vernacular — the Iziz Vernacular set laid out in rows by family, front (+z) toward the camera.
const TITLE='Iziz Vernacular Set';
const GROUND_C=250;          // z centre of the ground plane
const ROWDEF=[
 ['vern_house_poor_a','vern_house_poor_b','vern_house_poor_c'],
 ['vern_house_mid_a','vern_house_mid_b','vern_house_mid_c'],
 ['vern_house_rich_a','vern_house_rich_b'],
 ['vern_shops','vern_tavern'],
 ['vern_workshop_a','vern_workshop_b','vern_smithy'],
 ['vern_market','vern_warehouse'],
 ['vern_silos','vern_tank','vern_generator'],
 ['vern_school','vern_hospital'],
 ['vern_alchemist'],
 ['vern_barracks'],
 ['vern_farmers_guild','vern_beast_hunters_guild'],
 ['vern_caravanserai','vern_forgemasters_hall'],
 ['port_voth_embassy','port_order_chapterhouse'],
];
const ROWZ=[0,42,96,160,214,268,330,396,466,536,610,680,760,880,1010];
const SITES=[];
ROWDEF.forEach((row,ri)=>{const ws=row.map(k=>VERN.defs[k].w+10);const total=ws.reduce((a,b)=>a+b,0);let x=-total/2;
 row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:ROWZ[ri],ry:0,o:{v:0}});x+=ws[i];});});
// the two Ancients-reclaimed guilds at the scale the city places them (.5)
SITES.push({key:'anc_salvagers_guild',x:0,z:ROWZ[13],ry:0,o:{v:0,scale:.5},label:"Salvagers' Guild (Ancient laboratory) @ .5"});
SITES.push({key:'anc_mercenary_guild',x:0,z:ROWZ[14],ry:0,o:{v:0,scale:.5},label:'Mercenary Guild (Ancient police station) @ .5'});
