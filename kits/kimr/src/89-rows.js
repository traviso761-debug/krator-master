// ================================================================= THE SHEET: the kit's rows (front +z toward the camera)
// So far one row: the example house in its three yards (v 0, 1, 2: 12, 14 and 16 m wide; each plan and rock its own draws).
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Kimr: a clan\'s pueblo on its rock (core/pueblo; the round room, the pen and the dung walls below)',keys:[{key:'km-house',o:{v:0}},{key:'km-house',o:{v:1}},{key:'km-house',o:{v:2}}]}
];
/* the culture 'kimr' is not in core/tags' vocabulary yet (core/tags/52-core-tags-vocab.js): adding it there reaches every build,
   so it rides along with the next all-builds rebuild (TODO.md). Until then the kit's page adds it to its own vocabulary at load */
if(typeof KTAGS!=='undefined'&&KTAGS.VOCAB&&KTAGS.VOCAB.cultures.indexOf('kimr')<0){KTAGS.VOCAB.cultures.push('kimr');KTAGS.VOCAB.cultureNames.kimr='Kimr';}
