/* ==================== core/hamlet 10: what a tree's wood is good for (plain data, [G data]) ==================== */
/* core/hamlet/PLAN.md section 2. Every biome species carries harvest.wood as free text ('timber, pitch', 'fuel, posts',
   'poles (light, ringed)', 'none'). The books count goods, not phrases, so the text is read through one table of uses:
   KHAMLET.woodUse(text) -> {uses: {timber, fuel, poles, thatch, fibre, craft, other}, unknown: [phrases no rule took]}.
   A phrase no rule takes is reported, never dropped: core/hamlet/test-hamlet.js fails on it, so a new species with a new
   word is caught. No three.js, no DOM: this runs in Godot. */
globalThis.KHAMLET = globalThis.KHAMLET || {version: 1};

/* the uses, in the order a village reads them: timber feeds a sawpit, fuel a charcoal kiln, the rest the household */
KHAMLET.WOOD_USES = ['timber', 'fuel', 'poles', 'thatch', 'fibre', 'craft', 'other'];

/* each rule: a use and the words that mean it (matched as whole-word stems, lower case). First match wins per phrase. */
KHAMLET.WOOD_RULES = [
  ['fuel',   ['fuel', 'firewood', 'charcoal', 'torch resin']],
  ['timber', ['timber', 'beam', 'ship knee', 'knees', 'boat rib', 'canoe', 'dugout', 'trunks', 'hollow', 'piles', 'hull']],
  ['poles',  ['pole', 'post', 'fenc', 'fence', 'culm', 'cane', 'withies', 'ribs', 'walls']],
  ['thatch', ['thatch', 'straw', 'frond', 'roofing', 'bark sheet', 'mats', 'matting', 'reed']],
  ['fibre',  ['fibre', 'coir', 'cordage', 'cord', 'rope', 'basketry', 'weaving', 'wrapping']],
  ['craft',  ['carving', 'turnery', 'tool handle', 'furniture', 'chest', 'cogs', 'pipes', 'whetstone', 'cork', 'incense',
              'dye', 'gum', 'pitch', 'resin', 'silicified', 'wood']],
  ['other',  ['shade', 'fodder']]
];

/* A tag reads 'use (note), use (note)': the bracketed words are notes on the use before them ('poles (light,
   ringed)', 'timber (the hardest)'), so the uses come from the text outside the brackets and the notes are only read for
   a tree that must not be felled ('none (too big to fell)', 'none (protected)'). */
KHAMLET.NO_FELL = ['too big to fell', 'too great to fell', 'protected', 'sacred', 'one tree is a grove'];
KHAMLET.woodSplit = function (text) {
  var t = String(text == null ? '' : text).toLowerCase().replace(/\\'/g, "'"), outside = '', notes = [], depth = 0, cur = '';
  for (var i = 0; i < t.length; i++) {
    var c = t[i];
    if (c === '(') { if (depth === 0) cur = ''; else cur += c; depth++; }
    else if (c === ')') { depth = Math.max(0, depth - 1); if (depth === 0) notes.push(cur.trim()); else cur += c; }
    else if (depth > 0) cur += c; else outside += c;
  }
  if (depth > 0 && cur.trim()) notes.push(cur.trim());          /* an unclosed note (a tag cut short) is still a note */
  return {outside: outside, notes: notes};
};
KHAMLET.woodPhrases = function (text) {
  return KHAMLET.woodSplit(text).outside.split(',').map(function (s) { return s.trim(); })
    .filter(function (s) { return s && s !== 'none'; });
};

KHAMLET.woodUse = function (text) {
  var uses = {}, unknown = [], i, k, sp = KHAMLET.woodSplit(text);
  for (i = 0; i < KHAMLET.WOOD_USES.length; i++) uses[KHAMLET.WOOD_USES[i]] = false;
  var ph = KHAMLET.woodPhrases(text);
  for (i = 0; i < ph.length; i++) {
    var p = ph[i], hit = null;
    for (k = 0; k < KHAMLET.WOOD_RULES.length && !hit; k++) {
      var words = KHAMLET.WOOD_RULES[k][1];
      for (var w = 0; w < words.length; w++) if (p.indexOf(words[w]) >= 0) { hit = KHAMLET.WOOD_RULES[k][0]; break; }
    }
    if (hit) uses[hit] = true; else unknown.push(p);
  }
  var noFell = sp.notes.some(function (n) { return KHAMLET.NO_FELL.some(function (w) { return n.indexOf(w) >= 0; }); });
  return {uses: uses, unknown: unknown, noFell: noFell, notes: sp.notes};
};

/* the works a tree feeds: a lumber village fells 'timber' trees for its sawpit, and burns 'fuel' trees in its kiln;
   a tree marked not to fell feeds neither */
KHAMLET.woodWorks = function (text) {
  var r = KHAMLET.woodUse(text), u = r.uses, out = [];
  if (r.noFell) return out;
  if (u.timber) out.push('sawpit');
  if (u.fuel) out.push('kiln');
  return out;
};
