/* ============================== 0b. PALETTE — MUNGO's additions (the life layer's dress) ==============================
   Locus's PAL (05-palette.js) is shared and left alone; what Mungo adds is here. garb: by organisation, the tunic
   colours a person is drawn in (a hashed pick), how likely a hat is and its colours, whether they carry a pack;
   skin: the tones. The reed folk wear the Reed Lake kit's Andean dyes (RAND), the shore folk the abyssal pastels. */
var MPAL = { garb: {
    mungo_reedfolk:{ cols:[0xb03a2e,0xc98a2b,0xe8e0cc,0x2f4a8a,0x8a2a3a,0x3f6a3a], hat:0.35, hatCol:[0xd8c38a,0xb03a2e] },
    mungo_shorefolk:{ cols:[0xd9a6a0,0x9fc8c0,0xe8d6a0,0xb8c8e8,0xf0e6d0,0xc8a0c8], hat:0.25, hatCol:[0xf0e6d0,0x8a7a5a] },
    mungo_traders:{ cols:[0x6a8aa8,0xa86a4a,0xd0b070], hat:0.4, hatCol:[0xe8dcc0] },
    mungo_watch:{ cols:[0x4a3a30], hat:1, hatCol:[0xa83028], pack:0 },
    mungo_headman:{ cols:[0xe8e4dc,0xc8a040], hat:1, hatCol:[0xd8b040] },
    geomancers_mungo:{ cols:[0x6a4a2c], hat:0.6, hatCol:[0x3a2a1e], pack:1 },
    yuni_residents:{ cols:[0x3a6ab0,0xf0ece0,0xe0c860], hat:0.5, hatCol:[0xf0ece0] },
    yuni_caravans:{ cols:[0x3a6ab0,0xe0c860], hat:1, hatCol:[0xf0ece0], pack:0.5 },
    abyss_caravans:{ cols:[0xd9a6a0,0x9fc8c0], hat:1, hatCol:[0xf0e6d0], pack:0.5 },
    iziz_traders:{ cols:[0xd06020,0x803020], hat:1, hatCol:[0xb87333], pack:0.5 },
    monks_mungo:{ cols:[0xf0a020], hat:0, hatCol:[0xf0a020], pack:0.6 },
    nomad_riders:{ cols:[0x2a2420,0x5a3a2a,0x8a6a4a], hat:1, hatCol:[0x1e1a18], pack:0.3 },
    nomad_caravans:{ cols:[0x2a2420,0x5a3a2a], hat:1, hatCol:[0x1e1a18], pack:0.5 } },
  skin:[0x8a5a3a,0x6a4228,0xa8744e,0x5a3a24,0xb88a60] };
