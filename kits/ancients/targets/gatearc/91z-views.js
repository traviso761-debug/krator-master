// Presets, DERIVED from what the builders left in GA_SITE and GS_SITE (8av1, 8av3): the Hall's slabs and columns, the
// stacks, the bridges, the saucers. The Hall is 424 m across and 400 m tall, its stacks reach 700 m out, so a whole view
// stands about 1 500 m off. x east, z south; the stacks stand north of the Hall (-z).
BUDGET.type.gatearc='mega';
const GADEF={x:0,z:0,y:0,top:412,slabs:[{y0:96,y1:168,ro:212},{y0:232,y1:300,ro:204}],cols:[]};
const GAA=Object.assign({},GADEF,{x:-1050},GA_SITE[0]||{}),GAB=Object.assign({},GADEF,{x:1050},GA_SITE[1]||{});
const GSA=GS_SITE[0]||{stacks:[],bridges:[],saucers:[]},GSB=GS_SITE[1]||{stacks:[],bridges:[],saucers:[]};
const GAW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const gaStack=(SS,k)=>SS.stacks.find(s=>s.key===k)||{x:-250,z:-420,top:320,R:110};
const gaHero=S=>GAW(S,900,420,1050).concat(GAW(S,-80,170,-120));
const VIEWS={
 'The Hall of Heroes':        gaHero(GAA),
 // Soleri's elevation: square on from the south, the columns, the two topographies and the caps
 'The south elevation':       GAW(GAA,0,200,1250).concat(GAW(GAA,0,200,0)),
 // the plan from high over: the hexagon, the skylight well, the membrane, the pond and the stacks
 'From above':                GAW(GAA,40,1700,260).concat(GAW(GAA,-60,0,-80)),
 // the stacks from the pond, looking north: the bridges at the slabs' levels, the saucers, the fall
 'The stacks':                GAW(GAA,560,230,120).concat(GAW(GAA,-220,170,-400)),
 // in the skylight well, looking up through the topographies to the membrane
 'The skylight well':         GAW(GAA,8,108,30).concat(GAW(GAA,0,330,0)),
 // the skin close: the cantilevered cells of the lower topography (reference 5)
 'The cellular skin':         (function(S){const s=S.slabs[0];return GAW(S,0,s.y0+30,s.ro*.866+70).concat(GAW(S,-40,s.y0+40,s.ro*.866));})(GAA),
 // the Garden Stack's terraces and the bridge to the lower slab
 'The Garden Stack':          (function(S,SS){const g=gaStack(SS,'S1');return GAW(S,g.x+230,190,g.z+210).concat(GAW(S,g.x,170,g.z));})(GAA,GSA),
 // the Works and its flues, the Mine and its saucers
 'The Works Stack':           (function(S,SS){const g=gaStack(SS,'S2');return GAW(S,g.x+260,230,g.z+160).concat(GAW(S,g.x,150,g.z));})(GAA,GSA),
 'The Mine Stack':            (function(S,SS){const g=gaStack(SS,'S3');return GAW(S,g.x+250,260,g.z+220).concat(GAW(S,g.x,200,g.z));})(GAA,GSA),
 'The Hall at night':         gaHero(GAA).concat([1]),
 // THE RUIN: the Hall of Heroes as the Kimr keep it
 'The ruin':                  gaHero(GAB),
 // the fallen cap in the pond, west, and the broken upper slab over face 2
 'The fallen cap':            (function(S){return GAW(S,-470,140,330).concat(GAW(S,-200,90,40));})(GAB),
 // the funeral road: causeway 3 (south-west) with its skull poles, toward the plinth
 'The funeral road':          (function(S){const a=2*Math.PI/3;return GAW(S,Math.cos(a)*390,9,Math.sin(a)*390+18).concat(GAW(S,Math.cos(a)*210,14,Math.sin(a)*210));})(GAB),
 // the tombs: the lower skin's broken cells walled up with niches, face 1 (south)
 'The tombs':                 (function(S){const s=S.slabs[0],a=Math.PI/2;return GAW(S,Math.cos(a)*(s.ro*.866+38)+20,s.y0+10,Math.sin(a)*(s.ro*.866+38)).concat(GAW(S,0,s.y0+12,s.ro*.866));})(GAB),
 // the biers on the lower roof, under the broken upper slab
 'The biers':                 (function(S){const s=S.slabs[0];return GAW(S,40,s.y1+30,140).concat(GAW(S,0,s.y1,80));})(GAB),
 // the stacks in the ruin: the broken span, the rope bridge
 'The ruined stacks':         GAW(GAB,180,200,320).concat(GAW(GAB,-380,190,-330)),
};
