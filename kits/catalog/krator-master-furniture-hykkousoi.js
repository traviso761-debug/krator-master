/* ======================================================================
   Hykkousoi furniture: PALETTE ONLY. The culture is in progress and its
   sets are not built yet (owner's call, 2026-10). The palette is here so
   the first pieces can be written in the catalog's shape when the time
   comes: nacre and mother-of-pearl throughout, pale sea-linen and slate
   blue from the Hykkousoi pack (core/sockets/80-cultures.js: linen
   #e4eff0, slate #3f6a82, gold wave-sun #d8a640), olive wood, bronze.
   Influences: Greek, Polynesian, organic. To build: define HYK_COMMON /
   HYK_COURT style sheets (accent 'nacre', accentFam 'nacre', motif 'wave',
   tapestry 'waves' or 'sun', statue 'figure') and call FK.set() twice.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('hykkousoi', { name: 'Hykkousoi', pack: 'hykkousoi', influences: 'Greek; Polynesian; organic',
  materials: 'nacre and mother-of-pearl, olive wood, sea-linen, bronze, white marble', inProgress: true,
  palette: {
    nacre: 0xe8e4ec, nacreRose: 0xe8d8dc, nacreSea: 0xd0e0e4, timberOlive: 0x9a8a5a, timberOliveDark: 0x6a5e3a, timberOliveLight: 0xb8a878,
    clothLinen: 0xe4eff0, clothSlate: 0x3f6a82, clothSlateDeep: 0x2c5a74, clothGoldSun: 0xd8a640, clothSeaGreen: 0x4a9a8a,
    bronze: 0x8a6a3a, gold: 0xd8a640, marbleWhite: 0xeae6de, stoneSea: 0x6a8a90, clayWhite: 0xe0dcd0, ropeFlax: 0xc8b888,
    flame: 0xffc861, ember: 0xd9762c
  } });
/* END PALETTE */
