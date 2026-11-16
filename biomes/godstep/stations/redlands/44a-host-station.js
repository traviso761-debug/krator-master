// ================================================================= HOST — the station: THE REDLANDS (station 4)
// PLAN.md section 7, station 4: step 4's floor (Vourdostepos) at scale model 5.1 px 975,1085 (~880-1,030 m, 1.41-1.43 atm, 188-267 mm, BSk,
// +22 to +23 C (35-36/+9-10), night low 0, summer highs to 44). The low end of the closed lower valley: relict laterite breakaways over pale
// gullied kaolinite slopes, and below them THE SALT PLAYA (Saltomagos), the dry terminal pan of everything the basin has drained; front 3's
// black trap stair standing ~700 m above to the west (at the kit's scale, as station 1 compresses front 1: on the model the front is a ramp
// ~25-35 km off). The page's frame: x east, z south, metres, origin at px 975,1085 (the model's 900 m); DOWN the valley's ENE axis.
//   STN's hooks (src/45c, 84, 99): fields (the station's own ground classes), kground (three library layers with a map and the crust's
//   polygons: 15 texture units), pack (the attributes the shader and the layers read), env (the hot steppe's temperature), rockFace (the
//   hardpan's grain on every face), exportBox, budgetTypes (the sedesert's floor, read in place)
const STN={key:'redlands',title:'Krator Godstep: the redlands',
 hint:'Godstep valley, station 4: the redlands at the closed valley\'s low end (~900 m, a hot steppe). Below you the salt playa (Saltomagos), the dry terminal pan of everything the basin has drained, white with a polygon-cracked crust and a sheet of storm water in its lowest part, its old shorelines stepping up the slopes round it; red laterite breakaways (relict hardpan, made when the country was wetter) standing over pale gullied kaolin, their mesas cut off on the slopes; the sedesert\'s shrubs on the steppe and salt-tolerant ones round the pan; front 3\'s black trap stair standing ~700 m above to the west. N for night',
 centre:[0,0],R:4800,step:10,site:{px:975,py:1085},
 items:['boulder','stone'],
 counts:B=>B.stones+(B.desertStones||0)>300&&B.talus>150&&(B.shrubs||0)+(B.tufts||0)+(B.hummocks||0)>400&&(B.edge||0)>=20,
 insets:()=>[{x:BRK.view.x,z:BRK.view.z,r:240,st:2.5,name:'breakaway',label:'A breakaway\'s face (ground, 2.5 m)'}],
 sky:{air:{pressure:1.6,humidity:.3,thin:{y0:0,scale:8000}},clouds:{cover:.1,cumulus:.18,cirrus:.25},fogDensity:.00005},
 minimap:'Godstep valley: the redlands (the salt playa)',
 fields:['silt','kaolin','laterite','pavement','pan','edge','shore','steppeF'],
 env:{temp:(x,z)=>22+(880-terrainH(x,z))*.0052,bands:{upland:[2200,3300],cold:[-8,4]}},
 rockFace:'laterite',
 exportBox:null,   /* set by 45b once the pan's edge is known (a 300 m cell of the salt-edge shrubs and the steppe's stones) */
 budgetTypes:{'desert/floor':'pass','godstep/redlands':'pass'},
 /* the layers: the salt (its map, then its polygon cracks: no unit), the steppe's pavement, the pan's pale silt and the kaolin slopes */
 kground:sandSeed=>[KGROUND.layer('godstep','salt',{w:'vGM.y',amt:.97,gain:1.04,tint:'vec3(1.0)'}),
  {kind:'polygon',w:'vGM.y',amt:.9,size:7,width:.045,jitter:.35,vary:.05,warp:.14,edgeTint:'vec3(0.62,0.58,0.52)',rim:.06,rimTint:'vec3(1.06,1.05,1.02)',seed:sandSeed(41),name:'salt polygons'},
  KGROUND.layer('godstep','pavement',{w:'vGX.x',amt:.75,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godstep','playaPale',{w:'vGM.z',amt:.85,gain:1,tint:'vec3(1.0)'})],
 /* vGL.x the faces' dark cover (none here), vGM.x their green (none), vGY.x the snow (none); vGM.w eases the rock off the salt and the silt */
 pack:(G,x,z,k,aGL,aGM,aGX,aGY)=>{aGL[k*3]=0;aGL[k*3+1]=G.laterite;aGL[k*3+2]=G.kaolin;aGM[k*4]=0;aGM[k*4+1]=G.pan;aGM[k*4+2]=Math.max(G.silt,G.kaolin*.6);aGM[k*4+3]=Math.max(G.pan,G.silt);
  aGX[k*4]=G.pavement;aGX[k*4+1]=FIELD.talus(x,z);aGX[k*4+2]=0;aGX[k*4+3]=0;aGY[k*4]=0;aGY[k*4+1]=0;aGY[k*4+2]=0;aGY[k*4+3]=0;},
 spine:()=>[[0,0],[PAN.x,PAN.z],[BRK.view.x,BRK.view.z],xzDA(-3000,0),xzDA(-1200,-2200),xzDA(3200,-1600),xzDA(2600,3200)]};
