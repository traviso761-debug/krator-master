// ================================================================= HOST — station 3, THE CLOUD FOREST (PLAN-STATIONS.md section 4)
// The sky at the central island's pixel; the views worked out from the map (a getter); the cloud as the height fog's band at the
// cloud's height on the model (1.42-1.95 km: page y 420-950), thick and broken; the sketch's cousins thinned where the island's own
// families stand in their places (87-host-families.js); the held budget as station 2's.
const STATION_PAGE={name:'highland',title:'Krator biome — the Rift: the cloud forest (station 3)',
 hint:'Station 3: the cloud forest on the central island (scale model px 356,1164; the summit 2,057 m, 1.24 atm), its families by pressure band',
 site:{px:356,py:1164},fruitMin:{balls:0,pods:20,halves:0},wholePage:true,
 heroK:.5,floorK:.7,held:40000000,passMax:30000000,
 farPal:{sav:[70,98,56],sav2:[60,88,50],aw:[86,104,60],csa:[104,112,64],cloud:[58,92,58]},
 fog:{falloff:1/900,sun:.35,sky:.4,mist:{density:.0004,y:-150,depth:60,noise:.7},band:{density:.0022,y:[420,950],cover:.55,noise:1}},
 // the sketch's cousins that the island's families replace (cloud frill, cloud bell palm, cloud lobe tree; barrel frill, fan tree,
 // stone pine): none of them here. The old stock (cloud parasol, beard tree, tree-fern, lantern tree) stays under the families
 // and the savannah's and the rims' species the sketch's slope and peak passes put on the crest and the lee (dragon tree, tree aloe,
 // monkey-puzzle, purple fan, Rift cycad, peak pine, blade pear: station 1's, or riftrim's)
 thin:(x,z,sp)=>[23,24,25,30,31,32,9,10,11,12,15,16,36].indexOf(sp)>=0?0:1,
 build:()=>plantFamilies(),
 get views(){
  const at=(x,z,up)=>[x,terrainH(x,z)+up,z],V=(c,t)=>[c[0],c[1],c[2],t[0],t[1],t[2]],cx=crestX(0);
  return{
  'The cloud foot':V(at(-2600,300,6),at(-1800,600,30)),
  'In the cloud':V(at(-900,-400,5),at(-400,-150,40)),
  'Up a ravine':V(at(-1800,ravineZ(1,-1800),6),at(-600,ravineZ(1,-600),40)),
  'The crest':V(at(cx-60,200,3),at(cx+400,700,0)),
  'The summit':V(at(cx,0,40),at(-3000,0,-300)),
  'Over the lee':V(at(cx+500,-500,8),at(3300,-900,-150)),
  'Down the face':V(at(cx-300,-1500,60),at(-3500,-1200,-200)),
  'From the jungle below':V(at(-3400,1800,30),at(cx,0,1000)),
  'From afar':[-9000,900,6000,cx,800,0]};}};
