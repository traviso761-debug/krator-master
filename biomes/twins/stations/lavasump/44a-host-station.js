// ================================================================= HOST — the station: THE RED CISTERN (station 3, Al-Jubb al-Ahmar, Trap L1; PLAN.md sections 4.3, 6)
// The guides' active lava-pool trap on the NW Twin's south apron (PLAN.md section 4.3): a decoy lava tube that looks like a safe Route A shelter
// (a wide basalt arch carved with counterfeit caravan tally-marks, warm +22 C air wafting out into the gale), running 600 m down at 6 degrees
// past a fork where the stiffed guide steps up onto a raised lateral bench "to check the torch-draft ahead", into a blind collapse amphitheatre
// open to the sky: its floor a churning 1,150 C basaltic-andesite lava pond 90 m across, roofed at its margins by a paper-thin silvery
// pahoehoe blister crust dusted with ash so it looks like rock floor, CO2 and SO2 pooling in the low. Merchants' strongboxes on its rim.
// Map 5.1: the site px 992, 1465 at 4,890 m (0.87 atm, ET/HT): the map pins it at the bottom of a dent ~1 km deep in the apron (2 km cells),
// which the page reads as the amphitheatre's great bowl; the shelf the tube runs under is the page's own, graded into it.
//   key, title, hint   the page's names          centre, R, step   the square and the field's lattice (m)
//   insets()           the amphitheatre and the portal's trench at 2 m
//   layers, shareLayers  the ground's KGROUND layers (84): the scree, the lava crust, the snow (fifteen units); the ash reads the scree's map
const STN={key:'lavasump',title:'Krator Twins: the Red Cistern',
 hint:'The Red Cistern (station 3, Trap L1): the stiffed guide\'s lava-pool trap on the NW Twin\'s south apron at 4,890 m. A wide basalt arch with counterfeit tally-marks breathes warm air into the gale; the tube runs 600 m down past a fork and the guide\'s raised bench into a blind amphitheatre open to the sky, its floor a 1,150 C lava pond 90 m across under a paper-thin ash-dusted crust that breaks underfoot, CO2 and SO2 pooling in the low. Abandoned strongboxes on the rim. N for night: the glow',
 centre:[0,0],R:4800,step:10,site:{px:992,py:1465},
 insets:()=>[{x:0,z:0,r:130,st:2,name:'cistern',label:'The Red Cistern (the amphitheatre\'s ground, 2 m)'},
  {x:PORT.x-PORT.d[0]*80,z:PORT.z-PORT.d[1]*80,r:150,st:2,name:'portal',label:'The decoy portal\'s trench (ground, 2 m)'}],
 items:['boulder','stone','strongbox'],minimap:'The Red Cistern (Trap L1)',
 warm:()=>[[PORT.x-50,PORT.z-50,PORT.x+50,PORT.z+50]],
 budgetTypes:{'twins/sump':'pass'},
 layers:[['scree',{w:'vGL.x*(1.0-vGL.y)*(1.0-vGP.z)',amt:.75,gain:1,tint:'vec3(0.62,0.58,0.56)'}],['lavaCrust',{w:'max(vGP.z,vGP.w*0.35)',amt:.85,gain:1,tint:'vec3(0.42,0.44,0.5)'}],
  ['snow',{w:'vGM.x',amt:.95,gain:1,tint:'vec3(1.0)'}]],
 shareLayers:{ash:{from:'scree',w:'vGP.w',col:[.2,.19,.18],amt:.65}},
 spine:()=>[[0,0],[PORT.x,PORT.z],[TD[0]*340,TD[1]*340],[-TD[0]*600,-TD[1]*600],[TD[0]*1400,TD[1]*1400]]};
