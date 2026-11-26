// ================================================================= HOST — station 1, THE RIFT SAVANNAH (PLAN-STATIONS.md)
// The sky at the station's pixel on the scale model; the views over the apron, the plain, the tors, the wash and the pan;
// no ballmelons or hanging pods on the savannah (the jungle's), so the probe's fruit check expects none drawn here.
const STATION_PAGE={name:'savannah',
 /* the far country's palette (89f): the default 'sav' was a pale gold the ground never is, so the map's square showed its edge on every high view (the
    quality pass, 2026-11-09); now the olive and straw of the page's own grass, sampled off its views */
 farPal:{sav:[150,142,78],sav2:[128,124,64],aw:[112,116,62]},title:'Krator biome — the Rift: the savannah (station 1)',
 hint:'Station 1: the abyssal savannah on the apron below the central island (scale model px 369,1166; -1,523 m, 1.94 atm)',
 site:{px:369,py:1166},fruitMin:{balls:0,pods:0,halves:0},
 // the apron thinned toward the island's lee (to 30% at its top) and the monkey-puzzles thinned everywhere: an open savannah,
 // not the old page's dry ridge (RIFT.thin: a pass's acceptance times this, by place and species)
 thin:(x,z,sp)=>mix(1,.3,smooth(-300,-2600,x))*(sp===9?.5:1),
 // the abyssal savannah's thatch grass, ember lilies and burn mosaic (87-host-cousins.js), after the Rift's own passes
 build:()=>{const px=burnGround(),st=plantCousins();if(st)st.burntPx=px;return st;},
 // the burn mosaic for the Rift's own floor too (its savannah grass: none on a fresh burn, green on a young one), and the floor's
 // bands over the whole page (the LOD origins are a lattice here, not the old page's spine)
 burnAt:(x,z)=>typeof ABSAV!=='undefined'&&ABSAV.burn?ABSAV.burn(x,z):9,wholePage:true,
 views:{
 'The savannah':[600,14,600,-2000,240,-200],
 'Over the plain':[-2600,560,1800,1200,0,-800],
 'Up the apron':[200,16,200,-3000,480,0],
 'The wash':[1100,8,-200,2200,-20,-1100],
 'A kopje':[300,24,-500,1000,10,-1000],
 'The salt pan':[1500,26,-1400,2400,-128,-2300],
 'Under the baobabs':[-400,10,900,-900,20,400],
 'To the island':[1800,40,900,-26000,2800,-6000],   /* the central island: model px 356,1163, 26 km west, 6 km north */
 'From afar':[3900,520,3900,0,0,0],
 'Krator rising':[-600,30,1700,1890,1300,590]}};
