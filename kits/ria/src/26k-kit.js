// ================================================================= THE KIT: identity, library families, dynastic metadata & palette ([G data])
// The Ria Dynastic Continuum ("The Two Reaches", CROOK-RIA-DECISIONS.md 2.4 & 2.6):
//   - Lower Ria / Western Dynasty (Heartland & Ria Sound, Low-Ria Riwa-Toka, style 'lower-ria'):
//     Kiln-fired Babylonian polychrome glazed-brick battered pylons (cobalt-lapis, emerald-celadon, saffron-gold) + Classical fluted
//     travertine arcades + Egyptian cavetto cornices, crowned by 3-to-7-tier Thai Rattanakosin Prasat & Burmese Konbaung Pyatthat
//     glazed roofs, upturned gilded chofa / hang hong flame-finials, and 5-headed Uktena river-serpent naga balustrades.
//   - Upper Ria / Eastern Dynasty (Upper Ria & Neo-Ozarks, High-Ria Liwa-Toga, style 'upper-ria'):
//     Cut imperial red-porphyry & cream-white karst dolomite ashlar + Egyptian-Classical lotus/papyrus colonnades + lodestone-capped
//     obelisks (lodestone = 220), crowned by Khmer Angkor stone Prangs, Northern Lanna white-dolomite & indigo-slate multi-tier
//     Prasat roofs, Bagan/Nusantara upturned tiered lotus domes, Mandala cloisters, and Silver-Bronze Crested Water-Swan (Hongsa) finials.
const KIT={id:'ria',title:'Ria Dynasty Architectural Kit',pack:'ria',culture:'ria',
 faction:'Ria Dynasties of the Two Reaches',band:'Ma-Ria',frag:'kits/ria',
 ground:0x9e9884,groundProc:0x96907c,fog:0xd8dedc,furnDetail:.62};
const RA={DOOR_H:2.3,WALL:.42,SOCLE:.48,RISER:.18,BAY:3.6};
const RA_DYNASTIES={
 lowerRia:{
  style:'lower-ria',branch:'Low-Ria (Riwa-Toka)',shift:'Mississippian / Muskogean labial-preserving shift',
  seat:[796,176],sound:[626,140],emblem:'5-Headed Gilded Uktena River-Serpent',
  cognates:{crown:'kuluna',stone:'sitona',amber:'ampala',palaceBarge:'palasi-baca',weepingValley:'Wipi-wali'}
 },
 upperRia:{
  style:'upper-ria',branch:'High-Ria (Liwa-Toga)',shift:'Cherokee / Iroquoian bilabial-to-kw/gw shift',
  seat:[1186,118],karst:[1135,153],lodestone:[1058,224],emblem:'Crested Silver-Bronze Water-Swan (Hongsa)',
  cognates:{crown:'kwaluna',amber:'akwala',upperRia:'Akwala-Liwayi',palaceBarge:'kwalasi-gwatsa',weepingValley:'Wikwi-waliyi',spring:'sikwingi'}
 }
};
const SV_LIB={
 cobalt:'cobalt',emerald:'emerald',saffron:'saffron',celadon:'celadon',terracotta:'terracotta',
 giltroof:'giltroof',indigoslate:'indigoslate',copper:'copper',
 dolomite:'dolomite',travertine:'travertine',porphyry:'porphyry',alabaster:'alabaster',
 carve:'carve',plaster:'plaster',brick:'brick',paving:'paving',mosaic:'mosaic',
 teak:'teak',cedar:'cedar',carvedwood:'carvedwood',crimson:'crimson',ebony:'ebony',floor:'floor',
 gold:'gold',bronze:'bronze',silver:'silver',lodestone:'lodestone',
 silk:'silk',brocade:'brocade',flag:'flag',rope:'rope',lotus:'lotus',
 plain:'plain',brass:'brass',bone:'bone',iron:'iron',stone:'stone',earth:'earth',sand:'sand'};
const SV_TILE0={
 cobalt:1.4,emerald:1.4,saffron:1.6,celadon:1.4,terracotta:1.4,giltroof:1.2,indigoslate:1.4,copper:1.3,
 dolomite:1.8,travertine:1.9,porphyry:1.5,alabaster:1.4,carve:1.3,plaster:2.2,brick:1.5,paving:2.2,mosaic:1.5,
 teak:1.5,cedar:1.5,carvedwood:1.2,crimson:1.4,ebony:1.4,floor:1.8,
 gold:.7,bronze:.85,silver:.8,lodestone:.9,
 silk:1.1,brocade:1.2,flag:1,rope:.28,lotus:.8,
 plain:1.4,brass:.5,bone:.5,iron:.8,stone:2.2,earth:2.8,sand:3};
const SV_CLOTH={silk:1,brocade:1,flag:1};
const SV_CUT=Object.assign({
 cobalt:1,emerald:1,saffron:1,celadon:1,terracotta:1,giltroof:1,indigoslate:1,copper:1,
 dolomite:1,travertine:1,porphyry:1,alabaster:1,carve:1,plaster:1,brick:1,
 teak:1,cedar:1,carvedwood:1,crimson:1,ebony:1,gold:1,bronze:1,silver:1,plain:1},SV_CLOTH);
const KIT_FALLBACK=[];
const SVPAL={
 cobalt:[0x1c4a8c,0x173e7a,0x24569e],cobaltD:[0x132f5e,0x102850],
 emerald:[0x247a66,0x1e6c5a,0x2c8872],emeraldL:[0x3ca084,0x349278],
 saffron:[0xdca030,0xd09428,0xe6ac3c],saffronL:[0xf0be54,0xe4b248],
 celadon:[0x5ea68a,0x52987c,0x6ab496],
 terracotta:[0xc25836,0xb44e2e,0xcf6440],
 giltroof:[0xe4b840,0xd8ac36,0xefc44c],
 indigoslate:[0x485284,0x3e4878,0x566094],lavender:[0x6c72a4,0x606698],
 copper:[0x4a8c78,0x3e7e6a,0x569884],copperWarm:[0xb86e44,0xa8623a],
 dolomite:[0xf0eadc,0xe8e1d0,0xf6f1e6],dolomiteD:[0xd8cfc0,0xcec4b2],
 travertine:[0xe4dac2,0xdad0b6,0xede4ce],travertineD:[0xcac0a6,0xbfb49a],
 porphyry:[0x7e2b2a,0x722322,0x8c3432],porphyryL:[0x9c423e,0x903a36],
 alabaster:[0xf7f4ee,0xf1ede4,0xfbf9f4],
 carve:[0xe2d8c2,0xd8ceb6,0xebe2ce],carveWhite:[0xf4f0e8,0xece7dc],
 plaster:[0xf4efe2,0xebe5d6,0xf8f4ea],plasterCream:[0xefe2be,0xe5d8b2],
 brick:[0xa84834,0x9a3e2c,0xb6523c],
 paving:[0xc8c0ac,0xbcb4a0,0xd2cab6],
 mosaic:[0xe8dfd0,0xdcd2c0],mosaicRed:[0x943834,0x88302c],mosaicGold:[0xe2b03c,0xd6a432],
 teak:[0x523422,0x482c1c,0x5e3c28],teakL:[0x744c32,0x68422b],
 cedar:[0x885a3a,0x7c5032,0x946442],
 carvedwood:[0x6c462c,0x603c24,0x784e32],carvedGilt:[0xd6a63a,0xca9a30],
 crimson:[0xb4241c,0xa41e16,0xc22c24],
 ebony:[0x261d1a,0x1e1614,0x2e2420],
 floor:[0x8c6442,0x805a3a,0x986e4a],
 gold:[0xe6bc44,0xdab038,0xf0c650],
 bronze:[0xa87c40,0x9a7036,0xb4884a],
 silver:[0xd8dde2,0xcbd1d8,0xe4e8ec],silverWarm:[0xc8c4bc,0xbcb8b0],
 lodestone:[0x2a2e36,0x22262e,0x343842],
 silkSaffron:[0xeaa828,0xde9c20],silkCrimson:[0xb82428,0xaa1e22],silkIndigo:[0x2c4a82,0x243e72],silkIvory:[0xf5efe0,0xede6d4],
 rope:[0xd2b058,0xc6a44c],
 lotusLeaf:[0x3e8052,0x347246,0x488e5c],lotusPink:[0xe88ca4,0xdc7e96],lotusGold:[0xf2c854],
 water:[0x286e78,0x20606a],flame:[0xffbc58]};
function P(k){return jc(pick(SVPAL[k]),.035);}
