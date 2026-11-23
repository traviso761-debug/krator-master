// TARGET: kit — the Marr kit sheet (kits/marr/PLAN.md): the set in rows by tier & quarter, front (+z) toward the camera,
// plus the Iziz Vernacular harbour/dock rows (73d-vern-docks.js) and the mixed-street checks where Marr's Spanish Colonial /
// New Orleans / Barcelona / Bruges buildings stand beside Iziz Vernacular buildings at every tier (settlements/iziz/VASSAL-KITS.md).
const TITLE='Marr Kit — Porta Marr';
window.MARR_WALK=true;
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
const GROUND_C=850;
// the rows: [label, keys]; a row is laid left to right, 10 m apart. An entry may be [key, options]
const MAR_ROWS=[
 ['Inhabited Courtyards & Grid-Break Lots — Korta de Plejar, Korta de Gardon, Yarda de Guorka, Grid-break lots, Gardon park, Markita plaza',['mar_patio_pleasure','mar_patio_vegetable','mar_patio_working','mar_grid_break_lots','mar_gardon_park','mar_markita_plaza']],
 ['Poor — De Xedaz (The Shades) canal shanties, corrala tenement, loft, smuggler cellar',['mar_shades_shanty','mar_shades_tenement','mar_canal_loft','mar_smuggler_cellar']],
 ['Poor — Qartar Lo (Lower Quarter) Creole cottage, shotgun houses, fishers\' row',['mar_creole_cottage','mar_shotgun_single','mar_shotgun_double','mar_fishers_row']],
 ['Middle — Sidi Olda patio house, NOLA iron-gallery townhouse, French Quarter corner',['mar_casa_patio','mar_townhouse_iron','mar_corner_french']],
 ['Middle — Barcelona mirador corner, Bruges stepped canal house, artisan workshop court',['mar_corner_mirador','mar_bruges_canal_house','mar_artisan_court']],
 ['Middle — Sailors\' boarding house, Barrio chapel, Posada courtyard inn',['mar_boarding_house','mar_chapel_barrio','mar_posada']],
 ['Rich — Qartar de Gardonz (Garden Quarter) mansions & Baroque palacios',['mar_garden_mansion','mar_palacio_baroque','mar_azulejo_villa']],
 ['Rich — Sea-captain\'s house, Consulado factor\'s house, suburban Hacienda finca',['mar_captains_house','mar_consulado_house','mar_hacienda']],
 ['Trade & Vice — Smuggler\'s warehouse, Cantina, Lantern gambling house, Ship chandlery',['mar_smuggler_warehouse','mar_cantina','mar_lantern_house','mar_chandlery']],
 ['Trade & Maritime Industry — Rum distillery bodega, Mercado de Hierro, Portal arcade, Boatyard slip',['mar_rum_bodega','mar_mercado_hall','mar_portal_arcade','mar_boatyard_slip']],
 ['Iziz Vernacular Harbour Set (73d) — Quays, piers, crane wharf, ferry slip',['vern_quay','vern_pier','vern_crane_wharf','vern_ferry_slip']],
 ['Iziz Vernacular Harbour Set (73d) — Port warehouse, customs, lighthouse, coastguard, ropewalk, tavern',['vern_port_warehouse','vern_customs_house','vern_harbour_light','vern_coastguard_berth','vern_ropewalk','vern_sailors_tavern']],
 ['Canals, Bridges, Walls & Sea-Forts — Quay, Ponte de Sidi, Tapia wall, Porta de Tera gate, Kastil de Mar, Garita',['mar_canal_quay','mar_canal_bridge','mar_tapia_wall','mar_city_gate','mar_castillo_bastion','mar_garita_watch']],
 ['Civic Landmarks — Gilda de Navigarz (Navigators\' Guild), Templa de Mar, Aduana Marítima',['mar_navigators_guild','mar_sea_temple','mar_aduana']],
 ["Governor's Palace — Palasio de Gobernar",['mar_governor_palace']],
];
// the mixed street: Marr's buildings between Iziz Vernacular ones of their tier at city-lot spacing (4 m)
const MAR_MIXED=[
 ['Mixed street — poor',['vern_house_poor_a','mar_creole_cottage','vern_house_poor_b','mar_shotgun_double','vern_house_poor_c','mar_shades_tenement','mar_fishers_row']],
 ['Mixed street — middle',['vern_house_mid_a','mar_townhouse_iron','vern_house_mid_b','mar_corner_mirador','vern_house_mid_c','mar_bruges_canal_house','mar_casa_patio']],
 ['Mixed street — trade',['vern_shops','mar_chandlery','vern_tavern','mar_cantina','mar_lantern_house','vern_market','mar_portal_arcade']],
 ['Mixed street — docks',['vern_quay','mar_smuggler_warehouse','vern_crane_wharf','vern_port_warehouse','mar_boatyard_slip','vern_customs_house','vern_sailors_tavern']],
 ['Mixed street — civic',['vern_school','mar_chapel_barrio','vern_watch_house','mar_aduana','vern_hospital','mar_sea_temple']],
 ['Mixed street — rich',['vern_house_rich_a','mar_garden_mansion','vern_house_rich_b','mar_palacio_baroque','mar_captains_house','mar_azulejo_villa']],
];
const ROWZ=[];const ROWNAME=[];const SITES=[];const MAR_OPT={};
{let z=0;
 const lay=(name,row,gap)=>{ROWZ.push(z);ROWNAME.push(name);const ws=row.map(k=>VERN.defs[k].w+gap);let x=-ws.reduce((a,b)=>a+b,0)/2;
  row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z,ry:0,o:Object.assign({v:0},MAR_OPT[name+'#'+i]||{}),row:name});x+=ws[i];});
  z+=Math.max(...row.map(k=>VERN.defs[k].d))+26;};
 const norm=rows=>rows.map(([n,row])=>[n,row.map((k,i)=>{if(typeof k==='string')return k;MAR_OPT[n+'#'+i]=k[1];return k[0];})]);
 MAR_ROWS.splice(0,MAR_ROWS.length,...norm(MAR_ROWS));
 for(const [n,row] of MAR_ROWS)lay(n,row,10);
 MAR_MIXED.splice(0,MAR_MIXED.length,...norm(MAR_MIXED));
 for(const [n,row] of MAR_MIXED)lay(n,row,4);}
