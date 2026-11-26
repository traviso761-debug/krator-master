// ================================================================= HOST — the station: THE NORTH WALL (station 5)
// PLAN.md section 7, station 5: Rrivar Cistal's head at ~5.1 px 939,1069 (2,268 m, 1.21 atm, 957 mm, Csa, +12 C (23/+1); Cfa ~990 mm at px
// 930,1070). The valley's one wet side (the owner, 2026-11-03: "the wet place, with the forest, the falls and the red soil"). The page's frame
// (x east, z south, metres) has its origin at the site; the wall strikes along the valley's axis (ENE, ALONG) and faces DOWN to it (SSE,
// the valley's floor): its benches climb north to the plateau the north arm rises from. A 9.6 km square.
//   the hooks src/ reads (45c, 84, 99): fields, kground, pack, env, exportBox, budget, items, counts, insets, spine, sky
const STN={key:'wall',title:'Krator Godstep: the north wall',
 hint:'Godstep valley, station 5: the north wall (Toutouallos), the valley\'s one wet side, in the wet season. A stair of old ponded flows climbs north under a forest of the southern highlands\' spiral trees on living red soil; the springs of Rrivar Cistal\'s head come out at the flows\' palagonite partings, and Guli Blaca falls off bench after bench through the banded flows. Wild red stalk along the streams, the Talovolci\'s terraces on the red soil at the foot, the steps\' dry country beyond to the south. N for night',
 centre:[0,0],R:4800,step:10,site:{px:939,py:1069},
 fields:['redsoil','litter','grass','terrace','spring','forest'],
 items:['boulder','stone','redstalk'],
 counts:B=>B.talus>300&&B.stones>800&&B.stalks>150&&(B.trees||0)>800&&B.walls>200,
 insets:()=>[{x:WALLV.falls.x,z:WALLV.falls.z,r:240,st:2.5,name:'falls',label:'Guli Blaca\'s falls (ground, 2.5 m)'},
  {x:WALLV.spring.x,z:WALLV.spring.z,r:200,st:2.5,name:'spring',label:'The springs of Rrivar Cistal\'s head (ground, 2.5 m)'}],
 sky:{air:{pressure:1.6,humidity:.6,thin:{y0:0,scale:8000}},clouds:{cover:.48,cumulus:.5,cirrus:.25},fogDensity:.00006},
 env:{temp:(x,z)=>12+(2268-terrainH(x,z))*.0055,bands:{upland:[1800,2800],cold:[-8,4]}},
 /* the ground's three library layers (15 texture units): the living red soil, the forest's litter, the wet season's grass */
 kground:()=>[KGROUND.layer('godstep','redsoil',{w:'vGL.y',amt:.9,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godstep','litter',{w:'vGL.z',amt:.85,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godstep','grass',{w:'vGX.x',amt:.8,gain:1,tint:'vec3(1.0)'})],
 /* the attributes: vGL.x (a dark cover on the faces) none; vGM.x the spray's moss on the wet faces; vGY.x (snow) none; vGM.w the litter and
    grass easing the rock off the gentler slopes */
 pack:(G,x,z,k,aGL,aGM,aGX,aGY)=>{aGL[k*3]=0;aGL[k*3+1]=G.redsoil;aGL[k*3+2]=G.litter;aGM[k*4]=G.moss;aGM[k*4+1]=G.lichen;aGM[k*4+2]=0;aGM[k*4+3]=Math.max(G.litter,G.grass);
  aGX[k*4]=G.grass;aGX[k*4+1]=FIELD.talus(x,z);aGX[k*4+2]=G.terrace;aGX[k*4+3]=G.path;aGY[k*4]=0;aGY[k*4+1]=G.skin;aGY[k*4+2]=0;aGY[k*4+3]=0;},
 exportBox:[-1100,1000,-800,1300],
 budget:{tris:16000000,calls:260},budgetTypes:{'godstep/wall':'pass','godstep/forest':'pass'},
 minimap:'Godstep valley: the north wall',
 spine:()=>[[0,0],[WALLV.falls.x,WALLV.falls.z],[WALLV.spring.x,WALLV.spring.z],xzDA(1600,0),xzDA(-2400,0),xzDA(800,-1800),xzDA(-1200,2200)]};
