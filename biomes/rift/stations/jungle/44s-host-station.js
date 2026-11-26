// ================================================================= HOST — station 2, THE RIFT JUNGLE (PLAN-STATIONS.md)
// The sky at the station's pixel on the scale model (px 418,1251: the Lizardmen river 3's mouth on the terminal sea); the views,
// worked out from the map once it has loaded (a getter: 45m, 89w); the old page's Girder tower stands on the plain as the test of
// the growth on structures; the jungle's fruit drawn (ballmelons, hanging pods); the far country's palette: the jungle floor's greens.
const STATION_PAGE={name:'jungle',title:'Krator biome — the Rift: the jungle (station 2)',
 hint:'Station 2: the abyssal jungle at the Lizardmen river 3\'s mouth on the terminal sea (scale model px 418,1251; the sea at -2,600 m, 1.9 atm)',
 site:{px:418,py:1251},fruitMin:{balls:200,pods:50,halves:2},wholePage:true,
 // the held budget (the owner, 2026-10-27: trim it to 40 M): full heroes only within .4 of the kit's hero radii of the lattice's origins,
 // the mid-detail builders past that (the far impostors past the mid radius, as before); the floor's mid and far bands at .65
 heroK:.4,floorK:.65,held:40000000,passMax:30000000,   /* measured: .55 alone held 49.8 M (trees 35.5, floor 12.9) */
 farPal:{sav:[38,70,38],sav2:[20,42,24],aw:[48,80,44],csa:[70,96,54],cloud:[50,84,52]}   /* the canopy from above, darker and mottled (the quality pass, 2026-11-09: sav2 the shade between crowns; it read as a lit lawn) */,
 // the tower: on the plain, 2.6 km from the shore, west of the river
 get tower(){const d=2600,t=RIVER.t(d)-700,i=d+shoreD(t);return[(i+t)*S2,(i-t)*S2];},
 get views(){
  const at=(d,t,up)=>{const i=d+shoreD(t),x=(i+t)*S2,z=(i-t)*S2;return[x,terrainH(x,z)+up,z];},
  rv=(d,up,side)=>at(d,RIVER.t(d)+(side||0),up),
  /* out from the pool toward the sea (-S2,-S2: the pools sit at the toes now, a few metres from the lips, so lip-to-pool no longer gives a direction) */
  fv=(k,far)=>{const F=FALLS[k],P=POOLS[k],L=F.lip,mx=(L[0][0]+L[1][0])/2,mz=(L[0][1]+L[1][1])/2,ly=L[0][2],dx=-S2,dz=-S2,dl=1,o=(F.drop||ly-P.y)*far;
   return[P.x+dx/dl*o*.7-dz/dl*o*.25,P.y+F.drop*.35,P.z+dz/dl*o*.7+dx/dl*o*.25,mx,ly-F.drop*.45,mz];},V=(c,t)=>[c[0],c[1],c[2],t[0],t[1],t[2]],T=this.tower;
  return{
  'The algal shore':V(at(70,900,3),at(-150,-300,0)),
  'The river mouth':[...at(-280,RIVER.t(0)-160,0).map((v,i)=>i===1?24:v),...rv(60,4)],   /* from out on the sea, looking back at the mouth */
  /* the falls: from out over each fall's pool, toward the sea's side, looking up at the middle of its curtain */
  'The upper fall':fv(0,1.7),
  'The lower fall':fv(1,1.8),
  'Over the scarp':V(rv(1050,190,140),at(-1200,RIVER.t(0),0)),
  'Under the frill trees':V(at(2400,-900,4),at(2600,-600,40)),
  'The river on the plain':V(rv(2000,7,80),rv(2700,4)),
  'The tower':[T[0]+260,terrainH(T[0],T[1])+40,T[1]-220,T[0],terrainH(T[0],T[1])+70,T[1]],
  'From the sea':V(at(-1500,RIVER.t(0),60),at(900,RIVER.t(900),200)),
  'From afar':[4600,1100,4600,-600,200,-600],
  'Krator rising':V(at(300,-400,30),[1890+0,1300,590])};}};
