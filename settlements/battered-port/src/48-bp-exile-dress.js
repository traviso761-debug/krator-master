// ================================================================= BATTERED PORT — Unpainted Exile Dress & Plinth Adapter [G data]
// Non-destructive Exile Adapter over kits/eternian records ("No Mask Above the Door, No Chalk Upon the Cheek"):
//   1. Scoria & Columnar Basalt Plinths (plinthMat: 'plinth_basalt' in D1, 'plinth_scoria' elsewhere; hydraulic palagonite mortar).
//   2. Zero closed-eyed ancestor door-masks: every door lintel carries 'chiselled_blank' (75%), 'driftwood_board' (20%),
//      or 'open_eyed_figurehead' (5% on syndicate/factor buildings).
//   3. Zero Heirs' gold leaf / gold colossi & zero cyan circuit strips; roofs wear storm-slate or salt-fired olive-celadon.
//   4. Cantilevered ironkneepodocarp driftwood sea-galleries on crater-facing upper rim lots.
// Pure [G data] records & audit: zero THREE, zero DOM, zero Math.random.
const BP_EXILE = (function(){
 const SEED = 0xbe7090;

 function dressRecord(lot){
  const cellSeed = KRAND.hash(SEED, Math.round(lot.x * 4), Math.round(lot.z * 4), lot.lotNum | 0);
  const roll = KRAND.unit(cellSeed);
  const roll2 = KRAND.unit(KRAND.mix32(cellSeed ^ 0x55aa));
  const isSyndicate = lot.district === 'D1' || lot.district === 'D2' || lot.civic;
  const doorMaskMode = isSyndicate && roll > 0.72
   ? 'open_eyed_figurehead'
   : (roll < 0.75 ? 'chiselled_blank' : (roll < 0.95 ? 'driftwood_board' : 'open_eyed_figurehead'));

  return {
   lotId: lot.id,
   district: lot.district,
   plinthMat: lot.district === 'D1' ? 'plinth_basalt' : 'plinth_scoria',
   mortarMat: 'mortar_tuff',
   roofGlaze: (lot.district === 'D1' || lot.district === 'D2' || roll2 > 0.76) ? 'olive_celadon' : 'storm_slate',
   doorMaskMode: doorMaskMode,
   lintelEyes: doorMaskMode === 'open_eyed_figurehead' ? 'open' : 'none',
   seaGallery: !!(lot.rimFacing && lot.h >= 7.0 && !lot.underConstruction),
   forbidGold: true,
   forbidCyanStrip: true,
   unpaintedCitizens: true
  };
 }

 function buildDressTable(lots){
  const byLotId = {};
  const list = [];
  const counts = { chiselled_blank: 0, driftwood_board: 0, open_eyed_figurehead: 0, seaGallery: 0 };
  for (let i = 0; i < lots.length; i++) {
   const r = dressRecord(lots[i]);
   byLotId[r.lotId] = r;
   list.push(r);
   counts[r.doorMaskMode] = (counts[r.doorMaskMode] || 0) + 1;
   if (r.seaGallery) counts.seaGallery++;
  }
  return { byLotId: byLotId, list: list, counts: counts };
 }

 /* Deterministic orthodoxy audit (used in node tests & verify.py --assert 'exile-unmasked'):
    fails if ANY closed-eyed door-mask, gold statue/colossus, cyan host strip, or white-painted NPC face exists! */
 function auditOrthodoxy(state){
  const s = state || {};
  const dressList = s.dressList || [];
  const statuary = s.statuary || [];
  const citizens = s.citizens || [];
  const cyanStrips = s.cyanStrips || 0;
  const faults = [];

  if (dressList.length === 0) {
   faults.push('empty dressList');
  }
  for (let i = 0; i < dressList.length; i++) {
   const d = dressList[i];
   if (d.doorMaskMode !== 'chiselled_blank' && d.doorMaskMode !== 'driftwood_board' && d.doorMaskMode !== 'open_eyed_figurehead') {
    faults.push('lot ' + d.lotId + ' invalid doorMaskMode=' + d.doorMaskMode);
   }
   if (d.lintelEyes === 'closed') {
    faults.push('lot ' + d.lotId + ' carries forbidden closed-eyed ancestor lintel');
   }
   if (!d.forbidGold || !d.forbidCyanStrip) {
    faults.push('lot ' + d.lotId + ' missing gold/cyan suppression');
   }
  }

  for (let j = 0; j < statuary.length; j++) {
   const h = statuary[j];
   if (h.metal === 'gold') {
    faults.push('forbidden Heirs gold statuary on ' + (h.lotId || j));
   }
   if (h.kind === 'mask' && h.eyes === 'closed') {
    faults.push('forbidden closed-eyed household door-mask on ' + (h.lotId || j));
   }
  }

  for (let k = 0; k < citizens.length; k++) {
   const c = citizens[k];
   if (c.whiteFacePaint || c.censorateStripes || c.metallicHeirSkin) {
    faults.push('citizen ' + (c.id || k) + ' wears forbidden Eternal State rank-paint or Heir skin');
   }
  }

  if (cyanStrips > 0) {
   faults.push('forbidden active Ancient cyan circuit strips: ' + cyanStrips);
  }

  return {
   ok: faults.length === 0,
   faults: faults,
   checkedLots: dressList.length,
   checkedStatuary: statuary.length,
   checkedCitizens: citizens.length
  };
 }

 return {
  dressRecord: dressRecord,
  buildDressTable: buildDressTable,
  auditOrthodoxy: auditOrthodoxy
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BP_EXILE;
