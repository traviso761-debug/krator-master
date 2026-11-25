/* ================================================================= MIRABILIS: settlement identity & multi-kit SV_LIB aliases ([G data])
   Extends kits/hayrant/src/26k-kit.js (read in place) so all 48 hy_* Hayrant defs, all 38 et_* Eternian suzerain defs,
   and all 15 node-* resource nodes share one PBR library pack ('hayrant') with zero missing material or palette keys. */
KIT.id = 'mirabilis';
KIT.title = 'Mirabilis (Mirapiris / Sutar-Kotan)';
KIT.pack = 'hayrant';
KIT.culture = 'hayrant';
KIT.frag = 'settlements/mirabilis';
KIT.fog = 0xd6cab8;
KIT.ground = 0xb59c72;
KIT.groundProc = 0xaa9168;

Object.assign(SV_LIB, {
  blockD: 'ashlar',
  blockE: 'ashlar',
  wood: 'larch',
  peat: 'earth',
  bog: 'earth',
  qsand: 'loess',
  druze: 'nephrite',
  tepui: 'basalt'
});
Object.assign(SV_TILE0, {
  blockD: 2.2,
  blockE: 2.4,
  wood: 1.8,
  peat: 2.0,
  bog: 2.0,
  qsand: 2.4,
  druze: 0.6,
  tepui: 2.6
});
if (!SVPAL.wood) SVPAL.wood = SVPAL.larch.slice();
if (!SVPAL.woodD) SVPAL.woodD = SVPAL.larchD.slice();
