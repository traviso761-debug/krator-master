// ================================================================= HOST — the station: THE AIRLESS RIM (station 5)
// PLAN.md sections 4 ("On the airless rim") and 7 (station 5), 7a: map 5.1 px 532,1285 (old canvas 260,955), 10,859 m, 0.41 atm,
// O: the crest cell of the south-western Outer Wall nearest the Godthrone's airless body (no higher ground within 8 km). No wall
// kit's station stands within 200 km of a 10-12 km crest, so the plan's "over a station of a wall kit" could not be met (7a's
// note). The crest runs north-north-west across the map; the outer side falls west at ~0.05 (the raster's), the crater side east
// in slump scarps. Its own frame and ground model; no vent, no portal.
const STN={key:'rim',title:'Krator Godthrone: the airless rim',
 hint:'The airless rim (station 5): the crater\'s crest at 10.9 km, four tenths of an atmosphere, no rain; the megabreccia the impact made, blocks of every rock in a grey matrix, the overturned flap of the crater\'s beds folded back on itself at the top; slump scarps falling east into the crater, a cirque with relic ice under rubble; desert pavement and ventifacts on the outer slope, sand-wedge polygons, a blockfield, hoarfrost in the shade. N for night',
 centre:[0,0],R:4800,step:8,vent:false,portal:false,summit:false,site:{px:260,py:955},
 items:['boulder','stone','ventifact'],
 counts:B=>B.talus>800&&B.stones>1000&&(B.ventifacts||0)>5000,
 rockFace:'rockMega',minimap:'The airless rim',
 layers:sd=>[KGROUND.layer('godthrone','pavement',{w:'vGY.z',amt:.9,gain:1,tint:'vec3(1.0)'}),
  ({name:'polygons',kind:'polygon',w:'vGY.z*smoothstep(0.35,0.7,vGY.z)',amt:.85,size:16,width:.05,jitter:.35,warp:.14,edgeTint:'vec3(0.62,0.58,0.53)',rim:.6,rimTint:'vec3(0.8,0.78,0.74)',seed:sd(7)}),
  KGROUND.layer('godthrone','iceDebris',{w:'vGX.y',amt:.95,gain:1.1,tint:'vec3(1.0)'}),
  ({name:'breccia',kind:'clast',w:'vGX.w*0.5',amt:.6,size:6,proj:'tri',matrix:.08,palette:KGROUND.BRECCIA,sub:.18,fleck:.04,seed:sd(8)})],
 spine:()=>[[0,0],xzCA(0,-2800),xzCA(0,2800),xzCA(-2200,0),xzCA(1500,0),[CIRQUE.x,CIRQUE.z],xzCA(3600,-1600)]};
