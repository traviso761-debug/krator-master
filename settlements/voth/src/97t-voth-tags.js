/* ============================== 97t. CORE TAGS: VOTH'S PLACED ==============================
   Voth's claimed footprints (PLACED, 60-land.js) and the inspector's canton-top footprints
   (window._inspectFP, 86-inspect.js) as core/tags records (core/tags/README.md, step 4 of
   core/tags/PROPOSAL.md's order of adoption). Built after every fragment has placed and before the first
   frame (98-start.js), not as claim() runs: gridRemove() takes records back out, and only what stays is
   registered. PLACED stays Voth's live collision grid; core/tags only reads it.
   VOTH_TAG_CLASS turns a claim tag into a class, a kind and building types (claim tags are Voth's own
   words: compound, rshed, exotic...). What a record knows beyond its tag is kept:
     town      the true footprint (fx0, fz0, not the claim's padded one), its base (yb), height, its
               style (hlaalu, velothi, domed, hovel) and poor (wealth poor, else middle)
     the rest  the claimed footprint, padding included; the ground's height under its centre
   Canton-top records carry no height of their own: they stand at the ground's height under them, which is
   wrong for a deck 40 m up (inspectClaim takes no y; a refurbishing item). */
var VOTH_TAG_CLASS = {
  town:['building','house',['dwelling-single']], 'velothi-out':['building','house',['dwelling-single']],
  compound:['building','compound',['dwelling-multi']], cantonBuilding:['building','canton-building',['dwelling-multi']],
  farm:['building','farmstead',['farm','dwelling-single']], shed:['building','shed',['farm']], barn:['building','barn',['farm']],
  warehouse:['building','warehouse',['industry']], industry:['building','industrial-site',['industry']],
  rshed:['building','river-shed',['infrastructure']], fixed:['building','structure',['infrastructure']],
  lighthouse:['building','lighthouse',['infrastructure']], customs:['building','customs-house',['civic']],
  tower:['building','watchtower',['military']], keep:['building','keep',['military']],
  gate:['building','gate',['military','infrastructure']], palaceGate:['building','palace-gate',['civic','military']],
  shrine:['building','shrine',['religious']], temple:['building','funerary-temple',['religious','funerary']],
  tomb:['building','family-tomb',['funerary']], shop:['building','shop',['shop']], tavern:['building','tavern',['tavern']],
  manor:['building','manor',['dwelling-single']], guildhall:['building','guild-hall',['civic']],
  cantonHall:['building','great-hall',['civic']], palaceAtrium:['building','palace-atrium',['civic']],
  houseOfHealing:['building','house-of-healing',['civic']], arena:['building','arena',['civic']],
  arenafloor:['part','arena-floor'], arenapit:['part','arena-pit'], arenavip:['part','arena-box'],
  field:['feature','field',['farm']], grave:['feature','grave',['funerary']], palaceGarden:['feature','garden',['park']],
  fishdock:['infrastructure','fish-dock'], rdock:['infrastructure','river-dock'], dock:['infrastructure','dock'],
  cantonStair:['infrastructure','stair'], cantonDoor:['infrastructure','door'],
  stall:['prop','stall',['market']], prop:['prop','roadside-structure'], monument:['landmark','monument',['statue']],
  exotic:['flora','ornamental-tree']
};
(function(){
  var T = KTAGS.page = KTAGS.create({ build:'voth' });
  function add(o, label, frag){
    var m = VOTH_TAG_CLASS[o.tag] || ['feature', o.tag], t = { culture:'voth' };
    if(m[2]) t.types = m[2].slice();
    var fx = o.fx0 != null ? o.fx0 : o.fx, fz = o.fz0 != null ? o.fz0 : o.fz, h = o.h != null ? o.h : null;
    if(o.tag === 'town'){ t.style = o.kind; t.wealth = o.poor ? 'poor' : 'middle'; }
    T.add({ 'class':m[0], kind:m[1], key:o.tag, name:label || TAG_LABEL[o.tag] || null,
      at:[o.x, o.yb != null ? o.yb : terrainH(o.x, o.z), o.z], ry:o.ry || 0,
      size:h != null ? [fx*2, fz*2, h] : [fx*2, fz*2], tags:t, frag:frag });
  }
  PLACED.forEach(function(o){ add(o, null, '97t-voth-tags (PLACED)'); });
  (window._inspectFP || []).forEach(function(o){ add(o, o.label, '97t-voth-tags (_inspectFP)'); });
})();
