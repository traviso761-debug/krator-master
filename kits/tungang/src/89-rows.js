// ================================================================= THE SHEET: rows of the kit, by building (front +z toward the camera)
// A row entry is a def key, or {key, o} (place() options: a variant v, the meeting hall's variant, a state). Rows run north
// (-z) from the first. Five seeds a row (v 0 to 4: each house-like key's families in turn, 42-fg-mass.js); the meeting hall in both variants. The state switch (kept, worn) is
// ?state=worn or the panel's State select (99-sheet-fg.js): FG_STATE, read by every builder through fgCx. East and west of
// the rows, 91t-fg-sheet.js lays the sample village, the sloped test pad and the test wall with its ropes.
const TITLE=KIT.title;
let FG_STATE=/[?&]state=worn\b/.test(location.search)?'worn':'kept';
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
 {name:'Fellgang: the wall (stations, nest gear, a burial ledge)',keys:[{key:'fg-wall-station',o:{v:0}},{key:'fg-wall-station',o:{v:1}},{key:'fg-nest-ledge',o:{v:0}},{key:'fg-burial-ledge',o:{v:0}},{key:'fg-burial-ledge',o:{v:3}}]},
 {name:'Fellgang: the road (lantern posts, a halt, the Travellers\' wagons)',keys:[...FG_SEEDS('fg-lantern-post',3),{key:'fg-halt',o:{v:0}},{key:'fg-halt',o:{v:1}},...FG_SEEDS('fg-wagon',3)]}
];
