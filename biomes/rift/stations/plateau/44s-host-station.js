// ================================================================= HOST — station 4, CUBE'S PLATEAU (PLAN-STATIONS.md sections 2-4)
// The sky at Cube's pixel; the views worked out from the map (a getter); a light haze (1.64 atm, humid, no cloud band); the ruin as
// massing (85-host-tower.js); the east island's forms (87-host-families.js); the held budget as stations 2 and 3.
const STATION_PAGE={name:'plateau',title:'Krator biome — the Rift: Cube’s plateau (station 4)',
 hint:'Station 4: Cube’s plateau, the east island (scale model px 448,1237; -207 m, 1.64 atm, +22 °C), the ruined Arcube in its forest',
 site:{px:448,py:1237},fruitMin:{balls:0,pods:20,halves:0},wholePage:true,
 heroK:.4,floorK:.7,held:40000000,passMax:30000000,
 farPal:{sav:[70,98,56],sav2:[60,88,50],aw:[86,104,60],csa:[104,112,64],cloud:[58,92,58]},
 fog:{falloff:1/1400,sun:.35,sky:.45,mist:{density:.0003,y:-40,depth:50,noise:.7}},
 // the sketch's species: the east island's forms replace the cloud forest's (cloud frill, bell palm, lobe tree, parasol, beard tree,
 // tree-fern, lantern tree; barrel frill, stone pine), and the savannah's, the crest's and the feral three have no place here. What
 // the Rift's passes still draw is the jungle's upper fringe, climbing the scarp and thinning out over the table (section 3): bell
 // palm, lobe tree, curly shrub and prism bush at .5, the croton at .6, the anemone stalk and carrot frill at .35
 thin:(x,z,sp)=>{const K={1:.5,2:.5,5:.5,6:.5,18:.6,19:.35,21:.35};return K[sp]==null?0:K[sp];},
 build:()=>plantFamilies(),
 get views(){
  const at=(x,z,up)=>[x,terrainH(x,z)+up,z],V=(c,t)=>[c[0],c[1],c[2],t[0],t[1],t[2]],S1=STREAMS_LINE[0],S2L=STREAMS_LINE[1];
  return{
  'Cube from the forest':V(at(-1700,250,4),[0,PLINTH.y+620,0]),
  'Under the keel':V(at(-380,60,3),[150,PLINTH.y+260,40]),
  'The fallen corner':V(at(1050,980,6),[420,PLINTH.y+240,520]),
  'The plinth':V(at(-1250,-900,3),at(-300,-250,30)),
  'The north-east valley':V(at(S1[45][0],S1[45][1],5),at(S1[85][0],S1[85][1],12)),
  'The south-west valley':V(at(S2L[45][0],S2L[45][1],5),at(S2L[85][0],S2L[85][1],12)),
  'Copper pines':V(at(-1600,1450,4),at(-2300,2200,25)),
  'Over the plateau':V(at(-2800,2600,260),[0,PLINTH.y+500,0]),
  'From afar':[-9000,1700,6000,0,PLINTH.y+600,0]};}};
