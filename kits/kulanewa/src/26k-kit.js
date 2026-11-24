// ================================================================= THE KIT: identity, library families, faction metadata & palette ([G data])
// The Kulanewa Free-Towns ("Two Crowns, One Ledger", ~125,000 souls across the Arcflow Pak-Ma & Tong-Ma river basin):
//   - Karum Ledger-Syndicates (Downstream & Confluence Ports, style 'karum', 21 buildings, seeds 8101..8121):
//     Old Assyrian Karum joint-stock merchant-bankers (naruqqum capital-sack shares) + Kathmandu Newar brick-and-cedar urban
//     leagues + Sakai Egoshu fireproof kura-vault syndicates; issue 64-sign Amber-Envelope promissory tablets & bark-paper
//     remittance drafts, run extraterritorial clearing-wards in both Ria capitals, and prevent Ria reunification via credit & embargoes.
//   - Kula-Na Covenant-Communes (Upland & Foundry Jinaimachi Towns, style 'ikki', 21 buildings, seeds 8122..8142):
//     Liberated during the Last Dynastic Fallback by smelter-hands, boatmen & commoners rallying to The Uncrowned Bell (Kula-Na);
//     governed by elected Otona lay-elders from wet-moated temple-citadels, running zero-usury Mujinzo mutual-aid granaries,
//     sheltering runaway debtors, working coal/iron/Arch-nickel hydro-forges, and fielding Arcflow's pike/pavise/crossbow militia.
const KIT={id:'kulanewa',title:'Kulanewa Free-Towns Architectural Kit',pack:'kulanewa',culture:'kulanewa',
 faction:'The Kulanewa Free-Towns',band:'Pak-Ma and Tong-Ma',frag:'kits/kulanewa',
 ground:0x8e8a7e,groundProc:0x868276,fog:0xd8dedf,furnDetail:.62};
const KL={DOOR_H:2.3,WALL:.4,SOCLE:.5,RISER:.18,BAY:3.4};
const KL_FACTIONS={
 karum:{
  style:'karum',name:'Karum Ledger-Syndicates',zone:'Downstream and Confluence Ports (Pak-Ma and Tong-Ma)',
  polity:'Joint-stock merchant-banker syndicates (naruqqum share-bags and Egoshu elders)',
  emblem:'Octagonal Cast-Bronze Syndicate Bell and Asymmetric Steelyard Balance',
  institutions:['naruqqum share-ledgers','64-sign Amber-Envelope tablets','extraterritorial Ria clearing-wards','nis alim credit-embargoes']
 },
 ikki:{
  style:'ikki',name:'Kula-Na Covenant-Communes',zone:'Upland Hydro-Forge and Mill Jinaimachi Towns',
  polity:'Elected Otona lay-elder covenant assemblies of The Uncrowned Bell (Kula-Na)',
  emblem:'The Uncrowned Cast-Bronze Covenant Bell and Arch-Nickel Pavise Shield',
  institutions:['zero-usury Mujinzo mutual-aid granaries','debtor sanctuary cloisters','hydro-trip-hammer nickel forges','parish pike-and-crossbow militias']
 }
};
const SV_LIB={
 kura:'kura',sootstone:'sootstone',kilnbrick:'kilnbrick',ashlar:'ashlar',paving:'paving',cobble:'cobble',
 cobalt:'cobalt',celadon:'celadon',terracotta:'terracotta',slate:'slate',shingle:'shingle',
 darkcedar:'darkcedar',cedar:'cedar',carvedwood:'carvedwood',floor:'floor',lacquer:'lacquer',
 nickel:'nickel',paktong:'paktong',iron:'iron',bronze:'bronze',copper:'copper',
 amber:'amber',plaster:'plaster',carve:'carve',alabaster:'alabaster',coal:'coal',
 silk:'silk',brocade:'brocade',flag:'flag',rope:'rope',foliage:'foliage',
 plain:'plain',brass:'brass',bone:'bone',stone:'stone',earth:'earth',sand:'sand'};
const SV_TILE0={
 kura:2.1,sootstone:1.7,kilnbrick:1.45,ashlar:1.8,paving:2.2,cobble:2.0,
 cobalt:1.3,celadon:1.3,terracotta:1.35,slate:1.35,shingle:1.4,
 darkcedar:1.45,cedar:1.5,carvedwood:1.15,floor:1.8,lacquer:1.35,
 nickel:.85,paktong:.8,iron:.85,bronze:.85,copper:1.25,
 amber:1.4,plaster:2.0,carve:1.25,alabaster:1.4,coal:1.3,
 silk:1.1,brocade:1.2,flag:1.0,rope:.28,foliage:.8,
 plain:1.4,brass:.5,bone:.5,stone:2.2,earth:2.8,sand:3.0};
const SV_CLOTH={silk:1,brocade:1,flag:1};
const SV_CUT=Object.assign({
 kura:1,sootstone:1,kilnbrick:1,ashlar:1,cobalt:1,celadon:1,terracotta:1,slate:1,shingle:1,
 darkcedar:1,cedar:1,carvedwood:1,lacquer:1,nickel:1,paktong:1,iron:1,bronze:1,copper:1,
 amber:1,plaster:1,carve:1,alabaster:1,plain:1},SV_CLOTH);
const KIT_FALLBACK=[];
const SVPAL={
 kura:[0xf3f0e8,0xebe7de,0xf7f5ee],kuraWarm:[0xede6d6,0xe4dccb],
 sootstone:[0x2e3136,0x26292e,0x373a40],sootstoneL:[0x464a52,0x3e4249],
 kilnbrick:[0xb25238,0xa44830,0xbf5c42],kilnbrickD:[0x8c3c28,0x7e3422],
 ashlar:[0xc8bfa8,0xbcb39c,0xd2c9b4],
 paving:[0xbeb8a8,0xb2ac9c,0xc8c2b2],
 cobble:[0x8e8a80,0x827e74,0x9a968c],
 cobalt:[0x1d4c8e,0x173f7a,0x26589e],
 celadon:[0x5aa288,0x4e947a,0x66b094],
 terracotta:[0xc25a38,0xb44f2e,0xcf6644],
 slate:[0x464d56,0x3c434c,0x525a64],slateD:[0x323840,0x2b3038],
 shingle:[0x6e523c,0x624834,0x7a5c44],
 darkcedar:[0x422a1c,0x382216,0x4e3222],
 cedar:[0x7e5236,0x72482e,0x8a5c3e],cedarL:[0x966848,0x8a5e40],
 carvedwood:[0x543622,0x4a2e1c,0x603e28],
 floor:[0x886242,0x7c583a,0x946c4a],
 lacquer:[0xa82820,0x98221a,0xb63028],
 nickel:[0xdce2e8,0xd0d7de,0xe6ecf0],
 paktong:[0xc8c6be,0xbcbab2,0xd4d2ca],
 iron:[0x34383e,0x2c3036,0x3e4248],
 bronze:[0x9e743c,0x906834,0xac8044],bronzeD:[0x78562c,0x6c4c26],
 copper:[0x4c8a76,0x407c68,0x589682],copperWarm:[0xb46a42,0xa65e38],
 amber:[0xd89a32,0xcc8e2a,0xe4a63c],
 plaster:[0xe8e2d4,0xded8ca,0xf0eadc],
 carve:[0xdad0bc,0xd0c6b2,0xe4dac6],
 alabaster:[0xf5f2ea,0xede9e0,0xf9f7f2],
 coal:[0x222428,0x1b1d20,0x2a2d32],
 silkSaffron:[0xe6a628,0xda9a20],silkIndigo:[0x28467e,0x203a6c],silkCrimson:[0xb22826,0xa4201e],silkIvory:[0xf2ecdc,0xe8e1d0],
 silk:[0xe6a628,0xda9a20],brocade:[0x28467e,0x203a6c],flag:[0xe6a628,0xda9a20],
 rope:[0xc8a856,0xbca04c],
 foliage:[0x3e784a,0x346a40,0x488454],
 bone:[0xebe3d0,0xe0d8c4],plain:[0xd4ccb8,0xc8c0ac],brass:[0xa67c3e,0x987034],
 stone:[0x7e7a72,0x726e66],earth:[0x6e5842,0x624e3a],sand:[0xc8ba98,0xbcae8c],
 water:[0x2a6872,0x225a64],flame:[0xffbc58]};
function P(k){return jc(pick(SVPAL[k]),.035);}
