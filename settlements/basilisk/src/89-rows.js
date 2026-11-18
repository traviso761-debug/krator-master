/* ==================== Basilisk 89: overrides the Lizardmen kit sheet's showcase rows ([G data]) ==================== */
/* On Basilisk's settlement page FAMILIES is empty so 90-scene.js lays no showcase rows; SITES is populated from BS_SITE
   in 90-bs-world.js before 92-world.js calls buildWorld(). */
KIT.id = 'basilisk';
KIT.title = 'Basilisk — the Lizardmen\'s stone capital';
KIT.band = 'Basilisk at the eastern terminal sea';
KIT.frag = 'settlements/basilisk';
KIT.furnDetail = 0.45;
const TITLE = KIT.title;
const FAMILIES = [];
