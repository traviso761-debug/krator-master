// ================================================================= HOST — the station: THE RILLE (station 2)
// PLAN.md section 7, station 2: along tube_god_07 ~20-30 km below the vent, on the head step (Virstostepos). The page's frame (x east, z
// south, metres) has its origin at 5.1 px 902,1140, ON the tube's mapped path (893,1145 -> 910,1134: the model's tube line runs through
// it), and the frame's axis DOWN is that path's bearing (ENE, downstream from the vent); ACROSS is to its right. The plain at ~2,990 m
// (the model's cell there: 2,988), 1.10 atm, 110-125 mm, Dsc/Dfc, +9 C (22/-4), night low -15. Early summer: the springs running, the
// ice cave still holding the winter's ice. A station is a 9.6 km square of the frame.
const STN={key:'rille',title:'Krator Godstep: the rille',
 hint:'Godstep valley, station 2: the rille (Tubodubnos). tube_god_07, the master tube from the vent pit, fell in here: a canyon a kilometre wide and ~120 m deep in the head step\'s plain, its walls the ponded flows\' colonnades stepping back at each flow\'s top, a spring breaking out at a palagonite parting and running down to the floor, where the Talovolci farm the red guyed stalk. Past the rille\'s end the tube runs on roofed under the plain: a chain of pits, hornitos, a fresh collapse, and one skylight walked down into the tube (48 m wide, 28 m high) through the gathered caves: fungus beds, guano, gypsum, an ice cave kept from the winter. Early summer. N for night',
 centre:[0,0],R:4800,step:10,site:{px:902,py:1140},
 items:['boulder','stone','cushion','redstalk'],
 counts:B=>B.talus>800&&B.stones>800&&B.cushions>300&&B.stalks>300&&B.cairns>=6,
 fields:['field','seep','stream','hole'],
 insets:()=>[{x:SPRING.x,z:SPRING.z,r:300,st:2.5,name:'spring',label:'The spring\'s wall and the fields (ground, 2.5 m)'},
  {x:WALK.x,z:WALK.z,r:90,st:2,name:'skylight',label:'The walked skylight (ground, 2 m)'}],
 sky:{air:{pressure:1.6,humidity:.25,thin:{y0:0,scale:8000}},clouds:{cover:.25,cumulus:.4,cirrus:.25},fogDensity:.00004},
 minimap:'Godstep valley: the rille (tube_god_07)',
 exportBox:null,   /* set in 45b, once the rille is laid out: a 300 m cell of the floor under the spring (its fields, stalks, talus) */
 budgetTypes:{'godstep/rille':'pass'},
 /* THE GROUND'S LAYERS (84-host-ground.js): three with a map (15 units): the fields' tilled soil, the spring's moss, the plain's lichen crusts */
 kground:()=>[KGROUND.layer('godstep','tilled',{w:'vGL.z',amt:.9,gain:1,tint:'vec3(0.5,0.36,0.26)'}),
  KGROUND.layer('godstep','moss',{w:'vGM.x',amt:.75,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godstep','lichenCrust',{w:'vGM.y',amt:.45,gain:1,tint:'vec3(1.0)'})],
 /* the attributes: vGL.x the seep's dark wet stain down the wall under the spring (the shader's dark face cover), vGL.y soil, vGL.z the
    fields; vGM.x the moss (green on the faces too), vGM.y lichen, vGM.w the fields (a soft cover); vGX palagonite, talus, -, path; vGY skin */
 pack(G,x,z,k,aGL,aGM,aGX,aGY){aGL[k*3]=G.seep;aGL[k*3+1]=G.soil;aGL[k*3+2]=G.field;aGM[k*4]=G.moss;aGM[k*4+1]=G.lichen;aGM[k*4+2]=0;aGM[k*4+3]=G.field;
  aGX[k*4]=G.palag;aGX[k*4+1]=FIELD.talus(x,z);aGX[k*4+2]=0;aGX[k*4+3]=G.path;aGY[k*4]=0;aGY[k*4+1]=G.skin;aGY[k*4+2]=0;aGY[k*4+3]=0;},
 spine:()=>[[0,0],[SPRING.x,SPRING.z],[WALK.x,WALK.z],xzDA(-3000,LINE.a),xzDA(1500,LINE.a),xzDA(3000,LINE.a),xzDA(-1200,LINE.a+1800),xzDA(-1200,LINE.a-1800)]};
