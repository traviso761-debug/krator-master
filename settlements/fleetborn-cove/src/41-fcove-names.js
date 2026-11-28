// ================================================================= FLEETBORN COVE — named citizens: Fleet-born clicks, Shore-kin creole & Hueru-Kuran (FCOVE_NAMES)  [G data]
// Deterministic KRAND-seeded citizen naming and people/dive-class metadata matching tools/names/crook_ria.py and
// core/charactermodels/data/peoples.json (cflit_qbon, shore_kin, hueru_kuran):
//   1. Fleet-born (cflit_qbon): cetacean-coda click prefixes (c, q, x, ɓ, ɗ) on clipped non-rhotic maritime stems +
//      hyphenated two-click pelagic Ark-Ward chain-clan bynames (cFlīt-qBōn, qDīp-cWād, cĀk-cHōld, ...); full_diver_25m100m.
//   2. Shore-kin (shore_kin): four-strand Arch/Farport maritime creole blending Low-Ria (Rīwa-Tōka), Eternian, Hueru-Kuran,
//      and de-clicked Fleet-born stems + Arch/sea village & harbour-yard trade bynames (strictly Arch/sea materials:
//      zero nephrite, zero red cypress); half_diver_3m25m or land_bound.
//   3. Hueru-Kuran (hueru_kuran): Crookshore whale-clan visiting whalers (outer_whalers / island_traders 89h crews); land_bound.
// Zero THREE, zero DOM, zero Math.random, zero numeric || defaults.
(function(root){
'use strict';
if(root.FCOVE_NAMES)return;

const CLICKS=Object.freeze(['c','q','x','\u0253','\u0257']);

const DEFAULT_PEOPLES=Object.freeze({
 cflit_qbon:Object.freeze({
  id:'cflit_qbon',
  name:'cFl\u012bt-qB\u014dn (the Fleet-Born)',
  skin:Object.freeze(['#a87a55','#8c6142','#6b4630']),
  hair:Object.freeze(['#0f0c0a','#1a1410','#2a2018']),
  eyes:Object.freeze(['#2a1a10','#3b2414','#2c2434'])
 }),
 shore_kin:Object.freeze({
  id:'shore_kin',
  name:'Shore-Kin (the Arch Half-Divers)',
  skin:Object.freeze(['#d4ad8c','#b88963','#966948','#754e35']),
  hair:Object.freeze(['#0f0c0a','#1a1410','#2a2018','#3a2b1f']),
  eyes:Object.freeze(['#2a1a10','#3b2414','#4a3520','#38323e'])
 }),
 hueru_kuran:Object.freeze({
  id:'hueru_kuran',
  name:'Hueru-Kuran (Crookshore Whale-Clans)',
  skin:Object.freeze(['#d9b492','#be916c','#9c6e4b']),
  hair:Object.freeze(['#120f0d','#1f1915','#2e241d']),
  eyes:Object.freeze(['#2a1a10','#3b2414'])
 })
});

const DIVE_LABELS=Object.freeze({
 full_diver_25m100m:'Full Free-Diver (25 min / 100+ m)',
 half_diver_3m25m:'Half-Diver (3 min / 25 m)',
 land_bound:'Land / Deck-Bound Artisan'
});

/* Fleet-born given stems: [gloss, respelled root, preferred click] */
const FB_GIVEN=Object.freeze([
 ['Tide','taid','c'],['Deep','diip','q'],['Keel','keel','\u0253'],['Reef','reef','\u0257'],
 ['Sound','suund','x'],['Wake','week','c'],['Brine','brain','q'],['Drift','drift','x'],
 ['Sill','sil','\u0257'],['Spar','spaar','\u0253'],['Fathom','fadm','q'],['Line','lain','\u0253'],
 ['Gale','geel','x'],['Swell','swel','c'],['Hull','hal','c'],['Lead','liid','\u0257'],
 ['Bell','bel','\u0253'],['Trench','trens','q'],['Shoal','sool','x'],['Flume','fluum','c'],
 ['Dive','daiv','q'],['Foam','foom','x'],['Knot','not','\u0257'],['Stern','sturn','c'],
 ['Bight','bait','\u0253'],['Cove','koov','q'],['Fetch','fets','x'],['Cable','keebl','\u0253'],
 ['Valve','valv','\u0257'],['Plumb','plam','q'],['Current','karnt','x'],['Warp','waarp','c']
]);

const FB_CLAN_A=Object.freeze([
 ['Fleet','fleet','c'],['Deep','diip','q'],['Ark','ark','c'],['Broad','brood','x'],
 ['Tide','taid','\u0257'],['Keel','keel','\u0253'],['Whale','weel','\u0253'],['Trench','trens','q'],
 ['Bell','bel','c'],['Silk','silk','x'],['Smelt','smelt','q'],['Sail','seel','x'],
 ['Pakt','pakt','\u0257'],['Copper','kop','q'],['Wave','weev','c'],['Salt','solt','\u0257']
]);

const FB_CLAN_B=Object.freeze([
 ['Born','born','q'],['Ward','ward','c'],['Hold','hoold','c'],['Road','rood','\u0253'],
 ['Hull','hal','c'],['Line','lain','q'],['Reef','reef','\u0257'],['Sound','suund','q'],
 ['Dive','daiv','q'],['Watch','wots','x'],['Mark','mark','\u0257'],['Wake','week','x']
]);

/* Shore-kin 4-strand Arch/Farport creole stems */
const SK_STRANDS=Object.freeze({
 ria:Object.freeze([
  ['R\u012bwa','river'],['T\u014dka','word'],['K\u016bri','court'],['\u0100mpala','amber'],
  ['S\u0101la','hall'],['\u0141\u012bda','tideway'],['M\u0101ni','water'],['N\u0101ka','shell'],
  ['P\u0101la','palisade'],['W\u0101ta','reach'],['\u0141\u014dna','moon'],['S\u016bna','sun-bar']
 ]),
 eternian:Object.freeze([
  ['L\u012bng','bell'],['M\u0101','port'],['T\u014dng','east-pass'],['S\u0113k','stone'],
  ['B\u0101i','white-lime'],['Sh\u0113n','deep'],['K\u0101i','open-sea'],['L\u016b','way'],
  ['H\u014d','river-mouth'],['Y\u016bn','cloud'],['J\u012bn','metal'],['W\u0113n','script']
 ]),
 hueru:Object.freeze([
  ['Hueru','whale'],['Kuran','clan'],['K\u014dpa','copper'],['K\u0101sk\u0113','cascade'],
  ['P\u016bru','prow'],['N\u016bra','cairn'],['S\u014dra','salt-shore'],['T\u0101ru','pitch'],
  ['\u016akor','hearth'],['M\u012bru','pool'],['R\u012bva','rib'],['K\u0101en','flame']
 ]),
 fleetborn_creole:Object.freeze([
  ['Fl\u012bt','fleet'],['B\u014dn','born'],['D\u012bpa','deep'],['W\u0101da','ward'],
  ['St\u0101ra','star'],['Br\u016bka','brook'],['Br\u014dda','broad'],['R\u012bba','river'],
  ['T\u0101ida','tide'],['K\u012bl','keel'],['S\u012bla','sill'],['Sp\u0101ra','spar']
 ])
});

const STRAND_ORDER=Object.freeze(['ria','eternian','hueru','fleetborn_creole']);

const SK_BYNAMES=Object.freeze([
 ['Clamp-Watcher','ash-clamp & kelp-kiln tender'],
 ['Kauri-Saw','Agathis/Araucaria spar sawyer'],
 ['Byssus-Hand','golden sea-silk spinner'],
 ['Sill-Salt','intertidal solar salt-panner'],
 ['Paktong-Tally','white-copper customs weigher'],
 ['Lime-Burner','oyster-shell & travertine lime-burner'],
 ['Brucite-Screen','pierced spring-travertine mason'],
 ['Catechu-Sail','mangrove-tannin sailbark rigger'],
 ['Crib-Wright','tarred mangrove-pile wharf-wright'],
 ['Kelp-Trench','soda-kelp trench burner'],
 ['Pumice-Float','vesicular pumice net-rigger'],
 ['Weir-Gate','basalt fish-weir keeper'],
 ['Knee-Steamer','steamed mangrove boat-knee bender'],
 ['Pitch-Boiler','kauri-gum & gjar caulking boiler'],
 ['Double-Dark','equinoctial spring-tide watcher'],
 ['Tide-Post','paktong tide-mark reader'],
 ['Shell-Wash','hex-wall limewash plasterer'],
 ['Paperbark','Melaleuca roof-liner'],
 ['Shark-Awning','oiled ray- & sharkskin sailmaker'],
 ['Verdigris-Ash','Pycnandra nickel-shrub burner'],
 ['Careen-Grid','low-water tender hull-scraper'],
 ['Ohia-Horn','carved Metrosideros gable-wright'],
 ['Mask-Moulder','closed-eyed terracotta lintel-moulder'],
 ['Coir-Walk','Hibiscus bast & coir ropemaker'],
 ['Half-Diver','intertidal pearl & pinna free-diver'],
 ['Slack-Water','ria sill pilot'],
 ['Drift-Rib','stranded whale-rib vault-framer'],
 ['Skein-Dyer','catechu & sea-silk vat-dyer'],
 ['Cupola-Bellows','ray-hide paktong foundryman'],
 ['Tender-Oar','Caretaker House lighter crew']
]);

const HK_GIVEN=Object.freeze([
 ['Hueru','whale'],['K\u014dpa','copper'],['K\u0101sk\u0113','cascade'],['P\u016bru','prow'],
 ['N\u016bra','cairn'],['S\u014dra','salt-shore'],['R\u012bva','whale-rib'],['K\u0101en','hearth-flame'],
 ['T\u0101ru','harpoon-tar'],['M\u012bru','caldera-pool'],['H\u0101ru','swell'],['K\u016bru','flense-blade']
]);

const HK_CLANS=Object.freeze([
 ['Hueru-Kuran','Whale-Clan'],['K\u014dpa-Kuran','Copper-Caldera Clan'],['K\u0101sk\u0113di-Kuran','Cascade-Rim Clan'],
 ['P\u016bru-Kuran','Baidarka-Prow Clan'],['R\u012bva-Kuran','Whalebone-Rib Clan'],['S\u014dra-Kuran','Outer-Shoal Clan']
]);

function fnv(s){
 const str=String(s);
 let h=2166136261>>>0;
 for(let i=0;i<str.length;i++){
  h^=str.charCodeAt(i);
  h=Math.imul(h,16777619)>>>0;
 }
 return h>>>0;
}

function hashU32(seed,a,b,c){
 const sd=seed==null?0x4A2C06:seed;
 if(root.KRAND&&typeof root.KRAND.hash==='function'){
  return root.KRAND.hash(sd>>>0,a==null?0:a>>>0,b==null?0:b>>>0,c==null?0:c>>>0)>>>0;
 }
 let x=(sd^Math.imul((a==null?0:a)+1,0x9e3779b1)^Math.imul((b==null?0:b)+7,0x85ebca6b)^Math.imul((c==null?0:c)+13,0xc2b2ae35))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d)>>>0;x^=x>>>15;
 return x>>>0;
}

function fleetbornStem(raw,click){
 const clk=click==null?'c':click;
 if(CLICKS.indexOf(clk)<0)throw new Error('FCOVE_NAMES.fleetbornStem: unknown click '+clk);
 let w=String(raw).trim().toLowerCase();
 w=w.replace(/wh/g,'w').replace(/ck/g,'k').replace(/ch/g,'ts').replace(/sh/g,'s').replace(/th/g,'t');
 w=w.replace(/ng/g,'n').replace(/qu/g,'kw');
 w=w.replace(/oor/g,'\u014d').replace(/oar/g,'\u014d').replace(/orn/g,'\u014dn').replace(/ard/g,'\u0101d').replace(/ark/g,'\u0101k');
 w=w.replace(/arp/g,'\u0101p').replace(/art/g,'\u0101t').replace(/arm/g,'\u0101m').replace(/urn/g,'\u016bn');
 w=w.replace(/aa/g,'\u0101').replace(/ee/g,'\u012b').replace(/ii/g,'\u012b').replace(/oo/g,'\u014d').replace(/uu/g,'\u016b');
 w=w.replace(/([\u0101\u0113\u012b\u014d\u016baeiou])r(?![aeiou\u0101\u0113\u012b\u014d\u016b])/g,'$1');
 if(!w)throw new Error('FCOVE_NAMES.fleetbornStem: empty stem');
 return clk+w.charAt(0).toUpperCase()+w.slice(1);
}

function resolvePeoples(custom){
 const src=custom||(typeof root.FCOVE_PEOPLES!=='undefined'?root.FCOVE_PEOPLES:null);
 const out={
  cflit_qbon:DEFAULT_PEOPLES.cflit_qbon,
  shore_kin:DEFAULT_PEOPLES.shore_kin,
  hueru_kuran:DEFAULT_PEOPLES.hueru_kuran
 };
 if(src&&typeof src==='object'){
  ['cflit_qbon','shore_kin','hueru_kuran','hueru-kuran'].forEach(k=>{
   const p=src[k];
   if(p&&Array.isArray(p.skin)&&p.skin.length){
    const normKey=k==='hueru-kuran'?'hueru_kuran':k;
    out[normKey]=Object.freeze({
     id:normKey,
     name:p.name||DEFAULT_PEOPLES[normKey].name,
     skin:Object.freeze(p.skin.slice()),
     hair:Object.freeze((Array.isArray(p.hair)&&p.hair.length?p.hair:DEFAULT_PEOPLES[normKey].hair).slice()),
     eyes:Object.freeze((Array.isArray(p.eyes)&&p.eyes.length?p.eyes:DEFAULT_PEOPLES[normKey].eyes).slice())
    });
   }
  });
 }
 return out;
}

function fleetbornName(index,seed){
 const idx=index==null?0:index|0;
 if(idx<0)throw new Error('FCOVE_NAMES.fleetbornName: index must be >= 0');
 const sd=seed==null?0x4A2C06:seed>>>0;
 const g1=FB_GIVEN[hashU32(sd,idx,101)%FB_GIVEN.length];
 const clk1=(hashU32(sd,idx,102)%3===0)?CLICKS[hashU32(sd,idx,103)%CLICKS.length]:g1[2];
 const stem1=fleetbornStem(g1[1],clk1);
 let given=stem1,gGloss=g1[0];
 if(hashU32(sd,idx,104)%3===0){
  const g2=FB_GIVEN[hashU32(sd,idx,105)%FB_GIVEN.length];
  if(g2[0]!==g1[0]){
   given=stem1+'-'+fleetbornStem(g2[1],g2[2]);
   gGloss=g1[0]+'-'+g2[0];
  }
 }
 const ca=FB_CLAN_A[hashU32(sd,idx,106)%FB_CLAN_A.length];
 let cb=FB_CLAN_B[hashU32(sd,idx,107)%FB_CLAN_B.length];
 if(cb[0].toLowerCase()===ca[0].toLowerCase()){
  cb=FB_CLAN_B[(hashU32(sd,idx,107)+1)%FB_CLAN_B.length];
 }
 const clan=fleetbornStem(ca[1],ca[2])+'-'+fleetbornStem(cb[1],cb[2]);
 return{
  culture:'cflit_qbon',
  name:given+' '+clan,
  given:given,
  byname:clan,
  gloss:gGloss+' of '+ca[0]+'-'+cb[0]
 };
}

function shorekinName(index,seed,preferredByname){
 const idx=index==null?0:index|0;
 if(idx<0)throw new Error('FCOVE_NAMES.shorekinName: index must be >= 0');
 const sd=seed==null?0x4A2C06:seed>>>0;
 const s1Key=STRAND_ORDER[(idx+hashU32(sd,idx>>2,201))%STRAND_ORDER.length];
 let s2Key=STRAND_ORDER[(idx+1+hashU32(sd,idx,202))%STRAND_ORDER.length];
 if(s2Key===s1Key)s2Key=STRAND_ORDER[(STRAND_ORDER.indexOf(s1Key)+1)%STRAND_ORDER.length];
 const L1=SK_STRANDS[s1Key],L2=SK_STRANDS[s2Key];
 const p1=L1[hashU32(sd,idx,203)%L1.length];
 const p2=L2[hashU32(sd,idx,204)%L2.length];
 let given,strands,gGloss;
 if(hashU32(sd,idx,205)%5===0){
  given=p1[0];strands=[s1Key];gGloss=p1[1];
 }else{
  given=p1[0]+'-'+p2[0];strands=[s1Key,s2Key];gGloss=p1[1]+'-'+p2[1];
 }
 let by=SK_BYNAMES[hashU32(sd,idx,206)%SK_BYNAMES.length];
 if(preferredByname){
  for(let i=0;i<SK_BYNAMES.length;i++){
   if(SK_BYNAMES[i][0]===preferredByname){by=SK_BYNAMES[i];break;}
  }
 }
 return{
  culture:'shore_kin',
  name:given+' '+by[0],
  given:given,
  byname:by[0],
  strands:strands,
  gloss:gGloss+' ('+by[1]+')'
 };
}

function hueruName(index,seed){
 const idx=index==null?0:index|0;
 if(idx<0)throw new Error('FCOVE_NAMES.hueruName: index must be >= 0');
 const sd=seed==null?0x4A2C06:seed>>>0;
 const g1=HK_GIVEN[hashU32(sd,idx,301)%HK_GIVEN.length];
 const g2=HK_GIVEN[hashU32(sd,idx,302)%HK_GIVEN.length];
 const given=(hashU32(sd,idx,303)%2===0&&g1[0]!==g2[0])?(g1[0]+'-'+g2[0]):g1[0];
 const cl=HK_CLANS[hashU32(sd,idx,304)%HK_CLANS.length];
 return{
  culture:'hueru_kuran',
  name:given+' '+cl[0],
  given:given,
  byname:cl[0],
  gloss:g1[1]+' ('+cl[1]+')'
 };
}

const TUNIC_PALETTE=Object.freeze({
 cflit_diver:Object.freeze([0x222c38,0x1d3442,0x2c3644]),
 cflit_wright:Object.freeze([0x9e3426,0x7e2a1e,0x2a445e,0xb84635]),
 cflit_moot:Object.freeze([0x9e3426,0xb84635,0xc89b42,0x263b58,0x6e241b]),
 shore_ash:Object.freeze([0x7d422c,0x58483c,0x2e6b58,0x8a5236]),
 shore_spars:Object.freeze([0x6b4c32,0x3a5c4a,0x8c683e,0x425868]),
 shore_cordage:Object.freeze([0xb88b3c,0x365268,0x7c4830,0x2e6b58]),
 shore_ore:Object.freeze([0x3c3e44,0x783e2a,0x4a525c,0x8a5a36]),
 shore_saltery:Object.freeze([0x365268,0x4c6e78,0xb89658,0x2e6b58]),
 shore_harbour:Object.freeze([0x365268,0x2e6b58,0x9e3426,0xb88b3c,0x3e4248]),
 hueru_whaler:Object.freeze([0x6e4f34,0x4b545e,0x7c5c3e,0x38444e])
});

function citizen(spec){
 if(!spec||!spec.id)throw new Error('FCOVE_NAMES.citizen: requires spec.id');
 const people=spec.people;
 if(people!=='cflit_qbon'&&people!=='shore_kin'&&people!=='hueru_kuran'){
  throw new Error('FCOVE_NAMES.citizen: unknown people '+people);
 }
 const diveClass=spec.diveClass||(people==='cflit_qbon'?'full_diver_25m100m':people==='shore_kin'?'half_diver_3m25m':'land_bound');
 if(!DIVE_LABELS[diveClass]){
  throw new Error('FCOVE_NAMES.citizen: unknown diveClass '+diveClass);
 }
 const sd=(spec.seed==null?0x4A2C06:spec.seed)>>>0;
 const salt=fnv(spec.id);
 const idx=spec.index==null?(salt&0x7fff):spec.index|0;
 const P=resolvePeoples(spec.peoples)[people];
 let nm;
 if(people==='cflit_qbon')nm=fleetbornName(idx,sd^salt);
 else if(people==='shore_kin')nm=shorekinName(idx,sd^salt,spec.preferredByname||null);
 else nm=hueruName(idx,sd^salt);

 const skin=P.skin[hashU32(sd,salt,11)%P.skin.length];
 const hair=P.hair[hashU32(sd,salt,12)%P.hair.length];
 const palKey=spec.paletteKey||(people==='cflit_qbon'?'cflit_moot':people==='shore_kin'?'shore_harbour':'hueru_whaler');
 const pal=TUNIC_PALETTE[palKey]||TUNIC_PALETTE.shore_harbour;
 const tunicHex=pal[hashU32(sd,salt,13)%pal.length];

 return Object.freeze({
  id:String(spec.id),
  name:nm.name,
  given:nm.given,
  byname:nm.byname,
  gloss:nm.gloss,
  people:people,
  peopleLabel:P.name,
  diveClass:diveClass,
  diveLabel:DIVE_LABELS[diveClass],
  affiliation:spec.affiliation||'arcoforte_caretakers',
  affiliationLabel:spec.affiliationLabel||spec.affiliation||'Arcoforte Caretaker House',
  role:spec.role||'citizen',
  roleLabel:spec.roleLabel||spec.role||'Citizen',
  homeId:spec.homeId||'fcove.arcoforte.bastion_store',
  fleetId:spec.fleetId||null,
  cohort:spec.cohort||'caretakers',
  skin:skin,
  hair:hair,
  tunicHex:tunicHex,
  hatKind:spec.hatKind||(diveClass==='full_diver_25m100m'&&spec.cohort==='divers'?'dive_hood':people==='shore_kin'?'sun_hat':'hair_bun'),
  defaultTool:spec.tool||'none'
 });
}

root.FCOVE_NAMES=Object.freeze({
 CLICKS:CLICKS,
 DIVE_LABELS:DIVE_LABELS,
 DEFAULT_PEOPLES:DEFAULT_PEOPLES,
 resolvePeoples:resolvePeoples,
 fleetbornStem:fleetbornStem,
 fleetbornName:fleetbornName,
 shorekinName:shorekinName,
 hueruName:hueruName,
 citizen:citizen
});
if(typeof module!=='undefined'&&module.exports)module.exports=root.FCOVE_NAMES;
})(typeof window!=='undefined'?window:globalThis);
