// ================================================================= HOST — the station: THE ILMENITE PILLAR VAULT (station 9, the tube)
// PLAN.md section 7a; map 5.1's tubes (tools/scale-model/model/data/tubes.json): `tube_god_n_12`, "Godthrone North Shield & Talia-Saddle Ilmenite
// Tube" (habitable, 44 m wide, 28 m high, 58 m down), its cavern `cav_god_n_ilmenite` at px 858,1182 (old canvas 586,852): "the Ilmenite Pillar
// Vault", 290 x 175 m, 54 m high, sealed (no skylight), where slow cooling precipitated 30 m hexagonal columns of black ilmenite; its branch the
// West Godstep Rim Cross-Conduit (26 m) leaving north-east to Godstep's vent pit (892.8,1145.2: biomes/godstep/PLAN.md, "the head of the master
// tube", two tube mouths in one pit wall). The surface over it: 12,149 m, 0.35 atm, O, the north shield falling north at ~0.08.
// The page: the shield over the vault (the arrival) and the vault itself under it (KCAVERN, core/terrain 39), lit by the explorers' lamps; the
// tubes drawn 700 m each way, sealed beyond (the deep link on to Pluton is lore: Godstep's plan section 5).
const STN={key:'tube',title:'Krator Godthrone: the Ilmenite Pillar Vault',
 hint:'The Ilmenite Pillar Vault (station 9): a sealed chamber of the Godthrone\'s north shield tube, 58 m under the black plain at 12 km; 290 m long, 54 m high, its floor a forest of black hexagonal ilmenite columns 30 m tall, grown as the lava cooled slowly; the tube runs through it north and south, and the cross-conduit leaves north-east toward Godstep\'s vent pit, 85 km down the mountain. Lit by the explorers\' lamps. N for night (on the shield)',
 centre:[0,0],R:4800,step:10,vent:false,portal:false,summit:false,site:{px:586,py:852},
 items:['boulder','stone'],counts:B=>B.talus>=0&&B.stones>1000,
 rockFace:'rockColumns',minimap:'The Ilmenite Pillar Vault',
 spine:()=>[[0,0],[0,-600],[0,600],[400,-300],[-2000,0],[2000,1500]]};
