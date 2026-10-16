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
// the frontier set (74b-vern-frontier.js, built for Verge's upper city): rows 15-17
ROWZ.push(1120,1190,1252);
{const row=['vern_governor_palace','vern_guard_tower','vern_watch_house','vern_toll_house'];const ws=row.map(k=>VERN.defs[k].w+10);let x=-ws.reduce((a,b)=>a+b,0)/2;
 row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:ROWZ[15],ry:0,o:{v:0}});x+=ws[i];});}
// the palisade: three 6 m segments laid end to end either side of the gate (the gate's towers end at x = ±7), then the mustering ground
SITES.push({key:'vern_palisade_gate',x:-32,z:ROWZ[16],ry:0,o:{v:0}});
for(let i=0;i<3;i++)for(const s of[-1,1])SITES.push({key:'vern_palisade',x:-32+s*(10+6*i),z:ROWZ[16],ry:0,o:{v:0,len:6}});
SITES.push({key:'vern_mustering_ground',x:22,z:ROWZ[16],ry:0,o:{v:0}});
// the rest stop: v0 cut into the rock; v1 on the cliff edge, raised 5.4 m here so its retaining wall shows above the sheet's ground
SITES.push({key:'vern_rest_stop',x:-14,z:ROWZ[17],ry:0,o:{v:0},label:'Rest stop (v0: rock-cut)'});
SITES.push({key:'vern_rest_stop',x:14,z:ROWZ[17],ry:0,o:{v:1,y:5.4},label:'Rest stop (v1: cliff platform, raised 5.4 m)'});
