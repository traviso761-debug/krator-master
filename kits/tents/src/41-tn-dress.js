// prefix: tn
// ================================================================= THE DRESS: one tent record, many peoples ([G data])
// A def draws a FORM (ridge, bell, yurt, ...); the dress says what it is made of and how it is marked, so the same record
// serves every people that pitches tents. Plain data and pure functions: no three.js, no DOM.
//   TN_DRESS[key]   {key, name, culture (core/tags), furn (the catalog's furniture culture for the interiors and the gear),
//                    cover {key: the MAT key, cols: [sRGB hex]}, alt (the second colour of stripes and panels), roof (a
//                    separate roof cloth), pattern ('none' | 'stripes' | 'panels' | 'border'), band (a pattern MAT key for the
//                    wall band and the yurt's band), lining, valance {cols, tassels} | null, pole {key, col}, finial {kind:
//                    'ball' | 'spear' | 'horns' | 'none', key, col}, emblem (core/sockets/38-symbols.js SYMBOLS name), field,
//                    ink, ink2 (the pennant's colours: core/sockets/80-cultures.js packs where the people has one), door
//                    ('roll' | 'tieback' | 'flap' | null: the form's own), rope (hex), stake {key, col}, floor {key, col},
//                    wear {new, worn, patched, ragged} (weights)}
//   tnDress(c)      the preset for a dress key or a culture key (TN_DRESS_ALIAS), else 'generic'; .fallback says which
//   tnSeed(o, salt) a placement's seed: KRAND.hash(world, cell, index, salt) (core/rand), never a draw count
//   tnPick(list, seed, salt), tnWear(dress, seed), tnWorn(hex, wear): the colour a cloth takes with its wear
const TN_DRESS={
 generic:{name:'Generic (bleached canvas)',culture:'generic',furn:'generic',
  cover:{key:'canvas',cols:[0xd8c4a0,0xcdb690,0xe0ceaa]},pattern:'none',band:null,valance:null,
  pole:{key:'wood',col:0x7a6044},finial:{kind:'ball',key:'wood',col:0x6a5038},emblem:null,
  door:null,rope:0xb8a07a,stake:{key:'wood',col:0x8a6a44},floor:{key:'earth',col:0x8a6a4a},wear:{new:1,worn:3,patched:1,ragged:0}},
 scyvoi:{name:'Scyvoi',culture:'scyvoi',furn:'scyvoi',
  cover:{key:'felt',cols:[0xf2ece0,0xebe3d2,0xf4efe6]},roof:{key:'felt',cols:[0xf4efe6]},alt:[0x23345a],pattern:'border',band:'patApp',lining:'patApp',
  valance:{cols:[0xa8282a,0x9a2024],tassels:0xd8b060},pole:{key:'lacq',col:null},finial:{kind:'ball',key:'brass',col:0xc8963a},
  emblem:'wheel',field:'#a8282a',ink:'#d8b060',ink2:'#23345a',door:null,rope:0x2a2420,stake:{key:'wood',col:0x5a3c26},floor:{key:'rug',col:0xa8282a},
  wear:{new:3,worn:2,patched:0,ragged:0}},
 desert:{name:'Desert nomads',culture:'nomad',furn:'nomad',
  cover:{key:'goat',cols:[0xffffff,0xf2eee8]},alt:[0x9a8a72,0xb0a080],pattern:'stripes',band:'patSadu',lining:'patSadu',valance:null,
  pole:{key:'wood',col:0x5a3c26},finial:{kind:'none'},emblem:'horns',field:'#6e4a32',ink:'#e6dcc2',ink2:'#a8282a',door:'tieback',
  rope:0x9a8462,stake:{key:'wood',col:0x6a4a30},floor:{key:'patKilim',col:null},wear:{new:1,worn:3,patched:2,ragged:0}},
 ash:{name:'Ash nomads',culture:'ashnomad',furn:'ashnomad',
  cover:{key:'ashc',cols:[0x8a8680,0x7a7670,0x948e86]},alt:[0x3a3430],pattern:'border',band:'patFret',lining:'patFret',
  valance:{cols:[0xa83a1c,0x8a2e18],tassels:0x2a2420},pole:{key:'wood',col:0x2e2620},finial:{kind:'horns',key:'bone',col:0xd8ccb0},
  emblem:'star',field:'#2a2420',ink:'#e0502a',ink2:'#c8b8a0',door:'flap',rope:0x4a403a,stake:{key:'wood',col:0x3a302a},floor:{key:'rug',col:0x6a625a},
  wear:{new:0,worn:3,patched:2,ragged:1}},
 'beast-rider':{name:'Beast Riders',culture:'beast-rider',furn:'beast-rider',
  cover:{key:'hide',cols:[0xb08a5e,0xa07a50,0xbc966a]},alt:[0x6a4a2e],pattern:'panels',band:'patBR',lining:null,
  valance:{cols:[0x3f7a3a,0x2e5a2c],tassels:0xe6dcc2},pole:{key:'wood',col:0x4a3a22},finial:{kind:'horns',key:'bone',col:0xe4dac4},
  emblem:'claw',field:'#3f7a3a',ink:'#e6dcc2',ink2:'#2e5a2c',door:'flap',rope:0x6a5434,stake:{key:'wood',col:0x5a4428},floor:{key:'rug',col:0x6a5a3a},
  wear:{new:1,worn:3,patched:1,ragged:0}},
 iziz:{name:'Iziz caravaners',culture:'iziz',furn:'iziz',
  cover:{key:'stripe',cols:[0xe07a2a,0xd8722a]},alt:[0x2f8f8a],pattern:'stripes',band:'patIziz',lining:null,
  valance:{cols:[0x2f8f8a,0x277a76],tassels:0xf2a24a},pole:{key:'wood',col:0xc8b48a},finial:{kind:'ball',key:'brass',col:0xd8a840},
  emblem:'sun',field:'#e07a2a',ink:'#f3e2c0',ink2:'#2f8f8a',door:'tieback',rope:0xd8c49a,stake:{key:'iron',col:0x4a4440},floor:{key:'rug',col:0x2f8f8a},
  wear:{new:2,worn:3,patched:1,ragged:0}},
 republican:{name:'Highlands Republican army',culture:'republican',furn:'republican',
  cover:{key:'armyc',cols:[0x6e6a4a,0x74704e,0x66624a]},alt:[0x5a5640],pattern:'none',band:null,lining:null,valance:null,
  pole:{key:'wood',col:0x4a3a28},finial:{kind:'spear',key:'iron',col:0x3a3632},emblem:'triskele',field:'#7a2028',ink:'#f0e6cc',ink2:'#2a8a86',
  door:'roll',rope:0x8a7a5a,stake:{key:'iron',col:0x3a3632},floor:{key:'earth',col:0x7a6a4a},wear:{new:3,worn:2,patched:0,ragged:0}},
 xanadu:{name:'Xanadu (Sultanate silk)',culture:'xanadu',furn:'xanadu',
  cover:{key:'silk',cols:[0xd4637e,0xc8566e]},alt:[0xf4ece0],roof:{key:'brocade',cols:[0xffffff]},pattern:'panels',band:'patXan',lining:'patXan',
  valance:{cols:[0x6e1a32,0x5e1428],tassels:0xd8a838},pole:{key:'lacq',col:null},finial:{kind:'spear',key:'brass',col:0xd8a838},
  emblem:'lotus',field:'#d4637e',ink:'#f8f4ec',ink2:'#6e1a32',door:'tieback',rope:0xe8d8b8,stake:{key:'iron',col:0x6a5a40},floor:{key:'patKilim',col:null},
  wear:{new:4,worn:1,patched:0,ragged:0}},
 islander:{name:'Ring Sea Islanders',culture:'islander',furn:'islander',
  cover:{key:'mat',cols:[0xc8a878,0xbc9c6a]},alt:[0x8a5a32],pattern:'border',band:'patTapa',lining:null,valance:null,
  pole:{key:'bamboo',col:null},finial:{kind:'none'},emblem:'moon',field:'#8a5a32',ink:'#f0e8d4',ink2:'#4a2a14',door:'roll',
  rope:0xa88a5a,stake:{key:'bamboo',col:null},floor:{key:'mat',col:0xb89868},wear:{new:1,worn:3,patched:1,ragged:0}},
 postapoc:{name:'Post-apoc scrap',culture:'post-apoc',furn:'scrap',
  cover:{key:'tarp',cols:[0x7a7a6a,0x4a6a8a,0x8a6a4a,0x6a7a5a]},alt:[0x9a5a3a,0x4a5a6a],pattern:'panels',band:null,lining:null,valance:null,
  pole:{key:'scrapm',col:0x8a7a6a},finial:{kind:'none'},emblem:'gear',field:'#5a4a3a',ink:'#d0c0a0',ink2:'#2a2420',door:'roll',
  rope:0x7a6a50,stake:{key:'iron',col:0x6a4a3a},floor:{key:'earth',col:0x6a5a48},wear:{new:0,worn:1,patched:3,ragged:2}},
 eternian:{name:'Eternians',culture:'eternian',furn:'eternian',
  cover:{key:'ripstop',cols:[0xc8a860,0xbc9c58]},alt:[0x1c1a18],pattern:'border',band:'patEter',lining:'patEter',
  valance:{cols:[0x1c1a18,0x24201c],tassels:0xd8b060},pole:{key:'wood',col:0x2a2420},finial:{kind:'ball',key:'brass',col:0xd8b060},
  emblem:'scroll',field:'#1c1a18',ink:'#d8b060',ink2:'#c8a860',door:'tieback',rope:0x6a5a40,stake:{key:'iron',col:0x3a3632},floor:{key:'rug',col:0x5a3a28},
  wear:{new:3,worn:2,patched:0,ragged:0}}
};
for(const k in TN_DRESS)TN_DRESS[k].key=k;
/* culture keys (core/tags, the catalog, core/sockets packs, core/camp) that name a preset */
const TN_DRESS_ALIAS={nomad:'desert','desert-nomad':'desert','desert-nomads':'desert',ashnomad:'ash','ash-nomad':'ash','ash-nomads':'ash',
 republic:'republican',highlands:'republican',rustic:'republican','ringsea-islander':'islander',islanders:'islander',hykkousoi:'islander',
 'post-apoc':'postapoc',scrap:'postapoc',screamer:'postapoc','beast-riders':'beast-rider',beastriders:'beast-rider',lizardmen:'beast-rider',
 izani:'iziz',talia:'iziz',pylon:'iziz',eternians:'eternian',sultanate:'xanadu'};
/* the order the sheet's dress row shows them */
const TN_DRESS_ORDER=['generic','scyvoi','desert','ash','beast-rider','iziz','republican','xanadu','islander','postapoc','eternian'];
function tnDress(c){if(c&&typeof c==='object')return c;const k=c==null?'generic':String(c);
 if(TN_DRESS[k])return TN_DRESS[k];if(TN_DRESS_ALIAS[k])return TN_DRESS[TN_DRESS_ALIAS[k]];
 return Object.assign({},TN_DRESS.generic,{fallback:k});}
/* a placement's seed from its place in the world (core/rand): world, cell, index and a salt; never from a draw count */
function tnSeed(o,salt){o=o||{};return KRAND.hash(o.world==null?0:o.world,o.cell==null?0:o.cell,o.index==null?0:o.index,salt==null?0:salt);}
function tnPick(list,seed,salt){if(!list||!list.length)return null;return list[KRAND.hash(seed,salt==null?0:salt)%list.length];}
const TN_WEARS=['new','worn','patched','ragged'];
function tnWear(dress,seed){const W=dress.wear||{worn:1};let tot=0;for(const k of TN_WEARS)tot+=W[k]==null?0:W[k];if(!tot)return 'worn';
 let u=KRAND.unit(KRAND.hash(seed,0x7ea5))*tot;for(const k of TN_WEARS){u-=W[k]==null?0:W[k];if(u<0)return k;}return 'worn';}
/* a cloth's colour after its wear: faded toward dust, and darker when ragged (integer sRGB arithmetic, the same everywhere) */
const TN_WEAR_FADE={new:0,worn:.12,patched:.18,ragged:.3};
function tnWorn(hex,wear){if(hex==null)return null;const f=TN_WEAR_FADE[wear]==null?0:TN_WEAR_FADE[wear],k=wear==='ragged'?.86:1,dust=[0x9a,0x8c,0x74];
 const ch=(v,i)=>Math.max(0,Math.min(255,Math.round((v+(dust[i]-v)*f)*k)));return (ch((hex>>16)&255,0)<<16)|(ch((hex>>8)&255,1)<<8)|ch(hex&255,2);}
