// ---------------------------------------------------------------- the showcase table: rows of the kit, by family. Keys are the contract with the builders.
const TITLE='Post-Apoc Set';
const FAMILIES=[
 {name:'Small dwellings',keys:['dw-silo','dw-box','dw-tire','dw-bus','dw-tank','dw-bottle','dw-stilt']},
 {name:'Large dwellings',keys:['lg-stack','lg-twinsilo','lg-bulkhead','lg-tanktower']},
 {name:'Civic and religious',keys:['longhouse','mess','chief','shaman']},
 {name:'Shops',keys:['shop-food','shop-armor','shop-weapon','shop-tinker','shop-general']},
 {name:'Industry and power',keys:['smithy','gen-wind','gen-fuel','warehouse']},
 {name:'Farm',keys:['farm','farmhouse','granary']},
 {name:'Defence and justice',keys:['watchtower','cages']},
 {name:'Walled compound',keys:['compound',{key:'compound',o:{size:'large',slots:['lg-stack','warehouse','dw-silo']}}]},
 {name:'Arena',keys:['arena']},
 {name:'Dock',keys:['dock']},
 // last row, so every other site keeps its place: the xl compound (106 x 76) takes the longhouse AND the big man's house (two great slots)
 {name:'Compound, two great halls',keys:[{key:'compound',o:{size:'xl',slots:['longhouse','chief','smithy','shop-general','dw-silo','gen-fuel']}}]},
];
