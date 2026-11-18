// ================================================================= THE SHEET: rows of the kit, by building (front +z toward the camera)
// A row entry is a def key, or {key, o} (place() options: a variant v, the meeting hall's variant, a state). Rows run north
// (-z) from the first. Five seeds a row (v 0 to 4: each house-like key's families in turn, 42-fg-mass.js); the meeting hall in both variants. The state switch (kept, worn) is
// ?state=worn or the panel's State select (99-sheet-fg.js): FG_STATE, read by every builder through fgCx. East and west of
// the rows, 91t-fg-sheet.js lays the sample village, the sloped test pad and the test wall with its ropes.
const TITLE=KIT.title;
let FG_STATE=(/[?&]state=(worn|abandoned)\b/.exec(location.search)||[0,'kept'])[1];   /* kept | worn | abandoned (the Glaziers' third state; the Fellgangs draw it as worn) */
const FG_SEEDS=(k,n)=>[...Array(n==null?5:n).keys()].map(v=>({key:k,o:{v}}));
const FAMILIES=[
 {name:'Fellgang: the hut',keys:FG_SEEDS('fg-hut')},
 {name:'Fellgang: the house',keys:FG_SEEDS('fg-house')},
 {name:'Fellgang: the longhouse',keys:FG_SEEDS('fg-longhouse')},
 {name:'Fellgang: the head\'s house',keys:FG_SEEDS('fg-headhouse')},
 {name:'Fellgang: the meeting hall (the Fowlers\' rope wall, the Ice-cutters\' tally board)',keys:[{key:'fg-meethall',o:{v:0,variant:'fowlers'}},{key:'fg-meethall',o:{v:1,variant:'fowlers'}},{key:'fg-meethall',o:{v:2,variant:'fowlers'}},
  {key:'fg-meethall',o:{v:3,variant:'icecut'}},{key:'fg-meethall',o:{v:4,variant:'icecut'}}]},
 {name:'Fellgang: the cairn house',keys:FG_SEEDS('fg-cairnhall')},
 {name:'Fellgang: the store',keys:FG_SEEDS('fg-store')},
 {name:'Fellgang: the smokehouse',keys:FG_SEEDS('fg-smokehouse')},
 {name:'Fellgang: the barn',keys:FG_SEEDS('fg-barn')},
 {name:'Fellgang: the rope house',keys:FG_SEEDS('fg-ropehouse')},
 {name:'Fellgang: the egg store',keys:FG_SEEDS('fg-eggstore')},
 {name:'Fellgang: the pens',keys:FG_SEEDS('fg-pens')},
 {name:'Fellgang: the ice house',keys:FG_SEEDS('fg-icehouse')},
 {name:'Fellgang: the sledge shed',keys:FG_SEEDS('fg-sledgeshed')},
 {name:'Fellgang town: the double meeting hall (both customs in one)',keys:FG_SEEDS('fg-doublehall',3)},
 {name:'Fellgang town: the halting house and the market hall',keys:[...FG_SEEDS('fg-halting-house',3),...FG_SEEDS('fg-markethall',2)]},
 {name:'Fellgang town: the booths, the Fair stand and the raised granary',keys:[...FG_SEEDS('fg-booth',2),...FG_SEEDS('fg-fair-stand',2),...FG_SEEDS('fg-granary',3)]},
 {name:'Fellgang town: the salvage-smithy and the tannery and felt house',keys:[...FG_SEEDS('fg-smithy',3),...FG_SEEDS('fg-tannery',3)]},
 {name:'Fellgang town: the great ice house, the dugout ice-house and the town rope-walk range',keys:[...FG_SEEDS('fg-great-icehouse',2),...FG_SEEDS('fg-dugout-icehouse',2),...FG_SEEDS('fg-ropewalk',2)]},
 {name:'Fellgang: the wall (stations, nest gear, a burial ledge)',keys:[{key:'fg-wall-station',o:{v:0}},{key:'fg-wall-station',o:{v:1}},{key:'fg-nest-ledge',o:{v:0}},{key:'fg-burial-ledge',o:{v:0}},{key:'fg-burial-ledge',o:{v:3}}]},
 {name:'Fellgang: the Travellers\' camp (vardos, bender tents, tripod campfires, tinsmith and clothesline, halts)',keys:[...FG_SEEDS('fg-wagon',4),...FG_SEEDS('fg-bender',2),{key:'fg-camp-hearth',o:{v:0}},{key:'fg-tinsmith',o:{v:0}},{key:'fg-halt',o:{v:0}}]},
 {name:'Fellgang: the road, the Market truce, the Fair and the Stairhead (truce stones, lanterns, ice tools, cairns, signs, hurdles, a hoist)',keys:[{key:'fg-truce-post',o:{v:0}},{key:'fg-truce-post',o:{v:1}},...FG_SEEDS('fg-lantern-post',2),{key:'fg-ice-tools',o:{v:0}},{key:'fg-cairn',o:{v:0}},{key:'fg-cairn',o:{v:2}},{key:'fg-stone-sign',o:{v:0}},{key:'fg-fair-hurdle',o:{v:0}},{key:'fg-stair-hoist',o:{v:0}}]},
 /* THE GLAZIERS (gz): poor to rich, three seeds a row; each row stands in a block of the scarp's rock carved from the defs' void
    plans (91z-gz-sheet.js), fronts toward the camera; C (the cut-away) opens the rock over every room's floor */
 {name:'Glazier: the cell (poor: one tier and a door)',keys:FG_SEEDS('gz-cell',3)},
 {name:'Glazier: the household front (two tiers)',keys:FG_SEEDS('gz-front',3)},
 {name:'Glazier: the rich house (three or four tiers, gilt, lattice)',keys:FG_SEEDS('gz-house',3)},
 {name:'Glazier: the stair up the scarp',keys:FG_SEEDS('gz-stair',3)},
 {name:'Glazier: the wheel walk (click wheels)',keys:FG_SEEDS('gz-wheel-walk',3)},
 {name:'Glazier: the tea hall (the loj\'s meeting hall)',keys:FG_SEEDS('gz-tea-hall',3)},
 {name:'Glazier: the Register of the Veins',keys:FG_SEEDS('gz-register-room',3)},
 {name:'Glazier: the moonglass workshop',keys:FG_SEEDS('gz-glass-shop',3)},
 {name:'Glazier: the herbalist-monks\' house',keys:FG_SEEDS('gz-monks-house',3)},
 {name:'Glazier: the adit\'s mouth',keys:FG_SEEDS('gz-adit',3)},
 {name:'Glazier: the vein gallery',keys:FG_SEEDS('gz-vein-gallery',3)},
 {name:'Glazier: the dark adit (fungus beds)',keys:FG_SEEDS('gz-dark-adit',3)},
 {name:'Glazier: the lotus pond',keys:FG_SEEDS('gz-lotus-pond',3)}
];
