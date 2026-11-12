// ================================================================= HOST — the station: THE HEAD, THE STAIR'S HEARTH (station 3)
// PLAN.md section 7, station 3 (and biomes/hearths/PLAN.md section 11, item 5: one station, not two): vent 77 on scale model 5.1, px 892.8,1145.2,
// a pit crater ~6.4 km across sunk 300-350 m into the head step's plain: its floor at ~2,700 m (Dsc, 110 mm, +12 C (25/-1), night low -12,
// 1.14 atm), its inner wall rising to a rim at 2,810-2,850 m (highest to the WNW), the plain at 3,000-3,050 round it. The page's frame (x east,
// z south, metres) has its origin at the vent's pixel; DOWN is the valley's axis (ENE, -0.28 rad), as station 1's. The map's 9.6 km square holds
// the pit with the plain at its corners. Set on a winter night, the one season the hearth engine earns (the Hearths' plan): the first view is the
// night's, the noon preset shows the field shut and silver.
const STN={key:'hearths',title:'Krator Godstep: the stair\'s hearth',
 hint:'Godstep valley, station 3: the head of the god\'s stair. Vent 77\'s pit crater (Viropitos), 300 m deep in the head step\'s plain: its floor at 2,700 m under a wall of stacked flows with red oxidised scoria at the top; the warm spring and its moss lawn (the nemetos), one disc of broad-fanned hearth trees (Harđotreoi) round it, black fans open flat to the night sky and folded into silver spindles by day, the rings of dead stalks where the heat was; the two tube mouths in the wall (tube_god_07 leaving ENE down the valley, the West Godstep Rim Cross-Conduit from the Godthrone in the SW); the older crater beside it with its lake and the Talovolci\'s walled fields; the procession\'s way down. A winter night. N for night',
 centre:[0,0],R:4800,step:10,site:{px:892.8,py:1145.2},
 items:['boulder','stone','cairn','fieldwall'],
 counts:B=>B.talus>400&&B.stones>400&&B.cairns>=6&&B.walls>=40&&!!(window._field&&window._field.counts.hearth>=20),
 fields:['scoria','lawn','farm','warm','heat','stream','lake'],
 env:{temp:(x,z)=>typeof THERM!=='undefined'?THERM.heatAt(x,z)+(2700-terrainH(x,z))*.0052:12+(2700-terrainH(x,z))*.0052,bands:{upland:[2200,3300],cold:[-8,4]}},
 /* the ground's three library layers (15 texture units): the snow, the pit's red scoria, the spring's moss lawn (84-host-ground.js, STN.kground) */
 kground:()=>[KGROUND.layer('godstep','snow',{w:'vGY.x',amt:.95,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godstep','scoria',{w:'vGX.x',amt:.6,gain:1,tint:'vec3(1.0,0.86,0.8)'}),
  KGROUND.layer('godstep','mossLawn',{w:'vGM.x',amt:.9,gain:1.05,tint:'vec3(1.0)'})],
 /* the attributes: vGL.x (a dark cover on the faces) none here; vGM.x the lawn (green on a face too), vGM.y the lichen, vGM.z the farms, vGM.w the
    lawn again (soft: the rock eased off it); vGX the scoria, talus, 0, the path; vGY the snow, the skin, the warm ground */
 pack:(G,x,z,k,aGL,aGM,aGX,aGY)=>{aGL[k*3]=0;aGL[k*3+1]=G.soil;aGL[k*3+2]=G.farm;aGM[k*4]=G.lawn;aGM[k*4+1]=G.lichen;aGM[k*4+2]=G.farm;aGM[k*4+3]=G.lawn;
  aGX[k*4]=G.scoria;aGX[k*4+1]=FIELD.talus(x,z);aGX[k*4+2]=0;aGX[k*4+3]=G.path;aGY[k*4]=G.snow;aGY[k*4+1]=G.skin;aGY[k*4+2]=G.warm;aGY[k*4+3]=0;},
 /* the close views' ground at 2.5 m: the two tube mouths (the cavern draws the ground inside their openings: GROUND_HOLE), the spring */
 insets:()=>MOUTHS.map(M=>({x:M.wx,z:M.wz,r:110,st:2.5,name:'mouth-'+M.key,label:'The pit wall at '+M.name+' (ground, 2.5 m)'})),
 exportBox:[-700,350,-400,650],
 budgetTypes:{'godstep/walls':'pass','hearths/field':'pass'},
 sky:{air:{pressure:1.6,humidity:.18,thin:{y0:0,scale:8000}},clouds:{cover:.08,cumulus:.1,cirrus:.2},fogDensity:.00003},
 minimap:'Godstep valley: the stair\'s hearth (vent 77)',
 spine:()=>[[0,0],[VENT.x,VENT.z],[MOUTHS[0].wx,MOUTHS[0].wz],[MOUTHS[1].wx,MOUTHS[1].wz],[OLD.x,OLD.z],[-2600,-900],[0,3000]]};
