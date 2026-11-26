/* ================================================================= THE KIT: identity, library families, Tabist lexicon & palette ([G data])
   Urban Tabisti Architectural Kit (kits/tabisti/PLAN.md):
   - Walled northern East Abyss bench city-states (-1,358 to -1,433 m ASL, 1.90-1.91 atm, 30-33 C, ~1,650 mm/yr monsoon):
     Sfenops (1282, 663), Middle Tabisti (1311, 761), and Liikofi (1316, 797), plus urban treaty wards in Mungo (1322, 828) and Lower Verge.
   - Paired with kits/eastern-abyssal via KRATOR_KITS multi-kit ward zoning: walled bench cores build from tabisti (style 'urban'),
     while marsh and lakeside salvage skirts build from eastern-abyssal.
   - Shares KTAGS culture 'eastabyss' (zero unknown vocabulary tags, full Maghrebi/East Abyss catalog compatibility). */
const KIT={id:'tabisti',title:'Urban Tabisti Architectural Kit',pack:'tabisti',culture:'eastabyss',
 faction:'Urban Tabisti Bench City-States',band:'Northern East Abyss Salt-Lake Bench (Sfenops, Middle Tabisti and Liikofi)',frag:'kits/tabisti',
 ground:0x9e927e,groundProc:0x948874,fog:0xe2dcd0,furnDetail:.62};
const TB={DOOR_H:2.35,WALL:.4,SOCLE:.48,RISER:.18,BAY:3.4};
const TB_POLITIES={
 sfenops:{
  city:'Sfenops',coords:[1282,663],style:'urban',
  title:'Ahedman di Sfenops',
  specialties:['alkaline-teal kashi fritware','potash and halite brine pans','steep Zsolnay-glazed roofs','caravan syndic clearing']
 },
 middle_tabisti:{
  city:'Middle Tabisti',coords:[1311,761],style:'urban',
  title:'Ahedman di Tabisti',
  specialties:['hazarbaf buff-and-rose embossed brick','gypsum ganch stucco','Longcrawler caravanserais','Salt-Crystal Altar pilgrimage']
 },
 liikofi:{
  city:'Liikofi',coords:[1316,797],style:'urban',
  title:'Ahedman di Liikofi',
  specialties:['abyss-lac crimson-gold lacquerware','kundal coffered ceilings','verdigris-bronze patination','incense and botanical stills']
 }
};
const TB_LEXICON={
 language:'Tabist (Northern East Abyssal)',
 phonology:'a- masc. sg., t-...-t fem. sg., i-...-en masc. pl., di "in/at", p -> f, v -> b, th -> t/d, Tifinagh-style salt marks',
 terms:{
  tahawst:'urban courtyard house (from house; pl. tihawsen)',
  tafalast:'urban ruler palace of the Ahedman (from palace; pl. tifalasen)',
  ahedman:'urban city-state magistrate / headman (pl. ihedmanen)',
  ibisen:'the Tabisti urban citizenry and guild burghers',
  afan:'evaporative potash or salt-crystallization pan (from pan)',
  tafurst:'open columned ground breeze-portico (from porch)',
  asarbu:'ancient relic / municipal waterworks mechanism (from servo)',
  takashit:'embossed alkaline-turquoise and cobalt glazed relief tilework',
  tagancht:'carved white gypsum lacework panel sheltered under a dry veranda',
  tashadirvant:'shallow turquoise-tiled evaporative courtyard cooling fountain'
 }
};
const SV_LIB={
 buffbrick:'buffbrick',rosebrick:'rosebrick',bandbrick:'bandbrick',stucco:'stucco',ganch:'ganch',alabaster:'alabaster',
 kashi:'kashi',zsolnay:'zsolnay',zsolnay_fine:'zsolnay_fine',cobalt:'cobalt',trencadis:'trencadis',escata:'escata',claustra:'claustra',bathlens:'bathlens',terracotta:'terracotta',
 ashlar:'ashlar',paving:'paving',cobble:'cobble',
 ustun:'ustun',cedar:'cedar',carvedwood:'carvedwood',kundal:'kundal',lacquer:'lacquer',floor:'floor',
 verdigris:'verdigris',leafscale:'leafscale',gilt:'gilt',bronze:'bronze',iron:'iron',crystal:'crystal',
 silk:'silk',brocade:'brocade',canvas:'canvas',flag:'flag',rope:'rope',foliage:'foliage',
 plain:'plain',brass:'brass',bone:'bone',stone:'stone',earth:'earth',sand:'sand'};
const SV_TILE0={
 buffbrick:1.6,rosebrick:1.45,bandbrick:1.5,stucco:2.1,ganch:1.15,alabaster:1.4,
 kashi:1.15,zsolnay:1.35,zsolnay_fine:1.45,cobalt:1.2,trencadis:1.15,escata:1.25,claustra:1.2,bathlens:1.3,terracotta:1.35,
 ashlar:1.8,paving:2.0,cobble:2.0,
 ustun:1.4,cedar:1.5,carvedwood:1.1,kundal:1.25,lacquer:1.3,floor:1.8,
 verdigris:1.15,leafscale:.75,gilt:.75,bronze:.85,iron:.85,crystal:.65,
 silk:1.1,brocade:1.2,canvas:1.3,flag:1.0,rope:.28,foliage:.8,
 plain:1.4,brass:.5,bone:.5,stone:2.2,earth:2.8,sand:3.0};
const SV_CLOTH={silk:1,brocade:1,canvas:1,flag:1};
const SV_CUT=Object.assign({
 buffbrick:1,rosebrick:1,bandbrick:1,stucco:1,ganch:1,alabaster:1,
 kashi:1,zsolnay:1,zsolnay_fine:1,cobalt:1,trencadis:1,escata:1,claustra:1,bathlens:1,terracotta:1,ashlar:1,
 ustun:1,cedar:1,carvedwood:1,kundal:1,lacquer:1,
 verdigris:1,leafscale:1,gilt:1,bronze:1,iron:1,crystal:1,plain:1},SV_CLOTH);
const KIT_FALLBACK=[];
const SVPAL={
 buffbrick:[0xfbf8f2,0xf6f2ea,0xffffff],buffWarm:[0xf9f5ed,0xf3eee4],
 rosebrick:[0xc46b54,0xb85e48,0xcf7760],roseDeep:[0xa44a38,0x964030],
 bandbrick:[0xfcf9f4,0xf6f2eb,0xffffff],
 stucco:[0xeee4d0,0xe6dbc6,0xf4ecda],stuccoRose:[0xe8d0c0,0xdec4b2],
 ganch:[0xf5f2eb,0xede9e0,0xf9f7f2],
 alabaster:[0xf6f3ec,0xeeeae1,0xfaf8f3],
 kashi:[0xf7fbfa,0xf0f7f6,0xffffff],kashiMint:[0xf2faf8,0xeaf6f3],
 zsolnay:[0xf6fbfa,0xeff7f5,0xffffff],zsolnaySea:[0xf2faf7,0xeaf6f2],
 zsolnay_fine:[0xf6fbfa,0xeff7f5,0xffffff],
 cobalt:[0x1d4e8c,0x174078,0x265c9e],
 trencadis:[0xfcfaf6,0xf6f3ec,0xffffff],trencadisTeal:[0xf4faf9,0xeef6f4],trencadisGold:[0xfcf8ee,0xf7f1e2],
 escata:[0xfcf9f3,0xf7f2ea,0xffffff],escataRose:[0xfbf4ef,0xf5ebe4,0xffffff],
 claustra:[0xfcf9f4,0xf7f3ec,0xffffff],
 bathlens:[0xc8dcd6,0xbcd0ca,0xd4e6e0],
 terracotta:[0xc66449,0xb8583e,0xd27055],
 ashlar:[0xd8ccb4,0xccbfa6,0xe2d6be],
 paving:[0xd6cbb6,0xcabfa8,0xe0d5c0],
 cobble:[0x988e80,0x8c8274,0xa49a8c],
 ustun:[0x523422,0x462b1b,0x5e3d29],
 cedar:[0x825638,0x764c30,0x8e6040],
 carvedwood:[0x623e28,0x563520,0x6e472f],
 kundal:[0xfcf8f2,0xf6f1e8,0xffffff],kundalTeal:[0xf2f8f7,0xeaf3f1],kundalGold:[0xfcf7eb,0xf6efe0],
 lacquer:[0x9e2c26,0x8e241e,0xac342e],
 floor:[0x8c6644,0x805c3c,0x98704c],
 verdigris:[0x4a9c86,0x3e8e78,0x56aa94],
 leafscale:[0xf8faf8,0xf1f5f2,0xffffff],
 gilt:[0xdcb03c,0xcfa232,0xe8bc48],
 bronze:[0x9c723a,0x8e6632,0xaa7e42],
 iron:[0x36383c,0x2e3034,0x404246],
 crystal:[0x4cc4e4,0x3eb4d6,0x5ed2f0],
 silk:[0x228e88,0x1a7e78],silkRose:[0xc4544a,0xb6483e],silkSaffron:[0xe4ae3a,0xd6a030],silkIvory:[0xf2ecdc,0xe8e0ce],
 brocade:[0x1f528e,0x18447a],canvas:[0xebe0ca,0xe0d4bc],flag:[0x1f9a92,0x188a82],
 rope:[0xc8a858,0xbca04e],
 foliage:[0x3a7c4e,0x306e42,0x448858],
 bone:[0xeee6d4,0xe2dac8],plain:[0xdacfbc,0xcec3b0],brass:[0xac823e,0x9e7634],
 stone:[0x8a8276,0x7e766a],earth:[0x786048,0x6c563e],sand:[0xd2c2a0,0xc6b694],
 water:[0x228c92,0x1a7a80],flame:[0xffc25c]};
function P(k){return jc(pick(SVPAL[k]),.032);}
