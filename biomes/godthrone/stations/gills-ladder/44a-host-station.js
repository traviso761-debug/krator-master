// ================================================================= HOST — the station: THE RED LADDER (station 8; biomes/gills/PLAN.md section 11, item 2)
// map 5.1 px 900,1450 to 940,1450 (7.2 to 8.7 km): the page stands at 920,1450 (old canvas 648,1120), 8,538 m, 0.55 atm, HF, on the Godthrone's
// south-east flank, the raster falling south at ~0.07. The ladder's 80 km cannot be one 9.6 km page: the page is its top rungs, where the ice
// pipes end and the frost jets begin across the dry-cold line (8,500 m). Its own frame and ground model; the Red Gill's drawing read in place
// (stations/gills/87-host-gills.js) on this page's swarm.
const STN={key:'gills-ladder',title:'Krator Godthrone: the Red ladder',
 hint:'The Red ladder (station 8), the Red Gills\' top rungs at 8.2-8.9 km on the Godthrone\'s south-east flank, a little over half an atmosphere: the cracks iced over, their lining gone down the throats, the out-breath frozen into fumarolic ice towers on the lips; over the dry-cold line, frost jets from bare ground with rime fans on their lee; palagonite ridges under the line; the sky going violet. The breath still comes on the hour; nothing else moves. N for night',
 centre:[0,0],R:4800,step:8,vent:false,portal:false,summit:false,site:{px:648,py:1120},
 items:['boulder','stone','splitstone'],counts:B=>B.talus>100&&B.stones>1000,
 minimap:'The Red ladder',iceH:7000,treeH:0,pipeStep:26,
 viewHour:()=>GILLS.peakHour(GDAY()),
 layers:sd=>[KGROUND.layer('godthrone','iceGlacier',{w:'vGX.y',amt:.9,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','palagonite',{w:'vGX.x',amt:.85,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','lichenCrust',{w:'vGY.w',amt:.8,gain:1,tint:'vec3(1.0)'})],
 spine:()=>[[0,0],[0,-2400],[0,2400],[-2500,0],[2500,0],[-1500,-3600],[1500,3600]]};
/* the day: as the Red Gill's (#day=, else the first day the out-breath falls at dawn) */
function GDAY(){const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash);if(m)return +decodeURIComponent(m[1])||0;if(GDAY.d!=null)return GDAY.d;
 let b=0,bd=99;for(let d=0;d<400;d++){const e=Math.abs(GILLS.peakHour(d)-6.7);if(e<bd){bd=e;b=d;}}return GDAY.d=b;}
