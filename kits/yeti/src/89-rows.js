// ================================================================= THE SHOWCASE: rows of the kit, by family (front +z toward the camera)
// A row entry is a def key, or {key, o} (place() options: a variant v, the season where a def has one: 0 winter, 1 autumn,
// 2 summer). The rows grow phase by phase (PLAN.md section 9).
const TITLE=KIT.title;
const FAMILIES=[
 {name:'The winter street (Y3): every tier on the covered way',keys:[{key:'yt_winter_street',o:{v:0}}]},
 {name:'Dwellings - poor: the pycrete dome in winter, autumn and summer',keys:[{key:'yt_dome',o:{v:0}},{key:'yt_dome',o:{v:1}},{key:'yt_dome',o:{v:2}}]},
 {name:'Dwellings - poor: the travel dome, the forest-steppe house (Y3)',keys:[{key:'yt_travel_dome',o:{v:1}},{key:'yt_balagan',o:{v:0}},{key:'yt_balagan',o:{v:2}}]},
 {name:'Dwellings - common: the stone house, the family cluster, the composite house (Y3)',keys:[{key:'yt_stone_dome',o:{v:0}},{key:'yt_family_cluster',o:{v:2}},{key:'yt_composite_house',o:{v:0}}]},
 {name:'Dwellings - rich: the clan compound (Y3)',keys:[{key:'yt_clan_compound',o:{v:0}},{key:'yt_clan_compound',o:{v:2}}]},
 {name:'The state, the faith, the dead (Y4)',keys:['yt_quunsul_hall','yt_chief_hall',{key:'yt_song_house',o:{v:0}},'yt_shrine','yt_clan_tomb']},
 {name:'Heat and bath, the works (Y4)',keys:['yt_bathhouse','yt_smithy','yt_kitchen_house','yt_tannery','yt_weaving_house','yt_carvers_house','yt_tea_house','yt_goldroot_house']},
 {name:'Stores, the land, the stock (Y4)',keys:['yt_ice_cellar','yt_frostroot_house','yt_raised_cache','yt_ice_quarry','yt_pycrete_works','yt_muskox_byre','yt_caribou_corral']},
 {name:'War (Y4): the winter fort in autumn and in spring, the tower, the cairn',keys:[{key:'yt_winter_fort',o:{v:0}},{key:'yt_winter_fort',o:{v:1}},'yt_watch_tower','yt_signal_cairn']},
 {name:'Tunnels (Y2): the three sections, and a covered-way network',keys:[{key:'yt_tunnel_sections',o:{v:0}},{key:'yt_tunnel_sections',o:{v:2}},{key:'yt_tunnel_net',o:{v:0}}]},
 {name:'Shells (Y2): the ribbed hall dome, pycrete fresh and in spring',keys:['yt_sample_ribbed','yt_sample_slump']}
];
